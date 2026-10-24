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
CODE, TITLE = 'M06', 'Giải pháp nông nghiệp sinh học – Á Châu'
DEFAULT_NAME = 'Mau-San-Pham-Thien-Nhien.pptx'
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'thiennhien_photos.json'), encoding='utf-8'))
BRAND = dict(name='Á Châu', icon='sprout', menu=['Giới thiệu', 'Sản phẩm', 'Hướng dẫn', 'Liên hệ'],
             tagline='Vì một nền nông nghiệp xanh',
             colors=dict(title='1E6B30', accent='2E8B3A', accent2='A8D26B', chart=['2E8B3A', 'A8D26B', '1E6B30', 'F2B705']))
# Packaging concept used across the deck (c1 xanh lá · c2 đất đỏ bazan · c3 trắng – xanh dương · c4 xanh tối giản).
# The concept slide shows all four; change SCHEME (or "scheme" in each product of a content file) once one is chosen.
SCHEME = 'c1'
_A = dict(type='agri_pack', brand='Á Châu', tagline='Vì một nền nông nghiệp xanh', scheme=SCHEME)
PRODUCTS = {
    'phan_bon': dict(_A, kind='sack', name='Phân bón hữu cơ', sub='Dinh dưỡng từ đất – Sức sống cho cây', volume='25kg'),
    'xu_ly': dict(_A, kind='jug', name='Chế phẩm xử lý môi trường', sub='Sạch đất – Xanh môi trường', volume='10L'),
    'tru_sau': dict(_A, kind='bucket', name='Thuốc trừ sâu sinh học', sub='An toàn cho cây trồng – Bảo vệ hệ sinh thái',
                    volume='20L'),
    'vi_sinh': dict(_A, kind='bottle', name='Chế phẩm vi sinh', sub='Cải tạo đất – Tăng độ phì', volume='1L'),
    'dich_vi_sinh': dict(_A, kind='bottle', name='Dịch phẩm vi sinh', sub='Phòng ngừa sâu bệnh', volume='1L'),
}
DECOR_ART = {'leaf_a': ('leaf', dict(seed=1)), 'leaf_b': ('leaf', dict(seed=4, color='5DA832', light='C6E38A', curl=-0.2)),
             'pellet': ('pellets', dict(seed=2, n=18, w=300, h=220)), 'leaf_c': ('leaf', dict(seed=7, curl=0.3))}
GRASS = None
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0. Bao bì: hình minh họa theo concept, vẽ bằng mã — '
                'thay bằng ảnh thật khi chốt thiết kế. Icon: Lucide (ISC). Font: Oswald, Nunito Sans, Great Vibes (SIL OFL).')
NOTE = 'Nội dung, thông số và số liệu là MINH HỌA — thay bằng hồ sơ và nhãn sản phẩm đã đăng ký của doanh nghiệp.'
CONCEPTS = [
    dict(scheme='c1', label='Concept 1', color='1E7B34', slogan='Thân thiện đồng hành – Nông nghiệp bền vững',
         palette=['1E7B34', '2E8B3A', '7CC242', 'F2B705', 'E8A040'],
         values=['Tự nhiên, an toàn', 'Hiệu quả bền vững', 'Thân thiện môi trường']),
    dict(scheme='c2', label='Concept 2', color='C62828', slogan='Đất đỏ bazan – Dưỡng chất cho mùa vàng',
         palette=['C62828', 'E04A2F', '2E7D32', 'F2B705', 'F6D9A8'],
         values=['Giàu dinh dưỡng', 'Tăng năng suất', 'An toàn, bền vững']),
    dict(scheme='c3', label='Concept 3', color='1565C0', slogan='Xanh – trắng – Truy xuất nguồn gốc',
         palette=['2E7D32', '43A047', '1565C0', '81C784', 'B0BEC5'],
         values=['Truy xuất nguồn gốc minh bạch', 'Chất lượng đồng nhất', 'Niềm tin bền vững']),
    dict(scheme='c4', label='Concept 4', color='2E7D32', slogan='An toàn từ gốc – Xanh cho tương lai',
         palette=['2E7D32', '43A047', 'F2B705', '9CCC65', 'CFD8DC'],
         values=['An toàn', 'Tiêu chuẩn', 'Thân thiện môi trường']),
]


