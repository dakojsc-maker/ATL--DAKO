---
name: cap-nhat-huan-luyen-atld
description: Cập nhật dữ liệu vào công cụ "Quản lý Huấn luyện ATVSLĐ DAKO" (trang dùng chung trên claude.ai) thay cho anh Lịch – đọc kỹ file anh tải lên (Excel, Word, PDF, ảnh, zip) rồi nhập giảng viên, khách hàng, báo giá, hợp đồng khách hàng, hợp đồng thỉnh giảng giảng viên (HĐ nguyên tắc, phụ lục), thù lao – tạm ứng – thanh toán – thuế TNCN, hoa hồng, chi phí, sổ cấp thẻ/GCN học viên, hình thẻ/GCN, số quyết định hoàn thành khóa học, thông tin lịch giảng dạy; xếp lịch lớp hoặc lập hợp đồng/cấp số quyết định khi anh yêu cầu cụ thể; lưu thẳng để giám đốc xem ngay. Dùng khi anh nói "cập nhật vào công cụ", "đưa vào công cụ", "nhập giúp…", "đưa báo giá/hợp đồng này lên", "nhập sổ cấp thẻ", "gắn hình thẻ/quyết định cho học viên", "xếp lịch cho thầy X ngày…", "lập hợp đồng/phụ lục cho thầy X", "cấp số quyết định", "ghi nhận đã trả/đã thu…", hoặc gửi các file trên kèm yêu cầu cập nhật.
---

# Cập nhật công cụ Quản lý Huấn luyện ATVSLĐ DAKO (bản 2.1)

Người dùng là anh Lịch (DAKO). Trả lời tiếng Việt, gọi "anh", xưng "em".

## Phạm vi – làm đúng phần anh giao
- **Anh tải file lên + yêu cầu đưa vào công cụ**: em **tự làm ngay**, đầy đủ, lưu thẳng vào công cụ. File có thể là:
  - báo giá, hợp đồng khách hàng;
  - hợp đồng thỉnh giảng giảng viên: hợp đồng nguyên tắc (HĐNT) và phụ lục đã ký (bản scan);
  - thông tin giảng viên, khách hàng;
  - chứng từ thu/chi (thu tiền khách, tạm ứng/trả thù lao, chi hoa hồng);
  - sổ cấp thẻ/GCN, hình thẻ/GCN, quyết định hoàn thành khóa học (số `STT/QĐ-N(1-6)-DAKO`);
  - thông tin lịch giảng dạy.
- **Đọc kỹ từng file, tự trích xuất mọi thông tin và con số** liên quan vào đúng tab. Thông tin nào file không có thì **để trống**: ô trống trên công cụ đã có gợi ý ẩn để anh tự nhập. Cuối báo cáo liệt kê các ô còn trống.
- **Xếp lịch dạy, lập hợp đồng/phụ lục, cấp số quyết định**: anh thường tự làm trên công cụ. Em chỉ làm khi anh **yêu cầu cụ thể** hoặc gửi file kèm yêu cầu đưa vào. Thiếu thông tin bắt buộc thì hỏi một lần. Không tự đoán giảng viên, ngày dạy hay số văn bản.
- **Không tự sửa, xóa** bản ghi, file, cài đặt mà anh không nhắc tới. Thấy dữ liệu cũ sai thì **báo anh**, để anh tự sửa.
- **File có thông tin mà công cụ chưa có chỗ lưu** (ví dụ điều khoản phạt, lịch thanh toán nhiều đợt, đánh giá giảng viên…): ghi tạm vào ô Ghi chú của bản ghi liên quan, rồi **đề xuất tính năng nâng cấp** ở cuối câu trả lời.
- Không đăng lại trang (mã giao diện) khi chỉ cập nhật dữ liệu. Chỉ sửa mã khi anh yêu cầu nâng cấp.

