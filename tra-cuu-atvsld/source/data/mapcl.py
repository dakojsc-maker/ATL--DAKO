#!/usr/bin/env python3
"""Assign each Part-4 position row to Part-5 cluster card(s)."""
import json, re, sys, unicodedata

STOP = set('và hoặc của các cho với trong tại là có theo từ đến khi nếu không thì những một người nhân viên'.split())

def norm(s):
    s = unicodedata.normalize('NFC', s.lower())
    s = s.replace('**', '')
    s = re.sub(r'[^\w\s]', ' ', s)
    return re.sub(r'\s+', ' ', s).strip()

def toks(s):
    return [t for t in norm(s).split() if t not in STOP and len(t) > 1]

def segments(pos):
    # split on commas, semicolons, colons, slashes and parentheses
    parts = re.split(r'[,;:/()]|\svà\s|\shoặc\s', pos)
    out = []
    for p in parts:
        p = norm(p)
        if len(p.split()) >= 2:
            out.append(p)
        elif len(p) >= 4:
            out.append(p)
    return out

def group_nums(s):
    return set(int(x) for x in re.findall(r'[Nn]hóm\s*(\d)', s))

def score(row, cl):
    ptxt = ' ' + norm(' ; '.join(cl['positions'])) + ' '
    ttxt = ' ' + norm(cl['title']) + ' '
    sc = 0.0
    for seg in segments(row['pos']):
        if (' ' + seg + ' ') in ptxt:
            sc += 1.0 + 0.3 * len(seg.split())
        elif (' ' + seg + ' ') in ttxt:
            sc += 0.5 + 0.1 * len(seg.split())
    # token overlap
    rt = set(toks(row['pos']))
    ct = set(toks(' '.join(cl['positions'])))
    if rt:
        sc += 1.5 * len(rt & ct) / len(rt)
    # group agreement
    rg = group_nums(plain(row['grp']))
    cg = group_nums(' '.join(cl['groups'])) if cl['groups'] else set()
    if rg and cg and (rg & cg):
        sc += 0.6
    return sc

def plain(s):
    return s.replace('**', '')

def assign(industry):
    rows = [r for b in industry['blocks'] for r in b['rows']]
    nref = sum(1 for r in rows if r['cl'])
    use_ref = nref >= 0.6 * len(rows)
    ncl = len(industry['clusters'])
    nums = [c['no'] for c in industry['clusters']]
    low = []
    for r in rows:
        if use_ref:
            r['cl'] = [x for x in r['cl'] if x in nums]
            if r['cl']:
                r['src'] = 'ref'
                continue
        else:
            r['cl'] = []
        sc = sorted(((score(r, c), c['no']) for c in industry['clusters']), reverse=True)
        best, bno = sc[0]
        r['cl'] = [bno]
        r['src'] = 'match'
        r['conf'] = round(best, 2)
        # second cluster if very close and decent
        if len(sc) > 1 and sc[1][0] >= max(2.2, best * 0.9) and sc[1][0] > 0:
            r['cl'].append(sc[1][1])
        if best < 2.0:
            low.append((r['pos'][:70], bno, round(best, 2)))
    return use_ref, low

if __name__ == '__main__':
    data = json.load(open(sys.argv[1], encoding='utf-8'))
    show = set(sys.argv[3:]) if len(sys.argv) > 3 else set()
    for ind in data:
        use_ref, low = assign(ind)
        print(f"{ind['no']:02d} useRef={use_ref} low-confidence={len(low)}")
        if f"{ind['no']:02d}" in show:
            tm = {c['no']: c['title'] for c in ind['clusters']}
            for b in ind['blocks']:
                print('  #', b['name'])
                for r in b['rows']:
                    print(f"     [{','.join(map(str, r['cl']))}] {r['pos'][:70]} -> {tm.get(r['cl'][0], '?')[:45]} ({r.get('conf', '')})")
    json.dump(data, open(sys.argv[2], 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
