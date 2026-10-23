#!/usr/bin/env bash
# One-time setup for building and previewing the slide templates in a fresh container.
#   bash slides-template/tools/setup_env.sh
set -e
HERE="$(cd "$(dirname "$0")/.." && pwd)"

pip install -q python-pptx pillow numpy pandas lxml defusedxml cairosvg pymupdf onnxruntime opencv-python-headless fonttools

if ! dpkg -s libreoffice-impress >/dev/null 2>&1; then
  (apt-get update -q || true) && apt-get install -y -q libreoffice-impress
fi

mkdir -p ~/.fonts
cp "$HERE"/fonts/*.ttf "$HERE"/fonts/heritage/*.ttf "$HERE"/fonts/maclenin/*.ttf "$HERE"/fonts/laodong/*.ttf ~/.fonts/ 2>/dev/null || true
fc-cache -f >/dev/null

echo "ready: python-pptx, LibreOffice Impress, fonts (Montserrat, Noto Serif Display, Playfair Display, Big Shoulders Display, Be Vietnam Pro, Anton, Lexend)"
