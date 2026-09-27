/* Viện STP – Video profile (bản 2D).
   Toàn bộ chuyển động nằm trên một GSAP timeline dừng sẵn; render.js tua từng khung hình qua window.__seek(t). */
gsap.ticker.lagSmoothing(0);
gsap.defaults({ ease: 'power3.out' });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const NS = 'http://www.w3.org/2000/svg';
const master = gsap.timeline({ paused: true });
const MARKS = [];
const cue = (t, type) => MARKS.push({ t: +t.toFixed(3), type });
const EM = '#0B7A47', EM2 = '#12A05E', NEO = '#1FD286', LIGHT = '#F3F7F4', DARK = '#04180F';

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function svg(tag, attrs, parent) {
  const e = document.createElementNS(NS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
}
// toạ độ phần tử so với khung 1920×1080 (tính trước khi gắn tween)
function box(el) {
  const r = el.getBoundingClientRect();
  return { x: r.left, y: r.top, w: r.width, h: r.height, cx: r.left + r.width / 2, cy: r.top + r.height / 2, r: r.right, b: r.bottom };
}

/* ---------- helpers ---------- */
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
  master.fromTo(ws, { yPercent: 118, rotate: o.rot ?? 4 },
    { yPercent: 0, rotate: 0, duration: o.dur ?? 0.9, ease: 'power4.out', stagger: o.stagger ?? 0.045 }, at);
  return ws;
}
function wordsOut(ws, at) { master.to(ws, { yPercent: -118, duration: 0.45, ease: 'power2.in', stagger: 0.02 }, at); }
function up(sel, at, o = {}) {
  master.fromTo(sel, { y: o.y ?? 40, x: o.x ?? 0, autoAlpha: 0 },
    { y: 0, x: 0, autoAlpha: 1, duration: o.dur ?? 0.8, stagger: o.stagger ?? 0.1, ease: o.ease ?? 'power3.out' }, at);
}
function pop(sel, at, o = {}) {
  master.fromTo(sel, { scale: o.from ?? 0.6, autoAlpha: 0 },
    { scale: 1, autoAlpha: 1, duration: o.dur ?? 0.65, stagger: o.stagger ?? 0.1, ease: o.ease ?? 'back.out(1.7)' }, at);
}
function kicker(sel, at) { master.fromTo(sel, { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, at); }
const show = (s, at) => master.set(s, { visibility: 'visible' }, at);
const hide = (s, at) => master.set(s, { visibility: 'hidden' }, at);
function drift(sel, at, dur, from = 1.12, to = 1) {
  master.fromTo(sel, { scale: from }, { scale: to, duration: dur, ease: 'none' }, at);
}
function float(sel, at, dur, amp = 8) {
  $$(sel).forEach((e, i) => master.to(e, { y: `+=${i % 2 ? amp : -amp}`, duration: dur / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, at + i * 0.15));
}
function counter(elm, to, at, dur, dec = 0) {
  const o = { v: 0 };
  master.fromTo(o, { v: 0 }, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { elm.textContent = o.v.toFixed(dec); } }, at);
}
function ripple(sel, at, o = {}) {
  master.fromTo(sel, { scale: o.from ?? 1, opacity: o.op ?? 0.8 },
    { scale: o.to ?? 1.6, opacity: 0, duration: o.dur ?? 1.8, ease: 'power1.out', repeat: o.repeat ?? 2, stagger: o.stagger ?? 0.6 }, at);
}
function draw(path, at, dur, ease = 'power2.inOut') {
  const L = path.getTotalLength();
  master.fromTo(path, { strokeDasharray: L, strokeDashoffset: L }, { strokeDashoffset: 0, duration: dur, ease }, at);
}
function flowDash(path, at, dur, per = 74) { // gạch sáng chạy dọc đường ống
  master.fromTo(path, { strokeDashoffset: 0 }, { strokeDashoffset: -per * dur * 1.6, duration: dur, ease: 'none' }, at);
}

/* ---------- motif mạch điện ---------- */
function buildCircuit(svgEl) {
  const R = rng(+svgEl.dataset.seed || 1), snap = (v) => Math.round(v / 20) * 20, paths = [];
  for (let i = 0; i < 16; i++) {
    const side = ['l', 'r', 'l', 'r', 't', 'b'][Math.floor(R() * 6)];
    let x, y, dx = 0, dy = 0;
    if (side === 'l') { x = 0; y = snap(80 + R() * 920); dx = 1; }
    if (side === 'r') { x = 1920; y = snap(80 + R() * 920); dx = -1; }
    if (side === 't') { y = 0; x = snap(120 + R() * 1680); dy = 1; }
    if (side === 'b') { y = 1080; x = snap(120 + R() * 1680); dy = -1; }
    let d = `M${x} ${y}`;
    const L1 = 60 + R() * 200, dg = 30 + R() * 70, s = R() < 0.5 ? 1 : -1, L2 = 40 + R() * 140;
    x += dx * L1; y += dy * L1; d += ` L${x} ${y}`;
    if (dx) { x += dx * dg; y += s * dg; } else { y += dy * dg; x += s * dg; }
    d += ` L${x} ${y}`;
    x += dx * L2; y += dy * L2; d += ` L${x} ${y}`;
    paths.push(svg('path', { d, class: 'tr' }, svgEl));
    svg('circle', { cx: x, cy: y, r: 5, class: 'pd' }, svgEl);
  }
  svgEl.__pulses = paths.filter((_, i) => i % 3 === 0).map((p) => {
    const q = svg('path', { d: p.getAttribute('d'), class: 'pl' }, svgEl);
    const L = p.getTotalLength();
    q.setAttribute('stroke-dasharray', `70 ${L + 80}`);
    q.setAttribute('stroke-dashoffset', 70);
    q.__L = L;
    return q;
  });
}
function circuitLife(scene, at, dur) {
  const s = $(scene + ' .circuit'); if (!s) return;
  master.fromTo(s, { opacity: 0 }, { opacity: 1, duration: 1.2 }, at);
  (s.__pulses || []).forEach((p, i) => {
    master.fromTo(p, { strokeDashoffset: 70 }, { strokeDashoffset: -(p.__L + 10), duration: 2.4, ease: 'none', repeat: Math.max(0, Math.floor(dur / 3.2) - 1), repeatDelay: 0.8 }, at + 0.4 + i * 0.55);
  });
}

/* ---------- transitions ---------- */
function wipe(at, a, b, dir = 'x', from = -1) {
  const A = $('#wipeA'), B = $('#wipeB'), p = dir === 'x' ? 'xPercent' : 'yPercent';
  master.set([A, B], { visibility: 'visible', xPercent: 0, yPercent: 0 }, at);
  master.set(A, { background: a, [p]: from * 100 }, at);
  master.set(B, { background: b, [p]: from * 100 }, at);
  master.to(A, { [p]: 0, duration: 0.5, ease: 'power3.inOut' }, at);
  master.to(B, { [p]: 0, duration: 0.5, ease: 'power3.inOut' }, at + 0.1);
  master.to(B, { [p]: -from * 100, duration: 0.6, ease: 'power3.inOut' }, at + 0.66);
  master.to(A, { [p]: -from * 100, duration: 0.6, ease: 'power3.inOut' }, at + 0.76);
  master.set([A, B], { visibility: 'hidden' }, at + 1.4);
  cue(at, 'whoosh');
  return at + 0.62;
}
function swap(prev, next, at) { hide(prev, at); show(next, at); }
function circleIn(scene, at, x = '50%', y = '50%', dur = 1.0) {
  show(scene, at);
  master.fromTo(scene, { clipPath: `circle(0% at ${x} ${y})` }, { clipPath: `circle(150% at ${x} ${y})`, duration: dur, ease: 'power2.inOut' }, at);
  master.set(scene, { clipPath: 'none' }, at + dur);
  cue(at, 'whoosh');
}
function push(prev, next, at) {
  show(next, at);
  master.fromTo(prev, { x: 0 }, { x: -1920, duration: 1.0, ease: 'power3.inOut' }, at);
  master.fromTo(next, { x: 1920 }, { x: 0, duration: 1.0, ease: 'power3.inOut' }, at);
  hide(prev, at + 1.0);
  cue(at, 'whoosh');
}
function fadeIn(scene, at, dur = 0.8) {
  master.fromTo(scene, { autoAlpha: 0 }, { autoAlpha: 1, duration: dur, ease: 'none' }, at);
}
function bignum(scene, at) {
  master.fromTo(scene + ' .bignum', { x: 120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.4, ease: 'power4.out' }, at);
}

/* ================= SCENES ================= */
function S1(t) {
  show('#s1', t);
  circuitLife('#s1', t, 7);
  master.fromTo('#s1 .glow', { scale: 0.6, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 7, ease: 'sine.out' }, t);
  const a = words('#s1 .l1', t + 0.3, { stagger: 0.08, dur: 1 });
  wordsOut(a, t + 2.1);
  const b = words('#s1 .l2', t + 2.45, { stagger: 0.08, dur: 1 });
  wordsOut(b, t + 4.2);
  words('#s1 .l3', t + 4.55, { stagger: 0.06, dur: 1 });
  cue(t + 0.3, 'hit'); cue(t + 2.45, 'swish'); cue(t + 4.55, 'swish');
  return t + 7.4;
}

function S2(t) {
  circleIn('#s2', t, '50%', '25%', 1.1);
  cue(t, 'downbeat'); cue(t, 'sec_groove');
  circuitLife('#s2', t, 7);
  master.fromTo('.s2-logo', { scale: 0.3, rotate: -20, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.2, ease: 'back.out(1.6)' }, t + 0.3);
  ripple('.s2-rings i', t + 0.7, { to: 2.4, stagger: 0.7, repeat: 2, dur: 2.1 });
  words('.s2-k', t + 0.8, { stagger: 0.03 });
  words('.s2-h', t + 1.0, { stagger: 0.06, dur: 1 });
  up('.s2-sub', t + 1.9, { y: 24 });
  cue(t + 0.3, 'hit');
  return t + 6.8;
}

function S3(t) {
  show('#s3', t);
  master.fromTo('#bug', { autoAlpha: 0, y: -24 }, { autoAlpha: 1, y: 0, duration: 0.6 }, t + 0.8);
  circuitLife('#s3', t, 9);
  // nối 4 hoạt động → 3 đối tượng
  const flow = $('.s3-flow'), fb = box(flow), L = $('.s3-flow .lines');
  const A = $$('.s3-flow .col.a .chip').map(box), B = $$('.s3-flow .col.b .chip').map(box);
  const paths = [];
  A.forEach((a) => B.forEach((b) => {
    const x1 = a.r - fb.x, y1 = a.cy - fb.y, x2 = b.x - fb.x, y2 = b.cy - fb.y, mx = (x1 + x2) / 2;
    paths.push(svg('path', { d: `M${x1} ${y1} C${mx} ${y1} ${mx} ${y2} ${x2} ${y2}` }, L));
  }));
  kicker('.s3-k', t + 0.1);
  words('.s3-h', t + 0.15);
  master.fromTo('.s3-vusta', { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out' }, t + 0.9);
  pop('.s3-vusta .ico', t + 1.1, { from: 0.4 });
  up('.s3-mis', t + 1.5, { y: 24 });
  up('.s3-flow .col.a .chip', t + 1.6, { x: -40, y: 0, stagger: 0.14 });
  paths.forEach((p, i) => draw(p, t + 2.3 + (i % 3) * 0.08 + Math.floor(i / 3) * 0.12, 0.9));
  up('.s3-flow .col.b .chip', t + 2.9, { x: 40, y: 0, stagger: 0.16 });
  const pk = paths.filter((_, i) => i % 2 === 0).map((p) => { const c = svg('circle', { r: 6, class: 'pk', opacity: 0 }, L); c.__p = p; return c; });
  pk.forEach((c, i) => {
    const o = { v: 0 }, P = c.__p, len = P.getTotalLength();
    master.fromTo(o, { v: 0 }, { v: 1, duration: 1.3, ease: 'none', repeat: 2, repeatDelay: 0.5, onUpdate: () => { const q = P.getPointAtLength(o.v * len); c.setAttribute('cx', q.x); c.setAttribute('cy', q.y); c.setAttribute('opacity', o.v > 0.02 && o.v < 0.98 ? 1 : 0); } }, t + 3.6 + i * 0.25);
  });
  cue(t + 1.6, 'swish'); cue(t + 2.9, 'pop');
  return t + 8.6;
}

function S4(t) {
  show('#s4', t);
  circuitLife('#s4', t, 9);
  const L = $('.s4-links'), hub = box($('.s4-hub'));
  const cards = $$('#s4 .pl');
  const lines = cards.map((c, i) => {
    const b = box(c), ex = i % 2 ? b.x : b.r, ey = b.cy;
    const p = svg('path', { d: `M${hub.cx} ${hub.cy} L${(hub.cx + ex) / 2} ${hub.cy + (ey - hub.cy) * 0.55} L${ex} ${ey}`, class: 'ln' }, L);
    return p;
  });
  master.fromTo('.s4-orbit', { scale: 0.5, autoAlpha: 0, rotate: -40 }, { scale: 1, autoAlpha: 1, rotate: 30, duration: 8, ease: 'power2.out' }, t + 0.3);
  master.fromTo('.s4-hub', { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.8)' }, t + 0.4);
  cue(t + 0.4, 'hit');
  cards.forEach((c, i) => {
    const ti = t + 1.3 + i * 0.45;
    draw(lines[i], ti - 0.2, 0.6);
    master.fromTo(c, { scale: 0.85, autoAlpha: 0, y: 30 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.7, ease: 'back.out(1.6)' }, ti);
    pop($('.ico', c), ti + 0.15, { from: 0.3 });
    cue(ti, 'tick');
    const dot = svg('circle', { r: 7, class: 'pk', opacity: 0 }, L), o = { v: 0 }, len = lines[i].getTotalLength();
    master.fromTo(o, { v: 0 }, { v: 1, duration: 1.1, ease: 'none', repeat: 3, repeatDelay: 0.4, onUpdate: () => { const q = lines[i].getPointAtLength(o.v * len); dot.setAttribute('cx', q.x); dot.setAttribute('cy', q.y); dot.setAttribute('opacity', o.v < 0.97 ? 1 : 0); } }, t + 3.4 + i * 0.3);
  });
  float('#s4 .pl', t + 3.4, 4.6, 6);
  // phóng vào trụ cột 01
  master.to('#s4 .pl.p1', { scale: 1.08, duration: 0.8, ease: 'power2.in' }, t + 8.0);
  master.to('#s4', { autoAlpha: 0, scale: 1.12, transformOrigin: '20% 20%', duration: 0.7, ease: 'power2.in' }, t + 8.2);
  return t + 8.4;
}

function S5(t) {
  master.fromTo('#s5', { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 1, scale: 1, duration: 0.9 }, t);
  cue(t, 'whoosh');
  circuitLife('#s5', t, 9);
  bignum('#s5', t + 0.2);
  kicker('.s5-k', t + 0.3);
  words('.s5-h', t + 0.35);
  // đô thị dữ liệu: cột nhà + đường xu hướng
  const S = $('.s5-city'), R = rng(5);
  const defs = svg('defs', {}, S), g = svg('linearGradient', { id: 'bg1', x1: 0, y1: 0, x2: 0, y2: 1 }, defs);
  svg('stop', { offset: 0, 'stop-color': '#1FD286' }, g); svg('stop', { offset: 1, 'stop-color': '#0B7A47' }, g);
  [120, 220, 320].forEach((y) => svg('line', { x1: 0, x2: 760, y1: y, y2: y, class: 'gr' }, S));
  svg('line', { x1: 0, x2: 760, y1: 420, y2: 420, class: 'gr', style: 'stroke:rgba(11,122,71,.4);stroke-width:3' }, S);
  const bars = [], pts = [];
  for (let i = 0; i < 12; i++) {
    const h = 70 + i * 16 + R() * 70, x = 18 + i * 61;
    bars.push([svg('rect', { x, y: 420, width: 46, height: 0, rx: 6, class: 'bld', opacity: 0.35 + i * 0.05 }, S), h]);
    pts.push([x + 23, 420 - h - 34]);
  }
  const line = svg('path', { d: 'M' + pts.map((p) => p.join(' ')).join(' L'), class: 'ln' }, S);
  const dots = pts.filter((_, i) => i % 3 === 2).map((p) => svg('circle', { cx: p[0], cy: p[1], r: 9, class: 'dt' }, S));
  master.fromTo(S, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 0.7);
  bars.forEach(([r, h], i) => master.fromTo(r, { attr: { y: 420, height: 0 } }, { attr: { y: 420 - h, height: h }, duration: 0.9, ease: 'power3.out' }, t + 0.8 + i * 0.07));
  draw(line, t + 1.7, 1.6);
  pop(dots, t + 2.2, { stagger: 0.25, from: 0.2 });
  up('.s5-cards .cd', t + 1.1, { x: 60, y: 0, stagger: 0.2, dur: 0.9 });
  pop('.s5-cards .ico', t + 1.3, { stagger: 0.2, from: 0.4 });
  cue(t + 1.1, 'swish');
  return t + 8.6;
}

function S6(t) {
  push('#s5', '#s6', t);
  circuitLife('#s6', t, 9);
  kicker('.s6-k', t + 0.7);
  words('.s6-h', t + 0.75);
  master.fromTo('.s6-path .base', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, t + 1.0);
  $$('#s6 .stair').forEach((s, i) => {
    const ti = t + 1.3 + i * 0.55;
    master.fromTo(s, { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.5)' }, ti);
    pop($('.ico', s), ti + 0.15, { from: 0.3 });
    cue(ti, 'tick');
  });
  draw($('.s6-path .prog'), t + 1.5, 2.2, 'none');
  return t + 8.2;
}

function S7(t) {
  circuitLife('#s7', t, 8);
  bignum('#s7', t + 0.2);
  kicker('.s7-k', t + 0.3);
  words('.s7-h', t + 0.35);
  up('.s7-sub', t + 1.0, { y: 20 });
  master.fromTo('.s7-art .chip', { scale: 0.4, rotate: -15, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.1, ease: 'back.out(1.6)' }, t + 0.8);
  master.fromTo('.s7-art .chip .ic', { y: -30 }, { y: 0, duration: 1.2, ease: 'bounce.out' }, t + 1.2);
  ripple('.s7-art .rg', t + 1.3, { to: 2.1, stagger: 0.7, repeat: 2, dur: 2.1 });
  up('.s7-cards .cd', t + 1.5, { x: 60, y: 0, stagger: 0.22 });
  pop('.s7-cards .ico', t + 1.7, { stagger: 0.22, from: 0.4 });
  cue(t + 0.8, 'hit'); cue(t + 1.5, 'swish');
  return t + 7.6;
}

function S8(t) {
  push('#s7', '#s8', t);
  circuitLife('#s8', t, 8);
  words('.s8-h', t + 0.6);
  $$('#s8 .col').forEach((c, i) => {
    const ti = t + 1.1 + i * 0.22;
    master.fromTo(c, { y: 120, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out' }, ti);
    pop($('.ico', c), ti + 0.2, { from: 0.3 });
    up($$('li', c), ti + 0.5, { y: 16, stagger: 0.1 });
  });
  cue(t + 1.1, 'swish');
  return t + 8.1;
}

function S9(t) {
  circuitLife('#s9', t, 9);
  kicker('.s9-k', t + 0.1);
  words('.s9-h', t + 0.15);
  const segs = $$('.s9-shield .sg');
  master.fromTo(segs[0], { y: -140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)' }, t + 0.8);
  master.fromTo(segs[1], { x: -180, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)' }, t + 1.0);
  master.fromTo(segs[2], { y: 140, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.6)' }, t + 1.2);
  draw($('.s9-shield .ck'), t + 1.9, 0.6);
  cue(t + 1.9, 'ding');
  up('.s9-rows .rw', t + 1.2, { x: 60, y: 0, stagger: 0.18 });
  drift('.s9-rows img', t + 1.2, 7, 1.2, 1.02);
  master.fromTo('.s9-law', { yPercent: 100 }, { yPercent: 0, duration: 0.8, ease: 'power3.out' }, t + 2.6);
  cue(t + 1.2, 'swish');
  return t + 8.6;
}

function S10(t) {
  circuitLife('#s10', t, 9);
  bignum('#s10', t + 0.2);
  kicker('.s10-k', t + 0.3);
  words('.s10-h', t + 0.35);
  pop('.s10-law', t + 1.0, { from: 0.8 });
  const M = window.__qr, G = $('.s10-qr .grid'), c = 331 / M.length, R = rng(9), cells = [];
  M.forEach((row, y) => [...row].forEach((v, x) => {
    if (v !== '1') return;
    const i = document.createElement('i'); i.style.left = `${x * c}px`; i.style.top = `${y * c}px`;
    G.appendChild(i); cells.push([i, R()]);
  }));
  master.fromTo('.s10-qr', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.5)' }, t + 0.8);
  cells.forEach(([i, r]) => master.fromTo(i, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'back.out(3)' }, t + 1.1 + r * 1.3));
  master.fromTo('.s10-qr .scan', { y: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.2 }, t + 2.6);
  master.to('.s10-qr .scan', { y: 320, duration: 1.0, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + 2.6);
  master.to('.s10-qr .scan', { autoAlpha: 0, duration: 0.2 }, t + 4.6);
  cue(t + 2.6, 'scan');
  master.fromTo('.s10-box', { y: 80, autoAlpha: 0, rotate: 8 }, { y: 0, autoAlpha: 1, rotate: 0, duration: 0.9, ease: 'back.out(1.6)' }, t + 1.6);
  up('.s10-tags .tg', t + 1.4, { x: 60, y: 0, stagger: 0.18 });
  pop('.s10-tags .ico', t + 1.6, { stagger: 0.18, from: 0.4 });
  up('.s10-tags .cap', t + 2.6, { y: 16 });
  cue(t + 1.4, 'swish');
  return t + 8.1;
}

function S11(t) {
  push('#s10', '#s11', t);
  circuitLife('#s11', t, 8);
  words('.s11-h', t + 0.6);
  up('.s11-sub', t + 1.1, { y: 20 });
  master.fromTo('.s11-pipe .base', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, t + 1.2);
  $$('#s11 .gs').forEach((g, i) => {
    const ti = t + 1.3 + i * 0.4;
    master.fromTo($('.c', g), { scale: 0.5, autoAlpha: 0, y: 40 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.8, ease: 'back.out(1.6)' }, ti);
    up([$('.n', g), $('.t', g), $('.d', g)], ti + 0.2, { y: 20, stagger: 0.08 });
    cue(ti, 'tick');
  });
  master.fromTo('.s11-pipe .flow', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 2.4);
  flowDash($('.s11-pipe .flow'), t + 2.4, 5.2);
  return t + 7.6;
}

function S12(t) {
  circleIn('#s12', t, '50%', '50%');
  circuitLife('#s12', t, 8);
  const L = $('.s12-links'), ph = box($('.s12-phone'));
  const lk = $$('#s12 .ft').map((f, i) => {
    const b = box(f), left = b.cx < 960, x1 = left ? b.r : b.x, y1 = b.cy, x2 = left ? ph.x : ph.r, y2 = ph.y + 200 + i * 90;
    const mx = (x1 + x2) / 2;
    const p = svg('path', { d: `M${x1} ${y1} L${mx} ${y1} L${mx} ${y2} L${x2} ${y2}` }, L);
    svg('circle', { cx: x1, cy: y1, r: 6 }, L);
    return p;
  });
  kicker('.s12-k', t + 0.5);
  words('.s12-h', t + 0.55);
  master.fromTo('.s12-phone', { y: 160, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'power4.out' }, t + 0.6);
  up('.s12-phone .scr > *', t + 1.3, { y: 20, stagger: 0.1 });
  $$('#s12 .ft').forEach((f, i) => {
    const ti = t + 1.8 + i * 0.3;
    master.fromTo(f, { x: f.getBoundingClientRect().left < 960 ? -60 : 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, ti);
    draw(lk[i], ti + 0.1, 0.6);
    cue(ti, 'pop');
  });
  master.fromTo('#s12 .s12-links circle', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.3 }, t + 1.9);
  return t + 7.6;
}

function S13(t) {
  push('#s12', '#s13', t);
  circuitLife('#s13', t, 8);
  kicker('.s13-k', t + 0.6);
  words('.s13-h', t + 0.65);
  up('.s13-rows .rw', t + 1.3, { x: -40, y: 0, stagger: 0.25 });
  pop('.s13-rows .dot', t + 1.35, { stagger: 0.25, from: 0.2 });
  // camera quét mã → trang sản phẩm đã xác thực
  const bc = $('.scr.prod .bc'), R = rng(21);
  for (let x = 0; x < 196;) { const w = 2 + Math.floor(R() * 5); svg('rect', { x, y: 0, width: w, height: 90 }, bc); x += w + 2 + Math.floor(R() * 4); }
  master.fromTo('.s13-phone', { y: 160, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.1, ease: 'power4.out' }, t + 0.8);
  master.set('.scr.prod .pg', { autoAlpha: 0 }, t);
  master.fromTo('.scr.prod .ln', { y: 0 }, { y: 216, duration: 0.8, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + 1.7);
  cue(t + 1.7, 'scan');
  master.fromTo('.scr.prod .pg', { autoAlpha: 0, yPercent: 30 }, { autoAlpha: 1, yPercent: 0, duration: 0.7, ease: 'power3.out' }, t + 3.4);
  master.fromTo('.scr.prod .ok', { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2.5)' }, t + 4.0);
  cue(t + 4.0, 'ding');
  $$('.scr.prod .tl span').forEach((s, i) => master.to(s, { backgroundColor: '#E3F4EA', color: '#0B7A47', duration: 0.3 }, t + 4.4 + i * 0.35));
  up('.scr.prod .rowi', t + 4.5, { y: 12, stagger: 0.1 });
  return t + 8.1;
}

function S14(t) {
  fadeIn('#s14', t, 0.9);
  hide('#s13', t + 0.9);
  cue(t, 'sec_tension');
  circuitLife('#s14', t, 6);
  master.fromTo('#s14 .glow', { scale: 0.7, opacity: 0 }, { scale: 1.1, opacity: 1, duration: 6, ease: 'sine.out' }, t);
  master.fromTo('.s14-q', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 0.9, duration: 1.0 }, t + 0.5);
  words('.s14-t', t + 0.8, { stagger: 0.07, dur: 1.1 });
  return t + 6.8;
}

function S15(t) {
  master.fromTo('#s15', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'none' }, t);
  hide('#s14', t + 0.8);
  cue(t, 'sec_main');
  circuitLife('#s15', t, 9);
  kicker('.s15-k', t + 0.4);
  words('.s15-h', t + 0.45);
  up('.s15-rows .rw', t + 1.2, { x: -40, y: 0, stagger: 0.2 });
  pop('.s15-demo .serial', t + 1.0, { from: 0.6 });
  $$('.s15-demo .lk path').forEach((p, i) => draw(p, t + 1.8 + i * 0.12, 0.6));
  $$('.s15-demo .loc').forEach((l, i) => {
    const ti = t + 2.3 + i * 0.35;
    master.fromTo(l, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, ease: 'back.out(1.7)' }, ti);
    master.to($('.pn', l), { backgroundColor: '#FF5A5A', boxShadow: '0 0 0 10px rgba(255,90,90,.25)', duration: 0.3 }, t + 3.7);
    master.to(l, { borderColor: 'rgba(255,110,110,.8)', duration: 0.3 }, t + 3.7);
    cue(ti, 'notif');
  });
  master.to('.s15-demo .lk path', { stroke: 'rgba(255,110,110,.8)', duration: 0.3 }, t + 3.7);
  master.fromTo('.s15-demo .alert', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2.2)' }, t + 4.0);
  master.fromTo('.s15-demo .alert', { x: 0 }, { x: 8, duration: 0.05, yoyo: true, repeat: 7, ease: 'none' }, t + 4.6);
  cue(t + 4.0, 'stamp');
  return t + 8.6;
}

function S16(t) {
  circuitLife('#s16', t, 8);
  bignum('#s16', t + 0.2);
  kicker('.s16-k', t + 0.3);
  words('.s16-h', t + 0.35);
  master.fromTo('.s16-steps .ln i', { scaleX: 0 }, { scaleX: 1, duration: 2.4, ease: 'power1.inOut' }, t + 1.2);
  $$('#s16 .sp').forEach((s, i) => {
    const ti = t + 1.1 + i * 0.6;
    master.fromTo(s, { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out' }, ti);
    pop($('.ico', s), ti + 0.2, { from: 0.3 });
    cue(ti, 'tick');
  });
  return t + 8.1;
}

function S17(t) {
  push('#s16', '#s17', t);
  circuitLife('#s17', t, 8);
  kicker('.s17-k', t + 0.6);
  words('.s17-h', t + 0.65);
  up('.s17-txt', t + 1.3, { y: 20 });
  up('.s17-stack span', t + 1.8, { x: -40, y: 0, stagger: 0.15 });
  up('.s17-logos > *', t + 2.4, { y: 20, stagger: 0.1 });
  master.fromTo('.s17-field', { x: 120, autoAlpha: 0, rotate: 2 }, { x: 0, autoAlpha: 1, rotate: 0, duration: 1.1, ease: 'power4.out' }, t + 0.8);
  master.fromTo('.s17-field .rows', { backgroundPositionX: 0 }, { backgroundPositionX: 120, duration: 7, ease: 'none' }, t + 0.8);
  pop('.s17-field .pin', t + 1.6, { stagger: 0.2, from: 0.2 });
  ripple('.s17-field .pin i', t + 1.9, { to: 2.4, stagger: 0.3, repeat: 3, dur: 1.4 });
  pop('.s17-field .dc', t + 2.2, { stagger: 0.25, from: 0.6 });
  float('.s17-field .dc', t + 3.0, 4.5, 8);
  cue(t + 2.2, 'pop');
  return t + 8.1;
}

function S18(t) {
  circuitLife('#s18', t, 8);
  words('.s18-h', t + 0.1);
  master.fromTo('.s18-pipe .base', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6 }, t + 0.8);
  $$('#s18 .ar').forEach((a, i) => {
    const ti = t + 0.9 + i * 0.4;
    master.fromTo($('.c', a), { scale: 0.4, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.7)' }, ti);
    pop($('.n', a), ti + 0.2, { from: 0.2 });
    up([$('.t', a), $('.d', a)], ti + 0.3, { y: 20, stagger: 0.08 });
    cue(ti, 'tick');
  });
  ripple('.ar.a2 .wv', t + 1.8, { to: 1.7, stagger: 0.6, repeat: 3, dur: 1.3 });
  master.fromTo('.s18-pipe .flow', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 2.6);
  flowDash($('.s18-pipe .flow'), t + 2.6, 5);
  return t + 7.6;
}

function S19(t) {
  push('#s18', '#s19', t);
  circuitLife('#s19', t, 8);
  words('.s19-h', t + 0.6);
  master.fromTo('.s19-dev .bx', { y: -120, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'back.out(1.5)' }, t + 0.9);
  master.fromTo('.s19-dev .pr', { attr: { height: 0 } }, { attr: { height: 290 }, duration: 0.8, stagger: 0.1, ease: 'power3.out' }, t + 1.4);
  master.fromTo('.s19-dev .leds circle', { opacity: 0.2 }, { opacity: 1, duration: 0.25, stagger: { each: 0.12, repeat: 5, yoyo: true } }, t + 1.9);
  $$('#s19 .bk').forEach((b, i) => {
    const ti = t + 1.6 + i * 0.3;
    master.fromTo(b, { x: i < 2 ? -70 : 70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, ti);
    pop($('.ico', b), ti + 0.15, { from: 0.4 });
    cue(ti, 'pop');
  });
  return t + 8.1;
}

function S20(t) {
  circleIn('#s20', t, '70%', '55%');
  circuitLife('#s20', t, 9);
  kicker('.s20-k', t + 0.4);
  words('.s20-h', t + 0.45);
  up('.s20-list span', t + 1.1, { y: 16, stagger: 0.07 });
  up('.s20-note', t + 2.2, { y: 24 });
  master.fromTo('.s20-tab', { y: 160, autoAlpha: 0, rotate: 2 }, { y: 0, autoAlpha: 1, rotate: 0, duration: 1.1, ease: 'power4.out' }, t + 0.7);
  const P = $('.s20-tab .pl'), R = rng(3), pts = [];
  for (let i = 0; i <= 28; i++) pts.push([i * 20, 110 - Math.sin(i / 3) * 30 - R() * 26]);
  P.setAttribute('d', 'M' + pts.map((p) => p.join(' ')).join(' L'));
  draw(P, t + 1.5, 1.8, 'none');
  const C = 301.6, fr = [0.62, 0.7, 0.45, 0.88];
  $$('.s20-tab .gg .vl').forEach((v, i) => master.fromTo(v, { strokeDashoffset: C }, { strokeDashoffset: C * (1 - fr[i]), duration: 1.3, ease: 'power2.out' }, t + 1.6 + i * 0.15));
  master.fromTo('.s20-tab .gg.warn', { boxShadow: '0 0 0 0px rgba(217,58,58,0)' }, { boxShadow: '0 0 0 6px rgba(217,58,58,.55)', duration: 0.3, yoyo: true, repeat: 5 }, t + 3.4);
  master.fromTo('.s20-sms', { scale: 0.6, autoAlpha: 0, y: 30 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.6, ease: 'back.out(2.2)' }, t + 3.6);
  master.fromTo('.s20-sms .ic', { rotate: -12 }, { rotate: 12, duration: 0.08, yoyo: true, repeat: 7, ease: 'none' }, t + 4.1);
  cue(t + 3.6, 'notif');
  return t + 8.6;
}

function S21(t) {
  circuitLife('#s21', t, 7);
  cue(t, 'sec_soft');
  words('.s21-h', t + 0.1);
  $$('#s21 .tier').forEach((tr, i) => {
    const ti = t + 0.8 + i * 0.6;
    master.fromTo($('.lb', tr), { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, ti);
    master.fromTo($$('.tiles span', tr), { y: 50, autoAlpha: 0, scale: 0.9 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, stagger: 0.08, ease: 'back.out(1.8)' }, ti + 0.15);
    cue(ti + 0.15, 'tick');
  });
  float('#s21 .tiles span', t + 3.0, 4, 4);
  return t + 7.2;
}

function S22(t) {
  show('#s22', t);
  cue(t, 'sec_end');
  master.to('#bug', { autoAlpha: 0, duration: 0.3 }, t);
  master.fromTo('.s22-map', { x: -80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.2, ease: 'power4.out' }, t + 0.2);
  drift('.s22-map img', t + 0.2, 9.5, 1.06, 1);
  ripple('.s22-map .pin', t + 1.2, { from: 0.3, to: 2, stagger: 0.35, repeat: 4, dur: 1.4 });
  words('.s22-h', t + 0.3);
  $$('.s22-offs .of').forEach((o, i) => master.fromTo(o, { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power4.out' }, t + 1.0 + i * 0.18));
  pop('.s22-side .lg', t + 0.7, { from: 0.4 });
  pop('.s22-side .qr', t + 1.1, { from: 0.6 });
  up('.s22-side .ct > div', t + 1.5, { x: 30, y: 0, stagger: 0.1 });
  pop('.s22-cta', t + 2.2, { from: 0.7 });
  master.to('.s22-cta', { scale: 1.04, duration: 0.45, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t + 3.4);
  cue(t + 0.2, 'hit'); cue(t + 1.0, 'swish');
  return t + 9.4;
}

/* ================= ASSEMBLY ================= */
function build() {
  let t, x;
  $$('.circuit').forEach(buildCircuit);
  t = S1(0);
  t = S2(t); hide('#s1', t - 5.7);
  x = wipe(t, EM2, LIGHT, 'x', -1); swap('#s2', '#s3', x);
  t = S3(x);
  x = wipe(t, EM, DARK, 'y', 1); swap('#s3', '#s4', x);
  t = S4(x);
  x = t; t = S5(x); hide('#s4', x + 0.8);
  t = S6(t);
  x = wipe(t, EM2, LIGHT, 'x', 1); swap('#s6', '#s7', x);
  t = S7(x);
  t = S8(t);
  x = wipe(t, EM2, LIGHT, 'x', -1); swap('#s8', '#s9', x);
  t = S9(x);
  x = wipe(t, EM, LIGHT, 'y', 1); swap('#s9', '#s10', x);
  t = S10(x);
  t = S11(t);
  x = t; t = S12(x); hide('#s11', x + 1.0);
  t = S13(t);
  t = S14(t);
  t = S15(t);
  x = wipe(t, EM2, LIGHT, 'x', 1); swap('#s15', '#s16', x);
  t = S16(x);
  t = S17(t);
  x = wipe(t, EM2, LIGHT, 'x', -1); swap('#s17', '#s18', x);
  t = S18(x);
  t = S19(t);
  x = t; t = S20(x); hide('#s19', x + 1.0);
  x = wipe(t, EM2, LIGHT, 'y', 1); swap('#s20', '#s21', x);
  t = S21(x);
  x = wipe(t, NEO, LIGHT, 'x', -1); swap('#s21', '#s22', x);
  t = S22(x);
  master.set({}, {}, t);
  return t;
}

async function loadIcons() {
  const els = $$('.ic[data-i]');
  const names = [...new Set(els.map((e) => e.dataset.i))];
  const map = {};
  await Promise.all(names.map(async (n) => {
    const r = await fetch(`../node_modules/lucide-static/icons/${n}.svg`);
    if (!r.ok) throw new Error('missing icon ' + n);
    map[n] = await r.text();
  }));
  els.forEach((e) => { e.innerHTML = map[e.dataset.i]; });
}

(async () => {
  await loadIcons();
  window.__qr = await (await fetch('../qr_matrix.json')).json();
  await document.fonts.ready;
  await Promise.all($$('img').map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = r; }))));
  await Promise.all($$('img').map((i) => i.decode().catch(() => {})));
  const dur = build();
  master.seek(0, false);
  window.__duration = dur;
  window.__marks = MARKS.sort((a, b) => a.t - b.t);
  window.__seek = (t) => { master.seek(t, false); };
  window.__ready = true;
  if (location.search.includes('play')) master.play(0);
  const m = location.search.match(/t=([\d.]+)/);
  if (m) master.seek(parseFloat(m[1]), false);
})();
