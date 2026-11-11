#!/usr/bin/env python3
"""Ghép mã nguồn trong src/ thành trang hoàn chỉnh.

Tạo ra:
  1. DAKO_Quan-ly-huan-luyen-ATVSLD.html  – bản chạy độc lập (mở trực tiếp bằng trình duyệt, lưu dữ liệu trên máy).
  2. <thư mục tùy chọn>/artifact.html      – nội dung trang để đăng lên claude.ai (bản dùng chung).

Cách chạy:  python3 build.py [thư_mục_xuất_artifact]
"""
import base64
import pathlib
import re
import sys

ROOT = pathlib.Path(__file__).resolve().parent
SRC = ROOT / "src"
JS_ORDER = ["core.js", "store.js", "ui.js", "views.js", "forms.js", "demo.js", "main.js"]

VERSION = re.search(r"APP_VERSION = '([^']+)'", (SRC / "core.js").read_text(encoding="utf-8")).group(1)

css = (SRC / "styles.css").read_text(encoding="utf-8")
js = "\n".join((SRC / name).read_text(encoding="utf-8") for name in JS_ORDER)
logo = "data:image/webp;base64," + base64.b64encode((SRC / "logo.webp").read_bytes()).decode()
if "</script" in js.lower():
    sys.exit("Mã JS chứa chuỗi </script – sẽ làm vỡ trang.")

page = (SRC / "page.html").read_text(encoding="utf-8")
page = page.replace("/*@@CSS@@*/", css).replace("/*@@JS@@*/", js).replace("@@LOGO@@", logo).replace("@@VERSION@@", VERSION)

# Bản độc lập: thêm khung tài liệu giống khung mà claude.ai bọc quanh artifact.
SKELETON_HEAD = (
    '<!doctype html><html lang="vi"><head><meta charset="utf-8">'
    '<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">'
    "<style>:root{color-scheme:light;padding-top:env(safe-area-inset-top,0px);padding-bottom:env(safe-area-inset-bottom,0px)}"
    "body{margin:0;font:14px system-ui,sans-serif}img{max-width:100%}[hidden]{display:none!important}</style>"
    "</head><body>"
)
standalone = SKELETON_HEAD + page + "</body></html>"
out1 = ROOT / "DAKO_Quan-ly-huan-luyen-ATVSLD.html"
out1.write_text(standalone, encoding="utf-8")
print(f"{out1.name}: {out1.stat().st_size / 1024:.0f} KB")

if len(sys.argv) > 1:
    out_dir = pathlib.Path(sys.argv[1])
    out_dir.mkdir(parents=True, exist_ok=True)
    out2 = out_dir / "artifact.html"
    out2.write_text(page, encoding="utf-8")
    print(f"{out2}: {out2.stat().st_size / 1024:.0f} KB")