## 1. Công cụ
- Trang: **https://claude.ai/artifact/RVdpwhRVeWuTTne3mwAXXo** (tên "Quản lý Huấn luyện ATVSLĐ DAKO"). Không mở được thì tìm bằng `Artifact` `action: "list"`, rồi hỏi anh nếu vẫn không thấy.
- Đọc/ghi dữ liệu: `ArtifactData` (nạp bằng ToolSearch `select:ArtifactData`) với `url` ở trên.
- Tải file lên: `Artifact` `action: "publish"`, `url`, `asset: true`, `file_path`, hoặc `file_paths` (tối đa 25 ảnh/PDF mỗi lần; file .txt mỗi lần một file).
  - File phải nằm trong thư mục làm việc. Chép tạm vào thư mục ẩn trong repo, tải xong thì xóa thư mục đó và kiểm tra `git status` sạch.
- Mã nguồn: `quan-ly-dao-tao-atld/src/`.
  - Công thức tiền: `finance.js`. Cấu trúc tab: `views.js`, `students.js`, `decisions.js` (tab Quyết định).
  - Hợp đồng giảng viên: `contracts.js` (đánh số, điền mẫu, trình tạo 3 bước, sổ hợp đồng); mẫu Word đã gắn ô: `hdgv_tpl.js`, tạo lại bằng `python3 -I tools/hdgv_template.py` từ `templates/Hop_Dong_Nguyen_Tac_Va_Phu_Luc_Giang_Vien_ATVSLD.docx` khi anh gửi mẫu mới.
  - Sau khi sửa mã: `python3 build.py <thư mục>` rồi đăng lại `artifact.html`, giữ nguyên link.

## 2. Bước làm mỗi lần
1. **Đọc dữ liệu hiện có** bằng `ArtifactData` `list` với `query.limit: 1000`, `out_dir` vào scratchpad.
   - Các collection: `settings` (doc `main`), `trainers`, `customers`, `quotes`, `classes`, `rosters`, `tcontracts` (hợp đồng giảng viên), `decisions` (số quyết định), và `log` (doc tháng hiện tại).
   - Ghi lại `version` của từng doc để ghi có `if_version`.
   - Bỏ qua file ẩn `.<id>.json,by-others` trong `out_dir`.
2. **Đọc file anh gửi**:
   - Excel: openpyxl. Word: python-docx. PDF: `pdftotext -layout`.
   - PDF scan, bảng phức tạp, hoặc con số bất thường: xem ảnh trang bằng `pdftoppm`.
   - Zip/rar: giải nén vào thư mục riêng. Chạy Python đọc file với `-I`. Không chạy macro hay file thực thi.
   - **Tự kiểm tra số học**: cộng các dòng chi tiết và so với dòng tổng. Lệch thì ghi theo số tổng trên file và báo anh.
3. **Đối chiếu** với dữ liệu sẵn có (mục 4) để biết bản ghi nào thêm mới, bản ghi nào cập nhật.
4. **Tải file đính kèm** lên (mục 5).
5. **Ghi dữ liệu** bằng `ArtifactData` `batch`: tối đa 50 doc và 1 MiB mỗi lần. Nội dung lớn thì viết ra file JSON rồi dùng `file_path`. Doc đã có phải kèm `if_version`.
6. **Ghi nhật ký** `log/<yyyy-mm>` (mục 7).
7. **Đọc lại** (nên đọc với `as_level: "view"`, quyền của giám đốc) để kiểm tra số lượng, số tiền và file.
8. **Trả lời** theo mục 8.

## 3. Cấu trúc dữ liệu (đúng tên trường – trang đọc theo các tên này)
**Quy ước chung:**
- Mọi bản ghi có thêm: `createdAt`, `updatedAt` (ISO 8601 UTC), `updatedBy: null`, `via: "claude"`.
- Ngày dạng `YYYY-MM-DD`, giờ dạng `HH:MM`.
- Tiền là số nguyên VNĐ. **Không có VAT** (đào tạo ATVSLĐ không chịu thuế GTGT): không ghi `vatRate`, không cộng VAT.
- Id mới: tiền tố + 14 ký tự thường/số: `tr` giảng viên, `cu` khách hàng, `qu` báo giá/HĐ, `cl` lớp, `ro` đợt cấp, `hv` học viên, `tt` khoản trả GV, `hh` hoa hồng, `cp` chi phí, `p` thu tiền, `hd` hợp đồng giảng viên, `de` quyết định, `r` dòng phụ lục.
- Số văn bản đánh theo mẫu trong `settings` (mục dưới): `{stt}` 2 chữ số (01, 02…), đánh lại từ 01 mỗi năm.

