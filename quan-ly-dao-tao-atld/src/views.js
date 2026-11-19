/* ============================================================
   VIEWS – mỗi tab: mount(el) dựng khung + thanh công cụ, update() vẽ lại nội dung
   ============================================================ */

const regionChips = (sel, counts = null, act = 'region') => `<div class="chips" role="group" aria-label="Lọc theo vùng đào tạo">
  <button type="button" class="chip" data-act="${act}" data-v="all" aria-pressed="${sel === 'all'}">Tất cả vùng${counts ? ` <span class="count">${counts.all || 0}</span>` : ''}</button>
  ${regionList().map((r) => `<button type="button" class="chip" data-act="${act}" data-v="${esc(r.id)}" aria-pressed="${sel === r.id}"><span class="sw" style="background:${regionColor(r.id)}"></span>${esc(r.name)} <span class="count">· ${esc(r.center)}${counts ? ` · ${counts[r.id] || 0}` : ''}</span></button>`).join('')}
</div>`;
const emptyBox = (title, text = '', btn = '') => `<div class="empty"><b>${esc(title)}</b>${text ? esc(text) : ''}${btn ? `<div style="margin-top:10px">${btn}</div>` : ''}</div>`;
const exportBtn = (tab) => `<button type="button" class="btn" data-act="export" data-v="${tab}">${ic('table')} Xuất Excel</button>`;
const kpi = (k, v, d, hl = false, tone = '') => `<div class="kpi${hl ? ' hl' : ''}${tone ? ' ' + tone : ''}"><span class="k">${k}</span><span class="v">${v}</span><span class="d">${d}</span></div>`;
const moneyCell = (n, cls = '') => `<td class="r ${cls}"${n < 0 ? ' style="color:var(--bad)"' : ''}>${money(n)}</td>`;

/** Kỳ đang xem dùng chung cho Tổng quan và Doanh thu – Lợi nhuận. */
function viewPeriod(kind, ym) {
  if (kind === 'all') return { from: '0000-01-01', to: '9999-12-31', label: 'Tất cả thời gian' };
  const p = periodOf(ym + '-01', kind);
  return { from: p.start, to: p.end, label: p.label };
}
const periodSeg = (cur, act, opts = ['month', 'quarter', 'year']) => opts.map((k) => `<button type="button" data-act="${act}" data-v="${k}" aria-pressed="${cur === k}">${{ month: 'Tháng', quarter: 'Quý', year: 'Năm', all: 'Tất cả' }[k]}</button>`).join('');
const stepOf = (kind) => ({ month: 1, quarter: 3, year: 12 }[kind] || 0);

/* ================= TỔNG QUAN ================= */
const OverviewView = {
  mount(el) {
    S.ui.ovPeriod = S.ui.ovPeriod || 'month'; S.ui.ovMonth = S.ui.ovMonth || todayISO().slice(0, 7);
    el.innerHTML = `<div class="page-head"><div><h1>Tổng quan</h1><div class="sub">Tình hình huấn luyện ATVSLĐ, doanh thu – lợi nhuận và các việc cần xử lý</div></div>
      <div class="actions"><div class="seg" data-ov-seg></div><div class="cal-nav"><button type="button" class="btn icon" data-act="ov-prev" aria-label="Kỳ trước">${ic('left')}</button><h2 data-ov-label style="font-size:15px;min-width:120px"></h2><button type="button" class="btn icon" data-act="ov-next" aria-label="Kỳ sau">${ic('right')}</button></div>
      <button type="button" class="btn primary" data-act="export" data-v="tong-quan">${ic('table')} Xuất Excel tổng hợp</button></div></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el; const P = viewPeriod(S.ui.ovPeriod, S.ui.ovMonth);
    el.querySelector('[data-ov-seg]').innerHTML = periodSeg(S.ui.ovPeriod, 'ov-period');
    el.querySelector('[data-ov-label]').textContent = P.label;
    const body = el.querySelector('[data-body]');
    const nothing = !S.trainers.length && !S.classes.length && !S.quotes.length && !S.rosters.length;
    if (nothing) { body.innerHTML = S.sync.state === 'loading' ? '<div class="panel">' + emptyBox('Đang tải dữ liệu…') + '</div>' : this.startHTML(); return; }

    const t = todayISO();
    const inP = S.classes.filter((c) => c.startDate >= P.from && c.startDate <= P.to);
    const live = inP.filter((c) => c.status !== 'cancelled');
    const done = live.filter((c) => c.status === 'done');
    const upcoming = live.filter((c) => c.startDate >= t && c.status !== 'done');
    const contractsP = S.quotes.filter((q) => isContract(q) && q.contractDate && q.contractDate >= P.from && q.contractDate <= P.to);
    const pn = contractsP.map(contractPnl);
    const rev = sum(pn, (p) => p.rev); const prof = sum(pn, (p) => p.profit);
    const allContracts = S.quotes.filter(isContract);
    const remain = sum(allContracts, (q) => contractMoney(q).remain);
    const overdue = allContracts.filter((q) => contractMoney(q).remain > 0 && q.paymentDue && q.paymentDue < t).length;
    const owe = S.trainers.map((x) => ({ x, L: trainerLedger(x.id) })).filter((o) => o.L.remain > 0);
    const pending = S.quotes.filter((q) => ['sent', 'negotiating', 'accepted'].includes(q.status));
    const studs = allStudents();
    const issuedP = studs.filter((x) => x.v.issueDate >= P.from && x.v.issueDate <= P.to).length;
    const soon = studs.filter((x) => certStatus(x.v.expiry).key === 'soon').length;
    const expired = studs.filter((x) => certStatus(x.v.expiry).key === 'expired').length;
    const alerts = computeAlerts();

    let html = `<div class="kpis k8">
      ${kpi('Lớp học', `${live.length}`, `${done.length} hoàn thành · ${upcoming.length} sắp tới${inP.length - live.length ? ` · ${inP.length - live.length} hủy` : ''}`)}
      ${kpi('Học viên', money(sum(live, (c) => c.students)), `Đã cấp thẻ/GCN trong kỳ: ${money(issuedP)}`)}
      ${kpi('Doanh thu (HĐ đã ký)', moneyShort(rev), `${contractsP.length} hợp đồng · ${moneyD(rev)}`)}
      ${kpi('Lợi nhuận', moneyShort(prof), rev ? `Tỷ suất ${pct(prof / rev)} · chi phí ${moneyShort(rev - prof)}` : 'Chưa có hợp đồng ký trong kỳ', false, prof < 0 ? 'neg' : 'pos')}
      ${kpi('Khách còn nợ', moneyShort(remain), `${allContracts.filter((q) => contractMoney(q).remain > 0).length} hợp đồng${overdue ? ` · ${overdue} quá hạn` : ''}`, remain > 0)}
      ${kpi('Còn phải trả GV', moneyShort(sum(owe, (o) => o.L.remain)), owe.length ? `${owe.length} giảng viên` : 'Không còn nợ thù lao')}
      ${kpi('Báo giá đang chờ', `${pending.length}`, `Giá trị ${moneyShort(sum(pending, (q) => quoteMoney(q).amount))}`)}
      ${kpi('Thẻ/GCN sắp hết hạn', `${soon}`, expired ? `${expired} đã hết hạn` : `Trong ${Number(settings().warnDays) || 60} ngày tới`)}
    </div><div class="grid-2"><div class="stack">`;

    const in14 = S.classes.filter((c) => c.status !== 'cancelled' && (c.endDate || c.startDate) >= t && c.startDate <= addDays(t, 14)).sort(sortClasses);
    html += `<section class="panel"><div class="panel-h"><h2>Lịch dạy 14 ngày tới</h2><div class="actions"><a class="btn sm" href="#lich">${ic('cal')} Mở lịch</a></div></div><div class="panel-b flush">`;
    html += in14.length ? `<ul class="list">${in14.slice(0, 10).map((c) => classLi(c)).join('')}</ul>${in14.length > 10 ? `<div class="empty small">và ${in14.length - 10} lớp khác…</div>` : ''}` : emptyBox('Chưa có lớp nào trong 14 ngày tới', '', `<button type="button" class="btn sm cta edit-only" data-act="class-new">${ic('plus')} Lên lịch lớp</button>`);
    html += '</div></section>';

    html += `<section class="panel"><div class="panel-h"><h2>Doanh thu &amp; lợi nhuận theo tháng – năm ${S.ui.ovMonth.slice(0, 4)}</h2><div class="actions"><a class="btn sm" href="#doanh-thu">${ic('trend')} Chi tiết</a></div></div><div class="panel-b">${revenueChart(S.ui.ovMonth.slice(0, 4), S.ui.ovPeriod === 'month' ? S.ui.ovMonth : null)}</div></section>`;

    const rows = regionList().map((r) => {
      const cs = live.filter((c) => c.region === r.id);
      return { r, n: cs.length, hv: sum(cs, (c) => c.students), val: sum(cs, (c) => Number(c.price) || 0), gv: S.trainers.filter((x) => x.region === r.id && x.status !== 'paused').length };
    });
    const maxV = Math.max(1, ...rows.map((x) => x.val));
    html += `<section class="panel"><div class="panel-h"><h2>Theo vùng đào tạo – ${esc(P.label.toLowerCase())}</h2></div><div class="panel-b flush tbl-wrap"><table class="tbl"><thead><tr><th>Vùng</th><th class="r">Giảng viên</th><th class="r">Lớp</th><th class="r">Học viên</th><th class="r">Giá trị lớp</th><th style="width:26%"></th></tr></thead><tbody>
      ${rows.map((x) => `<tr data-act="goto-region" data-v="${esc(x.r.id)}"><td>${rtag(x.r.id)}<div class="muted small">${esc(x.r.center)}</div></td><td class="r">${x.gv}</td><td class="r">${x.n}</td><td class="r">${money(x.hv)}</td><td class="r">${moneyShort(x.val)}</td><td><div class="minibar"><span style="width:${(x.val / maxV) * 100}%;background:${regionColor(x.r.id)}"></span></div></td></tr>`).join('')}
      </tbody></table></div></section>`;
    html += '</div><div class="stack">';

    html += `<section class="panel"><div class="panel-h"><h2>Cần chú ý</h2>${alerts.length ? pill(alerts.length + ' việc', alerts.some((a) => a.sev === 'bad') ? 'bad' : 'warn') : pill('Ổn', 'ok')}</div><div class="panel-b flush">`;
    html += alerts.length ? `<ul class="list">${alerts.slice(0, S.ui.allAlerts ? 300 : 8).map((a) => `<li class="clickable" data-act="${a.act}" data-id="${esc(a.id)}"><span class="alert-i ${a.sev}">${a.sev === 'info' ? 'i' : '!'}</span><span class="s" style="color:var(--fg)">${esc(a.text)}</span></li>`).join('')}</ul>${alerts.length > 8 ? `<div class="empty small"><button type="button" class="btn sm ghost" data-act="toggle-alerts">${S.ui.allAlerts ? 'Thu gọn' : `Xem tất cả ${alerts.length} việc`}</button></div>` : ''}` : emptyBox('Không có việc cần xử lý', 'Lịch không trùng, hợp đồng, thù lao và chứng chỉ đều ổn.');
    html += '</div></section>';

    const ym = S.ui.ovMonth;
    const loads = S.trainers.filter((x) => x.status !== 'paused').map((x) => ({ x, ...trainerMonthLoad(x.id, ym), L: trainerLedger(x.id) })).sort((a, b) => b.days - a.days);
    const maxD = Math.max(1, ...loads.map((l) => l.days));
    html += `<section class="panel"><div class="panel-h"><h2>Giảng viên – ${esc(fmtYM(ym).toLowerCase())}</h2><div class="actions"><a class="btn sm" href="#giang-vien">Danh sách</a></div></div><div class="panel-b flush">`;
    html += loads.length ? `<ul class="list">${loads.slice(0, 8).map((l) => `<li class="clickable" data-act="trainer-view" data-id="${esc(l.x.id)}">${avatar(l.x)}<div class="grow"><div class="t">${esc(l.x.name)}</div><div class="s">${esc(regionName(l.x.region))} · ${l.days ? `${l.days} ngày dạy · ${l.classes.length} lớp` : 'Chưa có lịch'}${l.L.remain > 0 ? ` · <b style="color:var(--accent)">còn nợ ${esc(moneyShort(l.L.remain))}</b>` : ''}</div><div class="minibar" style="margin-top:5px"><span style="width:${(l.days / maxD) * 100}%;background:${regionColor(l.x.region)}"></span></div></div></li>`).join('')}</ul>` : emptyBox('Chưa có giảng viên', '', `<button type="button" class="btn sm edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button>`);
    html += '</div></section>';

    const entries = S.log.flatMap((d) => d.entries || []).sort((a, b) => b.t.localeCompare(a.t)).slice(0, 8);
    if (entries.length) {
      const kindName = { trainers: 'Giảng viên', classes: 'Lớp', quotes: 'Báo giá/HĐ', customers: 'Khách hàng', rosters: 'Đợt cấp thẻ/GCN', settings: 'Cài đặt' };
      html += `<section class="panel"><div class="panel-h"><h2>Cập nhật gần đây</h2></div><div class="panel-b flush"><ul class="list">${entries.map((e) => `<li><span class="alert-i info">${esc((e.a || '?')[0])}</span><div class="grow"><div class="s" style="color:var(--fg)">${esc(e.a)} ${esc((kindName[e.k] || '').toLowerCase())}: <b>${esc(e.l)}</b></div><div class="s muted">${esc(fmtStamp(e.t))}${e.by ? `<span data-uid="${esc(e.by)}"></span>` : ''}${e.via === 'claude' ? ' · nhập qua Claude' : ''}</div></div></li>`).join('')}</ul></div></section>`;
    }
    html += '</div></div>';
    body.innerHTML = html;
    hydrate(body); fillNames(body);
  },
  startHTML() {
    return `<section class="panel"><div class="panel-h"><h2>Bắt đầu sử dụng</h2>${S.role.canEdit ? '' : pill('Chế độ xem', 'muted')}</div><div class="panel-b">
      <p style="margin:0 0 14px;color:var(--fg-2)">Chưa có dữ liệu. ${S.role.canEdit ? 'Làm theo các bước dưới đây – mọi người được chia sẻ link sẽ thấy ngay những gì anh/chị nhập.' : 'Người quản lý chưa nhập dữ liệu. Anh/chị có thể xem thử bằng dữ liệu mẫu.'}</p>
      <div class="start">
        <div class="step"><span class="no">1</span><b>Nhập danh sách giảng viên</b><p>Họ tên, ảnh 3×4, số điện thoại, vùng đào tạo, chuyên ngành, nhóm được dạy, thù lao/ngày.</p><button type="button" class="btn sm edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button></div>
        <div class="step"><span class="no">2</span><b>Lập báo giá – hợp đồng</b><p>Tên công ty khách hàng, giá theo bảng giá (dưới 30 HV: 5 triệu; 30–60 HV: 8 triệu), tải file báo giá và hợp đồng.</p><button type="button" class="btn sm edit-only" data-act="quote-new">${ic('plus')} Thêm báo giá</button></div>
        <div class="step"><span class="no">3</span><b>Phân công lịch dạy</b><p>Bấm vào ngày trên lịch tháng, chọn vùng, giảng viên còn trống, thù lao, địa điểm, số học viên – lợi nhuận tự tính.</p><button type="button" class="btn sm cta edit-only" data-act="class-new">${ic('plus')} Lên lịch lớp</button></div>
      </div>
      <div style="margin-top:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button type="button" class="btn" data-act="demo-on">${ic('eye')} Xem thử với dữ liệu mẫu</button><span class="muted small">Dữ liệu mẫu chỉ hiển thị trên máy anh/chị, không lưu và không ai khác thấy.</span></div>
    </div></section>`;
  },
};

