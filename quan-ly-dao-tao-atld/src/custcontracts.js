/* ============================================================
   HỢP ĐỒNG HUẤN LUYỆN VỚI KHÁCH HÀNG – mẫu chuẩn DAKO (src/hdkh_tpl.js, tạo bởi tools/hdkh_template.py)
   • Bảng giá chi tiết / khung giá hợp đồng nguyên tắc (nhập trong Báo giá)
   • Điều khoản thanh toán (tự tính hạn) và phạt chậm thanh toán
   • Lập file Word hợp đồng từ báo giá – hợp đồng; tải mẫu trống để điền tay
   ============================================================ */

/* ---------- bảng giá chi tiết / khung giá ---------- */
function priceRowsEditor(container, rows, { onChange = () => {}, framework = () => false } = {}) {
  const list = (rows || []).map((r) => ({ id: r.id || uid('g'), name: r.name || '', unit: r.unit || 'lớp', min: r.min || '', max: r.max || '', qty: r.qty ?? '', price: Number(r.price) || 0 }));
  function render() {
    const fw = framework();
    container.innerHTML = `${list.length ? `<div class="tbl-wrap"><table class="tbl prows"><thead><tr><th>Nội dung / nhóm huấn luyện</th><th>Tính theo</th><th class="r" title="Áp dụng khi số học viên trong khoảng này (để trống nếu không giới hạn)">HV từ – đến</th>${fw ? '' : '<th class="r">Số lượng</th>'}<th class="r">Đơn giá (đ)</th>${fw ? '' : '<th class="r">Thành tiền (đ)</th>'}<th></th></tr></thead><tbody>
      ${list.map((r, i) => `<tr data-i="${i}" style="cursor:default"><td><input class="input" data-k="name" value="${esc(r.name)}" placeholder="VD: Nhóm 3 – An toàn hóa chất" aria-label="Nội dung"></td>
        <td><select class="input" data-k="unit" aria-label="Tính theo">${PRICE_UNITS.map((u) => opt(u, '/' + u, r.unit === u)).join('')}</select></td>
        <td class="r nowrap"><input class="input num" data-k="min" type="number" min="0" value="${esc(r.min)}" style="width:64px" aria-label="Từ số học viên"> – <input class="input num" data-k="max" type="number" min="0" value="${esc(r.max)}" style="width:64px" aria-label="Đến số học viên"></td>
        ${fw ? '' : `<td><input class="input num" data-k="qty" type="number" min="0" step="1" value="${esc(r.qty)}" style="width:80px" aria-label="Số lượng"></td>`}
        <td><input class="input num" data-k="price" data-money inputmode="numeric" value="${r.price ? money(r.price) : ''}" style="width:130px" aria-label="Đơn giá"></td>
        ${fw ? '' : `<td class="r strong" data-amt>${money(rowAmount(r))}</td>`}
        <td><button type="button" class="btn icon ghost" data-rm="${i}" aria-label="Xóa dòng">${ic('trash')}</button></td></tr>`).join('')}
      </tbody>${fw ? '' : `<tfoot><tr><td colspan="5">Tổng bảng giá</td><td class="r" data-total>${money(sum(list, rowAmount))}</td><td></td></tr></tfoot>`}</table></div>` : '<div class="muted small">Chưa có bảng giá chi tiết – hợp đồng in một dòng theo giá trị báo giá.</div>'}
      <div class="costadd" style="margin-top:6px"><button type="button" class="btn sm" data-add>${ic('plus')} Thêm dòng giá</button>${['Nhóm 1, 2', 'Nhóm 3', 'Nhóm 4', 'Nhóm 5', 'Nhóm 6'].map((g) => `<button type="button" class="chip" data-add="${g}">＋ ${g}</button>`).join('')}</div>`;
    bindMoney(container);
  }
  container.addEventListener('input', (e) => {
    const tr = e.target.closest('tr[data-i]'); const k = e.target.dataset.k; if (!tr || !k) return;
    const r = list[Number(tr.dataset.i)];
    if (k === 'price') r.price = parseMoney(e.target.value); else if (k === 'min' || k === 'max' || k === 'qty') r[k] = e.target.value === '' ? '' : Number(e.target.value); else r[k] = e.target.value;
    const a = tr.querySelector('[data-amt]'); if (a) a.textContent = money(rowAmount(r));
    const t = container.querySelector('[data-total]'); if (t) t.textContent = money(sum(list, rowAmount));
    onChange();
  });
  container.addEventListener('change', (e) => { const tr = e.target.closest('tr[data-i]'); if (tr && e.target.dataset.k === 'unit') { list[Number(tr.dataset.i)].unit = e.target.value; onChange(); } });
  container.addEventListener('click', (e) => {
    const rm = e.target.closest('[data-rm]'); const add = e.target.closest('[data-add]');
    if (rm) { list.splice(Number(rm.dataset.rm), 1); render(); onChange(); }
    if (add) { const g = add.dataset.add; list.push({ id: uid('g'), name: g ? `Huấn luyện ATVSLĐ ${g}` : '', unit: g === 'Nhóm 3' ? 'lớp' : 'người', min: '', max: '', qty: '', price: 0 }); render(); container.querySelector('tr[data-i]:last-child [data-k=name]')?.focus(); onChange(); }
  });
  render();
  return { value: () => list.filter((r) => r.name || r.price).map((r) => ({ ...r })), render, total: () => sum(list, rowAmount) };
}

