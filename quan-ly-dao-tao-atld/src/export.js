/* ============================================================
   EXPORT – báo cáo Excel chuyên nghiệp (ExcelJS): logo, tiêu đề, Times New Roman,
   số dạng 1.000.000 đ (dấu chấm phần nghìn ở mọi máy), thống kê theo tuần/tháng/quý/năm,
   cộng nhóm + tổng cộng, khối ký, khổ A4 sẵn in.
   ============================================================ */

const XLSX_MIME = 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';
const EXPORTS = {
  'tong-quan': { name: 'Tổng hợp', file: 'Bao-cao-tong-hop' },
  lich: { name: 'Lịch giảng dạy', file: 'Lich-giang-day' },
  'giang-vien': { name: 'Giảng viên – thù lao', file: 'Giang-vien-thu-lao' },
  'hoc-vien': { name: 'Học viên', file: 'Hoc-vien' },
  'bao-gia': { name: 'Báo giá', file: 'Bao-gia' },
  'hop-dong': { name: 'Hợp đồng', file: 'Hop-dong' },
  'doanh-thu': { name: 'Doanh thu – lợi nhuận', file: 'Doanh-thu-loi-nhuan' },
  'khach-hang': { name: 'Khách hàng', file: 'Khach-hang' },
  'quyet-dinh': { name: 'Số quyết định', file: 'So-quyet-dinh' },
};
LIBS.exceljs = ['https://cdn.jsdelivr.net/npm/exceljs@4.4.0/dist/exceljs.min.js'];

/* ---------- hộp thoại xuất ---------- */
const PERIOD_TYPES = [['week', 'Tuần'], ['month', 'Tháng'], ['quarter', 'Quý'], ['year', 'Năm'], ['custom', 'Tùy chọn']];
const AUTO_GRAN = { week: 'day', month: 'week', quarter: 'month', year: 'month' };
/** Kỳ báo cáo chứa ngày anchor: { from, to, label, slug }. */
function reportPeriod(type, anchor) {
  const p = periodOf(anchor, type); const y = p.start.slice(0, 4);
  if (type === 'week') { const w = isoWeek(p.start); return { from: p.start, to: p.end, label: `Tuần ${w.week}/${w.year} (${fmtD(p.start)} – ${fmtD(p.end)})`, slug: `Tuan-${w.week}-${w.year}` }; }
  if (type === 'month') return { from: p.start, to: p.end, label: p.label, slug: `Thang-${Number(p.start.slice(5, 7))}-${y}` };
  if (type === 'quarter') { const q = Math.floor(Number(p.start.slice(5, 7)) / 3) + 1; return { from: p.start, to: p.end, label: p.label, slug: `Quy-${q}-${y}` }; }
  return { from: p.start, to: p.end, label: `Năm ${y}`, slug: `Nam-${y}` };
}
function shiftAnchor(type, anchor, n) {
  if (type === 'week') return addDays(anchor, 7 * n);
  const first = anchor.slice(0, 7) + '-01';
  return addMonths(first, n * ({ month: 1, quarter: 3, year: 12 }[type] || 1));
}
const granForSpan = (from, to) => { const d = daysBetween(from, to); return d <= 14 ? 'day' : d <= 62 ? 'week' : d <= 400 ? 'month' : 'quarter'; };
const exportSheets = (tab) => (tab === 'tong-quan' ? ['Tổng quan', 'Lịch giảng dạy', 'Doanh thu – lợi nhuận', 'Hợp đồng', 'Báo giá', 'Giảng viên – thù lao', 'Hợp đồng giảng viên', 'Học viên', 'Số quyết định', 'Khách hàng'] : tab === 'giang-vien' ? ['Giảng viên – thù lao', 'Hợp đồng giảng viên'] : [EXPORTS[tab]?.name || 'Báo cáo']);
function openExport(tab) {
  const meta = EXPORTS[tab] || EXPORTS['tong-quan'];
  const t = todayISO();
  const allDates = [...S.classes.map((c) => c.startDate), ...S.quotes.map((x) => x.contractDate || x.date), ...allStudents().map((x) => x.v.issueDate), ...S.tcontracts.map((x) => x.signDate), ...S.decisions.map((x) => x.date)].filter(Boolean).sort();
  const st = { type: ['week', 'month', 'quarter', 'year'].includes(lsGet('dako-export-type')) ? lsGet('dako-export-type') : 'month', anchor: t, gran: null, from: '', to: '', label: '', slug: '' };
  const sheets = exportSheets(tab);
  const m = openModal({
    title: `Xuất báo cáo Excel – ${esc(meta.name)}`, sub: 'File sẵn in khổ A4: logo DAKO, Times New Roman, số dạng 1.000.000 đ, chi tiết và tổng cộng theo kỳ', size: 'narrow',
    body: `<div class="f"><span class="lbl">Xuất theo</span><div class="seg" data-ptype>${PERIOD_TYPES.map(([k, l]) => `<button type="button" data-v="${k}">${l}</button>`).join('')}</div></div>
      <div class="pnav" data-pnav><button type="button" class="btn icon" data-shift="-1" aria-label="Kỳ trước">${ic('left')}</button><b class="grow" data-plabel></b><button type="button" class="btn icon" data-shift="1" aria-label="Kỳ sau">${ic('right')}</button><button type="button" class="btn sm ghost" data-now>Kỳ hiện tại</button></div>
      <div class="fgrid">${f('ex-from', 'Từ ngày', inp('ex-from', '', 'type="date"'))}${f('ex-to', 'Đến ngày', inp('ex-to', '', 'type="date"'))}</div>
      <div class="chips" data-custom hidden><button type="button" class="chip" data-p="lastyear">Năm trước</button><button type="button" class="chip" data-p="ytd">Từ đầu năm đến nay</button><button type="button" class="chip" data-p="all">Toàn bộ dữ liệu</button></div>
      <div class="f"><span class="lbl">Chi tiết cộng theo</span><div class="seg" data-gran>${Object.entries(GRAN).map(([k, v]) => `<button type="button" data-v="${k}">${v[0].toUpperCase() + v.slice(1)}</button>`).join('')}</div><span class="hint" data-granhint></span></div>
      <div class="small muted">File gồm ${sheets.length > 1 ? `${sheets.length} sheet: ${esc(sheets.join(', '))}` : `sheet “${esc(sheets[0])}”`}. Mỗi sheet có phần tổng hợp theo kỳ, phần chi tiết cộng theo từng kỳ và dòng tổng cộng.</div>`,
    foot: `<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-go>${ic('table')} Xuất Excel</button>`,
  });
  const el = m.el; const fromEl = el.querySelector('#ex-from'); const toEl = el.querySelector('#ex-to');
  function apply() {
    if (st.type !== 'custom') { const p = reportPeriod(st.type, st.anchor); Object.assign(st, p); fromEl.value = p.from; toEl.value = p.to; }
    else { st.from = fromEl.value; st.to = toEl.value; st.label = ''; st.slug = st.from && st.to ? `${st.from}_${st.to}` : ''; }
    const autoG = st.type === 'custom' ? (st.from && st.to && st.to >= st.from ? granForSpan(st.from, st.to) : 'month') : AUTO_GRAN[st.type];
    const gran = st.gran || autoG;
    $$('[data-ptype] button', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === st.type)));
    $$('[data-gran] button', el).forEach((b) => b.setAttribute('aria-pressed', String(b.dataset.v === gran)));
    el.querySelector('[data-pnav]').hidden = st.type === 'custom';
    el.querySelector('[data-custom]').hidden = st.type !== 'custom';
    el.querySelector('[data-plabel]').textContent = st.label || '';
    el.querySelector('[data-granhint]').textContent = st.gran && st.gran !== autoG ? 'Đang chọn tay – bấm lại loại kỳ để về mặc định.' : `Tự chọn theo kỳ: ${st.type === 'custom' ? 'theo độ dài khoảng ngày' : `${PERIOD_TYPES.find((x) => x[0] === st.type)[1].toLowerCase()} → từng ${GRAN[autoG]}`}.`;
  }
  el.querySelector('[data-ptype]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-v]'); if (!b) return;
    st.type = b.dataset.v; st.gran = null;
    if (st.type !== 'custom') { st.anchor = st.from && !(st.from <= t && t <= st.to) ? st.from : t; lsSet('dako-export-type', st.type); }
    apply();
  });
  el.querySelector('[data-pnav]').addEventListener('click', (e) => {
    const sh = e.target.closest('[data-shift]'); if (sh) { st.anchor = shiftAnchor(st.type, st.from || st.anchor, Number(sh.dataset.shift)); apply(); }
    if (e.target.closest('[data-now]')) { st.anchor = t; apply(); }
  });
  // tự chọn ngày → chuyển sang "Tùy chọn"
  [fromEl, toEl].forEach((x) => x.addEventListener('change', () => { if (st.type !== 'custom') { st.type = 'custom'; st.gran = null; } apply(); }));
  el.querySelector('[data-custom]').addEventListener('click', (e) => {
    const b = e.target.closest('[data-p]'); if (!b) return; const y = t.slice(0, 4);
    if (b.dataset.p === 'lastyear') { fromEl.value = `${Number(y) - 1}-01-01`; toEl.value = `${Number(y) - 1}-12-31`; }
    if (b.dataset.p === 'ytd') { fromEl.value = `${y}-01-01`; toEl.value = t; }
    if (b.dataset.p === 'all') { fromEl.value = allDates[0] || `${y}-01-01`; toEl.value = allDates[allDates.length - 1] > t ? allDates[allDates.length - 1] : t; }
    st.gran = null; apply();
  });
  el.querySelector('[data-gran]').addEventListener('click', (e) => { const b = e.target.closest('[data-v]'); if (!b) return; st.gran = b.dataset.v; apply(); });
  apply();
  el.querySelector('[data-cancel]').onclick = () => m.close();
  el.querySelector('[data-go]').onclick = async (ev) => {
    apply();
    const from = st.from; const to = st.to;
    if (!from || !to || to < from) { toast('Chọn khoảng thời gian hợp lệ.', 'bad'); return; }
    const gran = st.gran || (st.type === 'custom' ? granForSpan(from, to) : AUTO_GRAN[st.type]);
    ev.target.disabled = true; ev.target.textContent = 'Đang tạo file…';
    try {
      const ctx = { from, to, gran, label: st.label };
      const reports = tab === 'tong-quan' ? [repOverview, repClasses, repProfit, repContracts, repQuotes, repTrainers, repTrainerContracts, repStudents, repDecisions, repCustomers].map((fn) => fn(ctx))
        : tab === 'giang-vien' ? [repTrainers(ctx), repTrainerContracts(ctx)] : [REPORTS[tab](ctx)];
      const ok = await writeWorkbook(reports, ctx, `DAKO_${meta.file}_${st.slug || `${from}_${to}`}.xlsx`);
      if (ok) { m.close(); toast('Đã tạo file Excel.', 'ok'); } else { ev.target.disabled = false; ev.target.innerHTML = `${ic('table')} Xuất Excel`; }
    } catch (e) {
      console.error(e); toast('Không tạo được file Excel: ' + (e.message || 'lỗi'), 'bad'); ev.target.disabled = false; ev.target.innerHTML = `${ic('table')} Xuất Excel`;
    }
  };
}

