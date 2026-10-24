/* Dựng cảnh 3D và giao diện từ dữ liệu trong du-lieu.js (window.HERAGRAIN). Đơn vị: mét. */
(function () {
"use strict";
const { PH, ZONES, STEPS, ROUTES, MAT_BANG, NHAN_PHU, KHUNG, GOC_NHIN, DIEU_CHINH, UOC_KICH_THUOC, CAN_XAC_NHAN } = window.HERAGRAIN;

/* ===== CẢNH 3D: dựng các khu, thiết bị, đường, luồng ===== */
const stage = document.getElementById('stage');
const canvas = document.getElementById('gl');
let renderer = null;
try {
  renderer = new THREE.WebGLRenderer({ canvas, antialias: true, preserveDrawingBuffer: true });
} catch (err) { renderer = null; }
if (!renderer) {
  stage.insertAdjacentHTML('beforeend', '<div class="fallback">Trình duyệt này không hiển thị được đồ họa 3D (WebGL). Hãy mở trang bằng Chrome, Edge, Safari hoặc Firefox bản mới.</div>');
}

const SCENE_PH = { 1: '#5E9E68', 2: '#23765C', 3: '#E4A92A', 4: '#86479B', 5: '#7B8A84' };
const THEMES = {
  light: { bg: 0xE4ECE7, ground: 0xD3DED7, apron: 0xE9EFEB, road: 0xB0BCB4, line: 0x7E9086, steelNew: 0xF3F6F4, steel: 0xC4CEC8,
    wait: { wall: 0x434F5A, floor: 0x56626D, prop: 0x35404A, accent: 0x66727E, edge: 0x232B32, op: 0.9 } },
  dark: { bg: 0x0F1713, ground: 0x121B16, apron: 0x18231D, road: 0x27322C, line: 0x3E4E44, steelNew: 0xDDE7E1, steel: 0x8FA097,
    wait: { wall: 0x313C47, floor: 0x252F38, prop: 0x3D4955, accent: 0x4C5967, edge: 0x5E6D7B, op: 0.92 } }
};
function isDark() {
  const t = document.documentElement.getAttribute('data-theme');
  if (t === 'dark') return true;
  if (t === 'light') return false;
  return window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
}
const TH = () => (isDark() ? THEMES.dark : THEMES.light);
const C = (h) => new THREE.Color(h);

const scene = new THREE.Scene();
const camera = new THREE.OrthographicCamera(-50, 50, 35, -35, 1, 2500);
const TARGET0 = new THREE.Vector3(...GOC_NHIN.iso.tgt);
camera.position.copy(TARGET0).addScaledVector(new THREE.Vector3(...GOC_NHIN.iso.dir).normalize(), 520);
camera.lookAt(TARGET0);

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
const hemi = new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.78);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(-70, 120, 55);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -75, right: 75, top: 60, bottom: -60, near: 10, far: 400 });
sun.shadow.bias = -0.0006;
scene.add(sun);

/* ---------- tiện ích hình học ---------- */
const geoCache = {};
const bx = (w, h, d) => geoCache[w + '|' + h + '|' + d] || (geoCache[w + '|' + h + '|' + d] = new THREE.BoxGeometry(w, h, d));
const edgeCache = new Map();
function edgesOf(geo) { if (!edgeCache.has(geo)) edgeCache.set(geo, new THREE.EdgesGeometry(geo)); return edgeCache.get(geo); }
const cylG = (r, h, s = 16) => geoCache['c' + r + '|' + h + '|' + s] || (geoCache['c' + r + '|' + h + '|' + s] = new THREE.CylinderGeometry(r, r, h, s));
const coneG = (r, h) => geoCache['k' + r + '|' + h] || (geoCache['k' + r + '|' + h] = new THREE.ConeGeometry(r, h, 8));

function mkMats() {
  const L = (extra) => new THREE.MeshLambertMaterial(Object.assign({ color: 0x888888, transparent: true }, extra || {}));
  return {
    floor: L(), wall: L(), prop: L(), accent: L(),
    roof: L({ opacity: 0.15, depthWrite: false, side: THREE.DoubleSide }),
    edge: new THREE.LineBasicMaterial({ color: 0x222222, transparent: true })
  };
}

function put(z, geo, mat, x, y, zz, o) {
  o = o || {};
  const m = new THREE.Mesh(geo, mat);
  m.position.set(x, y, zz);
  m.castShadow = o.cast !== false;
  m.receiveShadow = true;
  if (o.ry) m.rotation.y = o.ry;
  if (o.rx) m.rotation.x = o.rx;
  if (o.edge !== false && geo.type === 'BoxGeometry') m.add(new THREE.LineSegments(edgesOf(geo), z.m.edge));
  z.g.add(m);
  return m;
}
const FY = 0.15; // mặt sàn
const WT = 0.22; // độ dày tường

function dims(z) { const [x0, x1, z0, z1] = z.box; return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 }; }
const wallHOf = (z) => z.wallH || Math.min(2.2, z.h * 0.45);

function floorSlab(z, grow) {
  if (z.noFloor) return;
  const k = dims(z);
  put(z, bx(k.w + (grow || 0), FY, k.d + (grow || 0)), z.m.floor, k.cx, FY / 2, k.cz, { cast: false });
}

/* một mặt tường, chừa lối đi theo doors; y0 chân tường, hgt chiều cao */
function wallSide(z, s, y0, hgt, mat, thick) {
  const k = dims(z);
  const sd = {
    N: { len: k.w, axis: 'x', fixed: k.z0, from: k.x0 }, S: { len: k.w, axis: 'x', fixed: k.z1, from: k.x0 },
    W: { len: k.d, axis: 'z', fixed: k.x0, from: k.z0 }, E: { len: k.d, axis: 'z', fixed: k.x1, from: k.z0 }
  }[s];
  const gaps = (z.doors || []).filter((d) => d.side === s).map((d) => [d.at - d.w / 2, d.at + d.w / 2]).sort((a, b) => a[0] - b[0]);
  let cur = sd.from; const end = sd.from + sd.len; const segs = [];
  gaps.forEach((gp) => { if (gp[0] > cur) segs.push([cur, gp[0]]); cur = Math.max(cur, gp[1]); });
  if (cur < end) segs.push([cur, end]);
  segs.forEach(([a, b]) => {
    const l = b - a, c = (a + b) / 2;
    if (l < 0.05) return;
    if (sd.axis === 'x') put(z, bx(l, hgt, thick), mat, c, y0 + hgt / 2, sd.fixed);
    else put(z, bx(thick, hgt, l), mat, sd.fixed, y0 + hgt / 2, c);
  });
}
const sidesOf = (z) => ['N', 'S', 'W', 'E'].filter((s) => !(z.open || []).includes(s));
function walls(z, wallH) { sidesOf(z).forEach((s) => wallSide(z, s, FY, wallH, z.m.wall, WT)); }

