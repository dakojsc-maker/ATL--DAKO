"""
"Chính luận" layouts — M04, modelled on the Triết học Mác – Lênin reference deck (video 3).

Look & feel
    * crimson silk backgrounds with faint monument silhouettes, gold ceremonial ribbon, red silk drape with gold piping
    * tall condensed poster capitals (Big Shoulders Display Black) in light gold inside chamfered gold-framed tabs,
      a small "PHẦN n" label above every title; body text in Be Vietnam Pro
    * translucent dark-red cards with thin gold borders and snipped corners, cream "light" chips for key terms
    * bevelled gold hammer & sickle, order-style star medal, faceted stars as badges and bullets
    * statues cut out from photographs (or engravings printed in dark ink) as the "speaker" on the right
    * Morph: background ('!!bg'), title tab ('!!tab'), part label ('!!part'), emblem ('!!emblem'), medal ('!!medal'),
      portrait ('!!hero'), ribbon / drape keep their names so they glide between slides; content enters with
      staggered animations (wipe, rise, zoom, grow & turn for emblems).
Each layout: fn(prs, ctx, c) -> slide.   ctx = dict(n, img{key: path}, cut{key: path}, art{key: path})
"""
import re

import pptkit as K
from pptx.enum.shapes import MSO_SHAPE

SW, SH, ML = K.SW, K.SH, 0.6

# ------------------------------------------------------------------ design tokens
P = dict(
    red='C3141F', red2='A30F1A', red_dk='7A0912', red_deep='4E040A', red_lt='E5373B',
    gold='E3AE4A', gold_lt='FFE6A1', gold_dk='A8721C', cream='FFF4E2', ink='5A0A10', white='FFFFFF',
    chip='FFF6EA', chip2='F6DCCB',
)

FONTS = dict(
    disp=('Big Shoulders Display Black', 'BigShouldersDisplay-Black.ttf'),
    body=('Be Vietnam Pro', 'BeVietnamPro-Regular.ttf'),
    medium=('Be Vietnam Pro Medium', 'BeVietnamPro-Medium.ttf'),
    semi=('Be Vietnam Pro SemiBold', 'BeVietnamPro-SemiBold.ttf'),
    italic=('Be Vietnam Pro', 'BeVietnamPro-Italic.ttf'),
)


def F(role):
    return FONTS[role][0]


def register(theme_key='maclenin'):
    """Register theme + fonts with pptkit."""
    K.THEMES[theme_key] = dict(
        name='Chính luận', key=theme_key,
        bg_light=P['red'], bg_dark=P['red_dk'],
        ink=P['cream'], text=P['cream'], muted='F2C9B8', soft=P['red2'],
        card=P['red_dk'], card2=P['red2'], accent=P['gold'], accent_ink=P['red_dk'],
        violet=P['gold_dk'], hot=P['gold_lt'], up=P['gold'], line=P['gold'],
        chart=[P['gold'], P['gold_lt'], P['chip2'], P['gold_dk']],
        blob_light=[(P['gold'], 30)], blob_dark=[(P['gold'], 30)],
        tint=P['red_dk'], grid_dark='8E2A2A', row_alt=P['red2'],
    )
    K.set_theme(theme_key)
    for role in ('disp', 'body', 'medium', 'semi'):
        face, fname = FONTS[role]
        K.FONT_FILES[face] = 'maclenin/' + fname


# ------------------------------------------------------------------ helpers
def _new(prs, ctx, tr=1.2, kind='morph'):
    ctx['n'] += 1
    s = K.blank_slide(prs, True)
    if ctx['n'] > 1:
        (K.morph if kind == 'morph' else K.fade_tr)(s, tr)
    return s


def tw(t, font, size, spacing=0.0):
    """Rendered width (in) of one line, including extra letter spacing (pt per character)."""
    return K.text_w(t, font, size) + len(t) * spacing / 72 + 0.06


def art(ctx, key):
    return ctx['art'][key]


def pic_path(ctx, key, prefer_cut=False):
    """Photo key, cut-out key, or a path. Portraits ask for the cut-out first."""
    order = ('cut', 'img') if prefer_cut else ('img', 'cut')
    for k in order:
        if key in ctx[k]:
            return ctx[k][key]
    import content_io as CIO
    return CIO.photo_path(key)


def bg(s, ctx, key='silk'):
    return K.picture(s, art(ctx, key), 0, 0, SW, SH, nm='!!bg')


def page_no(s, n):
    return K.text(s, SW - ML - 0.8, SH - 0.42, 0.8, 0.26, f'{n:02d}', size=10, font=F('disp'), color=P['gold_lt'],
                  align='r', spacing=1)


def gold_line(shape, w=1.0, light=None, dark=None):
    """Replace a shape outline with a gold metallic gradient line."""
    K.set_line(shape, P['gold'], w)
    ln = shape._element.spPr.find(K.qn('a:ln'))
    for el in list(ln):
        if el.tag in (K.qn('a:solidFill'), K.qn('a:noFill'), K.qn('a:gradFill')):
            ln.remove(el)
    g = K.X(f'<a:gradFill rotWithShape="1"><a:gsLst>'
            f'<a:gs pos="0"><a:srgbClr val="{light or P["gold_lt"]}"/></a:gs>'
            f'<a:gs pos="45000"><a:srgbClr val="{P["gold"]}"/></a:gs>'
            f'<a:gs pos="100000"><a:srgbClr val="{dark or P["gold_dk"]}"/></a:gs></a:gsLst>'
            f'<a:lin ang="2700000" scaled="0"/></a:gradFill>')
    ln.insert(0, g)
    return shape


def snip(s, x, y, w, h, style='dark', cut=0.16, lw=1.0, nm=None, shape=MSO_SHAPE.SNIP_2_DIAG_RECTANGLE):
    """Chamfered frame. style: dark (translucent red, gold border) | solid | light (cream chip) | line (border only)."""
    r = K.rect(s, x, y, w, h, shp=shape, nm=nm)
    try:
        r.adjustments[0] = 0.0
        r.adjustments[1] = min(0.5, cut / min(w, h))
    except IndexError:
        pass
    if style == 'dark':
        K.grad_fill(r, [(0, P['red_deep'], 72), (100, P['red_dk'], 45)], angle=35)
        gold_line(r, lw)
    elif style == 'solid':
        K.grad_fill(r, [(0, P['red_dk'], 100), (100, P['red2'], 100)], angle=90)
        gold_line(r, lw)
    elif style == 'light':
        K.grad_fill(r, [(0, P['white'], 100), (100, P['chip2'], 100)], angle=90)
        gold_line(r, lw)
    elif style == 'line':
        K.set_fill(r, None)
        gold_line(r, lw)
    K.shadow(r, blur=0.18, dist=0.05, alpha=35, color='2A0005', angle=90)
    K._ensure_ln_before_effects(r)
    return r


def label(shp, t, size=13, color=None, font=None, align='c', bold=False, spacing=None, margin=(0.14, 0.04),
          line_sp=1.05, anchor='m', margin_r=None):
    K.shape_text(shp, t, size=size, color=color or P['cream'], font=font or F('body'), bold=bold, align=align,
                 spacing=spacing, margin=margin, line_sp=line_sp, anchor=anchor)
    if margin_r is not None:
        shp.text_frame.margin_right = K.E(margin_r)
    return shp


