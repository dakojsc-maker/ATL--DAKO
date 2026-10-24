"""
Layouts for M10 "Du lịch Đà Nẵng" (travel guide, night-navy paper, gold Playfair titles, floating sky lanterns,
taped polaroids, vintage cameras, camera viewfinder, film strip, calendar, night-chart map, boarding-pass itinerary).

Each layout: fn(prs, ctx, c) -> slide.
ctx = dict(n, img{key: path}, cut{key: path}, art{bg, lantern[], tape}, map{path, pts})
Shapes that slide between slides (Morph) are named "!!...": background, the sky lanterns, titles.
"""
import re

import pptkit as K
from pptx.enum.shapes import MSO_SHAPE

SW, SH, ML = K.SW, K.SH, 0.6
P = dict(navy='0D1B34', navy2='16294D', navy3='1E3561', gold='D9B26A', gold2='F1D7A0', cream='F5ECDD',
         paper='FBF7EF', text='D5DCE8', muted='8D9AB3', ink='1F2A3D', lantern='F29A3A', red='E5484D',
         rain='7FA7D9', white='FFFFFF')
FONTS = dict(title=('Playfair Display SemiBold', 'danang/PlayfairDisplay-SemiBold.ttf', False),
             disp=('Playfair Display', 'danang/PlayfairDisplay-Regular.ttf', False),
             italic=('Playfair Display Italic Medium', 'danang/PlayfairDisplayItalic-Medium.ttf', False),
             body=('Be Vietnam Pro', 'danang/BeVietnamPro-Regular.ttf', False),
             semi=('Be Vietnam Pro SemiBold', 'danang/BeVietnamPro-SemiBold.ttf', False),
             bold=('Be Vietnam Pro', 'danang/BeVietnamPro-Bold.ttf', True),
             hand=('Dancing Script', 'danang/DancingScript-Bold.ttf', True),
             script=('Great Vibes', 'danang/GreatVibes-Regular.ttf', False))


def F(role):
    return FONTS[role][0]


def register(colors=None):
    P.update(colors or {})
    K.THEMES['danang'] = dict(
        name='Du lịch Đà Nẵng', key='danang', bg_light=P['cream'], bg_dark=P['navy'], ink=P['ink'], text=P['text'],
        muted=P['muted'], soft=P['navy2'], card=P['navy2'], card2=P['navy3'], accent=P['gold'], accent_ink=P['navy'],
        violet=P['gold2'], hot=P['lantern'], up=P['gold'], line='33496F', chart=[P['gold'], P['rain'], P['lantern']],
        blob_light=[(P['gold'], 20)], blob_dark=[(P['gold'], 20)], tint=P['navy'], grid_dark='2A3F66',
        row_alt=P['navy3'])
    K.set_theme('danang')
    for role, (face, fname, bold) in FONTS.items():
        if role == 'bold' and face in K.FONT_FILES and K.FONT_FILES[face] != fname:
            continue
        K.FONT_FILES[face] = fname
        if bold and role == 'hand':
            K.BOLD_FACES.add(face)
    return P


# ------------------------------------------------------------------ helpers
def _new(prs, ctx, tr=1.3):
    ctx['n'] += 1
    s = K.blank_slide(prs, True)
    if ctx['n'] > 1:
        K.morph(s, tr)
    K.picture(s, ctx['art']['bg'], 0, 0, SW, SH, nm='!!bg')
    return s


def pic(ctx, key, cut=False):
    for k in (('cut', 'img', 'art') if cut else ('img', 'art', 'cut')):
        if key in ctx[k] and isinstance(ctx[k][key], str):
            return ctx[k][key]
    import content_io as CIO
    return CIO.photo_path(key)


def lanterns(s, ctx, spots, start=0.2):
    """Sky lanterns at (x, y, width) — same names on every slide so Morph lets them drift."""
    out = []
    arts = ctx['art']['lantern']
    for i, (x, y, w) in enumerate(spots):
        out.append(K.picture(s, arts[i % len(arts)], x, y, w, w * 520 / 360, nm=f'!!lan{i}'))
    K.anims(s, out, 'float', start, 0.18, 1.2)
    return out


def page_no(s, n):
    return K.text(s, SW - ML - 1.0, SH - 0.5, 1.0, 0.3, f'{n:02d}', size=11, font=F('italic'), color=P['gold'],
                  align='r')


def rich(s, x, y, w, h, content, size=12.5, color=None, bold_color=None, align='l', line_sp=1.3, space_after=6,
         anchor='t', bullets=False):
    color = color or P['text']
    bold_color = bold_color or P['gold2']
    paras = []
    for para in content.split('\n'):
        runs = []
        for i, part in enumerate(re.split(r'\*\*', para)):
            if part:
                runs.append((part, {'font': F('semi'), 'color': bold_color}) if i % 2 else (part, {}))
        paras.append(runs or [''])
    return K.text(s, x, y, w, h, paras, size=size, font=F('body'), color=color, align=align, line_sp=line_sp,
                  space_after=space_after, anchor=anchor, bullets=bullets, bullet_color=P['gold'])


def fit(t, role, size, w, lo=14):
    while size > lo and max(K.text_w(x, F(role), size) for x in t.split('\n')) > w:
        size -= 1
    return size


