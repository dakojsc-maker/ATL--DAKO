"""
"Lao động – Việc làm" layouts — M05, modelled on the Địa lí 12 reference deck (video 4).

Look & feel
    * cinematic full-bleed photos (hard hats, welding sparks, workers) darkened from the left for the cover,
      agenda, section and closing slides; huge condensed white titles (Anton) with a deep drop shadow,
      the "&" in orange, presenter in a dark glass pill
    * content slides on warm peach paper with a faint worker watermark: dark-brown condensed title + orange bar,
      small breadcrumb top-right, Lexend body text with orange highlights (**bold** markup)
    * orange gradient column charts, orange-header tables, yellow/orange/red pie charts with a "CHÚ THÍCH" box,
      choropleth map of the six regions of Việt Nam (with Hoàng Sa, Trường Sa), dashed callout boxes,
      orange pills, check lists, cut-out group of workers / professionals over an orange-red swoosh
    * Morph: background ('!!bg'), title ('!!ttl'), bar ('!!bar') and breadcrumb ('!!crumb') keep their names, so
      consecutive content slides only animate what changes.
Each layout: fn(prs, ctx, c) -> slide.   ctx = dict(n, img{key: path}, cut{key: path}, art{key: path}, maps{...})
"""
import re

import pptkit as K
from pptx.chart.data import CategoryChartData
from pptx.enum.chart import XL_CHART_TYPE, XL_LABEL_POSITION
from pptx.enum.shapes import MSO_SHAPE

SW, SH, ML = K.SW, K.SH, 0.6

P = dict(
    orange='F26B1F', orange2='FF8A2A', amber='F6A623', yellow='F8C43A', red='D9381E', red2='B4231A',
    brown='7A2A10', ink='3E2A1F', text='5A473C', muted='A08576', peach='FFF4EA', peach2='FFE6D2', line='F4CDB0',
    white='FFFFFF', dark='140D0A', cream='FFF6EE', row='FFF1E6',
)
PIE = ['F8C43A', 'F28C28', 'D9381E', 'B4231A', 'FFD98A']

FONTS = dict(
    disp=('Anton', 'Anton-Regular.ttf'),
    body=('Lexend', 'Lexend-Regular.ttf'),
    medium=('Lexend Medium', 'Lexend-Medium.ttf'),
    semi=('Lexend SemiBold', 'Lexend-SemiBold.ttf'),
)


def F(role):
    return FONTS[role][0]


def register(theme_key='laodong'):
    K.THEMES[theme_key] = dict(
        name='Lao động', key=theme_key,
        bg_light=P['peach'], bg_dark=P['dark'],
        ink=P['ink'], text=P['text'], muted=P['muted'], soft=P['peach2'],
        card=P['white'], card2=P['row'], accent=P['orange'], accent_ink=P['white'],
        violet=P['amber'], hot=P['red'], up=P['orange'], line=P['line'],
        chart=[P['orange'], P['amber'], P['red'], P['yellow']],
        blob_light=[(P['orange'], 25)], blob_dark=[(P['orange'], 30)],
        tint=P['dark'], grid_dark='4A3A30', row_alt=P['row'],
    )
    K.set_theme(theme_key)
    for role in ('disp', 'body', 'medium', 'semi'):
        face, fname = FONTS[role]
        K.FONT_FILES[face] = 'laodong/' + fname


# ------------------------------------------------------------------ helpers
def _new(prs, ctx, dark=False, tr=1.0):
    ctx['n'] += 1
    s = K.blank_slide(prs, dark)
    if ctx['n'] > 1:
        K.morph(s, tr)
    return s


def pic_path(ctx, key, prefer_cut=False):
    order = ('cut', 'img') if prefer_cut else ('img', 'cut')
    for k in order:
        if key in ctx[k]:
            return ctx[k][key]
    import content_io as CIO
    return CIO.photo_path(key)


def plain(t):
    return t.replace('**', '')


def rich(s, x, y, w, h, content, size=13, color=None, bold_color=None, align='l', line_sp=1.25, space_after=6,
         nm=None, anchor='t', bullets=False, font=None):
    """'**bold**' -> SemiBold orange runs; '\n' = new paragraph."""
    color = color or P['text']
    bold_color = bold_color or P['orange']
    paras = []
    for para in content.split('\n'):
        runs = []
        for i, part in enumerate(re.split(r'\*\*', para)):
            if part:
                runs.append((part, {'font': F('semi'), 'color': bold_color}) if i % 2 else (part, {}))
        paras.append(runs or [''])
    return K.text(s, x, y, w, h, paras, size=size, font=font or F('body'), color=color, align=align, line_sp=line_sp,
                  space_after=space_after, nm=nm, anchor=anchor, bullets=bullets, bullet_color=P['orange'])


def text_shadow(tb, alpha=70, blur=0.06, dist=0.07, color='000000', angle=45):
    for r in tb._element.iter(K.qn('a:rPr')):
        eff = K.etree.SubElement(r, K.qn('a:effectLst'))
        sh = K.etree.SubElement(eff, K.qn('a:outerShdw'))
        sh.set('blurRad', str(int(blur * 914400)))
        sh.set('dist', str(int(dist * 914400)))
        sh.set('dir', str(int(angle * 60000)))
        sh.set('algn', 'ctr')
        sh.set('rotWithShape', '0')
        cc = K.etree.SubElement(sh, K.qn('a:srgbClr'))
        cc.set('val', color)
        al = K.etree.SubElement(cc, K.qn('a:alpha'))
        al.set('val', str(alpha * 1000))
        first = r.find(K.qn('a:latin'))
        if first is not None:
            first.addprevious(eff)


