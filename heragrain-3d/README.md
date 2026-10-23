# Nhà máy Heragrain 3D

Sơ đồ 3D toàn cảnh nhà máy Heragrain theo 4 giai đoạn đầu tư. Chọn một giai đoạn thì các khu hoạt động ở giai đoạn đó sáng màu, các khu của giai đoạn sau tối màu (chờ xây dựng). Ban lãnh đạo nhìn được cả quy trình lẫn phần đang chạy ở từng giai đoạn.

- Bản xem trực tuyến: https://claude.ai/artifact/1ekUePnCtFc2QaB53NHKxR
- Mở thẳng một giai đoạn: thêm `#gd1` … `#gd4` vào cuối đường dẫn.
- Xem trên máy: mở `index.html` bằng Chrome, Edge, Safari hoặc Firefox. Máy cần có mạng để tải thư viện three.js và phông chữ.

## Các file

| File | Nội dung |
|---|---|
| `index.html` | Khung trang: thanh giai đoạn, nút công cụ, bảng giải thích bên phải, toàn bộ CSS |
| `du-lieu.js` | **Dữ liệu**: 4 giai đoạn, 25 khu, 10 bước quy trình, tuyến luồng, ranh giới khuôn viên |
| `nha-may.js` | Dựng cảnh 3D (three.js r128), tô màu theo giai đoạn, nhãn, camera, tương tác |
| `tai-lieu/Heragrain_Lo-trinh-dau-tu-giai-doan-dau.pptx` | Bộ slide gốc làm căn cứ cho sơ đồ |

Phần lớn chỉnh sửa nội dung chỉ cần sửa `du-lieu.js`.

## Sửa thường gặp

| Muốn sửa | Sửa ở đâu |
|---|---|
| Thời gian, nhân sự, chứng nhận, mục tiêu của giai đoạn | `PH` trong `du-lieu.js` |
| Tên, công năng, bộ phận, yêu cầu, căn cứ của một khu | `ZONES` trong `du-lieu.js` |
| Dời khu, đổi kích thước | `box` và `h` của khu đó; nếu khu có `pin` thì dời `pin` theo |
| Khu chuyển sang giai đoạn khác | `phase` của khu (5 = đất dự trữ sau giai đoạn 4) |
| Khu chạy chính đến một giai đoạn rồi thành dự phòng | thêm `until` (như đơn vị gia công `toller`) |
| Thêm khu mới | thêm một dòng vào `ZONES` với `id` và `n` chưa dùng; chọn `kind` có sẵn |
| Lối đi trên tường nhà xưởng | `doors` của khu: `{ side: 'N'/'S'/'W'/'E', at: tọa độ tâm lối, w: bề rộng }` |
| Thiết bị bên trong khu (máy sấy, kệ, bàn…) | hàm `addProps` trong `nha-may.js`, theo `id` khu |
| 10 bước quy trình, vị trí số bước | `STEPS` trong `du-lieu.js` |
| Mũi tên luồng hàng | `ROUTES` trong `du-lieu.js`; tuyến sáng khi khu `need` đang hoạt động |
| Màu từng giai đoạn | `--p1` … `--p4` trong `index.html` **và** `SCENE_PH` trong `nha-may.js` (hai chỗ phải khớp) |
| Góc nhìn có sẵn | `VIEWS` trong `nha-may.js` |

Kiểu dựng (`kind`) có sẵn: `hall` nhà xưởng có tường thấp và mái trong suốt, `block` khối nhà kín (văn phòng, nhà phúc lợi), `canopy` mái che, `gate` cổng và trạm cân, `shed` nhà phụ, `tanks` bể xử lý, `cage` khu rào giữ lô, `cont` xe container, `equip` dây chuyền đặt trong nhà xưởng khác, `fence` hàng rào quanh khuôn viên, `trees` vườn cây, `pad` đất trống.

## Hệ tọa độ

- Trục `x` theo hướng dòng chảy sản phẩm, từ tây (vùng nguyên liệu) sang đông (xuất hàng).
- Trục `z` từ bắc xuống nam. Dây chuyền chính chạy dọc `z = -4`.
- Khuôn viên nhà máy (`SITE`): `x` từ -88 đến 92, `z` từ -50 đến 52. Vùng nguyên liệu và đơn vị gia công nằm ngoài khuôn viên, phía tây.
- Đơn vị tương đối, sơ đồ chưa theo tỷ lệ.

