/* ============================================================
   FORMS & DETAILS – biểu mẫu nhập liệu và màn hình chi tiết
   (ô trống đều có gợi ý – placeholder – để người dùng biết cần nhập gì)
   ============================================================ */

const opt = (v, label, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(label)}</option>`;
const val = (root, id) => (root.querySelector('#' + id)?.value ?? '').trim();
const checkedVals = (root, name) => $$(`input[name="${name}"]:checked`, root).map((i) => i.value);
const groupChecks = (name, sel) => `<div class="checks">${Object.entries(GROUPS).map(([g, v]) => `<label title="${esc(v.desc)}"><input type="checkbox" name="${name}" value="${g}"${(sel || []).map(Number).includes(Number(g)) ? ' checked' : ''}> Nhóm ${g}</label>`).join('')}</div>`;
const custList = (id) => `<datalist id="${id}">${S.customers.slice().sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((c) => `<option value="${esc(c.name)}"></option>`).join('')}</datalist>`;
const f = (id, label, input, { cls = '', hint = '', req = false } = {}) => `<div class="f ${cls}"><label for="${id}">${label}${req ? ' <span class="req">*</span>' : ''}</label>${input}${hint ? `<span class="hint" data-hint="${id}">${hint}</span>` : ''}</div>`;
const inp = (id, value, attrs = '') => `<input class="input" id="${id}" value="${esc(value ?? '')}" ${attrs}>`;
const moneyInp = (id, value, ph = 'Nhập số tiền (đ)') => `<input class="input num" id="${id}" data-money inputmode="numeric" placeholder="${esc(ph)}" value="${value || value === 0 ? money(value) : ''}">`;
const editorStamp = (r) => (r?.updatedAt ? `<span class="muted small">Cập nhật ${esc(fmtStamp(r.updatedAt))}${r.updatedBy ? `<span data-uid="${esc(r.updatedBy)}"></span>` : ''}${r.via === 'claude' ? ' · nhập qua Claude' : ''}</span>` : '');
const notSet = (hint = 'Chưa nhập – bấm Sửa để bổ sung') => `<span class="muted" title="${esc(hint)}">Chưa nhập</span>`;
const mbox = (k, v, cls = '', sub = '') => `<div class="m ${cls}"><div class="k">${k}</div><div class="v">${v}</div>${sub ? `<div class="k">${sub}</div>` : ''}</div>`;

async function ensureCustomer(name, extra = {}, overwrite = false) {
  name = String(name || '').trim(); if (!name) return null;
  const clean = Object.fromEntries(Object.entries(extra).filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== ''));
  const c = findCustomerByName(name);
  if (c) {
    const upd = { ...c }; let changed = false;
    for (const [k, v] of Object.entries(clean)) if (overwrite ? upd[k] !== v : !upd[k]) { upd[k] = v; changed = true; }
    if (changed) await Store.save('customers', upd);
    return upd;
  }
  return Store.save('customers', { id: uid('cu'), name, ...clean }, name, 'Thêm');
}

function formGuard(getDirty, fileFields) {
  return async () => {
    if (!getDirty()) { fileFields.forEach((x) => x.rollback()); return true; }
    const ok = await confirmBox('Các thay đổi chưa được lưu sẽ bị bỏ. Đóng biểu mẫu?', { ok: 'Bỏ thay đổi', danger: true });
    if (ok) fileFields.forEach((x) => x.rollback());
    return ok;
  };
}

/* ---------- bảng nhập "chi phí khác" (dùng cho lớp và hợp đồng) ---------- */
function costRowsEditor(container, rows, { presets = [], onChange = () => {}, readOnly = !S.role.canEdit } = {}) {
  const list = (rows || []).map((r) => ({ id: r.id || uid('cp'), name: r.name || '', amount: Number(r.amount) || 0, note: r.note || '' }));
  const dis = readOnly ? 'disabled' : '';
  function render() {
    container.innerHTML = `${list.length ? `<div class="costrows">${list.map((r, i) => `<div class="costrow" data-i="${i}">
        <input class="input" data-k="name" value="${esc(r.name)}" placeholder="Tên khoản chi – VD: đi lại, ăn ở, in thẻ…" ${dis} aria-label="Tên khoản chi">
        <input class="input num" data-k="amount" data-money inputmode="numeric" value="${r.amount ? money(r.amount) : ''}" placeholder="Số tiền (đ)" ${dis} aria-label="Số tiền">
        <input class="input" data-k="note" value="${esc(r.note)}" placeholder="Ghi chú (không bắt buộc)" ${dis} aria-label="Ghi chú">
        ${readOnly ? '' : `<button type="button" class="btn icon ghost" data-rm="${i}" aria-label="Xóa khoản chi">${ic('trash')}</button>`}</div>`).join('')}</div>` : '<div class="muted small" style="margin-bottom:6px">Chưa có khoản chi phí khác.</div>'}
      ${readOnly ? '' : `<div class="costadd"><button type="button" class="btn sm" data-add="">${ic('plus')} Thêm chi phí khác</button>${presets.map((p) => `<button type="button" class="chip" data-add="${esc(p)}">＋ ${esc(p)}</button>`).join('')}</div>`}`;
    bindMoney(container);
  }
  container.addEventListener('input', (e) => {
    const row = e.target.closest('.costrow'); const k = e.target.dataset.k; if (!row || !k) return;
    const r = list[Number(row.dataset.i)]; if (k === 'amount') r.amount = parseMoney(e.target.value); else r[k] = e.target.value;
    onChange();
  });
  container.addEventListener('click', (e) => {
    const a = e.target.closest('[data-add]'); const rm = e.target.closest('[data-rm]');
    if (a) { list.push({ id: uid('cp'), name: a.dataset.add, amount: 0, note: '' }); render(); const rowsEl = container.querySelectorAll('.costrow'); rowsEl[rowsEl.length - 1]?.querySelector(a.dataset.add ? '[data-k=amount]' : '[data-k=name]')?.focus(); onChange(); }
    if (rm) { list.splice(Number(rm.dataset.rm), 1); render(); onChange(); }
  });
  render();
  return { value: () => list.filter((r) => r.name.trim() || r.amount).map((r) => ({ id: r.id, name: r.name.trim() || 'Chi phí khác', amount: r.amount, note: r.note.trim() })), total: () => sum(list, (r) => r.amount) };
}

/* ---------- bảng nhập hoa hồng: tổng ↔ thực trả, thuế tự tính ---------- */
function commissionEditor(container, rows, { onChange = () => {}, readOnly = !S.role.canEdit } = {}) {
  const list = (rows || []).map((c) => ({ id: c.id || uid('hh'), type: c.type || 'agent', name: c.name || '', amount: Number(c.amount) || 0, taxRate: comTaxRate(c), paidDate: c.paidDate || '', note: c.note || '' }));
  const dis = readOnly ? 'disabled' : '';
  function rowHTML(c, i) {
    const l = commissionLine(c);
    return `<div class="comcard" data-i="${i}"><div class="comhead"><select class="input" data-k="type" ${dis} aria-label="Loại hoa hồng">${Object.entries(COMMISSION_TYPES).map(([k, v]) => opt(k, v, c.type === k)).join('')}</select>
        <input class="input" data-k="name" value="${esc(c.name)}" placeholder="Người nhận – tên đại lý / cán bộ quản lý phía khách hàng" ${dis} aria-label="Người nhận">
        ${readOnly ? '' : `<button type="button" class="btn icon ghost" data-rm="${i}" aria-label="Xóa khoản hoa hồng">${ic('trash')}</button>`}</div>
      <div class="comgrid">
        <label class="f"><span class="lbl">Hoa hồng (tổng, gồm thuế)</span><input class="input num" data-k="amount" data-money inputmode="numeric" value="${c.amount ? money(c.amount) : ''}" placeholder="VD: 30.000.000" ${dis}></label>
        <label class="f"><span class="lbl">Thuế khấu trừ (%)</span><input class="input num" data-k="taxRate" type="number" min="0" max="50" step="0.5" value="${esc(c.taxRate)}" ${dis}></label>
        <div class="f"><span class="lbl">Tiền thuế DAKO trừ</span><div class="input ro num" data-out="tax">${money(l.tax)}</div></div>
        <label class="f"><span class="lbl">Thực trả cho người nhận</span><input class="input num" data-k="net" data-money inputmode="numeric" value="${l.net ? money(l.net) : ''}" placeholder="Hoặc nhập số thực trả" ${dis}></label>
        <label class="f"><span class="lbl">Ngày đã chi</span><input class="input" data-k="paidDate" type="date" value="${esc(c.paidDate)}" ${dis}></label>
        <label class="f"><span class="lbl">Ghi chú</span><input class="input" data-k="note" value="${esc(c.note)}" placeholder="Số chứng từ, hình thức chi…" ${dis}></label>
      </div></div>`;
  }
  function render() {
    container.innerHTML = `${list.length ? list.map(rowHTML).join('') : '<div class="muted small" style="margin-bottom:6px">Chưa có khoản hoa hồng.</div>'}
      ${readOnly ? '' : `<div class="costadd"><button type="button" class="btn sm" data-add="agent">${ic('plus')} Hoa hồng đại lý</button><button type="button" class="btn sm" data-add="manager">${ic('plus')} Hoa hồng cán bộ quản lý KH</button><button type="button" class="btn sm ghost" data-add="other">${ic('plus')} Hoa hồng khác</button></div>`}`;
    bindMoney(container);
  }
  container.addEventListener('input', (e) => {
    const card = e.target.closest('.comcard'); const k = e.target.dataset.k; if (!card || !k) return;
    const c = list[Number(card.dataset.i)];
    if (k === 'amount') c.amount = parseMoney(e.target.value);
    else if (k === 'net') c.amount = commissionGrossFromNet(parseMoney(e.target.value), c.taxRate);
    else if (k === 'taxRate') c.taxRate = e.target.value === '' ? 0 : Number(e.target.value);
    else c[k] = e.target.value;
    const l = commissionLine(c);
    card.querySelector('[data-out=tax]').textContent = money(l.tax);
    if (k !== 'net') { const n = card.querySelector('[data-k=net]'); n.value = l.net ? money(l.net) : ''; }
    if (k === 'net') { const g = card.querySelector('[data-k=amount]'); g.value = c.amount ? money(c.amount) : ''; }
    onChange();
  });
  container.addEventListener('change', (e) => { const card = e.target.closest('.comcard'); if (card && e.target.dataset.k === 'type') { list[Number(card.dataset.i)].type = e.target.value; onChange(); } });
  container.addEventListener('click', (e) => {
    const a = e.target.closest('[data-add]'); const rm = e.target.closest('[data-rm]');
    if (a) { list.push({ id: uid('hh'), type: a.dataset.add, name: '', amount: 0, taxRate: Number(settings().commissionTax ?? 20), paidDate: '', note: '' }); render(); container.querySelectorAll('.comcard [data-k=amount]')[list.length - 1]?.focus(); onChange(); }
    if (rm) { list.splice(Number(rm.dataset.rm), 1); render(); onChange(); }
  });
  render();
  return { value: () => list.filter((c) => c.amount > 0 || c.name.trim()).map((c) => ({ id: c.id, type: c.type, name: c.name.trim(), amount: c.amount, taxRate: c.taxRate, paidDate: c.paidDate, note: c.note.trim() })) };
}

/* ======================= LỚP HỌC ======================= */
const COST_PRESETS = ['Đi lại – lưu trú', 'Ăn uống', 'Tài liệu – in thẻ/GCN', 'Thuê hội trường – thiết bị'];
function classForm(existing, preset = {}) {
  if (!S.role.canEdit) return;
  const st = settings();
  const d0 = preset.date || S.ui.selDate || todayISO();
  const tr0 = preset.trainerId ? trainer(preset.trainerId) : null;
  const c = existing ? clone(existing) : {
    status: 'confirmed', kind: KINDS[0], groups: [], trainerIds: tr0 ? [tr0.id] : [],
    startDate: d0, endDate: d0, startTime: st.dayStart, endTime: st.dayEnd,
    region: preset.region || tr0?.region || (S.ui.region !== 'all' ? S.ui.region : regionList()[0]?.id),
    students: '', priceMode: 'auto', price: 0, otherCosts: [], customerName: '', quoteId: null, files: [], ...(preset.from || {}),
  };
  if (!existing && preset.from && preset.from.id) { delete c.id; delete c.createdAt; delete c.updatedAt; c.files = []; c.status = 'planned'; c.certIssued = false; c.invoiced = false; c.passed = ''; c.fees = (classFees(preset.from) || []).map((x) => ({ trainerId: x.trainerId, amount: x.amount, auto: x.auto, payments: [] })); }
  // thù lao từng giảng viên của lớp: tid → { amount, auto, ...entry cũ (HĐ, thanh toán) }
  const feeMap = new Map();
  for (const x of classFees(c)) feeMap.set(x.trainerId, { ...x, auto: x.auto ?? (Array.isArray(c.fees) ? false : c.costTrainerMode !== 'manual') });
  const keptFees = Array.isArray(c.fees) ? c.fees.filter((x) => !(c.trainerIds || []).includes(x.trainerId) && (x.payments || []).length) : [];
  const title = existing ? 'Sửa lớp huấn luyện' : preset.from && preset.from.id ? 'Nhân bản lớp huấn luyện' : 'Lên lịch lớp huấn luyện';
  const m = openModal({
    title, sub: existing ? esc(classLabel(c)) : 'Các mục có dấu * là bắt buộc · ô trống có gợi ý cách nhập', size: 'wide',
    body: `<form id="cf" novalidate autocomplete="off">
      <fieldset class="sec"><legend>Khách hàng &amp; nội dung</legend><div class="fgrid">
        ${f('cf-customer', 'Khách hàng (tên công ty)', inp('cf-customer', c.customerName, 'list="cf-customers" required placeholder="Gõ để chọn công ty đã có hoặc nhập mới"') + custList('cf-customers'), { cls: 'span2', req: true, hint: ' ' })}
        ${f('cf-contact', 'Người liên hệ', inp('cf-contact', c.contact, 'placeholder="Họ tên, chức vụ người liên hệ"'))}
        ${f('cf-cphone', 'SĐT liên hệ', inp('cf-cphone', c.contactPhone, 'inputmode="tel" placeholder="Số điện thoại"'))}
        ${f('cf-title', 'Tên lớp / nội dung', inp('cf-title', c.title, 'placeholder="VD: Huấn luyện ATVSLĐ định kỳ năm 2026"'), { cls: 'span2' })}
        ${f('cf-kind', 'Hình thức', `<select class="input" id="cf-kind">${KINDS.map((k) => opt(k, k, c.kind === k)).join('')}</select>`)}
        <div class="f full"><span class="lbl">Nhóm huấn luyện</span>${groupChecks('cf-group', c.groups)}<span class="hint" data-hours></span></div>
      </div></fieldset>
      <fieldset class="sec"><legend>Thời gian &amp; địa điểm</legend><div class="fgrid">
        ${f('cf-from', 'Từ ngày', inp('cf-from', c.startDate, 'type="date" required'), { req: true })}
        ${f('cf-to', 'Đến ngày', inp('cf-to', c.endDate || c.startDate, 'type="date" required'), { req: true, hint: ' ' })}
        ${f('cf-st', 'Giờ bắt đầu', inp('cf-st', c.startTime, 'type="time"'))}
        ${f('cf-et', 'Giờ kết thúc', inp('cf-et', c.endTime, 'type="time"'))}
        <div class="f full"><span class="lbl">Vùng đào tạo <span class="req">*</span></span><div class="checks" role="radiogroup" aria-label="Vùng đào tạo">${regionList().map((r) => `<label><input type="radio" name="cf-region" value="${esc(r.id)}"${c.region === r.id ? ' checked' : ''}><span class="sw" style="width:10px;height:10px;border-radius:3px;background:${regionColor(r.id)}"></span>${esc(r.name)} <span class="muted small">· ${esc(r.center)}</span></label>`).join('')}</div></div>
        ${f('cf-location', 'Địa điểm học', inp('cf-location', c.location, 'placeholder="Địa chỉ, tên nhà xưởng / hội trường…"'), { cls: 'full' })}
      </div></fieldset>
      <fieldset class="sec"><legend>Giảng viên &amp; thù lao</legend>
        <div class="toolbar" style="margin:0 0 8px"><span class="small muted grow" data-trhint></span><label class="inline-check small"><input type="checkbox" id="cf-allreg"> Hiện cả giảng viên vùng khác</label></div>
        <div class="picker" data-picker></div><div data-conflict style="margin-top:8px"></div>
        <div class="sub-title">Thù lao giảng viên lớp này (hợp đồng thuê giảng viên)</div><div data-fees></div>
      </fieldset>
      <fieldset class="sec"><legend>Doanh thu – chi phí – lợi nhuận</legend><div class="fgrid">
        ${f('cf-students', 'Số học viên', inp('cf-students', c.students, 'type="number" min="1" inputmode="numeric" required placeholder="Số người học"'), { req: true })}
        ${f('cf-price', 'Doanh thu lớp (đ)', moneyInp('cf-price', c.price, 'Tự tính theo bảng giá'), { cls: 'span2', hint: ' ' })}
      </div>
        <div class="sub-title">Chi phí khác của lớp</div><div data-costs></div>
        <div class="sub-title">Hoa hồng</div><div class="small" data-com></div>
        <div class="money-box" data-moneybox style="margin-top:12px"></div></fieldset>
      <fieldset class="sec"><legend>Hồ sơ &amp; tình trạng</legend><div class="fgrid">
        ${f('cf-status', 'Trạng thái lớp', `<select class="input" id="cf-status">${Object.entries(CLASS_STATUS).map(([k, v]) => opt(k, v.label, c.status === k)).join('')}</select>`)}
        ${f('cf-quote', 'Báo giá / hợp đồng liên quan', '<select class="input" id="cf-quote"></select>', { cls: 'span2', hint: ' ' })}
        ${f('cf-passed', 'Số học viên đạt', inp('cf-passed', c.passed, 'type="number" min="0" placeholder="Nhập sau khi kết thúc lớp"'))}
        <div class="f full"><div class="checks"><label><input type="checkbox" id="cf-cert"${c.certIssued ? ' checked' : ''}> Đã cấp GCN / thẻ / ghi sổ theo dõi</label><label><input type="checkbox" id="cf-inv"${c.invoiced ? ' checked' : ''}> Đã xuất hóa đơn</label></div></div>
        ${f('cf-notes', 'Ghi chú', `<textarea class="input" id="cf-notes" rows="2" placeholder="Yêu cầu riêng của khách, lưu ý cho giảng viên…">${esc(c.notes || '')}</textarea>`, { cls: 'full' })}
        <div class="f full"><span class="lbl">Hồ sơ lớp – danh sách học viên, ảnh lớp học, biên bản…</span><div data-files></div></div>
      </div></fieldset></form>`,
    foot: `${existing ? `<button type="button" class="btn danger" data-del>${ic('trash')} Xóa lớp</button>` : ''}<span class="sp"></span>
      <label class="inline-check small hide" data-override><input type="checkbox" id="cf-override"> Vẫn lưu dù trùng lịch</label>
      <button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu lớp</button>`,
  });
  const root = m.el; const form = root.querySelector('#cf');
  const files = mountFileField(root.querySelector('[data-files]'), c.files);
  bindMoney(root);
  let priceMode = c.priceMode || 'manual';
  const costs = costRowsEditor(root.querySelector('[data-costs]'), classOtherCosts(c), { presets: COST_PRESETS, onChange: () => refresh('costs') });
  let selected = new Set(c.trainerIds || []);

  function read() {
    return {
      customerName: val(root, 'cf-customer'), contact: val(root, 'cf-contact'), contactPhone: val(root, 'cf-cphone'), title: val(root, 'cf-title'), kind: val(root, 'cf-kind'),
      groups: checkedVals(root, 'cf-group').map(Number), startDate: val(root, 'cf-from'), endDate: val(root, 'cf-to') || val(root, 'cf-from'),
      startTime: val(root, 'cf-st'), endTime: val(root, 'cf-et'), region: root.querySelector('input[name="cf-region"]:checked')?.value || '', location: val(root, 'cf-location'),
      trainerIds: [...selected], students: Number(val(root, 'cf-students')) || 0, price: parseMoney(val(root, 'cf-price')), priceMode,
      status: val(root, 'cf-status'), quoteId: val(root, 'cf-quote') || null,
      passed: val(root, 'cf-passed') === '' ? '' : Number(val(root, 'cf-passed')), certIssued: root.querySelector('#cf-cert').checked, invoiced: root.querySelector('#cf-inv').checked, notes: val(root, 'cf-notes'),
      fees: [...[...selected].map((tid) => { const x = feeMap.get(tid) || { trainerId: tid, amount: 0, auto: true, payments: [] }; return { ...x, trainerId: tid, removed: undefined }; }), ...keptFees],
      otherCosts: costs.value(),
    };
  }
  function renderPicker(d) {
    const all = root.querySelector('#cf-allreg').checked;
    let list = all ? trainersInRegion('all') : trainersInRegion(d.region);
    for (const id of selected) if (!list.some((x) => x.id === id) && trainer(id)) list = [trainer(id), ...list];
    const range = { startDate: d.startDate, endDate: d.endDate, startTime: d.startTime, endTime: d.endTime };
    root.querySelector('[data-trhint]').textContent = d.region ? `${list.length} giảng viên${all ? ' (mọi vùng)' : ' thuộc ' + regionName(d.region)} · trạng thái theo ngày ${fmtDateRange(d.startDate, d.endDate)}` : 'Chọn vùng đào tạo để xem giảng viên của vùng';
    root.querySelector('[data-picker]').innerHTML = list.length ? list.map((x) => {
      const busy = d.startDate ? busyClasses(x.id, range, existing?.id) : [];
      const specs = (x.specialties || []).slice(0, 3).join(', ');
      const okGroup = !d.groups.length || !(x.groups || []).length || d.groups.every((g) => (x.groups || []).includes(g));
      return `<label class="${busy.length ? 'busy' : ''}"><input type="checkbox" name="cf-tr" value="${esc(x.id)}"${selected.has(x.id) ? ' checked' : ''}>${avatar(x)}<span class="info"><span class="n">${esc(x.name)}</span> <span class="muted small">${esc(x.phone || '')}</span>
        <span class="s" style="display:block">${busy.length ? `<b style="color:var(--bad)">Đã có lịch:</b> ${esc(busy.map((b) => `${classLabel(b)} ${fmtDateRange(b.startDate, b.endDate)} ${b.startTime || ''}–${b.endTime || ''}`).join('; '))}` : '<b style="color:var(--ok)">Rảnh</b>'}${x.region !== d.region ? ' · vùng ' + esc(regionName(x.region)) : ''}</span>
        <span class="s muted" style="display:block">${esc(specs)}${!okGroup ? ' · <span style="color:var(--warn)">chưa đăng ký dạy ' + esc(groupsText(d.groups.filter((g) => !(x.groups || []).includes(g)))) + '</span>' : ''}${x.dailyRate ? ' · ' + esc(moneyShort(x.dailyRate)) + '/ngày' : ' · chưa có thù lao/ngày'}</span></span></label>`;
    }).join('') : `<div class="empty">${d.region ? 'Vùng này chưa có giảng viên đang hoạt động. Tick “Hiện cả giảng viên vùng khác” hoặc thêm giảng viên.' : 'Chọn vùng đào tạo.'}</div>`;
    hydrate(root.querySelector('[data-picker]'));
  }
  function renderFees(d) {
    const days = classDays(d);
    for (const tid of selected) {
      if (!feeMap.has(tid)) feeMap.set(tid, { trainerId: tid, amount: feeAuto(tid, d), auto: true, payments: [] });
      const fe = feeMap.get(tid); if (fe.auto) fe.amount = feeAuto(tid, d);
    }
    const box = root.querySelector('[data-fees]');
    if (!selected.size) { box.innerHTML = '<div class="muted small">Chọn giảng viên ở danh sách trên – thù lao từng người sẽ hiện ở đây.</div>'; return; }
    const focused = document.activeElement?.dataset?.fee;
    box.innerHTML = `<div class="feerows">${[...selected].map((tid) => {
      const x = trainer(tid); const fe = feeMap.get(tid); const auto = feeAuto(tid, d); const paid = feePaid(fe);
      return `<div class="feerow"><span class="grow"><b>${esc(x?.name || 'Giảng viên')}</b><span class="muted small"> · ${x?.dailyRate ? `${esc(money(x.dailyRate))} đ/ngày × ${days} ngày = ${esc(money(auto))} đ` : 'chưa nhập thù lao/ngày – nhập số tiền thỏa thuận'}</span>${paid ? `<span class="small" style="color:var(--ok)"> · đã trả ${esc(money(paid))} đ</span>` : ''}</span>
        <input class="input num" data-fee="${esc(tid)}" data-money inputmode="numeric" value="${fe.amount ? money(fe.amount) : ''}" placeholder="Thù lao lớp này (đ)" aria-label="Thù lao ${esc(x?.name || '')}">
        ${!fe.auto && auto ? `<button type="button" class="btn xs" data-act-local="fee-auto" data-tid="${esc(tid)}">Theo thù lao/ngày</button>` : ''}</div>`;
    }).join('')}</div><div class="hint small muted" style="margin-top:4px">Số HĐ thuê giảng viên, file hợp đồng và các lần tạm ứng/thanh toán nhập ở màn hình chi tiết lớp (nút “Thù lao &amp; trả tiền”).</div>`;
    bindMoney(box);
    if (focused) { const el = box.querySelector(`[data-fee="${focused}"]`); if (el) { el.focus(); el.setSelectionRange(el.value.length, el.value.length); } }
  }
  function renderQuotes(d) {
    const sel = root.querySelector('#cf-quote'); const cur = sel.value || c.quoteId || '';
    const qs = S.quotes.filter((q) => norm(q.customerName) === norm(d.customerName) || q.id === cur);
    sel.innerHTML = opt('', qs.length ? '— Chưa gắn báo giá —' : d.customerName ? '— Khách này chưa có báo giá —' : '— Nhập khách hàng trước —', !cur) + qs.map((q) => opt(q.id, `${q.no || 'BG'} · ${fmtD(q.date)} · ${QUOTE_STATUS[q.status]?.label || ''}${q.contractNo ? ' · HĐ ' + q.contractNo : ''}`, q.id === cur)).join('');
    const q = sel.value && quote(sel.value);
    root.querySelector('[data-hint="cf-quote"]').innerHTML = q ? `${fileButtons(q.quoteFiles, 'Xem báo giá')} ${fileButtons(q.contractFiles, 'Xem hợp đồng')}${isContract(q) ? '' : ' <span class="muted">· báo giá chưa ký – chưa tính hoa hồng/doanh thu HĐ</span>'}` : 'Gắn để xem nhanh báo giá, hợp đồng và phân bổ hoa hồng của hợp đồng.';
  }
  function refresh(src) {
    const d = read();
    const cu = findCustomerByName(d.customerName);
    root.querySelector('[data-hint="cf-customer"]').textContent = !d.customerName ? '' : cu ? `Khách hàng đã có · ${customerStats(cu.id).classes} lớp trước đây` : 'Khách hàng mới – sẽ được thêm vào danh sách khách hàng';
    if (src === 'cf-customer' && cu) {
      if (!val(root, 'cf-contact') && cu.contact) root.querySelector('#cf-contact').value = cu.contact;
      if (!val(root, 'cf-cphone') && cu.phone) root.querySelector('#cf-cphone').value = cu.phone;
      if (cu.region && !existing && !root.querySelector('input[name="cf-region"]:checked')) { const r = root.querySelector(`input[name="cf-region"][value="${cu.region}"]`); if (r) r.checked = true; }
    }
    const sg = suggestedDays(d.groups, d.kind);
    root.querySelector('[data-hours]').innerHTML = d.groups.length ? `${d.groups.map((g) => `Nhóm ${g}: ${GROUPS[g].desc.toLowerCase()} – cấp ${GROUPS[g].paper}`).join(' · ')}<br>Thời lượng tối thiểu gợi ý: <b>${sg.hrs} giờ ≈ ${sg.days} ngày</b>${d.kind === 'Huấn luyện định kỳ' ? ' (định kỳ ≈ 50% lần đầu)' : ''}${sg.days && d.startDate ? ` <button type="button" class="btn xs" data-act-local="apply-days" data-days="${sg.days}">Đặt ngày kết thúc ${fmtD(addDays(d.startDate, sg.days - 1))}</button>` : ''}` : 'Chọn nhóm để gợi ý thời lượng (số giờ theo Cài đặt).';
    if (src === 'cf-from' && d.endDate < d.startDate) root.querySelector('#cf-to').value = d.startDate;
    const d2 = read();
    root.querySelector('[data-hint="cf-to"]').textContent = d2.endDate < d2.startDate ? 'Ngày kết thúc trước ngày bắt đầu' : `${classDays(d2)} ngày học`;
    if (src !== 'fee' && src !== 'costs') renderPicker(d2);
    if (src !== 'fee') renderFees(d2);
    const tmp = { ...read(), id: existing?.id || '__new' };
    const cx = conflictsFor(tmp);
    root.querySelector('[data-conflict]').innerHTML = cx.length ? `<div class="banner warn" style="margin:0"><b>Trùng lịch:</b>&nbsp;${esc(cx.map((x) => `${trainerNames(x.trainers)} đang dạy ${classLabel(x.cls)} (${fmtDateRange(x.cls.startDate, x.cls.endDate)} ${x.cls.startTime || ''}–${x.cls.endTime || ''})`).join('; '))}</div>` : '';
    root.querySelector('[data-override]').classList.toggle('hide', !cx.length);
    const tier = tierFor(d2.students);
    if (priceMode === 'auto' && src !== 'cf-price') { const p = tier ? tier.price : 0; root.querySelector('#cf-price').value = p ? money(p) : ''; }
    const pNow = parseMoney(val(root, 'cf-price'));
    root.querySelector('[data-hint="cf-price"]').innerHTML = `${esc(tierText(d2.students))}${tier && pNow !== tier.price ? ` · <b style="color:var(--accent)">Giá điều chỉnh</b> <button type="button" class="btn xs" data-act-local="price-auto">Dùng giá bảng</button>` : ''}`;
    if (src === 'cf-customer' || src === 'init' || src === 'cf-quote') renderQuotes(d2);
    const draft = { ...read(), id: existing?.id || '__new' };
    const P = classPnl(draft, draft);
    root.querySelector('[data-com]').innerHTML = P.contract ? `Phân bổ <b>${pct(P.share)}</b> hoa hồng của hợp đồng ${esc(P.contract.contractNo || P.contract.no || '')}: tổng <b>${esc(money(P.com.gross))} đ</b> (thực trả ${esc(money(P.com.net))} đ, thuế ${esc(money(P.com.tax))} đ)${P.otherAlloc ? ` · chi phí khác của HĐ phân bổ ${esc(money(P.otherAlloc))} đ` : ''}. <button type="button" class="btn xs" data-act="pnl-view" data-id="${esc(P.contract.id)}">Sửa hoa hồng tại hợp đồng</button>`
      : '<span class="muted">Lớp chưa gắn hợp đồng đã ký nên chưa có hoa hồng. Hoa hồng đại lý / cán bộ quản lý khách hàng nhập theo hợp đồng ở tab Doanh thu – Lợi nhuận.</span>';
    root.querySelector('[data-moneybox]').innerHTML = mbox('Doanh thu lớp', money(P.rev)) + mbox('Thù lao giảng viên', money(P.gv)) + mbox('Hoa hồng (gồm thuế)', money(P.com.gross)) + mbox('Chi phí khác', money(P.other)) + mbox(`Lợi nhuận${P.rev ? ` (${pct(P.margin)})` : ''}`, money(P.profit), P.profit < 0 ? 'neg' : 'pos');
    if (src === 'cf-quote') {
      const q = quote(val(root, 'cf-quote'));
      if (q && !d2.groups.length && (q.groups || []).length) { q.groups.forEach((g) => { const cb = root.querySelector(`input[name="cf-group"][value="${g}"]`); if (cb) cb.checked = true; }); refresh('groups'); }
    }
  }
  form.addEventListener('input', (e) => {
    const id = e.target.id || e.target.name;
    if (e.target.dataset.fee) { const fe = feeMap.get(e.target.dataset.fee); fe.amount = parseMoney(e.target.value); fe.auto = false; refresh('fee'); return; }
    if (e.target.closest('[data-costs]')) return;
    if (id === 'cf-price') priceMode = 'manual';
    if (['cf-notes', 'cf-title', 'cf-location', 'cf-contact', 'cf-cphone', 'cf-passed'].includes(id)) return;
    if (e.target.name === 'cf-tr') return;
    refresh(id);
  });
  form.addEventListener('change', (e) => {
    if (e.target.name === 'cf-tr') { if (e.target.checked) selected.add(e.target.value); else selected.delete(e.target.value); refresh('picker'); return; }
    if (e.target.type === 'radio' || e.target.type === 'checkbox' || e.target.tagName === 'SELECT') refresh(e.target.id || e.target.name);
  });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act-local]'); if (!b) return;
    if (b.dataset.actLocal === 'apply-days') { root.querySelector('#cf-to').value = addDays(val(root, 'cf-from'), Number(b.dataset.days) - 1); refresh('cf-to'); }
    if (b.dataset.actLocal === 'price-auto') { priceMode = 'auto'; refresh('price-auto'); }
    if (b.dataset.actLocal === 'fee-auto') { const fe = feeMap.get(b.dataset.tid); fe.auto = true; refresh('fee-auto'); }
  });
  refresh('init');
  const snap = JSON.stringify(read());
  m.guard = formGuard(() => JSON.stringify(read()) !== snap || files.dirty(), [files]);
  root.querySelector('[data-cancel]').onclick = () => m.tryClose();
  root.querySelector('[data-del]')?.addEventListener('click', async () => { if (await deleteClass(existing)) { m.guard = null; m.close(); } });
  root.querySelector('[data-save]').onclick = async (ev) => {
    const d = read(); const err = [];
    if (!d.customerName) err.push('tên khách hàng');
    if (!d.startDate) err.push('ngày bắt đầu');
    if (d.endDate < d.startDate) err.push('ngày kết thúc phải sau ngày bắt đầu');
    if (!d.region) err.push('vùng đào tạo');
    if (!(d.students > 0)) err.push('số học viên');
    if (err.length) { toast('Cần nhập: ' + err.join(', '), 'bad'); return; }
    const cx = conflictsFor({ ...d, id: existing?.id || '__new' });
    if (cx.length && !root.querySelector('#cf-override').checked) { toast('Giảng viên bị trùng lịch – đổi giảng viên/ngày, hoặc tick “Vẫn lưu dù trùng lịch”.', 'bad'); root.querySelector('[data-conflict]').scrollIntoView({ block: 'center' }); return; }
    ev.target.disabled = true;
    try {
      const cu = await ensureCustomer(d.customerName, { contact: d.contact, phone: d.contactPhone, region: d.region });
      const rec = { ...(existing || {}), ...d, customerId: cu.id, customerName: cu.name, files: files.value() };
      rec.fees = rec.fees.map((x) => { const o = { ...x }; delete o.removed; return o; });
      rec.costTrainer = sum(rec.fees.filter((x) => rec.trainerIds.includes(x.trainerId)), (x) => x.amount);
      delete rec.costTravel; delete rec.costOther; delete rec.costTrainerMode; delete rec.vatRate;
      if (rec.status === 'done' && (rec.passed === '' || rec.passed === undefined)) rec.passed = rec.students;
      await Store.save('classes', rec, `${cu.name} – ${fmtDateRange(rec.startDate, rec.endDate)}`);
      files.commit(); m.guard = null; m.close();
      toast(existing ? 'Đã cập nhật lớp.' : 'Đã thêm lớp vào lịch.', 'ok');
      S.ui.selDate = rec.startDate; if (!classInMonth(rec, S.ui.month) && S.ui.tab === 'lich') S.ui.month = ymOf(rec.startDate);
      scheduleRender();
    } catch (e) { ev.target.disabled = false; }
  };
}

async function deleteClass(c) {
  if (!c) return false;
  const paid = sum(classFees(c), feePaid);
  if (!(await confirmBox(`Xóa lớp <b>${esc(classLabel(c))}</b> (${esc(fmtDateRange(c.startDate, c.endDate))})? Các file hồ sơ lớp cũng bị xóa.${paid ? `<br><br><b>Lưu ý:</b> lớp đã ghi nhận trả thù lao giảng viên ${esc(moneyD(paid))} – xóa lớp sẽ mất các khoản này. Nên chuyển trạng thái “Đã hủy” thay vì xóa.` : ''}`, { ok: 'Xóa lớp', danger: true }))) return false;
  try { await Store.remove('classes', c, `${classLabel(c)} – ${fmtDateRange(c.startDate, c.endDate)}`); [...(c.files || []), ...(c.fees || []).flatMap((x) => x.files || [])].forEach((x) => Store.backend.delFile(x)); toast('Đã xóa lớp.', 'ok'); return true; } catch (e) { return false; }
}

async function markDone(c) {
  const rec = { ...c, status: 'done', passed: c.passed === '' || c.passed === undefined ? c.students : c.passed };
  try { await Store.save('classes', rec, `${classLabel(c)} – hoàn thành`, 'Hoàn thành'); toast('Đã đánh dấu lớp hoàn thành.', 'ok'); } catch (e) { /* đã báo lỗi */ }
}

function classDetail(id) {
  const m = openModal({ title: '', size: 'wide' });
  m.refresh = render; render();
  function render() {
    const c = klass(id); if (!c) { m.close(); return; }
    const cx = conflictsFor(c); const P = classPnl(c); const q = c.quoteId && quote(c.quoteId); const cu = customer(c.customerId);
    const fees = classFees(c); const cancelled = c.status === 'cancelled';
    const batches = S.rosters.filter((r) => r.classId === c.id);
    m.el.querySelector('.modal-h h2').textContent = classLabel(c);
    m.el.querySelector('.modal-h .grow').querySelector('.sub')?.remove();
    m.el.querySelector('.modal-h .grow').insertAdjacentHTML('beforeend', `<div class="sub">${esc(fmtDateRange(c.startDate, c.endDate))} · ${esc(c.startTime || '')}–${esc(c.endTime || '')} · ${esc(regionName(c.region))}</div>`);
    m.body.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap">${classPill(c)}${rtag(c.region)}${cx.length ? pill('Trùng lịch giảng viên', 'bad') : ''}${c.certIssued ? pill('Đã cấp GCN/thẻ', 'ok') : ''}${c.invoiced ? pill('Đã xuất hóa đơn', 'ok') : ''}</div>
      ${cx.length ? `<div class="banner warn" style="margin:0">${esc(cx.map((x) => `${trainerNames(x.trainers)} cũng dạy ${classLabel(x.cls)} (${fmtDateRange(x.cls.startDate, x.cls.endDate)} ${x.cls.startTime || ''}–${x.cls.endTime || ''})`).join('; '))}</div>` : ''}
      <dl class="dl">
        <div><dt>Khách hàng</dt><dd>${cu ? `<a href="#" data-act="customer-view" data-id="${esc(cu.id)}">${esc(cu.name)}</a>` : esc(c.customerName)}</dd></div>
        <div><dt>Người liên hệ</dt><dd>${c.contact ? esc(c.contact) : notSet()} ${c.contactPhone ? phoneLink(c.contactPhone) : ''}</dd></div>
        <div><dt>Thời gian</dt><dd>${esc(fmtDateRange(c.startDate, c.endDate))} (${classDays(c)} ngày) · ${esc(c.startTime || '')}–${esc(c.endTime || '')}</dd></div>
        <div><dt>Địa điểm</dt><dd>${c.location ? esc(c.location) : notSet()}</dd></div>
        <div><dt>Hình thức</dt><dd>${esc(c.kind || '—')}${c.title ? ' · ' + esc(c.title) : ''}</dd></div>
        <div><dt>Nhóm huấn luyện</dt><dd>${(c.groups || []).length ? c.groups.slice().sort().map((g) => `Nhóm ${g} <span class="muted small">(${esc(GROUPS[g].paper)})</span>`).join(', ') : notSet()}</dd></div>
        <div><dt>Số học viên</dt><dd class="num">${money(c.students)}${c.status === 'done' && c.passed !== '' && c.passed !== undefined ? ` · đạt ${money(c.passed)}` : ''}</dd></div>
      </dl>
      <div><div class="sec-title">Doanh thu – chi phí – lợi nhuận</div><div class="money-box cols-5">
        ${mbox('Doanh thu lớp', money(P.rev), 'hl')}${mbox('Thù lao giảng viên', money(P.gv))}${mbox('Hoa hồng (gồm thuế)', money(P.com.gross), '', P.com.gross ? `thực trả ${money(P.com.net)} · thuế ${money(P.com.tax)}` : '')}${mbox('Chi phí khác', money(P.other))}
        ${mbox(`Lợi nhuận${P.rev ? ` (${pct(P.margin)})` : ''}`, money(P.profit), P.profit < 0 ? 'neg' : 'pos')}</div>
        ${c.priceMode === 'manual' && tierFor(c.students) && tierFor(c.students).price !== c.price ? `<div class="small muted" style="margin-top:6px">Giá điều chỉnh so với bảng giá (${esc(moneyD(tierFor(c.students).price))}).</div>` : ''}</div>
      <div><div class="sec-title">Thù lao giảng viên (hợp đồng thuê giảng viên)</div>${fees.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Giảng viên</th><th>Số HĐ thuê GV</th><th class="r">Thù lao</th><th class="r">Đã trả</th><th class="r">Còn lại</th><th>Tình trạng</th><th></th></tr></thead><tbody>
        ${fees.map((fe) => { const x = trainer(fe.trainerId); const s2 = feeState(fe, cancelled); return `<tr data-act="fee-open" data-id="${esc(c.id)}" data-trainer="${esc(fe.trainerId)}"><td>${avatar(x, 'sm')} <b>${esc(x?.name || 'GV đã xóa')}</b>${fe.removed ? ' <span class="muted small">(đã gỡ khỏi lớp)</span>' : ''}<div class="small">${x ? phoneLink(x.phone) : ''}</div></td>
          <td class="small">${fe.contractNo ? esc(fe.contractNo) : '<span class="muted">chưa có số HĐ</span>'} ${(fe.files || []).length ? fileButtons(fe.files, 'HĐ') : ''}</td>${moneyCell(s2.amount)}${moneyCell(s2.paid)}<td class="r strong" style="color:${s2.remain > 0 ? 'var(--accent)' : 'var(--ok)'}">${money(s2.remain)}</td><td>${pill(s2.label, s2.tone)}</td>
          <td class="r"><button type="button" class="btn xs" data-act="fee-open" data-id="${esc(c.id)}" data-trainer="${esc(fe.trainerId)}">${ic('money')} Thù lao &amp; trả tiền</button></td></tr>`; }).join('')}</tbody></table></div>` : '<div class="banner warn" style="margin:0">Chưa phân công giảng viên</div>'}</div>
      <div><div class="sec-title">Hoa hồng &amp; chi phí khác</div>
        ${P.contract ? `<div class="small" style="margin-bottom:6px">Phân bổ <b>${pct(P.share)}</b> từ hợp đồng <b>${esc(P.contract.contractNo || P.contract.no || '')}</b>: hoa hồng đại lý ${esc(money(P.com.agent + P.com.other))} đ · hoa hồng cán bộ quản lý KH ${esc(money(P.com.manager))} đ · thuế khấu trừ ${esc(money(P.com.tax))} đ${P.otherAlloc ? ` · chi phí khác cấp HĐ ${esc(money(P.otherAlloc))} đ` : ''} <button type="button" class="btn xs" data-act="pnl-view" data-id="${esc(P.contract.id)}">${ic('trend')} Chi phí &amp; lợi nhuận hợp đồng</button></div>` : '<div class="small muted" style="margin-bottom:6px">Lớp chưa gắn hợp đồng đã ký – chưa có hoa hồng.</div>'}
        ${classOtherCosts(c).length ? `<div class="tbl-wrap"><table class="tbl"><tbody>${classOtherCosts(c).map((x) => `<tr style="cursor:default"><td>${esc(x.name)}${x.note ? `<div class="muted small">${esc(x.note)}</div>` : ''}</td>${moneyCell(x.amount)}</tr>`).join('')}</tbody></table></div>` : '<div class="small muted">Chưa có chi phí khác của lớp.</div>'}</div>
      <div><div class="sec-title">Báo giá &amp; hợp đồng</div>${q ? `<div class="file" style="flex-wrap:wrap"><span class="fn"><b>${esc(q.no || 'Báo giá')} · ${esc(q.customerName)}</b><span>${esc(QUOTE_STATUS[q.status]?.label || '')}${q.contractNo ? ' · HĐ số ' + esc(q.contractNo) : ''}</span></span>
        ${fileButtons(q.quoteFiles, 'Xem báo giá')} ${fileButtons(q.contractFiles, 'Xem hợp đồng')} <button type="button" class="btn xs" data-act="quote-view" data-id="${esc(q.id)}">Mở hồ sơ</button></div>` : '<div class="muted small">Chưa gắn báo giá / hợp đồng.</div>'}</div>
      ${batches.length ? `<div><div class="sec-title">Học viên được cấp thẻ/GCN</div>${batches.map((r) => `<button type="button" class="btn sm" data-act="roster-view" data-id="${esc(r.batchId || r.id)}">${ic('idcard')} ${esc(r.title || 'Đợt cấp')} · ${rosterCount(r)} học viên</button>`).join(' ')}</div>` : ''}
      <div><div class="sec-title">Hồ sơ lớp</div>${filesBlock(c.files, 'Chưa có file hồ sơ lớp')}</div>
      ${c.notes ? `<div><div class="sec-title">Ghi chú</div><div style="white-space:pre-wrap">${esc(c.notes)}</div></div>` : ''}`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(c)}<span class="sp"></span><span class="edit-only" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa</button><button type="button" class="btn" data-x="dup">${ic('copy')} Nhân bản</button>${c.status !== 'done' && c.status !== 'cancelled' ? `<button type="button" class="btn" data-x="done">${ic('check')} Hoàn thành</button>` : ''}<button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa</button></span>`;
    m.foot.querySelector('[data-x=del]').onclick = async () => { if (await deleteClass(c)) m.close(); };
    m.foot.querySelector('[data-x=dup]').onclick = () => { m.close(); classForm(null, { from: clone(c) }); };
    m.foot.querySelector('[data-x=done]')?.addEventListener('click', () => markDone(c));
    m.foot.querySelector('[data-x=edit]').onclick = () => { m.close(); classForm(c); };
    hydrate(m.el); fillNames(m.el);
  }
}

