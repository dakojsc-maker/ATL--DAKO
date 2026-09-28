"""
"Heritage" layouts — modelled on the Hội An reference deck.

Look & feel
    * full-bleed photographs darkened from the left, blurred photos for transitions, old-paper (parchment) slides
    * thin high-contrast serif capitals for titles, condensed gold serif for the sub-title, bold serif for names
    * rounded photo cards with a cream hairline border, frosted-glass cards, torn-edge polaroids, gold brush ribbon
    * Morph: the background photo ('!!bg'), section title ('!!ttl') and sub-title ('!!sub') keep their names across
      slides so PowerPoint glides / cross-fades them; content pieces enter with staggered animations.
Each layout: fn(prs, ctx, c) -> slide.   ctx = dict(n, img{key: path}, size{key: (w, h)}, map{...})
"""
import re

import pptkit as K

SW, SH, ML = K.SW, K.SH, 0.7

# ------------------------------------------------------------------ design tokens
P = dict(
    navy='0D2136', navy2='16324F', sea='123553', gold='C9A15B', gold2='E2BF7A', amber='D69A3A',
    cream='F4E8CE', paper='F3EAD4', brown='3D2B1B', brown2='5C4632', muted='8E7B62', red='A5412B',
    line='CDB88F', white='FFFFFF',
)

# font face names (as installed from fonts/heritage/*.ttf) + the file used for text measuring
FONTS = dict(
    disp=('Noto Serif Display ExtraCondensed SemiBold', 'NotoSerifDisplay-ExtraCondensedSemiBold.ttf'),
    title=('Noto Serif Display Light', 'NotoSerifDisplay-Light.ttf'),
    name=('Playfair Display', 'PlayfairDisplay-Bold.ttf'),
    body=('Noto Serif', 'NotoSerif-Regular.ttf'),
    bodyb=('Noto Serif', 'NotoSerif-Bold.ttf'),
    italic=('Noto Serif Display Light', 'NotoSerifDisplay-LightItalic.ttf'),
)


def F(role):
    return FONTS[role][0]


def register(theme_key='heritage'):
    """Register theme + fonts with pptkit."""
    K.THEMES[theme_key] = dict(
        name='Heritage', key=theme_key,
        bg_light=P['paper'], bg_dark=P['navy'],
        ink=P['brown'], text=P['brown2'], muted=P['muted'], soft='EADDBE',
        card=P['navy'], card2=P['navy2'], accent=P['gold'], accent_ink=P['navy'],
        violet=P['amber'], hot=P['red'], up='6E8B3D', line=P['line'],
        chart=[P['gold'], P['navy2'], P['amber'], P['red']],
        blob_light=[(P['gold2'], 40), (P['amber'], 25), (P['gold'], 30)],
        blob_dark=[(P['gold'], 30), (P['navy2'], 60), (P['amber'], 25)],
        tint=P['navy'], grid_dark='2B4766', row_alt='EFE2C6',
    )
    K.set_theme(theme_key)
    for role, (face, fname) in FONTS.items():
        K.FONT_FILES[face if role != 'bodyb' else face + ' Bold'] = 'heritage/' + fname
        K.FONT_FILES[face] = 'heritage/' + FONTS[role][1] if face not in K.FONT_FILES else K.FONT_FILES[face]


# ------------------------------------------------------------------ helpers
def _new(prs, ctx, dark=True, tr=1.2, kind='morph'):
    ctx['n'] += 1
    s = K.blank_slide(prs, dark)
    if ctx['n'] > 1:
        if kind == 'morph':
            K.morph(s, tr)
        else:
            K.fade_tr(s, tr)
    return s


def img(ctx, key):
    return ctx['img'][key]


def page_no(s, n, dark=True):
    K.text(s, SW - ML - 0.8, SH - 0.45, 0.8, 0.28, f'{n:02d}', size=10, font=F('title'),
           color=P['cream'] if dark else P['muted'], align='r', alpha=70 if dark else None)


def bg_photo(s, path, nm='!!bg', shade='left', strength=1.0):
    """Full-bleed photo + gradient shade for legibility."""
    pic = K.picture(s, path, 0, 0, SW, SH, nm=nm)
    out = [pic]
    if shade:
        ov = K.rect(s, 0, 0, SW, SH, nm='!!shade')
        a = lambda v: min(100, v * strength)  # noqa: E731
        if shade == 'left':
            stops = [(0, P['navy'], a(90)), (42, P['navy'], a(72)), (72, P['navy'], a(35)), (100, P['navy'], a(12))]
            K.grad_fill(ov, stops, angle=0)
        elif shade == 'full':
            K.grad_fill(ov, [(0, P['navy'], a(70)), (100, P['navy'], a(55))], angle=90)
        elif shade == 'top':
            K.grad_fill(ov, [(0, P['navy'], a(70)), (45, P['navy'], a(15)), (100, P['navy'], 0)], angle=90)
        elif shade == 'bottom':
            K.grad_fill(ov, [(0, P['navy'], 0), (55, P['navy'], a(20)), (100, P['navy'], a(80))], angle=90)
        out.append(ov)
    return out


def paper_bg(s, ctx):
    return K.picture(s, img(ctx, 'parchment'), 0, 0, SW, SH, nm='!!paper')


def heading(s, title, sub, x=ML, y=0.55, w=7.5, dark=True, align='l', t_size=30, s_size=17):
    """Thin serif caps title + gold condensed sub-title (morph-named)."""
    tcol = P['cream'] if dark else P['brown']
    tsz = K.fit_size(title.upper(), F('title'), t_size, w, 1, 0.7)
    t = K.text(s, x, y, w, 0.6, title.upper(), size=tsz, font=F('title'), color=tcol, align=align, anchor='b',
               spacing=0.5, nm='!!ttl')
    u = K.text(s, x, y + 0.62, w, 0.38, sub.upper(), size=s_size, font=F('disp'), color=P['gold2'] if dark else P['gold'],
               align=align, spacing=1.5, nm='!!sub')
    return t, u


