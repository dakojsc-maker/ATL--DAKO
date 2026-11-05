// Dựng tài liệu "Các nhóm huấn luyện ATVSLĐ – Ngành Xây dựng" dành cho DOANH NGHIỆP
// (bản rút gọn từ "Cẩm nang tư vấn ATVSLĐ – Ngành xây dựng" dành cho nhân viên kinh doanh).
//
// Chạy:    node tai-lieu-atvsld/build_01_xay_dung_doanh_nghiep.js
// Kết quả: tai-lieu-atvsld/01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType,
  BorderStyle, AlignmentType, VerticalAlign, Header, Footer, PageNumber, LevelFormat,
  HeadingLevel, TableLayoutType, Tab, TabStopType, LeaderType, HeightRule, LineRuleType,
} = require('docx');

// Luôn ghi rõ lineRule=auto: Word mặc định 'auto' khi thiếu, còn LibreOffice hiểu là 'exact'.
const AUTO = LineRuleType.AUTO;

const OUT = path.join(__dirname, '01_XayDung_DoanhNghiep_ATVSLD_VienSTP_DAKO.docx');

// ---------------------------------------------------------------- thiết kế
const FONT = 'Times New Roman';
const C = {
  green: '1B5E37', // màu thương hiệu (theo cẩm nang gốc)
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
// Mỗi nhóm một màu, dùng thống nhất trong toàn tài liệu để tra nhanh
const GROUP = { 1: '1B5E37', 2: '1F5F8B', 3: 'B4521A', 4: '56616B', 5: 'A23838', 6: '6A4C93' };

const PAGE_W = 11906, PAGE_H = 16838;
const M = { top: 1134, bottom: 1134, left: 1418, right: 1134, header: 567, footer: 567 };
const W = PAGE_W - M.left - M.right; // 9354 DXA: bề rộng vùng nội dung

const SZ = { body: 24, table: 21, small: 20, tiny: 18 }; // đơn vị nửa point

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
  const base = { size: o.size || SZ.body, color: o.color || C.text };
  if (o.bold) base.bold = true;
  if (o.italics) base.italics = true;
  if (o.spacing) base.characterSpacing = o.spacing;
  return new Paragraph({
    alignment: o.align || AlignmentType.JUSTIFIED,
    spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line || 250, lineRule: AUTO },
    keepNext: o.keepNext || false,
    keepLines: true,
    children: Array.isArray(text) ? text : runs(text, base),
  });
}

// Đoạn trong ô bảng: giãn dòng gần đơn, căn trái
function tp(text, o = {}) {
  return p(text, {
    ...o,
    size: o.size || SZ.table,
    align: o.align || AlignmentType.LEFT,
    after: o.after ?? 30,
    line: o.line || 245,
  });
}

function bullet(text, o = {}) {
  return new Paragraph({
    numbering: { reference: o.ref || 'bullets', level: 0 },
    alignment: AlignmentType.LEFT,
    spacing: { before: 0, after: o.after ?? 50, line: 245, lineRule: AUTO },
    keepLines: true,
    children: runs(text, { size: o.size || SZ.body, color: C.text }),
  });
}

function h1(text, o = {}) {
  return new Paragraph({
    heading: HeadingLevel.HEADING_1,
    pageBreakBefore: o.newPage || false,
    keepNext: true,
    keepLines: true,
    border: { bottom: { style: BorderStyle.SINGLE, size: 12, color: C.green, space: 3 } },
    children: [new TextRun({ text })],
  });
}

function h2(text) {
  return new Paragraph({ heading: HeadingLevel.HEADING_2, keepNext: true, keepLines: true, children: [new TextRun({ text })] });
}

function spacer(after = 120) {
  return new Paragraph({ spacing: { before: 0, after, line: 240, lineRule: AUTO }, children: [new TextRun({ text: '', size: 4 })] });
}

// Số nhóm tô màu (vd "1 + 3", "3 hoặc 4"); chữ khác hiển thị mờ
function groupRuns(spec, big = 26, small = SZ.tiny) {
  if (!/[1-6]/.test(spec)) return [new TextRun({ text: spec, italics: true, color: C.muted, size: small })];
  return spec.split(/([1-6])/).filter((s) => s !== '').map((s) => (/^[1-6]$/.test(s)
    ? new TextRun({ text: s, bold: true, color: GROUP[s], size: big })
    : new TextRun({ text: s, color: C.muted, size: small })));
}

// ---------------------------------------------------------------- tiện ích bảng
const line = (color = C.border, size = 4) => ({ style: BorderStyle.SINGLE, size, color });
const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
const STD_BORDERS = {
  top: line(), bottom: line(), left: line(), right: line(), insideHorizontal: line(), insideVertical: line(),
};
const WHITE_GRID = { ...STD_BORDERS, insideVertical: line(C.white, 12), insideHorizontal: line(C.white, 4) };

function cell(children, o = {}) {
  return new TableCell({
    children: Array.isArray(children) ? children : [children],
    width: { size: o.w, type: WidthType.DXA },
    columnSpan: o.span,
    verticalAlign: o.v || VerticalAlign.TOP,
    shading: o.fill ? { type: ShadingType.CLEAR, color: 'auto', fill: o.fill } : undefined,
    margins: o.margins || { top: 60, bottom: 40, left: 100, right: 100 },
    borders: o.borders,
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
  return new TableRow({
    children: cells,
    cantSplit: true,
    tableHeader: o.header || false,
    height: o.height ? { value: o.height, rule: HeightRule.ATLEAST } : undefined,
  });
}

// Hàng tiêu đề bảng: nền xanh, chữ trắng, lặp lại khi bảng sang trang
function headRow(widths, labels, o = {}) {
  return row(labels.map((t, i) => cell(
    tp(t, { bold: true, color: C.white, align: o.align?.[i] || AlignmentType.LEFT, size: o.size || SZ.table, after: 0, keepNext: true }),
    { w: widths[i], fill: C.green, v: VerticalAlign.CENTER, margins: o.margins },
  )), { header: true });
}

// Khung một ô: nền nhạt + vạch màu bên trái
function callout(children, o = {}) {
  const fill = o.fill || C.greenPale;
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
        shading: { type: ShadingType.CLEAR, color: 'auto', fill },
        margins: o.margins || { top: 100, bottom: 80, left: 220, right: 180 },
        borders,
      })],
    })],
  });
}

const CENTER = AlignmentType.CENTER;
const LEFT = AlignmentType.LEFT;

// ================================================================ NỘI DUNG
const body = [];