def rich(s, x, y, w, h, content, size=12.5, color=None, bold_color=None, align='l', line_sp=1.2, space_after=4,
         font=None, nm=None, italic=False, anchor='t'):
    """'**bold**' markup -> SemiBold gold runs; '\n' = new paragraph."""
    color = color or P['cream']
    bold_color = bold_color or P['gold_lt']
    paras = []
    for para in content.split('\n'):
        runs = []
        for i, part in enumerate(re.split(r'\*\*', para)):
            if not part:
                continue
            runs.append((part, {'font': F('semi'), 'color': bold_color}) if i % 2 else (part, {}))
        paras.append(runs or [''])
    return K.text(s, x, y, w, h, paras, size=size, font=font or F('body'), color=color, align=align, line_sp=line_sp,
                  space_after=space_after, nm=nm, italic=italic, anchor=anchor)


def text_shadow(tb, alpha=55, blur=0.1, dist=0.04, color='3A0006'):
    for r in tb._element.iter(K.qn('a:rPr')):
        eff = K.etree.SubElement(r, K.qn('a:effectLst'))
        sh = K.etree.SubElement(eff, K.qn('a:outerShdw'))
        sh.set('blurRad', str(int(blur * 914400)))
        sh.set('dist', str(int(dist * 914400)))
        sh.set('dir', '5400000')
        sh.set('algn', 'ctr')
        sh.set('rotWithShape', '0')
        cc = K.etree.SubElement(sh, K.qn('a:srgbClr'))
        cc.set('val', color)
        al = K.etree.SubElement(cc, K.qn('a:alpha'))
        al.set('val', str(alpha * 1000))
        first = r.find(K.qn('a:latin'))
        if first is not None:
            first.addprevious(eff)


def gold_text(tb):
    """Metallic gold gradient on every run (PowerPoint); other apps fall back to the solid colour."""
    for r in tb._element.iter(K.qn('a:rPr')):
        sf = r.find(K.qn('a:solidFill'))
        if sf is None:
            continue
        g = K.X(f'<a:gradFill rotWithShape="1"><a:gsLst>'
                f'<a:gs pos="0"><a:srgbClr val="FFF3C4"/></a:gs><a:gs pos="55000"><a:srgbClr val="{P["gold_lt"]}"/></a:gs>'
                f'<a:gs pos="100000"><a:srgbClr val="{P["gold"]}"/></a:gs></a:gsLst>'
                f'<a:lin ang="5400000" scaled="0"/></a:gradFill>')
        sf.addprevious(g)
        r.remove(sf)


def picture(s, ctx, key, x, y, w, h, nm=None, geom='snip2DiagRect', border=True, focus=(0.5, 0.5), bw=1.5):
    p = K.picture(s, pic_path(ctx, key), x, y, w, h, geom=geom, focus=focus, nm=nm)
    if geom == 'snip2DiagRect':
        g = p._element.spPr.find(K.qn('a:prstGeom'))
        av = g.find(K.qn('a:avLst'))
        for nm_, v in (('adj1', 0), ('adj2', int(min(50000, 0.22 / min(w, h) * 100000)))):
            gd = K.etree.SubElement(av, K.qn('a:gd'))
            gd.set('name', nm_)
            gd.set('fmla', f'val {v}')
    if border:
        gold_line(p, bw)
    K.shadow(p, blur=0.25, dist=0.08, alpha=45, color='2A0005', angle=90)
    K._ensure_ln_before_effects(p)
    return p


def portrait(s, ctx, key, x, y, w, h, nm='!!hero', glow=True):
    out = []
    if glow:
        out.append(K.glow_img(s, x + w / 2, y + h * 0.42, max(w, h) * 0.95, 'FFB347', 38, falloff=1.4))
    out.append(K.picture(s, pic_path(ctx, key, prefer_cut=True), x, y, w, h, fit='contain', nm=nm))
    return out


def star(s, ctx, cx, cy, d, kind='gold', nm=None):
    p = K.picture(s, art(ctx, 'star_' + kind), cx - d / 2, cy - d / 2, d, d, fit='contain', nm=nm)
    return p


def emblem(s, ctx, x, y, h, nm='!!emblem', key='hammer_sickle', glow=True):
    from PIL import Image
    iw, ih = Image.open(art(ctx, key)).size
    w = h * iw / ih
    out = []
    if glow:
        out.append(K.glow_img(s, x + w / 2, y + h / 2, h * 1.5, 'FFC560', 30, falloff=1.5))
    out.append(K.picture(s, art(ctx, key), x, y, w, h, nm=nm))
    return out


def ribbon(s, ctx, where='tr'):
    if where == 'tr':
        return K.picture(s, art(ctx, 'ribbon'), SW - 4.2, -0.35, 4.6, 2.96, nm='!!ribbon')
    return K.picture(s, art(ctx, 'ribbon_bl'), -0.4, SH - 2.5, 4.6, 2.96, nm='!!ribbon')


def drape(s, ctx, where='br', nm='!!drape'):
    if where == 'br':
        return K.picture(s, art(ctx, 'drape_br'), SW - 6.6, SH - 3.3, 7.0, 3.5, nm=nm)
    if where == 'bl':
        return K.picture(s, art(ctx, 'drape_bl'), -0.4, SH - 3.3, 7.0, 3.5, nm=nm)
    return K.picture(s, art(ctx, 'drape_wide'), -0.3, SH - 1.75, SW + 0.6, 2.0, nm=nm)


def header(s, part, title, x=ML, y=0.62, max_w=9.8, size=27):
    """'PHẦN n' label + chamfered gold title tab (+ star, fading rule)."""
    out = []
    if part:
        out.append(K.text(s, x + 0.05, y - 0.34, 4.0, 0.3, part.upper(), size=12, font=F('disp'), color=P['gold_lt'],
                          spacing=2, nm='!!part'))
    t = title.upper()
    sz = size
    while tw(t, F('disp'), sz, 0.6) > max_w - 0.75 and sz > 18:
        sz -= 1
    w = min(max_w, tw(t, F('disp'), sz, 0.6) + 0.8)
    tab = snip(s, x, y, w, 0.66, style='dark', cut=0.2, lw=1.25, nm='!!tab')
    label(tab, t, size=sz, color=P['gold_lt'], font=F('disp'), align='l', spacing=0.6, margin=(0.3, 0.02))
    gold_text(tab)
    out.append(tab)
    rule = K.rect(s, x + w + 0.12, y + 0.62, max(0.3, SW - (x + w + 0.12) - 0.4), 0.025, nm='!!rule')
    K.grad_fill(rule, [(0, P['gold'], 85), (100, P['gold'], 0)], angle=0)
    out.append(rule)
    return out


def name_tag(s, ctx, x, y, t, nm='!!name', size=15):
    w = tw(t, F('disp'), size, 0.5) + 0.9
    tag = snip(s, x, y, w, 0.48, style='solid', cut=0.14, lw=1.25, nm=nm)
    label(tag, t, size=size, font=F('disp'), color=P['cream'], align='l', spacing=0.5, margin=(0.2, 0.02))
    st = star(s, ctx, x + w - 0.05, y + 0.24, 0.62, 'red')
    return [tag, st]


def statement(s, x, y, w, t, h=0.62, size=13.5, italic=True, nm=None):
    bar = snip(s, x, y, w, h, style='dark', cut=0.18, lw=1.25, nm=nm)
    label(bar, t, size=size, color=P['cream'], font=F('italic') if italic else F('semi'), align='c')
    if italic:
        for r in bar._element.iter(K.qn('a:rPr')):
            r.set('i', '1')
    return bar


def chevron_icon(s, cx, cy, d=0.3, color=None):
    c = K.rect(s, cx - d / 2, cy - d / 2, d, d * 0.8, fill=color or P['gold'], shp=MSO_SHAPE.CHEVRON, rot=90)
    return c


