---
name: tai-lieu-atvsld
description: Soạn tài liệu ATVSLĐ gửi doanh nghiệp theo từng ngành (bản rút gọn của cẩm nang tư vấn dành cho nhân viên kinh doanh của Viện STP – DAKO), theo đúng chuẩn đã duyệt là bản 01 Xây dựng. Dùng khi người dùng gửi cẩm nang tư vấn ATVSLĐ của một ngành và muốn có tài liệu ngắn gửi doanh nghiệp, khách hàng hoặc người phụ trách; khi nói "làm tài liệu cho doanh nghiệp ngành …", "rút gọn cẩm nang cho khách", "làm theo chuẩn tài liệu 01"; hoặc khi cần sửa, cập nhật các tài liệu trong tai-lieu-atvsld/.
---

# Tài liệu ATVSLĐ gửi doanh nghiệp

Đọc `tai-lieu-atvsld/CHUAN.md` trước khi làm. Bản mẫu đã duyệt: `tai-lieu-atvsld/nganh/01_xay_dung.js` (nội dung) và
`tai-lieu-atvsld/01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` (file người dùng chỉnh trên Word). Trả lời bằng tiếng Việt.

## Người dùng không rành kỹ thuật
- Tự chạy mọi lệnh; không bảo người dùng gõ lệnh hay mở thư mục.
- Giao file Word và PDF trực tiếp trong cuộc trò chuyện, nói ngắn tài liệu có những phần nào và còn điều gì cần họ quyết.

## Các bước làm tài liệu cho một ngành mới
1. Chép file cẩm nang người dùng gửi vào thư mục tạm riêng; đọc hết bằng `pandoc -t markdown`.
2. Chép `tai-lieu-atvsld/nganh/01_xay_dung.js` thành `tai-lieu-atvsld/nganh/NN_<ten_nganh>.js` (NN theo số cẩm nang,
   tên không dấu), viết lại toàn bộ chữ cho ngành đó theo mục 2 và 4 của CHUAN.md. Lấy thông tin chỉ từ cẩm nang của
   ngành; phần dùng chung lấy từ `tai-lieu-atvsld/khung/noi_dung_chung.js`.
3. Dựng: `node tai-lieu-atvsld/build.js NN --pdf` (thêm `--out <thư mục tạm>` khi dựng thử). Xử lý mọi cảnh báo in ra.
4. Xem từng trang PDF (chuyển sang ảnh bằng `pdftoppm`): đủ mục 1–7, mục 1 và mục 5 bắt đầu trang mới, chữ cỡ 13,
   không tràn bảng, không trang trắng, khoảng 10 trang. Sửa chữ cho gọn nếu bảng quá dài.
5. Thêm dòng vào bảng "Danh sách" trong `tai-lieu-atvsld/README.md`; commit, push lên nhánh đang làm.

## Không được
- Không đổi khung định dạng (`khung/khung_tai_lieu.js`) hay CHUAN.md khi người dùng chưa yêu cầu.
- Không thêm mục 8, hộp liên hệ cuối tài liệu hay phiếu chuẩn bị thông tin; không nhắc tới "phiếu".
- Không nêu mức phạt, không hứa tính năng phần mềm chưa có, không cam kết học trực tuyến.

## Khi người dùng gửi lại bản đã chỉnh trên Word
So sánh với bản dựng (văn bản bằng `pandoc`, định dạng trong `word/document.xml`: cỡ chữ, căn lề, kẻ bảng, độ rộng cột,
ngắt trang), liệt kê từng thay đổi, rồi cập nhật khung, `noi_dung_chung.js` và CHUAN.md cho khớp. Báo người dùng lỗi sót
nếu có (đoạn trống, trang trắng, câu nhắc tới phần đã xóa).
