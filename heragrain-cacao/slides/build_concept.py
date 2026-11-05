"""Bộ slide "Heragrain Cacao – 5 concept sản phẩm ca cao Đắk Lắk", dựng từ mẫu M07 "Nông sản Đặc sản" của Kho Mẫu Slide DAKO
(bố cục giới thiệu sản phẩm kiểu website: thanh điều hướng, băng chuyền sản phẩm trượt bằng Morph, chữ lớn).

    python build_concept.py            ->  ../1-concept-san-pham/Heragrain-Cacao_5-concept-san-pham.pptx

Đồng bộ với bộ "Tổng quan bộ máy, quy trình": cùng 6 sản phẩm, cùng tên, cùng giai đoạn, cùng ảnh. Ảnh sản phẩm là ảnh concept
Heragrain Foods do HTX cung cấp (anh/concept/6-san-pham-heragrain-foods.png): ảnh vuông dùng cho thẻ, bản tách nền
(anh/concept/tach-nen/, tách bằng rembg isnet-general-use rồi làm sạch viền) dùng cho các bố cục sản phẩm nổi của mẫu.
5 concept dựng trên 6 sản phẩm: C1 = SP 1–3 · C2 = SP 4 · C3 = SP 5–6 · C4 = mix vị từ SP 4 · C5 = hộp quà ghép SP 3–6.
Tên concept, quy cách, khách hàng là đề xuất của tư vấn, cần HTX duyệt trước khi in bao bì.
"""
import json
import os
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
sys.path.insert(0, HERE)
import tpl  # noqa: E402

T, CACAO_PHOTOS = tpl.setup()
import cacao_assets as CA  # noqa: E402
import layouts_showcase as L  # noqa: E402
import pptkit as K  # noqa: E402
import showcase_build as SB  # noqa: E402
from pptx.enum.shapes import MSO_SHAPE  # noqa: E402

THEME = 'nongsan'
CODE, TITLE = 'M07', 'Heragrain Cacao – 5 concept sản phẩm ca cao Đắk Lắk'
DEFAULT_NAME = 'Heragrain-Cacao_5-concept-san-pham.pptx'
PHOTOS = json.load(open(os.path.join(T, 'assets', 'images', 'nongsan_photos.json'), encoding='utf-8'))
PHOTOS.update(CACAO_PHOTOS)
CC = CA.concept_photos(os.path.join(T, 'assets', 'images', 'build', 'cacao_concept'))
PHOTOS.update(CC)
PHOTOS['cc_hop_qua_goc'] = os.path.join(CA.CONCEPT, 'hop_qua.jpg')
BRAND = dict(name='Heragrain', sub='Foods', icon='leaf', menu=['Về chúng tôi', 'Sản phẩm', 'Concept', 'Liên hệ'],
             tagline='Tinh hoa cacao Việt Nam, vươn ra thế giới',
             colors=dict(title='4A2C1C', accent='1D4B3A', accent2='E4A92A', bg='F6F0E6',
                         chart=['5A3825', 'E4A92A', '1D4B3A', 'B5742E']))
# 6 sản phẩm = 6 ảnh tách nền, cùng bộ ảnh với bộ slide tổng quan (thẻ "Sáu sản phẩm ca cao")
TN = os.path.join(CA.CONCEPT, 'tach-nen')
PRODUCTS = {
    'hat': os.path.join(TN, 'sp1_hat_len_men.png'),      # 1 · Hạt ca cao lên men, phơi khô
    'rang': os.path.join(TN, 'sp2_hat_rang.png'),        # 2 · Hạt ca cao rang
    'nibs': os.path.join(TN, 'sp3_nibs.png'),            # 3 · Nhân ca cao (nibs)
    'socola': os.path.join(TN, 'sp4_socola.png'),        # 4 · Socola
    'bot': os.path.join(TN, 'sp5_bot.png'),              # 5 · Bột ca cao
    'bo': os.path.join(TN, 'sp6_bo.png'),                # 6 · Bơ ca cao
}
TEN = {'hat': '1 · Hạt ca cao lên men, phơi khô', 'rang': '2 · Hạt ca cao rang', 'nibs': '3 · Nhân ca cao (nibs)',
       'socola': '4 · Socola', 'bot': '5 · Bột ca cao', 'bo': '6 · Bơ ca cao'}
DECOR_ART = {'leaf': ('leaf', dict(seed=2, color='2F6B3F', light='8CBF7A')),
             'chunk': ('slice_piece', dict(seed=3, color='4A2C1C', edge='2E1A10', w=360, h=260)),
             'nib': ('slice_piece', dict(seed=7, color='6B4226', edge='3B2416', w=220, h=160)),
             'leaf_b': ('leaf', dict(seed=5, color='5E9E68', light='B7D79A', curl=-0.2)),
             'butter': ('slice_piece', dict(seed=9, color='E8D49A', edge='C9A85E', w=300, h=220))}