function roofFrame(z, wallH) {
  if (z.noRoof) return;
  const k = dims(z), postH = z.h - FY - wallH;
  // mái trong suốt để nhìn thấy bên trong, kèm cột góc
  put(z, bx(k.w + 0.3, 0.12, k.d + 0.3), z.m.roof, k.cx, z.h, k.cz, { cast: false });
  if (postH > 0.1) [[k.x0, k.z0], [k.x1, k.z0], [k.x0, k.z1], [k.x1, k.z1]].forEach(([px, pz]) => put(z, bx(0.2, postH, 0.2), z.m.wall, px, FY + wallH + postH / 2, pz, { edge: false }));
}
/* mái dốc hai mái, nóc chạy theo trục x */
function gableRoof(z, eaveY, ridgeY, mat) {
  const k = dims(z), run = k.d / 2 + 0.3, rise = ridgeY - eaveY, ang = Math.atan2(rise, run), L = Math.hypot(run, rise);
  [-1, 1].forEach((sg) => put(z, bx(k.w + 0.5, 0.1, L), mat, k.cx, eaveY + rise / 2, k.cz + sg * run / 2, { rx: sg * ang, cast: false }));
}

/* ---------- từng kiểu khu ---------- */
function hall(z) { const wh = wallHOf(z); floorSlab(z); walls(z, wh); roofFrame(z, wh); }
function block(z) {
  const k = dims(z), H = z.h - FY;
  floorSlab(z, 0.6);
  put(z, bx(k.w, H, k.d), z.m.wall, k.cx, FY + H / 2, k.cz);
  put(z, bx(k.w + 0.4, 0.25, k.d + 0.4), z.m.prop, k.cx, z.h + 0.125, k.cz);
  put(z, bx(k.w * 0.8, 0.5, 0.06), z.m.accent, k.cx, FY + H * 0.68, k.z1 + 0.03, { edge: false });
  put(z, bx(0.06, 0.5, k.d * 0.7), z.m.accent, k.x0 - 0.03, FY + H * 0.68, k.cz, { edge: false });
  const cua = z.cua || 'S', ns = cua === 'N' || cua === 'S';
  const cx = cua === 'W' ? k.x0 - 0.05 : cua === 'E' ? k.x1 + 0.05 : k.cx, cz = cua === 'N' ? k.z0 - 0.05 : cua === 'S' ? k.z1 + 0.05 : k.cz;
  put(z, ns ? bx(0.9, 2, 0.1) : bx(0.1, 2, 0.9), z.m.accent, cx, FY + 1, cz, { edge: false });
}
function house(z) { const wh = wallHOf(z); floorSlab(z); walls(z, wh); gableRoof(z, FY + wh, z.h, z.m.roof); }
function path(z) {
  const k = dims(z), alongZ = k.d >= k.w;
  put(z, bx(k.w, 0.08, k.d), z.m.floor, k.cx, 0.12, k.cz, { cast: false, edge: false });
  // nét chấm hai bên lối đi
  const L = alongZ ? k.d : k.w;
  for (let t = 0.6; t < L - 0.3; t += 1.4) {
    if (alongZ) [k.x0 + 0.2, k.x1 - 0.2].forEach((x) => put(z, bx(0.12, 0.04, 0.7), z.m.accent, x, 0.18, k.z0 + t, { cast: false, edge: false }));
    else [k.z0 + 0.2, k.z1 - 0.2].forEach((zz) => put(z, bx(0.7, 0.04, 0.12), z.m.accent, k.x0 + t, 0.18, zz, { cast: false, edge: false }));
  }
  // cửa vào xưởng ở đầu nam: khung cổng và vạch gạch chéo
  [k.x0, k.x1].forEach((x) => put(z, bx(0.25, z.h, 0.25), z.m.wall, x, FY + z.h / 2, k.z1));
  put(z, bx(k.w + 0.25, 0.3, 0.3), z.m.wall, k.cx, FY + z.h, k.z1);
  for (let i = 0; i < 4; i++) put(z, bx(0.14, 0.04, 1.1), z.m.accent, k.x0 + 0.5 + i * (k.w - 1) / 3, 0.18, k.z1 - 0.6, { ry: Math.PI / 4, cast: false, edge: false });
}
function trees(z) {
  const k = dims(z);
  put(z, bx(k.w, 0.1, k.d), z.m.floor, k.cx, 0.05, k.cz, { cast: false, edge: false });
  for (let x = k.x0 + 1.6; x < k.x1; x += 3.2) {
    for (let zz = k.z0 + 1.6; zz < k.z1; zz += 3.2) {
      put(z, bx(0.3, 1.2, 0.3), z.m.prop, x, 0.6, zz, { edge: false });
      put(z, coneG(1.2, 2.6), z.m.accent, x, 2.4, zz, { edge: false });
    }
  }
}
function woodshed(z) {
  const k = dims(z), ph = z.h - FY;
  floorSlab(z);
  [[k.x0, k.z0], [k.x1, k.z0], [k.x0, k.z1], [k.x1, k.z1], [k.cx, k.z0], [k.cx, k.z1]].forEach(([px, pz]) => put(z, bx(0.2, ph, 0.2), z.m.wall, px, FY + ph / 2, pz, { edge: false }));
  put(z, bx(k.w + 0.4, 0.12, k.d + 0.4), z.m.roof, k.cx, z.h, k.cz, { cast: false });
}
function dryhouse(z) {
  const k = dims(z), low = 0.5, wh = wallHOf(z);
  floorSlab(z);
  ['N', 'S', 'W', 'E'].forEach((s) => { wallSide(z, s, FY, low, z.m.wall, 0.18); wallSide(z, s, FY + low, wh - low, z.m.roof, 0.06); });
  for (let i = 0; i <= 4; i++) [k.z0, k.z1].forEach((pz) => put(z, bx(0.15, wh, 0.15), z.m.prop, k.x0 + i * k.w / 4, FY + wh / 2, pz, { edge: false }));
  gableRoof(z, FY + wh, z.h, z.m.roof);
}
function utility(z) {
  const k = dims(z), tx = k.x0 + 1.5, tz = k.z0 + 1.5;
  floorSlab(z);
  [[-0.6, -0.6], [0.6, -0.6], [-0.6, 0.6], [0.6, 0.6]].forEach(([a, b]) => put(z, bx(0.15, 2.2, 0.15), z.m.wall, tx + a, FY + 1.1, tz + b, { edge: false }));
  put(z, bx(1.6, 0.15, 1.6), z.m.wall, tx, FY + 2.25, tz);
  put(z, cylG(0.8, 1.5), z.m.prop, tx, FY + 3.05, tz, { edge: false });
  put(z, cylG(0.86, 0.12), z.m.accent, tx, FY + 3.85, tz, { edge: false });
  put(z, cylG(0.3, 1.3), z.m.accent, k.x1 - 0.7, FY + 0.65, k.z0 + 3.2, { edge: false });
  put(z, bx(0.8, 0.6, 0.6), z.m.prop, k.x0 + 1, FY + 0.3, k.z0 + 3.4);
  put(z, bx(k.w - 0.4, 0.12, 1.8), z.m.wall, k.cx, FY + 0.06, k.z1 - 1.1, { cast: false });
  [k.x0 + 1, k.x1 - 1].forEach((x) => put(z, cylG(0.35, 0.1), z.m.accent, x, FY + 0.17, k.z1 - 1.1, { edge: false }));
}
/* bể tự hoại, hố lắng: nắp bể trên mặt đất, máy bơm, ống xả ra phía đường sau */
function septic(z) {
  const k = dims(z);
  floorSlab(z);
  const n = Math.max(2, Math.round(k.w / 2.6)), L = (k.w - 0.6) / n;
  for (let i = 0; i < n; i++) {
    const x = k.x0 + 0.3 + L * (i + 0.5);
    put(z, bx(L - 0.3, 0.35, k.d - 0.8), z.m.wall, x, FY + 0.175, k.cz);
    put(z, cylG(0.32, 0.08), z.m.accent, x, FY + 0.39, k.cz, { edge: false });
  }
  put(z, bx(0.7, 0.6, 0.6), z.m.prop, k.x1 - 0.5, FY + 0.3, k.z0 + 0.4);
  put(z, bx(0.16, 0.16, 1.2), z.m.accent, k.x1 - 0.5, FY + 0.1, k.z1 + 0.4, { edge: false });
}
function bins(z) {
  const k = dims(z);
  floorSlab(z);
  sidesOf(z).forEach((s) => wallSide(z, s, FY, 1.2, z.m.wall, 0.15));
  put(z, bx(k.w + 0.3, 0.1, k.d + 0.3), z.m.roof, k.cx, z.h, k.cz, { cast: false });
  for (let i = 0; i < 3; i++) put(z, bx(0.7, 0.9, 0.7), z.m.accent, k.x0 + 0.6 + i * 0.9, FY + 0.45, k.cz);
}
function detector(z) {
  const k = dims(z), alongZ = k.d >= k.w, L = alongZ ? k.d : k.w;
  put(z, bx(alongZ ? 0.7 : L, 0.8, alongZ ? L : 0.7), z.m.prop, k.cx, FY + 0.4, k.cz);
  put(z, bx(alongZ ? 0.55 : L, 0.06, alongZ ? L : 0.55), z.m.accent, k.cx, FY + 0.83, k.cz, { edge: false });
  put(z, bx(alongZ ? 1.1 : 0.7, 0.9, alongZ ? 0.7 : 1.1), z.m.accent, k.cx, FY + 1.25, k.cz);
}
/* tủ sấy hai cửa đặt xuyên vách: cửa nạp phía tây (khu bẩn), cửa lấy phía đông (khu sạch) */
function passdryer(z) {
  const k = dims(z), n = Math.max(1, Math.round(k.d / 1.5)), L = k.d / n;
  for (let i = 0; i < n; i++) {
    const cz = k.z0 + L * (i + 0.5);
    put(z, bx(k.w, 2.1, L - 0.12), z.m.prop, k.cx, FY + 1.05, cz);
    [k.x0 - 0.03, k.x1 + 0.03].forEach((x) => put(z, bx(0.06, 1.7, L - 0.5), z.m.accent, x, FY + 1, cz, { edge: false }));
  }
  put(z, bx(k.w * 0.6, 0.45, k.d * 0.5), z.m.accent, k.cx, FY + 2.35, k.cz);
}
function equip(z) {
  const k = dims(z), bw = k.w - 0.9, bcx = k.x0 + bw / 2;
  put(z, bx(k.w, 0.1, k.d), z.m.floor, k.cx, FY + 0.05, k.cz, { cast: false, edge: false });
  put(z, bx(bw, 2.2, k.d - 0.4), z.m.prop, bcx, FY + 1.1, k.cz);
  put(z, bx(0.06, 1.8, k.d - 1.2), z.m.accent, k.x0 - 0.03, FY + 1, k.cz, { edge: false });
  put(z, bx(0.8, 1.4, 1.4), z.m.accent, k.x1 - 0.45, FY + 0.7, k.cz);
}
function cont(z) {
  const k = dims(z), cz = k.cz, len = k.w - 2.4;
  put(z, bx(2, 2.2, 2.3), z.m.prop, k.x0 + 1.1, FY + 1.6, cz);
  put(z, bx(k.w, 0.3, 2.2), z.m.prop, k.cx, FY + 0.6, cz, { edge: false });
  put(z, bx(len, 2.5, 2.4), z.m.accent, k.x1 - len / 2, FY + 2, cz);
  [k.x0 + 1.1, k.x1 - 3, k.x1 - 1.6].forEach((x) => [-0.95, 0.95].forEach((dz) => put(z, cylG(0.45, 0.3, 12), z.m.wall, x, 0.45, cz + dz, { rx: Math.PI / 2, edge: false })));
}
/* hàng rào theo các đoạn lines (mặc định là chu vi box), chừa cổng tại gates */
function fence(z) {
  const k = dims(z), step = 3;
  const lines = z.lines || [[[k.x0, k.z0], [k.x1, k.z0], [k.x1, k.z1], [k.x0, k.z1], [k.x0, k.z0]]];
  lines.forEach((P) => P.slice(0, -1).forEach((a, i) => {
    const b = P[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], L = Math.hypot(dx, dz), ux = dx / L, uz = dz / L, last = i === P.length - 2;
    // khoảng cổng trên cạnh này, tính theo khoảng cách từ đầu cạnh
    const gaps = (z.gates || []).map((g) => {
      const px = g.at[0] - a[0], pz = g.at[1] - a[1], s = px * ux + pz * uz, off = Math.abs(px * uz - pz * ux);
      return off < 0.3 && s >= 0 && s <= L ? [s - g.w / 2, s + g.w / 2] : null;
    }).filter(Boolean).sort((p, q) => p[0] - q[0]);
    const inGap = (s) => gaps.some(([g0, g1]) => s > g0 && s < g1);
    const n = Math.max(1, Math.round(L / step));
    for (let j = 0; j < n + (last ? 1 : 0); j++) { const s = L * j / n; if (!inGap(s)) put(z, bx(0.12, 1.8, 0.12), z.m.prop, a[0] + ux * s, FY + 0.9, a[1] + uz * s, { edge: false }); }
    let cur = 0; const segs = [];
    gaps.forEach(([g0, g1]) => { if (g0 > cur) segs.push([cur, g0]); cur = Math.max(cur, g1); });
    if (cur < L) segs.push([cur, L]);
    segs.forEach(([s0, s1]) => [0.6, 1.5].forEach((y) => put(z, bx(s1 - s0, 0.1, 0.08), z.m.prop, a[0] + ux * (s0 + s1) / 2, FY + y + 0.05, a[1] + uz * (s0 + s1) / 2, { ry: -Math.atan2(dz, dx) })));
    gaps.forEach(([g0, g1]) => [g0, g1].forEach((s) => put(z, bx(0.3, 2.4, 0.3), z.m.accent, a[0] + ux * s, FY + 1.2, a[1] + uz * s)));
  }));
  (z.cams || []).forEach(([x, zz]) => {
    put(z, cylG(0.08, 3.2, 8), z.m.prop, x, FY + 1.6, zz, { edge: false });
    put(z, bx(0.5, 0.3, 0.3), z.m.accent, x, FY + 3.2, zz, { edge: false });
  });
}
const KIND = { hall, block, house, path, trees, woodshed, dryhouse, utility, septic, bins, passdryer, detector, equip, cont, fence };

