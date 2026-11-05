// KHUNG CHUẨN "Tài liệu ATVSLĐ dành cho doanh nghiệp" (theo bản 01 Xây dựng đã duyệt, chỉnh trên Word ngày 05/11/2026).
// Toàn bộ định dạng và bố cục nằm ở đây; nội dung từng ngành nằm ở tai-lieu-atvsld/nganh/NN_*.js.
// Mô tả chuẩn bằng lời: tai-lieu-atvsld/CHUAN.md. Không đổi chuẩn ở đây nếu người dùng chưa duyệt.
//
// Chuẩn chính: A4; Times New Roman; MỌI nội dung cỡ 13 (đoạn văn, tiêu đề mục, bảng, ghi chú) – chỉ bìa dùng cỡ riêng;
// trang 1 là bìa + 5 điều cần biết; mục 1–7; mục 5 sang trang mới; kết thúc ở mục 7 (không có mục 8, không có phiếu);
// bảng kẻ đường đen 1/2 pt, hàng tiêu đề nền xanh chữ trắng căn giữa.

const {
  Document, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, BorderStyle, AlignmentType,
  VerticalAlign, Header, Footer, PageNumber, LevelFormat, HeadingLevel, TableLayoutType, Tab, TabStopType,
  LineRuleType,
} = require('docx');

// Luôn ghi rõ lineRule=auto: Word mặc định 'auto' khi thiếu, còn LibreOffice hiểu là 'exact' (làm lệch dàn trang PDF).
const AUTO = LineRuleType.AUTO;

// ---------------------------------------------------------------- thiết kế
const FONT = 'Times New Roman';
const C = {
  green: '1B5E37', // màu thương hiệu
  greenLight: 'E6F2EA',
  greenPale: 'F3F8F4',
  greenSoft: 'CFE6D7',
  accent: 'F2C14E',
  border: 'B9CFC1',
  text: '1F2A24',
  muted: '5B6660',
  amberFill: 'FFF5E1',
  amberBar: 'D9961A',
  white: 'FFFFFF',
};
// Mỗi nhóm một màu, dùng thống nhất trong toàn tài liệu
const GROUP = { 1: '1B5E37', 2: '1F5F8B', 3: 'B4521A', 4: '56616B', 5: 'A23838', 6: '6A4C93' };

const PAGE_W = 11906, PAGE_H = 16838;
const M = { top: 1134, bottom: 1134, left: 1418, right: 1134, header: 567, footer: 567 };
const W = PAGE_W - M.left - M.right; // 9354 DXA: bề rộng vùng nội dung

const SZ = 26; // 13pt: cỡ chữ của mọi nội dung
const BIA = { brand: 28, sub: 20, title: 40, nganh: 30, tagline: 24 }; // cỡ chữ riêng của bìa
const HF = 17; // header, footer

const CENTER = AlignmentType.CENTER;
const LEFT = AlignmentType.LEFT;
const JUSTIFIED = AlignmentType.JUSTIFIED;

// ---------------------------------------------------------------- tiện ích chữ
// Cú pháp nội dung: **đậm**, {{n}} -> "Nhóm n" tô màu theo nhóm (dùng được trong **...**).
function runs(text, base = {}) {
  const out = [];
  const re = /(\*\*[^*]+\*\*|\{\{[1-6]\}\})/g;
  let last = 0;
  let m;
  while ((m = re.exec(text))) {
    if (m.index > last) out.push(new TextRun({ ...base, text: text.slice(last, m.index) }));
    const tok = m[0];
    if (tok.startsWith('**')) out.push(...runs(tok.slice(2, -2), { ...base, bold: true }));
    else out.push(new TextRun({ ...base, text: `Nhóm ${tok[2]}`, bold: true, color: GROUP[tok[2]] }));
    last = m.index + tok.length;
  }
  if (last < text.length) out.push(new TextRun({ ...base, text: text.slice(last) }));
  return out;
}

