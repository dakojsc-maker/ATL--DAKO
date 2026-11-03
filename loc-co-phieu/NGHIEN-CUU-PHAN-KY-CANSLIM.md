# So sánh hai phương pháp: phân kỳ dương RSI/MACD và CANSLIM (thị trường Việt Nam 2014–2026)

*Thực hiện tháng 11/2026 trên dữ liệu ngày 2012–10/2026 của 1.522 cổ phiếu HOSE, HNX, UPCOM (nguồn Vietcap) và số
liệu tài chính quý của KBS. Mọi con số là kết quả mô phỏng có trừ phí, thuế, theo luật T+2. Đây là tài liệu hỗ trợ ra
quyết định, không phải lời khuyên đầu tư.*

## 1. Kết luận ngắn

| | Phân kỳ dương RSI/MACD | CANSLIM | Lướt sóng 5–7% (công cụ) |
|---|---|---|---|
| Lãi/lỗ bình quân mỗi lệnh | **âm** ở mọi biến thể (−0,3% đến −1,3%) | **+1,6%** (khi thị trường tăng, bán kiểu O'Neil) | +0,4% đến +0,9% |
| Tỷ lệ thắng | 44–52% | **38%** (ít lệnh thắng nhưng thắng lớn) | 55–60% |
| Tài khoản mô phỏng 2017–10/2026 | **mất 15%/năm** (RSI) hoặc −1 đến −2%/năm | **+9,0%/năm** | **+10,7%/năm** |
| Mức sụt giảm tài khoản lớn nhất | −81% (RSI) / −29% | −41% | **−19%** |
| Số năm tài khoản có lãi (2017–2026) | 1–3/10 | 5/10 (lãi dồn vào 2017, 2021) | **8/10** |

*VN-Index (mua và giữ) cùng giai đoạn: +10,1%/năm, sụt giảm lớn nhất −45%.*

1. **Phân kỳ dương RSI/MACD không nên dùng làm tín hiệu mua.** Mọi biến thể đều lỗ sau phí, kết quả không tốt hơn
   mua ngẫu nhiên. Phân kỳ chỉ cho biết đà giảm đang chậm lại, chưa cho biết đà tăng đã bắt đầu.
2. **CANSLIM tốt hơn hẳn, nhưng chỉ khi có đủ hai điều kiện:**
   - thị trường đang "TĂNG – thuận lợi" (chữ M);
   - **bán kiểu O'Neil**: chốt lời +20%, cắt lỗ −7%, tối đa 40 phiên. Nếu chốt sớm ở +7% thì CANSLIM lại lỗ, vì lợi
     nhuận của nó đến từ số ít mã tăng rất mạnh.

   Điểm yếu: lãi tập trung vào các năm tăng mạnh (2017, 2020–2021). **Từ 2022 đến nay, tài khoản CANSLIM lỗ 4/5 năm.**
3. **Cho mục tiêu ngắn hạn, lướt sóng 5–7% của công cụ là lựa chọn tốt nhất trong ba cách.** Lãi cao nhất, sụt giảm
   thấp nhất và đều đặn nhất qua các năm. Nên dùng CANSLIM như **bộ lọc bổ sung**: ưu tiên mã vừa vượt đỉnh với khối
   lượng lớn và có lợi nhuận quý tăng mạnh, chỉ khi thị trường tăng thuận lợi.

## 2. Cách kiểm định

- **Dữ liệu:** giá ngày đã điều chỉnh cổ tức/chia tách. Chỉ xét mã đủ thanh khoản: giá trị giao dịch bình quân 20 phiên
  ≥ 3 tỷ đồng, có ≥ 1 năm lịch sử.
- **Luật Việt Nam:**
  - tín hiệu cuối phiên thì mua giá mở cửa phiên sau; trần cứng thì không mua được;
  - T+2: hai phiên đầu không bán được, phiên thứ ba chỉ bán buổi chiều;
  - sàn cứng thì không bán được;
  - phí mua 0,15%, phí bán 0,15% + thuế 0,1%, cắt lỗ trượt giá thêm 0,2%.
- **Cách bán** ghi theo dạng chốt lời / cắt lỗ / số phiên tối đa:
  - "+7/−7/20" là kiểu lướt sóng;
  - "+20/−7/40" là kiểu O'Neil (cha đẻ CANSLIM).
- **Hai cách đo:**
  - **theo lệnh:** mỗi ngày lấy tối đa 5 mã có tín hiệu, một mã chỉ giữ một lệnh;
  - **theo tài khoản:** tối đa 5 mã cùng lúc, mỗi mã 20% tài sản, chỉ mua khi còn chỗ trống, tiền nhàn rỗi không tính
    lãi. Cách này giống người đầu tư thật nhất.
- **Không tối ưu tham số:** phân kỳ và CANSLIM dùng đúng định nghĩa sách vở, ngưỡng là số tròn. Vì vậy kết quả không bị
  "học vẹt".

## 3. Phân kỳ dương RSI/MACD

**Định nghĩa** tại phiên t, chỉ dùng dữ liệu đến t:
- đáy gần nằm trong 5 phiên trước t; đáy trước nằm trong khoảng 12–60 phiên trước;
- giá tạo **đáy thấp hơn**; giữa hai đáy giá đã hồi ≥ 3%;
- **RSI(14) phân kỳ dương:** RSI ở đáy trước < 35 (quá bán), RSI ở đáy gần cao hơn ít nhất 3 điểm;
- **MACD(12,26,9) phân kỳ dương:** MACD ở đáy trước < 0, MACD ở đáy gần cao hơn;
- **xác nhận mua:** giá đóng cửa vượt đỉnh của phiên tạo đáy gần và tăng so với hôm qua, hoặc MACD cắt lên đường tín
  hiệu trong 3 phiên gần nhất.

**Kết quả theo lệnh, 2014–10/2026** (bán +7/−7/20):

| Biến thể | Số lệnh | Thắng | TB mỗi lệnh | Hệ số lợi nhuận | Năm có lãi |
|---|---|---|---|---|---|
| *Mua mọi mã mọi ngày (để so sánh)* | – | *49%* | *−0,57%* | – | – |
| A. RSI phân kỳ + nến xác nhận | 1.093 | 50% | −0,70% | 0,82 | 2/13 |
| B. MACD phân kỳ + nến xác nhận | 1.481 | 46% | −1,22% | 0,70 | 2/13 |
| C. Cả RSI và MACD + nến xác nhận | 663 | 48% | −0,89% | 0,77 | 2/13 |
| D. Cả RSI và MACD + MACD cắt lên | 414 | 52% | −0,27% | 0,92 | 4/13 |
| D, bán kiểu O'Neil +20/−7/40 | 408 | 38% | +0,74% | 1,15 | 5/13 |
| C + giá trên MA200 | 105 | 50% | −0,50% | 0,86 | 3/13 |
| C + thị trường không giảm | 288 | 45% | −1,27% | 0,69 | 2/13 |
| C + thị trường tăng thuận lợi | 115 | 44% | −1,33% | 0,66 | 5/13 |

- Tín hiệu phân kỳ xuất hiện chủ yếu khi thị trường giảm. Đó cũng là lúc nó đỡ tệ nhất: biến thể D hòa vốn (+0,01%),
  biến thể A −0,28%. Lọc thêm xu hướng hoặc thị trường tốt lại làm kết quả xấu đi.
- Biến thể D bán kiểu O'Neil có lãi +0,74%/lệnh, nhưng chỉ có lãi 5/13 năm, chủ yếu nhờ 2021–2022. Không đủ tin cậy.

## 4. CANSLIM

**Định nghĩa đã dùng:**

| Chữ | Ý nghĩa | Điều kiện kiểm định |
|---|---|---|
| C | Lợi nhuận quý gần nhất tăng mạnh | LNST của cổ đông công ty mẹ quý gần nhất đã công bố tăng ≥ 25% so với cùng kỳ |
| A | Lợi nhuận năm tốt | ROE 4 quý ≥ 15% và EPS 4 quý > 0 |
| N | Điểm mới: vượt nền, lập đỉnh | Cách đỉnh 52 tuần ≤ 5%, đóng cửa ở đỉnh 20 phiên, phiên tăng giá |
| S | Cung – cầu | Khối lượng phiên vượt đỉnh ≥ 1,5 lần bình quân 50 phiên |
| L | Mã dẫn đầu | Sức mạnh giá 12 tháng thuộc top 20% thị trường |
| I | Tổ chức mua vào | *Không có dữ liệu – bỏ qua* |
| M | Thị trường chung | VN-Index ở trạng thái "TĂNG – thuận lợi" (cùng định nghĩa với công cụ) |

**Phần kỹ thuật (N, S, L, M) kiểm định được 13 năm.** Nguồn số liệu tài chính chỉ có 4 quý đáng tin, kèm ngày công bố
thật, nên **C và A chỉ kiểm định được từ 2/2026**.

**Kết quả theo lệnh, 2014–10/2026:**

| Biến thể | Cách bán | Số lệnh | Thắng | TB mỗi lệnh | Hệ số lợi nhuận | Năm có lãi |
|---|---|---|---|---|---|---|
| *Mua mọi mã mọi ngày* | +20/−7/40 | – | *35%* | *+0,12%* | – | – |
| N + S + L (chưa xét thị trường) | +20/−7/40 | 1.729 | 36% | +0,68% | 1,12 | 8/13 |
| **N + S + L + M** | **+20/−7/40** | **880** | **38%** | **+1,58%** | **1,29** | **8/13** |
| N + S + L + M + xu hướng (trên MA50, MA200 đi lên) | +20/−7/40 | 854 | 38% | +1,61% | 1,29 | 8/13 |
| N + S + L + xu hướng, thị trường không giảm | +20/−7/40 | 1.430 | 36% | +0,93% | 1,16 | 7/13 |
| N + S + L + M | **+7/−7/20** | 977 | 53% | **−0,67%** | 0,84 | 2/13 |

- Với cách bán O'Neil, lệnh thắng lãi bình quân **+18,6%**, lệnh thua lỗ bình quân −8,9%. Chỉ cần thắng 4/10 lệnh là có
  lãi tốt.
- **Chữ M quan trọng nhất.** Cùng tín hiệu N + S + L, lãi bình quân mỗi lệnh thay đổi theo thị trường:
  - thị trường giảm: −0,44%;
  - có áp lực: +0,39%;
  - tăng thuận lợi: **+1,31%**.
- Theo năm (N + S + L + M, bán O'Neil), lãi bình quân mỗi lệnh:

  | 2014 | 2015 | 2016 | 2017 | 2018 | 2019 | 2020 | 2021 | 2022 | 2023 | 2024 | 2025 | 2026 |
  |---|---|---|---|---|---|---|---|---|---|---|---|---|
  | +1,7% | −2,0% | +2,5% | +4,0% | −2,3% | +0,3% | +7,2% | +2,6% | −5,1% | −2,2% | +1,0% | +0,8% | −7,7% |

  *2026: mới có 11 lệnh, vì thị trường ít khi ở trạng thái tăng thuận lợi.*

**Thêm C và A (2/2026–10/2026, thị trường yếu, mua mọi mã cùng kỳ lỗ −3,3%/lệnh), bán +20/−7/40:**

| Biến thể | Lệnh đã đóng | Thắng | TB mỗi lệnh |
|---|---|---|---|
| N + S + L (chỉ kỹ thuật) | 66 | 24% | −3,51% |
| **N + S + L + C + A** | **10** | **30%** | **+0,77%** |
| Chỉ C + A + L (lợi nhuận tăng mạnh, giá khỏe, không cần vượt đỉnh) | 164 | 25% | −2,33% |
| Chỉ C + A (lọc cơ bản thuần) | 367 | 25% | −2,31% |

- Lợi nhuận tăng mạnh **giúp lọc bớt breakout giả**: lỗ −3,5% thành lãi +0,8%. Tuy vậy mẫu mới có 10 lệnh, chưa đủ để
  kết luận chắc chắn.
- Chỉ lọc theo lợi nhuận mà **không chờ giá vượt đỉnh** thì vẫn lỗ như mua ngẫu nhiên. Có thể vì kết quả kinh doanh tốt
  thường đã được phản ánh vào giá. Lợi nhuận tốt chỉ có ích khi giá cũng xác nhận.

## 5. So sánh trên tài khoản mô phỏng (2017 → 10/2026)

Tài khoản bắt đầu với 1 đồng vốn, tối đa 5 mã, mỗi mã 20%. Mức sụt giảm tính theo lệnh đã bán.

| Phương pháp | Tài sản cuối | Lãi kép/năm | Sụt giảm lớn nhất | Số lệnh | Thắng | TB mỗi lệnh | Giữ TB | Dùng vốn |
|---|---|---|---|---|---|---|---|---|
| VN-Index (mua và giữ) | ×2,56 | +10,1% | −45% | – | – | – | – | 100% |
| Phân kỳ RSI + nến xác nhận | ×0,21 | **−14,9%** | −81% | 576 | 46% | −1,25% | 10 phiên | 49% |
| Phân kỳ RSI + MACD, MACD cắt lên | ×0,85 | −1,7% | −29% | 285 | 52% | −0,20% | 11 phiên | 25% |
| – như trên, bán kiểu O'Neil | ×0,91 | −1,0% | −39% | 249 | 36% | +0,06% | 22 phiên | 44% |
| **CANSLIM N + S + L + M, bán kiểu O'Neil** | **×2,32** | **+9,0%** | −41% | 354 | 38% | +1,48% | 14 phiên | 39% |
| – thêm điều kiện xu hướng | ×2,19 | +8,3% | −42% | 346 | 38% | +1,43% | 14 phiên | 39% |
| – bán sớm +7/−7/20 | ×0,33 | −10,7% | −71% | 526 | 52% | −0,92% | 7 phiên | 30% |
| **Lướt sóng 5–7% của công cụ** | **×2,71** | **+10,7%** | **−19%** | 637 | **60%** | +0,87% | 10 phiên | 54% |

**Lãi/lỗ tài khoản theo năm:**

| Năm | VN-Index | Phân kỳ RSI | Phân kỳ RSI + MACD | CANSLIM (O'Neil) | Lướt sóng |
|---|---|---|---|---|---|
| 2017 | +46% | −11% | 0% | **+74%** | +23% |
| 2018 | −9% | −16% | −7% | +1% | +6% |
| 2019 | +8% | 0% | +2% | −4% | +17% |
| 2020 | +15% | −14% | −6% | +18% | +11% |
| 2021 | +36% | +22% | +22% | **+100%** | +35% |
| 2022 | −33% | −42% | +2% | −14% | +4% |
| 2023 | +12% | −14% | −11% | −3% | −3% |
| 2024 | +12% | −19% | −9% | +1% | +11% |
| 2025 | +41% | −12% | −2% | −15% | +8% |
| 2026 (đến 10/2026) | −3% | −26% | −3% | −18% | −2% |

**Đọc bảng:**
- **CANSLIM** kiếm tiền rất mạnh trong năm "sóng lớn" (2017, 2021), nhưng phần lớn thời gian còn lại lỗ nhẹ.
- Năm 2025 VN-Index tăng 41% mà CANSLIM vẫn lỗ. Sóng tăng năm đó rất hẹp: cổ phiếu trung vị chỉ tăng 3%, và chỉ 14% số
  mã tăng hơn chỉ số. Phần lớn các mã vượt đỉnh đã thất bại.
- **Lướt sóng** lãi đều hơn. Năm 2022 thị trường giảm 33% mà vẫn lãi 4%, vì công cụ đứng ngoài khi thị trường xấu.
- Lướt sóng chỉ dùng trung bình 54% vốn, CANSLIM 39%. Phần còn lại là tiền mặt, nên rủi ro thấp hơn mua và giữ.

## 6. Nên dùng thế nào

1. **Bỏ phân kỳ dương RSI/MACD** khỏi tiêu chí mua. Có thể xem nó như dấu hiệu "đà giảm chậm lại" để không bán tháo,
   nhưng không dùng để mua.
2. **Chiến lược chính cho ngắn hạn: lướt sóng 5–7% của công cụ.** Mua theo tín hiệu, chốt +7%, cắt −7%, tối đa 20 phiên.
3. **CANSLIM dùng bổ sung, chỉ khi thị trường "TĂNG – thuận lợi":**
   - mua mã vừa vượt đỉnh với khối lượng ≥ 1,5 lần bình quân, sức mạnh giá top 20%;
   - ưu tiên mã có LNST quý gần nhất tăng ≥ 25% và ROE ≥ 15%;
   - không mua khi giá đã cao hơn điểm vượt nền quá 5%;
   - **cắt lỗ −7% bắt buộc**; để lãi chạy tới +20%, tối đa 40 phiên (khoảng 2 tháng);
   - chấp nhận chỉ khoảng 4/10 lệnh thắng.
4. **Khi thị trường giảm hoặc có áp lực: giữ phần lớn tiền mặt.** Cả hai phương pháp đều lỗ bình quân trong trạng thái
   này.

## 7. Giới hạn cần biết

- **Lướt sóng được xây dựng từ chính bộ dữ liệu này** (xem `NGHIEN-CUU-LUOT-SONG.md`), nên kết quả của nó có thể đẹp hơn
  thực tế. Phân kỳ và CANSLIM dùng định nghĩa sách vở, không tối ưu, nên không bị lỗi này. Nhật ký gợi ý của công cụ sẽ
  đo kết quả thật.
- **Chưa kiểm định được chữ I** (sở hữu tổ chức). **C và A chỉ có 9 tháng số liệu**, mẫu rất nhỏ. Tiêu chí A chưa đo
  được tăng trưởng 3 năm như O'Neil.
- Danh sách mã chỉ gồm mã còn niêm yết, chưa có mã đã huỷ niêm yết, nên mọi phương pháp có thể đẹp hơn thực tế một chút.
- Tài khoản mô phỏng ghi nhận lãi/lỗ khi bán, nên mức sụt giảm thực tế khi đang giữ có thể sâu hơn một chút.

## 8. Tái lập

```
python3 loc-co-phieu/nghien-cuu/tai_tai_chinh.py        # số liệu tài chính quý (KBS, ~5 phút)
python3 loc-co-phieu/nghien-cuu/phan_ky.py              # mục 3
python3 loc-co-phieu/nghien-cuu/canslim.py              # mục 4
python3 loc-co-phieu/nghien-cuu/so_sanh.py              # mục 5
python3 loc-co-phieu/nghien-cuu/danh_muc_ngan_han.py    # lọc danh mục ngắn hạn phiên mới nhất
```
