/* Viện STP – Giải pháp nông nghiệp thông minh BOM IoT.
   Toàn bộ chuyển động nằm trên một GSAP timeline dừng sẵn (paused);
   render.js tua tới từng khung hình qua window.__seek(t) rồi chụp màn hình. */
gsap.ticker.lagSmoothing(0);
gsap.defaults({ ease: 'power3.out' });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const SVGNS = 'http://www.w3.org/2000/svg';
const master = gsap.timeline({ paused: true });
const MARKS = [];
const cue = (t, type) => MARKS.push({ t: +t.toFixed(3), type });

function rng(seed) { // mulberry32 – vị trí ngẫu nhiên nhưng cố định giữa các lần render
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
function svg(tag, attrs, parent) {
  const e = document.createElementNS(SVGNS, tag);
  Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, v));
  if (parent) parent.appendChild(e);
  return e;
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
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && !ch.classList.contains('ic')) {
        walk(ch);
      }
    });
  };
  walk(el);
  return out;
}
const el = (x) => (typeof x === 'string' ? $(x) : x);
function words(sel, at, o = {}) {
  const ws = splitWords(el(sel));
  master.fromTo(ws, { yPercent: 118, rotate: o.rot ?? 5 },
    { yPercent: 0, rotate: 0, duration: o.dur ?? 0.85, ease: 'power4.out', stagger: o.stagger ?? 0.045 }, at);
  return ws;
}
function up(sel, at, o = {}) {
  master.fromTo(sel, { y: o.y ?? 40, x: o.x ?? 0, autoAlpha: 0 },
    { y: 0, x: 0, autoAlpha: 1, duration: o.dur ?? 0.75, stagger: o.stagger ?? 0.08, ease: o.ease ?? 'power3.out' }, at);
}
function pop(sel, at, o = {}) {
  master.fromTo(sel, { scale: o.from ?? 0.6, autoAlpha: 0, rotate: o.rot ?? 0 },
    { scale: 1, autoAlpha: 1, rotate: 0, duration: o.dur ?? 0.6, stagger: o.stagger ?? 0.08, ease: o.ease ?? 'back.out(1.8)' }, at);
}
function kicker(sel, at) { master.fromTo(sel, { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, at); }
const show = (s, at) => master.set(s, { visibility: 'visible' }, at);
const hide = (s, at) => master.set(s, { visibility: 'hidden' }, at);
function drift(sel, at, dur, o = {}) {
  master.fromTo(sel, { scale: o.from ?? 1.15 }, { scale: o.to ?? 1, duration: dur, ease: 'none', stagger: o.stagger ?? 0 }, at);
}
function float(sel, at, dur, amp = 8) {
  $$(sel).forEach((e, i) => {
    master.to(e, { y: `+=${i % 2 ? amp : -amp}`, duration: dur / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, at + i * 0.13);
  });
}
function counter(sel, from, to, at, dur, dec = 0) {
  const o = { v: from }, e = $(sel);
  master.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { e.textContent = o.v.toFixed(dec); } }, at);
}
function ripple(sel, at, o = {}) {
  master.fromTo(sel, { scale: o.from ?? 1, opacity: o.op ?? 0.8 },
    { scale: o.to ?? 1.6, opacity: 0, duration: o.dur ?? 1.8, ease: 'power1.out', repeat: o.repeat ?? 2, stagger: o.stagger ?? 0.6 }, at);
}

