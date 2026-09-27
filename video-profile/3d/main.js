/* Viện STP – Video profile (bản 3D).
   Một thế giới 3D (three.js) với 15 trạm; máy quay bay qua từng trạm theo một GSAP timeline dừng sẵn.
   Mọi chuyển động là hàm của thời gian t để render từng khung hình tất định (window.__seek). */
import * as THREE from 'three';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';
import { RoundedBoxGeometry } from 'three/addons/geometries/RoundedBoxGeometry.js';
import { EffectComposer } from 'three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from 'three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from 'three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from 'three/addons/postprocessing/OutputPass.js';
import { ShaderPass } from 'three/addons/postprocessing/ShaderPass.js';
import { FXAAShader } from 'three/addons/shaders/FXAAShader.js';

const gsap = window.gsap;
gsap.ticker.lagSmoothing(0);
gsap.defaults({ ease: 'power3.out' });
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const W = 1920, H = 1080;
const Q0 = () => new URLSearchParams(location.search);
const master = gsap.timeline({ paused: true });
const MARKS = [];
const cue = (t, type) => MARKS.push({ t: +t.toFixed(3), type });
const UPD = [];           // hàm cập nhật liên tục theo t
const LBL = [];           // nhãn HTML gắn vào điểm 3D
const V = (x, y, z) => new THREE.Vector3(x, y, z);
const clamp01 = (v) => Math.max(0, Math.min(1, v));
const ease3 = (v) => 1 - Math.pow(1 - clamp01(v), 3);
const easeBack = (v) => { v = clamp01(v); const c = 1.7; return 1 + (c + 1) * Math.pow(v - 1, 3) + c * Math.pow(v - 1, 2); };
function rng(seed) {
  return () => {
    seed |= 0; seed = (seed + 0x6D2B79F5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/* ================= RENDERER ================= */
const renderer = new THREE.WebGLRenderer({ canvas: $('#gl'), antialias: false, preserveDrawingBuffer: true });
const RS = parseFloat(Q0().get('rs') || '1');   // tỉ lệ độ phân giải render 3D (lớp chữ HTML luôn 1080p)
const RW = Math.round(W * RS), RH = Math.round(H * RS);
renderer.setPixelRatio(1);
renderer.setSize(RW, RH, false);
renderer.toneMapping = THREE.NeutralToneMapping;
renderer.toneMappingExposure = 0.95;
renderer.shadowMap.enabled = true;
renderer.shadowMap.type = THREE.PCFShadowMap;
const scene = new THREE.Scene();
const BG = new THREE.Color('#D9E3DD');
scene.background = BG;
scene.fog = new THREE.Fog(BG, 85, 210);
const Q = new URLSearchParams(location.search);
if (Q.has('noshadow')) renderer.shadowMap.enabled = false;
const pmrem = new THREE.PMREMGenerator(renderer);
scene.environment = pmrem.fromScene(new RoomEnvironment(), 0.04).texture;
scene.environmentIntensity = 0.6;
if (Q0().has('noenv')) scene.environment = null;
scene.add(new THREE.HemisphereLight('#ffffff', '#b9cbbf', 0.55));
const sun = new THREE.DirectionalLight('#fff8ef', 1.7);
sun.castShadow = true;
sun.shadow.mapSize.set(1536, 1536);
Object.assign(sun.shadow.camera, { left: -34, right: 34, top: 34, bottom: -34, near: 1, far: 160 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
scene.add(sun, sun.target);
const camera = new THREE.PerspectiveCamera(38, W / H, 0.5, 420);
const rt = new THREE.WebGLRenderTarget(RW, RH, { type: THREE.HalfFloatType, samples: Q.has('msaa') ? 4 : 0 });
const composer = new EffectComposer(renderer, rt);
composer.setPixelRatio(1);
composer.setSize(RW, RH);
composer.addPass(new RenderPass(scene, camera));
const bloom = new UnrealBloomPass(new THREE.Vector2(RW / 4, RH / 4), 0.85, 0.45, 2.1);
composer.addPass(bloom);
if (Q.has('nobloom')) bloom.enabled = false;
composer.addPass(new OutputPass());
const fxaa = new ShaderPass(FXAAShader);
fxaa.material.uniforms.resolution.value.set(1 / RW, 1 / RH);
if (!Q.has('msaa')) composer.addPass(fxaa);

/* ================= MATERIALS & TEXTURES ================= */
function canvasTex(w, h, draw) {
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  const g = c.getContext('2d'); draw(g, w, h);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8;
  return t;
}
const FONT = '"Be Vietnam Pro"';
const neonC = (hex, k) => new THREE.Color(hex).multiplyScalar(k);
const M = {
  white: new THREE.MeshStandardMaterial({ color: '#E9EEEC', metalness: 0.12, roughness: 0.36 }),
  silver: new THREE.MeshStandardMaterial({ color: '#AEB9B6', metalness: 0.9, roughness: 0.24 }),
  glass: new THREE.MeshStandardMaterial({ color: '#DFFBEA', metalness: 0.1, roughness: 0.04, transparent: true, opacity: 0.3, depthWrite: false }),
  gglass: new THREE.MeshStandardMaterial({ color: '#57D69A', metalness: 0.2, roughness: 0.06, transparent: true, opacity: 0.55, depthWrite: false }),
  green: new THREE.MeshStandardMaterial({ color: '#15A05E', metalness: 0.35, roughness: 0.32 }),
  deep: new THREE.MeshStandardMaterial({ color: '#0C5E37', metalness: 0.4, roughness: 0.36 }),
  dark: new THREE.MeshStandardMaterial({ color: '#1B252C', metalness: 0.55, roughness: 0.32 }),
  navy: new THREE.MeshStandardMaterial({ color: '#1F2E44', metalness: 0.4, roughness: 0.35 }),
  red: new THREE.MeshStandardMaterial({ color: '#D2463F', metalness: 0.35, roughness: 0.3 }),
  orange: new THREE.MeshStandardMaterial({ color: '#EE8A2A', metalness: 0.3, roughness: 0.35 }),
  gold: new THREE.MeshStandardMaterial({ color: '#E0B354', metalness: 0.9, roughness: 0.25 }),
  wood: null, soil: null,
  neon: new THREE.MeshBasicMaterial({ color: neonC('#1FD286', 6.0) }),
  neonDim: new THREE.MeshBasicMaterial({ color: neonC('#1FD286', 1.6) }),
  neonOr: new THREE.MeshBasicMaterial({ color: neonC('#FF9A3C', 5.2) }),
  neonRed: new THREE.MeshBasicMaterial({ color: neonC('#FF4B4B', 5.6) }),
  neonBlue: new THREE.MeshBasicMaterial({ color: neonC('#3FB6FF', 5.0) }),
  beam: new THREE.MeshBasicMaterial({ color: neonC('#2BE08F', 1.0), transparent: true, opacity: 0.16, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
  beamRed: new THREE.MeshBasicMaterial({ color: neonC('#FF4B4B', 1.2), transparent: true, opacity: 0.2, side: THREE.DoubleSide, depthWrite: false, blending: THREE.AdditiveBlending }),
};
const shadowTex = canvasTex(256, 256, (g) => {
  const r = g.createRadialGradient(128, 128, 10, 128, 128, 128);
  r.addColorStop(0, 'rgba(10,40,25,.42)'); r.addColorStop(0.55, 'rgba(10,40,25,.16)'); r.addColorStop(1, 'rgba(10,40,25,0)');
  g.fillStyle = r; g.fillRect(0, 0, 256, 256);
});
const shadowMat = new THREE.MeshBasicMaterial({ map: shadowTex, transparent: true, depthWrite: false });

/* ---------- geometry helpers ---------- */
function rbox(w, h, d, r, mat, seg = 4) { return new THREE.Mesh(new RoundedBoxGeometry(w, h, d, seg, Math.min(r, w / 2, h / 2, d / 2) * 0.999), mat); }
function at(obj, x, y, z) { obj.position.set(x, y, z); return obj; }
function add(parent, ...objs) { objs.forEach((o) => parent.add(o)); return objs[0]; }
function blob(parent, w, d, x = 0, z = 0) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, d), shadowMat);
  m.rotation.x = -Math.PI / 2; m.position.set(x, 0.03, z); parent.add(m); return m;
}
function roundRectPts(w, d, r, n = 8) {
  const pts = [], hw = w / 2 - r, hd = d / 2 - r;
  [[hw, hd, 0], [-hw, hd, Math.PI / 2], [-hw, -hd, Math.PI], [hw, -hd, Math.PI * 1.5]].forEach(([cx, cz, a0]) => {
    for (let i = 0; i <= n; i++) { const a = a0 + (i / n) * Math.PI / 2; pts.push(V(cx + Math.cos(a) * r, 0, cz + Math.sin(a) * r)); }
  });
  return pts;
}
function tube(points, radius, mat, closed = false, seg = 200) {
  const curve = new THREE.CatmullRomCurve3(points, closed, 'catmullrom', 0.2);
  const m = new THREE.Mesh(new THREE.TubeGeometry(curve, seg, radius, 8, closed), mat);
  m.userData.curve = curve;
  return m;
}
function neonRing(w, d, r, y, rad = 0.07, mat = M.neon) {
  const m = tube(roundRectPts(w, d, r), rad, mat, true, 240); m.position.y = y; return m;
}
function growTube(mesh, t0, dur) { // vẽ dần một ống neon
  const g = mesh.geometry, total = g.index ? g.index.count : g.attributes.position.count;
  g.setDrawRange(0, 0);
  UPD.push((t) => { const k = clamp01((t - t0) / dur); g.setDrawRange(0, Math.floor(total * ease3(k) / 6) * 6); });
}
function platform(w, d, h = 1.2, opt = {}) {
  const g = new THREE.Group();
  add(g, at(rbox(w, h, d, 0.45, M.silver), 0, h / 2, 0));
  add(g, at(rbox(w - 0.8, 0.5, d - 0.8, 0.3, opt.top || M.white), 0, h + 0.2, 0));
  if (opt.ring !== false) add(g, neonRing(w - 0.2, d - 0.2, 0.5, h - 0.05, 0.06, opt.ringMat || M.neon));
  blob(g, w * 1.7, d * 1.7);
  g.userData.top = h + 0.45;
  return g;
}
function prism(w, h, d, mat) { // mái nhà tam giác, trục dọc theo z
  const s = new THREE.Shape(); s.moveTo(-w / 2, 0); s.lineTo(w / 2, 0); s.lineTo(0, h); s.lineTo(-w / 2, 0);
  const g = new THREE.ExtrudeGeometry(s, { depth: d, bevelEnabled: false }); g.translate(0, 0, -d / 2);
  return new THREE.Mesh(g, mat);
}
function textPlane(w, h, tex, transparent = true) {
  const m = new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: tex, transparent, toneMapped: false }));
  return m;
}
function drawText(g, txt, x, y, size, weight, color, align = 'center') {
  g.font = `${weight} ${size}px ${FONT}`; g.fillStyle = color; g.textAlign = align; g.textBaseline = 'middle'; g.fillText(txt, x, y);
}
function rr(g, x, y, w, h, r) { g.beginPath(); g.moveTo(x + r, y); g.arcTo(x + w, y, x + w, y + h, r); g.arcTo(x + w, y + h, x, y + h, r); g.arcTo(x, y + h, x, y, r); g.arcTo(x, y, x + w, y, r); g.closePath(); }
const IMG = {};
function loadImg(name, src) { return new Promise((res) => { const i = new Image(); i.onload = () => { IMG[name] = i; res(); }; i.src = src; }); }
const texCache = {};
function imgTex(name) {
  if (!texCache[name]) { const t = new THREE.Texture(IMG[name]); t.colorSpace = THREE.SRGBColorSpace; t.anisotropy = 8; t.needsUpdate = true; texCache[name] = t; }
  return texCache[name];
}

/* ================= CAMERA ================= */
const C = { x: 0, y: 70, z: 60, tx: 0, ty: 0, tz: 0, sx: 0, sy: 0, fov: 38 };
let last = { ...C };
function cam(t, dur, pose, ease = 'power2.inOut') {
  const to = { ...pose };
  master.fromTo(C, { ...last }, { ...to, duration: dur, ease, immediateRender: false }, t);
  Object.assign(last, to);
}
function fly(t, dur, pose) {
  const mid = { x: (last.x + pose.x) / 2, y: Math.max(last.y, pose.y) + 9, z: (last.z + pose.z) / 2 + 8, tx: (last.tx + pose.tx) / 2, ty: (last.ty + pose.ty) / 2, tz: (last.tz + pose.tz) / 2, sx: 0, sy: 0, fov: 40 };
  cam(t, dur * 0.5, mid, 'power2.in');
  cam(t + dur * 0.5, dur * 0.5, pose, 'power2.out');
  cue(t, 'whoosh');
}
const P = (x, y, z, tx, ty, tz, sx = 0, sy = 0, fov = 38) => ({ x, y, z, tx, ty, tz, sx, sy, fov });
function applyCam() {
  camera.position.set(C.x, C.y, C.z);
  camera.fov = C.fov;
  camera.setViewOffset(W, H, -C.sx, C.sy, W, H);
  camera.lookAt(C.tx, C.ty, C.tz);
  camera.updateProjectionMatrix();
}

/* ================= DOM OVERLAY HELPERS ================= */
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
      } else if (ch.nodeType === 1 && ch.tagName !== 'BR' && !ch.classList.contains('ic')) walk(ch);
    });
  };
  walk(el);
  return out;
}
function ovIn(id, t) {
  const o = $(id);
  master.set(o, { visibility: 'visible', opacity: 1 }, t);
  const kids = [...o.children];
  kids.forEach((k, i) => {
    if (k.classList.contains('late')) return;
    if (k.classList.contains('h') || k.classList.contains('qt')) {
      const ws = splitWords(k);
      master.fromTo(ws, { yPercent: 118, rotate: 4 }, { yPercent: 0, rotate: 0, duration: 0.9, stagger: 0.045, ease: 'power4.out' }, t + 0.1);
    } else if (k.classList.contains('endl') || k.classList.contains('endr')) {
      master.fromTo([...k.children], { y: 30, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8, stagger: 0.14 }, t + 0.2 + i * 0.2);
    } else if (['cards', 'list', 'chips', 'tags', 'dots', 'steps', 'grid9'].some((c) => k.classList.contains(c))) {
      master.fromTo([...k.children], { x: o.classList.contains('right') ? 40 : -40, autoAlpha: 0 }, { x: 0, autoAlpha: 1, duration: 0.7, stagger: 0.12 }, t + 0.5 + i * 0.08);
    } else {
      master.fromTo(k, { y: 24, autoAlpha: 0 }, { y: 0, autoAlpha: 1, duration: 0.8 }, t + 0.15 + i * 0.12);
    }
  });
}
function ovOut(id, t) {
  master.to(id, { opacity: 0, duration: 0.45, ease: 'power2.in' }, t);
  master.set(id, { visibility: 'hidden' }, t + 0.46);
}
function label(html, pos, t0, t1, cls = '') {
  const d = document.createElement('div');
  d.className = 'lb3 ' + cls;
  d.innerHTML = `<div class="in">${html}</div>`;
  $('#labels').appendChild(d);
  LBL.push({ d, pos });
  master.set(d, { visibility: 'visible' }, t0);
  master.fromTo($('.in', d), { y: 18, autoAlpha: 0, scale: 0.9 }, { y: 0, autoAlpha: 1, scale: 1, duration: 0.55, ease: 'back.out(1.8)' }, t0);
  master.to($('.in', d), { autoAlpha: 0, y: -10, duration: 0.35 }, t1);
  master.set(d, { visibility: 'hidden' }, t1 + 0.36);
}
function visible(group, t0, t1) {
  group.visible = false;
  master.set(group, { visible: true }, t0);
  master.set(group, { visible: false }, t1);
}
function popIn(obj, t, dur = 0.8, from = 0.001) { // phóng to từ 0 với nảy nhẹ
  const s = obj.scale.clone();
  UPD.push((tt) => { const k = easeBack((tt - t) / dur); const v = from + (1 - from) * k; obj.scale.set(s.x * v, s.y * v, s.z * v); });
}
function riseIn(obj, t, dur = 1.0, dy = -6) {
  const y0 = obj.position.y;
  UPD.push((tt) => { obj.position.y = y0 + dy * (1 - ease3((tt - t) / dur)); });
}