def balance(title, font, size, w):
    """Break a title into balanced lines (no orphan word) when it needs more than one line."""
    if K.n_lines(title, font, size, w) <= 1:
        return title
    words = title.split()
    best, best_d = title, 1e9
    for i in range(1, len(words)):
        a, b = ' '.join(words[:i]), ' '.join(words[i:])
        wa, wb = K.text_w(a, font, size), K.text_w(b, font, size)
        if max(wa, wb) <= w and abs(wa - wb) < best_d:
            best, best_d = a + '\n' + b, abs(wa - wb)
    return best


def photo_bg(s, ctx, key, focus=(0.5, 0.5), shade='left', strength=1.0):
    pic = K.picture(s, pic_path(ctx, key), 0, 0, SW, SH, focus=tuple(focus), nm='!!bg')
    ov = K.rect(s, 0, 0, SW, SH, nm='!!shade')
    a = lambda v: min(100, v * strength)  # noqa: E731
    if shade == 'left':
        K.grad_fill(ov, [(0, P['dark'], a(88)), (45, P['dark'], a(62)), (80, P['dark'], a(18)), (100, P['dark'], a(5))],
                    angle=0)
    elif shade == 'bottom':
        K.grad_fill(ov, [(0, P['dark'], a(25)), (50, P['dark'], a(45)), (100, P['dark'], a(88))], angle=90)
    else:
        K.grad_fill(ov, [(0, P['dark'], a(65)), (100, P['dark'], a(55))], angle=90)
    return pic, ov


def paper(s, ctx):
    return K.picture(s, ctx['art']['paper'], 0, 0, SW, SH, nm='!!bg')


def header(s, ctx, title, crumb=''):
    """Content-slide title (Anton, dark brown) + orange bar + breadcrumb top-right."""
    t = title.upper()
    size = 30
    while K.text_w(t, F('disp'), size) > 9.0 and size > 20:
        size -= 1
    tt = K.text(s, ML, 0.32, 9.4, 0.62, t, size=size, font=F('disp'), color=P['brown'], anchor='b', nm='!!ttl',
                wrap=False, spacing=0.3)
    bar = K.rect(s, ML, 1.0, 0.9, 0.065, fill=P['orange'], nm='!!bar')
    out = [tt, bar]
    if crumb:
        out.append(K.text(s, SW - ML - 4.6, 0.42, 4.6, 0.3, crumb.upper(), size=9, font=F('medium'), color=P['muted'],
                          align='r', spacing=0.8, nm='!!crumb'))
    out.append(K.text(s, SW - ML - 0.8, SH - 0.42, 0.8, 0.26, f'{ctx["n"]:02d}', size=10, font=F('disp'),
                      color=P['muted'], align='r'))
    return out


def card(s, x, y, w, h, fill=None, radius=0.14, line=None, shadow=True, nm=None, alpha=None):
    c = K.rect(s, x, y, w, h, fill=fill or P['white'], radius=radius, line=line, lw=1.0, alpha=alpha, nm=nm)
    if shadow:
        K.shadow(c, blur=0.25, dist=0.06, alpha=18, color='8A3A10', angle=90)
        K._ensure_ln_before_effects(c)
    return c


def pill(s, x, y, w, h, t, size=13, align='l'):
    p = K.rect(s, x, y, w, h, radius=min(0.16, h / 2))
    K.grad_fill(p, [(0, P['orange'], 100), (100, P['orange2'], 100)], angle=0)
    K.set_line(p, None)
    K.shadow(p, blur=0.2, dist=0.05, alpha=30, color='8A3A10', angle=90)
    K.shape_text(p, t, size=size, color=P['white'], font=F('semi'), align=align, margin=(0.22, 0.05), line_sp=1.1)
    return p


def callout(s, x, y, w, h, t, size=13, align='c'):
    box = K.rect(s, x, y, w, h, fill=P['white'], radius=0.14, alpha=55)
    K.set_line(box, P['orange'], 1.25, dash='dash')
    tb = rich(s, x + 0.35, y + 0.08, w - 0.7, h - 0.16, t, size=size, align=align, anchor='m', line_sp=1.25,
              space_after=0)
    return [box, tb]


def photo(s, ctx, key, x, y, w, h, focus=(0.5, 0.5), radius=0.14, border=P['white'], bw=2.5, nm=None):
    p = K.picture(s, pic_path(ctx, key), x, y, w, h, radius=radius, focus=tuple(focus), border=border, border_w=bw,
                  nm=nm)
    K.shadow(p, blur=0.3, dist=0.08, alpha=28, color='6A2A08', angle=90)
    K._ensure_ln_before_effects(p)
    return p


def caption_src(s, x, y, w, caption=None, source=None):
    out = []
    if caption:
        out.append(K.text(s, x, y, w, 0.32, caption, size=10.5, font=F('medium'), color=P['ink'], align='c'))
    if source:
        out.append(K.text(s, x, y + (0.32 if caption else 0), w, 0.28, source, size=9, font=F('body'), italic=True,
                          color=P['muted'], align='r'))
    return out


def check_icon(s, x, y, d=0.3):
    return K.icon(s, 'circle-check', x, y, d, P['orange'], stroke=2.2)


def _fonts(gf, header_font=None, size=11, header_size=11.5):
    tbl = gf.table
    for r, row in enumerate(tbl.rows):
        for ci, cell in enumerate(row.cells):
            for p in cell.text_frame.paragraphs:
                for run in p.runs:
                    rPr = run._r.get_or_add_rPr()
                    face = (header_font or F('semi')) if r == 0 else (F('medium') if ci == 0 else F('body'))
                    for tag in ('a:latin', 'a:ea', 'a:cs'):
                        el = rPr.find(K.qn(tag))
                        if el is not None:
                            el.set('typeface', face)
                    run.font.bold = False
                    run.font.size = K.Pt(header_size if r == 0 else size)


