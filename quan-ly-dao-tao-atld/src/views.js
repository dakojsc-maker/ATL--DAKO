/* ============================================================
   VIEWS – mỗi tab: mount(el) dựng khung + thanh công cụ, update() vẽ lại nội dung
   ============================================================ */

const regionChips = (sel, counts = null, act = 'region') => `<div class="chips" role="group" aria-label="Lọc theo vùng đào tạo">
  <button type="button" class="chip" data-act="${act}" data-v="all" aria-pressed="${sel === 'all'}">Tất cả vùng${counts ? ` <span class="count">${counts.all || 0}</span>` : ''}</button>
  ${regionList().map((r) => `<button type="button" class="chip" data-act="${act}" data-v="${esc(r.id)}" aria-pressed="${sel === r.id}"><span class="sw" style="background:${regionColor(r.id)}"></span>${esc(r.name)} <span class="count">· ${esc(r.center)}${counts ? ` · ${counts[r.id] || 0}` : ''}</span></button>`).join('')}
</div>`;
const emptyBox = (title, text = '', btn = '') => `<div class="empty"><b>${esc(title)}</b>${text ? esc(text) : ''}${btn ? `<div style="margin-top:10px">${btn}</div>` : ''}</div>`;

/* ================= TỔNG QUAN ================= */
const OverviewView = {
  mount(el) {
    S.ui.ovPeriod = S.ui.ovPeriod || 'month'; S.ui.ovMonth = S.ui.ovMonth || todayISO().slice(0, 7);
    el.innerHTML = `<div class="page-head"><div><h1>Tổng quan</h1><div class="sub">Tình hình huấn luyện ATVSLĐ, doanh thu và các việc cần xử lý</div></div>
      <div class="actions"><div class="seg" data-ov-seg></div><div class="cal-nav"><button type="button" class="btn icon" data-act="ov-prev" aria-label="Kỳ trước">${ic('left')}</button><h2 data-ov-label style="font-size:15px;min-width:120px"></h2><button type="button" class="btn icon" data-act="ov-next" aria-label="Kỳ sau">${ic('right')}</button></div>
      <button type="button" class="btn" data-act="export-xlsx">${ic('table')} Xuất Excel</button></div></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  period() {
    const p = S.ui.ovPeriod, ym = S.ui.ovMonth;
    if (p === 'year') { const y = ym.slice(0, 4); return { from: `${y}-01-01`, to: `${y}-12-31`, label: `Năm ${y}` }; }
    return { from: ym + '-01', to: monthEnd(ym), label: fmtYM(ym) };
  },
  update() {
    const el = this.el; const P = this.period();
    el.querySelector('[data-ov-seg]').innerHTML = `<button type="button" data-act="ov-period" data-v="month" aria-pressed="${S.ui.ovPeriod === 'month'}">Tháng</button><button type="button" data-act="ov-period" data-v="year" aria-pressed="${S.ui.ovPeriod === 'year'}">Năm</button>`;
    el.querySelector('[data-ov-label]').textContent = P.label;
    const body = el.querySelector('[data-body]');
    const nothing = !S.trainers.length && !S.classes.length && !S.quotes.length;
    if (nothing) { body.innerHTML = S.sync.state === 'loading' ? '<div class="panel">' + emptyBox('Đang tải dữ liệu…') + '</div>' : this.startHTML(); return; }

    const t = todayISO();
    const inP = S.classes.filter((c) => c.startDate >= P.from && c.startDate <= P.to);
    const live = inP.filter((c) => c.status !== 'cancelled');
    const done = live.filter((c) => c.status === 'done');
    const upcoming = live.filter((c) => c.startDate >= t && c.status !== 'done');
    const rev = sum(live, (c) => classMoney(c).rev), vat = sum(live, (c) => classMoney(c).vat), prof = sum(live, (c) => classMoney(c).profit);
    const contractsP = S.quotes.filter((q) => isContract(q) && q.contractDate && q.contractDate >= P.from && q.contractDate <= P.to);
    const allContracts = S.quotes.filter(isContract);
    const remain = sum(allContracts, (q) => contractMoney(q).remain);
    const overdue = allContracts.filter((q) => contractMoney(q).remain > 0 && q.paymentDue && q.paymentDue < t).length;
    const pending = S.quotes.filter((q) => ['sent', 'negotiating', 'accepted'].includes(q.status));
    const alerts = computeAlerts();

    const kpi = (k, v, d, hl = false) => `<div class="kpi${hl ? ' hl' : ''}"><span class="k">${k}</span><span class="v">${v}</span><span class="d">${d}</span></div>`;
    let html = `<div class="kpis">
      ${kpi('Lớp học', `${live.length}`, `${done.length} hoàn thành · ${upcoming.length} sắp tới${inP.length - live.length ? ` · ${inP.length - live.length} hủy` : ''}`)}
      ${kpi('Học viên', money(sum(live, (c) => c.students)), `Đã đào tạo xong: ${money(sum(done, (c) => c.students))}`)}
      ${kpi('Doanh thu (chưa VAT)', moneyShort(rev), `Gồm VAT: ${moneyD(rev + vat)}`)}
      ${kpi('Lợi nhuận gộp', moneyShort(prof), rev ? `Biên lợi nhuận ${Math.round((prof / rev) * 100)}%` : 'Chưa có doanh thu')}
      ${kpi('Hợp đồng ký mới', `${contractsP.length}`, `Giá trị ${moneyShort(sum(contractsP, (q) => contractMoney(q).total))} (gồm VAT)`)}
      ${kpi('Còn phải thu', moneyShort(remain), `${allContracts.filter((q) => contractMoney(q).remain > 0).length} hợp đồng${overdue ? ` · ${overdue} quá hạn` : ''}`, remain > 0)}
      ${kpi('Báo giá đang chờ', `${pending.length}`, `Giá trị ${moneyShort(sum(pending, (q) => quoteMoney(q).amount))} (chưa VAT)`)}
    </div><div class="grid-2"><div class="stack">`;

    // upcoming 14 days
    const in14 = S.classes.filter((c) => c.status !== 'cancelled' && (c.endDate || c.startDate) >= t && c.startDate <= addDays(t, 14)).sort(sortClasses);
    html += `<section class="panel"><div class="panel-h"><h2>Lịch dạy 14 ngày tới</h2><div class="actions"><a class="btn sm" href="#lich">${ic('cal')} Mở lịch</a></div></div><div class="panel-b flush">`;
    html += in14.length ? `<ul class="list">${in14.slice(0, 10).map((c) => classLi(c)).join('')}</ul>${in14.length > 10 ? `<div class="empty small">và ${in14.length - 10} lớp khác…</div>` : ''}` : emptyBox('Chưa có lớp nào trong 14 ngày tới', '', `<button type="button" class="btn sm cta edit-only" data-act="class-new">${ic('plus')} Lên lịch lớp</button>`);
    html += '</div></section>';

    // revenue chart by month of selected year
    const y = S.ui.ovMonth.slice(0, 4);
    const months = Array.from({ length: 12 }, (_, i) => `${y}-${pad(i + 1)}`);
    const data = months.map((ym) => {
      const cs = S.classes.filter((c) => c.status !== 'cancelled' && ymOf(c.startDate) === ym);
      const v = sum(cs, (c) => classMoney(c).rev);
      return { label: 'T' + Number(ym.slice(5)), value: v, cur: S.ui.ovPeriod === 'month' && ym === S.ui.ovMonth, tip: `${fmtYM(ym)}: ${moneyD(v)} · ${cs.length} lớp · ${money(sum(cs, (c) => c.students))} HV` };
    });
    html += `<section class="panel"><div class="panel-h"><h2>Doanh thu theo tháng – năm ${y}</h2><span class="muted small">chưa VAT · gồm lớp dự kiến và đã chốt</span></div><div class="panel-b">${barChart(data)}</div></section>`;

    // by region
    const rows = regionList().map((r) => {
      const cs = live.filter((c) => c.region === r.id);
      return { r, n: cs.length, hv: sum(cs, (c) => c.students), rev: sum(cs, (c) => classMoney(c).rev), gv: S.trainers.filter((x) => x.region === r.id && x.status !== 'paused').length };
    });
    const maxRev = Math.max(1, ...rows.map((x) => x.rev));
    html += `<section class="panel"><div class="panel-h"><h2>Theo vùng đào tạo – ${esc(P.label.toLowerCase())}</h2></div><div class="panel-b flush tbl-wrap"><table class="tbl"><thead><tr><th>Vùng</th><th class="r">Giảng viên</th><th class="r">Lớp</th><th class="r">Học viên</th><th class="r">Doanh thu</th><th style="width:28%"></th></tr></thead><tbody>
      ${rows.map((x) => `<tr data-act="goto-region" data-v="${esc(x.r.id)}"><td>${rtag(x.r.id)}<div class="muted small">${esc(x.r.center)}</div></td><td class="r">${x.gv}</td><td class="r">${x.n}</td><td class="r">${money(x.hv)}</td><td class="r">${moneyShort(x.rev)}</td><td><div class="minibar"><span style="width:${(x.rev / maxRev) * 100}%;background:${regionColor(x.r.id)}"></span></div></td></tr>`).join('')}
      </tbody></table></div></section>`;
    html += '</div><div class="stack">';

    // alerts
    html += `<section class="panel"><div class="panel-h"><h2>Cần chú ý</h2>${alerts.length ? pill(alerts.length + ' việc', alerts.some((a) => a.sev === 'bad') ? 'bad' : 'warn') : pill('Ổn', 'ok')}</div><div class="panel-b flush">`;
    html += alerts.length ? `<ul class="list">${alerts.slice(0, S.ui.allAlerts ? 200 : 8).map((a) => `<li class="clickable" data-act="${a.act}" data-id="${esc(a.id)}"><span class="alert-i ${a.sev}">${a.sev === 'bad' ? '!' : a.sev === 'warn' ? '!' : 'i'}</span><span class="s" style="color:var(--fg)">${esc(a.text)}</span></li>`).join('')}</ul>${alerts.length > 8 ? `<div class="empty small"><button type="button" class="btn sm ghost" data-act="toggle-alerts">${S.ui.allAlerts ? 'Thu gọn' : `Xem tất cả ${alerts.length} việc`}</button></div>` : ''}` : emptyBox('Không có việc cần xử lý', 'Lịch không trùng, hợp đồng và chứng chỉ đều trong hạn.');
    html += '</div></section>';

    // trainers load (selected month)
    const ym = S.ui.ovMonth;
    const loads = S.trainers.filter((x) => x.status !== 'paused').map((x) => ({ x, ...trainerMonthLoad(x.id, ym) })).sort((a, b) => b.days - a.days);
    const maxD = Math.max(1, ...loads.map((l) => l.days));
    html += `<section class="panel"><div class="panel-h"><h2>Giảng viên – ${esc(fmtYM(ym).toLowerCase())}</h2><div class="actions"><a class="btn sm" href="#giang-vien">Danh sách</a></div></div><div class="panel-b flush">`;
    html += loads.length ? `<ul class="list">${loads.slice(0, 8).map((l) => `<li class="clickable" data-act="trainer-view" data-id="${esc(l.x.id)}">${avatar(l.x)}<div class="grow"><div class="t">${esc(l.x.name)}</div><div class="s">${esc(regionName(l.x.region))} · ${l.days ? `${l.days} ngày dạy · ${l.classes.length} lớp` : 'Chưa có lịch'}</div><div class="minibar" style="margin-top:5px"><span style="width:${(l.days / maxD) * 100}%;background:${regionColor(l.x.region)}"></span></div></div></li>`).join('')}</ul>` : emptyBox('Chưa có giảng viên', '', `<button type="button" class="btn sm edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button>`);
    html += '</div></section>';

    // activity
    const entries = S.log.flatMap((d) => d.entries || []).sort((a, b) => b.t.localeCompare(a.t)).slice(0, 8);
    if (entries.length) {
      const kindName = { trainers: 'Giảng viên', classes: 'Lớp', quotes: 'Báo giá/HĐ', customers: 'Khách hàng', settings: 'Cài đặt' };
      html += `<section class="panel"><div class="panel-h"><h2>Cập nhật gần đây</h2></div><div class="panel-b flush"><ul class="list">${entries.map((e) => `<li><span class="alert-i info">${esc(e.a[0])}</span><div class="grow"><div class="s" style="color:var(--fg)">${esc(e.a)} ${esc((kindName[e.k] || '').toLowerCase())}: <b>${esc(e.l)}</b></div><div class="s muted">${esc(fmtStamp(e.t))}${e.by ? `<span data-uid="${esc(e.by)}"></span>` : ''}${e.via === 'claude' ? ' · nhập qua Claude' : ''}</div></div></li>`).join('')}</ul></div></section>`;
    }
    html += '</div></div>';
    body.innerHTML = html;
    hydrate(body); fillNames(body);
  },
  startHTML() {
    return `<section class="panel"><div class="panel-h"><h2>Bắt đầu sử dụng</h2>${S.role.canEdit ? '' : pill('Chế độ xem', 'muted')}</div><div class="panel-b">
      <p style="margin:0 0 14px;color:var(--fg-2)">Chưa có dữ liệu. ${S.role.canEdit ? 'Làm theo 3 bước dưới đây – mọi người được chia sẻ link sẽ thấy ngay những gì anh/chị nhập.' : 'Người quản lý chưa nhập dữ liệu. Anh/chị có thể xem thử bằng dữ liệu mẫu.'}</p>
      <div class="start">
        <div class="step"><span class="no">1</span><b>Nhập danh sách giảng viên</b><p>Họ tên, ảnh 3×4, số điện thoại, vùng đào tạo, chuyên ngành, nhóm được dạy, thù lao/ngày.</p><button type="button" class="btn sm edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button></div>
        <div class="step"><span class="no">2</span><b>Lập báo giá – hợp đồng</b><p>Tên công ty khách hàng, giá theo bảng giá (dưới 30 HV: 5 triệu; 30–60 HV: 8 triệu), tải file báo giá và hợp đồng.</p><button type="button" class="btn sm edit-only" data-act="quote-new">${ic('plus')} Thêm báo giá</button></div>
        <div class="step"><span class="no">3</span><b>Phân công lịch dạy</b><p>Bấm vào ngày trên lịch tháng, chọn vùng, giảng viên còn trống, địa điểm, số học viên – chi phí tự tính.</p><button type="button" class="btn sm cta edit-only" data-act="class-new">${ic('plus')} Lên lịch lớp</button></div>
      </div>
      <div style="margin-top:16px;display:flex;gap:10px;align-items:center;flex-wrap:wrap"><button type="button" class="btn" data-act="demo-on">${ic('eye')} Xem thử với dữ liệu mẫu</button><span class="muted small">Dữ liệu mẫu chỉ hiển thị trên máy anh/chị, không lưu và không ai khác thấy.</span></div>
    </div></section>`;
  },
};

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
    el.innerHTML = `<div class="page-head"><div><h1>Lịch phân công giảng dạy</h1><div class="sub">Bấm vào một ngày để lên lịch lớp · chọn vùng để xem giảng viên của vùng</div></div>
      <div class="actions"><button type="button" class="btn" data-act="export-xlsx">${ic('table')} Xuất Excel</button><button type="button" class="btn cta edit-only" data-act="class-new">${ic('plus')} Thêm lớp</button></div></div>
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
    el.querySelector('[data-views]').innerHTML = [['month', 'cal', 'Lịch tháng'], ['res', 'rows', 'Theo giảng viên'], ['list', 'list', 'Danh sách']]
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
    const offset = (first.getDay() + 6) % 7; // Monday first
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
    let html = `<div class="res-wrap"><table class="res"><thead><tr><th class="who">Giảng viên</th>`;
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
    const tot = cs.filter((c) => c.status !== 'cancelled');
    let html = `<div class="toolbar"><div class="search">${ic('search')}<input class="input" type="search" id="cal-search" placeholder="Tìm khách hàng, địa điểm, giảng viên…" value="${esc(S.ui.calSearch || '')}" data-input="cal-search"></div><span class="muted small">${cs.length} lớp</span></div>`;
    if (!cs.length) return html + `<div class="panel">${emptyBox('Không có lớp nào trong tháng này', '', `<button type="button" class="btn sm cta edit-only" data-act="class-new">${ic('plus')} Thêm lớp</button>`)}</div>`;
    html += `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Ngày</th><th>Khách hàng / lớp</th><th>Nhóm</th><th class="r">HV</th><th>Vùng · địa điểm</th><th>Giảng viên</th><th class="r">Doanh thu</th><th class="r">Chi phí</th><th class="r">Lãi gộp</th><th>Trạng thái</th><th>Hồ sơ</th></tr></thead><tbody>`;
    for (const c of cs) {
      const m = classMoney(c); const q2 = c.quoteId && quote(c.quoteId);
      html += `<tr class="${c.status === 'cancelled' ? 'cancel' : ''}" data-act="class-view" data-id="${esc(c.id)}"><td class="nowrap num">${esc(fmtDateRange(c.startDate, c.endDate))}<div class="muted small">${esc(c.startTime || '')}–${esc(c.endTime || '')}</div></td>
        <td><span class="strong">${esc(classLabel(c))}</span>${c.title ? `<div class="muted small">${esc(c.title)}</div>` : ''}${conflictsFor(c).length ? '<div>' + pill('Trùng lịch GV', 'bad') + '</div>' : ''}</td>
        <td class="nowrap">${esc(groupsShort(c.groups))}</td><td class="r">${money(c.students)}</td><td>${rtag(c.region)}<div class="muted small">${esc(c.location || '')}</div></td>
        <td>${esc(trainerNames(c.trainerIds)) || '<span style="color:var(--warn)">Chưa có</span>'}</td>
        <td class="r">${money(m.rev)}</td><td class="r">${money(m.cost)}</td><td class="r" style="color:${m.profit < 0 ? 'var(--bad)' : 'inherit'}">${money(m.profit)}</td><td>${classPill(c)}</td>
        <td><div class="cell-files">${q2 ? fileButtons(q2.quoteFiles, 'BG') + fileButtons(q2.contractFiles, 'HĐ') : '<span class="muted small">Chưa gắn BG</span>'}</div></td></tr>`;
    }
    html += `</tbody><tfoot><tr><td colspan="3">Tổng (không tính lớp hủy)</td><td class="r">${money(sum(tot, (c) => c.students))}</td><td colspan="2"></td><td class="r">${money(sum(tot, (c) => classMoney(c).rev))}</td><td class="r">${money(sum(tot, (c) => classMoney(c).cost))}</td><td class="r">${money(sum(tot, (c) => classMoney(c).profit))}</td><td colspan="2"></td></tr></tfoot></table></div>`;
    return html;
  },
};

/* ================= GIẢNG VIÊN ================= */
const TrainersView = {
  mount(el) {
    S.ui.trRegion = S.ui.trRegion || 'all'; S.ui.trStatus = S.ui.trStatus || 'active';
    el.innerHTML = `<div class="page-head"><div><h1>Danh sách giảng viên</h1><div class="sub">Thông tin liên hệ, vùng đào tạo, chuyên ngành và lịch dạy của từng giảng viên</div></div>
      <div class="actions"><button type="button" class="btn cta edit-only" data-act="trainer-new">${ic('plus')} Thêm giảng viên</button></div></div>
      <div class="toolbar" data-regions></div>
      <div class="toolbar"><div class="search">${ic('search')}<input class="input" type="search" id="tr-search" placeholder="Tìm tên, SĐT, chuyên ngành…" value="${esc(S.ui.trSearch || '')}" data-input="tr-search"></div>
        <select class="input" id="tr-spec" style="width:auto;max-width:260px" data-input="tr-spec" aria-label="Lọc theo chuyên ngành"></select>
        <select class="input" id="tr-status" style="width:auto" data-input="tr-status" aria-label="Lọc theo trạng thái"><option value="active">Đang hoạt động</option><option value="paused">Tạm ngưng</option><option value="all">Tất cả</option></select>
        <span class="muted small" data-count></span></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el; const ym = todayISO().slice(0, 7); const t = todayISO();
    const counts = { all: S.trainers.filter((x) => x.status !== 'paused').length };
    regionList().forEach((r) => (counts[r.id] = S.trainers.filter((x) => x.region === r.id && x.status !== 'paused').length));
    el.querySelector('[data-regions]').innerHTML = regionChips(S.ui.trRegion, counts, 'tr-region');
    const specs = uniq([...(settings().specialties || []), ...S.trainers.flatMap((x) => x.specialties || [])]);
    const sp = el.querySelector('#tr-spec');
    sp.innerHTML = `<option value="">Mọi chuyên ngành</option>${specs.map((s) => `<option${S.ui.trSpec === s ? ' selected' : ''}>${esc(s)}</option>`).join('')}`;
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
      const load = trainerMonthLoad(x.id, ym); const nx = trainerNext(x.id);
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
        <div class="tcard-bot">${today.length ? pill('Hôm nay: đang dạy', 'accent') : pill('Hôm nay: rảnh', 'ok')}<span>Tháng ${Number(ym.slice(5))}: <b>${load.days}</b> ngày dạy</span>${nx ? `<span class="next">Lớp tới: ${esc(fmtDM(nx.startDate))} · ${esc(classLabel(nx))}</span>` : ''}</div>
      </article>`;
    }).join('')}</div>`;
    hydrate(body);
  },
};

