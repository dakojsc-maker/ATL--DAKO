# Danh sách lỗi đã tô vàng (bản rà soát lần 2)

Tổng cộng có **1.484 chỗ tô vàng** trên **18 / 22 file**.
Ngoài ra, mỗi trang của 5 file lỗi font có thêm **1 khung ghi chú màu vàng**: ở đầu trang, hoặc ở cuối trang nếu đầu trang không đủ chỗ.
Rê chuột vào chỗ tô vàng sẽ thấy ghi chú có dạng **[Loại lỗi] nội dung**. Nội dung gốc của file không bị sửa.

## Tổng hợp theo loại lỗi

| Loại lỗi | Số chỗ |
|---|---:|
| Chính tả | 19 |
| Chính tả (Hàn) | 5 |
| Dùng sai từ | 2 |
| Lặp từ | 1 |
| Khoảng trắng | 10 |
| Ký tự lỗi | 45 |
| Ngắt giữa từ | 41 |
| Ngắt giữa từ / đảo từ | 2 |
| Chữ bị khuất | 75 |
| Dàn trang | 2 |
| Lặp đề mục | 1 |
| Tên cơ quan | 1 |
| Tên cơ quan (Hàn) | 1 |
| Không nhất quán | 11 |
| Không nhất quán (Hàn) | 1 |
| Nội dung | 6 |
| Nội dung (Hàn) | 1 |
| Thiếu thông tin | 4 |
| Đánh dấu năng lực | 28 |
| Lỗi font | 1228 |

## Lỗi font (5 file: 06, 07, 09, 16, 17)

Các file này bị lỗi font khi xuất PDF. Lỗi hiện ra trên mọi trình xem PDF, đã kiểm bằng 2 bộ hiển thị khác nhau:

- Chữ **'ư' đứng trước chữ khác bị mất dấu móc**: *trường → truờng*, *những → nhũng*, *cứu → cúu*, *sửa → sủa*.
- Chữ có dấu **ì/í/ĩ/ị bị hở khoảng** ngay giữa từ: *lĩnh → lĩ nh*, *trình → trì nh*.
- Nhiều chữ t, l, i bị in đậm lệch font.

Từng chữ bị ảnh hưởng đều đã tô vàng:

| File | Số chữ lỗi font |
|---|---:|
| 06_Chuong-trinh-dao-tao.pdf | 264 |
| 07_Chuan-dau-ra-CTDT.pdf | 430 |
| 09_Chinh-sach-cong-nhan-chuyen-doi-tin-chi.pdf | 163 |
| 16_He-thong-dam-bao-chat-luong.pdf | 218 |
| 17_So-do-to-chuc.pdf | 153 |

**Cách khắc phục:** xuất lại PDF từ file gốc (HWP/Word), dùng font hỗ trợ đầy đủ tiếng Việt và nhúng font.

## Chi tiết các lỗi khác theo từng file

### 01_Ho-so-gioi-thieu-truong_ban-tieng-Viet.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 12 | Dàn trang | Tiêu đề bị hình tròn bên cạnh đè lên một phần chữ. |

### 01_Ho-so-gioi-thieu-truong_ban-tieng-Anh.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 5 | Chính tả | Sai: May. → Đúng: May (không có dấu chấm) |
| 11 | Khoảng trắng | Thiếu khoảng trắng: 'Glocal (Global + Local)'. |
| 12 | Dàn trang | Tiêu đề bị hình tròn bên cạnh đè lên một phần chữ. |
| 15 | Chính tả | Sai: Guardiance → Đúng: Guidance / Guardian (không có từ 'Guardiance') |

