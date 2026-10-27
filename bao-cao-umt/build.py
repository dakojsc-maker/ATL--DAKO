#!/usr/bin/env python3
"""Build the UMT investor report.

Reads src/report.template.html, renders charts as responsive HTML on exact linear
scales, turns [[key, key]] citation markers into numbered links, renders the
source list, and writes UMT_Ho-so-tham-dinh.html (a standalone page) next to
this script. With --fragment PATH it also writes the page body without the
document skeleton, which is the form the Artifact viewer publishes.

    python3 build.py [--fragment PATH]
    node pdf.js            # then export the A4 PDF
"""
import html
import re
import sys
from pathlib import Path

HERE = Path(__file__).resolve().parent
TEMPLATE = HERE / "src" / "report.template.html"
OUT_STANDALONE = HERE / "UMT_Ho-so-tham-dinh.html"

# ---------------------------------------------------------------------------
# Sources. Tier A = official (UMT documents, government portals, legal texts);
# B = mainstream press / legal-information services; C = aggregators, used
# only to corroborate and always flagged in the text.
# ---------------------------------------------------------------------------
REFS = [
    # --- UMT official -----------------------------------------------------
    ("umt-about", "A", "UMT", "Tổng quan về Trường đại học UMT (tầm nhìn, sứ mệnh, giá trị cốt lõi, Hội đồng trường, các mốc phát triển)", "truy cập 10/2026", ["https://www.umt.edu.vn/ve-umt"]),
    ("umt-attt", "A", "UMT", "Đề án mở ngành An toàn thông tin (mã 7480202), năm học 2025–2026 — PDF", "11/2025", ["https://sdn.umt.edu.vn/2025_2026_UMT_De_an_mo_nganh_ATTT_512fa58813.pdf"]),
    ("umt-khmt", "A", "UMT", "Đề án mở ngành Khoa học máy tính, năm học 2025–2026 — PDF", "2025", ["https://sdn.umt.edu.vn/2025_2026_UMT_De_an_mo_nganh_KHMT_d1c154db11.pdf"]),
    ("umt-en", "A", "UMT", "About UMT — Leadership and Governance (bản tiếng Anh)", "truy cập 10/2026", ["https://www.umt.edu.vn/en/about-umt"]),
    ("umt-ts", "A", "UMT", "Thông tin tuyển sinh năm 2026 (ngành, học phí, học bổng, liên hệ)", "2026", ["https://www.umt.edu.vn/tuyen-sinh"]),
    ("umt-bs2026", "A", "UMT", "Trường Đại học UMT xét tuyển bổ sung đại học chính quy năm 2026", "8/2026", ["https://www.umt.edu.vn/tin-tuc/truong-dai-hoc-umt-xet-tuyen-bo-sung-dai-hoc-chinh-quy-nam-2026"]),
    ("umt-tn2026", "A", "UMT", "Diễn văn của Hiệu trưởng UMT tại Lễ tốt nghiệp 2026 “Dấu ấn tiên phong”", "22/8/2026", ["https://www.umt.edu.vn/tin-tuc/dien-van-cua-hieu-truong-umt-tai-le-tot-nghiep-2026-hay-can-dam-bat-dau-hanh-trinh-cua-rieng-minh"]),
    ("umt-hb104", "A", "UMT", "Chúc mừng 104 thí sinh tài năng đầu tiên trúng tuyển học bổng UMT 2026", "2026", ["https://www.umt.edu.vn/tin-tuc/chuc-mung-104-thi-sinh-tai-nang-dau-tien-trung-tuyen-hoc-bong-umt-2026"]),
    ("umt-td", "A", "UMT", "Cơ hội nghề nghiệp & tuyển dụng giảng viên, nhân viên (VI) / Careers (EN)", "truy cập 10/2026", ["https://www.umt.edu.vn/tuyen-dung", "https://www.umt.edu.vn/en/careers"]),
    ("umt-ctdt", "A", "UMT", "Chương trình đào tạo và các trang ngành (Marketing, Logistics, Quản lý TDTT, Thiết kế đồ họa, Truyền thông đa phương tiện, Khoa học máy tính, An toàn thông tin)", "truy cập 10/2026", ["https://www.umt.edu.vn/chuong-trinh-dao-tao", "https://www.umt.edu.vn/chuong-trinh/logistic-va-quan-ly-chuoi-cung-ung", "https://www.umt.edu.vn/chuong-trinh/quan-ly-the-duc-the-thao"]),
    ("umt-khoa", "A", "UMT", "Trang các khoa: Khoa Công nghệ, Khoa Kinh doanh, Khoa Truyền thông và Nghệ thuật ứng dụng", "truy cập 10/2026", ["https://www.umt.edu.vn/khoa/khoa-cong-nghe", "https://www.umt.edu.vn/khoa/khoa-kinh-doanh", "https://www.umt.edu.vn/khoa/khoa-truyen-thong-va-nghe-thuat-ung-dung"]),
    ("umt-easycs", "A", "UMT", "Chính thức hợp tác cùng EasyCS (Hàn Quốc): sinh viên tham gia phát triển AI từ dự án thực tế", "2026", ["https://www.umt.edu.vn/tin-tuc/chinh-thuc-hop-tac-cung-easy-cs-han-quoc-mo-rong-co-hoi-de-sinh-vien-tham-gia-phat-trien-ai-tu-du-an-thuc-te"]),
    ("umt-htqt", "A", "UMT", "UMT đẩy mạnh hợp tác quốc tế, tạo ra nhiều giá trị cho sinh viên và nhà trường", "2023", ["https://www.umt.edu.vn/vi-vn/umt-day-manh-hop-tac-quoc-te-tao-ra-nhieu-gia-tri-cho-sinh-vien-va-nha-truong.html"]),
    ("umt-slsu", "A", "UMT", "UMT mở rộng hệ sinh thái tri thức toàn cầu thông qua hợp tác với Southern Leyte State University", "2025–2026", ["https://www.umt.edu.vn/tin-tuc/umt-mo-rong-he-sinh-thai-tri-thuc-toan-cau-thong-qua-hop-tac-voi-southern-leyte-state-university-slsu"]),
    ("umt-bus", "A", "UMT", "Xe buýt 154 chính thức khởi hành tại UMT; hướng dẫn kết nối Metro với lộ trình UMT Bus", "25/8/2025", ["https://www.umt.edu.vn/vi-vn/tin-vui-xe-buyt-154-da-chinh-thuc-khoi-hanh-tai-umt-vao-ngay-25-8-2025.html", "https://www.umt.edu.vn/vi-vn/huong-dan-sinh-vien-mua-ve-metro-thang-va-ket-noi-tuyen-metro-voi-lo-trinh-umt-bus.html"]),
    ("umt-faq", "A", "UMT", "UMTFAQ 2025 (thư viện, ONE UMT Hub, ký túc xá – căn hộ cho thuê, UMT Bus)", "2025", ["https://faq.umt.edu.vn/"]),
    ("umt-hbcmt", "A", "UMT", "Thông báo nhận hồ sơ học bổng Cao Minh Trí năm 2026", "2026", ["https://www.umt.edu.vn/tin-tuc/thong-bao-nhan-ho-so-hoc-bong-cao-minh-tri-nam-2026"]),
    ("umt-tdthu", "A", "UMT", "PGS.TS. Trần Đan Thư, Trưởng Khoa Công nghệ", "2023", ["https://www.umt.edu.vn/vi-vn/pgs-ts-tran-dan-thu-truong-khoa-cong-nghe-hoc-cong-nghe-thong-tin-luon-de-dang-co-viec-lam.html"]),
    ("umt-hptc", "A", "UMT", "Hỗ trợ tài chính — chương trình “Học phí 0 tiền mặt”", "2022", ["https://www.umt.edu.vn/vi-vn/hoc-phi-0-tien-mat.html"]),
    ("umt-tancang", "A", "UMT", "Cổng việc làm UMT — Triển vọng hợp tác Tân Cảng – UMT", "2/2022", ["https://vieclam.umt.edu.vn/tin-tuc/trien-vong-hop-tac-tan-cang-umt.35A54F44/vi"]),
    ("umt-lib", "A", "UMT", "Trung tâm Thông tin Thư viện UMT (cổng thông tin, CSDL nguồn mở)", "truy cập 10/2026", ["https://lib.umt.edu.vn/"]),
    ("umt-social", "A", "UMT", "Kênh truyền thông chính thức: Facebook, Instagram, LinkedIn, YouTube, TikTok (số liệu theo ảnh chụp chỉ mục tìm kiếm)", "truy cập 10/2026", ["https://www.facebook.com/UMTUniversity/", "https://www.instagram.com/umt.edu.vn/", "https://vn.linkedin.com/company/umt-university", "https://www.youtube.com/@umtuniversity", "https://www.tiktok.com/discover/umt-university"]),
    ("umt-shinhan", "A", "UMT", "UMTers nâng cao hiểu biết về tín dụng cùng Shinhan Bank", "2024", ["https://www.umt.edu.vn/vi-vn/umters-nang-cao-hieu-biet-ve-tin-dung-cung-shinhan-bank-ngan-hang-hang-dau-han-quoc.html"]),
    ("umt-cmtri", "A", "UMT", "PGS.TS. Cao Minh Trí — hồ sơ giảng viên", "truy cập 10/2026", ["https://www.umt.edu.vn/vi-vn/pgs-ts-cao-minh-tri.html"]),
    ("umt-xanh", "A", "UMT", "UMT — Trường đại học xanh chuẩn chất lượng quốc tế", "truy cập 10/2026", ["https://www.umt.edu.vn/vi-vn/umt-truong-dai-hoc-xanh-chuan-chat-luong-quoc-te.html"]),
    ("umt-wharton", "A", "UMT", "UMT tiếp đại diện Trường Wharton, trao đổi về định hướng cho UMTers học tập tại Mỹ", "2024", ["https://www.umt.edu.vn/vi-vn/umt-tiep-dai-dien-truong-wharton-trao-doi-ve-dinh-huong-cho-umters-hoc-tap-tai-my.html"]),
    ("umt-hackathon", "A", "UMT", "Chính thức khởi động Hackathon Digiport Logistics 2025 — chuyển đổi số cho tương lai cảng biển", "2025", ["https://www.umt.edu.vn/vi-vn/umt-news-chinh-thuc-khoi-dong-hackathon-digiport-logistics-2025--chuyen-doi-so-cho-tuong-lai-cang-bien.html", "https://hakathon.umt.edu.vn/doi-tac-dong-hanh"]),
    ("umt-techgen", "A", "UMT", "UMT TechGen 2026 — sân chơi lập trình cho học sinh THPT toàn quốc", "2026", ["https://techgen.umt.edu.vn/"]),
    ("umt-smartgen", "A", "UMT", "SMArt Gen’s Branding Challenge 2026", "2026", ["https://www.umt.edu.vn/su-kien/smart-gen-s-branding-challenge-2026"]),
    ("umt-q12", "A", "UMT", "UMT đồng hành cùng sĩ tử Trung tâm GDNN – GDTX Quận 12", "2026", ["https://www.umt.edu.vn/tin-tuc/umt-dong-hanh-cung-si-tu-trung-tam-gdnn-gdtx-quan-12-vung-tam-ly-sang-tuong-lai-trong-ky-nguyen-so"]),
    # --- Government portals & legal texts ---------------------------------
    ("gov-ramat", "A", "Báo Điện tử Chính phủ", "Ra mắt Trường Đại học Quản lý và Công nghệ TPHCM", "24/11/2021", ["https://baochinhphu.vn/ra-mat-truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-102304415.htm"]),
    ("gov-khaigiang", "A", "Cổng TTĐT TP.HCM", "Trường Đại học Quản lý và Công nghệ TPHCM khánh thành và khai giảng năm học mới", "8/10/2022", ["https://tphcm.chinhphu.vn/truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-khai-giang-nam-hoc-dau-tien-101221008223151719.htm"]),
    ("gov-ts2025", "A", "Cổng TTĐT TP.HCM", "UMT tuyển sinh năm 2025: Học phí ổn định, học bổng toàn khóa; điểm trúng tuyển 3 năm gần đây", "26/5/2025", ["https://tphcm.chinhphu.vn/umt-tuyen-sinh-nam-2025-hoc-phi-on-dinh-hoc-bong-toan-khoa-101250526163623404.htm"]),
    ("gov-dc2025", "A", "Cổng Xây dựng chính sách (Chính phủ)", "Điểm chuẩn Trường Đại học Quản lý và Công nghệ TPHCM (UMT) 2025", "23/8/2025", ["https://xaydungchinhsach.chinhphu.vn/diem-chuan-truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-umt-2025-119250823115333707.htm"]),
    ("law-2018", "A", "Quốc hội", "Luật sửa đổi, bổ sung một số điều của Luật Giáo dục đại học, số 34/2018/QH14", "19/11/2018", ["https://thuvienphapluat.vn/van-ban/Giao-duc/Luat-Giao-duc-dai-hoc-sua-doi-388254.aspx"]),
    ("law-2025", "A", "Quốc hội", "Luật Giáo dục đại học số 125/2025/QH15 (bản tiếng Việt và tiếng Anh)", "10/12/2025", ["https://thuvienphapluat.vn/van-ban/Giao-duc/Luat-Giao-duc-dai-hoc-2025-so-125-2025-QH15-663779.aspx", "https://english.luatvietnam.vn/law-on-higher-education-no-125-2025-qh15-dated-december-10-2025-of-the-national-assembly-422532-doc1.html"]),
    ("nd-91", "A", "Chính phủ", "Nghị định 91/2026/NĐ-CP quy định chi tiết và hướng dẫn thi hành Luật Giáo dục đại học", "30/3/2026", ["https://thuvienphapluat.vn/van-ban/giao-duc/Nghi-dinh-91-2026-ND-CP-huong-dan-Luat-Giao-duc-dai-hoc-562760.aspx"]),
    ("nd-86", "A", "Chính phủ", "Nghị định 86/2018/NĐ-CP quy định về hợp tác, đầu tư của nước ngoài trong lĩnh vực giáo dục (đã sửa đổi, bổ sung)", "6/6/2018", ["https://thuvienphapluat.vn/van-ban/Dau-tu/Nghi-dinh-86-2018-ND-CP-quy-dinh-ve-hop-tac-dau-tu-cua-nuoc-ngoai-trong-linh-vuc-giao-duc-337783.aspx"]),
    ("tt-83", "A", "Bộ GD&ĐT", "Thông tư 83/2026/TT-BGDĐT quy định Chuẩn cơ sở giáo dục đại học — toàn văn", "30/9/2026", ["https://xaydungchinhsach.chinhphu.vn/toan-van-thong-tu-83-2026-tt-bgddt-quy-dinh-chuan-co-so-giao-duc-dai-hoc-119260930153929846.htm"]),
    ("tt-01", "A", "Bộ GD&ĐT", "Thông tư 01/2024/TT-BGDĐT ban hành Chuẩn cơ sở giáo dục đại học (được thay thế bởi TT 83/2026)", "5/2/2024", ["https://thuvienphapluat.vn/van-ban/Giao-duc/Thong-tu-01-2024-TT-BGDDT-Chuan-co-so-giao-duc-dai-hoc-598459.aspx"]),
    ("vqa-list", "A", "Cục Quản lý chất lượng, Bộ GD&ĐT", "Danh sách cơ sở giáo dục, chương trình đào tạo đã được đánh giá/công nhận đạt tiêu chuẩn chất lượng (cập nhật đến 31/5/2026)", "2026", ["https://vqa.moet.gov.vn/vi/thong-bao-quan-ly-bao-dam/thong-bao/danh-sach-cac-co-so-giao-duc-chuong-trinh-dao-tao-giao-duc-dai-hoc-va-cao-dang-su-pham-da-hoan-thanh-bao-cao-tu-danh-gia-va-duoc-danh-gia-cong-nhan-dat-tieu-chuan-chat-luong-giao-duc-cap-nhat-den-ngay-31-5-2026-90.html"]),
    # --- Legal-information services & market data -------------------------
    ("lv-nd361", "B", "LuatVietnam", "Từ 17/9/2026, vốn đầu tư để thành lập trường đại học tư thục giảm còn tối thiểu 300 tỷ đồng (Nghị định 361/2026/NĐ-CP)", "9/2026", ["https://luatvietnam.vn/tin-van-ban-moi/tu-17-9-2026-von-dau-tu-de-thanh-lap-truong-dai-hoc-tu-thuc-giam-con-toi-thieu-300-ty-dong-186-112621-article.html"]),
    ("lv-luongtoithieu", "B", "LuatVietnam", "Mức lương tối thiểu vùng tại TP.HCM năm 2026 (Nghị định 293/2025/NĐ-CP)", "2026", ["https://luatvietnam.vn/lao-dong-tien-luong/muc-luong-toi-thieu-vung-tai-tphcm-nam-2026-562-105246-article.html"]),
    ("lv-chuyendoi", "B", "LuatVietnam", "Lần đầu quy định thủ tục chuyển đổi cơ sở giáo dục tư thục sang hoạt động không vì lợi nhuận", "2026", ["https://luatvietnam.vn/tin-van-ban-moi/lan-dau-quy-dinh-thu-tuc-chuyen-doi-co-so-giao-duc-tu-thuc-sang-hoat-dong-khong-vi-loi-nhuan-186-107593-article.html"]),
    ("fx-usd", "B", "Thị trường Tài chính Tiền tệ", "Ngày 21/10: tỷ giá trung tâm giảm 5 đồng (25.634 VND/USD)", "21/10/2026", ["https://thitruongtaichinhtiente.vn/ngay-21-10-ty-gia-trung-tam-giam-5-dong-86455.html"]),
    ("fx-krw", "C", "Stockbiz (dữ liệu Vietcombank)", "Tỷ giá ngoại tệ — KRW tại Vietcombank (mua chuyển khoản 18,47 VND/KRW)", "15/10/2026", ["https://stockbiz.vn/ty-gia"]),
    # --- Press -------------------------------------------------------------
    ("gd-thanhlap", "B", "Giáo dục Việt Nam (giaoduc.net.vn)", "Thêm một trường đại học tư thục không vì lợi nhuận được thành lập", "4/2021", ["https://giaoduc.net.vn/giao-duc-24h/them-mot-truong-dai-hoc-tu-thuc-khong-vi-loi-nhuan-duoc-thanh-lap-post216808.gd"]),
    ("tt-thanhlap", "B", "Tuổi Trẻ", "Thêm một trường đại học tư được cấp phép thành lập", "4/4/2021", ["https://tuoitre.vn/them-mot-truong-dai-hoc-duoc-cap-phep-thanh-lap-20210404190614376.htm"]),
    ("vne-ramat", "B", "VnExpress", "Ra mắt Trường Đại học Quản lý và Công nghệ TP HCM", "11/2021", ["https://vnexpress.net/ra-mat-truong-dai-hoc-quan-ly-va-cong-nghe-tp-hcm-4393279.html"]),
    ("kenh14", "B", "Kenh14", "Trường Đại học UMT đốn tim giới trẻ với giao diện mang phong cách chuẩn “resort”", "9/11/2022", ["https://kenh14.vn/truong-dai-hoc-umt-don-tim-gioi-tre-voi-giao-dien-mang-phong-cach-chuan-resort-2022110912033636.chn"]),
    ("dt-campustour", "B", "Dân trí", "Học sinh được hướng nghiệp và tư vấn tuyển sinh tại UMT Campus Tour 2025", "16/5/2025", ["https://dantri.com.vn/giao-duc/hoc-sinh-duoc-huong-nghiep-va-tu-van-tuyen-sinh-tai-umt-campus-tour-2025-20250516105752748.htm"]),
    ("tn-2021", "B", "Thanh Niên", "Trường ĐH Quản lý và Công nghệ TP.HCM sẽ tuyển sinh từ năm 2022", "11/2021", ["https://thanhnien.vn/truong-dh-quan-ly-va-cong-nghe-tp-hcm-chinh-thuc-hoat-dong-sau-hon-8-nam-1851404588.htm"]),
    ("sgt-kiena", "B", "Kinh tế Sài Gòn", "Ông chủ của Kiến Á tiếp tục ra mắt trường đại học mới", "11/2021", ["https://thesaigontimes.vn/ong-chu-cua-kien-a-tiep-tuc-ra-mat-truong-dai-hoc-moi/"]),
    ("tn-khongloinhuan", "B", "Thanh Niên", "Để VN xây dựng trường ĐH tư thục đẳng cấp: Phát triển mô hình không vì lợi nhuận", "6/2026", ["https://thanhnien.vn/de-vn-xay-dung-truong-dh-tu-thuc-dang-cap-phat-trien-mo-hinh-khong-vi-loi-nhuan-185260624230422376.htm"]),
    ("vnbiz-kiena", "B", "VietnamBiz", "Đế chế Kiến Á của ông Huỳnh Bá Lân: Từ chủ nhiệm Toán Đại học Bách khoa đến ông chủ của một loạt dự án bất động sản phía Nam", "18/9/2020", ["https://vietnambiz.vn/de-che-kien-a-cua-ong-huynh-ba-lan-tu-chu-nhiem-toan-dai-hoc-bach-khoa-den-ong-chu-cua-mot-loat-du-an-bat-dong-san-phia-nam-20200918165446593.htm"]),
    ("ndt-350", "B", "Nhà Đầu Tư", "Khoản nợ mới 350 tỷ và cuộc chơi kín tiếng của Kiến Á Group", "sau 12/2018", ["https://nhadautu.vn/khoan-no-moi-350-ty-va-cuoc-choi-kin-tieng-cua-kien-a-group-d43050.html"]),
    ("ndt-kecan", "B", "Nhà Đầu Tư", "Thế hệ kế cận tại Kiến Á Group", "2024", ["https://nhadautu.vn/the-he-ke-can-tai-kien-a-group-d87294.html"]),
    ("cafebiz-son", "B", "CafeBiz", "Con trai vị Giáo sư toán học kiêm Chủ tịch Tập đoàn BĐS, thành viên HĐQT KienLongBank: Trong công việc lúc nào cũng xung đột với cha", "21/5/2021", ["https://cafebiz.vn/con-trai-vi-giao-su-toan-hoc-kiem-chu-tich-tap-doan-bds-thanh-vien-hdqt-kienlongbank-trong-cong-viec-luc-nao-cung-xung-dot-voi-cha-20210521091455045.chn"]),
    ("cafef-spm", "B", "CafeF (đăng lại trên DNSE)", "Doanh nghiệp liên quan nhóm Kiến Á tiếp tục kinh doanh thua lỗ", "3/2026", ["https://www.dnse.com.vn/senses/tin-tuc/doanh-nghiep-lien-quan-nhom-kien-a-tiep-tuc-kinh-doanh-thua-lo-35203093"]),
    ("vnf-spm", "B", "VietnamFinance", "Sài Gòn Phú Minh: Hết nợ trái phiếu 491 tỷ đồng, vẫn phát sinh 400 tỷ đồng vay dài hạn", "2026", ["https://vietnamfinance.vn/sai-gon-phu-minh-het-no-trai-phieu-491-ty-dong-van-phat-sinh-400-ty-dong-vay-dai-han-d150378.html"]),
    ("bpl-spm", "B", "Báo Pháp luật Việt Nam (Doanh nhân)", "Sạch bóng nợ trái phiếu, doanh nghiệp hệ sinh thái Kiến Á xoay trục dòng vốn hàng trăm tỷ đồng", "2026", ["https://doanhnhan.baophapluat.vn/sach-bong-no-trai-phieu-doanh-nghiep-he-sinh-thai-kien-a-xoay-truc-dong-von-hang-tram-ty-dong.html"]),
    ("tt-uef", "B", "Tuổi Trẻ", "Vài chục tỉ đồng mua được trường đại học (chuyển giao Trường ĐH Kinh tế – Tài chính TP.HCM cho CTCP Đầu tư Phát triển Giáo dục HUTECH)", "2014", ["https://tuoitre.vn/vai-chuc-ti-mua-duoc-truong-dh-653110.htm"]),
    ("tt-hocphi2023", "B", "Tuổi Trẻ", "Trường đổi cách thu học phí, sinh viên bức xúc ‘phải đóng nhiều hơn’", "2/10/2023", ["https://tuoitre.vn/truong-doi-cach-thu-hoc-phi-sinh-vien-buc-xuc-phai-dong-nhieu-hon-20231002111648183.htm"]),
    ("gd-hocphi2023", "B", "Giáo dục Việt Nam (giaoduc.net.vn)", "SV học tín chỉ, trường thu tiền theo kỳ: ĐH Quản lý và Công nghệ TP.HCM nói gì?", "10/2023", ["https://giaoduc.net.vn/sv-hoc-tin-chi-truong-thu-tien-theo-ky-dh-quan-ly-va-cong-nghe-tphcm-noi-gi-post238408.gd"]),
    ("vne-htcs", "B", "VnExpress", "UMT thêm chính sách hỗ trợ tài chính sinh viên", "2022", ["https://vnexpress.net/umt-them-chinh-sach-ho-tro-tai-chinh-sinh-vien-4505522.html"]),
    ("voh-hb2022", "B", "VOH", "Một trường đại học ưu tiên dành học bổng cho thí sinh giỏi kỹ năng mềm", "2022", ["https://voh.com.vn/giao-duc/mot-truong-dai-hoc-uu-tien-danh-hoc-bong-cho-thi-sinh-gioi-ky-nang-mem-428908.html"]),
    ("voh-dc2022", "B", "VOH", "Điểm chuẩn đại học 2022: Trường Đại học Quản lý và Công nghệ TPHCM lấy 15 điểm", "9/2022", ["https://voh.com.vn/tuyen-sinh/diem-chuan-dai-hoc-2022-truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-lay-15-diem-448409.html"]),
    ("gd247-ts2023", "B", "Giáo dục 247", "UMT công bố thông tin tuyển sinh năm 2023", "2023", ["https://giaoduc247.vn/tp-hcm/umt-cong-bo-thong-tin-tuyen-sinh-nam-2023"]),
    ("vnn-hb2026", "B", "VietNamNet", "Một đại học tuyên bố tất cả thí sinh trúng tuyển 2026 đều nhận học bổng 90 triệu", "12/2025", ["https://vietnamnet.vn/mot-dai-hoc-tuyen-bo-tat-ca-thi-sinh-trung-tuyen-2026-deu-nhan-hoc-bong-90-trieu-2470976.html"]),
    ("cafebiz-hb2026", "B", "CafeBiz", "Một đại học tuyên bố tất cả thí sinh trúng tuyển năm 2026 đều nhận ngay học bổng tối thiểu 90 triệu đồng", "12/2025", ["https://cafebiz.vn/mot-dai-hoc-tuyen-bo-tat-ca-thi-sinh-trung-tuyen-nam-2026-deu-nhan-ngay-hoc-bong-toi-thieu-90-trieu-dong-17625121012122403.chn"]),
    ("gd247-hb2026", "B", "Giáo dục 247", "UMT công bố học bổng tài năng 2026 hơn 111 tỷ đồng", "12/2025", ["https://giaoduc247.vn/tp-hcm/umt-cong-bo-hoc-bong-tai-nang-2026-hon-111-ty-dong"]),
    ("mt-2026", "B", "Tuổi Trẻ (Mực Tím)", "Năm 2026, Trường đại học Quản lý và Công nghệ TP.HCM tuyển sinh những ngành nào?", "11/12/2025", ["https://muctim.tuoitre.vn/nam-2026-truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-tuyen-sinh-nhung-nganh-nao-101251211154251082.htm"]),
    ("gdtd-dc2026", "B", "Giáo dục & Thời đại", "Trường Đại học Quản lý và Công nghệ TPHCM công bố điểm chuẩn", "8/2026", ["https://giaoducthoidai.vn/truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-cong-bo-diem-chuan-post787863.html"]),
    ("gd247-bs2026", "B", "Giáo dục 247", "Trường Đại học Quản lý và Công nghệ TPHCM tuyển bổ sung vào 10 ngành đào tạo", "9/2026", ["https://giaoduc247.vn/tp-hcm/truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-tuyen-bo-sung-vao-10-nganh-dao-tao"]),
    ("tt-thuctien", "B", "Tuổi Trẻ", "UMT: Đại học thực tiễn, sinh viên toàn diện", "14/5/2025", ["https://tuoitre.vn/umt-dai-hoc-thuc-tien-sinh-vien-toan-dien-20250514195604466.htm"]),
    ("tn-hoptac2025", "B", "Thanh Niên", "Trường ĐH Quản lý và Công nghệ TP.HCM và Báo Thanh Niên ký kết hợp tác phát triển nghề nghiệp cho sinh viên", "17/5/2025", ["https://thanhnien.vn/truong-dh-quan-ly-va-cong-nghe-tphcm-va-bao-thanh-nien-ky-ket-hop-tac-phat-trien-nghe-nghiep-cho-sinh-vien-185250517135102512.htm"]),
    ("tt-dinhchi", "B", "Tuổi Trẻ", "UMT tạm đình chỉ công việc TS Nguyễn Trà Giang", "6/1/2025", ["https://tuoitre.vn/umt-tam-dinh-chi-cong-viec-ts-nguyen-tra-giang-20250106203625909.htm"]),
    ("tt-thoiviec", "B", "Tuổi Trẻ", "TS Nguyễn Trà Giang thôi việc tại Trường đại học Quản lý và Công nghệ TP.HCM", "10/2/2025", ["https://tuoitre.vn/ts-nguyen-tra-giang-thoi-viec-tai-truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-20250210181601271.htm"]),
    ("tp-totnghiep", "B", "Tiền Phong", "Hiệu trưởng nhắn nhủ khóa đầu tiên tốt nghiệp: Đừng sợ thất bại, hãy sợ việc không dám bắt đầu", "8/2026", ["https://tienphong.vn/hieu-truong-nhan-nhu-khoa-dau-tien-tot-nghiep-dung-so-that-bai-hay-so-viec-khong-dam-bat-dau-post1870138.tpo"]),
    ("tt-phohieutruong", "B", "Tuổi Trẻ", "Phó hiệu trưởng Trường Đại học UMT: ‘Tư duy khai phóng: Chìa khóa cho hạnh phúc và thành công’", "27/7/2025", ["https://tuoitre.vn/pho-hieu-truong-truong-dai-hoc-umt-tu-duy-khai-phong-chia-khoa-cho-hanh-phuc-va-thanh-cong-2025072721145328.htm"]),
    ("nld-htphong", "B", "Người Lao Động", "PGS-TS Hồ Thanh Phong giữ chức Phó Hiệu trưởng Trường ĐH Quản lý và Công nghệ TP HCM", "4/1/2023", ["https://nld.com.vn/giao-duc-khoa-hoc/pgs-ts-ho-thanh-phong-giu-chuc-pho-hieu-truong-truong-dh-quan-ly-va-cong-nghe-tp-hcm-20230104124254272.htm"]),
    ("gd-buctranh", "B", "Giáo dục Việt Nam (giaoduc.net.vn)", "Bức tranh giáo dục đại học Việt Nam: Từ số lượng trường đến quy mô đào tạo (số liệu HEMIS 30/6/2026)", "2026", ["https://giaoduc.net.vn/buc-tranh-giao-duc-dai-hoc-viet-nam-tu-so-luong-truong-den-quy-mo-dao-tao-post263116.gd"]),
    ("gd247-quymo2024", "B", "Giáo dục 247", "Quy mô giáo dục ĐH tăng mạnh trong năm học qua (số liệu năm 2024)", "2025", ["https://giaoduc247.vn/giao-duc-24h/quy-mo-giao-duc-dh-tang-manh-trong-nam-hoc-qua"]),
    ("vne-2030", "B", "VnExpress", "Tăng 50% số người học đại học vào năm 2030 (Quy hoạch mạng lưới cơ sở GDĐH)", "2025", ["https://vnexpress.net/tang-50-so-nguoi-hoc-dai-hoc-vao-nam-2030-4855509.html"]),
    ("dt-hocphi", "B", "Dân trí", "Học phí các trường đại học ngoài công lập ở TPHCM cao đến mức nào?", "28/8/2026", ["https://dantri.com.vn/giao-duc/hoc-phi-cac-truong-dai-hoc-ngoai-cong-lap-o-tphcm-cao-den-muc-nao-20260828221549900.htm"]),
    ("plo-uef", "B", "Pháp Luật TP.HCM", "Trường đại học ở TP.HCM cam kết không tăng học phí với thí sinh trúng tuyển năm 2026", "2026", ["https://plo.vn/truong-dai-hoc-o-tphcm-cam-ket-khong-tang-hoc-phi-voi-thi-sinh-trung-tuyen-nam-2026-post888342.html"]),
    ("vne-luong", "B", "VnExpress", "Lương, thu nhập giảng viên 8 trường Đại học Quốc gia TP HCM bao nhiêu?", "10/2026", ["https://vnexpress.net/luong-thu-nhap-giang-vien-8-truong-dai-hoc-quoc-gia-tp-hcm-bao-nhieu-5134770.html"]),
    ("plo-luong", "B", "Pháp Luật TP.HCM", "Thu nhập giảng viên 8 trường đại học tại ĐHQG TP.HCM cao bao nhiêu?", "2026", ["https://plo.vn/thu-nhap-giang-vien-8-truong-dai-hoc-tai-dhqg-tphcm-cao-bao-nhieu-post908615.html"]),
    ("gd-tt83", "B", "Giáo dục Việt Nam (giaoduc.net.vn)", "Chuẩn cơ sở giáo dục đại học mới, có hiệu lực từ 15/11/2026", "10/2026", ["https://giaoduc.net.vn/chuan-co-so-giao-duc-dai-hoc-moi-co-hieu-luc-tu-15112026-post263074.gd"]),
    ("sggp-tt83", "B", "Sài Gòn Giải Phóng", "Chuẩn mới của cơ sở giáo dục đại học: Tiêu chí nhiều và cao, khả năng đáp ứng... có hạn!", "10/2026", ["https://www.sggp.org.vn/chuan-moi-cua-co-so-giao-duc-dai-hoc-tieu-chi-nhieu-va-cao-kha-nang-dap-ung-co-han-post876461.html"]),
    ("tn-7314", "B", "Thanh Niên", "Bộ GD-ĐT yêu cầu các trường rà soát để dừng tuyển sinh ngành không đạt chuẩn (Công văn 7314/BGDĐT-GDĐH)", "17/10/2026", ["https://thanhnien.vn/bo-gd-dt-yeu-cau-cac-truong-ra-soat-de-dung-tuyen-sinh-nganh-khong-dat-chuan-185261017100523046.htm"]),
    ("tn-nd361", "B", "Thanh Niên", "Thành lập trường ĐH theo quy định mới cần vốn đầu tư bao nhiêu?", "24/9/2026", ["https://thanhnien.vn/thanh-lap-truong-dh-theo-quy-dinh-moi-can-von-dau-tu-bao-nhieu-185260924140944372.htm"]),
    ("vov-chuyendoi", "B", "VOV", "Luật Giáo dục đại học phải triệt tiêu cơ chế “xin–cho”", "2018", ["https://vov.vn/xa-hoi/giao-duc/luat-giao-duc-dai-hoc-phai-triet-tieu-co-che-xin-cho-post938258.vov"]),
    ("vne-giaithe", "B", "VnExpress", "Có thể giải thể trường đại học không đạt chuẩn", "2024", ["https://vnexpress.net/co-the-giai-the-truong-dai-hoc-khong-dat-chuan-4725429.html"]),
    ("sggp-thuongmai", "B", "Sài Gòn Giải Phóng", "Ngăn chặn thương mại hóa giáo dục đại học ngoài công lập – Bài 1: Lợi nhuận ngàn tỷ, gánh nặng người học", "2023", ["https://www.sggp.org.vn/ngan-chan-thuong-mai-hoa-giao-duc-dai-hoc-ngoai-cong-lap-bai-1-loi-nhuan-ngan-ty-ganh-nang-nguoi-hoc-post715872.html"]),
    ("tt-tannhan", "B", "Tuổi Trẻ", "Nhận bằng đại học, tân cử nhân trao ngay cho em gái để truyền lửa", "22/8/2026", ["https://tuoitre.vn/nhan-bang-dai-hoc-tan-cu-nhan-trao-ngay-cho-em-gai-de-truyen-lua-100260822152940729.htm"]),
    ("htv-phuong", "B", "HTV — Doanh nhân Sài Gòn", "ThS. Huỳnh Thúy Phương, Phó Chủ tịch Hội đồng Trường, Phó Hiệu trưởng Điều hành UMT: “Với tôi, trong giáo dục, phải làm tốt nhất có thể!”", "2025", ["https://htv.vn/doanhnhansaigon/ths-huynh-thuy-phuong-pho-chu-tich-hoi-dong-truong-pho-hieu-truong-dieu-hanh-truong-dai-hoc-quan-ly-va-cong-nghe-tp-hcm-voi-toi-trong-giao-duc-phai-lam-tot-nhat-co-the-319850.html"]),
    ("cv-umt", "C", "CareerViet", "Trang nhà tuyển dụng: Đại học Quản lý và Công nghệ Thành phố Hồ Chí Minh (tin tuyển dụng 2026, lương “cạnh tranh”)", "2026", ["https://careerviet.vn/vi/nha-tuyen-dung/dai-hoc-quan-ly-va-cong-nghe-thanh-pho-ho-chi-minh.35A8DD2A.html"]),
    # --- Aggregators (corroboration only) ---------------------------------
    ("hocmai", "C", "Hướng nghiệp HOCMAI", "Mã trường, thông tin tuyển sinh UMT", "2026", ["https://huongnghiep.hocmai.vn/ma-truong/dai-hoc-quan-ly-va-cong-nghe-tphcm"]),
    ("ts247", "C", "Tuyensinh247", "Thông tin tuyển sinh, đề án và điểm chuẩn UMT", "2026", ["https://diemthi.tuyensinh247.com/thong-tin-dai-hoc-quan-ly-va-cong-nghe-tphcm-UMT.html"]),
    ("edu2r", "C", "Edu2Review", "Đại học UMT 2026: học phí, 10 ngành & đánh giá sinh viên", "2026", ["https://edu2review.com/reviews/truong-dai-hoc-quan-ly-va-cong-nghe-tphcm-umt-ngoi-truong-cua-hanh-phuc-va-thanh-cong-14624.html"]),
    ("edu2r-campus", "C", "Edu2Review", "Học mọi nơi, chơi mọi lúc… tại Trường Đại học chuẩn quốc tế UMT (bài giới thiệu khuôn viên)", "2022", ["https://edu2review.com/reviews/hoc-moi-noi-choi-moi-luc-song-ao-moi-ngoc-ngach-tai-truong-dai-hoc-chuan-quoc-te-umt-14675.html"]),
    ("trangedu", "C", "Trangedu", "Trường Đại học Quản lý và Công nghệ TPHCM — địa chỉ các cơ sở (thông tin 2022)", "2022", ["https://trangedu.com/truong/dai-hoc-quan-ly-va-cong-nghe-tp-hcm/"]),
    ("hnv2024", "C", "Hướng nghiệp Việt", "Điểm chuẩn năm 2024 — UMT", "2024", ["https://huongnghiepviet.com/tuyen-sinh/diem-chuan/diem-chuan-nam-2024-umt-truong-dai-hoc-quan-ly-va-cong-nghe-tphcm"]),
    ("tlm-hocphi", "C", "Tailieumoi", "Học phí Đại học Quản lý và Công nghệ TP HCM năm 2023–2024 (mức dự kiến khóa 2022)", "2023", ["https://tailieumoi.vn/bai-viet/62913/hoc-phi-dai-hoc-quan-ly-va-cong-nghe-tp-hcm-nam-2023-2024-moi-nhat"]),
]

