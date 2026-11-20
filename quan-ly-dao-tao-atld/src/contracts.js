/* ============================================================
   HỢP ĐỒNG GIẢNG VIÊN (tab Giảng viên)
   • Hợp đồng nguyên tắc thỉnh giảng (HĐNT) và Phụ lục hợp đồng (PL) theo mẫu chuẩn DAKO (src/hdgv_tpl.js)
   • Tự đánh số, kiểm tra trùng số, tạo → xem lại → xuất file Word đúng mẫu, sổ theo dõi hợp đồng
   • Phụ lục cập nhật thù lao, thuế TNCN và số phụ lục vào các lớp (tab Thù lao & công nợ)
   ============================================================ */

const DOCX_MIME = 'application/vnd.openxmlformats-officedocument.wordprocessingml.document';
LIBS.jszip = ['https://cdn.jsdelivr.net/npm/jszip@3.10.1/dist/jszip.min.js'];
LIBS.docx = [...LIBS.jszip, 'https://cdn.jsdelivr.net/npm/docx-preview@0.3.7/dist/docx-preview.min.js'];

const TC_KIND = { nt: 'Hợp đồng nguyên tắc', pl: 'Phụ lục hợp đồng' };
const TC_SHORT = { nt: 'HĐNT', pl: 'Phụ lục' };
const W_NS = 'http://schemas.openxmlformats.org/wordprocessingml/2006/main';

/* ---------- số văn bản: {stt} {năm} {nhóm} ---------- */
const padNo = (n) => String(Number(n) || 0).padStart(2, '0');
function fmtDocNo(fmt, { stt, year, group } = {}) {
  return String(fmt || '{stt}').normalize('NFC').replace(/\{stt\}/gi, padNo(stt)).replace(/\{n[ăa]m\}/gi, year ?? '').replace(/\{nh[óo]m\}/gi, group ?? '');
}
function parseDocNo(fmt, no) {
  const src = String(fmt || '{stt}').normalize('NFC').replace(/[.*+?^$()|[\]\\]/g, '\\$&')
    .replace(/\{stt\}/gi, '(?<stt>\\d{1,4})').replace(/\{n[ăa]m\}/gi, '(?<year>\\d{4})').replace(/\{nh[óo]m\}/gi, '(?<group>[1-6])');
  const m = new RegExp('^' + src + '$', 'i').exec(String(no || '').normalize('NFC').trim());
  return m ? { stt: Number(m.groups.stt), year: m.groups.year ? Number(m.groups.year) : null, group: m.groups.group ? Number(m.groups.group) : null } : null;
}
const tcFmt = (kind) => (kind === 'nt' ? settings().contractNoFormat || DEFAULT_SETTINGS.contractNoFormat : settings().appendixNoFormat || DEFAULT_SETTINGS.appendixNoFormat);
const tcYear = (x) => Number(String(x.signDate || x.createdAt || todayISO()).slice(0, 4));
const tcSttOf = (x) => Number(x.stt) || parseDocNo(tcFmt(x.kind), x.no)?.stt || 0;
function nextTcStt(kind, year, exceptId) {
  let max = 0;
  for (const x of S.tcontracts) if (x.kind === kind && x.id !== exceptId && tcYear(x) === year) max = Math.max(max, tcSttOf(x));
  return max + 1;
}
function usedTcStt(kind, year, exceptId) {
  return S.tcontracts.filter((x) => x.kind === kind && x.id !== exceptId && tcYear(x) === year).map(tcSttOf).filter(Boolean).sort((a, b) => a - b);
}
/** Trùng số: mẫu số có {năm} thì không được trùng ở bất kỳ năm nào; mẫu không có năm thì xét trong cùng năm ký. */
function tcDuplicate(kind, no, year, exceptId) {
  const n = norm(no); const withYear = /\{n[ăa]m\}/i.test(String(tcFmt(kind)).normalize('NFC'));
  return n ? S.tcontracts.find((x) => x.kind === kind && x.id !== exceptId && norm(x.no) === n && (withYear || tcYear(x) === year)) : null;
}
const nextSeq = (ntId, exceptId) => Math.max(0, ...S.tcontracts.filter((x) => x.kind === 'pl' && x.parentId === ntId && x.id !== exceptId).map((x) => Number(x.seq) || 0)) + 1;

/* ---------- tra cứu ---------- */
const trainerTcs = (tid) => S.tcontracts.filter((x) => x.trainerId === tid);
const trainerNts = (tid) => trainerTcs(tid).filter((x) => x.kind === 'nt').sort((a, b) => (b.from || b.signDate || '').localeCompare(a.from || a.signDate || ''));
/** HĐNT có hiệu lực vào ngày iso (ưu tiên bản đã ký). */
function activeNt(tid, iso = todayISO()) {
  const list = trainerNts(tid).filter((x) => x.status !== 'cancelled' && (!x.from || x.from <= iso) && (!x.to || x.to >= iso));
  return list.find((x) => x.status === 'signed') || list[0] || null;
}
/** HĐNT dùng được để lập phụ lục: chưa hủy, chưa hết hạn (kể cả HĐ ký trước ngày hiệu lực). */
const usableNts = (tid) => { const t = todayISO(); return trainerNts(tid).filter((x) => x.status !== 'cancelled' && (!x.to || x.to >= t)); };
const ntAppendices = (ntId) => S.tcontracts.filter((x) => x.kind === 'pl' && x.parentId === ntId).sort((a, b) => (Number(a.seq) || 0) - (Number(b.seq) || 0));
const classPl = (classId, tid, exceptId) => S.tcontracts.find((x) => x.kind === 'pl' && x.status !== 'cancelled' && x.trainerId === tid && x.id !== exceptId && (x.rows || []).some((r) => r.classId === classId));

/* ---------- tiền phụ lục, thuế TNCN ---------- */
const pitCfg = () => ({ rate: Number(settings().pitRate ?? 10), min: Number(settings().pitMin ?? 2000000) });
function plMoney(x) {
  const total = sum(x.rows || [], (r) => r.amount);
  const travel = Number(x.travel) || 0;
  const gross = total + travel;
  const { rate, min } = pitCfg();
  const autoPit = gross >= min ? Math.round((gross * rate) / 100) : 0;
  const pit = x.pitAuto === false ? Math.min(gross, Number(x.pit) || 0) : autoPit;
  return { total, travel, gross, pit, autoPit, net: gross - pit };
}
/** Đã trả theo phụ lục = các khoản trả thù lao ở những lớp thuộc phụ lục. */
function plPayment(x) {
  let paid = 0; let linked = 0;
  for (const r of x.rows || []) {
    const c = r.classId && klass(r.classId); if (!c) continue;
    const fe = classFees(c).find((f2) => f2.trainerId === x.trainerId); linked++;
    if (fe) paid += feePaid(fe);
  }
  const net = plMoney(x).net;
  return { paid, net, remain: net - paid, linked };
}
function tcState(x, t = todayISO()) {
  if (x.status === 'cancelled') return { key: 'cancelled', label: 'Đã hủy', tone: 'muted' };
  if (x.kind === 'nt') {
    if (x.to && x.to < t) return { key: 'expired', label: 'Hết hiệu lực', tone: 'muted' };
    if (x.status !== 'signed') return x.from && x.from <= t ? { key: 'draft', label: 'Chưa ký – đã đến ngày hiệu lực', tone: 'warn' } : { key: 'draft', label: 'Chờ ký', tone: 'info' };
    if (x.from && x.from > t) return { key: 'signed', label: `Đã ký – hiệu lực từ ${fmtD(x.from)}`, tone: 'info' };
    const d = x.to ? daysBetween(t, x.to) : 999;
    return d <= 30 ? { key: 'expiring', label: `Còn hiệu lực – hết hạn sau ${d} ngày`, tone: 'warn' } : { key: 'active', label: 'Còn hiệu lực', tone: 'ok' };
  }
  if (x.status !== 'signed') return { key: 'draft', label: 'Chờ ký', tone: 'info' };
  const p = plPayment(x);
  if (p.linked && p.net > 0 && p.remain <= 0) return { key: 'paid', label: 'Đã thanh toán đủ', tone: 'ok' };
  if (p.paid > 0) return { key: 'signed', label: `Đã trả ${moneyShort(p.paid)} – còn ${moneyShort(p.remain)}`, tone: 'warn' };
  return { key: 'signed', label: 'Đã ký – chưa thanh toán', tone: 'info' };
}
function trainerTcBadge(x) {
  const nt = activeNt(x.id) || usableNts(x.id)[0];
  if (!nt) return pill('Chưa có HĐ nguyên tắc', 'warn');
  const st = tcState(nt);
  return `<span class="pill tcbadge ${st.tone}" title="Hợp đồng nguyên tắc ${esc(nt.no)} – ${esc(st.label)}">${ic('sign')}<span>${esc(nt.no)}</span></span>`;
}

/* ---------- thông tin hai bên (lưu kèm hợp đồng để xuất lại giống hệt) ---------- */
function partyA() {
  const co = companyInfo();
  return { name: co.name, nameVi: co.nameVi || co.name, address: co.address, taxCode: co.taxCode, phone: co.phone, email: co.email, rep: co.director, repTitle: co.directorTitle || 'Giám đốc', bankAccount: co.bankAccount, bankName: co.bankName };
}
function partyB(t) {
  return {
    name: t.name || '', dob: t.dob || '', gender: t.gender || '', idNo: t.idNo || '', idDate: t.idDate || '', idPlace: t.idPlace || '',
    address: t.permAddress || t.address || '', phone: t.phone || '', email: t.email || '', taxCode: t.taxCode || '', degree: t.degree || '', certNo: t.certNo || '',
    groups: (t.groups || []).map(Number).sort(), bankAccount: t.bankAccount || (t.bankName ? '' : t.bank || ''), bankName: t.bankName || '',
  };
}
const A_FIELDS = [['address', 'Địa chỉ trụ sở'], ['taxCode', 'Mã số thuế'], ['phone', 'Điện thoại'], ['email', 'Email'], ['rep', 'Người đại diện'], ['repTitle', 'Chức vụ'], ['bankAccount', 'Số tài khoản'], ['bankName', 'Ngân hàng']];
const B_FIELDS = [['name', 'Họ và tên'], ['dob', 'Ngày sinh'], ['gender', 'Giới tính'], ['idNo', 'Số CCCD/Hộ chiếu'], ['idDate', 'Ngày cấp CCCD'], ['idPlace', 'Nơi cấp CCCD'], ['address', 'Địa chỉ thường trú'], ['phone', 'Điện thoại'], ['email', 'Email'], ['taxCode', 'Mã số thuế cá nhân'], ['degree', 'Trình độ chuyên môn'], ['certNo', 'Số GCN người huấn luyện'], ['groups', 'Nhóm được phép huấn luyện'], ['bankAccount', 'Số tài khoản'], ['bankName', 'Ngân hàng']];
const PL_B_FIELDS = ['name', 'idNo', 'taxCode'];
const isBlank = (v) => v === undefined || v === null || (Array.isArray(v) ? !v.length : String(v).trim() === '');
function tcMissing(x) {
  const A = x.partyA || {}; const B = x.partyB || {};
  const out = [];
  const bKeys = x.kind === 'pl' ? PL_B_FIELDS : B_FIELDS.map((f2) => f2[0]);
  if (x.kind === 'nt') A_FIELDS.forEach(([k, l]) => isBlank(A[k]) && out.push('Bên A – ' + l));
  else ['rep', 'repTitle'].forEach((k) => isBlank(A[k]) && out.push('Bên A – ' + A_FIELDS.find((f2) => f2[0] === k)[1]));
  B_FIELDS.forEach(([k, l]) => bKeys.includes(k) && isBlank(B[k]) && out.push('Bên B – ' + l));
  if (isBlank(x.signDate)) out.push('Ngày ký');
  if (isBlank(x.signPlace)) out.push('Nơi ký');
  if (isBlank(x.payDays)) out.push('Số ngày làm việc thanh toán');
  if (x.kind === 'nt' && (isBlank(x.from) || isBlank(x.to))) out.push('Thời hạn hiệu lực');
  if (x.kind === 'pl') (x.rows || []).forEach((r, i) => isBlank(r.location) && out.push(`Dòng ${i + 1} – địa điểm`));
  return out;
}

