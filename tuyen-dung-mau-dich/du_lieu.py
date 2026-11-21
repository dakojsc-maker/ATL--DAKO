# -*- coding: utf-8 -*-
"""Dữ liệu workflow tuyển dụng Mậu Dịch 197X (Công ty TNHH Hoàng Sa Nha Trang).

Nguồn: Bảng tổng hợp chỉ tiêu & ngân sách tuyển dụng (8 vị trí, 28 nhân sự).
Mức lương tham khảo trong bảng KHÔNG đưa vào bài đăng: theo yêu cầu, lương và
phúc lợi được trao đổi trực tiếp khi phỏng vấn.

Trong nội dung bài, các khối dùng chung được ghép lúc chạy:
  {CA} {MOTA} {YEUCAU} {QUYENLOI} {KHAC} {LIENHE} {TAG}
"""

LIEN_HE = {
    "cong_ty": "Công ty TNHH Hoàng Sa Nha Trang",
    "thuong_hieu": "Mậu Dịch 197X",
    "slogan": "Cà phê • Ẩm thực • Vui chơi • Cộng đồng",
    "dia_chi": "33-37 Dã Tượng, Phường Nha Trang",
    "email": "thanhthuynt28888@gmail.com",
    "zalo": "0976.297.038",
}

# ---------------------------------------------------------------- vị trí
VI_TRI = [
    {
        "id": "QL", "ten": "Quản lý quán", "day_du": "Quản lý quán cà phê", "en": "Café Manager", "icon": "🧭",
        "sl": 1, "loai": "Full-time ca gãy",
        "ca": ["Full-time ca gãy (9 tiếng/ngày)", "Ca sáng: 06:00 – 11:00", "Ca tối: 18:00 – 22:00"],
        "ca_ngan": "Full-time ca gãy: 06:00–11:00 & 18:00–22:00",
        "ngan": 'Full-time ca gãy · từ 2 năm kinh nghiệm quản lý F&B', "poster_ca": ['Ca gãy: 06:00 – 11:00 & 18:00 – 22:00'],
        "mota": [
            "Quản lý toàn bộ vận hành 3 khu: Khối A, Khối B, Sân vườn và Quầy Bar Trung Tâm",
            "Tuyển chọn, đào tạo, phân ca và đánh giá đội ngũ nhân viên",
            "Kiểm soát chất lượng đồ uống, món ăn và dịch vụ theo tiêu chuẩn của quán",
            "Quản lý doanh thu, chi phí, kho nguyên vật liệu và tài sản",
            "Xử lý tình huống, phản hồi của khách; xây dựng trải nghiệm để khách quay lại",
            "Phối hợp tổ chức hoạt động vui chơi, sự kiện cộng đồng; báo cáo định kỳ cho Ban Giám đốc",
        ],
        "yeucau": [
            "Tối thiểu 2 năm kinh nghiệm quản lý quán cà phê / F&B, ưu tiên mô hình nhiều khu, quy mô lớn",
            "Kỹ năng lãnh đạo, giao tiếp và xử lý tình huống tốt",
            "Thành thạo báo cáo, phần mềm bán hàng (POS), Excel cơ bản",
            "Ưu tiên giao tiếp được tiếng Anh, hiểu thị trường F&B Nha Trang",
            "Trung thực, chủ động, mong muốn gắn bó lâu dài",
        ],
        "thang_tien": "Cơ hội phát triển lâu dài cùng thương hiệu Mậu Dịch 197X",
        "them": [],
        "tag": "#TuyenQuanLy #QuanLyQuanCafe #ViecLamFnB",
        "poster": {"tieu_de": "QUẢN LÝ QUÁN CÀ PHÊ", "phu": "CAFÉ MANAGER · FULL-TIME"},
        "ung_vien": "Quản lý / trợ lý quản lý F&B 25–40 tuổi, đã điều hành quán cà phê quy mô vừa và lớn",
        "do_kho": "Cao", "muc_kho": 3,
        "kenh": ["fanpage", "fb_fnb", "topcv", "vietnamworks", "linkedin", "noibo"],
        "gio": ["08:00", "20:30"],
        "cta": "Gửi CV qua email hoặc nhắn Zalo để được hẹn lịch phỏng vấn sớm nhất",
    },
    {
        "id": "GS", "ten": "Giám sát ca", "day_du": "Giám sát ca (Shift Leader)", "en": "Shift Leader", "icon": "🎯",
        "sl": 2, "loai": "Full-time",
        "ca": ["Full-time 9 tiếng/ngày", "Ca sáng: 06:00 – 15:00", "Ca chiều: 14:00 – 23:00"],
        "ca_ngan": "Full-time 9h: 06:00–15:00 hoặc 14:00–23:00",
        "ngan": 'Full-time 9 tiếng · từ 1 năm kinh nghiệm F&B', "poster_ca": ['Ca sáng 06:00 – 15:00 · Ca chiều 14:00 – 23:00'],
        "mota": [
            "Điều phối nhân sự trong ca, phân công phục vụ theo từng khu (Khối A, Khối B, Sân vườn)",
            "Giám sát quy trình phục vụ, chất lượng đồ uống – món ăn và vệ sinh khu vực",
            "Mở ca, giao ca, kiểm kê và bàn giao cuối ca",
            "Tiếp nhận và xử lý nhanh phản hồi của khách",
            "Hướng dẫn, kèm cặp nhân viên mới; báo cáo tình hình ca cho Quản lý",
        ],
        "yeucau": [
            "Tối thiểu 1 năm kinh nghiệm F&B, ưu tiên đã làm trưởng ca / giám sát",
            "Nhanh nhẹn, quán xuyến, giữ được bình tĩnh trong giờ cao điểm",
            "Giao tiếp tốt, biết truyền lửa và hỗ trợ đồng đội",
            "Sử dụng thành thạo điện thoại, máy tính, phần mềm bán hàng",
        ],
        "thang_tien": "Cơ hội thăng tiến: Giám sát ca → Quản lý",
        "them": [],
        "tag": "#TuyenGiamSat #ShiftLeader #ViecLamFnB",
        "poster": {"tieu_de": "GIÁM SÁT CA", "phu": "SHIFT LEADER · FULL-TIME"},
        "ung_vien": "Nhân sự F&B 22–35 tuổi, trưởng ca hoặc nhân viên lâu năm muốn lên vị trí quản lý",
        "do_kho": "Trung bình – cao", "muc_kho": 2,
        "kenh": ["fanpage", "fb_vieclam", "topcv", "jobsgo", "zalo"],
        "gio": ["07:30", "20:00"],
        "cta": "Nhắn Zalo hoặc gửi CV qua email để được hẹn lịch phỏng vấn",
    },
    {
        "id": "TN", "ten": "Thu ngân / Điều phối Bar", "day_du": "Thu ngân / Điều phối Bar (Cashier)", "en": "Cashier", "icon": "💳",
        "sl": 2, "loai": "Full-time",
        "ca": ["Full-time", "Ca sáng: 06:30 – 14:30", "Ca chiều: 14:00 – 22:00"],
        "ca_ngan": "Full-time: 06:30–14:30 hoặc 14:00–22:00",
        "ngan": 'Full-time · cẩn thận, trung thực, có hướng dẫn', "poster_ca": ['Ca sáng 06:30 – 14:30 · Ca chiều 14:00 – 22:00'],
        "mota": [
            "Đón khách, nhận order, tư vấn menu nhanh gọn",
            "Tính tiền trên phần mềm POS; nhận thanh toán tiền mặt, chuyển khoản, thẻ",
            "Điều phối phiếu order đến Quầy Bar và bếp đúng thứ tự, đúng bàn",
            "Kiểm đếm, đối soát và bàn giao két cuối ca",
            "Giải đáp thắc mắc của khách về hóa đơn, chương trình ưu đãi",
        ],
        "yeucau": [
            "Trung thực, cẩn thận, nhanh nhẹn với con số",
            "Tác phong gọn gàng, giao tiếp thân thiện",
            "Sử dụng được máy tính, điện thoại cơ bản",
            "Ưu tiên có kinh nghiệm thu ngân F&B – chưa có kinh nghiệm sẽ được hướng dẫn",
        ],
        "thang_tien": "Cơ hội thăng tiến: Thu ngân → Giám sát ca",
        "them": [],
        "tag": "#TuyenThuNgan #Cashier #ViecLamNhaTrang",
        "poster": {"tieu_de": "THU NGÂN", "phu": "ĐIỀU PHỐI BAR · CASHIER · FULL-TIME"},
        "ung_vien": "Ứng viên 20–35 tuổi cẩn thận, từng làm thu ngân, bán hàng hoặc kế toán bán hàng",
        "do_kho": "Trung bình", "muc_kho": 2,
        "kenh": ["fanpage", "fb_vieclam", "chotot", "topcv", "zalo"],
        "gio": ["11:30", "20:00"],
        "cta": "Nhắn Zalo hoặc gửi CV qua email để được hẹn lịch phỏng vấn",
    },
    {
        "id": "TQ", "ten": "Trưởng quầy pha chế", "day_du": "Trưởng quầy Pha chế (Head Barista)", "en": "Head Barista", "icon": "🔥",
        "sl": 1, "loai": "Full-time ca gãy",
        "ca": ["Full-time ca gãy (9 tiếng/ngày)", "Ca sáng: 06:00 – 11:00", "Ca tối: 18:00 – 22:00"],
        "ca_ngan": "Full-time ca gãy: 06:00–11:00 & 18:00–22:00",
        "ngan": 'Full-time ca gãy · từ 2 năm kinh nghiệm pha chế', "poster_ca": ['Ca gãy: 06:00 – 11:00 & 18:00 – 22:00'],
        "mota": [
            "Quản lý vận hành Quầy Bar Trung Tâm – nơi phục vụ cả 3 khu",
            "Xây dựng, chuẩn hóa công thức và định lượng: cà phê phin, espresso, trà, đồ uống signature",
            "Phân công, đào tạo và kèm cặp đội ngũ Barista",
            "Kiểm soát nguyên liệu, hao hụt, đặt hàng và vệ sinh an toàn thực phẩm tại quầy",
            "Nghiên cứu, đề xuất đồ uống mới theo mùa, theo sự kiện",
        ],
        "yeucau": [
            "Tối thiểu 2 năm kinh nghiệm pha chế, ưu tiên từng làm trưởng / phó quầy",
            "Vững kỹ thuật espresso và các cách pha cà phê truyền thống Việt Nam",
            "Có khả năng đào tạo, quản lý đội nhóm, chịu được áp lực giờ cao điểm",
            "Sáng tạo, tỉ mỉ, đam mê đồ uống",
        ],
        "thang_tien": "Cơ hội xây dựng menu signature và phát triển lâu dài cùng thương hiệu",
        "them": [],
        "tag": "#TuyenTruongQuay #HeadBarista #BaristaNhaTrang",
        "poster": {"tieu_de": "TRƯỞNG QUẦY PHA CHẾ", "phu": "HEAD BARISTA · FULL-TIME"},
        "ung_vien": "Barista / bartender 23–35 tuổi, từ 2 năm nghề, từng đứng quầy chính",
        "do_kho": "Cao", "muc_kho": 3,
        "kenh": ["fanpage", "fb_barista", "fb_vieclam", "instagram", "topcv"],
        "gio": ["09:00", "21:00"],
        "cta": "Nhắn Zalo hoặc gửi CV kèm ảnh/video sản phẩm qua email để được hẹn phỏng vấn",
    },
    {
        "id": "PC", "ten": "Pha chế", "day_du": "Pha chế (Barista)", "en": "Barista", "icon": "☕",
        "sl": 8, "loai": "Full-time & Part-time",
        "ca": [
            "Full-time 9 tiếng: Ca sáng 06:00 – 15:00 | Ca chiều 14:00 – 23:00",
            "Part-time 5 tiếng (ca cao điểm): 06:00 – 11:00 | 17:00 – 22:00",
        ],
        "ca_ngan": "Full-time 9h (06:00–15:00 / 14:00–23:00) · Part-time 5h (06:00–11:00 / 17:00–22:00)",
        "ngan": 'Full-time 9 tiếng hoặc Part-time 5 tiếng · có đào tạo', "poster_ca": ['Full-time 9h: 06:00 – 15:00 / 14:00 – 23:00', 'Part-time 5h: 06:00 – 11:00 / 17:00 – 22:00'],
        "mota": [
            "Pha chế đồ uống theo công thức chuẩn: cà phê phin, espresso, trà, đá xay, nước ép…",
            "Chuẩn bị nguyên liệu, dụng cụ đầu ca; giữ quầy luôn sạch, gọn, đúng chuẩn an toàn thực phẩm",
            "Phối hợp Thu ngân – Phục vụ để ra món nhanh, đúng order",
            "Cùng Trưởng quầy thử nghiệm, góp ý đồ uống mới",
        ],
        "yeucau": [
            "Ưu tiên có kinh nghiệm pha chế; chưa có kinh nghiệm sẽ được đào tạo",
            "Nhanh nhẹn, sạch sẽ, cẩn thận, yêu thích đồ uống",
            "Part-time phù hợp sinh viên, người cần thêm thu nhập",
            "Tinh thần đồng đội, theo kịp nhịp làm việc giờ cao điểm",
        ],
        "thang_tien": "Cơ hội thăng tiến: Barista → Trưởng quầy pha chế",
        "them": [],
        "tag": "#TuyenBarista #TuyenPhaChe #ViecLamPartTime",
        "poster": {"tieu_de": "PHA CHẾ", "phu": "BARISTA · FULL-TIME & PART-TIME"},
        "ung_vien": "Barista 18–30 tuổi; sinh viên, người trẻ yêu pha chế (Part-time)",
        "do_kho": "Trung bình (số lượng lớn)", "muc_kho": 2,
        "kenh": ["fanpage", "fb_barista", "fb_vieclam", "fb_sinhvien", "instagram", "tiktok"],
        "gio": ["11:30", "20:30"],
        "cta": "Nhắn Zalo ngay hôm nay để được hẹn lịch phỏng vấn",
    },
    {
        "id": "PV", "ten": "Phục vụ / Runner", "day_du": "Phục vụ / Runner", "en": "Server / Runner", "icon": "🙋",
        "sl": 10, "loai": "Full-time & Part-time",
        "ca": [
            "Full-time 9 tiếng: Ca sáng 06:00 – 15:00 | Ca chiều 14:00 – 23:00",
            "Part-time 5 tiếng: 06:00 – 11:00 | 17:00 – 22:00",
        ],
        "ca_ngan": "Full-time 9h (06:00–15:00 / 14:00–23:00) · Part-time 5h (06:00–11:00 / 17:00–22:00)",
        "ngan": 'Full-time 9 tiếng hoặc Part-time 5 tiếng · không cần kinh nghiệm', "poster_ca": ['Full-time 9h: 06:00 – 15:00 / 14:00 – 23:00', 'Part-time 5h: 06:00 – 11:00 / 17:00 – 22:00'],
        "mota": [
            "Đón khách, hướng dẫn chỗ ngồi, nhận order tại khu được phân công (Khối A, Khối B hoặc Sân vườn)",
            "Runner: chuyển đồ uống, món ăn từ Quầy Bar và bếp đến đúng bàn, nhanh và chuẩn",
            "Dọn dẹp, set-up bàn ghế, giữ khu vực luôn sạch đẹp",
            "Hỗ trợ các hoạt động vui chơi, sự kiện cộng đồng tại quán",
        ],
        "yeucau": [
            "Từ 18 tuổi, sức khỏe tốt, nhanh nhẹn, vui vẻ",
            "KHÔNG cần kinh nghiệm – được hướng dẫn từ đầu",
            "Sinh viên đăng ký Part-time theo lịch học",
            "Thái độ cầu tiến, thân thiện với khách",
        ],
        "thang_tien": "Cơ hội thăng tiến: Phục vụ → Giám sát ca → Quản lý",
        "them": [],
        "tag": "#TuyenPhucVu #ViecLamSinhVien #ViecLamPartTime",
        "poster": {"tieu_de": "PHỤC VỤ / RUNNER", "phu": "FULL-TIME & PART-TIME · 3 KHU"},
        "ung_vien": "Sinh viên ĐH Nha Trang, CĐ Du lịch Nha Trang; người trẻ 18–28 tuổi",
        "do_kho": "Thấp – trung bình (số lượng lớn)", "muc_kho": 1,
        "kenh": ["fanpage", "fb_sinhvien", "fb_vieclam", "tiktok", "zalo", "chotot"],
        "gio": ["20:00", "09:00"],
        "cta": "Nhắn Zalo ngay để được hẹn lịch phỏng vấn – sinh viên ghi rõ ca rảnh nhé",
    },
    {
        "id": "TV", "ten": "Tạp vụ / Rửa ly", "day_du": "Tạp vụ / Rửa ly (Steward)", "en": "Steward", "icon": "🫧",
        "sl": 2, "loai": "Full-time",
        "ca": ["Full-time 9 tiếng/ngày", "Ca sáng: 06:00 – 15:00", "Ca chiều: 14:00 – 23:00"],
        "ca_ngan": "Full-time 9h: 06:00–15:00 hoặc 14:00–23:00",
        "ngan": 'Full-time 9 tiếng · không cần kinh nghiệm, có phụ cấp chuyên cần', "poster_ca": ['Ca sáng 06:00 – 15:00 · Ca chiều 14:00 – 23:00'],
        "mota": [
            "Rửa, lau khô và sắp xếp ly, tách, dụng cụ của Quầy Bar và bếp",
            "Vệ sinh khu vực chung, nhà vệ sinh, Sân vườn theo lịch",
            "Thu gom, phân loại rác đúng quy định",
            "Hỗ trợ sắp xếp kho dụng cụ, đồ dùng",
        ],
        "yeucau": [
            "Không cần kinh nghiệm, không yêu cầu bằng cấp",
            "Chăm chỉ, sạch sẽ, trung thực",
            "Sức khỏe tốt, có thể làm việc ổn định lâu dài",
        ],
        "thang_tien": "Việc làm ổn định lâu dài, có cơ hội chuyển sang Phục vụ / Pha chế nếu phù hợp",
        "them": ["Phụ cấp chuyên cần"],
        "tag": "#TuyenTapVu #ViecLamPhoThong #ViecLamNhaTrang",
        "poster": {"tieu_de": "TẠP VỤ / RỬA LY", "phu": "STEWARD · FULL-TIME · PHỤ CẤP CHUYÊN CẦN"},
        "ung_vien": "Lao động phổ thông địa phương 25–55 tuổi, ưu tiên ở gần quán",
        "do_kho": "Thấp", "muc_kho": 1,
        "kenh": ["fanpage", "fb_vieclam", "chotot", "zalo", "bangron"],
        "gio": ["06:30", "19:00"],
        "cta": "Gọi hoặc nhắn Zalo để được hẹn phỏng vấn – không cần chuẩn bị CV",
    },
    {
        "id": "BV", "ten": "Bảo vệ / Điều phối xe", "day_du": "Bảo vệ / Điều phối xe (Security)", "en": "Security", "icon": "🛡️",
        "sl": 2, "loai": "Full-time",
        "ca": ["Full-time 9 tiếng/ngày", "Ca sáng: 06:00 – 15:00", "Ca chiều: 14:00 – 23:00"],
        "ca_ngan": "Full-time 9h: 06:00–15:00 hoặc 14:00–23:00",
        "ngan": 'Full-time 9 tiếng · ưu tiên bộ đội xuất ngũ', "poster_ca": ['Ca sáng 06:00 – 15:00 · Ca chiều 14:00 – 23:00'],
        "mota": [
            "Hướng dẫn, sắp xếp xe máy, ô tô cho khách gọn gàng, an toàn",
            "Đón tiếp, hỗ trợ khách ra vào; giữ an ninh trật tự khu vực quán",
            "Bảo vệ tài sản của quán và của khách",
            "Xử lý ban đầu các tình huống về an ninh, phòng cháy chữa cháy",
            "Ghi chép, bàn giao ca đầy đủ",
        ],
        "yeucau": [
            "Sức khỏe tốt, trung thực, lịch sự, có trách nhiệm",
            "Ưu tiên bộ đội xuất ngũ, người có kinh nghiệm bảo vệ",
            "Có thể làm việc ổn định lâu dài",
        ],
        "thang_tien": "Việc làm ổn định lâu dài, được ghi nhận theo năng lực",
        "them": [],
        "tag": "#TuyenBaoVe #BoDoiXuatNgu #ViecLamNhaTrang",
        "poster": {"tieu_de": "BẢO VỆ / ĐIỀU PHỐI XE", "phu": "SECURITY · FULL-TIME · ƯU TIÊN BỘ ĐỘI XUẤT NGŨ"},
        "ung_vien": "Lao động 25–55 tuổi, bộ đội xuất ngũ, người từng làm bảo vệ",
        "do_kho": "Thấp – trung bình", "muc_kho": 1,
        "kenh": ["fanpage", "fb_vieclam", "chotot", "zalo", "cuuquannhan", "bangron"],
        "gio": ["06:30", "19:00"],
        "cta": "Gọi hoặc nhắn Zalo để được hẹn phỏng vấn – thủ tục đơn giản",
    },
]

