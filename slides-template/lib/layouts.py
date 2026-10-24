"""
Slide layouts for the Aurora report template.
Each function takes (prs, ctx, c) where c is the content dict for that slide.
ctx carries running state: slide counter, section info, image paths per theme.
"""
import math

from pptkit import *   # noqa: F401,F403
import pptkit as K

MUTED_NOTE = 'Số liệu minh họa — thay bằng dữ liệu của bạn'


# ------------------------------------------------------------------ helpers
def _new(prs, ctx, dark=False, blob_idx=None, tr=1.0):
    ctx['n'] += 1
    s = K.blank_slide(prs, dark)
    K.blobs(s, ctx['n'] if blob_idx is None else blob_idx)
    if ctx['n'] > 1:
        K.morph(s, tr)
    return s


def _content(prs, ctx, dark=False, tr=1.0):
    s = _new(prs, ctx, dark, tr=tr)
    sec = ctx['sec']
    K.breadcrumb(s, sec['num'], sec['title'])
    K.page_no(s, ctx['n'])
    return s


def _note(s, t=MUTED_NOTE, dark=None):
    dark = s._dark if dark is None else dark
    K.text(s, K.ML, K.SH - 0.42, 6, 0.25, t, size=8.5, font=K.F_BODY, italic=True,
           color='FFFFFF' if dark else K.T['muted'], alpha=50 if dark else None)


def img(ctx, key):
    return ctx['img'][key]


# ================================================================== 1. cover
def cover(prs, ctx, c):
    s = _new(prs, ctx, blob_idx=0)
    T = K.T
    # brand line
    K.icon_badge(s, 'graduation-cap', K.ML + 0.25, 0.7, 0.5, T['ink'], T['accent'], icon_scale=0.56)
    K.text(s, K.ML + 0.62, 0.47, 6.5, 0.26, c['school'], size=10.5, font=K.F_HEAD, color=T['ink'], spacing=0.5)
    K.text(s, K.ML + 0.62, 0.72, 6.5, 0.24, c['faculty'], size=9.5, font=K.F_MED, color=T['muted'])

    p = K.pill(s, K.ML, 1.72, c['tag'], size=11)
    t1 = K.text(s, K.ML, 2.12, 7.6, 1.05, c['title1'], size=54, font=K.F_HEAD, color=T['ink'], anchor='b', line_sp=0.9)
    t2 = K.text(s, K.ML, 3.15, 7.6, 0.6, c['title2'], size=28, font=K.F_HEAD, color=T['card2'], line_sp=0.9)
    sub = K.text(s, K.ML, 3.95, 6.9, 0.75, c['subtitle'], size=14, font=K.F_MED, color=T['text'], line_sp=1.15)
    ln = K.line(s, K.ML, 5.0, K.ML + 3.4, 5.0, T['ink'], 1.0)
    dt = K.oval(s, K.ML + 3.4 - 0.045, 5.0 - 0.045, 0.09, fill=T['ink'])
    info = []
    for i, (lab, val) in enumerate(c['info']):
        x = K.ML + i * 2.35
        if i:
            info.append(K.line(s, x - 0.18, 5.38, x - 0.18, 5.98, T['line'], 1.0))
        info.append(K.text(s, x, 5.33, 2.2, 0.25, lab.upper(), size=8.5, font=K.F_SEMI, color=T['muted'], spacing=1))
        info.append(K.text(s, x, 5.58, 2.2, 0.45, val, size=11.5, font=K.F_SEMI, color=T['ink']))

    # hero frame with pop-out cutout
    fx, fy, fw, fh = 8.3, 1.3, 4.4, 5.6
    ring = K.oval(s, fx - 0.55, fy + fh - 1.55, 1.7, fill=None, line=T['card2'], lw=1.25, dash='dash')
    hero = K.picture(s, img(ctx, 'cover_bg'), fx, fy, fw, fh, radius=0.36, nm='!!hero', focus=(0.55, 0.5))
    K.shadow(hero, blur=0.5, dist=0.2, alpha=25, color=T['ink'])
    ov = K.rect(s, fx, fy, fw, fh, radius=0.36)
    K.grad_fill(ov, [(0, T['ink'], 0), (55, T['ink'], 15), (100, T['ink'], 80)], angle=90)
    ph = 6.25
    pw = ph * ctx['size']['cover_person'][0] / ctx['size']['cover_person'][1]
    person = K.picture(s, img(ctx, 'cover_person'), fx + (fw - pw) / 2 + 0.1, fy + fh - ph, pw, ph, fit='contain')
    chip = K.card(s, 7.35, 5.45, 2.55, 0.92, fill='FFFFFF', radius=0.2, sh_alpha=22)
    cb = K.icon_badge(s, 'trending-up', 7.35 + 0.47, 5.91, 0.56, T['accent'], T['accent_ink'], icon_scale=0.55)
    cv = K.text(s, 7.35 + 0.88, 5.52, 1.6, 0.42, c['chip_value'], size=19, font=K.F_HEAD, color=T['ink'], anchor='m')
    cl = K.text(s, 7.35 + 0.88, 5.9, 1.6, 0.4, c['chip_label'], size=8.5, font=K.F_MED, color=T['muted'])
    badge = K.icon_badge(s, 'sparkles', 12.55, 1.55, 0.62, T['card'], T['accent'], icon_scale=0.5, shadow_on=True)

    K.anim(s, p, 'fade', 0.0, 0.4)
    K.anim(s, t1, 'wipe_l', 0.15, 0.7)
    K.anim(s, t2, 'wipe_l', 0.45, 0.6)
    K.anim(s, sub, 'fade', 0.75, 0.5)
    K.anim(s, ln, 'wipe_l', 0.9, 0.5); K.anim(s, dt, 'fade', 1.3, 0.2)
    K.anims(s, info, 'float', 1.0, 0.06, 0.45)
    K.anim(s, ring, 'zoom', 0.3, 0.8)
    K.anim(s, hero, 'zoom', 0.2, 0.8)
    K.anim(s, ov, 'fade', 0.2, 0.8)
    K.anim(s, person, 'rise', 0.7, 0.8)
    K.anims(s, [chip, cb, cv, cl], 'float', 1.3, 0.05, 0.45)
    K.anims(s, badge, 'zoom', 1.5, 0.05, 0.4)
    K.notes(s, c.get('notes', 'Slide bìa: giới thiệu đề tài, giảng viên hướng dẫn và nhóm thực hiện.'))
    return s


# ================================================================== 2. agenda
def agenda(prs, ctx, c):
    s = _new(prs, ctx, blob_idx=1)
    T = K.T
    h = K.text(s, K.ML, 0.42, 7.6, 1.15, c['title'], size=58, font=K.F_HEAD, outline=T['ink'], outline_w=1.25, anchor='m')
    K.line(s, 6.25, 1.0, 8.1, 1.0, T['ink'], 1.0, dash='sysDot', alpha=60)
    items = []
    for i, name in enumerate(c['items']):
        col, row = i % 2, i // 2
        x = K.ML + 0.05 + col * 3.95
        y = 2.0 + row * 1.2
        circ = K.oval(s, x, y, 0.64, fill=T['accent'])
        num = K.text(s, x, y, 0.64, 0.64, f'{i + 1:02d}', size=15, font=K.F_HEAD, color=T['accent_ink'],
                     align='c', anchor='m', nm=f'!!num{i + 1:02d}')
        lab = K.text(s, x + 0.82, y - 0.02, 2.95, 0.68, name.upper(), size=12.5, font=K.F_HEAD, color=T['ink'],
                     anchor='m', nm=f'!!sec{i + 1:02d}', line_sp=0.95)
        ul = K.line(s, x + 0.82, y + 0.78, x + 3.5, y + 0.78, T['line'], 1.0)
        items.append((circ, num, lab, ul))
    # hero panel
    hx, hy, hw, hh = 8.75, 0.5, 3.95, 6.5
    hero = K.picture(s, img(ctx, 'cover_bg'), hx, hy, hw, hh, radius=0.36, nm='!!hero', focus=(0.5, 0.5))
    ov = K.rect(s, hx, hy, hw, hh, radius=0.36)
    K.grad_fill(ov, [(0, T['ink'], 20), (100, T['ink'], 85)], angle=90)
    vt = K.text(s, hx + hw - 1.25, hy + 0.3, 1.1, hh - 0.6, c['vertical'], size=50, font=K.F_HEAD, outline='FFFFFF',
                outline_w=1.0, vert='vert', anchor='m', align='c')
    cap1 = K.text(s, hx + 0.35, hy + hh - 1.3, 2.4, 0.4, c['cap1'], size=22, font=K.F_HEAD, color=T['accent'])
    cap2 = K.text(s, hx + 0.35, hy + hh - 0.85, 2.4, 0.5, c['cap2'], size=10, font=K.F_MED, color='FFFFFF', alpha=80)

    K.anim(s, h, 'wipe_l', 0.0, 0.8)
    t = 0.3
    for circ, num, lab, ul in items:
        K.anim(s, circ, 'zoom', t, 0.4)
        K.anim(s, num, 'zoom', t, 0.4)
        K.anim(s, lab, 'wipe_l', t + 0.1, 0.5)
        K.anim(s, ul, 'wipe_l', t + 0.2, 0.5)
        t += 0.12
    K.anim(s, ov, 'fade', 0.0, 0.6)
    K.anim(s, vt, 'wipe_d', 0.5, 0.9)
    K.anim(s, cap1, 'float', 0.9, 0.5)
    K.anim(s, cap2, 'float', 1.0, 0.5)
    K.notes(s, 'Mục lục: giới thiệu nhanh 7 phần của bài báo cáo.')
    return s


