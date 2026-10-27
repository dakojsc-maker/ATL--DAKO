// Dựng báo cáo DOCX từ content.js
// node build_docx.js <WK> <out.docx>
const fs = require('fs');
const path = require('path');
const D = require('docx');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, WidthType,
  AlignmentType, HeadingLevel, BorderStyle, ShadingType, VerticalAlign, Header, Footer,
  PageNumber, TabStopType, LeaderType, LevelFormat,
} = D;

const WK = process.argv[2];
const OUT = process.argv[3];
const refs = JSON.parse(fs.readFileSync(path.join(WK, 'tools/refs.json'), 'utf8'));
const imgsz = JSON.parse(fs.readFileSync(path.join(WK, 'tools/imgsizes.json'), 'utf8'));
const tocPagesFile = path.join(WK, 'tools/toc_pages.json');
const tocPages = fs.existsSync(tocPagesFile) ? JSON.parse(fs.readFileSync(tocPagesFile, 'utf8')) : {};
const blocks = require(path.join(WK, 'tools/content.js'));

// ---------- hằng số trình bày ----------
const TW = 9071;               // bề rộng vùng chữ (twip) = 16,0 cm
const PX_CM = 96 / 2.54;       // px trên cm (docx-js tính ảnh theo 96 dpi)
const FONT = 'Times New Roman';
const NAVY = '0F2A4D', ACCENT = '1E5AA8', INK = '0D1B2E', INK2 = '435066', MUTED = '6A7487';
const RULE = 'B7C1D0', TINT = 'EAF1FB', ZEBRA = 'F5F7FA';
const CHIP = { good: '006300', warn: '8A5A00', bad: 'B42318', info: ACCENT };
const BODY = 26, SMALL = 22, CAP = 24;  // nửa điểm: 13pt, 11pt, 12pt

// ---------- đánh số hình, bảng, trích dẫn ----------
let chap = '0', nFig = 0, nTab = 0;
const figMap = {}, tabMap = {};
for (const b of blocks) {
  if (b.t === 'h1' && b.n !== undefined) { chap = String(b.n); nFig = 0; nTab = 0; }
  if (b.t === 'fig' || b.t === 'grid') { nFig++; b.num = `${chap}.${nFig}`; if (b.key) figMap[b.key] = b.num; }
  if (b.t === 'table') { nTab++; b.num = `${chap}.${nTab}`; if (b.key) tabMap[b.key] = b.num; }
}
const citeOrder = [];
const citeNum = {};
function cite(keys) {
  const nums = keys.map(k => {
    k = k.trim();
    if (!refs[k]) throw new Error('Thiếu nguồn: ' + k);
    if (!citeNum[k]) { citeOrder.push(k); citeNum[k] = citeOrder.length; }
    return citeNum[k];
  });
  nums.sort((a, b) => a - b);
  return '[' + nums.join(', ') + ']';
}

// ---------- phân tích định dạng nội dòng ----------
// **đậm**, *nghiêng*, [[nguồn1, nguồn2]], {fig:key}, {tab:key}
const TOKEN = /(\*\*[^*]+\*\*|\*[^*\s][^*]*\*|\[\[[^\]]+\]\]|\{(?:fig|tab):[A-Za-z0-9_-]+\})/g;
function runs(str, base = {}) {
  const out = [];
  const opts = Object.assign({ font: FONT, size: BODY, color: INK }, base);
  let last = 0;
  str = String(str);
  for (const m of str.matchAll(TOKEN)) {
    if (m.index > last) out.push(new TextRun(Object.assign({}, opts, { text: str.slice(last, m.index) })));
    const tk = m[0];
    if (tk.startsWith('**')) out.push(new TextRun(Object.assign({}, opts, { text: tk.slice(2, -2), bold: true })));
    else if (tk.startsWith('[[')) out.push(new TextRun(Object.assign({}, opts, { text: cite(tk.slice(2, -2).split(',')), color: ACCENT })));
    else if (tk.startsWith('{fig:')) { const k = tk.slice(5, -1); if (!figMap[k]) throw new Error('Thiếu hình ' + k); out.push(new TextRun(Object.assign({}, opts, { text: 'Hình ' + figMap[k] }))); }
    else if (tk.startsWith('{tab:')) { const k = tk.slice(5, -1); if (!tabMap[k]) throw new Error('Thiếu bảng ' + k); out.push(new TextRun(Object.assign({}, opts, { text: 'Bảng ' + tabMap[k] }))); }
    else out.push(new TextRun(Object.assign({}, opts, { text: tk.slice(1, -1), italics: true })));
    last = m.index + tk.length;
  }
  if (last < str.length) out.push(new TextRun(Object.assign({}, opts, { text: str.slice(last) })));
  return out;
}

