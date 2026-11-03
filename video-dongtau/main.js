/* Viện STP × DAKO – Tư vấn đào tạo ATVSLĐ cho doanh nghiệp đóng tàu & cảng biển (video animation có thuyết minh).
   Kịch bản: Mở đầu → 4 đặc thù ngành → 8 nguy cơ tai nạn (nhịp dồn dập) → bước ngoặt → 3 lời khuyên →
   nhóm huấn luyện theo vị trí → giải pháp Viện STP × DAKO → kết. Nội dung chuyên môn theo tài liệu "Tư vấn ngành đóng tàu".
   Hình vẽ ở art.js; chữ, thẻ, chuyển cảnh trên GSAP timeline dừng sẵn; render tất định qua window.__seek(t). */
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
  curOff(at);
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
  curOff(at);
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




function lit(sel, at, cls = 'on') { // bật trạng thái (class) từ thời điểm at
  els(sel).forEach((e) => { const base = e.getAttribute('class'); master.set(e, { attr: { class: `${base} ${cls}` } }, at); });
}

/* ================= DỰNG CẢNH ================= */
const ICON = (n) => `<i class="ic" data-i="${n}"></i>`;
function sec(id, cls = '') { let s = document.getElementById(id); if (!s) { s = document.createElement('section'); s.id = id; $('#scenes').appendChild(s); } s.className = `scene ${cls}`; return s; }
function camSvg(S, svg) { // khung "camera": hình SVG + canvas hạt, biến đổi cùng nhau
  const cam = div('cam', S, svg); const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; cam.appendChild(cv);
  return { cam, cv, svg: cam.querySelector('svg') };
}
const visible = (S) => S.style.visibility === 'visible';
function wavesOn(S) { const f = wavesUpd(S); UPD.push((t) => { if (visible(S)) f(t); }); }
function shakeCam(cam, at, d = 0.45, amp = 22) {
  master.fromTo(cam, { x: 0, y: 0 }, { keyframes: Array.from({ length: 8 }, (_, i) => ({ x: (hash(i, at * 10) - 0.5) * amp * 2 * (1 - i / 8), y: (hash(i + 9, at * 10) - 0.5) * amp * 2 * (1 - i / 8), duration: d / 9 })).concat([{ x: 0, y: 0, duration: d / 9 }]), ease: 'none', immediateRender: false }, at);
}
function redPulse(at, a = 1, d = 0.9) { master.fromTo('#redv', { opacity: 0 }, { keyframes: [{ opacity: a, duration: 0.08 }, { opacity: 0, duration: d }], ease: 'none', immediateRender: false }, at); }
function whiteFlash(at, a = 0.85, d = 0.5) { master.fromTo('#flash', { opacity: 0 }, { keyframes: [{ opacity: a, duration: 0.05 }, { opacity: 0, duration: d }], ease: 'none', immediateRender: false }, at); }
function cutTo(at, prev, next) { // cắt nhanh giữa các cảnh nguy cơ: lia ngang + chớp
  master.fromTo(prev, { x: 0, opacity: 1 }, { x: -260, opacity: 0, duration: 0.22, ease: 'power2.in', immediateRender: false }, at);
  hide(prev, at + 0.23); show(next, at + 0.12);
  master.fromTo(next, { x: 260 }, { x: 0, duration: 0.32, ease: 'power3.out', immediateRender: false }, at + 0.12);
  cue(at, 'whoosh');
  return at + 0.2;
}
function fadeTo(at, prev, next, d = 0.8) {
  show(next, at); master.fromTo(next, { opacity: 0 }, { opacity: 1, duration: d, ease: 'none', immediateRender: false }, at);
  hide(prev, at + d); cue(at, 'swish');
  return at + d * 0.6;
}
// đi bộ: chân tay đung đưa trong [t0, t1]
function walk(id, t0, t1, sp = 9, amp = 26) {
  const W = $(`#${id}`);
  [['.lg.l .j', 1], ['.lg.r .j', -1], ['.ar.l .j', -0.8], ['.ar.r .j', 0.8]].forEach(([s, k]) => tr($(s, W)).fn(t0, t1, (u) => ({ r: Math.sin(u * sp) * amp * k })));
  tr(W.querySelector('.bd')).fn(t0, t1, (u) => ({ y: -Math.abs(Math.sin(u * sp)) * 5 }));
}
const J = (id, part) => $(`#${id} .${part.replace(' ', '.')} .j`);

/* ---------- 1 · MỞ ĐẦU ---------- */
function H(t) {
  const S = sec('h'); show(S, 0);
  const { cam, cv } = camSvg(S, yard('yn', NIGHT));
  div('shade', S); div('big center l1', S, 'Giữa thép, nước và độ cao'); div('big center l2', S, '…là một môi trường làm việc <span class="a">đầy khắc nghiệt.</span>');
  wavesOn(S);
  const B = say('h', t, { lead: 1.4, gap: 0.55 });
  const end = B.end + 1.0;
  master.fromTo(cam, { scale: 1.2, yPercent: 3 }, { scale: 1.04, yPercent: 0, duration: end, ease: 'power1.out' }, 0);
  master.fromTo(S, { opacity: 0 }, { opacity: 1, duration: 1.2, ease: 'none' }, 0);
  tr('#yn-trolley').to(0.6, 5.5, { x: 300 }, 'io');
  $$('#h .cone').forEach((c, i) => tr(c).fn(0, end, (u) => ({ o: -0.25 + 0.25 * Math.sin(u * 2.2 + i * 2) })));
  sparks(cv, 760, 612, 0.9, 3.2, { seed: 1, rate: 50, a: -1.0, spread: 1.8, v: 330 });
  sparks(cv, 1050, 560, 3.0, 6.0, { seed: 4, rate: 50, a: -2.2, spread: 1.6, v: 330 });
  sparks(cv, 600, 650, 5.4, end, { seed: 8, rate: 40, a: -1.4, spread: 1.6, v: 300 });
  words('#h .l1', B[0].t + 0.2, { stagger: 0.07 });
  words('#h .l2', B[1].t, { stagger: 0.06 });
  cue(0.05, 'waves'); cue(0.6, 'crane'); cue(1.0, 'weld'); cue(3.8, 'clang'); cue(B[1].t + 0.2, 'hit');
  return end;
}