def rich(s, x, y, w, h, content, size=12, color=None, bold_color=None, align='j', line_sp=1.18, space_after=5,
         font=None, nm=None):
    """'**bold**' markup -> runs; '\n' = new paragraph."""
    color = color or P['cream']
    bold_color = bold_color or color
    paras = []
    for para in content.split('\n'):
        runs = []
        for i, part in enumerate(re.split(r'\*\*', para)):
            if not part:
                continue
            if i % 2:
                runs.append((part, {'bold': True, 'color': bold_color, 'font': F('body')}))
            else:
                runs.append((part, {}))
        paras.append(runs or [''])
    return K.text(s, x, y, w, h, paras, size=size, font=font or F('body'), color=color, align=align, line_sp=line_sp,
                  space_after=space_after, nm=nm)


def photo(s, path, x, y, w, h, focus=(0.5, 0.5), caption=None, radius=0.14, border=P['cream'], bw=1.5,
          shadow=True, nm=None, cap_size=10):
    """Rounded photo card with hairline border, optional caption band."""
    pic = K.picture(s, path, x, y, w, h, radius=radius, focus=focus, border=border, border_w=bw, nm=nm)
    if shadow:
        K.shadow(pic, blur=0.28, dist=0.1, alpha=45, color='000000', angle=90)
        K._ensure_ln_before_effects(pic)
    out = [pic]
    if caption:
        ov = K.rect(s, x, y, w, h, radius=radius)
        K.grad_fill(ov, [(0, P['navy'], 0), (55, P['navy'], 8), (100, P['navy'], 82)], angle=90)
        tx = K.text(s, x + 0.1, y + h - 0.5, w - 0.2, 0.4, caption.upper(), size=cap_size, font=F('title'),
                    color=P['cream'], align='c', anchor='m', spacing=0.8)
        out += [ov, tx]
    return out


def roman(n):
    vals = [(10, 'X'), (9, 'IX'), (5, 'V'), (4, 'IV'), (1, 'I')]
    out = ''
    for v, sym in vals:
        while n >= v:
            out += sym
            n -= v
    return out


def diamond(s, cx, cy, d=0.12, color=None):
    r = K.rect(s, cx - d / 2, cy - d / 2, d, d, fill=color or P['gold'], rot=45)
    return r


def ornament(s, cx, y, w=2.2, color=None, dark=True):
    """Thin line — diamond — thin line divider."""
    col = color or (P['gold2'] if dark else P['gold'])
    a = K.line(s, cx - w / 2, y, cx - 0.14, y, col, 0.9)
    d = diamond(s, cx, y, 0.1, col)
    b = K.line(s, cx + 0.14, y, cx + w / 2, y, col, 0.9)
    return [a, d, b]


def _serif_chart(gf, size=10, color=None):
    ch = gf.chart
    ch.font.name = F('body')
    ch.font.size = K.Pt(size)
    if color:
        ch.font.color.rgb = K.rgb(color)
    for ax in (ch.category_axis, ch.value_axis):
        ax.tick_labels.font.name = F('body')
    return gf


def _gold_columns(gf, top=P['gold2'], bottom=P['amber']):
    """Vertical gold gradient fill on every series (chart stays native / editable)."""
    for ser in gf.chart.plots[0].series:
        spPr = ser._element.get_or_add_spPr()
        for el in list(spPr):
            spPr.remove(el)
        spPr.append(K.X(f'<a:gradFill rotWithShape="1"><a:gsLst>'
                        f'<a:gs pos="0"><a:srgbClr val="{top}"/></a:gs>'
                        f'<a:gs pos="100000"><a:srgbClr val="{bottom}"/></a:gs></a:gsLst>'
                        f'<a:lin ang="5400000" scaled="0"/></a:gradFill>'))
        spPr.append(K.X('<a:ln><a:noFill/></a:ln>'))


# ================================================================== 1. cover
def cover(prs, ctx, c):
    s = _new(prs, ctx)
    bg = bg_photo(s, img(ctx, 'cover'), shade='top', strength=0.9)
    x0 = c.get('title_x', 5.6)
    a = K.text(s, x0, 0.55, 7.2, 0.5, c['kicker'].upper(), size=19, font=F('italic'), italic=True, color=P['cream'],
               spacing=4, anchor='b', nm='!!kicker')
    b = K.text(s, x0, 1.0, 3.2, 1.5, c['title1'].upper(), size=70, font=F('disp'), color=P['cream'], anchor='b',
               nm='!!t1')
    t2 = K.text(s, x0 + 2.55, 0.55, 5.5, 2.2, c['title2'].upper(), size=150, font=F('disp'), color=P['cream'],
                anchor='b', nm='!!t2', line_sp=0.85)
    for t in (b, t2):
        _text_shadow(t)
    fg = None
    if 'cover_fg' in ctx['img']:
        fg = K.picture(s, img(ctx, 'cover_fg'), 0, 0, SW, SH, nm='!!fg')
    # presenter strip
    ln = K.line(s, ML, SH - 1.02, ML + 0.9, SH - 1.02, P['gold2'], 1.25)
    info = K.text(s, ML, SH - 0.95, 8.5, 0.62, [[(c['info1'], {'font': F('disp'), 'size': 15, 'color': P['gold2'],
                                                                'spacing': 1.5})],
                                                  [(c['info2'], {})]],
                  size=11.5, font=F('body'), color=P['cream'], line_sp=1.1)
    K.anim(s, bg[0], 'zoom', 0.0, 1.4)
    K.anim(s, a, 'wipe_l', 0.5, 0.8)
    K.anim(s, b, 'rise', 0.7, 0.8)
    K.anim(s, t2, 'zoom', 0.9, 1.0)
    if fg is not None:
        K.anim(s, fg, 'fade', 0.0, 0.5)
    K.anim(s, ln, 'wipe_l', 1.4, 0.5)
    K.anim(s, info, 'fade', 1.5, 0.6)
    K.notes(s, c.get('notes', 'Slide bìa.'))
    return s