### 05_Quy-che-dao-tao.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 27 | Ký tự lỗi | Ký tự trong ngoặc hiển thị thành ô vuông (□); 'Mục ta' có vẻ là ký hiệu mục tiếng Hàn chưa dịch. |
| 27, 28 | Ngắt giữa từ | 'Tối thiểu' bị ngắt giữa từ: 'thiể / u'. |
| 27 (×2), 28 (×2) | Ngắt giữa từ | 'Đơn ngành' bị ngắt giữa từ: 'ngà / nh'. |
| 27, 28 | Ngắt giữa từ | 'ngành chính' bị ngắt giữa từ: 'chín / h'. |
| 27 | Ngắt giữa từ | 'chuyên biệt' bị ngắt giữa từ: 'chuy / ên'. |
| 29 (×7), 30 (×7) | Ngắt giữa từ | 'Hạng' bị ngắt giữa từ: 'Hạ / ng'. |
| 29 (×7), 30 (×7) | Ngắt giữa từ | 'Điểm' bị ngắt giữa từ: 'Điể / m'. |

### 06_Chuong-trinh-dao-tao.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 3 (×2) | Ngắt giữa từ | 'Năng lực' bị ngắt giữa từ: 'lự / c'. |
| 3 | Ngắt giữa từ | 'cốt lõi' bị ngắt giữa từ: 'lõ / i'. |
| 3 | Ngắt giữa từ | 'của trường' bị ngắt giữa từ: 'trườn / g'. |
| 3 (×2) | Chữ bị khuất | Ô bị tràn, phần cuối 'vụ khách hàng' không hiển thị. |
| 3 | Chữ bị khuất | Ô bị tràn: 'Năng lực thực [hành]' bị mất chữ. |
| 3 | Chữ bị khuất | Ô bị tràn: 'Năng lực lập kế [hoạch]' bị mất chữ. |
| 3 | Chữ bị khuất | Tiêu đề cột bị cắt: '... và năng lực [chuyên sâu]'. |
| 3 (×7), 4 | Chữ bị khuất | Dòng chữ bị đường kẻ ô cắt ngang/tràn ra ngoài ô (một phần chữ không đọc được). |
| 3 (×4) | Chữ bị khuất | Ô/khung bị tràn: một phần chữ bị che hoặc không hiển thị. |
| 4 | Không nhất quán | Bảng chương trình (trang 1–3) gọi là 'Thực địa I, II, III', ở đây lại ghi 'Thực tập I, II và III'. |
| 4 | Không nhất quán | Cột 'Mở mới' để trống, nhưng trang 5 ghi 'Bổ sung 2 học phần mới (6 tín chỉ)'. |
| 5 | Không nhất quán | Tên học phần trong bảng là 'Thực địa I, II, III'. |
| 5 | Không nhất quán | Tên học phần trong bảng là 'Tổng hợp Đồ án Du lịch'. |
| 5 (×2) | Không nhất quán | Tên học phần trong bảng (trang 2–4) là 'Diễn giải Văn hóa và Du lịch địa phương'. |
| 5 (×2) | Không nhất quán | Tên học phần trong bảng là '... và Hiểu biết ngành công nghiệp địa phương'. |
| 6 | Ngắt giữa từ / đảo từ | 'Xây dựng' bị ngắt 'dựn / g'; thứ tự cũng bị đảo: phải là 'Xây dựng chương trình'. |
| 6 | Ngắt giữa từ / đảo từ | 'Triển khai' bị ngắt 'k / hai'; thứ tự bị đảo: phải là 'Triển khai chương trình'. |
| 6 (×4) | Chữ bị khuất | Dòng chữ bị đường kẻ ô cắt ngang ở mép dưới. |
| 6 | Chữ bị khuất | Tiêu đề 'Định lượng' bị cắt ở mép dưới. |
| 6 | Chữ bị khuất | Tiêu đề 'Định tính' bị cắt ở mép dưới. |

