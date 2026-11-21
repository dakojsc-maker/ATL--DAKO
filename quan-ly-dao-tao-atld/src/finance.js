/* ============================================================
   FINANCE – doanh thu (theo hợp đồng đã ký), chi phí giảng viên, hoa hồng (đã trừ thuế),
   chi phí khác, lợi nhuận; thù lao & công nợ giảng viên; kỳ báo cáo; học viên.
   Đào tạo ATVSLĐ không chịu thuế GTGT nên công cụ không tính VAT.
   ============================================================ */

const COMMISSION_TYPES = {
  agent: 'Hoa hồng đại lý',
  manager: 'Hoa hồng cán bộ quản lý (khách hàng)',
  other: 'Hoa hồng khác',
};
const CERT_TYPES = ['Giấy chứng nhận', 'Thẻ an toàn', 'Chứng chỉ', 'Sổ theo dõi'];
const PAY_KINDS = ['Tạm ứng', 'Thanh toán'];
const ZERO_COM = { gross: 0, tax: 0, net: 0, agent: 0, agentNet: 0, manager: 0, managerNet: 0, other: 0, otherNet: 0, unpaid: 0 };

/* ---------- báo giá & hợp đồng ---------- */
function quoteMoney(q) { const amount = Number(q.amount) || 0; return { amount, total: amount }; }
/** Hợp đồng nguyên tắc: giá theo khung, giá trị = tổng doanh thu các lớp xếp theo hợp đồng (trừ khi nhập giá trị cố định). */
const isFramework = (q) => !!(q && q.framework);
const contractValue = (q) => (q.contractAmount === 0 || q.contractAmount ? Number(q.contractAmount) || 0
  : isFramework(q) ? sum(quoteClasses(q).filter((c) => c.status !== 'cancelled'), (c) => c.price) : Number(q.amount) || 0);

/* ---------- bảng giá chi tiết / khung giá ---------- */
const PRICE_UNITS = ['người', 'lớp', 'khóa', 'gói'];
const rowAmount = (r) => Math.round((Number(r.qty) || 0) * (Number(r.price) || 0));
const priceRowsTotal = (q) => sum(q.priceRows || [], rowAmount);
/** Dòng khung giá hợp với lớp (theo số học viên trong khoảng từ–đến, nếu có ghi). */
function suggestPriceRow(q, students) {
  const rows = (q?.priceRows || []).filter((r) => Number(r.price) > 0);
  const n = Number(students) || 0;
  return rows.find((r) => (r.min || r.max) && n && (!r.min || n >= r.min) && (!r.max || n <= r.max)) || (rows.length === 1 ? rows[0] : null);
}
const priceFromRow = (r, students) => (r ? Math.round((Number(r.price) || 0) * (r.unit === 'người' ? Number(students) || 0 : 1)) : 0);

