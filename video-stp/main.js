/* Viện STP – Hồ sơ năng lực lĩnh vực đào tạo (có thuyết minh).
   Cấu trúc: mở đầu → thương hiệu → về Viện → TRANG 4 TRỌNG TÂM ĐÀO TẠO; mỗi trọng tâm được phóng to từ ô của nó,
   giới thiệu chi tiết, rồi thu lại về trang trọng tâm (ô đó được đánh dấu "đã giới thiệu") trước khi sang phần kế tiếp.
   Thời lượng cảnh lấy theo độ dài lời đọc (vo.json do tts.py sinh ra). Toàn bộ chạy trên một GSAP timeline dừng sẵn,
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
  B.at = (i, p) => { const s = B[i].say.indexOf(p); if (s < 0) console.error(`thiếu cụm "${p}" trong ${sc}[${i}]`); return B[i].t + B[i].d * (s < 0 ? 0 : s / B[i].say.length); };
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
  UPD.push((t) => { $('#floor').style.opacity = BG.floor; $('#floor .grid').style.backgroundPosition = `0px ${(t * 45) % 90}px`; });
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

/* ---------- tiện ích riêng ---------- */
let VEND = 0; // thời điểm kết thúc câu đọc gần nhất – câu sau không bao giờ chồng lên câu trước
function say(sc, t, o = {}) {
  const want = t + (o.lead ?? 0.5), lead = Math.max(want, VEND + (o.minGap ?? 0.45)) - t;
  const B = voice(sc, t, { ...o, lead });
  VEND = B.end;
  return B;
}
function kb(sel, t0, t1, o = {}) { // Ken Burns: ảnh trôi/zoom chậm suốt cảnh
  master.fromTo(sel, { scale: o.s0 ?? 1.14, x: o.x0 ?? 0, y: o.y0 ?? 0 }, { scale: o.s1 ?? 1.0, x: o.x1 ?? 0, y: o.y1 ?? 0, duration: Math.max(0.1, t1 - t0), ease: 'none' }, t0);
}
function flashOn(e, t0, t1, cls = 'on') { // bật class trong khoảng [t0, t1)
  els(e).forEach((x) => { const base = x.getAttribute('class'); master.set(x, { attr: { class: `${base} ${cls}` } }, t0); master.set(x, { attr: { class: base } }, t1); });
}
function head2(k, h, at) { kicker(k, at + 0.05); words(h, at + 0.12); }
const ACC = ['', '#B6F36A', '#FFC94D', '#5EEAD4', '#7DD3FC'];

// gạt chéo (dải màu quét ngang qua màn hình)
function swipe(at, prev, next, color = LIME, D = 0.9) {
  master.set('#swipe', { visibility: 'visible' }, at);
  master.set('#swipe i:nth-child(2)', { background: color }, at);
  master.fromTo('#swipe', { x: -2850 }, { x: -340, duration: D / 2, ease: 'power2.in' }, at);
  swap(prev, next, at + D / 2);
  master.to('#swipe', { x: 2300, duration: D / 2, ease: 'power2.out' }, at + D / 2);
  master.set('#swipe', { visibility: 'hidden' }, at + D);
  cue(at, 'whoosh'); cue(at + D / 2, 'swish');
  return at + D / 2;
}

/* ---------- cổng: phóng to từ ô trọng tâm vào phần chi tiết và thu lại ---------- */
const TILE = (k) => ({ x: 120 + (k - 1) * 428, y: 290, w: 396, h: 610 });
const PORTALS = [];
const pbg = (sc) => { const e = $(sc); let b = $(':scope > .pbg', e); if (!b) { b = div('pbg'); e.insertBefore(b, e.firstChild); } return b; };
function portalIn(at, k, next, D = 1.1) {
  const r = TILE(k), ox = r.x + r.w / 2, oy = r.y + r.h / 2;
  show(next, at); hide('#hub', at + D);
  PORTALS.push({ at, D, el: $(next), r, dir: 1, on: false, col: ACC[k] });
  const pb = pbg(next); // nền đặc trong lúc phóng to, sau đó mờ dần để lộ lưới nơ-ron
  master.set(pb, { opacity: 1 }, at);
  master.to(pb, { opacity: 0, duration: 0.8, ease: 'power1.inOut' }, at + D);
  master.fromTo('#hub', { scale: 1, filter: 'brightness(1) blur(0px)' }, { scale: 1.16, filter: 'brightness(0.45) blur(3px)', duration: D, ease: 'power2.in', transformOrigin: `${ox}px ${oy}px`, immediateRender: false }, at);
  sparks(ox, r.y + 40, at, { r0: 40, r1: 260, n: 40, dur: 0.6 });
  cue(at, 'whoosh'); cue(at + 0.05, 'swish');
  return at + 0.15; // nội dung phần mới bắt đầu hiện ngay trong khung đang mở rộng
}
function portalOut(at, k, prev, D = 1.0) {
  const r = TILE(k), ox = r.x + r.w / 2, oy = r.y + r.h / 2;
  show('#hub', at); hide(prev, at + D);
  PORTALS.push({ at, D, el: $(prev), r, dir: -1, on: false, col: ACC[k] });
  master.fromTo(pbg(prev), { opacity: 0 }, { opacity: 1, duration: 0.35, immediateRender: false }, at - 0.35);
  master.fromTo('#hub', { scale: 1.16, filter: 'brightness(0.45) blur(3px)' }, { scale: 1, filter: 'brightness(1) blur(0px)', duration: D, ease: 'power2.out', transformOrigin: `${ox}px ${oy}px`, immediateRender: false }, at);
  master.set('#hub', { clearProps: 'filter' }, at + D + 0.02);
  cue(at, 'whoosh');
  return at + D;
}
const portalRect = (p, t) => {
  let k = inOut2((t - p.at) / p.D); if (p.dir < 0) k = 1 - k;
  return { x: p.r.x * (1 - k), y: p.r.y * (1 - k), w: p.r.w + (1920 - p.r.w) * k, h: p.r.h + (1080 - p.r.h) * k, rad: 22 * (1 - k), k };
};
UPD.push((t) => {
  PORTALS.forEach((p) => { if ((t < p.at || t > p.at + p.D) && p.on) { p.el.style.clipPath = ''; p.on = false; } });
  PORTALS.forEach((p) => {
    if (t < p.at || t > p.at + p.D) return;
    const q = portalRect(p, t);
    p.el.style.clipPath = `inset(${q.y.toFixed(1)}px ${(1920 - q.x - q.w).toFixed(1)}px ${(1080 - q.y - q.h).toFixed(1)}px ${q.x.toFixed(1)}px round ${q.rad.toFixed(1)}px)`;
    p.on = true;
  });
});
function portalFX() {
  PORTALS.forEach((p) => FX.push({ t0: p.at, t1: p.at + p.D, fn: (g, t) => {
    const q = portalRect(p, t), a = Math.sin(Math.PI * clamp01((t - p.at) / p.D));
    g.save(); g.lineWidth = 5; g.strokeStyle = p.col; g.globalAlpha = 0.9 * a; g.shadowColor = p.col; g.shadowBlur = 30;
    g.beginPath(); g.roundRect(q.x, q.y, q.w, q.h, q.rad); g.stroke(); g.restore();
  } }));
}