### 07_Chuan-dau-ra-CTDT.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 | Chữ bị khuất | Dòng cuối của khung bị cắt ngang; chữ 'tế.' không hiển thị ('trên trường quốc [tế]'). |
| 2 | Chữ bị khuất | Tiêu đề ô bị cắt: 'Rà soát chân dung tốt [nghiệp]'. |
| 2 | Khoảng trắng | Dính chữ: 'trườngvà' → 'trường và'. |
| 2 | Chữ bị khuất | Bị cắt: 'Dự báo cung cầu nhân [lực]'. |
| 2 | Chữ bị khuất | Bị cắt: '... từ [góc nhìn doanh nghiệp]'. |
| 2 | Chữ bị khuất | Bị cắt: '... dựa [trên kết quả đánh giá]'. |
| 2 | Chữ bị khuất | Mục tiếp theo trong ô bị khuất: '• Tình hình việc làm và học tiếp của sinh viên tốt nghiệp'. |
| 2 | Lặp đề mục | Đề mục '1. Xác định năng lực chuyên ngành' và 'A. Quy trình...' bị lặp lại ngay trong khung nội dung. |
| 2 (×2), 5 (×3) | Chữ bị khuất | Ô/khung bị tràn: một phần chữ bị che hoặc không hiển thị. |
| 4 (×12), 5 (×14) | Chữ bị khuất | Dòng chữ bị đường kẻ ô cắt ngang/tràn ra ngoài ô (một phần chữ không đọc được). |
| 5 | Nội dung | Phần 'Năng lực chuyên biệt về sư phạm' (giáo viên, học sinh, phụ huynh) không liên quan ngành Quản trị du lịch; có vẻ sao chép từ mẫu ngành sư phạm. |

### 08_De-cuong-chi-tiet-hoc-phan.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 (×3), 5 (×3), 9 (×3), 10 (×3), 15 (×3) | Đánh dấu năng lực | Không có năng lực chính (●): cả 3 năng lực đều đánh ▲, trái quy ước '1 năng lực chính / 2 năng lực phụ'. |
| 1 (×2), 2 (×2), 3 (×2), 4 (×2), 5 (×2), 6 (×2), 7 (×2), 8 (×2), 9 (×2), 10 (×2), 11 (×2), 12 (×2), 13 (×2), 14 (×2), 15 (×2), 16 (×2), 17 (×2), 18 (×2), 19 (×2), 20 (×2), 21 (×2), 22 (×2) | Ký tự lỗi | Ký tự hiển thị thành ô vuông (□); nên là dấu ngoặc '(' ')'. |
| 13 (×3), 18 (×3), 19 (×3) | Đánh dấu năng lực | Có 2 năng lực chính (●) và 1 phụ (▲), trái quy ước '1 năng lực chính / 2 năng lực phụ'. |
| 16 (×4) | Đánh dấu năng lực | Đánh dấu 4 năng lực (3 ▲ + 1 ●), trái quy ước '1 năng lực chính / 2 năng lực phụ'. |
| 17 | Nội dung | Mô tả của 'Năng lực phụ 1' và 'Năng lực phụ 2' bị đảo cho nhau. |
| 17 | Nội dung | Phương pháp/đánh giá của 'Giải quyết vấn đề sáng tạo' sao chép từ học phần 'Tổng hợp Đồ án Du lịch' (bảo tồn, giá trị xã hội), không khớp. |
| 18 | Thiếu thông tin | Thiếu mã học phần (file 06 ghi 47532). |
| 19 | Thiếu thông tin | Thiếu mã học phần (file 06 ghi 47533). |
| 20 | Thiếu thông tin | Thiếu mã học phần (file 06 ghi 47536). |
| 21 | Thiếu thông tin | Thiếu mã học phần (file 06 ghi 47535). |
| 22 | Nội dung | Mô tả này thuộc năng lực 'Phân tích và sử dụng thông tin', không khớp 'Giao tiếp'. |
| 22 | Nội dung | Bảng phương pháp/đánh giá và các ghi chú 1)–3) sao chép nguyên từ học phần 'Tổng hợp Đồ án Du lịch' (trang 21), không phù hợp học phần này. |