/* ---------- thù lao một giảng viên trong một lớp: số tiền, HĐ thuê GV, tạm ứng / thanh toán ---------- */
function feeModal(classId, trainerId, { pay = false } = {}) {
  const c0 = klass(classId); const x = trainer(trainerId);
  if (!c0) return;
  const ro = !S.role.canEdit;
  const base = classFees(c0).find((fe) => fe.trainerId === trainerId) || { trainerId, amount: feeAuto(trainerId, c0), auto: true, payments: [] };
  const fe = clone(base); fe.payments = fe.payments || [];
  const auto = feeAuto(trainerId, c0);
  const m = openModal({
    title: `Thù lao giảng viên – ${esc(x?.name || 'Giảng viên')}`, sub: esc(`${classLabel(c0)} · ${fmtDateRange(c0.startDate, c0.endDate)} · ${classDays(c0)} ngày`), size: '',
    body: `<div class="fgrid">
        ${f('fm-amount', 'Thù lao lớp này (đ)', moneyInp('fm-amount', fe.amount, 'Số tiền theo hợp đồng thuê giảng viên'), { hint: x?.dailyRate ? `Theo thù lao/ngày: ${money(x.dailyRate)} × ${classDays(c0)} ngày = ${money(auto)} đ` : 'Giảng viên chưa có thù lao/ngày – nhập số thỏa thuận' })}
        ${f('fm-cno', 'Số hợp đồng thuê giảng viên', inp('fm-cno', fe.contractNo, 'placeholder="VD: 12/2026/HĐGV-DAKO"'))}
        ${f('fm-cdate', 'Ngày ký hợp đồng', inp('fm-cdate', fe.contractDate, 'type="date"'))}
        ${f('fm-note', 'Ghi chú', inp('fm-note', fe.note, 'placeholder="Điều khoản thanh toán, tài khoản nhận…"'), { cls: 'full' })}
        <div class="f full"><span class="lbl">File hợp đồng thuê giảng viên / chứng từ chi</span><div data-files></div></div>
      </div>
      <div><div class="sec-title">Tạm ứng &amp; thanh toán</div><div data-pays></div>
        ${ro ? '' : `<div class="payadd"><input class="input" id="fm-pdate" type="date" value="${todayISO()}" aria-label="Ngày trả"><select class="input" id="fm-pkind" aria-label="Loại">${PAY_KINDS.map((k) => opt(k, k, k === 'Tạm ứng')).join('')}</select><input class="input num" id="fm-pamount" data-money inputmode="numeric" placeholder="Số tiền trả (đ)" aria-label="Số tiền"><input class="input" id="fm-pnote" placeholder="Nội dung – VD: tạm ứng trước khi dạy" aria-label="Nội dung"><button type="button" class="btn sm" data-addpay>${ic('plus')} Ghi nhận</button></div>`}
      </div><div class="money-box" data-sum></div>`,
    foot: ro ? '' : `<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu</button>`,
  });
  const root = m.el; bindMoney(root);
  const files = mountFileField(root.querySelector('[data-files]'), fe.files || []);
  if (ro) $$('input, select', root).forEach((el) => (el.disabled = true));
  function renderPays() {
    const amount = parseMoney(val(root, 'fm-amount')); const paid = sum(fe.payments, (p) => p.amount);
    root.querySelector('[data-pays]').innerHTML = fe.payments.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ngày</th><th>Loại</th><th class="r">Số tiền</th><th>Nội dung</th><th></th></tr></thead><tbody>${fe.payments.slice().sort((a, b) => (a.date || '').localeCompare(b.date || '')).map((p) => `<tr style="cursor:default"><td class="num">${esc(fmtD(p.date))}</td><td>${esc(p.kind || '')}</td>${moneyCell(p.amount)}<td>${esc(p.note || '')}</td><td class="r">${ro ? '' : `<button type="button" class="btn xs ghost" data-rmpay="${esc(p.id)}" aria-label="Xóa khoản trả">${ic('trash')}</button>`}</td></tr>`).join('')}</tbody></table></div>` : '<div class="muted small">Chưa có khoản tạm ứng / thanh toán nào.</div>';
    const due = (c0.status === 'cancelled' ? 0 : amount) - paid;
    root.querySelector('[data-sum]').innerHTML = mbox('Thù lao', money(c0.status === 'cancelled' ? 0 : amount)) + mbox('Đã trả', money(paid), 'pos') + (due < 0 ? mbox(c0.status === 'cancelled' ? 'Cần thu hồi tạm ứng' : 'Đã trả dư', money(-due), 'neg') : mbox('Còn phải trả', money(due), due > 0 ? 'hl' : 'pos'));
    const pa = root.querySelector('#fm-pamount'); if (pa && !pa.value && amount - paid > 0) pa.placeholder = `Còn lại ${money(amount - paid)} đ`;
  }
  renderPays();
  root.querySelector('#fm-amount').addEventListener('input', renderPays);
  root.addEventListener('click', (e) => {
    if (e.target.closest('[data-addpay]')) {
      const amount = parseMoney(val(root, 'fm-pamount'));
      if (!(amount > 0)) { toast('Nhập số tiền đã trả.', 'bad'); root.querySelector('#fm-pamount').focus(); return; }
      fe.payments.push({ id: uid('tt'), date: val(root, 'fm-pdate') || todayISO(), kind: val(root, 'fm-pkind') || 'Thanh toán', amount, note: val(root, 'fm-pnote') });
      root.querySelector('#fm-pamount').value = ''; root.querySelector('#fm-pnote').value = ''; renderPays();
      toast('Đã thêm – bấm Lưu để ghi vào công cụ.');
    }
    const rm = e.target.closest('[data-rmpay]'); if (rm) { fe.payments = fe.payments.filter((p) => p.id !== rm.dataset.rmpay); renderPays(); }
  });
  const read = () => ({ amount: parseMoney(val(root, 'fm-amount')), contractNo: val(root, 'fm-cno'), contractDate: val(root, 'fm-cdate'), note: val(root, 'fm-note'), payments: fe.payments });
  const snap = JSON.stringify(read());
  if (!ro) {
    m.guard = formGuard(() => JSON.stringify(read()) !== snap || files.dirty(), [files]);
    root.querySelector('[data-cancel]').onclick = () => m.tryClose();
    root.querySelector('[data-save]').onclick = async (ev) => {
      const d = read(); const c = klass(classId) || c0;
      const list = classFees(c).map((x2) => ({ ...x2 }));
      const i = list.findIndex((x2) => x2.trainerId === trainerId);
      const entry = { ...(i >= 0 ? list[i] : { trainerId }), ...d, auto: d.amount === auto && !!auto, files: files.value() };
      delete entry.removed;
      if (i >= 0) list[i] = entry; else list.push(entry);
      const rec = { ...c, fees: list.map((x2) => { const o = { ...x2 }; delete o.removed; return o; }) };
      rec.costTrainer = sum(rec.fees.filter((x2) => (rec.trainerIds || []).includes(x2.trainerId)), (x2) => x2.amount);
      delete rec.costTrainerMode;
      ev.target.disabled = true;
      try {
        const newPaid = sum(d.payments, (p) => p.amount) - feePaid(base);
        await Store.save('classes', rec, `Thù lao ${x?.name || 'GV'} – ${classLabel(c)}${newPaid > 0 ? ` (trả ${moneyShort(newPaid)})` : ''}`, newPaid > 0 ? 'Trả thù lao' : 'Cập nhật');
        files.commit(); m.guard = null; m.close(); toast('Đã lưu thù lao giảng viên.', 'ok');
      } catch (e) { ev.target.disabled = false; }
    };
  }
  if (pay && !ro) setTimeout(() => root.querySelector('#fm-pamount')?.focus(), 60);
}

/* ======================= GIẢNG VIÊN ======================= */
function trainerForm(existing) {
  if (!S.role.canEdit) return;
  const x = existing ? clone(existing) : { region: S.ui.trRegion && S.ui.trRegion !== 'all' ? S.ui.trRegion : regionList()[0]?.id, otherRegions: [], specialties: [], groups: [], status: 'active', employment: EMPLOYMENT[1], files: [] };
  const specs = uniq([...(settings().specialties || []), ...(x.specialties || [])]);
  const m = openModal({
    title: existing ? 'Sửa thông tin giảng viên' : 'Thêm giảng viên', sub: existing ? esc(x.name) : 'Các mục có dấu * là bắt buộc', size: 'wide',
    body: `<form id="tf" novalidate autocomplete="off">
      <fieldset class="sec"><legend>Thông tin cá nhân</legend><div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start"><div data-photo></div><div class="fgrid grow" style="min-width:240px">
        ${f('tf-name', 'Họ và tên', inp('tf-name', x.name, 'required placeholder="Họ và tên giảng viên"'), { req: true, cls: 'span2' })}
        ${f('tf-phone', 'Số điện thoại', inp('tf-phone', x.phone, 'inputmode="tel" required placeholder="VD: 0912 345 678"'), { req: true, hint: ' ' })}
        ${f('tf-email', 'Email', inp('tf-email', x.email, 'type="email" placeholder="email@…"'))}
        ${f('tf-birth', 'Năm sinh', inp('tf-birth', x.birthYear, 'type="number" min="1940" max="2010" placeholder="VD: 1985"'))}
        ${f('tf-address', 'Địa chỉ', inp('tf-address', x.address, 'placeholder="Tỉnh/thành nơi ở – giúp xếp vùng dạy"'), { cls: 'span2' })}
      </div></div></fieldset>
      <fieldset class="sec"><legend>Vùng &amp; chuyên môn</legend><div class="fgrid">
        ${f('tf-region', 'Vùng đào tạo chính', `<select class="input" id="tf-region">${regionList().map((r) => opt(r.id, `${r.name} (${r.center})`, x.region === r.id)).join('')}</select>`, { req: true })}
        <div class="f span2"><span class="lbl">Có thể hỗ trợ thêm vùng</span><div class="checks">${regionList().map((r) => `<label><input type="checkbox" name="tf-oreg" value="${esc(r.id)}"${(x.otherRegions || []).includes(r.id) ? ' checked' : ''}> ${esc(r.name)}</label>`).join('')}</div></div>
        <div class="f full"><span class="lbl">Chuyên ngành đào tạo</span><div class="checks">${specs.map((s) => `<label><input type="checkbox" name="tf-spec" value="${esc(s)}"${(x.specialties || []).includes(s) ? ' checked' : ''}> ${esc(s)}</label>`).join('')}</div></div>
        ${f('tf-spec-more', 'Chuyên ngành khác', inp('tf-spec-more', '', 'placeholder="Ghi thêm, cách nhau bằng dấu phẩy"'), { cls: 'full' })}
        <div class="f full"><span class="lbl">Nhóm huấn luyện được dạy</span>${groupChecks('tf-group', x.groups)}</div>
        ${f('tf-degree', 'Trình độ chuyên môn', inp('tf-degree', x.degree, 'placeholder="VD: Kỹ sư điện, Thạc sĩ BHLĐ"'), { cls: 'span2' })}
        ${f('tf-exp', 'Số năm kinh nghiệm', inp('tf-exp', x.experience, 'type="number" min="0" placeholder="Số năm"'))}
        ${f('tf-certno', 'Số chứng chỉ / quyết định giảng viên', inp('tf-certno', x.certNo, 'placeholder="Số chứng chỉ giảng viên ATVSLĐ"'))}
        ${f('tf-certexp', 'Hạn chứng chỉ', inp('tf-certexp', x.certExpiry, 'type="date"'), { hint: 'Công cụ sẽ nhắc trước khi hết hạn' })}
      </div></fieldset>
      <fieldset class="sec"><legend>Hợp tác</legend><div class="fgrid">
        ${f('tf-emp', 'Hình thức', `<select class="input" id="tf-emp">${EMPLOYMENT.map((e) => opt(e, e, x.employment === e)).join('')}</select>`)}
        ${f('tf-rate', 'Thù lao / ngày dạy (đ)', moneyInp('tf-rate', x.dailyRate, 'VD: 1.500.000'), { hint: 'Dùng để tự tính thù lao giảng viên của từng lớp' })}
        ${f('tf-status', 'Trạng thái', `<select class="input" id="tf-status">${opt('active', 'Đang hoạt động', x.status !== 'paused')}${opt('paused', 'Tạm ngưng (không hiện khi xếp lịch)', x.status === 'paused')}</select>`)}
        ${f('tf-bank', 'Tài khoản nhận thù lao', inp('tf-bank', x.bank, 'placeholder="Số tài khoản – ngân hàng – chủ tài khoản"'), { cls: 'span2' })}
        ${f('tf-tax', 'Mã số thuế cá nhân', inp('tf-tax', x.taxCode, 'placeholder="MST cá nhân (khấu trừ thuế thù lao)"'))}
        ${f('tf-notes', 'Ghi chú', `<textarea class="input" id="tf-notes" rows="2" placeholder="Lưu ý khi phân công, đánh giá chất lượng…">${esc(x.notes || '')}</textarea>`, { cls: 'full' })}
        <div class="f full"><span class="lbl">Hồ sơ đính kèm – CV, bằng cấp, chứng chỉ, hợp đồng khung</span><div data-files></div></div>
      </div></fieldset></form>`,
    foot: `${existing ? `<button type="button" class="btn danger" data-del>${ic('trash')} Xóa</button>` : ''}<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu giảng viên</button>`,
  });
  const root = m.el; bindMoney(root);
  const ph = mountFileField(root.querySelector('[data-photo]'), x.photo ? [x.photo] : [], { image: true });
  const files = mountFileField(root.querySelector('[data-files]'), x.files);
  const read = () => ({
    name: val(root, 'tf-name'), phone: val(root, 'tf-phone'), email: val(root, 'tf-email'), birthYear: val(root, 'tf-birth'), address: val(root, 'tf-address'),
    region: val(root, 'tf-region'), otherRegions: checkedVals(root, 'tf-oreg').filter((r) => r !== val(root, 'tf-region')),
    specialties: uniq([...checkedVals(root, 'tf-spec'), ...val(root, 'tf-spec-more').split(',').map((s) => s.trim()).filter(Boolean)]),
    groups: checkedVals(root, 'tf-group').map(Number), degree: val(root, 'tf-degree'), experience: val(root, 'tf-exp'), certNo: val(root, 'tf-certno'), certExpiry: val(root, 'tf-certexp'),
    employment: val(root, 'tf-emp'), dailyRate: parseMoney(val(root, 'tf-rate')), status: val(root, 'tf-status'), bank: val(root, 'tf-bank'), taxCode: val(root, 'tf-tax'), notes: val(root, 'tf-notes'),
  });
  root.querySelector('#tf-phone').addEventListener('input', () => {
    const p = val(root, 'tf-phone').replace(/\D/g, '');
    const dup = p && S.trainers.find((t) => t.id !== existing?.id && String(t.phone || '').replace(/\D/g, '') === p);
    root.querySelector('[data-hint="tf-phone"]').innerHTML = dup ? `<span style="color:var(--warn)">Số này trùng với giảng viên ${esc(dup.name)}</span>` : ' ';
  });
  const snap = JSON.stringify(read());
  m.guard = formGuard(() => JSON.stringify(read()) !== snap || ph.dirty() || files.dirty(), [ph, files]);
  root.querySelector('[data-cancel]').onclick = () => m.tryClose();
  root.querySelector('[data-del]')?.addEventListener('click', async () => { if (await deleteTrainer(existing)) { m.guard = null; m.close(); } });
  root.querySelector('[data-save]').onclick = async (ev) => {
    const d = read(); const err = [];
    if (!d.name) err.push('họ tên'); if (!d.phone) err.push('số điện thoại'); if (!d.region) err.push('vùng đào tạo');
    if (err.length) { toast('Cần nhập: ' + err.join(', '), 'bad'); return; }
    ev.target.disabled = true;
    try {
      const rec = await Store.save('trainers', { ...(existing || {}), ...d, photo: ph.value(), files: files.value() }, d.name);
      ph.commit(); files.commit(); m.guard = null; m.close();
      toast(existing ? 'Đã cập nhật giảng viên.' : 'Đã thêm giảng viên.', 'ok');
      const extra = d.specialties.filter((s) => !(settings().specialties || []).includes(s));
      if (extra.length && S.role.canEdit) Store.saveSettings({ ...settings(), specialties: [...settings().specialties, ...extra] }).catch(() => {});
      return rec;
    } catch (e) { ev.target.disabled = false; }
  };
}

async function deleteTrainer(x) {
  if (!x) return false;
  const used = S.classes.filter((c) => (c.trainerIds || []).includes(x.id) || (c.fees || []).some((fe) => fe.trainerId === x.id));
  if (used.length) { toast(`Không xóa được: ${x.name} đã có ${used.length} lớp trong lịch. Hãy chuyển trạng thái “Tạm ngưng” để giữ lịch sử và công nợ.`, 'bad'); return false; }
  if (!(await confirmBox(`Xóa giảng viên <b>${esc(x.name)}</b> cùng ảnh và hồ sơ đính kèm?`, { ok: 'Xóa giảng viên', danger: true }))) return false;
  try { await Store.remove('trainers', x, x.name); [x.photo, ...(x.files || [])].filter(Boolean).forEach((f2) => Store.backend.delFile(f2)); toast('Đã xóa giảng viên.', 'ok'); return true; } catch (e) { return false; }
}

function trainerDetail(id) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; render();
  function render() {
    const x = trainer(id); if (!x) { m.close(); return; }
    const t = todayISO(); const ym = t.slice(0, 7); const load = trainerMonthLoad(x.id, ym);
    const mine = S.classes.filter((c) => (c.trainerIds || []).includes(x.id) && c.status !== 'cancelled').sort(sortClasses);
    const up = mine.filter((c) => (c.endDate || c.startDate) >= t);
    const done = mine.filter((c) => c.status === 'done');
    const cert = x.certExpiry ? dueTone(x.certExpiry) : null;
    const L = trainerLedger(x.id);
    m.el.querySelector('.modal-h h2').textContent = x.name;
    m.body.innerHTML = `<div class="detail-top">${photo(x, 'lg')}<div class="grow" style="min-width:240px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:6px;flex-wrap:wrap">${rtag(x.region)}${x.status === 'paused' ? pill('Tạm ngưng', 'muted') : pill('Đang hoạt động', 'ok')}${x.employment ? pill(x.employment, 'info') : ''}${cert ? pill('Chứng chỉ: ' + cert.text, cert.tone) : ''}</div>
      <dl class="dl"><div><dt>Điện thoại</dt><dd>${phoneLink(x.phone)}</dd></div><div><dt>Email</dt><dd>${x.email ? esc(x.email) : notSet()}</dd></div><div><dt>Năm sinh</dt><dd>${x.birthYear ? esc(x.birthYear) : notSet()}</dd></div>
      <div><dt>Vùng hỗ trợ thêm</dt><dd>${esc((x.otherRegions || []).map(regionName).join(', ') || '—')}</dd></div><div><dt>Trình độ</dt><dd>${x.degree ? esc(x.degree) : notSet()}${x.experience ? ` · ${esc(x.experience)} năm kinh nghiệm` : ''}</dd></div>
      <div><dt>Chứng chỉ giảng viên</dt><dd>${x.certNo ? esc(x.certNo) : notSet()}${x.certExpiry ? ` · hạn ${esc(fmtD(x.certExpiry))}` : ''}</dd></div><div><dt>Thù lao / ngày</dt><dd>${x.dailyRate ? esc(moneyD(x.dailyRate)) : notSet('Nhập thù lao/ngày để công cụ tự tính thù lao từng lớp')}</dd></div>
      <div><dt>Tài khoản nhận thù lao</dt><dd>${x.bank ? esc(x.bank) : notSet()}</dd></div><div><dt>MST cá nhân</dt><dd>${x.taxCode ? esc(x.taxCode) : notSet()}</dd></div>
      <div class="full"><dt>Địa chỉ</dt><dd>${x.address ? esc(x.address) : notSet()}</dd></div></dl></div></div>
      <div><div class="sec-title">Chuyên ngành &amp; nhóm được dạy</div><div style="display:flex;gap:6px;flex-wrap:wrap">${(x.specialties || []).map((s) => `<span class="tag">${esc(s)}</span>`).join('') || '<span class="muted small">Chưa nhập chuyên ngành</span>'}</div>
        <div class="small" style="margin-top:6px">${(x.groups || []).length ? x.groups.slice().sort().map((g) => `Nhóm ${g}: ${esc(GROUPS[g].desc)}`).join('<br>') : '<span class="muted">Chưa chọn nhóm được dạy</span>'}</div></div>
      <div class="kpis" style="margin:0"><div class="kpi"><span class="k">Tháng ${Number(ym.slice(5))}</span><span class="v">${load.days} <small>ngày dạy</small></span><span class="d">${load.classes.length} lớp</span></div>
        <div class="kpi"><span class="k">Đã dạy</span><span class="v">${done.length} <small>lớp</small></span><span class="d">${money(sum(done, (c) => c.students))} học viên</span></div>
        <div class="kpi"><span class="k">Tổng thù lao</span><span class="v">${moneyShort(L.amount)}</span><span class="d">Đã trả ${moneyD(L.paid)}</span></div>
        <div class="kpi${L.remain > 0 ? ' hl' : ''}"><span class="k">Còn phải trả</span><span class="v">${moneyShort(L.remain)}</span><span class="d">${moneyD(L.remain)}</span></div></div>
      <div><div class="sec-title">Thù lao &amp; thanh toán theo lớp</div>${L.rows.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ngày lớp</th><th>Khách hàng</th><th>HĐ thuê GV</th><th class="r">Thù lao</th><th class="r">Đã trả</th><th class="r">Còn lại</th><th>Tình trạng</th></tr></thead><tbody>
        ${L.rows.slice().reverse().map((r) => `<tr data-act="fee-open" data-id="${esc(r.c.id)}" data-trainer="${esc(x.id)}"><td class="nowrap num">${esc(fmtDateRange(r.c.startDate, r.c.endDate))}</td><td>${esc(classLabel(r.c))}</td><td class="small">${esc(r.f.contractNo || '')} ${(r.f.files || []).length ? fileButtons(r.f.files, 'HĐ') : ''}</td>${moneyCell(r.amount)}${moneyCell(r.paid)}<td class="r strong" style="color:${r.remain > 0 ? 'var(--accent)' : 'var(--ok)'}">${money(r.remain)}</td><td>${pill(r.label, r.tone)}</td></tr>`).join('')}
        </tbody><tfoot><tr><td colspan="3">Tổng ${L.rows.length} lớp</td>${moneyCell(L.amount)}${moneyCell(L.paid)}${moneyCell(L.remain)}<td></td></tr></tfoot></table></div>` : '<div class="muted small">Chưa có lớp nào.</div>'}</div>
      <div><div class="sec-title">Lịch sắp tới</div>${up.length ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${up.slice(0, 12).map(classLi).join('')}</ul>` : '<div class="muted small">Chưa có lớp sắp tới.</div>'}</div>
      <div><div class="sec-title">Hồ sơ đính kèm</div>${filesBlock(x.files, 'Chưa có hồ sơ đính kèm')}</div>
      ${x.notes ? `<div><div class="sec-title">Ghi chú</div><div style="white-space:pre-wrap">${esc(x.notes)}</div></div>` : ''}`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(x)}<span class="sp"></span><button type="button" class="btn" data-x="cal">${ic('cal')} Xem trên lịch</button><span class="edit-only" style="display:flex;gap:8px"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa</button><button type="button" class="btn" data-x="new">${ic('plus')} Xếp lớp</button><button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa</button></span>`;
    m.foot.querySelector('[data-x=cal]').onclick = () => { m.close(); S.ui.trainerFocus = x.id; S.ui.region = 'all'; go('lich'); };
    m.foot.querySelector('[data-x=del]').onclick = async () => { if (await deleteTrainer(x)) m.close(); };
    m.foot.querySelector('[data-x=new]').onclick = () => { m.close(); classForm(null, { trainerId: x.id }); };
    m.foot.querySelector('[data-x=edit]').onclick = () => { m.close(); trainerForm(x); };
    hydrate(m.el); fillNames(m.el);
  }
}

