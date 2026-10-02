"""
Build the M04 "Chính luận Mác – Lênin" template (political theory: Triết học, Kinh tế chính trị, CNXH khoa học…).

    python build_maclenin.py                                          # demo deck (Vấn đề cơ bản của triết học)
    python build_maclenin.py --content my.json --name Bai-thuyet-trinh  # a real deck from a content file
    python build_maclenin.py --dump-sample catalog/samples/M04-maclenin.json

Content lives in build_content(); photos are mapped in assets/images/maclenin_photos.json (Open Images ids in
assets/images/src/, CC BY 2.0 — see assets/images/credits.csv). Statue cut-outs: assets/images/cut/ml_<key>.png.
Generated artwork (silk, emblems, ribbons) goes to assets/images/build/maclenin/.
"""
import csv
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, os.path.join(HERE, 'lib'))

import pptkit as K  # noqa: E402
import maclenin_assets as A  # noqa: E402
import layouts_maclenin as L  # noqa: E402
import content_io as CIO  # noqa: E402

CUT = os.path.join(HERE, 'assets', 'images', 'cut')
OUT = os.path.join(HERE, 'assets', 'images', 'build', 'maclenin')
FONT_DIR = os.path.join(HERE, 'fonts', 'maclenin')
PHOTOS = json.load(open(os.path.join(HERE, 'assets', 'images', 'maclenin_photos.json'), encoding='utf-8'))
# cut-out key -> photo key it was made from (for the credits slide)
CUT_SOURCE = {'kant_ink': 'kant'}
# faint monument silhouettes printed into the content background
CROWD = [('marx_engels2', (-0.02, 0.5, 0.55)), ('lenin_point', (0.2, 0.42, 0.62)), ('lenin_bes', (0.42, 0.5, 0.55))]


def cut_paths():
    """assets/images/cut/ml_<key>.png -> halo-free copy in the build folder."""
    out = {}
    os.makedirs(OUT, exist_ok=True)
    for f in sorted(os.listdir(CUT)):
        if f.startswith('ml_') and f.endswith('.png'):
            src, dst = os.path.join(CUT, f), os.path.join(OUT, 'cut_' + f[3:])
            if not os.path.exists(dst) or os.path.getmtime(dst) < os.path.getmtime(src):
                A.defringe(src, dst, choke=0 if f.endswith('_ink.png') else 1)
            out[f[3:-4]] = dst
    return out


def prepare():
    os.makedirs(OUT, exist_ok=True)
    cuts = cut_paths()
    art = {}

    def make(key, fname, fn):
        p = os.path.join(OUT, fname)
        if not os.path.exists(p):
            fn(p)
        art[key] = p

    crowd = [(cuts[k], pos) for k, pos in CROWD if k in cuts]
    make('silk', 'silk.jpg', lambda p: A.silk(p, folds=0.5, seed=3, hot=[(0.0, 1.0, 0.5, 0.5), (1.0, 0.0, 0.4, 0.6)],
                                              crowd=crowd, crowd_alpha=0.2))
    make('silk_cover', 'silk_cover.jpg', lambda p: A.silk(p, folds=0.5, seed=8, glow=(0.35, 0.4),
                                                          hot=[(0.85, 0.25, 0.55, 1.1), (0.0, 1.0, 0.45, 0.6)]))
    make('silk_dark', 'silk_dark.jpg', lambda p: A.silk(p, folds=0.6, seed=5, bright=-0.12, rays=True,
                                                        glow=(0.3, 0.45), crowd=crowd, crowd_alpha=0.16,
                                                        hot=[(1.0, 1.0, 0.5, 0.6)]))
    make('hammer_sickle', 'hammer_sickle.png', lambda p: A.hammer_sickle(p, size=900))
    make('medal', 'medal.png', lambda p: A.star_medal(p, size=1100))
    make('star_gold', 'star_gold.png', lambda p: A.star(p, 256, 'gold'))
    make('star_red', 'star_red.png', lambda p: A.star(p, 256, 'red'))
    make('ribbon', 'ribbon_tr.png', lambda p: A.ribbon(p, pts=[(260, -80), (470, 250), (800, 430), (1060, 250),
                                                                (1200, 520), (1480, 640)], width=100))
    make('ribbon_bl', 'ribbon_bl.png', lambda p: A.ribbon(p, pts=[(-80, 230), (260, 360), (480, 600), (330, 780),
                                                                  (700, 830), (980, 980)], width=100,
                                                          twist=(0.5, 6.5)))
    make('drape_br', 'drape_br.png', lambda p: A.drape(p, w=1400, h=700, width=250, twist=(0.2, 1.3),
                                                       pts=[(120, 790), (560, 640), (980, 560), (1480, 240)]))
    make('drape_bl', 'drape_bl.png', lambda p: A.drape(p, w=1400, h=700, width=250, twist=(0.2, 1.3), flip=True,
                                                       pts=[(120, 790), (560, 640), (980, 560), (1480, 240)]))
    make('drape_wide', 'drape_wide.png', lambda p: A.drape(p, w=2600, h=380, width=150, twist=(0.1, 1.0),
                                                           pts=[(-100, 430), (700, 250), (1400, 320), (2100, 190),
                                                                (2700, 230)]))
    disp = os.path.join(FONT_DIR, L.FONTS['disp'][1])
    make('quote_open', 'quote_open.png', lambda p: A.quote_mark(p, disp, '“'))
    make('quote_close', 'quote_close.png', lambda p: A.quote_mark(p, disp, '”'))
    img = {k: CIO.photo_path(v) for k, v in PHOTOS.items()}
    return dict(img=img, cut=cuts, art=art)


