# Tài liệu ATVSLĐ gửi doanh nghiệp

Bộ tài liệu tham khảo theo ngành, gửi trước cho doanh nghiệp hoặc người phụ trách để họ nắm các nhóm huấn luyện
an toàn, vệ sinh lao động (ATVSLĐ) trong lĩnh vực của mình. Mỗi tài liệu là bản rút gọn của cẩm nang tư vấn cùng số
(bản cho nhân viên kinh doanh, lưu hành nội bộ).

**Chuẩn trình bày và nội dung: [CHUAN.md](CHUAN.md).** Bản chuẩn là tài liệu 01 Xây dựng do người dùng chỉnh trên Word.

## Danh sách

| Số | Ngành | File |
|---|---|---|
| 01 | Xây dựng | `01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |

## Cấu trúc thư mục

| Đường dẫn | Nội dung |
|---|---|
| `khung/khung_tai_lieu.js` | Khung định dạng và bố cục chuẩn (bìa, mục 1–7, đầu và chân trang) |
| `khung/noi_dung_chung.js` | Nội dung dùng chung: thời gian 6 nhóm, căn cứ pháp lý chung, tình trạng pháp lý, chân trang |
| `nganh/NN_<ten_nganh>.js` | Chữ của từng ngành, theo đúng các phần của khung |
| `build.js` | Dựng file Word (và PDF) cho một ngành |

## Dựng file

```bash
node tai-lieu-atvsld/build.js 01 --pdf
```

Cần gói npm `docx`; `--pdf` cần LibreOffice. Thêm `--out <thư mục>` để dựng thử mà không ghi đè bản chính.
Bản 01 hiện có trong thư mục là bản người dùng chỉnh trên Word; dựng lại 01 chỉ khi cần sửa nội dung.

## Lưu ý pháp lý

- Thông tin pháp lý lấy theo cẩm nang gốc (kiểm tra đến 15/10/2026). Khi Luật sửa đổi, bổ sung Luật ATVSLĐ hoặc văn bản
  hướng dẫn mới có hiệu lực, cập nhật `khung/noi_dung_chung.js` và dựng lại các tài liệu.
- Mục 4 không ghi số hiệu văn bản cho dịch vụ bổ sung (an toàn điện, sơ cấp cứu, hóa chất). Nếu muốn ghi, rà lại hiệu
  lực trước, vì Luật Điện lực và Luật Hóa chất đều đã có luật mới.
