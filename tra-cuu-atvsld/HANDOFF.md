# BÀN GIAO: Công cụ tra cứu nhóm huấn luyện ATVSLĐ – Viện STP–DAKO

> Đọc file này trước. Đây là toàn bộ bối cảnh để tiếp tục công việc ở một cuộc hội thoại mới.
> Cập nhật: 23/10/2026. Ngôn ngữ làm việc: tiếng Việt, trả lời ngắn gọn, đi thẳng vào kết quả.

## 1. Người dùng và mục tiêu

- Người dùng: Lich (nữ), Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP (Viện STP), Nha Trang. Làm hỗ trợ kinh doanh cho dịch vụ huấn luyện ATVSLĐ của Viện STP–DAKO.
- Có 17 cẩm nang tư vấn ATVSLĐ theo ngành (file `source/handbooks/01.docx` … `17.docx`). Mỗi cẩm nang liệt kê các vị trí nhân sự của ngành, nhóm huấn luyện của từng vị trí, nội dung huấn luyện và các câu hỏi khách hàng hay hỏi.
- Yêu cầu đã giao: **một file HTML duy nhất, chạy offline** (Chrome/Safari, iPhone/Android/máy tính) cho đội kinh doanh:
  1. Chọn ngành, gõ tên vị trí nhân sự, thấy ngay vị trí và nhóm huấn luyện tương ứng.
  2. Chọn nhiều vị trí để tư vấn cả công ty.
  3. Tải file Word (.docx) có tên Viện STP–DAKO, tiêu đề, bảng nhân sự kèm nhóm huấn luyện và nội dung huấn luyện, trình bày chuyên nghiệp như các cẩm nang.
  4. Có thông tin đầu vào của khách (tên, quy mô, loại hình...) để kết quả sát thực tế.

## 2. Phản hồi của người dùng (rất quan trọng)

- Bản v1: "tôi hoàn toàn không hài lòng… vừa nhiều thao tác, vừa khó hiểu mà kết quả không như mong muốn." Cụ thể: chọn (1) Xây dựng, (2) nhập "Công nhân" thì phần "Kết quả tra cứu" phải hiện ra list vị trí nhân sự và nhóm huấn luyện tương ứng. Các mục "Khối công việc", "Lọc theo nhóm huấn luyện", "Mức rõ của phân nhóm theo cẩm nang" bị coi là vô nghĩa, đã bỏ.
- Bản v2: gõ gợi ý "Thợ" thì dòng "…nhân viên bán hàng tại cửa hàng thời trang" cũng hiện, chữ "thờ" bị tô vàng. Người dùng yêu cầu "fix toàn diện hết lại".
- Yêu cầu chung: **"đừng bao giờ để tôi phải chỉ ra những lỗi ngớ ngẫn như thế".** Luôn tự kiểm tra kỹ (tìm kiếm, tô vàng, dữ liệu nhóm, giao diện desktop + điện thoại, file Word) trước khi giao.
- Người dùng thường nhắn "HÃY TIẾP TỤC VỚI PHIÊN LÀM VIỆC CHƯA HOÀN THÀNH TRƯỚC ĐÓ" khi muốn tiếp tục.

## 3. Trạng thái hiện tại: bản v3, đã giao

File kết quả: `Tra_cuu_nhom_huan_luyen_ATVSLD_VienSTP_DAKO.html` (≈2,2 MB, tự chứa toàn bộ: CSS, dữ liệu JSON, thư viện docx 8.5.0, mã xuất Word, mã ứng dụng; không cần mạng).

Đã kiểm thử (tất cả đạt):
- Tìm kiếm: 10.346 phép thử trên 17 ngành, có dấu và không dấu, so với bộ kiểm chứng độc lập: 0 sai. Kiểm tra DOM 289 trường hợp tô vàng: 0 sai.
- Xuất Word thành công cho cả 17 ngành (`t3.py`). Đã dựng file docx mẫu thành PDF bằng LibreOffice để xem: tiêu đề, bảng nhân sự, nhóm, dòng "Lưu ý / Hoặc Nhóm…" đều đúng.
- Luồng người dùng desktop 1366 px và điện thoại 390 px: không tràn ngang, không lỗi JS (`t11.py`).

Lưu ý còn mở với người dùng: nhóm huấn luyện trong công cụ là **ước tính ban đầu** từ cẩm nang; các dòng ghi "ranh giới / chuyên viên xác nhận" cần chuyên viên rà soát trước khi gửi khách.