/* ---------- trang trọng tâm (hub): trạng thái từng ô ---------- */
const TS = {
  idle: { ring: 0, now: 0, done: 0, dim: 0.5, sc: 1 },
  act: { ring: 1, now: 1, done: 0, dim: 0, sc: 1.035 },
  done: { ring: 0, now: 0, done: 1, dim: 0.45, sc: 1 },
  fin: { ring: 0.55, now: 0, done: 1, dim: 0, sc: 1 },
};
function tile(k, st, at, d = 0.5) {
  const T = $(`.tile.t${k}`), s = TS[st];
  master.to(T, { scale: s.sc, duration: d, ease: 'power2.out' }, at);
  master.to($('.ring', T), { opacity: s.ring, duration: d }, at);
  master.to($('.st.now', T), { opacity: s.now, y: s.now ? 0 : 8, duration: d * 0.8 }, at);
  master.to($('.dim', T), { opacity: s.dim, duration: d }, at);
  if (st === 'done') {
    master.fromTo($('.st.done', T), { opacity: 0, scale: 0.6 }, { opacity: 1, scale: 1, duration: 0.45, ease: 'back.out(2.4)' }, at);
    master.fromTo($('.ok', T), { opacity: 0, scale: 0.2, rotation: -90 }, { opacity: 1, scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.2)' }, at);
    master.to($('.icn', T), { opacity: 0, scale: 0.5, duration: 0.25 }, at);
    cue(at, 'ding');
  }
}
const RAIL_L = 1284;
function railTo(k, at, done) { // vạch tiến độ dưới các ô
  master.to('.rail .fl', { strokeDashoffset: RAIL_L - (k - 1) * 428, duration: 0.8, ease: 'power2.inOut' }, at);
  const nd = $$('.rail .nd')[k - 1];
  master.to(nd, { attr: { fill: ACC[k], r: 14 }, stroke: ACC[k], duration: 0.4 }, at + 0.6);
  if (done) done.forEach((j) => master.to($$('.rail .nd')[j - 1], { attr: { r: 11 }, duration: 0.3 }, at + 0.6));
}
function chap(k, at) { // nhãn "TRỌNG TÂM k/4" góc trên
  master.set('#chap', { visibility: 'visible' }, at);
  master.fromTo('#chap', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.5 }, at + 0.2);
  $$('#chap .seg i').forEach((s, j) => master.set(s, { background: j + 1 < k ? 'rgba(182,243,106,.75)' : j + 1 === k ? ACC[k] : 'rgba(156,199,182,.3)', boxShadow: j + 1 === k ? `0 0 12px ${ACC[k]}` : 'none' }, at));
  $$('#chap .nm').forEach((n, j) => master.set(n, { display: j + 1 === k ? 'inline' : 'none' }, at));
}

/* ================= CẢNH ================= */
function S1(t) { // mở đầu: bức tường ảnh đào tạo thực tế
  show('#s1', 0);
  const B = say('s1', t, { lead: 1.6 });
  const plane = $('.s1-plane'), R = rng(9);
  const P = ['cust/c1', 'ph/g3', 'cust/c6', 'ph/exam3', 'ph/hoc_vien', 'cust/c4', 'ph/g5', 'cust/c2', 'ph/room1', 'ph/atld_hero', 'cust/c8', 'ph/exam2', 'ph/students', 'cust/c3', 'ph/g1', 'ph/exam4', 'cust/c5', 'ph/g4', 'cust/c7', 'ph/room3', 'ph/g2', 'ph/office_work', 'ph/exam1', 'ph/g6'];
  let n = 0;
  for (let r = 0; r < 5; r++) for (let c = 0; c < 6; c++) {
    const d = div('pt', plane, `<img src="assets/${P[n % P.length]}.jpg" alt="">`);
    d.style.left = `${c * 470 + (r % 2) * 120}px`; d.style.top = `${r * 330}px`;
    master.fromTo(d, { z: 500 + R() * 400, autoAlpha: 0 }, { z: 0, autoAlpha: 1, duration: 1.4, ease: 'power3.out' }, 0.1 + R() * 1.4);
    n++;
  }
  [0.2, 0.7, 1.2].forEach((d) => cue(d, 'swish'));
  const end = Math.max(t + 9, B.end + 0.9);
  master.fromTo(plane, { x: 0, y: 0 }, { x: 160, y: -300, duration: end + 1, ease: 'none' }, 0);
  master.fromTo('.s1-shade', { opacity: 0.4 }, { opacity: 1, duration: 1.2, ease: 'power2.inOut' }, B[0].t - 0.6);
  words('.s1-a', B[0].t, { stagger: 0.07 });
  words('.s1-b', B.at(0, 'chìa khóa'), { stagger: 0.05 });
  const ch = $$('.s1-c span');
  pop(ch[0], B.at(1, 'hiệu quả'), { from: 0.5 }); cue(B.at(1, 'hiệu quả'), 'pop');
  pop(ch[1], B.at(1, 'năng lực'), { from: 0.5 }); cue(B.at(1, 'năng lực'), 'pop');
  return end;
}

