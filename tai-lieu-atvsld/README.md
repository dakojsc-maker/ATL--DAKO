# Tài liệu ATVSLĐ gửi doanh nghiệp

Bộ tài liệu tham khảo theo ngành, gửi trước cho doanh nghiệp hoặc người phụ trách để họ nắm các nhóm huấn luyện
an toàn, vệ sinh lao động (ATVSLĐ) trong lĩnh vực của mình. Mỗi tài liệu là bản rút gọn của cẩm nang tư vấn cùng số
(bản cho nhân viên kinh doanh, lưu hành nội bộ).

**Chuẩn trình bày và nội dung: [CHUAN.md](CHUAN.md).** Bản chuẩn là tài liệu 01 Xây dựng do người dùng chỉnh trên Word.

## Danh sách

| Số | Ngành | File |
|---|---|---|
| 01 | Xây dựng | `01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 02 | Thực phẩm – Thủy sản | `02_ThucPhamThuySan_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 03 | Điện – Điện tử | `03_DienDienTu_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 04 | Cơ khí – Chế tạo | `04_CoKhiCheTao_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 05 | May mặc – Da giày | `05_MayMacDaGiay_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 06 | Văn phòng – Dịch vụ – Tài chính | `06_VanPhongDichVuTaiChinh_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 07 | Vật liệu xây dựng | `07_VatLieuXayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 08 | Khách sạn – Du lịch | `08_KhachSanDuLich_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 09 | Nhựa – Cao su – Hóa chất | `09_NhuaCaoSuHoaChat_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |
| 10 | Nông nghiệp – Nuôi trồng | `10_NongNghiepNuoiTrong_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` / `.pdf` (10 trang) |

## Cấu trúc thư mục

| Đường dẫn | Nội dung |
|---|---|
| `khung/khung_tai_lieu.js` | Khung định dạng và bố cục chuẩn (bìa, mục 1–7, đầu và chân trang) |
| `khung/noi_dung_chung.js` | Nội dung dùng chung: thời gian 6 nhóm, căn cứ pháp lý chung, tình trạng pháp lý, chân trang |
| `nganh/NN_<ten_nganh>.js` | Chữ của từng ngành, theo đúng các phần của khung |
| `build.js` | Dựng file Word (và PDF) cho một ngành |

## Dựng file

```bash
node tai-lieu-atvsld/build.js 02 --pdf
```

Cần gói npm `docx`; `--pdf` cần LibreOffice. Thêm `--out <thư mục>` để dựng thử mà không ghi đè bản chính.
Bản 01 hiện có trong thư mục là bản người dùng chỉnh trên Word; dựng lại 01 chỉ khi cần sửa nội dung.

## Lưu ý pháp lý

- Thông tin pháp lý lấy theo cẩm nang gốc của từng ngành (01: kiểm tra đến 15/10/2026; 02, 03, 05, 06 và 07: đến 16/10/2026; 04, 08, 09 và 10: đến 17/10/2026). Khi Luật sửa đổi, bổ sung Luật ATVSLĐ hoặc văn bản
  hướng dẫn mới có hiệu lực, cập nhật `khung/noi_dung_chung.js` và dựng lại các tài liệu.
- Tài liệu 03 ghi Thông tư 05/2021/TT-BCT (an toàn điện) đã được Thông tư 02/2025/TT-BCT thay thế từ 01/02/2025, theo
  cẩm nang ngành. Bộ Công Thương đang dự thảo văn bản thay thế Nghị định 62/2025/NĐ-CP và Thông tư 02/2025/TT-BCT: khi
  có văn bản mới, sửa `nganh/03_dien_dien_tu.js` và dựng lại.
- Tài liệu 04 ghi Nghị quyết 66.18/2026/NQ-CP (cơ chế tạm thời từ 01/7/2026 đến hết 28/02/2027). Sau ngày 28/02/2027,
  bỏ dòng này ở mục 7 của `nganh/04_co_khi_che_tao.js` hoặc cập nhật theo văn bản mới, rồi dựng lại.
- Mục 4 không ghi số hiệu văn bản cho dịch vụ bổ sung (an toàn điện, sơ cấp cứu, hóa chất). Nếu muốn ghi, rà lại hiệu
  lực trước, vì Luật Điện lực và Luật Hóa chất đều đã có luật mới.
