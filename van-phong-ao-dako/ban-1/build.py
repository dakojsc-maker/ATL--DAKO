#!/usr/bin/env python3
"""Ghép src/ thành một file HTML duy nhất để đăng lên claude.ai (Artifact).

Chạy:  python3 van-phong-ao-dako/build.py
Ra:    van-phong-ao-dako/van-phong-ao-dako.html
"""
import base64
import json
import pathlib

HERE = pathlib.Path(__file__).resolve().parent
SRC = HERE / "src"


def main():
    page = (SRC / "page.html").read_text(encoding="utf-8")
    roster = json.loads((HERE / "nhan-su.json").read_text(encoding="utf-8"))
    logo = "data:image/webp;base64," + base64.b64encode((SRC / "logo.webp").read_bytes()).decode()
    parts = {
        "/*__STYLES__*/": (SRC / "styles.css").read_text(encoding="utf-8"),
        "/*__ROSTER__*/": json.dumps(roster, ensure_ascii=False, separators=(",", ":")),
        "/*__SCENE__*/": (SRC / "scene.js").read_text(encoding="utf-8"),
        "/*__APP__*/": (SRC / "app.js").read_text(encoding="utf-8"),
        "__LOGO__": logo,
    }
    for key, value in parts.items():
        if key not in page:
            raise SystemExit(f"Thiếu chỗ chèn {key} trong page.html")
        page = page.replace(key, value)
    out = HERE / "van-phong-ao-dako.html"
    out.write_text(page, encoding="utf-8")
    print(f"{out.relative_to(HERE.parent)}: {len(page.encode()) // 1024} KB")


if __name__ == "__main__":
    main()