function S2(t) { // thương hiệu
  const B = say('s2', t, { lead: 0.9 });
  cue(t + 0.45, 'downbeat'); cue(t + 0.45, 'sec_groove');
  const orb = makeOrb('#orb2', '#s2');
  master.fromTo(orb, { a: 0, k: 0.5 }, { a: 1, k: 1, duration: 1.2 }, t);
  pop('.s2-logo', t + 0.3, { from: 0.3, ease: 'back.out(2)' });
  sparks(220, 210, t + 0.45, { r0: 100, r1: 240, n: 30 });
  kicker('.s2-k', t + 0.6);
  words('.s2-h', t + 0.8);
  master.fromTo('.s2-big', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, t + 1.0);
  scramble('.s2-big', t + 1.0, 1.1);
  glitch('.s2-big', t + 2.2, 0.4, 10);
  up('.s2-en', t + 1.8, { y: 16 });
  up('.s2-tag', t + 2.2, { y: 20 });
  const chips = $$('.s2-chips span'), n = chips.length, cx = 1440, cy = 530;
  master.fromTo(chips, { autoAlpha: 0, scale: 0.4 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.18, ease: 'back.out(2)' }, B.at(0, 'đối tác'));
  chips.forEach((_, i) => cue(B.at(0, 'đối tác') + i * 0.18, 'pop'));
  UPD.push((tt) => {
    chips.forEach((c, i) => {
      const a = (i / n) * 6.283 + tt * 0.22, z = Math.sin(a);
      c.style.left = `${cx + Math.cos(a) * 330 - c.offsetWidth / 2}px`; c.style.top = `${cy + z * 210 - 30}px`;
      c.style.zIndex = z > 0 ? 3 : 1; c.style.filter = `brightness(${0.7 + 0.3 * (z + 1) / 2})`;
    });
  });
  return Math.max(t + 8, B.end + 1.0);
}

function S3(t) { // về Viện STP
  master.set('#bug', { visibility: 'visible' }, t);
  master.fromTo('#bug', { autoAlpha: 0, x: 30 }, { autoAlpha: 1, x: 0, duration: 0.6 }, t + 0.2);
  bg(t, { net: 0.5 }, 0.6);
  const B = say('s3', t, { lead: 0.6 });
  head2('.s3-k', '.s3-h', t);
  up('.s3-stats .st', t + 0.5, { stagger: 0.15 });
  counter('.s3-stats .v1', 1990, 2020, t + 0.5, 1.4);
  counter('.s3-stats .v3', 0, 3, t + 0.8, 1.2, (v) => String(Math.round(v)).padStart(2, '0'));
  lit($$('.s3-stats .st')[1], B.at(0, 'Liên hiệp'));
  reveal('.s3-legal', B.at(0, 'hoạt động') - 0.3, 0.8); cue(B.at(0, 'hoạt động') - 0.3, 'swish');
  master.fromTo('.s3-legal .docs img', { y: 40, rotation: 0, autoAlpha: 0 }, { y: 0, rotation: (i) => (i ? 4 : -5), autoAlpha: 1, duration: 0.7, stagger: 0.15 }, B.at(0, 'hoạt động'));
  master.fromTo('.s3-legal .stamp', { scale: 2.2, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.3, ease: 'power4.in' }, B.at(0, 'năm hai')); cue(B.at(0, 'năm hai') + 0.3, 'stamp');
  lit($$('.s3-stats .st')[0], B.at(0, 'năm hai'));
  master.fromTo('.s3-map .mp', { autoAlpha: 0, scale: 0.94 }, { autoAlpha: 0.9, scale: 1, duration: 1.2 }, t + 0.5);
  cue(B[1].t, 'sec_tension');
  lit($$('.s3-stats .st')[2], B[1].t);
  [['Hà Nội', 1], ['Nha Trang', 2], ['Thành phố', 3]].forEach(([p, i]) => {
    const at = B.at(1, p);
    pop(`.s3-map .p${i}`, at, { from: 0.2, ease: 'back.out(3)' }); cue(at, 'tick');
    up(`.s3-map .o${i}`, at + 0.1, { x: 30, y: 0 });
  });
  return Math.max(t + 8, B.end + 1.1);
}

function hubFirst(t) { // lần đầu: 4 ô trọng tâm lần lượt xuất hiện
  bg(t, { net: 0.7 }, 0.6);
  const B = say('h1', t, { lead: 0.6 });
  head2('.hub-k', '.hub-h', t);
  // khung chờ cho 4 ô
  const G = [1, 2, 3, 4].map((k) => { const r = TILE(k), g = div('ghost', $('#hub')); Object.assign(g.style, { left: `${r.x}px`, top: `${r.y}px`, width: `${r.w}px`, height: `${r.h}px`, border: '2px dashed rgba(52,231,160,.35)', borderRadius: '22px', position: 'absolute' }); return g; });
  master.fromTo(G, { autoAlpha: 0, scale: 0.9 }, { autoAlpha: 1, scale: 1, duration: 0.5, stagger: 0.1 }, B[0].t + 0.3);
  master.set('.rail .fl', { strokeDasharray: `${RAIL_L} ${RAIL_L}`, strokeDashoffset: RAIL_L }, 0);
  master.set($$('.rail .nd'), { attr: { fill: '#05301F' } }, 0);
  draw('.rail .bk', B[0].t + 0.2, 1.2);
  master.fromTo('.rail .nd', { scale: 0, transformOrigin: '50% 50%' }, { scale: 1, duration: 0.4, stagger: 0.15, ease: 'back.out(3)' }, B[0].t + 0.5);
  cue(B[1].t, 'sec_main');
  const keys = ['chứng chỉ', 'an toàn', 'đào tạo ứng dụng', 'tuyển sinh'];
  keys.forEach((p, i) => {
    const at = i === 0 ? B[1].t : B.at(1, p), T = $(`.tile.t${i + 1}`);
    master.fromTo(T, { autoAlpha: 0, rotationY: -70, y: 60, transformPerspective: 1400 }, { autoAlpha: 1, rotationY: 0, y: 0, duration: 0.8, ease: 'power3.out' }, at);
    master.fromTo($('.ph', T), { scale: 1.3 }, { scale: 1.08, duration: 2.4, ease: 'power2.out' }, at);
    master.to(G[i], { autoAlpha: 0, duration: 0.3 }, at + 0.4);
    cue(at, i === 0 ? 'hit' : 'pop');
  });
  master.set($$('.tile .dim'), { opacity: 0 }, 0);
  // trọng tâm thứ nhất được chọn
  const a = B[2].t;
  tile(1, 'act', a); [2, 3, 4].forEach((k) => tile(k, 'idle', a));
  railTo(1, a);
  sparks(TILE(1).x + 198, 300, a, { r0: 40, r1: 200, n: 30 }); cue(a, 'blip');
  return Math.max(B.end - 0.5, a + 1.6);
}