/* ---------- tiện ích dựng báo cáo ---------- */
const inR = (d, ctx) => !!d && d >= ctx.from && d <= ctx.to;
const granText = (g) => `Chi tiết cộng theo ${GRAN[g]}`;
function byPeriod(items, dateOf, ctx) {
  const map = new Map();
  for (const it of items) { const d = dateOf(it); if (!d) continue; const p = periodOf(d, ctx.gran); if (!map.has(p.key)) map.set(p.key, { p, items: [] }); map.get(p.key).items.push(it); }
  const keys = new Set(map.keys());
  return periodsBetween(ctx.from, ctx.to, ctx.gran, keys).map((p) => map.get(p.key) || { p, items: [] });
}
const sumBy = (rows, key) => sum(rows, (r) => r[key]);
function summaryRows(groups, keys, rowsOf, labelOf) {
  return groups.map((g) => { const rows = rowsOf(g); const values = {}; keys.forEach((k) => (values[k] = sumBy(rows, k))); return { label: labelOf(g, rows), values }; });
}

/* ---------- 1. Lịch giảng dạy ---------- */
function repClasses(ctx) {
  const cls = S.classes.filter((c) => c.status !== 'cancelled' && inR(c.startDate, ctx)).sort(sortClasses);
  const row = (c) => { const p = classPnl(c); const q = c.quoteId && quote(c.quoteId); return { date: fmtDateRange(c.startDate, c.endDate), customer: classLabel(c), groups: groupsShort(c.groups), region: regionName(c.region), trainers: trainerNames(c.trainerIds), students: Number(c.students) || 0, rev: p.rev, gv: p.gv, com: p.com.gross, other: p.other, profit: p.profit, status: CLASS_STATUS[c.status]?.label || '', contract: q ? (isContract(q) ? q.contractNo || q.no : 'BG ' + (q.no || '')) : '' }; };
  const groups = byPeriod(cls, (c) => c.startDate, ctx).map((g) => ({ ...g, rows: g.items.map(row) }));
  const keys = ['students', 'rev', 'gv', 'com', 'other', 'profit'];
  return {
    sheet: 'Lịch giảng dạy', title: 'BÁO CÁO LỊCH GIẢNG DẠY VÀ LỢI NHUẬN LỚP HỌC',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'date', header: 'Ngày học', width: 15 }, { key: 'customer', header: 'Khách hàng', width: 30 }, { key: 'groups', header: 'Nhóm', width: 9 },
      { key: 'region', header: 'Vùng', width: 14 }, { key: 'trainers', header: 'Giảng viên', width: 22 }, { key: 'students', header: 'Học viên', width: 9, type: 'int' },
      { key: 'rev', header: 'Doanh thu lớp', width: 15, type: 'vnd' }, { key: 'gv', header: 'Thù lao giảng viên', width: 15, type: 'vnd' }, { key: 'com', header: 'Hoa hồng (gồm thuế)', width: 15, type: 'vnd' },
      { key: 'other', header: 'Chi phí khác', width: 13, type: 'vnd' }, { key: 'profit', header: 'Lợi nhuận', width: 15, type: 'vnd' }, { key: 'margin', header: 'Tỷ suất', width: 8, type: 'pct', ratio: ['profit', 'rev'] },
      { key: 'status', header: 'Trạng thái', width: 12 }, { key: 'contract', header: 'Hợp đồng', width: 16 },
    ],
    summaries: [{ title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ báo cáo', rows: summaryRows(groups, keys, (g) => g.rows, (g, r) => `${g.p.label} · ${r.length} lớp`) }],
    detail: { title: 'II. CHI TIẾT TỪNG LỚP', groups: groups.filter((g) => g.rows.length).map((g) => ({ label: g.p.label, rows: g.rows, unit: 'lớp' })) },
    notes: ['Không tính lớp đã hủy. Hoa hồng và chi phí cấp hợp đồng được phân bổ cho lớp theo tỷ lệ giá lớp trong hợp đồng.', 'Đào tạo ATVSLĐ không chịu thuế GTGT – số liệu không gồm VAT.'],
  };
}

