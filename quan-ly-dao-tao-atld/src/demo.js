/* ============================================================
   DỮ LIỆU MẪU – chỉ để xem thử, không lưu, không ai khác thấy
   ============================================================ */

function makeSamplePdf(title, lines) {
  const escPdf = (s) => String(s).replace(/[\\()]/g, '\\$&');
  const body = [`BT /F1 20 Tf 60 770 Td (${escPdf(title)}) Tj ET`, 'BT /F1 11 Tf 60 735 Td 18 TL',
    ...lines.map((l) => `(${escPdf(l)}) Tj T*`), 'ET',
    'BT /F1 9 Tf 60 60 Td (TAI LIEU MINH HOA - DU LIEU MAU CUA CONG CU QUAN LY HUAN LUYEN ATVSLD DAKO) Tj ET'].join('\n');
  const objs = [
    '<< /Type /Catalog /Pages 2 0 R >>',
    '<< /Type /Pages /Kids [3 0 R] /Count 1 >>',
    '<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 4 0 R >> >> /Contents 5 0 R >>',
    '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>',
    `<< /Length ${body.length} >>\nstream\n${body}\nendstream`,
  ];
  let out = '%PDF-1.4\n'; const offs = [];
  objs.forEach((o, i) => { offs.push(out.length); out += `${i + 1} 0 obj\n${o}\nendobj\n`; });
  const x = out.length;
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n${offs.map((o) => String(o).padStart(10, '0') + ' 00000 n \n').join('')}trailer\n<< /Size ${objs.length + 1} /Root 1 0 R >>\nstartxref\n${x}\n%%EOF`;
  return new Blob([out], { type: 'application/pdf' });
}

function buildDemo() {
  const b = new MemoryBackend('demo');
  const t = todayISO(); const ym = t.slice(0, 7);
  const D = (n) => addDays(t, n);
  const put = (col, rec) => { b.data[col].set(rec.id, { createdAt: new Date().toISOString(), updatedAt: new Date().toISOString(), ...rec }); };
  const pdf = (id, name, title, lines) => { b.files.set(id, makeSamplePdf(title, lines)); return { id, name, type: 'application/pdf', size: 1200, enc: 'raw', at: new Date().toISOString() }; };

  const trainers = [
    ['gv1', 'Nguyễn Văn Hòa', '0900 000 101', 'nam', ['An toàn điện', 'Làm việc trên cao', 'Quản lý công tác ATVSLĐ'], [1, 2, 3, 4], 'Kỹ sư điện', 15, 1000000, 'Cơ hữu', D(420), []],
    ['gv2', 'Trần Thị Mai Anh', '0900 000 102', 'nam', ['Sơ cấp cứu', 'Y tế lao động', 'Vệ sinh lao động – môi trường'], [4, 5, 6], 'Bác sĩ y học lao động', 11, 900000, 'Cộng tác viên', D(35), ['trung']],
    ['gv3', 'Lê Quốc Bảo', '0900 000 103', 'nam', ['Thiết bị nâng – xe nâng', 'Hàn, cắt kim loại'], [3, 4], 'Kỹ sư cơ khí', 9, 800000, 'Cộng tác viên', D(300), []],
    ['gv4', 'Phạm Minh Tuấn', '0900 000 104', 'nam', ['Đóng tàu – sửa chữa tàu', 'Không gian hạn chế', 'Nghiệp vụ ATVSLĐ'], [2, 3, 4], 'Kỹ sư vỏ tàu', 18, 1000000, 'Cơ hữu', D(600), []],
    ['gv5', 'Võ Thành Nhân', '0900 000 105', 'trung', ['Cảng biển – xếp dỡ hàng hóa', 'Thiết bị nâng – xe nâng'], [3, 4, 6], 'Kỹ sư khai thác cảng', 12, 800000, 'Cộng tác viên', D(500), []],
    ['gv6', 'Huỳnh Thị Thu Hà', '0900 000 106', 'trung', ['Quản lý công tác ATVSLĐ', 'Nghiệp vụ ATVSLĐ', 'PCCC & cứu nạn cứu hộ'], [1, 2, 4], 'Thạc sĩ Bảo hộ lao động', 14, 1000000, 'Thỉnh giảng', D(-10), []],
    ['gv7', 'Đỗ Đức Thắng', '0900 000 107', 'bac', ['Xây dựng', 'Làm việc trên cao', 'An toàn điện'], [1, 2, 3, 4], 'Kỹ sư xây dựng', 16, 900000, 'Cộng tác viên', D(700), []],
    ['gv8', 'Bùi Thị Lan', '0900 000 108', 'bac', ['Hóa chất', 'Vệ sinh lao động – môi trường'], [3, 4, 5], 'Kỹ sư hóa', 8, 800000, 'Cộng tác viên', D(250), []],
  ];
  trainers.forEach(([id, name, phone, region, specialties, groups, degree, experience, dailyRate, employment, certExpiry, otherRegions]) =>
    put('trainers', { id, name, phone, region, specialties, groups, degree, experience, dailyRate, employment, certExpiry, otherRegions, certNo: 'GV-' + id.toUpperCase() + '/MẪU', status: 'active', email: '', files: [] }));

  const customers = [
    ['kh1', 'Công ty TNHH Đóng tàu Sao Biển (mẫu)', 'nam', 'Đóng tàu', 'Anh Khoa – Phòng HSE', '0900 111 001'],
    ['kh2', 'Công ty CP Cảng Vịnh Xanh (mẫu)', 'trung', 'Cảng biển', 'Chị Ngân – Phòng nhân sự', '0900 111 002'],
    ['kh3', 'Công ty TNHH Cơ khí Phú An (mẫu)', 'nam', 'Cơ khí', 'Anh Dũng – Quản đốc', '0900 111 003'],
    ['kh4', 'Công ty CP Xây dựng Hồng Lam (mẫu)', 'bac', 'Xây dựng', 'Anh Sơn – Ban an toàn', '0900 111 004'],
    ['kh5', 'Nhà máy Hóa chất Tân Việt (mẫu)', 'bac', 'Hóa chất', 'Chị Hương – Phòng ATMT', '0900 111 005'],
    ['kh6', 'Công ty TNHH Thủy sản Hải Đăng (mẫu)', 'trung', 'Chế biến thủy sản', 'Anh Phúc – Hành chính', '0900 111 006'],
  ];
  customers.forEach(([id, name, region, industry, contact, phone]) => put('customers', { id, name, region, industry, contact, phone, address: 'Địa chỉ minh họa', taxCode: '0300000' + id.slice(2) + '00' }));

  const cname = (id) => customers.find((c) => c[0] === id)[1];
  const q = (id, no, cid, date, status, groups, students, classCount, unit, extra = {}) => {
    put('quotes', { id, no, customerId: cid, customerName: cname(cid), date, validUntil: addDays(date, 30), status, groups, students, classCount, unitPrice: unit, amount: unit * classCount, priceMode: 'auto', amountMode: 'auto', owner: 'Phòng Đào tạo', contact: customers.find((c) => c[0] === cid)[4], contactPhone: customers.find((c) => c[0] === cid)[5], quoteFiles: [pdf('fq' + id, `Bao-gia-${no}.pdf`, `BAO GIA ${no}`, ['Huan luyen an toan, ve sinh lao dong', `So hoc vien du kien: ${students}`, `So lop: ${classCount}`, `Don gia/lop: ${money(unit)} VND (chua VAT)`, 'Hieu luc: 30 ngay'])], contractFiles: [], payments: [], ...extra });
  };
  const y = t.slice(0, 4);
  q('bg1', `BG-${y}-001`, 'kh1', D(-60), 'signed', [3, 4], 110, 2, 8000000, { contractNo: `HĐ-${y}-01/DAKO-SB`, contractDate: D(-52), paymentDue: D(-5), contractFiles: [pdf('fc1', `Hop-dong-${y}-01.pdf`, `HOP DONG ${y}-01`, ['Ben A: Cong ty TNHH Dong tau Sao Bien (mau)', 'Ben B: Cong ty CP Ky thuat Hang hai DAKO', 'Noi dung: Huan luyen ATVSLD nhom 3, nhom 4', 'Gia tri: 16.000.000 VND'])], payments: [{ id: 'p1', date: D(-40), amount: 8000000, note: 'Tạm ứng 50%' }],
    commissions: [{ id: 'h1', type: 'agent', name: 'Đại lý Minh Phát (mẫu)', amount: 2400000, taxRate: 20, paidDate: D(-30), note: 'Chuyển khoản' }, { id: 'h2', type: 'manager', name: 'Anh Khoa – Phòng HSE (mẫu)', amount: 1200000, taxRate: 20 }],
    otherCosts: [{ id: 'o1', name: 'Tiếp khách – quà tặng', amount: 500000 }] });
  q('bg2', `BG-${y}-002`, 'kh2', D(-35), 'signed', [1, 2, 4], 45, 1, 8000000, { contractNo: `HĐ-${y}-02/DAKO-VX`, contractDate: D(-28), paymentDue: D(30), commissions: [{ id: 'h3', type: 'agent', name: 'Đại lý miền Trung (mẫu)', amount: 1500000, taxRate: 20 }], contractFiles: [pdf('fc2', `Hop-dong-${y}-02.pdf`, `HOP DONG ${y}-02`, ['Ben A: Cong ty CP Cang Vinh Xanh (mau)', 'Noi dung: Huan luyen ATVSLD nhom 1, 2, 4'])] });
  q('bg3', `BG-${y}-003`, 'kh3', D(-20), 'signed', [3], 24, 1, 5000000, { contractNo: `HĐ-${y}-03/DAKO-PA`, contractDate: D(-15), paymentDue: D(20), contractFiles: [pdf('fc3', `Hop-dong-${y}-03.pdf`, `HOP DONG ${y}-03`, ['Ben A: Cong ty TNHH Co khi Phu An (mau)'])], payments: [{ id: 'p2', date: D(-10), amount: 5000000, note: 'Thanh toán đủ' }], commissions: [{ id: 'h4', type: 'manager', name: 'Anh Dũng – Quản đốc (mẫu)', amount: 600000, taxRate: 20 }] });
  q('bg4', `BG-${y}-004`, 'kh4', D(-18), 'signed', [1, 2, 3, 4], 150, 3, 8000000, { contractNo: `HĐ-${y}-04/DAKO-HL`, contractDate: D(-9), paymentDue: D(45), commissions: [{ id: 'h5', type: 'agent', name: 'Đại lý Hồng Lam (mẫu)', amount: 3600000, taxRate: 20 }, { id: 'h6', type: 'manager', name: 'Anh Sơn – Ban an toàn (mẫu)', amount: 1200000, taxRate: 20 }] });
  q('bg5', `BG-${y}-005`, 'kh5', D(-12), 'negotiating', [3, 4, 5], 80, 2, 8000000);
  q('bg6', `BG-${y}-006`, 'kh6', D(-4), 'sent', [4, 6], 52, 1, 8000000);
  q('bg7', `BG-${y}-007`, 'kh2', D(-2), 'accepted', [3], 28, 1, 5000000);

  const cls = (id, cid, qid, start, days, region, groups, students, trainers2, status, extra = {}) => {
    const tier = tierFor(students); const price = tier ? tier.price : 0;
    const fees = trainers2.map((tid) => { const amount = (b.data.trainers.get(tid)?.dailyRate || 0) * days; const pays = status === 'done' ? (id === 'l2' ? [{ id: 'tt' + id + tid, date: addDays(start, -3), kind: 'Tạm ứng', amount: Math.round(amount / 2), note: 'Tạm ứng 50%' }] : [{ id: 'tt' + id + tid, date: addDays(start, days + 2), kind: 'Thanh toán', amount, note: 'Thanh toán sau lớp' }]) : status === 'confirmed' && start <= addDays(t, 3) ? [{ id: 'tu' + id + tid, date: addDays(start, -2), kind: 'Tạm ứng', amount: 1000000, note: 'Tạm ứng đi lại' }] : []; return { trainerId: tid, amount, auto: true, contractNo: status === 'done' ? `${id.toUpperCase()}/HĐGV-MẪU` : '', payments: pays }; });
    const otherCosts = [...(region === 'nam' ? [] : [{ id: 'oc1' + id, name: 'Đi lại – lưu trú', amount: 1800000 }]), { id: 'oc2' + id, name: 'Tài liệu – in thẻ/GCN', amount: 450000 }];
    put('classes', { id, customerId: cid, customerName: cname(cid), quoteId: qid, startDate: start, endDate: addDays(start, days - 1), startTime: '08:00', endTime: '17:00', region, groups, students, trainerIds: trainers2, status, kind: extra.kind || KINDS[1], price, priceMode: 'auto', fees, otherCosts, location: extra.location || 'Hội trường công ty khách hàng', files: [], passed: status === 'done' ? students : '', certIssued: status === 'done', ...extra });
  };
  // điều khoản thanh toán, phạt chậm, bảng giá chi tiết (mẫu)
  Object.assign(b.data.quotes.get('bg2'), { payTerm: { base: 'handover', days: 10, workdays: true, handover: 5 }, penaltyRate: 0.05, penaltyMax: 8 });
  Object.assign(b.data.quotes.get('bg3'), { payTerm: { base: 'before', days: 0, workdays: true, handover: 5 } });
  Object.assign(b.data.quotes.get('bg4'), { payTerm: { base: 'handover', days: 10, workdays: true, handover: 5 }, priceRows: [
    { id: 'g41', name: 'Huấn luyện ATVSLĐ Nhóm 1, 2', unit: 'người', min: '', max: '', qty: 20, price: 300000 },
    { id: 'g42', name: 'Huấn luyện ATVSLĐ Nhóm 3, 4', unit: 'lớp', min: 30, max: 50, qty: 3, price: 6000000 }] });
  put('quotes', { id: 'bg8', no: '', customerId: 'kh3', customerName: cname('kh3'), date: D(-30), status: 'signed', framework: true, groups: [1, 2, 3, 4, 5, 6], contractNo: `08/${y}/HĐNT/DAKO-PA`, contractDate: D(-30), contractAmount: null, amount: null, priceMode: 'manual', amountMode: 'manual',
    payTerm: { base: 'handover', days: 10, workdays: true, handover: 5 }, penaltyRate: 0.05, penaltyMax: 8, contractFiles: [], quoteFiles: [], payments: [], commissions: [], otherCosts: [],
    priceRows: [{ id: 'g81', name: 'Nhóm 1, 2', unit: 'người', min: '', max: '', qty: '', price: 300000 }, { id: 'g82', name: 'Nhóm 3', unit: 'lớp', min: 1, max: 29, qty: '', price: 5000000 }, { id: 'g83', name: 'Nhóm 3', unit: 'lớp', min: 30, max: 50, qty: '', price: 7500000 }, { id: 'g84', name: 'Nhóm 4', unit: 'người', min: '', max: '', qty: '', price: 150000 }],
    notes: 'Hợp đồng nguyên tắc mẫu – giá theo khung, thanh toán theo từng lớp.' });
  cls('l1', 'kh1', 'bg1', D(-45), 3, 'nam', [3, 4], 55, ['gv4'], 'done', { location: 'Xưởng vỏ tàu số 2' });
  cls('l2', 'kh1', 'bg1', D(-38), 3, 'nam', [3, 4], 55, ['gv3'], 'done', { location: 'Xưởng vỏ tàu số 2', invoiced: true });
  cls('l3', 'kh3', 'bg3', D(-8), 3, 'nam', [3], 24, ['gv3'], 'done', { location: 'Nhà xưởng Phú An', invoiced: true });
  cls('l4', 'kh2', 'bg2', D(2), 2, 'trung', [1, 2, 4], 45, ['gv6'], 'confirmed', { location: 'Phòng họp Cảng Vịnh Xanh' });
  cls('l5', 'kh4', 'bg4', D(1), 3, 'bac', [1, 2, 4], 50, ['gv7'], 'confirmed', { location: 'Công trường dự án A' });
  cls('l6', 'kh4', 'bg4', D(8), 3, 'bac', [3, 4], 50, ['gv7', 'gv8'], 'confirmed', { location: 'Công trường dự án A' });
  cls('l7', 'kh4', 'bg4', D(15), 3, 'bac', [3, 4], 50, ['gv8'], 'planned', { location: 'Công trường dự án B' });
  cls('l8', 'kh5', 'bg5', D(10), 2, 'bac', [3, 4], 40, [], 'planned', { location: 'Nhà máy Tân Việt' });
  cls('l9', 'kh6', 'bg6', D(5), 1, 'trung', [4, 6], 52, ['gv5'], 'planned', { location: 'Nhà máy Hải Đăng', kind: KINDS[0] });
  cls('l10', 'kh2', 'bg7', D(5), 2, 'trung', [3], 28, ['gv5'], 'confirmed', { location: 'Bãi container số 3' }); // cố ý trùng lịch gv5 để minh họa cảnh báo
  cls('l11', 'kh3', 'bg8', D(-1), 1, 'nam', [4], 20, ['gv1'], 'confirmed', { location: 'Nhà xưởng Phú An', kind: KINDS[2] });
  Object.assign(b.data.classes.get('l11'), { price: 3000000, priceMode: 'manual', priceRowId: 'g84' });
  cls('l12', 'kh1', null, D(-400), 3, 'nam', [3, 4], 60, ['gv4'], 'done', { location: 'Xưởng vỏ tàu số 1' });
  cls('l13', 'kh6', null, D(-700), 1, 'trung', [4], 35, ['gv5'], 'done', { location: 'Nhà máy Hải Đăng' });
  cls('l14', 'kh1', 'bg1', D(20), 2, 'nam', [3], 30, ['gv1', 'gv2'], 'planned', { location: 'Xưởng vỏ tàu số 2', kind: KINDS[0] });
  cls('l15', 'kh3', null, D(-3), 1, 'nam', [6], 12, ['gv2'], 'cancelled', { location: 'Nhà xưởng Phú An' });
  // sổ cấp thẻ/GCN mẫu
  const card = (fid, name, no, company, kind) => { const cv = document.createElement('canvas'); cv.width = 540; cv.height = 340; const g = cv.getContext('2d');
    g.fillStyle = '#ffffff'; g.fillRect(0, 0, 540, 340); g.fillStyle = '#1446b8'; g.fillRect(0, 0, 540, 64); g.fillStyle = '#fff'; g.font = 'bold 22px sans-serif'; g.fillText(kind.toUpperCase(), 20, 40);
    g.fillStyle = '#eef3fc'; g.fillRect(20, 84, 120, 160); g.fillStyle = '#0b2e7a'; g.font = 'bold 20px sans-serif'; g.fillText(name, 160, 112); g.font = '16px sans-serif'; g.fillText('Số: ' + no, 160, 146); g.fillText(company.slice(0, 40), 160, 176); g.fillText('DỮ LIỆU MẪU', 160, 230);
    b.files.set(fid, base64ToBlob(cv.toDataURL('image/png').split(',')[1], 'image/png')); return { id: fid, name: `The_${no.replace(/\W+/g, '-')}.png`, type: 'image/png', size: 12000, enc: 'raw', at: new Date().toISOString(), kind: 'the' }; };
  const names = ['NGUYỄN VĂN AN', 'TRẦN MINH BẢO', 'LÊ QUANG CƯỜNG', 'PHẠM VĂN DŨNG', 'HOÀNG ĐỨC EM', 'VŨ THỊ GIANG', 'ĐẶNG VĂN HẢI', 'BÙI QUỐC KHÁNH', 'ĐỖ MINH LONG', 'HỒ VĂN MẠNH', 'NGÔ THANH NAM', 'DƯƠNG VĂN PHÚC'];
  const roster = (id, cid, classId, qid, title, group, certType, from, to, issue, n, prefix, extra = {}) => {
    const students = names.slice(0, n).map((nm, i) => { const no = `${prefix}-${pad(i + 1)}/${issue.slice(0, 4)}`; return { k: `${id}-${i}`, stt: i + 1, name: nm, gender: i === 5 ? 'Nữ' : 'Nam', dob: `${pad(3 + i)}/0${1 + (i % 9)}/19${80 + i}`, nationality: 'Việt Nam', cccd: `0790${80 + i}00${1000 + i * 7}`, position: group === 3 ? ['Thợ hàn', 'Thợ lắp ráp', 'Vận hành cẩu'][i % 3] : 'Công nhân', certNo: no, result: 'Đạt', files: i < 3 ? [card(`fcard-${id}-${i}`, nm, no, cname(cid), certType)] : [] }; });
    put('rosters', { id, batchId: id, part: 1, title, customerId: cid, customerName: cname(cid), classId, quoteId: qid, groups: [group], certType, courseFrom: from, courseTo: to, hours: group === 3 ? 24 : 16, issueDate: issue, decisionNo: extra.decisionNo || '', decisionDate: issue, decisionFiles: [pdf('fqd-' + id, `Quyet-dinh-${id}.pdf`, 'QUYET DINH CAP THE / GCN', [title, `So hoc vien: ${n}`])], files: [], students, ...extra });
  };
  roster('ro1', 'kh1', 'l1', 'bg1', 'Thẻ an toàn nhóm 3 – Đóng tàu Sao Biển (mẫu)', 3, 'Thẻ an toàn', D(-45), D(-43), D(-42), 12, 'DAKO-N3', { decisionNo: '01/QĐ-N3-DAKO' });
  roster('ro2', 'kh6', 'l13', null, 'Sổ theo dõi nhóm 4 – Thủy sản Hải Đăng (mẫu)', 4, 'Sổ theo dõi', D(-700), D(-700), D(-700), 8, 'DAKO-N4', { decisionNo: '12/QĐ-N4-DAKO' });
  roster('ro3', 'kh1', 'l12', null, 'Thẻ an toàn nhóm 3 – Đóng tàu Sao Biển 2025 (mẫu)', 3, 'Thẻ an toàn', D(-700), D(-698), D(-697), 6, 'DAKO-N3-25', { decisionNo: '15/QĐ-N3-DAKO' });

  // hồ sơ giảng viên đủ thông tin hợp đồng (mẫu)
  const more = {
    gv4: { dob: '1979-04-12', gender: 'Nam', idNo: '079079000104', idDate: '2021-06-15', idPlace: 'Cục CS QLHC về TTXH', permAddress: '12 Đường số 5, P. Linh Trung, TP.HCM (mẫu)', email: 'tuan.mau@example.com', taxCode: '8000000104', bankAccount: '0100000000104', bankName: 'Vietcombank – CN TP.HCM', certNo: 'GV-104/2024/ATVSLĐ' },
    gv3: { dob: '1988-09-03', gender: 'Nam', idNo: '079088000103', idDate: '2022-02-20', idPlace: 'Cục CS QLHC về TTXH', email: 'bao.mau@example.com', taxCode: '8000000103', bankAccount: '0100000000103', bankName: 'ACB – CN Thủ Đức' },
    gv7: { dob: '1983-11-22', gender: 'Nam', bankAccount: '0100000000107', bankName: 'BIDV – CN Hà Nội' },
    gv6: { dob: '1985-02-08', gender: 'Nữ', idNo: '056085000106', idDate: '2021-09-01', idPlace: 'Cục CS QLHC về TTXH', taxCode: '8000000106', bankAccount: '0100000000106', bankName: 'Vietinbank – CN Khánh Hòa' },
  };
  for (const [id, x] of Object.entries(more)) Object.assign(b.data.trainers.get(id), x);
  // hợp đồng thỉnh giảng mẫu: 4 HĐ nguyên tắc (đã ký / chờ ký / sắp hết hạn), 2 phụ lục gắn lớp
  const co = DEFAULT_SETTINGS.company;
  const A = { name: co.name, nameVi: co.nameVi, address: co.address, taxCode: '', phone: co.phone, email: co.email, rep: co.director, repTitle: co.directorTitle, bankAccount: co.bankAccount, bankName: co.bankName };
  const B = (tid) => { const x = b.data.trainers.get(tid); return { name: x.name, dob: x.dob || '', gender: x.gender || '', idNo: x.idNo || '', idDate: x.idDate || '', idPlace: x.idPlace || '', address: x.permAddress || x.address || '', phone: x.phone, email: x.email || '', taxCode: x.taxCode || '', degree: x.degree || '', certNo: x.certNo || '', groups: x.groups.slice(), bankAccount: x.bankAccount || '', bankName: x.bankName || '' }; };
  const ntNo = (stt, d) => `${pad(stt)}/${d.slice(0, 4)}/HĐNT-ATVSLĐ`;
  const cnt = {}; const nextStt = (k, d) => (cnt[k + d.slice(0, 4)] = (cnt[k + d.slice(0, 4)] || 0) + 1);
  const nt = (id, tid, sign, to, status) => { const stt = nextStt('nt', sign); put('tcontracts', { id, kind: 'nt', trainerId: tid, trainerName: b.data.trainers.get(tid).name, no: ntNo(stt, sign), stt, year: Number(sign.slice(0, 4)), signDate: sign, signPlace: co.address, from: sign, to, term: 'custom', payDays: '07', withForm: true, partyA: A, partyB: B(tid), status, notes: '' }); };
  nt('hd3', 'gv6', D(-350), D(14), 'signed');
  nt('hd1', 'gv4', D(-100), addDays(addMonths(D(-100), 12), -1), 'signed');
  nt('hd2', 'gv3', D(-80), addDays(addMonths(D(-80), 12), -1), 'signed');
  nt('hd4', 'gv7', D(-3), addDays(addMonths(D(-3), 12), -1), 'draft');
  const classRow = (cid, tid) => { const c = b.data.classes.get(cid); const days = classDays(c); const rate = b.data.trainers.get(tid).dailyRate; return { id: 'r' + cid, classId: cid, customer: c.customerName, location: c.location || '', topic: classTopic(c), time: classTimeText(c), qty: days, unit: 'ngày', price: rate, amount: rate * days }; };
  const pl = (id, parent, tid, seq, sign, cids, travel) => {
    const stt = nextStt('pl', sign); const rows = cids.map((cid) => classRow(cid, tid)); const rec = { id, kind: 'pl', trainerId: tid, trainerName: b.data.trainers.get(tid).name, parentId: parent, parentNo: b.data.tcontracts.get(parent).no, parentDate: b.data.tcontracts.get(parent).signDate, seq, no: `${pad(stt)}/PLHĐ-ATVSLĐ`, stt, year: Number(sign.slice(0, 4)), signDate: sign, signPlace: co.address, payDays: '07', rows, travel, pitAuto: true, partyA: A, partyB: B(tid), status: 'signed', notes: '' };
    const mm = plMoney(rec); Object.assign(rec, { total: mm.total, pit: mm.pit, net: mm.net }); put('tcontracts', rec);
    // ghi vào thù lao lớp như khi lưu phụ lục thật
    let tl = mm.travel; let pl2 = mm.pit;
    rows.forEach((r, i) => {
      const last = i === rows.length - 1; const tr = last ? tl : Math.round((mm.travel * r.amount) / mm.total); const pt = last ? pl2 : Math.round((mm.pit * r.amount) / mm.total); tl -= tr; pl2 -= pt;
      const c = b.data.classes.get(r.classId); const fe = c.fees.find((x) => x.trainerId === tid);
      Object.assign(fe, { amount: r.amount + tr, travel: tr, pit: pt, auto: false, contractNo: rec.no, contractDate: sign, tcontractId: id });
      fe.payments.forEach((pp) => { if (pp.kind === 'Thanh toán') pp.amount = fe.amount - pt - sum(fe.payments.filter((q2) => q2 !== pp), (q2) => q2.amount); });
      c.costTrainer = sum(c.fees, (x) => x.amount);
    });
  };
  pl('pl1', 'hd1', 'gv4', 1, D(-47), ['l1'], 0);
  pl('pl2', 'hd2', 'gv3', 1, D(-40), ['l2', 'l3'], 500000);
  // sổ theo dõi số quyết định mẫu: 01, 02, 04 (bỏ trống 03), 05 dự thảo
  const dec = (id, stt, g, date, cid, classId, batchId, students, status, files = []) => put('decisions', { id, no: `${pad(stt)}/QĐ-N${g}-DAKO`, stt, group: g, year: Number(date.slice(0, 4)), date, title: `Công nhận hoàn thành khóa huấn luyện ATVSLĐ nhóm ${g}`, customerId: cid, customerName: cname(cid), classId, batchId, quoteId: b.data.classes.get(classId)?.quoteId || null, courseFrom: b.data.classes.get(classId).startDate, courseTo: b.data.classes.get(classId).endDate, students, certType: decPaper(g), signer: co.director, status, files, notes: '' });
  dec('dq1', 1, 3, D(-42), 'kh1', 'l1', 'ro1', 12, 'signed', [pdf('fq1', 'QD-01-N3.pdf', 'QUYET DINH 01/QD-N3-DAKO', ['Cong nhan hoan thanh khoa huan luyen ATVSLD nhom 3', 'Du lieu mau'])]);
  dec('dq2', 2, 3, D(-36), 'kh1', 'l2', null, 55, 'signed', [pdf('fq2', 'QD-02-N3.pdf', 'QUYET DINH 02/QD-N3-DAKO', ['Du lieu mau'])]);
  dec('dq3', 4, 3, D(-7), 'kh3', 'l3', null, 24, 'signed');
  dec('dq4', 5, 4, D(-1), 'kh3', 'l11', null, 20, 'draft');
  put('settings', { id: 'main', ...clone(DEFAULT_SETTINGS) });
  return b;
}