function hubVisit(t, k, sc) { // quay lại trang trọng tâm: đánh dấu xong phần trước, chọn phần kế tiếp
  tile(k - 1, 'done', t - 0.35);
  const B = say(sc, t, { lead: 0.35 });
  const a = Math.max(t + 0.25, B[0].t - 0.15);
  tile(k, 'act', a);
  for (let j = k + 1; j <= 4; j++) tile(j, 'idle', a);
  railTo(k, a);
  sparks(TILE(k).x + 198, 300, a, { r0: 40, r1: 200, n: 30 }); cue(a, 'blip');
  return Math.max(B.end - 0.2, a + 2.6);
}

function op(sc, t, o) { // khung mở đầu một trọng tâm (số lớn, tiêu đề, ảnh)
  const S = `#${sc}`;
  master.fromTo(`${S} .op-num`, { x: -80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 1.0 }, t + 0.25);
  kicker(`${S} .op-k`, t + 0.35);
  words(`${S} .op-h`, t + 0.45, { stagger: 0.06 });
  if ($(`${S} .op-p`)) up(`${S} .op-p`, t + 1.0, { y: 20 });
  if ($(`${S} .op-ph`)) master.fromTo(`${S} .op-ph`, { xPercent: 12, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 1.0, ease: 'power3.out' }, t);
}

function C1A(t) {
  chap(1, t);
  const B = say('c1a', t, { lead: 0.6 });
  op('c1a', t);
  const sk = $$('.c1-skill span');
  [['năng lực chuyên môn', 0], ['kỹ năng nghề', 1], ['quản lý', 2]].forEach(([p, i]) => { pop(sk[i], B.at(0, p), { from: 0.6 }); cue(B.at(0, p), 'pop'); });
  const ck = $$('.c1-ck p');
  [['hướng ứng dụng', 0], ['nhu cầu', 1], ['thị trường', 2]].forEach(([p, i]) => { up(ck[i], B.at(1, p) - 0.2, { x: -30, y: 0 }); cue(B.at(1, p), 'tick'); });
  const end = Math.max(t + 7, B.end + 0.9);
  kb('#c1a .op-ph img', t, end + 1, { s0: 1.18, s1: 1.04, x0: 30, x1: -20 });
  return end;
}

function C1B(t) {
  const B = say('c1b', t, { lead: 0.5 });
  head2('.c1b-k', '.c1b-h', t);
  up('.c1b-list .pg', t + 0.3, { x: -40, y: 0, stagger: 0.12 });
  const C = $$('.c1b-certs .ct');
  master.fromTo(C, { autoAlpha: 0, x: 300, rotationY: -40, rotation: 6 }, { autoAlpha: 1, x: 0, rotationY: -12, rotation: (i) => [-6, -1, 4][i], duration: 0.9, stagger: 0.15 }, t + 0.4);
  const PG = $$('.c1b-list .pg');
  const hl = (i, at, until) => {
    flashOn(PG[i === 2 ? 1 : i], at, until);
    master.to(C[i], { rotationY: 0, rotation: 0, scale: 1.06, zIndex: 5, duration: 0.5 }, at);
    master.to(C[i], { rotationY: -12, rotation: [-6, -1, 4][i], scale: 1, zIndex: i, duration: 0.5 }, until);
    cue(at, 'swish');
  };
  const a1 = B.at(0, 'đường thủy'), a2 = B.at(0, 'giám sát'), a3 = B.at(0, 'chỉ huy');
  hl(0, a1 - 0.2, a2 - 0.2); hl(1, a2 - 0.2, a3 - 0.2); hl(2, a3 - 0.2, B[1].t);
  const tg = $$('.c1b-tags span');
  [['song ngữ', 0], ['song ngữ', 1], ['số hiệu', 2]].forEach(([p, i]) => { pop(tg[i], B.at(1, p) + (i === 1 ? 0.35 : 0), { from: 0.6 }); cue(B.at(1, p), 'pop'); });
  master.to(C, { y: (i) => [-10, 0, 10][i], duration: 0.6, ease: 'power2.out' }, B[1].t);
  return Math.max(t + 7, B.end + 0.8);
}

function C2A(t) {
  chap(2, t);
  const B = say('c2a', t, { lead: 0.9 });
  op('c2a', t);
  up('.c2a-law', B.at(0, 'tuân thủ') - 0.3, { x: -30, y: 0 });
  const pr = $$('.c2a-pro div');
  [['con người', 0], ['tài sản', 1], ['uy tín', 2]].forEach(([p, i]) => { pop(pr[i], B.at(0, p), { from: 0.5 }); cue(B.at(0, p), 'pop'); });
  const end = Math.max(t + 6.5, B.end + 0.9);
  kb('#c2a .op-ph img', t, end + 1, { s0: 1.2, s1: 1.05, y0: 20, y1: -10 });
  return end;
}