// ---------------------------------------------------------------- Trang đầu
body.push(
  p('VIỆN STP – DAKO', { size: 28, bold: true, color: C.green, align: CENTER, after: 20 }),
  p('Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP  ·  Công ty Cổ phần Kỹ thuật Hàng Hải DAKO',
    { size: SZ.small, color: C.muted, align: CENTER, after: 180 }),
  table([W], [row([cell([
    p('TÀI LIỆU DÀNH CHO DOANH NGHIỆP', { size: SZ.small, bold: true, color: C.greenSoft, align: CENTER, after: 80, spacing: 40 }),
    p('CÁC NHÓM HUẤN LUYỆN', { size: 40, bold: true, color: C.white, align: CENTER, after: 0, line: 230 }),
    p('AN TOÀN, VỆ SINH LAO ĐỘNG', { size: 40, bold: true, color: C.white, align: CENTER, after: 100, line: 230 }),
    p('NGÀNH XÂY DỰNG', { size: 30, bold: true, color: C.accent, align: CENTER, after: 120, spacing: 30 }),
    p('Ai thuộc nhóm nào  ·  Học gì  ·  Bao lâu  ·  Cần chuẩn bị gì',
      { size: SZ.body, italics: true, color: C.greenSoft, align: CENTER, after: 0 }),
  ], { w: W, fill: C.green, margins: { top: 200, bottom: 200, left: 300, right: 300 } })])],
  { borders: { top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE } }),
  p('Dành cho Ban lãnh đạo, phòng Nhân sự – Hành chính, bộ phận An toàn (HSE) và Ban chỉ huy công trường',
    { size: SZ.small, color: C.muted, align: CENTER, before: 120, after: 0 }),
  p('Tài liệu số 01 – Bộ tài liệu tham khảo theo ngành nghề  ·  Thông tin pháp lý cập nhật đến ngày 15/10/2026',
    { size: SZ.small, italics: true, color: C.muted, align: CENTER, after: 220 }),
  p('Doanh nghiệp xây dựng có lao động phân tán ở nhiều công trường, biến động theo từng công trình, và phần lớn công việc '
    + 'thuộc diện có yêu cầu nghiêm ngặt về an toàn, vệ sinh lao động (ATVSLĐ). Tài liệu này giúp Quý Doanh nghiệp nắm nhanh '
    + 'sáu nhóm huấn luyện theo quy định, tự ước tính nhân sự thuộc từng nhóm và chuẩn bị sẵn thông tin cho buổi làm việc '
    + 'với chuyên viên Viện STP – DAKO.', { after: 200 }),
);

const KEY_POINTS = [
  '**Mọi người lao động đều phải được huấn luyện ATVSLĐ** theo 6 nhóm đối tượng. Nhóm được xác định theo **công việc thực tế**, không theo chức danh.',
  '**Phần lớn nhân sự công trường thuộc {{3}}** (công việc có yêu cầu nghiêm ngặt): thợ thi công, kỹ sư hiện trường, giám sát, vận hành máy, lái xe. Người lao động chỉ làm công việc nghiêm ngặt sau khi đã được huấn luyện và cấp thẻ an toàn.',
  '**Huấn luyện trước khi giao việc, huấn luyện lại đúng hạn:** giấy chứng nhận, thẻ an toàn có thời hạn 2 năm; {{4}} huấn luyện định kỳ hằng năm; nghỉ việc từ 6 tháng trở lên phải huấn luyện lại.',
  '**Hồ sơ huấn luyện luôn được kiểm tra:** chủ đầu tư, tổng thầu thường yêu cầu trước khi cho vào công trường; tổng thầu kiểm tra công tác an toàn của thầu phụ; đây cũng là hồ sơ được xem đầu tiên khi có thanh tra hoặc tai nạn.',
  '**Chi phí huấn luyện thuộc trách nhiệm của người sử dụng lao động** theo quy định, không trừ vào lương người lao động.',
];
body.push(callout([
  p('NĂM ĐIỀU DOANH NGHIỆP XÂY DỰNG CẦN BIẾT', { bold: true, color: C.green, align: LEFT, after: 90 }),
  ...KEY_POINTS.map((t, i) => new Paragraph({
    numbering: { reference: 'keypoints', level: 0 },
    alignment: AlignmentType.JUSTIFIED,
    spacing: { before: 0, after: i === KEY_POINTS.length - 1 ? 30 : 80, line: 245, lineRule: AUTO },
    children: runs(t, { size: SZ.body, color: C.text }),
  })),
]));

// ---------------------------------------------------------------- 1. Sáu nhóm
body.push(h1('1. SÁU NHÓM HUẤN LUYỆN ATVSLĐ: AI HỌC, HỌC GÌ, BAO LÂU'));
body.push(p('Sáu nhóm đối tượng do Nghị định 44/2016/NĐ-CP (sửa đổi bởi Nghị định 140/2018/NĐ-CP) quy định, '
  + 'diễn giải theo các vị trí thường gặp trong doanh nghiệp xây dựng:', { keepNext: true }));

const W1 = [950, 6754, 1650];
const SIX = [
  [1, 'Người quản lý, chỉ huy: giám đốc, phó giám đốc được giao phụ trách, trưởng phòng ban, giám đốc chi nhánh; giám đốc dự án, chỉ huy trưởng, đội trưởng.',
    'Pháp luật và trách nhiệm của người đứng đầu; tổ chức bộ máy ATVSLĐ; kế hoạch ATVSLĐ hằng năm và kế hoạch an toàn tổng hợp của dự án; đánh giá rủi ro; quản lý thầu phụ, tổ đội; điều tra tai nạn; văn hóa an toàn.',
    ['16 giờ', 'Định kỳ 2 năm/lần']],
  [2, 'Người làm công tác ATVSLĐ: cán bộ an toàn, HSE chuyên trách hoặc bán chuyên trách (kiêm nhiệm); người trực tiếp giám sát ATVSLĐ tại công trường.',
    'Nghiệp vụ ATVSLĐ chuyên sâu; đánh giá rủi ro, biện pháp an toàn cho công việc nguy cơ cao; kiểm tra hiện trường, họp an toàn đầu ca; quản lý PPE, thiết bị nghiêm ngặt và kiểm định; điều tra tai nạn, ứng cứu khẩn cấp.',
    ['48 giờ', 'gồm lý thuyết, thực hành, kiểm tra', 'Định kỳ 2 năm/lần']],
  [3, 'Người làm công việc có yêu cầu nghiêm ngặt về ATVSLĐ: kỹ sư hiện trường, giám sát; thợ thi công các nghề; vận hành máy, thiết bị nâng; thợ điện, thợ hàn; lái xe.',
    'Pháp luật cơ bản; yếu tố nguy hiểm, có hại và biện pháp phòng ngừa; sử dụng phương tiện bảo vệ cá nhân (PPE); kiến thức chuyên ngành theo nghề (xem mục 3); xử lý sự cố, sơ cứu; thực hành tại chỗ.',
    ['24 giờ', 'Định kỳ 2 năm/lần']],
  [4, 'Người lao động khác, kể cả học nghề, tập nghề, thử việc: văn phòng, kế toán, nhân sự, kinh doanh, kho, bảo vệ, tạp vụ.',
    'Kiến thức cơ bản về ATVSLĐ; quyền và nghĩa vụ của người lao động; nội quy nơi làm việc và khi vào công trường; sử dụng PPE; sơ cấp cứu cơ bản, thoát hiểm.',
    ['16 giờ', 'Định kỳ hằng năm']],
  [5, 'Người làm công tác y tế: nhân viên y tế, phụ trách trạm y tế công trường.',
    'Nghiệp vụ y tế lao động; sơ cấp cứu tai nạn lao động (ngã cao, điện giật, bỏng, ngạt, chấn thương); quản lý sức khỏe, bệnh nghề nghiệp; xử lý tình huống khẩn cấp.',
    ['56 giờ', 'Định kỳ 2 năm/lần']],
  [6, 'An toàn, vệ sinh viên: thợ chính, tổ trưởng được cử làm mạng lưới an toàn ở tổ, đội (kiêm nhiệm).',
    'Vai trò, nhiệm vụ của an toàn, vệ sinh viên; nhận diện nguy cơ, nhắc nhở sử dụng PPE; phát hiện sớm hành vi, điều kiện không an toàn; báo cáo, kiến nghị.',
    ['4 giờ', 'học thêm, ngoài nhóm của công việc chính', 'Định kỳ theo quy định']],
];
body.push(table(W1, [
  headRow(W1, ['Nhóm', 'Ai học và học gì', 'Thời gian tối thiểu'], { align: [CENTER, LEFT, LEFT] }),
  ...SIX.map(([n, who, what, time]) => row([
    cell([
      tp('NHÓM', { size: 15, bold: true, color: C.white, align: CENTER, after: 0, spacing: 20 }),
      tp(String(n), { size: 44, bold: true, color: C.white, align: CENTER, after: 0, line: 220 }),
    ], { w: W1[0], fill: GROUP[n], v: VerticalAlign.CENTER }),
    cell([
      tp(`**Ai học:** ${who}`, { after: 40 }),
      tp(`**Học gì:** ${what}`, { after: 0, color: C.text }),
    ], { w: W1[1], v: VerticalAlign.CENTER, margins: { top: 70, bottom: 60, left: 120, right: 120 } }),
    cell([
      tp(time[0], { bold: true, size: 28, color: GROUP[n], after: 10 }),
      ...time.slice(1).map((t, i, a) => tp(t, {
        size: SZ.tiny, after: 10, color: i === a.length - 1 ? C.text : C.muted, italics: i !== a.length - 1,
      })),
    ], { w: W1[2], fill: C.greenPale, v: VerticalAlign.CENTER }),
  ])),
]));
body.push(p('Thời gian là mức tối thiểu theo quy định, đã gồm thời gian kiểm tra (trừ Nhóm 6). Chương trình cụ thể do '
  + 'Viện STP – DAKO thiết kế theo đối tượng và công việc thực tế tại công trường.',
{ size: SZ.tiny, italics: true, color: C.muted, before: 60, after: 140 }));

