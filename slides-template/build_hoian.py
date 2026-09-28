"""
Build the "Heritage" template (Hội An style).

    python build_hoian.py

Content lives in build_content(); photos are mapped in PHOTOS (Open Images ids in assets/images/src/,
CC BY 2.0 — see assets/images/credits.csv). Generated artwork goes to assets/images/build/heritage/.
"""
import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

from PIL import Image  # noqa: E402

import pptkit as K  # noqa: E402
import heritage_assets as A  # noqa: E402
import layouts_heritage as H  # noqa: E402

SRC = os.path.join(HERE, 'assets', 'images', 'src')
CUT = os.path.join(HERE, 'assets', 'images', 'cut')
OUT = os.path.join(HERE, 'assets', 'images', 'build', 'heritage')
FONT_DIR = os.path.join(HERE, 'fonts', 'heritage')

PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'heritage_photos.json'), encoding='utf-8'))


def src(key):
    v = PHOTOS[key]
    return os.path.join(SRC, (v['id'] if isinstance(v, dict) else v) + '.jpg')


def focus(key):
    v = PHOTOS[key]
    return tuple(v.get('focus', (0.5, 0.5))) if isinstance(v, dict) else (0.5, 0.5)


def prepare():
    os.makedirs(OUT, exist_ok=True)
    img, size = {}, {}

    def reg(key, path):
        img[key] = path
        size[key] = Image.open(path).size

    # plain photos (cropped in PowerPoint, so the originals stay swappable)
    for key in PHOTOS:
        reg(key, src(key))
    # full-bleed backgrounds + frosted copies
    for key in ('cover', 'bridge', 'aerial', 'river_blue', 'street', 'assembly', 'museum', 'market', 'statue_bg',
                'lantern_street', 'dusk'):
        if key in PHOTOS:
            p = A.full_bleed(src(key), os.path.join(OUT, f'bg_{key}.jpg'), focus=focus(key))
            reg('bg_' + key, p)
            reg('blur_' + key, A.blurred(p, os.path.join(OUT, f'blur_{key}.jpg'), radius=24, bright=1.05))
    reg('blur_cover_soft', A.blurred(img['bg_cover'], os.path.join(OUT, 'blur_cover_soft.jpg'), radius=9))
    # artwork
    reg('parchment', A.parchment(os.path.join(OUT, 'parchment.jpg')))
    reg('banner', A.brush_banner(os.path.join(OUT, 'banner.png')))
    reg('emblem', A.emblem(os.path.join(OUT, 'emblem.png'), os.path.join(FONT_DIR, H.FONTS['disp'][1])))
    # torn-edge prints
    prints = {
        'pr_old': ('old_port', dict(rot=6, tone='bw')),
        'pr_street': ('street', dict(rot=-7, tone='aged')),
        'pr_house': ('old_house', dict(rot=4, tone='aged', aspect=3 / 4)),
        'pr_fest': ('festival', dict(rot=-6)),
        'pr_craft': ('craft', dict(rot=5)),
        'pr_lantern': ('lanterns', dict(rot=-4, aspect=3 / 4)),
        'pr_river': ('river_blue', dict(rot=7)),
    }
    for i, (key, (photo_key, kw)) in enumerate(prints.items()):
        if photo_key in PHOTOS:
            kw = dict(kw)
            kw.setdefault('focus', focus(photo_key))
            reg(key, A.polaroid(src(photo_key), os.path.join(OUT, f'{key}.png'), seed=i + 3, **kw))
    # background-removed cut-outs
    for key, fname in (('statue_cut', 'heritage_statue.png'), ('cover_fg', 'heritage_cover_fg.png')):
        p = os.path.join(CUT, fname)
        if os.path.exists(p):
            reg(key, p)
    # map
    mp = os.path.join(HERE, 'assets', 'maps', 'hoian_map.png')          # made by tools/make_map.py
    meta = json.load(open(os.path.join(HERE, 'assets', 'maps', 'hoian_map.json'), encoding='utf-8'))
    reg('map', mp)
    mapinfo = dict(path=mp, pts={k: (v[0] * K.SW, v[1] * K.SH) for k, v in meta['points'].items()})
    return img, size, mapinfo


