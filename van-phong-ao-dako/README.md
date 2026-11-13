# Văn phòng ảo DAKO – Huấn luyện ATVSLĐ

Trang 3D trên claude.ai: **https://claude.ai/artifact/H3Z7YcPypTbAomiqcipXxe**

Hai trưởng phòng **Mrs. Nga** và **Mr. Lịch** giao việc cho 5 nhân viên. Mỗi nhân viên phụ trách một phiên chat trên claude.ai:

| Số | Nhân viên | Công việc | Phiên chat |
|---|---|---|---|
| 1 | Bảo | Tạo file in Giấy chứng nhận và Thẻ an toàn lao động PPTX | https://claude.ai/share/9cd7242d-0da5-41d5-b482-01cd5a61e254 |
| 2 | Tuấn | Danh sách điểm danh và tạo Appscript điểm danh | https://claude.ai/share/95b1c7fc-18e8-4632-8fbe-96612a689c7d |
| 3 | Ngọc | Mẫu hồ sơ huấn luyện an toàn lao động | https://claude.ai/share/1976778d-9bb7-49e8-8e35-b96b2ac9831f |
| 4 | Mai | Danh sách điểm danh khóa học | https://claude.ai/share/290240b9-0089-43d5-9beb-1d1ea9c487e2 |
| 5 | Hà | Danh sách đăng ký huấn luyện | https://claude.ai/share/2a309b07-6129-442b-82b3-2f5db83ced10 |

## Cách dùng
- **Rê chuột** vào nhân viên (trong văn phòng 3D hoặc ở danh sách bên phải): hiện danh sách kết quả đầu ra và những gì cần gửi kèm.
- **Bấm** vào nhân viên: mở phiên chat của nhân viên đó ở tab mới để giao việc ngay. Thẻ nhân viên hiện kèm nút vàng mở lại phiên chat nếu trình duyệt chặn tab mới.
- Trên điện thoại: chạm vào nhân viên để xem đầu ra, rồi bấm nút vàng để mở phiên chat.
- Góc trên: chọn **Mrs. Nga** hoặc **Mr. Lịch** là người giao việc; kiểu văn phòng Sáng / Đêm biển / Bản vẽ.

## Sửa nội dung
Tên, công việc, link phiên chat và danh sách kết quả đầu ra nằm trong `doi-ngu.json`. Sửa xong chạy
`python3 van-phong-ao-dako/build.py` rồi đăng lại cùng đường dẫn tệp `van-phong-ao-dako/van-phong-ao-dako.html` (giữ nguyên link).

Mã nguồn: `src/page.html` khung trang · `src/styles.css` giao diện màu DAKO · `src/office.js` văn phòng 3D (three.js r128) ·
`src/main.js` danh sách nhân sự, thẻ kết quả đầu ra, mở phiên chat. Kiểm thử trình duyệt: `kiem-thu/v2.js`.

Bản đầu tiên (8 phòng, 20 nhân sự, giao việc qua Claude Code) lưu ở `ban-1/`.
