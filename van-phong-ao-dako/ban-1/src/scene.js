/* Văn phòng 3D – dựng bằng three.js r128 (không dùng thư viện điều khiển ngoài). */
const Office = (() => {
  const W = 12, D = 10, G = 3, FLOOR = 0.24;
  const PX = W + G, PZ = D + G;
  const cx = c => (c - 1) * PX, cz = r => (r - 1) * PZ;
  const zc01 = (cz(0) + cz(1)) / 2, zc12 = (cz(1) + cz(2)) / 2;
  const xc01 = (cx(0) + cx(1)) / 2, xc12 = (cx(1) + cx(2)) / 2;
  const xL = cx(0) - W / 2 - G / 2, xR = cx(2) + W / 2 + G / 2;
  const HUB = new THREE.Vector3(cx(1), 0, cz(1) + 1.6);
  const AZ = 31 * Math.PI / 180, EL = 37 * Math.PI / 180;
  const camDir = new THREE.Vector3(Math.cos(EL) * Math.sin(AZ), Math.sin(EL), Math.cos(EL) * Math.cos(AZ));

  const PAL = {
    sang: {
      clear: 0xE8EEF7, hemi: [0xffffff, 0xaebcd6, 0.9], sun: 0.72, shadows: true, glass: 0.22, edges: false,
      m: { ground: 0xD9E2EF, floor: 0xFFFFFF, floorEdge: 0xC9D6EA, lobby: 0xF6F1E4, wall: 0xFFFFFF, trim: 0x0B3F9E,
        desk: 0xFFFFFF, leg: 0x9AA8C2, chair: 0x0B3F9E, body: 0x0B3F9E, boss: 0x0A2F78, collar: 0xF0A81C, skin: 0xF2D5BF,
        hair: 0x1E2433, screen: 0xBFD6F8, monBack: 0x24324F, plant: 0x36B074, pot: 0xFFFFFF, paper: 0xFFFFFF,
        cabinet: 0xE3E9F3, glass: 0x8DB9F2, line: 0xF0A81C, spoke: 0xF5CC74, packet: 0xF0A81C, hot: 0xFFB800,
        hub: 0x0B3F9E, metal: 0x6E7D99, binderA: 0x0B3F9E, binderB: 0xF0A81C, sofa: 0x274B8F, rug: 0xE6EDF8 },
      em: { screen: 0x000000, line: 0x000000, packet: 0x000000, hot: 0x3a2a00 },
      board: { bg: '#0B3F9E', text: '#FFFFFF', slug: '#F7C35A', bar: '#F0A81C', back: 0x082C70 }
    },
    dem: {
      clear: 0x050F26, hemi: [0x8fb0ff, 0x0b1630, 0.55], sun: 0.42, shadows: true, glass: 0.18, edges: false,
      m: { ground: 0x081A3E, floor: 0x10285A, floorEdge: 0x1B3B78, lobby: 0x152F63, wall: 0x173669, trim: 0xF5B532,
        desk: 0x1E3F7C, leg: 0x2C4C8A, chair: 0x24498F, body: 0x2C65CF, boss: 0x16408F, collar: 0xF5B532, skin: 0xE6C6AE,
        hair: 0x0A1022, screen: 0xFFD27A, monBack: 0x0E2350, plant: 0x2A9C66, pot: 0x1E3F7C, paper: 0xDCE6F5,
        cabinet: 0x1A3670, glass: 0x3D7BE0, line: 0xF5B532, spoke: 0x9C7A2E, packet: 0xF5B532, hot: 0xFFD27A,
        hub: 0xF5B532, metal: 0x50689A, binderA: 0x3D7BE0, binderB: 0xF5B532, sofa: 0x1D3D78, rug: 0x132C5E },
      em: { screen: 0x7a5410, line: 0x5a3d06, packet: 0x6b4a08, hot: 0x8a6510 },
      board: { bg: '#04112E', text: '#FFFFFF', slug: '#F5B532', bar: '#F5B532', back: 0x04112E }
    },
    banve: {
      clear: 0x0C3B8C, hemi: [0xffffff, 0x9fb9e6, 1.0], sun: 0.25, shadows: false, glass: 0.12, edges: true,
      m: { ground: 0x0E4499, floor: 0x1452B5, floorEdge: 0x1A5EC6, lobby: 0x1659C0, wall: 0x1B62CC, trim: 0xFFFFFF,
        desk: 0x1C64D0, leg: 0x2F75DC, chair: 0x2A6FD8, body: 0x2A6FD8, boss: 0x2A6FD8, collar: 0xFFFFFF, skin: 0x9FC2F5,
        hair: 0x6FA0EA, screen: 0xE9F1FF, monBack: 0x1C64D0, plant: 0x6FA0EA, pot: 0x1C64D0, paper: 0xFFFFFF,
        cabinet: 0x1C64D0, glass: 0x9FC2F5, line: 0xFFFFFF, spoke: 0x8EB4F0, packet: 0xFFFFFF, hot: 0xFFFFFF,
        hub: 0xFFFFFF, metal: 0x6FA0EA, binderA: 0x6FA0EA, binderB: 0xFFFFFF, sofa: 0x1C64D0, rug: 0x1659C0 },
      em: { screen: 0x203a60, line: 0x444444, packet: 0x333333, hot: 0x555555 },
      board: { bg: '#0A3478', text: '#FFFFFF', slug: '#CFE0FF', bar: '#FFFFFF', back: 0x0A3478 }
    }
  };

  let renderer, scene, camera, hemi, sun, root, stageEl, canvas;
  let theme = 'sang', ready = false;
  const target = new THREE.Vector3(0, 1, 1), targetGoal = target.clone();
  let zoom = 1, zoomGoal = 1, fitZoom = 1, padLeft = 0;
  const mats = {}, pickables = [], staffObjs = {}, rooms = {}, edgeObjs = [];
  const packets = [], flights = [];
  let ring = [], ringCum = [], ringLen = 0;
  const reduced = matchMedia('(prefers-reduced-motion: reduce)').matches;
  let frameCb = null, pickCb = null, hoverCb = null, dirty = true;
  const statusMat = {};
  let logoImg = null, logoTex = null;

  const mat = (k, extra) => mats[k] || (mats[k] = new THREE.MeshLambertMaterial(Object.assign({ color: 0xffffff }, extra || {})));

  function box(w, h, d, m, x, y, z, parent, shadow = true) {
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
    mesh.position.set(x || 0, y || 0, z || 0);
    mesh.castShadow = shadow; mesh.receiveShadow = true;
    (parent || root).add(mesh);
    return mesh;
  }
  function cyl(rt, rb, h, m, x, y, z, parent, seg = 20) {
    const mesh = new THREE.Mesh(new THREE.CylinderGeometry(rt, rb, h, seg), m);
    mesh.position.set(x || 0, y || 0, z || 0); mesh.castShadow = true; mesh.receiveShadow = true;
    (parent || root).add(mesh); return mesh;
  }
  function tag(mesh, data) { mesh.userData = Object.assign(mesh.userData || {}, data); pickables.push(mesh); return mesh; }

  /* ---------- Biển phòng (canvas texture) ---------- */
  function drawBoard(rm) {
    const P = PAL[theme].board, c = rm.board.canvas, ctx = c.getContext('2d');
    const w = c.width, h = c.height;
    ctx.fillStyle = P.bg; ctx.fillRect(0, 0, w, h);
    ctx.fillStyle = P.slug; ctx.font = '500 30px "JetBrains Mono", ui-monospace, monospace';
    ctx.textBaseline = 'alphabetic'; ctx.fillText(rm.slug, 40, 56);
    if (rm.step) { ctx.textAlign = 'right'; ctx.fillText('BƯỚC ' + rm.step + '/6', w - 40, 56); ctx.textAlign = 'left'; }
    let size = 112; const title = rm.title.toUpperCase();
    do { ctx.font = size + 'px Anton, "Arial Narrow", Impact, sans-serif'; size -= 4; } while (ctx.measureText(title).width > w - 80 && size > 40);
    ctx.fillStyle = P.text; ctx.fillText(title, 40, 178);
    ctx.fillStyle = P.bar; ctx.fillRect(40, 204, w - 80, 14);
    rm.board.tex.needsUpdate = true; dirty = true;
  }
  function makeBoard(rm, width, parent, x, z) {
    const canvasB = document.createElement('canvas'); canvasB.width = 1024; canvasB.height = 248;
    const tex = new THREE.CanvasTexture(canvasB); tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
    const face = new THREE.MeshBasicMaterial({ map: tex });
    const back = mat('boardBack');
    const h = width * 248 / 1024;
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(width, h, 0.16), [back, back, back, back, face, back]);
    mesh.position.set(x, 1.55 + h / 2, z); mesh.castShadow = true;
    parent.add(mesh);
    box(0.12, 1.6, 0.12, mat('metal'), x - width * 0.38, 0.8, z, parent);
    box(0.12, 1.6, 0.12, mat('metal'), x + width * 0.38, 0.8, z, parent);
    rm.board = { canvas: canvasB, tex, mesh };
    tag(mesh, { room: rm.id });
    rm.anchor = new THREE.Vector3(rm.center.x + x - width * 0.18, 1.55 + h + 1.1, rm.center.z + z);
  }

  /* ---------- Nhân sự ---------- */
  function buildStaff(id, x, z, parent, opt = {}) {
    const g = new THREE.Group(); g.position.set(x, FLOOR, z); parent.add(g);
    const dw = opt.boss ? 2.8 : 2.1;
    const desk = box(dw, 0.1, 0.95, mat('desk'), 0, 0.98, 0.62, g);
    box(0.08, 0.93, 0.9, mat('leg'), -dw / 2 + 0.06, 0.5, 0.62, g);
    box(0.08, 0.93, 0.9, mat('leg'), dw / 2 - 0.06, 0.5, 0.62, g);
    box(dw - 0.1, 0.62, 0.05, mat('leg'), 0, 0.62, 1.06, g);
    const mon = new THREE.Mesh(new THREE.BoxGeometry(0.95, 0.58, 0.06),
      [mat('monBack'), mat('monBack'), mat('monBack'), mat('monBack'), mat('monBack'), mat('screen')]);
    mon.position.set(opt.boss ? -0.55 : 0, 1.42, 0.8); mon.castShadow = true; g.add(mon);
    box(0.08, 0.32, 0.08, mat('monBack'), mon.position.x, 1.17, 0.82, g);
    box(0.55, 0.03, 0.2, mat('paper'), opt.boss ? 0.55 : 0.55, 1.045, 0.48, g, false);
    box(0.85, 0.12, 0.78, mat('chair'), 0, 0.62, -0.08, g);
    box(0.85, 0.95, 0.1, mat('chair'), 0, 1.12, -0.5, g);
    const f = new THREE.Group(); f.position.set(0, 0.68, -0.05); g.add(f);
    const body = cyl(0.3, 0.38, 0.92, mat(opt.boss ? 'boss' : 'body'), 0, 0.46, 0, f);
    cyl(0.31, 0.31, 0.08, mat('collar'), 0, 0.9, 0, f);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.29, 20, 16), mat('skin'));
    head.position.set(0, 1.24, 0); head.castShadow = true; f.add(head);
    const hair = new THREE.Mesh(new THREE.SphereGeometry(0.305, 20, 12, 0, Math.PI * 2, 0, Math.PI / 2.1), mat('hair'));
    hair.position.set(0, 1.27, -0.02); hair.rotation.x = -0.28; f.add(hair);
    box(0.13, 0.13, 0.03, mat('collar'), 0.15, 0.62, 0.335, f, false);
    if (opt.boss) box(0.08, 0.36, 0.03, mat('collar'), 0, 0.68, 0.36, f, false);
    const light = new THREE.Mesh(new THREE.SphereGeometry(0.15, 16, 12), statusMat.idle);
    light.position.set(0, 2.32, -0.05); g.add(light);
    [desk, mon, body, head, hair].forEach(m => tag(m, { staff: id }));
    staffObjs[id] = { g, f, light, mon, status: 'idle', phase: Math.random() * 6, flash: 0,
      anchor: () => new THREE.Vector3().setFromMatrixPosition(light.matrixWorld) };
  }

  function plant(x, z, parent, s = 1) {
    cyl(0.32 * s, 0.24 * s, 0.5 * s, mat('pot'), x, FLOOR + 0.25 * s, z, parent);
    const p = new THREE.Mesh(new THREE.IcosahedronGeometry(0.55 * s, 0), mat('plant'));
    p.position.set(x, FLOOR + 0.95 * s, z); p.castShadow = true; p.rotation.y = x * 1.7; parent.add(p);
  }
  function panelTex(draw, w = 512, h = 320) {
    const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h);
    const t = new THREE.CanvasTexture(c); return new THREE.MeshBasicMaterial({ map: t });
  }

  /* ---------- Đồ đạc riêng từng phòng ---------- */
  const PROPS = {
    kd(g) {
      cyl(1.25, 1.25, 0.08, mat('desk'), 2.6, FLOOR + 0.82, 3.0, g);
      cyl(0.12, 0.12, 0.8, mat('leg'), 2.6, FLOOR + 0.4, 3.0, g);
      [[1.1, 3.0], [4.1, 3.0], [2.6, 1.6], [2.6, 4.4]].forEach(([x, z]) => cyl(0.32, 0.32, 0.5, mat('chair'), x, FLOOR + 0.25, z, g));
      box(1.2, 0.02, 0.8, mat('paper'), 2.4, FLOOR + 0.87, 2.9, g, false);
      const wb = panelTex((c, w, h) => { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); c.strokeStyle = '#0B3F9E'; c.lineWidth = 6;
        c.strokeRect(10, 10, w - 20, h - 20); c.fillStyle = '#0B3F9E'; c.font = '600 34px "Be Vietnam Pro", sans-serif';
        c.fillText('6 NHÓM HUẤN LUYỆN', 34, 64); c.font = '500 26px "Be Vietnam Pro", sans-serif';
        ['N1 · Quản lý', 'N2 · Cán bộ an toàn', 'N3 · Việc nghiêm ngặt', 'N4 · Người lao động', 'N5 · Y tế', 'N6 · ATVSV'].forEach((t, i) =>
          c.fillText(t, 34 + (i % 2) * 230, 120 + Math.floor(i / 2) * 64)); });
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.6, 2.6), [wb, mat('wall'), mat('wall'), mat('wall'), mat('wall'), mat('wall')]);
      m.position.set(-W / 2 + 0.3, FLOOR + 1.3, 2.4); g.add(m);
      plant(-W / 2 + 0.9, D / 2 - 0.9, g);
    },
    hd(g) {
      box(0.6, 1.8, 3.2, mat('cabinet'), -W / 2 + 0.55, FLOOR + 0.9, 2.6, g);
      for (let i = 0; i < 10; i++) box(0.4, 0.5, 0.12, mat(i % 3 ? 'binderA' : 'binderB'), -W / 2 + 0.9, FLOOR + 1.35, 1.25 + i * 0.27, g, false);
      for (let i = 0; i < 10; i++) box(0.4, 0.5, 0.12, mat(i % 4 ? 'binderB' : 'binderA'), -W / 2 + 0.9, FLOOR + 0.6, 1.25 + i * 0.27, g, false);
      box(1.6, 0.06, 1.0, mat('desk'), 2.8, FLOOR + 0.8, 3.0, g); box(1.5, 0.76, 0.9, mat('leg'), 2.8, FLOOR + 0.38, 3.0, g);
      cyl(0.12, 0.14, 0.25, mat('binderB'), 3.2, FLOOR + 0.96, 3.0, g); box(0.5, 0.02, 0.7, mat('paper'), 2.5, FLOOR + 0.84, 3.0, g, false);
      plant(W / 2 - 0.9, D / 2 - 0.9, g);
    },
    xl(g) {
      const cal = panelTex((c, w, h) => { c.fillStyle = '#FFFFFF'; c.fillRect(0, 0, w, h); c.fillStyle = '#0B3F9E'; c.fillRect(0, 0, w, 56);
        c.fillStyle = '#FFFFFF'; c.font = '600 30px "Be Vietnam Pro", sans-serif'; c.fillText('LỊCH GIẢNG DẠY', 20, 40);
        for (let r = 0; r < 4; r++) for (let k = 0; k < 7; k++) { c.strokeStyle = '#C8D4EA'; c.lineWidth = 2; c.strokeRect(14 + k * 70, 70 + r * 60, 66, 56);
          if ((r * 7 + k) % 4 === 1) { c.fillStyle = (r + k) % 2 ? '#F0A81C' : '#0B3F9E'; c.fillRect(20 + k * 70, 96 + r * 60, 54, 14); } } });
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.08, 1.8, 2.9), [cal, mat('wall'), mat('wall'), mat('wall'), mat('wall'), mat('wall')]);
      m.position.set(-W / 2 + 0.3, FLOOR + 1.35, 2.4); g.add(m);
      box(2.2, 0.06, 1.0, mat('desk'), 2.4, FLOOR + 0.8, 3.1, g); box(2.1, 0.76, 0.9, mat('leg'), 2.4, FLOOR + 0.38, 3.1, g);
      plant(W / 2 - 0.9, D / 2 - 0.9, g); plant(-W / 2 + 0.9, D / 2 - 0.7, g, 0.8);
    },
    gv(g) {
      const scr = panelTex((c, w, h) => { c.fillStyle = '#0B3F9E'; c.fillRect(0, 0, w, h); c.fillStyle = '#F0A81C'; c.font = '600 28px "Be Vietnam Pro", sans-serif';
        c.fillText('ĐIỂM DANH  ·  SÁNG / CHIỀU', 20, 42); c.font = '500 22px "Be Vietnam Pro", sans-serif';
        for (let r = 0; r < 6; r++) { c.fillStyle = 'rgba(255,255,255,.12)'; c.fillRect(16, 62 + r * 42, w - 32, 36);
          c.fillStyle = '#FFFFFF'; c.fillText('Học viên ' + (r + 1), 28, 88 + r * 42);
          for (let k = 0; k < 4; k++) { c.fillStyle = (r + k) % 5 ? '#3CC488' : '#F0A81C'; c.fillText((r + k) % 5 ? '✓' : '–', 260 + k * 56, 88 + r * 42); } } });
      const m = new THREE.Mesh(new THREE.BoxGeometry(0.1, 1.9, 3.1), [scr, mat('monBack'), mat('monBack'), mat('monBack'), mat('monBack'), mat('monBack')]);
      m.position.set(-W / 2 + 0.3, FLOOR + 1.45, 2.4); g.add(m);
      for (let i = 0; i < 3; i++) { box(1.4, 0.06, 0.7, mat('desk'), 1.0 + i * 1.7, FLOOR + 0.72, 3.4, g); box(0.5, 0.03, 0.35, mat('monBack'), 1.0 + i * 1.7, FLOOR + 0.77, 3.35, g, false); }
      plant(W / 2 - 0.9, D / 2 - 0.9, g);
    },
    cc(g) {
      [[-3.6, 3.1], [-1.4, 3.1]].forEach(([x, z]) => {
        box(1.5, 0.95, 1.05, mat('cabinet'), x, FLOOR + 0.48, z, g);
        box(1.5, 0.12, 1.05, mat('monBack'), x, FLOOR + 1.0, z, g);
        box(0.9, 0.04, 0.6, mat('paper'), x, FLOOR + 1.1, z + 0.1, g, false);
        box(0.25, 0.08, 0.08, mat('stOk'), x + 0.55, FLOOR + 1.07, z + 0.53, g, false);
      });
      box(2.6, 0.06, 1.2, mat('desk'), 2.6, FLOOR + 0.82, 3.1, g); box(2.5, 0.78, 1.1, mat('leg'), 2.6, FLOOR + 0.39, 3.1, g);
      for (let i = 0; i < 6; i++) box(0.36, 0.02, 0.54, mat(i % 2 ? 'binderB' : 'binderA'), 1.7 + (i % 3) * 0.55, FLOOR + 0.87 + Math.floor(i / 3) * 0.03, 2.9 + Math.floor(i / 3) * 0.6, g, false);
      plant(W / 2 - 0.8, D / 2 - 0.8, g, 0.9);
    },
    lt(g) {
      for (let i = 0; i < 4; i++) {
        box(0.85, 1.7, 0.75, mat('cabinet'), -W / 2 + 0.6, FLOOR + 0.85, 0.6 + i * 0.95, g);
        for (let k = 0; k < 3; k++) box(0.04, 0.05, 0.5, mat('trim'), -W / 2 + 1.04, FLOOR + 0.45 + k * 0.5, 0.6 + i * 0.95, g, false);
      }
      [[2.2, 3.4], [2.95, 3.4], [2.55, 3.4, 1]].forEach(([x, z, up]) => box(0.7, 0.5, 0.55, mat('binderB'), x, FLOOR + 0.25 + (up ? 0.5 : 0), z, g));
      plant(W / 2 - 0.9, D / 2 - 0.9, g);
    },
    tt(g) {
      const m = new THREE.Mesh(new THREE.BoxGeometry(3.4, 1.95, 0.12), [mat('monBack'), mat('monBack'), mat('monBack'), mat('monBack'), mat('logoScreen'), mat('monBack')]);
      m.position.set(1.6, FLOOR + 1.9, 2.0); m.castShadow = true; g.add(m);
      box(0.12, 1.0, 0.12, mat('metal'), 1.6, FLOOR + 0.5, 2.0, g); box(1.0, 0.06, 0.5, mat('metal'), 1.6, FLOOR + 0.03, 2.0, g);
      const tri = new THREE.Group(); tri.position.set(-2.4, FLOOR, 3.4); g.add(tri);
      [-0.35, 0.35].forEach(dx => { const l = cyl(0.04, 0.04, 1.5, mat('metal'), dx, 0.72, 0, tri, 6); l.rotation.z = dx * 0.5; });
      box(0.5, 0.32, 0.36, mat('monBack'), 0, 1.55, 0, tri); cyl(0.12, 0.12, 0.25, mat('monBack'), 0, 1.55, 0.25, tri).rotation.x = Math.PI / 2;
      plant(-W / 2 + 0.9, D / 2 - 0.9, g);
    },
    dp(g) {
      box(4.6, 1.05, 1.1, mat('desk'), 0, FLOOR + 0.52, -0.1, g);
      box(4.62, 0.22, 1.12, mat('trim'), 0, FLOOR + 0.62, -0.1, g, false);
      box(4.64, 0.06, 1.14, mat('collar'), 0, FLOOR + 0.78, -0.1, g, false);
      const lg = new THREE.Mesh(new THREE.BoxGeometry(2.6, 2.6, 0.14), [mat('wall'), mat('wall'), mat('wall'), mat('wall'), mat('logoPanel'), mat('wall')]);
      lg.position.set(-3.4, FLOOR + 1.6, -3.4); lg.castShadow = true; g.add(lg); tag(lg, { room: 'dp' });
      box(0.16, 0.3, 0.16, mat('metal'), -3.4, FLOOR + 0.15, -3.4, g);
      const ringM = new THREE.Mesh(new THREE.TorusGeometry(1.25, 0.1, 10, 48), mat('line'));
      ringM.rotation.x = Math.PI / 2; ringM.position.set(0, FLOOR + 0.08, 1.6); g.add(ringM);
      cyl(1.1, 1.1, 0.05, mat('hub'), 0, FLOOR + 0.03, 1.6, g, 40);
      plant(W / 2 - 0.9, -D / 2 + 0.9, g); plant(-W / 2 + 0.9, D / 2 - 0.9, g, 0.9);
    },
    tp(g) {
      box(2.8, 0.7, 1.0, mat('sofa'), -3.4, FLOOR + 0.35, 3.3, g); box(2.8, 0.7, 0.25, mat('sofa'), -3.4, FLOOR + 0.75, 3.9, g);
      box(1.4, 0.4, 0.8, mat('desk'), -3.4, FLOOR + 0.2, 2.1, g);
      const tray = box(0.8, 0.12, 0.55, mat('collar'), 1.05, FLOOR + 1.1, -0.55, g); tag(tray, { review: true });
      box(0.6, 0.04, 0.42, mat('paper'), 1.05, FLOOR + 1.18, -0.55, g, false);
      plant(W / 2 - 0.9, D / 2 - 0.9, g); plant(-W / 2 + 0.9, -D / 2 + 0.9, g, 0.9);
    }
  };

  /* ---------- Phòng ---------- */
  function buildRoom(d, staffIds) {
    const [r, c] = d.o;
    const g = new THREE.Group(); g.position.set(cx(c), 0, cz(r)); root.add(g);
    const rm = { id: d.id, title: d.ten, slug: d.slug, step: d.buoc, center: new THREE.Vector3(cx(c), 0, cz(r)), group: g };
    rooms[d.id] = rm;
    box(W + 0.3, 0.2, D + 0.3, mat('floorEdge'), 0, 0.1, 0, g, false);
    tag(box(W, FLOOR, D, mat(d.id === 'dp' ? 'lobby' : 'floor'), 0, FLOOR / 2, 0, g, false), { room: d.id });
    if (d.id === 'tp') {
      box(W, 2.6, 0.08, mat('glass'), 0, FLOOR + 1.3, -D / 2 + 0.05, g, false);
      box(0.08, 2.6, D, mat('glass'), -W / 2 + 0.05, FLOOR + 1.3, 0, g, false);
      box(0.08, 2.6, D * 0.55, mat('glass'), W / 2 - 0.05, FLOOR + 1.3, -D * 0.225, g, false);
      [[0, -D / 2 + 0.05, W, 0.14], [-W / 2 + 0.05, 0, 0.14, D]].forEach(([x, z, w, dd]) => box(w, 0.08, dd, mat('trim'), x, FLOOR + 2.62, z, g, false));
    } else if (d.id !== 'dp') {
      box(W, 1.1, 0.22, mat('wall'), 0, FLOOR + 0.55, -D / 2 + 0.11, g);
      box(0.22, 1.1, D, mat('wall'), -W / 2 + 0.11, FLOOR + 0.55, 0, g);
      box(W, 0.08, 0.26, mat('trim'), 0, FLOOR + 1.14, -D / 2 + 0.11, g, false);
      box(0.26, 0.08, D, mat('trim'), -W / 2 + 0.11, FLOOR + 1.14, 0, g, false);
    }
    makeBoard(rm, d.id === 'dp' ? W * 0.6 : W * 0.82, g, d.id === 'dp' ? 1.8 : 0, -D / 2 - 0.25);
    const n = staffIds.length;
    if (d.id === 'dp') buildStaff(staffIds[0], 0.6, -1.0, g);
    else if (d.id === 'tp') buildStaff('tp', 1.2, -1.6, g, { boss: true });
    else {
      const sp = Math.min(2.8, (W - 1.6) / n);
      staffIds.forEach((id, i) => buildStaff(id, (i - (n - 1) / 2) * sp, -1.7, g));
    }
    (PROPS[d.id] || (() => {}))(g);
  }

  /* ---------- Dòng chảy hồ sơ (vạch vàng) ---------- */
  function seg(a, b, w, m, y) {
    const dx = b.x - a.x, dz = b.z - a.z, len = Math.hypot(dx, dz);
    const mesh = new THREE.Mesh(new THREE.BoxGeometry(len + w, 0.05, w), m);
    mesh.position.set((a.x + b.x) / 2, y, (a.z + b.z) / 2); mesh.rotation.y = -Math.atan2(dz, dx); mesh.receiveShadow = true;
    root.add(mesh); return mesh;
  }
  const V = (x, z) => new THREE.Vector3(x, 0, z);
  function buildFlow() {
    ring = [V(cx(1), zc01), V(cx(2), zc01), V(xR, zc01), V(xR, zc12), V(cx(2), zc12), V(cx(1), zc12), V(cx(0), zc12), V(xL, zc12), V(xL, zc01), V(cx(0), zc01)];
    ringCum = [0]; ringLen = 0;
    for (let i = 0; i < ring.length; i++) { const a = ring[i], b = ring[(i + 1) % ring.length]; seg(a, b, 0.3, mat('line'), 0.26); ringLen += a.distanceTo(b); ringCum.push(ringLen); }
    [V(cx(1), zc01), V(cx(1), zc12), V(xc01, cz(1)), V(xc12, cz(1))].forEach(p => seg(HUB, p, 0.16, mat('spoke'), 0.27));
    const pg = new THREE.BoxGeometry(0.55, 0.34, 0.42);
    for (let i = 0; i < 12; i++) {
      const m = new THREE.Mesh(pg, mat('packet')); m.castShadow = true; root.add(m);
      packets.push({ m, s: (i / 12) * ringLen });
    }
    placePackets(0);
  }
  function ringAt(s) {
    s = ((s % ringLen) + ringLen) % ringLen;
    let i = 0; while (ringCum[i + 1] < s) i++;
    const a = ring[i], b = ring[(i + 1) % ring.length], t = (s - ringCum[i]) / (ringCum[i + 1] - ringCum[i]);
    return { p: a.clone().lerp(b, t), dir: Math.atan2(b.z - a.z, b.x - a.x) };
  }
  function placePackets(dt) {
    for (const k of packets) { k.s += dt * 1.7; const r = ringAt(k.s); k.m.position.set(r.p.x, 0.47, r.p.z); k.m.rotation.y = -r.dir; }
  }
  const DOOR = () => ({ kd: V(cx(1), zc01), tt: V(cx(0), zc01), hd: V(cx(2), zc01), gv: V(cx(2), zc12), cc: V(cx(1), zc12),
    lt: V(cx(0), zc12), xl: V(xc12, cz(1)), tp: V(xc01, cz(1)), dp: HUB.clone() });
  function dispatch(deptId, staffId) {
    if (!ready) return;
    const door = DOOR()[deptId]; if (!door) return;
    let route = [HUB.clone()];
    if (deptId === 'xl' || deptId === 'tp') route.push(door);
    else if (deptId !== 'dp') { const end = V(cx(1), Math.abs(door.z - zc01) < 0.1 ? zc01 : zc12); route.push(end); if (end.distanceTo(door) > 0.1) route.push(door); }
    const rc = rooms[deptId]; if (rc) route.push(rc.center.clone().add(V(0, 0.6)));
    const m = new THREE.Mesh(new THREE.BoxGeometry(0.7, 0.44, 0.52), mat('hot')); m.castShadow = true; root.add(m);
    flights.push({ m, route, i: 0, t: 0, staffId });
    dirty = true;
  }

  /* ---------- Camera ---------- */
  function size() { const r = stageEl.getBoundingClientRect(); return { w: Math.max(1, r.width), h: Math.max(1, r.height) }; }
  function updateCamera() {
    const { w, h } = size(), a = w / h, H = 24;
    camera.left = -H * a; camera.right = H * a; camera.top = H; camera.bottom = -H;
    camera.zoom = zoom; camera.position.copy(target).addScaledVector(camDir, 150); camera.lookAt(target);
    camera.updateProjectionMatrix(); camera.updateMatrixWorld();
  }
  function screenShift(px, z) {
    const { h } = size(); const wpp = 48 / (z * h);
    const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0);
    return right.multiplyScalar(-px * wpp);
  }
  function computeFit(box3, opts) {
    const save = zoom, saveT = target.clone();
    target.copy(box3.getCenter(new THREE.Vector3())); zoom = 1; updateCamera();
    let mx = 0, my = 0; const { w } = size();
    const avail = Math.max(0.35, 1 - padLeft / w);
    for (const x of [box3.min.x, box3.max.x]) for (const y of [box3.min.y, box3.max.y]) for (const z of [box3.min.z, box3.max.z]) {
      const p = new THREE.Vector3(x, y, z).project(camera); mx = Math.max(mx, Math.abs(p.x)); my = Math.max(my, Math.abs(p.y));
    }
    const z = Math.min(avail * 1.04 / mx, 0.98 / my) * (opts && opts.boost || 1);
    const t = box3.getCenter(new THREE.Vector3());
    zoom = save; target.copy(saveT); updateCamera();
    return { z, t };
  }
  function fit(animate = true) {
    const b = new THREE.Box3(new THREE.Vector3(xL - 1, 0, cz(0) - D / 2 - 1.2), new THREE.Vector3(xR + 1, 4.4, cz(2) + D / 2 + 1));
    const narrow = size().w < 560;
    const { z, t } = computeFit(b, { boost: narrow ? 1.9 : 1 }); fitZoom = narrow ? z / 1.9 : z;
    zoom = animate ? zoom : z; zoomGoal = z;
    updateCamera();
    t.add(screenShift(padLeft / 2, z)); targetGoal.copy(t); if (!animate) target.copy(t);
    dirty = true;
  }
  function focusRoom(id) {
    const rm = rooms[id]; if (!rm) return;
    const b = new THREE.Box3(new THREE.Vector3(rm.center.x - W / 2 - 0.5, 0, rm.center.z - D / 2 - 0.6), new THREE.Vector3(rm.center.x + W / 2 + 0.5, 4.2, rm.center.z + D / 2 + 0.5));
    const { z, t } = computeFit(b); zoomGoal = Math.min(z, 4.2);
    t.add(screenShift(padLeft / 2, zoomGoal)); targetGoal.copy(t); dirty = true;
  }

  /* ---------- Tương tác ---------- */
  const ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
  function hit(ev) {
    const r = canvas.getBoundingClientRect();
    ndc.set(((ev.clientX - r.left) / r.width) * 2 - 1, -((ev.clientY - r.top) / r.height) * 2 + 1);
    ray.setFromCamera(ndc, camera);
    const hits = ray.intersectObjects(pickables, false);
    for (const h of hits) { const u = h.object.userData; if (u.staff || u.room || u.review) return u; }
    return null;
  }
  function bindInput() {
    const ptrs = new Map(); let downAt = null, moved = 0, pinch0 = 0, zoom0 = 1, hoverT = 0;
    canvas.addEventListener('pointerdown', e => { canvas.setPointerCapture(e.pointerId); ptrs.set(e.pointerId, { x: e.clientX, y: e.clientY });
      downAt = { x: e.clientX, y: e.clientY }; moved = 0;
      if (ptrs.size === 2) { const [a, b] = [...ptrs.values()]; pinch0 = Math.hypot(a.x - b.x, a.y - b.y); zoom0 = zoomGoal; } });
    canvas.addEventListener('pointermove', e => {
      if (ptrs.has(e.pointerId)) {
        const p = ptrs.get(e.pointerId), dx = e.clientX - p.x, dy = e.clientY - p.y; p.x = e.clientX; p.y = e.clientY;
        moved += Math.abs(dx) + Math.abs(dy);
        if (ptrs.size === 1) {
          const { h } = size(), wpp = 48 / (zoom * h);
          const right = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 0), up = new THREE.Vector3().setFromMatrixColumn(camera.matrixWorld, 1);
          const d = right.multiplyScalar(-dx * wpp).add(up.multiplyScalar(dy * wpp));
          target.add(d); targetGoal.add(d); dirty = true;
        } else if (ptrs.size === 2 && pinch0) {
          const [a, b] = [...ptrs.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
          zoomGoal = THREE.MathUtils.clamp(zoom0 * d / pinch0, fitZoom * 0.7, 6); dirty = true;
        }
        return;
      }
      const now = performance.now(); if (now - hoverT < 60) return; hoverT = now;
      const u = hit(e); canvas.style.cursor = u ? 'pointer' : 'grab'; hoverCb && hoverCb(u, e);
    });
    const end = e => {
      const wasOne = ptrs.size === 1; ptrs.delete(e.pointerId); if (ptrs.size < 2) pinch0 = 0;
      if (wasOne && downAt && moved < 6) { const u = hit(e); pickCb && pickCb(u, e); }
      if (!ptrs.size) downAt = null;
    };
    canvas.addEventListener('pointerup', end);
    canvas.addEventListener('pointercancel', e => { ptrs.delete(e.pointerId); downAt = null; });
    canvas.addEventListener('pointerleave', () => hoverCb && hoverCb(null));
    canvas.addEventListener('wheel', e => {
      e.preventDefault();
      const r = canvas.getBoundingClientRect();
      const before = new THREE.Vector3(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1, 0).unproject(camera);
      const nz = THREE.MathUtils.clamp(zoom * Math.exp(-e.deltaY * 0.0016), fitZoom * 0.7, 6);
      zoom = zoomGoal = nz; updateCamera();
      const after = new THREE.Vector3(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1, 0).unproject(camera);
      const d = before.sub(after); target.add(d); targetGoal.add(d); dirty = true;
    }, { passive: false });
  }

  /* ---------- Chủ đề ---------- */
  function buildEdges() {
    const lm = new THREE.LineBasicMaterial({ color: 0xffffff, transparent: true, opacity: 0.55 });
    root.traverse(o => { if (o.isMesh && o.geometry && !o.userData.noEdge) {
      const e = new THREE.LineSegments(new THREE.EdgesGeometry(o.geometry, 30), lm); e.userData.noEdge = true; o.add(e); edgeObjs.push(e); } });
  }
  function setTheme(name) {
    if (!PAL[name]) return; theme = name; if (!ready) return;
    const P = PAL[name];
    renderer.setClearColor(P.clear);
    for (const k in P.m) mat(k).color.setHex(P.m[k]);
    for (const k of ['screen', 'line', 'packet', 'hot']) mat(k).emissive.setHex(P.em[k] || 0);
    mat('glass').opacity = P.glass;
    mat('boardBack').color.setHex(P.board.back);
    hemi.color.setHex(P.hemi[0]); hemi.groundColor.setHex(P.hemi[1]); hemi.intensity = P.hemi[2];
    sun.intensity = P.sun; sun.castShadow = P.shadows;
    if (P.edges && !edgeObjs.length) buildEdges();
    edgeObjs.forEach(e => (e.visible = P.edges));
    Object.values(rooms).forEach(drawBoard);
    dirty = true;
  }

  function setStatus(map) {
    for (const id in staffObjs) {
      const s = map[id] || 'idle', o = staffObjs[id];
      if (o.status !== s) { o.status = s; o.light.material = statusMat[s] || statusMat.idle; dirty = true; }
    }
  }
  function flash(id) { const o = staffObjs[id]; if (o) { o.flash = 1.2; dirty = true; } }

  /* ---------- Vòng lặp ---------- */
  let last = performance.now();
  function frame(now) {
    requestAnimationFrame(frame);
    const dt = Math.min(0.05, (now - last) / 1000); last = now;
    if (document.hidden) return;
    let moving = false;
    if (Math.abs(zoom - zoomGoal) > 1e-3 || target.distanceToSquared(targetGoal) > 1e-4) {
      const k = 1 - Math.pow(0.0015, dt); zoom += (zoomGoal - zoom) * k; target.lerp(targetGoal, k); moving = true;
    }
    if (moving || dirty) updateCamera();
    if (!reduced) {
      placePackets(dt);
      const t = now / 1000;
      for (const id in staffObjs) {
        const o = staffObjs[id];
        if (o.status === 'work') { o.f.position.y = 0.68 + Math.abs(Math.sin(t * 3 + o.phase)) * 0.05; o.light.scale.setScalar(1 + Math.sin(t * 5 + o.phase) * 0.25); }
        else if (o.status === 'ask') { o.light.scale.setScalar(1 + Math.sin(t * 2.4 + o.phase) * 0.18); o.f.position.y = 0.68; }
        else { o.light.scale.setScalar(1); o.f.position.y = 0.68; }
        if (o.flash > 0) { o.flash -= dt; o.light.scale.multiplyScalar(1 + o.flash); }
      }
    }
    for (let i = flights.length - 1; i >= 0; i--) {
      const f = flights[i]; const a = f.route[f.i], b = f.route[f.i + 1];
      if (!b) { root.remove(f.m); flights.splice(i, 1); flash(f.staffId); continue; }
      const len = a.distanceTo(b) || 0.01; f.t += (reduced ? 40 : 11) * dt / len;
      if (f.t >= 1) { f.i++; f.t = 0; continue; }
      const p = a.clone().lerp(b, f.t); f.m.position.set(p.x, 0.62 + Math.sin(f.t * Math.PI) * 0.4, p.z); f.m.rotation.y += dt * 4;
    }
    renderer.render(scene, camera);
    frameCb && frameCb(moving || dirty);
    dirty = false;
  }

  function project(v) {
    const { w, h } = size(); const p = v.clone().project(camera);
    return { x: (p.x + 1) / 2 * w, y: (1 - p.y) / 2 * h };
  }

  function init(stage, cv, roster, opts = {}) {
    stageEl = stage; canvas = cv;
    try {
      renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true, powerPreference: 'high-performance' });
      if (!renderer.getContext()) throw new Error('no webgl');
    } catch (e) { return false; }
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    scene = new THREE.Scene(); root = new THREE.Group(); scene.add(root);
    camera = new THREE.OrthographicCamera(-1, 1, 1, -1, -400, 600);
    hemi = new THREE.HemisphereLight(0xffffff, 0xaebcd6, 0.9); scene.add(hemi);
    sun = new THREE.DirectionalLight(0xffffff, 0.72); sun.position.set(-26, 46, 30); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, { left: -42, right: 42, top: 42, bottom: -42, near: 1, far: 140 });
    sun.shadow.bias = -0.0006; scene.add(sun);
    mat('glass', { transparent: true, opacity: 0.22, depthWrite: false });
    mat('boardBack');
    statusMat.idle = new THREE.MeshBasicMaterial({ color: 0x2BBF73 });
    statusMat.work = new THREE.MeshBasicMaterial({ color: 0xFFB000 });
    statusMat.ask = new THREE.MeshBasicMaterial({ color: 0x3D86FF });
    mats.stOk = statusMat.idle;
    logoTex = new THREE.Texture(); mats.logoPanel = new THREE.MeshBasicMaterial({ map: logoTex });
    mats.logoScreen = new THREE.MeshBasicMaterial({ map: logoTex });
    if (opts.logo) {
      const img = new Image(); img.onload = () => {
        const c = document.createElement('canvas'); c.width = c.height = 512; const x = c.getContext('2d');
        x.fillStyle = '#FFFFFF'; x.fillRect(0, 0, 512, 512); x.drawImage(img, 36, 36, 440, 440 * img.height / img.width);
        logoTex.image = c; logoTex.needsUpdate = true; dirty = true;
      }; img.src = opts.logo;
    }
    box(xR - xL + 8, 0.2, (cz(2) - cz(0)) + D + 9, mat('ground'), (xL + xR) / 2, -0.1, 0, root, false);
    const byDept = {}; roster.nhan_su.forEach(s => (byDept[s.phong] = byDept[s.phong] || []).push(s.id));
    roster.phong.forEach(d => buildRoom(d, byDept[d.id] || []));
    buildFlow();
    ready = true;
    setTheme(theme);
    bindInput();
    new ResizeObserver(() => { const { w, h } = size(); renderer.setSize(w, h, false); fit(false); }).observe(stageEl);
    const { w, h } = size(); renderer.setSize(w, h, false); fit(false);
    requestAnimationFrame(frame);
    return true;
  }

  return {
    init, setTheme, setStatus, dispatch, focusRoom, fit, flash, project,
    setPadLeft(px) { padLeft = px; },
    zoomBy(f) { zoomGoal = THREE.MathUtils.clamp(zoomGoal * f, fitZoom * 0.7, 6); dirty = true; },
    redrawBoards() { if (ready) Object.values(rooms).forEach(drawBoard); },
    roomAnchor: id => rooms[id] && rooms[id].anchor,
    staffAnchor: id => staffObjs[id] && staffObjs[id].anchor(),
    onFrame: cb => (frameCb = cb), onPick: cb => (pickCb = cb), onHover: cb => (hoverCb = cb),
    get theme() { return theme; }, get ready() { return ready; }
  };
})();
