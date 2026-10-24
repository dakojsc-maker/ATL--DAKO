"""
Build the M07 "Nông sản Đặc sản" template (product showcase, Highlands Coffee style: warm paper, crimson rounded
titles with a script word, products in the gap of giant words, misty field carousel, browser-window cards).

    python build_nongsan.py                                          # demo: nông sản sấy (HTX Heragrain)
    python build_nongsan.py --content my.json --name San-pham-ABC    # a real deck from a content file
    python build_nongsan.py --dump-sample catalog/samples/M07-nongsan.json

Products: PRODUCTS maps a key to a cut-out PNG of the real product (transparent background) or to a mock-up spec
({'type': 'pouch' | 'jug' | 'sack', ...}, drawn by lib/product_assets.py). Swap in the client's own product
photos (cut out with lib/imgproc.py → cutout()) through "products" in the content file.
Photos: assets/images/nongsan_photos.json (Open Images, CC BY 2.0 — see assets/images/credits.csv).
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import layouts_showcase as L  # noqa: E402
import showcase_build as SB  # noqa: E402

THEME = 'nongsan'
CODE, TITLE = 'M07', 'Heragrain Foods – Trái cây sấy & trà Đắk Lắk'
DEFAULT_NAME = 'Mau-San-Pham-Nong-San.pptx'
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'nongsan_photos.json'), encoding='utf-8'))
BRAND = dict(name='Heragrain', sub='Foods', icon='leaf', menu=['Về chúng tôi', 'Sản phẩm', 'Vùng nguyên liệu', 'Liên hệ'],
             tagline='Trái cây sấy & trà · Đắk Lắk · Việt Nam',
             colors=dict(title='1D4B3A', accent='1D4B3A', accent2='E4A92A', bg='F6F1E6',
                         chart=['1D4B3A', 'E4A92A', '7A3E8F', '5E9E68']))
_H = dict(type='pouch_h', brand='Heragrain', brand_sub='FOODS', ink='1D4B3A', accent='E4A92A')
PRODUCTS = {   # the "H window" pouch concept: the H of the logo is a clear window onto the real fruit
    'sau_rieng': dict(_H, name_en='Dried Durian', name_vi='Sầu riêng sấy', weight='100g', band='2F6B3F',
                      photo='durian_flesh'),
    'chanh_day': dict(_H, name_en='Passion & Ginger', name_vi='Chanh dây gừng sấy', weight='100g', band='7A3E8F',
                      photo='dried_apricot'),
    'mang_cau': dict(_H, name_en='Dried Soursop', name_vi='Mãng cầu sấy', weight='100g', band='5E9E68',
                     photo='soursop_hand'),
    'gung': dict(_H, name_en='Dried Ginger', name_vi='Gừng sấy dẻo', weight='100g', band='C8901E',
                 photo='ginger_dried'),
    'chuoi': dict(_H, name_en='Banana Chips', name_vi='Chuối sấy giòn', weight='150g', band='8A6A2E',
                  photo='banana_dried'),
}
DECOR_ART = {'slice_durian': ('slice_piece', dict(seed=3, color='F2D16B', edge='C9A23A')),
             'slice_ginger': ('slice_piece', dict(seed=6, color='EBD9A6', edge='B8955A', w=360, h=240)),
             'leaf': ('leaf', dict(seed=2, color='2F6B3F', light='8CBF7A')),
             'slice_passion': ('slice_piece', dict(seed=9, color='F0B23C', edge='B46A1E', w=360, h=260)),
             'leaf_b': ('leaf', dict(seed=5, color='5E9E68', light='B7D79A', curl=-0.2))}
GRASS = 'rice_field'
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0. Bao bì “cửa sổ H”: hình minh họa theo concept, '
                'vẽ bằng mã — thay bằng ảnh sản phẩm thật. Icon: Lucide (ISC). Font: Baloo 2, Mulish, Dancing Script '
                '(SIL OFL).')
NOTE = 'Tên sản phẩm, quy cách và số liệu là MINH HỌA — thay bằng danh mục và hồ sơ sản phẩm thật của HTX.'


def build_content():
    return [
        (L.cover, dict(word='Heragrain', script='Foods', products=['sau_rieng', 'chanh_day', 'mang_cau'],
                       kicker='Giới thiệu sản phẩm', tagline='Thấy tận mắt, ăn yên tâm · Trái cây sấy & trà từ Đắk Lắk',
                       height=4.6, notes=NOTE)),
        (L.intro, dict(title='Heragrain Foods', script='hương vị Tây Nguyên',
                       text='**Hợp tác xã Heragrain** (Đắk Lắk) chế biến **trái cây sấy và trà** từ vùng nguyên liệu Tây '
                            'Nguyên: sầu riêng, chanh dây, mãng cầu, gừng… Sấy lạnh giữ trọn màu sắc, hương vị và dinh '
                            'dưỡng — **không phẩm màu, không chất bảo quản**, truy xuất được nguồn gốc.')),
        (L.story_product, dict(nav=0, title='Cửa sổ H', script='The H Window', product='sau_rieng', second='chanh_day',
                               side='right',
                               text='Chữ **H** trong Heragrain trở thành **cửa sổ trong suốt** trên bao bì, để khách hàng '
                                    'thấy tận mắt miếng trái cây thật bên trong. **Đơn giản – Tinh tế – Đáng tin cậy** – '
                                    'sẵn sàng cho thị trường quốc tế.')),
        (L.story_product, dict(nav=2, title='Vùng nguyên liệu', script='Đắk Lắk', product='gung', second='mang_cau',
                               side='left',
                               text='Đất đỏ bazan và khí hậu cao nguyên cho trái cây **thơm, ngọt đậm**. Heragrain thu '
                                    'mua trực tiếp từ **nông hộ thành viên**, kiểm soát từ vườn đến từng mẻ sấy.')),
        (L.values_row, dict(nav=0, title='Giá trị', script='thương hiệu',
                            text='Bốn cam kết trên mỗi gói sản phẩm: **minh bạch**, **tự nhiên**, **cao cấp** và **sẵn sàng '
                                 'xuất khẩu**.',
                            items=[dict(product='sau_rieng', label='Minh bạch', text='Thấy tận mắt qua cửa sổ H'),
                                   dict(product='mang_cau', label='Tự nhiên thật', text='Không phẩm màu, chất bảo quản'),
                                   dict(product='chanh_day', label='Hiện đại', text='Bao bì cao cấp, tinh tế'),
                                   dict(product='gung', label='Xuất khẩu', text='Sẵn sàng thị trường quốc tế')])),
        (L.lineup, dict(nav=1, title='Sản phẩm', script='Heragrain Foods', items=[
            dict(word='Sầu riêng', product='sau_rieng', caption='Sầu riêng sấy'),
            dict(word='Chanh dây', product='chanh_day', caption='Chanh dây gừng sấy'),
            dict(word='Mãng cầu', product='mang_cau', caption='Mãng cầu sấy')])),
        (L.category, dict(nav=1, word='Sầu riêng', script='sấy lạnh', product='sau_rieng',
                          caption='Đặc sản Đắk Lắk — giữ trọn vị béo thơm của sầu riêng chín cây')),
        (L.carousel, dict(nav=1, height=4.7, items=[
            dict(product='sau_rieng', name='Sầu riêng sấy', script='Dried Durian', photo='terrace', focus=[0.5, 0.6],
                 text='Sầu riêng Đắk Lắk chín cây, **sấy lạnh** giữ vị béo, thơm đặc trưng; túi 100 g.'),
            dict(product='chanh_day', name='Chanh dây gừng', script='Passion & Ginger', photo='hills', focus=[0.5, 0.6],
                 text='Chanh dây kết hợp gừng, **chua ngọt – ấm nồng**; ăn vặt hoặc pha trà.'),
            dict(product='mang_cau', name='Mãng cầu sấy', script='Dried Soursop', photo='valley', focus=[0.5, 0.6],
                 text='Mãng cầu **sấy dẻo**, vị chua dịu tự nhiên, giàu vitamin C.'),
            dict(product='gung', name='Gừng sấy dẻo', script='Dried Ginger', photo='rice_field', focus=[0.5, 0.6],
                 text='Gừng Tây Nguyên **sấy dẻo**, ấm bụng, hợp dùng với trà.'),
            dict(product='chuoi', name='Chuối sấy giòn', script='Banana Chips', photo='terrace', focus=[0.5, 0.4],
                 text='Chuối chín vàng **sấy giòn ít dầu**, ăn vặt lành mạnh cho cả nhà.')])),
        (L.features, dict(nav=1, title='Vì sao chọn', script='Heragrain', product='sau_rieng', items=[
            ('eye', 'Thấy tận mắt', 'Cửa sổ H cho thấy miếng trái cây thật bên trong.'),
            ('leaf', 'Tự nhiên thật', '100% trái cây, không phẩm màu, không chất bảo quản.'),
            ('shield-check', 'Minh bạch chất lượng', 'Truy xuất nguồn gốc từ vùng trồng Đắk Lắk.'),
            ('globe', 'Xuất khẩu sẵn sàng', 'Bao bì song ngữ, quy cách theo chuẩn quốc tế.')])),
        (L.specs, dict(nav=1, title='Thông tin sản phẩm', script='Sầu riêng sấy', product='sau_rieng', col_w=[2.4, 2.0],
                       rows=[['Thông tin', 'Chi tiết'], ['Thành phần', '100% sầu riêng Đắk Lắk'],
                             ['Khối lượng', '100 g / túi zip'], ['Hạn sử dụng', '12 tháng'],
                             ['Bảo quản', 'Nơi khô ráo, thoáng mát'], ['Tiêu chuẩn', '[TCCS / OCOP …]']],
                       note='Thông tin **minh họa** — thay bằng nhãn và hồ sơ công bố sản phẩm của HTX.')),
        (L.usage, dict(nav=2, title='Quy trình', script='từ vườn đến tay bạn', steps=[
            ('apple', 'Tuyển chọn', 'Trái chín cây từ nông hộ thành viên.'),
            ('droplets', 'Sơ chế', 'Rửa sạch, tách múi, cắt lát đều tay.'),
            ('sun', 'Sấy lạnh', 'Nhiệt độ thấp, giữ màu, mùi và dinh dưỡng.'),
            ('package-open', 'Đóng gói', 'Túi zip cửa sổ H, dán nhãn truy xuất.'),
            ('truck', 'Phân phối', 'Cửa hàng, sàn TMĐT và xuất khẩu.')])),
        (L.results, dict(nav=2, title='Kết quả', script='hợp tác xã', photo='durian_tray', focus=[0.5, 0.5],
                         chart=dict(cats=['2023', '2024', '2025', '2026'],
                                    series=[('Sản lượng (tấn)', [12, 18, 26, 35])], fmt='0', max=40),
                         kpis=[('120', '+', 'Hộ thành viên liên kết'), ('5', '', 'Dòng sản phẩm chủ lực'),
                               ('+30', '%', 'Thu nhập nông hộ')],
                         note='Số liệu minh họa — thay bằng số liệu thực tế của HTX.')),
        (L.window_cards, dict(nav=2, title='Vùng nguyên liệu', script='Tây Nguyên',
                              text='Hình ảnh **vùng trồng và nông sản** — thay bằng ảnh thật của HTX Heragrain.',
                              items=[dict(photo='durian_whole', name='Sầu riêng Đắk Lắk', focus=[0.5, 0.5]),
                                     dict(photo='soursop_tree', focus=[0.5, 0.5]),
                                     dict(photo='ginger_pile', focus=[0.5, 0.5])])),
        (L.conclusion, dict(nav=0, title='Heragrain Foods', script='Thấy tận mắt, ăn yên tâm',
                            text='Trái cây sấy & trà từ Đắk Lắk: **tự nhiên – minh bạch – cao cấp**, nâng giá trị nông '
                                 'sản Tây Nguyên và thu nhập cho bà con.',
                            products=['gung', 'chanh_day', 'sau_rieng', 'mang_cau', 'chuoi'])),
        (L.contact, dict(word='Cảm ơn', script='Heragrain Foods', product='sau_rieng',
                         lines=[('phone', 'Hotline: 0xxx xxx xxx'), ('globe', 'www.heragrain.vn'),
                                ('mail', 'lienhe@heragrain.vn'), ('map-pin', 'Đắk Lắk, Việt Nam [cập nhật địa chỉ]')])),
    ]


if __name__ == '__main__':
    SB.main(sys.modules[__name__], HERE)
