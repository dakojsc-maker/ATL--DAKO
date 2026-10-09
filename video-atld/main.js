/* Viện STP – Phần mềm quản lý an toàn, vệ sinh lao động (video giới thiệu có thuyết minh).
   Mở đầu tối (vấn đề) → thương hiệu → 5 phân hệ → 12 cảnh tính năng trên nền sáng: ảnh chụp thật của phần mềm,
   khung cam đánh số đúng theo các bước trong tài liệu hướng dẫn (assets/boxes.json), phóng to vào từng vùng,
   con trỏ bấm minh hoạ, thẻ nổi và thông báo → 3 bước bắt đầu → kết.
   Thời lượng cảnh lấy theo độ dài lời đọc (vo.json do tts.py sinh ra). Toàn bộ chạy trên một GSAP timeline dừng sẵn,
   các hiệu ứng canvas là hàm thuần của thời gian t để render tất định qua window.__seek(t). */
gsap.ticker.lagSmoothing(0);
gsap.defaults({ ease: 'power3.out' });

const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const master = gsap.timeline({ paused: true });
const MARKS = [];
const UPD = [];
const FX = [];
const cue = (t, type) => MARKS.push({ t: +t.toFixed(3), type });
const mark = (t, type) => MARKS.push({ t: +t.toFixed(3), type });
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const inOut2 = (v) => { v = clamp01(v); return v < 0.5 ? 2 * v * v : 1 - Math.pow(-2 * v + 2, 2) / 2; };
let VO = null, BOX = null;

function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const hash = (a, b) => { let h = Math.imul(a + 1, 374761393) ^ Math.imul(b + 7, 668265263); h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
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
let VEND = 0; // thời điểm kết thúc câu đọc gần nhất – câu sau không bao giờ chồng lên câu trước
function say(sc, t, o = {}) {
  const want = t + (o.lead ?? 0.5), lead = Math.max(want, VEND + (o.minGap ?? 0.45)) - t;
  const B = voice(sc, t, { ...o, lead });
  VEND = B.end;
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
    { yPercent: 0, rotate: 0, duration: o.dur ?? 0.8, ease: 'power4.out', stagger: o.stagger ?? 0.045 }, at);
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
const show = (s, at) => master.set(s, { visibility: 'visible' }, at);
const hide = (s, at) => master.set(s, { visibility: 'hidden' }, at);
const gone = (e, at, d = 0.3) => master.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: d, ease: 'power1.in', immediateRender: false }, at);
function counter(elm, from, to, at, dur, fmt = (v) => Math.round(v)) {
  const o = { v: from }, e = el(elm);
  master.fromTo(o, { v: from }, { v: to, duration: dur, ease: 'power2.out', onUpdate: () => { e.textContent = fmt(o.v); } }, at);
}
function flashOn(e, t0, t1, cls = 'on') { // bật class trong khoảng [t0, t1)
  els(e).forEach((x) => { const base = x.getAttribute('class'); master.set(x, { attr: { class: `${base} ${cls}` } }, t0); master.set(x, { attr: { class: base } }, t1); });
}
function shake(sel, at, amp = 12) {
  master.fromTo(sel, { x: -amp }, { x: 0, duration: 0.6, ease: 'elastic.out(1.2,0.3)', immediateRender: false }, at);
}

/* ---------- chuyển cảnh ---------- */
// cảnh sáng → cảnh sáng: cảnh cũ trượt sang trái, cảnh mới tự dựng nội dung
function slide(at, prev, next) {
  master.fromTo(prev, { x: 0, opacity: 1 }, { x: -150, opacity: 0, duration: 0.55, ease: 'power2.in', immediateRender: false }, at);
  hide(prev, at + 0.56);
  show(next, at + 0.4);
  curOff(at);
  cue(at, 'whoosh');
  return at + 0.4;
}
// tối ↔ sáng: nền sáng loang ra (hoặc thu lại) thành vòng tròn từ giữa màn hình
const CIRC = [];
function ringFX(at, D, dir, col) {
  FX.push({ t0: at, t1: at + D, fn: (g, t) => {
    const k = inOut2((t - at) / D), r = 2250 * (dir > 0 ? k : 1 - k), a = Math.sin(Math.PI * clamp01((t - at) / D));
    g.save(); g.lineWidth = 10; g.strokeStyle = col; g.globalAlpha = 0.85 * a; g.shadowColor = col; g.shadowBlur = 40;
    g.beginPath(); g.arc(960, 540, Math.max(1, r), 0, 6.283); g.stroke(); g.restore();
  } });
}
function toLight(at, prev, next, D = 1.0) {
  CIRC.push({ at, D, dir: 1 });
  master.set('#bgL', { opacity: 1 }, at);
  master.fromTo(prev, { opacity: 1, scale: 1 }, { opacity: 0, scale: 1.08, duration: 0.5, ease: 'power2.in', immediateRender: false }, at);
  hide(prev, at + 0.52);
  show(next, at + 0.55);
  ringFX(at, D, 1, '#F26A1B');
  cue(at, 'whoosh'); cue(at + 0.1, 'swish');
  return at + 0.55;
}
function toDark(at, prev, next, D = 1.0) {
  CIRC.push({ at, D, dir: -1 });
  master.set('#bgL', { opacity: 0 }, at + D);
  master.fromTo(prev, { opacity: 1, scale: 1 }, { opacity: 0, scale: 0.94, duration: 0.5, ease: 'power2.in', immediateRender: false }, at);
  hide(prev, at + 0.52);
  show(next, at + D * 0.8);
  ringFX(at, D, -1, '#8BE3A0');
  cue(at, 'whoosh');
  return at + D * 0.8;
}
// tối → tối: cảnh cũ lao về phía người xem, chớp sáng, cảnh mới hiện ra
function zoomCut(at, prev, next) {
  master.fromTo(prev, { scale: 1, opacity: 1 }, { scale: 1.35, opacity: 0, duration: 0.55, ease: 'power3.in', immediateRender: false }, at);
  master.fromTo('#flash', { opacity: 0 }, { opacity: 0.55, duration: 0.08, yoyo: true, repeat: 1, immediateRender: false }, at + 0.5);
  hide(prev, at + 0.56);
  show(next, at + 0.55);
  cue(at, 'whoosh'); cue(at + 0.5, 'hit');
  return at + 0.55;
}
UPD.push((t) => {
  const g = $('#bgL'); let s = '';
  CIRC.forEach((c) => {
    if (t < c.at || t > c.at + c.D) return;
    const k = inOut2((t - c.at) / c.D), r = 2250 * (c.dir > 0 ? k : 1 - k);
    s = `circle(${r.toFixed(1)}px at 960px 540px)`;
  });
  if (g.style.clipPath !== s) g.style.clipPath = s;
});

