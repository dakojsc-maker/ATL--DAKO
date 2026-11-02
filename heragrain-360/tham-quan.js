/* Trình xem tham quan 360° nhà máy Heragrain: nhìn quanh tại mỗi điểm đứng, đi giữa các điểm qua cửa,
   bản đồ nhỏ có hướng nhìn, dải ảnh các điểm, điểm thông tin, tự xoay, toàn màn hình, tham quan tự động. */
(function () {
"use strict";
const H = window.HERAGRAIN, V = window.HERAGRAIN_360, W = window.HeragrainTheGioi;
const el = (id) => document.getElementById(id);
const SC = Object.fromEntries(V.SCENES.map((s) => [s.id, s]));
const ZH = Object.fromEntries(H.ZONES.map((z) => [z.id, z]));
const MAU_GD = { 1: '#5E9E68', 2: '#23765C', 3: '#E4A92A', 4: '#86479B' };
const TEN_KHU = { tong: 'Toàn cảnh', moi: 'Lô xưởng mới', cu: 'Khu nhà ở và xưởng cũ' };
const reduce = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
const D2R = Math.PI / 180;
const hep = () => window.innerWidth <= 760;
const boxTT = el('thongTin'), boxBD = el('banDo');

/* ---------- khởi tạo ---------- */
const canvas = el('gl');
let renderer = null;
try { renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); } catch (e) { renderer = null; }
if (!renderer) { el('trangThai').textContent = 'Trình duyệt này không hiển thị được đồ họa 3D (WebGL). Hãy mở bằng Chrome, Edge, Safari hoặc Firefox bản mới.'; return; }
renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
// điện thoại hết bộ nhớ đồ họa (thường gặp trên iPhone đời cũ khi mở nhiều thẻ): báo để tải lại thay vì đứng màn hình đen
canvas.addEventListener('webglcontextlost', (e) => { e.preventDefault(); baoNhanh('Máy tạm hết bộ nhớ đồ họa. Hãy đóng bớt thẻ rồi tải lại trang.', 15000); });
// Safari trên iPhone, iPad: chụm hai ngón chỉ để thu phóng khung nhìn 360, không phóng to cả trang
['gesturestart', 'gesturechange'].forEach((t) => document.addEventListener(t, (e) => e.preventDefault()));
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
const scene = new THREE.Scene();
scene.background = new THREE.Color('#DCE6E0'); scene.fog = new THREE.Fog('#DCE6E0', 150, 980);
const camera = new THREE.PerspectiveCamera(75, 1, 0.05, 3000);
scene.add(new THREE.HemisphereLight(0xE6F0F4, 0xB9BAAF, 0.56));
scene.add(new THREE.AmbientLight(0xFFFFFF, 0.3));
const sun = new THREE.DirectionalLight(0xFFF2DC, 0.62);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45, near: 5, far: 300 });
sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02;
scene.add(sun); scene.add(sun.target);
function datMatTroi(x, z) { sun.target.position.set(x, 0, z); sun.position.set(x - 60, 110, z + 45); sun.target.updateMatrixWorld(); }

let troi = null, ZONES = [];
const pos = new THREE.Vector3(), tmp = new THREE.Vector3();
let cur = null, yaw = 0, pitch = 0, fov = 75, vYaw = 0, vPitch = 0, tween = null, idle = 0, tuXoay = true, tour = null;