/* ================= WORLD ================= */
const floorTex = canvasTex(512, 512, (g) => {
  g.fillStyle = '#EAF1ED'; g.fillRect(0, 0, 512, 512);
  g.strokeStyle = 'rgba(11,122,71,.10)'; g.lineWidth = 2;
  for (let i = 0; i <= 512; i += 64) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, 512); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(512, i); g.stroke(); }
  g.strokeStyle = 'rgba(11,122,71,.16)'; g.lineWidth = 3; g.strokeRect(0, 0, 512, 512);
});
floorTex.wrapS = floorTex.wrapT = THREE.RepeatWrapping; floorTex.repeat.set(120, 30);
const floor = new THREE.Mesh(new THREE.PlaneGeometry(1600, 400), new THREE.MeshLambertMaterial({ map: floorTex }));
floor.rotation.x = -Math.PI / 2; floor.position.set(430, 0, 0); scene.add(floor);

// "xa lộ dữ liệu" nối các trạm – dẫn mắt người xem trong lúc bay
const HW = tube([V(-40, 0.06, 26), V(930, 0.06, 26)], 0.09, M.neonDim, false, 400); scene.add(HW);
const HW2 = tube([V(-40, 0.06, -30), V(930, 0.06, -30)], 0.07, M.neonDim, false, 400); scene.add(HW2);
{
  const pk = new THREE.InstancedMesh(new THREE.SphereGeometry(0.22, 12, 8), M.neon, 90), m4 = new THREE.Matrix4();
  scene.add(pk);
  UPD.push((t) => {
    for (let i = 0; i < 90; i++) {
      const lane = i % 2, x = ((t * 14 + i * 37.3) % 970) - 40;
      m4.makeTranslation(lane ? 970 - x - 80 : x, 0.2, lane ? -30 : 26); pk.setMatrixAt(i, m4);
    }
    pk.instanceMatrix.needsUpdate = true;
  });
}

const X = { hero: 0, docs: 55, pil: 115, city: 180, stairs: 240, cap: 300, shield: 355, qr: 410, gs1: 470, phone: 540, map: 600, bld: 660, farm: 730, sensor: 800, part: 855, end: 915 };

/* ---------- 0 · HERO ---------- */
function buildHero(x0, ribbons = true) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  add(g, at(rbox(18, 1.2, 18, 0.6, M.silver), 0, 0.6, 0));
  add(g, at(rbox(16.4, 0.6, 16.4, 0.4, M.white), 0, 1.45, 0));
  add(g, at(rbox(13, 0.9, 13, 0.45, M.glass), 0, 2.2, 0));
  const ring = add(g, neonRing(16.8, 16.8, 0.9, 1.2, 0.08));
  const inner = add(g, neonRing(13.3, 13.3, 0.6, 1.8, 0.06));
  blob(g, 34, 34);
  const tile = add(g, at(rbox(7.2, 0.7, 7.2, 0.5, M.white), 0, 3.0, 0));
  const logo = textPlane(6.1, 6.1, imgTex('logo'));
  logo.rotation.x = -Math.PI / 2; logo.position.set(0, 3.37, 0); g.add(logo);
  // 8 nút mạch quanh khung kính
  const nodes = [];
  const pts = [[-5.4, -5.4], [0, -5.4], [5.4, -5.4], [5.4, 0], [5.4, 5.4], [0, 5.4], [-5.4, 5.4], [-5.4, 0]];
  pts.forEach(([x, z], i) => {
    const n = new THREE.Group(); n.position.set(x, 2.3, z); g.add(n);
    add(n, at(new THREE.Mesh(new THREE.CylinderGeometry(0.75, 0.8, 0.9, 32), M.white), 0, 0.45, 0));
    add(n, at(new THREE.Mesh(new THREE.CylinderGeometry(0.5, 0.5, 0.08, 32), i % 2 ? M.neon : M.neonDim), 0, 0.93, 0));
    nodes.push(n);
  });
  const frame = add(g, tube([...pts.map(([x, z]) => V(x, 2.75, z)), V(pts[0][0], 2.75, pts[0][1])], 0.12, M.gglass, false, 160));
  const trace = add(g, tube([...pts.map(([x, z]) => V(x, 2.75, z)), V(pts[0][0], 2.75, pts[0][1])], 0.045, M.neon, false, 160));
  // hai dải kính xanh chéo phía sau (lấy cảm hứng từ trang bìa)
  const rib1 = at(rbox(44, 0.8, 6, 0.3, M.green), -4, 3, -24); rib1.rotation.set(0.1, 0.45, 0.2);
  const rib2 = at(rbox(44, 0.8, 4.5, 0.3, M.gglass), 5, 5, -28); rib2.rotation.set(0.1, -0.4, -0.14);
  if (ribbons) g.add(rib1, rib2);
  return { g, ring, inner, tile, logo, nodes, frame, trace, rib1, rib2 };
}

/* ---------- 1 · PLAQUES ---------- */
function docTex(kind) {
  return canvasTex(512, 700, (g, w, h) => {
    if (kind === 2) {
      const gr = g.createLinearGradient(0, 0, w, h); gr.addColorStop(0, '#1C2F6B'); gr.addColorStop(1, '#101C45');
      g.fillStyle = gr; g.fillRect(0, 0, w, h);
      g.strokeStyle = '#D9B45A'; g.lineWidth = 6; g.strokeRect(22, 22, w - 44, h - 44);
      g.fillStyle = '#D9B45A'; g.beginPath(); g.arc(w / 2, 200, 70, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#C0392B'; g.beginPath(); g.arc(w / 2, 200, 52, 0, Math.PI * 2); g.fill();
      g.fillStyle = '#F1C40F'; g.beginPath();
      for (let i = 0; i < 5; i++) { const a = -Math.PI / 2 + i * 4 * Math.PI / 5; g.lineTo(w / 2 + Math.cos(a) * 34, 200 + Math.sin(a) * 34); }
      g.fill();
      drawText(g, 'GIẤY CHỨNG NHẬN', w / 2, 360, 42, 800, '#E9C877');
      drawText(g, 'ĐĂNG KÝ HOẠT ĐỘNG', w / 2, 430, 28, 700, '#E9C877');
      drawText(g, 'KHOA HỌC VÀ CÔNG NGHỆ', w / 2, 470, 28, 700, '#E9C877');
      return;
    }
    g.fillStyle = '#FCFDFC'; g.fillRect(0, 0, w, h);
    g.strokeStyle = '#1B3A2A'; g.lineWidth = 4; g.strokeRect(24, 24, w - 48, h - 48);
    if (kind === 0) {
      drawText(g, 'LIÊN HIỆP CÁC HỘI', w / 2, 110, 30, 800, '#1B3A2A');
      drawText(g, 'KHOA HỌC VÀ KỸ THUẬT VIỆT NAM', w / 2, 150, 26, 800, '#1B3A2A');
      drawText(g, 'VUSTA', w / 2, 240, 84, 800, '#0B7A47');
    } else {
      g.drawImage(IMG.logo, w / 2 - 130, 70, 260, 260);
      drawText(g, 'VIỆN STP', w / 2, 370, 40, 800, '#0B7A47');
    }
    g.fillStyle = 'rgba(27,58,42,.18)';
    for (let i = 0; i < 9; i++) g.fillRect(70, (kind === 0 ? 320 : 430) + i * 34, w - 140 - (i % 3) * 60, 12);
  });
}
function buildDocs(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  add(g, at(rbox(26, 0.6, 10, 0.3, M.white), 0, 0.3, 0));
  add(g, neonRing(26, 10, 0.3, 0.62, 0.05));
  blob(g, 42, 18);
  const plaques = [-7.5, 0, 7.5].map((x, i) => {
    const p = new THREE.Group(); p.position.set(x, 0.6, i === 1 ? -1 : 0); p.rotation.y = -x * 0.03; g.add(p);
    add(p, at(rbox(5, 0.7, 2, 0.25, M.glass), 0, 0.35, 0));
    add(p, at(rbox(4.6, 6.4, 0.34, 0.2, M.glass), 0, 3.9, 0));
    const d = textPlane(3.9, 5.33, docTex(i), false); d.position.set(0, 3.9, 0.2); p.add(d);
    add(p, at(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 0.06), M.neon), 0, 0.72, 0.9));
    return p;
  });
  return { g, plaques };
}

