/* Dựng cảnh 3D và giao diện từ dữ liệu trong du-lieu.js (window.HERAGRAIN). */
(function () {
"use strict";
const { PH, ZONES, STEPS, ROUTES, SITE } = window.HERAGRAIN;

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
  light: { bg: 0xE4ECE7, ground: 0xD3DED7, apron: 0xE9EFEB, road: 0xBCC7C0, line: 0x7E9086, steelNew: 0xF3F6F4, steel: 0xC4CEC8,
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
const camera = new THREE.OrthographicCamera(-100, 100, 60, -60, 1, 2500);
const TARGET0 = new THREE.Vector3(-8, 0, 2);
const ISO_DIR = new THREE.Vector3(-1, 0.92, 1).normalize();
camera.position.copy(TARGET0).addScaledVector(ISO_DIR, 520);
camera.lookAt(TARGET0);

if (renderer) {
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
}
const hemi = new THREE.HemisphereLight(0xffffff, 0x8899aa, 0.78);
scene.add(hemi);
const sun = new THREE.DirectionalLight(0xffffff, 0.8);
sun.position.set(-160, 260, 120);
sun.castShadow = true;
sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -170, right: 170, top: 130, bottom: -130, near: 10, far: 700 });
sun.shadow.bias = -0.0006;
scene.add(sun);

/* ---------- tiện ích hình học ---------- */
const geoCache = {};
const bx = (w, h, d) => geoCache[w + '|' + h + '|' + d] || (geoCache[w + '|' + h + '|' + d] = new THREE.BoxGeometry(w, h, d));
const edgeCache = new Map();
function edgesOf(geo) { if (!edgeCache.has(geo)) edgeCache.set(geo, new THREE.EdgesGeometry(geo)); return edgeCache.get(geo); }
const cylG = (r, h, s = 20) => new THREE.CylinderGeometry(r, r, h, s);

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
  if (o.rot) m.rotation.y = o.rot;
  if (o.edge !== false && geo.type === 'BoxGeometry') {
    const e = new THREE.LineSegments(edgesOf(geo), z.m.edge);
    m.add(e);
  }
  z.g.add(m);
  return m;
}
const FY = 0.4; // mặt sàn

function dims(z) { const [x0, x1, z0, z1] = z.box; return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 }; }

function floorSlab(z, grow) {
  const k = dims(z);
  put(z, bx(k.w + (grow || 0), 0.4, k.d + (grow || 0)), z.m.floor, k.cx, 0.2, k.cz, { cast: false });
}

function walls(z, wallH, thick) {
  const k = dims(z);
  const sides = {
    N: { len: k.w, axis: 'x', fixed: k.z0, from: k.x0 }, S: { len: k.w, axis: 'x', fixed: k.z1, from: k.x0 },
    W: { len: k.d, axis: 'z', fixed: k.x0, from: k.z0 }, E: { len: k.d, axis: 'z', fixed: k.x1, from: k.z0 }
  };
  ['N', 'S', 'W', 'E'].forEach((s) => {
    const sd = sides[s];
    const gaps = (z.doors || []).filter((d) => d.side === s).map((d) => [d.at - d.w / 2, d.at + d.w / 2]).sort((a, b) => a[0] - b[0]);
    let cur = sd.from; const end = sd.from + sd.len; const segs = [];
    gaps.forEach((gp) => { if (gp[0] > cur) segs.push([cur, gp[0]]); cur = gp[1]; });
    if (cur < end) segs.push([cur, end]);
    segs.forEach(([a, b]) => {
      const l = b - a, c = (a + b) / 2;
      if (sd.axis === 'x') put(z, bx(l, wallH, thick), z.m.wall, c, FY + wallH / 2, sd.fixed);
      else put(z, bx(thick, wallH, l), z.m.wall, sd.fixed, FY + wallH / 2, c);
    });
  });
}

function roofFrame(z, wallH) {
  const k = dims(z);
  const top = z.h;
  // mái trong suốt để nhìn thấy bên trong, kèm cột góc
  const r = put(z, bx(k.w + 0.8, 0.3, k.d + 0.8), z.m.roof, k.cx, top, k.cz, { cast: false });
  r.userData.isRoof = true;
  [[k.x0, k.z0], [k.x1, k.z0], [k.x0, k.z1], [k.x1, k.z1]].forEach(([px, pz]) => {
    put(z, bx(0.8, top - FY - wallH, 0.8), z.m.wall, px, FY + wallH + (top - FY - wallH) / 2, pz, { edge: false });
  });
}

function hall(z, wallH) {
  wallH = wallH || Math.min(3.6, z.h * 0.42);
  floorSlab(z);
  walls(z, wallH, 0.8);
  roofFrame(z, wallH);
}

