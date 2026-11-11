/* ============================================================
   MAIN – khởi động, điều hướng tab, sự kiện, xuất Excel, sao lưu
   ============================================================ */

let USER = null; let REAL = null; let PREV_ROLE = null;

function currentView() { return (TABS.find((t) => t.id === S.ui.tab) || TABS[0]).view; }
function go(id) { if (location.hash === '#' + id) mountTab(); else location.hash = id; }
function applyRole() { document.body.classList.toggle('ro', !S.role.canEdit); }

function keepFocus(fn) {
  const a = document.activeElement; const id = a && a.id;
  let s = null, e = null; try { s = a.selectionStart; e = a.selectionEnd; } catch (x) { /* not text */ }
  fn();
  if (id && document.activeElement !== a) {
    const n = document.getElementById(id);
    if (n && n !== a) { n.focus(); try { if (s !== null) n.setSelectionRange(s, e); } catch (x) { /* ignore */ } }
  }
}

let renderQueued = false;
function scheduleRender() {
  if (renderQueued) return; renderQueued = true;
  setTimeout(() => { renderQueued = false; renderAll(); }, 0);
}
function renderAll() {
  renderChrome();
  const v = currentView();
  if (v && v.el && !(v === SettingsView && SettingsView.dirty)) keepFocus(() => v.update());
  Modals.forEach((m) => m.refresh && m.refresh());
}

function renderChrome() {
  const alerts = S.sync.state === 'loading' ? [] : computeAlerts();
  const nUrgent = alerts.filter((a) => a.sev !== 'info').length;
  const nPending = S.quotes.filter((q) => ['sent', 'negotiating', 'accepted'].includes(q.status)).length;
  $('#tabs').innerHTML = TABS.map((t) => {
    const badge = t.id === 'tong-quan' && nUrgent ? nUrgent : t.id === 'bao-gia' && nPending ? nPending : 0;
    return `<a class="tab" href="#${t.id}"${S.ui.tab === t.id ? ' aria-current="page"' : ''}>${ic(t.icon)}<span>${esc(t.label)}</span>${badge ? `<span class="badge" title="${t.id === 'tong-quan' ? 'Việc cần chú ý' : 'Báo giá đang chờ kết quả'}">${badge}</span>` : ''}</a>`;
  }).join('');
  const kind = Store.backend?.kind;
  const t = todayISO();
  let st = `<span class="pill muted">${esc(DOW_LONG[parseISO(t).getDay()])}, ${fmtD(t)}</span>`;
  if (kind === 'demo') st += pill('Đang xem dữ liệu mẫu', 'accent', true);
  else if (S.role.mode === 'cloud') st += S.role.canEdit ? pill('Quản lý · được chỉnh sửa', 'ok', true) : pill('Chế độ xem', 'info', true);
  else if (S.role.mode === 'local') st += pill('Bản ngoại tuyến · lưu trên máy này', 'warn', true);
  else if (S.role.mode === 'noaccess') st += pill('Chưa truy cập được dữ liệu', 'bad', true);
  if (S.sync.state === 'loading') st += pill('Đang tải…', 'muted');
  else if (S.sync.state === 'warn' || S.sync.state === 'error') st += pill(S.sync.msg, 'bad');
  $('#status').innerHTML = st;

  let b = '';
  if (kind === 'demo') b += `<div class="banner demo"><b>Dữ liệu mẫu</b><span class="grow">Công ty, giảng viên và số liệu là ví dụ minh họa để xem thử các chức năng. Mọi thay đổi chỉ tạm thời, không lưu và không ai khác thấy.</span><button type="button" class="btn sm" data-act="demo-off">${ic('x')} Thoát dữ liệu mẫu</button></div>`;
  else if (S.role.mode === 'noaccess') b += `<div class="banner warn"><span class="grow"><b>Không tải được dữ liệu dùng chung.</b> Hãy đăng nhập claude.ai bằng tài khoản đã được chia sẻ trang này rồi tải lại trang.</span><button type="button" class="btn sm" data-act="demo-on">${ic('eye')} Xem thử dữ liệu mẫu</button></div>`;
  else if (S.role.mode === 'local' && !lsGet('dako-hide-local')) b += `<div class="banner info"><span class="grow"><b>Bản ngoại tuyến:</b> dữ liệu và file lưu trong trình duyệt của máy này${S.localWarn ? ' (trình duyệt đang chặn bộ nhớ – dữ liệu sẽ mất khi đóng trang)' : ''}. Để mọi người cùng xem, dùng bản dùng chung trên claude.ai; chuyển dữ liệu bằng Cài đặt → Sao lưu / Khôi phục.</span><button type="button" class="btn sm ghost" data-act="hide-local">Đã hiểu</button></div>`;
  $('#banners').innerHTML = b;
  $('#banners').parentElement.hidden = !b;
}
function lsGet(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }
function lsSet(k, v) { try { localStorage.setItem(k, v); } catch (e) { /* ignore */ } }

