# Nghiên cứu: vì sao cổ phiếu tăng/giảm ngược thị trường, và chiến lược lướt sóng 5–7% nào đáng tin

*Thực hiện tháng 10/2026 trên dữ liệu ngày 2012–2026 của 1.522 cổ phiếu HOSE, HNX, UPCOM (nguồn Vietcap). Mọi con số
dưới đây là kết quả mô phỏng có trừ phí, thuế. Đây là tài liệu hỗ trợ ra quyết định, không phải lời khuyên đầu tư.*

## 1. Câu hỏi

1. Vì sao khi thị trường giảm vẫn có nhiều cổ phiếu tăng, và khi thị trường tăng vẫn có nhiều cổ phiếu giảm?
2. Có bộ chỉ báo nào đủ tin cậy để mua/bán kịp thời ở cả thị trường tăng lẫn giảm, với mục tiêu tỷ lệ thắng cao
   (lãi 5–7% mỗi lệnh là đủ)?

## 2. Cách làm (để kết quả trung thực)

- **Dữ liệu:** 14 năm giá ngày đã điều chỉnh cổ tức/chia tách, kèm mã ngành ICB cấp 2. Chỉ xét cổ phiếu đủ thanh khoản
  (giá trị giao dịch bình quân 20 phiên ≥ 3 tỷ đồng) và có ≥ 1 năm lịch sử. Tổng cộng 515.552 cặp (ngày, mã) từ 2014 đến
  10/2026.
- **Mô phỏng lệnh đúng luật Việt Nam:**
  - tín hiệu cuối phiên thì mua giá mở cửa phiên sau; trần cứng thì không mua được;
  - **T+2:** hai phiên đầu không bán được, phiên thứ ba chỉ bán buổi chiều;
  - sàn cứng thì không bán được, chờ phiên sau;
  - chạm cả chốt lời lẫn cắt lỗ trong cùng phiên thì tính là cắt lỗ (thận trọng);
  - **phí mua 0,15%, phí bán 0,15% + thuế 0,1%**, cắt lỗ trượt giá thêm 0,2%.
- **Chống "học vẹt":** kiểm định đi tiếp theo năm. Muốn đánh giá năm Y thì mọi thứ (chỉ báo nào được chọn, trọng số) chỉ
  được học từ các năm trước Y. Một quy tắc chỉ được coi là đáng tin khi có lãi ở phần lớn các năm, không chỉ cộng dồn
  có lãi.

## 3. Vì sao có cổ phiếu đi ngược thị trường?

Quy ước: "tăng mạnh" là tăng ≥ 7% sau 20 phiên, "giảm mạnh" là giảm ≥ 7% sau 20 phiên.

| Trạng thái thị trường | Tỷ lệ ngày | Mã tăng mạnh | Mã giảm mạnh |
|---|---|---|---|
| Điều chỉnh / giảm | 33% | **27%** | 23% |
| Tăng nhưng có áp lực | 35% | 22% | 26% |
| Tăng thuận lợi | 32% | 26% | 25% |

Bạn nhận xét đúng: ngay cả khi thị trường giảm, cứ 4 cổ phiếu vẫn có hơn 1 mã tăng mạnh. Dữ liệu cho thấy **nguyên
nhân khác nhau theo từng trạng thái thị trường:**

- **Thị trường giảm:** mã tăng mạnh chủ yếu là **nhịp bật lại sau hoảng loạn**.
  - Yếu tố phân biệt rõ nhất là biến động của chính VN-Index: thị trường càng hoảng loạn thì nhịp hồi sau đó càng mạnh.
  - Kế đến là mã có **beta cao** (nhạy với thị trường): tỷ lệ thắng 48–50%, so với 38% ở mã beta thấp.
  - Và mã **vừa giảm sâu nhất trong tuần**: tỷ lệ thắng 50%.
  - Đặc điểm "cổ phiếu khỏe" (sức mạnh giá, xu hướng) gần như **không giúp ích** khi thị trường giảm.
- **Thị trường tăng thuận lợi:** mã thắng là mã **khỏe**:
  - sát đỉnh 52 tuần;
  - đóng cửa gần đỉnh 2–3 tuần;
  - nằm trên MA50;
  - ít biến động;
  - và thị trường đang lan tỏa rộng (nhiều mã cùng tăng).
- **Mã giảm khi thị trường tăng** thường là mã:
  - biến động mạnh, đầu cơ (ATR cao);
  - đang nằm dưới MA20/MA50;
  - xa đỉnh 52 tuần;
  - hoặc tăng khi chính thị trường đã tăng nóng 3 tháng (cuối sóng).

**Điểm quan trọng nhất:** trong 20 phiên, biến động của một cổ phiếu bị chi phối chủ yếu bởi thị trường chung. Các chỉ
báo kỹ thuật chỉ giải thích được một phần nhỏ, nên không có chỉ báo nào cho tỷ lệ thắng cao một cách đều đặn.

## 4. Chỉ báo nào đáng tin qua 13 năm?