/* ---------- điều khoản thanh toán: tự tính hạn ---------- */
const PAY_BASES = { handover: 'sau khi DAKO bàn giao hồ sơ', classEnd: 'sau khi kết thúc khóa học', sign: 'kể từ ngày ký hợp đồng', before: 'trước khi mở lớp (trả trước)' };
function addWorkdays(iso, n) { let d = iso; let k = 0; while (k < n) { d = addDays(d, 1); const w = parseISO(d).getDay(); if (w !== 0 && w !== 6) k++; } return d; }
const addTermDays = (iso, n, work) => (n > 0 ? (work ? addWorkdays(iso, n) : addDays(iso, n)) : iso);
/** Hạn thanh toán: nhập tay (paymentDue) hoặc tự tính theo điều khoản payTerm {base, days, workdays, handover}. */
function dueOf(q) {
  if (!q) return null;
  if (q.paymentDue) return { date: q.paymentDue, auto: false };
  const t = q.payTerm; if (!t || !t.base) return null;
  const work = t.workdays !== false;
  if (t.base === 'sign') return q.contractDate ? { date: addTermDays(q.contractDate, Number(t.days) || 0, work), auto: true } : null;
  const cls = quoteClasses(q).filter((c) => c.status !== 'cancelled');
  if (!cls.length) return null;
  if (t.base === 'before') return { date: cls.map((c) => c.startDate).sort()[0], auto: true };
  const ends = cls.map((c) => c.endDate || c.startDate).sort();
  let base = isFramework(q) ? ends[0] : ends[ends.length - 1];
  if (t.base === 'handover') base = addTermDays(base, Number(t.handover ?? 5) || 0, work);
  return { date: addTermDays(base, Number(t.days) || 0, work), auto: true };
}
const dueDate = (q) => dueOf(q)?.date || '';
function payTermText(q) {
  const t = q.payTerm; if (!t || !t.base) return '';
  const unit = t.workdays !== false ? 'ngày làm việc' : 'ngày';
  if (t.base === 'before') return 'Bên A thanh toán 100% giá trị hợp đồng cho Bên B trước khi Bên B tổ chức huấn luyện.';
  const d = Number(t.days) || 0;
  const what = isFramework(q) ? 'giá trị từng đợt huấn luyện' : 'giá trị hợp đồng';
  if (t.base === 'sign') return `Bên A thanh toán 100% ${what} cho Bên B trong vòng ${pad(d)} ${unit} kể từ ngày ký hợp đồng.`;
  if (t.base === 'classEnd') return `Bên A thanh toán 100% ${what} cho Bên B trong vòng ${pad(d)} ${unit} kể từ ngày kết thúc khóa huấn luyện.`;
  return `Bên A thanh toán 100% ${what} cho Bên B trong vòng ${pad(d)} ${unit} kể từ ngày Bên B bàn giao đầy đủ hồ sơ nghiệm thu khóa học.`;
}
/** Phạt chậm thanh toán: %/ngày × số tiền chậm trả × số ngày, tối đa % giá trị hợp đồng. */
function penaltyOf(q, t = todayISO()) {
  const rate = Number(q.penaltyRate) || 0; if (!rate) return null;
  const due = dueOf(q); const m = contractMoney(q);
  if (!due || due.date >= t || m.remain <= 0) return { days: 0, amount: 0 };
  const days = daysBetween(due.date, t);
  let amount = Math.round((m.remain * rate * days) / 100);
  const cap = Number(q.penaltyMax) || 0; if (cap) amount = Math.min(amount, Math.round((m.total * cap) / 100));
  return { days, amount };
}
const fmtPct = (n) => String(Number(n) || 0).replace('.', ',');
function contractMoney(q) {
  const amount = contractValue(q);
  const paid = sum(q.payments || [], (p) => p.amount);
  return { amount, total: amount, paid, remain: Math.max(0, amount - paid) };
}
function contractState(q) {
  const m = contractMoney(q);
  const cls = quoteClasses(q).filter((c) => c.status !== 'cancelled');
  const allDone = cls.length > 0 && cls.every((c) => c.status === 'done');
  if (m.total > 0 && m.remain <= 0 && (allDone || !cls.length)) return { label: 'Hoàn tất', tone: 'ok' };
  const due = dueDate(q);
  if (m.remain > 0 && due && due < todayISO()) return { label: 'Quá hạn thanh toán', tone: 'bad' };
  if (allDone && m.remain > 0) return { label: 'Đã dạy xong – chờ thu', tone: 'warn' };
  if (m.total > 0 && m.remain <= 0) return { label: 'Đã thu đủ', tone: 'ok' };
  return { label: 'Đang thực hiện', tone: 'info' };
}
const contractOfClass = (c) => { const q = c && c.quoteId && quote(c.quoteId); return q && isContract(q) ? q : null; };
const liveClassesOf = (q) => quoteClasses(q).filter((c) => c.status !== 'cancelled');

