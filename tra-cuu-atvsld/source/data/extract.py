#!/usr/bin/env python3
"""Extract structured data from the 17 sector handbooks (docx) into data.json."""
import sys, re, json, unicodedata
import docx
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

SRC = sys.argv[1]
OUT = sys.argv[2]

def body_items(d):
    for ch in d.element.body.iterchildren():
        if ch.tag == qn('w:p'):
            yield ('p', Paragraph(ch, d))
        elif ch.tag == qn('w:tbl'):
            yield ('t', Table(ch, d))

def style_name(p):
    try:
        return p.style.name if p.style is not None else ''
    except Exception:
        return ''

def rich(p):
    """paragraph -> text with **bold** markup (adjacent bold runs merged)"""
    segs = []
    for r in p.runs:
        t = r.text
        if not t:
            continue
        b = bool(r.bold)
        if segs and segs[-1][0] == b:
            segs[-1][1] += t
        else:
            segs.append([b, t])
    out = ''
    for b, t in segs:
        if b and t.strip():
            lead = len(t) - len(t.lstrip())
            trail = len(t) - len(t.rstrip())
            out += t[:lead] + '**' + t.strip() + '**' + (t[len(t) - trail:] if trail else '')
        else:
            out += t
    out = out.replace(' ', ' ')
    out = re.sub(r'[ \t]+', ' ', out).strip()
    out = out.replace('****', '')
    return out

def plain(s):
    return s.replace('**', '')

def cell_paras(c):
    return [rich(p) for p in c.paragraphs if p.text.strip()]

def uniq_cells(row):
    cs = []
    seen = []
    for c in row.cells:
        if c._tc in seen:
            continue
        seen.append(c._tc)
        cs.append(c)
    return cs

