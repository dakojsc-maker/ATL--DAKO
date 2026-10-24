"""
Build the M10 "Du lịch Đà Nẵng" template (travel guide: night-navy paper, gold Playfair titles, floating sky lanterns,
taped polaroids, vintage cameras, viewfinder frames, film strip, 12-month calendar, night-chart map, boarding passes).

    python build_danang.py                                        # demo: cẩm nang du lịch Đà Nẵng
    python build_danang.py --content my.json --name Du-lich-ABC   # a real deck from a content file
    python build_danang.py --dump-sample catalog/samples/M10-danang.json

Map: "map" in the content file names assets/maps/<name>.png/.json — make a new one with
    python tools/make_map.py --name <ten> --style navy --center lon,lat --span 1.4 --place key:lon,lat ...
and use those keys in "pins" of the map_info slide. Camera cut-outs: assets/images/cut/dn_<key>.png.
Photos: assets/images/danang_photos.json (Open Images, CC BY 2.0 — see assets/images/credits.csv).
"""
import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import pptkit as K  # noqa: E402
import danang_assets as A  # noqa: E402
import maclenin_assets as MA  # noqa: E402
import layouts_danang as L  # noqa: E402
import content_io as CIO  # noqa: E402

CODE, TITLE = 'M10', 'Cẩm nang du lịch Đà Nẵng'
DEFAULT_NAME = 'Mau-Du-Lich-Da-Nang.pptx'
OUT = os.path.join(HERE, 'assets', 'images', 'build', 'danang')
CUT = os.path.join(HERE, 'assets', 'images', 'cut')
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'danang_photos.json'), encoding='utf-8'))
CUT_SOURCE = {'nikon': 'cam_nikon', 'leica': 'cam_leica', 'polaroid': 'cam_polaroid'}
MAP = 'danang_map'
CREDIT_INTRO = ('Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0; máy ảnh được tách nền từ ảnh. Một số ảnh '
                'biển, pháo hoa, cáp treo chỉ mang tính minh họa (không chụp tại Đà Nẵng) — thay bằng ảnh thật. '
                'Bản đồ: Natural Earth (public domain). Icon: Lucide (ISC). '
                'Font: Playfair Display, Be Vietnam Pro, Dancing Script, Great Vibes (SIL OFL).')
NOTE = 'Ảnh, giá vé, giá món ăn và lịch trình là MINH HỌA — kiểm tra và thay bằng thông tin, hình ảnh thực tế.'