/** Biểu đồ doanh thu (cột nhạt) và lợi nhuận (cột đậm bên trong) theo tháng, tính từ hợp đồng đã ký. */
function revenueChart(year, curYm) {
  const data = Array.from({ length: 12 }, (_, i) => {
    const ym = `${year}-${pad(i + 1)}`;
    const qs = S.quotes.filter((q) => isContract(q) && (q.contractDate || '').startsWith(ym));
    const pn = qs.map(contractPnl);
    const rev = sum(pn, (p) => p.rev); const prof = sum(pn, (p) => p.profit);
    return { label: 'T' + (i + 1), a: rev, b: prof, cur: ym === curYm, tip: `${fmtYM(ym)}: doanh thu ${moneyD(rev)} · lợi nhuận ${moneyD(prof)}${rev ? ` (${pct(prof / rev)})` : ''} · ${qs.length} HĐ` };
  });
  return bulletChart(data, ['Doanh thu (HĐ đã ký)', 'Lợi nhuận']);
}

function classLi(c) {
  const conflict = conflictsFor(c).length;
  return `<li class="clickable" data-act="class-view" data-id="${esc(c.id)}"><span class="when"><b>${c.startDate.slice(8, 10)}</b><span>${dowOf(c.startDate)} · T${Number(c.startDate.slice(5, 7))}</span></span>
    <div class="grow"><div class="t">${esc(classLabel(c))}${conflict ? ' ' + pill('Trùng lịch GV', 'bad') : ''}</div>
    <div class="s">${esc([fmtDateRange(c.startDate, c.endDate), c.startTime && `${c.startTime}–${c.endTime || ''}`, groupsText(c.groups), c.students ? c.students + ' HV' : ''].filter(Boolean).join(' · '))}</div>
    <div class="s">${rtag(c.region)} · ${esc(c.location || 'Chưa có địa điểm')}</div>
    <div class="s">${(c.trainerIds || []).length ? 'GV: ' + esc(trainerNames(c.trainerIds)) : '<span style="color:var(--warn);font-weight:600">Chưa phân công giảng viên</span>'}</div></div>
    <div style="display:flex;flex-direction:column;gap:4px;align-items:flex-end">${classPill(c)}${docButtons(c)}</div></li>`;
}
function docButtons(c) {
  const q = c.quoteId && quote(c.quoteId);
  if (!q) return '';
  return `<span style="display:flex;gap:4px">${(q.quoteFiles || []).length ? fileButtons(q.quoteFiles, 'BG') : ''}${(q.contractFiles || []).length ? fileButtons(q.contractFiles, 'HĐ') : ''}</span>`;
}