// ---------- khối cơ bản ----------
const children = [];
const tocEntries = [];
function para(str, o = {}) {
  return new Paragraph({
    alignment: o.align || AlignmentType.JUSTIFIED,
    spacing: { before: o.before || 0, after: o.after === undefined ? 120 : o.after, line: o.line || 300 },
    keepNext: !!o.keepNext,
    indent: o.indent,
    children: runs(str, o.run || {}),
  });
}
function image(file, wcm) {
  const s = imgsz[file];
  if (!s) throw new Error('Thiếu kích thước ảnh ' + file);
  const w = Math.round(wcm * PX_CM);
  const h = Math.round(w * s[1] / s[0]);
  const ext = file.toLowerCase().endsWith('.png') ? 'png' : 'jpg';
  return new ImageRun({ type: ext, data: fs.readFileSync(path.join(WK, file)), transformation: { width: w, height: h } });
}
const NOB = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const NOBORDERS = { top: NOB, bottom: NOB, left: NOB, right: NOB };
function hair(color = RULE, size = 4) { return { style: BorderStyle.SINGLE, size, color }; }

function caption(kind, num, text, o = {}) {
  return new Paragraph({
    alignment: AlignmentType.CENTER,
    spacing: { before: o.before === undefined ? 60 : o.before, after: o.after === undefined ? 40 : o.after, line: 264 },
    keepNext: !!o.keepNext,
    children: [new TextRun({ text: `${kind} ${num}. `, font: FONT, size: CAP, bold: true, color: NAVY }), ...runs(text, { size: CAP, italics: false, color: INK })],
  });
}
function sourceLine(text) {
  return new Paragraph({
    alignment: AlignmentType.LEFT,
    spacing: { before: 20, after: 200, line: 252 },
    children: runs(text, { size: 21, italics: true, color: INK2 }),
  });
}

// ô bảng: chuỗi, mảng chuỗi, hoặc {s, chip, bold, fill, align}
function cellParas(c, o) {
  const al = { l: AlignmentType.LEFT, r: AlignmentType.RIGHT, c: AlignmentType.CENTER, j: AlignmentType.JUSTIFIED }[o.align || 'l'];
  const base = { size: o.size, color: o.color || INK, bold: o.bold };
  const mk = (s, extra = {}) => new Paragraph({ alignment: al, keepNext: !!o.keepNext, spacing: { before: 0, after: 0, line: o.line || 252 }, children: runs(s, Object.assign({}, base, extra)) });
  if (c === null || c === undefined) return [mk('')];
  if (Array.isArray(c)) return c.map(s => (typeof s === 'string' && s.startsWith('• ')) ?
    new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 0, after: 0, line: o.line || 252 }, indent: { left: 200, hanging: 160 }, children: runs('• ' + s.slice(2), base) }) : mk(s));
  if (typeof c === 'object') {
    if (c.chip) {
      return [new Paragraph({ alignment: al, spacing: { before: 0, after: 0, line: o.line || 252 }, children: [
        new TextRun({ text: '● ', font: FONT, size: o.size, color: CHIP[c.chip] }),
        new TextRun({ text: c.s, font: FONT, size: o.size, bold: true, color: CHIP[c.chip] })] })];
    }
    return Array.isArray(c.s) ? c.s.map(s => mk(s, { bold: c.bold })) : [mk(c.s, { bold: c.bold, color: c.color })];
  }
  return [mk(String(c))];
}

