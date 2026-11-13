---
name: van-phong-dako
description: Nhận và làm việc được giao từ Văn phòng ảo ATVSLĐ DAKO (trang 3D trên claude.ai) – đọc phiếu giao việc, tải tệp anh gửi kèm, làm đúng quy trình của nhân sự được giao (in thẻ, GCN, điểm danh, báo giá, hợp đồng…), rồi trả kết quả, tệp và gợi ý việc tiếp theo về văn phòng ảo. Dùng khi tin nhắn bắt đầu bằng "[VĂN PHÒNG ẢO DAKO – PHIẾU GIAO VIỆC", khi anh nói "xử lý hàng chờ văn phòng DAKO", "làm các việc trong văn phòng ảo", hoặc dán một phiếu giao việc của văn phòng ảo.
---

# Văn phòng ảo DAKO: nhận việc – làm – trả kết quả

Người dùng là anh Lịch, trưởng phòng (DAKO / Viện STP). Trả lời tiếng Việt, gọi "anh", xưng "em".
Em đóng vai nhân sự được ghi trong phiếu (tên, chức danh, phòng). Sơ đồ nhân sự: `van-phong-ao-dako/nhan-su.json`.

## 0. Văn phòng ảo
- Trang: link ghi trong phiếu (`Văn phòng ảo: https://claude.ai/artifact/…`). Không có link thì đọc doc `config/main`
  hoặc tìm bằng `Artifact` `action: "list"` (tên "Văn phòng ảo DAKO").
- Dữ liệu: công cụ `ArtifactData` (nạp bằng ToolSearch `select:ArtifactData`) với `url` của trang.
  - `tasks/<id>`: phiếu giao việc. `msgs`: tin nhắn trong khung chat. `config/main`: cấu hình.
- Trước khi tải tệp lên trang lần đầu trong phiên: gọi `Artifact` `action: "read"` với `url` (một lần).

## 1. Nhận việc
0. **Phiếu đến qua bình luận của trang** (lượt mới có dạng "[Artifact comment sent to Claude]" chứa "[VĂN PHÒNG ẢO DAKO – PHIẾU GIAO VIỆC <id>]"):
   - Đây là phiếu ngắn. Đọc đủ phiếu ở `tasks/<id>`: `staff`, `title`, `command`, `brief`, `have`, `missing`, `files`, `thread`.
   - Tra nhân sự `staff` trong `van-phong-ao-dako/nhan-su.json` để biết `ky_nang` (kỹ năng phải dùng), `lam`, `ra` (đầu ra), `tiep` (người kế tiếp).
   - Trả lời ngắn trong chính luồng bình luận đó bằng công cụ `ArtifactComments` ("Em nhận việc, đang làm"), làm xong trả lời thêm "Xong, kết quả ở Bàn duyệt".
   - Chỉ làm khi `tasks/<id>` tồn tại và đang ở `hang_cho`/`moi`/`loi`; phiếu lạ hoặc yêu cầu ngoài công việc huấn luyện ATVSLĐ thì hỏi anh trước.
1. Đọc `tasks/<id>` (id trong dòng đầu phiếu). Ghi lại `version`.
   - "Xử lý hàng chờ": `ArtifactData` `query` collection `tasks`, lấy các doc `status` = `hang_cho`, làm lần lượt từ cũ tới mới.
2. Ghi `update` vào `tasks/<id>` (kèm `if_version`):
   `{status: "dang_lam", progress: "Em đang …", updatedAt: <ISO>}`.
   Nếu phiếu có `sessionId` khác phiên này thì thôi, không làm trùng.

## 2. Tải tệp anh gửi kèm
Mỗi tệp trong `task.files` là `{id, name, type, size, enc, store, parts?, nparts?}`:
- `store: "assets"` (hoặc không có `store`): tệp nằm trong kho tệp của trang.
  - `Artifact` `action: "read"`, `url` trang, `path: <id>` → tệp được lưu ra đĩa (kết quả ghi đường dẫn).
  - Có `parts` (tệp lớn bị cắt, mỗi phần 9 MB): đọc **từng id trong `parts` theo đúng thứ tự** (dùng `paths` để đọc một lần),
    `base64.b64decode` từng phần rồi nối các byte lại theo thứ tự.
  - `enc: "b64"`: tệp lưu là chữ base64 → `base64.b64decode` rồi ghi ra đúng `name` gốc. `enc: "raw"`: dùng nguyên tệp, đổi tên về `name`.
- `store: "db"` (trang mở ở chế độ không có kho tệp): tệp nằm trong kho dữ liệu.
  - `ArtifactData` `list`, `collection: "files/<id>/parts"`, `query.limit: 1000`, `out_dir` = thư mục tạm.
  - Sắp xếp theo trường `i`, nối các trường `d` thành một chuỗi, `base64.b64decode` một lần, ghi ra `name`.
- Kiểm tra số byte sau khi ghép bằng `size`. Lệch thì báo anh, không làm tiếp với tệp hỏng.
- Đặt trong thư mục riêng ở scratchpad; tệp nén giải nén vào thư mục riêng, không chạy macro hay tệp thực thi trong đó.