body.push(h2('Cần lưu ý'));
[
  'Giấy chứng nhận huấn luyện, Thẻ an toàn có **thời hạn 2 năm**; huấn luyện định kỳ tối thiểu bằng 50% thời gian lần đầu.',
  '**Huấn luyện lại** khi người lao động nghỉ việc, hoặc cơ sở ngừng hoạt động, từ 6 tháng trở lên – rất hay gặp khi công trình kết thúc, đội thợ giải tán rồi tập hợp lại.',
  '**Một người có thể thuộc nhiều nhóm** (ví dụ đội trưởng: {{1}} và {{3}}) – huấn luyện đủ các nhóm tương ứng.',
  '**Chuyển sang công việc khác** thì người lao động cần được huấn luyện theo công việc mới.',
].forEach((t, i, a) => body.push(bullet(t, { after: i === a.length - 1 ? 140 : 50 })));

body.push(h2('Doanh nghiệp xây dựng cần bao nhiêu người làm công tác ATVSLĐ (Nhóm 2)?'));
body.push(p('Thi công công trình xây dựng thuộc nhóm ngành phải bố trí người làm công tác ATVSLĐ theo quy mô lao động '
  + '(Điều 36 Nghị định 39/2016/NĐ-CP). Mức tối thiểu:', { keepNext: true, after: 100 }));
const W1b = [2338, 2338, 2339, 2339];
body.push(table(W1b, [
  headRow(W1b, ['Dưới 50 lao động', 'Từ 50 đến dưới 300', 'Từ 300 đến dưới 1.000', 'Từ 1.000 trở lên'], { align: [CENTER, CENTER, CENTER, CENTER] }),
  row(['01 người **bán chuyên trách**', '01 người **chuyên trách**', '02 người **chuyên trách**', 'Phòng ATVSLĐ hoặc ít nhất 03 người **chuyên trách**']
    .map((t, i) => cell(tp(t, { align: CENTER, after: 0 }), { w: W1b[i], fill: C.greenPale, v: VerticalAlign.CENTER }))),
]));
body.push(p('Người làm công tác ATVSLĐ phải được huấn luyện Nhóm 2 và đáp ứng tiêu chuẩn về trình độ khối kỹ thuật, kinh nghiệm '
  + 'theo Điều 36 nêu trên; huấn luyện Nhóm 2 không thay thế yêu cầu về bằng cấp.',
{ size: SZ.tiny, italics: true, color: C.muted, before: 60, after: 60, line: 240 }));

// ---------------------------------------------------------------- 2. Tra nhanh
body.push(h1('2. VỊ TRÍ NHÂN SỰ THUỘC NHÓM NÀO?'));
body.push(callout([
  p('TỰ XẾP NHÓM BẰNG BỐN CÂU HỎI', { bold: true, color: C.green, align: LEFT, after: 70 }),
  ...[
    '**1.** Đứng đầu một đơn vị (công ty, phòng ban, chi nhánh, ban chỉ huy công trường, đội thi công) hoặc phụ trách bộ phận kỹ thuật, kinh doanh?  →  {{1}}',
    '**2.** Làm công tác ATVSLĐ (chuyên trách hoặc kiêm nhiệm) hoặc trực tiếp giám sát ATVSLĐ?  →  {{2}}',
    '**3.** Trực tiếp làm công việc nghiêm ngặt: thi công xây dựng, làm việc trên cao từ 2 m, điện, hàn cắt, vận hành máy xây dựng và thiết bị nâng, không gian hạn chế, lái xe ô tô...?  →  {{3}}',
    '**4.** Làm công tác y tế  →  {{5}}. Được cử làm an toàn, vệ sinh viên  →  học thêm {{6}}. Không thuộc các trường hợp trên  →  {{4}}.',
  ].map((t) => p(t, { align: LEFT, after: 60, line: 245 })),
  p('Trả lời “có” ở nhiều câu thì huấn luyện đủ các nhóm tương ứng.', { size: SZ.small, italics: true, color: C.muted, align: LEFT, after: 10 }),
]));
body.push(spacer(140));