**File đính kèm** (`fileMeta`): `{id, name, type, size, enc, at}`.
- `id`: 32 ký tự hex do Artifact trả về. `enc`: `"raw"` hoặc `"b64"` (mục 5).
- Thêm `url` nếu kết quả trả về không phải `/_blob/<id>`.
- File của học viên thêm `kind`: `"the"` (hình thẻ/GCN), `"anh"` (ảnh 3×4), `"qd"`, `"khac"`.

**`trainers/<id>`** – giảng viên
- `name`, `phone`, `email`, `dob` (ngày sinh `YYYY-MM-DD`; có thì ghi cả `birthYear`), `birthYear`, `gender` (`"Nam"` | `"Nữ"`), `address` (nơi ở hiện nay).
- Giấy tờ in trong hợp đồng: `idNo` (CCCD/hộ chiếu), `idDate`, `idPlace`, `permAddress` (thường trú; trống thì hợp đồng dùng `address`).
- `region` (`nam` | `trung` | `bac`), `otherRegions` [vùng].
- `specialties` [chuỗi], `groups` [1–6], `degree`, `experience`, `certNo`, `certExpiry`.
- `employment`: `"Cơ hữu"` | `"Cộng tác viên"` | `"Thỉnh giảng"`.
- `dailyRate` (thù lao/ngày), `bankAccount` (số TK), `bankName` (ngân hàng – chi nhánh), `bank` (= `"<số TK> – <ngân hàng>"`, để trang cũ đọc được), `taxCode` (MST cá nhân).
- `status`: `"active"` | `"paused"`, `notes`, `photo` (fileMeta | null), `files` [fileMeta].

**`customers/<id>`**: `name`, `taxCode`, `address`, `region`, `industry`, `contact`, `phone`, `email`, `notes`.

**`quotes/<id>`** – báo giá + hợp đồng khách hàng + chi phí cấp hợp đồng
- Khách hàng: `customerId`, `customerName`, `contact`, `contactPhone`.
- Báo giá: `no`, `date`, `validUntil`, `owner`, `groups`, `students`, `classCount`.
- Giá: `unitPrice`, `priceMode` (`"auto"` nếu đúng bảng giá, ngược lại `"manual"`), `amount`, `amountMode`.
  - Có tổng mà không có đơn giá: đặt cả `priceMode` và `amountMode` là `"manual"` để trang không tự xóa tổng.
- `status`: `"draft"` | `"sent"` | `"negotiating"` | `"accepted"` | `"signed"` | `"rejected"`. `notes`, `quoteFiles`.
- Hợp đồng: `contractNo`, `contractDate`, `contractAmount` (`null` = bằng giá trị báo giá), `paymentDue`, `contractFiles`.
  - Có hợp đồng thì `status: "signed"`. Doanh thu tính theo hợp đồng đã ký, ghi nhận theo ngày ký.
- `payments` [{`id`, `date`, `amount`, `note`}]: khách đã trả.
- `commissions` [{`id`, `type`, `name`, `amount`, `taxRate`, `paidDate`, `note`}]
  - `type`: `"agent"` (đại lý), `"manager"` (cán bộ quản lý phía khách hàng), `"other"`.
  - `amount` = **tổng hoa hồng gồm thuế**. `taxRate` mặc định lấy `settings.commissionTax` (20).
  - Thuế mặc định (`commissionTaxMode: "net"`): thuế = amount × r / (100 + r). Ví dụ 30 tr → thuế 5 tr, thực trả 25 tr.
  - Nếu file chỉ ghi số **thực trả**: amount = thực trả × (1 + r/100).
- `otherCosts` [{`id`, `name`, `amount`, `note`}]: chi phí cấp hợp đồng.
- `gvEstimate`: chi phí giảng viên ước tính, chỉ dùng khi hợp đồng chưa có lớp có thù lao.
- `costFiles` [fileMeta]: phiếu chi, ủy nhiệm chi hoa hồng.