# ================================================================== 3. section divider
def section(prs, ctx, c):
    num = c['num']
    ctx['sec'] = dict(num=num, title=c['title'])
    s = _new(prs, ctx, dark=True, blob_idx=num + 2, tr=1.4)
    T = K.T
    cap = K.text(s, 0.85, 2.45, 6, 0.3, f'PHẦN {num:02d} / {ctx["total_sections"]:02d}', size=11, font=K.F_SEMI,
                 color='FFFFFF', alpha=60, spacing=2)
    tsz = K.fit_size(c['title'].upper(), K.F_HEAD, 38, 7.3, 1, 0.75)
    K.text(s, 0.85, 2.8, 7.3, 1.25, c['title'].upper(), size=tsz, font=K.F_HEAD, color=T['accent'], anchor='m',
           nm=f'!!sec{num:02d}', line_sp=0.95)
    ln = K.line(s, 0.85, 4.25, 5.1, 4.25, 'FFFFFF', 1.0, alpha=35)
    dt = K.oval(s, 5.1 - 0.045, 4.25 - 0.045, 0.09, fill=T['accent'])
    desc = K.text(s, 0.85, 4.5, 6.0, 1.0, c['desc'], size=12.5, font=K.F_MED, color='FFFFFF', alpha=70, line_sp=1.2)
    for k, dy, al in ((num - 1, -3.6, 9), (num, 0, None), (num + 1, 3.6, 9)):
        if k < 0 or k > ctx['total_sections']:
            continue
        K.text(s, 7.2, 2.1 + dy, 5.7, 3.3, f'{k:02d}', size=210, font=K.F_HEAD,
               color=T['accent'] if k == num else 'FFFFFF', alpha=al, align='r', anchor='m', nm=f'!!num{k:02d}')
    K.page_no(s, ctx['n'])
    K.anim(s, cap, 'fade', 0.4, 0.5)
    K.anim(s, ln, 'wipe_l', 0.5, 0.6)
    K.anim(s, dt, 'zoom', 1.0, 0.3)
    K.anim(s, desc, 'float', 0.7, 0.6)
    K.notes(s, f'Chuyển sang phần {num:02d}: {c["title"]}.')
    return s


# ================================================================== 4. overview + mosaic
def overview(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 6.6, 0.75, c['title'], size=32)
    sh = K.subhead(s, K.ML, 1.6, 6.0, c['sub'])
    blocks = []
    for i, (lab, body) in enumerate(c['reasons']):
        y = 2.28 + i * 1.5
        p = K.pill(s, K.ML, y, lab, size=10.5, h=0.32)
        b = K.text(s, K.ML, y + 0.44, 6.2, 0.8, body, size=11.5, color=T['text'], line_sp=1.15)
        grp = [p, b]
        if i < len(c['reasons']) - 1:
            grp.append(K.line(s, K.ML, y + 1.32, K.ML + 2.6, y + 1.32, T['line'], 1.0))
        blocks.append(grp)
    ims = c['images']
    p1 = K.picture(s, img(ctx, ims[0]), 7.5, 0.55, 2.52, 3.0, radius=0.25)
    p2 = K.picture(s, img(ctx, ims[1]), 10.18, 0.55, 2.52, 3.0, radius=0.25)
    p3 = K.picture(s, img(ctx, ims[2]), 7.5, 3.72, 5.2, 3.2, radius=0.25, focus=(0.5, 0.4))
    for p in (p1, p2, p3):
        K.shadow(p, blur=0.3, dist=0.1, alpha=18, color=T['ink'])
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anims(s, sh, 'fade', 0.3, 0.0, 0.4)
    K.anims(s, blocks, 'float', 0.5, 0.18, 0.5)
    K.anims(s, [p1, p2, p3], 'zoom', 0.2, 0.18, 0.6)
    return s


# ================================================================== 5. objectives
def objectives(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 6.2, 0.75, c['title'], size=32)
    p = K.pill(s, K.ML, 1.65, c['general_label'], size=11)
    bl = K.text(s, K.ML, 2.12, 6.1, 1.5, c['general'], size=11.5, bullets=True, line_sp=1.15, space_after=4)
    ph = K.picture(s, img(ctx, c['image']), K.ML, 3.72, 6.1, 3.2, radius=0.25, focus=(0.55, 0.5))
    K.shadow(ph, blur=0.3, dist=0.1, alpha=18, color=T['ink'])
    cd = K.card(s, 7.15, 0.55, 5.55, 6.4, radius=0.32)
    K.pin(s, 12.35, 0.32)
    p2 = K.pill(s, 7.5, 0.92, c['specific_label'], size=11)
    rows = []
    for i, (h, body) in enumerate(c['specific']):
        y = 1.6 + i * 1.72
        a = K.text(s, 7.5, y, 4.9, 0.32, h, size=12.5, font=K.F_HEAD, color=T['accent'])
        b = K.text(s, 7.5, y + 0.36, 4.9, 1.0, body, size=11, color='FFFFFF', alpha=82, line_sp=1.15)
        grp = [a, b]
        if i < 2:
            grp.append(K.line(s, 7.5, y + 1.5, 9.9, y + 1.5, 'FFFFFF', 1.0, alpha=25))
        rows.append(grp)
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, p, 'fade', 0.3, 0.4)
    K.anim(s, bl, 'float', 0.4, 0.5)
    K.anim(s, ph, 'zoom', 0.5, 0.6)
    K.anim(s, cd, 'fly_r', 0.2, 0.6)
    K.anim(s, p2, 'fade', 0.7, 0.4)
    K.anims(s, rows, 'float', 0.8, 0.2, 0.5)
    return s


# ================================================================== 6. subjects & scope
def subjects(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 8, 0.7, c['title'], size=30)
    sh1 = K.subhead(s, K.ML, 1.55, 5.5, c['left_title'], size=13)
    sh2 = K.subhead(s, 7.1, 1.55, 5.5, c['right_title'], size=13)
    rows = []
    for i, (lab, lines, im) in enumerate(c['subjects']):
        y = 2.15 + i * 1.6
        ph = K.picture(s, img(ctx, im), K.ML, y, 1.8, 1.4, radius=0.18, focus=(0.5, 0.3))
        p = K.pill(s, 2.65, y + 0.02, lab, size=10, h=0.3)
        runs = [[(k + ': ', {'font': K.F_SEMI, 'color': T['ink']}), (v, {})] for k, v in lines]
        tx = K.text(s, 2.65, y + 0.42, 4.0, 1.0, runs, size=10.5, line_sp=1.15)
        rows.append([ph, p, tx])
    q1 = K.picture(s, img(ctx, c['scope_images'][0]), 7.1, 2.15, 2.72, 1.55, radius=0.18)
    q2 = K.picture(s, img(ctx, c['scope_images'][1]), 9.98, 2.15, 2.72, 1.55, radius=0.18, focus=(0.5, 0.35))
    cards = []
    for i, (h, lines) in enumerate(c['scope']):
        y = 3.9 + i * 1.55
        cd = K.card(s, 7.1, y, 5.6, 1.4, fill=T['card'] if i == 0 else T['card2'], radius=0.2)
        a = K.text(s, 7.35, y + 0.14, 5.1, 0.3, h.upper(), size=11, font=K.F_HEAD, color=T['accent'] if i == 0 else 'FFFFFF')
        b = K.text(s, 7.35, y + 0.47, 5.1, 0.85, lines, size=10.5, color='FFFFFF', alpha=88, bullets=True,
                   bullet_color=T['accent'], line_sp=1.1)
        cards.append([cd, a, b])
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anims(s, [sh1, sh2], 'fade', 0.2, 0.1, 0.4)
    K.anims(s, rows, 'float', 0.4, 0.18, 0.5)
    K.anims(s, [q1, q2], 'zoom', 0.5, 0.15, 0.5)
    K.anims(s, cards, 'float', 0.8, 0.2, 0.5)
    return s


