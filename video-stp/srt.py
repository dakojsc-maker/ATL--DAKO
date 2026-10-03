"""Sinh phụ đề .srt từ mốc lời đọc (info.json) và nội dung phụ đề (vo.json).
python3 srt.py build/info.json vo.json > build/thuyet-minh.srt"""
import json
import re
import sys

info, vo = json.load(open(sys.argv[1])), json.load(open(sys.argv[2]))
beats = {b["id"]: b for v in vo["scenes"].values() for b in v}
fmt = lambda t: f"{int(t // 3600):02d}:{int(t % 3600 // 60):02d}:{int(t % 60):02d},{int(round((t % 1) * 1000)) % 1000:03d}"


def chunks(s, n=84):  # tách câu dài thành đoạn ≤ n ký tự, ưu tiên ngắt sau dấu câu
    parts, cur = [], ""
    for p in re.split(r"(?<=[,:;–])\s+", s):
        if cur and len(cur) + 1 + len(p) > n:
            parts.append(cur); cur = p
        else:
            cur = f"{cur} {p}".strip()
    if cur:
        parts.append(cur)
    return parts


k = 0
for m in sorted((m for m in info["marks"] if m["type"] == "vo"), key=lambda m: m["t"]):
    b = beats[m["id"]]
    ps = chunks(b["sub"])
    total = sum(len(p) for p in ps)
    t = m["t"]
    for p in ps:
        d = b["dur"] * len(p) / total
        k += 1
        print(f"{k}\n{fmt(t)} --> {fmt(t + d)}\n{p}\n")
        t += d
