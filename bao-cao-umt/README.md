# Hồ sơ thẩm định UMT

Báo cáo thẩm định sơ bộ (desktop due diligence) về Trường Đại học Quản lý và Công nghệ TP.HCM (UMT), lập cho nhà đầu tư Hàn Quốc. Dữ liệu cập nhật đến 27/10/2026, dẫn 105 nguồn công khai, kèm tóm tắt tiếng Hàn.

## Tệp

| Tệp | Dùng để |
| --- | --- |
| `UMT_Ho-so-tham-dinh.pdf` | Bản A4 (37 trang) để gửi nhà đầu tư, in ấn |
| `UMT_Ho-so-tham-dinh.html` | Bản đọc trên trình duyệt: biểu đồ có chú thích khi rê chuột, giao diện sáng/tối, đọc tốt trên điện thoại |
| `src/report.template.html` | Nội dung báo cáo; trích dẫn ghi dạng `[[khóa-nguồn]]` |
| `build.py` | Dựng trang: vẽ biểu đồ theo đúng tỷ lệ, đánh số trích dẫn, lập danh mục nguồn |
| `pdf.js` | Xuất PDF A4 bằng Chromium (Playwright) |

## Nội dung (19 mục)

1. Tóm tắt điều hành · 2. 한국어 요약 · 3. Phạm vi và phương pháp · 4. Pháp lý và lịch sử · 5. Chủ đầu tư và sở hữu · 6. Quản trị và bộ máy · 7. Đào tạo và hợp tác · 8. Tuyển sinh và người học · 9. Học phí và học bổng · 10. Đội ngũ và tiền lương · 11. Cơ sở vật chất · 12. Tài chính và chi phí · 13. Truyền thông và thương hiệu · 14. Thị trường và cạnh tranh · 15. Pháp lý đầu tư và tuân thủ chuẩn · 16. SWOT và ma trận rủi ro · 17. Phương án tham gia · 18. Hồ sơ cần thẩm định · 19. Nguồn và thuật ngữ.

## Nguồn và giới hạn

- Nguồn chia ba tầng: A (website, tài liệu PDF của UMT, cổng thông tin Chính phủ, văn bản pháp luật), B (báo chí chính thống, dịch vụ thông tin pháp lý), C (trang tổng hợp, chỉ dùng đối chiếu). Phép tính và nhận định của đơn vị tư vấn nằm trong khung “Phân tích”.
- Môi trường nghiên cứu không truy cập trực tiếp được umt.edu.vn; nội dung website và PDF của trường được khai thác qua chỉ mục công cụ tìm kiếm. Cần đối chiếu bản gốc khi thẩm định chính thức.
- UMT chưa công khai báo cáo tài chính, thang lương; mục 12 và Bảng 10.3 dùng kịch bản và mặt bằng tham chiếu, ghi rõ không phải số liệu của trường.
- Báo cáo chưa có ảnh khuôn viên; có thể bổ sung từ thư viện ảnh chính thức của trường.

## Cập nhật

Sửa `src/report.template.html` (nguồn mới thêm vào danh sách `REFS` trong `build.py`), rồi chạy:

```bash
python3 build.py      # tạo UMT_Ho-so-tham-dinh.html
node pdf.js           # tạo UMT_Ho-so-tham-dinh.pdf
```
