---
name: cap-nhat-huan-luyen-atld
description: Cập nhật dữ liệu vào công cụ "Quản lý Huấn luyện ATVSLĐ DAKO" (trang dùng chung trên claude.ai) thay cho anh Lịch – nhập giảng viên, khách hàng, báo giá, hợp đồng, thanh toán từ file anh tải lên (Excel, Word, PDF, ảnh, zip) và xếp lịch lớp khi anh yêu cầu cụ thể (ngày, giờ, giảng viên, địa điểm…), lưu thẳng để giám đốc xem ngay. Dùng khi anh nói "cập nhật vào công cụ", "nhập giúp danh sách giảng viên", "đưa báo giá/hợp đồng này lên", "xếp lịch cho thầy X ngày…", "lên lịch lớp…", "ghi nhận khách đã thanh toán…", hoặc gửi file giảng viên/báo giá/hợp đồng kèm yêu cầu cập nhật.
---

# Cập nhật công cụ Quản lý Huấn luyện ATVSLĐ DAKO

Người dùng là anh Lịch (DAKO). Trả lời tiếng Việt, gọi "anh", xưng "em".

## Phạm vi – làm đúng phần anh giao
- **Anh tải file lên + yêu cầu cập nhật** (thông tin giảng viên, báo giá, hợp đồng, khách hàng, thanh toán): em **tự làm ngay**, đầy đủ, lưu thẳng vào công cụ.
- **Xếp lịch dạy**: anh thường tự làm trên công cụ. Em chỉ xếp khi anh **yêu cầu cụ thể** (ngày, giờ, giảng viên, khách hàng, địa điểm…). Thiếu thông tin bắt buộc thì hỏi một lần. Không tự đoán giảng viên hay ngày dạy.
- **Không tự sửa, xóa** bản ghi, file, cài đặt mà anh không nhắc tới. Phát hiện chỗ sai trong dữ liệu cũ thì **báo anh**, để anh tự sửa.
- Không đăng lại trang (mã giao diện) khi chỉ cập nhật dữ liệu. Dữ liệu ghi vào kho dùng chung thì mọi người đang mở trang thấy ngay.

## 1. Công cụ
- Trang: **https://claude.ai/artifact/RVdpwhRVeWuTTne3mwAXXo** (tên "Quản lý Huấn luyện ATVSLĐ DAKO"). Không mở được link này thì tìm bằng `Artifact` `action: "list"`, rồi hỏi anh nếu vẫn không thấy.
- Đọc/ghi dữ liệu: công cụ `ArtifactData` (nạp bằng ToolSearch `select:ArtifactData`) với `url` ở trên.
- Tải file lên: công cụ `Artifact` với `action: "publish"`, `url`, `asset: true` và `file_path` (hoặc `file_paths` – tối đa 25 ảnh/PDF mỗi lần; file .txt mỗi lần một file).
- Mã nguồn trang: `quan-ly-dao-tao-atld/src/` trong repo `dakojsc-maker/ATL--DAKO`. Khi cần tra lại quy tắc tính toán, xem `src/core.js`.

## 2. Bước làm mỗi lần
1. **Đọc dữ liệu hiện có** (`ArtifactData` `list`, `query.limit: 1000`; nhiều thì dùng `out_dir` rồi đọc file JSON): `settings` (doc `main`: bảng giá, VAT, vùng, giờ theo nhóm), `trainers`, `customers`, `quotes`, `classes`, và `log` (doc tháng hiện tại). Ghi lại `version` của từng doc để ghi có `if_version`.
2. **Đọc file anh gửi**:
   - Excel: openpyxl/pandas. Word: python-docx. PDF: pdftotext hoặc pdfplumber, PDF scan thì xem ảnh từng trang.
   - Ảnh/zip: giải nén vào thư mục riêng. Xử lý tên tiếng Việt (NFC, cp437→utf-8), bỏ `__MACOSX`.
   - Không chạy macro, không chạy file thực thi trong gói anh gửi.