/* ---------- điều khoản thanh toán & phạt chậm (dùng chung cho Báo giá và Lập hợp đồng) ---------- */
function payTermFields(p, q) {
  const t = q.payTerm || {};
  return `<div class="fgrid">
    ${f(`${p}-pbase`, 'Thời hạn thanh toán', `<select class="input" id="${p}-pbase">${opt('', '— Không ghi / nhập hạn tay —', !t.base)}${Object.entries(PAY_BASES).map(([k, v]) => opt(k, v[0].toUpperCase() + v.slice(1), t.base === k)).join('')}</select>`, { cls: 'span2' })}
    ${f(`${p}-pdays`, 'Trong vòng (ngày)', inp(`${p}-pdays`, t.days ?? '', 'type="number" min="0" placeholder="VD: 10"'))}
    <div class="f"><span class="lbl">Cách đếm</span><label class="inline-check" style="min-height:38px"><input type="checkbox" id="${p}-pwork"${t.workdays !== false ? ' checked' : ''}> Ngày làm việc (bỏ T7, CN)</label></div>
    ${f(`${p}-phand`, 'Bàn giao hồ sơ sau khóa học (ngày)', inp(`${p}-phand`, t.handover ?? 5, 'type="number" min="0"'), { hint: 'Dùng khi tính “sau khi bàn giao hồ sơ”' })}
    ${f(`${p}-pen`, 'Phạt chậm thanh toán (%/ngày)', inp(`${p}-pen`, q.penaltyRate ?? '', 'type="number" min="0" step="0.01" placeholder="VD: 0,05"'))}
    ${f(`${p}-penmax`, 'Phạt tối đa (% giá trị)', inp(`${p}-penmax`, q.penaltyMax ?? '', 'type="number" min="0" step="0.5" placeholder="VD: 8"'))}
  </div>`;
}
function readPayTerm(root, p) {
  const g = (id) => root.querySelector(`#${p}-${id}`);
  const base = g('pbase')?.value || '';
  const num = (el) => (el && el.value !== '' ? Number(String(el.value).replace(',', '.')) : null);
  return {
    payTerm: base ? { base, days: num(g('pdays')) ?? 0, workdays: !!g('pwork')?.checked, handover: num(g('phand')) ?? 5 } : null,
    penaltyRate: num(g('pen')), penaltyMax: num(g('penmax')),
  };
}
function penaltyText(q) {
  const r = Number(q.penaltyRate) || 0;
  if (!r) return 'Theo quy định của pháp luật hiện hành.';
  return `Nếu Bên A chậm thanh toán quá thời hạn trên, Bên A chịu phạt ${fmtPct(r)}% trên số tiền chậm trả cho mỗi ngày chậm${Number(q.penaltyMax) ? `, tổng mức phạt không vượt quá ${fmtPct(q.penaltyMax)}% giá trị hợp đồng` : ''}.`;
}

