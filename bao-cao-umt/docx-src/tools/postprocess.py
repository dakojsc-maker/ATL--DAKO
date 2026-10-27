# Hậu xử lý DOCX: thêm lineRule="auto", bọc mục lục trong trường TOC
import sys, zipfile, re, shutil, os
src, dst = sys.argv[1], sys.argv[2]
zin = zipfile.ZipFile(src)
items = {n: zin.read(n) for n in zin.namelist()}
zin.close()
def fix_spacing(xml):
    def rep(m):
        tag = m.group(0)
        if 'w:line=' in tag and 'w:lineRule' not in tag:
            tag = tag.replace('w:line=', 'w:lineRule="auto" w:line=', 1)
        return tag
    return re.sub(r'<w:spacing\b[^>]*/>', rep, xml)
doc = items['word/document.xml'].decode('utf-8')
doc = fix_spacing(doc)
# TOC
pb = re.search(r'<w:p>(?:(?!<w:p>).)*?§TOC_BEGIN§.*?</w:p>', doc, flags=re.S)
assert pb, 'no TOC begin'
doc = doc[:pb.start()] + doc[pb.end():]
# chèn begin/separate vào đoạn mục lục đầu tiên (ngay sau vị trí cũ)
m = re.compile(r'<w:p>(<w:pPr>.*?</w:pPr>)', re.S).search(doc, pb.start())
fld = ('<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
       '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r>'
       '<w:r><w:fldChar w:fldCharType="separate"/></w:r>')
doc = doc[:m.end()] + fld + doc[m.end():]
pe = re.search(r'<w:p>(?:(?!<w:p>).)*?§TOC_END§.*?</w:p>', doc, flags=re.S)
assert pe, 'no TOC end'
doc = doc[:pe.start()] + '<w:p><w:pPr><w:spacing w:after="0" w:lineRule="auto" w:line="240"/></w:pPr><w:r><w:fldChar w:fldCharType="end"/></w:r></w:p>' + doc[pe.end():]
items['word/document.xml'] = doc.encode('utf-8')
st = items['word/styles.xml'].decode('utf-8')
ko = len(sys.argv) > 3 and sys.argv[3] == 'ko'
st = st.replace('<w:pPrDefault><w:pPr>', '<w:pPrDefault><w:pPr><w:widowControl/>' + ('<w:wordWrap w:val="0"/>' if ko else ''), 1)
items['word/styles.xml'] = st.encode('utf-8')
for n in list(items):
    if n in ('word/styles.xml',) or n.startswith('word/header') or n.startswith('word/footer'):
        items[n] = fix_spacing(items[n].decode('utf-8')).encode('utf-8')
zout = zipfile.ZipFile(dst, 'w', zipfile.ZIP_DEFLATED)
order = ['[Content_Types].xml'] + [n for n in items if n != '[Content_Types].xml']
for n in order:
    zout.writestr(n, items[n])
zout.close()
print('postprocessed', dst)
