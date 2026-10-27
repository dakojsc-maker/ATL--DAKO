# Hồ sơ thẩm định UMT

Báo cáo thẩm định sơ bộ (desktop due diligence) về Trường Đại học Quản lý và Công nghệ TP.HCM (UMT), lập cho nhà đầu tư Hàn Quốc. Dữ liệu cập nhật đến 27/10/2026.

## Phiên bản

| Phiên bản | Tệp | Ghi chú |
| --- | --- | --- |
| **2.0 (hiện hành)** | `UMT_Bao-cao-tham-dinh_v2.docx` | Word, 63 trang A4. Chuẩn hoá theo Báo cáo công khai 16/2026/BC-UMT, tờ rơi tuyển sinh 2026 và bản ghi màn hình website; 39 ảnh và ảnh chụp màn hình của trường, 10 biểu đồ và sơ đồ, 44 bảng, 82 nguồn |
| 2.0 | `UMT_Bao-cao-tham-dinh_v2_xem-truoc.pdf` | Bản PDF xuất từ chính tệp DOCX để xem nhanh |
| 1.0 (đã thay thế) | `UMT_Ho-so-tham-dinh.html`, `UMT_Ho-so-tham-dinh.pdf` | Dựa trên nguồn công khai qua chỉ mục tìm kiếm, chưa có ảnh. Nhiều số liệu đã được đính chính ở bản 2.0 (Bảng 2.2 của bản 2.0) |

## Bản 2.0

Định dạng theo yêu cầu: Times New Roman 13 cho thân bài; tiêu đề 17 / 14,5 / 13,5 pt; bảng 10–11 pt; khổ A4; lề trái 3 cm, lề trên, phải, dưới 2 cm; đánh số trang “Trang x / y” ở chân trang; mục lục là trường TOC của Word (nhấp chuột phải → *Update Field* nếu cần cập nhật).

Những thay đổi chính so với bản 1.0:

- Chủ sở hữu: CTCP Tập đoàn Đầu tư và Phát triển Giáo dục UMT (bản 1.0 ghi Kiến Á).
- Đất 71.854 m² cơ sở chính, 74.241,8 m² cả 3 cơ sở (bản 1.0: 80.092 m²); sàn 22.369,03 m², sàn đào tạo 13.684,54 m².
- 727 người học (31/5/2026); 182 giảng viên toàn thời gian, 23,17% tiến sĩ.
- Thu chi 2024–2025 chính thức: thu 85,06 tỷ đồng (63,5% là hỗ trợ của nhà đầu tư), chi 80,66 tỷ đồng, chênh lệch 4,40 tỷ đồng.
- Mức đáp ứng 14 chỉ số chuẩn; ký túc xá, sân thể thao, thư viện; chưa có liên kết đào tạo, chưa kiểm định.
- Ảnh cơ sở vật chất, đội ngũ, sinh viên lấy từ tờ rơi; ảnh chụp màn hình website lấy từ video; mỗi ảnh ghi nguồn. Phụ lục A đối chiếu các điểm khác nhau giữa các nguồn của UMT.

### Dựng lại bản 2.0

Mã nguồn trong `docx-src/`:

| Thư mục, tệp | Nội dung |
| --- | --- |
| `tools/content1.js`, `content2.js`, `content3.js` | Nội dung báo cáo; trích dẫn ghi `[[khóa-nguồn]]`, tham chiếu hình, bảng ghi `{fig:khóa}`, `{tab:khóa}` |
| `tools/refs.json` | Danh mục nguồn |
| `tools/build_docx.js` | Dựng DOCX bằng thư viện `docx` (Node) |
| `tools/postprocess.py` | Thêm trường mục lục, kiểm soát dòng mồ côi |
| `tools/pipeline.sh`, `findpages.py` | Dựng, xuất PDF bằng LibreOffice, dò số trang cho mục lục |
| `tools/charts.py`, `html/org.html` + `tools/shot.js` | Vẽ biểu đồ và sơ đồ tổ chức |
| `ready/`, `fig/`, `charts/` | Ảnh cắt từ tờ rơi, ảnh màn hình website, biểu đồ |

```bash
cd docx-src
bash tools/pipeline.sh "$PWD" UMT_v2          # lần 1: dò số trang
cp tools/toc_found.json tools/toc_pages.json
bash tools/pipeline.sh "$PWD" UMT_v2          # lần 2: mục lục có số trang → out/UMT_v2.docx
```

Ảnh màn hình website (`fig/web_*.jpg`) được ghép từ khung hình của video khách hàng cung cấp bằng `tools/montage.py`; video không lưu trong kho mã.

## Bản 1.0

| Tệp | Dùng để |
| --- | --- |
| `UMT_Ho-so-tham-dinh.html`, `.pdf` | Bản đọc trên trình duyệt và bản A4 (37 trang) |
| `src/report.template.html`, `build.py`, `pdf.js` | Nội dung, dựng trang, xuất PDF (`python3 build.py`, `node pdf.js`) |

## Nguồn và giới hạn

- Nguồn chia ba tầng: A (tài liệu của UMT, cổng thông tin Chính phủ, văn bản pháp luật), B (báo chí chính thống, dịch vụ thông tin pháp lý), C (trang tổng hợp, chỉ dùng đối chiếu). Phép tính và nhận định của đơn vị tư vấn nằm trong khung “Phân tích”.
- Môi trường nghiên cứu không truy cập trực tiếp được umt.edu.vn; nội dung website lấy từ video ghi màn hình ngày 27/10/2026.
- Báo cáo công khai không phải báo cáo tài chính kiểm toán; UMT chưa công bố thang lương. Ảnh do Trường công bố không thay thế khảo sát hiện trường (mục 17.2 của bản 2.0).