/* ---------- 2 · PILLARS ---------- */
function hubTex() {
  return canvasTex(768, 768, (g, w, h) => {
    rr(g, 20, 20, w - 40, h - 40, 70); g.fillStyle = '#FFFFFF'; g.fill();
    drawText(g, '4 TRỤ CỘT', w / 2, 270, 86, 800, '#C4302B');
    drawText(g, 'HỆ SINH THÁI SỐ', w / 2, 390, 70, 800, '#1B2A22');
    drawText(g, 'Viện STP', w / 2, 490, 70, 700, '#1B2A22');
  });
}
function gear(rOut, rIn, teeth, depth, mat) {
  const s = new THREE.Shape();
  for (let i = 0; i < teeth * 2; i++) {
    const a0 = (i / (teeth * 2)) * Math.PI * 2, a1 = ((i + 1) / (teeth * 2)) * Math.PI * 2, r = i % 2 ? rIn : rOut;
    if (i === 0) s.moveTo(Math.cos(a0) * r, Math.sin(a0) * r);
    s.lineTo(Math.cos(a0 + 0.04) * r, Math.sin(a0 + 0.04) * r);
    s.lineTo(Math.cos(a1 - 0.04) * r, Math.sin(a1 - 0.04) * r);
  }
  const hole = new THREE.Path(); hole.absarc(0, 0, rIn * 0.4, 0, Math.PI * 2, true); s.holes.push(hole);
  return new THREE.Mesh(new THREE.ExtrudeGeometry(s, { depth, bevelEnabled: true, bevelThickness: 0.08, bevelSize: 0.06, bevelSegments: 2, curveSegments: 6 }), mat);
}
function gradCap(scale = 1, boardMat = M.dark) {
  const c = new THREE.Group();
  const board = add(c, at(rbox(4.4, 0.22, 4.4, 0.08, boardMat), 0, 1.1, 0)); board.rotation.y = Math.PI / 4;
  add(c, at(new THREE.Mesh(new THREE.CylinderGeometry(1.35, 1.5, 1.1, 40), boardMat), 0, 0.5, 0));
  add(c, at(new THREE.Mesh(new THREE.CylinderGeometry(1.52, 1.52, 0.18, 40), M.green), 0, 0.2, 0));
  add(c, at(new THREE.Mesh(new THREE.CylinderGeometry(0.22, 0.22, 0.14, 16), M.green), 0, 1.28, 0));
  add(c, at(new THREE.Mesh(new THREE.CylinderGeometry(0.04, 0.04, 2.2, 8), M.green), 1.9, 0.1, 0));
  add(c, at(new THREE.Mesh(new THREE.SphereGeometry(0.2, 16, 12), M.green), 1.9, -1.0, 0));
  c.scale.setScalar(scale);
  return c;
}
function rackTex() {
  return canvasTex(128, 512, (g, w, h) => {
    g.fillStyle = '#EEF2F1'; g.fillRect(0, 0, w, h);
    for (let y = 16; y < h; y += 40) {
      g.fillStyle = '#C5CFCB'; g.fillRect(10, y, w - 20, 30);
      g.fillStyle = '#1FD286'; g.fillRect(18, y + 11, 8, 8);
      g.fillStyle = '#7C8B85'; for (let x = 36; x < w - 20; x += 10) g.fillRect(x, y + 8, 5, 14);
    }
  });
}
function qrVoxels(size, mat, accent) {
  const Mx = window.__qr, n = Mx.length, cells = [];
  Mx.forEach((row, y) => [...row].forEach((v, x) => { if (v === '1') cells.push([x, y]); }));
  const s = size / n, im = new THREE.InstancedMesh(new THREE.BoxGeometry(s * 0.9, s * 1.4, s * 0.9), mat, cells.length);
  const m4 = new THREE.Matrix4();
  cells.forEach(([x, y], i) => { m4.makeTranslation((x - n / 2 + 0.5) * s, 0, (y - n / 2 + 0.5) * s); im.setMatrixAt(i, m4); });
  im.userData = { cells, n, s };
  return im;
}
function buildPillars(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  add(g, at(rbox(10, 1.8, 10, 0.7, M.silver), 0, 0.9, 0));
  add(g, at(rbox(9, 0.6, 9, 0.5, M.white), 0, 2.05, 0));
  add(g, neonRing(9.6, 9.6, 1.0, 1.75, 0.07));
  const top = textPlane(8, 8, hubTex()); top.rotation.x = -Math.PI / 2; top.position.set(0, 2.37, 0); g.add(top);
  blob(g, 60, 60);
  const ringG = new THREE.Mesh(new THREE.TorusGeometry(15.5, 0.55, 16, 160), M.glass); ringG.rotation.x = Math.PI / 2; ringG.position.y = 0.9; g.add(ringG);
  const ringN = new THREE.Mesh(new THREE.TorusGeometry(15.5, 0.12, 8, 160), M.neon); ringN.rotation.x = Math.PI / 2; ringN.position.y = 0.9; g.add(ringN);
  const sats = [[-11, -11], [11, -11], [-11, 11], [11, 11]].map(([x, z], i) => {
    const s = platform(7.4, 7.4, 1.5); s.position.set(x, 0, z); g.add(s);
    const cn = add(g, tube([V(x * 0.3, 1.2, z * 0.3), V(x * 0.62, 1.1, z * 0.62)], 0.34, M.glass, false, 20));
    add(g, tube([V(x * 0.3, 1.2, z * 0.3), V(x * 0.62, 1.1, z * 0.62)], 0.08, M.neon, false, 20));
    return s;
  });
  // biểu tượng từng trụ cột
  const top0 = sats[0].userData.top;
  const g1 = gear(1.9, 1.5, 12, 0.5, M.green); g1.rotation.x = -0.25; g1.position.set(-0.8, top0 + 2.2, 0); sats[0].add(g1);
  const g2 = gear(1.1, 0.85, 9, 0.4, M.silver); g2.rotation.x = -0.25; g2.position.set(1.8, top0 + 1.2, 0.4); sats[0].add(g2);
  add(sats[0], at(rbox(4.6, 0.12, 3.2, 0.05, new THREE.MeshStandardMaterial({ color: '#EAF6FF', roughness: 0.4 })), 0, top0 + 0.1, 1.2));
  UPD.push((t) => { g1.rotation.z = t * 0.6; g2.rotation.z = -t * 1.0 - 0.2; });
  const cap = gradCap(0.95); cap.position.set(0, top0 + 1.2, 0); sats[1].add(cap);
  add(sats[1], at(rbox(4.6, 0.3, 3.2, 0.15, M.dark), 0, top0 + 0.15, 0));
  UPD.push((t) => { cap.position.y = top0 + 1.2 + Math.sin(t * 1.4) * 0.25; cap.rotation.y = t * 0.3; });
  const chip = add(sats[2], at(rbox(4.4, 0.7, 4.4, 0.2, M.gglass), 0, top0 + 0.35, 0));
  add(sats[2], at(rbox(2.2, 0.5, 2.2, 0.15, M.dark), 0, top0 + 0.9, 0));
  for (let i = 0; i < 7; i++) {
    [[-2.4, 0], [2.4, 0], [0, -2.4], [0, 2.4]].forEach(([px, pz]) => {
      const pin = new THREE.Mesh(new THREE.BoxGeometry(pz ? 0.16 : 0.5, 0.12, pz ? 0.5 : 0.16), M.silver);
      pin.position.set(px || (i - 3) * 0.55, top0 + 0.2, pz || (i - 3) * 0.55); sats[2].add(pin);
    });
  }
  const rTex = rackTex(), rMat = new THREE.MeshStandardMaterial({ map: rTex, metalness: 0.2, roughness: 0.35 });
  [-1.5, 0, 1.5].forEach((x, i) => add(sats[3], at(rbox(1.3, 3.8 + (i === 1 ? 0.8 : 0), 1.8, 0.1, rMat), x, top0 + 1.9 + (i === 1 ? 0.4 : 0), 0)));
  return { g, sats, ringN, top };
}

/* ---------- 3 · DATA CITY ---------- */
function buildCity(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  add(g, at(rbox(24, 1.2, 24, 0.6, M.silver), 0, 0.6, 0));
  const boardTex = canvasTex(1024, 1024, (c, w, h) => {
    c.fillStyle = '#0F5E38'; c.fillRect(0, 0, w, h);
    const R = rng(17); c.strokeStyle = 'rgba(160,240,190,.35)'; c.lineWidth = 3;
    for (let i = 0; i < 70; i++) { let x = R() * w, y = R() * h; c.beginPath(); c.moveTo(x, y); const L = 60 + R() * 160; if (R() < 0.5) x += L; else y += L; c.lineTo(x, y); c.lineTo(x + 30, y + 30); c.stroke(); }
    c.fillStyle = '#E9EEEC'; for (let i = 1; i < 4; i++) { c.fillRect(i * w / 4 - 14, 0, 28, h); c.fillRect(0, i * h / 4 - 14, w, 28); }
  });
  add(g, at(rbox(22.6, 0.4, 22.6, 0.3, new THREE.MeshStandardMaterial({ map: boardTex, roughness: 0.55, metalness: 0.1 })), 0, 1.3, 0));
  add(g, neonRing(23.6, 23.6, 0.6, 1.15, 0.07));
  blob(g, 44, 44);
  const R = rng(4), lots = [];
  for (let i = 0; i < 4; i++) for (let j = 0; j < 4; j++) for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) {
    const cx = -8.47 + i * 5.65 + (a - 0.5) * 2.3, cz = -8.47 + j * 5.65 + (b - 0.5) * 2.3;
    const center = (i === 1 || i === 2) && (j === 1 || j === 2);
    lots.push({ x: cx, z: cz, h: center ? 3 + R() * 6 : 0.8 + R() * 3.0, green: R() < 0.35, d: R() * 1.4 + Math.hypot(cx, cz) * 0.05 });
  }
  const bm = new THREE.InstancedMesh(new THREE.BoxGeometry(1.8, 1, 1.8), new THREE.MeshStandardMaterial({ color: '#ffffff', metalness: 0.3, roughness: 0.3 }), lots.length);
  lots.forEach((l, i) => bm.setColorAt(i, new THREE.Color(l.green ? '#1E8F57' : (i % 3 ? '#E9EFEC' : '#B9C7C1'))));
  g.add(bm);
  // cây xanh
  const trees = new THREE.InstancedMesh(new THREE.ConeGeometry(0.35, 1.1, 10), M.green, 40), m4 = new THREE.Matrix4();
  for (let i = 0; i < 40; i++) {
    const side = Math.floor(i / 10), u = -10.6 + (i % 10) * 2.35;
    const [px, pz] = [[u, -10.6], [u, 10.6], [-10.6, u], [10.6, u]][side];
    m4.makeTranslation(px, 2.05, pz); trees.setMatrixAt(i, m4);
  }
  g.add(trees);
  // tuabin gió
  const turbines = [[-9.5, -9.5], [9.5, -9.2]].map(([x, z]) => {
    const tg = new THREE.Group(); tg.position.set(x, 1.5, z); g.add(tg);
    add(tg, at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.16, 5, 12), M.white), 0, 2.5, 0));
    const hub = add(tg, at(new THREE.Group(), 0, 5, 0.2));
    for (let k = 0; k < 3; k++) { const bl = new THREE.Mesh(new THREE.BoxGeometry(0.16, 2.4, 0.05), M.white); bl.position.y = 1.2; const p = new THREE.Group(); p.rotation.z = k * 2.094; p.add(bl); hub.add(p); }
    return hub;
  });
  const lines = [
    [V(-11, 1.62, 2.8), V(-5.6, 1.62, 2.8), V(-2.8, 1.62, 0), V(2.8, 1.62, 0), V(5.6, 1.62, -2.8), V(11, 1.62, -2.8)],
    [V(0, 1.62, 11), V(0, 1.62, 5.6), V(2.8, 1.62, 2.8), V(2.8, 1.62, -5.6), V(0, 1.62, -11)],
  ].map((pts) => add(g, tube(pts, 0.1, M.neonOr, false, 200)));
  return { g, bm, lots, lines, turbines };
}

/* ---------- 4 · STAIRS ---------- */
function buildStairs(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  const pos = [[-15, 0, 6], [-5, 1.6, 2], [5, 3.2, -2], [15, 4.8, -6]];
  const plats = pos.map(([x, y, z]) => {
    const p = platform(7, 7, 1.4 + y); p.position.set(x, 0, z); g.add(p); return p;
  });
  const links = pos.slice(0, 3).map((p, i) => {
    const q = pos[i + 1];
    return add(g, tube([V(p[0] + 3.6, 0.8 + p[1], p[2] - 1), V((p[0] + q[0]) / 2, 0.5 + (p[1] + q[1]) / 2, (p[2] + q[2]) / 2 + 1.2), V(q[0] - 3.6, 0.8 + q[1], q[2] + 1)], 0.1, M.neon, false, 60));
  });
  const T = plats.map((p) => p.userData.top);
  // 1 · bảng kẹp hồ sơ + kính lúp
  const clip = add(plats[0], at(rbox(2.6, 3.4, 0.25, 0.12, M.dark), -0.6, T[0] + 1.8, 0)); clip.rotation.x = -0.25;
  add(clip, at(new THREE.Mesh(new THREE.PlaneGeometry(2.2, 2.9), new THREE.MeshStandardMaterial({ color: '#F7F9F8' })), 0, -0.1, 0.14));
  const mag = new THREE.Group(); mag.position.set(1.3, T[0] + 1.5, 0.8); plats[0].add(mag);
  add(mag, new THREE.Mesh(new THREE.TorusGeometry(0.8, 0.14, 12, 40), M.green));
  add(mag, at(new THREE.Mesh(new THREE.CylinderGeometry(0.12, 0.12, 1.6, 12), M.dark), 0.9, -1.1, 0)).rotation.z = 0.7;
  // 2 · biểu đồ cột
  [[-1.8, 1.4, M.white], [-0.6, 2.2, M.green], [0.6, 1.8, M.white], [1.8, 3.2, M.green]].forEach(([x, h, m]) => add(plats[1], at(rbox(0.9, h, 0.9, 0.1, m), x, T[1] + h / 2, 0)));
  add(plats[1], tube([V(-1.8, T[1] + 2.2, 0.8), V(-0.6, T[1] + 3.0, 0.8), V(0.6, T[1] + 2.6, 0.8), V(1.8, T[1] + 4.0, 0.8)], 0.06, M.neon, false, 40));
  // 3 · sách & chứng nhận
  add(plats[2], at(rbox(1.0, 3.2, 2.4, 0.1, M.green), -1.2, T[2] + 1.6, 0));
  add(plats[2], at(rbox(1.0, 2.8, 2.2, 0.1, M.deep), -0.1, T[2] + 1.4, 0));
  const paper = add(plats[2], at(rbox(0.12, 3.0, 2.3, 0.05, M.white), 0.9, T[2] + 1.5, 0.1)); paper.rotation.z = -0.18;
  add(plats[2], at(new THREE.Mesh(new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24), M.green), 1.3, T[2] + 1.0, 1.2)).rotation.x = Math.PI / 2;
  // 4 · đô thị xanh với mầm cây
  [[-2, 1.4], [-1.2, 2.4], [1.6, 1.8], [2.2, 2.8], [-2.2, 0.9]].forEach(([x, h], i) => add(plats[3], at(rbox(0.9, h, 0.9, 0.08, i % 2 ? M.white : M.silver), x, T[3] + h / 2, i < 2 ? -1.8 : 1.6)));
  add(plats[3], at(rbox(1.8, 1.4, 1.8, 0.2, M.gglass), 0, T[3] + 0.7, 0));
  const leafM = new THREE.MeshStandardMaterial({ color: '#35C46F', roughness: 0.4 });
  add(plats[3], at(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.1, 2.2, 8), M.deep), 0, T[3] + 2.4, 0));
  const lf1 = add(plats[3], at(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), leafM), 0.8, T[3] + 3.4, 0)); lf1.scale.set(1.0, 0.18, 0.55); lf1.rotation.z = 0.5;
  const lf2 = add(plats[3], at(new THREE.Mesh(new THREE.SphereGeometry(1, 20, 12), leafM), -0.7, T[3] + 3.0, 0)); lf2.scale.set(0.8, 0.16, 0.45); lf2.rotation.z = -0.5;
  return { g, plats, links, pos };
}