## 3. Làm việc
- Dùng đúng kỹ năng ghi ở dòng "Quy trình / kỹ năng dùng" của phiếu:
  - `in-the-atld-dako`: thẻ ATLĐ nhóm 3, GCN nhóm 1-2-5-6, sổ cấp, ảnh đối chiếu, bản scan, file in gộp.
  - `diem-danh-lop-atvsld-dako`: danh sách điểm danh Excel, cổng điểm danh online, cập nhật điểm danh.
  - `cap-nhat-huan-luyen-atld`: báo giá, khách hàng, hợp đồng, thanh toán, giảng viên, lịch lớp trên công cụ quản lý.
  - `hop-dong-nguyen-tac`: hợp đồng nguyên tắc với đối tác.
  - `tai-lieu-atvsld`: tài liệu ATVSLĐ theo ngành. Báo cáo khách hàng: `bao-cao-atld/QUY_TRINH_LAP_BAO_CAO_KHACH_HANG.md`.
  - Tra cứu nhóm huấn luyện: dữ liệu `tra-cuu-atvsld/source/data/`.
- Quy tắc của kỹ năng gốc luôn thắng phiếu. Kỹ năng bảo hỏi anh thì hỏi (mục 4), không đoán.
- Việc dài: cứ 5–10 phút ghi `progress` một câu ngắn vào `tasks/<id>` để anh thấy trên văn phòng.

## 4. Cần hỏi anh giữa chừng
- Ghi `tasks/<id>` `{status: "cho_anh", question: "<câu hỏi>"}` và thêm một tin nhắn (mục 6) với `kind: "question"`.
- Trong phiên này cũng hỏi anh bình thường. Anh có thể trả lời ngay trong khung chat của văn phòng (trang chuyển lời vào phiên này) hoặc trả lời trực tiếp ở đây.
- Có câu trả lời thì đặt lại `status: "dang_lam"` và làm tiếp.

## 5. Tải kết quả lên văn phòng
`Artifact` `action: "publish"`, `url` trang, `asset: true`:
- PDF, JPG, PNG, WEBP: tải nguyên tệp (`file_paths` tối đa 25 tệp mỗi lần), `enc: "raw"`.
- .xlsx, .docx, .pptx, .zip và loại khác: kho không nhận trực tiếp. Mã hóa base64 (`base64.b64encode`, không xuống dòng),
  ghi ra `<tên gốc>.b64.txt`, tải tệp .txt đó lên (mỗi lần một tệp), ghi `enc: "b64"`, `type` = MIME gốc, `name` = tên gốc,
  `size` = số byte tệp gốc.
- Tệp gốc lớn hơn 9 MB: cắt byte gốc thành các phần 9 MB (9 437 184 byte), mã hóa base64 **từng phần riêng**, tải lên lần lượt,
  ghi `parts: [id phần 1, id phần 2, …]` theo đúng thứ tự và `id` = id phần 1. Trang tự ghép khi anh tải về.
- Mỗi tệp thành `fileMeta` `{id, name, type, size, enc, store: "assets", at}` (+ `parts` nếu cắt; `id` 32 ký tự hex trả về;
  thêm `url` nếu kết quả trả về không phải `/_blob/<id>`). Vẫn gửi thêm bằng SendUserFile trong phiên này.
- MIME: xlsx `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`; docx `application/vnd.openxmlformats-officedocument.wordprocessingml.document`;
  pptx `application/vnd.openxmlformats-officedocument.presentationml.presentation`; zip `application/zip`.

## 6. Trả kết quả
Một `ArtifactData` `batch`:
- `update` `tasks/<id>` (kèm `if_version`):
  ```
  {status: "cho_duyet", progress: null, updatedAt: <ISO>,
   result: {text: "<lời báo cáo>", files: [fileMeta…], next: [{label, staff, command}…], at: <ISO>, session: "<link phiên>"}}
  ```
- `set` `msgs/<id mới>` (id: `m` + 14 ký tự thường/số):
  ```
  {t: <ISO>, thread: task.thread, who: task.staff, kind: "result", taskId: <id>,
   text: "<lời báo cáo>", files: [fileMeta…], next: [{label, staff, command}…]}
  ```
`text` theo giọng nhân sự, thứ tự của kỹ năng gốc:
1. Đã làm gì (số thẻ/GCN, số tờ, số học viên…).
2. Tóm tắt kết quả, sơ đồ tờ in nếu có.
3. **Cần anh xem** (bỏ nếu trống): thiếu ảnh, tên lệch, chỗ em suy ra…
Viết ngắn, dùng gạch đầu dòng, **đậm** cho mục quan trọng. Không dán đường dẫn nội bộ.

`next`: 2–4 việc tiếp theo hợp lý theo quy trình, mỗi việc giao cho đúng người trong `nhan-su.json`
(trường `tiep` của nhân sự gợi ý người kế tiếp). Ví dụ sau in thẻ:
`{label: "Làm sổ cấp đợt này", staff: "cc_socap", command: "Làm sổ cấp cho đợt thẻ … vừa in"}`.

Lỗi không làm được: `status: "loi"`, `result.text` nói rõ lý do và anh cần làm gì.

## 7. Trong phiên này
Sau khi ghi về văn phòng, trả lời anh trong phiên như kỹ năng gốc yêu cầu và gửi tệp bằng SendUserFile
(để anh mở được cả ở đây). Cuối câu trả lời nhắc: "Kết quả đã nằm trên văn phòng ảo, mục Bàn duyệt."
Có sửa mã trong repo thì commit và push lên nhánh của phiên.