# ================================================================== 7. methods
def methods(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 5.95, 0.75, c['title'], size=32)
    para = K.text(s, K.ML, 1.6, 5.9, 1.3, c['intro'], size=11.5, line_sp=1.2)
    ph = K.picture(s, img(ctx, c['image']), K.ML, 3.05, 5.9, 3.88, radius=0.25, focus=(0.6, 0.5))
    K.shadow(ph, blur=0.3, dist=0.1, alpha=18, color=T['ink'])
    cards = []
    for i, (ic, h, body) in enumerate(c['methods']):
        y = 0.7 + i * 2.1
        cd = K.card(s, 6.95, y, 5.75, 1.85, fill='FFFFFF', radius=0.22, sh_alpha=12)
        big = K.text(s, 11.2, y + 0.1, 1.35, 0.9, f'{i + 1:02d}', size=40, font=K.F_HEAD, color=T['ink'], alpha=9, align='r')
        bd = K.icon_badge(s, ic, 7.65, y + 0.92, 0.82, T['accent'] if i != 1 else T['card'],
                          T['accent_ink'] if i != 1 else T['accent'], icon_scale=0.5)
        a = K.text(s, 8.35, y + 0.28, 3.9, 0.4, h, size=14, font=K.F_HEAD, color=T['ink'])
        b = K.text(s, 8.35, y + 0.7, 4.1, 1.05, body, size=10.5, line_sp=1.15)
        cards.append([cd, big] + bd + [a, b])
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, para, 'fade', 0.3, 0.5)
    K.anim(s, ph, 'zoom', 0.4, 0.6)
    K.anims(s, cards, 'float', 0.3, 0.22, 0.5)
    return s


# ================================================================== 8. target infographic (dark)
def target(prs, ctx, c):
    s = _content(prs, ctx, dark=True)
    T = K.T
    tt = K.title(s, 1.2, 0.72, 10.9, 0.75, c['title'], size=34, align='c')
    st = K.text(s, 2.0, 1.45, 9.3, 0.4, c['subtitle'], size=12.5, color='FFFFFF', alpha=70, align='c')
    cx, cy, d = 6.67, 4.42, 3.85
    halo = K.glow_img(s, cx, cy, d * 1.9, T['accent'], 55, falloff=2.2)
    ring = K.oval(s, cx - d / 2 - 0.22, cy - d / 2 - 0.22, d + 0.44, fill=None, line=T['accent'], lw=1.25, dash='dash')
    board = K.picture(s, img(ctx, 'dartboard'), cx - d / 2, cy - d / 2, d, d, fit='contain')
    K.shadow(board, blur=0.6, dist=0.25, alpha=45, color='000000')
    # left accent card
    lc = K.card(s, 0.9, 2.75, 3.55, 2.45, fill=T['accent'], radius=0.28, shadow_on=False)
    lt = K.text(s, 1.2, 3.0, 3.0, 1.35, c['left'], size=17, font=K.F_SEMI, color=T['accent_ink'], line_sp=1.1)
    lb = K.rect(s, 1.2, 4.55, 2.9, 0.38, fill='FFFFFF', radius=0.19, alpha=70)
    K.shape_text(lb, c['left_tag'], size=10, font=K.F_SEMI, color=T['accent_ink'])
    l1 = K.line(s, 4.45, 3.95, cx - d / 2 - 0.3, 4.2, T['accent'], 1.25, dash='dash', tail='oval')
    # right cards
    rc = K.card(s, 8.95, 2.2, 3.6, 2.2, fill='FFFFFF', radius=0.26, shadow_on=False)
    rp = K.pill(s, 9.2, 2.42, c['right_tag'], size=10.5, fill=T['card'], color='FFFFFF', h=0.34)
    ri = K.icon(s, 'users', 12.0, 2.45, 0.34, T['ink'])
    rt = K.text(s, 9.2, 2.92, 3.15, 1.35, c['right'], size=10.5, color=T['ink'], line_sp=1.15)
    bc = K.card(s, 9.35, 4.7, 3.2, 1.55, fill=T['card2'], radius=0.24, shadow_on=False)
    K.pin(s, 12.25, 4.52, 0.38)
    bt = K.text(s, 9.6, 4.9, 2.7, 1.2, c['note'], size=10.5, color='FFFFFF', line_sp=1.15)
    l2 = K.line(s, 8.95, 3.3, cx + d / 2 + 0.3, 3.9, T['accent'], 1.25, dash='dash', tail='oval')
    K.anim(s, tt, 'fade', 0.0, 0.6)
    K.anim(s, st, 'fade', 0.2, 0.5)
    K.anim(s, halo, 'fade', 0.3, 0.8)
    K.anim(s, ring, 'zoom', 0.3, 0.7)
    K.anim(s, board, 'grow', 0.35, 0.7)
    K.anims(s, [[lc, lt, lb], l1], 'fly_l', 0.8, 0.25, 0.55)
    K.anims(s, [[rc, rp, ri, rt], l2, [bc, bt]], 'float', 1.0, 0.2, 0.5)
    return s


# ================================================================== 9. cycle 3 steps
def cycle(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 7, 0.75, c['title'], size=32)
    st = K.text(s, K.ML, 1.45, 6.2, 0.45, c['subtitle'], size=12)
    rows = []
    for i, (lab, body) in enumerate(c['steps']):
        y = 2.3 + i * 1.5
        n = K.text(s, K.ML, y - 0.05, 0.85, 0.6, f'{i + 1:02d}', size=26, font=K.F_HEAD, color=T['ink'])
        p = K.pill(s, 1.55, y + 0.04, lab, size=10.5, h=0.32)
        b = K.text(s, 1.55, y + 0.47, 4.9, 0.85, body, size=10.5, line_sp=1.15)
        grp = [n, p, b]
        if i < 2:
            grp.append(K.line(s, K.ML, y + 1.3, 6.4, y + 1.3, T['line'], 1.0))
        rows.append(grp)
    circles = []
    specs = [(8.45, 4.35, 2.1, '01', 54, 'handshake', (7.25, 2.95)), (10.95, 2.75, 1.4, '02', 36, 'rocket', (11.95, 1.85)),
             (11.2, 5.6, 1.6, '03', 40, 'lightbulb', (12.35, 6.35))]
    for cx, cy, d, lab, sz, ic, (bx, by) in specs:
        ring = K.oval(s, cx - d / 2 - 0.12, cy - d / 2 - 0.12, d + 0.24, fill=None, line=T['ink'], lw=1.0, dash='sysDot')
        o = K.oval(s, cx - d / 2, cy - d / 2, d, fill=T['card'])
        K.shadow(o, blur=0.35, dist=0.12, alpha=22, color=T['ink'])
        tx = K.text(s, cx - d / 2, cy - d / 2, d, d, lab, size=sz, font=K.F_HEAD, color=T['accent'], align='c', anchor='m')
        bd = K.icon_badge(s, ic, bx, by, 0.55, T['card2'] if lab != '02' else T['accent'],
                          'FFFFFF' if lab != '02' else T['accent_ink'], icon_scale=0.52)
        circles.append([ring, o, tx] + bd)
    arrows = [
        K.s_curve(s, 9.35, 3.2, 10.2, 2.45),
        K.s_curve(s, 11.55, 3.5, 11.6, 4.75),
        K.s_curve(s, 10.35, 6.05, 9.2, 5.45),
    ]
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, st, 'fade', 0.25, 0.5)
    K.anims(s, rows, 'float', 0.4, 0.2, 0.5)
    t = 0.4
    for grp, arr in zip(circles, arrows):
        K.anims(s, grp, 'zoom', t, 0.03, 0.45)
        K.anim(s, arr, 'wipe_l', t + 0.35, 0.4)
        t += 0.45
    return s


