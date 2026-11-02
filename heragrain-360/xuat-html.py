"""Đóng gói tham quan 360° thành một file HTML duy nhất để gửi đi: nhúng dữ liệu nhà máy (../heragrain-3d/du-lieu.js),
điểm đứng, phần dựng cảnh, trình xem và thư viện three.js r128, mở được bằng trình duyệt kể cả khi không có mạng.
Chạy: python3 xuat-html.py  ->  ban-gui/Nha-may-Heragrain-360.html"""
import pathlib

GOC = pathlib.Path(__file__).resolve().parent
RA = GOC / 'ban-gui' / 'Nha-may-Heragrain-360.html'

NHUNG = {
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>': GOC.parent / 'heragrain-3d' / 'thu-vien' / 'three.r128.min.js',
    '<script src="du-lieu.js"></script>': GOC.parent / 'heragrain-3d' / 'du-lieu.js',
    '<script src="diem-360.js"></script>': GOC / 'diem-360.js',
    '<script src="the-gioi-360.js"></script>': GOC / 'the-gioi-360.js',
    '<script src="tham-quan.js"></script>': GOC / 'tham-quan.js',
}


def main():
    trang = (GOC / 'index.html').read_text(encoding='utf-8')
    for the, tep in NHUNG.items():
        if trang.count(the) != 1:
            raise SystemExit(f'Không thấy đúng một thẻ: {the}')
        ma = tep.read_text(encoding='utf-8')
        if '</script' in ma.lower():
            raise SystemExit(f'{tep.name} chứa "</script", không nhúng được')
        trang = trang.replace(the, f'<script>\n{ma}\n</script>')
    # index.html là mã nguồn trang Artifact (không có khung tài liệu); thêm khung để mở trực tiếp
    html = ('<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">\n'
            # iPhone: "Thêm vào MH chính" thì mở toàn màn hình như một ứng dụng
            '<meta name="apple-mobile-web-app-capable" content="yes">\n<meta name="mobile-web-app-capable" content="yes">\n'
            '<meta name="apple-mobile-web-app-status-bar-style" content="black-translucent">\n'
            '<meta name="apple-mobile-web-app-title" content="Heragrain 360">\n<meta name="theme-color" content="#12301F">\n'
            '</head>\n<body>\n'
            + trang.replace('<meta charset="utf-8">\n', '', 1) + '\n</body>\n</html>\n')
    RA.parent.mkdir(exist_ok=True)
    RA.write_text(html, encoding='utf-8')
    print(f'{RA} ({RA.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