# ---------------------------------------------------------------- kênh đăng
# ban: full = bài đầy đủ, ngan = bản ngắn, web = bản đăng web tuyển dụng
KENH = {
    "fanpage": {"ten": "Fanpage Mậu Dịch 197X", "nhom": "Facebook", "ban": "full", "phi": "Miễn phí",
                "url": "https://www.facebook.com/",
                "ghichu": "Đăng bài đầy đủ kèm poster. Ghim bài tuyển dụng mới nhất lên đầu trang."},
    "fb_vieclam": {"ten": "Group việc làm Nha Trang – Khánh Hòa", "nhom": "Facebook", "ban": "full", "phi": "Miễn phí",
                   "url": "https://www.facebook.com/search/groups/?q=vi%E1%BB%87c%20l%C3%A0m%20nha%20trang",
                   "ghichu": "Đăng 3–5 nhóm mỗi lượt, cách nhau 5–10 phút; đổi câu mở đầu giữa các nhóm để không bị đánh dấu spam."},
    "fb_sinhvien": {"ten": "Group sinh viên Nha Trang (ĐH Nha Trang, CĐ Du lịch…)", "nhom": "Facebook", "ban": "full", "phi": "Miễn phí",
                    "url": "https://www.facebook.com/search/groups/?q=vi%E1%BB%87c%20l%C3%A0m%20th%C3%AAm%20sinh%20vi%C3%AAn%20nha%20trang",
                    "ghichu": "Nhấn mạnh ca Part-time và lịch linh hoạt. Đăng buổi tối 20:00–22:00 khi sinh viên online nhiều."},
    "fb_barista": {"ten": "Cộng đồng Barista / Hội Pha chế Khánh Hòa", "nhom": "Facebook", "ban": "full", "phi": "Miễn phí",
                   "url": "https://www.facebook.com/search/groups/?q=barista%20nha%20trang",
                   "ghichu": "Kèm ảnh quầy bar, đồ uống thật nếu có. Dân pha chế quan tâm máy móc, công thức và người dẫn dắt."},
    "fb_fnb": {"ten": "Group Quản lý F&B / quán cà phê Nha Trang", "nhom": "Facebook", "ban": "full", "phi": "Miễn phí",
               "url": "https://www.facebook.com/search/groups/?q=qu%E1%BA%A3n%20l%C3%BD%20qu%C3%A1n%20cafe%20nha%20trang",
               "ghichu": "Nhóm của người làm nghề: giữ giọng chuyên nghiệp, nêu rõ quy mô 3 khu và phạm vi quyền hạn."},
    "zalo": {"ten": "Zalo: nhóm việc làm + Nhật ký Zalo", "nhom": "Zalo", "ban": "ngan", "phi": "Miễn phí",
             "url": "https://chat.zalo.me/",
             "ghichu": "Gửi bản ngắn + poster vào các nhóm Zalo việc làm; nhờ nhân viên chia sẻ lên Nhật ký Zalo cá nhân."},
    "tiktok": {"ten": "TikTok", "nhom": "Video ngắn", "ban": "ngan", "phi": "Miễn phí",
               "url": "https://www.tiktok.com/upload",
               "ghichu": "Đăng dạng ảnh/slide (poster + 2–3 ảnh quán) hoặc video 15–30 giây hậu trường; caption dùng bản ngắn."},
    "instagram": {"ten": "Instagram", "nhom": "Mạng xã hội", "ban": "ngan", "phi": "Miễn phí",
                  "url": "https://www.instagram.com/",
                  "ghichu": "Đăng poster lên feed và Story, nhắc người xem nhắn tin trực tiếp để ứng tuyển."},
    "chotot": {"ten": "Chợ Tốt Việc Làm", "nhom": "Web tuyển dụng", "ban": "web", "phi": "Miễn phí (tin cơ bản)",
               "url": "https://www.vieclamtot.com/",
               "ghichu": "Chọn ngành F&B / quán cà phê, khu vực Nha Trang. Mạnh với lao động phổ thông địa phương."},
    "topcv": {"ten": "TopCV", "nhom": "Web tuyển dụng", "ban": "web", "phi": "Miễn phí / gói trả phí",
              "url": "https://tuyendung.topcv.vn/",
              "ghichu": "Dành cho vị trí cần kinh nghiệm. Làm mới (đẩy) tin 3–4 ngày một lần để luôn ở trang đầu."},
    "vietnamworks": {"ten": "VietnamWorks", "nhom": "Web tuyển dụng", "ban": "web", "phi": "Trả phí",
                     "url": "https://employer.vietnamworks.com/",
                     "ghichu": "Tập ứng viên cấp quản lý. Chỉ dùng cho vị trí Quản lý."},
    "jobsgo": {"ten": "JobsGO", "nhom": "Web tuyển dụng", "ban": "web", "phi": "Miễn phí / gói trả phí",
               "url": "https://employer.jobsgo.vn/",
               "ghichu": "Nhiều ứng viên ngành dịch vụ, F&B; có gợi ý hồ sơ phù hợp."},
    "linkedin": {"ten": "LinkedIn", "nhom": "Mạng xã hội", "ban": "web", "phi": "Miễn phí",
                 "url": "https://www.linkedin.com/",
                 "ghichu": "Đăng bài trên trang cá nhân của Ban Giám đốc / Quản lý hiện tại để tiếp cận người làm nghề."},
    "noibo": {"ten": "Giới thiệu nội bộ", "nhom": "Nội bộ", "ban": "ngan", "phi": "Miễn phí",
              "url": "",
              "ghichu": "Gửi bản ngắn vào nhóm Zalo nội bộ, nhờ nhân viên, đối tác giới thiệu người quen."},
    "cuuquannhan": {"ten": "Nhóm bộ đội xuất ngũ / Cựu chiến binh Khánh Hòa", "nhom": "Facebook", "ban": "ngan", "phi": "Miễn phí",
                    "url": "https://www.facebook.com/search/groups/?q=b%E1%BB%99%20%C4%91%E1%BB%99i%20xu%E1%BA%A5t%20ng%C5%A9%20kh%C3%A1nh%20h%C3%B2a",
                    "ghichu": "Giọng văn trân trọng, nhấn mạnh việc ổn định, lâu dài."},
    "bangron": {"ten": "Băng rôn / poster tại quán", "nhom": "Tại quán", "ban": "ngan", "phi": "Chi phí in",
                "url": "",
                "ghichu": "Làm một lần: in poster khổ A3 dán ở quầy thu ngân và cổng, ghi số Zalo thật to."},
    "google": {"ten": "Google Maps (Google Business Profile)", "nhom": "Google", "ban": "ngan", "phi": "Miễn phí",
               "url": "https://business.google.com/",
               "ghichu": "Đăng mục Cập nhật kèm poster: người xem quán trên Google Maps sẽ thấy tin tuyển dụng."},
}

