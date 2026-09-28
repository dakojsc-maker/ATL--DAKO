/* Viện STP – Giải pháp định danh sản phẩm & truy xuất nguồn gốc chuẩn TCVN/GS1.
   Toàn bộ chuyển động nằm trên một GSAP timeline dừng sẵn; các hiệu ứng canvas / chữ giải mã
   là hàm thuần của thời gian t (UPD) để render từng khung hình tất định qua window.__seek(t). */
gsap.ticker.lagSmoothing(0);
gsap.defaults({ ease: 'power3.out' });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const master = gsap.timeline({ paused: true });
const MARKS = [];
const UPD = [];
const cue = (t, type) => MARKS.push({ t: +t.toFixed(3), type });
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease3 = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const lerp = (a, b, k) => a + (b - a) * k;
const CY = '#22D3EE', GR = '#22E08A', RED = '#FF3B5C', OR = '#FF8A3D';

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

/* ---------- text ---------- */
function splitWords(el) {
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
  walk(el);
  return out;
}
const el = (x) => (typeof x === 'string' ? $(x) : x);
function words(sel, at, o = {}) {
  const ws = splitWords(el(sel));
  master.fromTo(ws, { yPercent: 118, rotate: o.rot ?? 3 },
    { yPercent: 0, rotate: 0, duration: o.dur ?? 0.8, ease: 'power4.out', stagger: o.stagger ?? 0.04 }, at);
  return ws;
}
const GLYPHS = 'ABCDEFGHJKLMNPQRSTUVWXYZ0123456789#$%&*+<>/=';
// chữ "giải mã": ký tự nhiễu rồi chốt dần từ trái sang phải
function scramble(sel, at, dur = 1.0) {
  const root = el(sel);
  const nodes = [];
  const walk = (n) => n.childNodes.forEach((c) => { if (c.nodeType === 3 && c.data.trim()) nodes.push(c); else if (c.nodeType === 1 && !c.classList.contains('ic')) walk(c); });
  walk(root);
  const finals = nodes.map((n) => n.data), total = finals.reduce((s, f) => s + f.length, 0);
  let seedBase = Math.floor(at * 97);
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
        else s += ' ';
      }
      if (n.data !== s) n.data = s;
    });
  });
  cue(at, 'type');
}
function glitch(sel, at, dur = 0.4, amp = 8) {
  const k = [
    { x: -amp, skewX: 8, textShadow: `${amp}px 0px 0px #FF3B5C, ${-amp}px 0px 0px #22D3EE` },
    { x: amp * 0.8, skewX: -6, textShadow: `${-amp * 0.6}px 0px 0px #FF3B5C, ${amp * 0.6}px 0px 0px #22D3EE` },
    { x: -amp * 0.4, skewX: 3, textShadow: `${amp * 0.3}px 0px 0px #FF3B5C, ${-amp * 0.3}px 0px 0px #22D3EE` },
    { x: 0, skewX: 0, textShadow: '0px 0px 0px rgba(0,0,0,0), 0px 0px 0px rgba(0,0,0,0)' },
  ];
  master.to(sel, { keyframes: k.map((v, i) => ({ ...v, duration: i === 3 ? dur * 0.4 : dur * 0.2 })), ease: 'none' }, at);
  cue(at, 'glitch');
}

/* ---------- motion helpers ---------- */
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
const show = (s, at) => master.set(s, { visibility: 'visible' }, at);
const hide = (s, at) => master.set(s, { visibility: 'hidden' }, at);
function counter(elm, from, to, at, dur, fmt = (v) => Math.round(v)) {
  const o = { v: from }, e = el(elm);
  master.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { e.textContent = fmt(o.v); } }, at);
}
function ripple(sel, at, o = {}) {
  master.fromTo(sel, { scale: o.from ?? 1, opacity: o.op ?? 0.8 },
    { scale: o.to ?? 1.6, opacity: 0, duration: o.dur ?? 1.6, ease: 'power1.out', repeat: o.repeat ?? 2, stagger: o.stagger ?? 0.5 }, at);
}
function draw(path, at, dur, ease = 'power2.inOut') {
  const p = el(path), L = p.getTotalLength();
  master.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease }, at);
}
function reveal(sel, at, dur = 0.9, dir = 'left') {
  const from = { left: 'inset(0 100% 0 0)', top: 'inset(0 0 100% 0)', bottom: 'inset(100% 0 0 0)' }[dir];
  master.fromTo(sel, { clipPath: from, autoAlpha: 1 }, { clipPath: 'inset(0 0% 0 0)', duration: dur, ease: 'power3.inOut' }, at);
  master.set(sel, { clearProps: 'clipPath' }, at + dur + 0.01);
}
function qrCells(box, sizePx, seed) { // ô QR thật (vienstp.com) – dùng cho hiệu ứng lắp ráp
  const M = window.__qr, n = M.length, s = sizePx / n, cells = [], R = rng(seed);
  M.forEach((row, y) => [...row].forEach((v, x) => {
    if (v !== '1') return;
    const i = document.createElement('i');
    i.style.cssText = `left:${x * s}px;top:${y * s}px;width:${s + 0.3}px;height:${s + 0.3}px`;
    box.appendChild(i); cells.push({ i, r: R(), x, y });
  }));
  return cells;
}
function buildQR(sel, sizePx, at, dur, seed = 1) {
  const cells = qrCells(el(sel), sizePx, seed);
  if (at != null) cells.forEach((c) => master.fromTo(c.i, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.25, ease: 'back.out(3)' }, at + c.r * dur));
  return cells;
}
function barcode(svgEl, W, H, seed, bars = 'rect') {
  const R = rng(seed); let x = 6; const out = [];
  while (x < W - 8) { const w = 1 + Math.floor(R() * 4) * 1.6; out.push(svg('rect', { x, y: 0, width: w, height: H }, svgEl)); x += w + 1.5 + Math.floor(R() * 3) * 1.6; }
  return out;
}

/* ---------- transitions ---------- */
const BLOCKS = [];
function buildBlocks() {
  const B = $('#blocks');
  for (let r = 0; r < 14; r++) for (let c = 0; c < 24; c++) { const i = document.createElement('i'); i.style.left = `${c * 81}px`; i.style.top = `${r * 78}px`; B.appendChild(i); BLOCKS.push(i); }
}
function blockWipe(at, prev, next) {
  master.set('#blocks', { visibility: 'visible' }, at);
  master.fromTo(BLOCKS, { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.2, ease: 'power2.out', stagger: { grid: [14, 24], from: [0.5, 0], amount: 0.42 } }, at);
  swap(prev, next, at + 0.62);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.35, duration: 0.08, yoyo: true, repeat: 1 }, at + 0.58);
  master.to(BLOCKS, { scaleX: 0, transformOrigin: '100% 50%', duration: 0.2, ease: 'power2.in', stagger: { grid: [14, 24], from: [0.5, 0], amount: 0.42 } }, at + 0.66);
  master.set('#blocks', { visibility: 'hidden' }, at + 1.3);
  cue(at, 'whoosh'); cue(at + 0.55, 'glitch');
  return at + 0.62;
}
function glitchCut(at, prev, next) {
  master.to(prev, { keyframes: [{ x: -24, filter: 'hue-rotate(40deg) saturate(2)', duration: 0.06 }, { x: 18, duration: 0.06 }, { x: -8, duration: 0.06 }], ease: 'none' }, at);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.55, duration: 0.07, yoyo: true, repeat: 1 }, at + 0.14);
  swap(prev, next, at + 0.18);
  master.set(prev, { x: 0, filter: 'none' }, at + 0.2);
  master.fromTo(next, { x: 20, filter: 'hue-rotate(-40deg) saturate(2)' }, { x: 0, filter: 'hue-rotate(0deg) saturate(1)', duration: 0.25, ease: 'steps(4)' }, at + 0.18);
  master.set(next, { clearProps: 'filter' }, at + 0.45);
  master.set(prev, { clearProps: 'filter,transform' }, at + 0.46);
  cue(at, 'glitch'); cue(at, 'swish');
  return at + 0.2;
}
function swap(prev, next, at) { if (prev) hide(prev, at); show(next, at); }

