"""Bộ slide "Heragrain Cacao – 5 concept sản phẩm ca cao Đắk Lắk", dựng từ mẫu M07 "Nông sản Đặc sản" của Kho Mẫu Slide DAKO
(bố cục giới thiệu sản phẩm kiểu website: thanh điều hướng, băng chuyền sản phẩm trượt bằng Morph, chữ lớn, bao bì cửa sổ H).

    python build_concept.py            ->  ../1-concept-san-pham/Heragrain-Cacao_5-concept-san-pham.pptx

Bao bì là hình minh họa theo concept, vẽ bằng mã (cacao_assets.py + product_assets.py của kho mẫu); ảnh từ Open Images (CC BY 2.0).
Tên, quy cách, khách hàng là đề xuất của tư vấn, cần HTX duyệt trước khi in bao bì.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import tpl  # noqa: E402

T, CACAO_PHOTOS = tpl.setup()
import layouts_showcase as L  # noqa: E402
import showcase_build as SB  # noqa: E402

THEME = 'nongsan'
CODE, TITLE = 'M07', 'Heragrain Cacao – 5 concept sản phẩm ca cao Đắk Lắk'
DEFAULT_NAME = 'Heragrain-Cacao_5-concept-san-pham.pptx'
PHOTOS = json.load(open(os.path.join(T, 'assets', 'images', 'nongsan_photos.json'), encoding='utf-8'))
PHOTOS.update(CACAO_PHOTOS)
BRAND = dict(name='Heragrain', sub='Cacao', icon='leaf', menu=['Về chúng tôi', 'Concept', 'Vùng ca cao', 'Liên hệ'],
             tagline='Ca cao & socola · Đắk Lắk · Việt Nam',
             colors=dict(title='4A2C1C', accent='1D4B3A', accent2='E4A92A', bg='F6F0E6',
                         chart=['5A3825', 'E4A92A', '1D4B3A', 'B5742E']))
_H = dict(type='pouch_h', brand='Heragrain', brand_sub='CACAO', ink='1D4B3A', accent='E4A92A', notes='Single origin · Đắk Lắk')
_B = dict(type='bar_h', brand='Heragrain', brand_sub='CACAO', ink='1D4B3A', accent='E4A92A')
PRODUCTS = {
    # Concept 1 · Bazan Origin: hàng thô
    'nibs': dict(_H, name_en='Roasted Cocoa Nibs', name_vi='Nibs ca cao rang', weight='200g', band='5A3825', photo='tex_nibs'),
    'hat': dict(_H, name_en='Fermented Cocoa Beans', name_vi='Hạt ca cao lên men', weight='500g', band='7A4A2A', photo='beans_dry'),
    'bao': dict(type='sack', name='COCOA NIBS', sub='Roasted · Đắk Lắk', brand='Heragrain', weight='25 KG', base='8A6A45',
                accent='E4A92A', ink='FFFFFF', band='F2E9D8'),
    # Concept 2 · Đại Ngàn: socola đen
    'bar70': dict(_B, name_en='Dark Chocolate', name_vi='Socola đen Đắk Lắk', pct='70%', weight='80 g', photo='choc_close', band='3B2416'),
    'bar100': dict(_B, name_en='100% Cacao', name_vi='Socola không đường', pct='100%', weight='80 g', photo='bar_foil', band='2A1A10'),
    # Concept 3 · Cacao Thuần: bột, bơ
    'bot': dict(_H, name_en='Pure Cocoa Powder', name_vi='Bột ca cao nguyên chất', weight='250g', band='7A4A2A', photo='tex_bot'),
    'bo': dict(_H, name_en='Cocoa Butter', name_vi='Bơ ca cao thực phẩm', weight='200g', band='A87A2A', photo='tex_bo'),
    # Concept 4 · Tây Nguyên Fusion: mix vị
    'robusta': dict(_B, name_en='Robusta Coffee', name_vi='Socola cà phê Buôn Ma Thuột', pct='65%', weight='80 g', photo='choc_nuts',
                    band='1D4B3A', pct_label='CACAO · ROBUSTA'),
    'saurieng': dict(_B, name_en='Durian', name_vi='Socola sầu riêng sấy', pct='60%', weight='80 g', photo='durian_flesh', band='2F6B3F',
                     pct_label='CACAO · SẦU RIÊNG'),
    'chanhday': dict(_H, name_en='Passion Fruit Bites', name_vi='Chanh dây gừng bọc socola', weight='100g', band='7A3E8F', photo='truffles'),
    # Concept 5 · Quà Đại Ngàn: hộp quà, trà vỏ
    'hop': dict(_B, name_en='Đại Ngàn Gift Box', name_vi='Hộp quà ca cao Tây Nguyên', pct='6', pct_label='SẢN PHẨM TRONG HỘP',
                origin='QUÀ TẶNG · ĐẮK LẮK', weight='', photo='giftbox', band='1D4B3A'),
    'tra': dict(_H, name_en='Cocoa Husk Tea', name_vi='Trà vỏ ca cao', weight='50g', band='8A5A36', photo='tex_travo'),
}
DECOR_ART = {'leaf': ('leaf', dict(seed=2, color='2F6B3F', light='8CBF7A')),
             'chunk': ('slice_piece', dict(seed=3, color='4A2C1C', edge='2E1A10', w=360, h=260)),
             'nib': ('slice_piece', dict(seed=7, color='6B4226', edge='3B2416', w=220, h=160)),
             'leaf_b': ('leaf', dict(seed=5, color='5E9E68', light='B7D79A', curl=-0.2)),
             'butter': ('slice_piece', dict(seed=9, color='E8D49A', edge='C9A85E', w=300, h=220))}
GRASS = 'hills'
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0. Bao bì cửa sổ chữ H, hộp socola và nền nibs, bột, bơ, vỏ '
                'ca cao: hình minh họa theo concept, vẽ bằng mã — thay bằng ảnh sản phẩm thật. Icon: Lucide (ISC). '
                'Font: Baloo 2, Mulish, Dancing Script (SIL OFL).')
NOTE = ('Concept do tư vấn đề xuất cho HTX Heragrain. Tên sản phẩm, quy cách, khách hàng mục tiêu là đề xuất; số liệu vùng ca cao '
        'theo Trung tâm Khuyến nông Đắk Lắk (2025). Cần HTX duyệt trước khi thiết kế bao bì in.')


def build_content():
    return [
        (L.cover, dict(word='Heragrain', script='Cacao', products=['nibs', 'bot', 'tra'], kicker='5 concept sản phẩm ca cao',
                       tagline='Thấy tận mắt, ăn yên tâm · Ca cao lên men từ đất đỏ bazan Đắk Lắk', height=4.6, notes=NOTE)),
        (L.intro, dict(title='Ca cao Đắk Lắk', script='từ đất đỏ bazan', photo='pods_basket', focus=[0.5, 0.45],
                       text='Đắk Lắk có khoảng **2.000 ha ca cao** (có số đánh giá 1.140 ha), năng suất hơn **15 tạ hạt khô/ha**, '
                            'sản lượng 2025 ước **1.650 tấn** (Trung tâm Khuyến nông tỉnh). Ca cao thường trồng xen trong vườn '
                            'cà phê, cây ăn quả ở Krông Ana, Ea Kar, Buôn Đôn… **Heragrain** mua hạt đã lên men, phơi khô từ nông '
                            'hộ, HTX; rang, tách vỏ thành **nibs**; rồi chế biến sâu thành **socola, bột và bơ ca cao**.')),
        (L.story_product, dict(nav=0, title='Chuỗi giá trị', script='từ quả đến thanh socola', product='nibs', second='bot', side='right',
                               text='Nông hộ, HTX hái quả, tách hạt, **lên men, phơi khô**. Heragrain nhận hạt khô, **rang theo '
                                    'tiêu chuẩn, tách vỏ** thành nibs: bán thô cho nhà máy socola, công ty bánh kẹo, gửi mẫu '
                                    'chào đơn vị xuất khẩu. Phần giữ lại được **nghiền mịn** với đường thành socola, hoặc '
                                    '**ép** tách bơ ca cao và bột ca cao; sau cùng là **mix vị** đặc sản Tây Nguyên.')),
        (L.values_row, dict(nav=0, title='Giá trị', script='dòng ca cao Heragrain',
                            text='Bốn cam kết trên mỗi sản phẩm: **minh bạch**, **lên men chuẩn**, **thuần ca cao** và '
                                 '**không bỏ phí** phần nào của quả ca cao.',
                            items=[dict(product='nibs', label='Minh bạch', text='Cửa sổ H, truy xuất đến vườn'),
                                   dict(product='hat', label='Lên men chuẩn', text='Kiểm từng lô bằng cut test'),
                                   dict(product='bot', label='Thuần ca cao', text='Một vùng trồng, ghi mẻ rang'),
                                   dict(product='tra', label='Không bỏ phí', text='Vỏ lụa thành trà, phân bón')])),
        (L.concepts, dict(nav=1, title='5 concept', script='4 dòng chính, 1 dòng quà tặng',
                          items=[dict(label='Concept 1', slogan='Bazan Origin: hạt rang, nibs truy xuất đến vườn',
                                      products=['nibs', 'hat', 'bao'], palette=['5A3825', '8A6A45', 'E4A92A', '1D4B3A'],
                                      values=['B2B: bao 25 kg', 'Túi 200 g, hộp mẫu 3 vùng', 'Ghi lô, độ ẩm, cut test'],
                                      color='5A3825'),
                                 dict(label='Concept 2', slogan='Đại Ngàn 70: socola đen single origin Đắk Lắk',
                                      products=['bar70', 'bar100'], palette=['3B2416', '2A1A10', 'E4A92A', 'F6F0E6'],
                                      values=['Thanh 80 g: 70–100 %', 'Bean-to-bar tại xưởng', 'Hương trái cây lên men'],
                                      color='3B2416'),
                                 dict(label='Concept 3', slogan='Cacao Thuần: bột và bơ ca cao nguyên chất',
                                      products=['bot', 'bo'], palette=['7A4A2A', 'A87A2A', 'F6F0E6'],
                                      values=['Bột 250 g, gói 1 kg', 'Bơ ca cao 200 g', 'Ép từ cùng mẻ nibs'],
                                      color='7A4A2A'),
                                 dict(label='Concept 4', slogan='Tây Nguyên Fusion: socola mix vị đặc sản',
                                      products=['robusta', 'saurieng', 'chanhday'], palette=['1D4B3A', '2F6B3F', '7A3E8F', 'E4A92A'],
                                      values=['Robusta, tiêu, mắc ca', 'Trái cây sấy bọc socola', 'Quà du lịch Tây Nguyên'],
                                      color='1D4B3A')],
                          note='Concept 5 (Quà Đại Ngàn: hộp quà và trà vỏ ca cao) ở trang 15–16. Bao bì là hình minh họa.')),
        (L.carousel, dict(nav=1, height=4.6, items=[
            dict(product='nibs', name='Bazan Origin', script='Concept 1 · Hàng thô', photo='pods_basket', focus=[0.5, 0.6],
                 text='Hạt ca cao lên men, **rang theo tiêu chuẩn**, tách vỏ thành nibs. Bán bao 25 kg cho nhà máy, túi 200 g bán lẻ.'),
            dict(product='bar70', name='Đại Ngàn 70', script='Concept 2 · Socola đen', photo='tasting', focus=[0.5, 0.5],
                 text='Socola đen **single origin** 70 %, 80 %, 100 %: chỉ ca cao Đắk Lắk và đường mía.'),
            dict(product='bot', name='Cacao Thuần', script='Concept 3 · Bột, bơ', photo='cocoa_cup', focus=[0.5, 0.5],
                 text='Ép khối ca cao tách **bơ ca cao** và **bột ca cao nguyên chất** cho pha chế, làm bánh.'),
            dict(product='robusta', name='Tây Nguyên Fusion', script='Concept 4 · Mix vị', photo='hills', focus=[0.5, 0.6],
                 text='Socola với **cà phê Robusta, tiêu, mắc ca** và trái cây sấy Heragrain.'),
            dict(product='hop', name='Quà Đại Ngàn', script='Concept 5 · Quà tặng', photo='giftbox', focus=[0.5, 0.5],
                 text='Hộp quà kể chuyện ca cao Tây Nguyên, kèm **trà vỏ ca cao** tận dụng vỏ lụa.')])),
        (L.specs, dict(nav=1, title='Concept 1 · Bazan Origin', script='hạt rang & nibs', product='nibs', col_w=[1.5, 3.7],
                       rows=[['Hạng mục', 'Nội dung đề xuất'],
                             ['Sản phẩm', 'Hạt ca cao lên men loại tốt, hạt rang, nibs (nhân)'],
                             ['Quy cách', 'Bao 25 kg (B2B) · túi 200 g · hộp mẫu 3 vùng × 100 g'],
                             ['Khách hàng', 'Nhà máy socola, bánh kẹo, nhà xuất khẩu, quán cà phê, tiệm bánh'],
                             ['Khác biệt', 'Mỗi bao ghi vùng trồng, mã lô, độ ẩm, kết quả cut test'],
                             ['Pháp lý', 'GCN cơ sở đủ điều kiện ATTP · tự công bố · mã vạch GS1'],
                             ['Giai đoạn', 'GĐ1 · Q1–Q2/2027']],
                       note='Hộp mẫu 3 vùng (ví dụ Krông Ana, Ea Kar, Buôn Đôn) dùng để **chào mẫu** đơn vị xuất khẩu, nhà máy socola.')),
        (L.specs, dict(nav=1, title='Concept 2 · Đại Ngàn 70', script='socola đen single origin', product='bar70', col_w=[1.5, 3.7],
                       rows=[['Hạng mục', 'Nội dung đề xuất'],
                             ['Sản phẩm', 'Socola đen 70 %, 80 %, 100 % (không đường)'],
                             ['Quy cách', 'Thanh 80 g trong hộp giấy cửa sổ H; hộp 3 thanh'],
                             ['Thành phần', 'Ca cao Đắk Lắk, đường mía (bản 100 % chỉ có ca cao)'],
                             ['Khách hàng', 'Người thích socola đen, quà tặng, quán cà phê, khách du lịch'],
                             ['Pháp lý', 'Tự công bố · nhãn theo NĐ 37/2026 · kiểm nghiệm kim loại nặng'],
                             ['Giai đoạn', 'GĐ2 · Q3–Q4/2027']],
                       note='Ghi **ngày rang, mẻ nghiền** trên hộp: kể được câu chuyện bean-to-bar mà thương hiệu lớn không có.')),
        (L.specs, dict(nav=1, title='Concept 3 · Cacao Thuần', script='bột và bơ ca cao', product='bot', col_w=[1.5, 3.7],
                       rows=[['Hạng mục', 'Nội dung đề xuất'],
                             ['Sản phẩm', 'Bột ca cao nguyên chất (tự nhiên), bơ ca cao thực phẩm'],
                             ['Quy cách', 'Bột 250 g túi zip, 1 kg cho tiệm bánh · bơ 200 g dạng khối'],
                             ['Khách hàng', 'Pha chế, làm bánh, gia đình; xưởng socola nhỏ cần bơ ca cao'],
                             ['Khác biệt', 'Ép tại xưởng từ cùng mẻ nibs, ghi hàm lượng béo'],
                             ['Pháp lý', 'Tự công bố · HACCP hoặc ISO 22000 khi mở rộng'],
                             ['Giai đoạn', 'GĐ3 · Q1–Q2/2028']],
                       note='Bơ ca cao dùng làm **mỹ phẩm** (son dưỡng, kem) theo quy định mỹ phẩm, hồ sơ riêng — để sau.')),
        (L.specs, dict(nav=1, title='Concept 4 · Tây Nguyên Fusion', script='socola mix vị', product='robusta', col_w=[1.5, 3.7],
                       rows=[['Hạng mục', 'Nội dung đề xuất'],
                             ['Sản phẩm', 'Socola cà phê Robusta, socola tiêu đen, socola mắc ca; trái cây sấy bọc socola'],
                             ['Quy cách', 'Thanh 80 g · túi 100 g viên bọc socola'],
                             ['Nguồn vị', 'Robusta Buôn Ma Thuột, tiêu, mắc ca; sầu riêng, chanh dây gừng sấy Heragrain'],
                             ['Khách hàng', 'Khách du lịch, quà tặng, chuỗi cà phê, cửa hàng đặc sản'],
                             ['Pháp lý', 'Ghi chất gây dị ứng (mắc ca); kiểm soát máy dùng chung'],
                             ['Giai đoạn', 'GĐ4 · từ Q3/2028']],
                       note='Nối dòng ca cao với **dòng trái cây sấy, trà** sẵn có của Heragrain: dùng chung kênh bán và hộp quà.')),
        (L.category, dict(nav=1, word='Đại Ngàn', script='quà tặng ca cao', product='hop',
                          caption='Concept 5 · Hộp quà và trà vỏ ca cao — tận dụng trọn quả ca cao Tây Nguyên')),
        (L.specs, dict(nav=1, title='Concept 5 · Quà Đại Ngàn', script='hộp quà & trà vỏ ca cao', product='hop', col_w=[1.5, 3.7],
                       rows=[['Hạng mục', 'Nội dung đề xuất'],
                             ['Sản phẩm', 'Hộp quà Đại Ngàn; trà vỏ ca cao túi lọc'],
                             ['Trong hộp', '2 thanh socola, 1 túi nibs, 1 hộp trà vỏ, 1 túi trái cây sấy'],
                             ['Khách hàng', 'Quà Tết, quà doanh nghiệp, du lịch, lễ hội cà phê Buôn Ma Thuột'],
                             ['Khác biệt', 'Kể chuyện chuỗi ca cao Tây Nguyên, tận dụng vỏ lụa'],
                             ['Pháp lý', 'Trà vỏ: kiểm kim loại nặng, độc tố vi nấm; OCOP (tùy chọn)'],
                             ['Giai đoạn', 'GĐ4 · từ Q3/2028']],
                       note='Vỏ lụa ca cao: hỏi lại quy định thị trường đích trước khi bán làm thực phẩm (ví dụ EU).')),
        (L.features, dict(nav=1, title='Vì sao chọn', script='ca cao Heragrain', product='bar70', items=[
            ('map-pin', 'Một vùng trồng', 'Ghi xã, HTX, tọa độ vườn trên mỗi lô hạt.'),
            ('thermometer', 'Rang theo tiêu chuẩn', 'Ghi nhiệt độ, thời gian từng mẻ rang (CCP).'),
            ('eye', 'Thấy tận mắt', 'Cửa sổ H cho thấy nibs, socola thật bên trong.'),
            ('leaf', 'Không phá rừng', 'Hồ sơ vườn sẵn sàng cho quy định EUDR của EU.')])),
        (L.usage, dict(nav=2, title='Lộ trình ra mắt', script='5 concept theo 4 giai đoạn', product='nibs', steps=[
            ('package', 'GĐ1 · 2027', 'Concept 1 Bazan Origin: hạt rang, nibs B2B và bán lẻ.'),
            ('cookie', 'GĐ2 · cuối 2027', 'Concept 2 Đại Ngàn 70: socola đen.'),
            ('beaker', 'GĐ3 · 2028', 'Concept 3 Cacao Thuần: bột, bơ ca cao.'),
            ('coffee', 'GĐ4 · từ Q3/2028', 'Concept 4 Fusion: mix vị Tây Nguyên.'),
            ('gift', 'GĐ4 · mùa Tết', 'Concept 5 Quà Đại Ngàn: hộp quà, trà vỏ.')])),
        (L.window_cards, dict(nav=2, title='Từ quả', script='đến thanh socola',
                              text='Ảnh minh họa (Open Images) — thay bằng ảnh thật vùng trồng, HTX đối tác và xưởng Heragrain.',
                              items=[dict(photo='pods_bowl', name='Quả ca cao', focus=[0.5, 0.5]),
                                     dict(photo='beans_dry', name='Hạt lên men, phơi khô', focus=[0.5, 0.5]),
                                     dict(photo='grinder', name='Máy nghiền đá', focus=[0.5, 0.4])])),
        (L.conclusion, dict(nav=0, title='Heragrain Cacao', script='Thấy tận mắt, ăn yên tâm',
                            text='Năm concept đi từ **hàng thô** (hạt rang, nibs) đến **chế biến sâu** (socola, bột, bơ) và '
                                 '**mix vị** đặc sản Tây Nguyên: mỗi bước thêm giá trị cho hạt ca cao Đắk Lắk.',
                            products=['tra', 'bot', 'bar70', 'nibs', 'robusta'])),
        (L.contact, dict(word='Cảm ơn', script='Heragrain Cacao', product='bar70',
                         lines=[('phone', 'Hotline: [cập nhật]'), ('globe', 'Website: [cập nhật]'),
                                ('mail', 'Email: [cập nhật]'), ('map-pin', 'Đắk Lắk, Việt Nam')])),
    ]


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(HERE), '1-concept-san-pham')
    os.makedirs(out, exist_ok=True)
    SB.build(sys.modules[__name__], out, None, DEFAULT_NAME)