function huongNhin(s) {
  const dx = s.nhin[0] - s.p[0], dy = s.nhin[1] - s.p[1], dz = s.nhin[2] - s.p[2];
  return { yaw: Math.atan2(dx, -dz), pitch: Math.atan2(dy, Math.hypot(dx, dz)) };
}
function apCamera() {
  camera.position.copy(pos);
  tmp.set(Math.sin(yaw) * Math.cos(pitch), Math.sin(pitch), -Math.cos(yaw) * Math.cos(pitch)).add(pos);
  camera.lookAt(tmp);
  if (camera.fov !== fov) { camera.fov = fov; camera.updateProjectionMatrix(); }
  if (troi) troi.position.copy(pos);
}
function fit() {
  const w = Math.max(canvas.clientWidth, 10), h = Math.max(canvas.clientHeight, 10);
  renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix();
  doKhung();
}
// đo thanh trên và dải ảnh để bản đồ, thu phóng, thông tin, phụ đề nằm vừa khoảng trống giữa hai thanh
function doKhung() {
  const g = document.documentElement.style, dai = el('dai');
  g.setProperty('--dau', document.querySelector('.dau').offsetHeight + 'px');
  g.setProperty('--dai', (dai.classList.contains('thu') ? -12 : dai.offsetHeight) + 'px');
}
window.addEventListener('resize', fit);
if (window.ResizeObserver) { const ro = new ResizeObserver(doKhung); ro.observe(document.querySelector('.dau')); ro.observe(el('dai')); }

/* ---------- điều khiển nhìn ---------- */
const keo = new Map(); let pinch = null, last = null;
function cham() { idle = 0; vYaw = vPitch = 0; dungTour(); }
canvas.addEventListener('pointerdown', (e) => { canvas.setPointerCapture(e.pointerId); keo.set(e.pointerId, { x: e.clientX, y: e.clientY }); cham(); canvas.classList.add('dangkeo'); if (keo.size === 2) { const [a, b] = [...keo.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), fov }; } last = { x: e.clientX, y: e.clientY, t: performance.now() }; });
canvas.addEventListener('pointermove', (e) => {
  if (!keo.has(e.pointerId) || tween) return;
  const p = keo.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y; keo.set(e.pointerId, { x: e.clientX, y: e.clientY });
  if (keo.size === 2 && pinch) { const [a, b] = [...keo.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y); fov = Math.min(95, Math.max(30, pinch.fov * pinch.d / Math.max(d, 1))); return; }
  const dpp = (fov * D2R) / canvas.clientHeight;
  yaw -= dx * dpp; pitch = Math.max(-1.45, Math.min(1.45, pitch + dy * dpp));
  const now = performance.now(), dt = Math.max(1, now - last.t) / 1000; vYaw = -dx * dpp / dt; vPitch = dy * dpp / dt; last = { x: e.clientX, y: e.clientY, t: now };
  idle = 0;
});
const tha = (e) => { keo.delete(e.pointerId); if (keo.size < 2) pinch = null; if (!keo.size) canvas.classList.remove('dangkeo'); if (performance.now() - (last ? last.t : 0) > 80) vYaw = vPitch = 0; };
canvas.addEventListener('pointerup', tha); canvas.addEventListener('pointercancel', tha);
canvas.addEventListener('wheel', (e) => { e.preventDefault(); cham(); fov = Math.min(95, Math.max(30, fov + e.deltaY * 0.04)); }, { passive: false });
document.addEventListener('keydown', (e) => {
  if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
  const k = e.key, b = 0.06;
  if (k === 'ArrowLeft' || k === 'a') { yaw -= b; cham(); } else if (k === 'ArrowRight' || k === 'd') { yaw += b; cham(); }
  else if (k === 'ArrowUp' || k === 'w') { pitch = Math.min(1.45, pitch + b); cham(); } else if (k === 'ArrowDown' || k === 's') { pitch = Math.max(-1.45, pitch - b); cham(); }
  else if (k === '+' || k === '=') { fov = Math.max(30, fov - 5); cham(); } else if (k === '-') { fov = Math.min(95, fov + 5); cham(); }
  else if (k === 'Escape') { dongThongTin(); dungTour(); }
});
el('bZoomVao').addEventListener('click', () => { cham(); fov = Math.max(30, fov - 10); });
el('bZoomRa').addEventListener('click', () => { cham(); fov = Math.min(95, fov + 10); });