function mountTab() {
  const id = (location.hash || '').replace('#', '');
  const tab = TABS.find((t) => t.id === id) || TABS[0];
  S.ui.tab = tab.id; SettingsView.dirty = false;
  TABS.forEach((t) => (t.view.el = null));
  const main = $('#main'); main.innerHTML = '';
  const host = document.createElement('div'); main.append(host);
  tab.view.mount(host);
  renderChrome();
  lsSet('dako-tab', tab.id);
}

async function fillNames(root) {
  const els = $$('[data-uid]', root);
  if (!els.length) return;
  if (!USER) { els.forEach((e) => e.remove()); return; }
  try {
    const ps = await USER.profiles(uniq(els.map((e) => e.dataset.uid)));
    els.forEach((e) => { const n = ps[e.dataset.uid]?.name; e.textContent = n ? ' · ' + n : ''; });
  } catch (e) { /* ignore */ }
}

/* ---------- click actions ---------- */
document.addEventListener('click', async (e) => {
  const el = e.target.closest('[data-act]'); if (!el) return;
  const act = el.dataset.act; const id = el.dataset.id; const v = el.dataset.v;
  if (el.tagName === 'A' && el.getAttribute('href') === '#') e.preventDefault();
  const upd = () => { const cv = currentView(); if (cv.el) keepFocus(() => cv.update()); };
  switch (act) {
    case 'region': S.ui.region = v; upd(); break;
    case 'tr-region': S.ui.trRegion = v; upd(); break;
    case 'q-status': S.ui.qStatus = v; upd(); break;
    case 'c-state': S.ui.cState = v; upd(); break;
    case 'cal-view': S.ui.calView = v; upd(); break;
    case 'cal-prev': S.ui.month = ymAdd(S.ui.month, -1); S.ui.selDate = S.ui.month + '-01'; upd(); break;
    case 'cal-next': S.ui.month = ymAdd(S.ui.month, 1); S.ui.selDate = S.ui.month + '-01'; upd(); break;
    case 'cal-today': S.ui.month = todayISO().slice(0, 7); S.ui.selDate = todayISO(); upd(); break;
    case 'ov-period': S.ui.ovPeriod = v; upd(); break;
    case 'ov-prev': S.ui.ovMonth = ymAdd(S.ui.ovMonth, S.ui.ovPeriod === 'year' ? -12 : -1); upd(); break;
    case 'ov-next': S.ui.ovMonth = ymAdd(S.ui.ovMonth, S.ui.ovPeriod === 'year' ? 12 : 1); upd(); break;
    case 'toggle-alerts': S.ui.allAlerts = !S.ui.allAlerts; upd(); break;
    case 'day': {
      const d = el.dataset.date; S.ui.selDate = d;
      if (ymOf(d) !== S.ui.month) S.ui.month = ymOf(d);
      const has = classesOn(d).some((c) => CalendarView.visible(c));
      if (!has && S.role.canEdit) { upd(); classForm(null, { date: d }); break; }
      upd();
      if (window.innerWidth < 1080) $('[data-daypanel]')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
      break;
    }
    case 'focus-trainer': S.ui.trainerFocus = S.ui.trainerFocus === id ? null : id; upd(); break;
    case 'focus-clear': S.ui.trainerFocus = null; upd(); break;
    case 'goto-region': S.ui.region = v; go('lich'); break;
    case 'class-new': e.stopPropagation(); classForm(null, { date: el.dataset.date, trainerId: el.dataset.trainer }); break;
    case 'class-view': classDetail(id); break;
    case 'trainer-new': trainerForm(null); break;
    case 'trainer-view': trainerDetail(id); break;
    case 'quote-new': quoteForm(null); break;
    case 'quote-view': quoteDetail(id); break;
    case 'quote-edit': if (quote(id)) quoteForm(quote(id)); break;
    case 'quote-sign': if (quote(id)) quoteForm(quote(id), { focusContract: true }); break;
    case 'customer-new': customerForm(null); break;
    case 'customer-view': customerDetail(id); break;
    case 'files-open': {
      const metas = el.dataset.fids.split(',').map((x) => FILES.get(x)).filter(Boolean);
      openViewer(metas, 0, metas.length > 1 ? `${metas.length} file` : metas[0]?.name);
      break;
    }
    case 'file-view': {
      const box = el.closest('.files');
      const ids = uniq((box ? $$('[data-fid]', box) : [el]).map((x) => x.dataset.fid));
      const metas = ids.map((x) => FILES.get(x)).filter(Boolean);
      openViewer(metas, Math.max(0, ids.indexOf(el.dataset.fid)), metas.length > 1 ? `${metas.length} file` : metas[0]?.name);
      break;
    }
    case 'copy': {
      const text = el.dataset.text;
      try { await navigator.clipboard.writeText(text); toast('Đã sao chép: ' + text); } catch (err) { toast(text); }
      break;
    }
    case 'demo-on':
      if (Store.backend?.kind !== 'demo') { PREV_ROLE = { ...S.role }; S.role = { canEdit: true, mode: 'demo' }; S.ui.month = todayISO().slice(0, 7); Store.attach(buildDemo()); applyRole(); go('tong-quan'); }
      break;
    case 'demo-off':
      S.role = PREV_ROLE || S.role; Store.attach(REAL || new MemoryBackend('none')); applyRole(); mountTab(); break;
    case 'hide-local': lsSet('dako-hide-local', '1'); renderChrome(); break;
    case 'export-xlsx': exportXlsx(); break;
    case 'backup': backup(); break;
    case 'settings-save': {
      const next = SettingsView.collect();
      if (!next.priceTiers.length) { toast('Bảng giá cần ít nhất một mức giá hợp lệ.', 'bad'); break; }
      try { await Store.saveSettings(next); SettingsView.dirty = false; toast('Đã lưu cài đặt.', 'ok'); } catch (err) { /* đã báo */ }
      break;
    }
    case 'tier-add': {
      const tb = $('#tier-table tbody'); const i = tb.children.length;
      tb.insertAdjacentHTML('beforeend', `<tr style="cursor:default"><td><input class="input" type="number" min="1" data-tier="min" data-i="${i}" aria-label="Từ số học viên"></td><td><input class="input" type="number" min="1" data-tier="max" data-i="${i}" aria-label="Đến số học viên"></td><td><input class="input" data-money data-tier="price" data-i="${i}" aria-label="Đơn giá"></td><td><button type="button" class="btn icon ghost" data-act="tier-del" aria-label="Xóa mức giá">${ic('trash')}</button></td></tr>`);
      bindMoney(tb.lastElementChild); SettingsView.dirty = true; break;
    }
    case 'tier-del': el.closest('tr').remove(); SettingsView.dirty = true; break;
    case 'region-add': {
      const tb = $('#region-table tbody'); const rid = uid('r'); const n = tb.children.length;
      tb.insertAdjacentHTML('beforeend', `<tr style="cursor:default" data-rid="${rid}"><td><span class="rtag"><span class="sw" style="background:var(${REGION_VARS[n % REGION_VARS.length]})"></span></span></td><td><input class="input" data-region="name" value="Vùng mới" aria-label="Tên vùng"></td><td><input class="input" data-region="center" aria-label="Trung tâm"></td></tr>`);
      SettingsView.dirty = true; break;
    }
    default: break;
  }
});