def _text_shadow(tb, alpha=45, blur=0.12, dist=0.05):
    """Outer shadow on every run of a text box (text effect, stays editable)."""
    for r in tb._element.iter(K.qn('a:rPr')):
        eff = K.etree.SubElement(r, K.qn('a:effectLst'))
        sh = K.etree.SubElement(eff, K.qn('a:outerShdw'))
        sh.set('blurRad', str(int(blur * 914400)))
        sh.set('dist', str(int(dist * 914400)))
        sh.set('dir', str(5400000))
        sh.set('algn', 'ctr')
        sh.set('rotWithShape', '0')
        cc = K.etree.SubElement(sh, K.qn('a:srgbClr'))
        cc.set('val', '1A1206')
        al = K.etree.SubElement(cc, K.qn('a:alpha'))
        al.set('val', str(alpha * 1000))
        # effectLst must precede latin/ea/cs inside rPr
        first_font = r.find(K.qn('a:latin'))
        if first_font is not None:
            first_font.addprevious(eff)


# ================================================================== 2. agenda
def agenda(prs, ctx, c):
    s = _new(prs, ctx, dark=False)
    paper_bg(s, ctx)
    t = K.text(s, ML, 0.7, 6.0, 0.9, c['title'].upper(), size=46, font=F('title'), color=P['brown'], anchor='b',
               spacing=1, nm='!!ttl')
    u = K.text(s, ML, 1.6, 6.0, 0.4, c['sub'].upper(), size=18, font=F('disp'), color=P['gold'], spacing=1.5,
               nm='!!sub')
    rows = []
    for i, (name, desc) in enumerate(c['items']):
        y = 2.45 + i * 0.86
        num = K.text(s, ML, y, 0.9, 0.62, roman(i + 1), size=30, font=F('disp'), color=P['gold'], anchor='m')
        nm_ = K.text(s, ML + 0.95, y + 0.02, 5.6, 0.36, name.upper(), size=15, font=F('name'), color=P['brown'],
                     anchor='m', spacing=0.5)
        ds = K.text(s, ML + 0.95, y + 0.36, 5.6, 0.3, desc, size=10.5, font=F('body'), color=P['brown2'], italic=True)
        ln = K.line(s, ML + 0.95, y + 0.74, ML + 6.3, y + 0.74, P['line'], 0.75, dash='sysDot')
        rows.append([num, nm_, ds, ln])
    # photo stack
    p1 = photo(s, img(ctx, c['images'][0]), 7.75, 0.6, 3.6, 5.0, focus=(0.5, 0.5), border=P['white'], bw=2.5)
    p2 = photo(s, img(ctx, c['images'][1]), 10.15, 3.55, 2.55, 3.3, focus=(0.5, 0.5), border=P['white'], bw=2.5)
    em = K.picture(s, img(ctx, 'emblem'), 7.2, 5.25, 1.25, 1.25)
    page_no(s, ctx['n'], dark=False)
    K.anim(s, t, 'wipe_l', 0.0, 0.7)
    K.anim(s, u, 'fade', 0.35, 0.5)
    K.anims(s, rows, 'rise', 0.5, 0.12, 0.45)
    K.anims(s, [p1, p2], 'fly_r', 0.3, 0.2, 0.7)
    K.anim(s, em, 'zoom', 1.0, 0.5)
    return s


# ================================================================== 3. map
def map_slide(prs, ctx, c):
    s = _new(prs, ctx, tr=1.4)
    m = ctx['map']
    mp = K.picture(s, m['path'], 0, 0, SW, SH, nm='!!bg')
    tx0 = 7.9
    t = K.text(s, tx0, 0.55, SW - tx0 - ML, 0.6, c['title'].upper(), size=30, font=F('title'), color=P['cream'],
               align='r', anchor='b', spacing=0.5, nm='!!ttl')
    u = K.text(s, tx0, 1.17, SW - tx0 - ML, 0.38, c['sub'].upper(), size=17, font=F('disp'), color=P['gold2'],
               align='r', spacing=1.5, nm='!!sub')
    body = rich(s, 9.1, 2.0, SW - 9.1 - ML, 4.0, c['body'], size=12, color=P['cream'], bold_color=P['gold2'])
    sea = K.text(s, 9.1, SH - 1.0, SW - 9.1 - ML, 0.35, c.get('sea', 'BIỂN ĐÔNG'), size=11, font=F('italic'),
                 italic=True, color=P['cream'], align='r', spacing=6, alpha=55)
    # markers + route
    (ax, ay), (bx, by) = m['pts'][c['from']], m['pts'][c['to']]
    route = K.s_curve(s, ax, ay, bx, by, P['amber'], 2.25, dash='dash')
    route.name = 'route'
    tags = []
    for key, (px, py), dx in ((c['from'], (ax, ay), 0.18), (c['to'], (bx, by), 0.18)):
        dot = K.oval(s, px - 0.07, py - 0.07, 0.14, fill=P['amber'], line=P['white'], lw=1.5)
        lab = c['labels'][key]
        w = max(0.95, K.text_w(lab, F('bodyb'), 11) + 0.4)
        tag = K.rect(s, px + dx, py - 0.19, w, 0.38, fill=P['amber'], radius=0.06)
        K.shadow(tag, blur=0.12, dist=0.04, alpha=40, color='000000')
        K.shape_text(tag, lab, size=11, font=F('bodyb'), color=P['navy'], bold=True)
        tags.append([dot, tag])
    mx, my = (ax + bx) / 2, (ay + by) / 2
    km = K.text(s, mx - 1.25, my - 0.2, 1.0, 0.4, c['distance'], size=16, font=F('disp'), color=P['amber'],
                align='r', anchor='m')
    _text_shadow(km, alpha=60)
    page_no(s, ctx['n'])
    K.anim(s, t, 'wipe_l', 0.3, 0.7)
    K.anim(s, u, 'fade', 0.6, 0.5)
    K.anim(s, body, 'rise', 0.8, 0.6)
    K.anim(s, sea, 'fade', 1.0, 0.8)
    K.anims(s, tags, 'zoom', 1.1, 0.25, 0.4)
    K.anim(s, route, 'wipe_d', 1.6, 1.0)
    K.anim(s, km, 'fade', 2.4, 0.5)
    return s


