/* HRMS 3.0 – Hệ thống Quản lý Nguồn nhân lực cho Nhà máy điện · phong cách "Digital Power Grid".
   Toàn bộ chuyển động nằm trên một GSAP timeline dừng sẵn; các hiệu ứng canvas (lưới mạch, tia điện)
   là hàm thuần của thời gian t (UPD) để render từng khung hình tất định qua window.__seek(t). */
gsap.ticker.lagSmoothing(0);
gsap.defaults({ ease: 'power3.out' });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const master = gsap.timeline({ paused: true });
const MARKS = [];
const UPD = [];
const FX = [];
const cue = (t, type) => MARKS.push({ t: +t.toFixed(3), type });
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease3 = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const inOut2 = (v) => { v = clamp01(v); return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; };
const OR = '#FF7A1A', EL = '#4DB8FF';

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (a, b) => { let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 7, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
function svg(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
}
function div(cls, parent, html = '') { const d = document.createElement('div'); d.className = cls; d.innerHTML = html; if (parent) parent.appendChild(d); return d; }
const el = (x) => (typeof x === 'string' ? $(x) : x);
const els = (x) => (typeof x === 'string' ? $$(x) : [].concat(x));

/* ---------- chữ ---------- */
function splitWords(node0) {
  const out = [];
  const walk = (node) => {
    [...node.childNodes].forEach((ch) => {
      if (ch.nodeType === 3) {
        const frag = document.createDocumentFragment();
        ch.textContent.split(/(\s+)/).forEach((p) => {
          if (!p) return;
          if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(' ')); return; }
          const w = document.createElement('span'); w.className = 'w';
          const i = document.createElement('span'); i.className = 'wi'; i.textContent = p;
          w.appendChild(i); frag.appendChild(w); out.push(i);
        });
        node.replaceChild(frag, ch);
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && !ch.classList.contains('ic')) walk(ch);
    });
  };
  walk(node0);
  return out;
}
function words(sel, at, o = {}) {
  const ws = splitWords(el(sel));
  master.fromTo(ws, { yPercent: 118, rotate: o.rot ?? 3 },
    { yPercent: 0, rotate: 0, duration: o.dur ?? 0.8, ease: 'power4.out', stagger: o.stagger ?? 0.04 }, at);
  return ws;
}
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+<>/=';
function scramble(sel, at, dur = 1.0) { // chữ "giải mã": ký tự nhiễu rồi chốt dần từ trái sang phải
  const root = el(sel), nodes = [];
  const walk = (n) => n.childNodes.forEach((c) => { if (c.nodeType === 3 && c.data.trim()) nodes.push(c); else if (c.nodeType === 1 && !c.classList.contains('ic')) walk(c); });
  walk(root);
  const finals = nodes.map((n) => n.data), total = finals.reduce((s, f) => s + f.length, 0);
  const seedBase = Math.floor(at * 97);
  UPD.push((t) => {
    let idx = 0;
    const f = Math.floor(t * 30);
    nodes.forEach((n, k) => {
      const src = finals[k]; let s = '';
      for (let i = 0; i < src.length; i++, idx++) {
        const ch = src[i];
        const a = at + (idx / total) * dur * 0.6, r = a + dur * 0.4;
        if (t >= r || ch === ' ') s += ch;
        else if (t >= a) s += GLYPHS[Math.floor(hash(idx + seedBase, f) * GLYPHS.length)];
        else s += ' ';
      }
      if (n.data !== s) n.data = s;
    });
  });
  cue(at, 'type');
}
function glitch(sel, at, dur = 0.4, amp = 8) {
  const k = [
    { x: -amp, skewX: 8, textShadow: `${amp}px 0px 0px ${OR}, ${-amp}px 0px 0px ${EL}` },
    { x: amp * 0.8, skewX: -6, textShadow: `${-amp * 0.6}px 0px 0px ${OR}, ${amp * 0.6}px 0px 0px ${EL}` },
    { x: -amp * 0.4, skewX: 3, textShadow: `${amp * 0.3}px 0px 0px ${OR}, ${-amp * 0.3}px 0px 0px ${EL}` },
    { x: 0, skewX: 0, textShadow: '0px 0px 0px rgba(0,0,0,0), 0px 0px 0px rgba(0,0,0,0)' },
  ];
  master.to(sel, { keyframes: k.map((v, i) => ({ ...v, duration: i === 3 ? dur * 0.4 : dur * 0.2 })), ease: 'none' }, at);
  cue(at, 'glitch');
}
function typeText(elm, txt, at, dur) { // gõ chữ từng ký tự, có con trỏ nháy
  const e = el(elm), old = e.textContent;
  UPD.push((t) => {
    let s;
    if (t < at) s = old;
    else if (t >= at + dur + 0.35) s = txt;
    else { const n = Math.min(txt.length, Math.floor(((t - at) / dur) * txt.length)); s = txt.slice(0, n) + (Math.floor(t * 4) % 2 ? '▍' : ' '); }
    if (e.textContent !== s) e.textContent = s;
  });
  cue(at, 'type');
}

/* ---------- chuyển động ---------- */
function up(sel, at, o = {}) {
  master.fromTo(sel, { y: o.y ?? 36, x: o.x ?? 0, autoAlpha: 0 },
    { y: 0, x: 0, autoAlpha: 1, duration: o.dur ?? 0.75, stagger: o.stagger ?? 0.1, ease: o.ease ?? 'power3.out' }, at);
}
function pop(sel, at, o = {}) {
  master.fromTo(sel, { scale: o.from ?? 0.6, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: o.dur ?? 0.6, stagger: o.stagger ?? 0.1, ease: o.ease ?? 'back.out(1.8)' }, at);
}
function kicker(sel, at) {
  master.fromTo(sel, { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, at);
  scramble(sel, at, 0.9);
}
function head(n, at) { kicker(`.s${n}-k`, at + 0.05); words(`.s${n}-h`, at + 0.1); }
const show = (s, at) => master.set(s, { visibility: 'visible' }, at);
const hide = (s, at) => master.set(s, { visibility: 'hidden' }, at);
const dots = (v) => String(Math.round(v)).replace(/\B(?=(\d{3})+(?!\d))/g, '.');
function counter(elm, from, to, at, dur, fmt = (v) => Math.round(v)) {
  const o = { v: from }, e = el(elm);
  master.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { e.textContent = fmt(o.v); } }, at);
}
function draw(path, at, dur, ease = 'power2.inOut') {
  els(path).forEach((p) => {
    const L = p.getTotalLength();
    master.fromTo(p, { strokeDasharray: `${L} ${L}`, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease }, at);
  });
}
function reveal(sel, at, dur = 0.9, dir = 'left') {
  const from = { left: 'inset(0 100% 0 0)', top: 'inset(0 0 100% 0)', bottom: 'inset(100% 0 0 0)', center: 'inset(0 50% 0 50%)' }[dir];
  master.fromTo(sel, { clipPath: from, autoAlpha: 1 }, { clipPath: 'inset(0 0% 0 0%)', duration: dur, ease: 'power3.inOut' }, at);
  master.set(sel, { clearProps: 'clipPath' }, at + dur + 0.01);
}
function flow(sel, at, speed = 140) { // dòng năng lượng chạy dọc đường dẫn (stroke-dash)
  const list = els(sel);
  master.to(list, { opacity: 1, duration: 0.4, ease: 'none' }, at);
  UPD.push((t) => { const v = -Math.max(0, t - at) * speed; list.forEach((e) => { e.style.strokeDashoffset = v; }); });
}
function wirePair(svgEl, d, cls = '') { // dây nền + lớp năng lượng
  return { w: svg('path', { d, class: `w ${cls}` }, svgEl), e: svg('path', { d, class: `e ${cls}` }, svgEl) };
}

