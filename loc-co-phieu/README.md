# Công cụ lọc cổ phiếu mẫu DRI/MSR

> **Không rành kỹ thuật?** Đọc [HUONG-DAN-NHANH.md](HUONG-DAN-NHANH.md): bạn chỉ cần nhắn Claude "lọc cổ phiếu", không phải cài hay gõ lệnh gì.

Công cụ quét cổ phiếu HOSE, HNX và UPCOM để tìm mã đang lặp lại mẫu hình của **DRI** và **MSR** (breakout tuần 21–25/9/2026):

> xu hướng lớn đi lên → rũ bỏ → tăng mạnh 4–6 tuần → **tích lũy chặt sát đỉnh 2–6 tuần, không bán tháo**
> → **phiên vượt đỉnh nền với khối lượng ≥ 1,5× bình quân** → nắm giữ theo dừng lỗ động.

Mỗi lần chạy, công cụ chia cổ phiếu thành các nhóm: **MUA** (breakout hôm nay), **còn trong vùng mua**, **theo dõi**
(nền chặt, chờ vượt pivot), **đang chạy** (nắm giữ, kèm dừng lỗ động) và **cảnh báo bán**. Mỗi mã có sẵn pivot, giá mua tối đa,
mức cắt lỗ, hai mục tiêu và số cổ phiếu nên mua. Nếu bạn khai báo danh mục đang giữ, công cụ báo luôn mã nào cần
**giữ / chốt lời một phần / bán / cắt lỗ**.

Phân tích chi tiết vì sao DRI và MSR tăng, cùng toàn bộ quy tắc mua/bán: **[PHAN-TICH-DRI-MSR.md](PHAN-TICH-DRI-MSR.md)**.

---

## 1. Cài đặt (làm một lần)

1. Cài **Python 3.9 trở lên**. Trên Windows, tải từ python.org và khi cài nhớ tích ô *Add python.exe to PATH*.
2. Mở cửa sổ lệnh tại thư mục `loc-co-phieu`, rồi chạy:
   ```bash
   pip install -r requirements.txt
   python loc_co_phieu.py --kiem-tra      # kiểm tra kết nối các nguồn dữ liệu
   ```
3. Lần quét đầu tiên mất khoảng 3–8 phút vì phải tải khoảng 1,7 năm dữ liệu của ~1.600 mã. Từ lần sau công cụ chỉ tải phần
   mới (dữ liệu cũ đã lưu trong `.cache/`), và các mã quá kém thanh khoản được bỏ qua tối đa 7 ngày, nên nhanh hơn nhiều.

Trên Windows có thể bấm đúp **`chay-loc.bat`**, trên macOS/Linux chạy **`./chay-loc.sh`**. Hai tệp này quét xong sẽ tự mở báo
cáo HTML.

## 2. Các lệnh dùng hằng ngày

| Lệnh | Dùng khi nào |
|---|---|
| `python loc_co_phieu.py` | **Quét toàn thị trường** – chạy sau 15:30 hoặc buổi tối |
| `python loc_co_phieu.py --theo-doi` | **14:00–14:25**: chỉ quét lại danh sách theo dõi của lần quét trước (≈30–40 mã, chưa tới 1 phút) |
| `python loc_co_phieu.py --danh-muc danh-muc.txt` | Kiểm tra tín hiệu bán cho các mã đang giữ (ghép thêm được với `--theo-doi`) |
| `python loc_co_phieu.py --ma DRI MSR HPG` | Phân tích chi tiết: bảng kiểm từng điều kiện, các mức giá, khung tuần, lịch sử tín hiệu của mã |
| `python loc_co_phieu.py --ma DRI MSR --ngay 2026-09-22` | Xem công cụ sẽ báo gì vào cuối một phiên trong quá khứ (để đối chiếu, học mẫu) |
| `python loc_co_phieu.py --von 500` | Gợi ý số cổ phiếu nên mua với tổng vốn 500 triệu (mỗi lệnh chỉ rủi ro 1% vốn, mỗi mã ≤ 25% vốn) |
| `python loc_co_phieu.py --hieu-qua` | Chỉ cập nhật **nhật ký gợi ý**: lời/lỗ từng gợi ý trước đây, tỷ lệ thắng, độ tin cậy (nhanh) |
| `python loc_co_phieu.py --kiem-dinh` | In thêm danh sách tín hiệu gần nhất của phần kiểm định quá khứ (~1,5 năm dữ liệu) |
| `python loc_co_phieu.py --gio` | Xem đang ở phiên nào và lúc này nên chạy lệnh gì |

