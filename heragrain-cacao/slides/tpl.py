"""Tìm Kho Mẫu Slide DAKO (slides-template) và chuẩn bị ảnh, hình minh họa ca cao cho các builder trong thư mục này.

Kho mẫu nằm ở nhánh claude/festive-ride-bpliki của kho ATL--DAKO. Lấy về một lần:
    git worktree add ../_tpl origin/claude/festive-ride-bpliki      (từ thư mục gốc kho)
    hoặc đặt biến môi trường SLIDES_TEMPLATE=/đường/dẫn/slides-template
Sau đó cài môi trường: bash <slides-template>/tools/setup_env.sh
"""
import csv
import json
import os
import shutil
import sys

HERE = os.path.dirname(os.path.abspath(__file__))
REPO = os.path.dirname(os.path.dirname(HERE))


def find():
    cands = [os.environ.get('SLIDES_TEMPLATE', ''), os.path.join(REPO, 'slides-template'),
             os.path.join(REPO, '..', '_tpl', 'slides-template'), os.path.join(REPO, '_tpl', 'slides-template')]
    for c in cands:
        if c and os.path.exists(os.path.join(c, 'lib', 'pptkit.py')):
            return os.path.abspath(c)
    raise SystemExit('Không thấy slides-template. Đặt SLIDES_TEMPLATE hoặc chạy: git worktree add _tpl origin/claude/festive-ride-bpliki')


def setup():
    """Chép ảnh ca cao vào assets/images/src của kho mẫu, thêm dòng ghi công tác giả; trả về (đường dẫn kho mẫu, khóa ảnh)."""
    T = find()
    sys.path.insert(0, os.path.join(T, 'lib'))
    anh = os.path.join(HERE, 'anh')
    photos = json.load(open(os.path.join(anh, 'photos.json'), encoding='utf-8'))
    src = os.path.join(T, 'assets', 'images', 'src')
    for iid in photos.values():
        dst = os.path.join(src, iid + '.jpg')
        if not os.path.exists(dst):
            shutil.copy(os.path.join(anh, iid + '.jpg'), dst)
    cred = os.path.join(T, 'assets', 'images', 'credits.csv')
    have = {r['image_id'] for r in csv.DictReader(open(cred, encoding='utf-8'))}
    rows = [r for r in csv.DictReader(open(os.path.join(anh, 'credits.csv'), encoding='utf-8')) if r['image_id'] not in have]
    if rows:
        with open(cred, 'a', newline='', encoding='utf-8') as fo:
            w = csv.writer(fo)
            for r in rows:
                w.writerow([r['image_id'], r['author'], r['title'], r['source'], r['license']])
    import product_assets as A
    import cacao_assets as CA
    CA.install(A)
    tex = os.path.join(T, 'assets', 'images', 'build', 'cacao_tex')
    os.makedirs(tex, exist_ok=True)
    for k in ('nibs', 'bot', 'bo', 'travo'):
        CA.texture(k, os.path.join(tex, f'{k}.jpg'))
    photos.update({f'tex_{k}': os.path.join(tex, f'{k}.jpg') for k in ('nibs', 'bot', 'bo', 'travo')})
    return T, photos