/* ---------- đồ đạc, thiết bị (khai báo trong z.do) ---------- */
const PROPS = {
  ban(z, x, zz, w, d) { put(z, bx(w, 0.8, d), z.m.prop, x, FY + 0.4, zz); put(z, bx(w + 0.06, 0.06, d + 0.06), z.m.accent, x, FY + 0.83, zz, { edge: false }); },
  ghe(z, x, zz, w, d) { put(z, bx(w, 0.45, d), z.m.prop, x, FY + 0.225, zz); },
  may(z, x, zz, w, h, d) { put(z, bx(w, h, d), z.m.prop, x, FY + h / 2, zz); put(z, bx(w * 0.7, Math.min(0.25, h * 0.2), d * 1.02), z.m.accent, x, FY + h * 0.75, zz, { edge: false }); },
  bon(z, x, zz, r, h, y0) { const y = FY + (y0 || 0); put(z, cylG(r, h), z.m.prop, x, y + h / 2, zz, { edge: false }); put(z, cylG(r * 1.06, 0.08), z.m.accent, x, y + h, zz, { edge: false }); },
  ke(z, x0, x1, z0, z1, tang) {
    const alongX = x1 - x0 >= z1 - z0, L = alongX ? x1 - x0 : z1 - z0, Dp = alongX ? z1 - z0 : x1 - x0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2;
    const B = (len, h, dep) => (alongX ? bx(len, h, dep) : bx(dep, h, len));
    const H = 0.3 + tang * 0.95;
    for (let l = 0; l < tang; l++) put(z, B(L, 0.06, Dp), z.m.prop, cx, FY + 0.25 + l * 0.95, cz, { edge: false });
    const n = Math.max(1, Math.round(L / 1.8));
    for (let i = 0; i <= n; i++) {
      const t = -L / 2 + L * i / n;
      [-Dp / 2, Dp / 2].forEach((u) => put(z, bx(0.06, H, 0.06), z.m.prop, cx + (alongX ? t : u), FY + H / 2, cz + (alongX ? u : t), { edge: false }));
    }
    const m = Math.floor(L / 0.9);
    for (let l = 0; l < tang; l++) {
      for (let i = 0; i < m; i++) {
        if ((i + l) % 4 === 3) continue;
        const t = -L / 2 + 0.45 + i * 0.9;
        put(z, B(0.7, 0.55, Dp * 0.8), (i + l) % 3 === 1 ? z.m.accent : z.m.prop, cx + (alongX ? t : 0), FY + 0.56 + l * 0.95, cz + (alongX ? 0 : t), { edge: false });
      }
    }
  },
  thung(z, x, zz, nx, nz) {
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const h = 0.45 + ((i + j) % 2) * 0.3;
      put(z, bx(0.6, h, 0.45), (i + j) % 3 === 0 ? z.m.accent : z.m.prop, x + i * 0.75, FY + h / 2, zz + j * 0.6, { edge: false });
    }
  },
  pallet(z, x, zz) { put(z, bx(1.2, 0.14, 1), z.m.accent, x, FY + 0.07, zz, { edge: false }); put(z, bx(1.1, 1, 0.9), z.m.prop, x, FY + 0.64, zz); },
  bep(z, x, zz, dz) {
    // bếp củi: thân lò gạch, chảo; dz khác 0 thì ống khói và miệng nạp củi ở ngoài tường
    put(z, bx(1.5, 0.85, 1), z.m.wall, x, FY + 0.425, zz);
    put(z, cylG(0.42, 0.14, 18), z.m.accent, x, FY + 0.92, zz, { edge: false });
    const chx = dz ? x : x + 0.5, chz = dz ? zz + dz : zz + 0.3, chH = z.h + 2.2;
    if (dz) put(z, bx(0.55, 0.55, Math.abs(dz)), z.m.wall, x, FY + 0.35, zz + dz / 2, { edge: false });
    put(z, cylG(0.16, chH, 10), z.m.prop, chx, FY + chH / 2, chz, { edge: false });
    put(z, bx(0.45, 0.12, 0.45), z.m.accent, chx, FY + chH, chz, { edge: false });
  },
  cui(z, x0, x1, z0, z1) {
    let i = 0;
    for (let l = 0; l < 3; l++) for (let x = x0 + 0.5; x < x1 - 0.2; x += 1) { put(z, bx(0.9, 0.3, (z1 - z0) * (1 - l * 0.15)), (i++ + l) % 2 ? z.m.accent : z.m.prop, x, FY + 0.15 + l * 0.32, (z0 + z1) / 2, { edge: false }); }
  },
  gian(z, x0, x1, z0, z1) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
    for (let x = x0; x <= x1 + 0.01; x += w / Math.max(1, Math.round(w / 2.2))) [z0, z1].forEach((pz) => put(z, bx(0.08, 1.5, 0.08), z.m.prop, x, FY + 0.75, pz, { edge: false }));
    [0.55, 0.95, 1.35].forEach((y) => put(z, bx(w, 0.05, d), z.m.accent, cx, FY + y, cz, { edge: false }));
  },
  long(z, x0, x1, z0, z1) {
    const cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, w = x1 - x0, d = z1 - z0;
    [0.9, 1.8].forEach((y) => {
      put(z, bx(w, 0.06, 0.06), z.m.accent, cx, FY + y, z0, { edge: false }); put(z, bx(w, 0.06, 0.06), z.m.accent, cx, FY + y, z1, { edge: false });
      put(z, bx(0.06, 0.06, d), z.m.accent, x0, FY + y, cz, { edge: false }); put(z, bx(0.06, 0.06, d), z.m.accent, x1, FY + y, cz, { edge: false });
    });
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(([px, pz]) => put(z, bx(0.08, 1.8, 0.08), z.m.accent, px, FY + 0.9, pz, { edge: false }));
  }
};
function addProps(z) { (z.do || []).forEach(([t, ...a]) => { if (PROPS[t]) PROPS[t](z, ...a); }); }

