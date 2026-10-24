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
CODE, TITLE = 'M07', 'Nông sản sấy – HTX Heragrain'
DEFAULT_NAME = 'Mau-San-Pham-Nong-San.pptx'
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'nongsan_photos.json'), encoding='utf-8'))
BRAND = dict(name='Heragrain', icon='wheat', menu=['Về chúng tôi', 'Sản phẩm', 'Quy trình', 'Liên hệ'])
_P = dict(type='pouch', brand='Heragrain', accent='F2C14E')
PRODUCTS = {
    'xoai': dict(_P, name='Xoài sấy dẻo', sub='Dẻo thơm tự nhiên', weight='200g', color='B5172F', photo='dried_apricot',
                 badge='100%\ntự nhiên'),
    'chuoi': dict(_P, name='Chuối sấy', sub='Giòn tan', weight='250g', kraft=True, photo='banana_dried',
                  color='B5172F'),
    'khoai': dict(_P, name='Khoai lang sấy', sub='Ngọt bùi', weight='250g', color='6B2D5C', photo='sweet_potato',
                  photo_focus=(0.5, 0.45)),
    'ngucoc': dict(_P, name='Ngũ cốc sấy', sub='Bữa sáng dinh dưỡng', weight='400g', kraft=True, photo='granola',
                   color='6E8B3D'),
    'hat': dict(_P, name='Hạt dinh dưỡng', sub='Mix 5 loại hạt', weight='300g', color='3E6B2E', photo='mixed_nuts',
                badge='Không\nđường'),
}
DECOR_ART = {'slice_mango': ('slice_piece', dict(seed=3)),
             'slice_jack': ('slice_piece', dict(seed=6, color='F4C84E', edge='C99A2A')),
             'grain': ('grain', dict(seed=4)),
             'leaf': ('leaf', dict(seed=2, color='6E8B3D', light='B7CF7A')),
             'chip': ('slice_piece', dict(seed=9, color='EBCB7A', edge='B98A38', w=360, h=220))}
GRASS = 'rice_field'
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0. Bao bì sản phẩm: hình minh họa vẽ bằng mã — '
                'thay bằng ảnh thật của sản phẩm. Icon: Lucide (ISC). Font: Baloo 2, Mulish, Dancing Script (SIL OFL).')
NOTE = 'Tên sản phẩm, quy cách và số liệu là MINH HỌA — thay bằng danh mục và hồ sơ sản phẩm thật của HTX.'


