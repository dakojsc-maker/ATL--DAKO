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
    ['gv1', 'Nguyễn Văn Hòa', '0900 000 101', 'nam', ['An toàn điện', 'Làm việc trên cao', 'Quản lý công tác ATVSLĐ'], [1, 2, 3, 4], 'Kỹ sư điện', 15, 1500000, 'Cơ hữu', D(420), []],
    ['gv2', 'Trần Thị Mai Anh', '0900 000 102', 'nam', ['Sơ cấp cứu', 'Y tế lao động', 'Vệ sinh lao động – môi trường'], [4, 5, 6], 'Bác sĩ y học lao động', 11, 1400000, 'Cộng tác viên', D(35), ['trung']],
    ['gv3', 'Lê Quốc Bảo', '0900 000 103', 'nam', ['Thiết bị nâng – xe nâng', 'Hàn, cắt kim loại'], [3, 4], 'Kỹ sư cơ khí', 9, 1200000, 'Cộng tác viên', D(300), []],
    ['gv4', 'Phạm Minh Tuấn', '0900 000 104', 'nam', ['Đóng tàu – sửa chữa tàu', 'Không gian hạn chế', 'Nghiệp vụ ATVSLĐ'], [2, 3, 4], 'Kỹ sư vỏ tàu', 18, 1600000, 'Cơ hữu', D(600), []],
    ['gv5', 'Võ Thành Nhân', '0900 000 105', 'trung', ['Cảng biển – xếp dỡ hàng hóa', 'Thiết bị nâng – xe nâng'], [3, 4, 6], 'Kỹ sư khai thác cảng', 12, 1300000, 'Cộng tác viên', D(500), []],
    ['gv6', 'Huỳnh Thị Thu Hà', '0900 000 106', 'trung', ['Quản lý công tác ATVSLĐ', 'Nghiệp vụ ATVSLĐ', 'PCCC & cứu nạn cứu hộ'], [1, 2, 4], 'Thạc sĩ Bảo hộ lao động', 14, 1500000, 'Thỉnh giảng', D(-10), []],
    ['gv7', 'Đỗ Đức Thắng', '0900 000 107', 'bac', ['Xây dựng', 'Làm việc trên cao', 'An toàn điện'], [1, 2, 3, 4], 'Kỹ sư xây dựng', 16, 1500000, 'Cộng tác viên', D(700), []],
    ['gv8', 'Bùi Thị Lan', '0900 000 108', 'bac', ['Hóa chất', 'Vệ sinh lao động – môi trường'], [3, 4, 5], 'Kỹ sư hóa', 8, 1200000, 'Cộng tác viên', D(250), []],
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
    put('quotes', { id, no, customerId: cid, customerName: cname(cid), date, validUntil: addDays(date, 30), status, groups, students, classCount, unitPrice: unit, amount: unit * classCount, priceMode: 'auto', amountMode: 'auto', vatRate: 8, owner: 'Phòng Đào tạo', contact: customers.find((c) => c[0] === cid)[4], contactPhone: customers.find((c) => c[0] === cid)[5], quoteFiles: [pdf('fq' + id, `Bao-gia-${no}.pdf`, `BAO GIA ${no}`, ['Huan luyen an toan, ve sinh lao dong', `So hoc vien du kien: ${students}`, `So lop: ${classCount}`, `Don gia/lop: ${money(unit)} VND (chua VAT)`, 'Hieu luc: 30 ngay'])], contractFiles: [], payments: [], ...extra });
  };
  const y = t.slice(0, 4);
  q('bg1', `BG-${y}-001`, 'kh1', D(-60), 'signed', [3, 4], 110, 2, 8000000, { contractNo: `HĐ-${y}-01/DAKO-SB`, contractDate: D(-52), paymentDue: D(-5), contractFiles: [pdf('fc1', `Hop-dong-${y}-01.pdf`, `HOP DONG ${y}-01`, ['Ben A: Cong ty TNHH Dong tau Sao Bien (mau)', 'Ben B: Cong ty CP Ky thuat Hang hai DAKO', 'Noi dung: Huan luyen ATVSLD nhom 3, nhom 4', 'Gia tri: 16.000.000 VND (chua VAT)'])], payments: [{ id: 'p1', date: D(-40), amount: 8640000, note: 'Tạm ứng 50%' }] });
  q('bg2', `BG-${y}-002`, 'kh2', D(-35), 'signed', [1, 2, 4], 45, 1, 8000000, { contractNo: `HĐ-${y}-02/DAKO-VX`, contractDate: D(-28), paymentDue: D(30), contractFiles: [pdf('fc2', `Hop-dong-${y}-02.pdf`, `HOP DONG ${y}-02`, ['Ben A: Cong ty CP Cang Vinh Xanh (mau)', 'Noi dung: Huan luyen ATVSLD nhom 1, 2, 4'])] });
  q('bg3', `BG-${y}-003`, 'kh3', D(-20), 'signed', [3], 24, 1, 5000000, { contractNo: `HĐ-${y}-03/DAKO-PA`, contractDate: D(-15), paymentDue: D(20), contractFiles: [pdf('fc3', `Hop-dong-${y}-03.pdf`, `HOP DONG ${y}-03`, ['Ben A: Cong ty TNHH Co khi Phu An (mau)'])], payments: [{ id: 'p2', date: D(-10), amount: 5400000, note: 'Thanh toán đủ' }] });
  q('bg4', `BG-${y}-004`, 'kh4', D(-18), 'signed', [1, 2, 3, 4], 150, 3, 8000000, { contractNo: `HĐ-${y}-04/DAKO-HL`, contractDate: D(-9), paymentDue: D(45) });
  q('bg5', `BG-${y}-005`, 'kh5', D(-12), 'negotiating', [3, 4, 5], 80, 2, 8000000);
  q('bg6', `BG-${y}-006`, 'kh6', D(-4), 'sent', [4, 6], 52, 1, 8000000);
  q('bg7', `BG-${y}-007`, 'kh2', D(-2), 'accepted', [3], 28, 1, 5000000);

  const cls = (id, cid, qid, start, days, region, groups, students, trainers2, status, extra = {}) => {
    const tier = tierFor(students); const price = tier ? tier.price : 0;
    const daysN = days; const cost = sum(trainers2, (tid) => (b.data.trainers.get(tid)?.dailyRate || 0) * daysN);
    put('classes', { id, customerId: cid, customerName: cname(cid), quoteId: qid, startDate: start, endDate: addDays(start, days - 1), startTime: '08:00', endTime: '17:00', region, groups, students, trainerIds: trainers2, status, kind: extra.kind || KINDS[1], price, priceMode: 'auto', vatRate: 8, costTrainer: cost, costTrainerMode: 'auto', costTravel: region === 'nam' ? 0 : 1800000, costOther: 450000, location: extra.location || 'Hội trường công ty khách hàng', files: [], passed: status === 'done' ? students : '', certIssued: status === 'done', ...extra });
  };
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
  cls('l11', 'kh3', null, D(-1), 1, 'nam', [4], 20, ['gv1'], 'confirmed', { location: 'Nhà xưởng Phú An', kind: KINDS[2] });
  cls('l12', 'kh1', null, D(-400), 3, 'nam', [3, 4], 60, ['gv4'], 'done', { location: 'Xưởng vỏ tàu số 1' });
  cls('l13', 'kh6', null, D(-700), 1, 'trung', [4], 35, ['gv5'], 'done', { location: 'Nhà máy Hải Đăng' });
  cls('l14', 'kh1', 'bg1', D(20), 2, 'nam', [3], 30, ['gv1', 'gv2'], 'planned', { location: 'Xưởng vỏ tàu số 2', kind: KINDS[0] });
  cls('l15', 'kh3', null, D(-3), 1, 'nam', [6], 12, ['gv2'], 'cancelled', { location: 'Nhà xưởng Phú An' });
  put('settings', { id: 'main', ...clone(DEFAULT_SETTINGS) });
  return b;
}
