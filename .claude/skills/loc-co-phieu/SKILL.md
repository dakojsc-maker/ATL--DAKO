---
name: loc-co-phieu
description: Lọc cổ phiếu Việt Nam (HOSE/HNX/UPCOM): chiến lược lướt sóng 5–7% đã kiểm định 13 năm và mẫu hình DRI/MSR – nền chặt sát đỉnh rồi bùng nổ khối lượng – kiểm tra tín hiệu mua/bán cho danh mục và theo dõi hiệu quả (lời/lỗ, tỷ lệ thắng) của mọi gợi ý trước đây. Dùng khi người dùng nói "lọc cổ phiếu", "quét thị trường", "lọc nhanh", "hôm nay có mã nào breakout", "kiểm tra danh mục", "nên mua/bán mã X", "phân tích mã X theo mẫu DRI/MSR", "xem hiệu quả gợi ý", "tỷ lệ thắng", "công cụ có tin cậy không" hoặc hỏi nên chạy lọc lúc mấy giờ.
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

Chạy mọi lệnh từ thư mục gốc của kho, đúng dạng `python3 loc-co-phieu/loc_co_phieu.py …` (không ghép `cd … &&`), để khớp
danh sách lệnh được phép chạy không cần hỏi trong `.claude/settings.json` (quan trọng khi chạy tự động theo lịch).

1. **Xem giờ phiên:** `python3 loc-co-phieu/loc_co_phieu.py --gio`. Từ đó chọn chế độ chạy (`python3 loc-co-phieu/loc_co_phieu.py` + tuỳ chọn):
   - Sau 15:30, buổi tối hoặc cuối tuần → quét đầy đủ, không cần tuỳ chọn.
   - Người dùng nói "lọc nhanh"/"theo dõi", hoặc đang 14:00–14:30 hay nghỉ trưa 11:30–13:00 → `--theo-doi`. Nếu báo
     chưa có danh sách theo dõi (cuộc trò chuyện mới thường chưa có), chạy quét đầy đủ thay thế.
   - 9:00–10:00 → vẫn chạy nếu người dùng muốn, nhưng nói rõ kết quả lúc này kém tin cậy, nên xem lại lúc 14:00 hoặc sau 15:30.
   - Hỏi một mã cụ thể → `--ma MÃ1 MÃ2`. Hỏi về một ngày trong quá khứ thì thêm `--ngay YYYY-MM-DD`.
   - Hỏi hiệu quả các gợi ý trước đây, tỷ lệ thắng, công cụ có tin cậy không → `--hieu-qua` (chỉ cập nhật nhật ký
     gợi ý, nhanh). Cần thống kê đủ hơn thì quét đầy đủ (có thêm phần kiểm định quá khứ toàn thị trường).
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
3. **Lưu nhật ký gợi ý (bắt buộc sau mỗi lần chạy có tải dữ liệu thật):** công cụ tự gộp nhật ký của các cuộc trò chuyện
   trước (qua git) và tự ghi gợi ý MUA mới vào `loc-co-phieu/nhat-ky/goi-y.json`. Mỗi cuộc trò chuyện là một nhánh git
   riêng, nên phải commit tệp này rồi push lên **nhánh của cuộc trò chuyện hiện tại** thì lần sau mới không mất lịch sử:
   `git add loc-co-phieu/nhat-ky/goi-y.json && git commit -m "Cập nhật nhật ký gợi ý <ngày>"` rồi push theo hướng dẫn git
   của phiên. Tệp không đổi thì bỏ qua. Không tự sửa tay tệp nhật ký.
4. **Gửi báo cáo:** gửi `loc-co-phieu/ket-qua/moi-nhat.html` bằng SendUserFile (`display: "render"`) để người dùng xem bảng
   trên điện thoại hoặc máy tính.