/* ---------- transitions ---------- */
function wipe(at, a, b, dir = 'x', from = -1) {
  const A = $('#wipeA'), B = $('#wipeB'), p = dir === 'x' ? 'xPercent' : 'yPercent';
  master.set([A, B], { visibility: 'visible', xPercent: 0, yPercent: 0 }, at);
  master.set(A, { background: a, [p]: from * 100 }, at);
  master.set(B, { background: b, [p]: from * 100 }, at);
  master.to(A, { [p]: 0, duration: 0.45, ease: 'power3.inOut' }, at);
  master.to(B, { [p]: 0, duration: 0.45, ease: 'power3.inOut' }, at + 0.09);
  master.to(B, { [p]: -from * 100, duration: 0.55, ease: 'power3.inOut' }, at + 0.6);
  master.to(A, { [p]: -from * 100, duration: 0.55, ease: 'power3.inOut' }, at + 0.7);
  master.set([A, B], { visibility: 'hidden' }, at + 1.3);
  cue(at, 'whoosh');
  return at + 0.56;
}
function swap(prev, next, at) { hide(prev, at); show(next, at); }
function circleIn(scene, at, x = '50%', y = '50%', dur = 0.95) {
  show(scene, at);
  master.fromTo(scene, { clipPath: `circle(0% at ${x} ${y})` },
    { clipPath: `circle(150% at ${x} ${y})`, duration: dur, ease: 'power2.inOut' }, at);
  master.set(scene, { clipPath: 'none' }, at + dur);
  cue(at, 'whoosh');
  return at + dur;
}
function push(prev, next, at) {
  show(next, at);
  master.fromTo(prev, { x: 0 }, { x: -1920, duration: 0.95, ease: 'power3.inOut' }, at);
  master.fromTo(next, { x: 1920 }, { x: 0, duration: 0.95, ease: 'power3.inOut' }, at);
  hide(prev, at + 0.95);
  cue(at, 'whoosh');
}

const LEAF = '#3B9E10', MIST = '#F2F9EE', DEEP = '#145E30', NIGHT = '#06281A', LIME = '#9BD85A', TEAL = '#0097B2';

