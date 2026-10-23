const fs = require("fs");
let D;
try { D = require("docx"); } catch (e) { D = require("/home/claude/.npm-global/lib/node_modules/docx"); }
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, ImageRun, Footer,
  AlignmentType, LevelFormat, HeadingLevel, BorderStyle, WidthType, ShadingType,
  VerticalAlign, PageNumber, Bookmark, TabStopType
} = D;

const dims = JSON.parse(fs.readFileSync("dims.json", "utf8"));
const blocks = [...require("./content_a.js"), ...require("./content_b.js")];

const GREEN = "1B5E37", LABEL = "E6F2EA", ALT = "F3F8F4", NOTE = "EAF4EC";
const FONT = "Times New Roman";
const TEXT_W = 9071; // A4, lề trái 3 cm, các lề còn lại 2 cm
const border = { style: BorderStyle.SINGLE, size: 4, color: "A9C4B3" };
const borders = { top: border, bottom: border, left: border, right: border };

// ---------- helpers ----------
function runs(text, base = {}) {
  return String(text).split("**").map((s, i) => (s === "" ? null : new TextRun({ text: s, font: FONT, bold: i % 2 === 1 || base.bold, ...base }))).filter(Boolean);
}
const para = (text, o = {}) => new Paragraph({
  alignment: o.align || AlignmentType.LEFT,
  spacing: { after: o.after ?? 100, before: o.before ?? 0, line: o.line ?? 300 },
  keepNext: o.keepNext, keepLines: o.keepLines, indent: o.indent,
  children: runs(text, o.run || {})
});
let numLists = 0;
const numRefs = [];
const bulletPara = (text, o = {}) => new Paragraph({
  numbering: { reference: "bullets", level: 0 },
  spacing: { after: o.after ?? 60, line: o.line ?? 276 },
  children: runs(text, o.run || {})
});
const headings = [];
let bmCount = 0;
function heading(level, text) {
  const id = "_Toc" + String(100000 + ++bmCount);
  headings.push({ level, text, id });
  return new Paragraph({
    heading: level === 1 ? HeadingLevel.HEADING_1 : HeadingLevel.HEADING_2,
    pageBreakBefore: level === 1,
    keepNext: true,
    children: [new Bookmark({ id, children: [new TextRun({ text, font: FONT })] })]
  });
}

function cellParas(content, o = {}) {
  const items = Array.isArray(content) ? content : [content];
  const asBullets = Array.isArray(content) && content.length > 1;
  return items.map((t) => {
    if (asBullets) {
      return new Paragraph({ numbering: { reference: "bullets", level: 0 }, spacing: { after: 40, line: 252 }, children: runs(t, o.run || {}) });
    }
    return new Paragraph({ spacing: { after: 40, line: 252 }, alignment: o.align || AlignmentType.LEFT, children: runs(t, o.run || {}) });
  });
}

function mkTable(head, rows, widths, opt = {}) {
  const sum = widths.reduce((a, b) => a + b, 0);
  const w = widths.map((x) => Math.round((x * TEXT_W) / sum));
  w[w.length - 1] += TEXT_W - w.reduce((a, b) => a + b, 0);
  const mkCell = (content, i, o) => new TableCell({
    width: { size: w[i], type: WidthType.DXA }, borders,
    verticalAlign: VerticalAlign.TOP,
    shading: o.fill ? { fill: o.fill, type: ShadingType.CLEAR, color: "auto" } : undefined,
    margins: { top: 60, bottom: 60, left: 100, right: 100 },
    children: cellParas(content, { run: o.run, align: o.align })
  });
  const trs = [];
  if (head) {
    trs.push(new TableRow({
      tableHeader: true, cantSplit: true,
      children: head.map((h, i) => mkCell(h, i, { fill: GREEN, run: { bold: true, color: "FFFFFF" }, align: AlignmentType.LEFT }))
    }));
  }
  rows.forEach((r) => {
    trs.push(new TableRow({
      cantSplit: !opt.allowSplit, height: opt.blankRows ? { value: 640, rule: "atLeast" } : undefined,
      children: r.map((c, i) => mkCell(c, i, {
        fill: opt.labelCol && i === 0 ? LABEL : undefined,
        run: (opt.labelCol && i === 0) || (opt.boldCol === i) ? { bold: true } : {}
      }))
    }));
  });
  return new Table({ width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: w, rows: trs });
}

