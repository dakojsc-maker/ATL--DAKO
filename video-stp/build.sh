#!/usr/bin/env bash
# Dựng video hoàn chỉnh: thuyết minh → khung hình → nhạc + lời → ghép → một file 1080p dưới 30 MB (kèm phụ đề .srt trong build/).
# Render chia đoạn (render_segments.sh) nên chạy lại được nếu bị ngắt giữa chừng.
# Cần giọng đọc: VOICE_DIR=…/vits-piper-vi_VN-vais1000-medium (xem README). Đặt SKIP_TTS=1 để dùng lại build/vo có sẵn.
set -euo pipefail
cd "$(dirname "$0")"
OUT=build
NAME=Vien-STP_Linh-vuc-dao-tao_Gioi-thieu
FFMPEG=${FFMPEG:-ffmpeg}
PORT=8130
mkdir -p "$OUT"

if [ "${SKIP_TTS:-0}" != "1" ]; then
  python3 tts.py narration.json "$OUT/vo"
  rm -f "$OUT/info.json" "$OUT"/seg_*.mp4   # thời lượng lời đọc đổi → render lại
fi

./render_segments.sh 0
: > "$OUT/parts.txt"
while read -r i a b; do echo "file 'seg_$i.mp4'" >> "$OUT/parts.txt"; done < "$OUT/segs.txt"
$FFMPEG -y -loglevel error -f concat -safe 0 -i "$OUT/parts.txt" -c copy "$OUT/video_master.mp4"

TRANSPOSE=0 DRUMS=0.75 VO_DIR="$OUT/vo" python3 synth.py "$OUT/info.json" "$OUT/music.wav"
python3 srt.py "$OUT/info.json" vo.json > "$OUT/${NAME}.srt"

# Một file duy nhất: 1080p H.264 (xem được ở mọi nơi), mã hoá 2 lượt; bitrate tính theo thời lượng để file
# vừa dưới 30 MB (30.000.000 byte) – nét nhất trong giới hạn này. Tham số x264 chọn theo thử nghiệm VMAF.
T=$(python3 -c "import json;d=json.load(open('$OUT/info.json'))['duration'];print(round(d*30)/30)")
LIMIT=30000000; TARGET=${TARGET_BYTES:-29650000}; AB=96
CT=$(python3 -c "import json;print(next(m['t'] for m in json.load(open('$OUT/info.json'))['marks'] if m.get('id')=='h1b3') - 0.3)")
$FFMPEG -y -loglevel error -ss "$CT" -i "$OUT/video_master.mp4" -frames:v 1 -q:v 4 "$OUT/cover.jpg"
X264="keyint=300:min-keyint=30"   # thử nghiệm VMAF: veryslow + tune animation nét nhất ở cùng dung lượng
F="$OUT/${NAME}_1080p.mp4"
for try in 1 2 3; do
  # video = (dung lượng đích − ảnh bìa − ~1% vỏ MP4) / thời lượng − tiếng
  VB=$(python3 -c "import os;print(int(($TARGET*0.99 - os.path.getsize('$OUT/cover.jpg'))*8/1000/$T - $AB))")
  echo "1080p (lần $try): video ${VB}k + audio ${AB}k"
  $FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -c:v libx264 -preset veryslow -tune animation -x264-params "$X264" -b:v ${VB}k \
    -maxrate 3000k -bufsize 6000k -pix_fmt yuv420p -pass 1 -passlogfile "$OUT/p2" -an -f mp4 /dev/null
  $FFMPEG -y -loglevel error -i "$OUT/video_master.mp4" -i "$OUT/music.wav" -i "$OUT/cover.jpg" -map 0:v -map 1:a -map 2:v \
    -c:v:0 libx264 -preset veryslow -tune animation -x264-params "$X264" -b:v:0 ${VB}k -maxrate:v:0 3000k -bufsize:v:0 6000k -pix_fmt:v:0 yuv420p \
    -pass:v:0 2 -passlogfile:v:0 "$OUT/p2" -c:v:1 mjpeg -disposition:v:1 attached_pic \
    -c:a aac -b:a ${AB}k -t "$T" -movflags +faststart "$F"
  S=$(stat -c %s "$F"); echo "  → $S byte"
  [ "$S" -lt "$LIMIT" ] && break
  TARGET=$(python3 -c "print(int($TARGET*$TARGET/$S*0.995))")   # vượt giới hạn → hạ đích theo tỉ lệ, mã hoá lại
done
ls -la "$F" "$OUT/${NAME}.srt"
