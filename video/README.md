# Video giới thiệu dịch vụ đào tạo ATVSLĐ – Viện STP × DAKO

Thành phẩm: `../STP-DAKO_Gioi-thieu-dich-vu-ATVSLD_1080p.mp4` (1920×1080, 30fps, H.264 + AAC)
và bản nhẹ `../STP-DAKO_Gioi-thieu-dich-vu-ATVSLD_720p.mp4` để gửi qua Zalo/email.

Nội dung lấy từ file thuyết trình *Dịch vụ ATL*: Phần I (Viện STP & DAKO) và Phần IV (hoạt động, liên hệ)
được lướt nhanh; Phần II (dịch vụ, quy trình 6 bước, 6 nhóm huấn luyện, chứng chỉ) và Phần III
(chuyển đổi số: dashboard, module, tra cứu 24/7, Learner Portal) là trọng tâm.

## Cấu trúc

| File | Vai trò |
|---|---|
| `index.html`, `style.css` | 17 cảnh, bố cục 1920×1080 |
| `main.js` | Toàn bộ chuyển động (GSAP timeline dừng sẵn) + các mốc âm thanh |
| `assets/` | Logo, ảnh, ảnh chụp màn hình hệ thống lấy từ file PPTX; QR trỏ tới https://www.vienstp.com |
| `render.js` | Chụp từng khung hình bằng Chromium (Playwright) và mã hoá qua ffmpeg |
| `synth.py` | Tự tổng hợp nhạc nền + hiệu ứng âm thanh (không dùng nhạc có bản quyền) |
| `build.sh` | Chạy toàn bộ quy trình |

## Dựng lại video

Cần Node 18+, Python 3 (`numpy`, `scipy`), Playwright + Chromium, ffmpeg có libx264.

```bash
cd video
npm install
npx playwright install chromium
./build.sh            # kết quả nằm trong video/build/
```

Xem trước trong trình duyệt: chạy `python3 -m http.server 8123` trong thư mục `video/`
rồi mở `http://127.0.0.1:8123/index.html?play` (hoặc `?t=64` để nhảy tới giây thứ 64).

Sửa chữ: chỉnh trực tiếp trong `index.html`. Sửa thời lượng một cảnh: giá trị `return t + …`
ở cuối hàm cảnh tương ứng (`S1`…`S17`) trong `main.js`; nhạc tự khớp lại theo mốc mới khi build.
