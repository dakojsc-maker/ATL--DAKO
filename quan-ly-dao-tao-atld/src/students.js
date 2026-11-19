/* ============================================================
   HỌC VIÊN – sổ cấp thẻ/GCN: tìm theo công ty, tên, số thẻ/GCN; xem hình thẻ/GCN, quyết định cấp, khóa học.
   Dữ liệu: collection "rosters", mỗi tài liệu là một đợt cấp (hoặc một phần của đợt lớn) chứa mảng students.
   ============================================================ */

const ST_PAGE = 100;
const ROSTER_PART_MAX = 150;
const studentKeyOfCompany = (v) => (v.customerId ? 'cid:' + v.customerId : 'name:' + norm(v.company));

function studentFilter() {
  const q = norm(S.ui.stSearch || ''); const co = S.ui.stCompany || ''; const g = S.ui.stGroup || ''; const ty = S.ui.stType || ''; const stt = S.ui.stStatus || ''; const yr = S.ui.stYear || '';
  return allStudents().filter((x) => {
    const v = x.v;
    if (co && studentKeyOfCompany(v) !== co) return false;
    if (g && String(v.group) !== g) return false;
    if (ty && v.certType !== ty) return false;
    if (yr && !(v.issueDate || '').startsWith(yr)) return false;
    if (stt && certStatus(v.expiry).key !== stt) return false;
    if (q && !norm([v.name, v.certNo, v.cccd, v.company, x.s.position, x.r.decisionNo].join(' ')).includes(q)) return false;
    return true;
  });
}
function batchesOf(list) {
  const map = new Map();
  for (const r of S.rosters) {
    const id = r.batchId || r.id;
    const b = map.get(id) || { id, parts: [], count: 0 };
    b.parts.push(r); b.count += rosterCount(r); map.set(id, b);
  }
  const out = Array.from(map.values());
  out.forEach((b) => { b.parts.sort((a, c) => (a.part || 1) - (c.part || 1)); b.r = b.parts[0]; });
  return out.sort((a, b) => (b.r.issueDate || b.r.courseTo || '').localeCompare(a.r.issueDate || a.r.courseTo || ''));
}