/* ---------- 2 · ĐẶC THÙ NGÀNH ---------- */
function cardSvg(i) {
  const bg = R(0, 0, 400, 300, ['#13263F', '#152438', '#162236', '#14263C'][i]);
  if (i === 0) { // thời tiết: mây, sét, mưa, sóng, tàu nhỏ chòng chành
    const rainL = []; for (let x = -40; x < 440; x += 26) for (let y = -60; y < 300; y += 40) rainL.push(Ln(x, y, x - 8, y + 22, 'rgba(180,210,240,.5)', 2));
    return h('svg', { viewBox: '0 0 400 300' }, [bg,
      g({ id: 'c1-rn' }, rainL.join('')),
      P('M226 40 L196 116 L224 116 L200 188 L262 96 L232 96 L256 40 Z', '#FFE27A', { id: 'c1-lb', opacity: 0 }),
      g({ id: 'c1-cl' }, [C(110, 60, 52, '#2E4562'), C(170, 46, 64, '#334C6B'), C(240, 64, 50, '#2E4562'), C(300, 52, 58, '#334C6B'), R(60, 60, 300, 50, '#2E4562')]),
      g({ id: 'c1-bt', transform: 'translate(200 214)' }, [P('M-70 0 L70 0 L52 30 L-52 30 Z', '#C4473E'), R(-30, -34, 54, 34, '#E8EEF4'), R(-12, -56, 14, 22, '#2F5A86')]),
      P('', '#1D4E7A', { class: 'wv2', 'data-y': 236, 'data-a': 10 }), P('', '#163D63', { class: 'wv2', 'data-y': 258, 'data-a': 8 }),
    ].join(''));
  }
  if (i === 1) { // mặt cắt thân tàu: két, hầm; giàn giáo trên cao
    return h('svg', { viewBox: '0 0 400 300' }, [bg,
      P('M150 40 L380 40 L380 250 Q380 280 350 280 L180 280 Q150 280 150 250 Z', '#3D5675'),
      R(170, 60, 190, 90, '#0D1826'), R(170, 170, 90, 90, '#0D1826'), R(272, 170, 88, 90, '#0D1826', { stroke: '#F26A1B', 'stroke-width': 4, 'stroke-dasharray': '10 6', id: 'c2-tk' }),
      T(316, 222, 'KÉT', { 'text-anchor': 'middle', 'font-size': 20, 'font-weight': 800, fill: '#F26A1B', 'font-family': 'Be Vietnam Pro' }),
      P('M300 210 L360 196 L360 240 Z', '#FFE9A8', { id: 'c2-bm', opacity: 0.35 }),
      g({ transform: 'translate(296 258) scale(.24)' }, worker('c2w', { helmet: '#FFC21A' })),
      ...[30, 70, 110].map((x) => Ln(x, 70, x, 290, '#8AA2BA', 4)), ...[100, 170, 240].map((y) => Ln(30, y, 110, y, '#8AA2BA', 4)),
      R(26, 92, 88, 8, '#B07D3A'),
      g({ transform: 'translate(70 92) scale(.26)' }, worker('c2w2', { helmet: '#F26A1B', harness: true })),
      Ln(126, 92, 126, 290, '#FFC21A', 3, { 'stroke-dasharray': '6 5' }), T(134, 196, '≥ 2 m', { 'font-size': 18, 'font-weight': 800, fill: '#FFC21A', 'font-family': 'Be Vietnam Pro' }),
    ].join(''));
  }
  if (i === 2) { // thiết bị: cẩu, móc, tổng đoạn đung đưa; đồng hồ áp lực; điện
    return h('svg', { viewBox: '0 0 400 300' }, [bg,
      R(0, 26, 300, 16, '#C7922A'), R(20, 42, 40, 22, '#7A5A1A'),
      g({ id: 'c3-ld', transform: 'translate(150 42)' }, [Ln(0, 0, 0, 120, '#AEB8C4', 3), R(-16, 120, 32, 22, '#FFC21A', { rx: 4 }), Ln(0, 142, -60, 180, '#AEB8C4', 2), Ln(0, 142, 60, 180, '#AEB8C4', 2), P('M-80 180 L80 180 L66 238 L-66 238 Z', '#6B88A8')]),
      C(320, 118, 46, '#E8EEF4'), C(320, 118, 38, '#1A2533'), P('M290 140 A38 38 0 0 1 350 140', 'none', { stroke: '#E5484D', 'stroke-width': 6 }),
      g({ id: 'c3-nd', transform: 'translate(320 118)' }, [Ln(0, 0, 0, -30, '#FFC21A', 4), C(0, 0, 5, '#FFC21A')]),
      P('M330 196 L306 236 L322 236 L308 272 L346 222 L330 222 L344 196 Z', '#FFC21A'),
    ].join(''));
  }
  // nhà thầu phụ: nhiều tổ đội, mũ khác màu, ra vào liên tục
  const heads = (cols, y, k) => { const o = []; for (let j = 0; j < 14; j++) { const x = j * 58, c = cols[j % cols.length]; o.push(g({ transform: `translate(${x} ${y})` }, [R(-16, 8, 32, 40, '#2A4A78', { rx: 10 }), C(0, 0, 13, '#EDB98F'), P('M-16 -3 A16 16 0 0 1 16 -3 Z', c), R(-19, -4, 38, 5, c, { rx: 2 })])); } return g({ id: `c4-r${k}` }, o.join('')); };
  return h('svg', { viewBox: '0 0 400 300' }, [bg,
    heads(['#FFC21A', '#F26A1B', '#E8EEF4', '#3B82F6', '#22C55E'], 90, 1), heads(['#E8EEF4', '#FFC21A', '#EF4444', '#F26A1B'], 190, 2),
    R(0, 248, 400, 52, '#0E1B2C'),
    g({ transform: 'translate(24 262)' }, [R(0, 0, 112, 30, '#2E4562', { rx: 15 }), T(56, 21, 'Tổ đội A', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#fff', 'font-family': 'Be Vietnam Pro' })]),
    g({ transform: 'translate(146 262)' }, [R(0, 0, 124, 30, '#2E4562', { rx: 15 }), T(62, 21, 'Nhà thầu B', { 'text-anchor': 'middle', 'font-size': 15, 'font-weight': 700, fill: '#fff', 'font-family': 'Be Vietnam Pro' })]),
    g({ id: 'c4-n3', transform: 'translate(334 277)' }, [R(-52, -15, 104, 30, '#F26A1B', { rx: 15 }), T(0, 6, 'Nhóm 3', { 'text-anchor': 'middle', 'font-size': 16, 'font-weight': 800, fill: '#fff', 'font-family': 'Be Vietnam Pro' })]),
  ].join(''));
}
function D(t) {
  const S = sec('d');
  const { cam } = camSvg(S, yard('yd', NIGHT));
  div('dim', S);
  div('kk dk', S, '<b>4</b>ĐẶC THÙ NGÀNH ĐÓNG TÀU – CẢNG BIỂN');
  div('hd wt', S, 'Nơi rủi ro <span class="ac">luôn thường trực.</span>');
  const TT = [['Môi trường khắc nghiệt', 'Ngoài trời, trên mặt nước, ca kíp liên tục; gió bão, sóng, nắng nóng'],
    ['Không gian phức tạp', 'Hầm, két, bồn bể chật hẹp; trên boong, mạn tàu, giàn giáo cao'],
    ['Thiết bị nguy hiểm cao', 'Cẩu, cổng trục, thiết bị áp lực, điện, hóa chất, hàn cắt kim loại'],
    ['Nhiều nhà thầu phụ', 'Tổ đội khoán biến động mạnh; phần lớn lao động thuộc Nhóm 3']];
  const cards = TT.map(([b, p], i) => { const c = div('tc', S, cardSvg(i) + `<div class="no">0${i + 1}</div><b>${b}</b><p>${p}</p>`); c.style.left = `${100 + i * 440}px`; return c; });
  const wv2 = $$('.wv2', cards[0]);
  UPD.push((tt) => { if (!visible(S)) return; wv2.forEach((w, k) => { const y = +w.dataset.y, am = +w.dataset.a; let d = `M-10 ${y}`; for (let xx = 0; xx <= 410; xx += 20) d += ` L${xx} ${(y + Math.sin(xx / 40 + tt * 2.4 + k) * am).toFixed(1)}`; w.setAttribute('d', d + ' L410 310 L-10 310 Z'); }); });
  master.fromTo(cam, { scale: 1.06 }, { scale: 1.0, duration: 22, ease: 'none' }, t);
  const B = say('d', t, { lead: 1.4, gap: 0.5 });
  kicker('#d .kk', t + 0.2); words('#d .hd', t + 0.35);
  tr('#c1-rn').fn(t, B.end + 2, (u) => ({ y: (u * 420) % 40 }));
  tr('#c1-cl').fn(t, B.end + 2, (u) => ({ x: Math.sin(u * 0.8) * 14 }));
  tr('#c1-bt', { x: 200, y: 214 }).fn(t, B.end + 2, (u) => ({ r: Math.sin(u * 2.2) * 9, y: Math.sin(u * 2.2 + 1) * 5 }));
  const lb = tr('#c1-lb', { o: 0 }); [0.6, 1.9, 3.3].forEach((k) => { const a = B[0].t + k; lb.set(a, { o: 1 }).set(a + 0.07, { o: 0.2 }).set(a + 0.12, { o: 1 }).set(a + 0.22, { o: 0 }); });
  tr('#c2-bm', { o: 0.35 }).fn(t, B.end + 2, (u) => ({ o: 0.15 * Math.sin(u * 7) }));
  tr('#c3-ld', { x: 150, y: 42 }).fn(t, B.end + 2, (u) => ({ r: Math.sin(u * 2.4) * 12 }));
  tr('#c3-nd', { x: 320, y: 118 }).fn(t, B.end + 2, (u) => ({ r: 40 + Math.sin(u * 9) * 18 + Math.sin(u * 23) * 6 }));
  tr('#c4-r1').fn(t, B.end + 2, (u) => ({ x: -((u * 70) % 290) }));
  tr('#c4-r2').fn(t, B.end + 2, (u) => ({ x: -232 + ((u * 55) % 232) }));
  tr('#c4-n3', { x: 334, y: 277 }).fn(t, B.end + 2, (u) => ({ s: 0.06 * Math.max(0, Math.sin(u * 5)) }));
  cards.forEach((c, i) => {
    const a = B[i].t - 0.35;
    master.fromTo(c, { y: 90, autoAlpha: 0, rotationX: 18, transformPerspective: 1400 }, { y: 0, autoAlpha: 1, rotationX: 0, duration: 0.8, ease: 'power3.out' }, a);
    flashOn(c, B[i].t - 0.1, i < 3 ? B[i + 1].t - 0.1 : B.end + 1.2);
    cue(a, 'swish');
  });
  cue(B[0].t, 'storm'); cue(B[1].t + 0.3, 'clang'); cue(B[2].t, 'crane'); cue(B[2].t + 1.2, 'weld'); cue(B[3].t, 'steps');
  return B.end + 1.2;
}

/* ---------- 3 · NGUY CƠ ---------- */
const HZ = [
  ['NGÃ CAO', 'Boong, mạn tàu, giàn giáo · từ 2 m trở lên', 'arrow-down-to-line'],
  ['RƠI XUỐNG NƯỚC', 'Mép cầu tàu · buộc, cởi dây tàu', 'waves'],
  ['VẬT RƠI · VA CHẠM · KẸP', 'Nâng hạ, cẩu lắp tổng đoạn, hạ thủy', 'construction'],
  ['GIAO THÔNG NỘI BỘ', 'Xe đầu kéo, xe nâng và người đi bộ', 'truck'],
  ['NGẠT KHÍ', 'Hầm hàng, két dầu, két ballast, bồn bể', 'cylinder'],
  ['CHÁY NỔ · HÓA CHẤT', 'Hàn cắt, hơi xăng dầu, bình khí áp lực', 'flame'],
  ['ĐIỆN GIẬT · HỒ QUANG', 'Trạm điện, máy hàn trong khoang ẩm', 'zap'],
  ['MÔI TRƯỜNG · QUÁ SỨC', 'Khói hàn, bụi, ồn, vật nặng > 30 kg, ca kíp', 'weight'],
];
function vig(k, inner, defs = '') {
  const S = sec(`r${k}`);
  const ref = camSvg(S, svgWrap(inner, defs));
  div('dim2', S); div('band t', S);
  div('hz', S, `<div class="no">0${k}</div><div><b>${HZ[k - 1][0]}</b><span>${HZ[k - 1][1]}</span></div>`);
  div('hzp', S, Array.from({ length: 8 }, (_, i) => `<i class="${i < k ? 'on' : ''}"></i>`).join(''));
  return { S, ...ref };
}
function hzIn(S, at) {
  master.fromTo($('.hz .no', S), { scale: 0, rotation: -30 }, { scale: 1, rotation: 0, duration: 0.45, ease: 'back.out(2.2)' }, at);
  master.fromTo($('.hz b', S), { x: -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4 }, at + 0.08);
  master.fromTo($('.hz span', S), { x: -30, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.4 }, at + 0.18);
  master.fromTo($('.band', S), { scaleX: 0, transformOrigin: '0% 50%' }, { scaleX: 1, duration: 0.35, ease: 'power2.out' }, at);
  cue(at, 'stamp');
}
const night = (id, a = '#07101D', b = '#1C2E46') => lin(id, [[0, a], [1, b]]);

function R0(t) {
  const S = sec('r0');
  div('big center', S, 'Chỉ một phút <span class="r">lơ là…</span>');
  div('sub center mono', S, '8 NGUY CƠ TAI NẠN THƯỜNG GẶP');
  mark(t, 'sec_tension');
  const B = say('r0', t, { lead: 0.35 });
  words('#r0 .big', t + 0.15, { stagger: 0.08 });
  master.fromTo('#r0 .sub', { autoAlpha: 0, letterSpacing: '0.6em' }, { autoAlpha: 1, letterSpacing: '0.3em', duration: 0.8 }, B.end + 0.1);
  [0.25, 0.75].forEach((k) => { master.fromTo('#r0 .big', { scale: 1 }, { scale: 1.05, duration: 0.09, yoyo: true, repeat: 1, ease: 'power1.out', immediateRender: false }, t + k); redPulse(t + k, 0.55, 0.4); });
  cue(t + 0.25, 'heart'); cue(B.end + 0.1, 'hit');
  return B.end + 1.0;
}
function R1(t) { // ngã cao từ giàn giáo
  const scaf = [700, 900, 1100, 1300].map((x) => Ln(x, 280, x, 980, '#7B8FA8', 10)).join('') + [300, 480, 660, 840].map((y) => Ln(690, y, 1310, y, '#7B8FA8', 8) + R(690, y - 16, 460, 16, '#B07D3A')).join('')
    + [[700, 480, 900, 300], [900, 660, 1100, 480], [1100, 840, 1300, 660], [700, 840, 900, 660]].map(([a, b, c, d]) => Ln(a, b, c, d, '#5E718A', 5)).join('');
  const V = vig(1, [R(0, 0, 1920, 1080, 'url(#r1s)'),
    R(-20, 100, 660, 900, '#3A4F68'), ...[100, 210, 320, 430, 540].map((x) => Ln(x, 100, x, 1000, 'rgba(0,0,0,.25)', 3)), R(-20, 820, 660, 180, '#7A2A2C'), Ln(-20, 560, 640, 560, 'rgba(0,0,0,.25)', 3),
    scaf, g({ id: 'r1-pk', transform: 'translate(1150 292)' }, R(0, -8, 160, 16, '#B07D3A')),
    R(0, 980, 1920, 100, '#1F2A36'), R(0, 978, 1920, 10, 'url(#r1st)'),
    g({ id: 'r1-dm' }, [Ln(1430, 300, 1430, 978, '#FFC21A', 5, { 'stroke-dasharray': '16 10' }), P('M1430 300 l-16 28 l32 0 z', '#FFC21A'), P('M1430 978 l-16 -28 l32 0 z', '#FFC21A'),
      R(1370, 600, 120, 64, '#FFC21A', { rx: 12 }), T(1430, 644, '≥ 2 m', { 'text-anchor': 'middle', 'font-size': 36, 'font-weight': 900, fill: '#141414', 'font-family': 'Be Vietnam Pro' })]),
    worker('r1w', { x: 930, y: 284, s: 1.15 }),
  ].join(''), night('r1s') + stripes('r1st', '#FFC21A', '#141414', 14));
  const B = say('r1', t, { lead: 0.35 });
  hzIn(V.S, t + 0.05);
  const k0 = B.end - 1.15, w = tr('#r1w', { x: 930, y: 284, s: 1.15 }); // khoảnh khắc trượt chân sát cuối câu đọc
  walk('r1w', t + 0.15, k0 + 0.05);
  w.to(t + 0.15, k0 - t - 0.1, { x: 1170 }, 'lin');
  tr('#r1-pk', { x: 1150, y: 292 }).to(k0, 0.3, { r: 34 }, 'in');
  w.to(k0 + 0.1, 0.25, { r: 25, x: 1215 }, 'in').to(k0 + 0.35, 0.7, { y: 1300, r: 95, x: 1300 }, 'in');
  [['ar l', -165], ['ar r', -150]].forEach(([p, r]) => tr(J('r1w', p)).to(k0 + 0.1, 0.2, { r }, 'out'));
  master.fromTo('#r1-dm', { opacity: 0 }, { opacity: 1, duration: 0.3 }, t + 0.6);
  shakeCam(V.cam, k0 + 0.1, 0.4, 14); redPulse(k0 + 0.85, 1, 0.9); shakeCam(V.cam, k0 + 0.85, 0.5, 26);
  cue(k0 + 0.02, 'clang'); cue(k0 + 0.2, 'whoosh'); cue(k0 + 0.85, 'hit');
  return k0 + 1.2 + 0.6;
}
function R2(t) { // rơi xuống nước khi buộc dây tàu
  const V = vig(2, [R(0, 0, 1920, 1080, 'url(#r2s)'),
    P('M0 560 L300 540 L620 556 L900 530 L1200 548 L1920 520 L1920 700 L0 700 Z', '#1B2A40'),
    P('M1120 240 L1960 240 L1960 760 L1180 760 Q1120 520 1120 240 Z', '#2E3F55'), P('M1150 640 L1960 640 L1960 760 L1180 760 Z', '#7A2A2C'), R(1120, 228, 840, 16, '#24354A'), C(1236, 420, 14, '#1A2533'),
    R(900, 690, 1020, 390, '#123150'),
    g({ class: 'sea' }, Array.from({ length: 5 }, (_, i) => P('', 'none', { class: 'wv', 'data-y': 720 + i * 70, 'data-a': 7 + i * 2, stroke: 'rgba(150,200,240,.3)', 'stroke-width': 3 })).join('')),
    R(-10, 640, 910, 440, '#5B6675'), R(-10, 640, 910, 14, 'url(#r2st)'), ...[120, 360, 600].map((x) => Ln(x, 660, x, 1080, 'rgba(0,0,0,.18)', 3)),
    bollard(760, 642, '#232B36'),
    P('', 'none', { id: 'r2-rp', stroke: '#E9D9A6', 'stroke-width': 9, 'stroke-linecap': 'round' }),
    worker('r2w', { x: 850, y: 640, s: 1.1 }),
  ].join(''), night('r2s', '#0B1626', '#30405C') + stripes('r2st', '#FFC21A', '#141414', 10));
  wavesOn(V.S);
  const B = say('r2', t, { lead: 0.35 });
  hzIn(V.S, t + 0.05);
  const snap = Math.max(t + 1.05, B.end - 0.9), rp = $('#r2-rp');
  UPD.push((tt) => { if (!visible(V.S)) return; const k = clamp01((tt - snap) / 0.12), wob = tt < snap ? Math.sin(tt * 6) * 14 : Math.sin((tt - snap) * 40) * 18 * Math.exp(-(tt - snap) * 5); const cy = 690 - 200 * k + wob; rp.setAttribute('d', `M760 610 Q1000 ${cy.toFixed(1)} 1236 420`); });
  const w = tr('#r2w', { x: 850, y: 640, s: 1.1 });
  [['ar l', -70], ['ar r', -62]].forEach(([p, r]) => tr(J('r2w', p), { r }).fn(t, snap, (u) => ({ r: Math.sin(u * 6) * 8 })));
  w.to(t, 0.6, { r: -10 }, 'out');
  w.to(snap, 0.35, { r: 38, x: 945 }, 'in').to(snap + 0.35, 0.4, { y: 800, x: 1010, r: 85 }, 'in').to(snap + 0.72, 0.12, { o: 0 }, 'lin');
  [['ar l', -170], ['ar r', -150]].forEach(([p, r]) => tr(J('r2w', p)).to(snap + 0.05, 0.2, { r }, 'out'));
  splash(V.cv, 1010, 700, snap + 0.72, { n: 90 });
  shakeCam(V.cam, snap, 0.3, 10); redPulse(snap + 0.75, 0.8, 0.8);
  cue(t + 0.1, 'waves'); cue(snap, 'whoosh'); cue(snap + 0.72, 'splash');
  return Math.max(B.end, snap + 1.3) + 0.6;
}
function R3(t) { // tổng đoạn treo trên móc cẩu lắc mạnh, kẹp người
  const cols = [180, 560, 1360, 1740].map((x) => R(x - 26, 0, 52, 960, '#1A2738')).join('') + Array.from({ length: 12 }, (_, i) => Ln(i * 170, 60, i * 170 + 85, 0, '#22324A', 6) + Ln(i * 170 + 85, 0, i * 170 + 170, 60, '#22324A', 6)).join('');
  const V = vig(3, [R(0, 0, 1920, 1080, 'url(#r3s)'), cols, R(0, 56, 1920, 10, '#22324A'),
    R(0, 960, 1920, 120, '#1C2633'), R(0, 958, 1920, 8, '#FFC21A'),
    h('ellipse', { cx: 900, cy: 985, rx: 400, ry: 42, fill: 'url(#r3st)', opacity: 0.45 }), h('ellipse', { cx: 900, cy: 985, rx: 400, ry: 42, fill: 'none', stroke: '#E5484D', 'stroke-width': 5, 'stroke-dasharray': '18 12' }),
    block(1430, 760, 520, 200, '#4E6A88'),
    R(820, 60, 160, 50, '#7A5A1A', { rx: 6 }),
    g({ id: 'r3-ld', transform: 'translate(900 110)' }, [Ln(-20, 0, -20, 330, '#AEB8C4', 5), Ln(20, 0, 20, 330, '#AEB8C4', 5), hook(0, 330, '#FFC21A'),
      Ln(0, 410, -230, 470, '#AEB8C4', 4), Ln(0, 410, 230, 470, '#AEB8C4', 4), block(-270, 470, 540, 210, '#6B88A8')]),
    worker('r3w', { x: 1300, y: 960, s: 1.15 }),
  ].join(''), night('r3s', '#0A1220', '#16243A') + stripes('r3st', '#FFC21A', '#141414', 16));
  const B = say('r3', t, { lead: 0.35 });
  hzIn(V.S, t + 0.05);
  const hit = Math.max(t + 1.55, B.end - 0.35), ld = tr('#r3-ld', { x: 900, y: 110 });
  ld.fn(t, hit, (u) => ({ r: Math.sin(u * 4.2) * (3 + u * 9) }));
  ld.to(hit - 0.4, 0.4, { r: -17 }, 'in');
  const w = tr('#r3w', { x: 1300, y: 960, s: 1.15, sx: -1 });
  [['ar l', -160], ['ar r', -170]].forEach(([p, r]) => tr(J('r3w', p)).to(hit - 0.35, 0.25, { r }, 'out'));
  w.to(hit - 0.3, 0.3, { r: 8, x: 1330 }, 'out');
  shakeCam(V.cam, hit, 0.5, 28); redPulse(hit, 1, 1.0); whiteFlash(hit, 0.35, 0.3);
  cue(t, 'crane'); cue(hit, 'clang'); cue(hit + 0.02, 'hit');
  return Math.max(B.end, hit + 1.0) + 0.6;
}
function R4(t) { // xe đầu kéo - người đi bộ
  const V = vig(4, [R(0, 0, 1920, 1080, 'url(#r4s)'),
    containers(60, 780, 5, 3, 150, 52, NIGHT.cont, 5), containers(1180, 780, 5, 3, 150, 52, NIGHT.cont, 9),
    R(0, 780, 1920, 300, '#20262E'), ...Array.from({ length: 12 }, (_, i) => R(i * 170, 880, 90, 8, '#FFC21A', { opacity: 0.8 })),
    ...Array.from({ length: 6 }, (_, i) => R(1020 + i * 36, 790, 20, 280, '#E8EEF4', { opacity: 0.55 })),
    g({ id: 'r4-fk', transform: 'translate(1700 900) scale(.8)' }, forklift(0, 0, '#FFC21A')),
    g({ id: 'r4-tk', transform: 'translate(-1000 1010)' }, [P('M600 -110 L1150 -230 L1150 40 L600 -60 Z', '#FFF2C4', { opacity: 0.22 }), truck(0, 0, '#E5484D', '#2F7DB8')]),
    worker('r4w', { x: 1140, y: 1010, s: 1.2 }),
    g({ id: 'r4-wt', transform: 'translate(1140 560)' }, warnTri(0, 0, 1.3)),
  ].join(''), night('r4s', '#07101D', '#16263A'));
  const B = say('r4', t, { lead: 0.35 });
  hzIn(V.S, t + 0.05);
  const stop = t + 1.5;
  tr('#r4-tk', { x: -1000, y: 1010 }).to(t, 1.5, { x: 340 }, 'out');
  tr('#r4-fk', { x: 1700, y: 900, s: 0.8 }).to(t, 2.2, { x: 1450 }, 'io');
  const w = tr('#r4w', { x: 1140, y: 1010, s: 1.2 });
  walk('r4w', t, t + 0.9, 8, 22); w.to(t, 0.9, { x: 1100 }, 'lin');
  w.to(t + 0.95, 0.05, { sx: -1 }, 'lin').to(t + 1.0, 0.3, { x: 1150, r: 10 }, 'out');
  [['ar l', -150], ['ar r', -165]].forEach(([p, r]) => tr(J('r4w', p)).to(t + 1.0, 0.25, { r }, 'out'));
  tr('#r4-wt', { x: 1140, y: 560, s: 0 }).to(stop - 0.2, 0.4, { s: 1 }, 'back');
  shakeCam(V.cam, stop, 0.35, 12); redPulse(stop, 0.8, 0.7);
  cue(t + 0.3, 'horn'); cue(t + 0.85, 'screech');
  return Math.max(B.end, stop + 0.8) + 0.6;
}
function R5(t) { // ngạt khí trong két tàu
  const rungs = []; for (let y = 290; y < 940; y += 60) rungs.push(Ln(520, y, 600, y, '#8A97A6', 6));
  const rivets = []; for (let x = 40; x < 1920; x += 120) rivets.push(C(x, 150, 5, '#2A3746'), C(x, 1010, 5, '#2A3746'));
  const V = vig(5, [R(0, 0, 1920, 1080, '#1B2633'), ...rivets,
    R(220, 240, 1280, 720, 'url(#r5in)', { rx: 40, stroke: '#3A4A5E', 'stroke-width': 26 }),
    P('M470 240 L650 240 L900 960 L240 960 Z', '#CFE3FF', { opacity: 0.08 }),
    h('ellipse', { cx: 560, cy: 236, rx: 96, ry: 22, fill: '#05080D' }),
    Ln(520, 240, 520, 940, '#8A97A6', 7), Ln(600, 240, 600, 940, '#8A97A6', 7), ...rungs,
    P('M990 820 L1420 700 L1420 950 Z', '#FFF0B8', { id: 'r5-bm', opacity: 0.22 }),
    worker('r5w', { x: 930, y: 960, s: 1.15, tool: R(-6, 66, 30, 14, '#3A3F47', { rx: 4 }) }),
  ].join(''), lin('r5in', [[0, '#0A0F16'], [1, '#141E2A']]));
  const gauge = div('gauge', V.S, h('svg', { viewBox: '-150 -150 300 300' }, [C(0, 0, 140, '#0E1622', { stroke: '#E8EEF4', 'stroke-width': 6 }),
    P('M-99 99 A140 140 0 0 1 -99 -99', 'none', { stroke: '#22C55E', 'stroke-width': 18, transform: 'scale(.8)' }), P('M-99 -99 A140 140 0 0 1 99 -99', 'none', { stroke: '#F5A524', 'stroke-width': 18, transform: 'scale(.8)' }), P('M99 -99 A140 140 0 0 1 99 99', 'none', { stroke: '#E5484D', 'stroke-width': 18, transform: 'scale(.8)' }),
    T(0, 64, 'O₂', { 'text-anchor': 'middle', 'font-size': 52, 'font-weight': 900, fill: '#fff', 'font-family': 'Be Vietnam Pro' }),
    g({ id: 'r5-nd' }, [P('M-7 0 L0 -112 L7 0 Z', '#FFC21A'), C(0, 0, 14, '#FFC21A')]),
    g({ id: 'r5-lb', opacity: 0 }, [R(-110, 92, 220, 40, '#E5484D', { rx: 10 }), T(0, 120, 'THIẾU OXY', { 'text-anchor': 'middle', 'font-size': 24, 'font-weight': 900, fill: '#fff', 'font-family': 'Be Vietnam Pro' })])].join('')));
  const B = say('r5', t, { lead: 0.35 });
  hzIn(V.S, t + 0.05);
  master.fromTo(gauge, { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2)' }, t + 0.3);
  puffs(V.cv, 960, 950, 1100, t, B.end + 1.2, { col: '175,205,70', rate: 16, life: 3.2, rise: 70, r: 90, a: 0.42 });
  tr('#r5-nd', { r: -60 }).to(t + 0.4, 1.6, { r: 75 }, 'in').fn(t + 2.0, B.end + 1.2, (u) => ({ r: Math.sin(u * 30) * 3 }));
  const lb = tr('#r5-lb', { o: 0 }); for (let k = 0; k < 6; k++) lb.set(t + 1.7 + k * 0.3, { o: k % 2 ? 0.25 : 1 });
  tr('#r5-bm', { o: 0.22 }).fn(t, t + 1.9, (u) => ({ o: 0.06 * Math.sin(u * 13) })).to(t + 1.9, 0.4, { o: 0 }, 'lin');
  const w = tr('#r5w', { x: 930, y: 960, s: 1.15 });
  tr(J('r5w', 'ar r'), { r: -80 });
  w.to(t + 1.0, 0.4, { r: -6, y: 965 }, 'io').to(t + 1.9, 0.7, { r: -84, x: 900 }, 'in');
  redPulse(t + 1.9, 0.7, 0.6); redPulse(t + 2.6, 0.9, 0.9); shakeCam(V.cam, t + 2.6, 0.3, 10);
  cue(t + 0.4, 'heart'); cue(t + 1.6, 'alarm'); cue(t + 2.6, 'hit');
  return Math.max(B.end, t + 2.9) + 0.6;
}
function R6(t) { // cháy nổ khi hàn cắt cạnh bình khí, thùng sơn
  const vap = [1420, 1560].map((x, i) => g({ class: 'vap', opacity: 0.5 }, [0, 1, 2].map((k) => P(`M${x - 24 + k * 24} 760 q14 -24 0 -48 q-14 -24 0 -48`, 'none', { stroke: '#B9E07A', 'stroke-width': 5, 'stroke-linecap': 'round' })).join(''))).join('');
  const V = vig(6, [R(0, 0, 1920, 1080, 'url(#r6s)'),
    P('M0 520 L260 520 L260 360 L520 360 L520 520 L1920 520 L1920 900 L0 900 Z', '#141E2C'),
    R(0, 900, 1920, 180, '#2E3B4C'), ...Array.from({ length: 16 }, (_, i) => R(i * 125, 820, 10, 80, '#3B4A5E')), R(0, 816, 1920, 10, '#3B4A5E'),
    R(760, 640, 46, 260, '#7B8FA8'),
    g({ id: 'r6-tg' }, [cylinder(1170, 900, '#C0392B', 220), cylinder(1260, 900, '#2F6FB0', 220), drum(1430, 900, '#3D6B4E'), drum(1560, 900, '#8C6A2C'), vap]),
    worker('r6w', { x: 600, y: 900, s: 1.15, mask: true, glove: '#5A4632' }),
  ].join(''), night('r6s', '#06090F', '#172133'));
  const B = say('r6', t, { lead: 0.35 });
  hzIn(V.S, t + 0.05);
  [['ar l', -78], ['ar r', -70]].forEach(([p, r]) => tr(J('r6w', p), { r }));
  const boom = Math.max(t + 1.45, B.end - 0.6);
  sparks(V.cv, 770, 760, t, boom - 0.05, { seed: 6, a: -0.25, spread: 1.0, v: 760, rate: 110, life: 0.9, g: 700 });
  $$('#r6 .vap').forEach((v, i) => tr(v, { o: 0.4 }).fn(t, boom, (u) => ({ y: -((u * 40 + i * 20) % 40), o: 0.3 * Math.sin(u * 5 + i) })));
  blast(V.cv, 1330, 770, boom, { r: 1000, life: 1.4 });
  tr('#r6-tg').to(boom + 0.05, 0.3, { o: 0.15 }, 'lin');
  tr('#r6w', { x: 600, y: 900, s: 1.15 }).to(boom, 0.35, { x: 520, r: -20 }, 'out');
  whiteFlash(boom, 0.9, 0.6); shakeCam(V.cam, boom, 0.7, 34); redPulse(boom + 0.2, 0.9, 1.2);
  cue(t, 'weld'); cue(boom, 'boom');
  return Math.max(B.end, boom + 1.1) + 0.6;
}
function R7(t) { // điện giật, hồ quang trong khoang ẩm
  const pipes = [220, 300, 380].map((y, i) => R(0, y, 1920, 30 - i * 4, ['#244048', '#2B4C55', '#1F3940'][i]) + Array.from({ length: 8 }, (_, k) => R(120 + k * 240, y - 6, 22, 42 - i * 4, '#38606A')).join('')).join('');
  const V = vig(7, [R(0, 0, 1920, 1080, 'url(#r7s)'), pipes,
    R(0, 940, 1920, 140, '#16262C'),
    h('ellipse', { cx: 860, cy: 968, rx: 320, ry: 36, fill: '#2C5A72', opacity: 0.75 }),
    R(1290, 380, 280, 440, '#5B6B7A', { rx: 8 }), R(1306, 396, 248, 408, '#3E4B57', { rx: 6 }), ...Array.from({ length: 8 }, (_, i) => R(1330 + (i % 4) * 56, 430 + Math.floor(i / 4) * 90, 34, 60, '#1E252D', { rx: 4 })),
    g({ transform: 'translate(1430 700)' }, warnTri(0, 0, 0.7, '⚡')),
    R(300, 830, 190, 110, '#8C6A2C', { rx: 8 }), R(320, 850, 60, 30, '#1E252D', { rx: 4 }),
    P('M480 900 Q620 980 760 940 Q860 912 960 830', 'none', { stroke: '#121212', 'stroke-width': 10 }),
    R(1030, 700, 34, 240, '#7B8FA8'),
    g({ id: 'r7w-wrap' }, worker('r7w', { x: 870, y: 960, s: 1.15, mask: true, glove: '#5A4632' })),
  ].join(''), night('r7s', '#0A171B', '#173238'));
  const B = say('r7', t, { lead: 0.35 });
  hzIn(V.S, t + 0.05);
  [['ar l', -82], ['ar r', -76]].forEach(([p, r]) => tr(J('r7w', p), { r }));
  const z = Math.max(t + 0.9, B.end - 0.15);
  arcs(V.cv, 1000, 780, 860, 968, z, z + 0.9, { n: 3 }); arcs(V.cv, 1300, 560, 1040, 760, z + 0.25, z + 0.9, { n: 2 });
  tr('#r7w-wrap').fn(z, z + 0.9, (u, tt) => ({ o: hash(Math.floor(tt * 30), 3) < 0.5 ? -0.75 : 0 })).to(z + 0.9, 0.3, { o: 1 });
  tr('#r7w', { x: 870, y: 960, s: 1.15 }).fn(z, z + 0.9, (u) => ({ x: Math.sin(u * 70) * 6 })).to(z + 0.9, 0.5, { r: -70, x: 820 }, 'in');
  [0, 0.25, 0.5].forEach((k) => whiteFlash(z + k, 0.45, 0.15));
  shakeCam(V.cam, z, 0.8, 12);
  cue(z, 'zap'); cue(z + 0.35, 'zap');
  return Math.max(B.end, z + 1.5) + 0.6;
}
function R8(t) { // khói hàn · tiếng ồn · vật nặng & ca kíp
  const S = sec('r8'); div('dim2', S); div('band t', S);
  div('hz', S, `<div class="no">08</div><div><b>${HZ[7][0]}</b><span>${HZ[7][1]}</span></div>`);
  div('hzp', S, Array.from({ length: 8 }, () => '<i class="on"></i>').join(''));
  const bg = div('cam', S, svgWrap(R(0, 0, 1920, 1080, 'url(#r8s)'), night('r8s', '#0B1018', '#1A2230')));
  const cv = document.createElement('canvas'); cv.width = 1920; cv.height = 1080; bg.appendChild(cv);
  const P3 = [['Khói hàn · bụi', [R(0, 520, 560, 120, '#2A3442'), R(260, 400, 40, 120, '#7B8FA8'), worker('r8a', { x: 170, y: 520, s: 1.3, mask: true })]],
    ['Tiếng ồn · rung động', [R(0, 520, 560, 120, '#2A3442'), g({ id: 'r8-rg' }, [0, 1, 2].map((k) => C(0, 0, 60, 'none', { class: 'rg', stroke: '#FF8A3D', 'stroke-width': 6 })).join('')), worker('r8b', { x: 210, y: 520, s: 1.3, tool: R(-20, 62, 60, 22, '#C0392B', { rx: 6 }) })]],
    ['Vật nặng > 30 kg · ca kíp', [R(0, 520, 560, 120, '#2A3442'), g({ id: 'r8-ck', transform: 'translate(440 110)' }, [C(0, 0, 62, '#E8EEF4'), C(0, 0, 52, '#0E1622'), g({ id: 'r8-hh' }, Ln(0, 0, 0, -30, '#FFC21A', 6)), g({ id: 'r8-mm' }, Ln(0, 0, 0, -44, '#fff', 4)), C(0, 0, 6, '#FFC21A')]),
      g({ id: 'r8-cw' }, [worker('r8c', { x: 230, y: 520, s: 1.3 })]), g({ id: 'r8-bx', transform: 'translate(300 300)' }, [R(-80, -70, 160, 120, '#B07D3A', { rx: 6 }), T(0, 6, '> 30 kg', { 'text-anchor': 'middle', 'font-size': 34, 'font-weight': 900, fill: '#141414', 'font-family': 'Be Vietnam Pro' })])]]];
  const panels = P3.map(([title, inner], i) => { const p = div('card', S, `<svg viewBox="0 0 560 640" style="position:absolute;left:0;top:70px;width:560px;height:640px">${inner.join('')}</svg><div style="position:absolute;left:28px;top:22px;font-size:32px;font-weight:800;color:#fff">${title}</div>`);
    p.style.cssText = `left:${110 + i * 580}px;top:300px;width:560px;height:720px;background:#151F2C;border:2px solid rgba(229,72,77,.45);overflow:hidden`; return p; });
  S.appendChild(cv); cv.style.cssText = 'position:absolute;left:0;top:0;width:1920px;height:1080px;z-index:2;pointer-events:none';
  const B = say('r8', t, { lead: 0.35 });
  hzIn(S, t + 0.05);
  const a = [B.at(0, 'Khói') - 0.2, B.at(0, 'tiếng ồn') - 0.25, B.at(0, 'vật nặng') - 0.25];
  panels.forEach((p, i) => { master.fromTo(p, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, ease: 'power3.out' }, a[i]); cue(a[i], 'swish'); });
  puffs(cv, 110 + 230, 300 + 70 + 380, 160, a[0], B.end + 1, { col: '170,175,185', rate: 12, life: 2.6, rise: 110, r: 70, a: 0.5 });
  sparks(cv, 110 + 280, 300 + 70 + 430, a[0], B.end + 1, { seed: 2, rate: 40, v: 260, a: -1.6, spread: 1.5 });
  [['ar l', -70], ['ar r', -64]].forEach(([p, r]) => tr(J('r8a', p), { r }));
  [['ar l', -60], ['ar r', -55]].forEach(([p, r]) => tr(J('r8b', p), { r }).fn(a[1], B.end + 1, (u) => ({ r: Math.sin(u * 40) * 3 })));
  $$('#r8-rg .rg').forEach((c, k) => tr(c, { x: 360, y: 420 }).fn(a[1], B.end + 1, (u) => { const p = ((u * 0.9 + k / 3) % 1); return { s: p * 2.4, o: -p }; }));
  [['ar l', -160], ['ar r', -165]].forEach(([p, r]) => tr(J('r8c', p), { r }));
  tr('#r8-cw').fn(a[2], B.end + 1, (u) => ({ y: Math.abs(Math.sin(u * 3)) * 8 }));
  tr('#r8-bx', { x: 230, y: 250 }).fn(a[2], B.end + 1, (u) => ({ y: Math.abs(Math.sin(u * 3)) * 8 }));
  tr('#r8-hh').fn(a[2], B.end + 1, (u) => ({ r: u * 90 })); tr('#r8-mm').fn(a[2], B.end + 1, (u) => ({ r: u * 1080 }));
  cue(a[1], 'grind'); cue(a[2] + 0.2, 'heart');
  return B.end + 0.9;
}
function RX(t) { // lưới 8 nguy cơ
  const S = sec('rx');
  div('hd wt', S, '8 nguy cơ – <span class="ac">luôn rình rập mỗi ca làm việc.</span>');
  div('grid', S, HZ.map(([b, , ic], i) => `<div class="tl"><em>0${i + 1}</em>${ICON(ic)}<b>${b.replace(' · ', '<br>')}</b></div>`).join(''));
  words('#rx .hd', t + 0.1);
  master.fromTo('#rx .tl', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, stagger: 0.07, ease: 'back.out(1.8)' }, t + 0.2);
  for (let i = 0; i < 8; i++) cue(t + 0.2 + i * 0.07, 'tick');
  redPulse(t + 0.9, 0.6, 1.2);
  return t + 2.6;
}

/* ---------- 4 · BƯỚC NGOẶT ---------- */
function Tn(t) {
  const S = sec('t');
  const dw = div('dawn', S); const { cam } = camSvg(dw, yard('yw', DAWN));
  const crew = [worker('tw1', { x: 520, y: 800, s: 0.95, harness: true }), worker('tw2', { x: 640, y: 800, s: 0.95, helmet: '#E8EEF4', vest: '#FFC21A', harness: true }), worker('tw3', { x: 760, y: 800, s: 0.95, helmet: '#F26A1B' })].join('');
  $('svg', dw).insertAdjacentHTML('beforeend', g({}, crew));
  div('vig', S);
  div('big center l1', S, 'Huấn luyện an toàn');
  const l2 = div('big center l2', S, 'không phải để <span class="r">đối phó thủ tục.</span>');
  const sk = div('strike', S);
  div('big center m1', S, 'Đó là <span class="gn">yêu cầu sống còn.</span>');
  div('big center m2', S, 'Để bảo vệ tính mạng người lao động.');
  wavesOn(dw);
  const B = say('t', t, { lead: 0.7, gap: 0.7 });
  mark(t, 'hush_on');
  words('#t .l1', B[0].t - 0.15); words('#t .l2', B.at(0, 'không phải') - 0.05);
  const sp = $('.r', l2), r = sp.getBoundingClientRect(), sr = $('#stage').getBoundingClientRect();
  sk.style.cssText += `left:${r.left - sr.left - 10}px;top:${r.top - sr.top + r.height * 0.55}px;width:${r.width + 20}px;height:12px`;
  master.fromTo(sk, { scaleX: 0 }, { scaleX: 1, duration: 0.45, ease: 'power2.inOut' }, B[0].t + B[0].d + 0.05);
  cue(B[0].t + B[0].d + 0.05, 'swish');
  const d = B[1].t - 0.35;
  master.to(['#t .l1', '#t .l2', sk], { autoAlpha: 0, y: -40, duration: 0.4, ease: 'power2.in' }, d);
  mark(d, 'hush_off'); mark(d + 0.1, 'sec_main'); mark(d + 0.15, 'sec_soft');
  master.fromTo(dw, { opacity: 0 }, { opacity: 1, duration: 1.4, ease: 'power1.inOut' }, d);
  master.fromTo('#t .vig', { opacity: 0 }, { opacity: 1, duration: 1.0 }, d);
  master.fromTo(cam, { scale: 1.12 }, { scale: 1.02, duration: 6, ease: 'power1.out' }, d);
  tr('#yw-sunwrap', { y: 260 }).to(d, 3.0, { y: 0 }, 'out');
  tr('#yw-trolley').to(d + 0.6, 4, { x: -200 }, 'io');
  walk('tw1', d + 0.4, d + 4.4, 7, 18); tr('#tw1', { x: 520, y: 800, s: 0.95 }).to(d + 0.4, 4, { x: 900 }, 'lin');
  tr(J('tw3', 'ar r')).fn(d + 1.2, d + 5, (u) => ({ r: -150 + Math.sin(u * 8) * 25 }));
  words('#t .m1', B[1].t - 0.15, { stagger: 0.07 });
  words('#t .m2', B.at(1, 'để bảo vệ') - 0.1, { stagger: 0.05 });
  cue(t + 0.3, 'heart'); cue(t + 1.6, 'heart');
  return B.end + 1.6;
}

/* ---------- 5 · BA LỜI KHUYÊN ---------- */
function shieldIll() {
  return h('svg', { class: 'il', viewBox: '0 0 760 560', style: 'left:0;top:0;width:760px;height:560px' }, [
    R(0, 0, 760, 560, '#EAF2FA', { rx: 24 }),
    P('M380 70 L560 130 L560 280 Q560 420 380 500 Q200 420 200 280 L200 130 Z', '#0E2A47'),
    P('M380 100 L530 150 L530 280 Q530 395 380 466 Q230 395 230 280 L230 150 Z', '#1F3B63'),
    g({ id: 'a1-ht', transform: 'translate(380 250)' }, P('M0 60 C-90 0 -70 -70 -24 -70 C-6 -70 0 -56 0 -46 C0 -56 6 -70 24 -70 C70 -70 90 0 0 60 Z', '#E5484D')),
    worker('a1w', { x: 380, y: 540, s: 0.9, harness: true }),
  ].join(''));
}
function Adv(t) {
  const S = sec('a', 'lt');
  div('kk', S, '<b>3</b>LỜI KHUYÊN VỀ ĐÀO TẠO AN TOÀN LAO ĐỘNG');
  div('hd', S, '3 điều doanh nghiệp <span class="ac">cần làm ngay.</span>');
  const stp = div('stp', S, ['Nhận thức đúng', 'Đúng nhóm, đủ nội dung', 'Định kỳ & kiểm soát nhà thầu'].map((x, i) => `<span><em>0${i + 1}</em>${x}</span>`).join(''));
  const p1 = div('pn', S), p2 = div('pn', S), p3 = div('pn', S);
  // 01
  const c1 = div('card', p1, shieldIll()); c1.style.cssText = 'left:0;top:0;width:760px;height:560px;overflow:hidden';
  div('', c1, 'Huấn luyện = bảo vệ tính mạng').style.cssText = 'position:absolute;left:0;right:0;top:20px;text-align:center;font-size:26px;font-weight:800;color:#0E2A47';
  div('ttl', p1, 'Phần lớn công việc ngành đóng tàu<small>thuộc Danh mục công việc có yêu cầu nghiêm ngặt về an toàn, vệ sinh lao động</small>').style.cssText = 'left:820px;top:0;width:860px;white-space:normal';
  const jobs = [['flame', 'Thợ hàn, cắt kim loại'], ['construction', 'Lái cẩu, cổng trục'], ['hammer', 'Lắp ráp thân tàu'], ['cylinder', 'Vệ sinh két, hầm tàu'], ['hard-hat', 'Thợ giàn giáo'], ['ship', 'Công nhân hạ thủy']];
  const jc = jobs.map(([ic, x], i) => { const c = div('chip', p1, `<i>${ICON(ic)}</i>${x}`); c.style.cssText = `left:${820 + (i % 2) * 430}px;top:${190 + Math.floor(i / 2) * 92}px`; return c; });
  const st1 = div('stamp', p1, 'NGHIÊM NGẶT · NHÓM 3'); st1.style.cssText += 'left:1090px;top:480px';
  // 02
  const b3 = div('badge', p2, '<small>NHÓM 3</small><b>Lao động trực tiếp</b><span>Hàn, cẩu, giàn giáo, két, cầu bến…</span>'); b3.style.cssText = 'left:0;top:0;width:760px;height:250px;background:linear-gradient(135deg,#E5600F,#FF8A3D)';
  const b12 = div('badge', p2, '<small>NHÓM 1 · NHÓM 2</small><b>Quản lý · cán bộ an toàn</b><span>Lãnh đạo, quản lý hiện trường, cán bộ ATVSLĐ</span>'); b12.style.cssText = 'left:0;top:290px;width:760px;height:250px;background:linear-gradient(135deg,#0E2A47,#1F3B63)';
  div('ttl', p2, 'Bổ sung chuyên đề<small>Kỹ năng đặc thù cho môi trường đóng tàu, cảng biển</small>').style.cssText = 'left:820px;top:0';
  const topics = [['zap', 'An toàn điện', '#F5A524'], ['flask-conical', 'An toàn hóa chất', '#8B5CF6'], ['cross', 'Sơ cấp cứu', '#E5484D'], ['cylinder', 'Ứng phó không gian hạn chế', '#0E7C86']];
  const tc = topics.map(([ic, x, col], i) => { const c = div('chip', p2, `<i style="background:${col}">${ICON(ic)}</i>${x}`); c.style.cssText = `left:${820 + (i % 2) * 400}px;top:${200 + Math.floor(i / 2) * 110}px;font-size:26px`; return c; });
  // 03
  const cert = div('cert', p3, `<div style="position:absolute;left:34px;top:30px;font-size:20px;font-weight:800;letter-spacing:.16em;color:#8A6A12">CHỨNG NHẬN HUẤN LUYỆN</div>
    <div style="position:absolute;left:34px;top:64px;font-size:40px;font-weight:900;color:#0E2A47">An toàn, vệ sinh lao động</div>
    <div style="position:absolute;left:34px;top:124px;font-size:24px;font-weight:700;color:#5E6C78">Hiệu lực: <b style="color:#0E2A47">2 năm</b></div>
    <div class="bar" style="left:34px;top:190px;width:690px"><i></i></div>
    <div style="position:absolute;left:34px;top:226px;font-size:18px;font-weight:700;color:#8A97A6">Tháng 0</div><div style="position:absolute;right:34px;top:226px;font-size:18px;font-weight:700;color:#8A97A6">Tháng 24</div>
    <div class="due" style="position:absolute;left:34px;top:270px;display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;background:#E5484D;color:#fff;font-size:22px;font-weight:800">${ICON('calendar-clock')}Đến hạn huấn luyện định kỳ</div>
    <div class="ok" style="position:absolute;left:34px;top:270px;display:flex;align-items:center;gap:10px;padding:10px 18px;border-radius:999px;background:#13843F;color:#fff;font-size:22px;font-weight:800">${ICON('badge-check')}Đã huấn luyện lại · thêm 2 năm</div>`);
  cert.style.cssText += 'left:0;top:0;width:760px;height:350px';
  div('ttl', p3, 'Kiểm soát nhà thầu, người ra vào<small>Trước khi giao việc tại nhà máy</small>').style.cssText = 'left:820px;top:0';
  const gate = div('card', p3, h('svg', { viewBox: '0 0 420 330', style: 'position:absolute;left:0;top:0;width:420px;height:330px' }, [R(0, 0, 420, 330, '#EAF2FA', { rx: 24 }), R(30, 70, 34, 240, '#0E2A47'), R(356, 70, 34, 240, '#0E2A47'), R(64, 120, 292, 16, 'url(#gst)'),
    worker('a3w0', { x: 210, y: 300, s: 0.95, helmet: '#C9CED6', vest: '#9AA3AE', strip: '#9AA3AE' }), g({ id: 'a3ppe', opacity: 0 }, worker('a3w1', { x: 210, y: 300, s: 0.95 }))].join('') + `<defs>${stripes('gst', '#FFC21A', '#141414', 10)}</defs>`));
  gate.style.cssText = 'left:820px;top:160px;width:420px;height:330px;overflow:hidden';
  const cks = ['Phổ biến nội quy', 'Cấp đủ PPE', 'Giao việc'].map((x, i) => { const c = div('ck', p3, `<span class="bx">${ICON('check')}</span>${x}`); c.style.cssText = `left:1290px;top:${190 + i * 90}px`; return c; });
  const tm = div('ck', p3, `<span class="bx" style="border-color:#0E2A47">${ICON('arrow-right')}</span>`); tm.style.display = 'none';
  // ---- thời gian
  const B = say('a', t, { lead: 1.0, gap: 0.6 });
  kicker('#a .kk', t + 0.1); words('#a .hd', t + 0.2);
  master.fromTo('#a .stp span', { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5, stagger: 0.1 }, t + 0.4);
  const S1 = B[0].t - 0.2, S2 = B[1].t - 0.3, S3 = B[3].t - 0.3, E = B.end + 1.3;
  const SP = $$('#a .stp span');
  flashOn(SP[0], S1, S2); flashOn(SP[1], S2, S3); flashOn(SP[2], S3, E);
  lit(SP[0], S2, 'dn'); lit(SP[1], S3, 'dn');
  [[p1, S1, S2], [p2, S2, S3], [p3, S3, E + 1]].forEach(([p, a, b]) => {
    master.fromTo(p, { autoAlpha: 0, x: 80 }, { autoAlpha: 1, x: 0, duration: 0.6, ease: 'power3.out' }, a);
    if (b < E) master.to(p, { autoAlpha: 0, x: -80, duration: 0.35, ease: 'power2.in' }, b - 0.3);
    cue(a, 'swish');
  });
  // 01
  master.fromTo(c1, { scale: 0.92, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6 }, S1 + 0.1);
  tr('#a1-ht', { x: 380, y: 250 }).fn(S1, S2, (u) => ({ s: 0.08 * Math.pow(Math.max(0, Math.sin(u * 5)), 6) }));
  master.fromTo(jc, { y: 20, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.4, stagger: 0.12 }, S1 + 0.6);
  const sa = B.at(0, 'nghiêm ngặt') - 0.1;
  master.fromTo(st1, { scale: 2.4, autoAlpha: 0, rotation: -18 }, { scale: 1, autoAlpha: 1, rotation: -8, duration: 0.3, ease: 'power4.in' }, sa);
  cue(sa + 0.3, 'stamp');
  // 02
  master.fromTo(b3, { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, B.at(1, 'nhóm ba') - 0.2);
  master.fromTo(b12, { x: -50, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, B.at(1, 'nhóm một') - 0.2);
  ['an toàn điện', 'hóa chất', 'sơ cấp cứu', 'ứng phó'].forEach((p, i) => { const a = B.at(2, p) - 0.15; master.fromTo(tc[i], { scale: 0.5, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.45, ease: 'back.out(2)' }, a); cue(a, 'pop'); });
  // 03
  const bar = $('.bar i', cert), due = $('.due', cert), ok = $('.ok', cert);
  master.fromTo(cert, { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.5 }, S3 + 0.1);
  master.set([due, ok], { autoAlpha: 0 }, 0);
  master.fromTo(bar, { scaleX: 0, backgroundColor: '#13843F' }, { keyframes: [{ scaleX: 0.7, backgroundColor: '#13843F', duration: 1.2 }, { scaleX: 1, backgroundColor: '#E5484D', duration: 0.6 }], ease: 'none' }, S3 + 0.5);
  const dz = Math.max(S3 + 2.3, B[3].t + B[3].d + 0.05);
  master.fromTo(due, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, dz);
  cue(dz, 'notif');
  const rn = B[4].t - 0.2;
  master.to(due, { autoAlpha: 0, duration: 0.2 }, rn); master.to(bar, { scaleX: 0.04, backgroundColor: '#13843F', duration: 0.5, ease: 'power2.inOut' }, rn);
  master.fromTo(ok, { autoAlpha: 0, scale: 0.8 }, { autoAlpha: 1, scale: 1, duration: 0.3, ease: 'back.out(2)' }, rn + 0.3); cue(rn + 0.3, 'ding');
  master.fromTo([gate, ...cks], { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.45, stagger: 0.1 }, B[4].t);
  ['phổ biến', 'cấp đủ', 'giao việc'].forEach((p, i) => { const a = B.at(4, p) + 0.1; lit($('.bx', cks[i]), a); master.fromTo($('.bx', cks[i]), { scale: 0.6 }, { scale: 1, duration: 0.35, ease: 'back.out(3)', immediateRender: false }, a); cue(a, 'tick'); });
  tr('#a3ppe', { o: 0 }).to(B.at(4, 'cấp đủ') + 0.1, 0.4, { o: 1 }, 'lin');
  walk('a3w1', B.at(4, 'giao việc'), E, 7, 18); tr('#a3w1', { x: 210, y: 300, s: 0.95 }).to(B.at(4, 'giao việc'), 1.6, { x: 470 }, 'lin');
  return E;
}

/* ---------- 6 · NHÓM HUẤN LUYỆN THEO VỊ TRÍ ---------- */
function G(t) {
  const S = sec('g', 'lt');
  div('kk', S, '<b><i class="ic" data-i="users"></i></b>PHÂN NHÓM HUẤN LUYỆN THEO VỊ TRÍ');
  div('hd', S, 'Mỗi vị trí – <span class="ac">một nhóm huấn luyện.</span>');
  const GR = [['NHÓM 1', 'Quản lý', '#1F3B63', 220], ['NHÓM 2', 'Cán bộ ATVSLĐ', '#0E7C86', 220], ['NHÓM 3', 'Công việc nghiêm ngặt', '#E5600F', 520],
    ['NHÓM 4', 'Lao động khác', '#5B6B7F', 220], ['NHÓM 5', 'Y tế', '#D33A3A', 200], ['NHÓM 6', 'An toàn vệ sinh viên', '#13843F', 260]];
  let x = 90; const cards = GR.map(([n, l, col, w]) => { const c = div('gc', S, `<div class="gh" style="background:${col}"><small>${n}</small><b>${n.slice(-1)}</b><span>${l}</span></div>`); c.style.cssText += `left:${x}px;width:${w}px`; c._x = x; c._w = w; c._col = col; c._n = 0; x += w + 20; return c; });
  const B = say('g', t, { lead: 1.0, gap: 0.55 });
  kicker('#g .kk', t + 0.1); words('#g .hd', t + 0.2);
  master.fromTo(cards, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.08 }, t + 0.5);
  const chip = (ci, ic, txt, at, o = {}) => { // thẻ vị trí bay vào cột nhóm
    const c = cards[ci], two = ci === 2, col = two ? c._n % 2 : 0, row = two ? Math.floor(c._n / 2) : c._n; c._n++;
    const w = two ? (c._w - 36) / 2 : c._w - 24, left = c._x + 12 + col * (w + 12), top = 330 + 132 + row * 62;
    const e = div('rc', S, `<i style="background:${c._col}">${ICON(ic)}</i>${txt}`); e.style.cssText = `left:${left}px;top:${top}px;width:${w}px;${o.dash ? 'border:2px dashed #13843F;background:#fff' : ''}`;
    master.fromTo(e, { x: 960 - left - w / 2, y: 260 - top, scale: 0.6, autoAlpha: 0 }, { x: 0, y: 0, scale: 1, autoAlpha: 1, duration: 0.6, ease: 'power3.out' }, at);
    cue(at + 0.45, 'tick');
    return e;
  };
  const on = (ci, a, b) => flashOn(cards[ci], a, b);
  // g2: nhóm 1, 2
  chip(0, 'crown', 'Lãnh đạo', B.at(1, 'Lãnh đạo') - 0.2); chip(0, 'building-2', 'GĐ nhà máy', B.at(1, 'giám đốc') - 0.2); on(0, B.at(1, 'Lãnh đạo'), B.at(1, 'Cán bộ'));
  chip(1, 'shield-check', 'Cán bộ an toàn', B.at(1, 'Cán bộ') - 0.2); on(1, B.at(1, 'Cán bộ'), B[2].t);
  // g3: nhóm 3
  [['flame', 'Thợ hàn', 'Thợ hàn'], ['construction', 'Lái cẩu', 'lái cẩu'], ['link', 'Thợ móc cáp', 'móc cáp'], ['anchor', 'Buộc dây tàu', 'buộc dây'], ['waves', 'Thợ lặn', 'thợ lặn'], ['paint-roller', 'Thợ sơn', 'thợ sơn'], ['zap', 'Thợ điện tàu', 'điện tàu'], ['truck', 'Lái xe đầu kéo', 'lái xe']]
    .forEach(([ic, txt, p]) => chip(2, ic, txt, B.at(2, p) - 0.15));
  on(2, B[2].t, B[3].t);
  // g4: nhóm 4, 5, 6
  chip(3, 'briefcase', 'Văn phòng', B.at(3, 'Văn phòng') - 0.2); chip(3, 'calculator', 'Kế toán', B.at(3, 'kế toán') - 0.2); chip(3, 'shield', 'Bảo vệ', B.at(3, 'bảo vệ') - 0.2); on(3, B.at(3, 'Văn phòng'), B.at(3, 'Nhân viên y tế'));
  chip(4, 'stethoscope', 'Nhân viên y tế', B.at(3, 'Nhân viên y tế') - 0.2); on(4, B.at(3, 'Nhân viên y tế'), B.at(3, 'An toàn vệ sinh'));
  chip(5, 'user-check', 'An toàn vệ sinh viên', B.at(3, 'An toàn vệ sinh') - 0.2); on(5, B.at(3, 'An toàn vệ sinh'), B[4].t);
  // g5: trưởng ca, tổ trưởng → nhóm 1 + nhóm 3 (+ khuyến nghị nhóm 6)
  chip(0, 'hard-hat', 'Trưởng ca', B.at(4, 'Trưởng ca') - 0.1); chip(0, 'hard-hat', 'Tổ trưởng', B.at(4, 'tổ trưởng') - 0.1);
  chip(2, 'hard-hat', 'Trưởng ca · tổ trưởng', B.at(4, 'nhóm ba') - 0.2);
  chip(5, 'hard-hat', 'Tổ trưởng (kiêm)', B.at(4, 'khuyến nghị') - 0.1, { dash: true });
  on(0, B.at(4, 'nhóm một'), B.at(4, 'nhóm ba')); on(2, B.at(4, 'nhóm ba'), B.at(4, 'khuyến nghị')); on(5, B.at(4, 'khuyến nghị'), B[5].t);
  // g6: khách vãng lai
  const gt = div('gate', S, `<i>${ICON('door-open')}</i><span>Khách vãng lai · tài xế ngoài<br><small style="font-weight:600;opacity:.8">Ngoài 6 nhóm → phổ biến nội quy + cấp bảo hộ</small></span>`);
  gt.style.cssText += 'right:100px;top:132px';
  master.fromTo(gt, { x: 60, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.5 }, B[5].t - 0.1); cue(B[5].t - 0.1, 'pop');
  return B.end + 1.3;
}

/* ---------- 7 · GIẢI PHÁP ---------- */
function Sv(t) {
  const S = sec('s', 'lt');
  div('duo', S, `<div class="lg stp"><img src="assets/logo.png" alt="Viện STP"></div><div class="x">${ICON('handshake')}</div><div class="lg dako"><img src="assets/dako.png" alt="DAKO"></div>`);
  div('hd', S, 'Viện STP × DAKO – <span class="ac">đồng hành cùng bạn.</span>');
  const SV = [['scroll-text', 'Chương trình theo quy định', 'Xây dựng theo quy định và đặc thù từng nhà máy, cảng biển'],
    ['factory', 'Huấn luyện đúng nhóm tại nhà máy', 'Nhóm 1 – 6, chuyên đề điện, hóa chất, sơ cứu, không gian hạn chế'],
    ['badge-check', 'Thi, kiểm tra, cấp chứng nhận', 'Tổ chức thi, kiểm tra và cấp chứng nhận theo quy định'],
    ['calendar-clock', 'Hồ sơ & nhắc lịch định kỳ', '']];
  const cards = SV.map(([ic, b, p], i) => { const c = div('sv', S, `<em>0${i + 1}</em><div class="ico">${ICON(ic)}</div><b>${b}</b>${p ? `<p>${p}</p>` : ''}`); c.style.left = `${100 + i * 440}px`; return c; });
  div('shot', cards[3], `<img src="assets/u05.jpg" alt=""><span class="al">${ICON('bell-ring')}Chứng nhận sắp hết hạn</span>`).style.top = '210px';
  const B = say('s', t, { lead: 1.0, gap: 0.55 });
  master.fromTo('#s .lg.stp', { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(2)' }, t + 0.2);
  master.fromTo('#s .lg.dako', { scale: 0.3, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.7, ease: 'back.out(2)' }, B.at(0, 'Đa Cô') - 0.25);
  pop('#s .duo .x', B.at(0, 'Đa Cô'), { from: 0.2 }); cue(B.at(0, 'Đa Cô'), 'ding');
  words('#s .hd', B.at(0, 'đồng hành') - 0.2);
  master.fromTo(cards, { y: 60, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.6, stagger: 0.12 }, B.at(0, 'đồng hành'));
  const P = [B.at(1, 'xây dựng'), B.at(1, 'huấn luyện'), B.at(2, 'thi'), B.at(2, 'quản lý')].map((v) => v - 0.15);
  P.forEach((a, i) => { flashOn(cards[i], a, i < 3 ? P[i + 1] : B.end + 1.2); cue(a, 'pop'); });
  master.fromTo($('.al', cards[3]), { scale: 0.6, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.4, ease: 'back.out(2.4)' }, P[3] + 0.3);
  return B.end + 1.2;
}

/* ---------- 8 · KẾT ---------- */
function E(t) {
  const S = sec('e');
  const { cam } = camSvg(S, yard('ye', DAWN));
  $('#ye-root').insertAdjacentHTML('beforeend', g({}, [worker('ew1', { x: 760, y: 800, s: 1.0, harness: true }), worker('ew2', { x: 880, y: 800, s: 1.0, helmet: '#E8EEF4', vest: '#FFC21A' }), worker('ew3', { x: 1000, y: 800, s: 1.0, helmet: '#F26A1B' })]));
  wavesOn(S);
  div('grad', S);
  div('big center m1', S, 'Để mỗi người lao động');
  div('big center m2', S, '<span class="gn">đều trở về nhà an toàn.</span>');
  div('cta', S, `<span>${ICON('phone')}Liên hệ tư vấn lộ trình huấn luyện</span>`);
  div('brand', S, `<div class="b"><i><img src="assets/logo.png" alt=""></i><div><strong>VIỆN STP</strong><small>Nghiên cứu & phát triển giải pháp</small></div></div><div class="x">${ICON('handshake')}</div><div class="b"><i><img src="assets/dako.png" alt=""></i><div><strong>CÔNG TY CPKT HÀNG HẢI DAKO</strong><small>Triển khai huấn luyện</small></div></div>`);
  div('ct', S, [['phone', 'HOTLINE', '0827.695.368'], ['mail', 'EMAIL', 'viencongnghestp@gmail.com'], ['globe', 'CỔNG ĐÀO TẠO', 'daotao.vienstp.com']].map(([ic, k, v]) => `<div>${ICON(ic)}<span><small>${k}</small><b>${v}</b></span></div>`).join(''));
  const B = say('e', t, { lead: 1.0, gap: 0.6 });
  master.fromTo(cam, { scale: 1.1 }, { scale: 1.0, duration: 12, ease: 'power1.out' }, t);
  tr('#ye-sunwrap', { y: 80 }).to(t, 8, { y: -40 }, 'out');
  tr('#ye-trolley').to(t + 0.5, 6, { x: 260 }, 'io');
  tr(J('ew2', 'ar r')).fn(t + 0.8, t + 14, (u) => ({ r: -150 + Math.sin(u * 7) * 25 }));
  tr(J('ew1', 'ar l')).fn(t + 1.4, t + 14, (u) => ({ r: -145 + Math.sin(u * 6 + 1) * 22 }));
  words('#e .m1', B[0].t + 0.2); words('#e .m2', B.at(0, 'đều trở về') - 0.15);
  mark(B[1].t - 0.2, 'sec_end');
  pop('#e .cta', B[1].t, { from: 0.8 }); cue(B[1].t, 'ding');
  master.fromTo('#e .brand', { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.7 }, B.at(1, 'Viện Ét Tê Pê') - 0.2);
  up('#e .ct > div', B.at(1, 'tư vấn') - 0.2, { y: 24, stagger: 0.12 });
  cue(t + 0.4, 'shiphorn'); cue(t + 0.2, 'waves');
  return B.end + 4.0;
}

/* ================= GHÉP CẢNH ================= */
const LOG = [];
const L = (n, f) => (...a) => { const v = f(...a); LOG.push([n, +a[0].toFixed(2), +v.toFixed(2)]); return v; };
function build() {
  ['h', 'd', 'r0', 'r1', 'r2', 'r3', 'r4', 'r5', 'r6', 'r7', 'r8', 'rx', 't', 'a', 'g', 's', 'e'].forEach((id) => sec(id)); // tạo sẵn để lệnh chuyển cảnh tìm thấy
  let t, x;
  t = L('H', H)(0);
  x = fadeTo(t, '#h', '#d', 1.0); mark(x, 'downbeat'); t = L('D', D)(x);
  x = zoomCut(t, '#d', '#r0'); t = L('R0', R0)(x);
  const RS = [R1, R2, R3, R4, R5, R6, R7, R8];
  let prev = '#r0';
  RS.forEach((fn, i) => { x = cutTo(t, prev, `#r${i + 1}`); t = L(`R${i + 1}`, fn)(x); prev = `#r${i + 1}`; });
  x = cutTo(t, prev, '#rx'); t = L('RX', RX)(x);
  x = zoomCut(t, '#rx', '#t'); t = L('T', Tn)(x);
  x = toLight(t, '#t', '#a'); show('#bug', x + 0.3); master.fromTo('#bug', { autoAlpha: 0 }, { autoAlpha: 1, duration: 0.5, immediateRender: false }, x + 0.3); t = L("A", Adv)(x);
  x = slide(t, '#a', '#g'); t = L('G', G)(x);
  master.fromTo('#bug', { autoAlpha: 1 }, { autoAlpha: 0, duration: 0.3, immediateRender: false }, t);
  x = slide(t, '#g', '#s'); t = L('S', Sv)(x);
  x = toDark(t, '#s', '#e', 1.0); t = L('E', E)(x);
  const FXG = $('#fx').getContext('2d');
  UPD.push((tt) => { FXG.clearRect(0, 0, 1920, 1080); FX.forEach((f) => { if (tt >= f.t0 && tt <= f.t1) f.fn(FXG, tt); }); });
  UPD.push(trApply); UPD.push(pfxApply);
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
  await document.fonts.ready;
  await Promise.all(['800', '900'].map((w) => document.fonts.load(`${w} 96px "Be Vietnam Pro"`)));
  const dur = build();
  await loadIcons();
  await Promise.all($$('img').map((i) => (i.complete ? Promise.resolve() : new Promise((r) => { i.onload = i.onerror = r; }))));
  await Promise.all($$('img').map((i) => i.decode().catch(() => {})));
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