# ---------------------------------------------------------------- tuần
TUAN = [
    {"so": 1, "ten": "Ra mắt chiến dịch", "muc_tieu": "Giới thiệu Mậu Dịch 197X và đội ngũ đang tìm. Ưu tiên vị trí dẫn dắt (Quản lý, Giám sát, Trưởng quầy) vì cần thời gian tuyển lâu nhất và cần có mặt sớm để đào tạo nhân viên."},
    {"so": 2, "ten": "Cận cảnh công việc", "muc_tieu": "Cho ứng viên thấy một ngày làm việc thật, giờ giấc và con đường phát triển. Nhắc lại Pha chế 2 lần vì cần 8 người."},
    {"so": 3, "ten": "Vì sao chọn Mậu Dịch", "muc_tieu": "Gỡ băn khoăn bằng hỏi – đáp, lộ trình thăng tiến và quyền lợi. Mỗi vị trí đã xuất hiện ít nhất 2 lần."},
    {"so": 4, "ten": "Tuyển gấp – chốt đội hình", "muc_tieu": "Tạo động lực ứng tuyển ngay. Rút gọn bài, nhấn mạnh cách ứng tuyển đơn giản. Phục vụ đăng 2 lần vì cần 10 người."},
]

# ---------------------------------------------------------------- 28 bài
# d: ngày (1 = Thứ Hai tuần 1) · vt: mã vị trí · e: biểu tượng · ct: công thức content
# t: góc bài (hiện trên lịch) · tg: dòng phụ trên poster · h: câu mở cho bản ngắn
# c: nội dung · p: mô tả cảnh cho câu lệnh tạo ảnh · gio: giờ đăng (chính, nhắc lại)
BAI = []


def bai(**kw):
    BAI.append(kw)


# ============================== TUẦN 1 ==============================
bai(d=1, vt="QL", e="🧭", ct="AIDA", t="Tìm người dẫn dắt Mậu Dịch 197X",
    tg="Tìm người dẫn dắt Mậu Dịch 197X",
    h="🧭 Mậu Dịch 197X tìm 01 Quản lý quán cà phê tại Nha Trang",
    c="""🧭 MẬU DỊCH 197X TUYỂN DỤNG QUẢN LÝ QUÁN CÀ PHÊ

Một ly cà phê ngon giữ chân khách một buổi sáng.
Một người quản lý giỏi giữ chân khách… nhiều năm. ☕

🏡 Mậu Dịch 197X là không gian Cà phê • Ẩm thực • Vui chơi • Cộng đồng mang cảm hứng hoài niệm 197X giữa lòng Nha Trang. Quán vận hành theo 3 khu: Khối A – Khối B – Sân vườn, xoay quanh Quầy Bar Trung Tâm.

Chúng tôi đang tìm 01 QUẢN LÝ QUÁN đủ tâm, đủ tầm để cùng Ban Giám đốc đưa Mậu Dịch 197X trở thành điểm hẹn quen thuộc của người Nha Trang và du khách.

📌 VỊ TRÍ: Quản lý quán cà phê – Số lượng: 01 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

🌟 Nếu bạn từng mong có một "sân khấu" đủ lớn để thể hiện năng lực quản lý, đây chính là lúc!

{KHAC}

{LIENHE}

{TAG}""",
    p="A confident Vietnamese café manager in their early thirties, wearing a neat army-green apron over a cream shirt, standing in the middle of a spacious retro café at golden hour and calmly briefing two staff members; behind them a long central wooden bar with enamel mugs and aluminum phin coffee filters, a lush garden seating area visible through wide open doors")

bai(d=2, vt="PC", e="☕", ct="PAS", t="Pha giỏi nhưng chưa có quầy bar xứng tầm?",
    tg="Quầy bar xứng tầm tay nghề của bạn",
    h="☕ Tuyển 08 Pha chế (Barista) Full-time & Part-time tại Mậu Dịch 197X – Nha Trang",
    c="""☕ TUYỂN 08 PHA CHẾ (BARISTA) – FULL-TIME & PART-TIME

Bạn có đang gặp những điều này? 👇
😩 Ngày nào cũng chỉ pha quanh quẩn vài món quen
😩 Muốn học thêm nghề nhưng quầy bar chỗ cũ quá nhỏ, ít người chỉ dạy
😩 Đi làm thêm mà ca giờ cứng nhắc, khó sắp xếp lịch học

Tay nghề không được mài giũa mỗi ngày sẽ đứng yên. Và đam mê cũng nguội dần như ly cà phê để quên. 😔

👉 Đã đến lúc "đổi gió" tại QUẦY BAR TRUNG TÂM của Mậu Dịch 197X – nơi phục vụ cùng lúc 3 khu Khối A, Khối B và Sân vườn. Mỗi ca là một nhịp làm việc sôi động, mỗi ngày là một cơ hội học thêm điều mới.

📌 VỊ TRÍ: Pha chế (Barista) – Số lượng: 08 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Close-up of a young Vietnamese barista's hands pouring hot water into a traditional aluminum phin coffee filter on a dark wooden bar, gentle steam rising, enamel cups and glass jars of roasted coffee beans around, a second barista pulling an espresso shot in the soft-focus background")

bai(d=3, vt="GS", e="🎯", ct="4P (Hình dung – Hứa hẹn – Chứng minh – Thúc đẩy)", t="Người giữ nhịp cho mỗi ca làm",
    tg="Người giữ nhịp cho mỗi ca làm",
    h="🎯 Mậu Dịch 197X tuyển 02 Giám sát ca (Shift Leader) – Nha Trang",
    c="""🎯 TUYỂN 02 GIÁM SÁT CA (SHIFT LEADER)

🌆 Hãy hình dung…
19:30 tối thứ Bảy. Sân vườn kín bàn, Quầy Bar Trung Tâm liên tục ra món, khách ở Khối A vừa gọi thêm, nhóm bạn ở Khối B đang chờ thanh toán.
Giữa nhịp sôi động ấy, có một người bình tĩnh điều phối, để mọi thứ trôi chảy và mọi vị khách đều mỉm cười ra về.

👉 Người đó có thể là BẠN.

🤝 Tại Mậu Dịch 197X, Giám sát ca là "nhạc trưởng" của mỗi ca làm: được giao quyền, được Quản lý đồng hành và có cơ hội tiến lên vị trí Quản lý.

📌 VỊ TRÍ: Giám sát ca – Số lượng: 02 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="A composed Vietnamese shift leader holding a tablet, standing in a busy but orderly retro café garden at dusk under warm string lights, staff in army-green aprons moving between wooden tables, guests chatting happily, the central bar glowing softly in the background")