Các tuỳ chọn khác: `--san UPCOM` (chỉ quét một sàn), `--gtgd 5` (GTGD tối thiểu 5 tỷ/phiên), `--gia 10`,
`--top 50`, `--nguon KBS,VCI`, `--khong-cache`, `--csv-dir thu-muc/` (chạy offline). Xem đầy đủ bằng `python loc_co_phieu.py -h`.

Kết quả được in ra màn hình và lưu vào `ket-qua/` gồm tệp `.md`, `.html`, `.csv` và `nhat-ky-goi-y.csv` (nhật ký gợi ý,
mở được bằng Excel). Hai tệp `moi-nhat.html` và
`moi-nhat.md` luôn là kết quả lần chạy gần nhất.

## 3. Nên gửi yêu cầu lọc lúc mấy giờ?

**Ngắn gọn: quét chính sau 15:30, tốt nhất 19:00–22:00. Nếu muốn mua ngay trong phiên breakout thì chạy thêm `--theo-doi`
lúc 14:00–14:25. Tránh 9:00–10:00.**

| Thời điểm (giờ VN) | Mức | Chạy gì | Lý do |
|---|---|---|---|
| **Sau 15:30 → tối (19:00–22:00)** | ★★★ | Quét toàn thị trường | Tín hiệu dựa trên **giá đóng cửa và khối lượng cả ngày**, đã xác nhận, không còn nhiễu. Các nguồn dữ liệu chốt số liệu cuối ngày khoảng 15:15–15:30 (UPCOM khớp lệnh đến 15:00). Có cả buổi tối để lập kế hoạch và đặt cảnh báo giá cho phiên mai |
| **Thứ Sáu sau 15:30 / cuối tuần** | ★★★ | Quét toàn thị trường | Nến tuần đã đóng. Bạn đang soi mẫu trên biểu đồ tuần, nên đây là lúc rà lại toàn bộ danh sách cho tuần tới |
| **14:00–14:25** | ★★☆ | `--theo-doi` | Lúc này khoảng 70% khối lượng ngày đã khớp, nên khối lượng dự phóng sai lệch chỉ còn khoảng ±10%. Mã nào đang vượt pivot với KL dự phóng ≥ 1,5× thì đặt mua trong ATC (HOSE/HNX 14:30–14:45) hoặc trước 15:00 (UPCOM). Như vậy bạn mua ngay **trong phiên breakout**, không phải đuổi giá phiên sau |
| **11:30–13:00 (nghỉ trưa)** | ★★☆ | `--theo-doi --danh-muc danh-muc.txt` | Dữ liệu phiên sáng đã đứng yên: kiểm tra cắt lỗ danh mục và xem mã nào đang thử vượt pivot. Chưa nên mua ngay vì phiên chiều còn đảo chiều được |
| 10:00–11:30, 13:00–14:00 | ★☆☆ | (tuỳ chọn) | Xem được nhưng chưa nên quyết định |
| **9:00–10:00** | ☆☆☆ | **Không chạy** | Đầu phiên (ATO) giá và khối lượng rất nhiễu. Lúc 10:00 mới khớp khoảng 25% khối lượng ngày, dự phóng có thể lệch ±30–50%, và breakout giả xuất hiện nhiều nhất trong khung giờ này |