LOREM = None


def build_content():
    return [
        (H.cover, dict(kicker='Di sản văn hóa', title1='Phố cổ', title2='Hội An', title_x=5.3,
                       info1='BÁO CÁO CHUYÊN ĐỀ · VĂN HÓA VIỆT NAM',
                       info2='Nhóm 05 – Lớp VH47   |   GVHD: ThS. Nguyễn Văn A   |   Học kỳ I, 2026')),
        (H.agenda, dict(title='Nội dung', sub='Phố cổ Hội An', images=['lanterns', 'bridge'],
                        items=[('Vị trí địa lý', 'Hạ lưu sông Thu Bồn, cách trung tâm Đà Nẵng khoảng 30 km'),
                               ('Thành phố lễ hội', 'Du lịch, di tích tiêu biểu và nhịp sống phố cổ'),
                               ('Trải nghiệm & ẩm thực', 'Những hoạt động và món ăn gắn với Hội An'),
                               ('Lịch sử – văn hóa', 'Từ thương cảng quốc tế đến di sản thế giới'),
                               ('Bảo tồn & phát huy', 'Giải pháp, số liệu và kiến nghị')])),
        (H.map_slide, dict(title='Vị trí địa lý', sub='Phố cổ Hội An', frm=None,
                           body='**Phố cổ Hội An** là một đô thị cổ nằm ở hạ lưu **sông Thu Bồn**, thuộc vùng đồng bằng '
                                'ven biển miền Trung Việt Nam, cách trung tâm Đà Nẵng khoảng **30 km** về phía Nam.\n'
                                'Trong lịch sử, Hội An từng được biết đến trên thương trường quốc tế với nhiều tên gọi '
                                'như **Faifo**, **Hoài Phố** và **Hội An**.',
                           **{'from': 'danang', 'to': 'hoian'}, labels={'danang': 'Đà Nẵng', 'hoian': 'Hội An'},
                           distance='30 km')),
        (H.glass_timeline, dict(title='Vị trí địa lý', sub='Phố cổ Hội An', bg='bg_cover', bg_blur='blur_cover',
                                heading='Di sản văn hóa thế giới:',
                                body='Phố cổ Hội An nhiều lần được bình chọn là một trong những **thành phố cổ quyến rũ** '
                                     'nhất thế giới và là điểm chụp ảnh ấn tượng hàng đầu của du khách.',
                                badge='Năm 1999', icon='landmark',
                                items=['Vật thể nổi bật của sự **kết hợp các nền văn hóa** qua các thời kỳ trong một '
                                       'thương cảng quốc tế.',
                                       'Tiêu biểu về một **cảng thị châu Á** truyền thống được bảo tồn một cách trọn vẹn.',
                                       'UNESCO ghi danh vào **Danh mục Di sản Thế giới** tháng 12/1999.'])),
        (H.section, dict(num=2, title='Thành phố lễ hội', sub='Phố cổ Hội An', bg='bg_bridge', bg_blur='blur_bridge',
                         desc='Du lịch phát triển mạnh, di tích dày đặc và nhịp sống phố cổ lung linh về đêm.')),
        (H.charts, dict(title='Thành phố lễ hội', sub='Phố cổ Hội An',
                        stat='**7,7 triệu** lượt khách du lịch đến khu vực (minh họa)'.replace('**', ''),
                        banner='Lượng khách du lịch tăng trưởng vượt bậc',
                        charts=[('Tổng lượt khách', [str(y) for y in range(2011, 2019)],
                                 [2.4, 2.7, 3.2, 3.9, 4.7, 5.6, 6.7, 7.7], '0.0', 'Triệu lượt'),
                                ('Tổng thu du lịch', [str(y) for y in range(2011, 2019)],
                                 [4600, 6000, 7784, 9870, 12817, 16083, 19504, 24060], '#,##0', 'Tỷ đồng')])),
        (H.place, dict(title='Thành phố lễ hội', sub='Phố cổ Hội An', bg='bg_bridge', collage='grid4', name='Chùa Cầu',
                       body='Chiếc cầu được các thương nhân **Nhật Bản** góp tiền xây dựng vào khoảng **thế kỷ XVII**, '
                            'nên còn được gọi là **cầu Nhật Bản**. Đây là biểu tượng của Hội An, xuất hiện trên mặt sau '
                            'tờ tiền polymer **20.000 đồng**.',
                       photos=['bridge', 'bridge_night', 'lanterns', 'river_night'])),
        (H.place, dict(title='Thành phố lễ hội', sub='Phố cổ Hội An', bg='bg_street', collage='wide_top',
                       name='Nhà cổ\nphố Trần Phú',
                       body='Những ngôi nhà gỗ hàng trăm năm tuổi mang phong cách kiến trúc **Việt – Hoa – Nhật**, '
                            'mái ngói âm dương, tường vàng rêu phong. Nhiều ngôi nhà vẫn giữ được **nội thất và đồ gỗ** '
                            'từ thời thương cảng.',
                       photos=['river_blue', 'old_house', 'old_house_int'])),
        (H.place, dict(title='Thành phố lễ hội', sub='Phố cổ Hội An', bg='bg_assembly', collage='wide_bottom',
                       name='Hội quán\nQuảng Đông',
                       body='Hội quán nằm trên **“con đường di sản” Trần Phú**, với nhiều công trình kiến trúc độc đáo '
                            'mang ý nghĩa lịch sử. Tọa lạc ở **trung tâm phố cổ**, nơi đây đón rất nhiều lượt khách '
                            'mỗi ngày.',
                       photos=['assembly', 'temple_detail', 'assembly_int'])),
        (H.place_cutout, dict(title='Thành phố lễ hội', sub='Phố cổ Hội An', bg='bg_statue_bg', cutout='statue_cut',
                              name='Tượng kiến trúc sư\nKazik',
                              body='**Kazimierz Kwiatkowski (Kazik)** là một trong những người đặt viên gạch đầu tiên '
                                   'trên con đường đưa Hội An đến danh hiệu **Di sản văn hóa thế giới**, với nhiều đóng góp '
                                   'cho công tác trùng tu và bảo tồn di sản.',
                              caption='Ảnh minh họa đã tách nền')),
        (H.place, dict(title='Thành phố lễ hội', sub='Phố cổ Hội An', bg='bg_museum', collage='five',
                       name='Bảo tàng văn hóa\nSa Huỳnh',
                       body='Bảo tàng trưng bày hàng trăm hiện vật độc đáo thuộc nền **văn hóa Sa Huỳnh**: mộ chum, '
                            'đồ gốm, trang sức đá và kim loại, được tìm thấy qua các đợt **khai quật khảo cổ** tại Hội An.',
                       photos=['pottery', 'pottery2', 'museum_int', 'craft', 'lantern_shop'])),
        (H.place, dict(title='Thành phố lễ hội', sub='Phố cổ Hội An', bg='bg_market', collage='row3', name='Chợ Hội An',
                       body='Chợ chính là **nơi tái hiện rõ ràng và chân thực** nét văn hóa, cuộc sống và tính cách con '
                            'người của mỗi vùng đất. **Chợ Hội An** gây ấn tượng bởi nét mộc mạc, thân quen.',
                       photos=['market', 'market2', 'street_food'])),
        (H.mosaic, dict(title='Các trải nghiệm', sub='Phố cổ Hội An', layout='experience',
                        verse='Ai đi phố Hội, Chùa Cầu\nĐể thương, để nhớ, để sầu cho ai',
                        photos=[('boat_night', 'Đi thuyền trên sông Hoài'), ('flower_lantern', 'Thả đèn hoa đăng'),
                                ('festival', 'Lễ hội đèn lồng'), ('old_house', 'Tham quan nhà cổ'),
                                ('lantern_shop', 'Mua đèn lồng')], order=[2, 0, 1, 3, 4])),
        (H.mosaic, dict(title='Ẩm thực', sub='Phố cổ Hội An', layout='cuisine',
                        photos=[('food1', 'Bánh xèo'), ('food2', 'Cao lầu'), ('food3', 'Mì Quảng'),
                                ('food4', 'Bún thịt nướng'), ('food5', 'Bánh mì')], order=[2, 1, 3, 0, 4])),
        (H.section, dict(num=3, title='Lịch sử – văn hóa', sub='Phố cổ Hội An', bg='bg_aerial', bg_blur='blur_aerial',
                         desc='Từ thương cảng quốc tế sầm uất đến di sản văn hóa của nhân loại.')),
        (H.timeline, dict(title='Dòng chảy lịch sử', sub='Phố cổ Hội An', bg='bg_dusk',
                          events=[('XVI–XVII', 'Thương cảng quốc tế', 'Thuyền buôn Nhật Bản, Trung Hoa, phương Tây cập bến.'),
                                  ('XIX', 'Dần lắng đọng', 'Sông bồi lắng, trung tâm thương mại dịch chuyển.'),
                                  ('1985', 'Di tích quốc gia', 'Khu phố cổ được công nhận di tích lịch sử – văn hóa.'),
                                  ('1999', 'Di sản thế giới', 'UNESCO ghi danh phố cổ Hội An.'),
                                  ('Nay', 'Điểm đến văn hóa', 'Bảo tồn gắn với phát triển du lịch bền vững.')])),
        (H.polaroids, dict(title='Lịch sử – văn hóa', sub='Phố cổ Hội An', bg='bg_aerial',
                           body='**Hội An** là minh chứng cho sự giao thoa văn hóa giữa các nền văn minh, bao gồm văn hóa '
                                '**Việt, Trung Quốc và Nhật Bản**.\n'
                                '**Từng là** một cảng thương mại sầm uất từ thế kỷ XVI – XVIII, điểm dừng chân của thương '
                                'nhân nhiều quốc gia.\n'
                                '**Hội An nổi tiếng** với các nghề thủ công truyền thống như làm đèn lồng, gốm sứ, dệt '
                                'vải, phản ánh sự tinh tế của người dân nơi đây.',
                           note='Hội An không chỉ là một điểm đến du lịch mà còn là **một bảo tàng sống**.',
                           prints=['pr_old', 'pr_street', 'pr_house'],
                           pos=[(7.2, 0.45, 3.3), (9.95, 1.7, 3.1), (7.75, 3.7, 3.35)])),
        (H.polaroids, dict(title='Bảo tồn & phát huy giá trị', sub='Phố cổ Hội An', bg='bg_lantern_street',
                           body='**Phố cổ Hội An** là một trong những đô thị cổ đẹp nhất Đông Nam Á, được UNESCO công nhận '
                                'là di sản văn hóa thế giới năm 1999.\n'
                                '**Tuy nhiên**, Hội An cũng đang đối mặt với nhiều nguy cơ ảnh hưởng đến giá trị di sản; '
                                'nhiệm vụ bảo tồn trở nên quan trọng và cấp bách.',
                           bullets=['Bảo tồn kiến trúc cổ', 'Quản lý môi trường đô thị cổ', 'Phát huy các giá trị văn hóa',
                                    'Giáo dục và nâng cao nhận thức cộng đồng'], bullet_y=4.25,
                           prints=['pr_fest', 'pr_lantern', 'pr_craft', 'pr_river'],
                           pos=[(7.0, 0.5, 2.9), (10.15, 0.35, 3.45), (7.35, 3.45, 3.1), (9.9, 3.85, 2.85)])),
        (H.numbers, dict(title='Những con số', sub='Phố cổ Hội An', image='river_blue',
                         lead='Các chỉ số tiêu biểu giúp người nghe hình dung nhanh quy mô và giá trị của di sản.',
                         stats=[('landmark', '1.100+', 'di tích', 'Công trình kiến trúc, di tích được kiểm kê trong khu phố cổ'),
                                ('calendar-days', '400+', 'năm', 'Lịch sử hình thành và phát triển của đô thị cổ'),
                                ('award', '1999', '', 'Năm UNESCO ghi danh Di sản văn hóa thế giới'),
                                ('map-pin', '30', 'km', 'Khoảng cách tới trung tâm thành phố Đà Nẵng')])),
        (H.table_slide, dict(title='Di tích tiêu biểu', sub='Phố cổ Hội An', image='assembly',
                             caption='Bảng có thể thay bằng bất kỳ số liệu nào — giữ nguyên kiểu chữ và màu sắc.',
                             col_w=[2.2, 1.55, 4.55],
                             rows=[['Di tích', 'Niên đại', 'Điểm nổi bật'],
                                   ['Chùa Cầu', 'TK XVII', 'Biểu tượng của Hội An, kiến trúc Nhật Bản'],
                                   ['Nhà cổ Tấn Ký', 'TK XVIII', 'Nhà gỗ kết hợp phong cách Việt – Hoa – Nhật'],
                                   ['Hội quán Phúc Kiến', 'TK XVII', 'Nơi sinh hoạt cộng đồng người Hoa'],
                                   ['Hội quán Quảng Đông', '1885', 'Trên con đường di sản Trần Phú'],
                                   ['Bảo tàng Sa Huỳnh', '1994', 'Hiện vật văn hóa Sa Huỳnh'],
                                   ['Chợ Hội An', 'TK XIX', 'Nhịp sống thường ngày của phố cổ']])),
        (H.swot, dict(title='Phát triển du lịch bền vững', sub='Phân tích SWOT',
                      items=[('S', 'Điểm mạnh', 'Di sản được bảo tồn gần như nguyên vẹn\nThương hiệu du lịch quốc tế'),
                             ('W', 'Điểm yếu', 'Quá tải du khách vào mùa cao điểm\nNgập lụt hằng năm'),
                             ('O', 'Cơ hội', 'Du lịch trải nghiệm, du lịch xanh\nChuyển đổi số trong quảng bá'),
                             ('T', 'Thách thức', 'Biến đổi khí hậu, xói lở\nNguy cơ thương mại hóa di sản')])),
        (H.conclusion, dict(title='Kết luận', sub='Phố cổ Hội An', bg='bg_dusk', bg_blur='blur_dusk',
                            lead='Hội An là bảo tàng sống của kiến trúc và lối sống đô thị cổ — cần được gìn giữ bằng '
                                 'sự chung tay của cả cộng đồng.',
                            items=[('Giá trị', 'Minh chứng cho sự giao thoa văn hóa Việt – Hoa – Nhật và phương Tây qua '
                                               'nhiều thế kỷ.'),
                                   ('Thách thức', 'Áp lực du lịch, biến đổi khí hậu và nguy cơ thương mại hóa đòi hỏi '
                                                  'quản lý chặt chẽ.'),
                                   ('Kiến nghị', 'Phát triển du lịch bền vững, số hóa di sản và giáo dục cộng đồng về '
                                                 'bảo tồn.')])),
        (H.thanks, dict(title1='Xin Cảm Ơn', title2='Đã Lắng Nghe')),
    ]