/* ---------- hoa hồng: thuế khấu trừ ---------- */
const comTaxRate = (c) => (c && (c.taxRate === 0 || c.taxRate) ? Number(c.taxRate) : Number(settings().commissionTax ?? 20));
const comTaxMode = () => (settings().commissionTaxMode === 'gross' ? 'gross' : 'net');
/** Thuế trên hoa hồng. Mặc định ('net'): thuế = % × số thực trả → 30 tr, 20% ⇒ thuế 5 tr, thực trả 25 tr. */
function commissionTax(gross, rate, mode = comTaxMode()) {
  gross = Number(gross) || 0; rate = Number(rate) || 0;
  if (gross <= 0 || rate <= 0) return 0;
  return Math.round(mode === 'gross' ? (gross * rate) / 100 : (gross * rate) / (100 + rate));
}
function commissionGrossFromNet(net, rate, mode = comTaxMode()) {
  net = Number(net) || 0; rate = Number(rate) || 0;
  if (net <= 0) return 0;
  if (mode === 'gross') return rate >= 100 ? net : Math.round(net / (1 - rate / 100));
  return Math.round(net * (1 + rate / 100));
}
function commissionLine(c) {
  const gross = Number(c.amount) || 0; const rate = comTaxRate(c); const tax = commissionTax(gross, rate);
  return { gross, rate, tax, net: gross - tax };
}
function commissionTotals(list) {
  const t = { ...ZERO_COM };
  for (const c of list || []) {
    const l = commissionLine(c);
    const k = c.type === 'agent' ? 'agent' : c.type === 'manager' ? 'manager' : 'other';
    t.gross += l.gross; t.tax += l.tax; t.net += l.net; t[k] += l.gross; t[k + 'Net'] += l.net;
    if (!c.paidDate) t.unpaid += l.net;
  }
  return t;
}
const scaleCom = (ct, k) => Object.fromEntries(Object.entries(ct).map(([key, v]) => [key, v * k]));

/* ---------- chi phí khác ---------- */
function classOtherCosts(c) {
  if (Array.isArray(c.otherCosts)) return c.otherCosts;
  const out = [];
  if (Number(c.costTravel)) out.push({ id: 'travel', name: 'Đi lại – lưu trú', amount: Number(c.costTravel) });
  if (Number(c.costOther)) out.push({ id: 'other', name: 'Chi phí khác', amount: Number(c.costOther) });
  return out;
}
const costSum = (list) => sum(list || [], (x) => x.amount);

/* ---------- thù lao giảng viên theo lớp ---------- */
function classFees(c) {
  const ids = c.trainerIds || [];
  if (Array.isArray(c.fees)) {
    const out = ids.map((tid) => c.fees.find((f) => f.trainerId === tid) || { trainerId: tid, amount: 0, payments: [] });
    for (const f of c.fees) if (!ids.includes(f.trainerId) && (f.payments || []).length) out.push({ ...f, removed: true });
    return out;
  }
  // dữ liệu nhập trước bản 2.0: một ô "thù lao giảng viên" cho cả lớp → chia theo thù lao/ngày (hoặc chia đều)
  const total = Number(c.costTrainer) || 0;
  const rates = ids.map((tid) => Number(trainer(tid)?.dailyRate) || 0);
  const rsum = rates.reduce((a, b) => a + b, 0);
  return ids.map((tid, i) => ({ trainerId: tid, amount: Math.round(rsum ? (total * rates[i]) / rsum : total / ids.length), payments: [] }));
}
const feePaid = (f) => sum(f.payments || [], (p) => p.amount);
/** Thù lao một GV ở một lớp. amount = thù lao trước thuế (chi phí của DAKO); pit = thuế TNCN DAKO khấu trừ, nộp thay
 *  → số phải trả giảng viên = amount − pit; còn lại = amount − pit − đã trả. */
function feeState(f, cancelled = false) {
  const amount = cancelled || f.removed ? 0 : Number(f.amount) || 0;
  const pit = amount ? Math.min(amount, Number(f.pit) || 0) : 0;
  const paid = feePaid(f);
  const remain = amount - pit - paid;
  const base = { amount, pit, paid, remain };
  if ((cancelled || f.removed) && paid > 0) return { ...base, label: 'Cần thu hồi tạm ứng', tone: 'bad' };
  if (amount <= 0) return { ...base, remain: 0, label: 'Chưa nhập thù lao', tone: 'muted' };
  if (remain < 0) return { ...base, label: 'Trả dư', tone: 'warn' };
  if (remain === 0) return { ...base, label: 'Đã thanh toán đủ', tone: 'ok' };
  if (paid > 0) return { ...base, label: 'Đã tạm ứng – còn nợ', tone: 'warn' };
  return { ...base, label: 'Chưa thanh toán', tone: 'info' };
}
const classGv = (c) => (c.status === 'cancelled' ? 0 : sum(classFees(c), (f) => (f.removed ? feePaid(f) : f.amount)));
const feeAuto = (tid, c) => (Number(trainer(tid)?.dailyRate) || 0) * classDays(c);

