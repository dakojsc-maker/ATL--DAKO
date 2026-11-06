---
name: hop-dong-nguyen-tac
description: Lập Hợp đồng nguyên tắc giữa DAKO và đối tác cùng triển khai dịch vụ huấn luyện ATLĐ, kèm phụ lục bảng phí dịch vụ cho từng khóa (chi phí từng lớp), xuất file Word giữ nguyên định dạng mẫu gốc. Dùng khi người dùng nói "hợp đồng nguyên tắc", "ký hợp đồng với đối tác", "làm hợp đồng cho công ty X", "phụ lục", "bảng phí", "chi phí từng lớp", "thêm khóa cho đối tác", "sửa thông tin DAKO trong hợp đồng" hoặc gửi thông tin/giấy phép kinh doanh của một đối tác để làm hợp đồng.
---

# Hợp đồng nguyên tắc DAKO – đối tác

Công cụ ở `hop-dong-nguyen-tac/` (đọc `hop-dong-nguyen-tac/README.md` để biết đủ các trường). Bên A là
đối tác (khai thác khách hàng), Bên B là DAKO (cung cấp dịch vụ). Trả lời bằng tiếng Việt.

## Người dùng không rành kỹ thuật
- Tự làm mọi bước. Không bảo người dùng gõ lệnh, mở tệp JSON hay nhắc tên tham số, trừ khi họ hỏi.
- Không bịa số liệu: đơn giá, số lượng, thời lượng, VAT, điều khoản thanh toán chỉ lấy từ người dùng.
  Thiếu đơn giá thì để trống (công cụ in dấu chấm để điền tay) và nói rõ trong câu trả lời.

## Các bước

1. **Thu thập thông tin** (từ tin nhắn, file, ảnh giấy phép kinh doanh người dùng gửi):
   - Bắt buộc: tên công ty đối tác, tên viết tắt (để đặt số HĐ), địa chỉ, mã số thuế, người đại diện,
     chức vụ, ngày ký.
   - Tùy chọn: xưng hô (Ông/Bà), điện thoại, email, tài khoản ngân hàng của đối tác.
   - Danh sách khóa huấn luyện; với mỗi khóa là các lớp: tên lớp/nhóm, đối tượng (mô tả), thời lượng,
     đơn vị tính, đơn giá, số lượng (nếu là đơn hàng cụ thể), ghi chú. Ghi chú chung (VAT...), điều
     khoản riêng nếu có.
   - Chỉ hỏi lại những mục bắt buộc còn thiếu, gom vào một câu hỏi. Mục tùy chọn không có thì bỏ qua.
   - Số thứ tự HĐ: nếu người dùng không nêu, lấy số lớn nhất trong năm ở các file `hop-dong-nguyen-tac/doi-tac/*.json`
     cộng 1, và nói rõ số đã dùng trong câu trả lời.
2. **Ghi file** `hop-dong-nguyen-tac/doi-tac/<viết-tắt-chữ-thường>.json` theo mẫu `doi-tac/hkm.json`
   (JSON thuần, không chú thích). Đối tác đã có file thì cập nhật file đó.
3. **Chạy** từ thư mục gốc của kho, đúng dạng (không ghép `cd … &&`):
   `python3 hop-dong-nguyen-tac/tao_hop_dong.py hop-dong-nguyen-tac/doi-tac/<file>.json --pdf`
   - Bổ sung khóa mới cho đối tác đã ký: thêm khóa vào cuối `khoa_hoc` rồi chạy với
     `--chi-phu-luc --phu-luc <số>` để chỉ xuất phụ lục mới.
   - Người dùng muốn từng văn bản riêng để ký: thêm `--tach`.
   - Báo "LỖI: ..." thì sửa file JSON theo nội dung lỗi rồi chạy lại.
4. **Kiểm tra trước khi gửi**: chuyển vài trang PDF thành ảnh (`pdftoppm -png -r 60`) và xem: thông tin
   hai bên, số HĐ, bảng chi phí, tổng tiền bằng chữ. PDF chỉ để kiểm tra (LibreOffice có thể đánh số
   trang liên tục; Word đánh lại từ 1 cho mỗi phụ lục).
5. **Gửi file .docx** bằng SendUserFile (gửi PDF kèm theo nếu người dùng xem trên điện thoại).
6. **Lưu lại**: `git add hop-dong-nguyen-tac/doi-tac hop-dong-nguyen-tac/ket-qua` (PDF đã được bỏ qua),
   commit "Hợp đồng nguyên tắc <số HĐ> – <đối tác>" rồi push lên nhánh của cuộc trò chuyện hiện tại.
7. **Tóm tắt ngắn**: số HĐ, ngày ký, các phụ lục (khóa – số lớp – tổng tiền nếu có), những ô còn để
   trống, và nhắc các điều khoản mặc định của phụ lục (thời gian – địa điểm, thanh toán) cần người dùng
   xác nhận nếu đây là lần đầu dùng với đối tác đó.

## Sửa mẫu
- Thông tin DAKO, điều khoản mặc định của phụ lục: sửa `hop-dong-nguyen-tac/cau-hinh-mac-dinh.json`.
- Câu chữ hợp đồng: sửa thẳng `hop-dong-nguyen-tac/mau/mau-hop-dong-nguyen-tac.docx` (giữ nguyên các
  trường `{{...}}`, chỉ đổi chữ trong `<w:t>`, không đổi định dạng), rồi tạo lại hợp đồng mẫu HKM để
  kiểm tra. Không chạy `tao_mau.py` sau khi đã sửa tay (nó dựng lại mẫu từ file gốc và ghi đè).
