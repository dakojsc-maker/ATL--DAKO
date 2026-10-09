"""
Build the M05 "Lao động – Việc làm" template (socio-economic reports: labour, jobs, population, industries…).

    python build_laodong.py                                          # demo deck (Địa lí 12 – Lao động và việc làm)
    python build_laodong.py --content my.json --name Bao-cao-viec-lam  # a real deck from a content file
    python build_laodong.py --dump-sample catalog/samples/M05-laodong.json

Content lives in build_content(); photos are mapped in assets/images/laodong_photos.json (Open Images ids in
assets/images/src/, CC BY 2.0 — see assets/images/credits.csv). People cut-outs: assets/images/cut/ld_<key>.png.
Maps of the six regions are drawn from Natural Earth for the values given on each map_regions slide.
"""
import csv
import hashlib
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import pptkit as K  # noqa: E402
import laodong_assets as A  # noqa: E402
import maclenin_assets as MA  # noqa: E402
import layouts_laodong as L  # noqa: E402
import content_io as CIO  # noqa: E402

CUT = os.path.join(HERE, 'assets', 'images', 'cut')
OUT = os.path.join(HERE, 'assets', 'images', 'build', 'laodong')
FONT_DIR = os.path.join(HERE, 'fonts', 'laodong')
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'laodong_photos.json'), encoding='utf-8'))
# cut-out key -> photo key it was made from (for the credits slide)
CUT_SOURCE = {'worker': 'worker_portrait', 'carpenter': 'carpenter', 'nurse': 'doctor2',
              'businesswoman': 'businesswoman', 'businessman': 'businessmen'}
WATERMARK = 'carpenter'       # faint figure printed into the paper background


def cut_paths():
    """assets/images/cut/ld_<key>.png -> halo-free copy in the build folder."""
    out = {}
    os.makedirs(OUT, exist_ok=True)
    for f in sorted(os.listdir(CUT)):
        if f.startswith('ld_') and f.endswith('.png'):
            src, dst = os.path.join(CUT, f), os.path.join(OUT, 'cut_' + f[3:])
            if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
                MA.defringe(src, dst)
            out[f[3:-4]] = dst
    return out


def prepare(content):
    os.makedirs(OUT, exist_ok=True)
    cuts = cut_paths()
    art = {}

    def make(key, fname, fn):
        p = os.path.join(OUT, fname)
        if not os.path.exists(p):
            fn(p)
        art[key] = p

    wm = cuts.get(WATERMARK)
    make('paper', 'paper.jpg', lambda p: A.peach_bg(p, watermark=wm, wm_alpha=0.07))
    make('swoosh', 'swoosh.png', lambda p: A.swoosh(p))
    maps = {}
    for fn, c in content:
        if fn is L.map_regions:
            key = json.dumps([c['values'], c.get('highlight')], sort_keys=True)
            name = 'map_' + hashlib.md5(key.encode()).hexdigest()[:10] + '.png'
            path = os.path.join(OUT, name)
            info = A.vn_regions(path, c['values'], highlight=c.get('highlight'),
                                font_path=os.path.join(FONT_DIR, 'Lexend-Medium.ttf'))
            maps[c.get('map_id', 'default')] = info
    img = {k: CIO.photo_path(v) for k, v in PHOTOS.items()}
    return dict(img=img, cut=cuts, art=art, maps=maps)


CR1, CR2, CR3 = 'I. Đặc điểm nguồn lao động', 'II. Sử dụng lao động', 'III. Vấn đề việc làm & hướng giải quyết'
SRC = 'Nguồn: Niên giám thống kê Việt Nam các năm, Tổng cục Thống kê'