/** Toàn bộ thù lao của một giảng viên (mọi lớp), có thể lọc theo ngày lớp. */
function trainerLedger(tid, from, to) {
  const rows = [];
  for (const c of S.classes) {
    if (from && c.startDate < from) continue;
    if (to && c.startDate > to) continue;
    const cancelled = c.status === 'cancelled';
    for (const f of classFees(c)) {
      if (f.trainerId !== tid) continue;
      const st = feeState(f, cancelled);
      if ((cancelled || f.removed) && !st.paid) continue;
      rows.push({ c, f, ...st, days: classDays(c) });
    }
  }
  rows.sort((a, b) => sortClasses(a.c, b.c));
  return { rows, amount: sum(rows, (r) => r.amount), pit: sum(rows, (r) => r.pit), paid: sum(rows, (r) => r.paid), remain: sum(rows, (r) => Math.max(0, r.remain)), days: sum(rows, (r) => (r.amount ? r.days : 0)) };
}

/* ---------- lợi nhuận ---------- */
/** Tỷ lệ phân bổ chi phí cấp hợp đồng (hoa hồng, chi phí khác) cho một lớp: theo giá lớp, rồi theo số học viên, rồi chia đều. */
function classShare(c, q, draft) {
  if (c.status === 'cancelled') return 0;
  let cls = liveClassesOf(q).map((x) => (draft && x.id === draft.id ? draft : x));
  if (draft && !cls.some((x) => x.id === draft.id)) cls.push(draft);
  cls = cls.filter((x) => x.status !== 'cancelled');
  if (!cls.length) return 0;
  const tp = sum(cls, (x) => x.price); if (tp > 0) return (Number(c.price) || 0) / tp;
  const ts = sum(cls, (x) => x.students); if (ts > 0) return (Number(c.students) || 0) / ts;
  return 1 / cls.length;
}
function contractPnl(q) {
  const rev = contractValue(q);
  const cls = liveClassesOf(q);
  const gvClasses = sum(cls, classGv);
  const gvEst = Number(q.gvEstimate) || 0;
  const gvEstimated = gvClasses <= 0 && gvEst > 0;
  const gv = gvEstimated ? gvEst : gvClasses;
  const otherClasses = sum(cls, (c) => costSum(classOtherCosts(c)));
  const otherContract = costSum(q.otherCosts);
  const com = commissionTotals(q.commissions);
  const other = otherClasses + otherContract;
  const cost = gv + com.gross + other;
  const m = contractMoney(q);
  const notes = [];
  if (!gv) notes.push(cls.length ? 'Lớp chưa nhập thù lao GV' : 'Chưa gắn lớp / chưa nhập chi phí GV');
  if (gvEstimated) notes.push('Chi phí GV đang là số ước tính');
  return { rev, gv, gvClasses, gvEstimated, otherClasses, otherContract, other, com, cost, profit: rev - cost, margin: rev ? (rev - cost) / rev : 0, classes: cls, paid: m.paid, remain: m.remain, notes };
}
/** Lãi/lỗ của một lớp: doanh thu lớp – thù lao GV – chi phí khác của lớp – phần hoa hồng & chi phí khác phân bổ từ hợp đồng. */
function classPnl(c, draft) {
  const x = draft || c;
  const live = x.status !== 'cancelled';
  const rev = live ? Number(x.price) || 0 : 0;
  const gv = classGv(x);
  const otherOwn = live ? costSum(classOtherCosts(x)) : 0;
  const q = live ? contractOfClass(x) : null;
  let share = 0; let com = { ...ZERO_COM }; let otherAlloc = 0;
  if (q) {
    share = classShare(x, q, draft);
    com = scaleCom(commissionTotals(q.commissions), share);
    otherAlloc = costSum(q.otherCosts) * share;
  }
  const other = otherOwn + otherAlloc;
  const cost = gv + com.gross + other;
  return { rev, total: rev, gv, otherOwn, otherAlloc, other, com, share, contract: q, cost, profit: rev - cost, margin: rev ? (rev - cost) / rev : 0 };
}
const classMoney = (c) => classPnl(c);
const pct = (x) => `${Math.round((Number(x) || 0) * 100)}%`;