P1, P2, P3 = 'Phần 1', 'Phần 2', 'Phần 3'


def build_content():
    return [
        (L.cover, dict(kicker='Triết học Mác – Lênin', title='Vấn đề cơ bản của triết học\nvà các trường phái triết học',
                       chips=['Vấn đề cơ bản', 'Duy vật & duy tâm', 'Khả tri & bất khả tri'],
                       presenter='Trình bày: Nhóm 3 – Lớp Triết học K50',
                       info='GVHD: TS. Nguyễn Văn A   |   Học kỳ I, năm học 2026 – 2027', portrait='lenin_bes')),
        (L.agenda, dict(title='Câu hỏi mở đầu và bố cục nội dung',
                        question='Thế giới vật chất có trước, hay ý thức quyết định thế giới?',
                        parts=[('Phần 1', 'Nội dung vấn đề cơ bản của triết học'),
                               ('Phần 2', 'Chủ nghĩa duy vật và chủ nghĩa duy tâm'),
                               ('Phần 3', 'Thuyết khả tri và thuyết bất khả tri')])),
        (L.quote_portrait, dict(part=P1, title='Vì sao đây là vấn đề cơ bản?',
                                points=['Xoay quanh quan hệ giữa vật chất và ý thức, giữa tồn tại và tư duy',
                                        'Là nền tảng, điểm xuất phát để giải quyết các vấn đề khác của triết học',
                                        'Quy định lập trường, thế giới quan của các nhà triết học và trường phái'],
                                quote='“Vấn đề cơ bản lớn của mọi triết học, đặc biệt là của triết học hiện đại, là '
                                      'vấn đề quan hệ giữa tư duy với tồn tại.”',
                                author='Ph. Ăngghen', portrait='marx_engels')),
        (L.compare, dict(part=P1, title='Hai phạm vi: vật chất và tinh thần',
                         left=dict(title='Thế giới vật chất',
                                   lines=['Tồn tại khách quan, bên ngoài ý thức con người.',
                                          'Không phụ thuộc vào việc con người có nhận thức được hay không.',
                                          'Ví dụ: giới tự nhiên, cơ thể con người, các quá trình vật chất.'],
                                   image='galaxy'),
                         right=dict(title='Thế giới tinh thần',
                                    lines=['Gắn với ý thức và đời sống tinh thần của con người.',
                                           'Bao gồm tư duy, cảm xúc, tri thức, niềm tin…',
                                           'Có khả năng phản ánh và tác động trở lại thế giới vật chất.'],
                                    image='rembrandt', focus=[0.5, 0.62]),
                         statement='Mọi trường phái triết học đều phải giải quyết quan hệ giữa hai phạm vi này')),
        (L.aspects, dict(part=P1, title='Hai mặt của vấn đề cơ bản',
                         aspects=[dict(label='Mặt thứ nhất',
                                       question='Giữa vật chất và ý thức, cái nào có trước, cái nào có sau, '
                                                'cái nào quyết định cái nào?',
                                       answer='Cách trả lời chia triết học thành duy vật và duy tâm'),
                                  dict(label='Mặt thứ hai',
                                       question='Con người có khả năng nhận thức được thế giới hay không?',
                                       answer='Cách trả lời chia thành thuyết khả tri và bất khả tri')])),
        (L.tree, dict(part=P1, title='Từ hai câu hỏi đến các trường phái',
                      branches=[dict(label='Mặt thứ nhất', children=['Chủ nghĩa duy vật', 'Chủ nghĩa duy tâm']),
                                dict(label='Mặt thứ hai', children=['Thuyết khả tri', 'Thuyết bất khả tri'])],
                      statement='Không đồng nhất duy vật với khả tri, hay duy tâm với bất khả tri',
                      portrait='lenin_point')),
        (L.section, dict(num=2, title='Chủ nghĩa duy vật và chủ nghĩa duy tâm',
                         desc='Hai trường phái lớn hình thành từ cách giải quyết mặt thứ nhất của vấn đề cơ bản '
                              'của triết học.')),
        (L.forms3, dict(part=P2, title='Chủ nghĩa duy vật', header='Ba hình thức',
                        items=['Chất phác', 'Siêu hình', 'Biện chứng'],
                        notes=['Vật chất và giới tự nhiên là cái có trước', 'Vật chất quyết định ý thức'],
                        caption='Giải thích thế giới bằng chính những nguyên nhân vật chất của nó',
                        image='milky')),
        (L.star_list, dict(part=P2, title='Chủ nghĩa duy vật chất phác',
                           items=['Hình thành trong triết học cổ đại: Hy Lạp, Trung Hoa, Ấn Độ',
                                  'Thừa nhận tính thứ nhất của vật chất',
                                  'Đồng nhất vật chất với một hay vài chất cụ thể: nước, lửa, không khí…',
                                  'Kết luận mang tính trực quan, ngây thơ, chất phác',
                                  'Lấy giới tự nhiên để giải thích giới tự nhiên, không viện đến thần linh'],
                           images=['greek', 'aristotle'], focus2=[0.5, 0.3])),
        (L.hex_list, dict(part=P2, title='Chủ nghĩa duy vật siêu hình',
                          items=['Thể hiện rõ từ thế kỷ XV đến thế kỷ XVIII',
                                 'Chịu ảnh hưởng mạnh của phương pháp tư duy siêu hình, máy móc',
                                 'Nhìn thế giới như một cỗ máy khổng lồ',
                                 'Xem các bộ phận tồn tại biệt lập, tĩnh tại',
                                 'Góp phần đẩy lùi thế giới quan duy tâm và tôn giáo'],
                          images=['library_bw', 'lab', 'towers'])),
        (L.strip, dict(part=P2, title='Chủ nghĩa duy vật biện chứng',
                       images=['marx_painted', 'steel', 'rice_farmer'],
                       captions=['Do C. Mác và Ph. Ăngghen xây dựng, V.I. Lênin phát triển',
                                 'Khắc phục hạn chế của hai hình thức duy vật trước đó',
                                 'Kế thừa tinh hoa học thuyết trước và thành tựu khoa học đương thời',
                                 'Đỉnh cao trong sự phát triển của chủ nghĩa duy vật',
                                 'Vừa phản ánh đúng hiện thực, vừa định hướng cải tạo hiện thực'])),
        (L.medal_list, dict(part=P2, title='Chủ nghĩa duy tâm',
                            items=[('lightbulb', 'Ý thức, tinh thần, ý niệm, cảm giác là cái có trước giới tự nhiên'),
                                   ('book-open', 'Giải thích thế giới bằng những nguyên nhân tinh thần, tư tưởng'),
                                   ('scale', 'Thường là cơ sở lý luận, bảo vệ cho tôn giáo')],
                            sub='Hai nhánh của chủ nghĩa duy tâm',
                            branches=['Duy tâm chủ quan', 'Duy tâm khách quan'])),
        (L.branches2, dict(part=P2, title='Duy tâm chủ quan và duy tâm khách quan',
                           groups=[dict(title='Duy tâm chủ quan',
                                        children=['Thừa nhận tính thứ nhất của ý thức con người',
                                                  'Sự vật chỉ là “phức hợp những cảm giác” (G. Beccơli)']),
                                   dict(title='Duy tâm khách quan',
                                        children=['Tinh thần khách quan có trước, tồn tại độc lập với con người',
                                                  '“Ý niệm” (Platôn), “ý niệm tuyệt đối” (Hêghen)'])])),
        (L.columns3, dict(part=P2, title='Nguồn gốc của chủ nghĩa duy tâm',
                          cols=[dict(icon='landmark', title='Gắn với tôn giáo',
                                     text='Thường là cơ sở lý luận của tôn giáo, dù không đồng nhất hoàn toàn với '
                                          'tôn giáo.', image='monks'),
                                dict(icon='brain', title='Nguồn gốc nhận thức',
                                     text='Xem xét phiến diện, tuyệt đối hóa một mặt của quá trình nhận thức.',
                                     image='brain'),
                                dict(icon='users', title='Nguồn gốc xã hội',
                                     text='Lao động trí óc tách rời lao động chân tay; lợi ích của giai cấp thống trị.',
                                     image='rice_terrace')])),
        (L.compare_quote, dict(part=P2, title='Nhất nguyên luận và nhị nguyên luận',
                               cards=[dict(title='Nhất nguyên luận',
                                           text='Chỉ thừa nhận một trong hai thực thể (vật chất hoặc tinh thần) là '
                                                'bản nguyên của thế giới.',
                                           chips=['Nhất nguyên duy vật', 'Nhất nguyên duy tâm']),
                                      dict(title='Nhị nguyên luận',
                                           text='Vật chất và tinh thần là hai bản nguyên tồn tại song song, độc lập '
                                                'với nhau.',
                                           chips=['Tiêu biểu: R. Đềcáctơ'])],
                               quote='Xét đến cùng, nhị nguyên luận thuộc về chủ nghĩa duy tâm')),
        (L.section, dict(num=3, title='Thuyết khả tri và thuyết bất khả tri',
                         desc='Cách trả lời mặt thứ hai: con người có nhận thức được thế giới hay không?')),
        (L.question_portrait, dict(part=P3, title='Mặt thứ hai: khả năng nhận thức',
                                   question='“Con người có thể nhận thức được thế giới hay không?”',
                                   text='Tuyệt đại đa số các nhà triết học, cả duy vật lẫn duy tâm, đều phải trả lời '
                                        'câu hỏi này.',
                                   frame_title='Hai lập trường', options=['Thuyết khả tri', 'Thuyết bất khả tri'],
                                   portrait='lenin_bw', name='V.I. Lênin')),
        (L.star_list, dict(part=P3, title='Thuyết khả tri',
                           items=['Khẳng định khả năng nhận thức thế giới của con người',
                                  'Về nguyên tắc, con người có thể hiểu được bản chất của sự vật',
                                  'Cảm giác, biểu tượng, khái niệm… phù hợp với chính sự vật',
                                  'Nhận thức là quá trình không ngừng đi sâu vào bản chất'],
                           images=['galaxy', 'lab2'], focus2=[0.5, 0.4])),
        (L.people, dict(part=P3, title='Cantơ và Hêghen: hai cách nhìn',
                        lead_label='Thuyết bất khả tri',
                        lead_text='Phủ nhận khả năng nhận thức bản chất của đối tượng; kết quả nhận thức chỉ là bề '
                                  'ngoài, hạn hẹp và cắt xén.',
                        persons=[dict(name='I. Cantơ', cut='kant_ink',
                                      lines=['Phân biệt “hiện tượng” và “vật tự nó”',
                                             'Con người chỉ nhận thức được hiện tượng, không thể nhận thức được '
                                             '“vật tự nó”']),
                                 dict(name='G.W.F. Hêghen', cut='hegel',
                                      lines=['Phê phán thuyết bất khả tri của Cantơ',
                                             'Khẳng định khả năng nhận thức thế giới, trên lập trường duy tâm '
                                             'khách quan'])])),
        (L.conclusion, dict(part=P3, title='Thực tiễn và kết luận',
                            lead='“Vấn đề tìm hiểu xem tư duy của con người có thể đạt tới chân lý khách quan không, '
                                 'hoàn toàn không phải là một vấn đề lý luận mà là một vấn đề thực tiễn.” — C. Mác',
                            items=['Thực tiễn chứng minh tính đúng đắn của nhận thức',
                                   '“Vật tự nó” dần trở thành “vật cho ta”',
                                   'Vật chất có trước và quyết định ý thức',
                                   'Con người có khả năng nhận thức đúng đắn thế giới'],
                            statement='LẬP TRƯỜNG MÁC – LÊNIN: duy vật biện chứng, gắn nhận thức với thực tiễn',
                            portrait='marx_moscow')),
        (L.timeline, dict(part='Tư liệu', title='Các mốc hình thành triết học Mác – Lênin',
                          events=[('1844', 'Mác gặp Ăngghen', 'Bắt đầu tình bạn và sự hợp tác lý luận suốt đời'),
                                  ('1848', 'Tuyên ngôn', 'Tuyên ngôn của Đảng Cộng sản ra đời'),
                                  ('1867', 'Bộ Tư bản', 'Tập I bộ Tư bản của C. Mác được xuất bản'),
                                  ('1909', 'V.I. Lênin', 'Tác phẩm “Chủ nghĩa duy vật và chủ nghĩa kinh nghiệm phê phán”'),
                                  ('1930', 'Việt Nam', 'Đảng Cộng sản Việt Nam ra đời, vận dụng chủ nghĩa Mác – Lênin')])),
        (L.chart, dict(part='Khảo sát', title='Mức độ nắm vững kiến thức của sinh viên',
                       chart=dict(cats=['Vấn đề cơ bản', 'Duy vật – duy tâm', 'Khả tri – bất khả tri', 'Vai trò thực tiễn'],
                                  series=[('Trước học phần', [42, 55, 38, 47]), ('Sau học phần', [86, 91, 79, 88])],
                                  fmt='0"%"', max=100),
                       kpis=[('+40', '%', 'Mức tăng trung bình sau học phần'),
                             ('120', 'SV', 'Sinh viên tham gia khảo sát'),
                             ('4', 'nội dung', 'Nhóm kiến thức được đánh giá')],
                       note='Số liệu minh họa — chuột phải vào biểu đồ → Edit Data để thay số liệu thật.')),
        (L.table_slide, dict(part='Tổng kết', title='So sánh ba hình thức của chủ nghĩa duy vật',
                             col_w=[2.2, 2.4, 4.0, 3.5],
                             rows=[['Hình thức', 'Thời kỳ', 'Đặc điểm', 'Hạn chế / ý nghĩa'],
                                   ['Chất phác', 'Cổ đại', 'Đồng nhất vật chất với một số chất cụ thể',
                                    'Trực quan, ngây thơ'],
                                   ['Siêu hình', 'Thế kỷ XV – XVIII', 'Nhìn thế giới như một cỗ máy khổng lồ',
                                    'Máy móc, biệt lập, tĩnh tại'],
                                   ['Biện chứng', 'Từ những năm 40 thế kỷ XIX', 'Thống nhất thế giới quan duy vật '
                                    'với phép biện chứng', 'Khắc phục hạn chế của các hình thức trước']],
                             caption='Bảng là đối tượng gốc của PowerPoint: thêm / bớt dòng, sửa chữ trực tiếp.')),
        (L.thanks, dict(title='Xin cảm ơn', sub='thầy cô và các bạn đã lắng nghe!', kicker='Triết học Mác – Lênin',
                        presenter='Trình bày: Nhóm 3', info='Lớp Triết học K50 · Học kỳ I, 2026',
                        portrait='lenin_full_top')),
    ]


