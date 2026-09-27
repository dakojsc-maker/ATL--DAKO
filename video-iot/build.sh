#!/usr/bin/env bash
# Dựng video hoàn chỉnh: khung hình → nhạc → ghép → bản 1080p và 720p.
set -euo pipefail
cd "$(dirname "$0")"
OUT=build
NAME=STP_BOM-IoT_Nong-nghiep-thong-minh
FFMPEG=${FFMPEG:-ffmpeg}
PORT=8124
mkdir -p "$OUT"

python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER' EXIT
sleep 1

export URL="http://127.0.0.1:$PORT/index.html"
node render.js info "$OUT/info.json"
DUR=$(python3 -c "import json;print(json.load(open('$OUT/info.json'))['duration'])")

# 4 luồng render song song
python3 - "$DUR" > "$OUT/ranges.txt" <<'EOF'
import sys
d = float(sys.argv[1]); n = 4; step = round(d / n)
cuts = [0] + [step * i for i in range(1, n)] + [d]
for a, b in zip(cuts[:-1], cuts[1:]):
    print(a, b)
EOF
i=0; pids=()
while read -r a b; do
  i=$((i+1))
  node render.js video "$OUT/part$i.mp4" "$a" "$b" > "$OUT/part$i.log" 2>&1 &
  pids+=($!)
done < "$OUT/ranges.txt"
for p in "${pids[@]}"; do wait "$p"; done
: > "$OUT/parts.txt"
for f in "$OUT"/part*.mp4; do echo "file '$(basename "$f")'" >> "$OUT/parts.txt"; done
$FFMPEG -y -loglevel error -f concat -safe 0 -i "$OUT/parts.txt" -c copy "$OUT/video_master.mp4"

python3 synth.py "$OUT/info.json" "$OUT/music.wav"

$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -i "$OUT/music.wav" \
  -c:v libx264 -preset slow -crf 20 -tune animation -maxrate 6M -bufsize 12M -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart -shortest "$OUT/${NAME}_1080p.mp4"
$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -i "$OUT/music.wav" \
  -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -crf 23 -tune animation -maxrate 2.5M -bufsize 5M -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart -shortest "$OUT/${NAME}_720p.mp4"
ls -la "$OUT"/*.mp4