**`classes/<id>`** – lớp học / lịch dạy
- Khách hàng, nội dung: `customerId`, `customerName`, `contact`, `contactPhone`, `title`, `kind`, `groups`.
- Thời gian, địa điểm: `startDate`, `endDate`, `startTime`, `endTime`, `region`, `location`.
- `trainerIds`, `students`, `price` (doanh thu lớp), `priceMode`, `status`, `quoteId`.
- `fees` [{`trainerId`, `amount`, `pit`, `travel`, `auto`, `contractNo`, `contractDate`, `tcontractId`, `files`, `note`, `payments`}]: thù lao từng giảng viên.
  - `amount` = thù lao **trước thuế** (gồm phần hỗ trợ đi lại `travel` nếu phụ lục có) – là chi phí của DAKO. `pit` = thuế TNCN DAKO khấu trừ, nộp thay. Còn phải trả = `amount` – `pit` – đã trả.
  - `contractNo` = số phụ lục (hoặc số HĐ cũ), `tcontractId` = id phụ lục trong `tcontracts`.
  - `payments` [{`id`, `date`, `kind`: `"Tạm ứng"` | `"Thanh toán"`, `amount`, `note`}] – số tiền **thực chuyển** cho giảng viên.
  - Mỗi giảng viên trong `trainerIds` phải có một mục `fees`.
  - Ghi thêm `costTrainer` = tổng `fees.amount` (để tương thích dữ liệu cũ).
- `otherCosts` [{`id`, `name`, `amount`, `note`}]: đi lại, ăn ở, in thẻ…
- Hồ sơ: `passed`, `certIssued`, `invoiced`, `notes`, `files`.
- Lớp cũ chỉ có `costTrainer`/`costTravel`/`costOther`: trang tự quy đổi. Khi ghi lại lớp đó, chuyển sang `fees`/`otherCosts` và bỏ `vatRate`, `costTravel`, `costOther`, `costTrainerMode`.

**`rosters/<id>`** – đợt cấp thẻ/GCN (sổ cấp)
- Thông tin đợt: `batchId`, `part`, `title`, `customerId`, `customerName`, `classId`, `quoteId`, `groups`, `certType` (`"Giấy chứng nhận"` | `"Thẻ an toàn"` | `"Chứng chỉ"` | `"Sổ theo dõi"`).
- Khóa học và quyết định: `courseFrom`, `courseTo`, `hours`, `issueDate`, `decisionNo`, `decisionDate`, `decisionFiles`, `files` (sổ cấp gốc…), `notes`.
- `students` [{`k`, `stt`, `name`, `gender`, `dob`, `nationality`, `cccd`, `position`, `group`, `certType`, `certNo`, `content`, `from`, `to`, `hours`, `result`, `issueDate`, `expiry`, `notes`, `files`}]
  - Trường của học viên ghi đè trường chung của đợt. Trường để trống thì lấy theo đợt.
  - Hiệu lực trống: trang tự tính theo `settings.cycleMonths`.
- Mỗi doc tối đa **150 học viên** và dưới 240 KB. Đợt lớn hơn thì tách thành nhiều doc cùng `batchId` (`part` 1, 2, 3…). Thông tin đợt và file chỉ ghi ở phần 1.

