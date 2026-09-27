/* STP × DAKO – video giới thiệu dịch vụ ATVSLĐ.
   Toàn bộ chuyển động nằm trên một GSAP timeline dừng sẵn (paused);
   render.js tua tới từng khung hình qua window.__seek(t) rồi chụp màn hình. */
gsap.ticker.lagSmoothing(0);
gsap.defaults({ ease: 'power3.out' });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const master = gsap.timeline({ paused: true });
const MARKS = []; // gợi ý âm thanh: {t, type}
const cue = (t, type) => MARKS.push({ t: +t.toFixed(3), type });

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
    { yPercent: 0, rotate: 0, duration: o.dur ?? 0.85, ease: o.ease ?? 'power4.out', stagger: o.stagger ?? 0.045 }, at);
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
function kicker(sel, at) {
  master.fromTo(sel, { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, at);
}
const show = (s, at) => master.set(s, { visibility: 'visible' }, at);
const hide = (s, at) => master.set(s, { visibility: 'hidden' }, at);
function drift(sel, at, dur, o = {}) { // chuyển động nền chậm (Ken Burns)
  master.fromTo(sel, { scale: o.from ?? 1.15, x: o.x0 ?? 0 }, { scale: o.to ?? 1, x: o.x1 ?? 0, duration: dur, ease: 'none', stagger: o.stagger ?? 0 }, at);
}
function beams(scene, at, dur) {
  const b = $(scene + ' .beams'); if (!b) return;
  master.fromTo(b, { x: -120, opacity: 0.3 }, { x: 80, opacity: 0.6, duration: dur, ease: 'none' }, at);
}
function float(sel, at, dur, amp = 8) {
  $$(sel).forEach((e, i) => {
    master.to(e, { y: `+=${i % 2 ? amp : -amp}`, duration: dur / 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, at + i * 0.13);
  });
}

/* ---------- transitions ---------- */
// Hai lớp màu quét qua màn hình; trả về thời điểm màn hình bị che kín (đổi cảnh)
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

const LIME = '#A8D84E', DARK = '#0A2E1C', GREEN = '#3DB54A', LIGHT = '#F4F8F4', DEEP = '#0F5B34';

/* ================= SCENES ================= */
function S1(t) {
  show('#s1', t);
  beams('#s1', t, 6.5);
  words('.s1-a', t + 0.35, { stagger: 0.07, dur: 1 });
  master.to('.s1-a', { y: -190, scale: 0.78, opacity: 0.35, transformOrigin: '0% 0%', duration: 1, ease: 'power3.inOut' }, t + 2.3);
  words('.s1-b', t + 2.75, { stagger: 0.07, dur: 1 });
  master.fromTo('.s1-b .hl', { textShadow: '0 0 0px rgba(168,216,78,0)' }, { textShadow: '0 0 46px rgba(168,216,78,.65)', duration: 0.8, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 3.7);
  cue(t + 0.3, 'hit');
  return t + 5.5;
}

function S2(t) {
  show('#s2', t);
  cue(t, 'sec_groove');
  beams('#s2', t, 6.5);
  master.fromTo('.s2-photo img', { scale: 1.2, x: 60 }, { scale: 1.02, x: 0, duration: 7, ease: 'power2.out' }, t);
  pop('.s2-logos .logo-disc', t + 0.3, { stagger: 0.14, from: 0.4 });
  master.fromTo('.s2-logos .x', { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, t + 0.42);
  words('.s2-k', t + 0.55, { stagger: 0.03 });
  words('.s2-t1', t + 0.7);
  words('.s2-t2', t + 0.85, { stagger: 0.06 });
  words('.s2-t3', t + 1.05, { stagger: 0.09, dur: 1 });
  up('.gchip', t + 1.7, { stagger: 0.15 });
  cue(t + 0.3, 'pop'); cue(t + 1.7, 'pop');
  return t + 5.9;
}

function S3(t) {
  show('#s3', t);
  master.set(['.s3-grid', '.s3-sub.b', '.s3-label.b'], { autoAlpha: 0 }, t);
  master.fromTo('#bug', { autoAlpha: 0, y: -24 }, { autoAlpha: 1, y: 0, duration: 0.6 }, t + 0.8);
  kicker('.s3-k', t + 0.1);
  words('.s3-h', t + 0.15);
  up('.s3-sub.a', t + 0.8);
  pop('.s3-label.a', t + 0.9, { from: 0.85 });
  master.fromTo('.svc', { y: 140, autoAlpha: 0, rotate: 3 }, { y: 0, autoAlpha: 1, rotate: 0, stagger: 0.1, duration: 0.95, ease: 'power4.out' }, t + 1.0);
  master.fromTo('.svc .ph img', { scale: 1.35 }, { scale: 1, stagger: 0.1, duration: 1.8 }, t + 1.0);
  pop('.svc .tag', t + 1.8);
  cue(t + 1.0, 'swish');
  // beat B – kiểm định, đánh giá, quan trắc
  const b = t + 5.4;
  master.to('.svc', { x: -260, autoAlpha: 0, stagger: 0.05, duration: 0.5, ease: 'power3.in' }, b);
  master.to(['.s3-label.a', '.s3-sub.a'], { y: -20, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, b);
  master.set('.s3-grid', { autoAlpha: 1 }, b + 0.4);
  pop('.s3-label.b', b + 0.45, { from: 0.85 });
  up('.s3-sub.b', b + 0.5);
  master.fromTo('.tech', { x: 320, autoAlpha: 0 }, { x: 0, autoAlpha: 1, stagger: 0.1, duration: 0.9, ease: 'power4.out' }, b + 0.45);
  master.fromTo('.tech .ph img', { scale: 1.35 }, { scale: 1, stagger: 0.1, duration: 1.8 }, b + 0.45);
  pop('.tech .tt .ic', b + 0.9, { stagger: 0.1 });
  cue(b, 'swish');
  return b + 5.0;
}

function S4(t) {
  circleIn('#s4', t);
  beams('#s4', t, 8.5);
  kicker('.s4-k', t + 0.35);
  words('.s4-h', t + 0.4);
  const steps = $$('#s4 .step');
  master.set($$('#s4 .on'), { scale: 0 }, t);
  master.set($$('#s4 .lbl, #s4 .step .tt, #s4 .step .ds'), { autoAlpha: 0 }, t);
  pop($$('#s4 .node'), t + 0.8, { stagger: 0.07, from: 0.4 });
  master.fromTo('.s4-line .base', { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.9, ease: 'power2.inOut' }, t + 0.8);
  const t0 = t + 1.7, span = 3.4;
  master.fromTo('.s4-line .prog', { scaleX: 0 }, { scaleX: 1, duration: span, ease: 'none' }, t0);
  master.fromTo('.s4-line .dot', { x: 0, autoAlpha: 0 }, { x: 1400, autoAlpha: 1, duration: span, ease: 'none' }, t0);
  master.to('.s4-line .dot', { autoAlpha: 0, duration: 0.3 }, t0 + span);
  steps.forEach((s, i) => {
    const ti = t0 + (i / 5) * span;
    master.to($('.on', s), { scale: 1, duration: 0.45, ease: 'back.out(2.2)' }, ti);
    master.to($('.node .ic', s), { color: DARK, duration: 0.2 }, ti);
    master.fromTo($('.node', s), { scale: 1 }, { scale: 1.12, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.out' }, ti);
    master.fromTo($('.lbl', s), { autoAlpha: 0, y: 12 }, { autoAlpha: 1, y: 0, duration: 0.4 }, ti);
    master.fromTo([$('.tt', s), $('.ds', s)], { autoAlpha: 0, y: 24 }, { autoAlpha: 1, y: 0, duration: 0.55, stagger: 0.08 }, ti + 0.05);
    cue(ti, 'tick');
  });
  master.fromTo('.s4-motto', { autoAlpha: 0, letterSpacing: '0.5em' }, { autoAlpha: 1, letterSpacing: '0.16em', duration: 1.2, ease: 'power3.out' }, t0 + span + 0.2);
  return t0 + span + 2.7;
}

function S5(t) {
  show('#s5', t);
  kicker('.s5-k', t + 0.1);
  words('.s5-h', t + 0.15);
  master.fromTo('.grp', { rotateY: -80, autoAlpha: 0, x: -40, transformOrigin: '0% 50%' },
    { rotateY: 0, autoAlpha: 1, x: 0, duration: 1.0, stagger: 0.12, ease: 'power3.out' }, t + 0.6);
  drift('.grp img', t + 0.6, 7, { from: 1.25, to: 1.04, stagger: 0.12 });
  pop('.grp .bdg', t + 1.0, { stagger: 0.12 });
  up('.grp .tt', t + 1.1, { stagger: 0.12, y: 24 });
  $$('.grp .bdg').forEach((b, i) => {
    master.to(b, { scale: 1.15, duration: 0.18, yoyo: true, repeat: 1, ease: 'power1.out' }, t + 2.8 + i * 0.3);
  });
  cue(t + 0.6, 'swish');
  return t + 6.9;
}

function S6(t) {
  kicker('.s6-k', t + 0.3);
  words('.s6-h', t + 0.35);
  up('.s6-list .row', t + 0.95, { stagger: 0.16, x: -30, y: 0 });
  master.fromTo('.s6-paper', { x: 320, rotate: 14, autoAlpha: 0 }, { x: 0, rotate: 4, autoAlpha: 1, duration: 1.2, ease: 'power4.out' }, t + 0.45);
  master.fromTo('.s6-card', { y: 320, rotate: -20, autoAlpha: 0 }, { y: 0, rotate: -6, autoAlpha: 1, duration: 1.2, ease: 'power4.out' }, t + 0.65);
  master.to('.s6-paper', { y: -14, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 1.65);
  master.to('.s6-card', { y: 12, duration: 2, ease: 'sine.inOut', yoyo: true, repeat: 1 }, t + 1.85);
  pop('.s6-tag', t + 1.9);
  cue(t + 0.45, 'swish'); cue(t + 1.9, 'pop');
  return t + 5.5;
}

function S7(t) {
  master.fromTo('#s7', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.6, ease: 'none' }, t);
  cue(t, 'sec_tension');
  words('.s7-h', t + 0.35, { stagger: 0.05 });
  const order = ['.n1', '.n2', '.n6', '.n3', '.n4', '.n5'];
  const rots = [-3, 2.5, -1.5, 2, -2.5, 1.5];
  order.forEach((s, i) => {
    const ti = t + 1.05 + i * 0.4;
    master.fromTo(s, { scale: 0.5, autoAlpha: 0, rotate: rots[i] * 3, y: 30 },
      { scale: 1, autoAlpha: 1, rotate: rots[i], y: 0, duration: 0.55, ease: 'back.out(2)' }, ti);
    cue(ti, 'notif');
  });
  float('#s7 .nt', t + 1.8, 3.6, 7);
  master.fromTo('.n2', { x: 0 }, { x: 7, duration: 0.05, yoyo: true, repeat: 7, ease: 'none' }, t + 3.6);
  master.fromTo('.n3', { x: 0 }, { x: -7, duration: 0.05, yoyo: true, repeat: 7, ease: 'none' }, t + 4.1);
  const tc = t + 5.7;
  master.to('#s7 .nt', {
    x: (i, e) => 960 - (e.offsetLeft + e.offsetWidth / 2), y: (i, e) => 540 - (e.offsetTop + e.offsetHeight / 2),
    scale: 0.15, autoAlpha: 0, duration: 0.55, ease: 'power3.in', stagger: 0.03, overwrite: false,
  }, tc);
  master.to('.s7-h', { scale: 0.85, autoAlpha: 0, duration: 0.45, ease: 'power3.in' }, tc + 0.15);
  return tc + 0.55;
}

function S8(t) {
  circleIn('#s8', t);
  cue(t, 'sec_main');
  words('.s8-h', t + 0.35);
  up('.s8-old', t + 0.9);
  pop('.s8-old .items > div', t + 1.1, { stagger: 0.1 });
  master.fromTo('.s8-old .stamp', { scale: 2.4, rotate: -40, autoAlpha: 0 }, { scale: 1, rotate: 0, autoAlpha: 1, duration: 0.45, ease: 'back.out(2.5)' }, t + 1.9);
  master.to('.s8-old .items', { opacity: 0.45, filter: 'grayscale(1)', duration: 0.5 }, t + 2.0);
  cue(t + 1.9, 'stamp');
  master.fromTo('.s8-arrow', { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, t + 2.1);
  master.to('.s8-arrow .ic', { x: 16, duration: 0.35, yoyo: true, repeat: 5, ease: 'sine.inOut' }, t + 2.7);
  master.fromTo('.s8-new', { x: 90, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.85, ease: 'power4.out' }, t + 2.3);
  pop('.s8-new .pills span', t + 2.85, { stagger: 0.1 });
  up('.s8-feats span', t + 3.4, { stagger: 0.1, y: 30 });
  cue(t + 2.85, 'pop');
  return t + 6.4;
}

function S9(t) {
  show('#s9', t);
  beams('#s9', t, 7.5);
  kicker('.s9-k', t + 0.1);
  words('.s9-h', t + 0.15);
  master.fromTo('.s9-nodes .nd', { y: 90, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.9, stagger: 0.15, ease: 'power4.out' }, t + 0.7);
  pop('.s9-nodes .ico', t + 1.0, { stagger: 0.15 });
  master.fromTo('.lnk', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 1.5);
  $$('.lnk').forEach((l, k) => {
    $$('span', l).forEach((d, i) => {
      const a = k ? 78 : 0, z = k ? 0 : 78;
      master.set(d, { x: a, opacity: 0 }, t);
      master.to(d, { keyframes: { x: [a, z], opacity: [0, 1, 1, 0], easeEach: 'none' }, duration: 1.2, repeat: 3, ease: 'none' }, t + 1.5 + i * 0.4);
    });
  });
  up('.s9-road-lbl', t + 2.4, { y: 16 });
  $$('.cv').forEach((c, i) => {
    master.fromTo(c, { x: -70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, t + 2.5 + i * 0.25);
    cue(t + 2.5 + i * 0.25, 'tick');
  });
  return t + 6.9;
}

function S10(t) {
  show('#s10', t);
  kicker('.s10-k', t + 0.1);
  words('.s10-h', t + 0.15);
  up('.s10-feats .f', t + 0.95, { stagger: 0.16, x: -30, y: 0 });
  master.fromTo('.s10-br', { y: 130, rotateX: 18, autoAlpha: 0, transformPerspective: 1800, transformOrigin: '50% 100%' },
    { y: 0, rotateX: 0, autoAlpha: 1, duration: 1.15, ease: 'power3.out' }, t + 0.4);
  master.fromTo('.s10-br .view img', { scale: 1 }, { scale: 1.05, transformOrigin: '30% 30%', duration: 8, ease: 'none' }, t + 0.4);
  // con trỏ chuột "một cú click"
  const cx = 1150, cy = 420;
  master.fromTo('#s10 .cursor', { x: 1760, y: 1000, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, t + 1.2);
  master.to('#s10 .cursor', { x: cx, y: cy, duration: 0.95, ease: 'power2.inOut' }, t + 1.3);
  master.to('#s10 .cursor', { scale: 0.82, duration: 0.1, yoyo: true, repeat: 1, transformOrigin: '15% 10%' }, t + 2.25);
  master.set('#s10 .ripple', { autoAlpha: 0 }, t);
  master.fromTo('#s10 .ripple', { x: cx + 9, y: cy + 5, scale: 0.2, autoAlpha: 1 }, { scale: 1.8, autoAlpha: 0, duration: 0.7, ease: 'power2.out' }, t + 2.3);
  master.to('#s10 .cursor', { x: cx + 260, y: cy + 520, autoAlpha: 0, duration: 0.8, ease: 'power2.in' }, t + 2.9);
  cue(t + 2.28, 'click');
  pop('.w1', t + 2.5, { from: 0.7 });
  pop('.w2', t + 2.7, { from: 0.7 });
  pop('.w3', t + 2.9, { from: 0.7 });
  cue(t + 2.5, 'pop'); cue(t + 2.7, 'pop'); cue(t + 2.9, 'pop');
  const C = 351.86, pct = 86, cnt = { v: 0 };
  master.fromTo('.w2 .val', { strokeDashoffset: C }, { strokeDashoffset: C * (1 - pct / 100), duration: 1.5, ease: 'power2.out' }, t + 2.9);
  master.fromTo(cnt, { v: 0 }, { v: pct, duration: 1.5, ease: 'power2.out', onUpdate: () => { $('.w2 .pct span').textContent = Math.round(cnt.v); } }, t + 2.9);
  master.fromTo('.w3 .bar b', { scaleX: 0 }, { scaleX: 1, duration: 0.9, stagger: 0.15, ease: 'power3.out' }, t + 3.1);
  master.fromTo('.w1 .bell .ic', { rotate: -16 }, { rotate: 16, duration: 0.08, yoyo: true, repeat: 7, ease: 'none', transformOrigin: '50% 10%' }, t + 3.0);
  master.to('.w1 .bell .ic', { rotate: 0, duration: 0.1 }, t + 3.65);
  float('#s10 .wg', t + 3.6, 4.2, 6);
  return t + 8.0;
}

function S11(t) {
  // vào cảnh bằng hiệu ứng "đẩy" ngang từ S10
  show('#s11', t);
  master.fromTo('#s10', { x: 0 }, { x: -1920, duration: 0.95, ease: 'power3.inOut' }, t);
  master.fromTo('#s11', { x: 1920 }, { x: 0, duration: 0.95, ease: 'power3.inOut' }, t);
  hide('#s10', t + 0.95);
  cue(t, 'whoosh');
  master.set(['.s11-txt.b', '.s11-status', '.s11-br .u.b'], { autoAlpha: 0 }, t);
  master.set('.s11-br .view img.b', { yPercent: 100 }, t);
  kicker('.s11-txt.a .kicker', t + 0.7);
  words('.s11-txt.a .h2', t + 0.75);
  up('.s11-txt.a .checks div', t + 1.25, { stagger: 0.13, x: -24, y: 0 });
  master.fromTo('.s11-br .view img.a', { scale: 1 }, { scale: 1.06, transformOrigin: '50% 0%', duration: 4.2, ease: 'sine.inOut' }, t + 0.6);
  const b = t + 4.8;
  master.to('.s11-txt.a > *', { y: -30, autoAlpha: 0, stagger: 0.06, duration: 0.4, ease: 'power2.in' }, b);
  master.to('.s11-br .view img.a', { yPercent: -118, duration: 0.8, ease: 'power3.inOut' }, b);
  master.to('.s11-br .view img.b', { yPercent: 0, duration: 0.8, ease: 'power3.inOut' }, b);
  master.to('.s11-br .u.a', { autoAlpha: 0, duration: 0.3 }, b);
  master.to('.s11-br .u.b', { autoAlpha: 1, duration: 0.3 }, b + 0.3);
  master.set('.s11-txt.b', { autoAlpha: 1 }, b + 0.4);
  kicker('.s11-txt.b .kicker', b + 0.5);
  words('.s11-txt.b .h2', b + 0.55);
  up('.s11-txt.b .checks div', b + 1.05, { stagger: 0.11, x: -24, y: 0 });
  master.fromTo('.s11-status', { y: 50, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, ease: 'power4.out' }, b + 1.2);
  pop('.s11-status .chips span', b + 1.5, { stagger: 0.12 });
  cue(b, 'swish'); cue(b + 1.5, 'pop');
  return b + 4.6;
}

function S12(t) {
  circleIn('#s12', t, '72%', '50%');
  beams('#s12', t, 8);
  kicker('.s12-k', t + 0.3);
  words('.s12-h', t + 0.35);
  up('.s12-sub', t + 0.95);
  up('.s12-list .row', t + 1.15, { stagger: 0.15, x: -30, y: 0 });
  pop('.s12-url', t + 1.9, { from: 0.8 });
  master.fromTo('.s12-br', { x: 140, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.1, ease: 'power4.out' }, t + 0.5);
  pop('.s12-qr', t + 1.6, { from: 0.7 });
  master.fromTo('.s12-qr .scan', { y: 0, autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15 }, t + 2.0);
  master.to('.s12-qr .scan', { y: 204, duration: 0.85, yoyo: true, repeat: 1, ease: 'sine.inOut' }, t + 2.0);
  master.to('.s12-qr .scan', { autoAlpha: 0, duration: 0.2 }, t + 3.7);
  cue(t + 2.0, 'scan');
  master.fromTo('.s12-ok', { x: 60, autoAlpha: 0, scale: 0.8 }, { x: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, t + 3.6);
  pop('.s12-ok .ck', t + 3.75, { from: 0.3, ease: 'back.out(3)' });
  cue(t + 3.65, 'ding');
  return t + 7.4;
}

function S13(t) {
  show('#s13', t);
  words('.s13-h', t + 0.1);
  up('.s13-sub', t + 0.7);
  master.fromTo('.s13-br', { y: 160, autoAlpha: 0, scale: 0.94 }, { y: 0, autoAlpha: 1, scale: 1, duration: 1.1, ease: 'power4.out' }, t + 0.6);
  master.fromTo('.s13-br .view img', { yPercent: 0 }, { yPercent: -6, duration: 6, ease: 'sine.inOut' }, t + 1.2);
  [['.fc.l1', -70], ['.fc.r1', 70], ['.fc.l2', -70], ['.fc.r2', 70]].forEach(([s, dx], i) => {
    master.fromTo(s, { x: dx, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.75, ease: 'back.out(1.6)' }, t + 1.4 + i * 0.28);
    cue(t + 1.4 + i * 0.28, 'pop');
  });
  float('#s13 .fc', t + 2.6, 3.8, 6);
  return t + 6.6;
}

function S14(t) {
  show('#s14', t);
  beams('#s14', t, 7.5);
  kicker('.s14-k', t + 0.1);
  words('.s14-h', t + 0.15);
  master.fromTo('.s14-cols .col', { y: 150, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 1.0, stagger: 0.18, ease: 'power4.out' }, t + 0.7);
  master.fromTo('.s14-cols .num', { x: 70, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9, stagger: 0.18 }, t + 1.0);
  pop('.s14-cols .ico', t + 1.0, { stagger: 0.18 });
  cue(t + 0.7, 'swish');
  return t + 6.8;
}

function S15(t) {
  show('#s15', t);
  master.fromTo('#s15', { scale: 1.15, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.85, ease: 'power3.out' }, t);
  master.to('#s14', { scale: 0.94, autoAlpha: 0, duration: 0.7, ease: 'power2.in' }, t);
  hide('#s14', t + 0.85);
  cue(t, 'whoosh');
  kicker('.s15-k', t + 0.35);
  words('.s15-h', t + 0.4);
  master.fromTo('.cl', { scale: 0.8, autoAlpha: 0, y: 40 },
    { scale: 1, autoAlpha: 1, y: 0, duration: 0.8, ease: 'back.out(1.4)', stagger: { each: 0.08, from: 'center', grid: [2, 4] } }, t + 0.9);
  drift('.cl img', t + 0.9, 6, { from: 1.18, to: 1.02 });
  up('.cl .nm', t + 1.4, { stagger: 0.07, y: 16 });
  return t + 6.0;
}

function S16(t) {
  master.fromTo('#s16', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.8, ease: 'none' }, t);
  cue(t, 'sec_soft');
  hide('#s15', t + 0.8);
  beams('#s16', t, 6);
  drift('.s16-bg img', t, 6, { from: 1.12, to: 1 });
  words('.s16-k', t + 0.45, { stagger: 0.04 });
  words('.s16-h', t + 0.6, { stagger: 0.07, dur: 1 });
  pop('.s16-pills span', t + 1.6, { stagger: 0.16 });
  master.fromTo('.s16-tag', { autoAlpha: 0, letterSpacing: '0.6em' }, { autoAlpha: 1, letterSpacing: '0.32em', duration: 1.2 }, t + 2.4);
  master.to('#bug', { autoAlpha: 0, y: -20, duration: 0.5 }, t + 4.3);
  cue(t + 1.6, 'pop');
  return t + 4.9;
}

function S17(t) {
  show('#s17', t);
  cue(t, 'sec_end');
  drift('.s17-bg img', t, 8.5, { from: 1.14, to: 1 });
  pop('.s17-logos .logo-disc', t + 0.25, { stagger: 0.14, from: 0.4 });
  master.fromTo('.s17-logos .x', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5 }, t + 0.35);
  words('.s17-h', t + 0.45);
  up('.s17-sub', t + 1.0);
  up('.s17-contact > div', t + 1.2, { stagger: 0.13, x: -30, y: 0 });
  pop('.s17-cta', t + 1.9, { from: 0.7 });
  master.fromTo('.s17-panel', { x: 90, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.0, ease: 'power4.out' }, t + 0.6);
  pop('.s17-panel .qr', t + 1.0, { from: 0.6 });
  up('.s17-panel .offs > div', t + 1.4, { stagger: 0.1, y: 16 });
  master.to('.s17-cta', { scale: 1.05, duration: 0.45, yoyo: true, repeat: 3, ease: 'sine.inOut' }, t + 2.8);
  cue(t + 0.25, 'hit'); cue(t + 1.9, 'pop');
  return t + 8.2;
}

/* ================= ASSEMBLY ================= */
function build() {
  let t = 0, x;
  t = S1(0);
  x = wipe(t, LIME, DEEP, 'x', -1); swap('#s1', '#s2', x);
  t = S2(x);
  x = wipe(t, GREEN, LIGHT, 'y', 1); swap('#s2', '#s3', x);
  t = S3(x);
  x = t; t = S4(x); hide('#s3', x + 1);
  x = wipe(t, GREEN, LIGHT, 'x', 1); swap('#s4', '#s5', x);
  t = S5(x);
  // zoom S5 → S6
  master.to('#s5', { scale: 1.08, autoAlpha: 0, duration: 0.6, ease: 'power2.in' }, t);
  master.fromTo('#s6', { scale: 1.12, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.85, ease: 'power3.out' }, t + 0.25);
  cue(t, 'whoosh');
  x = t + 0.25; t = S6(x); hide('#s5', x + 0.6);
  x = t; t = S7(x); hide('#s6', x + 0.6);
  x = t; t = S8(x); hide('#s7', x + 1);
  x = wipe(t, GREEN, DARK, 'y', 1); swap('#s8', '#s9', x);
  t = S9(x);
  x = wipe(t, GREEN, LIGHT, 'x', 1); swap('#s9', '#s10', x);
  t = S10(x);
  t = S11(t);
  x = t; t = S12(x); hide('#s11', x + 1);
  x = wipe(t, GREEN, LIGHT, 'x', -1); swap('#s12', '#s13', x);
  t = S13(x);
  x = wipe(t, GREEN, DARK, 'y', 1); swap('#s13', '#s14', x);
  t = S14(x);
  t = S15(t);
  t = S16(t);
  x = wipe(t, LIME, DARK, 'x', -1); swap('#s16', '#s17', x);
  t = S17(x);
  master.set({}, {}, t); // giữ khung hình cuối
  return t;
}

async function loadIcons() {
  const els = $$('.ic[data-i]');
  const names = [...new Set(els.map((e) => e.dataset.i))];
  const map = {};
  await Promise.all(names.map(async (n) => {
    const r = await fetch(`node_modules/lucide-static/icons/${n}.svg`);
    if (!r.ok) throw new Error('missing icon ' + n);
    map[n] = await r.text();
  }));
  els.forEach((e) => { e.innerHTML = map[e.dataset.i]; });
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
  // xem trước trong trình duyệt: mở index.html?play
  if (location.search.includes('play')) master.play(0);
  const m = location.search.match(/t=([\d.]+)/);
  if (m) master.seek(parseFloat(m[1]), false);
})();
