// Tạo file Word "Hồ sơ pháp lý dòng sản phẩm ca cao Heragrain" (docx-js). Chạy: node tao_word.js
const fs = require('fs');
const D = require('docx');
const { Document, Packer, Paragraph, TextRun, Table, TableRow, TableCell, WidthType, ShadingType, AlignmentType,
  HeadingLevel, LevelFormat, BorderStyle, Footer, Header, PageNumber, PageBreak, VerticalAlign, TabStopType } = D;

const OUT = 'Heragrain-Cacao_Ho-so-phap-ly-van-ban-bieu-mau.docx';
const FONT = 'Times New Roman';
const W = 9071; // A4, lề trái 3 cm, phải 2 cm
const XANH = '1D4B3A', VANG = 'E4A92A', NAU = '5A3825', KEM = 'F6F0E6', XAM = 'EEF2EF';

/* chữ có **đậm** */
function runs(text, o = {}) {
  const out = [];
  String(text).split(/(\*\*[^*]+\*\*)/).forEach((s) => {
    if (!s) return;
    const b = s.startsWith('**') && s.endsWith('**');
    out.push(new TextRun({ text: b ? s.slice(2, -2) : s, bold: b || o.bold, italics: o.italics, size: o.size, color: o.color, font: FONT }));
  });
  return out;
}
const P = (text, o = {}) => new Paragraph({ children: runs(text, o), alignment: o.align || AlignmentType.JUSTIFIED,
  spacing: { before: o.before ?? 0, after: o.after ?? 120, line: o.line ?? 300 }, indent: o.indent, keepNext: o.keepNext });
const H1 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_1, children: [new TextRun({ text: t, font: FONT })] });
const H2 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_2, children: [new TextRun({ text: t, font: FONT })] });
const H3 = (t) => new Paragraph({ heading: HeadingLevel.HEADING_3, children: [new TextRun({ text: t, font: FONT })] });
const BL = (items, lvl = 0) => items.map((t) => new Paragraph({ numbering: { reference: 'bul', level: lvl }, children: runs(t),
  alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 290 } }));
const NUM = (items, ref) => items.map((t) => new Paragraph({ numbering: { reference: ref, level: 0 }, children: runs(t),
  alignment: AlignmentType.JUSTIFIED, spacing: { after: 60, line: 290 } }));
const PB = () => new Paragraph({ children: [new PageBreak()] });
const border = { style: BorderStyle.SINGLE, size: 4, color: 'B9C7BE' };
const borders = { top: border, bottom: border, left: border, right: border };

/* bảng: widths theo tỷ lệ, hàng đầu là tiêu đề */
function T(widths, rows, o = {}) {
  const sum = widths.reduce((a, b) => a + b, 0);
  const cw = widths.map((w) => Math.floor(w / sum * W));
  cw[cw.length - 1] += W - cw.reduce((a, b) => a + b, 0);
  const size = o.size || 20;
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: cw,
    rows: rows.map((r, ri) => new TableRow({
      tableHeader: ri === 0 && o.head !== false,
      cantSplit: true,
      children: r.map((c, ci) => new TableCell({
        width: { size: cw[ci], type: WidthType.DXA }, borders, verticalAlign: VerticalAlign.CENTER,
        margins: { top: 60, bottom: 60, left: 100, right: 100 },
        shading: ri === 0 && o.head !== false ? { fill: o.headFill || XANH, type: ShadingType.CLEAR, color: 'auto' }
          : (o.zebra !== false && ri % 2 === 0 ? { fill: XAM, type: ShadingType.CLEAR, color: 'auto' } : undefined),
        children: String(c).split('\n').map((line) => new Paragraph({
          children: runs(line, { size, bold: ri === 0 && o.head !== false ? true : (o.boldFirst && ci === 0), color: ri === 0 && o.head !== false ? 'FFFFFF' : undefined }),
          alignment: ri === 0 ? AlignmentType.CENTER : (o.center && o.center.includes(ci) ? AlignmentType.CENTER : AlignmentType.LEFT),
          spacing: { after: 20, line: 260 } }))
      }))
    }))
  });
}
/* khung ghi chú màu */
function NOTE(text, fill = KEM, edge = VANG) {
  return new Table({
    width: { size: W, type: WidthType.DXA }, columnWidths: [W],
    rows: [new TableRow({ children: [new TableCell({
      width: { size: W, type: WidthType.DXA },
      borders: { top: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, bottom: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' },
        right: { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' }, left: { style: BorderStyle.SINGLE, size: 24, color: edge } },
      shading: { fill, type: ShadingType.CLEAR, color: 'auto' }, margins: { top: 100, bottom: 100, left: 180, right: 140 },
      children: (Array.isArray(text) ? text : [text]).map((t) => new Paragraph({ children: runs(t, { size: 22 }), spacing: { after: 60, line: 280 }, alignment: AlignmentType.JUSTIFIED }))
    })] })]
  });
}
const GAP = () => new Paragraph({ children: [], spacing: { after: 80 } });

/* biểu mẫu: quốc hiệu, tiêu đề, dòng điền */
function QH() {
  return [new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: 'CỘNG HÒA XÃ HỘI CHỦ NGHĨA VIỆT NAM', bold: true, font: FONT, size: 24 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 0 }, children: [new TextRun({ text: 'Độc lập - Tự do - Hạnh phúc', bold: true, font: FONT, size: 26 })] }),
    new Paragraph({ alignment: AlignmentType.CENTER, spacing: { after: 160 }, children: [new TextRun({ text: '---------------', font: FONT, size: 24 })] })];
}
const FT = (t, o = {}) => new Paragraph({ alignment: AlignmentType.CENTER, spacing: { before: o.before ?? 120, after: o.after ?? 120 },
  children: [new TextRun({ text: t, bold: true, font: FONT, size: o.size || 28 })] });
const FL = (label, val) => new Paragraph({ spacing: { after: 60, line: 300 }, tabStops: [{ type: TabStopType.RIGHT, position: W, leader: 'dot' }],
  children: [...runs(label), ...(val ? runs(' ' + val, { italics: true, color: '23765C' }) : []), new TextRun({ text: '\t', font: FONT })] });
const SIGN = (who) => [new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { before: 200, after: 0 }, children: runs('…………, ngày … tháng … năm 20…', { italics: true }) }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 0 }, children: runs(who, { bold: true }) }),
  new Paragraph({ alignment: AlignmentType.RIGHT, spacing: { after: 400 }, children: runs('(Ký, ghi rõ họ tên, đóng dấu)', { italics: true }) })];
const DO = (t) => P(t, { italics: true, color: '6B7A72', size: 21 });

/* ===================================================================== NỘI DUNG */
const C = [];
const add = (...xs) => xs.forEach((x) => (Array.isArray(x) ? C.push(...x) : C.push(x)));

/* ---------- Trang bìa ---------- */
add(new Paragraph({ spacing: { before: 1600, after: 120 }, alignment: AlignmentType.LEFT, children: [new TextRun({ text: 'HỢP TÁC XÃ HERAGRAIN · ĐẮK LẮK', font: FONT, size: 24, bold: true, color: VANG })] }),
  new Paragraph({ spacing: { after: 120 }, children: [new TextRun({ text: 'HỒ SƠ PHÁP LÝ', font: FONT, size: 56, bold: true, color: XANH })] }),
  new Paragraph({ spacing: { after: 240 }, children: [new TextRun({ text: 'DÒNG SẢN PHẨM CA CAO', font: FONT, size: 44, bold: true, color: NAU })] }),
  P('Văn bản pháp luật, thủ tục, nơi đăng ký, cơ quan cấp và biểu mẫu soạn sẵn để Heragrain đăng ký đầy đủ cho **ca cao thô** (hạt rang, nibs) và **chế biến sâu** (socola, bột ca cao, bơ ca cao, socola mix vị).', { size: 28, align: AlignmentType.LEFT, after: 400 }),
  T([1, 2.6], [['Cập nhật', 'Đến ngày 04/11/2026 (theo các văn bản tra cứu được tại thời điểm soạn)'],
    ['Phạm vi', 'Sản xuất, chế biến, kinh doanh trong nước và xuất khẩu (EU, Trung Quốc) sản phẩm ca cao tại xưởng cũ của HTX, tỉnh Đắk Lắk'],
    ['Đi kèm', 'Bộ slide concept sản phẩm (1-concept-san-pham), bộ slide tổng quan bộ máy, quy trình, chứng nhận, nhân sự (2-tong-quan-bo-may), sơ đồ 3D (3-so-do-3d), tham quan 360° (4-tham-quan-360)'],
    ['Lưu ý', 'Tài liệu tư vấn, không thay thế văn bản gốc. Trước khi nộp hồ sơ, đối chiếu toàn văn trên Công báo, Cổng Dịch vụ công quốc gia và hỏi lại cơ quan tiếp nhận.']],
    { head: false, boldFirst: true, size: 22 }),
  PB());

/* ---------- Mục lục ---------- */
add(H1('Mục lục'),
  ...NUM(['Bối cảnh pháp lý cần biết trước (2025–2026)', 'Bảng tổng hợp thủ tục theo giai đoạn', 'Danh mục văn bản pháp luật, tiêu chuẩn hiện hành',
    'Hướng dẫn từng thủ tục: hồ sơ, nơi nộp, cơ quan cấp, thời hạn', 'Biểu mẫu soạn sẵn cho Heragrain (BM-01 đến BM-09)',
    'Danh bạ cơ quan, đơn vị liên quan', 'Lộ trình hồ sơ theo giai đoạn (bảng kiểm)', 'Điểm cần xác nhận với cơ quan có thẩm quyền', 'Nguồn tham chiếu'], 'muc'),
  PB());