REF_INDEX = {}
for i, ref in enumerate(REFS, start=1):
    if ref[0] in REF_INDEX:
        sys.exit(f"duplicate ref key {ref[0]}")
    REF_INDEX[ref[0]] = i

TIER_LABEL = {"A": "Chính thức", "B": "Báo chí / pháp lý", "C": "Tổng hợp"}


def esc(s):
    return html.escape(str(s), quote=True)


def vn(n, digits=0):
    """Vietnamese number format: 16.884 / 13,0"""
    s = f"{n:,.{digits}f}"
    return s.replace(",", "§").replace(".", ",").replace("§", ".")


# ---------------------------------------------------------------------------
# Citations
# ---------------------------------------------------------------------------
used_refs = set()


def cite(match):
    keys = [k.strip() for k in match.group(1).split(",") if k.strip()]
    links = []
    for k in keys:
        if k not in REF_INDEX:
            sys.exit(f"unknown citation key: {k}")
        used_refs.add(k)
        n = REF_INDEX[k]
        links.append(f'<a href="#r{n}" aria-label="Nguồn {n}">{n}</a>')
    return '<sup class="ref">[' + ", ".join(links) + "]</sup>"


def render_refs():
    groups = [
        ("A", "Nguồn chính thức: UMT, cổng thông tin Chính phủ, văn bản pháp luật"),
        ("B", "Báo chí chính thống và dịch vụ thông tin pháp lý, thị trường"),
        ("C", "Trang tổng hợp (chỉ dùng để đối chiếu)"),
    ]
    out = []
    for tier, title in groups:
        out.append(f'<h3 class="ref-group"><span class="tier t{tier}">{tier}</span> {esc(title)}</h3>')
        out.append('<ol class="refs">')
        for i, (key, t, pub, ttl, date, urls) in enumerate(REFS, start=1):
            if t != tier:
                continue
            links = " · ".join(
                f'<a href="{esc(u)}" target="_blank" rel="noopener">{esc(u.replace("https://", ""))}</a>'
                for u in urls
            )
            out.append(
                f'<li id="r{i}" value="{i}"><span class="ref-pub">{esc(pub)}</span> — {esc(ttl)} '
                f'<span class="ref-date">({esc(date)})</span><br><span class="ref-url">{links}</span></li>'
            )
        out.append("</ol>")
    return "\n".join(out)