/* ---------- 5 · CAP ---------- */
function buildCap(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  add(g, at(rbox(15, 0.8, 15, 0.4, M.silver), 0, 0.4, 0));
  add(g, at(rbox(11.5, 0.7, 11.5, 0.35, M.gglass), 0, 1.15, 0));
  add(g, at(rbox(8, 0.7, 8, 0.3, M.white), 0, 1.8, 0));
  add(g, at(rbox(4.2, 0.5, 4.2, 0.2, M.green), 0, 2.4, 0));
  add(g, neonRing(11.7, 11.7, 0.5, 1.5, 0.06));
  add(g, neonRing(4.4, 4.4, 0.3, 2.66, 0.05));
  blob(g, 30, 30);
  for (let s = 0; s < 4; s++) for (let i = 0; i < 9; i++) {
    const pin = new THREE.Mesh(new THREE.BoxGeometry(0.22, 0.14, 1.4), M.silver);
    const o = (i - 4) * 1.1;
    if (s < 2) pin.position.set(o, 0.85, s ? 6.9 : -6.9); else { pin.rotation.y = Math.PI / 2; pin.position.set(s === 2 ? 6.9 : -6.9, 0.85, o); }
    g.add(pin);
  }
  const traces = [0, 1, 2, 3].map((k) => { const a = k * Math.PI / 2 + Math.PI / 4; return add(g, tube([V(Math.cos(a) * 2.6, 2.2, Math.sin(a) * 2.6), V(Math.cos(a) * 4.2, 2.18, Math.sin(a) * 4.2), V(Math.cos(a) * 7.5, 0.82, Math.sin(a) * 7.5)], 0.06, M.neon, false, 40)); });
  const beam = add(g, at(new THREE.Mesh(new THREE.CylinderGeometry(3.4, 2.1, 6.5, 40, 1, true), M.beam), 0, 5.9, 0));
  const cap = add(g, gradCap(1.9, M.white));
  cap.position.set(0, 10, 0);
  UPD.push((t) => { cap.position.y = 10 + Math.sin(t * 1.1) * 0.35; cap.rotation.y = 0.4 + t * 0.25; });
  return { g, cap, beam, traces };
}

/* ---------- 6 · SHIELD ---------- */
function buildShield(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  const p = platform(12, 9, 1.0); g.add(p);
  const ext = { depth: 1.2, bevelEnabled: true, bevelThickness: 0.3, bevelSize: 0.25, bevelSegments: 3, curveSegments: 20 };
  const top = new THREE.Shape(); top.moveTo(-4, 2.3); top.lineTo(-4, 5); top.lineTo(0, 5.8); top.lineTo(4, 5); top.lineTo(4, 2.3); top.lineTo(-4, 2.3);
  const mid = new THREE.Shape(); mid.moveTo(-4, -0.8); mid.lineTo(-4, 1.9); mid.lineTo(4, 1.9); mid.lineTo(4, -0.8); mid.lineTo(-4, -0.8);
  const bot = new THREE.Shape(); bot.moveTo(-4, -1.2); bot.lineTo(4, -1.2); bot.lineTo(4, -1.6); bot.quadraticCurveTo(3.6, -4.0, 0, -5.4); bot.quadraticCurveTo(-3.6, -4.0, -4, -1.6); bot.lineTo(-4, -1.2);
  const sm = new THREE.MeshStandardMaterial({ color: '#2E8C5A', metalness: 0.45, roughness: 0.28 });
  const sh = new THREE.Group(); sh.position.set(0, 7.6, 0); g.add(sh);
  const parts = [[top, sm], [mid, M.red], [bot, sm]].map(([s, m]) => { const me = new THREE.Mesh(new THREE.ExtrudeGeometry(s, ext), m); me.position.z = -0.6; sh.add(me); return me; });
  const ck = add(sh, tube([V(-1.6, 0.5, 1.35), V(-0.4, -0.6, 1.35), V(2.0, 1.6, 1.35)], 0.22, new THREE.MeshBasicMaterial({ color: neonC('#ffffff', 2.2) }), false, 40));
  ck.userData.curve.curveType = 'centripetal';
  UPD.push((t) => { sh.rotation.y = Math.sin(t * 0.5) * 0.35; });
  return { g, sh, parts, ck };
}

/* ---------- 7 · QR + CRATE ---------- */
function buildQR(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  const p = platform(13, 13, 1.1); g.add(p);
  const wood = canvasTex(512, 512, (c, w, h) => {
    c.fillStyle = '#B47A42'; c.fillRect(0, 0, w, h);
    c.strokeStyle = '#7A4E24'; c.lineWidth = 6;
    for (let y = 0; y < h; y += 64) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); }
    c.fillStyle = '#9A6533'; c.fillRect(0, 0, 60, h); c.fillRect(w - 60, 0, 60, h); c.fillRect(0, 0, w, 50); c.fillRect(0, h - 50, w, 50);
    c.save(); c.translate(w / 2, h / 2); c.rotate(Math.atan2(h - 100, w - 120)); c.fillRect(-360, -26, 720, 52); c.restore();
  });
  M.wood = new THREE.MeshStandardMaterial({ map: wood, roughness: 0.7 });
  const crate = add(g, at(rbox(5.4, 4.2, 5.4, 0.15, M.wood), 0, p.userData.top + 2.1, 0));
  const beam = add(g, at(new THREE.Mesh(new THREE.CylinderGeometry(3.6, 2.4, 4.0, 4, 1, true), M.beam), 0, p.userData.top + 6.2, 0)); beam.rotation.y = Math.PI / 4;
  const qg = new THREE.Group(); qg.position.set(0, p.userData.top + 9.2, 0); qg.rotation.x = 0.55; g.add(qg);
  const vox = qrVoxels(8.2, new THREE.MeshStandardMaterial({ color: '#DCE3E1', metalness: 0.75, roughness: 0.25 }));
  qg.add(vox);
  // các chip vệ tinh nối về bệ
  const R = rng(8), chips = [];
  for (let i = 0; i < 6; i++) {
    const a = -2.6 + i * 0.5 + R() * 0.2, r = 14 + R() * 4, x = Math.cos(a) * r, z = Math.sin(a) * r;
    const c = add(g, at(rbox(2.2, 0.6, 2.2, 0.15, M.white), x, 0.3, z));
    add(g, at(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.08, 1.2), M.neonDim), x, 0.64, z));
    add(g, tube([V(x * 0.9, 0.08, z * 0.9), V(x * 0.62, 0.08, z * 0.78), V(x * 0.5, 0.08, z * 0.5)], 0.05, M.neon, false, 30));
    chips.push(c);
  }
  return { g, crate, vox, qg, beam, chips };
}

/* ---------- 8 · GS1 PIPELINE ---------- */
function buildGS1(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  const pa = platform(10, 10, 1.2); pa.position.x = -17; g.add(pa);
  const pc = platform(10, 10, 1.2); pc.position.x = 17; g.add(pc);
  const T = pa.userData.top;
  // trang trại + nhà máy
  const rows = new THREE.InstancedMesh(new THREE.SphereGeometry(0.28, 10, 8), new THREE.MeshStandardMaterial({ color: '#3FAE4A', roughness: 0.5 }), 60), m4 = new THREE.Matrix4();
  for (let i = 0; i < 60; i++) { m4.makeTranslation(-3.8 + (i % 6) * 0.72, T + 0.25, -0.4 + Math.floor(i / 6) * 0.45); rows.setMatrixAt(i, m4); }
  pa.add(rows);
  add(pa, at(rbox(4.4, 0.12, 4.8, 0.05, new THREE.MeshStandardMaterial({ color: '#7A5634', roughness: 0.9 })), -1.9, T + 0.05, 1.7));
  add(pa, at(rbox(2.6, 2.2, 2.4, 0.1, new THREE.MeshStandardMaterial({ color: '#B8392E', roughness: 0.5 })), -2.3, T + 1.1, -2.6));
  add(pa, at(prism(3.0, 1.2, 2.6, M.white), -2.3, T + 2.2, -2.6));
  add(pa, at(rbox(3.2, 2.0, 2.6, 0.1, M.white), 2.2, T + 1.0, -1.8));
  [1.3, 2.3].forEach((x) => add(pa, at(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.32, 2.4, 16), M.silver), x, T + 2.6, -2.6)));
  [[1.6, 2.4], [3.0, 1.6]].forEach(([x, z]) => { add(pa, at(rbox(1.3, 0.8, 0.8, 0.08, M.green), x, T + 0.45, z)); add(pa, at(rbox(0.5, 0.7, 0.78, 0.08, M.white), x + 0.85, T + 0.4, z)); });
  // hub HL&HT lục giác
  const hub = new THREE.Group(); g.add(hub);
  add(hub, at(new THREE.Mesh(new THREE.CylinderGeometry(6, 6.4, 1.6, 6), M.silver), 0, 0.8, 0));
  add(hub, at(new THREE.Mesh(new THREE.CylinderGeometry(5.2, 5.2, 0.6, 6), M.white), 0, 1.9, 0));
  add(hub, at(new THREE.Mesh(new THREE.CylinderGeometry(4.3, 4.3, 1.6, 6), M.glass), 0, 3.0, 0));
  const hr = add(hub, at(new THREE.Mesh(new THREE.TorusGeometry(4.5, 0.07, 8, 6), M.neon), 0, 2.25, 0)); hr.rotation.x = Math.PI / 2; hr.rotation.z = Math.PI / 6;
  const lg = textPlane(6.4, 2.3, imgTex('hlht')); lg.position.set(0, 5.3, 0); hub.add(lg);
  const stand = add(hub, at(rbox(6.8, 2.7, 0.2, 0.2, M.white), 0, 5.3, -0.12));
  blob(hub, 20, 20);
  // container + điện thoại
  const cont = canvasTex(512, 256, (c, w, h) => { c.fillStyle = '#1C7A45'; c.fillRect(0, 0, w, h); c.fillStyle = 'rgba(0,0,0,.18)'; for (let x = 0; x < w; x += 22) c.fillRect(x, 0, 9, h); c.strokeStyle = 'rgba(255,255,255,.25)'; c.lineWidth = 6; c.strokeRect(6, 6, w - 12, h - 12); });
  add(pc, at(rbox(6.4, 3.0, 3.0, 0.1, new THREE.MeshStandardMaterial({ map: cont, roughness: 0.5, metalness: 0.3 })), 0.6, T + 1.5, -2.2));
  const phoneTex = canvasTex(256, 512, (c, w, h) => {
    c.fillStyle = '#123E27'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#fff'; rr(c, 34, 150, w - 68, w - 68, 16); c.fill();
    const Mx = window.__qr, n = Mx.length, s = (w - 100) / n;
    c.fillStyle = '#10261A'; Mx.forEach((row, y) => [...row].forEach((v, x) => { if (v === '1') c.fillRect(50 + x * s, 166 + y * s, s, s); }));
    drawText(c, 'PRODUCT', w / 2, 70, 26, 800, '#8EF0BE'); drawText(c, 'TRACEABILITY', w / 2, 104, 26, 800, '#8EF0BE');
    c.fillStyle = '#22B35E'; c.beginPath(); c.arc(w / 2, 430, 34, 0, 7); c.fill();
    c.strokeStyle = '#fff'; c.lineWidth = 8; c.beginPath(); c.moveTo(w / 2 - 15, 430); c.lineTo(w / 2 - 3, 443); c.lineTo(w / 2 + 17, 418); c.stroke();
  });
  const ph = add(pc, at(rbox(2.6, 0.24, 5.0, 0.3, M.dark), -0.6, T + 0.2, 2.3)); ph.rotation.y = -0.3;
  const scr = textPlane(2.3, 4.6, phoneTex, false); scr.rotation.x = -Math.PI / 2; scr.position.y = 0.13; ph.add(scr);
  // ống kính + dòng dữ liệu
  const c1 = [V(-12, 1.0, 0), V(-9, 0.9, 1.5), V(-6, 1.2, 0)], c2 = [V(6, 1.2, 0), V(9, 0.9, -1.5), V(12, 1.0, 0)];
  const tubes = [c1, c2].map((pts) => { add(g, tube(pts, 0.42, M.glass, false, 40)); return add(g, tube(pts, 0.09, M.neon, false, 40)); });
  const pk = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 12, 8), M.neon, 12); g.add(pk);
  UPD.push((t) => {
    for (let i = 0; i < 12; i++) { const cv = tubes[i % 2].userData.curve, u = ((t * 0.45 + i * 0.167) % 1); const q = cv.getPointAt(u); m4.makeTranslation(q.x, q.y, q.z); pk.setMatrixAt(i, m4); }
    pk.instanceMatrix.needsUpdate = true;
  });
  return { g, pa, hub, pc, tubes };
}