| Số | id | Khu | GĐ | kind | box [x0, x1, z0, z1] |
|---|---|---|---|---|---|
| 1 | `vung` | Vùng nguyên liệu, nhà vườn liên kết | 1 | trees | -126, -96, -12, 26 |
| 2 | `gate` | Cổng chính và trạm cân xe | 1 | gate | -86, -64, 6, 16 |
| 3 | `recv` | Khu tiếp nhận nguyên liệu (mái che) | 1 | canopy | -62, -44, -14, 14 |
| 4 | `qc1` | Phòng QC tiếp nhận | 1 | hall | -62, -52, 18, 26 |
| 5 | `rawst` | Kho nguyên liệu mát | 1 | hall | -44, -26, -22, 16 |
| 6 | `office` | Khối văn phòng điều hành (2 tầng) | 1 | block | -44, -24, 32, 46 |
| 7 | `toller` | Đơn vị gia công liên kết (ngoài khuôn viên) | 1 (chính đến GĐ2) | hall | -114, -92, 28, 46 |
| 8 | `prep` | Khu sơ chế (khu nguy cơ cao) | 2 | hall | -26, -6, -22, 16 |
| 9 | `dry1` | Khu sấy, dây chuyền 1 | 2 | hall | -6, 16, -22, 16 |
| 10 | `airlock` | Phòng thay bảo hộ và phòng đệm | 2 | hall | 16, 28, 16, 26 |
| 11 | `clean` | Khu sạch (nguy cơ thấp) | 2 | hall | 16, 50, -22, 16 |
| 12 | `pack` | Kho bao bì và nhãn | 2 | hall | 24, 42, -36, -22 |
| 13 | `fg` | Kho thành phẩm | 2 | hall | 50, 70, -22, 16 |
| 14 | `welfare` | Nhà phúc lợi công nhân | 2 | block | -6, 14, 34, 46 |
| 15 | `util` | Khu tiện ích (điện, khí nén, nước) | 2 | shed | -6, 16, -44, -30 |
| 16 | `waste` | Khu tập kết rác và phế phẩm hữu cơ | 2 | shed | -30, -14, -44, -30 |
| 17 | `wwtp` | Trạm xử lý nước thải | 2 | tanks | -72, -50, -46, -26 |
| 18 | `lab` | Phòng QC/lab và lưu mẫu | 3 | hall | 50, 62, 18, 28 |
| 19 | `hold` | Khu giữ lô chờ kết quả kiểm nghiệm | 3 | cage | 52, 60, -20, -8 |
| 20 | `dock` | Khu đóng thùng và xuất hàng | 3 | hall | 70, 86, -22, 16 |
| 21 | `cn` | Xuất khẩu: Trung Quốc | 3 | cont | 90, 106, -14, -3 |
| 22 | `dry2` | Dây chuyền sấy 2 (mở rộng công suất) | 4 | equip | -2, 13, 5, 14 |
| 23 | `sec` | Hàng rào, cổng kiểm soát ra vào, camera | 4 | fence | -88, 92, -50, 52 |
| 24 | `eu` | Xuất khẩu: Châu Âu | 4 | cont | 90, 106, 1, 12 |
| 25 | `land` | Đất dự trữ mở rộng (sau giai đoạn 4) | dự trữ | pad | 52, 90, 24, 48 |

## Trạng thái của một khu ở mỗi giai đoạn

| Trạng thái | Khi nào | Hiển thị |
|---|---|---|
| Mới | giai đoạn đang xem = `phase` của khu | màu giai đoạn, sáng, nhấp nháy nhẹ |
| Đang hoạt động | giai đoạn đang xem > `phase` | màu giai đoạn, trầm hơn |
| Dự phòng | giai đoạn đang xem > `until` | xám nhạt, mờ |
| Chờ xây dựng | giai đoạn đang xem < `phase` | xám tối |

## Đối chiếu bộ slide

| Nội dung trên sơ đồ | Slide |
|---|---|
| 4 giai đoạn: thời gian, mô hình, nhân sự cuối giai đoạn, mốc kết thúc | 4–8 |
| 7 bộ phận phụ trách | 9, 12 |
| 10 bước quy trình, khu sơ chế (nguy cơ cao) và khu sạch (nguy cơ thấp) | 14 |
| Thang chứng nhận ATTP → HACCP/ISO 22000 → BRCGS/FSSC 22000 | 15 |
| Xuất khẩu Trung Quốc (GACC, Lệnh 280) và Châu Âu (EUR.1) | 16–19 |

Bố trí là đề xuất sơ bộ của tư vấn, dựa trên GB 14881-2013, Codex CAC/RCP 1 và Điều 19 Luật An toàn thực phẩm 2010. Diện tích, công suất và thiết bị cần đơn vị thiết kế nhà máy xác nhận trước khi xây.

## Kiểm tra nhanh trong trình duyệt

Mở Console (F12) trên trang:

```js
__plant.setPhase(3)      // chuyển sang giai đoạn 3
__plant.select('hold')   // chọn khu theo id
__plant.setView('plan')  // góc nhìn: 'iso' toàn cảnh, 'plan' mặt bằng, 'prod' khu sản xuất
__plant.zones            // danh sách khu kèm trạng thái hiện tại
```

## Cập nhật bản trực tuyến

`index.html` là mã nguồn của trang trực tuyến, nên không có thẻ `<!doctype>`, `<html>`, `<head>`, `<body>`: khi xuất bản, hệ thống tự bọc các thẻ này. Sau khi sửa, xuất bản lại `index.html` kèm `du-lieu.js` và `nha-may.js` vào cùng đường dẫn ở trên để giữ nguyên link.