function C2B(t) {
  const B = say('c2b', t, { lead: 0.5 });
  head2('.c2b-k', '.c2b-h', t);
  master.fromTo('.p-stp', { x: -120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, B[0].t - 0.2);
  up('.p-stp p', B.at(0, 'xây dựng'), { x: -20, y: 0, stagger: 0.25 });
  const ad = B.at(0, 'Công ty');
  master.fromTo('.p-dako', { x: 120, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, ad - 0.2);
  up('.p-dako p', B.at(0, 'triển khai'), { x: 20, y: 0, stagger: 0.3 });
  master.set('.c2b-link .ln', { autoAlpha: 0 }, 0);
  master.set('.c2b-link .ln', { autoAlpha: 1 }, ad);
  draw('.c2b-link .ln', ad, 0.8);
  flow('.c2b-link .en', ad + 0.6, 120);
  pop('.c2b-hs', ad + 0.5, { from: 0.2 }); cue(ad + 0.5, 'hit');
  lit('.p-stp', B[0].t + 0.4); lit('.p-dako', ad + 0.4);
  reveal('.c2b-get', B[1].t - 0.2, 0.8);
  const gs = $$('.c2b-get span');
  [['toàn diện', 0], ['tuân thủ', 1], ['giảm rủi ro', 2], ['bền vững', 3]].forEach(([p, i]) => { up(gs[i], B.at(1, p) - 0.15, { y: 20 }); cue(B.at(1, p), 'tick'); });
  return Math.max(t + 8, B.end + 0.8);
}

function C2C(t) {
  const B = say('c2c', t, { lead: 0.5 });
  head2('.c2c-k', '.c2c-h', t);
  up('.c2c-law', t + 0.5, { y: 14 });
  const G = $$('.c2c-grid .gc');
  const ks = [[0, 'người quản lý'], [0, 'chuyên trách'], [0, 'nghiêm ngặt'], [1, 'người lao động'], [1, 'y tế'], [1, 'vệ sinh viên']];
  const at = ks.map(([b, p]) => B.at(b, p) - 0.25);
  G.forEach((g, i) => {
    master.fromTo(g, { autoAlpha: 0, y: 50, scale: 0.92 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.6)' }, at[i]);
    master.fromTo($('img', g), { scale: 1.25 }, { scale: 1.0, duration: 4, ease: 'power1.out' }, at[i]);
    flashOn(g, at[i], at[i + 1] ?? B.end); cue(at[i], 'pop');
  });
  return Math.max(t + 8, B.end + 0.9);
}

function C2D(t) {
  const B = say('c2d', t, { lead: 0.5 });
  kicker('.c2d-k', t + 0.05);
  words('.c2d-q', B[0].t - 0.1, { stagger: 0.035 });
  up('.c2d-old', t + 0.5, { y: 40 });
  up('.c2d-old .ico span', t + 0.9, { y: 20, stagger: 0.12 });
  up('.c2d-old p', B.at(0, 'kết thúc'), { x: -20, y: 0, stagger: 0.3 });
  const b = B[1].t;
  master.to('.c2d-old .strike', { scaleX: 1, duration: 0.35, ease: 'power3.in' }, b - 0.1); cue(b + 0.25, 'glitch');
  master.to('.c2d-old small, .c2d-old .ico, .c2d-old p', { filter: 'grayscale(1)', opacity: 0.45, duration: 0.5 }, b + 0.3);
  pop('.c2d-arr', b + 0.2, { from: 0.2 });
  master.fromTo('.c2d-new', { x: 80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, b + 0.3); cue(b + 0.3, 'whoosh');
  up('.c2d-new p', B.at(1, 'nền tảng số') - 0.2, { x: 24, y: 0, stagger: 0.42 });
  $$('.c2d-new p').forEach((_, i) => cue(B.at(1, 'nền tảng số') - 0.2 + i * 0.42, 'tick'));
  const al = B.at(1, 'cảnh báo');
  master.fromTo('.c2d-alert', { y: -40, autoAlpha: 0, scale: 0.9 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.5, ease: 'back.out(2)' }, al); cue(al, 'notif');
  master.to('.c2d-alert', { keyframes: [{ rotation: -3, duration: 0.08 }, { rotation: 3, duration: 0.08 }, { rotation: -2, duration: 0.08 }, { rotation: 0, duration: 0.08 }], ease: 'none' }, al + 0.5);
  return Math.max(t + 8, B.end + 0.9);
}

function C2E(t) {
  const B = say('c2e', t, { lead: 0.5 });
  head2('.c2e-k', '.c2e-h', t);
  master.fromTo('.b-back2', { autoAlpha: 0, y: 60 }, { autoAlpha: 0.85, y: 0, duration: 0.8 }, t + 0.3);
  master.fromTo('.b-back1', { autoAlpha: 0, y: 80 }, { autoAlpha: 0.85, y: 0, duration: 0.8 }, t + 0.45);
  master.fromTo('.b-dash', { autoAlpha: 0, y: 120, rotationX: 18, transformPerspective: 1600 }, { autoAlpha: 1, y: 0, rotationX: 0, duration: 1.0 }, t + 0.5); cue(t + 0.5, 'whoosh');
  master.set('.b-back1,.b-back2', { autoAlpha: 0 }, 0);
  up('.c2e-kpi .kp', B.at(0, 'chỉ số'), { x: 40, y: 0, stagger: 0.3 });
  $$('.c2e-kpi .kp').forEach((_, i) => cue(B.at(0, 'chỉ số') + i * 0.3, 'tick'));
  const b = B[1].t - 0.35;
  master.to('.c2e-kpi .kp', { x: 60, autoAlpha: 0, duration: 0.35, stagger: 0.05, ease: 'power2.in' }, b);
  master.to('.b-dash', { x: -40, y: 40, scale: 0.9, autoAlpha: 0.35, duration: 0.6, ease: 'power2.inOut' }, b);
  master.to('.b-back1,.b-back2', { autoAlpha: 0.25, duration: 0.5 }, b);
  master.fromTo('.b-look', { autoAlpha: 0, y: 160 }, { autoAlpha: 1, y: 0, duration: 0.8 }, b + 0.1); cue(b + 0.1, 'whoosh');
  master.set('.b-look', { autoAlpha: 0 }, 0);
  master.fromTo('.b-look .hl', { opacity: 0, scale: 1.3 }, { opacity: 1, scale: 1, duration: 0.5 }, B.at(1, 'tra cứu') + 0.2); cue(B.at(1, 'tra cứu') + 0.2, 'blip');
  master.fromTo('.c2e-24 .big', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, B.at(1, 'hai mươi'));
  scramble('.c2e-24 .big', B.at(1, 'hai mươi'), 0.7);
  up('.c2e-24 p', B.at(1, 'hai mươi') + 0.3, { y: 16 });
  pop('.c2e-24 span', B.at(1, 'mã xác thực'), { from: 0.6 }); cue(B.at(1, 'mã xác thực'), 'lock');
  return Math.max(t + 7, B.end + 0.9);
}

function C2F(t) {
  const B = say('c2f', t, { lead: 0.6 });
  head2('.c2f-k', '.c2f-h', t);
  const C = $$('.c2f-grid .cu'), R = rng(3);
  C.forEach((c, i) => {
    const at = t + 0.4 + (i % 4) * 0.12 + Math.floor(i / 4) * 0.25;
    master.fromTo(c, { autoAlpha: 0, scale: 0.85, rotationX: 30, transformPerspective: 1200 }, { autoAlpha: 1, scale: 1, rotationX: 0, duration: 0.7 }, at);
    master.fromTo($('img', c), { scale: 1.2 }, { scale: 1.02, duration: 5, ease: 'none' }, at);
    if (i % 2 === 0) cue(at, 'pop');
  });
  return Math.max(t + 5.5, B.end + 1.2);
}

function C3A(t) {
  chap(3, t);
  const B = say('c3a', t, { lead: 0.7 });
  const orb = makeOrb('#orb3', '#c3a');
  master.fromTo(orb, { a: 0, k: 0.4 }, { a: 1, k: 1, duration: 1.4 }, t);
  op('c3a', t);
  const sc = B.at(0, 'khảo sát');
  pop('.c3a-scan', sc, { from: 0.5 }); cue(sc, 'scan');
  master.to(orb, { spin: 2.4, duration: 1.2, yoyo: true, repeat: 1, ease: 'sine.inOut' }, sc);
  up('.c3a-pill div', B.at(0, 'thiết kế'), { y: 30, stagger: 0.2 });
  const K = $$('.c3a-cap span');
  master.to('.c3a-scan', { autoAlpha: 0, duration: 0.3 }, B[1].t - 0.3);
  [B.at(0, 'thiết kế') + 0.8, B[1].t - 0.35, B.at(1, 'thực thi'), B.at(1, 'kỹ sư')].forEach((at, i) => { pop(K[i], at, { from: 0.4 }); cue(at, 'pop'); });
  lit(K[2], B.at(1, 'thực thi'), 'on');
  master.to(K[2], { scale: 1.08, boxShadow: '0 0 50px rgba(94,234,212,.8)', duration: 0.4 }, B.at(1, 'thực thi'));
  return Math.max(t + 8, B.end + 0.9);
}

function C3B(t) {
  const B = say('c3b', t, { lead: 0.5 });
  head2('.c3b-k', '.c3b-h', t);
  const A = $$('.c3b-cols .au');
  [['cơ quan', 0], ['doanh nghiệp', 1], ['giáo dục', 2], ['cá nhân', 3]].forEach(([p, i]) => {
    const at = B.at(0, p) - 0.25;
    master.fromTo(A[i], { autoAlpha: 0, y: 70 }, { autoAlpha: 1, y: 0, duration: 0.7 }, at); cue(at, 'pop');
    master.fromTo($$('.ch span', A[i]), { autoAlpha: 0, scale: 0.6 }, { autoAlpha: 1, scale: 1, duration: 0.35, stagger: 0.06, ease: 'back.out(2)' }, at + 0.35);
    const L = $$('.lgs img', A[i]);
    if (L.length) master.fromTo(L, { autoAlpha: 0, y: 14 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.07 }, at + 0.7);
  });
  reveal('.c3b-tag', B[1].t - 0.1, 0.8); cue(B[1].t, 'swish');
  return Math.max(t + 7, B.end + 0.9);
}

function C3C(t) {
  const B = say('c3c', t, { lead: 0.5 });
  kicker('.c3c-k', t + 0.05);
  const C = 2 * Math.PI * 200;
  master.fromTo('.c3c-ring', { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.8 }, t + 0.2);
  master.set('.c3c-ring .a', { attr: { 'stroke-dasharray': `0 ${C}` } }, 0);
  master.set('.c3c-ring .b', { attr: { 'stroke-dasharray': `0 ${C}`, 'stroke-dashoffset': -0.3 * C } }, 0);
  const pa = { v: 0 }, pb = { v: 0 }, A = $('.c3c-ring .a'), Bb = $('.c3c-ring .b');
  const a30 = B.at(0, 'ba mươi'), a70 = B.at(0, 'bảy mươi');
  master.fromTo(pa, { v: 0 }, { v: 1, duration: 1.0, ease: 'power2.out', onUpdate: () => A.setAttribute('stroke-dasharray', `${(0.3 * C - 6) * pa.v} ${C}`) }, a30 - 0.2);
  master.fromTo(pb, { v: 0 }, { v: 1, duration: 1.3, ease: 'power2.out', onUpdate: () => Bb.setAttribute('stroke-dasharray', `${(0.7 * C - 6) * pb.v} ${C}`) }, a70 - 0.2);
  up('.c3c-ring .l30', a30 - 0.2, { y: 20 }); counter('.c3c-ring .v30', 0, 30, a30 - 0.2, 1.0, (v) => `${Math.round(v)}%`); cue(a30, 'tick');
  up('.c3c-ring .l70', a70 - 0.2, { y: 20 }); counter('.c3c-ring .v70', 0, 70, a70 - 0.2, 1.3, (v) => `${Math.round(v)}%`); cue(a70, 'tick');
  words('.c3c-t b', t + 0.3); up('.c3c-t p', t + 0.8, { y: 14 });
  words('.c3c-sl', B[1].t - 0.1, { stagger: 0.06 });
  reveal('.c3c-res', B.at(1, 'Ây Ai') - 0.2, 0.7); cue(B.at(1, 'Ây Ai'), 'lock');
  up('.c3c-out small', B[1].t + 0.4, { y: 10 });
  master.fromTo('.c3c-out .ch span', { autoAlpha: 0, y: 16 }, { autoAlpha: 1, y: 0, duration: 0.4, stagger: 0.1 }, B[1].t + 0.6);
  return Math.max(t + 7, B.end + 1.2);
}

function C4A(t) {
  chap(4, t);
  const B = say('c4a', t, { lead: 0.8 });
  op('c4a', t);
  master.fromTo('.c4a-grad', { autoAlpha: 0, y: 80, rotation: 6 }, { autoAlpha: 1, y: 0, rotation: 3, duration: 0.9 }, t + 0.7);
  const S = $$('.c4a-steps span'), H = [70, 100, 130, 160, 190, 220];
  S.forEach((s, i) => { s.style.left = `${i * 142}px`; s.style.height = `${H[i]}px`; });
  const a0 = B.at(0, 'chính quy') - 0.2, a1 = B.at(0, 'tiến sĩ') + 0.2;
  const st = S.map((_, i) => a0 + (a1 - a0) * i / 5);
  S.forEach((s, i) => { master.fromTo(s, { scaleY: 0, transformOrigin: '50% 100%', autoAlpha: 0 }, { scaleY: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(1.6)' }, st[i]); cue(st[i], 'tick'); });
  const cap = $('.c4a-steps .cap');
  master.set(cap, { autoAlpha: 0 }, 0);
  master.set(cap, { autoAlpha: 1, x: 39, y: 260 - H[0] - 70 }, st[0] + 0.2);
  S.forEach((_, i) => { if (i) master.to(cap, { keyframes: [{ x: 39 + i * 142 - 71, y: 260 - H[i] - 120, duration: 0.18, ease: 'power2.out' }, { x: 39 + i * 142, y: 260 - H[i] - 70, duration: 0.18, ease: 'power2.in' }] }, st[i] + 0.1); });
  sparks(120 + 39 + 5 * 142 + 28, 740 + 260 - H[5] - 40, st[5] + 0.5, { r0: 20, r1: 140, n: 30 }); cue(st[5] + 0.5, 'ding');
  const end = Math.max(t + 7, B.end + 1.6);
  kb('#c4a .op-ph img', t, end + 1, { s0: 1.16, s1: 1.04, x0: -20, x1: 20 });
  kb('.c4a-grad img', t + 0.7, end + 1, { s0: 1.1, s1: 1.0 });
  return end;
}

function C4B(t) {
  const B = say('c4b', t, { lead: 0.5 });
  master.fromTo('.c4b-bld', { xPercent: -20, autoAlpha: 0 }, { xPercent: 0, autoAlpha: 1, duration: 0.9 }, t);
  kicker('.c4b-k', t + 0.2); words('.c4b-h', t + 0.3);
  pop('.c4b-top span', B.at(0, 'khảo thí'), { from: 0.6, stagger: 0.15 });
  const L = $$('.c4b-lad .lv').reverse(), W = [0.22, 0.3, 0.38, 0.48, 0.58, 0.7, 0.84, 1.0];
  const a0 = B.at(0, 'từ các cấp'), a1 = B.at(0, 'thành thạo') + 0.2;
  L.forEach((l, i) => {
    const at = a0 + (a1 - a0) * i / 7;
    master.fromTo(l, { autoAlpha: 0, x: -30 }, { autoAlpha: 1, x: 0, duration: 0.4 }, at);
    master.fromTo($('i', l), { scaleX: 0 }, { scaleX: W[i], duration: 0.6, ease: 'power2.out' }, at + 0.1);
    if (i % 2 === 0) cue(at, 'tick');
  });
  up('.c4b-rooms small', B[1].t - 0.4, { y: 10 });
  master.fromTo('.c4b-rooms img', { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: 0.6, stagger: 0.18 }, B[1].t - 0.3); cue(B[1].t - 0.3, 'swish');
  const end = Math.max(t + 6.5, B.end + 1.0);
  kb('.c4b-bld img', t, end + 1, { s0: 1.15, s1: 1.0, y0: 30, y1: -10 });
  return end;
}

function C4C(t) {
  const B = say('c4c', t, { lead: 0.6 });
  const M = $$('.c4c-mos img');
  master.fromTo(M, { autoAlpha: 0, scale: 1.25 }, { autoAlpha: 1, scale: 1.0, duration: 1.0, stagger: 0.1, ease: 'power3.out' }, t);
  master.fromTo('.c4c-mos', { scale: 1.0 }, { scale: 1.08, duration: 7, ease: 'none', transformOrigin: '50% 50%' }, t);
  master.fromTo('.c4c-shade', { opacity: 0 }, { opacity: 1, duration: 0.8 }, t + 0.6);
  kicker('.c4c-k', t + 0.7);
  const n = B.at(0, 'hai trăm') - 0.3;
  master.fromTo('.c4c-num', { autoAlpha: 0, scale: 0.7 }, { autoAlpha: 1, scale: 1, duration: 0.6 }, n);
  counter('.c4c-num', 0, 250, n, 1.4); cue(n, 'riser'); cue(n + 1.4, 'hit');
  up('.c4c-lb', n + 0.6, { y: 20 }); up('.c4c-sub', n + 0.9, { y: 16 });
  return Math.max(t + 6, B.end + 1.2);
}

function hubFinal(t) {
  tile(4, 'done', t - 0.35);
  master.to('.rail .fl', { strokeDashoffset: 0, duration: 0.6 }, t);
  const B = say('h5', t, { lead: 0.4 });
  const a = B[0].t;
  [1, 2, 3, 4].forEach((k) => tile(k, 'fin', a + (k - 1) * 0.12, 0.6));
  [1, 2, 3, 4].forEach((k) => sparks(TILE(k).x + 198, 300, a + (k - 1) * 0.12, { r0: 30, r1: 160, n: 24 }));
  cue(a, 'hit');
  master.to('.hub-h', { y: -30, autoAlpha: 0, duration: 0.4, ease: 'power2.in' }, a - 0.1);
  master.set('.hub-h2', { visibility: 'inherit' }, a + 0.25);
  words('.hub-h2', a + 0.3);
  master.to('.rail', { autoAlpha: 0, duration: 0.4 }, B[1].t - 0.6);
  master.set('.hub-flow', { visibility: 'inherit' }, B[1].t - 0.4);
  const F = $$('.hub-flow span'), Ar = $$('.hub-flow .ar');
  master.set([...F, ...Ar], { autoAlpha: 0 }, 0);
  [['khảo sát', 0], ['lộ trình', 1], ['ứng dụng', 2]].forEach(([p, i]) => {
    const at = B.at(1, p) - 0.2;
    pop(F[i], at, { from: 0.5 }); cue(at, 'pop');
    if (i) master.fromTo(Ar[i - 1], { autoAlpha: 0, x: -14 }, { autoAlpha: 1, x: 0, duration: 0.3 }, at - 0.15);
  });
  return Math.max(t + 6, B.end + 1.2);
}

function S4(t) { // đối tác
  cue(t, 'sec_soft');
  const B = say('s4', t, { lead: 0.8 });
  head2('.s4-k', '.s4-h', t);
  up('.s4-sub', t + 0.6, { y: 14 });
  const grid = $('.s4-grid'), cards = [];
  for (let i = 1; i <= 16; i++) cards.push(div('lg', grid, `<img src="assets/lg/p${i}.jpg" alt="">`));
  cards.forEach((c, i) => { const at = t + 0.5 + (i % 8) * 0.08 + Math.floor(i / 8) * 0.22; master.fromTo(c, { autoAlpha: 0, rotationY: -90 }, { autoAlpha: 1, rotationY: 0, duration: 0.6, ease: 'back.out(1.4)' }, at); });
  [0.5, 0.9, 1.3].forEach((d) => cue(t + d, 'pop'));
  draw('.s4-cat .ln', t + 1.6, 1.0);
  master.fromTo('.s4-cat span', { autoAlpha: 0, y: 20 }, { autoAlpha: 1, y: 0, duration: 0.5, stagger: 0.15 }, B.at(0, 'trong nước') - 0.4);
  return Math.max(t + 6, B.end + 1.6);
}

function S5(t) { // kết
  master.to('#bug', { autoAlpha: 0, duration: 0.4 }, t);
  bg(t, { net: 0.9 }, 0.8);
  const B = say('s5', t, { lead: 0.9 });
  cue(t + 0.3, 'sec_end');
  pop('.s5-logo', t + 0.2, { from: 0.3, ease: 'back.out(2)' }); sparks(960, 170, t + 0.35, { r0: 100, r1: 260, n: 36 });
  master.fromTo('.s5-name', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.1 }, t + 0.5); scramble('.s5-name', t + 0.5, 1.0);
  up('.s5-en', t + 0.9, { y: 10 });
  words('.s5-h', B[0].t, { stagger: 0.05 });
  reveal('.s5-card', B.at(0, 'hành trình') - 0.2, 0.8);
  up('.s5-card p', B.at(0, 'hành trình'), { x: -20, y: 0, stagger: 0.18 });
  up('.s5-card .offs', B.at(0, 'hành trình') + 0.6, { y: 10 });
  pop('.s5-qr', B.at(0, 'hành trình') + 0.2, { from: 0.6 });
  master.fromTo('.s5-qr .ln', { y: 0, opacity: 0.9 }, { y: 240, opacity: 0.9, duration: 1.4, repeat: 3, yoyo: true, ease: 'sine.inOut' }, B.at(0, 'hành trình') + 0.8);
  up('.s5-cta', B[1].t, { y: 20 }); cue(B[1].t, 'ding');
  return Math.max(t + 10, B.end + 3.2);
}

/* ================= GHÉP CẢNH ================= */
const LOG = [];
const L = (n, f) => (...a) => { const v = f(...a); LOG.push([n, +a[0].toFixed(2), +v.toFixed(2)]); return v; };
function build() {
  buildNet(); buildBlocks();
  master.set('#hub', { scale: 1, filter: 'none' }, 0);
  let t, x;
  t = S1(0);
  x = L('iris', iris)(t, '#s1', '#s2', 960, 470); t = L('S2', S2)(x);
  x = L('scanWipe', scanWipe)(t, '#s2', '#s3'); t = L('S3', S3)(x);
  x = L('blockWipe', blockWipe)(t, '#s3', '#hub'); t = L('hubFirst', hubFirst)(x);
  // 01 · chứng chỉ nghiệp vụ ngắn hạn
  x = L('portalIn', portalIn)(t, 1, '#c1a'); t = L('C1A', C1A)(x);
  x = L('swipe', swipe)(t, '#c1a', '#c1b', ACC[1]); t = L('C1B', C1B)(x);
  master.to('#chap', { autoAlpha: 0, duration: 0.3 }, t);
  x = L('portalOut', portalOut)(t, 1, '#c1b'); t = L('hubVisit', hubVisit)(x, 2, 'h2');
  // 02 · an toàn, vệ sinh lao động
  x = L('portalIn', portalIn)(t, 2, '#c2a'); t = L('C2A', C2A)(x);
  x = L('scanWipe', scanWipe)(t, '#c2a', '#c2b'); t = L('C2B', C2B)(x);
  x = L('swipe', swipe)(t, '#c2b', '#c2c', ACC[2]); t = L('C2C', C2C)(x);
  x = L('scanWipe', scanWipe)(t, '#c2c', '#c2d'); t = L('C2D', C2D)(x);
  x = L('swipe', swipe)(t, '#c2d', '#c2e', ACC[2]); t = L('C2E', C2E)(x);
  x = L('scanWipe', scanWipe)(t, '#c2e', '#c2f'); t = L('C2F', C2F)(x);
  master.to('#chap', { autoAlpha: 0, duration: 0.3 }, t);
  x = L('portalOut', portalOut)(t, 2, '#c2f'); t = L('hubVisit', hubVisit)(x, 3, 'h3');
  // 03 · đào tạo ứng dụng AI
  x = L('portalIn', portalIn)(t, 3, '#c3a'); t = L('C3A', C3A)(x);
  x = L('scanWipe', scanWipe)(t, '#c3a', '#c3b'); t = L('C3B', C3B)(x);
  x = L('swipe', swipe)(t, '#c3b', '#c3c', ACC[3]); t = L('C3C', C3C)(x);
  master.to('#chap', { autoAlpha: 0, duration: 0.3 }, t);
  x = L('portalOut', portalOut)(t, 3, '#c3c'); t = L('hubVisit', hubVisit)(x, 4, 'h4');
  // 04 · tuyển sinh & khảo thí Cambridge
  x = L('portalIn', portalIn)(t, 4, '#c4a'); t = L('C4A', C4A)(x);
  x = L('swipe', swipe)(t, '#c4a', '#c4b', ACC[4]); t = L('C4B', C4B)(x);
  x = L('scanWipe', scanWipe)(t, '#c4b', '#c4c'); t = L('C4C', C4C)(x);
  master.to('#chap', { autoAlpha: 0, duration: 0.3 }, t);
  x = L('portalOut', portalOut)(t, 4, '#c4c'); t = L('hubFinal', hubFinal)(x);
  x = L('blockWipe', blockWipe)(t, '#hub', '#s4'); t = L('S4', S4)(x);
  x = L('iris', iris)(t, '#s4', '#s5', 960, 170); t = L('S5', S5)(x);
  portalFX();
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
  await waitImgs(); // ảnh tạo thêm trong build (tường ảnh, logo đối tác)
  const seek = (t) => { master.seek(t, false); UPD.forEach((f) => f(t)); };
  seek(0);
  window.__duration = dur;
  window.__marks = MARKS.sort((a, b) => a.t - b.t);
  window.__seek = seek;
  window.__log = LOG;
  window.__ready = true;
  const m = location.search.match(/t=([\d.]+)/);
  if (m) seek(parseFloat(m[1]));
  if (location.search.includes('play')) { const t0 = performance.now(); const loop = () => { const t = (performance.now() - t0) / 1000; if (t < dur) { seek(t); requestAnimationFrame(loop); } }; loop(); }
})().catch((e) => { console.error(e); window.__error = String(e && e.stack || e); });
