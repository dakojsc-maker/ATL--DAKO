#!/usr/bin/env python3
"""Dựng ảnh và data.js cho tour 360° từ tour.config.json.

    python3 tools/build.py            # tạo images/*.jpg, images/thumbs/*, data.js
    python3 tools/build.py --debug D  # thêm ảnh kiểm tra vị trí điểm nóng vào thư mục D

Toạ độ trong cấu hình là pixel trên ảnh gốc (source/). Ảnh phẳng (bản đồ, phối
cảnh, mặt bằng) được coi như một tấm ảnh đặt trước mắt, chiếm góc ngang `haov`, rồi
nắn sang hệ toạ độ cầu (equirectangular) để khi xem từ tâm trong trình xem 360° ảnh
vẫn phẳng, không cong mép. Phòng nào đã có ảnh 360° ghép từ video
(images/rooms/<id>.json do tools/video_tool.py tạo) thì dùng ảnh đó thay cho góc nhìn
trên mặt bằng.
"""
import argparse
import json
import math
from pathlib import Path

import numpy as np
from PIL import Image, ImageDraw, ImageFilter, ImageOps

ROOT = Path(__file__).resolve().parent.parent
IMAGES = ROOT / "images"
THUMB_SIZE = (320, 200)
ROOM_PAD = 150  # px ảnh gốc: vùng được phép kéo ra ngoài phòng


def r2(v):
    return round(v, 3)


def draw_overlays(im, overlays, ss=4):
    """Tô các dải đánh dấu (ví dụ tầng 11) lên ảnh nguồn, khử răng cưa bằng siêu lấy mẫu."""
    layer = Image.new("RGBA", (im.width * ss, im.height * ss), (0, 0, 0, 0))
    dr = ImageDraw.Draw(layer)
    for ov in overlays:
        pts = [(x * ss, y * ss) for x, y in ov["poly"]]
        dr.polygon(pts, fill=tuple(ov.get("fill", [242, 160, 58, 120])))
        dr.line(pts + [pts[0]], fill=tuple(ov.get("outline", [242, 160, 58, 255])), width=ss * 1)
    layer = layer.resize(im.size, Image.LANCZOS)
    return Image.alpha_composite(im.convert("RGBA"), layer).convert("RGB")