# ---------------------------------------------------------------------------
# Charts as responsive HTML/CSS. Every mark is placed on one linear scale
# (percent of the axis maximum); colours come from CSS tokens so both
# themes work; labels wrap on phones instead of being clipped.
# ---------------------------------------------------------------------------
def pct(v, vmax):
    return f"{100.0 * v / vmax:.3f}%"


def axis_html(ticks, vmax, unit, fmt=None):
    fmt = fmt or (lambda t: vn(t))
    spans = "".join(f'<span style="left:{pct(t, vmax)}">{esc(fmt(t))}</span>' for t in ticks)
    out = f'<div class="hb-axis" aria-hidden="true">{spans}</div>'
    if unit:
        out += f'<div class="hb-unit" aria-hidden="true">Đơn vị: {esc(unit)}</div>'
    return out


def chart_hbar(rows, vmax, ticks, unit, label):
    """Label-above-bar horizontal bars, one series (emphasis via 'mute')."""
    n = len(ticks) - 1
    out = [f'<div class="hb" role="img" aria-label="{esc(label)}" style="--n:{n}">']
    for r in rows:
        cls = "hb-bar" + (" mute" if r.get("mute") else "")
        vtxt = r.get("vtxt") or vn(r["value"])
        tip = r.get("tip") or f'{r["label"]}: {vtxt}'
        out.append(
            f'<div class="hb-row" tabindex="0" data-tip="{esc(tip)}">'
            f'<div class="hb-lbl">{esc(r["label"])}</div>'
            f'<div class="hb-plot"><div class="{cls}" style="width:{pct(r["value"], vmax)}"></div>'
            f'<span class="hb-val" style="left:{pct(r["value"], vmax)}">{esc(vtxt)}</span></div></div>'
        )
    out.append(axis_html(ticks, vmax, unit))
    out.append("</div>")
    return "".join(out)


