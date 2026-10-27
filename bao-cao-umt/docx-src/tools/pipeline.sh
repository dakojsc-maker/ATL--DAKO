#!/bin/bash
set -e
WK=$1; NAME=$2
cd $WK/tools
node build_docx.js $WK $WK/out/raw.docx
python3 postprocess.py $WK/out/raw.docx $WK/out/$NAME.docx
cd $WK/out && rm -f $NAME.pdf && timeout 300 soffice --headless --convert-to pdf $NAME.docx >/dev/null 2>&1
python3 $WK/tools/findpages.py $WK/out/$NAME.pdf $WK/tools/toc_entries.json $WK/tools/toc_found.json