def build_content():
    return [
        (L.cover, dict(kicker='Cẩm nang du lịch', title='Đà Nẵng', sub='Thành phố đáng sống\nbên bờ biển Đông',
                       photos=['han_sail', 'marble_view', 'cablecar'], captions=['Sông Hàn', 'Ngũ Hành Sơn', 'Cáp treo'],
                       camera='leica', presenter='Trình bày: Nhóm Hướng dẫn viên  ·  2026',
                       notes='Slide bìa. ' + NOTE)),
        (L.agenda, dict(kicker='Nội dung', title='Hành trình khám phá',
                        items=[['marble_view2', 'Tổng quan & bản đồ'], ['beach_bay', 'Biển & thiên nhiên'],
                               ['hoian_lanterns', 'Di sản lân cận'], ['banh_xeo', 'Ẩm thực đặc sắc'],
                               ['fireworks_river', 'Lễ hội & lịch trình']])),
        (L.section, dict(num=1, title='Tổng quan', desc='Thành phố biển năng động của miền Trung', photo='han_sail',
                         caption='Thuyền buồm trên sông Hàn', focus=[0.5, 0.5])),
        (L.map_info, dict(kicker='Vị trí', title='Đà Nẵng',
                          text='**Trung tâm của miền Trung**, nằm giữa ba di sản thế giới **Huế – Hội An – Mỹ Sơn**. '
                               'Phía bắc là đèo Hải Vân, phía đông hướng ra biển Đông.',
                          facts=[['plane', 'Sân bay quốc tế', 'cách trung tâm thành phố khoảng 3 km'],
                                 ['landmark', '3 di sản UNESCO', 'Huế, Hội An, Mỹ Sơn trong bán kính ~100 km'],
                                 ['waves', 'Biển Mỹ Khê', 'bãi cát trắng dài, sóng êm, nước trong'],
                                 ['mountain', 'Bán đảo Sơn Trà', '“lá phổi xanh” của thành phố']],
                          pins=[['hai_van', 'Đèo Hải Vân', 'r'], ['son_tra', 'Bán đảo Sơn Trà', 'r'],
                                ['cau_rong', 'Cầu Rồng', 'l'],
                                ['ngu_hanh_son', 'Ngũ Hành Sơn', 'r'], ['ba_na', 'Bà Nà Hills', 'r'],
                                ['hoian', 'Hội An', 'r']])),
        (L.reasons, dict(kicker='Vì sao chọn Đà Nẵng?', title='4 lý do để yêu Đà Nẵng',
                         items=[dict(photo='beach_bay', caption='Biển xanh', title='Biển đẹp quanh năm',
                                     text='Bãi cát trắng dài, nước trong, sóng êm — lý tưởng để tắm biển.'),
                                dict(photo='han_sail', caption='Thành phố cầu', title='Thành phố của những cây cầu',
                                     text='Cầu Rồng phun lửa cuối tuần, cầu sông Hàn rực rỡ về đêm.'),
                                dict(photo='marble_statue', caption='Tâm linh', focus=[0.5, 0.35],
                                     title='Danh thắng & tâm linh',
                                     text='Ngũ Hành Sơn, chùa Linh Ứng, những hang động kỳ thú.'),
                                dict(photo='bun_bo', caption='Ẩm thực', title='Ẩm thực phong phú',
                                     text='Mì Quảng, bánh tráng cuốn thịt heo, hải sản tươi ngon.')])),
        (L.seasons, dict(kicker='Lịch du lịch 12 tháng', title='Thời điểm lý tưởng',
                         months=[['TH 1', 'cloud-sun', '22°C', 'good'], ['TH 2', 'cloud-sun', '23°C', 'good'],
                                 ['TH 3', 'sun', '25°C', 'best'], ['TH 4', 'sun', '27°C', 'best'],
                                 ['TH 5', 'sun', '29°C', 'best'], ['TH 6', 'sun', '30°C', 'best'],
                                 ['TH 7', 'sun', '30°C', 'best'], ['TH 8', 'sun', '30°C', 'best'],
                                 ['TH 9', 'cloud-sun-rain', '28°C', 'rain'], ['TH 10', 'cloud-rain', '26°C', 'rain'],
                                 ['TH 11', 'cloud-rain', '24°C', 'rain'], ['TH 12', 'cloud-rain', '22°C', 'rain']],
                         legend=[['best', 'Nắng đẹp – mùa du lịch'], ['good', 'Mát mẻ, ít mưa'],
                                 ['rain', 'Mùa mưa bão']],
                         tips=[['sun', 'Tháng 3 – 8', 'Mùa khô, biển êm — **thời điểm lý tưởng** để tắm biển và '
                                                      'khám phá.'],
                               ['sparkles', 'Tháng 6 – 7', 'Mùa lễ hội pháo hoa quốc tế, thành phố rực rỡ về đêm.'],
                               ['umbrella', 'Tháng 9 – 12', 'Mùa mưa bão: theo dõi thời tiết, ưu tiên điểm tham quan '
                                                            'trong nhà.']])),
        (L.section, dict(num=2, title='Điểm đến\nnổi bật', desc='Từ núi non hùng vĩ đến biển xanh cát trắng',
                         photo='marble_view2', caption='Toàn cảnh từ Ngũ Hành Sơn', focus=[0.5, 0.5])),
        (L.viewfinder_place, dict(kicker='Điểm đến 01', title='Ngũ Hành Sơn', photo='marble_view', focus=[0.5, 0.5],
                                  text='Quần thể năm ngọn núi đá vôi **Kim – Mộc – Thủy – Hỏa – Thổ**, nổi tiếng với '
                                       'hang động, chùa chiền và làng đá mỹ nghệ Non Nước.',
                                  chips=[['clock-3', '7:00 – 17:30'], ['ticket', 'Vé ~40.000đ'],
                                         ['map-pin', 'Cách trung tâm 8 km']])),
        (L.viewfinder_place, dict(kicker='Điểm đến 02', title='Bà Nà Hills', photo='cablecar', focus=[0.5, 0.5],
                                  info=['REC', '00:27:51', '4K · 30P', 'ISO 200   F4   1/500'],
                                  text='Khu du lịch trên đỉnh núi cao **gần 1.500 m**: tuyến cáp treo dài, Cầu Vàng '
                                       'và làng Pháp cổ kính giữa mây ngàn.',
                                  chips=[['thermometer-sun', 'Mát mẻ 15 – 20°C'], ['ticket', 'Vé cáp treo trọn gói'],
                                         ['map-pin', 'Cách trung tâm 25 km']])),
        (L.place_collage, dict(kicker='Di sản lân cận', title='Phố cổ Hội An',
                               text='Thương cảng sầm uất từ thế kỷ XVI, nay là **khu phố cổ được bảo tồn nguyên vẹn** '
                                    'với nhà cổ, hội quán và những dãy đèn lồng rực rỡ mỗi tối.',
                               facts=[['landmark', 'Di sản văn hóa thế giới UNESCO (1999)'],
                                      ['car-taxi-front', 'Cách trung tâm Đà Nẵng khoảng 30 km'],
                                      ['sparkles', 'Thả đèn hoa đăng trên sông Hoài']],
                               photos=['hoian_bridge', 'hoian_lanterns', 'hoian_river_blue'],
                               captions=['Chùa Cầu', 'Đèn lồng', 'Sông Hoài'], camera='nikon')),
        (L.section, dict(num=3, title='Ẩm thực\n& lễ hội', desc='Hương vị miền Trung đậm đà, phố biển rộn ràng',
                         photo='hoian_lantern_market', caption='Chợ đêm đèn lồng', focus=[0.5, 0.5])),
        (L.food, dict(kicker='Đặc sản nên thử', title='Ẩm thực Đà Nẵng',
                      items=[dict(photo='banh_xeo', focus=[0.62, 0.6], name='Bánh xèo',
                                  text='Vỏ giòn rụm, nhân tôm thịt, chấm nước lèo đậm đà.', price='30.000 – 60.000đ'),
                             dict(photo='rolls_plate', focus=[0.3, 0.5], name='Bánh tráng cuốn',
                                  text='Thịt heo luộc cuốn rau sống, chấm mắm nêm.', price='60.000 – 120.000đ'),
                             dict(photo='hoian_food3', name='Cơm gà',
                                  text='Cơm vàng thơm, gà xé trộn rau răm — đặc sản xứ Quảng.', price='35.000 – 60.000đ'),
                             dict(photo='bun_bo', name='Bún bò',
                                  text='Nước dùng thơm sả, chả cua, giò heo.', price='35.000 – 50.000đ')])),
        (L.events, dict(kicker='Thành phố lễ hội', title='Lễ hội & sự kiện', photo='fireworks_river',
                        caption='Đêm pháo hoa', focus=[0.4, 0.5],
                        items=[['TH\n6 – 7', 'Lễ hội pháo hoa quốc tế', 'Các đội pháo hoa quốc tế tranh tài trên sông Hàn.'],
                               ['Cuối\ntuần', 'Cầu Rồng phun lửa', '21:00 thứ Bảy và Chủ nhật hằng tuần.'],
                               ['19/2\nÂL', 'Lễ hội Quán Thế Âm', 'Lễ hội văn hóa – tâm linh tại Ngũ Hành Sơn.'],
                               ['Tết', 'Đêm giao thừa', 'Pháo hoa chào năm mới, đường hoa xuân bên sông.']])),
        (L.itinerary, dict(kicker='Gợi ý cho chuyến đi', title='Lịch trình 3 ngày 2 đêm',
                           days=[dict(day='Ngày 1', theme='Biển & thành phố', icon='plane', code='DAD · D1',
                                      stops=[['Sáng', 'Nhận phòng, tắm biển Mỹ Khê'],
                                             ['Trưa', 'Bánh tráng cuốn thịt heo'],
                                             ['Chiều', 'Bán đảo Sơn Trà, chùa Linh Ứng'],
                                             ['Tối', 'Cầu Rồng, du thuyền sông Hàn']]),
                                 dict(day='Ngày 2', theme='Bà Nà Hills', icon='mountain', code='DAD · D2',
                                      stops=[['Sáng', 'Cáp treo lên Bà Nà, Cầu Vàng'],
                                             ['Trưa', 'Ăn trưa trên đỉnh núi'],
                                             ['Chiều', 'Làng Pháp, vườn hoa'],
                                             ['Tối', 'Chợ đêm Sơn Trà']]),
                                 dict(day='Ngày 3', theme='Ngũ Hành Sơn – Hội An', icon='landmark', code='DAD · D3',
                                      stops=[['Sáng', 'Ngũ Hành Sơn, làng đá Non Nước'],
                                             ['Trưa', 'Cơm gà, cao lầu Hội An'],
                                             ['Chiều', 'Dạo phố cổ, Chùa Cầu'],
                                             ['Tối', 'Thả đèn hoa đăng sông Hoài']])])),
        (L.thanks, dict(script='Hẹn gặp lại', title='Đà Nẵng', sub='Thành phố đáng sống – Điểm đến khó quên',
                        lines=[['phone', 'Hotline: 0900 000 000'], ['mail', 'dulich@tencongty.vn'],
                               ['globe', 'www.tencongty.vn']],
                        photo='hoian_flower_lantern', caption='Hẹn mùa sau!', camera='polaroid')),
    ]