bai(d=4, vt="TN", e="💳", ct="FAB (Đặc điểm – Ưu điểm – Lợi ích)", t="Nụ cười đầu tiên, lời cảm ơn cuối cùng",
    tg="Nụ cười đầu tiên khách nhận được",
    h="💳 Tuyển 02 Thu ngân / Điều phối Bar tại Mậu Dịch 197X – Nha Trang",
    c="""💳 TUYỂN 02 THU NGÂN / ĐIỀU PHỐI BAR (CASHIER)

Khách bước vào: bạn là nụ cười đầu tiên. 😊
Khách ra về: bạn là lời cảm ơn cuối cùng. 🙏
Ở Mậu Dịch 197X, Thu ngân không chỉ tính tiền mà còn là người giữ nhịp giữa khách, Quầy Bar và bếp.

💡 VÌ SAO VỊ TRÍ NÀY ĐÁNG ĐỂ BẠN THỬ?
🔹 Ca làm rõ ràng: sáng 06:30 – 14:30 hoặc chiều 14:00 – 22:00 → dễ sắp xếp cuộc sống
🔹 Làm việc trên phần mềm bán hàng (POS) → thao tác nhanh, chính xác
🔹 Vừa thu ngân vừa điều phối Bar → hiểu vận hành, tích lũy kinh nghiệm để lên Giám sát ca

📌 VỊ TRÍ: Thu ngân / Điều phối Bar – Số lượng: 02 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="A friendly Vietnamese cashier smiling at a guest while handing back a receipt at a vintage dark-wood cashier counter with a modern tablet POS, a few coffee cups and a small potted plant on the counter, warm morning light, softly blurred retro café behind")

bai(d=5, vt="TQ", e="✉️", ct="Thư mời (Storytelling)", t="Thư mời người giữ lửa Quầy Bar Trung Tâm",
    tg="Thư mời người giữ lửa quầy bar",
    h="✉️ Mậu Dịch 197X tìm 01 Trưởng quầy Pha chế (Head Barista) – Nha Trang",
    c="""✉️ THƯ MỜI GỬI MỘT NGƯỜI TRƯỞNG QUẦY PHA CHẾ

Gửi bạn, người đã quen mùi cà phê từ lúc 6 giờ sáng,

Chúng tôi biết bạn là ai.
Là người nhìn lớp crema là biết shot espresso đạt hay chưa.
Là người chỉ cho đồng nghiệp mới cách chỉnh cối xay chỉ sau một ly thử.
Là người vẫn ghi công thức mới vào cuốn sổ nhỏ sau mỗi ca làm. 📒

Mậu Dịch 197X có một Quầy Bar Trung Tâm phục vụ cả 3 khu Khối A, Khối B và Sân vườn. Quầy bar ấy đang chờ một người giữ lửa: dẫn dắt đội Barista, chuẩn hóa từng công thức và cùng chúng tôi tạo nên những ly đồ uống mang dấu ấn 197X. 🔥

📌 VỊ TRÍ: Trưởng quầy Pha chế (Head Barista) – Số lượng: 01 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

Nếu đọc đến đây bạn mỉm cười vì "đúng là mình rồi", hãy hồi âm cho chúng tôi nhé! 💌

{KHAC}

{LIENHE}

{TAG}""",
    p="A skilled Vietnamese head barista in an army-green apron carefully inspecting the crema of an espresso shot in a small enamel cup, standing behind a central wooden bar with a classic espresso machine, an open notebook with handwritten sketches beside it, moody warm lighting")

bai(d=6, vt="PV", e="🙋", ct="Checklist “Bạn phù hợp nếu…”", t="Bạn có phải mảnh ghép tiếp theo?",
    tg="Bạn có phải mảnh ghép tiếp theo?",
    h="🙋 Tuyển 10 Phục vụ / Runner Full-time & Part-time – không cần kinh nghiệm",
    c="""🙋 MẬU DỊCH 197X TUYỂN 10 PHỤC VỤ / RUNNER – NHẬN CẢ PART-TIME CHO SINH VIÊN

Thử đánh dấu xem bạn "khớp" bao nhiêu điều nhé 👇

☑️ Bạn là sinh viên muốn có thêm thu nhập mà không ảnh hưởng lịch học
☑️ Bạn thích gặp gỡ, trò chuyện và mang niềm vui đến cho người khác
☑️ Bạn nhanh nhẹn, không ngại vận động
☑️ Bạn muốn có kinh nghiệm thực tế trong ngành F&B – du lịch
☑️ Bạn thích làm việc trong một tập thể trẻ, vui vẻ

✨ Khớp từ 3 điều trở lên? Bạn chính là mảnh ghép mà Mậu Dịch 197X đang tìm!

📌 VỊ TRÍ: Phục vụ / Runner – Số lượng: 10 người (nhận cả Full-time và Part-time)

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Two cheerful young Vietnamese servers in army-green aprons carrying trays of iced coffee and snacks through the lush garden seating area of a retro café on a sunny weekend morning, rattan chairs, dark wooden tables, potted tropical plants, laughing naturally")

bai(d=7, vt="BV", e="🛡️", ct="Hook – Story – Offer", t="Người đầu tiên chào đón mỗi vị khách",
    tg="Người đầu tiên chào đón mỗi vị khách",
    h="🛡️ Tuyển 02 Bảo vệ / Điều phối xe – ưu tiên bộ đội xuất ngũ",
    c="""🛡️ TUYỂN 02 BẢO VỆ / ĐIỀU PHỐI XE – ƯU TIÊN BỘ ĐỘI XUẤT NGŨ

Ở Mậu Dịch 197X, người đầu tiên chào đón khách không phải nhân viên phục vụ, mà là người bảo vệ đứng ở cổng. 🙂

Một cái gật đầu chào, một lần dắt xe giúp, một lời nhắc "Anh chị để xe bên này cho tiện ạ". Những điều nhỏ ấy làm nên ấn tượng đầu tiên trọn vẹn. Và khi khách ra về, chiếc xe đã được xếp gọn, sẵn sàng lăn bánh.

Chúng tôi trân trọng những người làm công việc thầm lặng này và đang tìm thêm 02 đồng đội có tác phong chuẩn mực, trung thực, tận tâm. Đặc biệt ưu tiên các bạn bộ đội xuất ngũ, những người mang theo kỷ luật và sự tận tụy của người lính. 🎖️

📌 VỊ TRÍ: Bảo vệ / Điều phối xe – Số lượng: 02 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="A polite Vietnamese security staff member in a neat dark-green uniform guiding a motorbike into a tidy parking row in front of a retro café entrance framed by tropical plants, warm evening lights, guests arriving, Nha Trang street softly blurred")

# ============================== TUẦN 2 ==============================
bai(d=8, vt="PC", e="⏱️", ct="Một ngày làm việc (Day-in-the-life)", t="Một ngày làm Barista tại Mậu Dịch 197X",
    tg="Một ngày làm Barista ở Mậu Dịch",
    h="⏱️ Một ngày làm Barista ở Mậu Dịch 197X – đang tuyển 08 Pha chế",
    c="""⏱️ MỘT NGÀY LÀM BARISTA TẠI MẬU DỊCH 197X SẼ NHƯ THẾ NÀO?

🕕 06:00 – Mở quầy. Mùi cà phê mới xay lan khắp Quầy Bar Trung Tâm. Kiểm tra máy, chuẩn bị nguyên liệu cho ngày mới.
🕖 07:00 – Cao điểm sáng. Phin nối phin, ly nối ly, khách quen ghé uống cà phê trước giờ làm.
🕙 10:00 – Nhịp chậm lại. Lau quầy, bổ sung nguyên liệu, thử công thức mới cùng Trưởng quầy.
🕑 14:00 – Ca chiều vào ca, cùng nhau bàn giao gọn gàng.
🕔 17:00 – Sân vườn lên đèn, các bạn Part-time ca tối nhập cuộc.
🕚 23:00 – Khép lại ngày bằng một quầy bar sạch bong và cảm giác "hôm nay mình làm tốt lắm". 💪

Nghe có vẻ bận rộn? Đúng vậy! Đó là nhịp làm việc của người làm nghề thật sự, nơi tay nghề của bạn được mài giũa mỗi ngày. ☕

📌 VỊ TRÍ: Pha chế (Barista) – Số lượng: 08 người

{CA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Early morning inside a retro Vietnamese café: a young barista opening the central wooden bar and grinding coffee beans, soft sunrise light streaming through wooden shutters, rows of enamel cups and phin filters neatly arranged, calm and fresh atmosphere")

bai(d=9, vt="TV", e="✨", ct="Không cần – Chỉ cần", t="Không cần kinh nghiệm, chỉ cần chăm chỉ",
    tg="Không cần kinh nghiệm – chỉ cần chăm chỉ",
    h="✨ Tuyển 02 Tạp vụ / Rửa ly – không cần kinh nghiệm, có phụ cấp chuyên cần",
    c="""✨ TUYỂN 02 TẠP VỤ / RỬA LY (STEWARD) – VIỆC LÀM ỔN ĐỊNH, LÂU DÀI

❌ KHÔNG CẦN kinh nghiệm
❌ KHÔNG CẦN bằng cấp
❌ KHÔNG quan trọng trước đây bạn làm nghề gì

✅ CHỈ CẦN chăm chỉ
✅ CHỈ CẦN sạch sẽ, gọn gàng
✅ CHỈ CẦN trung thực và muốn làm việc lâu dài

Mỗi chiếc ly sáng bóng trên Quầy Bar, mỗi góc Sân vườn sạch tinh tươm ở Mậu Dịch 197X đều có công của đội Tạp vụ. Chúng tôi trân trọng công việc này và mong được chào đón thêm 02 cô chú, anh chị, các bạn đến làm việc cùng. 🤝

📌 VỊ TRÍ: Tạp vụ / Rửa ly – Số lượng: 02 người

{CA}

{MOTA}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="A tidy behind-the-scenes dish station of a retro café: a friendly middle-aged Vietnamese steward in an army-green apron polishing sparkling glasses, neat racks of clean enamel cups and glassware, clean stainless counters, warm soft light")

bai(d=10, vt="QL", e="🏆", ct="5 lý do (Listicle – Giá trị nhà tuyển dụng)", t="5 lý do người quản lý giỏi chọn Mậu Dịch 197X",
    tg="5 lý do để bạn dẫn dắt Mậu Dịch",
    h="🏆 Mậu Dịch 197X tuyển 01 Quản lý quán cà phê – 5 lý do bạn nên ứng tuyển",
    c="""🏆 5 LÝ DO NGƯỜI QUẢN LÝ GIỎI NÊN CHỌN MẬU DỊCH 197X

1️⃣ MÔ HÌNH ĐA TRẢI NGHIỆM
Cà phê • Ẩm thực • Vui chơi • Cộng đồng trong cùng một không gian, môi trường để bạn phát huy toàn diện năng lực quản lý.

2️⃣ VẬN HÀNH THEO PHÂN KHU RÕ RÀNG
3 khu Khối A, Khối B, Sân vườn xoay quanh Quầy Bar Trung Tâm, định biên nhân sự cụ thể cho từng bộ phận.

3️⃣ ĐƯỢC TRAO QUYỀN THỰC SỰ
Bạn trực tiếp xây dựng đội ngũ, đào tạo và định hình văn hóa phục vụ của quán.

4️⃣ GIỜ LÀM CÓ KHOẢNG NGHỈ
Ca gãy 06:00 – 11:00 và 18:00 – 22:00, có khoảng nghỉ giữa ngày để tái tạo năng lượng.

5️⃣ GẮN BÓ LÂU DÀI
Đồng hành cùng thương hiệu Mậu Dịch 197X, được ghi nhận theo hiệu quả công việc.

📌 VỊ TRÍ: Quản lý quán cà phê – Số lượng: 01 người

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Wide shot of an elegant multi-zone retro café at early evening: an indoor wooden seating hall on one side, an open garden with string lights on the other, a long central bar in the middle, a Vietnamese manager in smart casual attire reviewing a clipboard, warm cinematic lighting")

bai(d=11, vt="PV", e="📢", ct="Loa phường 197X (5W1H)", t="Loa phường Mậu Dịch thông báo tuyển Phục vụ",
    tg="Loa phường Mậu Dịch xin thông báo",
    h="📢 Loa phường Mậu Dịch thông báo: tuyển 10 Phục vụ / Runner, nhận sinh viên Part-time",
    c="""📢📢 A LÔ A LÔ… LOA PHƯỜNG MẬU DỊCH 197X XIN THÔNG BÁO! 📢📢

Kính thưa bà con cô bác và các bạn trẻ Nha Trang,
Cửa hàng Mậu Dịch 197X hiện đang cần 10 đồng chí PHỤC VỤ / RUNNER để phục vụ bà con tại 3 khu: Khối A, Khối B và Sân vườn. 😄

📝 THÔNG TIN CHI TIẾT NHƯ SAU:

👤 AI ỨNG TUYỂN ĐƯỢC? Các bạn từ 18 tuổi, không cần kinh nghiệm, sinh viên đăng ký Part-time thoải mái.
🏠 LÀM Ở ĐÂU? 33-37 Dã Tượng, Phường Nha Trang.
🕰️ LÀM KHI NÀO? Full-time 9 tiếng hoặc Part-time 5 tiếng, chọn ca phù hợp.
🍽️ LÀM GÌ? Đón khách, order, chạy món, giữ bàn ghế sạch đẹp và mang lại nụ cười cho khách.
🎁 ĐƯỢC GÌ? Lương & phúc lợi theo Luật Lao động, hỗ trợ suất ăn, thưởng lễ Tết, cơ hội thăng tiến. Mức cụ thể trao đổi khi phỏng vấn.

{CA}

📢 Thông báo đến đây là hết. Bà con có con em, bạn bè đang tìm việc thì nhắn giúp Mậu Dịch một tiếng nhé! 🙏

{KHAC}

{LIENHE}

{TAG}""",
    p="Playful nostalgic scene: a vintage 1970s horn loudspeaker mounted on a wooden pole among tropical leaves in front of a charming retro café garden, young Vietnamese servers in army-green aprons waving cheerfully below, bright morning sky, nostalgic film photo look")

bai(d=12, vt="GS", e="🚀", ct="BAB (Trước – Sau – Cầu nối)", t="Từ nhân viên giỏi đến người dẫn dắt",
    tg="Từ nhân viên giỏi đến người dẫn dắt",
    h="🚀 Tuyển 02 Giám sát ca – bước tiếp theo trong sự nghiệp F&B của bạn",
    c="""🚀 BẠN ĐÃ SẴN SÀNG CHO BƯỚC TIẾP THEO TRONG NGHỀ F&B?

⏪ TRƯỚC ĐÂY…
Bạn làm phục vụ, pha chế, thu ngân đã vài năm. Bạn thuộc lòng quy trình, xử lý khách khó tính rất khéo, đồng nghiệp mới hay hỏi bạn hơn hỏi quản lý. Nhưng chức danh của bạn vẫn vậy. 🤷

⏩ SAU NÀY…
Bạn là GIÁM SÁT CA. Bạn phân công đội ngũ, điều phối cả 3 khu, được ghi nhận bằng vị trí và trách nhiệm xứng tầm, và thấy rõ con đường tiến lên Quản lý.

🌉 CẦU NỐI CHÍNH LÀ…
Vị trí Giám sát ca tại Mậu Dịch 197X, nơi kinh nghiệm thực chiến của bạn được trao quyền và tin tưởng.

📌 VỊ TRÍ: Giám sát ca (Shift Leader) – Số lượng: 02 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Editorial portrait of a confident young Vietnamese shift leader in a crisp cream shirt and army-green apron, arms crossed with a warm smile, standing in front of a softly blurred retro café where staff are working, golden afternoon light")

bai(d=13, vt="TN", e="💬", ct="Hỏi nhanh – Đáp gọn (FAQ)", t="Hỏi nhanh – đáp gọn về vị trí Thu ngân",
    tg="Hỏi nhanh – đáp gọn về Thu ngân",
    h="💬 Tuyển 02 Thu ngân / Điều phối Bar – chưa có kinh nghiệm vẫn được hướng dẫn",
    c="""💬 HỎI NHANH – ĐÁP GỌN: VỊ TRÍ THU NGÂN / ĐIỀU PHỐI BAR TẠI MẬU DỊCH 197X

❓ Chưa từng làm thu ngân, có được nhận không?
👉 Được! Ưu tiên người có kinh nghiệm, nhưng nếu bạn cẩn thận, trung thực và nhanh nhẹn, bạn sẽ được hướng dẫn từ đầu.

❓ Làm ca nào, mấy giờ?
👉 Full-time, chọn ca sáng 06:30 – 14:30 hoặc ca chiều 14:00 – 22:00.

❓ "Điều phối Bar" là làm gì?
👉 Sau khi nhận order, bạn chuyển phiếu đến Quầy Bar và bếp đúng thứ tự, đúng bàn, giúp món ra nhanh và không nhầm lẫn.

❓ Có cần giỏi máy tính không?
👉 Chỉ cần dùng được máy tính, điện thoại cơ bản. Phần mềm bán hàng sẽ được hướng dẫn khi nhận việc.

❓ Lương thưởng thế nào?
👉 Lương và phúc lợi theo Luật Lao động, hỗ trợ suất ăn, thưởng lễ Tết, cơ hội lên Giám sát ca. Mức cụ thể trao đổi trực tiếp khi phỏng vấn.

❓ Ứng tuyển bằng cách nào?
👉 Nhắn Zalo hoặc gửi email theo thông tin bên dưới, chỉ mất 1 phút! ⏱️

📌 VỊ TRÍ: Thu ngân / Điều phối Bar – Số lượng: 02 người

{MOTA}

{KHAC}

{LIENHE}

{TAG}""",
    p="A young Vietnamese cashier at a tidy retro wooden counter smiling while explaining something to a curious guest, tablet POS and a small potted plant on the counter, warm daylight, enamel cups softly blurred in the background")

bai(d=14, vt="PC", e="🎓", ct="Hook – Giá trị – Kêu gọi", t="Part-time 5 tiếng: vừa học vừa làm nghề",
    tg="Vừa học vừa làm nghề pha chế",
    h="🎓 Part-time Pha chế 5 tiếng/ca cho sinh viên Nha Trang – Mậu Dịch 197X",
    c="""🎓 SINH VIÊN NHA TRANG ƠI: VỪA HỌC VỪA "LÀM NGHỀ" PHA CHẾ, SAO KHÔNG?

Mậu Dịch 197X đang mở các ca PART-TIME 5 TIẾNG cho vị trí Pha chế (Barista):
🌅 Ca sáng 06:00 – 11:00
🌙 Ca tối 17:00 – 22:00

🎁 BẠN NHẬN ĐƯỢC GÌ?
⭐ Một nghề trong tay: được hướng dẫn pha cà phê, trà, đá xay… từ cơ bản
⭐ Lịch làm theo ca, dễ xếp cùng thời khóa biểu
⭐ Kinh nghiệm thực tế tại mô hình Cà phê • Ẩm thực • Vui chơi • Cộng đồng, điểm cộng lớn cho CV sau này
⭐ Tập thể trẻ, năng động, nhiều hoạt động cộng đồng

💼 Muốn làm Full-time 9 tiếng? Cũng được luôn!

📌 VỊ TRÍ: Pha chế (Barista) – Số lượng: 08 người (Full-time & Part-time)

{CA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Two young Vietnamese university students working as part-time baristas, one shaking iced tea in a cocktail shaker and the other smiling while finishing a drink, behind a retro wooden bar in soft evening light, a backpack resting on a shelf in the background")

# ============================== TUẦN 3 ==============================
bai(d=15, vt="TQ", e="🔥", ct="PAS (Vấn đề – Khoét sâu – Giải pháp)", t="Tay nghề vững, đã đến lúc có sân khấu riêng",
    tg="Sân khấu riêng cho tay nghề của bạn",
    h="🔥 Mậu Dịch 197X tuyển 01 Trưởng quầy Pha chế – cùng xây dựng menu signature 197X",
    c="""🔥 TUYỂN 01 TRƯỞNG QUẦY PHA CHẾ (HEAD BARISTA)

Bạn đã pha hàng nghìn ly cà phê.
Bạn có những công thức riêng nằm trong đầu từ lâu.
Nhưng menu vẫn là của người khác, và ý tưởng của bạn chưa có cơ hội lên ly. 😕

Càng giỏi nghề, cảm giác "chưa được là mình" càng rõ. Đam mê dễ nguội dần nếu không có nơi để thử sức, để dẫn dắt và được ghi nhận.

✅ Tại Mậu Dịch 197X, Trưởng quầy Pha chế là người:
▪️ Cầm trịch Quầy Bar Trung Tâm phục vụ cả 3 khu
▪️ Chuẩn hóa công thức và phát triển dòng đồ uống mang dấu ấn 197X
▪️ Dẫn dắt, đào tạo đội ngũ 08 Barista

Đây là sân khấu dành cho tay nghề của bạn. 🎭

📌 VỊ TRÍ: Trưởng quầy Pha chế – Số lượng: 01 người

{CA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Artistic close-up of a Vietnamese head barista finishing a signature layered coconut coffee in a tall glass on a dark wood bar with vintage brass details and enamel ware, careful garnish, dramatic warm side lighting")

bai(d=16, vt="BV", e="🎖️", ct="Checklist “Vị trí này dành cho bạn nếu…”", t="Việc ổn định cho người trọng kỷ luật",
    tg="Ổn định – kỷ luật – tận tâm",
    h="🎖️ Tuyển 02 Bảo vệ / Điều phối xe Full-time – ưu tiên bộ đội xuất ngũ",
    c="""🎖️ TUYỂN 02 BẢO VỆ / ĐIỀU PHỐI XE – CÔNG VIỆC ỔN ĐỊNH, LÂU DÀI

Vị trí này dành cho bạn nếu:
✔️ Bạn là bộ đội xuất ngũ hoặc từng làm bảo vệ, muốn tìm việc ổn định tại Nha Trang
✔️ Bạn có sức khỏe tốt, tác phong nghiêm túc, đúng giờ
✔️ Bạn trung thực, lịch sự, cư xử nhã nhặn với khách
✔️ Bạn muốn ca làm rõ ràng, thu nhập đều đặn, chế độ đầy đủ

🏡 Mậu Dịch 197X là không gian Cà phê • Ẩm thực • Vui chơi • Cộng đồng đón khách từ sáng sớm đến tối muộn. Đội Bảo vệ – Điều phối xe giúp mọi vị khách an tâm từ lúc gửi xe đến khi ra về.

📌 VỊ TRÍ: Bảo vệ / Điều phối xe – Số lượng: 02 người

{CA}

{MOTA}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="A Vietnamese security staff member in a dark-green uniform standing attentively at the entrance gate of a retro café at night, warm lantern light, neatly parked motorbikes, welcoming posture, calm and professional atmosphere")

bai(d=17, vt="PV", e="📈", ct="Lộ trình thăng tiến", t="Hôm nay Phục vụ, mai là Giám sát ca",
    tg="Hôm nay Phục vụ – mai là Giám sát",
    h="📈 Tuyển 10 Phục vụ / Runner – có lộ trình lên Giám sát ca",
    c="""📈 HÔM NAY LÀ PHỤC VỤ – NGÀY MAI CÓ THỂ LÀ GIÁM SÁT CA

Nhiều người nghĩ phục vụ chỉ là việc "làm tạm". Ở Mậu Dịch 197X, đây có thể là bước khởi đầu cho sự nghiệp F&B của bạn. 🌱

🪜 LỘ TRÌNH PHÁT TRIỂN
1️⃣ PHỤC VỤ / RUNNER: nắm vững quy trình đón khách, order, chạy món tại 3 khu
⬇️
2️⃣ NHÂN VIÊN NÒNG CỐT: kèm cặp bạn mới, xử lý tình huống với khách
⬇️
3️⃣ GIÁM SÁT CA: điều phối cả một ca làm việc
⬇️
4️⃣ QUẢN LÝ: dẫn dắt toàn bộ vận hành

💡 Cơ hội thăng tiến được xét theo năng lực và thái độ làm việc.

📌 VỊ TRÍ: Phục vụ / Runner – Số lượng: 10 người (Full-time & Part-time)

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="A young Vietnamese server in an army-green apron confidently carrying a tray with three drinks mid-stride through a bright retro café hall, a senior colleague nodding approvingly in the background, sense of motion and growth, warm natural light")

bai(d=18, vt="TV", e="🫧", ct="Storytelling (Người hùng thầm lặng)", t="Những người hùng thầm lặng sau quầy bar",
    tg="Người hùng thầm lặng sau quầy bar",
    h="🫧 Tuyển 02 Tạp vụ / Rửa ly – việc ổn định, có phụ cấp chuyên cần",
    c="""🫧 NHỮNG NGƯỜI HÙNG THẦM LẶNG SAU QUẦY BAR

Có những người khách hiếm khi nhìn thấy.
Nhưng nếu thiếu họ, chẳng ly cà phê nào được phục vụ trong một chiếc ly sáng bóng. ✨

Họ đến từ sáng sớm, khi Sân vườn còn đọng sương.
Họ lặng lẽ rửa từng chiếc ly, lau từng góc bàn, giữ từng khu vực luôn sạch thơm.
Họ là đội Tạp vụ – Rửa ly, và ở Mậu Dịch 197X, họ được trân trọng như mọi thành viên khác. 💚

Chúng tôi đang tìm thêm 02 người đồng hành như thế. Không cần kinh nghiệm, chỉ cần chăm chỉ và tận tâm.

📌 VỊ TRÍ: Tạp vụ / Rửa ly (Steward) – Số lượng: 02 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Soft early-morning scene in a retro café garden with dew on tropical leaves, a Vietnamese steward in an army-green apron carefully wiping a dark wooden table, a tray of sparkling clean glassware nearby, gentle golden sunrise light, calm and dignified mood")

bai(d=19, vt="PC", e="❓", ct="Hỏi – Đáp (FAQ)", t="Chưa biết pha chế có được nhận không?",
    tg="Chưa biết pha chế? Vẫn được nhận!",
    h="❓ Chưa biết pha chế vẫn ứng tuyển được – Mậu Dịch 197X tuyển 08 Barista",
    c="""❓ CHƯA BIẾT PHA CHẾ, CÓ ĐƯỢC NHẬN KHÔNG? MẬU DỊCH 197X GIẢI ĐÁP

🙋 "Mình chưa từng đứng quầy bar, có cơ hội không?"
👉 Có! Ưu tiên người có kinh nghiệm, nhưng bạn sẽ được hướng dẫn từ những bước cơ bản: pha phin, đánh sữa, định lượng, vệ sinh quầy.

🙋 "Mình là sinh viên, chỉ rảnh buổi sáng hoặc buổi tối?"
👉 Có ca Part-time 5 tiếng: 06:00 – 11:00 hoặc 17:00 – 22:00.

🙋 "Làm Full-time thì ca thế nào?"
👉 9 tiếng/ngày: ca sáng 06:00 – 15:00 hoặc ca chiều 14:00 – 23:00.

🙋 "Có cơ hội phát triển lên cao hơn không?"
👉 Có cơ hội thăng tiến lên Trưởng quầy pha chế cho người có năng lực.

🙋 "Lương thưởng ra sao?"
👉 Lương và phúc lợi theo Luật Lao động, hỗ trợ suất ăn, thưởng lễ Tết. Mức cụ thể trao đổi trực tiếp khi phỏng vấn.

📌 VỊ TRÍ: Pha chế (Barista) – Số lượng: 08 người

{MOTA}

{YEUCAU}

{KHAC}

{LIENHE}

{TAG}""",
    p="A friendly senior Vietnamese barista teaching a beginner how to steam milk at a retro café bar, both smiling, milk pitcher and espresso machine in focus, warm encouraging atmosphere, shallow depth of field")

bai(d=20, vt="QL", e="🧩", ct="Thử thách – Cơ hội", t="3 bài toán dành cho người Quản lý tiếp theo",
    tg="3 bài toán cho người Quản lý mới",
    h="🧩 Mậu Dịch 197X tuyển 01 Quản lý quán cà phê – bạn sẵn sàng cho 3 thử thách này?",
    c="""🧩 3 BÀI TOÁN DÀNH CHO NGƯỜI QUẢN LÝ TIẾP THEO CỦA MẬU DỊCH 197X

Chúng tôi không tìm một người "giữ ghế". Chúng tôi tìm người thích giải bài toán khó. 💡

🔹 BÀI TOÁN 1: BA KHU – MỘT TIÊU CHUẨN
Khối A, Khối B và Sân vườn, mỗi khu một nhịp, một kiểu khách. Làm sao để trải nghiệm ở đâu cũng đồng đều và trọn vẹn?

🔹 BÀI TOÁN 2: MỘT ĐỘI NGŨ – NHIỀU THẾ HỆ
Từ sinh viên Part-time đến bộ đội xuất ngũ, từ Barista trẻ đến cô chú Tạp vụ. Làm sao để tất cả trở thành MỘT đội?

🔹 BÀI TOÁN 3: KHÔNG CHỈ BÁN CÀ PHÊ
Cà phê • Ẩm thực • Vui chơi • Cộng đồng. Làm sao để Mậu Dịch 197X là nơi người ta muốn quay lại, không chỉ vì đồ uống?

🔥 Nếu bạn vừa đọc vừa bắt đầu nghĩ ra lời giải, vị trí này dành cho bạn!

📌 VỊ TRÍ: Quản lý quán cà phê – Số lượng: 01 người

{CA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Top-down still life on a dark wooden table in a retro café: an open notebook with hand-drawn floor-plan sketches, a phin coffee dripping into a glass, a pen and a small potted plant, a manager's hands planning, warm morning light, editorial style")

bai(d=21, vt="GS", e="🌙", ct="Một ca làm việc (Day-in-the-life)", t="Một ca tối của Giám sát ca",
    tg="Một ca tối cùng người giữ nhịp",
    h="🌙 Tuyển 02 Giám sát ca – cùng giữ nhịp những ca tối sôi động",
    c="""🌙 14:00 – 23:00: MỘT CA TỐI CỦA GIÁM SÁT CA TẠI MẬU DỊCH 197X

🕑 14:00 – Nhận bàn giao từ ca sáng, nắm tình hình khách, nhân sự, nguyên liệu.
🕒 15:00 – Họp nhanh 5 phút, phân khu cho từng bạn ở Khối A, Khối B, Sân vườn.
🕔 17:00 – Sân vườn lên đèn, các bạn Part-time vào ca. Bắt đầu nhịp tối!
🕢 19:30 – Cao điểm. Đi một vòng 3 khu, hỗ trợ Quầy Bar, xử lý nhanh yêu cầu của khách.
🕘 21:00 – Kiểm tra vệ sinh, chuẩn bị nguyên liệu cho ngày mai.
🕚 23:00 – Chốt ca, kiểm kê, báo cáo Quản lý. Một ngày trọn vẹn! ✅

Không phải ai cũng giữ được bình tĩnh giữa giờ cao điểm. Nếu bạn làm được, Mậu Dịch 197X đang chờ bạn. 💪

📌 VỊ TRÍ: Giám sát ca (Shift Leader) – Số lượng: 02 người

{CA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Night scene of a vibrant retro café garden full of guests under warm string lights, a Vietnamese shift leader walking between tables checking on service with a calm smile, the central bar glowing, cinematic bokeh")

# ============================== TUẦN 4 ==============================
bai(d=22, vt="PV", e="⚡", ct="Tuyển gấp (5W1H)", t="Tuyển gấp 10 Phục vụ, nhận việc ngay",
    tg="Tuyển gấp – nhận việc ngay",
    h="⚡ TUYỂN GẤP 10 Phục vụ / Runner tại Mậu Dịch 197X – nhận việc ngay",
    c="""⚡⚡ TUYỂN GẤP 10 PHỤC VỤ / RUNNER – NHẬN VIỆC NGAY ⚡⚡

📍 Mậu Dịch 197X – 33-37 Dã Tượng, Phường Nha Trang
👥 Số lượng: 10 người, nhận cả Full-time và Part-time
🎓 Không cần kinh nghiệm, sinh viên OK
⏱️ Hồ sơ được xem liên tục, ưu tiên bạn có thể đi làm sớm

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

🚀 Đừng để cơ hội trôi qua: nhắn Zalo ngay hôm nay để được hẹn lịch phỏng vấn sớm nhất!

{KHAC}

{LIENHE}

{TAG}""",
    p="Dynamic shot of energetic young Vietnamese servers in army-green aprons preparing a retro café for a busy day, arranging chairs and carrying trays, morning light streaming in, sense of urgency and teamwork, slight motion blur")

bai(d=23, vt="TN", e="⏳", ct="Câu hỏi gợi mở + Khẩn trương", t="Ưu tiên ứng viên nhận việc sớm",
    tg="Ưu tiên ứng viên nhận việc sớm",
    h="⏳ Cần gấp 02 Thu ngân / Điều phối Bar – ưu tiên nhận việc sớm",
    c="""⏳ CẦN GẤP 02 THU NGÂN / ĐIỀU PHỐI BAR – ƯU TIÊN NHẬN VIỆC SỚM

Bạn cẩn thận với từng con số?
Bạn thích công việc có ca giờ rõ ràng?
Bạn muốn làm việc trong một không gian đẹp, trẻ trung giữa Nha Trang?

👉 Đây là lúc thích hợp nhất để ứng tuyển! Mậu Dịch 197X đang xét hồ sơ liên tục và ưu tiên những bạn có thể nhận việc sớm.

📌 VỊ TRÍ: Thu ngân / Điều phối Bar – Số lượng: 02 người

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="A calm, organized retro café cashier counter at opening time, a Vietnamese cashier arranging the tablet POS and receipts while coffee is being prepared behind, soft morning sunlight, clean and welcoming composition")

bai(d=24, vt="TQ", e="🔔", ct="Tổng kết giá trị + Lời mời cuối", t="Quầy Bar Trung Tâm vẫn chờ người trưởng quầy",
    tg="Quầy Bar Trung Tâm đang chờ bạn",
    h="🔔 Lời mời cuối: Mậu Dịch 197X tìm Trưởng quầy Pha chế",
    c="""🔔 QUẦY BAR TRUNG TÂM VẪN ĐANG CHỜ NGƯỜI TRƯỞNG QUẦY

Mậu Dịch 197X đã chia sẻ khá nhiều về vị trí này. Tóm gọn lại, đây là những gì đang chờ bạn 👇

☕ Một Quầy Bar Trung Tâm phục vụ cả 3 khu Khối A, Khối B và Sân vườn
👥 Một đội ngũ 08 Barista để bạn dẫn dắt và đào tạo
🧪 Không gian để sáng tạo dòng đồ uống mang dấu ấn 197X
⏰ Ca gãy 06:00 – 11:00 & 18:00 – 22:00, có thời gian nghỉ giữa ngày

Nếu bạn vẫn đang cân nhắc, cứ nhắn cho chúng tôi một tin: trò chuyện trước, quyết định sau. 😊

📌 VỊ TRÍ: Trưởng quầy Pha chế (Head Barista) – Số lượng: 01 người

{MOTA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="An empty, beautifully lit central wooden bar of a retro café waiting for its leader: a gleaming espresso machine, enamel cups lined up, a folded army-green apron placed neatly on the counter under a warm spotlight, inviting cinematic mood")

bai(d=25, vt="PC", e="🚨", ct="Tuyển gấp + 3 lý do", t="Tuyển gấp Barista, đi làm ngay",
    tg="Tuyển gấp Barista – đi làm ngay",
    h="🚨 Tuyển gấp Pha chế (Barista) Full-time & Part-time – Mậu Dịch 197X Nha Trang",
    c="""🚨 TUYỂN GẤP PHA CHẾ (BARISTA) – FULL-TIME & PART-TIME

Quầy Bar Trung Tâm của Mậu Dịch 197X cần thêm những đôi tay khéo léo! 🙌

3 LÝ DO ĐỂ BẠN NHẮN TIN NGAY HÔM NAY:
1️⃣ Ca linh hoạt: Full-time 9 tiếng hoặc Part-time 5 tiếng, phù hợp cả sinh viên
2️⃣ Học nghề thực tế: pha phin, espresso, trà, đá xay… ngay tại quầy
3️⃣ Chế độ rõ ràng: lương & phúc lợi theo Luật Lao động, hỗ trợ suất ăn, thưởng lễ Tết, cơ hội lên Trưởng quầy

📌 VỊ TRÍ: Pha chế (Barista) – Số lượng: 08 người

{CA}

{MOTA}

{YEUCAU}

{KHAC}

{LIENHE}

{TAG}""",
    p="Busy central bar of a retro Vietnamese café, three baristas in army-green aprons working in sync, ice being scooped, coffee dripping from phin filters, drinks lined up for service, vibrant warm lighting, dynamic composition")

bai(d=26, vt="BV", e="📋", ct="Tin ngắn 30 giây (5W1H)", t="Tin ngắn: cần gấp 02 Bảo vệ",
    tg="Việc ổn định – ứng tuyển đơn giản",
    h="📋 Cần gấp 02 Bảo vệ / Điều phối xe Full-time tại Mậu Dịch 197X",
    c="""📋 CẦN GẤP 02 BẢO VỆ / ĐIỀU PHỐI XE

✍️ Tin ngắn, đọc 30 giây là đủ:

🏢 Nơi làm: Mậu Dịch 197X – 33-37 Dã Tượng, Phường Nha Trang
👤 Cần: 02 người, sức khỏe tốt, trung thực, ưu tiên bộ đội xuất ngũ
🕰️ Ca làm: Full-time 9 tiếng, ca sáng 06:00 – 15:00 hoặc ca chiều 14:00 – 23:00
🛵 Việc chính: sắp xếp xe cho khách, giữ an ninh trật tự, bảo vệ tài sản
🎁 Quyền lợi: lương & phúc lợi theo Luật Lao động, hỗ trợ suất ăn, thưởng lễ Tết
💬 Mức lương cụ thể: trao đổi trực tiếp khi phỏng vấn

👉 Gọi hoặc nhắn Zalo là được hẹn phỏng vấn, thủ tục đơn giản!

{KHAC}

{LIENHE}

{TAG}""",
    p="Wide daytime exterior of a charming retro café entrance with lush tropical greenery, a Vietnamese security staff member in a dark-green uniform helping a guest park a motorbike in a neat row, clear blue Nha Trang sky, welcoming vibe")

bai(d=27, vt="PV", e="👯", ct="Rủ bạn cùng ứng tuyển (Lan truyền)", t="Rủ bạn thân đi làm cùng ca",
    tg="Rủ bạn thân – cùng đi làm cùng vui",
    h="👯 Rủ bạn thân cùng ứng tuyển Phục vụ / Runner tại Mậu Dịch 197X",
    c="""👯 CUỐI TUẦN RỒI, RỦ ĐỨA BẠN THÂN ĐI LÀM CÙNG CA KHÔNG? 😆

Đi làm thêm một mình thì hơi ngại.
Đi cùng bạn thân thì vừa có thu nhập, vừa có người trò chuyện lúc nghỉ ca! 🤭

Mậu Dịch 197X đang tuyển 10 PHỤC VỤ / RUNNER, nhận cả Full-time và Part-time. Rủ cả nhóm cùng ứng tuyển luôn nhé!

👉 Cách làm cực dễ:
1. Tag (@) đứa bạn hay rủ đi cà phê vào bình luận bài này
2. Cùng nhắn Zalo cho Mậu Dịch: Họ tên – Vị trí – Ca mong muốn
3. Hẹn nhau đi phỏng vấn chung! 🎉

📌 VỊ TRÍ: Phục vụ / Runner – Số lượng: 10 người

{CA}

{YEUCAU}

{QUYENLOI}

{KHAC}

{LIENHE}

{TAG}""",
    p="Two young Vietnamese best friends in army-green aprons laughing together while setting a wooden table in a retro café garden on a weekend afternoon, candid lifestyle photography, warm sunlight, plants and rattan furniture")

bai(d=28, vt="TV", e="📌", ct="Tổng kết chiến dịch (Recap)", t="Chốt đội hình: còn tuyển những vị trí nào?",
    tg="Chốt đội hình – mời bạn nhắn ngay",
    h="📌 Chốt đội hình Mậu Dịch 197X – cần thêm 02 Tạp vụ / Rửa ly",
    c="""📌 CHỐT ĐỘI HÌNH: MẬU DỊCH 197X CẦN THÊM 02 TẠP VỤ / RỬA LY

Sau gần một tháng tìm kiếm đồng đội, Mậu Dịch 197X xin cảm ơn tất cả các bạn đã quan tâm, chia sẻ và ứng tuyển! 💚

Chúng tôi vẫn đang tìm những người đồng hành cuối cùng. Vị trí cần gấp tuần này:

🫧 TẠP VỤ / RỬA LY (STEWARD) – 02 NGƯỜI
✔️ Không cần kinh nghiệm, không cần bằng cấp
✔️ Ca 9 tiếng: 06:00 – 15:00 hoặc 14:00 – 23:00
✔️ Có phụ cấp chuyên cần

{MOTA}

{QUYENLOI}

{KHAC}

📣 Biết ai đang cần việc? Hãy chia sẻ bài viết này hoặc tag người đó vào bình luận. Một cú nhấp của bạn có thể giúp ai đó có việc làm ổn định! 🙏

{LIENHE}

{TAG}""",
    p="Heartwarming group photo of a Vietnamese café team of different ages in army-green aprons and dark-green uniforms standing together in a retro café garden, smiling warmly, golden hour light, sense of family and community")


# ====================================================================
# KHO BÀI ĐĂNG SẴN
# ====================================================================
# Bài chuẩn cho từng vị trí: chỉ nói về một vị trí, không kèm vị trí khác.
# tg: dòng phụ trên poster · h: câu mở cho bản ngắn · p: cảnh cho câu lệnh tạo ảnh
_KHUNG_CHUAN = """

{CA}

{MOTA}

{YEUCAU}

{QUYENLOI}

{LIENHE}

{TAG}"""

CHUAN = {
    "QL": {"e": "🧭", "tg": "Người dẫn dắt quán cà phê 197X",
           "h": "🧭 Mậu Dịch 197X tuyển 01 Quản lý quán cà phê tại Nha Trang",
           "c": """🧭 MẬU DỊCH 197X TUYỂN DỤNG QUẢN LÝ QUÁN CÀ PHÊ

Bạn đã từng vận hành một quán cà phê đông khách?
Bạn biết cách giữ đội ngũ gắn kết và giữ khách quay lại?
👉 Mậu Dịch 197X đang tìm chính bạn!

☕ Mậu Dịch 197X là không gian Cà phê • Ẩm thực • Vui chơi • Cộng đồng mang cảm hứng hoài niệm 197X tại Nha Trang, vận hành 3 khu Khối A, Khối B, Sân vườn xoay quanh Quầy Bar Trung Tâm. Người Quản lý sẽ cùng Ban Giám đốc dẫn dắt toàn bộ hoạt động của quán.

📌 VỊ TRÍ: Quản lý quán cà phê – Số lượng: 01 người""" + _KHUNG_CHUAN,
           "p": "A confident Vietnamese café manager in their thirties, wearing a cream shirt and an army-green apron, standing behind the central wooden bar of a spacious retro café and smiling while overseeing the room, staff working softly blurred in the background"},
    "GS": {"e": "🎯", "tg": "Người giữ nhịp cho mỗi ca làm",
           "h": "🎯 Mậu Dịch 197X tuyển 02 Giám sát ca (Shift Leader) – Nha Trang",
           "c": """🎯 MẬU DỊCH 197X TUYỂN DỤNG GIÁM SÁT CA (SHIFT LEADER)

Quán đông khách nhất cũng là lúc bạn bình tĩnh nhất?
Bạn quen điều phối mọi người và luôn để mắt đến từng bàn?
👉 Vị trí Giám sát ca tại Mậu Dịch 197X dành cho bạn!

☕ Giám sát ca là người giữ nhịp cho mỗi ca làm tại 3 khu Khối A, Khối B, Sân vườn và Quầy Bar Trung Tâm: được giao quyền, được Quản lý đồng hành và có cơ hội tiến lên vị trí Quản lý quán.

📌 VỊ TRÍ: Giám sát ca (Shift Leader) – Số lượng: 02 người""" + _KHUNG_CHUAN,
           "p": "A calm Vietnamese shift leader in a cream shirt and army-green apron holding a tablet, standing in the middle of a retro café garden at dusk under warm string lights and guiding a young server, guests relaxing at dark wooden tables"},
    "TN": {"e": "💳", "tg": "Nụ cười đầu tiên khách nhận được",
           "h": "💳 Mậu Dịch 197X tuyển 02 Thu ngân / Điều phối Bar – Nha Trang",
           "c": """💳 MẬU DỊCH 197X TUYỂN DỤNG THU NGÂN / ĐIỀU PHỐI BAR

Cẩn thận với từng con số, thân thiện với từng vị khách?
Thích công việc có ca giờ rõ ràng, môi trường trẻ trung?
👉 Mậu Dịch 197X đang chờ bạn ở quầy thu ngân!

☕ Tại Mậu Dịch 197X, Thu ngân là nụ cười đầu tiên khách nhận được, đồng thời là người điều phối order đến Quầy Bar và bếp để món ra nhanh, đúng bàn. Chưa có kinh nghiệm sẽ được hướng dẫn.

📌 VỊ TRÍ: Thu ngân / Điều phối Bar – Số lượng: 02 người""" + _KHUNG_CHUAN,
           "p": "A friendly young Vietnamese cashier smiling warmly at a guest across a vintage dark-wood cashier counter with a tablet POS, coffee cups and a small potted plant, warm morning light, retro café softly blurred behind"},
    "TQ": {"e": "🔥", "tg": "Người giữ lửa Quầy Bar Trung Tâm",
           "h": "🔥 Mậu Dịch 197X tuyển 01 Trưởng quầy Pha chế (Head Barista) – Nha Trang",
           "c": """🔥 MẬU DỊCH 197X TUYỂN DỤNG TRƯỞNG QUẦY PHA CHẾ (HEAD BARISTA)

Tay nghề vững, mê cà phê và muốn dẫn dắt cả một quầy bar?
Bạn có những công thức riêng chỉ chờ cơ hội được lên ly?
👉 Quầy Bar Trung Tâm của Mậu Dịch 197X đang chờ bạn!

☕ Quầy Bar Trung Tâm phục vụ cả 3 khu Khối A, Khối B và Sân vườn. Trưởng quầy sẽ dẫn dắt đội 08 Barista, chuẩn hóa công thức và cùng phát triển dòng đồ uống mang dấu ấn 197X.

📌 VỊ TRÍ: Trưởng quầy Pha chế (Head Barista) – Số lượng: 01 người""" + _KHUNG_CHUAN,
           "p": "A skilled Vietnamese head barista in an army-green apron pouring latte art into an enamel cup at a central dark-wood bar with a classic espresso machine and aluminum phin filters, confident focused expression, warm dramatic side light"},
    "PC": {"e": "☕", "tg": "Pha ly cà phê có hồn mỗi ngày",
           "h": "☕ Mậu Dịch 197X tuyển 08 Pha chế (Barista) Full-time & Part-time – Nha Trang",
           "c": """☕ MẬU DỊCH 197X TUYỂN DỤNG PHA CHẾ (BARISTA) – FULL-TIME & PART-TIME

Yêu mùi cà phê mới xay?
Thích tự tay pha những ly đồ uống thật ngon cho khách?
👉 Mậu Dịch 197X đang cần 08 Barista cho Quầy Bar Trung Tâm!

🎓 Có ca Part-time 5 tiếng cho sinh viên. Chưa có kinh nghiệm sẽ được đào tạo từ cơ bản: pha phin, espresso, trà, đá xay…

📌 VỊ TRÍ: Pha chế (Barista) – Số lượng: 08 người""" + _KHUNG_CHUAN,
           "p": "A cheerful young Vietnamese barista in an army-green apron pouring hot water into an aluminum phin coffee filter at a retro wooden bar, steam rising, enamel cups and jars of coffee beans around, soft morning light"},
    "PV": {"e": "🙋", "tg": "Không cần kinh nghiệm – có ca Part-time",
           "h": "🙋 Mậu Dịch 197X tuyển 10 Phục vụ / Runner – nhận sinh viên Part-time",
           "c": """🙋 MẬU DỊCH 197X TUYỂN DỤNG PHỤC VỤ / RUNNER – FULL-TIME & PART-TIME

Năng động, thích gặp gỡ, muốn có việc làm linh hoạt?
Đang là sinh viên và cần thêm thu nhập mà không ảnh hưởng lịch học?
👉 Mậu Dịch 197X đang tuyển 10 bạn Phục vụ / Runner!

🌱 Không cần kinh nghiệm, được hướng dẫn từ đầu. Làm việc tại 3 khu Khối A, Khối B và Sân vườn cùng một tập thể trẻ, vui vẻ.

📌 VỊ TRÍ: Phục vụ / Runner – Số lượng: 10 người""" + _KHUNG_CHUAN,
           "p": "Two cheerful young Vietnamese servers in army-green aprons carrying trays of iced coffee through the lush garden seating area of a retro café, rattan chairs and dark wooden tables, warm sunny afternoon, natural laughter"},
    "TV": {"e": "🫧", "tg": "Việc ổn định – có phụ cấp chuyên cần",
           "h": "🫧 Mậu Dịch 197X tuyển 02 Tạp vụ / Rửa ly – không cần kinh nghiệm",
           "c": """🫧 MẬU DỊCH 197X TUYỂN DỤNG TẠP VỤ / RỬA LY (STEWARD)

Bạn đang tìm một công việc ổn định, lâu dài?
Chưa có kinh nghiệm, không có bằng cấp, nhưng chăm chỉ và sạch sẽ?
👉 Mậu Dịch 197X chào đón bạn!

✨ Mỗi chiếc ly sáng bóng trên Quầy Bar, mỗi góc Sân vườn sạch tinh tươm đều có công của đội Tạp vụ. Công việc rõ ràng, ca làm ổn định và có phụ cấp chuyên cần.

📌 VỊ TRÍ: Tạp vụ / Rửa ly – Số lượng: 02 người""" + _KHUNG_CHUAN,
           "p": "A friendly middle-aged Vietnamese steward in an army-green apron polishing sparkling glasses at a tidy dish station of a retro café, neat racks of clean enamel cups and glassware, warm soft light, calm and dignified mood"},
    "BV": {"e": "🛡️", "tg": "Ổn định lâu dài – ưu tiên bộ đội xuất ngũ",
           "h": "🛡️ Mậu Dịch 197X tuyển 02 Bảo vệ / Điều phối xe – ưu tiên bộ đội xuất ngũ",
           "c": """🛡️ MẬU DỊCH 197X TUYỂN DỤNG BẢO VỆ / ĐIỀU PHỐI XE

Tác phong chuẩn mực, trung thực và tận tâm?
Muốn tìm một công việc ổn định, lâu dài tại Nha Trang?
👉 Mậu Dịch 197X đang cần 02 Bảo vệ / Điều phối xe, ưu tiên bộ đội xuất ngũ!

🎖️ Người bảo vệ là người đầu tiên chào đón khách và cuối cùng tiễn khách ra về. Chúng tôi trân trọng công việc này và mong tìm được những đồng đội kỷ luật, lịch sự.

📌 VỊ TRÍ: Bảo vệ / Điều phối xe – Số lượng: 02 người""" + _KHUNG_CHUAN,
           "p": "A polite Vietnamese security staff member in a neat dark-green uniform helping a guest park a motorbike in a tidy row in front of a retro café entrance framed by tropical plants, warm evening lights, welcoming atmosphere"},
}

# Bài tuyển chung cho tất cả vị trí – 3 phong cách.
# Các khối {…} được ghép lúc chạy và tự bỏ vị trí đã bật "Đã đủ người":
#   {N} tổng số người · {M} số vị trí · {DS_NHOM} {DS_PHIEU} {DS_VAI} danh sách vị trí
#   {GIO_LAM} giờ làm theo vị trí · {PT_LINE} dòng Part-time · {QUYENLOI} {LIENHE} {TAG}
CHUNG = [
    {"so": 1, "e": "📢", "ten": "Thông báo tổng hợp", "phong_cach": "Chuyên nghiệp, rõ ràng",
     "hop": "Fanpage, nhóm việc làm Nha Trang, Zalo, Google Maps",
     "anh": "Poster bảng tin: ảnh không gian quán phía trên, lưới 8 vị trí kèm số lượng",
     "h": "📢 Mậu Dịch 197X tuyển {N} nhân sự – {M} vị trí tại Nha Trang",
     "c": """📢 MẬU DỊCH 197X TUYỂN DỤNG {N} NHÂN SỰ – {M} VỊ TRÍ

☕ Mậu Dịch 197X là không gian Cà phê • Ẩm thực • Vui chơi • Cộng đồng tại 33-37 Dã Tượng, Phường Nha Trang. Chúng tôi đang tìm những đồng đội mới cho 3 khu Khối A, Khối B, Sân vườn và Quầy Bar Trung Tâm.

📋 CÁC VỊ TRÍ ĐANG TUYỂN

{DS_NHOM}

{GIO_LAM}

{QUYENLOI}

{LIENHE}

{TAG}""",
     "p": "Wide establishing shot of a lively retro Vietnamese café in Nha Trang with the whole team at work: a manager, baristas behind a long central wooden bar, a cashier at the counter, servers carrying trays, a garden seating area with string lights visible through open doors",
     "bo_cuc": "top"},
    {"so": 2, "e": "🎫", "ten": "Phiếu tuyển dụng 197X", "phong_cach": "Hoài niệm, vui, dễ chia sẻ",
     "hop": "Fanpage, nhóm Facebook, TikTok dạng ảnh, in dán tại quán",
     "anh": "Poster chữ kiểu tem phiếu thời bao cấp, có con dấu “Đang tuyển”, không cần ảnh AI",
     "h": "🎫 Phiếu tuyển dụng Mậu Dịch 197X: cần {N} đồng chí cho {M} vị trí",
     "c": """🎫 PHIẾU TUYỂN DỤNG – CỬA HÀNG MẬU DỊCH 197X 🎫

Ngày xưa, mua hàng ở cửa hàng mậu dịch phải có tem phiếu.
Ngày nay, đến làm việc ở Mậu Dịch 197X chỉ cần… một tin nhắn Zalo! 😄

📢 Cửa hàng Mậu Dịch 197X trân trọng thông báo: cần tuyển {N} đồng chí cho {M} vị trí sau đây 👇

{DS_PHIEU}

📜 CHẾ ĐỘ "PHÂN PHỐI"
✅ Lương & phúc lợi đầy đủ theo Luật Lao động
✅ Hỗ trợ suất ăn trong ca, khỏi lo xếp hàng lĩnh gạo 🍚
✅ Thưởng lễ, Tết
✅ Cơ hội thăng tiến cho đồng chí chăm chỉ
💬 Mức lương cụ thể trao đổi trực tiếp khi phỏng vấn.

{LIENHE}

{TAG}""",
     "p": None, "bo_cuc": None},
    {"so": 3, "e": "💚", "ten": "Gia nhập đội hình", "phong_cach": "Trẻ trung, cảm xúc",
     "hop": "Fanpage, Instagram, TikTok, nhóm sinh viên",
     "anh": "Poster ảnh đội ngũ tràn khung, các vị trí dạng nhãn tròn, chân màu cam đất",
     "h": "💚 Mậu Dịch 197X tìm {N} mảnh ghép cho đội hình – {M} vị trí đang mở",
     "c": """💚 MẬU DỊCH 197X ĐANG TÌM {N} MẢNH GHÉP CHO ĐỘI HÌNH!

Ở đây có người pha ly cà phê đầu tiên lúc 6 giờ sáng,
có người chạy món nhanh như gió giữa Sân vườn,
có người giữ nụ cười ở quầy thu ngân,
và có người lặng lẽ giữ cho từng chiếc ly sáng bóng. ✨

Mỗi người một vai, cùng nhau làm nên Mậu Dịch 197X. Và đội hình ấy đang chờ thêm BẠN!

👇 CHỌN VAI CỦA BẠN:
{DS_VAI}

{PT_LINE}
🌱 Chưa có kinh nghiệm? Nhiều vị trí được hướng dẫn từ đầu.

{QUYENLOI}

👯 Rủ bạn bè cùng ứng tuyển: tag ngay vào bình luận nhé!

{LIENHE}

{TAG}""",
     "p": "Joyful team portrait of eight Vietnamese café staff of different ages and roles, wearing army-green aprons and dark-green uniforms, standing together and laughing in front of the central wooden bar of a retro café, warm golden light, candid and friendly",
     "bo_cuc": "team"},
]

NHOM_VI_TRI = [
    {"ten": "🧭 KHỐI QUẢN LÝ", "ds": ["QL", "GS"]},
    {"ten": "☕ QUẦY BAR & THU NGÂN", "ds": ["TQ", "PC", "TN"]},
    {"ten": "🍽️ PHỤC VỤ", "ds": ["PV"]},
    {"ten": "🛠️ HỖ TRỢ VẬN HÀNH", "ds": ["TV", "BV"]},
]