Đo bằng "hệ số thông tin". Mỗi ngày, xếp hạng các mã theo chỉ báo và đối chiếu với lợi nhuận 20 phiên sau, rồi đếm số
năm chỉ báo đúng chiều.

| Chỉ báo | Chiều tốt | Số năm đúng chiều |
|---|---|---|
| Biến động 20 phiên (độ lệch chuẩn) | **thấp** tốt hơn | **13/13** |
| ATR% (biên dao động bình quân) | **thấp** tốt hơn | 12/13 |
| Đường sức mạnh giá (so với VN-Index) sát đỉnh 3 tháng | gần đỉnh tốt hơn | 11/13 |
| Khoảng cách tới đỉnh 52 tuần | gần đỉnh tốt hơn | 11/13 |
| Khoảng cách tới đỉnh 20 phiên | gần đỉnh tốt hơn | 11/13 |
| Biên dao động 10 phiên (nền chặt) | **hẹp** tốt hơn | 11/13 |
| Vị trí đóng cửa trong biên 14 phiên | gần đỉnh tốt hơn | 11/13 |
| Khối lượng 20 phiên so với 100 phiên | **giảm dần** tốt hơn | 10/13 |
| *Tăng giá 3–12 tháng (động lượng)* | *cao tốt hơn* | *chỉ 7–8/13 – không đáng tin* |
| *Chỉ báo thị trường chung (MA, độ rộng, ngày phân phối…)* | – | *gần như không dự báo được 10–20 phiên tới* |

Ba nhóm chỉ báo đáng tin nhất gợi lại đúng ý tưởng ban đầu "nền chặt sát đỉnh" của DRI/MSR:
- cổ phiếu **ít biến động**;
- **sát đỉnh**;
- **nền chặt, khối lượng cạn dần**.

Ngược lại, chỉ báo "tăng mạnh trong 3–12 tháng qua", thứ nhiều người hay dùng, lại không đáng tin ở thị trường Việt Nam.

## 5. Những cách KHÔNG hiệu quả (đã thử và loại)

| Cách thử | Kết quả kiểm định (sau phí) | Kết luận |
|---|---|---|
| Mô hình học máy dùng 69 chỉ báo | Lệnh chọn ra thắng ~46% (mua ngẫu nhiên 44%), TB −0,4%/lệnh; năm 2023 còn tệ hơn ngẫu nhiên | Học vẹt theo giai đoạn – loại |
| Điểm tổng hợp chỉ báo bền vững, mua bất kỳ lúc nào | Thắng hơn mua ngẫu nhiên 2–3 điểm %, nhưng TB vẫn âm (−0,2% đến −0,8%) | Chọn được mã "giảm ít hơn", chưa đủ để lãi 5–7% |
| Bắt đáy sau phiên thị trường hoảng loạn | TB −0,2% đến −1,7%/lệnh; lỗ nặng năm 2014, 2022 | Không đáng tin |
| Mua mã quá bán sâu (RSI2 ≤ 5, giảm ≥ 10%/tuần) | TB −1,4%/lệnh, có lãi 3/13 năm | Loại |
| Mua mã dẫn dắt khi thị trường đang giảm | TB +0,1%/lệnh, có lãi 7/13 năm | Không đáng tin |
| Mua mọi mã khi thị trường tăng thuận lợi | TB −0,5%/lệnh | Phải chọn mã |
| Breakout mẫu DRI/MSR khi thị trường chưa thuận lợi | −2,2% đến −3,2%/lệnh | Chỉ dùng khi thị trường tăng thuận lợi |

## 6. Chiến lược lướt sóng được chọn

Đây là chiến lược đơn giản, với ngưỡng là số tròn chứ không tối ưu từng chút. Công cụ chỉ báo mua khi có **một trong hai
tình huống**:

1. **Thị trường vừa xác nhận tăng lại sau nhịp điều chỉnh.** Điều kiện của VN-Index:
   - đang thấp hơn đỉnh 60 phiên từ 8% trở lên;
   - đã hồi ≥ 3% từ đáy 20 phiên;
   - hôm nay tăng ≥ 1,2% với khối lượng lớn hơn hôm qua.

   Khi đó mua những mã mạnh nhất: sức mạnh giá thuộc top 20% và nằm trên MA50.
2. **Thị trường đang "TĂNG – thuận lợi"** (cùng định nghĩa với phần còn lại của công cụ). Khi đó mua **mã dẫn dắt ít
   biến động**, thoả cả bốn điều kiện:
   - cách đỉnh 52 tuần ≤ 10%;
   - đường sức mạnh giá sát đỉnh 3 tháng;
   - ATR ≤ 3,5%;
   - nằm trên MA50.

Trong các mã đạt chuẩn, công cụ xếp theo điểm tổng hợp của các chỉ báo bền vững ở mục 4 và lấy tối đa 3 mã mỗi ngày.

**Cách giao dịch:**
- mua đầu phiên sau, không mua nếu giá cao hơn giá tham chiếu quá 2%;
- **chốt lời +7%, cắt lỗ −7%** tính từ giá mua;
- sau 20 phiên chưa chạm mức nào thì bán hết.

