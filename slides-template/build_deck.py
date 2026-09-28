"""
Build the "Aurora" report template deck.

    python build_deck.py                 # both colour themes
    python build_deck.py --theme aurora  # one theme

Content lives in CONTENT below — edit the text/numbers/images and rebuild.
Photos: assets/images/src/<id>.jpg (Open Images, CC BY 2.0 — see assets/images/credits.csv)
Cut-outs (background removed): assets/images/cut/*.png
"""
import argparse
import csv
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

from PIL import Image, ImageEnhance, ImageFilter  # noqa: E402

import pptkit as K  # noqa: E402
import layouts as L  # noqa: E402

SRC = os.path.join(HERE, 'assets', 'images', 'src')
CUT = os.path.join(HERE, 'assets', 'images', 'cut')
BUILD = os.path.join(HERE, 'assets', 'images', 'build')

# ------------------------------------------------------------------ image roles
PHOTOS = {
    'cover_bg': '5199900d2f1b2be2',       # night city aerial (hero frame)
    'desk_calc': '00be189ddee94ecc',
    'magnifier': '883cc4f6d6587b2d',
    'tablet': 'd6fb311b2d7b4572',
    'darts': 'd89e123ddd967671',
    'subj1': '71c4e12b3e9dc7ee',
    'subj2': '0e15ae93621e4b12',
    'subj3': '05b5f2ace53df30e',
    'city_night': 'ce54cf870cea336a',
    'city_day': '394161d072604c3f',
    'team_data': '93ef8ab5b8aa1ccc',
    'laptop_man': '4eeae6a9e029a07b',
    'meeting': '63e6d6cf636c9aee',
    'calc2': '3e3d48572cd5d62f',
    'present1': '124d86a6d3953a13',
    'present2': '216f77a3366db4d1',
    'poster': 'a5510558f0dc5589',
    'waterfront': 'd3117ca8a572e3ea',
    'tower': '0f9f66a924b55725',
}
CUTOUTS = {'cover_person': 'cover_person.png', 'team_pair': 'team_pair.png', 'dartboard': 'dartboard.png'}


def prepare_images(theme):
    """Theme-aware derivatives: tinted hero photo, blurred full-bleed backgrounds."""
    out = os.path.join(BUILD, theme)
    os.makedirs(out, exist_ok=True)
    T = K.THEMES[theme]
    paths = {k: os.path.join(SRC, v + '.jpg') for k, v in PHOTOS.items()}
    paths.update({k: os.path.join(CUT, v) for k, v in CUTOUTS.items()})

    def src(key):
        return Image.open(paths[key]).convert('RGB')

    def crop169(im, focus=(0.5, 0.5)):
        W, H = im.size
        r = K.SW / K.SH
        if W / H > r:
            cw, ch = H * r, H
        else:
            cw, ch = W, W / r
        cx = min(max(focus[0] * W, cw / 2), W - cw / 2)
        cy = min(max(focus[1] * H, ch / 2), H - ch / 2)
        return im.crop((int(cx - cw / 2), int(cy - ch / 2), int(cx + cw / 2), int(cy + ch / 2)))

    def tint(im, amt):
        t = Image.new('RGB', im.size, '#' + T['tint'])
        return Image.blend(im, t, amt)

    # hero frame photo: gentle blur so the cut-out pops; lime theme gets a green cast
    im = src('cover_bg').filter(ImageFilter.GaussianBlur(1.2))
    if theme == 'lime':
        im = ImageEnhance.Color(im).enhance(0.35)
        im = tint(im, 0.35)
    p = os.path.join(out, 'cover_bg.jpg'); im.save(p, quality=90); paths['cover_bg'] = p
    # full-bleed + frosted version for the proposal slide
    im = crop169(src('waterfront'), (0.45, 0.5))
    if theme == 'lime':
        im = tint(ImageEnhance.Color(im).enhance(0.5), 0.25)
    p = os.path.join(out, 'proposal_bg.jpg'); im.save(p, quality=90); paths['proposal_bg'] = p
    b = im.filter(ImageFilter.GaussianBlur(26))
    b = ImageEnhance.Brightness(b).enhance(1.1)
    p = os.path.join(out, 'proposal_blur.jpg'); b.save(p, quality=88); paths['proposal_blur'] = p
    # blurred background for the gallery slide
    im = crop169(src('meeting')).filter(ImageFilter.GaussianBlur(9))
    p = os.path.join(out, 'gallery_bg.jpg'); im.save(p, quality=85); paths['gallery_bg'] = p
    sizes = {k: Image.open(paths[k]).size for k in CUTOUTS}
    return paths, sizes