def ornament(s, x, y, w=1.6, color=None, align='l'):
    color = color or P['gold']
    x0 = x if align == 'l' else (x - w / 2 if align == 'c' else x - w)
    ln = K.line(s, x0, y, x0 + w, y, color, 1.0)
    d = K.rect(s, (x0 if align == 'l' else x0 + w / 2 if align == 'c' else x0 + w) - 0.06, y - 0.06, 0.12, 0.12,
               fill=color, shp=MSO_SHAPE.DIAMOND)
    return [ln, d]


def heading(s, kicker, title, x=ML, y=0.5, w=8.5, align='l', size=34):
    out = []
    if kicker:
        out.append(K.text(s, x, y, w, 0.4, kicker, size=16, font=F('italic'), color=P['gold2'], align=align,
                          nm='!!kicker'))
    sz = fit(title, 'title', size, w, 20)
    out.append(K.text(s, x, y + 0.38, w, sz / 72 * 1.3, title, size=sz, font=F('title'), color=P['cream'],
                      align=align, nm='!!ttl', wrap=False))
    out += ornament(s, x if align == 'l' else x + w / 2, y + 0.5 + sz / 72 * 1.3, 1.4,
                    align='l' if align == 'l' else 'c')
    return out


def polaroid(s, ctx, key, x, y, w, h, caption='', rot=0, focus=(0.5, 0.5), tape=True, nm=None):
    grp = s.shapes.add_group_shape()
    g = K._Box(grp, True)
    fr = K.rect(g, x, y, w, h, fill=P['paper'])
    K.shadow(fr, blur=0.35, dist=0.12, alpha=50, color='000000', angle=100)
    m = w * 0.055
    cap_h = min(0.62, h * 0.18) if caption else m
    K.picture(g, pic(ctx, key), x + m, y + m, w - 2 * m, h - m - cap_h, focus=tuple(focus))
    if caption:
        K.text(g, x + m, y + h - cap_h, w - 2 * m, cap_h, caption, size=fit(caption, 'hand', 15, w - 2 * m - 0.1, 9),
               font=F('hand'), color=P['ink'], align='c', anchor='m', wrap=False)
    if tape:
        tw = min(1.25, w * 0.42)
        K.picture(g, ctx['art']['tape'], x + w / 2 - tw / 2, y - 0.14, tw, tw * 0.29, rot=-4 if rot >= 0 else 5)
    xfrm = grp._element.grpSpPr.find(K.qn('a:xfrm'))
    xfrm.set('rot', str(int(rot * 60000)))
    if nm:
        grp.name = nm
    return grp


def dish(s, ctx, key, cx, cy, d, focus=(0.5, 0.5), nm=None):
    p = K.picture(s, pic(ctx, key), cx - d / 2, cy - d / 2, d, d, geom='ellipse', focus=tuple(focus), nm=nm)
    K.set_line(p, P['paper'], 6)
    K.shadow(p, blur=0.35, dist=0.12, alpha=50, color='000000', angle=90)
    K._ensure_ln_before_effects(p)
    return p


def chip(s, ic, label, x, y, h=0.42, fill=None, color=None, size=11):
    w = K.text_w(label, F('semi'), size) + 0.75
    bg = K.rect(s, x, y, w, h, fill=fill or P['navy'], radius=h / 2, alpha=70, line=P['gold'], lw=0.75)
    icn = K.icon(s, ic, x + 0.15, y + (h - 0.24) / 2, 0.24, P['gold'])
    tx = K.text(s, x + 0.47, y, w - 0.5, h, label, size=size, font=F('semi'), color=color or P['cream'], anchor='m',
                wrap=False)
    return [bg, icn, tx], w


def viewfinder(s, x0=0.35, y0=0.3, x1=None, y1=None, info=('REC', '00:12:24', '4K · 60P', 'ISO 100   F2.8   1/250'),
               focus=(0.7, 0.45)):
    """Camera viewfinder overlay built from editable shapes."""
    x1 = x1 or SW - 0.35
    y1 = y1 or SH - 0.3
    col = P['white']
    out = []
    L_ = 0.55
    for (cx, cy, dx, dy) in ((x0, y0, 1, 1), (x1, y0, -1, 1), (x0, y1, 1, -1), (x1, y1, -1, -1)):
        out.append(K.line(s, cx, cy, cx + dx * L_, cy, col, 2.25))
        out.append(K.line(s, cx, cy, cx, cy + dy * L_, col, 2.25))
    mx, my = x0 + (x1 - x0) * focus[0], y0 + (y1 - y0) * focus[1]
    f = 0.32
    for (dx, dy) in ((-1, -1), (1, -1), (-1, 1), (1, 1)):
        cx, cy = mx + dx * 0.7, my + dy * 0.45
        out.append(K.line(s, cx, cy, cx - dx * f, cy, col, 1.5, alpha=85))
        out.append(K.line(s, cx, cy, cx, cy - dy * f, col, 1.5, alpha=85))
    for k in (1, 2):                                      # rule-of-thirds grid
        gx = x0 + (x1 - x0) * k / 3
        gy = y0 + (y1 - y0) * k / 3
        out.append(K.line(s, gx, y0 + 0.2, gx, y1 - 0.2, col, 0.5, alpha=25))
        out.append(K.line(s, x0 + 0.2, gy, x1 - 0.2, gy, col, 0.5, alpha=25))
    rec = K.oval(s, x0 + 0.35, y0 + 0.3, 0.18, fill=P['red'])
    out.append(rec)
    out.append(K.text(s, x0 + 0.62, y0 + 0.22, 2.6, 0.34, f'{info[0]}   {info[1]}', size=12, font=F('semi'),
                      color=col, anchor='m', spacing=1, wrap=False))
    bx, by = x1 - 1.05, y0 + 0.27                         # battery
    out.append(K.rect(s, bx, by, 0.55, 0.26, fill=None, line=col, lw=1.25, radius=0.04))
    out.append(K.rect(s, bx + 0.55, by + 0.08, 0.05, 0.1, fill=col))
    for k in range(3):
        out.append(K.rect(s, bx + 0.06 + k * 0.165, by + 0.05, 0.13, 0.16, fill=col))
    out.append(K.text(s, bx - 1.9, y0 + 0.22, 1.75, 0.34, info[2], size=12, font=F('semi'), color=col, align='r',
                      anchor='m', spacing=1, wrap=False))
    sw = 3.2                                              # exposure scale, bottom right
    sx0 = x1 - 0.45 - sw
    sy = y1 - 0.45
    for k in range(17):
        tx = sx0 + sw * k / 16
        hh = 0.16 if k % 4 == 0 else 0.08
        out.append(K.line(s, tx, sy - hh / 2, tx, sy + hh / 2, col, 1.0))
    for k, lab in enumerate(('-2', '-1', '0', '+1', '+2')):
        out.append(K.text(s, sx0 + sw * k / 4 - 0.3, sy - 0.42, 0.6, 0.24, lab, size=9, font=F('semi'), color=col,
                          align='c'))
    out.append(K.rect(s, sx0 + sw / 2 - 0.07, sy + 0.12, 0.14, 0.12, fill=P['gold'],
                      shp=MSO_SHAPE.ISOSCELES_TRIANGLE))
    out.append(K.text(s, x1 - 4.2, y0 + 0.62, 3.85, 0.34, info[3], size=11, font=F('semi'), color=col, align='r',
                      anchor='m', spacing=1, wrap=False))
    return out