/* ---------- global background ---------- */
const BG = { net: 0.9, floor: 0.55 };
function buildNet() {
  const cv = $('#net'), g = cv.getContext('2d'), R = rng(42), P = [];
  for (let i = 0; i < 70; i++) P.push({ x: R() * 1920, y: R() * 1080, ax: 20 + R() * 60, ay: 20 + R() * 50, w: 0.1 + R() * 0.25, p: R() * 6.28 });
  UPD.push((t) => {
    g.clearRect(0, 0, 1920, 1080);
    if (BG.net <= 0.01) return;
    const pts = P.map((p) => [p.x + Math.sin(t * p.w + p.p) * p.ax, p.y + Math.cos(t * p.w * 0.8 + p.p) * p.ay]);
    g.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const dx = pts[i][0] - pts[j][0], dy = pts[i][1] - pts[j][1], d = Math.hypot(dx, dy);
      if (d < 190) { g.strokeStyle = `rgba(56,189,248,${(1 - d / 190) * 0.22 * BG.net})`; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[j][0], pts[j][1]); g.stroke(); }
    }
    g.fillStyle = `rgba(125,227,255,${0.55 * BG.net})`;
    pts.forEach(([x, y], i) => { g.beginPath(); g.arc(x, y, i % 7 === 0 ? 2.6 : 1.6, 0, 6.283); g.fill(); });
  });
  UPD.push((t) => {
    $('#floor').style.opacity = BG.floor;
    $('#floor .grid').style.backgroundPosition = `0px ${(t * 45) % 90}px`;
    const s = Math.floor(t), fr = Math.floor((t - s) * 30);
    $('#hud .tc').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
  });
}
const bg = (at, o, dur = 0.8) => master.to(BG, { ...o, duration: dur, ease: 'none' }, at);

/* ================= SCENES ================= */
function S1(t) {
  show('#s1', t);
  master.fromTo('#stage', { opacity: 0 }, { opacity: 1, duration: 0.8, ease: 'none' }, t);
  buildQR('.s1-qr .qr', 256, t + 0.3, 1.1, 3);
  master.fromTo('.s1-qr', { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8 }, t + 0.2);
  words('.s1-a', t + 0.7, { stagger: 0.06 });
  cue(t + 0.3, 'hit');
  // bản sao lan khắp màn hình
  const C = $('.s1-copies'), R = rng(11), pos = [];
  while (pos.length < 22) {
    const x = 40 + R() * 1690, y = 40 + R() * 880;
    if (x > 640 && x < 1280 && y > 150 && y < 600) continue;
    if (y > 560 && y < 850 && x > 180 && x < 1740) continue;
    if (pos.some(([a, b]) => Math.hypot(a - x, b - y) < 170)) continue;
    pos.push([x, y]);
  }
  const copies = pos.map(([x, y], k) => {
    const d = div('cp', C); d.style.left = `${x}px`; d.style.top = `${y}px`;
    const q = div('qr', d); qrCells(q, 128, 3);
    return d;
  });
  copies.forEach((c, k) => master.fromTo(c, { scale: 0, rotate: (hash(k, 1) - 0.5) * 60, autoAlpha: 0 }, { scale: 0.7 + hash(k, 2) * 0.4, rotate: (hash(k, 3) - 0.5) * 24, autoAlpha: 0.85, duration: 0.45, ease: 'back.out(2)' }, t + 2.3 + k * 0.05));
  master.to('.s1-qr', { boxShadow: '0 0 80px rgba(255,59,92,.6)', duration: 0.4 }, t + 2.3);
  words('.s1-b', t + 2.5, { stagger: 0.06 });
  glitch('.s1-b', t + 3.6, 0.45, 10);
  cue(t + 2.3, 'glitch');
  // tất cả "vỡ" → câu hỏi
  const o = t + 4.9;
  master.to(['.s1-a', '.s1-b'], { autoAlpha: 0, y: -20, duration: 0.3 }, o);
  master.to(copies, { scale: 0, autoAlpha: 0, duration: 0.3, stagger: 0.015, ease: 'power2.in' }, o);
  master.to('.s1-qr', { keyframes: [{ x: -14, filter: 'hue-rotate(80deg)', duration: 0.06 }, { x: 12, duration: 0.06 }, { x: 0, scale: 0, autoAlpha: 0, duration: 0.3 }], ease: 'none' }, o);
  cue(o, 'glitch');
  words('.s1-c', o + 0.5, { stagger: 0.06, dur: 0.9 });
  master.fromTo('.s1-c .cy', { textShadow: '0 0 0px rgba(34,211,238,0)' }, { textShadow: '0 0 40px rgba(34,211,238,.9)', duration: 0.7, yoyo: true, repeat: 1 }, o + 1.3);
  return o + 3.2;
}

function S2(t) {
  cue(t, 'downbeat'); cue(t, 'sec_groove');
  // vòng HUD
  const tk = $('.hudring .ticks');
  for (let i = 0; i < 72; i++) { const a = (i / 72) * Math.PI * 2, r1 = 312, r2 = i % 6 ? 320 : 330; svg('line', { x1: 350 + Math.cos(a) * r1, y1: 350 + Math.sin(a) * r1, x2: 350 + Math.cos(a) * r2, y2: 350 + Math.sin(a) * r2 }, tk); }
  const rings = ['.r0', '.r1', '.r2', '.r3', '.ticks'].map((s) => $('.hudring ' + s)), sp = [6, -14, 9, -4, 3];
  UPD.push((tt) => rings.forEach((r, i) => r.setAttribute('transform', `rotate(${tt * sp[i]} 350 350)`)));
  master.fromTo('.hudring', { scale: 0.6, autoAlpha: 0, rotate: -40 }, { scale: 1, autoAlpha: 1, rotate: 0, duration: 1.2, ease: 'power3.out' }, t + 0.3);
  master.fromTo('.s2-core', { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)' }, t + 0.5);
  buildQR('.s2-core .qr', 256, t + 0.7, 0.9, 5);
  pop('.corner', t + 1.0, { from: 1.6, stagger: 0.06 });
  master.fromTo('.s2-core .laser', { y: 0 }, { y: 296, duration: 1.1, repeat: 5, yoyo: true, ease: 'sine.inOut' }, t + 1.3);
  cue(t + 1.3, 'scan');
  up('.s2-id', t + 1.6, { y: 14 }); scramble('.s2-id b', t + 1.6, 1.4);
  pop('.s2-logo', t + 0.2, { from: 0.4 });
  kicker('.s2-k', t + 0.5);
  words('.s2-h', t + 0.7, { stagger: 0.05 });
  master.fromTo('.s2-std', { clipPath: 'inset(-10% 100% -10% 0)' }, { clipPath: 'inset(-10% 0% -10% 0)', duration: 1.0, ease: 'power3.inOut' }, t + 1.4);
  glitch('.s2-std', t + 2.5, 0.35, 6);
  const bars = barcode($('.s2-bar'), 760, 70, 9);
  master.fromTo(bars, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.3, stagger: 0.006, ease: 'power2.out' }, t + 1.7);
  up('.s2-chips span', t + 2.4, { x: -40, y: 0, stagger: 0.15 });
  cue(t + 0.5, 'hit');
  return t + 7.6;
}

