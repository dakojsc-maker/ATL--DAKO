/* Viện STP – Hồ sơ năng lực đào tạo AI cho hành chính công (có thuyết minh).
   Thời lượng từng cảnh lấy theo độ dài lời đọc (vo.json do tts.py sinh ra); các chuyển động được canh
   theo thời điểm bắt đầu từng câu / từng cụm từ trong câu. Toàn bộ chạy trên một GSAP timeline dừng sẵn,
   các hiệu ứng canvas là hàm thuần của thời gian t để render tất định qua window.__seek(t). */
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
const inOut2 = (v) => { v = clamp01(v); return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; };
const LIME = '#B6F36A', MINT = '#34E7A0', TEAL = '#2DD4BF';
let VO = null;

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
  B.at = (i, p) => { const s = B[i].say.indexOf(p); return B[i].t + B[i].d * (s < 0 ? 0 : s / B[i].say.length); };
  return B;
}

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
function scramble(sel, at, dur = 1.0) {
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
    { x: -amp, skewX: 8, textShadow: `${amp}px 0px 0px ${LIME}, ${-amp}px 0px 0px ${TEAL}` },
    { x: amp * 0.8, skewX: -6, textShadow: `${-amp * 0.6}px 0px 0px ${LIME}, ${amp * 0.6}px 0px 0px ${TEAL}` },
    { x: -amp * 0.4, skewX: 3, textShadow: `${amp * 0.3}px 0px 0px ${LIME}, ${-amp * 0.3}px 0px 0px ${TEAL}` },
    { x: 0, skewX: 0, textShadow: '0px 0px 0px rgba(0,0,0,0), 0px 0px 0px rgba(0,0,0,0)' },
  ];
  master.to(sel, { keyframes: k.map((v, i) => ({ ...v, duration: i === 3 ? dur * 0.4 : dur * 0.2 })), ease: 'none' }, at);
  cue(at, 'glitch');
}
function stream(elm, at, dur) { // chữ hiện dần như AI đang trả lời
  const e = el(elm), txt = e.textContent;
  UPD.push((t) => {
    let s;
    if (t < at) s = '';
    else if (t >= at + dur) s = txt;
    else { const n = Math.floor(((t - at) / dur) * txt.length); s = txt.slice(0, n) + (Math.floor(t * 5) % 2 ? '▍' : ''); }
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
  const from = { left: 'inset(0 100% 0 0)', top: 'inset(0 0 100% 0)', center: 'inset(0 50% 0 50%)' }[dir];
  master.fromTo(sel, { clipPath: from, autoAlpha: 1 }, { clipPath: 'inset(0 0% 0 0%)', duration: dur, ease: 'power3.inOut' }, at);
  master.set(sel, { clearProps: 'clipPath' }, at + dur + 0.01);
}
function flow(sel, at, speed = 140) {
  const list = els(sel);
  master.to(list, { opacity: 1, duration: 0.4, ease: 'none' }, at);
  UPD.push((t) => { const v = -Math.max(0, t - at) * speed; list.forEach((e) => { e.style.strokeDashoffset = v; }); });
}
function lit(sel, at, cls = 'on') { // bật trạng thái nổi bật (class) tại thời điểm at
  els(sel).forEach((e) => { const base = e.getAttribute('class'); master.set(e, { attr: { class: `${base} ${cls}` } }, at); });
}
function sparks(x, y, at, o = {}) { // tia dữ liệu toả ra
  const dur = o.dur ?? 0.5, n = o.n ?? 26, r0 = o.r0 ?? 20, r1 = o.r1 ?? 140;
  FX.push({ t0: at, t1: at + dur, fn: (g, t) => {
    const k = (t - at) / dur, R = rng(Math.round(x * 7 + y * 3));
    for (let i = 0; i < n; i++) {
      const an = R() * 6.283, sp = 0.6 + 0.4 * R(), r = r0 + (r1 - r0) * Math.pow(k, 0.6) * sp, s = 3 + R() * 4;
      g.fillStyle = `rgba(${i % 2 ? '182,243,106' : '52,231,160'},${(1 - k) * 0.9})`;
      g.fillRect(x + Math.cos(an) * r - s / 2, y + Math.sin(an) * r - s / 2, s, s);
    }
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
  master.fromTo(BLOCKS, { scaleY: 0, transformOrigin: '50% 0%' }, { scaleY: 1, duration: 0.2, ease: 'power2.out', stagger: { grid: [14, 24], from: [0, 0.5], amount: 0.42 } }, at);
  swap(prev, next, at + 0.62);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.25, duration: 0.08, yoyo: true, repeat: 1 }, at + 0.58);
  master.to(BLOCKS, { scaleY: 0, transformOrigin: '50% 100%', duration: 0.2, ease: 'power2.in', stagger: { grid: [14, 24], from: [0, 0.5], amount: 0.42 } }, at + 0.66);
  master.set('#blocks', { visibility: 'hidden' }, at + 1.3);
  cue(at, 'whoosh');
  return at + 0.62;
}
function glitchCut(at, prev, next) {
  master.to(prev, { keyframes: [{ x: -24, filter: 'hue-rotate(40deg) saturate(2)', duration: 0.06 }, { x: 18, duration: 0.06 }, { x: -8, duration: 0.06 }], ease: 'none' }, at);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.4, duration: 0.07, yoyo: true, repeat: 1 }, at + 0.14);
  swap(prev, next, at + 0.18);
  master.set(prev, { x: 0, filter: 'none' }, at + 0.2);
  master.fromTo(next, { x: 20, filter: 'hue-rotate(-40deg) saturate(2)' }, { x: 0, filter: 'hue-rotate(0deg) saturate(1)', duration: 0.25, ease: 'steps(4)' }, at + 0.18);
  master.set(next, { clearProps: 'filter' }, at + 0.45);
  master.set(prev, { clearProps: 'filter,transform' }, at + 0.46);
  cue(at, 'glitch'); cue(at, 'swish');
  return at + 0.2;
}
// vệt quét dữ liệu từ trên xuống, cảnh mới hiện phía trên vệt quét
const SCANS = [];
function scanWipe(at, prev, next, D = 0.75) {
  show(next, at); hide(prev, at + D);
  SCANS.push({ at, D, prev: $(prev), next: $(next), on: false });
  master.set('#beam', { visibility: 'visible' }, at);
  master.set('#beam', { visibility: 'hidden' }, at + D);
  FX.push({ t0: at, t1: at + D, fn: (g, t) => {
    const y = inOut2((t - at) / D) * 1080, R = rng(Math.floor(t * 30) * 13 + 1);
    for (let i = 0; i < 160; i++) {
      const x = R() * 1920, dy = (R() - 0.5) * R() * 170, s = 2 + R() * 8;
      g.fillStyle = `rgba(${R() < 0.5 ? '182,243,106' : '52,231,160'},${0.2 + R() * 0.6})`;
      g.fillRect(x, y + dy, s, s);
    }
  } });
  cue(at, 'whoosh'); cue(at + 0.1, 'blip');
  return at + D * 0.55;
}
// mở cảnh dạng vòng tròn loang ra từ một điểm (cảnh cũ được khoét lỗ tương ứng)
const IRIS = [];
function iris(at, prev, next, x, y, D = 0.8) {
  show(next, at); hide(prev, at + D);
  IRIS.push({ at, D, x, y, prev: $(prev), next: $(next), on: false });
  FX.push({ t0: at, t1: at + D, fn: (g, t) => {
    const k = (t - at) / D, r = 2300 * k * k;
    g.lineWidth = 6; g.strokeStyle = `rgba(182,243,106,${0.9 * (1 - k * 0.5)})`; g.shadowColor = MINT; g.shadowBlur = 24;
    g.beginPath(); g.arc(x, y, Math.max(1, r), 0, 6.283); g.stroke(); g.shadowBlur = 0;
  } });
  sparks(x, y, at, { r0: 30, r1: 260, n: 40, dur: 0.6 });
  cue(at, 'whoosh'); cue(at, 'swish');
  return at + D * 0.6;
}
UPD.push((t) => {
  SCANS.forEach((s) => { if ((t < s.at || t > s.at + s.D) && s.on) { s.prev.style.clipPath = ''; s.next.style.clipPath = ''; s.on = false; } });
  IRIS.forEach((s) => { if ((t < s.at || t > s.at + s.D) && s.on) { s.prev.style.webkitMaskImage = ''; s.next.style.clipPath = ''; s.on = false; } });
  SCANS.forEach((s) => {
    if (t < s.at || t > s.at + s.D) return;
    const p = inOut2((t - s.at) / s.D) * 100;
    s.next.style.clipPath = `inset(0 0 ${100 - p}% 0)`; s.prev.style.clipPath = `inset(${p}% 0 0 0)`;
    $('#beam').style.top = `${p * 10.8}px`; s.on = true;
  });
  IRIS.forEach((s) => {
    if (t < s.at || t > s.at + s.D) return;
    const k = (t - s.at) / s.D, r = 2300 * k * k;
    s.next.style.clipPath = `circle(${r.toFixed(1)}px at ${s.x}px ${s.y}px)`;
    s.prev.style.webkitMaskImage = `radial-gradient(circle at ${s.x}px ${s.y}px, transparent ${r.toFixed(1)}px, #000 ${(r + 1.5).toFixed(1)}px)`;
    s.on = true;
  });
});

/* ---------- nền: mạng nơ-ron ---------- */
const BG = { net: 0.85, floor: 0.35 };
const bg = (at, o, dur = 0.8) => master.to(BG, { ...o, duration: dur, ease: 'none' }, at);
function buildNet() {
  const cv = $('#net'), g = cv.getContext('2d'), R = rng(21), P = [];
  for (let i = 0; i < 64; i++) P.push({ x: R() * 1920, y: R() * 1080, ax: 20 + R() * 60, ay: 20 + R() * 50, w: 0.1 + R() * 0.25, p: R() * 6.28, ph: R() * 10, sp: 0.35 + R() * 0.4 });
  UPD.push((t) => {
    g.clearRect(0, 0, 1920, 1080);
    if (BG.net <= 0.01) return;
    const pts = P.map((p) => [p.x + Math.sin(t * p.w + p.p) * p.ax, p.y + Math.cos(t * p.w * 0.8 + p.p) * p.ay]);
    g.lineWidth = 1;
    for (let i = 0; i < pts.length; i++) for (let j = i + 1; j < pts.length; j++) {
      const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]);
      if (d < 200) { g.strokeStyle = `rgba(52,231,160,${(1 - d / 200) * 0.22 * BG.net})`; g.beginPath(); g.moveTo(pts[i][0], pts[i][1]); g.lineTo(pts[j][0], pts[j][1]); g.stroke(); }
    }
    g.fillStyle = `rgba(160,255,210,${0.55 * BG.net})`;
    pts.forEach(([x, y], i) => { g.beginPath(); g.arc(x, y, i % 7 === 0 ? 2.6 : 1.6, 0, 6.283); g.fill(); });
    // xung tín hiệu chạy giữa các nút (như nơ-ron truyền tin)
    P.forEach((p, i) => {
      const c = t * p.sp + p.ph, k = Math.floor(c), u = c - k;
      let best = -1, bd = 1e9;
      for (let j = 0; j < pts.length; j++) { if (j === i) continue; const d = Math.hypot(pts[i][0] - pts[j][0], pts[i][1] - pts[j][1]); if (d < bd && d < 200 && (j + k) % 3 !== 0) { bd = d; best = j; } }
      if (best < 0 || hash(i, k) > 0.55) return;
      const x = pts[i][0] + (pts[best][0] - pts[i][0]) * u, y = pts[i][1] + (pts[best][1] - pts[i][1]) * u;
      g.fillStyle = `rgba(182,243,106,${0.9 * BG.net * Math.sin(u * Math.PI)})`;
      g.beginPath(); g.arc(x, y, 2.8, 0, 6.283); g.fill();
    });
  });
  UPD.push((t) => {
    $('#floor').style.opacity = BG.floor;
    $('#floor .grid').style.backgroundPosition = `0px ${(t * 45) % 90}px`;
    const s = Math.floor(t), fr = Math.floor((t - s) * 30);
    $('#hud .tc').textContent = `${String(Math.floor(s / 60)).padStart(2, '0')}:${String(s % 60).padStart(2, '0')}:${String(fr).padStart(2, '0')}`;
  });
}
/* ---------- quả cầu AI (mạng điểm 3D xoay) ---------- */
function makeOrb(id, scene) {
  const cv = $(id), g = cv.getContext('2d'), N = 240, P = [], E = [], sc = $(scene);
  const ga = Math.PI * (3 - Math.sqrt(5));
  for (let i = 0; i < N; i++) { const y = 1 - (i / (N - 1)) * 2, r = Math.sqrt(1 - y * y), th = ga * i; P.push([Math.cos(th) * r, y, Math.sin(th) * r]); }
  for (let i = 0; i < N; i++) {
    const d = P.map((q, j) => [j, (q[0] - P[i][0]) ** 2 + (q[1] - P[i][1]) ** 2 + (q[2] - P[i][2]) ** 2]).sort((a, b) => a[1] - b[1]);
    for (let k = 1; k <= 3; k++) if (d[k][0] > i) E.push([i, d[k][0]]);
  }
  const st = { a: 0, k: 1, spin: 1 };
  UPD.push((t) => {
    g.clearRect(0, 0, 760, 760);
    if (st.a < 0.01 || sc.style.visibility !== 'visible') return;
    const ay = t * 0.35 * st.spin, ax = 0.35 + Math.sin(t * 0.3) * 0.15, Rr = 230 * st.k;
    const cy = Math.cos(ay), sy = Math.sin(ay), cx = Math.cos(ax), sx = Math.sin(ax);
    const Q = P.map(([x, y, z]) => { const x1 = x * cy + z * sy, z1 = -x * sy + z * cy, y2 = y * cx - z1 * sx, z2 = y * sx + z1 * cx, s = 1 + 0.18 * z2; return [380 + x1 * Rr * s, 380 + y2 * Rr * s, z2]; });
    const gr = g.createRadialGradient(380, 380, 0, 380, 380, Rr * 1.35);
    gr.addColorStop(0, `rgba(52,231,160,${0.38 * st.a})`); gr.addColorStop(0.5, `rgba(45,212,191,${0.12 * st.a})`); gr.addColorStop(1, 'rgba(45,212,191,0)');
    g.fillStyle = gr; g.fillRect(0, 0, 760, 760);
    g.lineWidth = 1;
    E.forEach(([i, j], e) => {
      const z = (Q[i][2] + Q[j][2]) / 2;
      g.strokeStyle = `rgba(120,240,190,${st.a * (0.08 + 0.32 * (z + 1) / 2)})`;
      g.beginPath(); g.moveTo(Q[i][0], Q[i][1]); g.lineTo(Q[j][0], Q[j][1]); g.stroke();
      const c = t * 1.4 + e * 0.37, k = Math.floor(c);
      if (hash(e, k) < 0.05 && z > -0.2) {
        const u = c - k; g.fillStyle = `rgba(214,255,160,${st.a * Math.sin(u * Math.PI)})`;
        g.beginPath(); g.arc(Q[i][0] + (Q[j][0] - Q[i][0]) * u, Q[i][1] + (Q[j][1] - Q[i][1]) * u, 2.6, 0, 6.283); g.fill();
      }
    });
    Q.forEach(([x, y, z]) => { g.fillStyle = `rgba(200,255,225,${st.a * (0.25 + 0.75 * (z + 1) / 2)})`; g.beginPath(); g.arc(x, y, 1.2 + 1.8 * (z + 1) / 2, 0, 6.283); g.fill(); });
    const core = g.createRadialGradient(380, 380, 0, 380, 380, 70 * st.k);
    core.addColorStop(0, `rgba(240,255,220,${0.9 * st.a})`); core.addColorStop(0.35, `rgba(182,243,106,${0.45 * st.a})`); core.addColorStop(1, 'rgba(52,231,160,0)');
    g.fillStyle = core; g.beginPath(); g.arc(380, 380, 70 * st.k, 0, 6.283); g.fill();
  });
  return st;
}

