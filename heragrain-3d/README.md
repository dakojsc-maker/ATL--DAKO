# Nhà máy Heragrain 3D

Sơ đồ 3D toàn cảnh nhà máy HTX Heragrain theo hiện trạng: **xưởng có sẵn** (vào bằng lối đi xuyên qua nhà ở) và **xưởng mới 17 × 10 m** chuẩn bị xây, chia theo 4 giai đoạn đầu tư. Chọn một giai đoạn thì các khu hoạt động ở giai đoạn đó sáng màu, các khu của giai đoạn sau tối màu.

- Bản xem trực tuyến: https://claude.ai/artifact/1ekUePnCtFc2QaB53NHKxR
- Mở thẳng một giai đoạn: thêm `#gd1` … `#gd4` vào cuối đường dẫn.
- Xem trên máy: mở `index.html` bằng Chrome, Edge, Safari hoặc Firefox. Máy cần có mạng để tải thư viện three.js và phông chữ.

## Các file

| File | Nội dung |
|---|---|
| `index.html` | Khung trang: thanh giai đoạn, nút công cụ, bảng giải thích bên phải, toàn bộ CSS |
| `du-lieu.js` | **Dữ liệu**: 4 giai đoạn, 31 khu kèm đồ đạc, 10 bước quy trình, tuyến luồng hàng, mặt bằng, góc nhìn, phần phân tích |
| `nha-may.js` | Dựng cảnh 3D (three.js r128), tô màu theo giai đoạn, nhãn, camera, tương tác |
| `tai-lieu/Heragrain_Lo-trinh-dau-tu-giai-doan-dau.pptx` | Bộ slide lộ trình đầu tư làm căn cứ |

Phần lớn chỉnh sửa chỉ cần sửa `du-lieu.js`.

## Hiện trạng đã đưa vào sơ đồ

Theo ba ảnh phác thảo tay của HTX:

1. **Xưởng có sẵn** (giai đoạn 1): phòng 1 kho bao bì, 2 kho thành phẩm, 3 khu đóng gói, 4 dụng cụ đóng gói, 5 kho để đồ, 6 nhà vệ sinh, 7 nhà ở; lối đi dọc phía tây, cửa vào xưởng ở đầu lối. Muốn vào xưởng phải đi xuyên qua nhà ở, nên xưởng này chỉ nhận túi thành phẩm đã hàn kín để dán nhãn, đóng thùng, lưu kho.
2. **Xưởng mới 17 × 10 m** (giai đoạn 2): dãy phòng 4 m bên trái gồm văn phòng 4 × 3 m, phòng nghỉ 4 × 5 m, ô 4 × 2 m; hành lang 2 m có cửa hai đầu; khu chế biến 11 × 10 m; khu sao trà bếp củi gắn góc đông nam; nhà phơi trà phía nam.
3. **Yêu cầu của HTX**: có phòng kế toán để họp, phòng nghỉ, nhà vệ sinh và nhà ăn cho công nhân; nhà vệ sinh và nhà ăn đặt sát khu sao trà; khu sao trà bếp củi là một khu riêng.

Các điều chỉnh để đạt tiêu chuẩn (vách ngăn hành lang, đổi ô nhà vệ sinh thành phòng thay bảo hộ, tách cửa nhập và cửa xuất, chia khu bẩn và khu sạch, bếp nạp củi từ ngoài tường, nhà phơi kín…) và các giả định cần HTX xác nhận nằm trong `DIEU_CHINH` và `CAN_XAC_NHAN` ở `du-lieu.js`, hiện ở cuối bảng bên phải.

## Sửa thường gặp