def chart_ranges(rows, vmax, ticks, unit, label):
    """Range / dot plot, one series; UMT rows emphasised, peers muted."""
    n = len(ticks) - 1
    out = [f'<div class="hb" role="img" aria-label="{esc(label)}" style="--n:{n}">']
    for r in rows:
        emph = " emph" if r.get("emph") else ""
        parts = [f'<div class="hb-row" tabindex="0" data-tip="{esc(r["tip"])}">',
                 f'<div class="hb-lbl">{esc(r["label"])}</div><div class="hb-plot bare">']
        if r["hi"] > r["lo"]:
            parts.append(f'<div class="hb-range{emph}" style="left:{pct(r["lo"], vmax)};width:{pct(r["hi"] - r["lo"], vmax)}"></div>')
            parts.append(f'<div class="hb-dot{emph}" style="left:{pct(r["lo"], vmax)}"></div>')
        parts.append(f'<div class="hb-dot{emph}" style="left:{pct(r["hi"], vmax)}"></div>')
        parts.append(f'<span class="hb-val dotval" style="left:{pct(r["hi"], vmax)}">{esc(r["vtxt"])}</span></div></div>')
        out.append("".join(parts))
    out.append(axis_html(ticks, vmax, unit))
    out.append("</div>")
    return "".join(out)


