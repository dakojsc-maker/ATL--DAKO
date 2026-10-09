# Video giới thiệu Phần mềm quản lý ATVSLĐ – Viện STP (có thuyết minh, giao diện thực tế)

Thành phẩm (thư mục gốc repo): **`Vien-STP_Phan-mem-quan-ly-ATVSLD_1080p.mp4`** – 1920×1080, 30fps,
thuyết minh giọng nữ + nhạc nền, dưới 30 MB (mã hoá 2 lượt H.264, bitrate tính theo thời lượng để nét nhất
trong giới hạn dung lượng).

Nội dung theo file *HuongDan_PhanMem_DoanhNghiep_VienSTP_v2.pptx*: ảnh chụp thật của phần mềm (`assets/ui/uNN.jpg`,
NN = số trang trong tài liệu); khung cam đánh số đúng theo các bước của tài liệu (`assets/boxes.json`, lấy từ
vị trí các khung `st{n}_box` trong file pptx), xuất hiện đúng lúc tính năng tương ứng được đọc.

| Cảnh | Nội dung |
|---|---|
| Mở đầu | Hồ sơ huấn luyện rải rác, chứng chỉ hết hạn, thiết bị quá hạn kiểm định |
| Thương hiệu | Phần mềm quản lý an toàn, vệ sinh lao động của Viện STP |
| 5 phân hệ | Tổng quan & báo cáo · Doanh nghiệp · Đào tạo · Công tác & công việc · An toàn & tài sản |
| 01–03 | Bảng điều khiển, cảnh báo & thao tác nhanh, báo cáo xuất Excel |
| 04 | Hồ sơ doanh nghiệp, tài khoản operator và phân quyền |
| 05–07 | Danh mục khóa học, nhân sự theo 6 nhóm huấn luyện, hợp đồng & lớp học |
| 08 | Bảng tin, tài liệu, giao việc, duyệt đơn từ |
| 09–12 | Thiết bị – kiểm định, tai nạn & sự cố, vật tư – hóa chất – kho, cấp phát PPE |
| Bắt đầu | 3 bước triển khai – phần còn lại phần mềm tự nhắc |
| Kết | Thông điệp, liên hệ: doanhnghiep.vienstp.com · 0827.695.368 · viencongnghestp@gmail.com |

## Thuyết minh

- Kịch bản `narration.json`: `say` viết theo cách đọc (STP → “Ét Tê Pê”), `sub` là phụ đề.
- Giọng đọc: Piper `vi_VN-vais1000-medium` (giọng nữ, CC BY 4.0) qua `sherpa-onnx`; `tts.py` đọc mỗi câu nhiều lần
  (`TAKES`) và giữ bản nhận dạng lại khớp nhất (`ASR_DIR` = `sherpa-onnx-zipformer-vi-int8-2025-04-20`).
- `synth.py` đặt từng câu đúng mốc và tự hạ nhạc khi có lời; `build/…srt` là phụ đề khớp lời đọc.

## Dựng lại

```bash
cd video-atld
npm install gsap@3 lucide-static @fontsource/be-vietnam-pro @fontsource/jetbrains-mono playwright
VOICE_DIR=…/vits-piper-vi_VN-vais1000-medium ./build.sh      # hoặc SKIP_TTS=1 ./build.sh
```

Xem trước: `python3 -m http.server 8131` trong `video-atld/`, mở `http://127.0.0.1:8131/index.html?play`
(hoặc `?t=40` để xem khung hình ở giây thứ 40).