Vì sao không chạy giữa phiên rồi mua luôn? Vì toàn bộ mẫu hình dựa vào **giá đóng cửa vượt pivot** và **khối lượng cả
ngày**. Trong phiên, cả hai đều chưa có, công cụ chỉ ước lượng được. Hơn nữa cổ phiếu mua hôm nay phải đến chiều T+2 mới về
tài khoản để bán, nên mua càng gần cuối phiên càng ít rủi ro bị đảo chiều ngay trong ngày mua.

**Quy trình một ngày gợi ý:**
1. **Tối hôm trước (20:00):** chạy `python loc_co_phieu.py --danh-muc danh-muc.txt` → đọc nhóm MUA/THEO DÕI → trên app công
   ty chứng khoán, đặt **cảnh báo giá** tại pivot của các mã theo dõi → ghi kế hoạch cho từng mã: pivot, giá mua tối đa,
   mức cắt lỗ, khối lượng.
2. **9:00–10:00:** không làm gì ngoài xem cảnh báo. Mã nào mở cửa đã cao hơn giá mua tối đa (pivot +5%) thì bỏ, không mua đuổi.
3. **14:00–14:25:** chạy `python loc_co_phieu.py --theo-doi`. Mã ở nhóm **MUA** mà giá còn ≤ mua tối đa thì đặt lệnh trong
   ATC hoặc lệnh LO cuối phiên.
4. **Sau 15:30:** chạy lại quét đầy đủ để xác nhận. Mã vừa mua mà đóng cửa lại dưới pivot thì theo dõi sát: nếu thấp hơn pivot
   quá 3% thì đó là breakout thất bại, bán.
5. **Cuối tuần:** quét toàn thị trường và xem lại danh mục theo nến tuần.

Lưu ý: công cụ không biết lịch nghỉ lễ. Vào ngày lễ nó vẫn chạy nhưng không có nến mới.

## 4. Đọc kết quả

| Nhóm | Ý nghĩa | Việc cần làm |
|---|---|---|
| 🟢 **MUA – breakout hôm nay** | Phiên này đóng cửa vượt pivot, KL ≥ 1,5× TB20, nền đạt đủ điều kiện | Mua trong vùng pivot → "Mua tối đa"; đặt cắt lỗ ngay |
| 🟢 **Còn trong vùng mua** | Đã breakout trong 5 phiên gần nhất, giá vẫn ≤ pivot +5% | Vẫn mua được, có thể chờ nhịp kéo ngược |
| 👀 **Theo dõi** | Nền chặt sát đỉnh, chưa vượt pivot (xếp theo Điểm) | Đặt cảnh báo giá tại pivot; mua khi breakout có KL |
| 🟠 **Đã xa điểm mua** | Breakout nhưng đã > pivot +5% | Không mua đuổi, chờ kéo ngược hoặc nền mới |
| 🔵 **Đang chạy** | Đã breakout trong 8 tuần gần nhất, vẫn khỏe | Giữ theo dừng lỗ động; xem cột "Chốt 1 phần?" |
| 🔴 **Cảnh báo bán** | Breakout thất bại, thủng dừng lỗ động, gãy MA20 kèm KL lớn… | Bán nếu đang giữ; không mua |

Giải thích các cột:
- **Pivot**: đỉnh của nền. Giá đóng cửa vượt mức này kèm khối lượng thì đó là điểm mua. **Mua tối đa** = pivot +5%.
- **Cắt lỗ**: lấy mốc cao hơn giữa đáy nền và mức −7% từ giá mua. **MT1** = pivot +20%. **MT2** = pivot + độ dài nhịp tăng
  trước nền (cách đo "cán cờ" bạn đã vẽ trên biểu đồ MSR).
- **KL/TB20**: khối lượng phiên so với bình quân 20 phiên trước đó. Dấu `*` nghĩa là khối lượng dự phóng cả ngày (khi chạy
  trong phiên).