/* ================= CẢNH ================= */
function S1(t) { // mở đầu: núi giấy tờ → trợ lý AI
  show('#s1', 0);
  const B = voice('s1', t, { lead: 1.2 });
  const box = $('.s1-docs'), R = rng(5);
  const L = ['CÔNG VĂN', 'TỜ TRÌNH', 'BÁO CÁO', 'KẾ HOẠCH', 'THÔNG BÁO', 'HỒ SƠ TTHC', 'BIÊN BẢN HỌP', 'QUYẾT ĐỊNH'];
  const P = [[140, 110], [420, 230], [700, 90], [1080, 110], [1360, 220], [1660, 100], [60, 430], [1760, 420], [210, 575], [500, 545], [1300, 545], [1600, 575], [820, 300], [1000, 330]];
  const docs = P.map(([x, y], i) => {
    const d = div('dc', box, `<b>${L[i % L.length]}</b><i></i><i></i><i style="width:70%"></i><i></i><i style="width:50%"></i>`);
    d.style.left = `${x}px`; d.style.top = `${y}px`;
    const r = (R() - 0.5) * 30;
    master.fromTo(d, { x: (x + 75 - 960) * 0.9, y: (y + 98 - 540) * 0.9 + 200, rotation: r * 3, scale: 1.5, autoAlpha: 0 }, { x: 0, y: 0, rotation: r, scale: 1, autoAlpha: 1, duration: 1.1, ease: 'power3.out' }, t + 0.1 + i * 0.07);
    master.to(d, { y: (R() - 0.5) * 50, x: (R() - 0.5) * 50, rotation: r + (R() - 0.5) * 16, duration: 4, ease: 'sine.inOut' }, t + 1.3);
    return { d, x, y };
  });
  [0, 0.4, 0.8].forEach((d) => cue(t + 0.2 + d, 'swish'));
  words('.s1-a', B[0].t, { stagger: 0.06 });
  master.to('.s1-a', { y: -40, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, B[1].t - 0.45);
  const orb = makeOrb('#orb1', '#s1');
  master.fromTo(orb, { a: 0, k: 0.2 }, { a: 1, k: 1, duration: 1.4, ease: 'power3.out' }, B[1].t - 0.2);
  sparks(960, 470, B[1].t, { r0: 40, r1: 300, n: 50, dur: 0.8 }); cue(B[1].t, 'hit');
  master.to(docs.map((o) => o.d), { x: (i) => 885 - docs[i].x, y: (i) => 372 - docs[i].y, rotation: 0, scale: 0.15, autoAlpha: 0, duration: 1.1, ease: 'power2.in', stagger: 0.04 }, B[1].t + 0.1);
  words('.s1-b', B[1].t + 0.1, { stagger: 0.05 });
  return Math.max(t + 9, B.end + 1.0);
}

function S2(t) { // thương hiệu: Viện STP – AI Training Profile
  const B = voice('s2', t, { lead: 0.9 });
  cue(t + 0.45, 'downbeat'); cue(t + 0.45, 'sec_groove');
  const orb = makeOrb('#orb2', '#s2');
  master.fromTo(orb, { a: 0, k: 0.5 }, { a: 1, k: 1, duration: 1.2 }, t);
  pop('.s2-logo', t + 0.3, { from: 0.3, ease: 'back.out(2)' });
  sparks(210, 190, t + 0.45, { r0: 90, r1: 220, n: 30 });
  kicker('.s2-k', t + 0.6);
  words('.s2-h', t + 0.8);
  master.fromTo('.s2-big', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, t + 1.0);
  scramble('.s2-big', t + 1.0, 1.1);
  glitch('.s2-big', t + 2.2, 0.4, 10);
  up('.s2-tag', t + 2.0, { y: 20 });
  const chips = $$('.s2-chips span'), n = chips.length, cx = 1420, cy = 500;
  master.fromTo(chips, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.12, ease: 'back.out(2)' }, B[0].t + 0.6);
  chips.forEach((_, i) => cue(B[0].t + 0.6 + i * 0.12, 'pop'));
  UPD.push((tt) => {
    chips.forEach((c, i) => {
      const a = (i / n) * 6.283 + tt * 0.22, z = Math.sin(a);
      const x = cx + Math.cos(a) * 300 - c.offsetWidth / 2, y = cy + z * 190 - 24;
      c.style.left = `${x}px`; c.style.top = `${y}px`; c.style.zIndex = z > 0 ? 3 : 1;
      c.style.filter = `brightness(${0.75 + 0.25 * (z + 1) / 2})`;
    });
  });
  reveal('.s2-quote', B[1].t - 0.1, 0.7);
  words('.s2-quote p', B[1].t, { stagger: 0.03 });
  master.to('.s2-quote b', { color: '#B6F36A', duration: 0.3, stagger: 0.5 }, B.at(1, 'năng lực thực thi'));
  return Math.max(t + 9, B.end + 1.0);
}