/* ---------- 2. Doanh thu – lợi nhuận (hợp đồng đã ký) ---------- */
function contractRow(q) {
  const p = contractPnl(q);
  return { no: q.contractNo || q.no || '', date: fmtD(q.contractDate), customer: q.customerName || '', classes: p.classes.length, rev: p.rev, gv: p.gv, comAgent: p.com.agentNet + p.com.otherNet, comMgr: p.com.managerNet, comTax: p.com.tax, other: p.other, cost: p.cost, profit: p.profit, paid: p.paid, remain: p.remain, note: p.notes.join('; ') };
}
function repProfit(ctx) {
  const qs = S.quotes.filter((q) => isContract(q) && inR(q.contractDate, ctx)).sort((a, b) => (a.contractDate || '').localeCompare(b.contractDate || ''));
  const groups = byPeriod(qs, (q) => q.contractDate, ctx).map((g) => ({ ...g, rows: g.items.map(contractRow) }));
  const keys = ['classes', 'rev', 'gv', 'comAgent', 'comMgr', 'comTax', 'other', 'cost', 'profit', 'paid', 'remain'];
  const tax = settings().commissionTax ?? 20;
  return {
    sheet: 'Doanh thu – lợi nhuận', title: 'BÁO CÁO DOANH THU – CHI PHÍ – LỢI NHUẬN',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'no', header: 'Số hợp đồng', width: 18 }, { key: 'date', header: 'Ngày ký', width: 11 }, { key: 'customer', header: 'Khách hàng', width: 30 },
      { key: 'classes', header: 'Số lớp', width: 7, type: 'int' }, { key: 'rev', header: 'Doanh thu', width: 15, type: 'vnd' }, { key: 'gv', header: 'Thù lao giảng viên', width: 15, type: 'vnd' },
      { key: 'comAgent', header: 'Hoa hồng đại lý (thực trả)', width: 15, type: 'vnd' }, { key: 'comMgr', header: 'Hoa hồng cán bộ QL khách hàng (thực trả)', width: 16, type: 'vnd' }, { key: 'comTax', header: 'Thuế khấu trừ hoa hồng', width: 14, type: 'vnd' },
      { key: 'other', header: 'Chi phí khác', width: 13, type: 'vnd' }, { key: 'cost', header: 'Tổng chi phí', width: 15, type: 'vnd' }, { key: 'profit', header: 'Lợi nhuận', width: 15, type: 'vnd' },
      { key: 'margin', header: 'Tỷ suất', width: 8, type: 'pct', ratio: ['profit', 'rev'] }, { key: 'paid', header: 'Đã thu', width: 14, type: 'vnd' }, { key: 'remain', header: 'Còn phải thu', width: 14, type: 'vnd' }, { key: 'note', header: 'Ghi chú', width: 22 },
    ],
    summaries: [{ title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ báo cáo', rows: summaryRows(groups, keys, (g) => g.rows, (g, r) => `${g.p.label} · ${r.length} HĐ`) }],
    detail: { title: 'II. CHI TIẾT TỪNG HỢP ĐỒNG', groups: groups.filter((g) => g.rows.length).map((g) => ({ label: g.p.label, rows: g.rows, unit: 'hợp đồng' })) },
    notes: ['Doanh thu tính theo hợp đồng đã ký, ghi nhận theo ngày ký. Lợi nhuận = Doanh thu – Thù lao giảng viên – Hoa hồng thực trả – Thuế khấu trừ hoa hồng – Chi phí khác.', `Thuế khấu trừ hoa hồng mặc định ${tax}% (${settings().commissionTaxMode === 'gross' ? 'tính trên tổng hoa hồng' : 'tính trên số thực trả'}). Không tính VAT (đào tạo ATVSLĐ không chịu thuế GTGT).`],
  };
}

/* ---------- 3. Hợp đồng ---------- */
function repContracts(ctx) {
  const qs = S.quotes.filter((q) => isContract(q) && inR(q.contractDate, ctx)).sort((a, b) => (a.contractDate || '').localeCompare(b.contractDate || ''));
  const row = (q) => { const m = contractMoney(q); const cls = quoteClasses(q).filter((c) => c.status !== 'cancelled'); return { no: q.contractNo || '', date: fmtD(q.contractDate), customer: q.customerName || '', quote: q.no || '', value: m.total, paid: m.paid, remain: m.remain, due: fmtD(dueDate(q)), classes: `${cls.filter((c) => c.status === 'done').length}/${cls.length}`, state: contractState(q).label, files: (q.contractFiles || []).length ? 'Có' : 'Chưa có' }; };
  const groups = byPeriod(qs, (q) => q.contractDate, ctx).map((g) => ({ ...g, rows: g.items.map(row) }));
  return {
    sheet: 'Hợp đồng', title: 'BÁO CÁO HỢP ĐỒNG HUẤN LUYỆN VÀ CÔNG NỢ KHÁCH HÀNG',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'no', header: 'Số hợp đồng', width: 20 }, { key: 'date', header: 'Ngày ký', width: 11 }, { key: 'customer', header: 'Khách hàng', width: 34 }, { key: 'quote', header: 'Số báo giá', width: 16 },
      { key: 'value', header: 'Giá trị hợp đồng', width: 16, type: 'vnd' }, { key: 'paid', header: 'Đã thu', width: 16, type: 'vnd' }, { key: 'remain', header: 'Còn phải thu', width: 16, type: 'vnd' }, { key: 'rate', header: 'Tỷ lệ thu', width: 9, type: 'pct', ratio: ['paid', 'value'] },
      { key: 'due', header: 'Hạn thanh toán', width: 12 }, { key: 'classes', header: 'Lớp xong/tổng', width: 10, align: 'center' }, { key: 'state', header: 'Tình trạng', width: 18 }, { key: 'files', header: 'File HĐ', width: 9, align: 'center' },
    ],
    summaries: [{ title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ báo cáo', rows: summaryRows(groups, ['value', 'paid', 'remain'], (g) => g.rows, (g, r) => `${g.p.label} · ${r.length} hợp đồng`) }],
    detail: { title: 'II. CHI TIẾT HỢP ĐỒNG', groups: groups.filter((g) => g.rows.length).map((g) => ({ label: g.p.label, rows: g.rows, unit: 'hợp đồng' })) },
    notes: ['Hợp đồng ghi nhận theo ngày ký. Đã thu / còn phải thu tính đến ngày lập báo cáo.'],
  };
}

/* ---------- 4. Báo giá ---------- */
function repQuotes(ctx) {
  const qs = S.quotes.filter((q) => inR(q.date, ctx)).sort((a, b) => (a.date || '').localeCompare(b.date || ''));
  const row = (q) => ({ no: q.no || '', date: fmtD(q.date), customer: q.customerName || '', groups: groupsShort(q.groups), students: Number(q.students) || 0, amount: quoteMoney(q).amount, won: isContract(q) ? 1 : 0, status: QUOTE_STATUS[q.status]?.label || '', contract: q.contractNo || '' });
  const groups = byPeriod(qs, (q) => q.date, ctx).map((g) => ({ ...g, rows: g.items.map(row) }));
  const byStatus = Object.entries(QUOTE_STATUS).map(([k, v]) => { const rows = qs.filter((q) => q.status === k).map(row); return { label: `${v.label} · ${rows.length} báo giá`, values: { students: sumBy(rows, 'students'), amount: sumBy(rows, 'amount'), won: sumBy(rows, 'won') } }; }).filter((r) => r.values.amount || r.label.match(/· [1-9]/));
  return {
    sheet: 'Báo giá', title: 'BÁO CÁO BÁO GIÁ HUẤN LUYỆN',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'no', header: 'Số báo giá', width: 18 }, { key: 'date', header: 'Ngày', width: 11 }, { key: 'customer', header: 'Khách hàng', width: 36 }, { key: 'groups', header: 'Nhóm', width: 12 },
      { key: 'students', header: 'Học viên', width: 9, type: 'int' }, { key: 'amount', header: 'Giá trị báo giá', width: 16, type: 'vnd' }, { key: 'won', header: 'Đã ký HĐ', width: 9, type: 'int' },
      { key: 'status', header: 'Trạng thái', width: 20 }, { key: 'contract', header: 'Số hợp đồng', width: 18 },
    ],
    summaries: [
      { title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ báo cáo', rows: summaryRows(groups, ['students', 'amount', 'won'], (g) => g.rows, (g, r) => `${g.p.label} · ${r.length} báo giá`) },
      { title: 'II. TỔNG HỢP THEO TRẠNG THÁI', labelHeader: 'Trạng thái', rows: byStatus },
    ],
    detail: { title: 'III. CHI TIẾT BÁO GIÁ', groups: groups.filter((g) => g.rows.length).map((g) => ({ label: g.p.label, rows: g.rows, unit: 'báo giá' })) },
    notes: ['Báo giá ghi nhận theo ngày báo giá. Cột “Đã ký HĐ” = 1 nếu báo giá đã chuyển thành hợp đồng (dùng để tính tỷ lệ chốt).'],
  };
}

