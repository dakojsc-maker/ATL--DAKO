# Hợp đồng nguyên tắc DAKO – đối tác (kèm phụ lục bảng phí từng lớp)

Bộ mẫu để lập **Hợp đồng nguyên tắc** giữa Công ty CP Kỹ thuật Hàng hải DAKO (Bên B) và đối tác
(Bên A – bên khai thác khách hàng) cùng triển khai dịch vụ huấn luyện ATLĐ. Mỗi khóa huấn luyện có
**một phụ lục riêng** với **bảng chi phí từng lớp**. Kết quả là file Word (.docx) giữ nguyên định
dạng file gốc: font Times New Roman, cỡ chữ 13 (tiêu đề 15), giãn dòng 1,5, khổ A4, lề trái 1,47 cm –
phải 1,75 cm – dưới 0,75 cm, đầu/chân trang 0,9 cm, số trang ở giữa chân trang.

## Thư mục

| Đường dẫn | Nội dung |
|---|---|
| `mau/MAU-HOP-DONG-NGUYEN-TAC-DAKO-goc.doc` | File hợp đồng gốc (bản ký với HKM) |
| `mau/mau-hop-dong-nguyen-tac.docx` | Mẫu hợp đồng có các trường `{{...}}` – nội dung giữ nguyên bản gốc |
| `mau/mau-phu-luc.docx` | Mẫu phụ lục bảng phí dịch vụ (cùng định dạng, dựng từ chính các đoạn của bản gốc) |
| `cau-hinh-mac-dinh.json` | Thông tin cố định của DAKO + điều khoản mặc định của phụ lục |
| `doi-tac/<viet-tat>.json` | Thông tin từng đối tác (mỗi đối tác một file) |
| `ket-qua/<VIET-TAT>/` | Hợp đồng đã tạo |
| `tao_hop_dong.py` | Tạo hợp đồng + phụ lục từ file thông tin đối tác |
| `tao_mau.py` | Dựng lại 2 file mẫu từ file gốc .doc (chỉ chạy khi cần làm lại mẫu) |

## Tạo hợp đồng cho đối tác mới

1. Chép `doi-tac/hkm.json` thành `doi-tac/<viet-tat>.json` và sửa thông tin.
2. Chạy:

```bash
python3 hop-dong-nguyen-tac/tao_hop_dong.py hop-dong-nguyen-tac/doi-tac/<viet-tat>.json
```

Mặc định ra **một file** gồm hợp đồng và tất cả phụ lục (mỗi phụ lục sang trang mới, đánh số trang
lại từ 1). Tùy chọn:

| Tùy chọn | Tác dụng |
|---|---|
| `--tach` | Mỗi văn bản một file: `..._hop-dong.docx`, `..._phu-luc-01.docx`, ... |
| `--khong-phu-luc` | Chỉ xuất hợp đồng |
| `--chi-phu-luc` | Chỉ xuất phụ lục (bổ sung khóa mới cho đối tác đã ký) |
| `--phu-luc 3` / `--phu-luc 1,3` / `--phu-luc 2-4` | Chọn phụ lục cần xuất |
| `--pdf` | Xuất thêm PDF để xem nhanh |
| `--ra <thư mục>` | Nơi lưu (mặc định `ket-qua/<VIET-TAT>/`) |

## File thông tin đối tác