**`tcontracts/<id>`** – hợp đồng thỉnh giảng giảng viên (mẫu chuẩn DAKO)
- Chung: `kind` (`"nt"` HĐ nguyên tắc | `"pl"` phụ lục), `trainerId`, `trainerName`, `no`, `stt`, `year` (năm ký), `signDate`, `signPlace`, `payDays` (số ngày làm việc thanh toán, chuỗi; trống thì in “.......”), `status` (`"draft"` chờ ký | `"signed"` | `"cancelled"`), `docFile` (file Word do trang tạo, fileMeta | null), `files` (bản scan đã ký), `notes`.
- `partyA` {`name`, `nameVi`, `address`, `taxCode`, `phone`, `email`, `rep`, `repTitle`, `bankAccount`, `bankName`} – chép từ `settings.company` lúc lập.
- `partyB` {`name`, `dob`, `gender`, `idNo`, `idDate`, `idPlace`, `address`, `phone`, `email`, `taxCode`, `degree`, `certNo`, `groups`, `bankAccount`, `bankName`} – chép từ hồ sơ giảng viên lúc lập. Ô trống → file Word in dòng chấm như mẫu.
- HĐNT thêm: `from`, `to` (hiệu lực), `term` (`"1y"` | `"eoy"` | `"6m"` | `"custom"`), `withForm` (kèm mẫu phụ lục trống, mặc định `true`). Số: `settings.contractNoFormat` (mặc định `{stt}/{năm}/HĐNT-ATVSLĐ`).
- Phụ lục thêm: `parentId`, `parentNo`, `parentDate` (HĐNT gốc), `seq` (phụ lục số mấy trong HĐNT), `rows` [{`id`, `classId`, `customer`, `location`, `topic`, `time`, `qty`, `unit` (`"ngày"` | `"buổi"` | `"giờ"` | `"lớp"`), `price`, `amount`}], `travel`, `pitAuto` (`true`: thuế = `pitRate`% × (tổng + đi lại) khi ≥ `pitMin`), `pit`, `total`, `net`. Số: `settings.appendixNoFormat` (mặc định `{stt}/PLHĐ-ATVSLĐ`).
- Lưu phụ lục có `classId` thì ghi vào `classes.fees` của giảng viên: `amount` = thành tiền + phần đi lại chia theo tỷ lệ, `pit` chia theo tỷ lệ, `travel`, `contractNo` = số phụ lục, `contractDate`, `tcontractId`, `auto: false`.

**`decisions/<id>`** – quyết định hoàn thành khóa học
- `no` (VD `05/QĐ-N3-DAKO`), `stt`, `group` (1–6), `year`, `date`, `title` (trích yếu), `customerId`, `customerName`, `classId`, `batchId` (đợt cấp trong `rosters`), `quoteId`, `courseFrom`, `courseTo`, `students` (số HV được công nhận), `certType`, `signer`, `status` (`"draft"` | `"signed"` | `"cancelled"`), `files` (scan quyết định), `notes`.
- Mẫu số: `settings.decisionNoFormat` (mặc định `{stt}/QĐ-N{nhóm}-DAKO`). `settings.decisionSeq`: `"year"` = đánh số liên tục cả 6 nhóm trong năm (mặc định), `"group"` = mỗi nhóm một dãy.
- Một quyết định cho một nhóm. Đợt cấp chỉ có một nhóm thì ghi luôn `decisionNo`, `decisionDate` vào các phần của đợt trong `rosters`.

**`settings/main`** (chỉ sửa khi anh yêu cầu): ngoài bảng giá… có `company` {`name`, `nameVi`, `address`, `phone`, `email`, `director`, `directorTitle`, `city`, `taxCode`, `bankAccount`, `bankName`, `signPlace`}, `contractNoFormat`, `appendixNoFormat`, `contractPayDays`, `pitRate` (10), `pitMin` (2000000), `decisionNoFormat`, `decisionSeq`. Ghi `company` thì ghi đủ các khóa (trang thay cả khối).

**`log/<yyyy-mm>`**: `{month, entries: [{t, by: null, a, k, l, via: "claude"}]}`
- `k` ∈ `trainers` | `classes` | `quotes` | `customers` | `rosters` | `tcontracts` | `decisions`. Giữ tối đa 300 mục.

## 4. Quy tắc đối chiếu và suy luận
- **Giảng viên trùng**: cùng SĐT (chỉ so chữ số) hoặc cùng họ tên (bỏ dấu) → cập nhật bản ghi cũ, chỉ điền trường trống hoặc trường anh gửi mới.
- **Khách hàng trùng**: cùng MST, hoặc cùng tên sau khi bỏ dấu và bỏ "Công ty / TNHH / CP / Cổ phần" → dùng lại `customerId`.
- **Vùng theo tỉnh** (ghi rõ là em suy ra):
  - `bac`: từ Hà Tĩnh trở ra Bắc.
  - `trung`: Quảng Bình → Bình Thuận/Ninh Thuận và Tây Nguyên.
  - `nam`: Đông Nam Bộ và Đồng bằng sông Cửu Long.
  - Áp dụng cho cả tên tỉnh trước và sau sáp nhập 2025. Không rõ thì để trống.