/* ---------- 1. Bối cảnh ---------- */
add(H1('1. Bối cảnh pháp lý cần biết trước (2025–2026)'),
  P('Từ giữa năm 2025 đến nay, nhiều văn bản nền tảng thay đổi cùng lúc (sắp xếp bộ máy, chính quyền địa phương hai cấp, luật chất lượng, sở hữu trí tuệ, an toàn thực phẩm). Các điểm dưới đây quyết định Heragrain nộp hồ sơ **ở đâu** và **theo văn bản nào**:'),
  ...BL([
    '**An toàn thực phẩm:** Luật An toàn thực phẩm số 55/2010/QH12 đang có hiệu lực. **Nghị định 15/2018/NĐ-CP tiếp tục áp dụng** vì Nghị định 46/2026/NĐ-CP (ban hành 26/01/2026, thay Nghị định 15) đã bị tạm ngưng: Nghị quyết 09/2026/NQ-CP (04/02/2026) rồi Nghị quyết 15/2026/NQ-CP (06/4/2026) tạm ngưng đến khi Luật An toàn thực phẩm (sửa đổi) và nghị định hướng dẫn có hiệu lực. Dự án Luật An toàn thực phẩm (sửa đổi) được Chính phủ trình ngày 24/10/2026 tại Kỳ họp thứ Hai, Quốc hội khóa XVI; khi luật được thông qua, thủ tục có thể đổi.',
    '**Chính quyền địa phương hai cấp (từ 01/7/2025):** không còn cấp huyện. Đăng ký hợp tác xã do cơ quan đăng ký kinh doanh **cấp xã** giải quyết (Nghị định 125/2025/NĐ-CP); đăng ký môi trường nộp **UBND cấp xã** (Nghị định 131/2025/NĐ-CP). Tỉnh Đắk Lắk hiện là tỉnh sau sắp xếp (hợp nhất với Phú Yên từ 01/7/2025).',
    '**Bộ máy trung ương:** Bộ Nông nghiệp và Môi trường (hợp nhất Bộ NN&PTNT và Bộ TN&MT) quản lý an toàn thực phẩm nông sản, trong đó có **ca cao**; Bộ Công Thương quản lý nhóm **bánh, mứt, kẹo** (kẹo sô-cô-la); lĩnh vực lao động chuyển về Bộ Nội vụ (ở tỉnh là Sở Nội vụ).',
    '**Chất lượng, nhãn, mã vạch:** Luật Chất lượng sản phẩm, hàng hóa sửa đổi số 78/2025/QH15 và Luật Tiêu chuẩn và Quy chuẩn kỹ thuật sửa đổi số 70/2025/QH15 có hiệu lực từ 01/01/2026. **Nghị định 37/2026/NĐ-CP** (23/01/2026) hướng dẫn Luật Chất lượng, quy định mã số mã vạch và **thay Nghị định 43/2017, 111/2021 về nhãn hàng hóa**; nhãn đã in trước được dùng tiếp không quá 2 năm.',
    '**Sở hữu trí tuệ:** Luật sửa đổi Luật Sở hữu trí tuệ số 131/2025/QH15 có hiệu lực từ 01/4/2026, rút thời hạn thẩm định nội dung đơn nhãn hiệu còn 5 tháng, có cơ chế thẩm định nhanh.',
    '**Xuất khẩu:** Lệnh 280 của Tổng cục Hải quan Trung Quốc (GACC) có hiệu lực từ 01/6/2026, thay Lệnh 248; hạt cà phê, ca cao chưa rang được đưa khỏi danh mục 17 nhóm cần giới thiệu. Quy định chống phá rừng của EU (**EUDR**, (EU) 2023/1115) áp dụng cho ca cao từ **30/12/2026** với doanh nghiệp lớn, vừa và **30/6/2027** với doanh nghiệp siêu nhỏ, nhỏ.']),
  GAP(),
  NOTE(['**Phân công quản lý cho dòng ca cao của Heragrain (đề xuất cách hiểu, cần xác nhận):**',
    'Hạt ca cao, nibs, khối ca cao, bột ca cao, bơ ca cao: thuộc nhóm “ca cao” do ngành **Nông nghiệp và Môi trường** quản lý (ở Đắk Lắk: Chi cục Quản lý chất lượng nông lâm sản và thủy sản, Sở NN&MT).',
    'Socola (kẹo sô-cô-la): thuộc nhóm **bánh, mứt, kẹo** do ngành **Công Thương** quản lý (Sở Công Thương Đắk Lắk).',
    'Cơ sở sản xuất sản phẩm của từ hai ngành trở lên: Điều 36 Nghị định 15/2018 có nguyên tắc chọn một cơ quan đầu mối. Nên hỏi trước cả hai sở bằng văn bản để chốt **một** cơ quan cấp Giấy chứng nhận cơ sở đủ điều kiện ATTP cho xưởng ca cao trước khi bắt đầu làm socola (GĐ2).']),
  PB());

/* ---------- 2. Bảng tổng hợp ---------- */
add(H1('2. Bảng tổng hợp thủ tục theo giai đoạn'),
  P('Giai đoạn theo lộ trình dòng ca cao: **GĐ1** hàng thô (Q1–Q2/2027) · **GĐ2** socola (Q3–Q4/2027) · **GĐ3** bột, bơ ca cao, HACCP (Q1–Q2/2028) · **GĐ4** mix vị, xuất khẩu (từ Q3/2028).'),
  T([0.48, 1.9, 2.0, 2.3, 1.55, 0.6], [
    ['#', 'Thủ tục, hồ sơ', 'Căn cứ chính', 'Nơi nộp, cơ quan cấp', 'Thời hạn, hiệu lực', 'GĐ'],
    ['1', 'Bổ sung ngành nghề HTX (10730 sản xuất ca cao, sôcôla và bánh kẹo; 46320 bán buôn thực phẩm; 46200 bán buôn nông, lâm sản nguyên liệu)', 'Luật HTX 17/2023/QH15; NĐ 92/2024/NĐ-CP; NĐ 125/2025/NĐ-CP; QĐ 36/2025/QĐ-TTg', 'Cơ quan đăng ký kinh doanh cấp xã nơi HTX đặt trụ sở (trực tiếp hoặc Cổng Dịch vụ công)', 'Vài ngày làm việc', '1'],
    ['2', 'Giấy chứng nhận cơ sở đủ điều kiện ATTP', 'Luật ATTP 2010 Điều 34; NĐ 15/2018; TT 38/2018/TT-BNNPTNT (đã sửa đổi); TT 43/2018/TT-BCT', 'Chi cục QLCL nông lâm sản và thủy sản (Sở NN&MT Đắk Lắk); socola: Sở Công Thương nếu tách đầu mối', 'Thẩm định khoảng 15 ngày làm việc; hiệu lực 3 năm', '1'],
    ['3', 'Khám sức khỏe, tập huấn kiến thức ATTP cho chủ cơ sở, người trực tiếp sản xuất', 'Luật ATTP Điều 19; NĐ 15/2018', 'Cơ sở y tế đủ điều kiện; tổ chức tập huấn theo hướng dẫn của cơ quan quản lý', 'Hằng năm; lưu hồ sơ', '1'],
    ['4', 'Kiểm nghiệm sản phẩm', 'NĐ 15/2018 Điều 5; QCVN 8-1, 8-2:2011/BYT, 8-3:2012/BYT', 'Phòng kiểm nghiệm được chỉ định hoặc công nhận ISO/IEC 17025', 'Phiếu trong 12 tháng khi tự công bố', '1–4'],
    ['5', 'Tự công bố sản phẩm (từng sản phẩm)', 'NĐ 15/2018 Điều 4, 5', 'Đăng tải công khai + nộp 1 bản đến cơ quan do UBND tỉnh Đắk Lắk chỉ định; nhập Hệ thống thông tin ATTP', 'Được sản xuất, bán ngay sau khi tự công bố', '1–4'],
    ['6', 'Nhãn hàng hóa', 'NĐ 37/2026/NĐ-CP; Luật CLSPHH (sửa đổi 2025)', 'Tự thực hiện, không đăng ký', 'Trước khi bán', '1–4'],
    ['7', 'Mã số mã vạch GS1 (tiền tố 893)', 'NĐ 37/2026/NĐ-CP (mẫu đơn Phụ lục VII)', 'GS1 Việt Nam, nộp trực tuyến', 'Phí cấp, phí duy trì hằng năm', '1'],
    ['8', 'Đăng ký nhãn hiệu “Heragrain” và logo (nhóm 29, 30, 31; thêm 35)', 'Luật SHTT (sửa đổi 131/2025/QH15); NĐ 65/2023/NĐ-CP', 'Cục Sở hữu trí tuệ (Bộ KH&CN), nộp trực tuyến', 'Thẩm định nội dung 5 tháng; văn bằng 10 năm, gia hạn được', '1'],
    ['9', 'Đăng ký môi trường', 'Luật BVMT 2020; NĐ 08/2022 (sửa đổi NĐ 05/2025); NĐ 131/2025', 'UBND cấp xã', 'Trước khi vận hành', '1'],
    ['10', 'Phòng cháy chữa cháy', 'Luật PCCC và CNCH 2024; NĐ 105/2025/NĐ-CP', 'Công an cấp xã / Phòng Cảnh sát PCCC và CNCH, Công an tỉnh', 'Hồ sơ quản lý; phương án nếu thuộc danh mục', '1'],
    ['11', 'Lao động, ATVSLĐ (nội quy khi có từ 10 lao động, huấn luyện, khám sức khỏe định kỳ, BHXH)', 'Bộ luật Lao động 2019; Luật ATVSLĐ 2015; NĐ 44/2016/NĐ-CP', 'Sở Nội vụ (đăng ký nội quy); tự tổ chức huấn luyện; BHXH', 'Theo quy định', '1–2'],
    ['12', 'HACCP hoặc ISO 22000:2018', 'TCVN ISO 22000:2018; Codex CXC 1-1969; NĐ 15/2018 Điều 12', 'Tổ chức chứng nhận đã đăng ký lĩnh vực', 'Chứng chỉ 3 năm, giám sát hằng năm; được miễn GCN ATTP khi còn hiệu lực', '3'],
    ['13', 'OCOP (tùy chọn)', 'QĐ 148/QĐ-TTg (24/02/2023)', 'UBND cấp xã tiếp nhận; Hội đồng đánh giá tỉnh', '36 tháng', '3–4'],
    ['14', 'FSSC 22000 hoặc BRCGS', 'Tiêu chuẩn tư nhân được GFSI công nhận', 'Tổ chức chứng nhận quốc tế', 'Theo người mua', '4'],
    ['15', 'Hồ sơ EUDR (ca cao vào EU)', 'Quy định (EU) 2023/1115, sửa đổi (EU) 2024/3234, (EU) 2025/2650', 'Nhà nhập khẩu EU nộp tuyên bố thẩm định; Heragrain cung cấp dữ liệu', 'Từ 30/12/2026 (DN nhỏ 30/6/2027)', '4'],
    ['16', 'Đăng ký nhà máy với GACC (Trung Quốc)', 'Lệnh 280 GACC; Thông báo 27/2026; Thông báo 219/2025 (nông sản sơ cấp)', 'Hệ thống CIFER (một cửa Trung Quốc); qua cơ quan Việt Nam nếu thuộc 17 nhóm', 'Mã hiệu lực 5 năm', '4'],
    ['17', 'Giấy chứng nhận xuất xứ (C/O)', 'NĐ 31/2018/NĐ-CP; TT 11/2020/TT-BCT (EVFTA)', 'Bộ Công Thương, hệ thống eCoSys', 'Từng lô hàng', '4'],
    ['18', 'Kiểm dịch thực vật (khi xuất hạt ca cao chưa rang)', 'Luật BVTV và KDTV 2013; văn bản hướng dẫn hiện hành', 'Chi cục Kiểm dịch thực vật vùng (Cục Trồng trọt và BVTV)', 'Từng lô, khi nước nhập khẩu yêu cầu', '4'],
    ['19', 'Chứng nhận hữu cơ, Rainforest Alliance, Fairtrade (tùy chọn)', 'NĐ 109/2018/NĐ-CP; TCVN 11041; Quy định (EU) 2018/848', 'Tổ chức chứng nhận được chỉ định / tổ chức quốc tế', 'Theo chương trình', '4']
  ], { size: 18, center: [0, 5] }),
  PB());