# ================================================================== 10. four blocks
def blocks4(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 11, 0.75, c['title'], size=32)
    size, gap = 2.08, 0.16
    ox, oy = 6.67 - size - gap / 2, 2.1
    blocks = []
    for i, (ic, lab) in enumerate(c['blocks']):
        x = ox + (i % 2) * (size + gap)
        y = oy + (i // 2) * (size + gap)
        fill = T['card'] if i in (0, 3) else T['card2']
        b = K.card(s, x, y, size, size, fill=fill, radius=0.24, sh_alpha=18)
        ico = K.icon(s, ic, x + 0.25, y + 0.25, 0.42, T['accent'])
        tx = K.text(s, x + 0.25, y + 0.95, size - 0.4, 0.75, lab.upper(), size=12.5, font=K.F_HEAD, color='FFFFFF',
                    anchor='b', line_sp=1.0)
        ul = K.line(s, x + 0.25, y + 1.82, x + size - 0.25, y + 1.82, T['accent'], 1.25, alpha=70)
        blocks.append([b, ico, tx, ul])
    notes = []
    pos = [(K.ML, 2.4, 'r'), (9.05, 2.4, 'l'), (K.ML, 4.65, 'r'), (9.05, 4.65, 'l')]
    for (x, y, al), (lab, body) in zip(pos, c['notes']):
        pw = max(0.9, len(lab) * 10.5 * 0.0092 + 0.44)
        px = x + 3.6 - pw if al == 'r' else x
        p = K.pill(s, px, y, lab, size=10.5, h=0.32)
        b = K.text(s, x, y + 0.45, 3.6, 1.1, body, size=10.5, align=al, line_sp=1.15)
        notes.append([p, b])
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anims(s, blocks, 'zoom', 0.3, 0.15, 0.5)
    K.anims(s, notes, 'fade', 0.9, 0.15, 0.5)
    return s


# ================================================================== 11. pyramid
def pyramid(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 11, 0.75, c['title'], size=30)
    levels = c['levels']            # top -> bottom
    n = len(levels)
    apx, top, base_w, bot = 3.4, 1.75, 5.5, 6.85
    H = bot - top
    lh = H / n
    parts, rows = [], []
    for i, (ic, lab, body) in enumerate(levels):
        y0 = top + i * lh + (0.05 if i else 0)
        y1 = top + (i + 1) * lh - 0.05
        w0 = base_w * (y0 - top) / H
        w1 = base_w * (y1 - top) / H
        pts = [(apx - w0 / 2, y0), (apx + w0 / 2, y0), (apx + w1 / 2, y1), (apx - w1 / 2, y1)] if i else \
              [(apx, y0), (apx + w1 / 2, y1), (apx - w1 / 2, y1)]
        fill = T['card'] if i % 2 == 0 else T['card2']
        f = K.freeform(s, pts, fill=fill)
        yc = (y0 + y1) / 2 + (0.12 if i == 0 else 0)
        isz = 0.36 if i else 0.3
        ico = K.icon(s, ic, apx - isz / 2, yc - isz / 2, isz, T['accent'])
        parts.append([f, ico])
        # connector + text
        ry = (y0 + y1) / 2
        edge_x = apx + (w0 + w1) / 4 + 0.05
        cn = K.elbow(s, [(edge_x, ry), (6.6, ry), (6.85, ry)], T['line'], 1.0)
        bd = K.icon_badge(s, 'circle-check-big', 7.2, ry, 0.46, T['accent'], T['accent_ink'], icon_scale=0.55)
        a = K.text(s, 7.6, ry - 0.36, 5.1, 0.32, lab, size=12.5, font=K.F_HEAD, color=T['ink'])
        b = K.text(s, 7.6, ry - 0.03, 5.1, 0.5, body, size=10, line_sp=1.1)
        rows.append(cn + bd + [a, b])
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anims(s, list(reversed(parts)), 'fly_b', 0.2, 0.12, 0.45)
    K.anims(s, rows, 'wipe_l', 0.9, 0.15, 0.45)
    return s


# ================================================================== 12. hub & spokes
def hub(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 11, 0.75, c['title'], size=30)
    cx, cy = 6.67, 4.35
    outer = K.oval(s, cx - 1.55, cy - 1.55, 3.1, fill=T['soft'])
    mid = K.oval(s, cx - 1.3, cy - 1.3, 2.6, fill=None, line=T['ink'], lw=1.0, dash='sysDot')
    inner = K.oval(s, cx - 1.12, cy - 1.12, 2.24, fill=T['card'])
    K.shadow(inner, blur=0.4, dist=0.12, alpha=25, color=T['ink'])
    ct = K.text(s, cx - 1.05, cy - 1.05, 2.1, 2.1, c['center'], size=17, font=K.F_HEAD, color='FFFFFF', align='c',
                anchor='m', line_sp=1.0)
    pos = [(4.35, 2.45, 'l'), (8.99, 2.45, 'r'), (3.85, 4.35, 'l'), (9.49, 4.35, 'r'), (4.35, 6.25, 'l'), (8.99, 6.25, 'r')]
    sats = []
    for (bx, by, side), (ic, lab, body) in zip(pos, c['items']):
        ang = math.atan2(by - cy, bx - cx)
        lx1, ly1 = cx + 1.55 * math.cos(ang), cy + 1.55 * math.sin(ang)
        lx2, ly2 = bx - 0.33 * math.cos(ang), by - 0.33 * math.sin(ang)
        ln = K.line(s, lx1, ly1, lx2, ly2, T['line'], 1.25)
        bd = K.icon_badge(s, ic, bx, by, 0.62, T['accent'], T['accent_ink'], icon_scale=0.52, shadow_on=True)
        if side == 'l':
            tx_x, al = bx - 0.45 - 3.3, 'r'
        else:
            tx_x, al = bx + 0.45, 'l'
        pw = max(0.9, len(lab) * 10.5 * 0.0092 + 0.44)
        p = K.pill(s, tx_x + (3.3 - pw if al == 'r' else 0), by - 0.55, lab, size=10.5, h=0.32)
        b = K.text(s, tx_x, by - 0.15, 3.3, 0.75, body, size=10, align=al, line_sp=1.1)
        sats.append([ln] + bd + [p, b])
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anims(s, [outer, mid, [inner, ct]], 'zoom', 0.2, 0.12, 0.5)
    K.anims(s, sats, 'fade', 0.7, 0.14, 0.45)
    return s


# ================================================================== 13. process chevrons
def process(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 11, 0.75, c['title'], size=30)
    st = K.text(s, K.ML, 1.42, 11, 0.4, c['subtitle'], size=12)
    steps = c['steps']
    n = len(steps)
    total = K.SW - 2 * K.ML
    step_w = total / n
    cw = step_w + 0.14
    grp = []
    base_y = 4.85
    tl = K.line(s, K.ML, base_y, K.SW - K.ML, base_y, T['line'], 1.5)
    for i, (h, body, when) in enumerate(steps):
        x = K.ML + i * step_w
        ch = K.rect(s, x, 2.15, cw, 0.72, fill=T['card'] if i % 2 == 0 else T['card2'],
                    shp=K.MSO_SHAPE.CHEVRON if i else K.MSO_SHAPE.PENTAGON)
        ch.adjustments[0] = 0.35
        K.shape_text(ch, f'{i + 1:02d}', size=17, font=K.F_HEAD, color=T['accent'] if i % 2 == 0 else 'FFFFFF')
        a = K.text(s, x + 0.08, 3.12, step_w - 0.16, 0.34, h, size=12, font=K.F_HEAD, color=T['ink'], line_sp=1.0)
        b = K.text(s, x + 0.08, 3.5, step_w - 0.16, 1.3, body, size=10, line_sp=1.15)
        dot = K.oval(s, x + step_w / 2 - 0.09, base_y - 0.09, 0.18, fill=T['accent'], line=T['ink'], lw=1.25)
        w = K.text(s, x, base_y + 0.18, step_w, 0.3, when, size=9.5, font=K.F_SEMI, color=T['muted'], align='c')
        grp.append((ch, [a, b], [dot, w]))
    bar = K.rect(s, K.ML, 5.85, K.SW - 2 * K.ML, 0.72, fill=T['soft'], radius=0.2)
    facts = []
    for i, (ic, lab, val) in enumerate(c['facts']):
        fx = K.ML + 0.3 + i * 4.0
        facts.append(K.icon_badge(s, ic, fx + 0.22, 6.21, 0.44, T['card'], T['accent'], icon_scale=0.52) + [
            K.text(s, fx + 0.58, 6.04, 3.3, 0.34, [[(lab + ': ', {'font': K.F_SEMI, 'color': T['muted']}), (val, {})]],
                   size=11.5, font=K.F_HEAD, color=T['ink'], anchor='m')])
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, st, 'fade', 0.25, 0.5)
    K.anim(s, tl, 'wipe_l', 0.3, 1.2)
    K.anim(s, bar, 'fade', 1.4, 0.5)
    K.anims(s, facts, 'float', 1.5, 0.12, 0.45)
    t = 0.35
    for ch, txt, dots in grp:
        K.anim(s, ch, 'fly_l', t, 0.45)
        K.anims(s, txt, 'fade', t + 0.25, 0.05, 0.4)
        K.anims(s, dots, 'zoom', t + 0.2, 0.0, 0.35)
        t += 0.16
    return s


