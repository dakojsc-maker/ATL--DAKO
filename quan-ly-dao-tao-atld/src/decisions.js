/* ============================================================
   QUYẾT ĐỊNH HOÀN THÀNH KHÓA HỌC – sổ theo dõi số quyết định dạng STT/QĐ-N(1-6)-DAKO
   • Cấp số tiếp theo tự động (liên tục cả năm hoặc riêng từng nhóm – chọn trong Cài đặt), đánh lại từ 01 mỗi năm
   • Báo trùng số, số bị bỏ trống; đối chiếu với số quyết định ghi trong sổ cấp thẻ/GCN
   ============================================================ */

const DEC_STATUS = { draft: { label: 'Dự thảo – chờ ký', tone: 'info' }, signed: { label: 'Đã ký', tone: 'ok' }, cancelled: { label: 'Đã hủy', tone: 'muted' } };
const decFmt = () => settings().decisionNoFormat || DEFAULT_SETTINGS.decisionNoFormat;
const decSeqMode = () => (settings().decisionSeq === 'group' ? 'group' : 'year');
const decYear = (d) => Number(String(d.date || d.createdAt || todayISO()).slice(0, 4));
const decStt = (d) => Number(d.stt) || parseDocNo(decFmt(), d.no)?.stt || 0;
const decGroup = (d) => Number(d.group) || parseDocNo(decFmt(), d.no)?.group || 0;
const decPaper = (g) => (GROUPS[g]?.paper === 'GCN' ? 'Giấy chứng nhận' : GROUPS[g]?.paper || '');
const decNo = (stt, group, year) => fmtDocNo(decFmt(), { stt, group, year });
/** Phạm vi đánh số: cả năm (mặc định) hoặc từng nhóm trong năm. */
const decInScope = (d, year, group) => decYear(d) === Number(year) && (decSeqMode() === 'year' || decGroup(d) === Number(group));
function nextDecStt(year, group, exceptIds = []) {
  let max = 0;
  for (const d of S.decisions) if (!exceptIds.includes(d.id) && decInScope(d, year, group)) max = Math.max(max, decStt(d));
  return max + 1;
}
function decUsed(year, group, exceptIds = []) {
  return S.decisions.filter((d) => !exceptIds.includes(d.id) && decInScope(d, year, group)).map(decStt).filter(Boolean).sort((a, b) => a - b);
}
/** Số bị bỏ trống (1 → số lớn nhất) trong một phạm vi đánh số. */
function decGaps(year, group) {
  const used = new Set(decUsed(year, group)); const max = Math.max(0, ...used); const out = [];
  for (let i = 1; i < max; i++) if (!used.has(i)) out.push(i);
  return out;
}
const decKey = (d) => `${decYear(d)}|${decSeqMode() === 'group' ? decGroup(d) + '|' : ''}${decStt(d)}`;
function decDuplicates(list = S.decisions) {
  const map = new Map();
  for (const d of list) { if (!decStt(d)) continue; const k = decKey(d); map.set(k, [...(map.get(k) || []), d]); }
  return Array.from(map.values()).filter((v) => v.length > 1);
}
function decClash(no, stt, group, year, exceptId) {
  const n = norm(no);
  return S.decisions.find((d) => d.id !== exceptId && decYear(d) === Number(year) && ((n && norm(d.no) === n) || (stt && decStt(d) === Number(stt) && (decSeqMode() === 'year' || decGroup(d) === Number(group)))));
}
const decStudentsOf = (d) => {
  if (!d.batchId) return [];
  return allStudents().filter((x) => (x.r.batchId || x.r.id) === d.batchId && (!d.group || !x.v.group || Number(x.v.group) === Number(d.group)));
};
let DEC_INDEX = { src: null, map: new Map() };
function decIndex() {
  if (DEC_INDEX.src === S.decisions) return DEC_INDEX.map;
  const map = new Map();
  for (const d of S.decisions) {
    if (d.status === 'cancelled') continue;
    if (d.batchId) { map.set(`${d.batchId}|${decGroup(d)}`, d); if (!map.has(`${d.batchId}|*`)) map.set(`${d.batchId}|*`, d); }
    if (d.no) map.set('no|' + norm(d.no), d);
  }
  DEC_INDEX = { src: S.decisions, map };
  return map;
}
/** Quyết định áp cho một học viên: theo sổ theo dõi (đợt + nhóm), nếu không có thì lấy số ghi trong sổ cấp. */
function decisionForStudent(s, r) {
  const idx = decIndex(); const bid = r.batchId || r.id; const g = Number(s.group) || Number((r.groups || [])[0]) || 0;
  const d = (g ? idx.get(`${bid}|${g}`) : idx.get(`${bid}|*`)) || (r.decisionNo ? idx.get('no|' + norm(r.decisionNo)) : null);
  return d ? { no: d.no, date: d.date, id: d.id, files: d.files || [] } : r.decisionNo ? { no: r.decisionNo, date: r.decisionDate, id: null, files: [] } : null;
}
/** Số quyết định ghi trong sổ cấp nhưng chưa có trong sổ theo dõi. */
function decFromRosters() {
  const have = new Set(S.decisions.map((d) => norm(d.no)));
  const map = new Map();
  for (const b of batchesOf()) {
    const r = b.r; if (!r.decisionNo || have.has(norm(r.decisionNo))) continue;
    const k = norm(r.decisionNo); if (!map.has(k)) map.set(k, { no: r.decisionNo, date: r.decisionDate || r.issueDate || '', batch: b });
  }
  return Array.from(map.values());
}