/* ---------- đọc số tiền bằng chữ ---------- */
const VN_DIGITS = ['không', 'một', 'hai', 'ba', 'bốn', 'năm', 'sáu', 'bảy', 'tám', 'chín'];
function vn3(n, full) {
  const h = Math.floor(n / 100), t = Math.floor((n % 100) / 10), u = n % 10; const out = [];
  if (h || full) out.push(VN_DIGITS[h], 'trăm');
  if (t === 0) { if (u) { if (h || full) out.push('linh'); out.push(VN_DIGITS[u]); } }
  else if (t === 1) { out.push('mười'); if (u) out.push(u === 5 ? 'lăm' : VN_DIGITS[u]); }
  else { out.push(VN_DIGITS[t], 'mươi'); if (u) out.push(u === 1 ? 'mốt' : u === 5 ? 'lăm' : VN_DIGITS[u]); }
  return out.join(' ');
}
function vnNumberWords(n) {
  n = Math.round(Math.abs(Number(n) || 0)); if (!n) return 'không';
  const units = ['', 'nghìn', 'triệu', 'tỷ', 'nghìn tỷ', 'triệu tỷ'];
  const groups = []; for (let x = n; x > 0; x = Math.floor(x / 1000)) groups.push(x % 1000);
  const out = [];
  for (let i = groups.length - 1; i >= 0; i--) {
    if (!groups[i]) continue;
    out.push(vn3(groups[i], i < groups.length - 1), units[i] || '');
  }
  return out.join(' ').replace(/\s+/g, ' ').trim();
}
const vnMoneyWords = (n) => { const s = vnNumberWords(n); return s.charAt(0).toUpperCase() + s.slice(1) + ' đồng'; };

