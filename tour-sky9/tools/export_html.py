#!/usr/bin/env python3
"""Gói cả tour vào MỘT file HTML (ảnh, CSS, JS nhúng sẵn) để mở trực tiếp bằng trình duyệt,
không cần máy chủ:  python3 tools/export_html.py  ->  Tour-360-CT1-11.10-Sky9.html

Chạy tools/build.py trước để data.js và images/ là bản mới nhất.
"""
import base64
import json
import re
from pathlib import Path

ROOT = Path(__file__).resolve().parent.parent
OUT = ROOT / "Tour-360-CT1-11.10-Sky9.html"


def read(rel):
    return (ROOT / rel).read_text(encoding="utf-8")


def js_safe(code):
    # không để chuỗi "</script" kết thúc thẻ script sớm
    return re.sub(r"</(script)", r"<\\/\1", code, flags=re.I)


def main():
    data_js = read("data.js")
    tour = json.loads(data_js.split("window.TOUR = ", 1)[1].rstrip().rstrip(";"))
    paths = {tour["minimap"], tour["keyPlan"], tour["model"]["floor"]}
    for s in tour["scenes"]:
        if s.get("pannellum"):
            paths.add(s["pannellum"]["panorama"])
        paths.add(s["thumb"])
    images = {p: base64.b64encode((ROOT / p).read_bytes()).decode("ascii") for p in sorted(paths)}

    # đổi ảnh nhúng sang blob: URL lúc chạy (Pannellum đọc ảnh bằng XHR, blob: chạy được cả khi mở file://)
    resolver = """(function () {
  var IMG = window.TOUR_IMAGES, cache = {};
  function url(p) {
    if (!IMG[p]) return p;
    if (!cache[p]) {
      var bin = atob(IMG[p]), buf = new Uint8Array(bin.length);
      for (var i = 0; i < bin.length; i++) buf[i] = bin.charCodeAt(i);
      cache[p] = URL.createObjectURL(new Blob([buf], { type: 'image/jpeg' }));
    }
    return cache[p];
  }
  var T = window.TOUR;
  T.minimap = url(T.minimap); T.keyPlan = url(T.keyPlan); T.model.floor = url(T.model.floor);
  T.scenes.forEach(function (s) { if (s.pannellum) s.pannellum.panorama = url(s.pannellum.panorama); s.thumb = url(s.thumb); });
})();"""

    html = read("index.html")
    head, body = html.split("<body>", 1)
    head = head.replace('<link rel="stylesheet" href="vendor/pannellum/pannellum.css">',
                        "<style>\n" + read("vendor/pannellum/pannellum.css") + "\n</style>")
    head = head.replace('<link rel="stylesheet" href="tour.css">', "<style>\n" + read("tour.css") + "</style>")
    scripts = [
        read("vendor/pannellum/pannellum.js"),
        read("vendor/three/three.min.js"),
        data_js,
        "window.TOUR_IMAGES = " + json.dumps(images) + ";",
        resolver,
        read("stage3d.js"),
        read("tour.js"),
    ]
    inline = "\n".join("<script>\n" + js_safe(s) + "\n</script>" for s in scripts)
    body = re.sub(r'<script src="vendor/pannellum/pannellum.js"></script>.*?<script src="tour.js"></script>',
                  lambda m: inline, body, flags=re.S)
    assert "src=\"tour.js\"" not in body, "không thay được thẻ script"
    OUT.write_text(head + "<body>" + body, encoding="utf-8")
    print(f"{OUT.name}: {OUT.stat().st_size / 1e6:.1f} MB, {len(images)} ảnh nhúng")


if __name__ == "__main__":
    main()