/* ---------- 9 · PHONE ---------- */
function screenTex(verified) {
  return canvasTex(512, 1080, (c, w, h) => {
    if (!verified) {
      const gr = c.createRadialGradient(w / 2, h / 2, 50, w / 2, h / 2, 600); gr.addColorStop(0, '#2B4A3B'); gr.addColorStop(1, '#0B1812');
      c.fillStyle = gr; c.fillRect(0, 0, w, h);
      c.strokeStyle = '#1FD286'; c.lineWidth = 10; rr(c, 96, 360, 320, 320, 30); c.stroke();
      c.fillStyle = '#fff'; const R = rng(21); for (let x = 130; x < 380;) { const ww = 4 + Math.floor(R() * 10); c.fillRect(x, 440, ww, 160); x += ww + 4 + Math.floor(R() * 8); }
      drawText(c, 'Đưa mã vào khung để quét', w / 2, 760, 28, 600, '#CFE9DA');
      return;
    }
    c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h);
    c.fillStyle = '#1B4A33'; rr(c, 30, 70, w - 60, 470, 30); c.fill();
    const im = IMG.jar, ih = 470, iw = im.width * ih / im.height; c.save(); rr(c, 30, 70, w - 60, 470, 30); c.clip(); c.drawImage(im, w / 2 - iw / 2, 70, iw, ih); c.restore();
    c.fillStyle = '#22B35E'; rr(c, 30, 510, w - 60, 90, 20); c.fill();
    drawText(c, '✓  Đã xác thực', 70, 555, 38, 800, '#fff', 'left');
    drawText(c, 'Cao sâm – hũ 100g', 40, 660, 40, 800, '#10261A', 'left');
    ['Vùng trồng', 'Thu hoạch', 'Kiểm định', 'Đóng gói'].forEach((s, i) => { c.fillStyle = i < 3 ? '#E3F4EA' : '#EEF2F0'; rr(c, 30 + i * 116, 720, 106, 56, 14); c.fill(); drawText(c, s, 83 + i * 116, 748, 19, 700, '#0B7A47'); });
    ['Doanh nghiệp', 'Mã lô', 'Thị trường', 'Chứng nhận'].forEach((s, i) => { drawText(c, s, 40, 830 + i * 58, 26, 600, '#44574B', 'left'); c.fillStyle = '#E4ECE7'; rr(c, 260, 818 + i * 58, 210, 22, 11); c.fill(); });
  });
}
function buildPhone(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  const p = platform(10, 10, 1.0); g.add(p);
  const ph = new THREE.Group(); ph.position.set(0, 8.2, 0); ph.rotation.set(-0.08, -0.35, 0); g.add(ph);
  add(ph, rbox(4.6, 9.4, 0.5, 0.55, M.dark));
  const scrMat = new THREE.MeshBasicMaterial({ map: screenTex(false), toneMapped: false });
  const scr = new THREE.Mesh(new THREE.PlaneGeometry(4.2, 8.86), scrMat); scr.position.z = 0.26; ph.add(scr);
  add(ph, at(rbox(1.2, 0.3, 0.1, 0.12, new THREE.MeshBasicMaterial({ color: '#05080A' })), 0, 4.1, 0.28));
  const laser = add(ph, at(new THREE.Mesh(new THREE.BoxGeometry(3.4, 0.06, 0.05), M.neon), 0, 0.7, 0.32));
  const badge = new THREE.Group(); badge.position.set(3.4, 1.6, 1.4); ph.add(badge);
  const bTex = canvasTex(512, 170, (c, w, h) => { c.fillStyle = '#22B35E'; rr(c, 0, 0, w, h, 34); c.fill(); drawText(c, '✓ ĐÃ XÁC THỰC', w / 2, h / 2 + 2, 56, 800, '#fff'); });
  add(badge, textPlane(4.2, 1.4, bTex));
  const jTex = imgTex('jar');
  const jar = new THREE.Group(); jar.position.set(-3.9, 3.0, 1.0); jar.rotation.y = 0.35; ph.add(jar);
  add(jar, at(rbox(2.6, 4.2, 0.12, 0.2, M.white), 0, 0, -0.08));
  add(jar, textPlane(2.3, 3.9, jTex, false));
  const glow = add(g, at(new THREE.Mesh(new THREE.CylinderGeometry(2.8, 2.8, 0.1, 48), M.neonDim), 0, p.userData.top + 0.05, 0));
  UPD.push((t) => { ph.position.y = 8.2 + Math.sin(t * 0.9) * 0.2; });
  return { g, ph, scrMat, laser, badge, jar };
}

/* ---------- 10 · MAP CONTROL ---------- */
function buildMap(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  add(g, at(rbox(17, 0.8, 17.6, 0.4, M.silver), 0, 0.4, 0));
  const mp = textPlane(16, 16.6, imgTex('map'), false); mp.rotation.x = -Math.PI / 2; mp.position.y = 0.82; g.add(mp);
  add(g, neonRing(17.2, 17.8, 0.4, 0.5, 0.06));
  blob(g, 30, 30);
  const loc = [[-2.3, -6.6], [2.0, -1.8], [-1.0, 5.0]].map(([u, v]) => V(u, 0.9, v));
  const pins = loc.map((q) => {
    const pg = new THREE.Group(); pg.position.copy(q); g.add(pg);
    const head = add(pg, at(new THREE.Mesh(new THREE.SphereGeometry(0.55, 24, 16), M.neon), 0, 3.2, 0));
    add(pg, at(new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.8, 24), M.white), 0, 2.2, 0)).rotation.x = Math.PI;
    const beam = add(pg, at(new THREE.Mesh(new THREE.CylinderGeometry(0.6, 1.1, 6, 24, 1, true), M.beam), 0, 3, 0));
    const rings = [0, 1].map(() => { const r = add(pg, at(new THREE.Mesh(new THREE.TorusGeometry(1, 0.06, 8, 48), M.neon), 0, 0.05, 0)); r.rotation.x = Math.PI / 2; return r; });
    return { pg, head, beam, rings };
  });
  const tag = new THREE.Group(); tag.position.set(0, 11, 0); g.add(tag);
  const tTex = canvasTex(640, 170, (c, w, h) => { c.fillStyle = '#FFFFFF'; rr(c, 0, 0, w, h, 30); c.fill(); drawText(c, 'SERIAL', 40, 52, 26, 800, '#7D8E84', 'left'); drawText(c, '8936 0457 2231 09', 40, 112, 50, 800, '#0F2419', 'left'); });
  add(tag, textPlane(6.4, 1.7, tTex));
  const links = loc.map((q) => add(g, tube([V(0, 10.2, 0), V(q.x * 0.6, 7, q.z * 0.6), V(q.x, 3.8, q.z)], 0.06, M.neon, false, 40)));
  return { g, pins, tag, links, mp };
}

/* ---------- 11 · BUILDING ---------- */
function buildBuilding(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  add(g, at(rbox(22, 0.8, 16, 0.3, M.silver), 0, 0.4, 0));
  blob(g, 40, 30);
  const floors = [0, 1, 2].map((k) => {
    const f = new THREE.Group(); f.position.y = 0.8 + k * 3.6; g.add(f);
    const w = k === 2 ? 14 : 20, d = k === 2 ? 10 : 14;
    add(f, at(rbox(w, 0.35, d, 0.1, M.white), 0, 0.17, 0));
    add(f, at(new THREE.Mesh(new THREE.BoxGeometry(w, 3.2, 0.25), M.white), 0, 1.95, -d / 2));
    add(f, at(new THREE.Mesh(new THREE.BoxGeometry(0.25, 3.2, d), M.white), -w / 2, 1.95, 0));
    add(f, at(new THREE.Mesh(new THREE.BoxGeometry(w, 0.1, 0.1), M.neonDim), 0, 0.36, d / 2));
    return f;
  });
  // tầng 1: dây chuyền + tay robot + phòng máy chủ
  add(floors[0], at(rbox(12, 0.9, 1.6, 0.1, M.dark), -2, 0.8, 1.5));
  const arms = [-6, -2, 2].map((x) => {
    const a = new THREE.Group(); a.position.set(x, 0.35, -0.6); floors[0].add(a);
    add(a, at(new THREE.Mesh(new THREE.CylinderGeometry(0.45, 0.55, 0.5, 20), M.dark), 0, 0.25, 0));
    const j = add(a, at(new THREE.Group(), 0, 0.5, 0));
    const u = add(j, at(rbox(0.36, 1.8, 0.36, 0.1, M.orange), 0, 0.9, 0));
    const e = add(j, at(new THREE.Group(), 0, 1.8, 0)); add(e, at(rbox(0.3, 1.4, 0.3, 0.1, M.orange), 0, 0.7, 0));
    return { j, e };
  });
  UPD.push((t) => arms.forEach((a, i) => { a.j.rotation.z = 0.5 + Math.sin(t * 1.6 + i) * 0.35; a.e.rotation.z = -1.3 + Math.sin(t * 1.6 + i + 1) * 0.4; a.j.rotation.y = Math.sin(t * 0.8 + i) * 0.6; }));
  const rMat = new THREE.MeshStandardMaterial({ map: rackTex(), roughness: 0.4, metalness: 0.2 });
  [5.5, 7, 8.5].forEach((x) => add(floors[0], at(rbox(1.2, 2.8, 1.6, 0.08, rMat), x, 1.75, -4.8)));
  add(floors[0], at(new THREE.Mesh(new THREE.BoxGeometry(5, 3, 3.8), new THREE.MeshStandardMaterial({ color: '#BFF5D8', transparent: true, opacity: 0.25, depthWrite: false })), 7, 1.8, -4.4));
  // tầng 2: kho
  for (let s = 0; s < 3; s++) {
    add(floors[1], at(new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 1.4), M.silver), -5 + s * 6, 1.2, -4.8));
    add(floors[1], at(new THREE.Mesh(new THREE.BoxGeometry(5, 0.12, 1.4), M.silver), -5 + s * 6, 2.4, -4.8));
    for (let b = 0; b < 3; b++) { add(floors[1], at(rbox(1.1, 0.9, 1.0, 0.05, M.wood), -6.6 + s * 6 + b * 1.6, 1.72, -4.8)); add(floors[1], at(rbox(1.1, 0.8, 1.0, 0.05, M.wood), -6.2 + s * 6 + b * 1.6, 2.86, -4.8)); }
  }
  const fork = add(floors[1], at(rbox(1.4, 1.2, 2.2, 0.15, M.orange), 0, 0.95, 1.8));
  UPD.push((t) => { fork.position.x = Math.sin(t * 0.7) * 5; });
  [[-4, 2], [3, 3], [6, 1]].forEach(([x, z]) => add(floors[1], at(rbox(1.2, 1.0, 1.2, 0.06, M.wood), x, 0.85, z)));
  // tầng 3: văn phòng
  const scrM = new THREE.MeshBasicMaterial({ map: canvasTex(256, 160, (c, w, h) => { c.fillStyle = '#0E1A15'; c.fillRect(0, 0, w, h); c.strokeStyle = '#1FD286'; c.lineWidth = 6; c.beginPath(); c.moveTo(10, 120); c.lineTo(70, 80); c.lineTo(120, 100); c.lineTo(180, 40); c.lineTo(246, 60); c.stroke(); c.fillStyle = '#F0932B'; c.fillRect(20, 20, 60, 16); }) });
  [[-3.5, -2], [0.5, -2], [-3.5, 1.6], [0.5, 1.6]].forEach(([x, z]) => {
    add(floors[2], at(rbox(3, 0.18, 1.5, 0.05, M.white), x, 1.1, z));
    add(floors[2], at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.0, 0.1), M.silver), x, 0.6, z));
    const s = add(floors[2], at(new THREE.Mesh(new THREE.PlaneGeometry(1.4, 0.9), scrM), x, 1.75, z - 0.4));
  });
  [[-6, 3.5], [4.5, -3.5]].forEach(([x, z]) => add(floors[2], at(new THREE.Mesh(new THREE.ConeGeometry(0.5, 1.4, 12), M.green), x, 1.0, z)));
  // cáp dữ liệu dọc các tầng
  const vl = [[7, -3.5, M.neon], [8, -3.2, M.neonOr]].map(([x, z, m]) => add(g, tube([V(x, 1.2, z), V(x, 4.6, z), V(x - 2, 4.8, z + 1), V(x - 2, 8.3, z + 1), V(x - 4, 8.5, z + 2), V(x - 4, 11.5, z + 2)], 0.1, m, false, 120)));
  return { g, floors, vl };
}