/* ---------- giá trị điền vào mẫu ---------- */
const ndDay = (iso) => (iso ? String(Number(iso.slice(8, 10))).padStart(2, '0') : '');
const ndMonth = (iso) => { if (!iso) return ''; const m = Number(iso.slice(5, 7)); return m < 3 ? '0' + m : String(m); }; // NĐ 30/2020: tháng 1, 2 thêm số 0
function ntYearTexts(x) {
  if (!x.from || !x.to) return {};
  const y1 = x.from.slice(0, 4), y2 = x.to.slice(0, 4);
  return y1 === y2 ? { hd_nam: y1, hd_pham_vi: `năm ${y1}` } : { hd_nam: `${y1} – ${y2}`, hd_pham_vi: `thời gian từ ngày ${fmtD(x.from)} đến ngày ${fmtD(x.to)}` };
}
/** Ô đứng trước một nhãn khác trên cùng dòng (VD: “… Chức vụ:”) – thêm khoảng cách cho dễ đọc. */
const INLINE_GAP = new Set(['a_dt', 'a_dai_dien', 'a_stk', 'b_ngay_sinh', 'b_cccd', 'b_ngay_cap', 'b_dt', 'b_stk', 'pl_dai_dien']);
const BLANK_OVERRIDE = { hd_y: '........', pl_y: '........', hd_nam: '........', hd_pham_vi: 'năm ........', hd_tu: '...../...../........', hd_den: '...../...../........', hd_ngay: '...../...../........' };
function tcValues(x) {
  const A = x.partyA || partyA(); const B = x.partyB || {};
  const nt = x.kind === 'nt' ? x : tcontract(x.parentId) || { no: x.parentNo, signDate: x.parentDate };
  const v = {
    a_ten_hoa: String(A.name || '').toLocaleUpperCase('vi'), a_ten: A.nameVi || A.name, a_dia_chi: A.address, a_mst: A.taxCode, a_dt: A.phone, a_email: A.email,
    a_dai_dien: A.rep, a_chuc_vu: A.repTitle, a_stk: A.bankAccount, a_ngan_hang: A.bankName, a_ky: A.rep,
    b_ten: B.name, b_ngay_sinh: fmtD(B.dob), b_gioi_tinh: B.gender, b_cccd: B.idNo, b_ngay_cap: fmtD(B.idDate), b_noi_cap: B.idPlace, b_dia_chi: B.address,
    b_dt: B.phone, b_email: B.email, b_mst: B.taxCode, b_trinh_do: B.degree, b_gcn: B.certNo, b_nhom: (B.groups || []).join(', '), b_stk: B.bankAccount, b_ngan_hang: B.bankName, b_ky: B.name,
    so_hd: nt.no, hd_ngay: fmtD(nt.signDate), pl_dai_dien: A.rep, pl_chuc_vu: A.repTitle, pla_ky: A.rep,
  };
  if (x.kind === 'nt') {
    Object.assign(v, { hd_d: ndDay(x.signDate), hd_m: ndMonth(x.signDate), hd_y: x.signDate?.slice(0, 4), hd_noi: x.signPlace, hd_tu: fmtD(x.from), hd_den: fmtD(x.to), hd_ngay_tt: x.payDays, ...ntYearTexts(x) });
  } else {
    const m = plMoney(x);
    Object.assign(v, {
      so_pl: x.no, pl_stt: x.seq ? padNo(x.seq) : '', pl_d: ndDay(x.signDate), pl_m: ndMonth(x.signDate), pl_y: x.signDate?.slice(0, 4), pl_noi: x.signPlace,
      pl_tong: money(m.total), pl_bang_chu: vnMoneyWords(m.total), pl_di_lai: m.travel ? money(m.travel) + ' VNĐ' : 'Không', pl_tncn: money(m.pit), pl_thuc_nhan: money(m.net), pl_ngay_tt: x.payDays,
    });
  }
  return v;
}
function tcRowValues(x) {
  return (x.rows || []).map((r, i) => ({
    r_stt: String(i + 1), r_kh: r.customer || '', r_dd: `(Địa điểm: ${r.location || '............'})`, r_nd: r.topic || '', r_tg: r.time || '',
    r_sl: r.qty ? `${padNo(r.qty)} ${r.unit || 'ngày'}` : '', r_dg: r.price ? money(r.price) : '', r_tt: money(r.amount),
  }));
}
function fillTokens(root, get, useBlanks = true) {
  for (const t of Array.from(root.getElementsByTagNameNS(W_NS, 't'))) {
    const s = t.textContent; if (!s.includes('{{')) continue;
    t.textContent = s.replace(/\{\{([a-z0-9_]+)(@\d+)?\}\}/g, (_, k, at) => {
      const v = get(k);
      if (!isBlank(v)) return String(v) + (useBlanks && INLINE_GAP.has(k) ? '\u00a0\u00a0\u00a0\u00a0\u00a0' : '');
      return useBlanks ? BLANK_OVERRIDE[k] ?? HDGV_TPL.blanks[k + (at || '')] ?? HDGV_TPL.blanks[k] ?? '' : '';
    });
    t.setAttributeNS('http://www.w3.org/XML/1998/namespace', 'xml:space', 'preserve');
  }
}
/** Tạo file Word từ mẫu. HĐNT có thể kèm mẫu phụ lục trống (điều 1.2) – điền sẵn thông tin hai bên. */
async function buildTcDocx(x) {
  const JSZip = await lib('jszip');
  const zip = await JSZip.loadAsync(HDGV_TPL.b64, { base64: true });
  const doc = new DOMParser().parseFromString(await zip.file('word/document.xml').async('string'), 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Mẫu hợp đồng bị lỗi – báo lại cho người quản lý công cụ.');
  const body = doc.getElementsByTagNameNS(W_NS, 'body')[0];
  const kids = Array.from(body.children);
  const iPl = kids.findIndex((n) => n.localName === 'tbl' && n.textContent.includes('{{so_pl}}'));
  const iSect = kids.findIndex((n) => n.localName === 'sectPr');
  if (x.kind === 'pl') kids.slice(0, iPl).forEach((n) => n.remove());
  else if (x.withForm === false) {
    kids.slice(iPl, iSect).forEach((n) => n.remove());
    Array.from(kids[iPl - 1].getElementsByTagNameNS(W_NS, 'br')).forEach((b) => b.remove());
  }
  const tr = Array.from(doc.getElementsByTagNameNS(W_NS, 'tr')).find((n) => n.textContent.includes('{{r_stt}}'));
  if (tr) {
    const rows = x.kind === 'pl' && (x.rows || []).length ? tcRowValues(x) : [1, 2, 3].map((i) => ({ r_stt: String(i) }));
    for (const rv of rows) { const cl = tr.cloneNode(true); fillTokens(cl, (k) => rv[k], false); tr.parentNode.insertBefore(cl, tr); }
    tr.remove();
  }
  const vals = tcValues(x);
  fillTokens(doc.documentElement, (k) => vals[k]);
  const xml = new XMLSerializer().serializeToString(doc).replace(/^<\?xml[^>]*\?>\s*/, '');
  zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + xml);
  return zip.generateAsync({ type: 'blob', mimeType: DOCX_MIME, compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
const slugVi = (s) => norm(s).replace(/[^a-z0-9]+/gi, '-').replace(/^-+|-+$/g, '').slice(0, 40);
function tcFileName(x) {
  const t = trainer(x.trainerId)?.name || x.partyB?.name || 'giang-vien';
  const no = String(x.no || 'chua-so').split('/').slice(0, 2).join('-');
  return `${x.kind === 'nt' ? 'HDNT' : 'PLHD'}_${slugVi(no)}_${slugVi(t)}.docx`.replace(/_+/g, '_');
}
/** Hiển thị file Word giống bản in (docx-preview); lỗi thì dùng bản đọc chữ (mammoth). */
async function renderDocx(blob, container) {
  container.innerHTML = '<div class="msg">Đang dựng bản xem trước…</div>';
  try {
    const docx = await lib('docx');
    const box = document.createElement('div'); box.className = 'docprev-in';
    await docx.renderAsync(blob, box, null, { className: 'docx', inWrapper: true, ignoreWidth: false, ignoreHeight: false, breakPages: true, ignoreLastRenderedPageBreak: true, renderHeaders: true, renderFooters: true, useBase64URL: true });
    container.innerHTML = ''; container.append(box);
  } catch (e) {
    const mammoth = await lib('mammoth');
    const r = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() });
    container.innerHTML = `<div class="doc">${sanitizeHTML(r.value)}</div>`;
  }
}

/* ---------- dòng phụ lục từ lớp trong lịch ---------- */
function classTopic(c) {
  const g = (c.groups || []).length ? 'Nhóm ' + c.groups.slice().sort().join(', ') : '';
  return [g, c.title || c.kind || ''].filter(Boolean).join(' - ');
}
const classTimeText = (c) => (!c.endDate || c.endDate === c.startDate ? `Ngày ${fmtD(c.startDate)}` : `Từ ${fmtDM(c.startDate)} đến ${fmtD(c.endDate)}`);
function rowFromClass(c, tid) {
  const fe = classFees(c).find((f2) => f2.trainerId === tid);
  const qty = classDays(c);
  let amount = Number(fe?.amount) || 0; let price;
  if (amount) price = amount % qty === 0 ? amount / qty : Math.round(amount / qty);
  else { price = Number(trainer(tid)?.dailyRate) || 0; amount = price * qty; }
  return { id: uid('r'), classId: c.id, customer: classLabel(c), location: c.location || '', topic: classTopic(c), time: classTimeText(c), qty, unit: 'ngày', price, amount };
}

/* ---------- lưu: hồ sơ giảng viên, thù lao lớp ---------- */
async function saveProfileFromB(tid, B) {
  const t = trainer(tid); if (!t) return;
  const map = { dob: 'dob', gender: 'gender', idNo: 'idNo', idDate: 'idDate', idPlace: 'idPlace', address: 'permAddress', phone: 'phone', email: 'email', taxCode: 'taxCode', degree: 'degree', certNo: 'certNo', bankAccount: 'bankAccount', bankName: 'bankName' };
  const upd = { ...t }; let changed = false;
  for (const [k, tk] of Object.entries(map)) {
    const v = String(B[k] ?? '').trim();
    if (v && v !== String(t[tk] ?? '').trim() && !(tk === 'permAddress' && !t.permAddress && v === String(t.address || '').trim())) { upd[tk] = v; changed = true; }
  }
  if ((B.groups || []).length && JSON.stringify((t.groups || []).map(Number).sort()) !== JSON.stringify(B.groups)) { upd.groups = B.groups.slice(); changed = true; }
  if (B.dob && String(upd.birthYear || '') !== B.dob.slice(0, 4)) { upd.birthYear = B.dob.slice(0, 4); changed = true; }
  if (changed) await Store.save('trainers', upd, `${t.name} – bổ sung thông tin hợp đồng`);
}
/** Ghi số phụ lục, thù lao (gồm phần hỗ trợ đi lại) và thuế TNCN vào từng lớp của phụ lục. */
async function applyPlToFees(x) {
  const m = plMoney(x); const rows = (x.rows || []).filter((r) => r.classId && klass(r.classId));
  if (!rows.length) return 0;
  const base = sum(x.rows, (r) => r.amount) || 1;
  let travelLeft = m.travel; let pitLeft = m.pit;
  const linkedIdx = x.rows.map((r, i) => (r.classId && klass(r.classId) ? i : -1)).filter((i) => i >= 0);
  let n = 0;
  for (const i of linkedIdx) {
    const r = x.rows[i]; const last = i === linkedIdx[linkedIdx.length - 1];
    const travel = last && linkedIdx.length === x.rows.length ? travelLeft : Math.round((m.travel * r.amount) / base);
    const pit = last && linkedIdx.length === x.rows.length ? pitLeft : Math.round((m.pit * r.amount) / base);
    travelLeft -= travel; pitLeft -= pit;
    const c = klass(r.classId);
    const list = classFees(c).map((f2) => { const o = { ...f2 }; delete o.removed; return o; });
    let k = list.findIndex((f2) => f2.trainerId === x.trainerId);
    if (k < 0) { list.push({ trainerId: x.trainerId, payments: [] }); k = list.length - 1; }
    list[k] = { ...list[k], amount: r.amount + travel, travel, pit, auto: false, contractNo: x.no, contractDate: x.signDate || '', tcontractId: x.id };
    const rec = { ...c, fees: list };
    rec.costTrainer = sum(rec.fees.filter((f2) => (rec.trainerIds || []).includes(f2.trainerId)), (f2) => f2.amount);
    await Store.save('classes', rec, `Thù lao ${trainer(x.trainerId)?.name || 'GV'} – ${classLabel(c)} theo phụ lục ${x.no}`, 'Cập nhật');
    n++;
  }
  return n;
}
async function unlinkPlFees(x) {
  for (const r of x.rows || []) {
    const c = r.classId && klass(r.classId); if (!c || !Array.isArray(c.fees)) continue;
    const k = c.fees.findIndex((f2) => f2.trainerId === x.trainerId && f2.tcontractId === x.id); if (k < 0) continue;
    const fees = c.fees.map((f2, i) => (i === k ? { ...f2, tcontractId: null, contractNo: '', contractDate: '' } : f2));
    await Store.save('classes', { ...c, fees });
  }
}

/* ======================= TẠO HỢP ĐỒNG / PHỤ LỤC (3 bước) ======================= */
/**
 * opts: { trainerId, kind, id (sửa bản đã có), parentId, fromNewTrainer }
 */
function tcWizard(opts = {}) {
  if (!S.role.canEdit) return;
  const ex = opts.id ? tcontract(opts.id) : null;
  const t0 = todayISO();
  const tOf = (id) => trainer(id) || (opts.trainerRec && opts.trainerRec.id === id ? opts.trainerRec : null);
  const w = ex ? clone(ex) : { kind: opts.kind || '', trainerId: opts.trainerId || '', parentId: opts.parentId || '', status: 'draft', rows: [], travel: 0, pitAuto: true, withForm: true, term: '1y' };
  w.saveProfile = true; w.updateFees = true;
  if (ex) {
    // bổ sung các ô còn trống từ hồ sơ hiện tại (giảng viên vừa cập nhật CCCD, MST…)
    const pb = partyB(trainer(ex.trainerId) || {}); const pa = partyA();
    w.partyB = w.partyB || {}; w.partyA = w.partyA || {};
    for (const k of Object.keys(pb)) if (isBlank(w.partyB[k]) && !isBlank(pb[k])) w.partyB[k] = pb[k];
    for (const k of Object.keys(pa)) if (isBlank(w.partyA[k]) && !isBlank(pa[k])) w.partyA[k] = pa[k];
  }
  let step = ex ? 2 : opts.trainerId ? 2 : 1;
  let blob = null; let pickQ = '';
  if (!ex && w.trainerId && !w.kind) w.kind = usableNts(w.trainerId).length ? 'pl' : 'nt';
  if (!ex && w.trainerId) initDefaults();

  const m = openModal({ title: ex ? `Sửa ${TC_KIND[ex.kind].toLowerCase()} ${esc(ex.no || '')}` : 'Tạo hợp đồng giảng viên', sub: 'Theo mẫu Hợp đồng nguyên tắc thỉnh giảng và Phụ lục chuẩn của DAKO', size: 'wide', body: '', foot: '<span></span>' });
  m.guard = async () => (step === 1 && !ex ? true : confirmBox('Đóng mà không lưu hợp đồng đang lập?', { ok: 'Đóng', danger: true }));

  function initDefaults() {
    const t = tOf(w.trainerId); if (!t) return;
    const co = companyInfo();
    w.partyA = partyA(); w.partyB = partyB(t);
    w.signDate = w.signDate || t0;
    w.signPlace = w.signPlace || co.signPlace || co.address || '';
    if (w.kind === 'nt') {
      w.payDays = w.payDays ?? settings().contractPayDays ?? '';
      w.term = w.term || '1y'; w.from = w.from || t0; setTerm(w.term);
      const y = Number(w.signDate.slice(0, 4)); w.stt = nextTcStt('nt', y); w.no = fmtDocNo(tcFmt('nt'), { stt: w.stt, year: y });
    } else {
      const nts = usableNts(w.trainerId);
      if (!w.parentId || !nts.some((x) => x.id === w.parentId)) w.parentId = (activeNt(w.trainerId) || nts[0])?.id || '';
      const nt = tcontract(w.parentId);
      w.payDays = w.payDays || nt?.payDays || settings().contractPayDays || '';
      const y = Number(w.signDate.slice(0, 4)); w.stt = nextTcStt('pl', y); w.no = fmtDocNo(tcFmt('pl'), { stt: w.stt, year: y });
      w.seq = nt ? nextSeq(nt.id) : 1;
      if (!w.rows.length) w.rows = candidateClasses().filter((o) => o.pre).map((o) => rowFromClass(o.c, w.trainerId));
    }
  }
  function setTerm(term) {
    w.term = term; if (!w.from) return;
    if (term === '1y') w.to = addDays(addMonths(w.from, 12), -1);
    else if (term === '6m') w.to = addDays(addMonths(w.from, 6), -1);
    else if (term === 'eoy') w.to = w.from.slice(0, 4) + '-12-31';
  }
  /** Lớp của giảng viên để đưa vào phụ lục: chưa hủy, chưa nằm trong phụ lục khác. pre = gợi ý chọn sẵn. */
  function candidateClasses() {
    const nt = tcontract(w.parentId); const back = addDays(t0, -60);
    return S.classes.filter((c) => c.status !== 'cancelled' && (c.trainerIds || []).includes(w.trainerId))
      .sort((a, b) => sortClasses(b, a))
      .map((c) => {
        const other = classPl(c.id, w.trainerId, w.id);
        const inTerm = !nt || ((!nt.from || (c.endDate || c.startDate) >= nt.from) && (!nt.to || c.startDate <= nt.to));
        return { c, other, inTerm, pre: !other && inTerm && (c.endDate || c.startDate) >= back };
      });
  }
  function stepsBar() {
    const names = ['Chọn giảng viên', 'Thông tin hợp đồng', 'Xem lại & xuất file'];
    return `<ol class="steps">${names.map((n, i) => `<li class="${i + 1 === step ? 'on' : i + 1 < step ? 'done' : ''}"><span>${i + 1 < step ? ic('check') : i + 1}</span>${n}</li>`).join('')}</ol>`;
  }
  function render() {
    m.el.querySelector('.modal-h h2').textContent = ex ? `Sửa ${TC_KIND[w.kind].toLowerCase()} ${w.no || ''}` : w.kind && step > 1 ? `Tạo ${TC_KIND[w.kind].toLowerCase()}` : 'Tạo hợp đồng giảng viên';
    if (step === 1) renderPick(); else if (step === 2) renderForm(); else renderReview();
    bindMoney(m.body); hydrate(m.body);
  }

  /* ---- bước 1: chọn giảng viên & loại ---- */
  function renderPick() {
    const q = norm(pickQ);
    const list = S.trainers.filter((t) => !q || norm([t.name, t.phone, regionName(t.region)].join(' ')).includes(q))
      .sort((a, b) => (a.status === 'paused') - (b.status === 'paused') || a.name.localeCompare(b.name, 'vi'));
    const t = trainer(w.trainerId); const nts = t ? usableNts(t.id) : [];
    const act = t ? activeNt(t.id) : null;
    m.body.innerHTML = `${stepsBar()}
      <div class="grid-2 wz-pick"><div><div class="sec-title">1. Chọn giảng viên</div>
        <div class="search" style="margin-bottom:8px">${ic('search')}<input class="input" type="search" data-pickq placeholder="Tìm tên, SĐT, vùng…" value="${esc(pickQ)}"></div>
        <div class="picklist" role="radiogroup" aria-label="Giảng viên">${list.map((x) => `<label class="pick${x.id === w.trainerId ? ' on' : ''}"><input type="radio" name="wz-tr" value="${esc(x.id)}"${x.id === w.trainerId ? ' checked' : ''}>${avatar(x, 'sm')}<span class="grow"><b>${esc(x.name)}</b><span class="muted small">${esc(regionName(x.region))}${x.status === 'paused' ? ' · tạm ngưng' : ''}</span></span>${trainerTcBadge(x)}</label>`).join('') || '<div class="muted small">Không có giảng viên phù hợp.</div>'}</div></div>
      <div><div class="sec-title">2. Loại văn bản</div>${t ? `<div class="kindpick">
        <label class="pick${w.kind === 'nt' ? ' on' : ''}"><input type="radio" name="wz-kind" value="nt"${w.kind === 'nt' ? ' checked' : ''}><span class="grow"><b>Hợp đồng nguyên tắc thỉnh giảng</b><span class="muted small">Ký một lần cho cả thời hạn (VD: 1 năm). ${act ? `Đang có HĐNT ${esc(act.no)} hiệu lực đến ${esc(fmtD(act.to))} – chỉ tạo mới khi ký lại/gia hạn.` : 'Giảng viên chưa có HĐNT còn hiệu lực.'}</span></span></label>
        <label class="pick${w.kind === 'pl' ? ' on' : ''}${nts.length ? '' : ' dis'}"><input type="radio" name="wz-kind" value="pl"${w.kind === 'pl' ? ' checked' : ''}${nts.length ? '' : ' disabled'}><span class="grow"><b>Phụ lục hợp đồng</b><span class="muted small">${nts.length ? `Chốt lớp dạy, đơn giá, thù lao theo HĐNT ${esc(nts.map((x) => x.no).join(', '))}.` : 'Cần có hợp đồng nguyên tắc còn hiệu lực trước.'}</span></span></label></div>
        <div class="small muted" style="margin-top:10px">Hợp đồng đã lập của ${esc(t.name)}: ${trainerTcs(t.id).length ? trainerTcs(t.id).sort((a, b) => (b.signDate || '').localeCompare(a.signDate || '')).slice(0, 6).map((x) => `${TC_SHORT[x.kind]} ${esc(x.no)} (${esc(tcState(x).label.toLowerCase())})`).join(' · ') : 'chưa có'}</div>` : '<div class="muted small">Chọn giảng viên ở bên trái.</div>'}</div></div>`;
    m.foot.innerHTML = `<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-next${t && w.kind ? '' : ' disabled'}>Tiếp ${ic('right')}</button>`;
    const qi = m.body.querySelector('[data-pickq]');
    qi.addEventListener('input', debounce(() => { pickQ = qi.value; render(); const n = m.body.querySelector('[data-pickq]'); n.focus(); n.setSelectionRange(n.value.length, n.value.length); }, 200));
    m.body.querySelectorAll('input[name=wz-tr]').forEach((r) => r.addEventListener('change', () => { w.trainerId = r.value; w.kind = usableNts(r.value).length ? 'pl' : 'nt'; w.rows = []; w.parentId = ''; render(); }));
    m.body.querySelectorAll('input[name=wz-kind]').forEach((r) => r.addEventListener('change', () => { w.kind = r.value; w.rows = []; render(); }));
    m.foot.querySelector('[data-cancel]').onclick = () => m.close();
    m.foot.querySelector('[data-next]').onclick = () => { w.no = ''; w.stt = null; initDefaults(); step = 2; render(); };
  }

  /* ---- bước 2: thông số ---- */
  const missCls = (v) => (isBlank(v) ? ' miss' : '');
  const missHint = (v, extra = '') => (isBlank(v) ? `<span class="hint warn-t">Chưa có – in dòng chấm để điền tay${extra}</span>` : '');
  function noHint() {
    const y = Number((w.signDate || t0).slice(0, 4)); const used = usedTcStt(w.kind, y, w.id);
    const dup = tcDuplicate(w.kind, w.no, y, w.id);
    if (dup) return `<span class="hint bad-t">Số này đã dùng cho ${esc(TC_SHORT[dup.kind])} của ${esc(trainer(dup.trainerId)?.name || dup.partyB?.name || '')} – chọn số khác.</span>`;
    return `<span class="hint">Năm ${y}: ${used.length ? `đã dùng số ${used.slice(-6).map(padNo).join(', ')}` : 'chưa có số nào'} · số tiếp theo ${padNo(nextTcStt(w.kind, y, w.id))}</span>`;
  }
  function partyBFields(full) {
    const B = w.partyB || {};
    const fld = (k, label, input, cls = '') => `<div class="f ${cls}${missCls(B[k])}"><label for="wb-${k}">${label}</label>${input}${missHint(B[k])}</div>`;
    const ip = (k, attrs = '') => `<input class="input" id="wb-${k}" data-b="${k}" value="${esc(B[k] ?? '')}" ${attrs}>`;
    if (!full) return `<div class="fgrid">${fld('name', 'Họ và tên', ip('name'))}${fld('idNo', 'Số CCCD', ip('idNo', 'inputmode="numeric" placeholder="12 số"'))}${fld('taxCode', 'Mã số thuế cá nhân', ip('taxCode', 'inputmode="numeric"'))}</div>`;
    return `<div class="fgrid">
      ${fld('name', 'Họ và tên', ip('name'), 'span2')}${fld('dob', 'Ngày sinh', ip('dob', 'type="date"'))}
      ${fld('gender', 'Giới tính', `<select class="input" id="wb-gender" data-b="gender">${opt('', 'Chọn…', !B.gender)}${opt('Nam', 'Nam', B.gender === 'Nam')}${opt('Nữ', 'Nữ', B.gender === 'Nữ')}</select>`)}
      ${fld('idNo', 'Số CCCD/Hộ chiếu', ip('idNo', 'placeholder="12 số CCCD"'))}${fld('idDate', 'Ngày cấp', ip('idDate', 'type="date"'))}${fld('idPlace', 'Nơi cấp', ip('idPlace', 'placeholder="VD: Cục CS QLHC về TTXH"'))}
      ${fld('address', 'Địa chỉ thường trú', ip('address', 'placeholder="Theo CCCD"'), 'span2')}${fld('phone', 'Điện thoại', ip('phone', 'inputmode="tel"'))}${fld('email', 'Email', ip('email', 'type="email"'))}
      ${fld('taxCode', 'Mã số thuế cá nhân', ip('taxCode', 'inputmode="numeric"'))}${fld('degree', 'Trình độ chuyên môn / chuyên ngành', ip('degree', 'placeholder="VD: Kỹ sư điện"'), 'span2')}
      ${fld('certNo', 'Số GCN người huấn luyện ATVSLĐ', ip('certNo'))}
      <div class="f full${missCls(B.groups)}"><span class="lbl">Phạm vi được phép huấn luyện</span>${groupChecks('wb-groups', B.groups)}${missHint(B.groups)}</div>
      ${fld('bankAccount', 'Số tài khoản ngân hàng', ip('bankAccount', 'inputmode="numeric"'))}${fld('bankName', 'Tại ngân hàng', ip('bankName', 'placeholder="VD: Vietcombank – CN Nha Trang"'), 'span2')}
    </div>`;
  }
  function partyABlock() {
    const A = w.partyA || partyA();
    const miss = A_FIELDS.filter(([k]) => !['rep', 'repTitle'].includes(k) && isBlank(A[k])).map((x) => x[1]);
    return `<div class="fgrid"><div class="f${missCls(A.rep)}"><label for="wa-rep">Người đại diện ký</label><input class="input" id="wa-rep" value="${esc(A.rep || '')}" placeholder="Họ tên người đại diện"></div>
      <div class="f${missCls(A.repTitle)}"><label for="wa-title">Chức vụ</label><input class="input" id="wa-title" value="${esc(A.repTitle || '')}" placeholder="VD: Giám đốc"></div></div>
      <div class="small muted" style="margin-top:8px">${esc(A.name)} · ${esc(A.address || '')}${A.taxCode ? ` · MST ${esc(A.taxCode)}` : ''} · TK ${esc(A.bankAccount || '—')} ${esc(A.bankName || '')}</div>
      ${miss.length ? `<div class="small warn-t" style="margin-top:4px">Thông tin công ty còn thiếu: ${esc(miss.join(', '))} – bổ sung ở tab Cài đặt (in dòng chấm nếu để trống).</div>` : ''}`;
  }
  function rowsTable() {
    const mny = plMoney(w);
    return `<div class="tbl-wrap"><table class="tbl plrows"><thead><tr><th>#</th><th>Khách hàng / địa điểm</th><th>Đối tượng / chuyên đề</th><th>Thời gian</th><th class="r">SL</th><th>Đơn vị</th><th class="r">Đơn giá (đ)</th><th class="r">Thành tiền (đ)</th><th></th></tr></thead><tbody>
      ${w.rows.map((r, i) => `<tr data-i="${i}" style="cursor:default"><td class="num">${i + 1}</td>
        <td><input class="input" data-k="customer" value="${esc(r.customer)}" placeholder="Đơn vị được huấn luyện" aria-label="Khách hàng"><input class="input${missCls(r.location)}" data-k="location" value="${esc(r.location)}" placeholder="Địa điểm học" aria-label="Địa điểm" style="margin-top:4px"></td>
        <td><input class="input" data-k="topic" value="${esc(r.topic)}" placeholder="VD: Nhóm 3 - Vận hành thiết bị nâng" aria-label="Chuyên đề"></td>
        <td><input class="input" data-k="time" value="${esc(r.time)}" placeholder="Ngày …/…/…" aria-label="Thời gian"></td>
        <td><input class="input num" data-k="qty" type="number" min="0" step="0.5" value="${esc(r.qty)}" style="width:70px" aria-label="Số lượng"></td>
        <td><select class="input" data-k="unit" aria-label="Đơn vị">${['ngày', 'buổi', 'giờ', 'lớp'].map((u) => opt(u, u, r.unit === u)).join('')}</select></td>
        <td><input class="input num" data-k="price" data-money inputmode="numeric" value="${r.price ? money(r.price) : ''}" style="width:120px" aria-label="Đơn giá"></td>
        <td><input class="input num" data-k="amount" data-money inputmode="numeric" value="${r.amount ? money(r.amount) : ''}" style="width:130px" aria-label="Thành tiền"></td>
        <td><button type="button" class="btn icon ghost" data-rmrow="${i}" aria-label="Bỏ dòng">${ic('trash')}</button></td></tr>`).join('') || '<tr style="cursor:default"><td colspan="9" class="muted small">Chưa có lớp nào – chọn lớp ở trên hoặc bấm “Thêm dòng”.</td></tr>'}
      </tbody><tfoot><tr><td colspan="7">Tổng giá trị phụ lục (chưa trừ thuế TNCN)</td><td class="r" data-total>${money(mny.total)}</td><td></td></tr></tfoot></table></div>
      <button type="button" class="btn sm" data-addrow style="margin-top:8px">${ic('plus')} Thêm dòng (lớp ngoài lịch)</button>`;
  }
  function moneyBox() {
    const mny = plMoney(w); const { rate, min } = pitCfg();
    return `<div class="money-box cols-4">${mbox('Tổng giá trị', money(mny.total))}${mbox('Hỗ trợ đi lại, lưu trú', money(mny.travel))}${mbox(`Thuế TNCN ${rate}%`, money(mny.pit), 'neg', mny.gross >= min ? 'tổng chi trả ≥ ' + money(min) : 'dưới ' + money(min) + ' – không khấu trừ')}${mbox('Thực nhận chuyển khoản', money(mny.net), 'hl')}</div>
      <div class="small" style="margin-top:6px"><i>Bằng chữ: ${esc(vnMoneyWords(mny.total))}</i></div>`;
  }
  function renderForm() {
    const t = tOf(w.trainerId);
    const y = Number((w.signDate || t0).slice(0, 4));
    let html = stepsBar();
    if (w.kind === 'nt') {
      html += `<div class="stack">
        <fieldset class="sec"><legend>Số hợp đồng &amp; thời hạn</legend><div class="fgrid">
          <div class="f"><label for="wz-no">Số hợp đồng</label><input class="input" id="wz-no" value="${esc(w.no || '')}" placeholder="${esc(fmtDocNo(tcFmt('nt'), { stt: nextTcStt('nt', y, w.id), year: y }))}"><span data-nohint>${noHint()}</span></div>
          ${f('wz-date', 'Ngày ký', inp('wz-date', w.signDate, 'type="date"'))}
          ${f('wz-place', 'Nơi ký (Hôm nay … tại …)', inp('wz-place', w.signPlace, 'placeholder="VD: Văn phòng Công ty DAKO, TP.HCM"'), { cls: 'span2' })}
          <div class="f full"><span class="lbl">Thời hạn hợp đồng</span><div class="chips" data-terms>${[['1y', '1 năm'], ['eoy', 'Đến hết năm'], ['6m', '6 tháng'], ['custom', 'Tùy chọn ngày']].map(([k, l]) => `<button type="button" class="chip" data-term="${k}" aria-pressed="${w.term === k}">${l}</button>`).join('')}</div></div>
          ${f('wz-from', 'Hiệu lực từ ngày', inp('wz-from', w.from, 'type="date"'))}${f('wz-to', 'Đến hết ngày', inp('wz-to', w.to, 'type="date"'), { hint: w.from && w.to ? `${Math.round(daysBetween(w.from, w.to) / 30.4)} tháng` : '' })}
          ${f('wz-paydays', 'Thanh toán trong (ngày làm việc)', inp('wz-paydays', w.payDays, 'type="number" min="1" placeholder="Để trống: in “.......”"'), { hint: 'Điều 3.3 – kể từ ngày hoàn tất hồ sơ nghiệm thu' })}
        </div></fieldset>
        <fieldset class="sec"><legend>Bên A – ${esc(companyInfo().nameVi || 'DAKO')}</legend>${partyABlock()}</fieldset>
        <fieldset class="sec"><legend>Bên B – giảng viên thỉnh giảng</legend>${partyBFields(true)}
          <label class="inline-check" style="margin-top:10px"><input type="checkbox" id="wz-saveprof"${w.saveProfile ? ' checked' : ''}> Lưu các thông tin vừa bổ sung vào hồ sơ giảng viên ${esc(t?.name || '')}</label></fieldset>
        <label class="inline-check"><input type="checkbox" id="wz-form"${w.withForm !== false ? ' checked' : ''}> Kèm mẫu Phụ lục hợp đồng (để trống, đã điền thông tin hai bên) ở cuối – theo điều 1.2</label>
        ${f('wz-notes', 'Ghi chú nội bộ (không in)', `<textarea class="input" id="wz-notes" rows="2" placeholder="Ghi chú theo dõi">${esc(w.notes || '')}</textarea>`)}
      </div>`;
    } else {
      const nts = usableNts(w.trainerId); const nt = tcontract(w.parentId);
      const cands = candidateClasses();
      html += `<div class="stack">
        <fieldset class="sec"><legend>Số phụ lục</legend><div class="fgrid">
          ${f('wz-parent', 'Thuộc hợp đồng nguyên tắc', `<select class="input" id="wz-parent">${nts.map((x) => opt(x.id, `${x.no} (${fmtD(x.from)} – ${fmtD(x.to)})`, x.id === w.parentId)).join('')}</select>`, { cls: 'span2', hint: nt ? `${esc(tcState(nt).label)} · đã có ${ntAppendices(nt.id).filter((x) => x.id !== w.id).length} phụ lục` : '' })}
          <div class="f"><label for="wz-no">Số phụ lục (góc trái)</label><input class="input" id="wz-no" value="${esc(w.no || '')}"><span data-nohint>${noHint()}</span></div>
          ${f('wz-seq', 'Phụ lục số (thứ tự trong HĐNT)', inp('wz-seq', padNo(w.seq || 1), 'inputmode="numeric"'), { hint: 'In ở tiêu đề “PHỤ LỤC HỢP ĐỒNG SỐ: …”' })}
          ${f('wz-date', 'Ngày ký', inp('wz-date', w.signDate, 'type="date"'))}
          ${f('wz-place', 'Nơi ký', inp('wz-place', w.signPlace, 'placeholder="VD: Văn phòng Công ty DAKO"'), { cls: 'span2' })}
          ${f('wz-paydays', 'Thanh toán trong (ngày làm việc)', inp('wz-paydays', w.payDays, 'type="number" min="1" placeholder="Để trống: in “.......”"'), { hint: 'Điều 2.2 – kể từ ngày ký biên bản nghiệm thu' })}
        </div></fieldset>
        <fieldset class="sec"><legend>Lớp giảng dạy của ${esc(t?.name || '')}</legend>
          ${cands.length ? `<div class="classpick">${cands.slice(0, 40).map((o) => { const on = w.rows.some((r) => r.classId === o.c.id); return `<label class="cpick${o.other ? ' dis' : ''}${on ? ' on' : ''}"><input type="checkbox" data-cls="${esc(o.c.id)}"${on ? ' checked' : ''}${o.other ? ' disabled' : ''}><span class="grow"><b>${esc(fmtDateRange(o.c.startDate, o.c.endDate))}</b> · ${esc(classLabel(o.c))}<span class="muted small"> · ${esc(groupsText(o.c.groups) || 'chưa chọn nhóm')} · ${classDays(o.c)} ngày${o.other ? ` · đã có trong phụ lục ${esc(o.other.no)}` : !o.inTerm ? ' · ngoài thời hạn HĐNT' : ''}</span></span></label>`; }).join('')}</div>` : '<div class="muted small">Giảng viên chưa có lớp nào trong lịch – có thể thêm dòng thủ công.</div>'}
          <div data-rows style="margin-top:12px">${rowsTable()}</div></fieldset>
        <fieldset class="sec"><legend>Thù lao &amp; thuế</legend><div class="fgrid">
          ${f('wz-travel', 'Chi phí hỗ trợ đi lại, lưu trú (nếu có)', moneyInp('wz-travel', w.travel || '', 'Để trống nếu không có'))}
          <div class="f span2"><span class="lbl">Thuế TNCN khấu trừ</span><div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap"><label class="inline-check"><input type="checkbox" id="wz-pitauto"${w.pitAuto !== false ? ' checked' : ''}> Tự tính ${pitCfg().rate}% khi tổng chi trả từ ${money(pitCfg().min)} đ</label>
            <input class="input num" id="wz-pit" data-money inputmode="numeric" style="width:150px" value="${money(plMoney(w).pit)}"${w.pitAuto !== false ? ' disabled' : ''} aria-label="Thuế TNCN"></div><span class="hint">Tính trên tổng chi trả = thù lao + hỗ trợ đi lại. Bỏ chọn để nhập tay (VD: GV có cam kết 08).</span></div>
        </div><div data-mbox style="margin-top:12px">${moneyBox()}</div>
          <label class="inline-check" style="margin-top:10px"><input type="checkbox" id="wz-fees"${w.updateFees ? ' checked' : ''}> Ghi thù lao, thuế TNCN và số phụ lục vào các lớp tương ứng (Giảng viên → Thù lao &amp; công nợ)</label></fieldset>
        <fieldset class="sec"><legend>Hai bên ký phụ lục</legend>${partyABlock()}<div style="margin-top:10px">${partyBFields(false)}</div>
          <label class="inline-check" style="margin-top:10px"><input type="checkbox" id="wz-saveprof"${w.saveProfile ? ' checked' : ''}> Lưu CCCD / MST vừa bổ sung vào hồ sơ giảng viên</label></fieldset>
        ${f('wz-notes', 'Ghi chú nội bộ (không in)', `<textarea class="input" id="wz-notes" rows="2" placeholder="Ghi chú theo dõi">${esc(w.notes || '')}</textarea>`)}
      </div>`;
    }
    m.body.innerHTML = html;
    m.foot.innerHTML = `${ex ? '' : `<button type="button" class="btn" data-back>${ic('left')} Quay lại</button>`}<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-next>${ic('eye')} Xem lại hợp đồng</button>`;
    bindForm();
  }
  function readForm() {
    const b = m.body; const g = (id) => b.querySelector('#' + id);
    if (g('wz-no')) w.no = g('wz-no').value.trim();
    if (g('wz-date')) w.signDate = g('wz-date').value;
    if (g('wz-place')) w.signPlace = g('wz-place').value.trim();
    if (g('wz-paydays')) w.payDays = g('wz-paydays').value.trim();
    if (g('wz-from')) w.from = g('wz-from').value;
    if (g('wz-to')) w.to = g('wz-to').value;
    if (g('wz-seq')) w.seq = Number(g('wz-seq').value.replace(/\D/g, '')) || 1;
    if (g('wz-travel')) w.travel = parseMoney(g('wz-travel').value);
    if (g('wz-pitauto')) { w.pitAuto = g('wz-pitauto').checked; if (!w.pitAuto) w.pit = parseMoney(g('wz-pit').value); }
    if (g('wz-form')) w.withForm = g('wz-form').checked;
    if (g('wz-fees')) w.updateFees = g('wz-fees').checked;
    if (g('wz-saveprof')) w.saveProfile = g('wz-saveprof').checked;
    if (g('wz-notes')) w.notes = g('wz-notes').value.trim();
    w.partyA = { ...(w.partyA || partyA()), rep: g('wa-rep')?.value.trim() ?? w.partyA?.rep, repTitle: g('wa-title')?.value.trim() ?? w.partyA?.repTitle };
    const B = { ...(w.partyB || {}) };
    b.querySelectorAll('[data-b]').forEach((el) => (B[el.dataset.b] = el.value.trim()));
    if (b.querySelector('input[name=wb-groups]')) B.groups = checkedVals(b, 'wb-groups').map(Number).sort();
    w.partyB = B;
    if (w.kind === 'nt') { const p = parseDocNo(tcFmt('nt'), w.no); w.stt = p?.stt || null; }
    else { const p = parseDocNo(tcFmt('pl'), w.no); w.stt = p?.stt || null; const nt = tcontract(w.parentId); w.parentNo = nt?.no || ''; w.parentDate = nt?.signDate || ''; }
  }
  function bindForm() {
    const b = m.body;
    b.querySelector('#wz-no')?.addEventListener('input', () => { readForm(); b.querySelector('[data-nohint]').innerHTML = noHint(); });
    b.querySelector('#wz-date')?.addEventListener('change', () => {
      const before = w.no; readForm(); const y = Number((w.signDate || t0).slice(0, 4));
      if (!before || (w.stt && parseDocNo(tcFmt(w.kind), before))) { w.stt = nextTcStt(w.kind, y, w.id); w.no = fmtDocNo(tcFmt(w.kind), { stt: w.stt, year: y }); b.querySelector('#wz-no').value = w.no; }
      b.querySelector('[data-nohint]').innerHTML = noHint();
    });
    b.querySelector('[data-terms]')?.addEventListener('click', (e) => { const c = e.target.closest('[data-term]'); if (!c) return; readForm(); setTerm(c.dataset.term); render(); });
    b.querySelector('#wz-from')?.addEventListener('change', () => { readForm(); if (w.term !== 'custom') { setTerm(w.term); b.querySelector('#wz-to').value = w.to || ''; } });
    b.querySelector('#wz-to')?.addEventListener('change', () => { readForm(); w.term = 'custom'; b.querySelectorAll('[data-term]').forEach((x) => x.setAttribute('aria-pressed', String(x.dataset.term === 'custom'))); });
    b.querySelector('#wz-parent')?.addEventListener('change', () => { readForm(); w.parentId = b.querySelector('#wz-parent').value; const nt = tcontract(w.parentId); w.seq = nt ? nextSeq(nt.id, w.id) : 1; w.payDays = w.payDays || nt?.payDays || ''; render(); });
    b.querySelectorAll('[data-cls]').forEach((cb) => cb.addEventListener('change', () => {
      readForm(); const c = klass(cb.dataset.cls);
      if (cb.checked) w.rows.push(rowFromClass(c, w.trainerId)); else w.rows = w.rows.filter((r) => r.classId !== c.id);
      w.rows.sort((r1, r2) => (r1.classId && r2.classId ? sortClasses(klass(r1.classId), klass(r2.classId)) : r1.classId ? -1 : 1));
      render();
    }));
    const rowsEl = b.querySelector('[data-rows]');
    rowsEl?.addEventListener('input', (e) => {
      const tr = e.target.closest('tr[data-i]'); const k = e.target.dataset.k; if (!tr || !k) return;
      const r = w.rows[Number(tr.dataset.i)];
      if (k === 'qty') r.qty = Number(e.target.value) || 0; else if (k === 'price' || k === 'amount') r[k] = parseMoney(e.target.value); else r[k] = e.target.value;
      if (k === 'qty' || k === 'price') { r.amount = Math.round((Number(r.qty) || 0) * (Number(r.price) || 0)); tr.querySelector('[data-k=amount]').value = r.amount ? money(r.amount) : ''; }
      if (k === 'location') e.target.classList.toggle('miss', isBlank(r.location));
      refreshMoney();
    });
    rowsEl?.addEventListener('change', (e) => { if (e.target.dataset.k === 'unit') { const tr = e.target.closest('tr[data-i]'); w.rows[Number(tr.dataset.i)].unit = e.target.value; } });
    rowsEl?.addEventListener('click', (e) => {
      const rm = e.target.closest('[data-rmrow]'); const add = e.target.closest('[data-addrow]');
      if (rm) { readForm(); w.rows.splice(Number(rm.dataset.rmrow), 1); render(); }
      if (add) { readForm(); const t = trainer(w.trainerId); w.rows.push({ id: uid('r'), classId: '', customer: '', location: '', topic: '', time: '', qty: 1, unit: 'ngày', price: Number(t?.dailyRate) || 0, amount: Number(t?.dailyRate) || 0 }); render(); m.body.querySelector('[data-rows] tbody tr:last-child [data-k=customer]')?.focus(); }
    });
    b.querySelector('#wz-travel')?.addEventListener('input', () => { w.travel = parseMoney(b.querySelector('#wz-travel').value); refreshMoney(); });
    b.querySelector('#wz-pitauto')?.addEventListener('change', () => { const on = b.querySelector('#wz-pitauto').checked; w.pitAuto = on; const pi = b.querySelector('#wz-pit'); pi.disabled = on; if (!on) { w.pit = plMoney({ ...w, pitAuto: true }).pit; pi.value = money(w.pit); pi.focus(); } refreshMoney(); });
    b.querySelector('#wz-pit')?.addEventListener('input', () => { w.pit = parseMoney(b.querySelector('#wz-pit').value); refreshMoney(false); });
    b.querySelectorAll('[data-b]').forEach((el) => el.addEventListener('input', () => { const fEl = el.closest('.f'); if (!fEl) return; const blank = !el.value.trim(); fEl.classList.toggle('miss', blank); const h = fEl.querySelector('.warn-t'); if (h) h.hidden = !blank; }));
    m.foot.querySelector('[data-back]')?.addEventListener('click', () => { readForm(); step = 1; render(); });
    m.foot.querySelector('[data-cancel]').onclick = () => m.tryClose();
    m.foot.querySelector('[data-next]').onclick = () => { readForm(); const err = validate(); if (err) { toast(err, 'bad'); return; } step = 3; render(); };
  }
  function refreshMoney(syncPit = true) {
    const b = m.body; const mny = plMoney(w);
    const tot = b.querySelector('[data-total]'); if (tot) tot.textContent = money(mny.total);
    const pi = b.querySelector('#wz-pit'); if (pi && syncPit && w.pitAuto !== false) pi.value = money(mny.pit);
    const box = b.querySelector('[data-mbox]'); if (box) box.innerHTML = moneyBox();
  }
  function validate() {
    if (!w.no) return 'Nhập số hợp đồng.';
    const y = Number((w.signDate || t0).slice(0, 4));
    const dup = tcDuplicate(w.kind, w.no, y, w.id); if (dup) return `Số ${w.no} đã dùng cho ${TC_SHORT[dup.kind]} của ${trainer(dup.trainerId)?.name || ''}.`;
    if (!w.signDate) return 'Chọn ngày ký.';
    if (w.kind === 'nt') { if (!w.from || !w.to) return 'Chọn thời hạn hiệu lực (từ ngày – đến ngày).'; if (w.to < w.from) return 'Ngày kết thúc phải sau ngày bắt đầu.'; }
    else {
      if (!w.parentId) return 'Chọn hợp đồng nguyên tắc.';
      if (!w.rows.length) return 'Phụ lục cần ít nhất một lớp giảng dạy.';
      if (w.rows.some((r) => !r.customer)) return 'Nhập đơn vị được huấn luyện cho mọi dòng.';
      if (!(plMoney(w).total > 0)) return 'Tổng giá trị phụ lục đang bằng 0 – nhập đơn giá/thành tiền.';
    }
    return '';
  }

  /* ---- bước 3: xem lại & xuất ---- */
  async function renderReview() {
    const miss = tcMissing(w); const mny = w.kind === 'pl' ? plMoney(w) : null; const t = tOf(w.trainerId);
    m.body.innerHTML = `${stepsBar()}
      <div class="review-top"><div class="grow"><b>${esc(TC_KIND[w.kind])} số ${esc(w.no)}</b> · ${esc(t?.name || '')} · ký ngày ${esc(fmtD(w.signDate))}${w.kind === 'nt' ? ` · hiệu lực ${esc(fmtD(w.from))} – ${esc(fmtD(w.to))}` : ` · ${w.rows.length} lớp · tổng ${esc(moneyD(mny.total))} · thực nhận ${esc(moneyD(mny.net))}`}</div></div>
      ${miss.length ? `<div class="banner warn" style="margin:8px 0"><span class="grow"><b>${miss.length} mục còn trống</b> – sẽ in dòng chấm như mẫu để điền tay: ${esc(miss.join(', '))}. Bấm “Sửa lại” để bổ sung.</span></div>` : '<div class="banner info" style="margin:8px 0"><span class="grow">Đã đủ thông tin theo mẫu.</span></div>'}
      <div class="docprev" data-prev><div class="msg">Đang tạo bản xem trước…</div></div>`;
    m.foot.innerHTML = `<button type="button" class="btn" data-back>${ic('left')} Sửa lại</button><span class="sp"></span><button type="button" class="btn" data-save>${ic('check')} Lưu, chưa xuất file</button><button type="button" class="btn primary" data-export>${ic('down')} Xuất hợp đồng (.docx)</button>`;
    m.foot.querySelector('[data-back]').onclick = () => { step = 2; render(); };
    m.foot.querySelector('[data-save]').onclick = (e) => finish(e.currentTarget, false);
    m.foot.querySelector('[data-export]').onclick = (e) => finish(e.currentTarget, true);
    const prev = m.body.querySelector('[data-prev]');
    try { blob = await buildTcDocx(w); if (step === 3) await renderDocx(blob, prev); } catch (e) { blob = null; prev.innerHTML = `<div class="msg"><b>Không tạo được bản xem trước.</b><br>${esc(e.message || '')}</div>`; }
  }
  async function finish(btn, doExport) {
    $$('button', m.foot).forEach((x) => (x.disabled = true)); const label = btn.innerHTML; btn.textContent = 'Đang lưu…';
    try {
      const rec = { ...(ex || {}), id: w.id || uid('hd') };
      const keep = ['kind', 'trainerId', 'no', 'stt', 'signDate', 'signPlace', 'payDays', 'partyA', 'partyB', 'notes', 'status'];
      const ntKeys = ['from', 'to', 'term', 'withForm']; const plKeys = ['parentId', 'parentNo', 'parentDate', 'seq', 'rows', 'travel', 'pitAuto', 'pit'];
      for (const k of [...keep, ...(w.kind === 'nt' ? ntKeys : plKeys)]) rec[k] = clone(w[k] ?? null);
      rec.trainerName = tOf(w.trainerId)?.name || w.partyB?.name || '';
      rec.year = Number(w.signDate.slice(0, 4));
      if (w.kind === 'pl') { const mny = plMoney(w); Object.assign(rec, { total: mny.total, pit: mny.pit, net: mny.net }); }
      rec.status = rec.status || 'draft';
      w.id = rec.id;
      if (doExport) {
        const out = blob || (await buildTcDocx(w));
        const name = tcFileName(rec);
        const old = rec.docFile;
        if (Store.backend.kind !== 'cloud' || Store.backend.assets) { rec.docFile = await Store.backend.putFile(new File([out], name, { type: DOCX_MIME }), name, DOCX_MIME); }
        await Store.save('tcontracts', rec, `${TC_SHORT[rec.kind]} ${rec.no} – ${rec.trainerName}`, ex ? 'Cập nhật' : 'Lập');
        if (old && old.id !== rec.docFile?.id) Store.backend.delFile(old);
        await Store.backend.download(name, out).catch((e2) => toast(e2.message, 'bad'));
      } else {
        await Store.save('tcontracts', rec, `${TC_SHORT[rec.kind]} ${rec.no} – ${rec.trainerName}`, ex ? 'Cập nhật' : 'Lập');
      }
      if (w.saveProfile) await saveProfileFromB(w.trainerId, w.partyB).catch(() => {});
      let nFees = 0;
      if (ex && ex.kind === 'pl') await unlinkPlFees({ ...ex, rows: (ex.rows || []).filter((r) => r.classId && !(rec.rows || []).some((r2) => r2.classId === r.classId)) });
      if (w.kind === 'pl' && w.updateFees) nFees = await applyPlToFees(rec);
      m.guard = null; m.close();
      toast(`Đã ${doExport ? 'xuất và lưu' : 'lưu'} ${TC_KIND[rec.kind].toLowerCase()} ${rec.no}${nFees ? ` · cập nhật thù lao ${nFees} lớp` : ''}.`, 'ok');
      tcDetail(rec.id, rec);
    } catch (e) {
      console.error(e); toast('Không lưu được hợp đồng: ' + (e.message || 'lỗi'), 'bad');
      $$('button', m.foot).forEach((x) => (x.disabled = false)); btn.innerHTML = label;
    }
  }
  render();
  return m;
}

/* ======================= CHI TIẾT HỢP ĐỒNG ======================= */
function tcDetail(id, fallback = null) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; let seen = false; render();
  function render() {
    let x = tcontract(id); if (x) seen = true; else if (!seen) x = fallback;
    if (!x) { m.close(); return; }
    const t = trainer(x.trainerId); const st = tcState(x); const ro = !S.role.canEdit;
    const nt = x.kind === 'pl' ? tcontract(x.parentId) : null;
    m.el.querySelector('.modal-h h2').textContent = `${TC_KIND[x.kind]} ${x.no || ''}`;
    const A = x.partyA || {};
    let html = `<div style="display:flex;gap:8px;flex-wrap:wrap;align-items:center">${pill(st.label, st.tone)}${t ? `<a href="#" class="btn sm ghost" data-act="trainer-view" data-id="${esc(t.id)}">${avatar(t, 'sm')} ${esc(t.name)}</a>` : `<b>${esc(x.trainerName || '')}</b>`}</div>
      <dl class="dl"><div><dt>Ngày ký</dt><dd>${x.signDate ? esc(fmtD(x.signDate)) : notSet()}</dd></div><div><dt>Nơi ký</dt><dd>${x.signPlace ? esc(x.signPlace) : notSet()}</dd></div>
      ${x.kind === 'nt' ? `<div><dt>Hiệu lực</dt><dd>${esc(fmtD(x.from))} – ${esc(fmtD(x.to))}</dd></div>` : `<div><dt>Thuộc HĐ nguyên tắc</dt><dd>${nt ? `<a href="#" data-act="tc-view" data-id="${esc(nt.id)}">${esc(nt.no)}</a>` : esc(x.parentNo || '—')} · phụ lục số ${esc(padNo(x.seq))}</dd></div>`}
      <div><dt>Thanh toán</dt><dd>${x.payDays ? `trong ${esc(x.payDays)} ngày làm việc` : notSet()}</dd></div><div><dt>Đại diện Bên A</dt><dd>${esc(A.rep || '—')}${A.repTitle ? ` – ${esc(A.repTitle)}` : ''}</dd></div>
      ${x.notes ? `<div class="full"><dt>Ghi chú</dt><dd style="white-space:pre-wrap">${esc(x.notes)}</dd></div>` : ''}</dl>`;
    if (x.kind === 'pl') {
      const mny = plMoney(x); const pay = plPayment(x);
      html += `<div><div class="sec-title">Kế hoạch giảng dạy &amp; thù lao</div><div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Khách hàng / địa điểm</th><th>Đối tượng / chuyên đề</th><th>Thời gian</th><th class="r">SL</th><th class="r">Đơn giá</th><th class="r">Thành tiền</th></tr></thead><tbody>
        ${(x.rows || []).map((r, i) => `<tr${r.classId && klass(r.classId) ? ` data-act="class-view" data-id="${esc(r.classId)}"` : ' style="cursor:default"'}><td>${i + 1}</td><td>${esc(r.customer)}<div class="muted small">${r.location ? esc(r.location) : 'Chưa ghi địa điểm'}</div></td><td>${esc(r.topic)}</td><td class="nowrap">${esc(r.time)}</td><td class="r">${esc(r.qty)} ${esc(r.unit || '')}</td>${moneyCell(r.price)}${moneyCell(r.amount)}</tr>`).join('')}
        </tbody><tfoot><tr><td colspan="6">Tổng giá trị phụ lục</td>${moneyCell(mny.total)}</tr></tfoot></table></div>
        <div class="money-box cols-5" style="margin-top:10px">${mbox('Hỗ trợ đi lại', money(mny.travel))}${mbox('Thuế TNCN', money(mny.pit), 'neg')}${mbox('Thực nhận', money(mny.net))}${mbox('Đã trả', money(pay.paid), 'pos', pay.linked ? `theo ${pay.linked} lớp` : 'chưa gắn lớp')}${mbox('Còn phải trả', money(Math.max(0, pay.remain)), pay.remain > 0 ? 'hl' : 'pos')}</div>
        <div class="small" style="margin-top:6px"><i>Bằng chữ: ${esc(vnMoneyWords(mny.total))}</i></div></div>`;
    } else {
      const pls = ntAppendices(x.id);
      html += `<div><div class="sec-title">Phụ lục của hợp đồng này</div>${pls.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Phụ lục</th><th>Ngày ký</th><th>Lớp</th><th class="r">Giá trị</th><th class="r">Thực nhận</th><th>Tình trạng</th></tr></thead><tbody>
        ${pls.map((p) => { const s2 = tcState(p); const mm = plMoney(p); return `<tr data-act="tc-view" data-id="${esc(p.id)}"><td><b>Số ${esc(padNo(p.seq))}</b> · ${esc(p.no)}</td><td class="num">${esc(fmtD(p.signDate))}</td><td class="small">${esc((p.rows || []).map((r) => r.customer).filter(Boolean).slice(0, 3).join('; '))}${(p.rows || []).length > 3 ? '…' : ''}</td>${moneyCell(mm.total)}${moneyCell(mm.net)}<td>${pill(s2.label, s2.tone)}</td></tr>`; }).join('')}
        </tbody><tfoot><tr><td colspan="3">${pls.length} phụ lục</td>${moneyCell(sum(pls.filter((p) => p.status !== 'cancelled'), (p) => plMoney(p).total))}${moneyCell(sum(pls.filter((p) => p.status !== 'cancelled'), (p) => plMoney(p).net))}<td></td></tr></tfoot></table></div>` : '<div class="muted small">Chưa có phụ lục nào.</div>'}</div>`;
    }
    html += `<div class="grid-2"><div><div class="sec-title">File hợp đồng (Word) do công cụ tạo</div>${x.docFile ? filesBlock([x.docFile]) : '<div class="muted small">Chưa xuất file – bấm “Xuất file Word”.</div>'}</div>
      <div><div class="sec-title">Bản đã ký (scan)</div>${filesBlock(x.files, 'Chưa tải bản đã ký lên')}</div></div>`;
    m.body.innerHTML = html;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(x)}<span class="sp"></span><button type="button" class="btn" data-x="docx">${ic('down')} Xuất file Word</button>${ro ? '' : `<span class="edit-only" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa</button>${x.status === 'cancelled' ? `<button type="button" class="btn" data-x="restore">Khôi phục</button>` : `<button type="button" class="btn" data-x="cancel">Hủy hợp đồng</button>`}${x.kind === 'nt' && x.status !== 'cancelled' ? `<button type="button" class="btn" data-x="pl">${ic('plus')} Tạo phụ lục</button>` : ''}<button type="button" class="btn" data-x="edit">${ic('edit')} Sửa</button>${x.status !== 'signed' && x.status !== 'cancelled' ? `<button type="button" class="btn primary" data-x="sign">${ic('sign')} Đã ký</button>` : `<button type="button" class="btn" data-x="sign">${ic('up')} Bản đã ký</button>`}</span>`}`;
    const on = (k, fn) => m.foot.querySelector(`[data-x=${k}]`)?.addEventListener('click', fn);
    on('docx', async (e) => { const b = e.currentTarget; b.disabled = true; try { const out = await buildTcDocx(x); await Store.backend.download(tcFileName(x), out); } catch (err) { toast(err.message, 'bad'); } b.disabled = false; });
    on('edit', () => { m.close(); tcWizard({ id: x.id }); });
    on('pl', () => { m.close(); tcWizard({ trainerId: x.trainerId, kind: 'pl', parentId: x.id }); });
    on('sign', () => tcSignModal(x.id));
    on('cancel', async () => { if (await confirmBox(`Hủy ${TC_KIND[x.kind].toLowerCase()} <b>${esc(x.no)}</b>? Số hợp đồng vẫn được giữ trong sổ theo dõi.`, { ok: 'Hủy hợp đồng', danger: true })) await Store.save('tcontracts', { ...x, status: 'cancelled' }, `${TC_SHORT[x.kind]} ${x.no}`, 'Hủy'); });
    on('restore', async () => { await Store.save('tcontracts', { ...x, status: x.files?.length ? 'signed' : 'draft' }, `${TC_SHORT[x.kind]} ${x.no}`, 'Khôi phục'); });
    on('del', async () => {
      if (x.kind === 'nt' && ntAppendices(x.id).length) { toast('Hợp đồng này đã có phụ lục – xóa các phụ lục trước, hoặc chọn “Hủy hợp đồng”.', 'bad'); return; }
      if (!(await confirmBox(`Xóa hẳn ${TC_KIND[x.kind].toLowerCase()} <b>${esc(x.no)}</b> và file đính kèm?${x.kind === 'pl' ? '<br>Số phụ lục sẽ được gỡ khỏi thù lao các lớp (giữ nguyên số tiền).' : ''}<br>Nếu chỉ không dùng nữa, nên chọn “Hủy hợp đồng” để giữ số trong sổ.`, { ok: 'Xóa', danger: true }))) return;
      try { if (x.kind === 'pl') await unlinkPlFees(x); await Store.remove('tcontracts', x, `${TC_SHORT[x.kind]} ${x.no} – ${x.trainerName || ''}`); [x.docFile, ...(x.files || [])].filter(Boolean).forEach((f2) => Store.backend.delFile(f2)); m.close(); toast('Đã xóa.', 'ok'); } catch (err) { /* đã báo */ }
    });
    hydrate(m.el); fillNames(m.el);
  }
}