/* ================= SCENES ================= */
function S1(t) {
  show('#s1', t);
  // lưới cảm biến trên cánh đồng
  const f = $('#s1 .field'), R = rng(11), pts = [];
  for (let i = 0; i < 46; i++) {
    const x = R() < 0.72 ? 760 + R() * 1100 : 60 + R() * 1800;
    pts.push([x, 110 + R() * 900]);
  }
  const lines = [];
  pts.forEach((p, i) => {
    pts.map((q, j) => [Math.hypot(p[0] - q[0], p[1] - q[1]), j]).sort((a, b) => a[0] - b[0]).slice(1, 3).forEach(([d, j]) => {
      if (j > i) lines.push(svg('line', { x1: p[0], y1: p[1], x2: pts[j][0], y2: pts[j][1], class: 'ln', 'stroke-dasharray': d, 'stroke-dashoffset': d }, f));
    });
  });
  const rps = pts.filter((_, i) => i % 5 === 0).map((p) => svg('circle', { cx: p[0], cy: p[1], r: 6, class: 'rp', opacity: 0 }, f));
  const nds = pts.map((p) => svg('circle', { cx: p[0], cy: p[1], r: 0, class: 'nd' }, f));
  master.fromTo(nds, { attr: { r: 0 } }, { attr: { r: 5 }, duration: 0.5, stagger: { each: 0.03, from: 'random' }, ease: 'back.out(3)' }, t + 0.1);
  master.to(lines, { attr: { 'stroke-dashoffset': 0 }, duration: 1.4, stagger: 0.02, ease: 'power2.out' }, t + 0.5);
  master.fromTo(rps, { attr: { r: 6 }, opacity: 0.9 }, { attr: { r: 70 }, opacity: 0, duration: 1.8, repeat: 2, stagger: 0.35, ease: 'power1.out' }, t + 1.0);
  words('.s1-a', t + 0.35, { stagger: 0.07, dur: 1 });
  master.to('.s1-a', { y: -175, scale: 0.78, opacity: 0.35, transformOrigin: '0% 0%', duration: 1, ease: 'power3.inOut' }, t + 2.3);
  words('.s1-b', t + 2.75, { stagger: 0.07, dur: 1 });
  master.fromTo('.s1-b .hl', { textShadow: '0 0 0px rgba(155,216,90,0)' }, { textShadow: '0 0 46px rgba(155,216,90,.7)', duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 3.7);
  cue(t + 0.3, 'hit');
  return t + 5.9;
}

function S2(t) {
  show('#s2', t);
  cue(t, 'sec_groove'); cue(t, 'downbeat');
  master.fromTo('.s2-hero .ph', { scale: 0.55, rotate: -10, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 1.1, ease: 'back.out(1.4)' }, t + 0.15);
  drift('.s2-hero .ph img', t, 7, { from: 1.2, to: 1.02 });
  master.fromTo('.s2-hero .r1', { rotate: 0, scale: 0.8, autoAlpha: 0 }, { rotate: 70, scale: 1, autoAlpha: 1, duration: 7, ease: 'none' }, t + 0.3);
  master.fromTo('.s2-hero .r2', { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.2 }, t + 0.5);
  ripple('.s2-hero .wave', t + 1.0, { to: 1.45, stagger: 0.65, repeat: 2, dur: 1.9 });
  pop('.orb', t + 1.4, { stagger: 0.2, from: 0.5 });
  float('.orb', t + 2.2, 4.2, 9);
  pop('.s2-logo', t + 0.3, { from: 0.4 });
  kicker('.s2-k', t + 0.5);
  words('.s2-t1', t + 0.6);
  master.fromTo('.s2-t2', { clipPath: 'inset(-10% 100% -10% 0)', x: -30 }, { clipPath: 'inset(-10% 0% -10% 0)', x: 0, duration: 1.2, ease: 'power3.inOut' }, t + 0.9);
  up('.s2-sub', t + 1.5);
  up('.s2-cert > *', t + 1.8, { stagger: 0.09, y: 24 });
  cue(t + 0.15, 'hit'); cue(t + 1.4, 'pop');
  return t + 6.6;
}

function S3(t) {
  show('#s3', t);
  master.fromTo('#bug', { autoAlpha: 0, y: -24 }, { autoAlpha: 1, y: 0, duration: 0.6 }, t + 0.8);
  kicker('.s3-k', t + 0.1);
  words('.s3-h', t + 0.15);
  up('.s3-sub', t + 0.8);
  master.fromTo('.s3-stat', { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, ease: 'power4.out' }, t + 0.8);
  counter('.s3-stat .n', 0, 25, t + 1.0, 1.5);
  master.fromTo('.s3-stat .plus', { scale: 0, rotate: -90 }, { scale: 1, rotate: 0, duration: 0.5, ease: 'back.out(3)' }, t + 2.3);
  up('.s3-rows .row', t + 1.1, { stagger: 0.2, x: 70, y: 0, dur: 0.85 });
  pop('.s3-rows .lg', t + 1.3, { stagger: 0.2, from: 0.5 });
  cue(t + 2.3, 'pop'); cue(t + 1.1, 'swish');
  return t + 6.9;
}

function S4(t) {
  show('#s4', t);
  words('.s4-h', t + 0.1);
  master.fromTo('.ver', { y: 150, autoAlpha: 0, rotate: (i) => (i ? 3 : -3) }, { y: 0, autoAlpha: 1, rotate: 0, duration: 1, stagger: 0.2, ease: 'power4.out' }, t + 0.6);
  drift('.ver .ph img', t + 0.6, 5.5, { from: 1.25, to: 1.05 });
  pop('.ver .bdg', t + 1.3, { stagger: 0.2 });
  pop('.ver .chips span', t + 1.6, { stagger: 0.08, from: 0.7 });
  cue(t + 0.6, 'swish'); cue(t + 1.6, 'pop');
  // phóng to thẻ LoRaWAN để vào cảnh tiếp theo
  master.to('.ver.v1', { scale: 1.12, duration: 0.8, ease: 'power2.in' }, t + 5.3);
  master.to('#s4', { autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, t + 5.5);
  return t + 5.6;
}

function S5(t) {
  master.fromTo('#s5', { autoAlpha: 0, scale: 1.08 }, { autoAlpha: 1, scale: 1, duration: 0.8, ease: 'power3.out' }, t);
  cue(t, 'whoosh');
  const L = $('#s5 .links'), G = [480, 470];
  const N = [[140, 560], [250, 650], [340, 520], [610, 565], [720, 650], [830, 545], [175, 735], [420, 705], [560, 735], [790, 765], [895, 670]];
  const lns = N.map(([x, y]) => svg('line', { x1: G[0], y1: G[1], x2: x, y2: y, class: 'ln' }, L));
  const pks = N.map(([x, y]) => svg('circle', { cx: x, cy: y, r: 6, class: 'pk', opacity: 0 }, L));
  const nbs = N.map(([x, y]) => svg('circle', { cx: x, cy: y, r: 15, class: 'nb' }, L));
  const nds = N.map(([x, y]) => svg('circle', { cx: x, cy: y, r: 7, class: 'nd' }, L));
  master.fromTo('.hills path', { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.12 }, t + 0.2);
  pop('#s5 .gw', t + 0.5, { from: 0.3 });
  up('#s5 .gwl', t + 0.8, { y: 10 });
  master.fromTo('#s5 .rg', { scale: 0.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 1.1, stagger: 0.18, ease: 'power3.out' }, t + 0.7);
  ripple('#s5 .pulse', t + 1.2, { to: 8, stagger: 1.1, repeat: 2, dur: 2.2 });
  master.fromTo(nbs, { attr: { r: 0 } }, { attr: { r: 15 }, duration: 0.5, stagger: 0.04, ease: 'back.out(3)' }, t + 1.0);
  master.fromTo(nds, { attr: { r: 0 } }, { attr: { r: 7 }, duration: 0.5, stagger: 0.04, ease: 'back.out(3)' }, t + 1.05);
  master.fromTo(lns, { opacity: 0 }, { opacity: 1, duration: 0.6, stagger: 0.04 }, t + 1.4);
  pks.forEach((p, i) => {
    const [x, y] = N[i];
    master.fromTo(p, { attr: { cx: x, cy: y }, opacity: 1 },
      { attr: { cx: G[0], cy: G[1] }, duration: 1.1, ease: 'power1.in', repeat: 3, repeatDelay: 0.5 + (i % 3) * 0.2 }, t + 1.8 + (i % 5) * 0.25);
    master.set(p, { opacity: 0 }, t + 7.7);
  });
  kicker('.s5-k', t + 0.35);
  words('.s5-h', t + 0.4);
  counter('.s5-h .km .wi', 0, 15, t + 0.5, 1.6);
  up('.s5-sub', t + 1.0);
  up('.s5-rows .row', t + 1.4, { stagger: 0.16, x: -30, y: 0 });
  cue(t + 1.8, 'scan'); cue(t + 1.4, 'swish');
  return t + 7.6;
}

function S6(t) {
  show('#s6', t);
  kicker('.s6-k', t + 0.1);
  words('.s6-h', t + 0.15);
  $$('#s6 .st').forEach((s, i) => {
    const ti = t + 0.7 + i * 0.28;
    pop($('.c', s), ti, { from: 0.4 });
    up([$('.n', s), $('.t', s), $('.d', s)], ti + 0.15, { y: 20, stagger: 0.06 });
    cue(ti, 'tick');
  });
  master.fromTo('#s6 .cn', { autoAlpha: 0, scaleX: 0, transformOrigin: '0% 50%' }, { autoAlpha: 1, scaleX: 1, duration: 0.5, stagger: 0.28 }, t + 1.0);
  $$('#s6 .cn').forEach((c, k) => {
    $$('i', c).forEach((d, i) => {
      master.set(d, { x: 0, opacity: 0 }, t);
      master.to(d, { keyframes: { x: [0, 165], opacity: [0, 1, 1, 0], easeEach: 'none' }, duration: 0.9, repeat: 4, ease: 'none' }, t + 2.0 + k * 0.3 + i * 0.3);
    });
  });
  up('.s6-badges span', t + 2.6, { stagger: 0.15, y: 24 });
  cue(t + 2.6, 'pop');
  return t + 7.6;
}

function S7(t) {
  circleIn('#s7', t, '25%', '50%');
  master.fromTo('.s7-phone', { y: 140, rotate: -6, autoAlpha: 0 }, { y: 0, rotate: 0, autoAlpha: 1, duration: 1.1, ease: 'power4.out' }, t + 0.4);
  ripple('.s7-phone .pin', t + 1.5, { from: 0.3, to: 1.8, stagger: 0.5, repeat: 3, dur: 1.3 });
  master.fromTo('.s7-toast', { x: 70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'back.out(1.6)' }, t + 2.3);
  master.fromTo('.s7-toast .bell .ic', { rotate: -16 }, { rotate: 16, duration: 0.08, yoyo: true, repeat: 7, ease: 'none', transformOrigin: '50% 10%' }, t + 2.6);
  master.to('.s7-toast .bell .ic', { rotate: 0, duration: 0.1 }, t + 3.25);
  cue(t + 2.3, 'notif');
  kicker('.s7-k', t + 0.6);
  words('.s7-h', t + 0.65);
  up('.s7-rows .row', t + 1.3, { stagger: 0.16, x: -30, y: 0 });
  return t + 7.3;
}

function S8(t) {
  show('#s8', t);
  kicker('.s8-k', t + 0.1);
  words('.s8-h', t + 0.15);
  master.fromTo('.s8-photo', { x: 140, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.1, ease: 'power4.out' }, t + 0.35);
  drift('.s8-photo img', t + 0.35, 7.5, { from: 1.18, to: 1.02 });
  master.fromTo('.s8-case', { y: 100, rotate: -14, autoAlpha: 0 }, { y: 0, rotate: -4, autoAlpha: 1, duration: 1, ease: 'back.out(1.4)' }, t + 1.1);
  up('.s8-stats .stt', t + 0.8, { stagger: 0.18 });
  const C = 376.99;
  const rings = $$('.s8-stats .val'), vals = $$('.s8-stats .v span');
  master.fromTo(rings[0], { strokeDashoffset: C }, { strokeDashoffset: 0, duration: 1.3, ease: 'power2.out' }, t + 1.0);
  const a = { v: 0 }, b = { v: 0 };
  master.fromTo(a, { v: 0 }, { v: 9, duration: 1.3, ease: 'power2.out', onUpdate: () => { vals[0].textContent = Math.round(a.v); } }, t + 1.0);
  master.fromTo(rings[1], { strokeDashoffset: C }, { strokeDashoffset: 0, duration: 1.6, ease: 'none' }, t + 1.2);
  master.fromTo(b, { v: 0 }, { v: 5, duration: 1.6, ease: 'none', onUpdate: () => { vals[1].textContent = Math.floor(b.v); } }, t + 1.2);
  cue(t + 2.8, 'ding');
  up('.s8-grid .b', t + 1.8, { stagger: 0.13, y: 30 });
  return t + 7.6;
}

function S9(t) {
  push('#s8', '#s9', t);
  words('.s9-h', t + 0.55);
  master.fromTo('.stp .fr', { y: 170, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.18, ease: 'back.out(1.2)' }, t + 0.8);
  up('.stp .cap', t + 1.3, { stagger: 0.18, y: 20 });
  master.fromTo('.stp:nth-child(4) .fr img', { objectPosition: '50% 0%' }, { objectPosition: '50% 100%', duration: 4.5, ease: 'sine.inOut' }, t + 2.2);
  $$('.stp .fr').forEach((f, i) => {
    master.to(f, { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1, ease: 'power1.out' }, t + 2.9 + i * 0.45);
    cue(t + 2.9 + i * 0.45, 'tick');
  });
  return t + 7.5;
}

function S10(t) {
  show('#s10', t);
  kicker('.s10-k', t + 0.1);
  words('.s10-h', t + 0.15);
  const ring = $('.s10-ring');
  const defs = [
    ['N', 'Nitơ', 'amb'], ['P', 'Phốt pho', 'amb'], ['K', 'Kali', 'amb'],
    ['pH', 'Độ pH', 'lf'], ['droplet', 'Độ ẩm', 'lf'], ['thermometer', 'Nhiệt độ', 'lf'],
    ['EC', 'Dẫn điện', 'tl'], ['waves', 'Độ mặn', 'tl'], ['TDS', 'Chất rắn', 'cy'],
  ];
  const chips = defs.map(([big, small, g], i) => {
    const a = (-90 + i * 40) * Math.PI / 180;
    const d = document.createElement('div');
    d.className = `chip9 ${g}`;
    d.style.left = `${280 + 280 * Math.cos(a)}px`;
    d.style.top = `${280 + 280 * Math.sin(a)}px`;
    d.innerHTML = (big.length > 3 ? `<i class="ic" style="font-size:36px">${window.__icons[big]}</i>` : big) + `<small>${small}</small>`;
    ring.appendChild(d);
    return d;
  });
  master.fromTo('.s10-ring .orbit', { scale: 0.6, autoAlpha: 0, rotate: 0 }, { scale: 1, autoAlpha: 1, rotate: 40, duration: 7, ease: 'none' }, t + 0.5);
  master.fromTo('.s10-ring .core', { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.8, ease: 'back.out(2)' }, t + 0.6);
  chips.forEach((c, i) => {
    master.fromTo(c, { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, ease: 'back.out(2.4)' }, t + 1.0 + i * 0.16);
    cue(t + 1.0 + i * 0.16, 'tick');
  });
  const groups = $$('.s10-groups .gp'), map = [[0, 1, 2], [3, 4, 5], [6, 7], [8]];
  groups.forEach((g, k) => {
    const tg = t + 2.7 + k * 0.4;
    master.fromTo(g, { x: 90, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power4.out' }, tg);
    master.to(map[k].map((i) => chips[i]), { scale: 1.18, duration: 0.2, yoyo: true, repeat: 1, ease: 'power1.out' }, tg + 0.1);
  });
  cue(t + 2.7, 'swish');
  return t + 7.8;
}

function S11(t) {
  master.fromTo('#s11', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.7, ease: 'none' }, t);
  cue(t, 'swish');
  drift('.s11-bg img', t, 8.5, { from: 1.15, to: 1 });
  kicker('.s11-k', t + 0.35);
  words('.s11-h', t + 0.4);
  up('.s11-rows .row', t + 1.1, { stagger: 0.16, x: -30, y: 0 });
  master.fromTo('.s11-app', { x: 120, autoAlpha: 0, rotate: 3 }, { x: 0, autoAlpha: 1, rotate: 0, duration: 1.1, ease: 'power4.out' }, t + 0.6);
  master.fromTo('.s11-chat', { y: 80, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'back.out(1.3)' }, t + 1.7);
  master.set(['.s11-chat .msg', '.s11-chat .txt'], { autoAlpha: 0 }, t);
  master.fromTo('.s11-chat .me', { scale: 0.7, autoAlpha: 0, transformOrigin: '100% 100%' }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2)' }, t + 2.4);
  cue(t + 2.4, 'pop');
  master.fromTo('.s11-chat .ai', { scale: 0.7, autoAlpha: 0, transformOrigin: '0% 100%' }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2)' }, t + 3.0);
  master.fromTo('.typing i', { y: 0 }, { y: -7, duration: 0.22, yoyo: true, repeat: 5, stagger: 0.12, ease: 'sine.inOut' }, t + 3.1);
  master.set('.typing', { autoAlpha: 0 }, t + 4.4);
  const txt = $('.s11-chat .txt'), full = txt.textContent, ty = { n: 0 };
  txt.textContent = '';
  master.set(txt, { autoAlpha: 1 }, t + 4.4);
  master.fromTo(ty, { n: 0 }, { n: full.length, duration: 1.9, ease: 'none', onUpdate: () => { txt.textContent = full.slice(0, Math.round(ty.n)); } }, t + 4.4);
  cue(t + 4.4, 'pop');
  return t + 8.2;
}

function S12(t) {
  cue(t, 'sec_tension');
  drift('.s12-bg img', t, 8, { from: 1.12, to: 1 });
  kicker('.s12-k', t + 0.35);
  words('.s12-h', t + 0.4);
  master.fromTo('.s12-stat', { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, t + 0.7);
  counter('.s12-stat .n span', 0, 100, t + 0.9, 1.8);
  $$('.s12-chain .blk').forEach((b, i) => {
    const tb = t + 1.1 + i * 0.36;
    master.fromTo(b, { scale: 0.7, autoAlpha: 0, y: 30 }, { scale: 1, autoAlpha: 1, y: 0, duration: 0.5, ease: 'back.out(2)' }, tb);
    pop($('.top .ic', b), tb + 0.25, { from: 0.2 });
    if (i) master.fromTo($$('.s12-chain .lk')[i - 1], { scaleX: 0 }, { scaleX: 1, duration: 0.3, ease: 'power2.out' }, tb - 0.15);
    cue(tb, 'tick');
  });
  up('.s12-cards .cd', t + 3.0, { stagger: 0.16, y: 50 });
  return t + 7.6;
}

function S13(t) {
  cue(t, 'sec_main');
  words('.s13-h', t + 0.1);
  master.fromTo('.tile', { y: 150, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1, stagger: 0.16, ease: 'power4.out' }, t + 0.55);
  pop('.tile .ico', t + 0.9, { stagger: 0.16 });
  [20, 30, 50].forEach((v, i) => counter(`.tile:nth-child(${i + 1}) .v`, 0, v, t + 1.1 + i * 0.16, 1.5));
  master.fromTo('.tile.g .ico .ic', { y: 0 }, { y: -8, duration: 0.3, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t + 2.6);
  up('.s13-note', t + 2.4, { y: 16 });
  cue(t + 1.1, 'pop');
  return t + 6.9;
}

function S14(t) {
  push('#s13', '#s14', t);
  kicker('.s14-k', t + 0.6);
  words('.s14-h', t + 0.65);
  up('.s14-table .hd .ch', t + 1.0, { stagger: 0.14, y: 30 });
  $$('.s14-table .tr').forEach((r, i) => {
    const tr = t + 1.5 + i * 0.4;
    master.fromTo($('.k', r), { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, tr);
    master.fromTo($$('.c', r), { scale: 0.85, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(1.8)' }, tr + 0.1);
    cue(tr, 'tick');
  });
  pop('.s14-table .ok', t + 3.4, { stagger: 0.1, from: 0.3 });
  return t + 7.2;
}

function S15(t) {
  show('#s15', t);
  cue(t, 'sec_soft');
  kicker('.s15-k', t + 0.1);
  words('.s15-h', t + 0.15);
  const steps = $$('#s15 .step');
  master.set($$('#s15 .on'), { scale: 0 }, t);
  master.set($$('#s15 .lbl, #s15 .step .tt, #s15 .step .ds'), { autoAlpha: 0 }, t);
  pop($$('#s15 .node'), t + 0.6, { stagger: 0.08, from: 0.4 });
  master.fromTo('.s15-line .base', { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, t + 0.6);
  const t0 = t + 1.5, span = 2.7;
  master.fromTo('.s15-line .prog', { scaleX: 0 }, { scaleX: 1, duration: span, ease: 'none' }, t0);
  master.fromTo('.s15-line .dot', { x: 0, autoAlpha: 0 }, { x: 1260, autoAlpha: 1, duration: span, ease: 'none' }, t0);
  master.to('.s15-line .dot', { autoAlpha: 0, duration: 0.3 }, t0 + span);
  steps.forEach((s, i) => {
    const ti = t0 + (i / 3) * span;
    master.to($('.on', s), { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, ti);
    master.to($('.node .ic', s), { color: NIGHT, duration: 0.2 }, ti);
    master.fromTo($('.lbl', s), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4 }, ti);
    master.fromTo([$('.tt', s), $('.ds', s)], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, ti + 0.05);
    cue(ti, 'tick');
  });
  return t0 + span + 2.6;
}

function S16(t) {
  show('#s16', t);
  cue(t, 'sec_end');
  master.to('#bug', { autoAlpha: 0, duration: 0.3 }, t);
  master.fromTo('.s16-map', { x: -80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.2, ease: 'power4.out' }, t + 0.2);
  drift('.s16-map img', t + 0.2, 9, { from: 1.06, to: 1 });
  ripple('.s16-map .pin', t + 1.2, { from: 0.3, to: 2, stagger: 0.35, repeat: 4, dur: 1.4 });
  words('.s16-h', t + 0.3);
  $$('.s16-offs .of').forEach((o, i) => {
    master.fromTo(o, { x: 50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, ease: 'power4.out' }, t + 1.0 + i * 0.18);
  });
  cue(t + 1.0, 'swish');
  pop('.s16-side .logos img', t + 0.7, { stagger: 0.14, from: 0.4 });
  pop('.s16-side .qr', t + 1.1, { from: 0.6 });
  up('.s16-side .ct > div', t + 1.5, { stagger: 0.1, x: 30, y: 0 });
  pop('.s16-cta', t + 2.2, { from: 0.7 });
  master.to('.s16-cta', { scale: 1.04, duration: 0.45, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t + 3.2);
  cue(t + 0.2, 'hit'); cue(t + 2.2, 'pop');
  return t + 9.2;
}

/* ================= ASSEMBLY ================= */
function build() {
  let t, x;
  t = S1(0);
  x = wipe(t, LEAF, MIST, 'x', -1); swap('#s1', '#s2', x);
  t = S2(x);
  x = wipe(t, DEEP, NIGHT, 'y', 1); swap('#s2', '#s3', x);
  t = S3(x);
  x = wipe(t, LEAF, MIST, 'x', 1); swap('#s3', '#s4', x);
  t = S4(x);
  x = t; t = S5(x); hide('#s4', x + 0.7);
  x = wipe(t, LEAF, MIST, 'x', 1); swap('#s5', '#s6', x);
  t = S6(x);
  x = t; t = S7(x); hide('#s6', x + 1);
  x = wipe(t, LEAF, MIST, 'x', -1); swap('#s7', '#s8', x);
  t = S8(x);
  t = S9(t);
  x = wipe(t, DEEP, NIGHT, 'y', 1); swap('#s9', '#s10', x);
  t = S10(x);
  x = t; t = S11(x); hide('#s10', x + 0.7);
  x = wipe(t, TEAL, '#04202A', 'x', 1); swap('#s11', '#s12', x);
  t = S12(x);
  x = wipe(t, LEAF, MIST, 'y', 1); swap('#s12', '#s13', x);
  t = S13(x);
  t = S14(t);
  x = wipe(t, DEEP, NIGHT, 'x', -1); swap('#s14', '#s15', x);
  t = S15(x);
  x = wipe(t, LIME, MIST, 'x', -1); swap('#s15', '#s16', x);
  t = S16(x);
  master.set({}, {}, t);
  return t;
}

async function loadIcons() {
  const els = $$('.ic[data-i]');
  const names = [...new Set([...els.map((e) => e.dataset.i), 'droplet', 'thermometer', 'waves'])];
  const map = {};
  await Promise.all(names.map(async (n) => {
    const r = await fetch(`node_modules/lucide-static/icons/${n}.svg`);
    if (!r.ok) throw new Error('missing icon ' + n);
    map[n] = await r.text();
  }));
  els.forEach((e) => { e.innerHTML = map[e.dataset.i]; });
  window.__icons = map;
}

(async () => {
  await loadIcons();
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