/* ---------- di chuyển giữa các điểm ---------- */
const v3 = (p, y) => new THREE.Vector3(p[0], p.length === 3 ? p[1] : y, p.length === 3 ? p[2] : p[1]);
const lerpGoc = (a, b, t) => { let d = ((b - a + Math.PI) % (Math.PI * 2) + Math.PI * 2) % (Math.PI * 2) - Math.PI; return a + d * t; };
const em = (t) => (t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2);
let dangChuyen = false;
function denDiem(id, hs) {
  const s = SC[id]; if (!s || dangChuyen) return Promise.resolve();
  // đang đi dở mà chọn điểm khác: bỏ đoạn đang đi, chuyển thẳng tới điểm mới
  if (tween) { const t = tween; tween = null; t.done(); return chuyenToi(id); }
  const to = v3(s.p), end = huongNhin(s);
  if (!hs || pos.distanceTo(to) > 70 || !cur) return chuyenToi(id);
  const pts = [pos.clone()];
  const them = (p) => pts.push(v3(p, 0));
  (hs.qua || []).forEach(them); if (!hs.thang) them([hs.p[0], hs.p[2]]); (hs.sau || []).forEach(them); pts.push(to);
  const n = pts.length - 1; pts.forEach((p, i) => { if (i > 0 && i < n) p.y = pts[0].y + (to.y - pts[0].y) * (i / n); });
  const lens = []; let total = 0; for (let i = 0; i < n; i++) { const l = pts[i].distanceTo(pts[i + 1]); lens.push(l); total += l; }
  const dur = reduce ? 0.01 : hs.thang ? Math.min(3, Math.max(1.4, total / 14)) : Math.min(3.4, Math.max(0.9, total / 2.8));
  return new Promise((done) => { tween = { pts, lens, total, t0: performance.now(), dur: dur * 1000, end, id, yaw0: yaw, pitch0: pitch, fov0: fov, thang: !!hs.thang, mid: null, done }; dongDiemNong(); });
}
function chuyenToi(id) {
  const s = SC[id], man = el('man');
  if (!s) return Promise.resolve();
  dangChuyen = true; dongDiemNong();
  return new Promise((done) => {
    man.classList.add('den');
    setTimeout(() => { pos.copy(v3(s.p)); const h = huongNhin(s); yaw = h.yaw; pitch = h.pitch; fov = s.fov || 75; vYaw = vPitch = 0; vaoDiem(id); apCamera(); man.classList.remove('den'); dangChuyen = false; done(); }, reduce ? 0 : 420);
  });
}
function buocTween(now, dt) {
  const t = tween, f = Math.min(1, (now - t.t0) / t.dur), e = em(f);
  let dist = e * t.total, i = 0; while (i < t.lens.length - 1 && dist > t.lens[i]) { dist -= t.lens[i]; i++; }
  const a = t.pts[i], b = t.pts[i + 1]; pos.lerpVectors(a, b, t.lens[i] ? Math.min(1, dist / t.lens[i]) : 1);
  const fov1 = SC[t.id].fov || 75;
  if (t.thang) { yaw = lerpGoc(t.yaw0, t.end.yaw, e); pitch = t.pitch0 + (t.end.pitch - t.pitch0) * e; }
  else if (f < 0.72) { const ty = Math.atan2(b.x - a.x, -(b.z - a.z)); const k = 1 - Math.exp(-dt * 6); yaw = lerpGoc(yaw, ty, k); pitch += (-0.04 - pitch) * k; }
  else { if (!t.mid) t.mid = { yaw, pitch }; const g = em((f - 0.72) / 0.28); yaw = lerpGoc(t.mid.yaw, t.end.yaw, g); pitch = t.mid.pitch + (t.end.pitch - t.mid.pitch) * g; }
  fov = t.fov0 + (fov1 - t.fov0) * e;
  if (f >= 1) { tween = null; yaw = t.end.yaw; pitch = t.end.pitch; fov = fov1; pos.copy(t.pts[t.pts.length - 1]); vaoDiem(t.id); t.done(); }
}

