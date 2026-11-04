# Sơ đồ 3D xưởng ca cao Heragrain (xưởng cũ)

Xưởng cũ của HTX Heragrain (5 phòng, lối đi phía tây, vào qua nhà ở và sân sau) bố trí lại cho dòng ca cao: hàng thô
(hạt rang, nibs) và chế biến sâu (socola, bột, bơ ca cao, mix vị). Chọn giai đoạn để thấy khu, thiết bị nào hoạt động từ lúc nào.

- File gửi đi: `ban-gui/Xuong-ca-cao-Heragrain-3D.html` — mở bằng Chrome, Edge, Safari, Firefox; không cần mạng.
- Mở thẳng một giai đoạn: thêm `#gd1` … `#gd4` vào cuối đường dẫn.
- Dựng từ mã nguồn sơ đồ 3D nhà máy Heragrain (phiên trước, nhánh `claude/ecstatic-lovelace-lznmn0`, thư mục `heragrain-3d`), thêm
  kiểu dựng `cacao` (vườn ca cao), `lenmen` (điểm lên men, phơi của HTX), `thietbi` và thiết bị ca cao: `bao`, `can`, `rang`,
  `tachvo`, `melanger`, `ep`, `nghienbot`, `temper`, `tumat`, `dieuhoa`, `panning`.

## Dòng hàng một chiều

| Phòng | Công năng | Giai đoạn |
|---|---|---|
| Sân sau (lợp mái) | Nhận hạt, cân, lấy mẫu; chiều tập kết thùng chờ xe | GĐ1 |
| Phòng 6 | Nhà vệ sinh + phòng thay bảo hộ | GĐ1 |
| Phòng 1 | Kho hạt, kiểm nhận (độ ẩm, cut test), làm sạch | GĐ1 |
| Phòng 2 | Rang (CCP), nghiền vỡ, tách vỏ; tủ sấy vỏ làm trà (GĐ4) | GĐ1 |
| Phòng 3 | Phân cỡ, đóng gói nibs; máy nghiền đá (GĐ2); máy ép, nghiền bột (GĐ3) | GĐ1–3 |
| Nửa tây phòng 5 | Khu sạch socola 18–20 °C; dò kim loại (GĐ3); nồi bao (GĐ4) | GĐ2 |
| Đầu bắc lối đi | Trạm rửa tay vào khu sạch | GĐ2 |
| Nửa đông phòng 5 | Kho thành phẩm mát 15–18 °C; góc QC (GĐ3) | GĐ1 |

Sửa dữ liệu trong `du-lieu.js` (giai đoạn `PH`, khu `ZONES`, bước `STEPS`, luồng `ROUTES`, phân tích `DIEU_CHINH`,
`CAN_XAC_NHAN`) rồi chạy `python3 xuat-html.py` để cập nhật file gửi đi. Kích thước xưởng là số ước theo ảnh vẽ tay;
vị trí máy là đề xuất, cần chốt theo catalogue máy thật và đo thực tế.