# ================================================================== 4. glass timeline card
def glass_timeline(prs, ctx, c):
    s = _new(prs, ctx)
    bg = bg_photo(s, img(ctx, c['bg']), shade='left', strength=0.95)
    t, u = heading(s, c['title'], c['sub'])
    h = K.text(s, ML, 2.25, 5.6, 0.45, c['heading'], size=17, font=F('name'), color=P['cream'])
    body = rich(s, ML, 2.8, 5.4, 2.5, c['body'], size=12.5, bold_color=P['gold2'])
    gx, gy, gw, gh = 7.55, 0.9, 4.95, 5.7
    glass = K.glass(s, img(ctx, c['bg_blur']), gx, gy, gw, gh, radius=0.3, tint=P['navy'], tint_alpha=35)
    ib = K.rect(s, gx + 0.4, gy + 0.45, 0.8, 0.8, fill=None, line=P['cream'], lw=1.25, radius=0.08)
    ic = K.icon(s, c.get('icon', 'landmark'), gx + 0.55, gy + 0.6, 0.5, P['cream'])
    yr = K.rect(s, gx + 1.35, gy + 0.53, gw - 1.75, 0.64, fill=None, line=P['cream'], lw=1.25, radius=0.08)
    K.shape_text(yr, c['badge'], size=18, font=F('name'), color=P['cream'], bold=False, align='l', margin=(0.22, 0))
    vl = K.line(s, gx + 0.8, gy + 1.25, gx + 0.8, gy + gh - 0.5, P['cream'], 1.25)
    items = []
    for i, it in enumerate(c['items']):
        y = gy + 1.75 + i * 1.35
        dot = K.oval(s, gx + 0.8 - 0.1, y + 0.08, 0.2, fill=None, line=P['cream'], lw=1.5)
        tx = rich(s, gx + 1.2, y, gw - 1.6, 1.2, it, size=12, align='l', bold_color=P['gold2'])
        items.append([dot, tx])
    page_no(s, ctx['n'])
    K.anim(s, h, 'wipe_l', 0.3, 0.6)
    K.anim(s, body, 'fade', 0.5, 0.7)
    K.anims(s, glass, 'fly_r', 0.4, 0.0, 0.8)
    K.anims(s, [[ib, ic], yr], 'zoom', 1.1, 0.15, 0.45)
    K.anim(s, vl, 'wipe_d', 1.3, 0.7)
    K.anims(s, items, 'rise', 1.5, 0.25, 0.5)
    return s


# ================================================================== 5. section divider (glass panel + emblem)
def section(prs, ctx, c):
    s = _new(prs, ctx, tr=1.4)
    bg = bg_photo(s, img(ctx, c['bg']), shade='full', strength=0.45)
    gx, gy, gw, gh = 1.9, 1.35, SW - 3.8, 4.9
    glass = K.glass(s, img(ctx, c['bg_blur']), gx, gy, gw, gh, radius=0.35, tint='FFFFFF', tint_alpha=12)
    em = K.picture(s, img(ctx, 'emblem'), SW / 2 - 0.62, gy - 0.62, 1.24, 1.24, nm='!!emblem')
    num = K.text(s, gx, gy + 0.85, gw, 0.4, f'PHẦN {roman(c["num"])}', size=14, font=F('disp'), color=P['gold2'],
                 align='c', spacing=4)
    t = K.text(s, gx + 0.3, gy + 1.35, gw - 0.6, 1.2, c['title'].upper(), size=K.fit_size(c['title'].upper(), F('title'), 54, gw - 0.8),
               font=F('title'), color=P['cream'], align='c', anchor='m', spacing=1, nm='!!ttl')
    _text_shadow(t, alpha=35)
    u = K.text(s, gx, gy + 2.6, gw, 0.7, c['sub'].upper(), size=34, font=F('disp'), color=P['white'], align='c',
               spacing=2, nm='!!sub')
    orn = ornament(s, SW / 2, gy + 3.55, 3.0)
    ds = K.text(s, gx + 1.2, gy + 3.75, gw - 2.4, 0.8, c.get('desc', ''), size=12, font=F('body'), italic=True,
                color=P['cream'], align='c', alpha=85)
    K.anim(s, bg[0], 'zoom', 0.0, 1.2)
    K.anims(s, glass, 'zoom', 0.2, 0.0, 0.8)
    K.anim(s, em, 'zoom', 0.7, 0.5)
    K.anim(s, num, 'fade', 0.8, 0.5)
    K.anims(s, orn, 'wipe_l', 1.1, 0.05, 0.5)
    K.anim(s, ds, 'fade', 1.3, 0.6)
    K.notes(s, f'Chuyển sang phần {roman(c["num"])}: {c["title"]}.')
    return s