function p(text, o = {}) {
  const base = { size: o.size || SZ, color: o.color || C.text };
  if (o.bold) base.bold = true;
  if (o.italics) base.italics = true;
  if (o.spacing) base.characterSpacing = o.spacing;
  return new Paragraph({
    alignment: o.align || JUSTIFIED,
    pageBreakBefore: o.newPage || false,
    spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line || 250, lineRule: AUTO },
    keepNext: o.keepNext || false,
    keepLines: true,
    children: Array.isArray(text) ? text : runs(text, base),
  });
}

// Đoạn trong ô bảng
function tp(text, o = {}) {
  return p(text, { ...o, align: o.align || LEFT, after: o.after ?? 30, line: o.line || 245 });
}

function blank(after) {
  return new Paragraph({ spacing: { before: 0, after, line: 250, lineRule: AUTO }, children: [new TextRun({ text: '', size: SZ })] });
}

function spacer(after = 120) {
  return new Paragraph({ spacing: { before: 0, after, line: 240, lineRule: AUTO }, children: [new TextRun({ text: '', size: 4 })] });
}

function bullet(text, o = {}) {
  return new Paragraph({
    numbering: { reference: 'bullets', level: 0 },
    alignment: LEFT,
    spacing: { before: 0, after: o.after ?? 50, line: 245, lineRule: AUTO },
    keepLines: true,
    children: runs(text, { size: SZ, color: C.text }),
  });
}

function h1(text, o = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: o.newPage || false,
    keepNext: true,
    keepLines: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.green, space: 3 } },
    children: [new TextRun({ text, size: SZ })],
  });
}

function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, keepLines: true, children: [new TextRun({ text, size: SZ })] });
}

// Số nhóm tô màu (vd "1 + 3", "3 hoặc 4"); chữ khác hiển thị mờ
function groupRuns(spec) {
  if (!/[1-6]/.test(spec)) return [new TextRun({ text: spec, italics: true, color: C.muted, size: SZ })];
  return spec.split(/([1-6])/).filter((s) => s !== '').map((s) => (/^[1-6]$/.test(s)
    ? new TextRun({ text: s, bold: true, color: GROUP[s], size: SZ })
    : new TextRun({ text: s, color: C.muted, size: SZ })));
}

// ---------------------------------------------------------------- tiện ích bảng
// Kẻ bảng: đường đơn 1/2 pt màu tự động (đen) cho mọi bảng dữ liệu – theo bản chuẩn (in rõ trên giấy)
const line = (color = 'auto', size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const STD_BORDERS = {
  top: line(), bottom: line(), left: line(), right: line(), insideHorizontal: line(), insideVertical: line(),
};
const NO_BORDERS = { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE };

function cell(children, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    width: { size: o.w, type: WidthType.DXA },
    columnSpan: o.span,
    verticalAlign: o.v || VerticalAlign.TOP,
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: o.margins || { top: 60, bottom: 40, left: 100, right: 100 },
  });
}

function table(widths, rows, o = {}) {
  return new Table({
    width: { size: widths.reduce((a, b) => a + b, 0), type: WidthType.DXA },
    columnWidths: widths,
    layout: TableLayoutType.FIXED,
    borders: o.borders || STD_BORDERS,
    rows,
  });
}

function row(cells, o = {}) {
  return new TableRow({ children: cells, cantSplit: true, tableHeader: o.header || false });
}

// Hàng tiêu đề bảng: nền xanh, chữ trắng đậm, căn giữa, lặp lại khi bảng sang trang
function headRow(widths, labels) {
  return row(labels.map((t, i) => cell(
    tp(t, { bold: true, color: C.white, align: CENTER, after: 0, keepNext: true }),
    { w: widths[i], fill: C.green, v: VerticalAlign.CENTER },
  )), { header: true });
}