def build_content():
    return [
        (L.cover, dict(image='hardhats', focus=[0.62, 0.5], kicker='Địa lí 12 · Kinh tế – xã hội',
                       title1='Lao động', title2='Việc làm', presenter='Trình bày: Nhóm 2 – Lớp 12A1')),
        (L.agenda, dict(image='sparks', focus=[0.7, 0.5], heading='Nội dung trình bày',
                        sections=[('Đặc điểm nguồn lao động', ['Số lượng lao động', 'Chất lượng lao động',
                                                               'Phân bố lao động']),
                                  ('Sử dụng lao động', ['Theo ngành kinh tế', 'Theo thành phần kinh tế']),
                                  ('Vấn đề việc làm & hướng giải quyết', ['Vấn đề việc làm',
                                                                          'Hướng giải quyết việc làm'])])),
        (L.section, dict(num='I.', title='Đặc điểm nguồn lao động', image='crew', focus=[0.5, 0.45],
                         desc='Số lượng, chất lượng và sự phân bố của lực lượng lao động nước ta.')),
        (L.chart_text, dict(title='1. Số lượng lao động', crumb=CR1,
                            lead='**Nước ta có nguồn lao động dồi dào.**\nNăm 2024, lực lượng lao động (dân số hoạt '
                                 'động kinh tế) của nước ta là **52,9 triệu người**, chiếm **52,2%** tổng số dân.',
                            image='vn_traffic',
                            chart=dict(cats=['2010', '2015', '2020', '2021', '2024'], values=[50.4, 54.3, 54.8, 50.6, 52.9],
                                       name='Lực lượng lao động', fmt='0.0', y_title='Lực lượng lao động (triệu người)',
                                       max=60),
                            caption='Hình 1. Lực lượng lao động từ 15 tuổi trở lên của nước ta giai đoạn 2010 – 2024',
                            source=SRC)),
        (L.table_text, dict(title='2. Chất lượng lao động', crumb=CR1,
                            bullets=['Lao động nước ta **cần cù, sáng tạo, có nhiều kinh nghiệm** sản xuất trong nông '
                                     'nghiệp, lâm nghiệp, thủy sản, tiểu thủ công nghiệp.',
                                     'Chất lượng lao động **ngày càng được nâng lên** nhờ thành tựu phát triển kinh tế, '
                                     'y tế, văn hóa, giáo dục – đào tạo. **Năm 2024**, tỉ lệ lao động qua đào tạo từ '
                                     'sơ cấp trở lên đạt **28,4%**.',
                                     'So với yêu cầu công nghiệp hóa, hiện đại hóa, lao động có trình độ chuyên môn kĩ '
                                     'thuật cao **còn hạn chế**; lao động **năng động, dễ tiếp thu** khoa học – công '
                                     'nghệ.'],
                            caption='Bảng 1. Tỉ lệ lao động từ 15 tuổi trở lên đã qua đào tạo phân theo trình độ '
                                    'chuyên môn kĩ thuật, giai đoạn 2010 – 2024',
                            unit='(Đơn vị: %)', col_w=[2.2, 1, 1, 1, 1],
                            rows=[['Trình độ', '2010', '2015', '2020', '2024'],
                                  ['Đã qua đào tạo', '14,6', '20,4', '24,1', '28,4'],
                                  ['Sơ cấp', '3,8', '3,3', '4,7', '6,3'],
                                  ['Trung cấp', '3,4', '5,4', '4,5', '4,3'],
                                  ['Cao đẳng', '1,7', '3,0', '3,8', '4,2'],
                                  ['Đại học trở lên', '5,7', '8,7', '11,1', '13,6'],
                                  ['Chưa qua đào tạo', '85,4', '79,6', '75,9', '71,6']],
                            source=SRC)),
        (L.map_regions, dict(title='3. Phân bố lao động', crumb=CR1,
                             pill='Phân bố lao động có sự khác nhau giữa các khu vực, các vùng',
                             bullets=['Năm 2024, lao động ở nông thôn nước ta là hơn **32,5 triệu người**, ở thành thị '
                                      'là **20,4 triệu người**.',
                                      '**Đồng bằng sông Hồng** là vùng có nhiều lao động nhất; **Tây Nguyên** có ít '
                                      'lao động nhất.'],
                             values={'TDMNBB': 13.9, 'DBSH': 23.3, 'BTB_DHMT': 20.4, 'TN': 7.0, 'DNB': 18.6,
                                     'DBSCL': 16.8},
                             photos=['vn_market', 'harvest', 'vn_mekong'],
                             note='Tỉ trọng lao động theo vùng (%) — số liệu minh họa, thay bằng số liệu thực tế.')),
        (L.section, dict(num='II.', title='Sử dụng lao động', image='tunnel', focus=[0.55, 0.45],
                         desc='Cơ cấu lao động theo ngành và theo thành phần kinh tế.')),
        (L.callout_table, dict(title='1. Theo ngành kinh tế', crumb=CR2,
                               callout='Theo ngành kinh tế, **cơ cấu lao động nước ta có sự chuyển dịch** phù hợp với '
                                       'đường lối công nghiệp hóa, hiện đại hóa: giảm tỉ lệ lao động trong nông, lâm '
                                       'nghiệp và thủy sản; tăng tỉ lệ lao động trong công nghiệp, xây dựng và dịch vụ.',
                               caption='Bảng 2. Cơ cấu lao động có việc làm phân theo ngành kinh tế, giai đoạn '
                                       '2010 – 2024',
                               unit='(Đơn vị: %)', col_w=[3.2, 1, 1, 1, 1],
                               rows=[['Ngành', '2010', '2015', '2020', '2024'],
                                     ['Nông nghiệp, lâm nghiệp và thủy sản', '49,5', '43,6', '33,1', '26,4'],
                                     ['Công nghiệp và xây dựng', '20,9', '23,0', '30,8', '33,4'],
                                     ['Dịch vụ', '29,6', '33,4', '36,1', '40,2']],
                               source=SRC)),
        (L.callout_pies, dict(title='2. Theo thành phần kinh tế', crumb=CR2,
                              callout='Việt Nam phát triển nền kinh tế thị trường định hướng xã hội chủ nghĩa, nhiều '
                                      'thành phần kinh tế. Cơ cấu lao động **giảm tỉ lệ ở khu vực Nhà nước và ngoài Nhà '
                                      'nước**, **tăng tỉ lệ ở khu vực có vốn đầu tư nước ngoài**.',
                              cats=['Kinh tế Nhà nước', 'Kinh tế ngoài Nhà nước', 'Khu vực có vốn đầu tư nước ngoài'],
                              pies=[('Năm 2010', [10.4, 86.1, 3.5]), ('Năm 2024', [7.7, 81.9, 10.4])],
                              caption='Hình 2. Cơ cấu lao động có việc làm theo thành phần kinh tế năm 2010 và 2024 (%)',
                              source=SRC)),
        (L.section, dict(num='III.', title='Vấn đề việc làm & hướng giải quyết', image='welder', focus=[0.6, 0.5],
                         desc='Tỉ lệ thất nghiệp, thiếu việc làm và các giải pháp tạo việc làm bền vững.')),
        (L.callout_table, dict(title='1. Vấn đề việc làm', crumb=CR3,
                               callout='Việc làm có vai trò đặc biệt quan trọng đối với mỗi cá nhân, gia đình và toàn '
                                       'xã hội. **Hầu hết lao động nước ta có việc làm; tỉ lệ thất nghiệp và thiếu việc '
                                       'làm khá thấp.** Thành thị có tỉ lệ thất nghiệp cao hơn nông thôn, nhưng thiếu '
                                       'việc làm thì ngược lại.',
                               caption='Bảng 3. Tỉ lệ thất nghiệp và thiếu việc làm trong độ tuổi lao động phân theo '
                                       'thành thị, nông thôn, giai đoạn 2010 – 2024',
                               unit='(Đơn vị: %)', col_w=[2.2, 1.4, 1, 1, 1, 1],
                               rows=[['Chỉ tiêu', 'Khu vực', '2010', '2015', '2020', '2024'],
                                     ['Tỉ lệ thất nghiệp', 'Thành thị', '4,29', '3,37', '3,89', '2,53'],
                                     ['', 'Nông thôn', '2,35', '1,82', '1,75', '2,04'],
                                     ['Tỉ lệ thiếu việc làm', 'Thành thị', '1,82', '0,84', '1,69', '1,29'],
                                     ['', 'Nông thôn', '4,26', '2,39', '2,94', '2,22']],
                               source=SRC)),
        (L.compare, dict(title='Thành thị và nông thôn năm 2024', crumb=CR3,
                         cols=[dict(title='Thành thị', image='vn_traffic',
                                    stats=[('20,4', 'triệu lao động'), ('2,53%', 'tỉ lệ thất nghiệp'),
                                           ('1,29%', 'tỉ lệ thiếu việc làm')],
                                    text='Thất nghiệp cao hơn do **lao động tập trung đông**, yêu cầu tay nghề cao.'),
                               dict(title='Nông thôn', image='harvest2', focus=[0.5, 0.4],
                                    stats=[('32,5', 'triệu lao động'), ('2,04%', 'tỉ lệ thất nghiệp'),
                                           ('2,22%', 'tỉ lệ thiếu việc làm')],
                                    text='Thiếu việc làm cao hơn do **tính mùa vụ** của sản xuất nông nghiệp.')],
                         note=SRC)),
        (L.stats, dict(title='Thị trường lao động năm 2024', crumb=CR3,
                       lead='Một số chỉ tiêu chính về lao động – việc làm của nước ta (**năm 2024**).',
                       items=[('users', '52,9', 'triệu', 'Lực lượng lao động từ 15 tuổi trở lên'),
                              ('graduation-cap', '28,4', '%', 'Lao động đã qua đào tạo từ sơ cấp trở lên'),
                              ('briefcase', '40,2', '%', 'Lao động làm việc trong khu vực dịch vụ'),
                              ('trending-down', '2,53', '%', 'Tỉ lệ thất nghiệp ở khu vực thành thị')],
                       image='crew_yellow', focus=[0.5, 0.35])),
        (L.people_list, dict(title='2. Hướng giải quyết việc làm', crumb=CR3,
                             pill='Để đảm bảo đủ việc làm cho người lao động, nước ta cần thực hiện các giải pháp '
                                  'chủ yếu sau:',
                             items=[('Hoàn thiện chính sách, pháp luật', 'về lao động nhằm khuyến khích, hỗ trợ, huy '
                                                                         'động mọi nguồn lực đầu tư tạo việc làm.'),
                                    ('Thúc đẩy tạo việc làm mới', 'thông qua phát triển các ngành kinh tế, kinh tế số, '
                                                                  'đổi mới sáng tạo.'),
                                    ('Đẩy mạnh đào tạo, dạy nghề', 'nâng cao trình độ chuyên môn kĩ thuật, kĩ năng làm '
                                                                   'việc, tác phong công nghiệp.'),
                                    ('Phát triển hệ thống thông tin thị trường lao động', 'để người lao động tìm việc '
                                                                                          'nhanh, minh bạch.'),
                                    ('Thực hiện tốt bảo hiểm xã hội, bảo hiểm thất nghiệp', 'hỗ trợ người mất việc sớm '
                                                                                           'trở lại làm việc.')],
                             people=['worker', 'businessman', 'nurse', 'businesswoman'])),
        (L.process, dict(title='Từ đào tạo đến việc làm bền vững', crumb=CR3,
                         lead='Chuỗi giải pháp gắn **giáo dục nghề nghiệp** với **nhu cầu của thị trường lao động**.',
                         steps=[('search', 'Định hướng nghề nghiệp', 'Tư vấn chọn nghề phù hợp năng lực và nhu cầu xã '
                                                                     'hội.'),
                                ('graduation-cap', 'Đào tạo, dạy nghề', 'Gắn nhà trường với doanh nghiệp, đào tạo kĩ '
                                                                        'năng số.'),
                                ('handshake', 'Kết nối việc làm', 'Sàn giao dịch việc làm, thông tin thị trường lao '
                                                                  'động.'),
                                ('building-2', 'Việc làm bền vững', 'Phát triển doanh nghiệp, thu hút đầu tư tạo việc '
                                                                    'làm mới.'),
                                ('shield-check', 'An sinh xã hội', 'Bảo hiểm thất nghiệp, hỗ trợ chuyển đổi nghề.')],
                         image='sparks_blue', focus=[0.5, 0.5])),
        (L.photo_quote, dict(title='Kết luận', crumb=CR3, image='carpenter', focus=[0.5, 0.35],
                             quote='Nguồn lao động **dồi dào, chất lượng ngày càng nâng lên** là lợi thế lớn cho phát '
                                   'triển kinh tế – xã hội của nước ta.',
                             points=['Cơ cấu lao động chuyển dịch theo hướng **công nghiệp hóa, hiện đại hóa**.',
                                     'Tỉ lệ thất nghiệp và thiếu việc làm **ở mức thấp**.',
                                     'Cần **nâng cao chất lượng** lao động để đáp ứng thời kì mới.'])),
        (L.thanks, dict(image='hardhats', focus=[0.62, 0.5], title1='Xin cảm ơn', title2='đã lắng nghe',
                        presenter='Trình bày: Nhóm 2 – Lớp 12A1')),
    ]