# ================================================================== 6. charts on parchment + brush ribbon
def charts(prs, ctx, c):
    s = _new(prs, ctx, dark=False)
    paper_bg(s, ctx)
    t, u = heading(s, c['title'], c['sub'], dark=False, w=5.8)
    st = K.text(s, 6.9, 0.55, SW - 6.9 - ML, 0.95, c['stat'], size=17, font=F('body'), color=P['brown'], line_sp=1.1)
    bw_, bh_ = 8.6, 0.8
    bx = (SW - bw_) / 2
    ban = K.picture(s, img(ctx, 'banner'), bx, 1.72, bw_, bh_)
    bt = K.text(s, bx, 1.72, bw_, bh_, c['banner'].upper(), size=15, font=F('disp'), color=P['navy'], align='c',
                anchor='m', spacing=1.5)
    grp = []
    for i, (hd, cats, vals, fmt, axis) in enumerate(c['charts']):
        x = ML + i * 6.2
        h = K.text(s, x, 2.75, 5.7, 0.4, hd.upper(), size=14, font=F('name'), color=P['amber'], align='c')
        ch = K.chart_bar(s, x, 3.15, 5.8, 3.75, cats, [(hd, vals)], legend=False, labels=True, gap=55,
                         num_fmt=fmt, font_size=9, label_color=P['brown'])
        _gold_columns(ch)
        _serif_chart(ch, 9, P['muted'])
        ch.chart.value_axis.has_major_gridlines = False
        ax = K.text(s, x - 0.05, 3.0, 1.3, 0.25, axis, size=8, font=F('body'), color=P['muted'], italic=True)
        grp.append([h, ax, ch])
    note = K.text(s, ML, SH - 0.42, 7, 0.25, c.get('note', 'Số liệu minh họa — thay bằng dữ liệu của bạn'), size=8.5,
                  font=F('body'), italic=True, color=P['muted'])
    page_no(s, ctx['n'], dark=False)
    K.anim(s, st, 'fade', 0.3, 0.6)
    K.anim(s, ban, 'wipe_l', 0.6, 0.8)
    K.anim(s, bt, 'fade', 1.1, 0.5)
    t0 = 1.2
    for h, ax, ch in grp:
        K.anims(s, [h, ax], 'fade', t0, 0.0, 0.4)
        K.anim(s, ch, 'wipe_u', t0 + 0.2, 1.0)
        t0 += 0.35
    return s


# ================================================================== 7. place (name + story + photo collage)
COLLAGES = {
    # (x, y, w, h) boxes on the right half
    'grid4': [(7.25, 0.95, 2.7, 2.55), (10.1, 0.95, 2.55, 2.55), (7.25, 3.65, 2.7, 2.75), (10.1, 3.65, 2.55, 2.75)],
    'wide_top': [(7.1, 0.95, 5.55, 2.85), (7.1, 3.95, 2.7, 2.45), (9.95, 3.95, 2.7, 2.45)],
    'wide_bottom': [(7.1, 0.95, 2.7, 2.5), (9.95, 0.95, 2.7, 2.5), (7.1, 3.6, 5.55, 2.8)],
    'five': [(8.15, 0.95, 2.15, 2.25), (10.45, 0.95, 2.2, 2.25), (6.95, 3.35, 1.8, 2.8), (8.9, 3.35, 1.8, 2.8),
             (10.85, 3.35, 1.8, 2.8)],
    'row3': [(6.9, 3.65, 1.85, 2.6), (8.85, 3.65, 1.85, 2.6), (10.8, 3.65, 1.85, 2.6)],
}


def place(prs, ctx, c):
    s = _new(prs, ctx)
    bg_photo(s, img(ctx, c['bg']), shade='left', strength=c.get('shade', 1.0))
    t, u = heading(s, c['title'], c['sub'])
    tw = 5.6
    nsz = K.fit_size(c['name'], F('name'), 38, tw, 2, 0.75)
    name = K.text(s, ML, 2.15, tw, 1.45, c['name'], size=nsz, font=F('name'), color=P['gold2'], anchor='b',
                  line_sp=0.98)
    _text_shadow(name, alpha=50)
    body = rich(s, ML, 3.75, tw - 0.2, 2.9, c['body'], size=12, bold_color=P['gold2'])
    boxes = COLLAGES[c.get('collage', 'grid4')]
    pics = []
    for (x, y, w, h), key in zip(boxes, c['photos']):
        foc = (0.5, 0.5)
        if isinstance(key, tuple):
            key, foc = key
        pics.append(photo(s, img(ctx, key), x, y, w, h, focus=foc))
    page_no(s, ctx['n'])
    K.anims(s, pics, 'fly_r', 0.2, 0.18, 0.7)
    K.anim(s, name, 'wipe_l', 0.5, 0.7)
    K.anim(s, body, 'fade', 0.9, 0.7)
    return s