### 10_Quy-dinh-danh-gia-KQHT-sinh-vien.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 5 | Không nhất quán | Cùng Chương 12 của Quy chế, file 11 ghi 'Kỷ luật, khen thưởng, xử lý vi phạm và trang phục'. |

### 11_Dieu-kien-tot-nghiep.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 2 | Không nhất quán | Cùng Chương 12 của Quy chế, file 10 ghi 'Kỷ cương, khen thưởng, kỷ luật và trang phục'. |

### 12_Mau-van-bang.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 | Chính tả | Sai: Certified → certified (không viết hoa giữa câu) |
| 1 | Chính tả | Sai: Managemet → Management |
| 1 | Khoảng trắng | Thiếu khoảng trắng: 'Studies (Tourism' |

### 13_Mau-bang-diem.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 | Chính tả | Sai: Adminssion → Admission |
| 1 | Chính tả | Sai: October. → October (không có dấu chấm) |
| 1 | Chính tả | Sai: worhshop2 → workshop2 |
| 1 | Chính tả | Sai: TROUGH → THROUGH |
| 1 | Chính tả | Sai: FUGURE → FIGURE / FUTURE |
| 1 | Khoảng trắng | Thiếu khoảng trắng: 'Department (Division)' |
| 1 (×2) | Khoảng trắng | Thiếu khoảng trắng: 'Issue No' |
| 1 | Khoảng trắng | Thiếu khoảng trắng sau dấu phẩy: 'SEXUALITY, LOVE, FAMILY' |
| 1 | Khoảng trắng | Thiếu khoảng trắng: 'points (Grade' |
| 1 | Lặp từ | Lặp từ: 'verify and verify' (thừa một 'verify') |

### 14_Danh-sach-giang-vien.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 (×4) | Chính tả | Sai: Visting → Đúng: Visiting |
| 1 | Chính tả | Sai: Koran → Đúng: Korean |
| 1 | Khoảng trắng | Thiếu khoảng trắng: 'Culture & Sports'. |

### 15_Ho-so-nang-luc-CV-giang-vien.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 | Chính tả | Sai: Instituion → Đúng: Institution |
| 3, 5, 6, 8 | Chính tả | Sai: Affilitated → Đúng: Affiliated |

### 16_He-thong-dam-bao-chat-luong.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 | Chữ bị khuất | Tiêu đề bị đường kẻ ô cắt ở mép dưới. |
| 1 | Chữ bị khuất | Bị cắt: 'Tổ Quản lý kết quả gi[áo dục]'. |
| 1 | Chữ bị khuất | 'Ngày sửa đổi gần nhất' bị cắt ở mép dưới. |

### 17_So-do-to-chuc.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 | Dùng sai từ | 'Phần mềm di chuyển' nên là 'Phần mềm di động' (file 05 trang 28 ghi 'Phần mềm di động thông minh'). |
| 1 (×8), 2 (×4) | Chữ bị khuất | Ô/khung bị tràn: một phần chữ bị che hoặc không hiển thị. |
| 2 | Dùng sai từ | 'Phần mềm di chuyển' nên là 'Phần mềm di động'. |
| 2 | Khoảng trắng | Dính chữ: 'từpeptide' → 'từ peptide'. |

### 18_Thu-cam-ket-hop-tac_tieng-Han.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 | Chính tả (Hàn) | Phiên âm chuẩn là '호찌민' (phần thân văn bản ghi '호찌민시'); không thống nhất. |
| 1 | Chính tả (Hàn) | Sai tiểu từ: '세부협약(MOA)을' (tiểu từ theo '협약', kết thúc bằng phụ âm). |

