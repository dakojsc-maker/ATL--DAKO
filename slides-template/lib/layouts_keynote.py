"""
Keynote layouts (dark green stage, 3D platform renders, Be Vietnam Pro superfamily) — first used for the Viện STP
profile deck (decks/vien-stp).

The five persistent 3D pieces — core (brand centrepiece) and four pillar platforms — appear on EVERY slide with the
same names (!!core, !!research, ...). Where a slide does not show a piece it is parked just outside the canvas, so the
Morph transition flies pieces in, out and between arrangements (cluster → row → close-up → cards → cluster).
Each layout: fn(prs, ctx, c) -> slide.  ctx = dict(n, art{key: path}, img{key: path}, brand{...})
"""
import re

import pptkit as K
from pptx.enum.shapes import MSO_SHAPE

SW, SH, ML = K.SW, K.SH, 0.75
C = dict(bg='04120C', deep='0B2C1C', lime='8FD11E', lime2='7FC211', green='207D08', white='FFFFFF', text='C9D8CE',
         muted='7E9A88', red='E5252A', glass='FFFFFF', line='2E5A40', ink='0D2B1C')
FONTS = {
    'black': ('Be Vietnam Pro Black', 'keynote/BeVietnamPro-Black.ttf'),
    'xbold': ('Be Vietnam Pro ExtraBold', 'keynote/BeVietnamPro-ExtraBold.ttf'),
    'semi': ('Be Vietnam Pro SemiBold', 'keynote/BeVietnamPro-SemiBold.ttf'),
    'medium': ('Be Vietnam Pro Medium', 'keynote/BeVietnamPro-Medium.ttf'),
    'body': ('Be Vietnam Pro', 'keynote/BeVietnamPro-Regular.ttf'),
    'light': ('Be Vietnam Pro Light', 'keynote/BeVietnamPro-Light.ttf'),
    'thin': ('Be Vietnam Pro Thin', 'keynote/BeVietnamPro-Thin.ttf'),
}
PIECES = ('core', 'research', 'training', 'trace', 'iot')
ASPECT = 1300 / 1400            # h / w of the platform renders
PCX, PCY = 0.5, 0.593           # platform top-centre inside the render (fractions)
PARK = {'core': (SW / 2, -3.2, 3.0), 'research': (-2.4, 4.4, 2.6), 'training': (SW * 0.3, -2.6, 2.6),
        'trace': (SW + 2.4, 4.4, 2.6), 'iot': (SW * 0.7, SH + 2.6, 2.6)}


def F(role):
    return FONTS[role][0]


def register():
    K.THEMES['keynote'] = dict(
        name='Keynote', key='keynote', bg_light=C['bg'], bg_dark=C['bg'], ink=C['white'], text=C['text'],
        muted=C['muted'], soft=C['deep'], card=C['deep'], card2=C['deep'], accent=C['lime'], accent_ink=C['bg'],
        violet=C['lime2'], hot=C['red'], up=C['lime'], line=C['line'], chart=[C['lime'], 'E8F5DC', C['green'], C['red']],
        blob_light=[(C['lime'], 20)], blob_dark=[(C['lime'], 20)], tint=C['bg'], grid_dark='1E4430', row_alt=C['deep'])
    K.set_theme('keynote')
    for face, fname in FONTS.values():
        K.FONT_FILES[face] = fname


# ------------------------------------------------------------------ basics
def _new(prs, ctx, bg='bg_right', tr=1.4):
    ctx['n'] += 1
    s = K.blank_slide(prs, True)
    if ctx['n'] > 1:
        K.morph(s, tr)
    K.picture(s, ctx['art'][bg], 0, 0, SW, SH, nm='!!bg')
    return s


def pic(ctx, key):
    for k in ('art', 'img'):
        if key in ctx[k]:
            return ctx[k][key]
    import content_io as CIO
    return CIO.photo_path(key)


def runs(text, size, font='body', color=None, hi=None, hi_font=None):
    """'**word**' → highlighted run (lime, heavier)."""
    color = color or C['white']
    paras = []
    for para in text.split('\n'):
        rr = []
        for i, part in enumerate(re.split(r'\*\*', para)):
            if part:
                rr.append((part, {'color': hi or C['lime'], 'font': F(hi_font or font)}) if i % 2 else (part, {}))
        paras.append(rr or [''])
    return paras


def text(s, x, y, w, h, t, size, font='body', color=None, align='l', anchor='t', line_sp=1.15, space_after=0,
         nm=None, spacing=None, hi=None, hi_font=None, wrap=True):
    return K.text(s, x, y, w, h, runs(t, size, font, color, hi, hi_font), size=size, font=F(font),
                  color=color or C['white'], align=align, anchor=anchor, line_sp=line_sp, space_after=space_after,
                  nm=nm, spacing=spacing, wrap=wrap)


def fit(t, role, size, w, lo=14):
    lines = t.replace('**', '').split('\n')
    while size > lo and max(K.text_w(x, F(role), size) for x in lines) > w:
        size -= 1
    return size