# ================================================================== 14. column chart
def chart_columns(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 5.6, 1.2, c['title'], size=30)
    cards = []
    for i, (h, body) in enumerate(c['notes']):
        y = 2.2 + i * 2.35
        cd = K.card(s, K.ML, y, 5.45, 2.15, fill=T['card'] if i == 0 else T['card2'], radius=0.24)
        a = K.text(s, K.ML + 0.3, y + 0.25, 4.8, 0.3, h.upper(), size=11, font=K.F_HEAD, color=T['accent'] if i == 0 else 'FFFFFF')
        b = K.text(s, K.ML + 0.3, y + 0.62, 4.85, 1.4, body, size=10.5, color='FFFFFF', alpha=88, line_sp=1.18)
        cards.append([cd, a, b])
    kpis = []
    for i, (lab, val, delta, up) in enumerate(c['kpis']):
        x = 6.75 + i * 2.05
        a = K.text(s, x, 0.58, 1.9, 0.25, lab.upper(), size=8.5, font=K.F_SEMI, color=T['muted'], spacing=1)
        v = K.text(s, x, 0.8, 1.9, 0.55, val, size=26, font=K.F_HEAD, color=T['ink'])
        d = K.text(s, x, 1.35, 1.9, 0.25, [[('▲ ' if up else '▼ ', {'color': T['up'] if up else T['hot']}), (delta, {})]],
                   size=9.5, font=K.F_SEMI, color=T['muted'])
        kpis.append([a, v, d])
    ch = K.chart_bar(s, 6.55, 1.9, 6.2, 5.05, c['cats'], c['series'], gap=90, overlap=-12, legend=True)
    _note(s)
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anims(s, cards, 'float', 0.3, 0.2, 0.5)
    K.anims(s, kpis, 'float', 0.4, 0.15, 0.45)
    K.anim(s, ch, 'wipe_u', 0.7, 1.0)
    return s


# ================================================================== 15. bar chart
def chart_bars(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 7.2, 1.2, c['title'], size=30)
    cats = list(reversed(c['cats']))
    series = [(n, list(reversed(v))) for n, v in c['series']]
    ch = K.chart_bar(s, 0.45, 2.0, 7.4, 4.95, cats, series, horizontal=True, gap=70, overlap=-5,
                     labels=True, num_fmt='0"%"', max_v=100, colors=[K.T['chart'][0], K.T['chart'][2]])
    from pptx.enum.chart import XL_TICK_LABEL_POSITION
    ch.chart.value_axis.tick_label_position = XL_TICK_LABEL_POSITION.NONE
    cards = []
    fills = [(T['card'], 'FFFFFF', T['accent']), (T['card2'], 'FFFFFF', 'FFFFFF'), ('FFFFFF', T['ink'], T['ink'])]
    for i, (ic, lab, val, unit, sub) in enumerate(c['kpis']):
        y = 0.7 + i * 2.1
        f, tc, vc = fills[i]
        cd = K.card(s, 8.3, y, 4.4, 1.88, fill=f, radius=0.24, sh_alpha=14)
        bd = K.icon_badge(s, ic, 8.85, y + 0.62, 0.66, T['accent'] if i != 1 else 'FFFFFF',
                          T['accent_ink'] if i != 1 else T['card2'], icon_scale=0.5)
        a = K.text(s, 9.35, y + 0.3, 3.2, 0.3, lab, size=10.5, font=K.F_SEMI, color=tc, alpha=80 if i < 2 else None)
        v = K.text(s, 9.35, y + 0.58, 3.2, 0.62, [[(val, {}), (' ' + unit, {'size': 12})]], size=28, font=K.F_HEAD, color=vc)
        b = K.text(s, 9.35, y + 1.25, 3.2, 0.4, sub, size=9.5, color=tc, alpha=70 if i < 2 else None)
        cards.append([cd] + bd + [a, v, b])
    _note(s)
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, ch, 'wipe_l', 0.4, 1.0)
    K.anims(s, cards, 'fly_r', 0.3, 0.18, 0.5)
    return s


# ================================================================== 16. line chart
def chart_lines(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    ch = K.chart_line(s, 0.45, 0.95, 7.6, 5.95, c['cats'], c['series'], legend=True, legend_pos='b', width=2.75)
    tt = K.title(s, 8.45, 0.72, 4.3, 1.4, c['title'], size=30)
    d = K.text(s, 8.45, 2.25, 4.25, 1.4, c['desc'], size=11.5, line_sp=1.2)
    cd = K.card(s, 8.45, 3.9, 4.25, 2.3, radius=0.26)
    v = K.text(s, 8.8, 4.1, 2.8, 0.95, [[(c['stat'], {}), (' ' + c['unit'], {'size': 18, 'color': T['accent']})]],
               size=46, font=K.F_HEAD, color='FFFFFF', anchor='b')
    bd = K.icon_badge(s, 'trending-up', 11.95, 4.6, 0.7, None, T['accent'], ring=None, icon_scale=0.5)
    ring = K.oval(s, 11.6, 4.25, 0.7, fill=None, line=T['accent'], lw=1.25)
    b = K.text(s, 8.8, 5.15, 3.6, 0.85, c['stat_label'], size=10.5, color='FFFFFF', alpha=80, line_sp=1.15)
    _note(s)
    K.anim(s, ch, 'wipe_l', 0.3, 1.4)
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, d, 'fade', 0.3, 0.5)
    K.anims(s, [[cd, v, b], [ring] + bd], 'float', 0.6, 0.2, 0.5)
    return s


# ================================================================== 17. doughnut
def chart_donut(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 6.6, 0.75, c['title'], size=30)
    d = K.text(s, K.ML, 1.5, 6.2, 1.0, c['desc'], size=11.5, line_sp=1.2)
    dl = [K.line(s, K.ML, 2.62, 6.3, 2.62, T['line'], 1.0)]
    items = []
    cols = K.T['chart']
    for i, (lab, pct, body) in enumerate(c['items']):
        y = 2.9 + i * 1.02
        sq = K.rect(s, K.ML, y, 0.55, 0.55, fill=cols[i % len(cols)], radius=0.12)
        K.shape_text(sq, f'{i + 1:02d}', size=12, font=K.F_HEAD, color='FFFFFF' if i != 2 else T['accent_ink'])
        a = K.text(s, K.ML + 0.75, y - 0.02, 4.2, 0.32, lab.upper(), size=12.5, font=K.F_HEAD, color=T['ink'])
        p = K.text(s, 5.0, y - 0.04, 1.3, 0.35, pct, size=16, font=K.F_HEAD, color=T['card2'], align='r')
        b = K.text(s, K.ML + 0.75, y + 0.32, 5.5, 0.5, body, size=10, line_sp=1.1)
        items.append([sq, a, p, b])
    cx, cy, dd = 9.95, 3.95, 5.1
    ch = K.chart_doughnut(s, cx - dd / 2, cy - dd / 2, dd, dd, [i[0] for i in c['items']], c['values'], hole=66)
    v = K.text(s, cx - 1.4, cy - 0.62, 2.8, 0.85, c['center'], size=40, font=K.F_HEAD, color=T['ink'], align='c', anchor='b')
    l = K.text(s, cx - 1.4, cy + 0.25, 2.8, 0.35, c['center_label'].upper(), size=10, font=K.F_SEMI, color=T['muted'],
               align='c', spacing=1)
    _note(s)
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, d, 'fade', 0.25, 0.5)
    K.anims(s, dl, 'wipe_l', 0.35, 0, 0.5)
    K.anims(s, items, 'float', 0.5, 0.18, 0.45)
    K.anim(s, ch, 'wheel', 0.3, 1.2)
    K.anims(s, [v, l], 'zoom', 1.1, 0.1, 0.4)
    return s


# ================================================================== 18. four stat cards with photos
def stats4(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 11, 0.75, c['title'], size=32)
    d = K.text(s, K.ML, 1.45, 7.5, 0.7, c['desc'], size=11.5, line_sp=1.2)
    (v1, l1, im1), (v2, l2, im2), (v3, l3), (v4, l4) = c['stats']
    groups = []
    # card 1
    c1 = K.card(s, K.ML, 2.35, 3.0, 4.55, fill=T['card2'], radius=0.26)
    p1 = K.picture(s, img(ctx, im1), K.ML + 0.2, 2.55, 2.6, 2.3, radius=0.18, focus=(0.4, 0.4))
    a1 = K.stat(s, K.ML + 0.25, 5.0, v1, '%', size=38, color='FFFFFF', w=2.6, h=0.75)
    b1 = K.text(s, K.ML + 0.25, 5.85, 2.55, 0.9, l1, size=10.5, color='FFFFFF', line_sp=1.15)
    groups.append([c1, p1, a1, b1])
    # card 2 (accent)
    c2 = K.card(s, 3.85, 2.35, 3.0, 4.55, fill=T['accent'], radius=0.26)
    p2 = K.picture(s, img(ctx, im2), 4.05, 2.55, 2.1, 2.3, radius=0.18)
    arr = K.oval(s, 6.23, 2.62, 0.46, fill=None, line=T['accent_ink'], lw=1.25)
    ai = K.icon(s, 'arrow-up-right', 6.33, 2.72, 0.26, T['accent_ink'])
    a2 = K.stat(s, 4.1, 5.0, v2, '%', size=38, color=T['accent_ink'], w=2.6, h=0.75)
    b2 = K.text(s, 4.1, 5.85, 2.55, 0.9, l2, size=10.5, color=T['accent_ink'], line_sp=1.15)
    groups.append([c2, p2, arr, ai, a2, b2])
    # card 3 (dark wide)
    c3 = K.card(s, 7.05, 2.35, 5.65, 2.15, fill=T['card'], radius=0.26)
    a3 = K.stat(s, 7.4, 2.55, v3, '%', size=40, color=T['accent'], w=3.0, h=0.85)
    b3 = K.text(s, 7.4, 3.5, 4.9, 0.85, l3, size=10.5, color='FFFFFF', alpha=85, line_sp=1.15)
    i3 = K.icon_badge(s, 'gauge', 12.05, 2.95, 0.66, T['accent'], T['accent_ink'], icon_scale=0.5)
    groups.append([c3, a3, b3] + i3)
    # card 4 (white)
    c4 = K.card(s, 7.05, 4.7, 5.65, 2.2, fill='FFFFFF', radius=0.26, sh_alpha=12)
    a4 = K.stat(s, 7.4, 4.9, v4, '%', size=40, color=T['ink'], w=3.0, h=0.85)
    b4 = K.text(s, 7.4, 5.85, 4.9, 0.85, l4, size=10.5, line_sp=1.15)
    i4 = K.icon_badge(s, 'badge-check', 12.05, 5.3, 0.66, T['card'], T['accent'], icon_scale=0.5)
    groups.append([c4, a4, b4] + i4)
    _note(s)
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, d, 'fade', 0.25, 0.5)
    K.anims(s, groups, 'float', 0.4, 0.2, 0.55)
    return s