def chart_quota(label):
    """Admission quota by year (columns) against total enrolment (reference line)."""
    years = [
        ("2022", 600, None, "2022: chỉ tiêu 600 (khóa 1, 6 ngành)"),
        ("2023", 855, None, "2023: chỉ tiêu 855 (7 ngành)"),
        ("2024", None, None, "2024: không tìm thấy số chỉ tiêu công bố trực tiếp"),
        ("2025", 710, 1000, "2025: 710 theo Cổng Xây dựng chính sách; Cổng TTĐT TP.HCM ghi 1.000"),
        ("2026", None, None, "2026: chưa tìm thấy tổng chỉ tiêu; xét tuyển bổ sung hơn 400 chỉ tiêu (9/2026)"),
    ]
    vmax = 1000
    grid = "".join(
        f'<div class="vc-grid" style="bottom:{pct(t, vmax)}"><span>{esc(vn(t))}</span></div>' for t in (0, 250, 500, 750, 1000)
    )
    cols = []
    for yr, v, alt, tip in years:
        inner = ""
        if v is None:
            inner = '<span class="vc-na">không công bố</span>'
        else:
            inner = f'<div class="vc-bar" style="height:{pct(v, vmax)}"></div>'
            if alt:
                inner += (f'<div class="vc-whisker" style="bottom:{pct(v, vmax)};height:{pct(alt - v, vmax)}"></div>'
                          f'<span class="vc-alt" style="bottom:{pct(alt, vmax)}">{esc(vn(alt))}</span>')
                inner += f'<span class="vc-val side" style="bottom:{pct(v, vmax)}">{esc(vn(v))}</span>'
            else:
                inner += f'<span class="vc-val" style="bottom:{pct(v, vmax)}">{esc(vn(v))}</span>'
        cols.append(f'<div class="vc-col" tabindex="0" data-tip="{esc(tip)}">{inner}</div>')
    xlabels = "".join(f"<span>{yr}</span>" for yr, *_ in years)
    ref = f'<div class="vc-ref" style="bottom:{pct(700, vmax)}"><span>≈ 700</span></div>'
    return (
        f'<div class="vc" role="img" aria-label="{esc(label)}">'
        f'<div class="vc-plot">{grid}{ref}<div class="vc-cols">{"".join(cols)}</div></div>'
        f'<div class="vc-x" aria-hidden="true">{xlabels}</div>'
        '<div class="legend-row" aria-hidden="true">'
        '<span><i style="background:var(--viz-1)"></i>Chỉ tiêu tuyển sinh năm</span>'
        '<span><i class="key-line"></i>Tổng sinh viên toàn trường (4 khóa, 11/2025) ≈ 700</span>'
        '<span><i class="key-whisker"></i>Số liệu của nguồn khác (2025)</span></div>'
        "</div>"
    )