function block(z) {
  const k = dims(z);
  floorSlab(z, 1.2);
  put(z, bx(k.w, z.h, k.d), z.m.wall, k.cx, FY + z.h / 2, k.cz);
  put(z, bx(k.w + 0.8, 0.5, k.d + 0.8), z.m.prop, k.cx, FY + z.h + 0.25, k.cz);
  const floors = z.h > 8 ? 2 : 1;
  for (let f = 0; f < floors; f++) {
    const y = FY + (z.h / floors) * f + (z.h / floors) * 0.55;
    put(z, bx(k.w * 0.86, 1.3, 0.25), z.m.accent, k.cx, y, k.z1 + 0.15, { edge: false });
    put(z, bx(0.25, 1.3, k.d * 0.8), z.m.accent, k.x0 - 0.15, y, k.cz, { edge: false });
  }
  put(z, bx(3.2, 3, 0.4), z.m.accent, k.cx, FY + 1.5, k.z1 + 0.2, { edge: false });
}

/* ---------- thiết bị ---------- */
function dryer(z, x, zz, len, wid) {
  put(z, bx(len, 4.2, wid), z.m.prop, x, FY + 2.1, zz);
  put(z, bx(0.9, 4.8, wid + 0.5), z.m.accent, x - len / 2, FY + 2.4, zz);
  put(z, bx(0.9, 4.8, wid + 0.5), z.m.accent, x + len / 2, FY + 2.4, zz);
  put(z, bx(len * 0.8, 0.25, wid * 0.5), z.m.accent, x, FY + 4.35, zz, { edge: false });
  [-0.28, 0.28].forEach((f) => put(z, cylG(0.75, 2.4, 14), z.m.prop, x + len * f, FY + 5.4, zz - wid * 0.2, { edge: false }));
  put(z, bx(2, 2.4, 1.2), z.m.accent, x - len / 2 - 2, FY + 1.2, zz + wid / 2 - 0.6);
}
function table(z, x, zz, w, d) { put(z, bx(w, 1.1, d), z.m.prop, x, FY + 0.55, zz); put(z, bx(w, 0.12, d + 0.1), z.m.accent, x, FY + 1.12, zz, { edge: false }); }
function tank(z, x, zz, r, h) { put(z, cylG(r, h), z.m.prop, x, FY + h / 2, zz, { edge: false }); put(z, cylG(r + 0.12, 0.3), z.m.accent, x, FY + h, zz, { edge: false }); }
function conv(z, x, zz, len, wid, alongX) {
  const a = alongX !== false;
  put(z, bx(a ? len : wid, 0.9, a ? wid : len), z.m.prop, x, FY + 0.45 + 0.35, zz);
  put(z, bx(a ? len : wid * 0.7, 0.14, a ? wid * 0.7 : len), z.m.accent, x, FY + 0.9 + 0.35, zz, { edge: false });
}
function rackRow(z, x, z0, z1, levels) {
  const len = z1 - z0, cz = (z0 + z1) / 2;
  for (let l = 0; l < levels; l++) {
    put(z, bx(2.6, 0.2, len), z.m.prop, x, FY + 1.4 + l * 2.6, cz, { edge: false });
  }
  [z0, cz, z1].forEach((pz) => {
    put(z, bx(0.25, levels * 2.6 + 1.2, 0.25), z.m.prop, x - 1.25, FY + (levels * 2.6 + 1.2) / 2, pz, { edge: false });
    put(z, bx(0.25, levels * 2.6 + 1.2, 0.25), z.m.prop, x + 1.25, FY + (levels * 2.6 + 1.2) / 2, pz, { edge: false });
  });
  for (let l = 0; l < levels; l++) {
    for (let i = 0; i < Math.floor(len / 3.6); i++) {
      put(z, bx(2.0, 1.5, 2.6), i % 3 === 1 ? z.m.accent : z.m.prop, x, FY + 1.6 + 0.75 + l * 2.6, z0 + 1.8 + i * 3.6, { edge: false });
    }
  }
}
function crates(z, x, zz, nx, nz) {
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
    put(z, bx(2.4, 1.5 + ((i + j) % 2) * 0.9, 2.4), (i + j) % 3 === 0 ? z.m.accent : z.m.prop, x + i * 3, FY + 0.8, zz + j * 3, { edge: false });
  }
}
function detector(z, x, zz) {
  conv(z, x, zz, 6, 1.7, true);
  put(z, bx(0.5, 3, 2.4), z.m.accent, x - 0.6, FY + 1.5, zz);
  put(z, bx(0.5, 3, 2.4), z.m.accent, x + 0.6, FY + 1.5, zz);
  put(z, bx(1.7, 0.6, 2.4), z.m.accent, x, FY + 3.1, zz);
}
function machine(z, x, zz, w, h, d) { put(z, bx(w, h, d), z.m.prop, x, FY + h / 2, zz); put(z, bx(w * 0.6, 0.5, d * 1.02), z.m.accent, x, FY + h * 0.78, zz, { edge: false }); }
function bins(z, x, zz, n) { for (let i = 0; i < n; i++) put(z, bx(2.4, 1.6, 1.8), z.m.accent, x + i * 3.4, FY + 0.8, zz); }