/* ---------- dựng các khu ---------- */
const root = new THREE.Group();
scene.add(root);
ZONES.forEach((z) => {
  z.m = mkMats();
  z.g = new THREE.Group();
  root.add(z.g);
  (KIND[z.kind] || hall)(z);
  addProps(z);
  z.g.traverse((o) => { if (o.isMesh) { o.userData.zone = z; } });
  const k = dims(z);
  z.pinPos = z.pin ? new THREE.Vector3(...z.pin) : new THREE.Vector3(k.cx, z.h + 2.5, k.cz);
  z.state = 'wait';
});
const ZBY = Object.fromEntries(ZONES.map((z) => [z.id, z]));

/* ---------- nền, sân, đường ---------- */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(500, 400), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const apronMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
const roadMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
const lineMat = new THREE.LineBasicMaterial({ color: 0x777777 });
const dashMat = new THREE.MeshLambertMaterial({ color: 0x777777 });
(MAT_BANG.nen || []).forEach(({ box: [x0, x1, z0, z1] }) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.1, z1 - z0), apronMat);
  m.position.set((x0 + x1) / 2, 0.05, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m);
});
const VIEN = !MAT_BANG.vien ? [] : typeof MAT_BANG.vien[0][0] === 'number' ? [MAT_BANG.vien] : MAT_BANG.vien;
VIEN.forEach((poly) => scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(poly.map(([a, b]) => new THREE.Vector3(a, 0.12, b))), lineMat)));
/* chỗ đường được vẽ rút ngắn: hai vạch chéo màu nền cắt ngang đường */
const breakMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
(MAT_BANG.ngat || []).forEach(({ x, z0, z1 }) => [-1.2, 1.2].forEach((dx) => {
  const m = new THREE.Mesh(bx(0.9, 0.06, (z1 - z0) + 2), breakMat);
  m.position.set(x + dx, 0.11, (z0 + z1) / 2); m.rotation.y = 0.35; scene.add(m);
}));
(MAT_BANG.duong || []).forEach(({ box: [x0, x1, z0, z1] }) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.08, z1 - z0), roadMat);
  m.position.set((x0 + x1) / 2, 0.04, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m);
  const alongX = x1 - x0 >= z1 - z0, L = alongX ? x1 - x0 : z1 - z0;
  for (let t = 1; t < L - 1; t += 4) {
    const d = new THREE.Mesh(bx(alongX ? 2 : 0.15, 0.02, alongX ? 0.15 : 2), dashMat);
    d.position.set(alongX ? x0 + t : (x0 + x1) / 2, 0.09, alongX ? (z0 + z1) / 2 : z0 + t); scene.add(d);
  }
});