def used_photo_keys(content):
    keys = set()

    def walk(v):
        if isinstance(v, str):
            k = CUT_SOURCE.get(v, v)
            k = k[:-4] if k.endswith('_top') else k
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
    for k, _ in CROWD:
        keys.add(k)
    return keys


def credit_lines(content):
    rows = list(csv.DictReader(open(os.path.join(HERE, 'assets', 'images', 'credits.csv'), encoding='utf-8')))
    used = {PHOTOS[k] for k in used_photo_keys(content)}
    return [f"• {r['title'][:46]} — {r['author']} (Flickr, CC BY 2.0)" for r in rows if r['image_id'] in used]


def build(out_dir, content=None, name=None):
    L.register()
    res = prepare()
    prs = K.new_presentation()
    ctx = dict(n=0, **res)
    content = content or build_content()
    slides = [fn(prs, ctx, c) for fn, c in content]
    slides.append(L.credits(prs, ctx, dict(intro='Ảnh: bộ dữ liệu Open Images (Google), giấy phép CC BY 2.0; tượng '
                                                 'được tách nền từ ảnh. Huy hiệu, lụa, ruy băng: vẽ bằng mã. '
                                                 'Icon: Lucide (ISC). Font: Big Shoulders Display, Be Vietnam Pro '
                                                 '(SIL OFL).',
                                           lines=credit_lines(content))))
    for s in slides:
        K.finalize(s)
    name = (name + ('' if name.endswith('.pptx') else '.pptx')) if name else 'Mau-Chinh-Luan-MacLenin.pptx'
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
        print('wrote', CIO.save(a.dump_sample, build_content(), template='M04', title='Vấn đề cơ bản của triết học',
                                photos=PHOTOS))
        raise SystemExit(0)
    content = None
    if a.content:
        meta, content = CIO.load(a.content, L)
        PHOTOS.update(meta.get('photos', {}))
    os.makedirs(a.out, exist_ok=True)
    build(a.out, content, a.name)
