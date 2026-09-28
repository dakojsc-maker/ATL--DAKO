# Video giới thiệu Giải pháp định danh sản phẩm & truy xuất nguồn gốc chuẩn TCVN/GS1 – Viện STP

Thành phẩm: `../STP_TXNG_Dinh-danh-san-pham_TCVN-GS1_1080p.mp4` (1920×1080, 30fps, H.264 + AAC)
và bản nhẹ `..._720p.mp4` để gửi qua Zalo/email.

Nội dung theo brochure *TXNG Rong nho Trí Tín – Viện STP*; chuỗi rong nho biển của Công ty TNHH Trí Tín
được dùng làm mô hình ứng dụng minh họa.

| Cảnh | Nội dung |
|---|---|
| 1 | Mở đầu: mã QR bị sao chép tràn lan – “Doanh nghiệp chứng minh hàng thật bằng cách nào?” |
| 2 | Tiêu đề: Định danh sản phẩm & truy xuất nguồn gốc chuẩn TCVN/GS1 |
| 3 | Thách thức: hiệu ứng domino ở 3 luồng vùng nuôi – chế biến – thương mại |
| 4 | Kiến trúc bảo vệ kép: NBC Trace Pro + Tem chống giả điện tử NBC |
| 5 | “Sợi chỉ số” – mapping mã GS1 (GLN, Batch, GTIN + SN, SSCC, QR) qua 10 công đoạn |
| 6–11 | 6 chạm điểm: vùng nuôi (GLN, nhật ký điện tử) · thu hoạch (mã lô, chống lùi ngày) · chế biến (ly tâm, tách nước, muối hóa) · E-COA & gatekeeping · tem chống giả (UV, anti-reuse, chống sao chép) · logistics SSCC & anti-diversion |
| 12 | Xác thực: lần quét 1 “Chính hãng” – từ lần quét 2 cảnh báo đỏ |
| 13 | Lộ trình 6 giai đoạn, 15–30 ngày, đồng bộ Cổng TXNG Quốc gia |
| 14 | Lợi ích: Công nghệ – Minh bạch – Quản trị |
| 15 | Liên hệ |

## Dựng lại video

Cần Node 18+, Python 3 (`numpy`, `scipy`), Playwright + Chromium, ffmpeg có libx264.

```bash
cd video-txng
npm install
npx playwright install chromium
./build.sh            # kết quả nằm trong video-txng/build/
```

Xem trước: chạy `python3 -m http.server 8126` trong `video-txng/` rồi mở
`http://127.0.0.1:8126/index.html?play` (hoặc `?t=64` để xem khung hình ở giây 64).
Sửa chữ trong `index.html`; thời lượng mỗi cảnh là giá trị `return …` cuối hàm `S1`…`S15` trong `main.js`.