/* ---------- từng loại khu ---------- */
function buildTrees(z) {
  const k = dims(z);
  for (let x = k.x0 + 3; x < k.x1; x += 6.5) {
    for (let zz = k.z0 + 3; zz < k.z1; zz += 6.5) {
      if (zz > 3 && zz < 19) continue;
      put(z, bx(0.7, 2.2, 0.7), z.m.prop, x, 1.1, zz, { edge: false });
      const c = put(z, new THREE.ConeGeometry(2.4, 5.2, 8), z.m.accent, x, 4.6, zz, { edge: false });
      c.castShadow = true;
    }
  }
  put(z, bx(k.w, 0.2, k.d), z.m.floor, k.cx, 0.1, k.cz, { cast: false, edge: false });
}
function buildGate(z) {
  const k = dims(z);
  floorSlab(z);
  put(z, bx(7, 4.2, 6), z.m.wall, k.x0 + 4, FY + 2.1, k.cz);
  put(z, bx(8, 0.5, 7), z.m.prop, k.x0 + 4, FY + 4.45, k.cz);
  put(z, bx(1.8, 1.2, 0.2), z.m.accent, k.x0 + 4, FY + 2.6, k.cz + 3.1, { edge: false });
  put(z, bx(13, 0.5, 5.4), z.m.prop, k.x0 + 15, FY + 0.25, k.cz);
  put(z, bx(11, 0.12, 0.7), z.m.accent, k.x0 + 15, FY + 0.56, k.cz - 1.4, { edge: false });
  put(z, bx(11, 0.12, 0.7), z.m.accent, k.x0 + 15, FY + 0.56, k.cz + 1.4, { edge: false });
  put(z, bx(0.5, 3, 0.5), z.m.prop, k.x0 + 8, FY + 1.5, k.cz - 4.2, { edge: false });
  put(z, bx(0.3, 0.3, 7.5), z.m.accent, k.x0 + 8, FY + 3, k.cz - 0.5, { edge: false });
}
function buildCanopy(z) {
  const k = dims(z);
  floorSlab(z);
  [[k.x0, k.z0], [k.x1, k.z0], [k.x0, k.z1], [k.x1, k.z1], [k.cx, k.z0], [k.cx, k.z1]].forEach(([px, pz]) => put(z, bx(0.9, z.h - FY, 0.9), z.m.wall, px, FY + (z.h - FY) / 2, pz, { edge: false }));
  put(z, bx(k.w + 1.5, 0.6, k.d + 1.5), z.m.wall, k.cx, z.h + 0.3, k.cz);
  crates(z, k.x0 + 4, k.z0 + 3, 4, 2);
  crates(z, k.x0 + 4, k.z1 - 8, 4, 2);
  put(z, bx(3, 0.4, 3), z.m.accent, k.cx, FY + 0.2, -4 + 4.5, { edge: false });
}
function buildShed(z) {
  const k = dims(z);
  hall(z, Math.min(2.6, z.h * 0.6));
  if (z.id === 'waste') bins(z, k.x0 + 3, k.cz, 4);
  if (z.id === 'util') {
    machine(z, k.x0 + 5, k.cz, 5, 3, 3);
    put(z, cylG(1.4, 3.4, 16), z.m.prop, k.x0 + 11, FY + 1.7, k.cz, { edge: false });
    tank(z, k.x1 - 6, k.cz - 3, 2.2, 5);
    tank(z, k.x1 - 6, k.cz + 3, 2.2, 5);
  }
}
function buildTanks(z) {
  const k = dims(z);
  floorSlab(z);
  tank(z, k.x0 + 5, k.cz - 4, 4, 3.4);
  tank(z, k.x0 + 5, k.cz + 5, 4, 3.4);
  put(z, bx(10, 2.6, 7), z.m.prop, k.x0 + 15, FY + 1.3, k.cz - 3);
  tank(z, k.x0 + 16, k.cz + 6, 2.6, 3);
  put(z, bx(5, 3.2, 4), z.m.wall, k.x1 - 3, FY + 1.6, k.z0 + 4);
  put(z, bx(14, 0.3, 0.5), z.m.accent, k.x0 + 11, FY + 0.5, k.cz + 0.5, { edge: false });
}
function buildCage(z) {
  const k = dims(z);
  put(z, bx(k.w, 0.14, k.d), z.m.floor, k.cx, FY + 0.07, k.cz, { cast: false, edge: false });
  const rail = (x, zz, w, d) => put(z, bx(w, 0.25, d), z.m.accent, x, FY + 2.6, zz, { edge: false });
  rail(k.cx, k.z0, k.w, 0.25); rail(k.cx, k.z1, k.w, 0.25); rail(k.x0, k.cz, 0.25, k.d); rail(k.x1, k.cz, 0.25, k.d);
  for (let i = 0; i <= 4; i++) { put(z, bx(0.3, 2.8, 0.3), z.m.accent, k.x0 + i * (k.w / 4), FY + 1.4, k.z0, { edge: false }); put(z, bx(0.3, 2.8, 0.3), z.m.accent, k.x0 + i * (k.w / 4), FY + 1.4, k.z1, { edge: false }); }
  crates(z, k.x0 + 2, k.z0 + 3, 2, 3);
}
function buildCont(z) {
  const k = dims(z);
  put(z, bx(k.w, 0.2, k.d), z.m.floor, k.cx, 0.1, k.cz, { cast: false, edge: false });
  const cz = k.cz;
  put(z, bx(12.5, 3, 2.7), z.m.accent, k.cx + 1.5, FY + 1.5 + 0.9, cz);
  put(z, bx(12.5, 0.3, 2.7), z.m.prop, k.cx + 1.5, FY + 0.45, cz);
  put(z, bx(2.8, 2.6, 2.6), z.m.prop, k.x0 + 1.6, FY + 1.3 + 0.4, cz);
  put(z, bx(3.6, 0.5, 2.8), z.m.prop, k.x0 + 1.6, FY + 0.5, cz);
  for (let i = 0; i < 4; i++) put(z, cylG(0.8, 0.5, 12), z.m.wall, k.cx + 5 + (i % 2) * 3.2 - 2, 0.9, cz + (i < 2 ? -1.5 : 1.5), { edge: false });
  put(z, bx(0.2, 2.6, 2.2), z.m.prop, k.cx + 1.5 + 6.35, FY + 1.5 + 0.9, cz, { edge: false });
}
function buildEquip(z) {
  const k = dims(z);
  put(z, bx(k.w, 0.14, k.d), z.m.floor, k.cx, FY + 0.07, k.cz, { cast: false, edge: false });
  dryer(z, k.cx, k.cz, k.w, k.d - 0.5);
}
function buildFence(z) {
  const S = SITE;
  const posts = [];
  const step = 8;
  const edge = (ax, bx_, az, bz) => { const n = Math.max(1, Math.round(Math.hypot(bx_ - ax, bz - az) / step)); for (let i = 0; i <= n; i++) posts.push([ax + (bx_ - ax) * i / n, az + (bz - az) * i / n]); };
  edge(S.x0, S.x1, S.z0, S.z0); edge(S.x1, S.x1, S.z0, S.z1); edge(S.x1, S.x0, S.z1, S.z1); edge(S.x0, S.x0, S.z1, S.z0);
  posts.forEach(([px, pz]) => put(z, bx(0.35, 2.4, 0.35), z.m.prop, px, FY + 1.2, pz, { edge: false }));
  const rail = (ax, az, w, d) => put(z, bx(w, 0.18, d), z.m.prop, ax, FY + 2.0, az, { edge: false });
  rail((S.x0 + S.x1) / 2, S.z0, S.x1 - S.x0, 0.18); rail((S.x0 + S.x1) / 2, S.z1, S.x1 - S.x0, 0.18);
  rail(S.x0, (S.z0 + S.z1) / 2, 0.18, S.z1 - S.z0); rail(S.x1, (S.z0 + S.z1) / 2, 0.18, S.z1 - S.z0);
  [[S.x0, 3], [S.x0, 19], [S.x1, -17], [S.x1, 17], [S.x0, S.z0], [S.x1, S.z1], [-22, S.z0]].forEach(([px, pz]) => {
    put(z, cylG(0.3, 6, 8), z.m.prop, px, FY + 3, pz, { edge: false });
    put(z, bx(1.3, 0.8, 0.8), z.m.accent, px, FY + 6, pz, { edge: false });
  });
  put(z, bx(0.5, 4, 0.5), z.m.accent, S.x0, FY + 2, 5, { edge: false });
  put(z, bx(0.5, 4, 0.5), z.m.accent, S.x0, FY + 2, 17, { edge: false });
  put(z, bx(0.5, 4, 0.5), z.m.accent, S.x1, FY + 2, -17, { edge: false });
  put(z, bx(0.5, 4, 0.5), z.m.accent, S.x1, FY + 2, 9, { edge: false });
}
function buildPad(z) {
  const k = dims(z);
  const m = put(z, bx(k.w, 0.2, k.d), z.m.floor, k.cx, 0.12, k.cz, { cast: false, edge: false });
  m.userData.padLike = true;
  const pts = [[k.x0, k.z0], [k.x1, k.z0], [k.x1, k.z1], [k.x0, k.z1]].map(([a, b]) => new THREE.Vector3(a, 0.4, b));
  const geo = new THREE.BufferGeometry().setFromPoints(pts);
  const ln = new THREE.LineLoop(geo, new THREE.LineDashedMaterial({ color: 0x8FA097, dashSize: 3, gapSize: 2, transparent: true }));
  ln.computeLineDistances();
  z.dash = ln; z.g.add(ln);
}