# ================================================================== 1. cover
def cover(prs, ctx, c):
    s = _new(prs, ctx)
    lanterns(s, ctx, [(0.2, 0.15, 0.95), (5.2, 0.35, 0.7), (6.3, 4.7, 0.55), (3.6, 5.6, 0.75),
                           (12.3, 5.6, 0.7)])
    ph = c['photos']
    caps = c.get('captions', [''] * len(ph))
    pols = []
    for i, (x, y, w, h, r) in enumerate(((7.0, 0.8, 3.3, 3.85, -7), (9.7, 1.25, 3.15, 3.7, 6),
                                         (8.1, 3.45, 3.2, 3.6, -2))[:len(ph)]):
        pols.append(polaroid(s, ctx, ph[i], x, y, w, h, caps[i], r, nm=f'!!pol{i}'))
    cam = None
    if c.get('camera'):
        cam = K.picture(s, pic(ctx, c['camera'], cut=True), 5.55, 4.55, 3.0, 2.3, fit='contain', nm='!!cam')
        K.shadow(cam, blur=0.3, dist=0.1, alpha=55, color='000000', angle=90)
    kick = K.text(s, ML + 0.1, 1.55, 6.5, 0.5, c.get('kicker', ''), size=22, font=F('italic'), color=P['gold2'],
                  nm='!!kicker')
    t = c['title'].upper()
    sz = fit(t, 'title', 96, 6.4, 48)
    tt = K.text(s, ML, 2.0, 7.0, sz / 72 * 1.25, t, size=sz, font=F('title'), color=P['gold'], nm='!!ttl', wrap=False,
                spacing=2)
    K.shadow(tt, blur=0.25, dist=0.05, alpha=45, color='000000', angle=90)
    y = 2.05 + sz / 72 * 1.25
    orn = ornament(s, ML + 0.05, y + 0.1, 2.2)
    sub = K.text(s, ML, y + 0.3, 5.6, 1.0, c.get('sub', ''), size=18, font=F('disp'), color=P['cream'], line_sp=1.15)
    pres = K.text(s, ML, SH - 0.95, 5.5, 0.4, c.get('presenter', ''), size=11.5, font=F('semi'), color=P['muted'])
    K.anim(s, kick, 'fade', 0.2, 0.6)
    K.anim(s, tt, 'rise', 0.4, 0.9)
    K.anims(s, orn, 'wipe_l', 1.0, 0.1, 0.5)
    K.anim(s, sub, 'fade', 1.1, 0.6)
    K.anims(s, pols, 'zoom', 0.6, 0.25, 0.6)
    if cam is not None:
        K.anim(s, cam, 'rise', 1.5, 0.7)
    K.anim(s, pres, 'fade', 1.8, 0.5)
    K.notes(s, c.get('notes', 'Slide bìa.'))
    return s


