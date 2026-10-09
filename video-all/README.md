# Video hướng dẫn phần mềm quản lý ATVSLĐ – Doanh nghiệp & Học viên (Viện STP × DAKO, bản gộp)

Thành phẩm (thư mục gốc repo): **`Vien-STP_Huong-dan-Doanh-nghiep-va-Hoc-vien_1080p.mp4`** – 1920×1080, 30fps,
thuyết minh giọng nữ + nhạc nền, một file duy nhất.

Gộp hai video đã làm: `video-atld/` (hướng dẫn doanh nghiệp, theo *HuongDan_PhanMem_DoanhNghiep_VienSTP_v2.pptx*) và
`video-hv/` (hướng dẫn học viên, theo *HuongDan_HocVien_VienSTP.pptx*). Một mở đầu, một phần thương hiệu, một phần kết;
toàn bộ cảnh tính năng của hai video được giữ nguyên.

| Đoạn | Nội dung |
|---|---|
| Mở đầu | Hồ sơ rải rác, chứng chỉ hết hạn, thiết bị quá hạn kiểm định |
| Thương hiệu | Logo Viện STP và DAKO cạnh nhau; hai cổng: doanhnghiep.vienstp.com · daotao.vienstp.com |
| Hai phần | Thẻ Phần 1 – doanh nghiệp, Phần 2 – học viên (ảnh giao diện thật) |
| Phần 1 | 5 phân hệ → 12 cảnh tính năng cho doanh nghiệp |
| Phần 2 | Câu hỏi của học viên → 2 khu vực, 11 màn hình (cổng đào tạo + tài khoản học viên) |
| Hợp tác | Mô hình hợp tác chiến lược Viện STP – DAKO |
| Bắt đầu | 3 bước: doanh nghiệp đăng nhập & khai báo – học viên đăng nhập – Vào học |
| Kết | Thông điệp, hai logo, hai cổng đăng nhập, hotline, email |

- `assets/boxes.json` / `assets/boxes_hv.json`: các bước đánh số của tài liệu doanh nghiệp / học viên (`st()` / `sth()` trong main.js).
- `narration.json`: 65 câu; 58 câu dùng lại bản đọc của hai video (đổi id cảnh: `hs1`, `hs3` cho phần học viên),
  7 câu nối mới đọc bằng `tts.py` (`ONLY=none` chỉ đọc câu đổi).

## Dựng lại

```bash
cd video-all
npm install gsap@3 lucide-static @fontsource/be-vietnam-pro @fontsource/jetbrains-mono playwright
SKIP_TTS=1 ./build.sh    # cần build/vo/*.wav (chép từ video-atld/build/vo và video-hv/build/vo, xem narration.json)
```

Xem trước: `python3 -m http.server 8134` trong `video-all/`, mở `http://127.0.0.1:8134/index.html?play`.