def chart_faculty(label):
    """100% stacked bar (ordinal PGS.TS > TS > ThS) and PhD-share meter."""
    segs = [("PGS.TS", 1, "o1"), ("Tiến sĩ", 5, "o2"), ("Thạc sĩ", 40, "o3")]
    total = sum(s[1] for s in segs)
    bars = "".join(
        f'<div class="st-seg {cls}" style="width:{pct(n, total)}" tabindex="0" data-tip="{esc(f"{name}: {n} người ({vn(100 * n / total, 1)}%)")}"></div>'
        for name, n, cls in segs
    )
    legend = "".join(
        f'<span><i class="st-key {cls}"></i>{esc(name)}: {n} ({vn(100 * n / total, 1)}%)</span>' for name, n, cls in segs
    )
    share = 100 * 6 / 46
    vmax = 40
    meter = (
        f'<div class="mt" tabindex="0" data-tip="{esc("Khoa Công nghệ: 6/46 = " + vn(share, 1) + "% · ngưỡng ≥ 20%, từ 2030 ≥ 30%")}">'
        f'<div class="mt-track"><div class="mt-bar" style="width:{pct(share, vmax)}"></div>'
        f'<span class="mt-val" style="left:{pct(share, vmax)}">{vn(share, 1)}%</span>'
        f'<i class="mt-mark" style="left:{pct(20, vmax)}"></i><i class="mt-mark" style="left:{pct(30, vmax)}"></i></div>'
        f'<div class="mt-labels" aria-hidden="true"><span style="left:0">0%</span>'
        f'<span style="left:{pct(20, vmax)}">Ngưỡng 20%</span><span style="left:{pct(30, vmax)}">Từ 2030: 30%</span>'
        f'<span class="end" style="left:100%">40%</span></div></div>'
    )
    return (
        f'<div class="fx" role="img" aria-label="{esc(label)}">'
        '<div class="hb-lbl">Cơ cấu 46 cán bộ, giảng viên cơ hữu Khoa Công nghệ (11/2025)</div>'
        f'<div class="st">{bars}</div><div class="legend-row">{legend}</div>'
        '<div class="hb-lbl gap">Tỷ lệ giảng viên có trình độ tiến sĩ (tính cả PGS.TS) so với ngưỡng Chuẩn cơ sở GDĐH</div>'
        f"{meter}</div>"
    )


