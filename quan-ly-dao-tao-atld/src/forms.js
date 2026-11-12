/* ============================================================
   FORMS & DETAILS – biểu mẫu nhập liệu và màn hình chi tiết
   ============================================================ */

const opt = (v, label, sel) => `<option value="${esc(v)}"${sel ? ' selected' : ''}>${esc(label)}</option>`;
const val = (root, id) => (root.querySelector('#' + id)?.value ?? '').trim();
const checkedVals = (root, name) => $$(`input[name="${name}"]:checked`, root).map((i) => i.value);
const groupChecks = (name, sel) => `<div class="checks">${Object.entries(GROUPS).map(([g, v]) => `<label title="${esc(v.desc)}"><input type="checkbox" name="${name}" value="${g}"${(sel || []).map(Number).includes(Number(g)) ? ' checked' : ''}> Nhóm ${g}</label>`).join('')}</div>`;
const custList = (id) => `<datalist id="${id}">${S.customers.slice().sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((c) => `<option value="${esc(c.name)}"></option>`).join('')}</datalist>`;
const f = (id, label, input, { cls = '', hint = '', req = false } = {}) => `<div class="f ${cls}"><label for="${id}">${label}${req ? ' <span class="req">*</span>' : ''}</label>${input}${hint ? `<span class="hint" data-hint="${id}">${hint}</span>` : ''}</div>`;
const inp = (id, value, attrs = '') => `<input class="input" id="${id}" value="${esc(value ?? '')}" ${attrs}>`;
const moneyInp = (id, value) => `<input class="input num" id="${id}" data-money inputmode="numeric" value="${value || value === 0 ? money(value) : ''}">`;
const editorStamp = (r) => (r?.updatedAt ? `<span class="muted small">Cập nhật ${esc(fmtStamp(r.updatedAt))}${r.updatedBy ? `<span data-uid="${esc(r.updatedBy)}"></span>` : ''}${r.via === 'claude' ? ' · nhập qua Claude' : ''}</span>` : '');

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