/* ---------- tia điện (canvas #fx) ---------- */
function boltPts(x1, y1, x2, y2, R, disp, depth = 6) {
  let pts = [[x1, y1], [x2, y2]];
  for (let d = 0; d < depth; d++) {
    const np = [pts[0]];
    for (let i = 1; i < pts.length; i++) {
      const [ax, ay] = pts[i - 1], [bx, by] = pts[i];
      const dx = bx - ax, dy = by - ay, L = Math.hypot(dx, dy) || 1, off = (R() - 0.5) * disp;
      np.push([(ax + bx) / 2 - (dy / L) * off, (ay + by) / 2 + (dx / L) * off], [bx, by]);
    }
    pts = np; disp *= 0.55;
  }
  return pts;
}
function strokeBolt(g, pts, a = 1) {
  const path = () => { g.beginPath(); g.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) g.lineTo(pts[i][0], pts[i][1]); };
  g.lineCap = 'round'; g.lineJoin = 'round';
  g.strokeStyle = `rgba(255,122,26,${0.2 * a})`; g.lineWidth = 12; path(); g.stroke();
  g.strokeStyle = `rgba(255,196,120,${0.55 * a})`; g.lineWidth = 5; path(); g.stroke();
  g.strokeStyle = `rgba(255,255,255,${0.95 * a})`; g.lineWidth = 1.8; path(); g.stroke();
}
function sparks(x, y, at, o = {}) { // tia điện toả ra quanh một điểm
  const dur = o.dur ?? 0.45, n = o.n ?? 6, r0 = o.r0 ?? 20, r1 = o.r1 ?? 100;
  FX.push({ t0: at, t1: at + dur, fn: (g, t) => {
    const f = Math.floor(t * 15), a = 1 - (t - at) / dur;
    const R = rng(f * 131 + Math.round(x * 7 + y));
    for (let i = 0; i < n; i++) {
      const an = R() * 6.283, rr = r0 + (r1 - r0) * (0.55 + 0.45 * R());
      strokeBolt(g, boltPts(x + Math.cos(an) * r0, y + Math.sin(an) * r0, x + Math.cos(an) * rr, y + Math.sin(an) * rr, R, (rr - r0) * 0.6, 4), a);
    }
  } });
  if (!o.silent) cue(at, 'zap');
}
function arc(x1, y1, x2, y2, at, dur = 0.5) { // hồ quang giữa hai điểm
  FX.push({ t0: at, t1: at + dur, fn: (g, t) => {
    const R = rng(Math.floor(t * 20) * 97 + Math.round(x1 + y2));
    const a = 1 - Math.pow((t - at) / dur, 2);
    strokeBolt(g, boltPts(x1, y1, x2, y2, R, Math.hypot(x2 - x1, y2 - y1) * 0.25, 5), a);
  } });
}

/* ---------- chuyển cảnh ---------- */
const BLOCKS = [];
function buildBlocks() {
  const B = $('#blocks');
  for (let r = 0; r < 14; r++) for (let c = 0; c < 24; c++) { const i = document.createElement('i'); i.style.left = `${c * 81}px`; i.style.top = `${r * 78}px`; B.appendChild(i); BLOCKS.push(i); }
}
function swap(prev, next, at) { if (prev) hide(prev, at); show(next, at); }
function blockWipe(at, prev, next) {
  master.set('#blocks', { visibility: 'visible' }, at);
  master.fromTo(BLOCKS, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.2, ease: 'power2.out', stagger: { grid: [14, 24], from: [0.5, 0], amount: 0.42 } }, at);
  swap(prev, next, at + 0.62);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.3, duration: 0.08, yoyo: true, repeat: 1 }, at + 0.58);
  master.to(BLOCKS, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.2, ease: 'power2.in', stagger: { grid: [14, 24], from: [0.5, 0], amount: 0.42 } }, at + 0.66);
  master.set('#blocks', { visibility: 'hidden' }, at + 1.3);
  cue(at, 'whoosh'); cue(at + 0.55, 'glitch');
  return at + 0.62;
}
function glitchCut(at, prev, next) {
  master.to(prev, { keyframes: [{ x: -24, filter: 'hue-rotate(40deg) saturate(2)', duration: 0.06 }, { x: 18, duration: 0.06 }, { x: -8, duration: 0.06 }], ease: 'none' }, at);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.5, duration: 0.07, yoyo: true, repeat: 1 }, at + 0.14);
  swap(prev, next, at + 0.18);
  master.set(prev, { x: 0, filter: 'none' }, at + 0.2);
  master.fromTo(next, { x: 20, filter: 'hue-rotate(-40deg) saturate(2)' }, { x: 0, filter: 'hue-rotate(0deg) saturate(1)', duration: 0.25, ease: 'steps(4)' }, at + 0.18);
  master.set(next, { clearProps: 'filter' }, at + 0.45);
  master.set(prev, { clearProps: 'filter,transform' }, at + 0.46);
  cue(at, 'glitch'); cue(at, 'swish');
  return at + 0.2;
}
// "xung điện": một vệt sét quét ngang màn hình, cảnh mới hiện ra phía sau vệt sét
const SURGES = [];
function surge(at, prev, next, D = 0.7) {
  show(next, at); hide(prev, at + D);
  SURGES.push({ at, D, prev: $(prev), next: $(next), on: false });
  master.set('#beam', { visibility: 'visible' }, at);
  master.set('#beam', { visibility: 'hidden' }, at + D);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.35, duration: 0.06, yoyo: true, repeat: 1 }, at + D * 0.45);
  FX.push({ t0: at, t1: at + D, fn: (g, t) => {
    const x = inOut2((t - at) / D) * 1920, R = rng(Math.floor(t * 30) * 7 + 3);
    for (let i = 0; i < 3; i++) strokeBolt(g, boltPts(x + (R() - 0.5) * 50, -20, x + (R() - 0.5) * 50, 1100, R, 150, 7), 0.9);
    for (let i = 0; i < 5; i++) { const y = R() * 1080; strokeBolt(g, boltPts(x, y, x - 80 - R() * 200, y + (R() - 0.5) * 180, R, 70, 4), 0.55); }
  } });
  cue(at, 'zap'); cue(at, 'whoosh');
  return at + D * 0.55;
}
UPD.push((t) => {
  SURGES.forEach((s) => { if ((t < s.at || t > s.at + s.D) && s.on) { s.prev.style.clipPath = ''; s.next.style.clipPath = ''; s.on = false; } });
  SURGES.forEach((s) => {
    if (t < s.at || t > s.at + s.D) return;
    const p = inOut2((t - s.at) / s.D) * 100;
    s.next.style.clipPath = `inset(0 ${100 - p}% 0 0)`; s.prev.style.clipPath = `inset(0 0 0 ${p}%)`;
    $('#beam').style.left = `${p * 19.2}px`; s.on = true;
  });
});
// mở cảnh dạng vòng tròn loang ra từ một nút (cảnh cũ bị khoét lỗ tương ứng để không chồng hình)
const IRIS = [];
function iris(at, prev, next, x, y, D = 0.8) {
  show(next, at); hide(prev, at + D);
  IRIS.push({ at, D, x, y, prev: $(prev), next: $(next), on: false });
  FX.push({ t0: at, t1: at + D, fn: (g, t) => {
    const k = (t - at) / D, r = 2300 * k * k;
    g.lineWidth = 6; g.strokeStyle = `rgba(255,190,120,${0.9 * (1 - k * 0.5)})`; g.shadowColor = OR; g.shadowBlur = 24;
    g.beginPath(); g.arc(x, y, Math.max(1, r), 0, 6.283); g.stroke(); g.shadowBlur = 0;
  } });
  sparks(x, y, at, { r0: 30, r1: 150, n: 8, dur: 0.5, silent: true });
  cue(at, 'zap'); cue(at, 'swish');
  return at + D * 0.6;
}
UPD.push((t) => {
  IRIS.forEach((s) => { if ((t < s.at || t > s.at + s.D) && s.on) { s.prev.style.webkitMaskImage = ''; s.next.style.clipPath = ''; s.on = false; } });
  IRIS.forEach((s) => {
    if (t < s.at || t > s.at + s.D) return;
    const k = (t - s.at) / s.D, r = 2300 * k * k;
    s.next.style.clipPath = `circle(${r.toFixed(1)}px at ${s.x}px ${s.y}px)`;
    s.prev.style.webkitMaskImage = `radial-gradient(circle at ${s.x}px ${s.y}px, transparent ${r.toFixed(1)}px, #000 ${(r + 1.5).toFixed(1)}px)`;
    s.on = true;
  });
});

