# ATL--DAKO

Kho chứa video giới thiệu (thư mục `video*`) và **Kho Mẫu Slide DAKO** (`slides-template/`).

## Kho Mẫu Slide DAKO — đọc trước khi làm slide

Danh sách mẫu nằm ở `slides-template/catalog/templates.json` (nguồn duy nhất). Bản dễ đọc: `slides-template/catalog/CATALOG.md`.
Trang thư viện có ảnh xem trước (Artifact): https://claude.ai/artifact/JmoetKFXwLHYifaeGuBUih (`catalog_url` trong `templates.json`).

| Mã | Tên | Gọi tắt | Dựng bằng |
|---|---|---|---|
| M01 | Báo cáo Xanh Lime | "xanh lime", "lime", "báo cáo xanh" | `python build_deck.py --theme lime` |
| M02 | Báo cáo Aurora | "aurora", "xanh navy" | `python build_deck.py --theme aurora` |
| M03 | Di sản Hội An | "hội an", "di sản", "phố cổ", "văn hóa" | `python build_hoian.py` |
| M04 | Chính luận Mác – Lênin | (sắp làm, theo video 3) | — |
| M05 | Lao động – Việc làm | (sắp làm, theo video 4) | — |

Khi người dùng nói "dùng mẫu M03", "mẫu hội an", "mẫu xanh lime"… thì tra `templates.json` (trường `code`, `name`,
`aliases`) để biết mẫu nào. Nếu không rõ, hỏi lại kèm danh sách mã.

### Làm bộ slide từ tài liệu người dùng gửi

1. Cài môi trường (container mới): `bash slides-template/tools/setup_env.sh`.
2. Đọc tài liệu (docx/pdf/pptx/ghi chú) bằng skill tương ứng; lập dàn ý theo các dạng slide của mẫu
   (`layouts` trong `templates.json`, mã nguồn trong `layouts_module`).
3. Chép file nội dung mẫu (`sample` trong `templates.json`, ví dụ `catalog/samples/M03-hoian.json`) sang
   `slides-template/decks/<ten-tai-lieu>/content.json` rồi thay chữ, số liệu, ảnh. Mỗi slide là
   `{"slide": "<tên layout>", ...tham số}` — giữ đúng cấu trúc tham số như file mẫu. Định dạng: `lib/content_io.py`.
4. Ảnh: ưu tiên ảnh đúng chủ đề. Mạng chỉ cho phép một số máy chủ; nguồn dùng được: Open Images
   (`tools/find_vn_photos.py` tìm ảnh chụp ở Việt Nam theo tiêu đề, `tools/oisearch.py` tìm theo nhãn), tải từ
   `open-images-dataset.s3.amazonaws.com`. Chép ảnh vào `assets/images/src/`, ghi tác giả vào
   `assets/images/credits.csv`, khai báo trong `"photos"` của content.json. Tách nền: `lib/imgproc.py` → `cutout()`.
   Mẫu M03 có slide bản đồ: tạo bản đồ mới bằng `tools/make_map.py --name <ten> --center lon,lat --place key:lon,lat`
   và đặt `"map": "<ten>"` trong content.json (hoặc bỏ slide `map_slide`).
5. Dựng: `cd slides-template && python <builder> --content decks/<ten>/content.json --out decks/<ten> --name <Ten-File>`.
6. Kiểm tra: `python <pptx skill>/scripts/office/validate.py <file>`, render sang ảnh (LibreOffice → PDF → PyMuPDF),
   xem từng slide, sửa chữ tràn/chồng lấn, rồi gửi file cho người dùng.

### Thêm một mẫu mới vào kho

1. Viết layouts + builder (theo khuôn `build_hoian.py`: hỗ trợ `--content`, `--name`, `--dump-sample`).
2. Dựng file mẫu vào `slides-template/output/`, xuất nội dung mẫu: `--dump-sample catalog/samples/<MÃ>-<slug>.json`.
3. Thêm mục vào `catalog/templates.json` (mã kế tiếp, `status: "ready"`, `aliases`, `best_for`, `palette`, `layouts`…).
4. Chạy `python tools/update_catalog.py` → tự chụp ảnh xem trước, cập nhật `CATALOG.md`, `catalog/site/index.html`.
5. Đăng lại trang thư viện lên cùng URL: Artifact publish `catalog/site/index.html` với `url` = `catalog_url`,
   `root` = `slides-template/catalog/site`, `files` = các khóa trong `catalog/site/files.json`. Cập nhật bảng ở đầu file CLAUDE.md này.
6. Commit + push.

### Quy ước thiết kế chung

- Khung 16:9 (13,333 × 7,5 in), chữ tiếng Việt đầy đủ dấu, font kèm trong `slides-template/fonts/`.
- Mọi slide có Morph transition; đối tượng cần trượt giữa các slide đặt tên bắt đầu bằng `!!`.
- Hiệu ứng xuất hiện tự chạy sau transition (`pptkit.anim` / `anims`), lệch thời gian theo thứ tự đọc.
- Biểu đồ và bảng phải là đối tượng gốc của PowerPoint (sửa được số liệu).
- Ảnh có giấy phép CC BY: luôn thêm slide ẩn "Nguồn hình ảnh".