/* ---------- 3. Danh mục văn bản ---------- */
const VB = (title, rows) => [H2(title), T([2.1, 3.6, 2.6], [['Số hiệu', 'Nội dung chính', 'Áp dụng cho Heragrain'], ...rows], { size: 19 }), GAP()];
add(H1('3. Danh mục văn bản pháp luật, tiêu chuẩn hiện hành'),
  P('Tình trạng hiệu lực ghi theo kết quả tra cứu đến 04/11/2026. Văn bản “đang tạm ngưng” hoặc “dự thảo” được ghi để theo dõi, chưa áp dụng.'),
  ...VB('3.1. Tổ chức, đăng ký hợp tác xã', [
    ['Luật Hợp tác xã số 17/2023/QH15', 'Tổ chức, quản trị HTX (Đại hội thành viên, Hội đồng quản trị, Giám đốc, Ban kiểm soát)', 'Bộ máy HTX, điều lệ, thành viên'],
    ['Nghị định 92/2024/NĐ-CP (18/7/2024)', 'Đăng ký tổ hợp tác, hợp tác xã, liên hiệp HTX', 'Hồ sơ thay đổi ngành nghề, địa điểm kinh doanh'],
    ['Nghị định 113/2024/NĐ-CP (hiệu lực 01/11/2024)', 'Quy định chi tiết Luật HTX', 'Quản trị, phân loại quy mô HTX'],
    ['Nghị định 125/2025/NĐ-CP', 'Phân định thẩm quyền chính quyền địa phương hai cấp (lĩnh vực tài chính, đăng ký kinh doanh)', 'Nộp hồ sơ đăng ký HTX tại cấp xã'],
    ['Quyết định 36/2025/QĐ-TTg (hiệu lực 15/11/2025)', 'Hệ thống ngành kinh tế Việt Nam, thay QĐ 27/2018', 'Mã ngành 10730, 46320, 46200…']]),
  ...VB('3.2. An toàn thực phẩm', [
    ['Luật An toàn thực phẩm số 55/2010/QH12', 'Điều kiện cơ sở sản xuất (Điều 19), chứng nhận cơ sở (Điều 34), trách nhiệm người sản xuất', 'Nền tảng cho mọi thủ tục ATTP'],
    ['Nghị định 15/2018/NĐ-CP', 'Tự công bố, đăng ký bản công bố, GCN cơ sở đủ điều kiện ATTP, phân công quản lý (Điều 36, các phụ lục)', '**Đang áp dụng**'],
    ['Nghị định 46/2026/NĐ-CP', 'Thay NĐ 15/2018', '**Đang tạm ngưng** (NQ 09/2026/NQ-CP, NQ 15/2026/NQ-CP)'],
    ['Thông tư 38/2018/TT-BNNPTNT; sửa đổi TT 32/2022, TT 17/2024, TT 17/2025/TT-BNNMT, TT 22/2026/TT-BNNMT', 'Thẩm định, chứng nhận cơ sở sản xuất, kinh doanh thực phẩm nông lâm thủy sản đủ điều kiện ATTP; mẫu đơn (Phụ lục V), thuyết minh (Phụ lục VI)', 'GCN ATTP cho xưởng ca cao; xin mẫu hiện hành tại Chi cục'],
    ['Thông tư 43/2018/TT-BCT; sửa đổi TT 13/2020/TT-BCT', 'Quản lý ATTP thuộc trách nhiệm Bộ Công Thương (bánh, mứt, kẹo)', 'Socola (nếu Sở Công Thương là đầu mối)'],
    ['Nghị định 115/2018/NĐ-CP; sửa đổi NĐ 124/2021/NĐ-CP', 'Xử phạt vi phạm hành chính về ATTP', 'Mức phạt khi thiếu GCN, nhãn sai, không tự công bố'],
    ['Thông tư 24/2019/TT-BYT; sửa đổi TT 17/2023/TT-BYT', 'Quản lý, sử dụng phụ gia thực phẩm', 'Lecithin, hương liệu trong socola (nếu dùng)'],
    ['QCVN 8-1:2011/BYT · QCVN 8-2:2011/BYT · QCVN 8-3:2012/BYT', 'Giới hạn độc tố vi nấm · kim loại nặng · vi sinh vật trong thực phẩm', 'Chỉ tiêu kiểm nghiệm khi tự công bố'],
    ['QCVN 12-1:2011/BYT', 'Bao bì, dụng cụ bằng nhựa tổng hợp tiếp xúc trực tiếp thực phẩm', 'Chọn túi nibs, bột; hồ sơ nhà cung cấp bao bì'],
    ['QCVN 01-1:2018/BYT (hoặc bản thay thế)', 'Chất lượng nước sạch dùng cho sinh hoạt', 'Nước rửa tay, vệ sinh dụng cụ']]),
  ...VB('3.3. Chất lượng, tiêu chuẩn, nhãn, mã vạch', [
    ['Luật Chất lượng sản phẩm, hàng hóa (sửa đổi) số 78/2025/QH15', 'Quản lý theo mức độ rủi ro; thông tin hàng hóa trên nền tảng số; hiệu lực 01/01/2026', 'Trách nhiệm người sản xuất; bán trên sàn TMĐT'],
    ['Luật Tiêu chuẩn và Quy chuẩn kỹ thuật (sửa đổi) số 70/2025/QH15', 'Xây dựng, áp dụng tiêu chuẩn cơ sở (TCCS), quy chuẩn; hiệu lực 01/01/2026', 'Ban hành TCCS cho nibs, socola, bột, bơ'],
    ['Nghị định 37/2026/NĐ-CP (23/01/2026)', 'Hướng dẫn Luật Chất lượng: mã số mã vạch (Điều 24–31, Phụ lục VII), nhãn hàng hóa; thay NĐ 43/2017, 111/2021', 'Nhãn, mã vạch mọi sản phẩm'],
    ['TCVN 7518:2005', 'Hạt ca cao – thuật ngữ và định nghĩa', 'Dùng đúng thuật ngữ trong hợp đồng'],
    ['TCVN 7519:2020 (ISO 2451:2017)', 'Hạt ca cao – yêu cầu chất lượng và đặc tính kỹ thuật (độ ẩm, cut test, phân hạng)', 'Tiêu chí nhận hạt, hợp đồng thu mua'],
    ['TCVN ISO 22000:2018', 'Hệ thống quản lý an toàn thực phẩm', 'Chứng nhận GĐ3'],
    ['Codex CXS 87-1981 · CXS 105-1981 · CXS 86-1981 · CXS 141-1983', 'Socola và sản phẩm socola · bột ca cao · bơ ca cao · khối, bánh ca cao', 'Căn cứ xây dựng TCCS, tên gọi sản phẩm'],
    ['Codex CXC 1-1969 · CXC 80-2020', 'Nguyên tắc chung vệ sinh thực phẩm, HACCP · quản lý chất gây dị ứng', 'Bố trí xưởng, HACCP, socola mắc ca']]),
  ...VB('3.4. Sở hữu trí tuệ', [
    ['Luật Sở hữu trí tuệ 2005, sửa đổi 2009, 2019, 2022 và 131/2025/QH15 (hiệu lực 01/4/2026)', 'Đăng ký, bảo hộ nhãn hiệu; thẩm định nội dung 5 tháng', 'Nhãn hiệu Heragrain, logo chữ H'],
    ['Nghị định 65/2023/NĐ-CP', 'Hướng dẫn sở hữu công nghiệp, mẫu tờ khai (Phụ lục I)', 'Tờ khai đăng ký nhãn hiệu'],
    ['Thông tư 263/2016/TT-BTC; sửa đổi TT 63/2023/TT-BTC; văn bản giảm phí hiện hành', 'Phí, lệ phí sở hữu công nghiệp', 'Dự toán chi phí; kiểm tra mức giảm 50 % đến 31/12/2026']]),
  ...VB('3.5. Môi trường, phòng cháy, lao động', [
    ['Luật Bảo vệ môi trường số 72/2020/QH14; NĐ 08/2022/NĐ-CP sửa đổi NĐ 05/2025/NĐ-CP', 'Đăng ký môi trường; đối tượng miễn (Điều 32 NĐ 08/2022 đã sửa đổi)', 'Khí thải máy rang, nước thải vệ sinh, chất thải rắn'],
    ['Nghị định 131/2025/NĐ-CP', 'Thẩm quyền chính quyền địa phương hai cấp lĩnh vực nông nghiệp và môi trường (Điều 29: UBND cấp xã tiếp nhận đăng ký môi trường)', 'Nơi nộp đăng ký môi trường'],
    ['Luật PCCC và CNCH số 55/2024/QH15; NĐ 105/2025/NĐ-CP', 'Danh mục cơ sở quản lý PCCC (Phụ lục I), thẩm định thiết kế (Phụ lục III), hồ sơ quản lý', 'Máy rang, tủ điện, kho bao bì'],
    ['Bộ luật Lao động số 45/2019/QH14', 'Hợp đồng, nội quy lao động (đăng ký khi có từ 10 người lao động)', 'Từ GĐ1 (9–10 người)'],
    ['Luật An toàn, vệ sinh lao động số 84/2015/QH13; NĐ 44/2016/NĐ-CP', 'Huấn luyện ATVSLĐ, kiểm định thiết bị có yêu cầu nghiêm ngặt, khám sức khỏe định kỳ', 'Máy rang, máy ép thủy lực, máy nén khí']]),
  ...VB('3.6. Nông nghiệp, vùng nguyên liệu, hữu cơ, OCOP', [
    ['Luật Trồng trọt số 31/2018/QH14', 'Sản xuất, chế biến, thương mại sản phẩm cây trồng', 'Liên kết vùng nguyên liệu ca cao'],
    ['Nghị định 98/2018/NĐ-CP', 'Chính sách khuyến khích liên kết sản xuất và tiêu thụ nông sản', 'Hợp đồng liên kết với HTX trồng ca cao, hỗ trợ dự án liên kết'],
    ['Nghị định 109/2018/NĐ-CP; TCVN 11041', 'Nông nghiệp hữu cơ; tiêu chuẩn sản xuất, chứng nhận hữu cơ', 'Tùy chọn GĐ4'],
    ['Quyết định 148/QĐ-TTg (24/02/2023)', 'Bộ tiêu chí, quy trình đánh giá, phân hạng sản phẩm OCOP', 'Socola, bột ca cao, hộp quà (tùy chọn)']]),
  ...VB('3.7. Thương mại, xuất khẩu và thị trường nước ngoài', [
    ['Luật Quản lý ngoại thương số 05/2017/QH14; NĐ 31/2018/NĐ-CP', 'Xuất xứ hàng hóa, cấp C/O', 'C/O từng lô'],
    ['Thông tư 11/2020/TT-BCT', 'Quy tắc xuất xứ trong EVFTA; mẫu EUR.1', 'Hưởng thuế ưu đãi vào EU'],
    ['Quy định (EU) 2023/1115 (EUDR); sửa đổi (EU) 2024/3234, (EU) 2025/2650', 'Sản phẩm không gây phá rừng: ca cao và sản phẩm ca cao (HS 1801–1806)', 'Tọa độ vườn, chứng minh không phá rừng sau 31/12/2020'],
    ['Quy định (EU) 852/2004 · 1169/2011 · 2023/915 · 396/2005; Chỉ thị 2000/36/EC; Quy định (EU) 2025/40 (PPWR)', 'Vệ sinh (HACCP) · nhãn thực phẩm · chất nhiễm bẩn (cadimi trong socola, bột ca cao) · dư lượng thuốc BVTV · tên gọi sản phẩm ca cao, socola · bao bì', 'Hồ sơ cho người mua EU'],
    ['Lệnh 280 GACC (từ 01/6/2026); Thông báo 27/2026; Thông báo 219/2025', 'Đăng ký cơ sở sản xuất thực phẩm nước ngoài; hạt chưa rang quản lý như nông sản sơ cấp', 'Bán sang Trung Quốc'],
    ['Tiêu chuẩn Trung Quốc GB 7718, GB 2762, GB 9678.2 (tham khảo)', 'Nhãn thực phẩm bao gói sẵn; chất nhiễm bẩn; socola và sản phẩm socola', 'Xác nhận phiên bản hiện hành với nhà nhập khẩu']]),
  PB());