def _mtime(p):
    return os.path.getmtime(p) if os.path.exists(p) else 0


def prepare(map_name):
    os.makedirs(OUT, exist_ok=True)
    art = {}

    def make(fname, fn):
        p = os.path.join(OUT, fname)
        if not os.path.exists(p) or _mtime(p) < _mtime(A.__file__):
            fn(p)
        return p
    art['bg'] = make(f'bg_{L.P["navy"]}.jpg', lambda p: A.navy_bg(p, gold=L.P['gold']))
    art['lantern'] = [make('lantern1.png', lambda p: A.lantern(p, seed=1)),
                      make('lantern2.png', lambda p: A.lantern(p, seed=4, body='F2B13E', edge='C9662A')),
                      make('lantern3.png', lambda p: A.lantern(p, seed=7, body='F48A3A', edge='C4421E'))]
    art['tape'] = make('tape.png', lambda p: A.tape(p))
    cut = {}
    for f in sorted(os.listdir(CUT)):
        if f.startswith('dn_') and f.endswith('.png'):
            src, dst = os.path.join(CUT, f), os.path.join(OUT, 'cut_' + f[3:])
            if not os.path.exists(dst) or _mtime(dst) < _mtime(src):
                MA.defringe(src, dst, choke=1)
            cut[f[3:-4]] = dst
    mp = os.path.join(HERE, 'assets', 'maps', map_name)
    info = json.load(open(mp + '.json', encoding='utf-8'))
    img = {k: CIO.photo_path(v) for k, v in PHOTOS.items()}
    return dict(img=img, cut=cut, art=art, map=dict(path=mp + '.png', pts=info['points']))