def table(s, x, y, w, rows, col_w=None, row_h=0.42, size=11, merge_first=True):
    if col_w:
        k = w / sum(col_w)
        col_w = [v * k for v in col_w]
    gf = K.table(s, x, y, w, row_h * len(rows), rows, col_w=col_w, header_fill=P['orange'], header_color=P['white'],
                 body_fill=P['white'], body_fill2=P['row'], body_color=P['ink'], line_color=P['line'], size=size,
                 header_size=size + 0.5, row_h=row_h)
    _fonts(gf, size=size, header_size=size + 0.5)
    if merge_first:   # empty first-column cells join the cell above (row groups)
        tbl = gf.table
        r = 1
        while r < len(rows):
            if rows[r][0] == '':
                top = r - 1
                while r < len(rows) and rows[r][0] == '':
                    r += 1
                tbl.cell(top, 0).merge(tbl.cell(r - 1, 0))
            else:
                r += 1
    return gf


def column_chart(s, x, y, w, h, cats, values, name='', fmt='0.0', size=10.5, y_max=None):
    gf = K.chart_bar(s, x, y, w, h, cats, [(name or 'Giá trị', values)], colors=[P['orange']], gap=55, labels=True,
                     num_fmt=fmt, legend=False, label_color=P['ink'], font_size=size, max_v=y_max)
    ch = gf.chart
    ch.font.name = F('body')
    ch.font.color.rgb = K.rgb(P['text'])
    for ax in (ch.category_axis, ch.value_axis):
        ax.tick_labels.font.name = F('body')
        ax.tick_labels.font.color.rgb = K.rgb(P['text'])
    ser = ch.plots[0].series[0]
    spPr = ser._element.get_or_add_spPr()
    for el in list(spPr):
        spPr.remove(el)
    spPr.append(K.X(f'<a:gradFill rotWithShape="1"><a:gsLst><a:gs pos="0"><a:srgbClr val="{P["orange2"]}"/></a:gs>'
                    f'<a:gs pos="100000"><a:srgbClr val="{P["red"]}"/></a:gs></a:gsLst>'
                    f'<a:lin ang="5400000" scaled="0"/></a:gradFill>'))
    spPr.append(K.X('<a:ln><a:noFill/></a:ln>'))
    return gf


def pie_chart(s, x, y, d, cats, values, fmt='0.0', size=11):
    cd = CategoryChartData()
    cd.categories = cats
    cd.add_series('Tỉ lệ', values)
    gf = s.shapes.add_chart(XL_CHART_TYPE.PIE, K.E(x), K.E(y), K.E(d), K.E(d), cd)
    ch = gf.chart
    ch.has_legend = False
    ch.has_title = False
    ch.font.name = F('semi')
    ch.font.size = K.Pt(size)
    plot = ch.plots[0]
    dl = plot.series[0].data_labels          # series level, so per-point overrides below keep the others visible
    dl.show_value = True
    dl.number_format = fmt
    dl.number_format_is_linked = False
    dl.font.size = K.Pt(size)
    dl.font.color.rgb = K.rgb(P['ink'])
    dl.position = XL_LABEL_POSITION.INSIDE_END
    total = sum(values) or 1
    for i, pt in enumerate(plot.series[0].points):
        if values[i] / total < 0.08:              # thin slice: label outside so numbers never collide
            pt.data_label.position = XL_LABEL_POSITION.OUTSIDE_END
            pt.data_label.font.size = K.Pt(size)
            pt.data_label.font.color.rgb = K.rgb(P['ink'])
        pt.format.fill.solid()
        pt.format.fill.fore_color.rgb = K.rgb(PIE[i % len(PIE)])
        pt.format.line.color.rgb = K.rgb(P['white'])
        pt.format.line.width = K.Pt(1.5)
    K._no_fill_chart(ch)
    return gf


# ================================================================== 1. cover
def cover(prs, ctx, c):
    s = _new(prs, ctx, dark=True)
    bg = photo_bg(s, ctx, c['image'], focus=c.get('focus', (0.6, 0.5)), shade='left')
    out = []
    if c.get('kicker'):
        kt = c['kicker'].upper()
        kw = K.text_w(kt, F('disp'), 13) + len(kt) * 2.5 / 72 + 0.5
        tag = K.rect(s, ML, 0.55, kw, 0.36, fill=P['orange'], nm='!!kicker')
        K.shape_text(tag, kt, size=13, color=P['white'], font=F('disp'), spacing=2.5, margin=(0.12, 0.02))
        out.append(tag)
    t1, t2 = c['title1'].upper(), c['title2'].upper()
    size = 120
    while max(K.text_w(t1, F('disp'), size), K.text_w(t2, F('disp'), size) + 0.6) > 7.3 and size > 60:
        size -= 4
    lh = size / 72 * 1.18
    a = K.text(s, ML, 1.25, 8.0, lh, t1, size=size, font=F('disp'), color=P['white'], nm='!!t1', wrap=False,
               anchor='b')
    amp = K.text(s, ML + 0.05, 1.25 + lh * 0.92, 0.7, lh * 0.5, c.get('joiner', '&'), size=int(size * 0.42),
                 font=F('disp'), color=P['orange2'], nm='!!amp', anchor='m')
    b = K.text(s, ML + 0.6, 1.25 + lh * 0.95, 8.0, lh, t2, size=size, font=F('disp'), color=P['white'], nm='!!t2',
               wrap=False, anchor='t')
    for t in (a, b):
        text_shadow(t, alpha=65, blur=0.14, dist=0.06, angle=90)
    pres = presenter(s, c.get('presenter', ''), ML, SH - 1.3)
    K.anim(s, bg[0], 'zoom', 0.0, 1.4)
    K.anims(s, out, 'wipe_l', 0.4, 0.1, 0.5)
    K.anim(s, a, 'rise', 0.6, 0.7)
    K.anim(s, amp, 'turn', 0.95, 0.6)
    K.anim(s, b, 'rise', 1.1, 0.7)
    K.anims(s, pres, 'fade', 1.6, 0.0, 0.6)
    K.notes(s, c.get('notes', 'Slide bìa.'))
    return s