/* ---------- 4. Hướng dẫn từng thủ tục ---------- */
const TT = (title, rows, notes) => [H2(title), T([1.25, 4.2], rows.map((r) => r), { head: false, boldFirst: true, size: 21 }), ...(notes ? [GAP(), NOTE(notes)] : []), GAP()];
add(H1('4. Hướng dẫn từng thủ tục'),
  ...TT('4.1. Bổ sung ngành nghề kinh doanh của HTX', [
    ['Khi nào', 'Ngay đầu GĐ1, trước khi xin GCN ATTP (GCN ghi đúng ngành nghề, địa điểm sản xuất).'],
    ['Ngành nghề', '10730 Sản xuất ca cao, sôcôla và bánh kẹo; 46320 Bán buôn thực phẩm; 46200 Bán buôn nông, lâm sản nguyên liệu (trừ gỗ, tre, nứa) và động vật sống; 47220 Bán lẻ thực phẩm trong cửa hàng chuyên doanh (nếu có góc bán lẻ); 82920 Dịch vụ đóng gói (nếu nhận đóng gói thuê). Đối chiếu mã đầy đủ theo QĐ 36/2025/QĐ-TTg.'],
    ['Nơi nộp', 'Cơ quan đăng ký kinh doanh cấp xã nơi HTX đặt trụ sở (cơ quan đã cấp Giấy chứng nhận đăng ký HTX ngày 22/9/2025); trực tiếp hoặc trực tuyến.'],
    ['Hồ sơ', 'Thông báo thay đổi nội dung đăng ký HTX (mẫu theo NĐ 92/2024/NĐ-CP và văn bản hướng dẫn); nghị quyết, biên bản họp Hội đồng quản trị hoặc Đại hội thành viên về việc bổ sung ngành nghề; giấy ủy quyền nếu người khác đi nộp.'],
    ['Lưu ý', 'Nếu xưởng sản xuất không trùng địa chỉ trụ sở, đăng ký thêm **địa điểm kinh doanh** cho xưởng cũ để địa chỉ trên GCN ATTP, nhãn sản phẩm và hồ sơ GACC thống nhất.']]),
  ...TT('4.2. Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm', [
    ['Ai phải làm', 'Cơ sở sản xuất thực phẩm, trừ các trường hợp miễn tại Điều 12 NĐ 15/2018 (ví dụ cơ sở đã có HACCP, ISO 22000, FSSC 22000, BRC… còn hiệu lực).'],
    ['Nơi nộp', 'Ca cao, nibs, bột, bơ: Chi cục Quản lý chất lượng nông lâm sản và thủy sản – Sở Nông nghiệp và Môi trường Đắk Lắk (hoặc qua Trung tâm Phục vụ hành chính công tỉnh). Socola: Sở Công Thương nếu không chốt được một đầu mối.'],
    ['Hồ sơ (ngành NN&MT)', '(1) Đơn đề nghị cấp Giấy chứng nhận (Phụ lục V TT 38/2018/TT-BNNPTNT – xem BM-02); (2) Bản thuyết minh điều kiện cơ sở vật chất, trang thiết bị, dụng cụ (Phụ lục VI – xem BM-03). Chuẩn bị sẵn để xuất trình khi thẩm định: giấy xác nhận sức khỏe, tập huấn ATTP của người trực tiếp sản xuất (BM-04), hồ sơ nguồn nước, kiểm soát côn trùng, sơ đồ mặt bằng.'],
    ['Trình tự', 'Nộp hồ sơ → cơ quan kiểm tra tính hợp lệ → thẩm định thực tế tại xưởng (đoàn thẩm định, biên bản) → cấp GCN nếu đạt; nếu chưa đạt, cơ sở khắc phục rồi đề nghị thẩm định lại.'],
    ['Thời hạn, phí', 'Khoảng 15 ngày làm việc kể từ khi nhận đủ hồ sơ hợp lệ; phí thẩm định theo quy định (Chi cục Đắk Lắk công bố 700.000 đồng/cơ sở với cơ sở nông lâm thủy sản). GCN có hiệu lực 3 năm; nộp hồ sơ cấp lại trước khi hết hạn 6 tháng.'],
    ['Điểm thẩm định với xưởng ca cao', 'Dòng một chiều, tách kho hạt thô với khu sạch; chụp hút, ống khói máy rang; lưới chắn côn trùng (mọt ca cao); kho thành phẩm cách tường, cách sàn; khu rửa tay; hồ sơ CCP rang; kiểm soát dị vật kim loại.']],
    ['Tham khảo: sơ đồ 3D (3-so-do-3d) và tham quan 360° (4-tham-quan-360) kèm theo dùng làm **sơ đồ mặt bằng, mô tả dòng chảy** khi lập bản thuyết minh.']),
  ...TT('4.3. Kiểm nghiệm và tự công bố sản phẩm', [
    ['Sản phẩm cần tự công bố', 'GĐ1: hạt ca cao rang, nibs ca cao rang (bán trong nước). GĐ2: socola đen 70 %, 80 %, 100 %. GĐ3: bột ca cao, bơ ca cao. GĐ4: socola mix vị, trái cây sấy bọc socola, trà vỏ ca cao. Sản phẩm chỉ dùng cho sản xuất nội bộ hoặc gia công hàng xuất khẩu được miễn (Điều 4 NĐ 15/2018).'],
    ['Hồ sơ', '(1) Bản tự công bố sản phẩm (Mẫu số 01 Phụ lục I NĐ 15/2018 – xem BM-01); (2) Phiếu kết quả kiểm nghiệm trong vòng 12 tháng, do phòng kiểm nghiệm được chỉ định hoặc công nhận ISO/IEC 17025, gồm các chỉ tiêu an toàn theo quy chuẩn kỹ thuật hoặc quy định của Bộ Y tế. Tài liệu bằng tiếng Việt (tài liệu tiếng nước ngoài phải dịch, công chứng).'],
    ['Trình tự', 'Tự công bố trên phương tiện thông tin đại chúng, trang thông tin điện tử của HTX hoặc niêm yết tại trụ sở, và trên Hệ thống thông tin dữ liệu về ATTP; đồng thời nộp 01 bản qua bưu điện hoặc trực tiếp đến cơ quan do UBND tỉnh Đắk Lắk chỉ định. **Được sản xuất, kinh doanh ngay** sau khi tự công bố.'],
    ['Chỉ tiêu gợi ý', 'Cảm quan, độ ẩm, chất béo (bơ, bột); vi sinh (tổng vi sinh vật hiếu khí, Coliforms, E. coli, Salmonella, nấm men – nấm mốc); kim loại nặng (chì, cadimi); độc tố vi nấm (aflatoxin, ochratoxin A). Chốt danh mục chỉ tiêu với phòng kiểm nghiệm theo QCVN 8-1, 8-2, 8-3 và thị trường đích (EU: cadimi theo Quy định (EU) 2023/915).'],
    ['Khi nào công bố lại', 'Khi đổi tên sản phẩm, thành phần, xuất xứ, tổ chức chịu trách nhiệm hoặc cơ sở sản xuất.']]),
  ...TT('4.4. Nhãn hàng hóa', [
    ['Căn cứ', 'Nghị định 37/2026/NĐ-CP (thay NĐ 43/2017, 111/2021); nhãn in trước ngày NĐ có hiệu lực được dùng tiếp không quá 2 năm.'],
    ['Nội dung bắt buộc với thực phẩm', 'Tên sản phẩm; tên, địa chỉ tổ chức chịu trách nhiệm (HTX Heragrain); xuất xứ; định lượng; ngày sản xuất; hạn sử dụng; thành phần (thành phần định lượng với thành phần nêu trên tên, ví dụ “socola 70 % ca cao”); thông tin, cảnh báo (chất gây dị ứng: mắc ca, sữa nếu có); hướng dẫn sử dụng, bảo quản; mã lô. Đối chiếu danh mục chi tiết tại phụ lục NĐ 37/2026.'],
    ['Lưu ý ca cao', 'Không ghi “100 % tự nhiên”, “không chất bảo quản” nếu chưa có kết quả kiểm nghiệm chứng minh; tên “socola” chỉ dùng khi đạt hàm lượng chất khô ca cao theo tiêu chuẩn áp dụng; ghi “socola đen 70 %” nghĩa là 70 % chất khô ca cao. Xuất khẩu: nhãn EU theo Quy định (EU) 1169/2011, nhãn Trung Quốc theo GB 7718 và in mã đăng ký GACC (xem BM-09).']]),
  ...TT('4.5. Mã số mã vạch', [
    ['Nơi nộp', 'GS1 Việt Nam – nộp trực tuyến tại vnpc.gs1.gov.vn; hồ sơ theo NĐ 37/2026/NĐ-CP (mẫu Phụ lục VII).'],
    ['Hồ sơ', 'Đơn đăng ký sử dụng mã số mã vạch; bản sao Giấy chứng nhận đăng ký HTX; danh mục sản phẩm sử dụng mã GTIN (BM-09 có bảng gợi ý).'],
    ['Chi phí', 'Phí cấp mã doanh nghiệp và phí duy trì hằng năm theo số lượng mã đăng ký; kiểm tra biểu phí hiện hành trước khi nộp.'],
    ['Gợi ý', 'Đăng ký loại mã đủ cho khoảng 20–50 sản phẩm (nibs, 3–4 loại socola, bột, bơ, mix vị, hộp quà, các quy cách bao bì). Mỗi quy cách bao bì một mã GTIN. Kết nối mã GTIN với mã lô và QR truy xuất.']]),
  ...TT('4.6. Đăng ký nhãn hiệu “Heragrain”', [
    ['Nơi nộp', 'Cục Sở hữu trí tuệ (Bộ Khoa học và Công nghệ), nộp trực tuyến qua Cổng dịch vụ công của Cục (ipvietnam.gov.vn).'],
    ['Hồ sơ', 'Tờ khai đăng ký nhãn hiệu (mẫu tại Phụ lục I NĐ 65/2023/NĐ-CP); mẫu nhãn hiệu (chữ “Heragrain” và logo chữ H hai lá); danh mục hàng hóa theo bảng phân loại Nice; chứng từ nộp phí.'],
    ['Nhóm hàng hóa gợi ý', 'Nhóm 30: ca cao, sản phẩm ca cao, socola, đồ uống từ ca cao, trà (trà vỏ ca cao). Nhóm 29: bơ ca cao dùng cho thực phẩm, trái cây sấy, hạt chế biến. Nhóm 31: hạt ca cao thô, chưa chế biến. Nhóm 35: mua bán, bán lẻ thực phẩm. (Nhóm 3 nếu sau này làm mỹ phẩm từ bơ ca cao.)'],
    ['Thời hạn', 'Thẩm định hình thức khoảng 1 tháng; công bố đơn; thẩm định nội dung 5 tháng theo Luật sửa đổi 2025. Văn bằng hiệu lực 10 năm, gia hạn nhiều lần.'],
    ['Xuất khẩu', 'Trung Quốc xét nguyên tắc nộp đơn trước: nên nộp sớm tại Trung Quốc (trực tiếp hoặc qua Hệ thống Madrid) trước khi chào hàng; EU: nhãn hiệu Liên minh châu Âu (EUIPO) hoặc qua Madrid.']]),
  ...TT('4.7. Đăng ký môi trường, PCCC, lao động', [
    ['Đăng ký môi trường', 'Nộp UBND cấp xã trước khi vận hành (mẫu đăng ký môi trường kèm NĐ 08/2022 đã sửa đổi). Nội dung chính: công suất (kg hạt/ngày), khí thải máy rang (chụp hút, cyclone, ống khói), bụi vỏ lụa, nước thải vệ sinh, chất thải rắn (vỏ lụa bán làm phân bón, than sinh học). Kiểm tra trường hợp được miễn tại Điều 32 NĐ 08/2022 (đã sửa đổi).'],
    ['PCCC', 'Hỏi Công an cấp xã xưởng có thuộc Phụ lục I NĐ 105/2025 hay không. Dù không thuộc danh mục vẫn cần: bình chữa cháy cạnh máy rang và tủ điện, nội quy, biển báo, lối thoát nạn, huấn luyện; khuyến nghị máy rang điện để không trữ bình gas trong khu dân cư.'],
    ['Lao động, ATVSLĐ', 'Hợp đồng lao động, BHXH; nội quy lao động đăng ký tại Sở Nội vụ khi có từ 10 người lao động; huấn luyện ATVSLĐ theo NĐ 44/2016; kiểm định thiết bị có yêu cầu nghiêm ngặt (bình khí nén, bình áp lực nếu có); khám sức khỏe định kỳ, khám trước khi bố trí làm việc.']]),
  ...TT('4.8. HACCP hoặc ISO 22000:2018 (GĐ3)', [
    ['Lợi ích', 'Được miễn GCN cơ sở đủ điều kiện ATTP khi chứng chỉ còn hiệu lực (Điều 12 NĐ 15/2018); điều kiện tối thiểu của người mua xuất khẩu.'],
    ['Các bước', 'Thành lập đội HACCP → mô tả sản phẩm, sơ đồ quy trình 11 bước → phân tích mối nguy → xác định CCP (rang; dò kim loại) → giới hạn tới hạn, giám sát, hành động khắc phục → chương trình tiên quyết (vệ sinh, côn trùng, nước, đào tạo, nhà cung cấp, dị ứng) → đánh giá nội bộ → mời tổ chức chứng nhận đánh giá.'],
    ['Tổ chức chứng nhận', 'Chọn tổ chức đã đăng ký hoạt động chứng nhận hệ thống quản lý ATTP theo quy định về điều kiện kinh doanh dịch vụ đánh giá sự phù hợp; yêu cầu báo giá ít nhất 3 đơn vị.'],
    ['Hỗ trợ', 'Đắk Lắk có chương trình hỗ trợ doanh nghiệp nhỏ và vừa đạt ISO 22000/HACCP (thông tin năm 2026); hỏi Sở Nông nghiệp và Môi trường, Sở Khoa học và Công nghệ.']]),
  ...TT('4.9. Xuất khẩu: EUDR, GACC, C/O (GĐ4)', [
    ['EUDR (EU)', 'Nhà nhập khẩu EU là “nhà vận hành” nộp tuyên bố thẩm định trên hệ thống thông tin của EU. Heragrain phải cung cấp: tọa độ từng vườn (điểm với vườn ≤ 4 ha, đa giác với vườn > 4 ha), thời gian thu hoạch, bằng chứng đất không bị phá rừng sau 31/12/2020, bằng chứng sản xuất hợp pháp (quyền sử dụng đất, lao động…). Thu thập ngay từ GĐ1 qua BM-05, BM-08.'],
    ['GACC (Trung Quốc)', 'Đăng ký cơ sở trên hệ thống CIFER trước khi xuất lô đầu. Hạt ca cao chưa rang không còn trong danh mục 17 nhóm của Lệnh 280, được quản lý như nông sản sơ cấp (Thông báo 219/2025). Với socola, bột, bơ ca cao: xác nhận nhóm sản phẩm, hình thức tự đăng ký hay qua cơ quan Việt Nam giới thiệu (hỏi Văn phòng SPS Việt Nam, nhà nhập khẩu). Thay đổi lớn (địa điểm, người đại diện) có thể phải đăng ký lại.'],
    ['C/O', 'Đăng ký tài khoản eCoSys (ecosys.gov.vn) của Bộ Công Thương; EU: EUR.1 theo EVFTA (TT 11/2020/TT-BCT); Trung Quốc: mẫu E (ACFTA) hoặc RCEP. Mã HS tham khảo: 1801 hạt ca cao; 1802 vỏ ca cao; 1803 khối ca cao; 1804 bơ ca cao; 1805 bột ca cao không đường; 1806 socola và chế phẩm có ca cao.'],
    ['Chứng từ mỗi lô', 'Hợp đồng, hóa đơn, phiếu đóng gói, vận đơn, tờ khai hải quan, phiếu kiểm nghiệm lô (COA), C/O; thêm giấy chứng nhận kiểm dịch thực vật nếu xuất hạt chưa rang và nước nhập khẩu yêu cầu.']]),
  PB());

