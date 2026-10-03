# Hồ sơ năng lực Lĩnh vực Đào tạo – Viện STP (A4 đứng)

Profile 20 trang giới thiệu lĩnh vực đào tạo của Viện STP, dựng bằng `pptxgenjs` theo layout của
*Profile Đào tạo AI* (nền xanh đậm, mạng lưới kết nối, thẻ bo góc xanh nhạt). Khổ A4 đứng
(8,27″ × 11,69″), chữ nội dung ≥ 14pt, tiêu đề 26–28pt; font Calibri.

| Thành phẩm | Mô tả |
|---|---|
| `../Vien-STP_Ho-so-nang-luc_Dao-tao_A4.pptx` | File PPTX chỉnh sửa được (theme màu, layout, placeholder tiêu đề) |
| `../Vien-STP_Ho-so-nang-luc_Dao-tao_A4_xem-truoc.pdf` | Bản PDF xem trước (render bằng LibreOffice, font thay thế tương đương Calibri) |

## Cấu trúc nội dung

| Trang | Nội dung | Nguồn |
|---|---|---|
| 1 | Trang bìa | Profile Viện STP |
| 2 | Lời mở đầu, số liệu nổi bật, mục lục | Tổng hợp |
| 3 | Giới thiệu chung: VUSTA, Viện STP, hoạt động pháp lý + ảnh giấy chứng nhận | Profile Viện STP |
| 4 | Lĩnh vực trọng tâm (01–05) | Profile Viện STP |
| 5–6 | Phần 02 · Chứng chỉ nghiệp vụ ngắn hạn: đường thủy nội địa, xây dựng, chứng chỉ khác + mẫu chứng nhận | Profile Viện STP, Dịch vụ ATLĐ |
| 7–10 | Phần 03 · An toàn, vệ sinh lao động: mô hình Viện STP – DAKO, 6 nhóm huấn luyện, số hóa ATVSLĐ, nền tảng phần mềm (doanh nghiệp, học viên, tra cứu 24/7) | Bản thuyết trình Dịch vụ ATLĐ |
| 11–14 | Phần 04 · Đào tạo ứng dụng AI: năng lực cốt lõi, chương trình theo đối tượng, chương trình chuyên sâu cho khối hành chính | Profile Đào tạo AI, Profile Đào tạo AI Hành chính công |
| 15–17 | Phần 05 · Trung tâm tuyển sinh, đào tạo & khảo thí Cambridge, phòng thi 250 thí sinh/ca | Profile Viện STP |
| 18–19 | Phần 06 · Đối tác & khách hàng tiêu biểu, hệ thống văn phòng (bản đồ có Hoàng Sa, Trường Sa) | Profile Viện STP, Dịch vụ ATLĐ |
| 20 | Liên hệ (bìa sau) | Profile Viện STP |

## Thư mục

| Thư mục / file | Vai trò |
|---|---|
| `build.js` | Toàn bộ bố cục 20 trang; theme màu ghi vào `ppt/theme` sau khi xuất |
| `assets/bg/` | Nền xanh đậm, nền trắng mạng lưới, khối cầu (lấy từ Profile Đào tạo AI) |
| `assets/logo/` | Logo STP, logo DAKO, QR website (`get-qr.com/xpH551`), QR chỉ đường Cambridge (`get-qr.com/yFFNZ0`) |
| `assets/crop/` | Ảnh cắt từ Profile Viện STP: giấy chứng nhận, mẫu chứng chỉ, logo đối tác, ảnh tuyển sinh, Cambridge, phòng thi, văn phòng, bản đồ |
| `assets/atl/` | Ảnh huấn luyện, ảnh 6 nhóm, ảnh chụp phần mềm, ảnh khách hàng (từ bản thuyết trình Dịch vụ ATLĐ) |
| `assets/ai/` | Logo đơn vị theo từng đối tượng đào tạo AI |

## Dựng lại

Cần Node 18+.

```bash
cd profile-daotao
npm install
node build.js            # ghi ../Vien-STP_Ho-so-nang-luc_Dao-tao_A4.pptx
node build.js out.pptx   # hoặc chỉ định file khác
```