### 19_Quyet-dinh-Hoi-dong-truong_tieng-Viet.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 2 | Tên cơ quan | Tên chính thức là 'Bộ Giáo dục và Đào tạo' (file 18 ghi đúng). |
| 2 | Không nhất quán | Ghi 8 thành viên nhưng danh sách phê duyệt bên dưới có 10 người. |
| 2 | Nội dung | Giờ bắt đầu và kết thúc trùng nhau (16:57–16:57). |

### 19_Quyet-dinh-Hoi-dong-truong_tieng-Han.pdf

| Trang | Loại lỗi | Nội dung (ghi chú) |
|---|---|---|
| 1 (×2) | Chính tả (Hàn) | Phiên âm chuẩn là '호찌민' (file 18 ghi '호찌민시'); viết liền '호치민산업무역대학교' cũng không thống nhất. |
| 2 | Tên cơ quan (Hàn) | Tên đúng là '베트남 교육훈련부' (Bộ Giáo dục và Đào tạo), như file 18. |
| 2 | Không nhất quán (Hàn) | Ghi 8 thành viên nhưng danh sách phê duyệt có 10 người. |
| 2 | Nội dung (Hàn) | Giờ bắt đầu và kết thúc trùng nhau. |
| 3 | Chính tả (Hàn) | Dùng dấu chấm '.' thay cho dấu '·': 'K-컬처공연·기획학과'. |

## File không phát hiện lỗi

Có 4 file không phát hiện lỗi:

- **02, 04:** giấy chứng nhận kiểm định và công văn của Bộ Giáo dục Hàn Quốc, là ảnh scan, đã đọc trực tiếp từ ảnh.
- **03:** ảnh chụp giấy phép gốc năm 1948 (chữ Hán) và năm 1964 (tiếng Hàn). Đây là văn bản lịch sử gốc nên không áp chính tả hiện đại; nội dung đọc được, không có lỗi do người lập hồ sơ.
- **18 bản tiếng Việt.**

## Phạm vi và cách rà soát lần 2

Lần 2 soát **tiếng Việt, tiếng Anh và tiếng Hàn**, gồm các bước:

- **Chính tả và dấu:** dùng từ điển hunspell tiếng Việt và tiếng Anh, kiểm cả cách đặt dấu kiểu cũ/mới (hoà/hòa).
- **Lỗi dùng sai từ tiếng Việt** (ví dụ sửa/sữa, xử/sử, d/gi/r, ch/tr, n/ng): đối chiếu với từ điển 74.000 từ ghép, thử mọi biến thể dấu và phụ âm dễ nhầm. Đã xem 206 nghi vấn, không có lỗi.
- **Lỗi dùng sai từ tiếng Anh:** dùng tần suất từ (wordfreq), cộng với đọc toàn văn.
- **Phần tiếng Hàn:** đọc thủ công toàn bộ file 18, 19 bản tiếng Hàn và chữ Hàn trong các file khác.
- **Lỗi hiển thị:** dựng lại chữ theo vị trí thật trên trang để bắt các lỗi dính chữ, ngắt giữa từ, chữ bị che hoặc bị đường kẻ ô cắt, và ký tự lỗi (□).
- **Trang ảnh scan:** nhận dạng chữ (OCR) kết hợp đọc trực tiếp từ ảnh.
- **Đối chiếu nhất quán giữa các file:** tên và mã học phần giữa file 06, 08, 19; số liệu trong biên bản.
- **Kiểm tra kết quả:** chụp lại từng trang đã tô để xác nhận màu vàng nằm đúng chỗ.

Phần tiếng Việt viết đúng chính tả và dấu. Các lỗi tiếng Việt tìm thấy là lỗi hiển thị (font, cắt chữ, ngắt dòng) và lỗi nội dung hoặc thiếu nhất quán.

Một số mục là trích lược và đánh số không liên tục (ví dụ file 09 Điều 2 bắt đầu từ mục 2; file 11 có khoản ①②③⑤⑦⑨). Có vẻ đây là chủ ý trích dẫn nên không tô.