/* ---------- 12 · FARM ---------- */
function buildFarm(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  const soil = canvasTex(512, 128, (c, w, h) => { const gr = c.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, '#6B4A2B'); gr.addColorStop(1, '#3E2A18'); c.fillStyle = gr; c.fillRect(0, 0, w, h); const R = rng(3); c.fillStyle = 'rgba(255,255,255,.08)'; for (let i = 0; i < 200; i++) c.fillRect(R() * w, R() * h, 3, 3); });
  M.soil = new THREE.MeshStandardMaterial({ map: soil, roughness: 0.95 });
  const top = new THREE.MeshStandardMaterial({ color: '#79B35A', roughness: 0.8 });
  add(g, at(new THREE.Mesh(new THREE.BoxGeometry(34, 3, 24), [M.soil, M.soil, top, M.soil, M.soil, M.soil]), 0, 1.5, 0));
  blob(g, 60, 44);
  const T = 3.02, R = rng(12), m4 = new THREE.Matrix4(), cropN = 22 * 10;
  const crops = new THREE.InstancedMesh(new THREE.SphereGeometry(0.42, 10, 8), new THREE.MeshStandardMaterial({ color: '#ffffff', roughness: 0.6 }), cropN);
  for (let i = 0; i < cropN; i++) { const r = Math.floor(i / 22), c = i % 22; m4.makeScale(1, 0.8 + R() * 0.4, 1); m4.setPosition(-15 + c * 0.95, T + 0.3, -9 + r * 1.35); crops.setMatrixAt(i, m4); crops.setColorAt(i, new THREE.Color(r % 3 === 0 ? '#D65A3A' : r % 3 === 1 ? '#2E8B3A' : '#4FA64A')); }
  g.add(crops);
  add(g, at(rbox(21.5, 0.1, 13.8, 0.05, new THREE.MeshStandardMaterial({ color: '#6E4E2E', roughness: 1 })), -4.7, T, -2.6));
  const pond = add(g, at(rbox(8, 0.2, 7, 0.3, new THREE.MeshStandardMaterial({ color: '#4FB6E0', metalness: 0.2, roughness: 0.05, transparent: true, opacity: 0.8 })), 11.5, T + 0.02, 6.5));
  add(g, at(rbox(5, 3, 4, 0.1, M.white), 11, T + 1.5, -6));
  add(g, at(prism(5.6, 2.0, 4.4, new THREE.MeshStandardMaterial({ color: '#5D6B70', metalness: 0.5, roughness: 0.4 })), 11, T + 3.0, -6));
  // trạm cảm biến
  const sensors = [[-12, -6], [-6, 2], [-2, -7], [4, 1], [-10, 6], [7.5, 7.5]].map(([x, z]) => {
    const s = new THREE.Group(); s.position.set(x, T, z); g.add(s);
    add(s, at(new THREE.Mesh(new THREE.CylinderGeometry(0.08, 0.08, 2.2, 8), M.silver), 0, 1.1, 0));
    add(s, at(rbox(0.8, 0.6, 0.5, 0.1, M.white), 0, 2.3, 0));
    const led = add(s, at(new THREE.Mesh(new THREE.SphereGeometry(0.14, 12, 8), M.neon), 0, 2.7, 0));
    return s;
  });
  // tháp LoRa
  const tower = new THREE.Group(); tower.position.set(-14, T, 8.5); g.add(tower);
  add(tower, at(new THREE.Mesh(new THREE.CylinderGeometry(0.25, 0.5, 9, 16), M.silver), 0, 4.5, 0));
  add(tower, at(new THREE.Mesh(new THREE.CylinderGeometry(0.28, 0.28, 1.2, 16), M.neon), 0, 9.4, 0));
  const waves = [0, 1, 2].map(() => { const w = add(tower, at(new THREE.Mesh(new THREE.TorusGeometry(1, 0.05, 8, 64), M.neon), 0, 9.4, 0)); w.rotation.x = Math.PI / 2; return w; });
  // gateway + đám mây máy chủ
  const gw = new THREE.Group(); gw.position.set(-6, T, 10.5); g.add(gw);
  add(gw, at(rbox(2.4, 0.8, 1.6, 0.2, M.white), 0, 0.4, 0));
  [-0.8, 0.8].forEach((x) => add(gw, at(new THREE.Mesh(new THREE.CylinderGeometry(0.06, 0.06, 1.6, 8), M.dark), x, 1.5, -0.4)));
  add(gw, at(new THREE.Mesh(new THREE.BoxGeometry(1.2, 0.06, 0.06), M.neon), 0, 0.5, 0.82));
  const cloud = new THREE.Group(); cloud.position.set(4, 17, -2); g.add(cloud);
  [[0, 0, 0, 2.4], [2.4, -0.4, 0, 1.8], [-2.4, -0.5, 0, 1.7], [1.1, 1.3, 0, 1.7], [-1.2, 1.0, 0.2, 1.5]].forEach(([x, y, z, r]) => add(cloud, at(new THREE.Mesh(new THREE.SphereGeometry(r, 28, 18), M.white), x, y, z)));
  const srv = new THREE.Group(); srv.position.set(4, 12.2, -2); g.add(srv);
  [0, 1, 2].forEach((k) => { add(srv, at(rbox(3.2, 0.8, 2.2, 0.15, M.white), 0, k * 0.95, 0)); add(srv, at(new THREE.Mesh(new THREE.BoxGeometry(2.2, 0.06, 0.05), M.neon), 0, k * 0.95, 1.12)); });
  // đường dữ liệu
  const tp = V(-14, T + 9.4, 8.5), gp = V(-6, T + 1.2, 10.5), cp = V(4, 11.8, -2);
  const paths = sensors.map((s) => new THREE.QuadraticBezierCurve3(V(s.position.x, T + 2.7, s.position.z), V((s.position.x + tp.x) / 2, T + 9, (s.position.z + tp.z) / 2), tp));
  paths.push(new THREE.QuadraticBezierCurve3(tp, V(-10, T + 7, 10), gp));
  paths.push(new THREE.QuadraticBezierCurve3(gp, V(0, 12, 8), cp));
  const lines = paths.map((cv) => { const m = new THREE.Mesh(new THREE.TubeGeometry(cv, 40, 0.035, 6), M.neonDim); g.add(m); return m; });
  const pk = new THREE.InstancedMesh(new THREE.SphereGeometry(0.2, 10, 8), M.neon, paths.length * 2); g.add(pk);
  UPD.push((t) => {
    waves.forEach((w, i) => { const k = ((t * 0.55 + i / 3) % 1); w.scale.setScalar(1 + k * 9); w.material = M.neon; w.visible = k < 0.95; });
    let n = 0;
    paths.forEach((cv, j) => { for (let q = 0; q < 2; q++) { const u = ((t * 0.5 + j * 0.13 + q * 0.5) % 1); const p = cv.getPoint(u); m4.makeTranslation(p.x, p.y, p.z); pk.setMatrixAt(n++, m4); } });
    pk.instanceMatrix.needsUpdate = true;
    cloud.position.y = 17 + Math.sin(t * 0.8) * 0.3;
  });
  // thẻ dữ liệu nổi
  const cards = [['Độ ẩm đất', '42%', -9, 7.5, -4], ['Nhiệt độ', '28.5°C', -1, 8.2, -9], ['pH đất', '6.8', 6, 7.2, 3]].map(([a, b, x, y, z]) => {
    const tx = canvasTex(360, 170, (c, w, h) => { c.fillStyle = 'rgba(255,255,255,.95)'; rr(c, 0, 0, w, h, 26); c.fill(); drawText(c, a, 28, 48, 28, 700, '#7D8E84', 'left'); drawText(c, b, 28, 116, 62, 800, '#0B7A47', 'left'); });
    const m = textPlane(3.6, 1.7, tx); m.position.set(x, y, z); g.add(m); return m;
  });
  cards.forEach((c) => { c.userData.y0 = c.position.y; });
  UPD.push((t) => cards.forEach((c, i) => { c.position.y = c.userData.y0 + Math.sin(t * 1.2 + i * 2) * 0.25; c.quaternion.copy(camera.quaternion); }));
  return { g, sensors, tower, gw, cloud, srv, lines, cards, T };
}

/* ---------- 13 · SENSOR ---------- */
function buildSensor(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  const p = platform(12, 12, 1.0); g.add(p);
  const soilBlock = add(g, at(new THREE.Mesh(new THREE.BoxGeometry(7, 5, 7), [M.soil, M.soil, new THREE.MeshStandardMaterial({ color: '#5A3E24', roughness: 1 }), M.soil, M.soil, M.soil]), 0, p.userData.top + 2.5, 0));
  const glassBox = add(g, at(new THREE.Mesh(new THREE.BoxGeometry(7.4, 5.4, 7.4), M.glass), 0, p.userData.top + 2.7, 0));
  const dev = new THREE.Group(); dev.position.set(0, p.userData.top + 9, 0); g.add(dev);
  const faceTex = canvasTex(512, 420, (c, w, h) => { c.fillStyle = '#1F2E44'; c.fillRect(0, 0, w, h); c.fillStyle = '#0B1622'; rr(c, 40, 40, w - 80, 170, 20); c.fill(); drawText(c, 'ALL-IN-ONE', w / 2, 125, 64, 800, '#1FD286'); drawText(c, 'Powered by LATOI Australia', w / 2, 270, 26, 600, '#8FA3B8'); for (let i = 0; i < 5; i++) { c.fillStyle = '#1FD286'; c.beginPath(); c.arc(130 + i * 62, 350, 13, 0, 7); c.fill(); } });
  add(dev, rbox(4, 3.3, 1.3, 0.3, M.navy));
  const face = textPlane(3.6, 2.95, faceTex, false); face.position.z = 0.66; dev.add(face);
  const probes = [-1.35, -0.45, 0.45, 1.35].map((x) => add(dev, at(new THREE.Mesh(new THREE.CylinderGeometry(0.1, 0.06, 5.2, 12), M.silver), x, -4.2, 0)));
  const box2 = new THREE.Group(); box2.position.set(4.8, p.userData.top + 11, -3.5); g.add(box2);
  add(box2, rbox(5, 2.8, 2.4, 0.3, M.white));
  add(box2, at(new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.6, 0.1), M.dark), -1.5, 1.8, -0.8));
  add(box2, at(new THREE.Mesh(new THREE.CylinderGeometry(0.4, 0.4, 0.1, 24), M.neonDim), 1.4, 0, 1.22)).rotation.x = Math.PI / 2;
  const cable = add(g, tube([V(2.4, p.userData.top + 10.2, -3), V(2.2, p.userData.top + 9.8, -1), V(1.4, p.userData.top + 9.6, -0.4)], 0.12, M.dark, false, 30));
  UPD.push((t) => { dev.rotation.y = -0.45 + Math.sin(t * 0.5) * 0.25; });
  return { g, dev, probes, box2, p };
}

