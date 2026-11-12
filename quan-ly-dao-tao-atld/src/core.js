'use strict';
/* ============================================================
   CORE – hằng số nghiệp vụ, tiện ích ngày/tiền, tính toán
   ============================================================ */

const APP_VERSION = '1.0';

const DEFAULT_SETTINGS = {
  priceTiers: [
    { min: 1, max: 29, price: 5000000 },
    { min: 30, max: 60, price: 8000000 },
  ],
  vatRate: 8,
  regions: [
    { id: 'nam', name: 'Miền Nam', center: 'TP.HCM' },
    { id: 'trung', name: 'Miền Trung – Tây Nguyên', center: 'Nha Trang' },
    { id: 'bac', name: 'Miền Bắc', center: 'Hà Nội' },
  ],
  // Số giờ huấn luyện lần đầu tối thiểu theo nhóm (Điều 19 NĐ 44/2016, sửa đổi bởi NĐ 140/2018) – chỉnh trong Cài đặt
  groupHours: { 1: 16, 2: 48, 3: 24, 4: 16, 5: 16, 6: 4 },
  // Chu kỳ nhắc huấn luyện định kỳ (tháng) – chỉnh trong Cài đặt
  cycleMonths: { 1: 24, 2: 24, 3: 24, 4: 12, 5: 24, 6: 24 },
  hoursPerDay: 8,
  dayStart: '08:00',
  dayEnd: '17:00',
  specialties: [
    'Quản lý công tác ATVSLĐ', 'Nghiệp vụ ATVSLĐ', 'An toàn điện', 'Làm việc trên cao',
    'Thiết bị nâng – xe nâng', 'Thiết bị áp lực – nồi hơi', 'Hàn, cắt kim loại', 'Không gian hạn chế',
    'Hóa chất', 'PCCC & cứu nạn cứu hộ', 'Sơ cấp cứu', 'Y tế lao động',
    'Đóng tàu – sửa chữa tàu', 'Cảng biển – xếp dỡ hàng hóa', 'Xây dựng', 'Vệ sinh lao động – môi trường',
  ],
  quoteFollowDays: 7,
  warnDays: 60,
};

const GROUPS = {
  1: { short: 'N1', desc: 'Người quản lý phụ trách công tác ATVSLĐ', paper: 'GCN' },
  2: { short: 'N2', desc: 'Người làm công tác ATVSLĐ', paper: 'GCN' },
  3: { short: 'N3', desc: 'Người làm công việc có yêu cầu nghiêm ngặt về ATVSLĐ', paper: 'Thẻ an toàn' },
  4: { short: 'N4', desc: 'Người lao động không thuộc nhóm 1, 2, 3, 5, 6', paper: 'Sổ theo dõi' },
  5: { short: 'N5', desc: 'Người làm công tác y tế', paper: 'GCN' },
  6: { short: 'N6', desc: 'An toàn, vệ sinh viên', paper: 'GCN' },
};

const KINDS = ['Huấn luyện lần đầu', 'Huấn luyện định kỳ', 'Huấn luyện bổ sung', 'Huấn luyện lại'];

const CLASS_STATUS = {
  planned: { label: 'Dự kiến', tone: 'muted' },
  confirmed: { label: 'Đã chốt lịch', tone: 'info' },
  done: { label: 'Hoàn thành', tone: 'ok' },
  cancelled: { label: 'Đã hủy', tone: 'bad' },
};

const QUOTE_STATUS = {
  draft: { label: 'Đang soạn', tone: 'muted' },
  sent: { label: 'Đã gửi khách', tone: 'info' },
  negotiating: { label: 'Đang thương thảo', tone: 'warn' },
  accepted: { label: 'Đồng ý – chờ ký HĐ', tone: 'accent' },
  signed: { label: 'Đã ký hợp đồng', tone: 'ok' },
  rejected: { label: 'Không thành công', tone: 'bad' },
};

const EMPLOYMENT = ['Cơ hữu', 'Cộng tác viên', 'Thỉnh giảng'];

const REGION_VARS = ['--r-nam', '--r-trung', '--r-bac', '--r-x1', '--r-x2', '--r-x3'];