/* thiết bị theo từng khu */
function addProps(z) {
  const k = dims(z);
  switch (z.id) {
    case 'rawst': [-39, -33, -28.5].forEach((x, i) => { if (i < 2) rackRow(z, x, -19, -9, 2); rackRow(z, x, 4, 13, 2); }); break;
    case 'prep':
      put(z, bx(5, 1.6, 3.4), z.m.prop, -22, FY + 0.8, -4); put(z, bx(4.4, 0.2, 2.8), z.m.accent, -22, FY + 1.6, -4, { edge: false });
      table(z, -22, -12, 4, 1.5); table(z, -22, 5, 4, 1.5);
      [-9, -4, 1].forEach((p) => table(z, -16, p, 3.8, 1.5));
      tank(z, -10, -9, 1.9, 2.4); tank(z, -10, 2, 1.9, 2.4);
      table(z, -16, -14, 3.8, 1.5); break;
    case 'dry1': dryer(z, 5.5, -4, 15, 9); put(z, bx(2.4, 1.8, 1.6), z.m.accent, 5.5, FY + 0.9, 8); break;
    case 'clean':
      conv(z, 22, -4, 7, 2.4, true); table(z, 28, -4, 3.6, 4.2); detector(z, 33, -4);
      machine(z, 39, -4, 3.8, 2.8, 3.2); conv(z, 42.2, -4, 3, 1.4, true);
      machine(z, 45.5, -4, 2.6, 2.2, 2.6); crates(z, 47, -12, 1, 2);
      table(z, 24, 9, 5, 1.6); break;
    case 'pack': rackRow(z, 28, -34, -25, 2); rackRow(z, 33, -34, -25, 2); rackRow(z, 38, -34, -25, 2); break;
    case 'fg': [54, 58.5, 63, 67].forEach((x, i) => { if (i > 1) rackRow(z, x, -20, -8, 3); rackRow(z, x, 0, 13, 3); }); crates(z, 52, -6, 1, 0); break;
    case 'lab': table(z, k.cx - 2, k.cz - 2, 6, 1.6); table(z, k.cx - 2, k.cz + 2.5, 6, 1.6); break;
    case 'qc1': table(z, k.cx, k.cz, 5, 1.6); break;
    case 'airlock': table(z, k.cx - 3, k.cz + 2, 2.4, 1.2); table(z, k.cx + 3, k.cz + 2, 2.4, 1.2); break;
    case 'dock': crates(z, 73, -14, 2, 3); crates(z, 73, 4, 2, 3); [-14, -4, 6].forEach((p) => put(z, bx(3, 0.6, 6), z.m.accent, 86.5, FY + 0.3, p, { edge: false })); break;
    case 'toller': dryer(z, -103, 38, 10, 6); table(z, -108, 33, 3.4, 1.5); table(z, -96, 33, 3.4, 1.5); break;
    default: break;
  }
}

