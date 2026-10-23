import json, re, subprocess, zipfile, shutil, os, sys
from xml.sax.saxutils import escape

BASE = "base.docx"
OUT = sys.argv[1] if len(sys.argv) > 1 else "final.docx"
headings = json.load(open("headings.json", encoding="utf-8"))

def toc_xml(pages):
    paras = []
    n = len(headings)
    for i, h in enumerate(headings):
        style = "TOC1" if h["level"] == 1 else "TOC2"
        pg = str(pages.get(h["id"], 0))
        runs = ""
        if i == 0:
            runs += '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
            runs += '<w:r><w:instrText xml:space="preserve"> TOC \\o "1-2" \\h \\z \\u </w:instrText></w:r>'
            runs += '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
        runs += (
            f'<w:hyperlink w:anchor="{h["id"]}" w:history="1">'
            f'<w:r><w:t xml:space="preserve">{escape(h["text"])}</w:t></w:r>'
            '<w:r><w:tab/></w:r>'
            '<w:r><w:fldChar w:fldCharType="begin"/></w:r>'
            f'<w:r><w:instrText xml:space="preserve"> PAGEREF {h["id"]} \\h </w:instrText></w:r>'
            '<w:r><w:fldChar w:fldCharType="separate"/></w:r>'
            f'<w:r><w:t>{pg}</w:t></w:r>'
            '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
            '</w:hyperlink>'
        )
        if i == n - 1:
            runs += '<w:r><w:fldChar w:fldCharType="end"/></w:r>'
        paras.append(f'<w:p><w:pPr><w:pStyle w:val="{style}"/></w:pPr>{runs}</w:p>')
    return "".join(paras)

def inject(pages, out):
    zin = zipfile.ZipFile(BASE)
    zout = zipfile.ZipFile(out, "w", zipfile.ZIP_DEFLATED)
    for item in zin.infolist():
        data = zin.read(item.filename)
        if item.filename == "word/document.xml":
            xml = data.decode("utf-8")
            m = re.search(r"<w:p>(?:(?!</w:p>).)*?@@TOC@@.*?</w:p>", xml, re.S)
            assert m, "placeholder not found"
            xml = xml[:m.start()] + toc_xml(pages) + xml[m.end():]
            data = xml.encode("utf-8")
        zout.writestr(item, data)
    zout.close()

def to_pdf(docx):
    subprocess.run(["soffice", "--headless", "--convert-to", "pdf", "--outdir", "pdf", docx],
                   check=True, stdout=subprocess.DEVNULL, stderr=subprocess.DEVNULL)
    return os.path.join("pdf", os.path.splitext(os.path.basename(docx))[0] + ".pdf")

def norm(s):
    return re.sub(r"\s+", " ", s).strip().lower()

def measure(pdf):
    info = subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout
    total = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    texts = []
    for pg in range(1, total + 1):
        t = subprocess.run(["pdftotext", "-f", str(pg), "-l", str(pg), pdf, "-"], capture_output=True, text=True).stdout
        texts.append(norm(t))
    pages, cur = {}, 3  # bìa = 1, mục lục = 2 (có thể dài hơn; bắt đầu tìm từ trang 3)
    # tìm trang cuối của mục lục: trang đầu tiên không chứa nhiều dòng dẫn
    for h in headings:
        key = norm(h["text"])[:34]
        found = None
        for pg in range(cur, total + 1):
            if key in texts[pg - 1]:
                found = pg
                break
        if found is None:
            print("KHÔNG TÌM THẤY:", h["text"])
            found = cur
        pages[h["id"]] = found
        cur = found
    return pages, total

if __name__ == "__main__":
    os.makedirs("pdf", exist_ok=True)
    inject({}, "tmp0.docx")
    pdf0 = to_pdf("tmp0.docx")
    # xác định số trang của mục lục: tìm trang đầu tiên chứa "PHẦN 1." dạng tiêu đề thật (không phải dòng mục lục)
    info = subprocess.run(["pdfinfo", pdf0], capture_output=True, text=True).stdout
    total0 = int(re.search(r"Pages:\s+(\d+)", info).group(1))
    # trang bắt đầu nội dung = trang đầu tiên (>=2) có tiêu đề PHẦN 1 mà KHÔNG chứa "mục lục"
    start = 3
    for pg in range(2, total0 + 1):
        t = norm(subprocess.run(["pdftotext", "-f", str(pg), "-l", str(pg), pdf0, "-"], capture_output=True, text=True).stdout)
        if "phần 1. tóm tắt điều hành" in t and "mục lục" not in t:
            start = pg
            break
    print("nội dung bắt đầu ở trang", start)
    # đo với bắt đầu từ trang 'start'
    import types
    def measure_from(pdf, start):
        total = int(re.search(r"Pages:\s+(\d+)", subprocess.run(["pdfinfo", pdf], capture_output=True, text=True).stdout).group(1))
        texts = [norm(subprocess.run(["pdftotext", "-f", str(pg), "-l", str(pg), pdf, "-"], capture_output=True, text=True).stdout) for pg in range(1, total + 1)]
        pages, cur = {}, start
        for h in headings:
            key = norm(h["text"])[:34]
            found = next((pg for pg in range(cur, total + 1) if key in texts[pg - 1]), None)
            if found is None:
                print("KHÔNG TÌM THẤY:", h["text"]); found = cur
            pages[h["id"]] = found; cur = found
        return pages, total
    pages, total = measure_from(pdf0, start)
    inject(pages, OUT)
    # kiểm tra lại: dựng PDF từ bản cuối, đo lại, so sánh
    pdf1 = to_pdf(OUT)
    pages2, total2 = measure_from(pdf1, start)
    diff = {k: (pages[k], pages2[k]) for k in pages if pages[k] != pages2[k]}
    print("tổng số trang:", total2, "| lệch số trang mục lục:", diff)
    json.dump(pages2, open("pages.json", "w"))
    if diff:
        inject(pages2, OUT)
        print("đã chỉnh lại theo lần đo thứ hai")