function S3(t) { // về chúng tôi
  master.set('#bug', { visibility: 'visible' }, t);
  master.fromTo('#bug', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.6 }, t + 0.2);
  bg(t, { net: 0.55 }, 0.6);
  const B = voice('s3', t, { lead: 0.6 });
  head(3, t);
  up('.s3-stats .st', B[0].t, { stagger: 0.15 });
  counter('.s3-stats .v1', 1990, 2020, B[0].t, 1.4);
  counter('.s3-stats .v3', 0, 3, B[0].t + 0.3, 1.2, (v) => String(Math.round(v)).padStart(2, '0'));
  lit($$('.s3-stats .st')[1], B.at(0, 'trực thuộc'));
  reveal('.s3-cert', B.at(0, 'trực thuộc') + 0.2, 0.8); cue(B.at(0, 'trực thuộc') + 0.2, 'swish');
  master.fromTo('.s3-cert .stamp', { scale: 2.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power4.in' }, B.at(0, 'Kỹ thuật')); cue(B.at(0, 'Kỹ thuật') + 0.3, 'stamp');
  lit($$('.s3-stats .st')[0], B.at(1, '2020'));
  lit($$('.s3-stats .st')[2], B.at(1, 'văn phòng'));
  master.set('.s3-net .ln', { autoAlpha: 0 }, 0);
  master.set('.s3-net .ln', { autoAlpha: 1 }, B.at(1, 'văn phòng'));
  draw('.s3-net .ln', B.at(1, 'văn phòng'), 1.6);
  flow('.s3-net .en', B.at(1, 'văn phòng') + 1.2, 80);
  const of = $$('.s3-net .of');
  [['Hà Nội', 0], ['Nha Trang', 1], ['Thành phố', 2]].forEach(([p, i]) => { up(of[i], B.at(1, p), { x: -30, y: 0 }); cue(B.at(1, p), 'tick'); });
  return Math.max(t + 7, B.end + 1.0);
}

function S4(t) { // sứ mệnh & giá trị
  const B = voice('s4', t, { lead: 0.6 });
  head(4, t);
  const ms = $$('.s4-mis .m');
  ['đào tạo', 'kết nối', 'xây dựng', 'đồng hành'].forEach((p, i) => {
    const at = Math.max(B[0].t + i * 0.3, B.at(0, p) - 0.2);
    master.fromTo(ms[i], { autoAlpha: 0, y: 50 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at);
    master.fromTo($('.ic', ms[i]), { scale: 0.3, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.6, ease: 'back.out(2)' }, at + 0.1);
    cue(at, 'tick');
  });
  const vs = $$('.s4-val .v');
  ['minh bạch', 'ứng dụng', 'bền vững'].forEach((p, i) => {
    const at = B.at(1, p) - 0.15;
    master.fromTo(vs[i], { autoAlpha: 0, scale: 0.85 }, { autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(1.8)' }, at);
    master.fromTo($('.hx', vs[i]), { rotation: -120 }, { rotation: 0, duration: 0.7, ease: 'back.out(1.6)' }, at);
    cue(at, 'pop');
  });
  return Math.max(t + 7, B.end + 1.0);
}

function S5(t) { // năng lực cốt lõi
  const B = voice('s5', t, { lead: 0.6 });
  head(5, t);
  const cs = $$('#s5 .cp');
  const card = (i, at) => { master.fromTo(cs[i], { autoAlpha: 0, y: 40 }, { autoAlpha: 1, y: 0, duration: 0.6 }, at); cue(at, 'swish'); };
  card(0, B[0].t);
  lit(cs[0], B[0].t + 0.4);
  master.fromTo('.cp .flow .scan', { x: 0 }, { x: 600, duration: 2.6, ease: 'power1.inOut' }, B.at(0, 'khảo sát'));
  master.to('.cp .flow .scan', { x: 311, duration: 0.6, ease: 'power2.inOut' }, B.at(0, 'khảo sát') + 2.7);
  master.fromTo('.cp .flow i.bad', { boxShadow: '0 0 0 0px rgba(255,90,106,.7)' }, { boxShadow: '0 0 0 18px rgba(255,90,106,0)', duration: 0.6, repeat: 2 }, B.at(0, 'điểm nghẽn'));
  cue(B.at(0, 'điểm nghẽn'), 'alarm');
  master.to('.cp .flow i.bad', { borderColor: MINT, backgroundColor: '#0B4A33', duration: 0.4 }, B.at(0, 'dành riêng'));
  cue(B.at(0, 'dành riêng'), 'ding');
  card(1, B[1].t - 0.2);
  lit(cs[1], B[1].t);
  up($$('.cp .auto .bub'), B[1].t + 0.3, { stagger: 0.5, x: -20, y: 0 });
  master.fromTo('.cp .auto .gear', { rotation: 0 }, { rotation: 360, duration: 4, ease: 'none' }, B[1].t);
  card(2, B[2].t - 0.2);
  lit(cs[2], B[2].t);
  up($$('.cp .duo span'), B.at(2, 'tầm nhìn'), { stagger: 0.9, y: 20 });
  card(3, B[2].t + 1.6);
  up($$('.cp .tags span'), B[2].t + 1.8, { stagger: 0.15, y: 16 });
  return Math.max(t + 8, B.end + 1.2);
}

function S6(t) { // chương trình theo đối tượng
  cue(t, 'sec_tension');
  const B = voice('s6', t, { lead: 0.6 });
  head(6, t);
  const gs = $$('#s6 .pg');
  ['cơ quan nhà nước', 'doanh nghiệp', 'đơn vị giáo dục', 'cá nhân'].forEach((p, i) => {
    const at = B.at(0, p) - 0.25;
    master.fromTo(gs[i], { autoAlpha: 0, scale: 0.92 }, { autoAlpha: 1, scale: 1, duration: 0.5 }, at);
    master.fromTo($$('.ch span', gs[i]), { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.05 }, at + 0.2);
    cue(at, 'pop');
  });
  lit(gs[0], B.end + 0.2, 'on');
  master.to(gs[0], { scale: 1.03, duration: 0.4, yoyo: true, repeat: 1, ease: 'sine.inOut' }, B.end + 0.2);
  cue(B.end + 0.2, 'ding');
  return B.end + 1.5;
}

function S7(t) { // chương trình trọng tâm
  cue(t, 'sec_main'); cue(t, 'hit');
  const B = voice('s7', t, { lead: 0.7 });
  head(7, t);
  up('.s7-sub', t + 1.0, { y: 16 });
  up('.s7-donut', B[0].t + 2.0, { y: 40 });
  up('.s7-tiles span', B[0].t + 2.6, { stagger: 0.12, y: 30 });
  const C = 2 * Math.PI * 110, a = $('.s7-donut .a'), b = $('.s7-donut .b');
  a.setAttribute('stroke-dasharray', `${0.3 * C} ${C}`); a.setAttribute('transform', 'rotate(-90 150 150)');
  b.setAttribute('stroke-dasharray', `${0.7 * C} ${C}`); b.setAttribute('transform', `rotate(${-90 + 108} 150 150)`);
  master.fromTo(a, { strokeDashoffset: 0.3 * C }, { strokeDashoffset: 0, duration: 0.9, ease: 'power2.out' }, B.at(1, 'Ba mươi'));
  master.fromTo(b, { strokeDashoffset: 0.7 * C }, { strokeDashoffset: 0, duration: 1.4, ease: 'power2.out' }, B.at(1, 'bảy mươi'));
  const cb = $('.s7-donut .ctr b'), o = { v: 0 };
  master.fromTo(o, { v: 0 }, { v: 70, duration: 1.4, ease: 'power2.out', onUpdate: () => { cb.innerHTML = `${Math.round(o.v)}<small>%</small>`; } }, B.at(1, 'bảy mươi'));
  cue(B.at(1, 'Ba mươi'), 'tick'); cue(B.at(1, 'bảy mươi'), 'tick');
  const ts = $$('.s7-tiles span');
  [['văn bản', 0], ['báo cáo', 1], ['thủ tục', 2], ['cuộc họp', 3]].forEach(([p, i]) => {
    master.to(ts[i], { backgroundColor: 'rgba(182,243,106,.22)', borderColor: '#B6F36A', boxShadow: '0 0 30px rgba(52,231,160,.6)', duration: 0.3 }, B.at(1, p));
    cue(B.at(1, p), 'blip');
  });
  reveal('.s7-quote', B[2].t - 0.2, 0.7);
  words('.s7-quote > b', B[2].t, { stagger: 0.07 });
  up('.s7-quote .pair span, .s7-quote .pair .hs', B.at(2, 'Trí tuệ'), { stagger: 0.3, y: 20 });
  cue(B.at(2, 'Trí tuệ'), 'ding');
  return Math.max(t + 8, B.end + 1.2);
}

function S8(t) { // phần 1: AI an toàn, câu lệnh, trợ lý AI
  bg(t, { net: 0.45 }, 0.6);
  const B = voice('s8', t, { lead: 0.6 });
  head(8, t);
  const cols = $$('#s8 .col');
  master.fromTo(cols, { autoAlpha: 0, y: 40 }, { autoAlpha: 0.35, y: 0, duration: 0.6, stagger: 0.12 }, t + 0.5);
  const act = (i, at) => { master.to(cols[i], { autoAlpha: 1, duration: 0.3 }, at); lit(cols[i], at); if (i) master.set(cols[i - 1], { attr: { class: `col k${i} frame` } }, at); };
  // 1 · an toàn
  act(0, B[0].t);
  const dd = $$('.safe .dd');
  master.fromTo(dd, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.4, stagger: 0.15 }, B[0].t + 0.3);
  master.fromTo('.safe .cl', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.4 }, B[0].t + 0.5);
  const tb = B.at(0, 'Không đưa');
  master.to(dd, { x: 150, duration: 0.6, ease: 'power2.in', stagger: 0.1 }, tb - 0.3);
  master.fromTo('.safe .sh', { scale: 0, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.35, ease: 'back.out(3)' }, tb + 0.2);
  master.to(dd, { x: 0, duration: 0.5, ease: 'back.out(2)', stagger: 0.1 }, tb + 0.35);
  cue(tb + 0.2, 'lock');
  up('#s8 .col.k1 .ok', B.at(0, 'kiểm chứng'), { y: 20 }); cue(B.at(0, 'kiểm chứng'), 'ding');
  // 2 · cấu trúc câu lệnh
  act(1, B[1].t - 0.2);
  const pr = $$('#s8 .pr');
  ['vai trò', 'căn cứ', 'yêu cầu', 'thể thức'].forEach((p, i) => {
    const at = B.at(1, p) - 0.1;
    master.fromTo(pr[i], { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: 0.45, ease: 'back.out(1.6)' }, at);
    cue(at, 'click');
  });
  pop('#s8 .go', B[1].t + B[1].d + 0.1, { from: 0.8 });
  // 3 · trợ lý AI nghiệp vụ
  act(2, B[2].t - 0.2);
  pop($$('#s8 .files span'), B[2].t, { stagger: 0.15 });
  up('#s8 .q', B[2].t + 0.6, { y: 20 }); cue(B[2].t + 0.6, 'pop');
  up('#s8 .a', B[2].t + 1.2, { y: 20 });
  stream('#s8 .ans', B[2].t + 1.3, 3.6);
  pop($$('#s8 .cite'), B[2].t + 4.9, { stagger: 0.2 });
  up('#s8 .tools', B[2].t + 5.0, { y: 10 });
  return Math.max(t + 9, B.end + 2.2);
}

function S9(t) { // phần 2: văn bản đi – đến
  const B = voice('s9', t, { lead: 0.6 });
  head(9, t);
  const dom = $$('.s9-dom span');
  up(dom, t + 0.6, { stagger: 0.1, y: 16 });
  lit(dom[0], B[0].t + 0.6); cue(B[0].t + 0.6, 'blip');
  // văn bản đi
  master.fromTo('.s9-note', { autoAlpha: 0, y: 40, rotation: -10 }, { autoAlpha: 1, y: 0, rotation: -3, duration: 0.6 }, B[1].t - 0.1);
  pop('.s9-ai.a1', B.at(1, 'dự thảo') - 0.1, { from: 0.2 });
  master.to('.s9-ai.a1', { rotation: 360, duration: 2, ease: 'none' }, B.at(1, 'dự thảo'));
  master.fromTo('.s9-doc', { autoAlpha: 0, x: -60, scale: 0.9 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.6 }, B.at(1, 'dự thảo') + 0.2);
  master.fromTo('.s9-doc .body i', { scaleX: 0 }, { scaleX: 1, duration: 0.3, stagger: 0.18, ease: 'power2.out' }, B.at(1, 'dự thảo') + 0.6);
  cue(B.at(1, 'dự thảo') + 0.6, 'type');
  master.fromTo('.s9-doc .ok', { autoAlpha: 0, y: 10 }, { autoAlpha: 1, y: 0, duration: 0.4 }, B.at(1, 'thể thức'));
  cue(B.at(1, 'thể thức'), 'ding');
  // văn bản đến
  master.fromTo('.s9-in > i', { autoAlpha: 0, y: -30 }, { autoAlpha: 1, y: 0, duration: 0.35, stagger: 0.08 }, B[2].t - 0.2);
  up('.s9-in small', B[2].t, { y: 10 });
  master.fromTo('.s9-in .scan', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, B[2].t + 0.4);
  master.fromTo('.s9-in .scan', { y: 0 }, { y: 280, duration: 0.9, ease: 'sine.inOut', repeat: 1, yoyo: true }, B[2].t + 0.4);
  master.to('.s9-in .scan', { autoAlpha: 0, duration: 0.2 }, B[2].t + 2.2);
  cue(B[2].t + 0.4, 'scan');
  pop('.s9-ai.a2', B[2].t + 1.0, { from: 0.2 });
  master.fromTo('.s9-sum', { autoAlpha: 0, x: 60 }, { autoAlpha: 1, x: 0, duration: 0.6 }, B.at(2, 'phiếu'));
  const rows = $$('.s9-sum .r');
  master.fromTo(rows, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.25 }, B.at(2, 'việc cần làm'));
  cue(B.at(2, 'việc cần làm'), 'tick'); cue(B.at(2, 'đơn vị chủ trì'), 'tick'); cue(B.at(2, 'thời hạn'), 'tick');
  up('.s9-sum .sg', B[2].t + B[2].d + 0.1, { y: 16 });
  return Math.max(t + 9, B.end + 1.6);
}

function S10(t) { // phần 2: báo cáo tổng hợp & số liệu
  const B = voice('s10', t, { lead: 0.6 });
  head(10, t);
  const src = $$('.s10-src span');
  up(src, B[0].t, { stagger: 0.12, x: -30, y: 0 });
  const F = $('.s10-flow'), paths = [];
  src.forEach((_, i) => {
    const y = 360 + i * 98, d = `M370 ${y} C 420 ${y}, 420 600, 470 600`;
    paths.push(svg('path', { d }, F)); paths.push(svg('path', { d, class: 'e' }, F));
  });
  master.set(paths.filter((_, i) => i % 2 === 0), { autoAlpha: 0 }, 0);
  master.set(paths.filter((_, i) => i % 2 === 0), { autoAlpha: 1 }, B[0].t + 0.5);
  draw(paths.filter((_, i) => i % 2 === 0), B[0].t + 0.5, 0.6);
  flow(paths.filter((_, i) => i % 2 === 1), B[0].t + 1.0, 160);
  reveal('.s10-dash', B[0].t + 0.7, 0.8);
  // biểu đồ (dữ liệu minh hoạ)
  const C = $('.s10-dash .chart'), now = [62, 78, 55, 38, 84, 70], old = [58, 66, 52, 60, 71, 68], plan = [65, 72, 58, 62, 80, 72], k = 3.4, base = 340;
  svg('line', { x1: 40, y1: base, x2: 740, y2: base, class: 'ax' }, C);
  for (let i = 1; i <= 4; i++) svg('line', { x1: 40, y1: base - i * 70, x2: 740, y2: base - i * 70, class: 'ax', 'stroke-dasharray': '2 6' }, C);
  const bars = [];
  now.forEach((v, i) => {
    const x = 70 + i * 112;
    const bo = svg('rect', { x, y: base - old[i] * k, width: 36, height: old[i] * k, class: 'bo' }, C);
    const bn = svg('rect', { x: x + 40, y: base - v * k, width: 36, height: v * k, class: 'bn' }, C);
    svg('text', { x: x + 14, y: base + 24 }, C).textContent = `CT${i + 1}`;
    bars.push(bo, bn);
  });
  master.fromTo(bars, { scaleY: 0, transformOrigin: '50% 100%' }, { scaleY: 1, duration: 0.5, stagger: 0.06, ease: 'power2.out' }, B[0].t + 1.4);
  const pl = svg('path', { d: plan.map((v, i) => `${i ? 'L' : 'M'}${70 + i * 112 + 38} ${base - v * k}`).join(' '), class: 'pl' }, C);
  master.set(pl, { autoAlpha: 0 }, 0);
  master.set(pl, { autoAlpha: 1 }, B.at(1, 'kế hoạch'));
  draw(pl, B.at(1, 'kế hoạch'), 0.9);
  const an = svg('rect', { x: 70 + 3 * 112 - 10, y: base - 72 * k, width: 96, height: 72 * k + 10, rx: 10, class: 'anom' }, C);
  master.to(an, { opacity: 1, duration: 0.2 }, B.at(1, 'bất thường'));
  master.fromTo(an, { strokeWidth: 3 }, { strokeWidth: 7, duration: 0.35, yoyo: true, repeat: 3 }, B.at(1, 'bất thường'));
  cue(B.at(1, 'bất thường'), 'alarm');
  master.fromTo('.s10-dash .ins', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.5 }, B[1].t - 0.2);
  stream('.s10-dash .ins .t1', B.at(1, 'so sánh'), 1.0);
  stream('.s10-dash .ins .t2', B.at(1, 'kế hoạch'), 1.0);
  stream('.s10-dash .ins .t3', B.at(1, 'bất thường'), 1.1);
  up('.s10-law', B.end + 0.1, { y: 10 });
  return Math.max(t + 8, B.end + 1.6);
}

