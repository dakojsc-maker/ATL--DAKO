# Tour 360° căn hộ CT1-11.10 · Sky9

Tour tham quan đi từ rộng đến hẹp, 4 cấp:

| Cấp | Cảnh | Nguồn ảnh |
|---|---|---|
| 1 · Vị trí | Bản đồ vị trí dự án, các điểm thông tin xung quanh (Khu Công nghệ cao, Vành đai 2, khu đô thị Vin Group, Đông Tăng Long…) | `source/ban-do-vi-tri.jpg` |
| 2 · Dự án | Phối cảnh tổng thể, nhãn Block CT1 / CT2 / CT3, **dải màu cam đánh dấu tầng 11 của Block CT1** | `source/phoi-canh-tong-the.jpg`, đối chiếu `source/ghi-chu-cac-toa.jpg` |
| 3 · Căn hộ | Mặt bằng căn loại E (74,25 m² tim tường / 69,08 m² thông thuỷ), bấm từng phòng để vào | `source/mat-bang-can-ho-E.jpg` |
| 4 · Các phòng | Phòng khách & ăn, bếp, ban công, phòng tắm chung, phòng ngủ 1, phòng ngủ master, WC master, phòng ngủ 2; đi giữa các phòng qua các mũi tên ở cửa | mặt bằng (tạm thời) → ảnh 360° ghép từ video |

Phòng ngủ master là phòng góc dưới bên phải, WC master nằm ngay phía trên, cùng mở ra một sảnh nhỏ
(theo `source/ghi-chu-phong-master.jpg`). Phòng ngủ 2 là phòng góc trên bên phải.

## Tính năng

- Kéo để nhìn quanh, cuộn/chụm để phóng to, nút phóng to/thu nhỏ, tự xoay, toàn màn hình, xoay theo cảm biến điện thoại (nếu thiết bị hỗ trợ).
- Chuyển cảnh có hiệu ứng "bay" vào điểm nóng rồi mờ dần sang cảnh mới; lên cấp thì lùi ra từ đúng vị trí vừa đi vào.
- Thanh đường dẫn (Vị trí › Sky9 › CT1-11.10 › Phòng) và dải ảnh thu nhỏ theo cấp.
- Bản đồ nhỏ của căn hộ: phòng đang đứng tô xanh, khung nhìn hiện tại vẽ trên mặt bằng; bấm phòng trên bản đồ nhỏ để đi tới.
- Khi xem phòng trên mặt bằng, phần ngoài phòng được làm tối để nổi bật phòng đang đứng.
- Thẻ thông tin từng cảnh, diện tích từng phòng, nút sang phòng bên cạnh; ngăn "Thông tin căn hộ" có bảng diện tích và sơ đồ vị trí căn loại E trên tầng.
- "Tham quan tự động" đi lần lượt qua mọi cảnh.
- Liên kết thẳng tới từng cảnh: `index.html#pn-master`, `#can-ho`, `#tong-the`…; nút sao chép liên kết.
- Ngăn "Video thực tế": phát video nhúng (khi đã nén vào `media/`) với nút tua tới từng phòng, hoặc liên kết sang Google Drive.

## Xem thử

Trình duyệt chặn WebGL đọc ảnh khi mở trực tiếp bằng `file://`, nên cần một máy chủ tĩnh:

```bash
cd tour-sky9
python3 -m http.server 8137
# mở http://127.0.0.1:8137/
```

Muốn gửi một file duy nhất để mở bằng cách bấm đúp (không cần máy chủ): mở
`Tour-360-CT1-11.10-Sky9.html`. File này tạo bằng `python3 tools/export_html.py`, nhớ chạy lại sau mỗi lần
`tools/build.py`.

Có thể đưa nguyên thư mục lên bất kỳ hosting tĩnh nào (GitHub Pages, Netlify…). Không cần mạng ngoài,
trừ phông chữ Google Fonts (thiếu mạng thì dùng phông hệ thống).

