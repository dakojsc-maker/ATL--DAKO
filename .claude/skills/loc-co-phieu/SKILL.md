---
name: loc-co-phieu
description: Lọc cổ phiếu Việt Nam (HOSE/HNX/UPCOM) theo mẫu hình DRI/MSR – nền chặt sát đỉnh rồi bùng nổ khối lượng – và kiểm tra tín hiệu mua/bán cho danh mục. Dùng khi người dùng nói "lọc cổ phiếu", "quét thị trường", "lọc nhanh", "hôm nay có mã nào breakout", "kiểm tra danh mục", "nên mua/bán mã X", "phân tích mã X theo mẫu DRI/MSR" hoặc hỏi nên chạy lọc lúc mấy giờ.
---

# Lọc cổ phiếu mẫu DRI/MSR

Công cụ nằm ở `loc-co-phieu/`. Quy tắc mua/bán đầy đủ ở `loc-co-phieu/PHAN-TICH-DRI-MSR.md`, chi tiết kỹ thuật ở
`loc-co-phieu/README.md`. Trả lời bằng tiếng Việt.

## Người dùng không rành kỹ thuật
- **Tự chạy mọi lệnh.** Không bao giờ bảo người dùng gõ lệnh, cài Python hay mở tệp. Không nhắc tên lệnh, tham số, đường dẫn
  trong câu trả lời, trừ khi họ hỏi.
- Nói ngắn, dễ hiểu. Thuật ngữ nào cần dùng thì giải thích trong ngoặc ngay lần đầu, ví dụ "pivot (đỉnh nền – vượt qua mức
  này là điểm mua)", "cắt lỗ (giá phải bán để tránh lỗ thêm)".
- Quét đầy đủ ở cuộc trò chuyện mới mất khoảng 5–10 phút (phải tải dữ liệu từ đầu). Báo trước một câu, rồi chạy nền.

## Các bước

1. **Xem giờ phiên:** `python loc-co-phieu/loc_co_phieu.py --gio`. Từ đó chọn chế độ chạy (`python loc-co-phieu/loc_co_phieu.py` + tuỳ chọn):
   - Sau 15:30, buổi tối hoặc cuối tuần → quét đầy đủ, không cần tuỳ chọn.
   - Người dùng nói "lọc nhanh"/"theo dõi", hoặc đang 14:00–14:30 hay nghỉ trưa 11:30–13:00 → `--theo-doi`. Nếu báo
     chưa có danh sách theo dõi (cuộc trò chuyện mới thường chưa có), chạy quét đầy đủ thay thế.
   - 9:00–10:00 → vẫn chạy nếu người dùng muốn, nhưng nói rõ kết quả lúc này kém tin cậy, nên xem lại lúc 14:00 hoặc sau 15:30.
   - Hỏi một mã cụ thể → `--ma MÃ1 MÃ2`. Hỏi về một ngày trong quá khứ thì thêm `--ngay YYYY-MM-DD`.
   - Người dùng nêu cổ phiếu đang giữ (ví dụ "DRI mua 14,3 ngày 22/9") → ghi vào `loc-co-phieu/danh-muc.txt` theo mẫu
     `loc-co-phieu/danh-muc.mau.txt` (mỗi dòng: `MÃ GIÁ_MUA [SỐ_LƯỢNG] [YYYY-MM-DD]`, giá theo nghìn đồng), rồi thêm
     `--danh-muc loc-co-phieu/danh-muc.txt`. Nếu tệp đã có sẵn thì luôn thêm tuỳ chọn này.
   - Người dùng nêu tổng vốn → thêm `--von <triệu đồng>`.
2. **Nếu lỗi kết nối** (HTTP 403, "Không kết nối được", "Không tải được dữ liệu nào"): chạy `--kiem-tra` để biết nguồn nào
   lỗi. Nếu bị chặn, hướng dẫn người dùng từng bước bằng lời đơn giản: mở cài đặt môi trường (bấm tên môi trường trên thanh
   tiêu đề cuộc trò chuyện → *Edit* → *Network access*), thêm 4 địa chỉ sau vào ô *Allowed domains*, giữ nguyên ô *Allow
   package managers*, bấm *Save*, rồi mở cuộc trò chuyện mới và gõ lại "lọc cổ phiếu":
   `trading.vietcap.com.vn`, `kbbuddywts.kbsec.com.vn`, `services.entrade.com.vn`, `dchart-api.vndirect.com.vn`.
   **Tuyệt đối không bịa kết quả, không dùng dữ liệu mô phỏng trong `tests/` thay cho dữ liệu thật.**
3. **Gửi báo cáo:** gửi `loc-co-phieu/ket-qua/moi-nhat.html` bằng SendUserFile (`display: "render"`) để người dùng xem bảng
   trên điện thoại hoặc máy tính.
4. **Tóm tắt trong chat** (ngắn, theo thứ tự):
   1. Thời điểm chạy và độ tin cậy: trong phiên thì khối lượng chỉ là ước tính; sau 15:30 là tín hiệu đã chốt.
   2. Thị trường chung đang tốt hay xấu, nên dùng bao nhiêu % vốn.
   3. **Mã có thể mua:** mã, giá mua trong khoảng nào (pivot → giá mua tối đa), giá cắt lỗ, giá mục tiêu, khối lượng gợi ý
      nếu có vốn.
   4. **Mã cần theo dõi** (5–10 mã điểm cao nhất): giá cần vượt (pivot). Nhắc người dùng đặt "cảnh báo giá" tại mức đó trên
      ứng dụng công ty chứng khoán.
   5. **Danh mục đang giữ:** từng mã giữ / chốt lời một phần / bán / cắt lỗ, kèm lý do ngắn và mức dừng lỗ.
   6. Mã đang chạy có cảnh báo tăng nóng hoặc bán.
   7. Lần chạy tiếp theo nên vào lúc nào (14:00–14:25 nếu muốn mua trong phiên; sau 15:30 để có tín hiệu chốt).
   Không có mã nào thì nói thẳng là không có; đứng ngoài cũng là một quyết định.
5. Không tự sửa ngưỡng trong `locphieu/cauhinh.py` trừ khi người dùng yêu cầu. Nếu sửa, chạy `--kiem-dinh` trước và sau để
   so sánh, rồi chạy `python -m unittest discover -s tests -t .` trong thư mục `loc-co-phieu`.

## Nguyên tắc khi tư vấn
- Mọi gợi ý mua đều phải kèm giá cắt lỗ; không khuyến khích mua đuổi quá pivot +5%.
- Thị trường chung "ĐIỀU CHỈNH / GIẢM" thì nhấn mạnh việc hạn chế mua mới.
- Công cụ không tự đặt lệnh: người dùng tự đặt lệnh và cảnh báo giá trên ứng dụng chứng khoán của họ.
- Ghi rõ đây là công cụ hỗ trợ, không phải lời khuyên đầu tư.