def build_content():
    return [
        (L.cover, dict(word='Heragrain', script='Nông sản sấy', products=['xoai', 'chuoi', 'hat'],
                       kicker='Giới thiệu sản phẩm', tagline='Hợp tác xã Heragrain · Nông sản sấy tự nhiên',
                       height=4.6, notes=NOTE)),
        (L.intro, dict(title='Heragrain', script='câu chuyện của chúng tôi',
                       text='**Hợp tác xã Heragrain** liên kết các hộ nông dân, chế biến trái cây và nông sản theo '
                            'phương pháp **sấy lạnh – sấy dẻo**, giữ trọn màu sắc, hương vị và dinh dưỡng tự nhiên. '
                            'Không phẩm màu, không chất bảo quản, truy xuất được nguồn gốc từ vùng trồng.')),
        (L.story_product, dict(nav=0, title='Lịch sử', script='hình thành', product='chuoi', second='xoai',
                               side='right',
                               text='Khởi đầu từ những nông hộ trồng xoài, chuối, khoai lang, Heragrain tìm cách **giữ giá '
                                    'trị nông sản sau thu hoạch**, giảm hư hao và nâng giá bán cho bà con.')),
        (L.story_product, dict(nav=0, title='Sứ mệnh', script='nông sản Việt', product='xoai', second='hat',
                               side='left',
                               text='Mang **nông sản sạch – an toàn – tiện lợi** đến người tiêu dùng; tạo việc làm ổn '
                                    'định và **thu nhập bền vững** cho thành viên hợp tác xã.')),
        (L.values_row, dict(nav=0, title='Giá trị', script='cốt lõi',
                            text='Ba cam kết theo suốt từng mẻ sấy: **nguyên liệu tuyển chọn**, **quy trình sạch** và '
                                 '**hương vị tự nhiên**.',
                            items=[dict(product='khoai', label='Tự nhiên', text='Không phẩm màu, chất bảo quản'),
                                   dict(product='xoai', label='Chất lượng', text='Tuyển chọn từ vùng trồng'),
                                   dict(product='ngucoc', label='Bền vững', text='Đồng hành cùng nông hộ')])),
        (L.lineup, dict(nav=1, title='Sản phẩm', script='Heragrain', items=[
            dict(word='Sấy dẻo', product='xoai', caption='Trái cây sấy dẻo'),
            dict(word='Sấy giòn', product='chuoi', caption='Trái cây, củ sấy giòn'),
            dict(word='Ngũ cốc', product='ngucoc', caption='Ngũ cốc & hạt')])),
        (L.category, dict(nav=1, word='Sấy dẻo', script='trái cây', product='xoai',
                          caption='Giữ độ dẻo, màu sắc và vị ngọt tự nhiên của trái cây')),
        (L.carousel, dict(nav=1, height=4.7, items=[
            dict(product='xoai', name='Xoài sấy dẻo', script='Dẻo thơm', photo='terrace', focus=[0.5, 0.6],
                 text='Xoài chín cây, **sấy lạnh** giữ vị chua ngọt hài hòa; túi zip 200 g.'),
            dict(product='khoai', name='Khoai lang sấy', script='Ngọt bùi', photo='hills', focus=[0.5, 0.6],
                 text='Khoai lang tím, **sấy dẻo không đường**, ăn vặt lành mạnh cho cả nhà.')])),
        (L.category, dict(nav=1, word='Sấy giòn', script='ăn vặt', product='chuoi',
                          caption='Giòn rụm, ít dầu — món ăn vặt lành mạnh')),
        (L.carousel, dict(nav=1, height=4.7, items=[
            dict(product='chuoi', name='Chuối sấy giòn', script='Giòn tan', photo='rice_field', focus=[0.5, 0.6],
                 text='Chuối chín vàng, **sấy giòn ít dầu**, vị ngọt tự nhiên.'),
            dict(product='hat', name='Hạt dinh dưỡng', script='Mix 5 loại', photo='valley', focus=[0.5, 0.6],
                 text='Hạt điều, hạnh nhân, óc chó… **rang sấy**, không thêm đường.'),
            dict(product='ngucoc', name='Ngũ cốc sấy', script='Bữa sáng', photo='terrace', focus=[0.5, 0.4],
                 text='Yến mạch, hạt và trái cây sấy — **bữa sáng nhanh** và đủ chất.')])),
        (L.features, dict(nav=1, title='Vì sao chọn', script='Heragrain', product='xoai', items=[
            ('leaf', 'Nguyên liệu sạch', 'Thu mua trực tiếp từ vùng trồng của thành viên HTX.'),
            ('sun', 'Sấy lạnh hiện đại', 'Giữ màu, mùi và vitamin tốt hơn sấy nhiệt thông thường.'),
            ('shield-check', 'An toàn', 'Không phẩm màu, không chất bảo quản.'),
            ('package-open', 'Tiện lợi', 'Túi zip nhỏ gọn, bảo quản dễ dàng.')])),
        (L.specs, dict(nav=1, title='Thông tin sản phẩm', script='Xoài sấy dẻo', product='xoai', col_w=[2.4, 2.0],
                       rows=[['Thông tin', 'Chi tiết'], ['Thành phần', '100% xoài cát chín'],
                             ['Khối lượng', '200 g / túi zip'], ['Hạn sử dụng', '12 tháng'],
                             ['Bảo quản', 'Nơi khô ráo, thoáng mát'], ['Tiêu chuẩn', '[TCCS / OCOP …]']],
                       note='Thông tin **minh họa** — thay bằng nhãn và hồ sơ công bố sản phẩm của HTX.')),
        (L.usage, dict(nav=2, title='Quy trình', script='sản xuất', steps=[
            ('apple', 'Tuyển chọn', 'Trái chín đều, không dập, đúng độ chín.'),
            ('droplets', 'Sơ chế', 'Rửa sạch, gọt, cắt lát đều tay.'),
            ('sun', 'Sấy lạnh', 'Sấy ở nhiệt độ thấp, giữ màu và dinh dưỡng.'),
            ('package-open', 'Đóng gói', 'Đóng túi zip, hút ẩm, dán nhãn truy xuất.'),
            ('truck', 'Phân phối', 'Cửa hàng, siêu thị và kênh online.')])),
        (L.results, dict(nav=2, title='Kết quả', script='hợp tác xã', photo='mango_vendor', focus=[0.5, 0.45],
                         chart=dict(cats=['2023', '2024', '2025', '2026'],
                                    series=[('Sản lượng (tấn)', [12, 18, 26, 35])], fmt='0', max=40),
                         kpis=[('120', '+', 'Hộ thành viên liên kết'), ('5', '', 'Dòng sản phẩm chủ lực'),
                               ('+30', '%', 'Thu nhập nông hộ')],
                         note='Số liệu minh họa — thay bằng số liệu thực tế của HTX.')),
        (L.window_cards, dict(nav=2, title='Vùng nguyên liệu', script='từ nông trại',
                              text='Hình ảnh **vùng trồng và nông sản** — thay bằng ảnh thật của HTX Heragrain.',
                              items=[dict(photo='mango_vendor', name='Xoài chín cây', focus=[0.5, 0.55]),
                                     dict(photo='jackfruit_tree', focus=[0.5, 0.5]),
                                     dict(photo='rice_drying', focus=[0.5, 0.6])])),
        (L.conclusion, dict(nav=0, title='Heragrain', script='trọn vị nông sản Việt',
                            text='Nông sản sấy Heragrain: **tự nhiên – an toàn – tiện lợi**, góp phần nâng giá trị '
                                 'nông sản và thu nhập cho bà con nông dân.',
                            products=['khoai', 'chuoi', 'xoai', 'hat', 'ngucoc'])),
        (L.contact, dict(word='Cảm ơn', script='Heragrain', product='xoai',
                         lines=[('phone', 'Hotline: 0xxx xxx xxx'), ('globe', 'www.heragrain.vn'),
                                ('mail', 'lienhe@heragrain.vn'), ('map-pin', 'Địa chỉ: [cập nhật địa chỉ HTX]')])),
    ]


if __name__ == '__main__':
    SB.main(sys.modules[__name__], HERE)
