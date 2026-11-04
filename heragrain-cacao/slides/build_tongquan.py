"""Bộ slide "Heragrain Cacao – Bức tranh tổng quan: bộ máy, quy trình, chứng nhận, nhân sự theo giai đoạn",
dựng từ mẫu M08 "Hồ sơ Doanh nghiệp" của Kho Mẫu Slide DAKO (phong cách tech: nền tối phát sáng, biểu tượng vòng sáng,
số chương lớn, Morph giữa các slide, hiệu ứng xuất hiện theo thứ tự đọc), đổi sang màu nhận diện Heragrain.

    python build_tongquan.py     ->  ../2-tong-quan-bo-may/Heragrain-Cacao_Tong-quan-bo-may-quy-trinh-chung-nhan.pptx

Số liệu nhân sự, mốc thời gian là đề xuất của tư vấn; căn cứ pháp lý cập nhật đến 04/11/2026 (chi tiết trong file Word ở 5-phap-ly).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import tpl  # noqa: E402

T, CACAO_PHOTOS = tpl.setup()
import layouts_corporate as L  # noqa: E402
import corporate_build as CB  # noqa: E402

CHUP = os.path.join(HERE, 'anh', 'chup')
THEME = 'doanhnghiep'
CODE, TITLE = 'M08', 'Heragrain Cacao – Bức tranh tổng quan bộ máy, quy trình, chứng nhận, nhân sự'
DEFAULT_NAME = 'Heragrain-Cacao_Tong-quan-bo-may-quy-trinh-chung-nhan.pptx'
PHOTOS = json.load(open(os.path.join(T, 'assets', 'images', 'nongsan_photos.json'), encoding='utf-8'))
PHOTOS.update(CACAO_PHOTOS)
PHOTOS.update({os.path.splitext(f)[0]: os.path.join(CHUP, f) for f in os.listdir(CHUP) if f.endswith('.jpg')})
BRAND = dict(name='Heragrain', short='Heragrain', initial='H', tagline='Thấy tận mắt, ăn yên tâm',
             colors=dict(dark='0E2419', primary='23765C', light='E4A92A', pale='E7EFE9', ink='12301F', text='46574E',
                         muted='87978F', bg='F6F3EC', card='FFFFFF', accent='E4A92A', line='D8E1DA', ring='F2D58A',
                         chart=['23765C', 'E4A92A', '5A3825', '5E9E68']))
LIGHT_PHOTO = 'pods_basket'
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0. Hình sơ đồ 3D và tham quan 360°: chụp từ mô hình '
                'xưởng ca cao Heragrain (thư mục 3-so-do-3d, 4-tham-quan-360), dựng từ bản vẽ tay, chưa phải ảnh thật. '
                'Biểu tượng vòng tròn vẽ bằng mã. Icon: Lucide (ISC). Font: Lexend Exa, Be Vietnam Pro (SIL OFL).')
NOTE = ('Số người, mốc thời gian, cỡ máy là đề xuất của tư vấn; quy định cập nhật đến 04/11/2026, cần xác nhận lại với cơ '
        'quan cấp phép khi nộp hồ sơ.')


def build_content():
    return [
        (L.cover, dict(kicker='HTX Heragrain · Sản phẩm đầu tiên', line1='Dòng sản phẩm ca cao', name='Heragrain Cacao',
                       slogan='Bộ máy · Quy trình · Chứng nhận · Nhân sự theo từng giai đoạn',
                       presenter='Ca cao thô và chế biến sâu  ·  Đắk Lắk, tháng 11/2026', photos=['pods_basket', 'grinder'],
                       notes='Bức tranh tổng quan cho Ban lãnh đạo HTX. ' + NOTE)),
        (L.agenda, dict(title='Nội dung', items=['Bức tranh tổng quan', 'Chuỗi giá trị ca cao', 'Quy trình ca cao thô',
                                                 'Quy trình chế biến sâu', 'Nhà xưởng theo giai đoạn', 'Bộ máy tổ chức',
                                                 'Nhân sự theo giai đoạn', 'Giấy chứng nhận, pháp lý', 'Việc cần làm 90 ngày'])),
        (L.section, dict(num=1, title='Bức tranh\ntổng quan', photo='pods_bowl', focus=[0.5, 0.5],
                         desc='Ca cao là sản phẩm đầu tiên của Heragrain: đi từ hàng thô đến chế biến sâu')),
        (L.overview, dict(title='Heragrain Cacao', tag='Tổng quan', num=1,
                          sub='Mua hạt lên men từ HTX, rang, tách vỏ, chế biến sâu tại xưởng cũ',
                          text='**HTX Heragrain** (đăng ký ngày 22/9/2025) chọn **ca cao** làm sản phẩm đầu tiên, gồm hai mảng:\n'
                               '**Hàng thô**: hạt rang và nibs bán cho nhà máy socola, công ty bánh kẹo, gửi mẫu chào đơn vị '
                               'xuất khẩu.\n'
                               '**Chế biến sâu**: socola đen, bột và bơ ca cao, sau cùng là socola mix vị đặc sản Tây Nguyên. '
                               'Xưởng cũ khoảng 200 m² được bố trí lại thành dây chuyền một chiều.',
                          photo='pods_basket', focus=[0.5, 0.5],
                          stats=[['map', '2.000', ' ha', 'ca cao ở Đắk Lắk (có số đánh giá 1.140 ha)'],
                                 ['package', '1.650', ' tấn', 'hạt khô Đắk Lắk năm 2025, ước tính'],
                                 ['factory', '200', ' m²', 'xưởng cũ dành cho dây chuyền ca cao'],
                                 ['users', '9→30', '', 'người, dựng dần qua 4 giai đoạn']])),
        (L.hub, dict(title='Bốn trụ cột', tag='Tổng quan', num=1, sub='Dựng song song, mỗi giai đoạn thêm một lớp',
                     items=[['network', 'Bộ máy', 'HTX: Đại hội thành viên, HĐQT, Ban kiểm soát; **Giám đốc điều hành** và 8 bộ phận.'],
                            ['workflow', 'Quy trình', '11 bước một chiều; **2 CCP đề xuất**: rang và dò kim loại, chốt khi xây HACCP.'],
                            ['badge-check', 'Chứng nhận', 'Từ **GCN ATTP, tự công bố** đến **HACCP/ISO 22000**, FSSC 22000, EUDR.'],
                            ['users', 'Nhân sự', '**9–10** người (hàng thô) lên **24–30** người (mix vị, xuất khẩu).']])),
        (L.milestones, dict(title='Bốn giai đoạn', tag='Tổng quan', num=1, sub='Mỗi giai đoạn mở thêm một dòng sản phẩm',
                            events=[['Q1–Q2/2027', 'GĐ1 · Hàng thô', 'Thu mua hạt lên men; rang, tách vỏ; bán hạt rang, nibs.'],
                                    ['Q3–Q4/2027', 'GĐ2 · Socola', 'Nghiền mịn với đường; tôi, đổ khuôn; socola đen 70–100 %.'],
                                    ['Q1–Q2/2028', 'GĐ3 · Bột, bơ', 'Ép bơ ca cao, nghiền bột; chứng nhận HACCP/ISO 22000.'],
                                    ['Từ Q3/2028', 'GĐ4 · Mix vị, XK', 'Socola đặc sản Tây Nguyên; FSSC 22000, EUDR, GACC.']])),
        (L.section, dict(num=2, title='Chuỗi giá trị\n& quy trình', photo='beans_dry', focus=[0.5, 0.5],
                         desc='Ai làm gì, từ quả ca cao đến thanh socola')),
        (L.services, dict(title='Chuỗi giá trị ca cao', tag='Quy trình', num=2, dark=True,
                          sub='Heragrain tập trung từ hạt khô trở đi', photo='pods_basket', focus=[0.5, 0.5],
                          items=[['sprout', 'Nông hộ, HTX trồng ca cao', 'Hái quả chín, tách hạt; ghi nhật ký vườn, tọa độ vườn.'],
                                 ['flame', 'HTX lên men, phơi', 'Ủ thùng gỗ, đảo theo ngày; phơi giàn đến độ ẩm ghi trong hợp đồng.'],
                                 ['factory', 'Heragrain · hàng thô', 'Kiểm nhận, làm sạch, rang, tách vỏ thành nibs.'],
                                 ['cookie', 'Heragrain · chế biến sâu', 'Nghiền mịn → socola; ép → bơ và bột; mix vị.'],
                                 ['truck', 'Khách hàng', 'Nhà máy socola, bánh kẹo, xuất khẩu; bán lẻ, quà tặng.']])),
        (L.table_slide, dict(title='Quy trình ca cao thô', tag='Quy trình', num=2, sub='GĐ1 · từ hạt khô đến nibs đóng túi',
                             rows=[['Bước', 'Công đoạn', 'Thiết bị', 'Kiểm soát'],
                                   ['1', 'Nhận hạt khô, cân, lấy mẫu', 'Cân sàn, xiên lấy mẫu', 'Hợp đồng, mã lô theo vườn'],
                                   ['2', 'Kiểm nhận', 'Máy đo ẩm, dao cut test', 'Độ ẩm, cut test theo hợp đồng (đề xuất ≤ 7,5 %)'],
                                   ['3', 'Làm sạch, phân loại', 'Sàng rung, bàn nhặt', 'Loại đá, cành, hạt dính chùm'],
                                   ['4', 'Rang', 'Máy rang trống 15–30 kg/mẻ', 'CCP 1: nhiệt độ, thời gian'],
                                   ['5', 'Nghiền vỡ, tách vỏ', 'Máy tách vỏ, cyclone', 'Lượng vỏ còn lẫn trong nibs'],
                                   ['6', 'Phân cỡ, đóng gói nibs', 'Sàng, cân, máy hàn túi', 'Túi kín, nhãn, mã lô']],
                             col_w=[0.7, 3.2, 3.3, 3.8],
                             note='Chỉ tiêu nhận hạt đối chiếu bảng yêu cầu TCVN 7519:2020 (ISO 2451:2017), lấy mẫu TCVN 7521:2020; cut test 300 hạt là thông lệ; thông số rang chốt bằng thẩm định quá trình.')),
        (L.table_slide, dict(title='Quy trình chế biến sâu', tag='Quy trình', num=2, sub='GĐ2–GĐ4 · từ nibs đến socola, bột, bơ',
                             rows=[['Bước', 'Công đoạn', 'Thiết bị', 'Kiểm soát'],
                                   ['7', 'Nghiền mịn với đường (conche)', 'Máy nghiền đá 3 × 20 kg', 'Độ mịn, thời gian, nhiệt độ'],
                                   ['8', 'Ép bơ, nghiền rây bột (GĐ3)', 'Máy ép thủy lực, máy nghiền, rây', 'Nhiệt độ, áp suất; lưới rây'],
                                   ['9', 'Tôi, đổ khuôn, làm lạnh', 'Máy tôi, khuôn, tủ mát', 'Đường cong tôi; phòng 18–20 °C'],
                                   ['10', 'Gói, dò kim loại, dán nhãn', 'Máy dò kim loại, máy hàn', 'CCP 2: dò kim loại (GĐ3)'],
                                   ['11', 'Kho mát, xuất hàng', 'Điều hòa, kệ, pallet', '15–18 °C; FIFO/FEFO'],
                                   ['+', 'Mix vị, bọc socola (GĐ4)', 'Nồi bao (panning)', 'Quản lý chất gây dị ứng']],
                             col_w=[0.7, 3.2, 3.3, 3.8],
                             note='Codex CXS 87-1981 (socola), CXS 105-1981 (bột), CXS 86-1981 (bơ ca cao). Nhiệt độ phòng, kho là thông lệ ngành, đề xuất.')),
        (L.spotlight, dict(title='Xưởng cũ cho ca cao', tag='Nhà xưởng', num=2, sub='Dòng một chiều qua 5 phòng, không xây mới',
                           image='3d-xuong-gd4', frame='browser', url='so-do-3d · xuong-ca-cao-heragrain', mode='left', image_w=7.3,
                           items=[['warehouse', 'Phòng 1 · kho hạt', 'Kiểm nhận, làm sạch; bao trên pallet theo mã lô.'],
                                  ['flame', 'Phòng 2 · rang, tách vỏ', 'Chụp hút, ống khói qua mái; bịt cửa sang kho.'],
                                  ['cog', 'Phòng 3 · nibs, nghiền, ép', 'Phân cỡ nibs; máy nghiền đá; máy ép (GĐ3).'],
                                  ['snowflake', 'Phòng 5 · khu sạch, kho mát', 'Socola 18–20 °C; kho thành phẩm 15–18 °C.']])),
        (L.cards, dict(title='Tham quan 360° xưởng', tag='Nhà xưởng', num=2, sub='Mô hình dựng từ bản vẽ tay, file kèm theo bộ slide',
                       cols=3, photo_ratio=0.62,
                       items=[dict(photo='360-kho-hat', title='Kho hạt, kiểm nhận', badge='GĐ1', text='Bao đay trên pallet; bàn cut test; sàng làm sạch.'),
                              dict(photo='360-phong-rang', title='Phòng rang, tách vỏ', badge='GĐ1', text='Máy rang trống, sàng nguội, máy tách vỏ.'),
                              dict(photo='360-phong-nibs', title='Nibs, nghiền, ép', badge='GĐ1–3', text='Máy nghiền đá, máy ép thủy lực, máy nghiền bột.'),
                              dict(photo='360-khu-sach', title='Khu sạch socola', badge='GĐ2', text='Máy tôi, bàn đổ khuôn, tủ mát; 18–20 °C.'),
                              dict(photo='360-kho-tp', title='Kho thành phẩm mát', badge='GĐ1', text='Kệ, pallet; góc QC, tủ lưu mẫu từ GĐ3.'),
                              dict(photo='360-lenmen', title='Điểm lên men của HTX', badge='Đối tác', text='Thùng gỗ ủ, giàn phơi; Heragrain kiểm từng lô.')])),
        (L.table_slide, dict(title='Nhà xưởng theo giai đoạn', tag='Nhà xưởng', num=2, sub='Cải tạo dần, máy thêm theo dòng sản phẩm',
                             rows=[['Giai đoạn', 'Cải tạo, lắp đặt', 'Thiết bị chính'],
                                   ['GĐ1 · Hàng thô', 'Lợp mái sân sau, lối đi; ngăn phòng 6; chụp hút phòng rang',
                                    'Cân, máy đo ẩm, sàng rung, máy rang, máy tách vỏ, máy hàn túi'],
                                   ['GĐ2 · Socola', 'Nửa tây phòng 5 thành khu sạch có điều hòa; trạm rửa tay',
                                    'Máy nghiền đá, máy tôi, khuôn, tủ mát'],
                                   ['GĐ3 · Bột, bơ', 'Góc QC, tủ lưu mẫu trong kho thành phẩm',
                                    'Máy ép thủy lực, máy nghiền bột, rây, máy dò kim loại'],
                                   ['GĐ4 · Mix vị', 'Góc trưng bày ở nhà ở (nếu gia đình đồng ý)',
                                    'Nồi bao, tủ sấy vỏ làm trà, kho mát mở rộng']],
                             col_w=[2.0, 4.6, 4.4],
                             note='Cỡ máy chốt theo công suất mục tiêu (100–200 kg hạt/ngày) và nguồn điện thực tế.')),
        (L.section, dict(num=3, title='Bộ máy\n& nhân sự', photo='chocolatier', focus=[0.5, 0.4],
                         desc='Dựng dần, không tuyển một lần')),
        (L.org_chart, dict(title='Bộ máy tổ chức', tag='Bộ máy', num=3, sub='Theo Luật Hợp tác xã 2023; 8 bộ phận dưới Giám đốc điều hành',
                           levels=[['Đại hội thành viên HTX'], ['Hội đồng quản trị', 'Ban kiểm soát'], ['Giám đốc điều hành'],
                                   ['Thu mua, vùng nguyên liệu', 'Sản xuất', 'QA/QC, ATTP', 'R&D sản phẩm', 'Kho, logistics',
                                    'Kinh doanh, xuất khẩu', 'Hành chính, kế toán']])),
        (L.table_slide, dict(title='Nhân sự theo giai đoạn', tag='Nhân sự', num=3, sub='Số người cuối mỗi giai đoạn (ước tính)',
                             rows=[['Bộ phận', 'GĐ1 · Hàng thô', 'GĐ2 · Socola', 'GĐ3 · Bột, bơ', 'GĐ4 · Mix vị, XK'],
                                   ['Ban điều hành', '1', '1', '1', '1'],
                                   ['Thu mua, vùng nguyên liệu', '2', '2', '2–3', '3'],
                                   ['Sản xuất · sơ chế, rang', '2–3', '3', '3', '3–4'],
                                   ['Sản xuất · chế biến sâu', '–', '3–4', '5–6', '7–9'],
                                   ['QA/QC, ATTP', '1', '1–2', '2', '2–3'],
                                   ['R&D sản phẩm', 'GĐ kiêm', '1', '1', '1–2'],
                                   ['Kho, logistics', '1', '1', '1–2', '2'],
                                   ['Kinh doanh, xuất khẩu', '1', '2', '2', '3–4'],
                                   ['Hành chính, kế toán', '1', '1', '1–2', '2'],
                                   ['Tổng', '9–10', '15–17', '18–22', '24–30']],
                             col_w=[3.2, 2.0, 2.0, 2.0, 2.0],
                             note='Chưa tính lao động thời vụ; sản xuất chạy 1 ca ở GĐ1–2, 2 ca ở GĐ4 nếu đơn hàng đủ.')),
        (L.chart, dict(title='Quy mô nhân sự', tag='Nhân sự', num=3, sub='Tăng theo dòng sản phẩm, không theo diện tích',
                       chart=dict(kind='bar', cats=['GĐ1 · Hàng thô', 'GĐ2 · Socola', 'GĐ3 · Bột, bơ', 'GĐ4 · Mix vị, XK'],
                                  series=[['Tối thiểu (người)', [9, 15, 18, 24]], ['Tối đa (người)', [10, 17, 22, 30]]], fmt='0', max=32),
                       kpis=[['9–10', ' người', 'giai đoạn 1: hàng thô, 1 ca'], ['24–30', ' người', 'giai đoạn 4: mix vị, xuất khẩu'],
                             ['8', ' bộ phận', 'đủ chuỗi từ thu mua đến xuất khẩu']],
                       note='Ước tính của tư vấn cho xưởng khoảng 200 m²; chốt theo công suất máy và đơn hàng.')),
        (L.services, dict(title='Vị trí then chốt', tag='Nhân sự', num=3, dark=False, sub='Tuyển hoặc bổ nhiệm trước tiên',
                          photo='tasting', focus=[0.5, 0.5],
                          items=[['user-check', 'Giám đốc điều hành', 'Chịu trách nhiệm hệ thống ATTP, duyệt xuất lô (GĐ1).'],
                                 ['shield-check', 'Trưởng QA, đội HACCP', 'Cut test, hồ sơ lô, tự công bố, kiểm nghiệm (GĐ1).'],
                                 ['flame', 'Kỹ thuật rang, chocolatier', 'Đường cong rang, công thức socola, tôi (GĐ1–2).'],
                                 ['map-pin', 'Phụ trách vùng nguyên liệu', 'Hợp đồng HTX, tọa độ vườn, hồ sơ EUDR (GĐ1).'],
                                 ['globe', 'Quản lý xuất khẩu', 'Khách B2B, chứng từ, C/O, GACC (GĐ2–4).']])),
        (L.section, dict(num=4, title='Giấy chứng nhận\n& pháp lý', photo='beans_dark', focus=[0.5, 0.5],
                         desc='Đủ giấy để bán trong nước trước, chứng nhận quốc tế theo thị trường')),
        (L.table_slide, dict(title='Pháp lý nền tảng (GĐ1)', tag='Chứng nhận', num=4, sub='Bắt buộc trước khi bán lô hàng đầu',
                             rows=[['Hồ sơ', 'Nơi nộp, cơ quan cấp', 'Căn cứ chính'],
                                   ['Bổ sung ngành nghề HTX (1073, 4632, 4620)', 'Cơ quan đăng ký kinh doanh cấp xã nơi HTX đặt trụ sở', 'Luật HTX 2023; NĐ 125/2025; QĐ 36/2025/QĐ-TTg'],
                                   ['GCN cơ sở đủ điều kiện ATTP', 'Chi cục QLCL NLS&TS (Sở NN&MT Đắk Lắk); socola: Sở Công Thương — chốt đầu mối', 'NĐ 15/2018 (NĐ 46/2026 đang tạm ngưng)'],
                                   ['Tự công bố sản phẩm', 'Cơ quan do UBND tỉnh chỉ định; kèm phiếu kiểm nghiệm ≤ 12 tháng', 'NĐ 15/2018 Điều 4, 5'],
                                   ['Mã số mã vạch GS1', 'GS1 Việt Nam, nộp trực tuyến', 'NĐ 37/2026/NĐ-CP'],
                                   ['Nhãn hiệu Heragrain (nhóm 29, 30, 31)', 'Cục Sở hữu trí tuệ', 'Luật SHTT, sửa đổi 131/2025/QH15'],
                                   ['Đăng ký môi trường; PCCC', 'UBND cấp xã; Công an (PCCC)', 'NĐ 08/2022 (sửa đổi 05/2025); NĐ 105/2025']],
                             col_w=[3.1, 4.6, 3.3],
                             note='Nhãn theo NĐ 37/2026/NĐ-CP (thay NĐ 43/2017, 111/2021). Chi tiết thủ tục, mẫu đơn: file Word kèm theo.')),
        (L.pillars, dict(title='Thang chứng nhận', tag='Chứng nhận', num=4,
                         lead='Chứng nhận đi theo thị trường: đủ nền tảng để bán trong nước, nâng dần khi xuất khẩu.',
                         photo='giftbox', focus=[0.5, 0.5],
                         items=[['file-check-2', 'Nền tảng · GĐ1–2', ['**GCN ATTP**, tự công bố, nhãn đúng NĐ 37/2026',
                                                                       'Khám sức khỏe, tập huấn ATTP', 'Kiểm nghiệm định kỳ']],
                                ['shield-check', 'Hệ thống · GĐ3', ['**HACCP** hoặc **ISO 22000:2018**', 'Còn hiệu lực thì được miễn GCN ATTP',
                                                                    'OCOP (tùy chọn)']],
                                ['globe', 'Quốc tế · GĐ4', ['**FSSC 22000** hoặc **BRCGS** theo người mua', '**EUDR** cho ca cao vào EU',
                                                            'GACC (Trung Quốc); hữu cơ, Rainforest Alliance, Fairtrade (tùy chọn)']]])),
        (L.big_numbers, dict(title='Các con số phải giữ', tag='Chứng nhận', num=4, sub='Ngưỡng kỹ thuật dùng hằng ngày',
                             photo='choc_close', focus=[0.5, 0.5],
                             items=[['droplets', '7,5', ' %', 'độ ẩm nhận hạt đề xuất trong hợp đồng (đối chiếu TCVN 7519:2020)'],
                                    ['thermometer', '18–20', ' °C', 'khu sạch socola, kho mát 15–18 °C (thông lệ, đề xuất)'],
                                    ['scale', '0,8', ' mg/kg', 'cadimi EU, socola ≥ 50 % ca cao (nguồn thứ cấp, đối chiếu EUR-Lex)'],
                                    ['calendar', '30/12', '/2026', 'EUDR áp dụng cho ca cao (DN nhỏ: 30/6/2027)']])),
        (L.table_slide, dict(title='Thị trường xuất khẩu', tag='Chứng nhận', num=4, sub='Hai cửa đầu tiên, hai mức yêu cầu',
                             rows=[['Nội dung', 'Liên minh châu Âu (EU)', 'Trung Quốc'],
                                   ['Đăng ký nhà máy', 'Không; nhà nhập khẩu chịu trách nhiệm', 'Đăng ký GACC (Lệnh 280, từ 01/6/2026)'],
                                   ['Riêng ca cao', 'EUDR: tọa độ vườn, không phá rừng sau 31/12/2020', 'Hạt chưa rang: quản lý như nông sản sơ cấp (TB 219)'],
                                   ['Chất lượng, ATTP', 'HACCP bắt buộc; FSSC/BRCGS theo người mua', 'HACCP, ATTP; nhãn tiếng Trung, in mã GACC'],
                                   ['Giới hạn cần kiểm', 'Cadimi (Quy định (EU) 2023/915), MRL, độc tố vi nấm', 'GB 2762 (chất nhiễm bẩn), dư lượng'],
                                   ['Chứng từ', 'EUR.1 (EVFTA), hóa đơn, COA', 'C/O mẫu E (ACFTA) hoặc RCEP, COA']],
                             col_w=[2.3, 4.6, 4.1],
                             note='Cần xác nhận nhóm sản phẩm của socola, bột ca cao trên hệ thống GACC với nhà nhập khẩu.')),
        (L.section, dict(num=5, title='Việc cần làm\n90 ngày', photo='bar_foil', focus=[0.5, 0.5],
                         desc='Từ 12/2026 đến 3/2027, chuẩn bị lô hàng thô đầu tiên')),
        (L.table_slide, dict(title='Việc cần làm 90 ngày', tag='Lộ trình', num=5, sub='Ban lãnh đạo duyệt, giao người phụ trách',
                             rows=[['Việc', 'Phụ trách', 'Hạn'],
                                   ['Ký hợp đồng thu mua với 2–3 HTX ca cao; lập danh sách vườn kèm tọa độ', 'Thu mua', '01/2027'],
                                   ['Bổ sung ngành nghề HTX; nộp hồ sơ GCN cơ sở đủ điều kiện ATTP', 'Hành chính', '01/2027'],
                                   ['Đăng ký mã số mã vạch; nộp đơn nhãn hiệu Heragrain', 'Hành chính', '01/2027'],
                                   ['Chọn, đặt máy rang, máy tách vỏ; cải tạo phòng 1, 2, sân sau', 'Sản xuất', '02/2027'],
                                   ['Rang lô thử, kiểm nghiệm, tự công bố nibs', 'QA', '03/2027'],
                                   ['Gửi mẫu cho 5 khách B2B (nhà máy socola, bánh kẹo, xuất khẩu)', 'Kinh doanh', '03/2027']],
                             col_w=[7.0, 2.2, 1.8],
                             note='Bổ nhiệm Giám đốc điều hành và Trưởng QA ngay từ đầu.')),
        (L.table_slide, dict(title='Mức độ căn cứ', tag='Lộ trình', num=5, sub='Điều đã kiểm chứng và điều còn là đề xuất',
                             rows=[['Nhóm nội dung', 'Mức căn cứ', 'Ghi chú'],
                                   ['Văn bản pháp luật, cơ quan cấp', 'Có nguồn, cập nhật 04/11/2026', 'Cần cơ quan xác nhận đầu mối GCN ATTP ca cao và socola; nhóm GACC của socola'],
                                   ['Số liệu ca cao Đắk Lắk', 'Có nguồn: TT Khuyến nông Đắk Lắk 2025', 'Diện tích có hai số: 1.998 ha và 1.140 ha'],
                                   ['Ngưỡng độ ẩm, nhiệt độ phòng, kho', 'Thông lệ ngành, đề xuất', 'Đối chiếu TCVN 7519:2020; chốt bằng thử nghiệm'],
                                   ['Giới hạn cadimi EU', 'Nguồn thứ cấp', 'Đối chiếu Phụ lục I Quy định (EU) 2023/915 bản hợp nhất'],
                                   ['Nhân sự, công suất, cỡ máy', 'Ước tính của tư vấn', 'Chưa có định mức tham chiếu công khai cho xưởng quy mô này'],
                                   ['Mốc thời gian 4 giai đoạn', 'Đề xuất của tư vấn', 'Phụ thuộc vốn, tiến độ cải tạo, giấy phép'],
                                   ['Vốn đầu tư, giá bán, hiệu quả tài chính', 'Chưa có', 'Lập dự toán đầu tư, chi phí vận hành, khảo sát giá trước khi quyết định']],
                             col_w=[3.0, 2.8, 5.2],
                             note='Bộ slide mô tả tổ chức và tuân thủ; chưa phải phương án tài chính.')),
        (L.thanks, dict(title='Xin cảm ơn', sub='Heragrain Cacao · Thấy tận mắt, ăn yên tâm', photo='pods_basket',
                        lines=[['map-pin', 'HTX Heragrain, Đắk Lắk [cập nhật địa chỉ]'], ['phone', '[cập nhật số điện thoại]'],
                               ['mail', '[cập nhật email]'], ['globe', '[cập nhật website]']])),
    ]


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(HERE), '2-tong-quan-bo-may')
    os.makedirs(out, exist_ok=True)
    CB.build(sys.modules[__name__], out, None, DEFAULT_NAME)