/* ---------- 5. Giảng viên – thù lao ---------- */
function repTrainers(ctx) {
  const items = [];
  for (const x of S.trainers) for (const r of trainerLedger(x.id, ctx.from, ctx.to).rows) items.push({ x, ...r });
  items.sort((a, b) => sortClasses(a.c, b.c) || a.x.name.localeCompare(b.x.name, 'vi'));
  const row = (it) => ({ trainer: it.x.name, phone: it.x.phone || '', region: regionName(it.x.region), date: fmtDateRange(it.c.startDate, it.c.endDate), customer: classLabel(it.c), contract: it.f.contractNo || '', days: it.amount ? it.days : 0, amount: it.amount, pit: it.pit || 0, paid: it.paid, remain: Math.max(0, it.remain), state: it.label });
  const groups = byPeriod(items, (it) => it.c.startDate, ctx).map((g) => ({ ...g, rows: g.items.map(row) }));
  const keys = ['days', 'amount', 'pit', 'paid', 'remain'];
  const byTr = S.trainers.map((x) => { const rows = items.filter((it) => it.x.id === x.id).map(row); return { x, rows }; }).filter((t) => t.rows.length).sort((a, b) => a.x.name.localeCompare(b.x.name, 'vi'));
  return {
    sheet: 'Giảng viên – thù lao', title: 'BÁO CÁO THÙ LAO VÀ CÔNG NỢ GIẢNG VIÊN',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'trainer', header: 'Giảng viên', width: 22 }, { key: 'phone', header: 'Điện thoại', width: 13 }, { key: 'region', header: 'Vùng', width: 14 },
      { key: 'date', header: 'Ngày lớp', width: 15 }, { key: 'customer', header: 'Khách hàng', width: 28 }, { key: 'contract', header: 'Số HĐ thuê GV', width: 16 },
      { key: 'days', header: 'Số ngày', width: 8, type: 'int' }, { key: 'amount', header: 'Thù lao (trước thuế)', width: 15, type: 'vnd' }, { key: 'pit', header: 'Thuế TNCN khấu trừ', width: 13, type: 'vnd' }, { key: 'paid', header: 'Đã trả', width: 15, type: 'vnd' }, { key: 'remain', header: 'Còn phải trả', width: 15, type: 'vnd' }, { key: 'state', header: 'Tình trạng', width: 18 },
    ],
    summaries: [
      { title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ báo cáo', rows: summaryRows(groups, keys, (g) => g.rows, (g, r) => `${g.p.label} · ${r.length} lượt dạy`) },
      { title: 'II. TỔNG HỢP THEO GIẢNG VIÊN', labelHeader: 'Giảng viên', rows: byTr.map((t) => ({ label: `${t.x.name} · ${t.rows.length} lớp`, values: Object.fromEntries(keys.map((k) => [k, sumBy(t.rows, k)])) })) },
    ],
    detail: { title: 'III. CHI TIẾT THÙ LAO TỪNG LỚP', groups: groups.filter((g) => g.rows.length).map((g) => ({ label: g.p.label, rows: g.rows, unit: 'lượt' })) },
    notes: ['Theo ngày bắt đầu lớp. “Đã trả” gồm tạm ứng và thanh toán đã ghi nhận đến ngày lập báo cáo.', 'Còn phải trả = Thù lao – Thuế TNCN DAKO khấu trừ (nộp thay giảng viên) – Đã trả.'],
  };
}

/* ---------- 6. Học viên ---------- */
function repStudents(ctx) {
  const list = allStudents().filter((x) => inR(x.v.issueDate || x.v.to, ctx)).sort((a, b) => (a.v.issueDate || '').localeCompare(b.v.issueDate || '') || (a.v.company || '').localeCompare(b.v.company || '', 'vi'));
  const row = (x) => { const v = x.v; const t = v.certType === 'Thẻ an toàn' ? 'the' : v.certType === 'Giấy chứng nhận' || v.certType === 'Chứng chỉ' ? 'gcn' : 'khac'; return { name: v.name, dob: v.dob, cccd: v.cccd, position: x.s.position || '', company: v.company, group: v.group ? 'Nhóm ' + v.group : '', certNo: v.certNo, issue: fmtD(v.issueDate), expiry: fmtD(v.expiry), state: certStatus(v.expiry).label, gcn: t === 'gcn' ? 1 : 0, the: t === 'the' ? 1 : 0, khac: t === 'khac' ? 1 : 0, total: 1 }; };
  const groups = byPeriod(list, (x) => x.v.issueDate || x.v.to, ctx).map((g) => ({ ...g, rows: g.items.map(row) }));
  const keys = ['gcn', 'the', 'khac', 'total'];
  const cos = new Map(); list.forEach((x) => { const k = x.v.company || '(chưa ghi công ty)'; if (!cos.has(k)) cos.set(k, []); cos.get(k).push(row(x)); });
  return {
    sheet: 'Học viên', title: 'BÁO CÁO HỌC VIÊN ĐƯỢC CẤP THẺ AN TOÀN / GIẤY CHỨNG NHẬN',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'name', header: 'Họ và tên', width: 22 }, { key: 'dob', header: 'Ngày sinh', width: 11 }, { key: 'cccd', header: 'Số CCCD', width: 14 }, { key: 'position', header: 'Chức vụ / công việc', width: 16 },
      { key: 'company', header: 'Đơn vị', width: 26 }, { key: 'group', header: 'Nhóm', width: 8 }, { key: 'certNo', header: 'Số thẻ/GCN', width: 17 }, { key: 'issue', header: 'Ngày cấp', width: 11 }, { key: 'expiry', header: 'Hiệu lực đến', width: 11 }, { key: 'state', header: 'Tình trạng', width: 12 },
      { key: 'gcn', header: 'GCN / chứng chỉ', width: 9, type: 'int' }, { key: 'the', header: 'Thẻ an toàn', width: 8, type: 'int' }, { key: 'khac', header: 'Sổ theo dõi / khác', width: 9, type: 'int' }, { key: 'total', header: 'Tổng', width: 7, type: 'int' },
    ],
    summaries: [
      { title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ cấp', rows: summaryRows(groups, keys, (g) => g.rows, (g) => g.p.label) },
      { title: 'II. TỔNG HỢP THEO ĐƠN VỊ', labelHeader: 'Đơn vị', rows: Array.from(cos.entries()).sort((a, b) => a[0].localeCompare(b[0], 'vi')).map(([k, rows]) => ({ label: k, values: Object.fromEntries(keys.map((kk) => [kk, sumBy(rows, kk)])) })) },
    ],
    detail: { title: 'III. DANH SÁCH HỌC VIÊN', groups: groups.filter((g) => g.rows.length).map((g) => ({ label: g.p.label, rows: g.rows, unit: 'học viên' })) },
    notes: ['Theo ngày cấp thẻ/GCN (nếu chưa có ngày cấp thì theo ngày kết thúc khóa học). Hiệu lực chưa ghi trong sổ cấp được tự tính theo nhóm.'],
  };
}