const W2 = [4950, 1000, 3404];
const LOOKUP = [
  ['A. LÃNH ĐẠO VÀ QUẢN LÝ CẤP CÔNG TY'],
  ['Chủ tịch HĐQT, chủ doanh nghiệp, Tổng giám đốc, Giám đốc; giám đốc chi nhánh, xí nghiệp, đội xây dựng trực thuộc', '1', 'Người đứng đầu đơn vị.'],
  ['Phó Tổng giám đốc, Phó Giám đốc', '1', 'Bắt buộc khi được giao phụ trách ATVSLĐ hoặc phụ trách kỹ thuật, kinh doanh; khuyến nghị cho mọi cấp phó.'],
  ['Trưởng phòng: kỹ thuật – thi công, kế hoạch – đấu thầu, vật tư – thiết bị, chất lượng, hành chính – nhân sự, kế toán trưởng, kinh doanh', '1', 'Phó phòng: Nhóm 1 nếu được giao phụ trách ATVSLĐ hoặc phụ trách bộ phận; còn lại Nhóm 4.'],
  ['B. ĐIỀU HÀNH DỰ ÁN VÀ CÔNG TRƯỜNG'],
  ['Giám đốc dự án, chủ nhiệm dự án; chỉ huy trưởng, chỉ huy phó công trường', '1', 'Khuyến nghị thêm Nhóm 3 khi trực tiếp điều hành, kiểm tra công việc nghiêm ngặt.'],
  ['Đội trưởng, đốc công', '1 + 3', 'Vừa quản lý đội, vừa trực tiếp thi công.'],
  ['Tổ trưởng, thợ chính phụ trách tổ thi công', '3', 'Nên cử làm an toàn, vệ sinh viên (thêm Nhóm 6).'],
  ['C. KỸ THUẬT, GIÁM SÁT, CHẤT LƯỢNG'],
  ['Kỹ sư thi công, kỹ sư hiện trường; kỹ sư giám sát (nhà thầu, tư vấn giám sát, ban QLDA, chủ đầu tư); QA/QC, thí nghiệm hiện trường, trắc đạc, khảo sát', '3', 'Công việc xây dựng thuộc Danh mục nghiêm ngặt. Chủ yếu làm việc văn phòng: xem xét Nhóm 4.'],
  ['Dự toán, quản lý khối lượng (QS), kế hoạch, hồ sơ hoàn công, thiết kế, BIM', '4', 'Thường xuyên làm việc tại hiện trường: xem xét Nhóm 3.'],
  ['D. AN TOÀN VÀ Y TẾ'],
  ['Trưởng bộ phận HSE, trưởng phòng ATVSLĐ', '1 + 2', 'Vừa đứng đầu bộ phận, vừa làm công tác ATVSLĐ.'],
  ['Cán bộ ATVSLĐ chuyên trách, bán chuyên trách; HSE officer; giám sát an toàn hiện trường', '2', 'Số người tối thiểu theo quy mô: xem mục 1.'],
  ['Nhân viên y tế, phụ trách trạm y tế công trường', '5', ''],
  ['An toàn, vệ sinh viên ở các tổ, đội', '6', 'Học thêm, ngoài nhóm của công việc chính.'],
  ['E. VĂN PHÒNG, HỖ TRỢ VÀ KHO'],
  ['Kế toán, hành chính, nhân sự, văn thư, IT, kinh doanh; bảo vệ, lao công, tạp vụ', '4', 'Bảo vệ nên bổ sung phòng cháy, ứng phó khẩn cấp.'],
  ['Nhân viên bếp ăn tập thể', '4', 'Nhóm 3 nếu bếp từ 300 suất ăn/ngày trở lên.'],
  ['Thủ kho, nhân viên kho vật tư, cung ứng hiện trường', '4', 'Nhóm 3 nếu thường xuyên bốc xếp thủ công vật nặng từ 30 kg, bảo quản hóa chất nguy hiểm hoặc lái xe nâng.'],
  ['F. LÁI XE, VẬN HÀNH MÁY VÀ THỢ THI CÔNG'],
  ['Lái xe con, xe tải, xe ben, xe bồn bê tông, xe cẩu, xe đầu kéo chở vật liệu', '3', 'Lái xe ô tô thuộc Danh mục nghiêm ngặt.'],
  ['Vận hành cần trục, cẩu, vận thăng, sàn treo; tín hiệu viên, buộc tải; máy xúc, ủi, lu, đầm; xe nâng; bơm bê tông, trạm trộn; nồi hơi, máy nén khí; thợ sửa chữa máy', '3', 'Máy xây dựng, thiết bị nâng, thiết bị áp lực thuộc Danh mục nghiêm ngặt.'],
  ['Thợ làm việc trên cao từ 2 m: giàn giáo, cốp pha, cốt thép, mặt dựng, kết cấu thép, lợp mái', '3', ''],
  ['Thợ hàn, cắt kim loại; gia công cốt thép, kết cấu thép; thợ cơ khí', '3', ''],
  ['Thợ điện, điện nhẹ, điều hòa thông gió, ống nước – PCCC (MEP)', '3', 'Thêm huấn luyện an toàn điện tùy công việc.'],
  ['Thợ đào, hố móng, tầng hầm, phá dỡ, cống, bể; thợ khoan, ép, đóng cọc', '3', ''],
  ['Thợ bê tông, mộc, sơn, chống thấm, ốp lát, hoàn thiện', '3', 'Thợ sơn, chống thấm: thêm an toàn hóa chất khi dùng hóa chất nguy hiểm.'],
  ['G. LAO ĐỘNG PHỔ THÔNG, THỜI VỤ, NHÀ THẦU PHỤ'],
  ['Phụ hồ, phụ việc, bốc xếp, vận chuyển vật liệu, dọn dẹp công trường', '3 hoặc 4', 'Nhóm 3 khi làm công việc xây dựng thuộc Danh mục (thường gặp); Nhóm 4 khi không thuộc Danh mục.'],
  ['Lao động thời vụ, học việc, tập nghề, thử việc', '3 hoặc 4', 'Theo công việc được giao; huấn luyện trước khi giao việc.'],
  ['Tổ đội khoán, thầu nhân công, nhân sự nhà thầu phụ', 'Theo công việc', 'Người sử dụng lao động của họ huấn luyện; nhà thầu chính kiểm tra hồ sơ.'],
  ['Khách vào công trường (chủ đầu tư, tư vấn, đoàn kiểm tra)', '—', 'Không thuộc 6 nhóm; phổ biến nội quy, cấp PPE trước khi vào.'],
];
body.push(table(W2, [
  headRow(W2, ['Vị trí nhân sự', 'Nhóm', 'Lưu ý'], { align: [LEFT, CENTER, LEFT] }),
  ...LOOKUP.map((r) => {
    if (r.length === 1) {
      return row([cell(tp(r[0], { bold: true, color: C.green, size: SZ.tiny, after: 0, keepNext: true, spacing: 10 }),
        { w: W, span: 3, fill: C.greenLight, margins: { top: 40, bottom: 20, left: 100, right: 100 } })]);
    }
    return row([
      cell(tp(r[0], { after: 0 }), { w: W2[0], v: VerticalAlign.CENTER }),
      cell(new Paragraph({ alignment: CENTER, spacing: { after: 0, line: 240, lineRule: AUTO }, children: groupRuns(r[1]) }),
        { w: W2[1], v: VerticalAlign.CENTER, fill: C.greenPale }),
      cell(tp(r[2], { size: SZ.tiny, color: C.muted, after: 0 }), { w: W2[2], v: VerticalAlign.CENTER }),
    ]);
  }),
]));
body.push(p('Bảng dùng để ước tính ban đầu. Danh sách chính thức được chuyên viên Viện STP – DAKO rà soát theo công việc thực tế '
  + 'của từng người, nhất là các trường hợp ranh giới.', { size: SZ.tiny, italics: true, color: C.muted, before: 60, after: 60 }));

// ---------------------------------------------------------------- 3. Nhóm 3 theo nghề
body.push(h1('3. NHÓM 3 TRONG XÂY DỰNG: HỌC GÌ THEO TỪNG NGHỀ'));
body.push(p('**Vì sao phần lớn nhân sự công trường thuộc Nhóm 3?** Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ '
  + '(Thông tư 06/2020/TT-BLĐTBXH) bao gồm chính các việc của công trường: thi công, giám sát, khảo sát, lắp đặt, sửa chữa, '
  + 'phá dỡ, bảo trì công trình; làm việc trên cao từ 2 m; vận hành máy xây dựng, thiết bị nâng; điện; hàn, cắt kim loại; '
  + 'không gian hạn chế; lái xe ô tô; hóa chất nguy hiểm; cưa xẻ gỗ; bốc xếp thủ công thường xuyên vật nặng từ 30 kg.'));
body.push(p('Ngoài phần chung của Nhóm 3, Viện STP – DAKO bổ sung nội dung chuyên ngành theo đúng công việc tại công trường:',
  { keepNext: true, after: 100 }));