def build_content():
    return [
        (L.cover, dict(word='Hữu cơ', script='Á Châu', products=['phan_bon', 'xu_ly', 'tru_sau'],
                       photo='field_green', focus=[0.5, 0.75], kicker='Giới thiệu sản phẩm',
                       tagline='Công ty CP Công nghệ Môi trường Nông nghiệp Á Châu', notes=NOTE)),
        (L.intro, dict(title='Giới thiệu', script='Về chúng tôi', photo='rice_terrace', focus=[0.5, 0.6],
                       text='**Công ty CP Công nghệ Môi trường Nông nghiệp Á Châu** nghiên cứu và sản xuất phân bón '
                            'hữu cơ, chế phẩm vi sinh và thuốc trừ sâu sinh học, hướng tới **nền nông nghiệp xanh, an '
                            'toàn và bền vững** — “Vì một nền nông nghiệp xanh”.')),
        (L.story_cards, dict(nav=0, cards=[
            dict(title='Khởi nguồn', script='câu chuyện', photo='farmers_field',
                 text='Từ những cánh đồng bạc màu vì canh tác hóa học kéo dài, Á Châu ra đời với mong muốn **trả lại '
                      'sức sống cho đất** bằng giải pháp sinh học phù hợp với người nông dân Việt Nam.'),
            dict(title='Giá trị cốt lõi', script='bền vững', photo='compost_pile',
                 text='**Tuần hoàn** phụ phẩm nông nghiệp thành dinh dưỡng cho đất · **An toàn** cho người sản xuất '
                      'và người tiêu dùng · **Hiệu quả** đo được trên từng vụ mùa.'),
            dict(title='Định vị', script='thương hiệu', photo='rice_terrace',
                 text='Thương hiệu sinh học **đồng hành cùng nhà nông**: sản phẩm rõ nguồn gốc, hướng dẫn kỹ thuật '
                      'tận ruộng, giá hợp lý cho từng nhóm cây trồng.')])),
        (L.lineup, dict(nav=1, title='Dòng sản phẩm', script='Á Châu', items=[
            dict(word='Phân bón', product='phan_bon', caption='Phân bón hữu cơ'),
            dict(word='Vi sinh', product='vi_sinh', caption='Chế phẩm & dịch phẩm vi sinh'),
            dict(word='Sinh học', product='tru_sau', caption='Thuốc trừ sâu sinh học')])),
        (L.category, dict(nav=1, word='Hữu cơ', script='Phân bón', product='phan_bon',
                          caption='Dinh dưỡng từ đất – Sức sống cho cây')),
        (L.carousel, dict(nav=1, height=4.6, items=[
            dict(product='phan_bon', name='Phân bón hữu cơ', script='Bao 25 kg', photo='rice_rows', focus=[0.5, 0.7],
                 text='Bổ sung hữu cơ cho đất; giúp **đất tơi xốp, rễ phát triển**, cây sinh trưởng khỏe.'),
            dict(product='xu_ly', name='Xử lý môi trường', script='Can 10 L', photo='soil_rows', focus=[0.5, 0.5],
                 text='Chế phẩm xử lý môi trường: **sạch đất – xanh môi trường**, phân giải phụ phẩm, khử mùi.'),
            dict(product='tru_sau', name='Trừ sâu sinh học', script='Thùng 20 L', photo='cabbage', focus=[0.5, 0.6],
                 text='Thuốc trừ sâu sinh học **an toàn cho cây trồng**, bảo vệ hệ sinh thái và thiên địch.'),
            dict(product='vi_sinh', name='Chế phẩm vi sinh', script='Chai 1 L', photo='greenhouse', focus=[0.5, 0.5],
                 text='Bổ sung vi sinh vật có ích, **cải tạo đất, tăng độ phì** và sức đề kháng cho cây.'),
            dict(product='dich_vi_sinh', name='Dịch phẩm vi sinh', script='Chai 1 L', photo='tea_rows',
                 focus=[0.5, 0.5], text='Dạng dịch dễ pha phun, **phòng ngừa sâu bệnh** từ sớm, an toàn khi sử dụng.')])),
        (L.concepts, dict(nav=1, title='Concept bao bì', script='4 phương án', items=[
            dict(c, products=['phan_bon', 'xu_ly', 'tru_sau', 'vi_sinh']) for c in CONCEPTS],
            note='Các phương án đang chờ lựa chọn — bộ slide dựng lại theo concept được chốt (đổi SCHEME).')),
        (L.features, dict(nav=1, title='Ưu điểm nổi bật', script='sản phẩm sinh học', product='phan_bon', items=[
            ('sprout', 'Cải tạo đất', 'Tăng mùn, giúp đất tơi xốp, giữ ẩm và giữ dinh dưỡng tốt hơn.'),
            ('shield-check', 'Cây khỏe – ít bệnh', 'Vi sinh vật có ích ức chế nấm bệnh vùng rễ.'),
            ('leaf', 'An toàn', 'Thân thiện môi trường, an toàn cho người sử dụng và nông sản.'),
            ('piggy-bank', 'Tiết kiệm', 'Giảm lượng phân, thuốc hóa học cần dùng, tối ưu chi phí mỗi vụ.')])),
        (L.specs, dict(nav=1, title='Thông số sản phẩm', script='Phân bón hữu cơ', product='phan_bon',
                       col_w=[2.6, 1.6],
                       rows=[['Chỉ tiêu', 'Hàm lượng'], ['Chất hữu cơ', '≥ 20%'], ['Axit humic', '≥ 2%'],
                             ['Vi sinh vật có ích', '≥ 1×10⁶ CFU/g'], ['Độ ẩm', '≤ 30%'], ['pH H₂O', '5 – 7'],
                             ['Quy cách', 'Bao 25 kg']],
                       note='Thông số **minh họa** — thay bằng thông số trên nhãn sản phẩm đã đăng ký lưu hành.')),
        (L.usage, dict(nav=2, title='Hướng dẫn sử dụng', script='bộ giải pháp sinh học', product='phan_bon', steps=[
            ('shovel', 'Xử lý đất', 'Phun chế phẩm xử lý môi trường, phân giải tàn dư vụ trước.'),
            ('package-open', 'Bón lót', 'Rải phân bón hữu cơ trước khi gieo trồng.'),
            ('sprout', 'Bổ sung vi sinh', 'Tưới chế phẩm vi sinh quanh vùng rễ.'),
            ('shield-check', 'Phòng sâu bệnh', 'Phun dịch phẩm vi sinh, thuốc sinh học khi cần.'),
            ('clipboard-check', 'Theo dõi', 'Ghi chép, đánh giá hiệu quả sau mỗi vụ.')])),
        (L.results, dict(nav=2, title='Hiệu quả thực tế', script='mô hình trình diễn', photo='rice_terrace',
                         focus=[0.5, 0.5],
                         chart=dict(cats=['Vụ 1', 'Vụ 2', 'Vụ 3', 'Vụ 4'],
                                    series=[('Canh tác thông thường', [58, 57, 56, 56]),
                                            ('Dùng giải pháp Á Châu', [60, 63, 65, 67])], fmt='0', max=80),
                         kpis=[('+15', '%', 'Năng suất sau 4 vụ'), ('-25', '%', 'Lượng phân, thuốc hóa học'),
                               ('3', ' tỉnh', 'Có mô hình trình diễn')],
                         note='Năng suất lúa (tạ/ha) — số liệu minh họa, thay bằng kết quả mô hình thực tế.')),
        (L.window_cards, dict(nav=2, title='Thực tế', script='mô hình trình diễn', text='Hình ảnh **mô hình trình '
                                                                                        'diễn** và vùng nguyên liệu — '
                                                                                        'thay bằng ảnh thật của doanh '
                                                                                        'nghiệp.',
                              items=[dict(photo='farmers_field', name='Mô hình canh tác sinh học', focus=[0.5, 0.5]),
                                     dict(photo='compost_worms', focus=[0.5, 0.6]),
                                     dict(photo='soil_rows', focus=[0.5, 0.5])])),
        (L.conclusion, dict(nav=0, title='Kết luận', script='vì một nền nông nghiệp xanh',
                            text='Bộ giải pháp sinh học Á Châu giúp **đất khỏe – cây khỏe – nông sản an toàn**, góp phần '
                                 'xây dựng nền nông nghiệp xanh và bền vững.',
                            products=['vi_sinh', 'xu_ly', 'phan_bon', 'tru_sau', 'dich_vi_sinh'])),
        (L.contact, dict(word='Xin cảm ơn', script='Á Châu', product='phan_bon', photo='field_green',
                         focus=[0.5, 0.75],
                         lines=[('phone', 'Hotline: 0xxx xxx xxx'), ('globe', 'www.tenmien.vn'),
                                ('mail', 'lienhe@tenmien.vn'), ('map-pin', 'Địa chỉ: [cập nhật địa chỉ công ty]')])),
    ]


if __name__ == '__main__':
    SB.main(sys.modules[__name__], HERE)
