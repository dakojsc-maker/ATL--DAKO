# Văn phòng ảo DAKO – Huấn luyện ATVSLĐ

Văn phòng 3D trên claude.ai: **https://claude.ai/artifact/H3Z7YcPypTbAomiqcipXxe**

Trưởng phòng ra lệnh trong khung chat, Điều phối giao đúng nhân sự, nhân sự làm việc thật trong Claude Code
bằng đúng quy trình và form chuẩn của DAKO, rồi trả kết quả, tệp và gợi ý việc tiếp theo về **Bàn duyệt**.

## Sơ đồ phòng ban (theo dòng chảy hồ sơ khách hàng)

| Bước | Phòng | Nhân sự | Quy trình dùng |
|---|---|---|---|
| – | Điều phối | Thư – thư ký điều phối | Phân việc, theo dõi tiến độ |
| 1 | Kinh doanh – Tư vấn | Hà – tra cứu nhóm huấn luyện · Khoa – báo cáo tư vấn · Ngân – tài liệu ngành | `tra-cuu-atvsld/`, `bao-cao-atld/`, kỹ năng `tai-lieu-atvsld` |
| 2 | Báo giá – Hợp đồng | Linh – báo giá · Phúc – hợp đồng nguyên tắc · Vy – công nợ | kỹ năng `cap-nhat-huan-luyen-atld`, `hop-dong-nguyen-tac` |
| 3 | Xếp lớp – Giảng viên | Quân – xếp lịch lớp · Trang – hồ sơ giảng viên | kỹ năng `cap-nhat-huan-luyen-atld` |
| 4 | Giáo vụ – Điểm danh | Mai – danh sách điểm danh · Tuấn – cổng điểm danh online · Hạnh – chuyên cần | kỹ năng `diem-danh-lop-atvsld-dako` |
| 5 | Chứng chỉ – In ấn | Bảo – thẻ ATLĐ nhóm 3 · Lan – GCN nhóm 1-2-5-6 · Đức – sổ cấp · Ngọc – đối chiếu, scan, in gộp | kỹ năng `in-the-atld-dako` |
| 6 | Hồ sơ – Bàn giao | Sơn – form chuẩn & số cấp · Yến – bàn giao hồ sơ | Drive "DAKO - FORM CHUẨN GCN & THẺ ATLĐ" |
| – | Truyền thông – Học liệu | Khang – video · Thảo – slide, hồ sơ năng lực | `video-*/`, pptx |
| – | Trưởng phòng | Anh | Bàn duyệt, liên kết công cụ quản lý, tra cứu, Drive |

Chi tiết từng người (làm gì, cần anh gửi gì, giao ra gì, người kế tiếp): `nhan-su.json`.

## Cách một việc chạy

1. Anh nhắn lệnh (kèm tệp nếu có) → Điều phối chọn người → nhân sự trả lời: đã có gì, còn thiếu gì.
2. Anh bấm **Giao thực thi** → trang mở một phiên Claude Code (repo này, nhánh `ccr-a2333919-2g56yl`) với **phiếu giao việc**.
   - Trang chưa được phép mở phiên: việc vào **hàng chờ**; anh nhắn "Xử lý hàng chờ văn phòng DAKO" trong Claude Code, hoặc bấm **Sao chép phiếu** rồi dán vào Claude Code.
3. Phiên Claude Code làm theo kỹ năng `.claude/skills/van-phong-dako/SKILL.md`: tải tệp anh gửi, làm bằng kỹ năng của vị trí đó,
   tải kết quả lên văn phòng, ghi `tasks/<id>` và tin nhắn kết quả.
4. Kết quả hiện trong chat và **Bàn duyệt**: tải tệp, **Duyệt – kết thúc**, **Yêu cầu sửa**, hoặc bấm một **việc tiếp theo** để giao tiếp.

Dữ liệu của trang (kho `db` của artifact): `tasks/<id>` phiếu việc, `msgs/<id>` tin nhắn, `config/main` cấu hình thực thi.
Tệp Word/Excel/PowerPoint/zip được lưu dạng base64 (`enc: "b64"`) vì kho tệp chỉ nhận ảnh, PDF và chữ; trang tự giải mã khi tải về.

## Dựng lại

```bash
python3 van-phong-ao-dako/build.py      # ghép src/ → van-phong-ao-dako.html
```
Rồi đăng lại cùng đường dẫn tệp bằng công cụ Artifact (giữ nguyên link). Mã nguồn:
`src/page.html` khung trang · `src/styles.css` giao diện theo màu logo DAKO · `src/scene.js` văn phòng 3D (three.js r128) ·
`src/app.js` chat, phân việc, giao thực thi, Bàn duyệt · `src/logo.webp` logo.