/* ---------- 14 · PARTNERS ---------- */
function buildPartners(x0) {
  const g = new THREE.Group(); g.position.x = x0; scene.add(g);
  const tiers = [
    ['Công nghệ & Truy xuất', ['GS1', 'PSST', 'HL&HT', 'REAP', 'Tmtech', 'ACC']],
    ['Giáo dục & Tuyển sinh', ['ITEP', 'Viet Anh', 'KCL', 'DAKO', 'DTSHIP']],
    ['Du lịch & Khác', ['Hanoi Tourism', 'HFCV', 'SUN Studio']],
  ];
  const tiles = [];
  tiers.forEach(([name, list], r) => {
    const z = -8 + r * 7.5, y = 3.6 - r * 1.4, W0 = list.length * 5.4 + 1.2;
    add(g, at(rbox(W0, 0.7, 5.6, 0.3, M.glass), 0, y - 0.35, z));
    add(g, at(rbox(W0 - 0.4, 0.2, 5.2, 0.1, M.white), 0, y - 0.8, z));
    add(g, neonRing(W0, 5.6, 0.3, y - 0.3, 0.05));
    const lt = canvasTex(640, 110, (c, w, h) => { c.fillStyle = '#0A2B1C'; rr(c, 0, 0, w, h, 55); c.fill(); drawText(c, name, w / 2, h / 2 + 3, 44, 700, '#FFFFFF'); });
    const lp = textPlane(9.0, 1.55, lt); lp.position.set(-W0 / 2 - 5.4, y + 0.6, z + 0.6); lp.rotation.x = -0.9; g.add(lp);
    list.forEach((nm, i) => {
      const tg = new THREE.Group(); tg.position.set(-W0 / 2 + 3.3 + i * 5.4, y, z); g.add(tg);
      add(tg, at(rbox(4.6, 1.0, 3.6, 0.3, M.white), 0, 0.5, 0));
      add(tg, at(new THREE.Mesh(new THREE.BoxGeometry(4.2, 0.06, 0.06), M.neon), 0, 0.12, 1.82));
      const tt = canvasTex(460, 360, (c, w, h) => { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); const parts = nm.split(' '); drawText(c, parts[0], w / 2, parts.length > 1 ? 150 : 185, nm.length > 6 ? 84 : 100, 800, '#0B7A47'); if (parts.length > 1) drawText(c, parts.slice(1).join(' '), w / 2, 250, 52, 700, '#44574B'); });
      const tp = textPlane(4.2, 3.2, tt, false); tp.rotation.x = -Math.PI / 2; tp.position.y = 1.02; tg.add(tp);
      tiles.push(tg);
    });
  });
  blob(g, 50, 40);
  return { g, tiles };
}

/* ================= TIMELINE ================= */
function build() {
  const hero = buildHero(X.hero), docs = buildDocs(X.docs), pil = buildPillars(X.pil), city = buildCity(X.city),
    st = buildStairs(X.stairs), capS = buildCap(X.cap), shd = buildShield(X.shield), qr = buildQR(X.qr), gs = buildGS1(X.gs1),
    phn = buildPhone(X.phone), mp = buildMap(X.map), bld = buildBuilding(X.bld), farm = buildFarm(X.farm), sen = buildSensor(X.sensor),
    part = buildPartners(X.part), end = buildHero(X.end, false);

  let t = 0;
  /* --- 0 · HERO --- */
  C.x = 0; C.y = 62; C.z = 46; C.tx = 0; C.ty = 0; C.tz = 0; C.fov = 40; Object.assign(last, C);
  master.fromTo('#black', { opacity: 1 }, { opacity: 0, duration: 1.6, ease: 'power1.inOut' }, 0.2);
  cam(0, 5.2, P(0, 24, 40, 0, 2.0, 0, 0, 175, 38), 'power3.inOut');
  cam(5.2, 4.2, P(5, 22, 38, 0, 2.2, 0, 0, 180, 37), 'sine.inOut');
  growTube(hero.ring, 0.6, 2.0); growTube(hero.inner, 1.0, 1.8);
  growTube(hero.trace, 1.6, 1.8); growTube(hero.frame, 1.4, 1.6);
  hero.nodes.forEach((n, i) => popIn(n, 1.2 + i * 0.1, 0.6));
  riseIn(hero.tile, 1.8, 1.4, -3); riseIn(hero.logo, 1.8, 1.4, -3);
  popIn(hero.logo, 2.2, 1.0, 0.2);
  riseIn(hero.rib1, 0.2, 2.5, -10); riseIn(hero.rib2, 0.4, 2.5, -12);
  cue(1.8, 'hit'); cue(0.2, 'riser');
  ovIn('#o0', 3.0);
  t = 9.4; ovOut('#o0', t - 0.6);
  cue(3.0, 'downbeat');

  /* --- 1 · PLAQUES --- */
  fly(t, 1.8, P(X.docs + 9, 7.5, 34, X.docs, 3.9, 0, 390, 20, 36));
  docs.plaques.forEach((p, i) => riseIn(p, t + 1.3 + i * 0.25, 1.2, -9));
  cam(t + 1.8, 7.4, P(X.docs + 4, 7, 31, X.docs, 3.9, 0, 390, 20, 36), 'sine.inOut');
  ovIn('#o1', t + 1.7);
  master.fromTo('#bug', { autoAlpha: 0, y: -20 }, { autoAlpha: 1, y: 0, duration: 0.6 }, t + 2);
  cue(t + 1.3, 'swish');
  t += 9.2; ovOut('#o1', t - 0.5);

  /* --- 2 · PILLARS (quỹ đạo) --- */
  fly(t, 1.8, P(X.pil - 33, 36, 39, X.pil, 1, 0, 0, -110, 38));
  pil.sats.forEach((s, i) => { riseIn(s, t + 1.0 + i * 0.22, 1.0, -6); });
  growTube(pil.ringN, t + 1.2, 2.2);
  const ptxt = [['01', 'Nghiên cứu &amp; Dự án', 'Tư vấn, chuyển giao ứng dụng KH&amp;CN'], ['02', 'Đào tạo &amp; Chứng chỉ', 'Nhân lực &amp; huấn luyện an toàn lao động'], ['03', 'Truy xuất nguồn gốc', 'Chuẩn GS1, minh bạch chuỗi cung ứng'], ['04', 'Chuyển đổi số', 'Kiến trúc IoT &amp; giải pháp doanh nghiệp']];
  pil.sats.forEach((s, i) => label(`<em>TRỤ CỘT ${ptxt[i][0]}</em><b>${ptxt[i][1]}</b><span>${ptxt[i][2]}</span>`, V(X.pil + s.position.x, 8.2, s.position.z), t + 2.4 + i * 0.35, t + 11.2));
  const oc = (a, r = 51, h = 36) => P(X.pil + Math.sin(a) * r, h, Math.cos(a) * r, X.pil, 1.5, 0, 0, -110, 38);
  for (let k = 0; k < 6; k++) cam(t + 1.8 + k * 1.6, 1.6, oc(-0.7 + (k + 1) * 0.23), k === 0 ? 'sine.in' : k === 5 ? 'sine.out' : 'none');
  ovIn('#o2', t + 1.9);
  cue(t + 2.4, 'tick'); cue(t + 2.75, 'tick'); cue(t + 3.1, 'tick'); cue(t + 3.45, 'tick');
  t += 11.8; ovOut('#o2', t - 0.6);

  /* --- 3 · CITY --- */
  fly(t, 1.8, P(X.city + 26, 30, 30, X.city + 1, 2, 0, 430, 0, 38));
  const cityT = t + 1.4;
  const m4 = new THREE.Matrix4();
  UPD.push((tt) => {
    city.lots.forEach((l, i) => { const k = easeBack((tt - cityT - l.d) / 0.9); const h = Math.max(0.001, l.h * k); m4.makeScale(1, h, 1); m4.setPosition(l.x, 1.5 + h / 2, l.z); city.bm.setMatrixAt(i, m4); });
    city.bm.instanceMatrix.needsUpdate = true;
    city.turbines.forEach((h, i) => { h.rotation.z = tt * 1.5 + i; });
  });
  city.lines.forEach((l, i) => growTube(l, cityT + 1.6 + i * 0.3, 2.0));
  cam(t + 1.8, 7.8, P(X.city + 22, 22, 26, X.city + 1, 2.5, 0, 430, 0, 38), 'sine.inOut');
  ovIn('#o3', t + 1.7);
  cue(cityT, 'swish');
  t += 9.6; ovOut('#o3', t - 0.5);

  /* --- 4 · STAIRS --- */
  fly(t, 1.8, P(X.stairs - 6, 19, 42, X.stairs - 1, 3.5, -1, 0, 110, 38));
  st.plats.forEach((p, i) => riseIn(p, t + 1.2 + i * 0.4, 0.9, -8));
  st.links.forEach((l, i) => growTube(l, t + 2.0 + i * 0.5, 0.6));
  const sl = [['1', 'Khảo sát &amp; đánh giá', 'Cùng Sở ban ngành nhận diện bài toán thực tiễn'], ['2', 'Nghiên cứu chuyên sâu', 'Phân tích, cung cấp dữ liệu thực chứng'], ['3', 'Công bố cấp cao', 'Tạp chí chuyên ngành uy tín trong &amp; ngoài nước'], ['4', 'Chuyển giao ứng dụng', 'Thành giải pháp quản lý &amp; công nghệ trực tiếp']];
  st.pos.forEach((p, i) => label(`<em>BƯỚC ${sl[i][0]}</em><b>${sl[i][1]}</b><span>${sl[i][2]}</span>`, V(X.stairs + p[0], p[1] + 6.8, p[2]), t + 1.9 + i * 0.45, t + 8.6));
  cam(t + 1.8, 7.0, P(X.stairs + 5, 18, 41, X.stairs + 1.5, 4, -2, 0, 110, 38), 'sine.inOut');
  ovIn('#o4', t + 1.8);
  for (let i = 0; i < 4; i++) cue(t + 1.9 + i * 0.45, 'tick');
  t += 9.0; ovOut('#o4', t - 0.5);

  /* --- 5 · CAP --- */
  fly(t, 1.8, P(X.cap + 20, 12, 31, X.cap, 6.2, 0, 430, 0, 38));
  popIn(capS.cap, t + 1.3, 1.2, 0.2);
  capS.traces.forEach((tr, i) => growTube(tr, t + 1.4 + i * 0.1, 1.0));
  master.fromTo(M.beam, { opacity: 0 }, { opacity: 0.16, duration: 1.2 }, t + 1.6);
  cam(t + 1.8, 7.6, P(X.cap + 15, 10.5, 29, X.cap, 6.2, 0, 430, 0, 37), 'sine.inOut');
  ovIn('#o5', t + 1.7);
  cue(t + 1.3, 'hit');
  t += 9.4; ovOut('#o5', t - 0.5);

  /* --- 6 · SHIELD --- */
  fly(t, 1.8, P(X.shield - 14, 9.5, 28, X.shield - 0.5, 6.6, 0, -430, 0, 38));
  const [pt, pm, pb] = shd.parts;
  const sT = t + 1.4;
  UPD.push((tt) => {
    const a = ease3((tt - sT) / 0.9), b = ease3((tt - sT - 0.25) / 0.9), c = ease3((tt - sT - 0.5) / 0.9);
    pt.position.y = 7 * (1 - a); pt.rotation.x = -1.2 * (1 - a);
    pm.position.x = -10 * (1 - b); pm.rotation.y = 1.3 * (1 - b);
    pb.position.y = -7 * (1 - c); pb.rotation.x = 1.2 * (1 - c);
    shd.parts.forEach((p, i) => { p.visible = tt > sT + i * 0.25 - 0.01; });
  });
  growTube(shd.ck, sT + 1.5, 0.6);
  cam(t + 1.8, 7.4, P(X.shield - 10.5, 9, 26, X.shield - 0.5, 6.6, 0, -430, 0, 37), 'sine.inOut');
  ovIn('#o6', t + 1.8);
  cue(sT, 'swish'); cue(sT + 1.5, 'ding');
  t += 9.2; ovOut('#o6', t - 0.5);

  /* --- 7 · QR --- */
  fly(t, 1.8, P(X.qr + 19, 16, 29, X.qr, 7.2, 0, 430, 0, 38));
  const { cells, n, s } = qr.vox.userData, R = rng(5), qT = t + 1.5;
  const qd = cells.map(() => [R() * 1.3, (R() - 0.5) * 16, 6 + R() * 10, (R() - 0.5) * 16]);
  UPD.push((tt) => {
    cells.forEach(([x, y], i) => {
      const d = qd[i], k = ease3((tt - qT - d[0]) / 0.9), sc = Math.max(0.001, k);
      m4.makeScale(sc, sc, sc); m4.setPosition((x - n / 2 + 0.5) * s + d[1] * (1 - k), d[2] * (1 - k), (y - n / 2 + 0.5) * s + d[3] * (1 - k));
      qr.vox.setMatrixAt(i, m4);
    });
    qr.vox.instanceMatrix.needsUpdate = true;
    qr.qg.rotation.z = Math.sin(tt * 0.6) * 0.05;
  });
  riseIn(qr.crate, t + 1.2, 1.0, -5);
  cam(t + 1.8, 7.6, P(X.qr + 15, 14.5, 27, X.qr, 7.2, 0, 430, 0, 37), 'sine.inOut');
  ovIn('#o7', t + 1.8);
  cue(qT, 'swish'); cue(qT + 1.8, 'scan');
  t += 9.4; ovOut('#o7', t - 0.5);

  /* --- 8 · GS1 --- */
  fly(t, 1.8, P(X.gs1 - 5, 16, 35, X.gs1, 2.2, 0, 0, -110, 38));
  [gs.pa, gs.hub, gs.pc].forEach((o, i) => riseIn(o, t + 1.1 + i * 0.35, 1.0, -8));
  gs.tubes.forEach((tb, i) => growTube(tb, t + 1.9 + i * 0.4, 0.8));
  const gl = [['01', 'Khởi tạo dữ liệu', 'Hồ sơ điện tử cho từng lô sản phẩm'], ['02', 'Đồng bộ hệ thống', 'HLHT TRACE theo chuẩn GS1'], ['03', 'Tiếp cận thị trường', 'Đủ điều kiện xuất khẩu, tăng niềm tin']];
  [-17, 0, 17].forEach((x, i) => label(`<em>BƯỚC ${gl[i][0]}</em><b>${gl[i][1]}</b><span>${gl[i][2]}</span>`, V(X.gs1 + x, i === 1 ? 7.8 : 5.8, 0), t + 2.0 + i * 0.4, t + 9.2));
  cam(t + 1.8, 7.6, P(X.gs1 + 5, 15, 34, X.gs1, 2.2, 0, 0, -110, 38), 'sine.inOut');
  ovIn('#o8', t + 1.8);
  for (let i = 0; i < 3; i++) cue(t + 2.0 + i * 0.4, 'tick');
  t += 9.6; ovOut('#o8', t - 0.5);

  /* --- 9 · PHONE + trích dẫn --- */
  fly(t, 1.8, P(X.phone + 12, 10, 20, X.phone + 0.5, 7.5, 0, 430, 0, 38));
  popIn(phn.ph, t + 1.0, 1.0, 0.3);
  const vTex = screenTex(true), sTex = phn.scrMat.map, pT = t;
  UPD.push((tt) => { phn.scrMat.map = tt > pT + 3.8 ? vTex : sTex; phn.badge.visible = tt > pT + 4.1; phn.jar.visible = tt > pT + 4.5; });
  UPD.push((tt) => { const k = (tt - (t + 2.2)) / 1.4; phn.laser.visible = k > 0 && k < 1; phn.laser.position.y = 2.2 - 3 * Math.abs(Math.sin(k * Math.PI)); });
  popIn(phn.badge, t + 4.1, 0.6, 0.2);
  popIn(phn.jar, t + 4.5, 0.7, 0.2);
  cue(t + 2.2, 'scan'); cue(t + 4.1, 'ding');
  cam(t + 1.8, 7.8, P(X.phone + 8, 8.5, 18, X.phone + 0.5, 7.8, 0, 430, 0, 37), 'sine.inOut');
  ovIn('#o9', t + 1.8);
  t += 9.6; ovOut('#o9', t - 0.5);
  cue(t, 'sec_tension');
  cam(t, 6.6, P(X.phone + 3, 11, 26, X.phone, 7.8, 0, 0, 0, 36), 'sine.inOut');
  ovIn('#o10', t);
  master.fromTo('#o10', { opacity: 0 }, { opacity: 1, duration: 0.9, ease: 'none' }, t);
  t += 6.8; ovOut('#o10', t - 0.6);

  /* --- 10 · MAP --- */
  cue(t, 'sec_main');
  fly(t, 1.8, P(X.map + 16, 26, 24, X.map + 0.5, 3, 0, 430, 0, 38));
  const mT = t + 1.6;
  mp.pins.forEach((p, i) => { popIn(p.pg, mT + 0.4 + i * 0.35, 0.7, 0.01); });
  mp.links.forEach((l, i) => growTube(l, mT + 0.2 + i * 0.35, 0.8));
  popIn(mp.tag, mT, 0.7, 0.2);
  UPD.push((tt) => {
    const red = tt > mT + 2.2;
    mp.pins.forEach((p, i) => { p.head.material = red ? M.neonRed : M.neon; p.beam.material = red ? M.beamRed : M.beam; p.rings.forEach((r, j) => { const k = ((tt * 0.8 + j * 0.5 + i * 0.2) % 1); r.scale.setScalar(0.5 + k * 3.5); r.material = red ? M.neonRed : M.neon; }); });
    mp.links.forEach((l) => { l.material = red ? M.neonRed : M.neon; });
    mp.tag.quaternion.copy(camera.quaternion);
  });
  for (let i = 0; i < 3; i++) cue(mT + 0.4 + i * 0.35, 'notif');
  cue(mT + 2.2, 'stamp');
  cam(t + 1.8, 7.6, P(X.map + 12, 22, 22, X.map + 0.5, 3, 0, 430, 0, 38), 'sine.inOut');
  ovIn('#o11', t + 1.8);
  master.set('#o11 .alert', { autoAlpha: 0 }, t);
  master.fromTo('#o11 .alert', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2.2)' }, mT + 2.3);
  t += 9.4; ovOut('#o11', t - 0.5);

  /* --- 11 · BUILDING --- */
  fly(t, 1.8, P(X.bld + 21, 12, 31, X.bld + 1, 5, 0, 430, 0, 38));
  bld.floors.forEach((f, i) => riseIn(f, t + 1.1 + i * 0.35, 0.9, 10));
  bld.vl.forEach((v, i) => growTube(v, t + 2.4 + i * 0.3, 1.6));
  cam(t + 1.8, 7.6, P(X.bld + 16, 11, 30, X.bld + 1, 5.2, 0, 430, 0, 38), 'sine.inOut');
  ovIn('#o12', t + 1.8);
  cue(t + 1.1, 'swish');
  t += 9.4; ovOut('#o12', t - 0.5);

  /* --- 12 · FARM --- */
  fly(t, 2.0, P(X.farm + 26, 26, 38, X.farm + 2, 5, 0, 430, 0, 38));
  farm.sensors.forEach((s, i) => popIn(s, t + 1.6 + i * 0.12, 0.6));
  farm.lines.forEach((l, i) => growTube(l, t + 2.2 + i * 0.1, 1.0));
  popIn(farm.cloud, t + 2.0, 0.9, 0.2); popIn(farm.srv, t + 2.2, 0.9, 0.2);
  farm.cards.forEach((c, i) => popIn(c, t + 3.0 + i * 0.3, 0.6, 0.2));
  cam(t + 2.0, 7.0, P(X.farm + 22, 22, 34, X.farm + 2, 5, 0, 430, 0, 38), 'sine.inOut');
  ovIn('#o13', t + 2.0);
  cue(t + 2.0, 'swish');
  const t2 = t + 9.0; ovOut('#o13', t2 - 0.5);
  cam(t2, 1.6, P(X.farm - 3, 24, 52, X.farm - 1, 8, 0, 0, 20, 38), 'power2.inOut');
  const al = [['1', 'Trạm cảm biến', 'Thu thập dữ liệu tại nguồn', V(4, 6.6, 1)], ['2', 'Mạng LoRaWAN', 'Tầm xa 3–15 km về Gateway', V(-14, 14.2, 8.5)], ['3', 'Kết nối Network', 'WiFi / 4G / 5G / TCP-IP', V(-6, 5.6, 10.5)], ['4', 'Lưu trữ &amp; điều khiển', 'BOM Server Cloud · Web/App 24/7', V(11, 17.2, -2)]];
  al.forEach(([k, b, s2, v], i) => label(`<em>${k}</em><b>${b}</b><span>${s2}</span>`, v.add(V(X.farm, 0, 0)), t2 + 1.2 + i * 0.5, t2 + 7.6, 'dk'));
  cam(t2 + 1.6, 6.2, P(X.farm + 3, 23, 50, X.farm, 8, 0, 0, 20, 38), 'sine.inOut');
  for (let i = 0; i < 4; i++) cue(t2 + 1.2 + i * 0.5, 'tick');
  t = t2 + 8.0;

  /* --- 13 · SENSOR --- */
  fly(t, 1.8, P(X.sensor - 16, 12, 28, X.sensor, 7.2, 0, -430, 0, 38));
  const sT2 = t + 1.2;
  UPD.push((tt) => { const k = ease3((tt - sT2) / 1.4); sen.dev.position.y = sen.p.userData.top + 9 + (1 - k) * 8; });
  popIn(sen.box2, t + 1.8, 0.8, 0.2);
  cam(t + 1.8, 7.8, P(X.sensor - 12, 11, 26, X.sensor, 7.2, 0, -430, 0, 37), 'sine.inOut');
  ovIn('#o14', t + 1.8);
  master.set('#o14 .sms', { autoAlpha: 0 }, t);
  master.fromTo('#o14 .sms', { scale: 0.7, autoAlpha: 0 }, { scale: 1, autoAlpha: 1, duration: 0.6, ease: 'back.out(2.2)' }, t + 4.2);
  cue(sT2 + 1.2, 'hit'); cue(t + 4.2, 'notif');
  t += 9.6; ovOut('#o14', t - 0.5);

  /* --- 14 · PARTNERS --- */
  cue(t, 'sec_soft');
  fly(t, 1.8, P(X.part - 3.5, 26, 31, X.part - 3.5, 0, -1, 0, -90, 40));
  part.tiles.forEach((tl, i) => riseIn(tl, t + 1.3 + i * 0.1, 0.7, -3));
  for (let i = 0; i < 14; i += 3) cue(t + 1.3 + i * 0.1, 'tick');
  cam(t + 1.8, 6.6, P(X.part - 1.5, 24, 29, X.part - 3, 0, -1, 0, -90, 40), 'sine.inOut');
  ovIn('#o15', t + 1.8);
  t += 8.4; ovOut('#o15', t - 0.5);

  /* --- 15 · END --- */
  cue(t, 'sec_end');
  fly(t, 2.0, P(X.end + 3, 27, 50, X.end, 2.0, 0, 400, 230, 38));
  growTube(end.ring, t + 1.0, 1.2); growTube(end.inner, t + 1.2, 1.2); growTube(end.trace, t + 1.4, 1.2); growTube(end.frame, t + 1.4, 1.2);
  master.to('#bug', { autoAlpha: 0, duration: 0.4 }, t);
  cam(t + 2.0, 9.0, P(X.end - 4, 26, 48, X.end, 2.2, 0, 400, 230, 38), 'sine.inOut');
  ovIn('#o16', t + 2.0);
  cue(t + 2.0, 'hit');
  t += 11.0;
  master.fromTo('#black', { opacity: 0 }, { opacity: 1, duration: 1.0, ease: 'power1.in' }, t - 1.0);

  // chỉ hiển thị trạm đang ở gần máy quay để tiết kiệm thời gian render
  const groups = [hero, docs, pil, city, st, capS, shd, qr, gs, phn, mp, bld, farm, sen, part, end].map((o) => o.g);
  UPD.push(() => { groups.forEach((gr) => { gr.visible = Math.abs(gr.position.x - C.tx) < 50; }); });
  master.set({}, {}, t);
  return t;
}