/* ---------- nền: lưới mạch điện + cột điện ---------- */
const BG = { trace: 0.35, pulse: 0, flick: 1, tower: 0.28, towerE: 0, floor: 0.25 };
const bg = (at, o, dur = 0.8) => master.to(BG, { ...o, duration: dur, ease: 'none' }, at);
function buildNet() {
  const cv = $('#net'), g = cv.getContext('2d'), R = rng(7), S = 30, TR = [];
  const dirs = [[1, 0], [1, 1], [0, 1], [-1, 1], [-1, 0], [-1, -1], [0, -1], [1, -1]];
  for (let i = 0; i < 70; i++) {
    let x = Math.round(R() * 64) * S, y = Math.round(R() * 36) * S, d = Math.floor(R() * 4) * 2;
    const pts = [[x, y]], n = 3 + Math.floor(R() * 4);
    for (let s = 0; s < n; s++) {
      const len = (2 + Math.floor(R() * 6)) * S * (d % 2 ? 0.6 : 1);
      x += dirs[d][0] * len; y += dirs[d][1] * len; pts.push([x, y]);
      d = (d + (R() < 0.5 ? 1 : 7)) % 8;
    }
    const cum = [0];
    for (let k = 1; k < pts.length; k++) cum.push(cum[k - 1] + Math.hypot(pts[k][0] - pts[k - 1][0], pts[k][1] - pts[k - 1][1]));
    TR.push({ pts, cum, L: cum[cum.length - 1], sp: 150 + R() * 170, ph: R() * 2000, blue: R() < 0.3 });
  }
  const off = document.createElement('canvas'); off.width = 1920; off.height = 1080;
  const o = off.getContext('2d');
  o.lineWidth = 1.6; o.strokeStyle = 'rgba(96,150,255,.22)'; o.lineJoin = 'round';
  TR.forEach(({ pts }) => {
    o.beginPath(); o.moveTo(pts[0][0], pts[0][1]); pts.forEach((p) => o.lineTo(p[0], p[1])); o.stroke();
    [pts[0], pts[pts.length - 1]].forEach((p) => { o.beginPath(); o.arc(p[0], p[1], 4, 0, 6.283); o.stroke(); });
    pts.slice(1, -1).forEach((p, k) => { if (k % 2 === 0) o.fillStyle = 'rgba(96,150,255,.28)', o.fillRect(p[0] - 2, p[1] - 2, 4, 4); });
  });
  const at = (tr, d) => {
    d = Math.max(0, Math.min(tr.L, d));
    let k = 1; while (k < tr.cum.length - 1 && tr.cum[k] < d) k++;
    const a = tr.pts[k - 1], b = tr.pts[k], u = (d - tr.cum[k - 1]) / ((tr.cum[k] - tr.cum[k - 1]) || 1);
    return [a[0] + (b[0] - a[0]) * u, a[1] + (b[1] - a[1]) * u];
  };
  UPD.push((t) => {
    g.clearRect(0, 0, 1920, 1080);
    const fl = BG.flick > 0.01 ? 1 - BG.flick * 0.65 * hash(Math.floor(t * 15), 5) : 1;
    g.globalAlpha = BG.trace * fl; g.drawImage(off, 0, 0);
    if (BG.pulse > 0.01) {
      g.lineCap = 'round';
      TR.forEach((tr) => {
        const cyc = tr.L + 700, h = (t * tr.sp + tr.ph) % cyc;
        if (h > tr.L + 90) return;
        const col = tr.blue ? '120,200,255' : '255,160,80';
        for (let s = 0; s < 6; s++) {
          const p0 = at(tr, h - 90 + s * 15), p1 = at(tr, h - 90 + (s + 1) * 15);
          g.strokeStyle = `rgba(${col},${((s + 1) / 6) * BG.pulse})`; g.lineWidth = 1.5 + s * 0.5;
          g.beginPath(); g.moveTo(p0[0], p0[1]); g.lineTo(p1[0], p1[1]); g.stroke();
        }
        if (h <= tr.L) { const p = at(tr, h); g.fillStyle = `rgba(255,255,255,${0.9 * BG.pulse})`; g.beginPath(); g.arc(p[0], p[1], 2.6, 0, 6.283); g.fill(); }
      });
    }
    g.globalAlpha = 1;
  });
  UPD.push((t) => {
    $('#floor').style.opacity = BG.floor;
    $('#floor .grid').style.backgroundPosition = `0px ${(t * 45) % 90}px`;
    const s = Math.floor(t), fr = Math.floor((t - s) * 30);
    $('#hud .tc').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
  });
}
function buildTowers() {
  const S = $('#towers'), base = 1030, h = 330, xs = [-280, 140, 560, 980, 1400, 1820, 2240];
  const gT = svg('g', {}, S), gW = svg('g', {}, S), gE = svg('g', {}, S);
  const attach = (x) => [[x - 0.3 * h, base - 0.70 * h + 18], [x + 0.3 * h, base - 0.70 * h + 18], [x - 0.22 * h, base - 0.84 * h + 18], [x + 0.22 * h, base - 0.84 * h + 18], [x, base - h]];
  xs.forEach((x, i) => {
    if (x > 0 && x < 1920) {
      const bw = 0.15 * h, tw = 0.035 * h, yt = base - 0.82 * h, lx = (f) => x - bw + (bw - tw) * f, rx = (f) => x + bw - (bw - tw) * f;
      let d = `M${x - bw} ${base} L${x - tw} ${yt} L${x} ${base - h} L${x + tw} ${yt} L${x + bw} ${base}`;
      for (let k = 0; k < 6; k++) {
        const f0 = k / 6, f1 = (k + 1) / 6, y0 = base - (base - yt) * f0, y1 = base - (base - yt) * f1;
        d += ` M${lx(f0)} ${y0} L${rx(f1)} ${y1} M${rx(f0)} ${y0} L${lx(f1)} ${y1} M${lx(f1)} ${y1} L${rx(f1)} ${y1}`;
      }
      [[0.70, 0.3], [0.84, 0.22]].forEach(([fy, hw]) => {
        const y = base - fy * h, f = (base - y) / (base - yt);
        d += ` M${x - hw * h} ${y} L${x + hw * h} ${y} M${x - hw * h} ${y} L${lx(f)} ${y + 0.07 * h} M${x + hw * h} ${y} L${rx(f)} ${y + 0.07 * h}`;
        d += ` M${x - hw * h} ${y} v18 M${x + hw * h} ${y} v18`;
      });
      svg('path', { d, class: 'tw' }, gT);
    }
    if (i < xs.length - 1) {
      const A = attach(x), B = attach(xs[i + 1]);
      A.forEach((p, k) => {
        const q = B[k], sag = k === 4 ? 30 : 46, wd = `M${p[0]} ${p[1]} Q${(p[0] + q[0]) / 2} ${(p[1] + q[1]) / 2 + sag * 2} ${q[0]} ${q[1]}`;
        svg('path', { d: wd, class: 'wr' }, gW);
        if (k < 4 && (k + i) % 2 === 0) svg('path', { d: wd, class: 'we' }, gE);
      });
    }
  });
  const we = $$('.we', gE);
  UPD.push((t) => {
    S.style.opacity = BG.tower; gE.style.opacity = BG.towerE;
    we.forEach((p, k) => { p.style.strokeDashoffset = -(t * 160 + k * 37); });
  });
}

