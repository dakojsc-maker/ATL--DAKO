import sys, docx
from docx.document import Document
from docx.oxml.ns import qn
from docx.table import Table
from docx.text.paragraph import Paragraph

def iter_block(doc):
    body = doc.element.body
    for ch in body.iterchildren():
        if ch.tag == qn('w:p'): yield Paragraph(ch, doc)
        elif ch.tag == qn('w:tbl'): yield Table(ch, doc)

def cell_text(c):
    return ' / '.join(p.text.strip() for p in c.paragraphs if p.text.strip())

def dump(path, out):
    d = docx.Document(path)
    with open(out,'w',encoding='utf-8') as f:
        ti = 0
        for b in iter_block(d):
            if isinstance(b, Paragraph):
                t = b.text.strip()
                if not t: continue
                st = b.style.name if b.style is not None else ''
                f.write(f'[P:{st}] {t}\n')
            else:
                ti += 1
                f.write(f'[TABLE {ti}] rows={len(b.rows)} cols={len(b.columns)}\n')
                for r in b.rows:
                    seen=[]; cells=[]
                    for c in r.cells:
                        if c._tc in seen: continue
                        seen.append(c._tc); cells.append(cell_text(c))
                    f.write('  | ' + ' | '.join(cells) + '\n')
                f.write('[/TABLE]\n')
if __name__=='__main__':
    dump(sys.argv[1], sys.argv[2])
