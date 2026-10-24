"""
Build the M08 "Hồ sơ Doanh nghiệp" template (company profile, Cotecons style: royal blue, glowing ring emblem, wide
display type, numbered section pills, big outlined section numbers).

    python build_doanhnghiep.py                                          # demo: a fictitious construction group
    python build_doanhnghiep.py --content my.json --name Ho-so-Cong-ty   # a real deck from a content file
    python build_doanhnghiep.py --dump-sample catalog/samples/M08-doanhnghiep.json

The ring emblem is drawn with the brand initial (BRAND["initial"]); colours follow BRAND["colors"] (keys of
layouts_corporate.THEMES). Photos: assets/images/doanhnghiep_photos.json (Open Images, CC BY 2.0).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import layouts_corporate as L  # noqa: E402
import corporate_build as CB  # noqa: E402

THEME = 'doanhnghiep'
CODE, TITLE = 'M08', 'Hồ sơ năng lực – Tổng công ty Xây dựng Kiến Tạo'
DEFAULT_NAME = 'Mau-Ho-So-Doanh-Nghiep.pptx'
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'doanhnghiep_photos.json'), encoding='utf-8'))
BRAND = dict(name='Kiến Tạo', short='Kiến Tạo', initial='K', tagline='Kiến tạo giá trị bền vững')
LIGHT_PHOTO = 'tower_dark'
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0; chân dung được tách nền từ ảnh. '
                'Biểu tượng vòng tròn: vẽ bằng mã (thay bằng logo doanh nghiệp). Icon: Lucide (ISC). '
                'Font: Lexend Exa, Be Vietnam Pro, Great Vibes (SIL OFL).')
NOTE = 'Tên doanh nghiệp, nhân sự và số liệu là MINH HỌA — thay bằng hồ sơ năng lực thật.'


def build_content():
    return [
        (L.cover, dict(kicker='Hồ sơ năng lực 2026', line1='Tổng công ty Xây dựng', name='Kiến Tạo',
                       slogan='Kiến tạo giá trị bền vững – Vươn tầm khu vực',
                       presenter='Ban Điều hành  ·  Tháng 10/2026', notes='Slide bìa. ' + NOTE)),
        (L.letter, dict(portrait='businessman', name='Ông Nguyễn Minh Khang',
                        role='Chủ tịch HĐQT kiêm Tổng Giám đốc', title='Thư ngỏ',
                        text='Kính gửi Quý đối tác và khách hàng,\n'
                             'Trải qua hơn **20 năm** hình thành và phát triển, Kiến Tạo đã trở thành một trong những '
                             'tổng thầu xây dựng uy tín, đồng hành cùng chủ đầu tư trong **hơn 250 dự án** dân dụng, '
                             'công nghiệp và hạ tầng.\n'
                             'Chúng tôi đặt **chất lượng, an toàn và tiến độ** lên hàng đầu, không ngừng ứng dụng công '
                             'nghệ BIM và quản trị số để mang lại giá trị bền vững cho mỗi công trình.\n'
                             'Xin trân trọng cảm ơn sự tin tưởng và hợp tác của Quý vị.',
                        signature='Minh Khang')),
        (L.agenda, dict(title='Mục lục', items=['Tổng quan doanh nghiệp', 'Lịch sử phát triển', 'Sơ đồ tổ chức',
                                                'Tầm nhìn – Sứ mệnh', 'Lĩnh vực hoạt động', 'Dự án tiêu biểu',
                                                'Năng lực tài chính', 'Chuyển đổi số'])),
        (L.section, dict(num=1, title='Tổng quan\ndoanh nghiệp', photo='tower_glass', focus=[0.6, 0.4],
                         desc='Hơn 20 năm kiến tạo những công trình mang dấu ấn bền vững')),
        (L.overview, dict(title='Tổng quan doanh nghiệp', tag='Giới thiệu', num=1,
                          sub='Tổng thầu thiết kế – thi công hàng đầu trong lĩnh vực xây dựng dân dụng và công nghiệp',
                          text='**Tổng công ty Xây dựng Kiến Tạo** được thành lập năm 2004, hoạt động theo mô hình '
                               'tổng thầu **Design & Build**.\n'
                               'Với đội ngũ kỹ sư giàu kinh nghiệm, hệ thống thiết bị hiện đại và quy trình quản lý '
                               'đạt chuẩn quốc tế, Kiến Tạo cung cấp giải pháp trọn gói từ thiết kế, thi công đến '
                               'bàn giao vận hành.',
                          photo='cranes', focus=[0.5, 0.0],
                          stats=[['building-2', '20', '+ năm', 'kinh nghiệm tổng thầu xây dựng'],
                                 ['users', '3.500', '+', 'cán bộ, kỹ sư và công nhân lành nghề'],
                                 ['briefcase', '250', '+', 'dự án đã hoàn thành và bàn giao'],
                                 ['award', '35', '', 'giải thưởng chất lượng và an toàn']])),
        (L.milestones, dict(title='Lịch sử phát triển', tag='Giới thiệu', num=1,
                            sub='Những cột mốc đáng nhớ trên hành trình hai thập kỷ',
                            events=[['2004', 'Thành lập', 'Khởi đầu với 50 nhân sự và các công trình dân dụng.'],
                                    ['2009', 'Cổ phần hóa', 'Chuyển đổi mô hình, mở rộng sang nhà xưởng công nghiệp.'],
                                    ['2014', 'Tổng thầu D&B', 'Triển khai mô hình thiết kế – thi công trọn gói.'],
                                    ['2019', 'Mở rộng hạ tầng', 'Tham gia các dự án giao thông, năng lượng tái tạo.'],
                                    ['2024', 'Chuyển đổi số', 'Ứng dụng BIM và nền tảng quản lý dự án số.']])),
        (L.org_chart, dict(title='Sơ đồ tổ chức', tag='Giới thiệu', num=1,
                           sub='Bộ máy tinh gọn, phân cấp rõ ràng, phản ứng nhanh tại công trường',
                           levels=[['Đại hội đồng cổ đông'], ['Hội đồng quản trị', 'Ban Kiểm soát'],
                                   ['Ban Tổng Giám đốc'],
                                   ['Khối Thi công', 'Khối Kỹ thuật – MEP', 'Khối QA/QC – HSE', 'Khối Tài chính',
                                    'Khối Nhân sự – Hành chính']])),
        (L.section, dict(num=2, title='Định hướng\nphát triển', photo='tower_wave', focus=[0.4, 0.4],
                         desc='Tầm nhìn, sứ mệnh và các lĩnh vực hoạt động cốt lõi')),
        (L.pillars, dict(title='Tầm nhìn – Sứ mệnh – Giá trị', tag='Định hướng', num=2,
                         lead='Kim chỉ nam cho mọi hoạt động của Kiến Tạo — từ bản vẽ đầu tiên đến ngày bàn giao.',
                         photo='tower_blue', focus=[0.5, 0.3],
                         items=[['eye', 'Tầm nhìn', ['Trở thành tổng thầu **hàng đầu khu vực** vào năm 2030',
                                                     'Tiên phong trong **xây dựng xanh** và công nghệ số']],
                                ['target', 'Sứ mệnh', ['Kiến tạo công trình **an toàn, chất lượng, đúng tiến độ**',
                                                       'Tối ưu chi phí và giá trị đầu tư cho chủ đầu tư',
                                                       'Mang lại môi trường làm việc chuyên nghiệp']],
                                ['gem', 'Giá trị cốt lõi', ['**Chính trực** trong mọi cam kết',
                                                            '**Chất lượng** là danh dự',
                                                            '**Đổi mới** để phát triển bền vững']]])),
        (L.services, dict(title='Lĩnh vực hoạt động', tag='Định hướng', num=2, dark=True,
                          sub='Giải pháp trọn gói cho mọi loại hình công trình', photo='crane_red',
                          focus=[0.5, 0.4],
                          items=[['building-2', 'Tổng thầu thiết kế & thi công (D&B)',
                                  'Cao ốc văn phòng, khách sạn, căn hộ, trung tâm thương mại.'],
                                 ['factory', 'Nhà xưởng – Công nghiệp',
                                  'Nhà máy, kho vận, khu công nghiệp tiêu chuẩn quốc tế.'],
                                 ['route', 'Hạ tầng – Giao thông', 'Cầu đường, hạ tầng kỹ thuật khu đô thị.'],
                                 ['zap', 'Cơ điện – MEP', 'Hệ thống điện, điều hòa, cấp thoát nước, PCCC.'],
                                 ['sun', 'Năng lượng tái tạo', 'Điện mặt trời áp mái, điện gió, lưu trữ năng lượng.']])),
        (L.section, dict(num=3, title='Dự án\ntiêu biểu', photo='cranes2', focus=[0.5, 0.5],
                         desc='Những công trình khẳng định năng lực tổng thầu')),
        (L.projects, dict(title='Dự án tiêu biểu', tag='Dự án', num=3,
                          sub='Chất lượng được khẳng định qua từng công trình bàn giao',
                          items=[dict(photo='tower_glass', focus=[0.6, 0.4], badge='Hoàn thành', name='Sky Tower',
                                      meta='Hà Nội  ·  2023  ·  45 tầng',
                                      text='Tòa văn phòng hạng A, tổng diện tích sàn **120.000 m²**, chứng chỉ LEED Gold.'),
                                 dict(photo='solar', badge='Hoàn thành', name='Solar Park', meta='Ninh Thuận  ·  2022',
                                      text='Nhà máy điện mặt trời công suất **50 MWp**, thi công EPC trong 9 tháng.'),
                                 dict(photo='warehouse', badge='Đang thi công', name='Logistics Hub',
                                      meta='Bình Dương  ·  2025  ·  12 ha',
                                      text='Trung tâm kho vận thông minh, kết cấu thép tiền chế **85.000 m²**.')])),
        (L.big_numbers, dict(title='Năng lực thiết bị & nhân lực', tag='Dự án', num=3,
                             sub='Chủ động máy móc và con người cho nhiều dự án cùng lúc', photo='crawler',
                             focus=[0.5, 0.4],
                             items=[['construction', '120', '+', 'cẩu tháp, vận thăng và cẩu bánh xích'],
                                    ['users', '450', '+', 'kỹ sư, kiến trúc sư được chứng nhận'],
                                    ['hard-hat', '10', ' triệu', 'giờ công an toàn liên tục'],
                                    ['layers', '30', '', 'dự án triển khai đồng thời']])),
        (L.chart, dict(title='Năng lực tài chính', tag='Tài chính', num=4,
                       sub='Tăng trưởng ổn định, cơ cấu tài chính lành mạnh',
                       chart=dict(kind='bar', cats=['2021', '2022', '2023', '2024', '2025'],
                                  series=[['Doanh thu (tỷ đồng)', [8200, 9600, 11300, 12800, 14500]],
                                          ['Lợi nhuận sau thuế (tỷ đồng)', [310, 380, 450, 520, 610]]],
                                  fmt='#,##0'),
                       kpis=[['14.500', ' tỷ', 'doanh thu năm 2025'], ['15', '%', 'tăng trưởng bình quân/năm'],
                             ['0,8', ' lần', 'hệ số nợ/vốn chủ sở hữu']],
                       note='Số liệu minh họa — thay bằng báo cáo tài chính đã kiểm toán.')),
        (L.table_slide, dict(title='Hệ thống quản lý & chứng chỉ', tag='Tài chính', num=4,
                             sub='Quy trình chuẩn hóa theo các tiêu chuẩn quốc tế',
                             rows=[['Tiêu chuẩn', 'Phạm vi áp dụng', 'Tổ chức chứng nhận', 'Hiệu lực'],
                                   ['ISO 9001:2015', 'Quản lý chất lượng thi công', 'Bureau Veritas', '2024 – 2027'],
                                   ['ISO 14001:2015', 'Quản lý môi trường công trường', 'Bureau Veritas', '2024 – 2027'],
                                   ['ISO 45001:2018', 'An toàn và sức khỏe nghề nghiệp', 'TÜV Nord', '2023 – 2026'],
                                   ['LEED AP', 'Tư vấn và thi công công trình xanh', 'USGBC', '2025 – 2027'],
                                   ['BIM Level 2', 'Mô hình thông tin công trình', 'BSI', '2025 – 2028']],
                             col_w=[2.2, 4.2, 2.6, 1.8], note='Danh mục minh họa.')),
        (L.phone_app, dict(title='Chuyển đổi số', tag='Công nghệ', num=5,
                           sub='Quản lý dự án theo thời gian thực trên nền tảng số',
                           items=['**BIM 3D – 5D**: phối hợp thiết kế, bóc khối lượng, kiểm soát chi phí',
                                  '**Nhật ký công trường điện tử**: cập nhật tiến độ, hình ảnh mỗi ngày',
                                  '**Giám sát an toàn**: cảnh báo rủi ro, kiểm tra HSE trên di động',
                                  '**Báo cáo chủ đầu tư**: bảng điều khiển minh bạch, cập nhật tức thì'],
                           app_greeting='Dự án đang theo dõi', app_user='Sky Tower – Block B',
                           app_card_label='Tiến độ tổng thể', app_card_value='68%',
                           app_tiles=[['calendar', 'Tiến độ'], ['file-text', 'Nhật ký'], ['shield-check', 'An toàn'],
                                      ['truck', 'Vật tư'], ['cuboid', 'BIM 3D'], ['chart-column', 'Báo cáo']])),
        (L.thanks, dict(title='Xin cảm ơn', sub='Kiến tạo giá trị bền vững', photo='tower_glass',
                        lines=[['map-pin', 'Tầng 12, Tòa nhà ABC, Quận 1, TP. Hồ Chí Minh'],
                               ['phone', '(028) 3800 0000'], ['mail', 'info@tencongty.vn'],
                               ['globe', 'www.tencongty.vn']])),
    ]


if __name__ == '__main__':
    CB.main(sys.modules[__name__], HERE)
