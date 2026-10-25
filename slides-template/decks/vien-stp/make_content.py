"""Writes decks/vien-stp/content.json (bộ slide giới thiệu Viện STP, mẫu M08). Chạy lại sau khi sửa nội dung."""
import json
import os

HERE = os.path.dirname(os.path.abspath(__file__))
S = 'assets/images/src/stp/'
C = 'assets/images/cut/'

photos = {
    'logo': S + 'logo_stp.png', 'qr': S + 'qr_stp.png', 'map_vn': S + 'vn_map_green.png',
    'certs': S + 'certs.jpg', 'gcn': S + 'gcn_khcn.jpg', 'city': C + 'stp_city.png', 'building': C + 'stp_building.png',
    'engineers': S + 'atld_engineers.jpg', 'engineers_cut': C + 'stp_atld_engineers.png', 'classroom': S + 'classroom.jpg',
    'group1': S + 'group_73.jpg', 'group2': S + 'group_75.jpg', 'group3': S + 'group_77.jpg', 'group4': S + 'group_79.jpg',
    'group5': S + 'group_81.jpg', 'group6': S + 'group_83.jpg',
    'screen_dashboard': S + 'screen_dashboard.jpg', 'screen_lookup': S + 'screen_lookup.jpg',
    'ai_learners': S + 'ai_learners.jpg', 'students': S + 'students.jpg', 'cambridge': S + 'cambridge_center.jpg',
    'exam_room': S + 'exam_room.jpg', 'crate': C + 'stp_trace_crate.png', 'phone': C + 'stp_phone.png',
    'coffee': S + 'coffee_harvest.jpg', 'farm': S + 'iot_farm_c.jpg', 'sensor': C + 'stp_sensor.png',
    'handheld': C + 'stp_iot_handheld.png', 'solar_node': S + 'iot_solar_node.jpg', 'handshake': S + 'handshake.jpg',
    'prawns': '6bff01cbd438a9e7', 'pills': '4bd3837a5811c377', 'aisle': '2fb758af358ea115',
    'processing': '2067dfd164cd8e64', 'rolls': '9dccf45b7dbfe493',
}
for k in (128, 129, 130, 131, 132, 133, 134, 135):
    photos[f'client{k}'] = S + f'client_{k}.jpg'
for k in range(1, 17):
    photos[f'p{k}'] = S + f'partner_{k}_t.jpg'

brand = dict(name='Viện STP', short='Viện STP', initial='S', logo=photos['logo'], pattern='circuit', watermark=False,
             tagline='Kết nối tri thức – Đồng hành phát triển bền vững',
             colors=dict(ring='CDEFA0', dark='032A1B', primary='207D08', light='7FC211', pale='E4F2DA', ink='0D2B1C', text='465A4D',
                         muted='86988C', bg='F3F7F1', accent='DE0709', line='D4E4CC',
                         chart=['207D08', '7FC211', '0D4D2A', 'DE0709']))