const W3 = [2700, 6654];
const TRADES = [
  ['Kỹ sư, giám sát hiện trường', 'Kỹ sư thi công, giám sát, QA/QC, trắc đạc',
    'An toàn chuyên ngành xây dựng (trên cao, giàn giáo – cốp pha, hố móng, cẩu lắp, điện thi công, hàn cắt, phòng cháy); kiểm tra hiện trường, nhận biết điều kiện và hành vi không an toàn, lập biên bản, yêu cầu dừng việc; sơ cứu ban đầu.'],
  ['Làm việc trên cao', 'Giàn giáo, cốp pha, cốt thép, mặt dựng, mái',
    'Ngã cao, vật rơi; hệ thống chống ngã (dây an toàn toàn thân, điểm neo, lưới, lan can, sàn thao tác); lắp dựng, kiểm tra, tháo dỡ giàn giáo; làm việc khi có gió, mưa, sét; cứu hộ người treo trên dây; thực hành mặc và kiểm tra dây an toàn.'],
  ['Hàn, cắt, gia công thép', 'Hàn hồ quang, MIG, TIG; cắt gas, plasma; cơ khí',
    'Cháy nổ khi hàn cắt; chai khí oxy, axetylen, LPG, van chống cháy ngược; điện giật từ máy hàn; khói hàn, bảo vệ mắt và da; hàn cắt trên cao, trong không gian hạn chế; máy mài, máy cắt, máy uốn.'],
  ['Điện và cơ điện (MEP)', 'Điện thi công, điện nhẹ, điều hòa, ống nước – PCCC',
    'Điện thi công: tủ điện tạm, dây dẫn, chống dòng rò, nối đất; khóa – gắn thẻ khi sửa chữa; khoảng cách an toàn với đường dây, kể cả khi cẩu lắp; sơ cứu điện giật.'],
  ['Đào, hố móng, hầm, phá dỡ, cọc', 'Đào, tầng hầm, phá dỡ; cống, bể; khoan, ép cọc',
    'Sạt lở, sập vách (chống vách, rào chắn mép hố, thoát nước); không gian hạn chế (đo khí, thông gió, người giám sát bên ngoài, cứu hộ); trình tự phá dỡ; an toàn máy khoan, ép, đóng cọc.'],
  ['Bê tông, mộc, sơn, hoàn thiện', 'Bê tông, mộc, sơn, chống thấm, ốp lát, trần',
    'Máy trộn, đầm, bơm bê tông; bỏng xi măng, vôi; máy cưa, bụi gỗ; dung môi, thông gió, bảo vệ hô hấp, phiếu an toàn hóa chất; làm việc trên thang, sàn công tác.'],
  ['Vận hành máy nâng, máy thi công', 'Cần trục, cẩu, vận thăng, sàn treo, máy xúc, xe nâng',
    'Kiểm tra máy trước ca; tải trọng, biểu đồ tải, ổn định máy, gió; tín hiệu cẩu, buộc tải, vùng nguy hiểm; khoảng cách với đường điện; điểm mù, đường dốc, nền yếu; xử lý sự cố.'],
  ['Lái xe', 'Xe tải, xe ben, xe bồn bê tông, xe cẩu, xe con',
    'Giao thông nội bộ công trường: tốc độ, điểm mù, lùi xe có người dẫn, đường dốc, nền yếu; chằng buộc, tải trọng, nâng hạ thùng ben; kiểm tra xe trước ca; tiếp nhiên liệu an toàn.'],
];
body.push(table(W3, [
  headRow(W3, ['Nhóm công việc', 'Nội dung chuyên ngành trọng tâm']),
  ...TRADES.map(([name, who, what]) => row([
    cell([tp(name, { bold: true, color: GROUP[3], after: 0 }), tp(who, { size: SZ.tiny, color: C.muted, after: 0 })],
      { w: W3[0], fill: C.greenPale, v: VerticalAlign.CENTER }),
    cell(tp(what, { after: 0 }), { w: W3[1], v: VerticalAlign.CENTER }),
  ])),
]));
body.push(spacer(100));

// ---------------------------------------------------------------- 4. Bổ sung
body.push(h1('4. HUẤN LUYỆN VÀ DỊCH VỤ BỔ SUNG THEO NHU CẦU'));
body.push(p('Tùy công việc và thiết bị tại công trường, doanh nghiệp có thể cần thêm các nội dung sau; chuyên viên '
  + 'Viện STP – DAKO sẽ xác định cụ thể khi khảo sát.', { keepNext: true, after: 100 }));
const EXTRA = [
  ['Huấn luyện an toàn điện', 'Thợ điện, cơ điện (MEP), điện thi công, làm việc gần lưới điện. Yêu cầu riêng, không thay thế Nhóm 3.'],
  ['Huấn luyện sơ cấp cứu', 'Đội sơ cấp cứu công trường; công trường không có nhân viên y tế chuyên trách.'],
  ['Huấn luyện an toàn hóa chất', 'Dùng, lưu trữ hóa chất nguy hiểm: sơn, dung môi, chống thấm, khí hàn, nhiên liệu.'],
  ['Kiểm định kỹ thuật an toàn', 'Cần trục, vận thăng, sàn treo, xe nâng, máy ép cọc, bơm bê tông, bình áp lực, chai khí... theo danh mục hiện hành.'],
  ['Quan trắc môi trường lao động', 'Xưởng gia công, công trường nhiều bụi, ồn, khói hàn, hơi dung môi.'],
  ['Đánh giá rủi ro, biện pháp an toàn', 'Kế hoạch an toàn tổng hợp trình chủ đầu tư; biện pháp cho việc nguy cơ cao.'],
  ['Tư vấn hệ thống quản lý ISO 45001', 'Dự thầu dự án có yêu cầu ISO 45001 hoặc muốn chuẩn hóa hệ thống quản lý an toàn.'],
  ['Giáo dục nghề nghiệp; hiệu chuẩn', 'Đào tạo nghề ngắn hạn cho thợ (hàn, vận hành máy...); kiểm định, hiệu chuẩn thiết bị đo.'],
];
const W4 = [W / 2, W / 2];
const extraCell = ([t, d], i) => cell([
  tp(t, { bold: true, color: C.green, after: 10 }),
  tp(d, { size: SZ.small, after: 0 }),
], { w: W4[i % 2], fill: i % 4 === 0 || i % 4 === 3 ? C.greenPale : undefined });
const extraRows = [];
for (let k = 0; k < EXTRA.length; k += 2) extraRows.push(row([extraCell(EXTRA[k], k), extraCell(EXTRA[k + 1], k + 1)]));
body.push(table(W4, extraRows));
body.push(spacer(100));

