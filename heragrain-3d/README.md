# Nhà máy Heragrain 3D

Sơ đồ 3D toàn cảnh nhà máy HTX Heragrain theo hiện trạng: **xưởng cũ** (vào bằng lối đi xuyên qua nhà ở) và **xưởng mới 17 × 10 m** chuẩn bị xây, chung một khuôn viên, chia theo 4 giai đoạn đầu tư. Chọn một giai đoạn thì các khu hoạt động ở giai đoạn đó sáng màu, các khu của giai đoạn sau tối màu.

- Bản xem trực tuyến: https://claude.ai/artifact/1ekUePnCtFc2QaB53NHKxR
- Mở thẳng một giai đoạn: thêm `#gd1` … `#gd4` vào cuối đường dẫn.
- Xem trên máy: mở `index.html` bằng Chrome, Edge, Safari hoặc Firefox. Máy cần có mạng để tải thư viện three.js và phông chữ.

## Các file

| File | Nội dung |
|---|---|
| `index.html` | Khung trang: thanh giai đoạn, nút công cụ, bảng giải thích bên phải, toàn bộ CSS |
| `du-lieu.js` | **Dữ liệu**: 4 giai đoạn, 31 khu kèm đồ đạc, 11 bước quy trình, tuyến luồng hàng, mặt bằng, góc nhìn, phần phân tích |
| `nha-may.js` | Dựng cảnh 3D (three.js r128), tô màu theo giai đoạn, nhãn, camera, tương tác |
| `tai-lieu/Heragrain_Lo-trinh-dau-tu-giai-doan-dau.pptx` | Bộ slide lộ trình đầu tư làm căn cứ |
| `xuat-html.py`, `thu-vien/` | Đóng gói thành một file HTML để gửi đi, kèm three.js r128 (giấy phép MIT) |
| `ban-gui/Nha-may-Heragrain-3D.html` | File HTML đã đóng gói, mở được không cần mạng |

Phần lớn chỉnh sửa chỉ cần sửa `du-lieu.js`.

## Hiện trạng đã đưa vào sơ đồ

Theo ba ảnh phác thảo tay của HTX:

1. **Một khuôn viên**: xưởng cũ, nhà ở và xưởng mới chung khuôn viên; sân chung giữa nhà ở và xưởng mới cho xe nhận nguyên liệu, xuất hàng.
2. **Xưởng cũ** (giai đoạn 1): phòng 1 kho bao bì, 2 kho thành phẩm, 3 khu đóng gói, 4 dụng cụ đóng gói, 5 kho để đồ, 6 nhà vệ sinh, 7 nhà ở; lối đi dọc phía tây, cửa vào xưởng ở đầu lối. Muốn vào xưởng phải đi xuyên qua nhà ở. GĐ1 là nơi gia công đóng gói; từ GĐ2 chỉ nhận túi đã hàn kín để dán nhãn, đóng thùng, lưu kho.
3. **Xưởng mới 17 × 10 m** (giai đoạn 2): dãy phòng 4 m bên trái gồm văn phòng 4 × 3 m, phòng nghỉ 4 × 5 m, ô 4 × 2 m; hành lang 2 m có cửa hai đầu; khu chế biến 11 × 10 m; khu sao trà bếp củi gắn góc đông nam; nhà phơi trà phía nam. Làm cả trà sao bếp củi và trái cây sấy (sầu riêng, chanh dây, gừng, mãng cầu).
4. **Yêu cầu của HTX**: có phòng kế toán để họp, phòng nghỉ, nhà vệ sinh và nhà ăn cho công nhân; nhà vệ sinh và nhà ăn đặt sát khu sao trà; khu sao trà bếp củi là một khu riêng; đông người thì ăn, nghỉ chia ca.
5. **Kích thước**: chỉ xưởng mới có số đo. Các công trình khác ước theo tỷ lệ của chính ảnh xưởng mới (khoảng 2 m mỗi ô vở), xem `UOC_KICH_THUOC`.

Các điều chỉnh để đạt tiêu chuẩn (vách ngăn hành lang, đổi ô nhà vệ sinh thành phòng thay bảo hộ, tách cửa nhập và cửa xuất, chia khu bẩn và khu sạch, bếp nạp củi từ ngoài tường, nhà phơi kín…) và các giả định cần HTX xác nhận nằm trong `DIEU_CHINH`, `UOC_KICH_THUOC` và `CAN_XAC_NHAN` ở `du-lieu.js`, hiện ở cuối bảng bên phải.

## Sửa thường gặp

