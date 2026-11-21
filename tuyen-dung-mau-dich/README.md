# Workflow đăng tin tuyển dụng – Mậu Dịch 197X

Công ty TNHH Hoàng Sa Nha Trang · 8 vị trí · 28 nhân sự · 28 bài trong 4 tuần.

**Dùng ngay:** mở `Workflow_TuyenDung_MauDich197X.html` bằng Chrome/Edge trên máy bất kỳ.
File đã chứa sẵn toàn bộ bài viết, câu lệnh tạo ảnh và logo; không cần cài đặt gì.

## Có gì trong workflow
- Lịch tuần (Thứ Hai → Chủ Nhật), bấm vào ngày để xem: bài đăng, câu lệnh tạo ảnh, kênh đăng và giờ đăng.
- Ghép poster 1080×1350: AI chỉ tạo ảnh nền, workflow tự ghép logo gốc + vị trí + quyền lợi + liên hệ.
- Copy bài đăng / bản ngắn (Zalo, TikTok) / bản web tuyển dụng (TopCV, Chợ Tốt…), đánh dấu đã đăng.
- Kho bài đăng sẵn: 3 phong cách bài tuyển chung (Thông báo tổng hợp, Phiếu tuyển dụng 197X, Gia nhập đội hình)
  và 8 bài chuẩn cho từng vị trí (không kèm vị trí khác), mỗi bài có poster riêng, bấm “Copy bài” là đăng được.
- Bật “Đã đủ người” cho vị trí đã tuyển xong: vị trí tự biến mất khỏi mọi bài và poster.

## Sửa nội dung
- Nội dung bài (lịch 28 ngày, bài chuẩn `CHUAN`, bài chung `CHUNG`), vị trí, kênh: `du_lieu.py`
- Giao diện và cách ghép poster: `khung.html`
- Logo: `assets/logo-maudich-197x.png` (tách từ logo gốc `assets/logo-goc.jpg`, giữ nguyên hình và màu)

Sau khi sửa, chạy `python3 build.py` để tạo lại file HTML.