function tcSignModal(id) {
  const x = tcontract(id); if (!x || !S.role.canEdit) return;
  const m = openModal({
    title: `Bản đã ký – ${esc(x.no)}`, sub: 'Đánh dấu đã ký và tải bản scan có chữ ký, dấu của hai bên', size: 'narrow',
    body: `<div class="fgrid">${f('sg-date', 'Ngày ký', inp('sg-date', x.signDate || todayISO(), 'type="date"'))}<div class="f full"><span class="lbl">Bản scan đã ký (PDF/ảnh)</span><div data-files></div></div></div>`,
    foot: `<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-ok>${ic('check')} Lưu – đã ký</button>`,
  });
  const files = mountFileField(m.el.querySelector('[data-files]'), x.files || [], { accept: '.pdf,image/*', hint: 'PDF hoặc ảnh chụp bản đã ký' });
  m.guard = formGuard(() => files.dirty(), [files]);
  m.el.querySelector('[data-cancel]').onclick = () => m.tryClose();
  m.el.querySelector('[data-ok]').onclick = async (e) => {
    e.currentTarget.disabled = true;
    try {
      await Store.save('tcontracts', { ...tcontract(id), status: 'signed', signDate: val(m.el, 'sg-date') || x.signDate, files: files.value() }, `${TC_SHORT[x.kind]} ${x.no} – ${x.trainerName || ''}`, 'Đã ký');
      files.commit(); m.guard = null; m.close(); toast('Đã cập nhật: hợp đồng đã ký.', 'ok');
    } catch (err) { e.currentTarget.disabled = false; }
  };
}