| Muốn sửa | Sửa ở đâu |
|---|---|
| Thời gian, nhân sự, chứng nhận, hạng mục xây của giai đoạn | `PH` trong `du-lieu.js` |
| Tên, công năng, bộ phận, yêu cầu, căn cứ của một khu | `ZONES` trong `du-lieu.js` |
| Dời khu, đổi kích thước (mét) | `box` và `h` của khu; nếu khu có `pin` thì dời `pin` theo |
| Khu chuyển sang giai đoạn khác | `phase` của khu |
| Tường chung giữa hai khu liền nhau | chỉ một khu vẽ tường đó, khu kia ghi mặt ấy vào `open` |
| Lối đi, cửa trên tường | `doors` của khu: `{ side: 'N'/'S'/'W'/'E', at: tọa độ tâm lối, w: bề rộng }` |
| Đường rào, cổng | `poly` và `gates` của khu hàng rào `rao` |
| Đồ đạc, thiết bị trong khu | mảng `do` của khu (danh sách loại đồ ở đầu `du-lieu.js`) |
| Diện tích xây mới cộng vào thẻ giai đoạn | đánh dấu `xay: true` cho khu |
| 11 bước quy trình, vị trí số bước | `STEPS` |
| Mũi tên luồng hàng | `ROUTES`; tuyến sáng khi khu `need` đang hoạt động, và chỉ đến giai đoạn `den` nếu có |
| Sân, ranh khuôn viên, đường vào | `MAT_BANG` (`nen`, `vien`, `duong`) |
| Nhãn chữ trên mặt đất | `NHAN_PHU` |
| Góc nhìn có sẵn, độ phóng | `GOC_NHIN`, `KHUNG` |
| Điều chỉnh so với phác thảo, cách ước kích thước, điểm cần xác nhận | `DIEU_CHINH`, `UOC_KICH_THUOC`, `CAN_XAC_NHAN` |
| Màu từng giai đoạn | `--p1` … `--p4` trong `index.html` **và** `SCENE_PH` trong `nha-may.js` (hai chỗ phải khớp) |

Kiểu dựng (`kind`) có sẵn: `hall` nhà có tường thấp và mái trong suốt, `block` khối nhà kín, `house` nhà ở mái dốc, `path` lối đi kèm cổng, `dryhouse` nhà phơi vách lưới, `woodshed` lán có mái, `utility` bồn nước và bể tự hoại, `bins` điểm rác, `passdryer` tủ sấy hai cửa xuyên vách, `detector` máy dò kim loại, `equip` buồng sấy, `cont` xe container, `fence` hàng rào theo đường gấp khúc, có cổng và camera, `trees` vườn cây.

## Hệ tọa độ (mét)

- Trục `x` từ tây sang đông, trục `z` từ bắc xuống nam.
- Xưởng mới chiếm `x` từ -4 đến 13, `z` từ 0 đến 10; mặt bắc quay ra sân chung (`z` từ -7,5 đến 0).
- Nhà ở và xưởng cũ nằm phía bắc sân chung; khuôn viên hình chữ L, cổng chính ở cạnh tây mở ra đường vào (giả định); vùng nguyên liệu nằm ngoài khuôn viên, bên kia đường.
- Kích thước ghi "ước" lấy theo tỷ lệ của ảnh xưởng mới, khoảng 2 m mỗi ô vở.