/* ================= FRAME ================= */
const vtmp = new THREE.Vector3();
function frame(t) {
  master.seek(t, false);
  applyCam();
  sun.position.set(C.tx + 26, 58, C.tz + 30); sun.target.position.set(C.tx, 0, C.tz); sun.target.updateMatrixWorld();
  camera.updateMatrixWorld();
  UPD.forEach((f) => f(t));
  LBL.forEach(({ d, pos }) => {
    vtmp.copy(pos).project(camera);
    d.style.left = `${((vtmp.x + 1) / 2) * W}px`;
    d.style.top = `${((1 - vtmp.y) / 2) * H}px`;
  });
  composer.render();
}

async function loadIcons() {
  const els = $$('.ic[data-i]');
  const names = [...new Set(els.map((e) => e.dataset.i))];
  const map = {};
  await Promise.all(names.map(async (n) => { const r = await fetch(`../node_modules/lucide-static/icons/${n}.svg`); if (!r.ok) throw new Error('missing icon ' + n); map[n] = await r.text(); }));
  els.forEach((e) => { e.innerHTML = map[e.dataset.i]; });
}

(async () => {
  await loadIcons();
  window.__qr = await (await fetch('../qr_matrix.json')).json();
  await Promise.all(['500', '600', '700', '800'].map((w) => document.fonts.load(`${w} 40px "Be Vietnam Pro"`)));
  await document.fonts.ready;
  await Promise.all([loadImg('logo', '../assets/logo_stp.png'), loadImg('hlht', '../assets/hlht_logo.png'), loadImg('jar', '../assets/jar.jpg'), loadImg('map', '../assets/vn_map.jpg')]);
  await Promise.all($$('img').map((i) => i.decode().catch(() => {})));
  const dur = build();
  scene.traverse((o) => {
    if (!o.isMesh) return;
    const mt = o.material, basic = mt && (mt.isMeshBasicMaterial || mt.transparent);
    o.castShadow = !basic && o !== floor;
    o.receiveShadow = !basic;
  });
  frame(0);
  window.__duration = dur;
  window.__marks = MARKS.sort((a, b) => a.t - b.t);
  window.__seek = (t) => frame(t);
  const gl = renderer.getContext(), px = new Uint8Array(4);
  window.__bench = (t) => { const a = performance.now(); frame(t); gl.readPixels(0, 0, 1, 1, gl.RGBA, gl.UNSIGNED_BYTE, px); return performance.now() - a; };
  window.__ready = true;
  const m = location.search.match(/t=([\d.]+)/);
  if (m) frame(parseFloat(m[1]));
})().catch((e) => { console.error(e); window.__error = String(e && e.stack || e); });
