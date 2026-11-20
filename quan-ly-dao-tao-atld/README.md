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

## Chức năng (bản 2.1)

Đào tạo ATVSLĐ không chịu thuế GTGT nên công cụ **không tính VAT**.

1. **Tổng quan** (dành cho giám đốc):
   - Chỉ tiêu theo tháng, quý hoặc năm: lớp học, học viên, doanh thu (hợp đồng đã ký), lợi nhuận, khách còn nợ, thù lao giảng viên còn phải trả, báo giá đang chờ, thẻ/GCN sắp hết hạn.
   - Lịch 14 ngày tới, biểu đồ doanh thu – lợi nhuận 12 tháng, thống kê theo vùng, khối lượng dạy và công nợ của từng giảng viên.
   - Mục **Cần chú ý** tự phát hiện: trùng lịch, lớp quá ngày, hợp đồng quá hạn thanh toán, còn nợ thù lao giảng viên, tạm ứng cần thu hồi, hợp đồng chưa có chi phí giảng viên, hoa hồng chưa chi, chứng chỉ giảng viên hết hạn, thẻ/GCN học viên sắp hết hạn (cơ hội huấn luyện định kỳ).
2. **Lịch giảng dạy**:
   - Lịch tháng: bấm vào ngày để lên lịch. Lọc theo vùng; danh sách giảng viên của vùng có trạng thái Rảnh/Bận; chặn trùng lịch.
   - Chế độ xem giảng viên × ngày.
   - Chế độ **Danh sách & lợi nhuận**: doanh thu lớp, thù lao giảng viên, hoa hồng phân bổ, chi phí khác, lợi nhuận và tỷ suất từng lớp.
3. **Giảng viên**:
   - Hồ sơ: ảnh 3×4, SĐT, ngày sinh, giới tính, CCCD (ngày cấp, nơi cấp), địa chỉ thường trú, vùng, chuyên ngành, nhóm được dạy, chứng chỉ, thù lao/ngày, số tài khoản và ngân hàng, MST cá nhân.
   - **Hợp đồng thỉnh giảng** theo mẫu chuẩn DAKO (Hợp đồng nguyên tắc + Phụ lục):
     - Nút “Tạo hợp đồng” (ở tab hoặc trong hồ sơ từng giảng viên): chọn giảng viên → nhập thông số (số HĐ tự đánh, ngày ký, thời hạn 1 năm / đến hết năm / 6 tháng / tùy chọn, số ngày thanh toán…) → xem lại toàn bộ hợp đồng như bản in → xuất file Word đúng mẫu.
     - Giảng viên đã có hợp đồng nguyên tắc còn hiệu lực thì tạo **phụ lục**: chọn các lớp trong lịch, đơn giá, thành tiền, hỗ trợ đi lại, thuế TNCN 10% (tự tính khi chi trả từ 2.000.000 đ), số thực nhận, số tiền bằng chữ. Phụ lục ghi luôn thù lao, thuế TNCN và số phụ lục vào các lớp.
     - Thêm giảng viên mới → công cụ hỏi lập hợp đồng nguyên tắc ngay.
     - Ô thông tin còn thiếu được đánh dấu; file in dòng chấm như mẫu để điền tay.
     - Chế độ **Hợp đồng**: sổ theo dõi số hợp đồng – phụ lục, tình trạng (chờ ký, còn hiệu lực, sắp hết hạn, đã thanh toán), file Word và bản đã ký; báo trùng số; danh sách giảng viên chưa có hợp đồng.
   - Chế độ **Thù lao & công nợ**: thù lao từng lớp, thuế TNCN khấu trừ, số phụ lục/hợp đồng và file, các lần tạm ứng/thanh toán, đã trả, còn phải trả.
4. **Học viên**:
   - Sổ cấp thẻ/GCN theo đợt. Tìm theo công ty, tên, số thẻ/GCN, CCCD hoặc số quyết định; lọc theo nhóm, loại giấy, tình trạng hạn, năm cấp.
   - Bấm vào học viên để xem hình thẻ/GCN, quyết định cấp, khóa học, lớp và hợp đồng liên quan.
5. **Quyết định** – theo dõi số quyết định hoàn thành khóa học dạng `STT/QĐ-N(1-6)-DAKO`:
   - Cấp số tiếp theo tự động (mặc định đánh số liên tục cả 6 nhóm trong năm; đổi sang “mỗi nhóm một dãy” trong Cài đặt), đánh lại từ 01 mỗi năm; chọn nhiều nhóm để cấp nhiều số liên tiếp.
   - Gắn với lớp học và đợt cấp thẻ/GCN: học viên của đợt hiện số quyết định theo nhóm.
   - Báo trùng số, số bị bỏ trống, quyết định chưa có file scan; đối chiếu số quyết định ghi trong sổ cấp mà chưa vào sổ theo dõi.