/* ---------- generic helpers ---------- */
const $ = (sel, root = document) => root.querySelector(sel);
const $$ = (sel, root = document) => Array.from(root.querySelectorAll(sel));
const esc = (v) => String(v ?? '').replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const uid = (p = '') => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 8);
const norm = (s) => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase().replace(/\s+/g, ' ').trim();
const clone = (o) => JSON.parse(JSON.stringify(o));
const sum = (arr, f) => arr.reduce((s, x) => s + (Number(f(x)) || 0), 0);
const uniq = (arr) => Array.from(new Set(arr));
const initials = (name) => {
  const parts = String(name || '').trim().split(/\s+/).filter(Boolean);
  if (!parts.length) return '?';
  const last = parts[parts.length - 1];
  return (parts.length > 1 ? parts[0][0] + last[0] : last.slice(0, 2)).toUpperCase();
};
const debounce = (fn, ms) => { let t; return (...a) => { clearTimeout(t); t = setTimeout(() => fn(...a), ms); }; };

/* ---------- dates (ISO yyyy-mm-dd, giờ địa phương) ---------- */
const pad = (n) => String(n).padStart(2, '0');
const isoOf = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const parseISO = (s) => { const [y, m, d] = String(s).split('-').map(Number); return new Date(y, (m || 1) - 1, d || 1); };
const todayISO = () => isoOf(new Date());
const addDays = (s, n) => { const d = parseISO(s); d.setDate(d.getDate() + n); return isoOf(d); };
const addMonths = (s, n) => {
  const d = parseISO(s); const day = d.getDate(); d.setDate(1); d.setMonth(d.getMonth() + n);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate(); d.setDate(Math.min(day, last)); return isoOf(d);
};
const daysBetween = (a, b) => Math.round((parseISO(b) - parseISO(a)) / 86400000);
const fmtD = (s) => (s ? s.split('-').reverse().join('/') : '');
const fmtDM = (s) => (s ? `${s.slice(8, 10)}/${s.slice(5, 7)}` : '');
const DOW = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
const DOW_LONG = ['Chủ nhật', 'Thứ hai', 'Thứ ba', 'Thứ tư', 'Thứ năm', 'Thứ sáu', 'Thứ bảy'];
const dowOf = (s) => DOW[parseISO(s).getDay()];
const ymOf = (s) => s.slice(0, 7);
const fmtYM = (ym) => `Tháng ${Number(ym.slice(5, 7))}/${ym.slice(0, 4)}`;
const ymAdd = (ym, n) => addMonths(ym + '-01', n).slice(0, 7);
const monthEnd = (ym) => { const [y, m] = ym.split('-').map(Number); return `${ym}-${pad(new Date(y, m, 0).getDate())}`; };
const fmtDateRange = (a, b) => {
  if (!a) return '';
  if (!b || a === b) return `${dowOf(a)} ${fmtD(a)}`;
  if (a.slice(0, 7) === b.slice(0, 7)) return `${a.slice(8, 10)}–${fmtD(b)}`;
  return `${fmtDM(a)} – ${fmtD(b)}`;
};
const fmtStamp = (isoStr) => {
  if (!isoStr) return '';
  const d = new Date(isoStr);
  return `${pad(d.getHours())}:${pad(d.getMinutes())} ${pad(d.getDate())}/${pad(d.getMonth() + 1)}/${d.getFullYear()}`;
};

/* ---------- money ---------- */
const NF = new Intl.NumberFormat('vi-VN');
const money = (n) => NF.format(Math.round(Number(n) || 0));
const moneyD = (n) => money(n) + ' đ';
const moneyShort = (n) => {
  n = Number(n) || 0; const a = Math.abs(n);
  if (a >= 1e9) return (n / 1e9).toLocaleString('vi-VN', { maximumFractionDigits: 2 }) + ' tỷ';
  if (a >= 1e6) return (n / 1e6).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' tr';
  if (a >= 1e3) return (n / 1e3).toLocaleString('vi-VN', { maximumFractionDigits: 0 }) + ' ng';
  return money(n);
};
const parseMoney = (s) => { const n = Number(String(s ?? '').replace(/[^\d]/g, '')); return Number.isFinite(n) ? n : 0; };