/* ---------- 5. Biểu mẫu ---------- */
add(H1('5. Biểu mẫu soạn sẵn cho Heragrain'),
  P('Phần chữ nghiêng màu xanh là thông tin gợi ý đã điền sẵn cho Heragrain; dòng chấm để điền. **BM-01, BM-02, BM-03 dựng theo khung mẫu của văn bản pháp luật**, cần đối chiếu mẫu hiện hành do cơ quan tiếp nhận cung cấp trước khi nộp. BM-04 đến BM-09 là biểu mẫu nội bộ.'),
  T([0.8, 3.2, 2.4], [['Mã', 'Biểu mẫu', 'Dùng khi'],
    ['BM-01', 'Bản tự công bố sản phẩm (khung Mẫu số 01 Phụ lục I NĐ 15/2018)', 'Tự công bố từng sản phẩm'],
    ['BM-02', 'Đơn đề nghị cấp GCN cơ sở đủ điều kiện ATTP (khung Phụ lục V TT 38/2018)', 'Xin GCN ATTP'],
    ['BM-03', 'Bản thuyết minh điều kiện cơ sở (khung Phụ lục VI TT 38/2018)', 'Kèm BM-02'],
    ['BM-04', 'Danh sách người lao động khám sức khỏe, tập huấn ATTP', 'Kèm hồ sơ GCN; lưu hằng năm'],
    ['BM-05', 'Hợp đồng nguyên tắc mua bán hạt ca cao lên men', 'Ký với HTX, nông hộ'],
    ['BM-06', 'Phiếu kiểm nhận lô hạt ca cao (độ ẩm, cut test)', 'Mỗi lô nhập'],
    ['BM-07', 'Nhật ký rang (CCP 1)', 'Mỗi mẻ rang'],
    ['BM-08', 'Phiếu thông tin vườn (truy xuất, EUDR)', 'Mỗi vườn cung cấp hạt'],
    ['BM-09', 'Bảng kiểm nhãn sản phẩm và danh mục mã GTIN', 'Trước khi in bao bì']], { size: 20, center: [0] }),
  PB());

// BM-01
add(P('BM-01', { bold: true, color: VANG, align: AlignmentType.LEFT }), DO('Khung theo Mẫu số 01, Phụ lục I, Nghị định 15/2018/NĐ-CP. Ví dụ điền cho sản phẩm nibs ca cao rang.'),
  ...QH(), FT('BẢN TỰ CÔNG BỐ SẢN PHẨM'), P('Số: ……/HERAGRAIN/20…', { align: AlignmentType.CENTER }),
  P('**I. Thông tin về tổ chức, cá nhân tự công bố sản phẩm**', { align: AlignmentType.LEFT }),
  FL('Tên tổ chức, cá nhân:', 'HỢP TÁC XÃ HERAGRAIN'), FL('Địa chỉ:', '[địa chỉ trụ sở HTX], tỉnh Đắk Lắk'),
  FL('Điện thoại: …………………  Fax: …………………  E-mail:'), FL('Mã số doanh nghiệp (mã số HTX):'),
  FL('Số Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm:'), FL('Ngày cấp/Nơi cấp:', '(đối với cơ sở thuộc đối tượng phải cấp)'),
  P('**II. Thông tin về sản phẩm**', { align: AlignmentType.LEFT, before: 120 }),
  FL('1. Tên sản phẩm:', 'Nibs ca cao rang Heragrain (Roasted Cocoa Nibs)'),
  FL('2. Thành phần:', '100 % nhân hạt ca cao lên men, rang (Đắk Lắk)'),
  FL('3. Thời hạn sử dụng sản phẩm:', '12 tháng kể từ ngày sản xuất (xác định theo nghiên cứu hạn dùng)'),
  FL('4. Quy cách đóng gói và chất liệu bao bì:', 'Túi zip PE/PET ghép màng 200 g; bao PP lót PE 25 kg'),
  FL('5. Tên và địa chỉ cơ sở sản xuất sản phẩm:', '(trường hợp thuê cơ sở sản xuất)'),
  P('**III. Mẫu nhãn sản phẩm** (đính kèm mẫu nhãn sản phẩm hoặc mẫu nhãn sản phẩm dự kiến)', { align: AlignmentType.LEFT, before: 120 }),
  P('**IV. Yêu cầu về an toàn thực phẩm**', { align: AlignmentType.LEFT, before: 120 }),
  P('Tổ chức, cá nhân sản xuất, kinh doanh thực phẩm đạt yêu cầu an toàn thực phẩm theo:'),
  FL('', 'QCVN 8-1:2011/BYT; QCVN 8-2:2011/BYT; QCVN 8-3:2012/BYT; tiêu chuẩn cơ sở TCCS …:20…/HERAGRAIN'),
  P('Chúng tôi xin cam kết thực hiện đầy đủ các quy định của pháp luật về an toàn thực phẩm và hoàn toàn chịu trách nhiệm về tính pháp lý của hồ sơ công bố và chất lượng, an toàn thực phẩm đối với sản phẩm đã công bố.', { before: 120 }),
  ...SIGN('ĐẠI DIỆN TỔ CHỨC, CÁ NHÂN'), PB());

// BM-02
add(P('BM-02', { bold: true, color: VANG, align: AlignmentType.LEFT }), DO('Khung theo Phụ lục V, Thông tư 38/2018/TT-BNNPTNT (đã sửa đổi). Xin mẫu hiện hành tại Chi cục trước khi nộp.'),
  ...QH(), FT('ĐƠN ĐỀ NGHỊ CẤP/CẤP LẠI GIẤY CHỨNG NHẬN', { after: 0 }), FT('CƠ SỞ ĐỦ ĐIỀU KIỆN AN TOÀN THỰC PHẨM', { before: 0 }),
  P('Kính gửi: **Chi cục Quản lý chất lượng nông lâm sản và thủy sản – Sở Nông nghiệp và Môi trường tỉnh Đắk Lắk**', { align: AlignmentType.CENTER }),
  FL('1. Tên cơ sở:', 'HỢP TÁC XÃ HERAGRAIN – Xưởng chế biến ca cao'), FL('2. Mã số (nếu có):'),
  FL('3. Địa chỉ cơ sở sản xuất, kinh doanh:', '[địa chỉ xưởng], tỉnh Đắk Lắk'), FL('4. Điện thoại: ……………… Fax: ……………… Email:'),
  FL('5. Giấy chứng nhận đăng ký HTX số: ……………… ngày cấp: 22/9/2025 nơi cấp:'),
  FL('6. Mặt hàng sản xuất, kinh doanh:', 'Hạt ca cao rang, nibs ca cao; khối ca cao, socola; bột ca cao, bơ ca cao (theo giai đoạn)'),
  FL('7. Công suất thiết kế:', '100–200 kg hạt ca cao/ngày (1 ca)'),
  P('Đề nghị Quý cơ quan thẩm định, cấp/cấp lại Giấy chứng nhận cơ sở đủ điều kiện an toàn thực phẩm cho cơ sở.', { before: 120 }),
  FL('Lý do cấp lại (nếu có):'),
  P('Hồ sơ gửi kèm: Bản thuyết minh điều kiện cơ sở (BM-03); sơ đồ mặt bằng, dòng chảy sản xuất; danh sách khám sức khỏe, tập huấn ATTP (BM-04).', { italics: true }),
  ...SIGN('ĐẠI DIỆN CƠ SỞ'), PB());

