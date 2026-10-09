# Video hướng dẫn học viên – Cổng đào tạo Viện STP × DAKO (có thuyết minh, giao diện thực tế)

Thành phẩm (thư mục gốc repo): **`Vien-STP_Huong-dan-hoc-vien_1080p.mp4`** – 1920×1080, 30fps,
thuyết minh giọng nữ + nhạc nền, dưới 30 MB (mã hoá 2 lượt H.264, bitrate tính theo thời lượng để nét nhất
trong giới hạn dung lượng).

Nội dung theo file *HuongDan_HocVien_VienSTP.pptx*: ảnh chụp thật của phần mềm (`assets/ui/hNN.jpg`, NN = số trang
trong tài liệu); khung cam đánh số đúng theo các bước của tài liệu (`assets/boxes.json`, lấy từ vị trí các khung
`st{n}_box` trong file pptx), xuất hiện đúng lúc tính năng tương ứng được đọc. `h12.jpg` là phần ngăn kéo
"Tạo yêu cầu nhân sự" đã cắt khỏi nền mờ (toạ độ khung đã quy đổi theo vùng cắt); `h15.jpg` đã làm mờ số điện thoại
và email cá nhân.

| Cảnh | Nội dung |
|---|---|
| Mở đầu | Lịch học ở đâu? Bài thi khi nào? Chứng chỉ đã có chưa? → tất cả trong một tài khoản |
| Thương hiệu | Logo Viện STP và DAKO cạnh nhau; cổng đào tạo trực tuyến dành cho học viên |
| Lộ trình | 2 phần · 11 màn hình |
| 01–03 | Trang chủ: đăng nhập & tra cứu chứng chỉ (gõ mã, mã xác thực, Tra cứu ngay); khóa học nổi bật & Góc tri thức; văn phòng & liên hệ |
| Phần 02 | Menu tài khoản học viên, các mục sáng theo lời đọc |
| 04–11 | Trang chủ học viên (Vào học), trang bị BHLĐ, báo cáo sự cố, yêu cầu nhân sự + tạo đơn, tin tức & tài liệu, công việc, hồ sơ cá nhân |
| Bắt đầu | 3 bước: truy cập – đăng nhập – Vào học |
| Kết | Học tập vững vàng, chứng nhận minh bạch; logo hai đơn vị; liên hệ: daotao.vienstp.com · 0827.695.368 · viencongnghestp@gmail.com |

## Thuyết minh

- Kịch bản `narration.json`: `say` viết theo cách đọc (STP → “Ét Tê Pê”, DAKO → “Đa Cô”), `sub` là phụ đề.
- Giọng đọc: Piper `vi_VN-vais1000-medium` (giọng nữ, CC BY 4.0) qua `sherpa-onnx`; `tts.py` đọc mỗi câu nhiều lần
  (`TAKES`) và giữ bản nhận dạng lại khớp nhất (`ASR_DIR` = `sherpa-onnx-zipformer-vi-int8-2025-04-20`).
- `synth.py` đặt từng câu đúng mốc và tự hạ nhạc khi có lời; `build/…srt` là phụ đề khớp lời đọc.

## Dựng lại

```bash
cd video-hv
npm install gsap@3 lucide-static @fontsource/be-vietnam-pro @fontsource/jetbrains-mono playwright
VOICE_DIR=…/vits-piper-vi_VN-vais1000-medium ./build.sh      # hoặc SKIP_TTS=1 ./build.sh
```

Xem trước: `python3 -m http.server 8132` trong `video-hv/`, mở `http://127.0.0.1:8132/index.html?play`
(hoặc `?t=40` để xem khung hình ở giây thứ 40).