/* ---------- luồng hàng ---------- */
const flowGroup = new THREE.Group(); scene.add(flowGroup);
const dotMat = new THREE.MeshBasicMaterial({ color: 0xffffff });
ROUTES.forEach((r) => {
  r.len = []; r.total = 0; r.m = new THREE.MeshBasicMaterial({ color: 0xE4A92A, transparent: true });
  const pts = r.pts.map((p) => new THREE.Vector3(p[0], 0.3, p[1]));
  r.v = pts;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = a.distanceTo(b);
    r.len.push(L); r.total += L;
    const rib = new THREE.Mesh(bx(L + 0.5, 0.08, 0.5), r.m);
    rib.position.set((a.x + b.x) / 2, 0.3, (a.z + b.z) / 2);
    rib.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
    flowGroup.add(rib);
  }
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  const head = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(0.8, 1.6, 4), r.m); cone.rotation.z = -Math.PI / 2;
  head.add(cone); head.position.set(b.x, 0.45, b.z); head.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
  flowGroup.add(head);
  r.dots = [];
  const n = Math.max(2, Math.min(6, Math.round(r.total / 10)));
  for (let i = 0; i < n; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(0.38, 10, 8), dotMat); d.userData.off = i / n; flowGroup.add(d); r.dots.push(d); }
});
function routePoint(r, t, out) {
  let dist = t * r.total;
  for (let i = 0; i < r.len.length; i++) {
    if (dist <= r.len[i] || i === r.len.length - 1) { const f = Math.min(1, dist / r.len[i]); out.lerpVectors(r.v[i], r.v[i + 1], f); out.y = 0.7; return out; }
    dist -= r.len[i];
  }
  return out;
}

/* ---------- chọn khu: khung viền ---------- */
const selBox = new THREE.LineSegments(new THREE.BufferGeometry(), new THREE.LineBasicMaterial({ color: 0xFFC83D }));
selBox.visible = false; scene.add(selBox);
function setSelBox(z) {
  if (!z) { selBox.visible = false; return; }
  const k = dims(z);
  const h = Math.max(z.h, 1) + 0.5;
  selBox.geometry.dispose();
  selBox.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(k.w + 0.6, h, k.d + 0.6));
  selBox.position.set(k.cx, h / 2, k.cz);
  selBox.visible = true;
}

/* ===== TRẠNG THÁI, GIAO DIỆN, VÒNG LẶP ===== */
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let phase = 1, selected = null, hovered = null, showFlow = true, showPins = true, viewKey = 'iso', playTimer = null;
const el = (id) => document.getElementById(id);
const $app = document.querySelector('.app');
const stateOf = (z, p) => (p < z.phase ? 'wait' : (z.until && p > z.until) ? 'standby' : (p === z.phase && !z.sanCo) ? 'new' : 'active');
const phVar = (n) => (n >= 1 && n <= 4 ? '--p' + n : '--wait');
const ptVar = (n) => (n >= 1 && n <= 4 ? '--t' + n : '--t1');
const pcStyle = (n) => `--pc:var(${phVar(n)});--pt:var(${ptVar(n)})`;
const num = (v) => String(Math.round(v * 10) / 10).replace('.', ',');
const areaOf = (z) => { const k = dims(z); return k.w * k.d; };
const KT_TXT = { phac: 'theo số đo phác thảo', uoc: 'ước từ ảnh vẽ tay', de: 'đề xuất' };

/* ---------- thẻ giai đoạn ---------- */
const tabs = el('phaseTabs');
PH.forEach((p) => {
  const b = document.createElement('button');
  b.className = 'ph'; b.type = 'button'; b.setAttribute('role', 'tab'); b.dataset.p = p.n; b.setAttribute('style', pcStyle(p.n));
  b.innerHTML = `<i></i><b>Giai đoạn ${p.n}</b><span>${p.tab}</span>`;
  b.addEventListener('click', () => { stopPlay(); setPhase(p.n); });
  tabs.appendChild(b);
});