# ================================================================== 2. agenda — film strip
def agenda(prs, ctx, c):
    s = _new(prs, ctx)
    lanterns(s, ctx, [(0.4, 0.25, 0.6), (11.9, 0.1, 0.75), (2.7, 0.85, 0.4), (9.9, 0.8, 0.4), (6.45, 6.75, 0.3)])
    hd = heading(s, c.get('kicker', ''), c.get('title', 'Hành trình khám phá'), x=0, w=SW, align='c')
    items = c['items'][:5]
    n = len(items)
    y, h = 2.25, 2.85
    strip = K.rect(s, -0.2, y, SW + 0.4, h, fill='121212', nm='!!film')
    K.shadow(strip, blur=0.4, dist=0.12, alpha=50, color='000000', angle=90)
    holes = []
    for k in range(int(SW / 0.42) + 1):
        for hy in (y + 0.1, y + h - 0.28):
            holes.append(K.rect(s, 0.1 + k * 0.42, hy, 0.22, 0.17, fill=P['navy'], radius=0.03))
    gap = 0.22
    fw = (SW - 2 * 0.5 - gap * (n - 1)) / n
    frames = []
    for i, it in enumerate(items):
        x = 0.5 + i * (fw + gap)
        ph = K.picture(s, pic(ctx, it[0]), x, y + 0.42, fw, h - 0.84, focus=tuple(it[2]) if len(it) > 2 else
                       (0.5, 0.5))
        num = K.text(s, x, y + h + 0.2, fw, 0.6, f'{i + 1:02d}', size=30, font=F('title'), color=P['gold'], align='c')
        lab = K.text(s, x, y + h + 0.82, fw, 0.75, it[1], size=14, font=F('semi'), color=P['cream'], align='c',
                     line_sp=1.1)
        frames.append([ph, num, lab])
    K.anims(s, hd, 'fade', 0.0, 0.1, 0.5)
    K.anim(s, strip, 'wipe_l', 0.3, 0.7)
    K.anims(s, holes, 'fade', 0.5, 0.0, 0.4)
    K.anims(s, frames, 'fade', 0.8, 0.2, 0.5)
    page_no(s, ctx['n'])
    return s


# ================================================================== 3. section
def section(prs, ctx, c):
    s = _new(prs, ctx, tr=1.5)
    lanterns(s, ctx, [(5.3, 0.4, 0.85), (6.3, 4.9, 0.6), (0.3, 5.7, 0.5), (12.4, 0.1, 0.55), (11.6, 6.0, 0.6)])
    num = f'{c["num"]:02d}' if isinstance(c['num'], int) else str(c['num'])
    nb = K.text(s, ML - 0.1, 0.25, 6.0, 3.2, num, size=200, font=F('disp'), color=P['gold'], nm='!!secnum',
                wrap=False)
    t = c['title']
    sz = fit(t, 'title', 46, 6.2, 28)
    tt = K.text(s, ML, 3.55, 6.4, sz / 72 * 1.3 * (t.count('\n') + 1), t, size=sz, font=F('title'),
                color=P['cream'], nm='!!ttl', line_sp=1.0)
    y = 3.7 + sz / 72 * 1.3 * (t.count('\n') + 1)
    orn = ornament(s, ML + 0.05, y, 1.8)
    ds = K.text(s, ML, y + 0.25, 5.8, 1.0, c.get('desc', ''), size=14, font=F('italic'), color=P['gold2'],
                line_sp=1.2)
    pol = polaroid(s, ctx, c['photo'], 7.3, 0.85, 5.0, 5.8, c.get('caption', ''), 4, focus=c.get('focus', (0.5, 0.5)),
                   nm='!!pol0')
    K.anim(s, nb, 'zoom', 0.1, 0.8)
    K.anim(s, tt, 'rise', 0.5, 0.7)
    K.anims(s, orn, 'wipe_l', 0.9, 0.1, 0.4)
    K.anim(s, ds, 'fade', 1.0, 0.6)
    K.anim(s, pol, 'fly_r', 0.3, 0.8)
    return s


# ================================================================== 4. map + facts
def map_info(prs, ctx, c):
    ctx['n'] += 1
    s = K.blank_slide(prs, True)
    K.morph(s, 1.4)
    m = ctx['map']
    K.picture(s, m['path'], 0, 0, SW, SH, nm='!!bg')
    lanterns(s, ctx, [(12.5, -0.3, 0.5), (11.0, 0.2, 0.4), (6.0, 0.15, 0.4), (6.3, 6.5, 0.35), (12.6, 4.3, 0.4)])
    pw = 5.2
    panel = K.rect(s, 0.45, 0.45, pw, SH - 0.9, fill=P['navy'], alpha=78, line=P['gold'], lw=0.75, radius=0.12)
    hd = heading(s, c.get('kicker', ''), c['title'], x=0.85, y=0.75, w=pw - 0.8, size=34)
    body = rich(s, 0.85, 2.05, pw - 0.8, 1.4, c.get('text', ''), size=12, line_sp=1.25)
    facts = []
    for i, (ic, v, lab) in enumerate(c.get('facts', [])[:4]):
        y = 3.55 + i * 0.82
        facts.append(K.icon_badge(s, ic, 1.15, y + 0.3, 0.56, P['navy3'], P['gold'], icon_scale=0.5) + [
                      K.text(s, 1.65, y, pw - 1.4, 0.38, v, size=17, font=F('title'), color=P['gold2'], anchor='m',
                             wrap=False),
                      K.text(s, 1.65, y + 0.36, pw - 1.4, 0.3, lab, size=10.5, font=F('body'), color=P['text'])])
    pins = []
    for key, lab, side in c.get('pins', []):
        px, py = m['pts'][key]
        px, py = px * SW, py * SH
        ring = K.oval(s, px - 0.17, py - 0.17, 0.34, fill=P['gold'], alpha=30)
        dot = K.oval(s, px - 0.08, py - 0.08, 0.16, fill=P['gold'], line=P['navy'], lw=1.5)
        w = K.text_w(lab, F('semi'), 11) + 0.4
        tx = px + 0.22 if side == 'r' else px - 0.22 - w
        tag = K.rect(s, tx, py - 0.18, w, 0.36, fill=P['navy'], radius=0.18, line=P['gold'], lw=0.75, alpha=85)
        K.shape_text(tag, lab, size=11, font=F('semi'), color=P['cream'], margin=(0.05, 0))
        pins.append([ring, dot, tag])
    sea = K.text(s, SW - 3.6, SH - 1.0, 3.0, 0.4, c.get('sea', 'BIỂN ĐÔNG'), size=13, font=F('italic'),
                 color=P['gold2'], align='r', spacing=6, alpha=55)
    K.anim(s, panel, 'fade', 0.1, 0.5)
    K.anims(s, hd, 'fade', 0.3, 0.1, 0.5)
    K.anim(s, body, 'fade', 0.6, 0.5)
    K.anims(s, facts, 'fly_l', 0.8, 0.15, 0.45)
    K.anims(s, pins, 'zoom', 1.2, 0.2, 0.4)
    K.anim(s, sea, 'fade', 1.4, 0.6)
    page_no(s, ctx['n'])
    return s


