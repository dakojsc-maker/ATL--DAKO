# Kho Mẫu Slide DAKO

Thư viện mẫu PowerPoint dựng bằng mã (python-pptx): mỗi mẫu có mã riêng, ảnh xem trước và file nội dung mẫu, để làm
bộ slide mới chỉ cần đưa tài liệu vào.

- **Trang thư viện (xem trước, sao chép câu gọi):** https://claude.ai/artifact/JmoetKFXwLHYifaeGuBUih
- **Danh sách trong kho:** [`catalog/CATALOG.md`](catalog/CATALOG.md) — nguồn dữ liệu: `catalog/templates.json`
- **Cách gọi:** trong Claude Code của kho này gõ, ví dụ, `Dùng mẫu M03 · Di sản Hội An để làm bộ slide từ tài liệu tôi
  gửi kèm` và đính kèm tài liệu. Quy trình chi tiết cho Claude nằm ở `CLAUDE.md` (gốc kho).

| Mã | Mẫu | File | Dựng |
|---|---|---|---|
| M01 | Báo cáo Xanh Lime — rêu đậm + lime | `output/Mau-Bao-Cao-Lime.pptx` | `python build_deck.py --theme lime` |
| M02 | Báo cáo Aurora — navy + aqua | `output/Mau-Bao-Cao-Aurora.pptx` | `python build_deck.py --theme aurora` |
| M03 | Di sản Hội An — cổ điển, giấy cổ, vàng kim | `output/Mau-Bao-Cao-HoiAn.pptx` | `python build_hoian.py` |
| M04 | Chính luận Mác – Lênin — lụa đỏ, vàng kim, huân chương | `output/Mau-Chinh-Luan-MacLenin.pptx` | `python build_maclenin.py` |
| M05 | Lao động – Việc làm — ảnh công nhân, giấy kem – cam, bản đồ 6 vùng | `output/Mau-Lao-Dong-Viec-Lam.pptx` | `python build_laodong.py` |

Làm bộ slide từ file nội dung: `python <builder> --content decks/<ten>/content.json --out decks/<ten> --name <Ten-File>`
(mẫu nội dung trong `catalog/samples/`). Thêm mẫu mới xong thì chạy `python tools/update_catalog.py` và đăng lại trang thư viện.
Container mới: `bash tools/setup_env.sh`.

Mở bằng **PowerPoint 2019 / Microsoft 365** để có Morph. Bản cũ hơn sẽ tự động dùng Fade thay cho Morph.
Cài font trong `fonts/` (M01/M02: Montserrat), `fonts/heritage/` (M03: Noto Serif Display, Noto Serif, Playfair Display)
`fonts/maclenin/` (M04: Big Shoulders Display, Be Vietnam Pro) và `fonts/laodong/` (M05: Anton, Lexend) trước khi mở (Windows: chuột phải → Install for all users).

---

## M01 / M02 — Báo cáo Xanh Lime / Aurora

## Danh sách slide

| # | Slide | Nội dung / bố cục |
|---|---|---|
| 1 | Bìa | Người tách nền bật khỏi khung ảnh, chip số liệu, thông tin GVHD / nhóm / thời gian |
| 2 | Mục lục | Tiêu đề chữ viền, 7 mục đánh số, panel ảnh với chữ dọc |
| 3, 8, 15, 20, 26, 28, 30 | Chuyển phần | Nền tối, số phần cỡ lớn; Morph làm số trượt và thu nhỏ vào breadcrumb của slide sau |
| 4 | Tổng quan đề tài | 3 lý do + khảm 3 ảnh |
| 5 | Mục tiêu nghiên cứu | Mục tiêu tổng quát + ảnh, thẻ tối liệt kê mục tiêu cụ thể, ghim |
| 6 | Đối tượng & phạm vi | 3 nhóm đối tượng có ảnh chân dung, 2 thẻ phạm vi |
| 7 | Phương pháp nghiên cứu | Ảnh + 3 thẻ icon |
| 9 | Mục tiêu chiến lược | Bảng phi tiêu tách nền + quầng sáng + thẻ chú thích |
| 10 | Quy trình 3 bước | Vòng tròn số lớn + mũi tên cong |
| 11 | Ma trận năng lực | Lưới 2×2 + 4 ghi chú |
| 12 | Kim tự tháp 5 cấp | Kim tự tháp vẽ bằng shape + chú thích |
| 13 | Hệ sinh thái | Hub trung tâm + 6 vệ tinh |
| 14 | Lộ trình 7 bước | Mũi tên chevron + timeline + thanh tóm tắt |
| 16 | Biểu đồ cột | KPI + biểu đồ cột nhóm (native, sửa được số liệu) |
| 17 | Biểu đồ thanh ngang | So sánh 2 năm + 3 thẻ KPI |
| 18 | Biểu đồ đường | Xu hướng 3 chuỗi + thẻ số nổi bật |
| 19 | Biểu đồ tròn | Doughnut + chú giải có tỷ lệ |
| 21 | 4 chỉ số nổi bật | Thẻ số liệu kèm ảnh |
| 22 | Khảm kết quả | Tiêu đề lớn + lưới thẻ số liệu và ảnh |
| 23 | Mức độ hài lòng | Nền tối, ảnh + 4 thẻ |
| 24 | Bảng số liệu | Bảng native + thanh tiến độ |
| 25 | Ảnh thực tế | Ảnh polaroid xoay nghiêng trên nền ảnh làm mờ |
| 27 | SWOT | 4 thẻ S-W-O-T với chữ nền lớn |
| 29 | Dashboard | Biểu đồ đường, vùng, cột + 2 KPI |
| 31 | Kết luận | 3 thẻ kết luận kèm số liệu then chốt |
| 32 | Kiến nghị | Ảnh toàn màn hình + trích dẫn + thẻ kính mờ |
| 33 | Cảm ơn | Hai người tách nền, liên hệ |
| 34 | Nguồn ảnh | Slide ẩn, ghi công tác giả ảnh |