/* ---------- vào một điểm ---------- */
function vaoDiem(id) {
  const s = SC[id]; cur = id; idle = 0;
  datMatTroi(s.p[0], s.p[2]);
  el('diemTen').textContent = s.ten; el('khuTen').textContent = s.nhom === 'tong' ? 'Toàn cảnh · ' + V.KHU[s.khu].ten : TEN_KHU[s.nhom];
  const gd = el('gdNhan'); gd.textContent = 'Hoạt động từ GĐ' + s.gd; gd.style.background = MAU_GD[s.gd]; gd.style.color = s.gd === 3 ? '#1D2B22' : '#fff';
  taoDiemNong(s);
  document.querySelectorAll('.anh').forEach((b) => b.setAttribute('aria-current', String(b.dataset.id === id)));
  const nut = document.querySelector(`.anh[data-id="${id}"]`); if (nut && nut.scrollIntoView) nut.scrollIntoView({ block: 'nearest', inline: 'center', behavior: reduce ? 'auto' : 'smooth' });
  veBanDo(s.khu);
  if (!boxTT.hidden) moThongTin(null);
  try { history.replaceState(null, '', '#' + id); } catch (e) { /* khung xem có thể chặn */ }
}

/* ---------- điểm nóng ---------- */
const hsBox = el('diemNong'); let HS = [];
const MUI_TEN = '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 4l7 8h-4.5v8h-5v-8H5z"/></svg>';
function dongDiemNong() { hsBox.classList.add('an'); }
function taoDiemNong(s) {
  hsBox.innerHTML = ''; HS = []; hsBox.classList.remove('an');
  s.di.forEach((h) => {
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hs di';
    b.innerHTML = `<span class="vong">${MUI_TEN}</span><span class="nhan">${h.nhan}</span>`;
    b.setAttribute('aria-label', 'Đi tới: ' + h.nhan);
    b.addEventListener('click', (e) => { e.stopPropagation(); dungTour(); denDiem(h.toi, h); });
    hsBox.appendChild(b); HS.push({ el: b, p: new THREE.Vector3(h.p[0], h.p[1], h.p[2]) });
  });
  s.tt.forEach((h) => {
    const z = h.zone ? ZH[h.zone] : null, ten = h.ten || (z ? z.name : '');
    const b = document.createElement('button'); b.type = 'button'; b.className = 'hs tt';
    b.innerHTML = `<span class="vong">i</span><span class="nhan">${ten}</span>`;
    b.setAttribute('aria-label', 'Thông tin: ' + ten);
    b.addEventListener('click', (e) => { e.stopPropagation(); dungTour(); moThongTin(h); });
    hsBox.appendChild(b); HS.push({ el: b, p: new THREE.Vector3(h.p[0], h.p[1], h.p[2]) });
  });
}
function chieuDiemNong() {
  const w = canvas.clientWidth, h = canvas.clientHeight, thay = [];
  HS.forEach((o) => {
    tmp.copy(o.p).project(camera);
    const sau = tmp.z > 1, x = (tmp.x * 0.5 + 0.5) * w, y = (-tmp.y * 0.5 + 0.5) * h;
    const an = sau || x < -60 || x > w + 60 || y < -60 || y > h + 60;
    o.el.classList.toggle('khuat', an);
    if (!an) { o.el.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px)`; o.x = x; o.y = y; o.xa = o.p.distanceTo(pos); thay.push(o); }
  });
  // nhãn chồng nhau thì chỉ giữ nhãn của mũi tên gần nhất, các nhãn khác hiện khi rê chuột
  thay.forEach((o) => { o.gon = thay.some((q) => q !== o && q.el.classList.contains('di') && o.el.classList.contains('di') && q.xa < o.xa && Math.abs(q.x - o.x) < 170 && Math.abs(q.y - o.y) < 46); o.el.classList.toggle('gon', o.gon); });
}

/* ---------- thông tin ---------- */
const dt2 = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
const KT = { phac: 'theo số đo phác thảo', uoc: 'ước theo tỷ lệ ảnh vẽ tay', de: 'đề xuất' };
function theKhu(z, h) {
  if (!z) return '';
  const [x0, x1, z0, z1] = z.box, gd = z.sanCo ? 'Có sẵn' : 'GĐ' + z.phase;
  const buoc = (H.STEPS || []).filter((s) => s.zone === z.id).map((s) => 'Bước ' + s.n + ': ' + s.name);
  return `<article class="the"><div class="the-dau"><h3>${h && h.ten ? h.ten : z.name}</h3><span class="gd" style="background:${MAU_GD[z.phase]};color:${z.phase === 3 ? '#1D2B22' : '#fff'}">${gd}</span></div>
    ${h && h.noidung ? `<p>${h.noidung}</p>` : ''}
    <dl><dt>Công năng</dt><dd>${z.role}</dd>
    ${z.noArea ? '' : `<dt>Diện tích</dt><dd>${dt2(x1 - x0)} × ${dt2(z1 - z0)} m = ${dt2((x1 - x0) * (z1 - z0))} m²${z.kt ? ` (${KT[z.kt]})` : ''}</dd>`}
    ${buoc.length ? `<dt>Quy trình</dt><dd>${buoc.join('<br>')}</dd>` : ''}
    <dt>Yêu cầu</dt><dd>${z.req}</dd><dt>Căn cứ</dt><dd>${z.basis}</dd></dl></article>`;
}
function moThongTin(h) {
  const s = SC[cur], box = el('thongTinNoiDung');
  let html = `<p class="mota">${s.mota}</p>`;
  if (h) html = (h.zone ? theKhu(ZH[h.zone], h) : `<article class="the"><div class="the-dau"><h3>${h.ten}</h3></div><p>${h.noidung}</p></article>`) + `<button type="button" class="lienket" id="bVeDiem">Xem thông tin cả điểm này</button>`;
  else html += s.zones.map((id) => theKhu(ZH[id])).join('');
  el('thongTinTieuDe').textContent = s.ten; box.innerHTML = html; box.scrollTop = 0;
  const b = el('bVeDiem'); if (b) b.addEventListener('click', () => moThongTin(null));
  boxTT.hidden = false; el('bThongTin').setAttribute('aria-pressed', 'true');
  // điện thoại: tấm thông tin chiếm nửa dưới màn hình nên tạm cất bản đồ
  if (hep()) hienBanDo(false);
}
function dongThongTin() { boxTT.hidden = true; el('bThongTin').setAttribute('aria-pressed', 'false'); }
el('bThongTin').addEventListener('click', () => (boxTT.hidden ? moThongTin(null) : dongThongTin()));
el('bDongThongTin').addEventListener('click', (e) => { e.stopPropagation(); dongThongTin(); });

/* ---------- bản đồ nhỏ ---------- */
const NS = 'http://www.w3.org/2000/svg', svg = el('banDoSvg');
let khuBanDo = null, radar = null;
const MAU_LOAI = { ban: '#E7C873', sach: '#9CCBA4', sao: '#C98E62', vanphong: '#F4EFE3', nghi: '#F4EFE3', an: '#F4EFE3', thay: '#CFE0D3', hanhlang: '#E8E2D2', kho: '#E4A92A', dg: '#F0C978', qc: '#9CCBA4', nha: '#EAD6A2', ngoai: '#D9D4C8' };
function svgEl(tag, at) { const e = document.createElementNS(NS, tag); Object.entries(at).forEach(([k, v]) => e.setAttribute(k, v)); return e; }
function veBanDo(khu) {
  if (khu === khuBanDo) { veDiemBanDo(); return; }
  khuBanDo = khu; const [x0, x1, z0, z1] = V.KHU[khu].box;
  svg.setAttribute('viewBox', `${x0} ${z0} ${x1 - x0} ${z1 - z0}`); svg.innerHTML = '';
  el('banDoTen').textContent = V.KHU[khu].ten;
  document.querySelectorAll('.bd-tab').forEach((b) => b.setAttribute('aria-selected', String(b.dataset.khu === khu)));
  const cat = (b) => b[1] > x0 && b[0] < x1 && b[3] > z0 && b[2] < z1;
  V.DUONG.filter(cat).forEach(([a, b, c, d]) => svg.appendChild(svgEl('rect', { x: a, y: c, width: b - a, height: d - c, class: 'bd-duong' })));
  V.NEN.filter(cat).forEach(([a, b, c, d]) => svg.appendChild(svgEl('rect', { x: a, y: c, width: b - a, height: d - c, class: 'bd-nen' })));
  ZONES.filter((z) => cat(z.box) && z.kind !== 'fence').forEach((z) => {
    const [a, b, c, d] = z.box, l = (V.PHONG[z.id] || {}).loai;
    svg.appendChild(svgEl('rect', { x: a, y: c, width: b - a, height: d - c, class: 'bd-khu', fill: MAU_LOAI[l] || '#C9C6BD' }));
  });
  const g = svgEl('g', { id: 'bdDiem' }); svg.appendChild(g);
  radar = svgEl('path', { class: 'bd-radar', d: '' }); svg.appendChild(radar);
  veDiemBanDo();
}
function veDiemBanDo() {
  const g = el('bdDiem'); if (!g) return; g.innerHTML = '';
  V.SCENES.filter((s) => s.khu === khuBanDo && s.nhom !== 'tong').forEach((s) => {
    const c = svgEl('circle', { cx: s.p[0], cy: s.p[2], r: khuBanDo === 'cu' ? 0.95 : 0.85, class: 'bd-diem' + (s.id === cur ? ' dang' : ''), tabindex: 0, role: 'button', 'aria-label': s.ten });
    const t = svgEl('title', {}); t.textContent = s.ten; c.appendChild(t);
    c.addEventListener('click', () => { dungTour(); denDiem(s.id); });
    c.addEventListener('keydown', (e) => { if (e.key === 'Enter') { dungTour(); denDiem(s.id); } });
    g.appendChild(c);
  });
}
function capNhatRadar() {
  if (!radar) return;
  const s = SC[cur]; if (!s || s.khu !== khuBanDo || s.nhom === 'tong') { radar.setAttribute('d', ''); return; }
  const r = 7, a = (fov * camera.aspect * D2R) / 2, h = Math.min(a, 1.2);
  const p = (g) => [pos.x + Math.sin(g) * r, pos.z - Math.cos(g) * r];
  const [ax, az] = p(yaw - h), [bx2, bz] = p(yaw + h);
  radar.setAttribute('d', `M${pos.x} ${pos.z} L${ax} ${az} A${r} ${r} 0 0 1 ${bx2} ${bz} Z`);
}
document.querySelectorAll('.bd-tab').forEach((b) => b.addEventListener('click', () => { khuBanDo = null; veBanDo(b.dataset.khu); }));
function hienBanDo(co) { boxBD.hidden = !co; el('bBanDo').setAttribute('aria-pressed', String(co)); }
el('bBanDo').addEventListener('click', () => { hienBanDo(boxBD.hidden); if (!boxBD.hidden && hep()) dongThongTin(); });

/* ---------- dải ảnh các điểm ---------- */
function taoDaiAnh() {
  const hang = el('hangAnh'); hang.innerHTML = '';
  V.NHOM.forEach((n) => {
    const nhom = document.createElement('div'); nhom.className = 'nhom'; nhom.innerHTML = `<span class="nhom-ten">${n.ten}</span>`;
    V.SCENES.filter((s) => s.nhom === n.id).forEach((s) => {
      const b = document.createElement('button'); b.type = 'button'; b.className = 'anh'; b.dataset.id = s.id;
      b.innerHTML = `<span class="khung"><img alt="" id="anh-${s.id}"><em>GĐ${s.gd}</em></span><span class="ten">${s.ten}</span>`;
      b.addEventListener('click', () => { dungTour(); denDiem(s.id); });
      nhom.appendChild(b);
    });
    hang.appendChild(nhom);
  });
}
el('bDanhSach').addEventListener('click', () => { const d = el('dai'); d.classList.toggle('thu'); el('bDanhSach').setAttribute('aria-pressed', String(!d.classList.contains('thu'))); doKhung(); });
async function chupAnhNho(baoTien) {
  const c = document.createElement('canvas'); c.width = 240; c.height = 135; const g = c.getContext('2d');
  const giu = { p: pos.clone(), yaw, pitch, fov };
  for (let i = 0; i < V.SCENES.length; i++) {
    const s = V.SCENES[i], h = huongNhin(s);
    pos.copy(v3(s.p)); yaw = h.yaw; pitch = h.pitch; fov = 75; datMatTroi(s.p[0], s.p[2]); apCamera();
    renderer.render(scene, camera);
    const src = renderer.domElement, sw = src.width, sh = src.height, r = Math.max(240 / sw, 135 / sh);
    g.drawImage(src, (sw - 240 / r) / 2, (sh - 135 / r) / 2, 240 / r, 135 / r, 0, 0, 240, 135);
    const img = el('anh-' + s.id); if (img) img.src = c.toDataURL('image/jpeg', 0.78);
    baoTien(i + 1, V.SCENES.length);
    await new Promise((r2) => requestAnimationFrame(r2));
  }
  pos.copy(giu.p); yaw = giu.yaw; pitch = giu.pitch; fov = giu.fov;
}

/* ---------- tham quan tự động ---------- */
function dungTour() { if (!tour) return; tour.huy = true; tour = null; el('bTour').setAttribute('aria-pressed', 'false'); el('phuDe').hidden = true; }
async function chayTour() {
  if (tour) { dungTour(); return; }
  const t = (tour = { huy: false }); el('bTour').setAttribute('aria-pressed', 'true'); dongThongTin();
  let i = Math.max(0, V.TOUR.indexOf(cur));
  if (V.TOUR[i] !== cur) await denDiem(V.TOUR[i]);
  while (!t.huy) {
    const s = SC[cur]; el('phuDeTen').textContent = s.ten; el('phuDeMoTa').textContent = s.mota; el('phuDe').hidden = false;
    // đứng 7 giây mỗi điểm (tính theo đồng hồ, không theo số khung hình nên màn hình 60 Hz hay 144 Hz đều như nhau)
    const h0 = yaw, t0 = performance.now();
    await new Promise((done) => { const buoc = () => { if (t.huy) return done(); const da = performance.now() - t0; yaw = h0 + Math.sin(da / 2000) * 0.5; if (da > 7000) return done(); requestAnimationFrame(buoc); }; requestAnimationFrame(buoc); });
    if (t.huy) break;
    i = (i + 1) % V.TOUR.length; const next = V.TOUR[i], hs = SC[cur].di.find((d) => d.toi === next);
    await denDiem(next, hs);
  }
}
el('bTour').addEventListener('click', chayTour);

/* ---------- nút khác ---------- */
el('bXoay').addEventListener('click', () => { tuXoay = !tuXoay; el('bXoay').setAttribute('aria-pressed', String(tuXoay)); idle = tuXoay ? 99 : 0; });
// iPhone không cho trang web mở toàn màn hình nên ẩn nút; iPad, máy tính dùng được (Safari cần tiền tố webkit)
const DOC = document, RT = DOC.documentElement;
const moToanMan = RT.requestFullscreen || RT.webkitRequestFullscreen, thoatToanMan = DOC.exitFullscreen || DOC.webkitExitFullscreen;
if (!moToanMan || DOC.fullscreenEnabled === false || DOC.webkitFullscreenEnabled === false) el('bToanMan').hidden = true;
el('bToanMan').addEventListener('click', () => {
  let p;
  try { p = (DOC.fullscreenElement || DOC.webkitFullscreenElement) ? thoatToanMan.call(DOC) : moToanMan.call(RT); } catch (e) { p = Promise.reject(e); }
  Promise.resolve(p).catch(() => baoNhanh('Trình xem này không cho mở toàn màn hình.'));
});
function baoNhanh(t, ms) { const b = el('baoNhanh'); b.textContent = t; b.hidden = false; clearTimeout(baoNhanh.h); baoNhanh.h = setTimeout(() => { b.hidden = true; }, ms || 3000); }

/* ---------- vòng lặp ---------- */
const clock = new THREE.Clock();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.1), now = performance.now();
  if (tween) buocTween(now, dt);
  else {
    if (!keo.size && (vYaw || vPitch)) { yaw += vYaw * dt; pitch = Math.max(-1.45, Math.min(1.45, pitch + vPitch * dt)); const k = Math.exp(-dt * 4); vYaw *= k; vPitch *= k; if (Math.abs(vYaw) + Math.abs(vPitch) < 0.002) vYaw = vPitch = 0; }
    idle += dt;
    if (tuXoay && !tour && !reduce && idle > 7 && !keo.size && boxTT.hidden) yaw += dt * 0.06;
  }
  apCamera();
  renderer.render(scene, camera);
  chieuDiemNong(); capNhatRadar();
}

/* ---------- khởi động ---------- */
async function batDau() {
  fit();
  if (hep() || window.innerHeight <= 560) hienBanDo(false);
  const logo = el('logoNho'), lc = document.createElement('canvas'); lc.width = 520; lc.height = 190;
  const veLogos = () => {
    const g = lc.getContext('2d'); g.clearRect(0, 0, lc.width, lc.height); W.veLogo(g, 260, 118, 100, true); logo.src = lc.toDataURL();
    const big = el('logoLon'), bc = document.createElement('canvas'); bc.width = 900; bc.height = 330; W.veLogo(bc.getContext('2d'), 450, 205, 172, true); big.src = bc.toDataURL();
  };
  el('trangThai').textContent = 'Đang dựng mô hình nhà máy…';
  await new Promise((r) => requestAnimationFrame(r));
  const kq = await W.build(scene, renderer); troi = kq.troi; ZONES = kq.zones;
  veLogos();
  taoDaiAnh();
  await chupAnhNho((i, n) => { el('trangThai').textContent = `Đang chuẩn bị ảnh các điểm tham quan (${i}/${n})…`; });
  const tu = (location.hash || '').slice(1), dau = SC[tu] ? tu : V.SCENES[0].id, s = SC[dau], h = huongNhin(s);
  pos.copy(v3(s.p)); yaw = h.yaw; pitch = h.pitch; fov = s.fov || 75; vaoDiem(dau);
  frame();
  el('trangThai').textContent = 'Sẵn sàng. Kéo để nhìn quanh, bấm mũi tên để đi tiếp.';
  ['bBatDau', 'bBatDauTour'].forEach((id) => { el(id).disabled = false; });
}
function vaoTour(tuDong) {
  el('chao').classList.add('xong'); setTimeout(() => { el('chao').hidden = true; }, 500);
  idle = 0; if (tuDong) chayTour(); else el('canvasGoiY').hidden = false;
  setTimeout(() => { el('canvasGoiY').hidden = true; }, 6000);
}
el('bBatDau').addEventListener('click', () => vaoTour(false));
el('bBatDauTour').addEventListener('click', () => vaoTour(true));
batDau();
window.__thamQuan = { denDiem, vaoDiem: (id) => chuyenToi(id), diem: () => cur, nhin: (y, p) => { yaw = y * D2R; pitch = p * D2R; }, sanSang: () => !el('bBatDau').disabled };
})();