/* ---------- con trỏ chuột ---------- */
const CUR = { x: 1500, y: 900, on: false };
function curOn(at, x, y) {
  master.fromTo('#cursor', { autoAlpha: 0, x: x - 6, y: y - 3 }, { autoAlpha: 1, duration: 0.3, immediateRender: false }, at);
  CUR.x = x; CUR.y = y; CUR.on = true;
}
function curOff(at) {
  if (!CUR.on) return;
  master.fromTo('#cursor', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.25, immediateRender: false }, at);
  CUR.on = false;
}
function moveTo(at, x, y, d = 0.7) { // con trỏ tới (x, y) đúng lúc `at`
  if (!CUR.on) curOn(at - d - 0.35, Math.min(x + 120, 1850), Math.min(y + 150, 1040));
  master.fromTo('#cursor', { x: CUR.x - 6, y: CUR.y - 3 }, { x: x - 6, y: y - 3, duration: d, ease: 'power2.inOut', immediateRender: false }, at - d);
  CUR.x = x; CUR.y = y;
}
function tap(at, x, y) {
  moveTo(at, x, y);
  master.fromTo('#cursor', { scale: 1 }, { scale: 0.8, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.inOut', immediateRender: false }, at);
  master.fromTo('#ripple', { x, y, scale: 0.3, opacity: 0.95 }, { scale: 1.5, opacity: 0, duration: 0.55, ease: 'power2.out', immediateRender: false }, at);
  cue(at, 'click');
}

/* ---------- cửa sổ phần mềm: ảnh chụp thật + phóng to + khung đánh số ---------- */
const SZ = { u04: [1521, 731], u05: [1518, 695], u06: [1523, 733], u07: [1523, 731], u09: [1111, 739], u10: [1524, 699], u12: [1521, 736], u13: [1521, 726], u14: [1520, 742], u15: [710, 890], u16: [1524, 730], u17: [1262, 740], u18: [1520, 737], u19: [1262, 736], u20: [1520, 735], u22: [1522, 734], u23: [1518, 738], u24: [1519, 769], u25: [1904, 918], u26: [1519, 764], u28: [1522, 729], u29: [742, 830], u30: [1521, 728], u31: [381, 927], u32: [1519, 738], u33: [637, 614], u34: [1519, 733], u35: [1522, 732], u36: [725, 565], u37: [1522, 737], u38: [642, 781] };
const st = (sl, n) => BOX[sl].steps.find((s) => s.n === n);
const ctr = (b) => [b.box[0] + b.box[2] / 2, b.box[1] + b.box[3] / 2];
const HLS = [];
function Win(sc, src, o = {}) {
  const S = el(sc), [iw, ih] = SZ[src], w = o.w ?? 1090, bar = o.chrome === false || o.over ? 0 : 44;
  const vh = Math.round((w * ih) / iw), x = o.x ?? 750, y = o.y ?? Math.round(566 - (vh + bar) / 2);
  const sh = o.over ? div('shade', S) : null;
  if (sh) sh.style.cssText = `left:${o.over.x}px;top:${o.over.y}px;width:${o.over.w}px;height:${o.over.vh + o.over.bar}px`;
  const e = div(o.over ? 'win pp' : 'win', S);
  e.style.cssText = `left:${x}px;top:${y}px;width:${w}px`;
  if (bar) e.innerHTML = `<div class="bar"><i></i><i></i><i></i><span><i class="ic" data-i="lock"></i>doanhnghiep.vienstp.com<b>${o.url ?? ''}</b></span></div>`;
  const vp = div('vp', e); vp.style.height = `${vh}px`;
  const cv = div('cv', vp); cv.style.height = `${vh}px`;
  const im = document.createElement('img'); im.src = `assets/ui/${src}.jpg`; cv.appendChild(im);
  const ov = div('ov', S); ov.style.cssText = `left:${x}px;top:${y + bar}px;width:${w}px;height:${vh}px`;
  const W = { e, ov, cv, x, y, w, vh, bar, sh, z: { s: 1, tx: 0, ty: 0 }, zEnd: 0, act: [] };
  master.set(e, { autoAlpha: 0 }, 0);
  // toạ độ % trên ảnh → toạ độ màn hình (theo mức phóng hiện tại)
  W.pt = (px, py) => [x + (px / 100) * w * W.z.s + W.z.tx, y + bar + (py / 100) * vh * W.z.s + W.z.ty];
  W.rect = (b) => {
    const s = W.z.s;
    let X = (b[0] / 100) * w * s + W.z.tx, Y = (b[1] / 100) * vh * s + W.z.ty;
    let R = X + (b[2] / 100) * w * s, Bt = Y + (b[3] / 100) * vh * s;
    X = Math.max(X, 4); Y = Math.max(Y, 4); R = Math.min(R, w - 4); Bt = Math.min(Bt, vh - 4);
    return [X, Y, R - X, Bt - Y];
  };
  W.clear = (t) => { W.act.forEach((r) => { r.end = Math.min(r.end, t); }); W.act = []; };
  W.zoom = (at, b, sMax = 2, d = 0.9) => {
    W.clear(at);
    let n = { s: 1, tx: 0, ty: 0 };
    if (b) {
      const bx = (b[0] / 100) * w, by = (b[1] / 100) * vh, bw = (b[2] / 100) * w, bh = (b[3] / 100) * vh;
      const s = Math.max(1, Math.min(sMax, (0.94 * w) / bw, (0.94 * vh) / bh));
      let tx = w / 2 - (bx + bw / 2) * s, ty = vh / 2 - (by + bh / 2) * s;
      tx = Math.min(0, Math.max(w - w * s, tx)); ty = Math.min(0, Math.max(vh - vh * s, ty));
      n = { s, tx, ty };
    }
    const p = W.z;
    master.fromTo(cv, { scale: p.s, x: p.tx, y: p.ty }, { scale: n.s, x: n.tx, y: n.ty, duration: d, ease: 'power3.inOut', immediateRender: false }, at);
    W.z = n; W.zEnd = at + d;
    cue(at, 'swish');
    return at + d;
  };
  // khung cam + nhãn (số bước lấy đúng theo tài liệu hướng dẫn)
  W.hl = (at, b, o2 = {}) => {
    const box = Array.isArray(b) ? b : b.box, lab = o2.t ?? b.t, num = o2.n ?? (Array.isArray(b) ? '' : b.n);
    const [X, Y, Wd, Ht] = W.rect(box);
    const h = div(`hl${o2.cls ? ` ${o2.cls}` : ''}`, W.ov, `<div class="lb">${num !== '' ? `<em>${num}</em>` : ''}${lab}</div>`);
    h.style.cssText = `left:${(X - 5).toFixed(1)}px;top:${(Y - 5).toFixed(1)}px;width:${(Wd + 10).toFixed(1)}px;height:${(Ht + 10).toFixed(1)}px`;
    let pos = o2.pos;
    if (!pos && Y < 54) pos = Y + Ht + 58 < vh ? 'dn' : 'in';
    if (pos) h.classList.add(pos);
    const est = 56 + lab.length * 10.6;
    if (o2.rt || (!o2.left && X + est > w + 30)) h.classList.add('rt');
    master.fromTo(h, { autoAlpha: 0, scale: 1.12 }, { autoAlpha: 1, scale: 1, duration: 0.45, ease: 'back.out(2)' }, at);
    cue(at, 'pop');
    const r = { h, end: o2.until ?? Infinity };
    W.act.push(r); HLS.push(r);
    return r;
  };
  W.click = (at, px, py) => { const [cx, cy] = W.pt(px, py); tap(at, cx, cy); };
  W.in = (at) => {
    if (o.over) {
      master.fromTo(sh, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none', immediateRender: false }, at);
      master.fromTo(e, { autoAlpha: 0, scale: 0.9, y: 30 }, { autoAlpha: 1, scale: 1, y: 0, duration: 0.55, ease: 'back.out(1.5)', immediateRender: false }, at);
      cue(at, 'pop');
    } else {
      master.fromTo(e, { autoAlpha: 0, x: 140, rotationY: -16, transformPerspective: 1800, transformOrigin: '0% 50%' },
        { autoAlpha: 1, x: 0, rotationY: 0, duration: 1.0, ease: 'power3.out', immediateRender: false }, at);
    }
  };
  W.soft = (at) => { // vào trang mới trong cùng cảnh (điều hướng)
    master.fromTo(e, { autoAlpha: 0, x: 70 }, { autoAlpha: 1, x: 0, duration: 0.55, ease: 'power3.out', immediateRender: false }, at);
  };
  W.out = (at) => {
    W.clear(at);
    master.fromTo(e, { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.35, ease: 'power1.in', immediateRender: false }, at);
    if (sh) master.fromTo(sh, { opacity: 1 }, { opacity: 0, duration: 0.35, ease: 'none', immediateRender: false }, at);
  };
  return W;
}
function nav(at, A, B) { A.out(at); B.soft(at + 0.18); cue(at, 'swish'); return at + 0.75; }
function finishHL() {
  HLS.forEach((r) => { if (Number.isFinite(r.end)) gone(r.h, r.end, 0.25); });
}

/* ---------- thẻ nổi & thông báo ---------- */
function toast(sc, at, o) {
  const t = div(`ts${o.cls ? ` ${o.cls}` : ''}`, el(sc), `<i><i class="ic" data-i="${o.i ?? 'bell-ring'}"></i></i><div><b>${o.b}</b><span>${o.s ?? ''}</span></div>`);
  t.style.left = `${o.x}px`; t.style.top = `${o.y}px`;
  master.fromTo(t, { autoAlpha: 0, x: 50, scale: 0.94 }, { autoAlpha: 1, x: 0, scale: 1, duration: 0.55, ease: 'back.out(1.5)' }, at);
  cue(at, o.snd ?? 'notif');
  if (o.until) gone(t, o.until);
  return t;
}
function Stack(sc, x, yb, gap = 86) { // chồng thông báo: cái mới ở dưới, cái cũ đẩy lên
  const items = [];
  const f = (at, o) => {
    items.forEach((it) => { master.fromTo(it.e, { y: it.off }, { y: it.off - gap, duration: 0.45, ease: 'power2.out', immediateRender: false }, at); it.off -= gap; });
    const e = toast(sc, at, { ...o, x, y: yb - 74 });
    items.push({ e, off: 0 });
    return e;
  };
  f.clear = (at) => items.forEach((it) => gone(it.e, at));
  return f;
}
function fc(sc, at, o) {
  const f = div(`fc${o.i ? ' ic2' : ''}${o.c ? ` ${o.c}` : ''}`, el(sc), `${o.i ? `<i class="ic" data-i="${o.i}"></i>` : ''}<div><small>${o.k}</small><b class="${o.c ?? ''}">${o.v}</b></div>`);
  f.style.left = `${o.x}px`; f.style.top = `${o.y}px`;
  master.fromTo(f, { autoAlpha: 0, y: 26, scale: 0.9 }, { autoAlpha: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, at);
  cue(at, 'pop');
  if (o.until) gone(f, o.until);
  return f;
}

/* ================= CẢNH ================= */
function S1(t) {
  show('#s1', 0);
  const R = rng(7), bl = $('#s1 .blurs'), cards = [];
  const cls = ['', 'or', 'rd', '', 'gn', 'bl', '', 'or', 'rd', '', 'gn', '', 'rd', 'or'];
  for (let i = 0; i < 14; i++) {
    const c = div(`blur ${cls[i]}`, bl, '<i></i><i style="width:60%"></i><i style="width:40%"></i>');
    const w = 180 + R() * 220, h = 110 + R() * 120;
    c.style.cssText = `left:${(R() * 1780 - 60).toFixed(0)}px;top:${(R() * 980 - 40).toFixed(0)}px;width:${w.toFixed(0)}px;height:${h.toFixed(0)}px`;
    cards.push({ c, ax: 20 + R() * 40, ay: 14 + R() * 30, w: 0.15 + R() * 0.25, p: R() * 6.28, r: (R() - 0.5) * 10 });
  }
  UPD.push((tt) => cards.forEach((k) => { k.c.style.transform = `translate(${(Math.sin(tt * k.w + k.p) * k.ax).toFixed(1)}px,${(Math.cos(tt * k.w * 0.8 + k.p) * k.ay - tt * 6).toFixed(1)}px) rotate(${k.r.toFixed(1)}deg)`; }));
  master.fromTo(bl, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'none' }, 0);
  const B = say('s1', t, { lead: 1.0, gap: 0.55 });
  words('#s1 .l1', B[0].t - 0.15);
  words('#s1 .l2', B.at(0, 'bảng tính') - 0.1);
  cue(B[0].t - 0.15, 'swish');
  const x1 = B[1].t - 0.35;
  master.fromTo(['#s1 .l1', '#s1 .l2'], { y: 0, opacity: 1 }, { y: -50, opacity: 0, duration: 0.4, ease: 'power2.in', immediateRender: false }, x1);
  words('#s1 .m1', B[1].t - 0.05);
  cue(B[1].t, 'glitch');
  words('#s1 .m2', B.at(1, 'thiết bị') - 0.1);
  shake('#s1 .m2', B.at(1, 'thiết bị') + 0.5);
  cue(B.at(1, 'thiết bị') + 0.45, 'alarm');
  up('#s1 .q', B.at(1, 'đôi khi'), { y: 16 });
  return B.end + 0.8;
}

function S2(t) {
  mark(t, 'downbeat');
  const hero = $('#s2 .hero'), H = [
    { src: 'u04', x: 510, y: 742, w: 900, r: 0 },
    { src: 'u28', x: 60, y: 812, w: 640, r: 16 },
    { src: 'u37', x: 1220, y: 812, w: 640, r: -16 },
  ];
  const hw = H.map((h) => { const d = div('hw', hero, `<img src="assets/ui/${h.src}.jpg" alt="">`); d.style.cssText = `left:${h.x}px;top:${h.y}px;width:${h.w}px`; return d; });
  const B = say('s2', t, { lead: 1.0 });
  // logo Viện STP hiện giữa màn hình, rồi dịch sang trái nhường chỗ cho logo DAKO (đúng lúc đọc tên DAKO)
  const sh = 145, dk = B.at(0, 'Công ty Đa Cô') - 0.3;
  master.fromTo('#s2 .duo .stp', { x: sh, scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'back.out(2.2)' }, t + 0.05);
  master.fromTo('#s2 .duo .stp', { x: sh }, { x: 0, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, dk);
  pop('#s2 .duo .x', dk + 0.3, { from: 0.2, ease: 'back.out(2.6)' });
  master.fromTo('#s2 .duo .dako', { x: -40, scale: 0.3, autoAlpha: 0 }, { x: 0, scale: 1, autoAlpha: 1, duration: 0.85, ease: 'back.out(2.2)' }, dk + 0.25);
  cue(dk + 0.15, 'pop'); // không đặt tiếng chuông ở đây: trùng lúc đọc tên DAKO
  kicker('#s2 .kk', t + 0.45);
  words('#s2 .t1', B[0].t - 0.1);
  words('#s2 .t2', B.at(0, 'an toàn') - 0.1);
  up('#s2 .url span', B[1].t, { y: 20, stagger: 0.12 });
  const hx = B.at(1, 'nền tảng số') - 0.2;
  hw.forEach((d, i) => master.fromTo(d, { autoAlpha: 0, y: 380, rotationX: 38, rotationY: H[i].r, transformPerspective: 1600, transformOrigin: '50% 0%' },
    { autoAlpha: 1, y: 0, rotationX: 22, rotationY: H[i].r * 0.6, duration: 1.3, ease: 'power3.out' }, hx + [0, 0.15, 0.25][i]));
  master.fromTo(hw, { yPercent: 0 }, { yPercent: -6, duration: Math.max(0.5, B.end + 1.0 - hx - 1.3), ease: 'none', immediateRender: false }, hx + 1.3);
  cue(hx, 'whoosh');
  return B.end + 1.0;
}

function S3(t) {
  mark(t, 'sec_tension');
  show('#bug', t); master.fromTo('#bug', { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5, immediateRender: false }, t + 0.3);
  const B = say('s3', t, { lead: 0.8 });
  kicker('#s3 .kk', t + 0.1);
  words('#s3 .hd', t + 0.2);
  const M = $$('#s3 .m');
  master.fromTo(M, { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.09, ease: 'power3.out' }, B[0].t + 0.1);
  cue(B[0].t + 0.1, 'swish');
  const P = ['tổng quan', 'doanh nghiệp', 'đào tạo', 'công tác', 'an toàn'].map((p) => B.at(1, p) - 0.1);
  P.forEach((a, i) => {
    flashOn(M[i], a, i < 4 ? P[i + 1] : B.end + 1.3);
    master.fromTo(M[i], { y: 0 }, { y: -14, duration: 0.3, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, a);
    master.fromTo($('.ico', M[i]), { scale: 1 }, { scale: 1.18, duration: 0.25, yoyo: true, repeat: 1, ease: 'power2.out', immediateRender: false }, a);
    cue(a, 'tick');
  });
  return B.end + 1.1;
}

/* ---------- 12 cảnh tính năng ---------- */
const MODS = ['Tổng quan & báo cáo', 'Doanh nghiệp', 'Đào tạo', 'Công tác & công việc', 'An toàn & tài sản'];
const F = [
  { m: 0, k: 'BẢNG ĐIỀU KHIỂN', h: ['Toàn cảnh an toàn', 'trong một màn hình.'], b: ['Lao động, huấn luyện, chứng chỉ', 'Thiết bị cần kiểm định, tai nạn', 'Biểu đồ dữ liệu thời gian thực'] },
  { m: 0, k: 'CẢNH BÁO & THAO TÁC NHANH', h: ['Việc gấp', 'không bị bỏ sót.'], b: ['Thiết bị sắp quá hạn kiểm định', 'Chứng chỉ hết hạn trong 30 ngày', 'Đăng ký lớp, thêm nhân sự, báo sự cố'] },
  { m: 0, k: 'BÁO CÁO', h: ['Báo cáo tức thì,', 'xuất Excel 1 chạm.'], b: ['Theo năm, quý hoặc tháng', 'Doanh nghiệp & từng nhân sự', 'Lọc theo phòng ban, mã nhân viên'] },
  { m: 1, k: 'HỒ SƠ & PHÂN QUYỀN', h: ['Doanh nghiệp', 'tự chủ dữ liệu.'], b: ['Hồ sơ, liên hệ, người đại diện', 'Tài khoản vận hành (operator)', 'Phân quyền đến từng phân hệ'] },
  { m: 2, k: 'DANH MỤC KHÓA HỌC', h: ['Khóa học Viện STP', 'luôn sẵn sàng.'], b: ['Đối tượng, mã, thời lượng', 'Chi tiết từng học phần', 'Đăng ký đào tạo trực tuyến'] },
  { m: 2, k: 'NHÂN SỰ / HỌC VIÊN', h: ['6 nhóm huấn luyện,', 'lọc trong 1 chạm.'], b: ['Phân nhóm theo NĐ 44/2016/NĐ-CP', 'Hồ sơ cá nhân & công việc', 'Đính kèm văn bằng, giấy khám SK'] },
  { m: 2, k: 'HỢP ĐỒNG & LỚP HỌC', h: ['Hợp đồng minh bạch,', 'lớp học rõ tiến độ.'], b: ['Giá trị & trạng thái thanh toán', 'Lịch sử trạng thái hợp đồng', 'Sĩ số, lịch từng buổi học'] },
  { m: 3, k: 'BẢNG TIN · TÀI LIỆU · CÔNG VIỆC', h: ['Kết nối nội bộ,', 'giao việc rõ ràng.'], b: ['Thông tư, nghị định luôn cập nhật', 'Giao việc theo nhóm / cá nhân', 'Duyệt đơn từ ngay trên hệ thống'] },
  { m: 4, k: 'THIẾT BỊ – KIỂM ĐỊNH', h: ['Kiểm định thiết bị', 'không còn trễ hạn.'], b: ['Ngày kiểm định & ngày hết hạn', 'Tự cảnh báo trước 30 ngày', 'Nhãn đỏ: quá hạn kiểm định'] },
  { m: 4, k: 'TAI NẠN & SỰ CỐ', h: ['Ghi nhận sự cố,', 'xử lý đến cùng.'], b: ['Loại, thời gian, địa điểm', 'Nguyên nhân & biện pháp khắc phục', 'Người chịu trách nhiệm, trạng thái'] },
  { m: 4, k: 'VẬT TƯ · HÓA CHẤT · KHO', h: ['Vật tư, hóa chất', 'luôn đủ dùng.'], b: ['Cảnh báo dưới ngưỡng tồn kho', 'Phiếu nhập kèm hóa đơn', 'Nhật ký nhập – xuất thời gian thực'] },
  { m: 4, k: 'CẤP PHÁT PPE', h: ['Đồ bảo hộ', 'tự nhắc hạn dùng.'], b: ['Cấp phát cho từng người', 'Hạn dùng nhanh: +3T · +6T · +1N', 'Nhắc thu hồi, cấp mới khi hết hạn'] },
];
function buildDOM() {
  F.forEach((f, i) => {
    const s = document.createElement('section'); s.id = `f${i + 1}`; s.className = 'scene fs';
    s.innerHTML = `<div class="kk"><b>${String(i + 1).padStart(2, '0')}</b>${f.k}</div>`
      + `<div class="hd">${f.h[0]}<br><span class="ac">${f.h[1]}</span></div>`
      + `<div class="bl">${f.b.map((x) => `<p><span class="ck"><i class="ic" data-i="check"></i></span>${x}</p>`).join('')}</div>`;
    $('#feat').appendChild(s);
  });
  const r = div('', null); r.id = 'rail';
  r.innerHTML = MODS.map((m, i) => `<span><em>0${i + 1}</em>${m}</span>`).join('');
  $('#stage').insertBefore(r, $('#fx'));
}
function rail(at, m) {
  $$('#rail span').forEach((s, i) => master.set(s, { attr: { class: i === m ? 'on' : i < m ? 'dn' : '' } }, at));
  if (m >= 0) master.fromTo($$('#rail span')[m], { scale: 0.9 }, { scale: 1, duration: 0.4, ease: 'back.out(2.5)', immediateRender: false }, at);
}
// phần chữ bên trái của cảnh tính năng; bt = thời điểm hiện từng gạch đầu dòng
function FS(id, t, bt) {
  const S = `#${id}`;
  kicker(`${S} .kk`, t + 0.1);
  words(`${S} .hd`, t + 0.2);
  $$(`${S} .bl p`).forEach((p, i) => {
    master.fromTo(p, { x: -24, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.6 }, bt[i]);
    master.fromTo($('.ck', p), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, bt[i] + 0.1);
    cue(bt[i], 'tick');
  });
}
function feat(id, t, o = {}) {
  const B = say(id, t, { lead: o.lead ?? 1.2, gap: o.gap ?? 0.45 });
  FS(id, t, o.bt ? o.bt(B) : [B[0].t + 0.1, B[0].t + B[0].d * 0.55, B[1].t + 0.1]);
  return B;
}

function F1(t) {
  const S = '#f1', W = Win(S, 'u04', { url: '/tong-quan' });
  W.in(t + 0.3);
  const B = feat('f1', t, { bt: (B) => [B.at(0, 'tổng lao động') - 0.2, B.at(0, 'thiết bị cần') - 0.2, B[1].t + 0.1] });
  const z = W.zoom(B[0].t - 0.1, [20, 4, 36, 30], 2.0);
  W.hl(z + 0.05, [20.6, 7.8, 35.4, 10.6], { t: 'Lao động & huấn luyện', n: '2' });
  const z1 = W.zoom(B.at(0, 'chứng chỉ sắp') - 0.45, [56, 4, 36, 30], 2.0, 0.8);
  W.hl(z1, [56.3, 7.8, 35.3, 10.6], { t: 'Chứng chỉ · Kiểm định · Tai nạn', n: '2' });
  const c = fc(S, B.at(0, 'tổng lao động'), { x: 650, y: 770, i: 'users', k: 'TỔNG LAO ĐỘNG', v: '<span>0</span> người', until: B[1].t + 0.2 });
  counter($('b span', c), 0, 36, B.at(0, 'tổng lao động') + 0.1, 1.2);
  fc(S, B.at(0, 'chứng chỉ sắp') + 0.5, { x: 1430, y: 196, i: 'calendar-clock', c: 'o', k: 'CHỨNG CHỈ SẮP HẾT HẠN', v: 'Báo trước 30 ngày', until: B[1].t + 0.2 });
  const z2 = W.zoom(B[1].t - 0.25, [20, 38, 72, 62], 1.6);
  W.hl(Math.max(z2, B.at(1, 'sáu nhóm') - 0.2), st(4, 4));
  W.hl(B.at(1, 'xu hướng'), st(4, 5));
  return B.end + 1.0;
}
function F2(t) {
  const S = '#f2', W = Win(S, 'u05', { url: '/tong-quan' });
  W.in(t + 0.3);
  const B = feat('f2', t, { gap: 0.55, bt: (B) => [B.at(0, 'thiết bị sắp') - 0.1, B.at(0, 'chứng chỉ hết') - 0.1, B[1].t + 0.1] });
  const T = Stack(S, 1400, 880);
  const a1 = B.at(0, 'thiết bị sắp') - 0.15, a2 = B.at(0, 'chứng chỉ hết') - 0.15, a3 = B.at(0, 'sự cố mới') - 0.15;
  W.hl(a1, st(5, 1));
  T(a1 + 0.3, { cls: 'r', i: 'triangle-alert', b: 'Thiết bị sắp quá hạn kiểm định', s: 'Cần lên lịch kiểm định' });
  W.hl(a2, st(5, 2));
  T(a2 + 0.3, { cls: 'o', i: 'calendar-clock', b: 'Chứng chỉ hết hạn trong 30 ngày', s: 'Sắp xếp huấn luyện lại' });
  W.hl(a3, st(5, 3), { pos: 'bi' });
  T(a3 + 0.3, { cls: 'a', i: 'siren', b: 'Sự cố mới được ghi nhận', s: 'Tai nạn & sự cố an toàn lao động' });
  T.clear(B[1].t - 0.35);
  const z = W.zoom(B[1].t - 0.3, [66, 62, 28, 34], 2.4);
  W.hl(z + 0.05, st(5, 6));
  W.click(Math.max(z + 0.5, B.at(1, 'đăng ký lớp')), 74.8, 85.3);
  W.click(B.at(1, 'thêm nhân sự'), 85.6, 85.3);
  W.click(B.at(1, 'báo cáo sự cố'), 74.8, 89.5);
  return B.end + 1.0;
}
function F3(t) {
  const S = '#f3', W1 = Win(S, 'u06', { url: '/bao-cao/doanh-nghiep' }), W2 = Win(S, 'u07', { url: '/bao-cao/nhan-su' });
  W1.in(t + 0.3);
  const B = feat('f3', t, { gap: 0.6, bt: (B) => [B.at(0, 'theo năm'), B[0].t + 0.1, B[1].t + 0.1] });
  W1.hl(B[0].t - 0.1, st(6, 3));
  const n = B.at(0, 'báo cáo nhân sự');
  W1.click(n, ...ctr(st(7, 1)));
  nav(n + 0.2, W1, W2);
  W2.hl(Math.max(n + 0.9, B.at(0, 'theo năm')), st(7, 2));
  const z = W2.zoom(B[1].t - 0.2, [48, 3, 45, 42], 1.8, 0.8);
  W2.hl(z, st(7, 4));
  const x = Math.max(z + 0.6, B.at(1, 'xuất ra') + 0.2);
  W2.click(x, 88.9, 11.6);
  toast(S, x + 0.3, { cls: 'dk', i: 'file-spreadsheet', b: 'Bao-cao-nhan-su.xlsx', s: 'Đã xuất file Excel', x: 1390, y: 872, snd: 'ding' });
  return B.end + 1.2;
}
function F4(t) {
  const S = '#f4', W1 = Win(S, 'u09', { url: '/doanh-nghiep/ho-so', w: 920, x: 835 }), W2 = Win(S, 'u10', { url: '/doanh-nghiep/operator' });
  W1.in(t + 0.3);
  const B = feat('f4', t, { gap: 0.65, bt: (B) => [B[0].t + 0.1, B[1].t + 0.1, B.at(1, 'cấp quyền')] });
  const z = W1.zoom(B[0].t - 0.2, [50, 30, 49, 70], 1.6);
  W1.hl(Math.max(z, B.at(0, 'thông tin liên hệ') - 0.3), st(9, 5));
  W1.hl(B.at(0, 'người đại diện'), st(9, 7));
  nav(B[1].t - 0.55, W1, W2);
  W2.hl(B[1].t + 0.2, st(10, 3));
  const z2 = W2.zoom(B.at(1, 'cấp quyền') - 0.35, [33, 37, 34, 46], 2.2, 0.8);
  W2.hl(z2, st(10, 4), { pos: 'in' });
  const k0 = Math.max(z2 + 0.25, B.at(1, 'vài cú') - 0.3), xs = [35.75, 51.25], ys = [44.5, 50.4, 56.1, 61.8, 67.7, 73.4, 79.3];
  const sz = (14 / 1524) * W2.w * W2.z.s;
  let k = 0;
  ys.forEach((yy) => xs.forEach((xx) => {
    const [px, py] = W2.pt(xx, yy), d = div('tk', W2.ov, '<i class="ic" data-i="check"></i>');
    d.style.cssText = `left:${(px - W2.x - sz / 2).toFixed(1)}px;top:${(py - W2.y - W2.bar - sz / 2).toFixed(1)}px;width:${sz.toFixed(1)}px;height:${sz.toFixed(1)}px;font-size:${(sz * 0.72).toFixed(1)}px`;
    const a = k0 + k * 0.075;
    master.fromTo(d, { opacity: 0, scale: 0.2 }, { opacity: 1, scale: 1, duration: 0.3, ease: 'back.out(2.6)' }, a);
    if (k % 3 === 0) cue(a, 'tick');
    k++;
  }));
  toast(S, k0 + 1.2, { i: 'shield-check', b: 'Đã cấp quyền theo từng phân hệ', s: 'Tài khoản vận hành sẵn sàng', x: 1390, y: 872 });
  return Math.max(B.end, k0 + 1.8) + 1.0;
}
function F5(t) {
  const S = '#f5', W1 = Win(S, 'u12', { url: '/dao-tao/khoa-hoc' }), W2 = Win(S, 'u13', { url: '/dao-tao/khoa-hoc/chi-tiet' });
  W1.in(t + 0.3);
  const B = feat('f5', t, { gap: 0.7, bt: (B) => [B[0].t + 0.1, B.at(1, 'học phần'), B.at(1, 'rồi đăng ký')] });
  const z = W1.zoom(B[0].t - 0.2, [15, 24, 82, 58], 1.5);
  W1.hl(z + 0.05, st(12, 4));
  fc(S, B.at(0, 'luôn có sẵn') - 0.4, { x: 650, y: 776, i: 'book-open-check', c: 'g', k: 'DANH MỤC ĐÀO TẠO', v: '19 khóa học', until: B[1].t + 0.6 });
  W1.click(B[1].t - 0.45, ...ctr(st(12, 5)));
  nav(B[1].t - 0.25, W1, W2);
  W2.hl(Math.max(B[1].t + 0.45, B.at(1, 'học phần')), st(13, 5));
  const r = B.at(1, 'rồi đăng ký') + 0.2;
  W2.hl(r - 0.1, st(13, 3), { rt: true });
  W2.click(r + 0.3, ...ctr(st(13, 3)));
  toast(S, r + 0.6, { i: 'graduation-cap', b: 'Đăng ký khóa học', s: 'Cho nhân sự của doanh nghiệp', x: 1390, y: 872, snd: 'ding' });
  return B.end + 1.4;
}
function F6(t) {
  const S = '#f6', W = Win(S, 'u14', { url: '/dao-tao/nhan-su' });
  const P = Win(S, 'u15', { over: W, x: 1250, y: 140, w: 520 });
  W.in(t + 0.3);
  const B = feat('f6', t, { gap: 0.8, bt: (B) => [B.at(0, 'sáu nhóm'), B[1].t + 0.2, B.at(1, 'đính kèm')] });
  const z = W.zoom(B[0].t - 0.3, [19, 5, 74, 32], 1.5);
  W.hl(z + 0.05, st(14, 2));
  fc(S, B.at(0, 'sáu nhóm') + 0.2, { x: 650, y: 776, i: 'users', k: 'PHÂN NHÓM THEO NĐ 44/2016/NĐ-CP', v: 'Nhóm 1 – 6', until: B[1].t });
  W.click(B.at(0, 'bấm vào') + 0.2, 61.6, 18.75);
  W.zoom(B[1].t - 0.75, null, 1, 0.6);
  W.click(B[1].t + 0.05, ...ctr(st(14, 4)));
  P.in(B[1].t + 0.3);
  P.hl(Math.max(B[1].t + 0.9, B.at(1, 'chọn nhóm')), st(15, 3), { left: true });
  P.hl(B.at(1, 'đính kèm'), st(15, 4), { left: true });
  return B.end + 1.3;
}
function F7(t) {
  const S = '#f7', W1 = Win(S, 'u17', { url: '/dao-tao/hop-dong', w: 1040, x: 775 }), W2 = Win(S, 'u18', { url: '/dao-tao/lop-hoc' });
  W1.in(t + 0.3);
  const B = feat('f7', t, { gap: 0.75, bt: (B) => [B.at(0, 'giá trị'), B.at(0, 'trạng thái'), B[1].t + 0.1] });
  const z = W1.zoom(B[0].t - 0.3, [32, 8, 66, 72], 1.4);
  W1.hl(Math.max(z, B.at(0, 'giá trị') - 0.2), st(17, 4));
  W1.hl(B.at(0, 'trạng thái'), st(17, 6));
  fc(S, B.at(0, 'minh bạch') - 0.3, { x: 650, y: 776, i: 'badge-check', c: 'g', k: 'TRẠNG THÁI THANH TOÁN', v: 'Đã thanh toán', until: B[1].t });
  nav(B[1].t - 0.6, W1, W2);
  const z2 = W2.zoom(B[1].t - 0.35, [15, 20, 31, 52], 2.0, 0.8);
  W2.hl(Math.max(z2, B.at(1, 'sĩ số') - 0.1), st(18, 5), { rt: false, left: true });
  const l = B.at(1, 'lịch từng buổi');
  W2.hl(l, st(18, 6), { pos: 'dn', left: true });
  W2.click(l + 0.6, ...ctr(st(18, 6)));
  return B.end + 1.3;
}
function F8(t) {
  const S = '#f8', W1 = Win(S, 'u23', { url: '/cong-tac/tin-tuc' }), W2 = Win(S, 'u25', { url: '/cong-tac/cong-viec' }), W3 = Win(S, 'u26', { chrome: false });
  W1.in(t + 0.3);
  const B = feat('f8', t, { gap: 0.7, bt: (B) => [B.at(0, 'kho thông tư'), B[1].t + 0.1, B.at(1, 'duyệt đơn')] });
  W1.hl(B.at(0, 'kho thông tư') - 0.1, st(23, 3));
  W1.hl(B.at(0, 'luôn được'), st(23, 5));
  nav(B[1].t - 0.6, W1, W2);
  const z = W2.zoom(B[1].t - 0.35, [31, 15, 37.5, 84], 1.6, 0.7);
  W2.hl(Math.max(z, B.at(1, 'theo nhóm') - 0.1), st(25, 4), { left: true });
  W2.hl(B.at(1, 'từng người'), st(25, 5));
  W2.hl(B.at(1, 'hạn chót') - 0.1, st(25, 3), { pos: 'dn' });
  const d = B.at(1, 'duyệt đơn') - 0.45;
  nav(d, W2, W3);
  const z3 = W3.zoom(d + 0.35, [15, 22, 82, 38], 1.4, 0.7);
  W3.hl(z3, st(26, 5), { pos: 'dn', rt: true });
  W3.hl(z3 + 0.6, st(26, 6));
  return B.end + 1.4;
}
function F9(t) {
  const S = '#f9', W = Win(S, 'u28', { url: '/an-toan/thiet-bi' });
  W.in(t + 0.3);
  const B = feat('f9', t, { gap: 0.55, bt: (B) => [B[0].t + 0.2, B[1].t + 0.1, B.at(1, 'nhãn đỏ')] });
  const z = W.zoom(B[0].t - 0.3, [17, 38, 79, 50], 2);
  W.hl(Math.max(z, B.at(0, 'ngày kiểm định') - 0.2), [62, 40.5, 13.5, 42.5], { t: 'Ngày kiểm định · Ngày hết hạn', n: '5' });
  W.zoom(B[1].t - 0.55, null, 1, 0.6);
  W.hl(B[1].t + 0.1, st(28, 3));
  fc(S, B[1].t + 0.4, { x: 1430, y: 196, i: 'bell-ring', c: 'o', k: 'SẮP HẾT HẠN (≤ 30 NGÀY)', v: 'Tự động cảnh báo', until: B.at(1, 'nhãn đỏ') - 0.2 });
  const z2 = W.zoom(B.at(1, 'nhãn đỏ') - 0.4, [55, 42, 42, 26], 2.2, 0.8);
  W.hl(z2, [69.3, 54.2, 16.5, 5.0], { t: 'Quá hạn kiểm định', n: '6', cls: 'r' });
  toast(S, z2 + 0.3, { cls: 'r', i: 'triangle-alert', b: 'Quá hạn kiểm định', s: 'Trạm biến áp 560kVA · TB-NM01-0004', x: 1390, y: 872, snd: 'alarm' });
  return B.end + 1.5;
}
function F10(t) {
  const S = '#f10', W = Win(S, 'u30', { url: '/an-toan/su-co' });
  const P = Win(S, 'u31', { over: W, x: 1400, y: 120, w: 340 });
  W.in(t + 0.3);
  const B = feat('f10', t, { lead: 1.4, gap: 0.6, bt: (B) => [B[0].t + 0.2, B.at(0, 'nguyên nhân'), B.at(0, 'người chịu')] });
  W.click(B[0].t - 0.3, ...ctr(st(30, 2)));
  P.in(B[0].t - 0.05);
  P.hl(B[0].t + 0.5, st(31, 1), { left: true });
  P.hl(B.at(0, 'nguyên nhân') - 0.1, st(31, 3), { left: true });
  P.hl(B.at(0, 'người chịu') - 0.1, st(31, 4), { left: true });
  P.out(B[1].t - 0.55);
  const z = W.zoom(B[1].t - 0.45, [66, 40, 30, 44], 2.4, 0.8);
  W.hl(z, st(30, 6), { pos: 'in', rt: true });
  toast(S, z + 0.3, { i: 'clipboard-check', b: 'Trạng thái: Đã khắc phục', s: 'Theo dõi đến khi xử lý xong', x: 1390, y: 872, snd: 'ding' });
  return B.end + 1.8;
}
function F11(t) {
  const S = '#f11', W1 = Win(S, 'u32', { url: '/an-toan/vat-tu' }), W2 = Win(S, 'u35', { url: '/an-toan/kho' });
  const P = Win(S, 'u36', { over: W1, x: 1200, y: 190, w: 600 });
  W1.in(t + 0.3);
  const B = feat('f11', t, { gap: 0.6, bt: (B) => [B[1].t + 0.1, B.at(1, 'phiếu nhập'), B.at(1, 'nhật ký')] });
  W1.hl(B[0].t + 0.1, st(32, 5));
  W1.hl(B.at(0, 'hóa chất'), st(32, 4), { pos: 'dn' });
  const z = W1.zoom(B[1].t - 0.5, [17, 24, 44, 30], 2.2, 0.8);
  W1.hl(z, st(32, 6), { pos: 'dn' });
  const ta = toast(S, z + 0.2, { cls: 'a', i: 'package', b: 'Màng BOPP còn 25 cuộn', s: 'Dưới ngưỡng tồn kho tối thiểu', x: 1390, y: 872, snd: 'alarm' });
  const p = B.at(1, 'phiếu nhập') - 0.3;
  P.in(p);
  P.hl(p + 0.5, st(36, 2), { left: true });
  const n = Math.max(p + 1.5, B.at(1, 'nhật ký') - 0.3);
  gone(ta, n);
  P.out(n);
  nav(n, W1, W2);
  W2.hl(n + 0.6, st(35, 3), { pos: 'bi' });
  W2.hl(n + 1.1, st(35, 4));
  return Math.max(B.end, n + 1.6) + 1.2;
}
function F12(t) {
  const S = '#f12', W = Win(S, 'u37', { url: '/an-toan/cap-phat-ppe' });
  const P = Win(S, 'u38', { over: W, x: 1250, y: 150, w: 520 });
  W.in(t + 0.3);
  const B = feat('f12', t, { gap: 0.8, bt: (B) => [B[0].t + 0.1, B.at(0, 'tự tính hạn'), B[1].t + 0.2] });
  W.hl(B[0].t, st(37, 6));
  W.click(B[0].t + 0.9, ...ctr(st(37, 2)));
  P.in(B[0].t + 1.15);
  const h = Math.max(B[0].t + 1.8, B.at(0, 'tự tính hạn'));
  P.hl(h, st(38, 5), { left: true });
  P.click(h + 0.5, 89.4, 62.6);
  P.out(B[1].t - 0.5);
  const z = W.zoom(B[1].t - 0.4, [40, 78, 36, 22], 2.0, 0.8);
  W.hl(z, st(37, 7));
  W.hl(z + 0.5, [53.6, 96.2, 6.6, 3.6], { t: 'Hết hạn → thu hồi, cấp mới', n: '7', cls: 'r' });
  toast(S, Math.max(z + 0.8, B.end + 0.1), { cls: 'r', i: 'hard-hat', b: 'Quá hạn 153 ngày', s: 'Cần thu hồi / cấp mới trang bị', x: 1390, y: 872, snd: 'alarm' }); // chuông báo sau câu đọc, không đè lời
  return B.end + 2.0;
}

// mô hình hợp tác Viện STP – DAKO (theo slide của Viện): hai đơn vị hai bên, bắt tay ở giữa, lợi ích doanh nghiệp bên dưới
function HP(t) {
  mark(t, 'sec_soft');
  const B = say('hp', t, { lead: 0.9, gap: 0.5 });
  kicker('#hp .kk', t + 0.1);
  words('#hp .hd', t + 0.2);
  const h = B.at(0, 'hợp tác'), a1 = B.at(0, 'Viện Ét Tê Pê') - 0.25, a2 = B.at(0, 'Đa Cô') - 0.25;
  pop('#hp .mid .hs', h - 0.15, { from: 0.3, ease: 'back.out(2.4)' });
  up(['#hp .mid b', '#hp .mid span'], h + 0.15, { y: 12, stagger: 0.12 });
  master.fromTo('#hp .mid .hs .ic', { rotation: 0 }, { keyframes: [{ rotation: -12, duration: 0.1 }, { rotation: 10, duration: 0.1 }, { rotation: -6, duration: 0.1 }, { rotation: 0, duration: 0.12 }], ease: 'none', immediateRender: false }, h + 0.4);
  cue(h - 0.15, 'pop');
  [['stp', a1, -60, 'l'], ['dk', a2, 60, 'r']].forEach(([k, a, dx, s2]) => {
    master.fromTo(`#hp .pc.${k}`, { x: dx, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.8 }, a);
    pop(`#hp .${k} .ph > i`, a + 0.25, { from: 0.3, ease: 'back.out(2.2)' });
    master.fromTo(`#hp .ln.${s2}`, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.out' }, a + 0.3);
    cue(a, 'swish');
  });
  const lnL = $('#hp .ln.l'), lnR = $('#hp .ln.r');
  UPD.push((tt) => { const v = ((tt * 42) % 14).toFixed(1); lnL.style.backgroundPosition = `${-v}px 0`; lnR.style.backgroundPosition = `${v}px 0`; });
  const b1 = B[1].t, b2 = B.at(1, 'Đa Cô') - 0.15, e2 = B[1].t + B[1].d;
  const items = (sel, a0, a1_, dx) => $$(sel).forEach((li, i) => {
    const a = a0 + i * Math.max(0.22, (a1_ - a0 - 0.3) / 4);
    master.fromTo(li, { x: dx, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.55 }, a);
    master.fromTo($('.ic', li), { scale: 0 }, { scale: 1, duration: 0.45, ease: 'back.out(2.5)' }, a + 0.05);
    cue(a, 'tick');
  });
  items('#hp .stp li', b1, b2, -24);
  items('#hp .dk li', b2, e2, 24);
  master.fromTo('#hp .dn', { y: 40, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, B[2].t - 0.35);
  const SP = $$('#hp .dn span'), EM = $$('#hp .dn em');
  const P = ['giải pháp toàn diện', 'tuân thủ', 'giảm rủi ro', 'phát triển bền vững'].map((p) => B.at(2, p) - 0.1);
  P.forEach((a, i) => {
    master.fromTo(SP[i], { y: 12, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45 }, a);
    if (i) master.fromTo(EM[i - 1], { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.3 }, a - 0.1);
    flashOn(SP[i], a, i < 3 ? P[i + 1] : B.end + 1.4);
    cue(a, 'tick');
  });
  return B.end + 1.4;
}

function S4(t) {
  const B = say('s4', t, { lead: 0.9 });
  kicker('#s4 .kk', t + 0.1);
  words('#s4 .hd', t + 0.2);
  const ST = $$('#s4 .st'), A = $$('#s4 .ar');
  ['đăng nhập', 'thêm nhân sự', 'khai báo thiết bị'].forEach((p, i) => {
    const a = B.at(0, p) - 0.25;
    master.fromTo(ST[i], { y: 60, autoAlpha: 0, scale: 0.94 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, a);
    cue(a, 'tick');
    if (i) master.fromTo(A[i - 1], { x: -20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, a - 0.15);
  });
  const r = B[1].t - 0.1;
  pop('#s4 .rest', r, { from: 0.7, dur: 0.7 });
  master.fromTo('#s4 .rest .ic', { rotation: 0 }, { keyframes: [{ rotation: -18, duration: 0.08 }, { rotation: 16, duration: 0.08 }, { rotation: -10, duration: 0.08 }, { rotation: 0, duration: 0.1 }], ease: 'none', immediateRender: false }, r + 0.5);
  cue(r, 'ding');
  [toast('#s4', r + 0.6, { cls: 'o', i: 'calendar-clock', b: 'Chứng chỉ sắp hết hạn', s: 'Nhắc trước 30 ngày', x: 0, y: 930 }),
    toast('#s4', r + 0.95, { cls: 'r', i: 'triangle-alert', b: 'Thiết bị đến hạn kiểm định', s: 'Cảnh báo tự động', x: 0, y: 930 }),
    toast('#s4', r + 1.3, { cls: 'a', i: 'hard-hat', b: 'PPE hết hạn sử dụng', s: 'Nhắc thu hồi, cấp mới', x: 0, y: 930 }),
  ].forEach((e, i) => { e.style.left = `${Math.round([450, 960, 1470][i] - e.offsetWidth / 2)}px`; });
  return Math.max(B.end, r + 1.6) + 1.6;
}

function S5(t) {
  mark(t + 0.3, 'sec_end');
  const B = say('s5', t, { lead: 0.9, gap: 0.5 });
  pop('#s5 .qm', t + 0.1, { from: 0.4 });
  words('#s5 .l1', B[0].t - 0.1);
  words('#s5 .l2', B.at(0, 'nhưng') - 0.05);
  // hai logo Viện STP – DAKO cạnh nhau, hiện đúng lúc đọc tên từng đơn vị
  const b = B[1].t - 0.15, d = B.at(1, 'Đa Cô') - 0.2;
  master.fromTo('#s5 .brand .b1', { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, b);
  pop('#s5 .brand .sep', d, { from: 0.2, ease: 'back.out(2.6)' });
  master.fromTo('#s5 .brand .b2', { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, d + 0.1);
  cue(b, 'pop'); cue(d + 0.1, 'pop');
  up('#s5 .ct > div', B.at(1, 'tư vấn') - 0.25, { y: 30, stagger: 0.12 });
  cue(B.at(1, 'tư vấn') - 0.25, 'swish');
  pop('#s5 .cta', B.at(1, 'hướng dẫn') - 0.1, { from: 0.8 });
  cue(B.at(1, 'hướng dẫn') - 0.1, 'ding');
  return B.end + 3.6;
}

/* ================= GHÉP CẢNH ================= */
const LOG = [];
const L = (n, f) => (...a) => { const v = f(...a); LOG.push([n, +a[0].toFixed(2), +v.toFixed(2)]); return v; };
const FN = [F1, F2, F3, F4, F5, F6, F7, F8, F9, F10, F11, F12];
function build() {
  let t, x;
  t = L('S1', S1)(0);
  x = zoomCut(t, '#s1', '#s2'); t = L('S2', S2)(x);
  x = toLight(t, '#s2', '#s3'); t = L('S3', S3)(x);
  let prev = '#s3';
  FN.forEach((fn, i) => {
    const id = `#f${i + 1}`;
    x = slide(t, prev, id);
    if (i === 0) {
      mark(x, 'sec_main');
      show('#rail', x); master.fromTo('#rail', { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.5, immediateRender: false }, x + 0.1);
    }
    if (i === 0 || F[i].m !== F[i - 1].m) rail(x + 0.1, F[i].m);
    t = L(`F${i + 1}`, fn)(x);
    prev = id;
  });
  x = slide(t, prev, '#hp');
  master.fromTo('#rail', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, t);
  t = L('HP', HP)(x);
  x = slide(t, '#hp', '#s4'); t = L('S4', S4)(x);
  master.fromTo('#bug', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, t);
  x = toDark(t, '#s4', '#s5'); t = L('S5', S5)(x);
  finishHL();
  const FXG = $('#fx').getContext('2d');
  UPD.push((tt) => { FXG.clearRect(0, 0, 1920, 1080); FX.forEach((f) => { if (tt >= f.t0 && tt <= f.t1) f.fn(FXG, tt); }); });
  master.set({}, {}, t);
  return t;
}

async function loadIcons() {
  const list = $$('.ic[data-i]').filter((e) => !e.firstChild), names = [...new Set(list.map((e) => e.dataset.i))], map = {};
  await Promise.all(names.map(async (n) => { const r = await fetch(`node_modules/lucide-static/icons/${n}.svg`); if (!r.ok) throw new Error('missing icon ' + n); map[n] = await r.text(); }));
  list.forEach((e) => { e.innerHTML = map[e.dataset.i]; });
}

(async () => {
  VO = await (await fetch('vo.json')).json();
  BOX = await (await fetch('assets/boxes.json')).json();
  buildDOM();
  await loadIcons();
  await document.fonts.ready;
  const waitImgs = async () => {
    await Promise.all($$('img').map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = r; }))));
    await Promise.all($$('img').map((i) => i.decode().catch(() => {})));
  };
  await waitImgs();
  const dur = build();
  await loadIcons(); // biểu tượng trong cửa sổ, thông báo, thẻ nổi tạo trong build
  await waitImgs();  // ảnh chụp màn hình tạo trong build
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
