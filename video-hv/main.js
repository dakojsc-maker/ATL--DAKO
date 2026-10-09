/* Viện STP – Hướng dẫn sử dụng cho học viên (video giới thiệu có thuyết minh).
   Mở đầu tối (câu hỏi của học viên) → thương hiệu Viện STP × DAKO → lộ trình 2 phần · 11 màn hình →
   Phần 01 cổng đào tạo (3 màn hình) → Phần 02 tài khoản học viên (8 màn hình) → 3 bước bắt đầu → kết.
   Ảnh chụp thật của phần mềm (assets/ui/hNN.jpg, NN = số trang trong tài liệu), khung cam đánh số đúng theo các bước
   của tài liệu (assets/boxes.json), phóng to, con trỏ bấm, gõ chữ vào ô nhập, thẻ nổi và thông báo.
   Toàn bộ chạy trên một GSAP timeline dừng sẵn; render tất định qua window.__seek(t). */
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
const SZ = { h04: [1034, 549], h05: [1038, 545], h06: [1029, 550], h08: [1025, 551], h09: [1034, 550], h10: [1037, 552], h11: [1519, 815], h12: [555, 897], h13: [1519, 803], h14: [1519, 801], h15: [1519, 808] };
const st = (sl, n) => BOX[sl].steps.find((s) => s.n === n);
const ctr = (b) => [b.box[0] + b.box[2] / 2, b.box[1] + b.box[3] / 2];
const HLS = [];
function Win(sc, src, o = {}) {
  const S = el(sc), [iw, ih] = SZ[src], w = o.w ?? 1090, bar = o.chrome && !o.over ? 44 : 0;
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
  const W = { e, ov, cv, x, y, w, vh, bar, sh, iw, z: { s: 1, tx: 0, ty: 0 }, zEnd: 0, act: [] };
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
  // gõ chữ vào ô nhập: phủ nền trắng lên chữ gợi ý, chữ hiện dần kèm con trỏ nhấp nháy (cỡ chữ fs tính theo px ảnh gốc)
  W.type = (at, b, text, o2 = {}) => {
    const [X, Y, Wd, Ht] = W.rect(b), k = (w / iw) * W.z.s, d = o2.dur ?? Math.max(0.6, text.length * 0.055);
    const e2 = div('ty', W.ov);
    e2.style.cssText = `left:${X.toFixed(1)}px;top:${Y.toFixed(1)}px;width:${Wd.toFixed(1)}px;height:${Ht.toFixed(1)}px;font-size:${((o2.fs ?? 9) * k).toFixed(1)}px;padding:${((o2.py ?? 0) * k).toFixed(1)}px ${((o2.px ?? 6) * k).toFixed(1)}px;align-items:${o2.top ? 'flex-start' : 'center'};background:${o2.bg ?? '#fff'}`;
    const sp = div('', e2);
    master.fromTo(e2, { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.15, ease: 'none' }, at - 0.15);
    UPD.push((t) => {
      let s;
      if (t < at) s = '';
      else if (t >= at + d) s = text + (t < at + d + 1.2 && Math.floor(t * 3) % 2 ? '|' : '');
      else s = text.slice(0, Math.floor(((t - at) / d) * text.length)) + '|';
      if (sp.textContent !== s) sp.textContent = s;
    });
    cue(at, 'type');
    W.act.push({ h: e2, end: Infinity }); HLS.push(W.act[W.act.length - 1]);
    return at + d;
  };
  W.in = (at) => {
    if (o.over && o.drawer) {
      master.fromTo(sh, { opacity: 0 }, { opacity: 1, duration: 0.4, ease: 'none', immediateRender: false }, at);
      master.fromTo(e, { autoAlpha: 0, x: 160 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out', immediateRender: false }, at);
      cue(at, 'swish');
    } else if (o.over) {
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
// mở đầu: ba câu hỏi quen thuộc của học viên → một câu trả lời
function S1(t) {
  show('#s1', 0);
  const R = rng(11), bl = $('#s1 .blurs'), cards = [];
  const cls = ['', 'or', 'gn', '', 'bl', 'or', '', 'gn', 'bl', '', 'or', '', 'gn', 'bl'];
  for (let i = 0; i < 14; i++) {
    const c = div(`blur ${cls[i]}`, bl, '<i></i><i style="width:60%"></i><i style="width:40%"></i>');
    const w = 180 + R() * 220, h = 110 + R() * 120;
    c.style.cssText = `left:${(R() * 1780 - 60).toFixed(0)}px;top:${(R() * 980 - 40).toFixed(0)}px;width:${w.toFixed(0)}px;height:${h.toFixed(0)}px`;
    cards.push({ c, ax: 20 + R() * 40, ay: 14 + R() * 30, w: 0.15 + R() * 0.25, p: R() * 6.28, r: (R() - 0.5) * 10 });
  }
  UPD.push((tt) => cards.forEach((k) => { k.c.style.transform = `translate(${(Math.sin(tt * k.w + k.p) * k.ax).toFixed(1)}px,${(Math.cos(tt * k.w * 0.8 + k.p) * k.ay - tt * 6).toFixed(1)}px) rotate(${k.r.toFixed(1)}deg)`; }));
  master.fromTo(bl, { opacity: 0 }, { opacity: 1, duration: 1.6, ease: 'none' }, 0);
  const B = say('s1', t, { lead: 0.9, gap: 0.5 });
  const Q = $$('#s1 .q');
  ['Lịch học', 'Bài thi', 'Chứng chỉ'].forEach((p, i) => {
    const a = B.at(0, p) - 0.15;
    master.fromTo(Q[i], { y: 40, autoAlpha: 0, scale: 0.9 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.6, ease: 'back.out(1.7)' }, a);
    master.fromTo($('.ic', Q[i]), { scale: 0, rotation: -40 }, { scale: 1, rotation: 0, duration: 0.5, ease: 'back.out(2.4)' }, a + 0.1);
    cue(a, 'pop');
  });
  const x1 = B[1].t - 0.3;
  master.fromTo('#s1 .qs', { y: 0, opacity: 1, scale: 1 }, { y: -60, opacity: 0, scale: 0.92, duration: 0.45, ease: 'power2.in', immediateRender: false }, x1);
  words('#s1 .m1', B[1].t);
  words('#s1 .m2', B.at(1, 'nằm gọn') - 0.05);
  cue(B.at(1, 'nằm gọn'), 'ding');
  return B.end + 0.8;
}

function S2(t) {
  mark(t, 'downbeat');
  const hero = $('#s2 .hero'), H = [
    { src: 'h08', x: 500, y: 742, w: 920, r: 0 },
    { src: 'h04', x: 50, y: 812, w: 660, r: 16 },
    { src: 'h14', x: 1210, y: 812, w: 660, r: -16 },
  ];
  const hw = H.map((h) => { const d = div('hw', hero, `<img src="assets/ui/${h.src}.jpg" alt="">`); d.style.cssText = `left:${h.x}px;top:${h.y}px;width:${h.w}px`; return d; });
  const B = say('s2', t, { lead: 1.0 });
  // logo Viện STP hiện giữa, rồi dịch sang trái nhường chỗ cho logo DAKO (đúng lúc đọc tên DAKO)
  const sh = 145, dk = B.at(1, 'Công ty Đa Cô') - 0.3;
  master.fromTo('#s2 .duo .stp', { x: sh, scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.9, ease: 'back.out(2.2)' }, t + 0.05);
  master.fromTo('#s2 .duo .stp', { x: sh }, { x: 0, duration: 0.7, ease: 'power3.inOut', immediateRender: false }, dk);
  pop('#s2 .duo .x', dk + 0.3, { from: 0.2, ease: 'back.out(2.6)' });
  master.fromTo('#s2 .duo .dako', { x: -40, scale: 0.3, autoAlpha: 0 }, { x: 0, scale: 1, autoAlpha: 1, duration: 0.85, ease: 'back.out(2.2)' }, dk + 0.25);
  cue(dk + 0.15, 'pop');
  kicker('#s2 .kk', t + 0.45);
  words('#s2 .t1', B[0].t + 0.2);
  words('#s2 .t2', B.at(0, 'trực tuyến') - 0.1);
  up('#s2 .url span', B[1].t + 0.2, { y: 20, stagger: 0.12 });
  const hx = B[1].t + 0.4;
  hw.forEach((d, i) => master.fromTo(d, { autoAlpha: 0, y: 380, rotationX: 38, rotationY: H[i].r, transformPerspective: 1600, transformOrigin: '50% 0%' },
    { autoAlpha: 1, y: 0, rotationX: 22, rotationY: H[i].r * 0.6, duration: 1.3, ease: 'power3.out' }, hx + [0, 0.15, 0.25][i]));
  master.fromTo(hw, { yPercent: 0 }, { yPercent: -6, duration: Math.max(0.5, B.end + 1.4 - hx - 1.3), ease: 'none', immediateRender: false }, hx + 1.3);
  cue(hx, 'whoosh');
  return B.end + 1.4;
}

// lộ trình: phần 01 (3 màn hình) và phần 02 (8 màn hình)
function S3(t) {
  mark(t, 'sec_tension');
  show('#bug', t); master.fromTo('#bug', { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.5, immediateRender: false }, t + 0.3);
  const B = say('s3', t, { lead: 0.8, gap: 0.45 });
  kicker('#s3 .kk', t + 0.1);
  words('#s3 .hd', t + 0.2);
  master.fromTo('#s3 .pt', { y: 70, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.15 }, B[0].t + 0.1);
  cue(B[0].t + 0.1, 'swish');
  const a1 = B.at(1, 'Phần một') - 0.1, a2 = B.at(1, 'Phần hai') - 0.1;
  flashOn('#s3 .p1', a1, a2); flashOn('#s3 .p2', a2, B.end + 1.0);
  [[a1, '#s3 .p1 li'], [a2, '#s3 .p2 li']].forEach(([a, sel]) => {
    master.fromTo(sel, { x: -18, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.45, stagger: 0.07 }, a);
    cue(a, 'tick');
  });
  return B.end + 1.0;
}

/* ---------- 11 màn hình ---------- */
const PARTS = ['Cổng đào tạo Viện STP', 'STP Learner Portal'];
const F = [
  { id: 'p1', m: 0, n: '01', k: 'TRANG CHỦ · ĐĂNG NHẬP & TRA CỨU', h: ['Đăng nhập dễ dàng,', 'tra cứu minh bạch.'], b: ['Truy cập daotao.vienstp.com', 'Đăng nhập tài khoản được cấp', 'Tra cứu theo mã bằng hoặc CCCD'] },
  { id: 'p2', m: 0, n: '02', k: 'KHÓA HỌC NỔI BẬT · GÓC TRI THỨC', h: ['Chọn khóa học', 'phù hợp với bạn.'], b: ['Nhóm ATVSLĐ, số học viên, thời lượng', 'Xem chi tiết & đăng ký', 'Cẩm nang, quy định pháp luật mới'] },
  { id: 'p3', m: 0, n: '03', k: 'VĂN PHÒNG & LIÊN HỆ HỖ TRỢ', h: ['Luôn có người', 'đồng hành cùng bạn.'], b: ['Hotline 0827.695.368', 'Email viencongnghestp@gmail.com', 'Hà Nội · Nha Trang · TP. Hồ Chí Minh'] },
  { id: 'p4', m: 1, n: '04', k: 'TRANG CHỦ HỌC VIÊN', h: ['Mọi thứ về việc học', 'trên một màn hình.'], b: ['Lớp đang học, bài thi, chứng chỉ', 'Lịch học, mã lớp – bấm Vào học', 'Chứng chỉ đã đạt luôn sẵn sàng'] },
  { id: 'p5', m: 1, n: '05', k: 'TRANG BỊ BẢO HỘ LAO ĐỘNG', h: ['Đồ bảo hộ của bạn,', 'luôn rõ hạn dùng.'], b: ['Còn hạn · Sắp hết hạn (≤ 30 ngày)', 'Xin cấp mới, báo hỏng / cấp đổi', 'Theo dõi phiếu đến khi được duyệt'] },
  { id: 'p6', m: 1, n: '06', k: 'BÁO CÁO SỰ CỐ', h: ['Thấy nguy cơ,', 'báo ngay.'], b: ['Bấm + Báo cáo sự cố', 'Tự gắn tên người báo cáo', 'Chờ xử lý → Đã khắc phục'] },
  { id: 'p7', m: 1, n: '07', k: 'YÊU CẦU NHÂN SỰ · TẠO ĐƠN', h: ['Gửi đơn từ', 'ngay trên phần mềm.'], b: ['Nghỉ phép, trợ cấp, xét lương…', 'Ghi lý do, đính kèm minh chứng', 'Chuyển thẳng tới lãnh đạo duyệt'] },
  { id: 'p9', m: 1, n: '09', k: 'TIN TỨC & TÀI LIỆU', h: ['Kiến thức an toàn', 'luôn cập nhật.'], b: ['Tin tức · Thông tư/Nghị định · Tài liệu', 'Tìm kiếm theo từ khóa', 'Nguồn chính thống từ Viện STP'] },
  { id: 'p10', m: 1, n: '10', k: 'CÔNG VIỆC CỦA TÔI', h: ['Việc được giao,', 'rõ ràng hạn chót.'], b: ['Cần làm · Đang làm · Chờ duyệt · Làm lại', 'Mức ưu tiên & trạng thái', 'Đồng hồ đếm ngược hạn chót'] },
  { id: 'p11', m: 1, n: '11', k: 'HỒ SƠ CÁ NHÂN', h: ['Hồ sơ của bạn,', 'do bạn cập nhật.'], b: ['Ảnh đại diện, điện thoại, chức vụ', 'Đổi mật khẩu bảo mật', 'Bấm Lưu thay đổi'] },
];
function buildDOM() {
  F.forEach((f) => {
    const s = document.createElement('section'); s.id = f.id; s.className = 'scene fs';
    s.innerHTML = `<div class="kk"><b>${f.n}</b>${f.k}</div>`
      + `<div class="hd">${f.h[0]}<br><span class="ac">${f.h[1]}</span></div>`
      + `<div class="bl">${f.b.map((x) => `<p><span class="ck"><i class="ic" data-i="check"></i></span>${x}</p>`).join('')}</div>`;
    $('#feat').appendChild(s);
  });
  const r = div('', null); r.id = 'rail';
  r.innerHTML = PARTS.map((m, i) => `<span><em>0${i + 1}</em>${m}</span>`).join('');
  $('#stage').insertBefore(r, $('#fx'));
}
function rail(at, m) {
  $$('#rail span').forEach((s, i) => master.set(s, { attr: { class: i === m ? 'on' : i < m ? 'dn' : '' } }, at));
  if (m >= 0) master.fromTo($$('#rail span')[m], { scale: 0.9 }, { scale: 1, duration: 0.4, ease: 'back.out(2.5)', immediateRender: false }, at);
}
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
  const B = say(id, t, { lead: o.lead ?? 1.2, gap: o.gap ?? 0.5 });
  FS(id, t, o.bt ? o.bt(B) : [B[0].t + 0.1, B[0].t + B[0].d * 0.55, B[1].t + 0.1]);
  return B;
}
const TX = 1390, TY = 880; // vị trí thông báo (dưới-phải cửa sổ)

// 01 · trang chủ: đăng nhập & tra cứu chứng chỉ (gõ mã chứng chỉ, mã xác thực, bấm Tra cứu ngay)
function P1(t) {
  const S = '#p1', W = Win(S, 'h04');
  W.in(t + 0.3);
  const B = feat('p1', t, { bt: (B) => [B[0].t + 0.1, B.at(0, 'bấm Đăng nhập'), B.at(1, 'tra cứu')] });
  W.hl(B[0].t + 0.1, st(4, 1), { pos: 'dn' });
  const z = W.zoom(B.at(0, 'điện thoại') - 0.2, [55, 6, 45, 22], 2.0, 0.8);
  W.hl(Math.max(z, B.at(0, 'bấm Đăng nhập') - 0.3), st(4, 4), { pos: 'dn', rt: true });
  W.click(B.at(0, 'bấm Đăng nhập') + 0.25, 82.0, 12.8);
  const z2 = W.zoom(B[1].t - 0.35, [50, 15, 36, 47], 2.0, 0.8);
  W.hl(z2, st(4, 5), { rt: true });
  const k = W.type(Math.max(z2 + 0.4, B.at(1, 'theo mã bằng') - 0.1), [53.6, 33.4, 29.4, 3.4], 'DAKO-N1-01/2026', { fs: 8.5 });
  const k2 = W.type(Math.max(k + 0.25, B.at(1, 'căn cước') + 0.2), [77.8, 43.4, 4.4, 3.8], '98348', { fs: 8.5, px: 4 });
  const c = Math.max(k2 + 0.3, B.at(1, 'xác thực') - 0.2);
  W.hl(c - 0.25, st(4, 7), { pos: 'dn', rt: true });
  W.click(c + 0.2, 68.2, 54.6);
  toast(S, c + 0.55, { i: 'shield-check', b: 'Đang xác thực chứng chỉ…', s: 'Kết quả hiển thị sau khi xác thực bảo mật', x: TX, y: TY, snd: 'ding' });
  return Math.max(B.end, c + 1.4) + 1.0;
}
// 02 · khóa học nổi bật & góc tri thức
function P2(t) {
  const S = '#p2', W = Win(S, 'h05');
  W.in(t + 0.3);
  const B = feat('p2', t, { bt: (B) => [B.at(0, 'xem số học viên'), B.at(0, 'Xem chi tiết'), B[1].t + 0.1] });
  const z = W.zoom(B[0].t - 0.2, [14, 18, 72, 50], 1.6);
  W.hl(z + 0.05, st(5, 2), { pos: 'in' });
  fc(S, B.at(0, 'xem số học viên'), { x: 650, y: 776, i: 'users', c: 'g', k: 'NHÓM 4 · HUẤN LUYỆN ATVSLĐ', v: '29 học viên · 16 giờ', until: B[1].t });
  const d = B.at(0, 'Xem chi tiết');
  W.hl(d - 0.2, st(5, 4), { pos: 'dn' });
  W.click(d + 0.45, 26.0, 61.7);
  const z2 = W.zoom(B[1].t - 0.35, [14, 74, 72, 26], 1.6, 0.8);
  W.hl(z2, st(5, 5), { pos: 'in' });
  return B.end + 1.1;
}
// 03 · hệ thống văn phòng & liên hệ hỗ trợ
function P3(t) {
  const S = '#p3', W = Win(S, 'h06');
  W.in(t + 0.3);
  const B = feat('p3', t, { bt: (B) => [B.at(0, 'Gọi'), B.at(0, 'gửi thư'), B[1].t + 0.1] });
  const z = W.zoom(B[0].t - 0.2, [14, 20, 72, 38], 1.6);
  W.hl(Math.max(z, B.at(0, 'Gọi') - 0.3), st(6, 1), { pos: 'dn' });
  fc(S, B.at(0, 'Gọi') + 0.2, { x: 650, y: 776, i: 'phone', c: 'o', k: 'HOTLINE HỖ TRỢ', v: '0827.695.368' });
  W.hl(B[1].t, st(6, 2), { pos: 'in', rt: true });
  ['Hà Nội', 'Nha Trang', 'Thành phố'].forEach((p) => cue(B.at(1, p), 'tick'));
  const z2 = W.zoom(B.end - 0.2, [10, 60, 80, 40], 1.4, 0.8);
  W.hl(z2, st(6, 3), { pos: 'in' });
  return Math.max(B.end, z2) + 1.4;
}
// mở đầu phần 02: thanh menu học viên, các mục sáng theo lời đọc
function PP(t) {
  const B = say('pp', t, { lead: 0.9, gap: 0.45 });
  up('#pp .no', t + 0.05, { y: 40, dur: 0.9 });
  kicker('#pp .kk', t + 0.15);
  words('#pp .hd', t + 0.25);
  up('#pp .sub', B[0].t + 0.6, { y: 16 });
  pop('#pp .chip', B[0].t + 1.0, { from: 0.8 });
  master.fromTo('#pp .menu', { x: 80, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.9 }, t + 0.4);
  master.fromTo('#pp .mi, #pp .ms', { x: 20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4, stagger: 0.05 }, t + 0.7);
  const MI = $$('#pp .mi'), P = ['học tập', 'bảo hộ', 'sự cố', 'đơn từ', 'công việc'].map((p) => B.at(1, p) - 0.1);
  P.forEach((a, i) => {
    MI.filter((m) => m.dataset.k === String(i + 1)).forEach((m) => flashOn(m, a, i < 4 ? P[i + 1] : B.end + 1.2, 'hi'));
    cue(a, 'tick');
  });
  return B.end + 1.2;
}
// 04 · trang chủ học viên
function P4(t) {
  const S = '#p4', W = Win(S, 'h08');
  W.in(t + 0.3);
  const B = feat('p4', t, { bt: (B) => [B.at(0, 'số lớp'), B[1].t + 0.1, B[2].t + 0.1] });
  const z = W.zoom(B[0].t - 0.2, [20, 15, 72, 30], 1.6);
  W.hl(z + 0.05, st(8, 3));
  W.hl(B.at(0, 'bài thi sắp tới'), st(8, 4), { pos: 'dn' });
  const z2 = W.zoom(B[1].t - 0.35, [20, 44, 20, 42], 2.2, 0.8);
  W.hl(z2, st(8, 6), { rt: false, left: true });
  const v = B.at(1, 'bấm Vào học');
  W.hl(v - 0.1, st(8, 7), { pos: 'dn', left: true });
  W.click(v + 0.35, 29.4, 78.6);
  toast(S, v + 0.6, { i: 'circle-play', b: 'Vào học', s: 'Mở bài giảng của lớp đang học', x: TX, y: TY });
  const z3 = W.zoom(B[2].t - 0.35, [20, 82, 72, 18], 1.6, 0.8);
  W.hl(z3, st(8, 8), { pos: 'in' });
  W.click(Math.max(z3 + 0.5, B.at(2, 'chứng chỉ đã đạt') + 0.3), 88.7, 92.7);
  return B.end + 1.2;
}
// 05 · trang bị bảo hộ lao động (PPE)
function P5(t) {
  const S = '#p5', W = Win(S, 'h09');
  W.in(t + 0.3);
  const B = feat('p5', t, { bt: (B) => [B.at(0, 'còn hạn'), B[1].t + 0.1, B.at(1, 'theo dõi phiếu')] });
  const z = W.zoom(B[0].t - 0.2, [20, 14, 72, 30], 1.6);
  W.hl(Math.max(z, B.at(0, 'hạn sử dụng') - 0.3), st(9, 2), { pos: 'dn', until: B[1].t - 0.1 });
  fc(S, B.at(0, 'sắp hết hạn'), { x: 650, y: 776, i: 'bell-ring', c: 'o', k: 'SẮP HẾT HẠN (≤ 30 NGÀY)', v: 'Nhắc trước cho bạn', until: B[1].t + 0.2 });
  const c = B.at(1, 'cấp mới');
  W.hl(c - 0.2, st(9, 3), { pos: 'dn', rt: true });
  W.click(c + 0.3, 85.5, 21.1);
  W.hl(B.at(1, 'báo hỏng') - 0.1, st(9, 4), { rt: true });
  const p = B.at(1, 'theo dõi phiếu');
  W.hl(p - 0.1, st(9, 5), { pos: 'dn', left: true });
  W.click(p + 0.4, 35.3, 38.5);
  return B.end + 1.2;
}
// 06 · báo cáo sự cố
function P6(t) {
  const S = '#p6', W = Win(S, 'h10');
  W.in(t + 0.3);
  const B = feat('p6', t, { bt: (B) => [B.at(0, 'Bấm Báo cáo'), B[1].t + 0.1, B.at(1, 'khắc phục')] });
  const z = W.zoom(B[0].t - 0.3, [28, 15, 56, 56], 2.0);
  const c = Math.max(z + 0.2, B.at(0, 'Bấm Báo cáo') - 0.1);
  W.hl(c - 0.2, st(10, 2), { pos: 'dn', rt: true });
  W.click(c + 0.4, 77.9, 21.0);
  toast(S, B.at(0, 'gửi ngay'), { cls: 'r', i: 'siren', b: 'Báo cáo sự cố đã gửi', s: 'Doanh nghiệp tiếp nhận và cập nhật xử lý', x: TX, y: TY, until: B[1].t + 1.0 });
  W.hl(B[1].t, st(10, 3), { left: true });
  W.hl(B.at(1, 'theo dõi'), st(10, 4), { pos: 'dn', left: true });
  fc(S, B.at(1, 'khắc phục') - 0.1, { x: 650, y: 776, i: 'circle-check', c: 'g', k: 'TRẠNG THÁI XỬ LÝ', v: 'Chờ xử lý → Đã khắc phục' });
  return B.end + 1.3;
}
// 07–08 · yêu cầu nhân sự → ngăn kéo "Tạo yêu cầu" trượt ra (chọn mẫu, gõ lý do, đính kèm, gửi)
function P7(t) {
  const S = '#p7', W = Win(S, 'h11');
  const P = Win(S, 'h12', { over: W, drawer: true, x: 1320, w: 500 });
  W.in(t + 0.3);
  const B = feat('p7', t, { lead: 1.3, bt: (B) => [B[0].t + 0.1, B.at(1, 'ghi lý do'), B.at(1, 'chuyển thẳng')] });
  W.hl(B[0].t - 0.4, st(11, 2), { pos: 'dn', rt: true });
  W.click(B[0].t + 0.1, 88.1, 21.0);
  P.in(B[0].t + 0.35);
  P.hl(Math.max(B[0].t + 1.0, B.at(0, 'nghỉ phép') - 0.1), st(12, 1), { left: true, pos: 'in' });
  const r = B.at(1, 'ghi lý do');
  P.hl(r - 0.2, st(12, 3), { left: true });
  P.type(r + 0.1, [5.2, 55.3, 91.5, 7.0], 'Đề nghị hỗ trợ chi phí khóa huấn luyện ATVSLĐ', { fs: 11, top: true, py: 6, px: 8, dur: 1.4 });
  const a = B.at(1, 'đính kèm');
  P.hl(a - 0.1, st(12, 4), { left: true });
  P.click(a + 0.3, 11.7, 82.3);
  const g = B.at(1, 'bấm Gửi');
  P.hl(g - 0.25, st(12, 5), { rt: true });
  P.click(g + 0.2, ...ctr(st(12, 5)));
  toast(S, B.at(1, 'chuyển thẳng'), { i: 'send', b: 'Đã gửi yêu cầu', s: 'Chuyển tới lãnh đạo doanh nghiệp phê duyệt', x: 720, y: TY, snd: 'ding' });
  return B.end + 1.4;
}
// 09 · tin tức & tài liệu (lọc theo chủ đề, gõ từ khóa tìm kiếm)
function P9(t) {
  const S = '#p9', W = Win(S, 'h13');
  W.in(t + 0.3);
  const B = feat('p9', t, { gap: 0.6, bt: (B) => [B[0].t + 0.1, B.at(0, 'chủ đề'), B[1].t + 0.1] });
  const z = W.zoom(B[0].t - 0.3, [20, 14, 72, 52], 1.6);
  W.hl(Math.max(z, B.at(0, 'nghị định') - 0.3), st(13, 2), { pos: 'dn', left: true });
  W.click(B.at(0, 'chủ đề') + 0.1, 25.0, 38.5);
  W.hl(B[1].t - 0.2, st(13, 3), { rt: true });
  W.type(B[1].t + 0.2, [33.0, 27.0, 40, 2.8], 'Nghị định 44/2016', { fs: 9, px: 8, dur: 1.0 });
  W.hl(B[1].t + 1.2, st(13, 4), { pos: 'in', rt: true });
  return B.end + 2.0;
}
// 10 · công việc của tôi
function P10(t) {
  const S = '#p10', W = Win(S, 'h14');
  W.in(t + 0.3);
  const B = feat('p10', t, { bt: (B) => [B.at(0, 'cần làm'), B[1].t + 0.1, B.at(1, 'đồng hồ')] });
  const z = W.zoom(B[0].t - 0.3, [20, 16, 72, 38], 1.6);
  W.hl(Math.max(z, B.at(0, 'trạng thái') - 0.2), st(14, 2), { pos: 'in' });
  W.click(B.at(0, 'đang làm') + 0.1, 32.7, 50.1);
  const z2 = W.zoom(B[1].t - 0.35, [20, 52, 38, 22], 2.2, 0.8);
  W.hl(z2, st(14, 5), { left: true });
  W.hl(B.at(1, 'hạn chót'), st(14, 6), { pos: 'dn', left: true });
  fc(S, B.at(1, 'đồng hồ'), { x: 650, y: 776, i: 'timer', c: 'o', k: 'THỜI HẠN · CÒN LẠI', v: '18 giờ' });
  return B.end + 1.4;
}
// 11 · hồ sơ cá nhân
function P11(t) {
  const S = '#p11', W = Win(S, 'h15');
  W.in(t + 0.3);
  const B = feat('p11', t, { gap: 0.6, bt: (B) => [B.at(0, 'ảnh đại diện'), B[1].t, B.at(1, 'Lưu')] });
  const z = W.zoom(B[0].t - 0.3, [33, 26, 47, 70], 1.6);
  W.hl(Math.max(z, B[0].t + 0.1), st(15, 2), { left: true, until: B[1].t - 0.3 });
  W.click(B.at(0, 'ảnh đại diện') + 0.2, 43.1, 38.9);
  W.hl(B.at(0, 'số điện thoại'), st(15, 5), { rt: true, until: B[1].t - 0.3 });
  W.hl(B[1].t - 0.2, st(15, 4), { pos: 'dn', rt: true });
  W.click(B[1].t + 0.3, 62.7, 30.1);
  const l = B.at(1, 'Lưu');
  W.hl(l - 0.2, st(15, 6), { rt: true });
  W.click(l + 0.35, 73.1, 92.0);
  toast(S, l + 0.65, { i: 'circle-check', b: 'Đã lưu thay đổi', s: 'Hồ sơ học viên được cập nhật', x: TX, y: TY, snd: 'ding' });
  return B.end + 1.8;
}

function S4(t) {
  mark(t, 'sec_soft');
  const B = say('s4', t, { lead: 0.9 });
  kicker('#s4 .kk', t + 0.1);
  words('#s4 .hd', t + 0.2);
  const ST = $$('#s4 .st'), A = $$('#s4 .ar');
  ['truy cập', 'đăng nhập', 'bấm Vào học'].forEach((p, i) => {
    const a = B.at(0, p) - 0.25;
    master.fromTo(ST[i], { y: 60, autoAlpha: 0, scale: 0.94 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.7, ease: 'back.out(1.6)' }, a);
    cue(a, 'tick');
    if (i) master.fromTo(A[i - 1], { x: -20, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, a - 0.15);
  });
  const r = B[1].t - 0.1;
  pop('#s4 .rest', r, { from: 0.7, dur: 0.7 });
  cue(r, 'ding');
  [toast('#s4', r + 0.6, { i: 'calendar-days', b: 'Lịch học', s: 'Ngày học, mã lớp', x: 0, y: 930 }),
    toast('#s4', r + 0.9, { cls: 'o', i: 'file-pen-line', b: 'Bài thi', s: 'Lịch kiểm tra sắp tới', x: 0, y: 930 }),
    toast('#s4', r + 1.2, { cls: 'a', i: 'award', b: 'Chứng chỉ', s: 'Xem chứng nhận đã đạt', x: 0, y: 930 }),
  ].forEach((e, i) => { e.style.left = `${Math.round([560, 960, 1360][i] - e.offsetWidth / 2)}px`; });
  return Math.max(B.end, r + 1.5) + 1.5;
}

function S5(t) {
  mark(t + 0.3, 'sec_end');
  const B = say('s5', t, { lead: 0.9, gap: 0.5 });
  kicker('#s5 .kk', t + 0.2);
  words('#s5 .l1', B[0].t - 0.1);
  words('#s5 .l2', B.at(0, 'Chứng nhận') - 0.1);
  const b = B[1].t - 0.15, d = B.at(1, 'Đa Cô') - 0.2;
  master.fromTo('#s5 .brand .b1', { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, b);
  pop('#s5 .brand .sep', d, { from: 0.2, ease: 'back.out(2.6)' });
  master.fromTo('#s5 .brand .b2', { x: 40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7 }, d + 0.1);
  cue(b, 'pop'); cue(d + 0.1, 'pop');
  pop('#s5 .cta', B.at(1, 'chúc') - 0.1, { from: 0.8 });
  cue(B.at(1, 'chúc'), 'ding');
  up('#s5 .ct > div', B.end + 0.2, { y: 30, stagger: 0.12 });
  cue(B.end + 0.2, 'swish');
  return B.end + 4.0;
}

/* ================= GHÉP CẢNH ================= */
const LOG = [];
const L = (n, f) => (...a) => { const v = f(...a); LOG.push([n, +a[0].toFixed(2), +v.toFixed(2)]); return v; };
const FN = { p1: P1, p2: P2, p3: P3, p4: P4, p5: P5, p6: P6, p7: P7, p9: P9, p10: P10, p11: P11 };
function build() {
  let t, x;
  t = L('S1', S1)(0);
  x = zoomCut(t, '#s1', '#s2'); t = L('S2', S2)(x);
  x = toLight(t, '#s2', '#s3'); t = L('S3', S3)(x);
  let prev = '#s3';
  const seq = ['p1', 'p2', 'p3', 'pp', 'p4', 'p5', 'p6', 'p7', 'p9', 'p10', 'p11'];
  seq.forEach((id, i) => {
    x = slide(t, prev, `#${id}`);
    if (i === 0) {
      mark(x, 'sec_main');
      show('#rail', x); master.fromTo('#rail', { autoAlpha: 0, y: -16 }, { autoAlpha: 1, y: 0, duration: 0.5, immediateRender: false }, x + 0.1);
      rail(x + 0.1, 0);
    }
    if (id === 'pp') rail(x + 0.1, 1);
    t = L(id.toUpperCase(), id === 'pp' ? PP : FN[id])(x);
    prev = `#${id}`;
  });
  x = slide(t, prev, '#s4');
  master.fromTo('#rail', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, t);
  t = L('S4', S4)(x);
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
  await loadIcons();
  await waitImgs();
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