function noteBox(title, lines) {
  const kids = [new Paragraph({ spacing: { after: 60 }, keepNext: true, children: runs(title, { bold: true, color: GREEN }) })];
  lines.forEach((l) => kids.push(new Paragraph({ spacing: { after: 60, line: 276 }, children: runs(l) })));
  const nb = { style: BorderStyle.SINGLE, size: 4, color: "A9C4B3" };
  return new Table({
    width: { size: TEXT_W, type: WidthType.DXA }, columnWidths: [TEXT_W],
    rows: [new TableRow({ cantSplit: true, children: [new TableCell({
      width: { size: TEXT_W, type: WidthType.DXA },
      borders: { top: nb, bottom: nb, right: nb, left: { style: BorderStyle.SINGLE, size: 24, color: GREEN } },
      shading: { fill: NOTE, type: ShadingType.CLEAR, color: "auto" },
      margins: { top: 100, bottom: 100, left: 160, right: 140 }, children: kids
    })] })]
  });
}

let figNo = 0;
function image(file, wcm, cap) {
  const [pw, ph] = dims[file];
  const wpx = Math.round((wcm || 15.0) * 37.795);
  const hpx = Math.round((wpx * ph) / pw);
  const data = fs.readFileSync("../hinh_giao_dien/" + file);
  figNo += 1;
  const label = "Hình 5." + figNo + ". " + cap.replace(/^Hình \d+\.\d+\.\s*/, "");
  return [
    new Paragraph({ alignment: AlignmentType.CENTER, keepNext: true, spacing: { before: 80, after: 40 },
      children: [new ImageRun({ type: "jpg", data, transformation: { width: wpx, height: hpx },
        altText: { title: label, description: label, name: file } })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 140 }, children: runs(label, { italics: true, size: 24 }) })
  ];
}

function featureBlock(f) {
  const out = [heading(2, f.title)];
  out.push(new Paragraph({ keepNext: true, spacing: { after: 80 }, children: runs("Mức ưu tiên cho Hải Minh: " + f.priority, { bold: true, color: GREEN }) }));
  f.imgs.forEach((im) => out.push(...image(im.file, im.wcm, im.cap)));
  const rows = [
    ["Đường dẫn", f.path],
    ["Mục đích", f.purpose],
    ["Chức năng chính", f.funcs],
    ["Lợi ích cho Hải Minh", f.benefit],
    ["Giá trị mang lại", f.value],
    ["Áp dụng cho vị trí", f.users],
    ["Lưu ý khi tư vấn", f.caution]
  ];
  out.push(mkTable(null, rows, [1900, 7171], { labelCol: true, allowSplit: true }));
  out.push(new Paragraph({ spacing: { after: 120 }, children: [] }));
  return out;
}

// ---------- cover + TOC page ----------
const center = (text, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: o.before || 0, after: o.after ?? 120, line: 320 }, children: runs(text, o.run || {}) });
const cover = [
  center("VIỆN NGHIÊN CỨU PHÁT TRIỂN GIÁO DỤC VÀ NGHỀ NGHIỆP STP", { run: { bold: true, color: GREEN }, before: 600 }),
  center("CÔNG TY CỔ PHẦN KỸ THUẬT HÀNG HẢI DAKO", { run: { bold: true, color: GREEN }, after: 900 }),
  center("BÁO CÁO TƯ VẤN KHÁCH HÀNG", { run: { bold: true, size: 36 }, before: 600, after: 200 }),
  center("HUẤN LUYỆN AN TOÀN, VỆ SINH LAO ĐỘNG", { run: { bold: true, size: 32, color: GREEN }, after: 80 }),
  center("VÀ PHẦN MỀM SỐ HÓA QUẢN LÝ ATLĐ", { run: { bold: true, size: 32, color: GREEN }, after: 700 }),
  center("Khách hàng:", { run: { italics: true }, after: 60 }),
  center("CÔNG TY TNHH MTV ĐÓNG VÀ SỬA TÀU HẢI MINH", { run: { bold: true, size: 30 }, after: 40 }),
  center("(Hai Minh Shipyard – Nhà máy X51, Nhà Bè, TP. Hồ Chí Minh)", { run: { size: 26 }, after: 700 }),
  center("Nội dung trọng tâm", { run: { bold: true }, after: 80 }),
  center("1. Vị trí nhân sự và nhóm huấn luyện tương ứng", { after: 40 }),
  center("2. Tính năng phần mềm quản lý ATLĐ kèm hình ảnh, mục đích, lợi ích, giá trị", { after: 800 }),
  center("Thông tin được kiểm tra đến ngày 22/10/2026", { run: { italics: true }, after: 60 }),
  center("Tài liệu lưu hành nội bộ phục vụ chuẩn bị buổi gặp khách hàng", { run: { italics: true } })
];
const tocTitle = new Paragraph({ alignment: AlignmentType.CENTER, pageBreakBefore: true, spacing: { after: 240 }, children: runs("MỤC LỤC", { bold: true, color: GREEN, size: 32 }) });
const tocPlaceholder = new Paragraph({ children: [new TextRun({ text: "@@TOC@@", font: FONT })] });

