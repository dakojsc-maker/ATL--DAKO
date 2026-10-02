# Video giới thiệu Hồ sơ năng lực đào tạo AI cho hành chính công – Viện STP (có thuyết minh)

Thành phẩm (thư mục gốc repo):

| File | Mô tả |
|---|---|
| `Vien-STP_Dao-tao-AI_Hanh-chinh-cong_1080p.mp4` | 1920×1080, 30fps, có thuyết minh giọng nữ + nhạc nền |
| `Vien-STP_Dao-tao-AI_Hanh-chinh-cong_720p.mp4` | Bản nhẹ để gửi Zalo/email |
| `Vien-STP_Dao-tao-AI_Hanh-chinh-cong_khong-loi_720p.mp4` | Chỉ có nhạc – dùng khi muốn lồng giọng đọc khác |
| `Vien-STP_Dao-tao-AI_Hanh-chinh-cong.srt` | Phụ đề tiếng Việt khớp lời đọc (bật/tắt được trên YouTube, Facebook…) |

Nội dung theo file *Profile đào tạo AI hành chính công – Viện STP* (12 trang), trọng tâm là chương trình
**Ứng dụng Trí tuệ nhân tạo trong công tác văn phòng – hành chính**.

| Cảnh | Nội dung |
|---|---|
| 1 | Mở đầu: núi công văn, tờ trình, báo cáo → quả cầu AI – “nếu mỗi cán bộ có thêm một trợ lý AI?” |
| 2 | Viện STP – AI Training Profile, 6 mảng dịch vụ xoay quanh lõi AI, thông điệp “AI Transformation Partner” |
| 3 | Về chúng tôi: 2020 · VUSTA · 3 văn phòng, Giấy chứng nhận 234/QĐ-LHHVN |
| 4 | Sứ mệnh (4) & giá trị cốt lõi: Minh bạch – Ứng dụng – Bền vững |
| 5 | Năng lực cốt lõi: may đo, công nghệ & tự động hoá, thực thi kép, đa ngành |
| 6 | Chương trình cho 4 nhóm: cơ quan nhà nước, doanh nghiệp, giáo dục, cá nhân |
| 7 | Chương trình trọng tâm: 30% nền tảng / 70% thực hành – “AI hỗ trợ, cán bộ chịu trách nhiệm” |
| 8 | Phần 1: AI an toàn, cấu trúc câu lệnh, Trợ lý AI nghiệp vụ có trích dẫn |
| 9 | Phần 2: văn bản đi (đúng thể thức NĐ 30) – văn bản đến (phiếu tóm tắt) |
| 10 | Báo cáo tổng hợp & phân tích số liệu (dữ liệu minh hoạ) |
| 11 | Thủ tục hành chính một cửa, thông báo kết luận cuộc họp, tuyên truyền |
| 12 | 8 sản phẩm đầu ra sau tập huấn |
| 13 | Căn cứ pháp lý xây dựng nội dung |
| 14 | Liên hệ, QR, lời mời khảo sát & thiết kế chương trình riêng |

## Thuyết minh

- Kịch bản: `narration.json` – mỗi câu có `say` (viết theo cách đọc, ví dụ STP → “Ét Tê Pê”, AI → “Ây Ai”)
  và `sub` (phụ đề hiển thị).
- Giọng đọc: Piper `vi_VN-vais1000-medium` (giọng nữ miền Bắc, bộ dữ liệu VAIS-1000 – giấy phép CC BY 4.0),
  chạy offline bằng `sherpa-onnx`. Tải `vits-piper-vi_VN-vais1000-medium.tar.bz2` ở
  https://github.com/k2-fsa/sherpa-onnx/releases (mục `tts-models`) và giải nén vào `video-ai/voice/`.
- `tts.py` đọc từng câu, cắt khoảng lặng, cân mức âm lượng, ghi `vo.json` (độ dài từng câu). `main.js` dùng các
  độ dài này để canh thời lượng cảnh và thời điểm hiệu ứng theo từng cụm từ.
- Kiểm tra phát âm tự động (tuỳ chọn): đặt `ASR_DIR` tới mô hình nhận dạng tiếng Việt
  `sherpa-onnx-zipformer-vi-int8-2025-04-20` (mục `asr-models`); `tts.py` sẽ nhận dạng lại từng câu và in tỉ lệ khớp.
- `synth.py` đặt từng câu đúng mốc, tự hạ nhạc nền khi có lời (ducking) và xuất thêm bản chỉ có nhạc.
- Muốn thay bằng giọng đọc thật: thu âm theo `narration.json`, đặt file `build/vo/<id>.wav` (48 kHz mono) cùng tên,
  cập nhật `dur` trong `vo.json` rồi chạy `SKIP_TTS=1 ./build.sh`.

## Dựng lại

Cần Node 18+, Python 3 (`numpy`, `scipy`, `sherpa-onnx`), Playwright + Chromium, ffmpeg có libx264.

```bash
cd video-ai
npm install && npx playwright install chromium
pip install sherpa-onnx
VOICE_DIR=voice/vits-piper-vi_VN-vais1000-medium ./build.sh     # kết quả trong video-ai/build/
```

Xem trước: `python3 -m http.server 8128` trong `video-ai/`, mở `http://127.0.0.1:8128/index.html?play`
(hoặc `?t=40` để xem khung hình ở giây thứ 40).