### Bản v3.1 (23/10/2026, tự rà soát sau khi nhận bàn giao, người dùng chưa xem)
Dựng lại từ gói: HTML, data.json, app_data.json giống hệt; t3, t10, t11 đạt. Rà soát thêm và sửa:
- Vị trí không có nhóm mặc định (80 dòng): bỏ dòng lặp ý ("Theo công việc" + "Xác định theo công việc thực tế", "Ranh giới" + "Trường hợp ranh giới"; 07.B4 nhắc lại đúng các nhóm tùy chọn). Hàm `noGroupLines` (màn hình) và `noGroupLabel` (bảng, Word, tóm tắt) trong `app.js`; Word nhận `noGroupLabel` qua `meta`. Nhãn cờ `rev` đổi thành "Chuyên viên xác nhận theo công việc thực tế" (không dùng chữ "ranh giới" trong tài liệu gửi khách). Thẻ danh sách không còn bảo "chọn nhóm" với người ngoài 6 nhóm.
- Câu cạnh nhãn nhóm: bỏ phần nhắc lại tên nhóm ở đầu câu ("[Nhóm 3] Nhóm 3 nếu…" → "[Nhóm 3] Nếu…"), hàm `optWhy`, chỉ trên màn hình; file Word giữ nguyên câu đầy đủ.
- "In hoặc lưu PDF": trước đây các mục nội dung đóng chỉ in tiêu đề. Nay `beforeprint` mở hết, `afterprint` đóng lại; giữ màu nhãn nhóm khi in; thêm dòng "VIỆN STP – DAKO · … · Ngành · Ngày lập" đầu bản in.
- "Sao chép tóm tắt": thêm "(hoặc Nhóm X: …)" giống file Word.
- Chỉ chọn vị trí chưa có nhóm: màn hình và Word không còn bảng tổng hợp/bảng nội dung khung rỗng.
- Logistics: thêm `'15': 'EF'` (Kho; Cảng, ICD, bãi container) vào `WORKER_BLOCKS`; "công nhân" từ 7 lên 17 vị trí (có lái xe nâng, lái cẩu, vận hành băng tải…).
- Thêm `tests/t12.py` cho các điểm trên (bản v3 cũ: 187 lỗi; v3.1: 0).
- Ô "Số người" rộng hơn để không cắt chữ "Chưa nhập".

### Bản artifact trên claude.ai (23/10/2026)
Đã đăng: https://claude.ai/artifact/Ev6ysu6K1HUJmPaUdLyJv9 (riêng tư, chỉ chủ sở hữu mở được cho tới khi chia sẻ từ menu Share của trang). Khai báo quyền `downloads`.
- Cùng mã nguồn với bản ngoại tuyến. `python3 build.py --artifact` ghi `artifact/tra-cuu-atvsld.html`: không có doctype/html/head/body (claude.ai tự bọc), `<title>` "Tra cứu nhóm huấn luyện ATVSLĐ" đứng đầu.
- `app.js` tự nhận biết đang chạy trong artifact (`window.claude.use` có sẵn, biến `FRAMED`): lưu Word qua `claude.use("downloads").save()` (người xem xác nhận), ẩn nút "In hoặc lưu PDF" và "Chia sẻ" vì khung artifact chặn in và Web Share. Bản ngoại tuyến giữ nguyên hành vi cũ.
- Thanh dính và thông báo cộng thêm `env(safe-area-inset-*)` (vùng tai thỏ trong ứng dụng Claude); bằng 0 ở trình duyệt thường.
- Giao diện chỉ có nền sáng (chủ đích, khớp màu tài liệu Word); nền `body` đặt rõ.
- Thư viện docx vẫn nhúng sẵn (không lấy từ CDN). `build.py` ghi 4 ký tự U+FFFD trong thư viện thành `\uFFFD` vì công cụ đăng artifact từ chối file có ký tự này.
- Cập nhật artifact: dựng lại bằng `build.py --artifact`, chạy `t13.py`, rồi đăng lại đúng file `artifact/tra-cuu-atvsld.html` (từ cuộc hội thoại khác thì truyền URL ở trên).

## 4. Cấu trúc gói

```
HANDOFF.md                      <- file này
Tra_cuu_nhom_huan_luyen_ATVSLD_VienSTP_DAKO.html   <- kết quả (dùng ngay)
source/
  build.py                      <- ghép mọi phần thành 1 file HTML
  app/template.html             <- khung trang, có các marker /*@CSS*/ /*@DATA*/ /*@DOCX*/ /*@EXPORT*/ /*@APP*/
  app/app.css, app.js           <- giao diện và logic (tìm kiếm, danh sách, xuất)
  app/exportdoc.js              <- dựng file Word (window.STPExport.build)
  data/app_data.json            <- dữ liệu cuối cùng nhúng vào HTML
  data/data.json                <- dữ liệu thô từ extract.py (đã gán cụm nội dung)
  data/extract.py, mapcl.py, grp_parse.py, build_data.py, grp.py, dump.py  <- đường ống dữ liệu
  lib/docx.iife.js              <- thư viện docx 8.5.0 (bản IIFE, nhúng vào HTML)
  handbooks/01..17.docx         <- 17 cẩm nang gốc của người dùng
  tests/t3.py, t10.py, t11.py, t12.py, t13.py   <- kiểm thử tự động (Playwright)
artifact/tra-cuu-atvsld.html   <- bản đăng artifact (build.py --artifact)
```

