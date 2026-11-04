# Heragrain Cacao — bộ sản phẩm cho dòng ca cao (sản phẩm đầu tiên của HTX Heragrain)

Ca cao thô (hạt rang, nibs) và chế biến sâu (socola, bột ca cao, bơ ca cao, socola mix vị) tại xưởng cũ của HTX, Đắk Lắk.
Nối tiếp các phiên trước: trang e-commerce Heragrain, sơ đồ 3D và tham quan 360° nhà máy (nhánh `claude/ecstatic-lovelace-lznmn0`),
Kho Mẫu Slide DAKO (nhánh `claude/festive-ride-bpliki`, mẫu M07 vốn dựng cho Heragrain và M08).

| # | Sản phẩm | File |
|---|---|---|
| 1 | **5 concept sản phẩm ca cao Đắk Lắk** (26 slide; 2 slide nhóm sản phẩm I, II và slide nhận diện thương hiệu dùng ảnh concept HTX cung cấp; mẫu M07 Nông sản: băng chuyền sản phẩm trượt bằng Morph, bao bì cửa sổ chữ H) | `1-concept-san-pham/Heragrain-Cacao_5-concept-san-pham.pptx` |
| 2 | **Bức tranh tổng quan**: 6 sản phẩm, bộ máy, quy trình ca cao thô và chế biến sâu, giấy chứng nhận, nhân sự theo 4 giai đoạn, thương hiệu và kênh bán (30 slide, mẫu M08 Hồ sơ doanh nghiệp, màu Heragrain) | `2-tong-quan-bo-may/Heragrain-Cacao_Tong-quan-bo-may-quy-trinh-chung-nhan.pptx` |
| 3 | **Sơ đồ 3D xưởng cũ bố trí cho ca cao** (24 khu, 11 bước, 4 giai đoạn) | `3-so-do-3d/ban-gui/Xuong-ca-cao-Heragrain-3D.html` |
| 4 | **Tham quan 360°** xưởng ca cao (12 điểm) | `4-tham-quan-360/ban-gui/Xuong-ca-cao-Heragrain-360.html` |
| 5 | **Hồ sơ pháp lý**: văn bản hiện hành, thủ tục, nơi nộp, cơ quan cấp, 9 biểu mẫu soạn sẵn, bảng 6 sản phẩm kèm ảnh và hồ sơ áp dụng (30 trang) | `5-phap-ly/Heragrain-Cacao_Ho-so-phap-ly-van-ban-bieu-mau.docx` |

Bản xem trực tuyến (riêng tư, chia sẻ từ nút Share): sơ đồ 3D https://claude.ai/artifact/R9o6aPkah58nCUcx4ZhDYE · tham quan 360° https://claude.ai/artifact/5HJFi9bPLoLXXzxPkqTFx6

## 6 sản phẩm theo giai đoạn chế biến

| Nhóm | Sản phẩm | Giai đoạn | Concept |
|---|---|---|---|
| I. Sơ chế, nguyên liệu đầu vào | 1. Hạt ca cao lên men, phơi khô · 2. Hạt ca cao rang · 3. Nhân ca cao (nibs) | GĐ1 | Bazan Origin |
| II. Chế biến sâu | 4. Socola | GĐ2 | Đại Ngàn 70, Tây Nguyên Fusion |
| II. Chế biến sâu | 5. Bột ca cao · 6. Bơ ca cao | GĐ3 | Cacao Thuần |

Ảnh 6 sản phẩm, hộp quà, kệ trưng bày, website, Facebook, hồ sơ năng lực, catalogue B2B và logo Heragrain Foods lấy từ hai
ảnh concept HTX cung cấp (`slides/anh/concept/`: `6-san-pham-heragrain-foods.png`, `bang-concept-heragrain-foods.png`); đây là
ảnh dựng, chưa phải ảnh chụp sản phẩm. Logo Heragrain Foods thay biểu tượng chữ trên mọi slide của hai bộ. Dấu “100% Tự nhiên”
trên bao bì concept chỉ in khi có kết quả kiểm nghiệm và đối chiếu quy định nhãn (file Word mục 4.4).

## 5 concept

1. **Bazan Origin** — hạt rang, nibs truy xuất đến vườn (hàng thô B2B, túi bán lẻ, hộp mẫu 3 vùng). GĐ1.
2. **Đại Ngàn 70** — socola đen single origin 70 %, 80 %, 100 %. GĐ2.
3. **Cacao Thuần** — bột ca cao nguyên chất, bơ ca cao thực phẩm. GĐ3.
4. **Tây Nguyên Fusion** — socola cà phê Robusta, tiêu, mắc ca; trái cây sấy Heragrain bọc socola. GĐ4.
5. **Quà Đại Ngàn** — hộp quà và trà vỏ ca cao (tận dụng vỏ lụa). GĐ4.

## Bốn giai đoạn

| GĐ | Thời gian | Dòng sản phẩm | Nhân sự | Chứng nhận chính |
|---|---|---|---|---|
| 1 | Q1–Q2/2027 | Hàng thô: hạt rang, nibs | 9–10 | Ngành nghề HTX, GCN ATTP, tự công bố, GS1, nhãn hiệu, môi trường, PCCC |
| 2 | Q3–Q4/2027 | Socola | 15–17 | Tự công bố socola, nhãn NĐ 37/2026, bắt đầu HACCP |
| 3 | Q1–Q2/2028 | Bột, bơ ca cao | 18–22 | HACCP hoặc ISO 22000 |
| 4 | Từ Q3/2028 | Mix vị, xuất khẩu | 24–30 | FSSC 22000/BRCGS, EUDR, GACC, C/O |

## Dựng lại

- Slide: `slides/build_concept.py`, `slides/build_tongquan.py` dùng Kho Mẫu Slide DAKO. Lấy kho mẫu một lần:
  `git worktree add _tpl origin/claude/festive-ride-bpliki` (hoặc đặt `SLIDES_TEMPLATE=<đường dẫn slides-template>`), cài
  môi trường `bash _tpl/slides-template/tools/setup_env.sh`, rồi `python3 slides/build_concept.py`. Bao bì minh họa:
  `slides/cacao_assets.py`; ảnh Open Images (CC BY 2.0) và ảnh chụp mô hình: `slides/anh/`.
- 3D, 360: sửa `3-so-do-3d/du-lieu.js`, `4-tham-quan-360/diem-360.js`, chạy `python3 xuat-html.py` trong từng thư mục.
- Word: `cd 5-phap-ly && node tao_word.js`.

## Lưu ý

Báo cáo rà soát nguồn (25 lỗi đã sửa, nội dung giữ nguyên, nhận xét đầu tư, việc cần làm): `BAO-CAO-RA-SOAT.md`.
Mỗi bộ slide và file Word có thêm phần "Mức độ căn cứ" tách quy định đã kiểm chứng khỏi đề xuất, ước tính.

Số liệu nhân sự, mốc thời gian, cỡ máy, tên sản phẩm là đề xuất của tư vấn. Kích thước xưởng ước theo ảnh vẽ tay.
Quy định cập nhật đến 04/11/2026: Nghị định 15/2018 đang áp dụng (Nghị định 46/2026 tạm ngưng), Luật An toàn thực phẩm
sửa đổi đang trình Quốc hội; xác nhận lại với cơ quan cấp phép khi nộp hồ sơ (mục 8 của file Word).
