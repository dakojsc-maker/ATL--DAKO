# Video giới thiệu HRMS 3.0 & D-Office – EVNICT (có thuyết minh, giao diện thực tế)

Thành phẩm (thư mục gốc repo): **`EVNICT_HRMS-3.0_Gioi-thieu_Thuyet-minh_1080p.mp4`** – 1920×1080, 30fps,
thuyết minh giọng nữ + nhạc nền, dưới 30 MB (mã hoá 2 lượt H.264, bitrate tính theo thời lượng để nét nhất
trong giới hạn dung lượng).

Nội dung theo file *HRMS_EVNICT_thuyet_trinh_v2_co_hinh_thuc_te* – dùng ảnh chụp giao diện thực tế của hệ thống,
khung nổi bật xuất hiện đúng lúc tính năng tương ứng được đọc.

| Cảnh | Nội dung |
|---|---|
| 1 | Bài toán: giấy tờ, dữ liệu rời rạc, phê duyệt chậm trễ |
| 2 | EVNICT giới thiệu HRMS 3.0 & D-Office (logo lắp ráp, lưới điện) |
| 3 | Năng lực EVNICT: 400+ chuyên gia, 20+ năm, Top 10 doanh nghiệp CNTT, Sao Khuê |
| 4 | Hệ sinh thái hợp nhất: người dùng → Web/App → lõi dịch vụ → HRMS, D-Office, SmartEVN, E-learning → ERP, Epayment, CMIS, IMIS |
| 5 | D-Office: tiếp nhận → phân phối → chỉ đạo → thực hiện → ký số phát hành |
| 6 | HRMS self-service: người lao động cập nhật → HR kiểm duyệt → lãnh đạo phê duyệt |
| 7 | SmartEVN (giao diện thực tế): đăng nhập một lần, tiện ích văn phòng trên điện thoại |
| 8 | Dashboard và hồ sơ nhân sự điện tử |
| 9 | Đăng ký nhu cầu và lập kế hoạch đào tạo |
| 10 | Đăng ký nâng lương, tiêu chí – điều kiện |
| 11 | Trình ký điện tử HRMS ↔ D-Office, hợp đồng lao động ký số USB/HSM |
| 12 | Báo cáo lao động – tiền lương, ký số trên web và điện thoại |
| 13 | Phân quyền theo vai trò (3 lớp, 44 vai trò), nhật ký thao tác |
| 14 | Microservices, API, vận hành 24/7, 97.000+ người dùng |
| 15 | Lộ trình triển khai 6 bước, phân công EVNICT – đơn vị |
| 16 | 6 giá trị cốt lõi |
| 17 | Kết: HRMS 3.0 & D-Office, lời mời cùng xác định bài toán ưu tiên |

## Thuyết minh

- Kịch bản `narration.json`: `say` viết theo cách đọc (EVNICT → “Ê Vê En Ai Xi Ti”, HRMS → “Ếch A Em Ét”,
  D-Office → “Đi Óp phít”, SmartEVN → “Xmát E Vê En”), `sub` là phụ đề.
- Giọng đọc: Piper `vi_VN-vais1000-medium` (giọng nữ, CC BY 4.0) qua `sherpa-onnx`; `tts.py` đọc mỗi câu nhiều lần
  (`TAKES`) và giữ bản nhận dạng lại khớp nhất (`ASR_DIR` = `sherpa-onnx-zipformer-vi-int8-2025-04-20`).
- `synth.py` đặt từng câu đúng mốc và tự hạ nhạc khi có lời; `build/…srt` là phụ đề khớp lời đọc.

## Dựng lại

```bash
cd video-hrms3
npm install gsap@3 lucide-static @fontsource/be-vietnam-pro @fontsource/jetbrains-mono playwright
VOICE_DIR=…/vits-piper-vi_VN-vais1000-medium ./build.sh      # hoặc SKIP_TTS=1 ./build.sh
```

Xem trước: `python3 -m http.server 8129` trong `video-hrms3/`, mở `http://127.0.0.1:8129/index.html?play`
(hoặc `?t=40` để xem khung hình ở giây thứ 40).
