/* Sân khấu 3D của tour: mô hình căn hộ dựng từ bản vẽ mặt bằng (three.js r147).
 *  - "can-ho": nhìn toàn cảnh kiểu nhà búp bê, kéo để xoay 360° quanh căn hộ.
 *  - phòng: đứng ở tầm mắt trong phòng, kéo để nhìn quanh 360°; đi sang phòng khác qua cửa.
 * Toạ độ: X sang phải theo mặt bằng, Z xuống dưới theo mặt bằng, Y hướng lên (mét).
 * Hướng nhìn (yaw, độ): 0 = phía trên mặt bằng, 90 = bên phải.
 */
(function () {
  'use strict';

  var INK = 0x0b131b, SKY = 0xdde6ec, PITCH = -12;

  function Stage3D(container, M, opts) {
    var THREE = window.THREE;
    var W = M.size[0], D = M.size[1], H = M.wallHeight, EYE = M.eyeHeight;
    var center = new THREE.Vector3(W / 2, 0.4, D / 2);

    /* ---------- renderer & cảnh ---------- */
    var renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputEncoding = THREE.sRGBEncoding;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.className = 'stage3d-canvas';
    container.appendChild(renderer.domElement);
    var labels = document.createElement('div');
    labels.className = 'stage3d-labels';
    container.appendChild(labels);

    var scene = new THREE.Scene();
    scene.background = new THREE.Color(INK);
    var camera = new THREE.PerspectiveCamera(50, 1, 0.05, 200);

    scene.add(new THREE.HemisphereLight(0xffffff, 0xb8a993, 0.62));
    var sun = new THREE.DirectionalLight(0xfff1df, 0.85);
    sun.position.set(W / 2 - 5, 12, D / 2 - 7);
    sun.target.position.copy(center);
    sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048);
    sun.shadow.camera.left = -8; sun.shadow.camera.right = 8;
    sun.shadow.camera.top = 8; sun.shadow.camera.bottom = -8;
    sun.shadow.bias = -0.0005;
    scene.add(sun, sun.target);

    var texReady = false, texWait = [];
    var tex = new THREE.TextureLoader().load(M.floor, function () {
      texReady = true; dirty = true;
      texWait.splice(0).forEach(function (cb) { cb(); });
    });
    tex.encoding = THREE.sRGBEncoding;
    tex.anisotropy = renderer.capabilities.getMaxAnisotropy();

    // sàn dán ảnh mặt bằng
    var floor = new THREE.Mesh(new THREE.PlaneGeometry(W, D),
      new THREE.MeshStandardMaterial({ map: tex, roughness: 0.9 }));
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(W / 2, 0, D / 2);
    floor.receiveShadow = true;
    scene.add(floor);

    // nền quanh căn hộ (chỉ thấy khi nhìn toàn cảnh)
    var base = new THREE.Mesh(new THREE.PlaneGeometry(W + 1.2, D + 1.2),
      new THREE.MeshStandardMaterial({ color: 0x1b2833, roughness: 1 }));
    base.rotation.x = -Math.PI / 2;
    base.position.set(W / 2, -0.02, D / 2);
    base.receiveShadow = true;
    scene.add(base);

    /* hình hộp gộp: mỗi hộp [x, z, w, d, y0, y1]; uvPlan = chiếu ảnh mặt bằng từ trên xuống */
    function boxes(list, uvPlan, withTop, colors) {
      var pos = [], nor = [], uv = [], col = [], groups = { side: [], top: [] }, cur = null;
      function quad(a, b, c, d, n, kind) {
        var i = pos.length / 3;
        [a, b, c, d].forEach(function (p) {
          pos.push(p[0], p[1], p[2]); nor.push(n[0], n[1], n[2]);
          uv.push(uvPlan ? p[0] / W : 0, uvPlan ? 1 - p[2] / D : 0);
          if (cur) col.push(cur.r, cur.g, cur.b);
        });
        groups[kind].push(i, i + 1, i + 2, i, i + 2, i + 3);
      }
      list.forEach(function (b, bi) {
        if (colors) cur = new THREE.Color(colors[bi]).convertSRGBToLinear();
        var x0 = b[0], z0 = b[1], x1 = b[0] + b[2], z1 = b[1] + b[3], y0 = b[4], y1 = b[5];
        quad([x0, y1, z0], [x0, y1, z1], [x1, y1, z1], [x1, y1, z0], [0, 1, 0], 'top');
        quad([x0, y0, z1], [x1, y0, z1], [x1, y1, z1], [x0, y1, z1], [0, 0, 1], 'side');
        quad([x1, y0, z0], [x0, y0, z0], [x0, y1, z0], [x1, y1, z0], [0, 0, -1], 'side');
        quad([x0, y0, z0], [x0, y0, z1], [x0, y1, z1], [x0, y1, z0], [-1, 0, 0], 'side');
        quad([x1, y0, z1], [x1, y0, z0], [x1, y1, z0], [x1, y1, z1], [1, 0, 0], 'side');
        if (withTop === 'bottom') quad([x0, y0, z0], [x1, y0, z0], [x1, y0, z1], [x0, y0, z1], [0, -1, 0], 'side');
      });
      var g = new THREE.BufferGeometry();
      g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3));
      g.setAttribute('normal', new THREE.Float32BufferAttribute(nor, 3));
      g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2));
      if (colors) g.setAttribute('color', new THREE.Float32BufferAttribute(col, 3));
      g.setIndex(groups.side.concat(groups.top));
      g.addGroup(0, groups.side.length, 0);
      g.addGroup(groups.side.length, groups.top.length, 1);
      return g;
    }

    var wallMat = new THREE.MeshStandardMaterial({ color: 0xe9e2d6, roughness: 0.95 });
    var capMat = new THREE.MeshStandardMaterial({ color: 0x23282d, roughness: 0.8 });
    var wallList = M.walls.map(function (r) { return [r[0], r[1], r[2], r[3], 0, H]; });
    M.windows.forEach(function (w) {
      var r = w.rect;
      wallList.push([r[0], r[1], r[2], r[3], 0, w.sill], [r[0], r[1], r[2], r[3], w.top, H]);
    });
    M.doors.forEach(function (d) { var r = d.rect; wallList.push([r[0], r[1], r[2], r[3], d.top, H]); });
    var walls = new THREE.Mesh(boxes(wallList, false, 'bottom'), [wallMat, capMat]);
    walls.castShadow = true; walls.receiveShadow = true;
    scene.add(walls);

    // kính cửa sổ
    var glassMat = new THREE.MeshStandardMaterial({ color: 0xa9cbe0, transparent: true, opacity: 0.28, roughness: 0.1, metalness: 0.1, depthWrite: false });
    var glassList = M.windows.map(function (w) {
      var r = w.rect, thin = r[2] < r[3];
      return thin ? [r[0] + r[2] / 2 - 0.01, r[1], 0.02, r[3], w.sill, w.top] : [r[0], r[1] + r[3] / 2 - 0.01, r[2], 0.02, w.sill, w.top];
    });
    var glass = new THREE.Mesh(boxes(glassList, false), [glassMat, glassMat]);
    scene.add(glass);

    // đồ nội thất: hộp đùn từ mặt bằng, mặt trên mang đúng hình vẽ của bản vẽ
    // mặt trên mang hình vẽ của bản vẽ, mặt bên tô màu trung bình của món đồ
    var furnTop = new THREE.MeshStandardMaterial({ map: tex, roughness: 0.85 });
    var furnSide = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: 0.8 });
    var furn = new THREE.Mesh(boxes(M.furniture.map(function (f) {
      var r = f.rect; return [r[0], r[1], r[2], r[3], 0, f.h];
    }), true, false, M.furniture.map(function (f) { return f.color; })), [furnSide, furnTop]);
    furn.castShadow = true; furn.receiveShadow = true;
    scene.add(furn);

    // trần (chỉ khi đứng trong phòng)
    var ceiling = new THREE.Mesh(new THREE.PlaneGeometry(W, D), new THREE.MeshStandardMaterial({ color: 0xf4f1ea, roughness: 1 }));
    ceiling.rotation.x = Math.PI / 2;
    ceiling.position.set(W / 2, H, D / 2);
    ceiling.visible = false;
    scene.add(ceiling);

    /* ---------- camera & điều khiển ---------- */
    var mode = 'orbit';            // 'orbit' | 'fp' | 'move'
    var orbit = { r: Math.max(W, D) * 1.7, theta: -0.35, phi: 0.8 }, userZoom = false;
    // khoảng cách để cả căn hộ lọt khung, kể cả màn hình dọc của điện thoại
    function fitRadius(aspect) {
      var half = Math.min(25, Math.atan(Math.tan(25 * Math.PI / 180) * aspect) * 180 / Math.PI);
      return Math.hypot(W, D) / 2 / Math.tan(half * Math.PI / 180) * 1.05;
    }
    var offset = { x: 0, y: 0 };
    var fp = { pos: new THREE.Vector3(), yaw: 0, pitch: -6, fov: 72 };
    var auto = 0, dirty = true, visible = false, room = null, tween = null;

    function dir(yaw, pitch) {
      var y = yaw * Math.PI / 180, p = pitch * Math.PI / 180;
      return new THREE.Vector3(Math.sin(y) * Math.cos(p), Math.sin(p), -Math.cos(y) * Math.cos(p));
    }
    function orbitPose(o) {
      o = o || orbit;
      var pos = new THREE.Vector3(
        center.x + o.r * Math.sin(o.phi) * Math.sin(o.theta),
        center.y + o.r * Math.cos(o.phi),
        center.z + o.r * Math.sin(o.phi) * Math.cos(o.theta));
      return { pos: pos, look: center.clone(), fov: 50 };
    }
    function fpPose(p, yaw, pitch, fov) {
      return { pos: p.clone(), look: p.clone().add(dir(yaw, pitch)), fov: fov || fp.fov };
    }
    function eyeOf(id) { var e = M.rooms[id].eye; return new THREE.Vector3(e[0], EYE, e[1]); }
    function apply(pose) {
      camera.position.copy(pose.pos);
      camera.fov = pose.fov;
      camera.updateProjectionMatrix();
      camera.lookAt(pose.look);
      dirty = true;
    }
    function current() {
      if (mode === 'orbit') return orbitPose();
      return fpPose(fp.pos, fp.yaw, fp.pitch, fp.fov);
    }
    function ease(t) { return t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2; }

    // chuỗi khung hình chính; mỗi đoạn nội suy vị trí, điểm nhìn và góc mở
    function play(keys, done) {
      var from = current(), legs = [], t0 = performance.now();
      keys.forEach(function (k) {
        var prev = legs.length ? legs[legs.length - 1].to : from;
        legs.push({ from: prev, to: k.pose, ms: k.ms });
      });
      mode = 'move';
      tween = { legs: legs, i: 0, t0: t0, done: done };
    }
    function stepTween(now) {
      var L = tween.legs[tween.i], t = Math.min(1, (now - tween.t0) / L.ms), e = ease(t);
      apply({
        pos: L.from.pos.clone().lerp(L.to.pos, e),
        look: L.from.look.clone().lerp(L.to.look, e),
        fov: L.from.fov + (L.to.fov - L.from.fov) * e
      });
      if (t >= 1) {
        tween.i++;
        tween.t0 = now;
        if (tween.i >= tween.legs.length) {
          var d = tween.done;
          tween = null;
          if (d) d();
        }
      }
    }

    function setInside(on) {
      ceiling.visible = on;
      base.visible = !on;
      scene.background.set(on ? SKY : INK);
      dirty = true;
    }

    /* đi tới cảnh: 'can-ho' (toàn cảnh) hoặc id phòng */
    function go(id, o) {
      o = o || {};
      return new Promise(function (resolve) {
        var finish = function () { resolve(); dirty = true; };
        if (id === 'can-ho') {
          room = null;
          setLabels();
          if (o.instant) { mode = 'orbit'; setInside(false); apply(orbitPose()); finish(); return; }
          if (mode === 'orbit') { finish(); return; }
          setInside(false);
          var end = orbitPose();
          play([{ pose: end, ms: 1300 }], function () { mode = 'orbit'; finish(); });
          return;
        }
        var R = M.rooms[id];
        var target = fpPose(eyeOf(id), R.yaw, PITCH, 72);
        var fromRoom = room;
        room = id;
        setLabels();
        if (o.instant) {
          mode = 'fp'; setInside(true);
          fp.pos.copy(target.pos); fp.yaw = R.yaw; fp.pitch = PITCH; fp.fov = 72;
          apply(target); finish(); return;
        }
        var keys = [];
        var door = fromRoom && M.rooms[fromRoom].doors.filter(function (d) { return d.to === id; })[0];
        if (door && mode !== 'orbit') {
          // đi bộ theo lối cửa
          var pts = door.path.map(function (q) { return new THREE.Vector3(q[0], EYE, q[1]); }).concat([target.pos]);
          var prev = fp.pos.clone();
          pts.forEach(function (p, i) {
            var last = i === pts.length - 1;
            var heading = p.clone().sub(prev).setY(0);
            if (heading.lengthSq() < 1e-4) return;
            heading.normalize();
            var look = last ? target.look : p.clone().add(heading);
            var ms = Math.max(450, Math.min(1400, prev.distanceTo(p) * 520));
            keys.push({ pose: { pos: p.clone(), look: look, fov: 72 }, ms: ms });
            prev = p;
          });
          if (!keys.length) keys.push({ pose: target, ms: 600 });
        } else {
          // từ toàn cảnh hạ xuống phòng
          var above = target.pos.clone().add(new THREE.Vector3(0, H + 2.2, 0)).add(dir(R.yaw, 0).multiplyScalar(-1.6));
          keys.push({ pose: { pos: above, look: target.pos.clone().setY(0.4), fov: 60 }, ms: 900 });
          keys.push({ pose: target, ms: 900 });
        }
        setInside(false);
        var flipped = false;
        play(keys, function () {
          mode = 'fp'; fp.pos.copy(target.pos); fp.yaw = R.yaw; fp.pitch = PITCH; fp.fov = 72;
          setInside(true);
          finish();
        });
        // vào trong thì bật trần khi camera đã xuống dưới mức trần
        var watch = setInterval(function () {
          if (!tween) { clearInterval(watch); return; }
          if (!flipped && camera.position.y < H - 0.1) { flipped = true; setInside(true); }
        }, 30);
      });
    }

    /* ---------- nhãn & điểm nóng trong 3D ---------- */
    var marks = [];
    function setLabels() {
      labels.innerHTML = '';
      marks = [];
      var list = room ? M.rooms[room].doors.map(function (d) {
        return { to: d.to, kind: 'door', p: new THREE.Vector3(d.at[0], 1.25, d.at[1]) };
      }) : Object.keys(M.rooms).map(function (id) {
        var l = M.rooms[id].label;
        return { to: id, kind: 'room', p: new THREE.Vector3(l[0], H + 0.25, l[1]) };
      });
      list.forEach(function (m) {
        var el = opts.makeHotspot(m.kind, m.to);
        el.style.position = 'absolute';
        el.style.left = '0'; el.style.top = '0';
        labels.appendChild(el);
        marks.push({ el: el, p: m.p });
      });
      dirty = true;
    }
    var v = new THREE.Vector3();
    function placeLabels() {
      var w = container.clientWidth, h = container.clientHeight;
      marks.forEach(function (m) {
        v.copy(m.p).project(camera);
        var behind = v.z > 1 || v.z < -1 || Math.abs(v.x) > 1.3 || Math.abs(v.y) > 1.3;
        m.el.style.visibility = behind || mode === 'move' ? 'hidden' : 'visible';
        m.el.style.transform = 'translate(' + ((v.x + 1) / 2 * w).toFixed(1) + 'px,' + ((1 - v.y) / 2 * h).toFixed(1) + 'px)';
      });
    }

    /* ---------- tương tác ---------- */
    var ptrs = {}, last = null, pinch = null, moved = 0;
    var el = renderer.domElement;
    el.style.touchAction = 'none';
    el.addEventListener('pointerdown', function (e) {
      el.setPointerCapture(e.pointerId);
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      last = { x: e.clientX, y: e.clientY };
      moved = 0;
      if (Object.keys(ptrs).length === 2) pinch = spread();
      if (opts.onInteract) opts.onInteract();
    });
    function spread() {
      var p = Object.keys(ptrs).map(function (k) { return ptrs[k]; });
      return Math.hypot(p[0].x - p[1].x, p[0].y - p[1].y);
    }
    el.addEventListener('pointermove', function (e) {
      if (!ptrs[e.pointerId]) return;
      ptrs[e.pointerId] = { x: e.clientX, y: e.clientY };
      if (Object.keys(ptrs).length === 2) {
        var s = spread();
        if (pinch) zoom(pinch / s);
        pinch = s;
        return;
      }
      var dx = e.clientX - last.x, dy = e.clientY - last.y;
      last = { x: e.clientX, y: e.clientY };
      moved += Math.abs(dx) + Math.abs(dy);
      drag(dx, dy);
    });
    function up(e) {
      delete ptrs[e.pointerId];
      if (Object.keys(ptrs).length < 2) pinch = null;
      if (e.type === 'pointerup' && moved < 6 && mode === 'orbit') pick(e);
    }
    el.addEventListener('pointerup', up);
    el.addEventListener('pointercancel', up);
    el.addEventListener('wheel', function (e) {
      e.preventDefault();
      if (opts.onInteract) opts.onInteract();
      zoom(Math.pow(1.0015, e.deltaY));
    }, { passive: false });

    function drag(dx, dy) {
      if (mode === 'orbit') {
        orbit.theta -= dx * 0.006;
        orbit.phi = Math.max(0.12, Math.min(1.38, orbit.phi - dy * 0.005));
        apply(orbitPose());
      } else if (mode === 'fp') {
        var dpp = fp.fov / Math.max(200, container.clientHeight);
        fp.yaw -= dx * dpp;
        fp.pitch = Math.max(-80, Math.min(80, fp.pitch + dy * dpp));
        apply(current());
      }
    }
    function zoom(f) {
      if (mode === 'orbit') {
        userZoom = true;
        orbit.r = Math.max(5, Math.min(45, orbit.r * f));
        apply(orbitPose());
      } else if (mode === 'fp') {
        fp.fov = Math.max(35, Math.min(95, fp.fov * f));
        apply(current());
      }
    }
    // bấm vào sàn một phòng khi đang xem toàn cảnh -> vào phòng đó
    var ray = new THREE.Raycaster(), ndc = new THREE.Vector2();
    function pick(e) {
      var r = el.getBoundingClientRect();
      ndc.set((e.clientX - r.left) / r.width * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
      ray.setFromCamera(ndc, camera);
      var hit = ray.intersectObjects([floor, furn], false)[0];
      if (!hit) return;
      var x = hit.point.x, z = hit.point.z;
      Object.keys(M.rooms).some(function (id) {
        var inside = M.rooms[id].shape.some(function (s) { return x >= s[0] && x <= s[0] + s[2] && z >= s[1] && z <= s[1] + s[3]; });
        if (inside && opts.onPick) opts.onPick(id);
        return inside;
      });
    }

    /* ---------- vòng vẽ ---------- */
    var prevT = performance.now();
    function frame(now) {
      requestAnimationFrame(frame);
      var dt = Math.min(0.1, (now - prevT) / 1000);
      prevT = now;
      if (!visible) return;
      if (tween) stepTween(now);
      else if (auto) {
        if (mode === 'orbit') { orbit.theta += auto * 0.12 * dt; apply(orbitPose()); }
        else if (mode === 'fp') { fp.yaw += auto * 6 * dt; apply(current()); }
      }
      if (dirty) {
        renderer.render(scene, camera);
        placeLabels();
        dirty = false;
      }
    }
    function resize() {
      var w = container.clientWidth || window.innerWidth, h = container.clientHeight || window.innerHeight;
      renderer.setSize(w, h, false);
      renderer.domElement.style.width = '100%';
      renderer.domElement.style.height = '100%';
      camera.aspect = w / h;
      if (!userZoom) { orbit.r = fitRadius(w / h); if (mode === 'orbit') { camera.position.copy(orbitPose().pos); camera.lookAt(center); } }
      // dời tâm hình về giữa vùng không bị bảng điều khiển che
      if (offset.x || offset.y) camera.setViewOffset(w, h, -offset.x, -offset.y, w, h);
      else camera.clearViewOffset();
      camera.updateProjectionMatrix();
      dirty = true;
    }
    window.addEventListener('resize', resize);
    resize();
    apply(orbitPose());
    setLabels();
    requestAnimationFrame(frame);

    /* ảnh thu nhỏ của một cảnh (dùng cho dải cảnh) */
    function thumb(id, w, h) {
      var keep = { pos: camera.position.clone(), fov: camera.fov, aspect: camera.aspect, q: camera.quaternion.clone() };
      var size = renderer.getSize(new THREE.Vector2()), pr = renderer.getPixelRatio();
      var pose = id === 'can-ho' ? orbitPose({ r: orbit.r * 0.92, theta: -0.35, phi: 0.78 })
        : fpPose(eyeOf(id), M.rooms[id].yaw, PITCH - 4, 80);
      var inside = id !== 'can-ho';
      var wasCeil = ceiling.visible, wasBase = base.visible, bg = scene.background.getHex();
      ceiling.visible = inside; base.visible = !inside; scene.background.set(inside ? SKY : INK);
      renderer.setPixelRatio(1);
      renderer.setSize(w, h, false);
      camera.aspect = w / h;
      camera.clearViewOffset();
      apply(pose);
      renderer.render(scene, camera);
      var url = renderer.domElement.toDataURL('image/jpeg', 0.82);
      ceiling.visible = wasCeil; base.visible = wasBase; scene.background.setHex(bg);
      renderer.setPixelRatio(pr);
      renderer.setSize(size.x, size.y, false);
      camera.position.copy(keep.pos); camera.quaternion.copy(keep.q);
      camera.fov = keep.fov; camera.aspect = keep.aspect;
      resize();
      return url;
    }

    return {
      go: go,
      show: function (on) { visible = on; if (on) { resize(); dirty = true; } },
      setOffset: function (dx, dy) { offset.x = dx; offset.y = dy; resize(); },
      zoom: zoom,
      setAuto: function (speed) { auto = speed || 0; },
      isMoving: function () { return !!tween; },
      mode: function () { return mode; },
      yaw: function () { return fp.yaw; },
      thumb: function (id, w, h) { try { return thumb(id, w, h); } catch (e) { return null; } },
      resize: resize,
      textureReady: function (cb) { if (texReady) cb(); else texWait.push(cb); }
    };
  }

  window.Stage3D = Stage3D;
})();