/* ---------- dựng các khu ---------- */
const root = new THREE.Group();
scene.add(root);
ZONES.forEach((z) => {
  z.m = mkMats();
  z.g = new THREE.Group();
  root.add(z.g);
  switch (z.kind) {
    case 'trees': buildTrees(z); break;
    case 'gate': buildGate(z); break;
    case 'canopy': buildCanopy(z); break;
    case 'block': block(z); break;
    case 'shed': buildShed(z); break;
    case 'tanks': buildTanks(z); break;
    case 'cage': buildCage(z); break;
    case 'cont': buildCont(z); break;
    case 'equip': buildEquip(z); break;
    case 'fence': buildFence(z); break;
    case 'pad': buildPad(z); break;
    default: hall(z);
  }
  addProps(z);
  z.g.traverse((o) => { if (o.isMesh) { o.userData.zone = z; } });
  const k = dims(z);
  z.pinPos = z.pin ? new THREE.Vector3(...z.pin) : new THREE.Vector3(k.cx, z.h + 2.5, k.cz);
  z.state = 'wait';
});
const ZBY = Object.fromEntries(ZONES.map((z) => [z.id, z]));

/* ---------- nền, đường, ranh giới ---------- */
const ground = new THREE.Mesh(new THREE.PlaneGeometry(900, 700), new THREE.MeshLambertMaterial({ color: 0xcccccc }));
ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
const apronMat = new THREE.MeshLambertMaterial({ color: 0xeeeeee });
const SW = SITE.x1 - SITE.x0, SD = SITE.z1 - SITE.z0;
const apron = new THREE.Mesh(new THREE.BoxGeometry(SW, 0.3, SD), apronMat);
apron.position.set((SITE.x0 + SITE.x1) / 2, 0.05, (SITE.z0 + SITE.z1) / 2); apron.receiveShadow = true; scene.add(apron);
const roadMat = new THREE.MeshLambertMaterial({ color: 0xaaaaaa });
const roadPieces = [
  [-128, -64, 5, 17], [-128, -86, 5, 17], [-70, 100, 26, 31], [86, 112, -16, 12], [-106, -94, 17, 28]
];
roadPieces.forEach(([x0, x1, z0, z1]) => {
  const m = new THREE.Mesh(new THREE.BoxGeometry(x1 - x0, 0.2, z1 - z0), roadMat);
  m.position.set((x0 + x1) / 2, 0.22, (z0 + z1) / 2); m.receiveShadow = true; scene.add(m);
});
const lineMat = new THREE.LineBasicMaterial({ color: 0x777777 });
{
  const pts = [[SITE.x0, SITE.z0], [SITE.x1, SITE.z0], [SITE.x1, SITE.z1], [SITE.x0, SITE.z1]].map(([a, b]) => new THREE.Vector3(a, 0.5, b));
  scene.add(new THREE.LineLoop(new THREE.BufferGeometry().setFromPoints(pts), lineMat));
}