- **Báo giá**:
  - Lấy số báo giá trong file. Trạng thái `"sent"` nếu đã ký gửi khách.
  - Giá theo học viên hoặc trọn gói (không theo lớp): để trống `classCount` và `unitPrice`, dùng chế độ `"manual"`, ghi chi tiết từng dòng vào `notes`.
  - Giá khác bảng giá chung: giữ đúng giá trong file và báo anh.
- **Hợp đồng khách hàng**:
  - Ghép với báo giá cùng khách hàng. Nhiều báo giá thì chọn cái khớp giá trị; vẫn chưa chắc thì hỏi.
  - Điền `contractNo`, `contractDate`, `contractAmount`, `paymentDue`, `contractFiles`, rồi đặt `status: "signed"`.
  - Không có báo giá nào thì tạo bản ghi mới.
  - Điều khoản hoa hồng/chiết khấu ghi trong hợp đồng → thêm vào `commissions`.
- **Hợp đồng thỉnh giảng (HĐ nguyên tắc) đã ký**: tìm trong `tcontracts` theo số; có rồi thì thêm scan vào `files`, đặt `status: "signed"`, sửa `signDate` nếu khác. Chưa có thì tạo bản ghi `kind: "nt"` theo nội dung file (giữ đúng số trên file, `stt`/`year` tách từ số), `partyA`/`partyB` theo file. Bổ sung vào hồ sơ giảng viên các ô còn trống (CCCD, ngày cấp, nơi cấp, thường trú, MST, tài khoản) – không ghi đè ô đã có mà khác file thì báo anh.
- **Phụ lục đã ký / hợp đồng thuê giảng viên theo lớp**: ghép lớp theo giảng viên + khách hàng + ngày dạy → `rows` có `classId`; gắn `parentId` vào HĐNT còn hiệu lực của giảng viên (không có thì báo anh). Ghi `fees` của từng lớp như mục `tcontracts` ở trên.
  - Thuế TNCN và số thực nhận lấy đúng số trên phụ lục (`pitAuto: false` nếu khác cách tính tự động).
  - Không tìm thấy lớp: vẫn ghi dòng không có `classId` và báo anh; không tự tạo lớp trừ khi anh yêu cầu.
- **Kiểm tra số văn bản**: trùng số (cùng loại, cùng năm) hoặc số nhảy cóc → không ghi đè, báo anh.
- **Lập hợp đồng/phụ lục khi anh yêu cầu**: tạo bản ghi `tcontracts` `status: "draft"` (số tiếp theo theo mẫu, thông tin hai bên chép từ cài đặt và hồ sơ). File Word do trang tạo khi bấm “Xuất file Word” – không cần tự tạo file.
- **Quyết định hoàn thành khóa học** (file quyết định, danh sách số QĐ, hoặc sổ cấp có số QĐ): tách `stt`, `group`, `year` từ số; gắn `classId` theo khách hàng + ngày học, `batchId` theo đợt cấp cùng số QĐ hoặc cùng công ty + khoảng ngày; `students` = số học viên của nhóm trong đợt; scan vào `files`, `status: "signed"`. Báo anh các số trùng hoặc bị bỏ trống trong năm.
- **Chứng từ trả thù lao / tạm ứng**: thêm vào `fees[].payments` của đúng lớp và giảng viên. `kind` là `"Tạm ứng"` nếu trả trước ngày dạy hoặc chứng từ ghi tạm ứng.
- **Chứng từ khách thanh toán** → `quotes.payments`. **Chứng từ chi hoa hồng** → `paidDate` của khoản hoa hồng và `costFiles`.
- **Sổ cấp thẻ/GCN (Excel)**:
  - Tiêu đề cột đồng nghĩa vẫn nhận, ví dụ "Họ tên" / "Họ và tên", "Số" / "Số thẻ", "Đơn vị" / "Công ty".
  - Ngày sinh để nguyên dạng chuỗi như trong sổ. Ngày cấp và hạn đổi sang `YYYY-MM-DD`.
  - Gắn `customerId` theo đơn vị. Gắn `classId` theo khách hàng + khoảng ngày học. Gắn `quoteId` theo hợp đồng của khách.
  - Tải file sổ gốc vào `files` của đợt (dạng b64).
  - Kiểm tra trùng `certNo` với học viên đã có; trùng thì báo anh, không ghi đè.