function S11(t) { // phần 2: TTHC, cuộc họp, tuyên truyền
  bg(t, { net: 0.45 }, 0.6);
  const B = voice('s11', t, { lead: 0.6 });
  head(11, t);
  const cols = $$('#s11 .col');
  master.fromTo(cols, { autoAlpha: 0, y: 40 }, { autoAlpha: 0.35, y: 0, duration: 0.6, stagger: 0.12 }, t + 0.5);
  const act = (i, at) => { master.to(cols[i], { autoAlpha: 1, duration: 0.3 }, at); lit(cols[i], at); if (i) master.set(cols[i - 1], { attr: { class: `col k${i} frame` } }, at); };
  act(0, B[0].t);
  up('#s11 .msg.u', B[0].t + 0.4, { y: 20 }); cue(B[0].t + 0.4, 'pop');
  up('#s11 .msg.b', B[0].t + 1.0, { y: 20 });
  stream('#s11 .msg.b .ans', B[0].t + 1.1, 3.4);
  up('#s11 .col.k1 .lw', B[0].t + 2.0, { y: 10 });
  act(1, B[1].t - 0.2);
  const wv = $('#s11 .wave'), bars = [];
  for (let i = 0; i < 40; i++) { const b = document.createElement('i'); wv.appendChild(b); bars.push(b); }
  const w0 = B[1].t;
  UPD.push((tt) => { const on = tt > w0 && tt < w0 + 2.6; bars.forEach((b, i) => { const h = on ? 8 + 56 * Math.abs(Math.sin(tt * 9 + i * 0.7) * Math.sin(tt * 3.1 + i * 0.23)) : 6; b.style.height = `${h}px`; }); });
  const rows = $$('#s11 .col.k2 .r');
  master.fromTo(rows, { autoAlpha: 0, x: 20 }, { autoAlpha: 1, x: 0, duration: 0.35, stagger: 0.3 }, B.at(1, 'thông báo kết luận'));
  ['việc gì', 'ai làm', 'khi nào'].forEach((p) => cue(B.at(1, p), 'tick'));
  up('#s11 .col.k2 .lw', B[1].t + 1.0, { y: 10 });
  act(2, B[2].t - 0.2);
  master.fromTo('#s11 .news', { autoAlpha: 0, y: 30 }, { autoAlpha: 1, y: 0, duration: 0.5 }, B[2].t);
  pop($$('#s11 .info span'), B[2].t + 0.5, { stagger: 0.15 });
  up('#s11 .col.k3 .lw', B[2].t + 0.8, { y: 10 });
  cue(B[2].t + 0.5, 'pop');
  return Math.max(t + 8, B.end + 1.4);
}