function table(b) {
  const widths = b.w.map(x => Math.round(x / b.w.reduce((a, c) => a + c, 0) * TW));
  const diff = TW - widths.reduce((a, c) => a + c, 0); widths[widths.length - 1] += diff;
  const size = b.size || SMALL;
  const aligns = b.align || [];
  const rows = [];
  if (b.head) {
    const heads = Array.isArray(b.head[0]) ? b.head : [b.head];
    heads.forEach(hrow => rows.push(new TableRow({ tableHeader: true, cantSplit: true, children: hrow.map((h, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: NAVY, type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 60, bottom: 60, left: 90, right: 90 },
      verticalAlign: VerticalAlign.CENTER,
      borders: { top: hair(NAVY), bottom: hair(NAVY), left: hair(NAVY), right: hair(NAVY) },
      children: cellParas(h, { size, color: 'FFFFFF', bold: true, align: aligns[i] === 'r' ? 'r' : (aligns[i] === 'c' ? 'c' : 'l') }),
    })) })));
  }
  b.rows.forEach((r, ri) => {
    const isGroup = r.group !== undefined;
    if (isGroup) {
      rows.push(new TableRow({ cantSplit: true, children: [new TableCell({
        columnSpan: widths.length, width: { size: TW, type: WidthType.DXA },
        shading: { fill: TINT, type: ShadingType.CLEAR, color: 'auto' },
        margins: { top: 50, bottom: 50, left: 90, right: 90 },
        borders: { top: hair(), bottom: hair(), left: hair(), right: hair() },
        children: cellParas(r.group, { size, bold: true, color: NAVY }),
      })] }));
      return;
    }
    const cells = r.cells || r;
    const strong = r.strong;
    rows.push(new TableRow({ cantSplit: b.split ? false : true, children: cells.map((c, i) => new TableCell({
      width: { size: widths[i], type: WidthType.DXA },
      shading: { fill: (c && typeof c === 'object' && !Array.isArray(c) && c.fill) || (strong ? 'E3EAF4' : (b.zebra !== false && ri % 2 === 1 ? ZEBRA : 'FFFFFF')), type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 50, bottom: 50, left: 90, right: 90 },
      verticalAlign: VerticalAlign.CENTER,
      borders: { top: hair(), bottom: hair(), left: hair(), right: hair() },
      children: cellParas(c, { size, align: aligns[i] || 'l', bold: strong || (b.boldFirst && i === 0), keepNext: ri === b.rows.length - 1 }),
    })) }));
  });
  return new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: widths, rows });
}

function note(b) {
  const kids = [];
  if (b.title) kids.push(new Paragraph({ spacing: { before: 0, after: 80 }, keepNext: true, children: [new TextRun({ text: b.title, font: FONT, size: 24, bold: true, color: NAVY })] }));
  for (const p of b.p) {
    if (p.startsWith('• ')) kids.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 60, line: 288 }, indent: { left: 300, hanging: 220 }, children: runs('• ' + p.slice(2), { size: 24 }) }));
    else kids.push(new Paragraph({ alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 80, line: 288 }, children: runs(p, { size: 24 }) }));
  }
  const fill = b.kind === 'warn' ? 'FDF3E3' : TINT;
  const edge = b.kind === 'warn' ? 'C98500' : ACCENT;
  return new Table({ width: { size: TW, type: WidthType.DXA }, columnWidths: [TW], rows: [new TableRow({ cantSplit: false, children: [new TableCell({
    width: { size: TW, type: WidthType.DXA }, shading: { fill, type: ShadingType.CLEAR, color: 'auto' },
    margins: { top: 120, bottom: 80, left: 200, right: 200 },
    borders: { top: NOB, bottom: NOB, right: NOB, left: { style: BorderStyle.SINGLE, size: 24, color: edge } },
    children: kids,
  })] })] });
}

function kpis(b) {
  const cols = b.cols || 4;
  const w = Math.floor(TW / cols);
  const rows = [];
  for (let i = 0; i < b.items.length; i += cols) {
    const slice = b.items.slice(i, i + cols);
    while (slice.length < cols) slice.push(null);
    rows.push(new TableRow({ cantSplit: true, children: slice.map(it => new TableCell({
      width: { size: w, type: WidthType.DXA },
      shading: { fill: it ? 'F2F5FA' : 'FFFFFF', type: ShadingType.CLEAR, color: 'auto' },
      margins: { top: 110, bottom: 100, left: 120, right: 100 },
      borders: { top: { style: BorderStyle.SINGLE, size: 18, color: it ? ACCENT : 'FFFFFF' }, bottom: { style: BorderStyle.SINGLE, size: 12, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 12, color: 'FFFFFF' }, right: { style: BorderStyle.SINGLE, size: 12, color: 'FFFFFF' } },
      children: it ? [
        new Paragraph({ spacing: { before: 0, after: 20, line: 240 }, children: [new TextRun({ text: it.v, font: FONT, size: 34, bold: true, color: NAVY })] }),
        new Paragraph({ spacing: { before: 0, after: 0, line: 240 }, children: runs(it.l, { size: 20, color: INK2 }) }),
      ] : [new Paragraph('')],
    })) }));
  }
  return new Table({ width: { size: w * cols, type: WidthType.DXA }, columnWidths: Array(cols).fill(w), rows });
}

