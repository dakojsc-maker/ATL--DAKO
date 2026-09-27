# Video giới thiệu giải pháp nông nghiệp thông minh BOM IoT – Viện STP

Thành phẩm: `../STP_BOM-IoT_Nong-nghiep-thong-minh_1080p.mp4` (1920×1080, 30fps, H.264 + AAC)
và bản nhẹ `../STP_BOM-IoT_Nong-nghiep-thong-minh_720p.mp4` để gửi qua Zalo/email.

Nội dung theo file *Proposal IoT Viện STP*; hai trang "Hệ thống LoRaWAN tầm xa" và
"Thiết bị cầm tay WiFi/Bluetooth" được mở rộng bằng tài liệu chi tiết *IoT LoraWan* và *IoT Bluetooth*.

| Cảnh | Nội dung |
|---|---|
| 1 | Mở đầu: canh tác cảm tính → dữ liệu chuẩn xác |
| 2 | Tiêu đề: Giải pháp nông nghiệp thông minh BOM IoT, chứng nhận CP (ACS, ITCP), BOM Technology – LATOI Australia |
| 3 | Uy tín quốc tế: 25+ năm kinh nghiệm ICT, CP, ICT Canada, LATOI |
| 4 | Hai phiên bản: LoRaWAN tầm xa và cầm tay WiFi/Bluetooth |
| 5–7 | LoRaWAN: phủ sóng 15 km, cơ chế Node → Gateway → Cloud → App, bản đồ quản lý đa điểm |
| 8–9 | Cầm tay: 9 chỉ số / 5 giây, lợi ích, 4 bước dùng app |
| 10 | Cảm biến 9 trong 1 |
| 11 | AI GreenDoctor |
| 12 | Blockchain & bảo mật dữ liệu |
| 13 | Giá trị kinh tế: +20% / −30% / −50% |
| 14 | So sánh phiên bản |
| 15 | Lộ trình triển khai 4 giai đoạn |
| 16 | Quy mô toàn quốc, văn phòng, liên hệ |

## Dựng lại video

Cần Node 18+, Python 3 (`numpy`, `scipy`), Playwright + Chromium, ffmpeg có libx264.

```bash
cd video-iot
npm install
npx playwright install chromium
./build.sh            # kết quả nằm trong video-iot/build/
```

Xem trước: chạy `python3 -m http.server 8124` trong thư mục `video-iot/` rồi mở
`http://127.0.0.1:8124/index.html?play` (hoặc `?t=64` để nhảy tới giây thứ 64).
Sửa chữ trong `index.html`; thời lượng mỗi cảnh là giá trị `return t + …` cuối hàm `S1`…`S16` trong `main.js`.