# ================================================================== 19. stats mosaic
def stats_mosaic(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 2.0, 5.8, 1.7, c['title'], size=42, anchor='b', line_sp=0.95)
    bar = K.rect(s, K.ML, 4.15, 0.05, 0.62, fill=T['ink'])
    d = K.text(s, K.ML + 0.25, 4.1, 5.2, 1.5, c['desc'], size=11.5, line_sp=1.2)
    (v1, l1), (v2, l2), (v3, l3) = c['stats']
    t1 = K.card(s, 6.9, 0.55, 2.3, 2.0, fill=T['accent'], radius=0.22)
    t1v = K.stat(s, 7.1, 0.7, v1, '%', size=30, color=T['accent_ink'], w=2.0, h=0.65)
    t1l = K.text(s, 7.1, 1.42, 1.95, 1.0, l1, size=9.5, color=T['accent_ink'], line_sp=1.1)
    ph1 = K.picture(s, img(ctx, c['images'][0]), 9.35, 0.55, 3.35, 2.0, radius=0.22)
    ph2 = K.picture(s, img(ctx, c['images'][1]), 6.9, 2.7, 2.8, 4.25, radius=0.22, focus=(0.4, 0.5))
    t2 = K.card(s, 9.85, 2.7, 2.85, 2.35, fill=T['card'], radius=0.22)
    t2v = K.stat(s, 10.1, 2.9, v2, '%', size=32, color='FFFFFF', w=2.4, h=0.7)
    t2l = K.text(s, 10.1, 3.7, 2.4, 1.2, l2, size=9.5, color='FFFFFF', alpha=85, line_sp=1.1)
    t3 = K.card(s, 9.85, 5.2, 2.85, 1.75, fill=T['card2'], radius=0.22)
    t3v = K.stat(s, 10.1, 5.3, v3, '%', size=26, color='FFFFFF', w=2.4, h=0.6)
    t3l = K.text(s, 10.1, 5.95, 2.45, 0.9, l3, size=9, color='FFFFFF', alpha=85, line_sp=1.1)
    _note(s)
    K.anim(s, tt, 'wipe_l', 0.0, 0.7)
    K.anim(s, bar, 'wipe_d', 0.4, 0.4)
    K.anim(s, d, 'fade', 0.5, 0.5)
    K.anims(s, [[t1, t1v, t1l], ph1, ph2, [t2, t2v, t2l], [t3, t3v, t3l]], 'zoom', 0.3, 0.15, 0.5)
    return s


# ================================================================== 20. dark stats
def stats_dark(prs, ctx, c):
    s = _content(prs, ctx, dark=True)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 11, 0.75, c['title'], size=32)
    st = K.text(s, K.ML, 1.45, 8, 0.4, c['subtitle'], size=12, color='FFFFFF', alpha=72)
    ph = K.picture(s, img(ctx, c['image']), K.ML, 2.35, 4.5, 2.8, radius=0.24, focus=(0.35, 0.4))
    bar = K.rect(s, K.ML, 5.47, 0.05, 0.62, fill=T['accent'])
    d = K.text(s, K.ML + 0.25, 5.42, 4.2, 1.4, c['desc'], size=11, color='FFFFFF', alpha=80, line_sp=1.2)
    cards = []
    pos = [(5.55, 2.35), (9.2, 2.35), (5.55, 4.6)]
    for (x, y), (v, lab) in zip(pos, c['stats']):
        cd = K.card(s, x, y, 3.45, 2.05, fill='FFFFFF', radius=0.24, shadow_on=False)
        vv = K.stat(s, x + 0.28, y + 0.2, v, '%', size=34, color=T['ink'], w=2.6, h=0.75)
        ic = K.icon(s, 'chart-column', x + 2.8, y + 0.3, 0.4, T['card2'])
        ll = K.text(s, x + 0.28, y + 1.05, 2.9, 0.85, lab, size=10, line_sp=1.12)
        cards.append([cd, vv, ic, ll])
    big = K.card(s, 9.2, 4.6, 3.45, 2.05, fill=T['accent'], radius=0.24, shadow_on=False)
    bt = K.text(s, 9.48, 4.8, 2.9, 1.7, c['highlight'], size=12.5, font=K.F_SEMI, color=T['accent_ink'], line_sp=1.15,
                anchor='m')
    cards.append([big, bt])
    _note(s)
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, st, 'fade', 0.2, 0.5)
    K.anim(s, ph, 'zoom', 0.3, 0.6)
    K.anim(s, bar, 'wipe_d', 0.6, 0.4)
    K.anim(s, d, 'fade', 0.7, 0.5)
    K.anims(s, cards, 'zoom', 0.5, 0.15, 0.45)
    return s


# ================================================================== 21. table (dark)
def table_slide(prs, ctx, c):
    s = _content(prs, ctx, dark=True)
    T = K.T
    left = K.card(s, K.ML, 0.75, 5.0, 6.15, fill='FFFFFF', radius=0.3, shadow_on=False)
    K.line(s, K.ML + 0.35, 1.15, K.ML + 4.65, 1.15, T['ink'], 1.0, dash='sysDot', alpha=50)
    sv = K.stat(s, K.ML + 0.3, 1.25, c['stat'], '%', size=64, color=T['ink'], w=4.5, h=1.25)
    sp = K.pill(s, K.ML + 0.35, 2.65, c['stat_label'], size=10.5)
    sd = K.text(s, K.ML + 0.35, 3.15, 4.3, 1.2, c['stat_desc'], size=10.5, line_sp=1.15)
    bars = []
    for i, (lab, pct) in enumerate(c['bars']):
        y = 4.55 + i * 0.68
        a = K.text(s, K.ML + 0.35, y, 3.2, 0.28, lab, size=10, font=K.F_SEMI, color=T['ink'])
        b = K.text(s, K.ML + 3.55, y, 1.1, 0.28, f'{pct}%', size=10, font=K.F_HEAD, color=T['card2'], align='r')
        tr = K.rect(s, K.ML + 0.35, y + 0.34, 4.3, 0.12, fill=T['soft'], radius=0.06)
        fl = K.rect(s, K.ML + 0.35, y + 0.34, 4.3 * pct / 100, 0.12, fill=T['card2'], radius=0.06)
        bars.append([a, b, tr, fl])
    tt = K.title(s, 6.2, 0.72, 6.5, 0.7, c['title'], size=30)
    d = K.text(s, 6.2, 1.42, 6.4, 0.6, c['desc'], size=11, color='FFFFFF', alpha=75, line_sp=1.15)
    dl = K.line(s, 6.2, 2.15, 8.6, 2.15, T['accent'], 1.25)
    tb = K.table(s, 6.2, 2.45, 6.5, 4.4, c['rows'], col_w=[2.3, 1.4, 1.4, 1.4], header_fill=T['accent'],
                 header_color=T['accent_ink'], body_fill=T['card'], body_fill2=T['row_alt'],
                 body_color='FFFFFF', line_color=T['grid_dark'], size=10.5, header_size=10.5)
    _note(s)
    K.anim(s, left, 'fly_l', 0.0, 0.5)
    K.anims(s, [sv, sp, sd], 'fade', 0.4, 0.12, 0.4)
    t = 0.7
    for a, b, tr, fl in bars:
        K.anims(s, [a, b, tr], 'fade', t, 0.0, 0.3)
        K.anim(s, fl, 'wipe_l', t + 0.1, 0.6)
        t += 0.15
    K.anim(s, tt, 'wipe_l', 0.1, 0.6)
    K.anim(s, d, 'fade', 0.3, 0.5)
    K.anim(s, dl, 'wipe_l', 0.4, 0.5)
    K.anim(s, tb, 'wipe_u', 0.5, 0.9)
    return s