6. **Báo giá**: công ty khách hàng, giá theo bảng giá (dưới 30 HV/lớp: 5.000.000 đ; 30–60 HV/lớp: 8.000.000 đ, sửa được), file báo giá và file hợp đồng.
7. **Hợp đồng**: các công ty đã ký; giá trị, lớp đã dạy, khách đã thu, còn phải thu, hạn thanh toán, lợi nhuận.
8. **Doanh thu – Lợi nhuận**:
   - Doanh thu lấy từ hợp đồng đã ký, theo ngày ký.
   - Lợi nhuận = doanh thu – thù lao giảng viên – hoa hồng đại lý – hoa hồng cán bộ quản lý khách hàng (thuế DAKO khấu trừ mặc định 20%, sửa được; ví dụ 30 tr → thuế 5 tr, thực trả 25 tr) – chi phí khác (nút “Thêm chi phí khác”).
9. **Khách hàng**: lịch sử huấn luyện, thẻ/GCN đã cấp, doanh thu, công nợ, hạn huấn luyện định kỳ.
10. **Cài đặt**: bảng giá, thuế và cách tính thuế hoa hồng, thông tin công ty (báo cáo và Bên A trong hợp đồng: MST, tài khoản, người đại diện, nơi ký), mẫu số hợp đồng – phụ lục – quyết định, thuế TNCN, vùng đào tạo, giờ học và hiệu lực theo nhóm, chuyên ngành, sao lưu / khôi phục.

**Xuất Excel**:
- Mỗi tab có nút Xuất Excel. Chọn **Tuần / Tháng / Quý / Năm** là “từ ngày – đến ngày” tự nhảy theo kỳ hiện tại; nút ‹ › để lùi/tiến kỳ. Chỉ khi tự chọn ngày trên lịch mới chuyển sang “Tùy chọn”.
- Phần chi tiết tự cộng theo kỳ nhỏ hơn (tuần → từng ngày, tháng → từng tuần, quý/năm → từng tháng), đổi được.
- File sẵn in khổ A4: logo và thông tin DAKO, tiêu đề, font Times New Roman, số dạng `1.000.000 đ` (dấu chấm phần nghìn trên mọi máy).
- Gồm phần tổng hợp theo kỳ, phần chi tiết có dòng cộng từng kỳ, dòng tổng cộng và khối ký Người lập biểu / Giám đốc.
- Xuất từ tab Tổng quan ra một file tổng hợp, mỗi tab một sheet (có thêm sổ hợp đồng giảng viên và sổ quyết định).

**Xem file**: PDF, ảnh, Word (.docx – hiển thị như trang in), Excel mở được ngay trong trang. Ô nào chưa có dữ liệu đều có gợi ý cần nhập gì.

## Mã nguồn

```
src/page.html   khung trang
src/styles.css  giao diện (màu theo logo DAKO)
src/core.js     quy định nghiệp vụ: bảng giá, nhóm huấn luyện, trùng lịch, cảnh báo
src/finance.js  doanh thu, thù lao giảng viên, hoa hồng & thuế, lợi nhuận, kỳ báo cáo, học viên
src/store.js    lưu trữ: bản dùng chung (claude.ai), bản ngoại tuyến (IndexedDB), dữ liệu mẫu
src/ui.js       hộp thoại, tải file, trình xem PDF/Word/Excel, biểu đồ
src/hdgv_tpl.js mẫu hợp đồng giảng viên đã gắn ô dữ liệu (tạo bằng tools/hdgv_template.py)
src/contracts.js hợp đồng giảng viên: đánh số, điền mẫu Word, trình tạo 3 bước, sổ hợp đồng
src/decisions.js tab Quyết định (số quyết định hoàn thành khóa học)
src/views.js    các tab
src/students.js tab Học viên (sổ cấp thẻ/GCN)
src/export.js   xuất Excel chuyên nghiệp (ExcelJS)
src/forms.js    biểu mẫu và màn hình chi tiết
src/demo.js     dữ liệu mẫu
src/main.js     khởi động, điều hướng, xuất Excel, sao lưu
build.py        ghép thành DAKO_Quan-ly-huan-luyen-ATVSLD.html
templates/      mẫu hợp đồng gốc anh gửi (.docx)
tools/hdgv_template.py  gắn ô dữ liệu vào mẫu hợp đồng → src/hdgv_tpl.js
```

Khi đổi mẫu hợp đồng: thay file trong `templates/`, sửa bảng `SPECS` trong `tools/hdgv_template.py` nếu câu chữ khác, chạy `python3 -I tools/hdgv_template.py` rồi `python3 build.py`.

Sau khi sửa mã trong `src/`, chạy `python3 build.py` để tạo lại file HTML.

## Nhờ Claude cập nhật dữ liệu

Anh gửi file (danh sách giảng viên, ảnh, báo giá, hợp đồng, chứng từ thanh toán) kèm câu "cập nhật vào công cụ". Claude sẽ nhập thẳng vào trang dùng chung, tải file lên, ghi nhật ký và báo lại những chỗ cần anh xem. Lịch dạy chỉ được xếp khi anh nêu cụ thể ngày, giờ, giảng viên, khách hàng. Bản ghi do Claude nhập có dòng "nhập qua Claude"; khi anh sửa lại trên trang thì dòng này mất. Quy trình chi tiết ở `.claude/skills/cap-nhat-huan-luyen-atld/SKILL.md`.