def used_photo_keys(content):
    keys = set()

    def walk(v):
        if isinstance(v, str):
            k = CUT_SOURCE.get(v, v)
            if k in PHOTOS:
                keys.add(k)
        elif isinstance(v, dict):
            for x in v.values():
                walk(x)
        elif isinstance(v, (list, tuple)):
            for x in v:
                walk(x)
    for _, params in content:
        walk(params)
    keys.add(CUT_SOURCE[WATERMARK])
    return keys


def credit_lines(content):
    rows = list(csv.DictReader(open(os.path.join(HERE, 'assets', 'images', 'credits.csv'), encoding='utf-8')))
    used = {PHOTOS[k] for k in used_photo_keys(content)}
    return [f"• {r['title'][:46]} — {r['author']} (Flickr, CC BY 2.0)" for r in rows if r['image_id'] in used]


def build(out_dir, content=None, name=None):
    L.register()
    content = content or build_content()
    res = prepare(content)
    prs = K.new_presentation()
    ctx = dict(n=0, **res)
    slides = [fn(prs, ctx, c) for fn, c in content]
    slides.append(L.credits(prs, ctx, dict(intro='Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0; người '
                                                 'được tách nền từ ảnh. Bản đồ: Natural Earth (public domain). '
                                                 'Icon: Lucide (ISC). Font: Anton, Lexend (SIL OFL).',
                                           lines=credit_lines(content))))
    for s in slides:
        K.finalize(s)
    name = (name + ('' if name.endswith('.pptx') else '.pptx')) if name else 'Mau-Lao-Dong-Viec-Lam.pptx'
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
        print('wrote', CIO.save(a.dump_sample, build_content(), template='M05', title='Lao động và việc làm',
                                photos=PHOTOS))
        raise SystemExit(0)
    content = None
    if a.content:
        meta, content = CIO.load(a.content, L)
        PHOTOS.update(meta.get('photos', {}))
    os.makedirs(a.out, exist_ok=True)
    build(a.out, content, a.name)
