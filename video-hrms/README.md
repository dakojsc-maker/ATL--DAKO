# Video giới thiệu HRMS 3.0 – Hệ thống Quản lý Nguồn nhân lực cho các Nhà máy điện

Thành phẩm: `../EVN_HRMS-3.0_Quan-ly-nguon-nhan-luc_Nha-may-dien_1080p.mp4` (1920×1080, 30fps, H.264 + AAC)
và bản nhẹ `..._720p.mp4` để gửi qua Zalo/email.

Nội dung theo file *EVN HRMS 3.0 – Digital Power Grid* (13 trang), logo EVNICT do khách hàng cung cấp.
Phong cách "lưới điện số": nền mạch điện có xung năng lượng chạy, cột điện cao thế, chuyển cảnh bằng
tia sét quét ngang, vòng loang từ nút mạng, khối lưới và nhiễu glitch.

| Cảnh | Nội dung |
|---|---|
| 1 | Mở đầu: hồ sơ giấy, dữ liệu phân mảnh, độ trễ hành chính – “quản trị nhân sự có theo kịp?” |
| 2 | Logo EVNICT tự lắp ráp · tiêu đề HRMS 3.0 – Giải pháp Quản trị Số Toàn diện & Hợp nhất |
| 3 | 100% quy trình nhân sự số hoá · 97.000 CBCNV · tối ưu nguồn lực, minh bạch, loại bỏ độ trễ |
| 4 | Kiến trúc: Lãnh đạo → kênh Web/App → dịch vụ NNL → HRMS 3.0, D-Office, SmartEVN, E-Learning → ERP, Epayment, CMIS, IMIS |
| 5 | Phân quyền 4 vai trò: Lãnh đạo, TCNS, Người lao động, Quản trị hệ thống |
| 6 | Hồ sơ điện tử: chủ động cập nhật → Smart Highlight → lưu trữ khép kín |
| 7 | Hợp đồng điện tử: khởi tạo tự động → cảnh báo đa kênh → ký số CA → đồng bộ D-Office |
| 8 | Tích hợp HRMS × D-Office: luồng văn bản hai chiều, ký số Token/CA |
| 9 | Quản lý đào tạo: vòng lặp HRMS ↔ Đánh giá & Kết quả ↔ E-learning |
| 10 | Tự động hoá xét nâng lương & BNH/TNB |
| 11 | Công tác cán bộ: Quy hoạch → Kê khai tài sản → Bổ nhiệm & Điều động → Nghỉ hưu |
| 12 | App SmartEVN trong tay người lao động |
| 13 | An ninh dữ liệu: RBAC, Audit Trail, bảo mật đường truyền |
| 14 | Giá trị: Năng suất (−70% thời gian thủ tục), Tuân thủ (100% đúng quy trình), Chiến lược |
| 15 | Kết: “HRMS 3.0 đã hoàn thiện và sẵn sàng đồng bộ” + lời mời tư vấn & demo |

## Dựng lại video

Cần Node 18+, Python 3 (`numpy`, `scipy`), Playwright + Chromium, ffmpeg có libx264.

```bash
cd video-hrms
npm install
npx playwright install chromium
./build.sh            # kết quả nằm trong video-hrms/build/
```

Xem trước: `python3 -m http.server 8127` trong `video-hrms/`, mở `http://127.0.0.1:8127/index.html?play`
(hoặc `?t=40` để xem khung hình ở giây thứ 40).

Sửa chữ trong `index.html`; thời lượng từng cảnh là giá trị `return t + …` của các hàm `S1…S15` trong `main.js`.
Nhạc nền và hiệu ứng âm thanh (`synth.py`) tự tổng hợp và tự khớp lại theo các mốc mới khi build –
không dùng nhạc có bản quyền.