function S12(t) { // sản phẩm đầu ra
  const B = voice('s12', t, { lead: 0.6 });
  head(12, t);
  const pd = $$('.s12-grid .pd');
  master.fromTo(pd, { autoAlpha: 0, y: 40, scale: 0.95 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.5, stagger: 0.1 }, B[0].t + 0.2);
  pd.forEach((_, i) => i % 2 === 0 && cue(B[0].t + 0.2 + i * 0.1, 'tick'));
  ['trợ lý', 'thư viện', 'quy trình', 'nguyên tắc'].forEach((p) => {
    const e = $(`.s12-grid .pd[data-k="${p}"]`), at = B.at(1, p);
    lit(e, at, 'hl'); master.fromTo(e, { scale: 1 }, { scale: 1.05, duration: 0.25, yoyo: true, repeat: 1 }, at); cue(at, 'blip');
  });
  master.fromTo('.s12-grid .pd.gold', { boxShadow: '0 0 0px rgba(255,201,77,0)' }, { boxShadow: '0 0 60px rgba(255,201,77,.8)', duration: 0.5, yoyo: true, repeat: 3 }, B.end + 0.1);
  cue(B.end + 0.1, 'ding');
  return Math.max(t + 7, B.end + 1.6);
}

function S13(t) { // căn cứ pháp lý
  cue(t, 'sec_soft');
  bg(t, { net: 0.6 }, 0.6);
  const B = voice('s13', t, { lead: 0.6 });
  head(13, t);
  const ls = $$('.s13-list .lw');
  master.fromTo(ls, { autoAlpha: 0, x: -40 }, { autoAlpha: 1, x: 0, duration: 0.45, stagger: 0.12 }, t + 0.6);
  ['thể thức', 'báo cáo', 'một cửa', 'dữ liệu', 'Trí tuệ'].forEach((p) => {
    const e = $(`.s13-list .lw[data-k="${p}"]`), at = B.at(0, p);
    lit(e, at, 'hl'); cue(at, 'tick');
  });
  return Math.max(t + 7, B.end + 1.2);
}