def heading(s, kicker, title, x=ML, y=0.55, w=8.6, size=36, lead=None, lead_w=None, max_lines=2):
    """Kicker (lime caps) + title (ExtraBold, **highlight**) + optional lead. Returns (shapes, bottom y)."""
    out = []
    if kicker:
        out.append(text(s, x, y, w, 0.3, kicker.upper(), 11.5, 'semi', C['lime'], spacing=2.5, nm='!!kicker'))
        y += 0.38
    plain = title.replace('**', '')
    sz = size
    while sz > 24 and K.n_lines(plain, F('xbold'), sz, w - 0.1) > max_lines:
        sz -= 1
    nl = K.n_lines(plain, F('xbold'), sz, w - 0.1)
    th = sz / 72 * 1.12 * nl + 0.08
    out.append(text(s, x, y, w, th, title, sz, 'xbold', line_sp=1.0, nm='!!title'))
    y += th + 0.1
    if lead:
        lw = lead_w or w
        n = max(1, K.n_lines(lead.replace('**', ''), F('light'), 16, lw))
        lh = n * 16 / 72 * 1.3 + 0.05
        out.append(text(s, x, y, lw, lh, lead, 16, 'light', C['text'], line_sp=1.18, nm='!!lead', hi_font='medium'))
        y += lh + 0.1
    return out, y


def brand_mark(s, ctx):
    lg = K.picture(s, ctx['art']['logo'], SW - ML - 1.62, 0.42, 0.46, 0.46, fit='contain', nm='!!logo')
    tx = text(s, SW - ML - 1.1, 0.42, 1.1, 0.46, 'VIỆN STP', 11, 'semi', C['white'], anchor='m', spacing=2.5,
              nm='!!logotext', wrap=False)
    pg = text(s, SW - ML - 0.8, SH - 0.48, 0.8, 0.3, f'{ctx["n"]:02d}', 10, 'medium', C['muted'], align='r')
    return [lg, tx, pg]


def glass(s, x, y, w, h, radius=0.16, alpha=7, line_alpha=16, nm=None, fill=None):
    return K.rect(s, x, y, w, h, fill=fill or C['glass'], alpha=alpha, line=C['white'], lw=0.75, line_alpha=line_alpha,
                  radius=radius, nm=nm)


def icon_ring(s, ic, cx, cy, d=0.62, color=None):
    color = color or C['lime']
    r = K.oval(s, cx - d / 2, cy - d / 2, d, fill=color, alpha=12, line=color, lw=1.25)
    i = K.icon(s, ic, cx - d * 0.28, cy - d * 0.28, d * 0.56, color)
    return [r, i]


def chip(s, x, y, label, size=12.5, h=0.42, color=None, nm=None):
    w = K.text_w(label, F('medium'), size) + 0.5
    b = glass(s, x, y, w, h, radius=h / 2, alpha=8, line_alpha=28, nm=nm)
    t = text(s, x, y, w, h, label, size, 'medium', color or C['white'], align='c', anchor='m', wrap=False)
    return [b, t], w


def photo(s, ctx, key, x, y, w, h, focus=(0.5, 0.5), radius=0.16, caption=None, nm=None, cap_size=13):
    p = K.picture(s, pic(ctx, key), x, y, w, h, radius=radius, focus=tuple(focus), nm=nm)
    K.set_line(p, C['lime'], 0.75, 45)
    out = [p]
    if caption:
        gh = min(h * 0.5, 1.0)
        g = K.rect(s, x, y + h - gh, w, gh, shp=MSO_SHAPE.ROUND_2_SAME_RECTANGLE, rot=180)
        g.adjustments[0] = min(0.5, radius / gh)
        K.grad_fill(g, [(0, C['bg'], 85), (100, C['bg'], 0)], angle=90)
        out += [g, text(s, x + 0.18, y + h - 0.52, w - 0.36, 0.42, caption, cap_size, 'semi', anchor='m', wrap=False)]
    return out


# ------------------------------------------------------------------ the persistent 3D pieces
def _place(s, ctx, key, cx, cy, w, glow=True):
    h = w * ASPECT
    out = []
    if glow:
        out.append(K.glow_img(s, cx, cy + w * 0.06, w * 1.05, C['lime2'], 30, nm=f'!!glow_{key}'))
    out.append(K.picture(s, ctx['art'][key], cx - w * PCX, cy - h * PCY, w, h, nm=f'!!{key}'))
    return out


def stage(s, ctx, show, links=None):
    """show = {key: (cx, cy, w)} for pieces on stage; the rest are parked off-canvas. Back-to-front order.
    links = [(key_a, key_b)] glowing lines between platform centres (drawn behind)."""
    placed = {}
    for k in PIECES:
        if k not in show:
            _place(s, ctx, k, *PARK[k], glow=False)
    lines = []
    for a, b in links or []:
        (x1, y1, _), (x2, y2, _) = show[a], show[b]
        ln = K.line(s, x1, y1, x2, y2, C['lime2'], 2.0, alpha=70, nm=f'!!link_{a}_{b}')
        K.glow(ln, 0.08, C['lime2'], 45)
        lines.append(ln)
    for k in sorted(show, key=lambda k: show[k][1]):
        placed[k] = _place(s, ctx, k, *show[k])
    return placed, lines