// BM-03
add(P('BM-03', { bold: true, color: VANG, align: AlignmentType.LEFT }), DO('Khung theo Phụ lục VI, Thông tư 38/2018/TT-BNNPTNT. Nội dung gợi ý lấy từ sơ đồ 3D xưởng ca cao (3-so-do-3d).'),
  ...QH(), FT('BẢN THUYẾT MINH VỀ ĐIỀU KIỆN BẢO ĐẢM AN TOÀN THỰC PHẨM', { size: 26 }),
  P('**I. Thông tin chung**', { align: AlignmentType.LEFT }),
  FL('Tên cơ sở:', 'HỢP TÁC XÃ HERAGRAIN – Xưởng chế biến ca cao'), FL('Địa chỉ:'), FL('Số lao động trực tiếp:', '9–10 người (GĐ1)'),
  FL('Sản phẩm:', 'Hạt ca cao rang, nibs; (GĐ2) socola; (GĐ3) bột, bơ ca cao'),
  P('**II. Điều kiện cơ sở vật chất, trang thiết bị, dụng cụ**', { align: AlignmentType.LEFT, before: 120 }),
  T([2.0, 4.4, 1.2], [['Hạng mục', 'Mô tả hiện trạng (gợi ý)', 'Tự đánh giá'],
    ['Địa điểm, môi trường', 'Xưởng cũ 5 phòng (khoảng 149 m²) và lối đi có mái; vào qua nhà ở, sân sau có mái; không gần nguồn ô nhiễm (cần xác nhận)', 'Đạt/Chưa'],
    ['Bố trí dòng chảy', 'Một chiều: phòng 1 kho hạt, kiểm nhận → phòng 2 rang, tách vỏ → phòng 3 nibs, nghiền, ép → nửa tây phòng 5 khu sạch → nửa đông phòng 5 kho mát; bịt cửa phòng 2 – phòng 5', ''],
    ['Kết cấu nhà xưởng', 'Tường ốp gạch men/sơn chống thấm, sàn epoxy dễ vệ sinh, trần kín khu sạch; cửa có rèm nhựa, lưới chắn côn trùng', ''],
    ['Thông gió, khí thải', 'Chụp hút trên máy rang, cyclone thu vỏ lụa, ống khói vượt mái; điều hòa khu sạch 18–20 °C, kho 15–18 °C', ''],
    ['Chiếu sáng', 'Đèn có chụp chống vỡ ở khu chế biến', ''],
    ['Nước', 'Nguồn nước: ……; xét nghiệm theo QCVN nước sạch sinh hoạt; bồn rửa tay ở phòng thay đồ, trạm rửa tay vào khu sạch', ''],
    ['Thiết bị, dụng cụ', 'Máy rang trống, máy tách vỏ, sàng, máy hàn túi (GĐ1); máy nghiền đá, máy tôi, khuôn polycarbonate, tủ mát (GĐ2); máy ép, máy nghiền bột, máy dò kim loại (GĐ3); bề mặt tiếp xúc bằng inox thực phẩm', ''],
    ['Kho', 'Kho hạt trên pallet cách tường 0,5 m; kho thành phẩm mát; bao bì để kệ riêng; hóa chất vệ sinh tủ khóa riêng', ''],
    ['Kiểm soát côn trùng', 'Bẫy, lưới chắn; theo dõi mọt ca cao; hợp đồng dịch vụ (nếu có)', ''],
    ['Vệ sinh cá nhân', 'Phòng 6 ngăn làm nhà vệ sinh và phòng thay bảo hộ; bảo hộ lao động; khám sức khỏe, tập huấn ATTP', ''],
    ['Chất thải', 'Vỏ lụa thu gom vào bao, bán làm phân bón/than sinh học; rác thải có thùng nắp đậy; nước thải vệ sinh qua bể tự hoại', ''],
    ['Hồ sơ', 'Phiếu kiểm nhận (BM-06), nhật ký rang (BM-07), truy xuất lô, phiếu kiểm nghiệm, sổ vệ sinh', '']], { size: 19 }),
  ...SIGN('ĐẠI DIỆN CƠ SỞ'), PB());

// BM-04
add(P('BM-04', { bold: true, color: VANG, align: AlignmentType.LEFT }), FT('DANH SÁCH NGƯỜI LAO ĐỘNG KHÁM SỨC KHỎE, TẬP HUẤN KIẾN THỨC ATTP', { size: 24 }),
  FL('Cơ sở:', 'HỢP TÁC XÃ HERAGRAIN – Xưởng chế biến ca cao'), FL('Năm:'),
  T([0.5, 2.2, 1.6, 1.6, 1.6, 1.6, 1.2], [['TT', 'Họ và tên', 'Vị trí', 'Ngày khám sức khỏe', 'Nơi khám, kết quả', 'Ngày tập huấn ATTP', 'Ghi chú'],
    ['1', '', 'Giám đốc điều hành', '', '', '', ''], ['2', '', 'Trưởng QA', '', '', '', ''], ['3', '', 'Vận hành máy rang', '', '', '', ''],
    ['4', '', 'Tách vỏ, đóng gói nibs', '', '', '', ''], ['5', '', 'Thủ kho', '', '', '', ''], ['6', '', 'Thu mua', '', '', '', ''],
    ['7', '', '', '', '', '', ''], ['8', '', '', '', '', '', ''], ['9', '', '', '', '', '', ''], ['10', '', '', '', '', '', '']], { size: 19, center: [0] }),
  ...SIGN('NGƯỜI LẬP'), PB());

// BM-05
add(P('BM-05', { bold: true, color: VANG, align: AlignmentType.LEFT }), DO('Mẫu tham khảo, cần luật sư hoặc cán bộ pháp chế rà soát trước khi ký. Có thể dùng làm hợp đồng liên kết theo NĐ 98/2018/NĐ-CP.'),
  ...QH(), FT('HỢP ĐỒNG NGUYÊN TẮC MUA BÁN HẠT CA CAO LÊN MEN'), P('Số: ……/20…/HĐNT-HERAGRAIN', { align: AlignmentType.CENTER }),
  P('**Bên bán (Bên A):** ……………… (HTX/nông hộ trồng ca cao), địa chỉ ……………, đại diện ……………, mã số ……………'),
  P('**Bên mua (Bên B):** HỢP TÁC XÃ HERAGRAIN, địa chỉ ……………, đại diện ……………, mã số ……………'),
  ...NUM([
    '**Hàng hóa:** hạt ca cao đã lên men, phơi khô, có nguồn gốc từ các vườn liệt kê tại Phụ lục 1 (tên chủ vườn, xã, diện tích, tọa độ – theo BM-08).',
    '**Chất lượng nhận hàng (tham chiếu TCVN 7519:2020):** độ ẩm ≤ 7,5 %; cut test 300 hạt: hạt mốc ≤ …%, hạt đá (chưa lên men) ≤ …%, hạt sâu, nảy mầm, dẹt ≤ …%; số hạt/100 g ≤ …; không có côn trùng sống, tạp chất lạ, mùi khói, mùi lạ. Lô không đạt: hai bên thỏa thuận trả lại, phân loại lại hoặc giảm giá.',
    '**Quy trình sơ chế:** Bên A lên men trong thùng gỗ … ngày, đảo … lần; phơi trên giàn cách đất, có che mưa; không phơi trên đường, sân đất; dùng bao đay sạch, không dùng bao đã đựng phân bón, hóa chất. Bên B hướng dẫn quy trình, có quyền kiểm tra tại chỗ.',
    '**Vùng trồng, truy xuất, EUDR:** Bên A cam kết vườn không mở rộng bằng phá rừng sau ngày 31/12/2020, đất có quyền sử dụng hợp pháp; cung cấp tọa độ vườn, nhật ký phân bón, thuốc BVTV (chỉ dùng hoạt chất được phép); đồng ý cho Bên B lưu và chuyển dữ liệu này cho khách hàng, cơ quan quản lý phục vụ truy xuất, thẩm định.',
    '**Số lượng, giao nhận:** dự kiến … tấn/năm, giao theo đơn đặt hàng; giao tại ……; mỗi lô kèm phiếu giao hàng ghi vườn, ngày thu hoạch, ngày lên men, ngày phơi.',
    '**Giá và thanh toán:** giá theo từng lô = giá cơ sở (theo thỏa thuận hoặc tham chiếu giá thị trường) ± thưởng/trừ chất lượng theo kết quả cut test; thanh toán trong … ngày kể từ khi nhận đủ hàng, hóa đơn/chứng từ.',
    '**Hỗ trợ:** Bên B hỗ trợ kỹ thuật lên men, phơi, sổ nhật ký; ưu tiên thu mua sản lượng đạt chuẩn; có thể ứng trước vật tư theo thỏa thuận riêng.',
    '**Hiệu lực, chấm dứt, tranh chấp:** hợp đồng có hiệu lực … năm; chấm dứt khi một bên vi phạm nghiêm trọng cam kết chất lượng hoặc phá rừng; tranh chấp giải quyết bằng thương lượng, sau đó tại Tòa án có thẩm quyền.'], 'hd'),
  T([1, 1], [['ĐẠI DIỆN BÊN A', 'ĐẠI DIỆN BÊN B'], ['(Ký, ghi rõ họ tên, đóng dấu nếu có)\n\n\n\n', '(Ký, ghi rõ họ tên, đóng dấu)\n\n\n\n']], { size: 21, zebra: false, center: [0, 1] }),
  PB());

// BM-06
add(P('BM-06', { bold: true, color: VANG, align: AlignmentType.LEFT }), FT('PHIẾU KIỂM NHẬN LÔ HẠT CA CAO', { size: 26 }),
  T([1.4, 2.0, 1.4, 2.0], [['Thông tin lô', '', '', ''], ['Mã lô Heragrain', '', 'Ngày nhận', ''], ['Bên bán (HTX/nông hộ)', '', 'Mã vườn (BM-08)', ''],
    ['Số bao / khối lượng', '', 'Ngày lên men, phơi', ''], ['Tình trạng bao', '☐ Sạch, kín  ☐ Rách  ☐ Có mùi lạ', 'Côn trùng sống', '☐ Không  ☐ Có']], { size: 20 }),
  GAP(),
  T([2.6, 1.2, 1.4, 1.6], [['Chỉ tiêu', 'Kết quả', 'Yêu cầu', 'Đạt/Không đạt'],
    ['Độ ẩm (%)', '', '≤ 7,5', ''], ['Số hạt / 100 g', '', '≤ …', ''], ['Cut test 300 hạt: hạt lên men tốt (%)', '', '≥ …', ''],
    ['Hạt mốc (%)', '', '≤ …', ''], ['Hạt đá, chưa lên men (%)', '', '≤ …', ''], ['Hạt sâu, nảy mầm, dẹt (%)', '', '≤ …', ''],
    ['Tạp chất (%)', '', '≤ …', ''], ['Mùi khói, mùi lạ', '', 'Không', '']], { size: 20, center: [1, 2, 3] }),
  P('Kết luận: ☐ Nhận lô   ☐ Nhận có điều kiện (giảm giá/phân loại lại)   ☐ Trả lại   — Mẫu lưu: ☐ Có (mã mẫu: ………)', { before: 120 }),
  T([1, 1], [['Người kiểm nhận (QA)', 'Đại diện bên giao'], ['\n\n\n', '\n\n\n']], { size: 20, zebra: false, center: [0, 1] }),
  PB());

