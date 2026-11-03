/* Hình vẽ (SVG) cho video ngành đóng tàu – cảng biển: nhà máy, công nhân, cẩu, tàu, xe, két…
   Mọi chuyển động là hàm thuần của thời gian t (track/fn + hạt trên canvas) → render tất định qua __seek(t). */

/* ---------- dựng chuỗi SVG ---------- */
const A = (o) => Object.entries(o).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => `${k}="${v}"`).join(' ');
const h = (tag, o = {}, inner) => (inner === undefined ? `<${tag} ${A(o)}/>` : `<${tag} ${A(o)}>${inner}</${tag}>`);
const g = (o, inner) => h('g', o, Array.isArray(inner) ? inner.join('') : inner);
const R = (x, y, w, hh, f, o = {}) => h('rect', { x, y, width: w, height: hh, fill: f, ...o });
const C = (cx, cy, r, f, o = {}) => h('circle', { cx, cy, r, fill: f, ...o });
const P = (d, f, o = {}) => h('path', { d, fill: f, ...o });
const Ln = (x1, y1, x2, y2, s, w = 2, o = {}) => h('line', { x1, y1, x2, y2, stroke: s, 'stroke-width': w, ...o });
const T = (x, y, txt, o = {}) => h('text', { x, y, ...o }, txt);
const svgWrap = (inner, defs = '') => `<svg viewBox="0 0 1920 1080" preserveAspectRatio="xMidYMid slice" xmlns="http://www.w3.org/2000/svg"><defs>${defs}</defs>${inner}</svg>`;
const lin = (id, stops, x2 = 0, y2 = 1) => `<linearGradient id="${id}" x1="0" y1="0" x2="${x2}" y2="${y2}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</linearGradient>`;
const rad = (id, stops) => `<radialGradient id="${id}">${stops.map(([o, c, a]) => `<stop offset="${o}" stop-color="${c}"${a !== undefined ? ` stop-opacity="${a}"` : ''}/>`).join('')}</radialGradient>`;
const stripes = (id, a = '#FFC21A', b = '#141414', w = 18) => `<pattern id="${id}" width="${w * 2}" height="${w * 2}" patternUnits="userSpaceOnUse" patternTransform="rotate(45)">${R(0, 0, w, w * 2, a)}${R(w, 0, w, w * 2, b)}</pattern>`;

/* ---------- chuyển động: track (khung hình khoá) + fn (hàm theo t) ---------- */
const TRK = [];
const EZ = {
  lin: (v) => v, out: (v) => 1 - Math.pow(1 - v, 3), in: (v) => v * v * v, io: (v) => (v < 0.5 ? 4 * v * v * v : 1 - Math.pow(-2 * v + 2, 3) / 2),
  back: (v) => { const c1 = 1.7, c3 = c1 + 1; return 1 + c3 * Math.pow(v - 1, 3) + c1 * Math.pow(v - 1, 2); },
};
// tr(el, base): base = {x,y,r,s,sx,sy,o}; .to(t, d, {…}, ease) đổi giá trị trong [t, t+d]; .fn(t0, t1, f) cộng thêm f(t) (dao động)
function tr(sel, base = {}) {
  const el = typeof sel === 'string' ? document.querySelector(sel) : sel;
  if (!el) { console.error('tr: thiếu', sel); return { to() { return this; }, fn() { return this; }, set() { return this; } }; }
  const o = { el, base: { x: 0, y: 0, r: 0, s: 1, sx: 1, sy: 1, o: 1, ...base }, keys: [], fns: [], last: '' };
  o.to = (t, d, v, ease = 'io') => { o.keys.push({ t, d: Math.max(d, 1e-4), v, ease: EZ[ease] || ease }); o.keys.sort((a, b) => a.t - b.t); return o; };
  o.set = (t, v) => o.to(t, 1e-4, v, 'lin');
  o.fn = (t0, t1, f) => { o.fns.push({ t0, t1, f }); return o; };
  TRK.push(o);
  return o;
}
function trApply(t) {
  TRK.forEach((o) => {
    const v = { ...o.base };
    o.keys.forEach((k) => {
      if (t < k.t) return;
      const p = k.ease(clamp01((t - k.t) / k.d));
      Object.entries(k.v).forEach(([key, val]) => { const a = k.from?.[key] ?? v[key]; v[key] = a + (val - a) * p; });
    });
    o.fns.forEach((f) => { if (t >= f.t0 && t <= f.t1) Object.entries(f.f(t - f.t0, t) || {}).forEach(([key, val]) => { v[key] += val; }); });
    const s = `translate(${v.x.toFixed(2)} ${v.y.toFixed(2)}) rotate(${v.r.toFixed(2)}) scale(${(v.s * v.sx).toFixed(4)} ${(v.s * v.sy).toFixed(4)})`;
    const key = s + '|' + v.o.toFixed(3);
    if (key !== o.last) { o.el.setAttribute('transform', s); o.el.style.opacity = v.o.toFixed(3); o.last = key; }
  });
}