/* ---------- kỳ báo cáo ---------- */
const GRAN = { day: 'ngày', week: 'tuần', month: 'tháng', quarter: 'quý', year: 'năm' };
function isoWeek(iso) {
  const d = parseISO(iso);
  const t = new Date(d.getFullYear(), d.getMonth(), d.getDate() + 3 - ((d.getDay() + 6) % 7));
  const w1 = new Date(t.getFullYear(), 0, 4);
  return { year: t.getFullYear(), week: 1 + Math.round(((t - w1) / 86400000 - 3 + ((w1.getDay() + 6) % 7)) / 7) };
}
function periodOf(iso, gran) {
  const d = parseISO(iso); const y = d.getFullYear(); const m = d.getMonth();
  if (gran === 'year') return { key: `${y}`, label: `Năm ${y}`, start: `${y}-01-01`, end: `${y}-12-31` };
  if (gran === 'quarter') { const q = Math.floor(m / 3); return { key: `${y}-Q${q + 1}`, label: `Quý ${['I', 'II', 'III', 'IV'][q]}/${y}`, start: isoOf(new Date(y, q * 3, 1)), end: isoOf(new Date(y, q * 3 + 3, 0)) }; }
  if (gran === 'month') { const ym = iso.slice(0, 7); return { key: ym, label: fmtYM(ym), start: ym + '-01', end: monthEnd(ym) }; }
  if (gran === 'day') return { key: iso, label: `${DOW_LONG[d.getDay()]} ${fmtD(iso)}`, start: iso, end: iso };
  const start = addDays(iso, -((d.getDay() + 6) % 7)); const end = addDays(start, 6); const w = isoWeek(start);
  return { key: start, label: `Tuần ${w.week}/${w.year} (${fmtDM(start)}–${fmtDM(end)})`, start, end };
}
/** Các kỳ phủ khoảng [from, to]; tuần chỉ lấy kỳ có dữ liệu (onlyKeys). */
function periodsBetween(from, to, gran, onlyKeys) {
  const out = []; const seen = new Set();
  let cur = from;
  for (let guard = 0; cur <= to && guard < 2000; guard++) {
    const p = periodOf(cur, gran);
    if (!seen.has(p.key)) { seen.add(p.key); out.push(p); }
    cur = addDays(p.end, 1);
  }
  return (gran === 'week' || gran === 'day') && onlyKeys ? out.filter((p) => onlyKeys.has(p.key)) : out;
}

/* ---------- học viên (sổ cấp thẻ/GCN) ---------- */
let STUDENT_CACHE = { src: null, list: [] };
/** Học viên phẳng: mỗi phần tử { s, r, v } – v là thông tin đã gộp từ đợt cấp. */
function allStudents() {
  if (STUDENT_CACHE.src === S.rosters) return STUDENT_CACHE.list;
  const list = [];
  for (const r of S.rosters) {
    (r.students || []).forEach((s, i) => list.push({ s, r, v: studentView(s, r), i }));
  }
  list.sort((a, b) => (b.v.issueDate || '').localeCompare(a.v.issueDate || '') || (a.r.customerName || '').localeCompare(b.r.customerName || '', 'vi') || (Number(a.s.stt) || a.i) - (Number(b.s.stt) || b.i));
  STUDENT_CACHE = { src: S.rosters, list };
  return list;
}
function studentView(s, r) {
  const group = Number(s.group) || Number((r.groups || [])[0]) || null;
  const certType = s.certType || r.certType || (group ? (GROUPS[group]?.paper === 'GCN' ? 'Giấy chứng nhận' : GROUPS[group]?.paper) : '') || '';
  const issueDate = s.issueDate || r.issueDate || '';
  const from = s.from || r.courseFrom || ''; const to = s.to || r.courseTo || '';
  let expiry = s.expiry || ''; let expiryAuto = false;
  if (!expiry && issueDate && certType !== 'Sổ theo dõi') { expiry = addMonths(issueDate, Number(settings().cycleMonths?.[group]) || 24); expiryAuto = true; }
  return {
    name: s.name || '', certNo: s.certNo || '', cccd: s.cccd || '', dob: s.dob || '', group, certType, issueDate, from, to, expiry, expiryAuto,
    customerId: r.customerId || null, company: r.customerName || s.company || '', hours: s.hours || r.hours || '', content: s.content || r.content || '',
  };
}
function certStatus(exp) {
  if (!exp) return { key: 'none', label: 'Không ghi hạn', tone: 'muted' };
  const d = daysBetween(todayISO(), exp);
  if (d < 0) return { key: 'expired', label: 'Hết hạn', tone: 'bad' };
  if (d <= (Number(settings().warnDays) || 60)) return { key: 'soon', label: `Còn ${d} ngày`, tone: 'warn' };
  return { key: 'valid', label: 'Còn hạn', tone: 'ok' };
}
const studentFiles = (s, kinds) => (s.files || []).filter((f) => !kinds || kinds.includes(f.kind || 'khac'));
const FILE_KIND = { the: 'Hình thẻ/GCN', anh: 'Ảnh 3×4', qd: 'Quyết định', khac: 'Hồ sơ khác' };
const rosterCount = (r) => (r.students || []).length;
function rostersOfBatch(batchId) { return S.rosters.filter((r) => (r.batchId || r.id) === batchId).sort((a, b) => (a.part || 1) - (b.part || 1)); }