| Muốn sửa | Sửa ở đâu |
|---|---|
| Thời gian, nhân sự, chứng nhận, hạng mục xây của giai đoạn | `PH` trong `du-lieu.js` |
| Tên, công năng, bộ phận, yêu cầu, căn cứ của một khu | `ZONES` trong `du-lieu.js` |
| Dời khu, đổi kích thước (mét) | `box` và `h` của khu; nếu khu có `pin` thì dời `pin` theo |
| Khu chuyển sang giai đoạn khác | `phase` của khu |
| Tường chung giữa hai khu liền nhau | chỉ một khu vẽ tường đó, khu kia ghi mặt ấy vào `open` |
| Lối đi, cửa trên tường hoặc cổng rào | `doors` của khu: `{ side: 'N'/'S'/'W'/'E', at: tọa độ tâm lối, w: bề rộng }` |
| Đồ đạc, thiết bị trong khu | mảng `do` của khu (danh sách loại đồ ở đầu `du-lieu.js`) |
| Diện tích xây mới cộng vào thẻ giai đoạn | đánh dấu `xay: true` cho khu |
| 10 bước quy trình, vị trí số bước | `STEPS` |
| Mũi tên luồng hàng | `ROUTES`; tuyến sáng khi khu `need` đang hoạt động |
| Sân, đường | `MAT_BANG` |
| Nhãn chữ trên mặt đất | `NHAN_PHU` |
| Góc nhìn có sẵn, độ phóng | `GOC_NHIN`, `KHUNG` |
| Điều chỉnh so với phác thảo, điểm cần xác nhận | `DIEU_CHINH`, `CAN_XAC_NHAN` |
| Màu từng giai đoạn | `--p1` … `--p4` trong `index.html` **và** `SCENE_PH` trong `nha-may.js` (hai chỗ phải khớp) |

Kiểu dựng (`kind`) có sẵn: `hall` nhà có tường thấp và mái trong suốt, `block` khối nhà kín, `house` nhà ở mái dốc, `path` lối đi kèm cổng, `dryhouse` nhà phơi vách lưới, `woodshed` lán có mái, `utility` bồn nước và bể tự hoại, `bins` điểm rác, `detector` máy dò kim loại, `equip` buồng sấy, `cont` xe container, `fence` hàng rào có cổng và camera, `trees` vườn cây.

## Hệ tọa độ (mét)

- Trục `x` từ tây sang đông, trục `z` từ bắc xuống nam.
- Xưởng mới chiếm `x` từ -4 đến 13, `z` từ 0 đến 10; mặt bắc quay ra đường liên thôn (`z` từ -7,5 đến -2).
- Nhà ở và xưởng có sẵn nằm phía bắc đường; vùng nguyên liệu và đơn vị gia công nằm ngoài khuôn viên, phía tây.
- Vị trí tương đối giữa hai lô là giả định theo ảnh tổng quan; kích thước ghi "ước" lấy từ ảnh vẽ tay, khoảng 2 m mỗi ô vở.