/* ---------- 7. Khách hàng ---------- */
function repCustomers(ctx) {
  const act = (cu) => {
    const cls = S.classes.filter((c) => c.customerId === cu.id && c.status !== 'cancelled' && inR(c.startDate, ctx));
    const qs = S.quotes.filter((q) => q.customerId === cu.id && isContract(q) && inR(q.contractDate, ctx));
    const st = allStudents().filter((x) => x.r.customerId === cu.id && inR(x.v.issueDate || x.v.to, ctx));
    return { cls, qs, st };
  };
  const rows = S.customers.map((cu) => ({ cu, a: act(cu) })).filter((o) => o.a.cls.length || o.a.qs.length || o.a.st.length)
    .map(({ cu, a }) => { const d = customerDues(cu.id)[0]; return { region: cu.region || '', name: cu.name, tax: cu.taxCode || '', contact: [cu.contact, cu.phone].filter(Boolean).join(' · '), classes: a.cls.length, students: sum(a.cls, (c) => c.students), certs: a.st.length, rev: sum(a.qs, contractValue), paid: sum(a.qs, (q) => contractMoney(q).paid), remain: sum(a.qs, (q) => contractMoney(q).remain), due: d ? `${fmtD(d.due)} (N${d.group})` : '' }; })
    .sort((a, b) => b.rev - a.rev || a.name.localeCompare(b.name, 'vi'));
  const regs = [...regionList().map((r) => r.id), ''];
  const items = [...S.classes.filter((c) => c.status !== 'cancelled' && inR(c.startDate, ctx)).map((c) => ({ d: c.startDate, classes: 1, students: Number(c.students) || 0 })), ...S.quotes.filter((q) => isContract(q) && inR(q.contractDate, ctx)).map((q) => ({ d: q.contractDate, rev: contractValue(q) })), ...allStudents().filter((x) => inR(x.v.issueDate || x.v.to, ctx)).map((x) => ({ d: x.v.issueDate || x.v.to, certs: 1 }))];
  const per = byPeriod(items, (it) => it.d, ctx);
  return {
    sheet: 'Khách hàng', title: 'BÁO CÁO KHÁCH HÀNG HUẤN LUYỆN',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'name', header: 'Khách hàng', width: 36 }, { key: 'tax', header: 'Mã số thuế', width: 13 }, { key: 'contact', header: 'Liên hệ', width: 24 },
      { key: 'classes', header: 'Số lớp', width: 8, type: 'int' }, { key: 'students', header: 'Học viên', width: 9, type: 'int' }, { key: 'certs', header: 'Thẻ/GCN cấp', width: 9, type: 'int' },
      { key: 'rev', header: 'Doanh thu hợp đồng', width: 16, type: 'vnd' }, { key: 'paid', header: 'Đã thu', width: 15, type: 'vnd' }, { key: 'remain', header: 'Còn phải thu', width: 15, type: 'vnd' }, { key: 'due', header: 'Định kỳ tiếp theo', width: 16 },
    ],
    summaries: [{ title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ báo cáo', rows: per.map((g) => ({ label: g.p.label, values: { classes: sumBy(g.items, 'classes'), students: sumBy(g.items, 'students'), certs: sumBy(g.items, 'certs'), rev: sumBy(g.items, 'rev') } })) }],
    detail: { title: 'II. CHI TIẾT THEO VÙNG ĐÀO TẠO', groups: regs.map((rid) => ({ label: rid ? regionName(rid) : 'Chưa xác định vùng', rows: rows.filter((r) => r.region === rid), unit: 'khách hàng' })).filter((g) => g.rows.length) },
    notes: ['Chỉ liệt kê khách hàng có lớp học, hợp đồng ký hoặc học viên được cấp thẻ/GCN trong kỳ. Doanh thu theo hợp đồng ký trong kỳ.'],
  };
}

