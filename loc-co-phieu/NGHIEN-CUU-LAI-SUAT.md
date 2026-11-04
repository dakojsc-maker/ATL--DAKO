# Cổ phiếu phản ứng thế nào sau các lần Ngân hàng Nhà nước giảm lãi suất? (2013–2023)

*Thực hiện 04/11/2026 trên giá ngày của các mã đủ thanh khoản (nguồn Vietcap). Đây là tài liệu hỗ trợ ra quyết định,
không phải lời khuyên đầu tư.*

## 1. Cách đo

- **Sự kiện:** 12 lần giảm lãi suất điều hành vào các ngày 26/03/2013, 13/05/2013, 18/03/2014, 10/07/2017,
  16/09/2019, 17/03/2020, 13/05/2020, 30/09/2020, 14/03/2023, 03/04/2023, 24/05/2023 và 16/06/2023.
- **Mốc tính:** giá đóng cửa phiên liền trước, nên phản ứng của phiên đầu tiên sau tin luôn được tính.
- **Đo:** thay đổi giá sau 5, 20 và 60 phiên (khoảng 1 tuần, 1 tháng, 3 tháng), lấy trung vị theo nhóm ngành.

## 2. Kết quả

| Nhóm | Sau 5 phiên | Sau 20 phiên | Sau 60 phiên | Số lần hơn VN-Index (20 phiên) |
|---|---|---|---|---|
| VN-Index | nhỏ (thường dưới ±1,5%) | −4% đến +9% | 8/12 lần tăng | – |
| **Chứng khoán** | **+3,4%** | **+8,5%** | **+21,4%** | **8/9** |
| Ngân hàng | +0,1% | +2,1% | +6,8% | 7/12 |
| Bất động sản | +0,6% | +0,6% | +5,3% | 4/12 |
| Xây dựng, vật liệu | +0,3% | −0,7% | +4,2% | 4/12 |
| Thép, tài nguyên | +0,8% | +0,3% | +9,2% | 5/11 |
| Điện, nước, khí | +0,8% | +3,4% | +5,7% | 7/12 |

- **Chứng khoán hưởng lợi rõ nhất và đều nhất.**
- **Bất động sản không vượt trội** như nhiều người nghĩ.
- **Đa số mức tăng đến sau tin, không phải ngay khi ra tin.** VN-Index thường chỉ nhích nhẹ trong tuần đầu; phần lớn
  mức tăng đến trong 1–3 tháng sau.
- **Ra tin khi thị trường đang điều chỉnh** (03/2020 và 03/2023): VN-Index vẫn giảm thêm trong tuần đầu (−10,9% và
  −2,8%), rồi mới tăng sau 3 tháng (+16% và +4,6%).

## 3. Giới hạn

- **Mẫu nhỏ:** chỉ 12 lần. Bốn lần năm 2023 nằm sát nhau nên kết quả 3 tháng của chúng gối lên nhau.
- **Thiếu mã đã huỷ niêm yết**, nên kết quả có thể đẹp hơn thực tế.
- **Tin đã được biết trước có thể đã vào giá**, nên phản ứng sẽ nhỏ hơn.

## 4. Tái lập

```
python3 loc-co-phieu/nghien-cuu/su_kien_lai_suat.py [MÃ …]
```