slides = [
    dict(slide='cover', kicker='STP Institute · VUSTA', line1='Hồ sơ năng lực', name='Viện STP',
         slogan='Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP',
         presenter='Tổ chức KH&CN trực thuộc Liên hiệp các Hội Khoa học và Kỹ thuật Việt Nam',
         notes='Kính chào Quý vị đại biểu. Viện STP xin giới thiệu năng lực và các dịch vụ trọng tâm: nghiên cứu '
               'khoa học, đào tạo – cấp chứng chỉ, truy xuất nguồn gốc và nông nghiệp thông minh IoT.'),
    dict(slide='agenda', title='Nội dung',
         items=['Giới thiệu Viện STP', 'Nghiên cứu khoa học & chuyển đổi số', 'Đào tạo & chứng chỉ',
                'Truy xuất nguồn gốc', 'Nông nghiệp thông minh IoT', 'Đối tác & mạng lưới']),
    dict(slide='overview', title='Về Viện STP', tag='Giới thiệu', num=1,
         sub='Kết nối tri thức, nguồn lực và các chủ thể trong hệ sinh thái giáo dục – khoa học – dịch vụ chuyên môn',
         text='**Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP** là tổ chức khoa học và công nghệ trực thuộc '
              '**Liên hiệp các Hội Khoa học và Kỹ thuật Việt Nam (VUSTA)**.\n'
              'Hoạt động theo Giấy chứng nhận đăng ký hoạt động KH&CN số 234/QĐ-LHHVN ngày 24/03/2020, Viện STP '
              'đồng hành cùng **cơ quan nhà nước, doanh nghiệp và cộng đồng** bằng nghiên cứu, đào tạo và giải pháp '
              'công nghệ thiết thực.',
         photo='certs', focus=[0.5, 0.45],
         stats=[['award', '2020', '', 'năm được cấp Giấy chứng nhận hoạt động KH&CN'],
                ['landmark', 'VUSTA', '', 'tổ chức KH&CN trực thuộc Liên hiệp các Hội KH&KT Việt Nam'],
                ['map-pin', '03', '', 'văn phòng: Hà Nội · Nha Trang · TP. Hồ Chí Minh'],
                ['monitor', '250', '', 'thí sinh / ca tại phòng thi máy tính']]),
    dict(slide='hub', title='Hệ sinh thái 4 trụ cột', tag='Giới thiệu', num=1,
         sub='Từ nghiên cứu đến ứng dụng – một đầu mối cho nhiều nhu cầu phát triển',
         items=[['microscope', 'Nghiên cứu & Dự án', 'Tư vấn, lập dự án và chuyển giao ứng dụng khoa học công nghệ.'],
                ['graduation-cap', 'Đào tạo & Chứng chỉ', 'Phát triển nguồn nhân lực, huấn luyện an toàn lao động, '
                                                          'đào tạo AI.'],
                ['qr-code', 'Truy xuất nguồn gốc', 'Giải pháp chuẩn GS1, minh bạch chuỗi cung ứng, bảo vệ thương '
                                                  'hiệu.'],
                ['cpu', 'Chuyển đổi số & IoT', 'Kiến trúc IoT nông nghiệp thông minh và giải pháp công nghệ doanh '
                                              'nghiệp.']]),
    dict(slide='section', num=2, title='Nghiên cứu khoa học\n& chuyển đổi số', photo='city', focus=[0.5, 0.5],
         desc='Dữ liệu thực chứng cho chính sách – công nghệ cho thực tiễn'),
    dict(slide='spotlight', title='Nghiên cứu khoa học & thiết lập dự án', tag='Nghiên cứu', num=2,
         sub='Đồng hành triển khai các dự án khoa học thực tiễn, bám sát định hướng phát triển của địa phương',
         image='city', mode='center',
         items=[['search', 'Khảo sát & đánh giá', 'Cùng Sở, ban, ngành nhận diện bài toán; cung cấp dữ liệu thực '
                                                  'chứng cho hoạch định chính sách.'],
                ['clipboard-list', 'Tư vấn & lập dự án', 'Quy hoạch, xây dựng các dự án KH&CN trọng điểm gắn với '
                                                        'phát triển kinh tế – xã hội.'],
                ['book-open', 'Công bố khoa học', 'Hỗ trợ công bố kết quả, đăng bài báo chuyên ngành uy tín trong '
                                                 'và ngoài nước.'],
                ['arrow-right-left', 'Chuyển giao ứng dụng', 'Cầu nối đưa công nghệ tiên tiến vào doanh nghiệp và '
                                                            'cơ quan nhà nước.']]),
    dict(slide='spotlight', title='Tư vấn & triển khai chuyển đổi số', tag='Chuyển đổi số', num=2,
         sub='Không chỉ tư vấn lý thuyết – Viện STP trực tiếp phát triển và tích hợp giải pháp',
         image='building', mode='right', image_w=6.2,
         items=[['search', 'Khảo sát & chẩn đoán', 'Đánh giá mức độ trưởng thành số, thiết kế lộ trình phù hợp, '
                                                  'tránh lãng phí.'],
                ['cpu', 'Xây dựng giải pháp công nghệ', 'Phát triển, tích hợp phần mềm quản lý, tự động hóa quy '
                                                       'trình.'],
                ['bot', 'Giải pháp AI đa thể thức', 'Tư vấn trọn gói AI theo đặc thù kinh doanh và quản lý nhà nước.'],
                ['handshake', 'Chuyển giao & đồng hành', 'Tư vấn thẩm định giá, tổ chức hội nghị, hội thảo khoa học – '
                                                        'công nghệ.']]),
    dict(slide='section', num=3, title='Đào tạo\n& cấp chứng chỉ', photo='classroom', focus=[0.5, 0.5],
         cut='engineers_cut', desc='Nâng tầm nguồn nhân lực – học đến đâu, làm được đến đó'),
    dict(slide='cards', title='Hệ sinh thái đào tạo toàn diện', tag='Đào tạo', num=3, photo_ratio=0.64,
         title_size=14, text_size=11.5,
         sub='Đồng hành từ khảo sát nhu cầu, xây dựng lộ trình đến ứng dụng thực tiễn',
         items=[dict(photo='group1', title='Chứng chỉ nghiệp vụ',
                     text='Đường thủy nội địa, xây dựng, sơ cấp cứu, an toàn điện, hóa chất…'),
                dict(photo='engineers', badge='Trọng tâm', title='An toàn lao động',
                     text='Huấn luyện 6 nhóm đối tượng, cấp chứng chỉ và số hóa quản lý ATVSLĐ.'),
                dict(photo='ai_learners', title='Ứng dụng AI',
                     text='Thiết kế riêng theo nghiệp vụ từng cơ quan, doanh nghiệp, trường học.'),
                dict(photo='students', title='Tuyển sinh & khảo thí',
                     text='Liên kết tuyển sinh Sơ cấp → Tiến sĩ; khảo thí tiếng Anh chuẩn Cambridge.')]),
    dict(slide='table_slide', title='Chứng chỉ nghiệp vụ chuyên ngành', tag='Đào tạo', num=3,
         sub='Học viên được cấp Chứng nhận nghiệp vụ song ngữ Việt – Anh (Certificate of Knowledge)',
         rows=[['Lĩnh vực', 'Chương trình bồi dưỡng', 'Căn cứ pháp lý'],
               ['Đường thủy nội địa', 'Nghiệp vụ bảo đảm an toàn giao thông đường thủy nội địa',
                'Lĩnh vực khai thác vận tải thủy'],
               ['Xây dựng', 'Giám sát thi công xây dựng công trình · Chỉ huy trưởng công trình', 'TT 25/2009/TT-BXD'],
               ['An toàn, vệ sinh lao động', 'Huấn luyện nhóm 1 – 6', 'NĐ 44/2016, NĐ 140/2018/NĐ-CP'],
               ['Sơ cấp cứu', 'Huấn luyện sơ cấp cứu tại nơi làm việc', 'TT 19/2016/TT-BYT'],
               ['An toàn điện · Hóa chất', 'Huấn luyện an toàn điện, an toàn hóa chất',
                'TT 05/2021/TT-BCT · NĐ 113/2017'],
               ['Giáo dục nghề nghiệp', 'Bồi dưỡng nghiệp vụ, kỹ năng nghề', 'TT 42, 43/2015/TT-BLĐTBXH']],
         col_w=[2.6, 5.4, 3.0], note='Chứng nhận có số hiệu, số vào sổ; tra cứu, xác thực trực tuyến.'),
    dict(slide='cards', title='Huấn luyện an toàn, vệ sinh lao động', tag='Đào tạo', num=3, cols=3, photo_ratio=0.58,
         sub='6 nhóm đối tượng theo NĐ 44/2016/NĐ-CP và NĐ 140/2018/NĐ-CP · triển khai cùng DAKO Marine Technology',
         title_size=12.5, text_size=10,
         items=[dict(photo='group1', badge='Nhóm 1', title='Quản lý, chỉ huy sản xuất',
                     text='Chuẩn hóa hệ thống quản lý ATLĐ, nâng cao hiệu quả sản xuất.'),
                dict(photo='group2', badge='Nhóm 2', title='Người làm công tác ATVSLĐ',
                     text='Vững chuyên môn, chủ động kiểm soát rủi ro tại hiện trường.'),
                dict(photo='group3', badge='Nhóm 3', title='Công việc yêu cầu nghiêm ngặt',
                     text='Vận hành an toàn thiết bị, môi trường đặc thù.'),
                dict(photo='group4', badge='Nhóm 4', title='Người lao động khác',
                     text='Chuẩn hóa hành vi an toàn, đáp ứng thanh tra, kiểm tra.'),
                dict(photo='group5', badge='Nhóm 5', title='Người làm công tác y tế',
                     text='Sơ cấp cứu, phòng chống TNLĐ và bệnh nghề nghiệp.'),
                dict(photo='group6', badge='Nhóm 6', title='An toàn, vệ sinh viên',
                     text='Nhận diện nguy cơ, xây dựng văn hóa an toàn.')]),
    dict(slide='spotlight', title='Số hóa quản lý ATVSLĐ', tag='Đào tạo', num=3,
         sub='Ký hợp đồng đào tạo → doanh nghiệp được cấp tài khoản quản lý riêng, không phải mua phần mềm',
         image='screen_dashboard', frame='browser', url='doanhnghiep.vienstp.com', mode='left', image_w=7.4,
         image2='screen_lookup', frame2='browser', url2='daotao.vienstp.com', image2_w=0.5,
         items=[['layout-dashboard', 'Dashboard tuân thủ real-time', 'Tỷ lệ nhân sự đã / chưa huấn luyện, báo cáo '
                                                                   'trực quan cho lãnh đạo.'],
                ['bell-ring', 'Cảnh báo tự động', 'Chứng chỉ sắp hết hạn (trước 30 ngày), thiết bị đến hạn kiểm '
                                                'định.'],
                ['qr-code', 'Tra cứu & xác thực 24/7', 'Theo mã chứng chỉ hoặc số CCCD, chống giả mạo chứng chỉ.'],
                ['user', 'Tài khoản cho từng học viên', 'Lộ trình học, yêu cầu bảo hộ lao động, báo cáo sự cố.']]),
    dict(slide='services', title='Đào tạo ứng dụng AI', tag='Đào tạo', num=3,
         sub='Thiết kế riêng theo nghiệp vụ – 30% kiến thức nền tảng, 70% thực hành trên công việc thật',
         photo='ai_learners', focus=[0.45, 0.5],
         items=[['landmark', 'Cơ quan nhà nước', 'Soạn thảo văn bản đúng NĐ 30/2020, tóm tắt văn bản đến, tổng '
                                                'hợp báo cáo.'],
                ['building-2', 'Doanh nghiệp', 'AI thực chiến cho lãnh đạo, marketing, nhân sự, sản xuất, bán '
                                              'hàng.'],
                ['graduation-cap', 'Đơn vị giáo dục', 'Chuẩn hóa năng lực số, đổi mới phương pháp giảng dạy.'],
                ['user', 'Cá nhân', 'Chatbot, AI Automation, Vibe Coding, AI sản xuất media.'],
                ['shield-check', 'AI an toàn, đúng quy định', 'Bảo vệ dữ liệu, kiểm chứng kết quả trước khi sử '
                                                             'dụng.']]),
    dict(slide='big_numbers', title='Khảo thí Cambridge & tuyển sinh', tag='Đào tạo', num=3,
         sub='Trung tâm đào tạo, khảo thí tiếng Anh và đầu mối tuyển sinh chính quy',
         photo='cambridge', focus=[0.5, 0.5],
         items=[['monitor', '250', '', 'thí sinh / ca thi tại phòng thi máy tính'],
                ['award', '10', '', 'chứng chỉ chuẩn Cambridge: Starters → Proficiency, Linguaskill, CEST'],
                ['graduation-cap', '6', '', 'bậc tuyển sinh liên kết: Sơ cấp → Tiến sĩ'],
                ['presentation', '24/7', '', 'tra cứu chứng chỉ trực tuyến; tổ chức hội nghị, hội thảo']]),
    dict(slide='section', num=4, title='Truy xuất\nnguồn gốc', photo='coffee', focus=[0.5, 0.5],
         desc='Minh bạch chuỗi giá trị – mở rộng thị trường xuất khẩu'),
    dict(slide='spotlight', title='Truy xuất nguồn gốc chuẩn GS1', tag='Truy xuất', num=4,
         sub='Hệ thống HLHT TRACE – tuân thủ Thông tư 02/2024/TT-BKHCN và Nghị định 37/2026/NĐ-CP',
         image='crate', mode='center',
         items=[['file-check', 'Khởi tạo dữ liệu', 'Hồ sơ điện tử riêng cho từng lô sản phẩm, kê khai ngay trên '
                                                  'điện thoại.'],
                ['link', 'Đồng bộ hệ thống', 'Kết nối Cổng thông tin truy xuất nguồn gốc sản phẩm, hàng hóa quốc '
                                            'gia.'],
                ['qr-code', 'Tem & hộ chiếu số', 'Tem điện tử, tem vật lý, tem chống giả, hộ chiếu số sản phẩm.'],
                ['globe', 'Tiếp cận thị trường', 'Gia tăng niềm tin người tiêu dùng, đủ điều kiện xuất khẩu.']]),
    dict(slide='cards', title='Lĩnh vực áp dụng', tag='Truy xuất', num=4, cols=3,
         sub='Đồng hành cùng địa phương, doanh nghiệp và hợp tác xã trong nhiều ngành hàng',
         items=[dict(photo='prawns', caption='Thủy sản'), dict(photo='coffee', caption='Nông sản'),
                dict(photo='rolls', caption='Thực phẩm'), dict(photo='pills', caption='Dược phẩm'),
                dict(photo='aisle', caption='Hàng tiêu dùng'),
                dict(photo='processing', caption='Công nghiệp chế biến', focus=[0.5, 0.4])]),
    dict(slide='spotlight', title='Minh bạch trong tầm tay', tag='Truy xuất', num=4,
         sub='Người tiêu dùng chỉ cần quét mã – doanh nghiệp quản trị toàn chuỗi',
         image='phone', mode='right', image_w=5.2,
         items=[['scan-line', 'Quét camera thường', 'Không cần tải ứng dụng, xem ngay hành trình sản phẩm.'],
                ['badge-check', 'Dấu tích “Đã xác thực”', 'Thông tin doanh nghiệp, sản phẩm được xác thực, hiển thị '
                                                          'trực quan.'],
                ['map', 'Bản đồ vùng trồng', 'Ghim tọa độ vùng trồng, cơ sở sản xuất trên bản đồ số.'],
                ['shield-check', 'Tháp điều khiển chống giả AI', 'Tự động cảnh báo, khóa mã khi một serial bị quét '
                                                                'bất thường.']]),
    dict(slide='section', num=5, title='Nông nghiệp\nthông minh IoT', photo='solar_node', focus=[0.5, 0.5],
         desc='Chạm vào dữ liệu – dẫn đầu nghề nông'),
    dict(slide='spotlight', title='Hệ sinh thái BOM IoT', tag='IoT', num=5,
         sub='Viện STP – đại diện phát triển giải pháp của BOM Software (thành viên LATOI Australia) tại Việt Nam',
         image='farm', mode='center', soft=True,
         items=[['radio-tower', 'Cảm biến 9 trong 1', 'Nhiệt độ, độ ẩm, pH, EC, N-P-K, độ mặn, TDS… đo ngay '
                                                          'tại nguồn.'],
                ['wifi', 'LoRaWAN tầm xa', 'Phủ sóng đến 15 km, năng lượng mặt trời, không cần kéo dây điện.'],
                ['bell-ring', 'Cloud & App 24/7', 'Giám sát trên web, Android, iOS; cảnh báo SMS khi vượt ngưỡng.'],
                ['brain', 'AI & Blockchain', 'Chẩn đoán sâu bệnh, phát hiện phân bón giả; dữ liệu không thể sửa.']]),
    dict(slide='spotlight', title='Cảm biến All-in-One chuyên dụng', tag='IoT', num=5,
         sub='Chuẩn quốc tế, bảo chứng bởi chuyên gia ICT 25 năm kinh nghiệm (chứng chỉ CP – ACS)',
         image='sensor', mode='left', image_w=5.4, image2='handheld', image2_w=0.48,
         items=[['gauge', 'Đo lường toàn diện', '9 chỉ số môi trường, nhận kết quả chỉ sau 5 giây.'],
                ['droplets', 'Bền bỉ ngoài hiện trường', 'Thiết bị RFID chuẩn IP68, chịu nước, gắn được trên vật '
                                                        'nuôi.'],
                ['flask-conical', 'Phát hiện kim loại nặng', 'Mở rộng cảm biến Cadimi, Chì, Thủy ngân, Asen.'],
                ['sparkles', 'Hai phiên bản linh hoạt', 'LoRaWAN giám sát liên tục · WiFi/Bluetooth cầm tay kiểm '
                                                       'tra nhanh.']]),
    dict(slide='chart', title='Giá trị kinh tế vượt trội', tag='IoT', num=5,
         sub='Hiệu quả thực tế tại các trang trại đã triển khai hệ thống BOM IoT',
         chart=dict(kind='bar', cats=['Tăng năng suất', 'Giảm lãng phí phân bón', 'Tiết kiệm nhân công'],
                    series=[['Mức cải thiện (%)', [20, 30, 50]]], fmt='0"%"', max=60),
         kpis=[['+20', '%', 'năng suất cây trồng'], ['−30', '%', 'phân bón lãng phí'],
               ['−50', '%', 'chi phí nhân công giám sát']],
         note='Nguồn: BOM Technology – số liệu tại các trang trại đã triển khai.'),
    dict(slide='section', num=6, title='Đối tác\n& mạng lưới', photo='handshake', focus=[0.5, 0.5],
         desc='Quy mô toàn quốc – sẵn sàng hợp tác phát triển bền vững'),
    dict(slide='partners', title='Mạng lưới đối tác chiến lược', tag='Đối tác', num=6,
         groups=[dict(label='Công nghệ & truy xuất', logos=['p11', 'p15', 'p14', 'p12', 'p6', 'p16', 'p13']),
                 dict(label='Giáo dục & tuyển sinh', logos=['p5', 'p7', 'p8', 'p4', 'p9']),
                 dict(label='Du lịch & dịch vụ', logos=['p1', 'p2', 'p3', 'p10'])]),
    dict(slide='cards', title='Khách hàng tiêu biểu – huấn luyện ATLĐ', tag='Đối tác', num=6, cols=4,
         sub='Một số doanh nghiệp đã tin tưởng lựa chọn Viện STP và DAKO',
         items=[dict(photo='client128', caption='Asanka', size=12), dict(photo='client129', caption='Emivest Feedmill V.N', size=12),
                dict(photo='client130', caption='Hogetsu Việt Nam', size=12), dict(photo='client131', caption='Thang máy Pacific', size=12),
                dict(photo='client132', caption='HT Vina', size=12), dict(photo='client133', caption='Toyota Thanh Xuân', size=12),
                dict(photo='client134', caption='Vina T&T', size=12), dict(photo='client135', caption='P.Dussmann Việt Nam', size=12)]),
    dict(slide='offices', title='Hệ thống văn phòng', tag='Đối tác', num=6,
         sub='Quy mô toàn quốc – sẵn sàng đồng hành cùng các địa phương',
         map='map_vn',
         offices=[dict(name='Trụ sở Hà Nội', pin=[0.2484, 0.1625],
                       address='Tầng 12, Tòa nhà Diamond Flower, 48 Lê Văn Lương, phường Yên Hòa, TP. Hà Nội',
                       phone='Hotline: 0827.695.368'),
                  dict(name='Văn phòng Nha Trang', pin=[0.4643, 0.71],
                       address='B19-03 Khu đô thị An Bình Tân, phường Nam Nha Trang, tỉnh Khánh Hòa',
                       phone='Hotline: 0968.702.701'),
                  dict(name='Trung tâm tuyển sinh TP.HCM', pin=[0.3057, 0.80],
                       address='Số 28, đường D9, KDC Carric, phường An Khánh, TP. Hồ Chí Minh',
                       phone='Hotline: 0827.695.368')]),
    dict(slide='thanks', title='Xin cảm ơn', sub='Viện STP – Đồng hành cùng phát triển bền vững', qr='qr',
         lines=[['globe', 'www.vienstp.com'], ['mail', 'viencongnghestp@gmail.com'],
                ['phone', '0827.695.368 · 0968.702.701'],
                ['map-pin', 'Tầng 12, Diamond Flower, 48 Lê Văn Lương, Hà Nội']]),
]

