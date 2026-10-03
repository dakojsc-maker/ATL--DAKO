#!/usr/bin/env bash
# Dựng video hoàn chỉnh: thuyết minh → khung hình → nhạc + lời → ghép → bản 1080p, 720p (+ bản chỉ nhạc, phụ đề .srt).
# Render chia đoạn (render_segments.sh) nên chạy lại được nếu bị ngắt giữa chừng.
# Cần giọng đọc: VOICE_DIR=…/vits-piper-vi_VN-vais1000-medium (xem README). Đặt SKIP_TTS=1 để dùng lại build/vo có sẵn.
set -euo pipefail
cd "$(dirname "$0")"
OUT=build
NAME=EVNICT_HRMS-3.0_Gioi-thieu_Thuyet-minh
FFMPEG=${FFMPEG:-ffmpeg}
PORT=8129
mkdir -p "$OUT"

if [ "${SKIP_TTS:-0}" != "1" ]; then
  python3 tts.py narration.json "$OUT/vo"
  rm -f "$OUT/info.json" "$OUT"/seg_*.mp4   # thời lượng lời đọc đổi → render lại
fi

./render_segments.sh 0
: > "$OUT/parts.txt"
while read -r i a b; do echo "file 'seg_$i.mp4'" >> "$OUT/parts.txt"; done < "$OUT/segs.txt"
$FFMPEG -y -loglevel error -f concat -safe 0 -i "$OUT/parts.txt" -c copy "$OUT/video_master.mp4"

TRANSPOSE=-1 DRUMS=0.75 VO_DIR="$OUT/vo" NOVO_OUT="$OUT/music_only.wav" python3 synth.py "$OUT/info.json" "$OUT/music.wav"
python3 srt.py "$OUT/info.json" vo.json > "$OUT/${NAME}.srt"

# độ dài chính xác theo số khung hình (không dùng -shortest vì ảnh bìa chỉ có 1 khung)
T=$(python3 -c "import json;d=json.load(open('$OUT/info.json'))['duration'];print(round(d*30)/30)")
# 1080p: mã hoá 2 lượt ~1.05 Mbps để file < 30 MB (gửi qua chat/email), kèm ảnh bìa
$FFMPEG -y -loglevel error -ss 20 -i "$OUT/video_master.mp4" -frames:v 1 -q:v 2 "$OUT/cover.jpg"
$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -c:v libx264 -preset slow -tune animation -b:v 1050k \
  -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -pass 1 -passlogfile "$OUT/p2" -an -f mp4 /dev/null
$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -i "$OUT/music.wav" -i "$OUT/cover.jpg" -map 0:v -map 1:a -map 2:v \
  -c:v:0 libx264 -preset slow -tune animation -b:v:0 1050k -maxrate:v:0 3000k -bufsize:v:0 6000k -pix_fmt:v:0 yuv420p \
  -pass:v:0 2 -passlogfile:v:0 "$OUT/p2" -c:v:1 mjpeg -disposition:v:1 attached_pic \
  -c:a aac -b:a 128k -t "$T" -movflags +faststart "$OUT/${NAME}_1080p.mp4"
$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -i "$OUT/music.wav" \
  -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -crf 23 -tune animation -maxrate 2.5M -bufsize 5M -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart -shortest "$OUT/${NAME}_720p.mp4"
# bản chỉ có nhạc (không lời) – dùng khi muốn lồng giọng đọc khác
$FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -i "$OUT/music_only.wav" \
  -vf scale=1280:720:flags=lanczos -c:v libx264 -preset slow -crf 23 -tune animation -maxrate 2.5M -bufsize 5M -pix_fmt yuv420p \
  -c:a aac -b:a 128k -movflags +faststart -shortest "$OUT/${NAME}_khong-loi_720p.mp4"
ls -la "$OUT"/*.mp4 "$OUT"/*.srt
