# Video profile Viện STP – bản 2D và bản 3D

Nội dung theo file *Trình chiếu PROFILE Viện STP*: bảo chứng pháp lý (VUSTA), 4 trụ cột của hệ sinh thái số
(nghiên cứu & dự án · đào tạo & chứng chỉ · truy xuất nguồn gốc · chuyển đổi số), tiêu điểm nông nghiệp
thông minh IoT, mạng lưới đối tác, văn phòng và liên hệ.

| Thành phẩm | Mô tả |
|---|---|
| `../Vien-STP_Profile_2D_1080p.mp4` / `_720p.mp4` | Motion graphics 2D, ~3 phút, 22 cảnh |
| `../Vien-STP_Profile_3D_1080p.mp4` / `_720p.mp4` | Thế giới 3D (three.js) – máy quay bay qua 15 trạm, ~2 phút 48 giây |

## Cấu trúc

| Thư mục / file | Vai trò |
|---|---|
| `2d/` | `index.html`, `style.css`, `main.js` – bản 2D (GSAP timeline) |
| `3d/` | `index.html` (lớp chữ HTML), `style.css`, `main.js` – cảnh 3D three.js + camera + nhãn gắn vào vật thể 3D |
| `assets/` | Logo, ảnh, bản đồ; QR trỏ tới https://www.vienstp.com |
| `qr_matrix.json` | Ma trận mã QR dùng cho hiệu ứng lắp ghép khối QR |
| `render.js` | Chụp từng khung hình bằng Chromium và mã hoá qua ffmpeg |
| `synth.py` | Tự tổng hợp nhạc nền + hiệu ứng âm thanh khớp các mốc chuyển cảnh (không dùng nhạc có bản quyền) |
| `build.sh` | `./build.sh 2d` hoặc `./build.sh 3d` |

## Dựng lại

Cần Node 18+, Python 3 (`numpy`, `scipy`), Playwright + Chromium, ffmpeg có libx264.

```bash
cd video-profile
npm install
npx playwright install chromium
./build.sh 2d          # vài phút
./build.sh 3d          # máy không có GPU: 1–2 giờ (WebGL chạy bằng SwiftShader)
```

Xem trước: `python3 -m http.server 8125` trong `video-profile/`, rồi mở
`http://127.0.0.1:8125/2d/index.html?play` hoặc `http://127.0.0.1:8125/3d/index.html?t=40`
(bản 3D mở bằng `?t=` để xem một khung hình ở giây bất kỳ).

Sửa chữ: trong `2d/index.html` hoặc `3d/index.html`. Thời lượng cảnh: giá trị `return t + …` (2D) hoặc
`t += …` (3D) trong `main.js`; nhạc tự khớp lại theo mốc mới khi build.