// ---------------------------------------------------------------- 5. Hỏi đáp
body.push(h1('5. CÂU HỎI THƯỜNG GẶP', { newPage: true }));
const FAQ = [
  ['Văn phòng, doanh nghiệp nhỏ có phải huấn luyện không?',
    'Có. Nghĩa vụ huấn luyện áp dụng với mọi người lao động, không phân biệt quy mô doanh nghiệp. Văn phòng thuộc Nhóm 4 (tối thiểu 16 giờ, định kỳ hằng năm), có thể tổ chức gọn tại chỗ.'],
  ['Đã có cán bộ an toàn, giám đốc còn phải học không? Cử người học thay được không?',
    'Có. Cán bộ an toàn thuộc Nhóm 2, giám đốc thuộc Nhóm 1, nội dung và trách nhiệm khác nhau. Mỗi người thuộc Nhóm 1 phải tự học, không học thay; lịch học được sắp xếp linh hoạt để không ảnh hưởng điều hành.'],
  ['Kỹ sư chỉ ra công trường vài ngày mỗi tuần, xếp Nhóm 4 được không?',
    'Nhóm xác định theo công việc thực tế, không theo số ngày ở công trường: trực tiếp giám sát, thi công là Nhóm 3. Xếp thấp hơn thực tế gây rủi ro về hồ sơ khi có thanh tra hoặc tai nạn.'],
  ['Thợ có bằng nghề, chứng chỉ vận hành, bằng lái xe có phải học?',
    'Có. Bằng nghề, chứng chỉ vận hành, giấy phép lái xe là điều kiện chuyên môn; huấn luyện ATVSLĐ là yêu cầu riêng. Thiết bị đã kiểm định vẫn cần người vận hành được huấn luyện.'],
  ['Lao động đông, biến động, công trường ở xa thì tổ chức thế nào?',
    'Mọi người lao động, kể cả thời vụ, thử việc, phải được huấn luyện trước khi giao việc. Viện STP – DAKO huấn luyện tại công trường, chia đợt theo tổ đội, ca hoặc theo tiến độ thi công.'],
  ['Thợ đã có thẻ an toàn ở công trình khác, có phải học lại?',
    'Tra cứu mã chứng nhận để xem nhóm và thời hạn. Còn hạn và đúng nhóm công việc thì không học lại toàn bộ; chuyên viên đề xuất phần cần bổ sung (nếu có).'],
  ['Thầu phụ, tổ đội khoán, thiết bị thuê kèm người vận hành: ai huấn luyện?',
    'Người sử dụng lao động của họ (thầu phụ, tổ đội, bên cho thuê). Nhà thầu chính kiểm tra công tác an toàn của thầu phụ (Thông tư 04/2017/TT-BXD), nên yêu cầu hồ sơ huấn luyện trước khi cho vào công trường.'],
  ['Chi phí huấn luyện được tính thế nào?',
    'Theo nhóm huấn luyện, số học viên, địa điểm và hình thức tổ chức; Phiếu ở cuối tài liệu giúp báo giá chính xác. Chi phí an toàn lao động của dự án nằm trong chi phí hạng mục chung của dự toán, không được giảm khi đấu thầu (Thông tư 04/2017/TT-BXD).'],
];
const W5 = [2950, 6404];
body.push(table(W5, FAQ.map(([q, a], i) => row([
  cell(tp(`${i + 1}. ${q}`, { bold: true, color: C.green, after: 0 }), { w: W5[0], fill: C.greenPale, v: VerticalAlign.CENTER }),
  cell(tp(a, { after: 0 }), { w: W5[1], v: VerticalAlign.CENTER }),
]))));
body.push(spacer(100));

// ---------------------------------------------------------------- 6. Đồng hành
body.push(h1('6. VIỆN STP – DAKO ĐỒNG HÀNH CÙNG DOANH NGHIỆP'));
body.push(p('“Một khóa học có thể kết thúc sau vài ngày, nhưng công tác ATVSLĐ cần được quản lý mỗi ngày.”',
  { italics: true, color: C.green, align: CENTER, after: 120, keepNext: true }));
const STEPS = [
  ['Khảo sát hiện trạng', 'Khảo sát nhu cầu; rà soát nhân sự, công trường, hồ sơ hiện có.'],
  ['Đánh giá rủi ro', 'Nhận diện mối nguy, công việc nguy cơ cao để xếp đúng nhóm.'],
  ['Xây dựng giải pháp', 'Thiết kế chương trình, lịch, địa điểm theo tiến độ thi công.'],
  ['Huấn luyện ATLĐ', 'Theo nhóm, vị trí; lý thuyết kết hợp thực hành tại chỗ.'],
  ['Kiểm tra, cấp chứng nhận', 'Tổ chức kiểm tra; cấp thẻ, giấy chứng nhận có mã tra cứu.'],
  ['Đồng hành cải tiến', 'Nhắc hạn, huấn luyện định kỳ, hỗ trợ kỹ thuật.'],
];
const W6 = [1559, 1559, 1559, 1559, 1559, 1559];
const m6 = { top: 70, bottom: 70, left: 70, right: 70 };
body.push(table(W6, [
  row(STEPS.map(([name], i) => cell([
    tp(String(i + 1), { size: 30, bold: true, color: C.accent, align: CENTER, after: 0, keepNext: true }),
    tp(name, { size: SZ.tiny, bold: true, color: C.white, align: CENTER, after: 0, keepNext: true }),
  ], { w: W6[i], fill: C.green, v: VerticalAlign.CENTER, margins: m6 }))),
  row(STEPS.map(([, desc], i) => cell(tp(desc, { size: SZ.tiny, align: CENTER, after: 0 }), { w: W6[i], fill: C.greenPale, margins: m6 }))),
], { borders: WHITE_GRID }));
body.push(spacer(140));

body.push(h2('Quý Doanh nghiệp nhận được'));
const GAINS = [
  ['Chứng nhận tra cứu 24/7',
    'Thẻ an toàn hoặc Giấy chứng nhận huấn luyện theo quy định, mỗi chứng nhận có mã riêng. Chủ đầu tư, tổng thầu tự tra cứu, xác thực tại **daotao.vienstp.com** theo mã hoặc số CCCD.'],
  ['Tài khoản quản lý ATVSLĐ',
    'Cấp ngay khi ký hợp đồng đào tạo tại **doanhnghiep.vienstp.com**, không phải mua phần mềm riêng: theo dõi nhân sự theo Nhóm 1–6, hạn chứng nhận, thiết bị và hạn kiểm định, sự cố, cấp phát PPE; xuất báo cáo Excel.'],
  ['Huấn luyện tại công trường',
    'Chia đợt theo tổ đội, ca làm việc để hạn chế gián đoạn thi công; lý thuyết kết hợp thực hành tại chỗ, nội dung gắn với công việc thực tế của từng nghề.'],
];
const W6b = [3118, 3118, 3118];
body.push(table(W6b, [
  row(GAINS.map(([t], i) => cell(tp(t, { bold: true, color: C.white, align: CENTER, after: 0, keepNext: true }),
    { w: W6b[i], fill: C.green, v: VerticalAlign.CENTER }))),
  row(GAINS.map(([, d], i) => cell(tp(d, { size: SZ.small, after: 0 }), { w: W6b[i], fill: C.greenPale }))),
], { borders: WHITE_GRID }));
body.push(spacer(60));

// ---------------------------------------------------------------- 7. Pháp lý
body.push(h1('7. CĂN CỨ PHÁP LÝ CHÍNH'));
const W7 = [3500, 5854];
const LAWS = [
  ['Luật An toàn, vệ sinh lao động số 84/2015/QH13', 'Trách nhiệm của người sử dụng lao động, quyền và nghĩa vụ của người lao động; huấn luyện ATVSLĐ; an toàn, vệ sinh viên (Điều 74).'],
  ['Nghị định 44/2016/NĐ-CP, sửa đổi bởi Nghị định 140/2018/NĐ-CP', 'Sáu nhóm đối tượng; nội dung, thời gian huấn luyện lần đầu và định kỳ; chứng nhận có hiệu lực 2 năm.'],
  ['Nghị định 39/2016/NĐ-CP (Điều 36)', 'Bố trí người làm công tác ATVSLĐ theo quy mô lao động.'],
  ['Thông tư 06/2020/TT-BLĐTBXH; Thông tư 36/2019/TT-BLĐTBXH', 'Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (căn cứ xác định Nhóm 3); danh mục máy, thiết bị, vật tư, chất có yêu cầu nghiêm ngặt về an toàn lao động.'],
  ['Thông tư 04/2017/TT-BXD (hợp nhất tại 07/VBHN-BXD); QCVN 18:2021/BXD', 'Quản lý an toàn trong thi công xây dựng: kế hoạch an toàn tổng hợp, nhà thầu chính kiểm tra thầu phụ, chi phí an toàn trong dự toán; quy chuẩn an toàn thi công.'],
];
body.push(table(W7, LAWS.map(([a, b]) => row([
  cell(tp(a, { bold: true, size: SZ.small, after: 0 }), { w: W7[0], fill: C.greenPale, v: VerticalAlign.CENTER, margins: { top: 40, bottom: 30, left: 100, right: 100 } }),
  cell(tp(b, { size: SZ.small, after: 0 }), { w: W7[1], v: VerticalAlign.CENTER, margins: { top: 40, bottom: 30, left: 100, right: 100 } }),
]))));
body.push(spacer(100));
body.push(callout([
  p('**Tình trạng pháp lý (cập nhật đến ngày 15/10/2026):** dự án Luật sửa đổi, bổ sung một số điều của Luật An toàn, vệ sinh '
    + 'lao động đã được Chính phủ thông qua ngày 17/9/2026 và trình Quốc hội, chưa có hiệu lực. Quy định hiện hành vẫn được áp dụng; '
    + 'khi văn bản mới có hiệu lực, Viện STP – DAKO sẽ cập nhật cho khách hàng.', { size: SZ.small, after: 10, line: 245 }),
], { fill: C.amberFill, bar: C.amberBar, margins: { top: 80, bottom: 60, left: 200, right: 160 } }));