/* ---------- application state ---------- */
const S = {
  trainers: [], classes: [], quotes: [], customers: [], log: [],
  settings: clone(DEFAULT_SETTINGS),
  byId: { trainers: new Map(), classes: new Map(), quotes: new Map(), customers: new Map() },
  loaded: {},
  role: { canEdit: false, mode: 'loading', label: '' },
  sync: { state: 'loading', msg: '' },
  ui: { tab: 'tong-quan', month: todayISO().slice(0, 7), region: 'all', calView: 'month', selDate: todayISO(), trainerFocus: null },
};

const settings = () => S.settings;
const regionList = () => settings().regions || DEFAULT_SETTINGS.regions;
const regionOf = (id) => regionList().find((r) => r.id === id) || null;
const regionName = (id) => regionOf(id)?.name || 'Chưa chọn vùng';
const regionColor = (id) => { const i = regionList().findIndex((r) => r.id === id); return i < 0 ? 'var(--fg-3)' : `var(${REGION_VARS[i % REGION_VARS.length]})`; };
const trainer = (id) => S.byId.trainers.get(id);
const customer = (id) => S.byId.customers.get(id);
const quote = (id) => S.byId.quotes.get(id);
const klass = (id) => S.byId.classes.get(id);

/* ---------- pricing & money per class ---------- */
function tierFor(n, tiers = settings().priceTiers) {
  n = Number(n) || 0;
  if (n <= 0) return null;
  return (tiers || []).find((t) => n >= Number(t.min) && n <= Number(t.max)) || null;
}
function tierText(n) {
  const t = tierFor(n);
  if (t) return `Bảng giá ${t.min}–${t.max} HV/lớp: ${moneyD(t.price)} (chưa VAT)`;
  const tiers = settings().priceTiers || [];
  const maxT = tiers.reduce((m, x) => Math.max(m, Number(x.max) || 0), 0);
  if (n > maxT && maxT) return `Trên ${maxT} HV/lớp: chưa có trong bảng giá – nhập giá thỏa thuận hoặc tách lớp`;
  return 'Nhập số học viên để tính giá theo bảng giá';
}
const classDays = (c) => (c.startDate && c.endDate ? Math.max(1, daysBetween(c.startDate, c.endDate) + 1) : 1);
const vatOf = (rec) => (rec.vatRate === 0 || rec.vatRate ? Number(rec.vatRate) : Number(settings().vatRate) || 0);
function classMoney(c) {
  const live = c.status !== 'cancelled';
  const rev = live ? Number(c.price) || 0 : 0;
  const vat = (rev * vatOf(c)) / 100;
  const cost = live ? (Number(c.costTrainer) || 0) + (Number(c.costTravel) || 0) + (Number(c.costOther) || 0) : 0;
  return { rev, vat, total: rev + vat, cost, profit: rev - cost, margin: rev ? (rev - cost) / rev : 0 };
}
function trainerCostAuto(trainerIds, days) {
  return sum(trainerIds || [], (id) => (Number(trainer(id)?.dailyRate) || 0) * days);
}

/* ---------- schedule conflicts ---------- */
const dateOverlap = (a, b) => a.startDate && b.startDate && a.startDate <= (b.endDate || b.startDate) && b.startDate <= (a.endDate || a.startDate);
const timeOverlap = (a, b) => (a.startTime || '00:00') < (b.endTime || '23:59') && (b.startTime || '00:00') < (a.endTime || '23:59');
function conflictsFor(c, list = S.classes) {
  if (!c || c.status === 'cancelled' || !(c.trainerIds || []).length) return [];
  const out = [];
  for (const o of list) {
    if (o.id === c.id || o.status === 'cancelled') continue;
    const shared = (c.trainerIds || []).filter((t) => (o.trainerIds || []).includes(t));
    if (shared.length && dateOverlap(c, o) && timeOverlap(c, o)) out.push({ cls: o, trainers: shared });
  }
  return out;
}
function busyClasses(trainerId, range, exceptId) {
  return S.classes.filter((o) => o.id !== exceptId && o.status !== 'cancelled' && (o.trainerIds || []).includes(trainerId) && dateOverlap(range, o) && timeOverlap(range, o));
}
const classesOn = (iso) => S.classes.filter((c) => c.startDate <= iso && iso <= (c.endDate || c.startDate));
const classInMonth = (c, ym) => c.startDate <= monthEnd(ym) && (c.endDate || c.startDate) >= ym + '-01';
const sortClasses = (a, b) => (a.startDate + (a.startTime || '')).localeCompare(b.startDate + (b.startTime || ''));
function classLabel(c) {
  return c.customerName || customer(c.customerId)?.name || c.title || 'Lớp chưa đặt tên';
}
const groupsText = (gs) => (gs && gs.length ? 'Nhóm ' + gs.slice().sort().join(', ') : '');
/** Tên ngắn cho ô lịch: bỏ "Công ty TNHH/CP…" để phần tên riêng không bị cắt mất. */
const shortName = (n) => String(n || '').replace(/^\s*(công ty|cong ty|cty)\.?\s+((tnhh|trách nhiệm hữu hạn)(\s+(mtv|một thành viên))?|cổ phần|cp)?\s*/i, '').trim() || String(n || '');
const groupsShort = (gs) => (gs && gs.length ? gs.slice().sort().map((g) => 'N' + g).join('·') : '');
function trainerNames(ids) {
  return (ids || []).map((id) => trainer(id)?.name || 'GV đã xóa').join(', ');
}
function suggestedDays(groups, kind) {
  const hrs = Math.max(0, ...(groups || []).map((g) => Number(settings().groupHours?.[g]) || 0));
  if (!hrs) return { hrs: 0, days: 0 };
  const h = kind === 'Huấn luyện định kỳ' ? Math.ceil(hrs / 2) : hrs;
  return { hrs: h, days: Math.max(1, Math.ceil(h / (Number(settings().hoursPerDay) || 8))) };
}