def credit_lines(content):
    rows = list(csv.DictReader(open(os.path.join(HERE, 'assets', 'images', 'credits.csv'), encoding='utf-8')))
    used = set()

    def walk(v):
        if isinstance(v, str):
            if v in PHOTOS:
                used.add(PHOTOS[v])
            if v in CUT_SOURCE:
                used.add(PHOTOS[CUT_SOURCE[v]])
        elif isinstance(v, dict):
            for x in v.values():
                walk(x)
        elif isinstance(v, (list, tuple)):
            for x in v:
                walk(x)
    for _, c in content:
        walk(c)
    return [f"• {r['title'][:46]} — {r['author']} (Flickr, CC BY 2.0)" for r in rows if r['image_id'] in used]


def build(out_dir, content=None, name=None, map_name=MAP):
    L.register()
    content = content or build_content()
    res = prepare(map_name)
    prs = K.new_presentation()
    ctx = dict(n=0, **res)
    slides = [fn(prs, ctx, c) for fn, c in content]
    slides.append(L.credits(prs, ctx, dict(intro=CREDIT_INTRO, lines=credit_lines(content))))
    for s in slides:
        K.finalize(s)
    name = (name + ('' if name.endswith('.pptx') else '.pptx')) if name else DEFAULT_NAME
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
        print('wrote', CIO.save(a.dump_sample, build_content(), template=CODE, title=TITLE, map=MAP, photos=PHOTOS))
        raise SystemExit(0)
    content, map_name = None, MAP
    if a.content:
        meta, content = CIO.load(a.content, L)
        PHOTOS.update(meta.get('photos', {}))
        map_name = meta.get('map', MAP)
    os.makedirs(a.out, exist_ok=True)
    build(a.out, content, a.name, map_name)