class Flat:
    """Ảnh phẳng đặt trên mặt phẳng z=1 trước mắt người xem.

    Pixel (X, Y) của ảnh đã cắt/phóng ứng với điểm (u, v, 1) với
    u = (X/W - 0.5)*2*tx, v = (0.5 - Y/H)*2*ty; tx = tan(haov/2), ty = tx*H/W.
    Ảnh xuất ra là equirectangular: cột = yaw, hàng = pitch (tuyến tính).
    """

    def __init__(self, key, spec):
        src = Image.open(ROOT / spec["src"]).convert("RGB")
        if spec.get("overlays"):
            src = draw_overlays(src, spec["overlays"])
        self.crop = spec.get("crop") or [0, 0, src.width, src.height]
        self.scale = spec.get("scale", 1)
        im = src.crop(tuple(self.crop))
        if self.scale != 1:
            im = im.resize((round(im.width * self.scale), round(im.height * self.scale)), Image.LANCZOS)
        if spec.get("sharpen"):
            im = im.filter(ImageFilter.UnsharpMask(radius=2, percent=60, threshold=2))
        self.key = key
        self.im = im                       # ảnh phẳng (dùng cho thumbnail)
        self.W, self.H = im.size
        self.fill = tuple(spec.get("fill", [11, 19, 27]))
        self.tx = math.tan(math.radians(float(spec["haov"]) / 2))
        self.ty = self.tx * self.H / self.W
        self.half_yaw = math.atan(self.tx)
        self.half_pitch = math.atan(self.ty)      # mép trên/dưới ở cột giữa
        self.haov = math.degrees(2 * self.half_yaw)
        self.vaov = math.degrees(2 * self.half_pitch)
        self.file = f"images/{key}.jpg"

    def warp(self):
        """Nắn ảnh phẳng sang equirectangular (lấy mẫu song tuyến)."""
        wo = self.W
        ho = round(wo * self.vaov / self.haov)
        yaw = (np.arange(wo) + 0.5) / wo * 2 * self.half_yaw - self.half_yaw
        pitch = self.half_pitch - (np.arange(ho) + 0.5) / ho * 2 * self.half_pitch
        yy, pp = np.meshgrid(yaw, pitch)
        u = np.tan(yy)
        v = np.tan(pp) * np.sqrt(1 + u * u)
        X = (u / (2 * self.tx) + 0.5) * self.W - 0.5
        Y = (0.5 - v / (2 * self.ty)) * self.H - 0.5
        src = np.asarray(self.im, dtype=np.float32)
        x0 = np.floor(X).astype(int)
        y0 = np.floor(Y).astype(int)
        fx = (X - x0)[..., None]
        fy = (Y - y0)[..., None]
        inside = (X >= -0.5) & (X <= self.W - 0.5) & (Y >= -0.5) & (Y <= self.H - 0.5)
        x0c, x1c = np.clip(x0, 0, self.W - 1), np.clip(x0 + 1, 0, self.W - 1)
        y0c, y1c = np.clip(y0, 0, self.H - 1), np.clip(y0 + 1, 0, self.H - 1)
        out = (src[y0c, x0c] * (1 - fx) * (1 - fy) + src[y0c, x1c] * fx * (1 - fy) +
               src[y1c, x0c] * (1 - fx) * fy + src[y1c, x1c] * fx * fy)
        out[~inside] = self.fill
        return Image.fromarray(np.clip(out + 0.5, 0, 255).astype(np.uint8))

    def save(self):
        self.warp().save(ROOT / self.file, quality=88, optimize=True, progressive=True)

    def px(self, x, y):
        return (x - self.crop[0]) * self.scale, (y - self.crop[1]) * self.scale

    def uv(self, x, y):
        X, Y = self.px(x, y)
        return (X / self.W - 0.5) * 2 * self.tx, (0.5 - Y / self.H) * 2 * self.ty

    def yaw(self, x, y=None):
        u, _ = self.uv(x, 0)
        return math.degrees(math.atan(u))

    def pitch(self, y, x=None):
        if x is None:
            x = self.crop[0] + self.W / self.scale / 2
        u, v = self.uv(x, y)
        return math.degrees(math.atan2(v, math.sqrt(1 + u * u)))

    def span(self, x0, x1):
        """Góc ngang (độ) của đoạn [x0, x1] nhìn từ tâm."""
        return self.yaw(x1) - self.yaw(x0)

    def pitch_range(self, box):
        x0, y0, x1, y1 = box
        xs = [x0 + (x1 - x0) * i / 8 for i in range(9)]
        return min(self.pitch(y1, x) for x in xs), max(self.pitch(y0, x) for x in xs)

    def meta(self):
        return {"file": self.file, "W": self.W, "H": self.H, "crop": self.crop, "scale": self.scale,
                "tx": round(self.tx, 6), "ty": round(self.ty, 6), "haov": r2(self.haov), "vaov": r2(self.vaov)}

    def thumb(self, box, out):
        x0, y0 = self.px(box[0], box[1])
        x1, y1 = self.px(box[2], box[3])
        # mở rộng vùng cắt theo tỉ lệ khung thumbnail để không bị méo
        cx, cy, w, h = (x0 + x1) / 2, (y0 + y1) / 2, x1 - x0, y1 - y0
        ratio = THUMB_SIZE[0] / THUMB_SIZE[1]
        if w / h < ratio:
            w = h * ratio
        else:
            h = w / ratio
        x0, x1 = max(0, cx - w / 2), min(self.W, cx + w / 2)
        y0, y1 = max(0, cy - h / 2), min(self.H, cy + h / 2)
        part = self.im.crop((round(x0), round(y0), round(x1), round(y1)))
        ImageOps.fit(part, THUMB_SIZE, Image.LANCZOS).save(out, quality=82, optimize=True)