// Khung một ô: nền nhạt + vạch màu bên trái
function callout(children, o = {}) {
  const borders = { top: NONE, bottom: NONE, right: NONE, left: { style: BorderStyle.SINGLE, size: 24, color: o.bar || C.green } };
  return new Table({
    width: { size: W, type: WidthType.DXA },
    columnWidths: [W],
    layout: TableLayoutType.FIXED,
    borders: { ...borders, insideHorizontal: NONE, insideVertical: NONE },
    rows: [new TableRow({
      cantSplit: true,
      children: [new TableCell({
        children,
        width: { size: W, type: WidthType.DXA },
        shading: { type: ShadingType.CLEAR, color: 'auto', fill: o.fill || C.greenPale },
        margins: o.margins || { top: 100, bottom: 80, left: 220, right: 180 },
        borders,
      })],
    })],
  });
}

// ================================================================ CÁC PHẦN CỦA TÀI LIỆU

// Trang 1: tên đơn vị, băng tiêu đề, đoạn giới thiệu, khung "5 điều cần biết"
function phanBia(nd) {
  return [
    p('VIỆN STP – DAKO', { size: BIA.brand, bold: true, color: C.green, align: CENTER, after: 20 }),
    p('Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP  ·  Công ty Cổ phần Kỹ thuật Hàng Hải DAKO',
      { size: BIA.sub, color: C.muted, align: CENTER, after: 180 }),
    blank(180),
    blank(180),
    table([W], [row([cell([
      p('CÁC NHÓM HUẤN LUYỆN', { size: BIA.title, bold: true, color: C.white, align: CENTER, after: 0, line: 230 }),
      p('AN TOÀN, VỆ SINH LAO ĐỘNG', { size: BIA.title, bold: true, color: C.white, align: CENTER, after: 100, line: 230 }),
      p(nd.bia.nganh, { size: BIA.nganh, bold: true, color: C.accent, align: CENTER, after: 120, spacing: 30 }),
      p('Ai thuộc nhóm nào  ·  Học gì  ·  Bao lâu  ·  Cần chuẩn bị gì',
        { size: BIA.tagline, italics: true, color: C.greenSoft, align: CENTER, after: 0 }),
    ], { w: W, fill: C.green, margins: { top: 200, bottom: 200, left: 300, right: 300 } })])], { borders: NO_BORDERS }),
    blank(200),
    p(nd.bia.gioiThieu, { after: 200 }),
    callout([
      p(nd.bia.tieuDeDiemChinh, { bold: true, color: C.green, align: LEFT, after: 90 }),
      ...nd.bia.diemChinh.map((t, i, a) => new Paragraph({
        numbering: { reference: 'keypoints', level: 0 },
        alignment: JUSTIFIED,
        spacing: { before: 0, after: i === a.length - 1 ? 30 : 80, line: 245, lineRule: AUTO },
        children: runs(t, { size: SZ, color: C.text }),
      })),
    ]),
  ];
}

