#!/usr/bin/env bash
# Dựng video hoàn chỉnh: khung hình → nhạc → ghép → bản 1080p và 720p.
set -euo pipefail
cd "$(dirname "$0")"
OUT=build
NAME=EVN_HRMS-3.0_Quan-ly-nguon-nhan-luc_Nha-may-dien
FFMPEG=${FFMPEG:-ffmpeg}
PORT=8127
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

TRANSPOSE=-1 python3 synth.py "$OUT/info.json" "$OUT/music.wav"

# độ dài chính xác theo số khung hình (không dùng -shortest vì ảnh bìa chỉ có 1 khung)
T=$(python3 -c "import json;d=json.load(open('$OUT/info.json'))['duration'];print(round(d*30)/30)")
# 1080p: mã hoá 2 lượt ~1.25 Mbps để file < 30 MB (gửi qua chat/email), kèm ảnh bìa
$FFMPEG -y -loglevel error -ss 14.5 -i "$OUT/video_master.mp4" -frames:v 1 -q:v 2 "$OUT/cover.jpg"
$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -c:v libx264 -preset slow -tune animation -b:v 1250k \
  -maxrate 3500k -bufsize 7000k -pix_fmt yuv420p -pass 1 -passlogfile "$OUT/p2" -an -f mp4 /dev/null
$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -i "$OUT/music.wav" -i "$OUT/cover.jpg" -map 0:v -map 1:a -map 2:v \
  -c:v:0 libx264 -preset slow -tune animation -b:v:0 1250k -maxrate:v:0 3500k -bufsize:v:0 7000k -pix_fmt:v:0 yuv420p \
  -pass:v:0 2 -passlogfile:v:0 "$OUT/p2" -c:v:1 mjpeg -disposition:v:1 attached_pic \
  -c:a aac -b:a 160k -t "$T" -movflags +faststart "$OUT/${NAME}_1080p.mp4"
$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -i "$OUT/music.wav" \
  -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -crf 23 -tune animation -maxrate 2.5M -bufsize 5M -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart -shortest "$OUT/${NAME}_720p.mp4"
ls -la "$OUT"/*.mp4