// BM-07
add(P('BM-07', { bold: true, color: VANG, align: AlignmentType.LEFT }), FT('NHẬT KÝ RANG HẠT CA CAO (CCP 1)', { size: 26 }),
  P('Giới hạn tới hạn (chốt bằng thẩm định quá trình): nhiệt độ hạt/buồng rang ≥ …… °C trong ≥ …… phút. Hành động khắc phục khi không đạt: giữ mẻ, rang bổ sung hoặc loại bỏ, ghi biên bản.', { size: 22 }),
  T([0.9, 1.0, 1.0, 0.9, 0.9, 0.9, 0.9, 1.4, 1.1], [['Ngày', 'Mã lô hạt', 'Mẻ số', 'KL vào (kg)', 'Nhiệt độ (°C)', 'Thời gian (phút)', 'KL ra (kg)', 'Cảm quan, ghi chú', 'Người rang / QA'],
    ['', '', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', '', ''],
    ['', '', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', '', ''], ['', '', '', '', '', '', '', '', '']], { size: 18 }),
  P('Thẩm tra hằng tuần (Trưởng QA): ………………………… Ngày: ……………', { before: 120 }),
  PB());

// BM-08
add(P('BM-08', { bold: true, color: VANG, align: AlignmentType.LEFT }), FT('PHIẾU THÔNG TIN VƯỜN CA CAO (TRUY XUẤT, EUDR)', { size: 26 }),
  T([2.2, 4.2], [['Thông tin', 'Nội dung'],
    ['Mã vườn', 'HG-……-……'], ['Chủ vườn / HTX', ''], ['Địa chỉ (xã, tỉnh)', '…………, tỉnh Đắk Lắk'],
    ['Diện tích (ha)', ''], ['Tọa độ', '☐ Một điểm (vườn ≤ 4 ha): vĩ độ ……… kinh độ ………\n☐ Đa giác (vườn > 4 ha): đính kèm file tọa độ các đỉnh (GeoJSON/KML)'],
    ['Giấy tờ đất', 'Số GCN quyền sử dụng đất/giấy tờ khác: ……………'], ['Năm trồng, giống', '…… · dòng ca cao ……'],
    ['Cây che bóng, xen canh', 'Cà phê / sầu riêng / cây khác: ……'], ['Hiện trạng đất trước 31/12/2020', '☐ Đã là đất nông nghiệp  ☐ Khác (ghi rõ, kèm ảnh vệ tinh nếu có)'],
    ['Phân bón, thuốc BVTV đã dùng (12 tháng)', ''], ['Sản lượng hạt khô dự kiến (tấn/năm)', ''], ['Chứng nhận vườn (nếu có)', '☐ VietGAP ☐ Hữu cơ ☐ Rainforest Alliance ☐ Khác'],
    ['Người khảo sát, ngày', '']], { size: 20, boldFirst: true }),
  P('Chủ vườn đồng ý cho HTX Heragrain lưu và cung cấp thông tin trên cho khách hàng, cơ quan quản lý để truy xuất nguồn gốc và thẩm định theo quy định.', { italics: true, before: 120 }),
  T([1, 1], [['Chủ vườn', 'Cán bộ thu mua Heragrain'], ['\n\n\n', '\n\n\n']], { size: 20, zebra: false, center: [0, 1] }),
  PB());

// BM-09
add(P('BM-09', { bold: true, color: VANG, align: AlignmentType.LEFT }), FT('BẢNG KIỂM NHÃN SẢN PHẨM VÀ DANH MỤC MÃ GTIN', { size: 26 }),
  T([3.2, 0.9, 0.9, 0.9, 2.1], [['Nội dung trên nhãn', 'Trong nước', 'EU', 'Trung Quốc', 'Ghi chú'],
    ['Tên sản phẩm (đúng tên gọi: socola, bột ca cao, bơ ca cao…)', '☐', '☐', '☐', 'Theo tiêu chuẩn áp dụng'],
    ['Tên, địa chỉ tổ chức chịu trách nhiệm', '☐', '☐', '☐', 'HTX Heragrain; nhà nhập khẩu (EU, TQ)'],
    ['Xuất xứ', '☐', '☐', '☐', '“Sản xuất tại Việt Nam”'],
    ['Định lượng', '☐', '☐', '☐', ''],
    ['Thành phần, thành phần định lượng (% ca cao)', '☐', '☐', '☐', ''],
    ['Chất gây dị ứng (mắc ca, sữa, đậu nành nếu có)', '☐', '☐', '☐', 'EU: in nổi bật trong thành phần'],
    ['Ngày sản xuất, hạn sử dụng, mã lô', '☐', '☐', '☐', ''],
    ['Hướng dẫn bảo quản, sử dụng', '☐', '☐', '☐', 'Socola: nơi khô mát dưới 20 °C'],
    ['Bảng giá trị dinh dưỡng', '☐ (khuyến khích)', '☐', '☐', ''],
    ['Mã vạch GTIN, QR truy xuất', '☐', '☐', '☐', ''],
    ['Mã đăng ký GACC', '', '', '☐', 'In trên bao bì trong và ngoài'],
    ['Ngôn ngữ', 'Tiếng Việt', 'Ngôn ngữ nước bán', 'Tiếng Trung', '']], { size: 19, center: [1, 2, 3] }),
  GAP(),
  T([0.8, 3.2, 1.4, 1.6], [['STT', 'Sản phẩm, quy cách', 'Giai đoạn', 'Mã GTIN (13 số)'],
    ['1', 'Nibs ca cao rang – túi 200 g', 'GĐ1', '893……'], ['2', 'Nibs ca cao rang – bao 25 kg', 'GĐ1', '893……'], ['3', 'Hộp mẫu 3 vùng × 100 g', 'GĐ1', '893……'],
    ['4', 'Socola đen 70 % – thanh 80 g', 'GĐ2', '893……'], ['5', 'Socola đen 80 % – thanh 80 g', 'GĐ2', '893……'], ['6', 'Socola 100 % – thanh 80 g', 'GĐ2', '893……'],
    ['7', 'Bột ca cao nguyên chất – 250 g', 'GĐ3', '893……'], ['8', 'Bơ ca cao thực phẩm – 200 g', 'GĐ3', '893……'],
    ['9', 'Socola cà phê Robusta – 80 g', 'GĐ4', '893……'], ['10', 'Chanh dây gừng bọc socola – 100 g', 'GĐ4', '893……'],
    ['11', 'Trà vỏ ca cao – 50 g', 'GĐ4', '893……'], ['12', 'Hộp quà Đại Ngàn', 'GĐ4', '893……']], { size: 19, center: [0, 2] }),
  PB());

/* ---------- 6. Danh bạ ---------- */
add(H1('6. Danh bạ cơ quan, đơn vị liên quan'),
  P('Địa chỉ, số điện thoại tra trên cổng thông tin của từng cơ quan hoặc Cổng Dịch vụ công quốc gia (dichvucong.gov.vn) tại thời điểm nộp; tài liệu này không ghi số điện thoại để tránh sai lệch sau sắp xếp bộ máy.'),
  T([2.6, 3.0, 1.6], [['Cơ quan, đơn vị', 'Việc liên quan', 'Kênh nộp, tra cứu'],
    ['UBND xã/phường nơi HTX đặt trụ sở (cơ quan đăng ký kinh doanh cấp xã; Trung tâm phục vụ hành chính công cấp xã)', 'Thay đổi đăng ký HTX, địa điểm kinh doanh; đăng ký môi trường; tiếp nhận hồ sơ OCOP', 'Trực tiếp; dichvucong.gov.vn'],
    ['Trung tâm Phục vụ hành chính công tỉnh Đắk Lắk', 'Tiếp nhận hồ sơ cấp tỉnh (GCN ATTP, tự công bố…)', 'Trực tiếp; cổng dịch vụ công tỉnh'],
    ['Sở Nông nghiệp và Môi trường Đắk Lắk – Chi cục Quản lý chất lượng nông lâm sản và thủy sản', 'GCN cơ sở đủ điều kiện ATTP (ca cao, nông sản); hướng dẫn tự công bố, hỗ trợ HACCP', 'Trang thông tin của Chi cục'],
    ['Sở Công Thương Đắk Lắk', 'ATTP nhóm bánh, mứt, kẹo (socola); xúc tiến thương mại', 'Trang thông tin của Sở'],
    ['Sở Y tế Đắk Lắk (Chi cục An toàn vệ sinh thực phẩm)', 'Hướng dẫn chung ATTP, tập huấn, phụ gia', 'Trang thông tin của Sở'],
    ['Sở Khoa học và Công nghệ Đắk Lắk', 'Tiêu chuẩn đo lường chất lượng, hỗ trợ sở hữu trí tuệ, đổi mới sáng tạo', 'Trang thông tin của Sở'],
    ['Sở Nội vụ Đắk Lắk', 'Đăng ký nội quy lao động, ATVSLĐ', 'Trực tiếp; dịch vụ công'],
    ['Công an tỉnh Đắk Lắk (Phòng Cảnh sát PCCC và CNCH); Công an cấp xã', 'PCCC, phương án chữa cháy, huấn luyện', 'Trực tiếp'],
    ['Cục Sở hữu trí tuệ (Bộ KH&CN)', 'Đăng ký nhãn hiệu', 'ipvietnam.gov.vn'],
    ['GS1 Việt Nam', 'Mã số mã vạch', 'vnpc.gs1.gov.vn'],
    ['Bộ Công Thương – Cục Xuất nhập khẩu, các Phòng Quản lý xuất nhập khẩu khu vực', 'C/O (EUR.1, mẫu E, RCEP), hướng dẫn Lệnh 280', 'ecosys.gov.vn'],
    ['Văn phòng SPS Việt Nam', 'Thông tin quy định an toàn thực phẩm, kiểm dịch của nước nhập khẩu', 'spsvietnam.gov.vn'],
    ['Chi cục Kiểm dịch thực vật vùng (Cục Trồng trọt và BVTV)', 'Kiểm dịch hạt ca cao chưa rang khi xuất', 'Trực tiếp; một cửa quốc gia'],
    ['Phòng kiểm nghiệm (ví dụ: Viện Vệ sinh Dịch tễ Tây Nguyên; QUATEST 3; phòng thử nghiệm tư nhân được công nhận ISO/IEC 17025)', 'Phiếu kiểm nghiệm tự công bố, kiểm nghiệm định kỳ, COA xuất khẩu', 'Kiểm tra phạm vi được chỉ định, công nhận trước khi gửi mẫu'],
    ['Tổ chức chứng nhận (HACCP, ISO 22000, FSSC 22000, BRCGS, hữu cơ)', 'Đánh giá, cấp chứng chỉ', 'Xin báo giá ít nhất 3 đơn vị']], { size: 19 }),
  PB());

/* ---------- 7. Lộ trình ---------- */
add(H1('7. Lộ trình hồ sơ theo giai đoạn (bảng kiểm)'),
  T([0.9, 4.6, 1.3, 1.0], [['GĐ', 'Việc', 'Phụ trách', 'Xong'],
    ['GĐ1', 'Bổ sung ngành nghề HTX, đăng ký địa điểm kinh doanh xưởng', 'Hành chính', '☐'],
    ['GĐ1', 'Hỏi bằng văn bản Sở NN&MT, Sở Công Thương về cơ quan đầu mối GCN ATTP cho xưởng ca cao (kể cả socola sau này)', 'Giám đốc', '☐'],
    ['GĐ1', 'Cải tạo xưởng theo sơ đồ 3D; lắp máy rang, tách vỏ; chụp hút, ống khói', 'Sản xuất', '☐'],
    ['GĐ1', 'Đăng ký môi trường (UBND xã); hồ sơ PCCC; nội quy lao động', 'Hành chính', '☐'],
    ['GĐ1', 'Khám sức khỏe, tập huấn ATTP; nộp hồ sơ GCN cơ sở đủ điều kiện ATTP', 'QA', '☐'],
    ['GĐ1', 'Ký hợp đồng thu mua (BM-05); lập phiếu vườn (BM-08) cho 100 % vườn cung cấp', 'Thu mua', '☐'],
    ['GĐ1', 'Đăng ký mã số mã vạch; nộp đơn nhãn hiệu Heragrain (VN; cân nhắc Trung Quốc)', 'Hành chính', '☐'],
    ['GĐ1', 'Ban hành TCCS nibs; kiểm nghiệm; tự công bố hạt rang, nibs; in nhãn (BM-09)', 'QA', '☐'],
    ['GĐ2', 'Xác nhận đầu mối ATTP cho socola; tự công bố socola; nhãn theo NĐ 37/2026', 'QA', '☐'],
    ['GĐ2', 'Bắt đầu xây HACCP (đội HACCP, sơ đồ quy trình, phân tích mối nguy)', 'QA', '☐'],
    ['GĐ3', 'Chứng nhận HACCP hoặc ISO 22000:2018; tự công bố bột, bơ ca cao', 'QA', '☐'],
    ['GĐ3', 'Hồ sơ OCOP (tùy chọn) cho socola, bột ca cao', 'Kinh doanh', '☐'],
    ['GĐ4', 'Đánh giá khoảng cách, chứng nhận FSSC 22000/BRCGS theo người mua', 'QA', '☐'],
    ['GĐ4', 'Bộ dữ liệu EUDR cho nhà nhập khẩu EU; đăng ký GACC (nếu bán Trung Quốc); tài khoản eCoSys', 'Kinh doanh', '☐'],
    ['GĐ4', 'Tự công bố sản phẩm mix vị; quản lý chất gây dị ứng; kiểm nghiệm trà vỏ ca cao', 'QA', '☐']], { size: 20, center: [0, 3] }),
  PB());

/* ---------- 8. Điểm cần xác nhận ---------- */
add(H1('8. Điểm cần xác nhận với cơ quan có thẩm quyền'),
  ...NUM([
    'Cơ quan đầu mối cấp GCN cơ sở đủ điều kiện ATTP khi xưởng làm cả sản phẩm ca cao (ngành NN&MT) và socola (ngành Công Thương).',
    'Cơ quan do UBND tỉnh Đắk Lắk chỉ định tiếp nhận bản tự công bố sau khi tỉnh thay thế Quyết định 17/2020/QĐ-UBND về phân cấp quản lý ATTP.',
    'Mẫu đơn, biên bản thẩm định hiện hành sau các thông tư sửa đổi TT 38/2018 (gần nhất TT 22/2026/TT-BNNMT) và mức phí thẩm định áp dụng.',
    'Thủ tục, mẫu đơn mã số mã vạch và biểu phí theo NĐ 37/2026/NĐ-CP.',
    'Mức giảm lệ phí sở hữu công nghiệp áp dụng tại thời điểm nộp đơn nhãn hiệu (các nguồn công bố khác nhau).',
    'Xưởng có thuộc danh mục cơ sở quản lý về PCCC (Phụ lục I NĐ 105/2025) và có được miễn đăng ký môi trường hay không.',
    'Nhóm sản phẩm của socola, bột, bơ ca cao trên hệ thống GACC (tự đăng ký hay cần giới thiệu); thay đổi nào buộc đăng ký lại mã GACC.',
    'Quy định thực phẩm của EU, Trung Quốc với trà vỏ ca cao (vỏ lụa) trước khi xuất khẩu dòng sản phẩm này.',
    'Thời điểm Luật An toàn thực phẩm (sửa đổi) được thông qua, có hiệu lực, và những thay đổi về tự công bố, GCN cơ sở khi Nghị định 46/2026 hoặc nghị định mới được áp dụng.'], 'xn'),
  PB());

/* ---------- 9. Nguồn ---------- */
add(H1('9. Nguồn tham chiếu'),
  ...BL([
    'Cổng Thông tin điện tử Chính phủ (baochinhphu.vn), 08/4/2026: Tiếp tục áp dụng Nghị định 15/2018/NĐ-CP về an toàn thực phẩm cho đến khi có quy định mới.',
    'Thư viện Pháp luật: Luật An toàn thực phẩm sửa đổi khi nào có hiệu lực; Nghị định 46/2026/NĐ-CP; Thông báo 141/TB-VPCP (20/3/2026).',
    'Tạp chí Công Thương: Dự thảo Luật An toàn thực phẩm (74 điều, 9 chương) trình tại Kỳ họp thứ Hai, Quốc hội khóa XVI.',
    'Chi cục Quản lý chất lượng nông lâm sản và thủy sản Đắk Lắk (daklakafiqad.gov.vn): quy trình cấp GCN cơ sở đủ điều kiện ATTP; danh sách cơ sở được thẩm định 2025–2026.',
    'Báo Pháp luật Việt Nam: Đắk Lắk phân cấp triệt để quản lý an toàn thực phẩm (thay thế Quyết định 17/2020/QĐ-UBND).',
    'Cổng pháp luật Cần Thơ, Thư viện Pháp luật: đăng ký hộ kinh doanh, hợp tác xã tại cơ quan đăng ký kinh doanh cấp xã từ 01/7/2025 (Nghị định 125/2025/NĐ-CP); Nghị định 92/2024/NĐ-CP, 113/2024/NĐ-CP.',
    'Thư viện Pháp luật, LuatVietnam: Quyết định 36/2025/QĐ-TTg, mã ngành 1073 (10730) Sản xuất ca cao, sôcôla và bánh kẹo.',
    'Thư viện Pháp luật, Hệ thống pháp luật: Nghị định 37/2026/NĐ-CP hướng dẫn Luật Chất lượng sản phẩm, hàng hóa (mã số mã vạch, Điều 98 chuyển tiếp); EY Việt Nam (3/2026): yêu cầu ghi nhãn cập nhật theo Nghị định 37/2026.',
    'Thư viện Pháp luật: Luật Chất lượng sản phẩm, hàng hóa sửa đổi số 78/2025/QH15; Luật Tiêu chuẩn và Quy chuẩn kỹ thuật sửa đổi số 70/2025/QH15.',
    'Thư viện Pháp luật, LSVN: Luật sửa đổi Luật Sở hữu trí tuệ số 131/2025/QH15 (hiệu lực 01/4/2026).',
    'LuatVietnam, Thư viện Pháp luật: Nghị định 05/2025/NĐ-CP, Nghị định 131/2025/NĐ-CP (đăng ký môi trường tại UBND cấp xã); Nghị định 105/2025/NĐ-CP về PCCC.',
    'Luatvietnam, Vanban123: TCVN 7518:2005; TCVN 7519:2020 (ISO 2451:2017) hạt ca cao.',
    'China Briefing, Reach24h, FoodNavigator, Bộ Công Thương (Tạp chí Công Thương): Lệnh 280 của GACC, danh mục 17 nhóm, hạt ca cao chưa rang theo Thông báo 219/2025.',
    'Ủy ban châu Âu, Hội đồng EU, EY: EUDR áp dụng từ 30/12/2026 (DN siêu nhỏ, nhỏ: 30/6/2027), Quy định (EU) 2025/2650.',
    'Trung tâm Khuyến nông Đắk Lắk (qua Báo Nông nghiệp và Môi trường): diện tích, sản lượng ca cao Đắk Lắk 2025; VCCI (1/2026): ca cao trong tái cơ cấu nông nghiệp Tây Nguyên.',
    'Bộ slide “Lộ trình đầu tư giai đoạn đầu” của Heragrain (phiên làm việc trước): hỗ trợ ISO 22000/HACCP của Đắk Lắk (VOV, 10/2026), EUR.1, GS1.']),
  GAP(),
  NOTE('Tài liệu do tư vấn soạn để Heragrain chuẩn bị hồ sơ; không phải ý kiến pháp lý chính thức. Văn bản, mẫu biểu và phí có thể thay đổi; luôn đối chiếu bản gốc và hỏi cơ quan tiếp nhận trước khi nộp.', 'FDF1E4', 'C0392B'));

/* ===================================================================== TÀI LIỆU */
const doc = new Document({
  creator: 'HTX Heragrain', title: 'Hồ sơ pháp lý dòng sản phẩm ca cao Heragrain', description: 'Văn bản pháp luật, thủ tục, cơ quan cấp, biểu mẫu',
  styles: {
    default: { document: { run: { font: FONT, size: 24 } } },
    paragraphStyles: [
      { id: 'Heading1', name: 'Heading 1', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 32, bold: true, color: XANH }, paragraph: { spacing: { before: 240, after: 160 }, keepNext: true, outlineLevel: 0,
          border: { bottom: { style: BorderStyle.SINGLE, size: 8, color: VANG, space: 4 } } } },
      { id: 'Heading2', name: 'Heading 2', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 26, bold: true, color: NAU }, paragraph: { spacing: { before: 200, after: 100 }, keepNext: true, outlineLevel: 1 } },
      { id: 'Heading3', name: 'Heading 3', basedOn: 'Normal', next: 'Normal', quickFormat: true,
        run: { font: FONT, size: 24, bold: true, color: XANH }, paragraph: { spacing: { before: 160, after: 80 }, keepNext: true, outlineLevel: 2 } }]
  },
  numbering: { config: [
    { reference: 'bul', levels: [{ level: 0, format: LevelFormat.BULLET, text: '•', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 400, hanging: 260 } } } },
      { level: 1, format: LevelFormat.BULLET, text: '–', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 800, hanging: 260 } } } }] },
    ...['muc', 'hd', 'xn'].map((r) => ({ reference: r, levels: [{ level: 0, format: LevelFormat.DECIMAL, text: '%1.', alignment: AlignmentType.LEFT, style: { paragraph: { indent: { left: 420, hanging: 320 } } } }] }))] },
  sections: [{
    properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, bottom: 1134, left: 1701, right: 1134 } } },
    headers: { default: new Header({ children: [new Paragraph({ alignment: AlignmentType.RIGHT, children: [new TextRun({ text: 'HTX Heragrain · Hồ sơ pháp lý dòng sản phẩm ca cao · cập nhật 04/11/2026', font: FONT, size: 16, color: '87978F' })] })] }) },
    footers: { default: new Footer({ children: [new Paragraph({ alignment: AlignmentType.CENTER, children: [new TextRun({ children: ['Trang ', PageNumber.CURRENT, ' / ', PageNumber.TOTAL_PAGES], font: FONT, size: 18, color: '87978F' })] })] }) },
    children: C
  }]
});
Packer.toBuffer(doc).then((b) => { fs.writeFileSync(OUT, b); console.log('saved', OUT, b.length); });