/* ---------- hạt trên canvas riêng của từng cảnh ---------- */
const PFX = [];
const pfx = (cv, t0, t1, draw) => PFX.push({ cv, g: cv.getContext('2d'), t0, t1, draw });
function pfxApply(t) {
  const dirty = new Set();
  PFX.forEach((p) => { if (!dirty.has(p.cv)) { p.g.clearRect(0, 0, p.cv.width, p.cv.height); dirty.add(p.cv); } });
  PFX.forEach((p) => { if (t >= p.t0 && t <= p.t1) { p.g.save(); p.draw(p.g, t); p.g.restore(); } });
}
// tia lửa hàn: bắn ra từ (x,y) theo góc a ± spread, rơi theo trọng lực
function sparks(cv, x, y, t0, t1, o = {}) {
  const rate = o.rate ?? 70, a0 = o.a ?? -Math.PI / 2, sp = o.spread ?? 1.4, v0 = o.v ?? 420, life = o.life ?? 0.8, gr = o.g ?? 900, seed = o.seed ?? 3;
  pfx(cv, t0, t1 + life, (gx, t) => {
    const n0 = Math.max(0, Math.floor((t - life - t0) * rate)), n1 = Math.floor((Math.min(t, t1) - t0) * rate);
    gx.lineCap = 'round';
    for (let i = n0; i <= n1; i++) {
      const tb = t0 + i / rate, age = t - tb;
      if (age < 0 || age > life * (0.5 + 0.5 * hash(i, seed))) continue;
      const an = a0 + (hash(i, seed + 1) - 0.5) * sp, vv = v0 * (0.4 + 0.8 * hash(i, seed + 2));
      const px = x + Math.cos(an) * vv * age, py = y + Math.sin(an) * vv * age + 0.5 * gr * age * age;
      const vx = Math.cos(an) * vv, vy = Math.sin(an) * vv + gr * age, k = 0.018;
      const al = 1 - age / life;
      gx.strokeStyle = `rgba(255,${180 + Math.floor(70 * hash(i, 9))},${80 + Math.floor(100 * al)},${al})`;
      gx.lineWidth = 2.2;
      gx.beginPath(); gx.moveTo(px, py); gx.lineTo(px - vx * k, py - vy * k); gx.stroke();
    }
    if (o.glow !== false && t <= t1) { // quầng sáng hồ quang nhấp nháy
      const fl = 0.55 + 0.45 * hash(Math.floor(t * 24), seed);
      const gr2 = gx.createRadialGradient(x, y, 0, x, y, 70 * fl);
      gr2.addColorStop(0, `rgba(255,250,230,${0.95 * fl})`); gr2.addColorStop(0.25, `rgba(160,210,255,${0.55 * fl})`); gr2.addColorStop(1, 'rgba(120,180,255,0)');
      gx.fillStyle = gr2; gx.beginPath(); gx.arc(x, y, 70 * fl, 0, 6.283); gx.fill();
    }
  });
}
// nước bắn tung + vòng sóng loang
function splash(cv, x, y, t0, o = {}) {
  const n = o.n ?? 70, life = o.life ?? 1.4, seed = o.seed ?? 5;
  pfx(cv, t0, t0 + life + 1.2, (gx, t) => {
    const age = t - t0;
    for (let i = 0; i < n; i++) {
      const an = -Math.PI / 2 + (hash(i, seed) - 0.5) * 2.2, vv = 300 + 520 * hash(i, seed + 1), a = age * (0.75 + 0.5 * hash(i, 3));
      if (a > life) continue;
      const px = x + Math.cos(an) * vv * a, py = y + Math.sin(an) * vv * a + 0.5 * 1500 * a * a;
      if (py > y + 30) continue;
      const r = 3 + 6 * hash(i, seed + 2);
      gx.fillStyle = `rgba(210,236,255,${0.9 * (1 - a / life)})`;
      gx.beginPath(); gx.arc(px, py, r, 0, 6.283); gx.fill();
    }
    for (let k = 0; k < 3; k++) { // vòng sóng
      const a = age - k * 0.25; if (a < 0) continue;
      const rr = 40 + a * 260, al = Math.max(0, 0.7 - a * 0.35);
      gx.strokeStyle = `rgba(220,240,255,${al})`; gx.lineWidth = 4;
      gx.beginPath(); gx.ellipse(x, y + 10, rr, rr * 0.18, 0, 0, 6.283); gx.stroke();
    }
  });
}
// khói / khí độc: đám tròn mờ bay lên
function puffs(cv, x, y, w, t0, t1, o = {}) {
  const rate = o.rate ?? 10, life = o.life ?? 3, col = o.col ?? '150,160,170', rise = o.rise ?? 80, r0 = o.r ?? 40, seed = o.seed ?? 7, al0 = o.a ?? 0.45;
  pfx(cv, t0, t1 + life, (gx, t) => {
    const n0 = Math.max(0, Math.floor((t - life - t0) * rate)), n1 = Math.floor((Math.min(t, t1) - t0) * rate);
    for (let i = n0; i <= n1; i++) {
      const tb = t0 + i / rate, age = t - tb; if (age < 0 || age > life) continue;
      const k = age / life, px = x + (hash(i, seed) - 0.5) * w + Math.sin(age * 1.5 + i) * 18, py = y - rise * age;
      const r = r0 * (0.6 + 1.2 * k) * (0.7 + 0.6 * hash(i, seed + 1));
      const al = al0 * Math.sin(Math.PI * k);
      const gr2 = gx.createRadialGradient(px, py, 0, px, py, r);
      gr2.addColorStop(0, `rgba(${col},${al})`); gr2.addColorStop(1, `rgba(${col},0)`);
      gx.fillStyle = gr2; gx.beginPath(); gx.arc(px, py, r, 0, 6.283); gx.fill();
    }
  });
}
// mưa chéo
function rain(cv, t0, t1, o = {}) {
  const n = o.n ?? 160, x0 = o.x ?? 0, y0 = o.y ?? 0, w = o.w ?? 1920, hh = o.h ?? 1080;
  pfx(cv, t0, t1, (gx, t) => {
    gx.strokeStyle = 'rgba(190,215,240,0.55)'; gx.lineWidth = 2;
    for (let i = 0; i < n; i++) {
      const sp = 900 + 500 * hash(i, 2), ph = hash(i, 3) * hh;
      const yy = y0 + ((ph + (t - t0) * sp) % hh), xx = x0 + ((hash(i, 4) * w + (t - t0) * sp * 0.35 + (yy - y0) * 0.35) % w);
      gx.beginPath(); gx.moveTo(xx, yy); gx.lineTo(xx - 9, yy - 26); gx.stroke();
    }
  });
}
// cầu lửa nổ
function blast(cv, x, y, t0, o = {}) {
  const R0 = o.r ?? 520, life = o.life ?? 1.6;
  pfx(cv, t0, t0 + life + 1.5, (gx, t) => {
    const a = t - t0, k = clamp01(a / life);
    const r = R0 * (1 - Math.pow(1 - clamp01(a / 0.45), 3));
    const al = a < 0.45 ? 1 : Math.max(0, 1 - (a - 0.45) / (life - 0.2));
    const gr2 = gx.createRadialGradient(x, y, 0, x, y, r);
    gr2.addColorStop(0, `rgba(255,250,220,${al})`); gr2.addColorStop(0.3, `rgba(255,190,60,${al})`);
    gr2.addColorStop(0.65, `rgba(240,90,20,${0.85 * al})`); gr2.addColorStop(1, 'rgba(120,20,0,0)');
    gx.fillStyle = gr2; gx.beginPath(); gx.arc(x, y, r, 0, 6.283); gx.fill();
    for (let i = 0; i < 60; i++) { // mảnh văng
      const an = hash(i, 11) * 6.283, vv = 400 + 900 * hash(i, 12), aa = Math.min(a, 1.2);
      const px = x + Math.cos(an) * vv * aa, py = y + Math.sin(an) * vv * aa + 600 * aa * aa;
      gx.fillStyle = `rgba(255,${120 + Math.floor(100 * hash(i, 13))},40,${Math.max(0, 1 - a / 1.2)})`;
      gx.fillRect(px, py, 5, 5);
    }
    if (a > 0.3) { // khói đen sau nổ
      for (let i = 0; i < 14; i++) {
        const aa = a - 0.3, an = hash(i, 21) * 6.283, d = 120 + 260 * hash(i, 22) * Math.min(1, aa);
        const px = x + Math.cos(an) * d, py = y + Math.sin(an) * d * 0.6 - aa * 120, rr = 120 + 80 * hash(i, 23) + aa * 60;
        const al2 = Math.min(0.55, aa * 0.8) * Math.max(0, 1 - (a - life) / 1.5);
        const g3 = gx.createRadialGradient(px, py, 0, px, py, rr);
        g3.addColorStop(0, `rgba(40,30,30,${al2})`); g3.addColorStop(1, 'rgba(40,30,30,0)');
        gx.fillStyle = g3; gx.beginPath(); gx.arc(px, py, rr, 0, 6.283); gx.fill();
      }
    }
  });
}
// tia hồ quang điện (đường gấp khúc ngẫu nhiên đổi theo khung hình)
function arcs(cv, x0, y0, x1, y1, t0, t1, o = {}) {
  const n = o.n ?? 3;
  pfx(cv, t0, t1, (gx, t) => {
    const f = Math.floor(t * 30);
    if (hash(f, 5) < 0.2) return;
    for (let k = 0; k < n; k++) {
      gx.strokeStyle = k ? 'rgba(150,200,255,0.75)' : 'rgba(240,250,255,1)'; gx.lineWidth = k ? 3 : 5;
      gx.shadowColor = '#8EC5FF'; gx.shadowBlur = 24;
      gx.beginPath(); gx.moveTo(x0, y0);
      const seg = 9;
      for (let i = 1; i < seg; i++) {
        const u = i / seg, jx = (hash(f * 7 + i, k + 1) - 0.5) * 70, jy = (hash(f * 7 + i, k + 9) - 0.5) * 70;
        gx.lineTo(x0 + (x1 - x0) * u + jx, y0 + (y1 - y0) * u + jy);
      }
      gx.lineTo(x1, y1); gx.stroke();
    }
    gx.shadowBlur = 0;
  });
}