/* ======================= BÁO GIÁ – HỢP ĐỒNG ======================= */
function quoteForm(existing, preset = {}) {
  if (!S.role.canEdit) return;
  const today = todayISO();
  const q = existing ? clone(existing) : { date: today, validUntil: addDays(today, 30), status: 'draft', groups: [], classCount: 1, priceMode: 'auto', amountMode: 'auto', quoteFiles: [], contractFiles: [], payments: [], ...preset };
  const cu0 = q.customerId ? customer(q.customerId) : findCustomerByName(q.customerName);
  const m = openModal({
    title: existing ? `Sửa báo giá ${esc(q.no || '')}` : 'Thêm báo giá', sub: 'Khi khách ký, điền mục Hợp đồng – hồ sơ sẽ hiện trong tab Hợp đồng và được tính doanh thu', size: 'wide',
    body: `<form id="qf" novalidate autocomplete="off">
      <fieldset class="sec"><legend>Khách hàng</legend><div class="fgrid">
        ${f('qf-customer', 'Tên công ty khách hàng', inp('qf-customer', q.customerName, 'list="qf-customers" required placeholder="Gõ để chọn công ty đã có hoặc nhập mới"') + custList('qf-customers'), { cls: 'span2', req: true, hint: ' ' })}
        ${f('qf-tax', 'Mã số thuế', inp('qf-tax', cu0?.taxCode, 'placeholder="MST doanh nghiệp"'))}
        ${f('qf-address', 'Địa chỉ', inp('qf-address', cu0?.address, 'placeholder="Địa chỉ trụ sở / nơi huấn luyện"'), { cls: 'span2' })}
        ${f('qf-cregion', 'Vùng', `<select class="input" id="qf-cregion">${opt('', '— Chọn vùng —', !cu0?.region)}${regionList().map((r) => opt(r.id, r.name, cu0?.region === r.id)).join('')}</select>`)}
        ${f('qf-contact', 'Người liên hệ', inp('qf-contact', q.contact || cu0?.contact, 'placeholder="Họ tên, chức vụ"'))}
        ${f('qf-cphone', 'SĐT liên hệ', inp('qf-cphone', q.contactPhone || cu0?.phone, 'inputmode="tel" placeholder="Số điện thoại"'))}
        ${f('qf-cemail', 'Email', inp('qf-cemail', cu0?.email, 'type="email" placeholder="email@congty.vn"'))}
      </div></fieldset>
      <fieldset class="sec"><legend>Báo giá</legend><div class="fgrid">
        ${f('qf-no', 'Số báo giá', inp('qf-no', q.no || nextQuoteNo(q.date), 'placeholder="VD: 31/2026/BG-DAKO"'))}
        ${f('qf-date', 'Ngày báo giá', inp('qf-date', q.date, 'type="date"'))}
        ${f('qf-valid', 'Hiệu lực đến', inp('qf-valid', q.validUntil, 'type="date"'))}
        ${f('qf-owner', 'Người phụ trách', inp('qf-owner', q.owner, 'placeholder="Nhân viên kinh doanh / đại lý"'))}
        <div class="f full"><span class="lbl">Nhóm huấn luyện</span>${groupChecks('qf-group', q.groups)}</div>
        ${f('qf-students', 'Tổng số học viên dự kiến', inp('qf-students', q.students, 'type="number" min="1" placeholder="Số học viên"'))}
        ${f('qf-classes', 'Số lớp', inp('qf-classes', q.classCount || 1, 'type="number" min="1"'), { hint: ' ' })}
        ${f('qf-unit', 'Đơn giá / lớp (đ)', moneyInp('qf-unit', q.unitPrice, 'Tự tính theo bảng giá'), { hint: ' ' })}
        ${f('qf-amount', 'Giá trị báo giá (đ)', moneyInp('qf-amount', q.amount, 'Tổng giá trị báo giá'), { hint: ' ' })}
        ${f('qf-status', 'Trạng thái', `<select class="input" id="qf-status">${Object.entries(QUOTE_STATUS).map(([k, v]) => opt(k, v.label, q.status === k)).join('')}</select>`)}
        ${f('qf-notes', 'Ghi chú', `<textarea class="input" id="qf-notes" rows="2" placeholder="Chi tiết đơn giá từng nhóm, điều kiện ưu đãi…">${esc(q.notes || '')}</textarea>`, { cls: 'full' })}
        <div class="f full"><span class="lbl">File báo giá</span><div data-qfiles></div></div>
      </div></fieldset>
      <fieldset class="sec" id="qf-contract-sec"><legend>Hợp đồng</legend><div class="fgrid">
        ${f('qf-cno', 'Số hợp đồng', inp('qf-cno', q.contractNo, 'placeholder="Điền khi khách ký – VD: 15/2026/HĐHL-DAKO"'))}
        ${f('qf-cdate', 'Ngày ký', inp('qf-cdate', q.contractDate, 'type="date"'))}
        ${f('qf-camount', 'Giá trị hợp đồng (đ)', moneyInp('qf-camount', q.contractAmount, 'Để trống = bằng giá trị báo giá'), { hint: 'Doanh thu tính theo số này' })}
        ${f('qf-due', 'Hạn thanh toán', inp('qf-due', q.paymentDue, 'type="date"'))}
        <div class="f full"><span class="lbl">File hợp đồng (bản ký, phụ lục, biên bản nghiệm thu – thanh lý…)</span><div data-cfiles></div></div>
      </div><div class="small muted" style="margin-top:8px">Thu tiền ghi nhận ở màn hình chi tiết hợp đồng; hoa hồng và chi phí khác nhập ở “Chi phí &amp; lợi nhuận”.</div></fieldset></form>`,
    foot: `${existing ? `<button type="button" class="btn danger" data-del>${ic('trash')} Xóa</button>` : ''}<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu báo giá</button>`,
  });
  const root = m.el; bindMoney(root);
  const qf = mountFileField(root.querySelector('[data-qfiles]'), q.quoteFiles);
  const cf = mountFileField(root.querySelector('[data-cfiles]'), q.contractFiles);
  let priceMode = q.priceMode || 'manual', amountMode = q.amountMode || 'manual';
  const read = () => ({
    customerName: val(root, 'qf-customer'), contact: val(root, 'qf-contact'), contactPhone: val(root, 'qf-cphone'),
    no: val(root, 'qf-no'), date: val(root, 'qf-date'), validUntil: val(root, 'qf-valid'), owner: val(root, 'qf-owner'), groups: checkedVals(root, 'qf-group').map(Number),
    students: Number(val(root, 'qf-students')) || 0, classCount: Math.max(1, Number(val(root, 'qf-classes')) || 1), unitPrice: parseMoney(val(root, 'qf-unit')), priceMode,
    amount: parseMoney(val(root, 'qf-amount')), amountMode, status: val(root, 'qf-status'), notes: val(root, 'qf-notes'),
    contractNo: val(root, 'qf-cno'), contractDate: val(root, 'qf-cdate'), contractAmount: val(root, 'qf-camount') === '' ? null : parseMoney(val(root, 'qf-camount')), paymentDue: val(root, 'qf-due'),
  });
  function refresh(src) {
    const d = read();
    const cu = findCustomerByName(d.customerName);
    root.querySelector('[data-hint="qf-customer"]').textContent = !d.customerName ? '' : cu ? `Khách hàng đã có · ${S.quotes.filter((x) => x.customerId === cu.id && x.id !== existing?.id).length} báo giá trước` : 'Khách hàng mới – sẽ được thêm vào danh sách khách hàng';
    if (src === 'qf-customer' && cu) {
      [['qf-tax', cu.taxCode], ['qf-address', cu.address], ['qf-contact', cu.contact], ['qf-cphone', cu.phone], ['qf-cemail', cu.email]].forEach(([id, v]) => { if (v && !val(root, id)) root.querySelector('#' + id).value = v; });
      if (cu.region && !val(root, 'qf-cregion')) root.querySelector('#qf-cregion').value = cu.region;
    }
    const per = d.students ? Math.ceil(d.students / d.classCount) : 0;
    root.querySelector('[data-hint="qf-classes"]').textContent = per ? `≈ ${per} học viên/lớp` : ' ';
    const tier = tierFor(per);
    if (priceMode === 'auto' && src !== 'qf-unit') root.querySelector('#qf-unit').value = tier ? money(tier.price) : '';
    const unit = parseMoney(val(root, 'qf-unit'));
    root.querySelector('[data-hint="qf-unit"]').innerHTML = `${esc(per ? tierText(per) : 'Nhập số học viên để tính theo bảng giá')}${tier && unit !== tier.price ? ` · <b style="color:var(--accent)">Giá điều chỉnh</b> <button type="button" class="btn xs" data-act-local="price-auto">Dùng giá bảng</button>` : ''}`;
    if (amountMode === 'auto' && src !== 'qf-amount' && unit) root.querySelector('#qf-amount').value = money(unit * d.classCount);
    const amt = parseMoney(val(root, 'qf-amount'));
    root.querySelector('[data-hint="qf-amount"]').innerHTML = `${amt ? esc(moneyD(amt)) : 'Chưa có tổng giá trị'}${unit && amt !== unit * d.classCount ? ` <button type="button" class="btn xs" data-act-local="amount-auto">= đơn giá × số lớp</button>` : ''}`;
  }
  root.querySelector('#qf').addEventListener('input', (e) => {
    if (e.target.id === 'qf-unit') priceMode = 'manual';
    if (e.target.id === 'qf-amount') amountMode = 'manual';
    if (e.target.id === 'qf-date' && !existing) root.querySelector('#qf-no').value = nextQuoteNo(val(root, 'qf-date'));
    refresh(e.target.id);
  });
  root.querySelector('#qf').addEventListener('change', (e) => refresh(e.target.id));
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act-local]'); if (!b) return;
    if (b.dataset.actLocal === 'price-auto') { priceMode = 'auto'; refresh('x'); }
    if (b.dataset.actLocal === 'amount-auto') { amountMode = 'auto'; refresh('x'); }
  });
  refresh('init');
  if (preset.focusContract) setTimeout(() => root.querySelector('#qf-contract-sec').scrollIntoView({ block: 'start' }), 60);
  const snap = JSON.stringify(read());
  m.guard = formGuard(() => JSON.stringify(read()) !== snap || qf.dirty() || cf.dirty(), [qf, cf]);
  root.querySelector('[data-cancel]').onclick = () => m.tryClose();
  root.querySelector('[data-del]')?.addEventListener('click', async () => { if (await deleteQuote(existing)) { m.guard = null; m.close(); } });
  root.querySelector('[data-save]').onclick = async (ev) => {
    const d = read();
    if (!d.customerName) { toast('Cần nhập tên công ty khách hàng.', 'bad'); return; }
    if (S.quotes.some((x) => x.id !== existing?.id && x.no && x.no === d.no)) { toast(`Số báo giá ${d.no} đã tồn tại – hãy đổi số khác.`, 'bad'); return; }
    let movedToContract = false;
    if ((d.contractNo || d.contractDate || cf.value().length) && !['signed', 'rejected'].includes(d.status)) { d.status = 'signed'; movedToContract = true; }
    if (d.status === 'signed' && !d.contractDate) d.contractDate = todayISO();
    ev.target.disabled = true;
    try {
      const cu = await ensureCustomer(d.customerName, { taxCode: val(root, 'qf-tax'), address: val(root, 'qf-address'), region: val(root, 'qf-cregion'), contact: d.contact, phone: d.contactPhone, email: val(root, 'qf-cemail') }, true);
      const rec = { ...(existing || {}), ...d, customerId: cu.id, customerName: cu.name, quoteFiles: qf.value(), contractFiles: cf.value(), payments: existing?.payments || [] };
      delete rec.vatRate;
      await Store.save('quotes', rec, `${rec.no} – ${cu.name}`);
      qf.commit(); cf.commit(); m.guard = null; m.close();
      toast(movedToContract ? 'Đã lưu – hồ sơ chuyển sang danh sách Hợp đồng và được tính doanh thu.' : existing ? 'Đã cập nhật báo giá.' : 'Đã thêm báo giá.', 'ok');
    } catch (e) { ev.target.disabled = false; }
  };
}