/* ---------- quotes & contracts ---------- */
function quoteMoney(q) {
  const amount = Number(q.amount) || 0;
  const vat = (amount * vatOf(q)) / 100;
  return { amount, vat, total: amount + vat };
}
const isContract = (q) => q.status === 'signed';
const quoteClasses = (q) => S.classes.filter((c) => c.quoteId === q.id);
function contractMoney(q) {
  const amount = q.contractAmount === 0 || q.contractAmount ? Number(q.contractAmount) : Number(q.amount) || 0;
  const vat = (amount * vatOf(q)) / 100;
  const total = amount + vat;
  const paid = sum(q.payments || [], (p) => p.amount);
  return { amount, vat, total, paid, remain: Math.max(0, total - paid) };
}
function contractState(q) {
  const m = contractMoney(q);
  const cls = quoteClasses(q).filter((c) => c.status !== 'cancelled');
  const allDone = cls.length > 0 && cls.every((c) => c.status === 'done');
  if (m.total > 0 && m.remain <= 0 && (allDone || !cls.length)) return { label: 'Hoàn tất', tone: 'ok' };
  if (m.remain > 0 && q.paymentDue && q.paymentDue < todayISO()) return { label: 'Quá hạn thanh toán', tone: 'bad' };
  if (allDone && m.remain > 0) return { label: 'Đã dạy xong – chờ thu', tone: 'warn' };
  if (m.total > 0 && m.remain <= 0) return { label: 'Đã thu đủ', tone: 'ok' };
  return { label: 'Đang thực hiện', tone: 'info' };
}
function nextQuoteNo(dateIso) {
  const y = (dateIso || todayISO()).slice(0, 4);
  let max = 0;
  for (const q of S.quotes) { const m = /^BG-(\d{4})-(\d+)/.exec(q.no || ''); if (m && m[1] === y) max = Math.max(max, Number(m[2])); }
  return `BG-${y}-${String(max + 1).padStart(3, '0')}`;
}

/* ---------- customers ---------- */
function findCustomerByName(name) {
  const n = norm(name);
  return n ? S.customers.find((c) => norm(c.name) === n) : null;
}
function customerStats(cid) {
  const cls = S.classes.filter((c) => c.customerId === cid && c.status !== 'cancelled');
  const done = cls.filter((c) => c.status === 'done');
  return {
    classes: cls.length,
    students: sum(done, (c) => c.students),
    revenue: sum(cls, (c) => classMoney(c).rev),
    last: done.reduce((m, c) => ((c.endDate || c.startDate) > m ? c.endDate || c.startDate : m), ''),
  };
}
/** Hạn huấn luyện định kỳ theo từng nhóm của khách hàng, dựa trên lớp hoàn thành gần nhất. */
function customerDues(cid) {
  const last = {};
  for (const c of S.classes) {
    if (c.customerId !== cid || c.status !== 'done') continue;
    const end = c.endDate || c.startDate;
    for (const g of c.groups || []) if (!last[g] || end > last[g]) last[g] = end;
  }
  const cyc = settings().cycleMonths || {};
  return Object.keys(last).map((g) => ({ group: Number(g), last: last[g], due: addMonths(last[g], Number(cyc[g]) || 24) }))
    .sort((a, b) => a.due.localeCompare(b.due));
}
function dueTone(dueIso) {
  const d = daysBetween(todayISO(), dueIso);
  if (d < 0) return { tone: 'bad', text: `Quá hạn ${-d} ngày` };
  if (d <= (Number(settings().warnDays) || 60)) return { tone: 'warn', text: `Còn ${d} ngày` };
  return { tone: 'ok', text: 'Còn hạn' };
}