/* ---------- nhân vật: công nhân (gốc toạ độ ở giữa hai bàn chân) ---------- */
// các khớp: .j trong g.lg.l / g.lg.r / g.ar.l / g.ar.r — xoay quanh khớp hông, vai
function worker(id, o = {}) {
  const c = { helmet: '#FFC21A', vest: '#F26A1B', shirt: '#2A4A78', pants: '#1B2F4B', skin: '#EDB98F', boot: '#26282C', strip: '#E8F0F2', ...o };
  const leg = (cls, dx) => g({ class: `lg ${cls}`, transform: `translate(${dx} -86)` }, g({ class: 'j' }, [R(-9, 0, 18, 80, c.pants, { rx: 8 }), R(-12, 72, 26, 14, c.boot, { rx: 5 })]));
  const arm = (cls, dx, extra = '') => g({ class: `ar ${cls}`, transform: `translate(${dx} -150)` }, g({ class: 'j' }, [R(-8, 0, 16, 68, c.shirt, { rx: 8 }), C(0, 72, 9.5, c.glove || c.skin), extra]));
  const harness = o.harness ? [P('M-22 -150 L18 -88 M22 -150 L-18 -88', 'none', { stroke: '#1E1E1E', 'stroke-width': 5 }), C(0, -104, 6, '#C9CED6')] : [];
  const mask = o.mask ? [R(-21, -197, 42, 30, '#2E3440', { rx: 6 }), R(-14, -188, 28, 9, '#7FD1FF', { rx: 3, opacity: 0.85 })] : [];
  return g({ id, transform: `translate(${o.x || 0} ${o.y || 0}) scale(${o.s || 1})` }, g({ class: 'bd' }, [
    leg('l', -11), leg('r', 11),
    arm('l', -25),
    R(-27, -162, 54, 84, c.shirt, { rx: 16 }),
    P('M-27 -150 Q-27 -162 -15 -162 L15 -162 Q27 -162 27 -150 L27 -84 L-27 -84 Z', c.vest),
    R(-27, -128, 54, 7, c.strip, { opacity: 0.9 }), R(-27, -108, 54, 7, c.strip, { opacity: 0.9 }),
    ...harness,
    R(-7, -172, 14, 12, c.skin),
    C(0, -184, 19, c.skin),
    P('M-23 -188 A23 23 0 0 1 23 -188 Z', c.helmet), R(-28, -190, 56, 6, c.helmet, { rx: 3 }), R(-3, -210, 6, 18, 'rgba(0,0,0,.12)'),
    ...mask,
    arm('r', 25, o.tool || ''),
  ]));
}
// hình người tối giản (bóng) cho cảnh xa
const tiny = (x, y, s = 1, col = '#0E1A2B', helmet = '#FFC21A') => g({ transform: `translate(${x} ${y}) scale(${s})` }, [R(-6, -30, 12, 30, col, { rx: 4 }), C(0, -36, 6, col), P('M-7 -38 A7 7 0 0 1 7 -38 Z', helmet)]);

