/* EVNICT – HRMS 3.0 & D-Office: video giới thiệu có thuyết minh, dùng giao diện thực tế của hệ thống.
   Thời lượng từng cảnh lấy theo độ dài lời đọc (vo.json do tts.py sinh ra); khung nổi bật trên ảnh giao diện
   xuất hiện đúng lúc cụm từ tương ứng được đọc. Toàn bộ chạy trên một GSAP timeline dừng sẵn; các hiệu ứng canvas
   là hàm thuần của thời gian t để render tất định qua window.__seek(t). */
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


/* ---------- lời đọc: lịch từng câu ---------- */
function voice(sc, t, o = {}) {
  const lead = o.lead ?? 0.5, gap = o.gap ?? 0.35;
  let x = t + lead;
  const B = [];
  VO.scenes[sc].forEach((b) => {
    B.push({ t: x, d: b.dur, say: b.say });
    MARKS.push({ t: +x.toFixed(3), type: 'vo', id: b.id });
    x += b.dur + gap;
  });
  B.end = x - gap;
  // thời điểm (ước lượng) cụm từ `p` được đọc trong câu i
  B.at = (i, p) => { const s = B[i].say.indexOf(p); if (s < 0) console.error(`thiếu cụm "${p}" trong ${sc}[${i}]`); return B[i].t + B[i].d * (s < 0 ? 0 : s / B[i].say.length); };
  return B;
}

/* ---------- lời đọc ---------- */
let VO = null;
let VEND = 0; // câu sau không bao giờ chồng lên câu trước
function say(sc, t, o = {}) {
  const want = t + (o.lead ?? 0.5), lead = Math.max(want, VEND + (o.minGap ?? 0.45)) - t;
  const B = voice(sc, t, { ...o, lead });
  VEND = B.end;
  return B;
}
function hd(sc, at) { kicker(`#${sc} .kk`, at + 0.05); words(`#${sc} .hh`, at + 0.12); }
function lit(sel, at, cls = 'on') { els(sel).forEach((e) => { const base = e.getAttribute('class'); master.set(e, { attr: { class: `${base} ${cls}` } }, at); }); }
function flashOn(e, t0, t1, cls = 'on') { els(e).forEach((x) => { const base = x.getAttribute('class'); master.set(x, { attr: { class: `${base} ${cls}` } }, t0); master.set(x, { attr: { class: base } }, t1); }); }

/* ---------- giao diện thực tế: cửa sổ trình duyệt, điện thoại ---------- */
const IMG = { login: [1201, 760], app: [917, 1978], dashboard: [2000, 691], hoso: [1557, 897], kehoach: [1800, 729], nhucau: [1121, 508],
  nangluong: [1387, 545], tieuchi: [685, 324], hdld: [1385, 509], baocao: [1871, 746], kyso_web: [1651, 790], kyso_app: [690, 655],
  quantri: [993, 523], phanquyen: [1342, 624], danhmuc: [1264, 614], arch: [1577, 672] };
function makeWin(sc, name, x, y, w, url) {
  const [iw, ih] = IMG[name], h = Math.round((w * ih) / iw);
  const W = div('win', $(sc));
  Object.assign(W.style, { left: `${x}px`, top: `${y}px`, width: `${w}px` });
  W.innerHTML = `<div class="wb"><i></i><i></i><i></i><span>${url}</span></div><div class="vp" style="height:${h}px"><div class="cv"><img src="assets/ui/${name}.jpg" alt=""></div></div>`;
  const cv = $('.cv', W);
  const o = {
    el: W, cv, w, h,
    in(at, from = {}) { master.fromTo(W, { autoAlpha: 0, y: 90, rotationX: 14, transformPerspective: 1800, ...from }, { autoAlpha: 1, x: 0, y: 0, rotationX: 0, duration: 0.9, ease: 'power3.out' }, at); cue(at, 'whoosh'); return o; },
    out(at, to = {}) { master.to(W, { autoAlpha: 0, y: -50, duration: 0.45, ease: 'power2.in', ...to }, at); return o; },
    // khung nổi bật theo % ảnh: [x, y, w, h]
    hl(box, label, at, until, cls = '') {
      const b = div(`hlb ${cls}`, cv, label ? `<span class="lb">${label}</span>` : '');
      Object.assign(b.style, { left: `${box[0]}%`, top: `${box[1]}%`, width: `${box[2]}%`, height: `${box[3]}%` });
      master.fromTo(b, { opacity: 0, scale: 1.25 }, { opacity: 1, scale: 1, duration: 0.35, ease: 'back.out(2)' }, at);
      if (until) master.to(b, { opacity: 0, duration: 0.3 }, until);
      cue(at, 'blip');
      return b;
    },
    // phóng to quanh vùng box (giữ ảnh luôn phủ kín khung)
    zoom(at, box, s, d = 0.9) {
      const cx = ((box[0] + box[2] / 2) / 100) * w, cy = ((box[1] + box[3] / 2) / 100) * h;
      const mx = ((s - 1) * w) / 2, my = ((s - 1) * h) / 2;
      const tx = Math.max(-mx, Math.min(mx, -(cx - w / 2) * s)), ty = Math.max(-my, Math.min(my, -(cy - h / 2) * s));
      master.to(cv, { scale: s, x: tx, y: ty, duration: d, ease: 'power2.inOut' }, at);
      return o;
    },
  };
  return o;
}
function makePhone(sc, name, x, y, w, hgt) {
  const P = div('phone', $(sc));
  Object.assign(P.style, { left: `${x}px`, top: `${y}px`, width: `${w}px`, height: `${hgt}px` });
  P.innerHTML = `<div class="scr"><i class="nt"></i><img src="assets/ui/${name}.jpg" alt=""></div>`;
  const sw = w - 24, [iw, ih] = IMG[name], ihs = (sw * ih) / iw, scr = $('.scr', P);
  const o = {
    el: P, img: $('img', P),
    in(at) { master.fromTo(P, { autoAlpha: 0, y: 140, rotation: 6 }, { autoAlpha: 1, y: 0, rotation: 0, duration: 1.0, ease: 'power3.out' }, at); cue(at, 'whoosh'); return o; },
    // chạm vào biểu tượng tại toạ độ % ảnh
    tap(px, py, at, label) {
      const X = (px / 100) * sw, Y = (py / 100) * ihs + 16;
      const r = div('pr', scr), t = div('tap', scr);
      [r, t].forEach((e) => { e.style.left = `${X}px`; e.style.top = `${Y}px`; });
      master.fromTo(t, { scale: 0.4, opacity: 1 }, { scale: 1.7, opacity: 0, duration: 0.55, ease: 'power2.out' }, at);
      master.fromTo(r, { scale: 1.3, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.3, ease: 'back.out(2)' }, at + 0.05);
      master.to(r, { opacity: 0, duration: 0.3 }, at + 1.0);
      if (label) { const l = div('pl', scr, label); l.style.left = `${X}px`; l.style.top = `${Y + 50}px`; master.fromTo(l, { opacity: 0, y: -8 }, { opacity: 1, y: 0, duration: 0.25 }, at + 0.1); master.to(l, { opacity: 0, duration: 0.25 }, at + 1.0); }
      cue(at, 'click');
    },
    scroll(at, px, d = 1.2) { master.to(o.img, { y: -px, duration: d, ease: 'power2.inOut' }, at); },
  };
  return o;
}