/* ---------- trainers ---------- */
function trainerMonthLoad(tid, ym) {
  let days = 0; const cls = [];
  for (const c of S.classes) {
    if (c.status === 'cancelled' || !(c.trainerIds || []).includes(tid) || !classInMonth(c, ym)) continue;
    cls.push(c);
    const a = c.startDate < ym + '-01' ? ym + '-01' : c.startDate;
    const b = (c.endDate || c.startDate) > monthEnd(ym) ? monthEnd(ym) : c.endDate || c.startDate;
    days += daysBetween(a, b) + 1;
  }
  return { days, classes: cls };
}
function trainerNext(tid) {
  const t = todayISO();
  return S.classes.filter((c) => c.status !== 'cancelled' && (c.trainerIds || []).includes(tid) && (c.endDate || c.startDate) >= t).sort(sortClasses)[0] || null;
}
function trainersInRegion(region, { includePaused = false } = {}) {
  return S.trainers
    .filter((t) => includePaused || t.status !== 'paused')
    .filter((t) => region === 'all' || t.region === region || (t.otherRegions || []).includes(region))
    .sort((a, b) => (a.region === region ? 0 : 1) - (b.region === region ? 0 : 1) || a.name.localeCompare(b.name, 'vi'));
}

/* ---------- alerts for the dashboard ---------- */
function computeAlerts() {
  const out = []; const t = todayISO(); const st = settings();
  const seen = new Set();
  for (const c of S.classes) {
    const cx = conflictsFor(c);
    for (const x of cx) {
      const key = [c.id, x.cls.id].sort().join('|');
      if (seen.has(key) || (c.endDate || c.startDate) < t) continue; seen.add(key);
      out.push({ sev: 'bad', text: `Trùng lịch giảng viên ${trainerNames(x.trainers)}: ${classLabel(c)} (${fmtDateRange(c.startDate, c.endDate)}) và ${classLabel(x.cls)} (${fmtDateRange(x.cls.startDate, x.cls.endDate)})`, act: 'class-view', id: c.id });
    }
  }
  for (const c of S.classes) {
    if (c.status === 'cancelled' || c.status === 'done') continue;
    const end = c.endDate || c.startDate;
    if (!(c.trainerIds || []).length && c.startDate >= t && daysBetween(t, c.startDate) <= 21) out.push({ sev: 'warn', text: `Lớp ${classLabel(c)} ngày ${fmtD(c.startDate)} chưa phân công giảng viên`, act: 'class-view', id: c.id });
    if (end < t) out.push({ sev: 'warn', text: `Lớp ${classLabel(c)} (${fmtDateRange(c.startDate, c.endDate)}) đã qua ngày dạy – cập nhật trạng thái hoàn thành hoặc hủy`, act: 'class-view', id: c.id });
    if (c.status === 'planned' && c.startDate >= t && daysBetween(t, c.startDate) <= 7) out.push({ sev: 'info', text: `Lớp ${classLabel(c)} ngày ${fmtD(c.startDate)} vẫn ở trạng thái dự kiến – cần chốt lịch với khách`, act: 'class-view', id: c.id });
  }
  for (const c of S.classes) {
    if (c.status !== 'done') continue;
    const q = c.quoteId && quote(c.quoteId);
    if (!q || !isContract(q)) out.push({ sev: 'warn', text: `Lớp ${classLabel(c)} (${fmtD(c.startDate)}) đã dạy nhưng chưa gắn hợp đồng đã ký`, act: 'class-view', id: c.id });
  }
  for (const q of S.quotes) {
    if (['sent', 'negotiating'].includes(q.status) && q.date && daysBetween(q.date, t) >= (Number(st.quoteFollowDays) || 7)) out.push({ sev: 'info', text: `Báo giá ${q.no || ''} – ${q.customerName}: đã ${daysBetween(q.date, t)} ngày chưa có kết quả, cần liên hệ lại`, act: 'quote-view', id: q.id });
    if (q.status === 'accepted') out.push({ sev: 'info', text: `${q.customerName} đã đồng ý báo giá ${q.no || ''} – chờ ký hợp đồng`, act: 'quote-view', id: q.id });
    if (isContract(q)) {
      const m = contractMoney(q);
      if (m.remain > 0 && q.paymentDue && q.paymentDue < t) out.push({ sev: 'bad', text: `Hợp đồng ${q.contractNo || q.no} – ${q.customerName}: quá hạn thanh toán ${daysBetween(q.paymentDue, t)} ngày, còn phải thu ${moneyD(m.remain)}`, act: 'quote-view', id: q.id });
      if (!(q.contractFiles || []).length) out.push({ sev: 'info', text: `Hợp đồng ${q.contractNo || q.no} – ${q.customerName} chưa tải file hợp đồng lên`, act: 'quote-view', id: q.id });
    }
  }
  for (const tr of S.trainers) {
    if (tr.status === 'paused' || !tr.certExpiry) continue;
    const d = daysBetween(t, tr.certExpiry);
    if (d < 0) out.push({ sev: 'bad', text: `Chứng chỉ giảng viên ${tr.name} đã hết hạn ngày ${fmtD(tr.certExpiry)}`, act: 'trainer-view', id: tr.id });
    else if (d <= (Number(st.warnDays) || 60)) out.push({ sev: 'warn', text: `Chứng chỉ giảng viên ${tr.name} hết hạn sau ${d} ngày (${fmtD(tr.certExpiry)})`, act: 'trainer-view', id: tr.id });
  }
  for (const cu of S.customers) {
    for (const d of customerDues(cu.id)) {
      const k = daysBetween(t, d.due);
      if (k <= (Number(st.warnDays) || 60)) {
        const upcoming = S.classes.some((c) => c.customerId === cu.id && c.status !== 'cancelled' && c.startDate >= d.last && c.startDate > t && (c.groups || []).includes(d.group));
        if (!upcoming) out.push({ sev: k < 0 ? 'warn' : 'info', text: `${cu.name}: Nhóm ${d.group} ${k < 0 ? 'đã quá hạn' : 'sắp đến hạn'} huấn luyện định kỳ (${fmtD(d.due)}) – cơ hội gửi báo giá`, act: 'customer-view', id: cu.id });
      }
    }
  }
  const order = { bad: 0, warn: 1, info: 2 };
  return out.sort((a, b) => order[a.sev] - order[b.sev]);
}