function grid(b) {
  const cols = b.cols || 3;
  const colW = Math.floor(TW / cols);
  const imgW = colW / 567 - 0.35; // cm
  const rows = [];
  for (let i = 0; i < b.items.length; i += cols) {
    const slice = b.items.slice(i, i + cols);
    while (slice.length < cols) slice.push(null);
    rows.push(new TableRow({ cantSplit: true, children: slice.map(it => new TableCell({
      width: { size: colW, type: WidthType.DXA }, borders: NOBORDERS,
      margins: { top: 40, bottom: 60, left: 50, right: 50 },
      children: it ? [
        new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 0, after: 30 }, children: [image(it.img, it.w || imgW)] }),
        new Paragraph({ alignment: AlignmentType.CENTER, keepNext: i + cols >= b.items.length, spacing: { before: 0, after: 0, line: 240 }, children: runs(it.label, { size: 20, color: INK2 }) }),
      ] : [new Paragraph('')],
    })) }));
  }
  return new Table({ width: { size: colW * cols, type: WidthType.DXA }, columnWidths: Array(cols).fill(colW), borders: { top: NOB, bottom: NOB, left: NOB, right: NOB, insideHorizontal: NOB, insideVertical: NOB }, rows });
}

// tính trước danh sách mục lục (h1, h2) để dựng mục lục ở đầu tài liệu
const PRE_TOC = [];
for (const b of blocks) {
  if (b.t === 'h1') PRE_TOC.push({ lvl: 1, text: b.n !== undefined && typeof b.n === 'number' ? `${b.n}. ${b.s}` : b.s });
  if (b.t === 'h2') PRE_TOC.push({ lvl: 2, text: b.s });
}

// ---------- duyệt nội dung ----------
let firstH1 = true;
for (const b of blocks) {
  switch (b.t) {
    case 'cover': buildCover(b); break;
    case 'h1': {
      const label = b.n !== undefined ? (typeof b.n === 'number' ? `${b.n}. ${b.s}` : `${b.s}`) : b.s;
      tocEntries.push({ lvl: 1, text: label });
      children.push(new Paragraph({ heading: HeadingLevel.HEADING_1, pageBreakBefore: b.noBreak ? false : true, children: [new TextRun({ text: label })] }));
      firstH1 = false; break;
    }
    case 'h2': tocEntries.push({ lvl: 2, text: b.s }); children.push(new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, children: [new TextRun({ text: b.s })] })); break;
    case 'h3': children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, children: [new TextRun({ text: b.s })] })); break;
    case 'p': children.push(para(b.s, b.o || {})); break;
    case 'ul': for (const it of b.items) children.push(new Paragraph({ numbering: { reference: 'bul', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 80, line: 290 }, children: runs(it) })); break;
    case 'ol': for (const it of b.items) children.push(new Paragraph({ numbering: { reference: b.ref || 'num', level: 0 }, alignment: AlignmentType.JUSTIFIED, spacing: { before: 0, after: 80, line: 290 }, children: runs(it) })); break;
    case 'table':
      children.push(caption('Bảng', b.num, b.cap, { keepNext: true, before: 120, after: 80 }));
      children.push(table(b));
      children.push(sourceLine(b.src || ''));
      break;
    case 'fig':
      children.push(new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 120, after: 40 }, children: [image(b.img, b.w || 16)] }));
      children.push(caption('Hình', b.num, b.cap, { keepNext: true }));
      children.push(sourceLine(b.src || ''));
      break;
    case 'grid':
      children.push(grid(b));
      children.push(caption('Hình', b.num, b.cap, { keepNext: true }));
      children.push(sourceLine(b.src || ''));
      break;
    case 'note': children.push(note(b)); children.push(new Paragraph({ spacing: { before: 0, after: 120 }, children: [] })); break;
    case 'kpi': children.push(kpis(b)); children.push(new Paragraph({ spacing: { before: 0, after: 120 }, children: [] })); break;
    case 'toc': buildToc(); break;
    case 'refs': buildRefs(b); break;
    case 'pb': children.push(new Paragraph({ pageBreakBefore: true, children: [] })); break;
    case 'space': children.push(new Paragraph({ spacing: { before: 0, after: b.after || 120 }, children: [] })); break;
    default: throw new Error('Khối lạ: ' + b.t);
  }
}

