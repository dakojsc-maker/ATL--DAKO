# Tài liệu ATVSLĐ gửi doanh nghiệp

Bộ tài liệu tham khảo theo ngành nghề, gửi trước cho doanh nghiệp hoặc người phụ trách để họ nắm các nhóm huấn luyện
an toàn, vệ sinh lao động (ATVSLĐ) trong lĩnh vực của mình. Mỗi tài liệu là bản rút gọn của cẩm nang tư vấn cùng số
(dành cho nhân viên kinh doanh, lưu hành nội bộ).

## 01 – Ngành Xây dựng

| File | Dùng để |
|---|---|
| `01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.pdf` | Gửi khách hàng (email, Zalo), in |
| `01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx` | Chỉnh sửa; khách điền phiếu trực tiếp trên Word |
| `build_01_xay_dung_doanh_nghiep.js` | Script dựng lại file Word |

8 trang A4, rút từ cẩm nang 84 trang:

| Trang | Nội dung |
|---|---|
| 1 | Bìa và **5 điều doanh nghiệp xây dựng cần biết** |
| 1–2 | **Mục 1.** Sáu nhóm huấn luyện: ai học, học gì, thời gian tối thiểu, định kỳ; số người làm công tác ATVSLĐ theo quy mô |
| 3–4 | **Mục 2.** Bốn câu hỏi tự xếp nhóm và bảng tra vị trí → nhóm (lãnh đạo, chỉ huy, kỹ sư, HSE, y tế, văn phòng, kho, lái xe, vận hành máy, thợ các nghề, thời vụ, thầu phụ) |
| 4–5 | **Mục 3.** Nhóm 3 học gì theo từng nghề; **Mục 4.** Huấn luyện, dịch vụ bổ sung |
| 6 | **Mục 5.** 8 câu hỏi thường gặp; **Mục 6.** Quy trình 6 bước, doanh nghiệp nhận được gì |
| 7 | **Mục 7.** Căn cứ pháp lý; **Mục 8.** Chuẩn bị cho buổi làm việc, liên hệ |
| 8 | **Phiếu chuẩn bị thông tin**: loại hình, số người theo 17 cụm vị trí, máy và thiết bị |

Phần chỉ dành cho nhân viên kinh doanh đã được bỏ: cơ hội bán kèm, xử lý từ chối, lộ trình bán hàng, lịch chăm sóc,
kịch bản demo và mức ưu tiên tính năng phần mềm, những điều không hứa, phiếu ghi nhận cuộc gặp.

### Nhân viên kinh doanh dùng thế nào

1. Mở file Word, điền tên và số điện thoại vào dòng **Chuyên viên tư vấn** ở cuối trang 7, rồi lưu thành PDF
   (hoặc gửi luôn file Word nếu muốn khách điền phiếu trên máy).
2. Gửi cho khách trước buổi hẹn, đề nghị khách điền **Phiếu chuẩn bị thông tin** (trang 8).
3. Bảng số người trên phiếu dùng đúng 17 cụm vị trí của bảng 9.2 trong cẩm nang, nên phiếu khách điền
   chuyển thẳng cho chuyên viên xếp nhóm và lập báo giá.

### Dựng lại

```bash
node tai-lieu-atvsld/build_01_xay_dung_doanh_nghiep.js
soffice --headless --convert-to pdf --outdir tai-lieu-atvsld tai-lieu-atvsld/01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx
```

Cần gói npm `docx` và LibreOffice (để xuất PDF). Nội dung nằm trong các mảng của script (`KEY_POINTS`, `SIX`, `LOOKUP`,
`TRADES`, `EXTRA`, `FAQ`, `LAWS`, `STAFF`, `EQUIP`), sửa ở đó rồi chạy lại. Mọi đoạn văn đều ghi rõ giãn dòng kiểu
`auto` để Word và LibreOffice dàn trang giống nhau.

### Lưu ý pháp lý

- Thông tin pháp lý lấy theo cẩm nang gốc, kiểm tra đến ngày 15/10/2026. Khi Luật sửa đổi, bổ sung Luật ATVSLĐ
  (đang trình Quốc hội) hoặc văn bản hướng dẫn mới có hiệu lực, cập nhật `SIX`, `LAWS` và ghi chú tình trạng pháp lý ở mục 7.
- Mục 4 không ghi số hiệu văn bản của từng dịch vụ bổ sung (an toàn điện, sơ cấp cứu, hóa chất). Nếu muốn ghi,
  rà lại hiệu lực trước, vì Luật Điện lực và Luật Hóa chất đều đã có luật mới.
