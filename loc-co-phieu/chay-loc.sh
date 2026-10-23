#!/usr/bin/env bash
# Quét cổ phiếu mẫu DRI/MSR rồi mở báo cáo HTML. Thêm tuỳ chọn phía sau, ví dụ: ./chay-loc.sh --von 500
cd "$(dirname "$0")" || exit 1
OPTS=()
[ -f danh-muc.txt ] && OPTS+=(--danh-muc danh-muc.txt)
python3 loc_co_phieu.py "${OPTS[@]}" "$@"
BC="ket-qua/moi-nhat.html"
if [ -f "$BC" ]; then
  if command -v open >/dev/null 2>&1; then open "$BC"; elif command -v xdg-open >/dev/null 2>&1; then xdg-open "$BC"; fi
fi