async function deleteQuote(q) {
  if (!q) return false;
  const cls = quoteClasses(q);
  if (!(await confirmBox(`Xóa ${isContract(q) ? 'hồ sơ hợp đồng' : 'báo giá'} <b>${esc(q.no || '')} – ${esc(q.customerName)}</b> cùng các file báo giá, hợp đồng, chứng từ?${cls.length ? `<br><br>${cls.length} lớp đang gắn với hồ sơ này sẽ được giữ lại nhưng bỏ liên kết.` : ''}`, { ok: 'Xóa', danger: true }))) return false;
  try {
    for (const c of cls) await Store.save('classes', { ...c, quoteId: null });
    await Store.remove('quotes', q, `${q.no || ''} – ${q.customerName}`);
    [...(q.quoteFiles || []), ...(q.contractFiles || []), ...(q.costFiles || [])].forEach((x) => Store.backend.delFile(x));
    toast('Đã xóa.', 'ok'); return true;
  } catch (e) { return false; }
}

function paymentForm(q) {
  if (!S.role.canEdit) return;
  const cm = contractMoney(q);
  const m = openModal({
    title: 'Ghi nhận khách thanh toán', sub: esc(`${q.contractNo || q.no} – ${q.customerName}`), size: 'narrow',
    body: `<div class="fgrid">${f('pf-date', 'Ngày thu', inp('pf-date', todayISO(), 'type="date"'))}${f('pf-amount', 'Số tiền (đ)', moneyInp('pf-amount', cm.remain, 'Số tiền khách chuyển'), { hint: `Còn phải thu: ${moneyD(cm.remain)}` })}${f('pf-note', 'Nội dung', inp('pf-note', '', 'placeholder="VD: Tạm ứng đợt 1, thanh toán sau nghiệm thu…"'), { cls: 'full' })}</div>`,
    foot: `<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu</button>`,
  });
  bindMoney(m.el);
  m.el.querySelector('[data-cancel]').onclick = () => m.close();
  m.el.querySelector('[data-save]').onclick = async () => {
    const amount = parseMoney(val(m.el, 'pf-amount'));
    if (!(amount > 0)) { toast('Nhập số tiền đã thu.', 'bad'); return; }
    const cur = quote(q.id) || q;
    const rec = { ...cur, payments: [...(cur.payments || []), { id: uid('p'), date: val(m.el, 'pf-date') || todayISO(), amount, note: val(m.el, 'pf-note') }] };
    try { await Store.save('quotes', rec, `Thu ${moneyShort(amount)} – ${q.customerName}`, 'Thu tiền'); m.close(); toast('Đã ghi nhận thanh toán.', 'ok'); } catch (e) { /* đã báo */ }
  };
}

