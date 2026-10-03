# Video giới thiệu Hồ sơ năng lực lĩnh vực đào tạo – Viện STP (có thuyết minh)

Thành phẩm (thư mục gốc repo): **`Vien-STP_Linh-vuc-dao-tao_Gioi-thieu_1080p.mp4`** – 1920×1080, 30fps,
thuyết minh giọng nữ + nhạc nền, dưới 30 MB (mã hoá 2 lượt H.264, bitrate tính theo thời lượng để nét nhất trong
giới hạn dung lượng; chạy được trên mọi điện thoại, máy tính, Zalo, email).

Toàn bộ video dùng thuật ngữ **“chứng nhận”** (không dùng “chứng chỉ”), kể cả trên ảnh chụp màn hình phần mềm
(`assets/ph/ui_lookup_cn.jpg`, `ui_dash_cn.jpg` – sửa bằng `tools/patch_ui.js`).

Nội dung theo file *Profile đào tạo Viện STP* (20 trang). Trang **“Các trọng tâm đào tạo”** là trục của video:
mỗi trọng tâm được phóng to từ ô của nó để giới thiệu chi tiết, rồi thu nhỏ trở về trang trọng tâm – ô vừa
giới thiệu được đánh dấu ✓ “Đã giới thiệu” – sau đó trọng tâm kế tiếp mới được chọn.

| Cảnh | Nội dung |
|---|---|
| Mở đầu | Bức tường ảnh đào tạo thực tế – “Chất lượng nguồn nhân lực: chìa khóa then chốt trong thời đại số” |
| Thương hiệu | Logo, “Hồ sơ năng lực – Lĩnh vực đào tạo”, 4 mảng xoay quanh quả cầu tri thức |
| Về Viện STP | 2020 · VUSTA · 03 văn phòng, Giấy chứng nhận 234/QĐ-LHHVN, bản đồ Hà Nội – Nha Trang – TP.HCM |
| **Trang trọng tâm** | 4 ô: Chứng nhận nghiệp vụ ngắn hạn · An toàn, vệ sinh lao động · Đào tạo ứng dụng AI · Tuyển sinh & khảo thí Cambridge |
| Trọng tâm 01 | Chứng nhận nghiệp vụ ngắn hạn: đường thủy nội địa, xây dựng, môi giới bất động sản…; chứng nhận song ngữ Việt – Anh |
| ↩ Trang trọng tâm | 01 ✓, chọn 02 |
| Trọng tâm 02 | ATVSLĐ: mô hình hợp tác Viện STP – DAKO, 6 nhóm huấn luyện, số hóa quản lý, nền tảng số STP, khách hàng tiêu biểu |
| ↩ Trang trọng tâm | 02 ✓, chọn 03 |
| Trọng tâm 03 | Đào tạo AI thiết kế riêng, năng lực cốt lõi, 4 nhóm đối tượng, chương trình AI cho khối hành chính (30% / 70%) |
| ↩ Trang trọng tâm | 03 ✓, chọn 04 |
| Trọng tâm 04 | Tuyển sinh Sơ cấp → Tiến sĩ, khảo thí chuẩn Cambridge, phòng thi máy tính 250 thí sinh/ca |
| ↩ Trang trọng tâm | Cả 4 ✓ – “Một hệ sinh thái đào tạo toàn diện”: Khảo sát → Lộ trình → Ứng dụng |
| Đối tác | 16 đối tác, mạng lưới trong nước và quốc tế |
| Kết | Liên hệ, mã QR, lời mời tư vấn & thiết kế chương trình riêng |

## Thuyết minh

- Kịch bản: `narration.json` – mỗi câu có `say` (viết theo cách đọc: STP → “Ét Tê Pê”, AI → “Ây Ai”,
  Cambridge → “Kêm brít”, DAKO → “Đa Cô”) và `sub` (phụ đề hiển thị).
- Giọng đọc: Piper `vi_VN-vais1000-medium` (giọng nữ miền Bắc, bộ dữ liệu VAIS-1000 – giấy phép CC BY 4.0),
  chạy offline bằng `sherpa-onnx`. Tải `vits-piper-vi_VN-vais1000-medium.tar.bz2` ở
  https://github.com/k2-fsa/sherpa-onnx/releases (mục `tts-models`).
- Kiểm tra phát âm: đặt `ASR_DIR` tới `sherpa-onnx-zipformer-vi-int8-2025-04-20` (mục `asr-models`) và `TAKES=5`;
  `tts.py` đọc mỗi câu nhiều lần, giữ bản nhận dạng khớp nhất (`ACRONYMS` = các từ phiên âm không tính khi so khớp).
  `ONLY=c2bb1,c3bb2` để đọc lại riêng vài câu.
- `synth.py` đặt từng câu đúng mốc, tự hạ nhạc nền khi có lời và xuất thêm bản chỉ có nhạc.
- Muốn thay bằng giọng đọc thật: thu âm theo `narration.json`, đặt `build/vo/<id>.wav` (48 kHz mono),
  cập nhật `dur` trong `vo.json` rồi chạy `SKIP_TTS=1 ./build.sh`.
- `build/…srt`: phụ đề tiếng Việt khớp lời đọc (sinh kèm khi dựng, dùng khi đăng YouTube/Facebook).

## Dựng lại

Cần Node 18+, Python 3 (`numpy`, `scipy`, `sherpa-onnx`), Playwright + Chromium, ffmpeg có libx264.

```bash
cd video-stp
npm install gsap@3 lucide-static @fontsource/be-vietnam-pro @fontsource/jetbrains-mono playwright
VOICE_DIR=…/vits-piper-vi_VN-vais1000-medium ./build.sh      # hoặc SKIP_TTS=1 ./build.sh
```

Render chia đoạn 10 giây (`render_segments.sh`), chạy lại được nếu bị ngắt. Xem trước:
`python3 -m http.server 8130` trong `video-stp/`, mở `http://127.0.0.1:8130/index.html?play`
(hoặc `?t=40` để xem khung hình ở giây thứ 40).
