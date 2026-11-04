#!/usr/bin/env python3
"""Biến video quay thực tế căn hộ thành ảnh toàn cảnh cho từng phòng của tour.

Quy trình (chi tiết trong README.md):

  1. Xem nhanh video để tìm đoạn quay từng phòng:
       python3 tools/video_tool.py contact VIDEO --every 2
     -> build/khung-hinh/sheet-01.jpg ... (lưới ảnh nhỏ, mỗi ô ghi mốc thời gian)

  2. Ghép ảnh toàn cảnh cho một phòng từ đoạn quay xoay người tại chỗ:
       python3 tools/video_tool.py stitch VIDEO --room pn-master --start 83 --end 97
     -> images/rooms/pn-master.jpg + images/rooms/pn-master.json (góc ngang/dọc ước lượng)

  3. (Tuỳ chọn) nén video để nhúng vào tour, có nút "tua tới phòng":
       python3 tools/video_tool.py compress VIDEO
     -> media/video-thuc-te.mp4; điền "src": "media/video-thuc-te.mp4" trong tour.config.json

  4. Chạy lại python3 tools/build.py. Phòng có ảnh ghép sẽ tự chuyển sang chế độ ảnh 360°.

Cần ffmpeg/ffprobe và opencv-python-headless (pip install opencv-python-headless).
"""
import argparse
import json
import math
import shutil
import subprocess
import sys
import tempfile
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFont

ROOT = Path(__file__).resolve().parent.parent
MAX_PANO_WIDTH = 4096  # giới hạn kích thước texture an toàn cho điện thoại


def run(cmd):
    res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE, text=True)
    if res.returncode != 0:
        sys.exit("Lỗi khi chạy: " + " ".join(cmd) + "\n" + res.stderr[-2000:])
    return res.stdout


def duration(video):
    out = run(["ffprobe", "-v", "error", "-show_entries", "format=duration", "-of", "csv=p=0", str(video)])
    return float(out.strip())


def fmt(t):
    return f"{int(t // 60)}:{t % 60:04.1f}"


def extract(video, folder, every, start=None, end=None, height=None):
    """Trích khung hình mỗi `every` giây vào folder; trả về [(thời điểm, đường dẫn)]."""
    folder.mkdir(parents=True, exist_ok=True)
    cmd = ["ffmpeg", "-v", "error", "-y"]
    if start is not None:
        cmd += ["-ss", str(start)]
    if end is not None:
        cmd += ["-to", str(end)]
    vf = f"fps=1/{every}" if every >= 1 else f"fps={1 / every:.4f}"
    if height:
        vf += f",scale=-2:'min({height},ih)'"
    cmd += ["-i", str(video), "-vf", vf, "-q:v", "2", str(folder / "f_%05d.jpg")]
    run(cmd)
    t0 = start or 0.0
    files = sorted(folder.glob("f_*.jpg"))
    # bộ lọc fps lấy khung ở giữa mỗi khoảng
    return [(t0 + (i + 0.5) * every, f) for i, f in enumerate(files)]


