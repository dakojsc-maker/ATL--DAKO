#!/usr/bin/env bash
# Render khung hình theo từng đoạn ngắn (mặc định 10 s), chạy lại được: đoạn nào xong rồi thì bỏ qua.
#   ./render_segments.sh [ngân_sách_giây]   – dừng nhận đợt mới khi sắp hết ngân sách thời gian (0 = không giới hạn)
set -euo pipefail
cd "$(dirname "$0")"
OUT=build; SEG=${SEG:-10}; JOBS=${JOBS:-4}; BUDGET=${1:-0}; PORT=${PORT:-8134}
mkdir -p "$OUT"
python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null' EXIT
sleep 1
export URL="http://127.0.0.1:$PORT/index.html"
[ -f "$OUT/info.json" ] || node render.js info "$OUT/info.json"
python3 - "$OUT/info.json" "$SEG" > "$OUT/segs.txt" <<'PY'
import json, math, sys
d = json.load(open(sys.argv[1]))["duration"]; s = float(sys.argv[2])
for i in range(math.ceil(d / s)):
    print(f"{i:03d}", round(i * s, 3), round(min((i + 1) * s, d), 3))
PY
start=$(date +%s); last=0
mapfile -t todo < <(while read -r i a b; do [ -f "$OUT/seg_$i.mp4" ] || echo "$i $a $b"; done < "$OUT/segs.txt")
echo "còn ${#todo[@]} đoạn"
for ((k = 0; k < ${#todo[@]}; k += JOBS)); do
  now=$(date +%s)
  if [ "$BUDGET" != "0" ] && [ $((now - start + last)) -gt "$BUDGET" ]; then echo "hết ngân sách – chạy lại để tiếp tục"; exit 3; fi
  t0=$(date +%s); pids=()
  for ((j = k; j < k + JOBS && j < ${#todo[@]}; j++)); do
    read -r i a b <<< "${todo[$j]}"
    ( node render.js video "$OUT/seg_$i.part.mp4" "$a" "$b" > "$OUT/seg_$i.log" 2>&1 && mv "$OUT/seg_$i.part.mp4" "$OUT/seg_$i.mp4" ) &
    pids+=($!)
  done
  for p in "${pids[@]}"; do wait "$p" || true; done
  last=$(( $(date +%s) - t0 ))
  echo "xong đợt $((k / JOBS + 1)) (${last}s)"
done
missing=$(while read -r i a b; do [ -f "$OUT/seg_$i.mp4" ] || echo "$i"; done < "$OUT/segs.txt" | wc -l)
echo "còn thiếu: $missing đoạn"
[ "$missing" = "0" ]