/* ---------- file types ---------- */
const MIME_BY_EXT = {
  pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xls: 'application/vnd.ms-excel',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', csv: 'text/csv', txt: 'text/plain',
  zip: 'application/zip', rar: 'application/vnd.rar', heic: 'image/heic',
};
const extOf = (name) => (String(name || '').match(/\.([a-z0-9]+)$/i)?.[1] || '').toLowerCase();
const mimeOf = (file) => file.type || MIME_BY_EXT[extOf(file.name)] || 'application/octet-stream';
function fileKind(meta) {
  const e = extOf(meta.name); const t = meta.type || '';
  if (t === 'application/pdf' || e === 'pdf') return 'pdf';
  if (/^image\/(png|jpeg|gif|webp)$/.test(t) || ['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(e)) return 'img';
  if (e === 'docx') return 'docx';
  if (['xlsx', 'xls', 'csv'].includes(e)) return 'sheet';
  if (e === 'doc') return 'doc';
  return 'other';
}
const extClass = (meta) => ({ pdf: 'pdf', img: 'img', docx: 'doc', doc: 'doc', sheet: 'xls' }[fileKind(meta)] || '');
const fmtSize = (b) => (b >= 1048576 ? (b / 1048576).toLocaleString('vi-VN', { maximumFractionDigits: 1 }) + ' MB' : Math.max(1, Math.round(b / 1024)) + ' KB');