/* ---------- luồng quy trình ---------- */
const flowGroup = new THREE.Group(); scene.add(flowGroup);
ROUTES.forEach((r) => {
  r.len = []; r.total = 0; r.ribs = []; r.m = new THREE.MeshBasicMaterial({ color: 0xE4A92A, transparent: true });
  const pts = r.pts.map((p) => new THREE.Vector3(p[0], 0.6, p[1]));
  r.v = pts;
  for (let i = 0; i < pts.length - 1; i++) {
    const a = pts[i], b = pts[i + 1], L = a.distanceTo(b);
    r.len.push(L); r.total += L;
    const rib = new THREE.Mesh(bx(L, 0.2, 1.3), r.m);
    rib.position.set((a.x + b.x) / 2, 0.6, (a.z + b.z) / 2);
    rib.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
    flowGroup.add(rib);
  }
  const a = pts[pts.length - 2], b = pts[pts.length - 1];
  const head = new THREE.Group();
  const cone = new THREE.Mesh(new THREE.ConeGeometry(2, 4.2, 4), r.m); cone.rotation.z = -Math.PI / 2;
  head.add(cone); head.position.set(b.x, 0.9, b.z); head.rotation.y = -Math.atan2(b.z - a.z, b.x - a.x);
  flowGroup.add(head);
  r.dots = [];
  const dm = new THREE.MeshBasicMaterial({ color: 0xffffff });
  for (let i = 0; i < 3; i++) { const d = new THREE.Mesh(new THREE.SphereGeometry(1.0, 10, 8), dm); d.userData.off = i / 3; flowGroup.add(d); r.dots.push(d); }
});
function routePoint(r, t, out) {
  let dist = t * r.total;
  for (let i = 0; i < r.len.length; i++) {
    if (dist <= r.len[i] || i === r.len.length - 1) { const f = Math.min(1, dist / r.len[i]); out.lerpVectors(r.v[i], r.v[i + 1], f); out.y = 1.4; return out; }
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
  const h = Math.max(z.h, 1) + 1.2;
  selBox.geometry.dispose();
  selBox.geometry = new THREE.EdgesGeometry(new THREE.BoxGeometry(k.w + 2, h, k.d + 2));
  selBox.position.set(k.cx, h / 2, k.cz);
  selBox.visible = true;
}

/* ===== TRẠNG THÁI, GIAO DIỆN, VÒNG LẶP ===== */
const reduceMotion = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
let phase = 1, selected = null, hovered = null, showFlow = true, showPins = true, viewKey = 'iso', playTimer = null;
const el = (id) => document.getElementById(id);
const $app = document.querySelector('.app');
const stateOf = (z, p) => (p < z.phase ? 'wait' : p === z.phase ? 'new' : (z.until && p > z.until ? 'standby' : 'active'));
const phVar = (n) => (n >= 1 && n <= 4 ? '--p' + n : '--wait');
const ptVar = (n) => (n >= 1 && n <= 4 ? '--t' + n : '--t1');
const pcStyle = (n) => `--pc:var(${phVar(n)});--pt:var(${ptVar(n)})`;
const STATE_TXT = { new: 'Mới trong giai đoạn này', active: 'Đang hoạt động', standby: 'Dự phòng', wait: 'Chờ xây dựng' };

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
const pinsBox = el('pins'), stepsBox = el('steps');
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
  s.el = d; s.pos = new THREE.Vector3(s.p[0], 4.2, s.p[1]); stepsBox.appendChild(d);
});