/* ---------- inputs on toolbars ---------- */
const deferredUpdate = debounce(() => { const v = currentView(); if (v.el) keepFocus(() => v.update()); }, 160);
document.addEventListener('input', (e) => {
  const k = e.target.dataset?.input;
  if (!k) { if (S.ui.tab === 'cai-dat' && e.target.closest('#main')) SettingsView.dirty = true; return; }
  const v = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
  const map = { 'cal-search': 'calSearch', 'tr-search': 'trSearch', 'tr-spec': 'trSpec', 'tr-status': 'trStatus', 'q-search': 'qSearch', 'q-year': 'qYear', 'c-search': 'cSearch', 'c-year': 'cYear', 'cu-search': 'cuSearch', 'cu-due': 'cuDue' };
  if (map[k]) { S.ui[map[k]] = v; deferredUpdate(); }
});
document.addEventListener('change', (e) => {
  if (e.target.dataset?.input === 'restore' && e.target.files?.[0]) { const file = e.target.files[0]; e.target.value = ''; restore(file); }
});

/* ---------- Excel export ---------- */
async function exportXlsx() {
  let XLSX;
  try { toast('Đang tạo file Excel…'); XLSX = await lib('xlsx'); } catch (e) { toast(e.message, 'bad'); return; }
  const wb = XLSX.utils.book_new();
  const add = (name, rows, widths) => { const ws = XLSX.utils.aoa_to_sheet(rows); ws['!cols'] = widths.map((w) => ({ wch: w })); XLSX.utils.book_append_sheet(wb, ws, name); };
  const cls = S.classes.slice().sort(sortClasses);
  add('Lịch giảng dạy', [['Từ ngày', 'Đến ngày', 'Giờ học', 'Khách hàng', 'Tên lớp', 'Hình thức', 'Nhóm', 'Số HV', 'Vùng', 'Địa điểm', 'Giảng viên', 'SĐT giảng viên', 'Đơn giá (chưa VAT)', 'VAT %', 'Thành tiền gồm VAT', 'Thù lao GV', 'Đi lại – lưu trú', 'Chi phí khác', 'Lãi gộp', 'Trạng thái', 'Số báo giá', 'Số hợp đồng', 'Đã cấp GCN/thẻ', 'Đã xuất hóa đơn', 'Ghi chú'],
    ...cls.map((c) => { const m = classMoney(c); const q = c.quoteId && quote(c.quoteId); return [fmtD(c.startDate), fmtD(c.endDate), `${c.startTime || ''}–${c.endTime || ''}`, classLabel(c), c.title || '', c.kind || '', groupsText(c.groups), Number(c.students) || 0, regionName(c.region), c.location || '', trainerNames(c.trainerIds), (c.trainerIds || []).map((x) => trainer(x)?.phone || '').join(', '), Number(c.price) || 0, vatOf(c), m.total, Number(c.costTrainer) || 0, Number(c.costTravel) || 0, Number(c.costOther) || 0, m.profit, CLASS_STATUS[c.status]?.label || '', q?.no || '', q?.contractNo || '', c.certIssued ? 'Có' : '', c.invoiced ? 'Có' : '', c.notes || '']; })],
    [11, 11, 12, 34, 26, 18, 14, 7, 22, 30, 28, 20, 14, 6, 16, 13, 13, 13, 13, 13, 14, 18, 9, 9, 30]);
  const ym = todayISO().slice(0, 7);
  add('Giảng viên', [['Họ tên', 'Điện thoại', 'Email', 'Vùng chính', 'Vùng hỗ trợ', 'Chuyên ngành', 'Nhóm được dạy', 'Trình độ', 'Kinh nghiệm (năm)', 'Số chứng chỉ', 'Hạn chứng chỉ', 'Hình thức', 'Thù lao/ngày', 'Trạng thái', `Ngày dạy ${fmtYM(ym)}`, 'Ghi chú'],
    ...S.trainers.slice().sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((x) => [x.name, x.phone || '', x.email || '', regionName(x.region), (x.otherRegions || []).map(regionName).join(', '), (x.specialties || []).join(', '), groupsText(x.groups), x.degree || '', Number(x.experience) || '', x.certNo || '', fmtD(x.certExpiry), x.employment || '', Number(x.dailyRate) || 0, x.status === 'paused' ? 'Tạm ngưng' : 'Đang hoạt động', trainerMonthLoad(x.id, ym).days, x.notes || ''])],
    [26, 14, 24, 22, 22, 44, 16, 22, 10, 16, 12, 14, 13, 14, 12, 30]);
  add('Báo giá', [['Số báo giá', 'Ngày', 'Khách hàng', 'Người liên hệ', 'SĐT', 'Nhóm', 'Số HV', 'Số lớp', 'Đơn giá/lớp', 'Giá trị (chưa VAT)', 'VAT %', 'Gồm VAT', 'Trạng thái', 'Người phụ trách', 'File báo giá', 'File hợp đồng', 'Ghi chú'],
    ...S.quotes.slice().sort((a, b) => (a.date || '').localeCompare(b.date || '')).map((q) => { const m = quoteMoney(q); return [q.no || '', fmtD(q.date), q.customerName || '', q.contact || '', q.contactPhone || '', groupsText(q.groups), Number(q.students) || 0, Number(q.classCount) || 0, Number(q.unitPrice) || 0, m.amount, vatOf(q), m.total, QUOTE_STATUS[q.status]?.label || '', q.owner || '', (q.quoteFiles || []).map((x) => x.name).join(', '), (q.contractFiles || []).map((x) => x.name).join(', '), q.notes || '']; })],
    [14, 11, 34, 20, 14, 14, 7, 7, 13, 15, 6, 15, 18, 16, 28, 28, 30]);
  add('Hợp đồng', [['Số hợp đồng', 'Ngày ký', 'Khách hàng', 'Số báo giá', 'Giá trị (chưa VAT)', 'Gồm VAT', 'Đã thu', 'Còn phải thu', 'Hạn thanh toán', 'Lớp hoàn thành / tổng', 'Tình trạng', 'File hợp đồng'],
    ...S.quotes.filter(isContract).sort((a, b) => (a.contractDate || '').localeCompare(b.contractDate || '')).map((q) => { const m = contractMoney(q); const cs = quoteClasses(q).filter((c) => c.status !== 'cancelled'); return [q.contractNo || '', fmtD(q.contractDate), q.customerName || '', q.no || '', m.amount, m.total, m.paid, m.remain, fmtD(q.paymentDue), `${cs.filter((c) => c.status === 'done').length}/${cs.length}`, contractState(q).label, (q.contractFiles || []).map((x) => x.name).join(', ')]; })],
    [20, 11, 34, 14, 15, 15, 14, 14, 12, 12, 20, 30]);
  add('Khách hàng', [['Tên công ty', 'MST', 'Vùng', 'Ngành nghề', 'Địa chỉ', 'Người liên hệ', 'SĐT', 'Email', 'Số lớp', 'HV đã đào tạo', 'Doanh thu (chưa VAT)', 'Lần gần nhất', 'Định kỳ tiếp theo', 'Nhóm đến hạn'],
    ...S.customers.slice().sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((c) => { const s2 = customerStats(c.id); const d = customerDues(c.id)[0]; return [c.name, c.taxCode || '', regionName(c.region), c.industry || '', c.address || '', c.contact || '', c.phone || '', c.email || '', s2.classes, s2.students, s2.revenue, fmtD(s2.last), d ? fmtD(d.due) : '', d ? 'Nhóm ' + d.group : '']; })],
    [34, 14, 20, 18, 34, 22, 14, 24, 8, 10, 16, 12, 14, 10]);
  const out = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });
  try { await Store.backend.download(`DAKO_Huan-luyen-ATVSLD_${todayISO()}.xlsx`, new Blob([out], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' })); } catch (e) { toast(e.message, 'bad'); }
}

/* ---------- backup & restore ---------- */
async function backup() {
  const withFiles = $('#backup-files') ? $('#backup-files').checked : true;
  const out = { app: 'dako-atld', version: APP_VERSION, exportedAt: new Date().toISOString(), data: { trainers: S.trainers, classes: S.classes, quotes: S.quotes, customers: S.customers, settings: S.settings }, files: {} };
  if (withFiles && FILES.size) {
    toast(`Đang gom ${FILES.size} file đính kèm…`);
    for (const [id, meta] of FILES) { try { out.files[id] = { meta, b64: await blobToBase64(await Store.backend.getBlob(meta)) }; } catch (e) { /* bỏ qua file lỗi */ } }
  }
  try { await Store.backend.download(`DAKO_sao-luu_${todayISO()}.json`, new Blob([JSON.stringify(out)], { type: 'application/json' })); } catch (e) { toast(e.message, 'bad'); }
}

async function restore(file) {
  if (!S.role.canEdit) return;
  let obj;
  try { obj = JSON.parse(await file.text()); } catch (e) { toast('File không đúng định dạng sao lưu của công cụ.', 'bad'); return; }
  if (obj?.app !== 'dako-atld' || !obj.data) { toast('File không đúng định dạng sao lưu của công cụ.', 'bad'); return; }
  const d = obj.data;
  const n = ['trainers', 'classes', 'quotes', 'customers'].reduce((s, k) => s + (d[k] || []).length, 0);
  const nf = Object.keys(obj.files || {}).length;
  if (!(await confirmBox(`Khôi phục <b>${n}</b> bản ghi và <b>${nf}</b> file từ bản sao lưu ngày ${esc(fmtStamp(obj.exportedAt))}?<br><br>Bản ghi trùng mã sẽ được ghi đè bằng bản sao lưu; các bản ghi khác giữ nguyên.`, { ok: 'Khôi phục' }))) return;
  toast('Đang khôi phục…');
  const map = {};
  for (const [oldId, fobj] of Object.entries(obj.files || {})) {
    try { map[oldId] = await Store.backend.putFile(base64ToBlob(fobj.b64, fobj.meta.type), fobj.meta.name, fobj.meta.type); } catch (e) { /* bỏ qua */ }
  }
  const rf = (m) => (m && map[m.id] ? map[m.id] : m); const rl = (l) => (l || []).map(rf);
  try {
    for (const x of d.customers || []) await Store.backend.set('customers', x.id, x);
    for (const x of d.trainers || []) await Store.backend.set('trainers', x.id, { ...x, photo: rf(x.photo), files: rl(x.files) });
    for (const x of d.quotes || []) await Store.backend.set('quotes', x.id, { ...x, quoteFiles: rl(x.quoteFiles), contractFiles: rl(x.contractFiles) });
    for (const x of d.classes || []) await Store.backend.set('classes', x.id, { ...x, files: rl(x.files) });
    if (d.settings) await Store.backend.set('settings', 'main', d.settings);
    Store.log('Khôi phục', 'settings', `Bản sao lưu ${fmtStamp(obj.exportedAt)}`);
    toast(`Đã khôi phục ${n} bản ghi, ${Object.keys(map).length} file.`, 'ok');
  } catch (e) { Store.handleWriteError(e); }
}

/* ---------- boot ---------- */
async function boot() {
  if (!location.hash) { const last = lsGet('dako-tab'); if (last && TABS.some((t) => t.id === last)) history.replaceState(null, '', '#' + last); }
  window.addEventListener('hashchange', mountTab);
  Store.backend = new MemoryBackend('none');
  S.sync = { state: 'loading', msg: '' };
  mountTab(); applyRole();
  if (window.claude && typeof window.claude.use === 'function') {
    const db = await window.claude.use('db');
    if (db) {
      USER = await window.claude.use('user');
      let canEdit = false;
      if (USER) {
        const w = await USER.can('data.write');
        canEdit = w === null ? await USER.canEdit() : !!w;
        try { S.me = await USER.me(); } catch (e) { S.me = null; }
      }
      const assets = canEdit ? await window.claude.use('assets') : null;
      S.role = { canEdit, mode: 'cloud' };
      REAL = new CloudBackend(db, assets);
    } else {
      S.role = { canEdit: false, mode: 'noaccess' };
    }
  } else {
    const lb = new LocalBackend();
    try { await lb.init(); REAL = lb; } catch (e) { REAL = new MemoryBackend('local'); S.localWarn = true; }
    S.role = { canEdit: true, mode: 'local' };
  }
  applyRole();
  if (REAL) Store.attach(REAL);
  else { S.sync = { state: 'ok', msg: '' }; }
  mountTab();
}
boot();