## Hiệu ứng

- **Transitions:** Morph (1,0–1,4 giây) cho mọi slide. Các đối tượng tên bắt đầu bằng `!!` (quầng sáng, số phần,
  ảnh hero) được Morph ghép cặp giữa các slide nên sẽ trôi, phóng to hoặc thu nhỏ liên tục.
- **Animations:** hiệu ứng xuất hiện tự chạy sau transition, lệch thời gian theo thứ tự đọc: Wipe cho tiêu đề,
  Float In cho khối chữ, Zoom cho thẻ và ảnh, Fly In cho panel bên, Wheel cho biểu đồ tròn, Wipe Up cho biểu đồ cột.
  Mở **Animations → Animation Pane** để chỉnh.

## Thay nội dung

Có hai cách:

1. **Sửa trực tiếp trong PowerPoint.** Mọi thành phần đều là shape, text box, biểu đồ và bảng gốc của PowerPoint.
   Với biểu đồ: chuột phải → *Edit Data*.
2. **Dựng lại bằng script.** Sửa hàm `build_content()` trong `build_deck.py` rồi chạy:

```bash
pip install python-pptx pillow numpy cairosvg opencv-python-headless
python build_deck.py                 # tạo cả 2 bảng màu
python build_deck.py --theme lime    # chỉ tạo 1 bảng màu
```

## Hình ảnh

- Ảnh gốc: `assets/images/src/` lấy từ bộ dữ liệu Open Images (Google), giấy phép **CC BY 2.0** của các tác giả trên Flickr.
  Danh sách tác giả ở `assets/images/credits.csv` và slide ẩn cuối bộ.
- Ảnh tách nền: `assets/images/cut/*.png`, tách bằng mô hình ISNet (`lib/imgproc.py`: `cutout()` có guided-filter
  làm mịn viền tóc và khử viền màu nền).
- Ảnh làm mờ, ảnh phủ màu theo bảng màu và ảnh kính mờ được `build_deck.py` tạo tự động vào `assets/images/build/`.
- Icon: Lucide (ISC). Font: Montserrat (SIL OFL 1.1).

## Công cụ đi kèm

- `lib/imgproc.py` — `cutout(src, dst)` tách nền (tự tải mô hình ISNet từ npm lần đầu vào `models/`),
  `smart_crop()` và `blurred()` để cắt / làm mờ ảnh nền.
- `tools/oisearch.py` — tìm ảnh trong Open Images theo nhãn (ví dụ `"Meeting+Laptop"`) và xuất bảng xem trước để chọn ảnh.


---

## M03 — Di sản Hội An

Theo video mẫu Phố cổ Hội An: ảnh tràn nền phủ tối dần từ trái, tiêu đề chữ có chân mảnh in hoa, phụ đề chữ hẹp màu
vàng kim, slide giấy cổ có lưới kinh tuyến và hoa gió, thẻ kính mờ, dải cọ vàng sau tiêu đề biểu đồ, ảnh polaroid mép rách.
24 slide (1 slide ẩn ghi nguồn ảnh): bìa · mục lục số La Mã · bản đồ Đà Nẵng – Hội An (Natural Earth) · thẻ kính mốc 1999 ·
chuyển phần · biểu đồ cột vàng · Chùa Cầu · nhà cổ · Hội quán Phúc Kiến · gánh hàng rong (tách nền) · bảo tàng gốm sứ ·
chợ Hội An · trải nghiệm · ẩm thực · dòng thời gian · polaroid lịch sử · bảo tồn · những con số · bảng di tích · SWOT ·
kết luận · cảm ơn. Ảnh: chụp tại Hội An / Việt Nam, CC BY 2.0 (Open Images), danh sách tác giả trong
`assets/images/credits.csv`. Chất liệu (giấy cổ, dải cọ, huy hiệu, polaroid) sinh bằng `lib/heritage_assets.py`.


