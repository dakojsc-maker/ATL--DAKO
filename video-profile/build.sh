#!/usr/bin/env bash
# Dựng video profile Viện STP.   ./build.sh 2d   |   ./build.sh 3d
# 2D: HTML + GSAP.  3D: three.js (WebGL, render bằng SwiftShader nếu không có GPU – khá lâu).
set -euo pipefail
cd "$(dirname "$0")"
V=${1:-2d}
OUT=build/$V
FFMPEG=${FFMPEG:-ffmpeg}
PORT=8125
mkdir -p "$OUT"

python3 -m http.server $PORT --bind 127.0.0.1 >/dev/null 2>&1 &
SERVER=$!
trap 'kill $SERVER' EXIT
sleep 1

if [ "$V" = "3d" ]; then
  export URL="http://127.0.0.1:$PORT/3d/index.html?rs=${RS:-0.9}"   # RS: tỉ lệ độ phân giải cảnh 3D
  NAME=Vien-STP_Profile_3D; TRANSPOSE=-4; DRUMS=0.55; JOBS=${JOBS:-3}
else
  export URL="http://127.0.0.1:$PORT/2d/index.html"
  NAME=Vien-STP_Profile_2D; TRANSPOSE=-2; DRUMS=0.9; JOBS=${JOBS:-4}
fi

node render.js info "$OUT/info.json"
DUR=$(python3 -c "import json;print(json.load(open('$OUT/info.json'))['duration'])")
python3 - "$DUR" "$JOBS" > "$OUT/ranges.txt" <<'EOF'
import sys
d, n = float(sys.argv[1]), int(sys.argv[2])
cuts = [round(d * i / n, 1) for i in range(n)] + [d]
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
for f in $(ls "$OUT"/part*.mp4 | sort -V); do echo "file '$(basename "$f")'" >> "$OUT/parts.txt"; done
$FFMPEG -y -loglevel error -f concat -safe 0 -i "$OUT/parts.txt" -c copy "$OUT/master.mp4"

TRANSPOSE=$TRANSPOSE DRUMS=$DRUMS python3 synth.py "$OUT/info.json" "$OUT/music.wav"

$FFMPEG -y -loglevel error -i "$OUT/master.mp4" -i "$OUT/music.wav" -map 0:v -map 1:a -shortest \
  -c:v libx264 -preset slow -crf 19 -maxrate 7M -bufsize 14M -pix_fmt yuv420p \
  -c:a aac -b:a 192k -movflags +faststart "$OUT/${NAME}_1080p.mp4"
$FFMPEG -y -loglevel error -i "$OUT/master.mp4" -i "$OUT/music.wav" -map 0:v -map 1:a -shortest \
  -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -crf 23 -maxrate 2.5M -bufsize 5M -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart "$OUT/${NAME}_720p.mp4"
ls -la "$OUT"/*.mp4