/* ======================= LỚP HỌC ======================= */
function classForm(existing, preset = {}) {
  if (!S.role.canEdit) return;
  const st = settings();
  const d0 = preset.date || S.ui.selDate || todayISO();
  const tr0 = preset.trainerId ? trainer(preset.trainerId) : null;
  const c = existing ? clone(existing) : {
    status: 'confirmed', kind: KINDS[0], groups: [], trainerIds: tr0 ? [tr0.id] : [],
    startDate: d0, endDate: d0, startTime: st.dayStart, endTime: st.dayEnd,
    region: preset.region || tr0?.region || (S.ui.region !== 'all' ? S.ui.region : regionList()[0]?.id),
    students: '', priceMode: 'auto', price: 0, vatRate: st.vatRate, costTrainerMode: 'auto', costTrainer: 0, costTravel: 0, costOther: 0,
    customerName: '', quoteId: null, files: [], ...(preset.from || {}),
  };
  if (!existing && preset.from && preset.from.id) { delete c.id; delete c.createdAt; delete c.updatedAt; c.files = []; c.status = 'planned'; c.certIssued = false; c.invoiced = false; c.passed = ''; }
  const title = existing ? 'Sửa lớp huấn luyện' : preset.from ? 'Nhân bản lớp huấn luyện' : 'Lên lịch lớp huấn luyện';
  const m = openModal({
    title, sub: existing ? esc(classLabel(c)) : 'Các mục có dấu * là bắt buộc', size: 'wide',
    body: `<form id="cf" novalidate autocomplete="off">
      <fieldset class="sec"><legend>Khách hàng &amp; nội dung</legend><div class="fgrid">
        ${f('cf-customer', 'Khách hàng (tên công ty)', inp('cf-customer', c.customerName, 'list="cf-customers" required placeholder="Gõ để chọn công ty đã có hoặc nhập mới"') + custList('cf-customers'), { cls: 'span2', req: true, hint: ' ' })}
        ${f('cf-contact', 'Người liên hệ', inp('cf-contact', c.contact))}
        ${f('cf-cphone', 'SĐT liên hệ', inp('cf-cphone', c.contactPhone, 'inputmode="tel"'))}
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
      <fieldset class="sec"><legend>Giảng viên</legend>
        <div class="toolbar" style="margin:0 0 8px"><span class="small muted grow" data-trhint></span><label class="inline-check small"><input type="checkbox" id="cf-allreg"> Hiện cả giảng viên vùng khác</label></div>
        <div class="picker" data-picker></div><div data-conflict style="margin-top:8px"></div>
      </fieldset>
      <fieldset class="sec"><legend>Học viên &amp; chi phí</legend><div class="fgrid">
        ${f('cf-students', 'Số học viên', inp('cf-students', c.students, 'type="number" min="1" inputmode="numeric" required'), { req: true })}
        ${f('cf-price', 'Đơn giá lớp (chưa VAT, đ)', moneyInp('cf-price', c.price), { cls: 'span2', hint: ' ' })}
        ${f('cf-vat', 'VAT (%)', inp('cf-vat', vatOf(c), 'type="number" min="0" max="20" step="0.5"'))}
        ${f('cf-ctrainer', 'Thù lao giảng viên (đ)', moneyInp('cf-ctrainer', c.costTrainer), { hint: ' ' })}
        ${f('cf-ctravel', 'Đi lại – lưu trú (đ)', moneyInp('cf-ctravel', c.costTravel))}
        ${f('cf-cother', 'Chi phí khác (đ)', moneyInp('cf-cother', c.costOther), { hint: 'Tài liệu, in GCN/thẻ, thuê hội trường…' })}
      </div><div class="money-box" data-moneybox style="margin-top:12px"></div></fieldset>
      <fieldset class="sec"><legend>Hồ sơ &amp; tình trạng</legend><div class="fgrid">
        ${f('cf-status', 'Trạng thái lớp', `<select class="input" id="cf-status">${Object.entries(CLASS_STATUS).map(([k, v]) => opt(k, v.label, c.status === k)).join('')}</select>`)}
        ${f('cf-quote', 'Báo giá / hợp đồng liên quan', '<select class="input" id="cf-quote"></select>', { cls: 'span2', hint: ' ' })}
        ${f('cf-passed', 'Số học viên đạt', inp('cf-passed', c.passed, 'type="number" min="0"'))}
        <div class="f full"><div class="checks"><label><input type="checkbox" id="cf-cert"${c.certIssued ? ' checked' : ''}> Đã cấp GCN / thẻ / ghi sổ theo dõi</label><label><input type="checkbox" id="cf-inv"${c.invoiced ? ' checked' : ''}> Đã xuất hóa đơn</label></div></div>
        ${f('cf-notes', 'Ghi chú', `<textarea class="input" id="cf-notes" rows="2">${esc(c.notes || '')}</textarea>`, { cls: 'full' })}
        <div class="f full"><span class="lbl">Hồ sơ lớp – danh sách học viên, ảnh lớp học, biên bản…</span><div data-files></div></div>
      </div></fieldset></form>`,
    foot: `${existing ? `<button type="button" class="btn danger" data-del>${ic('trash')} Xóa lớp</button>` : ''}<span class="sp"></span>
      <label class="inline-check small hide" data-override><input type="checkbox" id="cf-override"> Vẫn lưu dù trùng lịch</label>
      <button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu lớp</button>`,
  });
  const root = m.el; const form = root.querySelector('#cf');
  const files = mountFileField(root.querySelector('[data-files]'), c.files);
  bindMoney(root);
  let priceMode = c.priceMode || 'manual', ctMode = c.costTrainerMode || 'manual';

  function read() {
    return {
      customerName: val(root, 'cf-customer'), contact: val(root, 'cf-contact'), contactPhone: val(root, 'cf-cphone'), title: val(root, 'cf-title'), kind: val(root, 'cf-kind'),
      groups: checkedVals(root, 'cf-group').map(Number), startDate: val(root, 'cf-from'), endDate: val(root, 'cf-to') || val(root, 'cf-from'),
      startTime: val(root, 'cf-st'), endTime: val(root, 'cf-et'), region: root.querySelector('input[name="cf-region"]:checked')?.value || '', location: val(root, 'cf-location'),
      trainerIds: checkedVals(root, 'cf-tr'), students: Number(val(root, 'cf-students')) || 0, price: parseMoney(val(root, 'cf-price')), priceMode,
      vatRate: val(root, 'cf-vat') === '' ? Number(settings().vatRate) : Number(val(root, 'cf-vat')), costTrainer: parseMoney(val(root, 'cf-ctrainer')), costTrainerMode: ctMode,
      costTravel: parseMoney(val(root, 'cf-ctravel')), costOther: parseMoney(val(root, 'cf-cother')), status: val(root, 'cf-status'), quoteId: val(root, 'cf-quote') || null,
      passed: val(root, 'cf-passed') === '' ? '' : Number(val(root, 'cf-passed')), certIssued: root.querySelector('#cf-cert').checked, invoiced: root.querySelector('#cf-inv').checked, notes: val(root, 'cf-notes'),
    };
  }
  let selected = new Set(c.trainerIds || []);
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
        <span class="s muted" style="display:block">${esc(specs)}${!okGroup ? ' · <span style="color:var(--warn)">chưa đăng ký dạy ' + esc(groupsText(d.groups.filter((g) => !(x.groups || []).includes(g)))) + '</span>' : ''}${x.dailyRate ? ' · ' + esc(moneyShort(x.dailyRate)) + '/ngày' : ''}</span></span></label>`;
    }).join('') : `<div class="empty">${d.region ? 'Vùng này chưa có giảng viên đang hoạt động. Tick “Hiện cả giảng viên vùng khác” hoặc thêm giảng viên.' : 'Chọn vùng đào tạo.'}</div>`;
    hydrate(root.querySelector('[data-picker]'));
  }
  function renderQuotes(d) {
    const sel = root.querySelector('#cf-quote'); const cur = sel.value || c.quoteId || '';
    const qs = S.quotes.filter((q) => norm(q.customerName) === norm(d.customerName) || q.id === cur);
    sel.innerHTML = opt('', qs.length ? '— Chưa gắn báo giá —' : d.customerName ? '— Khách này chưa có báo giá —' : '— Nhập khách hàng trước —', !cur) + qs.map((q) => opt(q.id, `${q.no || 'BG'} · ${fmtD(q.date)} · ${QUOTE_STATUS[q.status]?.label || ''}${q.contractNo ? ' · HĐ ' + q.contractNo : ''}`, q.id === cur)).join('');
    const q = sel.value && quote(sel.value);
    root.querySelector('[data-hint="cf-quote"]').innerHTML = q ? `${fileButtons(q.quoteFiles, 'Xem báo giá')} ${fileButtons(q.contractFiles, 'Xem hợp đồng')}` : 'Gắn để xem nhanh báo giá, hợp đồng từ lịch.';
  }
  function refresh(src) {
    const d = read();
    // customer hint
    const cu = findCustomerByName(d.customerName);
    root.querySelector('[data-hint="cf-customer"]').textContent = !d.customerName ? '' : cu ? `Khách hàng đã có · ${customerStats(cu.id).classes} lớp trước đây` : 'Khách hàng mới – sẽ được thêm vào danh sách khách hàng';
    if (src === 'cf-customer' && cu) {
      if (!val(root, 'cf-contact') && cu.contact) root.querySelector('#cf-contact').value = cu.contact;
      if (!val(root, 'cf-cphone') && cu.phone) root.querySelector('#cf-cphone').value = cu.phone;
      if (cu.region && !existing && !root.querySelector('input[name="cf-region"]:checked')) { const r = root.querySelector(`input[name="cf-region"][value="${cu.region}"]`); if (r) r.checked = true; }
    }
    // duration hint
    const sg = suggestedDays(d.groups, d.kind);
    root.querySelector('[data-hours]').innerHTML = d.groups.length ? `${d.groups.map((g) => `Nhóm ${g}: ${GROUPS[g].desc.toLowerCase()} – cấp ${GROUPS[g].paper}`).join(' · ')}<br>Thời lượng tối thiểu gợi ý: <b>${sg.hrs} giờ ≈ ${sg.days} ngày</b>${d.kind === 'Huấn luyện định kỳ' ? ' (định kỳ ≈ 50% lần đầu)' : ''}${sg.days && d.startDate ? ` <button type="button" class="btn xs" data-act-local="apply-days" data-days="${sg.days}">Đặt ngày kết thúc ${fmtD(addDays(d.startDate, sg.days - 1))}</button>` : ''}` : 'Chọn nhóm để gợi ý thời lượng (số giờ theo Cài đặt).';
    if (src === 'cf-from' && d.endDate < d.startDate) root.querySelector('#cf-to').value = d.startDate;
    const d2 = read();
    const days = classDays(d2);
    root.querySelector('[data-hint="cf-to"]').textContent = d2.endDate < d2.startDate ? 'Ngày kết thúc trước ngày bắt đầu' : `${days} ngày học`;
    selected = new Set(d2.trainerIds.length || src === 'picker' ? d2.trainerIds : [...selected]);
    renderPicker(d2);
    // conflicts
    const tmp = { ...d2, id: existing?.id || '__new', trainerIds: [...selected] };
    const cx = conflictsFor(tmp);
    root.querySelector('[data-conflict]').innerHTML = cx.length ? `<div class="banner warn" style="margin:0"><b>Trùng lịch:</b>&nbsp;${esc(cx.map((x) => `${trainerNames(x.trainers)} đang dạy ${classLabel(x.cls)} (${fmtDateRange(x.cls.startDate, x.cls.endDate)} ${x.cls.startTime || ''}–${x.cls.endTime || ''})`).join('; '))}</div>` : '';
    root.querySelector('[data-override]').classList.toggle('hide', !cx.length);
    // price
    const tier = tierFor(d2.students);
    if (priceMode === 'auto' && src !== 'cf-price') { const p = tier ? tier.price : 0; root.querySelector('#cf-price').value = p ? money(p) : ''; }
    const pNow = parseMoney(val(root, 'cf-price'));
    root.querySelector('[data-hint="cf-price"]').innerHTML = `${esc(tierText(d2.students))}${tier && pNow !== tier.price ? ` · <b style="color:var(--accent)">Giá điều chỉnh</b> <button type="button" class="btn xs" data-act-local="price-auto">Dùng giá bảng</button>` : ''}`;
    // trainer cost
    const auto = trainerCostAuto([...selected], days);
    if (ctMode === 'auto' && src !== 'cf-ctrainer') root.querySelector('#cf-ctrainer').value = auto ? money(auto) : '';
    const ctNow = parseMoney(val(root, 'cf-ctrainer'));
    root.querySelector('[data-hint="cf-ctrainer"]').innerHTML = auto ? `Theo thù lao/ngày: ${esc(money(auto))}${ctNow !== auto ? ` <button type="button" class="btn xs" data-act-local="ct-auto">Tính lại</button>` : ''}` : 'Nhập thù lao/ngày cho giảng viên để tự tính';
    const mm = classMoney({ ...read(), status: 'confirmed' });
    root.querySelector('[data-moneybox]').innerHTML = `<div class="m"><div class="k">Doanh thu (chưa VAT)</div><div class="v">${money(mm.rev)}</div></div><div class="m"><div class="k">VAT</div><div class="v">${money(mm.vat)}</div></div><div class="m hl"><div class="k">Khách thanh toán</div><div class="v">${money(mm.total)}</div></div><div class="m"><div class="k">Tổng chi phí</div><div class="v">${money(mm.cost)}</div></div><div class="m ${mm.profit < 0 ? 'neg' : 'pos'}"><div class="k">Lãi gộp${mm.rev ? ` (${Math.round(mm.margin * 100)}%)` : ''}</div><div class="v">${money(mm.profit)}</div></div>`;
    if (src === 'cf-customer' || src === 'init' || src === 'cf-quote') renderQuotes(d2);
    if (src === 'cf-quote') {
      const q = quote(val(root, 'cf-quote'));
      if (q && !d2.groups.length && (q.groups || []).length) { q.groups.forEach((g) => { const cb = root.querySelector(`input[name="cf-group"][value="${g}"]`); if (cb) cb.checked = true; }); refresh('groups'); }
    }
  }
  form.addEventListener('input', (e) => {
    const id = e.target.id || e.target.name;
    if (id === 'cf-price') priceMode = 'manual';
    if (id === 'cf-ctrainer') ctMode = 'manual';
    if (['cf-notes', 'cf-title', 'cf-location', 'cf-contact', 'cf-cphone', 'cf-passed'].includes(id)) return;
    refresh(e.target.name === 'cf-tr' ? 'picker' : id);
  });
  form.addEventListener('change', (e) => { if (e.target.type === 'radio' || e.target.type === 'checkbox' || e.target.tagName === 'SELECT') refresh(e.target.name === 'cf-tr' ? 'picker' : e.target.id || e.target.name); });
  root.addEventListener('click', (e) => {
    const b = e.target.closest('[data-act-local]'); if (!b) return;
    if (b.dataset.actLocal === 'apply-days') { root.querySelector('#cf-to').value = addDays(val(root, 'cf-from'), Number(b.dataset.days) - 1); refresh('cf-to'); }
    if (b.dataset.actLocal === 'price-auto') { priceMode = 'auto'; refresh('price-auto'); }
    if (b.dataset.actLocal === 'ct-auto') { ctMode = 'auto'; refresh('ct-auto'); }
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
      const cu = await ensureCustomer(d.customerName, { contact: d.contact, phone: d.contactPhone, region: d.region, address: '' });
      const rec = { ...(existing || {}), ...d, customerId: cu.id, customerName: cu.name, files: files.value() };
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
  if (!(await confirmBox(`Xóa lớp <b>${esc(classLabel(c))}</b> (${esc(fmtDateRange(c.startDate, c.endDate))})? Các file hồ sơ lớp cũng bị xóa.`, { ok: 'Xóa lớp', danger: true }))) return false;
  try { await Store.remove('classes', c, `${classLabel(c)} – ${fmtDateRange(c.startDate, c.endDate)}`); (c.files || []).forEach((x) => Store.backend.delFile(x)); toast('Đã xóa lớp.', 'ok'); return true; } catch (e) { return false; }
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
    const cx = conflictsFor(c); const mm = classMoney(c); const q = c.quoteId && quote(c.quoteId); const cu = customer(c.customerId);
    m.el.querySelector('.modal-h h2').textContent = classLabel(c);
    m.el.querySelector('.modal-h .grow').querySelector('.sub')?.remove();
    m.el.querySelector('.modal-h .grow').insertAdjacentHTML('beforeend', `<div class="sub">${esc(fmtDateRange(c.startDate, c.endDate))} · ${esc(c.startTime || '')}–${esc(c.endTime || '')} · ${esc(regionName(c.region))}</div>`);
    m.body.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap">${classPill(c)}${rtag(c.region)}${cx.length ? pill('Trùng lịch giảng viên', 'bad') : ''}${c.certIssued ? pill('Đã cấp GCN/thẻ', 'ok') : ''}${c.invoiced ? pill('Đã xuất hóa đơn', 'ok') : ''}</div>
      ${cx.length ? `<div class="banner warn" style="margin:0">${esc(cx.map((x) => `${trainerNames(x.trainers)} cũng dạy ${classLabel(x.cls)} (${fmtDateRange(x.cls.startDate, x.cls.endDate)} ${x.cls.startTime || ''}–${x.cls.endTime || ''})`).join('; '))}</div>` : ''}
      <dl class="dl">
        <div><dt>Khách hàng</dt><dd>${cu ? `<a href="#" data-act="customer-view" data-id="${esc(cu.id)}">${esc(cu.name)}</a>` : esc(c.customerName)}</dd></div>
        <div><dt>Người liên hệ</dt><dd>${esc(c.contact || '—')} ${c.contactPhone ? phoneLink(c.contactPhone) : ''}</dd></div>
        <div><dt>Thời gian</dt><dd>${esc(fmtDateRange(c.startDate, c.endDate))} (${classDays(c)} ngày) · ${esc(c.startTime || '')}–${esc(c.endTime || '')}</dd></div>
        <div><dt>Địa điểm</dt><dd>${esc(c.location || '—')}</dd></div>
        <div><dt>Hình thức</dt><dd>${esc(c.kind || '—')}${c.title ? ' · ' + esc(c.title) : ''}</dd></div>
        <div><dt>Nhóm huấn luyện</dt><dd>${(c.groups || []).length ? c.groups.slice().sort().map((g) => `Nhóm ${g} <span class="muted small">(${esc(GROUPS[g].paper)})</span>`).join(', ') : '—'}</dd></div>
        <div><dt>Số học viên</dt><dd class="num">${money(c.students)}${c.status === 'done' && c.passed !== '' && c.passed !== undefined ? ` · đạt ${money(c.passed)}` : ''}</dd></div>
      </dl>
      <div><div class="sec-title">Giảng viên</div>${(c.trainerIds || []).length ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${c.trainerIds.map((tid) => { const x = trainer(tid); return x ? `<li class="clickable" data-act="trainer-view" data-id="${esc(x.id)}">${avatar(x)}<div class="grow"><div class="t">${esc(x.name)}</div><div class="s">${esc(regionName(x.region))} · ${esc((x.specialties || []).slice(0, 3).join(', '))}</div></div><div>${phoneLink(x.phone)}</div></li>` : '<li class="muted">Giảng viên đã bị xóa</li>'; }).join('')}</ul>` : '<div class="banner warn" style="margin:0">Chưa phân công giảng viên</div>'}</div>
      <div><div class="sec-title">Chi phí &amp; doanh thu</div><div class="money-box cols-4">
        <div class="m"><div class="k">Đơn giá lớp (chưa VAT)</div><div class="v">${money(c.price)}</div></div><div class="m"><div class="k">VAT ${vatOf(c)}%</div><div class="v">${money(mm.vat)}</div></div><div class="m hl"><div class="k">Khách thanh toán</div><div class="v">${money(mm.total)}</div></div>
        <div class="m ${mm.profit < 0 ? 'neg' : 'pos'}"><div class="k">Lãi gộp${mm.rev ? ` (${Math.round(mm.margin * 100)}%)` : ''}</div><div class="v">${money(mm.profit)}</div></div>
        <div class="m"><div class="k">Thù lao giảng viên</div><div class="v">${money(c.costTrainer)}</div></div><div class="m"><div class="k">Đi lại – lưu trú</div><div class="v">${money(c.costTravel)}</div></div><div class="m"><div class="k">Chi phí khác</div><div class="v">${money(c.costOther)}</div></div>
        <div class="m"><div class="k">Tổng chi phí</div><div class="v">${money(mm.cost)}</div></div></div>
        ${c.priceMode === 'manual' && tierFor(c.students) && tierFor(c.students).price !== c.price ? `<div class="small muted" style="margin-top:6px">Giá điều chỉnh so với bảng giá (${esc(moneyD(tierFor(c.students).price))}).</div>` : ''}</div>
      <div><div class="sec-title">Báo giá &amp; hợp đồng</div>${q ? `<div class="file" style="flex-wrap:wrap"><span class="fn"><b>${esc(q.no || 'Báo giá')} · ${esc(q.customerName)}</b><span>${esc(QUOTE_STATUS[q.status]?.label || '')}${q.contractNo ? ' · HĐ số ' + esc(q.contractNo) : ''}</span></span>
        ${fileButtons(q.quoteFiles, 'Xem báo giá')} ${fileButtons(q.contractFiles, 'Xem hợp đồng')} <button type="button" class="btn xs" data-act="quote-view" data-id="${esc(q.id)}">Mở hồ sơ</button></div>` : `<div class="muted small">Chưa gắn báo giá / hợp đồng.</div>`}</div>
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