# ================================================================== 5. reasons — polaroid row
def reasons(prs, ctx, c):
    s = _new(prs, ctx)
    lanterns(s, ctx, [(11.2, 0.05, 0.6), (12.4, 0.6, 0.45), (0.1, 6.2, 0.4), (9.6, -0.3, 0.4), (6.4, 6.6, 0.35)])
    hd = heading(s, c.get('kicker', ''), c['title'])
    items = c['items'][:4]
    n = len(items)
    gap = 0.45
    w = (SW - 2 * ML - gap * (n - 1)) / n
    out = []
    rots = (-4, 3, -2, 4)
    for i, it in enumerate(items):
        x = ML + i * (w + gap)
        pol = polaroid(s, ctx, it['photo'], x + 0.1, 1.95, w - 0.2, 3.05, it.get('caption', ''), rots[i % 4],
                       focus=it.get('focus', (0.5, 0.5)))
        num = K.text(s, x, 5.2, 0.7, 0.55, f'{i + 1:02d}', size=26, font=F('title'), color=P['gold'], anchor='m')
        t1 = K.text(s, x + 0.72, 5.2, w - 0.72, 0.55, it['title'], size=14, font=F('semi'), color=P['cream'],
                    anchor='m', line_sp=1.05)
        t2 = rich(s, x, 5.82, w, 1.1, it.get('text', ''), size=11, line_sp=1.2)
        out.append([pol, num, t1, t2])
    K.anims(s, hd, 'fade', 0.0, 0.1, 0.5)
    K.anims(s, out, 'rise', 0.4, 0.22, 0.55)
    page_no(s, ctx['n'])
    return s


# ================================================================== 6. seasons — 12-month calendar
KIND = {'best': (P['gold'], P['navy'], None), 'good': (P['navy3'], P['gold2'], P['gold']),
        'rain': (P['navy2'], P['rain'], P['rain'])}