# ------------------------------------------------------------------ content
SECTIONS = [
    ('Giới thiệu đề tài', 'Bối cảnh, lý do chọn đề tài, mục tiêu – đối tượng – phạm vi và phương pháp nghiên cứu.'),
    ('Mô hình giải pháp', 'Các infographic trình bày mục tiêu chiến lược, quy trình, ma trận năng lực và lộ trình.'),
    ('Phân tích số liệu', 'Biểu đồ cột, thanh ngang, đường và biểu đồ tròn cho các chỉ số chính.'),
    ('Kết quả khảo sát', 'Những con số nổi bật, bảng số liệu tổng hợp và hình ảnh khảo sát thực tế.'),
    ('Phân tích SWOT', 'Điểm mạnh, điểm yếu, cơ hội và thách thức khi triển khai chuyển đổi số.'),
    ('Dashboard tổng hợp', 'Toàn cảnh các chỉ số vận hành trên một màn hình duy nhất.'),
    ('Kết luận & đề xuất', 'Tóm tắt kết quả nghiên cứu và các kiến nghị cho doanh nghiệp.'),
]


def build_content():
    sec = lambda i: dict(num=i, title=SECTIONS[i - 1][0], desc=SECTIONS[i - 1][1])  # noqa: E731
    return [
        (L.cover, dict(
            school='TRƯỜNG ĐẠI HỌC ABC', faculty='Khoa Quản trị Kinh doanh',
            tag='BÁO CÁO CHUYÊN ĐỀ', title1='CHUYỂN ĐỔI SỐ', title2='CHO DOANH NGHIỆP SME',
            subtitle='Thực trạng, giải pháp và lộ trình ứng dụng công nghệ số tại doanh nghiệp vừa và nhỏ ở Việt Nam',
            info=[('Giảng viên hướng dẫn', 'ThS. Nguyễn Văn A'), ('Nhóm thực hiện', 'Nhóm 05 – Lớp QT47'),
                  ('Thời gian', 'Học kỳ I, 2026')],
            chip_value='+32%', chip_label='Năng suất sau số hóa')),
        (L.agenda, dict(title='NỘI DUNG', vertical='TRÌNH BÀY', items=[s[0] for s in SECTIONS],
                        cap1='07 PHẦN', cap2='Thời lượng trình bày khoảng 15 phút')),

        (L.section, sec(1)),
        (L.overview, dict(
            title='TỔNG QUAN ĐỀ TÀI', sub='Lý do chọn đề tài',
            reasons=[('Lý do 01', 'Doanh nghiệp vừa và nhỏ chiếm tỷ trọng lớn trong nền kinh tế nhưng mức độ ứng dụng công nghệ số còn thấp.'),
                     ('Lý do 02', 'Chi phí vận hành tăng, cạnh tranh gay gắt buộc doanh nghiệp phải tối ưu quy trình bằng dữ liệu.'),
                     ('Lý do 03', 'Nhiều chương trình hỗ trợ chuyển đổi số được triển khai nhưng doanh nghiệp chưa biết bắt đầu từ đâu.')],
            images=['desk_calc', 'magnifier', 'tablet'])),
        (L.objectives, dict(
            title='MỤC TIÊU NGHIÊN CỨU', general_label='Mục tiêu tổng quát',
            general='Đánh giá thực trạng chuyển đổi số tại doanh nghiệp SME.\nXác định rào cản chính về nguồn lực, chi phí và con người.\nĐề xuất lộ trình triển khai phù hợp, khả thi.',
            image='darts', specific_label='Mục tiêu cụ thể',
            specific=[('Mục tiêu 01', 'Khảo sát mức độ ứng dụng các công cụ số (ERP, CRM, kế toán điện tử, TMĐT).'),
                      ('Mục tiêu 02', 'Đo lường hiệu quả vận hành trước và sau khi số hóa quy trình cốt lõi.'),
                      ('Mục tiêu 03', 'Xây dựng bộ khuyến nghị theo 3 giai đoạn: nền tảng – tăng tốc – bứt phá.')])),
        (L.subjects, dict(
            title='ĐỐI TƯỢNG & PHẠM VI', left_title='Đối tượng khảo sát', right_title='Phạm vi nghiên cứu',
            subjects=[('NHÓM 01', [('Vai trò', 'Chủ doanh nghiệp'), ('Quy mô', '10 – 49 lao động'), ('Số phiếu', '120')], 'subj1'),
                      ('NHÓM 02', [('Vai trò', 'Trưởng bộ phận'), ('Quy mô', '50 – 99 lao động'), ('Số phiếu', '118')], 'subj2'),
                      ('NHÓM 03', [('Vai trò', 'Nhân viên vận hành'), ('Quy mô', '100 – 200 lao động'), ('Số phiếu', '80')], 'subj3')],
            scope_images=['city_night', 'city_day'],
            scope=[('Không gian', 'Hà Nội, TP. Hồ Chí Minh và Đà Nẵng\nLĩnh vực: thương mại, dịch vụ, sản xuất nhẹ'),
                   ('Thời gian', 'Dữ liệu thứ cấp giai đoạn 2021 – 2025\nKhảo sát sơ cấp: tháng 3 – tháng 6/2026')])),
        (L.methods, dict(
            title='PHƯƠNG PHÁP NGHIÊN CỨU',
            intro='Nghiên cứu kết hợp phương pháp định tính và định lượng, dữ liệu được thu thập từ khảo sát trực tiếp, phỏng vấn chuyên gia và báo cáo ngành.',
            image='team_data',
            methods=[('clipboard-list', 'Khảo sát bảng hỏi', 'Thu thập 318 phiếu hợp lệ từ doanh nghiệp SME, thang đo Likert 5 mức độ.'),
                     ('messages-square', 'Phỏng vấn chuyên sâu', 'Phỏng vấn 12 chuyên gia và chủ doanh nghiệp để làm rõ rào cản thực tế.'),
                     ('chart-line', 'Phân tích dữ liệu', 'Thống kê mô tả, kiểm định độ tin cậy và hồi quy đa biến trên SPSS.')])),

        (L.section, sec(2)),
        (L.target, dict(
            title='MỤC TIÊU CHIẾN LƯỢC', subtitle='Tập trung nguồn lực vào đúng điểm tạo ra giá trị lớn nhất',
            left='Tăng 30% năng suất vận hành sau 24 tháng triển khai', left_tag='Chỉ tiêu trọng tâm',
            right_tag='TỔNG QUAN', right='Số hóa quy trình bán hàng, kho và kế toán trước; sau đó mở rộng sang quản trị nhân sự và chăm sóc khách hàng.',
            note='Ưu tiên giải pháp điện toán đám mây để giảm chi phí đầu tư ban đầu.')),
        (L.cycle, dict(
            title='QUY TRÌNH 3 BƯỚC', subtitle='Vòng lặp cải tiến liên tục cho doanh nghiệp SME',
            steps=[('Đánh giá hiện trạng', 'Đo mức độ trưởng thành số, xác định quy trình tốn nhiều thời gian nhất.'),
                   ('Triển khai thí điểm', 'Chọn 1 – 2 quy trình, áp dụng công cụ số và đo lường kết quả trong 3 tháng.'),
                   ('Nhân rộng & tối ưu', 'Chuẩn hóa, đào tạo nhân sự và mở rộng sang các bộ phận khác.')])),
        (L.blocks4, dict(
            title='MA TRẬN NĂNG LỰC SỐ',
            blocks=[('star', 'Điểm mạnh\ncốt lõi'), ('circle-help', 'Thách thức\nhiện tại'), ('settings', 'Phương pháp\nthực hiện'),
                    ('chart-column', 'Định hướng\nphát triển')],
            notes=[('Nội dung 01', 'Đội ngũ trẻ, thích ứng nhanh với công cụ mới.'),
                   ('Nội dung 02', 'Thiếu dữ liệu tập trung, quy trình còn thủ công.'),
                   ('Nội dung 03', 'Triển khai theo giai đoạn, đo lường bằng KPI.'),
                   ('Nội dung 04', 'Hướng tới vận hành dựa trên dữ liệu thời gian thực.')])),
        (L.pyramid, dict(
            title='5 CẤP ĐỘ TRƯỞNG THÀNH SỐ',
            levels=[('trophy', 'Cấp 5 · Dẫn dắt', 'Mô hình kinh doanh mới dựa trên dữ liệu và nền tảng số.'),
                    ('star', 'Cấp 4 · Tối ưu', 'Tự động hóa, phân tích dự báo hỗ trợ ra quyết định.'),
                    ('chart-column', 'Cấp 3 · Kết nối', 'Hệ thống liên thông giữa bán hàng, kho và tài chính.'),
                    ('settings', 'Cấp 2 · Số hóa', 'Các quy trình chính được đưa lên phần mềm riêng lẻ.'),
                    ('users', 'Cấp 1 · Khởi động', 'Làm việc thủ công, dữ liệu phân tán trên giấy và Excel.')])),
        (L.hub, dict(
            title='HỆ SINH THÁI GIẢI PHÁP', center='NỀN TẢNG\nSỐ HÓA',
            items=[('target', 'Bán hàng đa kênh', 'Website, sàn TMĐT và mạng xã hội trên một hệ thống.'),
                   ('lightbulb', 'Quản trị kho', 'Theo dõi tồn kho thời gian thực, cảnh báo tự động.'),
                   ('file-text', 'Kế toán điện tử', 'Hóa đơn điện tử, báo cáo thuế và dòng tiền.'),
                   ('users', 'Nhân sự – tiền lương', 'Chấm công, KPI và bảng lương tự động.'),
                   ('globe', 'Chăm sóc khách hàng', 'CRM lưu lịch sử mua hàng, cá nhân hóa ưu đãi.'),
                   ('shield-check', 'An toàn dữ liệu', 'Sao lưu đám mây, phân quyền và bảo mật.')])),
        (L.process, dict(
            title='LỘ TRÌNH TRIỂN KHAI 7 BƯỚC', subtitle='Kế hoạch 18 tháng, mỗi bước đều có đầu ra đo lường được',
            steps=[('Khảo sát', 'Đánh giá hiện trạng và xác định ưu tiên.', 'Tháng 1'),
                   ('Lập kế hoạch', 'Chọn giải pháp, ngân sách và nhân sự.', 'Tháng 2'),
                   ('Chuẩn hóa', 'Chuẩn hóa dữ liệu và quy trình đầu vào.', 'Tháng 3–4'),
                   ('Thí điểm', 'Triển khai tại một bộ phận.', 'Tháng 5–7'),
                   ('Đào tạo', 'Đào tạo người dùng, cập nhật tài liệu.', 'Tháng 8–9'),
                   ('Mở rộng', 'Nhân rộng ra toàn doanh nghiệp.', 'Tháng 10–14'),
                   ('Đánh giá', 'Đo KPI, cải tiến giai đoạn tiếp theo.', 'Tháng 15–18')],
            facts=[('calendar-days', 'Tổng thời gian', '18 tháng'), ('wallet', 'Ngân sách dự kiến', '4,2 tỷ đồng'),
                   ('users', 'Nhân sự nòng cốt', '06 người')])),

        (L.section, sec(3)),
        (L.chart_columns, dict(
            title='HIỆU QUẢ VẬN HÀNH THEO QUÝ',
            notes=[('Nhận xét 01', 'Doanh thu tăng đều qua các quý, đặc biệt quý IV nhờ kênh bán hàng trực tuyến đi vào ổn định.'),
                   ('Nhận xét 02', 'Chi phí vận hành giảm từ quý III khi quy trình kho và kế toán được tự động hóa.')],
            kpis=[('Doanh thu', '31K', '20% so với cùng kỳ', True), ('Chi phí', '18K', '12% so với cùng kỳ', False),
                  ('Lợi nhuận', '13K', '26% so với cùng kỳ', True)],
            cats=['Quý I', 'Quý II', 'Quý III', 'Quý IV'],
            series=[('Doanh thu', [4.3, 5.1, 6.4, 7.6]), ('Chi phí', [3.6, 3.9, 3.4, 3.2]), ('Lợi nhuận', [0.7, 1.2, 3.0, 4.4])])),
        (L.chart_bars, dict(
            title='MỨC ĐỘ ỨNG DỤNG\nCÔNG CỤ SỐ',
            cats=['Kế toán điện tử', 'Hóa đơn điện tử', 'Thương mại điện tử', 'Phần mềm CRM', 'Hệ thống ERP'],
            series=[('Năm 2024', [72, 65, 48, 26, 14]), ('Năm 2026', [91, 88, 67, 41, 23])],
            kpis=[('target', 'Doanh nghiệp khảo sát', '318', 'DN', '▲ 11,8% so với dự kiến'),
                  ('users', 'Người tham gia phỏng vấn', '3.108', 'lượt', 'Tỷ lệ phản hồi 86%'),
                  ('chart-line', 'Mức tăng ứng dụng CRM', '+15', 'điểm %', 'Tăng mạnh nhất trong nhóm công cụ')])),
        (L.chart_lines, dict(
            title='XU HƯỚNG ĐẦU TƯ CÔNG NGHỆ',
            desc='Ngân sách cho công nghệ tăng liên tục kể từ 2022, trong khi chi phí vận hành trên mỗi đơn hàng giảm dần.',
            cats=['2021', '2022', '2023', '2024', '2025', '2026'],
            series=[('Đầu tư công nghệ', [1.2, 1.4, 2.2, 3.1, 3.9, 4.6]), ('Chi phí / đơn hàng', [4.4, 4.1, 3.5, 2.9, 2.6, 2.3]),
                    ('Doanh thu online', [0.8, 1.1, 1.9, 2.8, 3.6, 4.9])],
            stat='31,8', unit='%', stat_label='Tăng trưởng bình quân ngân sách công nghệ mỗi năm giai đoạn 2021 – 2026')),
        (L.chart_donut, dict(
            title='CƠ CẤU NGÂN SÁCH SỐ',
            desc='Phần lớn ngân sách được dành cho phần mềm và hạ tầng đám mây; đào tạo con người vẫn chiếm tỷ trọng đáng kể.',
            items=[('Phần mềm & bản quyền', '45%', 'ERP, CRM, kế toán và các ứng dụng quản trị.'),
                   ('Hạ tầng đám mây', '25%', 'Máy chủ, lưu trữ, sao lưu và bảo mật dữ liệu.'),
                   ('Đào tạo nhân sự', '20%', 'Đào tạo kỹ năng số cho quản lý và nhân viên.'),
                   ('Tư vấn triển khai', '10%', 'Chuyên gia hỗ trợ thiết kế và vận hành.')],
            values=[0.45, 0.25, 0.20, 0.10], center='4,2 tỷ', center_label='Tổng ngân sách')),

        (L.section, sec(4)),
        (L.stats4, dict(
            title='CHỈ SỐ NỔI BẬT',
            desc='Bốn con số tóm tắt kết quả khảo sát 318 doanh nghiệp vừa và nhỏ tại ba thành phố lớn.',
            stats=[('68,5', 'Doanh nghiệp đã dùng ít nhất một phần mềm quản trị', 'laptop_man'),
                   ('42,3', 'Doanh nghiệp có kế hoạch chuyển đổi số trong 2 năm tới', 'meeting'),
                   ('31,8', 'Mức giảm thời gian xử lý đơn hàng sau khi số hóa quy trình bán hàng'),
                   ('24,6', 'Doanh nghiệp đã có bộ phận hoặc nhân sự phụ trách công nghệ')])),
        (L.stats_mosaic, dict(
            title='KẾT QUẢ\nKHẢO SÁT',
            desc='Rào cản lớn nhất không nằm ở công nghệ mà ở chi phí ban đầu, kỹ năng nhân sự và thói quen làm việc thủ công.',
            stats=[('57,2', 'Cho rằng chi phí là rào cản lớn nhất'), ('49,1', 'Thiếu nhân sự có kỹ năng số phù hợp'),
                   ('36,4', 'Lo ngại rủi ro bảo mật dữ liệu')],
            images=['calc2', 'tablet'])),
        (L.stats_dark, dict(
            title='MỨC ĐỘ HÀI LÒNG', subtitle='Đánh giá của doanh nghiệp sau 12 tháng sử dụng công cụ số',
            image='magnifier', desc='Mức hài lòng cao nhất đến từ khả năng theo dõi số liệu theo thời gian thực và giảm sai sót thủ công.',
            stats=[('86,2', 'Hài lòng với tốc độ xử lý công việc'), ('78,4', 'Hài lòng với khả năng báo cáo'),
                   ('71,9', 'Hài lòng với chi phí đầu tư')],
            highlight='Cứ 10 doanh nghiệp thì có 8 doanh nghiệp sẵn sàng mở rộng ứng dụng.')),
        (L.table_slide, dict(
            title='SỐ LIỆU TỔNG HỢP', desc='So sánh các chỉ tiêu chính trước và sau khi triển khai (đơn vị: trung bình/doanh nghiệp).',
            stat='31,8', stat_label='Tăng trưởng lợi nhuận',
            stat_desc='Lợi nhuận bình quân tăng rõ rệt ở nhóm doanh nghiệp số hóa đồng thời bán hàng và kế toán.',
            bars=[('Bán hàng', 82), ('Kế toán', 74), ('Kho vận', 58)],
            rows=[['Chỉ tiêu', 'Trước', 'Sau', 'Thay đổi'],
                  ['Doanh thu (tỷ)', '3,18', '4,12', '+29,6%'],
                  ['Khách hàng', '3.108', '4.215', '+35,6%'],
                  ['Đơn hàng / tháng', '1.240', '1.705', '+37,5%'],
                  ['Tỷ lệ chuyển đổi', '3,18%', '4,05%', '+0,87 đ'],
                  ['Thời gian xử lý (giờ)', '26,0', '17,7', '−31,8%'],
                  ['Lợi nhuận (tỷ)', '0,42', '0,55', '+31,8%']])),
        (L.gallery, dict(
            title='HÌNH ẢNH KHẢO SÁT THỰC TẾ', bg='gallery_bg',
            desc='Nhóm trực tiếp làm việc với doanh nghiệp, quan sát quy trình và phỏng vấn người dùng.',
            points=['12 buổi làm việc tại doanh nghiệp', '318 phiếu khảo sát hợp lệ', '03 hội thảo chia sẻ kết quả'],
            photos=[('present1', 'Hội thảo chia sẻ'), ('present2', 'Đào tạo người dùng'), ('poster', 'Báo cáo khoa học'),
                    ('team_data', 'Nhập liệu khảo sát')])),

        (L.section, sec(5)),
        (L.swot, dict(
            title='PHÂN TÍCH SWOT',
            desc='Đánh giá toàn diện các yếu tố bên trong và bên ngoài ảnh hưởng đến quá trình chuyển đổi số của doanh nghiệp.',
            items=[('S', 'ĐIỂM MẠNH', 'rocket', 'Bộ máy gọn nhẹ, ra quyết định nhanh\nĐội ngũ trẻ, dễ tiếp nhận công nghệ\nGần khách hàng, linh hoạt thay đổi'),
                   ('W', 'ĐIỂM YẾU', 'circle-help', 'Nguồn vốn đầu tư hạn chế\nDữ liệu phân tán, thiếu chuẩn hóa\nThiếu nhân sự chuyên trách công nghệ'),
                   ('O', 'CƠ HỘI', 'target', 'Chính sách hỗ trợ của Nhà nước\nPhần mềm đám mây ngày càng rẻ\nThương mại điện tử tăng trưởng mạnh'),
                   ('T', 'THÁCH THỨC', 'shield-check', 'Rủi ro an ninh mạng, lộ dữ liệu\nCạnh tranh từ doanh nghiệp lớn\nThay đổi thói quen làm việc cũ')])),

        (L.section, sec(6)),
        (L.dashboard, dict(
            title='TỔNG QUAN\nDASHBOARD', desc='Theo dõi đồng thời doanh thu, chi phí và số đơn hàng để ra quyết định nhanh.',
            line_title='Doanh thu theo kênh (tỷ đồng)', line_cats=['Quý I', 'Quý II', 'Quý III', 'Quý IV'],
            line_series=[('Cửa hàng', [8.2, 8.6, 8.1, 9.4]), ('Online', [5.1, 6.3, 7.9, 10.6]), ('Đại lý', [3.4, 3.1, 3.8, 4.2])],
            area_title='Chi phí vận hành (triệu)', area_cats=['2022', '2023', '2024', '2025', '2026'],
            area_series=[('Chi phí', [32, 30, 22, 14, 26])],
            col_title='Đơn hàng theo tháng (nghìn)', col_cats=['T1', 'T2', 'T3', 'T4', 'T5', 'T6'],
            col_series=[('Đơn', [5, 11, 23, 24, 9, 14])],
            kpis=[('Tổng doanh thu', '318,004', 'triệu', '31,8% so với 30 ngày trước'),
                  ('Tổng sản phẩm bán ra', '31,804', 'SP', '12,4% so với 30 ngày trước')])),

        (L.section, sec(7)),
        (L.conclusion, dict(
            title='KẾT LUẬN',
            desc='Chuyển đổi số là hành trình dài hạn; doanh nghiệp SME nên bắt đầu nhỏ, đo lường rõ ràng và mở rộng từng bước.',
            items=[('Kết luận 01', 'Mức độ ứng dụng công cụ số tăng nhanh nhưng chưa đồng đều giữa các lĩnh vực và quy mô doanh nghiệp.',
                    '68,5%', 'DN đã dùng phần mềm quản trị'),
                   ('Kết luận 02', 'Hiệu quả rõ rệt nhất đến từ số hóa bán hàng và kế toán, giúp rút ngắn thời gian xử lý và tăng lợi nhuận.',
                    '−31,8%', 'Thời gian xử lý đơn hàng'),
                   ('Kết luận 03', 'Rào cản chính là chi phí và kỹ năng; cần lộ trình theo giai đoạn cùng chương trình đào tạo phù hợp.',
                    '57,2%', 'Xem chi phí là rào cản lớn nhất')])),
        (L.proposal, dict(
            bg='proposal_bg', bg_blur='proposal_blur',
            quote='“Không cần số hóa tất cả cùng lúc – hãy số hóa đúng chỗ tạo ra giá trị trước.”',
            author='Thông điệp chính của nhóm nghiên cứu', card_title='Kiến nghị',
            items=[('Với doanh nghiệp', 'Bắt đầu từ bán hàng và kế toán, đặt KPI đo lường sau mỗi 3 tháng.'),
                   ('Với cơ quan quản lý', 'Mở rộng gói hỗ trợ chi phí phần mềm và tư vấn cho doanh nghiệp nhỏ.'),
                   ('Với cơ sở đào tạo', 'Tăng thời lượng kỹ năng số và phân tích dữ liệu trong chương trình học.')])),
        (L.thanks, dict(
            bg='proposal_bg', tag='Q & A', title1='CẢM ƠN', title2='ĐÃ LẮNG NGHE',
            contacts=[('mail', 'nhom05.qt47@email.edu.vn'), ('phone', '0900 000 000'), ('map-pin', 'Khoa Quản trị Kinh doanh – Trường Đại học ABC')])),
    ]


