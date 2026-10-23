(function () {
'use strict';

/* =====================================================================
   Dữ liệu và hằng số
   ===================================================================== */
var DATA = JSON.parse(document.getElementById('app-data').textContent);
var GR = DATA.groups, IND = DATA.inds;
var GSHORT = {
  1: 'Người quản lý, chỉ huy sản xuất',
  2: 'Người làm công tác ATVSLĐ',
  3: 'Người làm công việc có yêu cầu nghiêm ngặt',
  4: 'Người lao động khác',
  5: 'Người làm công tác y tế',
  6: 'An toàn, vệ sinh viên'
};
var GLABEL = {
  1: 'Quản lý, chỉ huy sản xuất',
  2: 'Làm công tác ATVSLĐ',
  3: 'Công việc yêu cầu nghiêm ngặt',
  4: 'Người lao động khác',
  5: 'Làm công tác y tế',
  6: 'An toàn, vệ sinh viên'
};
var FLAGTXT = {
  dia: 'Cần chuyên viên xác nhận',
  rev: 'Trường hợp ranh giới',
  alt: 'Có thể thuộc nhóm khác: chọn theo thực tế',
  work: 'Xác định theo công việc thực tế',
  none: 'Không thuộc 6 nhóm huấn luyện',
  svc: 'Dịch vụ sơ cấp cứu, không thuộc 6 nhóm'
};
var STORE_KEY = 'stp_dako_tracuu_v2';

/* Khái niệm rộng. Gõ "công nhân" thì ngoài các vị trí có chữ "công nhân" còn hiện các vị trí mà cẩm nang gọi bằng tên khác
   (thợ..., phụ hồ...) và các vị trí thuộc khối "lao động trực tiếp" của ngành. Mở rộng một chiều: gõ "thợ" chỉ ra vị trí có chữ "thợ". */
var EXPAND = [
  { k: 'cong nhan', to: ['thợ', 'phụ hồ', 'lao động phổ thông', 'lao động thời vụ'] },
  { k: 'lanh dao', to: ['giám đốc', 'tổng giám đốc', 'chủ tịch', 'ban giám đốc'] },
  { k: 'lai xe', to: ['tài xế'] },
  { k: 'tai xe', to: ['lái xe'] },
  { k: 'y te', to: ['y tá', 'bác sĩ', 'điều dưỡng'] },
  { k: 'van phong', to: ['hành chính'] }
];
/* các khối lao động trực tiếp theo từng ngành (mã ngành -> mã khối), dùng cho khái niệm "công nhân" */
var WORKER_BLOCKS = {
  '01': 'GHI', '02': 'GHIJK', '03': 'GHI', '04': 'HI', '05': 'IJK', '07': 'GHIK', '09': 'GHI',
  '10': 'EFGK', '11': 'IJKLM', '12': 'HIL', '13': 'GHIKL'
};
var KW = ['Công nhân', 'Thợ', 'Kỹ sư', 'Giám sát', 'Giám đốc', 'Trưởng phòng', 'Kế toán', 'Bảo vệ', 'Lái xe', 'Vận hành', 'Thủ kho', 'Nhân viên'];

function nv(s) {
  return String(s == null ? '' : s).normalize('NFD').replace(/[̀-ͯ]/g, '')
    .replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
}
function esc(s) {
  return String(s == null ? '' : s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}
function rich(s) { return esc(s).replace(/\*\*(.+?)\*\*/g, '<strong>$1</strong>'); }
function $(id) { return document.getElementById(id); }
function toInt(v) {
  var n = parseInt(String(v == null ? '' : v).replace(/\D/g, ''), 10);
  return isFinite(n) && n > 0 ? n : null;
}
function fmt(n) { try { return Number(n).toLocaleString('vi-VN'); } catch (e) { return String(n); } }
function hours(g) { return String(GR[g - 1].first).replace(/\s*\(.*$/, ''); }

/* tách từ: mỗi từ giữ vị trí ký tự, dạng chữ thường (có dấu) và dạng bỏ dấu */
var WORD_RE = /[\p{L}\p{N}]+/gu;
function words(text) {
  var low = String(text).toLowerCase(), out = [], m;
  WORD_RE.lastIndex = 0;
  while ((m = WORD_RE.exec(low))) out.push({ s: m.index, e: m.index + m[0].length, l: m[0], n: nv(m[0]) });
  return out;
}

/* chỉ mục */
var ROW = {};
IND.forEach(function (ind) {
  ind.blocks.forEach(function (b) {
    b.name = b.name.normalize('NFC');
    b._w = words(b.name);
    b.rows.forEach(function (r) {
      r.p = r.p.normalize('NFC');
      r._b = b;
      r._w = words(r.p);
      r._nn = nv(r.n || '');
      r._nw = words(String(r.n || '').normalize('NFC'));
      ROW[r.id] = r;
    });
  });
});
function indById(id) { for (var i = 0; i < IND.length; i++) if (IND[i].id === id) return IND[i]; return null; }

/* =====================================================================
   Trạng thái
   ===================================================================== */
var S = {
  ind: '', picker: true, q: '',
  cust: { name: '', contact: '', advisor: '', type: '', heads: '' },
  opts: { rec: false },
  selBy: {},
  view: 'find',
  show: { detail: true, soft: false, faq: false, up: false },
  openCl: {}, moreg: {}
};

function load() {
  try {
    var raw = localStorage.getItem(STORE_KEY);
    if (!raw) return;
    var d = JSON.parse(raw);
    if (d.ind && indById(d.ind)) { S.ind = d.ind; S.picker = false; }
    if (d.cust) for (var k in S.cust) if (typeof d.cust[k] === 'string') S.cust[k] = d.cust[k];
    if (d.opts) S.opts.rec = !!d.opts.rec;
    if (d.show) for (var k2 in S.show) if (typeof d.show[k2] === 'boolean') S.show[k2] = d.show[k2];
    if (d.selBy && typeof d.selBy === 'object') {
      for (var iid in d.selBy) {
        var o = {};
        for (var rid in d.selBy[iid]) {
          if (!ROW[rid]) continue;
          var s = d.selBy[iid][rid];
          o[rid] = { n: s.n || '', on: (s.on || []).filter(function (g) { return g >= 1 && g <= 6; }), touched: !!s.touched, note: s.note || '' };
        }
        S.selBy[iid] = o;
      }
    }
  } catch (e) { /* bộ nhớ trình duyệt có thể bị chặn */ }
}
var saveT = null;
function save() {
  clearTimeout(saveT);
  saveT = setTimeout(function () {
    try {
      localStorage.setItem(STORE_KEY, JSON.stringify({ ind: S.ind, cust: S.cust, opts: S.opts, show: S.show, selBy: S.selBy }));
    } catch (e) { }
  }, 250);
}
function curInd() { return S.ind ? indById(S.ind) : null; }
function curSel() { if (!S.selBy[S.ind]) S.selBy[S.ind] = {}; return S.selBy[S.ind]; }

/* nhóm mặc định của một vị trí theo mức huấn luyện hiện tại */
function defaultOn(r) {
  var s = r.g.slice();
  if (S.opts.rec) r.o.forEach(function (o) { if (o.k === 'rec' && s.indexOf(o.g) < 0) s.push(o.g); });
  return s.sort();
}
function hasOn(sel, g) { return sel.on.indexOf(g) >= 0; }

/* =====================================================================
   Tìm kiếm
   - Khớp nguyên từ, các từ gõ vào phải đứng liền nhau trong tên vị trí
   - Gõ có dấu thì khớp đúng dấu ("thợ" không khớp "thời"); gõ không dấu thì khớp mọi dấu
   - Chỉ khi không có kết quả nguyên từ mới khớp theo đầu từ (đang gõ dở, ví dụ "công nh")
   ===================================================================== */
function qTokens(q) {
  return words(String(q).normalize('NFC')).map(function (w) { return { l: w.l, n: w.n, sens: w.l !== w.n }; });
}
function plainTokens(p) {
  return p.split(' ').map(function (x) { return { l: x, n: x, sens: false }; });
}
function tokEq(t, w, prefix) {
  var a = t.sens ? w.l : w.n, b = t.sens ? t.l : t.n;
  return prefix ? a.indexOf(b) === 0 : a === b;
}
/* các vị trí bắt đầu mà chuỗi từ khớp liền nhau; prefix: từ cuối chỉ cần khớp đầu từ */
function seqAt(ws, toks, prefix) {
  var out = [];
  for (var i = 0; i + toks.length <= ws.length; i++) {
    var ok = true;
    for (var j = 0; j < toks.length; j++) {
      if (!tokEq(toks[j], ws[i + j], prefix && j === toks.length - 1)) { ok = false; break; }
    }
    if (ok) out.push(i);
  }
  return out;
}
function seqHas(ws, toks, prefix) { return seqAt(ws, toks, prefix).length > 0; }

function expansions(toks) {
  var key = toks.map(function (t) { return t.n; }).join(' ');
  var out = [];
  EXPAND.forEach(function (e) { if (e.k === key) e.to.forEach(function (p) { out.push(qTokens(p)); }); });
  return out;
}
function isWorkerBlock(ind, b) { return (WORKER_BLOCKS[ind.id] || '').indexOf(b.id) >= 0; }

/* kết quả: { mode, toks, prefix, alias, list:[{r, rank, via}] }; theo thứ tự cẩm nang, khớp trực tiếp tên vị trí xếp trước
   mode: name (khớp tên vị trí) | note (không vị trí nào có tên khớp, chỉ khớp phần ghi chú) */
function search(ind, q) {
  var toks = qTokens(q);
  var all = [];
  ind.blocks.forEach(function (b) { b.rows.forEach(function (r) { all.push(r); }); });
  if (!toks.length) return { qn: '', mode: 'all', toks: [], prefix: false, alias: [], list: all.map(function (r) { return { r: r, rank: 0 }; }) };
  var alias = expansions(toks);
  var concept = toks.map(function (t) { return t.n; }).join(' ') === 'cong nhan';
  var out = [], prefix = false, mode = 'name';
  for (var pass = 0; pass < 2 && !out.length; pass++) {
    prefix = pass === 1;
    all.forEach(function (r, idx) {
      var skip = r.f.indexOf('none') >= 0 || r.f.indexOf('svc') >= 0;
      var rank = -1, via = '';
      if (seqHas(r._w, toks, prefix)) rank = 0;
      else if (!prefix && !skip && alias.some(function (a) { return seqHas(r._w, a, false); })) { rank = 1; via = 'alias'; }
      else if (!prefix && !skip && concept && isWorkerBlock(ind, r._b)) { rank = 1; via = 'block'; }
      if (rank >= 0) out.push({ r: r, rank: rank, via: via, i: idx });
    });
  }
  if (!out.length) {
    mode = 'note';
    for (var p2 = 0; p2 < 2 && !out.length; p2++) {
      prefix = p2 === 1;
      all.forEach(function (r, idx) { if (seqHas(r._nw, toks, prefix)) out.push({ r: r, rank: 2, via: 'note', i: idx }); });
    }
  }
  out.sort(function (a, b) { return a.rank - b.rank || a.i - b.i; });
  return { qn: toks.map(function (t) { return t.n; }).join(' '), mode: mode, toks: toks, prefix: prefix, alias: alias, list: out };
}

/* tô sáng đúng các từ đã khớp (trong tên vị trí hoặc trong ghi chú) */
function hl(text, ws, res) {
  if (!res || !res.toks.length) return esc(text);
  var rng = [];
  function mark(toks, prefix) {
    seqAt(ws, toks, prefix).forEach(function (i) { rng.push([ws[i].s, ws[i + toks.length - 1].e]); });
  }
  mark(res.toks, res.prefix);
  if (res.mode === 'name') res.alias.forEach(function (a) { mark(a, false); });
  if (!rng.length) return esc(text);
  rng.sort(function (a, b) { return a[0] - b[0]; });
  var merged = [rng[0].slice()];
  for (var j = 1; j < rng.length; j++) {
    var last = merged[merged.length - 1];
    if (rng[j][0] <= last[1]) last[1] = Math.max(last[1], rng[j][1]); else merged.push(rng[j].slice());
  }
  var h = '', pos = 0;
  merged.forEach(function (m) { h += esc(text.slice(pos, m[0])) + '<mark>' + esc(text.slice(m[0], m[1])) + '</mark>'; pos = m[1]; });
  return h + esc(text.slice(pos));
}

/* =====================================================================
   Mô hình kết quả (dùng chung cho màn hình và file Word)
   ===================================================================== */
function buildModel() {
  var ind = curInd();
  if (!ind) return null;
  var sel = curSel();
  var rows = [];
  ind.blocks.forEach(function (b) {
    b.rows.forEach(function (r) {
      var s = sel[r.id];
      if (!s) return;
      var on = s.on.slice().sort();
      rows.push({
        r: r, b: b, s: s, groups: on, n: toInt(s.n), note: (s.note || '').trim(),
        off: r.o.filter(function (o) { return on.indexOf(o.g) < 0; }),
        noteDup: noteDup(r)
      });
    });
  });
  var gs = {};
  for (var g = 1; g <= 6; g++) gs[g] = { pos: 0, ppl: 0, hasN: false };
  var extras = {};
  var clMap = {}, noCl = [];
  var totalPpl = 0, anyN = false;
  rows.forEach(function (x) {
    x.groups.forEach(function (g) {
      gs[g].pos++;
      if (x.n) { gs[g].ppl += x.n; gs[g].hasN = true; }
    });
    if (x.n) { totalPpl += x.n; anyN = true; }
    x.r.x.forEach(function (e) { extras[e] = (extras[e] || 0) + 1; });
    if (!x.r.cl.length) noCl.push(x);
    x.r.cl.forEach(function (c) { (clMap[c] = clMap[c] || []).push(x); });
  });
  var clusters = [];
  Object.keys(clMap).map(Number).sort(function (a, b) { return a - b; }).forEach(function (no) {
    var c = null;
    for (var i = 0; i < ind.clusters.length; i++) if (ind.clusters[i].no === no) c = ind.clusters[i];
    if (c) clusters.push({ c: c, rows: clMap[no] });
  });
  /* gợi ý theo quy mô */
  var heads = toInt(S.cust.heads);
  var scale = [];
  if (heads) {
    ind.scale.tables.forEach(function (t) {
      var hit = null;
      if (t.ranged) t.r.forEach(function (r) { if (heads >= r.lo && heads < r.hi) hit = r; });
      scale.push({ t: t, hit: hit });
    });
  }
  var type = null;
  if (S.cust.type !== '' && ind.types && ind.types[+S.cust.type]) type = ind.types[+S.cust.type];
  var usedGroups = [];
  for (var g2 = 1; g2 <= 6; g2++) if (gs[g2].pos) usedGroups.push(g2);
  return { ind: ind, cust: S.cust, rows: rows, gs: gs, usedGroups: usedGroups, extras: extras, clusters: clusters, noCl: noCl,
    totalPpl: totalPpl, anyN: anyN, heads: heads, scale: scale, type: type, date: new Date() };
}



/* =====================================================================
   Hiển thị chung
   ===================================================================== */
function gb(g, cls, extra) {
  return '<span class="gb g' + g + (cls ? ' ' + cls : '') + '"' + (extra || '') + '>Nhóm ' + g + '</span>';
}
function groupPlates(groups) { return groups.map(function (g) { return gb(g); }).join(''); }

/* nhóm tùy chọn của một vị trí: gộp các dòng cùng loại và cùng lời giải thích
   k = 'rec' khuyến nghị thêm | 'cond' thêm nếu đúng điều kiện | 'alt' nhóm thay thế ("hoặc") */
function optMerge(list) {
  var out = [], seen = {};
  list.forEach(function (o) {
    var key = o.k + '|' + o.w;
    if (seen[key] != null) out[seen[key]].gs.push(o.g);
    else { seen[key] = out.length; out.push({ gs: [o.g], k: o.k, w: o.w }); }
  });
  return out;
}
function noteDup(r) { return r.o.some(function (o) { var a = nv(o.w).slice(0, 28); return a && r._nn.indexOf(a) >= 0; }); }
function optLead(k) { return k === 'alt' ? 'hoặc' : '+'; }
function optLine(m) {
  var gs = m.gs.map(function (g) { return 'Nhóm ' + g; }).join(' và ');
  return m.k === 'alt' ? 'Hoặc ' + gs + ': ' + m.w : 'Lưu ý: ' + m.w;
}

function renderIndustry() {
  var box = $('ind-box');
  var ind = curInd();
  if (ind && !S.picker) {
    box.innerHTML = '<div class="ind-cur"><span>Ngành</span><b>' + esc(ind.name) + '</b>' +
      '<button class="btn sm" data-act="ind-open">Đổi ngành</button></div>';
  } else {
    var h = '<div class="ind-grid" role="group" aria-label="Chọn ngành nghề">';
    IND.forEach(function (i) {
      h += '<button class="ind-btn" data-act="ind" data-id="' + i.id + '" aria-pressed="' + (i.id === S.ind) + '"><span class="no">' + i.no + '</span><span>' + esc(i.name) + '</span></button>';
    });
    box.innerHTML = h + '</div>';
  }
}

/* =====================================================================
   Tab 1: kết quả tra cứu
   ===================================================================== */
function renderKw() {
  var ind = curInd(), box = $('kw-box');
  if (!ind) { box.innerHTML = ''; return; }
  var h = '';
  var n = 0;
  KW.forEach(function (w) {
    if (n >= 8) return;
    var c = search(ind, w).list.length;
    if (c > 0 && c < 200) { h += '<button type="button" data-act="kw" data-w="' + esc(w) + '">' + esc(w) + '</button>'; n++; }
  });
  box.innerHTML = h ? '<span class="kw-l">Gợi ý:</span>' + h : '';
}

function findRowHTML(x, res, showBlock) {
  var r = x.r;
  var on = !!curSel()[r.id];
  var dflt = defaultOn(r);
  var h = '<div class="rr' + (on ? ' on' : '') + '" data-id="' + r.id + '"><div class="rr-main">';
  var noteMode = res.mode === 'note';
  h += '<div class="rr-name">' + (noteMode ? esc(r.p) : hl(r.p, r._w, res)) + '</div>';
  if (showBlock) h += '<div class="rr-blk">' + (x.via === 'block' ? 'Cùng khối lao động trực tiếp: ' : '') + esc(r._b.name) + '</div>';
  h += '<div class="rr-groups">';
  if (dflt.length) {
    dflt.forEach(function (g) {
      h += '<div class="gl">' + gb(g) + '<span>' + esc(GLABEL[g]) + ' · ' + esc(hours(g)) + '</span></div>';
    });
  } else {
    var fl = r.f.filter(function (f) { return FLAGTXT[f]; })[0];
    h += '<div class="gl"><span class="flag">' + esc(r.raw) + '</span></div>';
    if (fl && fl !== 'none' && fl !== 'svc') h += '<div class="gl"><span class="flag">' + esc(FLAGTXT[fl]) + '</span></div>';
  }
  optMerge(r.o.filter(function (o) { return dflt.indexOf(o.g) < 0; })).forEach(function (m) {
    h += '<div class="gl cd"><span class="ld">' + optLead(m.k) + '</span>' + m.gs.map(function (g) { return gb(g, 'off'); }).join('') + '<span>' + esc(m.w) + '</span></div>';
  });
  r.x.forEach(function (e) { h += '<div class="gl"><span class="flag x">+ ' + esc(e) + '</span></div>'; });
  h += '</div>';
  var dup = noteDup(r);
  if (r.n && (noteMode || !dup)) h += '<div class="rr-note">' + (noteMode ? hl(r.n, r._nw, res) : esc(r.n)) + '</div>';
  h += '</div>';
  h += '<button type="button" class="add" data-act="add" data-id="' + r.id + '" aria-pressed="' + on + '">' + (on ? 'Đã thêm' : 'Thêm') + '</button></div>';
  return h + '</div>';
}

function fillFindTop(ind, res) {
  var n = res.list.length, sel = curSel();
  var nSel = res.list.filter(function (x) { return sel[x.r.id]; }).length;
  var t = '<h2>Kết quả tra cứu</h2>';
  if (res.qn && n === 0) t += '<p class="cnt"><b>0</b> vị trí khớp “' + esc(S.q.trim()) + '” trong ngành ' + esc(ind.name) + '</p>';
  else if (res.qn && res.mode === 'note') t += '<p class="cnt">Không có vị trí nào có tên chứa “' + esc(S.q.trim()) + '” trong ngành ' + esc(ind.name) + '. Có <b>' + n + '</b> vị trí nhắc đến cụm này trong phần ghi chú:</p>';
  else if (res.qn) t += '<p class="cnt"><b>' + n + '</b> vị trí khớp “' + esc(S.q.trim()) + '” trong ngành ' + esc(ind.name) + '</p>';
  else t += '<p class="cnt">Tất cả <b>' + n + '</b> vị trí trong ngành ' + esc(ind.name) + '. Gõ vào ô tìm kiếm để lọc.</p>';
  var acts = '';
  if (res.qn && n > 1) acts += '<button class="btn sm" data-act="add-all">' + (nSel === n ? 'Bỏ chọn ' + n + ' vị trí này' : 'Thêm cả ' + n + ' vị trí vào danh sách') + '</button>';
  var total = Object.keys(sel).length;
  if (total) acts += '<button class="btn sm pri" data-act="view" data-view="list">Xem danh sách tư vấn (' + total + ')</button>';
  if (acts) t += '<div class="res-actions">' + acts + '</div>';
  $('find-top').innerHTML = t;
}

function renderFind() {
  var ind = curInd();
  var top = $('find-top'), list = $('find-list');
  if (!ind) {
    top.innerHTML = '<h2>Kết quả tra cứu</h2><p class="hint">Chọn ngành nghề ở bước 1, rồi gõ tên vị trí để xem nhóm huấn luyện tương ứng.</p>';
    list.innerHTML = '';
    return;
  }
  var res = search(ind, S.q);
  var n = res.list.length;
  fillFindTop(ind, res);
  if (!n) {
    list.innerHTML = '<div class="empty"><b>Không có vị trí nào khớp “' + esc(S.q.trim()) + '”</b>Thử từ ngắn hơn, ví dụ “công nhân”, “thợ”, “kỹ sư”, “kế toán”.</div>';
    return;
  }
  var h = '<div class="rlist">', lastB = null;
  res.list.forEach(function (x) {
    if (!res.qn && x.r._b !== lastB) { h += '<div class="blk"><span class="t">' + esc(x.r._b.name) + '</span></div>'; lastB = x.r._b; }
    h += findRowHTML(x, res, !!res.qn);
  });
  list.innerHTML = h + '</div>';
}

function markAdded() {
  var sel = curInd() ? curSel() : {};
  document.querySelectorAll('#find-list .rr').forEach(function (el) {
    var on = !!sel[el.dataset.id];
    el.classList.toggle('on', on);
    var b = el.querySelector('.add');
    if (b) { b.setAttribute('aria-pressed', on); b.textContent = on ? 'Đã thêm' : 'Thêm'; }
  });
}

/* =====================================================================
   Tab 2: danh sách tư vấn
   ===================================================================== */
function renderCustType() {
  var ind = curInd();
  var box = $('type-box');
  if (!ind || !ind.types) { box.innerHTML = ''; return; }
  var h = '<label class="f" for="cust-type" style="margin-top:0">Loại hình doanh nghiệp</label><select id="cust-type" class="sel"><option value="">Chưa xác định</option>';
  ind.types.forEach(function (t, i) { h += '<option value="' + i + '"' + (String(i) === String(S.cust.type) ? ' selected' : '') + '>' + esc(t.n) + '</option>'; });
  h += '</select>';
  var t = S.cust.type !== '' ? ind.types[+S.cust.type] : null;
  if (t) {
    h += '<div class="info">' +
      '<p><span class="k">Đặc điểm: </span>' + esc(t.d) + '</p>' +
      '<p><span class="k">Nhu cầu nổi bật: </span>' + esc(t.need) + '</p>' +
      '<p><span class="k">Người ra quyết định: </span>' + esc(t.who) + '</p></div>';
  }
  box.innerHTML = h;
}

function renderScale() {
  var ind = curInd();
  var box = $('scale-box');
  var n = toInt(S.cust.heads);
  if (!ind || !n) { box.innerHTML = ''; return; }
  var m = buildModel();
  var h = '';
  m.scale.forEach(function (x) {
    if (x.hit) {
      h += '<div class="info"><p><span class="k">Với ' + fmt(n) + ' lao động' + (x.t.t ? ' · ' + esc(x.t.t) : '') + ':</span></p>';
      for (var i = 1; i < x.t.h.length; i++) {
        h += '<p>' + esc(x.t.h[i]) + ': <strong>' + esc(x.hit.c[i - 1]) + '</strong></p>';
      }
      h += '</div>';
    }
  });
  if (!h && ind.scale.tables.length) h = '<div class="info warn"><p>Chưa khớp mốc quy mô nào trong tài liệu. Xem mục 3.4 của cẩm nang ngành hoặc hỏi chuyên viên.</p></div>';
  box.innerHTML = h;
}

function renderLevel() {
  $('lvl-seg').innerHTML = [['min', 'Chỉ nhóm chính'], ['rec', 'Kèm nhóm khuyến nghị']].map(function (c) {
    return '<button type="button" data-act="lvl" data-v="' + c[0] + '" aria-pressed="' + ((c[0] === 'rec') === S.opts.rec) + '">' + c[1] + '</button>';
  }).join('');
  $('lvl-hint').textContent = S.opts.rec
    ? 'Thêm các nhóm nên có theo cẩm nang, ví dụ cử An toàn, vệ sinh viên (Nhóm 6). Vị trí nào đã tự chỉnh nhóm thì giữ nguyên.'
    : 'Chỉ gồm nhóm chính của từng vị trí. Các nhóm có thể thêm hiện ở dòng “Lưu ý” trong bảng.';
}

/* thẻ một vị trí trong danh sách tư vấn: số người, nhóm áp dụng, nhóm tùy chọn, ghi chú */
function selCardHTML(r) {
  var sel = curSel()[r.id];
  var h = '<div class="sc" data-id="' + r.id + '"><div class="sc-h"><div class="sc-name">' + esc(r.p) + '</div>' +
    '<button type="button" class="x" data-act="rm" data-id="' + r.id + '" aria-label="Bỏ vị trí này khỏi danh sách">×</button></div>';
  h += '<div class="sc-b">';
  h += '<div><div class="cfg-l">Số người</div><div class="stepper"><button type="button" data-act="dec" data-id="' + r.id + '" aria-label="Giảm">−</button>' +
    '<input inputmode="numeric" pattern="[0-9]*" data-in="n" data-id="' + r.id + '" value="' + esc(sel.n) + '" placeholder="Chưa nhập" aria-label="Số người"><button type="button" data-act="inc" data-id="' + r.id + '" aria-label="Tăng">+</button></div></div>';
  h += '<div><div class="cfg-l">Nhóm huấn luyện áp dụng</div><div class="chips">';
  r.g.forEach(function (g) { h += '<button type="button" class="gb g' + g + '" data-act="tg" data-id="' + r.id + '" data-g="' + g + '" aria-pressed="' + hasOn(sel, g) + '">Nhóm ' + g + '</button>'; });
  if (!r.g.length) h += '<span class="rawtxt">' + esc(r.raw) + '. Chọn nhóm theo công việc thực tế bên dưới.</span>';
  h += '</div></div>';
  if (r.o.length) {
    h += '<div><div class="cfg-l">Bật nếu đúng với khách</div>';
    optMerge(r.o).forEach(function (m) {
      h += '<div class="cond"><span class="ld">' + optLead(m.k) + '</span>' + m.gs.map(function (g) {
        return '<button type="button" class="gb g' + g + '" data-act="tg" data-id="' + r.id + '" data-g="' + g + '" aria-pressed="' + hasOn(sel, g) + '">Nhóm ' + g + '</button>';
      }).join('') + '<span class="why">' + esc(m.w) + '</span></div>';
    });
    h += '</div>';
  }
  var known = r.g.concat(r.o.map(function (o) { return o.g; }));
  var others = [1, 2, 3, 4, 5, 6].filter(function (g) { return known.indexOf(g) < 0; });
  if (others.length) {
    if (S.moreg[r.id]) {
      h += '<div class="more-g"><span class="cfg-l" style="margin:0">Thêm nhóm khác:</span>';
      others.forEach(function (g) { h += '<button type="button" class="gb g' + g + '" data-act="tg" data-id="' + r.id + '" data-g="' + g + '" aria-pressed="' + hasOn(sel, g) + '" title="' + esc(GSHORT[g]) + '">Nhóm ' + g + '</button>'; });
      h += '</div>';
    } else {
      h += '<div><button type="button" class="btn ghost sm" data-act="moreg" data-id="' + r.id + '">Thêm nhóm khác</button></div>';
    }
  }
  h += '<input class="in" data-in="note" data-id="' + r.id + '" value="' + esc(sel.note) + '" placeholder="Ghi chú riêng cho vị trí này (không bắt buộc)" aria-label="Ghi chú riêng">';
  return h + '</div></div>';
}

function renderListRows() {
  var ind = curInd(), box = $('list-rows');
  if (!ind) { box.innerHTML = '<div class="empty"><b>Chưa chọn ngành nghề</b>Chọn ngành ở màn hình Tra cứu.</div>'; return; }
  var sel = curSel(), h = '', lastB = null, n = 0;
  ind.blocks.forEach(function (b) {
    b.rows.forEach(function (r) {
      if (!sel[r.id]) return;
      n++;
      if (lastB !== b) { h += '<div class="blk"><span class="t">' + esc(b.name) + '</span></div>'; lastB = b; }
      h += selCardHTML(r);
    });
  });
  if (!n) h = '<div class="empty"><b>Chưa có vị trí nào trong danh sách</b>Ở màn hình Tra cứu, bấm “Thêm” cạnh các vị trí của khách. Có thể thêm nhiều vị trí rồi xuất file Word cho cả công ty.<br><button class="btn pri" style="margin-top:12px" data-act="view" data-view="find">Quay lại tra cứu</button></div>';
  box.innerHTML = h;
}

function renderListOut() {
  var m = buildModel();
  var nsel = m ? m.rows.length : 0;
  $('nav-count').textContent = nsel; $('nav-count').style.display = nsel ? '' : 'none';
  $('tab-count').textContent = nsel; $('tab-count').style.display = nsel ? '' : 'none';
  var top = $('list-top'), out = $('list-out');
  var nm = S.cust.name.trim();
  $('cust-sum').textContent = nm || 'Tên, quy mô, loại hình. In lên file Word.';
  if (!m || !nsel) {
    top.innerHTML = '<h2>Danh sách tư vấn</h2><p class="hint">Các vị trí bạn thêm cho khách hàng sẽ hiện ở đây, kèm tổng hợp nhóm và file Word.</p>';
    out.innerHTML = ''; $('print-area').innerHTML = '';
    return;
  }
  var k = '<div class="kpis"><span><b>' + nsel + '</b> vị trí</span>';
  if (m.anyN) k += '<span><b>' + fmt(m.totalPpl) + '</b> người</span>';
  k += '<span>' + m.usedGroups.map(function (g) { return gb(g); }).join(' ') + '</span></div>';
  top.innerHTML = '<h2>Danh sách tư vấn' + (nm ? ' · ' + esc(nm) : '') + '</h2>' + k +
    '<div class="res-actions"><button class="btn pri" data-act="export">Tải file Word</button>' +
    '<button class="btn" data-act="copy">Sao chép tóm tắt</button><button class="btn" data-act="print">In hoặc lưu PDF</button>' +
    '<button class="btn ghost" data-act="clear-all">Xóa danh sách</button></div>';
  $('print-area').innerHTML = '<h3 class="sec">Bảng nhân sự và nhóm huấn luyện</h3>' + tableView(m);
  out.innerHTML = '<h3 class="sec">Tổng hợp theo nhóm huấn luyện</h3>' + summaryView(m) +
    '<h3 class="sec">Nội dung huấn luyện</h3>' + contentView(m);
}

function renderList() { renderListRows(); renderListOut(); }

function groupCellHTML(x) {
  var h = '<div class="gbs">';
  if (x.groups.length) h += groupPlates(x.groups);
  else h += '<span class="flag">' + esc(FLAGTXT[x.r.f.filter(function (f) { return FLAGTXT[f]; })[0]] || x.r.raw) + '</span>';
  h += '</div>';
  x.r.x.forEach(function (e) { h += '<span class="sub">+ ' + esc(e) + '</span>'; });
  optMerge(x.off).forEach(function (m) { h += '<span class="sub i">' + esc(optLine(m)) + '</span>'; });
  return h;
}

function tableView(m) {
  var h = '<table class="tbl stack"><thead><tr><th style="width:60px">STT</th><th>Vị trí nhân sự</th><th style="width:80px">Số người</th><th style="width:34%">Nhóm huấn luyện</th></tr></thead><tbody>';
  var i = 0, lastB = null;
  m.rows.forEach(function (x) {
    if (x.b !== lastB) { h += '<tr class="bk"><td colspan="4">Khối ' + x.b.id + '. ' + esc(x.b.name) + '</td></tr>'; lastB = x.b; }
    i++;
    h += '<tr><td class="c" data-l="STT">' + i + '</td><td data-l="Vị trí nhân sự">' + esc(x.r.p) +
      (x.note ? '<span class="sub i">Ghi chú: ' + esc(x.note) + '</span>' : '') +
      (x.r.n && !x.noteDup ? '<span class="sub">' + esc(x.r.n) + '</span>' : '') + '</td>' +
      '<td class="c" data-l="Số người">' + (x.n ? fmt(x.n) : '–') + '</td>' +
      '<td data-l="Nhóm huấn luyện">' + groupCellHTML(x) + '</td></tr>';
  });
  h += '</tbody></table>';
  h += '<p class="hint" style="margin-top:10px">Bảng này là ước tính ban đầu. Danh sách chính thức do chuyên viên Viện STP – DAKO rà soát theo công việc thực tế của từng người.</p>';
  return h;
}

function summaryView(m) {
  var h = '<table class="tbl stack"><thead><tr><th>Nhóm</th><th>Đối tượng</th><th style="width:96px">Số vị trí</th><th style="width:96px">Số người</th><th>Huấn luyện lần đầu</th><th>Huấn luyện định kỳ</th></tr></thead><tbody>';
  m.usedGroups.forEach(function (g) {
    var G = GR[g - 1], st = m.gs[g];
    h += '<tr><td data-l="Nhóm">' + gb(g, 'lg') + '</td><td data-l="Đối tượng"><strong>' + esc(GSHORT[g]) + '</strong></td><td class="c" data-l="Số vị trí">' + st.pos + '</td><td class="c" data-l="Số người">' + (st.hasN ? fmt(st.ppl) : '–') + '</td><td data-l="Huấn luyện lần đầu">' + esc(G.first) + '</td><td data-l="Huấn luyện định kỳ">' + esc(G.again) + '</td></tr>';
  });
  h += '</tbody></table>';
  if (!m.anyN) h += '<p class="hint" style="margin-top:8px">Nhập số người ở từng vị trí để có tổng số người theo nhóm. Một người có thể thuộc nhiều nhóm nên tổng theo nhóm có thể lớn hơn tổng số người.</p>';
  else h += '<p class="hint" style="margin-top:8px">Một người có thể thuộc nhiều nhóm nên tổng theo nhóm có thể lớn hơn tổng số người (' + fmt(m.totalPpl) + ').</p>';
  var ex = Object.keys(m.extras);
  if (ex.length) {
    h += '<div class="info" style="margin-top:12px"><p><span class="k">Dịch vụ huấn luyện đi kèm có thể tư vấn:</span></p><p>' + ex.map(function (e) { return esc(e) + ' (' + m.extras[e] + ' vị trí)'; }).join('; ') + '</p></div>';
  }
  if (m.heads) {
    m.scale.forEach(function (x) {
      if (x.hit) {
        h += '<div class="info" style="margin-top:12px"><p><span class="k">Với ' + fmt(m.heads) + ' lao động' + (x.t.t ? ' · ' + esc(x.t.t) : '') + ':</span></p>';
        for (var i = 1; i < x.t.h.length; i++) h += '<p>' + esc(x.t.h[i]) + ': <strong>' + esc(x.hit.c[i - 1]) + '</strong></p>';
        h += '</div>';
      }
    });
  }
  var skipped = [1, 2, 3, 4, 5, 6].filter(function (g) { return !m.gs[g].pos; });
  if (skipped.length) h += '<p class="hint" style="margin-top:12px">Chưa có vị trí nào thuộc: ' + skipped.map(function (g) { return 'Nhóm ' + g; }).join(', ') + '.</p>';
  return h;
}

function liList(arr) { return '<ul>' + arr.map(function (t) { return '<li>' + rich(t) + '</li>'; }).join('') + '</ul>'; }

function contentView(m) {
  var h = '<div class="togs">' +
    tog('detail', 'Nội dung theo cụm vị trí', false) +
    tog('soft', 'Tính năng phần mềm gợi ý', false) +
    tog('faq', 'Câu hỏi khách hay thắc mắc', true) +
    tog('up', 'Cơ hội bán kèm', true) + '</div>';
  /* nội dung khung theo nhóm */
  h += '<details class="cl" data-k="frame"' + (S.openCl.frame ? ' open' : '') + '><summary>Nội dung khung của các nhóm đã chọn</summary><div class="cl-body">';
  m.usedGroups.forEach(function (g) {
    var G = GR[g - 1];
    h += '<div class="cl-sec"><h4>' + gb(g) + ' ' + esc(GSHORT[g]) + ' · ' + esc(G.first) + '</h4>' + liList(G.frame) + '</div>';
  });
  h += '</div></details>';
  if (S.show.detail) {
    var n = 0;
    m.clusters.forEach(function (x) {
      n++;
      var key = 'c' + x.c.no;
      var open = S.openCl[key] !== undefined ? S.openCl[key] : (m.clusters.length <= 2);
      h += '<details class="cl" data-k="' + key + '"' + (open ? ' open' : '') + '><summary>Cụm ' + x.c.no + '. ' + esc(x.c.t) + '</summary><div class="cl-body">';
      h += '<div class="cl-sec"><h4>Vị trí đã chọn thuộc cụm này</h4><div class="selpos">' + x.rows.map(function (y) { return '<span>' + esc(y.r.p.length > 90 ? y.r.p.slice(0, 88) + '…' : y.r.p) + '</span>'; }).join('') + '</div></div>';
      if (x.c.grp.length) h += '<div class="cl-sec"><h4>Nhóm huấn luyện</h4>' + liList(x.c.grp) + '</div>';
      if (x.c.con.length) h += '<div class="cl-sec"><h4>Nội dung huấn luyện</h4>' + liList(x.c.con) + '</div>';
      if (S.show.soft && x.c.soft.length) h += '<div class="cl-sec"><h4>Tính năng phần mềm nên giới thiệu</h4>' + liList(x.c.soft) + '</div>';
      if (S.show.faq && x.c.faq.length) h += '<div class="cl-sec"><h4>Khách hàng hay thắc mắc <span class="int">nội bộ</span></h4>' + x.c.faq.map(function (q) { return '<p class="qa"><b>' + esc(q.q) + '</b>' + q.a.map(rich).join('<br>') + '</p>'; }).join('') + '</div>';
      if (S.show.up && (x.c.up.length || x.c.note.length)) h += '<div class="cl-sec"><h4>Cơ hội bán kèm và lưu ý <span class="int">nội bộ</span></h4>' + liList(x.c.up.concat(x.c.note)) + '</div>';
      h += '</div></details>';
    });
    if (m.noCl.length) {
      h += '<p class="hint">Chưa có thẻ nội dung riêng cho: ' + m.noCl.map(function (y) { return esc(y.r.p.split(/[,:(;]/)[0]); }).join('; ') + '. Dùng nội dung khung của nhóm tương ứng hoặc hỏi chuyên viên.</p>';
    }
  }
  return h;
}
function tog(k, label, internal) {
  return '<label class="chk-line"><input type="checkbox" data-act="show" data-k="' + k + '"' + (S.show[k] ? ' checked' : '') + '><span>' + label + (internal ? ' <span class="int">nội bộ</span>' : '') + '</span></label>';
}



/* =====================================================================
   Tóm tắt dạng văn bản (dán vào Zalo, email)
   ===================================================================== */
function summaryText(m) {
  var L = [];
  L.push('VIỆN STP – DAKO | Đề xuất nhóm huấn luyện ATVSLĐ');
  L.push('Khách hàng: ' + (S.cust.name.trim() || '(chưa nhập)') + ' | Ngành: ' + m.ind.name);
  if (m.heads) L.push('Quy mô: ' + fmt(m.heads) + ' lao động');
  L.push('');
  m.rows.forEach(function (x, i) {
    L.push((i + 1) + '. ' + x.r.p + (x.n ? ' (' + fmt(x.n) + ' người)' : '') + ' → ' + (x.groups.length ? x.groups.map(function (g) { return 'Nhóm ' + g; }).join(', ') : (FLAGTXT[x.r.f[0]] || x.r.raw)));
  });
  L.push('');
  L.push('Tổng hợp:');
  m.usedGroups.forEach(function (g) {
    var st = m.gs[g];
    L.push('- Nhóm ' + g + ' (' + GSHORT[g] + '): ' + st.pos + ' vị trí' + (st.hasN ? ', ' + fmt(st.ppl) + ' người' : '') + '; lần đầu ' + GR[g - 1].first + '; định kỳ ' + GR[g - 1].again);
  });
  L.push('');
  L.push('Danh sách chính thức do chuyên viên Viện STP – DAKO rà soát theo công việc thực tế. Hotline: 0827.695.368 – 0968.702.701.');
  return L.join('\n');
}

/* =====================================================================
   Xuất file Word
   ===================================================================== */
var EXP = { preset: 'cust', o: {} };
function presetOpts(p) {
  if (p === 'cust') return { frame: true, detail: true, cond: true, notes: false, soft: false, faq: false, up: false };
  return { frame: true, detail: true, cond: true, notes: true, soft: true, faq: true, up: true };
}
var EXP_LABELS = [
  ['frame', 'Nội dung khung theo nhóm'],
  ['detail', 'Nội dung huấn luyện theo cụm vị trí'],
  ['cond', 'Lưu ý các nhóm cần xem xét thêm'],
  ['soft', 'Tính năng phần mềm gợi ý'],
  ['notes', 'Ghi chú phân loại của cẩm nang', true],
  ['faq', 'Câu hỏi khách hay thắc mắc', true],
  ['up', 'Cơ hội bán kèm', true]
];
function fileName(m) {
  var s = nv(S.cust.name.trim()).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '').slice(0, 40);
  var ind = nv(m.ind.name).replace(/[^a-z0-9]+/g, '_').replace(/^_|_$/g, '');
  return 'DeXuat_HuanLuyen_ATVSLD_' + ind + (s ? '_' + s : '') + '.docx';
}
function openExport() {
  var m = buildModel();
  if (!m || !m.rows.length) { toast('Chọn ít nhất một vị trí trước khi xuất file.'); return; }
  EXP.o = presetOpts(EXP.preset);
  renderExport();
  $('scrim').classList.add('open'); $('sheet').classList.add('open');
  $('sheet').querySelector('button,input').focus();
}
function renderExport() {
  var m = buildModel();
  var h = '<h3>Xuất file Word</h3>';
  h += '<div class="preset"><button data-act="preset" data-v="cust" aria-pressed="' + (EXP.preset === 'cust') + '"><b>Bản gửi khách hàng</b><small>Không có nội dung nội bộ</small></button>' +
    '<button data-act="preset" data-v="int" aria-pressed="' + (EXP.preset === 'int') + '"><b>Bản nội bộ cho NVKD</b><small>Kèm ghi chú, câu hỏi, bán kèm</small></button></div>';
  h += '<div class="opt-list">';
  EXP_LABELS.forEach(function (l) {
    h += '<label class="chk-line"><input type="checkbox" data-act="xopt" data-k="' + l[0] + '"' + (EXP.o[l[0]] ? ' checked' : '') + '><span>' + l[1] + (l[2] ? ' <span class="int">nội bộ</span>' : '') + '</span></label>';
  });
  h += '</div><p class="hint">Tên file: ' + esc(fileName(m)) + '</p>';
  h += '<div class="sheet-actions"><button class="btn" data-act="x-close">Đóng</button>';
  if (window.File && navigator.canShare) h += '<button class="btn" data-act="x-share">Chia sẻ</button>';
  h += '<button class="btn pri" data-act="x-go" id="x-go">Tải file Word</button></div>';
  $('sheet').innerHTML = h;
}
function closeExport() { $('scrim').classList.remove('open'); $('sheet').classList.remove('open'); }
function makeDoc() {
  var m = buildModel();
  return window.STPExport.build(m, EXP.o, { GR: GR, GSHORT: GSHORT, FLAGTXT: FLAGTXT, cust: S.cust });
}
function download(blob, name) {
  var url = URL.createObjectURL(blob);
  var a = document.createElement('a');
  a.href = url; a.download = name; a.style.display = 'none';
  document.body.appendChild(a); a.click();
  setTimeout(function () { URL.revokeObjectURL(url); a.remove(); }, 6000);
}
function doExport(share) {
  var btn = $('x-go');
  if (btn) { btn.disabled = true; btn.textContent = 'Đang tạo file…'; }
  var m = buildModel();
  var name = fileName(m);
  makeDoc().then(function (blob) {
    if (share) {
      var file = new File([blob], name, { type: blob.type });
      if (navigator.canShare && navigator.canShare({ files: [file] })) {
        return navigator.share({ files: [file], title: name }).catch(function () { });
      }
    }
    download(blob, name);
    toast('Đã tạo file ' + name);
  }).catch(function (e) {
    console.error(e);
    toast('Không tạo được file Word. Tải lại trang rồi thử lại.');
  }).then(function () { if (btn) { btn.disabled = false; btn.textContent = 'Tải file Word'; } closeExport(); });
}



/* =====================================================================
   Tiện ích giao diện
   ===================================================================== */
var toastT = null;
function toast(msg) {
  var t = $('toast');
  t.textContent = msg; t.classList.add('show');
  clearTimeout(toastT); toastT = setTimeout(function () { t.classList.remove('show'); }, 3200);
}
function copyText(txt) {
  if (navigator.clipboard && navigator.clipboard.writeText) {
    return navigator.clipboard.writeText(txt).then(function () { toast('Đã sao chép tóm tắt.'); }, function () { fallbackCopy(txt); });
  }
  fallbackCopy(txt);
}
function fallbackCopy(txt) {
  var ta = document.createElement('textarea');
  ta.value = txt; ta.style.position = 'fixed'; ta.style.opacity = '0';
  document.body.appendChild(ta); ta.select();
  try { document.execCommand('copy'); toast('Đã sao chép tóm tắt.'); } catch (e) { toast('Trình duyệt không cho sao chép. Hãy chọn và sao chép thủ công.'); }
  ta.remove();
}
function setView(v) {
  S.view = v;
  document.body.dataset.view = v;
  document.querySelectorAll('.bottom-nav button').forEach(function (b) { b.setAttribute('aria-pressed', b.dataset.view === v ? 'true' : 'false'); });
  document.querySelectorAll('#tabs button').forEach(function (b) { b.setAttribute('aria-selected', b.dataset.view === v ? 'true' : 'false'); });
  if (v === 'list') renderList(); else { renderFind(); }
  window.scrollTo(0, 0);
}
function pickRow(id, on) {
  var sel = curSel();
  if (on) { if (!sel[id]) sel[id] = { n: '', on: defaultOn(ROW[id]), touched: false, note: '' }; }
  else delete sel[id];
}
function updateCounts() {
  var n = curInd() ? Object.keys(curSel()).length : 0;
  $('nav-count').textContent = n; $('nav-count').style.display = n ? '' : 'none';
  $('tab-count').textContent = n; $('tab-count').style.display = n ? '' : 'none';
}

function renderAll() {
  renderIndustry(); renderCustType(); renderScale(); renderLevel(); renderKw();
  $('step2').hidden = !curInd();
  $('f-q').value = S.q;
  $('f-q').parentNode.querySelector('.sclear').hidden = !S.q;
  renderFind(); renderList(); updateCounts();
}

/* =====================================================================
   Sự kiện
   ===================================================================== */
document.addEventListener('click', function (e) {
  var t = e.target.closest('[data-act]');
  if (!t) return;
  var act = t.dataset.act, id = t.dataset.id;
  var sel = curInd() ? curSel() : null;
  switch (act) {
    case 'ind':
      S.ind = id; S.picker = false; S.q = ''; S.cust.type = '';
      save(); renderAll();
      if (window.innerWidth >= 1000) $('f-q').focus();
      break;
    case 'ind-open': S.picker = true; renderIndustry(); break;
    case 'kw': S.q = t.dataset.w; $('f-q').value = S.q; $('f-q').parentNode.querySelector('.sclear').hidden = false; renderFind(); break;
    case 'clear-q': S.q = ''; $('f-q').value = ''; t.hidden = true; renderFind(); $('f-q').focus(); break;
    case 'add': pickRow(id, !sel[id]); save(); markAdded(); updateCounts(); fillFindTop(curInd(), search(curInd(), S.q)); break;
    case 'add-all': {
      var res = search(curInd(), S.q).list;
      var all = res.every(function (x) { return sel[x.r.id]; });
      res.forEach(function (x) { pickRow(x.r.id, !all); });
      save(); renderFind(); updateCounts(); break;
    }
    case 'rm': pickRow(id, false); save(); renderList(); updateCounts(); break;
    case 'dec': case 'inc': {
      var s = sel[id]; var n = toInt(s.n) || 0;
      n = act === 'inc' ? n + 1 : Math.max(0, n - 1);
      s.n = n ? String(n) : '';
      var inp = document.querySelector('input[data-in="n"][data-id="' + id + '"]'); if (inp) inp.value = s.n;
      save(); renderListOut(); break;
    }
    case 'tg': {
      var s2 = sel[id], g = +t.dataset.g; s2.touched = true;
      var i = s2.on.indexOf(g); if (i >= 0) s2.on.splice(i, 1); else s2.on.push(g);
      s2.on.sort(); save(); t.setAttribute('aria-pressed', hasOn(s2, g)); renderListOut(); break;
    }
    case 'moreg': S.moreg[id] = true; renderListRows(); break;
    case 'lvl': {
      S.opts.rec = t.dataset.v === 'rec';
      var sl = curInd() ? curSel() : {};
      Object.keys(sl).forEach(function (rid) { if (!sl[rid].touched) sl[rid].on = defaultOn(ROW[rid]); });
      save(); renderLevel(); renderFind(); renderList(); break;
    }
    case 'clear-all': if (sel && Object.keys(sel).length) { S.selBy[S.ind] = {}; save(); renderList(); renderFind(); updateCounts(); toast('Đã xóa danh sách tư vấn.'); } break;
    case 'view': setView(t.dataset.view); break;
    case 'export': openExport(); break;
    case 'copy': { var m = buildModel(); if (m && m.rows.length) copyText(summaryText(m)); break; }
    case 'print': setView('list'); window.print(); break;
    case 'preset': EXP.preset = t.dataset.v; EXP.o = presetOpts(EXP.preset); renderExport(); break;
    case 'x-close': closeExport(); break;
    case 'x-go': doExport(false); break;
    case 'x-share': doExport(true); break;
    case 'scrim': closeExport(); break;
  }
});
document.addEventListener('change', function (e) {
  var t = e.target;
  if (t.id === 'cust-type') {
    S.cust.type = t.value; save(); renderCustType(); renderListOut();
  } else if (t.dataset && t.dataset.act === 'show') {
    S.show[t.dataset.k] = t.checked; save(); renderListOut();
  } else if (t.dataset && t.dataset.act === 'xopt') {
    EXP.o[t.dataset.k] = t.checked;
  }
});

document.addEventListener('input', function (e) {
  var t = e.target;
  if (t.id === 'f-q') {
    S.q = t.value; t.parentNode.querySelector('.sclear').hidden = !t.value; renderFind();
  }
  else if (t.id === 'cust-name') { S.cust.name = t.value; save(); renderListOut(); }
  else if (t.id === 'cust-contact') { S.cust.contact = t.value; save(); }
  else if (t.id === 'cust-advisor') { S.cust.advisor = t.value; save(); }
  else if (t.id === 'cust-heads') { S.cust.heads = t.value.replace(/\D/g, ''); save(); renderScale(); renderListOut(); }
  else if (t.dataset && t.dataset.in === 'n') {
    var s = curSel()[t.dataset.id]; if (s) { s.n = String(toInt(t.value) || ''); save(); renderListOut(); }
  } else if (t.dataset && t.dataset.in === 'note') {
    var s2 = curSel()[t.dataset.id]; if (s2) { s2.note = t.value; save(); renderListOut(); }
  }
});

document.addEventListener('toggle', function (e) {
  var d = e.target;
  if (d && d.tagName === 'DETAILS' && d.dataset.k) S.openCl[d.dataset.k] = d.open;
}, true);

document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeExport();
  if (e.key === 'Enter' && e.target && e.target.id === 'f-q') e.target.blur();
});

/* =====================================================================
   Khởi tạo
   ===================================================================== */
function init() {
  load();
  $('cust-name').value = S.cust.name;
  $('cust-contact').value = S.cust.contact;
  $('cust-advisor').value = S.cust.advisor;
  $('cust-heads').value = S.cust.heads;
  var latest = IND.map(function (i) { return i.legal.split('/').reverse().join('-'); }).sort().pop().split('-').reverse().join('/');
  $('legal-date').textContent = latest;
  $('cust-det').open = !!(S.cust.name || S.cust.heads || S.cust.contact || S.cust.advisor);
  document.body.dataset.view = 'find';
  renderAll();
}
window.STP = { buildModel: buildModel, S: S, GR: GR, IND: IND, ROW: ROW, pickRow: pickRow, renderAll: renderAll, summaryText: summaryText, presetOpts: presetOpts, search: search,
  makeDoc: function (o) { EXP.o = o || presetOpts('cust'); return makeDoc(); } };
init();
})();
