#!/bin/bash
# bash tools/pipeline.sh <thư mục docx-src> <tên tệp>   (DOC_LANG=ko cho bản tiếng Hàn)
set -e
WK=$1; NAME=$2; LANG_=${DOC_LANG:-vi}; SFX=""; [ "$LANG_" = "ko" ] && SFX="_ko"
mkdir -p $WK/out
cd $WK/tools
DOC_LANG=$LANG_ node build_docx.js $WK $WK/out/raw$SFX.docx
python3 postprocess.py $WK/out/raw$SFX.docx $WK/out/$NAME.docx $LANG_
cd $WK/out && rm -f $NAME.pdf && timeout 400 soffice --headless --convert-to pdf $NAME.docx >/dev/null 2>&1
python3 $WK/tools/findpages.py $WK/out/$NAME.pdf $WK/tools/toc_entries$SFX.json $WK/tools/toc_found$SFX.json