/* ================= BÁO GIÁ ================= */
const QuotesView = {
  mount(el) {
    S.ui.qStatus = S.ui.qStatus || 'all'; S.ui.qYear = S.ui.qYear || 'all';
    el.innerHTML = `<div class="page-head"><div><h1>Danh sách báo giá</h1><div class="sub">Báo giá gửi khách hàng, file báo giá và file hợp đồng – bấm “Xem” để mở file</div></div>
      <div class="actions"><button type="button" class="btn" data-act="export-xlsx">${ic('table')} Xuất Excel</button><button type="button" class="btn cta edit-only" data-act="quote-new">${ic('plus')} Thêm báo giá</button></div></div>
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
    el.querySelector('[data-count]').textContent = `${list.length} báo giá · ${moneyShort(sum(list, (q) => quoteMoney(q).amount))} (chưa VAT)`;
    const body = el.querySelector('[data-body]');
    if (!list.length) { body.innerHTML = `<div class="panel">${emptyBox(S.quotes.length ? 'Không có báo giá phù hợp' : 'Chưa có báo giá', S.quotes.length ? '' : 'Nhập tên công ty khách hàng, tải lên file báo giá; khi khách ký thì tải lên hợp đồng.', `<button type="button" class="btn sm cta edit-only" data-act="quote-new">${ic('plus')} Thêm báo giá</button>`)}</div>`; return; }
    const t = todayISO();
    body.innerHTML = `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Số BG</th><th>Ngày</th><th>Khách hàng</th><th>Nội dung</th><th class="r">Giá trị (chưa VAT)</th><th>Trạng thái</th><th>File báo giá</th><th>File hợp đồng</th><th class="r">Lớp</th></tr></thead><tbody>
      ${list.map((q) => {
        const qm = quoteMoney(q); const cls = quoteClasses(q);
        const waiting = ['sent', 'negotiating'].includes(q.status) && q.date ? daysBetween(q.date, t) : 0;
        return `<tr data-act="quote-view" data-id="${esc(q.id)}"><td class="nowrap strong num">${esc(q.no || '—')}</td><td class="nowrap num">${esc(fmtD(q.date))}</td>
          <td><span class="strong">${esc(q.customerName || '')}</span>${q.contact ? `<div class="muted small">${esc(q.contact)}${q.contactPhone ? ' · ' + esc(q.contactPhone) : ''}</div>` : ''}</td>
          <td class="small">${esc([groupsText(q.groups), q.students ? q.students + ' HV' : '', q.classCount ? q.classCount + ' lớp' : ''].filter(Boolean).join(' · '))}</td>
          <td class="r">${money(qm.amount)}</td>
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
    el.innerHTML = `<div class="page-head"><div><h1>Danh sách hợp đồng</h1><div class="sub">Các công ty đã ký hợp đồng huấn luyện – tiến độ lớp học và thu tiền</div></div>
      <div class="actions"><button type="button" class="btn" data-act="export-xlsx">${ic('table')} Xuất Excel</button></div></div>
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
    const tot = { total: sum(base, (q) => contractMoney(q).total), paid: sum(base, (q) => contractMoney(q).paid), remain: sum(base, (q) => contractMoney(q).remain) };
    el.querySelector('[data-kpi]').innerHTML = `<div class="kpis"><div class="kpi"><span class="k">Hợp đồng</span><span class="v">${base.length}</span><span class="d">${uniq(base.map((q) => q.customerId || q.customerName)).length} khách hàng</span></div>
      <div class="kpi"><span class="k">Tổng giá trị (gồm VAT)</span><span class="v">${moneyShort(tot.total)}</span><span class="d">${moneyD(tot.total)}</span></div>
      <div class="kpi"><span class="k">Đã thu</span><span class="v">${moneyShort(tot.paid)}</span><span class="d">${tot.total ? Math.round((tot.paid / tot.total) * 100) : 0}% giá trị</span></div>
      <div class="kpi${tot.remain > 0 ? ' hl' : ''}"><span class="k">Còn phải thu</span><span class="v">${moneyShort(tot.remain)}</span><span class="d">${moneyD(tot.remain)}</span></div></div>`;
    const s = norm(S.ui.cSearch || '');
    const list = base.filter((q) => S.ui.cState === 'all' || contractState(q).label === S.ui.cState)
      .filter((q) => !s || norm([q.no, q.customerName, q.contractNo].join(' ')).includes(s))
      .sort((a, b) => (b.contractDate || '').localeCompare(a.contractDate || ''));
    const body = el.querySelector('[data-body]');
    if (!list.length) { body.innerHTML = `<div class="panel">${emptyBox(all.length ? 'Không có hợp đồng phù hợp' : 'Chưa có hợp đồng', all.length ? '' : 'Khi khách ký, mở báo giá và điền mục “Hợp đồng” (số HĐ, ngày ký, file) – công ty sẽ xuất hiện ở đây.', `<a class="btn sm edit-only" href="#bao-gia">Đến danh sách báo giá</a>`)}</div>`; return; }
    body.innerHTML = `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Số HĐ</th><th>Ngày ký</th><th>Khách hàng</th><th class="r">Giá trị (gồm VAT)</th><th class="r">Lớp xong / tổng</th><th class="r">Đã thu</th><th class="r">Còn lại</th><th>Hạn TT</th><th>Tình trạng</th><th>File</th></tr></thead><tbody>
      ${list.map((q) => {
        const m = contractMoney(q); const cls = quoteClasses(q).filter((c) => c.status !== 'cancelled'); const st = contractState(q);
        return `<tr data-act="quote-view" data-id="${esc(q.id)}"><td class="nowrap strong num">${esc(q.contractNo || '(chưa có số)')}<div class="muted small">BG ${esc(q.no || '')}</div></td><td class="nowrap num">${esc(fmtD(q.contractDate))}</td>
          <td><span class="strong">${esc(q.customerName)}</span></td><td class="r">${money(m.total)}</td><td class="r">${cls.filter((c) => c.status === 'done').length} / ${cls.length}</td>
          <td class="r">${money(m.paid)}</td><td class="r" style="font-weight:700;color:${m.remain > 0 ? 'var(--accent)' : 'var(--ok)'}">${money(m.remain)}</td><td class="nowrap num">${esc(fmtD(q.paymentDue)) || '—'}</td>
          <td>${pill(st.label, st.tone)}</td><td><div class="cell-files">${fileButtons(q.contractFiles, 'HĐ', { upAct: 'quote-sign', upId: q.id })}${fileButtons(q.quoteFiles, 'BG')}</div></td></tr>`;
      }).join('')}</tbody><tfoot><tr><td colspan="3">Tổng ${list.length} hợp đồng</td><td class="r">${money(sum(list, (q) => contractMoney(q).total))}</td><td></td><td class="r">${money(sum(list, (q) => contractMoney(q).paid))}</td><td class="r">${money(sum(list, (q) => contractMoney(q).remain))}</td><td colspan="3"></td></tr></tfoot></table></div>`;
  },
};

/* ================= KHÁCH HÀNG ================= */
const CustomersView = {
  mount(el) {
    el.innerHTML = `<div class="page-head"><div><h1>Khách hàng</h1><div class="sub">Lịch sử huấn luyện từng doanh nghiệp và hạn huấn luyện định kỳ tiếp theo</div></div>
      <div class="actions"><button type="button" class="btn cta edit-only" data-act="customer-new">${ic('plus')} Thêm khách hàng</button></div></div>
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
    body.innerHTML = `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Khách hàng</th><th>Vùng</th><th>Liên hệ</th><th class="r">Lớp</th><th class="r">HV đã đào tạo</th><th class="r">Doanh thu</th><th>Lần gần nhất</th><th>Định kỳ tiếp theo</th></tr></thead><tbody>
      ${rows.map(({ c, st, dues }) => {
        const d = dues[0]; const tone = d ? dueTone(d.due) : null;
        return `<tr data-act="customer-view" data-id="${esc(c.id)}"><td><span class="strong">${esc(c.name)}</span>${c.taxCode ? `<div class="muted small">MST ${esc(c.taxCode)}</div>` : ''}</td><td>${c.region ? rtag(c.region) : '<span class="muted">—</span>'}</td>
          <td class="small">${esc(c.contact || '')}${c.phone ? `<div class="num">${esc(c.phone)}</div>` : ''}</td><td class="r">${st.classes}</td><td class="r">${money(st.students)}</td><td class="r">${moneyShort(st.revenue)}</td>
          <td class="nowrap num">${esc(fmtD(st.last)) || '—'}</td><td>${d ? `<span class="nowrap num">${esc(fmtD(d.due))}</span> · Nhóm ${d.group}<div>${pill(tone.text, tone.tone)}</div>` : '<span class="muted small">Chưa có lớp hoàn thành</span>'}</td></tr>`;
      }).join('')}</tbody></table></div>`;
  },
};

/* ================= CÀI ĐẶT ================= */
const SettingsView = {
  mount(el) { this.el = el; this.update(); },
  update() {
    const st = settings(); const ro = !S.role.canEdit; const dis = ro ? 'disabled' : '';
    const modeText = { cloud: 'Bản dùng chung trên claude.ai – dữ liệu và file lưu trên hệ thống, mọi người được chia sẻ cùng thấy.', local: 'Bản ngoại tuyến – dữ liệu lưu trong trình duyệt của máy này. Dùng “Sao lưu” để chuyển sang máy khác.', demo: 'Đang xem dữ liệu mẫu – không lưu.' }[Store.backend?.kind] || '';
    this.el.innerHTML = `<div class="page-head"><div><h1>Cài đặt</h1><div class="sub">Bảng giá, vùng đào tạo, quy định theo nhóm huấn luyện và sao lưu dữ liệu</div></div>
      <div class="actions">${ro ? pill('Chỉ người quản lý được sửa', 'muted') : `<button type="button" class="btn primary" data-act="settings-save">${ic('check')} Lưu cài đặt</button>`}</div></div>
      <div class="grid-2"><div class="stack">
      <section class="panel"><div class="panel-h"><h2>Bảng giá huấn luyện (chưa VAT)</h2></div><div class="panel-b">
        <div class="tbl-wrap"><table class="tbl" id="tier-table"><thead><tr><th>Từ (HV)</th><th>Đến (HV)</th><th>Đơn giá/lớp (đ)</th><th></th></tr></thead><tbody>
        ${(st.priceTiers || []).map((t, i) => `<tr style="cursor:default"><td><input class="input" type="number" min="1" data-tier="min" data-i="${i}" value="${esc(t.min)}" ${dis} aria-label="Từ số học viên"></td><td><input class="input" type="number" min="1" data-tier="max" data-i="${i}" value="${esc(t.max)}" ${dis} aria-label="Đến số học viên"></td><td><input class="input" data-money data-tier="price" data-i="${i}" value="${money(t.price)}" ${dis} aria-label="Đơn giá"></td><td>${ro ? '' : `<button type="button" class="btn icon ghost" data-act="tier-del" data-i="${i}" aria-label="Xóa mức giá">${ic('trash')}</button>`}</td></tr>`).join('')}
        </tbody></table></div>
        ${ro ? '' : `<button type="button" class="btn sm" data-act="tier-add" style="margin-top:8px">${ic('plus')} Thêm mức giá</button>`}
        <div class="fgrid" style="margin-top:14px"><div class="f"><label for="set-vat">Thuế VAT mặc định (%)</label><input class="input" type="number" min="0" max="20" step="0.5" id="set-vat" value="${esc(st.vatRate)}" ${dis}><span class="hint">Áp dụng khi tạo lớp/báo giá mới; từng lớp vẫn chỉnh được.</span></div>
        <div class="f"><label for="set-follow">Nhắc theo dõi báo giá sau (ngày)</label><input class="input" type="number" min="1" id="set-follow" value="${esc(st.quoteFollowDays)}" ${dis}></div>
        <div class="f"><label for="set-warn">Cảnh báo trước hạn (ngày)</label><input class="input" type="number" min="1" id="set-warn" value="${esc(st.warnDays)}" ${dis}><span class="hint">Chứng chỉ GV, huấn luyện định kỳ của khách.</span></div></div>
      </div></section>
      <section class="panel"><div class="panel-h"><h2>Vùng đào tạo</h2></div><div class="panel-b">
        <div class="tbl-wrap"><table class="tbl" id="region-table"><thead><tr><th></th><th>Tên vùng</th><th>Trung tâm</th></tr></thead><tbody>
        ${regionList().map((r, i) => `<tr style="cursor:default" data-rid="${esc(r.id)}"><td><span class="rtag"><span class="sw" style="background:${regionColor(r.id)}"></span></span></td><td><input class="input" data-region="name" data-i="${i}" value="${esc(r.name)}" ${dis} aria-label="Tên vùng"></td><td><input class="input" data-region="center" data-i="${i}" value="${esc(r.center)}" ${dis} aria-label="Trung tâm"></td></tr>`).join('')}
        </tbody></table></div>${ro || regionList().length >= 6 ? '' : `<button type="button" class="btn sm" data-act="region-add" style="margin-top:8px">${ic('plus')} Thêm vùng</button>`}
      </div></section>
      <section class="panel"><div class="panel-h"><h2>Nhóm huấn luyện</h2><span class="muted small">gợi ý thời lượng lớp và nhắc định kỳ</span></div><div class="panel-b flush tbl-wrap">
        <table class="tbl"><thead><tr><th>Nhóm</th><th>Đối tượng</th><th>Giấy cấp</th><th>Số giờ lần đầu</th><th>Nhắc định kỳ (tháng)</th></tr></thead><tbody>
        ${Object.entries(GROUPS).map(([g, v]) => `<tr style="cursor:default"><td class="strong">Nhóm ${g}</td><td class="small">${esc(v.desc)}</td><td class="small">${esc(v.paper)}</td><td><input class="input" type="number" min="1" style="width:90px" data-ghours="${g}" value="${esc(st.groupHours?.[g] ?? '')}" ${dis} aria-label="Số giờ nhóm ${g}"></td><td><input class="input" type="number" min="1" style="width:90px" data-gcycle="${g}" value="${esc(st.cycleMonths?.[g] ?? '')}" ${dis} aria-label="Chu kỳ nhóm ${g}"></td></tr>`).join('')}
        </tbody></table><div class="panel-b"><div class="fgrid"><div class="f"><label for="set-hpd">Số giờ học mỗi ngày</label><input class="input" type="number" min="1" max="12" id="set-hpd" value="${esc(st.hoursPerDay)}" ${dis}></div>
        <div class="f"><label for="set-ds">Giờ bắt đầu mặc định</label><input class="input" type="time" id="set-ds" value="${esc(st.dayStart)}" ${dis}></div><div class="f"><label for="set-de">Giờ kết thúc mặc định</label><input class="input" type="time" id="set-de" value="${esc(st.dayEnd)}" ${dis}></div></div>
        <p class="small muted" style="margin:10px 0 0">Giá trị mặc định theo quy định DAKO đang áp dụng (NĐ 44/2016, NĐ 140/2018). Lớp định kỳ được gợi ý bằng 50% thời gian lần đầu. Kiểm tra lại khi có văn bản mới.</p></div>
      </div></section>
      </div><div class="stack">
      <section class="panel"><div class="panel-h"><h2>Danh mục chuyên ngành</h2></div><div class="panel-b"><div class="f"><label for="set-spec">Mỗi dòng một chuyên ngành – dùng khi nhập giảng viên</label><textarea class="input" id="set-spec" rows="10" ${dis}>${esc((st.specialties || []).join('\n'))}</textarea></div></div></section>
      <section class="panel"><div class="panel-h"><h2>Dữ liệu &amp; sao lưu</h2></div><div class="panel-b" style="display:flex;flex-direction:column;gap:12px">
        <div class="banner info" style="margin:0">${esc(modeText)}</div>
        <div class="small">Đang có: <b>${S.trainers.length}</b> giảng viên · <b>${S.classes.length}</b> lớp · <b>${S.quotes.length}</b> báo giá (${S.quotes.filter(isContract).length} hợp đồng) · <b>${S.customers.length}</b> khách hàng · <b>${FILES.size}</b> file</div>
        <div style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn" data-act="export-xlsx">${ic('table')} Xuất Excel tổng hợp</button><button type="button" class="btn" data-act="backup">${ic('down')} Sao lưu (.json)</button>
        <label class="btn edit-only" for="restore-file">${ic('up')} Khôi phục từ bản sao lưu</label><input type="file" id="restore-file" accept=".json,application/json" class="sr" data-input="restore"></div>
        <label class="inline-check"><input type="checkbox" id="backup-files" checked> Kèm các file đính kèm (ảnh, báo giá, hợp đồng) trong bản sao lưu</label>
        <span class="small muted">Bản sao lưu dùng để cất giữ định kỳ hoặc chuyển dữ liệu giữa bản ngoại tuyến và bản dùng chung.</span>
        <div data-usage class="small muted"></div>
      </div></section>
      <section class="panel"><div class="panel-h"><h2>Chia sẻ &amp; phân quyền</h2></div><div class="panel-b small" style="color:var(--fg-2)">
        <p style="margin-top:0"><b>Người quản lý công cụ</b> (chủ sở hữu hoặc được mời với quyền <i>Chỉnh sửa</i>): thêm/sửa giảng viên, lịch, báo giá, hợp đồng, tải file lên.</p>
        <p><b>Giám đốc và các bộ phận khác</b> (mời với quyền <i>Xem</i>): xem toàn bộ lịch, danh sách, chi phí, báo cáo và mở mọi file báo giá – hợp đồng; không sửa được.</p>
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
    st.vatRate = Number($('#set-vat', el).value) || 0;
    st.quoteFollowDays = Number($('#set-follow', el).value) || 7;
    st.warnDays = Number($('#set-warn', el).value) || 60;
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
  { id: 'bao-gia', label: 'Báo giá', icon: 'file', view: QuotesView },
  { id: 'hop-dong', label: 'Hợp đồng', icon: 'sign', view: ContractsView },
  { id: 'khach-hang', label: 'Khách hàng', icon: 'building', view: CustomersView },
  { id: 'cai-dat', label: 'Cài đặt', icon: 'gear', view: SettingsView },
];
