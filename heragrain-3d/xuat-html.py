"""Đóng gói sơ đồ thành một file HTML duy nhất để gửi đi: nhúng dữ liệu, phần dựng cảnh và
thư viện three.js r128 (thư mục thu-vien), mở được bằng trình duyệt kể cả khi không có mạng.
Chạy: python3 xuat-html.py  ->  ban-gui/Nha-may-Heragrain-3D.html"""
import pathlib

GOC = pathlib.Path(__file__).resolve().parent
RA = GOC / 'ban-gui' / 'Nha-may-Heragrain-3D.html'

# thẻ script trong index.html -> file nhúng vào
NHUNG = {
    '<script src="https://cdnjs.cloudflare.com/ajax/libs/three.js/r128/three.min.js"></script>': 'thu-vien/three.r128.min.js',
    '<script src="https://cdn.jsdelivr.net/npm/three@0.128.0/examples/js/controls/OrbitControls.js"></script>': 'thu-vien/OrbitControls.r128.js',
    '<script src="du-lieu.js"></script>': 'du-lieu.js',
    '<script src="nha-may.js"></script>': 'nha-may.js',
}


def main():
    trang = (GOC / 'index.html').read_text(encoding='utf-8')
    for the, ten in NHUNG.items():
        if trang.count(the) != 1:
            raise SystemExit(f'Không thấy đúng một thẻ: {the}')
        ma = (GOC / ten).read_text(encoding='utf-8')
        if '</script' in ma.lower():
            raise SystemExit(f'{ten} chứa "</script", không nhúng được')
        trang = trang.replace(the, f'<script>\n{ma}\n</script>')
    # index.html là mã nguồn trang Artifact (không có khung tài liệu); thêm khung để mở trực tiếp
    html = ('<!doctype html>\n<html lang="vi">\n<head>\n<meta charset="utf-8">\n'
            '<meta name="viewport" content="width=device-width,initial-scale=1">\n</head>\n<body>\n'
            + trang.replace('<meta charset="utf-8">\n', '', 1) + '\n</body>\n</html>\n')
    RA.parent.mkdir(exist_ok=True)
    RA.write_text(html, encoding='utf-8')
    print(f'{RA} ({RA.stat().st_size / 1024:.0f} KB)')


if __name__ == '__main__':
    main()