- **Nền / Biên độ / Cạn cung / Tăng trước nền**: số tuần tích lũy; độ rộng của nền; KL bình quân 5 phiên thấp nhất trong nền
  so với KL bình quân 50 phiên (càng thấp càng tốt); nhịp tăng từ đáy rũ bỏ lên đỉnh nền.
- **RS**: xếp hạng sức mạnh giá 1–99 so với toàn thị trường; ≥ 80 là nhóm dẫn dắt. **Điểm** (0–100): độ đẹp của mẫu hình,
  dùng để xếp hạng.
- **Bối cảnh thị trường** (đầu báo cáo): VN-Index so với MA20/MA50 và số ngày phân phối, kèm gợi ý tỷ trọng giải ngân.

## 5. Nhật ký gợi ý: công cụ có đáng tin không?

Mỗi gợi ý **MUA** (hoặc "còn trong vùng mua") được tự động ghi vào [`nhat-ky/goi-y.json`](nhat-ky/goi-y.json), mỗi
nhịp breakout của một mã chỉ ghi một lần. Tín hiệu tạm thời trong phiên (khối lượng mới là dự phóng) không được ghi, và
chạy lại quá khứ (`--ngay`) không đụng tới nhật ký. Mỗi lần chạy sau đó, công cụ đánh giá lại từng gợi ý chưa đóng như
thể đã **mua giá đóng cửa phiên gợi ý** rồi **bán đúng quy tắc của công cụ**, kiểm tra theo thứ tự trong từng phiên:

1. Giá thấp nhất chạm mức cắt lỗ thì bán ở mức đó (mở cửa đã thấp hơn thì bán giá mở cửa). Khi đã lãi ≥ 10%, mức này
   được dời lên giá vào (hoà vốn).
2. Đóng cửa thấp hơn pivot quá 3% (breakout thất bại) thì bán giá đóng cửa.
3. Khi đã lãi ≥ 20%: đóng cửa dưới max(giá vào +5%, MA20) thì bán giá đóng cửa (dừng lỗ động). Nếu đã lãi ≥ 35% hoặc
   giá cách MA20 ≥ 15%, dùng cả MA10.
4. Từ phiên thứ 6: đóng cửa dưới MA20 kèm KL ≥ bình quân 20 phiên, hoặc thủng MA50, thì bán giá đóng cửa.

Báo cáo luôn có bảng **Đang giữ** (lãi/lỗ đến hôm nay, mức dừng lỗ hiện tại, ngày chạm mục tiêu 1), bảng **Đã bán**
(ngày bán, giá bán, lãi/lỗ, lý do, so với VN-Index cùng thời gian) và các chỉ số:

| Chỉ số | Ý nghĩa |
|---|---|
| Tỷ lệ thắng | % lệnh đã bán có lãi (kèm số lệnh thắng/thua/hoà) |
| Tỷ lệ chính xác | % gợi ý chạm mục tiêu 1 (pivot +20%) trước khi phải bán |
| Lãi/lỗ bình quân mỗi lệnh | Kỳ vọng mỗi lần làm theo gợi ý; dương là công cụ có lợi thế |
| Lệnh thắng / thua trung bình | Lãi khi đúng phải lớn hơn hẳn lỗ khi sai |
| Hệ số lợi nhuận | Tổng % lãi ÷ tổng % lỗ; > 1,5 là tốt |
| Hơn VN-Index | Mỗi lệnh hơn/kém VN-Index cùng thời gian nắm giữ bao nhiêu |