3. **Đối chiếu** với dữ liệu sẵn có (mục 4) để biết bản ghi nào thêm mới, bản ghi nào cập nhật.
4. **Tải file đính kèm lên** (mục 5) và lấy `id` của từng file.
5. **Ghi dữ liệu** bằng `ArtifactData` `batch` (≤ 50 bản ghi/lần, ≤ 1 MiB). Bản ghi đã có thì phải kèm `if_version`.
6. **Ghi nhật ký** vào `log/<yyyy-mm>` (mục 7) để giám đốc thấy ở "Cập nhật gần đây".
7. **Đọc lại** các doc vừa ghi để kiểm tra số lượng, số tiền và file đính kèm.
8. **Trả lời** theo mục 8.

## 3. Cấu trúc dữ liệu (đúng tên trường – trang đọc theo các tên này)
Mọi bản ghi có thêm: `createdAt`, `updatedAt` (ISO 8601 UTC), `updatedBy: null`, `via: "claude"`.
- Ngày dạng `YYYY-MM-DD`, giờ dạng `HH:MM`.
- Tiền là số nguyên VNĐ, giá **chưa VAT** (VAT tính riêng theo `vatRate`).
- Id mới: tiền tố + chuỗi ngẫu nhiên chữ thường/số, ví dụ `tr` + 14 ký tự (`tr` giảng viên, `cu` khách hàng, `qu` báo giá, `cl` lớp).

**File đính kèm** (`fileMeta`): `{id, name, type, size, enc, at}`.
- `id`: id 32 ký tự hex mà Artifact trả về.
- `name`: tên file gốc. `type`: MIME gốc. `size`: số byte của file gốc.
- `enc`: `"raw"` hoặc `"b64"` (mục 5). `at`: thời điểm tải lên (ISO).
- Nếu `url` trả về không phải dạng `/_blob/<id>` thì thêm trường `url` đúng như kết quả trả về.

**`trainers/<id>`** – giảng viên
- `name`, `phone`, `email`, `birthYear` (chuỗi), `address`.
- `region` (id vùng trong `settings.regions`: `nam` | `trung` | `bac`), `otherRegions` [id vùng].
- `specialties` [chuỗi]. Ưu tiên đúng tên trong `settings.specialties`, tên mới thì giữ nguyên chữ của anh.
- `groups` [số 1–6], `degree`, `experience`, `certNo`, `certExpiry`.
- `employment`: `"Cơ hữu"` | `"Cộng tác viên"` | `"Thỉnh giảng"`.
- `dailyRate` (thù lao/ngày), `status`: `"active"` | `"paused"`, `notes`.
- `photo`: fileMeta hoặc `null`. `files`: [fileMeta] (CV, bằng cấp, chứng chỉ).

**`customers/<id>`** – khách hàng
- `name`, `taxCode`, `address`, `region`, `industry`, `contact`, `phone`, `email`, `notes`.

**`quotes/<id>`** – báo giá kèm hợp đồng (cùng một bản ghi)
- Khách hàng: `customerId`, `customerName`, `contact`, `contactPhone`.
- Báo giá: `no`, `date`, `validUntil`, `owner`, `groups` [1–6], `students`, `classCount`.
- Giá: `unitPrice`, `priceMode` (`"auto"` nếu đúng bảng giá, ngược lại `"manual"`), `amount` (chưa VAT), `amountMode`, `vatRate`.
- `status`: `"draft"` | `"sent"` | `"negotiating"` | `"accepted"` | `"signed"` | `"rejected"`.
- `notes`, `quoteFiles` [fileMeta].
- Hợp đồng: `contractNo`, `contractDate`, `contractAmount` (chưa VAT; `null` nếu bằng giá trị báo giá), `paymentDue`, `contractFiles` [fileMeta].
- `payments` [{`id`, `date`, `amount` (đã gồm VAT – số tiền thực thu), `note`}].
- Có hợp đồng thì `status: "signed"`. Bản ghi `signed` hiện ở tab Hợp đồng.