def credit_lines():
    rows = list(csv.DictReader(open(os.path.join(HERE, 'assets', 'images', 'credits.csv'), encoding='utf-8')))
    used = {(v['id'] if isinstance(v, dict) else v) for v in PHOTOS.values()}
    return [f"• {r['title'][:46]} — {r['author']} (Flickr, CC BY 2.0)" for r in rows if r['image_id'] in used]


def build(out_dir):
    H.register()
    img, size, mapinfo = prepare()
    prs = K.new_presentation()
    ctx = dict(n=0, img=img, size=size, map=mapinfo)
    slides = [fn(prs, ctx, c) for fn, c in build_content()]
    slides.append(H.credits(prs, ctx, dict(intro='Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0. '
                                                  'Bản đồ: Natural Earth (public domain). Icon: Lucide (ISC). '
                                                  'Font: Noto Serif Display, Noto Serif, Playfair Display (SIL OFL).',
                                           lines=credit_lines())))
    for s in slides:
        K.finalize(s)
    out = os.path.join(out_dir, 'Mau-Bao-Cao-HoiAn.pptx')
    prs.save(out)
    print('saved', out, len(prs.slides._sldIdLst), 'slides')
    return out


if __name__ == '__main__':
    os.makedirs(os.path.join(HERE, 'output'), exist_ok=True)
    build(os.path.join(HERE, 'output'))