### Dựng lại và kiểm thử

```bash
cd source
python3 build.py                    # tạo lại ../Tra_cuu_...html (đã kiểm: giống hệt bản đã giao)

# đường ống dữ liệu (chạy trong source/data). Đã kiểm: tái tạo giống hệt data.json và app_data.json
cd data
python3 extract.py ../handbooks data.json
python3 build_data.py               # đọc data.json, ghi app_data.json (sửa nhóm tùy chọn ở đây)
cd .. && python3 build.py

# kiểm thử (cần: pip install playwright; có Chromium)
cd tests
python3 t10.py   # tìm kiếm: tính chất + tô vàng (kỳ vọng nbad 0, bad highlight 0)
python3 t3.py    # xuất Word cả 17 ngành (kỳ vọng 17 dòng "err": None, ERRS [])
python3 t11.py   # luồng desktop + điện thoại, có ảnh chụp trong tests/out
python3 t12.py   # chống lặp ý, tóm tắt, in, Word khi chưa có nhóm (kỳ vọng BAD [], ERRS [])
cd .. && python3 build.py --artifact && cd tests
python3 t13.py   # bản artifact: bọc khung như claude.ai, giả lập quyền downloads (kỳ vọng BAD [], ERRS [])
```
Xem file Word bằng mắt: `soffice --headless --convert-to pdf file.docx` rồi `pdftoppm -r 70 -png`.

## 5. Thiết kế dữ liệu

6 nhóm huấn luyện (Nghị định 44/2016/NĐ-CP, sửa đổi bởi NĐ 140/2018/NĐ-CP):
N1 Quản lý/chỉ huy (16 giờ lần đầu) · N2 Làm công tác ATVSLĐ (48 giờ) · N3 Công việc yêu cầu nghiêm ngặt (24 giờ) · N4 Người lao động khác (16 giờ) · N5 Người làm công tác y tế (56 giờ) · N6 An toàn, vệ sinh viên (4 giờ).

`app_data.json = { groups[6], inds[17] }`. Mỗi ngành: `id, no, name, full, legal, types[], scale{}, blocks[], clusters[]`.
Mỗi vị trí (`blocks[].rows[]`):
- `p` tên vị trí, `raw` nguyên văn cột nhóm trong cẩm nang, `n` ghi chú.
- `g` nhóm mặc định (mảng số).
- `o` nhóm tùy chọn `[{g, w, k}]`, `k` là: `rec` (khuyến nghị thêm, ví dụ Nhóm 6) | `cond` (thêm nếu đúng điều kiện, `w` là câu điều kiện) | `alt` (nhóm thay thế, "hoặc Nhóm X", `w` thường là "Tùy công việc thực tế của người đó"; **không bao giờ tự cộng vào danh sách**).
- `x` dịch vụ kèm theo, `f` cờ (`dia`, `rev`, `alt`, `work`, `none`, `svc`), `cl` cụm nội dung huấn luyện tham chiếu.

Quy ước tham chiếu: trong câu giải thích, "mục N" là mục của Danh mục công việc nghiêm ngặt (không viết "nhóm N" để khỏi nhầm với 6 nhóm huấn luyện).
Mọi chỉnh sửa/khắc phục dữ liệu nhóm nên làm trong `build_data.py` (khối `W_FIX`, `W_FIX2` và hậu xử lý cuối file), không sửa tay `app_data.json`.

## 6. Quy tắc tìm kiếm (đã chốt, đừng nới lỏng)

- Khớp **nguyên từ**, các từ gõ vào phải **đứng liền nhau** trong tên vị trí.
- Gõ **có dấu** thì khớp đúng dấu ("thợ" không khớp "thời"); gõ **không dấu** thì khớp mọi dấu.
- Khớp đầu từ (đang gõ dở, ví dụ "công nh") chỉ dùng khi không có kết quả nguyên từ.
- Chỉ "công nhân" được mở rộng theo khái niệm (thợ, vận hành, phụ hồ, thời vụ…) kèm danh sách khối lao động trực tiếp `WORKER_BLOCKS` theo từng ngành; các từ khác không mở rộng.
- Nếu không có vị trí nào có tên chứa cụm gõ nhưng có vị trí nhắc đến ở ghi chú, hiện thông báo riêng ("Không có vị trí nào có tên chứa… Có N vị trí nhắc đến trong phần ghi chú"). Không có gì thì hiện "0 vị trí khớp".
- Tô vàng chỉ trên từ khớp trọn vẹn. Không bao giờ dùng khớp chuỗi con.
- Đã bỏ cách tìm lỏng kiểu "thủ kho" khớp "thủ quỹ … kho" vì cho kết quả vô lý.