/* ---------- cảnh báo tài chính & học viên (gộp vào mục Cần chú ý) ---------- */
function financeAlerts() {
  const out = []; const t = todayISO();
  // công nợ thù lao giảng viên cho các lớp đã dạy xong
  for (const tr of S.trainers) {
    const L = trainerLedger(tr.id);
    const due = L.rows.filter((r) => r.remain > 0 && (r.c.endDate || r.c.startDate) < t);
    if (due.length) out.push({ sev: 'warn', text: `Còn nợ thù lao giảng viên ${tr.name}: ${moneyD(sum(due, (r) => r.remain))} (${due.length} lớp đã dạy xong)`, act: 'trainer-view', id: tr.id });
    const back = L.rows.filter((r) => r.label === 'Cần thu hồi tạm ứng');
    if (back.length) out.push({ sev: 'warn', text: `${tr.name}: đã tạm ứng ${moneyD(sum(back, (r) => r.paid))} cho lớp đã hủy – cần thu hồi`, act: 'trainer-view', id: tr.id });
  }
  for (const c of S.classes) {
    if (c.status === 'cancelled' || !(c.trainerIds || []).length) continue;
    if ((c.endDate || c.startDate) < t && classFees(c).some((f) => !f.removed && !(Number(f.amount) > 0))) out.push({ sev: 'info', text: `Lớp ${classLabel(c)} (${fmtDateRange(c.startDate, c.endDate)}) chưa nhập thù lao giảng viên`, act: 'class-view', id: c.id });
  }
  for (const q of S.quotes) {
    if (!isContract(q)) continue;
    const p = contractPnl(q);
    if (!p.gv) out.push({ sev: 'info', text: `Hợp đồng ${q.contractNo || q.no} – ${q.customerName}: chưa có chi phí giảng viên nên lợi nhuận chưa chính xác`, act: 'pnl-view', id: q.id });
    if (p.remain <= 0 && p.rev > 0 && p.com.unpaid > 0) out.push({ sev: 'info', text: `Hợp đồng ${q.contractNo || q.no} – ${q.customerName} đã thu đủ, còn hoa hồng chưa chi ${moneyD(p.com.unpaid)}`, act: 'pnl-view', id: q.id });
  }
  // thẻ/GCN sắp hết hạn theo công ty – cơ hội huấn luyện định kỳ
  const byCo = new Map();
  for (const x of allStudents()) {
    const st = certStatus(x.v.expiry);
    if (st.key !== 'soon' && !(st.key === 'expired' && daysBetween(x.v.expiry, t) <= 90)) continue;
    const key = x.v.customerId || x.v.company; if (!key) continue;
    const g = byCo.get(key) || { company: x.v.company, cid: x.v.customerId, soon: 0, expired: 0, first: x.v.expiry };
    if (st.key === 'soon') g.soon++; else g.expired++;
    if (x.v.expiry < g.first) g.first = x.v.expiry;
    byCo.set(key, g);
  }
  for (const g of byCo.values()) out.push({ sev: 'info', text: `${g.company}: ${g.soon ? `${g.soon} thẻ/GCN sắp hết hạn` : ''}${g.soon && g.expired ? ', ' : ''}${g.expired ? `${g.expired} thẻ/GCN vừa hết hạn` : ''} (sớm nhất ${fmtD(g.first)}) – cơ hội huấn luyện định kỳ`, act: g.cid ? 'customer-view' : 'goto-students', id: g.cid || g.company });
  return out;
}
