#!/usr/bin/env python3
"""Parse the 'Nhóm huấn luyện' cell (+ note) of Part 4 rows into structured groups."""
import re

NUM = r'(?:Nhóm\s*)?(\d)'

def plain(s):
    return s.replace('**', '').replace('◊', '').strip()

def find_groups(clause):
    """return list of (group:int, joiner_before:str) in order of appearance"""
    out = []
    # tokens like "Nhóm 3", "Nhóm 3 hoặc 4", "Nhóm 1 và Nhóm 2", "Nhóm 3 và/hoặc Nhóm 5"
    pat = re.compile(r'(?:(và/hoặc|và|hoặc|,)\s*)?(?:Nhóm\s*(\d)|(?<![\d\w])(\d)(?![\d\w]))', re.I)
    pos = 0
    first = True
    for m in re.finditer(r'Nhóm\s*(\d)', clause):
        out.append([int(m.group(1)), m.start(), m.end(), ''])
    # bare numbers after joiner: "Nhóm 3 hoặc 4"
    for m in re.finditer(r'Nhóm\s*\d\s*(hoặc|và)\s*(\d)(?![\d\w])', clause):
        out.append([int(m.group(2)), m.start(2), m.end(2), m.group(1)])
    out.sort(key=lambda x: x[1])
    # joiner detection for "Nhóm a <joiner> Nhóm b"
    res = []
    for i, (g, s, e, j) in enumerate(out):
        if not j and i > 0:
            between = clause[out[i - 1][2]:s]
            bj = ''
            if re.fullmatch(r'\s*và/hoặc\s*', between):
                bj = 'vh'
            elif re.fullmatch(r'\s*(\(?\s*và)\s*', between):
                bj = 'và'
            elif re.fullmatch(r'\s*hoặc\s*', between):
                bj = 'hoặc'
            elif re.fullmatch(r'\s*(\(\s*)?(khuyến nghị )?thêm\s*', between):
                bj = 'thêm'
            elif re.fullmatch(r'\s*,\s*', between):
                bj = 'và'
            else:
                bj = 'khác'
            j = bj
        if j == 'và/hoặc':
            j = 'vh'
        res.append((g, j))
    return res

SERVICES = [
    (r'an toàn điện', 'Huấn luyện an toàn điện'),
    (r'an toàn hóa chất', 'Huấn luyện an toàn hóa chất'),
    (r'sơ cấp cứu', 'Huấn luyện sơ cấp cứu'),
]

def parse(grp_rich, note, diamond=False):
    T = plain(grp_rich)
    N = plain(note or '')
    res = {'g': [], 'o': [], 'x': [], 'f': []}  # defaults, optionals[{g,why}], extras, flags
    TL = T.lower()
    if diamond:
        res['f'].append('dia')
    if re.search(r'ranh giới', TL) or re.search(r'xem xét', TL) or 'xác nhận' in TL:
        res['f'].append('rev')
    if TL.startswith('không thuộc'):
        res['f'].append('none')
    if TL.startswith('theo công việc') or TL.startswith('nhóm theo công việc') or TL.startswith('nhóm của công việc') or 'theo công việc chính' in TL:
        res['f'].append('work')
    if TL.startswith('dịch vụ sơ cấp cứu'):
        res['f'].append('svc')
    for pat, label in SERVICES:
        if re.search(pat, TL):
            res['x'].append(label)

    # remove "(mục ...)" references and parentheses that hold only reference text
    T2 = re.sub(r'\((?:[^()]*?mục[^()]*?)\)', ' ', T)
    clauses = [c.strip() for c in re.split(r';', T2) if c.strip()]
    defaults = []
    optionals = []   # (g, why)

    def add_def(g):
        if g not in defaults and g not in [o[0] for o in optionals]:
            defaults.append(g)

    def add_opt(g, why):
        if g in defaults:
            return
        for k, o in enumerate(optionals):
            if o[0] == g:
                return
        optionals.append((g, why.strip()))

    seen_default_clause = False
    for ci, c in enumerate(clauses):
        gl = find_groups(c)
        if not gl:
            continue
        cl = c.lower()
        fallback = bool(re.match(r'^(không thì|còn lại|nếu không|không thì)', cl)) or 'còn lại' in cl[:12]
        cond = ' nếu ' in (' ' + cl + ' ') or re.search(r'\bnếu\b', cl)
        addm = re.search(r'\b(thêm|xem xét|khuyến nghị)\b', cl)
        why_txt = c
        if fallback:
            for k, (g, j) in enumerate(gl):
                if k == 0 or j in ('và',):
                    add_def(g)
                else:
                    add_opt(g, why_txt)
            seen_default_clause = True
            continue
        if cond:
            for k, (g, j) in enumerate(gl):
                add_opt(g, why_txt)
            continue
        if addm:
            # groups before the keyword are normal; groups after it are optional additions
            kpos = addm.start()
            for k, (g, j) in enumerate(gl):
                gpos = [m.start() for m in re.finditer(r'Nhóm\s*%d' % g, c)]
                before = any(p < kpos for p in gpos) if gpos else True
                if before:
                    if k == 0 and not (seen_default_clause and defaults):
                        add_def(g)
                    elif j == 'và':
                        add_def(g)
                    else:
                        add_opt(g, c)
                else:
                    add_opt(g, why_txt)
            seen_default_clause = True
            continue
        # plain clause
        for k, (g, j) in enumerate(gl):
            if k == 0:
                if seen_default_clause and defaults:
                    add_opt(g, c)
                else:
                    add_def(g)
            elif j == 'và':
                add_def(g)
            elif j in ('hoặc', 'vh', 'thêm', 'khác'):
                add_opt(g, c)
            else:
                add_def(g)
        seen_default_clause = True

    # Nothing default but optionals and the text says "theo công việc"/"xem xét": keep as optional only
    # Notes: add optional groups from note sentences
    for sent in re.split(r'(?<=[.;])\s+|\.\s*$', N):
        sent = sent.strip()
        if not sent or not re.search(r'Nhóm\s*\d', sent):
            continue
        if re.match(r'^(Phó phòng|Phó khoa|Khách)', sent):
            continue
        low = sent.lower()
        if re.search(r'(thêm|xem xét|khuyến nghị)\b', low) or re.search(r'Nhóm\s*\d\s*(nếu|khi)', sent) or re.search(r'(nếu|khi)[^.;]*Nhóm\s*\d', sent):
            for g, j in find_groups(sent):
                if g not in defaults:
                    add_opt(g, sent.rstrip('.'))
    res['g'] = defaults
    res['o'] = [{'g': g, 'w': w} for g, w in optionals if g not in defaults]
    return res

if __name__ == '__main__':
    import json, sys, collections
    d = json.load(open(sys.argv[1], encoding='utf-8'))
    cnt = collections.OrderedDict()
    for ind in d:
        for b in ind['blocks']:
            for r in b['rows']:
                key = r['grp']
                if key in cnt:
                    continue
                p = parse(r['grp'], r['note'], r.get('dia'))
                cnt[key] = p
    for k, p in cnt.items():
        print(f"{plain(k)[:95]:95s} -> g={p['g']} o={[o['g'] for o in p['o']]} x={p['x']} f={p['f']}")
