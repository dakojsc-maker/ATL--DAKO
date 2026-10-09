"""
Build the M03 "Di sản Hội An" (Heritage) template.

    python build_hoian.py                                        # demo deck (Phố cổ Hội An)
    python build_hoian.py --content my.json --name Bao-cao-Hue   # a real deck from a content file
    python build_hoian.py --dump-sample catalog/samples/M03-hoian.json

Content lives in build_content(); photos are mapped in assets/images/heritage_photos.json
(Open Images ids in assets/images/src/, CC BY 2.0 — see assets/images/credits.csv).
Generated artwork goes to assets/images/build/heritage/. The map comes from tools/make_map.py.
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
import content_io as CIO  # noqa: E402

SRC = os.path.join(HERE, 'assets', 'images', 'src')
CUT = os.path.join(HERE, 'assets', 'images', 'cut')
OUT = os.path.join(HERE, 'assets', 'images', 'build', 'heritage')
FONT_DIR = os.path.join(HERE, 'fonts', 'heritage')

PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'heritage_photos.json'), encoding='utf-8'))
FOCUS = {'cover': (0.5, 0.6), 'bridge': (0.5, 0.55), 'roofs': (0.5, 0.6), 'vendor': (0.5, 0.4),
         'craft': (0.3, 0.5), 'old_house': (0.45, 0.5), 'food3': (0.5, 0.35)}
PRINTS = {   # torn-edge prints: key -> (photo, options)
    'pr_old': ('old_bw', dict(rot=6, tone='sepia')),
    'pr_street': ('street2', dict(rot=-7, tone='aged')),
    'pr_house': ('old_house', dict(rot=4, tone='aged', aspect=3 / 4)),
    'pr_fest': ('lantern_market', dict(rot=-6)),
    'pr_lantern': ('craft', dict(rot=5, aspect=3 / 4)),
    'pr_craft': ('calligraphy', dict(rot=-4)),
    'pr_river': ('river_blue', dict(rot=7)),
}
CUTOUTS = {'vendor_cut': 'heritage_vendor.png'}
MAP = 'hoian_map'          # assets/maps/<MAP>.png/.json — make another with tools/make_map.py


def src(key):
    return CIO.photo_path(PHOTOS[key])


def prepare():
    os.makedirs(OUT, exist_ok=True)
    img, size = {}, {}

    def reg(key, path):
        img[key] = path
        size[key] = Image.open(path).size

    for key in PHOTOS:
        reg(key, src(key))
        f = FOCUS.get(key, (0.5, 0.5))
        bg = os.path.join(OUT, f'bg_{key}.jpg')
        if not os.path.exists(bg) or os.path.getmtime(bg) < os.path.getmtime(src(key)):
            A.full_bleed(src(key), bg, focus=f)
        reg('bg_' + key, bg)
        bl = os.path.join(OUT, f'blur_{key}.jpg')
        if not os.path.exists(bl) or os.path.getmtime(bl) < os.path.getmtime(bg):
            A.blurred(bg, bl, radius=24, bright=1.05)
        reg('blur_' + key, bl)
    soft = os.path.join(OUT, 'soft_cover.jpg')
    if not os.path.exists(soft):
        A.blurred(img['bg_cover'], soft, radius=7)
    reg('soft_cover', soft)
    reg('parchment', A.parchment(os.path.join(OUT, 'parchment.jpg')))
    reg('banner', A.brush_banner(os.path.join(OUT, 'banner.png')))
    reg('emblem', A.emblem(os.path.join(OUT, 'emblem.png'), os.path.join(FONT_DIR, H.FONTS['disp'][1])))
    for i, (key, (photo_key, kw)) in enumerate(PRINTS.items()):
        kw = dict(kw)
        kw.setdefault('focus', FOCUS.get(photo_key, (0.5, 0.5)))
        reg(key, A.polaroid(src(photo_key), os.path.join(OUT, f'{key}.png'), seed=i + 3, **kw))
    for key, fname in CUTOUTS.items():
        reg(key, os.path.join(CUT, fname))
    mp = os.path.join(HERE, 'assets', 'maps', MAP + '.png')          # made by tools/make_map.py
    meta = json.load(open(os.path.join(HERE, 'assets', 'maps', MAP + '.json'), encoding='utf-8'))
    mapinfo = dict(path=mp, pts={k: (v[0] * K.SW, v[1] * K.SH) for k, v in meta['points'].items()})
    return img, size, mapinfo


SUB = 'Phố cổ Hội An'


def build_content():
    return [
        (H.cover, dict(kicker='Di sản văn hóa', title1='Phố cổ', title2='Hội An', title_x=5.25,
                       info1='BÁO CÁO CHUYÊN ĐỀ · VĂN HÓA VIỆT NAM',
                       info2='Nhóm 05 – Lớp VH47   |   GVHD: ThS. Nguyễn Văn A   |   Học kỳ I, 2026')),
        (H.agenda, dict(title='Nội dung', sub=SUB, images=['lanterns', 'bridge'],
                        items=[('Vị trí địa lý', 'Hạ lưu sông Thu Bồn, cách trung tâm Đà Nẵng khoảng 30 km'),
                               ('Thành phố lễ hội', 'Du lịch, di tích tiêu biểu và nhịp sống phố cổ'),
                               ('Trải nghiệm & ẩm thực', 'Những hoạt động và món ăn gắn với phố Hội'),
                               ('Lịch sử – văn hóa', 'Từ thương cảng quốc tế đến di sản thế giới'),
                               ('Bảo tồn & phát huy', 'Số liệu, phân tích và kiến nghị')])),
        (H.map_slide, {'title': 'Vị trí địa lý', 'sub': SUB,
                       'body': '**Phố cổ Hội An** là một đô thị cổ nằm ở hạ lưu **sông Thu Bồn**, thuộc vùng đồng bằng '
                               'ven biển miền Trung Việt Nam, cách trung tâm Đà Nẵng khoảng **30 km** về phía Nam.\n'
                               'Trong lịch sử, Hội An từng được biết đến trên thương trường quốc tế với nhiều tên gọi '
                               'như **Faifo**, **Hoài Phố** và **Hội An**.',
                       'from': 'danang', 'to': 'hoian', 'labels': {'danang': 'Đà Nẵng', 'hoian': 'Hội An'},
                       'distance': '30 km'}),
        (H.glass_timeline, dict(title='Vị trí địa lý', sub=SUB, bg='soft_cover', bg_blur='blur_cover',
                                heading='Di sản văn hóa thế giới:',
                                body='Phố cổ Hội An nhiều lần được bình chọn là một trong những **thành phố cổ quyến rũ** '
                                     'nhất thế giới và là điểm chụp ảnh ấn tượng hàng đầu của du khách.',
                                badge='Năm 1999', icon='landmark',
                                items=['Vật thể nổi bật của sự **kết hợp các nền văn hóa** qua các thời kỳ trong một '
                                       'thương cảng quốc tế.',
                                       'Tiêu biểu về một **cảng thị châu Á** truyền thống được bảo tồn trọn vẹn.',
                                       'UNESCO ghi danh vào **Danh mục Di sản Thế giới** tháng 12/1999.'])),
        (H.section, dict(num=2, title='Thành phố lễ hội', sub=SUB, bg='bg_bridge', bg_blur='blur_bridge',
                         desc='Du lịch phát triển mạnh, di tích dày đặc và nhịp sống phố cổ lung linh về đêm.')),
        (H.charts, dict(title='Thành phố lễ hội', sub=SUB,
                        stat='Lượng khách du lịch tăng đều qua từng năm (số liệu minh họa)',
                        banner='Khách du lịch tăng trưởng vượt bậc',
                        charts=[('Tổng lượt khách', [str(y) for y in range(2011, 2019)],
                                 [2.4, 2.7, 3.2, 3.9, 4.7, 5.6, 6.7, 7.7], '0.0', 'Triệu lượt'),
                                ('Tổng thu du lịch', [str(y) for y in range(2011, 2019)],
                                 [4600, 6000, 7784, 9870, 12817, 16083, 19504, 24060], '#,##0', 'Tỷ đồng')])),
        (H.place, dict(title='Thành phố lễ hội', sub=SUB, bg='bg_bridge', collage='grid4', name='Chùa Cầu',
                       body='Chiếc cầu được các thương nhân **Nhật Bản** góp tiền xây dựng vào khoảng **thế kỷ XVII**, '
                            'nên còn được gọi là **cầu Nhật Bản**. Đây là biểu tượng của Hội An, xuất hiện trên mặt sau '
                            'tờ tiền polymer **20.000 đồng**.',
                       photos=['bridge_night', 'lanterns2', 'river_night', 'flower_lantern'])),
        (H.place, dict(title='Thành phố lễ hội', sub=SUB, bg='bg_street', collage='wide_top', name='Những ngôi\nnhà cổ',
                       body='Những ngôi nhà gỗ hàng trăm năm tuổi mang phong cách kiến trúc **Việt – Hoa – Nhật**, mái '
                            'ngói âm dương, tường vàng rêu phong. Nhiều ngôi nhà vẫn giữ được **nội thất và đồ gỗ** từ thời '
                            'thương cảng.',
                       photos=['old_house', 'old_house_int', 'courtyard'])),
        (H.place, dict(title='Thành phố lễ hội', sub=SUB, bg='bg_assembly', collage='wide_bottom',
                       name='Hội quán\nPhúc Kiến',
                       body='Hội quán do cộng đồng người Hoa gốc **Phúc Kiến** xây dựng trên **con đường di sản Trần Phú**, '
                            'thờ **Thiên Hậu Thánh Mẫu** – vị thần phù hộ người đi biển. Cổng tam quan rực rỡ, mái ngói '
                            'lưu ly và những vòng hương khổng lồ thu hút rất nhiều du khách.',
                       photos=['assembly_gate', 'incense', 'temple_detail'])),
        (H.place_cutout, dict(title='Thành phố lễ hội', sub=SUB, bg='blur_street2', cutout='vendor_cut',
                              name='Gánh hàng rong',
                              body='Hình ảnh người phụ nữ **đội nón lá, quang gánh** rong ruổi qua các con phố cổ đã trở '
                                   'thành biểu tượng bình dị của Hội An. Những gánh hoa quả, bánh trái mang theo **nhịp '
                                   'sống thường nhật** của người dân phố Hội.',
                              caption='Ảnh đã được tách nền tự động', cut_h=5.9, cut_cx=9.9)),
        (H.place, dict(title='Thành phố lễ hội', sub=SUB, bg='bg_museum_int', collage='five',
                       name='Bảo tàng\ngốm sứ mậu dịch',
                       body='Bảo tàng trưng bày hàng trăm hiện vật **gốm sứ** có nguồn gốc từ Việt Nam, Trung Quốc, Nhật '
                            'Bản, Thái Lan…, minh chứng cho vai trò **thương cảng quốc tế** của Hội An từ thế kỷ XVI – '
                            'XVIII.',
                       photos=['pottery', 'pottery2', 'assembly_int', 'old_house_int', 'calligraphy'])),
        (H.place, dict(title='Thành phố lễ hội', sub=SUB, bg='bg_fish_market', collage='row3', name='Chợ Hội An',
                       body='Chợ chính là **nơi tái hiện rõ ràng và chân thực** nét văn hóa, cuộc sống và tính cách con '
                            'người của mỗi vùng đất. **Chợ Hội An** gây ấn tượng bởi nét mộc mạc, thân quen.',
                       photos=['market', 'dried_fish', 'eating'])),
        (H.mosaic, dict(title='Các trải nghiệm', sub=SUB, layout='experience',
                        verse='Ai đi phố Hội, Chùa Cầu\nĐể thương, để nhớ, để sầu cho ai',
                        photos=[('boat_dusk', 'Đi thuyền trên sông Hoài'), ('flower_lantern', 'Thả đèn hoa đăng'),
                                ('lantern_market', 'Phố đèn lồng về đêm'), ('old_house', 'Tham quan nhà cổ'),
                                ('lantern_shop', 'Mua đèn lồng')], order=[2, 0, 1, 3, 4])),
        (H.mosaic, dict(title='Ẩm thực', sub=SUB, layout='cuisine',
                        photos=[('food5', 'Phở & cà phê sáng'), ('food1', 'Bánh xèo'), ('food2', 'Gỏi cuốn'),
                                ('food3', 'Cơm gà'), ('food4', 'Bánh mì')], order=[2, 1, 3, 0, 4])),
        (H.section, dict(num=3, title='Lịch sử – văn hóa', sub=SUB, bg='bg_roofs', bg_blur='blur_roofs',
                         desc='Từ thương cảng quốc tế sầm uất đến di sản văn hóa của nhân loại.')),
        (H.timeline, dict(title='Dòng chảy lịch sử', sub=SUB, bg='bg_dusk',
                          events=[('XVI–XVII', 'Thương cảng quốc tế', 'Thuyền buôn Nhật Bản, Trung Hoa, phương Tây cập bến.'),
                                  ('XIX', 'Dần lắng đọng', 'Sông bồi lắng, trung tâm thương mại dịch chuyển.'),
                                  ('1985', 'Di tích quốc gia', 'Khu phố cổ được công nhận di tích lịch sử – văn hóa.'),
                                  ('1999', 'Di sản thế giới', 'UNESCO ghi danh phố cổ Hội An.'),
                                  ('Nay', 'Điểm đến văn hóa', 'Bảo tồn gắn với phát triển du lịch bền vững.')])),
        (H.polaroids, dict(title='Lịch sử – văn hóa', sub=SUB, bg='bg_roofs',
                           body='**Hội An** là minh chứng cho sự giao thoa văn hóa giữa các nền văn minh, bao gồm văn hóa '
                                '**Việt, Trung Quốc và Nhật Bản**.\n'
                                '**Từng là** một cảng thương mại sầm uất từ thế kỷ XVI – XVIII, điểm dừng chân của thương '
                                'nhân nhiều quốc gia.\n'
                                '**Hội An nổi tiếng** với các nghề thủ công truyền thống như làm đèn lồng, gốm, mộc, dệt '
                                'vải, phản ánh sự tinh tế của người dân nơi đây.',
                           note='Hội An không chỉ là một điểm đến du lịch mà còn là **một bảo tàng sống**.',
                           prints=['pr_old', 'pr_street', 'pr_house'],
                           pos=[(7.1, 0.45, 3.1), (9.9, 1.55, 2.95), (7.6, 3.55, 3.45)])),
        (H.polaroids, dict(title='Bảo tồn & phát huy giá trị', sub=SUB, bg='bg_river_thubon',
                           body='**Phố cổ Hội An** là một trong những đô thị cổ đẹp nhất Đông Nam Á, được UNESCO công nhận '
                                'là di sản văn hóa thế giới năm 1999.\n'
                                '**Tuy nhiên**, Hội An cũng đang đối mặt với nhiều nguy cơ ảnh hưởng đến giá trị di sản; '
                                'nhiệm vụ bảo tồn trở nên quan trọng và cấp bách.',
                           bullets=['Bảo tồn kiến trúc cổ', 'Quản lý môi trường đô thị cổ', 'Phát huy các giá trị văn hóa',
                                    'Giáo dục và nâng cao nhận thức cộng đồng'], bullet_y=4.35,
                           prints=['pr_fest', 'pr_lantern', 'pr_craft', 'pr_river'],
                           pos=[(6.95, 0.45, 2.75), (10.0, 0.3, 3.35), (7.2, 3.4, 2.95), (9.85, 3.8, 2.75)])),
        (H.numbers, dict(title='Những con số', sub=SUB, image='flotilla',
                         lead='Các chỉ số tiêu biểu giúp người nghe hình dung nhanh quy mô và giá trị của di sản.',
                         stats=[('landmark', '1.100+', 'di tích', 'Công trình kiến trúc, di tích được kiểm kê trong khu phố cổ'),
                                ('calendar-days', '400+', 'năm', 'Lịch sử hình thành và phát triển của đô thị cổ'),
                                ('award', '1999', '', 'Năm UNESCO ghi danh Di sản văn hóa thế giới'),
                                ('map-pin', '30', 'km', 'Khoảng cách tới trung tâm thành phố Đà Nẵng')])),
        (H.table_slide, dict(title='Di tích tiêu biểu', sub=SUB, image='assembly2',
                             caption='Bảng có thể thay bằng bất kỳ số liệu nào — giữ nguyên kiểu chữ và màu sắc.',
                             col_w=[2.3, 1.45, 4.55],
                             rows=[['Di tích', 'Niên đại', 'Điểm nổi bật'],
                                   ['Chùa Cầu', 'TK XVII', 'Biểu tượng của Hội An, do thương nhân Nhật xây dựng'],
                                   ['Hội quán Phúc Kiến', 'TK XVII', 'Thờ Thiên Hậu, sinh hoạt cộng đồng người Hoa'],
                                   ['Nhà cổ Tấn Ký', 'TK XVIII', 'Nhà gỗ kết hợp phong cách Việt – Hoa – Nhật'],
                                   ['Hội quán Quảng Đông', 'TK XIX', 'Trên con đường di sản Trần Phú'],
                                   ['Bảo tàng gốm sứ', 'TK XX', 'Hiện vật gốm sứ mậu dịch nhiều quốc gia'],
                                   ['Chợ Hội An', 'TK XIX', 'Nhịp sống thường ngày của phố cổ']])),
        (H.swot, dict(title='Phát triển du lịch bền vững', sub='Phân tích SWOT',
                      items=[('S', 'Điểm mạnh', 'Di sản được bảo tồn gần như nguyên vẹn\nThương hiệu du lịch quốc tế'),
                             ('W', 'Điểm yếu', 'Quá tải du khách vào mùa cao điểm\nNgập lụt hằng năm'),
                             ('O', 'Cơ hội', 'Du lịch trải nghiệm, du lịch xanh\nChuyển đổi số trong quảng bá'),
                             ('T', 'Thách thức', 'Biến đổi khí hậu, xói lở\nNguy cơ thương mại hóa di sản')])),
        (H.conclusion, dict(title='Kết luận', sub=SUB, bg='bg_river_night', bg_blur='blur_river_night',
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
    used = set(PHOTOS.values())
    return [f"• {r['title'][:46]} — {r['author']} (Flickr, CC BY 2.0)" for r in rows if r['image_id'] in used]


def build(out_dir, content=None, name=None):
    H.register()
    img, size, mapinfo = prepare()
    prs = K.new_presentation()
    ctx = dict(n=0, img=img, size=size, map=mapinfo)
    slides = [fn(prs, ctx, c) for fn, c in (content or build_content())]
    slides.append(H.credits(prs, ctx, dict(intro='Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0. '
                                                  'Bản đồ: Natural Earth (public domain). Icon: Lucide (ISC). '
                                                  'Font: Noto Serif Display, Noto Serif, Playfair Display (SIL OFL).',
                                           lines=credit_lines())))
    for s in slides:
        K.finalize(s)
    name = (name + ('' if name.endswith('.pptx') else '.pptx')) if name else 'Mau-Bao-Cao-HoiAn.pptx'
    out = os.path.join(out_dir, name)
    prs.save(out)
    print('saved', out, len(prs.slides._sldIdLst), 'slides')
    return out


if __name__ == '__main__':
    import argparse
    ap = argparse.ArgumentParser()
    ap.add_argument('--out', default=os.path.join(HERE, 'output'))
    ap.add_argument('--content', help='JSON content file (see lib/content_io.py)')
    ap.add_argument('--name', help='output file name (without .pptx)')
    ap.add_argument('--dump-sample', metavar='PATH', help='write the demo content as a JSON content file and exit')
    a = ap.parse_args()
    if a.dump_sample:
        print('wrote', CIO.save(a.dump_sample, build_content(), template='M03', title='Phố cổ Hội An', photos=PHOTOS,
                                focus=FOCUS, map=MAP))
        raise SystemExit(0)
    content = None
    if a.content:
        meta, content = CIO.load(a.content, H)
        PHOTOS.update(meta.get('photos', {}))
        FOCUS.update({k: tuple(v) for k, v in meta.get('focus', {}).items()})
        MAP = meta.get('map', MAP)
    os.makedirs(a.out, exist_ok=True)
    build(a.out, content, a.name)
