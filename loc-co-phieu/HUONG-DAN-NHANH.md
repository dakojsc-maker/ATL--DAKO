# Hướng dẫn nhanh (không cần biết kỹ thuật)

Bạn **không cần cài gì và không cần biết Python**. Công cụ chạy trên máy chủ của Claude. Bạn chỉ cần nhắn tin cho Claude.

## Làm một lần duy nhất: mở đường lấy dữ liệu chứng khoán

1. Trong ứng dụng Claude, ở **thanh tiêu đề** phía trên cuộc trò chuyện, bấm vào **tên môi trường** rồi chọn **Edit**.
2. Tìm mục **Network access** (truy cập mạng). Ở ô **Allowed domains**, dán 4 dòng sau:
   ```
   trading.vietcap.com.vn
   kbbuddywts.kbsec.com.vn
   services.entrade.com.vn
   dchart-api.vndirect.com.vn
   ```
3. Giữ nguyên dấu tích ở ô **Allow package managers**, rồi bấm **Save**.

Hướng dẫn có hình của Anthropic: <https://code.claude.com/docs/en/cloud-environments#network-access>

## Dùng hằng ngày

Mở **cuộc trò chuyện mới** với kho mã **ATL--DAKO**, rồi gõ một trong các câu sau:

| Bạn muốn | Gõ | Lúc nào tốt nhất |
|---|---|---|
| Tìm cổ phiếu nên mua / theo dõi | **lọc cổ phiếu** | Sau 15:30, tốt nhất 19:00–22:00 |
| Xác nhận mã sắp vượt đỉnh để mua ngay trong phiên | **lọc nhanh** | 14:00–14:25 |
| Biết nên giữ hay bán cổ phiếu đang có | **kiểm tra danh mục: DRI mua 14,3 ngày 22/9, MSR mua 49,9** | Sau 15:30 hoặc 11:30–13:00 |
| Hỏi riêng một mã | **phân tích HPG theo mẫu DRI** | Bất kỳ lúc nào |
| Xem các gợi ý trước đây lời/lỗ ra sao, công cụ có đáng tin không | **xem hiệu quả gợi ý** | Bất kỳ lúc nào |

Tránh lọc lúc **9:00–10:00**: đầu phiên giá lên xuống thất thường, dễ báo sai.

Lần lọc đầu tiên trong mỗi cuộc trò chuyện mất khoảng 5–10 phút. Claude sẽ trả lời bằng tiếng Việt và gửi kèm một bảng
báo cáo. Bạn chỉ cần đọc các phần sau:
- **MUA**: mua trong khoảng giá ghi sẵn, đồng thời ghi lại **giá cắt lỗ** (giá phải bán nếu sai).
- **THEO DÕI**: vào ứng dụng chứng khoán, đặt **cảnh báo giá** đúng mức "pivot". Khi có báo, nhắn Claude "lọc nhanh".
- **DANH MỤC**: làm theo chữ GIỮ / CHỐT LỜI MỘT PHẦN / BÁN / CẮT LỖ.

## Công cụ có đáng tin không? Xem "Nhật ký gợi ý"

Mỗi lần công cụ gợi ý MUA, gợi ý đó được **tự động ghi vào nhật ký**. Các lần lọc sau, công cụ theo dõi giá của từng gợi
ý như thể bạn đã mua đúng giá đóng cửa hôm gợi ý và bán đúng quy tắc của công cụ. Cuối báo cáo luôn có:
- **Đang giữ**: các gợi ý chưa phải bán, lãi/lỗ đến hôm nay.
- **Đã bán**: ngày bán, giá bán, lãi/lỗ, lý do bán (cắt lỗ, dừng lỗ động…).
- **Tỷ lệ thắng**: bao nhiêu % lệnh đã bán có lãi. **Tỷ lệ chính xác**: bao nhiêu % gợi ý tăng tới mục tiêu 1 (≈ +20%)
  trước khi phải bán. **Lãi/lỗ bình quân mỗi lệnh**: dương nghĩa là làm theo công cụ đang có lãi.
- **Kết luận**: TIN CẬY / CÓ LỢI THẾ NHẸ / CHƯA HIỆU QUẢ. Khi mới dùng sẽ hiện **CHƯA ĐỦ DỮ LIỆU**, vì cần khoảng
  20–30 lệnh đã bán mới kết luận được. Trong lúc chờ, phần **Kiểm định quá khứ** cho biết nếu áp dụng đúng quy tắc này
  trong khoảng 1,5 năm qua thì kết quả ra sao.

Việc đặt lệnh mua bán bạn vẫn tự làm trên ứng dụng của công ty chứng khoán; công cụ không đặt lệnh thay bạn.

*Công cụ hỗ trợ ra quyết định, không phải lời khuyên đầu tư. Luôn tuân thủ cắt lỗ.*