**Kết luận** được ghi bằng lời: *TIN CẬY*, *CÓ LỢI THẾ NHẸ* hoặc *CHƯA HIỆU QUẢ*. Khi chưa đủ 10 lệnh đã bán thì kết
luận là *CHƯA ĐỦ DỮ LIỆU*, và cần 30 lệnh trở lên mới bỏ được chữ "(tạm thời)". Trong lúc chờ, phần **Kiểm định quá khứ**
áp dụng đúng bộ quy tắc trên cho mọi tín hiệu breakout trong ~1,5 năm dữ liệu của toàn thị trường để ước tính độ tin cậy
ngay. Kết quả này chỉ là ước tính: danh sách mã hiện tại không gồm mã đã huỷ niêm yết, và chưa trừ phí, thuế.

DRI và MSR (breakout 22/9/2026) là hai ca dùng để **xây dựng** quy tắc, nên không được đưa vào nhật ký thực tế để tránh tự
chấm điểm cho mình. Hai ca này chỉ xuất hiện trong phần kiểm định quá khứ.

**Không mất lịch sử khi dùng Claude trên web:** mỗi cuộc trò chuyện là một nhánh git riêng. Mỗi lần chạy, công cụ `git
fetch` rồi gộp nhật ký của mọi nhánh trên GitHub; sau đó Claude commit tệp nhật ký lên nhánh của cuộc trò chuyện hiện tại.
Tắt việc gộp bằng `--khong-dong-bo`, tắt hẳn nhật ký bằng `--khong-nhat-ky`, đổi tệp nhật ký bằng `--nhat-ky TỆP`.

## 6. Khai báo danh mục đang giữ

Tạo tệp `danh-muc.txt` theo mẫu [`danh-muc.mau.txt`](danh-muc.mau.txt). Mỗi dòng gồm: `MÃ GIÁ_MUA [SỐ_LƯỢNG] [NGÀY_MUA]`.
Nên ghi ngày mua: công cụ dựa vào đó để tính dừng lỗ động theo mức lãi cao nhất đã đạt, nên dừng lỗ chỉ nâng lên chứ không
hạ xuống. Hành động trả về là một trong các mức: **NẮM GIỮ**, **CHỐT LỜI MỘT PHẦN**, **BÁN**, **CẮT LỖ**.
Tệp `danh-muc.txt` nằm trong `.gitignore` nên không bị đẩy lên GitHub. Khi dùng Claude trên web, chỉ cần nhắn
danh mục trong khung chat, Claude sẽ tự tạo tệp.

## 7. Dùng qua Claude ("lọc cổ phiếu cho tôi")

Repo có sẵn kỹ năng [`.claude/skills/loc-co-phieu`](../.claude/skills/loc-co-phieu/SKILL.md). Trong Claude Code, chỉ cần gõ
**`/loc-co-phieu`** hoặc nhắn *"lọc cổ phiếu"*, *"kiểm tra danh mục"*, *"phân tích HPG theo mẫu DRI"*. Claude sẽ xem giờ
hiện tại, chọn chế độ chạy phù hợp, chạy công cụ rồi tóm tắt kết quả bằng tiếng Việt.

**Khi dùng Claude Code trên web hoặc ứng dụng** (máy ảo trên đám mây): môi trường mặc định chặn các trang dữ liệu chứng
khoán. Bạn cần vào cài đặt môi trường (menu môi trường trên thanh tiêu đề phiên → *Edit* → *Network access*) và thêm vào
**Allowed domains** (giữ nguyên ô *Allow package managers*):
```
trading.vietcap.com.vn
kbbuddywts.kbsec.com.vn
services.entrade.com.vn
dchart-api.vndirect.com.vn
```
Hướng dẫn chi tiết: <https://code.claude.com/docs/en/cloud-environments#network-access>. Cách khác là chạy công cụ trên
máy tính của bạn (Claude Code bản cài đặt hoặc chạy trực tiếp bằng Python).