/* ======================= SỔ THEO DÕI HỢP ĐỒNG (Giảng viên → Hợp đồng) ======================= */
function tcRegisterHTML() {
  const t = todayISO(); const s = norm(S.ui.tcSearch || ''); const yr = S.ui.tcYear || 'all'; const kind = S.ui.tcKind || 'all'; const stF = S.ui.tcState || 'all';
  const inRegion = (x) => { const tr = trainer(x.trainerId); return !tr || S.ui.trRegion === 'all' || tr.region === S.ui.trRegion || (tr.otherRegions || []).includes(S.ui.trRegion); };
  const match = (x) => (yr === 'all' || String(tcYear(x)) === yr) && inRegion(x)
    && (!s || norm([x.no, x.trainerName, trainer(x.trainerId)?.name, ...(x.rows || []).map((r) => r.customer)].join(' ')).includes(s))
    && (stF === 'all' || tcState(x).key === stF || (stF === 'active' && tcState(x).key === 'expiring'));
  const all = S.tcontracts;
  const nts = all.filter((x) => x.kind === 'nt'); const pls = all.filter((x) => x.kind === 'pl');
  const activeTr = S.trainers.filter((x) => x.status !== 'paused');
  const withNt = activeTr.filter((x) => activeNt(x.id));
  const y = t.slice(0, 4); const plY = pls.filter((x) => String(tcYear(x)) === y && x.status !== 'cancelled');
  const expiring = nts.filter((x) => tcState(x).key === 'expiring');
  const drafts = all.filter((x) => tcState(x).key === 'draft');
  let html = `<div class="kpis">${kpi('HĐ nguyên tắc còn hiệu lực', `${withNt.length}<small>/${activeTr.length} GV</small>`, `${activeTr.length - withNt.length} giảng viên chưa có`, withNt.length < activeTr.length)}
    ${kpi('Sắp hết hạn (30 ngày)', expiring.length, expiring.length ? 'cần gia hạn / ký mới' : 'không có', expiring.length > 0, expiring.length ? 'warn' : '')}
    ${kpi('Chờ ký', drafts.length, drafts.length ? 'đã lập, chưa có bản ký' : 'không có')}
    ${kpi(`Phụ lục năm ${y}`, plY.length, `${moneyShort(sum(plY, (x) => plMoney(x).total))} · thực nhận ${moneyShort(sum(plY, (x) => plMoney(x).net))}`)}</div>`;
  const shownNt = kind === 'pl' ? [] : nts.filter((x) => match(x) || (kind === 'all' && ntAppendices(x.id).some(match)));
  const orphanPl = kind === 'nt' ? [] : pls.filter((x) => match(x) && (kind === 'pl' || !shownNt.some((n) => n.id === x.parentId)));
  if (!all.length) {
    html += `<div class="panel">${emptyBox('Chưa có hợp đồng giảng viên', 'Bấm “Tạo hợp đồng” để lập hợp đồng nguyên tắc thỉnh giảng theo mẫu DAKO, sau đó lập phụ lục cho từng đợt dạy.', `<button type="button" class="btn sm cta edit-only" data-act="tc-new">${ic('plus')} Tạo hợp đồng</button>`)}</div>`;
  } else if (!shownNt.length && !orphanPl.length) {
    html += `<div class="panel">${emptyBox('Không có hợp đồng phù hợp bộ lọc')}</div>`;
  } else {
    const rowHtml = (x, child) => {
      const st = tcState(x); const mm = x.kind === 'pl' ? plMoney(x) : null; const tr = trainer(x.trainerId);
      return `<tr class="${child ? 'child' : 'grp-nt'}${x.status === 'cancelled' ? ' cancel' : ''}" data-act="tc-view" data-id="${esc(x.id)}">
        <td class="nowrap">${child ? '<span class="tree">└</span>' : ''}<span class="strong">${esc(x.no || '—')}</span><div class="muted small">${x.kind === 'nt' ? 'HĐ nguyên tắc' : `Phụ lục số ${esc(padNo(x.seq))}`}</div></td>
        <td class="nowrap">${tr ? avatar(tr, 'sm') + ' ' : ''}${esc(tr?.name || x.trainerName || '')}</td><td class="num nowrap">${esc(fmtD(x.signDate))}</td>
        <td class="small">${x.kind === 'nt' ? `${esc(fmtD(x.from))} – ${esc(fmtD(x.to))}` : esc((x.rows || []).map((r) => `${r.customer}${r.time ? ' (' + r.time.replace(/^(Ngày|Từ) /, '') + ')' : ''}`).slice(0, 2).join('; ') + ((x.rows || []).length > 2 ? '…' : ''))}</td>
        ${mm ? moneyCell(mm.total) + moneyCell(mm.net) : '<td class="r muted">—</td><td class="r muted">—</td>'}
        <td>${pill(st.label, st.tone)}</td><td><div class="cell-files">${x.docFile ? fileButtons([x.docFile], 'Word') : ''}${(x.files || []).length || !x.docFile ? fileButtons(x.files, 'Bản ký') : ''}</div></td></tr>`;
    };
    html += `<div class="panel tbl-wrap"><table class="tbl tcreg"><thead><tr><th>Số hợp đồng</th><th>Giảng viên</th><th>Ngày ký</th><th>Hiệu lực / lớp dạy</th><th class="r">Giá trị</th><th class="r">Thực nhận</th><th>Tình trạng</th><th>File</th></tr></thead><tbody>`;
    const sortNt = (a, b) => tcYear(b) - tcYear(a) || tcSttOf(b) - tcSttOf(a) || (b.signDate || '').localeCompare(a.signDate || '');
    for (const n of shownNt.sort(sortNt)) {
      html += rowHtml(n, false);
      if (kind !== 'nt') for (const p of ntAppendices(n.id).filter(match)) html += rowHtml(p, true);
    }
    for (const p of orphanPl.sort(sortNt)) html += rowHtml(p, false);
    html += '</tbody></table></div>';
  }
  const noNt = activeTr.filter((x) => !usableNts(x.id).length && (S.ui.trRegion === 'all' || x.region === S.ui.trRegion || (x.otherRegions || []).includes(S.ui.trRegion)));
  if (noNt.length && all.length) html += `<div class="panel" style="margin-top:14px"><div class="panel-h"><h2>Giảng viên chưa có hợp đồng nguyên tắc còn hiệu lực</h2><span class="muted small">${noNt.length} người</span></div><div class="panel-b"><div class="chips">${noNt.sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((x) => `<button type="button" class="chip" data-act="tc-new" data-trainer="${esc(x.id)}" title="Tạo hợp đồng nguyên tắc">${ic('plus')} ${esc(x.name)}</button>`).join('')}</div></div></div>`;
  html += `<p class="small muted" style="margin-top:8px">Số hợp đồng tự đánh theo mẫu ở Cài đặt (${esc(tcFmt('nt'))} · ${esc(tcFmt('pl'))}); công cụ báo trùng số. Bấm một dòng để xem, xuất lại file Word, tải bản đã ký hoặc tạo phụ lục.</p>`;
  return html;
}