def norm(s):
    s = unicodedata.normalize('NFC', s.lower())
    s = re.sub(r'[^\w\s]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def parse_ranges(label):
    """Vietnamese headcount band -> (lo, hi) ; hi exclusive; None if no parse"""
    s = label.lower().replace('.', '').replace(',', '')
    nums = [int(x) for x in re.findall(r'\d+', s)]
    if re.search(r'dưới\s+\d', s) and len(nums) == 1 and not re.search(r'từ', s):
        return (0, nums[0])
    m = re.search(r'từ\s+(\d+)\s+đến\s+dưới\s+(\d+)', s)
    if m:
        return (int(m.group(1)), int(m.group(2)))
    m = re.search(r'từ\s+(\d+)\s+đến\s+(\d+)', s)
    if m:
        return (int(m.group(1)), int(m.group(2)) + 1)
    m = re.search(r'(trên|từ)\s+(\d+)\s+(người\s+)?(trở lên)?', s)
    if m and len(nums) == 1:
        lo = int(m.group(2))
        # "trên 1000" => > 1000 ; treat as >= 1000 (flag boundary in the source note)
        return (lo, 10**9)
    return None

CLUSTER_RE = re.compile(r'[Cc]ụm\s*(\d+(?:\s*(?:,|và cụm|và)\s*\d+)*)')

def cluster_refs(text):
    refs = []
    for m in CLUSTER_RE.finditer(text):
        for x in re.findall(r'\d+', m.group(1)):
            v = int(x)
            if v not in refs:
                refs.append(v)
    return refs

def strip_cluster_markers(note):
    n = note
    n = re.sub(r'^\s*[Cc]ụm\s*\d+(?:\s*(?:,|và cụm|và)\s*\d+)*\s*\.?\s*', '', n)
    n = re.sub(r'\s*\(\s*[Cc]ụm\s*\d+(?:\s*(?:,|và cụm|và)\s*\d+)*\s*\)\s*$', '', n)
    n = re.sub(r'^\s*\(\s*và cụm[^)]*\)\s*', '', n)
    return n.strip(' .;') if n.strip() in ('', '.') else n.strip()

def parse_file(path, num):
    d = docx.Document(path)
    items = list(body_items(d))

    # ---- cover
    texts = []
    for k, it in items[:30]:
        if k == 'p' and it.text.strip():
            texts.append(it.text.strip())
    name = ''
    legal = ''
    for t in texts:
        if t.upper().startswith('NGÀNH ') and not name:
            name = t.strip()
        if t.startswith('Thông tin pháp lý'):
            legal = t
    m = re.search(r'ngày\s+(\d{1,2}/\d{1,2}/\d{4})', legal)
    legal_date = m.group(1) if m else ''

    # ---- locate headings
    heads = []  # (index, level, text)
    for i, (k, it) in enumerate(items):
        if k == 'p':
            sn = style_name(it)
            if sn.startswith('Heading'):
                heads.append((i, sn, it.text.strip()))

    def find_head(pat, level=None):
        for i, sn, t in heads:
            if re.match(pat, t) and (level is None or sn == level):
                return i
        return None

    def next_head_after(i, levels=('Heading 1', 'Heading 2')):
        for j, sn, t in heads:
            if j > i and sn in levels:
                return j
        return len(items)

    # ---- 3.1 enterprise types
    types = None
    i31 = find_head(r'^3\.1\.')
    if i31 is not None:
        end = next_head_after(i31)
        for j in range(i31 + 1, end):
            if items[j][0] == 't':
                tb = items[j][1]
                rows = []
                for r in tb.rows:
                    rows.append([' / '.join(cell_paras(c)) for c in uniq_cells(r)])
                if len(rows) >= 2:
                    types = {'header': rows[0], 'rows': [[plain(x) for x in r] for r in rows[1:]]}
                    break

    # ---- 3.4 scale
    scale = []
    i34 = find_head(r'^3\.4\.')
    scale_title = ''
    scale_intro = ''
    if i34 is not None:
        scale_title = heads and [t for j, sn, t in heads if j == i34][0] or ''
        end = next_head_after(i34, ('Heading 1', 'Heading 2'))
        cur_title = ''
        intro_done = False
        for j in range(i34 + 1, end):
            k, it = items[j]
            if k == 'p':
                sn = style_name(it)
                t = it.text.strip()
                if not t:
                    continue
                if sn.startswith('Heading'):
                    cur_title = t
                elif not intro_done:
                    scale_intro = t
                    intro_done = True
            else:
                tb = it
                if len(tb.columns) in (2, 3) and len(tb.rows) >= 3 and len(tb.rows) <= 12:
                    rows = [[plain(' / '.join(cell_paras(c))) for c in uniq_cells(r)] for r in tb.rows]
                    nc = len(tb.columns)
                    if all(len(r) == nc for r in rows):
                        band_rows = []
                        okc = 0
                        for r in rows[1:]:
                            rg = parse_ranges(r[0])
                            if rg:
                                okc += 1
                            band_rows.append({'label': r[0], 'cells': r[1:], 'lo': rg[0] if rg else None, 'hi': rg[1] if rg else None})
                        scale.append({'title': cur_title, 'head': rows[0], 'rows': band_rows, 'ranged': okc == len(band_rows)})

    # ---- Part 4 table
    i4 = find_head(r'^PHẦN 4\.', 'Heading 1')
    end4 = next_head_after(i4, ('Heading 1',))
    blocks = []
    p4_tbl = None
    for j in range(i4 + 1, end4):
        if items[j][0] == 't' and len(items[j][1].columns) == 3 and len(items[j][1].rows) > 10:
            p4_tbl = items[j][1]
            break
    cur = None
    for r in p4_tbl.rows[1:]:
        cs = uniq_cells(r)
        if len(cs) == 1:
            t = plain(cell_paras(cs[0])[0] if cell_paras(cs[0]) else '').strip()
            cur = {'name': t, 'rows': []}
            blocks.append(cur)
            continue
        if len(cs) < 3:
            continue
        pos = plain(' / '.join(cell_paras(cs[0]))).strip()
        grp_rich = ' / '.join(cell_paras(cs[1]))
        note_rich = ' / '.join(cell_paras(cs[2]))
        if cur is None:
            cur = {'name': '', 'rows': []}
            blocks.append(cur)
        diamond = ('◊' in pos) or ('◊' in grp_rich) or ('◊' in note_rich)
        grp_rich = grp_rich.replace('◊', '').replace('  ', ' ').strip()
        pos = pos.replace('◊', '').strip()
        refs = cluster_refs(note_rich)
        note_clean = strip_cluster_markers(plain(note_rich.replace('◊', '')))
        cur['rows'].append({
            'pos': pos,
            'grp': grp_rich,
            'note': note_clean,
            'cl': refs,
            'dia': diamond,
        })

    # ---- Part 5 cards
    i5 = find_head(r'^PHẦN 5\.', 'Heading 1')
    end5 = next_head_after(i5, ('Heading 1',))
    clusters = []
    for hi, (j, sn, t) in enumerate(heads):
        if j <= i5 or j >= end5 or sn != 'Heading 2':
            continue
        m = re.match(r'^5\.(\d+)\.\s*Cụm\s*(\d+)\s*[:\-–]\s*(.*)$', t)
        if not m:
            continue
        cno = int(m.group(2))
        title = m.group(3).strip()
        # find first table after heading before next heading
        tb = None
        for q in range(j + 1, end5):
            if items[q][0] == 'p' and style_name(items[q][1]).startswith('Heading'):
                break
            if items[q][0] == 't':
                tb = items[q][1]
                break
        card = {'no': cno, 'title': title, 'positions': [], 'groups': [], 'content': [], 'faq': [], 'soft': [], 'upsell': [], 'note': [], 'extra': []}
        if tb is not None:
            label = ''
            for r in tb.rows:
                cs = uniq_cells(r)
                if len(cs) < 2:
                    continue
                lab = plain(' '.join(cell_paras(cs[0]))).strip()
                paras = cell_paras(cs[1])
                if lab:
                    label = lab
                low = label.lower()
                if low.startswith('vị trí'):
                    card['positions'] += paras
                elif low.startswith('nhóm huấn luyện'):
                    card['groups'] += paras
                elif low.startswith('nội dung huấn luyện'):
                    card['content'] += paras
                elif low.startswith('khách hàng hay'):
                    # Q/A paragraphs
                    q = None
                    for ptxt in paras:
                        pt = plain(ptxt)
                        if re.match(r'^Khách hỏi\s*:', pt):
                            q = {'q': re.sub(r'^Khách hỏi\s*:\s*', '', pt), 'a': []}
                            card['faq'].append(q)
                        elif re.match(r'^Gợi ý trả lời\s*:', pt):
                            if q is None:
                                q = {'q': '', 'a': []}
                                card['faq'].append(q)
                            q['a'].append(re.sub(r'^Gợi ý trả lời\s*:\s*', '', ptxt.replace('**Gợi ý trả lời:**', '').replace('**Gợi ý trả lời**:', '')).strip() or re.sub(r'^Gợi ý trả lời\s*:\s*', '', pt))
                        else:
                            if q is not None:
                                q['a'].append(ptxt)
                            else:
                                card['extra'].append({'label': label, 'text': ptxt})
                elif low.startswith('tính năng phần mềm'):
                    card['soft'] += paras
                elif low.startswith('cơ hội bán kèm'):
                    card['upsell'] += paras
                elif low.startswith('lưu ý'):
                    card['note'] += paras
                else:
                    for ptxt in paras:
                        card['extra'].append({'label': label, 'text': ptxt})
        clusters.append(card)

    return {
        'no': num,
        'name': name,
        'legal': legal_date,
        'types': types,
        'scale': {'title': scale_title, 'intro': scale_intro, 'tables': scale},
        'blocks': blocks,
        'clusters': clusters,
    }

def main():
    data = []
    for n in range(1, 18):
        p = f'{SRC}/{n:02d}.docx'
        data.append(parse_file(p, n))
    json.dump(data, open(OUT, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
    for d in data:
        rows = sum(len(b['rows']) for b in d['blocks'])
        ref = sum(1 for b in d['blocks'] for r in b['rows'] if r['cl'])
        print(f"{d['no']:02d} {d['name'][:40]:40s} blocks={len(d['blocks']):2d} rows={rows:3d} withRef={ref:3d} clusters={len(d['clusters']):2d} types={'Y' if d['types'] else 'N'} scaleTbl={len(d['scale']['tables'])} legal={d['legal']}")

main()
