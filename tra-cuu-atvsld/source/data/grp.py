import sys, docx, re, collections
from docx.oxml.ns import qn
from docx.table import Table
def find_p4(d):
    body=d.element.body; seen_h=False
    for ch in body.iterchildren():
        if ch.tag==qn('w:p'):
            t=''.join(x.text or '' for x in ch.iter(qn('w:t')))
            if t.startswith('PHẦN 4.') and 'BẢNG TRA NHANH' in t and ch.find('.//'+qn('w:pStyle')) is not None:
                st=ch.find('.//'+qn('w:pStyle')).get(qn('w:val'))
                if st.lower().startswith('heading') or st=='Heading1': seen_h=True
        elif ch.tag==qn('w:tbl') and seen_h:
            tb=Table(ch,d)
            if len(tb.columns)==3 and len(tb.rows)>10: return tb
def marked(cell):
    out=[]
    for p in cell.paragraphs:
        s=''
        for r in p.runs:
            if not r.text: continue
            s+= ('**'+r.text+'**') if r.bold else r.text
        out.append(s)
    return ' / '.join(out)
cnt=collections.Counter()
for n in sys.argv[1:]:
    d=docx.Document(f'../src/{n}.docx'); tb=find_p4(d)
    for r in tb.rows[1:]:
        cs=[]
        for c in r.cells:
            if c._tc not in [x._tc for x in cs]: cs.append(c)
        if len(cs)<3: continue
        cnt[marked(cs[1])]+=1
for k,v in sorted(cnt.items(), key=lambda x:-x[1]): print(v, '|', k)