/* ================= CẢNH ================= */
function S1(t) { // mở đầu: hồ sơ giấy, dữ liệu phân mảnh
  show('#s1', 0);
  const box = $('.s1-docs');
  const P = [[150, 120, -12], [430, 250, 9], [700, 100, -5], [1080, 130, 6], [1350, 240, -8], [1640, 110, 11], [150, 740, 7], [430, 840, -10],
    [710, 770, 4], [1090, 810, -6], [1360, 740, 9], [1650, 780, -4], [40, 430, 5], [1770, 440, -7]];
  const TAGS = { 1: 'TRỄ HẠN NÂNG LƯƠNG', 4: 'CHỜ KÝ DUYỆT', 7: 'THIẾU CHỨNG CHỈ AN TOÀN', 10: 'HỒ SƠ CHƯA CẬP NHẬT', 3: 'SAI LỆCH DỮ LIỆU' };
  const docs = P.map(([x, y, r], i) => {
    const d = div('doc', box, '<i></i><i></i><i></i><i style="width:70%"></i><i></i><i style="width:45%"></i>');
    d.style.left = `${x}px`; d.style.top = `${y}px`; d.style.transform = `rotate(${r}deg)`;
    if (TAGS[i]) div('tg', d, TAGS[i]);
    return { d, x, y, r };
  });
  docs.forEach(({ d, x, y, r }, i) => {
    const cx = x + 64 - 960, cy = y + 84 - 540;
    master.fromTo(d, { x: cx * 0.8, y: cy * 0.8, rotation: r * 3, scale: 1.4, autoAlpha: 0 }, { x: 0, y: 0, rotation: r, scale: 1, autoAlpha: 1, duration: 1.0, ease: 'power3.out' }, t + 0.1 + i * 0.05);
  });
  master.fromTo('.s1-docs', { scale: 1 }, { scale: 1.07, duration: 7.5, ease: 'none' }, t);
  master.fromTo('.doc .tg', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(3)', stagger: 0.12 }, t + 1.3);
  cue(t + 1.3, 'alarm');
  master.to('.doc .tg', { keyframes: [{ opacity: 0.3, duration: 0.08 }, { opacity: 1, duration: 0.08 }, { opacity: 0.4, duration: 0.1 }, { opacity: 1, duration: 0.1 }], stagger: 0.2 }, t + 2.4);
  // liên kết đứt gãy giữa các hồ sơ
  const L = $('.s1-links'), pairs = [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [9, 10], [10, 11], [2, 3], [8, 9]], lines = [];
  pairs.forEach(([a, b]) => {
    const A = docs[a], B = docs[b], ax = A.x + 64, ay = A.y + 84, bx = B.x + 64, by = B.y + 84, mx = (ax + bx) / 2, my = (ay + by) / 2;
    lines.push(svg('line', { x1: ax, y1: ay, x2: mx - (bx - ax) * 0.08, y2: my - (by - ay) * 0.08 }, L), svg('line', { x1: mx + (bx - ax) * 0.08, y1: my + (by - ay) * 0.08, x2: bx, y2: by }, L));
  });
  master.fromTo(lines, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, t + 1.0);
  UPD.push((tt) => { if (tt > 8) return; const f = Math.floor(tt * 12); lines.forEach((l, i) => { l.style.strokeOpacity = hash(f, i) > 0.3 ? 1 : 0.15; }); });
  // chữ
  words('.s1-a', t + 0.4); cue(t + 0.4, 'swish');
  master.to('.s1-a', { y: -50, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, t + 2.5);
  words('.s1-b', t + 2.8);
  master.to('.s1-b', { y: -50, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, t + 4.9);
  master.to(docs.map((d) => d.d), { opacity: 0.45, duration: 0.6 }, t + 5.0);
  words('.s1-c', t + 5.2); words('.s1-d', t + 5.7);
  glitch('.s1-d .el', t + 6.5, 0.45, 10);
  master.to(docs.map((d) => d.d), { x: (i) => 896 - docs[i].x, y: (i) => 456 - docs[i].y, scale: 0.2, rotation: 0, autoAlpha: 0, duration: 0.6, ease: 'power3.in', stagger: 0.02 }, t + 6.9);
  master.to(lines, { autoAlpha: 0, duration: 0.3 }, t + 6.9);
  cue(t + 6.9, 'swish');
  return t + 7.6;
}

function S2(t) { // tiêu đề + logo EVNICT lắp ráp
  bg(t - 0.35, { pulse: 1, flick: 0, trace: 0.8, tower: 0.6, towerE: 1, floor: 0.45 }, 0.6);
  cue(t - 0.35, 'power');
  const L = '.s2-lock';
  master.set(L, { x: -460, y: 40 }, 0);
  master.fromTo('.s2-disc', { scale: 0 }, { scale: 1, duration: 0.55, ease: 'back.out(1.6)' }, t);
  const ring = $('.s2-disc .l-ring'), t0 = t + 0.2;
  UPD.push((tt) => { const a = ease3((tt - t0) / 0.6) * 360; ring.style.webkitMaskImage = `conic-gradient(from 0deg, #000 ${a}deg, transparent ${a}deg)`; });
  master.fromTo('.s2-disc .l-b', { scale: 0, rotation: -180 }, { scale: 1, rotation: 0, duration: 0.7, ease: 'back.out(1.4)' }, t + 0.45);
  master.fromTo('.s2-disc .l-r', { scale: 0, rotation: 120 }, { scale: 1, rotation: 0, duration: 0.55, ease: 'back.out(1.4)' }, t + 0.7);
  master.fromTo('.s2-disc .l-y', { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(3)' }, t + 0.95);
  const T = t + 1.15;
  cue(T, 'downbeat'); cue(T, 'sec_groove');
  master.fromTo('.s2-shock', { scale: 1, opacity: 1 }, { scale: 2.0, opacity: 0, duration: 1.1, ease: 'power2.out', stagger: 0.18 }, T);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.35, duration: 0.07, yoyo: true, repeat: 1 }, T);
  sparks(960, 490, T, { r0: 225, r1: 380, n: 10, dur: 0.55, silent: true });
  master.fromTo('.s2-rings', { scale: 0.6, autoAlpha: 0, rotation: -60 }, { scale: 1, autoAlpha: 1, rotation: 0, duration: 1.2 }, T);
  const tk = $('.s2-rings .ticks');
  for (let i = 0; i < 60; i++) { const a = (i / 60) * 6.283, r0 = 212, r1 = i % 5 ? 220 : 228; svg('line', { x1: 300 + Math.cos(a) * r0, y1: 300 + Math.sin(a) * r0, x2: 300 + Math.cos(a) * r1, y2: 300 + Math.sin(a) * r1 }, tk); }
  const r1 = $('.s2-rings .r1'), r2 = $('.s2-rings .r2'), r0 = $('.s2-rings .r0');
  UPD.push((tt) => { r1.setAttribute('transform', `rotate(${tt * 22} 300 300)`); r2.setAttribute('transform', `rotate(${-tt * 12} 300 300)`); r0.setAttribute('transform', `rotate(${tt * 6} 300 300)`); });
  reveal('.s2-word', t + 1.55, 0.6, 'center'); cue(t + 1.55, 'swish');
  master.to(L, { x: 0, y: 0, duration: 1.1, ease: 'power3.inOut' }, t + 2.7); cue(t + 2.7, 'whoosh');
  kicker('.s2-k', t + 3.2);
  words('.s2-h', t + 3.35);
  master.fromTo('.s2-big', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, t + 3.9);
  scramble('.s2-big .grad', t + 3.9, 1.0);
  glitch('.s2-big', t + 5.0, 0.4, 12); cue(t + 5.0, 'hit');
  words('.s2-sub', t + 4.8, { stagger: 0.03 });
  up('.s2-chips span', t + 5.7, { stagger: 0.1, y: 24 });
  [0, 1, 2, 3].forEach((i) => cue(t + 5.75 + i * 0.1, 'pop'));
  return t + 9.0;
}

function S3(t) { // con số: 100% · 97.000 · vận hành
  cue(t, 'sec_tension');
  master.set('#bug', { visibility: 'visible' }, t);
  master.fromTo('#bug', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.6 }, t + 0.2);
  bg(t, { trace: 0.5, tower: 0.12, towerE: 0, floor: 0.3 }, 0.6);
  head(3, t);
  glitch('.s3-h .cu', t + 1.1, 0.4, 8);
  const C = 2 * Math.PI * 120, A = C * 0.75;
  $$('.s3-cards .g').forEach((g, i) => {
    const tr = $('.tr', g), fl = $('.fl', g), tk = $('.tk', g);
    [tr, fl].forEach((c) => { c.setAttribute('stroke-dasharray', `${A} ${C}`); c.setAttribute('transform', 'rotate(135 150 150)'); });
    for (let k = 0; k <= 27; k++) { const a = ((135 + (k / 27) * 270) * Math.PI) / 180; svg('line', { x1: 150 + Math.cos(a) * 140, y1: 150 + Math.sin(a) * 140, x2: 150 + Math.cos(a) * (k % 9 ? 146 : 152), y2: 150 + Math.sin(a) * (k % 9 ? 146 : 152) }, tk); }
    master.fromTo(fl, { strokeDashoffset: A }, { strokeDashoffset: 0, duration: 2.0, ease: 'power2.out' }, t + 1.2 + i * 0.3);
  });
  up('.s3-cards > div', t + 0.8, { stagger: 0.15, y: 50 });
  counter('.g1 .v', 0, 100, t + 1.2, 2.0);
  counter('.g2 .v', 0, 97000, t + 1.5, 2.0, dots);
  cue(t + 1.2, 'scan');
  up('.ops .op', t + 2.3, { stagger: 0.35, x: 30, y: 0 });
  [0, 1, 2].forEach((i) => cue(t + 2.35 + i * 0.35, 'tick'));
  master.to('.ops .op .ic', { scale: 1.2, duration: 0.25, yoyo: true, repeat: 1, stagger: 0.35 }, t + 2.5);
  return t + 9.5;
}

function S4(t) { // kiến trúc hợp nhất – lưới điện số
  cue(t, 'sec_main'); cue(t, 'hit');
  bg(t, { trace: 0.45, tower: 0, floor: 0.25 }, 0.6);
  head(4, t);
  const W = $('.s4-wires'), Y = [405, 505, 605, 705];
  const st = [
    [wirePair(W, 'M270 364 V390')],
    [wirePair(W, 'M400 505 H465 V540 H530'), wirePair(W, 'M400 655 H465 V570 H530')],
    Y.map((y) => wirePair(W, `M790 555 H845 V${y} H900`)),
    Y.map((y) => wirePair(W, `M1150 ${y} H1195 V555 H1240`)),
    Y.map((y) => wirePair(W, `M1500 555 H1550 V${y} H1600`)),
  ];
  st.flat().forEach(({ w }) => master.set(w, { autoAlpha: 0 }, 0));
  const stage = (i, at) => { st[i].forEach(({ w }) => { master.set(w, { autoAlpha: 1 }, at); draw(w, at, 0.45); }); };
  pop('#s4 .nd.lead', t + 0.6, { from: 0.8 });
  stage(0, t + 0.8);
  reveal('.s4-grp', t + 0.9, 0.6, 'top');
  pop('#s4 .nd.ch', t + 1.1, { stagger: 0.15, from: 0.8 }); cue(t + 1.1, 'pop');
  stage(1, t + 1.6);
  pop('.hub.h1b', t + 2.0, { from: 0.5 }); sparks(660, 555, t + 2.0, { r0: 100, r1: 190, n: 7 });
  stage(2, t + 2.4);
  pop('#s4 .nd.md', t + 2.7, { stagger: 0.12, from: 0.7 }); Y.forEach((_, i) => cue(t + 2.7 + i * 0.12, 'tick'));
  stage(3, t + 3.4);
  pop('.hub.h2b', t + 3.8, { from: 0.5 }); sparks(1370, 555, t + 3.8, { r0: 100, r1: 190, n: 7 });
  stage(4, t + 4.2);
  pop('#s4 .nd.ex', t + 4.5, { stagger: 0.12, from: 0.7 }); Y.forEach((_, i) => cue(t + 4.5 + i * 0.12, 'blip'));
  flow(st.flat().map((p) => p.e), t + 5.0, 150);
  arc(790, 520, 900, 405, t + 5.0, 0.35); arc(1150, 705, 1240, 590, t + 5.3, 0.35); arc(1500, 520, 1600, 405, t + 5.6, 0.35);
  up('.s4-caps > div', t + 5.6, { stagger: 0.15 });
  master.to('.hub', { boxShadow: '0 0 70px rgba(255,160,80,.8), inset 0 0 40px rgba(255,160,80,.35)', duration: 0.5, yoyo: true, repeat: 5 }, t + 5.2);
  return t + 11.0;
}

function S5(t) { // phân quyền theo vai trò
  bg(t, { trace: 0.45 }, 0.6);
  head(5, t);
  pop('.s5-core', t + 0.6, { from: 0.3 }); cue(t + 0.6, 'lock');
  const c0 = $('.s5-core .c0'), c1 = $('.s5-core .c1');
  UPD.push((tt) => { c0.setAttribute('transform', `rotate(${tt * 15} 150 150)`); c1.setAttribute('transform', `rotate(${-tt * 25} 150 150)`); });
  const W = $('.s5-wires');
  const ws = [
    wirePair(W, 'M861 496 L826 425 H800'), wirePair(W, 'M1059 496 L1094 425 H1120'),
    wirePair(W, 'M861 694 L826 765 H800'), wirePair(W, 'M1059 694 L1094 765 H1120'),
  ];
  ws.forEach(({ w, e }) => { master.set([w, e], { autoAlpha: 0 }, 0); });
  $$('#s5 .role').forEach((r, i) => {
    const ti = t + 1.2 + i * 1.35, dir = i % 2 ? 1 : -1;
    master.set(ws[i].w, { autoAlpha: 1 }, ti); draw(ws[i].w, ti, 0.4);
    master.set(ws[i].e, { autoAlpha: 1 }, ti + 0.4);
    master.fromTo(r, { autoAlpha: 0, x: dir * 50 }, { autoAlpha: 1, x: 0, duration: 0.6 }, ti + 0.3);
    up($$('li', r), ti + 0.6, { stagger: 0.14, y: 16, dur: 0.5 });
    master.fromTo('.s5-core svg', { scale: 1.1 }, { scale: 1, duration: 0.5 }, ti);
    cue(ti + 0.3, 'blip'); cue(ti + 0.6, 'tick');
  });
  flow(ws.map((p) => p.e), t + 1.6, -90);
  return t + 10.5;
}

function S6(t) { // hồ sơ điện tử: sạch & sống
  head(6, t);
  master.fromTo('.s6-win', { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.8 }, t + 0.6);
  up('.s6-win .rw', t + 1.0, { stagger: 0.06, y: 14, dur: 0.4 });
  const st = $$('.s6-steps .st');
  master.fromTo(st, { autoAlpha: 0, x: 40 }, { autoAlpha: 0.35, x: 0, duration: 0.6, stagger: 0.12 }, t + 0.8);
  const act = (i, at) => {
    master.to(st[i], { autoAlpha: 1, borderColor: 'rgba(255,138,61,.8)', boxShadow: '0 0 40px -8px rgba(255,122,26,.7)', duration: 0.4 }, at);
    if (i > 0) master.to(st[i - 1], { autoAlpha: 0.55, borderColor: 'rgba(77,184,255,.28)', boxShadow: '0 0 0 0 rgba(0,0,0,0)', duration: 0.4 }, at);
    cue(at, 'blip');
  };
  // 01 · NLĐ chủ động cập nhật
  act(0, t + 2.0);
  $$('.s6-win .tv').forEach((e, i) => typeText(e, e.dataset.v, t + 2.3 + i * 0.75, 0.5));
  // 02 · Smart Highlight + lãnh đạo duyệt
  act(1, t + 4.6);
  const ups = $$('.s6-win .rw.up');
  const hls = ups.map((r) => { const h = document.createElement('div'); h.className = 'hl'; r.insertBefore(h, r.firstChild); return h; });
  master.fromTo(hls, { scaleX: 0 }, { scaleX: 1, duration: 0.45, stagger: 0.15, ease: 'power2.out' }, t + 4.8);
  pop(ups.map((r) => $('.new', r)), t + 5.0, { stagger: 0.15 });
  master.fromTo('.s6-win .rev', { autoAlpha: 0, y: 0, x: 0 }, { autoAlpha: 1, duration: 0.3 }, t + 5.1);
  master.to('.s6-win .rev', { y: 130, x: 40, duration: 1.0, ease: 'power1.inOut' }, t + 5.3);
  master.to('.s6-win .rev', { autoAlpha: 0, duration: 0.3 }, t + 6.4);
  master.to('.s6-win .btn', { scale: 0.9, duration: 0.1, yoyo: true, repeat: 1 }, t + 6.2); cue(t + 6.2, 'click');
  master.fromTo('.s6-win .stamp', { scale: 2.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power4.in' }, t + 6.4); cue(t + 6.7, 'stamp');
  // 03 · lưu trữ khép kín, tự cập nhật
  act(2, t + 7.2);
  master.to('.s6-win .av2', { opacity: 1, duration: 0.5 }, t + 7.5);
  pop('.s6-win .av .ok', t + 7.9, { from: 0.2 });
  master.to('.s6-win .rw.au .auto', { opacity: 1, duration: 0.4, stagger: 0.2 }, t + 7.6);
  master.fromTo('.s6-win .rw.au', { backgroundColor: 'rgba(46,229,157,0)' }, { backgroundColor: 'rgba(46,229,157,.12)', duration: 0.4, stagger: 0.2 }, t + 7.6);
  master.to('.s6-win .sync', { opacity: 1, duration: 0.4 }, t + 8.1);
  master.fromTo('.s6-win .sync .ic', { rotation: 0 }, { rotation: 720, duration: 1.4, ease: 'power2.out' }, t + 8.1);
  cue(t + 8.1, 'ding');
  return t + 11.0;
}

function S7(t) { // hợp đồng điện tử
  head(7, t);
  const T = $('.s7-trace');
  const segs = ['M0 890 H80 V780 H120', 'M480 780 H520 V670 H560', 'M920 670 H960 V560 H1000', 'M1360 560 H1400 V450 H1440'];
  const tr = segs.map((d) => wirePair(T, d));
  tr.forEach(({ e }) => master.set(e, { autoAlpha: 0 }, 0));
  master.fromTo('.s7-doc', { autoAlpha: 0, y: 40, rotation: -4 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 0.8 }, t + 0.6);
  const cards = $$('#s7 .ct');
  cards.forEach((c, i) => {
    const ti = t + 0.9 + i * 2.3;
    master.set(tr[i].e, { autoAlpha: 1 }, ti); draw(tr[i].e, ti, 0.5, 'power1.inOut');
    master.fromTo(c, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, ti + 0.3);
    master.to(c, { borderColor: 'rgba(255,138,61,.85)', boxShadow: '0 0 40px -8px rgba(255,122,26,.7)', duration: 0.4 }, ti + 0.5);
    if (i > 0) master.to(cards[i - 1], { borderColor: 'rgba(77,184,255,.28)', boxShadow: '0 30px 70px -30px rgba(0,0,0,.8)', duration: 0.4 }, ti + 0.5);
    sparks(120 + i * 440, 780 - i * 110, ti + 0.45, { r0: 8, r1: 70, n: 5, dur: 0.35 });
  });
  const tt = (i) => t + 0.9 + i * 2.3;
  // 01 · khởi tạo hàng loạt + tự điền
  const fan = $$('.v0 .d');
  master.fromTo(fan, { rotation: 0, x: 0 }, { rotation: (k) => (k - 2) * 12, x: (k) => (k - 2) * 34, duration: 0.6, ease: 'back.out(1.6)', stagger: 0.04 }, tt(0) + 0.6);
  master.fromTo('.v0 span', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2, repeat: 3, yoyo: true }, tt(0) + 0.8);
  master.fromTo('.s7-doc .pp > i', { scaleX: 0 }, { scaleX: 1, duration: 0.35, stagger: 0.12, ease: 'power2.out' }, tt(0) + 0.6); cue(tt(0) + 0.6, 'type');
  master.fromTo('.s7-doc .g1', { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 0.55, x: 14, y: -14, duration: 0.4 }, tt(0) + 1.2);
  master.fromTo('.s7-doc .g2', { autoAlpha: 0, x: 0, y: 0 }, { autoAlpha: 0.3, x: 28, y: -28, duration: 0.4 }, tt(0) + 1.35);
  // 02 · cảnh báo đa kênh
  pop('.v1 span', tt(1) + 0.6, { stagger: 0.15 });
  master.to('.v1 .ic', { y: -6, duration: 0.15, yoyo: true, repeat: 3, stagger: 0.15 }, tt(1) + 1.0);
  [0, 1, 2].forEach((k) => cue(tt(1) + 0.6 + k * 0.15, 'notif'));
  // 03 · ký số CA
  draw('.v2 .sig', tt(2) + 0.6, 0.8, 'power1.inOut'); draw('.s7-doc .sig', tt(2) + 0.6, 0.8, 'power1.inOut');
  pop('.v2 .seal', tt(2) + 1.4, { from: 2, ease: 'power4.in', dur: 0.3 });
  master.fromTo('.s7-doc .seal', { scale: 2.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power4.in' }, tt(2) + 1.4);
  cue(tt(2) + 1.7, 'stamp');
  // 04 · đồng bộ D-Office
  master.fromTo('.v3 .dc', { x: -30 }, { x: 0, duration: 0.5 }, tt(3) + 0.6);
  pop('.v3 .stp', tt(3) + 1.1, { from: 2, ease: 'power4.in', dur: 0.3 }); cue(tt(3) + 1.4, 'ding');
  master.to('.s7-doc', { x: 1170, y: -40, scale: 0.22, autoAlpha: 0, duration: 0.9, ease: 'power2.in' }, tt(3) + 0.3); cue(tt(3) + 0.3, 'swish');
  return t + 11.5;
}

function S8(t) { // HRMS × D-Office
  head(8, t);
  const cubes = $$('#s8 .cube');
  master.fromTo(cubes, { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)', stagger: 0.2 }, t + 0.6);
  const cbs = cubes.map((c) => $('.cb', c));
  UPD.push((tt) => {
    const w = Math.sin(tt * 0.8) * 10;
    cbs[0].style.transform = `rotateX(-20deg) rotateY(${-32 + w}deg)`;
    cbs[1].style.transform = `rotateX(-20deg) rotateY(${32 - w}deg)`;
  });
  draw($$('.s8-lanes .ln'), t + 1.0, 0.8);
  flow('.s8-lanes .en', t + 1.6, 150);
  const lane = (sel, at, x0, x1, y) => {
    master.fromTo(sel, { x: x0, y, scale: 0.85 }, { x: x1, scale: 1, duration: 1.8, ease: 'power1.inOut' }, at);
    master.fromTo(sel, { autoAlpha: 0 }, { keyframes: [{ autoAlpha: 1, duration: 0.25 }, { autoAlpha: 1, duration: 1.25 }, { autoAlpha: 0, duration: 0.3 }] }, at);
  };
  ['.o1', '.o2', '.o3'].forEach((s, i) => { lane(`.s8-doc${s}`, t + 2.0 + i * 0.6, 580, 1150, 360); cue(t + 2.0 + i * 0.6, 'blip'); });
  master.fromTo('.s8-tok', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, t + 3.8);
  [3.9, 4.5, 5.1].forEach((d) => { master.fromTo('.s8-tok', { boxShadow: '0 0 40px rgba(46,229,157,.9)' }, { boxShadow: '0 0 0px rgba(46,229,157,0)', duration: 0.5 }, t + d); cue(t + d, 'lock'); });
  master.to(cubes[1], { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1 }, t + 3.7);
  ['.b1', '.b2', '.b3'].forEach((s, i) => { lane(`.s8-doc${s}`, t + 4.9 + i * 0.6, 1170, 600, 640); cue(t + 4.9 + i * 0.6, 'blip'); });
  master.to(cubes[0], { scale: 1.06, duration: 0.15, yoyo: true, repeat: 1 }, t + 6.6);
  sparks(380, 480, t + 6.6, { r0: 120, r1: 200, n: 6 });
  const cols = $$('.s8-cols > div');
  up(cols[0], t + 2.0); up(cols[1], t + 3.8); up(cols[2], t + 5.0);
  [2.0, 3.8, 5.0].forEach((d) => cue(t + d, 'tick'));
  return t + 10.5;
}

function S9(t) { // quản lý đào tạo – vòng lặp vô cực
  head(9, t);
  const a = 760, cx = 960, cy = 610, P = (s) => { const d = 1 + Math.sin(s) ** 2; return [cx + (a * Math.cos(s)) / d, cy + (a * Math.sin(s) * Math.cos(s)) / d]; };
  const lobe = (s0, s1) => { let d = ''; for (let k = 0; k <= 140; k++) { const [x, y] = P(s0 + ((s1 - s0) * k) / 140); d += `${k ? 'L' : 'M'}${x.toFixed(1)} ${y.toFixed(1)} `; } return d; };
  const dL = lobe(Math.PI / 2, (3 * Math.PI) / 2), dR = lobe(-Math.PI / 2, Math.PI / 2);
  ['.lpL', '.glowL'].forEach((c) => $(`.s9-loop ${c}`).setAttribute('d', dL));
  ['.lpR', '.glowR'].forEach((c) => $(`.s9-loop ${c}`).setAttribute('d', dR));
  draw($$('.s9-loop .lpL, .s9-loop .glowL'), t + 0.7, 1.4, 'power2.inOut');
  draw($$('.s9-loop .lpR, .s9-loop .glowR'), t + 0.9, 1.4, 'power2.inOut');
  cue(t + 0.7, 'scan');
  const G = $('.s9-loop .dots'), N = 16, C = [];
  for (let p = 0; p < 2; p++) for (let k = 0; k < N; k++) C.push(svg('circle', { r: 9 - k * 0.5, opacity: 0 }, G));
  G.style.filter = 'drop-shadow(0 0 8px #FFB347)';
  const dm = $('.s9-dia .dm'), t0 = t + 1.8;
  UPD.push((tt) => {
    const on = tt > t0;
    let pulse = 0;
    for (let p = 0; p < 2; p++) for (let k = 0; k < N; k++) {
      const s = (tt - t0) * 1.6 + p * Math.PI - k * 0.035, [x, y] = P(s), c = C[p * N + k];
      c.setAttribute('cx', x); c.setAttribute('cy', y); c.setAttribute('opacity', on ? (1 - k / N) * clamp01((tt - t0) * 2) : 0);
      if (k === 0 && on) pulse = Math.max(pulse, Math.exp(-(((x - cx) ** 2 + (y - cy) ** 2) / 1800)));
    }
    dm.style.transform = `rotate(45deg) scale(${1 + 0.08 * pulse})`;
    dm.style.boxShadow = `0 0 ${40 + 50 * pulse}px rgba(255,122,26,${0.6 + 0.4 * pulse}),inset 0 0 30px rgba(255,122,26,.3)`;
  });
  pop('.s9-p.pl', t + 1.9, { from: 0.8 }); cue(t + 1.9, 'pop');
  pop('.s9-p.pr', t + 2.7, { from: 0.8 }); cue(t + 2.7, 'pop');
  master.fromTo('.s9-dia', { scale: 0, rotation: -90, autoAlpha: 0 }, { scale: 1, rotation: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.6)' }, t + 3.5);
  sparks(960, 610, t + 3.6, { r0: 80, r1: 170, n: 7 });
  up('.s9-note', t + 4.3); cue(t + 4.3, 'ding');
  return t + 10.5;
}

function S10(t) { // tự động hoá sát hạch nghề & nâng lương
  head(10, t);
  master.fromTo('.s10-pn.pl', { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 0.7 }, t + 0.7);
  master.fromTo('.s10-pn.pr', { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: 0.7 }, t + 0.9);
  pop('.s10-clock', t + 1.0, { from: 0.4 });
  const tk = $('.s10-clock .tk');
  for (let i = 0; i < 12; i++) { const a = (i / 12) * 6.283; svg('line', { x1: 120 + Math.cos(a) * 84, y1: 120 + Math.sin(a) * 84, x2: 120 + Math.cos(a) * 92, y2: 120 + Math.sin(a) * 92 }, tk); }
  const hand = $('.s10-clock .hand');
  UPD.push((tt) => hand.setAttribute('transform', `rotate(${(tt * 90) % 360} 120 120)`));
  const rows = $$('.tbl .tr'), W = [100, 64, 100, 82], D = [1.2, 2.2, 2.2, 2.6];
  rows.forEach((r, i) => {
    master.fromTo($('.pg i', r), { width: '0%' }, { width: `${W[i]}%`, duration: D[i], ease: 'power1.inOut' }, t + 1.2 + i * 0.15);
    if (W[i] === 100) {
      const at = t + 1.2 + i * 0.15 + D[i];
      pop($('.due', r), at, { from: 0.4 }); cue(at, 'notif');
      master.fromTo('.s10-clock .bell', { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(3)' }, at);
      master.to('.s10-clock .bell', { rotation: 16, duration: 0.08, yoyo: true, repeat: 5 }, at + 0.3);
    }
  });
  master.to('.s10-clock .in .ic', { rotation: 180, duration: 0.6, ease: 'power2.inOut' }, t + 2.4);
  master.to('.s10-clock .in .ic', { rotation: 360, duration: 0.6, ease: 'power2.inOut' }, t + 4.6);
  up('.s10-pn.pl li', t + 4.0, { stagger: 0.3, y: 20 });
  $$('.reg .cb').forEach((c, i) => {
    master.to(c, { backgroundColor: '#2EE59D', borderColor: '#2EE59D', color: '#03281A', duration: 0.2 }, t + 2.0 + i * 0.4);
    cue(t + 2.0 + i * 0.4, 'click');
  });
  master.fromTo('.reg .cert', { autoAlpha: 0, scale: 1.8 }, { autoAlpha: 1, scale: 1, duration: 0.35, ease: 'power4.in' }, t + 3.9); cue(t + 4.25, 'stamp');
  master.fromTo('.reg .sync', { autoAlpha: 0, x: -20 }, { autoAlpha: 1, x: 0, duration: 0.4 }, t + 4.6); cue(t + 4.6, 'ding');
  up('.s10-pn.pr li', t + 5.0, { stagger: 0.3, y: 20 });
  return t + 10.5;
}

function S11(t) { // công tác cán bộ – dòng điện chạy qua 4 mốc
  head(11, t);
  bg(t, { tower: 0.5, towerE: 0.8, floor: 0.35 }, 0.8);
  reveal('.s11-cable', t + 0.6, 0.9);
  const ns = $$('.s11-n'), ts = $$('.s11-t'), ds = $$('.s11-d'), X = [330, 750, 1170, 1590], t0 = t + 1.4, D = 6.0;
  master.fromTo('.s11-cable .fill', { width: 0 }, { width: 1680, duration: D, ease: 'none' }, t0);
  master.fromTo('.s11-cable .spark', { left: 0 }, { left: 1680, duration: D, ease: 'none' }, t0);
  master.fromTo('.s11-cable .spark', { opacity: 0 }, { opacity: 1, duration: 0.2 }, t0);
  master.to('.s11-cable .spark', { opacity: 0, duration: 0.3 }, t0 + D);
  pop(ns, t + 0.9, { from: 0.3, stagger: 0.08 });
  X.forEach((x, i) => {
    const at = t0 + ((x - 120) / 1680) * D;
    master.set(ns[i], { attr: { class: 's11-n on' } }, at);
    sparks(x, 600, at, { r0: 30, r1: 110, n: 6 });
    master.fromTo(ts[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at);
    master.fromTo(ds[i], { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at + 0.15);
  });
  return t + 10.5;
}

function S12(t) { // ứng dụng SmartEVN
  head(12, t);
  bg(t, { tower: 0, towerE: 0, floor: 0.3 }, 0.6);
  const scr = $('.s12-ph .scr'), tap = $('.s12-ph .tap');
  const pos = (k) => { const s = $(`.s12-ph .grid span[data-k="${k}"]`); return [s.offsetLeft + s.offsetWidth / 2, s.offsetTop + 32]; };
  const P = { luong: pos('luong'), hd: pos('hd'), kh: pos('kh') };
  master.fromTo('.s12-ph', { y: 120, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9 }, t + 0.6);
  pop('.s12-ph .grid span', t + 1.0, { stagger: 0.03, from: 0.5 });
  const cos = [$('.co.c1'), $('.co.c2'), $('.co.c3'), $('.co.c4')], wires = $$('.s12-wires path');
  const wOf = [0, 2, 1, 3];
  const doTap = (k, at) => {
    const [x, y] = P[k], s = $(`.s12-ph .grid span[data-k="${k}"]`);
    master.set(tap, { left: x, top: y }, at);
    master.fromTo(tap, { scale: 0.4, autoAlpha: 1 }, { scale: 1.6, autoAlpha: 0, duration: 0.5, ease: 'power2.out' }, at);
    master.set(s, { attr: { class: 'hl' } }, at); master.set(s, { attr: { class: '' } }, at + 2.0);
    cue(at, 'click');
  };
  cos.forEach((c, i) => {
    const ci = t + 1.6 + i * 1.9, dir = i % 2 ? 1 : -1;
    draw(wires[wOf[i]], ci, 0.4);
    master.fromTo(c, { autoAlpha: 0, x: dir * 40 }, { autoAlpha: 1, x: 0, duration: 0.6 }, ci + 0.1);
    master.set(c, { attr: { class: `co c${i + 1} frame on` } }, ci + 0.2);
    if (i > 0) master.set(cos[i - 1], { attr: { class: `co c${i} frame` } }, ci + 0.2);
    cue(ci + 0.1, 'swish');
  });
  const c = (i) => t + 1.6 + i * 1.9;
  doTap('luong', c(0) + 0.3);
  master.to('.sh1', { yPercent: -110, duration: 0.5, ease: 'power3.out' }, c(0) + 0.5);
  master.to('.sh1', { yPercent: 0, duration: 0.4, ease: 'power2.in' }, c(0) + 1.6);
  doTap('hd', c(1) + 0.3);
  master.to('.sh2', { yPercent: -110, duration: 0.5, ease: 'power3.out' }, c(1) + 0.5);
  draw('.sh2 .sig', c(1) + 0.8, 0.6, 'power1.inOut');
  pop('.sh2 > em', c(1) + 1.4, { from: 0.5 }); cue(c(1) + 1.4, 'ding');
  master.to('.sh2', { yPercent: 0, duration: 0.4, ease: 'power2.in' }, c(1) + 1.85);
  master.to('.push', { yPercent: 160, duration: 0.5, ease: 'back.out(1.4)' }, c(2) + 0.3); cue(c(2) + 0.3, 'notif');
  master.to('.push', { yPercent: 0, duration: 0.4, ease: 'power2.in' }, c(2) + 1.8);
  doTap('kh', c(3) + 0.3);
  master.fromTo('.toast', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.4 }, c(3) + 0.7); cue(c(3) + 0.7, 'ding');
  return t + 10.5;
}

function S13(t) { // an ninh dữ liệu
  head(13, t);
  const hx = $('.s13-sh .hex');
  [190, 226].forEach((r, k) => {
    const pts = []; for (let i = 0; i < 6; i++) { const a = (i / 6) * 6.283 + k * 0.26; pts.push(`${180 + Math.cos(a) * r},${200 + Math.sin(a) * r}`); }
    svg('polygon', { points: pts.join(' ') }, hx);
  });
  const hps = $$('polygon', hx);
  UPD.push((tt) => { hps[0].setAttribute('transform', `rotate(${tt * 10} 180 200)`); hps[1].setAttribute('transform', `rotate(${-tt * 7} 180 200)`); });
  master.fromTo(hx, { autoAlpha: 0, scale: 0.6, transformOrigin: '180px 200px' }, { autoAlpha: 1, scale: 1, duration: 1.0 }, t + 0.5);
  draw('.s13-sh .s0', t + 0.6, 1.0);
  master.fromTo('.s13-sh .s0', { fillOpacity: 0 }, { fillOpacity: 1, duration: 0.6 }, t + 1.2);
  draw('.s13-sh .s1', t + 1.0, 0.9);
  master.fromTo('.s13-sh .s2', { scale: 0, transformOrigin: '180px 200px' }, { scale: 1, duration: 0.5, ease: 'back.out(2)' }, t + 1.5);
  master.fromTo('.s13-sh .lk', { scale: 0.3, autoAlpha: 0, y: -40 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.45, ease: 'back.out(2.4)' }, t + 1.8);
  cue(t + 2.0, 'lock'); sparks(960, 560, t + 2.0, { r0: 150, r1: 260, n: 8, silent: true });
  master.fromTo('.s13-wires .w', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t + 2.0);
  draw($$('.s13-wires .w'), t + 2.0, 0.5);
  master.fromTo('.sc.s1c', { autoAlpha: 0, x: -50 }, { autoAlpha: 1, x: 0, duration: 0.6 }, t + 2.2);
  master.fromTo('.sc.s2c', { autoAlpha: 0, x: 50 }, { autoAlpha: 1, x: 0, duration: 0.6 }, t + 2.8);
  master.fromTo('.sc.s3c', { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.6 }, t + 3.4);
  [2.2, 2.8, 3.4].forEach((d) => cue(t + d, 'tick'));
  master.fromTo('.tiers i', { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.15 }, t + 2.6);
  flow('.s13-wires .e', t + 3.6, 120);
  const LOG = [['08:12:04', 'TCNS_03 · CẬP NHẬT HỒ SƠ #NS-1024'], ['08:12:31', 'LĐ_PX2 · KÝ SỐ QĐ NÂNG LƯƠNG'], ['08:13:02', 'NLĐ_5817 · BỔ SUNG LÝ LỊCH'],
    ['08:13:47', 'TCNS_01 · SỬA ĐỔI HĐLĐ #HD-0457'], ['08:14:10', 'ADMIN · CẤU HÌNH LUỒNG KÝ'], ['08:14:55', 'TCNS_03 · CHỐT SỐ LIỆU KÊ KHAI'],
    ['08:15:20', 'LĐ_ĐV1 · DUYỆT HỒ SƠ BỔ SUNG'], ['08:16:02', 'NLĐ_2290 · KÝ HĐLĐ ĐIỆN TỬ']];
  const box = $('.log .in');
  [...LOG, ...LOG].forEach(([a, b]) => div('', box, `<span>[${a}]</span> ${b}`));
  const t0 = t + 3.0;
  UPD.push((tt) => { box.style.transform = `translateY(${-((Math.max(0, tt - t0) * 26) % (LOG.length * 24))}px)`; });
  return t + 10.5;
}

function S14(t) { // giá trị mang lại
  cue(t, 'sec_soft');
  head(14, t);
  bg(t, { tower: 0.2, floor: 0.35 }, 0.8);
  up('.s14-cards .cd', t + 0.7, { stagger: 0.2, y: 60 });
  const C = 2 * Math.PI * 84, F = [0.7, 1, 1];
  $$('.s14-cards .rg .fl').forEach((c, i) => {
    c.setAttribute('stroke-dasharray', `${C} ${C}`); c.setAttribute('transform', 'rotate(-90 110 110)');
    master.fromTo(c, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - F[i]), duration: 1.6, ease: 'power2.out' }, t + 1.1 + i * 0.25);
    cue(t + 1.1 + i * 0.25, 'tick');
  });
  counter('.s14-cards .v1', 0, 70, t + 1.1, 1.6);
  counter('.s14-cards .v2', 0, 100, t + 1.35, 1.6);
  pop('.s14-cards .big.ic3 .ic', t + 1.6, { from: 0.3 });
  master.to('.s14-cards .cd p b', { color: '#FFFFFF', duration: 0.3, yoyo: true, repeat: 1, stagger: 0.3 }, t + 3.0);
  return t + 10.0;
}

function S15(t) { // kết: sẵn sàng đồng bộ + lời kêu gọi
  cue(t + 0.3, 'sec_end');
  bg(t, { trace: 0.7, tower: 0.9, towerE: 1, floor: 0.55, pulse: 1 }, 0.8);
  master.to('#bug', { autoAlpha: 0, duration: 0.3 }, t);
  master.fromTo('.s15-disc', { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, t + 0.2);
  sparks(960, 240, t + 0.5, { r0: 130, r1: 240, n: 9, silent: true });
  reveal('.s15-word', t + 0.7, 0.6, 'center'); cue(t + 0.7, 'swish');
  words('.s15-h', t + 1.2);
  up('.s15-s', t + 2.0, { y: 24 });
  pop('.s15-cta', t + 2.8, { from: 0.8 }); cue(t + 2.8, 'pop');
  master.to('.s15-cta', { scale: 1.04, duration: 0.45, yoyo: true, repeat: 5, ease: 'sine.inOut' }, t + 3.5);
  up('.s15-chips span', t + 3.4, { stagger: 0.1, y: 20 });
  master.to('#stage', { opacity: 0, duration: 1.2, ease: 'none' }, t + 8.6);
  return t + 9.8;
}

/* ================= GHÉP CẢNH ================= */
function build() {
  buildNet(); buildTowers(); buildBlocks();
  let t, x;
  t = S1(0);
  x = surge(t, '#s1', '#s2'); t = S2(x);
  x = glitchCut(t, '#s2', '#s3'); t = S3(x);
  x = surge(t, '#s3', '#s4'); t = S4(x);
  x = blockWipe(t, '#s4', '#s5'); t = S5(x);
  x = iris(t, '#s5', '#s6', 960, 595); t = S6(x);
  x = glitchCut(t, '#s6', '#s7'); t = S7(x);
  x = surge(t, '#s7', '#s8'); t = S8(x);
  x = blockWipe(t, '#s8', '#s9'); t = S9(x);
  x = iris(t, '#s9', '#s10', 960, 610); t = S10(x);
  x = surge(t, '#s10', '#s11'); t = S11(x);
  x = glitchCut(t, '#s11', '#s12'); t = S12(x);
  x = blockWipe(t, '#s12', '#s13'); t = S13(x);
  x = surge(t, '#s13', '#s14'); t = S14(x);
  x = iris(t, '#s14', '#s15', 960, 540); t = S15(x);
  const FXG = $('#fx').getContext('2d');
  UPD.push((tt) => { FXG.clearRect(0, 0, 1920, 1080); FX.forEach((f) => { if (tt >= f.t0 && tt <= f.t1) f.fn(FXG, tt); }); });
  master.set({}, {}, t);
  return t;
}

async function loadIcons() {
  const list = $$('.ic[data-i]'), names = [...new Set(list.map((e) => e.dataset.i))], map = {};
  await Promise.all(names.map(async (n) => { const r = await fetch(`node_modules/lucide-static/icons/${n}.svg`); if (!r.ok) throw new Error('missing icon ' + n); map[n] = await r.text(); }));
  list.forEach((e) => { e.innerHTML = map[e.dataset.i]; });
}

(async () => {
  await loadIcons();
  await document.fonts.ready;
  await Promise.all($$('img').map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = r; }))));
  await Promise.all($$('img').map((i) => i.decode().catch(() => {})));
  const dur = build();
  const seek = (t) => { master.seek(t, false); UPD.forEach((f) => f(t)); };
  seek(0);
  window.__duration = dur;
  window.__marks = MARKS.sort((a, b) => a.t - b.t);
  window.__seek = seek;
  window.__ready = true;
  const m = location.search.match(/t=([\d.]+)/);
  if (m) seek(parseFloat(m[1]));
  if (location.search.includes('play')) { const t0 = performance.now(); const loop = () => { const t = (performance.now() - t0) / 1000; if (t < dur) { seek(t); requestAnimationFrame(loop); } }; loop(); }
})().catch((e) => { console.error(e); window.__error = String(e && e.stack || e); });