# ---------------------------------------------------------------------------
# Data behind the charts
# ---------------------------------------------------------------------------
LAND = 80092
GFA = 16884
STUDENTS = 700
STAFF = 259


def cap(area, per):
    """Whole learners that fit under a per-learner area floor."""
    return int(area // per)


def build_charts():
    charts = {}
    charts["CHART_QUOTA"] = chart_quota(
        "Chỉ tiêu tuyển sinh theo năm so với tổng số sinh viên toàn trường khoảng 700 vào 11/2025"
    )
    charts["CHART_CAPACITY"] = chart_hbar(
        [
            {"label": "Mục tiêu công bố khi ra mắt (11/2021): hơn 10.000 sinh viên vào năm 2030", "value": 10000, "mute": True, "vtxt": "> 10.000",
             "tip": "Báo chí ngày ra mắt 24/11/2021: dự kiến hơn 10.000 sinh viên vào năm 2030"},
            {"label": "Trần theo chuẩn sàn: 16.884 m² Tòa nhà Sáng tạo ÷ 2,8 m²/người học", "value": cap(GFA, 2.8), "mute": True,
             "tip": f"Phân tích: 16.884 ÷ 2,8 = {vn(cap(GFA, 2.8))} người học (TT 01/2024)"},
            {"label": "Trần theo chuẩn đất từ 2030: 80.092 m² ÷ 25 m²/người học", "value": cap(LAND, 25), "mute": True,
             "tip": f"Phân tích: 80.092 ÷ 25 = {vn(cap(LAND, 25))} người học (TT 83/2026)"},
            {"label": "Quy mô ổn định theo quy hoạch, sau 10 năm (đề án 2025)", "value": 3200, "mute": True,
             "tip": "Đề án mở ngành ATTT: quy mô đào tạo ổn định 3.200 sinh viên"},
            {"label": "Trần nếu chỉ tính 2.900 m² sàn trực tiếp đào tạo (một cơ sở, cần làm rõ)", "value": cap(2900, 2.8), "mute": True,
             "tip": f"Phân tích: 2.900 ÷ 2,8 = {vn(cap(2900, 2.8))} người học; đề án ATTT ghi 2.900 m² sàn trực tiếp phục vụ đào tạo tại một cơ sở"},
            {"label": "Sinh viên đang theo học (11/2025)", "value": STUDENTS, "vtxt": "≈ 700",
             "tip": "Đề án mở ngành ATTT: tổng số sinh viên đang theo học gần 700 (4 khóa, 9 ngành)"},
        ],
        vmax=10000, ticks=[0, 2500, 5000, 7500, 10000], unit="người học",
        label="Mục tiêu quy mô, giới hạn theo chuẩn và số sinh viên hiện có",
    )
    charts["CHART_SCHOLAR"] = chart_hbar(
        [
            {"label": "Global · 15 suất · học bạ từ 25,5", "value": 100, "vtxt": "100%", "tip": "Global: 100% học phí toàn khóa · 15 suất · học bạ ≥ 25,5"},
            {"label": "Unique · 30 suất · từ 218 triệu đồng · học bạ từ 24,5", "value": 60, "vtxt": "60%", "tip": "Unique: 60% học phí toàn khóa (từ 218 triệu đồng) · 30 suất · học bạ ≥ 24,5"},
            {"label": "Liberal · 200 suất · từ 174 triệu đồng · học bạ từ 22,5", "value": 48, "vtxt": "48%", "tip": "Liberal: 48% học phí toàn khóa (từ 174 triệu đồng) · 200 suất · học bạ ≥ 22,5"},
            {"label": "Future · 455 suất · từ 109 triệu đồng · học bạ từ 21", "value": 30, "vtxt": "30%", "tip": "Future: 30% học phí toàn khóa (từ 109 triệu đồng) · 455 suất · học bạ ≥ 21"},
            {"label": "Mức tối thiểu cho mọi tân sinh viên nhập học · 90 triệu đồng", "value": 24.8, "mute": True, "vtxt": "≈ 25%",
             "tip": "Phân tích: 90 triệu ÷ 363 triệu ≈ 24,8% học phí niêm yết toàn khóa"},
        ],
        vmax=100, ticks=[0, 25, 50, 75, 100], unit="% học phí toàn khóa",
        label="Các hạng học bổng tuyển sinh 2026 theo tỷ lệ học phí toàn khóa",
    )
    usd = 25634
    krw = 18.47

    def tip_money(name, lo, hi):
        return (f"{name}: {vn(lo)}–{vn(hi)} triệu đồng/năm "
                f"(≈ {vn(lo * 1e6 / usd)}–{vn(hi * 1e6 / usd)} USD; ≈ {vn(lo * 1e6 / krw)}–{vn(hi * 1e6 / krw)} KRW)")

    charts["CHART_TUITION"] = chart_ranges(
        [
            {"label": "UMT — niêm yết (suy ra từ giá trị học bổng 2026)", "lo": 103.8, "hi": 103.8, "emph": True,
             "vtxt": "≈ 103,8", "tip": "UMT niêm yết ≈ 363 triệu/toàn khóa 3,5 năm ≈ 103,8 triệu/năm ≈ 4.050 USD/năm"},
            {"label": "UMT — sau học bổng tối thiểu 90 triệu", "lo": 78.0, "hi": 78.0, "emph": True,
             "vtxt": "≈ 78,0", "tip": "UMT sau học bổng tối thiểu: (363 − 90) ÷ 3,5 ≈ 78 triệu/năm ≈ 3.040 USD/năm"},
            {"label": "UEF — Kinh tế – Tài chính TP.HCM (2026)", "lo": 80, "hi": 88, "vtxt": "80–88", "tip": tip_money("UEF", 80, 88)},
            {"label": "Hoa Sen (2026)", "lo": 45, "hi": 85, "vtxt": "45–85", "tip": tip_money("Hoa Sen", 45, 85)},
        ],
        vmax=120, ticks=[0, 30, 60, 90, 120], unit="triệu đồng/năm",
        label="Học phí năm: UMT so với một số trường tư thục tại TP.HCM",
    )
    charts["CHART_FACULTY"] = chart_faculty("Cơ cấu trình độ Khoa Công nghệ và tỷ lệ tiến sĩ so với ngưỡng chuẩn")
    return charts


def heat_table(row_vals, col_vals, fn, row_label, col_label, caption_id, fmt_digits=1, bins=None):
    """HTML heat table on a one-hue sequential ramp (CSS classes s1..s6)."""
    values = [fn(r, c) for r in row_vals for c in col_vals]
    lo, hi = min(values), max(values)
    def step(v):
        if hi == lo:
            return 3
        return 1 + int(round(5 * (v - lo) / (hi - lo)))
    out = [f'<table class="tbl heat" aria-describedby="{caption_id}"><thead><tr><th scope="col">{esc(row_label)} \\ {esc(col_label)}</th>']
    for c in col_vals:
        out.append(f'<th scope="col" class="num">{esc(c[1])}</th>')
    out.append("</tr></thead><tbody>")
    for r in row_vals:
        out.append(f'<tr><th scope="row">{esc(r[1])}</th>')
        for c in col_vals:
            v = fn(r, c)
            out.append(f'<td class="num s{step(v)}" tabindex="0" data-tip="{esc(r[1] + " × " + c[1] + " = " + vn(v, fmt_digits) + " tỷ đồng")}">{vn(v, fmt_digits)}</td>')
        out.append("</tr>")
    out.append("</tbody></table>")
    return "".join(out)


def build_tables():
    t = {}
    t["TABLE_REVENUE"] = heat_table(
        [(700, "≈ 700 SV (hiện tại)"), (1500, "1.500 SV"), (2500, "2.500 SV"), (3200, "3.200 SV (quy hoạch)")],
        [(78, "78 tr.đ/năm"), (90, "90 tr.đ/năm"), (104, "104 tr.đ/năm")],
        lambda r, c: r[0] * c[0] / 1000.0,
        "Số sinh viên", "Học phí thực thu bình quân", "cap-rev",
    )
    t["TABLE_STAFFCOST"] = heat_table(
        [(STAFF, "259 nhân sự cơ hữu")],
        [(15, "15 tr.đ/tháng"), (20, "20 tr.đ/tháng"), (25, "25 tr.đ/tháng")],
        lambda r, c: r[0] * c[0] * 12 / 1000.0,
        "Nhân sự", "Chi phí bình quân/người/tháng", "cap-staff",
    )
    return t


def main():
    src = TEMPLATE.read_text(encoding="utf-8")
    charts = build_charts()
    tables = build_tables()
    for k, v in {**charts, **tables}.items():
        token = "{{" + k + "}}"
        if token not in src:
            sys.exit(f"placeholder missing in template: {token}")
        src = src.replace(token, v)
    src = re.sub(r"\[\[([a-z0-9,\s\-]+)\]\]", cite, src)
    src = src.replace("{{REFERENCES}}", render_refs())
    src = src.replace("{{REF_COUNT}}", str(len(REFS)))
    left = re.findall(r"\{\{[A-Z_]+\}\}", src)
    if left:
        sys.exit(f"unfilled placeholders: {left}")
    unused = [r[0] for r in REFS if r[0] not in used_refs]
    if unused:
        print("WARNING: references never cited:", ", ".join(unused))
    fragment = None
    if "--fragment" in sys.argv:
        fragment = Path(sys.argv[sys.argv.index("--fragment") + 1]).resolve()
        fragment.parent.mkdir(parents=True, exist_ok=True)
        fragment.write_text(src, encoding="utf-8")
    standalone = (
        "<!doctype html>\n<html lang=\"vi\">\n<head>\n<meta charset=\"utf-8\">\n"
        "<meta name=\"viewport\" content=\"width=device-width, initial-scale=1, viewport-fit=cover\">\n"
        "</head>\n<body>\n" + src + "\n</body>\n</html>\n"
    )
    OUT_STANDALONE.write_text(standalone, encoding="utf-8")
    print(f"refs: {len(REFS)} total, {len(used_refs)} cited")
    if fragment:
        print(f"wrote {fragment} ({fragment.stat().st_size:,} bytes)")
    print(f"wrote {OUT_STANDALONE} ({OUT_STANDALONE.stat().st_size:,} bytes)")


if __name__ == "__main__":
    main()