/* ================= LỊCH GIẢNG DẠY ================= */
const CalendarView = {
  mount(el) {
    el.innerHTML = `<div class="page-head"><div><h1>Lịch phân công giảng dạy</h1><div class="sub">Bấm vào một ngày để lên lịch lớp · chọn vùng để xem giảng viên của vùng · xem chi phí và lợi nhuận ở dạng Danh sách</div></div>
      <div class="actions">${exportBtn('lich')}<button type="button" class="btn cta edit-only" data-act="class-new">${ic('plus')} Thêm lớp</button></div></div>
      <div class="toolbar" data-regions></div>
      <div class="toolbar"><div class="cal-nav"><button type="button" class="btn icon" data-act="cal-prev" aria-label="Tháng trước">${ic('left')}</button><h2 data-cal-label></h2><button type="button" class="btn icon" data-act="cal-next" aria-label="Tháng sau">${ic('right')}</button><button type="button" class="btn sm" data-act="cal-today">Hôm nay</button></div>
      <span class="grow"></span><div class="seg" data-views></div></div>
      <div data-focus></div><div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el; const ym = S.ui.month;
    const monthClasses = S.classes.filter((c) => classInMonth(c, ym));
    const counts = { all: monthClasses.filter((c) => c.status !== 'cancelled').length };
    regionList().forEach((r) => (counts[r.id] = monthClasses.filter((c) => c.region === r.id && c.status !== 'cancelled').length));
    el.querySelector('[data-regions]').innerHTML = regionChips(S.ui.region, counts);
    el.querySelector('[data-cal-label]').textContent = fmtYM(ym);
    el.querySelector('[data-views]').innerHTML = [['month', 'cal', 'Lịch tháng'], ['res', 'rows', 'Theo giảng viên'], ['list', 'list', 'Danh sách & lợi nhuận']]
      .map(([v, i, l]) => `<button type="button" data-act="cal-view" data-v="${v}" aria-pressed="${S.ui.calView === v}">${ic(i)}${l}</button>`).join('');
    const tf = S.ui.trainerFocus && trainer(S.ui.trainerFocus);
    el.querySelector('[data-focus]').innerHTML = tf ? `<div class="banner info" style="margin-bottom:12px">${avatar(tf)}<span class="grow">Đang làm nổi bật lịch của giảng viên <b>${esc(tf.name)}</b> – ${trainerMonthLoad(tf.id, ym).days} ngày dạy trong tháng.</span><button type="button" class="btn sm" data-act="focus-clear">${ic('x')} Bỏ chọn</button></div>` : '';
    const body = el.querySelector('[data-body]');
    if (S.ui.calView === 'res') body.innerHTML = this.resHTML(ym);
    else if (S.ui.calView === 'list') body.innerHTML = this.listHTML(ym);
    else body.innerHTML = this.monthHTML(ym);
    hydrate(body);
  },
  visible(c) { return S.ui.region === 'all' || c.region === S.ui.region; },
  monthHTML(ym) {
    const first = parseISO(ym + '-01');
    const offset = (first.getDay() + 6) % 7;
    const start = addDays(ym + '-01', -offset);
    const end = monthEnd(ym);
    const weeks = Math.ceil((offset + Number(end.slice(8))) / 7);
    const t = todayISO(); const tf = S.ui.trainerFocus;
    let html = `<div class="cal-layout"><div><div class="cal" role="grid" aria-label="Lịch ${esc(fmtYM(ym))}">${['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'].map((d, i) => `<div class="cal-dow${i > 4 ? ' we' : ''}" role="columnheader">${d}</div>`).join('')}`;
    for (let i = 0; i < weeks * 7; i++) {
      const d = addDays(start, i); const out = ymOf(d) !== ym;
      const cs = classesOn(d).filter((c) => this.visible(c)).sort(sortClasses);
      const shown = cs.slice(0, 3);
      html += `<div class="cal-day${out ? ' out' : ''}${d === t ? ' today' : ''}${d === S.ui.selDate ? ' sel' : ''}" role="gridcell" data-act="day" data-date="${d}" aria-label="${esc(DOW_LONG[parseISO(d).getDay()] + ' ' + fmtD(d) + (cs.length ? ', ' + cs.length + ' lớp' : ''))}">
        <div class="dh"><span class="dn">${Number(d.slice(8))}</span><button type="button" class="add edit-only" data-act="class-new" data-date="${d}" aria-label="Thêm lớp ngày ${fmtD(d)}">${ic('plus')}</button></div>
        ${shown.map((c) => {
          const cx = conflictsFor(c).length; const dim = tf && !(c.trainerIds || []).includes(tf);
          const cont = c.startDate !== d ? '↳ ' : '';
          return `<button type="button" class="ev st-${c.status || 'planned'}${cx ? ' conflict' : ''}${dim ? ' dim' : ''}" style="--rc:${regionColor(c.region)}" data-act="class-view" data-id="${esc(c.id)}" title="${esc(classLabel(c) + ' – ' + trainerNames(c.trainerIds))}">
            <span class="l1">${cont}${c.startTime && c.startTime !== settings().dayStart ? esc(c.startTime) + ' ' : ''}${esc(shortName(classLabel(c)))}</span><span class="l2">${esc([groupsShort(c.groups), c.students ? c.students + ' HV' : '', (c.trainerIds || []).map((id) => trainer(id)?.name?.split(' ').slice(-1)[0] || '?').join(', ') || 'chưa có GV'].filter(Boolean).join(' · '))}</span></button>`;
        }).join('')}
        ${cs.length > 3 ? `<span class="more">+${cs.length - 3} lớp</span>` : ''}
        <span class="cal-dots">${cs.slice(0, 6).map((c) => `<i style="--rc:${regionColor(c.region)}"></i>`).join('')}</span>
      </div>`;
    }
    html += `</div><div class="legend">${regionList().map((r) => `<span class="rtag"><span class="sw" style="background:${regionColor(r.id)}"></span>${esc(r.name)}</span>`).join('')}
      <span><span class="sample dash"></span>Dự kiến</span><span><span class="sample"></span>Đã chốt / hoàn thành</span><span><span class="sample cx"></span>Trùng lịch giảng viên</span></div></div>`;
    html += `<div class="stack" data-daypanel>${this.dayPanelHTML(S.ui.selDate)}</div></div>`;
    return html;
  },
  dayPanelHTML(d) {
    const cs = classesOn(d).filter((c) => this.visible(c)).sort(sortClasses);
    const reg = S.ui.region;
    const trs = trainersInRegion(reg);
    let html = `<section class="panel"><div class="panel-h"><h2>${esc(DOW_LONG[parseISO(d).getDay()])}, ${fmtD(d)}</h2><div class="actions"><button type="button" class="btn sm cta edit-only" data-act="class-new" data-date="${d}">${ic('plus')} Thêm lớp</button></div></div><div class="panel-b flush">`;
    html += cs.length ? `<ul class="list">${cs.map((c) => classLi(c)).join('')}</ul>` : emptyBox('Chưa có lớp trong ngày này', S.role.canEdit ? 'Bấm “Thêm lớp” để phân công.' : '');
    html += `</div></section><section class="panel"><div class="panel-h"><h2>Giảng viên ${reg === 'all' ? '– tất cả vùng' : '– ' + esc(regionName(reg))}</h2><span class="muted small">trạng thái ngày ${fmtDM(d)}</span></div><div class="panel-b flush">`;
    if (!trs.length) html += emptyBox(reg === 'all' ? 'Chưa có giảng viên' : 'Vùng này chưa có giảng viên', '', `<button type="button" class="btn sm edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button>`);
    else {
      html += `<ul class="avail">${trs.map((x) => {
        const busy = busyClasses(x.id, { startDate: d, endDate: d });
        const load = trainerMonthLoad(x.id, S.ui.month);
        return `<li data-act="focus-trainer" data-id="${esc(x.id)}" class="${S.ui.trainerFocus === x.id ? 'on' : ''}" title="Bấm để làm nổi bật lịch của giảng viên này">${avatar(x)}<span class="info"><span class="n">${esc(x.name)}</span>
          <span class="s">${busy.length ? `<span style="color:var(--accent);font-weight:600">● Bận:</span> ${esc(busy.map((b) => `${classLabel(b)} ${b.startTime || ''}–${b.endTime || ''}`).join('; '))}` : '<span style="color:var(--ok);font-weight:600">● Rảnh</span>'}</span>
          <span class="s muted">${esc(x.phone || '')} · ${load.days} ngày dạy/tháng${x.region !== reg && reg !== 'all' ? ' · vùng ' + esc(regionName(x.region)) : ''}</span></span></li>`;
      }).join('')}</ul>`;
    }
    html += '</div></section>';
    return html;
  },
  resHTML(ym) {
    const days = Number(monthEnd(ym).slice(8)); const t = todayISO();
    const trs = trainersInRegion(S.ui.region);
    if (!trs.length) return `<div class="panel">${emptyBox('Chưa có giảng viên trong vùng này', '', `<button type="button" class="btn sm edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button>`)}</div>`;
    let html = '<div class="res-wrap"><table class="res"><thead><tr><th class="who">Giảng viên</th>';
    for (let i = 1; i <= days; i++) { const d = `${ym}-${pad(i)}`; const w = parseISO(d).getDay(); html += `<th class="${w === 0 || w === 6 ? 'we' : ''}${d === t ? ' today' : ''}" title="${esc(DOW_LONG[w] + ' ' + fmtD(d))}">${i}<br><span style="font-weight:500">${DOW[w]}</span></th>`; }
    html += '</tr></thead><tbody>';
    for (const x of trs) {
      const load = trainerMonthLoad(x.id, ym);
      html += `<tr><th class="who" data-act="trainer-view" data-id="${esc(x.id)}" style="cursor:pointer"><span class="n">${esc(x.name)}</span><span class="s">${esc(regionName(x.region))} · ${load.days} ngày</span></th>`;
      for (let i = 1; i <= days; i++) {
        const d = `${ym}-${pad(i)}`; const w = parseISO(d).getDay();
        const cs = busyClasses(x.id, { startDate: d, endDate: d });
        let cx = false;
        for (let a = 0; a < cs.length; a++) for (let b = a + 1; b < cs.length; b++) if (timeOverlap(cs[a], cs[b])) cx = true;
        const c0 = cs[0];
        const title = cs.length ? cs.map((c) => `${classLabel(c)} ${c.startTime || ''}–${c.endTime || ''} (${c.location || ''})`).join('\n') : `${x.name} rảnh ngày ${fmtD(d)}`;
        html += `<td class="c${w === 0 || w === 6 ? ' we' : ''}${cs.length ? ' busy' : ''}${cx ? ' cx' : ''}" style="--rc:${c0 ? regionColor(c0.region) : 'transparent'}" title="${esc(title)}" ${c0 ? `data-act="class-view" data-id="${esc(c0.id)}"` : `data-act="class-new" data-date="${d}" data-trainer="${esc(x.id)}"`}>${cs.length > 1 ? `<span class="cnt">${cs.length}</span>` : ''}</td>`;
      }
      html += '</tr>';
    }
    html += `</tbody></table></div><div class="legend"><span>Ô có màu: giảng viên có lớp (màu theo vùng của lớp)</span><span><span class="sample cx"></span>Hai lớp trùng giờ</span><span>${S.role.canEdit ? 'Bấm ô trống để xếp lớp cho giảng viên vào ngày đó' : ''}</span></div>`;
    return html;
  },
  listHTML(ym) {
    const q = norm(S.ui.calSearch || '');
    const cs = S.classes.filter((c) => classInMonth(c, ym) && this.visible(c))
      .filter((c) => !S.ui.trainerFocus || (c.trainerIds || []).includes(S.ui.trainerFocus))
      .filter((c) => !q || norm([classLabel(c), c.location, trainerNames(c.trainerIds), c.title].join(' ')).includes(q))
      .sort(sortClasses);
    const live = cs.filter((c) => c.status !== 'cancelled');
    const P = live.map(classPnl);
    let html = `<div class="toolbar"><div class="search">${ic('search')}<input class="input" type="search" id="cal-search" placeholder="Tìm khách hàng, địa điểm, giảng viên…" value="${esc(S.ui.calSearch || '')}" data-input="cal-search"></div><span class="muted small">${cs.length} lớp · doanh thu ${moneyShort(sum(P, (p) => p.rev))} · lợi nhuận ${moneyShort(sum(P, (p) => p.profit))}</span></div>`;
    if (!cs.length) return html + `<div class="panel">${emptyBox('Không có lớp nào trong tháng này', '', `<button type="button" class="btn sm cta edit-only" data-act="class-new">${ic('plus')} Thêm lớp</button>`)}</div>`;
    html += `<div class="panel tbl-wrap"><table class="tbl wide"><thead><tr><th>Ngày</th><th style="min-width:180px">Khách hàng / lớp</th><th>Nhóm</th><th class="r">HV</th><th>Giảng viên</th><th class="r">Doanh thu</th><th class="r">Thù lao GV</th><th class="r" title="Hoa hồng phân bổ từ hợp đồng, đã gồm thuế khấu trừ">Hoa hồng</th><th class="r">Chi phí khác</th><th class="r">Lợi nhuận</th><th>Trạng thái</th><th>Hồ sơ</th></tr></thead><tbody>`;
    for (const c of cs) {
      const m = classPnl(c); const q2 = c.quoteId && quote(c.quoteId);
      html += `<tr class="${c.status === 'cancelled' ? 'cancel' : ''}" data-act="class-view" data-id="${esc(c.id)}"><td class="nowrap num">${esc(fmtDateRange(c.startDate, c.endDate))}<div class="muted small">${esc(c.startTime || '')}–${esc(c.endTime || '')}</div></td>
        <td><span class="strong">${esc(classLabel(c))}</span>${c.title ? `<div class="muted small">${esc(c.title)}</div>` : ''}${conflictsFor(c).length ? '<div>' + pill('Trùng lịch GV', 'bad') + '</div>' : ''}</td>
        <td class="nowrap">${esc(groupsShort(c.groups))}</td><td class="r">${money(c.students)}</td>
        <td>${esc(trainerNames(c.trainerIds)) || '<span style="color:var(--warn)">Chưa có</span>'}</td>
        ${moneyCell(m.rev)}${moneyCell(m.gv)}${moneyCell(m.com.gross)}${moneyCell(m.other)}<td class="r strong" style="color:${m.profit < 0 ? 'var(--bad)' : 'var(--ok)'}">${money(m.profit)}${m.rev ? `<div class="muted small">${pct(m.margin)}</div>` : ''}</td><td>${classPill(c)}</td>
        <td><div class="cell-files">${q2 ? fileButtons(q2.quoteFiles, 'BG') + fileButtons(q2.contractFiles, 'HĐ') : '<span class="muted small">Chưa gắn BG</span>'}</div></td></tr>`;
    }
    html += `</tbody><tfoot><tr><td colspan="3">Tổng (không tính lớp hủy)</td><td class="r">${money(sum(live, (c) => c.students))}</td><td></td>${moneyCell(sum(P, (p) => p.rev))}${moneyCell(sum(P, (p) => p.gv))}${moneyCell(sum(P, (p) => p.com.gross))}${moneyCell(sum(P, (p) => p.other))}${moneyCell(sum(P, (p) => p.profit))}<td colspan="2"></td></tr></tfoot></table></div>
      <p class="small muted" style="margin-top:8px">Hoa hồng và chi phí cấp hợp đồng được phân bổ cho từng lớp theo tỷ lệ giá lớp trong hợp đồng. Doanh thu chính thức tính ở tab Doanh thu – Lợi nhuận (theo hợp đồng đã ký).</p>`;
    return html;
  },
};