/* ======================= TAB ======================= */
const DecisionsView = {
  mount(el) {
    S.ui.decYear = S.ui.decYear || todayISO().slice(0, 4); S.ui.decGroup = S.ui.decGroup || 'all'; S.ui.decStatus = S.ui.decStatus || 'all';
    el.innerHTML = `<div class="page-head"><div><h1>Theo dõi số quyết định hoàn thành khóa học</h1><div class="sub">Số quyết định dạng <b>${esc(decFmt().replace(/\{stt\}/i, 'STT').replace(/\{nh[óo]m\}/i, '(1-6)').replace(/\{n[ăa]m\}/i, 'năm'))}</b> – công cụ cấp số tiếp theo, báo trùng số và số bị bỏ trống, gắn với lớp học và sổ cấp thẻ/GCN</div></div>
      <div class="actions">${exportBtn('quyet-dinh')}<button type="button" class="btn cta edit-only" data-act="dec-new">${ic('plus')} Cấp số quyết định</button></div></div>
      <div class="toolbar"><div class="search">${ic('search')}<input class="input" type="search" id="dec-search" placeholder="Tìm số QĐ, khách hàng, khóa học…" value="${esc(S.ui.decSearch || '')}" data-input="dec-search"></div>
        <select class="input" id="dec-year" style="width:auto" data-input="dec-year" aria-label="Năm"></select>
        <select class="input" id="dec-status" style="width:auto" data-input="dec-status" aria-label="Tình trạng"><option value="all">Mọi tình trạng</option>${Object.entries(DEC_STATUS).map(([k, v]) => `<option value="${k}">${esc(v.label)}</option>`).join('')}</select>
        <div class="chips" data-decgroups></div></div>
      <div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el; const y = S.ui.decYear;
    const years = uniq([todayISO().slice(0, 4), ...S.decisions.map((d) => String(decYear(d)))]).sort().reverse();
    el.querySelector('#dec-year').innerHTML = [['all', 'Mọi năm'], ...years.map((v) => [v, 'Năm ' + v])].map(([v, l]) => `<option value="${v}"${v === y ? ' selected' : ''}>${esc(l)}</option>`).join('');
    el.querySelector('#dec-status').value = S.ui.decStatus;
    const inYear = S.decisions.filter((d) => y === 'all' || String(decYear(d)) === y);
    el.querySelector('[data-decgroups]').innerHTML = [['all', 'Tất cả nhóm', inYear.length], ...Object.keys(GROUPS).map((g) => [g, 'N' + g, inYear.filter((d) => decGroup(d) === Number(g)).length])]
      .map(([v, l, n]) => `<button type="button" class="chip" data-act="dec-group" data-v="${v}" aria-pressed="${S.ui.decGroup === v}">${l}<span class="count">${n}</span></button>`).join('');
    const q = norm(S.ui.decSearch || '');
    const list = inYear.filter((d) => (S.ui.decGroup === 'all' || decGroup(d) === Number(S.ui.decGroup)) && (S.ui.decStatus === 'all' || (d.status || 'draft') === S.ui.decStatus)
      && (!q || norm([d.no, d.customerName, d.title, d.signer, d.notes].join(' ')).includes(q)))
      .sort((a, b) => decYear(b) - decYear(a) || decStt(b) - decStt(a) || (b.date || '').localeCompare(a.date || ''));
    const body = el.querySelector('[data-body]');
    const yy = y === 'all' ? Number(todayISO().slice(0, 4)) : Number(y);
    const live = inYear.filter((d) => d.status !== 'cancelled');
    const dups = decDuplicates(S.decisions.filter((d) => decYear(d) === yy));
    const gapsBy = decSeqMode() === 'year' ? [{ g: null, gaps: decGaps(yy) }] : Object.keys(GROUPS).map((g) => ({ g, gaps: decGaps(yy, g) })).filter((x) => x.gaps.length);
    const nGaps = sum(gapsBy, (x) => x.gaps.length);
    const noFile = live.filter((d) => d.status === 'signed' && !(d.files || []).length).length;
    const nextTxt = decSeqMode() === 'year' ? `${padNo(nextDecStt(yy))}` : 'theo nhóm';
    let html = `<div class="kpis">${kpi(`Quyết định ${y === 'all' ? 'tất cả các năm' : 'năm ' + y}`, live.length, `${live.filter((d) => d.status === 'signed').length} đã ký · ${inYear.filter((d) => d.status === 'cancelled').length} đã hủy`)}
      ${kpi('Học viên được công nhận', money(sum(live, (d) => d.students)), `${live.filter((d) => d.batchId).length} quyết định gắn sổ cấp thẻ/GCN`)}
      ${kpi(`Số tiếp theo năm ${yy}`, esc(nextTxt), decSeqMode() === 'year' ? 'đánh số liên tục cả 6 nhóm' : 'mỗi nhóm một dãy số riêng')}
      ${kpi('Cần kiểm tra', dups.length + nGaps + noFile, `${dups.length} trùng số · ${nGaps} số bỏ trống · ${noFile} chưa có file scan`, dups.length > 0, dups.length ? 'bad' : '')}</div>`;
    html += `<div class="panel" style="margin-bottom:14px"><div class="panel-h"><h2>Cấp số mới năm ${yy}</h2><span class="muted small">bấm để cấp số cho nhóm</span></div><div class="panel-b"><div class="chips">${Object.keys(GROUPS).map((g) => `<button type="button" class="chip edit-only" data-act="dec-new" data-v="${g}" title="${esc(GROUPS[g].desc)}">${ic('plus')} ${esc(decNo(nextDecStt(yy, g), g, yy))}</button>`).join('')}<span class="ro-only muted small">${Object.keys(GROUPS).map((g) => esc(decNo(nextDecStt(yy, g), g, yy))).join(' · ')}</span></div>
      ${dups.length || nGaps ? `<div class="small" style="margin-top:10px">${dups.map((ds) => `<div class="bad-t">Trùng số: ${esc(ds.map((d) => d.no).join(' / '))} – ${ds.length} quyết định cùng số thứ tự ${padNo(decStt(ds[0]))}</div>`).join('')}${gapsBy.filter((x) => x.gaps.length).map((x) => `<div class="warn-t">Số bị bỏ trống${x.g ? ` (nhóm ${x.g})` : ''}: ${esc(x.gaps.map(padNo).join(', '))} – kiểm tra quyết định đã ban hành nhưng chưa ghi sổ</div>`).join('')}</div>` : ''}</div></div>`;
    if (!list.length) {
      html += `<div class="panel">${emptyBox(S.decisions.length ? 'Không có quyết định phù hợp bộ lọc' : 'Chưa có quyết định nào', S.decisions.length ? '' : 'Bấm “Cấp số quyết định” để lấy số tiếp theo cho lớp vừa hoàn thành.', `<button type="button" class="btn sm cta edit-only" data-act="dec-new">${ic('plus')} Cấp số quyết định</button>`)}</div>`;
    } else {
      const dupIds = new Set(dups.flat().map((d) => d.id));
      html += `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Số quyết định</th><th>Ngày</th><th>Nhóm</th><th>Khách hàng / khóa học</th><th class="r">Học viên</th><th>Loại giấy</th><th>Người ký</th><th>Tình trạng</th><th>File</th></tr></thead><tbody>
        ${list.map((d) => { const st = DEC_STATUS[d.status || 'draft'] || DEC_STATUS.draft; return `<tr class="${d.status === 'cancelled' ? 'cancel' : ''}" data-act="dec-view" data-id="${esc(d.id)}"><td class="nowrap"><span class="strong">${esc(d.no || '—')}</span>${dupIds.has(d.id) ? ` ${pill('Trùng số', 'bad')}` : ''}</td>
          <td class="num nowrap">${esc(fmtD(d.date))}</td><td>${decGroup(d) ? `<span class="tag" title="${esc(GROUPS[decGroup(d)]?.desc || '')}">N${decGroup(d)}</span>` : '—'}</td>
          <td>${esc(d.customerName || '—')}<div class="muted small">${esc(fmtDateRange(d.courseFrom, d.courseTo))}${d.title ? ' · ' + esc(d.title) : ''}</div></td>
          <td class="r">${d.students ? money(d.students) : '—'}</td><td class="small">${esc(d.certType || decPaper(decGroup(d)))}</td><td class="small">${esc(d.signer || '')}</td>
          <td>${pill(st.label, st.tone)}</td><td>${fileButtons(d.files, 'QĐ')}</td></tr>`; }).join('')}
        </tbody><tfoot><tr><td colspan="4">${list.length} quyết định</td><td class="r">${money(sum(list.filter((d) => d.status !== 'cancelled'), (d) => d.students))}</td><td colspan="4"></td></tr></tfoot></table></div>`;
    }
    const miss = decFromRosters();
    if (miss.length) html += `<div class="panel" style="margin-top:14px"><div class="panel-h"><h2>Đối chiếu sổ cấp thẻ/GCN</h2><span class="muted small">${miss.length} số quyết định có trong sổ cấp nhưng chưa vào sổ theo dõi</span></div><div class="panel-b flush tbl-wrap"><table class="tbl"><thead><tr><th>Số quyết định</th><th>Ngày</th><th>Đợt cấp</th><th class="r">Học viên</th><th></th></tr></thead><tbody>
      ${miss.map((x) => `<tr data-act="roster-view" data-id="${esc(x.batch.id)}"><td class="strong">${esc(x.no)}</td><td class="num">${esc(fmtD(x.date))}</td><td>${esc(x.batch.r.title || x.batch.r.customerName || '')}</td><td class="r">${money(x.batch.count)}</td><td class="r"><button type="button" class="btn xs edit-only" data-act="dec-from-roster" data-id="${esc(x.batch.id)}">${ic('plus')} Đưa vào sổ</button></td></tr>`).join('')}
      </tbody></table></div></div>`;
    body.innerHTML = html; hydrate(body);
  },
};

/* ======================= CẤP SỐ / SỬA ======================= */
function decForm(existing, preset = {}) {
  if (!S.role.canEdit) return;
  const t0 = todayISO();
  const d = existing ? clone(existing) : { date: t0, status: 'draft', signer: companyInfo().director || '', files: [], groups: preset.group ? [Number(preset.group)] : [], ...preset };
  if (existing) d.groups = [decGroup(existing)].filter(Boolean);
  const batches = batchesOf();
  const classes = S.classes.filter((c) => c.status !== 'cancelled').sort((a, b) => sortClasses(b, a)).slice(0, 200);
  const m = openModal({
    title: existing ? `Sửa quyết định ${esc(d.no || '')}` : 'Cấp số quyết định hoàn thành khóa học', sub: `Số dạng ${esc(decFmt())} · ${decSeqMode() === 'year' ? 'đánh số liên tục cả 6 nhóm trong năm' : 'mỗi nhóm một dãy số riêng trong năm'} (đổi trong Cài đặt)`, size: 'wide',
    body: `<form id="df" novalidate autocomplete="off"><div class="stack">
      <fieldset class="sec"><legend>Khóa học</legend><div class="fgrid">
        ${f('df-class', 'Lớp trong lịch giảng dạy', `<select class="input" id="df-class"><option value="">— Không gắn lớp —</option>${classes.map((c) => opt(c.id, `${fmtDateRange(c.startDate, c.endDate)} · ${classLabel(c)} · ${groupsText(c.groups) || 'chưa chọn nhóm'}`, c.id === d.classId)).join('')}</select>`, { cls: 'span2', hint: 'Chọn lớp để tự điền khách hàng, ngày học, số học viên, nhóm' })}
        ${f('df-batch', 'Đợt cấp thẻ/GCN (sổ cấp)', `<select class="input" id="df-batch"><option value="">— Không gắn sổ cấp —</option>${batches.map((b) => opt(b.id, `${b.r.title || b.r.customerName || 'Đợt cấp'} · ${b.count} HV${b.r.decisionNo ? ' · QĐ ' + b.r.decisionNo : ''}`, b.id === d.batchId)).join('')}</select>`, { hint: 'Học viên của đợt sẽ hiện số quyết định này' })}
        ${f('df-customer', 'Khách hàng', inp('df-customer', d.customerName, 'list="df-cust" placeholder="Tên doanh nghiệp được huấn luyện"') + custList('df-cust'), { cls: 'span2' })}
        ${f('df-from', 'Khóa học từ ngày', inp('df-from', d.courseFrom, 'type="date"'))}${f('df-to', 'đến ngày', inp('df-to', d.courseTo, 'type="date"'))}
        ${f('df-students', 'Số học viên được công nhận', inp('df-students', d.students, 'type="number" min="0" placeholder="Số HV đạt"'))}
      </div></fieldset>
      <fieldset class="sec"><legend>Số quyết định</legend><div class="fgrid">
        <div class="f full"><span class="lbl">Nhóm huấn luyện${existing ? '' : ' – chọn nhiều nhóm để cấp nhiều số liên tiếp (mỗi nhóm một quyết định)'}</span><div class="checks" data-groups>${Object.entries(GROUPS).map(([g, v]) => `<label title="${esc(v.desc)}"><input type="${existing ? 'radio' : 'checkbox'}" name="df-group" value="${g}"${(d.groups || []).includes(Number(g)) ? ' checked' : ''}> Nhóm ${g} <span class="muted small">(${esc(v.paper)})</span></label>`).join('')}</div></div>
        ${f('df-date', 'Ngày quyết định', inp('df-date', d.date, 'type="date"'))}
        <div class="f span2"><label for="df-no">Số quyết định</label><input class="input" id="df-no" value="${esc(d.no || '')}" placeholder="Chọn nhóm để lấy số"><span class="hint" data-nohint></span></div>
        ${f('df-title', 'Trích yếu', inp('df-title', d.title, 'placeholder="VD: Công nhận hoàn thành khóa huấn luyện ATVSLĐ"'), { cls: 'span2' })}
        ${f('df-signer', 'Người ký', inp('df-signer', d.signer, 'placeholder="Họ tên người ký quyết định"'))}
        ${f('df-status', 'Tình trạng', `<select class="input" id="df-status">${Object.entries(DEC_STATUS).map(([k, v]) => opt(k, v.label, (d.status || 'draft') === k)).join('')}</select>`)}
        <div class="f full"><span class="lbl">File quyết định (scan PDF/ảnh)</span><div data-files></div></div>
        ${f('df-notes', 'Ghi chú', `<textarea class="input" id="df-notes" rows="2" placeholder="Ghi chú">${esc(d.notes || '')}</textarea>`, { cls: 'full' })}
      </div></fieldset></div></form>`,
    foot: `${existing ? `<button type="button" class="btn danger" data-del>${ic('trash')} Xóa</button>` : ''}<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} ${existing ? 'Lưu quyết định' : 'Cấp số'}</button>`,
  });
  const root = m.el;
  const files = mountFileField(root.querySelector('[data-files]'), d.files || [], { accept: '.pdf,image/*', hint: 'PDF hoặc ảnh quyết định đã ký' });
  let manualNo = !!existing;
  const groups = () => checkedVals(root, 'df-group').map(Number).sort();
  function plan() {
    const date = val(root, 'df-date') || t0; const y = Number(date.slice(0, 4)); const gs = groups();
    if (!gs.length) return { y, items: [] };
    if (existing || gs.length === 1) {
      const g = gs[0];
      const stt = manualNo ? parseDocNo(decFmt(), val(root, 'df-no'))?.stt || null : nextDecStt(y, g, existing ? [existing.id] : []);
      return { y, items: [{ g, stt, no: manualNo ? val(root, 'df-no') : decNo(stt, g, y) }] };
    }
    // nhiều nhóm: số liên tiếp
    const items = []; const temp = [];
    for (const g of gs) {
      let stt = nextDecStt(y, g);
      if (decSeqMode() === 'year') stt += items.length; else stt += temp.filter((x) => x === g).length;
      temp.push(g); items.push({ g, stt, no: decNo(stt, g, y) });
    }
    return { y, items };
  }
  function refreshNo() {
    const p = plan(); const hint = root.querySelector('[data-nohint]'); const noEl = root.querySelector('#df-no');
    if (!p.items.length) { hint.textContent = 'Chọn nhóm huấn luyện để công cụ cấp số.'; return; }
    if (p.items.length > 1) { noEl.value = p.items.map((x) => x.no).join(' · '); noEl.disabled = true; hint.innerHTML = `Sẽ cấp ${p.items.length} quyết định: ${esc(p.items.map((x) => x.no).join(', '))}`; return; }
    noEl.disabled = false; if (!manualNo) noEl.value = p.items[0].no;
    const it = p.items[0]; const clash = decClash(noEl.value, it.stt, it.g, p.y, existing?.id);
    const used = decUsed(p.y, it.g, existing ? [existing.id] : []);
    const auto = manualNo ? ' · <a href="#" data-autono>dùng số tự động</a>' : '';
    hint.innerHTML = clash ? `<span class="bad-t">Trùng với quyết định ${esc(clash.no)} (${esc(clash.customerName || fmtD(clash.date))}) – chọn số khác.</span>${auto}`
      : `Năm ${p.y}${decSeqMode() === 'group' ? `, nhóm ${it.g}` : ''}: ${used.length ? `đã dùng ${esc(used.slice(-8).map(padNo).join(', '))}` : 'chưa có số nào'} · số tiếp theo ${padNo(nextDecStt(p.y, it.g, existing ? [existing.id] : []))}${auto}`;
  }
  function fillFromClass() {
    const c = klass(val(root, 'df-class')); if (!c) return;
    const set = (id, v) => { const e = root.querySelector('#' + id); if (e && v !== undefined && v !== null && v !== '') e.value = v; };
    set('df-customer', classLabel(c)); set('df-from', c.startDate); set('df-to', c.endDate || c.startDate);
    set('df-students', c.passed || c.students);
    if (!existing && !groups().length && (c.groups || []).length) { root.querySelectorAll('input[name=df-group]').forEach((i) => (i.checked = c.groups.map(Number).includes(Number(i.value)))); }
    if (!val(root, 'df-date') || val(root, 'df-date') === t0) set('df-date', c.endDate && c.endDate > t0 ? c.endDate : t0);
    const b = batches.find((x) => x.parts.some((r) => r.classId === c.id)); if (b && !val(root, 'df-batch')) root.querySelector('#df-batch').value = b.id;
  }
  function fillFromBatch() {
    const b = batches.find((x) => x.id === val(root, 'df-batch')); if (!b) return; const r = b.r;
    const set = (id, v) => { const e = root.querySelector('#' + id); if (e && v) e.value = v; };
    set('df-customer', r.customerName); set('df-from', r.courseFrom); set('df-to', r.courseTo);
    const gs = groups(); const sts = allStudents().filter((x) => (x.r.batchId || x.r.id) === b.id);
    const cnt = gs.length === 1 ? sts.filter((x) => !x.v.group || x.v.group === gs[0]).length : sts.length;
    set('df-students', cnt);
    if (r.classId && !val(root, 'df-class')) root.querySelector('#df-class').value = r.classId;
    if (!existing && !gs.length) { const bg = uniq(sts.map((x) => x.v.group).filter(Boolean)); root.querySelectorAll('input[name=df-group]').forEach((i) => (i.checked = bg.includes(Number(i.value)))); }
    if (r.decisionNo && !existing && !manualNo && groups().length <= 1) { root.querySelector('#df-no').value = r.decisionNo; manualNo = true; set('df-date', r.decisionDate || r.issueDate); }
  }
  root.querySelector('#df-class').addEventListener('change', () => { fillFromClass(); refreshNo(); });
  root.querySelector('#df-batch').addEventListener('change', () => { fillFromBatch(); refreshNo(); });
  root.querySelector('[data-groups]').addEventListener('change', () => { if (!existing) manualNo = false; refreshNo(); });
  root.querySelector('#df-date').addEventListener('change', () => { if (!existing) manualNo = false; refreshNo(); });
  root.querySelector('#df-no').addEventListener('input', () => { manualNo = true; refreshNo(); });
  root.addEventListener('click', (e) => { if (e.target.closest('[data-autono]')) { e.preventDefault(); manualNo = false; refreshNo(); } });
  if (!existing && preset.classId) fillFromClass();
  if (!existing && preset.batchId) fillFromBatch();
  refreshNo();
  const read = () => ({ classId: val(root, 'df-class') || null, batchId: val(root, 'df-batch') || null, customerName: val(root, 'df-customer'), courseFrom: val(root, 'df-from'), courseTo: val(root, 'df-to'), students: Number(val(root, 'df-students')) || 0, date: val(root, 'df-date'), title: val(root, 'df-title'), signer: val(root, 'df-signer'), status: val(root, 'df-status'), notes: val(root, 'df-notes'), no: val(root, 'df-no'), groups: groups() });
  const snap = JSON.stringify(read());
  m.guard = formGuard(() => JSON.stringify(read()) !== snap || files.dirty(), [files]);
  root.querySelector('[data-cancel]').onclick = () => m.tryClose();
  root.querySelector('[data-del]')?.addEventListener('click', async () => { if (await deleteDecision(existing)) { m.guard = null; m.close(); } });
  root.querySelector('[data-save]').onclick = async (ev) => {
    const x = read(); const p = plan();
    if (!p.items.length) { toast('Chọn nhóm huấn luyện.', 'bad'); return; }
    if (!x.date) { toast('Chọn ngày quyết định.', 'bad'); return; }
    if (p.items.length === 1 && !x.no) { toast('Nhập số quyết định.', 'bad'); return; }
    for (const it of p.items) {
      const no = p.items.length === 1 ? x.no : it.no;
      const clash = decClash(no, it.stt, it.g, p.y, existing?.id);
      if (clash) { toast(`Số ${no} trùng với quyết định ${clash.no} – chọn số khác.`, 'bad'); return; }
    }
    ev.target.disabled = true;
    try {
      const cu = x.customerName ? await ensureCustomer(x.customerName) : null;
      const c = x.classId ? klass(x.classId) : null; const b = x.batchId ? batches.find((bb) => bb.id === x.batchId) : null;
      const saved = [];
      for (const it of p.items) {
        const no = p.items.length === 1 ? x.no : it.no;
        const parsed = parseDocNo(decFmt(), no);
        const rec = { ...(existing || {}), ...x, no, stt: parsed?.stt || it.stt || null, group: it.g, year: p.y, certType: decPaper(it.g), customerId: cu?.id || existing?.customerId || null, quoteId: c?.quoteId || b?.r?.quoteId || existing?.quoteId || null, files: p.items.length === 1 ? files.value() : [] };
        delete rec.groups;
        if (p.items.length > 1 && b) rec.students = allStudents().filter((s2) => (s2.r.batchId || s2.r.id) === b.id && (!s2.v.group || s2.v.group === it.g)).length || x.students;
        if (!rec.title) rec.title = `Công nhận hoàn thành khóa huấn luyện ATVSLĐ nhóm ${it.g}`;
        saved.push(await Store.save('decisions', rec, `QĐ ${no}${x.customerName ? ' – ' + x.customerName : ''}`, existing ? 'Cập nhật' : 'Cấp số'));
      }
      files.commit();
      // ghi số QĐ vào sổ cấp khi đợt chỉ có một nhóm (đợt nhiều nhóm: học viên tự nhận QĐ theo nhóm)
      if (b && saved.length === 1) {
        const bg = uniq(allStudents().filter((s2) => (s2.r.batchId || s2.r.id) === b.id).map((s2) => s2.v.group).filter(Boolean));
        const one = saved[0];
        if (bg.length <= 1 && b.parts.some((r) => r.decisionNo !== one.no || (r.decisionDate || '') !== one.date)) {
          const diff = b.parts.find((r) => r.decisionNo && norm(r.decisionNo) !== norm(one.no));
          if (!diff || (await confirmBox(`Sổ cấp đang ghi số quyết định <b>${esc(diff.decisionNo)}</b>. Đổi thành <b>${esc(one.no)}</b>?`, { ok: 'Đổi số trong sổ cấp' }))) {
            for (const r of b.parts) await Store.save('rosters', { ...r, decisionNo: one.no, decisionDate: one.date });
          }
        }
      }
      m.guard = null; m.close();
      toast(saved.length > 1 ? `Đã cấp ${saved.length} số: ${saved.map((s2) => s2.no).join(', ')}` : `Đã ${existing ? 'lưu' : 'cấp số'} ${saved[0].no}.`, 'ok');
      if (saved.length === 1) decDetail(saved[0].id, saved[0]);
    } catch (e) { console.error(e); ev.target.disabled = false; }
  };
}

async function deleteDecision(d) {
  if (!d) return false;
  if (!(await confirmBox(`Xóa quyết định <b>${esc(d.no)}</b> khỏi sổ theo dõi?<br>Số này sẽ thành <b>số bỏ trống</b>. Nếu quyết định đã ban hành rồi hủy, nên chọn tình trạng “Đã hủy” để giữ số trong sổ.`, { ok: 'Xóa quyết định', danger: true }))) return false;
  try { await Store.remove('decisions', d, `QĐ ${d.no}`); (d.files || []).forEach((f2) => Store.backend.delFile(f2)); toast('Đã xóa quyết định.', 'ok'); return true; } catch (e) { return false; }
}

function decDetail(id, fallback = null) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; let seen = false; render();
  function render() {
    let d = decision(id); if (d) seen = true; else if (!seen) d = fallback;
    if (!d) { m.close(); return; }
    const st = DEC_STATUS[d.status || 'draft'] || DEC_STATUS.draft; const g = decGroup(d);
    const c = d.classId && klass(d.classId); const q = d.quoteId && quote(d.quoteId); const cu = d.customerId && customer(d.customerId);
    const sts = decStudentsOf(d);
    const dup = S.decisions.filter((x) => x.id !== d.id && decYear(x) === decYear(d) && decKey(x) === decKey(d));
    m.el.querySelector('.modal-h h2').textContent = `Quyết định ${d.no || ''}`;
    m.body.innerHTML = `<div style="display:flex;gap:6px;flex-wrap:wrap">${pill(st.label, st.tone)}${g ? pill(`Nhóm ${g} – ${GROUPS[g]?.desc || ''}`, 'muted') : ''}${dup.length ? pill(`Trùng số với ${dup.map((x) => x.no).join(', ')}`, 'bad') : ''}</div>
      <dl class="dl"><div><dt>Ngày quyết định</dt><dd>${d.date ? esc(fmtD(d.date)) : notSet()}</dd></div><div><dt>Người ký</dt><dd>${d.signer ? esc(d.signer) : notSet()}</dd></div>
        <div class="full"><dt>Trích yếu</dt><dd>${d.title ? esc(d.title) : notSet()}</dd></div>
        <div><dt>Khách hàng</dt><dd>${cu ? `<a href="#" data-act="customer-view" data-id="${esc(cu.id)}">${esc(d.customerName || cu.name)}</a>` : esc(d.customerName || '—')}</dd></div>
        <div><dt>Khóa học</dt><dd>${esc(fmtDateRange(d.courseFrom, d.courseTo) || '—')}</dd></div><div><dt>Học viên được công nhận</dt><dd>${d.students ? money(d.students) : notSet()}</dd></div><div><dt>Loại giấy cấp</dt><dd>${esc(d.certType || decPaper(g) || '—')}</dd></div>
        ${d.notes ? `<div class="full"><dt>Ghi chú</dt><dd style="white-space:pre-wrap">${esc(d.notes)}</dd></div>` : ''}</dl>
      <div class="grid-2"><div><div class="sec-title">Lớp học &amp; hợp đồng</div>${c ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${classLi(c)}</ul>` : '<div class="muted small">Chưa gắn lớp trong lịch.</div>'}${q ? `<div style="margin-top:8px"><button type="button" class="btn sm" data-act="quote-view" data-id="${esc(q.id)}">${ic('sign')} ${esc(isContract(q) ? 'Hợp đồng ' + (q.contractNo || q.no || '') : 'Báo giá ' + (q.no || ''))}</button></div>` : ''}</div>
        <div><div class="sec-title">File quyết định</div>${filesBlock(d.files, 'Chưa tải file quyết định')}</div></div>
      <div><div class="sec-title">Học viên theo quyết định${d.batchId ? ` <a href="#" class="small" data-act="roster-view" data-id="${esc(d.batchId)}">– xem đợt cấp</a>` : ''}</div>${sts.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th>#</th><th>Họ và tên</th><th>Số thẻ/GCN</th><th>Ngày cấp</th><th>Hạn</th></tr></thead><tbody>${sts.slice(0, 60).map((x, i) => `<tr data-act="student-view" data-id="${esc(x.r.id)}" data-key="${esc(x.s.k || x.i)}"><td>${i + 1}</td><td>${esc(x.v.name)}</td><td>${esc(x.v.certNo)}</td><td class="num">${esc(fmtD(x.v.issueDate))}</td><td class="num">${esc(fmtD(x.v.expiry))}</td></tr>`).join('')}</tbody></table></div>${sts.length > 60 ? `<div class="muted small">… và ${sts.length - 60} học viên khác</div>` : ''}` : '<div class="muted small">Chưa gắn đợt cấp thẻ/GCN – chọn “Đợt cấp” khi sửa quyết định để xem danh sách học viên.</div>'}</div>`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(d)}<span class="sp"></span><span class="edit-only" style="display:flex;gap:8px;flex-wrap:wrap"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa</button>${d.status === 'cancelled' ? '<button type="button" class="btn" data-x="restore">Khôi phục</button>' : '<button type="button" class="btn" data-x="cancel">Hủy quyết định</button>'}<button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa</button></span>`;
    const on = (k, fn) => m.foot.querySelector(`[data-x=${k}]`)?.addEventListener('click', fn);
    on('del', async () => { if (await deleteDecision(d)) m.close(); });
    on('edit', () => { m.close(); decForm(decision(id) || d); });
    on('cancel', async () => { if (await confirmBox(`Hủy quyết định <b>${esc(d.no)}</b>? Số vẫn giữ trong sổ (không bị bỏ trống).`, { ok: 'Hủy quyết định', danger: true })) await Store.save('decisions', { ...d, status: 'cancelled' }, `QĐ ${d.no}`, 'Hủy'); });
    on('restore', async () => { await Store.save('decisions', { ...d, status: (d.files || []).length ? 'signed' : 'draft' }, `QĐ ${d.no}`, 'Khôi phục'); });
    hydrate(m.el); fillNames(m.el);
  }
}