/* ---------- 0. Tổng quan ---------- */
function repOverview(ctx) {
  const cls = S.classes.filter((c) => c.status !== 'cancelled' && inR(c.startDate, ctx));
  const qs = S.quotes.filter((q) => isContract(q) && inR(q.contractDate, ctx));
  const st = allStudents().filter((x) => inR(x.v.issueDate || x.v.to, ctx));
  const items = [...cls.map((c) => ({ d: c.startDate, classes: 1, students: Number(c.students) || 0 })), ...st.map((x) => ({ d: x.v.issueDate || x.v.to, certs: 1 })),
    ...qs.map((q) => { const p = contractPnl(q); return { d: q.contractDate, contracts: 1, rev: p.rev, gv: p.gv, com: p.com.gross, other: p.other, profit: p.profit, paid: p.paid, remain: p.remain }; })];
  const per = byPeriod(items, (it) => it.d, ctx);
  const keys = ['classes', 'students', 'certs', 'contracts', 'rev', 'gv', 'com', 'other', 'profit', 'paid', 'remain'];
  const P = qs.map(contractPnl); const rev = sum(P, (p) => p.rev); const prof = sum(P, (p) => p.profit);
  const owe = sum(S.trainers, (x) => trainerLedger(x.id).remain);
  const pend = S.quotes.filter((q) => ['sent', 'negotiating', 'accepted'].includes(q.status));
  const alerts = computeAlerts().filter((a) => a.sev !== 'info').slice(0, 25);
  return {
    sheet: 'Tổng quan', title: 'BÁO CÁO TỔNG HỢP HOẠT ĐỘNG HUẤN LUYỆN ATVSLĐ',
    columns: [
      { key: 'label', header: 'Kỳ báo cáo', width: 30 }, { key: 'classes', header: 'Lớp học', width: 8, type: 'int' }, { key: 'students', header: 'Học viên', width: 9, type: 'int' }, { key: 'certs', header: 'Thẻ/GCN cấp', width: 9, type: 'int' },
      { key: 'contracts', header: 'HĐ ký', width: 7, type: 'int' }, { key: 'rev', header: 'Doanh thu (HĐ đã ký)', width: 16, type: 'vnd' }, { key: 'gv', header: 'Thù lao giảng viên', width: 15, type: 'vnd' }, { key: 'com', header: 'Hoa hồng (gồm thuế)', width: 15, type: 'vnd' },
      { key: 'other', header: 'Chi phí khác', width: 13, type: 'vnd' }, { key: 'profit', header: 'Lợi nhuận', width: 15, type: 'vnd' }, { key: 'margin', header: 'Tỷ suất', width: 8, type: 'pct', ratio: ['profit', 'rev'] },
      { key: 'paid', header: 'Đã thu', width: 14, type: 'vnd' }, { key: 'remain', header: 'Còn phải thu', width: 14, type: 'vnd' },
    ],
    kv: { title: 'I. CHỈ TIÊU CHÍNH TRONG KỲ', rows: [
      ['Số lớp huấn luyện (không tính lớp hủy)', cls.length, 'int'], ['Số học viên tham gia', sum(cls, (c) => c.students), 'int'], ['Số thẻ/GCN đã cấp', st.length, 'int'],
      ['Số hợp đồng ký mới', qs.length, 'int'], ['Doanh thu (hợp đồng đã ký)', rev, 'vnd'], ['Tổng chi phí (GV, hoa hồng, thuế hoa hồng, chi phí khác)', rev - prof, 'vnd'], ['Lợi nhuận', prof, 'vnd'],
      ['Tỷ suất lợi nhuận', rev ? prof / rev : 0, 'pct'], ['Khách hàng còn nợ (toàn bộ hợp đồng, đến nay)', sum(S.quotes.filter(isContract), (q) => contractMoney(q).remain), 'vnd'],
      ['Thù lao giảng viên còn phải trả (đến nay)', owe, 'vnd'], ['Báo giá đang chờ kết quả (đến nay)', `${pend.length} báo giá · ${moneyD(sum(pend, (q) => quoteMoney(q).amount))}`, 'text'],
    ] },
    summaries: [{ title: `II. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ báo cáo', rows: per.map((g) => ({ label: g.p.label, values: Object.fromEntries(keys.map((k) => [k, sumBy(g.items, k)])) })) }],
    list: alerts.length ? { title: 'III. VIỆC CẦN XỬ LÝ (TẠI NGÀY LẬP BÁO CÁO)', rows: alerts.map((a) => (a.sev === 'bad' ? '[Gấp] ' : '') + a.text) } : null,
    notes: ['Các sheet tiếp theo là báo cáo chi tiết của từng tab: Lịch giảng dạy, Doanh thu – lợi nhuận, Hợp đồng, Báo giá, Giảng viên – thù lao, Hợp đồng giảng viên, Học viên, Số quyết định, Khách hàng.'],
  };
}

/* ---------- 8. Hợp đồng giảng viên ---------- */
function repTrainerContracts(ctx) {
  const list = S.tcontracts.filter((x) => inR(x.signDate, ctx)).sort((a, b) => (a.signDate || '').localeCompare(b.signDate || '') || (a.kind === 'nt' ? -1 : 1));
  const row = (x) => {
    const mm = x.kind === 'pl' ? plMoney(x) : null; const pay = x.kind === 'pl' ? plPayment(x) : null; const nt = x.kind === 'pl' ? tcontract(x.parentId) : null;
    return { no: x.no || '', kind: x.kind === 'nt' ? 'HĐ nguyên tắc' : `Phụ lục số ${padNo(x.seq)}${nt ? ' – HĐ ' + nt.no : ''}`, trainer: trainer(x.trainerId)?.name || x.trainerName || '', date: fmtD(x.signDate),
      scope: x.kind === 'nt' ? `${fmtD(x.from)} – ${fmtD(x.to)}` : (x.rows || []).map((r) => `${r.customer}${r.time ? ' (' + r.time + ')' : ''}`).join('; '),
      nt: x.kind === 'nt' ? 1 : 0, pl: x.kind === 'pl' ? 1 : 0, total: mm ? mm.total : 0, travel: mm ? mm.travel : 0, pit: mm ? mm.pit : 0, net: mm ? mm.net : 0, paid: pay ? pay.paid : 0, remain: pay ? Math.max(0, pay.remain) : 0,
      state: tcState(x).label, file: (x.files || []).length ? 'Có bản ký' : x.docFile ? 'Có file Word' : 'Chưa có' };
  };
  const live = list.filter((x) => x.status !== 'cancelled');
  const groups = byPeriod(list, (x) => x.signDate, ctx).map((g) => ({ ...g, rows: g.items.map(row) }));
  const keys = ['nt', 'pl', 'total', 'travel', 'pit', 'net', 'paid', 'remain'];
  const byTr = uniq(live.map((x) => x.trainerId)).map((tid) => ({ name: trainer(tid)?.name || live.find((x) => x.trainerId === tid)?.trainerName || '', rows: live.filter((x) => x.trainerId === tid).map(row) })).sort((a, b) => a.name.localeCompare(b.name, 'vi'));
  return {
    sheet: 'Hợp đồng giảng viên', title: 'SỔ THEO DÕI HỢP ĐỒNG GIẢNG VIÊN THỈNH GIẢNG',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'no', header: 'Số hợp đồng / phụ lục', width: 20 }, { key: 'kind', header: 'Loại', width: 20 }, { key: 'trainer', header: 'Giảng viên', width: 20 }, { key: 'date', header: 'Ngày ký', width: 11 },
      { key: 'scope', header: 'Hiệu lực / lớp dạy', width: 30 }, { key: 'nt', header: 'HĐ nguyên tắc', width: 9, type: 'int' }, { key: 'pl', header: 'Phụ lục', width: 8, type: 'int' },
      { key: 'total', header: 'Giá trị phụ lục', width: 14, type: 'vnd' }, { key: 'travel', header: 'Hỗ trợ đi lại', width: 12, type: 'vnd' }, { key: 'pit', header: 'Thuế TNCN', width: 12, type: 'vnd' }, { key: 'net', header: 'Thực nhận', width: 14, type: 'vnd' },
      { key: 'paid', header: 'Đã trả', width: 13, type: 'vnd' }, { key: 'remain', header: 'Còn phải trả', width: 13, type: 'vnd' }, { key: 'state', header: 'Tình trạng', width: 18 }, { key: 'file', header: 'Hồ sơ', width: 12 },
    ],
    summaries: [
      { title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ ký', rows: summaryRows(groups, keys, (g) => g.rows.filter((r, i) => g.items[i].status !== 'cancelled'), (g) => g.p.label) },
      { title: 'II. TỔNG HỢP THEO GIẢNG VIÊN', labelHeader: 'Giảng viên', rows: byTr.map((t) => ({ label: t.name, values: Object.fromEntries(keys.map((k) => [k, sumBy(t.rows, k)])) })) },
    ],
    detail: { title: 'III. CHI TIẾT HỢP ĐỒNG – PHỤ LỤC', groups: groups.filter((g) => g.rows.length).map((g) => ({ label: g.p.label, rows: g.rows, unit: 'văn bản' })) },
    notes: ['Theo ngày ký. Phần tổng hợp không tính văn bản đã hủy. Thực nhận = Giá trị phụ lục + Hỗ trợ đi lại – Thuế TNCN khấu trừ; Đã trả lấy từ các lớp thuộc phụ lục (tab Thù lao & công nợ).',
      `Số hợp đồng theo mẫu ${tcFmt('nt')}, số phụ lục theo mẫu ${tcFmt('pl')}.`],
  };
}

/* ---------- 9. Số quyết định hoàn thành khóa học ---------- */
function repDecisions(ctx) {
  const list = S.decisions.filter((d) => inR(d.date, ctx)).sort((a, b) => (a.date || '').localeCompare(b.date || '') || decStt(a) - decStt(b));
  const gk = Object.keys(GROUPS);
  const row = (d) => {
    const g = decGroup(d); const o = { no: d.no || '', date: fmtD(d.date), group: g ? 'N' + g : '', customer: d.customerName || '', course: fmtDateRange(d.courseFrom, d.courseTo), title: d.title || '', signer: d.signer || '', state: (DEC_STATUS[d.status || 'draft'] || DEC_STATUS.draft).label, file: (d.files || []).length ? 'Có' : 'Chưa có', total: d.status === 'cancelled' ? 0 : 1, students: d.status === 'cancelled' ? 0 : Number(d.students) || 0 };
    gk.forEach((k) => (o['n' + k] = d.status !== 'cancelled' && g === Number(k) ? 1 : 0));
    return o;
  };
  const groups = byPeriod(list, (d) => d.date, ctx).map((g) => ({ ...g, rows: g.items.map(row) }));
  const keys = [...gk.map((k) => 'n' + k), 'total', 'students'];
  const years = uniq(list.map(decYear));
  const audit = [];
  for (const y of years) {
    for (const ds of decDuplicates(S.decisions.filter((d) => decYear(d) === y))) audit.push(`Trùng số năm ${y}: ${ds.map((d) => d.no).join(' / ')}`);
    for (const g of decSeqMode() === 'year' ? [null] : gk) { const gaps = decGaps(y, g); if (gaps.length) audit.push(`Số bỏ trống năm ${y}${g ? ` nhóm ${g}` : ''}: ${gaps.map(padNo).join(', ')}`); }
  }
  return {
    sheet: 'Số quyết định', title: 'SỔ THEO DÕI SỐ QUYẾT ĐỊNH HOÀN THÀNH KHÓA HỌC',
    columns: [
      { key: 'stt', header: 'STT', width: 5, align: 'center' }, { key: 'no', header: 'Số quyết định', width: 18 }, { key: 'date', header: 'Ngày', width: 11 }, { key: 'group', header: 'Nhóm', width: 7, align: 'center' },
      { key: 'customer', header: 'Khách hàng', width: 28 }, { key: 'course', header: 'Khóa học', width: 15 }, { key: 'title', header: 'Trích yếu', width: 26 }, { key: 'signer', header: 'Người ký', width: 16 }, { key: 'state', header: 'Tình trạng', width: 13 }, { key: 'file', header: 'File QĐ', width: 8 },
      ...gk.map((k) => ({ key: 'n' + k, header: 'N' + k, width: 5, type: 'int' })), { key: 'total', header: 'Số QĐ', width: 7, type: 'int' }, { key: 'students', header: 'Học viên', width: 9, type: 'int' },
    ],
    summaries: [
      { title: `I. TỔNG HỢP THEO ${GRAN[ctx.gran].toUpperCase()}`, labelHeader: 'Kỳ ban hành', rows: summaryRows(groups, keys, (g) => g.rows, (g) => g.p.label) },
    ],
    detail: { title: 'II. CHI TIẾT TỪNG QUYẾT ĐỊNH', groups: groups.filter((g) => g.rows.length).map((g) => ({ label: g.p.label, rows: g.rows, unit: 'quyết định' })) },
    list: audit.length ? { title: 'III. KIỂM TRA SỐ QUYẾT ĐỊNH', rows: audit } : null,
    notes: [`Số quyết định dạng ${decFmt()} – ${decSeqMode() === 'year' ? 'đánh số liên tục cả 6 nhóm trong năm' : 'mỗi nhóm một dãy số riêng'}, đánh lại từ 01 mỗi năm. Quyết định đã hủy vẫn giữ số, không tính vào tổng.`],
  };
}

const REPORTS = { 'tong-quan': repOverview, lich: repClasses, 'doanh-thu': repProfit, 'hop-dong': repContracts, 'bao-gia': repQuotes, 'giang-vien': repTrainers, 'hoc-vien': repStudents, 'khach-hang': repCustomers, 'quyet-dinh': repDecisions };

/* ---------- ghi file Excel ---------- */
const XL = { font: 'Times New Roman', navy: 'FF0B2E7A', blue: 'FF1446B8', orange: 'FFEE6517', head: 'FFDCE6F7', group: 'FFF1F5FC', sub: 'FFE7EEFB', total: 'FFCCDAF5', line: 'FFAEBBD3', red: 'FFC42639' };
const colL = (i) => { let s = ''; i += 1; while (i > 0) { const m = (i - 1) % 26; s = String.fromCharCode(65 + m) + s; i = Math.floor((i - 1) / 26); } return s; };
/** Định dạng số cố định dấu chấm phần nghìn (không phụ thuộc cài đặt vùng của máy). */
function numFmt(v, unit) {
  const a = Math.abs(Math.round(Number(v) || 0));
  const core = a >= 1e9 ? '#"."000"."000"."000' : a >= 1e6 ? '#"."000"."000' : a >= 1e3 ? '#"."000' : '0';
  const u = unit ? `" ${unit}"` : '';
  return `${core}${u};-${core}${u}`;
}
async function logoPng() {
  try {
    const img = $('.mast-logo'); if (!img) return null;
    if (!img.complete) await new Promise((r) => { img.onload = r; img.onerror = r; });
    const cv = document.createElement('canvas'); cv.width = 160; cv.height = 160;
    const g = cv.getContext('2d'); g.fillStyle = '#fff'; g.beginPath(); g.arc(80, 80, 80, 0, Math.PI * 2); g.fill(); g.drawImage(img, 0, 0, 160, 160);
    return cv.toDataURL('image/png');
  } catch (e) { return null; }
}
async function writeWorkbook(reports, ctx, filename) {
  const ExcelJS = await lib('exceljs');
  if (!ExcelJS) throw new Error('Không tải được thư viện Excel – kiểm tra kết nối mạng.');
  const wb = new ExcelJS.Workbook(); wb.creator = 'DAKO – Quản lý huấn luyện ATVSLĐ'; wb.created = new Date();
  const logo = await logoPng(); const logoId = logo ? wb.addImage({ base64: logo, extension: 'png' }) : null;
  const used = new Set();
  for (const R of reports) {
    let name = R.sheet.replace(/[\\/?*[\]:]/g, '-').slice(0, 31); let k = 2; while (used.has(name)) name = `${R.sheet.slice(0, 28)} ${k++}`; used.add(name);
    writeSheet(wb.addWorksheet(name), R, logoId, ctx);
  }
  const buf = await wb.xlsx.writeBuffer();
  return Store.backend.download(filename, new Blob([buf], { type: XLSX_MIME }));
}
function writeSheet(ws, R, logoId, ctx) {
  const cols = R.columns; const N = cols.length; const co = { ...DEFAULT_SETTINGS.company, ...(settings().company || {}) };
  const firstNum = Math.max(1, cols.findIndex((c) => c.type && c.type !== 'text'));
  ws.columns = cols.map((c) => ({ width: c.width }));
  ws.properties.defaultRowHeight = 16;
  ws.views = [{ showGridLines: false }];
  ws.pageSetup = { paperSize: 9, orientation: N > 9 ? 'landscape' : 'portrait', fitToPage: true, fitToWidth: 1, fitToHeight: 0, horizontalCentered: true, margins: { left: 0.4, right: 0.4, top: 0.5, bottom: 0.55, header: 0.25, footer: 0.25 } };
  ws.headerFooter.oddFooter = `&L&"Times New Roman,Italic"&8${co.name} – ${R.title.toLowerCase()}&R&"Times New Roman,Regular"&8Trang &P/&N`;
  const F = (o = {}) => ({ name: XL.font, size: 11, ...o });
  const border = (style = 'thin') => ({ top: { style, color: { argb: XL.line } }, left: { style: 'thin', color: { argb: XL.line } }, bottom: { style, color: { argb: XL.line } }, right: { style: 'thin', color: { argb: XL.line } } });
  const fill = (argb) => ({ type: 'pattern', pattern: 'solid', fgColor: { argb } });
  let r = 1;
  const put = (row, col, value, style = {}) => { const cell = ws.getCell(row, col); cell.value = value; cell.font = F(style.font); if (style.fill) cell.fill = fill(style.fill); if (style.border) cell.border = style.border; cell.alignment = { vertical: 'middle', wrapText: true, ...(style.align || {}) }; if (style.numFmt) cell.numFmt = style.numFmt; return cell; };
  const mergeRow = (row, c1, c2, value, style) => { if (c2 > c1) ws.mergeCells(row, c1, row, c2); return put(row, c1, value, style); };

  // ---- khối tiêu đề công ty ----
  let acc = 0; let tc = 1; while (tc < N && acc < 9) { acc += cols[tc - 1].width; tc++; }
  mergeRow(1, tc, N, co.name, { font: { size: 13, bold: true, color: { argb: XL.blue } } });
  mergeRow(2, tc, N, `Địa chỉ: ${co.address}`, { font: { size: 10 } });
  mergeRow(3, tc, N, `Hotline: ${co.phone}  ·  Email: ${co.email}`, { font: { size: 10 } });
  ws.getRow(1).height = 20; ws.getRow(2).height = 15; ws.getRow(3).height = 15;
  if (logoId !== null) ws.addImage(logoId, { tl: { col: 0.08, row: 0.1 }, ext: { width: 54, height: 54 }, editAs: 'oneCell' });
  r = 5;
  mergeRow(r, 1, N, R.title, { font: { size: 16, bold: true, color: { argb: XL.navy } }, align: { horizontal: 'center' } }); ws.getRow(r).height = 26; r++;
  mergeRow(r, 1, N, `Kỳ báo cáo: ${ctx.label && !/\(/.test(ctx.label) ? `${ctx.label} (từ ${fmtD(ctx.from)} đến ${fmtD(ctx.to)})` : ctx.label || `từ ${fmtD(ctx.from)} đến ${fmtD(ctx.to)}`}  ·  ${granText(ctx.gran)}`, { font: { italic: true }, align: { horizontal: 'center' } }); r++;
  mergeRow(r, 1, N, `Ngày lập: ${fmtStamp(new Date().toISOString())}  ·  Đơn vị tính: đồng (không gồm VAT)`, { font: { size: 10, italic: true, color: { argb: 'FF555555' } }, align: { horizontal: 'center' } }); r += 2;

  const sectionTitle = (t) => { mergeRow(r, 1, N, t, { font: { bold: true, size: 12, color: { argb: XL.navy } } }); ws.getRow(r).height = 20; r++; };
  const fmtCell = (cell, col, v, rowNo) => {
    if (col.type === 'pct') {
      if (col.ratio) { const ni = cols.findIndex((c) => c.key === col.ratio[0]); const di = cols.findIndex((c) => c.key === col.ratio[1]); cell.value = { formula: `IF(${colL(di)}${rowNo}=0,"",${colL(ni)}${rowNo}/${colL(di)}${rowNo})`, result: v === '' ? '' : v }; } else cell.value = v;
      cell.numFmt = '0%'; cell.alignment = { vertical: 'middle', horizontal: 'right' }; return;
    }
    if (col.type === 'vnd' || col.type === 'int') { cell.numFmt = numFmt(typeof v === 'object' && v ? v.result : v, col.type === 'vnd' ? 'đ' : ''); cell.alignment = { vertical: 'middle', horizontal: 'right' }; if ((typeof v === 'number' && v < 0) || (v && v.result < 0)) cell.font = F({ ...(cell.font || {}), color: { argb: XL.red } }); }
  };
  const ratioOf = (col, vals) => { const n = Number(vals[col.ratio?.[0]]) || 0; const d = Number(vals[col.ratio?.[1]]) || 0; return d ? n / d : ''; };
  const headerRow = (labelHeader, fullHeader) => {
    if (fullHeader) cols.forEach((c, i) => put(r, i + 1, c.header, { font: { bold: true, size: 10 }, fill: XL.head, border: border(), align: { horizontal: 'center' } }));
    else {
      mergeRow(r, 1, firstNum, labelHeader, { font: { bold: true, size: 10 }, fill: XL.head, border: border(), align: { horizontal: 'center' } });
      for (let i = 1; i < firstNum; i++) ws.getCell(r, i + 1).border = border();
      cols.forEach((c, i) => { if (i >= firstNum) put(r, i + 1, c.type ? c.header : '', { font: { bold: true, size: 10 }, fill: XL.head, border: border(), align: { horizontal: 'center' } }); });
    }
    ws.getRow(r).height = 30; r++;
  };
  const valueRow = (label, vals, style) => {
    mergeRow(r, 1, firstNum, label, { font: { bold: !!style.bold, italic: !!style.italic }, fill: style.fill, border: border(style.edge) });
    for (let i = 1; i < firstNum; i++) { const cc = ws.getCell(r, i + 1); cc.border = border(style.edge); if (style.fill) cc.fill = fill(style.fill); }
    cols.forEach((c, i) => {
      if (i < firstNum) return;
      const cell = put(r, i + 1, null, { font: { bold: !!style.bold }, fill: style.fill, border: border(style.edge) });
      if (!c.type) { cell.value = vals[c.key] ?? ''; return; }
      if (c.type === 'pct') fmtCell(cell, c, ratioOf(c, vals), r);
      else { const v = style.formula && style.formula[c.key] ? { formula: style.formula[c.key], result: Number(vals[c.key]) || 0 } : Number(vals[c.key]) || 0; cell.value = v; fmtCell(cell, c, v, r); }
    });
    r++;
  };

  // ---- I. chỉ tiêu (dạng nhãn – giá trị) ----
  if (R.kv) {
    sectionTitle(R.kv.title);
    const vc = Math.min(N, Math.max(2, firstNum + 2));
    for (const [label, v, type] of R.kv.rows) {
      mergeRow(r, 1, vc - 1, label, { border: border() }); for (let i = 2; i < vc; i++) ws.getCell(r, i).border = border();
      const span = Math.min(N, vc + 2); const cell = mergeRow(r, vc, span, null, { font: { bold: true }, border: border(), align: { horizontal: 'right' } });
      for (let i = vc + 1; i <= span; i++) ws.getCell(r, i).border = border();
      if (type === 'text') cell.value = v; else { cell.value = Number(v) || 0; cell.numFmt = type === 'pct' ? '0%' : numFmt(v, type === 'vnd' ? 'đ' : ''); }
      r++;
    }
    r++;
  }
  // ---- các bảng tổng hợp ----
  for (const sm of R.summaries || []) {
    sectionTitle(sm.title);
    if (!sm.rows.length) { mergeRow(r, 1, N, 'Không có dữ liệu trong kỳ.', { font: { italic: true } }); r += 2; continue; }
    headerRow(sm.labelHeader || 'Nội dung', false);
    const r0 = r;
    sm.rows.forEach((row) => valueRow(row.label, row.values, {}));
    const tot = {}; const fml = {};
    cols.forEach((c, i) => { if (c.type === 'int' || c.type === 'vnd') { tot[c.key] = sum(sm.rows, (x) => x.values[c.key]); fml[c.key] = `SUM(${colL(i)}${r0}:${colL(i)}${r - 1})`; } });
    valueRow('TỔNG CỘNG', tot, { bold: true, fill: XL.total, edge: 'medium', formula: fml });
    r++;
  }
  // ---- chi tiết ----
  if (R.detail) {
    sectionTitle(R.detail.title);
    const groups = R.detail.groups || [];
    if (!groups.length) { mergeRow(r, 1, N, 'Không có dữ liệu trong kỳ.', { font: { italic: true } }); r += 2; }
    else {
      headerRow('', true);
      const d0 = r; let stt = 0; const grand = {};
      for (const g of groups) {
        mergeRow(r, 1, N, `${g.label} (${g.rows.length} ${g.unit || 'dòng'})`, { font: { bold: true, color: { argb: XL.navy } }, fill: XL.group, border: border() });
        for (let i = 2; i <= N; i++) { ws.getCell(r, i).border = border(); ws.getCell(r, i).fill = fill(XL.group); }
        r++;
        const g0 = r;
        for (const row of g.rows) {
          stt++;
          cols.forEach((c, i) => {
            const cell = put(r, i + 1, null, { font: { size: 10.5 }, border: border(), align: c.align === 'center' ? { horizontal: 'center' } : {} });
            if (c.key === 'stt') { cell.value = stt; cell.alignment = { vertical: 'middle', horizontal: 'center' }; return; }
            if (!c.type) { cell.value = row[c.key] ?? ''; return; }
            if (c.type === 'pct') { fmtCell(cell, c, ratioOf(c, row), r); return; }
            const v = Number(row[c.key]) || 0; cell.value = v; fmtCell(cell, c, v, r);
          });
          r++;
        }
        const subVals = {}; const fml = {};
        cols.forEach((c, i) => { if (c.type === 'int' || c.type === 'vnd') { subVals[c.key] = sum(g.rows, (x) => x[c.key]); grand[c.key] = (grand[c.key] || 0) + subVals[c.key]; fml[c.key] = `SUBTOTAL(9,${colL(i)}${g0}:${colL(i)}${r - 1})`; } });
        valueRow(`Cộng ${g.label}`, subVals, { bold: true, italic: true, fill: XL.sub, formula: fml });
      }
      const fml = {};
      cols.forEach((c, i) => { if (c.type === 'int' || c.type === 'vnd') fml[c.key] = `SUBTOTAL(9,${colL(i)}${d0}:${colL(i)}${r - 1})`; });
      valueRow(`TỔNG CỘNG (${stt} ${groups[0].unit || 'dòng'})`, grand, { bold: true, fill: XL.total, edge: 'medium', formula: fml });
      r++;
    }
  }
  // ---- danh sách việc cần xử lý ----
  if (R.list) { sectionTitle(R.list.title); R.list.rows.forEach((t, i) => { mergeRow(r, 1, N, `${i + 1}. ${t}`, { font: { size: 10.5 } }); r++; }); r++; }
  // ---- ghi chú & khối ký ----
  (R.notes || []).forEach((t) => { mergeRow(r, 1, N, `Ghi chú: ${t}`, { font: { size: 9.5, italic: true, color: { argb: 'FF555555' } } }); r++; });
  r++;
  const d = new Date(); const half = Math.max(1, Math.floor(N / 2));
  mergeRow(r, half + 1, N, `${co.city}, ngày ${pad(d.getDate())} tháng ${pad(d.getMonth() + 1)} năm ${d.getFullYear()}`, { font: { italic: true }, align: { horizontal: 'center' } }); r++;
  mergeRow(r, 1, half, 'NGƯỜI LẬP BIỂU', { font: { bold: true }, align: { horizontal: 'center' } }); mergeRow(r, half + 1, N, 'GIÁM ĐỐC', { font: { bold: true }, align: { horizontal: 'center' } }); r++;
  mergeRow(r, 1, half, '(Ký, ghi rõ họ tên)', { font: { italic: true, size: 10 }, align: { horizontal: 'center' } }); mergeRow(r, half + 1, N, '(Ký, đóng dấu)', { font: { italic: true, size: 10 }, align: { horizontal: 'center' } }); r += 4;
  mergeRow(r, half + 1, N, co.director || '', { font: { bold: true }, align: { horizontal: 'center' } });
}
