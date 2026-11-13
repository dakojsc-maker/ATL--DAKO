/* Văn phòng 3D DAKO – 2 trưởng phòng, 5 nhân viên (three.js r128). */
const Office = (() => {
  const FLOOR = 0.24, POD_W = 7, POD_D = 7, POD_Z = 4, BOSS_Z = -8;
  const AZ = 11 * Math.PI / 180, EL = 41 * Math.PI / 180;
  const camDir = new THREE.Vector3(Math.cos(EL) * Math.sin(AZ), Math.sin(EL), Math.cos(EL) * Math.cos(AZ));
  const PAL = {
    sang: {
      clear: 0xE8EEF7, hemi: [0xffffff, 0xaebcd6, 0.9], sun: 0.72, shadows: true, glass: 0.2, edges: false,
      m: { ground: 0xD9E2EF, floor: 0xEAF0F8, dais: 0xEFE6CF, pod: 0xFFFFFF, podEdge: 0x0B3F9E, wall: 0xFFFFFF, trim: 0x0B3F9E,
        desk: 0xFFFFFF, leg: 0x9AA8C2, chair: 0x0B3F9E, body: 0x0B3F9E, boss: 0x0A2F78, collar: 0xF0A81C, skin: 0xF2D5BF,
        hair: 0x1E2433, screen: 0xBFD6F8, monBack: 0x24324F, plant: 0x36B074, pot: 0xFFFFFF, paper: 0xFFFFFF,
        cabinet: 0xE3E9F3, glass: 0x8DB9F2, line: 0xF0A81C, packet: 0xF0A81C, hot: 0xFFB800, metal: 0x6E7D99, sofa: 0x274B8F, ring: 0xF0A81C },
      em: { screen: 0x000000, line: 0x000000, packet: 0x000000, hot: 0x3a2a00, ring: 0x4a3000 },
      board: { bg: '#0B3F9E', text: '#FFFFFF', slug: '#F7C35A', bar: '#F0A81C', num: '#F0A81C', numText: '#0B2050', back: 0x082C70 }
    },
    dem: {
      clear: 0x050F26, hemi: [0x8fb0ff, 0x0b1630, 0.55], sun: 0.42, shadows: true, glass: 0.16, edges: false,
      m: { ground: 0x081A3E, floor: 0x0B1F48, dais: 0x1B3A70, pod: 0x12306A, podEdge: 0xF5B532, wall: 0x173669, trim: 0xF5B532,
        desk: 0x1E3F7C, leg: 0x2C4C8A, chair: 0x24498F, body: 0x2C65CF, boss: 0x16408F, collar: 0xF5B532, skin: 0xE6C6AE,
        hair: 0x0A1022, screen: 0xFFD27A, monBack: 0x0E2350, plant: 0x2A9C66, pot: 0x1E3F7C, paper: 0xDCE6F5,
        cabinet: 0x1A3670, glass: 0x3D7BE0, line: 0xF5B532, packet: 0xF5B532, hot: 0xFFD27A, metal: 0x50689A, sofa: 0x1D3D78, ring: 0xF5B532 },
      em: { screen: 0x7a5410, line: 0x5a3d06, packet: 0x6b4a08, hot: 0x8a6510, ring: 0x8a6510 },
      board: { bg: '#04112E', text: '#FFFFFF', slug: '#F5B532', bar: '#F5B532', num: '#F5B532', numText: '#04112E', back: 0x04112E }
    },
    banve: {
      clear: 0x0C3B8C, hemi: [0xffffff, 0x9fb9e6, 1.0], sun: 0.25, shadows: false, glass: 0.12, edges: true,
      m: { ground: 0x0E4499, floor: 0x1350B2, dais: 0x1659C0, pod: 0x1452B5, podEdge: 0x1A5EC6, wall: 0x1B62CC, trim: 0xFFFFFF,
        desk: 0x1C64D0, leg: 0x2F75DC, chair: 0x2A6FD8, body: 0x2A6FD8, boss: 0x2A6FD8, collar: 0xFFFFFF, skin: 0x9FC2F5,
        hair: 0x6FA0EA, screen: 0xE9F1FF, monBack: 0x1C64D0, plant: 0x6FA0EA, pot: 0x1C64D0, paper: 0xFFFFFF,
        cabinet: 0x1C64D0, glass: 0x9FC2F5, line: 0xFFFFFF, packet: 0xFFFFFF, hot: 0xFFFFFF, metal: 0x6FA0EA, sofa: 0x1C64D0, ring: 0xFFFFFF },
      em: { screen: 0x203a60, line: 0x444444, packet: 0x333333, hot: 0x555555, ring: 0x555555 },
      board: { bg: '#0A3478', text: '#FFFFFF', slug: '#CFE0FF', bar: '#FFFFFF', num: '#FFFFFF', numText: '#0A3478', back: 0x0A3478 }
    }
  };

  let renderer, scene, camera, hemi, sun, root, stageEl, canvas, theme = 'sang', ready = false;
  const target = new THREE.Vector3(0, 1, 0), targetGoal = target.clone();
  let zoom = 1, zoomGoal = 1, fitZoom = 1, padRight = 0, dirty = true;
  const mats = {}, pickables = [], people = {}, boards = [], edgeObjs = [], lanes = {}, flights = [], packets = [];
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frameCb = null, pickCb = null, hoverCb = null, hiId = null, logoTex = null, xs = [];
  const podIndex = {};
  const mat = (k, extra) => mats[k] || (mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: 0xffffff }, extra || {})));
  const V = (x, z) => new THREE.Vector3(x, 0, z);

  function box(w, h, d, m, x, y, z, parent, shadow = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x || 0, y || 0, z || 0); mesh.castShadow = shadow; mesh.receiveShadow = true;
    (parent || root).add(mesh); return mesh;
  }
  function cyl(rt, rb, h, m, x, y, z, parent, seg = 20) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    mesh.position.set(x || 0, y || 0, z || 0); mesh.castShadow = true; mesh.receiveShadow = true;
    (parent || root).add(mesh); return mesh;
  }
  const tag = (mesh, data) => { mesh.userData = Object.assign(mesh.userData || {}, data); pickables.push(mesh); return mesh; };

  /* ---------- Biển tên ---------- */
  function drawBoard(b) {
    const P = PAL[theme].board, c = b.canvas, x = c.getContext('2d'), w = c.width, h = c.height;
    x.fillStyle = P.bg; x.fillRect(0, 0, w, h);
    let left = 40;
    if (b.num != null) {
      x.fillStyle = P.num; x.beginPath(); x.arc(110, h / 2 - 8, 74, 0, Math.PI * 2); x.fill();
      x.fillStyle = P.numText; x.font = '110px Anton, Impact, sans-serif'; x.textAlign = 'center'; x.textBaseline = 'middle';
      x.fillText(String(b.num), 110, h / 2 - 2); x.textAlign = 'left'; left = 210;
    }
    x.textBaseline = 'alphabetic';
    x.fillStyle = P.slug; x.font = '500 30px "JetBrains Mono", ui-monospace, monospace'; x.fillText(b.slug, left, 58);
    let size = 104; const title = b.title.toUpperCase();
    do { x.font = size + 'px Anton, "Arial Narrow", Impact, sans-serif'; size -= 4; } while (x.measureText(title).width > w - left - 40 && size > 36);
    x.fillStyle = P.text; x.fillText(title, left, 170);
    x.fillStyle = P.bar; x.fillRect(left, 202, w - left - 40, 14);
    b.tex.needsUpdate = true; dirty = true;
  }
  function makeBoard(spec, width, x, y, z, parent) {
    const c = document.createElement('canvas'); c.width = 1024; c.height = 248;
    const tex = new THREE.CanvasTexture(c); tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const h = width * 248 / 1024, face = new THREE.MeshBasicMaterial({ map: tex }), back = mat('boardBack');
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, h, 0.16), [back, back, back, back, face, back]);
    mesh.position.set(x, y + h / 2, z); mesh.castShadow = true; parent.add(mesh);
    box(0.12, y, 0.12, mat('metal'), x - width * 0.38, y / 2, z, parent);
    box(0.12, y, 0.12, mat('metal'), x + width * 0.38, y / 2, z, parent);
    const b = Object.assign({ canvas: c, tex, mesh }, spec); boards.push(b);
    if (spec.pick) tag(mesh, spec.pick);
    return { mesh, top: y + h };
  }

  /* ---------- Người ---------- */
  function person(id, x, z, parent, opt = {}) {
    const g = new THREE.Group(); g.position.set(x, opt.y || FLOOR, z); parent.add(g);
    const dw = opt.desk || 2.1;
    if (!opt.noDesk) {
      tag(box(dw, 0.1, 0.95, mat('desk'), 0, 0.98, 0.62, g), { person: id });
      box(0.08, 0.93, 0.9, mat('leg'), -dw / 2 + 0.06, 0.5, 0.62, g); box(0.08, 0.93, 0.9, mat('leg'), dw / 2 - 0.06, 0.5, 0.62, g);
      box(dw - 0.1, 0.62, 0.05, mat('leg'), 0, 0.62, 1.06, g);
      const mon = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.58, 0.06), [mat('monBack'), mat('monBack'), mat('monBack'), mat('monBack'), mat('monBack'), mat('screen')]);
      mon.position.set(opt.monX || 0, 1.42, 0.8); mon.castShadow = true; g.add(mon); tag(mon, { person: id });
      box(0.08, 0.32, 0.08, mat('monBack'), opt.monX || 0, 1.17, 0.82, g);
      box(0.55, 0.03, 0.2, mat('paper'), 0.55, 1.045, 0.48, g, false);
    }
    box(0.85, 0.12, 0.78, mat('chair'), 0, 0.62, -0.08, g); box(0.85, 0.95, 0.1, mat('chair'), 0, 1.12, -0.5, g);
    const f = new THREE.Group(); f.position.set(0, 0.68, -0.05); g.add(f);
    const body = cyl(0.3, 0.38, 0.92, mat(opt.boss ? 'boss' : 'body'), 0, 0.46, 0, f);
    cyl(0.31, 0.31, 0.08, mat('collar'), 0, 0.9, 0, f);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.29, 20, 16), mat('skin')); head.position.set(0, 1.24, 0); head.castShadow = true; f.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.305, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), mat('hair'));
    hair.position.set(0, 1.27, -0.02); hair.rotation.x = -0.28; f.add(hair);
    if (opt.longHair) { const h2 = cyl(0.27, 0.31, 0.5, mat('hair'), 0, 1.02, -0.12, f); h2.rotation.x = 0.12; }
    if (opt.tie) box(0.08, 0.36, 0.03, mat('collar'), 0, 0.68, 0.36, f, false);
    else box(0.13, 0.13, 0.03, mat('collar'), 0.15, 0.62, 0.335, f, false);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), mats.stIdle); light.position.set(0, 2.32, -0.05); g.add(light);
    const ring = new THREE.Mesh(new THREE.TorusGeometry(0.85, 0.07, 8, 40), mat('ring')); ring.rotation.x = Math.PI / 2; ring.position.set(0, 0.06, 0.1); ring.visible = false; g.add(ring);
    [body, head, hair].forEach(m => tag(m, { person: id }));
    people[id] = { g, f, light, ring, phase: Math.random() * 6, flash: 0, anchor: () => new THREE.Vector3().setFromMatrixPosition(light.matrixWorld) };
  }
  function plant(x, z, s = 1, parent) {
    cyl(0.32 * s, 0.24 * s, 0.5 * s, mat('pot'), x, FLOOR + 0.25 * s, z, parent);
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 * s, 0), mat('plant')); p.position.set(x, FLOOR + 0.95 * s, z); p.castShadow = true; (parent || root).add(p);
  }

  /* ---------- Bố cục ---------- */
  function build(data) {
    const n = data.nhan_vien.length, gap = POD_W + 1.2;
    xs = data.nhan_vien.map((_, i) => (i - (n - 1) / 2) * gap);
    const halfW = Math.max(18, (xs[n - 1] || 0) + POD_W / 2 + 3);
    box(halfW * 2 + 6, 0.2, 34, mat('ground'), 0, -0.1, -1, root, false);
    box(halfW * 2, FLOOR, 28, mat('floor'), 0, FLOOR / 2 - 0.02, -1, root, false);
    // Tường sau + logo
    box(halfW * 2, 2.6, 0.25, mat('wall'), 0, 1.3, -15, root);
    box(halfW * 2, 0.1, 0.3, mat('trim'), 0, 2.62, -15, root, false);
    const lg = new THREE.Mesh(new THREE.BoxGeometry(3.2, 3.2, 0.14), [mat('wall'), mat('wall'), mat('wall'), mat('wall'), mats.logo, mat('wall')]);
    lg.position.set(-9.5, 2.1, -14.7); lg.castShadow = true; root.add(lg);
    // Khu trưởng phòng
    const boss = new THREE.Group(); boss.position.set(0, 0, BOSS_Z); root.add(boss);
    box(15, 0.36, 7, mat('dais'), 0, 0.18, 0, boss, false);
    box(15, 2.6, 0.08, mat('glass'), 0, 1.6, -3.4, boss, false);
    box(15, 0.08, 0.14, mat('trim'), 0, 2.92, -3.4, boss, false);
    makeBoard({ slug: 'dako-truong-phong', title: 'Trưởng phòng', pick: { boss: true } }, 7.4, 3.6, 1.8, -3.0, boss);
    const bossY = 0.36;
    box(5.6, 0.12, 1.2, mat('desk'), 0, bossY + 1.0, 1.3, boss); box(5.5, 0.9, 0.08, mat('trim'), 0, bossY + 0.5, 1.88, boss);
    box(0.1, 0.95, 1.1, mat('leg'), -2.7, bossY + 0.48, 1.3, boss); box(0.1, 0.95, 1.1, mat('leg'), 2.7, bossY + 0.48, 1.3, boss);
    box(1.3, 0.06, 0.9, mat('paper'), 0, bossY + 1.09, 1.25, boss, false);
    data.truong_phong.forEach((tp, i) => person(tp.id, (i ? 1 : -1) * 1.55, 0.25, boss, { boss: true, noDesk: true, y: bossY, longHair: tp.id === 'nga', tie: tp.id !== 'nga' }));
    plant(-6.6, -2.4, 1, boss); plant(6.6, -2.4, 1, boss);
    box(2.4, 0.6, 0.9, mat('sofa'), -5, bossY + 0.3, 1.8, boss); box(2.4, 0.6, 0.22, mat('sofa'), -5, bossY + 0.7, 2.2, boss);
    // 5 bàn nhân viên
    data.nhan_vien.forEach((nv, i) => {
      podIndex[nv.id] = i;
      const g = new THREE.Group(); g.position.set(xs[i], 0, POD_Z); root.add(g);
      box(POD_W + 0.3, 0.2, POD_D + 0.3, mat('podEdge'), 0, 0.12, 0, g, false);
      tag(box(POD_W, FLOOR, POD_D, mat('pod'), 0, FLOOR / 2 + 0.02, 0, g, false), { person: nv.id });
      box(POD_W, 1.0, 0.18, mat('wall'), 0, FLOOR + 0.5, -POD_D / 2 + 0.1, g);
      box(POD_W, 0.08, 0.22, mat('trim'), 0, FLOOR + 1.04, -POD_D / 2 + 0.1, g, false);
      makeBoard({ num: nv.so, slug: nv.slug, title: nv.bien, pick: { person: nv.id } }, POD_W - 0.6, 0, 1.45, -POD_D / 2 - 0.2, g);
      person(nv.id, 0, -1.0, g);
      if (i === 0) { box(1.3, 0.85, 0.95, mat('cabinet'), 2.4, FLOOR + 0.42, 2.2, g); box(1.3, 0.1, 0.95, mat('monBack'), 2.4, FLOOR + 0.9, 2.2, g); box(0.8, 0.04, 0.55, mat('paper'), 2.4, FLOOR + 0.97, 2.3, g, false); }
      if (i === 2) for (let k = 0; k < 2; k++) box(0.8, 1.5, 0.7, mat('cabinet'), 2.6, FLOOR + 0.75, 1.4 + k * 0.85, g);
      plant(i % 2 ? -2.8 : 2.8, POD_D / 2 - 0.8, 0.85, g);
      // Vạch vàng giao việc: trưởng phòng → bàn
      const a = V(0, BOSS_Z + 3.9), b = V(xs[i], POD_Z - POD_D / 2 - 0.6);
      const mid = V(xs[i] * 0.55, (a.z + b.z) / 2);
      lanes[nv.id] = [a, mid, b, V(xs[i], POD_Z - 0.2)];
      seg(a, mid, 0.18); seg(mid, b, 0.18);
      const pk = new THREE.Mesh(new THREE.BoxGeometry(0.42, 0.28, 0.34), mat('packet')); pk.castShadow = true; root.add(pk);
      packets.push({ m: pk, lane: [a, mid, b], t: i / n });
    });
    plant(-halfW + 1.2, -13.6); plant(halfW - 1.2, -13.6); plant(-halfW + 1.2, 11); plant(halfW - 1.2, 11);
  }
  function seg(a, b, w) {
    const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
    const m = new THREE.Mesh(new THREE.BoxGeometry(len + w, 0.05, w), mat('line'));
    m.position.set((a.x + b.x) / 2, 0.27, (a.z + b.z) / 2); m.rotation.y = -Math.atan2(dz, dx); m.receiveShadow = true; root.add(m);
  }
  function along(pts, t) {
    const L = []; let tot = 0; for (let i = 0; i < pts.length - 1; i++) { const d = pts[i].distanceTo(pts[i + 1]); L.push(d); tot += d; }
    let s = t * tot; for (let i = 0; i < L.length; i++) { if (s <= L[i]) return pts[i].clone().lerp(pts[i + 1], s / L[i]); s -= L[i]; }
    return pts[pts.length - 1].clone();
  }

  /* ---------- Camera, tương tác ---------- */
  function size() { const r = stageEl.getBoundingClientRect(); return { w: Math.max(1, r.width), h: Math.max(1, r.height) }; }
  function updateCamera() {
    const { w, h } = size(), a = w / h, H = 24;
    Object.assign(camera, { left: -H * a, right: H * a, top: H, bottom: -H, zoom });
    camera.position.copy(target).addScaledVector(camDir, 150); camera.lookAt(target);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  }
  function shift(px, z) { const { h } = size(); return new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(px * 48 / (z * h)); }
  function computeFit(b3, boost = 1) {
    const sz = zoom, st = target.clone(); target.copy(b3.getCenter(new THREE.Vector3())); zoom = 1; updateCamera();
    let mx = 0, my = 0; const { w } = size(), avail = Math.max(0.4, 1 - padRight / w);
    for (const x of [b3.min.x, b3.max.x]) for (const y of [b3.min.y, b3.max.y]) for (const z of [b3.min.z, b3.max.z]) {
      const p = new THREE.Vector3(x, y, z).project(camera); mx = Math.max(mx, Math.abs(p.x)); my = Math.max(my, Math.abs(p.y)); }
    const z = Math.min(avail * 0.95 / mx, 0.94 / my) * boost, t = b3.getCenter(new THREE.Vector3());
    zoom = sz; target.copy(st); updateCamera(); return { z, t };
  }
  function fit(animate = true) {
    const half = (xs[xs.length - 1] || 0) + POD_W / 2 + 0.5;
    const narrow = size().w < 560;
    const b = new THREE.Box3(new THREE.Vector3(-half, 0, BOSS_Z - 2.6), new THREE.Vector3(half, 3.6, POD_Z + POD_D / 2 + 0.3));
    const { z, t } = computeFit(b, narrow ? 1.55 : 1); fitZoom = narrow ? z / 1.55 : z; zoomGoal = z; if (!animate) zoom = z; updateCamera();
    t.add(shift(padRight / 2, z)); targetGoal.copy(t); if (!animate) target.copy(t); dirty = true;
  }
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function hit(ev) {
    const r = canvas.getBoundingClientRect(); ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    for (const h of ray.intersectObjects(pickables, false)) { const u = h.object.userData; if (u.person || u.boss) return u; }
    return null;
  }
  function bindInput() {
    const ptrs = new Map(); let down = null, moved = 0, pinch0 = 0, zoom0 = 1, hoverT = 0;
    canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY }); down = { x: e.clientX, y: e.clientY }; moved = 0;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = zoomGoal; } });
    canvas.addEventListener('pointermove', e => {
      if (ptrs.has(e.pointerId)) {
        const p = ptrs.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY; moved += Math.abs(dx) + Math.abs(dy);
        if (ptrs.size === 1 && moved > 4) { const { h } = size(), k = 48 / (zoom * h);
          const d = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0).multiplyScalar(-dx * k).add(new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1).multiplyScalar(dy * k));
          target.add(d); targetGoal.add(d); dirty = true; }
        else if (ptrs.size === 2 && pinch0) { const [a, b] = [...ptrs.values()]; zoomGoal = THREE.MathUtils.clamp(zoom0 * Math.hypot(a.x - b.x, a.y - b.y) / pinch0, fitZoom * 0.7, 5); dirty = true; }
        return;
      }
      const now = performance.now(); if (now - hoverT < 50) return; hoverT = now;
      const u = hit(e); canvas.style.cursor = u ? 'pointer' : 'grab'; hoverCb && hoverCb(u, e);
    });
    canvas.addEventListener('pointerup', e => { const one = ptrs.size === 1; ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = 0;
      if (one && down && moved < 6) pickCb && pickCb(hit(e), e); if (!ptrs.size) down = null; });
    canvas.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); down = null; });
    canvas.addEventListener('pointerleave', () => hoverCb && hoverCb(null));
    canvas.addEventListener('wheel', e => { e.preventDefault();
      const r = canvas.getBoundingClientRect(), nx = ((e.clientX - r.left) / r.width) * 2 - 1, ny = -((e.clientY - r.top) / r.height) * 2 + 1;
      const before = new THREE.Vector3(nx, ny, 0).unproject(camera);
      zoom = zoomGoal = THREE.MathUtils.clamp(zoom * Math.exp(-e.deltaY * 0.0016), fitZoom * 0.7, 5); updateCamera();
      const d = before.sub(new THREE.Vector3(nx, ny, 0).unproject(camera)); target.add(d); targetGoal.add(d); dirty = true; }, { passive: false });
  }

  /* ---------- Chủ đề, vòng lặp ---------- */
  function setTheme(name) {
    if (!PAL[name]) return; theme = name; if (!ready) return;
    const P = PAL[name]; renderer.setClearColor(P.clear);
    for (const k in P.m) mat(k).color.setHex(P.m[k]);
    for (const k in P.em) mat(k).emissive.setHex(P.em[k]);
    mat('glass').opacity = P.glass; mat('boardBack').color.setHex(P.board.back);
    hemi.color.setHex(P.hemi[0]); hemi.groundColor.setHex(P.hemi[1]); hemi.intensity = P.hemi[2]; sun.intensity = P.sun; sun.castShadow = P.shadows;
    if (P.edges && !edgeObjs.length) { const lm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
      root.traverse(o => { if (o.isMesh && !o.userData.noEdge) { const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 30), lm); e.userData.noEdge = true; o.add(e); edgeObjs.push(e); } }); }
    edgeObjs.forEach(e => (e.visible = P.edges)); boards.forEach(drawBoard); dirty = true;
  }
  function highlight(id) { if (hiId === id) return; if (hiId && people[hiId]) people[hiId].ring.visible = false; hiId = id; if (id && people[id]) people[id].ring.visible = true; dirty = true; }
  function dispatch(fromId, toId) {
    const lane = lanes[toId], from = people[fromId]; if (!lane || !from) return;
    const start = new THREE.Vector3().setFromMatrixPosition(from.g.matrixWorld); start.y = 0;
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.62, 0.4, 0.48), mat('hot')); m.castShadow = true; root.add(m);
    flights.push({ m, route: [start, ...lane], t: 0, to: toId }); dirty = true;
  }
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame); const dt = Math.min(0.05, (now - last) / 1000); last = now; if (document.hidden) return;
    let moving = false;
    if (Math.abs(zoom - zoomGoal) > 1e-3 || target.distanceToSquared(targetGoal) > 1e-4) { const k = 1 - Math.pow(0.0015, dt); zoom += (zoomGoal - zoom) * k; target.lerp(targetGoal, k); moving = true; }
    if (moving || dirty) updateCamera();
    const t = now / 1000;
    if (!reduced) {
      for (const p of packets) { p.t = (p.t + dt * 0.12) % 1; const q = along(p.lane, p.t); p.m.position.set(q.x, 0.46, q.z); }
      for (const id in people) { const o = people[id];
        const s = id === hiId ? 1.35 + Math.sin(t * 6) * 0.15 : 1 + Math.sin(t * 2 + o.phase) * 0.08; o.light.scale.setScalar(s + (o.flash > 0 ? o.flash : 0));
        if (o.flash > 0) o.flash -= dt; if (o.ring.visible) o.ring.rotation.z += dt * 1.5; }
    }
    for (let i = flights.length - 1; i >= 0; i--) { const f = flights[i]; f.t += dt * (reduced ? 3 : 0.9);
      if (f.t >= 1) { root.remove(f.m); flights.splice(i, 1); if (people[f.to]) people[f.to].flash = 1.2; continue; }
      const q = along(f.route, f.t); f.m.position.set(q.x, 0.6 + Math.sin(f.t * Math.PI) * 0.6, q.z); f.m.rotation.y += dt * 4; }
    renderer.render(scene, camera); frameCb && frameCb(moving || dirty); dirty = false;
  }
  function project(v) { const { w, h } = size(), p = v.clone().project(camera); return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h }; }

  function init(stage, cv, data, opts = {}) {
    stageEl = stage; canvas = cv;
    try { renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true }); if (!renderer.getContext()) throw 0; } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene(); root = new THREE.Group(); scene.add(root);
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -400, 600);
    hemi = new THREE.HemisphereLight(0xffffff, 0xaebcd6, 0.9); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xffffff, 0.72); sun.position.set(-24, 46, 30); sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
    Object.assign(sun.shadow.camera, { left: -36, right: 36, top: 36, bottom: -36, near: 1, far: 140 }); sun.shadow.bias = -0.0006; scene.add(sun);
    mat('glass', { transparent: true, opacity: 0.2, depthWrite: false }); mat('boardBack');
    mats.stIdle = new THREE.MeshBasicMaterial({ color: 0x2BBF73 });
    logoTex = new THREE.Texture(); mats.logo = new THREE.MeshBasicMaterial({ map: logoTex });
    if (opts.logo) { const img = new Image(); img.onload = () => { const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
      x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 512, 512); x.drawImage(img, 36, 36, 440, 440 * img.height / img.width); logoTex.image = c; logoTex.needsUpdate = true; dirty = true; }; img.src = opts.logo; }
    build(data); ready = true; setTheme(theme); bindInput();
    new ResizeObserver(() => { const { w, h } = size(); renderer.setSize(w, h, false); fit(false); }).observe(stageEl);
    const { w, h } = size(); renderer.setSize(w, h, false); fit(false); requestAnimationFrame(frame);
    return true;
  }
  return { init, setTheme, highlight, dispatch, fit, project,
    setPadRight(px) { padRight = px; }, zoomBy(f) { zoomGoal = THREE.MathUtils.clamp(zoomGoal * f, fitZoom * 0.7, 5); dirty = true; },
    redrawBoards() { if (ready) boards.forEach(drawBoard); },
    anchor: id => people[id] && people[id].anchor(),
    podFront: id => { const i = podIndex[id]; return i == null ? null : new THREE.Vector3(xs[i], 0.3, POD_Z + POD_D / 2 + 0.25); },
    onFrame: cb => (frameCb = cb), onPick: cb => (pickCb = cb), onHover: cb => (hoverCb = cb),
    get ready() { return ready; } };
})();