function buildCover(b) {
  const P = (text, o) => new Paragraph({ alignment: o.align || AlignmentType.LEFT, spacing: { before: o.before || 0, after: o.after || 0, line: o.line || 276 }, children: [new TextRun({ text, font: FONT, size: o.size, bold: o.bold, color: o.color || INK, allCaps: o.caps, characterSpacing: o.cs })] });
  children.push(new Paragraph({ spacing: { before: 0, after: 0 }, border: { top: { style: BorderStyle.SINGLE, size: 36, color: NAVY, space: 6 } }, children: [] }));
  children.push(P('BÁO CÁO THẨM ĐỊNH SƠ BỘ · DESKTOP DUE DILIGENCE', { size: 22, bold: true, color: ACCENT, before: 120, after: 160, cs: 20 }));
  children.push(P('TRƯỜNG ĐẠI HỌC', { size: 48, bold: true, color: NAVY, line: 252 }));
  children.push(P('QUẢN LÝ VÀ CÔNG NGHỆ', { size: 48, bold: true, color: NAVY, line: 252 }));
  children.push(P('THÀNH PHỐ HỒ CHÍ MINH (UMT)', { size: 48, bold: true, color: NAVY, after: 220, line: 252 }));
  children.push(P('Hồ sơ thông tin phục vụ quyết định đầu tư của nhà đầu tư Hàn Quốc', { size: 28, color: INK, after: 40 }));
  children.push(P('Bản chuẩn hoá theo tài liệu chính thức, kèm hình ảnh minh chứng', { size: 28, color: INK2, after: 240 }));
  children.push(grid({ cols: 3, items: b.photos }));
  children.push(new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 60, after: 280 }, children: runs(b.photoNote, { size: 20, italics: true, color: INK2 }) }));
  children.push(table({ w: [4.2, 11.8], rows: b.meta, size: 22, zebra: false, boldFirst: true }));
  children.push(new Paragraph({ spacing: { before: 280, after: 0 }, children: runs(b.foot, { size: 20, italics: true, color: MUTED }) }));
}

function buildToc() {
  children.push(new Paragraph({ pageBreakBefore: true, alignment: AlignmentType.CENTER, spacing: { before: 0, after: 240 }, children: [new TextRun({ text: 'MỤC LỤC', font: FONT, size: 32, bold: true, color: NAVY })] }));
  children.push(new Paragraph({ children: [new TextRun({ text: '§TOC_BEGIN§', font: FONT, size: 2 })] }));
  // tocEntries chưa có ở thời điểm này nếu duyệt tuần tự → dùng danh sách tính trước
  for (const e of PRE_TOC) {
    const pg = tocPages[e.text] !== undefined ? String(tocPages[e.text]) : '0';
    children.push(new Paragraph({
      style: e.lvl === 1 ? 'TOC1' : 'TOC2',
      tabStops: [{ type: TabStopType.RIGHT, position: TW, leader: LeaderType.DOT }],
      children: [new TextRun({ text: e.text, font: FONT, size: e.lvl === 1 ? 25 : 24, bold: e.lvl === 1, color: e.lvl === 1 ? NAVY : INK }), new TextRun({ text: '\t' + pg, font: FONT, size: e.lvl === 1 ? 25 : 24, bold: e.lvl === 1, color: e.lvl === 1 ? NAVY : INK })],
    }));
  }
  children.push(new Paragraph({ children: [new TextRun({ text: '§TOC_END§', font: FONT, size: 2 })] }));
}