/* ---------- nhãn trên cảnh ---------- */
const pinsBox = el('pins'), stepsBox = el('steps'), tagsBox = el('tags');
ZONES.forEach((z) => {
  const d = document.createElement('div');
  d.className = 'pin wait'; d.tabIndex = 0; d.setAttribute('role', 'button'); d.setAttribute('aria-label', z.n + '. ' + z.name);
  d.setAttribute('style', pcStyle(z.phase));
  d.innerHTML = `<span class="n">${z.n}</span><span class="t">${z.name}</span>`;
  d.addEventListener('click', (e) => { e.stopPropagation(); select(z.id); });
  d.addEventListener('keydown', (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); select(z.id); } });
  d.addEventListener('mouseenter', () => { hovered = z; });
  d.addEventListener('mouseleave', () => { if (hovered === z) hovered = null; });
  z.pinEl = d; pinsBox.appendChild(d);
});
STEPS.forEach((s) => {
  const d = document.createElement('div');
  d.className = 'step'; d.textContent = s.n; d.title = 'Bước ' + s.n + ': ' + s.name;
  s.el = d; s.pos = new THREE.Vector3(s.p[0], 2.4, s.p[1]); stepsBox.appendChild(d);
});
const TAGS = (NHAN_PHU || []).map((t) => {
  const d = document.createElement('div');
  d.className = 'tagl'; d.textContent = t.t;
  tagsBox.appendChild(d);
  return { el: d, pos: new THREE.Vector3(...t.p) };
});

/* ---------- bảng bên phải ---------- */
function renderPanel() {
  const p = PH[phase - 1];
  const built = ZONES.filter((z) => z.xay && z.phase === phase).reduce((s, z) => s + areaOf(z), 0);
  const pc = el('pcard');
  pc.setAttribute('style', pcStyle(phase));
  pc.innerHTML = `<small>${p.when}</small><h2>${p.name}</h2><p>${p.model}</p>
    <div class="row"><b>Nhân sự</b><span>${p.people} cuối giai đoạn</span></div>
    <div class="row"><b>Chứng nhận</b><span>${p.cert}</span></div>
    <div class="row"><b>Xây, cải tạo</b><span>${p.build}${built ? ` Tổng diện tích xây mới khoảng ${num(built)} m².` : ''}</span></div>
    <div class="row"><b>Mục tiêu</b><span>${p.goal}</span></div>`;
  const cnt = { new: 0, active: 0, wait: 0 };
  ZONES.forEach((z) => { if (z.state === 'new') cnt.new++; else if (z.state === 'wait') cnt.wait++; else cnt.active++; });
  el('stats').innerHTML = `<div class="stat n" style="${pcStyle(phase)}"><b>${cnt.new}</b><span>khu mới trong giai đoạn này</span></div>
    <div class="stat"><b>${cnt.active}</b><span>khu đang chạy, có sẵn</span></div>
    <div class="stat"><b>${cnt.wait}</b><span>khu chờ giai đoạn sau</span></div>`;
  const groups = [['new', 'Mới trong giai đoạn này'], ['active', 'Đang chạy, có sẵn'], ['wait', 'Chờ giai đoạn sau']];
  let html = '';
  groups.forEach(([key, title]) => {
    const list = ZONES.filter((z) => (key === 'active' ? (z.state === 'active' || z.state === 'standby') : z.state === key));
    if (!list.length) return;
    html += `<div class="zgrp"><h4 class="sec-t">${title} (${list.length})</h4>`;
    list.forEach((z) => {
      const tag = z.state === 'wait' ? 'GĐ' + z.phase : z.state === 'standby' ? 'dự phòng' : z.sanCo ? 'có sẵn' : '';
      const right = tag ? `<small style="margin-left:auto;color:var(--muted);white-space:nowrap">${tag}</small>` : '';
      html += `<button type="button" class="zrow ${z.state}${selected === z ? ' sel' : ''}" data-id="${z.id}" style="${pcStyle(z.phase)}"><em>${z.n}</em><span>${z.name}</span>${right}</button>`;
    });
    html += '</div>';
  });
  el('zlist').innerHTML = html;
  el('zlist').querySelectorAll('.zrow').forEach((b) => b.addEventListener('click', () => select(b.dataset.id)));
  renderZoneCard();
}
function renderZoneCard() {
  const c = el('zcard');
  if (!selected) { c.innerHTML = '<div class="empty">Bấm vào một khu trên sơ đồ hoặc trong danh sách để xem công năng, diện tích, bộ phận phụ trách và căn cứ bố trí.</div>'; return; }
  const z = selected, st = z.state, k = dims(z);
  const steps = STEPS.filter((s) => s.zone === z.id).map((s) => s.n);
  const badge = st === 'wait' ? 'Chờ xây dựng ở giai đoạn ' + z.phase : st === 'new' ? 'Mới trong giai đoạn ' + z.phase : st === 'standby' ? 'Dự phòng từ giai đoạn ' + (z.until + 1) : z.sanCo ? 'Có sẵn, đang sử dụng' : 'Đang hoạt động, từ giai đoạn ' + z.phase;
  const area = z.noArea ? '' : `<dt>Diện tích</dt><dd>${num(k.w)} × ${num(k.d)} m = ${num(k.w * k.d)} m²${z.kt ? ` (${KT_TXT[z.kt]})` : ''}</dd>`;
  c.innerHTML = `<span class="badge" style="${pcStyle(z.phase)};background:${st === 'wait' ? 'var(--wait)' : 'var(--pc)'};color:${st === 'wait' ? '#fff' : 'var(--pt)'}">${badge}</span>
    <h3>${z.n}. ${z.name}</h3>
    <dl><dt>Công năng</dt><dd>${z.role}</dd>
    ${area}
    <dt>Bộ phận</dt><dd>${z.dept.length ? z.dept.join('; ') : 'Không thuộc bộ phận nào'}</dd>
    ${steps.length ? `<dt>Bước quy trình</dt><dd>${steps.map((n) => 'Bước ' + n).join(', ')}</dd>` : ''}
    <dt>Yêu cầu</dt><dd>${z.req}</dd>
    <dt>Căn cứ bố trí</dt><dd>${z.basis}</dd></dl>`;
}
function renderNotes() {
  const box = el('notes');
  if (!box) return;
  let html = '';
  if (DIEU_CHINH && DIEU_CHINH.length) html += `<details open><summary>Điều chỉnh so với phác thảo (${DIEU_CHINH.length})</summary><ul>${DIEU_CHINH.map((d) => `<li><b>${d.t}</b> ${d.d}${d.cc ? ` <span class="cc">${d.cc}</span>` : ''}</li>`).join('')}</ul></details>`;
  [[UOC_KICH_THUOC, 'Cách ước kích thước'], [CAN_XAC_NHAN, 'Cần HTX xác nhận']].forEach(([list, title]) => {
    if (list && list.length) html += `<details open><summary>${title} (${list.length})</summary><ul>${list.map((t) => `<li>${t}</li>`).join('')}</ul></details>`;
  });
  box.innerHTML = html;
}

