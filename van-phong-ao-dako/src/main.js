/* Văn phòng ảo DAKO – giao diện: danh sách nhân sự, thẻ kết quả đầu ra, mở phiên chat giao việc. */
(() => {
  const D = window.DOI_NGU;
  const NV = Object.fromEntries(D.nhan_vien.map(n => [n.id, n]));
  const TP = Object.fromEntries(D.truong_phong.map(t => [t.id, t]));
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  const ARROW = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 17L17 7M9 7h8v8"/></svg>';
  let giver = TP[store.get('vp-giver')] ? store.get('vp-giver') : D.truong_phong[0].id;
  let pinned = null;

  /* ---------- Thẻ kết quả đầu ra ---------- */
  function outputsCard(nv, opts = {}) {
    return `<div class="oc-head"><span class="num">${nv.so}</span><div><b>${esc(nv.ten)}</b><small>${esc(nv.viec)}</small></div></div>
      <div class="oc-label">Kết quả đầu ra</div>
      <ul class="oc-list">${nv.dau_ra.map(x => `<li>${esc(x)}</li>`).join('')}</ul>
      <div class="oc-need"><span>Cần gửi kèm:</span> ${esc(nv.can)}</div>
      ${opts.link ? `<a class="btn gold" href="${esc(nv.link)}" target="_blank" rel="noopener">${esc(TP[giver].ten)} giao việc cho ${esc(nv.ten)} ${ARROW}</a>` : `<div class="oc-hint">Bấm vào ${esc(nv.ten)} để mở phiên chat giao việc</div>`}`;
  }
  function showTip(id, e) {
    const tip = $('#tip');
    if (!id || pinned) { tip.hidden = true; return; }
    const st = $('#stage').getBoundingClientRect();
    if (TP[id]) tip.innerHTML = `<div class="oc-head"><span class="num boss">${esc(TP[id].ten.split(' ').pop()[0])}</span><div><b>${esc(TP[id].ten)}</b><small>${esc(TP[id].chuc_danh)} · ${esc(TP[id].mo_ta)}</small></div></div><div class="oc-hint">Bấm để chọn ${esc(TP[id].ten)} là người giao việc</div>`;
    else tip.innerHTML = outputsCard(NV[id]);
    tip.hidden = false;
    const w = tip.offsetWidth, h = tip.offsetHeight;
    let x = e.clientX - st.left + 16, y = e.clientY - st.top + 16;
    if (x + w > st.width - 8) x = e.clientX - st.left - w - 16;
    if (y + h > st.height - 8) y = Math.max(8, st.height - h - 8);
    tip.style.transform = `translate(${Math.round(Math.max(8, x))}px, ${Math.round(y)}px)`;
  }
  function pin(id) {
    pinned = id; const el = $('#pinned');
    if (!id) { el.hidden = true; Office.highlight(null); return; }
    $('#tip').hidden = true;
    el.innerHTML = `<button class="icon-btn close" data-act="unpin" aria-label="Đóng">×</button>${outputsCard(NV[id], { link: true })}`;
    el.hidden = false; Office.highlight(id);
  }

  /* ---------- Mở phiên chat ---------- */
  function openChat(id) {
    const nv = NV[id]; if (!nv) return;
    Office.dispatch(giver, id);
    const a = document.createElement('a'); a.href = nv.link; a.target = '_blank'; a.rel = 'noopener';
    document.body.appendChild(a); a.click(); a.remove();
    pin(id);
    toast(`${TP[giver].ten} giao việc cho ${nv.ten}: phiên chat “${nv.viec}” mở ở tab mới. Không thấy tab mới thì bấm nút vàng trong thẻ.`);
  }
  function toast(msg) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), 6000); }

  /* ---------- Danh sách bên phải ---------- */
  function renderSide() {
    $('#bossList').innerHTML = D.truong_phong.map(t => `<button class="boss-card" data-giver="${t.id}" aria-pressed="${t.id === giver}">
      <span class="av boss">${esc(t.ten.split(' ').pop()[0])}</span><span class="bc-main"><b>${esc(t.ten)}</b><small>${esc(t.chuc_danh)}</small></span>
      <span class="bc-state">${t.id === giver ? 'Đang giao việc' : 'Chọn'}</span></button>`).join('');
    $('#staffList').innerHTML = D.nhan_vien.map(n => `<li class="staff-card" data-staff="${n.id}">
      <div class="sc-top"><span class="num">${n.so}</span><span class="sc-main"><b>${esc(n.ten)}</b><span>${esc(n.viec)}</span></span>
        <a class="btn gold sm" href="${esc(n.link)}" target="_blank" rel="noopener" data-open="${n.id}" aria-label="Mở phiên chat giao việc cho ${esc(n.ten)}">Giao việc ${ARROW}</a></div>
      <ul class="sc-out">${n.dau_ra.map(x => `<li>${esc(x)}</li>`).join('')}</ul></li>`).join('');
    $('#giverName').textContent = TP[giver].ten;
    document.querySelectorAll('[data-giver-btn]').forEach(b => b.setAttribute('aria-pressed', b.dataset.giverBtn === giver));
  }
  function renderTags() {
    $('#tags').innerHTML = D.nhan_vien.map(n => `<button class="ptag" data-staff="${n.id}"><span class="num">${n.so}</span><b>${esc(n.ten)}</b><span class="pt-job">${esc(n.bien)}</span></button>`).join('')
      + D.truong_phong.map(t => `<button class="ptag boss ${t.id === giver ? 'on' : ''}" data-giver="${t.id}"><b>${esc(t.ten)}</b></button>`).join('');
    placeTags();
  }
  function placeTags() {
    if (!Office.ready) return;
    document.querySelectorAll('#tags .ptag').forEach(el => {
      const staff = el.dataset.staff, a = staff ? Office.podFront(staff) : Office.anchor(el.dataset.giver); if (!a) return;
      const p = Office.project(a);
      el.style.transform = staff ? `translate(${Math.round(p.x)}px, ${Math.round(p.y + 6)}px) translate(-50%, 0)` : `translate(${Math.round(p.x)}px, ${Math.round(p.y - 10)}px) translate(-50%, -100%)`;
    });
  }
  function setGiver(id) { giver = id; store.set('vp-giver', id); renderSide(); renderTags(); if (pinned) pin(pinned); }

  /* ---------- Sự kiện ---------- */
  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act],[data-giver],[data-giver-btn],[data-scene],[data-open],[data-staff]'); if (!b) return;
    if (b.dataset.scene) { Office.setTheme(b.dataset.scene); store.set('vp-scene', b.dataset.scene); document.querySelectorAll('[data-scene]').forEach(x => x.setAttribute('aria-pressed', x === b)); return; }
    if (b.dataset.act === 'unpin') return pin(null);
    if (b.dataset.giver || b.dataset.giverBtn) return setGiver(b.dataset.giver || b.dataset.giverBtn);
    if (b.dataset.open) { Office.dispatch(giver, b.dataset.open); return; }     // thẻ <a> tự mở tab mới
    if (b.dataset.staff && b.classList.contains('ptag')) return openChat(b.dataset.staff);
    if (b.dataset.staff && b.classList.contains('staff-card')) return pin(b.dataset.staff);
  });
  $('#staffList').addEventListener('mouseover', e => { const c = e.target.closest('.staff-card'); Office.highlight(c ? c.dataset.staff : pinned); });
  $('#staffList').addEventListener('mouseleave', () => Office.highlight(pinned));
  $('#zIn').addEventListener('click', () => Office.zoomBy(1.25));
  $('#zOut').addEventListener('click', () => Office.zoomBy(0.8));
  $('#zFit').addEventListener('click', () => Office.fit());
  document.addEventListener('keydown', e => { if (e.key === 'Escape') pin(null); });

  /* ---------- Khởi động ---------- */
  renderSide();
  const ok = Office.init($('#stage'), $('#cv'), D, { logo: window.LOGO });
  if (!ok) {
    $('#cv').hidden = true; const fb = $('#fallback'); fb.hidden = false;
    fb.innerHTML = D.nhan_vien.map(n => `<a class="fb-card" href="${esc(n.link)}" target="_blank" rel="noopener"><span class="num">${n.so}</span><b>${esc(n.ten)}</b><span>${esc(n.viec)}</span></a>`).join('');
  }
  const dark = matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.dataset.theme === 'dark';
  const sc0 = store.get('vp-scene') || (dark ? 'dem' : 'sang');
  Office.setTheme(sc0); document.querySelectorAll('[data-scene]').forEach(x => x.setAttribute('aria-pressed', x.dataset.scene === sc0));
  Office.fit(false);
  renderTags();
  Office.onFrame(ch => { if (ch) placeTags(); });
  Office.onHover((u, e) => {
    const id = u && (u.person || (u.boss ? null : null));
    if (!pinned) Office.highlight(NV[id] ? id : null);
    showTip(u && u.person ? u.person : null, e);
  });
  Office.onPick((u, e) => {
    if (!u) return pin(null);
    if (u.boss) return;
    const id = u.person;
    if (TP[id]) return setGiver(id);
    if (!NV[id]) return;
    if (e && e.pointerType === 'touch') return pin(id);     // chạm: xem đầu ra trước, bấm nút vàng để mở phiên chat
    openChat(id);
  });
  if (document.fonts) { document.fonts.ready.then(() => Office.redrawBoards()); ['Anton', 'JetBrains Mono'].forEach(f => document.fonts.load(`40px "${f}"`).then(() => Office.redrawBoards()).catch(() => {})); }
})();
