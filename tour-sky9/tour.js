/* Tour 360° căn hộ CT1-11.10 · Sky9
 * Đi từ rộng đến hẹp: bản đồ vị trí → phối cảnh dự án → mặt bằng căn hộ → từng phòng.
 * Dữ liệu cảnh nằm trong data.js (tạo bởi tools/build.py).
 */
(function () {
  'use strict';
  var T = window.TOUR;
  var byId = {};
  T.scenes.forEach(function (s) { byId[s.id] = s; });
  var order = T.scenes.map(function (s) { return s.id; });
  var FLY = 800;

  /* ---------- tiện ích ---------- */
  function $(id) { return document.getElementById(id); }
  function h(tag, attrs, kids) {
    var e = document.createElement(tag);
    if (attrs) Object.keys(attrs).forEach(function (k) {
      var v = attrs[k];
      if (v == null || v === false) return;
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k === 'text') e.textContent = v;
      else if (k.slice(0, 2) === 'on') e.addEventListener(k.slice(2), v);
      else e.setAttribute(k, v === true ? '' : v);
    });
    (kids || []).forEach(function (c) { if (c != null) e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c); });
    return e;
  }
  function m2(v) { return v.toFixed(2).replace('.', ',') + ' m²'; }
  var ICON = {
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    rotate: '<path d="M21 12a9 9 0 1 1-3-6.7"/><path d="M21 4v5h-5"/>',
    play: '<path d="M7 5l12 7-12 7z"/>',
    pause: '<path d="M8 5v14M16 5v14"/>',
    expand: '<path d="M4 9V4h5M20 9V4h-5M4 15v5h5M20 15v5h-5"/>',
    shrink: '<path d="M9 4v5H4M15 4v5h5M9 20v-5H4M15 20v-5h5"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
    video: '<rect x="3" y="6" width="13" height="12" rx="2"/><path d="M16 10l5-3v10l-5-3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v6M12 7.5v.5"/>',
    gyro: '<rect x="7" y="3" width="10" height="18" rx="2"/><path d="M3 9c-1 2-1 4 0 6M21 9c1 2 1 4 0 6"/>',
    up: '<path d="M6 15l6-6 6 6"/>',
    down: '<path d="M6 9l6 6 6-6"/>',
    enter: '<path d="M12 4v12M6 11l6 6 6-6"/><path d="M5 20h14"/>',
    arrow: '<path d="M5 12h13M13 6l6 6-6 6"/>',
    close: '<path d="M6 6l12 12M18 6L6 18"/>',
    layers: '<path d="M12 3l9 5-9 5-9-5z"/><path d="M3 13l9 5 9-5"/>'
  };
  function icon(name) {
    return '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">' + ICON[name] + '</svg>';
  }
  function once(fn) { var done = false; return function () { if (!done) { done = true; fn(); } }; }

  /* ---------- quan hệ giữa các cảnh ---------- */
  var parentOf = {};
  T.scenes.forEach(function (s) {
    if (s.level === 1) return;
    var p = T.scenes.filter(function (o) {
      return o.level === s.level - 1 && o.hotspots.some(function (hs) { return hs.to === s.id; });
    })[0] || T.scenes.filter(function (o) { return o.level === s.level - 1; })[0];
    parentOf[s.id] = p && p.id;
  });
  function ancestors(id) {
    var out = [];
    while (parentOf[id]) { id = parentOf[id]; out.unshift(id); }
    return out;
  }
  // điểm nóng trong cảnh `sid` dẫn tới `target` hoặc tới tổ tiên của nó
  function linkToward(sid, target) {
    var chain = ancestors(target).concat([target]);
    return byId[sid].hotspots.filter(function (hs) {
      return hs.kind !== 'info' && chain.indexOf(hs.to) !== -1;
    })[0];
  }

  var levelName = {};
  T.levels.forEach(function (l) { levelName[l.id] = l.name; });
  var cardCompact = window.matchMedia('(max-width: 760px)').matches;

  /* ---------- trạng thái ---------- */
  var current = null, busy = false, arriveAt = null, autoplay = false, autoTimer = null, rotating = false;
  var hashScene = decodeURIComponent(location.hash.slice(1));
  var first = byId[hashScene] ? hashScene : T.firstScene;

  /* ---------- điểm nóng ---------- */
  function renderHotspot(div, args) {
    var hs = args.hs;
    var hit = h('div', { class: 'hs-hit', tabindex: '0', role: 'button' });
    var label;
    if (hs.kind === 'info') {
      hit.setAttribute('aria-label', hs.label + '. ' + (hs.text || ''));
      hit.innerHTML = '<span class="hs-core">i</span>';
      hit.appendChild(h('span', { class: 'hs-pop' }, [h('b', { text: hs.label }), h('span', { text: hs.text || '' })]));
    } else if (hs.kind === 'room') {
      hit.setAttribute('aria-label', 'Vào ' + hs.label + ', ' + hs.sub);
      hit.appendChild(h('span', { class: 'hs-core' }, [h('span', { class: 'dot' }), h('b', { text: byId[hs.to].crumb }), h('small', { text: hs.sub })]));
    } else if (hs.kind === 'door') {
      hit.setAttribute('aria-label', 'Sang ' + hs.label);
      hit.appendChild(h('span', { class: 'hs-core', html: icon('arrow') }));
      label = h('span', { class: 'hs-label', text: hs.label });
      hit.appendChild(label);
    } else {
      hit.setAttribute('aria-label', hs.label + (hs.sub ? ', ' + hs.sub : ''));
      hit.appendChild(h('span', { class: 'hs-core', html: icon('enter') }));
      label = h('span', { class: 'hs-label' }, [hs.label, hs.sub ? h('small', { text: hs.sub }) : null]);
      hit.appendChild(label);
    }
    hit.addEventListener('keydown', function (e) {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onHotspot(e, args); }
    });
    div.appendChild(hit);
    args.div = div;
  }
  function onHotspot(e, args) {
    var hs = args.hs;
    if (hs.kind === 'info') {
      var open = args.div.classList.contains('open');
      closeTips();
      if (!open) args.div.classList.add('open');
      return;
    }
    stopAutoplay();
    go(hs.to, { via: hs });
  }
  function closeTips() {
    Array.prototype.forEach.call(document.querySelectorAll('.hs-info.open'), function (d) { d.classList.remove('open'); });
  }

  /* ---------- trình xem ----------
   * Mặt bằng căn hộ và các phòng chưa có ảnh 360° thật dùng chung MỘT cảnh Pannellum
   * (PLAN): đổi phòng chỉ đổi giới hạn khung nhìn + điểm nóng và bay camera, không tải lại ảnh. */
  var PLAN = '__plan';
  var BOUNDS = ['minYaw', 'maxYaw', 'minPitch', 'maxPitch', 'minHfov', 'maxHfov', 'yaw', 'pitch', 'hfov'];
  function pannId(id) { return byId[id].mode === 'plan' ? PLAN : id; }
  function hsObjects(id) {
    return byId[id].hotspots.map(function (hs, i) {
      var args = { hs: hs, scene: id };
      return {
        id: id + ':' + i, pitch: hs.pitch, yaw: hs.yaw, type: 'info', cssClass: 'hs hs-' + hs.kind,
        createTooltipFunc: renderHotspot, createTooltipArgs: args,
        clickHandlerFunc: onHotspot, clickHandlerArgs: args
      };
    });
  }
  var scenes = {};
  T.scenes.forEach(function (s) {
    if (s.mode === 'plan') {
      if (!scenes[PLAN]) scenes[PLAN] = Object.assign({}, s.pannellum, { hotSpots: [] });
    } else {
      scenes[s.id] = Object.assign({}, s.pannellum, { hotSpots: hsObjects(s.id) });
    }
  });
  // chuẩn bị cảnh PLAN cho phòng `id` trước khi loadScene
  function preparePlan(id) {
    var p = byId[id].pannellum, sc = scenes[PLAN];
    BOUNDS.forEach(function (k) { sc[k] = p[k]; });
    sc.hotSpots = hsObjects(id);
  }
  if (byId[first].mode === 'plan') preparePlan(first);
  // dựng sẵn khung giao diện để tính vùng trống cho khung nhìn đầu tiên
  renderCrumbs(byId[first]);
  renderCard(byId[first]);
  buildStrip();
  (function () {
    var v0 = viewFor(first), sc = scenes[pannId(first)];
    sc.yaw = v0.yaw; sc.pitch = v0.pitch; sc.hfov = v0.hfov;
  })();

  var viewer = pannellum.viewer('pano', {
    default: {
      firstScene: pannId(first), sceneFadeDuration: 650, autoLoad: true, showControls: false,
      friction: 0.15, keyboardZoom: true, mouseZoom: true,
      strings: {
        loadingLabel: 'Đang tải…', loadButtonLabel: 'Bấm để tải ảnh',
        genericWebGLError: 'Trình duyệt không hỗ trợ WebGL nên không hiển thị được ảnh 360°.',
        fileAccessError: 'Không mở được tệp %s.', noPanoramaError: 'Chưa có ảnh cho cảnh này.',
        malformedURLError: 'Đường dẫn ảnh không hợp lệ.', unknownError: 'Lỗi không xác định.',
        textureSizeError: 'Ảnh quá lớn so với card đồ hoạ của thiết bị (%s px, tối đa %s px).',
        iOS8WebGLError: 'iOS 8 không hỗ trợ WebGL đầy đủ, hãy cập nhật trình duyệt.'
      }
    },
    scenes: scenes
  });

  window.tourViewer = viewer; // để nhúng/gỡ lỗi từ bên ngoài

  /* ---------- điều hướng ---------- */
  function relaxToFullPlan() {
    var p = T.plan;
    viewer.setYawBounds([-p.haov / 2, p.haov / 2]);
    viewer.setPitchBounds([-p.vaov / 2, p.vaov / 2]);
    viewer.setHfovBounds([0.5, p.haov]);
  }
  function fly(pitch, yaw, hfov, done) {
    var fin = once(done);
    viewer.lookAt(pitch, yaw, hfov, FLY, fin);
    setTimeout(fin, FLY + 250);
  }
  var pending = null, switching = false;
  // tâm vùng màn hình không bị bảng điều khiển che (so với tâm khung xem)
  function freeCenter() {
    var W = innerWidth, H = innerHeight, L = 0, R = W, Tp = 0, B = H;
    var tl = document.querySelector('.top-left').getBoundingClientRect();
    var tb = $('toolbar').getBoundingClientRect(), st = $('strip');
    if (W > 760) L = Math.max(L, tl.right); else Tp = Math.max(Tp, tl.bottom);
    R = Math.min(R, tb.left);
    if (!st.classList.contains('collapsed')) B = Math.min(B, st.getBoundingClientRect().top);
    return { dx: (L + R) / 2 - W / 2, dy: (Tp + B) / 2 - H / 2 };
  }
  // khung nhìn khởi đầu của cảnh, dời để chủ thể nằm giữa vùng trống
  function viewFor(id) {
    var s = byId[id], p = s.pannellum, W = innerWidth, H = innerHeight;
    var yaw = p.yaw, pitch = p.pitch, hf = p.hfov;
    // giống Pannellum (avoidShowingBackground): chiều dọc của khung nhìn không vượt quá ảnh
    var fit = 2 * Math.atan(Math.tan((p.maxPitch - p.minPitch) * Math.PI / 360) * W / H) * 180 / Math.PI;
    hf = Math.max(Math.min(hf, fit), p.minHfov || 1);
    var main = s.hotspots.filter(function (x) { return x.kind === 'link'; })[0];
    if (W <= 760 && main) { yaw = main.yaw; pitch = main.pitch; }
    var c = freeCenter();
    var vf = 2 * Math.atan(Math.tan(hf * Math.PI / 360) * H / W) * 180 / Math.PI;
    return { yaw: yaw - c.dx / W * hf, pitch: pitch + c.dy / H * vf, hfov: hf };
  }
  function load(to, view) {
    view = view || {};
    if (spot) spot.classList.remove('on');
    arriveAt = view.arrive ? to : null;
    pending = to;
    if (pannId(to) === PLAN) preparePlan(to);
    if (view.pitch === undefined) view = Object.assign(viewFor(to), view);
    viewer.loadScene(pannId(to), view.pitch, view.yaw, view.hfov);
  }
  function commit(id) {
    current = id;
    updateUI();
    if (decodeURIComponent(location.hash.slice(1)) !== id) {
      try { location.hash = id; } catch (e) { /* bỏ qua */ }
    }
  }
  // đổi phòng ngay trên cảnh PLAN đang mở
  function switchPlan(to) {
    var tp = byId[to].pannellum, tv = viewFor(to);
    switching = true;
    viewer.getConfig().hotSpots.slice().forEach(function (o) { viewer.removeHotSpot(o.id); });
    relaxToFullPlan();
    fly(tv.pitch, tv.yaw, tv.hfov, function () {
      viewer.setHfovBounds([tp.minHfov, tp.maxHfov]);
      viewer.setYawBounds([tp.minYaw, tp.maxYaw]);
      viewer.setPitchBounds([tp.minPitch, tp.maxPitch]);
      hsObjects(to).forEach(function (o) { viewer.addHotSpot(o); });
      switching = false;
      commit(to);
      busy = false;
      afterArrive();
    });
  }
  function go(to, opt) {
    opt = opt || {};
    if (!byId[to] || to === current) return;
    if (busy) return;
    var cur = byId[current], tgt = byId[to];
    busy = true;
    closeTips();
    stopRotate();
    closeDrawers();
    var via = opt.via && opt.via.to === to ? opt.via : linkToward(current, to);
    var tp = tgt.pannellum;
    if (pannId(current) === PLAN && pannId(to) === PLAN) {
      switchPlan(to);
    } else if (via) {
      var zoom = Math.max(viewer.getHfov() / 3.2, cur.pannellum.minHfov || 10);
      fly(via.pitch, via.yaw, zoom, function () { load(to); });
    } else {
      var back = linkToward(to, current);
      if (back && ancestors(current).indexOf(to) !== -1) {
        // lên cấp: mở cảnh cha ở vị trí điểm nóng rồi lùi ra toàn cảnh
        load(to, { pitch: back.pitch, yaw: back.yaw, hfov: Math.max(tp.hfov / 3.2, tp.minHfov || 10), arrive: true });
      } else {
        load(to);
      }
    }
  }
  function goUp() { if (parentOf[current]) { stopAutoplay(); go(parentOf[current]); } }

  viewer.on('scenechange', function () { if (pending) { commit(pending); pending = null; } });
  viewer.on('load', function () {
    busy = false;
    if (arriveAt === current) {
      arriveAt = null;
      var p = viewFor(current);
      busy = true;
      fly(p.pitch, p.yaw, p.hfov, function () { busy = false; afterArrive(); });
    } else {
      afterArrive();
    }
  });
  viewer.on('error', function (msg) {
    busy = false;
    toast('Không tải được cảnh: ' + msg);
  });
  window.addEventListener('hashchange', function () {
    var id = decodeURIComponent(location.hash.slice(1));
    if (byId[id] && id !== current) { stopAutoplay(); go(id); }
  });
  current = first;

  /* ---------- giao diện ---------- */

  function updateUI() {
    var s = byId[current];
    renderCrumbs(s);
    renderCard(s);
    Array.prototype.forEach.call(document.querySelectorAll('.thumb'), function (b) {
      var on = b.dataset.scene === current;
      b.setAttribute('aria-current', on ? 'true' : 'false');
      if (on && b.scrollIntoView) {
        var sc = $('strip-scroll'), r = b.getBoundingClientRect(), rs = sc.getBoundingClientRect();
        if (r.left < rs.left || r.right > rs.right) sc.scrollBy({ left: r.left - rs.left - rs.width / 2 + r.width / 2, behavior: 'smooth' });
      }
    });
    var showMap = s.level >= 3;
    $('minimap').hidden = !showMap;
    Array.prototype.forEach.call(document.querySelectorAll('.mm-room'), function (r) {
      r.classList.toggle('active', r.dataset.scene === current);
    });
    var pin = $('mm-pin');
    if (s.room) { pin.setAttribute('cx', s.pin[0]); pin.setAttribute('cy', s.pin[1]); pin.style.display = ''; }
    else pin.style.display = 'none';
    document.title = s.title + ' · ' + T.unit.code + ' Sky9';
  }

  function renderCrumbs(s) {
    var nav = $('crumbs');
    nav.innerHTML = '';
    var chain = ancestors(s.id).concat([s.id]);
    chain.forEach(function (id, i) {
      if (i) nav.appendChild(h('span', { class: 'crumb-sep', 'aria-hidden': 'true', text: '›' }));
      var last = i === chain.length - 1;
      nav.appendChild(h('button', {
        class: 'crumb', text: byId[id].crumb, 'aria-current': last ? 'page' : null,
        onclick: last ? null : function () { stopAutoplay(); go(id); }
      }));
    });
  }

  function renderCard(s) {
    var card = $('card');
    card.innerHTML = '';
    card.classList.toggle('compact', cardCompact);
    card.appendChild(h('button', {
      class: 'card-toggle', 'aria-label': cardCompact ? 'Mở rộng mô tả' : 'Thu gọn mô tả', html: icon('up'),
      onclick: function () { cardCompact = !cardCompact; renderCard(byId[current]); }
    }));
    card.appendChild(h('div', { class: 'card-eyebrow' }, [
      h('span', { class: 'lvl', text: 'Cấp ' + s.level + '/4' }), h('span', { text: levelName[s.level] })
    ]));
    card.appendChild(h('h1', { text: s.title }));
    var meta = h('div', { class: 'card-meta' });
    if (s.room) {
      meta.appendChild(h('span', { class: 'chip area', text: m2(s.area) }));
      meta.appendChild(s.mode === 'pano'
        ? h('span', { class: 'chip real', text: 'Ảnh 360° thực tế' })
        : h('span', { class: 'chip plan', text: 'Phối cảnh mặt bằng' }));
    } else if (s.id === 'can-ho') {
      meta.appendChild(h('span', { class: 'chip area', text: m2(T.unit.areaCenterLine) }));
      meta.appendChild(h('span', { class: 'chip', text: T.unit.bedrooms + ' PN · ' + T.unit.bathrooms + ' WC' }));
      meta.appendChild(h('span', { class: 'chip', text: T.unit.type }));
    }
    if (meta.childNodes.length) card.appendChild(meta);
    if (s.lead) card.appendChild(h('p', { text: s.lead }));
    if (s.room && s.mode !== 'pano') {
      card.appendChild(h('p', { class: 'note', text: 'Ảnh 360° chụp thực tế của phòng sẽ thay vào đây khi ghép xong từ video quay căn hộ.' }));
    }
    var actions = h('div', { class: 'card-actions' });
    var next = s.hotspots.filter(function (x) { return x.kind === 'link'; })[0];
    if (next) {
      actions.appendChild(h('button', { class: 'btn primary', html: icon('enter') + '<span>' + next.sub + '</span>',
        onclick: function () { stopAutoplay(); go(next.to, { via: next }); } }));
    }
    if (s.id === 'can-ho') {
      var firstRoom = T.scenes.filter(function (x) { return x.room; })[0];
      actions.appendChild(h('button', { class: 'btn primary', html: icon('enter') + '<span>Vào ' + firstRoom.title.toLowerCase() + '</span>',
        onclick: function () { stopAutoplay(); go(firstRoom.id); } }));
    }
    if (s.room) {
      (s.neighbors || []).forEach(function (n) {
        actions.appendChild(h('button', { class: 'btn', html: icon('arrow') + '<span>' + byId[n].crumb + '</span>',
          onclick: function () { stopAutoplay(); go(n); } }));
      });
    }
    if (parentOf[s.id]) {
      actions.appendChild(h('button', { class: 'btn', html: icon('up') + '<span>' + byId[parentOf[s.id]].crumb + '</span>',
        'aria-label': 'Lên cấp: ' + byId[parentOf[s.id]].title, onclick: goUp }));
    }
    card.appendChild(actions);
  }

  /* dải cảnh theo cấp độ */
  function buildStrip() {
    var sc = $('strip-scroll');
    T.levels.forEach(function (l) {
      var items = T.scenes.filter(function (s) { return s.level === l.id; });
      if (!items.length) return;
      var row = h('div', { class: 'strip-items' });
      items.forEach(function (s) {
        row.appendChild(h('button', {
          class: 'thumb', 'data-scene': s.id, 'aria-current': 'false', title: s.title,
          onclick: function () { stopAutoplay(); go(s.id); }
        }, [h('img', { src: s.thumb, alt: '', loading: 'lazy', width: '320', height: '200' }),
            h('span', { text: s.room ? s.crumb + ' · ' + s.area.toFixed(1).replace('.', ',') : s.crumb })]));
      });
      sc.appendChild(h('div', { class: 'strip-group' }, [
        h('div', { class: 'strip-label' }, [h('b', { text: String(l.id) }), l.name]), row
      ]));
    });
    var tg = $('strip-toggle');
    function setStrip(open) {
      $('strip').classList.toggle('collapsed', !open);
      $('app').classList.toggle('strip-collapsed', !open);
      tg.setAttribute('aria-expanded', open ? 'true' : 'false');
      tg.innerHTML = icon('down') + '<span>' + (open ? 'Ẩn danh sách cảnh' : 'Danh sách cảnh') + '</span>';
    }
    tg.addEventListener('click', function () { setStrip($('strip').classList.contains('collapsed')); });
    setStrip(true);
  }

  /* làm tối phần ngoài phòng đang đứng (khi xem phòng trên mặt bằng) */
  var spot, spotHoles;
  function buildSpot() {
    var NS = 'http://www.w3.org/2000/svg';
    spot = document.createElementNS(NS, 'svg');
    spot.setAttribute('class', 'spot');
    spot.setAttribute('aria-hidden', 'true');
    spot.innerHTML = '<defs><mask id="spot-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">' +
      '<rect width="100%" height="100%" fill="#fff"/><g id="spot-holes" fill="#000"></g></mask></defs>' +
      '<rect class="spot-dim" width="100%" height="100%" mask="url(#spot-mask)"/>';
    var rc = document.querySelector('#pano .pnlm-render-container') || $('pano');
    rc.appendChild(spot);
    spotHoles = spot.querySelector('#spot-holes');
  }
  // chiếu điểm (x, y) của ảnh mặt bằng gốc lên màn hình theo hướng nhìn hiện tại
  function camera() {
    var c = viewer.getRenderer().getCanvas();
    var W = c.clientWidth || c.width, H = c.clientHeight || c.height;
    var th = Math.tan(viewer.getHfov() * Math.PI / 360), tv = th * H / W;
    var Y = viewer.getYaw() * Math.PI / 180, Pp = viewer.getPitch() * Math.PI / 180;
    return {
      W: W, H: H, th: th, tv: tv,
      f: [Math.sin(Y) * Math.cos(Pp), Math.sin(Pp), Math.cos(Y) * Math.cos(Pp)],
      r: [Math.cos(Y), 0, -Math.sin(Y)],
      u: [-Math.sin(Y) * Math.sin(Pp), Math.cos(Pp), -Math.cos(Y) * Math.sin(Pp)]
    };
  }
  function planToScreen(cam, x, y) {
    var P = T.plan;
    var pu = ((x - P.crop[0]) * P.scale / P.W - 0.5) * 2 * P.tx;
    var pv = (0.5 - (y - P.crop[1]) * P.scale / P.H) * 2 * P.ty;
    var d = [pu, pv, 1];
    var dot = function (a) { return d[0] * a[0] + d[1] * a[1] + d[2] * a[2]; };
    var z = Math.max(dot(cam.f), 1e-3);
    return [cam.W / 2 * (1 + dot(cam.r) / z / cam.th), cam.H / 2 * (1 - dot(cam.u) / z / cam.tv)];
  }
  function drawSpot(s) {
    if (!spot) return;
    if (!(s.room && s.mode === 'plan')) { spot.classList.remove('on'); return; }
    var cam = camera();
    spotHoles.innerHTML = s.shapePx.map(function (r) {
      return '<polygon points="' + [[r[0], r[1]], [r[2], r[1]], [r[2], r[3]], [r[0], r[3]]].map(function (q) {
        var p = planToScreen(cam, q[0], q[1]);
        return p[0].toFixed(1) + ',' + p[1].toFixed(1);
      }).join(' ') + '"/>';
    }).join('');
    spot.classList.add('on');
  }

  /* bản đồ nhỏ */
  var mmView, mmCone;
  function buildMinimap() {
    $('mm-img').src = T.minimap;
    var svg = $('mm-svg'), NS = 'http://www.w3.org/2000/svg';
    T.scenes.filter(function (s) { return s.room; }).forEach(function (s) {
      var g = document.createElementNS(NS, 'g');
      g.setAttribute('class', 'mm-room');
      g.dataset.scene = s.id;
      g.setAttribute('role', 'button');
      g.setAttribute('tabindex', '0');
      g.setAttribute('aria-label', s.title + ', ' + m2(s.area));
      s.shape.forEach(function (r) {
        var rect = document.createElementNS(NS, 'rect');
        rect.setAttribute('x', r[0]); rect.setAttribute('y', r[1]);
        rect.setAttribute('width', r[2] - r[0]); rect.setAttribute('height', r[3] - r[1]);
        g.appendChild(rect);
      });
      var t = document.createElementNS(NS, 'title');
      t.textContent = s.title + ' · ' + m2(s.area);
      g.appendChild(t);
      g.addEventListener('click', function () { stopAutoplay(); go(s.id); });
      g.addEventListener('keydown', function (e) { if (e.key === 'Enter') { stopAutoplay(); go(s.id); } });
      svg.appendChild(g);
    });
    mmView = document.createElementNS(NS, 'polygon');
    mmView.setAttribute('class', 'mm-view');
    svg.appendChild(mmView);
    mmCone = document.createElementNS(NS, 'path');
    mmCone.setAttribute('class', 'mm-cone');
    svg.appendChild(mmCone);
    var pin = document.createElementNS(NS, 'ellipse');
    pin.id = 'mm-pin';
    pin.setAttribute('class', 'mm-pin');
    var mc = T.plan.minimapCrop, ar = (mc[2] - mc[0]) / (mc[3] - mc[1]);
    pin.setAttribute('rx', 2.2); pin.setAttribute('ry', 2.2 * ar);
    svg.appendChild(pin);
    requestAnimationFrame(trackView);
  }
  // khung nhìn hiện tại vẽ lên bản đồ nhỏ
  var lastKey = '';
  function trackView() {
    requestAnimationFrame(trackView);
    if (!current || !viewer.isLoaded()) return;
    var s = byId[current], yaw = viewer.getYaw(), pitch = viewer.getPitch(), hf = viewer.getHfov();
    var c0 = viewer.getRenderer().getCanvas();
    var key = current + yaw.toFixed(2) + pitch.toFixed(2) + hf.toFixed(2) + c0.width + 'x' + c0.height + (switching ? 's' : '');
    if (key === lastKey) return;
    lastKey = key;
    if (switching) spot && spot.classList.remove('on'); else drawSpot(s);
    if ($('minimap').hidden) return;
    var P = T.plan, mc = P.minimapCrop;
    if (s.mode === 'plan') {
      // tia qua 4 góc màn hình cắt mặt phẳng ảnh z=1 -> toạ độ trên mặt bằng
      var c = viewer.getRenderer().getCanvas(), aspect = c.width / c.height;
      var th = Math.tan(hf * Math.PI / 360), tv = th / aspect;
      var Y = yaw * Math.PI / 180, Pp = pitch * Math.PI / 180;
      var f = [Math.sin(Y) * Math.cos(Pp), Math.sin(Pp), Math.cos(Y) * Math.cos(Pp)];
      var r = [Math.cos(Y), 0, -Math.sin(Y)];
      var u = [-Math.sin(Y) * Math.sin(Pp), Math.cos(Pp), -Math.cos(Y) * Math.sin(Pp)];
      var pts = [[-1, 1], [1, 1], [1, -1], [-1, -1]].map(function (k) {
        var d = [0, 1, 2].map(function (i) { return f[i] + k[0] * th * r[i] + k[1] * tv * u[i]; });
        var z = Math.max(d[2], 1e-3), pu = d[0] / z, pv = d[1] / z;
        var x0 = P.crop[0] + (pu / (2 * P.tx) + 0.5) * P.W / P.scale;
        var y0 = P.crop[1] + (0.5 - pv / (2 * P.ty)) * P.H / P.scale;
        return ((x0 - mc[0]) / (mc[2] - mc[0]) * 100).toFixed(2) + ',' + ((y0 - mc[1]) / (mc[3] - mc[1]) * 100).toFixed(2);
      });
      mmView.setAttribute('points', pts.join(' '));
      mmView.style.display = '';
      mmCone.style.display = 'none';
    } else if (s.mode === 'pano' && s.room) {
      var north = s.pannellum.northOffset || 0;
      var dir = (yaw - north) * Math.PI / 180, half = hf * Math.PI / 360, r = 9;
      var ar = (mc[2] - mc[0]) / (mc[3] - mc[1]);
      var cx = s.pin[0], cy = s.pin[1];
      var ax = cx + r * Math.sin(dir - half), ay = cy - r * ar * Math.cos(dir - half);
      var bx = cx + r * Math.sin(dir + half), by = cy - r * ar * Math.cos(dir + half);
      mmCone.setAttribute('d', 'M' + cx + ' ' + cy + 'L' + ax.toFixed(2) + ' ' + ay.toFixed(2) + 'L' + bx.toFixed(2) + ' ' + by.toFixed(2) + 'Z');
      mmCone.style.display = '';
      mmView.style.display = 'none';
    } else {
      mmView.style.display = mmCone.style.display = 'none';
    }
  }

  /* thanh công cụ */
  var tools = {};
  function addTool(id, iconName, label, onClick, pressed) {
    var b = h('button', { class: 'tool', id: 'tool-' + id, 'aria-label': label, html: icon(iconName) + '<span class="tip">' + label + '</span>', onclick: onClick });
    if (pressed !== undefined) b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
    $('toolbar').appendChild(b);
    tools[id] = b;
    return b;
  }
  function setTool(id, iconName, label, pressed) {
    var b = tools[id];
    b.innerHTML = icon(iconName) + '<span class="tip">' + label + '</span>';
    b.setAttribute('aria-label', label);
    if (pressed !== undefined) b.setAttribute('aria-pressed', pressed ? 'true' : 'false');
  }
  function sep() { $('toolbar').appendChild(h('div', { class: 'tool-sep', 'aria-hidden': 'true' })); }

  function buildToolbar() {
    addTool('in', 'plus', 'Phóng to', function () { viewer.setHfov(viewer.getHfov() / 1.4, 300); });
    addTool('out', 'minus', 'Thu nhỏ', function () { viewer.setHfov(viewer.getHfov() * 1.4, 300); });
    sep();
    addTool('rotate', 'rotate', 'Tự xoay', function () { rotating ? stopRotate() : startRotate(); }, false);
    addTool('play', 'play', 'Tham quan tự động', function () { autoplay ? stopAutoplay() : startAutoplay(); }, false);
    if (viewer.isOrientationSupported && viewer.isOrientationSupported()) {
      addTool('gyro', 'gyro', 'Xoay theo điện thoại', function () {
        if (viewer.isOrientationActive()) { viewer.stopOrientation(); tools.gyro.setAttribute('aria-pressed', 'false'); }
        else { viewer.startOrientation(); tools.gyro.setAttribute('aria-pressed', 'true'); }
      }, false);
    }
    addTool('full', 'expand', 'Toàn màn hình', toggleFullscreen);
    sep();
    addTool('video', 'video', 'Video thực tế', function () { openDrawer('drawer-video'); });
    addTool('info', 'info', 'Thông tin căn hộ', function () { openDrawer('drawer-info'); });
    addTool('share', 'link', 'Sao chép liên kết cảnh này', share);
  }

  function startRotate() {
    rotating = true;
    viewer.startAutoRotate(-3);
    setTool('rotate', 'rotate', 'Dừng tự xoay', true);
  }
  function stopRotate() {
    if (!rotating) return;
    rotating = false;
    viewer.stopAutoRotate();
    setTool('rotate', 'rotate', 'Tự xoay', false);
  }
  function startAutoplay() {
    autoplay = true;
    setTool('play', 'pause', 'Dừng tham quan tự động', true);
    hideHint();
    if (current === order[order.length - 1]) { busy = false; go(order[0]); }
    else scheduleNext();
  }
  function stopAutoplay() {
    if (!autoplay) return;
    autoplay = false;
    clearTimeout(autoTimer);
    stopRotate();
    setTool('play', 'play', 'Tham quan tự động', false);
  }
  function scheduleNext() {
    clearTimeout(autoTimer);
    startRotate();
    autoTimer = setTimeout(function () {
      stopRotate();
      var i = order.indexOf(current);
      if (i < order.length - 1) go(order[i + 1]);
      else stopAutoplay();
    }, 6500);
  }
  function afterArrive() { if (autoplay) scheduleNext(); }

  function toggleFullscreen() {
    var d = document, el = d.documentElement;
    var active = d.fullscreenElement || d.webkitFullscreenElement;
    try {
      var p = active ? (d.exitFullscreen || d.webkitExitFullscreen).call(d) : (el.requestFullscreen || el.webkitRequestFullscreen).call(el);
      if (p && p.catch) p.catch(function () { toast('Trình duyệt không cho phép toàn màn hình ở đây.'); });
    } catch (e) { toast('Trình duyệt không cho phép toàn màn hình ở đây.'); }
  }
  function onFsChange() {
    var on = !!(document.fullscreenElement || document.webkitFullscreenElement);
    setTool('full', on ? 'shrink' : 'expand', on ? 'Thoát toàn màn hình' : 'Toàn màn hình');
    setTimeout(function () { viewer.resize(); }, 120);
  }
  document.addEventListener('fullscreenchange', onFsChange);
  document.addEventListener('webkitfullscreenchange', onFsChange);

  var toastTimer;
  function toast(msg, extra) {
    var t = $('toast');
    t.innerHTML = '';
    t.appendChild(document.createTextNode(msg));
    if (extra) t.appendChild(extra);
    t.classList.add('show');
    clearTimeout(toastTimer);
    toastTimer = setTimeout(function () { t.classList.remove('show'); }, extra ? 7000 : 2600);
  }
  function share() {
    var url = location.href.split('#')[0] + '#' + current;
    function fallback() {
      var inp = h('input', { id: 'share-url', value: url, readonly: true, 'aria-label': 'Liên kết cảnh' });
      toast('Sao chép liên kết này:', inp);
      setTimeout(function () { inp.focus(); inp.select(); }, 30);
    }
    try {
      navigator.clipboard.writeText(url).then(function () { toast('Đã sao chép liên kết tới “' + byId[current].title + '”.'); }, fallback);
    } catch (e) { fallback(); }
  }

  /* ngăn kéo thông tin & video */
  function closeDrawers() {
    Array.prototype.forEach.call(document.querySelectorAll('.drawer.open'), function (d) { d.classList.remove('open'); });
    var v = document.querySelector('#drawer-video video');
    if (v) v.pause();
  }
  function openDrawer(id) {
    var d = $(id), wasOpen = d.classList.contains('open');
    closeDrawers();
    if (!wasOpen) {
      if (id === 'drawer-video') syncVideo();
      d.classList.add('open');
      var f = d.querySelector('button, a, video');
      if (f) f.focus();
    }
  }
  function drawerHead(title, id) {
    return h('div', { class: 'drawer-head' }, [h('h2', { text: title }),
      h('button', { class: 'tool', 'aria-label': 'Đóng', html: icon('close'), onclick: function () { $(id).classList.remove('open'); } })]);
  }
  function buildInfo() {
    var u = T.unit, d = $('drawer-info');
    d.appendChild(drawerHead('Căn hộ ' + u.code, 'drawer-info'));
    d.appendChild(h('p', { text: u.type + ' · ' + u.bedrooms + ' phòng ngủ · ' + u.bathrooms + ' phòng tắm' }));
    d.appendChild(h('div', { class: 'facts' }, [
      h('div', { class: 'fact' }, [h('b', { text: u.areaCenterLine.toFixed(2).replace('.', ',') }), h('span', { text: 'm² tim tường' })]),
      h('div', { class: 'fact' }, [h('b', { text: u.areaInternal.toFixed(2).replace('.', ',') }), h('span', { text: 'm² thông thuỷ' })])
    ]));
    d.appendChild(h('h3', { text: 'Diện tích từng phòng' }));
    var tb = h('tbody');
    T.scenes.filter(function (s) { return s.room; }).forEach(function (s) {
      tb.appendChild(h('tr', { class: 'go', tabindex: '0', onclick: function () { stopAutoplay(); go(s.id); },
        onkeydown: function (e) { if (e.key === 'Enter') { stopAutoplay(); go(s.id); } } },
        [h('td', { text: s.title }), h('td', { text: m2(s.area) })]));
    });
    tb.appendChild(h('tr', { class: 'muted' }, [h('td', { text: 'Tường ngăn' }), h('td', { text: m2(u.internalWall) })]));
    tb.appendChild(h('tr', { class: 'total' }, [h('td', { text: 'Tổng thông thuỷ' }), h('td', { text: m2(u.areaInternal) })]));
    d.appendChild(h('table', { class: 'area-table' }, [tb]));
    d.appendChild(h('h3', { text: 'Vị trí các căn loại E trên tầng' }));
    d.appendChild(h('img', { class: 'keyplan', src: T.keyPlan, alt: 'Sơ đồ tầng, các căn loại E tô màu xanh' }));
    d.appendChild(h('p', { class: 'credits', text: u.note + ' Bản đồ, phối cảnh và mặt bằng là hình minh hoạ từ tài liệu dự án. Trình xem 360°: Pannellum (giấy phép MIT).' }));
  }
  function buildVideo() {
    var v = T.video, d = $('drawer-video');
    d.appendChild(drawerHead('Video quay thực tế', 'drawer-video'));
    if (v.src) {
      var vid = h('video', { src: v.src, controls: true, playsinline: true, preload: 'metadata' });
      d.appendChild(vid);
      var chapters = T.scenes.filter(function (s) { return typeof s.videoTime === 'number'; });
      if (chapters.length) {
        d.appendChild(h('h3', { text: 'Tua tới phòng' }));
        var ul = h('ul', { class: 'chapters' });
        chapters.forEach(function (s) {
          ul.appendChild(h('li', null, [h('button', { class: 'btn', onclick: function () { vid.currentTime = s.videoTime; vid.play(); } },
            [s.title, h('span', { text: fmtTime(s.videoTime) })])]));
        });
        d.appendChild(ul);
      }
    } else {
      d.appendChild(h('p', { text: 'Video quay căn hộ chưa được nhúng vào tour. Có thể xem bản gốc trên Google Drive (cần quyền truy cập thư mục).' }));
      d.appendChild(h('p', null, [h('a', { href: v.driveUrl, target: '_blank', rel: 'noopener', text: 'Mở video ' + v.name + ' trên Google Drive' })]));
    }
  }
  function syncVideo() {
    var vid = document.querySelector('#drawer-video video'), s = byId[current];
    if (vid && typeof s.videoTime === 'number') { try { vid.currentTime = s.videoTime; } catch (e) { /* chưa tải metadata */ } }
  }
  function fmtTime(t) { var m = Math.floor(t / 60), s = Math.floor(t % 60); return m + ':' + (s < 10 ? '0' : '') + s; }

  /* gợi ý thao tác */
  function hideHint() { $('hint').classList.add('gone'); }
  setTimeout(hideHint, 9000);
  function userTouched() { hideHint(); closeTips(); stopAutoplay(); stopRotate(); }
  viewer.on('mousedown', userTouched);
  viewer.on('touchstart', userTouched);

  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeDrawers(); closeTips(); }
  });

  $('brand-code').textContent = T.unit.code;
  buildToolbar();
  buildMinimap();
  buildSpot();
  buildInfo();
  buildVideo();
  commit(first);
})();