/** Chi phí & lợi nhuận của một hợp đồng: thù lao GV (từ lớp), hoa hồng (thuế khấu trừ), chi phí khác. */
function pnlEditor(qid) {
  const q0 = quote(qid); if (!q0) return;
  const ro = !S.role.canEdit;
  const m = openModal({
    title: `Chi phí &amp; lợi nhuận – ${esc(q0.contractNo || q0.no || '')}`, sub: esc(`${q0.customerName}${q0.contractDate ? ' · ký ngày ' + fmtD(q0.contractDate) : ''}${isContract(q0) ? '' : ' · báo giá chưa ký – lợi nhuận dự kiến'}`), size: 'wide',
    body: `<div data-rev></div>
      <div class="money-box cols-4" data-sum></div>
      <div><div class="sec-title">Thù lao giảng viên</div><div data-gv></div></div>
      <div><div class="sec-title">Hoa hồng <span class="muted" style="text-transform:none;letter-spacing:0;font-weight:500">– nhập tổng hoa hồng hoặc số thực trả; thuế khấu trừ mặc định ${esc(String(settings().commissionTax ?? 20))}% (sửa được)</span></div><div data-com></div></div>
      <div><div class="sec-title">Chi phí khác của hợp đồng</div><div data-costs></div><div data-classcosts class="small" style="margin-top:6px"></div></div>
      <div><div class="sec-title">Chứng từ chi phí (phiếu chi, ủy nhiệm chi hoa hồng…)</div><div data-cfiles></div></div>`,
    foot: ro ? '' : `<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu chi phí</button>`,
  });
  const root = m.el;
  const draft = () => ({ ...(quote(qid) || q0), commissions: com.value(), otherCosts: costs.value(), gvEstimate: root.querySelector('#pe-gvest') ? parseMoney(val(root, 'pe-gvest')) : q0.gvEstimate || null });
  const com = commissionEditor(root.querySelector('[data-com]'), q0.commissions, { onChange: () => update(), readOnly: ro });
  const costs = costRowsEditor(root.querySelector('[data-costs]'), q0.otherCosts, { presets: ['Tiếp khách – quà tặng', 'Chi phí hồ sơ – công chứng', 'Vận chuyển tài liệu'], onChange: () => update(), readOnly: ro });
  const files = mountFileField(root.querySelector('[data-cfiles]'), q0.costFiles || []);
  const q1 = quote(qid) || q0; const cls = liveClassesOf(q1); const m0 = contractMoney(q1);
  root.querySelector('[data-rev]').innerHTML = `<dl class="dl"><div><dt>Doanh thu (giá trị hợp đồng)</dt><dd class="num"><b>${esc(moneyD(m0.amount))}</b> ${ro ? '' : `<button type="button" class="btn xs" data-act="quote-sign" data-id="${esc(qid)}">${ic('edit')} Sửa giá trị HĐ</button>`}</dd></div><div><dt>Đã thu</dt><dd class="num">${esc(moneyD(m0.paid))}</dd></div><div><dt>Còn phải thu</dt><dd class="num">${esc(moneyD(m0.remain))}</dd></div><div><dt>Lớp thuộc hợp đồng</dt><dd>${cls.length} lớp</dd></div></dl>`;
  const gvClasses = sum(cls, classGv);
  root.querySelector('[data-gv]').innerHTML = (cls.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Lớp</th><th>Giảng viên</th><th class="r">Thù lao</th><th class="r">Đã trả</th><th class="r">Còn nợ GV</th></tr></thead><tbody>${cls.sort(sortClasses).map((c) => { const fs = classFees(c); return `<tr data-act="class-view" data-id="${esc(c.id)}"><td class="nowrap">${esc(fmtDateRange(c.startDate, c.endDate))}<div class="muted small">${esc(groupsText(c.groups))} · ${money(c.students)} HV</div></td><td class="small">${esc(trainerNames(c.trainerIds)) || '<span class="muted">chưa có</span>'}</td>${moneyCell(classGv(c))}${moneyCell(sum(fs, feePaid))}${moneyCell(Math.max(0, classGv(c) - sum(fs, feePaid)))}</tr>`; }).join('')}</tbody><tfoot><tr><td colspan="2">Tổng thù lao giảng viên</td>${moneyCell(gvClasses)}<td colspan="2"></td></tr></tfoot></table></div>` : '<div class="small muted" style="margin-bottom:6px">Hợp đồng chưa gắn lớp nào trong lịch giảng dạy.</div>')
    + (gvClasses > 0 ? '<div class="small muted" style="margin-top:6px">Thù lao lấy từ các lớp (sửa ở chi tiết từng lớp).</div>' : `<div class="fgrid" style="margin-top:8px">${f('pe-gvest', 'Chi phí giảng viên dự kiến (đ)', moneyInp('pe-gvest', q1.gvEstimate, 'Ước tính khi chưa có thù lao từng lớp'), { hint: 'Tự thay bằng số thực tế khi các lớp có thù lao giảng viên' })}</div>`);
  const otherClasses = sum(cls, (c) => costSum(classOtherCosts(c)));
  root.querySelector('[data-classcosts]').innerHTML = otherClasses ? `Cộng thêm chi phí khác đã nhập ở các lớp: <b>${esc(moneyD(otherClasses))}</b>` : '';
  bindMoney(root);
  if (ro) $$('input, select', root).forEach((el) => (el.disabled = true));
  root.querySelector('#pe-gvest')?.addEventListener('input', () => update());
  function update() {
    const p = contractPnl(draft());
    root.querySelector('[data-sum]').innerHTML = mbox('Doanh thu', money(p.rev), 'hl') + mbox(`Thù lao GV${p.gvEstimated ? ' (ước tính)' : ''}`, money(p.gv)) + mbox('Hoa hồng thực trả', money(p.com.net)) + mbox('Thuế khấu trừ hoa hồng', money(p.com.tax))
      + mbox('Chi phí khác', money(p.other)) + mbox('Tổng chi phí', money(p.cost)) + mbox('Lợi nhuận', money(p.profit), p.profit < 0 ? 'neg' : 'pos') + mbox('Tỷ suất lợi nhuận', p.rev ? pct(p.margin) : '—', p.profit < 0 ? 'neg' : 'pos');
  }
  update();
  if (!ro) {
    const snap = JSON.stringify({ c: com.value(), o: costs.value(), g: draft().gvEstimate });
    m.guard = formGuard(() => JSON.stringify({ c: com.value(), o: costs.value(), g: draft().gvEstimate }) !== snap || files.dirty(), [files]);
    root.querySelector('[data-cancel]').onclick = () => m.tryClose();
    root.querySelector('[data-save]').onclick = async (ev) => {
      const d = draft(); const cur = quote(qid) || q0;
      const rec = { ...cur, commissions: d.commissions, otherCosts: d.otherCosts, gvEstimate: d.gvEstimate || null, costFiles: files.value() };
      ev.target.disabled = true;
      try { await Store.save('quotes', rec, `Chi phí & lợi nhuận – ${cur.contractNo || cur.no} – ${cur.customerName}`, 'Cập nhật'); files.commit(); m.guard = null; m.close(); toast('Đã lưu chi phí – lợi nhuận được tính lại.', 'ok'); } catch (e) { ev.target.disabled = false; }
    };
  }
}

function quoteDetail(id) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; render();
  function render() {
    const q = quote(id); if (!q) { m.close(); return; }
    const qm = quoteMoney(q); const cm = contractMoney(q); const cls = quoteClasses(q).sort(sortClasses); const cu = customer(q.customerId);
    const signed = isContract(q); const cs = signed ? contractState(q) : null; const P = contractPnl(q);
    m.el.querySelector('.modal-h h2').textContent = `${signed ? 'Hợp đồng' : 'Báo giá'} ${signed && q.contractNo ? q.contractNo : q.no || ''} – ${q.customerName}`;
    m.body.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap">${quotePill(q)}${cs ? pill(cs.label, cs.tone) : ''}</div>
      <dl class="dl"><div><dt>Khách hàng</dt><dd>${cu ? `<a href="#" data-act="customer-view" data-id="${esc(cu.id)}">${esc(cu.name)}</a>` : esc(q.customerName)}${cu?.taxCode ? `<div class="muted small">MST ${esc(cu.taxCode)}</div>` : ''}</dd></div>
        <div><dt>Người liên hệ</dt><dd>${q.contact ? esc(q.contact) : notSet()} ${q.contactPhone ? phoneLink(q.contactPhone) : ''}</dd></div>
        <div><dt>Số báo giá · ngày</dt><dd>${esc(q.no || '—')} · ${esc(fmtD(q.date))}${q.validUntil ? `<div class="muted small">hiệu lực đến ${esc(fmtD(q.validUntil))}</div>` : ''}</dd></div>
        <div><dt>Nội dung</dt><dd>${esc([groupsText(q.groups), q.students ? q.students + ' học viên' : '', q.classCount ? q.classCount + ' lớp' : ''].filter(Boolean).join(' · ')) || notSet()}</dd></div>
        <div><dt>Giá trị báo giá</dt><dd class="num">${qm.amount ? esc(moneyD(qm.amount)) : notSet('Chưa có tổng giá trị – bấm Sửa để nhập')}</dd></div>
        <div><dt>Người phụ trách</dt><dd>${q.owner ? esc(q.owner) : notSet()}</dd></div></dl>
      <div><div class="sec-title">File báo giá</div>${filesBlock(q.quoteFiles, 'Chưa tải file báo giá')}</div>
      <div><div class="sec-title">Hợp đồng ${signed ? '' : '<span class="muted" style="text-transform:none;letter-spacing:0;font-weight:500">– chưa ký</span>'}<span class="actions edit-only">${signed ? '' : `<button type="button" class="btn xs" data-x="sign">${ic('sign')} Ghi nhận ký hợp đồng</button>`}</span></div>
        ${signed ? `<dl class="dl" style="margin-bottom:10px"><div><dt>Số hợp đồng</dt><dd>${q.contractNo ? esc(q.contractNo) : notSet()}</dd></div><div><dt>Ngày ký</dt><dd>${esc(fmtD(q.contractDate) || '—')}</dd></div>
          <div><dt>Giá trị hợp đồng</dt><dd class="num">${esc(moneyD(cm.total))}</dd></div><div><dt>Hạn thanh toán</dt><dd>${q.paymentDue ? esc(fmtD(q.paymentDue)) : notSet()}</dd></div></dl>` : ''}
        ${filesBlock(q.contractFiles, 'Chưa tải file hợp đồng')}</div>
      ${signed ? `<div><div class="sec-title">Thanh toán của khách<span class="actions edit-only"><button type="button" class="btn xs" data-x="pay">${ic('money')} Ghi nhận thanh toán</button></span></div>
        <div class="money-box" style="margin-bottom:10px">${mbox('Giá trị hợp đồng', money(cm.total))}${mbox('Đã thu', money(cm.paid), 'pos')}${mbox('Còn phải thu', money(cm.remain), cm.remain > 0 ? 'hl' : 'pos')}</div>
        ${(q.payments || []).length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ngày</th><th class="r">Số tiền</th><th>Nội dung</th><th></th></tr></thead><tbody>${q.payments.slice().sort((a, b) => a.date.localeCompare(b.date)).map((p) => `<tr style="cursor:default"><td class="num">${esc(fmtD(p.date))}</td>${moneyCell(p.amount)}<td>${esc(p.note || '')}</td><td class="r"><button type="button" class="btn xs ghost edit-only" data-pdel="${esc(p.id)}" aria-label="Xóa lần thu">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="muted small">Chưa có lần thu nào.</div>'}</div>` : ''}
      <div><div class="sec-title">${signed ? 'Chi phí &amp; lợi nhuận' : 'Lợi nhuận dự kiến'}<span class="actions"><button type="button" class="btn xs" data-act="pnl-view" data-id="${esc(q.id)}">${ic('trend')} ${S.role.canEdit ? 'Nhập hoa hồng, chi phí' : 'Xem chi tiết'}</button></span></div>
        <div class="money-box cols-5">${mbox('Doanh thu', money(P.rev), 'hl')}${mbox(`Thù lao GV${P.gvEstimated ? ' (ước tính)' : ''}`, money(P.gv))}${mbox('Hoa hồng (gồm thuế)', money(P.com.gross), '', P.com.gross ? `thực trả ${money(P.com.net)} · thuế ${money(P.com.tax)}` : '')}${mbox('Chi phí khác', money(P.other))}${mbox(`Lợi nhuận${P.rev ? ` (${pct(P.margin)})` : ''}`, money(P.profit), P.profit < 0 ? 'neg' : 'pos')}</div>
        ${P.notes.length ? `<div class="small" style="color:var(--warn);margin-top:6px">${esc(P.notes.join(' · '))}</div>` : ''}</div>
      <div><div class="sec-title">Lớp học theo ${signed ? 'hợp đồng' : 'báo giá'} (${cls.length})<span class="actions edit-only"><button type="button" class="btn xs" data-x="newclass">${ic('plus')} Lên lịch lớp</button></span></div>
        ${cls.length ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${cls.map(classLi).join('')}</ul>` : '<div class="muted small">Chưa có lớp nào gắn với hồ sơ này.</div>'}</div>
      ${q.notes ? `<div><div class="sec-title">Ghi chú</div><div style="white-space:pre-wrap">${esc(q.notes)}</div></div>` : ''}`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(q)}<span class="sp"></span><span class="edit-only" style="display:flex;gap:8px"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa</button><button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa</button></span>`;
    const on = (sel, fn) => m.el.querySelector(sel)?.addEventListener('click', fn);
    on('[data-x=del]', async () => { if (await deleteQuote(q)) m.close(); });
    on('[data-x=edit]', () => { m.close(); quoteForm(q); });
    on('[data-x=sign]', () => { m.close(); quoteForm(q, { focusContract: true }); });
    on('[data-x=pay]', () => paymentForm(q));
    on('[data-x=newclass]', () => { m.close(); classForm(null, { from: { customerName: q.customerName, customerId: q.customerId, quoteId: q.id, groups: q.groups || [], contact: q.contact, contactPhone: q.contactPhone, region: customer(q.customerId)?.region || regionList()[0]?.id, students: q.students && q.classCount ? Math.ceil(q.students / q.classCount) : '', status: 'confirmed', priceMode: 'auto' } }); });
    $$('[data-pdel]', m.el).forEach((b) => b.addEventListener('click', async () => {
      if (!(await confirmBox('Xóa lần thu tiền này?', { ok: 'Xóa', danger: true }))) return;
      const cur = quote(q.id); await Store.save('quotes', { ...cur, payments: (cur.payments || []).filter((p) => p.id !== b.dataset.pdel) }, `Xóa lần thu – ${q.customerName}`, 'Cập nhật').catch(() => {});
    }));
    hydrate(m.el); fillNames(m.el);
  }
}

/* ======================= KHÁCH HÀNG ======================= */
function customerForm(existing) {
  if (!S.role.canEdit) return;
  const c = existing ? clone(existing) : { region: regionList()[0]?.id };
  const m = openModal({
    title: existing ? 'Sửa thông tin khách hàng' : 'Thêm khách hàng', size: '',
    body: `<form id="uf" novalidate autocomplete="off"><div class="fgrid">
      ${f('uf-name', 'Tên công ty', inp('uf-name', c.name, 'required placeholder="Tên đầy đủ theo đăng ký kinh doanh"'), { cls: 'full', req: true })}
      ${f('uf-tax', 'Mã số thuế', inp('uf-tax', c.taxCode, 'placeholder="MST doanh nghiệp"'))}
      ${f('uf-region', 'Vùng', `<select class="input" id="uf-region">${opt('', '— Chọn vùng —', !c.region)}${regionList().map((r) => opt(r.id, r.name, c.region === r.id)).join('')}</select>`)}
      ${f('uf-industry', 'Ngành nghề', inp('uf-industry', c.industry, 'placeholder="VD: Đóng tàu, cảng biển, xây dựng…"'))}
      ${f('uf-address', 'Địa chỉ', inp('uf-address', c.address, 'placeholder="Địa chỉ trụ sở / nhà máy"'), { cls: 'full' })}
      ${f('uf-contact', 'Người liên hệ', inp('uf-contact', c.contact, 'placeholder="Họ tên, chức vụ"'))}
      ${f('uf-phone', 'Số điện thoại', inp('uf-phone', c.phone, 'inputmode="tel" placeholder="Số điện thoại"'))}
      ${f('uf-email', 'Email', inp('uf-email', c.email, 'type="email" placeholder="email@congty.vn"'))}
      ${f('uf-notes', 'Ghi chú', `<textarea class="input" id="uf-notes" rows="2" placeholder="Đặc thù ngành nghề, lịch huấn luyện định kỳ mong muốn…">${esc(c.notes || '')}</textarea>`, { cls: 'full' })}
    </div></form>`,
    foot: `${existing ? `<button type="button" class="btn danger" data-del>${ic('trash')} Xóa</button>` : ''}<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu</button>`,
  });
  const root = m.el;
  const read = () => ({ name: val(root, 'uf-name'), taxCode: val(root, 'uf-tax'), region: val(root, 'uf-region'), industry: val(root, 'uf-industry'), address: val(root, 'uf-address'), contact: val(root, 'uf-contact'), phone: val(root, 'uf-phone'), email: val(root, 'uf-email'), notes: val(root, 'uf-notes') });
  const snap = JSON.stringify(read());
  m.guard = formGuard(() => JSON.stringify(read()) !== snap, []);
  root.querySelector('[data-cancel]').onclick = () => m.tryClose();
  root.querySelector('[data-del]')?.addEventListener('click', async () => { if (await deleteCustomer(existing)) { m.guard = null; m.close(); } });
  root.querySelector('[data-save]').onclick = async (ev) => {
    const d = read();
    if (!d.name) { toast('Cần nhập tên công ty.', 'bad'); return; }
    const dup = findCustomerByName(d.name);
    if (dup && dup.id !== existing?.id) { toast(`Đã có khách hàng “${dup.name}”.`, 'bad'); return; }
    ev.target.disabled = true;
    try {
      const rec = await Store.save('customers', { ...(existing || {}), ...d }, d.name);
      if (existing && existing.name !== d.name) {
        for (const c2 of S.classes.filter((x) => x.customerId === rec.id)) await Store.save('classes', { ...c2, customerName: d.name });
        for (const q2 of S.quotes.filter((x) => x.customerId === rec.id)) await Store.save('quotes', { ...q2, customerName: d.name });
        for (const r2 of S.rosters.filter((x) => x.customerId === rec.id)) await Store.save('rosters', { ...r2, customerName: d.name });
      }
      m.guard = null; m.close(); toast('Đã lưu khách hàng.', 'ok');
    } catch (e) { ev.target.disabled = false; }
  };
}

async function deleteCustomer(c) {
  if (!c) return false;
  const n = S.classes.filter((x) => x.customerId === c.id).length + S.quotes.filter((x) => x.customerId === c.id).length + S.rosters.filter((x) => x.customerId === c.id).length;
  if (n) { toast(`Không xóa được: ${c.name} đang có ${n} lớp/báo giá/đợt cấp liên quan.`, 'bad'); return false; }
  if (!(await confirmBox(`Xóa khách hàng <b>${esc(c.name)}</b>?`, { ok: 'Xóa', danger: true }))) return false;
  try { await Store.remove('customers', c, c.name); toast('Đã xóa khách hàng.', 'ok'); return true; } catch (e) { return false; }
}

function customerDetail(id) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; render();
  function render() {
    const c = customer(id); if (!c) { m.close(); return; }
    const st = customerStats(c.id); const dues = customerDues(c.id);
    const cls = S.classes.filter((x) => x.customerId === c.id).sort(sortClasses).reverse();
    const qs = S.quotes.filter((x) => x.customerId === c.id).sort((a, b) => (b.date || '').localeCompare(a.date || ''));
    const batches = batchesOf().filter((b) => b.r.customerId === c.id);
    m.el.querySelector('.modal-h h2').textContent = c.name;
    m.body.innerHTML = `<dl class="dl"><div><dt>Mã số thuế</dt><dd>${c.taxCode ? esc(c.taxCode) : notSet()}</dd></div><div><dt>Vùng</dt><dd>${c.region ? rtag(c.region) : notSet()}</dd></div><div><dt>Ngành nghề</dt><dd>${c.industry ? esc(c.industry) : notSet()}</dd></div>
        <div><dt>Người liên hệ</dt><dd>${c.contact ? esc(c.contact) : notSet()}</dd></div><div><dt>Điện thoại</dt><dd>${c.phone ? phoneLink(c.phone) : notSet()}</dd></div><div><dt>Email</dt><dd>${c.email ? esc(c.email) : notSet()}</dd></div>
        <div class="full"><dt>Địa chỉ</dt><dd>${c.address ? esc(c.address) : notSet()}</dd></div></dl>
      <div class="kpis" style="margin:0"><div class="kpi"><span class="k">Lớp đã tổ chức</span><span class="v">${st.classes}</span><span class="d">${money(st.students)} học viên đã học</span></div><div class="kpi"><span class="k">Thẻ/GCN đã cấp</span><span class="v">${money(st.certified)}</span><span class="d">${batches.length} đợt cấp</span></div>
        <div class="kpi"><span class="k">Doanh thu hợp đồng</span><span class="v">${moneyShort(st.revenue)}</span><span class="d">${st.contracts} hợp đồng</span></div><div class="kpi${st.remain > 0 ? ' hl' : ''}"><span class="k">Còn phải thu</span><span class="v">${moneyShort(st.remain)}</span><span class="d">Đã thu ${esc(moneyD(st.paid))}</span></div></div>
      <div><div class="sec-title">Hạn huấn luyện định kỳ</div>${dues.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nhóm</th><th>Lần gần nhất</th><th>Đến hạn</th><th>Tình trạng</th></tr></thead><tbody>${dues.map((d) => { const t2 = dueTone(d.due); return `<tr style="cursor:default"><td>Nhóm ${d.group}</td><td class="num">${esc(fmtD(d.last))}</td><td class="num">${esc(fmtD(d.due))}</td><td>${pill(t2.text, t2.tone)}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="muted small">Chưa có lớp hoàn thành để tính hạn định kỳ.</div>'}</div>
      <div><div class="sec-title">Học viên đã cấp thẻ/GCN (${money(st.certified)})${st.certified ? `<span class="actions"><button type="button" class="btn xs" data-act="goto-students" data-id="${esc('cid:' + c.id)}">${ic('idcard')} Xem trong tab Học viên</button></span>` : ''}</div>${batches.length ? batches.map((b) => `<button type="button" class="btn sm" data-act="roster-view" data-id="${esc(b.id)}" style="margin:0 6px 6px 0">${esc(b.r.title || 'Đợt cấp')} · ${b.count} HV</button>`).join('') : '<div class="muted small">Chưa có sổ cấp thẻ/GCN.</div>'}</div>
      <div><div class="sec-title">Báo giá &amp; hợp đồng (${qs.length})</div>${qs.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Số</th><th>Ngày</th><th class="r">Giá trị</th><th>Trạng thái</th><th class="r">Lợi nhuận</th><th>File</th></tr></thead><tbody>${qs.map((q) => `<tr data-act="quote-view" data-id="${esc(q.id)}"><td class="strong">${esc(q.no || '')}${q.contractNo ? `<div class="muted small">HĐ ${esc(q.contractNo)}</div>` : ''}</td><td class="num">${esc(fmtD(q.date))}</td>${moneyCell(isContract(q) ? contractValue(q) : quoteMoney(q).amount)}<td>${quotePill(q)}</td><td class="r">${isContract(q) ? money(contractPnl(q).profit) : '—'}</td><td><div class="cell-files">${fileButtons(q.quoteFiles, 'BG')}${fileButtons(q.contractFiles, 'HĐ')}</div></td></tr>`).join('')}</tbody></table></div>` : '<div class="muted small">Chưa có báo giá.</div>'}</div>
      <div><div class="sec-title">Lớp học (${cls.length})</div>${cls.length ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${cls.slice(0, 15).map(classLi).join('')}</ul>` : '<div class="muted small">Chưa có lớp.</div>'}</div>
      ${c.notes ? `<div><div class="sec-title">Ghi chú</div><div style="white-space:pre-wrap">${esc(c.notes)}</div></div>` : ''}`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(c)}<span class="sp"></span><span class="edit-only" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa</button><button type="button" class="btn" data-x="quote">${ic('plus')} Tạo báo giá</button><button type="button" class="btn" data-x="class">${ic('plus')} Lên lịch lớp</button><button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa</button></span>`;
    const on = (sel, fn) => m.el.querySelector(sel)?.addEventListener('click', fn);
    on('[data-x=del]', async () => { if (await deleteCustomer(c)) m.close(); });
    on('[data-x=edit]', () => { m.close(); customerForm(c); });
    on('[data-x=quote]', () => { m.close(); quoteForm(null, { customerName: c.name, customerId: c.id, contact: c.contact, contactPhone: c.phone, groups: dues.filter((d) => daysBetween(todayISO(), d.due) <= (Number(settings().warnDays) || 60)).map((d) => d.group) }); });
    on('[data-x=class]', () => { m.close(); classForm(null, { from: { customerName: c.name, customerId: c.id, contact: c.contact, contactPhone: c.phone, region: c.region || regionList()[0]?.id, status: 'confirmed', priceMode: 'auto' } }); });
    hydrate(m.el); fillNames(m.el);
  }
}