- **Hình thẻ/GCN, quyết định cấp**: đối chiếu học viên theo thứ tự: số thẻ/GCN → họ tên + ngày sinh → CCCD.
  - **Không bao giờ đoán theo khuôn mặt.**
  - File PDF/PPTX nhiều thẻ: tách từng thẻ thành ảnh (pdftoppm hoặc LibreOffice), đọc chữ trên thẻ để biết của ai, rồi gắn `kind: "the"`.
  - Quyết định cấp: gắn vào `decisionFiles` của đợt khớp số quyết định, hoặc khớp công ty + ngày cấp.
  - Không khớp được: báo anh danh sách.

## 5. Tải file lên
- **PDF, JPG, PNG, WEBP, GIF**: tải nguyên bản, `enc: "raw"`.
  - Ảnh 3×4: cắt 3:4 (lệch lên trên), tối đa 900 px, JPEG chất lượng 86.
  - Hình thẻ: giữ tỷ lệ gốc, tối đa 1400 px.
- **Word, Excel, file khác**: mã hóa base64 (không xuống dòng), ghi ra file `.txt`, tải mỗi lần một file.
  - Ghi `enc: "b64"`; `type`, `name`, `size` là của file gốc.
- Giới hạn: 20 MB mỗi file thường, khoảng 14 MB mỗi file Word/Excel.

## 6. Xếp lịch lớp khi anh yêu cầu
- Cần có: khách hàng, ngày, giảng viên, số học viên. Không có giờ thì lấy theo `settings.dayStart`–`dayEnd`.
- **Kiểm tra trùng lịch giảng viên** trước khi ghi. Trùng thì không ghi, báo anh và chờ anh quyết.
- `price` theo bảng giá (`priceMode: "auto"`), trừ khi anh cho giá khác.
- Thù lao: `fees` = `dailyRate` × số ngày với `auto: true`, hoặc theo số anh/hợp đồng ghi với `auto: false`.
- `otherCosts` theo chi phí anh nêu. `quoteId` là hợp đồng/báo giá của khách; ghi rõ đã gắn cái nào.
- `status: "confirmed"`, trừ khi anh nói "dự kiến". Không rõ `kind` thì để `"Huấn luyện định kỳ"` và báo anh.

## 7. Nhật ký
Mỗi bản ghi thêm hoặc sửa → thêm một mục vào `log/<tháng hiện tại>`:
- Khung: `{t, by: null, a, k, l, via: "claude"}`.
- `a`: `"Thêm"` | `"Cập nhật"` | `"Thu tiền"` | `"Trả thù lao"` | `"Lập"` (hợp đồng GV) | `"Đã ký"` | `"Cấp số"` (quyết định).
- Đọc doc trước, nối thêm vào `entries`, ghi lại có `if_version`.

## 8. Trả lời anh
1. **Đã cập nhật gì**, theo từng tab: giảng viên (hồ sơ, hợp đồng thỉnh giảng, thù lao), lịch, học viên, quyết định, báo giá, hợp đồng, doanh thu – lợi nhuận, khách hàng. Kèm số file đã tải lên.
2. **Tóm tắt** từng bản ghi chính, một dòng mỗi bản, dùng bảng nếu nhiều.
3. **Cần anh xem** (bỏ mục nào trống):
   - ô còn trống chờ anh nhập; chỗ em suy ra;
   - số liệu lệch trong file; giá khác bảng giá;
   - trùng tên, SĐT, số thẻ; ảnh/thẻ không ghép được; trùng lịch không lưu;
   - số hợp đồng / số quyết định trùng hoặc bỏ trống; hợp đồng nguyên tắc sắp hết hạn.
4. **Đề xuất nâng cấp** nếu file có thông tin mà công cụ chưa có chỗ lưu.

Cuối cùng là link trang.