## 7. Giao diện và Word

- Hai màn hình: **Tra cứu** (chọn ngành, gõ vị trí, danh sách kết quả có nút "Thêm") và **Danh sách tư vấn** (số người từng vị trí, bật/tắt nhóm, thông tin khách hàng thu gọn, tổng hợp theo nhóm, nội dung huấn luyện). Desktop: 2 cột (trái nhập, phải kết quả). Điện thoại: thanh dưới + ô tìm kiếm dính trên.
- Lưu trạng thái bằng `localStorage` khóa `stp_dako_tracuu_v2` (luôn bọc try/catch).
- Điều khiển "Nhóm huấn luyện đề xuất": "Chỉ nhóm chính" / "Kèm nhóm khuyến nghị" (bật thì cộng các nhóm `rec`).
- Xuất Word: có hai mẫu "Bản gửi khách hàng" và "Bản nội bộ cho NVKD" (thêm ghi chú, tính năng phần mềm, câu hỏi thường gặp, bán thêm). Font Times New Roman, A4, lề trên/phải/dưới 2 cm, lề trái 3 cm, tiêu đề xanh `1B5E37`, đầu/chân trang có số trang, hotline 0827.695.368 – 0968.702.701, www.vienstp.com. Các dòng nhóm tùy chọn hiển thị "Lưu ý: …" (cond/rec) hoặc "Hoặc Nhóm X: …" (alt). Ghi chú trùng với câu điều kiện tự động ẩn (`noteDup`).

## 8. Bài học và cạm bẫy (để không lặp lại)

- Từng có lỗi tô vàng "thờ" trong "thời": do khớp tiền tố + bỏ dấu + khớp theo tiêu đề khối. Đã loại bỏ; giữ nguyên bộ kiểm thử `t10.py` mỗi lần đổi logic tìm kiếm.
- Khi sửa `app.js` bằng script, **không thay một đoạn rộng** giữa hai hàm (từng xóa nhầm `selCardHTML`, làm tab Danh sách trống). Sau mỗi lần sửa: `node --check app.js`, chạy `t11.py` và xem ảnh chụp.
- Với Playwright, thanh dính (sticky) có thể chặn click: dùng `el.scrollIntoView({block:'center'}); el.click()` bằng JS. Thông báo "proxy" của Chromium trong log là nhiễu, bỏ qua.
- Không dùng CDN: toàn bộ thư viện nhúng sẵn để chạy offline. JSON nhúng phải thay `</` bằng `<\/` và `<!--` bằng `<!--` (đã làm trong `build.py`).
- Kiểm tra hiển thị ở 390 px: không được tràn ngang (`scrollWidth - clientWidth = 0`).
- Thẻ `<details>` đóng không in được phần thân dù CSS ép `display:block`; phải mở bằng JS khi `beforeprint`. Chromium khi xuất PDF có thể phát `beforeprint` hai lần, nên danh sách thẻ cần đóng lại phải cộng dồn, không ghi đè.
- Ngoài bộ kiểm thử, nên đọc hết các dòng đặc biệt (không có nhóm mặc định, nhóm tùy chọn) như người dùng sẽ thấy: lỗi lặp ý không làm hỏng logic nên kiểm thử cũ không bắt được.
- Trong môi trường đám mây: `pip install playwright python-docx`; Chromium ở `/opt/pw-browsers/chromium` (các bài kiểm thử tự dò).

## 9. Việc có thể làm tiếp (người dùng chưa yêu cầu, chỉ là gợi ý)

- Chuyên viên rà soát các dòng "ranh giới" để chốt nhóm; sửa trong `build_data.py` rồi dựng lại.
- Nếu cập nhật cẩm nang: thay file trong `source/handbooks`, chạy lại đường ống dữ liệu, `build.py`, rồi 3 bài kiểm thử.
- Người dùng có thể muốn thêm: đồng bộ với công cụ báo giá ATLĐ của Viện (khác dự án này), xuất PDF trực tiếp, hoặc thêm ngành mới.

## 10. Câu mở đầu để dán vào cuộc hội thoại mới

> Đây là dự án đang làm dở. Hãy đọc HANDOFF.md trong gói đính kèm, giải nén `STP_tra_cuu_handoff.zip`, dựng lại và chạy kiểm thử như hướng dẫn rồi tiếp tục. Việc tôi muốn làm tiếp: [mô tả yêu cầu mới]. Nhớ tự kiểm tra kỹ trước khi giao, đừng để tôi phải chỉ ra lỗi.
