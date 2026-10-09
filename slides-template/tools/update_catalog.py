"""
Refresh the template library after a template is added or rebuilt.

    python tools/update_catalog.py            # render previews that are out of date, rewrite catalog files
    python tools/update_catalog.py --force    # re-render every preview

Reads   catalog/templates.json            (the single source of truth — add new templates there)
Writes  catalog/site/previews/<code>/      cover.jpg, sNN.jpg (one per visible slide), sheet.jpg
        catalog/site/index.html            the library page (published as an Artifact)
        catalog/CATALOG.md                 the same list as Markdown (readable on GitHub)
        catalog/site/files.json            path map for publishing the page with its images

Needs LibreOffice Impress (apt-get install libreoffice-impress) and PyMuPDF (pip install pymupdf).
"""
import argparse
import glob
import json
import os
import shutil
import subprocess
import tempfile

from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(HERE)
CAT = os.path.join(ROOT, 'catalog')
SITE = os.path.join(CAT, 'site')
PREV = os.path.join(SITE, 'previews')


# ------------------------------------------------------------------ rendering
def to_pdf(pptx, outdir):
    shim = glob.glob('/root/.claude/skills/synced/*/pptx/scripts/office/soffice.py')
    if shim:
        cmd = ['python3', shim[0], '--headless', '--convert-to', 'pdf', '--outdir', outdir, pptx]
    else:
        prof = tempfile.mkdtemp(prefix='lo_profile_')
        cmd = ['soffice', f'-env:UserInstallation=file://{prof}', '--headless', '--convert-to', 'pdf',
               '--outdir', outdir, pptx]
    subprocess.run(cmd, check=False, capture_output=True, timeout=900)
    pdf = os.path.join(outdir, os.path.splitext(os.path.basename(pptx))[0] + '.pdf')
    if not os.path.exists(pdf):
        raise SystemExit(f'LibreOffice could not convert {pptx} (is libreoffice-impress installed?)')
    return pdf