/* ---------- cảnh báo cho Tổng quan ---------- */
function contractAlerts() {
  const out = []; const t = todayISO();
  if (!S.tcontracts.length) return out;
  for (const x of S.tcontracts) {
    if (x.kind !== 'nt' || x.status === 'cancelled') continue;
    const st = tcState(x);
    const newer = trainerNts(x.trainerId).some((n) => n.id !== x.id && n.status !== 'cancelled' && (n.to || '') > (x.to || ''));
    if (st.key === 'expiring' && !newer) out.push({ sev: 'warn', text: `Hợp đồng nguyên tắc ${x.no} – ${x.trainerName || ''} hết hạn ngày ${fmtD(x.to)}: gia hạn bằng phụ lục hoặc ký hợp đồng mới`, act: 'tc-view', id: x.id });
    if (st.key === 'draft' && x.from && x.from <= t) out.push({ sev: 'info', text: `Hợp đồng nguyên tắc ${x.no} – ${x.trainerName || ''} đã đến ngày hiệu lực nhưng chưa có bản đã ký`, act: 'tc-view', id: x.id });
  }
  const users = new Set(S.tcontracts.map((x) => x.trainerId));
  const seen = new Set();
  for (const c of S.classes) {
    if (c.status === 'cancelled' || c.startDate < t || daysBetween(t, c.startDate) > 30) continue;
    for (const tid of c.trainerIds || []) {
      const tr = trainer(tid); if (!tr || seen.has(tid) || !users.size) continue;
      if (!activeNt(tid, c.startDate)) { seen.add(tid); out.push({ sev: 'warn', text: `Giảng viên ${tr.name} dạy lớp ${classLabel(c)} ngày ${fmtD(c.startDate)} nhưng chưa có hợp đồng nguyên tắc còn hiệu lực`, act: 'tc-new', id: tid }); }
    }
  }
  return out;
}