GRASS = 'hills'
CREDIT_INTRO = ('Ảnh 6 sản phẩm (ảnh thẻ và bản tách nền), hộp quà, kệ trưng bày, website, Facebook, hồ sơ năng lực, catalogue '
                'và logo Heragrain Foods: concept thương hiệu do HTX Heragrain cung cấp (ảnh dựng, chưa phải ảnh chụp sản phẩm), '
                'dùng chung với bộ slide tổng quan. Ảnh vùng trồng, chế biến, hương vị: bộ dữ liệu Open Images (Google), giấy phép '
                'CC BY 2.0. Icon: Lucide (ISC). Font: Baloo 2, Mulish, Dancing Script (SIL OFL).')
NOTE = ('5 concept dựng trên đúng 6 sản phẩm của bộ slide tổng quan. Tên concept, quy cách, khách hàng mục tiêu là đề xuất; số '
        'liệu vùng ca cao theo Trung tâm Khuyến nông Đắk Lắk (2025). Cần HTX duyệt trước khi thiết kế bao bì in.')

NOTE_ANH = ('Ảnh: concept Heragrain Foods do HTX cung cấp (ảnh dựng, chưa phải ảnh chụp sản phẩm). '
            'Dấu “100% Tự nhiên” chỉ in khi có kết quả kiểm nghiệm, đối chiếu quy định nhãn.')
_nav0 = L.nav


def _nav_logo(s, ctx, active=0, dark=False):
    """Thanh điều hướng của mẫu, thay biểu tượng + chữ thương hiệu bằng logo Heragrain Foods trong bảng concept."""
    out = []
    for sh in _nav0(s, ctx, active, dark):
        if sh.name in ('!!nav_logo', '!!nav_brand', '!!nav_sub'):
            sh._element.getparent().remove(sh._element)
        else:
            out.append(sh)
    lg = K.picture(s, CC['cc_logo_trang' if dark else 'cc_logo'], L.ML - 0.05, 0.15, 1.45, 0.53, fit='contain',
                   nm='!!nav_logo')
    return [lg] + out


L.nav = _nav_logo
_prod0 = L.product


def _product(s, ctx, key, cx, bottom, h, nm=None, rot=0, blurred=False, w=None):
    """Ảnh tách nền: không để khung cắt mất sản phẩm (mẫu gốc cắt theo khung khi bề ngang được chỉ định quá rộng)."""
    if w is not None:
        from PIL import Image
        path = L.blur(ctx, key) if blurred else L.pic(ctx, key)
        iw, ih = Image.open(path).size
        w = min(w, h * iw / ih)
    return _prod0(s, ctx, key, cx, bottom, h, nm=nm, rot=rot, blurred=blurred, w=w)


L.product = _product


def nhom_sp(prs, ctx, c):
    """Ba sản phẩm một nhóm: ảnh lớn, số thứ tự, giai đoạn, tên Việt, tên Anh, mô tả công đoạn."""
    TH = L.T
    s = L._new(prs, ctx)
    L.background(s, ctx)
    nv = L.nav(s, ctx, c.get('nav', 1))
    hd = L.heading(s, c['title'], c.get('script', ''), y=0.88, size=32)
    gap, top, ch = 0.32, 2.12, 4.86
    cw = (L.SW - 2 * L.ML - 2 * gap) / 3
    col = c.get('color', TH['accent'])
    out = []
    for i, it in enumerate(c['items'][:3]):
        x = L.ML + i * (cw + gap)
        cd = L.card(s, x, top, cw, ch, radius=0.14)
        ph = K.picture(s, L.pic(ctx, it['photo']), x + 0.1, top + 0.1, cw - 0.2, 3.1, radius=0.1,
                       focus=tuple(it.get('focus', (0.5, 0.3))))
        num = K.oval(s, x + 0.24, top + 0.24, 0.52, fill=col)
        K.shape_text(num, str(it['num']), size=16, color='FFFFFF', font=L.F('title'), margin=(0, 0))
        tg = it['tag']
        tw = K.text_w(tg, L.F('bold'), 9.5) + 0.45
        pill = K.rect(s, x + cw - 0.24 - tw, top + 0.3, tw, 0.36, fill='FFFFFF', radius=0.18, alpha=92)
        K.shape_text(pill, tg, size=9.5, color=col, font=L.F('bold'), bold=L.BOLD(), margin=(0.05, 0))
        nm = it['name']
        sz = L.fit(nm.upper(), 'title', 17, cw - 0.5, 12)
        t1 = K.text(s, x + 0.26, top + 3.27, cw - 0.5, 0.42, nm.upper(), size=sz, font=L.F('title'), color=TH['title'],
                    anchor='m', wrap=False)
        t2 = K.text(s, x + 0.26, top + 3.66, cw - 0.5, 0.34, it['en'], size=14, font=L.F('script'), color=col, anchor='m')
        t3 = L.rich(s, x + 0.26, top + 4.02, cw - 0.5, 0.8, it['text'], size=11, line_sp=1.15)
        out.append([cd, ph, num, pill, t1, t2, t3])
    nt = K.text(s, L.ML, 7.05, 11.2, 0.32, c.get('note', NOTE_ANH), size=8.5, font=L.F('body'), color=TH['muted'],
                anchor='m')
    K.anims(s, nv, 'fade', 0.0, 0.0, 0.4)
    K.anims(s, hd, 'zoom', 0.1, 0.15, 0.6)
    K.anims(s, out, 'rise', 0.4, 0.22, 0.6)
    K.anim(s, nt, 'fade', 1.4, 0.5)
    L.page_no(s, ctx)
    K.notes(s, c.get('notes', NOTE_ANH))
    return s