# ================================================================== 8. place with background-removed hero
def place_cutout(prs, ctx, c):
    s = _new(prs, ctx)
    bg_photo(s, img(ctx, c['bg']), shade='left', strength=1.0)
    glow = K.glow_img(s, 9.6, 4.2, 6.5, P['amber'], 45, falloff=2.0)
    t, u = heading(s, c['title'], c['sub'])
    tw = 5.6
    name = K.text(s, ML, 2.15, tw, 1.45, c['name'], size=K.fit_size(c['name'], F('name'), 38, tw, 2, 0.75),
                  font=F('name'), color=P['gold2'], anchor='b', line_sp=0.98)
    _text_shadow(name, alpha=50)
    body = rich(s, ML, 3.75, tw - 0.2, 2.9, c['body'], size=12, bold_color=P['gold2'])
    cw, ch = ctx['size'][c['cutout']]
    hh = c.get('cut_h', 6.3)
    ww = hh * cw / ch
    cx = c.get('cut_cx', 9.7)
    cut = K.picture(s, img(ctx, c['cutout']), cx - ww / 2, SH - hh - c.get('cut_bottom', 0.25), ww, hh)
    cap = K.text(s, cx + ww / 2 - 3.2, SH - 0.95, 3.0, 0.5, c.get('caption', ''), size=10, font=F('italic'),
                 italic=True, color=P['cream'], align='r', alpha=80)
    page_no(s, ctx['n'])
    K.anim(s, glow, 'fade', 0.2, 1.0)
    K.anim(s, cut, 'rise', 0.3, 0.9)
    K.anim(s, name, 'wipe_l', 0.6, 0.7)
    K.anim(s, body, 'fade', 1.0, 0.7)
    K.anim(s, cap, 'fade', 1.3, 0.5)
    return s


# ================================================================== 9. mosaic on parchment (experiences / cuisine)
MOSAICS = {
    'experience': [(0.7, 2.15, 2.9, 2.2), (0.7, 4.5, 2.9, 2.3), (3.8, 2.75, 5.7, 4.05), (9.7, 1.6, 2.95, 2.55),
                   (9.7, 4.3, 2.95, 2.5)],
    'cuisine': [(0.7, 1.75, 2.9, 5.05), (3.8, 2.75, 2.75, 1.95), (6.75, 2.75, 2.75, 1.95), (3.8, 4.85, 5.7, 1.95),
                (9.7, 1.6, 2.95, 5.2)],
}


def mosaic(prs, ctx, c):
    s = _new(prs, ctx, dark=False)
    paper_bg(s, ctx)
    t = K.text(s, 3.2, 0.5, SW - 6.4, 0.7, c['title'].upper(), size=32, font=F('title'), color=P['brown'], align='c',
               anchor='b', spacing=1, nm='!!ttl')
    u = K.text(s, 3.2, 1.2, SW - 6.4, 0.38, c['sub'].upper(), size=17, font=F('disp'), color=P['gold'], align='c',
               spacing=1.5, nm='!!sub')
    verse = None
    if c.get('verse'):
        verse = K.text(s, 3.9, 1.72, 5.5, 0.9, c['verse'], size=12, font=F('bodyb'), bold=True, color=P['brown'],
                       align='c', line_sp=1.1)
    pics = []
    for (x, y, w, h), (key, cap) in zip(MOSAICS[c['layout']], c['photos']):
        foc = (0.5, 0.5)
        if isinstance(key, tuple):
            key, foc = key
        pics.append(photo(s, img(ctx, key), x, y, w, h, focus=foc, caption=cap, border=P['white'], bw=2.0))
    page_no(s, ctx['n'], dark=False)
    K.anim(s, t, 'fade', 0.2, 0.6)
    K.anim(s, u, 'fade', 0.4, 0.5)
    if verse is not None:
        K.anim(s, verse, 'fade', 0.6, 0.6)
    order = c.get('order', list(range(len(pics))))
    K.anims(s, [pics[i] for i in order], 'zoom', 0.5, 0.15, 0.55)
    return s


# ================================================================== 10. polaroid story
def polaroids(prs, ctx, c):
    s = _new(prs, ctx)
    bg_photo(s, img(ctx, c['bg']), shade='left', strength=c.get('shade', 1.0))
    t, u = heading(s, c['title'], c['sub'], w=7.8)
    body = rich(s, ML, 2.05, 6.0, 3.9, c['body'], size=11.5, bold_color=P['gold2'], space_after=6)
    extra = []
    if c.get('bullets'):
        for i, b in enumerate(c['bullets']):
            y = c.get('bullet_y', 4.35) + i * 0.46
            d = diamond(s, ML + 0.1, y + 0.17, 0.11, P['gold2'])
            tx = K.text(s, ML + 0.3, y, 5.6, 0.36, b, size=12, font=F('bodyb'), bold=True, color=P['cream'], anchor='m')
            extra.append([d, tx])
    if c.get('note'):
        y = SH - 1.25
        ar = K.icon(s, 'move-right', ML, y + 0.02, 0.36, P['gold2'])
        nt = rich(s, ML + 0.5, y, 5.5, 0.7, c['note'], size=11.5, align='l', bold_color=P['gold2'])
        extra.append([ar, nt])
    pols = []
    for key, (x, y, h) in zip(c['prints'], c['pos']):
        pw, ph = ctx['size'][key]
        w = h * pw / ph
        pols.append(K.picture(s, img(ctx, key), x, y, w, h))
    page_no(s, ctx['n'])
    K.anims(s, pols, 'grow', 0.2, 0.25, 0.6)
    K.anim(s, body, 'fade', 0.9, 0.7)
    K.anims(s, extra, 'rise', 1.3, 0.15, 0.45)
    return s