def render_previews(t, force=False):
    pptx = os.path.join(ROOT, t['output'])
    out = os.path.join(PREV, t['code'])
    stamp = os.path.join(out, '.source_mtime')
    mtime = str(int(os.path.getmtime(pptx)))
    if not force and os.path.exists(stamp) and open(stamp).read() == mtime:
        return sorted(glob.glob(os.path.join(out, 's[0-9][0-9].jpg')))
    import pymupdf
    shutil.rmtree(out, ignore_errors=True)
    os.makedirs(out)
    tmp = tempfile.mkdtemp()
    doc = pymupdf.open(to_pdf(pptx, tmp))
    thumbs = []
    for i, page in enumerate(doc):
        pix = page.get_pixmap(dpi=120)
        im = Image.frombytes('RGB', (pix.width, pix.height), pix.samples)
        if i == 0:
            c = im.copy()
            c.thumbnail((1280, 720), Image.LANCZOS)
            c.save(os.path.join(out, 'cover.jpg'), quality=84, optimize=True, progressive=True)
        im.thumbnail((640, 360), Image.LANCZOS)
        p = os.path.join(out, f's{i + 1:02d}.jpg')
        im.save(p, quality=80, optimize=True, progressive=True)
        thumbs.append(p)
    # contact sheet for CATALOG.md
    cols, w, h, g = 6, 320, 180, 8
    rows = (len(thumbs) + cols - 1) // cols
    sheet = Image.new('RGB', (cols * (w + g) + g, rows * (h + g) + g), (24, 26, 32))
    for k, p in enumerate(thumbs):
        im = Image.open(p).resize((w, h), Image.LANCZOS)
        sheet.paste(im, (g + (k % cols) * (w + g), g + (k // cols) * (h + g)))
    sheet.save(os.path.join(out, 'sheet.jpg'), quality=80, optimize=True)
    open(stamp, 'w').write(mtime)
    shutil.rmtree(tmp, ignore_errors=True)
    return thumbs


# ------------------------------------------------------------------ catalog files
def call_phrase(t):
    return f'Dùng mẫu {t["code"]} · {t["name"]} để làm bộ slide từ tài liệu tôi gửi kèm.'


def build_data(cfg, force=False):
    items = []
    by_code = {t['code']: t for t in cfg['templates']}
    for t in cfg['templates']:
        d = dict(t)
        if d.get('layouts', '').__class__ is str and str(d.get('layouts', '')).startswith('same_as:'):
            d['layouts'] = by_code[d['layouts'].split(':')[1]]['layouts']
            d['same_as'] = t['layouts'].split(':')[1]
        if t.get('status') == 'ready' and os.path.exists(os.path.join(ROOT, t['output'])):
            thumbs = render_previews(t, force)
            d['slides'] = [os.path.relpath(p, SITE) for p in thumbs]
            d['cover'] = os.path.relpath(os.path.join(PREV, t['code'], 'cover.jpg'), SITE)
            d['size_mb'] = round(os.path.getsize(os.path.join(ROOT, t['output'])) / 1e6, 1)
            d['download'] = (f'https://github.com/{cfg["repo"]}/raw/{cfg["branch"]}/slides-template/{t["output"]}')
            d['call'] = call_phrase(t)
        else:
            d['status'] = 'planned'
            d['call'] = f'Làm mẫu {t["code"]} · {t["name"]} theo {t.get("inspired_by", "video mẫu")}.'
        items.append(d)
    return items


def write_markdown(cfg, items):
    L = [f'# {cfg["library"]}', '',
         'Danh sách mẫu slide. Trang thư viện có ảnh xem trước: '
         + (f'[{cfg["catalog_url"]}]({cfg["catalog_url"]})' if cfg.get('catalog_url') else '`catalog/site/index.html`'),
         '', '**Cách gọi mẫu:** trong phiên Claude Code của kho này, gõ câu gọi bên dưới và đính kèm tài liệu (Word, PDF, '
         'PowerPoint, ghi chú…). Claude sẽ dàn nội dung vào mẫu và trả về file `.pptx` có hiệu ứng.', '',
         '| Mã | Tên mẫu | Phong cách | Phù hợp cho | Trạng thái |', '|---|---|---|---|---|']
    for d in items:
        st = f'{len(d["slides"])} slide' if d.get('slides') else 'Sắp làm'
        L.append(f'| **{d["code"]}** | {d["name"]} | {d.get("tagline", "")} | {"; ".join(d.get("best_for", d.get("category", [])))} | {st} |')
    for d in items:
        L += ['', f'## {d["code"]} · {d["name"]}', '', d.get('tagline', ''), '']
        if d.get('slides'):
            L += [f'![{d["name"]}](site/previews/{d["code"]}/sheet.jpg)', '',
                  f'- **Câu gọi:** `{d["call"]}`',
                  f'- **Gọi tắt:** {", ".join(d.get("aliases", []))}',
                  f'- **Bảng màu:** ' + ', '.join(f'`#{h}` {n}' for h, n in d.get('palette', [])),
                  f'- **Font:** {d.get("fonts", "")}',
                  f'- **File mẫu:** `slides-template/{d["output"]}` ({d["size_mb"]} MB)',
                  f'- **Dựng:** `{d["builder"]} --content <file.json> --name <Ten-file>` — nội dung mẫu: `{d["sample"]}`',
                  f'- **Lấy cảm hứng từ:** {d.get("inspired_by", "")}']
            if d.get('same_as'):
                L.append(f'- **Các dạng slide:** giống {d["same_as"]}')
            else:
                L.append('- **Các dạng slide** (`"slide"` trong file nội dung): '
                         + ', '.join(f'`{k}` {v}' for k, v in d['layouts']))
        else:
            L += [f'- **Trạng thái:** sắp làm — {d.get("inspired_by", "")}', f'- **Câu gọi để làm:** `{d["call"]}`']
    open(os.path.join(CAT, 'CATALOG.md'), 'w', encoding='utf-8').write('\n'.join(L) + '\n')


def write_site(cfg, items):
    tpl = open(os.path.join(CAT, 'site_template.html'), encoding='utf-8').read()
    data = dict(library=cfg['library'], repo=cfg['repo'], branch=cfg['branch'], templates=items)
    html = tpl.replace('/*__DATA__*/null', json.dumps(data, ensure_ascii=False))
    open(os.path.join(SITE, 'index.html'), 'w', encoding='utf-8').write(html)
    files = {}
    for d in items:
        for p in d.get('slides', []) + ([d['cover']] if d.get('cover') else []):
            files[p] = os.path.join(SITE, p)
    json.dump(files, open(os.path.join(SITE, 'files.json'), 'w'), indent=1)
    return files


if __name__ == '__main__':
    ap = argparse.ArgumentParser()
    ap.add_argument('--force', action='store_true')
    a = ap.parse_args()
    cfg = json.load(open(os.path.join(CAT, 'templates.json'), encoding='utf-8'))
    os.makedirs(PREV, exist_ok=True)
    items = build_data(cfg, a.force)
    write_markdown(cfg, items)
    files = write_site(cfg, items)
    ready = [d['code'] for d in items if d['status'] == 'ready']
    print(f'{len(ready)} ready ({", ".join(ready)}), {len(items) - len(ready)} planned; '
          f'{len(files)} preview files; wrote catalog/CATALOG.md and catalog/site/index.html')
