# Mẫu slide báo cáo "Aurora" / "Lime"

Bộ mẫu PowerPoint 34 slide xây dựng theo tinh thần các video mẫu (báo cáo xanh lime, Hội An, Mác – Lênin, Lao động – Việc làm):
chữ đậm in hoa, số thứ tự phần cỡ lớn, khung ảnh bo góc với người tách nền "bật" ra ngoài khung, quầng sáng mờ ở góc,
ảnh nền làm mờ và thẻ kính mờ, cùng hiệu ứng Morph và Animation cho từng thành phần.

## File đầu ra

| File | Mô tả |
|---|---|
| `output/Mau-Bao-Cao-Aurora.pptx` | Bảng màu chữ ký: xanh navy đậm + xanh aqua điện tử |
| `output/Mau-Bao-Cao-Lime.pptx` | Bảng màu gần mẫu gốc nhất: xanh rêu đậm + xanh lime |

Mở bằng **PowerPoint 2019 / Microsoft 365** để có Morph. Bản cũ hơn sẽ tự động dùng Fade thay cho Morph.
Nên cài font **Montserrat** trong thư mục `fonts/` trước khi mở (Windows: chuột phải → Install for all users).

## Danh sách slide

| # | Slide | Nội dung / bố cục |
|---|---|---|
| 1 | Bìa | Người tách nền bật khỏi khung ảnh, chip số liệu, thông tin GVHD / nhóm / thời gian |
| 2 | Mục lục | Tiêu đề chữ viền, 7 mục đánh số, panel ảnh với chữ dọc |
| 3, 8, 15, 20, 26, 28, 30 | Chuyển phần | Nền tối, số phần cỡ lớn; Morph làm số trượt và thu nhỏ vào breadcrumb của slide sau |
| 4 | Tổng quan đề tài | 3 lý do + khảm 3 ảnh |
| 5 | Mục tiêu nghiên cứu | Mục tiêu tổng quát + ảnh, thẻ tối liệt kê mục tiêu cụ thể, ghim |
| 6 | Đối tượng & phạm vi | 3 nhóm đối tượng có ảnh chân dung, 2 thẻ phạm vi |
| 7 | Phương pháp nghiên cứu | Ảnh + 3 thẻ icon |
| 9 | Mục tiêu chiến lược | Bảng phi tiêu tách nền + quầng sáng + thẻ chú thích |
| 10 | Quy trình 3 bước | Vòng tròn số lớn + mũi tên cong |
| 11 | Ma trận năng lực | Lưới 2×2 + 4 ghi chú |
| 12 | Kim tự tháp 5 cấp | Kim tự tháp vẽ bằng shape + chú thích |
| 13 | Hệ sinh thái | Hub trung tâm + 6 vệ tinh |
| 14 | Lộ trình 7 bước | Mũi tên chevron + timeline + thanh tóm tắt |
| 16 | Biểu đồ cột | KPI + biểu đồ cột nhóm (native, sửa được số liệu) |
| 17 | Biểu đồ thanh ngang | So sánh 2 năm + 3 thẻ KPI |
| 18 | Biểu đồ đường | Xu hướng 3 chuỗi + thẻ số nổi bật |
| 19 | Biểu đồ tròn | Doughnut + chú giải có tỷ lệ |
| 21 | 4 chỉ số nổi bật | Thẻ số liệu kèm ảnh |
| 22 | Khảm kết quả | Tiêu đề lớn + lưới thẻ số liệu và ảnh |
| 23 | Mức độ hài lòng | Nền tối, ảnh + 4 thẻ |
| 24 | Bảng số liệu | Bảng native + thanh tiến độ |
| 25 | Ảnh thực tế | Ảnh polaroid xoay nghiêng trên nền ảnh làm mờ |
| 27 | SWOT | 4 thẻ S-W-O-T với chữ nền lớn |
| 29 | Dashboard | Biểu đồ đường, vùng, cột + 2 KPI |
| 31 | Kết luận | 3 thẻ kết luận kèm số liệu then chốt |
| 32 | Kiến nghị | Ảnh toàn màn hình + trích dẫn + thẻ kính mờ |
| 33 | Cảm ơn | Hai người tách nền, liên hệ |
| 34 | Nguồn ảnh | Slide ẩn, ghi công tác giả ảnh |

## Hiệu ứng

- **Transitions:** Morph (1,0–1,4 giây) cho mọi slide. Các đối tượng tên bắt đầu bằng `!!` (quầng sáng, số phần,
  ảnh hero) được Morph ghép cặp giữa các slide nên sẽ trôi, phóng to hoặc thu nhỏ liên tục.
- **Animations:** hiệu ứng xuất hiện tự chạy sau transition, lệch thời gian theo thứ tự đọc: Wipe cho tiêu đề,
  Float In cho khối chữ, Zoom cho thẻ và ảnh, Fly In cho panel bên, Wheel cho biểu đồ tròn, Wipe Up cho biểu đồ cột.
  Mở **Animations → Animation Pane** để chỉnh.

## Thay nội dung

Có hai cách:

1. **Sửa trực tiếp trong PowerPoint.** Mọi thành phần đều là shape, text box, biểu đồ và bảng gốc của PowerPoint.
   Với biểu đồ: chuột phải → *Edit Data*.
2. **Dựng lại bằng script.** Sửa hàm `build_content()` trong `build_deck.py` rồi chạy:

```bash
pip install python-pptx pillow numpy cairosvg opencv-python-headless
python build_deck.py                 # tạo cả 2 bảng màu
python build_deck.py --theme lime    # chỉ tạo 1 bảng màu
```

## Hình ảnh

- Ảnh gốc: `assets/images/src/` lấy từ bộ dữ liệu Open Images (Google), giấy phép **CC BY 2.0** của các tác giả trên Flickr.
  Danh sách tác giả ở `assets/images/credits.csv` và slide ẩn cuối bộ.
- Ảnh tách nền: `assets/images/cut/*.png`, tách bằng mô hình ISNet (`lib/imgproc.py`: `cutout()` có guided-filter
  làm mịn viền tóc và khử viền màu nền).
- Ảnh làm mờ, ảnh phủ màu theo bảng màu và ảnh kính mờ được `build_deck.py` tạo tự động vào `assets/images/build/`.
- Icon: Lucide (ISC). Font: Montserrat (SIL OFL 1.1).

## Công cụ đi kèm

- `lib/imgproc.py` — `cutout(src, dst)` tách nền (tự tải mô hình ISNet từ npm lần đầu vào `models/`),
  `smart_crop()` và `blurred()` để cắt / làm mờ ảnh nền.
- `tools/oisearch.py` — tìm ảnh trong Open Images theo nhãn (ví dụ `"Meeting+Laptop"`) và xuất bảng xem trước để chọn ảnh.