5. **Tóm tắt trong chat** (ngắn, theo thứ tự):
   1. Thời điểm chạy và độ tin cậy: trong phiên thì khối lượng chỉ là ước tính; sau 15:30 là tín hiệu đã chốt.
   2. **Độ tin cậy của công cụ** (dòng "ĐỘ TIN CẬY CÔNG CỤ" và phần nhật ký): tỷ lệ thắng, tỷ lệ chính xác, lãi/lỗ bình
      quân mỗi lệnh, số lệnh đã bán, cùng kết luận (TIN CẬY / CÓ LỢI THẾ NHẸ / CHƯA HIỆU QUẢ / CHƯA ĐỦ DỮ LIỆU). Nói rõ số
      thực tế (từ nhật ký) và số ước tính (kiểm định quá khứ) là hai thứ khác nhau; khi "CHƯA ĐỦ DỮ LIỆU" thì không được
      nói công cụ đã đáng tin. Liệt kê gợi ý mới ghi lần này và gợi ý vừa bán (lãi/lỗ, lý do).
   3. Thị trường chung đang tốt hay xấu, nên dùng bao nhiêu % vốn.
   4. **Lướt sóng 5–7%** (phần "LƯỚT SÓNG" – chiến lược đã kiểm định 13 năm, đáng tin hơn breakout): mã, giá mua tối đa,
      chốt lời +7%, cắt lỗ −7%, giữ tối đa 20 phiên, lý do ngắn; hoặc nói rõ "không có tín hiệu – đứng ngoài" khi thị
      trường chưa thuận lợi. Nêu kết quả kiểm định (thắng ~55%, +0,4%/lệnh; ngày xác nhận tăng thắng ~62%) và nhật ký
      lướt sóng thực tế nếu đã có.
   5. **Mã có thể mua (breakout DRI/MSR):** mã, giá mua trong khoảng nào (pivot → giá mua tối đa), giá cắt lỗ, giá mục tiêu, khối lượng gợi ý
      nếu có vốn.
   6. **Mã cần theo dõi** (5–10 mã điểm cao nhất): giá cần vượt (pivot). Nhắc người dùng đặt "cảnh báo giá" tại mức đó trên
      ứng dụng công ty chứng khoán.
   7. **Danh mục đang giữ:** từng mã giữ / chốt lời một phần / bán / cắt lỗ, kèm lý do ngắn và mức dừng lỗ.
   8. Mã đang chạy có cảnh báo tăng nóng hoặc bán.
   9. Lần chạy tiếp theo nên vào lúc nào (14:00–14:25 nếu muốn mua trong phiên; sau 15:30 để có tín hiệu chốt).
   Không có mã nào thì nói thẳng là không có; đứng ngoài cũng là một quyết định.
6. Không tự sửa ngưỡng trong `locphieu/cauhinh.py` trừ khi người dùng yêu cầu. Nếu sửa, chạy `--kiem-dinh` trước và sau để
   so sánh, rồi chạy `python -m unittest discover -s tests -t .` trong thư mục `loc-co-phieu`.

## Nguyên tắc khi tư vấn
- Mọi gợi ý mua đều phải kèm giá cắt lỗ; không khuyến khích mua đuổi quá pivot +5%.
- Thị trường chung "ĐIỀU CHỈNH / GIẢM" thì nhấn mạnh việc hạn chế mua mới. Nghiên cứu 14 năm
  (`loc-co-phieu/NGHIEN-CUU-LUOT-SONG.md`) cho thấy mua lúc này lỗ bình quân – đứng ngoài là quyết định đúng nhất.
- Không hứa tỷ lệ thắng cao hơn số đã kiểm định; nhắc lợi thế lướt sóng là mỏng và cần nhật ký ≥ 30 lệnh đã đóng.
- Công cụ không tự đặt lệnh: người dùng tự đặt lệnh và cảnh báo giá trên ứng dụng chứng khoán của họ.
- Ghi rõ đây là công cụ hỗ trợ, không phải lời khuyên đầu tư.