def presenter(s, t, x, y):
    if not t:
        return []
    t = t.upper()
    w = K.text_w(t, F('disp'), 13) + len(t) * 1.2 / 72 + 0.95
    box = K.rect(s, x, y, w, 0.5, fill='000000', alpha=45, radius=0.1, nm='!!pres')
    K.set_line(box, P['white'], 0.75, alpha=45)
    ic = K.icon(s, 'user-round', x + 0.18, y + 0.12, 0.26, P['white'])
    tx = K.text(s, x + 0.55, y, w - 0.6, 0.5, t, size=13, font=F('disp'), color=P['white'], anchor='m', spacing=1.2)
    return [box, ic, tx]


# ================================================================== 2. agenda
def agenda(prs, ctx, c):
    s = _new(prs, ctx, dark=True)
    photo_bg(s, ctx, c['image'], focus=c.get('focus', (0.7, 0.5)), shade='left', strength=1.1)
    hd = K.text(s, ML, 0.55, 8.0, 0.7, c.get('heading', 'Nội dung trình bày').upper(), size=28, font=F('semi'),
                color=P['orange2'], nm='!!ttl')
    secs = c['sections']
    y = 1.55
    n_items = sum(len(it) for _, it in secs)
    step_item = 0.34 if n_items <= 9 else 0.3
    blocks = []
    for i, (title, items) in enumerate(secs):
        num = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII'][i]
        tt = K.text(s, ML, y, 8.0, 0.55, f'{num}. {title.upper()}', size=22, font=F('disp'), color=P['white'],
                    anchor='m', spacing=0.5)
        text_shadow(tt, alpha=55, blur=0.1, dist=0.04, angle=90)
        y += 0.58
        sub = None
        if items:
            sub = K.text(s, ML + 0.32, y, 7.0, step_item * len(items),
                         [f'{k + 1}. {it}' for k, it in enumerate(items)], size=12.5, font=F('body'), color='F2E6DE',
                         line_sp=1.05, space_after=4)
            y += step_item * len(items)
        y += 0.28
        blocks.append([tt] + ([sub] if sub else []))
    K.anim(s, hd, 'wipe_l', 0.1, 0.6)
    K.anims(s, blocks, 'rise', 0.4, 0.25, 0.5)
    return s


# ================================================================== 3. section
def section(prs, ctx, c):
    s = _new(prs, ctx, dark=True, tr=1.3)
    photo_bg(s, ctx, c['image'], focus=c.get('focus', (0.5, 0.5)), shade=c.get('shade', 'left'))
    num = str(c.get('num', ''))
    title = c['title'].upper()
    size = 76
    while K.n_lines(title, F('disp'), size, 9.0) > 2 and size > 44:
        size -= 2
    title = balance(title, F('disp'), size, 9.0)
    nl = title.count('\n') + 1
    nb = K.text(s, ML, 0.75, 4, 1.1, num, size=64, font=F('disp'), color=P['white'], anchor='b', nm='!!secnum')
    tt = K.text(s, ML, 2.1, 9.6, nl * size / 72 * 1.2 + 0.1, title, size=size, font=F('disp'), color=P['white'],
                line_sp=0.98, nm='!!sectitle')
    for t in (nb, tt):
        text_shadow(t, alpha=60, blur=0.14, dist=0.05, angle=90)
    y = 2.1 + nl * size / 72 * 1.2 + 0.25
    bar = K.rect(s, ML + 0.05, y, 1.4, 0.08, fill=P['orange'])
    ds = K.text(s, ML + 0.05, y + 0.25, 7.6, 1.0, c.get('desc', ''), size=14, font=F('body'), color='F2E6DE',
                line_sp=1.2) if c.get('desc') else None
    K.anim(s, nb, 'zoom', 0.2, 0.6)
    K.anim(s, tt, 'rise', 0.45, 0.8)
    K.anim(s, bar, 'wipe_l', 1.0, 0.4)
    if ds is not None:
        K.anim(s, ds, 'fade', 1.2, 0.6)
    return s