/* ---------- màu theo trạng thái ---------- */
const BLACK = C(0x000000), WHITE = C(0xffffff);
function targetsFor(z) {
  const th = TH(), st = z.state, pc = C(SCENE_PH[z.phase] || '#7B8A84'), apron = C(th.apron), w = th.wait;
  if (st === 'new') return { floor: pc.clone().lerp(WHITE, 0.5), wall: pc.clone(), roof: pc.clone().lerp(WHITE, 0.25), roofOp: 0.26, prop: C(th.steelNew), accent: pc.clone().lerp(WHITE, 0.2), edge: pc.clone().lerp(WHITE, 0.78), emis: pc.clone().multiplyScalar(0.32), op: 1, edgeOp: 1 };
  if (st === 'active') return { floor: pc.clone().lerp(apron, 0.5), wall: pc.clone().multiplyScalar(0.86), roof: pc.clone(), roofOp: 0.13, prop: C(th.steel), accent: pc.clone(), edge: pc.clone().multiplyScalar(0.5), emis: BLACK.clone(), op: 1, edgeOp: 0.9 };
  if (st === 'standby') return { floor: apron.clone().lerp(C(0x888888), 0.2), wall: C(0x8B9A92), roof: C(0x8B9A92), roofOp: 0.08, prop: C(0xA5B1AB), accent: C(0x9AA8A1), edge: C(0x6E7E75), emis: BLACK.clone(), op: 0.7, edgeOp: 0.7 };
  return { floor: C(w.floor), wall: C(w.wall), roof: C(w.wall), roofOp: 0.08, prop: C(w.prop), accent: C(w.accent), edge: C(w.edge), emis: BLACK.clone(), op: w.op, edgeOp: 0.85 };
}
function assignTargets(snap) {
  ZONES.forEach((z) => {
    const T = targetsFor(z), m = z.m, op = T.op;
    const set = (mat, color, opacity, emis) => { mat.userData.t = { color, opacity, emis: emis || null }; if (snap) { mat.color.copy(color); mat.opacity = opacity; if (emis) mat.emissive.copy(emis); } };
    set(m.floor, T.floor, op, T.emis.clone().multiplyScalar(0.5));
    set(m.wall, T.wall, op, T.emis);
    set(m.roof, T.roof, T.roofOp);
    set(m.prop, T.prop, op);
    set(m.accent, T.accent, op, T.emis.clone().multiplyScalar(0.6));
    m.edge.userData.t = { color: T.edge, opacity: T.edgeOp };
    if (snap) { m.edge.color.copy(T.edge); m.edge.opacity = T.edgeOp; }
    m.wall.userData.base = T.emis.clone();
  });
  ROUTES.forEach((r) => {
    const zz = ZBY[r.need], on = (zz.state === 'new' || zz.state === 'active') && (!r.den || phase <= r.den);
    r.on = on;
    const col = on ? C('#E4A92A') : C(TH().wait.accent);
    r.m.userData.t = { color: col, opacity: on ? 0.95 : 0.5 };
    if (snap) { r.m.color.copy(col); r.m.opacity = on ? 0.95 : 0.5; }
  });
}
function stepMat(mat, k) {
  const t = mat.userData.t; if (!t) return;
  mat.color.lerp(t.color, k);
  mat.opacity += (t.opacity - mat.opacity) * k;
  if (t.emis && mat.emissive) mat.emissive.lerp(t.emis, k);
}

/* ---------- đổi giai đoạn, chọn khu ---------- */
function setPhase(n, snap) {
  phase = Math.max(1, Math.min(4, n));
  ZONES.forEach((z) => { z.state = stateOf(z, phase); });
  assignTargets(!!snap);
  tabs.querySelectorAll('.ph').forEach((b) => b.setAttribute('aria-selected', String(+b.dataset.p === phase)));
  $app.setAttribute('style', pcStyle(phase));
  document.querySelector('.key').setAttribute('style', pcStyle(phase));
  ZONES.forEach((z) => {
    z.pinEl.className = 'pin ' + z.state + (selected === z ? ' sel' : '');
  });
  STEPS.forEach((s) => { const st = ZBY[s.zone].state; s.el.classList.toggle('dim', st === 'wait' || st === 'standby'); });
  renderPanel();
}
function select(id) {
  selected = id ? ZBY[id] : null;
  setSelBox(selected);
  ZONES.forEach((z) => z.pinEl.classList.toggle('sel', z === selected));
  el('zlist').querySelectorAll('.zrow').forEach((b) => b.classList.toggle('sel', selected && b.dataset.id === selected.id));
  renderZoneCard();
  if (selected && window.innerWidth <= 900) { el('zcard').scrollIntoView({ block: 'nearest', behavior: 'smooth' }); }
}

/* ---------- tự chạy, nút công cụ ---------- */
function stopPlay() { if (playTimer) { clearInterval(playTimer); playTimer = null; } el('bPlay').setAttribute('aria-pressed', 'false'); el('bPlay').textContent = 'Tự chạy'; }
el('bPlay').addEventListener('click', () => {
  if (playTimer) { stopPlay(); return; }
  el('bPlay').setAttribute('aria-pressed', 'true'); el('bPlay').textContent = 'Dừng';
  setPhase(1);
  playTimer = setInterval(() => setPhase(phase >= 4 ? 1 : phase + 1), 4500);
});
el('bFlow').addEventListener('click', (e) => { showFlow = !showFlow; e.currentTarget.setAttribute('aria-pressed', String(showFlow)); flowGroup.visible = showFlow; stepsBox.style.display = showFlow ? '' : 'none'; });
const PIN_LABELS = ['Nhãn khu: số', 'Nhãn khu: tên', 'Nhãn khu: ẩn'];
let pinMode = 0;
function applyPinMode() {
  pinsBox.style.display = pinMode === 2 ? 'none' : '';
  tagsBox.style.display = pinMode === 2 ? 'none' : '';
  pinsBox.classList.toggle('names', pinMode === 1);
  showPins = pinMode !== 2;
  el('bPins').textContent = PIN_LABELS[pinMode];
  el('bPins').setAttribute('aria-pressed', String(pinMode !== 2));
}
el('bPins').addEventListener('click', () => { pinMode = (pinMode + 1) % 3; applyPinMode(); });
document.addEventListener('keydown', (e) => {
  if (e.target && /input|textarea|select/i.test(e.target.tagName)) return;
  if (e.key === 'ArrowRight') { stopPlay(); setPhase(phase + 1); }
  if (e.key === 'ArrowLeft') { stopPlay(); setPhase(phase - 1); }
});