| Số | id | Khu | GĐ | kind | box [x0, x1, z0, z1] | Diện tích |
|---|---|---|---|---|---|---|
| 1 | `vung` | Vùng nguyên liệu, nhà vườn và cơ sở liên kết | 1 | trees | -40, -26, -6, 8 |  |
| 2 | `nha` | Nhà ở gia đình (phòng 7) | 1 (có sẵn) | house | -5, 11, -15, -7.5 | 120 m² (ước) |
| 3 | `wc1` | Nhà vệ sinh có sẵn (phòng 6) | 1 (có sẵn) | block | 4, 10.7, -19.6, -15 | 30,8 m² (ước) |
| 4 | `loidi` | Lối đi và cửa vào xưởng cũ | 1 (có sẵn) | path | -3.5, 0, -34.2, -19.6 | 51,1 m² (ước) |
| 5 | `kbb` | Kho bao bì (phòng 1) | 1 | hall | 0, 10.2, -24.2, -19.6 | 46,9 m² (ước) |
| 6 | `dg` | Khu gia công đóng gói (phòng 3) | 1 | hall | 0, 5.5, -29, -24.2 | 26,4 m² (ước) |
| 7 | `dc` | Phòng dụng cụ đóng gói (phòng 4) | 1 | hall | 0, 1.9, -26.2, -24.2 | 3,8 m² (ước) |
| 8 | `ktp` | Kho thành phẩm (phòng 2) | 1 | hall | 5.5, 10.2, -29, -24.2 | 22,6 m² (ước) |
| 9 | `kdd` | Kho để đồ (nửa tây phòng 5) | 1 | hall | 0, 5.1, -34.2, -29 | 26,5 m² (ước) |
| 10 | `vp` | Phòng kế toán và họp | 2 | hall | -4, 0, 0, 3 | 12 m² (phác thảo) |
| 11 | `nghi` | Phòng nghỉ công nhân | 2 | hall | -4, 0, 3, 8 | 20 m² (phác thảo) |
| 12 | `thay` | Phòng thay bảo hộ, rửa tay | 2 | hall | -4, 0, 8, 10 | 8 m² (phác thảo) |
| 13 | `hl` | Hành lang 2 m (lối người) | 2 | hall | 0, 2, 0, 10 | 20 m² (phác thảo) |
| 14 | `tn` | Khu tiếp nhận nguyên liệu (khu bẩn) | 2 | hall | 2, 7.5, 0, 4 | 22 m² (đề xuất) |
| 15 | `sc` | Khu sơ chế (khu bẩn) | 2 | hall | 2, 7.5, 4, 10 | 33 m² (đề xuất) |
| 16 | `say` | Tủ sấy hai cửa xuyên vách | 2 | passdryer | 6.6, 8.4, 4.3, 7.3 |  |
| 17 | `dem` | Phòng đệm vào khu sạch | 2 | hall | 7.5, 9.5, 7.5, 10 | 5 m² (đề xuất) |
| 18 | `sach` | Khu sạch: làm nguội, chọn lọc, đóng túi | 2 | hall | 7.5, 13, 0, 10 | 55 m² (đề xuất) |
| 19 | `sao` | Khu sao trà bếp củi | 2 | hall | 8, 13, 10, 14 | 20 m² (ước) |
| 20 | `cui` | Lán củi | 2 | woodshed | 8, 13, 14, 15.5 | 7,5 m² (đề xuất) |
| 21 | `an` | Nhà ăn và bếp nấu | 2 | hall | 13, 18, 10, 14 | 20 m² (đề xuất) |
| 22 | `wc` | Nhà vệ sinh công nhân | 2 | block | 18, 21, 10, 14 | 12 m² (đề xuất) |
| 23 | `phoi` | Nhà phơi kín | 2 | dryhouse | -3.5, 13, 16.5, 20.5 | 66 m² (ước) |
| 24 | `nuoc` | Bồn nước sạch, bể tự hoại, hố lắng | 2 | utility | 21.5, 25, 9.5, 16 | 22,8 m² (đề xuất) |
| 25 | `rac` | Điểm tập kết rác, bã | 2 | bins | -8.5, -5.5, 11, 13.5 | 7,5 m² (đề xuất) |
| 26 | `qc` | Phòng QC, lưu mẫu, giữ lô (nửa đông phòng 5) | 3 | hall | 5.1, 10.2, -34.2, -29 | 26,5 m² (ước) |
| 27 | `dkl` | Máy dò kim loại | 3 | detector | 10.4, 11.6, 3, 6 |  |
| 28 | `cn` | Xuất khẩu: Trung Quốc | 3 | cont | 12.5, 25.5, -7.2, -4.8 |  |
| 29 | `say2` | Buồng sấy bơm nhiệt | 4 | equip | 9.6, 12.6, 17.4, 20.1 |  |
| 30 | `rao` | Hàng rào, cổng khóa, camera | 4 | fence | -9.5, 26, -35.5, 22.5 |  |
| 31 | `eu` | Xuất khẩu: Châu Âu | 4 | cont | 12.5, 25.5, -4.4, -2 |  |

## Trạng thái của một khu ở mỗi giai đoạn

| Trạng thái | Khi nào | Hiển thị |
|---|---|---|
| Mới | giai đoạn đang xem = `phase` của khu | màu giai đoạn, sáng, nhấp nháy nhẹ |
| Đang hoạt động | giai đoạn đang xem > `phase`, hoặc công trình có sẵn (`sanCo`) | màu giai đoạn, trầm hơn |
| Dự phòng | giai đoạn đang xem > `until` | xám nhạt, mờ |
| Chờ giai đoạn sau | giai đoạn đang xem < `phase` | xám tối |

## Kiểm tra nhanh trong trình duyệt

Mở Console (F12) trên trang:

```js
__plant.setPhase(3)      // chuyển sang giai đoạn 3
__plant.select('say')    // chọn khu theo id
__plant.setView('moi')   // góc nhìn: 'iso' toàn cảnh, 'plan' mặt bằng, 'moi' xưởng mới, 'cu' xưởng cũ
__plant.zones            // danh sách khu kèm trạng thái hiện tại
```

## Cập nhật bản trực tuyến

`index.html` là mã nguồn của trang trực tuyến, nên không có thẻ `<!doctype>`, `<html>`, `<head>`, `<body>`: khi xuất bản, hệ thống tự bọc các thẻ này. Sau khi sửa, xuất bản lại `index.html` kèm `du-lieu.js` và `nha-may.js` vào cùng đường dẫn ở trên để giữ nguyên link.

## Xuất file HTML để gửi

```sh
python3 xuat-html.py
```

Lệnh tạo `ban-gui/Nha-may-Heragrain-3D.html` (khoảng 700 KB): một file duy nhất đã nhúng dữ liệu, phần dựng cảnh và thư viện 3D, gửi qua email hoặc Zalo, người nhận mở bằng trình duyệt là xem được, kể cả khi không có mạng (khi đó phông chữ dùng phông có sẵn của máy). Sửa `du-lieu.js` xong thì chạy lại lệnh để cập nhật file gửi.