def seasons(prs, ctx, c):
    s = _new(prs, ctx)
    lanterns(s, ctx, [(12.4, 0.1, 0.5), (11.5, 6.0, 0.45), (7.3, -0.4, 0.45), (0.15, 6.3, 0.35), (12.6, 3.3, 0.35)])
    hd = heading(s, c.get('kicker', ''), c['title'])
    months = c['months'][:12]
    tw, th, g = 1.5, 1.3, 0.14
    x0, y0 = ML, 1.95
    tiles = []
    for i, (lab, ic, temp, kind) in enumerate(months):
        x = x0 + (i % 4) * (tw + g)
        y = y0 + (i // 4) * (th + g)
        fill, col, line = KIND.get(kind, KIND['good'])
        r = K.rect(s, x, y, tw, th, fill=fill, line=line, lw=1.0, radius=0.1)
        a = K.text(s, x + 0.15, y + 0.1, tw - 0.3, 0.4, lab, size=15, font=F('title'),
                   color=P['navy'] if kind == 'best' else P['cream'])
        b = K.icon(s, ic, x + 0.15, y + 0.62, 0.42, col)
        d = K.text(s, x + 0.65, y + 0.62, tw - 0.75, 0.42, temp, size=12, font=F('semi'), color=col, anchor='m',
                   align='r')
        tiles.append([r, a, b, d])
    leg = []
    lx = ML
    for kind, lab in c.get('legend', []):
        fill, col, line = KIND[kind]
        leg.append(K.rect(s, lx, 6.35, 0.3, 0.3, fill=fill, line=line, lw=1.0, radius=0.05))
        leg.append(K.text(s, lx + 0.4, 6.32, 2.0, 0.36, lab, size=10.5, font=F('body'), color=P['text'], anchor='m',
                          wrap=False))
        lx += 0.55 + K.text_w(lab, F('body'), 10.5)
    rx = x0 + 4 * tw + 3 * g + 0.6
    rw = SW - ML - rx
    tips = []
    for i, (ic, t1, t2) in enumerate(c.get('tips', [])[:3]):
        y = 1.95 + i * 1.5
        bd = K.icon_badge(s, ic, rx + 0.35, y + 0.35, 0.7, P['navy3'], P['gold'], ring=P['gold'], icon_scale=0.5)
        a = K.text(s, rx + 0.9, y, rw - 0.9, 0.42, t1, size=17, font=F('title'), color=P['gold2'], anchor='m')
        b = rich(s, rx + 0.9, y + 0.45, rw - 0.9, 0.95, t2, size=11.5, line_sp=1.2)
        tips.append(bd + [a, b])
    K.anims(s, hd, 'fade', 0.0, 0.1, 0.5)
    K.anims(s, tiles, 'zoom', 0.3, 0.06, 0.35)
    K.anims(s, leg, 'fade', 1.1, 0.03, 0.3)
    K.anims(s, tips, 'fly_r', 1.0, 0.2, 0.5)
    page_no(s, ctx['n'])
    return s


# ================================================================== 7. place through the viewfinder
def viewfinder_place(prs, ctx, c):
    ctx['n'] += 1
    s = K.blank_slide(prs, True)
    K.morph(s, 1.3)
    K.picture(s, pic(ctx, c['photo']), 0, 0, SW, SH, focus=tuple(c.get('focus', (0.5, 0.5))), nm='!!bg')
    sh1 = K.rect(s, 0, 0, SW, SH)
    K.grad_fill(sh1, [(0, P['navy'], 92), (45, P['navy'], 55), (75, P['navy'], 0)], angle=0)
    sh2 = K.rect(s, 0, SH * 0.45, SW, SH * 0.55)
    K.grad_fill(sh2, [(0, P['navy'], 0), (100, P['navy'], 85)], angle=90)
    vf = viewfinder(s, info=c.get('info', ('REC', '00:12:24', '4K · 60P', 'ISO 100   F2.8   1/250')),
                    focus=c.get('focus_box', (0.7, 0.45)))
    kick = K.text(s, 0.95, 3.05, 6.5, 0.4, c.get('kicker', ''), size=16, font=F('italic'), color=P['gold2'],
                  nm='!!kicker')
    t = c['title']
    sz = fit(t, 'title', 50, 6.6, 28)
    tt = K.text(s, 0.95, 3.45, 7.0, sz / 72 * 1.3, t, size=sz, font=F('title'), color=P['cream'], nm='!!ttl',
                wrap=False)
    y = 3.55 + sz / 72 * 1.3
    orn = ornament(s, 1.0, y, 1.6)
    ds = rich(s, 0.95, y + 0.22, 6.2, 1.35, c.get('text', ''), size=12.5, line_sp=1.25)
    chips = []
    cx = 0.95
    for ic, lab in c.get('chips', [])[:3]:
        ch, w = chip(s, ic, lab, cx, SH - 1.35, size=10.5)
        chips.append(ch)
        cx += w + 0.15
    K.anims(s, vf, 'fade', 0.2, 0.0, 0.6)
    K.anim(s, kick, 'fade', 0.5, 0.5)
    K.anim(s, tt, 'wipe_l', 0.6, 0.7)
    K.anims(s, orn, 'wipe_l', 1.0, 0.1, 0.4)
    K.anim(s, ds, 'fade', 1.1, 0.6)
    K.anims(s, chips, 'rise', 1.4, 0.15, 0.4)
    return s


# ================================================================== 8. place with a polaroid collage
def place_collage(prs, ctx, c):
    s = _new(prs, ctx)
    lanterns(s, ctx, [(6.2, 0.15, 0.55), (12.5, 6.3, 0.4), (0.15, 6.4, 0.35), (6.6, 6.2, 0.45), (12.6, -0.2, 0.4)])
    hd = heading(s, c.get('kicker', ''), c['title'], w=5.8)
    txt = c.get('text', '')
    th = sum(K.n_lines(p_.replace('**', ''), F('body'), 12.5, 5.5) for p_ in txt.split('\n')) * 12.5 * 1.3 / 72 \
        + 0.11 * txt.count('\n')
    body = rich(s, ML, 2.15, 5.6, th + 0.3, txt, size=12.5, line_sp=1.3, space_after=8)
    fy = max(3.4, 2.15 + th + 0.55)
    facts = []
    for i, (ic, t) in enumerate(c.get('facts', [])[:4]):
        y = fy + i * 0.6
        facts.append([K.icon(s, ic, ML, y + 0.06, 0.32, P['gold']),
                      K.text(s, ML + 0.5, y, 5.1, 0.45, t, size=12.5, font=F('semi'), color=P['cream'], anchor='m')])
    ph = c['photos']
    caps = c.get('captions', [''] * len(ph))
    pos = ((7.0, 0.7, 4.0, 3.55, -3), (10.2, 1.6, 2.75, 3.1, 5), (7.9, 3.85, 3.2, 3.15, 3))
    pols = [polaroid(s, ctx, ph[i], *pos[i][:4], caps[i], pos[i][4], nm=f'!!pol{i}') for i in range(min(3, len(ph)))]
    cam = None
    if c.get('camera'):
        cam = K.picture(s, pic(ctx, c['camera'], cut=True), 10.6, 4.75, 2.5, 2.2, fit='contain', nm='!!cam')
        K.shadow(cam, blur=0.3, dist=0.1, alpha=55, color='000000', angle=90)
    K.anims(s, hd, 'fade', 0.0, 0.1, 0.5)
    K.anim(s, body, 'fade', 0.4, 0.6)
    K.anims(s, facts, 'fly_l', 0.7, 0.15, 0.4)
    K.anims(s, pols, 'zoom', 0.3, 0.25, 0.55)
    if cam is not None:
        K.anim(s, cam, 'rise', 1.2, 0.6)
    page_no(s, ctx['n'])
    return s


# ================================================================== 9. food — round dishes
def food(prs, ctx, c):
    s = _new(prs, ctx)
    lanterns(s, ctx, [(12.3, 0.1, 0.5), (0.3, 0.2, 0.45), (2.6, 0.7, 0.35), (9.4, -0.3, 0.35), (10.4, 0.75, 0.3)])
    hd = heading(s, c.get('kicker', ''), c['title'], x=0, w=SW, align='c')
    items = c['items'][:4]
    n = len(items)
    cw = (SW - 2 * ML) / n
    d = min(2.45, cw - 0.5)
    out = []
    for i, it in enumerate(items):
        cx = ML + cw * (i + 0.5)
        ring = K.oval(s, cx - d / 2 - 0.16, 2.0 - 0.16, d + 0.32, fill=None, line=P['gold'], lw=1.0, dash='dash')
        dp = dish(s, ctx, it['photo'], cx, 2.0 + d / 2, d, focus=it.get('focus', (0.5, 0.5)))
        nm_ = K.text(s, cx - cw / 2 + 0.1, 2.25 + d, cw - 0.2, 0.5, it['name'], size=18, font=F('title'),
                     color=P['gold2'], align='c', anchor='m')
        tx = rich(s, cx - cw / 2 + 0.2, 2.8 + d, cw - 0.4, 0.8, it.get('text', ''), size=11, align='c', line_sp=1.2)
        ch = []
        if it.get('price'):
            lab = it['price']
            w = K.text_w(lab, F('semi'), 10) + 0.4
            pc = K.rect(s, cx - w / 2, 3.65 + d, w, 0.34, fill=None, line=P['gold'], lw=0.75, radius=0.17)
            K.shape_text(pc, lab, size=10, font=F('semi'), color=P['gold'], margin=(0.05, 0))
            ch = [pc]
        out.append([ring, dp, nm_, tx] + ch)
    K.anims(s, hd, 'fade', 0.0, 0.1, 0.5)
    K.anims(s, out, 'zoom', 0.3, 0.2, 0.55)
    page_no(s, ctx['n'])
    return s


# ================================================================== 10. events — big polaroid + timeline
def events(prs, ctx, c):
    s = _new(prs, ctx)
    lanterns(s, ctx, [(5.5, 0.2, 0.6), (12.5, 6.2, 0.45), (6.0, 6.3, 0.4), (12.6, 0.0, 0.45), (0.1, 6.5, 0.3)])
    pol = polaroid(s, ctx, c['photo'], 0.75, 0.9, 4.9, 5.8, c.get('caption', ''), -3, focus=c.get('focus', (0.5, 0.5)),
                   nm='!!pol0')
    hd = heading(s, c.get('kicker', ''), c['title'], x=6.6, w=SW - ML - 6.6)
    items = c['items'][:4]
    vl = K.line(s, 7.05, 2.25, 7.05, 2.25 + 1.15 * (len(items) - 0.4), P['gold'], 1.0, alpha=60)
    out = []
    for i, (when, name, text) in enumerate(items):
        y = 2.1 + i * 1.15
        b = K.oval(s, 6.6, y, 0.9, fill=P['navy3'], line=P['gold'], lw=1.25)
        K.shape_text(b, when, size=10, font=F('semi'), color=P['gold2'], margin=(0.02, 0), line_sp=0.9)
        a = K.text(s, 7.75, y - 0.02, SW - ML - 7.75, 0.42, name, size=16, font=F('title'), color=P['cream'],
                   anchor='m')
        t = rich(s, 7.75, y + 0.4, SW - ML - 7.75, 0.7, text, size=11, line_sp=1.15)
        out.append([b, a, t])
    K.anim(s, pol, 'fly_l', 0.1, 0.7)
    K.anims(s, hd, 'fade', 0.3, 0.1, 0.5)
    K.anim(s, vl, 'wipe_d', 0.6, 0.8)
    K.anims(s, out, 'fly_r', 0.7, 0.18, 0.45)
    page_no(s, ctx['n'])
    return s


# ================================================================== 11. itinerary — boarding-pass cards
def itinerary(prs, ctx, c):
    s = _new(prs, ctx)
    lanterns(s, ctx, [(12.3, 0.05, 0.5), (11.4, -0.3, 0.35), (0.15, 6.5, 0.3), (6.4, 6.65, 0.3), (12.7, 6.4, 0.3)])
    hd = heading(s, c.get('kicker', ''), c['title'])
    days = c['days'][:3]
    n = len(days)
    gap = 0.35
    w = (SW - 2 * ML - gap * (n - 1)) / n
    y, h = 1.95, 5.05
    out = []
    for i, d in enumerate(days):
        x = ML + i * (w + gap)
        body = K.rect(s, x, y, w, h, fill=P['cream'], radius=0.12)
        K.shadow(body, blur=0.35, dist=0.1, alpha=45, color='000000', angle=90)
        K._ensure_ln_before_effects(body)
        top = K.rect(s, x, y, w, 1.15, fill=P['gold'], shp=MSO_SHAPE.ROUND_2_SAME_RECTANGLE)
        top.adjustments[0] = 0.12 / 1.15
        ic = K.icon(s, d.get('icon', 'plane'), x + w - 0.75, y + 0.3, 0.45, P['navy'])
        a = K.text(s, x + 0.3, y + 0.14, w - 1.2, 0.5, d['day'], size=22, font=F('title'), color=P['navy'], anchor='m')
        b = K.text(s, x + 0.3, y + 0.62, w - 1.2, 0.38, d.get('theme', ''), size=11.5, font=F('semi'),
                   color=P['navy'], anchor='m')
        perf = K.line(s, x + 0.25, y + 1.38, x + w - 0.25, y + 1.38, P['muted'], 1.0, dash='dash')
        n1 = K.oval(s, x - 0.14, y + 1.24, 0.28, fill=P['navy'])
        n2 = K.oval(s, x + w - 0.14, y + 1.24, 0.28, fill=P['navy'])
        rows = []
        for k, (tm, tx) in enumerate(d['stops'][:4]):
            ry = y + 1.6 + k * 0.78
            rows.append(K.text(s, x + 0.3, ry, 0.95, 0.3, tm, size=10.5, font=F('bold'), bold=True, color='A8813A'))
            rows.append(K.text(s, x + 1.25, ry - 0.02, w - 1.5, 0.75, tx, size=11.5, font=F('body'), color=P['ink'],
                               line_sp=1.12))
        bars = []
        bx = x + 0.3
        rng = [0.02, 0.04, 0.015, 0.03, 0.05, 0.02, 0.035, 0.015, 0.045, 0.02, 0.03, 0.015, 0.04, 0.025, 0.02,
               0.05, 0.015, 0.03, 0.02, 0.04]
        for k, bw_ in enumerate(rng * 2):
            if bx + bw_ > x + w - 1.3:
                break
            bars.append(K.rect(s, bx, y + h - 0.55, bw_, 0.32, fill=P['ink']))
            bx += bw_ + 0.03
        code = K.text(s, x + w - 1.25, y + h - 0.6, 1.0, 0.4, d.get('code', f'DAD 0{i + 1}'), size=11,
                      font=F('semi'), color=P['ink'], align='r', anchor='m', spacing=1)
        out.append([body, top, ic, a, b, perf, n1, n2] + rows + bars + [code])
    K.anims(s, hd, 'fade', 0.0, 0.1, 0.5)
    K.anims(s, out, 'rise', 0.3, 0.25, 0.6)
    page_no(s, ctx['n'])
    return s


# ================================================================== 12. thanks
def thanks(prs, ctx, c):
    s = _new(prs, ctx, tr=1.6)
    lanterns(s, ctx, [(5.9, 0.3, 1.0), (4.4, 4.9, 0.6), (11.9, 0.2, 0.75), (0.25, 0.3, 0.55), (12.1, 5.5, 0.7)])
    sc = K.text(s, ML, 1.35, 7.0, 1.1, c.get('script', 'Hẹn gặp lại'), size=60, font=F('script'), color=P['gold2'],
                nm='!!kicker', wrap=False)
    t = c.get('title', 'Đà Nẵng').upper()
    sz = fit(t, 'title', 80, 6.0, 40)
    tt = K.text(s, ML, 2.35, 7.0, sz / 72 * 1.3, t, size=sz, font=F('title'), color=P['gold'], nm='!!ttl', wrap=False,
                spacing=2)
    y = 2.45 + sz / 72 * 1.3
    orn = ornament(s, ML + 0.05, y, 2.2)
    sub = K.text(s, ML, y + 0.2, 6.0, 0.5, c.get('sub', ''), size=16, font=F('italic'), color=P['cream'])
    rows = []
    yy = y + 0.95
    for ic, tx in c.get('lines', [])[:4]:
        rows.append([K.icon(s, ic, ML, yy + 0.05, 0.3, P['gold']),
                     K.text(s, ML + 0.48, yy, 5.8, 0.4, tx, size=12.5, font=F('semi'), color=P['cream'], anchor='m')])
        yy += 0.5
    pol = polaroid(s, ctx, c['photo'], 7.6, 1.0, 4.4, 5.0, c.get('caption', ''), 5, focus=c.get('focus', (0.5, 0.5)),
                   nm='!!pol0') if c.get('photo') else None
    cam = None
    if c.get('camera'):
        cam = K.picture(s, pic(ctx, c['camera'], cut=True), 6.2, 4.6, 2.9, 2.5, fit='contain', nm='!!cam')
        K.shadow(cam, blur=0.3, dist=0.1, alpha=55, color='000000', angle=90)
    K.anim(s, sc, 'wipe_l', 0.2, 0.9)
    K.anim(s, tt, 'rise', 0.6, 0.8)
    K.anims(s, orn, 'wipe_l', 1.1, 0.1, 0.4)
    K.anim(s, sub, 'fade', 1.2, 0.5)
    K.anims(s, rows, 'fade', 1.4, 0.12, 0.4)
    if pol is not None:
        K.anim(s, pol, 'zoom', 0.4, 0.7)
    if cam is not None:
        K.anim(s, cam, 'rise', 1.0, 0.6)
    return s


# ================================================================== credits (hidden)
def credits(prs, ctx, c):
    s = _new(prs, ctx)
    s._element.set('show', '0')
    K.text(s, ML, 0.45, 11, 0.6, 'Nguồn hình ảnh', size=26, font=F('title'), color=P['gold'])
    K.text(s, ML, 1.1, 12, 0.5, 'Slide ẩn — không hiển thị khi trình chiếu. ' + c['intro'], size=10, font=F('body'),
           color=P['muted'])
    lines = c['lines']
    half = (len(lines) + 1) // 2
    for col, chunk in enumerate((lines[:half], lines[half:])):
        K.text(s, ML + col * 6.1, 1.8, 5.9, 5.4, '\n'.join(chunk), size=8, font=F('body'), color=P['text'],
               line_sp=1.05)
    return s