/* ---------- vật thể ---------- */
function hull(x, y, w, hgt, p) { // thân tàu, mũi bên phải; y = mép boong
  const wl = y + hgt * 0.58;
  return g({}, [
    P(`M${x} ${y} L${x + w * 0.86} ${y} Q${x + w * 0.97} ${y} ${x + w} ${y + hgt * 0.12} L${x + w * 0.93} ${y + hgt} L${x + w * 0.06} ${y + hgt} Q${x} ${y + hgt * 0.7} ${x} ${y} Z`, p.hull),
    P(`M${x + w * 0.012} ${wl} L${x + w * 0.965} ${wl} L${x + w * 0.93} ${y + hgt} L${x + w * 0.06} ${y + hgt} Q${x + w * 0.02} ${y + hgt * 0.82} ${x + w * 0.012} ${wl} Z`, p.red),
    R(x, y - 6, w * 0.88, 10, p.deck),
    ...Array.from({ length: 11 }, (_, i) => Ln(x + w * (0.08 + i * 0.08), y + 6, x + w * (0.08 + i * 0.08), wl, p.seam, 2)),
  ]);
}
function superstructure(x, y, p) { // khối ca bin đuôi tàu
  const rows = [0, 1, 2, 3].map((r) => Array.from({ length: 6 }, (_, i) => R(x + 18 + i * 28, y + 22 + r * 38, 16, 14, p.win, { rx: 2 })).join(''));
  return g({}, [R(x, y, 200, 170, p.super), R(x + 20, y - 40, 160, 44, p.super), R(x + 120, y - 120, 46, 84, p.funnel), R(x + 120, y - 120, 46, 14, p.red), ...rows]);
}
function scaffold(x, y0, y1, n, gap, col) {
  const out = [];
  for (let i = 0; i <= n; i++) out.push(Ln(x + i * gap, y0, x + i * gap, y1, col, 4));
  for (let yy = y0; yy <= y1; yy += 90) out.push(Ln(x, yy, x + n * gap, yy, col, 4), R(x, yy - 8, n * gap, 8, col, { opacity: 0.8 }));
  for (let i = 0; i < n; i++) out.push(Ln(x + i * gap, y1, x + (i + 1) * gap, y1 - 90, col, 2, { opacity: 0.6 }));
  return g({}, out);
}
function gantry(x0, x1, top, ground, p, sid) { // cổng trục
  const leg = (x) => g({}, [P(`M${x - 30} ${ground} L${x - 8} ${top + 60} L${x + 8} ${top + 60} L${x + 30} ${ground} Z`, p.crane), R(x - 46, ground - 16, 92, 16, p.craneDark)]);
  return g({}, [leg(x0), leg(x1), R(x0 - 60, top, x1 - x0 + 120, 64, p.crane), R(x0 - 60, top + 50, x1 - x0 + 120, 14, `url(#${sid})`), R(x0 - 60, top - 18, 70, 18, p.craneDark)]);
}
function towerCrane(x, ground, top, p) {
  const mast = [];
  for (let yy = top; yy < ground; yy += 40) mast.push(Ln(x - 16, yy, x + 16, yy + 40, p.crane, 3), Ln(x + 16, yy, x - 16, yy + 40, p.crane, 3));
  return g({}, [Ln(x - 16, top, x - 16, ground, p.crane, 6), Ln(x + 16, top, x + 16, ground, p.crane, 6), ...mast,
    R(x - 300, top - 14, 520, 16, p.crane), R(x + 100, top - 14, 120, 26, p.craneDark), P(`M${x - 16} ${top - 14} L${x} ${top - 80} L${x + 16} ${top - 14} Z`, p.crane),
    Ln(x, top - 80, x - 300, top - 12, p.crane, 2), Ln(x, top - 80, x + 210, top - 12, p.crane, 2), R(x - 34, top + 4, 50, 40, p.craneDark)]);
}
function container(x, y, w, hh, col) {
  const ribs = Array.from({ length: Math.floor(w / 12) }, (_, i) => Ln(x + 6 + i * 12, y + 4, x + 6 + i * 12, y + hh - 4, 'rgba(0,0,0,.18)', 2)).join('');
  return g({}, [R(x, y, w, hh, col, { rx: 2 }), ribs, R(x, y, w, 4, 'rgba(255,255,255,.18)')]);
}
function containers(x, y, cols, rows, w, hh, pal, seed = 1) {
  const out = [];
  for (let r = 0; r < rows; r++) for (let c = 0; c < cols; c++) {
    if (r === rows - 1 && hash(c, seed) < 0.3) continue;
    out.push(container(x + c * (w + 6), y - (r + 1) * (hh + 4), w, hh, pal[Math.floor(hash(c + r * 7, seed + 3) * pal.length)]));
  }
  return g({}, out);
}
function bollard(x, y, col = '#2C3440') { return g({}, [R(x - 22, y - 12, 44, 12, col, { rx: 3 }), R(x - 14, y - 40, 28, 30, col, { rx: 6 }), R(x - 20, y - 46, 40, 10, col, { rx: 4 })]); }
function hook(x, y, col = '#FFC21A') { return g({}, [R(x - 26, y, 52, 34, col, { rx: 6 }), P(`M${x} ${y + 34} l0 22 q0 26 -22 26 q-18 0 -18 -18`, 'none', { stroke: '#2C3440', 'stroke-width': 9, 'stroke-linecap': 'round' })]); }
function block(x, y, w, hh, p) { // tổng đoạn thân tàu (khối thép có gân)
  const st = Array.from({ length: 6 }, (_, i) => Ln(x + 14 + i * (w - 28) / 5, y + 10, x + 14 + i * (w - 28) / 5, y + hh - 10, 'rgba(0,0,0,.25)', 4)).join('');
  return g({}, [P(`M${x} ${y} L${x + w} ${y} L${x + w - 30} ${y + hh} L${x + 30} ${y + hh} Z`, p), st, R(x, y, w, 12, 'rgba(255,255,255,.15)')]);
}
function truck(x, y, col = '#E5484D', cont = '#2F7DB8') { // xe đầu kéo + container (mũi bên phải)
  return g({}, [container(x, y - 150, 440, 120, cont), R(x - 10, y - 32, 470, 16, '#1E2329'),
    P(`M${x + 470} ${y - 30} L${x + 470} ${y - 150} L${x + 560} ${y - 150} L${x + 600} ${y - 100} L${x + 600} ${y - 30} Z`, col),
    R(x + 525, y - 140, 50, 40, '#9FD3F5', { rx: 4 }), R(x + 590, y - 70, 14, 16, '#FFE08A'),
    ...[x + 40, x + 100, x + 380, x + 500, x + 560].map((cx) => g({}, [C(cx, y - 14, 26, '#15181C'), C(cx, y - 14, 11, '#6B7280')]))]);
}
function forklift(x, y, col = '#FFC21A') {
  return g({}, [R(x, y - 110, 130, 80, col, { rx: 10 }), R(x + 20, y - 190, 80, 84, 'none', { stroke: '#2C3440', 'stroke-width': 8, rx: 6 }), R(x + 140, y - 220, 12, 200, '#2C3440'), R(x + 150, y - 30, 80, 10, '#2C3440'),
    C(x + 30, y - 22, 24, '#15181C'), C(x + 110, y - 22, 24, '#15181C'), C(x + 30, y - 22, 9, '#6B7280'), C(x + 110, y - 22, 9, '#6B7280')]);
}
function cylinder(x, y, col, hh = 190) { return g({}, [R(x - 30, y - hh, 60, hh, col, { rx: 28 }), R(x - 12, y - hh - 26, 24, 30, '#9AA3AE', { rx: 4 }), R(x - 30, y - hh + 40, 60, 12, 'rgba(255,255,255,.25)')]); }
function drum(x, y, col) { return g({}, [R(x - 42, y - 120, 84, 120, col, { rx: 8 }), R(x - 42, y - 88, 84, 8, 'rgba(0,0,0,.25)'), R(x - 42, y - 40, 84, 8, 'rgba(0,0,0,.25)'), P(`M${x - 18} ${y - 70} l18 -30 l18 30 z`, '#FFC21A', { stroke: '#111', 'stroke-width': 3 })]); }
// biển tam giác cảnh báo
const warnTri = (x, y, s = 1, txt = '!') => g({ transform: `translate(${x} ${y}) scale(${s})` }, [P('M0 -70 L64 44 L-64 44 Z', '#FFC21A', { stroke: '#141414', 'stroke-width': 8, 'stroke-linejoin': 'round' }), T(0, 30, txt, { 'text-anchor': 'middle', 'font-size': 76, 'font-weight': 900, fill: '#141414', 'font-family': 'Be Vietnam Pro' })]);