**`classes/<id>`** – lớp học / lịch dạy
- Khách hàng: `customerId`, `customerName`, `contact`, `contactPhone`.
- Nội dung: `title`, `kind` (`"Huấn luyện lần đầu"` | `"Huấn luyện định kỳ"` | `"Huấn luyện bổ sung"` | `"Huấn luyện lại"`), `groups` [1–6].
- Thời gian, địa điểm: `startDate`, `endDate`, `startTime`, `endTime`, `region`, `location`.
- `trainerIds` [id giảng viên], `students`.
- Giá, chi phí: `price` (chưa VAT), `priceMode`, `vatRate`, `costTrainer`, `costTrainerMode`, `costTravel`, `costOther`.
- `status`: `"planned"` (dự kiến) | `"confirmed"` (đã chốt) | `"done"` | `"cancelled"`.
- Hồ sơ: `quoteId` (id báo giá/hợp đồng hoặc `null`), `passed`, `certIssued`, `invoiced`, `notes`, `files` [fileMeta].

**`log/<yyyy-mm>`**: `{month: "yyyy-mm", entries: [{t, by: null, a, k, l, via: "claude"}]}`
- `a`: `"Thêm"` | `"Cập nhật"` | `"Thu tiền"`…
- `k`: `trainers` | `classes` | `quotes` | `customers`.
- `l`: nhãn ngắn ≤ 160 ký tự. Giữ tối đa 300 mục mới nhất.

## 4. Quy tắc đối chiếu và suy luận
- **Giảng viên trùng**: cùng SĐT (chỉ so chữ số) hoặc cùng họ tên (bỏ dấu, không phân biệt hoa thường) → cập nhật bản ghi cũ. Chỉ điền trường đang trống hoặc trường anh gửi giá trị mới; không xóa thông tin cũ. Nêu rõ trường nào đã đổi.
- **Khách hàng trùng**: cùng MST, hoặc cùng tên sau khi bỏ dấu và bỏ "Công ty / TNHH / CP / Cổ phần" → dùng lại `customerId`. Không có thì tạo mới.
- **Vùng đào tạo theo tỉnh** (ghi rõ trong trả lời là em suy ra):
  - `bac` (Hà Nội): từ Hà Tĩnh trở ra Bắc.
  - `trung` (Nha Trang): từ Quảng Bình đến Bình Thuận/Ninh Thuận, và Tây Nguyên (Kon Tum, Gia Lai, Đắk Lắk, Đắk Nông, Lâm Đồng).
  - `nam` (TP.HCM): Đông Nam Bộ (TP.HCM, Bình Dương, Đồng Nai, Bà Rịa – Vũng Tàu, Bình Phước, Tây Ninh) và Đồng bằng sông Cửu Long.
  - Áp dụng cho cả tên tỉnh trước và sau sáp nhập 2025. Không rõ tỉnh thì để vùng mà anh nói, hoặc hỏi anh.
- **Ảnh giảng viên**:
  - Ghép theo tên file chứa họ tên (bỏ dấu, bỏ "Ảnh/Hình"), hoặc theo STT/mã trong Excel. Ảnh dán trong Excel: lấy theo dòng mà tâm ảnh rơi vào.
  - **Không bao giờ đoán theo khuôn mặt.** Ảnh không ghép được thì báo anh.
  - HEIC không đọc được thì xin anh bản JPG.
- **Báo giá**:
  - Lấy số báo giá trong file. Không có thì đánh `BG-<năm>-<số tiếp theo>` (số lớn nhất trong năm + 1, 3 chữ số).
  - Trạng thái mặc định `"sent"` nếu là bản đã gửi khách, `"draft"` nếu anh nói đang soạn.
  - `unitPrice` theo bảng giá trong `settings.priceTiers`, tính trên số học viên/lớp = ⌈students / classCount⌉.
  - Hiện tại: dưới 30 HV là 5.000.000; 30–60 HV là 8.000.000; trên 60 HV chưa có giá, phải lấy theo file. Giá trong file khác bảng giá thì giữ giá trong file với `priceMode: "manual"` và báo anh.
- **Hợp đồng**:
  - Ghép với báo giá cùng khách hàng; nhiều báo giá thì chọn cái khớp giá trị, nếu vẫn chưa chắc thì hỏi.
  - Điền `contractNo`, `contractDate`, `contractAmount`, `paymentDue`, `contractFiles`, rồi đặt `status: "signed"`.
  - Không có báo giá nào thì tạo bản ghi mới, chỉ có phần hợp đồng, với `status: "signed"`.