// Mục 1: sáu nhóm, cần lưu ý, số người làm công tác ATVSLĐ
function muc1(nd) {
  const m = nd.muc1;
  const W1 = [1130, 6574, 1650];
  const out = [
    h1('1. SÁU NHÓM HUẤN LUYỆN ATVSLĐ: AI HỌC, HỌC GÌ, BAO LÂU', { newPage: true }),
    p(m.dan, { keepNext: true }),
    table(W1, [
      headRow(W1, ['Nhóm', 'Ai học và học gì', 'Thời gian tối thiểu']),
      ...m.nhom.map(({ n, aiHoc, hocGi, thoiGian }) => row([
        cell([
          tp('NHÓM', { bold: true, color: C.white, align: CENTER, after: 0, spacing: 20 }),
          tp(String(n), { bold: true, color: C.white, align: CENTER, after: 0, line: 240 }),
        ], { w: W1[0], fill: GROUP[n], v: VerticalAlign.CENTER }),
        cell([
          tp(`**Ai học:** ${aiHoc}`, { after: 40 }),
          tp(`**Học gì:** ${hocGi}`, { after: 0 }),
        ], { w: W1[1], v: VerticalAlign.CENTER, margins: { top: 70, bottom: 60, left: 120, right: 120 } }),
        cell([
          tp(thoiGian[0], { bold: true, color: GROUP[n], after: 10 }),
          ...thoiGian.slice(1).map((t, i, a) => tp(t, {
            after: 10, color: i === a.length - 1 ? C.text : C.muted, italics: i !== a.length - 1,
          })),
        ], { w: W1[2], fill: C.greenPale, v: VerticalAlign.CENTER }),
      ])),
    ]),
    p(m.ghiChu, { italics: true, color: C.muted, before: 60, after: 140 }),
    h2('Cần lưu ý'),
    ...m.luuY.map((t, i, a) => bullet(t, { after: i === a.length - 1 ? 140 : 50 })),
  ];
  if (m.canBo) {
    // chia đều bề rộng theo số mức quy mô; phần dư dồn về các cột cuối (4 mức: 2338, 2338, 2339, 2339 như bản 01)
    const k = m.canBo.bang.length;
    const W1b = Array.from({ length: k }, (_, i) => Math.floor(W / k) + (i >= k - (W % k) ? 1 : 0));
    out.push(
      h2(m.canBo.tieuDe),
      p(m.canBo.dan, { keepNext: true, after: 100 }),
      table(W1b, [
        headRow(W1b, m.canBo.bang.map(([quyMo]) => quyMo)),
        row(m.canBo.bang.map(([, yeuCau], i) => cell(tp(yeuCau, { align: CENTER, after: 0 }),
          { w: W1b[i], fill: C.greenPale, v: VerticalAlign.CENTER }))),
      ]),
      p(m.canBo.ghiChu, { italics: true, color: C.muted, before: 60, after: 60, line: 240 }),
    );
  }
  return out;
}

// Mục 2: bốn câu hỏi tự xếp nhóm và bảng tra vị trí -> nhóm
function muc2(nd) {
  const m = nd.muc2;
  const W2 = [4950, 1000, 3404];
  return [
    h1('2. VỊ TRÍ NHÂN SỰ THUỘC NHÓM NÀO?'),
    callout([
      p('TỰ XẾP NHÓM BẰNG BỐN CÂU HỎI', { bold: true, color: C.green, align: LEFT, after: 70 }),
      ...m.bonCauHoi.map((t, i) => p(`**${i + 1}.** ${t}`, { align: LEFT, after: 60, line: 245 })),
      p('Trả lời “có” ở nhiều câu thì huấn luyện đủ các nhóm tương ứng.', { italics: true, color: C.muted, align: LEFT, after: 10 }),
    ]),
    spacer(140),
    table(W2, [
      headRow(W2, ['Vị trí nhân sự', 'Nhóm', 'Lưu ý']),
      ...m.bangTra.map((r) => {
        if (r.length === 1) {
          return row([cell(tp(r[0], { bold: true, color: C.green, after: 0, keepNext: true, spacing: 10 }),
            { w: W, span: 3, fill: C.greenLight, margins: { top: 40, bottom: 20, left: 100, right: 100 } })]);
        }
        return row([
          cell(tp(r[0], { after: 0 }), { w: W2[0], v: VerticalAlign.CENTER }),
          cell(new Paragraph({ alignment: CENTER, spacing: { after: 0, line: 240, lineRule: AUTO }, children: groupRuns(r[1]) }),
            { w: W2[1], v: VerticalAlign.CENTER, fill: C.greenPale }),
          cell(tp(r[2] || '', { color: C.muted, after: 0 }), { w: W2[2], v: VerticalAlign.CENTER }),
        ]);
      }),
    ]),
    p(m.ghiChu, { italics: true, color: C.muted, before: 60, after: 60 }),
  ];
}

// Mục 3: Nhóm 3 của ngành học gì theo từng nghề
function muc3(nd) {
  const m = nd.muc3;
  const W3 = [2700, 6654];
  return [
    h1(m.tieuDe),
    p(m.viSao),
    p(m.dan, { keepNext: true, after: 100 }),
    table(W3, [
      headRow(W3, ['Nhóm công việc', 'Nội dung chuyên ngành trọng tâm']),
      ...m.nghe.map(([ten, viTri, noiDung]) => row([
        cell([tp(ten, { bold: true, color: GROUP[3], after: 0 }), tp(viTri, { color: C.muted, after: 0 })],
          { w: W3[0], fill: C.greenPale, v: VerticalAlign.CENTER }),
        cell(tp(noiDung, { after: 0 }), { w: W3[1], v: VerticalAlign.CENTER }),
      ])),
    ]),
    spacer(100),
  ];
}