def cluster(cx, cy, core_w, w, a, b):
    """Iso ring: research (−X, up-left), training (+Y, up-right), trace (+X, down-right), iot (−Y, down-left)."""
    return {'core': (cx, cy, core_w), 'research': (cx - a, cy - b, w), 'training': (cx + a, cy - b, w),
            'trace': (cx + a, cy + b, w), 'iot': (cx - a, cy + b, w)}


LINKS = [('core', 'research'), ('core', 'training'), ('core', 'trace'), ('core', 'iot')]


# ================================================================== 1. cover
def cover(prs, ctx, c):
    s = _new(prs, ctx, 'bg_right')
    pl, lines = stage(s, ctx, cluster(9.95, 3.95, 3.5, 2.15, 2.3, 1.22), LINKS)
    k = text(s, ML, 1.0, 5.8, 0.3, c.get('kicker', '').upper(), 11.5, 'semi', C['lime'], spacing=2.5, nm='!!kicker')
    t = c['title']
    sz = fit(t, 'xbold', 50, 5.7, 34)
    nl = t.count('\n') + 1
    th = sz / 72 * 1.08 * nl + 0.1
    tt = text(s, ML, 1.45, 6.2, th, t, sz, 'xbold', line_sp=0.98, nm='!!title')
    ld = text(s, ML, 1.55 + th, 5.6, 1.2, c.get('lead', ''), 16, 'light', C['text'], line_sp=1.2, nm='!!lead',
              hi_font='medium')
    lg = K.picture(s, ctx['art']['logo'], ML, SH - 1.25, 0.62, 0.62, fit='contain', nm='!!logo')
    ft = text(s, ML + 0.78, SH - 1.25, 5.2, 0.62, c.get('footer', ''), 11.5, 'medium', C['text'], anchor='m',
              line_sp=1.1, nm='!!footer')
    K.anim(s, k, 'fade', 0.2, 0.6)
    K.anim(s, tt, 'rise', 0.4, 0.9)
    K.anim(s, ld, 'fade', 0.9, 0.7)
    K.anims(s, [lg, ft], 'fade', 1.2, 0.1, 0.6)
    order = [pl['core']] + [pl[x] for x in ('research', 'training', 'trace', 'iot')]
    K.anims(s, order, 'zoom', 0.3, 0.18, 0.7)
    K.anims(s, lines, 'fade', 1.1, 0.08, 0.5)
    return s


# ================================================================== 2. statement (about)
def statement(prs, ctx, c):
    s = _new(prs, ctx, 'bg_right')
    stage(s, ctx, {'core': (10.05, 4.35, 4.7)})
    bm = brand_mark(s, ctx)
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=6.7, size=30, lead=c.get('lead'), lead_w=6.4)
    cards = []
    items = c.get('items', [])[:3]
    rh, gap = 0.82, 0.16
    cy0 = max(y + 0.3, SH - 0.65 - len(items) * (rh + gap))
    for i, (ic, t1, t2) in enumerate(items):
        yy = cy0 + i * (rh + gap)
        g = glass(s, ML, yy, 6.6, rh)
        r = icon_ring(s, ic, ML + 0.48, yy + rh / 2, 0.54)
        a = text(s, ML + 0.95, yy + 0.07, 5.5, 0.38, t1, 15, 'semi', anchor='m')
        b = text(s, ML + 0.95, yy + 0.43, 5.5, 0.34, t2, 12, 'body', C['text'], anchor='m', wrap=False)
        cards.append([g] + r + [a, b])
    K.anims(s, hd, 'fade', 0.1, 0.15, 0.6)
    K.anims(s, cards, 'rise', 0.7, 0.18, 0.5)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 3. ecosystem (4 pillars in a row under the core)
def ecosystem(prs, ctx, c):
    s = _new(prs, ctx, 'bg_center')
    xs = [SW / 2 + (k - 1.5) * 3.12 for k in range(4)]
    show = {'core': (SW / 2, 2.45, 2.75)}
    keys = ('research', 'training', 'trace', 'iot')
    for k, x in zip(keys, xs):
        show[k] = (x, 4.55, 2.55)
    pl, lines = stage(s, ctx, show, LINKS)
    hd, _ = heading(s, c.get('kicker', ''), c['title'], w=4.3, size=32)
    bm = brand_mark(s, ctx)
    labels = []
    for i, (k, x) in enumerate(zip(keys, xs)):
        it = c['items'][i]
        n = text(s, x - 1.45, 5.62, 2.9, 0.32, f'0{i + 1}', 13, 'xbold', C['lime'], align='c')
        a = text(s, x - 1.45, 5.92, 2.9, 0.42, it[0], 16, 'semi', align='c', anchor='m')
        b = text(s, x - 1.45, 6.34, 2.9, 0.75, it[1], 12, 'body', C['text'], align='c', line_sp=1.12)
        labels.append([n, a, b])
    K.anims(s, hd, 'fade', 0.1, 0.1, 0.5)
    K.anims(s, lines, 'wipe_d', 0.9, 0.08, 0.4)
    K.anims(s, labels, 'rise', 1.0, 0.15, 0.45)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 4. chapter opener (one pillar close-up)