/* ================= CẢNH ================= */
function S1(t) { // bài toán: giấy tờ, dữ liệu phân mảnh
  show('#s1', 0);
  const B = say('s1', t, { lead: 1.2 });
  const box = $('.s1-docs');
  const P = [[150, 120, -12], [430, 250, 9], [700, 100, -5], [1080, 130, 6], [1350, 240, -8], [1640, 110, 11], [150, 740, 7], [430, 840, -10],
    [710, 770, 4], [1090, 810, -6], [1360, 740, 9], [1650, 780, -4], [40, 430, 5], [1770, 440, -7]];
  const TAGS = { 1: 'TRỄ HẠN NÂNG LƯƠNG', 4: 'CHỜ KÝ DUYỆT', 7: 'HỒ SƠ CHƯA CẬP NHẬT', 10: 'THIẾU CHỮ KÝ', 3: 'SAI LỆCH DỮ LIỆU' };
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
  [0.2, 0.5, 0.8].forEach((d) => cue(t + d, 'swish'));
  const end = Math.max(t + 7.5, B.end + 1.0);
  master.fromTo('.s1-docs', { scale: 1 }, { scale: 1.07, duration: end - t, ease: 'none' }, t);
  const tg = B.at(0, 'phê duyệt');
  master.fromTo('.doc .tg', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(3)', stagger: 0.12 }, tg);
  cue(tg, 'alarm');
  master.to('.doc .tg', { keyframes: [{ opacity: 0.3, duration: 0.08 }, { opacity: 1, duration: 0.08 }, { opacity: 0.4, duration: 0.1 }, { opacity: 1, duration: 0.1 }], stagger: 0.2 }, tg + 1.0);
  const L = $('.s1-links'), pairs = [[0, 1], [1, 2], [3, 4], [4, 5], [6, 7], [7, 8], [9, 10], [10, 11], [2, 3], [8, 9]], lines = [];
  pairs.forEach(([a, b]) => {
    const A = docs[a], Bd = docs[b], ax = A.x + 64, ay = A.y + 84, bx = Bd.x + 64, by = Bd.y + 84, mx = (ax + bx) / 2, my = (ay + by) / 2;
    lines.push(svg('line', { x1: ax, y1: ay, x2: mx - (bx - ax) * 0.08, y2: my - (by - ay) * 0.08 }, L), svg('line', { x1: mx + (bx - ax) * 0.08, y1: my + (by - ay) * 0.08, x2: bx, y2: by }, L));
  });
  master.fromTo(lines, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3, stagger: 0.05 }, B.at(0, 'dữ liệu rời rạc'));
  UPD.push((tt) => { if (tt > end + 1) return; const f = Math.floor(tt * 12); lines.forEach((l, i) => { l.style.strokeOpacity = hash(f, i) > 0.3 ? 1 : 0.15; }); });
  words('.s1-a', B[0].t - 0.1, { stagger: 0.06 });
  master.to('.s1-a', { y: -50, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, B[1].t - 0.5);
  master.to(docs.map((d) => d.d), { opacity: 0.45, duration: 0.6 }, B[1].t - 0.4);
  words('.s1-c', B[1].t - 0.1); words('.s1-d', B.at(1, 'khi dữ liệu'));
  glitch('.s1-d .red', B.at(1, 'phân mảnh') + 0.3, 0.45, 10);
  master.to(docs.map((d) => d.d), { x: (i) => 896 - docs[i].x, y: (i) => 456 - docs[i].y, scale: 0.2, rotation: 0, autoAlpha: 0, duration: 0.6, ease: 'power3.in', stagger: 0.02 }, end - 0.7);
  master.to(lines, { autoAlpha: 0, duration: 0.3 }, end - 0.7);
  cue(end - 0.7, 'swish');
  return end;
}

function S2(t) { // EVNICT giới thiệu HRMS 3.0 & D-Office
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
  master.to(L, { x: 0, y: 0, duration: 1.1, ease: 'power3.inOut' }, t + 2.5); cue(t + 2.5, 'whoosh');
  const B = say('s2', t, { lead: 3.0 });
  kicker('.s2-k', B[0].t - 0.3);
  words('.s2-h', B.at(0, 'giải pháp') - 0.1);
  words('.s2-sub', B[0].t + 0.1, { stagger: 0.03 });
  const hb = B.at(1, 'Ếch A Em Ét');
  master.fromTo('.s2-big', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, hb - 0.2);
  scramble('.s2-big .grad', hb - 0.2, 1.0);
  glitch('.s2-big', hb + 0.9, 0.4, 12); cue(hb + 0.9, 'hit');
  words('.s2-plus', B.at(1, 'Đi Óp phít') - 0.2);
  up('.s2-chips span', B.end - 0.3, { stagger: 0.12, y: 24 });
  [0, 1, 2, 3].forEach((i) => cue(B.end - 0.25 + i * 0.12, 'pop'));
  return Math.max(t + 8.5, B.end + 1.3);
}

function S3(t) { // năng lực EVNICT
  cue(t, 'sec_tension');
  master.set('#bug', { visibility: 'visible' }, t);
  master.fromTo('#bug', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.6 }, t + 0.2);
  bg(t, { trace: 0.5, tower: 0.12, towerE: 0, floor: 0.3 }, 0.6);
  const B = say('s3', t, { lead: 0.6 });
  hd('s3', t);
  const S = $$('#s3 .st'), C = 2 * Math.PI * 84;
  const at = [B[0].t - 0.1, B.at(0, 'hai mươi năm') - 0.2, B.at(1, 'mười doanh') - 0.2, B.at(1, 'Sao Khuê') - 0.3];
  S.forEach((s, i) => {
    master.fromTo(s, { autoAlpha: 0, y: 60 }, { autoAlpha: 1, y: 0, duration: 0.7 }, at[i]);
    const b = $('.rg .b', s); b.setAttribute('stroke-dasharray', `${C} ${C}`); b.setAttribute('transform', 'rotate(-90 110 110)');
    master.fromTo(b, { strokeDashoffset: C }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' }, at[i] + 0.2);
    sparks(120 + 210 + i * 429, 330 + 150, at[i] + 0.3, { r0: 100, r1: 170, n: 6, silent: i > 0 });
    cue(at[i], 'tick');
  });
  counter('#s3 .v1', 0, 400, at[0] + 0.2, 1.4);
  counter('#s3 .v2', 0, 20, at[1] + 0.2, 1.2);
  master.fromTo('#s3 .t3', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, at[2] + 0.2); scramble('#s3 .t3', at[2] + 0.2, 0.8);
  master.fromTo('#s3 .t4', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, at[3] + 0.2); scramble('#s3 .t4', at[3] + 0.2, 0.8);
  glitch('#s3 .hh .cu', t + 1.2, 0.4, 8);
  return Math.max(t + 7, B.end + 1.0);
}

function S4(t) { // hệ sinh thái hợp nhất
  cue(t, 'sec_main'); cue(t, 'hit');
  bg(t, { trace: 0.45, pulse: 0.6, tower: 0, towerE: 0 }, 0.6);
  const B = say('s4', t, { lead: 0.6 });
  hd('s4', t);
  const W = $('#s4 .s4-wires'), box = (e) => ({ l: e.offsetLeft, t: e.offsetTop, w: e.offsetWidth, h: e.offsetHeight });
  const link = (a, b) => { const A = box(a), Bx = box(b), x1 = A.l + A.w, y1 = A.t + A.h / 2, x2 = Bx.l, y2 = Bx.t + Bx.h / 2, m = (x1 + x2) / 2; return wirePair(W, `M${x1} ${y1} C${m} ${y1} ${m} ${y2} ${x2} ${y2}`); };
  const U = $$('#s4 .usr'), CH = $$('#s4 .chn'), H1 = $('#s4 .h1b'), MD = $$('#s4 .md'), H2 = $('#s4 .h2b'), EX = $$('#s4 .ex');
  const wires = [];
  const appear = (e, at, from = { x: -30 }) => { master.fromTo(e, { autoAlpha: 0, ...from }, { autoAlpha: 1, x: 0, y: 0, duration: 0.55 }, at); cue(at, 'pop'); };
  const wire = (a, b, at) => { const p = link(a, b); master.set(p.w, { autoAlpha: 0 }, 0); master.set(p.w, { autoAlpha: 1 }, at); draw(p.w, at, 0.45); wires.push(p); };
  [['lãnh đạo', 0], ['cán bộ', 1], ['người lao động', 2]].forEach(([p, i]) => appear(U[i], B.at(0, p) - 0.2));
  const c1 = B.at(0, 'oép'), c2 = B.at(0, 'ứng dụng');
  appear(CH[0], c1 - 0.2); appear(CH[1], c2 - 0.2);
  U.forEach((u, i) => { wire(u, CH[0], c1); wire(u, CH[1], c2); });
  const h1 = B.at(1, 'lõi dịch vụ') - 0.3;
  master.fromTo(H1, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, h1); cue(h1, 'hit');
  CH.forEach((c) => wire(c, H1, h1 + 0.2));
  sparks(H1.offsetLeft + 115, H1.offsetTop + 75, h1 + 0.3, { r0: 80, r1: 150, n: 7 });
  const m0 = B.at(1, 'kết nối') - 0.2;
  MD.forEach((m, i) => { appear(m, m0 + i * 0.25); wire(H1, m, m0 + i * 0.25); });
  const h2 = B.at(1, 'hệ thống nghiệp vụ') - 0.3;
  master.fromTo(H2, { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(2)' }, h2);
  MD.forEach((m) => wire(m, H2, h2 + 0.2));
  EX.forEach((e, i) => { appear(e, h2 + 0.4 + i * 0.15, { x: 30 }); wire(H2, e, h2 + 0.4 + i * 0.15); });
  const f = B[2].t - 0.3;
  flow(wires.map((p) => p.e), f, 160); cue(f, 'power');
  up('#s4 .kaf', f, { y: 20 });
  bg(f, { pulse: 1 }, 0.6);
  return Math.max(t + 9, B.end + 1.2);
}

function S5(t) { // D-Office: văn bản khép kín
  bg(t, { pulse: 0.4 }, 0.6);
  const B = say('s5', t, { lead: 0.6 });
  hd('s5', t);
  const S = $$('#s5 .stp'), X = S.map((_, i) => 120 + i * 345 + 150);
  up(S, t + 0.4, { stagger: 0.1, y: 40 });
  const ph = ['tiếp nhận', 'phân phối', 'chỉ đạo', 'thực hiện', 'ký số'];
  const tk = $('#s5 .tok');
  ph.forEach((p, i) => {
    const at = B.at(0, p) - 0.15;
    lit(S[i], at); cue(at, 'tick');
    sparks(X[i], 330 + 115, at, { r0: 70, r1: 130, n: 5, silent: true });
    if (i === 0) {
      master.fromTo(tk, { x: X[0] - 32, y: 330 + 115 - 40, autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.4 }, at);
    } else {
      master.to(tk, { x: X[i] - 32, duration: 0.5, ease: 'power2.inOut' }, at - 0.35);
      master.to('#s5 .cab i', { width: X[i] - 120 - 150, duration: 0.5, ease: 'power2.inOut' }, at - 0.35);
    }
  });
  master.to(tk, { scale: 1.3, keyframes: [{ rotation: -8, duration: 0.1 }, { rotation: 8, duration: 0.1 }, { rotation: 0, duration: 0.1 }] }, B.at(0, 'ký số') + 0.2); cue(B.at(0, 'ký số') + 0.3, 'stamp');
  const M = $$('#s5 .mon>div');
  const m = [B.at(1, 'giám sát') - 0.2, B.at(1, 'tiến độ') - 0.2, B.at(1, 'mọi nền tảng') - 0.2];
  [1, 2, 0].forEach((k, j) => { up(M[k], m[j], { y: 40 }); cue(m[j], 'pop'); });
  master.fromTo('#s5 .mon .bar i', { width: 0 }, { width: (i) => [220, 180][i], duration: 1.4, ease: 'power2.out', stagger: 0.4 }, m[0] + 0.3);
  return Math.max(t + 7.5, B.end + 1.1);
}

function S6(t) { // HRMS self-service
  const B = say('s6', t, { lead: 0.6 });
  hd('s6', t);
  const V = $$('#s6 .sv'), A = $$('#s6 .arr path');
  master.set(A, { autoAlpha: 0 }, 0);
  const ph = [B.at(0, 'người lao động'), B.at(0, 'bộ phận nhân sự'), B.at(0, 'lãnh đạo')];
  V.forEach((v, i) => {
    master.fromTo(v, { autoAlpha: 0, y: 60, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.5)' }, ph[i] - 0.25); cue(ph[i] - 0.25, 'pop');
    lit(v, ph[i]);
    master.fromTo($('.ok', v), { scale: 0, opacity: 0 }, { scale: 1, opacity: 1, duration: 0.4, ease: 'back.out(3)' }, (ph[i + 1] ?? B.end) - 0.3); cue((ph[i + 1] ?? B.end) - 0.3, 'ding');
    if (i < 2) { master.set(A[i], { autoAlpha: 1 }, ph[i + 1] - 0.4); draw(A[i], ph[i + 1] - 0.4, 0.3); }
  });
  up('#s6 .lbl', B.end - 0.4, { y: 10 });
  up('#s6 .auto span', B.end - 0.2, { stagger: 0.18, y: 30 });
  [0, 1, 2, 3].forEach((i) => cue(B.end - 0.2 + i * 0.18, 'pop'));
  return Math.max(t + 7, B.end + 2.4);
}

function S7(t) { // SmartEVN – giao diện thực tế
  bg(t, { pulse: 0.3, floor: 0.2 }, 0.6);
  const B = say('s7', t, { lead: 0.7 });
  hd('s7', t);
  const lw = makeWin('#s7', 'login', 120, 270, 760, 'smartevn.evn.vn · <b>Đăng nhập</b>').in(t + 0.3);
  const ph = makePhone('#s7', 'app', 950, 236, 400, 780).in(t + 0.6);
  const co = $$('#s7 .co');
  master.fromTo(co, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.15 }, t + 0.9);
  const a = B.at(0, 'Đăng nhập');
  lw.hl([35.5, 14, 36, 77], 'Đăng nhập một lần · tài khoản EVN', a - 0.2, null, 'rt');
  flashOn(co[0], a - 0.2, B[1].t - 0.2);
  lw.hl([38, 74.5, 31, 7], 'App iOS · Android', B.at(0, 'trên điện thoại') - 0.2, null, 'dn');
  flashOn(co[1], B[1].t - 0.2, B.end + 0.2);
  [['Hồ sơ cá nhân', 87.2, 16.7], ['hợp đồng', 87.2, 26.5], ['ký số báo cáo', 12.4, 35.9], ['đăng ký đào tạo', 37.3, 35.9], ['nâng lương', 62.4, 35.9]]
    .forEach(([p, x, y]) => ph.tap(x, y, B.at(1, p) - 0.1));
  flashOn(co[2], B.end, B.end + 3);
  return Math.max(t + 8, B.end + 1.4);
}

function S8(t) { // tổng quan & hồ sơ điện tử
  const B = say('s8', t, { lead: 0.7 });
  hd('s8', t);
  const dw = makeWin('#s8', 'dashboard', 120, 250, 1680, 'hrms.evn.vn/<b>dashboard</b>').in(t + 0.3);
  dw.zoom(B[0].t - 0.2, [0, 8, 68, 50], 1.4, 1.0);
  const d1 = B.at(0, 'số công việc') - 0.1, d2 = B.at(0, 'chờ ký số') - 0.1, d3 = B.at(0, 'chờ xử lý') - 0.1, d4 = B.at(0, 'thông báo') - 0.1;
  dw.hl([16, 25, 11, 30], 'Tổng số công việc', d1, d2, 'dn');
  dw.hl([6, 17, 6, 7], 'Chờ ký số', d2, d3, 'dn');
  dw.hl([20.5, 17, 7.5, 7], 'Chờ xử lý', d3, d4, 'dn');
  dw.hl([37, 9.5, 30.5, 48], 'Thông báo', d4, B[1].t - 0.6, 'dn');
  dw.out(B[1].t - 0.6, { x: -200, y: 0, scale: 0.9 });
  const hw = makeWin('#s8', 'hoso', 350, 236, 1220, 'hrms.evn.vn/<b>ho-so-nhan-su</b>').in(B[1].t - 0.45, { x: 200, y: 0 });
  hw.zoom(B[1].t + 0.3, [0, 15, 45, 30], 1.45, 1.0);
  const tabs = [18.5, 22.3, 25.7, 29.2, 32.6, 36.1], ph = ['thông tin cá nhân', 'thân nhân', 'quá trình làm việc', 'lương', 'đào tạo', 'khen thưởng'];
  const bar = hw.hl([0.3, tabs[0] - 1.7, 8.6, 3.4], '', B.at(1, ph[0]) - 0.1);
  ph.forEach((p, i) => { if (i) master.to(bar, { top: `${tabs[i] - 1.7}%`, duration: 0.3, ease: 'power2.inOut' }, B.at(1, p) - 0.15); cue(B.at(1, p) - 0.1, 'tick'); });
  return Math.max(t + 8, B.end + 1.0);
}

function S9(t) { // quản lý đào tạo
  const B = say('s9', t, { lead: 0.7 });
  hd('s9', t);
  const nw = makeWin('#s9', 'nhucau', 120, 260, 1060, 'hrms.evn.vn/<b>dao-tao/nhu-cau</b>').in(t + 0.3);
  nw.hl([15.5, 73.5, 61.5, 5.5], 'Chọn chương trình từ danh mục', B.at(0, 'chọn chương trình') - 0.1, null, 'dn');
  nw.hl([76.5, 0.5, 4, 7], '', B.at(0, 'chọn chương trình') + 0.6);
  nw.hl([89.5, 11.5, 7, 5.5], 'Gửi đăng ký', B.at(0, 'gửi đăng ký') - 0.1, null, 'rt');
  master.to(nw.el, { x: -40, y: -20, scale: 0.94, opacity: 0.55, duration: 0.6 }, B[1].t - 0.5);
  const kw = makeWin('#s9', 'kehoach', 700, 380, 1100, 'hrms.evn.vn/<b>dao-tao/ke-hoach</b>').in(B[1].t - 0.4, { x: 120, y: 60 });
  kw.hl([5, 25, 8.5, 13], 'Loại hình', B.at(1, 'loại hình') - 0.1);
  kw.hl([33.5, 25, 4.5, 13], 'Số lớp', B.at(1, 'số lớp') - 0.1);
  kw.hl([55.5, 25, 7, 13], 'Kinh phí', B.at(1, 'kinh phí') - 0.1);
  kw.hl([93.8, 9, 5.8, 6.5], 'Tạo file trình ký', B.at(1, 'tạo hồ sơ') - 0.1, null, 'rt');
  return Math.max(t + 8, B.end + 1.0);
}

function S10(t) { // nâng lương
  const B = say('s10', t, { lead: 0.7 });
  hd('s10', t);
  const nw = makeWin('#s10', 'nangluong', 120, 270, 1240, 'hrms.evn.vn/<b>nang-luong/dang-ky</b>').in(t + 0.3);
  [['định kỳ', [2, 14, 16, 10], 'Định kỳ'], ['trước hạn', [23, 14, 14, 10], 'Trước hạn'], ['xếp lại', [43, 14, 30.5, 10], 'Xếp lại ngạch – bậc'], ['thi chuyển', [78.5, 14, 21.3, 10], 'Thi chuyển ngạch']]
    .forEach(([p, b, l], i, arr) => nw.hl(b, l, B.at(0, p) - 0.15, i < 3 ? B.at(0, arr[i + 1][0]) - 0.15 : B[1].t, 'dn'));
  const tw = makeWin('#s10', 'tieuchi', 1060, 330, 760, 'Tiêu chí – <b>điều kiện</b>').in(B[1].t - 0.4, { x: 100, y: 40 });
  master.to(nw.el, { opacity: 0.6, duration: 0.5 }, B[1].t - 0.4);
  const s1 = B.at(1, 'Tiêu chí'), s2 = B.at(1, 'hiển thị sẵn'), s3 = B.at(1, 'tự đối chiếu');
  tw.hl([1.5, 14, 97, 11], '', s1, s2);
  tw.hl([1.5, 30, 97, 29], '', s2, s3);
  tw.hl([1.5, 65, 97, 32], '', s3, null);
  return Math.max(t + 8, B.end + 1.0);
}

function S11(t) { // trình ký & hợp đồng điện tử
  const B = say('s11', t, { lead: 0.7 });
  hd('s11', t);
  const F = $$('#s11 .f'), A = $$('#s11 .arr path');
  master.fromTo(['#s11 .fl3', '#s11 .arr'], { y: 190 }, { y: 0, duration: 0.8, ease: 'power2.inOut' }, B[1].t - 0.9);
  master.set(A, { autoAlpha: 0 }, 0);
  const ph = [B.at(0, 'Tờ trình'), B.at(0, 'lãnh đạo ký số'), B.at(0, 'đồng bộ')];
  F.forEach((f, i) => {
    master.fromTo(f, { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.55 }, ph[i] - 0.2); cue(ph[i] - 0.2, 'pop');
    flashOn(f, ph[i] - 0.1, ph[i + 1] ?? B[1].t);
    if (i) { master.set(A[i - 1], { autoAlpha: 1 }, ph[i] - 0.3); draw(A[i - 1], ph[i] - 0.3, 0.3); }
  });
  const hw = makeWin('#s11', 'hdld', 120, 450, 1240, 'hrms.evn.vn/<b>hop-dong-lao-dong</b>').in(B[1].t - 0.6);
  const co = $$('#s11 .co');
  master.fromTo(co, { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5, stagger: 0.12 }, B[1].t - 0.3);
  const a1 = B.at(1, 'được xem'), a2 = B.at(1, 'chữ ký số'), a3 = B.at(1, 'lộ trình');
  hw.hl([7.5, 13, 52.5, 86], 'Xem hợp đồng', a1 - 0.1, a2 - 0.1); flashOn(co[0], a1 - 0.1, a2 - 0.1);
  hw.hl([64.5, 28.5, 19.5, 6.5], 'Ký số USB · HSM', a2 - 0.1, a3 - 0.1); flashOn(co[1], a2 - 0.1, a3 - 0.1);
  hw.hl([64.5, 35, 34.5, 50], 'Lộ trình xử lý', a3 - 0.1, null, 'dn'); flashOn(co[2], a3 - 0.1, B.end + 3);
  return Math.max(t + 8, B.end + 1.0);
}

function S12(t) { // báo cáo & ký số
  const B = say('s12', t, { lead: 0.7 });
  hd('s12', t);
  const bw = makeWin('#s12', 'baocao', 120, 250, 1680, 'hrms.evn.vn/<b>bao-cao/lao-dong-tien-luong</b>').in(t + 0.3);
  const e = B[1].t - 0.6;
  bw.hl([10, 21, 69, 8], 'Biểu mẫu chuẩn', B.at(0, 'mẫu chuẩn') - 0.1, e);
  bw.hl([36.5, 31, 23.5, 7], 'Trong kỳ', B.at(0, 'theo kỳ') - 0.1, e, 'dn');
  bw.hl([60, 31, 23, 7], 'Lũy kế', B.at(0, 'lũy kế') - 0.1, e, 'dn');
  bw.hl([83, 11.5, 8, 6.5], 'Tổng hợp', B.at(0, 'tổng hợp') - 0.1, e, 'rt');
  bw.hl([91.5, 11.5, 8, 6.5], 'Chuyển ký', B.at(0, 'chuyển ký') - 0.1, e, 'rt dn');
  bw.out(e, { x: -100, y: 0, scale: 0.92 });
  const kw = makeWin('#s12', 'kyso_web', 120, 280, 1100, 'hrms.evn.vn/<b>ky-so</b>').in(B[1].t - 0.4);
  kw.hl([7, 7.5, 23, 25], 'Báo cáo chờ ký', B.at(1, 'ký số') - 0.1, null, 'dn');
  kw.hl([88.5, 7, 5.6, 5.6], 'Ký số', B.at(1, 'máy tính') - 0.1, null, 'rt');
  const ph = makePhone('#s12', 'kyso_app', 1360, 250, 400, 740).in(B.at(1, 'điện thoại') - 0.5);
  ph.tap(15, 7, B.at(1, 'điện thoại') + 0.3);
  return Math.max(t + 7.5, B.end + 1.2);
}

function S13(t) { // phân quyền & nhật ký
  const B = say('s13', t, { lead: 0.7 });
  hd('s13', t);
  const qw = makeWin('#s13', 'quantri', 120, 250, 740, 'portal.evnict.vn · <b>quản trị tập trung</b>').in(t + 0.3);
  const pw = makeWin('#s13', 'phanquyen', 920, 250, 880, 'hrms.evn.vn/<b>phan-quyen</b>').in(t + 0.5);
  pw.hl([8.5, 52, 30, 7], 'Vai trò', B.at(0, 'phân quyền') - 0.1, null, 'dn');
  qw.hl([25, 17, 48.5, 24], 'Quản trị tập trung', B.at(0, 'quản trị tập trung') - 0.1, null, 'dn');
  const L = $$('#s13 .layers span');
  [['đơn vị', 0], ['phần mềm', 1], ['menu', 2]].forEach(([p, i]) => { up(L[i], B.at(0, p) - 0.2, { x: -30, y: 0 }); cue(B.at(0, p) - 0.2, 'tick'); });
  pw.hl([40.5, 37.5, 57.5, 42], 'Menu chức năng', B.at(0, 'menu') - 0.1, null, 'dn rt');
  const r = B.at(1, 'Ma trận') - 0.2;
  up('#s13 .roles', r, { y: 40 });
  counter('#s13 .v44', 0, 44, B.at(1, 'bốn mươi bốn') - 0.2, 1.0);
  master.fromTo('#s13 .roles .r i', { scaleX: 0 }, { scaleX: 1, duration: 0.5, stagger: 0.12 }, B.at(1, 'bốn mươi bốn'));
  const a = B.at(1, 'nhật ký') - 0.2;
  up('#s13 .audit', a, { y: 40 }); cue(a, 'type');
  const LOG = [['08:12:04', 'TCNS_03 · CẬP NHẬT HỒ SƠ #NS-1024'], ['08:12:31', 'LĐ_PX2 · KÝ SỐ QĐ NÂNG LƯƠNG'], ['08:13:02', 'NLĐ_5817 · BỔ SUNG LÝ LỊCH'],
    ['08:13:47', 'TCNS_01 · SỬA ĐỔI HĐLĐ #HD-0457'], ['08:14:10', 'ADMIN · CẤU HÌNH LUỒNG KÝ'], ['08:14:55', 'TCNS_03 · CHỐT SỐ LIỆU BÁO CÁO'],
    ['08:15:20', 'LĐ_ĐV1 · DUYỆT HỒ SƠ BỔ SUNG'], ['08:16:02', 'NLĐ_2290 · KÝ HĐLĐ ĐIỆN TỬ']];
  const box = $('#s13 .log .in');
  [...LOG, ...LOG].forEach(([x, y]) => div('', box, `<span>[${x}]</span> ${y}`));
  UPD.push((tt) => { box.style.transform = `translateY(${-((Math.max(0, tt - a) * 26) % (LOG.length * 26))}px)`; });
  return Math.max(t + 8, B.end + 1.2);
}

function S14(t) { // khả năng mở rộng
  bg(t, { pulse: 0.8, tower: 0.15 }, 0.6);
  const B = say('s14', t, { lead: 0.7 });
  hd('s14', t);
  const T = $$('#s14 .t');
  const ph = [B.at(0, 'vi dịch vụ'), B.at(0, 'chuẩn hoá'), B.at(0, 'hai mươi bốn'), B.at(0, 'chín mươi bảy')];
  T.forEach((c, i) => {
    master.fromTo(c, { autoAlpha: 0, y: 70, rotationX: 25, transformPerspective: 1400 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 0.7 }, ph[i] - 0.3); cue(ph[i] - 0.3, 'pop');
    lit(c, ph[i] - 0.1);
  });
  counter('#s14 .v97', 0, 97000, ph[3] - 0.1, 1.4, dots);
  return Math.max(t + 7.5, B.end + 1.4);
}

function S15(t) { // lộ trình 6 bước
  const B = say('s15', t, { lead: 0.7 });
  hd('s15', t);
  const N = $$('#s15 .s11-n'), T = $$('#s15 .s11-t'), X = [260, 540, 820, 1100, 1380, 1660];
  pop(N, t + 0.5, { from: 0.3, stagger: 0.06 });
  master.fromTo('#s15 .s11-cable', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, t + 0.4);
  const ph = ['khảo sát', 'chuyển đổi dữ liệu', 'cấu hình', 'đào tạo', 'vận hành chính thức', 'hỗ trợ sau'];
  const at = ph.map((p) => B.at(0, p) - 0.15);
  master.fromTo('#s15 .s11-cable .spark', { opacity: 0 }, { opacity: 1, duration: 0.2 }, at[0]);
  X.forEach((x, i) => {
    master.to('#s15 .s11-cable .fill', { width: x - 120, duration: 0.35, ease: 'power2.inOut' }, at[i] - 0.25);
    master.to('#s15 .s11-cable .spark', { left: x - 120, duration: 0.35, ease: 'power2.inOut' }, at[i] - 0.25);
    master.set(N[i], { attr: { class: 's11-n on' } }, at[i]);
    sparks(x, 520, at[i], { r0: 30, r1: 100, n: 5, silent: i % 2 === 1 });
    master.fromTo(T[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.5 }, at[i]);
  });
  master.to('#s15 .s11-cable .spark', { opacity: 0, duration: 0.3 }, at[5] + 0.6);
  const hdR = $$('#s15 .coop .hd');
  up(hdR, B[1].t - 0.3, { y: 14 });
  const rows = [[0, 'kỹ thuật'], [1, 'hỗ trợ hai'], [2, 'phối hợp']];
  const C = [...$('#s15 .coop').children].filter((e) => !e.classList.contains('hd') && e.tagName !== 'DIV');
  rows.forEach(([r, p]) => {
    const a = B.at(1, p) - 0.2, cells = C.slice(r * 3, r * 3 + 3);
    master.fromTo(cells[0], { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.5 }, a);
    master.fromTo(cells[1], { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.4, ease: 'back.out(2)' }, a + 0.15);
    master.fromTo(cells[2], { autoAlpha: 0, x: 40 }, { autoAlpha: 1, x: 0, duration: 0.5 }, a + 0.25);
    cue(a, 'pop');
  });
  return Math.max(t + 9, B.end + 1.2);
}

function S16(t) { // giá trị mang lại
  cue(t, 'sec_soft');
  bg(t, { tower: 0.25, towerE: 0.6, floor: 0.35 }, 0.8);
  const B = say('s16', t, { lead: 0.7 });
  hd('s16', t);
  const V = $$('#s16 .v');
  ['Nâng cao hiệu quả', 'tối ưu quản trị', 'tiết kiệm', 'minh bạch', 'nâng tầm', 'nền tảng số'].forEach((p, i) => {
    const a = B.at(0, p) - 0.25;
    master.fromTo(V[i], { autoAlpha: 0, y: 50, scale: 0.94 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.55, ease: 'back.out(1.5)' }, a); cue(a, 'pop');
    flashOn(V[i], a + 0.1, a + 1.3);
  });
  master.set(V, { attr: { class: 'v frame on' } }, B.end + 0.2);
  return Math.max(t + 8, B.end + 1.4);
}

function S17(t) { // kết
  cue(t + 0.3, 'sec_end');
  bg(t, { trace: 0.7, tower: 0.9, towerE: 1, floor: 0.55, pulse: 1 }, 0.8);
  master.to('#bug', { autoAlpha: 0, duration: 0.3 }, t);
  master.fromTo('.s15-disc', { scale: 0 }, { scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, t + 0.2);
  sparks(960, 240, t + 0.5, { r0: 130, r1: 240, n: 9, silent: true });
  reveal('.s15-word', t + 0.7, 0.6, 'center'); cue(t + 0.7, 'swish');
  const B = say('s17', t, { lead: 1.0 });
  words('.s15-h', B[0].t - 0.1);
  up('.s15-s', B.at(0, 'chuyển đổi số') - 0.2, { y: 24 });
  pop('.s15-cta', B[1].t - 0.1, { from: 0.8 }); cue(B[1].t - 0.1, 'pop');
  master.to('.s15-cta', { scale: 1.04, duration: 0.45, yoyo: true, repeat: 5, ease: 'sine.inOut' }, B[1].t + 0.6);
  up('.s15-chips span', B[1].t + 0.4, { stagger: 0.1, y: 20 });
  const end = Math.max(t + 9, B.end + 3.2);
  master.to('#stage', { opacity: 0, duration: 1.0, ease: 'none' }, end - 1.0);
  return end;
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
  x = iris(t, '#s5', '#s6', 960, 485); t = S6(x);
  x = surge(t, '#s6', '#s7'); t = S7(x);
  x = glitchCut(t, '#s7', '#s8'); t = S8(x);
  x = surge(t, '#s8', '#s9'); t = S9(x);
  x = blockWipe(t, '#s9', '#s10'); t = S10(x);
  x = surge(t, '#s10', '#s11'); t = S11(x);
  x = glitchCut(t, '#s11', '#s12'); t = S12(x);
  x = blockWipe(t, '#s12', '#s13'); t = S13(x);
  x = surge(t, '#s13', '#s14'); t = S14(x);
  x = iris(t, '#s14', '#s15', 960, 520); t = S15(x);
  x = glitchCut(t, '#s15', '#s16'); t = S16(x);
  x = iris(t, '#s16', '#s17', 960, 240); t = S17(x);
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
  VO = await (await fetch('vo.json')).json();
  await loadIcons();
  await document.fonts.ready;
  const waitImgs = async () => {
    await Promise.all($$('img').map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = r; }))));
    await Promise.all($$('img').map((i) => i.decode().catch(() => {})));
  };
  await waitImgs();
  const dur = build();
  await waitImgs(); // ảnh giao diện tạo thêm trong build
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