NOTES = [
    'Kính thưa Quý vị đại biểu. Thay mặt Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP, xin trân trọng giới '
    'thiệu năng lực và các dịch vụ trọng tâm của Viện.',
    'Bài trình bày gồm 6 phần: giới thiệu Viện; nghiên cứu khoa học và chuyển đổi số; đào tạo và cấp chứng chỉ; truy '
    'xuất nguồn gốc; nông nghiệp thông minh IoT; và mạng lưới đối tác.',
    'Viện STP là tổ chức KH&CN trực thuộc VUSTA, được cấp Giấy chứng nhận hoạt động KH&CN năm 2020. Viện có 3 văn '
    'phòng tại Hà Nội, Nha Trang, TP.HCM và phòng thi máy tính quy mô 250 thí sinh mỗi ca.',
    'Hoạt động của Viện xoay quanh 4 trụ cột: nghiên cứu và dự án; đào tạo và chứng chỉ; truy xuất nguồn gốc; chuyển '
    'đổi số và IoT. Bốn trụ cột bổ trợ nhau, tạo thành một hệ sinh thái phục vụ Nhà nước, doanh nghiệp và cộng đồng.',
    'Phần thứ hai: nghiên cứu khoa học và chuyển đổi số.',
    'Viện đồng hành cùng các địa phương theo 4 bước: khảo sát, đánh giá; tư vấn lập dự án KH&CN; hỗ trợ công bố khoa '
    'học; và chuyển giao kết quả thành giải pháp ứng dụng thực tế.',
    'Với doanh nghiệp, Viện không chỉ tư vấn mà trực tiếp xây dựng giải pháp: chẩn đoán mức độ trưởng thành số, phát '
    'triển phần mềm, giải pháp AI, đồng thời tư vấn thẩm định giá và tổ chức hội thảo khoa học.',
    'Phần thứ ba: đào tạo và cấp chứng chỉ – lĩnh vực Viện có bề dày triển khai lớn nhất.',
    'Hệ sinh thái đào tạo gồm 4 mảng: chứng chỉ nghiệp vụ ngắn hạn, huấn luyện an toàn vệ sinh lao động (trọng tâm), '
    'đào tạo ứng dụng AI, tuyển sinh và khảo thí tiếng Anh chuẩn Cambridge.',
    'Các chương trình chứng chỉ được xây dựng đúng căn cứ pháp lý của từng ngành. Học viên nhận Chứng nhận nghiệp vụ '
    'song ngữ, có số hiệu và tra cứu được trực tuyến.',
    'Viện huấn luyện đủ 6 nhóm đối tượng theo Nghị định 44/2016 và 140/2018, lý thuyết kết hợp thực hành tại doanh '
    'nghiệp, phối hợp triển khai cùng Công ty CP Kỹ thuật Hàng hải DAKO.',
    'Điểm khác biệt: khóa học có thể kết thúc sau vài ngày, nhưng an toàn lao động cần được quản lý mỗi ngày. Doanh '
    'nghiệp ký hợp đồng đào tạo được cấp tài khoản quản lý riêng; mỗi học viên có tài khoản cá nhân, tra cứu chứng chỉ '
    '24/7.',
    'Chương trình AI được thiết kế riêng theo nghiệp vụ từng đơn vị, với 70% thời lượng thực hành trên chính công việc '
    'hằng ngày; nguyên tắc xuyên suốt là dùng AI an toàn, đúng quy định.',
    'Trung tâm khảo thí có phòng thi máy tính 250 thí sinh mỗi ca, tổ chức các kỳ thi chuẩn Cambridge; Viện đồng thời '
    'là đầu mối tuyển sinh chính quy từ Sơ cấp đến Tiến sĩ.',
    'Phần thứ tư: truy xuất nguồn gốc.',
    'Cùng HL&HT, Viện triển khai hệ thống HLHT TRACE chuẩn GS1: khởi tạo hồ sơ điện tử cho từng lô hàng, đồng bộ với '
    'Cổng thông tin truy xuất quốc gia, cấp tem và hộ chiếu số sản phẩm, giúp doanh nghiệp đáp ứng Thông tư 02/2024.',
    'Giải pháp phù hợp nhiều ngành hàng: thủy sản, nông sản, thực phẩm, dược phẩm, hàng tiêu dùng và công nghiệp chế '
    'biến – đồng hành cùng địa phương, doanh nghiệp và hợp tác xã.',
    'Người tiêu dùng chỉ cần quét mã bằng camera thường để thấy hành trình sản phẩm và dấu tích “Đã xác thực”; doanh '
    'nghiệp có tháp điều khiển giám sát, tự động khóa mã khi phát hiện dấu hiệu làm giả.',
    'Phần thứ năm: nông nghiệp thông minh IoT.',
    'Viện STP là đại diện phát triển giải pháp BOM IoT của BOM Software, thành viên LATOI Australia. Hệ thống gồm cảm '
    'biến 9 trong 1, mạng LoRaWAN tầm xa, nền tảng Cloud và ứng dụng giám sát 24/7, cùng AI và Blockchain.',
    'Cảm biến All-in-One đo 9 chỉ số môi trường chỉ sau 5 giây, bền bỉ chuẩn IP68, có phiên bản giám sát liên tục và '
    'phiên bản cầm tay.',
    'Tại các trang trại đã triển khai, hệ thống giúp tăng 20% năng suất, giảm 30% phân bón lãng phí và tiết kiệm 50% '
    'nhân công giám sát.',
    'Phần cuối: đối tác và mạng lưới.',
    'Viện có mạng lưới đối tác chiến lược trong công nghệ – truy xuất, giáo dục – tuyển sinh và du lịch – dịch vụ.',
    'Một số doanh nghiệp tiêu biểu đã tin tưởng lựa chọn Viện STP và DAKO cho công tác huấn luyện an toàn lao động.',
    'Hệ thống văn phòng tại Hà Nội, Nha Trang và TP. Hồ Chí Minh giúp Viện sẵn sàng đồng hành cùng các địa phương trên '
    'cả nước.',
    'Xin trân trọng cảm ơn Quý vị đã lắng nghe. Viện STP mong được hợp tác, đồng hành cùng Quý cơ quan, doanh nghiệp.',
]
assert len(NOTES) == len(slides), (len(NOTES), len(slides))
for sl, nt in zip(slides, NOTES):
    sl['notes'] = nt

content = dict(template='M08', title='Viện STP – Hồ sơ năng lực và dịch vụ trọng tâm', brand=brand, photos=photos,
               credit_intro='Ảnh: tư liệu của Viện STP, Công ty CP Kỹ thuật Hàng hải DAKO, Công ty CP Giải pháp Công '
                            'nghệ Việt Nam HL&HT và BOM Technology (LATOI Australia); ảnh minh họa ngành hàng từ Open '
                            'Images (Google), giấy phép CC BY 2.0 — danh sách bên dưới. Bản đồ: Natural Earth. Icon: '
                            'Lucide (ISC). Font: Lexend Exa, Be Vietnam Pro (SIL OFL).',
               slides=slides)
with open(os.path.join(HERE, 'content.json'), 'w', encoding='utf-8') as f:
    json.dump(content, f, ensure_ascii=False, indent=1)
print('wrote', os.path.join(HERE, 'content.json'), len(slides), 'slides')