**Kết quả kiểm định 2017–2026** (đi tiếp theo năm, đã trừ phí, thuế, theo luật T+2):

| | Số lệnh | Tỷ lệ thắng | Lãi/lỗ bình quân mỗi lệnh | Hệ số lợi nhuận |
|---|---|---|---|---|
| **Cả chiến lược** | 2.138 | **55%** | **+0,38%** | 1,12 |
| – Thị trường xác nhận tăng | 129 | **62%** | **+1,55%** | – |
| – Mã dẫn dắt khi thị trường tăng | 1.625 | 55% | +0,38% | – |

Kết quả theo từng năm, ghi theo dạng tỷ lệ thắng / lãi bình quân mỗi lệnh:

| Năm | Thắng / lãi bình quân |
|---|---|
| 2017 | 62% / +1,2% |
| 2018 | 51% / −0,2% |
| 2019 | 43% / −0,5% |
| 2020 | 63% / +1,4% |
| 2021 | 52% / 0,0% |
| 2022 | 43% / −0,7% |
| 2023 | 53% / −0,1% |
| 2024 | 56% / +0,4% |
| 2025 | 55% / +0,3% |
| 2026 (đến tháng 10) | 47% / −0,2% |

**Nếu muốn tỷ lệ thắng cao hơn:** chốt lời sớm ở +5% (cắt lỗ vẫn −7%) cho tỷ lệ thắng **61–62%**. Nhưng lãi bình quân
chỉ còn khoảng +0,1% mỗi lệnh, vì mỗi lệnh thua lỗ nhiều hơn mỗi lệnh thắng. Vì vậy công cụ dùng +7%/−7%.

**Lợi thế này mỏng.** Nó chủ yếu đến từ việc **chỉ giao dịch khi thị trường thuận lợi** và **đứng ngoài khi thị trường
giảm hoặc có áp lực**. Khi công cụ báo "không có tín hiệu", đứng ngoài chính là quyết định đúng nhất theo dữ liệu.

## 7. Thông tin thêm

- **Mùa vụ:** tính trên mọi mã, chốt +7% / cắt −7% / 20 phiên.
  - Vào lệnh **tháng 2** (sau Tết): thắng 58%, +0,8%/lệnh. Vào lệnh **tháng 5**: thắng 60%, +1,1%/lệnh.
  - Tháng **3, 4, 9, 10** kém nhất: thắng 40–43%, khoảng −1,6% đến −2%/lệnh. **Tháng 10** chỉ 3/13 năm có lãi.

  Đây là thống kê để tham khảo, công cụ không dùng làm điều kiện.
- **Giờ mua:** ngày thị trường xác nhận tăng, giá mở cửa hôm sau trung bình cao hơn giá đóng cửa 0,3%. Nếu mua được
  ngay phiên ATC hôm đó, lãi bình quân tăng lên khoảng +1,0% mỗi lệnh. Ngược lại, sau phiên hoảng loạn, giá hôm sau
  thường mở cửa thấp hơn (−0,5%).
- **Phí:** dùng công ty chứng khoán phí thấp (tổng 0,2% thay vì 0,4%) cộng thêm khoảng +0,2% mỗi lệnh.

## 8. Giới hạn cần biết

- Danh sách mã chỉ gồm mã còn niêm yết, chưa có mã đã huỷ niêm yết, nên kết quả có thể đẹp hơn thực tế một chút.
- Chỉ dùng giá và khối lượng. Chưa có dữ liệu cơ bản (lợi nhuận quý), khối ngoại, tin tức. Đây thường là lý do thật khiến
  một mã như DRI (giá cao su) hay MSR (giá vonfram) tăng ngược thị trường.
- Hai tình huống mua được chọn sau khi đã xem kết quả của nhiều mẫu hình, nên kết quả thực tế có thể thấp hơn.
  **Nhật ký gợi ý** sẽ đo kết quả thật. Chỉ nên tăng vốn cho chiến lược khi nhật ký có ≥ 30 lệnh đã đóng mà vẫn có lãi.

## 9. Tái lập nghiên cứu

```
python3 loc-co-phieu/nghien-cuu/tai_lich_su.py          # tải 14 năm dữ liệu (~4 phút)
python3 loc-co-phieu/nghien-cuu/xay_du_lieu.py          # đặc trưng + mô phỏng 24 cấu hình (~6 phút)
python3 loc-co-phieu/nghien-cuu/phan_tich.py            # mục 3
python3 loc-co-phieu/nghien-cuu/do_on_dinh.py           # mục 4
python3 loc-co-phieu/nghien-cuu/huan_luyen.py           # mô hình học máy (mục 5)
python3 loc-co-phieu/nghien-cuu/mau_hinh.py             # các mẫu hình (mục 5)
python3 loc-co-phieu/nghien-cuu/tong_hop.py             # điểm tổng hợp đi tiếp
python3 loc-co-phieu/nghien-cuu/chien_luoc_cuoi.py      # mục 6
```