def diem_cham(prs, ctx, c):
    """Lưới 3 × 2 ảnh điểm chạm thương hiệu (bảng concept), chú thích trên dải tối dưới ảnh."""
    TH = L.T
    s = L._new(prs, ctx)
    L.background(s, ctx)
    nv = L.nav(s, ctx, c.get('nav', 1))
    hd = L.heading(s, c['title'], c.get('script', ''), y=0.88, size=32)
    gap, top = 0.22, 2.12
    tw = (L.SW - 2 * L.ML - 2 * gap) / 3
    th = (7.0 - top - gap) / 2
    out = []
    for i, (key, t, sub) in enumerate(c['items'][:6]):
        x = L.ML + (i % 3) * (tw + gap)
        y = top + (i // 3) * (th + gap)
        ph = K.picture(s, L.pic(ctx, key), x, y, tw, th, radius=0.12)
        K.shadow(ph, blur=0.3, dist=0.08, alpha=20, color='3B2A20', angle=90)
        K._ensure_ln_before_effects(ph)
        gh = 0.92
        band = K.rect(s, x, y + th - gh, tw, gh, shp=MSO_SHAPE.ROUND_2_SAME_RECTANGLE, rot=180)
        band.adjustments[0] = 0.12 / gh
        K.grad_fill(band, [(0, '10301F', 92), (70, '10301F', 55), (100, '10301F', 0)], angle=90)
        a = K.text(s, x + 0.2, y + th - 0.68, tw - 0.4, 0.32, t, size=13, font=L.F('bold'), bold=L.BOLD(),
                   color='FFFFFF', anchor='m', wrap=False)
        b = K.text(s, x + 0.2, y + th - 0.38, tw - 0.4, 0.3, sub, size=10, font=L.F('body'), color='F2E3BF',
                   anchor='m')
        out.append([ph, band, a, b])
    nt = K.text(s, L.ML, 7.05, 10.6, 0.32, c.get('note', ''), size=8.5, font=L.F('body'), color=TH['muted'], anchor='m')
    K.anims(s, nv, 'fade', 0.0, 0.0, 0.4)
    K.anims(s, hd, 'zoom', 0.1, 0.15, 0.6)
    K.anims(s, out, 'zoom', 0.4, 0.15, 0.5)
    K.anim(s, nt, 'fade', 1.4, 0.5)
    L.page_no(s, ctx)
    K.notes(s, c.get('note', ''))
    return s


def specs_anh(prs, ctx, c):
    """Như bố cục specs của mẫu nhưng bên trái là ảnh (concept chưa có bao bì riêng): ảnh chính + hàng thẻ sản phẩm liên quan."""
    TH = L.T
    s = L._new(prs, ctx)
    L.background(s, ctx)
    nv = L.nav(s, ctx, c.get('nav', 2))
    lx, ly, lw, lh = L.ML, 1.15, 5.45, 5.85
    cd = L.card(s, lx, ly, lw, lh, radius=0.16)
    ph_h = c.get('photo_h', 2.9)
    ph = K.picture(s, L.pic(ctx, c['photo']), lx + 0.14, ly + 0.14, lw - 0.28, ph_h, radius=0.1,
                   focus=tuple(c.get('focus', (0.5, 0.5))))
    cap = K.text(s, lx + 0.2, ly + 0.2 + ph_h, lw - 0.4, 0.34, c.get('photo_cap', ''), size=9.5, font=L.F('body'),
                 color=TH['muted'], anchor='m')
    left = [cd, ph, cap]
    tiles = c.get('tiles', [])
    if tiles:
        ty = ly + ph_h + 0.62
        tt = K.text(s, lx + 0.2, ty, lw - 0.4, 0.34, c.get('tiles_title', ''), size=12, font=L.F('bold'), bold=L.BOLD(),
                    color=TH['accent'], anchor='m')
        left.append(tt)
        n = len(tiles)
        g = 0.14
        tw = min(c.get('tile_w', 1.25), (lw - 0.4 - g * (n - 1)) / n)
        x0 = lx + (lw - (tw * n + g * (n - 1))) / 2
        for k, (key, lab) in enumerate(tiles):
            x = x0 + k * (tw + g)
            left.append(K.picture(s, L.pic(ctx, key), x, ty + 0.42, tw, tw, radius=0.08, focus=(0.5, 0.35)))
            left.append(K.text(s, x - 0.05, ty + 0.46 + tw, tw + 0.1, 0.4, lab, size=9, font=L.F('semi'), color=TH['ink'],
                               align='c', line_sp=1.0))
    x0 = 6.3
    w = L.SW - L.ML - x0
    title = c['title'].upper()
    tt = L.big_title(s, x0, 1.0, w, 0.75, title, L.fit(title, 'title', 36, w, 20), align='l', nm='!!h_title')
    sc = L.script(s, x0 + 0.4, 1.5, w, 0.7, c.get('script', ''), 30, align='l', nm='!!h_script', color=TH['ink']) \
        if c.get('script') else None
    rows = c['rows']
    rh = min(0.5, 3.9 / len(rows))
    cw = c.get('col_w') or [2.6] + [1.6] * (len(rows[0]) - 1)
    k = w / sum(cw)
    gf = K.table(s, x0, 2.4, w, rh * len(rows), rows, col_w=[v * k for v in cw], header_fill=TH['accent'],
                 header_color='FFFFFF', body_fill=TH['card'], body_fill2=TH['soft'], body_color=TH['ink'],
                 line_color=TH['line'], size=11.5, header_size=12, row_h=rh)
    note = L.rich(s, x0, 2.5 + rh * len(rows), w, 0.9, c.get('note', ''), size=10.5, color=TH['muted'], line_sp=1.2)
    K.anims(s, nv, 'fade', 0.0, 0.0, 0.4)
    K.anims(s, left, 'fly_l', 0.2, 0.06, 0.6)
    K.anim(s, tt, 'wipe_l', 0.4, 0.6)
    if sc is not None:
        K.anim(s, sc, 'fade', 0.7, 0.5)
    K.anim(s, gf, 'wipe_d', 0.8, 0.9)
    K.anim(s, note, 'fade', 1.5, 0.5)
    L.page_no(s, ctx)
    K.notes(s, c.get('notes', NOTE_ANH))
    return s


def build_content():
    return [
        (L.cover, dict(word='Heragrain', script='Cacao', products=['nibs', 'socola', 'bot'], kicker='5 concept · 6 sản phẩm ca cao',
                       tagline='Tinh hoa cacao Việt Nam, vươn ra thế giới · Ca cao lên men từ đất đỏ bazan Đắk Lắk', height=4.6,
                       notes=NOTE)),
        (L.intro, dict(title='Ca cao Đắk Lắk', script='từ đất đỏ bazan', photo='pods_basket', focus=[0.5, 0.45],
                       text='Đắk Lắk có khoảng **2.000 ha ca cao** (có số đánh giá 1.140 ha), năng suất hơn **15 tạ hạt khô/ha**, '
                            'sản lượng 2025 ước **1.650 tấn** (Trung tâm Khuyến nông tỉnh). Các vùng đang có liên kết sản xuất ca cao '
                            'gồm Krông Ana, Ea Kar, Buôn Đôn… **Heragrain** làm **6 sản phẩm** trong hai nhóm: **sơ chế** (hạt lên '
                            'men phơi khô, hạt rang, nibs) và **chế biến sâu** (socola, bột, bơ ca cao).')),
        (nhom_sp, dict(nav=1, title='Nhóm I · Sơ chế', script='nguyên liệu đầu vào', color='1D4B3A', items=[
            dict(photo='cc_sp1_hat_len_men', num=1, name='Hạt ca cao lên men, phơi khô', en='Fermented & dried cocoa beans',
                 tag='GĐ1 · Concept 1', focus=(0.5, 0.15),
                 text='Thu hoạch, bóc quả, tách hạt, **lên men, phơi khô**. Kiểm nhận, phân loại rồi bán cho **nhà máy chế biến**.'),
            dict(photo='cc_sp2_hat_rang', num=2, name='Hạt ca cao rang', en='Roasted cocoa beans', tag='GĐ1 · Concept 1',
                 focus=(0.5, 0.2),
                 text='Rang chín **theo tiêu chuẩn** (ghi nhiệt độ, thời gian từng mẻ) để chuẩn bị tách vỏ; bán theo đơn đặt.'),
            dict(photo='cc_sp3_nibs', num=3, name='Nhân ca cao (nibs)', en='Cocoa nibs', tag='GĐ1 · Concept 1',
                 focus=(0.5, 0.25),
                 text='Phần nhân sau khi **rang, tách vỏ**. Bán cho **nhà máy socola, bánh kẹo**; gửi mẫu chào xuất khẩu.')])),
        (nhom_sp, dict(nav=1, title='Nhóm II · Chế biến sâu', script='socola, bột và bơ ca cao', color='5A3825', items=[
            dict(photo='cc_sp4_socola', num=4, name='Socola', en='Chocolate', tag='GĐ2 · Concept 2, 4', focus=(0.5, 0.3),
                 text='Nibs **nghiền mịn**, phối trộn đường và các thành phần phù hợp; tôi, đổ khuôn thành thanh socola.'),
            dict(photo='cc_sp5_bot', num=5, name='Bột ca cao', en='Cocoa powder', tag='GĐ3 · Concept 3', focus=(0.5, 0.3),
                 text='Khối ca cao sau nghiền được **ép tách bơ**; phần chất rắn còn lại nghiền mịn thành bột ca cao.'),
            dict(photo='cc_sp6_bo', num=6, name='Bơ ca cao', en='Cocoa butter', tag='GĐ3 · Concept 3', focus=(0.5, 0.35),
                 text='Chất béo tách ra khi **ép khối ca cao**; dùng làm socola, thực phẩm; mỹ phẩm cần hồ sơ riêng.')])),
        (L.story_product, dict(nav=0, title='Chuỗi giá trị', script='từ hạt đến thanh socola', product='nibs', second='socola',
                               side='right',
                               text='Nông hộ, HTX hái quả, tách hạt, **lên men, phơi khô** (sản phẩm 1). Heragrain kiểm nhận, '
                                    '**rang theo tiêu chuẩn** (sản phẩm 2), **tách vỏ** thành nibs (sản phẩm 3). Nibs **nghiền mịn** '
                                    'với đường thành socola (sản phẩm 4), hoặc **ép** tách bơ ca cao (sản phẩm 6) và bột ca cao '
                                    '(sản phẩm 5); sau cùng là **mix vị** và **hộp quà** từ chính các sản phẩm này.')),
        (L.values_row, dict(nav=0, title='Giá trị', script='dòng ca cao Heragrain',
                            text='Bốn cam kết trên cả 6 sản phẩm: **minh bạch**, **lên men chuẩn**, **thuần ca cao** và '
                                 '**không bỏ phí** phần nào của hạt ca cao.',
                            items=[dict(product='nibs', label='Minh bạch', text='Ghi vùng trồng, mã lô trên bao bì'),
                                   dict(product='hat', label='Lên men chuẩn', text='Kiểm từng lô bằng cut test'),
                                   dict(product='bot', label='Thuần ca cao', text='Một vùng trồng, ghi mẻ rang'),
                                   dict(product='bo', label='Không bỏ phí', text='Bột, bơ từ cùng mẻ ép; vỏ lụa làm phân bón')])),
        (L.concepts, dict(nav=2, title='5 concept', script='dựng trên 6 sản phẩm',
                          items=[dict(label='Concept 1', slogan='Bazan Origin · sản phẩm 1, 2, 3: hạt lên men, hạt rang, nibs',
                                      products=['nibs', 'hat', 'rang'], palette=['B08A5B', '1F5A35', 'F3EBD8', 'E4A92A'],
                                      values=['Bao đay B2B', 'Túi nibs, hộp mẫu 3 vùng', 'Ghi lô, độ ẩm, cut test'],
                                      color='5A3825'),
                                 dict(label='Concept 2', slogan='Đại Ngàn 70 · sản phẩm 4: socola đen single origin',
                                      products=['socola'], palette=['1F5A35', '4A2C1C', 'F3EBD8', 'E4A92A'],
                                      values=['Socola đen 70–100 %', 'Bean-to-bar tại xưởng', 'Ghi ngày rang, mẻ nghiền'],
                                      color='3B2416'),
                                 dict(label='Concept 3', slogan='Cacao Thuần · sản phẩm 5, 6: bột và bơ ca cao',
                                      products=['bot', 'bo'], palette=['1F5A35', '7A4A2A', 'F3EBD8', 'E4A92A'],
                                      values=['Bột ca cao túi zip', 'Bơ ca cao đóng hũ', 'Ép từ cùng mẻ nibs'],
                                      color='7A4A2A'),
                                 dict(label='Concept 4', slogan='Tây Nguyên Fusion · phát triển từ sản phẩm 4: socola mix vị',
                                      products=['socola'], palette=['1F5A35', '4A2C1C', 'E4A92A'],
                                      values=['Robusta, tiêu, mắc ca', 'Trái cây sấy Heragrain', 'Hộp Socola, nhãn vị'],
                                      color='1D4B3A')],
                          note='Concept 5 (Quà Đại Ngàn: hộp quà ghép sản phẩm 3, 4, 5, 6) ở trang 18. Ảnh sản phẩm: concept HTX cung cấp, dùng chung với bộ tổng quan.')),
        (L.carousel, dict(nav=1, height=4.6, items=[
            dict(product='hat', name='Hạt lên men', script='Sản phẩm 1 · Concept 1', photo='beans_dry', focus=[0.5, 0.5],
                 text='Hạt ca cao **lên men, phơi khô**; kiểm nhận, phân loại rồi bán cho **nhà máy chế biến**.'),
            dict(product='rang', name='Hạt rang', script='Sản phẩm 2 · Concept 1', photo='beans_dark', focus=[0.5, 0.5],
                 text='Rang chín **theo tiêu chuẩn**, chuẩn bị tách vỏ; bán theo đơn đặt.'),
            dict(product='nibs', name='Nhân ca cao', script='Sản phẩm 3 · Concept 1', photo='pods_basket', focus=[0.5, 0.6],
                 text='Nhân hạt sau khi **rang, tách vỏ**; bán cho **nhà máy socola, bánh kẹo**, gửi mẫu chào xuất khẩu.'),
            dict(product='socola', name='Socola', script='Sản phẩm 4 · Concept 2, 4', photo='tasting', focus=[0.5, 0.5],
                 text='Socola đen **single origin** 70 %, 80 %, 100 %; từ GĐ4 thêm dòng **mix vị** Tây Nguyên.'),
            dict(product='bot', name='Bột ca cao', script='Sản phẩm 5 · Concept 3', photo='cocoa_cup', focus=[0.5, 0.5],
                 text='Ép khối ca cao **tách bơ**, nghiền phần chất rắn thành bột cho pha chế, làm bánh.'),
            dict(product='bo', name='Bơ ca cao', script='Sản phẩm 6 · Concept 3', photo='grinder', focus=[0.5, 0.4],
                 text='Chất béo tách khi **ép khối ca cao**; dùng làm socola, thực phẩm.')])),
        (L.specs, dict(nav=2, title='Concept 1 · Bazan Origin', script='sản phẩm 1, 2, 3', product='nibs', col_w=[1.5, 3.7],
                       rows=[['Hạng mục', 'Nội dung đề xuất'],
                             ['Sản phẩm', '1 hạt ca cao lên men, phơi khô · 2 hạt ca cao rang · 3 nhân ca cao (nibs)'],
                             ['Quy cách', 'Bao đay cho nhà máy (B2B) · túi nibs bán lẻ · hộp mẫu 3 vùng'],
                             ['Khách hàng', 'Nhà máy chế biến, nhà máy socola, bánh kẹo, nhà xuất khẩu, tiệm bánh'],
                             ['Khác biệt', 'Mỗi bao ghi vùng trồng, mã lô, độ ẩm, kết quả cut test'],
                             ['Pháp lý', 'GCN ATTP · tự công bố hạt rang, nibs (hạt lên men là nguyên liệu) · GS1'],
                             ['Giai đoạn', 'GĐ1 · Q1–Q2/2027']],
                       note='Hộp mẫu 3 vùng (ví dụ Krông Ana, Ea Kar, Buôn Đôn) dùng để **chào mẫu** đơn vị xuất khẩu, nhà máy socola.')),
        (L.specs, dict(nav=2, title='Concept 2 · Đại Ngàn 70', script='sản phẩm 4 · socola đen', product='socola', col_w=[1.5, 3.7],
                       rows=[['Hạng mục', 'Nội dung đề xuất'],
                             ['Sản phẩm', '4 socola: socola đen 70 %, 80 %, 100 % (không đường)'],
                             ['Bao bì', 'Hộp giấy dòng Socola Heragrain Foods; thanh 80 g, hộp 3 thanh'],
                             ['Thành phần', 'Ca cao Đắk Lắk, đường mía (bản 100 % chỉ có ca cao)'],
                             ['Khách hàng', 'Người thích socola đen, quà tặng, quán cà phê, khách du lịch'],
                             ['Pháp lý', 'Tự công bố · nhãn theo NĐ 37/2026 · ghi % chất khô ca cao'],
                             ['Giai đoạn', 'GĐ2 · Q3–Q4/2027']],
                       note='Ghi **ngày rang, mẻ nghiền** để truy xuất; hương vị cần thử nếm, đánh giá cảm quan trước khi quảng bá.')),
        (L.specs, dict(nav=2, title='Concept 3 · Cacao Thuần', script='sản phẩm 5, 6', product='bot', col_w=[1.5, 3.7],
                       rows=[['Hạng mục', 'Nội dung đề xuất'],
                             ['Sản phẩm', '5 bột ca cao nguyên chất · 6 bơ ca cao thực phẩm'],
                             ['Bao bì', 'Bột: túi zip 250 g, gói 1 kg cho tiệm bánh · bơ: hũ nắp xanh'],
                             ['Khách hàng', 'Pha chế, làm bánh, gia đình; xưởng socola nhỏ cần bơ ca cao'],
                             ['Khác biệt', 'Ép tại xưởng từ cùng mẻ nibs, ghi hàm lượng béo'],
                             ['Pháp lý', 'Tự công bố · HACCP hoặc ISO 22000 ở GĐ3'],
                             ['Giai đoạn', 'GĐ3 · Q1–Q2/2028']],
                       note='Bơ ca cao bán làm nguyên liệu **mỹ phẩm** cần hồ sơ riêng theo quy định mỹ phẩm — để sau.')),
        (specs_anh, dict(nav=2, title='Concept 4 · Tây Nguyên Fusion', script='mix vị từ sản phẩm 4', photo='choc_nuts',
                         photo_h=2.55, tile_w=1.75, photo_cap='Ảnh minh họa hương vị (Open Images); chưa có bao bì riêng.',
                         tiles_title='Phát triển từ sản phẩm 4 · dùng hộp dòng Socola', tiles=[('cc_sp4_socola', '4 · Socola')],
                         col_w=[1.5, 3.7],
                         rows=[['Hạng mục', 'Nội dung đề xuất'],
                               ['Sản phẩm', 'Socola mix vị: cà phê Robusta, tiêu đen, mắc ca, trái cây sấy Heragrain'],
                               ['Nền', 'Từ sản phẩm 4 (socola), cùng dây chuyền; thêm nồi bao để bọc'],
                               ['Bao bì', 'Hộp dòng Socola Heragrain Foods, thêm nhãn vị'],
                               ['Khách hàng', 'Khách du lịch, quà tặng, chuỗi cà phê, cửa hàng đặc sản'],
                               ['Pháp lý', 'Tự công bố từng vị; ghi chất gây dị ứng (mắc ca)'],
                               ['Giai đoạn', 'GĐ4 · từ Q3/2028']],
                         note='Nối dòng ca cao với **trái cây sấy** sẵn có của Heragrain; không tạo sản phẩm mới ngoài 6 sản phẩm.')),
        (specs_anh, dict(nav=2, title='Concept 5 · Quà Đại Ngàn', script='hộp quà ghép sản phẩm 3–6', photo='cc_hop_qua_goc',
                         photo_h=2.1, photo_cap='Hộp quà trong bảng nhận diện Heragrain Foods (concept HTX cung cấp).',
                         tiles_title='Trong hộp: sản phẩm 3, 4, 5, 6',
                         tiles=[('cc_sp3_nibs', '3 · Nibs'), ('cc_sp4_socola', '4 · Socola'), ('cc_sp5_bot', '5 · Bột'),
                                ('cc_sp6_bo', '6 · Bơ')],
                         col_w=[1.5, 3.7],
                         rows=[['Hạng mục', 'Nội dung đề xuất'],
                               ['Sản phẩm', 'Hộp quà Đại Ngàn ghép 4 sản phẩm của HTX'],
                               ['Trong hộp', 'Nibs, socola, bột ca cao, bơ ca cao (bao bì như khi bán lẻ)'],
                               ['Khách hàng', 'Quà Tết, quà doanh nghiệp, du lịch, lễ hội cà phê Buôn Ma Thuột'],
                               ['Khác biệt', 'Kể chuyện chuỗi ca cao Tây Nguyên trong một hộp'],
                               ['Pháp lý', 'Mỗi sản phẩm đã tự công bố; nhãn hộp quà; OCOP (tùy chọn)'],
                               ['Giai đoạn', 'GĐ4 · từ Q3/2028, mùa Tết']],
                         note='Hộp quà không thêm sản phẩm mới: chỉ ghép các sản phẩm đã có mã GTIN, đã tự công bố.')),
        (L.features, dict(nav=0, title='Vì sao chọn', script='ca cao Heragrain', product='socola', items=[
            ('map-pin', 'Một vùng trồng', 'Ghi xã, HTX, tọa độ vườn trên mỗi lô hạt.'),
            ('thermometer', 'Rang theo tiêu chuẩn', 'Ghi nhiệt độ, thời gian từng mẻ rang (CCP).'),
            ('package', 'Một hệ bao bì', '6 sản phẩm chung nhận diện Heragrain Foods, tên Việt – Anh.'),
            ('leaf', 'Hướng tới EUDR', 'Thu tọa độ vườn từ đầu để đáp ứng quy định chống phá rừng của EU.')])),
        (diem_cham, dict(nav=0, title='Nhận diện thương hiệu', script='Heragrain Foods trên mọi điểm chạm', items=[
            ('cc_ho_so_nang_luc', 'Hồ sơ năng lực, văn phòng phẩm', 'GĐ1 · chào khách B2B, nhà nhập khẩu'),
            ('cc_catalogue_b2b', 'Catalogue sản phẩm B2B', 'GĐ1 · gửi kèm mẫu hạt, nibs'),
            ('cc_website', 'Website Heragrain Foods', 'Từ GĐ1 · giới thiệu, nhận đơn, xuất khẩu'),
            ('cc_facebook', 'Truyền thông Facebook', 'Từ GĐ1 · kể chuyện vùng trồng, ra mắt'),
            ('cc_ke_trung_bay', 'Kệ trưng bày bán lẻ', 'GĐ2 · cửa hàng đặc sản, siêu thị'),
            ('cc_hop_qua', 'Bộ sản phẩm cao cấp', 'GĐ4 · Concept 5 Quà Đại Ngàn')],
                          note='Ảnh: bảng concept nhận diện Heragrain Foods do HTX cung cấp (ảnh dựng). Kiểm tra tên miền, '
                               'email và đăng ký nhãn hiệu, logo trước khi in ấn phẩm.')),
        (L.usage, dict(nav=2, title='Lộ trình ra mắt', script='5 concept theo 4 giai đoạn', product='nibs', steps=[
            ('package', 'GĐ1 · 2027', 'Concept 1: sản phẩm 1, 2, 3 (hạt lên men, hạt rang, nibs).'),
            ('cookie', 'GĐ2 · cuối 2027', 'Concept 2: sản phẩm 4, socola đen.'),
            ('beaker', 'GĐ3 · 2028', 'Concept 3: sản phẩm 5, 6, bột và bơ ca cao.'),
            ('coffee', 'GĐ4 · từ Q3/2028', 'Concept 4: socola mix vị từ sản phẩm 4.'),
            ('gift', 'GĐ4 · mùa Tết', 'Concept 5: hộp quà ghép sản phẩm 3–6.')])),
        (L.window_cards, dict(nav=0, title='Từ quả', script='đến thanh socola',
                              text='Ảnh minh họa (Open Images) — thay bằng ảnh thật vùng trồng, HTX đối tác và xưởng Heragrain.',
                              items=[dict(photo='pods_bowl', name='Quả ca cao', focus=[0.5, 0.5]),
                                     dict(photo='beans_dry', name='Hạt lên men, phơi khô', focus=[0.5, 0.5]),
                                     dict(photo='grinder', name='Máy nghiền đá', focus=[0.5, 0.4])])),
        (L.specs, dict(nav=0, title='Căn cứ và giả định', script='đọc trước khi dùng số liệu', product='hat', col_w=[2.0, 3.2],
                       rows=[['Nội dung', 'Mức căn cứ'],
                             ['Diện tích, sản lượng ca cao Đắk Lắk', 'Có nguồn: TT Khuyến nông Đắk Lắk (2025); hai số diện tích chưa thống nhất'],
                             ['Tên concept, quy cách, khách hàng', 'Đề xuất của tư vấn; chưa khảo sát thị trường'],
                             ['Thời điểm ra mắt theo giai đoạn', 'Đề xuất; phụ thuộc vốn, giấy phép, chạy thử'],
                             ['Ảnh 6 sản phẩm, bao bì', 'Concept HTX cung cấp (ảnh dựng), dùng chung với bộ tổng quan'],
                             ['Giá bán, sản lượng, biên lợi nhuận', 'Chưa có; cần khảo sát giá, chi phí, đơn hàng thử']],
                       note='Không dùng bộ slide này làm căn cứ tài chính cho quyết định đầu tư khi chưa có **dự toán chi phí và khảo sát giá**.')),
        (L.conclusion, dict(nav=0, title='Heragrain Cacao', script='Tinh hoa cacao Việt Nam',
                            text='Năm concept dựng trên **6 sản phẩm**: nhóm **sơ chế** (hạt lên men, hạt rang, nibs) và nhóm '
                                 '**chế biến sâu** (socola, bột, bơ ca cao); **mix vị** và **hộp quà** làm từ chính các sản phẩm này.',
                            products=['hat', 'nibs', 'socola', 'bot', 'bo'])),
        (L.contact, dict(word='Cảm ơn', script='Heragrain Foods', product='socola',
                         lines=[('phone', 'Hotline: 0827.695.368 · 0968.702.701'), ('globe', 'www.heragrain.com'),
                                ('mail', 'contact@heragrain.com'), ('map-pin', 'HTX Heragrain · Đắk Lắk, Việt Nam')])),
    ]


if __name__ == '__main__':
    out = os.path.join(os.path.dirname(HERE), '1-concept-san-pham')
    os.makedirs(out, exist_ok=True)
    SB.build(sys.modules[__name__], out, None, DEFAULT_NAME)