# ================================================================== 22. polaroid gallery on blurred photo
def gallery(prs, ctx, c):
    ctx['n'] += 1
    s = K.blank_slide(prs, dark=True)
    K.morph(s, 1.0)
    T = K.T
    bg = K.picture(s, img(ctx, c['bg']), 0, 0, K.SW, K.SH)
    ov = K.rect(s, 0, 0, K.SW, K.SH)
    K.grad_fill(ov, [(0, T['bg_dark'], 94), (45, T['bg_dark'], 82), (100, T['bg_dark'], 35)], angle=0)
    K.blobs(s, ctx['n'], dark=True, strength=0.7)
    K.breadcrumb(s, ctx['sec']['num'], ctx['sec']['title'], dark=True)
    K.page_no(s, ctx['n'], dark=True)
    tt = K.title(s, K.ML, 0.95, 5.6, 1.3, c['title'], size=32)
    d = K.text(s, K.ML, 2.35, 5.2, 1.0, c['desc'], size=11.5, color='FFFFFF', alpha=80, line_sp=1.2)
    pts = []
    for i, t in enumerate(c['points']):
        y = 3.6 + i * 0.72
        b = K.icon_badge(s, 'check', K.ML + 0.22, y + 0.2, 0.44, T['accent'], T['accent_ink'], icon_scale=0.55)
        tx = K.text(s, K.ML + 0.6, y, 4.8, 0.45, t, size=11.5, font=K.F_SEMI, color='FFFFFF', anchor='m')
        pts.append(b + [tx])
    pols = []
    specs = [(6.55, 0.9, -7), (9.55, 0.65, 5), (7.35, 3.85, 4), (10.2, 3.75, -5)]
    for (x, y, rot), (im, cap) in zip(specs, c['photos']):
        pols.append(K.polaroid(s, img(ctx, im), x, y, 2.75, 3.05, cap, rot))
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, d, 'fade', 0.3, 0.5)
    K.anims(s, pts, 'float', 0.5, 0.15, 0.45)
    K.anims(s, pols, 'grow', 0.3, 0.2, 0.5)
    return s


# ================================================================== 23. SWOT
def swot(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 6.2, 0.8, c['title'], size=34, anchor='m')
    vl = K.line(s, 6.9, 0.8, 6.9, 1.55, T['ink'], 1.25)
    d = K.text(s, 7.1, 0.72, 5.6, 0.9, c['desc'], size=11, line_sp=1.15, anchor='m')
    panel = K.card(s, K.ML, 2.0, K.SW - 2 * K.ML, 4.95, fill=T['card'], radius=0.32)
    letters = []
    cards = []
    fills = ['FFFFFF', T['accent'], 'FFFFFF', T['accent']]
    for i, (L, lab, ic, body) in enumerate(c['items']):
        x = 0.95 + i * 2.93
        lt = K.text(s, x, 1.9, 2.75, 1.55, L, size=110, font=K.F_HEAD, color='FFFFFF', alpha=14, align='c', anchor='t',
                    on=T['card'])
        letters.append(lt)
        cd = K.rect(s, x, 3.1, 2.75, 3.55, fill=fills[i], radius=0.22)
        tab = K.pill(s, x + 0.2, 3.3, lab, size=10, fill=T['card'] if i % 2 else T['accent'],
                     color='FFFFFF' if i % 2 else T['accent_ink'], h=0.32)
        tx = K.text(s, x + 0.2, 3.82, 2.4, 2.2, body, size=10.5, color=T['ink'] if i % 2 == 0 else T['accent_ink'],
                    line_sp=1.12, bullets=True, space_after=5, bullet_color=T['ink'] if i % 2 == 0 else T['accent_ink'])
        ico = K.icon(s, ic, x + 2.2, 6.1, 0.38, T['ink'] if i % 2 == 0 else T['accent_ink'])
        cards.append([cd, tab, tx, ico])
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, vl, 'wipe_d', 0.3, 0.4)
    K.anim(s, d, 'fade', 0.4, 0.5)
    K.anim(s, panel, 'zoom', 0.2, 0.5)
    K.anims(s, letters, 'fade', 0.5, 0.15, 0.6)
    K.anims(s, cards, 'float', 0.6, 0.18, 0.5)
    return s


# ================================================================== 24. dashboard
def dashboard(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.72, 4.0, 1.2, c['title'], size=30)
    d = K.text(s, K.ML, 1.98, 3.9, 0.9, c['desc'], size=10.5, line_sp=1.15)
    a = K.card(s, 4.85, 0.6, 7.85, 2.75, radius=0.24)
    at = K.text(s, 5.15, 0.75, 4, 0.3, c['line_title'], size=11, font=K.F_HEAD, color='FFFFFF')
    ach = K.chart_line(s, 5.0, 1.05, 7.55, 2.25, c['line_cats'], c['line_series'], dark=True, legend=True,
                       legend_pos='r', width=2.25, markers=True, font_size=9,
                       colors=['FFFFFF', T['accent'], T['violet'] if T['key'] == 'aurora' else 'F0B429'])
    b = K.card(s, K.ML, 3.0, 4.0, 3.9, radius=0.24)
    bt = K.text(s, K.ML + 0.3, 3.18, 3.4, 0.3, c['area_title'], size=11, font=K.F_HEAD, color='FFFFFF')
    bch = K.chart_line(s, K.ML + 0.12, 3.5, 3.8, 3.3, c['area_cats'], c['area_series'], dark=True, legend=False,
                       area=True, font_size=9, colors=[T['accent']])
    cc = K.card(s, 4.85, 3.55, 3.75, 3.35, fill=T['card2'], radius=0.24)
    ct = K.text(s, 5.15, 3.72, 3.2, 0.3, c['col_title'], size=11, font=K.F_HEAD, color='FFFFFF')
    cch = K.chart_bar(s, 4.95, 4.0, 3.55, 2.85, c['col_cats'], c['col_series'], dark=True, legend=False, labels=True,
                      colors=[T['accent']], gap=45, font_size=9, label_color='FFFFFF')
    kp = []
    for i, (lab, val, unit, delta) in enumerate(c['kpis']):
        y = 3.55 + i * 1.75
        cd = K.card(s, 8.8, y, 3.9, 1.6, fill=T['accent'], radius=0.24)
        l1 = K.text(s, 9.1, y + 0.18, 3.3, 0.28, lab, size=10, font=K.F_SEMI, color=T['accent_ink'])
        v1 = K.text(s, 9.1, y + 0.45, 3.3, 0.6, [[(val, {}), (' ' + unit, {'size': 11})]], size=26, font=K.F_HEAD,
                    color=T['accent_ink'])
        d1 = K.text(s, 9.1, y + 1.12, 3.3, 0.28, [[('▲ ', {'color': T['accent_ink']}), (delta, {})]], size=9,
                    font=K.F_MED, color=T['accent_ink'])
        kp.append([cd, l1, v1, d1])
    _note(s)
    K.anim(s, tt, 'wipe_l', 0.0, 0.6)
    K.anim(s, d, 'fade', 0.25, 0.5)
    K.anims(s, [[a, at], ach], 'fade', 0.3, 0.3, 0.5)
    K.anims(s, [[b, bt], bch], 'fade', 0.5, 0.3, 0.5)
    K.anims(s, [[cc, ct], cch], 'fade', 0.7, 0.3, 0.5)
    K.anims(s, kp, 'fly_r', 0.8, 0.15, 0.5)
    return s