/* ---------- cảnh báo cho Tổng quan ---------- */
function decisionAlerts() {
  const out = []; if (!S.decisions.length) return out;
  const y = Number(todayISO().slice(0, 4));
  for (const ds of decDuplicates(S.decisions.filter((d) => decYear(d) >= y - 1))) out.push({ sev: 'bad', text: `Trùng số quyết định: ${ds.map((d) => d.no).join(' / ')} (năm ${decYear(ds[0])})`, act: 'dec-view', id: ds[0].id });
  const groups = decSeqMode() === 'year' ? [null] : Object.keys(GROUPS);
  for (const g of groups) { const gaps = decGaps(y, g); if (gaps.length) out.push({ sev: 'info', text: `Số quyết định năm ${y}${g ? ` nhóm ${g}` : ''} bị bỏ trống: ${gaps.map(padNo).join(', ')} – kiểm tra quyết định chưa ghi sổ`, act: 'goto-decisions', id: '' }); }
  const miss = decFromRosters(); if (miss.length) out.push({ sev: 'info', text: `${miss.length} số quyết định trong sổ cấp thẻ/GCN chưa có trong sổ theo dõi quyết định (${miss.slice(0, 3).map((x) => x.no).join(', ')}${miss.length > 3 ? '…' : ''})`, act: 'goto-decisions', id: '' });
  return out;
}