/* ================= GIẢNG VIÊN ================= */
const TrainersView = {
  mount(el) {
    S.ui.trRegion = S.ui.trRegion || 'all'; S.ui.trStatus = S.ui.trStatus || 'active'; S.ui.trView = S.ui.trView || 'list';
    S.ui.ledPeriod = S.ui.ledPeriod || 'all'; S.ui.ledState = S.ui.ledState || 'owe';
    el.innerHTML = `<div class="page-head"><div><h1>Giảng viên</h1><div class="sub">Thông tin liên hệ, vùng đào tạo, chuyên ngành, lịch dạy và thù lao – công nợ của từng giảng viên</div></div>
      <div class="actions"><div class="seg" data-trview></div>${exportBtn('giang-vien')}<button type="button" class="btn cta edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button></div></div>
      <div class="toolbar" data-regions></div>
      <div class="toolbar" data-tools></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el;
    el.querySelector('[data-trview]').innerHTML = `<button type="button" data-act="tr-view" data-v="list" aria-pressed="${S.ui.trView === 'list'}">${ic('users')}Danh sách</button><button type="button" data-act="tr-view" data-v="ledger" aria-pressed="${S.ui.trView === 'ledger'}">${ic('money')}Thù lao &amp; công nợ</button>`;
    const counts = { all: S.trainers.filter((x) => x.status !== 'paused').length };
    regionList().forEach((r) => (counts[r.id] = S.trainers.filter((x) => x.region === r.id && x.status !== 'paused').length));
    el.querySelector('[data-regions]').innerHTML = regionChips(S.ui.trRegion, counts, 'tr-region');
    if (S.ui.trView === 'ledger') return this.ledger();
    const tools = el.querySelector('[data-tools]');
    if (tools.dataset.mode !== 'list') {
      tools.dataset.mode = 'list';
      tools.innerHTML = `<div class="search">${ic('search')}<input class="input" type="search" id="tr-search" placeholder="Tìm tên, SĐT, chuyên ngành…" value="${esc(S.ui.trSearch || '')}" data-input="tr-search"></div>
        <select class="input" id="tr-spec" style="width:auto;max-width:260px" data-input="tr-spec" aria-label="Lọc theo chuyên ngành"></select>
        <select class="input" id="tr-status" style="width:auto" data-input="tr-status" aria-label="Lọc theo trạng thái"><option value="active">Đang hoạt động</option><option value="paused">Tạm ngưng</option><option value="all">Tất cả</option></select>
        <span class="muted small" data-count></span>`;
    }
    const ym = todayISO().slice(0, 7); const t = todayISO();
    const specs = uniq([...(settings().specialties || []), ...S.trainers.flatMap((x) => x.specialties || [])]);
    el.querySelector('#tr-spec').innerHTML = `<option value="">Mọi chuyên ngành</option>${specs.map((s) => `<option${S.ui.trSpec === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}`;
    el.querySelector('#tr-status').value = S.ui.trStatus;
    const q = norm(S.ui.trSearch || '');
    const list = S.trainers
      .filter((x) => S.ui.trStatus === 'all' || (S.ui.trStatus === 'paused' ? x.status === 'paused' : x.status !== 'paused'))
      .filter((x) => S.ui.trRegion === 'all' || x.region === S.ui.trRegion || (x.otherRegions || []).includes(S.ui.trRegion))
      .filter((x) => !S.ui.trSpec || (x.specialties || []).includes(S.ui.trSpec))
      .filter((x) => !q || norm([x.name, x.phone, x.email, (x.specialties || []).join(' '), x.degree, x.notes].join(' ')).includes(q))
      .sort((a, b) => a.name.localeCompare(b.name, 'vi'));
    el.querySelector('[data-count]').textContent = `${list.length} giảng viên`;
    const body = el.querySelector('[data-body]');
    if (!list.length) { body.innerHTML = `<div class="panel">${emptyBox(S.trainers.length ? 'Không có giảng viên phù hợp bộ lọc' : 'Chưa có giảng viên', S.trainers.length ? '' : 'Thêm giảng viên đầu tiên: họ tên, ảnh, SĐT, vùng và chuyên ngành.', `<button type="button" class="btn sm cta edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button>`)}</div>`; return; }
    body.innerHTML = `<div class="cards">${list.map((x) => {
      const load = trainerMonthLoad(x.id, ym); const nx = trainerNext(x.id); const L = trainerLedger(x.id);
      const today = busyClasses(x.id, { startDate: t, endDate: t });
      const specsT = x.specialties || [];
      const cert = x.certExpiry ? dueTone(x.certExpiry) : null;
      return `<article class="tcard${x.status === 'paused' ? ' paused' : ''}" data-act="trainer-view" data-id="${esc(x.id)}">
        <div class="tcard-top">${photo(x)}<div class="meta"><h3>${esc(x.name)}</h3>
          <div>${phoneLink(x.phone)}</div>
          <div>${rtag(x.region)}${(x.otherRegions || []).length ? ` <span class="muted small">+ ${esc(x.otherRegions.map(regionName).join(', '))}</span>` : ''}</div>
          <div class="tags">${specsT.slice(0, 3).map((s) => `<span class="tag">${esc(s)}</span>`).join('')}${specsT.length > 3 ? `<span class="tag">+${specsT.length - 3}</span>` : ''}</div>
          <div class="small muted">${(x.groups || []).length ? 'Dạy ' + esc(groupsText(x.groups)) : 'Chưa chọn nhóm được dạy'}${x.employment ? ' · ' + esc(x.employment) : ''}</div>
          ${x.status === 'paused' ? pill('Tạm ngưng', 'muted') : cert && cert.tone !== 'ok' ? pill('Chứng chỉ: ' + cert.text, cert.tone) : ''}
        </div></div>
        <div class="tcard-bot">${today.length ? pill('Hôm nay: đang dạy', 'accent') : pill('Hôm nay: rảnh', 'ok')}<span>Tháng ${Number(ym.slice(5))}: <b>${load.days}</b> ngày dạy</span>
          ${L.amount ? `<span class="next">Thù lao ${esc(moneyShort(L.amount))} · đã trả ${esc(moneyShort(L.paid))} · ${L.remain > 0 ? `<b style="color:var(--accent)">còn nợ ${esc(moneyD(L.remain))}</b>` : '<b style="color:var(--ok)">đã thanh toán đủ</b>'}</span>` : ''}
          ${nx ? `<span class="next">Lớp tới: ${esc(fmtDM(nx.startDate))} · ${esc(classLabel(nx))}</span>` : ''}</div>
      </article>`;
    }).join('')}</div>`;
    hydrate(body);
  },
  ledgerRange() {
    const v = S.ui.ledPeriod;
    if (v === 'all') return { from: '', to: '', label: 'Tất cả thời gian' };
    if (v.startsWith('y:')) { const y = v.slice(2); return { from: `${y}-01-01`, to: `${y}-12-31`, label: `Năm ${y}` }; }
    const ym = v.slice(2); return { from: ym + '-01', to: monthEnd(ym), label: fmtYM(ym) };
  },
  ledger() {
    const el = this.el; const tools = el.querySelector('[data-tools]');
    const y = todayISO().slice(0, 4); const ym0 = todayISO().slice(0, 7);
    const opts = [['all', 'Tất cả thời gian'], [`y:${y}`, `Năm ${y}`], [`y:${Number(y) - 1}`, `Năm ${Number(y) - 1}`], ...Array.from({ length: 12 }, (_, i) => { const m = ymAdd(ym0, -i); return [`m:${m}`, fmtYM(m)]; })];
    if (tools.dataset.mode !== 'ledger') {
      tools.dataset.mode = 'ledger';
      tools.innerHTML = `<div class="search">${ic('search')}<input class="input" type="search" id="led-search" placeholder="Tìm giảng viên, khách hàng…" value="${esc(S.ui.ledSearch || '')}" data-input="led-search"></div>
        <select class="input" id="led-period" style="width:auto" data-input="led-period" aria-label="Kỳ theo ngày lớp">${opts.map(([v, l]) => `<option value="${v}">${esc(l)}</option>`).join('')}</select>
        <div class="chips" data-ledstate></div>`;
    }
    el.querySelector('#led-period').value = S.ui.ledPeriod;
    el.querySelector('[data-ledstate]').innerHTML = [['owe', 'Còn nợ'], ['all', 'Tất cả'], ['paid', 'Đã thanh toán đủ']].map(([v, l]) => `<button type="button" class="chip" data-act="led-state" data-v="${v}" aria-pressed="${S.ui.ledState === v}">${l}</button>`).join('');
    const R = this.ledgerRange(); const s = norm(S.ui.ledSearch || '');
    const groups = S.trainers
      .filter((x) => S.ui.trRegion === 'all' || x.region === S.ui.trRegion || (x.otherRegions || []).includes(S.ui.trRegion))
      .map((x) => {
        const L = trainerLedger(x.id, R.from, R.to);
        let rows = L.rows.filter((r) => !s || norm([x.name, x.phone, classLabel(r.c), r.f.contractNo].join(' ')).includes(s));
        if (S.ui.ledState === 'owe') rows = rows.filter((r) => r.remain !== 0 || r.label === 'Chưa nhập thù lao');
        if (S.ui.ledState === 'paid') rows = rows.filter((r) => r.label === 'Đã thanh toán đủ');
        return { x, rows, amount: sum(rows, (r) => r.amount), paid: sum(rows, (r) => r.paid), remain: sum(rows, (r) => Math.max(0, r.remain)) };
      }).filter((g) => g.rows.length).sort((a, b) => b.remain - a.remain || a.x.name.localeCompare(b.x.name, 'vi'));
    const all = S.trainers.map((x) => trainerLedger(x.id, R.from, R.to));
    const body = el.querySelector('[data-body]');
    let html = `<div class="kpis">${kpi('Tổng thù lao (HĐ thuê GV)', moneyShort(sum(all, (L) => L.amount)), `${R.label} · ${sum(all, (L) => L.rows.length)} lượt dạy`)}${kpi('Đã trả (tạm ứng + thanh toán)', moneyShort(sum(all, (L) => L.paid)), moneyD(sum(all, (L) => L.paid)))}${kpi('Còn phải trả', moneyShort(sum(all, (L) => L.remain)), `${all.filter((L) => L.remain > 0).length} giảng viên còn nợ`, sum(all, (L) => L.remain) > 0)}</div>`;
    if (!groups.length) { body.innerHTML = html + `<div class="panel">${emptyBox(S.classes.length ? 'Không có khoản thù lao phù hợp bộ lọc' : 'Chưa có lớp nào', 'Thù lao từng lớp nhập khi phân công giảng viên trong tab Lịch giảng dạy.')}</div>`; return; }
    html += `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Ngày lớp</th><th>Khách hàng / lớp</th><th class="r">Số ngày</th><th>HĐ thuê GV</th><th class="r">Thù lao</th><th class="r">Đã trả</th><th class="r">Còn lại</th><th>Tình trạng</th><th></th></tr></thead>`;
    for (const g of groups) {
      html += `<tbody><tr class="grp" data-act="trainer-view" data-id="${esc(g.x.id)}"><td colspan="4">${avatar(g.x, 'sm')} <b>${esc(g.x.name)}</b> <span class="muted small">${esc(g.x.phone || '')} · ${esc(regionName(g.x.region))} · ${g.rows.length} lớp</span></td>${moneyCell(g.amount, 'strong')}${moneyCell(g.paid, 'strong')}<td class="r strong" style="color:${g.remain > 0 ? 'var(--accent)' : 'var(--ok)'}">${money(g.remain)}</td><td colspan="2"></td></tr>`;
      for (const r of g.rows) {
        html += `<tr data-act="fee-open" data-id="${esc(r.c.id)}" data-trainer="${esc(g.x.id)}"><td class="nowrap num">${esc(fmtDateRange(r.c.startDate, r.c.endDate))}</td><td>${esc(classLabel(r.c))}<div class="muted small">${esc(groupsText(r.c.groups))}${r.c.students ? ' · ' + r.c.students + ' HV' : ''}${r.c.status === 'cancelled' ? ' · đã hủy' : ''}</div></td><td class="r">${r.days}</td>
          <td class="small">${esc(r.f.contractNo || '')}${(r.f.files || []).length ? ' ' + fileButtons(r.f.files, 'HĐ') : r.f.contractNo ? '' : '<span class="muted">—</span>'}</td>
          ${moneyCell(r.amount)}${moneyCell(r.paid)}<td class="r strong" style="color:${r.remain > 0 ? 'var(--accent)' : r.remain < 0 ? 'var(--bad)' : 'var(--ok)'}">${money(r.remain)}</td><td>${pill(r.label, r.tone)}</td>
          <td class="r"><button type="button" class="btn xs edit-only" data-act="fee-pay" data-id="${esc(r.c.id)}" data-trainer="${esc(g.x.id)}">${ic('money')} Trả tiền</button></td></tr>`;
      }
      html += '</tbody>';
    }
    html += `<tfoot><tr><td colspan="4">Tổng ${groups.length} giảng viên</td>${moneyCell(sum(groups, (g) => g.amount))}${moneyCell(sum(groups, (g) => g.paid))}${moneyCell(sum(groups, (g) => g.remain))}<td colspan="2"></td></tr></tfoot></table></div>
      <p class="small muted" style="margin-top:8px">Bấm một dòng để sửa thù lao, số HĐ thuê giảng viên, tải file hợp đồng và ghi nhận tạm ứng/thanh toán.</p>`;
    body.innerHTML = html; hydrate(body);
  },
};

/* ================= BÁO GIÁ ================= */
const QuotesView = {
  mount(el) {
    S.ui.qStatus = S.ui.qStatus || 'all'; S.ui.qYear = S.ui.qYear || 'all';
    el.innerHTML = `<div class="page-head"><div><h1>Danh sách báo giá</h1><div class="sub">Báo giá gửi khách hàng, file báo giá và file hợp đồng – bấm “Xem” để mở file</div></div>
      <div class="actions">${exportBtn('bao-gia')}<button type="button" class="btn cta edit-only" data-act="quote-new">${ic('plus')} Thêm báo giá</button></div></div>
      <div class="toolbar" data-status></div>
      <div class="toolbar"><div class="search">${ic('search')}<input class="input" type="search" id="q-search" placeholder="Tìm công ty, số báo giá, số HĐ…" value="${esc(S.ui.qSearch || '')}" data-input="q-search"></div>
      <select class="input" id="q-year" style="width:auto" data-input="q-year" aria-label="Năm"></select><span class="muted small" data-count></span></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el;
    const years = uniq(S.quotes.map((q) => (q.date || '').slice(0, 4)).filter(Boolean)).sort().reverse();
    el.querySelector('#q-year').innerHTML = `<option value="all">Mọi năm</option>${years.map((y) => `<option value="${y}"${S.ui.qYear === y ? ' selected' : ''}>Năm ${y}</option>`).join('')}`;
    const base = S.quotes.filter((q) => S.ui.qYear === 'all' || (q.date || '').startsWith(S.ui.qYear));
    el.querySelector('[data-status]').innerHTML = `<div class="chips"><button type="button" class="chip" data-act="q-status" data-v="all" aria-pressed="${S.ui.qStatus === 'all'}">Tất cả <span class="count">${base.length}</span></button>${Object.entries(QUOTE_STATUS).map(([k, v]) => `<button type="button" class="chip" data-act="q-status" data-v="${k}" aria-pressed="${S.ui.qStatus === k}">${esc(v.label)} <span class="count">${base.filter((q) => q.status === k).length}</span></button>`).join('')}</div>`;
    const s = norm(S.ui.qSearch || '');
    const list = base.filter((q) => S.ui.qStatus === 'all' || q.status === S.ui.qStatus)
      .filter((q) => !s || norm([q.no, q.customerName, q.contractNo, q.owner, q.notes].join(' ')).includes(s))
      .sort((a, b) => (b.date || '').localeCompare(a.date || '') || (b.no || '').localeCompare(a.no || ''));
    el.querySelector('[data-count]').textContent = `${list.length} báo giá · ${moneyShort(sum(list, (q) => quoteMoney(q).amount))}`;
    const body = el.querySelector('[data-body]');
    if (!list.length) { body.innerHTML = `<div class="panel">${emptyBox(S.quotes.length ? 'Không có báo giá phù hợp' : 'Chưa có báo giá', S.quotes.length ? '' : 'Nhập tên công ty khách hàng, tải lên file báo giá; khi khách ký thì tải lên hợp đồng.', `<button type="button" class="btn sm cta edit-only" data-act="quote-new">${ic('plus')} Thêm báo giá</button>`)}</div>`; return; }
    const t = todayISO();
    body.innerHTML = `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Số BG</th><th>Ngày</th><th>Khách hàng</th><th>Nội dung</th><th class="r">Giá trị</th><th>Trạng thái</th><th>File báo giá</th><th>File hợp đồng</th><th class="r">Lớp</th></tr></thead><tbody>
      ${list.map((q) => {
        const qm = quoteMoney(q); const cls = quoteClasses(q);
        const waiting = ['sent', 'negotiating'].includes(q.status) && q.date ? daysBetween(q.date, t) : 0;
        return `<tr data-act="quote-view" data-id="${esc(q.id)}"><td class="nowrap strong num">${esc(q.no || '—')}</td><td class="nowrap num">${esc(fmtD(q.date))}</td>
          <td><span class="strong">${esc(q.customerName || '')}</span>${q.contact ? `<div class="muted small">${esc(q.contact)}${q.contactPhone ? ' · ' + esc(q.contactPhone) : ''}</div>` : ''}</td>
          <td class="small">${esc([groupsText(q.groups), q.students ? q.students + ' HV' : '', q.classCount ? q.classCount + ' lớp' : ''].filter(Boolean).join(' · '))}</td>
          <td class="r">${qm.amount ? money(qm.amount) : '<span class="muted small" title="Chưa có tổng giá trị – mở báo giá để nhập">chưa nhập</span>'}</td>
          <td>${quotePill(q)}${waiting >= (Number(settings().quoteFollowDays) || 7) ? `<div class="small" style="color:var(--warn)">Chờ ${waiting} ngày</div>` : ''}</td>
          <td><div class="cell-files">${fileButtons(q.quoteFiles, 'BG', { upAct: 'quote-edit', upId: q.id })}</div></td>
          <td><div class="cell-files">${fileButtons(q.contractFiles, 'HĐ', { upAct: 'quote-sign', upId: q.id })}</div>${q.contractNo ? `<div class="muted small nowrap">Số ${esc(q.contractNo)}</div>` : ''}</td>
          <td class="r">${cls.length || '—'}</td></tr>`;
      }).join('')}</tbody></table></div>`;
  },
};

/* ================= HỢP ĐỒNG ================= */
const ContractsView = {
  mount(el) {
    S.ui.cState = S.ui.cState || 'all'; S.ui.cYear = S.ui.cYear || 'all';
    el.innerHTML = `<div class="page-head"><div><h1>Danh sách hợp đồng</h1><div class="sub">Các công ty đã ký hợp đồng huấn luyện – tiến độ lớp học, thu tiền và lợi nhuận</div></div>
      <div class="actions">${exportBtn('hop-dong')}</div></div>
      <div data-kpi></div><div class="toolbar" data-state></div>
      <div class="toolbar"><div class="search">${ic('search')}<input class="input" type="search" id="c-search" placeholder="Tìm công ty, số hợp đồng…" value="${esc(S.ui.cSearch || '')}" data-input="c-search"></div>
      <select class="input" id="c-year" style="width:auto" data-input="c-year" aria-label="Năm"></select></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el;
    const all = S.quotes.filter(isContract);
    const years = uniq(all.map((q) => (q.contractDate || q.date || '').slice(0, 4)).filter(Boolean)).sort().reverse();
    el.querySelector('#c-year').innerHTML = `<option value="all">Mọi năm</option>${years.map((y) => `<option value="${y}"${S.ui.cYear === y ? ' selected' : ''}>Năm ${y}</option>`).join('')}`;
    const base = all.filter((q) => S.ui.cYear === 'all' || (q.contractDate || q.date || '').startsWith(S.ui.cYear));
    const states = ['Đang thực hiện', 'Đã dạy xong – chờ thu', 'Quá hạn thanh toán', 'Đã thu đủ', 'Hoàn tất'];
    el.querySelector('[data-state]').innerHTML = `<div class="chips"><button type="button" class="chip" data-act="c-state" data-v="all" aria-pressed="${S.ui.cState === 'all'}">Tất cả <span class="count">${base.length}</span></button>${states.map((s) => `<button type="button" class="chip" data-act="c-state" data-v="${esc(s)}" aria-pressed="${S.ui.cState === s}">${esc(s)} <span class="count">${base.filter((q) => contractState(q).label === s).length}</span></button>`).join('')}</div>`;
    const P = base.map(contractPnl);
    const tot = { total: sum(P, (p) => p.rev), paid: sum(P, (p) => p.paid), remain: sum(P, (p) => p.remain), profit: sum(P, (p) => p.profit) };
    el.querySelector('[data-kpi]').innerHTML = `<div class="kpis">${kpi('Hợp đồng', `${base.length}`, `${uniq(base.map((q) => q.customerId || q.customerName)).length} khách hàng`)}
      ${kpi('Tổng giá trị', moneyShort(tot.total), moneyD(tot.total))}${kpi('Đã thu', moneyShort(tot.paid), `${tot.total ? pct(tot.paid / tot.total) : '0%'} giá trị`)}
      ${kpi('Còn phải thu', moneyShort(tot.remain), moneyD(tot.remain), tot.remain > 0)}${kpi('Lợi nhuận', moneyShort(tot.profit), tot.total ? `Tỷ suất ${pct(tot.profit / tot.total)}` : '', false, tot.profit < 0 ? 'neg' : 'pos')}</div>`;
    const s = norm(S.ui.cSearch || '');
    const list = base.filter((q) => S.ui.cState === 'all' || contractState(q).label === S.ui.cState)
      .filter((q) => !s || norm([q.no, q.customerName, q.contractNo].join(' ')).includes(s))
      .sort((a, b) => (b.contractDate || '').localeCompare(a.contractDate || ''));
    const body = el.querySelector('[data-body]');
    if (!list.length) { body.innerHTML = `<div class="panel">${emptyBox(all.length ? 'Không có hợp đồng phù hợp' : 'Chưa có hợp đồng', all.length ? '' : 'Khi khách ký, mở báo giá và điền mục “Hợp đồng” (số HĐ, ngày ký, file) – công ty sẽ xuất hiện ở đây.', '<a class="btn sm edit-only" href="#bao-gia">Đến danh sách báo giá</a>')}</div>`; return; }
    body.innerHTML = `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Số HĐ</th><th>Ngày ký</th><th>Khách hàng</th><th class="r">Giá trị</th><th class="r">Lớp xong / tổng</th><th class="r">Đã thu</th><th class="r">Còn lại</th><th>Hạn TT</th><th class="r">Lợi nhuận</th><th>Tình trạng</th><th>File</th></tr></thead><tbody>
      ${list.map((q) => {
        const m = contractMoney(q); const p = contractPnl(q); const cls = quoteClasses(q).filter((c) => c.status !== 'cancelled'); const st = contractState(q);
        return `<tr data-act="quote-view" data-id="${esc(q.id)}"><td class="nowrap strong num">${esc(q.contractNo || '(chưa có số)')}<div class="muted small">BG ${esc(q.no || '')}</div></td><td class="nowrap num">${esc(fmtD(q.contractDate))}</td>
          <td><span class="strong">${esc(q.customerName)}</span></td>${moneyCell(m.total)}<td class="r">${cls.filter((c) => c.status === 'done').length} / ${cls.length}</td>
          ${moneyCell(m.paid)}<td class="r" style="font-weight:700;color:${m.remain > 0 ? 'var(--accent)' : 'var(--ok)'}">${money(m.remain)}</td><td class="nowrap num">${esc(fmtD(q.paymentDue)) || '—'}</td>
          <td class="r"><button type="button" class="linkbtn" data-act="pnl-view" data-id="${esc(q.id)}" style="color:${p.profit < 0 ? 'var(--bad)' : 'var(--ok)'}">${money(p.profit)}</button>${p.notes.length ? `<div class="small" style="color:var(--warn)" title="${esc(p.notes.join('; '))}">chưa đủ chi phí</div>` : ''}</td>
          <td>${pill(st.label, st.tone)}</td><td><div class="cell-files">${fileButtons(q.contractFiles, 'HĐ', { upAct: 'quote-sign', upId: q.id })}${fileButtons(q.quoteFiles, 'BG')}</div></td></tr>`;
      }).join('')}</tbody><tfoot><tr><td colspan="3">Tổng ${list.length} hợp đồng</td>${moneyCell(sum(list, (q) => contractMoney(q).total))}<td></td>${moneyCell(sum(list, (q) => contractMoney(q).paid))}${moneyCell(sum(list, (q) => contractMoney(q).remain))}<td></td>${moneyCell(sum(list, (q) => contractPnl(q).profit))}<td colspan="2"></td></tr></tfoot></table></div>`;
  },
};

/* ================= DOANH THU – LỢI NHUẬN ================= */
const ProfitView = {
  mount(el) {
    S.ui.pfPeriod = S.ui.pfPeriod || 'year'; S.ui.pfMonth = S.ui.pfMonth || todayISO().slice(0, 7);
    el.innerHTML = `<div class="page-head"><div><h1>Doanh thu – Lợi nhuận</h1><div class="sub">Doanh thu tính từ hợp đồng đã ký · Lợi nhuận = doanh thu – thù lao giảng viên – hoa hồng (gồm thuế khấu trừ) – chi phí khác</div></div>
      <div class="actions"><div class="seg" data-pf-seg></div><div class="cal-nav" data-pf-nav><button type="button" class="btn icon" data-act="pf-prev" aria-label="Kỳ trước">${ic('left')}</button><h2 data-pf-label style="font-size:15px;min-width:120px"></h2><button type="button" class="btn icon" data-act="pf-next" aria-label="Kỳ sau">${ic('right')}</button></div>${exportBtn('doanh-thu')}</div></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el; const kind = S.ui.pfPeriod; const P = viewPeriod(kind, S.ui.pfMonth);
    el.querySelector('[data-pf-seg]').innerHTML = periodSeg(kind, 'pf-period', ['month', 'quarter', 'year', 'all']);
    el.querySelector('[data-pf-label]').textContent = P.label;
    el.querySelector('[data-pf-nav]').style.visibility = kind === 'all' ? 'hidden' : '';
    const qs = S.quotes.filter((q) => isContract(q) && (kind === 'all' || ((q.contractDate || '') >= P.from && (q.contractDate || '') <= P.to)))
      .sort((a, b) => (b.contractDate || '').localeCompare(a.contractDate || ''));
    const rows = qs.map((q) => ({ q, p: contractPnl(q) }));
    const T = (f) => sum(rows, (r) => f(r.p));
    const rev = T((p) => p.rev); const prof = T((p) => p.profit);
    let html = `<div class="kpis">${kpi('Doanh thu', moneyShort(rev), `${rows.length} hợp đồng đã ký · ${moneyD(rev)}`)}
      ${kpi('Thù lao giảng viên', moneyShort(T((p) => p.gv)), rows.some((r) => r.p.gvEstimated) ? 'có số ước tính' : moneyD(T((p) => p.gv)))}
      ${kpi('Hoa hồng', moneyShort(T((p) => p.com.gross)), `Thực trả ${moneyShort(T((p) => p.com.net))} · thuế ${moneyShort(T((p) => p.com.tax))}`)}
      ${kpi('Chi phí khác', moneyShort(T((p) => p.other)), moneyD(T((p) => p.other)))}
      ${kpi('Lợi nhuận', moneyShort(prof), rev ? `Tỷ suất ${pct(prof / rev)}` : '—', false, prof < 0 ? 'neg' : 'pos')}
      ${kpi('Đã thu / còn phải thu', moneyShort(T((p) => p.paid)), `Còn phải thu ${moneyD(T((p) => p.remain))}`, T((p) => p.remain) > 0)}</div>`;
    const year = kind === 'all' ? todayISO().slice(0, 4) : P.from.slice(0, 4);
    html += `<section class="panel" style="margin-bottom:16px"><div class="panel-h"><h2>Doanh thu &amp; lợi nhuận theo tháng – năm ${year}</h2></div><div class="panel-b">${revenueChart(year, kind === 'month' ? S.ui.pfMonth : null)}</div></section>`;
    if (!rows.length) {
      html += `<div class="panel">${emptyBox('Chưa có hợp đồng đã ký trong kỳ', 'Doanh thu chỉ tính khi báo giá được chuyển thành hợp đồng (điền số hợp đồng, ngày ký ở tab Báo giá).', '<a class="btn sm" href="#bao-gia">Đến tab Báo giá</a>')}</div>`;
    } else {
      html += `<div class="panel tbl-wrap"><table class="tbl wide"><thead><tr><th>Số HĐ</th><th>Ngày ký</th><th style="min-width:200px">Khách hàng</th><th class="r">Doanh thu</th><th class="r">Thù lao GV</th><th class="r" title="Tổng hoa hồng đại lý (gồm thuế)">HH đại lý</th><th class="r" title="Tổng hoa hồng cán bộ quản lý phía khách hàng (gồm thuế)">HH cán bộ KH</th><th class="r">Trong đó thuế HH</th><th class="r">Chi phí khác</th><th class="r">Lợi nhuận</th><th class="r">Tỷ suất</th></tr></thead><tbody>
        ${rows.map(({ q, p }) => `<tr data-act="pnl-view" data-id="${esc(q.id)}"><td class="nowrap strong">${esc(q.contractNo || q.no || '')}</td><td class="nowrap num">${esc(fmtD(q.contractDate))}</td><td><span class="strong">${esc(q.customerName)}</span><div class="muted small">${p.classes.length} lớp</div>${p.notes.length ? `<div class="small" style="color:var(--warn)">${esc(p.notes.join('; '))}</div>` : ''}</td>
          ${moneyCell(p.rev)}<td class="r">${money(p.gv)}${p.gvEstimated ? '<div class="muted small">ước tính</div>' : ''}</td>${moneyCell(p.com.agent + p.com.other)}${moneyCell(p.com.manager)}${moneyCell(p.com.tax)}${moneyCell(p.other)}
          <td class="r strong" style="color:${p.profit < 0 ? 'var(--bad)' : 'var(--ok)'}">${money(p.profit)}</td><td class="r">${p.rev ? pct(p.margin) : '—'}</td></tr>`).join('')}
        </tbody><tfoot><tr><td colspan="3">Tổng ${rows.length} hợp đồng</td>${moneyCell(rev)}${moneyCell(T((p) => p.gv))}${moneyCell(T((p) => p.com.agent + p.com.other))}${moneyCell(T((p) => p.com.manager))}${moneyCell(T((p) => p.com.tax))}${moneyCell(T((p) => p.other))}${moneyCell(prof)}<td class="r">${rev ? pct(prof / rev) : ''}</td></tr></tfoot></table></div>
        <p class="small muted" style="margin-top:8px">Bấm một hợp đồng để nhập hoa hồng đại lý, hoa hồng cán bộ quản lý khách hàng (thuế khấu trừ ${esc(String(settings().commissionTax ?? 20))}%, sửa được) và các chi phí khác.</p>`;
    }
    const noContract = S.classes.filter((c) => c.status !== 'cancelled' && !contractOfClass(c) && (kind === 'all' || (c.startDate >= P.from && c.startDate <= P.to)));
    if (noContract.length) {
      html += `<section class="panel" style="margin-top:16px"><div class="panel-h"><h2>Lớp chưa có hợp đồng đã ký</h2>${pill(`${noContract.length} lớp · ${moneyShort(sum(noContract, (c) => Number(c.price) || 0))} chưa tính doanh thu`, 'warn')}</div><div class="panel-b flush"><ul class="list">${noContract.sort(sortClasses).slice(0, 12).map(classLi).join('')}</ul></div></section>`;
    }
    el.querySelector('[data-body]').innerHTML = html;
    hydrate(el);
  },
};

/* ================= KHÁCH HÀNG ================= */
const CustomersView = {
  mount(el) {
    el.innerHTML = `<div class="page-head"><div><h1>Khách hàng</h1><div class="sub">Lịch sử huấn luyện từng doanh nghiệp, công nợ, học viên đã cấp thẻ/GCN và hạn huấn luyện định kỳ</div></div>
      <div class="actions">${exportBtn('khach-hang')}<button type="button" class="btn cta edit-only" data-act="customer-new">${ic('plus')} Thêm khách hàng</button></div></div>
      <div class="toolbar"><div class="search">${ic('search')}<input class="input" type="search" id="cu-search" placeholder="Tìm tên công ty, MST, người liên hệ…" value="${esc(S.ui.cuSearch || '')}" data-input="cu-search"></div>
      <label class="inline-check"><input type="checkbox" id="cu-due" data-input="cu-due" ${S.ui.cuDue ? 'checked' : ''}> Chỉ khách sắp/đã đến hạn định kỳ</label><span class="muted small" data-count></span></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el; const s = norm(S.ui.cuSearch || ''); const warn = Number(settings().warnDays) || 60;
    const rows = S.customers.map((c) => ({ c, st: customerStats(c.id), dues: customerDues(c.id) }))
      .filter((r) => !s || norm([r.c.name, r.c.taxCode, r.c.contact, r.c.phone, r.c.address].join(' ')).includes(s))
      .filter((r) => !S.ui.cuDue || (r.dues[0] && daysBetween(todayISO(), r.dues[0].due) <= warn))
      .sort((a, b) => (a.dues[0]?.due || '9999').localeCompare(b.dues[0]?.due || '9999') || a.c.name.localeCompare(b.c.name, 'vi'));
    el.querySelector('[data-count]').textContent = `${rows.length} khách hàng`;
    const body = el.querySelector('[data-body]');
    if (!rows.length) { body.innerHTML = `<div class="panel">${emptyBox(S.customers.length ? 'Không có khách hàng phù hợp' : 'Chưa có khách hàng', S.customers.length ? '' : 'Khách hàng được tạo tự động khi nhập báo giá hoặc lên lịch lớp.', '')}</div>`; return; }
    body.innerHTML = `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Khách hàng</th><th>Vùng</th><th>Liên hệ</th><th class="r">Lớp</th><th class="r">Thẻ/GCN đã cấp</th><th class="r">Doanh thu HĐ</th><th class="r">Còn nợ</th><th>Lần gần nhất</th><th>Định kỳ tiếp theo</th></tr></thead><tbody>
      ${rows.map(({ c, st, dues }) => {
        const d = dues[0]; const tone = d ? dueTone(d.due) : null;
        return `<tr data-act="customer-view" data-id="${esc(c.id)}"><td><span class="strong">${esc(c.name)}</span>${c.taxCode ? `<div class="muted small">MST ${esc(c.taxCode)}</div>` : ''}</td><td>${c.region ? rtag(c.region) : '<span class="muted">—</span>'}</td>
          <td class="small">${esc(c.contact || '')}${c.phone ? `<div class="num">${esc(c.phone)}</div>` : ''}</td><td class="r">${st.classes}</td><td class="r">${money(st.certified)}</td>${moneyCell(st.revenue)}<td class="r" style="color:${st.remain > 0 ? 'var(--accent)' : 'inherit'}">${money(st.remain)}</td>
          <td class="nowrap num">${esc(fmtD(st.last)) || '—'}</td><td>${d ? `<span class="nowrap num">${esc(fmtD(d.due))}</span> · Nhóm ${d.group}<div>${pill(tone.text, tone.tone)}</div>` : '<span class="muted small">Chưa có lớp hoàn thành</span>'}</td></tr>`;
      }).join('')}</tbody></table></div>`;
  },
};

/* ================= CÀI ĐẶT ================= */
const SettingsView = {
  mount(el) { this.el = el; this.update(); },
  update() {
    const st = settings(); const ro = !S.role.canEdit; const dis = ro ? 'disabled' : '';
    const co = { ...DEFAULT_SETTINGS.company, ...(st.company || {}) };
    const modeText = { cloud: 'Bản dùng chung trên claude.ai – dữ liệu và file lưu trên hệ thống, mọi người được chia sẻ cùng thấy.', local: 'Bản ngoại tuyến – dữ liệu lưu trong trình duyệt của máy này. Dùng “Sao lưu” để chuyển sang máy khác.', demo: 'Đang xem dữ liệu mẫu – không lưu.' }[Store.backend?.kind] || '';
    const ex = commissionTax(30000000, Number(st.commissionTax ?? 20), st.commissionTaxMode === 'gross' ? 'gross' : 'net');
    this.el.innerHTML = `<div class="page-head"><div><h1>Cài đặt</h1><div class="sub">Bảng giá, hoa hồng, thông tin công ty trên báo cáo, vùng đào tạo, quy định theo nhóm huấn luyện và sao lưu dữ liệu</div></div>
      <div class="actions">${ro ? pill('Chỉ người quản lý được sửa', 'muted') : `<button type="button" class="btn primary" data-act="settings-save">${ic('check')} Lưu cài đặt</button>`}</div></div>
      <div class="grid-2"><div class="stack">
      <section class="panel"><div class="panel-h"><h2>Bảng giá huấn luyện</h2><span class="muted small">đào tạo ATVSLĐ không chịu thuế GTGT</span></div><div class="panel-b">
        <div class="tbl-wrap"><table class="tbl" id="tier-table"><thead><tr><th>Từ (HV)</th><th>Đến (HV)</th><th>Đơn giá/lớp (đ)</th><th></th></tr></thead><tbody>
        ${(st.priceTiers || []).map((t, i) => `<tr style="cursor:default"><td><input class="input" type="number" min="1" data-tier="min" data-i="${i}" value="${esc(t.min)}" ${dis} aria-label="Từ số học viên"></td><td><input class="input" type="number" min="1" data-tier="max" data-i="${i}" value="${esc(t.max)}" ${dis} aria-label="Đến số học viên"></td><td><input class="input" data-money data-tier="price" data-i="${i}" value="${money(t.price)}" ${dis} aria-label="Đơn giá"></td><td>${ro ? '' : `<button type="button" class="btn icon ghost" data-act="tier-del" data-i="${i}" aria-label="Xóa mức giá">${ic('trash')}</button>`}</td></tr>`).join('')}
        </tbody></table></div>
        ${ro ? '' : `<button type="button" class="btn sm" data-act="tier-add" style="margin-top:8px">${ic('plus')} Thêm mức giá</button>`}
        <div class="fgrid" style="margin-top:14px"><div class="f"><label for="set-follow">Nhắc theo dõi báo giá sau (ngày)</label><input class="input" type="number" min="1" id="set-follow" value="${esc(st.quoteFollowDays)}" ${dis}></div>
        <div class="f"><label for="set-warn">Cảnh báo trước hạn (ngày)</label><input class="input" type="number" min="1" id="set-warn" value="${esc(st.warnDays)}" ${dis}><span class="hint">Chứng chỉ GV, thẻ/GCN học viên, huấn luyện định kỳ.</span></div></div>
      </div></section>
      <section class="panel"><div class="panel-h"><h2>Hoa hồng &amp; thuế khấu trừ</h2></div><div class="panel-b"><div class="fgrid">
        <div class="f"><label for="set-ctax">Thuế khấu trừ trên hoa hồng (%)</label><input class="input" type="number" min="0" max="50" step="0.5" id="set-ctax" value="${esc(st.commissionTax ?? 20)}" ${dis}><span class="hint">Mặc định cho mỗi khoản hoa hồng mới; từng khoản vẫn sửa được.</span></div>
        <div class="f span2"><label for="set-cmode">Cách tính thuế</label><select class="input" id="set-cmode" ${dis}><option value="net"${st.commissionTaxMode !== 'gross' ? ' selected' : ''}>Thuế = % × số thực trả (30 tr → thuế 5 tr, thực trả 25 tr)</option><option value="gross"${st.commissionTaxMode === 'gross' ? ' selected' : ''}>Thuế = % × tổng hoa hồng (30 tr → thuế 6 tr, thực trả 24 tr)</option></select>
          <span class="hint">Đang áp dụng: hoa hồng 30.000.000 đ → thuế ${esc(moneyD(ex))}, thực trả ${esc(moneyD(30000000 - ex))}. Lợi nhuận trừ cả số thực trả và tiền thuế.</span></div>
      </div></div></section>
      <section class="panel"><div class="panel-h"><h2>Thông tin công ty trên báo cáo Excel</h2></div><div class="panel-b"><div class="fgrid">
        <div class="f span2"><label for="set-coname">Tên công ty</label><input class="input" id="set-coname" value="${esc(co.name)}" ${dis}></div>
        <div class="f span2"><label for="set-coaddr">Địa chỉ</label><input class="input" id="set-coaddr" value="${esc(co.address)}" ${dis}></div>
        <div class="f"><label for="set-cophone">Hotline</label><input class="input" id="set-cophone" value="${esc(co.phone)}" ${dis}></div>
        <div class="f"><label for="set-coemail">Email</label><input class="input" id="set-coemail" value="${esc(co.email)}" ${dis}></div>
        <div class="f"><label for="set-codir">Giám đốc (ký báo cáo)</label><input class="input" id="set-codir" value="${esc(co.director)}" ${dis}></div>
        <div class="f"><label for="set-cocity">Nơi lập báo cáo</label><input class="input" id="set-cocity" value="${esc(co.city)}" ${dis}></div>
      </div></div></section>
      <section class="panel"><div class="panel-h"><h2>Vùng đào tạo</h2></div><div class="panel-b">
        <div class="tbl-wrap"><table class="tbl" id="region-table"><thead><tr><th></th><th>Tên vùng</th><th>Trung tâm</th></tr></thead><tbody>
        ${regionList().map((r, i) => `<tr style="cursor:default" data-rid="${esc(r.id)}"><td><span class="rtag"><span class="sw" style="background:${regionColor(r.id)}"></span></span></td><td><input class="input" data-region="name" data-i="${i}" value="${esc(r.name)}" ${dis} aria-label="Tên vùng"></td><td><input class="input" data-region="center" data-i="${i}" value="${esc(r.center)}" ${dis} aria-label="Trung tâm"></td></tr>`).join('')}
        </tbody></table></div>${ro || regionList().length >= 6 ? '' : `<button type="button" class="btn sm" data-act="region-add" style="margin-top:8px">${ic('plus')} Thêm vùng</button>`}
      </div></section>
      </div><div class="stack">
      <section class="panel"><div class="panel-h"><h2>Nhóm huấn luyện</h2><span class="muted small">thời lượng lớp, hạn thẻ/GCN, nhắc định kỳ</span></div><div class="panel-b flush tbl-wrap">
        <table class="tbl"><thead><tr><th>Nhóm</th><th>Đối tượng</th><th>Giấy cấp</th><th>Số giờ lần đầu</th><th>Hiệu lực / định kỳ (tháng)</th></tr></thead><tbody>
        ${Object.entries(GROUPS).map(([g, v]) => `<tr style="cursor:default"><td class="strong">Nhóm ${g}</td><td class="small">${esc(v.desc)}</td><td class="small">${esc(v.paper)}</td><td><input class="input" type="number" min="1" style="width:90px" data-ghours="${g}" value="${esc(st.groupHours?.[g] ?? '')}" ${dis} aria-label="Số giờ nhóm ${g}"></td><td><input class="input" type="number" min="1" style="width:90px" data-gcycle="${g}" value="${esc(st.cycleMonths?.[g] ?? '')}" ${dis} aria-label="Chu kỳ nhóm ${g}"></td></tr>`).join('')}
        </tbody></table><div class="panel-b"><div class="fgrid"><div class="f"><label for="set-hpd">Số giờ học mỗi ngày</label><input class="input" type="number" min="1" max="12" id="set-hpd" value="${esc(st.hoursPerDay)}" ${dis}></div>
        <div class="f"><label for="set-ds">Giờ bắt đầu mặc định</label><input class="input" type="time" id="set-ds" value="${esc(st.dayStart)}" ${dis}></div><div class="f"><label for="set-de">Giờ kết thúc mặc định</label><input class="input" type="time" id="set-de" value="${esc(st.dayEnd)}" ${dis}></div></div>
        <p class="small muted" style="margin:10px 0 0">Theo quy định DAKO đang áp dụng (NĐ 44/2016, NĐ 140/2018). Lớp định kỳ gợi ý bằng 50% thời gian lần đầu; thẻ/GCN chưa ghi hạn sẽ tự tính hạn theo cột Hiệu lực.</p></div>
      </div></section>
      <section class="panel"><div class="panel-h"><h2>Danh mục chuyên ngành</h2></div><div class="panel-b"><div class="f"><label for="set-spec">Mỗi dòng một chuyên ngành – dùng khi nhập giảng viên</label><textarea class="input" id="set-spec" rows="8" ${dis}>${esc((st.specialties || []).join('\n'))}</textarea></div></div></section>
      <section class="panel"><div class="panel-h"><h2>Dữ liệu &amp; sao lưu</h2></div><div class="panel-b" style="display:flex;flex-direction:column;gap:12px">
        <div class="banner info" style="margin:0">${esc(modeText)}</div>
        <div class="small">Đang có: <b>${S.trainers.length}</b> giảng viên · <b>${S.classes.length}</b> lớp · <b>${S.quotes.length}</b> báo giá (${S.quotes.filter(isContract).length} hợp đồng) · <b>${S.customers.length}</b> khách hàng · <b>${allStudents().length}</b> học viên · <b>${FILES.size}</b> file</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn" data-act="export" data-v="tong-quan">${ic('table')} Xuất Excel tổng hợp</button><button type="button" class="btn" data-act="backup">${ic('down')} Sao lưu (.json)</button>
        <label class="btn edit-only" for="restore-file">${ic('up')} Khôi phục từ bản sao lưu</label><input type="file" id="restore-file" accept=".json,application/json" class="sr" data-input="restore"></div>
        <label class="inline-check"><input type="checkbox" id="backup-files" checked> Kèm các file đính kèm (ảnh, báo giá, hợp đồng, thẻ/GCN) trong bản sao lưu</label>
        <span class="small muted">Bản sao lưu dùng để cất giữ định kỳ hoặc chuyển dữ liệu giữa bản ngoại tuyến và bản dùng chung.</span>
        <div data-usage class="small muted"></div>
      </div></section>
      <section class="panel"><div class="panel-h"><h2>Chia sẻ &amp; phân quyền</h2></div><div class="panel-b small" style="color:var(--fg-2)">
        <p style="margin-top:0"><b>Người quản lý công cụ</b> (chủ sở hữu hoặc được mời với quyền <i>Chỉnh sửa</i>): thêm/sửa giảng viên, lịch, thù lao, báo giá, hợp đồng, hoa hồng, học viên, tải file lên.</p>
        <p><b>Giám đốc và các bộ phận khác</b> (mời với quyền <i>Xem</i>): xem toàn bộ lịch, chi phí, lợi nhuận, học viên, báo cáo và mở mọi file; không sửa được.</p>
        <p style="margin-bottom:0">Chia sẻ bằng nút <b>Share</b> của trang trên claude.ai. Người đang mở trang sẽ thấy thay đổi ngay khi người quản lý lưu.</p>
      </div></section>
      </div></div>`;
    bindMoney(this.el);
    if (Store.backend?.kind === 'cloud' && Store.backend.assets) {
      Store.backend.assets.list().then((r) => { const u = r.usage; const box = this.el.querySelector('[data-usage]'); if (box && u) box.textContent = `Kho file: ${u.files}/${u.maxFiles} file · ${fmtSize(u.bytes)} / ${fmtSize(u.maxBytes)}`; }).catch(() => {});
    }
  },
  collect() {
    const el = this.el; const st = clone(settings());
    const tiers = [];
    $$('#tier-table tbody tr', el).forEach((tr) => {
      const min = Number(tr.querySelector('[data-tier=min]').value), max = Number(tr.querySelector('[data-tier=max]').value), price = parseMoney(tr.querySelector('[data-tier=price]').value);
      if (min > 0 && max >= min && price > 0) tiers.push({ min, max, price });
    });
    st.priceTiers = tiers.sort((a, b) => a.min - b.min);
    delete st.vatRate;
    st.quoteFollowDays = Number($('#set-follow', el).value) || 7;
    st.warnDays = Number($('#set-warn', el).value) || 60;
    st.commissionTax = $('#set-ctax', el).value === '' ? 20 : Number($('#set-ctax', el).value);
    st.commissionTaxMode = $('#set-cmode', el).value === 'gross' ? 'gross' : 'net';
    st.company = { name: $('#set-coname', el).value.trim(), address: $('#set-coaddr', el).value.trim(), phone: $('#set-cophone', el).value.trim(), email: $('#set-coemail', el).value.trim(), director: $('#set-codir', el).value.trim(), city: $('#set-cocity', el).value.trim() };
    st.regions = $$('#region-table tbody tr', el).map((tr) => ({ id: tr.dataset.rid, name: tr.querySelector('[data-region=name]').value.trim() || 'Vùng chưa đặt tên', center: tr.querySelector('[data-region=center]').value.trim() }));
    st.groupHours = {}; st.cycleMonths = {};
    $$('[data-ghours]', el).forEach((i) => (st.groupHours[i.dataset.ghours] = Number(i.value) || DEFAULT_SETTINGS.groupHours[i.dataset.ghours]));
    $$('[data-gcycle]', el).forEach((i) => (st.cycleMonths[i.dataset.gcycle] = Number(i.value) || 24));
    st.hoursPerDay = Number($('#set-hpd', el).value) || 8;
    st.dayStart = $('#set-ds', el).value || '08:00'; st.dayEnd = $('#set-de', el).value || '17:00';
    st.specialties = uniq($('#set-spec', el).value.split('\n').map((s) => s.trim()).filter(Boolean));
    return st;
  },
};

const TABS = [
  { id: 'tong-quan', label: 'Tổng quan', icon: 'dash', view: OverviewView },
  { id: 'lich', label: 'Lịch giảng dạy', icon: 'cal', view: CalendarView },
  { id: 'giang-vien', label: 'Giảng viên', icon: 'users', view: TrainersView },
  { id: 'hoc-vien', label: 'Học viên', icon: 'idcard', view: StudentsView },
  { id: 'bao-gia', label: 'Báo giá', icon: 'file', view: QuotesView },
  { id: 'hop-dong', label: 'Hợp đồng', icon: 'sign', view: ContractsView },
  { id: 'doanh-thu', label: 'Doanh thu – Lợi nhuận', icon: 'trend', view: ProfitView },
  { id: 'khach-hang', label: 'Khách hàng', icon: 'building', view: CustomersView },
  { id: 'cai-dat', label: 'Cài đặt', icon: 'gear', view: SettingsView },
];
