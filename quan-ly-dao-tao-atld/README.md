# Quản lý Huấn luyện ATVSLĐ – DAKO

Công cụ trên trình duyệt để quản lý hoạt động huấn luyện an toàn, vệ sinh lao động của Công ty Cổ phần Kỹ thuật Hàng hải DAKO.

## Hai cách dùng

| | Bản dùng chung (khuyên dùng) | Bản ngoại tuyến |
|---|---|---|
| Mở bằng | Link claude.ai được chia sẻ | File `DAKO_Quan-ly-huan-luyen-ATVSLD.html` (mở bằng Chrome/Edge) |
| Dữ liệu, file | Lưu trên hệ thống, ai được chia sẻ cũng thấy ngay | Lưu trong trình duyệt của máy đang mở |
| Phân quyền | Người quản lý sửa, giám đốc xem | Ai mở file cũng sửa được |
| Chuyển dữ liệu | Cài đặt → Sao lưu / Khôi phục (file `.json`, kèm file đính kèm) | Như bên trái |

**Phân quyền trên bản dùng chung** (nút *Share* của trang):
- Người quản lý công cụ: chủ sở hữu hoặc được mời quyền **Chỉnh sửa (Editor)** → thêm/sửa mọi thứ, tải file lên.
- Giám đốc và các bộ phận: mời quyền **Xem (Viewer)** → xem toàn bộ lịch, chi phí, báo cáo, mở mọi file báo giá – hợp đồng; không sửa được.

## Chức năng

1. **Tổng quan** (dành cho giám đốc): số lớp, học viên, doanh thu, lợi nhuận gộp, hợp đồng ký mới, còn phải thu, báo giá đang chờ; lịch 14 ngày tới; biểu đồ doanh thu 12 tháng; thống kê theo vùng; khối lượng dạy của từng giảng viên; mục **Cần chú ý** tự phát hiện:
   - giảng viên bị trùng lịch, lớp chưa có giảng viên, lớp đã qua ngày mà chưa cập nhật;
   - lớp đã dạy nhưng chưa có hợp đồng, hợp đồng quá hạn thanh toán, hợp đồng chưa tải file;
   - báo giá quá 7 ngày chưa có kết quả, khách đồng ý nhưng chưa ký;
   - chứng chỉ giảng viên sắp/đã hết hạn;
   - khách hàng sắp đến hạn huấn luyện định kỳ (cơ hội gửi báo giá).
2. **Lịch giảng dạy**
   - Lịch tháng: bấm vào một ngày để lên lịch lớp (giảng viên, giờ, địa điểm, số học viên, chi phí…).
   - Chọn vùng (Miền Nam – TP.HCM, Miền Trung – Tây Nguyên – Nha Trang, Miền Bắc – Hà Nội) để lọc lớp và hiện danh sách giảng viên của vùng, kèm trạng thái **Rảnh / Bận** của ngày đang chọn.
   - Khi lên lịch, danh sách giảng viên báo ai đã có lịch trùng; không lưu được nếu trùng, trừ khi tick “Vẫn lưu dù trùng lịch”.
   - Xem **Theo giảng viên** (bảng giảng viên × ngày trong tháng) để sắp xếp không chồng lịch.
   - Xem **Danh sách**: doanh thu, chi phí, lãi gộp từng lớp, tổng tháng; nút xem nhanh báo giá (BG) và hợp đồng (HĐ).
3. **Giảng viên**: ảnh 3×4 (tải lên), SĐT, email, vùng chính và vùng hỗ trợ, chuyên ngành, nhóm được dạy, trình độ, chứng chỉ và hạn, thù lao/ngày, hồ sơ đính kèm (CV, bằng cấp); lịch sắp tới và lịch sử dạy.
4. **Tính chi phí**: giá tự lấy theo bảng giá (dưới 30 HV/lớp: 5.000.000 đ; 30–60 HV/lớp: 8.000.000 đ, chưa VAT). Giá sửa tay được, có đánh dấu “Giá điều chỉnh”. Thù lao giảng viên tự tính theo thù lao/ngày × số ngày. Có thêm đi lại – lưu trú, chi phí khác → lãi gộp và biên lợi nhuận.
5. **Báo giá**: tên công ty khách hàng (tự gợi ý khách đã có), số báo giá tự đánh `BG-năm-số`, nhóm, số học viên, số lớp, giá trị, trạng thái; tải file báo giá và file hợp đồng.
6. **Hợp đồng**: các công ty đã ký; giá trị, số lớp đã dạy, ghi nhận các lần thu tiền, còn phải thu, hạn thanh toán, tình trạng.
7. **Khách hàng**: lịch sử huấn luyện từng công ty, hạn huấn luyện định kỳ theo từng nhóm.
8. **Cài đặt**: bảng giá, VAT, vùng đào tạo, số giờ và chu kỳ định kỳ theo nhóm, danh mục chuyên ngành; xuất Excel tổng hợp; sao lưu / khôi phục.

**Xem file**: PDF, ảnh, Word (.docx), Excel (.xlsx, .xls, .csv) mở được ngay trong trang. File .doc cũ và file nén phải tải về máy để mở. Báo giá và hợp đồng nên lưu dạng PDF để ai cũng xem được ngay.

**Xem thử**: nút “Xem thử với dữ liệu mẫu” cho xem tất cả chức năng với số liệu minh họa. Dữ liệu mẫu chỉ hiện trên máy người bấm, không lưu.

## Mã nguồn

```
src/page.html   khung trang
src/styles.css  giao diện (màu theo logo DAKO)
src/core.js     quy định nghiệp vụ: bảng giá, nhóm huấn luyện, trùng lịch, công nợ, cảnh báo
src/store.js    lưu trữ: bản dùng chung (claude.ai), bản ngoại tuyến (IndexedDB), dữ liệu mẫu
src/ui.js       hộp thoại, tải file, trình xem PDF/Word/Excel, biểu đồ
src/views.js    các tab
src/forms.js    biểu mẫu và màn hình chi tiết
src/demo.js     dữ liệu mẫu
src/main.js     khởi động, điều hướng, xuất Excel, sao lưu
build.py        ghép thành DAKO_Quan-ly-huan-luyen-ATVSLD.html
```

Sau khi sửa mã trong `src/`, chạy `python3 build.py` để tạo lại file HTML.

## Nhờ Claude cập nhật dữ liệu

Anh gửi file (danh sách giảng viên, ảnh, báo giá, hợp đồng, chứng từ thanh toán) kèm câu "cập nhật vào công cụ". Claude sẽ nhập thẳng vào trang dùng chung, tải file lên, ghi nhật ký và báo lại những chỗ cần anh xem. Lịch dạy chỉ được xếp khi anh nêu cụ thể ngày, giờ, giảng viên, khách hàng. Bản ghi do Claude nhập có dòng "nhập qua Claude"; khi anh sửa lại trên trang thì dòng này mất. Quy trình chi tiết ở `.claude/skills/cap-nhat-huan-luyen-atld/SKILL.md`.