/* ---------- toàn cảnh nhà máy đóng tàu (đêm / bình minh) ---------- */
const NIGHT = { sky0: '#06101F', sky1: '#173452', far: '#0C1B2E', sea0: '#0E2A44', sea1: '#06121F', hull: '#334A63', red: '#7A2A2C', deck: '#2A3D52', seam: 'rgba(0,0,0,.25)',
  super: '#3B5370', funnel: '#2A3B50', win: '#FFC56B', crane: '#C7922A', craneDark: '#7A5A1A', scaf: '#56708E', ground: '#1A2533', quay: '#253244', lamp: 1,
  cont: ['#2E5D86', '#8C3B33', '#3D6B4E', '#7E6A2C', '#4A4F7A'] };
const DAWN = { sky0: '#5FA8D3', sky1: '#FBD6A2', far: '#8BA7BE', sea0: '#3D86B5', sea1: '#1E5A86', hull: '#6E8BA6', red: '#C4473E', deck: '#55708C', seam: 'rgba(0,0,0,.18)',
  super: '#EEF2F5', funnel: '#2F5A86', win: '#3E6E96', crane: '#F2B632', craneDark: '#B07D14', scaf: '#8AA2BA', ground: '#8E97A3', quay: '#B5BEC8', lamp: 0,
  cont: ['#2F7DB8', '#D9534F', '#3FA06A', '#E0A526', '#6C6FC4'] };