def num_badge(s, cx, cy, n, d=0.5):
    b = K.rect(s, cx - d / 2, cy - d / 2, d, d, shp=MSO_SHAPE.DIAMOND)
    K.grad_fill(b, [(0, P['red_lt'], 100), (100, P['red_dk'], 100)], angle=90)
    gold_line(b, 1.5)
    label(b, str(n), size=15, font=F('disp'), color=P['gold_lt'], margin=(0, 0))
    return b


# ================================================================== 1. cover
def cover(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx, 'silk_cover')
    fl = emblem(s, ctx, 8.35, 0.2, 3.3, glow=False)[0]
    rb = ribbon(s, ctx, 'tr')
    hero = portrait(s, ctx, c['portrait'], 7.9, 0.55, 5.4, 6.95)
    dr = drape(s, ctx, 'br')
    # kicker tag
    kt = c.get('kicker', '').upper()
    kw = tw(kt, F('disp'), 14, 1.5) + 0.5
    kick = snip(s, ML, 1.0, kw, 0.46, style='line', cut=0.12, lw=1.0, nm='!!kicker')
    label(kick, kt, size=14, font=F('disp'), color=P['gold_lt'], spacing=1.5, margin=(0.2, 0.02))
    # title, measured so it fits in 3 lines max
    title = c['title'].upper()
    size = 60
    while (K.n_lines(title, F('disp'), size, 7.3) > 3 or
           max(K.text_w(t, F('disp'), size) for t in title.split('\n')) > 7.3) and size > 34:
        size -= 2
    lines = K.n_lines(title, F('disp'), size, 7.3)
    th = lines * size / 72 * 1.02 + 0.2
    tt = K.text(s, ML, 1.7, 7.4, th, title, size=size, font=F('disp'), color=P['gold_lt'], line_sp=0.92,
                spacing=0.5, nm='!!title')
    gold_text(tt)
    text_shadow(tt, alpha=60, blur=0.14, dist=0.06)
    # chips
    y = 1.7 + th + 0.3
    x = ML
    chips = []
    for t in c.get('chips', []):
        w = K.text_w(t, F('medium'), 12.5) + 0.55
        ch = snip(s, x, y, w, 0.46, style='dark', cut=0.12, lw=1.0)
        label(ch, t, size=12.5, font=F('medium'), color=P['cream'])
        chips.append(ch)
        x += w + 0.15
    pres = K.text(s, ML, SH - 1.15, 7.0, 0.75,
                  [[(c.get('presenter', '').upper(), {'font': F('disp'), 'size': 16, 'color': P['gold_lt'],
                                                        'spacing': 1.2})],
                   [(c.get('info', ''), {})]], size=11.5, font=F('body'), color=P['cream'], line_sp=1.15)
    K.anim(s, fl, 'turn', 0.0, 1.0)
    K.anims(s, hero, 'fly_r', 0.25, 0.0, 1.0)
    K.anim(s, dr, 'wipe_l', 0.6, 0.8)
    K.anim(s, rb, 'wipe_l', 0.8, 0.8)
    K.anim(s, kick, 'wipe_l', 0.5, 0.5)
    K.anim(s, tt, 'zoom', 0.75, 0.9)
    K.anims(s, chips, 'rise', 1.3, 0.12, 0.45)
    K.anim(s, pres, 'fade', 1.7, 0.6)
    K.notes(s, c.get('notes', 'Slide bìa: tên đề tài, nhóm trình bày.'))
    return s


# ================================================================== 2. agenda / opening question
def agenda(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    q = c.get('question')
    shapes = []
    if q:
        qt = K.text(s, ML + 0.15, 1.62, 10.6, 0.62, q, size=21, font=F('italic'), italic=True, color=P['gold_lt'],
                    anchor='m')
        text_shadow(qt, alpha=45)
        qm = K.picture(s, art(ctx, 'quote_close'), SW - ML - 1.1, 1.45, 0.85, 0.85, fit='contain')
        shapes += [qt, qm]
    parts = c['parts']
    n = len(parts)
    gap = 0.3
    w = (SW - 2 * ML - gap * (n - 1)) / n
    y = 2.75
    cards = []
    for i, (lab, txt) in enumerate(parts):
        x = ML + i * (w + gap)
        cd = snip(s, x, y, w, 1.85, style='dark', cut=0.22, lw=1.25)
        st = star(s, ctx, x + w / 2, y, 0.55, 'red')
        lb = K.text(s, x, y + 0.34, w, 0.45, lab.upper(), size=22, font=F('disp'), color=P['gold_lt'], align='c',
                    spacing=1.5)
        gold_text(lb)
        tx = K.text(s, x + 0.25, y + 0.85, w - 0.5, 0.9, txt, size=13, font=F('medium'), color=P['cream'], align='c',
                    line_sp=1.12)
        cards.append([cd, lb, tx, st])
    em = emblem(s, ctx, SW / 2 - 1.05, 4.85, 2.3)
    dr = drape(s, ctx, 'wide')
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.15, 0.6)
    K.anims(s, shapes, 'fade', 0.35, 0.15, 0.6)
    K.anims(s, cards, 'rise', 0.6, 0.18, 0.5)
    K.anim(s, em[1], 'turn', 1.3, 0.9)
    K.anim(s, em[0], 'fade', 1.3, 0.9)
    K.anim(s, dr, 'wipe_l', 0.2, 0.9)
    return s


