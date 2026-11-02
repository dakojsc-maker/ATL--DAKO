# Nhà máy Heragrain 360°

Tham quan ảo 360° nhà máy HTX Heragrain, trang trí theo bộ nhận diện thương hiệu (xanh lá đậm `#1D4B3A`, vàng nghệ `#E4A92A`, tím `#7A3E8F`, xanh lá `#5E9E68`, logo Heragrain Foods, cửa sổ chữ H, khẩu hiệu "Thấy tận mắt, ăn yên tâm."). Có 19 điểm đứng: toàn cảnh từ trên cao, lô xưởng mới 17 × 10 m và khu nhà ở, xưởng cũ cách khoảng 200 m.

Mô hình dựng từ bản vẽ tay của HTX và thiết kế đề xuất ở `../heragrain-3d`, không phải ảnh chụp. Xưởng mới hiện ở trạng thái hoàn thiện (giai đoạn 4); mỗi điểm ghi giai đoạn bắt đầu hoạt động.

- Bản xem trực tuyến: https://claude.ai/artifact/2paCqiM7xoEcYxQDyWzjh7
- File gửi đi: `ban-gui/Nha-may-Heragrain-360.html`, mở bằng Chrome, Edge, Safari hoặc Firefox, không cần mạng.
- Mở thẳng một điểm: thêm `#` và mã điểm, ví dụ `#khu-sach`, `#cua-xuong`.

## Tính năng

| Tính năng | Cách dùng |
|---|---|
| Nhìn quanh 360° | Kéo chuột hoặc vuốt; phím mũi tên; tự xoay chậm khi đứng yên (nút xoay) |
| Phóng to, thu nhỏ | Cuộn chuột, chụm hai ngón, nút + và − |
| Đi tới điểm khác | Bấm vòng tròn vàng có mũi tên; camera đi qua đúng cửa trên bản vẽ |
| Thông tin | Bấm chữ i trên cảnh, hoặc nút thông tin để xem cả điểm: công năng, diện tích, quy trình, yêu cầu, căn cứ |
| Bản đồ nhỏ | Mặt bằng khu đang đứng, chấm vàng là chỗ đứng, quạt vàng là hướng nhìn; bấm chấm để tới |
| Dải ảnh các điểm | Ảnh thu nhỏ chụp tự động lúc mở trang, chia nhóm Toàn cảnh, Xưởng mới, Xưởng cũ |
| Tham quan tự động | Đi lần lượt 19 điểm theo `TOUR`, có phụ đề mô tả; chạm bất kỳ đâu để dừng |
| Toàn màn hình | Nút góc trên phải (trình duyệt cho phép thì mới mở được) |

## Các file

| File | Nội dung |
|---|---|
| `index.html` | Khung trang, giao diện, CSS theo bộ nhận diện |
| `diem-360.js` | **Dữ liệu tham quan**: điểm đứng, mũi tên, điểm thông tin, vật liệu từng phòng, mái, biển hiệu, tranh, đường, sân, thứ tự tham quan |
| `the-gioi-360.js` | Dựng thế giới 3D thực tế từ mặt bằng `../heragrain-3d/du-lieu.js`: tường đủ cao, trần, cửa sổ, cửa, đồ đạc, logo, bao bì, poster, bầu trời, núi, cây |
| `tham-quan.js` | Trình xem: nhìn quanh, đi giữa các điểm, bản đồ nhỏ, dải ảnh, thông tin, tham quan tự động |
| `xuat-html.py` | Đóng gói thành một file HTML để gửi đi |

Mặt bằng các khu dùng chung với sơ đồ 3D ở `../heragrain-3d/du-lieu.js`: dời, sửa một khu ở đó thì cả sơ đồ 3D lẫn bản tham quan đều đổi.

## Sửa thường gặp (trong `diem-360.js`)

| Muốn sửa | Sửa ở đâu |
|---|---|
| Thêm hoặc dời một điểm đứng | `SCENES`: `p` là vị trí mắt, `nhin` là điểm nhìn ban đầu, `nhom`, `khu`, `gd`, `zones`, `mota` |
| Mũi tên đi tới điểm khác | `di` của điểm: `toi`, `p` (vị trí mũi tên, thường ở cửa), `nhan`, `qua` và `sau` (các điểm `[x, z]` đi qua trước và sau mũi tên để không xuyên tường), `thang` (bay thẳng) |
| Điểm thông tin | `tt` của điểm: `zone` (lấy nội dung từ `du-lieu.js`) hoặc `ten` và `noidung` |
| Màu tường, sàn, cửa sổ từng phòng | `PHONG` (`tuong`, `san`, `ngoai`, `cuaSo`, `tuongKin`, `sx`) |
| Biển, tranh, cây, kệ sản phẩm trong phòng | `TRANG_TRI` |
| Biển hiệu ngoài nhà | `BIEN_NGOAI` |
| Mái dốc | `MAI` |
| Thứ tự tham quan tự động | `TOUR` |
| Khoảng cách giữa khu cũ và lô mới | `DOI_CU` (mặc định -170 m, cộng với khoảng dời trong `du-lieu.js` thành khoảng 200 m) |

Điểm ở khu cũ khai báo bằng `C(x, z)` hoặc `C3(x, y, z)` theo tọa độ riêng của ảnh vẽ tay xưởng cũ; lô xưởng mới dùng tọa độ mét trực tiếp (xưởng chiếm `x` từ -4 đến 13, `z` từ 0 đến 10).

## Xuất file HTML để gửi

```sh
python3 xuat-html.py
```

Lệnh tạo `ban-gui/Nha-may-Heragrain-360.html` (khoảng 760 KB) đã nhúng dữ liệu, phần dựng cảnh, trình xem và three.js r128 (lấy từ `../heragrain-3d/thu-vien`, giấy phép MIT). Lần mở đầu trang dựng mô hình và chụp ảnh thu nhỏ trong vài giây.

## Cập nhật bản trực tuyến

`index.html` là mã nguồn trang Artifact nên không có thẻ `<!doctype>`, `<html>`, `<head>`, `<body>`. Khi xuất bản, đưa kèm `du-lieu.js` (lấy từ `../heragrain-3d/`), `diem-360.js`, `the-gioi-360.js`, `tham-quan.js`.