## Cấu trúc

```
tour.config.json   nguồn dữ liệu: ảnh, cảnh, điểm nóng, phòng, cửa (toạ độ pixel trên ảnh gốc)
tools/build.py     dựng images/ và data.js từ cấu hình (nắn ảnh phẳng sang toạ độ cầu)
tools/video_tool.py  xử lý video quay thực tế (khung hình, ghép ảnh 360°, nén video)
index.html, tour.css, tour.js   trình xem (Pannellum 2.5.6, giấy phép MIT, trong vendor/)
data.js            sinh tự động – đừng sửa tay
```

Sửa chữ, thêm điểm nóng, chỉnh vị trí: sửa `tour.config.json` rồi chạy `python3 tools/build.py`
(cần Python 3 + Pillow + numpy). `python3 tools/build.py --debug /tmp/kiem-tra` vẽ mọi điểm nóng,
khung phòng và cửa lên ảnh gốc để soát vị trí.

## Đưa video quay thực tế vào tour

Video `20250629_093934.mp4` (315 MB) nằm trên Google Drive ở chế độ riêng tư nên chưa tải được vào môi
trường dựng tour. Khi có file trên máy:

```bash
pip install opencv-python-headless
cd tour-sky9

# 1. Lưới khung hình có mốc thời gian để tìm đoạn quay từng phòng
python3 tools/video_tool.py contact ~/20250629_093934.mp4 --every 2     # -> build/khung-hinh/

# 2. Với mỗi phòng: chọn đoạn người quay đứng giữa phòng và xoay chậm một vòng, rồi ghép
python3 tools/video_tool.py stitch ~/20250629_093934.mp4 --room pn-master --start 83 --end 97
#    -> images/rooms/pn-master.jpg (+ .json: góc ngang/dọc ước lượng, mốc thời gian)
#    Quay đủ 360° thì thêm --haov 360. Ảnh bị lệch hướng so với mặt bằng: chỉnh --north.

# 3. Nén video để nhúng (mặc định 720p, CRF 28) rồi điền "src": "media/video-thuc-te.mp4" trong tour.config.json
python3 tools/video_tool.py compress ~/20250629_093934.mp4

# 4. Dựng lại
python3 tools/build.py
```

Phòng nào có `images/rooms/<id>.json` sẽ tự chuyển từ "Phối cảnh mặt bằng" sang "Ảnh 360° thực tế";
mốc thời gian của đoạn ghép thành nút "Tua tới phòng" trong ngăn video. Để đặt mũi tên sang phòng bên cạnh
ngay trên ảnh 360°, thêm vào phòng đó trong `tour.config.json`:

```json
"panoDoors": [{ "to": "phong-khach", "yaw": -40, "pitch": -8 }]
```

(lấy yaw/pitch bằng cách mở tour, quay tới cửa và gõ `tourViewer.getYaw()`, `tourViewer.getPitch()` trong Console).
Nếu chưa đặt, vẫn đi được giữa các phòng bằng các nút trong thẻ thông tin và bản đồ nhỏ.

## Giả định cần biết

- Vị trí tầng 11 được đếm trên phối cảnh: khối đế là tầng 1, phía trên có 13 hàng cửa sổ, tầng 11 là
  hàng thứ 4 tính từ mái. Nếu dự án đánh số khác (ví dụ không tính tầng trệt), sửa toạ độ `overlays`
  của ảnh `tong-the` trong cấu hình.
- Bản vẽ không cho biết căn số 10 nằm ở ô nào trên mặt bằng tầng, nên dải màu đánh dấu cả tầng 11
  trên hai đầu hồi của Block CT1, và sơ đồ tầng chỉ tô các căn loại E như bản vẽ gốc.
- Vị trí cửa giữa các phòng đọc từ bản vẽ phối cảnh, có thể lệch vài chục cm.