# ================================================================== 4. text + photo + column chart
def chart_text(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    lead = rich(s, ML, 1.3, 4.95, 1.75, c['lead'], size=13, line_sp=1.3)
    ph = photo(s, ctx, c['image'], ML, 3.2, 4.95, 3.55, focus=c.get('focus', (0.5, 0.5)))
    ch = c['chart']
    yl = K.text(s, 5.95, 1.22, 4.0, 0.42, ch.get('y_title', ''), size=10, font=F('medium'), color=P['muted'])
    gf = column_chart(s, 5.85, 1.55, 6.9, 4.75, ch['cats'], ch['values'], ch.get('name', ''), ch.get('fmt', '0.0'),
                      y_max=ch.get('max'))
    cap = caption_src(s, 5.85, 6.35, 6.9, c.get('caption'), c.get('source'))
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    K.anim(s, lead, 'fade', 0.3, 0.6)
    K.anim(s, ph, 'zoom', 0.5, 0.7)
    K.anim(s, yl, 'fade', 0.7, 0.4)
    K.anim(s, gf, 'wipe_u', 0.8, 1.0)
    K.anims(s, cap, 'fade', 1.5, 0.1, 0.5)
    return s


# ================================================================== 5. bullets + table
def table_text(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    bl = rich(s, ML, 1.35, 5.3, 5.4, '\n'.join(c['bullets']), size=12.5, line_sp=1.3, space_after=10, bullets=True)
    x0, w = 6.3, SW - ML - 6.3
    cap = K.text(s, x0, 1.3, w, 0.55, c.get('caption', '').upper(), size=10.5, font=F('semi'), color=P['ink'],
                 align='c', line_sp=1.1, anchor='b')
    unit = K.text(s, x0, 1.88, w, 0.25, c.get('unit', ''), size=9, font=F('body'), italic=True, color=P['muted'],
                  align='r')
    rows = c['rows']
    rh = min(0.62, 4.3 / len(rows))
    gf = table(s, x0, 2.15, w, rows, col_w=c.get('col_w'), row_h=rh, size=11)
    src = K.text(s, x0, 2.2 + rh * len(rows) + 0.08, w, 0.28, c.get('source', ''), size=9, font=F('body'),
                 italic=True, color=P['muted'], align='r')
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    K.anim(s, bl, 'fade', 0.3, 0.7)
    K.anims(s, [cap, unit], 'fade', 0.5, 0.1, 0.4)
    K.anim(s, gf, 'wipe_d', 0.7, 0.9)
    K.anim(s, src, 'fade', 1.4, 0.4)
    return s


# ================================================================== 6. map of the six regions
def map_regions(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    m = ctx['maps'][c.get('map_id', 'default')]
    from PIL import Image
    iw, ih = Image.open(m['path']).size
    h = 6.25
    w = h * iw / ih
    x, y = 0.25, 1.15
    mp = K.picture(s, m['path'], x, y, w, h, nm='!!map')
    tags = []
    fmt = c.get('fmt', '{:.1f}%')
    for code, v in c['values'].items():
        if code not in m['anchors']:
            continue
        fx, fy = m['anchors'][code]
        t = fmt.format(v).replace('.', ',')
        tw = K.text_w(t, F('semi'), 11) + 0.3
        tg = K.rect(s, x + fx * w - tw / 2, y + fy * h - 0.16, tw, 0.32, fill=P['white'], radius=0.16)
        K.shadow(tg, blur=0.12, dist=0.03, alpha=30, color='6A2A08', angle=90)
        K._ensure_ln_before_effects(tg)
        K.shape_text(tg, t, size=11, color=P['red2'], font=F('semi'), margin=(0.02, 0.0))
        tags.append(tg)
    # legend: region names in value order
    x0 = 6.15
    w0 = SW - ML - x0
    pl = pill(s, x0, 1.3, w0, 0.62, c['pill'], size=12.5)
    bl = rich(s, x0 + 0.1, 2.1, w0 - 0.1, 2.3, '\n'.join(c['bullets']), size=12, line_sp=1.25, space_after=8,
              bullets=True)
    lg = []
    if c.get('legend', True):
        ly = 4.0
        lt = K.text(s, x0, ly - 0.05, 1.9, 0.3, c.get('legend_title', 'Tỉ trọng lao động'), size=10, font=F('medium'),
                    color=P['ink'], anchor='m')
        bar = K.rect(s, x0 + 2.0, ly, 2.6, 0.2, radius=0.1)
        K.grad_fill(bar, [(0, 'FDBA86', 100), (100, 'D9381E', 100)], angle=0)
        lo = K.text(s, x0 + 4.7, ly - 0.05, 0.8, 0.3, 'cao', size=10, font=F('body'), color=P['muted'], anchor='m')
        hi = K.text(s, x0 + 1.55, ly - 0.05, 0.42, 0.3, 'thấp', size=10, font=F('body'), color=P['muted'],
                    anchor='m', align='r')
        lg = [lt, hi, bar, lo]
    phs = []
    ims = c.get('photos', [])[:3]
    if ims:
        gap = 0.2
        pw = (w0 - gap * (len(ims) - 1)) / len(ims)
        for i, k in enumerate(ims):
            phs.append(photo(s, ctx, k, x0 + i * (pw + gap), 4.55, pw, 1.95, radius=0.1, bw=2))
    note = K.text(s, x0, 6.65, w0, 0.3, c.get('note', ''), size=9, font=F('body'), italic=True, color=P['muted'],
                  align='r')
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    K.anim(s, mp, 'fade', 0.2, 0.8)
    K.anims(s, tags, 'zoom', 0.8, 0.1, 0.35)
    K.anim(s, pl, 'wipe_l', 0.6, 0.5)
    K.anim(s, bl, 'fade', 0.9, 0.6)
    K.anims(s, lg, 'fade', 1.1, 0.0, 0.5)
    K.anims(s, phs, 'rise', 1.2, 0.15, 0.5)
    K.anim(s, note, 'fade', 1.6, 0.4)
    return s


# ================================================================== 7. callout + table
def callout_table(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    x0, w = ML + 0.3, SW - 2 * ML - 0.6
    nl = K.n_lines(plain(c['callout']), F('body'), 13, w - 0.8)
    chh = max(0.8, nl * 0.27 + 0.35)
    co = callout(s, x0, 1.35, w, chh, c['callout'])
    y = 1.35 + chh + 0.25
    cap = K.text(s, x0, y, w, 0.5, c.get('caption', '').upper(), size=10.5, font=F('semi'), color=P['ink'], align='c',
                 anchor='m')
    unit = K.text(s, x0, y + 0.45, w, 0.25, c.get('unit', ''), size=9, font=F('body'), italic=True, color=P['muted'],
                  align='r')
    rows = c['rows']
    avail = SH - 0.75 - (y + 0.75)
    rh = min(0.62, avail / len(rows))
    gf = table(s, x0, y + 0.72, w, rows, col_w=c.get('col_w'), row_h=rh, size=11)
    src = K.text(s, x0, y + 0.76 + rh * len(rows) + 0.05, w, 0.28, c.get('source', ''), size=9, font=F('body'),
                 italic=True, color=P['muted'], align='r')
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    K.anims(s, co, 'zoom', 0.3, 0.05, 0.6)
    K.anims(s, [cap, unit], 'fade', 0.8, 0.1, 0.4)
    K.anim(s, gf, 'wipe_d', 1.0, 0.9)
    K.anim(s, src, 'fade', 1.6, 0.4)
    return s


# ================================================================== 8. callout + pie charts + legend
def callout_pies(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    x0, w = ML + 0.3, SW - 2 * ML - 0.6
    nl = K.n_lines(plain(c['callout']), F('body'), 13, w - 0.8)
    chh = max(0.8, nl * 0.27 + 0.35)
    co = callout(s, x0, 1.35, w, chh, c['callout'])
    pies = c['pies'][:3]
    d = 3.1
    top = 1.35 + chh + 0.35
    out = []
    for i, (lab, vals) in enumerate(pies):
        px = 0.9 + i * (d + 0.6)
        gf = pie_chart(s, px, top, d, c['cats'], vals, fmt=c.get('fmt', '0.0'))
        lb = K.text(s, px, top + d + 0.02, d, 0.4, lab, size=18, font=F('disp'), color=P['brown'], align='c')
        out.append([gf, lb])
    # legend box
    lx = 0.9 + len(pies) * (d + 0.6) + 0.1
    lw = SW - ML - lx
    n = len(c['cats'])
    lh = 0.55 + n * 0.42
    ly = top + (d - lh) / 2
    box = card(s, lx, ly, lw, lh, fill=P['white'], radius=0.12, line=P['line'])
    tag_t = c.get('legend_title', 'Chú thích').upper()
    tw = K.text_w(tag_t, F('disp'), 12) + 0.6
    tag = K.rect(s, lx + (lw - tw) / 2, ly - 0.17, tw, 0.34, fill=P['orange'], radius=0.08)
    K.shape_text(tag, tag_t, size=12, color=P['white'], font=F('disp'), spacing=1.5, margin=(0.05, 0.0))
    items = []
    for i, cat in enumerate(c['cats']):
        yy = ly + 0.38 + i * 0.42
        sq = K.rect(s, lx + 0.25, yy + 0.08, 0.22, 0.22, fill=PIE[i % len(PIE)], radius=0.04)
        tx = K.text(s, lx + 0.6, yy, lw - 0.75, 0.38, cat, size=11, font=F('body'), color=P['ink'], anchor='m')
        items.append([sq, tx])
    cap = caption_src(s, x0, SH - 0.95, w, c.get('caption'), c.get('source'))
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    K.anims(s, co, 'zoom', 0.3, 0.05, 0.6)
    t = 0.8
    for gf, lb in out:
        K.anim(s, gf, 'wheel', t, 0.9)
        K.anim(s, lb, 'fade', t + 0.4, 0.4)
        t += 0.45
    K.anims(s, [box, tag], 'fade', t, 0.05, 0.4)
    K.anims(s, items, 'rise', t + 0.2, 0.1, 0.35)
    K.anims(s, cap, 'fade', t + 0.6, 0.1, 0.4)
    return s


# ================================================================== 9. pill + check list + people group
SLOTS = [  # (x, bottom, w, h) for up to 4 cut-outs: back row first, front row last; bottoms sink under the swoosh
    (7.7, 7.7, 3.2, 4.6), (10.3, 7.7, 3.2, 5.9), (8.7, 7.75, 3.0, 3.75), (10.85, 7.75, 2.8, 3.55)]


def people_list(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    ppl = []
    for k, (x, bot, w, h) in zip(c.get('people', [])[:4], SLOTS):
        ppl.append(K.picture(s, pic_path(ctx, k, prefer_cut=True), x, bot - h, w, h, fit='contain', nm=f'!!p_{k}'))
    sw = K.picture(s, ctx['art']['swoosh'], 6.9, SH - 2.95, 6.8, 2.98, nm='!!swoosh')
    pw = 7.0
    nl = K.n_lines(c['pill'], F('semi'), 12.5, pw - 0.5)
    ph_ = 0.32 + 0.24 * nl
    pl = pill(s, ML, 1.3, pw, ph_, c['pill'], size=12.5)
    y = 1.3 + ph_ + 0.25
    items = []
    n = len(c['items'])
    size = 12.5 if n <= 4 else 12
    for lead, txt in c['items']:
        t = f'**{lead}** {txt}' if lead else txt
        nlines = K.n_lines(plain(t), F('body'), size, pw - 0.55)
        hh = nlines * size / 72 * 1.3 + 0.05
        ic = check_icon(s, ML, y + 0.02, 0.3)
        tb = rich(s, ML + 0.45, y, pw - 0.45, hh, t, size=size, line_sp=1.22, space_after=0)
        items.append([ic, tb])
        y += hh + 0.2
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    K.anims(s, ppl, 'rise', 0.3, 0.15, 0.6)
    K.anim(s, sw, 'wipe_l', 0.6, 0.8)
    K.anim(s, pl, 'wipe_l', 0.5, 0.5)
    K.anims(s, items, 'rise', 0.9, 0.18, 0.45)
    return s


# ================================================================== 10. key figures
def stats(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    lead = rich(s, ML, 1.3, SW - 2 * ML, 0.75, c.get('lead', ''), size=13, anchor='m') if c.get('lead') else None
    items = c['items'][:4]
    n = len(items)
    gap = 0.3
    w = (SW - 2 * ML - gap * (n - 1)) / n
    y = 2.25
    tiles = []
    for i, (ic, v, u, lab) in enumerate(items):
        x = ML + i * (w + gap)
        cd = card(s, x, y, w, 2.35)
        bd = K.icon_badge(s, ic, x + 0.6, y + 0.55, 0.62, P['orange'], P['white'], icon_scale=0.52)
        vt = K.text(s, x + 0.3, y + 0.95, w - 0.4, 0.8, [[(v, {}), (' ' + u if u else '', {'size': 16,
                                                                                       'font': F('semi')})]],
                    size=40, font=F('disp'), color=P['orange'], anchor='b')
        lt = K.text(s, x + 0.3, y + 1.78, w - 0.5, 0.55, lab, size=11, font=F('body'), color=P['text'], line_sp=1.1)
        tiles.append([cd] + bd + [vt, lt])
    ph = photo(s, ctx, c['image'], ML, 4.9, SW - 2 * ML, 1.95, focus=c.get('focus', (0.5, 0.5)), radius=0.12) \
        if c.get('image') else None
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    if lead is not None:
        K.anim(s, lead, 'fade', 0.3, 0.5)
    K.anims(s, tiles, 'rise', 0.5, 0.15, 0.5)
    if ph is not None:
        K.anim(s, ph, 'wipe_l', 1.1, 0.8)
    return s


# ================================================================== 11. two-column comparison
def compare(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    cols = c['cols'][:2]
    gap = 0.45
    w = (SW - 2 * ML - gap) / 2
    y = 1.35
    out = []
    for i, col in enumerate(cols):
        x = ML + i * (w + gap)
        cd = card(s, x, y, w, 5.4)
        ph = K.picture(s, pic_path(ctx, col['image']), x, y, w, 1.75, focus=tuple(col.get('focus', (0.5, 0.5))),
                       geom='round2SameRect')
        _round_top(ph, 0.14, w, 1.75)
        ov = K.rect(s, x, y, w, 1.75, shp=MSO_SHAPE.ROUND_2_SAME_RECTANGLE)
        ov.adjustments[0] = 0.14 / 1.75
        ov.adjustments[1] = 0
        K.grad_fill(ov, [(0, P['dark'], 0), (60, P['dark'], 25), (100, P['dark'], 75)], angle=90)
        tt = K.text(s, x + 0.3, y + 1.05, w - 0.6, 0.6, col['title'].upper(), size=24, font=F('disp'),
                    color=P['white'], anchor='b')
        text_shadow(tt, alpha=50, blur=0.04, dist=0.03)
        stats_ = []
        sy = y + 2.0
        for v, lab in col.get('stats', [])[:3]:
            vt = K.text(s, x + 0.3, sy, 1.9, 0.6, v, size=30, font=F('disp'), color=P['orange'], anchor='m')
            lt = K.text(s, x + 2.25, sy, w - 2.5, 0.6, lab, size=11.5, font=F('body'), color=P['text'], anchor='m',
                        line_sp=1.1)
            ln = K.line(s, x + 0.3, sy + 0.68, x + w - 0.3, sy + 0.68, P['line'], 0.75)
            stats_.append([vt, lt, ln])
            sy += 0.8
        tx = rich(s, x + 0.3, sy + 0.05, w - 0.6, y + 5.3 - sy, col.get('text', ''), size=11.5, line_sp=1.2) \
            if col.get('text') else None
        out.append(([cd, ph, ov, tt], stats_, tx))
    note = K.text(s, ML, SH - 0.62, SW - 2 * ML, 0.28, c.get('note', ''), size=9, font=F('body'), italic=True,
                  color=P['muted'], align='r')
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    t = 0.3
    for head, stats_, tx in out:
        K.anims(s, head, 'rise', t, 0.0, 0.6)
        K.anims(s, stats_, 'wipe_l', t + 0.4, 0.15, 0.4)
        if tx is not None:
            K.anim(s, tx, 'fade', t + 0.9, 0.5)
        t += 0.4
    K.anim(s, note, 'fade', t + 0.8, 0.4)
    return s


def _round_top(pic, r, w, h):
    g = pic._element.spPr.find(K.qn('a:prstGeom'))
    av = g.find(K.qn('a:avLst'))
    for el in list(av):
        av.remove(el)
    for nm_, v in (('adj1', int(r / min(w, h) * 100000)), ('adj2', 0)):
        gd = K.etree.SubElement(av, K.qn('a:gd'))
        gd.set('name', nm_)
        gd.set('fmla', f'val {v}')


# ================================================================== 12. process (chevrons)
def process(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    lead = rich(s, ML, 1.3, SW - 2 * ML, 0.75, c.get('lead', ''), size=13, anchor='m') if c.get('lead') else None
    steps = c['steps'][:6]
    n = len(steps)
    w = (SW - 2 * ML + 0.25 * (n - 1)) / n
    y = 2.2
    out = []
    shades = ['FFB04A', 'FF9A35', 'F98227', 'F26B1F', 'E3521C', 'D9381E']
    off = max(0, 6 - n)
    for i, (ic, title, txt) in enumerate(steps):
        x = ML + i * (w - 0.25)
        ch = K.rect(s, x, y, w, 1.15, fill=shades[min(5, i + off)], shp=MSO_SHAPE.CHEVRON if i else MSO_SHAPE.PENTAGON)
        try:
            ch.adjustments[0] = 0.32
        except IndexError:
            pass
        K.shadow(ch, blur=0.2, dist=0.05, alpha=25, color='8A3A10', angle=90)
        K._ensure_ln_before_effects(ch)
        icn = K.icon(s, ic, x + w / 2 - 0.27, y + 0.31, 0.54, P['white'])
        num = K.text(s, x + 0.3, y + 1.3, w - 0.6, 0.45, f'{i + 1:02d}', size=26, font=F('disp'), color=P['orange'],
                     align='c')
        tt = K.text(s, x + 0.2, y + 1.78, w - 0.45, 0.6, title, size=13.5, font=F('semi'), color=P['ink'], align='c',
                    line_sp=1.05, anchor='t')
        tx = K.text(s, x + 0.2, y + 2.4, w - 0.45, 0.75, txt, size=11, font=F('body'), color=P['text'], align='c',
                    line_sp=1.15)
        out.append([ch, icn, num, tt, tx])
    ph = photo(s, ctx, c['image'], ML, 5.55, SW - 2 * ML, 1.35, focus=c.get('focus', (0.5, 0.5)), radius=0.12) \
        if c.get('image') else None
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    if lead is not None:
        K.anim(s, lead, 'fade', 0.3, 0.5)
    K.anims(s, out, 'fly_l', 0.5, 0.2, 0.5)
    if ph is not None:
        K.anim(s, ph, 'wipe_l', 0.6 + 0.2 * n, 0.8)
    return s


# ================================================================== 13. photo + key message
def photo_quote(prs, ctx, c):
    s = _new(prs, ctx)
    paper(s, ctx)
    hd = header(s, ctx, c['title'], c.get('crumb', ''))
    ph = photo(s, ctx, c['image'], ML, 1.35, 5.6, 5.45, focus=c.get('focus', (0.5, 0.5)), radius=0.18)
    x0, w = 6.75, SW - ML - 6.75
    qm = K.text(s, x0 - 0.05, 1.1, 1.2, 1.2, '“', size=96, font=F('disp'), color=P['orange'])
    qt = rich(s, x0, 1.95, w, 1.9, c['quote'], size=17, font=F('medium'), color=P['ink'], line_sp=1.25, anchor='t')
    items = []
    y = 4.0
    for t in c.get('points', [])[:4]:
        hh = K.n_lines(plain(t), F('body'), 12.5, w - 0.55) * 12.5 / 72 * 1.25 + 0.05
        ic = check_icon(s, x0, y + 0.03, 0.3)
        tb = rich(s, x0 + 0.45, y, w - 0.45, hh, t, size=12.5, line_sp=1.2, space_after=0)
        items.append([ic, tb])
        y += hh + 0.22
    K.anims(s, hd, 'wipe_l', 0.0, 0.1, 0.5)
    K.anim(s, ph, 'fly_l', 0.2, 0.8)
    K.anim(s, qm, 'zoom', 0.6, 0.4)
    K.anim(s, qt, 'fade', 0.8, 0.7)
    K.anims(s, items, 'rise', 1.3, 0.15, 0.45)
    return s


# ================================================================== 14. thanks
def thanks(prs, ctx, c):
    s = _new(prs, ctx, dark=True, tr=1.3)
    bg = photo_bg(s, ctx, c['image'], focus=c.get('focus', (0.6, 0.5)), shade='left')
    t1, t2 = c.get('title1', 'Xin cảm ơn').upper(), c.get('title2', 'đã lắng nghe').upper()
    size = 100
    while max(K.text_w(t1, F('disp'), size), K.text_w(t2, F('disp'), size * 0.72)) > 7.4 and size > 56:
        size -= 4
    lh = size / 72 * 1.18
    a = K.text(s, ML, 1.6, 8.5, lh, t1, size=size, font=F('disp'), color=P['white'], nm='!!t1', wrap=False,
               anchor='b')
    b = K.text(s, ML, 1.6 + lh, 8.5, lh * 0.75, t2, size=int(size * 0.72), font=F('disp'), color=P['orange2'],
               nm='!!t2', wrap=False)
    for t in (a, b):
        text_shadow(t, alpha=65, blur=0.14, dist=0.06, angle=90)
    pres = presenter(s, c.get('presenter', ''), ML, SH - 1.3)
    K.anim(s, bg[0], 'zoom', 0.0, 1.4)
    K.anim(s, a, 'rise', 0.5, 0.7)
    K.anim(s, b, 'rise', 0.85, 0.7)
    K.anims(s, pres, 'fade', 1.4, 0.0, 0.6)
    return s


# ================================================================== credits (hidden)
def credits(prs, ctx, c):
    s = _new(prs, ctx)
    s._element.set('show', '0')
    paper(s, ctx)
    K.text(s, ML, 0.4, 11, 0.6, 'NGUỒN HÌNH ẢNH', size=28, font=F('disp'), color=P['brown'])
    K.text(s, ML, 1.05, 12, 0.5, 'Slide ẩn — không hiển thị khi trình chiếu. ' + c['intro'], size=10, font=F('body'),
           italic=True, color=P['muted'])
    lines = c['lines']
    half = (len(lines) + 1) // 2
    for col, chunk in enumerate((lines[:half], lines[half:])):
        K.text(s, ML + col * 6.1, 1.75, 5.9, 5.4, '\n'.join(chunk), size=8, font=F('body'), color=P['text'],
               line_sp=1.05)
    return s