const StudentsView = {
  mount(el) {
    S.ui.stView = S.ui.stView || 'students'; S.ui.stPage = 0;
    el.innerHTML = `<div class="page-head"><div><h1>Danh sách học viên</h1><div class="sub">Học viên đã huấn luyện, số thẻ/GCN, hạn hiệu lực, quyết định cấp và hình thẻ/GCN – tìm theo công ty, tên hoặc số thẻ/GCN</div></div>
      <div class="actions"><div class="seg" data-stview></div>${exportBtn('hoc-vien')}<button type="button" class="btn cta edit-only" data-act="roster-new">${ic('plus')} Thêm đợt cấp</button></div></div>
      <div class="toolbar"><div class="search" style="max-width:420px">${ic('search')}<input class="input" type="search" id="st-search" placeholder="Tìm tên học viên, số thẻ/GCN, CCCD, công ty…" value="${esc(S.ui.stSearch || '')}" data-input="st-search"></div>
        <select class="input" id="st-company" style="width:auto;max-width:280px" data-input="st-company" aria-label="Công ty"></select>
        <select class="input" id="st-group" style="width:auto" data-input="st-group" aria-label="Nhóm"><option value="">Mọi nhóm</option>${Object.keys(GROUPS).map((g) => `<option value="${g}">Nhóm ${g}</option>`).join('')}</select>
        <select class="input" id="st-type" style="width:auto" data-input="st-type" aria-label="Loại giấy"><option value="">Mọi loại giấy</option>${CERT_TYPES.map((t) => `<option>${esc(t)}</option>`).join('')}</select>
        <select class="input" id="st-status" style="width:auto" data-input="st-status" aria-label="Tình trạng hạn"><option value="">Mọi tình trạng</option><option value="valid">Còn hạn</option><option value="soon">Sắp hết hạn</option><option value="expired">Hết hạn</option><option value="none">Không ghi hạn</option></select>
        <select class="input" id="st-year" style="width:auto" data-input="st-year" aria-label="Năm cấp"></select></div>
      <div data-kpi></div><div data-body></div>`;
    this.el = el; this.update();
  },
  update() {
    const el = this.el; const all = allStudents();
    el.querySelector('[data-stview]').innerHTML = `<button type="button" data-act="st-view" data-v="students" aria-pressed="${S.ui.stView === 'students'}">${ic('users')}Học viên</button><button type="button" data-act="st-view" data-v="batches" aria-pressed="${S.ui.stView === 'batches'}">${ic('list')}Đợt cấp</button>`;
    const cos = new Map(); for (const x of all) { const k = studentKeyOfCompany(x.v); if (!cos.has(k)) cos.set(k, { k, name: x.v.company || '(chưa ghi công ty)', n: 0 }); cos.get(k).n++; }
    el.querySelector('#st-company').innerHTML = `<option value="">Mọi công ty (${cos.size})</option>${Array.from(cos.values()).sort((a, b) => a.name.localeCompare(b.name, 'vi')).map((c) => `<option value="${esc(c.k)}"${S.ui.stCompany === c.k ? ' selected' : ''}>${esc(c.name)} (${c.n})</option>`).join('')}`;
    const years = uniq(all.map((x) => (x.v.issueDate || '').slice(0, 4)).filter(Boolean)).sort().reverse();
    el.querySelector('#st-year').innerHTML = `<option value="">Mọi năm cấp</option>${years.map((y) => `<option value="${y}"${S.ui.stYear === y ? ' selected' : ''}>Năm ${y}</option>`).join('')}`;
    ['stGroup:st-group', 'stType:st-type', 'stStatus:st-status'].forEach((p) => { const [k, id] = p.split(':'); el.querySelector('#' + id).value = S.ui[k] || ''; });
    const list = studentFilter();
    const soon = all.filter((x) => certStatus(x.v.expiry).key === 'soon').length; const exp = all.filter((x) => certStatus(x.v.expiry).key === 'expired').length;
    el.querySelector('[data-kpi]').innerHTML = `<div class="kpis">${kpi('Học viên', money(all.length), list.length !== all.length ? `Đang lọc: ${money(list.length)}` : 'Toàn bộ sổ cấp')}${kpi('Đợt cấp', `${batchesOf().length}`, `${cos.size} công ty`)}
      ${kpi('Sắp hết hạn', `${soon}`, `Trong ${Number(settings().warnDays) || 60} ngày tới`, soon > 0)}${kpi('Đã hết hạn', `${exp}`, 'Cơ hội huấn luyện định kỳ')}</div>`;
    const body = el.querySelector('[data-body]');
    if (!all.length) { body.innerHTML = `<div class="panel">${emptyBox('Chưa có học viên', 'Gửi file Excel sổ cấp thẻ/GCN cho Claude để nhập tự động, hoặc bấm “Thêm đợt cấp” để nhập tay.', `<button type="button" class="btn sm cta edit-only" data-act="roster-new">${ic('plus')} Thêm đợt cấp</button>`)}</div>`; return; }
    if (S.ui.stView === 'batches') { body.innerHTML = this.batchesHTML(list); return; }
    const pages = Math.max(1, Math.ceil(list.length / ST_PAGE)); S.ui.stPage = Math.min(S.ui.stPage || 0, pages - 1);
    const from = S.ui.stPage * ST_PAGE; const rows = list.slice(from, from + ST_PAGE);
    if (!rows.length) { body.innerHTML = `<div class="panel">${emptyBox('Không có học viên phù hợp bộ lọc')}</div>`; return; }
    body.innerHTML = `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th class="r">#</th><th>Họ và tên</th><th>CCCD</th><th>Công ty</th><th>Nhóm</th><th>Loại giấy</th><th>Số thẻ/GCN</th><th>Ngày cấp</th><th>Hiệu lực đến</th><th>Tình trạng</th><th>Hồ sơ</th></tr></thead><tbody>
      ${rows.map((x, i) => { const v = x.v; const st = certStatus(v.expiry); const card = studentFiles(x.s, ['the']).length; const qd = (x.r.decisionFiles || []).length;
        return `<tr data-act="student-view" data-id="${esc(x.r.id)}" data-key="${esc(x.s.k)}"><td class="r muted">${from + i + 1}</td><td><span class="strong">${esc(v.name)}</span>${v.dob ? `<div class="muted small">${esc(v.dob)}</div>` : ''}</td><td class="num small">${esc(v.cccd) || '<span class="muted">—</span>'}</td>
          <td class="small">${esc(v.company)}</td><td>${v.group ? 'N' + v.group : '—'}</td><td class="small nw">${esc(v.certType)}</td><td class="nowrap strong num">${esc(v.certNo) || '<span class="muted small">chưa có số</span>'}</td>
          <td class="nowrap num">${esc(fmtD(v.issueDate))}</td><td class="nowrap num">${esc(fmtD(v.expiry))}${v.expiryAuto ? '<span class="muted small" title="Tự tính theo hiệu lực của nhóm"> *</span>' : ''}</td><td>${pill(st.label, st.tone)}</td>
          <td class="nowrap small">${card ? `<span class="tag" title="Có hình thẻ/GCN">${ic('idcard', 'ti')} ${card}</span>` : ''}${qd ? ` <span class="tag" title="Có quyết định cấp">QĐ</span>` : ''}${!card && !qd ? '<span class="muted">—</span>' : ''}</td></tr>`; }).join('')}
      </tbody></table></div>
      <div class="pager"><span class="muted small">Hiển thị ${money(from + 1)}–${money(from + rows.length)} / ${money(list.length)} học viên · <span title="Hạn tự tính khi sổ cấp không ghi hạn">* hạn tự tính</span></span>
        <span class="grow"></span><button type="button" class="btn sm" data-act="st-page" data-v="-1"${S.ui.stPage <= 0 ? ' disabled' : ''}>${ic('left')} Trước</button><span class="small">Trang ${S.ui.stPage + 1}/${pages}</span><button type="button" class="btn sm" data-act="st-page" data-v="1"${S.ui.stPage >= pages - 1 ? ' disabled' : ''}>Sau ${ic('right')}</button></div>`;
  },
  batchesHTML(list) {
    const keys = new Set(list.map((x) => x.r.batchId || x.r.id));
    const bs = batchesOf().filter((b) => keys.has(b.id));
    if (!bs.length) return `<div class="panel">${emptyBox('Không có đợt cấp phù hợp bộ lọc')}</div>`;
    return `<div class="panel tbl-wrap"><table class="tbl"><thead><tr><th>Đợt cấp</th><th>Công ty</th><th>Nhóm</th><th>Loại giấy</th><th>Khóa học</th><th>Ngày cấp</th><th>Quyết định</th><th class="r">Học viên</th><th>Hồ sơ</th></tr></thead><tbody>
      ${bs.map((b) => { const r = b.r; const dfiles = b.parts.flatMap((p) => p.decisionFiles || []); const ofiles = b.parts.flatMap((p) => p.files || []);
        return `<tr data-act="roster-view" data-id="${esc(b.id)}"><td><span class="strong">${esc(r.title || 'Đợt cấp')}</span>${b.parts.length > 1 ? `<div class="muted small">${b.parts.length} phần</div>` : ''}</td><td class="small">${esc(r.customerName || '')}</td><td>${esc(groupsShort(r.groups)) || '—'}</td><td class="small">${esc(r.certType || '')}</td>
          <td class="nowrap num small">${esc(fmtDateRange(r.courseFrom, r.courseTo))}</td><td class="nowrap num">${esc(fmtD(r.issueDate))}</td><td class="small">${esc(r.decisionNo || '')}${r.decisionDate ? ` · ${esc(fmtD(r.decisionDate))}` : ''}</td><td class="r strong">${money(b.count)}</td>
          <td><div class="cell-files">${fileButtons(dfiles, 'QĐ')}${ofiles.length ? fileButtons(ofiles, 'Hồ sơ') : ''}</div></td></tr>`; }).join('')}
      </tbody></table></div>`;
  },
};