def credit_lines():
    rows = list(csv.DictReader(open(os.path.join(HERE, 'assets', 'images', 'credits.csv'), encoding='utf-8')))
    return [f"• {r['title'][:48]} — {r['author']} (Flickr, CC BY 2.0)" for r in rows]


def build(theme, out_dir):
    K.set_theme(theme)
    K.CREDITS.clear()
    paths, sizes = prepare_images(theme)
    prs = K.new_presentation()
    ctx = dict(n=0, sec=dict(num=0, title=''), img=paths, size=sizes, total_sections=len(SECTIONS))
    slides = []
    for fn, c in build_content():
        slides.append(fn(prs, ctx, c))
    slides.append(L.credits(prs, ctx, dict(lines=credit_lines())))
    for s in slides:
        K.finalize(s)
    name = f'Mau-Bao-Cao-{K.T["name"]}.pptx'
    out = os.path.join(out_dir, name)
    prs.save(out)
    print('saved', out, len(prs.slides._sldIdLst), 'slides')
    return out


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--theme', choices=list(K.THEMES), action='append')
    ap.add_argument('--out', default=os.path.join(HERE, 'output'))
    a = ap.parse_args()
    os.makedirs(a.out, exist_ok=True)
    for t in a.theme or list(K.THEMES):
        build(t, a.out)
