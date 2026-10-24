"""
Build the M09 "Giới thiệu Dịch vụ" template (service introduction, Manulife style: fresh green gradient, slanted
bars, parallelogram photo panels, two-line titles).

    python build_dichvu.py                                         # demo: a fictitious insurance service
    python build_dichvu.py --content my.json --name Dich-vu-ABC    # a real deck from a content file
    python build_dichvu.py --dump-sample catalog/samples/M09-dichvu.json

Colours follow BRAND["colors"] (keys of layouts_corporate.THEMES, e.g. {"primary": "...", "dark": "..."}).
Photos: assets/images/dichvu_photos.json (Open Images, CC BY 2.0).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import layouts_corporate as L  # noqa: E402
import corporate_build as CB  # noqa: E402

THEME = 'dichvu'
CODE, TITLE = 'M09', 'Giới thiệu dịch vụ – Bảo hiểm An Tâm Life'
DEFAULT_NAME = 'Mau-Gioi-Thieu-Dich-Vu.pptx'
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'dichvu_photos.json'), encoding='utf-8'))
BRAND = dict(name='An Tâm Life', short='An Tâm Life', initial='A', tagline='Vững tâm hôm nay – Vững vàng ngày mai')
LIGHT_PHOTO = 'canopy'
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0; chân dung được tách nền từ ảnh. '
                'Icon: Lucide (ISC). Font: Be Vietnam Pro, Great Vibes (SIL OFL).')
NOTE = 'Tên thương hiệu, sản phẩm, quyền lợi và số liệu là MINH HỌA — thay bằng tài liệu sản phẩm đã được phê duyệt.'


def build_content():
    return [
        (L.cover, dict(kicker='Giới thiệu dịch vụ', line1='Giải pháp bảo hiểm', name='An Tâm Life',
                       slogan='Vững tâm hôm nay – Vững vàng ngày mai', photos=['family_beach', 'grandma_baby'],
                       focus1=[0.45, 0.5], focus2=[0.75, 0.5],
                       presenter='Tư vấn viên: Nguyễn Thu Trang  ·  0900 000 000', notes='Slide bìa. ' + NOTE)),
        (L.letter, dict(portrait='businesswoman', name='Bà Trần Thu Hà', role='Tổng Giám đốc', title='Lời chào',
                        text='Kính gửi Quý khách hàng,\n'
                             'Mỗi gia đình đều có những ước mơ riêng — một mái nhà ấm áp, con cái được học hành, cha mẹ '
                             'an hưởng tuổi già. An Tâm Life ra đời để **bảo vệ những ước mơ ấy** trước mọi biến cố.\n'
                             'Với **hơn 1,2 triệu khách hàng** tin chọn, chúng tôi cam kết mang đến giải pháp bảo hiểm '
                             '**minh bạch, linh hoạt và chi trả nhanh chóng**.\n'
                             'Cảm ơn Quý khách đã cho chúng tôi cơ hội được đồng hành.',
                        signature='Thu Hà')),
        (L.agenda, dict(title='Nội dung', sub='Hành trình cùng An Tâm Life', photo='family_selfie', focus=[0.5, 0.4],
                        items=['Về An Tâm Life', 'Ba trụ cột bảo vệ', 'Danh mục sản phẩm', 'Các gói bảo hiểm',
                               'Quy trình tham gia', 'Ứng dụng chăm sóc khách hàng'])),
        (L.section, dict(num=1, title='Về\nAn Tâm Life', photo='tree', focus=[0.5, 0.5],
                         desc='Hơn 25 năm đồng hành cùng các gia đình Việt')),
        (L.overview, dict(title='Về An Tâm Life', sub='Đồng hành vững chắc', tag='Giới thiệu', num=1,
                          text='**An Tâm Life** là doanh nghiệp bảo hiểm nhân thọ với hơn **25 năm** kinh nghiệm, '
                               'mạng lưới **120 văn phòng** trên toàn quốc.\n'
                               'Chúng tôi cung cấp các giải pháp bảo vệ sức khỏe, tích lũy tài chính và hưu trí, '
                               'được thiết kế linh hoạt cho từng giai đoạn của cuộc sống.',
                          photo='family_big', focus=[0.5, 0.4],
                          stats=[['users', '1,2', ' triệu', 'khách hàng đang được bảo vệ'],
                                 ['building', '120', '', 'văn phòng và trung tâm dịch vụ'],
                                 ['hand-coins', '3.200', ' tỷ', 'quyền lợi đã chi trả năm 2025'],
                                 ['award', '15', '', 'giải thưởng về dịch vụ khách hàng']])),
        (L.milestones, dict(title='Hành trình phát triển', sub='25 năm vững bước', tag='Giới thiệu', num=1,
                            events=[['2000', 'Thành lập', 'Ra mắt sản phẩm bảo hiểm nhân thọ đầu tiên.'],
                                    ['2008', '100 văn phòng', 'Mở rộng mạng lưới phục vụ trên 63 tỉnh thành.'],
                                    ['2015', 'Bảo hiểm sức khỏe', 'Ra mắt dòng sản phẩm chăm sóc y tế toàn diện.'],
                                    ['2020', '1 triệu khách hàng', 'Cột mốc 1 triệu khách hàng tin chọn.'],
                                    ['2025', 'Số hóa toàn diện', 'Tham gia và bồi thường 100% trực tuyến.']])),
        (L.section, dict(num=2, title='Giải pháp\ncho mọi gia đình', photo='canopy', focus=[0.5, 0.5],
                         desc='Bảo vệ – Tích lũy – Hưu trí trong một kế hoạch')),
        (L.pillars, dict(title='Ba trụ cột bảo vệ', sub='Toàn diện cho cả gia đình', tag='Giải pháp', num=2,
                         photo='mother_child', focus=[0.5, 0.35],
                         items=[['heart-pulse', 'Bảo vệ sức khỏe', ['Chi trả viện phí, phẫu thuật **đến 1 tỷ đồng/năm**',
                                                                    'Bảo lãnh viện phí tại **300+ bệnh viện**']],
                                ['piggy-bank', 'Tích lũy tài chính', ['Lãi suất cam kết tối thiểu **3%/năm**',
                                                                       'Linh hoạt rút tiền khi cần']],
                                ['graduation-cap', 'Quỹ học vấn', ['Đảm bảo kế hoạch học tập của con',
                                                                    '**Miễn đóng phí** khi người trụ cột gặp rủi ro']]])),
        (L.services, dict(title='Danh mục sản phẩm', sub='Lựa chọn theo nhu cầu', tag='Giải pháp', num=2,
                          photo='grandpa_child', focus=[0.5, 0.4],
                          items=[['shield-check', 'Bảo hiểm nhân thọ trọn đời', 'Bảo vệ tài chính dài hạn cho gia đình.'],
                                 ['stethoscope', 'Bảo hiểm sức khỏe', 'Chi phí nội trú, ngoại trú, nha khoa, thai sản.'],
                                 ['graduation-cap', 'Bảo hiểm giáo dục', 'Tích lũy quỹ học vấn cho con đến đại học.'],
                                 ['wallet', 'Bảo hiểm liên kết đầu tư', 'Bảo vệ kết hợp đầu tư sinh lời dài hạn.'],
                                 ['umbrella', 'Bảo hiểm hưu trí', 'Thu nhập ổn định khi về hưu.']])),
        (L.projects, dict(title='Các gói bảo hiểm', sub='Chọn gói phù hợp', tag='Sản phẩm', num=3,
                          items=[dict(photo='family_selfie', focus=[0.5, 0.35], name='An Tâm Cơ bản',
                                      meta='Từ 15.000 đ/ngày',
                                      text='Bảo vệ trước rủi ro tử vong, thương tật. Quyền lợi **đến 500 triệu đồng**.'),
                                 dict(photo='family_big', focus=[0.5, 0.35], badge='Phổ biến nhất',
                                      name='An Tâm Gia đình', meta='Từ 30.000 đ/ngày',
                                      text='Bảo vệ cả gia đình kèm thẻ sức khỏe, quyền lợi **đến 2 tỷ đồng**.'),
                                 dict(photo='grandma_baby', focus=[0.5, 0.4], name='An Tâm Hưu trí',
                                      meta='Từ 50.000 đ/ngày',
                                      text='Tích lũy hưu trí, nhận **lương hưu bổ sung** hằng tháng từ tuổi 60.')])),
        (L.table_slide, dict(title='So sánh quyền lợi', sub='Ba gói bảo hiểm', tag='Sản phẩm', num=3,
                             rows=[['Quyền lợi', 'Cơ bản', 'Gia đình', 'Hưu trí'],
                                   ['Bảo vệ tử vong, thương tật', '500 triệu', '2 tỷ', '1 tỷ'],
                                   ['Chi phí nằm viện, phẫu thuật', '—', '1 tỷ/năm', '500 triệu/năm'],
                                   ['Bảo vệ bệnh hiểm nghèo', '—', '✓', '✓'],
                                   ['Tích lũy và chia lãi', '—', '✓', '✓'],
                                   ['Lương hưu bổ sung', '—', '—', '✓'],
                                   ['Số người được bảo hiểm', '1', 'Đến 5', '1']],
                             col_w=[4.0, 2.2, 2.2, 2.2], note='Quyền lợi minh họa — xem quy tắc, điều khoản sản phẩm.')),
        (L.section, dict(num=3, title='Trải nghiệm\nkhách hàng', photo='sun_trees', focus=[0.5, 0.4],
                         desc='Đơn giản – Nhanh chóng – Tận tâm')),
        (L.milestones, dict(title='Quy trình tham gia', sub='5 bước đơn giản', tag='Dịch vụ', num=4,
                            events=[['Bước 1', 'Tư vấn nhu cầu', 'Phân tích tài chính và mục tiêu của gia đình.'],
                                    ['Bước 2', 'Thiết kế giải pháp', 'Đề xuất gói phù hợp với ngân sách.'],
                                    ['Bước 3', 'Ký hợp đồng', 'Ký điện tử, hiệu lực ngay trong ngày.'],
                                    ['Bước 4', 'Chăm sóc định kỳ', 'Rà soát quyền lợi mỗi năm cùng tư vấn viên.'],
                                    ['Bước 5', 'Chi trả quyền lợi', 'Giải quyết bồi thường trong 24 giờ.']])),
        (L.phone_app, dict(title='Ứng dụng An Tâm Life', sub='Mọi lúc, mọi nơi', tag='Dịch vụ', num=4,
                           items=['**Tra cứu hợp đồng**: quyền lợi, phí và giá trị tài khoản',
                                  '**Yêu cầu bồi thường online**: chụp hóa đơn, nhận tiền trong 24 giờ',
                                  '**Đóng phí linh hoạt**: thẻ, ví điện tử, chuyển khoản tự động',
                                  '**Đặt lịch khám**: kết nối hơn 300 bệnh viện, phòng khám'],
                           app_greeting='Xin chào,', app_user='Nguyễn Văn An',
                           app_card_label='Hợp đồng đang hiệu lực', app_card_value='02',
                           app_tiles=[['file-text', 'Hợp đồng'], ['receipt-text', 'Bồi thường'], ['wallet', 'Đóng phí'],
                                      ['hospital', 'Bệnh viện'], ['calendar', 'Đặt lịch'], ['headset', 'Hỗ trợ']])),
        (L.big_numbers, dict(title='Những con số ấn tượng', sub='Cam kết bằng hành động', tag='Dịch vụ', num=4,
                             photo='nurse', focus=[0.5, 0.3],
                             items=[['clock-3', '24', ' giờ', 'thời gian giải quyết bồi thường trung bình'],
                                    ['hospital', '300', '+', 'bệnh viện bảo lãnh viện phí'],
                                    ['user-round-check', '98', '%', 'khách hàng hài lòng với dịch vụ'],
                                    ['headset', '24/7', '', 'tổng đài chăm sóc khách hàng']])),
        (L.chart, dict(title='Quyền lợi đã chi trả', sub='Tăng trưởng qua các năm', tag='Dịch vụ', num=4,
                       chart=dict(kind='bar', cats=['2021', '2022', '2023', '2024', '2025'],
                                  series=[['Quyền lợi chi trả (tỷ đồng)', [1500, 1900, 2300, 2750, 3200]]],
                                  fmt='#,##0'),
                       kpis=[['3.200', ' tỷ', 'chi trả cho khách hàng năm 2025'],
                             ['210.000', '', 'hồ sơ bồi thường được giải quyết'],
                             ['21', '%', 'tăng trưởng bình quân mỗi năm']],
                       note='Số liệu minh họa.')),
        (L.thanks, dict(title='Xin cảm ơn', sub='Vững tâm hôm nay – Vững vàng ngày mai', photo='grandpa_child',
                        focus=[0.5, 0.4],
                        lines=[['phone', 'Tổng đài: 1800 0000 (miễn phí)'], ['mail', 'chamsoc@tencongty.vn'],
                               ['globe', 'www.tencongty.vn'], ['map-pin', 'Tầng 8, Tòa nhà ABC, Quận 3, TP. Hồ Chí Minh']])),
    ]


if __name__ == '__main__':
    CB.main(sys.modules[__name__], HERE)
