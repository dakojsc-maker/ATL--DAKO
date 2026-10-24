"""
Build the M06 "Sản phẩm Thiên nhiên" template (product showcase, TH true MILK style: fresh white, nature photos,
brown condensed titles with a script word, product carousel).

    python build_thiennhien.py                                         # demo: phân bón hữu cơ (Á Châu)
    python build_thiennhien.py --content my.json --name San-pham-ABC   # a real deck from a content file
    python build_thiennhien.py --dump-sample catalog/samples/M06-thiennhien.json

Products: PRODUCTS maps a key to a cut-out PNG of the real product (transparent background) or to a mock-up spec
({'type': 'sack' | 'jug' | 'pouch', ...}, drawn by lib/product_assets.py). Replace the mock-ups with the client's
own product photos (cut out with lib/imgproc.py → cutout()) by giving paths in "products" of the content file.
Photos: assets/images/thiennhien_photos.json (Open Images, CC BY 2.0 — see assets/images/credits.csv).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import layouts_showcase as L  # noqa: E402
import showcase_build as SB  # noqa: E402

THEME = 'thiennhien'
CODE, TITLE = 'M06', 'Phân bón hữu cơ – Á Châu'
DEFAULT_NAME = 'Mau-San-Pham-Thien-Nhien.pptx'
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'thiennhien_photos.json'), encoding='utf-8'))
BRAND = dict(name='Á Châu Agri', icon='sprout', menu=['Giới thiệu', 'Sản phẩm', 'Hướng dẫn', 'Liên hệ'])
_S = dict(type='sack', brand='Á Châu Agri', weight='25 KG')
PRODUCTS = {
    'hcvs_lua': dict(_S, name='Hữu cơ vi sinh', sub='Chuyên dùng cho lúa', base='2F6B2E', accent='A8D26B',
                     photo='rice_green', spec='Hữu cơ · Vi sinh vật có ích · Trung lượng'),
    'hcvs_rau': dict(_S, name='Hữu cơ vi sinh', sub='Chuyên dùng cho rau màu', base='1F5D73', accent='9ED7E6',
                     photo='cabbage', spec='Hữu cơ · Vi sinh vật có ích · Trung lượng'),
    'hcvs_cay': dict(_S, name='Hữu cơ vi sinh', sub='Chuyên dùng cho cây ăn trái', base='7A3B22', accent='E8B04A',
                     photo='dragonfruit', spec='Hữu cơ · Vi sinh vật có ích · Trung lượng'),
    'hc_khoang': dict(_S, name='Hữu cơ khoáng', sub='Bổ sung dinh dưỡng cân đối', base='5A4632', accent='D9C27A',
                      photo='compost_pile', spec='Hữu cơ · N – P – K · Trung vi lượng'),
    'la_rare': dict(type='jug', name='Ra rễ cực mạnh', sub='Phân bón lá hữu cơ', brand='Á Châu Agri', volume='1 LÍT',
                    label='2F6B2E', accent='A8D26B', cap='2F6B2E'),
    'la_duong': dict(type='jug', name='Dưỡng lá xanh', sub='Phân bón lá hữu cơ', brand='Á Châu Agri', volume='1 LÍT',
                     label='1F5D73', accent='9ED7E6', cap='1F5D73'),
    'la_trai': dict(type='jug', name='Đậu trái – lớn trái', sub='Phân bón lá hữu cơ', brand='Á Châu Agri',
                    volume='1 LÍT', label='9A4A1E', accent='F2C14E', cap='9A4A1E'),
}
DECOR_ART = {'leaf_a': ('leaf', dict(seed=1)), 'leaf_b': ('leaf', dict(seed=4, color='5DA832', light='C6E38A', curl=-0.2)),
             'pellet': ('pellets', dict(seed=2, n=18, w=300, h=220)), 'leaf_c': ('leaf', dict(seed=7, curl=0.3))}
GRASS = None
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0. Bao bì sản phẩm: hình minh họa vẽ bằng mã — '
                'thay bằng ảnh thật của sản phẩm. Icon: Lucide (ISC). Font: Oswald, Nunito Sans, Great Vibes (SIL OFL).')
NOTE = 'Nội dung, thông số và số liệu là MINH HỌA — thay bằng hồ sơ và nhãn sản phẩm đã đăng ký của doanh nghiệp.'


def build_content():
    return [
        (L.cover, dict(word='Hữu cơ', script='Á Châu Agri', products=['hcvs_lua', 'la_rare', 'hcvs_rau'],
                       photo='field_green', focus=[0.5, 0.75], kicker='Giới thiệu sản phẩm',
                       tagline='Công ty CP Công nghệ Môi trường Nông nghiệp Á Châu', notes=NOTE)),
        (L.intro, dict(title='Giới thiệu', script='Về chúng tôi', photo='rice_terrace', focus=[0.5, 0.6],
                       text='**Công ty CP Công nghệ Môi trường Nông nghiệp Á Châu** nghiên cứu và sản xuất phân bón '
                            'hữu cơ từ phụ phẩm nông nghiệp, hướng tới **nền nông nghiệp xanh, an toàn và bền vững**. '
                            'Sản phẩm giúp cải tạo đất, tăng sức khỏe cây trồng và giảm phụ thuộc vào phân bón hóa học.')),
        (L.story_cards, dict(nav=0, cards=[
            dict(title='Khởi nguồn', script='câu chuyện', photo='farmers_field',
                 text='Từ những cánh đồng bạc màu vì canh tác hóa học kéo dài, Á Châu ra đời với mong muốn **trả lại '
                      'sức sống cho đất** bằng giải pháp hữu cơ phù hợp với người nông dân Việt Nam.'),
            dict(title='Giá trị cốt lõi', script='bền vững', photo='compost_pile',
                 text='**Tuần hoàn** phụ phẩm nông nghiệp thành dinh dưỡng cho đất · **An toàn** cho người sản xuất '
                      'và người tiêu dùng · **Hiệu quả** đo được trên từng vụ mùa.'),
            dict(title='Định vị', script='thương hiệu', photo='rice_terrace',
                 text='Thương hiệu phân bón hữu cơ **đồng hành cùng nhà nông**: sản phẩm rõ nguồn gốc, hướng dẫn kỹ '
                      'thuật tận ruộng, giá hợp lý cho từng nhóm cây trồng.')])),
        (L.lineup, dict(nav=1, title='Dòng sản phẩm', script='Á Châu Agri', items=[
            dict(word='Vi sinh', product='hcvs_lua', caption='Hữu cơ vi sinh'),
            dict(word='Khoáng', product='hc_khoang', caption='Hữu cơ khoáng'),
            dict(word='Bón lá', product='la_rare', caption='Phân bón lá hữu cơ')])),
        (L.category, dict(nav=1, word='Vi sinh', script='Hữu cơ', product='hcvs_lua',
                          caption='Bộ sản phẩm hữu cơ vi sinh chuyên dùng cho từng nhóm cây trồng')),
        (L.carousel, dict(nav=1, items=[
            dict(product='hcvs_lua', name='Hữu cơ vi sinh', script='Chuyên lúa', photo='rice_rows', focus=[0.5, 0.7],
                 text='Bón lót và bón thúc cho lúa; giúp **đẻ nhánh khỏe, cứng cây**, hạn chế đổ ngã.'),
            dict(product='hcvs_rau', name='Hữu cơ vi sinh', script='Chuyên rau màu', photo='cabbage',
                 focus=[0.5, 0.6], text='Cho rau ăn lá, củ, quả; **đất tơi xốp, rễ phát triển**, rau xanh mướt.'),
            dict(product='hcvs_cay', name='Hữu cơ vi sinh', script='Cây ăn trái', photo='dragonfruit',
                 focus=[0.5, 0.6], text='Phục hồi cây sau thu hoạch, **nuôi trái lớn đều**, tăng độ ngọt tự nhiên.')])),
        (L.category, dict(nav=1, word='Bón lá', script='Dạng lỏng', product='la_rare',
                          caption='Phân bón lá hữu cơ – hấp thu nhanh qua lá, dùng kết hợp với bón gốc')),
        (L.carousel, dict(nav=1, height=4.6, items=[
            dict(product='la_rare', name='Ra rễ cực mạnh', script='Bón lá', photo='greenhouse', focus=[0.5, 0.5],
                 text='Kích thích **ra rễ non**, phục hồi cây sau ngập úng, cây con sau trồng.'),
            dict(product='la_duong', name='Dưỡng lá xanh', script='Bón lá', photo='tea_rows', focus=[0.5, 0.5],
                 text='**Lá dày, xanh bóng**, tăng quang hợp và sức đề kháng của cây.'),
            dict(product='la_trai', name='Đậu trái', script='Lớn trái', photo='field_hills', focus=[0.5, 0.6],
                 text='Hỗ trợ **đậu hoa, đậu trái**, hạn chế rụng trái non, trái lớn đều.')])),
        (L.features, dict(nav=1, title='Ưu điểm nổi bật', script='hữu cơ vi sinh', product='hcvs_rau', items=[
            ('sprout', 'Cải tạo đất', 'Tăng mùn, giúp đất tơi xốp, giữ ẩm và giữ dinh dưỡng tốt hơn.'),
            ('shield-check', 'Cây khỏe – ít bệnh', 'Vi sinh vật có ích ức chế nấm bệnh vùng rễ.'),
            ('leaf', 'An toàn', 'Thân thiện môi trường, an toàn cho người sử dụng và nông sản.'),
            ('piggy-bank', 'Tiết kiệm', 'Giảm lượng phân hóa học cần dùng, tối ưu chi phí mỗi vụ.')])),
        (L.specs, dict(nav=1, title='Thông số sản phẩm', script='Hữu cơ vi sinh', product='hcvs_lua',
                       col_w=[2.6, 1.6],
                       rows=[['Chỉ tiêu', 'Hàm lượng'], ['Chất hữu cơ', '≥ 20%'], ['Axit humic', '≥ 2%'],
                             ['Vi sinh vật có ích', '≥ 1×10⁶ CFU/g'], ['Độ ẩm', '≤ 30%'], ['pH H₂O', '5 – 7'],
                             ['Quy cách', 'Bao 25 kg']],
                       note='Thông số **minh họa** — thay bằng thông số trên nhãn sản phẩm đã đăng ký lưu hành.')),
        (L.usage, dict(nav=2, title='Hướng dẫn sử dụng', script='cho cây lúa', product='hcvs_lua', steps=[
            ('shovel', 'Làm đất', 'Cày bừa, vệ sinh đồng ruộng trước khi gieo sạ.'),
            ('package-open', 'Bón lót', 'Rải đều 400–600 kg/ha trước khi bừa trục.'),
            ('sprout', 'Bón thúc', 'Bón 200–300 kg/ha giai đoạn đẻ nhánh.'),
            ('droplets', 'Giữ ẩm', 'Giữ mực nước phù hợp để vi sinh vật hoạt động.'),
            ('clipboard-check', 'Theo dõi', 'Quan sát sinh trưởng, kết hợp bón lá khi cần.')])),
        (L.results, dict(nav=2, title='Hiệu quả thực tế', script='mô hình trình diễn', photo='rice_terrace',
                         focus=[0.5, 0.5],
                         chart=dict(cats=['Vụ 1', 'Vụ 2', 'Vụ 3', 'Vụ 4'],
                                    series=[('Canh tác thông thường', [58, 57, 56, 56]),
                                            ('Dùng hữu cơ vi sinh', [60, 63, 65, 67])], fmt='0', max=80),
                         kpis=[('+15', '%', 'Năng suất sau 4 vụ'), ('-25', '%', 'Lượng phân hóa học'),
                               ('3', ' tỉnh', 'Có mô hình trình diễn')],
                         note='Năng suất lúa (tạ/ha) — số liệu minh họa, thay bằng kết quả mô hình thực tế.')),
        (L.window_cards, dict(nav=2, title='Thực tế', script='mô hình trình diễn', text='Hình ảnh **mô hình trình diễn** và vùng nguyên liệu — '
                                                          'thay bằng ảnh thật của doanh nghiệp.',
                              items=[dict(photo='farmers_field', name='Mô hình lúa hữu cơ', focus=[0.5, 0.5]),
                                     dict(photo='compost_worms', focus=[0.5, 0.6]),
                                     dict(photo='soil_rows', focus=[0.5, 0.5])])),
        (L.conclusion, dict(nav=0, title='Kết luận', script='đồng hành cùng nhà nông',
                            text='Phân bón hữu cơ Á Châu giúp **đất khỏe – cây khỏe – nông sản an toàn**, góp phần xây '
                                 'dựng nền nông nghiệp xanh và bền vững.',
                            products=['hcvs_cay', 'la_duong', 'hcvs_lua', 'la_trai', 'hc_khoang'])),
        (L.contact, dict(word='Xin cảm ơn', script='Á Châu Agri', product='hcvs_lua', photo='field_green',
                         focus=[0.5, 0.75],
                         lines=[('phone', 'Hotline: 0xxx xxx xxx'), ('globe', 'www.tenmien.vn'),
                                ('mail', 'lienhe@tenmien.vn'), ('map-pin', 'Địa chỉ: [cập nhật địa chỉ công ty]')])),
    ]


if __name__ == '__main__':
    SB.main(sys.modules[__name__], HERE)