**Chạy tự động theo lịch (Routines):** hai lịch được cài cho các ngày thứ 2–6 (giờ Việt Nam): 14:05 lọc nhanh danh sách
theo dõi (`--theo-doi`) và 15:45 quét toàn thị trường. Mỗi lần chạy là một phiên Claude Code mới: phiên tự clone kho, chạy
công cụ theo kỹ năng `loc-co-phieu`, đẩy nhật ký gợi ý lên một nhánh git, gửi báo cáo HTML và gửi thông báo về điện thoại.
Quản lý (tắt/bật, đổi giờ, xoá) tại <https://claude.ai/code/routines>. `.claude/settings.json` cho phép các lệnh của công cụ
chạy không cần hỏi. Nếu bản `python3` mặc định của máy thiếu thư viện, công cụ tự chạy lại bằng bản Python có đủ thư viện.

## 8. Nguồn dữ liệu

Công cụ thử lần lượt các nguồn miễn phí sau. Nguồn nào lỗi liên tục sẽ bị bỏ qua và chuyển sang nguồn kế tiếp:

| Nguồn | Địa chỉ | Ghi chú |
|---|---|---|
| VCI (Vietcap) | `trading.vietcap.com.vn` | Nguồn chính; cũng cung cấp danh sách mã |
| KBS (KB Securities) | `kbbuddywts.kbsec.com.vn` | Dự phòng 1; cũng cung cấp danh sách mã |
| DNSE (Entrade) | `services.entrade.com.vn` | Dự phòng 2 |
| VND (VNDirect) | `dchart-api.vndirect.com.vn` | Dự phòng 3 |
| CSV | thư mục của bạn | `--csv-dir`: mỗi mã một tệp `<MÃ>.csv` (cột ngày, mở, cao, thấp, đóng, KL; nhận cả `dd/mm/yyyy` và giá theo đồng) |

- Công cụ **không dùng** gói `vnstock`: gói này đang bị PyPI cách ly ("quarantined") nên không cài được. Định dạng API
  được lấy theo mã nguồn công khai của nó.
- Các API này không chính thức, có thể đổi bất cứ lúc nào. Nếu tất cả đều lỗi, hãy chạy `--kiem-tra` rồi gửi kết quả cho
  Claude để sửa.
- Dữ liệu đệm nằm ở `.cache/` (có thể xoá bất cứ lúc nào). Công cụ tự phát hiện khi giá lịch sử bị điều chỉnh (chia cổ tức,
  tách cổ phiếu) và tải lại toàn bộ mã đó.

## 9. Tinh chỉnh

Mọi ngưỡng nằm trong [`locphieu/cauhinh.py`](locphieu/cauhinh.py), mỗi ngưỡng đều có chú thích, ví dụ: biên độ nền tối đa,
mức cạn cung, KL breakout, % cắt lỗ, độ dài nền. Sau khi chỉnh, quét lại toàn thị trường rồi so phần kiểm định quá khứ
để xem thay đổi đó tốt lên hay xấu đi
trên dữ liệu quá khứ.

## 10. Kiểm thử

```bash
python -m unittest discover -s tests -t .
```
Bộ kiểm thử dùng **dữ liệu ngày thật** của DRI, MSR và VN-Index (lưu sẵn trong `tests/du_lieu/`, chạy không cần mạng).
Nó xác nhận công cụ báo "theo dõi" trong giai đoạn tích lũy, báo **MUA MSR phiên 21/9/2026** và **MUA DRI phiên 23/9/2026**,
không để một cây nến mở cửa vọt đẩy đỉnh nền lên, không báo mua lặp, báo bán khi breakout thất bại, dự phóng KL trong phiên
và đọc đúng định dạng JSON của từng nguồn. Phần nhật ký được kiểm tra: ghi gợi ý đúng một lần, cắt lỗ khi
giá mở cửa giảm sâu, breakout thất bại, giá điều chỉnh vì cổ tức không làm sai kết quả, các chỉ số thống kê, và gộp nhật
ký từ nhiều nhánh git.

---
*Công cụ hỗ trợ ra quyết định, không phải lời khuyên đầu tư. Luôn tuân thủ cắt lỗ.*