# ================================================================== 3. quote + portrait
def quote_portrait(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    rb = ribbon(s, ctx, 'tr')
    hero = portrait(s, ctx, c['portrait'], 8.55, 0.75, 4.85, 6.75)
    dr = drape(s, ctx, 'br')
    hd = header(s, c.get('part', ''), c['title'], max_w=8.2)
    pts = []
    for i, t in enumerate(c['points']):
        y = 1.75 + i * 1.22
        cd = snip(s, ML, y, 4.15, 1.0, style='dark', cut=0.18)
        label(cd, t, size=12.5, color=P['cream'], align='l', margin=(0.25, 0.06), line_sp=1.15)
        pts.append(cd)
    qb = snip(s, 5.05, 2.25, 3.85, 2.25, style='dark', cut=0.26, lw=1.5)
    qt = K.text(s, 5.3, 2.42, 3.4, 1.55, c['quote'], size=14, font=F('italic'), italic=True, color=P['cream'],
                anchor='m', line_sp=1.18)
    qm = K.picture(s, art(ctx, 'quote_open'), 5.25, 3.95, 0.6, 0.6, fit='contain')
    tag = name_tag(s, ctx, 8.75, 6.25, c['author'])
    page_no(s, ctx['n'])
    K.anims(s, hero, 'fly_r', 0.0, 0.0, 0.9)
    K.anim(s, rb, 'wipe_l', 0.3, 0.8)
    K.anim(s, dr, 'wipe_l', 0.3, 0.8)
    K.anims(s, hd, 'wipe_l', 0.2, 0.12, 0.6)
    K.anims(s, pts, 'rise', 0.6, 0.18, 0.5)
    K.anims(s, [qb, qt, qm], 'zoom', 1.2, 0.08, 0.6)
    K.anims(s, tag, 'wipe_l', 1.6, 0.1, 0.5)
    return s


# ================================================================== 4. two columns compare
def compare(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    w = (SW - 2 * ML - 0.4) / 2
    cols = []
    for i, side in enumerate((c['left'], c['right'])):
        x = ML + i * (w + 0.4)
        y = 1.95
        cd = snip(s, x, y, w, 4.2, style='dark', cut=0.25, lw=1.25)
        tt = side['title'].upper()
        tw_ = tw(tt, F('disp'), 19, 1) + 0.9
        tab = snip(s, x + (w - tw_) / 2, y - 0.27, tw_, 0.54, style='solid', cut=0.16, lw=1.25)
        label(tab, tt, size=19, font=F('disp'), color=P['gold_lt'], spacing=1)
        lines = K.text(s, x + 0.35, y + 0.42, w - 0.7, 1.35, '\n'.join(side['lines']), size=12, font=F('body'),
                       color=P['cream'], align='c', line_sp=1.12, space_after=4, anchor='m')
        ph = picture(s, ctx, side['image'], x + 0.3, y + 1.9, w - 0.6, 2.05, focus=tuple(side.get('focus', (0.5, 0.5))))
        cols.append([cd, tab, lines, ph])
    md = emblem(s, ctx, SW / 2 - 0.55, 5.65, 1.1, nm='!!medal', key='medal', glow=False)
    st = statement(s, ML + 1.2, 6.5, SW - 2 * ML - 2.4, c['statement'])
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anims(s, cols, 'rise', 0.4, 0.25, 0.6)
    K.anim(s, md[0], 'turn', 1.1, 0.8)
    K.anim(s, st, 'wipe_l', 1.4, 0.6)
    return s


# ================================================================== 5. two aspects with big emblem
def aspects(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    em = emblem(s, ctx, 0.35, 1.75, 4.9)
    hd = header(s, c.get('part', ''), c['title'])
    x0, w = 5.55, SW - ML - 5.55
    groups = []
    for i, a in enumerate(c['aspects']):
        y = 1.5 + i * 2.72
        lt = a['label'].upper()
        lw_ = tw(lt, F('disp'), 18, 1.2) + 0.9
        tab = snip(s, x0 + (w - lw_) / 2, y, lw_, 0.5, style='solid', cut=0.14, lw=1.25)
        label(tab, lt, size=18, font=F('disp'), color=P['gold_lt'], spacing=1.2)
        qc = snip(s, x0, y + 0.68, w, 0.92, style='dark', cut=0.2)
        label(qc, a['question'], size=13.5, font=F('semi'), color=P['cream'], line_sp=1.12, margin=(0.3, 0.05))
        st = star(s, ctx, x0 + w / 2, y + 1.78, 0.32, 'gold')
        an = snip(s, x0 + 0.6, y + 1.97, w - 1.2, 0.5, style='light', cut=0.12)
        label(an, a['answer'], size=12, font=F('medium'), color=P['ink'])
        groups.append([tab, qc, st, an])
    page_no(s, ctx['n'])
    K.anim(s, em[1], 'turn', 0.0, 1.0)
    K.anim(s, em[0], 'fade', 0.0, 1.0)
    K.anims(s, hd, 'wipe_l', 0.1, 0.12, 0.6)
    t = 0.6
    for g in groups:
        t = K.anims(s, g, 'rise', t, 0.15, 0.45) + 0.1
    return s


# ================================================================== 6. tree diagram + portrait
def tree(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    rb = ribbon(s, ctx, 'tr')
    hero = portrait(s, ctx, c['portrait'], 7.45, 0.85, 5.9, 6.65)
    hd = header(s, c.get('part', ''), c['title'], max_w=8.4)
    cx, cw = 3.75, 2.75
    groups = []
    for i, b in enumerate(c['branches']):
        y = 1.65 + i * 2.15
        root = snip(s, cx - 1.55, y, 3.1, 0.52, style='solid', cut=0.14, lw=1.25)
        label(root, b['label'].upper(), size=16, font=F('disp'), color=P['gold_lt'], spacing=1)
        xs = [cx - 1.45, cx + 1.45]
        ln = [K.line(s, cx, y + 0.52, cx, y + 0.78, P['gold'], 1.25),
              K.line(s, xs[0], y + 0.78, xs[1], y + 0.78, P['gold'], 1.25)]
        kids = []
        for xc, t in zip(xs, b['children']):
            ln.append(K.line(s, xc, y + 0.78, xc, y + 0.98, P['gold'], 1.25))
            kd = snip(s, xc - cw / 2, y + 0.98, cw, 0.78, style='dark', cut=0.16)
            label(kd, t, size=13, font=F('semi'), color=P['cream'], line_sp=1.1)
            kids.append(kd)
        groups.append((root, ln, kids))
    st = statement(s, ML, 6.42, SW - 2 * ML - 0.4, c['statement'], size=13)
    page_no(s, ctx['n'])
    K.anims(s, hero, 'fly_r', 0.0, 0.0, 0.9)
    K.anim(s, rb, 'wipe_l', 0.3, 0.8)
    K.anims(s, hd, 'wipe_l', 0.1, 0.12, 0.6)
    t = 0.5
    for root, ln, kids in groups:
        K.anim(s, root, 'zoom', t, 0.45)
        K.anims(s, ln, 'wipe_d', t + 0.3, 0.05, 0.35)
        K.anims(s, kids, 'rise', t + 0.5, 0.12, 0.45)
        t += 0.9
    K.anim(s, st, 'wipe_l', t, 0.6)
    return s


# ================================================================== 7. section
def section(prs, ctx, c):
    s = _new(prs, ctx, tr=1.4)
    bg(s, ctx, 'silk_dark')
    big = K.text(s, 5.6, 0.2, 7.8, 4.2, f'{c["num"]:02d}', size=270, font=F('disp'), outline=P['gold'],
                 outline_w=1.25, alpha=35, align='r', nm='!!bignum')
    md = emblem(s, ctx, 0.75, 0.95, 5.6, nm='!!medal', key='medal')
    lab = K.text(s, 6.4, 2.0, 6.4, 0.5, f'PHẦN {c["num"]}', size=24, font=F('disp'), color=P['gold'], spacing=4)
    title = c['title'].upper()
    size = 56
    while K.n_lines(title, F('disp'), size, 6.45) > 3 and size > 34:
        size -= 2
    nl = K.n_lines(title, F('disp'), size, 6.45)
    th = nl * size / 72 * 1.0 + 0.15
    tt = K.text(s, 6.4, 2.55, 6.5, th, title, size=size, font=F('disp'), color=P['gold_lt'], line_sp=0.92,
                nm='!!title')
    gold_text(tt)
    text_shadow(tt, alpha=60)
    rl = K.rect(s, 6.45, 2.55 + th + 0.15, 2.4, 0.04, fill=P['gold'])
    ds = K.text(s, 6.4, 2.55 + th + 0.35, 6.3, 1.2, c.get('desc', ''), size=14, font=F('body'), color=P['cream'],
                line_sp=1.2)
    dr = drape(s, ctx, 'br')
    K.anim(s, md[1], 'turn', 0.0, 1.1)
    K.anim(s, md[0], 'fade', 0.0, 1.0)
    K.anim(s, big, 'fade', 0.3, 0.9)
    K.anim(s, lab, 'wipe_l', 0.5, 0.5)
    K.anim(s, tt, 'zoom', 0.7, 0.8)
    K.anim(s, rl, 'wipe_l', 1.1, 0.4)
    K.anim(s, ds, 'fade', 1.3, 0.6)
    K.anim(s, dr, 'wipe_l', 0.2, 0.9)
    return s


# ================================================================== 8. three forms
def forms3(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    ht = c.get('header', 'Ba hình thức').upper()
    hw = tw(ht, F('disp'), 19, 2) + 1.2
    htab = snip(s, (SW - hw) / 2, 1.55, hw, 0.5, style='solid', cut=0.14, lw=1.25)
    label(htab, ht, size=19, font=F('disp'), color=P['gold_lt'], spacing=2)
    items = []
    n = len(c['items'])
    cw, gap = 3.0, 0.45
    x0 = (SW - (n * cw + (n - 1) * gap)) / 2
    for i, t in enumerate(c['items']):
        x = x0 + i * (cw + gap)
        ch = snip(s, x, 2.65, cw, 0.62, style='light', cut=0.14)
        label(ch, t, size=15, font=F('semi'), color=P['ink'])
        nb = num_badge(s, x + cw / 2, 2.52, i + 1, 0.5)
        items.append([ch, nb])
    ph = picture(s, ctx, c['image'], SW / 2 - 2.05, 3.65, 4.1, 2.55, focus=tuple(c.get('focus', (0.5, 0.5))), bw=2)
    notes = []
    for i, t in enumerate(c.get('notes', [])[:2]):
        x = ML if i == 0 else SW - ML - 3.75
        nt = snip(s, x, 4.0, 3.75, 1.2, style='dark', cut=0.2)
        label(nt, t, size=13.5, font=F('medium'), color=P['cream'], line_sp=1.12)
        notes.append(nt)
    cap = statement(s, SW / 2 - 3.6, 6.45, 7.2, c['caption'], h=0.58, size=13)
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anim(s, htab, 'zoom', 0.3, 0.5)
    K.anims(s, items, 'rise', 0.55, 0.18, 0.45)
    K.anim(s, ph, 'zoom', 1.1, 0.7)
    K.anims(s, notes, 'fade', 1.4, 0.2, 0.5)
    K.anim(s, cap, 'wipe_l', 1.8, 0.6)
    return s


# ================================================================== 9. list with stars + two angled photos
def star_list(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'], max_w=8.0)
    items = c['items']
    n = len(items)
    h, gap = (0.66, 0.2) if n <= 5 else (0.6, 0.14)
    y0 = 1.75 + max(0, (5 - n)) * 0.2
    rows = []
    for i, t in enumerate(items):
        y = y0 + i * (h + gap)
        rw = snip(s, ML, y, 6.65, h, style='dark', cut=0.14)
        label(rw, t, size=12.5, color=P['cream'], align='l', margin=(0.25, 0.04), line_sp=1.08, margin_r=0.75)
        st = star(s, ctx, ML + 6.65 - 0.36, y + h / 2, 0.4, 'red')
        rows.append([rw, st])
    ims = c['images']
    p1 = picture(s, ctx, ims[0], 7.75, 1.55, 5.0, 2.65, nm='!!ph1', focus=tuple(c.get('focus1', (0.5, 0.5))), bw=2)
    p2 = picture(s, ctx, ims[1], 8.35, 4.45, 4.4, 2.45, nm='!!ph2', focus=tuple(c.get('focus2', (0.5, 0.5))), bw=2)
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anims(s, rows, 'wipe_l', 0.4, 0.15, 0.5)
    K.anim(s, p1, 'fly_r', 0.5, 0.7)
    K.anim(s, p2, 'fly_r', 0.75, 0.7)
    return s


# ================================================================== 10. hexagon photos + list with chevrons
def hex_list(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    ims = c['images']
    pos = [(0.55, 1.6), (2.95, 3.0), (0.55, 4.4)]
    hexes = []
    for (x, y), key in zip(pos, ims):
        hx = picture(s, ctx, key, x, y, 3.0, 2.6, geom='hexagon', bw=2.25)
        hexes.append(hx)
    items = c['items']
    n = len(items)
    h, gap = 0.72, 0.24
    y0 = 1.7 + max(0, 5 - n) * 0.25
    rows = []
    for i, t in enumerate(items):
        y = y0 + i * (h + gap)
        rw = snip(s, 6.25, y, SW - ML - 6.25, h, style='dark', cut=0.16)
        label(rw, t, size=13, color=P['cream'], align='l', margin=(0.3, 0.04), line_sp=1.08, margin_r=0.8)
        ch = chevron_icon(s, SW - ML - 0.45, y + h / 2, 0.34)
        rows.append([rw, ch])
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anims(s, hexes, 'zoom', 0.3, 0.2, 0.6)
    K.anims(s, rows, 'wipe_l', 0.6, 0.15, 0.5)
    return s


# ================================================================== 11. photo strip + caption cards
def strip(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    ims = c['images']
    n = len(ims)
    gap = 0.12
    w = (SW - 2 * ML - gap * (n - 1)) / n
    phs = []
    for i, key in enumerate(ims):
        phs.append(picture(s, ctx, key, ML + i * (w + gap), 1.6, w, 2.55, bw=1.5,
                           focus=tuple(c.get('focus', {}).get(key, (0.5, 0.5)))))
    caps = c['captions']
    cards = []
    per_row = 3 if len(caps) > 4 else len(caps)
    cw = (SW - 2 * ML - 0.3 * (per_row - 1)) / per_row
    for i, t in enumerate(caps):
        r, k = divmod(i, per_row)
        row_n = min(per_row, len(caps) - r * per_row)
        off = (per_row - row_n) * (cw + 0.3) / 2
        x = ML + off + k * (cw + 0.3)
        y = 4.55 + r * 1.1
        cd = snip(s, x, y, cw, 0.88, style='dark', cut=0.16)
        label(cd, t, size=12.5, font=F('medium'), color=P['cream'], line_sp=1.1)
        cards.append(cd)
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anims(s, phs, 'wipe_l', 0.35, 0.2, 0.6)
    K.anims(s, cards, 'rise', 1.0, 0.13, 0.45)
    return s


# ================================================================== 12. list + big medal
def medal_list(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    md = emblem(s, ctx, 7.15, 1.15, 5.6, nm='!!medal', key='medal')
    hd = header(s, c.get('part', ''), c['title'], max_w=7.0)
    rows = []
    for i, (ic, t) in enumerate(c['items']):
        y = 1.75 + i * 1.05
        rw = snip(s, ML, y, 5.6, 0.85, style='dark', cut=0.16)
        label(rw, t, size=12.5, color=P['cream'], align='l', margin=(0.25, 0.04), line_sp=1.1)
        bd = K.icon_badge(s, ic, ML + 5.6 + 0.5, y + 0.43, 0.62, P['red_dk'], P['gold_lt'], icon_scale=0.55)
        gold_line(bd[0], 1.5)
        rows.append([rw] + bd)
    y = 1.75 + len(c['items']) * 1.05 + 0.25
    sub = c.get('sub', '').upper()
    st = K.text(s, ML, y, 5.6, 0.4, sub, size=15, font=F('disp'), color=P['gold_lt'], align='c', spacing=1.5)
    rl = K.rect(s, ML + 0.6, y + 0.45, 4.4, 0.025, fill=P['gold'])
    br = []
    bw = 2.5
    for i, t in enumerate(c.get('branches', [])[:2]):
        x = ML + 0.2 + i * (bw + 0.4)
        ln = K.line(s, x + bw / 2, y + 0.47, x + bw / 2, y + 0.8, P['gold'], 1.25)
        ch = snip(s, x, y + 0.8, bw, 0.62, style='light', cut=0.14)
        label(ch, t, size=13, font=F('semi'), color=P['ink'])
        br.append([ln, ch])
    page_no(s, ctx['n'])
    K.anim(s, md[1], 'turn', 0.0, 1.0)
    K.anim(s, md[0], 'fade', 0.0, 1.0)
    K.anims(s, hd, 'wipe_l', 0.1, 0.12, 0.6)
    K.anims(s, rows, 'wipe_l', 0.5, 0.2, 0.5)
    K.anims(s, [st, rl], 'fade', 1.0, 0.1, 0.5)
    K.anims(s, br, 'rise', 1.3, 0.15, 0.45)
    return s


# ================================================================== 13. two concept groups
def branches2(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    groups = []
    for i, g in enumerate(c['groups'][:2]):
        cx = 3.55 if i == 0 else SW - 3.55
        st = star(s, ctx, cx, 1.95, 0.55, 'gold')
        top = snip(s, cx - 2.35, 2.3, 4.7, 0.78, style='solid', cut=0.18, lw=1.25)
        label(top, g['title'], size=17, font=F('semi'), color=P['gold_lt'])
        kids = g['children'][:2]
        kw = 2.2
        xs = [cx - 1.2, cx + 1.2]
        ln = [K.line(s, cx, 3.08, cx, 3.33, P['gold'], 1.25), K.line(s, xs[0], 3.33, xs[1], 3.33, P['gold'], 1.25)]
        cards = []
        for xc, t in zip(xs, kids):
            ln.append(K.line(s, xc, 3.33, xc, 3.55, P['gold'], 1.25))
            kd = snip(s, xc - kw / 2, 3.55, kw, 1.55, style='light', cut=0.16)
            label(kd, t, size=12, font=F('medium'), color=P['ink'], line_sp=1.1, margin=(0.14, 0.06))
            cards.append(kd)
        groups.append(([st, top], ln, cards))
    em = emblem(s, ctx, SW / 2 - 0.85, 5.25, 1.95)
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    t = 0.4
    for head, ln, cards in groups:
        K.anims(s, head, 'zoom', t, 0.1, 0.5)
        K.anims(s, ln, 'wipe_d', t + 0.35, 0.05, 0.3)
        K.anims(s, cards, 'rise', t + 0.55, 0.12, 0.45)
        t += 0.8
    K.anim(s, em[1], 'turn', t, 0.9)
    K.anim(s, em[0], 'fade', t, 0.9)
    return s


# ================================================================== 14. three columns with icons + photos
def columns3(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    cols = c['cols'][:3]
    n = len(cols)
    gap = 0.3
    w = (SW - 2 * ML - gap * (n - 1)) / n
    out = []
    for i, col in enumerate(cols):
        x = ML + i * (w + gap)
        y = 1.95
        cd = snip(s, x, y, w, 5.05, style='dark', cut=0.25, lw=1.25)
        bd = K.icon_badge(s, col['icon'], x + w / 2, y, 0.72, P['red_dk'], P['gold_lt'], icon_scale=0.55)
        gold_line(bd[0], 1.75)
        tt = K.text(s, x + 0.2, y + 0.48, w - 0.4, 0.4, col['title'], size=15, font=F('semi'), color=P['gold_lt'],
                    align='c')
        tx = K.text(s, x + 0.3, y + 0.92, w - 0.6, 1.25, col['text'], size=11.5, font=F('body'), color=P['cream'],
                    align='c', line_sp=1.15)
        ph = picture(s, ctx, col['image'], x + 0.25, y + 2.3, w - 0.5, 2.5, bw=1.5,
                     focus=tuple(col.get('focus', (0.5, 0.5))))
        out.append([cd] + bd + [tt, tx, ph])
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anims(s, out, 'rise', 0.4, 0.25, 0.6)
    return s


# ================================================================== 15. two concept cards + quote bar
def compare_quote(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    w = (SW - 2 * ML - 0.35) / 2
    cards = []
    for i, cd_ in enumerate(c['cards'][:2]):
        x = ML + i * (w + 0.35)
        y = 1.85
        cd = snip(s, x, y, w, 2.4, style='dark', cut=0.22, lw=1.25)
        tt = cd_['title']
        tw_ = tw(tt, F('semi'), 14) + 1.0
        tab = snip(s, x + 0.25, y - 0.22, tw_, 0.48, style='solid', cut=0.12, lw=1.25)
        label(tab, tt, size=14, font=F('semi'), color=P['gold_lt'], align='l', margin=(0.2, 0.02))
        st = star(s, ctx, x + 0.25 + tw_ - 0.28, y + 0.02, 0.32, 'gold')
        tx = K.text(s, x + 0.3, y + 0.5, w - 0.6, 1.15, cd_['text'], size=13, font=F('body'), color=P['cream'],
                    line_sp=1.15)
        chips = []
        cx = x + 0.3
        for t in cd_.get('chips', []):
            cw = K.text_w(t, F('medium'), 11.5) + 0.5
            ch = snip(s, cx, y + 1.62, cw, 0.46, style='solid', cut=0.1)
            label(ch, t, size=11.5, font=F('medium'), color=P['cream'])
            chips.append(ch)
            cx += cw + 0.2
        cards.append([cd, tab, st, tx] + chips)
    qb = snip(s, ML + 0.6, 4.95, SW - 2 * ML - 2.4, 1.15, style='dark', cut=0.25, lw=1.25)
    label(qb, c['quote'], size=17, font=F('italic'), color=P['cream'], margin=(1.0, 0.05))
    for r in qb._element.iter(K.qn('a:rPr')):
        r.set('i', '1')
    q1 = K.picture(s, art(ctx, 'quote_open'), ML + 0.85, 4.75, 0.75, 0.75, fit='contain')
    q2 = K.picture(s, art(ctx, 'quote_close'), SW - ML - 2.6, 5.6, 0.75, 0.75, fit='contain')
    em = emblem(s, ctx, SW - ML - 1.45, 4.9, 1.55)
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anims(s, cards, 'rise', 0.4, 0.25, 0.55)
    K.anims(s, [qb, q1, q2], 'zoom', 1.1, 0.1, 0.5)
    K.anim(s, em[1], 'turn', 1.4, 0.8)
    K.anim(s, em[0], 'fade', 1.4, 0.8)
    return s


# ================================================================== 16. question + two positions + portrait
def question_portrait(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    rb = ribbon(s, ctx, 'tr')
    hero = portrait(s, ctx, c['portrait'], 7.9, 0.6, 5.4, 6.9)
    dr = drape(s, ctx, 'br')
    hd = header(s, c.get('part', ''), c['title'], max_w=8.0)
    q = K.text(s, ML, 1.6, 7.6, 0.6, c['question'], size=19, font=F('italic'), italic=True, color=P['gold_lt'],
               anchor='m')
    text_shadow(q, alpha=45)
    tx = K.text(s, ML, 2.25, 7.4, 0.6, c.get('text', ''), size=12.5, font=F('body'), color=P['cream'], line_sp=1.15)
    fr = snip(s, ML + 0.2, 3.35, 6.6, 2.05, style='line', cut=0.3, lw=1.5)
    ft = c.get('frame_title', 'Hai lập trường').upper()
    fw = tw(ft, F('disp'), 16, 1.5) + 0.9
    tab = snip(s, ML + 0.2 + (6.6 - fw) / 2, 3.1, fw, 0.5, style='solid', cut=0.14, lw=1.25)
    label(tab, ft, size=16, font=F('disp'), color=P['gold_lt'], spacing=1.5)
    opts = []
    for i, t in enumerate(c['options'][:2]):
        x = ML + 0.65 + i * 3.0
        op = snip(s, x, 4.0, 2.75, 0.95, style='dark', cut=0.18, lw=1.25)
        label(op, t, size=15, font=F('semi'), color=P['cream'])
        opts.append(op)
    tag = name_tag(s, ctx, 9.2, 5.75, c['name']) if c.get('name') else []
    page_no(s, ctx['n'])
    K.anims(s, hero, 'fly_r', 0.0, 0.0, 0.9)
    K.anim(s, rb, 'wipe_l', 0.3, 0.8)
    K.anim(s, dr, 'wipe_l', 0.3, 0.8)
    K.anims(s, hd, 'wipe_l', 0.1, 0.12, 0.6)
    K.anim(s, q, 'fade', 0.5, 0.6)
    K.anim(s, tx, 'fade', 0.7, 0.5)
    K.anims(s, [fr, tab], 'zoom', 0.9, 0.1, 0.5)
    K.anims(s, opts, 'rise', 1.2, 0.2, 0.45)
    K.anims(s, tag, 'wipe_l', 1.5, 0.1, 0.5)
    return s


# ================================================================== 17. two people
def people(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'], max_w=8.6)
    em = emblem(s, ctx, SW - ML - 1.6, 1.25, 1.6)
    lead = []
    if c.get('lead_label'):
        st = star(s, ctx, ML + 0.25, 1.95, 0.5, 'red')
        lw_ = K.text_w(c['lead_label'], F('semi'), 14) + 0.2
        ll = K.text(s, ML + 0.6, 1.7, lw_, 0.5, c['lead_label'], size=14, font=F('semi'), color=P['gold_lt'],
                    anchor='m')
        ar = chevron_icon(s, ML + 0.8 + lw_, 1.95, 0.28)
        ar.rotation = 0
        lt = K.text(s, ML + 1.15 + lw_, 1.68, 10.2 - lw_ - 1.3, 0.6, c['lead_text'], size=12, font=F('body'),
                    color=P['cream'], anchor='m', line_sp=1.1)
        lead = [st, ll, ar, lt]
    persons = []
    for i, pr in enumerate(c['persons'][:2]):
        x0 = 0.35 + i * 6.3
        hero = portrait(s, ctx, pr['cut'], x0, 2.75, 3.2, 4.75, nm=f'!!person{i}')
        tag = name_tag(s, ctx, x0 + 3.0, 3.15, pr['name'].upper(), nm=f'!!pname{i}', size=16)
        tx = K.text(s, x0 + 3.0, 3.85, 3.0, 2.9, '\n'.join(pr['lines']), size=12, font=F('body'), color=P['cream'],
                    line_sp=1.15, space_after=6, bullets=True, bullet_color=P['gold'])
        persons.append((hero, tag, tx))
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anim(s, em[1], 'turn', 0.2, 0.8)
    K.anim(s, em[0], 'fade', 0.2, 0.8)
    K.anims(s, lead, 'fade', 0.5, 0.1, 0.5)
    t = 0.9
    for hero, tag, tx in persons:
        K.anims(s, hero, 'rise', t, 0.0, 0.7)
        K.anims(s, tag, 'wipe_l', t + 0.4, 0.1, 0.45)
        K.anim(s, tx, 'fade', t + 0.6, 0.5)
        t += 0.7
    return s


# ================================================================== 18. conclusion with portrait
def conclusion(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hero = portrait(s, ctx, c['portrait'], -0.3, 2.85, 5.4, 4.65)
    dr = drape(s, ctx, 'bl')
    hd = header(s, c.get('part', ''), c['title'], max_w=9.4)
    qm = K.picture(s, art(ctx, 'quote_close'), SW - ML - 1.0, 0.45, 0.95, 0.95, fit='contain')
    x0, w = 5.0, SW - ML - 5.0
    lead = K.text(s, ML, 1.55, SW - 2 * ML - 0.4, 1.0, c['lead'], size=15, font=F('italic'), italic=True,
                  color=P['gold_lt'], anchor='m', line_sp=1.15)
    text_shadow(lead, alpha=40)
    rows = []
    items = c['items']
    for i, t in enumerate(items):
        y = 2.8 + i * 0.8
        rw = snip(s, x0, y, w, 0.62, style='dark', cut=0.14)
        label(rw, t, size=12.5, color=P['cream'], align='l', margin=(0.3, 0.04), margin_r=0.75)
        ch = chevron_icon(s, x0 + w - 0.4, y + 0.31, 0.3)
        rows.append([rw, ch])
    st = statement(s, x0 - 0.3, 2.8 + len(items) * 0.8 + 0.2, w + 0.3, c['statement'], size=12.5, italic=False)
    page_no(s, ctx['n'])
    K.anims(s, hero, 'fly_l', 0.0, 0.0, 0.9)
    K.anim(s, dr, 'wipe_r', 0.3, 0.8)
    K.anims(s, hd, 'wipe_l', 0.1, 0.12, 0.6)
    K.anim(s, qm, 'zoom', 0.4, 0.5)
    K.anim(s, lead, 'fade', 0.6, 0.6)
    K.anims(s, rows, 'wipe_l', 0.9, 0.15, 0.45)
    K.anim(s, st, 'zoom', 0.9 + len(items) * 0.15 + 0.2, 0.6)
    return s


# ================================================================== 19. timeline
def timeline(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    ev = c['events']
    n = len(ev)
    x0, x1 = ML + 0.2, SW - ML - 0.2
    step = (x1 - x0) / n
    y = 2.95
    rail = K.rect(s, x0 - 0.2, y - 0.02, x1 - x0 + 0.4, 0.04)
    K.grad_fill(rail, [(0, P['gold'], 0), (8, P['gold'], 100), (92, P['gold'], 100), (100, P['gold'], 0)], angle=0)
    items = []
    for i, (year, tt, tx) in enumerate(ev):
        cx = x0 + step * (i + 0.5)
        yr = K.text(s, cx - step / 2, y - 1.05, step, 0.8, year, size=36, font=F('disp'), color=P['gold_lt'],
                    align='c', anchor='b')
        gold_text(yr)
        st = star(s, ctx, cx, y, 0.46, 'red')
        cw = step - 0.18
        cd = snip(s, cx - cw / 2, y + 0.45, cw, 2.15, style='dark', cut=0.2)
        t1 = K.text(s, cx - cw / 2 + 0.15, y + 0.6, cw - 0.3, 0.75, tt, size=13.5, font=F('semi'), color=P['gold_lt'],
                    align='c', anchor='m', line_sp=1.05)
        t2 = K.text(s, cx - cw / 2 + 0.15, y + 1.38, cw - 0.3, 1.7, tx, size=11.5, font=F('body'), color=P['cream'],
                    align='c', line_sp=1.15)
        items.append([yr, st, cd, t1, t2])
    dr = drape(s, ctx, 'wide')
    page_no(s, ctx['n'])
    K.anim(s, dr, 'wipe_l', 0.2, 0.9)
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anim(s, rail, 'wipe_l', 0.3, 1.0)
    K.anims(s, items, 'rise', 0.5, 0.2, 0.5)
    return s


# ================================================================== 20. chart + KPI cards
def chart(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    frame = snip(s, ML, 1.65, 8.2, 5.0, style='dark', cut=0.25, lw=1.25)
    ch = c['chart']
    series = [(nm, vals) for nm, vals in ch['series']]
    gf = K.chart_bar(s, ML + 0.25, 1.85, 7.7, 4.15, ch['cats'], series, colors=[P['gold'], P['gold_lt']],
                     gap=70, overlap=-10, dark=True, labels=True, num_fmt=ch.get('fmt', '0'), legend=True,
                     font_size=11, label_color=P['gold_lt'], max_v=ch.get('max'))
    _style_chart(gf)
    note = K.text(s, ML + 0.3, 6.05, 7.6, 0.45, c.get('note', ''), size=10.5, font=F('italic'), italic=True,
                  color=P['gold_lt'], anchor='m')
    kp = []
    for i, (v, u, t) in enumerate(c.get('kpis', [])[:3]):
        y = 1.65 + i * 1.75
        cd = snip(s, 9.15, y, SW - ML - 9.15, 1.5, style='dark', cut=0.2)
        vv = K.text(s, 9.4, y + 0.08, 3.2, 0.8, [[(v, {}), (' ' + u if u else '', {'size': 20})]], size=44,
                    font=F('disp'), color=P['gold_lt'], anchor='b')
        gold_text(vv)
        tt = K.text(s, 9.4, y + 0.88, SW - ML - 9.65, 0.55, t, size=11.5, font=F('body'), color=P['cream'],
                    line_sp=1.1)
        kp.append([cd, vv, tt])
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anim(s, frame, 'fade', 0.3, 0.5)
    K.anim(s, gf, 'wipe_u', 0.5, 0.9)
    K.anim(s, note, 'fade', 1.1, 0.5)
    K.anims(s, kp, 'fly_r', 0.6, 0.2, 0.6)
    return s


def _style_chart(gf):
    chart_ = gf.chart
    chart_.font.name = F('body')
    chart_.font.size = K.Pt(11)
    chart_.font.color.rgb = K.rgb(P['cream'])
    for ax in (chart_.category_axis, chart_.value_axis):
        ax.tick_labels.font.name = F('body')
        ax.tick_labels.font.color.rgb = K.rgb(P['cream'])
    tops = [(P['gold_lt'], P['gold']), ('FFF6E0', 'F2D9A0')]
    for i, ser in enumerate(chart_.plots[0].series):
        top, bot = tops[i % 2]
        spPr = ser._element.get_or_add_spPr()
        for el in list(spPr):
            spPr.remove(el)
        spPr.append(K.X(f'<a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="{top}"/></a:gs>'
                        f'<a:gs pos="100000"><a:srgbClr val="{bot}"/></a:gs></a:gsLst>'
                        f'<a:lin ang="5400000" scaled="0"/></a:gradFill>'))
        spPr.append(K.X('<a:ln><a:noFill/></a:ln>'))
    if chart_.has_legend:
        chart_.legend.font.color.rgb = K.rgb(P['cream'])
        chart_.legend.font.name = F('body')


# ================================================================== 21. table
def table_slide(prs, ctx, c):
    s = _new(prs, ctx)
    bg(s, ctx)
    hd = header(s, c.get('part', ''), c['title'])
    rows = [[str(v).upper() for v in c['rows'][0]]] + [list(r) for r in c['rows'][1:]]
    w = SW - 2 * ML
    col_w = c.get('col_w')
    if col_w:
        k = w / sum(col_w)
        col_w = [v * k for v in col_w]
    rh = min(0.95, 4.7 / len(rows))
    gf = K.table(s, ML, 1.75, w, rh * len(rows), rows, col_w=col_w, header_fill=P['red_deep'],
                 header_color=P['gold_lt'], body_fill=P['red_dk'], body_fill2='8C0B15', body_color=P['cream'],
                 line_color=P['gold_dk'], size=12, header_size=14, row_h=rh)
    tbl = gf.table
    for r, row in enumerate(tbl.rows):
        for ci, cell in enumerate(row.cells):
            for p in cell.text_frame.paragraphs:
                for run in p.runs:
                    rPr = run._r.get_or_add_rPr()
                    face = F('disp') if r == 0 else (F('semi') if ci == 0 else F('body'))
                    for tag in ('a:latin', 'a:ea', 'a:cs'):
                        el = rPr.find(K.qn(tag))
                        if el is not None:
                            el.set('typeface', face)
                    if r == 0:
                        rPr.set('spc', '120')
                        run.font.size = K.Pt(15)
                    if ci == 0 and r > 0:
                        run.font.color.rgb = K.rgb(P['gold_lt'])
    cap = K.text(s, ML, 1.75 + rh * len(rows) + 0.25, w, 0.45, c.get('caption', ''), size=11, font=F('italic'),
                 italic=True, color=P['gold_lt'])
    em = emblem(s, ctx, SW - ML - 1.2, SH - 1.45, 1.15)
    page_no(s, ctx['n'])
    K.anims(s, hd, 'wipe_l', 0.0, 0.12, 0.6)
    K.anim(s, gf, 'wipe_d', 0.4, 0.9)
    K.anim(s, cap, 'fade', 1.2, 0.5)
    K.anim(s, em[1], 'turn', 1.2, 0.8)
    K.anim(s, em[0], 'fade', 1.2, 0.8)
    return s


# ================================================================== 22. thanks
def thanks(prs, ctx, c):
    s = _new(prs, ctx, tr=1.4)
    bg(s, ctx, 'silk_cover')
    fl = emblem(s, ctx, 8.35, 0.2, 3.3, glow=False)[0]
    rb = ribbon(s, ctx, 'tr')
    hero = portrait(s, ctx, c['portrait'], 7.7, 0.7, 5.6, 6.8)
    dr = drape(s, ctx, 'br')
    kt = c.get('kicker', '').upper()
    kw = tw(kt, F('disp'), 14, 1.5) + 0.5
    kick = snip(s, ML, 1.35, kw, 0.46, style='line', cut=0.12, lw=1.0, nm='!!kicker')
    label(kick, kt, size=14, font=F('disp'), color=P['gold_lt'], spacing=1.5, margin=(0.2, 0.02))
    t = c.get('title', 'Xin cảm ơn').upper()
    size = 120
    while K.text_w(t, F('disp'), size) > 7.2 and size > 60:
        size -= 4
    tt = K.text(s, ML, 2.0, 7.6, size / 72 * 1.15, t, size=size, font=F('disp'), color=P['gold_lt'], nm='!!title',
                wrap=False)
    gold_text(tt)
    text_shadow(tt, alpha=60, blur=0.16, dist=0.07)
    sub = K.text(s, ML + 0.05, 2.0 + size / 72 * 1.15, 7.0, 0.55, c.get('sub', ''), size=20, font=F('italic'),
                 italic=True, color=P['cream'])
    pres = K.text(s, ML, SH - 1.15, 7.0, 0.75,
                  [[(c.get('presenter', '').upper(), {'font': F('disp'), 'size': 16, 'color': P['gold_lt'],
                                                        'spacing': 1.2})],
                   [(c.get('info', ''), {})]], size=11.5, font=F('body'), color=P['cream'], line_sp=1.15)
    K.anim(s, fl, 'turn', 0.0, 1.0)
    K.anims(s, hero, 'fly_r', 0.2, 0.0, 1.0)
    K.anim(s, dr, 'wipe_l', 0.5, 0.8)
    K.anim(s, rb, 'wipe_l', 0.6, 0.8)
    K.anim(s, kick, 'wipe_l', 0.6, 0.5)
    K.anim(s, tt, 'zoom', 0.8, 1.0)
    K.anim(s, sub, 'fade', 1.4, 0.6)
    K.anim(s, pres, 'fade', 1.6, 0.6)
    return s


# ================================================================== credits (hidden)
def credits(prs, ctx, c):
    s = _new(prs, ctx, kind='fade')
    s._element.set('show', '0')
    bg(s, ctx, 'silk_dark')
    K.text(s, ML, 0.5, 11, 0.6, 'NGUỒN HÌNH ẢNH', size=30, font=F('disp'), color=P['gold_lt'], spacing=2)
    K.text(s, ML, 1.15, 12, 0.5, 'Slide ẩn — không hiển thị khi trình chiếu. ' + c['intro'], size=10, font=F('body'),
           italic=True, color=P['cream'])
    lines = c['lines']
    half = (len(lines) + 1) // 2
    for col, chunk in enumerate((lines[:half], lines[half:])):
        K.text(s, ML + col * 6.1, 1.8, 5.9, 5.3, '\n'.join(chunk), size=8, font=F('body'), color=P['cream'],
               line_sp=1.05)
    return s