```json
{
  "so_thu_tu": 2,                       // số thứ tự HĐ trong năm -> 02/2026/HĐĐT/ABC-DAKO
  "so_hop_dong": "",                    // (tùy chọn) ghi thẳng số HĐ nếu không theo quy tắc trên
  "ngay_ky": "15/11/2026",
  "ben_a": {
    "ten": "CÔNG TY TNHH ABC",
    "viet_tat": "ABC",
    "dia_chi": "...",
    "ma_so_thue": "...",
    "dai_dien": "NGUYỄN VĂN A",
    "chuc_vu": "GIÁM ĐỐC",
    "xung_ho": "Ông",                   // (tùy chọn) mặc định "Ông (Bà)" như bản gốc
    "dien_thoai": "...",                // (tùy chọn) có thì thêm dòng, không có thì bỏ dòng
    "email": "...",                     // (tùy chọn)
    "tai_khoan": "... Ngân hàng ..."    // (tùy chọn)
  },
  "phu_luc": {                          // (tùy chọn) áp dụng cho mọi phụ lục của đối tác này
    "ghi_chu": ["Đơn giá trên chưa bao gồm thuế GTGT (VAT)."]
  },
  "khoa_hoc": [
    {
      "ten": "Huấn luyện an toàn vệ sinh lao động",   // tên khóa -> Điều 2 của HĐ + tiêu đề phụ lục
      "can_cu": ["Căn cứ Nghị định số 44/2016/NĐ-CP ...;"],   // (tùy chọn) căn cứ riêng của phụ lục
      "lop": [
        {"ten": "Nhóm 1", "mo_ta": "Người quản lý phụ trách công tác ATVSLĐ",
         "thoi_luong": "16 giờ", "don_vi_tinh": "Học viên", "don_gia": 800000,
         "so_luong": 20, "ghi_chu": ""}
      ],
      "ghi_chu": ["..."]                // (tùy chọn) ghi chú riêng dưới bảng
    }
  ]
}
```

(Các dòng `// ...` chỉ để giải thích, file thật không được có chú thích.)

Bảng chi phí từng lớp tự co giãn theo dữ liệu:

- Cột **Thời lượng / Đơn vị tính / Số lượng / Ghi chú** chỉ hiện khi có dữ liệu.
- Có **số lượng** thì thêm cột **Thành tiền**, dòng **Tổng cộng** và **số tiền bằng chữ**.
- **Đơn giá** để trống thì in dấu chấm để điền tay; ghi chữ (vd. "Thỏa thuận") thì in nguyên chữ.
- Khóa chưa có danh sách lớp (`"lop"` trống) thì phụ lục có bảng trống 4 dòng để điền tay.

Ngoài ra trong mỗi khóa có thể ghi:

- `"so_phu_luc"` – số phụ lục (mặc định theo thứ tự 01, 02, ...); `"ngay_ky"` – ngày ký riêng của phụ lục.
- `"mo_ta"` – câu dẫn trước bảng; `"cot_bang"` – đổi tên cột (vd. `{"ten": "Đối tượng huấn luyện"}`).
- `"cac_dieu"` – thay toàn bộ các Điều 2, 3, 4 mặc định; `"them_dieu"` – thêm điều mới sau các điều mặc định,
  dạng `[{"tieu_de": "...", "noi_dung": ["...", "..."]}]`.

## Sửa nội dung cố định

- **Thông tin DAKO** (địa chỉ, tài khoản, người đại diện...) và **điều khoản mặc định của phụ lục**
  (thời gian – địa điểm, thanh toán, điều khoản chung): sửa `cau-hinh-mac-dinh.json`.
- **Câu chữ của hợp đồng**: mở `mau/mau-hop-dong-nguyen-tac.docx` bằng Word, sửa trực tiếp, giữ nguyên
  các trường `{{...}}`, lưu lại. Không chạy lại `tao_mau.py` sau đó (lệnh này dựng lại mẫu từ file gốc
  và sẽ ghi đè phần đã sửa).

## Quy ước trường trong mẫu

- `{{TEN}}` – thay bằng giá trị.
- `{{?TEN}}` – dòng tùy chọn, bỏ cả dòng nếu không có giá trị.
- `{{DS_TEN}}` – nhân đoạn văn thành danh sách (giữ kiểu gạch đầu dòng).
- `{{BANG_CHI_PHI}}` – vị trí bảng chi phí từng lớp; `ĐIỀU {{D_SO}}. {{D_TIEU_DE}}` + `{{D_NOI_DUNG}}` – khuôn các điều của phụ lục.

Ghi chú: phụ lục được tách section và đặt "bắt đầu số trang = 1" theo chuẩn Word; bản PDF xem thử do
LibreOffice xuất có thể vẫn đánh số trang liên tục, mở bằng Word sẽ đúng.