/* ======================= GIẢNG VIÊN ======================= */
function trainerForm(existing) {
  if (!S.role.canEdit) return;
  const x = existing ? clone(existing) : { region: S.ui.trRegion && S.ui.trRegion !== 'all' ? S.ui.trRegion : regionList()[0]?.id, otherRegions: [], specialties: [], groups: [], status: 'active', employment: EMPLOYMENT[1], files: [] };
  const specs = uniq([...(settings().specialties || []), ...(x.specialties || [])]);
  const m = openModal({
    title: existing ? 'Sửa thông tin giảng viên' : 'Thêm giảng viên', sub: existing ? esc(x.name) : 'Các mục có dấu * là bắt buộc', size: 'wide',
    body: `<form id="tf" novalidate autocomplete="off">
      <fieldset class="sec"><legend>Thông tin cá nhân</legend><div style="display:flex;gap:18px;flex-wrap:wrap;align-items:flex-start"><div data-photo></div><div class="fgrid grow" style="min-width:240px">
        ${f('tf-name', 'Họ và tên', inp('tf-name', x.name, 'required'), { req: true, cls: 'span2' })}
        ${f('tf-phone', 'Số điện thoại', inp('tf-phone', x.phone, 'inputmode="tel" required'), { req: true, hint: ' ' })}
        ${f('tf-email', 'Email', inp('tf-email', x.email, 'type="email"'))}
        ${f('tf-birth', 'Năm sinh', inp('tf-birth', x.birthYear, 'type="number" min="1940" max="2010"'))}
        ${f('tf-address', 'Địa chỉ', inp('tf-address', x.address), { cls: 'span2' })}
      </div></div></fieldset>
      <fieldset class="sec"><legend>Vùng &amp; chuyên môn</legend><div class="fgrid">
        ${f('tf-region', 'Vùng đào tạo chính', `<select class="input" id="tf-region">${regionList().map((r) => opt(r.id, `${r.name} (${r.center})`, x.region === r.id)).join('')}</select>`, { req: true })}
        <div class="f span2"><span class="lbl">Có thể hỗ trợ thêm vùng</span><div class="checks">${regionList().map((r) => `<label><input type="checkbox" name="tf-oreg" value="${esc(r.id)}"${(x.otherRegions || []).includes(r.id) ? ' checked' : ''}> ${esc(r.name)}</label>`).join('')}</div></div>
        <div class="f full"><span class="lbl">Chuyên ngành đào tạo</span><div class="checks">${specs.map((s) => `<label><input type="checkbox" name="tf-spec" value="${esc(s)}"${(x.specialties || []).includes(s) ? ' checked' : ''}> ${esc(s)}</label>`).join('')}</div></div>
        ${f('tf-spec-more', 'Chuyên ngành khác', inp('tf-spec-more', '', 'placeholder="Ghi thêm, cách nhau bằng dấu phẩy"'), { cls: 'full' })}
        <div class="f full"><span class="lbl">Nhóm huấn luyện được dạy</span>${groupChecks('tf-group', x.groups)}</div>
        ${f('tf-degree', 'Trình độ chuyên môn', inp('tf-degree', x.degree, 'placeholder="VD: Kỹ sư điện, Thạc sĩ BHLĐ"'), { cls: 'span2' })}
        ${f('tf-exp', 'Số năm kinh nghiệm', inp('tf-exp', x.experience, 'type="number" min="0"'))}
        ${f('tf-certno', 'Số chứng chỉ / quyết định giảng viên', inp('tf-certno', x.certNo))}
        ${f('tf-certexp', 'Hạn chứng chỉ', inp('tf-certexp', x.certExpiry, 'type="date"'), { hint: 'Công cụ sẽ nhắc trước khi hết hạn' })}
      </div></fieldset>
      <fieldset class="sec"><legend>Hợp tác</legend><div class="fgrid">
        ${f('tf-emp', 'Hình thức', `<select class="input" id="tf-emp">${EMPLOYMENT.map((e) => opt(e, e, x.employment === e)).join('')}</select>`)}
        ${f('tf-rate', 'Thù lao / ngày dạy (đ)', moneyInp('tf-rate', x.dailyRate), { hint: 'Dùng để tự tính chi phí giảng viên của lớp' })}
        ${f('tf-status', 'Trạng thái', `<select class="input" id="tf-status">${opt('active', 'Đang hoạt động', x.status !== 'paused')}${opt('paused', 'Tạm ngưng (không hiện khi xếp lịch)', x.status === 'paused')}</select>`)}
        ${f('tf-notes', 'Ghi chú', `<textarea class="input" id="tf-notes" rows="2">${esc(x.notes || '')}</textarea>`, { cls: 'full' })}
        <div class="f full"><span class="lbl">Hồ sơ đính kèm – CV, bằng cấp, chứng chỉ</span><div data-files></div></div>
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
    employment: val(root, 'tf-emp'), dailyRate: parseMoney(val(root, 'tf-rate')), status: val(root, 'tf-status'), notes: val(root, 'tf-notes'),
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
  const used = S.classes.filter((c) => (c.trainerIds || []).includes(x.id));
  if (used.length) { toast(`Không xóa được: ${x.name} đã có ${used.length} lớp trong lịch. Hãy chuyển trạng thái “Tạm ngưng” để giữ lịch sử.`, 'bad'); return false; }
  if (!(await confirmBox(`Xóa giảng viên <b>${esc(x.name)}</b> cùng ảnh và hồ sơ đính kèm?`, { ok: 'Xóa giảng viên', danger: true }))) return false;
  try { await Store.remove('trainers', x, x.name); [x.photo, ...(x.files || [])].filter(Boolean).forEach((f2) => Store.backend.delFile(f2)); toast('Đã xóa giảng viên.', 'ok'); return true; } catch (e) { return false; }
}

function trainerDetail(id) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; render();
  function render() {
    const x = trainer(id); if (!x) { m.close(); return; }
    const t = todayISO(); const ym = t.slice(0, 7); const load = trainerMonthLoad(x.id, ym);
    const mine = S.classes.filter((c) => (c.trainerIds || []).includes(x.id) && c.status !== 'cancelled').sort(sortClasses);
    const up = mine.filter((c) => (c.endDate || c.startDate) >= t); const past = mine.filter((c) => (c.endDate || c.startDate) < t).reverse();
    const done = mine.filter((c) => c.status === 'done');
    const cert = x.certExpiry ? dueTone(x.certExpiry) : null;
    m.el.querySelector('.modal-h h2').textContent = x.name;
    m.body.innerHTML = `<div class="detail-top">${photo(x, 'lg')}<div class="grow" style="min-width:240px;display:flex;flex-direction:column;gap:10px">
      <div style="display:flex;gap:6px;flex-wrap:wrap">${rtag(x.region)}${x.status === 'paused' ? pill('Tạm ngưng', 'muted') : pill('Đang hoạt động', 'ok')}${x.employment ? pill(x.employment, 'info') : ''}${cert ? pill('Chứng chỉ: ' + cert.text, cert.tone) : ''}</div>
      <dl class="dl"><div><dt>Điện thoại</dt><dd>${phoneLink(x.phone)}</dd></div><div><dt>Email</dt><dd>${esc(x.email || '—')}</dd></div><div><dt>Năm sinh</dt><dd>${esc(x.birthYear || '—')}</dd></div>
      <div><dt>Vùng hỗ trợ thêm</dt><dd>${esc((x.otherRegions || []).map(regionName).join(', ') || '—')}</dd></div><div><dt>Trình độ</dt><dd>${esc(x.degree || '—')}${x.experience ? ` · ${esc(x.experience)} năm kinh nghiệm` : ''}</dd></div>
      <div><dt>Chứng chỉ giảng viên</dt><dd>${esc(x.certNo || '—')}${x.certExpiry ? ` · hạn ${esc(fmtD(x.certExpiry))}` : ''}</dd></div><div><dt>Thù lao / ngày</dt><dd>${x.dailyRate ? esc(moneyD(x.dailyRate)) : '—'}</dd></div>
      <div class="full"><dt>Địa chỉ</dt><dd>${esc(x.address || '—')}</dd></div></dl></div></div>
      <div><div class="sec-title">Chuyên ngành &amp; nhóm được dạy</div><div style="display:flex;gap:6px;flex-wrap:wrap">${(x.specialties || []).map((s) => `<span class="tag">${esc(s)}</span>`).join('') || '<span class="muted small">Chưa nhập chuyên ngành</span>'}</div>
        <div class="small" style="margin-top:6px">${(x.groups || []).length ? x.groups.slice().sort().map((g) => `Nhóm ${g}: ${esc(GROUPS[g].desc)}`).join('<br>') : '<span class="muted">Chưa chọn nhóm được dạy</span>'}</div></div>
      <div class="kpis" style="margin:0"><div class="kpi"><span class="k">Tháng ${Number(ym.slice(5))}</span><span class="v">${load.days} <small>ngày dạy</small></span><span class="d">${load.classes.length} lớp</span></div>
        <div class="kpi"><span class="k">Đã dạy</span><span class="v">${done.length} <small>lớp</small></span><span class="d">${money(sum(done, (c) => c.students))} học viên</span></div>
        <div class="kpi"><span class="k">Sắp tới</span><span class="v">${up.length} <small>lớp</small></span><span class="d">${up[0] ? 'Gần nhất ' + esc(fmtD(up[0].startDate)) : 'Chưa có lịch'}</span></div></div>
      <div><div class="sec-title">Lịch sắp tới</div>${up.length ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${up.slice(0, 12).map(classLi).join('')}</ul>` : '<div class="muted small">Chưa có lớp sắp tới.</div>'}</div>
      ${past.length ? `<div><div class="sec-title">Đã dạy gần đây</div><ul class="list" style="border:1px solid var(--line);border-radius:10px">${past.slice(0, 6).map(classLi).join('')}</ul></div>` : ''}
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
  const st = settings(); const today = todayISO();
  const q = existing ? clone(existing) : { date: today, validUntil: addDays(today, 30), status: 'draft', groups: [], classCount: 1, priceMode: 'auto', amountMode: 'auto', vatRate: st.vatRate, quoteFiles: [], contractFiles: [], payments: [], ...preset };
  const cu0 = q.customerId ? customer(q.customerId) : findCustomerByName(q.customerName);
  const m = openModal({
    title: existing ? `Sửa báo giá ${esc(q.no || '')}` : 'Thêm báo giá', sub: 'Khi khách ký, điền mục Hợp đồng – hồ sơ sẽ hiện trong danh sách Hợp đồng', size: 'wide',
    body: `<form id="qf" novalidate autocomplete="off">
      <fieldset class="sec"><legend>Khách hàng</legend><div class="fgrid">
        ${f('qf-customer', 'Tên công ty khách hàng', inp('qf-customer', q.customerName, 'list="qf-customers" required') + custList('qf-customers'), { cls: 'span2', req: true, hint: ' ' })}
        ${f('qf-tax', 'Mã số thuế', inp('qf-tax', cu0?.taxCode))}
        ${f('qf-address', 'Địa chỉ', inp('qf-address', cu0?.address), { cls: 'span2' })}
        ${f('qf-cregion', 'Vùng', `<select class="input" id="qf-cregion">${opt('', '— Chọn —', !cu0?.region)}${regionList().map((r) => opt(r.id, r.name, cu0?.region === r.id)).join('')}</select>`)}
        ${f('qf-contact', 'Người liên hệ', inp('qf-contact', q.contact || cu0?.contact))}
        ${f('qf-cphone', 'SĐT liên hệ', inp('qf-cphone', q.contactPhone || cu0?.phone, 'inputmode="tel"'))}
        ${f('qf-cemail', 'Email', inp('qf-cemail', cu0?.email, 'type="email"'))}
      </div></fieldset>
      <fieldset class="sec"><legend>Báo giá</legend><div class="fgrid">
        ${f('qf-no', 'Số báo giá', inp('qf-no', q.no || nextQuoteNo(q.date)))}
        ${f('qf-date', 'Ngày báo giá', inp('qf-date', q.date, 'type="date"'))}
        ${f('qf-valid', 'Hiệu lực đến', inp('qf-valid', q.validUntil, 'type="date"'))}
        ${f('qf-owner', 'Người phụ trách', inp('qf-owner', q.owner))}
        <div class="f full"><span class="lbl">Nhóm huấn luyện</span>${groupChecks('qf-group', q.groups)}</div>
        ${f('qf-students', 'Tổng số học viên dự kiến', inp('qf-students', q.students, 'type="number" min="1"'))}
        ${f('qf-classes', 'Số lớp', inp('qf-classes', q.classCount || 1, 'type="number" min="1"'), { hint: ' ' })}
        ${f('qf-unit', 'Đơn giá / lớp (chưa VAT, đ)', moneyInp('qf-unit', q.unitPrice), { hint: ' ' })}
        ${f('qf-amount', 'Giá trị báo giá (chưa VAT, đ)', moneyInp('qf-amount', q.amount), { hint: ' ' })}
        ${f('qf-vat', 'VAT (%)', inp('qf-vat', vatOf(q), 'type="number" min="0" max="20" step="0.5"'))}
        ${f('qf-status', 'Trạng thái', `<select class="input" id="qf-status">${Object.entries(QUOTE_STATUS).map(([k, v]) => opt(k, v.label, q.status === k)).join('')}</select>`)}
        ${f('qf-notes', 'Ghi chú', `<textarea class="input" id="qf-notes" rows="2">${esc(q.notes || '')}</textarea>`, { cls: 'full' })}
        <div class="f full"><span class="lbl">File báo giá</span><div data-qfiles></div></div>
      </div></fieldset>
      <fieldset class="sec" id="qf-contract-sec"><legend>Hợp đồng</legend><div class="fgrid">
        ${f('qf-cno', 'Số hợp đồng', inp('qf-cno', q.contractNo))}
        ${f('qf-cdate', 'Ngày ký', inp('qf-cdate', q.contractDate, 'type="date"'))}
        ${f('qf-camount', 'Giá trị hợp đồng (chưa VAT, đ)', moneyInp('qf-camount', q.contractAmount), { hint: 'Để trống = bằng giá trị báo giá' })}
        ${f('qf-due', 'Hạn thanh toán', inp('qf-due', q.paymentDue, 'type="date"'))}
        <div class="f full"><span class="lbl">File hợp đồng (bản ký, phụ lục, biên bản nghiệm thu – thanh lý…)</span><div data-cfiles></div></div>
      </div><div class="small muted" style="margin-top:8px">Ghi nhận các lần thu tiền ở màn hình chi tiết hợp đồng.</div></fieldset></form>`,
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
    amount: parseMoney(val(root, 'qf-amount')), amountMode, vatRate: val(root, 'qf-vat') === '' ? Number(settings().vatRate) : Number(val(root, 'qf-vat')), status: val(root, 'qf-status'), notes: val(root, 'qf-notes'),
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
    if (amountMode === 'auto' && src !== 'qf-amount') root.querySelector('#qf-amount').value = unit ? money(unit * d.classCount) : '';
    const amt = parseMoney(val(root, 'qf-amount')); const vat = (amt * (read().vatRate || 0)) / 100;
    root.querySelector('[data-hint="qf-amount"]').innerHTML = `Gồm VAT: <b>${esc(moneyD(amt + vat))}</b>${unit && amt !== unit * d.classCount ? ` <button type="button" class="btn xs" data-act-local="amount-auto">= đơn giá × số lớp</button>` : ''}`;
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
      await Store.save('quotes', rec, `${rec.no} – ${cu.name}`);
      qf.commit(); cf.commit(); m.guard = null; m.close();
      toast(movedToContract ? 'Đã lưu – hồ sơ chuyển sang danh sách Hợp đồng.' : existing ? 'Đã cập nhật báo giá.' : 'Đã thêm báo giá.', 'ok');
    } catch (e) { ev.target.disabled = false; }
  };
}

async function deleteQuote(q) {
  if (!q) return false;
  const cls = quoteClasses(q);
  if (!(await confirmBox(`Xóa ${isContract(q) ? 'hồ sơ hợp đồng' : 'báo giá'} <b>${esc(q.no || '')} – ${esc(q.customerName)}</b> cùng các file báo giá, hợp đồng?${cls.length ? `<br><br>${cls.length} lớp đang gắn với hồ sơ này sẽ được giữ lại nhưng bỏ liên kết.` : ''}`, { ok: 'Xóa', danger: true }))) return false;
  try {
    for (const c of cls) await Store.save('classes', { ...c, quoteId: null });
    await Store.remove('quotes', q, `${q.no || ''} – ${q.customerName}`);
    [...(q.quoteFiles || []), ...(q.contractFiles || [])].forEach((x) => Store.backend.delFile(x));
    toast('Đã xóa.', 'ok'); return true;
  } catch (e) { return false; }
}

function paymentForm(q) {
  if (!S.role.canEdit) return;
  const cm = contractMoney(q);
  const m = openModal({
    title: 'Ghi nhận thanh toán', sub: esc(`${q.contractNo || q.no} – ${q.customerName}`), size: 'narrow',
    body: `<div class="fgrid">${f('pf-date', 'Ngày thu', inp('pf-date', todayISO(), 'type="date"'))}${f('pf-amount', 'Số tiền (đ)', moneyInp('pf-amount', cm.remain), { hint: `Còn phải thu: ${moneyD(cm.remain)}` })}${f('pf-note', 'Nội dung', inp('pf-note', '', 'placeholder="VD: Tạm ứng đợt 1, thanh toán sau nghiệm thu…"'), { cls: 'full' })}</div>`,
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

function quoteDetail(id) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; render();
  function render() {
    const q = quote(id); if (!q) { m.close(); return; }
    const qm = quoteMoney(q); const cm = contractMoney(q); const cls = quoteClasses(q).sort(sortClasses); const cu = customer(q.customerId);
    const signed = isContract(q); const cs = signed ? contractState(q) : null;
    m.el.querySelector('.modal-h h2').textContent = `${signed ? 'Hợp đồng' : 'Báo giá'} ${signed && q.contractNo ? q.contractNo : q.no || ''} – ${q.customerName}`;
    m.body.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap">${quotePill(q)}${cs ? pill(cs.label, cs.tone) : ''}</div>
      <dl class="dl"><div><dt>Khách hàng</dt><dd>${cu ? `<a href="#" data-act="customer-view" data-id="${esc(cu.id)}">${esc(cu.name)}</a>` : esc(q.customerName)}${cu?.taxCode ? `<div class="muted small">MST ${esc(cu.taxCode)}</div>` : ''}</dd></div>
        <div><dt>Người liên hệ</dt><dd>${esc(q.contact || '—')} ${q.contactPhone ? phoneLink(q.contactPhone) : ''}</dd></div>
        <div><dt>Số báo giá · ngày</dt><dd>${esc(q.no || '—')} · ${esc(fmtD(q.date))}${q.validUntil ? `<div class="muted small">hiệu lực đến ${esc(fmtD(q.validUntil))}</div>` : ''}</dd></div>
        <div><dt>Nội dung</dt><dd>${esc([groupsText(q.groups), q.students ? q.students + ' học viên' : '', q.classCount ? q.classCount + ' lớp' : ''].filter(Boolean).join(' · ') || '—')}</dd></div>
        <div><dt>Giá trị báo giá</dt><dd class="num">${esc(moneyD(qm.amount))} <span class="muted small">chưa VAT</span><div class="muted small">Gồm VAT ${vatOf(q)}%: ${esc(moneyD(qm.total))}</div></dd></div>
        <div><dt>Người phụ trách</dt><dd>${esc(q.owner || '—')}</dd></div></dl>
      <div><div class="sec-title">File báo giá</div>${filesBlock(q.quoteFiles, 'Chưa tải file báo giá')}</div>
      <div><div class="sec-title">Hợp đồng ${signed ? '' : '<span class="muted" style="text-transform:none;letter-spacing:0;font-weight:500">– chưa ký</span>'}<span class="actions edit-only">${signed ? '' : `<button type="button" class="btn xs" data-x="sign">${ic('sign')} Ghi nhận ký hợp đồng</button>`}</span></div>
        ${signed ? `<dl class="dl" style="margin-bottom:10px"><div><dt>Số hợp đồng</dt><dd>${esc(q.contractNo || '—')}</dd></div><div><dt>Ngày ký</dt><dd>${esc(fmtD(q.contractDate) || '—')}</dd></div>
          <div><dt>Giá trị (gồm VAT)</dt><dd class="num">${esc(moneyD(cm.total))}<div class="muted small">chưa VAT ${esc(moneyD(cm.amount))}</div></dd></div><div><dt>Hạn thanh toán</dt><dd>${esc(fmtD(q.paymentDue) || '—')}</dd></div></dl>` : ''}
        ${filesBlock(q.contractFiles, 'Chưa tải file hợp đồng')}</div>
      ${signed ? `<div><div class="sec-title">Thanh toán<span class="actions edit-only"><button type="button" class="btn xs" data-x="pay">${ic('money')} Ghi nhận thanh toán</button></span></div>
        <div class="money-box" style="margin-bottom:10px"><div class="m"><div class="k">Giá trị HĐ (gồm VAT)</div><div class="v">${money(cm.total)}</div></div><div class="m pos"><div class="k">Đã thu</div><div class="v">${money(cm.paid)}</div></div><div class="m ${cm.remain > 0 ? 'hl' : 'pos'}"><div class="k">Còn phải thu</div><div class="v">${money(cm.remain)}</div></div></div>
        ${(q.payments || []).length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Ngày</th><th class="r">Số tiền</th><th>Nội dung</th><th></th></tr></thead><tbody>${q.payments.slice().sort((a, b) => a.date.localeCompare(b.date)).map((p) => `<tr style="cursor:default"><td class="num">${esc(fmtD(p.date))}</td><td class="r">${money(p.amount)}</td><td>${esc(p.note || '')}</td><td class="r"><button type="button" class="btn xs ghost edit-only" data-pdel="${esc(p.id)}" aria-label="Xóa lần thu">${ic('trash')}</button></td></tr>`).join('')}</tbody></table></div>` : '<div class="muted small">Chưa có lần thu nào.</div>'}</div>` : ''}
      <div><div class="sec-title">Lớp học theo ${signed ? 'hợp đồng' : 'báo giá'} (${cls.length})<span class="actions edit-only"><button type="button" class="btn xs" data-x="newclass">${ic('plus')} Lên lịch lớp</button></span></div>
        ${cls.length ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${cls.map(classLi).join('')}</ul><div class="small muted" style="margin-top:6px">Doanh thu các lớp: ${esc(moneyD(sum(cls, (c) => classMoney(c).rev)))} (chưa VAT) · ${cls.filter((c) => c.status === 'done').length}/${cls.filter((c) => c.status !== 'cancelled').length} lớp hoàn thành</div>` : '<div class="muted small">Chưa có lớp nào gắn với hồ sơ này.</div>'}</div>
      ${q.notes ? `<div><div class="sec-title">Ghi chú</div><div style="white-space:pre-wrap">${esc(q.notes)}</div></div>` : ''}`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(q)}<span class="sp"></span><span class="edit-only" style="display:flex;gap:8px"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa</button><button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa</button></span>`;
    const on = (sel, fn) => m.el.querySelector(sel)?.addEventListener('click', fn);
    on('[data-x=del]', async () => { if (await deleteQuote(q)) m.close(); });
    on('[data-x=edit]', () => { m.close(); quoteForm(q); });
    on('[data-x=sign]', () => { m.close(); quoteForm(q, { focusContract: true }); });
    on('[data-x=pay]', () => paymentForm(q));
    on('[data-x=newclass]', () => { m.close(); classForm(null, { from: { customerName: q.customerName, customerId: q.customerId, quoteId: q.id, groups: q.groups || [], contact: q.contact, contactPhone: q.contactPhone, region: customer(q.customerId)?.region || regionList()[0]?.id, students: q.students && q.classCount ? Math.ceil(q.students / q.classCount) : '', status: 'confirmed', priceMode: 'auto', costTrainerMode: 'auto', vatRate: vatOf(q) } }); });
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
      ${f('uf-name', 'Tên công ty', inp('uf-name', c.name, 'required'), { cls: 'full', req: true })}
      ${f('uf-tax', 'Mã số thuế', inp('uf-tax', c.taxCode))}
      ${f('uf-region', 'Vùng', `<select class="input" id="uf-region">${opt('', '— Chọn —', !c.region)}${regionList().map((r) => opt(r.id, r.name, c.region === r.id)).join('')}</select>`)}
      ${f('uf-industry', 'Ngành nghề', inp('uf-industry', c.industry, 'placeholder="VD: Đóng tàu, cảng biển, xây dựng…"'))}
      ${f('uf-address', 'Địa chỉ', inp('uf-address', c.address), { cls: 'full' })}
      ${f('uf-contact', 'Người liên hệ', inp('uf-contact', c.contact))}
      ${f('uf-phone', 'Số điện thoại', inp('uf-phone', c.phone, 'inputmode="tel"'))}
      ${f('uf-email', 'Email', inp('uf-email', c.email, 'type="email"'))}
      ${f('uf-notes', 'Ghi chú', `<textarea class="input" id="uf-notes" rows="2">${esc(c.notes || '')}</textarea>`, { cls: 'full' })}
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
      }
      m.guard = null; m.close(); toast('Đã lưu khách hàng.', 'ok');
    } catch (e) { ev.target.disabled = false; }
  };
}

async function deleteCustomer(c) {
  if (!c) return false;
  const n = S.classes.filter((x) => x.customerId === c.id).length + S.quotes.filter((x) => x.customerId === c.id).length;
  if (n) { toast(`Không xóa được: ${c.name} đang có ${n} lớp/báo giá liên quan.`, 'bad'); return false; }
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
    m.el.querySelector('.modal-h h2').textContent = c.name;
    m.body.innerHTML = `<dl class="dl"><div><dt>Mã số thuế</dt><dd>${esc(c.taxCode || '—')}</dd></div><div><dt>Vùng</dt><dd>${c.region ? rtag(c.region) : '—'}</dd></div><div><dt>Ngành nghề</dt><dd>${esc(c.industry || '—')}</dd></div>
        <div><dt>Người liên hệ</dt><dd>${esc(c.contact || '—')}</dd></div><div><dt>Điện thoại</dt><dd>${c.phone ? phoneLink(c.phone) : '—'}</dd></div><div><dt>Email</dt><dd>${esc(c.email || '—')}</dd></div>
        <div class="full"><dt>Địa chỉ</dt><dd>${esc(c.address || '—')}</dd></div></dl>
      <div class="kpis" style="margin:0"><div class="kpi"><span class="k">Lớp đã tổ chức</span><span class="v">${st.classes}</span><span class="d">${money(st.students)} học viên đã đào tạo</span></div><div class="kpi"><span class="k">Doanh thu</span><span class="v">${moneyShort(st.revenue)}</span><span class="d">chưa VAT</span></div>
        <div class="kpi"><span class="k">Hợp đồng</span><span class="v">${qs.filter(isContract).length}</span><span class="d">Còn phải thu ${esc(moneyShort(sum(qs.filter(isContract), (q) => contractMoney(q).remain)))}</span></div></div>
      <div><div class="sec-title">Hạn huấn luyện định kỳ</div>${dues.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Nhóm</th><th>Lần gần nhất</th><th>Đến hạn</th><th>Tình trạng</th></tr></thead><tbody>${dues.map((d) => { const t2 = dueTone(d.due); return `<tr style="cursor:default"><td>Nhóm ${d.group}</td><td class="num">${esc(fmtD(d.last))}</td><td class="num">${esc(fmtD(d.due))}</td><td>${pill(t2.text, t2.tone)}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="muted small">Chưa có lớp hoàn thành để tính hạn định kỳ.</div>'}</div>
      <div><div class="sec-title">Báo giá &amp; hợp đồng (${qs.length})</div>${qs.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>Số</th><th>Ngày</th><th class="r">Giá trị</th><th>Trạng thái</th><th>File</th></tr></thead><tbody>${qs.map((q) => `<tr data-act="quote-view" data-id="${esc(q.id)}"><td class="strong">${esc(q.no || '')}${q.contractNo ? `<div class="muted small">HĐ ${esc(q.contractNo)}</div>` : ''}</td><td class="num">${esc(fmtD(q.date))}</td><td class="r">${money(quoteMoney(q).amount)}</td><td>${quotePill(q)}</td><td><div class="cell-files">${fileButtons(q.quoteFiles, 'BG')}${fileButtons(q.contractFiles, 'HĐ')}</div></td></tr>`).join('')}</tbody></table></div>` : '<div class="muted small">Chưa có báo giá.</div>'}</div>
      <div><div class="sec-title">Lớp học (${cls.length})</div>${cls.length ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${cls.slice(0, 15).map(classLi).join('')}</ul>` : '<div class="muted small">Chưa có lớp.</div>'}</div>
      ${c.notes ? `<div><div class="sec-title">Ghi chú</div><div style="white-space:pre-wrap">${esc(c.notes)}</div></div>` : ''}`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(c)}<span class="sp"></span><span class="edit-only" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa</button><button type="button" class="btn" data-x="quote">${ic('plus')} Tạo báo giá</button><button type="button" class="btn" data-x="class">${ic('plus')} Lên lịch lớp</button><button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa</button></span>`;
    const on = (sel, fn) => m.el.querySelector(sel)?.addEventListener('click', fn);
    on('[data-x=del]', async () => { if (await deleteCustomer(c)) m.close(); });
    on('[data-x=edit]', () => { m.close(); customerForm(c); });
    on('[data-x=quote]', () => { m.close(); quoteForm(null, { customerName: c.name, customerId: c.id, contact: c.contact, contactPhone: c.phone, groups: dues.filter((d) => daysBetween(todayISO(), d.due) <= (Number(settings().warnDays) || 60)).map((d) => d.group) }); });
    on('[data-x=class]', () => { m.close(); classForm(null, { from: { customerName: c.name, customerId: c.id, contact: c.contact, contactPhone: c.phone, region: c.region || regionList()[0]?.id, status: 'confirmed', priceMode: 'auto', costTrainerMode: 'auto', vatRate: settings().vatRate } }); });
    hydrate(m.el); fillNames(m.el);
  }
}