def flat_scene(scene, img):
    """Cấu hình Pannellum cho cảnh dùng ảnh phẳng."""
    cfg = {"type": "equirectangular", "panorama": img.file, "haov": r2(img.haov),
           "vaov": r2(img.vaov), "vOffset": 0, "avoidShowingBackground": True}
    if scene.get("room"):
        # Ảnh mặt bằng gốc độ phân giải thấp: không phóng sát vào phòng mà giữ ngữ cảnh
        # xung quanh (trình xem làm tối phần ngoài phòng), cho phép kéo/phóng thêm một chút.
        x0, y0, x1, y1 = scene["box"]
        fx, fy = scene.get("focus") or ((x0 + x1) / 2, (y0 + y1) / 2)
        w = img.span(x0, x1)
        hfov = min(max(w * 2.1, 26.0), 44.0)
        pad = ROOM_PAD
        cx0, cy0 = img.crop[0], img.crop[1]
        cx1, cy1 = img.crop[0] + img.W / img.scale, img.crop[1] + img.H / img.scale
        bx = [max(cx0, x0 - pad), max(cy0, y0 - pad), min(cx1, x1 + pad), min(cy1, y1 + pad)]
        lo, hi = img.pitch_range(bx)
        cfg.update(minYaw=r2(img.yaw(bx[0])), maxYaw=r2(img.yaw(bx[2])), minPitch=r2(lo), maxPitch=r2(hi),
                   yaw=r2(img.yaw(fx)), pitch=r2(img.pitch(fy, fx)),
                   hfov=r2(hfov), maxHfov=r2(min(hfov * 1.5, img.haov)), minHfov=r2(max(w * 0.6, 6.0)))
        view_box = scene["box"]
    else:
        st = scene["start"]
        hfov = min(img.span(st["x"] - st["w"] / 2, st["x"] + st["w"] / 2), img.haov)
        mw = scene.get("minW", 200)
        cfg.update(minYaw=r2(-img.haov / 2), maxYaw=r2(img.haov / 2),
                   minPitch=r2(-img.vaov / 2), maxPitch=r2(img.vaov / 2),
                   yaw=r2(img.yaw(st["x"])), pitch=r2(img.pitch(st["y"], st["x"])),
                   hfov=r2(hfov), maxHfov=r2(img.haov),
                   minHfov=r2(img.span(st["x"] - mw / 2, st["x"] + mw / 2)))
        hh = st["w"] * 0.625 / 2
        view_box = [st["x"] - st["w"] / 2, st["y"] - hh, st["x"] + st["w"] / 2, st["y"] + hh]
    return cfg, view_box