function buildRefs(b) {
  const tiers = { A: 'A — Nguồn chính thức: tài liệu của UMT, cổng thông tin Chính phủ, văn bản pháp luật', B: 'B — Báo chí, dịch vụ thông tin pháp lý', C: 'C — Trang tổng hợp (chỉ dùng đối chiếu)' };
  for (const t of ['A', 'B', 'C']) {
    const ks = citeOrder.filter(k => refs[k].tier === t);
    if (!ks.length) continue;
    children.push(new Paragraph({ heading: HeadingLevel.HEADING_3, keepNext: true, children: [new TextRun({ text: tiers[t] })] }));
    for (const k of ks) {
      const r = refs[k];
      const parts = [new TextRun({ text: `[${citeNum[k]}] `, font: FONT, size: 22, bold: true, color: ACCENT }),
        new TextRun({ text: `${r.pub}. `, font: FONT, size: 22, color: INK }),
        new TextRun({ text: `${r.title}. `, font: FONT, size: 22, italics: true, color: INK }),
        new TextRun({ text: `${r.date}.`, font: FONT, size: 22, color: INK })];
      if (r.url) parts.push(new TextRun({ text: ' ' + r.url, font: FONT, size: 20, color: INK2 }));
      children.push(new Paragraph({ alignment: AlignmentType.LEFT, spacing: { before: 0, after: 80, line: 252 }, indent: { left: 567, hanging: 567 }, children: parts }));
    }
  }
}

// ---------- tài liệu ----------
const header = new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 }, border: { bottom: { style: BorderStyle.SINGLE, size: 4, color: RULE, space: 4 } },
  children: [new TextRun({ text: 'UMT · Báo cáo thẩm định sơ bộ · Bản chuẩn hoá theo tài liệu chính thức · Dữ liệu đến 27/10/2026', font: FONT, size: 19, italics: true, color: MUTED })] })] });
const footer = new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: 0, after: 0 },
  children: [new TextRun({ children: ['Trang ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], font: FONT, size: 21, color: INK2 })] })] });
const empty = () => new Paragraph({ children: [] });

const doc = new Document({
  creator: 'Đơn vị tư vấn', title: 'Báo cáo thẩm định sơ bộ UMT – bản chuẩn hoá', description: 'Hồ sơ UMT cho nhà đầu tư Hàn Quốc',
  styles: {
    default: {
      document: { run: { font: FONT, size: BODY, color: INK }, paragraph: { spacing: { line: 300, after: 120 } } },
      heading1: { run: { font: FONT, size: 34, bold: true, color: NAVY }, paragraph: { spacing: { before: 0, after: 240, line: 276 }, keepNext: true,
        border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: ACCENT, space: 6 } } } },
      heading2: { run: { font: FONT, size: 29, bold: true, color: NAVY }, paragraph: { spacing: { before: 280, after: 120, line: 276 }, keepNext: true } },
      heading3: { run: { font: FONT, size: 27, bold: true, italics: true, color: ACCENT }, paragraph: { spacing: { before: 200, after: 80, line: 276 }, keepNext: true } },
    },
    paragraphStyles: [
      { id: 'TOC1', name: 'toc 1', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 25, bold: true, color: NAVY }, paragraph: { spacing: { before: 100, after: 20, line: 264 } } },
      { id: 'TOC2', name: 'toc 2', basedOn: 'Normal', next: 'Normal', run: { font: FONT, size: 24, color: INK }, paragraph: { spacing: { before: 0, after: 10, line: 264 }, indent: { left: 400 } } },
    ],
  },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 284 } } } }] },
    { reference: 'num', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } } } }] },
    { reference: 'num2', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } } } }] },
    { reference: 'num3', levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 567, hanging: 340 } } } }] },
  ] },
  sections: [{
    properties: {
      titlePage: true,
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 1134, header: 567, footer: 567 } },
    },
    headers: { default: header, first: new Header({ children: [empty()] }) },
    footers: { default: footer, first: new Footer({ children: [empty()] }) },
    children,
  }],
});

Packer.toBuffer(doc).then(buf => {
  fs.writeFileSync(OUT, buf);
  fs.writeFileSync(path.join(WK, 'tools/toc_entries.json'), JSON.stringify(PRE_TOC, null, 1));
  fs.writeFileSync(path.join(WK, 'tools/cite_order.json'), JSON.stringify(citeOrder));
  console.log('OK', OUT, 'nguồn trích dẫn:', citeOrder.length, 'mục lục:', PRE_TOC.length);
});
