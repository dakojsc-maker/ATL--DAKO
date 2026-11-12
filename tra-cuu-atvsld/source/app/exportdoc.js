(function () {
'use strict';
var D = window.docx;
var GREEN = '1B5E37', MINT = 'E6F2EA', PAPER = 'F3F8F4', RULE = 'B9D6C4', GRAY = '7F8C85', INK = '1D2A22', MUTED = '5A6B61';
var FONT = 'Times New Roman';
var W = 9071; /* khổ chữ A4, lề trái 3 cm, các lề còn lại 2 cm */
var DOC_SHORT = { 1: 'Quản lý, chỉ huy', 2: 'Làm công tác ATVSLĐ', 3: 'Công việc nghiêm ngặt', 4: 'Người lao động khác', 5: 'Làm công tác y tế', 6: 'An toàn, vệ sinh viên' };

function run(text, o) {
  o = o || {};
  return new D.TextRun({ text: String(text), bold: !!o.b, italics: !!o.i, color: o.color || INK, size: o.size || 28, font: FONT });
}
function runs(text, o) {
  o = o || {};
  return String(text).split(/(\*\*[^*]+\*\*)/g).filter(function (p) { return p !== ''; }).map(function (p) {
    if (/^\*\*[^*]+\*\*$/.test(p)) { var o2 = {}; for (var k in o) o2[k] = o[k]; o2.b = true; return run(p.slice(2, -2), o2); }
    return run(p, o);
  });
}
function para(children, o) {
  o = o || {};
  var p = {
    children: children,
    alignment: o.align || D.AlignmentType.LEFT,
    spacing: { before: o.before || 0, after: o.after == null ? 80 : o.after, line: o.line || 276 },
    keepNext: !!o.keepNext, keepLines: !!o.keepLines
  };
  if (o.bullet) { p.numbering = { reference: 'bul', level: 0 }; }
  if (o.indent) p.indent = o.indent;
  if (o.border) p.border = o.border;
  return new D.Paragraph(p);
}
function text(t, o) { return para(runs(t, o), o); }
function bullets(arr, o) {
  o = o || {};
  return arr.map(function (t) { return para(runs(t, { size: o.size || 26 }), { bullet: true, after: 40, size: o.size }); });
}
function bd(color, size) { return { style: D.BorderStyle.SINGLE, size: size || 4, color: color }; }
function allB(color) { return { top: bd(color), bottom: bd(color), left: bd(color), right: bd(color) }; }
function cell(children, o) {
  o = o || {};
  var c = {
    children: children && children.length ? children : [para([run('')])],
    width: { size: o.w, type: D.WidthType.DXA },
    margins: { top: o.mt == null ? 70 : o.mt, bottom: o.mt == null ? 70 : o.mt, left: 110, right: 110 },
    borders: o.borders || allB(GRAY),
    verticalAlign: o.va || D.VerticalAlign.TOP
  };
  if (o.fill) c.shading = { type: D.ShadingType.CLEAR, color: 'auto', fill: o.fill };
  if (o.span) c.columnSpan = o.span;
  return new D.TableCell(c);
}
function table(cols, rows) {
  return new D.Table({ width: { size: W, type: D.WidthType.DXA }, columnWidths: cols, rows: rows, layout: D.TableLayoutType.FIXED });
}
function row(cells, o) {
  o = o || {};
  return new D.TableRow({ children: cells, tableHeader: !!o.header, cantSplit: o.cantSplit !== false });
}
function headRow(cols, labels, size) {
  return row(labels.map(function (l, i) {
    return cell([para([run(l, { b: true, color: 'FFFFFF', size: size || 26 })], { after: 0, align: i === 0 && labels.length > 3 ? D.AlignmentType.CENTER : D.AlignmentType.LEFT })], { w: cols[i], fill: GREEN, va: D.VerticalAlign.CENTER });
  }), { header: true });
}
function h1(t) {
  return para([run(t, { b: true, color: GREEN, size: 30 })], { before: 280, after: 120, keepNext: true, border: { bottom: { style: D.BorderStyle.SINGLE, size: 8, color: GREEN, space: 3 } } });
}
function h2(t) { return para([run(t, { b: true, color: GREEN, size: 28 })], { before: 200, after: 100, keepNext: true }); }
function callout(paras) {
  var borders = { top: bd(RULE), bottom: bd(RULE), right: bd(RULE), left: { style: D.BorderStyle.SINGLE, size: 24, color: GREEN } };
  return table([W], [row([cell(paras, { w: W, fill: PAPER, borders: borders, mt: 100 })], { cantSplit: true })]);
}
function spacer(n) { return para([run('')], { after: n == null ? 80 : n }); }
function fmt(n) { try { return Number(n).toLocaleString('vi-VN'); } catch (e) { return String(n); } }
function ddmmyyyy(d) { function p(x) { return (x < 10 ? '0' : '') + x; } return p(d.getDate()) + '/' + p(d.getMonth() + 1) + '/' + d.getFullYear(); }

function mergeOff(list) {
  var out = [], seen = {};
  list.forEach(function (c) {
    var key = c.k + '|' + c.w;
    if (seen[key] != null) { out[seen[key]].gs.push(c.g); return; }
    seen[key] = out.length; out.push({ gs: [c.g], k: c.k, w: c.w });
  });
  return out.map(function (x) {
    var g = x.gs.map(function (n) { return 'Nhóm ' + n; }).join(' và ');
    return { g: g, k: x.k, text: x.k === 'alt' ? 'Hoặc ' + g + ': ' + x.w : 'Lưu ý: ' + x.w };
  });
}

function build(m, o, meta) {
  var GR = meta.GR, GSHORT = meta.GSHORT, cust = meta.cust;
  var ind = m.ind;
  var kids = [];
  var A = D.AlignmentType;

  /* ---------- đầu tài liệu ---------- */
  kids.push(para([run('VIỆN STP – DAKO', { b: true, color: GREEN, size: 40 })], { align: A.CENTER, after: 40 }));
  kids.push(para([run('Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP', { size: 26 })], { align: A.CENTER, after: 20 }));
  kids.push(para([run('Công ty Cổ phần Kỹ thuật Hàng Hải DAKO', { size: 26 })], { align: A.CENTER, after: 200 }));
  var banner = cell([
    para([run('ĐỀ XUẤT NHÓM HUẤN LUYỆN VÀ NỘI DUNG HUẤN LUYỆN', { b: true, color: 'FFFFFF', size: 27 })], { align: A.CENTER, after: 60 }),
    para([run('AN TOÀN, VỆ SINH LAO ĐỘNG', { b: true, color: 'FFFFFF', size: 32 })], { align: A.CENTER, after: 0 })
  ], { w: W, fill: GREEN, mt: 220 });
  kids.push(table([W], [row([banner])]));
  kids.push(para([run(ind.full.toUpperCase(), { b: true, color: GREEN, size: 36 })], { align: A.CENTER, before: 220, after: 40 }));
  kids.push(para([run('Ngày lập: ' + ddmmyyyy(m.date), { i: true, size: 24 })], { align: A.CENTER, after: 120 }));

  /* ---------- I. thông tin khách hàng ---------- */
  kids.push(h1('I. THÔNG TIN KHÁCH HÀNG'));
  var info = [['Doanh nghiệp', (cust.name || '').trim() || '(chưa nhập)'], ['Ngành nghề', ind.name]];
  if (m.type) info.push(['Loại hình doanh nghiệp', m.type.n]);
  if (m.heads) info.push(['Tổng số lao động', fmt(m.heads) + ' người']);
  if ((cust.contact || '').trim()) info.push(['Đầu mối phía khách hàng', cust.contact.trim()]);
  if ((cust.advisor || '').trim()) info.push(['Nhân viên tư vấn', cust.advisor.trim()]);
  info.push(['Số vị trí nhân sự đã chọn', m.rows.length + (m.anyN ? ' vị trí, tổng ' + fmt(m.totalPpl) + ' người' : ' vị trí')]);
  kids.push(table([2900, W - 2900], info.map(function (r) {
    return row([cell([para([run(r[0], { b: true, color: GREEN, size: 26 })], { after: 0 })], { w: 2900, fill: PAPER }), cell([para([run(r[1], { size: 26 })], { after: 0 })], { w: W - 2900 })]);
  })));
  var scaleParas = [];
  m.scale.forEach(function (x) {
    if (!x.hit) return;
    scaleParas.push(para(runs('**Với ' + fmt(m.heads) + ' lao động' + (x.t.t ? ' (' + x.t.t + ')' : '') + ':**', { size: 24 }), { after: 30 }));
    for (var i = 1; i < x.t.h.length; i++) scaleParas.push(para(runs(x.t.h[i] + ': **' + x.hit.c[i - 1] + '**', { size: 24 }), { after: 30 }));
  });
  if (scaleParas.length) { kids.push(spacer(100)); kids.push(callout(scaleParas)); }

  /* ---------- II. bảng nhân sự ---------- */
  kids.push(h1('II. BẢNG NHÂN SỰ VÀ NHÓM HUẤN LUYỆN'));
  kids.push(text('Dựa trên danh sách vị trí nhân sự của doanh nghiệp, Viện STP – DAKO dự kiến phân nhóm huấn luyện như sau (sáu nhóm theo Nghị định 44/2016/NĐ-CP, sửa đổi bởi Nghị định 140/2018/NĐ-CP).', { size: 26, after: 120 }));
  var c2 = [800, 3700, 950, W - 800 - 3700 - 950];
  var rows2 = [headRow(c2, ['STT', 'Vị trí nhân sự', 'Số người', 'Nhóm huấn luyện'])];
  var idx = 0, lastB = null;
  m.rows.forEach(function (x) {
    if (x.b !== lastB) {
      rows2.push(row([cell([para([run('Khối ' + x.b.id + '. ' + x.b.name, { b: true, color: GREEN, size: 26 })], { after: 0, keepNext: true })], { w: W, span: 4, fill: MINT })]));
      lastB = x.b;
    }
    idx++;
    var posP = [para([run(x.r.p, { size: 26 })], { after: 20 })];
    if (o.notes && x.r.n && !x.noteDup) posP.push(para([run(x.r.n, { i: true, size: 22, color: MUTED })], { after: 20 }));
    if (x.note) posP.push(para([run('Ghi chú: ' + x.note, { i: true, size: 22, color: MUTED })], { after: 20 }));
    var gp = [];
    if (x.groups.length) {
      x.groups.forEach(function (g) { gp.push(para([run('Nhóm ' + g, { b: true, size: 26, color: GREEN }), run(' – ' + DOC_SHORT[g], { size: 24 })], { after: 20 })); });
    } else {
      gp.push(para([run(meta.noGroupLabel(x.r), { i: true, size: 24 })], { after: 20 }));
    }
    x.r.x.forEach(function (e) { gp.push(para([run('+ ' + e, { i: true, size: 22, color: MUTED })], { after: 20 })); });
    if (o.cond) mergeOff(x.off).forEach(function (c) { gp.push(para([run(c.text, { i: true, size: 21, color: MUTED })], { after: 20 })); });
    rows2.push(row([
      cell([para([run(String(idx), { size: 26 })], { after: 0, align: A.CENTER })], { w: c2[0] }),
      cell(posP, { w: c2[1] }),
      cell([para([run(x.n ? fmt(x.n) : '–', { size: 26 })], { after: 0, align: A.CENTER })], { w: c2[2] }),
      cell(gp, { w: c2[3] })
    ]));
  });
  kids.push(table(c2, rows2));
  kids.push(para([run('Bảng phân loại này là ước tính ban đầu. Danh sách chính thức do chuyên viên Viện STP – DAKO rà soát theo công việc thực tế của từng người.', { i: true, size: 24 })], { before: 100, after: 80 }));

  /* ---------- III. tổng hợp ---------- */
  kids.push(h1('III. TỔNG HỢP THEO NHÓM HUẤN LUYỆN'));
  if (!m.usedGroups.length) kids.push(text('Các vị trí đã chọn chưa xác định được nhóm huấn luyện. Chuyên viên Viện STP – DAKO sẽ xác định nhóm theo công việc thực tế của từng người.', { size: 26, after: 80 }));
  else {
    var c3 = [1150, 2750, 1050, 1050, 1300, W - 1150 - 2750 - 1050 - 1050 - 1300];
    var rows3 = [headRow(c3, ['Nhóm', 'Đối tượng', 'Số vị trí', 'Số người', 'Lần đầu', 'Định kỳ'], 24)];
    m.usedGroups.forEach(function (g) {
      var G = GR[g - 1], st = m.gs[g];
      rows3.push(row([
        cell([para([run('Nhóm ' + g, { b: true, color: GREEN, size: 24 })], { after: 0 })], { w: c3[0], fill: PAPER }),
        cell([para([run(GSHORT[g], { size: 24 })], { after: 0 })], { w: c3[1] }),
        cell([para([run(String(st.pos), { size: 24 })], { after: 0, align: A.CENTER })], { w: c3[2] }),
        cell([para([run(st.hasN ? fmt(st.ppl) : '–', { size: 24 })], { after: 0, align: A.CENTER })], { w: c3[3] }),
        cell([para([run(G.first.replace(/\s*\(.*\)/, ''), { size: 24 })], { after: 0 })], { w: c3[4] }),
        cell([para([run(G.again, { size: 22 })], { after: 0 })], { w: c3[5] })
      ]));
    });
    kids.push(table(c3, rows3));
    kids.push(para([run('Số giờ là mức tối thiểu theo quy định; thời lượng và chương trình thực tế do Viện STP – DAKO xác định theo đối tượng. Một người có thể thuộc nhiều nhóm nên tổng theo nhóm có thể lớn hơn tổng số người' + (m.anyN ? ' (' + fmt(m.totalPpl) + ' người).' : '.'), { i: true, size: 24 })], { before: 100, after: 80 }));
  }
  var ex = Object.keys(m.extras);
  if (ex.length) {
    kids.push(text('**Dịch vụ huấn luyện đi kèm có thể bổ sung:** ' + ex.join('; ') + '.', { size: 26, after: 80 }));
  }

  /* ---------- IV. nội dung huấn luyện ---------- */
  var frame = o.frame && m.usedGroups.length > 0;
  if (frame || (o.detail && m.clusters.length)) kids.push(h1('IV. NỘI DUNG HUẤN LUYỆN'));
  if (frame) {
    kids.push(h2('IV.1. Nội dung khung theo từng nhóm'));
    var c4 = [1800, W - 1800];
    var rows4 = [headRow(c4, ['Nhóm', 'Nội dung khung'])];
    m.usedGroups.forEach(function (g) {
      var G = GR[g - 1];
      rows4.push(row([
        cell([para([run('Nhóm ' + g, { b: true, color: GREEN, size: 26 })], { after: 20 }), para([run(GSHORT[g], { size: 22 })], { after: 40 }), para([run('Lần đầu: ' + G.first.replace(/\s*\(.*\)/, ''), { i: true, size: 22 })], { after: 0 })], { w: c4[0], fill: PAPER }),
        cell(bullets(G.frame), { w: c4[1] })
      ], { cantSplit: false }));
    });
    kids.push(table(c4, rows4));
  }
  if (o.detail && m.clusters.length) {
    kids.push(h2((frame ? 'IV.2. ' : 'IV.1. ') +'Nội dung đặc thù ngành ' + ind.name.toLowerCase() + ' theo cụm vị trí'));
    var c5 = [2250, W - 2250];
    m.clusters.forEach(function (x) {
      kids.push(para([run('Cụm ' + x.c.no + '. ' + x.c.t, { b: true, color: GREEN, size: 27 })], { before: 160, after: 80, keepNext: true }));
      var rr = [];
      function lab(t) { return cell([para([run(t, { b: true, color: GREEN, size: 25 })], { after: 0 })], { w: c5[0], fill: PAPER }); }
      rr.push(row([lab('Vị trí đã chọn'), cell(x.rows.map(function (y) { return para(runs(y.r.p, { size: 25 }), { bullet: true, after: 30 }); }), { w: c5[1] })], { cantSplit: false }));
      if (x.c.grp.length) rr.push(row([lab('Nhóm huấn luyện'), cell(bullets(x.c.grp, { size: 25 }), { w: c5[1] })], { cantSplit: false }));
      if (x.c.con.length) rr.push(row([lab('Nội dung huấn luyện'), cell(bullets(x.c.con, { size: 25 }), { w: c5[1] })], { cantSplit: false }));
      if (o.soft && x.c.soft.length) rr.push(row([lab('Tính năng phần mềm gợi ý'), cell(bullets(x.c.soft, { size: 25 }), { w: c5[1] })], { cantSplit: false }));
      if (o.faq && x.c.faq.length) {
        var fp = [];
        x.c.faq.forEach(function (q) {
          fp.push(para([run('Khách hỏi: ' + q.q, { b: true, size: 25 })], { after: 20, keepNext: true }));
          q.a.forEach(function (a) { fp.push(para(runs('Gợi ý trả lời: ' + a, { size: 25 }), { after: 80 })); });
        });
        rr.push(row([lab('Khách hàng hay thắc mắc (nội bộ)'), cell(fp, { w: c5[1] })], { cantSplit: false }));
      }
      if (o.up && (x.c.up.length || x.c.note.length)) rr.push(row([lab('Cơ hội bán kèm (nội bộ)'), cell(bullets(x.c.up.concat(x.c.note), { size: 25 }), { w: c5[1] })], { cantSplit: false }));
      kids.push(table(c5, rr));
    });
    if (m.noCl.length) kids.push(para([run('Các vị trí chưa có thẻ nội dung riêng (' + m.noCl.map(function (y) { return y.r.p.split(/[,:(;]/)[0]; }).join('; ') + '): áp dụng nội dung khung của nhóm tương ứng.', { i: true, size: 24 })], { before: 100, after: 60 }));
  }

  /* ---------- V. lưu ý ---------- */
  kids.push(h1('V. LƯU Ý VÀ CĂN CỨ PHÁP LÝ'));
  kids.push.apply(kids, bullets([
    'Sáu nhóm huấn luyện theo Nghị định 44/2016/NĐ-CP (sửa đổi bởi Nghị định 140/2018/NĐ-CP). Nhóm 3 xác định theo Danh mục công việc có yêu cầu nghiêm ngặt về ATVSLĐ (Thông tư 06/2020/TT-BLĐTBXH).',
    'Một người có thể thuộc nhiều nhóm. Khi đó huấn luyện đủ các nhóm tương ứng.',
    'Người lao động nghỉ từ 6 tháng trở lên, hoặc cơ sở ngừng hoạt động từ 6 tháng trở lên, phải được huấn luyện lại.',
    'Học viên đạt kết quả kiểm tra được cấp Thẻ an toàn lao động và Giấy chứng nhận huấn luyện ATVSLĐ, tra cứu và xác thực trực tuyến tại daotao.vienstp.com.',
    'Thông tin pháp lý được kiểm tra đến ngày ' + ind.legal + '. Khi luật hoặc nghị định mới có hiệu lực, số giờ huấn luyện và nhóm đối tượng sẽ được cập nhật.'
  ], { size: 25 }));
  kids.push(spacer(100));
  var ct = [para(runs('**Viện STP – DAKO**', { size: 25 }), { after: 30 }),
    para(runs('Văn phòng: Hà Nội, Nha Trang, TP. Hồ Chí Minh', { size: 24 }), { after: 30 }),
    para(runs('Hotline: 0827.695.368 – 0968.702.701 | Website: www.vienstp.com', { size: 24 }), { after: 0 })];
  if ((cust.advisor || '').trim()) ct.splice(1, 0, para(runs('Nhân viên tư vấn: **' + cust.advisor.trim() + '**', { size: 24 }), { after: 30 }));
  kids.push(callout(ct));

  var header = new D.Header({ children: [new D.Paragraph({
    alignment: A.RIGHT,
    children: [run('Viện STP – DAKO  |  Đề xuất huấn luyện ATVSLĐ – Ngành ' + ind.name, { size: 20, color: GRAY })],
    border: { bottom: { style: D.BorderStyle.SINGLE, size: 6, color: RULE, space: 4 } }
  })] });
  var footer = new D.Footer({ children: [new D.Paragraph({
    alignment: A.CENTER, style: 'FootSt',
    children: [
      new D.TextRun({ text: 'Trang ', size: 20, color: GRAY, font: FONT }),
      new D.TextRun({ children: [D.PageNumber.CURRENT], size: 20, color: GRAY, font: FONT }),
      new D.TextRun({ text: ' / ', size: 20, color: GRAY, font: FONT }),
      new D.TextRun({ children: [D.PageNumber.TOTAL_PAGES], size: 20, color: GRAY, font: FONT })
    ]
  })] });

  var doc = new D.Document({
    creator: 'Viện STP – DAKO',
    title: 'Đề xuất nhóm huấn luyện ATVSLĐ – ' + ind.name,
    styles: { default: { document: { run: { font: FONT, size: 28 } } }, paragraphStyles: [{ id: 'FootSt', name: 'FootSt', basedOn: 'Normal', run: { font: FONT, size: 20, color: GRAY } }] },
    numbering: { config: [{ reference: 'bul', levels: [{ level: 0, format: D.LevelFormat.BULLET, text: '•', alignment: A.LEFT, style: { paragraph: { indent: { left: 340, hanging: 240 } } } }] }] },
    sections: [{
      properties: { page: { size: { width: 11906, height: 16838 }, margin: { top: 1134, right: 1134, bottom: 1134, left: 1701, header: 567, footer: 567 } } },
      headers: { default: header }, footers: { default: footer },
      children: kids
    }]
  });
  return D.Packer.toBlob(doc);
}

window.STPExport = { build: build };
})();
