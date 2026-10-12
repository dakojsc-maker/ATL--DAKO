---
name: loc-co-phieu
description: Lọc cổ phiếu Việt Nam (HOSE/HNX/UPCOM) theo mẫu hình DRI/MSR – nền chặt sát đỉnh rồi bùng nổ khối lượng – và kiểm tra tín hiệu mua/bán cho danh mục. Dùng khi người dùng nói "lọc cổ phiếu", "quét thị trường", "hôm nay có mã nào breakout", "kiểm tra danh mục", "nên mua/bán mã X", "phân tích mã X theo mẫu DRI/MSR" hoặc hỏi nên chạy lọc lúc mấy giờ.
---

# Lọc cổ phiếu mẫu DRI/MSR

Công cụ nằm ở `loc-co-phieu/` (đọc `loc-co-phieu/README.md` nếu cần chi tiết; quy tắc mua/bán đầy đủ ở
`loc-co-phieu/PHAN-TICH-DRI-MSR.md`). Trả lời người dùng bằng tiếng Việt.

## Các bước

1. **Chuẩn bị** (chỉ khi thiếu thư viện): `pip install -r loc-co-phieu/requirements.txt`.
2. **Xem giờ phiên:** `python loc-co-phieu/loc_co_phieu.py --gio`. Từ đó chọn chế độ chạy:
   - Sau 15:30, buổi tối hoặc cuối tuần → quét đầy đủ: `python loc-co-phieu/loc_co_phieu.py`
   - 14:00–14:30 hoặc nghỉ trưa 11:30–13:00 → `python loc-co-phieu/loc_co_phieu.py --theo-doi`. Nếu báo chưa có danh sách
     theo dõi thì chạy quét đầy đủ.
   - 9:00–10:00 → vẫn chạy nếu người dùng muốn, nhưng phải nói rõ kết quả lúc này kém tin cậy và nên chạy lại lúc 14:00
     hoặc sau 15:30.
   - Người dùng hỏi mã cụ thể → `--ma MÃ1 MÃ2` (thêm `--ngay YYYY-MM-DD` nếu họ hỏi về một ngày trong quá khứ).
   - Có tệp `loc-co-phieu/danh-muc.txt`, hoặc người dùng nêu giá mua → thêm `--danh-muc loc-co-phieu/danh-muc.txt`. Nếu họ
     chỉ nói miệng, tạo tệp theo mẫu `danh-muc.mau.txt` rồi mới chạy.
   - Người dùng nêu vốn → thêm `--von <triệu đồng>`.
   Quét đầy đủ lần đầu mất vài phút: chạy lệnh với timeout dài (≥ 10 phút) hoặc chạy nền.
3. **Nếu lỗi kết nối** (HTTP 403, "Không kết nối được", "Không tải được dữ liệu nào"): chạy `--kiem-tra` để biết nguồn nào
   lỗi. Khi đang chạy trên đám mây, báo người dùng thêm các tên miền sau vào *Allowed domains* trong cài đặt mạng của môi
   trường: `trading.vietcap.com.vn`, `kbbuddywts.kbsec.com.vn`, `services.entrade.com.vn`,
   `dchart-api.vndirect.com.vn`. **Tuyệt đối không bịa kết quả, không dùng dữ liệu mô phỏng trong `tests/` thay cho dữ liệu
   thật.**
4. **Đọc kết quả** từ màn hình hoặc `loc-co-phieu/ket-qua/moi-nhat.md`, rồi trình bày ngắn gọn theo thứ tự:
   1. Thời điểm chạy và độ tin cậy (đang trong phiên thì KL chỉ là dự phóng; sau 15:30 là tín hiệu đã xác nhận).
   2. Bối cảnh thị trường và tỷ trọng giải ngân gợi ý.
   3. **MUA / còn trong vùng mua**: mỗi mã ghi pivot, giá mua tối đa, cắt lỗ, MT1/MT2, KL/TB20, khối lượng gợi ý (nếu có).
   4. **Theo dõi**: khoảng 5–10 mã điểm cao nhất, ghi pivot và khoảng cách tới pivot. Nhắc người dùng đặt cảnh báo giá.
   5. **Danh mục**: hành động cho từng mã (giữ / chốt một phần / bán / cắt lỗ) kèm lý do và dừng lỗ động.
   6. Mã đang chạy có cảnh báo tăng nóng hoặc phân phối, và các cảnh báo bán.
   7. Nhắc giờ chạy tiếp theo phù hợp: 14:00–14:25 dùng `--theo-doi`, sau 15:30 quét đầy đủ.
   Nếu không có mã nào thì nói thẳng là không có. Đứng ngoài cũng là một quyết định.
5. Không tự sửa ngưỡng trong `locphieu/cauhinh.py` trừ khi người dùng yêu cầu. Nếu sửa, chạy `--kiem-dinh` trước và sau để
   so sánh, rồi chạy `python -m unittest discover -s tests -t .` trong thư mục `loc-co-phieu`.

## Nguyên tắc khi tư vấn
- Luôn kèm mức cắt lỗ cho mọi gợi ý mua; không khuyến khích mua đuổi quá pivot +5%.
- Khi thị trường chung ở trạng thái "ĐIỀU CHỈNH / GIẢM", nhấn mạnh việc hạn chế mua mới.
- Ghi rõ đây là công cụ hỗ trợ, không phải lời khuyên đầu tư.