- **Thanh toán**: thêm vào `payments` của đúng hợp đồng. Số tiền là số thực thu (đã gồm VAT).

## 5. Tải file lên
- **PDF, JPG, PNG, WEBP, GIF**: tải nguyên bản, `enc: "raw"`.
  - Ảnh giảng viên: cắt 3:4 (lệch lên trên), cạnh dài tối đa 900 px, lưu JPEG chất lượng 86, `type: "image/jpeg"`.
- **Word, Excel, file khác** (.docx, .xlsx, .xls, .doc, .csv…): kho file không nhận trực tiếp.
  - Mã hóa base64 (`base64.b64encode`, không xuống dòng) rồi ghi ra file `.txt`. Tải file `.txt` đó lên, mỗi lần một file.
  - Ghi `enc: "b64"`, `type` = MIME gốc (docx: `application/vnd.openxmlformats-officedocument.wordprocessingml.document`; xlsx: `application/vnd.openxmlformats-officedocument.spreadsheetml.sheet`), `name` = tên file gốc, `size` = số byte của file gốc.
  - Trang tự giải mã khi xem và tải về.
- Giới hạn: file thường tối đa 20 MB; file Word/Excel tối đa khoảng 14 MB, vì base64 làm file to thêm khoảng 37%.
- Đặt file tạm trong thư mục scratchpad, không đưa vào repo.

## 6. Xếp lịch lớp khi anh yêu cầu
- Cần có: khách hàng, ngày (từ–đến), giảng viên, số học viên. Không có giờ thì lấy mặc định `settings.dayStart`–`dayEnd` (08:00–17:00). Vùng lấy theo vùng của giảng viên hoặc khách hàng.
- **Kiểm tra trùng lịch** trước khi ghi: lớp khác chưa hủy có chung giảng viên, khoảng ngày giao nhau và khung giờ giao nhau. Trùng thì **không ghi**; báo anh lớp bị trùng và chờ anh quyết.
- `price` theo bảng giá từ số học viên (`priceMode: "auto"`), trừ khi anh cho giá khác (`"manual"`).
- `costTrainer` = tổng `dailyRate` của các giảng viên × số ngày (`costTrainerMode: "auto"`). `vatRate` lấy từ `settings`.
- `quoteId`: báo giá/hợp đồng của khách đó. Có nhiều thì chọn cái đã ký hoặc mới nhất, và ghi rõ đã gắn cái nào.
- `status: "confirmed"`, trừ khi anh nói "dự kiến". `kind` theo lời anh; anh không nói thì để `"Huấn luyện định kỳ"` và báo anh.
- Lớp nhiều ngày (ví dụ nhóm 2 là 48 giờ ≈ 6 ngày) thì dùng `startDate`–`endDate`. Không tự kéo dài nếu anh đã cho ngày.

## 7. Nhật ký
Thêm một mục cho mỗi bản ghi thêm hoặc sửa: `{t: <ISO>, by: null, a: "Thêm"|"Cập nhật"|"Thu tiền", k: <collection>, l: "<tên/nhãn>", via: "claude"}` vào `log/<tháng hiện tại>`. Đọc doc đó trước, nối thêm vào `entries`, rồi ghi lại có `if_version` (doc chưa có thì tạo mới).

## 8. Trả lời anh
Theo thứ tự:
1. **Đã cập nhật gì**: số giảng viên, khách hàng, báo giá, hợp đồng, lớp thêm mới hoặc cập nhật, số file đã tải lên.
2. **Tóm tắt** từng bản ghi chính, một dòng mỗi bản.
3. **Cần anh xem** (bỏ mục nào trống): thiếu thông tin, chỗ em suy ra (vùng, nhóm, giá), giá khác bảng giá, trùng tên/SĐT, ảnh không ghép được, trùng lịch không lưu, file lỗi.

Cuối cùng là link trang để anh và giám đốc mở xem.
