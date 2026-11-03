# Video tư vấn đào tạo ATVSLĐ cho doanh nghiệp đóng tàu & cảng biển – Viện STP × DAKO

Thành phẩm (thư mục gốc repo): **`Vien-STP_DAKO_Tu-van-ATVSLD-nganh-dong-tau_1080p.mp4`** – 1920×1080, 30fps,
animation vẽ bằng SVG, thuyết minh giọng nữ, nhạc nền và tiếng động hiện trường tự tổng hợp, dưới 30 MB.

Nội dung chuyên môn theo tài liệu *Tu_van_nganh_dong_tau.docx* (4 đặc thù ngành, 8 nhóm tai nạn, 3 lời khuyên,
bảng vị trí – nhóm huấn luyện). Kịch bản phân cảnh (hình ảnh · lời thuyết minh · SFX/BGM) nằm trong tài liệu kịch bản
đi kèm.

| Cảnh | Nội dung |
|---|---|
| 1 · Mở đầu | Nhà máy đóng tàu ban đêm: cổng trục, thân tàu trên ụ, giàn giáo, tia hàn, sóng |
| 2 · Đặc thù | 4 thẻ minh hoạ động: môi trường khắc nghiệt, không gian phức tạp, thiết bị nguy hiểm, nhiều nhà thầu phụ |
| 3 · Nguy cơ | “Chỉ một phút lơ là…” → 8 cảnh tai nạn: ngã cao, rơi xuống nước, vật rơi/kẹp, giao thông nội bộ, ngạt khí, cháy nổ, điện giật, môi trường & quá sức |
| 4 · Bước ngoặt | “Không phải để đối phó thủ tục – mà là yêu cầu sống còn”; bình minh, công nhân đủ bảo hộ |
| 5 · Lời khuyên | Nhận thức đúng · đúng nhóm, đủ nội dung · định kỳ 2 năm & kiểm soát nhà thầu |
| 6 · Nhóm huấn luyện | Thẻ vị trí bay vào đúng cột Nhóm 1 – 6 |
| 7 · Giải pháp | Viện STP × DAKO: chương trình, huấn luyện tại nhà máy, thi – cấp chứng nhận, nhắc lịch định kỳ |
| 8 · Kết | Cảng lúc bình minh, hai logo, hotline, email, cổng đào tạo |

## Kỹ thuật

- `art.js`: hình vẽ SVG (nhà máy đêm/bình minh, công nhân có khớp tay chân, cẩu, tàu, xe, két, bình khí…), chuyển động
  theo khung hình khoá (`tr()`), hạt trên canvas (tia hàn, nước bắn, khí độc, khói, nổ, hồ quang).
- `main.js`: 8 cảnh trên một GSAP timeline dừng sẵn; render tất định qua `window.__seek(t)`.
- `narration.json`: `speed` từng câu – 1.1 (dồn dập, phần nguy cơ), 0.9 (đầm ấm, phần giải pháp).
- `synth.py`: nhạc nền + tiếng động hiện trường tự tổng hợp (sóng, mô tơ cẩu, xích, va đập thép, nước bắn, còi xe,
  phanh rít, hồ quang hàn, nổ, nhịp tim, sấm mưa, bước chân, máy mài, còi tàu); phần nguy cơ có nhịp dồn, đoạn bước ngoặt
  lặng nhạc chỉ còn nhịp tim; tiếng động được hạ ít hơn nhạc khi có lời đọc.

## Dựng lại

```bash
cd video-dongtau
npm install gsap@3 lucide-static @fontsource/be-vietnam-pro @fontsource/jetbrains-mono playwright
VOICE_DIR=…/vits-piper-vi_VN-vais1000-medium ./build.sh      # hoặc SKIP_TTS=1 ./build.sh
```