# ================================================================== 11. timeline (dark, gold line)
def timeline(prs, ctx, c):
    s = _new(prs, ctx)
    bg_photo(s, img(ctx, c['bg']), shade='full', strength=1.25)
    t, u = heading(s, c['title'], c['sub'], x=ML, w=SW - 2 * ML, align='c')
    ev = c['events']
    n = len(ev)
    x0, x1, y = 1.1, SW - 1.1, 3.55
    base = K.line(s, x0, y, x1, y, P['gold2'], 1.5)
    step = (x1 - x0) / (n - 1)
    items = []
    for i, (yr, head, body) in enumerate(ev):
        cx = x0 + i * step
        up = i % 2 == 0
        dot = K.oval(s, cx - 0.13, y - 0.13, 0.26, fill=P['navy'], line=P['gold2'], lw=2)
        inner = K.oval(s, cx - 0.05, y - 0.05, 0.1, fill=P['gold2'])
        stem = K.line(s, cx, y - 0.13 if up else y + 0.13, cx, y - 0.55 if up else y + 0.55, P['gold2'], 1.0)
        yt = K.text(s, cx - 1.2, (y - 1.2) if up else (y + 0.6), 2.4, 0.6, yr, size=28, font=F('disp'),
                    color=P['gold2'], align='c', anchor='b' if up else 't')
        bx_y = (y + 0.75) if up else (y - 2.55)
        hd = K.text(s, cx - 1.15, bx_y if up else bx_y + 0.25, 2.3, 0.4, head, size=13, font=F('name'),
                    color=P['cream'], align='c', anchor='t')
        bd = K.text(s, cx - 1.15, (bx_y + 0.42) if up else (bx_y + 0.67), 2.3, 1.2, body, size=10, font=F('body'),
                    color=P['cream'], align='c', line_sp=1.12, alpha=85)
        items.append([dot, inner, stem, yt, hd, bd])
    page_no(s, ctx['n'])
    K.anim(s, base, 'wipe_l', 0.3, 1.4)
    K.anims(s, items, 'zoom', 0.5, 0.22, 0.45)
    return s


# ================================================================== 12. key numbers on parchment
def numbers(prs, ctx, c):
    s = _new(prs, ctx, dark=False)
    paper_bg(s, ctx)
    t, u = heading(s, c['title'], c['sub'], dark=False, w=8)
    lead = K.text(s, ML, 2.1, 5.2, 1.2, c['lead'], size=12.5, font=F('body'), italic=True, color=P['brown2'],
                  line_sp=1.18)
    cols = []
    n = len(c['stats'])
    cw = (SW - 2 * ML) / n
    for i, (ic, val, unit, lab) in enumerate(c['stats']):
        x = ML + i * cw
        if i:
            cols.append([K.line(s, x, 3.55, x, 5.4, P['line'], 0.9)])
        badge = K.icon_badge(s, ic, x + 0.55, 3.85, 0.62, P['navy'], P['gold2'], icon_scale=0.5)
        v = K.text(s, x + 0.25, 4.25, cw - 0.4, 0.95, [[(val, {}), (' ' + unit, {'size': 18, 'font': F('title')})]],
                   size=46, font=F('disp'), color=P['gold'], anchor='b')
        lb = K.text(s, x + 0.25, 5.25, cw - 0.45, 0.8, lab, size=11, font=F('body'), color=P['brown2'], line_sp=1.12)
        cols.append(badge + [v, lb])
    strip = photo(s, img(ctx, c['image']), 6.3, 0.6, SW - 6.3 - ML, 2.55, focus=c.get('focus', (0.5, 0.45)),
                  border=P['white'], bw=2.0)
    note = K.text(s, ML, SH - 0.42, 7, 0.25, 'Số liệu minh họa — thay bằng dữ liệu của bạn', size=8.5, font=F('body'),
                  italic=True, color=P['muted'])
    page_no(s, ctx['n'], dark=False)
    K.anim(s, lead, 'fade', 0.3, 0.6)
    K.anims(s, strip, 'fly_r', 0.2, 0.0, 0.7)
    K.anims(s, cols, 'rise', 0.6, 0.1, 0.5)
    return s


# ================================================================== 13. table on parchment
def table_slide(prs, ctx, c):
    s = _new(prs, ctx, dark=False)
    paper_bg(s, ctx)
    t, u = heading(s, c['title'], c['sub'], dark=False, w=8)
    tb = K.table(s, ML, 2.05, 8.3, 4.6, c['rows'], col_w=c['col_w'], header_fill=P['navy'], header_color=P['gold2'],
                 body_fill='F7F0DE', body_fill2='EFE2C6', body_color=P['brown'], line_color='D8C7A2', size=10.5,
                 header_size=11)
    _table_fonts(tb)
    ph = photo(s, img(ctx, c['image']), 9.35, 2.05, SW - 9.35 - ML, 3.35, focus=c.get('focus', (0.5, 0.5)),
               border=P['white'], bw=2.0)
    cap = K.text(s, 9.35, 5.55, SW - 9.35 - ML, 1.1, c['caption'], size=11, font=F('body'), italic=True,
                 color=P['brown2'], line_sp=1.15)
    page_no(s, ctx['n'], dark=False)
    K.anim(s, tb, 'wipe_u', 0.3, 0.9)
    K.anims(s, ph, 'fly_r', 0.4, 0.0, 0.7)
    K.anim(s, cap, 'fade', 1.0, 0.5)
    return s


def _table_fonts(gf):
    tbl = gf.table
    for r, row in enumerate(tbl.rows):
        for cidx, cell in enumerate(row.cells):
            for p in cell.text_frame.paragraphs:
                for run in p.runs:
                    rPr = run._r.get_or_add_rPr()
                    face = F('disp') if r == 0 else (F('bodyb') if cidx == 0 else F('body'))
                    for tag in ('a:latin', 'a:ea', 'a:cs'):
                        el = rPr.find(K.qn(tag))
                        if el is not None:
                            el.set('typeface', face)
                    if r == 0:
                        run.font.size = K.Pt(13)
                        rPr.set('spc', '100')
                    if cidx == 0 and r > 0:
                        run.font.bold = True