def chapter(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_right'), tr=1.6)
    stage(s, ctx, {c['piece']: (8.95, 4.3, 6.3)})
    bm = brand_mark(s, ctx)
    num = text(s, ML - 0.05, 0.55, 4.5, 1.9, c['num'], 120, 'thin', C['lime'], line_sp=0.9, nm='!!bignum', wrap=False)
    kk = text(s, ML, 2.55, 5.5, 0.3, c.get('kicker', '').upper(), 11.5, 'semi', C['lime'], spacing=2.5,
              nm='!!kicker')
    t = c['title']
    sz = fit(t, 'xbold', 42, 5.3, 28)
    nl = t.count('\n') + 1
    th = sz / 72 * 1.05 * nl + 0.1
    tt = text(s, ML, 2.95, 5.6, th, t, sz, 'xbold', line_sp=0.98, nm='!!title')
    ld = text(s, ML, 3.1 + th, 5.0, 1.3, c.get('lead', ''), 16, 'light', C['text'], line_sp=1.2, nm='!!lead',
              hi_font='medium')
    chips, x = [], ML
    for lab in c.get('chips', []):
        ch, w = chip(s, x, SH - 1.2, lab, 12)
        chips.append(ch)
        x += w + 0.15
    K.anim(s, num, 'fade', 0.3, 0.8)
    K.anim(s, kk, 'fade', 0.5, 0.5)
    K.anim(s, tt, 'rise', 0.6, 0.8)
    K.anim(s, ld, 'fade', 1.0, 0.6)
    K.anims(s, chips, 'rise', 1.3, 0.12, 0.4)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 5. detail: 2×2 benefits + 3D piece / render
def detail(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_right'))
    img = c.get('image')
    if img in PIECES:
        stage(s, ctx, {img: (10.25, 4.55, 4.6)})
        aux = []
    else:
        stage(s, ctx, {})
        w = c.get('image_w', 4.9)
        h = w * ASPECT
        aux = [K.glow_img(s, 10.25, 4.6, w * 1.05, C['lime2'], 28),
               K.picture(s, pic(ctx, img), 10.25 - w * PCX, 4.6 - h * PCY, w, h, nm=f'!!aux_{img}')]
    bm = brand_mark(s, ctx)
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=7.4, size=32, lead=c.get('lead'), lead_w=7.0)
    big = []
    if c.get('numbers'):
        x = ML
        for v, lab in c['numbers']:
            big.append([text(s, x, y, 2.3, 0.95, v, 52, 'black', C['lime'], anchor='m', wrap=False),
                        text(s, x, y + 0.95, 2.3, 0.4, lab, 12.5, 'medium', C['text'])])
            x += 2.45
        y += 1.55
    items = c['items'][:4]
    cols = 2
    gw = (7.3 - 0.25) / cols
    rows = (len(items) + 1) // cols
    gh = min(1.95, (SH - 0.55 - max(y, 2.4) - 0.2 * (rows - 1)) / rows)
    y0 = max(y + 0.05, 2.4)
    cells = []
    for i, (ic, t1, t2) in enumerate(items):
        x = ML + (i % cols) * (gw + 0.25)
        yy = y0 + (i // cols) * (gh + 0.2)
        g = glass(s, x, yy, gw, gh)
        r = icon_ring(s, ic, x + 0.5, yy + 0.5, 0.58)
        a = text(s, x + 0.95, yy + 0.2, gw - 1.1, 0.6, t1, fit(t1, 'semi', 15.5, gw - 1.2, 13.5), 'semi',
                 anchor='m', line_sp=1.0)
        b = text(s, x + 0.28, yy + 0.92, gw - 0.5, gh - 0.95, t2, 12.5, 'body', C['text'], line_sp=1.15)
        cells.append([g] + r + [a, b])
    K.anims(s, hd, 'fade', 0.1, 0.12, 0.5)
    if aux:
        K.anims(s, aux, 'zoom', 0.2, 0.1, 0.8)
    K.anims(s, big, 'zoom', 0.6, 0.15, 0.45)
    K.anims(s, cells, 'rise', 0.7, 0.15, 0.45)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 6. steps: glowing process line
def steps(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_center'))
    show = {}
    if c.get('piece'):
        show[c['piece']] = (11.2, 1.65, 2.5)
    stage(s, ctx, show)
    bm = brand_mark(s, ctx) if not c.get('piece') else [text(s, SW - ML - 0.8, SH - 0.48, 0.8, 0.3, f'{ctx["n"]:02d}',
                                                              10, 'medium', C['muted'], align='r')]
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=8.4, size=32, lead=c.get('lead'), lead_w=8.2)
    items = c['items']
    n = len(items)
    x0, x1 = ML + 0.2, SW - ML - 0.2
    stepw = (x1 - x0) / n
    avail_top, avail_bot = y + 0.2, SH - (1.35 if c.get('chips') else 0.7)
    title_l = max(K.n_lines(t1, F('semi'), 17, stepw - 0.24) for t1, _ in items)
    desc_l = max(K.n_lines(t2, F('body'), 13.5, stepw - 0.4) for _, t2 in items)
    dy = 0.6 + title_l * 17 / 72 * 1.05 + 0.25              # description top, below the (1–2 line) step title
    block = 0.38 + dy + desc_l * 13.5 / 72 * 1.25          # node half + title + description (actual height)
    ly = max(y + 0.6, avail_top + (avail_bot - avail_top - block) / 2 + 0.38)
    rail = K.line(s, x0 + stepw / 2, ly, x1 - stepw / 2, ly, C['lime2'], 2.5, alpha=80, nm='!!rail')
    K.glow(rail, 0.1, C['lime2'], 40)
    nodes = []
    for i, (t1, t2) in enumerate(items):
        cx = x0 + stepw * (i + 0.5)
        o = K.oval(s, cx - 0.38, ly - 0.38, 0.76, fill=C['bg'], line=C['lime'], lw=2.25)
        K.glow(o, 0.12, C['lime2'], 40)
        K.shape_text(o, f'{i + 1:02d}', size=15, color=C['lime'], font=F('xbold'), margin=(0, 0))
        a = text(s, cx - stepw / 2 + 0.12, ly + 0.6, stepw - 0.24, 0.75, t1, 17, 'semi', align='c', line_sp=1.0)
        b = text(s, cx - stepw / 2 + 0.2, ly + dy, stepw - 0.4, 1.6, t2, 13.5, 'body', C['text'], align='c',
                 line_sp=1.18)
        nodes.append([o, a, b])
    foot = []
    if c.get('chips'):
        x = ML
        if c.get('chips_label'):
            foot.append(text(s, x, SH - 1.12, 3.0, 0.42, c['chips_label'], 12, 'semi', C['lime'], anchor='m',
                             wrap=False))
            x += K.text_w(c['chips_label'], F('semi'), 12) + 0.3
        for lab in c['chips']:
            ch, w = chip(s, x, SH - 1.12, lab, 12)
            foot.append(ch)
            x += w + 0.15
    K.anims(s, hd, 'fade', 0.1, 0.12, 0.5)
    K.anim(s, rail, 'wipe_l', 0.5, 0.9)
    K.anims(s, nodes, 'zoom', 0.7, 0.22, 0.45)
    K.anims(s, foot, 'fade', 0.7 + 0.22 * n, 0.08, 0.4)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 7. proof: text + real photo mosaic
def proof(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_left'))
    stage(s, ctx, {})
    bm = brand_mark(s, ctx)
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=5.1, size=30, lead=c.get('lead'), lead_w=5.0)
    chips = []
    yy = max(y + 0.1, 3.3)
    for i, lab in enumerate(c.get('list', [])):
        col = i % 2
        ch_w = 2.5
        x = ML + col * (ch_w + 0.12)
        yi = yy + (i // 2) * 0.55
        g = glass(s, x, yi, ch_w, 0.45, radius=0.12, alpha=7, line_alpha=20)
        sz = fit(lab, 'medium', 11.5, ch_w - 0.35, 10)
        tx = text(s, x + 0.15, yi, ch_w - 0.2, 0.45, lab, sz, 'medium', anchor='m', hi_font='semi', wrap=False)
        chips.append([g, tx])
    note = text(s, ML, SH - 1.0, 5.1, 0.5, c.get('note', ''), 11.5, 'body', C['muted'], line_sp=1.15) \
        if c.get('note') else None
    ph = c['photos']
    X0, Y0, W, H = 6.05, 0.95, SW - 0.35 - 6.05, SH - 0.95 - 0.55
    g = 0.14
    big_w = W * 0.62
    slots = [(X0, Y0, big_w, H * 0.56), (X0 + big_w + g, Y0, W - big_w - g, H * 0.56)]
    bw = (W - 2 * g) / 3
    for k in range(3):
        slots.append((X0 + k * (bw + g), Y0 + H * 0.56 + g, bw, H * 0.44 - g))
    tiles = []
    for (key, cap), (x, yy_, w, h) in zip(ph, slots):
        tiles.append(photo(s, ctx, key, x, yy_, w, h, caption=cap, cap_size=11.5))
    K.anims(s, hd, 'fade', 0.1, 0.12, 0.5)
    K.anims(s, chips, 'fade', 0.6, 0.06, 0.35)
    if note is not None:
        K.anim(s, note, 'fade', 1.2, 0.4)
    K.anims(s, tiles, 'zoom', 0.3, 0.12, 0.5)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 8. device: render + feature list
def device(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_left'))
    stage(s, ctx, {})
    bm = brand_mark(s, ctx)
    right = c.get('side', 'left') == 'right'
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=11.0, size=32, lead=c.get('lead'), lead_w=11.0)
    path = pic(ctx, c['image'])
    from PIL import Image
    iw, ih = Image.open(path).size
    bx, bw = (6.4, SW - 6.4 - 0.2) if right else (0.2, c.get('image_w', 6.9))
    by, bh = max(y, 1.9) - 0.1, SH - max(y, 1.9) - 0.2      # keep the pedestal off the bottom edge
    r = min(bw / iw, bh / ih)
    pw, ph = iw * r, ih * r
    px, py = bx + (bw - pw) / 2, by + (bh - ph) / 2
    gl = K.glow_img(s, px + pw / 2, py + ph * 0.55, min(pw, ph) * 1.2, C['lime2'], 26)
    im = K.picture(s, path, px, py, pw, ph, nm=f'!!aux_{c["image"]}')
    fx = ML if right else bx + bw + 0.3
    fw = (6.0 - ML) if right else SW - ML - fx
    items = c['items'][:4]
    gap = 0.18
    top = max(y + 0.05, 2.2)
    ih_ = (SH - 0.6 - top - gap * (len(items) - 1)) / len(items)
    rows = []
    for i, (ic, t1, t2) in enumerate(items):
        yy = top + i * (ih_ + gap)
        g = glass(s, fx, yy, fw, ih_)
        rr = icon_ring(s, ic, fx + 0.5, yy + ih_ / 2, 0.56)
        a = text(s, fx + 0.95, yy + 0.14, fw - 1.1, 0.4, t1, 15, 'semi', anchor='m')
        b = text(s, fx + 0.95, yy + 0.55, fw - 1.1, ih_ - 0.6, t2, 12, 'body', C['text'], line_sp=1.12)
        rows.append([g] + rr + [a, b])
    K.anims(s, hd, 'fade', 0.1, 0.12, 0.5)
    K.anim(s, gl, 'fade', 0.2, 0.6)
    K.anim(s, im, 'rise' if not right else 'fly_r', 0.3, 0.8)
    K.anims(s, rows, 'fly_r' if not right else 'fly_l', 0.7, 0.15, 0.45)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 9. numbers: big figures + bleeding photo
def numbers(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_left'))
    stage(s, ctx, {})
    pw_ = c.get('photo_w', 6.6)
    ph = K.picture(s, ctx['art']['soft_' + c['photo']], SW - pw_, 0, pw_, SH, nm='!!photo')
    bm = brand_mark(s, ctx)
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=6.2, size=32, lead=c.get('lead'), lead_w=6.0)
    items = c['items']
    out = []
    n = len(items)
    rh = 1.15
    yy0 = max(y + 0.25, SH - 0.6 - n * rh)
    for i, (v, u, lab) in enumerate(items):
        yy = yy0 + i * rh
        out.append([K.text(s, ML, yy, 2.4, rh - 0.1, [[(v, {}), (u or '', {'size': 28})]], size=58, font=F('black'),
                           color=C['lime'], anchor='m', wrap=False),
                    K.line(s, ML, yy + rh - 0.05, ML + 6.0, yy + rh - 0.05, C['line'], 1.0),
                    text(s, ML + 2.55, yy, 3.5, rh - 0.1, lab, 15, 'medium', C['text'], anchor='m', line_sp=1.15)])
    K.anim(s, ph, 'fade', 0.0, 0.8)
    K.anims(s, hd, 'fade', 0.2, 0.12, 0.5)
    K.anims(s, out, 'rise', 0.6, 0.2, 0.5)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 10. chart + KPIs
def chart(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_center'))
    show = {c['piece']: (10.75, 6.2, 2.4)} if c.get('piece') else {}
    stage(s, ctx, show)
    bm = brand_mark(s, ctx)
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=8.0, size=32, lead=c.get('lead'), lead_w=7.6)
    top = max(y + 0.1, 2.3)
    pnl = glass(s, ML, top, 7.4, SH - 0.55 - top, alpha=5)
    ch = c['chart']
    gf = K.chart_bar(s, ML + 0.25, top + 0.2, 6.9, SH - 0.95 - top, ch['cats'], [tuple(x) for x in ch['series']],
                     colors=[C['lime2']], gap=70, labels=True, num_fmt=ch.get('fmt', '0'), legend=False, dark=True,
                     label_color=C['white'], max_v=ch.get('max'), font_size=13)
    gf.chart.font.name = F('medium')
    kp = []
    x0 = 8.6
    for i, (v, lab) in enumerate(c.get('kpis', [])[:3]):
        yy = top + i * 0.92
        kp.append([text(s, x0, yy, 2.0, 0.8, v, 40, 'black', C['lime'], anchor='m', wrap=False),
                   text(s, x0 + 2.05, yy, SW - ML - x0 - 2.05, 0.8, lab, 13, 'medium', C['text'], anchor='m',
                        line_sp=1.1)])
    note = text(s, ML, SH - 0.45, 7.4, 0.3, c.get('note', ''), 10, 'body', C['muted'])
    K.anims(s, hd, 'fade', 0.1, 0.12, 0.5)
    K.anim(s, pnl, 'fade', 0.3, 0.4)
    K.anim(s, gf, 'wipe_u', 0.5, 1.0)
    K.anims(s, kp, 'fly_r', 0.8, 0.2, 0.45)
    K.anim(s, note, 'fade', 1.4, 0.4)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 11. tiles: photo grid with captions
def tiles(prs, ctx, c):
    import math
    s = _new(prs, ctx, c.get('bg', 'bg_center'))
    stage(s, ctx, {})
    bm = brand_mark(s, ctx)
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=10.0, size=32, lead=c.get('lead'), lead_w=9.0)
    items = c['items']
    cols = c.get('cols', 3)
    rows = math.ceil(len(items) / cols)
    top = max(y + 0.2, 2.15)
    g = 0.18
    w = (SW - 2 * ML - g * (cols - 1)) / cols
    h = (SH - 0.55 - top - g * (rows - 1)) / rows
    out = []
    for i, it in enumerate(items):
        x = ML + (i % cols) * (w + g)
        yy = top + (i // cols) * (h + g)
        out.append(photo(s, ctx, it['photo'], x, yy, w, h, focus=it.get('focus', (0.5, 0.5)), caption=it['caption'],
                         cap_size=it.get('size', 14)))
    K.anims(s, hd, 'fade', 0.1, 0.12, 0.5)
    K.anims(s, out, 'zoom', 0.4, 0.1, 0.45)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 12. logos: grouped partner wall
def logos(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_center'))
    stage(s, ctx, {})
    bm = brand_mark(s, ctx)
    hd, y = heading(s, c.get('kicker', ''), c['title'], w=9.0, size=32, lead=c.get('lead'), lead_w=9.0)
    groups = c['groups']
    top = max(y + 0.05, 2.1)
    rh, lh, gap = 0.95, 0.34, 0.24
    out = []
    for gi, gr in enumerate(groups):
        yy = top + gi * (lh + 0.1 + rh + gap)
        lab = gr['label'].upper()
        tw = K.text_w(lab, F('semi'), 11) + len(lab) * 2.5 / 72 + 0.1
        row = [text(s, ML, yy, tw, lh, lab, 11, 'semi', C['lime'], anchor='m', spacing=2.5, wrap=False),
               K.line(s, ML + tw + 0.15, yy + lh / 2, SW - ML, yy + lh / 2, C['line'], 1.0)]
        n = len(gr['logos'])
        lw = min(1.55, (SW - 2 * ML - 0.18 * (n - 1)) / n)
        x0 = ML
        for k, key in enumerate(gr['logos']):
            x = x0 + k * (lw + 0.18)
            t = K.rect(s, x, yy + lh + 0.1, lw, rh, fill='FFFFFF', radius=0.12)
            from PIL import Image
            pth = pic(ctx, key)
            iw, ih = Image.open(pth).size
            bw, bh = lw - 0.24, rh - 0.18
            r = min(bw / iw, bh / ih)
            p = K.picture(s, pth, x + 0.12 + (bw - iw * r) / 2, yy + lh + 0.19 + (bh - ih * r) / 2, iw * r, ih * r)
            row.append([t, p])
        out.append(row)
    K.anims(s, hd, 'fade', 0.1, 0.12, 0.5)
    t0 = 0.4
    for row in out:
        K.anims(s, row[:2], 'wipe_l', t0, 0.0, 0.4)
        K.anims(s, row[2:], 'zoom', t0 + 0.15, 0.05, 0.35)
        t0 += 0.45
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 13. map: offices
def map_offices(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_left'))
    stage(s, ctx, {})
    bm = brand_mark(s, ctx)
    from PIL import Image
    path = pic(ctx, c['map'])
    iw, ih = Image.open(path).size
    bx, by, bw, bh = 0.35, 0.45, 6.2, SH - 0.75
    r = min(bw / iw, bh / ih)
    pw, ph = iw * r, ih * r
    px, py = bx + (bw - pw) / 2, by + (bh - ph) / 2
    mp = K.picture(s, path, px, py, pw, ph, nm='!!map')
    pins = []
    for i, o in enumerate(c['offices']):
        fx, fy = o['pin']
        x, y = px + fx * pw, py + fy * ph
        gl = K.glow_img(s, x, y, 1.1, C['lime2'], 70)
        dot = K.oval(s, x - 0.19, y - 0.19, 0.38, fill=C['lime'], line='FFFFFF', lw=1.5)
        K.shape_text(dot, str(i + 1), size=10, color=C['bg'], font=F('xbold'), margin=(0, 0))
        pins.append([gl, dot])
    lon0, lon1, lat0, lat1 = 101.9, 117.6, 7.6, 23.6       # projection of laodong_assets.vn_regions
    isl = [text(s, px + (lon - lon0) / (lon1 - lon0) * pw, py + (lat1 - lat) / (lat1 - lat0) * ph, 1.6, 0.3, nm_,
                10.5, 'semi', C['lime'], wrap=False)
           for nm_, lon, lat in (('QĐ. Hoàng Sa', 111.1, 17.75), ('QĐ. Trường Sa', 112.5, 12.35))]
    hd, y = heading(s, c.get('kicker', ''), c['title'], x=7.0, w=SW - ML - 7.0, size=32, lead=c.get('lead'))
    rows = []
    top = max(y + 0.1, 2.4)
    n = len(c['offices'])
    rh = min(1.35, (SH - 0.6 - top - 0.18 * (n - 1)) / n)
    for i, o in enumerate(c['offices']):
        yy = top + i * (rh + 0.18)
        g = glass(s, 7.0, yy, SW - ML - 7.0, rh)
        nb = K.oval(s, 7.25, yy + 0.22, 0.44, fill=C['lime'])
        K.shape_text(nb, str(i + 1), size=12, color=C['bg'], font=F('xbold'), margin=(0, 0))
        a = text(s, 7.9, yy + 0.15, SW - ML - 8.05, 0.42, o['name'], 15.5, 'semi', anchor='m')
        b = text(s, 7.9, yy + 0.58, SW - ML - 8.05, rh - 0.62, o['address'], 12, 'body', C['text'], line_sp=1.12)
        rows.append([g, nb, a, b])
    K.anim(s, mp, 'fade', 0.1, 0.8)
    K.anims(s, isl, 'fade', 0.6, 0.1, 0.4)
    K.anims(s, pins, 'zoom', 0.8, 0.2, 0.4)
    K.anims(s, hd, 'fade', 0.2, 0.12, 0.5)
    K.anims(s, rows, 'fly_r', 0.9, 0.18, 0.45)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 14. offer: cooperation proposals (pillars land in cards)
def offer(prs, ctx, c):
    s = _new(prs, ctx, c.get('bg', 'bg_center'))
    items = c['items'][:4]
    n = len(items)
    g = 0.22
    w = (SW - 2 * ML - g * (n - 1)) / n
    top = 2.25
    show = {}
    for i, it in enumerate(items):
        show[it['piece']] = (ML + i * (w + g) + w / 2, top + 1.2, 2.05)
    cards = []
    for i, it in enumerate(items):
        x = ML + i * (w + g)
        cards.append(glass(s, x, top + 0.35, w, SH - 0.5 - top - 0.35, alpha=6))
    stage(s, ctx, show)
    bm = brand_mark(s, ctx)
    hd, _ = heading(s, c.get('kicker', ''), c['title'], w=10.5, size=32, lead=c.get('lead'), lead_w=10.5)
    out = []
    for i, it in enumerate(items):
        x = ML + i * (w + g)
        y = top + 2.35
        out.append([text(s, x + 0.25, y, w - 0.5, 0.3, it['tag'].upper(), 10.5, 'semi', C['lime'], spacing=2),
                    text(s, x + 0.25, y + 0.36, w - 0.5, 0.75, it['title'], 15.5, 'semi', line_sp=1.05),
                    text(s, x + 0.25, y + 1.12, w - 0.5, SH - 0.6 - y - 1.12, it['text'], 12, 'body', C['text'],
                         line_sp=1.15)])
    K.anims(s, hd, 'fade', 0.1, 0.12, 0.5)
    K.anims(s, cards, 'fade', 0.3, 0.1, 0.4)
    K.anims(s, out, 'rise', 0.9, 0.15, 0.45)
    K.anims(s, bm, 'fade', 0.0, 0.0, 0.4)
    return s


# ================================================================== 15. closing
def closing(prs, ctx, c):
    s = _new(prs, ctx, 'bg_right', tr=1.8)
    stage(s, ctx, cluster(9.95, 3.85, 3.3, 2.0, 2.2, 1.16), LINKS)
    t = c.get('title', 'Trân trọng cảm ơn')
    sz = fit(t, 'xbold', 50, 5.8, 32)
    tt = text(s, ML, 1.1, 6.3, sz / 72 * 1.1 * (t.count('\n') + 1) + 0.1, t, sz, 'xbold', line_sp=0.98, nm='!!title')
    sub = text(s, ML, 1.25 + sz / 72 * 1.1 * (t.count('\n') + 1), 5.6, 0.9, c.get('sub', ''), 16, 'light',
               C['text'], line_sp=1.2, nm='!!lead', hi_font='medium')
    rows = []
    y = 3.75
    for ic, tx in c.get('lines', []):
        rows.append([K.icon(s, ic, ML, y + 0.06, 0.3, C['lime']),
                     text(s, ML + 0.48, y, 5.0, 0.42, tx, 14, 'medium', anchor='m')])
        y += 0.5
    qr = []
    if c.get('qr'):
        qc = K.rect(s, ML, SH - 1.75, 1.3, 1.3, fill='FFFFFF', radius=0.12)
        qr = [qc, K.picture(s, pic(ctx, c['qr']), ML + 0.1, SH - 1.65, 1.1, 1.1),
              text(s, ML + 1.45, SH - 1.75, 3.5, 1.3, c.get('qr_label', 'Quét mã để kết nối'), 12.5, 'medium',
                   C['text'], anchor='m')]
    lg = K.picture(s, ctx['art']['logo'], SW - ML - 1.62, 0.42, 0.46, 0.46, fit='contain', nm='!!logo')
    K.anim(s, tt, 'rise', 0.5, 0.9)
    K.anim(s, sub, 'fade', 1.0, 0.6)
    K.anims(s, rows, 'fade', 1.3, 0.12, 0.4)
    K.anims(s, qr, 'zoom', 1.7, 0.05, 0.4)
    K.anim(s, lg, 'fade', 0.0, 0.4)
    return s


# ================================================================== credits (hidden)
def credits(prs, ctx, c):
    s = _new(prs, ctx, 'bg_center')
    stage(s, ctx, {})
    s._element.set('show', '0')
    text(s, ML, 0.5, 11, 0.6, 'Nguồn hình ảnh', 26, 'xbold')
    text(s, ML, 1.2, 11.8, 0.9, 'Slide ẩn — không hiển thị khi trình chiếu. ' + c['intro'], 11, 'body', C['text'],
         line_sp=1.15)
    text(s, ML, 2.3, 11.8, 4.5, '\n'.join(c['lines']), 10, 'body', C['muted'], line_sp=1.15)
    return s