// ---------------------------------------------------------------- 8. Chuẩn bị
body.push(h1('8. CHUẨN BỊ CHO BUỔI LÀM VIỆC VỚI VIỆN STP – DAKO'));
body.push(p('Để chuyên viên xếp nhóm, đề xuất phương án và báo giá chính xác ngay từ buổi làm việc đầu tiên, '
  + 'Quý Doanh nghiệp vui lòng chuẩn bị:', { keepNext: true, after: 80 }));
[
  'Tổng số lao động và số người theo từng vị trí (điền **Phiếu chuẩn bị thông tin** ở trang cuối).',
  'Danh sách công trường đang và sắp thi công (địa điểm, thời gian); thầu phụ, tổ đội khoán và số người.',
  'Chứng nhận huấn luyện ATVSLĐ còn hạn (nếu có): người được cấp, nhóm, đơn vị cấp, ngày hết hạn.',
  'Danh sách máy, thiết bị thi công và hạn kiểm định.',
  'Yêu cầu hồ sơ an toàn lao động của chủ đầu tư, tổng thầu (nếu có) và thời điểm cần hoàn thành.',
  'Khi đăng ký lớp: danh sách học viên (họ tên, số CCCD, vị trí, công việc thực tế) và địa điểm học tại công trường.',
].forEach((t, i, a) => body.push(bullet(t, { ref: 'checks', after: i === a.length - 1 ? 160 : 40 })));

body.push(callout([
  p('VIỆN STP – DAKO', { size: 26, bold: true, color: C.green, align: LEFT, after: 30 }),
  p('Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP trực thuộc Liên hiệp các Hội Khoa học và Kỹ thuật Việt Nam (VUSTA). '
    + 'Công ty Cổ phần Kỹ thuật Hàng Hải DAKO (mã số doanh nghiệp 0313642407) thuộc hệ sinh thái Viện STP, được Bộ Nội vụ cấp phép '
    + 'hoạt động huấn luyện an toàn lao động.', { size: SZ.small, after: 70, line: 245 }),
  p('**Văn phòng:** Hà Nội · Nha Trang · TP. Hồ Chí Minh', { size: SZ.small, align: LEFT, after: 20 }),
  p('**Hotline:** 0827.695.368 – 0968.702.701   ·   **Website:** www.vienstp.com   ·   **Tra cứu chứng nhận:** daotao.vienstp.com',
    { size: SZ.small, align: LEFT, after: 110 }),
  new Paragraph({
    tabStops: [
      { type: TabStopType.LEFT, position: 5200, leader: LeaderType.DOT },
      { type: TabStopType.RIGHT, position: W - 420, leader: LeaderType.DOT },
    ],
    spacing: { before: 0, after: 30, line: 250, lineRule: AUTO },
    children: [
      ...runs('**Chuyên viên tư vấn:** ', { size: SZ.small, color: C.text }),
      new TextRun({ children: [new Tab()], size: SZ.small }),
      ...runs('  **Điện thoại/Zalo:** ', { size: SZ.small, color: C.text }),
      new TextRun({ children: [new Tab()], size: SZ.small }),
    ],
  }),
], { fill: C.greenLight }));

// ---------------------------------------------------------------- Phụ lục: Phiếu (trang riêng)
const form = [];
const fsz = SZ.small;
const cm = { top: 30, bottom: 20, left: 90, right: 90 };
const lbl = (t) => tp(t, { bold: true, size: fsz, after: 0 });
const blank = () => tp('', { size: fsz, after: 0 });
const section = (t, before = 120) => p(t, { size: fsz, bold: true, color: C.green, align: LEFT, before, after: 50, keepNext: true });

form.push(
  p('PHIẾU CHUẨN BỊ THÔNG TIN HUẤN LUYỆN ATVSLĐ', { size: 28, bold: true, color: C.green, align: CENTER, after: 30 }),
  p('Quý Doanh nghiệp vui lòng điền trước buổi làm việc hoặc gửi lại cho chuyên viên tư vấn. Cột “Nhóm dự kiến” chỉ để tham khảo; '
    + 'chuyên viên Viện STP – DAKO rà soát và xếp nhóm chính thức theo công việc thực tế.',
  { size: SZ.tiny, italics: true, color: C.muted, align: CENTER, after: 80, line: 240 }),
);

const WA = [2250, 2427, 2250, 2427];
const TYPE_TAB = 3460;
const optLine = (a, b, last = false) => new Paragraph({
  tabStops: [{ type: TabStopType.LEFT, position: TYPE_TAB }],
  spacing: { before: 0, after: last ? 0 : 20, line: 240, lineRule: AUTO },
  children: [new TextRun({ text: `□ ${a}`, size: SZ.tiny }), new TextRun({ children: [new Tab(), `□ ${b}`], size: SZ.tiny })],
});
form.push(section('A. Thông tin doanh nghiệp', 0));
form.push(table(WA, [
  row([cell(lbl('Tên doanh nghiệp'), { w: WA[0], fill: C.greenPale, v: VerticalAlign.CENTER, margins: cm }),
    cell(blank(), { w: WA[1] + WA[2] + WA[3], span: 3, margins: cm })], { height: 380 }),
  row([
    cell(lbl('Người liên hệ, chức vụ'), { w: WA[0], fill: C.greenPale, v: VerticalAlign.CENTER, margins: cm }), cell(blank(), { w: WA[1], margins: cm }),
    cell(lbl('Điện thoại, email'), { w: WA[2], fill: C.greenPale, v: VerticalAlign.CENTER, margins: cm }), cell(blank(), { w: WA[3], margins: cm }),
  ], { height: 380 }),
  row([
    cell(lbl('Loại hình'), { w: WA[0], fill: C.greenPale, v: VerticalAlign.CENTER, margins: cm }),
    cell([
      optLine('Tổng thầu, nhà thầu chính', 'Thầu phụ, nhà thầu chuyên ngành'),
      optLine('Hạ tầng, giao thông, thủy lợi', 'Cho thuê thiết bị, giàn giáo, cốp pha'),
      optLine('Thầu nhân công, tổ đội', 'Tư vấn giám sát, ban QLDA, chủ đầu tư', true),
    ], { w: WA[1] + WA[2] + WA[3], span: 3, v: VerticalAlign.CENTER, margins: cm }),
  ]),
  row([
    cell(lbl('Số công trường đang thi công'), { w: WA[0], fill: C.greenPale, v: VerticalAlign.CENTER, margins: cm }), cell(blank(), { w: WA[1], margins: cm }),
    cell(lbl('Cần xong huấn luyện trước ngày'), { w: WA[2], fill: C.greenPale, v: VerticalAlign.CENTER, margins: cm }), cell(blank(), { w: WA[3], margins: cm }),
  ], { height: 380 }),
]));