function yard(id, p) {
  const sid = `${id}-st`;
  const defs = [lin(`${id}-sky`, [[0, p.sky0], [1, p.sky1]]), lin(`${id}-sea`, [[0, p.sea0], [1, p.sea1]]), stripes(sid), lin(`${id}-cone`, [[0, '#FFE2A8', 0.55], [1, '#FFE2A8', 0]]), rad(`${id}-sun`, [[0, '#FFF6D8'], [0.35, '#FFE1A0', 0.9], [1, '#FFD08A', 0]])].join('');
  const stars = p.lamp ? Array.from({ length: 70 }, (_, i) => C((hash(i, 1) * 1920).toFixed(0), (hash(i, 2) * 420).toFixed(0), (0.8 + hash(i, 3) * 1.6).toFixed(1), '#DDE8FF', { opacity: (0.3 + hash(i, 4) * 0.6).toFixed(2) })).join('') : '';
  const sun = p.lamp ? '' : g({ id: `${id}-sunwrap` }, [C(1580, 420, 260, `url(#${id}-sun)`), C(1580, 420, 70, '#FFF3D0')]);
  const far = P('M0 640 L120 610 L260 625 L380 590 L520 615 L700 600 L860 630 L1000 605 L1180 620 L1320 596 L1500 618 L1680 600 L1920 622 L1920 720 L0 720 Z', p.far);
  const farCranes = [300, 560, 1240, 1760].map((x, i) => g({ opacity: 0.8 }, [R(x, 520 - i * 8, 10, 110, p.far), R(x - 60, 520 - i * 8, 150, 8, p.far)])).join('');
  const cones = p.lamp ? [P('M160 230 L40 780 L300 780 Z', `url(#${id}-cone)`, { class: 'cone' }), P('M1620 250 L1480 780 L1760 780 Z', `url(#${id}-cone)`, { class: 'cone' })].join('') : '';
  const lamps = [160, 1620].map((x) => g({}, [R(x - 5, x === 160 ? 230 : 250, 10, 560, p.craneDark), R(x - 26, x === 160 ? 218 : 238, 52, 16, p.lamp ? '#FFE9B8' : '#C9D2DC', { rx: 4 })])).join('');
  const waves = Array.from({ length: 5 }, (_, i) => P('', 'none', { class: 'wv', 'data-y': 840 + i * 52, 'data-a': 6 + i * 3, stroke: p.lamp ? 'rgba(150,190,230,.25)' : 'rgba(255,255,255,.35)', 'stroke-width': 3 })).join('');
  const workersScaf = [tiny(700, 560, 1.2), tiny(860, 650, 1.2, '#0E1A2B', '#F26A1B'), tiny(1010, 470, 1.2), tiny(560, 470, 1.2, '#0E1A2B', '#E8EEF4')].join('');
  return svgWrap(g({ id: `${id}-root` }, [
    R(0, 0, 1920, 1080, `url(#${id}-sky)`), stars, sun, far, farCranes,
    R(0, 720, 1920, 360, `url(#${id}-sea)`),
    R(200, 700, 1350, 90, p.ground),
    cones,
    hull(330, 470, 1120, 300, p), superstructure(400, 300, p),
    scaffold(520, 470, 760, 9, 70, p.scaf), workersScaf,
    gantry(250, 1470, 170, 790, p, sid),
    g({ id: `${id}-trolley` }, [R(760, 234, 120, 40, p.craneDark, { rx: 4 }), Ln(800, 274, 800, 380, '#2C3440', 3), Ln(840, 274, 840, 380, '#2C3440', 3), hook(820, 380, p.crane)]),
    towerCrane(1760, 790, 300, p),
    containers(1520, 790, 3, 3, 120, 46, p.cont, 2),
    lamps,
    R(0, 780, 1920, 36, p.quay), ...[300, 700, 1100, 1500].map((x) => bollard(x, 790, p.lamp ? '#141C26' : '#4B5563')),
    g({ class: 'sea' }, waves),
  ]), defs);
}
// sóng: cập nhật path theo t
function wavesUpd(root) {
  const ws = [...root.querySelectorAll('.wv')];
  return (t) => ws.forEach((w, i) => {
    const y = +w.dataset.y, a = +w.dataset.a; let d = `M-20 ${y}`;
    for (let x = 0; x <= 1960; x += 40) d += ` L${x} ${(y + Math.sin(x / 90 + t * (1.2 + i * 0.2) + i) * a + Math.sin(x / 37 - t * 2) * a * 0.3).toFixed(1)}`;
    w.setAttribute('d', d);
  });
}