def cmd_contact(a):
    out = Path(a.out)
    total = duration(a.video)
    with tempfile.TemporaryDirectory() as tmp:
        frames = extract(a.video, Path(tmp), a.every, height=360)
        if not frames:
            sys.exit("Không trích được khung hình nào.")
        cols, rows = a.cols, a.rows
        th_w = 300
        first = Image.open(frames[0][1])
        th_h = round(th_w * first.height / first.width)
        try:
            font = ImageFont.truetype("DejaVuSans-Bold.ttf", 18)
        except OSError:
            font = ImageFont.load_default()
        out.mkdir(parents=True, exist_ok=True)
        per = cols * rows
        sheets = []
        for k in range(0, len(frames), per):
            chunk = frames[k:k + per]
            sheet = Image.new("RGB", (cols * (th_w + 6) + 6, math.ceil(len(chunk) / cols) * (th_h + 6) + 6), (20, 24, 30))
            dr = ImageDraw.Draw(sheet)
            for i, (t, f) in enumerate(chunk):
                x, y = 6 + (i % cols) * (th_w + 6), 6 + (i // cols) * (th_h + 6)
                sheet.paste(Image.open(f).convert("RGB").resize((th_w, th_h)), (x, y))
                label = fmt(t)
                dr.rectangle((x, y, x + 74, y + 24), fill=(0, 0, 0))
                dr.text((x + 5, y + 2), label, fill=(255, 200, 80), font=font)
            path = out / f"sheet-{len(sheets) + 1:02d}.jpg"
            sheet.save(path, quality=85)
            sheets.append(path)
    print(f"Video dài {fmt(total)}; {len(frames)} khung (mỗi {a.every}s) -> {len(sheets)} trang:")
    for p in sheets:
        print("  ", p)


def sharpness(img):
    import cv2
    g = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
    return cv2.Laplacian(g, cv2.CV_64F).var()


def inner_rect(mask):
    """Hình chữ nhật lớn nhất (gần đúng) nằm trọn trong vùng có ảnh."""
    ys, xs = np.nonzero(mask)
    x0, x1, y0, y1 = xs.min(), xs.max(), ys.min(), ys.max()
    while x1 - x0 > 10 and y1 - y0 > 10:
        sub = mask[y0:y1 + 1, x0:x1 + 1]
        bad = {"t": 1 - sub[0].mean(), "b": 1 - sub[-1].mean(), "l": 1 - sub[:, 0].mean(), "r": 1 - sub[:, -1].mean()}
        side, worst = max(bad.items(), key=lambda kv: kv[1])
        if worst <= 0.002:
            break
        if side == "t":
            y0 += 1
        elif side == "b":
            y1 -= 1
        elif side == "l":
            x0 += 1
        else:
            x1 -= 1
    return int(x0), int(y0), int(x1) + 1, int(y1) + 1


def cmd_stitch(a):
    try:
        import cv2
    except ImportError:
        sys.exit("Cần OpenCV: pip install opencv-python-headless")
    rooms = {s["id"]: s for s in json.loads((ROOT / "tour.config.json").read_text(encoding="utf-8"))["scenes"] if s.get("room")}
    if a.room not in rooms:
        sys.exit(f"Không có phòng '{a.room}'. Các phòng: {', '.join(rooms)}")
    with tempfile.TemporaryDirectory() as tmp:
        frames = extract(a.video, Path(tmp), a.step, a.start, a.end, height=a.height)
        imgs = [(t, cv2.imread(str(f))) for t, f in frames]
    if len(imgs) < 2:
        sys.exit("Đoạn quá ngắn, cần ít nhất 2 khung hình.")
    sharp = [sharpness(im) for _, im in imgs]
    med = float(np.median(sharp))
    kept = [(t, im) for (t, im), s in zip(imgs, sharp) if s >= a.min_sharp * med]
    if len(kept) > a.max_frames:
        idx = np.linspace(0, len(kept) - 1, a.max_frames).round().astype(int)
        kept = [kept[i] for i in sorted(set(idx))]
    print(f"{len(imgs)} khung trong {fmt(a.start)}–{fmt(a.end)}, giữ {len(kept)} khung nét để ghép…")

    st = cv2.Stitcher_create(cv2.Stitcher_PANORAMA)
    st.setPanoConfidenceThresh(a.confidence)
    status, pano = st.stitch([im for _, im in kept])
    if status != cv2.Stitcher_OK:
        reasons = {1: "cần thêm ảnh hoặc các khung chồng lấn quá ít (giảm --step)",
                   2: "không khớp được các khung (đoạn có người/đồ vật di chuyển, hoặc rung/nhoè)",
                   3: "không tinh chỉnh được thông số camera (thử đoạn khác hoặc giảm --confidence)"}
        sys.exit(f"Ghép thất bại (mã {status}): {reasons.get(status, 'không rõ')}.")

    focal = float(np.median([c.focal for c in st.cameras()]))
    # Stitcher dựng ảnh ở độ phân giải gốc, tiêu cự trả về ở độ phân giải đăng ký (registration)
    focal_full = focal / st.workScale()
    mask = cv2.cvtColor(pano, cv2.COLOR_BGR2GRAY) > 0
    mask = cv2.erode(mask.astype(np.uint8), np.ones((5, 5), np.uint8)) > 0
    x0, y0, x1, y1 = inner_rect(mask)
    crop = pano[y0:y1, x0:x1]
    haov = math.degrees(crop.shape[1] / focal_full)
    vaov = math.degrees(crop.shape[0] / focal_full)
    if a.haov:
        vaov *= a.haov / haov
        haov = a.haov
    if haov > 360:
        print(f"Cảnh báo: góc ngang ước lượng {haov:.0f}° > 360°, cắt về 360°.")
        crop = crop[:, :round(crop.shape[1] * 360 / haov)]
        vaov *= 1
        haov = 360.0
    img = Image.fromarray(cv2.cvtColor(crop, cv2.COLOR_BGR2RGB))
    if img.width > MAX_PANO_WIDTH:
        img = img.resize((MAX_PANO_WIDTH, round(img.height * MAX_PANO_WIDTH / img.width)), Image.LANCZOS)
    out_dir = ROOT / "images" / "rooms"
    out_dir.mkdir(parents=True, exist_ok=True)
    img.save(out_dir / f"{a.room}.jpg", quality=88, optimize=True, progressive=True)
    meta = {
        "file": f"images/rooms/{a.room}.jpg", "haov": round(haov, 2), "vaov": round(vaov, 2),
        "vOffset": a.voffset, "northOffset": a.north, "startYaw": a.start_yaw,
        "source": {"video": Path(a.video).name, "start": a.start, "end": a.end, "frames": len(kept)},
    }
    (out_dir / f"{a.room}.json").write_text(json.dumps(meta, ensure_ascii=False, indent=2), encoding="utf-8")
    print(f"Đã ghép {rooms[a.room]['title']}: {img.width}×{img.height}px, ngang {haov:.0f}°, dọc {vaov:.0f}°")
    print(f"  -> images/rooms/{a.room}.jpg; chạy lại: python3 tools/build.py")


def cmd_compress(a):
    out = ROOT / a.out
    out.parent.mkdir(parents=True, exist_ok=True)
    run(["ffmpeg", "-v", "error", "-y", "-i", str(a.video), "-vf", f"scale=-2:'min({a.height},ih)'",
         "-c:v", "libx264", "-preset", "slow", "-crf", str(a.crf), "-pix_fmt", "yuv420p",
         "-c:a", "aac", "-b:a", "96k", "-movflags", "+faststart", str(out)])
    mb = out.stat().st_size / 1e6
    print(f"{out.relative_to(ROOT)}: {mb:.1f} MB. Điền \"src\": \"{out.relative_to(ROOT)}\" vào mục video của tour.config.json.")
    if mb > 95:
        print("Lưu ý: GitHub từ chối tệp trên 100 MB; tăng --crf hoặc giảm --height.")


def main():
    if not shutil.which("ffmpeg"):
        sys.exit("Cần cài ffmpeg.")
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    sub = ap.add_subparsers(dest="cmd", required=True)

    c = sub.add_parser("contact", help="lưới khung hình có mốc thời gian để tìm đoạn quay từng phòng")
    c.add_argument("video")
    c.add_argument("--every", type=float, default=2.0, help="giây giữa hai khung (mặc định 2)")
    c.add_argument("--cols", type=int, default=6)
    c.add_argument("--rows", type=int, default=6)
    c.add_argument("--out", default=str(ROOT / "build" / "khung-hinh"))
    c.set_defaults(func=cmd_contact)

    s = sub.add_parser("stitch", help="ghép ảnh toàn cảnh một phòng từ một đoạn video")
    s.add_argument("video")
    s.add_argument("--room", required=True, help="id phòng trong tour.config.json, ví dụ pn-master")
    s.add_argument("--start", type=float, required=True, help="giây bắt đầu đoạn xoay quanh phòng")
    s.add_argument("--end", type=float, required=True, help="giây kết thúc")
    s.add_argument("--step", type=float, default=0.5, help="giây giữa hai khung lấy để ghép (mặc định 0,5)")
    s.add_argument("--height", type=int, default=1080, help="chiều cao khung khi trích (mặc định 1080)")
    s.add_argument("--max-frames", type=int, default=40)
    s.add_argument("--min-sharp", type=float, default=0.5, help="bỏ khung nhoè hơn tỉ lệ này so với trung vị")
    s.add_argument("--confidence", type=float, default=0.8, help="ngưỡng tin cậy ghép của OpenCV")
    s.add_argument("--haov", type=float, help="ghi đè góc ngang (độ), ví dụ 360 nếu đã quay đủ vòng")
    s.add_argument("--voffset", type=float, default=0.0, help="độ lệch đường chân trời (độ)")
    s.add_argument("--north", type=float, default=0.0, help="yaw của ảnh ứng với hướng lên trên mặt bằng")
    s.add_argument("--start-yaw", type=float, default=0.0, help="hướng nhìn ban đầu khi vào phòng")
    s.set_defaults(func=cmd_stitch)

    z = sub.add_parser("compress", help="nén video để nhúng vào tour")
    z.add_argument("video")
    z.add_argument("--out", default="media/video-thuc-te.mp4")
    z.add_argument("--height", type=int, default=720)
    z.add_argument("--crf", type=int, default=28)
    z.set_defaults(func=cmd_compress)

    a = ap.parse_args()
    a.func(a)


if __name__ == "__main__":
    main()