function S3(t) {
  cue(t, 'sec_tension');
  bg(t, { floor: 0.12, net: 0.5 });
  master.fromTo('#bug', { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5 }, t + 0.8);
  kicker('.s3-k', t + 0.1);
  words('.s3-h', t + 0.15);
  const cols = $$('.s3-cols .col');
  up($$('.s3-cols .hd'), t + 0.7, { y: 20, stagger: 0.12 });
  [0, 1, 2].forEach((row) => {
    const cards = cols.map((c) => $$('.cd', c)[row]);
    up(cards, t + 1.2 + row * 0.9, { y: 30, stagger: 0.1 });
    if (row < 2) up(cols.map((c) => $$('.ar', c)[row]), t + 1.7 + row * 0.9, { y: -10, stagger: 0.1 });
    cue(t + 1.2 + row * 0.9, 'blip');
  });
  // domino: xung đỏ chạy dọc từng luồng
  const d0 = t + 4.3;
  cols.forEach((c, k) => {
    const cs = $$('.cd', c), as = $$('.ar', c);
    cs.forEach((cd, i) => {
      const ti = d0 + k * 0.18 + i * 0.35;
      master.to(cd, { keyframes: [{ rotate: (k - 1) * 1.5 + 1.5, scale: 0.97, duration: 0.12 }, { rotate: 0, scale: 1, duration: 0.25 }], ease: 'none' }, ti);
      master.to(cd, { borderColor: 'rgba(255,59,92,.8)', duration: 0.2 }, ti);
      if (as[i]) master.to(as[i], { color: '#FF3B5C', duration: 0.2 }, ti + 0.18);
    });
  });
  master.to('.s3-cols .cd.hq', { boxShadow: '0 0 40px rgba(255,59,92,.55)', backgroundColor: 'rgba(110,12,36,.7)', duration: 0.3 }, d0 + 0.9);
  glitch('.s3-cols .cd.hq', d0 + 1.0, 0.4, 6);
  cue(d0, 'alarm');
  return d0 + 3.4;
}