// Mục 4: huấn luyện, dịch vụ bổ sung (lưới 2 cột, số ô chẵn)
function muc4(nd) {
  const m = nd.muc4;
  const W4 = [W / 2, W / 2];
  const o = (item, i) => cell([
    tp(item[0], { bold: true, color: C.green, after: 10 }),
    tp(item[1], { after: 0 }),
  ], { w: W4[i % 2], fill: i % 4 === 0 || i % 4 === 3 ? C.greenPale : undefined });
  const rows = [];
  for (let k = 0; k < m.dichVu.length; k += 2) {
    rows.push(row([o(m.dichVu[k], k), m.dichVu[k + 1] ? o(m.dichVu[k + 1], k + 1) : cell(tp(''), { w: W4[1] })]));
  }
  return [
    h1('4. HUẤN LUYỆN VÀ DỊCH VỤ BỔ SUNG THEO NHU CẦU'),
    p(m.dan, { keepNext: true, after: 100 }),
    table(W4, rows),
    spacer(100),
  ];
}

// Mục 5: câu hỏi thường gặp (luôn sang trang mới)
function muc5(nd) {
  const W5 = [2950, 6404];
  return [
    h1('5. CÂU HỎI THƯỜNG GẶP', { newPage: true }),
    table(W5, nd.muc5.map(([q, a], i) => row([
      cell(tp(`${i + 1}. ${q}`, { bold: true, color: C.green, after: 0 }), { w: W5[0], fill: C.greenPale, v: VerticalAlign.CENTER }),
      cell(tp(a, { after: 0 }), { w: W5[1], v: VerticalAlign.CENTER }),
    ]))),
    spacer(100),
  ];
}

// Mục 6: quy trình 6 bước và "Quý Doanh nghiệp nhận được"
function muc6(nd) {
  const m = nd.muc6;
  const W6 = [1559, 1559, 1559, 1559, 1559, 1559];
  const m6 = { top: 70, bottom: 70, left: 70, right: 70 };
  const W6b = [3118, 3118, 3118];
  return [
    h1('6. VIỆN STP – DAKO ĐỒNG HÀNH CÙNG DOANH NGHIỆP'),
    p(m.trichDan, { italics: true, color: C.green, align: CENTER, after: 120, keepNext: true }),
    table(W6, [
      row(m.quyTrinh.map(([ten], i) => cell([
        tp(String(i + 1), { bold: true, color: C.accent, align: CENTER, after: 0, keepNext: true }),
        tp(ten, { bold: true, color: C.white, align: CENTER, after: 0, keepNext: true }),
      ], { w: W6[i], fill: C.green, v: VerticalAlign.CENTER, margins: m6 }))),
      row(m.quyTrinh.map(([, moTa], i) => cell(tp(moTa, { align: CENTER, after: 0 }), { w: W6[i], fill: C.greenPale, margins: m6 }))),
    ]),
    spacer(140),
    h2('Quý Doanh nghiệp nhận được'),
    table(W6b, [
      row(m.nhanDuoc.map(([t], i) => cell(tp(t, { bold: true, color: C.white, align: CENTER, after: 0, keepNext: true }),
        { w: W6b[i], fill: C.green, v: VerticalAlign.CENTER }))),
      row(m.nhanDuoc.map(([, d], i) => cell(tp(d, { after: 0 }), { w: W6b[i], fill: C.greenPale }))),
    ]),
    spacer(60),
  ];
}

