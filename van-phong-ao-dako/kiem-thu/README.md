# Kiểm thử văn phòng ảo

`e2e.js` chạy trang trong Chromium với `mock.js` giả lập kho dữ liệu, kho tệp, trợ lý, Claude Code và tải về
(theo hợp đồng runtime 0.2.96). Bao gồm:

- A: đủ năng lực – 3 tệp (Excel, ảnh `image/jpg`, zip 21 MB cắt 3 phần), giao việc, mở phiên Claude Code, nhận kết quả, tải về đúng từng byte, duyệt, việc tiếp theo.
- B: không có kho tệp – tệp lưu vào kho dữ liệu, tải về đúng; tệp 13 MB báo lỗi, giữ lời nhắn.
- C: mở ngoài khung xem của Claude – hiện hướng dẫn, không mất lời nhắn, vẫn giao việc bằng phiếu.
- D: kho tệp lỗi tạm thời – báo lỗi, gửi lại thành công.
- E: điện thoại – Phiếu giao việc kèm tệp cho đúng người.
- F: xin quyền Claude Code Remote – cho phép, hộp hỏi bị đóng, quyền bị tắt, tự thử lại khi lệnh chưa tới.

```bash
npm pack three@0.128.0 && mkdir -p three_x && tar -xzf three-0.128.0.tgz -C three_x package/build/three.min.js
mkdir -p test && cp mock.js test/
node e2e.js "$PWD" ../van-phong-ao-dako.html
```
(`e2e.js` đọc `three_x/` và `test/mock.js` trong thư mục truyền vào ở tham số đầu.)