function S4(t) {
  cue(t, 'sec_main');
  bg(t, { floor: 0.45, net: 0.8 });
  kicker('.s4-k', t + 0.2);
  words('.s4-h', t + 0.25);
  master.fromTo('.pn.L', { x: -380, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.0, ease: 'power4.out' }, t + 0.7);
  master.fromTo('.pn.R', { x: 380, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.0, ease: 'power4.out' }, t + 0.7);
  up('.pn.L .rw', t + 1.4, { x: -24, y: 0, stagger: 0.18 });
  up('.pn.R .rw', t + 1.5, { x: 24, y: 0, stagger: 0.18 });
  UPD.push((tt) => { $('.pn.holo').style.backgroundPosition = `${(tt * 22) % 300}% 0, 0 0`; });
  master.fromTo('.link', { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2)' }, t + 1.9);
  draw('.link .l1', t + 1.9, 0.6); draw('.link .l2', t + 2.1, 0.6);
  ripple('.spark', t + 2.5, { from: 0.3, to: 2.2, stagger: 0.3, repeat: 1, dur: 1.2 });
  cue(t + 2.5, 'hit');
  return t + 8.8;
}

function S5(t) {
  bg(t, { floor: 0.1, net: 0.5 });
  kicker('.s5-k', t + 0.1);
  words('.s5-h', t + 0.15);
  master.fromTo('.case', { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, t + 0.6);
  up('.zone', t + 0.8, { y: 40, stagger: 0.12 });
  const NODES = [
    [230, 'waves', 'Vùng nuôi<br>Hòn Khói'], [390, 'sprout', 'Thả giống'], [550, 'hand', 'Thu hoạch'],
    [780, 'factory', 'Xưởng<br>Nha Trang'], [900, 'disc-3', 'Ly tâm'], [1020, 'droplets', 'Tách nước'], [1140, 'flask-conical', 'Kiểm định'],
    [1380, 'package', 'Đóng gói'], [1530, 'truck', 'Xuất kho<br>logistics'], [1680, 'smartphone', 'Người<br>tiêu dùng'],
  ];
  const TAGS = [[0, 'GLN', 'g'], [2, 'Batch ID', 'g'], [3, 'GLN', 'o'], [6, 'Batch Linkage', 'o'], [7, 'GTIN + SN', 'b'], [8, 'SSCC', 'b'], [9, 'QR Scan', 'b']];
  const box = $('#s5 .nodes');
  const nd = NODES.map(([x, ic, nm]) => {
    const d = div('nd5', box, `<div class="c"><i class="ic">${window.__icons[ic]}</i></div><div class="nm">${nm}</div>`);
    d.style.left = `${x}px`; d.style.top = '558px'; return d;
  });
  const tags = TAGS.map(([i, txt, c]) => { const d = div(`idt ${c}`, box, txt); d.style.left = `${NODES[i][0]}px`; d.style.top = '446px'; return [i, d]; });
  up(nd, t + 1.2, { y: 20, stagger: 0.06 });
  master.fromTo('.thread .base', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, t + 1.2);
  // gói dữ liệu chạy dọc "digital thread"
  const p0 = t + 2.2, p1 = t + 10.2, pk = div('pkt', box), lit = $('.thread .lit'), L = 1640;
  lit.setAttribute('stroke-dasharray', L);
  UPD.push((tt) => {
    const k = clamp01((tt - p0) / (p1 - p0)), x = 150 + L * k;
    pk.style.transform = `translate(${x}px, 600px)`; pk.style.opacity = tt > p0 && tt < p1 + 0.4 ? 1 : 0;
    lit.setAttribute('stroke-dashoffset', L * (1 - k));
  });
  NODES.forEach(([x], i) => {
    const ti = p0 + ((x - 150) / L) * (p1 - p0);
    const c = $('.c', nd[i]);
    master.to(c, { backgroundColor: '#22D3EE', color: '#021433', borderColor: '#BFF5FF', boxShadow: '0 0 30px rgba(34,211,238,.9)', duration: 0.25 }, ti);
    master.fromTo(c, { scale: 1 }, { scale: 1.18, duration: 0.15, yoyo: true, repeat: 1 }, ti);
    cue(ti, 'blip');
  });
  tags.forEach(([i, d]) => {
    const ti = p0 + ((NODES[i][0] - 150) / L) * (p1 - p0);
    master.fromTo(d, { y: 20, scale: 0.6, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2.2)' }, ti + 0.05);
    scramble(d, ti + 0.05, 0.6);
  });
  up('.zone .zd', p1 - 0.8, { y: 16, stagger: 0.15 });
  return p1 + 2.2;
}

function S6(t) {
  bg(t, { floor: 0.08, net: 0.45 });
  kicker('.s6-k', t + 0.1);
  words('.s6-h', t + 0.15);
  reveal('.s6-photo', t + 0.7, 1.0);
  UPD.push((tt) => { $('.s6-photo .scanl').style.backgroundPosition = `0 ${(-(tt * 60) % 220)}%`; });
  master.fromTo('.s6-photo img', { scale: 1.2 }, { scale: 1, duration: 9, ease: 'none' }, t + 0.7);
  up('.s6-pts .pt', t + 1.4, { x: -30, y: 0, stagger: 0.2 });
  // bản đồ vệ tinh cách điệu
  const S = $('.s6-map .sat'), R = rng(7);
  const defs = svg('defs', {}, S);
  const gw = svg('linearGradient', { id: 'sea', x1: 0, y1: 0, x2: 1, y2: 1 }, defs);
  svg('stop', { offset: 0, 'stop-color': '#0C3F4E' }, gw); svg('stop', { offset: 1, 'stop-color': '#052430' }, gw);
  svg('rect', { x: 0, y: 0, width: 880, height: 600, fill: 'url(#sea)' }, S);
  svg('path', { d: 'M0 0 H420 C 380 60 300 90 250 150 C 190 220 120 230 60 300 C 30 340 10 380 0 400 Z', fill: '#24402F' }, S);
  svg('path', { d: 'M0 0 H300 C 260 50 200 80 160 120 C 110 170 60 190 0 240 Z', fill: '#2E4C35' }, S);
  const ang = -0.52, ca = Math.cos(ang), sa = Math.sin(ang), cx = 520, cy = 330;
  const rot = (x, y) => [cx + x * ca - y * sa, cy + x * sa + y * ca];
  const dike = svg('g', {}, S), ponds = svg('g', {}, S);
  const pw = 92, ph = 70, gap = 12, cols = 6, rows = 6;
  const bx = -(cols * (pw + gap)) / 2, by = -(rows * (ph + gap)) / 2;
  const outer = [rot(bx - 8, by - 8), rot(-bx + 8, by - 8), rot(-bx + 8, -by + 8), rot(bx - 8, -by + 8)];
  svg('polygon', { points: outer.map((p) => p.join(',')).join(' '), fill: '#7A8C82' }, dike);
  let sel;
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    const x0 = bx + c * (pw + gap) + gap / 2, y0 = by + r * (ph + gap) + gap / 2;
    const pts = [rot(x0, y0), rot(x0 + pw, y0), rot(x0 + pw, y0 + ph), rot(x0, y0 + ph)];
    const tone = ['#0F5A63', '#137583', '#0B4B57', '#1A8A8E'][Math.floor(R() * 4)];
    svg('polygon', { points: pts.map((p) => p.join(',')).join(' '), fill: tone }, ponds);
    if (r === 2 && c === 3) sel = pts;
  }
  const hud = svg('g', { stroke: 'rgba(125,227,255,.18)', 'stroke-width': 1 }, S);
  for (let x = 0; x <= 880; x += 55) svg('line', { x1: x, y1: 0, x2: x, y2: 600 }, hud);
  for (let y = 0; y <= 600; y += 55) svg('line', { x1: 0, y1: y, x2: 880, y2: y }, hud);
  const poly = svg('polygon', { points: sel.map((p) => p.join(',')).join(' '), fill: 'rgba(34,226,138,.0)', stroke: '#22E08A', 'stroke-width': 4, 'stroke-linejoin': 'round', style: 'filter:drop-shadow(0 0 8px #22E08A)' }, S);
  const pc = sel.reduce((a, p) => [a[0] + p[0] / 4, a[1] + p[1] / 4], [0, 0]);
  const pin = svg('g', {}, S);
  svg('path', { d: 'M0 0 C -18 -20 -22 -34 -22 -44 A22 22 0 0 1 22 -44 C 22 -34 18 -20 0 0 Z', fill: '#22E08A', stroke: '#052430', 'stroke-width': 3 }, pin);
  svg('circle', { cx: 0, cy: -44, r: 8, fill: '#052430' }, pin);
  const ring = svg('circle', { cx: pc[0], cy: pc[1], r: 20, fill: 'none', stroke: '#22E08A', 'stroke-width': 3 }, S);
  const sweep = svg('rect', { x: 0, y: 0, width: 880, height: 70, fill: 'rgba(34,211,238,.10)' }, S);
  UPD.push((tt) => { sweep.setAttribute('y', ((tt * 160) % 760) - 80); });
  reveal('.s6-map', t + 0.9, 1.0, 'top');
  const m0 = t + 2.1;
  master.fromTo(poly, { strokeDasharray: 400, strokeDashoffset: 400 }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.inOut' }, m0);
  master.to(poly, { attr: { fill: 'rgba(34,226,138,.28)' }, duration: 0.4 }, m0 + 0.9);
  master.fromTo(pin, { attr: { transform: `translate(${pc[0]},${pc[1] - 160})` }, opacity: 0 }, { attr: { transform: `translate(${pc[0]},${pc[1]})` }, opacity: 1, duration: 0.6, ease: 'bounce.out' }, m0 + 0.9);
  master.fromTo(ring, { attr: { r: 20 }, opacity: 0.9 }, { attr: { r: 90 }, opacity: 0, duration: 1.4, repeat: 4, ease: 'power1.out' }, m0 + 1.4);
  up('.gpsr', m0 + 1.3, { y: 16 }); scramble('.gpsr b', m0 + 1.3, 1.0);
  pop('.gpsr .ic', m0 + 2.3, { from: 2 }); cue(m0 + 2.3, 'lock');
  // nhật ký điện tử
  const log = $('.s6-map .log');
  div('hd', log, 'NHẬT KÝ ĐIỆN TỬ · AO NH01');
  const rows6 = [['06:00', 'Độ mặn', '32‰'], ['06:00', 'Nhiệt độ nước', '27.5°C'], ['06:05', 'pH', '8.1'], ['12:00', 'Độ mặn', '33‰'], ['12:00', 'Nhiệt độ nước', '29.0°C'], ['12:05', 'Ảnh sinh trưởng', '1 tệp']];
  const lr = rows6.map(([a, b, c]) => div('r', log, `<span class="t">${a}</span>&nbsp; ${b} · ${c}<span class="ok">✓</span>`));
  up(log, m0 + 0.6, { y: 16 });
  lr.forEach((r, i) => { up(r, m0 + 1.2 + i * 0.45, { x: 16, y: 0 }); cue(m0 + 1.2 + i * 0.45, 'blip'); });
  return t + 10.6;
}

function S7(t) {
  kicker('.s7-k', t + 0.05);
  words('.s7-h', t + 0.1);
  master.fromTo('.s7-ph', { y: 180, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0, ease: 'power4.out' }, t + 0.4);
  up('.app .bar, .app .fld', t + 1.0, { y: 14, stagger: 0.12 });
  master.fromTo('.app .off', { opacity: 1 }, { opacity: 0.35, duration: 0.5, yoyo: true, repeat: 7, ease: 'sine.inOut' }, t + 1.2);
  scramble('.app .d', t + 1.6, 0.8);
  counter('.app .kg', 0, 500, t + 2.2, 0.9);
  scramble('.app .lot', t + 2.8, 1.5);
  master.fromTo('.app .fld.code > div', { boxShadow: '0 0 0 0 rgba(17,132,90,0)' }, { boxShadow: '0 0 0 6px rgba(17,132,90,.25)', duration: 0.3, yoyo: true, repeat: 1 }, t + 4.3);
  master.fromTo('.app .btn', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, t + 3.6);
  master.to('.app .btn', { scale: 0.95, duration: 0.1, yoyo: true, repeat: 1 }, t + 4.6);
  master.fromTo('.app .locked', { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, t + 4.8);
  cue(t + 4.6, 'click'); cue(t + 4.8, 'lock');
  up('.s7-pts .pt', t + 1.3, { x: 40, y: 0, stagger: 0.25 });
  // đồng hồ: thử lùi ngày → bị chặn
  const tk = $('.s7-clock .tk');
  for (let i = 0; i < 12; i++) { const a = (i / 12) * Math.PI * 2; svg('line', { x1: 100 + Math.cos(a) * 72, y1: 100 + Math.sin(a) * 72, x2: 100 + Math.cos(a) * 80, y2: 100 + Math.sin(a) * 80 }, tk); }
  up('.s7-clock', t + 5.4, { y: 24 });
  const hh = $('.s7-clock .hh'), mh = $('.s7-clock .mh'), ck = { m: 0, h: 60 };
  const setHands = () => { mh.setAttribute('transform', `rotate(${ck.m} 100 100)`); hh.setAttribute('transform', `rotate(${ck.h} 100 100)`); };
  master.fromTo(ck, { m: 0, h: 60 }, { m: 90, h: 67, duration: 0.8, ease: 'none', onUpdate: setHands }, t + 5.6);
  master.to(ck, { m: -160, h: 40, duration: 0.7, ease: 'power2.in', onUpdate: setHands }, t + 6.5);
  master.to(ck, { m: 90, h: 67, duration: 0.3, ease: 'back.out(3)', onUpdate: setHands }, t + 7.25);
  master.fromTo('.s7-clock .x', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(3)' }, t + 7.2);
  master.fromTo('.s7-clock svg', { x: 0 }, { x: 8, duration: 0.05, yoyo: true, repeat: 7, ease: 'none' }, t + 7.2);
  cue(t + 7.2, 'stamp');
  return t + 10.4;
}

function S8(t) {
  bg(t, { floor: 0.08, net: 0.4 });
  kicker('.s8-k', t + 0.1);
  words('.s8-h', t + 0.15);
  $$('#s8 .ins').forEach((e, i) => master.fromTo(e, { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power4.out' }, t + 0.6 + i * 0.2));
  const gauges = $$('#s8 .gauge');
  const gaugeTo = (g, frac, at, dur) => {
    const v = $('.gv', g), n = $('.nd', g), L = v.getTotalLength();
    master.fromTo(v, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: L * (1 - frac), duration: dur, ease: 'power2.out' }, at);
    master.fromTo(n, { rotate: -90 }, { rotate: -90 + 180 * frac, duration: dur, ease: 'power2.out', svgOrigin: '120 130' }, at);
  };
  gaugeTo(gauges[0], 0.8, t + 1.3, 1.6);
  counter('#s8 .rpm', 0, 3000, t + 1.3, 1.6);
  const tm = { v: 0 }, tmEl = $('#s8 .tm');
  master.fromTo(tm, { v: 0 }, { v: 900, duration: 2.4, ease: 'none', onUpdate: () => { const s = Math.round(tm.v); tmEl.textContent = `00:${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}`; } }, t + 1.3);
  const gl = $('#s8 .chart .gl');
  for (let y = 20; y <= 150; y += 26) svg('line', { x1: 20, y1: y, x2: 280, y2: y }, gl);
  draw('#s8 .chart .c1', t + 1.6, 1.6); draw('#s8 .chart .c2', t + 1.8, 1.6);
  up('#s8 .lg span', t + 2.8, { y: 10, stagger: 0.15 });
  gaugeTo(gauges[1], 0.42, t + 2.0, 1.4);
  counter('#s8 .sal', 0, 25, t + 2.0, 1.4);
  cue(t + 1.3, 'scan');
  master.fromTo('.s8-flow', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 1.2);
  $$('.s8-flow i').forEach((d, i) => master.fromTo(d, { x: 0, opacity: 0 }, { keyframes: { x: [0, 76], opacity: [0, 1, 1, 0], easeEach: 'none' }, duration: 0.8, repeat: 9, ease: 'none' }, t + 1.4 + i * 0.27));
  // khoanh vùng mẻ sự cố
  master.fromTo('.s8-core', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, t + 3.6);
  const B = $('.s8-core .batches'), cells = [];
  for (let r = 0; r < 2; r++) for (let c = 0; c < 12; c++) { const i = document.createElement('i'); i.style.left = `${c * 64}px`; i.style.top = `${r * 64 + 8}px`; B.appendChild(i); cells.push(i); }
  master.fromTo(cells, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, stagger: 0.02, ease: 'back.out(2)' }, t + 4.0);
  const bad = cells[7];
  master.to(bad, { backgroundColor: 'rgba(255,59,92,.5)', borderColor: '#FF3B5C', boxShadow: '0 0 24px rgba(255,59,92,.9)', duration: 0.25, repeat: 3, yoyo: true }, t + 5.4);
  master.to(bad, { backgroundColor: 'rgba(255,59,92,.5)', borderColor: '#FF3B5C', duration: 0.1 }, t + 6.4);
  const brk = div('brk', B); brk.style.cssText = 'left:436px;top:0;width:64px;height:128px';
  const bl = div('bl', B, 'MẺ B-08 · KHOANH VÙNG'); bl.style.cssText = 'left:520px;top:-26px';
  master.fromTo(brk, { scale: 1.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2)' }, t + 6.2);
  master.to(cells.filter((_, i) => i !== 7 && i !== 19), { backgroundColor: 'rgba(34,226,138,.2)', borderColor: 'rgba(34,226,138,.7)', duration: 0.4, stagger: 0.01 }, t + 6.6);
  master.to(cells[19], { backgroundColor: 'rgba(255,59,92,.28)', borderColor: '#FF3B5C', duration: 0.2 }, t + 6.2);
  up(bl, t + 6.4, { x: -10, y: 0 });
  cue(t + 5.4, 'alarm'); cue(t + 6.2, 'lock');
  return t + 10.6;
}

function S9(t) {
  kicker('.s9-k', t + 0.05);
  words('.s9-h', t + 0.1);
  up('.s9-pts .pt', t + 1.0, { x: -30, y: 0, stagger: 0.2 });
  master.fromTo('.s9-gate', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, t + 0.6);
  master.fromTo('.s9-gate .beam', { opacity: 0.6 }, { opacity: 1, duration: 0.4, yoyo: true, repeat: 5 }, t + 1.2);
  master.fromTo('.s9-lot', { x: -300, autoAlpha: 0 }, { x: 300, autoAlpha: 1, duration: 1.3, ease: 'power3.out' }, t + 1.4);
  master.fromTo('.s9-coa', { x: 200, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: 'power4.out' }, t + 2.0);
  master.fromTo('.s9-coa .prog i', { scaleX: 0 }, { scaleX: 1, duration: 1.6, ease: 'none' }, t + 2.5);
  $$('.s9-coa .it').forEach((it, i) => { up(it, t + 2.5 + i * 0.5, { x: 20, y: 0 }); cue(t + 2.5 + i * 0.5, 'blip'); });
  const g = t + 4.3;
  master.to('.s9-coa .prog i', { backgroundColor: '#22E08A', duration: 0.2 }, g);
  master.fromTo('.s9-pass', { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.4)' }, g);
  master.to('.s9-gate .beam', { scaleY: 0, transformOrigin: '50% 0%', duration: 0.5, ease: 'power2.in' }, g + 0.2);
  const st = $('.s9-gate .st span');
  UPD.push((tt) => { st.textContent = tt >= g + 0.2 ? 'QC ĐẠT · ĐÃ MỞ' : 'CHỜ KẾT QUẢ QC'; });
  master.to('.s9-gate .st', { color: '#22E08A', borderColor: '#22E08A', backgroundColor: 'rgba(10,60,40,.85)', duration: 0.2 }, g + 0.2);
  cue(g, 'ding'); cue(g + 0.2, 'lock');
  master.to('.s9-lot', { x: 1100, autoAlpha: 0, duration: 1.4, ease: 'power2.in' }, g + 0.8);
  master.fromTo('.s9-dest', { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, g + 1.6);
  master.fromTo('.s9-res', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, g + 1.8);
  counter('.s9-res b', 0, 100, g + 1.9, 1.2, (v) => `${Math.round(v)}%`);
  return g + 5.2;
}

function S10(t) {
  bg(t, { floor: 0.1, net: 0.55 });
  kicker('.s10-k', t + 0.1);
  words('.s10-h', t + 0.15);
  master.fromTo('.s10-gtin', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 0.7);
  scramble('.s10-gtin .lb', t + 0.7, 0.8);
  const bars = barcode($('.s10-gtin .bc'), 420, 90, 17);
  master.fromTo(bars, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.25, stagger: 0.008 }, t + 0.9);
  up('.s10-gtin .sku span', t + 1.6, { x: -30, y: 0, stagger: 0.15 });
  master.fromTo('.s10-box', { y: 80, scale: 0.9, autoAlpha: 0 }, { y: 0, scale: 1, autoAlpha: 1, duration: 1.0, ease: 'power4.out' }, t + 0.6);
  master.fromTo('.s10-box img', { scale: 1.12 }, { scale: 1, duration: 10, ease: 'none' }, t + 0.6);
  // tem hologram
  const tem = $('.tem.big');
  buildQR('.tem.big .qr', 180, null, 0, 9);
  master.set('.tem.big .scratch', { autoAlpha: 0 }, t);
  master.fromTo(tem, { x: -300, y: 60, rotate: -14, scale: 0.6, autoAlpha: 0 }, { x: 0, y: 0, rotate: 0, scale: 1, autoAlpha: 1, duration: 1.0, ease: 'power4.out' }, t + 1.4);
  UPD.push((tt) => { $('.tem.big .foil').style.backgroundPosition = `${(tt * 35) % 300}% 0`; });
  up('.s10-feats .ft', t + 2.0, { x: 30, y: 0, stagger: 0.15 });
  const fts = $$('.s10-feats .ft');
  const hl = (i, a, b) => { master.to(fts[i], { borderColor: '#22D3EE', backgroundColor: 'rgba(34,211,238,.16)', duration: 0.25 }, a); master.to(fts[i], { borderColor: 'rgba(56,189,248,.28)', backgroundColor: 'rgba(8,28,66,.72)', duration: 0.3 }, b); };
  // 1 · phát quang UV
  const u = t + 3.0;
  hl(0, u, u + 1.9);
  master.to('.s10-uv', { opacity: 1, duration: 0.4 }, u);
  master.to(tem, { filter: 'brightness(.45) saturate(.6) hue-rotate(200deg)', duration: 0.4 }, u);
  master.to('.tem .uvmark', { opacity: 1, duration: 0.4 }, u + 0.2);
  master.to(['.s10-uv', '.tem .uvmark'], { opacity: 0, duration: 0.4 }, u + 1.8);
  master.to(tem, { filter: 'brightness(1) saturate(1) hue-rotate(0deg)', duration: 0.4 }, u + 1.8);
  cue(u, 'scan');
  // 2 · chống sao chép
  const c = u + 2.3;
  hl(2, c, c + 1.8);
  buildQR('.s10-copy .qr', 170, null, 0, 9);
  master.fromTo('.s10-copy', { x: 250, y: -300, scale: 0.6, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.7, ease: 'power3.out' }, c);
  master.fromTo('.s10-copy .bad', { scale: 1.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(3)' }, c + 0.8);
  glitch('.s10-copy .qr', c + 0.8, 0.4, 6);
  cue(c + 0.8, 'alarm');
  // 3 · anti-reuse: bóc tem → tự phá hủy
  const a = c + 2.2;
  hl(1, a, a + 3);
  const sh = $('.tem .shards'), R = rng(4), shards = [];
  const W = 420, H = 230, nx = 5, ny = 3;
  for (let j = 0; j < ny; j++) for (let i = 0; i < nx; i++) {
    const s = document.createElement('div');
    s.style.cssText = `position:absolute;inset:0;clip-path:polygon(${(i * W) / nx}px ${(j * H) / ny}px,${((i + 1) * W) / nx}px ${(j * H) / ny}px,${((i + 1) * W) / nx}px ${((j + 1) * H) / ny}px,${(i * W) / nx}px ${((j + 1) * H) / ny}px);background:#EEF4FF;visibility:hidden`;
    s.innerHTML = `<div class="foil"></div>${$('.tem.big .tx').outerHTML}${$('.tem.big .qr').outerHTML}`;
    sh.appendChild(s); shards.push([s, i, j]);
  }
  UPD.push((tt) => $$('.tem .shards .foil').forEach((f) => { f.style.backgroundPosition = `${(tt * 35) % 300}% 0`; }));
  master.to(tem, { rotate: -4, x: -10, y: -14, duration: 0.5, ease: 'power2.out' }, a);
  master.set(shards.map((s) => s[0]), { visibility: 'visible' }, a + 0.55);
  master.set(tem, { backgroundColor: 'rgba(0,0,0,0)', boxShadow: 'none' }, a + 0.55);
  master.set(['.tem.big > .foil', '.tem.big > .tx', '.tem.big > .qr'], { autoAlpha: 0 }, a + 0.55);
  shards.forEach(([s, i, j], k) => master.to(s, { x: (i - 2) * 60 + (R() - 0.5) * 50, y: (j - 1) * 50 + 40 + R() * 60, rotate: (R() - 0.5) * 50, autoAlpha: 0, duration: 1.1, ease: 'power2.in' }, a + 0.6 + R() * 0.2));
  const vd = div('void mono', $('#s10'), '<b>TEM ĐÃ BỊ PHÁ HỦY</b><span>Không thể bóc tách – dán lại</span>');
  vd.style.cssText = 'left:1350px;top:340px;width:420px;height:150px;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:8px;border:2px dashed #FF3B5C;color:#FFD5DD;font-size:18px;background:rgba(80,10,30,.6)';
  vd.firstChild.style.cssText = 'color:#FF3B5C;font-size:26px;letter-spacing:.08em';
  master.fromTo(vd, { scale: 0.8, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2)' }, a + 1.2);
  cue(a + 0.55, 'glitch'); cue(a + 1.2, 'stamp');
  return a + 3.4;
}

function S11(t) {
  bg(t, { floor: 0.1, net: 0.35 });
  kicker('.s11-k', t + 0.1);
  words('.s11-h', t + 0.15);
  // gom hộp → thùng SSCC
  const bxs = $('.s11-pallet .boxes'), R = rng(21), list = [];
  for (let i = 0; i < 14; i++) { const d = div('bx', bxs); d.style.left = `${20 + (i % 7) * 76}px`; d.style.top = `${(Math.floor(i / 7)) * 70}px`; list.push(d); }
  master.fromTo(list, { y: -60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.04, ease: 'back.out(2)' }, t + 0.6);
  list.forEach((d, i) => master.to(d, { left: 240, top: 240, scale: 0.3, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, t + 1.6 + i * 0.05));
  master.fromTo('.s11-pallet .big', { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.8)' }, t + 2.3);
  const bars = barcode($('.s11-pallet .big .bc'), 220, 48, 33);
  master.fromTo(bars, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.2, stagger: 0.01 }, t + 2.6);
  master.fromTo('.s11-pallet .big', { boxShadow: '0 30px 50px -20px rgba(0,0,0,.8), 0 0 0 0px rgba(34,211,238,0)' }, { boxShadow: '0 30px 50px -20px rgba(0,0,0,.8), 0 0 0 5px rgba(34,211,238,.9)', duration: 0.3, yoyo: true, repeat: 1 }, t + 3.1);
  cue(t + 2.3, 'hit'); cue(t + 3.1, 'lock');
  up('.s11-pallet .cap', t + 3.0, { y: 20 });
  // bản đồ thế giới dạng chấm
  const cv = $('.s11-map'), g = cv.getContext('2d');
  const proj = d3.geoEquirectangular().rotate([-150, 0]).fitExtent([[30, 20], [1150, 640]], { type: 'MultiPoint', coordinates: [[72, -32], [72, 62], [-62, 62], [-62, -32], [150, -32], [150, 62]] });
  const P = window.__land.map(([lo, la]) => [...proj([lo, la]), lo, la]);
  const cities = { vn: [109.19, 12.24], jp: [139.69, 35.69], kr: [126.98, 37.57], us: [-118.24, 34.05], bad: [120.9, 14.6] };
  const C = Object.fromEntries(Object.entries(cities).map(([k, v]) => [k, proj(v)]));
  const routes = [['jp', t + 4.0], ['kr', t + 4.4], ['us', t + 4.8]];
  const m0 = t + 1.0;
  let cleared = false;
  UPD.push((tt) => {
    if (tt < m0 || tt > t + 11.5) { if (!cleared) { g.clearRect(0, 0, 1180, 660); cleared = true; } return; }
    cleared = false;
    g.clearRect(0, 0, 1180, 660);
    const rv = clamp01((tt - m0) / 1.4) * 1300;
    P.forEach(([x, y, lo, la]) => {
      if (x > rv) return;
      const nearVN = Math.hypot(lo - 106, la - 15) < 9;
      g.fillStyle = nearVN ? 'rgba(34,226,138,.9)' : `rgba(56,189,248,${0.35 + 0.25 * Math.sin(x * 0.02 + tt * 1.5)})`;
      g.fillRect(x - 1.6, y - 1.6, 3.2, 3.2);
    });
    const [vx, vy] = C.vn;
    routes.forEach(([k, st]) => {
      const u = clamp01((tt - st) / 1.3); if (u <= 0) return;
      const [bx, by] = C[k], mx = (vx + bx) / 2, my = (vy + by) / 2 - Math.hypot(bx - vx, by - vy) * 0.35;
      g.strokeStyle = 'rgba(34,211,238,.9)'; g.lineWidth = 3; g.beginPath();
      let hx = vx, hy = vy;
      for (let s = 0; s <= 60 * u; s++) { const q = s / 60; hx = (1 - q) * (1 - q) * vx + 2 * (1 - q) * q * mx + q * q * bx; hy = (1 - q) * (1 - q) * vy + 2 * (1 - q) * q * my + q * q * by; s ? g.lineTo(hx, hy) : g.moveTo(hx, hy); }
      g.stroke();
      g.fillStyle = '#fff'; g.beginPath(); g.arc(hx, hy, 6, 0, 6.283); g.fill();
      if (u >= 1) { const pr = ((tt - st - 1.3) * 0.8) % 1; g.strokeStyle = `rgba(34,211,238,${1 - pr})`; g.lineWidth = 2; g.beginPath(); g.arc(bx, by, 6 + pr * 30, 0, 6.283); g.stroke(); }
    });
    const pr = ((tt - m0) * 0.7) % 1; g.strokeStyle = `rgba(34,226,138,${1 - pr})`; g.lineWidth = 2.5; g.beginPath(); g.arc(vx, vy, 8 + pr * 36, 0, 6.283); g.stroke();
    if (tt > t + 6.6) { const [bx, by] = C.bad, p2 = ((tt - t - 6.6) * 1.2) % 1; g.fillStyle = '#FF3B5C'; g.beginPath(); g.arc(bx, by, 7, 0, 6.283); g.fill(); g.strokeStyle = `rgba(255,59,92,${1 - p2})`; g.lineWidth = 3; g.beginPath(); g.arc(bx, by, 8 + p2 * 40, 0, 6.283); g.stroke(); }
  });
  master.fromTo(cv, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, m0);
  const L = $('.s11-lbl');
  const OFF = { jp: [58, 8], kr: [-52, -4], us: [0, 0], vn: [-30, 0], bad: [96, 44] };
  const mk = (k, txt, cls, at) => { const d = div(`mk ${cls}`, L, txt); d.style.left = `${C[k][0] + OFF[k][0]}px`; d.style.top = `${C[k][1] - 14 + OFF[k][1]}px`; master.fromTo(d, { y: 10, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4 }, at); };
  mk('vn', 'Việt Nam', 'vn', m0 + 1.0);
  mk('jp', 'Nhật Bản', '', t + 5.3); mk('kr', 'Hàn Quốc', '', t + 5.7); mk('us', 'Mỹ', '', t + 6.1);
  routes.forEach(([, st]) => cue(st, 'swish'));
  mk('bad', 'Quét ngoài luồng', 'bad', t + 6.7);
  master.fromTo('.s11-alert', { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5, ease: 'back.out(1.8)' }, t + 6.9);
  cue(t + 6.7, 'alarm');
  up('.s11-pts span', t + 5.0, { y: 14 });
  return t + 10.8;
}

function S12(t) {
  bg(t, { floor: 0.35, net: 0.6 });
  kicker('.s12-k', t + 0.05);
  words('.s12-h', t + 0.1);
  up('.s12-steps > *', t + 0.8, { y: 12, stagger: 0.08 });
  buildQR('.p1 .cam .qr', 216, null, 0, 13); buildQR('.p2 .cam .qr', 216, null, 0, 13);
  master.fromTo('.phone.p1', { y: 200, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0, ease: 'power4.out' }, t + 0.6);
  master.fromTo('.phone.p2', { y: 200, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0, ease: 'power4.out' }, t + 0.8);
  master.set(['.cam .ok', '.cam .bad'], { autoAlpha: 0 }, t);
  master.set(['.cam .ln'], { autoAlpha: 0 }, t);
  // điện thoại 1: cào lớp phủ → quét → chính hãng
  const a = t + 1.7;
  master.fromTo('.p1 .silver', { clipPath: 'inset(0 0% 0 0)' }, { clipPath: 'inset(0 0 0 100%)', duration: 0.9, ease: 'steps(9)' }, a);
  cue(a, 'type');
  master.set('.p1 .ln', { autoAlpha: 1 }, a + 1.1);
  master.fromTo('.p1 .ln', { y: 0 }, { y: 236, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, a + 1.1);
  master.set('.p1 .ln', { autoAlpha: 0 }, a + 2.3);
  cue(a + 1.1, 'scan');
  master.fromTo('.p1 .ok', { autoAlpha: 0, scale: 1.05 }, { autoAlpha: 1, scale: 1, duration: 0.4 }, a + 2.3);
  master.fromTo('.p1 .ok .ck', { scale: 0.3 }, { scale: 1, duration: 0.6, ease: 'back.out(2.6)' }, a + 2.4);
  up('.p1 .ok > b, .p1 .ok .it, .p1 .ok .lang', a + 2.6, { y: 14, stagger: 0.1 });
  cue(a + 2.4, 'ding');
  master.fromTo('.s12-cap.c1', { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, a + 2.6);
  // điện thoại 2: quét lại cùng mã → cảnh báo
  const b = a + 3.6;
  master.set('.p2 .ln', { autoAlpha: 1 }, b);
  master.fromTo('.p2 .ln', { y: 0 }, { y: 236, duration: 0.6, yoyo: true, repeat: 1, ease: 'sine.inOut' }, b);
  master.set('.p2 .ln', { autoAlpha: 0 }, b + 1.2);
  cue(b, 'scan');
  master.fromTo('.p2 .bad', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.25 }, b + 1.2);
  master.fromTo('.p2 .bad .wr', { scale: 0.3 }, { scale: 1, duration: 0.5, ease: 'back.out(2.6)' }, b + 1.25);
  master.fromTo('.p2 .bad .wr', { opacity: 1 }, { opacity: 0.45, duration: 0.3, yoyo: true, repeat: 5 }, b + 1.8);
  up('.p2 .bad > b, .p2 .bad > span, .p2 .bad .cnt', b + 1.4, { y: 14, stagger: 0.1 });
  master.fromTo('.phone.p2', { x: 0 }, { x: 10, duration: 0.05, yoyo: true, repeat: 7, ease: 'none' }, b + 1.2);
  cue(b + 1.2, 'alarm');
  master.fromTo('.s12-cap.c2', { x: 30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, b + 1.5);
  return b + 4.4;
}

function S13(t) {
  bg(t, { floor: 0.3, net: 0.6 });
  kicker('.s13-k', t + 0.1);
  words('.s13-h', t + 0.15);
  master.fromTo('.s13-days', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.6 }, t + 0.5);
  master.fromTo('.s13-track', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 0.8);
  const t0 = t + 1.1, span = 5.0;
  master.fromTo('.s13-track .bar i', { scaleX: 0 }, { scaleX: 1, duration: span, ease: 'none' }, t0);
  const dd = { v: 0 }, dn = $('.s13-days .dn');
  master.fromTo(dd, { v: 0 }, { v: 30, duration: span, ease: 'none', onUpdate: () => { dn.textContent = Math.round(dd.v); } }, t0);
  $$('.s13-steps .st').forEach((s, i) => {
    const ti = t0 + (i / 6) * span + 0.1;
    master.fromTo(s, { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, ease: 'power3.out' }, ti);
    master.fromTo($('.ic', s), { scale: 0.3 }, { scale: 1, duration: 0.5, ease: 'back.out(2.5)' }, ti + 0.1);
    master.to(s, { borderColor: 'rgba(34,211,238,.8)', backgroundColor: 'rgba(12,44,100,.8)', duration: 0.3 }, ti);
    cue(ti, 'tick');
  });
  master.fromTo('.s13-portal', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2)' }, t0 + span - 0.2);
  scramble('.s13-portal', t0 + span - 0.2, 0.9);
  master.fromTo('.s13-commit', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, t0 + span + 0.4);
  cue(t0 + span + 0.4, 'hit');
  return t0 + span + 4.0;
}

function S14(t) {
  cue(t, 'sec_soft');
  bg(t, { floor: 0.5, net: 0.8 });
  kicker('.s14-k', t + 0.05);
  words('.s14-h', t + 0.1);
  const cards = $$('.s14-cards .cd');
  cards.forEach((c, i) => {
    const ti = t + 0.9 + i * 0.3;
    master.fromTo(c, { y: 120, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out' }, ti);
    master.fromTo($('.ico', c), { scale: 0.3 }, { scale: 1, duration: 0.7, ease: 'back.out(2)' }, ti + 0.2);
    up($$('b, small, p', c), ti + 0.4, { y: 16, stagger: 0.1 });
    cue(ti, 'swish');
  });
  const rgs = $$('.s14-cards .rg');
  UPD.push((tt) => rgs.forEach((r, i) => { r.children[0].setAttribute('transform', `rotate(${tt * 20 * (i % 2 ? -1 : 1)} 100 100)`); r.children[1].setAttribute('transform', `rotate(${-tt * 35} 100 100)`); }));
  return t + 8.4;
}

function S15(t) {
  cue(t, 'sec_end');
  bg(t, { floor: 0.55, net: 0.9 });
  master.to('#bug', { autoAlpha: 0, duration: 0.3 }, t);
  pop('.s15-logo', t + 0.3, { from: 0.4 });
  kicker('.s15-k', t + 0.6);
  words('.s15-h', t + 0.7);
  up('.s15-ct > div', t + 1.5, { x: -30, y: 0, stagger: 0.12 });
  up('.s15-offs > div', t + 2.1, { y: 16, stagger: 0.12 });
  master.fromTo('.s15-qr', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.8)' }, t + 1.0);
  master.fromTo('.s15-qr .ln', { y: 0 }, { y: 296, duration: 1.1, yoyo: true, repeat: 5, ease: 'sine.inOut' }, t + 1.6);
  pop('.s15-cta', t + 2.4, { from: 0.7 });
  master.to('.s15-cta', { scale: 1.04, duration: 0.45, yoyo: true, repeat: 5, ease: 'sine.inOut' }, t + 3.2);
  cue(t + 0.3, 'hit'); cue(t + 2.4, 'pop');
  master.to('#stage', { opacity: 0, duration: 1.0, ease: 'none' }, t + 9.4);
  return t + 10.4;
}

/* ================= ASSEMBLY ================= */
function build() {
  buildNet(); buildBlocks();
  let t, x;
  t = S1(0);
  x = blockWipe(t, '#s1', '#s2'); t = S2(x);
  x = glitchCut(t, '#s2', '#s3'); t = S3(x);
  x = blockWipe(t, '#s3', '#s4'); t = S4(x);
  x = blockWipe(t, '#s4', '#s5'); t = S5(x);
  x = blockWipe(t, '#s5', '#s6'); t = S6(x);
  x = glitchCut(t, '#s6', '#s7'); t = S7(x);
  x = blockWipe(t, '#s7', '#s8'); t = S8(x);
  x = glitchCut(t, '#s8', '#s9'); t = S9(x);
  x = blockWipe(t, '#s9', '#s10'); t = S10(x);
  x = blockWipe(t, '#s10', '#s11'); t = S11(x);
  x = glitchCut(t, '#s11', '#s12'); t = S12(x);
  x = blockWipe(t, '#s12', '#s13'); t = S13(x);
  x = glitchCut(t, '#s13', '#s14'); t = S14(x);
  x = blockWipe(t, '#s14', '#s15'); t = S15(x);
  master.set({}, {}, t);
  return t;
}

async function landPoints() { // điểm đất liền (lưới 1.5°) cho bản đồ dạng chấm
  const topo = await (await fetch('node_modules/world-atlas/land-110m.json')).json();
  const land = topojson.feature(topo, topo.objects.land), pts = [];
  for (let la = -40; la <= 72; la += 1.5) for (let lo = 60; lo <= 300; lo += 1.5) {
    const L = lo > 180 ? lo - 360 : lo;
    if (d3.geoContains(land, [L, la])) pts.push([L, la]);
  }
  return pts;
}

async function loadIcons() {
  const els = $$('.ic[data-i]');
  const names = [...new Set([...els.map((e) => e.dataset.i), 'waves', 'sprout', 'hand', 'factory', 'disc-3', 'droplets', 'flask-conical', 'package', 'truck', 'smartphone'])];
  const map = {};
  await Promise.all(names.map(async (n) => { const r = await fetch(`node_modules/lucide-static/icons/${n}.svg`); if (!r.ok) throw new Error('missing icon ' + n); map[n] = await r.text(); }));
  els.forEach((e) => { e.innerHTML = map[e.dataset.i]; });
  window.__icons = map;
}

(async () => {
  await loadIcons();
  window.__qr = await (await fetch('qr_matrix.json')).json();
  window.__land = await landPoints();
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