/* ---------- số hợp đồng khách hàng ---------- */
const khFmt = () => settings().custContractNoFormat || DEFAULT_SETTINGS.custContractNoFormat;
function khAbbr(name) {
  const w = shortName(name).replace(/\(.*?\)/g, ' ').replace(/[–-]/g, ' ').split(/\s+/).filter(Boolean);
  if (!w.length) return 'KH';
  const last = w[w.length - 1];
  if (/^[A-ZĐ&.]{2,}$/.test(last.normalize('NFC')) && !/^\d+$/.test(last)) return last.replace(/\./g, '').slice(0, 8);
  const words = /^\d+$/.test(last) ? w.slice(-3, -1) : w.slice(-2);
  return words.map((x) => x[0]).join('').toUpperCase() || 'KH';
}
function nextKhNo(dateIso, custName) {
  const y = Number((dateIso || todayISO()).slice(0, 4)); let max = 0;
  for (const q of S.quotes) for (const no of [q.contractNo, q.draftContractNo]) { const m = /^(\d{1,3})\/(\d{4})\//.exec(no || ''); if (m && Number(m[2]) === y) max = Math.max(max, Number(m[1])); }
  return fmtDocNo(khFmt(), { stt: max + 1, year: y }).replace(/\{kh\}/gi, khAbbr(custName));
}

/* ---------- giá trị điền vào mẫu ---------- */
function splitRep(contact) {
  const s = String(contact || '').trim(); if (!s) return { rep: '', title: '' };
  const m = s.split(/\s+[–-]\s+/);
  return { rep: m[0].trim(), title: (m[1] || '').trim() };
}
const stripSalutation = (s) => String(s || '').replace(/^(Ông\/Bà|Ông|Bà|Anh|Chị)\s+/i, '').trim();
function khRows(q, o) {
  const fw = isFramework(q);
  if ((q.priceRows || []).length) {
    return q.priceRows.map((r, i) => ({
      r_stt: String(i + 1), r_nd: r.name || '', r_tinh: `/${r.unit || 'lớp'}${r.min || r.max ? ` (${r.min || 1}–${r.max || '…'} HV)` : ''}`,
      r_sl: fw || !r.qty ? '' : String(r.qty), r_dg: r.price ? money(r.price) : '', r_tt: fw ? '' : money(rowAmount(r)),
    }));
  }
  const total = o.total; const n = Number(q.classCount) || 1;
  return [{ r_stt: '1', r_nd: `Huấn luyện ATVSLĐ ${groupsText(q.groups) || ''}${q.students ? ` – ${q.students} học viên` : ''}`.trim(), r_tinh: '/lớp', r_sl: String(n), r_dg: money(Number(q.unitPrice) || Math.round(total / n)), r_tt: money(total) }];
}
function khValues(q, o) {
  const co = companyInfo(); const cu = customer(q.customerId) || {};
  const fw = isFramework(q); const total = o.total;
  const qq = { ...q, payTerm: o.payTerm, penaltyRate: o.penaltyRate, penaltyMax: o.penaltyMax };
  const hand = Number(o.payTerm?.handover ?? 5);
  return {
    tieu_de: fw ? 'HỢP ĐỒNG NGUYÊN TẮC' : 'HỢP ĐỒNG', so_hd: o.no, d: ndDay(o.signDate), m: ndMonth(o.signDate), y: o.signDate?.slice(0, 4),
    a_ten_hoa: String(q.customerName || '').toLocaleUpperCase('vi'), a_dia_chi: cu.address, a_dt: cu.phone || q.contactPhone, a_mst: cu.taxCode, a_email: cu.email,
    a_dai_dien: o.rep, a_chuc_vu: o.repTitle, a_ky: stripSalutation(o.rep),
    b_ten_hoa: String(co.name || '').toLocaleUpperCase('vi'), b_dia_chi: co.address, b_dt: co.phone, b_mst: co.taxCode, b_stk: co.bankAccount, b_ngan_hang: co.bankName,
    b_dai_dien: [co.directorSalutation, String(co.director || '').toLocaleUpperCase('vi')].filter(Boolean).join(' '), b_chuc_vu: co.directorTitle, b_ky: co.director,
    nhom: (q.groups || []).length ? `${groupsText(q.groups)} theo Nghị định số 44/2016/NĐ-CP` : '', so_hv: q.students ? `${q.students} học viên (theo Phụ lục 01)` : fw ? 'Theo đăng ký thực tế từng đợt của Bên A' : '',
    thoi_gian: o.time, dia_diem: o.place, hinh_thuc: o.form,
    gia_tri_cau: fw ? 'Đơn giá huấn luyện theo bảng dưới đây; giá trị thanh toán từng đợt tính theo số học viên / số lớp thực tế Bên A đăng ký (hợp đồng không ấn định tổng giá trị):' : 'Giá trị hợp đồng như sau:',
    tong_nhan: fw ? 'GIÁ TRỊ HỢP ĐỒNG' : 'TỔNG GIÁ TRỊ HỢP ĐỒNG', tong: fw ? 'Theo thực tế' : total ? money(total) : '',
    bang_chu: fw ? 'Theo giá trị thực tế từng đợt huấn luyện' : total ? vnMoneyWords(total) + ' chẵn' : '',
    thoi_han_tt: payTermText(qq), phat: penaltyText(qq), ngay_ban_giao: `${padNo(hand)} (${vnNumberWords(hand)})`,
  };
}
/** Điền mẫu hợp đồng khách hàng. vals = null → bản trống để điền tay. */
async function buildKhDocx(vals, rows) {
  const JSZip = await lib('jszip');
  const zip = await JSZip.loadAsync(HDKH_TPL.b64, { base64: true });
  const doc = new DOMParser().parseFromString(await zip.file('word/document.xml').async('string'), 'application/xml');
  if (doc.getElementsByTagName('parsererror').length) throw new Error('Mẫu hợp đồng bị lỗi.');
  const tr = Array.from(doc.getElementsByTagNameNS(W_NS, 'tr')).find((n) => n.textContent.includes('{{r_stt}}'));
  if (tr) {
    for (const rv of rows && rows.length ? rows : [1, 2, 3].map((i) => ({ r_stt: String(i) }))) { const cl = tr.cloneNode(true); fillTokens(cl, (k) => rv[k], false); tr.parentNode.insertBefore(cl, tr); }
    tr.remove();
  }
  fillTokens(doc.documentElement, (k) => (vals ? vals[k] : undefined), true, HDKH_TPL.blanks);
  const xml = new XMLSerializer().serializeToString(doc).replace(/^<\?xml[^>]*\?>\s*/, '');
  zip.file('word/document.xml', '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\r\n' + xml);
  return zip.generateAsync({ type: 'blob', mimeType: DOCX_MIME, compression: 'DEFLATE', compressionOptions: { level: 6 } });
}
async function khSampleDownload() {
  try { await Store.backend.download('Mau_Hop_dong_huan_luyen_ATVSLD_DAKO.docx', await buildKhDocx(null, null)); } catch (e) { toast(e.message || 'Không tạo được file mẫu.', 'bad'); }
}
function khMissing(q, o) {
  const cu = customer(q.customerId) || {}; const co = companyInfo(); const out = [];
  if (!cu.address) out.push('địa chỉ khách hàng'); if (!cu.taxCode) out.push('MST khách hàng'); if (!(cu.phone || q.contactPhone)) out.push('điện thoại khách hàng');
  if (!o.rep) out.push('người đại diện bên khách'); if (!o.time) out.push('thời gian học'); if (!o.place) out.push('địa điểm học');
  if (!o.payTerm) out.push('thời hạn thanh toán'); if (!co.taxCode) out.push('MST DAKO (Cài đặt)');
  if (!isFramework(q) && !o.total) out.push('giá trị hợp đồng');
  return out;
}

/* ---------- lập file hợp đồng từ báo giá – hợp đồng ---------- */
function khContractModal(qid) {
  const q0 = quote(qid); if (!q0) return;
  const ro = !S.role.canEdit; const t0 = todayISO();
  const cls = quoteClasses(q0).filter((c) => c.status !== 'cancelled').sort(sortClasses);
  const { rep, title } = splitRep(q0.contact);
  const fw = isFramework(q0);
  const time0 = fw ? `Hợp đồng có hiệu lực 12 tháng kể từ ngày ký; lịch từng lớp theo đăng ký của Bên A.`
    : cls.length ? (() => { const a = cls[0].startDate; const b = cls.map((c) => c.endDate || c.startDate).sort().pop(); return a === b ? `Ngày ${fmtD(a)}` : `Từ ngày ${fmtD(a)} đến ngày ${fmtD(b)}`; })() : '';
  const o = {
    no: q0.contractNo || q0.draftContractNo || nextKhNo(q0.contractDate || t0, q0.customerName), signDate: q0.contractDate || t0, rep, repTitle: title,
    time: time0, place: cls.find((c) => c.location)?.location || '', form: 'Trực tiếp',
    payTerm: q0.payTerm || { base: 'handover', days: 10, workdays: true, handover: 5 }, penaltyRate: q0.penaltyRate ?? null, penaltyMax: q0.penaltyMax ?? null,
  };
  let blob = null;
  const m = openModal({
    title: `Lập hợp đồng – ${esc(q0.customerName)}`, sub: `Theo mẫu hợp đồng huấn luyện chuẩn DAKO${fw ? ' · hợp đồng nguyên tắc (khung giá)' : ''}`, size: 'wide',
    body: `<div class="stack">
      <fieldset class="sec"><legend>Thông tin hợp đồng</legend><div class="fgrid">
        <div class="f"><label for="kh-no">Số hợp đồng</label><input class="input" id="kh-no" value="${esc(o.no)}"><span class="hint" data-khnohint></span></div>
        ${f('kh-date', 'Ngày ký', inp('kh-date', o.signDate, 'type="date"'))}
        ${f('kh-rep', 'Đại diện bên khách', inp('kh-rep', o.rep, 'placeholder="VD: Ông Nguyễn Văn A"'))}
        ${f('kh-title', 'Chức vụ', inp('kh-title', o.repTitle, 'placeholder="VD: Giám đốc"'))}
        ${f('kh-time', 'Thời gian học', inp('kh-time', o.time, 'placeholder="VD: Từ ngày 17/11/2026 đến ngày 19/11/2026"'), { cls: 'span2' })}
        ${f('kh-form', 'Hình thức', inp('kh-form', o.form))}
        ${f('kh-place', 'Địa điểm học', inp('kh-place', o.place, 'placeholder="Địa chỉ nơi huấn luyện"'), { cls: 'full' })}
      </div></fieldset>
      <fieldset class="sec"><legend>Thanh toán</legend>${payTermFields('kh', { payTerm: o.payTerm, penaltyRate: o.penaltyRate, penaltyMax: o.penaltyMax })}</fieldset>
      <div><div class="sec-title">Giá trị (theo báo giá – sửa ở Báo giá → Sửa)</div><div data-khrows></div></div>
      <div data-khmiss></div>
      <div class="docprev" data-khprev hidden></div></div>`,
    foot: `<span class="sp"></span><button type="button" class="btn" data-x="prev">${ic('eye')} Xem trước</button><button type="button" class="btn primary" data-x="out">${ic('down')} ${ro ? 'Tải file hợp đồng' : 'Xuất & lưu vào hồ sơ'}</button>`,
  });
  const root = m.el;
  function readO() {
    const v = (id) => val(root, id);
    Object.assign(o, { no: v('kh-no'), signDate: v('kh-date'), rep: v('kh-rep'), repTitle: v('kh-title'), time: v('kh-time'), place: v('kh-place'), form: v('kh-form'), ...readPayTerm(root, 'kh') });
    const q = quote(qid) || q0;
    o.total = isFramework(q) ? 0 : contractValue(q) || quoteMoney(q).amount;
    return q;
  }
  function info() {
    const q = readO();
    const dup = S.quotes.find((x) => x.id !== q.id && x.contractNo && norm(x.contractNo) === norm(o.no));
    root.querySelector('[data-khnohint]').innerHTML = dup ? `<span class="bad-t">Số này đã dùng cho ${esc(dup.customerName)}</span>` : `Gợi ý số tiếp theo: ${esc(nextKhNo(o.signDate, q.customerName))}`;
    const rows = khRows(q, o);
    root.querySelector('[data-khrows]').innerHTML = `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Nội dung</th><th>Tính theo</th><th class="r">SL</th><th class="r">Đơn giá</th><th class="r">Thành tiền</th></tr></thead><tbody>${rows.map((r) => `<tr style="cursor:default"><td>${esc(r.r_stt)}</td><td>${esc(r.r_nd)}</td><td>${esc(r.r_tinh)}</td><td class="r">${esc(r.r_sl)}</td><td class="r">${esc(r.r_dg)}</td><td class="r">${esc(r.r_tt)}</td></tr>`).join('')}</tbody>
      <tfoot><tr><td colspan="5">${isFramework(q) ? 'Hợp đồng nguyên tắc – giá trị theo thực tế từng đợt' : 'Tổng giá trị hợp đồng'}</td><td class="r">${isFramework(q) ? '—' : money(o.total)}</td></tr></tfoot></table></div>`;
    const miss = khMissing(q, o);
    root.querySelector('[data-khmiss]').innerHTML = miss.length ? `<div class="banner warn" style="margin:0"><span class="grow"><b>Còn thiếu:</b> ${esc(miss.join(', '))} – file sẽ in dòng chấm để điền tay.</span></div>` : '<div class="banner info" style="margin:0"><span class="grow">Đủ thông tin theo mẫu.</span></div>';
    return q;
  }
  root.addEventListener('input', debounce(() => { info(); blob = null; }, 200));
  root.addEventListener('change', () => { info(); blob = null; });
  async function make() { const q = info(); blob = await buildKhDocx(khValues(q, o), khRows(q, o)); return { q, blob }; }
  root.querySelector('[data-x=prev]').onclick = async (e) => {
    const b = e.currentTarget; b.disabled = true;
    try { const prev = root.querySelector('[data-khprev]'); prev.hidden = false; const r = await make(); await renderDocx(r.blob, prev); prev.scrollIntoView({ block: 'start', behavior: 'smooth' }); } catch (err) { toast(err.message, 'bad'); }
    b.disabled = false;
  };
  root.querySelector('[data-x=out]').onclick = async (e) => {
    const b = e.currentTarget; b.disabled = true;
    try {
      const { q, blob: out } = await make();
      const name = `HD_${slugVi(String(o.no || 'chua-so').split('/').slice(0, 2).join('-'))}_${slugVi(shortName(q.customerName))}.docx`.replace(/_+/g, '_');
      if (!ro) {
        const dup = S.quotes.find((x) => x.id !== q.id && x.contractNo && norm(x.contractNo) === norm(o.no));
        if (dup && !(await confirmBox(`Số hợp đồng <b>${esc(o.no)}</b> đã dùng cho ${esc(dup.customerName)}. Vẫn xuất?`, { ok: 'Vẫn xuất' }))) { b.disabled = false; return; }
        const cur = quote(qid) || q; const signed = isContract(cur);
        const fname = signed ? name : 'Du-thao_' + name;
        let meta = null;
        if (Store.backend.kind !== 'cloud' || Store.backend.assets) meta = await Store.backend.putFile(new File([out], fname, { type: DOCX_MIME }), fname, DOCX_MIME);
        const rec = { ...cur, payTerm: o.payTerm, penaltyRate: o.penaltyRate, penaltyMax: o.penaltyMax };
        // đã ký: file vào hồ sơ hợp đồng; chưa ký: lưu là dự thảo trong file báo giá (không tự chuyển sang Hợp đồng)
        if (signed) Object.assign(rec, { contractNo: cur.contractNo || o.no, contractDate: cur.contractDate || o.signDate, contractFiles: [...(cur.contractFiles || []), ...(meta ? [meta] : [])] });
        else Object.assign(rec, { draftContractNo: o.no, quoteFiles: [...(cur.quoteFiles || []), ...(meta ? [meta] : [])] });
        await Store.save('quotes', rec, `Lập file hợp đồng ${o.no} – ${cur.customerName}`, 'Cập nhật');
      }
      await Store.backend.download(name, out);
      m.close(); toast(ro ? 'Đã tạo file hợp đồng.' : 'Đã xuất file hợp đồng và lưu vào hồ sơ.', 'ok');
    } catch (err) { console.error(err); toast('Không tạo được file: ' + (err.message || ''), 'bad'); b.disabled = false; }
  };
  info();
}