/* ---------- chi tiết học viên ---------- */
function studentDetail(rid, key) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; render();
  function render() {
    const r = roster(rid); const s = r && (r.students || []).find((x) => x.k === key);
    if (!r || !s) { m.close(); return; }
    const v = studentView(s, r); const st = certStatus(v.expiry);
    const cards = studentFiles(s, ['the']); const photos = studentFiles(s, ['anh']); const others = studentFiles(s, ['qd', 'khac']);
    const cls = r.classId && klass(r.classId); const q = r.quoteId && quote(r.quoteId); const cu = r.customerId && customer(r.customerId);
    const imgs = cards.filter((f) => fileKind(f) === 'img'); const nonImg = cards.filter((f) => fileKind(f) !== 'img');
    const dd = (label, val, hint = 'Chưa có trong sổ cấp – bấm Sửa để nhập') => `<div><dt>${label}</dt><dd>${val || `<span class="muted" title="${esc(hint)}">Chưa nhập</span>`}</dd></div>`;
    m.el.querySelector('.modal-h h2').textContent = v.name || 'Học viên';
    m.body.innerHTML = `<div class="detail-top">${photos[0] ? `<span class="photo lg"><img data-file="${esc(photos[0].id)}" alt="Ảnh ${esc(v.name)}"></span>` : `<span class="photo lg" aria-hidden="true">${esc(initials(v.name))}</span>`}
      <div class="grow" style="min-width:240px;display:flex;flex-direction:column;gap:10px"><div style="display:flex;gap:6px;flex-wrap:wrap">${pill(v.certType || 'Chưa rõ loại giấy', 'info')}${v.certNo ? pill('Số ' + v.certNo, 'muted') : ''}${pill(st.label, st.tone)}${v.group ? pill('Nhóm ' + v.group, 'muted') : ''}</div>
      <dl class="dl">${dd('Ngày sinh', esc(v.dob))}${dd('Giới tính', esc(s.gender))}${dd('Quốc tịch', esc(s.nationality))}${dd('Số CCCD', esc(v.cccd))}${dd('Chức vụ / công việc', esc(s.position))}
        ${dd('Đơn vị', cu ? `<a href="#" data-act="customer-view" data-id="${esc(cu.id)}">${esc(v.company)}</a>` : esc(v.company))}</dl></div></div>
      <div><div class="sec-title">Thẻ / Giấy chứng nhận</div><dl class="dl">${dd('Số thẻ/GCN', esc(v.certNo))}${dd('Ngày cấp', esc(fmtD(v.issueDate)))}${dd('Hiệu lực đến', v.expiry ? esc(fmtD(v.expiry)) + (v.expiryAuto ? ' <span class="muted small">(tự tính)</span>' : '') : '')}
        ${dd('Nhóm huấn luyện', v.group ? `Nhóm ${v.group} – ${esc(GROUPS[v.group]?.desc || '')}` : '')}${dd('Nội dung huấn luyện', esc(v.content))}${dd('Thời gian học', esc(fmtDateRange(v.from, v.to)) + (v.hours ? ` · ${esc(v.hours)} giờ` : ''))}${dd('Kết quả', esc(s.result))}
        ${s.notes ? `<div class="full"><dt>Ghi chú</dt><dd style="white-space:pre-wrap">${esc(s.notes)}</dd></div>` : ''}</dl></div>
      <div><div class="sec-title">Hình thẻ / GCN</div>${imgs.length ? `<div class="gallery">${imgs.map((f) => `<button type="button" class="shot" data-act="file-view" data-fid="${esc(f.id)}" title="${esc(f.name)}"><img data-file="${esc(f.id)}" alt="${esc(f.name)}"></button>`).join('')}</div>` : ''}${nonImg.length ? filesBlock(nonImg) : ''}${!cards.length ? '<div class="muted small">Chưa có hình thẻ/GCN – gửi file cho Claude để đối chiếu và gắn đúng học viên.</div>' : ''}</div>
      <div><div class="sec-title">Quyết định cấp &amp; hồ sơ đợt</div><dl class="dl" style="margin-bottom:8px">${dd('Đợt cấp', `<a href="#" data-act="roster-view" data-id="${esc(r.batchId || r.id)}">${esc(r.title || 'Đợt cấp')}</a>`)}${dd('Số quyết định', esc(r.decisionNo) + (r.decisionDate ? ' · ' + esc(fmtD(r.decisionDate)) : ''))}</dl>
        ${filesBlock([...(r.decisionFiles || []), ...others], 'Chưa có quyết định cấp')}</div>
      <div><div class="sec-title">Khóa học</div>${cls ? `<ul class="list" style="border:1px solid var(--line);border-radius:10px">${classLi(cls)}</ul>` : '<div class="muted small">Chưa gắn với lớp trong lịch giảng dạy.</div>'}
        ${q ? `<div style="margin-top:8px"><button type="button" class="btn sm" data-act="quote-view" data-id="${esc(q.id)}">${ic('sign')} ${esc(isContract(q) ? 'Hợp đồng ' + (q.contractNo || q.no || '') : 'Báo giá ' + (q.no || ''))}</button></div>` : ''}</div>`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(r)}<span class="sp"></span><span class="edit-only" style="display:flex;gap:8px"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa học viên</button><button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa</button></span>`;
    m.foot.querySelector('[data-x=del]').onclick = async () => { if (await deleteStudent(r, s)) m.close(); };
    m.foot.querySelector('[data-x=edit]').onclick = () => { m.close(); studentForm(r, s); };
    hydrate(m.el); fillNames(m.el);
  }
}

async function saveRoster(doc, label, action) {
  const size = JSON.stringify(doc).length;
  if (size > 240000) { toast('Đợt cấp quá lớn để lưu trong một phần – hãy tạo đợt cấp mới cho các học viên tiếp theo.', 'bad'); throw new Error('too_big'); }
  STUDENT_CACHE.src = null;
  return Store.save('rosters', doc, label, action);
}

function studentForm(r, existing) {
  if (!S.role.canEdit) return;
  const s = existing ? clone(existing) : { k: uid('hv'), nationality: 'Việt Nam', group: (r.groups || [])[0] || '', files: [] };
  const files = s.files || [];
  const m = openModal({
    title: existing ? 'Sửa thông tin học viên' : 'Thêm học viên', sub: esc(`${r.title || 'Đợt cấp'} · ${r.customerName || ''}`), size: 'wide',
    body: `<form id="sf" novalidate autocomplete="off"><fieldset class="sec"><legend>Thông tin cá nhân</legend><div class="fgrid">
        ${f('sf-name', 'Họ và tên', inp('sf-name', s.name, 'required placeholder="VD: NGUYỄN VĂN A"'), { req: true, cls: 'span2' })}
        ${f('sf-gender', 'Giới tính', `<select class="input" id="sf-gender">${opt('', '— Chọn —', !s.gender)}${['Nam', 'Nữ'].map((g) => opt(g, g, s.gender === g)).join('')}</select>`)}
        ${f('sf-dob', 'Ngày sinh', inp('sf-dob', s.dob, 'placeholder="dd/mm/yyyy hoặc năm sinh"'))}
        ${f('sf-nat', 'Quốc tịch', inp('sf-nat', s.nationality, 'placeholder="Việt Nam"'))}
        ${f('sf-cccd', 'Số CCCD', inp('sf-cccd', s.cccd, 'inputmode="numeric" placeholder="12 số CCCD"'))}
        ${f('sf-pos', 'Chức vụ / công việc', inp('sf-pos', s.position, 'placeholder="VD: Thợ hàn, Tổ trưởng…"'), { cls: 'span2' })}
      </div></fieldset>
      <fieldset class="sec"><legend>Thẻ / Giấy chứng nhận</legend><div class="fgrid">
        ${f('sf-group', 'Nhóm', `<select class="input" id="sf-group">${opt('', 'Theo đợt cấp', !s.group)}${Object.keys(GROUPS).map((g) => opt(g, 'Nhóm ' + g, String(s.group) === g)).join('')}</select>`)}
        ${f('sf-type', 'Loại giấy', `<select class="input" id="sf-type">${opt('', 'Theo đợt cấp', !s.certType)}${CERT_TYPES.map((t) => opt(t, t, s.certType === t)).join('')}</select>`)}
        ${f('sf-no', 'Số thẻ/GCN', inp('sf-no', s.certNo, 'placeholder="VD: DAKO-N3-05/2026"'))}
        ${f('sf-issue', 'Ngày cấp', inp('sf-issue', s.issueDate, 'type="date"'), { hint: r.issueDate ? 'Để trống = theo đợt cấp ' + fmtD(r.issueDate) : '' })}
        ${f('sf-exp', 'Hiệu lực đến', inp('sf-exp', s.expiry, 'type="date"'), { hint: 'Để trống = tự tính theo nhóm' })}
        ${f('sf-result', 'Kết quả', inp('sf-result', s.result, 'placeholder="Đạt / điểm"'))}
        ${f('sf-content', 'Nội dung huấn luyện', inp('sf-content', s.content, 'placeholder="VD: Nhóm 3: Hàn, cắt kim loại"'), { cls: 'full' })}
        ${f('sf-notes', 'Ghi chú', `<textarea class="input" id="sf-notes" rows="2" placeholder="Ngày nhận thẻ, người nhận ký, ghi chú khác…">${esc(s.notes || '')}</textarea>`, { cls: 'full' })}
      </div></fieldset>
      <fieldset class="sec"><legend>Hồ sơ học viên</legend><div class="fgrid">
        <div class="f"><span class="lbl">Ảnh 3×4</span><div data-photo></div></div>
        <div class="f span2"><span class="lbl">Hình thẻ / GCN (ảnh hoặc PDF)</span><div data-cards></div></div>
        <div class="f full"><span class="lbl">Hồ sơ khác</span><div data-others></div></div>
      </div></fieldset></form>`,
    foot: `<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu học viên</button>`,
  });
  const root = m.el;
  const ph = mountFileField(root.querySelector('[data-photo]'), files.filter((x) => x.kind === 'anh').slice(0, 1), { image: true });
  const cards = mountFileField(root.querySelector('[data-cards]'), files.filter((x) => x.kind === 'the'), { accept: 'image/*,application/pdf', hint: 'Ảnh chụp/scan mặt trước – mặt sau' });
  const others = mountFileField(root.querySelector('[data-others]'), files.filter((x) => !['anh', 'the'].includes(x.kind)));
  const read = () => ({ name: val(root, 'sf-name'), gender: val(root, 'sf-gender'), dob: val(root, 'sf-dob'), nationality: val(root, 'sf-nat'), cccd: val(root, 'sf-cccd'), position: val(root, 'sf-pos'),
    group: val(root, 'sf-group') ? Number(val(root, 'sf-group')) : '', certType: val(root, 'sf-type'), certNo: val(root, 'sf-no'), issueDate: val(root, 'sf-issue'), expiry: val(root, 'sf-exp'), result: val(root, 'sf-result'), content: val(root, 'sf-content'), notes: val(root, 'sf-notes') });
  const snap = JSON.stringify(read());
  m.guard = formGuard(() => JSON.stringify(read()) !== snap || ph.dirty() || cards.dirty() || others.dirty(), [ph, cards, others]);
  root.querySelector('[data-cancel]').onclick = () => m.tryClose();
  root.querySelector('[data-save]').onclick = async (ev) => {
    const d = read();
    if (!d.name) { toast('Cần nhập họ tên học viên.', 'bad'); return; }
    const dup = d.certNo && allStudents().find((x) => x.s.k !== s.k && norm(x.s.certNo) === norm(d.certNo));
    if (dup) { toast(`Số ${d.certNo} đã cấp cho ${dup.v.name} (${dup.v.company}).`, 'bad'); return; }
    const newFiles = [...(ph.value() ? [{ ...ph.value(), kind: 'anh' }] : []), ...cards.value().map((x) => ({ ...x, kind: 'the' })), ...others.value().map((x) => ({ ...x, kind: x.kind && x.kind !== 'the' && x.kind !== 'anh' ? x.kind : 'khac' }))];
    const stu = { ...s, ...d, files: newFiles };
    let target = roster(r.id) || r;
    const doc = clone(target);
    doc.students = doc.students || [];
    const i = doc.students.findIndex((x) => x.k === s.k);
    if (i >= 0) doc.students[i] = stu; else doc.students.push(stu);
    ev.target.disabled = true;
    try {
      await saveRoster(doc, `${stu.name} – ${doc.title || doc.customerName || 'đợt cấp'}`, existing ? 'Cập nhật' : 'Thêm');
      ph.commit(); cards.commit(); others.commit(); m.guard = null; m.close(); toast(existing ? 'Đã cập nhật học viên.' : 'Đã thêm học viên.', 'ok');
    } catch (e) { ev.target.disabled = false; }
  };
}

async function deleteStudent(r, s) {
  if (!(await confirmBox(`Xóa học viên <b>${esc(s.name)}</b> khỏi đợt cấp “${esc(r.title || '')}” cùng hình thẻ/GCN đã gắn?`, { ok: 'Xóa học viên', danger: true }))) return false;
  const doc = clone(roster(r.id) || r); doc.students = (doc.students || []).filter((x) => x.k !== s.k);
  try { await saveRoster(doc, `${s.name} – ${doc.title || ''}`, 'Xóa'); (s.files || []).forEach((x) => Store.backend.delFile(x)); toast('Đã xóa học viên.', 'ok'); return true; } catch (e) { return false; }
}

/* ---------- đợt cấp ---------- */
function rosterDetail(batchId) {
  const m = openModal({ title: '', size: 'wide' }); m.refresh = render; render();
  function render() {
    const parts = rostersOfBatch(batchId); if (!parts.length) { m.close(); return; }
    const r = parts[0]; const studs = parts.flatMap((p) => (p.students || []).map((s) => ({ s, p })));
    const cls = r.classId && klass(r.classId); const q = r.quoteId && quote(r.quoteId);
    m.el.querySelector('.modal-h h2').textContent = r.title || 'Đợt cấp thẻ/GCN';
    const dd = (label, v) => `<div><dt>${label}</dt><dd>${v || '<span class="muted" title="Chưa nhập – bấm Sửa đợt cấp">Chưa nhập</span>'}</dd></div>`;
    m.body.innerHTML = `<dl class="dl">${dd('Công ty', r.customerId && customer(r.customerId) ? `<a href="#" data-act="customer-view" data-id="${esc(r.customerId)}">${esc(r.customerName)}</a>` : esc(r.customerName))}${dd('Nhóm', esc(groupsText(r.groups)))}${dd('Loại giấy', esc(r.certType))}
        ${dd('Khóa học', esc(fmtDateRange(r.courseFrom, r.courseTo)) + (r.hours ? ` · ${esc(r.hours)} giờ` : ''))}${dd('Ngày cấp', esc(fmtD(r.issueDate)))}${dd('Quyết định', esc(r.decisionNo) + (r.decisionDate ? ' · ' + esc(fmtD(r.decisionDate)) : ''))}
        ${dd('Lớp trong lịch', cls ? `<a href="#" data-act="class-view" data-id="${esc(cls.id)}">${esc(classLabel(cls))} · ${esc(fmtDateRange(cls.startDate, cls.endDate))}</a>` : '')}${dd('Báo giá / hợp đồng', q ? `<a href="#" data-act="quote-view" data-id="${esc(q.id)}">${esc(q.contractNo || q.no || '')}</a>` : '')}
        ${r.notes ? `<div class="full"><dt>Ghi chú</dt><dd style="white-space:pre-wrap">${esc(r.notes)}</dd></div>` : ''}</dl>
      <div><div class="sec-title">Quyết định cấp thẻ/GCN</div>${filesBlock(parts.flatMap((p) => p.decisionFiles || []), 'Chưa có file quyết định')}</div>
      <div><div class="sec-title">Hồ sơ khác của đợt (sổ cấp, danh sách, biên bản…)</div>${filesBlock(parts.flatMap((p) => p.files || []), 'Chưa có file')}</div>
      <div><div class="sec-title">Học viên (${studs.length})<span class="actions edit-only"><button type="button" class="btn xs" data-x="add">${ic('plus')} Thêm học viên</button></span></div>
        ${studs.length ? `<div class="tbl-wrap"><table class="tbl"><thead><tr><th class="r">#</th><th>Họ và tên</th><th>Ngày sinh</th><th>CCCD</th><th>Chức vụ</th><th>Số thẻ/GCN</th><th>Hiệu lực đến</th><th>Hình</th></tr></thead><tbody>${studs.map(({ s, p }, i) => { const v = studentView(s, p); return `<tr data-act="student-view" data-id="${esc(p.id)}" data-key="${esc(s.k)}"><td class="r muted">${i + 1}</td><td class="strong">${esc(v.name)}</td><td class="small">${esc(v.dob)}</td><td class="num small">${esc(v.cccd)}</td><td class="small">${esc(s.position || '')}</td><td class="nowrap num">${esc(v.certNo)}</td><td class="nowrap num">${esc(fmtD(v.expiry))}</td><td>${studentFiles(s, ['the']).length ? ic('idcard', 'ti') : ''}</td></tr>`; }).join('')}</tbody></table></div>` : '<div class="muted small">Chưa có học viên.</div>'}</div>`;
    if (!m.foot) { m.el.insertAdjacentHTML('beforeend', '<div class="modal-f"></div>'); m.foot = m.el.querySelector('.modal-f'); }
    m.foot.innerHTML = `${editorStamp(r)}<span class="sp"></span><span class="edit-only" style="display:flex;gap:8px"><button type="button" class="btn danger" data-x="del">${ic('trash')} Xóa đợt cấp</button><button type="button" class="btn primary" data-x="edit">${ic('edit')} Sửa đợt cấp</button></span>`;
    const on = (sel, fn) => m.el.querySelector(sel)?.addEventListener('click', fn);
    on('[data-x=edit]', () => { m.close(); rosterForm(batchId); });
    on('[data-x=del]', async () => { if (await deleteBatch(batchId)) m.close(); });
    on('[data-x=add]', async () => {
      let last = parts[parts.length - 1];
      if (rosterCount(last) >= ROSTER_PART_MAX) {
        const nx = { ...clone(last), id: uid('ro'), part: (last.part || 1) + 1, batchId, students: [], decisionFiles: [], files: [] };
        delete nx.createdAt; delete nx.updatedAt;
        try { last = await saveRoster(nx, `${r.title || 'Đợt cấp'} – phần ${nx.part}`, 'Thêm'); } catch (e) { return; }
      }
      m.close(); studentForm(last, null);
    });
    hydrate(m.el); fillNames(m.el);
  }
}

function rosterForm(batchId, preset = {}) {
  if (!S.role.canEdit) return;
  const parts = batchId ? rostersOfBatch(batchId) : [];
  const r = parts[0] ? clone(parts[0]) : { groups: [], certType: '', students: [], decisionFiles: [], files: [], ...preset };
  const m = openModal({
    title: batchId ? 'Sửa đợt cấp thẻ/GCN' : 'Thêm đợt cấp thẻ/GCN', sub: 'Thông tin chung của đợt áp dụng cho học viên chưa ghi riêng', size: 'wide',
    body: `<form id="rf" novalidate autocomplete="off"><fieldset class="sec"><legend>Thông tin đợt cấp</legend><div class="fgrid">
        ${f('rf-title', 'Tên đợt cấp', inp('rf-title', r.title, 'placeholder="VD: Thẻ an toàn nhóm 3 – Cty ABC – 11/2026"'), { cls: 'span2', req: true })}
        ${f('rf-customer', 'Công ty', inp('rf-customer', r.customerName, 'list="rf-customers" placeholder="Gõ để chọn công ty đã có"') + custList('rf-customers'), { cls: 'span2' })}
        <div class="f full"><span class="lbl">Nhóm huấn luyện</span>${groupChecks('rf-group', r.groups)}</div>
        ${f('rf-type', 'Loại giấy', `<select class="input" id="rf-type">${opt('', '— Theo nhóm —', !r.certType)}${CERT_TYPES.map((t) => opt(t, t, r.certType === t)).join('')}</select>`)}
        ${f('rf-from', 'Khóa học từ ngày', inp('rf-from', r.courseFrom, 'type="date"'))}
        ${f('rf-to', 'Đến ngày', inp('rf-to', r.courseTo, 'type="date"'))}
        ${f('rf-hours', 'Số giờ', inp('rf-hours', r.hours, 'type="number" min="1" placeholder="VD: 24"'))}
        ${f('rf-issue', 'Ngày cấp', inp('rf-issue', r.issueDate, 'type="date"'))}
        ${f('rf-dno', 'Số quyết định cấp', inp('rf-dno', r.decisionNo, 'placeholder="VD: 15/QĐ-DAKO"'))}
        ${f('rf-ddate', 'Ngày quyết định', inp('rf-ddate', r.decisionDate, 'type="date"'))}
        ${f('rf-class', 'Lớp trong lịch giảng dạy', '<select class="input" id="rf-class"></select>', { cls: 'span2' })}
        ${f('rf-quote', 'Báo giá / hợp đồng', '<select class="input" id="rf-quote"></select>', { cls: 'span2' })}
        ${f('rf-notes', 'Ghi chú', `<textarea class="input" id="rf-notes" rows="2" placeholder="Nơi cấp, người lập sổ, ghi chú khác…">${esc(r.notes || '')}</textarea>`, { cls: 'full' })}
        <div class="f full"><span class="lbl">Quyết định cấp thẻ/GCN</span><div data-dfiles></div></div>
        <div class="f full"><span class="lbl">Hồ sơ khác (sổ cấp Excel, danh sách ký nhận, biên bản…)</span><div data-ofiles></div></div>
      </div></fieldset></form>`,
    foot: `<span class="sp"></span><button type="button" class="btn" data-cancel>Hủy</button><button type="button" class="btn primary" data-save>${ic('check')} Lưu đợt cấp</button>`,
  });
  const root = m.el;
  const df = mountFileField(root.querySelector('[data-dfiles]'), parts.flatMap((p) => p.decisionFiles || []));
  const of = mountFileField(root.querySelector('[data-ofiles]'), parts.flatMap((p) => p.files || []));
  function fillSelects() {
    const cu = findCustomerByName(val(root, 'rf-customer'));
    const cs = S.classes.filter((c) => (cu && c.customerId === cu.id) || c.id === r.classId).sort(sortClasses).reverse();
    root.querySelector('#rf-class').innerHTML = opt('', cs.length ? '— Chưa gắn lớp —' : '— Công ty chưa có lớp —', !r.classId) + cs.map((c) => opt(c.id, `${fmtDateRange(c.startDate, c.endDate)} · ${groupsText(c.groups)} · ${c.students || 0} HV`, c.id === r.classId)).join('');
    const qs = S.quotes.filter((q) => (cu && q.customerId === cu.id) || q.id === r.quoteId);
    root.querySelector('#rf-quote').innerHTML = opt('', qs.length ? '— Chưa gắn —' : '— Công ty chưa có báo giá —', !r.quoteId) + qs.map((q) => opt(q.id, `${q.contractNo ? 'HĐ ' + q.contractNo : 'BG ' + (q.no || '')} · ${fmtD(q.contractDate || q.date)}`, q.id === r.quoteId)).join('');
  }
  fillSelects();
  root.querySelector('#rf-customer').addEventListener('change', fillSelects);
  const read = () => ({ title: val(root, 'rf-title'), customerName: val(root, 'rf-customer'), groups: checkedVals(root, 'rf-group').map(Number), certType: val(root, 'rf-type'), courseFrom: val(root, 'rf-from'), courseTo: val(root, 'rf-to'), hours: val(root, 'rf-hours'),
    issueDate: val(root, 'rf-issue'), decisionNo: val(root, 'rf-dno'), decisionDate: val(root, 'rf-ddate'), classId: val(root, 'rf-class') || null, quoteId: val(root, 'rf-quote') || null, notes: val(root, 'rf-notes') });
  const snap = JSON.stringify(read());
  m.guard = formGuard(() => JSON.stringify(read()) !== snap || df.dirty() || of.dirty(), [df, of]);
  root.querySelector('[data-cancel]').onclick = () => m.tryClose();
  root.querySelector('[data-save]').onclick = async (ev) => {
    const d = read();
    if (!d.title) { toast('Cần nhập tên đợt cấp.', 'bad'); return; }
    ev.target.disabled = true;
    try {
      const cu = d.customerName ? await ensureCustomer(d.customerName) : null;
      const base = { ...d, customerId: cu?.id || null, customerName: cu?.name || d.customerName };
      if (!parts.length) {
        const id = uid('ro');
        await saveRoster({ ...r, ...base, id, batchId: id, part: 1, students: [], decisionFiles: df.value(), files: of.value() }, base.title, 'Thêm');
      } else {
        for (let i = 0; i < parts.length; i++) {
          const p = roster(parts[i].id) || parts[i];
          await saveRoster({ ...p, ...base, batchId: p.batchId || batchId, decisionFiles: i === 0 ? df.value() : [], files: i === 0 ? of.value() : [] }, i === 0 ? base.title : '', 'Cập nhật');
        }
      }
      df.commit(); of.commit(); m.guard = null; m.close(); toast('Đã lưu đợt cấp.', 'ok');
    } catch (e) { ev.target.disabled = false; }
  };
}

async function deleteBatch(batchId) {
  const parts = rostersOfBatch(batchId); const n = sum(parts, rosterCount);
  if (!(await confirmBox(`Xóa đợt cấp <b>${esc(parts[0]?.title || '')}</b> cùng <b>${n}</b> học viên, quyết định và hình thẻ/GCN đã gắn? Không hoàn tác được.`, { ok: 'Xóa đợt cấp', danger: true }))) return false;
  try {
    for (const p of parts) {
      await Store.remove('rosters', p, `${p.title || 'Đợt cấp'}${parts.length > 1 ? ' – phần ' + (p.part || 1) : ''}`);
      [...(p.decisionFiles || []), ...(p.files || []), ...(p.students || []).flatMap((s) => s.files || [])].forEach((x) => Store.backend.delFile(x));
    }
    STUDENT_CACHE.src = null; toast('Đã xóa đợt cấp.', 'ok'); return true;
  } catch (e) { return false; }
}
