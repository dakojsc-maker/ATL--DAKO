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

## Chạy tự động (đã cài sẵn)

Từ thứ Hai đến thứ Sáu, công cụ tự chạy mà bạn không cần nhắn gì:

| Giờ | Công cụ làm gì |
|---|---|
| **14:05** | Lọc nhanh danh sách theo dõi: mã nào đang vượt đỉnh nền ngay trong phiên, để bạn kịp mua trước 14:30 (HOSE, HNX) hoặc trước 15:00 (UPCOM). Tín hiệu lúc này chỉ là tạm thời. |
| **15:45** | Quét toàn thị trường sau giờ đóng cửa: tín hiệu đã chốt, cập nhật lời/lỗ trong nhật ký gợi ý, lập danh sách theo dõi cho hôm sau. |

- Mọi kết quả chạy tự động nằm chung trong **một cuộc trò chuyện** tên **"⚡ Lọc cổ phiếu tự động (14:05 & 15:45, thứ
  2–6)"** trong danh sách phiên của Claude Code. Lần chạy mới nhất ở cuối cuộc trò chuyện, kèm bảng báo cáo.
- Khi chạy xong, điện thoại sẽ nhận **thông báo** một dòng. Bạn cần cài ứng dụng Claude, đăng nhập đúng tài khoản và cho
  phép ứng dụng gửi thông báo.
- Bấm vào thông báo (hoặc mở ứng dụng Claude → **Code** → cuộc trò chuyện trên) để đọc tóm tắt. Muốn hỏi thêm về kết quả
  thì nhắn ngay trong cuộc trò chuyện đó.
- **Tắt, đổi giờ hoặc xoá lịch:** mở <https://claude.ai/code/routines> trên trình duyệt rồi chọn lịch:
  - công tắc ở trên cùng để **tắt/bật**;
  - menu cạnh tên lịch → **Edit** để đổi giờ;
  - menu cạnh tên lịch → **Delete** để xoá.

  Cách dễ hơn là nhắn Claude, ví dụ *"tắt lịch lọc tự động"* hoặc *"đổi giờ lọc 15:45 sang 19:00"*.
- Mỗi lần chạy dùng hạn mức gói Claude của bạn như một cuộc trò chuyện bình thường.
- Ngày nghỉ lễ lịch vẫn chạy. Khi đó báo cáo sẽ ghi rõ là kết quả của phiên giao dịch gần nhất.

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