/* ---------- bảng bên phải ---------- */
function renderPanel() {
  const p = PH[phase - 1];
  const pc = el('pcard');
  pc.setAttribute('style', pcStyle(phase));
  pc.innerHTML = `<small>${p.when}</small><h2>${p.name}</h2><p>${p.model}</p>
    <div class="row"><b>Nhân sự</b><span>${p.people} cuối giai đoạn</span></div>
    <div class="row"><b>Chứng nhận</b><span>${p.cert}</span></div>
    <div class="row"><b>Mục tiêu</b><span>${p.goal}</span></div>`;
  const cnt = { new: 0, active: 0, wait: 0 };
  ZONES.forEach((z) => { if (z.state === 'new') cnt.new++; else if (z.state === 'wait') cnt.wait++; else cnt.active++; });
  el('stats').innerHTML = `<div class="stat n" style="${pcStyle(phase)}"><b>${cnt.new}</b><span>khu mới trong giai đoạn này</span></div>
    <div class="stat"><b>${cnt.active}</b><span>khu đang chạy từ trước</span></div>
    <div class="stat"><b>${cnt.wait}</b><span>khu chờ xây dựng</span></div>`;
  const groups = [['new', 'Mới trong giai đoạn này'], ['active', 'Đang chạy từ giai đoạn trước'], ['wait', 'Chờ xây dựng ở giai đoạn sau']];
  let html = '';
  groups.forEach(([key, title]) => {
    const list = ZONES.filter((z) => (key === 'active' ? (z.state === 'active' || z.state === 'standby') : z.state === key));
    if (!list.length) return;
    html += `<div class="zgrp"><h4 class="sec-t">${title} (${list.length})</h4>`;
    list.forEach((z) => {
      const right = z.state === 'wait' ? `<small style="margin-left:auto;color:var(--muted);white-space:nowrap">${z.phase > 4 ? 'dự trữ' : 'GĐ' + z.phase}</small>` : (z.state === 'standby' ? '<small style="margin-left:auto;color:var(--muted)">dự phòng</small>' : '');
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
  if (!selected) { c.innerHTML = '<div class="empty">Bấm vào một khu trên sơ đồ hoặc trong danh sách để xem công năng, bộ phận phụ trách và căn cứ bố trí.</div>'; return; }
  const z = selected, st = z.state;
  const steps = STEPS.filter((s) => s.zone === z.id).map((s) => s.n);
  const badge = st === 'wait' ? (z.phase > 4 ? 'Dành sẵn, chưa xây' : 'Chờ xây dựng ở giai đoạn ' + z.phase) : st === 'new' ? 'Mới trong giai đoạn ' + z.phase : st === 'standby' ? 'Dự phòng từ giai đoạn ' + (z.until + 1) : 'Đang hoạt động, từ giai đoạn ' + z.phase;
  c.innerHTML = `<span class="badge" style="${pcStyle(z.phase)};background:${st === 'wait' ? 'var(--wait)' : 'var(--pc)'};color:${st === 'wait' ? '#fff' : 'var(--pt)'}">${badge}</span>
    <h3>${z.n}. ${z.name}</h3>
    <dl><dt>Công năng</dt><dd>${z.role}</dd>
    <dt>Bộ phận</dt><dd>${z.dept.length ? z.dept.join('; ') : 'Chưa phân công'}</dd>
    ${steps.length ? `<dt>Bước quy trình</dt><dd>${steps.map((n) => 'Bước ' + n).join(', ')}</dd>` : ''}
    <dt>Yêu cầu</dt><dd>${z.req}</dd>
    <dt>Căn cứ bố trí</dt><dd>${z.basis}</dd></dl>`;
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
    const T = targetsFor(z), m = z.m;
    const op = z.kind === 'pad' ? Math.min(T.op, 0.45) : T.op;
    const set = (mat, color, opacity, emis) => { mat.userData.t = { color, opacity, emis: emis || null }; if (snap) { mat.color.copy(color); mat.opacity = opacity; if (emis) mat.emissive.copy(emis); } };
    set(m.floor, T.floor, op, T.emis.clone().multiplyScalar(0.5));
    set(m.wall, T.wall, op, T.emis);
    set(m.roof, T.roof, T.roofOp);
    set(m.prop, T.prop, op);
    set(m.accent, T.accent, op, T.emis.clone().multiplyScalar(0.6));
    m.edge.userData.t = { color: T.edge, opacity: T.edgeOp };
    if (snap) { m.edge.color.copy(T.edge); m.edge.opacity = T.edgeOp; }
    m.wall.userData.base = T.emis.clone();
    if (z.dash) { z.dash.material.color.copy(T.edge); z.dash.material.opacity = st2op(z.state); }
  });
  ROUTES.forEach((r) => {
    const zz = ZBY[r.need], on = zz.state === 'new' || zz.state === 'active';
    r.on = on;
    const col = on ? C('#E4A92A') : C(TH().wait.accent);
    r.m.userData.t = { color: col, opacity: on ? 0.95 : 0.5 };
    if (snap) { r.m.color.copy(col); r.m.opacity = on ? 0.95 : 0.5; }
  });
}
const st2op = (s) => (s === 'wait' ? 0.9 : 0.6);
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
Object.assign(controls, { enableDamping: true, dampingFactor: 0.09, rotateSpeed: 0.7, zoomSpeed: 0.9, panSpeed: 0.8, maxPolarAngle: Math.PI / 2.08, minZoom: 0.55, maxZoom: 6 });
const VIEWS = {
  iso: { dir: [-1, 0.92, 1], tgt: [-8, 0, 2], zoom: 1, label: 'toàn cảnh' },
  plan: { dir: [0, 1, 0.02], tgt: [-10, 0, 2], zoom: 0.9, label: 'mặt bằng' },
  prod: { dir: [-1, 0.8, 1.1], tgt: [22, 0, -2], zoom: 1.9, label: 'khu sản xuất' }
};
const VIEW_ORDER = ['iso', 'plan', 'prod'];
let tween = null;
function setView(key, instant) {
  viewKey = key; const v = VIEWS[key];
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
  const asp = w / h, vh = asp < 1 ? Math.max(238 / asp * 0.62, 160) : Math.max(238 / asp, 160);
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
  ground.material.color.setHex(th.ground); apronMat.color.setHex(th.apron); roadMat.color.setHex(th.road); lineMat.color.setHex(th.line);
  hemi.intensity = isDark() ? 0.62 : 0.78; sun.intensity = isDark() ? 0.62 : 0.8;
  hemi.groundColor.setHex(isDark() ? 0x1b2620 : 0x8a99a8);
  assignTargets(true);
}
if (window.matchMedia) { const mq = window.matchMedia('(prefers-color-scheme: dark)'); (mq.addEventListener ? mq.addEventListener('change', applyTheme) : mq.addListener(applyTheme)); }
new MutationObserver(applyTheme).observe(document.documentElement, { attributes: true, attributeFilter: ['data-theme'] });

/* ---------- vòng lặp ---------- */
const clock = new THREE.Clock(), tmp = new THREE.Vector3(), pos2 = new THREE.Vector3();
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
      if (d.visible) { const tt = ((reduceMotion ? 0 : time * 16 / r.total) + d.userData.off) % 1; routePoint(r, tt, d.position); }
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
  const proj = (v, node, off) => {
    tmp.copy(v).project(camera);
    const x = (tmp.x * 0.5 + 0.5) * w, y = (-tmp.y * 0.5 + 0.5) * h;
    node.style.transform = `translate(${x.toFixed(1)}px,${y.toFixed(1)}px) translate(-50%,-50%)`;
    node.classList.toggle('hide', x < -20 || x > w + 20 || y < -20 || y > h + 20);
  };
  if (showPins) ZONES.forEach((z) => { proj(z.pinPos, z.pinEl); z.pinEl.classList.toggle('hov', hovered === z); });
  if (showFlow) STEPS.forEach((s) => proj(s.pos, s.el));
}

/* ---------- khởi động ---------- */
fit();
applyPinMode();
applyTheme();
const hashPhase = (location.hash.match(/^#gd([1-4])$/) || [])[1];
setPhase(hashPhase ? +hashPhase : 1, true);
setView('iso', true);
frame();
window.__plant = { setPhase: (n) => { stopPlay(); setPhase(n, true); }, select, setView: (k) => setView(k, true), phase: () => phase, zones: ZONES };
})();