# ================================================================== 14. SWOT on parchment
def swot(prs, ctx, c):
    s = _new(prs, ctx, dark=False)
    paper_bg(s, ctx)
    t, u = heading(s, c['title'], c['sub'], dark=False, x=ML, w=SW - 2 * ML, align='c')
    gx, gy, gw, gh, gap = ML, 1.95, (SW - 2 * ML - 0.3) / 2, 2.35, 0.3
    cards = []
    for i, (L, lab, body) in enumerate(c['items']):
        x = gx + (i % 2) * (gw + gap)
        y = gy + (i // 2) * (gh + gap)
        dark = i in (0, 3)
        cd = K.rect(s, x, y, gw, gh, fill=P['navy'] if dark else 'FBF5E6', radius=0.18,
                    line=None if dark else P['line'], lw=1.0)
        K.shadow(cd, blur=0.3, dist=0.08, alpha=20, color='3D2B1B')
        K._ensure_ln_before_effects(cd)
        big = K.text(s, x + 0.25, y + 0.1, 1.4, 1.5, L, size=80, font=F('disp'),
                     color=P['gold2'] if dark else P['gold'], anchor='t')
        lb = K.text(s, x + 1.55, y + 0.3, gw - 1.8, 0.42, lab.upper(), size=15, font=F('name'),
                    color=P['cream'] if dark else P['brown'], spacing=0.5)
        bd = K.text(s, x + 1.55, y + 0.8, gw - 1.85, 1.45, body, size=11, font=F('body'),
                    color=P['cream'] if dark else P['brown2'], line_sp=1.12, bullets=True,
                    bullet_color=P['gold2'] if dark else P['gold'], space_after=3)
        cards.append([cd, big, lb, bd])
    em = K.picture(s, img(ctx, 'emblem'), SW / 2 - 0.55, gy + gh + gap / 2 - 0.55, 1.1, 1.1)
    page_no(s, ctx['n'], dark=False)
    K.anims(s, cards, 'zoom', 0.3, 0.18, 0.5)
    K.anim(s, em, 'zoom', 1.1, 0.5)
    return s


# ================================================================== 15. conclusion (glass cards on photo)
def conclusion(prs, ctx, c):
    s = _new(prs, ctx)
    bg_photo(s, img(ctx, c['bg']), shade='full', strength=1.1)
    t, u = heading(s, c['title'], c['sub'], x=ML, w=SW - 2 * ML, align='c')
    lead = K.text(s, 2.2, 1.75, SW - 4.4, 0.7, c['lead'], size=13, font=F('body'), italic=True, color=P['cream'],
                  align='c', alpha=90)
    n = len(c['items'])
    gw = (SW - 2 * ML - (n - 1) * 0.3) / n
    cards = []
    for i, (head, body) in enumerate(c['items']):
        x = ML + i * (gw + 0.3)
        g = K.glass(s, img(ctx, c['bg_blur']), x, 2.75, gw, 3.9, radius=0.25, tint=P['navy'], tint_alpha=40)
        rn = K.text(s, x, 2.95, gw, 0.8, roman(i + 1), size=40, font=F('disp'), color=P['gold2'], align='c',
                    anchor='m')
        orn = ornament(s, x + gw / 2, 3.85, 1.4)
        hd = K.text(s, x + 0.3, 4.0, gw - 0.6, 0.45, head, size=15, font=F('name'), color=P['cream'], align='c')
        bd = K.text(s, x + 0.35, 4.5, gw - 0.7, 2.0, body, size=11.5, font=F('body'), color=P['cream'], align='c',
                    line_sp=1.15, alpha=88)
        cards.append(g + [rn] + orn + [hd, bd])
    page_no(s, ctx['n'])
    K.anim(s, lead, 'fade', 0.3, 0.6)
    K.anims(s, cards, 'rise', 0.5, 0.22, 0.6)
    return s


# ================================================================== 16. thank you
def thanks(prs, ctx, c):
    s = _new(prs, ctx, tr=1.5)
    bg = bg_photo(s, img(ctx, 'cover'), shade='top', strength=0.9)
    t1 = K.text(s, 1.0, 0.55, SW - 2.0, 1.6, c['title1'], size=96, font=F('disp'), color=P['cream'], align='c',
                anchor='b', nm='!!t2')
    t2 = K.text(s, 1.0, 2.05, SW - 2.0, 1.2, c['title2'], size=64, font=F('disp'), color=P['cream'], align='c',
                anchor='t', nm='!!t1')
    for tb in (t1, t2):
        _text_shadow(tb)
    fg = None
    if 'cover_fg' in ctx['img']:
        fg = K.picture(s, img(ctx, 'cover_fg'), 0, 0, SW, SH, nm='!!fg')
    K.anim(s, t1, 'zoom', 0.5, 0.9)
    K.anim(s, t2, 'rise', 0.9, 0.8)
    K.notes(s, 'Cảm ơn và mời hội đồng đặt câu hỏi.')
    return s


# ================================================================== 17. credits (hidden)
def credits(prs, ctx, c):
    s = _new(prs, ctx, dark=False, kind='fade')
    s._element.set('show', '0')
    paper_bg(s, ctx)
    K.text(s, ML, 0.55, 11, 0.6, 'NGUỒN HÌNH ẢNH', size=26, font=F('title'), color=P['brown'])
    K.text(s, ML, 1.2, 12, 0.5, 'Slide ẩn — không hiển thị khi trình chiếu. ' + c['intro'], size=10, font=F('body'),
           italic=True, color=P['muted'])
    lines = c['lines']
    half = (len(lines) + 1) // 2
    for col, chunk in enumerate((lines[:half], lines[half:])):
        K.text(s, ML + col * 6.1, 1.85, 5.9, 5.2, '\n'.join(chunk), size=8, font=F('body'), color=P['brown2'],
               line_sp=1.05)
    return s