---

## M04 — Chính luận Mác – Lênin

Theo video mẫu Triết học Mác – Lênin: nền lụa đỏ son có bóng tượng đài mờ, chữ áp phích khổ hẹp màu vàng kim trong khung
vát góc viền vàng, nhãn "PHẦN n" nhỏ phía trên, thẻ đỏ thẫm trong suốt viền vàng, búa liềm và huân chương sao vàng nổi khối,
ruy băng vàng – đỏ và dải lụa đỏ viền vàng ở góc; tượng Lênin, Mác, Ăngghen… tách nền từ ảnh làm "người dẫn chuyện",
chân dung Cantơ in bằng mực đỏ thẫm như tranh khắc. 25 slide (1 slide ẩn ghi nguồn ảnh), nội dung mẫu "Vấn đề cơ bản của
triết học": bìa · câu hỏi mở đầu · trích dẫn Ăngghen · hai phạm vi · hai mặt · sơ đồ trường phái · chuyển phần (huân chương)
· ba hình thức duy vật · danh sách sao · ảnh lục giác · dải ảnh · duy tâm + huân chương · hai nhánh · ba cột nguồn gốc ·
nhất nguyên / nhị nguyên · hai lập trường · Cantơ – Hêghen · thực tiễn & kết luận · dòng thời gian · biểu đồ · bảng · cảm ơn.

- **Morph:** nền, khung tiêu đề, búa liềm (`!!emblem`), huân chương (`!!medal`), chân dung (`!!hero`), ruy băng, dải lụa
  giữ tên giữa các slide nên trượt / phóng to liên tục; huân chương xoay vào bằng hiệu ứng Grow & Turn.
- **Chất liệu vẽ bằng mã** (`lib/maclenin_assets.py`): lụa đỏ có nếp gấp, búa liềm và huân chương mạ vàng (đổ bóng, vát cạnh),
  sao nhiều mặt, ruy băng xoắn, dải lụa, dấu ngoặc kép vàng; `defringe()` làm sạch viền sáng quanh ảnh tách nền.
- **Ảnh:** Open Images (CC BY 2.0) — danh sách trong `assets/images/maclenin_photos.json`, tác giả trong
  `assets/images/credits.csv`; ảnh tách nền `assets/images/cut/ml_*.png` (có thêm tượng Bác Hồ `hcm_statue`, lăng Bác
  `mausoleum`, cờ Đảng `party_flag`, cờ Tổ quốc `vn_flag` cho các môn Tư tưởng Hồ Chí Minh, Lịch sử Đảng).

---

## M05 — Lao động – Việc làm

Theo video mẫu Địa lí 12 "Lao động và việc làm": bìa, mục lục, chuyển phần và cảm ơn dùng ảnh tràn nền tối dần từ trái
(mũ bảo hộ, tia hàn, công nhân) với chữ khổ hẹp rất lớn (Anton), dấu "&" màu cam; slide nội dung trên nền giấy kem – cam có
bóng người thợ mờ, tiêu đề nâu đậm + gạch cam, đường dẫn mục nhỏ góc phải, chữ Lexend với từ khóa tô cam.
18 slide (1 slide ẩn ghi nguồn ảnh): bìa · nội dung trình bày · chuyển phần I · biểu đồ cột lực lượng lao động · bảng chất
lượng lao động · bản đồ 6 vùng · chuyển phần II · bảng cơ cấu theo ngành · 2 biểu đồ tròn theo thành phần kinh tế · chuyển
phần III · bảng thất nghiệp (gộp ô) · so sánh thành thị – nông thôn · 4 chỉ số · giải pháp + nhóm người tách nền trên dải
lụa cam · quy trình 5 bước · kết luận · cảm ơn.

- **Biểu đồ, bảng:** cột cam chuyển màu, biểu đồ tròn vàng – cam – đỏ (nhãn lát nhỏ tự đưa ra ngoài), bảng tiêu đề cam,
  tất cả là đối tượng gốc của PowerPoint.
- **Bản đồ** (`lib/laodong_assets.py` → `vn_regions()`): ranh giới tỉnh Natural Earth gộp thành 6 vùng, tô màu theo giá trị,
  có quần đảo Hoàng Sa và Trường Sa; nhãn số liệu là hộp chữ sửa được trên slide.
- **Ảnh:** Open Images (CC BY 2.0) — `assets/images/laodong_photos.json`, tác giả trong `assets/images/credits.csv`;
  người tách nền `assets/images/cut/ld_*.png`. Số liệu trong file mẫu theo Niên giám thống kê; tỉ trọng lao động theo vùng
  là số minh họa.