# ================================================================== 25. conclusion 3 cards
def conclusion(prs, ctx, c):
    s = _content(prs, ctx)
    T = K.T
    tt = K.title(s, K.ML, 0.75, K.SW - 2 * K.ML, 0.75, c['title'], size=34, align='c')
    d = K.text(s, 1.8, 1.5, 9.73, 0.8, c['desc'], size=11.5, align='c', line_sp=1.2)
    dl = K.line(s, 4.2, 2.45, 9.13, 2.45, T['ink'], 1.0)
    d1 = K.oval(s, 4.2 - 0.05, 2.4, 0.1, fill=T['ink'])
    d2 = K.oval(s, 9.13 - 0.05, 2.4, 0.1, fill=T['ink'])
    cards = []
    fills = [T['card'], T['card2'], T['card']]
    icons = ['target', 'layers', 'rocket']
    for i, (lab, body, fig, fig_lab) in enumerate(c['items']):
        x = K.ML + i * 4.08
        tab = K.rect(s, x, 2.95, 1.95, 0.52, fill=T['accent'], radius=0.14)
        K.shape_text(tab, lab.upper(), size=10, font=K.F_HEAD, color=T['accent_ink'], anchor='t', margin=(0.12, 0.08))
        cd = K.card(s, x, 3.25, 3.87, 3.6, fill=fills[i], radius=0.24)
        bd = K.icon_badge(s, icons[i], x + 0.62, 3.95, 0.66, T['accent'], T['accent_ink'], icon_scale=0.5)
        tx = K.text(s, x + 0.3, 4.45, 3.3, 1.2, body, size=11, color='FFFFFF', line_sp=1.2, on=fills[i], alpha=90)
        sep = K.line(s, x + 0.3, 5.75, x + 3.57, 5.75, 'FFFFFF', 0.75, alpha=25)
        fv = K.text(s, x + 0.3, 5.85, 1.7, 0.6, fig, size=24, font=K.F_HEAD, color=T['accent'], anchor='m')
        fl = K.text(s, x + 1.95, 5.85, 1.65, 0.6, fig_lab, size=9, color='FFFFFF', anchor='m', line_sp=1.05,
                    on=fills[i], alpha=80)
        cards.append([tab, cd] + bd + [tx, sep, fv, fl])
    K.anim(s, tt, 'fade', 0.0, 0.6)
    K.anim(s, d, 'fade', 0.2, 0.5)
    K.anim(s, dl, 'wipe_l', 0.3, 0.6)
    K.anims(s, [d1, d2], 'zoom', 0.8, 0.05, 0.3)
    K.anims(s, cards, 'float', 0.6, 0.2, 0.5)
    return s


# ================================================================== 26. proposal on full-bleed photo with glass card
def proposal(prs, ctx, c):
    ctx['n'] += 1
    s = K.blank_slide(prs, dark=True)
    K.morph(s, 1.2)
    T = K.T
    bg = K.picture(s, img(ctx, c['bg']), 0, 0, K.SW, K.SH, nm='!!hero')
    ov = K.rect(s, 0, 0, K.SW, K.SH)
    K.grad_fill(ov, [(0, T['bg_dark'], 92), (50, T['bg_dark'], 70), (100, T['bg_dark'], 30)], angle=0)
    K.blobs(s, ctx['n'], dark=True, strength=0.6)
    K.breadcrumb(s, ctx['sec']['num'], ctx['sec']['title'], dark=True)
    K.page_no(s, ctx['n'], dark=True)
    q = K.icon(s, 'quote', K.ML, 1.35, 0.7, T['accent'])
    qt = K.text(s, K.ML, 2.2, 6.1, 2.4, c['quote'], size=23, font=K.F_SEMI, color='FFFFFF', line_sp=1.15)
    ql = K.line(s, K.ML, 4.72, K.ML + 0.6, 4.72, T['accent'], 2.0)
    au = K.text(s, K.ML + 0.8, 4.57, 5.3, 0.32, c['author'], size=11, font=K.F_MED, color=T['accent'], anchor='m')
    gx, gy, gw, gh = 7.35, 0.95, 5.3, 5.75
    glass = K.glass(s, img(ctx, c['bg_blur']), gx, gy, gw, gh)
    gt = K.text(s, gx + 0.4, gy + 0.35, gw - 0.8, 0.45, c['card_title'].upper(), size=15, font=K.F_HEAD, color='FFFFFF')
    rows = []
    for i, (h, body) in enumerate(c['items']):
        y = gy + 1.05 + i * 1.5
        n = K.text(s, gx + 0.4, y, 0.8, 0.55, f'{i + 1:02d}', size=24, font=K.F_HEAD, color=T['accent'])
        a = K.text(s, gx + 1.25, y + 0.02, gw - 1.65, 0.32, h, size=12.5, font=K.F_HEAD, color='FFFFFF')
        b = K.text(s, gx + 1.25, y + 0.38, gw - 1.65, 0.95, body, size=10, color='FFFFFF', alpha=82, line_sp=1.15)
        rows.append([n, a, b])
    K.anim(s, q, 'zoom', 0.2, 0.4)
    K.anim(s, qt, 'wipe_l', 0.35, 0.9)
    K.anim(s, ql, 'wipe_l', 0.95, 0.4)
    K.anim(s, au, 'fade', 1.0, 0.5)
    K.anims(s, glass, 'fade', 0.4, 0.0, 0.6)
    K.anim(s, gt, 'fade', 0.7, 0.4)
    K.anims(s, rows, 'float', 0.85, 0.18, 0.45)
    return s


# ================================================================== 27. thank you
def thanks(prs, ctx, c):
    s = _new(prs, ctx, blob_idx=5, tr=1.4)
    T = K.T
    fx, fy, fw, fh = K.ML, 1.3, 4.9, 5.6
    ring = K.oval(s, fx + 0.45, fy + 0.35, 4.0, fill=None, line=T['accent'], lw=1.25, dash='dash')
    hero = K.picture(s, img(ctx, c['bg']), fx, fy, fw, fh, radius=0.36, nm='!!hero', focus=(0.55, 0.5))
    K.shadow(hero, blur=0.5, dist=0.2, alpha=25, color=T['ink'])
    ov = K.rect(s, fx, fy, fw, fh, radius=0.36)
    K.grad_fill(ov, [(0, T['ink'], 10), (60, T['ink'], 25), (100, T['ink'], 80)], angle=90)
    ph = 5.95
    pw = ph * ctx['size']['team_pair'][0] / ctx['size']['team_pair'][1]
    person = K.picture(s, img(ctx, 'team_pair'), fx + (fw - pw) / 2, fy + fh - ph, pw, ph, fit='contain')
    tag = K.pill(s, 6.4, 1.6, c['tag'], size=11)
    t1 = K.text(s, 6.4, 2.05, 6.4, 1.1, c['title1'], size=62, font=K.F_HEAD, color=T['ink'], anchor='b', line_sp=0.9)
    t2 = K.text(s, 6.4, 3.1, 6.4, 0.75, c['title2'], size=36, font=K.F_HEAD, color=T['card2'], line_sp=0.9)
    ln = K.line(s, 6.4, 4.1, 9.6, 4.1, T['ink'], 1.0)
    dt = K.oval(s, 9.6 - 0.045, 4.1 - 0.045, 0.09, fill=T['ink'])
    cons = []
    for i, (ic, val) in enumerate(c['contacts']):
        y = 4.45 + i * 0.58
        b = K.icon_badge(s, ic, 6.62, y + 0.2, 0.42, T['card'], T['accent'], icon_scale=0.5)
        t = K.text(s, 7.0, y, 5.5, 0.4, val, size=11.5, font=K.F_MED, color=T['ink'], anchor='m')
        cons.append(b + [t])
    qa = K.icon_badge(s, 'messages-square', 12.1, 6.35, 0.8, T['accent'], T['accent_ink'], icon_scale=0.48,
                      shadow_on=True)
    K.anim(s, ring, 'zoom', 0.2, 0.7)
    K.anim(s, ov, 'fade', 0.0, 0.5)
    K.anim(s, person, 'rise', 0.5, 0.8)
    K.anim(s, tag, 'fade', 0.3, 0.4)
    K.anim(s, t1, 'wipe_l', 0.45, 0.7)
    K.anim(s, t2, 'wipe_l', 0.75, 0.6)
    K.anim(s, ln, 'wipe_l', 1.0, 0.5)
    K.anim(s, dt, 'fade', 1.4, 0.2)
    K.anims(s, cons, 'float', 1.1, 0.12, 0.45)
    K.anims(s, qa, 'zoom', 1.6, 0.05, 0.4)
    K.notes(s, 'Cảm ơn và mời hội đồng đặt câu hỏi.')
    return s


# ================================================================== 28. image credits (hidden)
def credits(prs, ctx, c):
    s = _new(prs, ctx, blob_idx=2)
    s._element.set('show', '0')
    T = K.T
    K.title(s, K.ML, 0.6, 11, 0.6, 'NGUỒN HÌNH ẢNH', size=26)
    K.text(s, K.ML, 1.2, 12, 0.5, 'Slide ẩn — không hiển thị khi trình chiếu. Ảnh từ bộ dữ liệu Open Images (Google), '
           'giấy phép CC BY 2.0 của tác giả trên Flickr. Icon: Lucide (ISC). Font: Montserrat (SIL OFL).',
           size=10, italic=True, color=T['muted'])
    lines = c['lines']
    half = (len(lines) + 1) // 2
    for col, chunk in enumerate((lines[:half], lines[half:])):
        K.text(s, K.ML + col * 6.1, 1.8, 5.9, 5.2, '\n'.join(chunk), size=8.5, line_sp=1.1)
    return s