def pano_scene(meta):
    """Cấu hình Pannellum cho phòng đã có ảnh 360° thật (ghép từ video)."""
    haov, vaov = float(meta["haov"]), float(meta["vaov"])
    cfg = {"type": "equirectangular", "panorama": meta["file"], "haov": r2(haov), "vaov": r2(vaov),
           "vOffset": meta.get("vOffset", 0), "northOffset": meta.get("northOffset", 0),
           "yaw": meta.get("startYaw", 0), "pitch": 0, "hfov": min(100, haov),
           "maxHfov": min(110, haov), "minHfov": 35, "avoidShowingBackground": True,
           "minPitch": r2(meta.get("vOffset", 0) - vaov / 2), "maxPitch": r2(meta.get("vOffset", 0) + vaov / 2)}
    if haov < 359:
        cfg.update(minYaw=r2(-haov / 2), maxYaw=r2(haov / 2))
    return cfg


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--debug", help="thư mục ghi ảnh kiểm tra vị trí điểm nóng")
    args = ap.parse_args()

    conf = json.loads((ROOT / "tour.config.json").read_text(encoding="utf-8"))
    (IMAGES / "thumbs").mkdir(parents=True, exist_ok=True)

    flats = {}
    for key, spec in conf["images"].items():
        flats[key] = Flat(key, spec)
        flats[key].save()

    # Bản đồ nhỏ (minimap) và sơ đồ vị trí căn trên tầng
    mm = conf["minimap"]
    src = Image.open(ROOT / conf["images"][mm["image"]]["src"]).convert("RGB")
    mim = src.crop(tuple(mm["crop"]))
    mim = mim.resize((round(mim.width * mm["scale"]), round(mim.height * mm["scale"])), Image.LANCZOS)
    mim.save(IMAGES / "minimap.jpg", quality=85, optimize=True)
    kp = conf["keyPlan"]
    kim = Image.open(ROOT / kp["src"]).convert("RGB").crop(tuple(kp["crop"]))
    kim = kim.resize((round(kim.width * kp["scale"]), round(kim.height * kp["scale"])), Image.LANCZOS)
    kim.save(IMAGES / "so-do-tang.jpg", quality=88, optimize=True)

    mx0, my0, mx1, my1 = mm["crop"]

    def mm_pct(x, y):
        return [r2((x - mx0) / (mx1 - mx0) * 100), r2((y - my0) / (my1 - my0) * 100)]

    titles = {s["id"]: s for s in conf["scenes"]}
    rooms = [s for s in conf["scenes"] if s.get("room")]
    scenes_out = []
    for scene in conf["scenes"]:
        sid = scene["id"]
        img = flats[scene["image"]]
        pano_meta_path = IMAGES / "rooms" / f"{sid}.json"
        pano_meta = json.loads(pano_meta_path.read_text(encoding="utf-8")) if pano_meta_path.exists() else None

        hotspots = []
        if pano_meta:
            cfg = pano_scene(pano_meta)
            for d in scene.get("panoDoors", []):
                hotspots.append({"kind": "door", "to": d["to"], "label": titles[d["to"]]["title"],
                                 "yaw": d["yaw"], "pitch": d["pitch"]})
            pano_img = Image.open(ROOT / pano_meta["file"]).convert("RGB")
            ImageOps.fit(pano_img, THUMB_SIZE, Image.LANCZOS).save(IMAGES / "thumbs" / f"{sid}.jpg", quality=82)
            mode = "pano"
        else:
            cfg, view_box = flat_scene(scene, img)
            img.thumb(view_box, IMAGES / "thumbs" / f"{sid}.jpg")
            mode = "plan" if scene["image"] == mm["image"] else "flat"
            for h in scene.get("hotspots", []):
                item = {"kind": h["type"], "label": h["label"], "yaw": r2(img.yaw(h["x"])), "pitch": r2(img.pitch(h["y"], h["x"]))}
                for k in ("to", "sub", "text"):
                    if k in h:
                        item[k] = h[k]
                hotspots.append(item)
            if sid == "can-ho":
                for r in rooms:
                    px, py = r.get("pin") or ((r["box"][0] + r["box"][2]) / 2, (r["box"][1] + r["box"][3]) / 2)
                    hotspots.append({"kind": "room", "to": r["id"], "label": r["title"],
                                     "sub": f"{r['area']:.2f} m²".replace(".", ","),
                                     "yaw": r2(img.yaw(px)), "pitch": r2(img.pitch(py, px))})
            for d in scene.get("doors", []):
                hotspots.append({"kind": "door", "to": d["to"], "label": titles[d["to"]]["title"],
                                 "yaw": r2(img.yaw(d["x"])), "pitch": r2(img.pitch(d["y"], d["x"]))})

        out = {"id": sid, "level": scene["level"], "title": scene["title"], "crumb": scene["crumb"],
               "lead": scene.get("lead", ""), "mode": mode, "pannellum": cfg, "hotspots": hotspots,
               "thumb": f"images/thumbs/{sid}.jpg"}
        if scene.get("room"):
            out.update(room=True, area=scene["area"],
                       neighbors=[d["to"] for d in scene.get("doors", [])],
                       shape=[mm_pct(a, b) + mm_pct(c, d) for a, b, c, d in scene["shape"]],
                       shapePx=scene["shape"],
                       pin=mm_pct(*(scene.get("pin") or scene["box"][:2])))
            if pano_meta:
                out["panoSource"] = pano_meta.get("source", {})
        if "videoTime" in scene:
            out["videoTime"] = scene["videoTime"]
        elif pano_meta and "start" in pano_meta.get("source", {}):
            out["videoTime"] = pano_meta["source"]["start"]
        scenes_out.append(out)

    plan = flats[mm["image"]]
    data = {
        "title": conf["title"], "unit": conf["unit"], "video": conf["video"], "levels": conf["levels"],
        "firstScene": conf["scenes"][0]["id"],
        "plan": {**plan.meta(), "minimapCrop": mm["crop"]},
        "minimap": "images/minimap.jpg", "keyPlan": "images/so-do-tang.jpg",
        "scenes": scenes_out,
    }
    js = "// Tạo tự động bởi tools/build.py từ tour.config.json – đừng sửa tay.\nwindow.TOUR = " + \
         json.dumps(data, ensure_ascii=False, indent=1) + ";\n"
    (ROOT / "data.js").write_text(js, encoding="utf-8")
    print(f"data.js: {len(scenes_out)} cảnh, ảnh: {', '.join(f.file for f in flats.values())}")

    if args.debug:
        dbg = Path(args.debug)
        dbg.mkdir(parents=True, exist_ok=True)
        for key, spec in conf["images"].items():
            im = Image.open(ROOT / spec["src"]).convert("RGB")
            dr = ImageDraw.Draw(im)
            for scene in conf["scenes"]:
                if scene["image"] != key:
                    continue
                for h in scene.get("hotspots", []):
                    dr.ellipse((h["x"] - 6, h["y"] - 6, h["x"] + 6, h["y"] + 6), outline=(255, 0, 0), width=3)
                    dr.text((h["x"] + 8, h["y"] - 6), h["label"], fill=(200, 0, 0))
                if scene.get("room"):
                    for a, b, c, d in scene["shape"]:
                        dr.rectangle((a, b, c, d), outline=(0, 120, 255), width=2)
                    px, py = scene["pin"]
                    dr.text((px - 20, py), scene["crumb"], fill=(0, 0, 160))
                    for d in scene.get("doors", []):
                        dr.ellipse((d["x"] - 4, d["y"] - 4, d["x"] + 4, d["y"] + 4), fill=(255, 140, 0))
            im.save(dbg / f"{key}.png")
        print("ảnh kiểm tra:", dbg)


if __name__ == "__main__":
    main()