// Mục 7: căn cứ pháp lý và tình trạng pháp lý; tài liệu kết thúc ở đây
function muc7(nd) {
  const m = nd.muc7;
  const W7 = [3500, 5854];
  const mg = { top: 40, bottom: 30, left: 100, right: 100 };
  return [
    h1('7. CĂN CỨ PHÁP LÝ CHÍNH'),
    table(W7, m.vanBan.map(([a, b]) => row([
      cell(tp(a, { bold: true, after: 0 }), { w: W7[0], fill: C.greenPale, v: VerticalAlign.CENTER, margins: mg }),
      cell(tp(b, { after: 0 }), { w: W7[1], v: VerticalAlign.CENTER, margins: mg }),
    ]))),
    spacer(100),
    callout([p(m.tinhTrang, { after: 10, line: 245 })],
      { fill: C.amberFill, bar: C.amberBar, margins: { top: 80, bottom: 60, left: 200, right: 160 } }),
    // Word bắt buộc có một đoạn sau bảng cuối; để rất nhỏ cho khỏi sinh trang trắng
    new Paragraph({ spacing: { before: 0, after: 0, line: 240, lineRule: AUTO }, children: [new TextRun({ text: '', size: 2 })] }),
  ];
}

// ================================================================ TÀI LIỆU
function taoTaiLieu(nd) {
  const rightTab = [{ type: TabStopType.RIGHT, position: W }];
  const header = new Header({
    children: [new Paragraph({
      style: 'HdrFtr',
      tabStops: rightTab,
      border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.green, space: 4 } },
      children: [
        new TextRun({ text: 'VIỆN STP – DAKO', bold: true, color: C.green }),
        new TextRun({ text: `   |   ${nd.dauTrang}`, color: C.green }),
        new TextRun({ children: [new Tab(), 'Tài liệu dành cho doanh nghiệp'], italics: true }),
      ],
    })],
  });
  const headerFirst = new Header({ children: [new Paragraph({ style: 'HdrFtr', children: [] })] });
  const footer = new Footer({
    children: [new Paragraph({
      style: 'HdrFtr',
      tabStops: rightTab,
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: C.border, space: 4 } },
      children: [
        new TextRun({ text: nd.chanTrang }),
        new TextRun({ children: [new Tab(), 'Trang ', PageNumber.CURRENT, '/', PageNumber.TOTAL_PAGES] }),
      ],
    })],
  });

  return new Document({
    creator: 'Viện STP – DAKO',
    title: nd.tieuDeFile,
    description: nd.moTaFile,
    styles: {
      default: {
        document: { run: { font: FONT, size: 24, color: C.text }, paragraph: { spacing: { after: 120, line: 250, lineRule: AUTO } } },
        heading1: {
          run: { font: FONT, size: SZ, bold: true, color: C.green },
          paragraph: { spacing: { before: 280, after: 140 }, keepNext: true, keepLines: true },
        },
        heading2: {
          run: { font: FONT, size: SZ, bold: true, color: C.green },
          paragraph: { spacing: { before: 140, after: 80 }, keepNext: true, keepLines: true },
        },
      },
      paragraphStyles: [{
        id: 'HdrFtr',
        name: 'Header Footer Small',
        basedOn: 'Normal',
        run: { font: FONT, size: HF, color: C.muted },
        paragraph: { spacing: { before: 0, after: 0, line: 240, lineRule: AUTO } },
      }],
    },
    numbering: {
      config: [
        {
          reference: 'bullets',
          levels: [{
            level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 420, hanging: 260 } }, run: { color: C.green, size: SZ } },
          }],
        },
        {
          reference: 'keypoints',
          levels: [{
            level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
            style: { paragraph: { indent: { left: 380, hanging: 380 } }, run: { bold: true, color: C.green, size: SZ } },
          }],
        },
      ],
    },
    sections: [{
      properties: { page: { size: { width: PAGE_W, height: PAGE_H }, margin: M }, titlePage: true },
      headers: { default: header, first: headerFirst },
      footers: { default: footer, first: footer },
      children: [...phanBia(nd), ...muc1(nd), ...muc2(nd), ...muc3(nd), ...muc4(nd), ...muc5(nd), ...muc6(nd), ...muc7(nd)],
    }],
  });
}

module.exports = { taoTaiLieu, GROUP, C };
