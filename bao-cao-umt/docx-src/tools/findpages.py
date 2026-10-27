# Tìm số trang của từng mục trong PDF đã dựng
import sys, json, subprocess, re
pdf, entries_file, out_file = sys.argv[1], sys.argv[2], sys.argv[3]
entries = json.load(open(entries_file, encoding='utf-8'))
n = int(re.search(r'Pages:\s+(\d+)', subprocess.run(['pdfinfo', pdf], capture_output=True, text=True).stdout).group(1))
norm = lambda s: re.sub(r'\s+', '', s)
pages = [norm(subprocess.run(['pdftotext', '-f', str(i), '-l', str(i), pdf, '-'], capture_output=True, text=True).stdout) for i in range(1, n + 1)]
# trang kết thúc mục lục: trang đầu tiên chứa mục cuối cùng
last = norm(entries[-1]['text'])
toc_end = next(i for i, p in enumerate(pages) if last in p)
res = {}; cur = toc_end + 1
for e in entries:
    t = norm(e['text'])
    found = None
    for i in range(cur, n):
        if t in pages[i]:
            found = i; break
    if found is None:
        print('KHÔNG THẤY', e['text']); continue
    res[e['text']] = found + 1; cur = found
json.dump(res, open(out_file, 'w', encoding='utf-8'), ensure_ascii=False, indent=1)
print('pages', n, 'toc_end_page', toc_end + 1, 'found', len(res), '/', len(entries))