// ---------- body ----------
const body = [];
for (const b of blocks) {
  if (b.t === "h1") body.push(heading(1, b.text));
  else if (b.t === "h2") body.push(heading(2, b.text));
  else if (b.t === "p") body.push(para(b.text, { align: AlignmentType.JUSTIFIED }));
  else if (b.t === "bul") b.items.forEach((x) => body.push(bulletPara(x)));
  else if (b.t === "num") {
    const ref = "num" + (++numLists);
    numRefs.push(ref);
    b.items.forEach((x) => body.push(new Paragraph({ numbering: { reference: ref, level: 0 }, spacing: { after: 70, line: 276 }, children: runs(x) })));
  } else if (b.t === "note") { body.push(noteBox(b.title, b.lines)); body.push(new Paragraph({ spacing: { after: 100 }, children: [] })); }
  else if (b.t === "table") { body.push(mkTable(b.head, b.rows, b.widths, b)); body.push(new Paragraph({ spacing: { after: 120 }, children: [] })); }
  else if (b.t === "feature") body.push(...featureBlock(b));
}

const numbering = {
  config: [
    { reference: "bullets", levels: [{ level: 0, format: LevelFormat.BULLET, text: "•", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 460, hanging: 280 } } } }] },
    ...numRefs.map((r) => ({ reference: r, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: "%1.", alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 500, hanging: 380 } } } }] }))
  ]
};

const footer = new Footer({ children: [new Paragraph({
  tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W }],
  border: { top: { style: BorderStyle.SINGLE, size: 4, color: "A9C4B3", space: 4 } },
  children: [
    new TextRun({ text: "Viện STP – DAKO | Báo cáo tư vấn khách hàng Hải Minh", font: FONT, size: 22, color: "555555" }),
    new TextRun({ text: "\tTrang ", font: FONT, size: 22, color: "555555" }),
    new TextRun({ children: [PageNumber.CURRENT], font: FONT, size: 22, color: "555555" })
  ] })] });
const emptyFooter = new Footer({ children: [new Paragraph({ children: [] })] });

const doc = new Document({
  creator: "Viện STP – DAKO", title: "Báo cáo tư vấn khách hàng Hải Minh – Huấn luyện ATVSLĐ và phần mềm số hóa ATLĐ",
  features: { updateFields: true },
  styles: {
    default: { document: { run: { font: FONT, size: 28 } } },
    paragraphStyles: [
      { id: "Heading1", name: "Heading 1", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 28, bold: true, color: GREEN, allCaps: true },
        paragraph: { spacing: { before: 0, after: 200 }, outlineLevel: 0, border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: "7CC43A", space: 4 } } } },
      { id: "Heading2", name: "Heading 2", basedOn: "Normal", next: "Normal", quickFormat: true,
        run: { font: FONT, size: 28, bold: true, color: GREEN },
        paragraph: { spacing: { before: 280, after: 120 }, outlineLevel: 1 } },
      { id: "TOC1", name: "toc 1", basedOn: "Normal", next: "Normal", run: { font: FONT, size: 26, bold: true },
        paragraph: { spacing: { before: 70, after: 20 }, tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W, leader: "dot" }] } },
      { id: "TOC2", name: "toc 2", basedOn: "Normal", next: "Normal", run: { font: FONT, size: 24 },
        paragraph: { spacing: { after: 0 }, indent: { left: 320 }, tabStops: [{ type: TabStopType.RIGHT, position: TEXT_W, leader: "dot" }] } }
    ]
  },
  numbering,
  sections: [{
    properties: {
      titlePage: true,
      page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 1134, footer: 560 } }
    },
    footers: { default: footer, first: emptyFooter },
    children: [...cover, tocTitle, tocPlaceholder, ...body]
  }]
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync("base.docx", buf);
  fs.writeFileSync("headings.json", JSON.stringify(headings, null, 1));
  console.log("OK base.docx", buf.length, "bytes;", headings.length, "headings;", figNo, "figures");
});