/* ---------- camera ---------- */
const controls = new THREE.OrbitControls(camera, canvas);
controls.target.copy(TARGET0);
Object.assign(controls, { enableDamping: true, dampingFactor: 0.09, rotateSpeed: 0.7, zoomSpeed: 0.9, panSpeed: 0.8, maxPolarAngle: Math.PI / 2.08, minZoom: 0.5, maxZoom: 8 });
const VIEW_ORDER = Object.keys(GOC_NHIN);
let tween = null;
function setView(key, instant) {
  viewKey = key; const v = GOC_NHIN[key];
  el('bView').textContent = 'Góc nhìn: ' + v.label;
  const dir = new THREE.Vector3(...v.dir).normalize();
  const tgt = new THREE.Vector3(...v.tgt);
  const pos = tgt.clone().addScaledVector(dir, 520);
  if (instant || reduceMotion) { camera.position.copy(pos); controls.target.copy(tgt); camera.zoom = v.zoom; camera.updateProjectionMatrix(); controls.update(); return; }
  tween = { t0: performance.now(), d: 800, p0: camera.position.clone(), p1: pos, g0: controls.target.clone(), g1: tgt, z0: camera.zoom, z1: v.zoom };
}
el('bView').addEventListener('click', () => setView(VIEW_ORDER[(VIEW_ORDER.indexOf(viewKey) + 1) % VIEW_ORDER.length]));

function fit() {
  const w = Math.max(stage.clientWidth, 10), h = Math.max(stage.clientHeight, 10);
  if (renderer) renderer.setSize(w, h, false);
  const asp = w / h, vh = asp < 1 ? Math.max(KHUNG.w / asp * 0.9, KHUNG.h) : Math.max(KHUNG.w / asp, KHUNG.h);
  Object.assign(camera, { left: -vh * asp / 2, right: vh * asp / 2, top: vh / 2, bottom: -vh / 2 });
  camera.updateProjectionMatrix();
}
if (window.ResizeObserver) new ResizeObserver(fit).observe(stage); else window.addEventListener('resize', fit);

/* ---------- chọn bằng chuột / chạm ---------- */
const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
const pickMeshes = [];
ZONES.forEach((z) => z.g.traverse((o) => { if (o.isMesh) pickMeshes.push(o); }));
function pickAt(ev) {
  const r = canvas.getBoundingClientRect();
  ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(ndc, camera);
  const hit = ray.intersectObjects(pickMeshes, false)[0];
  return hit ? hit.object.userData.zone : null;
}
let down = null;
canvas.addEventListener('pointerdown', (e) => { down = { x: e.clientX, y: e.clientY }; });
canvas.addEventListener('pointerup', (e) => {
  if (!down) return;
  const moved = Math.hypot(e.clientX - down.x, e.clientY - down.y); down = null;
  if (moved > 5) return;
  const z = pickAt(e);
  select(z ? z.id : null);
});
canvas.addEventListener('pointermove', (e) => {
  if (e.buttons) return;
  const z = pickAt(e);
  hovered = z; canvas.style.cursor = z ? 'pointer' : 'grab';
});

/* ---------- chủ đề sáng/tối ---------- */
function applyTheme() {
  const th = TH();
  scene.background = new THREE.Color(th.bg);
  if (renderer) renderer.setClearColor(th.bg, 1);
  ground.material.color.setHex(th.ground); apronMat.color.setHex(th.apron); roadMat.color.setHex(th.road); lineMat.color.setHex(th.line); dashMat.color.setHex(th.apron); breakMat.color.setHex(th.bg);
  hemi.intensity = isDark() ? 0.62 : 0.78; sun.intensity = isDark() ? 0.62 : 0.8;
  hemi.groundColor.setHex(isDark() ? 0x1b2620 : 0x8a99a8);
  assignTargets(true);
}
if (window.matchMedia) { const mq = window.matchMedia('(prefers-color-scheme: dark)'); (mq.addEventListener ? mq.addEventListener('change', applyTheme) : mq.addListener(applyTheme)); }
new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------- vòng lặp ---------- */
const clock = new THREE.Clock(), tmp = new THREE.Vector3();
function frame() {
  requestAnimationFrame(frame);
  const dt = Math.min(clock.getDelta(), 0.1), time = clock.elapsedTime, k = 1 - Math.exp(-dt * 7);
  const pulse = reduceMotion ? 1 : 0.78 + 0.22 * Math.sin(time * 2.4);
  ZONES.forEach((z) => {
    const m = z.m;
    if (z.state === 'new' && m.wall.userData.base) { m.wall.userData.t.emis.copy(m.wall.userData.base).multiplyScalar(pulse); }
    ['floor', 'wall', 'prop', 'accent', 'roof'].forEach((n) => stepMat(m[n], k));
    const e = m.edge.userData.t; if (e) { m.edge.color.lerp(e.color, k); m.edge.opacity += (e.opacity - m.edge.opacity) * k; }
  });
  ROUTES.forEach((r) => {
    stepMat(r.m, k);
    r.dots.forEach((d) => {
      d.visible = r.on && showFlow;
      if (d.visible) { const tt = ((reduceMotion ? 0 : time * 4 / r.total) + d.userData.off) % 1; routePoint(r, tt, d.position); }
    });
  });
  if (tween) {
    const f = Math.min(1, (performance.now() - tween.t0) / tween.d), e = f < 0.5 ? 2 * f * f : 1 - Math.pow(-2 * f + 2, 2) / 2;
    camera.position.lerpVectors(tween.p0, tween.p1, e); controls.target.lerpVectors(tween.g0, tween.g1, e);
    camera.zoom = tween.z0 + (tween.z1 - tween.z0) * e; camera.updateProjectionMatrix();
    if (f >= 1) tween = null;
  }
  controls.update();
  if (renderer) renderer.render(scene, camera);
  const w = stage.clientWidth, h = stage.clientHeight;
  const proj = (v, node) => {
    tmp.copy(v).project(camera);
    const x = (tmp.x * 0.5 + 0.5) * w, y = (-tmp.y * 0.5 + 0.5) * h;
    node.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
    node.classList.toggle('hide', x < -20 || x > w + 20 || y < -20 || y > h + 20);
  };
  if (showPins) {
    ZONES.forEach((z) => { proj(z.pinPos, z.pinEl); z.pinEl.classList.toggle('hov', hovered === z); });
    TAGS.forEach((t) => proj(t.pos, t.el));
  }
  if (showFlow) STEPS.forEach((s) => proj(s.pos, s.el));
}

/* ---------- khởi động ---------- */
fit();
applyPinMode();
applyTheme();
renderNotes();
const hashPhase = (location.hash.match(/^#gd([1-4])$/) || [])[1];
setPhase(hashPhase ? +hashPhase : 1, true);
setView('iso', true);
frame();
window.__plant = { setPhase: (n) => { stopPlay(); setPhase(n, true); }, select, setView: (k) => setView(k, true), phase: () => phase, zones: ZONES };
})();