function S14(t) { // kết: liên hệ
  cue(t + 0.3, 'sec_end');
  bg(t, { net: 0.85, floor: 0.5 }, 0.8);
  master.to('#bug', { autoAlpha: 0, duration: 0.3 }, t);
  const B = voice('s14', t, { lead: 0.8 });
  const orb = makeOrb('#orb3', '#s14');
  master.fromTo(orb, { a: 0, k: 0.5 }, { a: 0.9, k: 1, duration: 1.2 }, t);
  pop('.s14-logo', t + 0.2, { from: 0.3, ease: 'back.out(2)' });
  sparks(210, 190, t + 0.4, { r0: 90, r1: 230, n: 30 });
  kicker('.s14-k', t + 0.5);
  words('.s14-h', B[0].t, { stagger: 0.06 });
  up('.s14-ct > div', B[1].t, { stagger: 0.15 });
  up('.s14-offs span', B[1].t + 0.6, { stagger: 0.1, y: 16 });
  master.fromTo('.s14-qr', { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, B[0].t + 0.6);
  master.fromTo('.s14-qr .ln', { y: 0 }, { y: 290, duration: 1.4, ease: 'sine.inOut', repeat: 3, yoyo: true }, B[0].t + 1.0);
  cue(B[0].t + 1.0, 'scan');
  pop('.s14-cta', B.at(1, 'khảo sát'), { from: 0.8 }); cue(B.at(1, 'khảo sát'), 'pop');
  master.to('.s14-cta', { scale: 1.04, duration: 0.45, yoyo: true, repeat: 7, ease: 'sine.inOut' }, B.at(1, 'khảo sát') + 0.7);
  const endT = B.end + 4.2;
  master.to('#stage', { opacity: 0, duration: 1.2, ease: 'none' }, endT - 1.2);
  return endT;
}

/* ================= GHÉP CẢNH ================= */
function build() {
  buildNet(); buildBlocks();
  let t, x;
  t = S1(0);
  x = iris(t, '#s1', '#s2', 960, 470); t = S2(x);
  x = scanWipe(t, '#s2', '#s3'); t = S3(x);
  x = glitchCut(t, '#s3', '#s4'); t = S4(x);
  x = blockWipe(t, '#s4', '#s5'); t = S5(x);
  x = scanWipe(t, '#s5', '#s6'); t = S6(x);
  x = iris(t, '#s6', '#s7', 530, 435); t = S7(x);
  x = blockWipe(t, '#s7', '#s8'); t = S8(x);
  x = scanWipe(t, '#s8', '#s9'); t = S9(x);
  x = glitchCut(t, '#s9', '#s10'); t = S10(x);
  x = scanWipe(t, '#s10', '#s11'); t = S11(x);
  x = blockWipe(t, '#s11', '#s12'); t = S12(x);
  x = glitchCut(t, '#s12', '#s13'); t = S13(x);
  x = iris(t, '#s13', '#s14', 960, 540); t = S14(x);
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