| Số | id | Khu | GĐ | kind | box [x0, x1, z0, z1] | Diện tích |
|---|---|---|---|---|---|---|
| 1 | `vung` | Vùng nguyên liệu, nhà vườn liên kết | 1 | trees | -42, -28, 1, 15 |  |
| 2 | `toller` | Đơn vị gia công liên kết (ngoài khuôn viên) | 1 (chính đến GĐ2) | hall | -42, -30, -22, -11 |  |
| 3 | `nha` | Nhà ở gia đình (phòng 7) | 1 (có sẵn) | house | -5.5, 11, -15, -7.5 | 123,8 m² (ước) |
| 4 | `wc1` | Nhà vệ sinh có sẵn (phòng 6) | 1 (có sẵn) | block | 4, 10.5, -19.5, -15 | 29,3 m² (ước) |
| 5 | `loidi` | Lối đi và cửa vào xưởng có sẵn | 1 (có sẵn) | path | -3.5, 0, -33.5, -19.5 | 49 m² (ước) |
| 6 | `kbb` | Kho bao bì (phòng 1) | 1 | hall | 0, 10, -24, -19.5 | 45 m² (ước) |
| 7 | `dg` | Khu đóng gói thành phẩm (phòng 3) | 1 | hall | 0, 5.5, -28.5, -24 | 24,8 m² (ước) |
| 8 | `dc` | Phòng dụng cụ đóng gói (phòng 4) | 1 | hall | 0, 2, -26, -24 | 4 m² (ước) |
| 9 | `ktp` | Kho thành phẩm (phòng 2) | 1 | hall | 5.5, 10, -28.5, -24 | 20,3 m² (ước) |
| 10 | `kdd` | Kho để đồ (nửa tây phòng 5) | 1 | hall | 0, 5, -33.5, -28.5 | 25 m² (ước) |
| 11 | `vp` | Phòng kế toán và họp | 2 | hall | -4, 0, 0, 3 | 12 m² (phác thảo) |
| 12 | `nghi` | Phòng nghỉ công nhân | 2 | hall | -4, 0, 3, 8 | 20 m² (phác thảo) |
| 13 | `thay` | Phòng thay bảo hộ, rửa tay | 2 | hall | -4, 0, 8, 10 | 8 m² (phác thảo) |
| 14 | `hl` | Hành lang 2 m (lối người) | 2 | hall | 0, 2, 0, 10 | 20 m² (phác thảo) |
| 15 | `tn` | Khu tiếp nhận nguyên liệu (khu bẩn) | 2 | hall | 2, 7.5, 0, 4 | 22 m² (đề xuất) |
| 16 | `sc` | Khu sơ chế (khu bẩn) | 2 | hall | 2, 7.5, 4, 10 | 33 m² (đề xuất) |
| 17 | `dem` | Phòng đệm vào khu sạch | 2 | hall | 7.5, 9.5, 7.5, 10 | 5 m² (đề xuất) |
| 18 | `sach` | Khu sạch: làm nguội, chọn lọc, đóng túi | 2 | hall | 7.5, 13, 0, 10 | 55 m² (đề xuất) |
| 19 | `sao` | Khu sao trà bếp củi | 2 | hall | 8, 13, 10, 14 | 20 m² (ước) |
| 20 | `cui` | Kho củi | 2 | woodshed | 8, 13, 14, 16.5 | 12,5 m² (đề xuất) |
| 21 | `an` | Nhà ăn và bếp nấu | 2 | hall | 13, 18, 10, 14 | 20 m² (đề xuất) |
| 22 | `wc` | Nhà vệ sinh công nhân | 2 | block | 13, 18, 14, 16.5 | 12,5 m² (đề xuất) |
| 23 | `phoi` | Nhà phơi kín | 2 | dryhouse | -3.5, 12.5, 18, 23 | 80 m² (ước) |
| 24 | `nuoc` | Bồn nước sạch, bể tự hoại, hố lắng | 2 | utility | 18.5, 22, 10, 16.5 | 22,8 m² (đề xuất) |
| 25 | `rac` | Điểm tập kết rác, bã | 2 | bins | -7.5, -4.5, 11, 13.5 | 7,5 m² (đề xuất) |
| 26 | `qc` | Phòng QC, lưu mẫu, giữ lô (nửa đông phòng 5) | 3 | hall | 5, 10, -33.5, -28.5 | 25 m² (ước) |
| 27 | `dkl` | Máy dò kim loại | 3 | detector | 10.4, 11.6, 3, 6 |  |
| 28 | `cn` | Xuất khẩu: Trung Quốc | 3 | cont | 15, 28, -7.3, -4.9 |  |
| 29 | `say` | Buồng sấy bơm nhiệt | 4 | equip | 9, 12, 18.8, 22.2 |  |
| 30 | `rao` | Hàng rào, cổng khóa, camera | 4 | fence | -9, 23.5, -1.2, 25.5 |  |
| 31 | `eu` | Xuất khẩu: Châu Âu | 4 | cont | 15, 28, -4.6, -2.2 |  |

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
__plant.select('sao')    // chọn khu theo id
__plant.setView('moi')   // góc nhìn: 'iso' toàn cảnh, 'plan' mặt bằng, 'moi' xưởng mới, 'cu' xưởng có sẵn
__plant.zones            // danh sách khu kèm trạng thái hiện tại
```

## Cập nhật bản trực tuyến

`index.html` là mã nguồn của trang trực tuyến, nên không có thẻ `<!doctype>`, `<html>`, `<head>`, `<body>`: khi xuất bản, hệ thống tự bọc các thẻ này. Sau khi sửa, xuất bản lại `index.html` kèm `du-lieu.js` và `nha-may.js` vào cùng đường dẫn ở trên để giữ nguyên link.