form.push(section('B. Số lượng nhân sự theo vị trí'));
const WB = [520, 3830, 1150, 1050, 1350, 1454];
const STAFF = [
  ['Lãnh đạo, trưởng phòng ban', '1'],
  ['Điều hành dự án, chỉ huy, đội trưởng', '1, 3'],
  ['Kỹ sư, giám sát, QA/QC, trắc đạc', '3'],
  ['Kỹ thuật, dự toán, hồ sơ', '4'],
  ['Cán bộ ATVSLĐ, HSE', '2'],
  ['Nhân viên y tế', '5'],
  ['An toàn, vệ sinh viên', '6'],
  ['Văn phòng, bảo vệ, tạp vụ, bếp', '4'],
  ['Kho, vật tư, cung ứng', '4 hoặc 3'],
  ['Lái xe, vận chuyển', '3'],
  ['Thợ làm việc trên cao', '3'],
  ['Thợ hàn, cắt, gia công thép', '3'],
  ['Thợ điện, cơ điện (MEP)', '3'],
  ['Thợ đào, hầm, phá dỡ, cọc', '3'],
  ['Thợ bê tông, mộc, sơn, hoàn thiện', '3'],
  ['Vận hành máy nâng, máy thi công', '3'],
  ['Lao động phổ thông, thời vụ', '3 hoặc 4'],
];
form.push(table(WB, [
  headRow(WB, ['TT', 'Vị trí', 'Nhóm dự kiến', 'Số người', 'Đã có chứng nhận còn hạn', 'Ghi chú'],
    { size: SZ.tiny, align: [CENTER, LEFT, CENTER, CENTER, CENTER, LEFT], margins: cm }),
  ...STAFF.map(([pos, g], i) => row([
    cell(tp(String(i + 1), { size: fsz, align: CENTER, after: 0 }), { w: WB[0], v: VerticalAlign.CENTER, margins: cm }),
    cell(tp(pos, { size: fsz, after: 0 }), { w: WB[1], v: VerticalAlign.CENTER, margins: cm }),
    cell(new Paragraph({ alignment: CENTER, spacing: { after: 0, line: 240, lineRule: AUTO }, children: groupRuns(g, fsz + 2, SZ.tiny) }),
      { w: WB[2], v: VerticalAlign.CENTER, fill: C.greenPale, margins: cm }),
    cell(blank(), { w: WB[3], margins: cm }), cell(blank(), { w: WB[4], margins: cm }), cell(blank(), { w: WB[5], margins: cm }),
  ], { height: 320 })),
  row([
    cell(blank(), { w: WB[0], fill: C.greenLight, margins: cm }),
    cell(tp('TỔNG CỘNG', { size: fsz, bold: true, after: 0 }), { w: WB[1], fill: C.greenLight, v: VerticalAlign.CENTER, margins: cm }),
    ...[2, 3, 4, 5].map((k) => cell(blank(), { w: WB[k], fill: C.greenLight, margins: cm })),
  ], { height: 320 }),
]));

form.push(section('C. Máy, thiết bị thi công (nếu có)'));
const WC = [4554, 1350, 1725, 1725];
const EQUIP = [
  'Cần trục tháp, cần trục, cẩu tự hành',
  'Vận thăng, thang tải, sàn treo, sàn nâng người',
  'Giàn giáo thép, cốp pha trượt, cốp pha leo',
  'Máy khoan, ép, đóng cọc; bơm bê tông, trạm trộn',
  'Xe nâng; máy xúc, ủi, lu; xe ben trên 5 tấn',
  'Nồi hơi, bình áp lực, máy nén khí, chai khí',
  'Khác:',
];
form.push(table(WC, [
  headRow(WC, ['Loại thiết bị', 'Số lượng', 'Còn hạn kiểm định', 'Sắp/đã hết hạn'], { size: SZ.tiny, align: [LEFT, CENTER, CENTER, CENTER], margins: cm }),
  ...EQUIP.map((t) => row([
    cell(tp(t, { size: fsz, after: 0 }), { w: WC[0], v: VerticalAlign.CENTER, margins: cm }),
    cell(blank(), { w: WC[1], margins: cm }), cell(blank(), { w: WC[2], margins: cm }), cell(blank(), { w: WC[3], margins: cm }),
  ], { height: 320 })),
]));
form.push(p('Thiết bị nào phải kiểm định được chuyên viên xác nhận theo quy định hiện hành.',
  { size: SZ.tiny, italics: true, color: C.muted, align: LEFT, before: 40, after: 0 }));

// ================================================================ TÀI LIỆU
const rightTab = [{ type: TabStopType.RIGHT, position: W }];
const headerDefault = new Header({
  children: [new Paragraph({
    style: 'HdrFtr',
    tabStops: rightTab,
    border: { bottom: { style: BorderStyle.SINGLE, size: 6, color: C.green, space: 4 } },
    children: [
      new TextRun({ text: 'VIỆN STP – DAKO', bold: true, color: C.green }),
      new TextRun({ text: '   |   Các nhóm huấn luyện ATVSLĐ – Ngành Xây dựng', color: C.green }),
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
      new TextRun({ text: 'Hotline: 0827.695.368 – 0968.702.701  ·  www.vienstp.com  ·  Tra cứu chứng nhận: daotao.vienstp.com' }),
      new TextRun({ children: [new Tab(), 'Trang ', PageNumber.CURRENT, '/', PageNumber.TOTAL_PAGES] }),
    ],
  })],
});

const page = { size: { width: PAGE_W, height: PAGE_H }, margin: M };

const doc = new Document({
  creator: 'Viện STP – DAKO',
  title: 'Các nhóm huấn luyện ATVSLĐ – Ngành Xây dựng (tài liệu dành cho doanh nghiệp)',
  description: 'Hướng dẫn nhanh các nhóm huấn luyện an toàn, vệ sinh lao động cho doanh nghiệp xây dựng – Viện STP – DAKO',
  styles: {
    default: {
      document: { run: { font: FONT, size: SZ.body, color: C.text }, paragraph: { spacing: { after: 120, line: 250, lineRule: AUTO } } },
      heading1: {
        run: { font: FONT, size: 28, bold: true, color: C.green },
        paragraph: { spacing: { before: 280, after: 140 }, keepNext: true, keepLines: true },
      },
      heading2: {
        run: { font: FONT, size: 25, bold: true, color: C.green },
        paragraph: { spacing: { before: 140, after: 80 }, keepNext: true, keepLines: true },
      },
    },
    paragraphStyles: [{
      id: 'HdrFtr',
      name: 'Header Footer Small',
      basedOn: 'Normal',
      run: { font: FONT, size: 17, color: C.muted },
      paragraph: { spacing: { before: 0, after: 0, line: 240, lineRule: AUTO } },
    }],
  },
  numbering: {
    config: [
      {
        reference: 'bullets',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 420, hanging: 260 } }, run: { color: C.green } },
        }],
      },
      {
        reference: 'checks',
        levels: [{
          level: 0, format: LevelFormat.BULLET, text: '□', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 460, hanging: 320 } }, run: { font: FONT, size: 26, color: C.green } },
        }],
      },
      {
        reference: 'keypoints',
        levels: [{
          level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT,
          style: { paragraph: { indent: { left: 380, hanging: 380 } }, run: { bold: true, color: C.green } },
        }],
      },
    ],
  },
  sections: [
    {
      properties: { page, titlePage: true },
      headers: { default: headerDefault, first: headerFirst },
      footers: { default: footer, first: footer },
      children: body,
    },
    {
      properties: { page },
      headers: { default: headerDefault },
      footers: { default: footer },
      children: form,
    },
  ],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(OUT, buf);
  console.log('Đã ghi', OUT, `${(buf.length / 1024).toFixed(1)} KB`);
});
