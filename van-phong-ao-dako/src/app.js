/* Văn phòng ảo DAKO – giao diện, khung chat, giao việc, theo dõi việc. */
(() => {
  const R = window.ROSTER;
  const DEPT = Object.fromEntries(R.phong.map(d => [d.id, d]));
  const STAFF = Object.fromEntries(R.nhan_su.map(s => [s.id, s]));
  STAFF.tp = { id: 'tp', ten: 'Anh', chuc_danh: 'Trưởng phòng', phong: 'tp', viec: 'Giao việc và duyệt kết quả', lam: [], can: [], ra: [], ky_nang: [], tiep: [] };
  const CFG = Object.assign({ artifactUrl: '' }, R.thuc_thi);
  const CCR = 'Claude Code Remote';
  const FLOW = ['kd', 'hd', 'xl', 'gv', 'cc', 'lt'];
  const ST = {
    moi: { label: 'Chờ anh giao thực thi', tone: 'new', s: 'ask' },
    hang_cho: { label: 'Trong hàng chờ', tone: 'queue', s: 'work' },
    dang_lam: { label: 'Đang làm', tone: 'work', s: 'work' },
    cho_anh: { label: 'Chờ anh trả lời', tone: 'ask', s: 'ask' },
    cho_duyet: { label: 'Chờ anh duyệt', tone: 'review', s: 'ask' },
    xong: { label: 'Hoàn thành', tone: 'done', s: 'idle' },
    huy: { label: 'Đã hủy', tone: 'off', s: 'idle' },
    loi: { label: 'Gặp lỗi', tone: 'bad', s: 'ask' }
  };
  const OPEN = ['moi', 'hang_cho', 'dang_lam', 'cho_anh', 'cho_duyet', 'loi'];

  const ICON = {
    file: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M14 3H7a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V8z"/><path d="M14 3v5h5"/></svg>',
    play: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M7 5l12 7-12 7z"/></svg>',
    check: '<svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12l5 5 9-10"/></svg>',
    chev: '<svg viewBox="0 0 24 24" aria-hidden="true" class="chev"><path d="M7 10l5 5 5-5"/></svg>'
  };
  const $ = s => document.querySelector(s);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const rand = n => Array.from(crypto.getRandomValues(new Uint8Array(n)), b => 'abcdefghijklmnopqrstuvwxyz0123456789'[b % 36]).join('');
  const now = () => new Date().toISOString();
  const clean = o => JSON.parse(JSON.stringify(o));
  const deacc = s => String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/đ/g, 'd').replace(/Đ/g, 'D').toLowerCase();
  const store = { get(k) { try { return localStorage.getItem(k); } catch (e) { return null; } }, set(k, v) { try { localStorage.setItem(k, v); } catch (e) {} } };
  function fmtTime(iso) {
    if (!iso) return ''; const d = new Date(iso), t = new Date();
    const hm = d.toLocaleTimeString('vi-VN', { hour: '2-digit', minute: '2-digit' });
    return d.toDateString() === t.toDateString() ? hm : d.toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' }) + ' ' + hm;
  }
  function inline(s) { return s.replace(/\*\*(.+?)\*\*/g, '<b>$1</b>').replace(/`([^`]+)`/g, '<code>$1</code>'); }
  function md(src) {
    const lines = esc(src || '').split('\n'); let html = '', list = null;
    for (const line of lines) {
      const m = line.match(/^\s*([-•*]|\d+[.)])\s+(.*)$/);
      if (m) { const t = /\d/.test(m[1]) ? 'ol' : 'ul'; if (list !== t) { if (list) html += `</${list}>`; html += `<${t}>`; list = t; } html += `<li>${inline(m[2])}</li>`; continue; }
      if (list) { html += `</${list}>`; list = null; }
      html += line.trim() ? `<p>${inline(line)}</p>` : '';
    }
    if (list) html += `</${list}>`;
    return html;
  }
  const initials = s => (s.id === 'tp' ? 'TP' : s.ten.split(' ').pop()[0]);
  const deptOf = id => DEPT[(STAFF[id] || {}).phong] || DEPT.dp;
  function toast(msg, ms = 3800) { const t = $('#toast'); t.textContent = msg; t.hidden = false; clearTimeout(toast.t); toast.t = setTimeout(() => (t.hidden = true), ms); }

  /* ---------- Trạng thái ---------- */
  const S = {
    tasks: new Map(), msgs: new Map(), thread: store.get('vp-thread') || '', to: 'dp_thu',
    pending: [], busy: false, forward: null, revise: null, cap: {}, mcpTools: null, sess: {}, dbState: 'connecting', roomOpen: null
  };
  if (!S.thread) { S.thread = 'th' + rand(10); store.set('vp-thread', S.thread); }

  /* ---------- Lưu trữ (db) ---------- */
  const chains = new Map();
  const serial = (k, fn) => { const p = (chains.get(k) || Promise.resolve()).then(fn, fn); chains.set(k, p.catch(() => {})); return p; };
  function saveTask(id, data) {
    const full = clean(Object.assign({}, S.tasks.get(id) || {}, data, { updatedAt: now() }));
    delete full.id; S.tasks.set(id, Object.assign({ id }, full)); render();
    if (S.cap.db) return serial('t' + id, () => S.cap.db.doc('tasks/' + id).set(full)).catch(e => toast('Chưa lưu được việc: ' + (e.message || e.code)));
  }
  function addMsg(m) {
    const id = 'm' + rand(14); const doc = clean(Object.assign({ t: now(), thread: S.thread }, m));
    S.msgs.set(id, Object.assign({ id }, doc)); render(true);
    if (S.cap.db) serial('m' + id, () => S.cap.db.doc('msgs/' + id).set(doc)).catch(e => toast('Chưa lưu được tin nhắn: ' + (e.message || e.code)));
    return id;
  }
  function connectDb(db) {
    S.cap.db = db; const timer = setTimeout(() => { if (S.dbState === 'connecting') { S.dbState = 'off'; render(); } }, 10000);
    const ok = () => { clearTimeout(timer); S.dbState = 'on'; };
    const fail = e => { clearTimeout(timer); S.dbState = 'off'; console.warn(e); render(); };
    db.collection('tasks').orderBy('createdAt', 'desc').limit(400).onSnapshot(snap => {
      ok(); snap.docChanges().forEach(ch => { if (ch.type === 'removed') S.tasks.delete(ch.doc.id); else S.tasks.set(ch.doc.id, Object.assign({ id: ch.doc.id }, ch.doc.data())); });
      render();
    }, fail);
    db.collection('msgs').orderBy('t', 'desc').limit(600).onSnapshot(snap => {
      ok(); let fresh = false;
      snap.docChanges().forEach(ch => { if (ch.type === 'removed') S.msgs.delete(ch.doc.id); else { if (!S.msgs.has(ch.doc.id)) fresh = true; S.msgs.set(ch.doc.id, Object.assign({ id: ch.doc.id }, ch.doc.data())); } });
      if (!store.get('vp-thread-set')) { const last = [...S.msgs.values()].filter(m => !String(m.thread || '').startsWith('thlichsu')).sort((a, b) => (a.t < b.t ? 1 : -1))[0]; if (last && last.thread) { S.thread = last.thread; store.set('vp-thread', S.thread); } store.set('vp-thread-set', '1'); }
      render(fresh);
    }, fail);
    db.doc('config/main').onSnapshot(s => { if (s.exists) Object.assign(CFG, s.data()); }, () => {});
  }

  /* ---------- Năng lực của trang ---------- */
  const use = n => (window.claude && window.claude.use ? window.claude.use(n).catch(() => null) : Promise.resolve(null));
  const CAPS = { db: use('db'), assets: use('assets'), sample: use('sample'), downloads: use('downloads'), mcp: use('mcp') };
  CAPS.db.then(db => { if (db) connectDb(db); else { S.dbState = 'off'; render(); } });
  CAPS.assets.then(a => { S.cap.assets = a; render(); });
  CAPS.sample.then(s => { S.cap.sample = s; render(); });
  CAPS.downloads.then(d => { S.cap.downloads = d; });
  const PERM = 'mcp:' + CCR;
  use('permissions').then(p => { S.cap.perms = p; refreshPerm(); });
  async function refreshPerm() {
    if (!S.cap.perms) return;
    try { S.ccrPerm = await S.cap.perms.state(PERM); } catch (e) { S.ccrPerm = 'unavailable'; }
    render();
  }
  // Xin quyền dùng kết nối Claude Code Remote ngay trong cú bấm của anh (một hộp hỏi duy nhất).
  async function ensurePerm() {
    const P = S.cap.perms; if (!P) return 'unknown';
    let st; try { st = await P.state(PERM); } catch (e) { st = 'unavailable'; }
    if (st === 'prompt') { try { const r = await P.request([PERM]); st = (r && r[PERM]) || await P.state(PERM); } catch (e) { st = 'prompt'; } }
    S.ccrPerm = st; render(); return st;
  }
  async function openPermPanel() {
    if (!S.cap.perms) return toast('Anh mở menu của trang (góc trên, cạnh nút Chia sẻ) → Quyền, bật “Claude Code Remote”.', 7000);
    try { await S.cap.perms.manage(); } catch (e) { toast('Không mở được bảng quyền. Anh mở menu của trang (góc trên, cạnh nút Chia sẻ) → Quyền, bật “Claude Code Remote”.', 7000); }
    refreshPerm();
  }
  Promise.all(Object.values(CAPS)).then(() => { S.capReady = true; render(); });
  CAPS.mcp.then(async m => {
    S.cap.mcp = m; if (!m) return render();
    await loadTools(m);
    render(); pollSessions();
  });
  async function loadTools(m) {
    try { const r = await (m || S.cap.mcp).listTools(CCR); const sv = (r.servers || []).find(x => x.server === CCR);
      S.mcpTools = sv ? new Set(sv.tools.map(t => t.name)) : new Set(); S.mcpAuth = sv ? sv.authStatus : 'none'; }
    catch (e) { S.mcpTools = new Set(); S.mcpAuth = 'error'; }
  }
  const canRun = t => S.cap.mcp && S.mcpTools && S.mcpTools.has(t) && !S.mcpBlocked;

  /* ---------- Phân việc: Claude (sample) hoặc từ khóa ---------- */
  function rosterText() {
    return R.nhan_su.map(s => `${s.id} | ${s.ten} – ${s.chuc_danh} | ${DEPT[s.phong].ten} | ${s.viec}; ${s.lam.join('; ')} | cần: ${s.can.join(', ') || '—'}`).join('\n');
  }
  function threadMsgs(th) { return [...S.msgs.values()].filter(m => m.thread === (th || S.thread)).sort((a, b) => (a.t < b.t ? -1 : 1)); }
  function openTasks() { return [...S.tasks.values()].filter(t => OPEN.includes(t.status)).sort((a, b) => (a.createdAt < b.createdAt ? 1 : -1)); }
  function pendingFor(staff) { return [...S.tasks.values()].find(t => t.staff === staff && t.thread === S.thread && t.status === 'moi'); }

  function fallbackPlan(text, files, forced) {
    const q = deacc(text); let best = null, score = 0;
    for (const s of R.nhan_su) {
      let sc = 0; for (const k of s.tu_khoa || []) if (q.includes(deacc(k))) sc += deacc(k).length;
      if (sc > score) { score = sc; best = s; }
    }
    if (forced && forced !== 'dp_thu' && (!best || best.id === forced || score < 6)) best = STAFF[forced];
    const smalltalk = !best || (best.id === 'dp_thu');
    if (smalltalk) {
      const open = openTasks();
      return { staff: 'dp_thu', task: false, reply: open.length
        ? `Dạ anh, văn phòng đang có **${open.length} việc** chưa đóng:\n` + open.slice(0, 6).map(t => `- ${t.title} – ${STAFF[t.staff].ten} (${ST[t.status].label.toLowerCase()})`).join('\n') + '\nAnh giao thêm việc gì, em chuyển đúng người.'
        : 'Dạ anh, hiện không có việc nào đang dở. Anh nhắn việc cần làm (ví dụ "In thẻ ATLĐ nhóm 3 cho Công ty …"), em chuyển đúng người.' };
    }
    const s = best;
    return { staff: s.id, task: true, same_task: !!pendingFor(s.id), title: text.replace(/\s+/g, ' ').slice(0, 70),
      reply: `Dạ anh, em ${s.ten} – ${s.chuc_danh} nhận việc này (${s.viec}). Làm xong em giao: ${s.ra.join('; ')}.${s.can.length ? ' Anh kiểm tra giúp em đã gửi đủ: ' + s.can.join(', ') + '.' : ''}`,
      have: files.map(f => f.name), missing: [], ready: true, brief: text, checklist: s.can };
  }

  function assignedPlan(text, files, id) {
    const s = STAFF[id];
    return { staff: id, task: true, same_task: !!pendingFor(id), title: text.replace(/\s+/g, ' ').slice(0, 70),
      reply: `Dạ anh, em ${s.ten} – ${s.chuc_danh} nhận việc này (${s.viec}). Làm xong em giao: ${s.ra.join('; ')}.${s.can.length ? ' Anh kiểm tra giúp em đã gửi đủ: ' + s.can.join(', ') + '.' : ''}`,
      have: files.map(f => f.name), missing: [], ready: true, brief: text, checklist: s.can };
  }
  async function plan(text, files, forced) {
    const smp = S.cap.sample;
    if (!smp) return fallbackPlan(text, files, forced);
    const hist = threadMsgs().slice(-10).map(m => `${m.who === 'anh' ? 'Anh' : (STAFF[m.who] || { ten: 'Văn phòng' }).ten}: ${String(m.text || '').slice(0, 400)}`).join('\n');
    const open = openTasks().slice(0, 12).map(t => `- [${ST[t.status].label}] ${t.title} – ${t.staff}`).join('\n') || '(không có)';
    const pend = forced && pendingFor(forced);
    const prompt = `Bạn là "Điều phối" của VĂN PHÒNG ẢO ATVSLĐ – Công ty Cổ phần Kỹ thuật Hàng hải DAKO (huấn luyện an toàn, vệ sinh lao động; thẻ ATLĐ nhóm 3, GCN nhóm 1-2-5-6, sổ theo dõi nhóm 4).
Hôm nay: ${new Date().toLocaleDateString('vi-VN')}. Người nhắn là trưởng phòng: nhân sự gọi "anh", xưng "em".

NHÂN SỰ (id | tên – chức danh | phòng | làm gì | cần đầu vào):
${rosterText()}

VIỆC ĐANG MỞ:
${open}
${forced && forced !== 'dp_thu' ? `\nAnh đang nhắn trực tiếp cho ${forced}. Chỉ chọn người khác khi việc rõ ràng thuộc người khác.` : ''}${pend ? `\nViệc của ${forced} đang chờ giao thực thi: ${JSON.stringify({ title: pend.title, brief: pend.brief, missing: pend.missing })}` : ''}

HỘI THOẠI GẦN ĐÂY:
${hist || '(mới bắt đầu)'}

TIN NHẮN MỚI CỦA ANH: """${text}"""
TỆP KÈM TIN NÀY: ${files.length ? files.map(f => f.name).join(', ') : 'không có'}

Làm như sau:
1. Chọn đúng một nhân sự phụ trách (id ở trên). Chào hỏi, hỏi tiến độ, hỏi chung → "dp_thu" (trả lời dựa trên VIỆC ĐANG MỞ).
2. reply: lời của chính nhân sự đó, tiếng Việt, 2–4 câu, gọi "anh" xưng "em", nói rõ sẽ làm gì và giao ra file gì. Không bịa số liệu, không hứa ngoài phạm vi công việc.
3. Việc cần làm → task=true. have: đầu vào đã có; missing: chỉ đầu vào bắt buộc còn thiếu. ready=true khi đủ để bắt đầu (thiếu chi tiết phụ vẫn ready, người làm hỏi sau).
4. brief: mô tả việc đầy đủ cho người thực thi (khách hàng, nhóm, ngày, số lượng, tệp, yêu cầu riêng), giữ nguyên mọi số liệu anh đưa.
5. same_task=true nếu tin này bổ sung cho việc đang chờ giao thực thi ở trên.
Chỉ trả về JSON: {"staff":"id","task":true,"same_task":false,"title":"≤ 70 ký tự","reply":"…","have":["…"],"missing":["…"],"ready":true,"brief":"…"}`;
    try {
      const o = await smp.json(prompt, { modelTier: 'default', cache: false });
      if (!o || !STAFF[o.staff] || o.staff === 'tp') return fallbackPlan(text, files, forced);
      o.have = Array.isArray(o.have) ? o.have : []; o.missing = Array.isArray(o.missing) ? o.missing : [];
      o.title = String(o.title || text).slice(0, 80); o.reply = String(o.reply || ''); o.brief = String(o.brief || text);
      if (o.staff === 'dp_thu') o.task = false;
      return o;
    } catch (e) {
      if (e && e.code === 'not_granted') S.cap.sample = null;
      if (e && e.code === 'rate_limited') toast('Trợ lý đang bận, em dùng cách phân việc theo từ khóa.');
      return fallbackPlan(text, files, forced);
    }
  }

  /* ---------- Tệp: tải lên / tải về ---------- */
  // Kho tệp (assets) chỉ nhận ảnh, PDF, video và chữ. Word/Excel/zip… được mã hóa base64 thành chữ,
  // cắt thành nhiều phần 9 MB để không vượt giới hạn 20 MiB mỗi tệp. Không có kho tệp thì lưu vào kho dữ liệu (db).
  const ASSET_TYPES = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'application/pdf', 'video/mp4', 'video/webm',
    'text/csv', 'text/plain', 'text/markdown', 'application/json']);
  const RAW_MAX = 19 * 1024 * 1024, PART = 9 * 1024 * 1024, FILE_MAX = 100 * 1024 * 1024;
  const DB_PART = 300 * 1024, DB_MAX = 12 * 1024 * 1024;
  const EXT = { xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xls: 'application/vnd.ms-excel', xlsm: 'application/vnd.ms-excel.sheet.macroEnabled.12',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', ppt: 'application/vnd.ms-powerpoint',
    zip: 'application/zip', rar: 'application/vnd.rar', '7z': 'application/x-7z-compressed', pdf: 'application/pdf',
    jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', gif: 'image/gif', heic: 'image/heic', heif: 'image/heif',
    csv: 'text/csv', txt: 'text/plain', json: 'application/json', md: 'text/markdown', mp4: 'video/mp4' };
  function fileType(f) {
    let t = String(f.type || '').split(';')[0].trim().toLowerCase();
    if (t === 'image/jpg' || t === 'image/pjpeg') t = 'image/jpeg';
    const byExt = EXT[(String(f.name).split('.').pop() || '').toLowerCase()];
    if (!t || t === 'application/octet-stream' || (t === 'application/vnd.ms-excel' && byExt === 'text/csv')) t = byExt || 'application/octet-stream';
    return t;
  }
  function b64(u8) { let s = ''; for (let i = 0; i < u8.length; i += 0x8000) s += String.fromCharCode.apply(null, u8.subarray(i, i + 0x8000)); return btoa(s); }
  function unb64(txt) { const bin = atob(String(txt).replace(/\s+/g, '')); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); return u; }
  const withTimeout = (pr, ms) => new Promise((ok, no) => { const t = setTimeout(() => no({ code: 'timeout' }), ms); pr.then(v => { clearTimeout(t); ok(v); }, e => { clearTimeout(t); no(e); }); });
  const mb = n => (n / 1048576).toFixed(n < 10485760 ? 1 : 0).replace('.', ',') + ' MB';
  function errText(e, f) {
    const c = e && e.code;
    return ({
      empty: 'tệp rỗng', too_big: `tệp ${mb(f.size)}, quá giới hạn 100 MB – anh gửi thẳng trong Claude Code`,
      too_big_db: `tệp ${mb(f.size)}: chế độ xem này chỉ lưu được tệp đến 12 MB`,
      no_store: 'chế độ xem này không cho trang lưu tệp (xem thông báo ở đầu khung chat)',
      timeout: 'mạng chậm, quá thời gian chờ – anh thử lại', too_large: 'quá 20 MB cho một phần',
      unsupported_type: 'kho tệp không nhận loại tệp này', quota_or_state: 'kho tệp đã đầy hoặc trang đang được cập nhật',
      rate_limited: 'tải quá nhanh, đợi vài giây rồi gửi lại', upstream_auth: 'phiên đăng nhập hết hạn – tải lại trang',
      not_granted: 'chế độ xem này không cho tải tệp', capability_disabled: 'chế độ xem này không cho tải tệp',
      store_unavailable: 'kho tệp tạm lỗi – anh gửi lại', invalid_request: 'tệp không hợp lệ'
    })[c] || (e && (e.message || c)) || 'lỗi không rõ';
  }
  async function toAssets(p, type) {
    const f = p.file;
    if (ASSET_TYPES.has(type) && f.size <= RAW_MAX) {
      p.note = 'đang tải…'; renderAtt();
      const r = await withTimeout(S.cap.assets.upload(f, { type }), 300000);
      return { id: r.id, name: f.name, type, size: f.size, enc: 'raw', store: 'assets', at: now() };
    }
    const parts = [], n = Math.max(1, Math.ceil(f.size / PART));
    for (let i = 0; i < n; i++) {
      p.note = n > 1 ? `đang tải phần ${i + 1}/${n}` : 'đang tải…'; renderAtt();
      const u8 = new Uint8Array(await f.slice(i * PART, Math.min(f.size, (i + 1) * PART)).arrayBuffer());
      const r = await withTimeout(S.cap.assets.upload(new Blob([b64(u8)], { type: 'text/plain' }), { type: 'text/plain' }), 300000);
      parts.push(r.id);
    }
    return { id: parts[0], parts, name: f.name, type, size: f.size, enc: 'b64', store: 'assets', at: now() };
  }
  async function toDb(p, type) {
    const f = p.file; if (f.size > DB_MAX) throw { code: 'too_big_db' };
    const fid = 'f' + rand(12), txt = b64(new Uint8Array(await f.arrayBuffer())), n = Math.ceil(txt.length / DB_PART);
    for (let i = 0; i < n; i++) {
      p.note = `đang lưu ${i + 1}/${n}`; renderAtt();
      await withTimeout(S.cap.db.doc(`files/${fid}/parts/p${String(i).padStart(3, '0')}`).set({ i, d: txt.slice(i * DB_PART, (i + 1) * DB_PART) }), 90000);
    }
    const meta = { id: fid, name: f.name, type, size: f.size, enc: 'b64', store: 'db', nparts: n, at: now() };
    await S.cap.db.doc('files/' + fid).set(meta);
    return meta;
  }
  async function uploadOne(p) {
    const f = p.file, type = fileType(f);
    if (!f.size) throw { code: 'empty' };
    if (f.size > FILE_MAX) throw { code: 'too_big' };
    if (S.cap.assets) {
      try { return await toAssets(p, type); }
      catch (e) { if (!S.cap.db || !['not_granted', 'capability_disabled', 'capability_removed', 'unsupported_type', 'upstream_auth', 'quota_or_state'].includes(e && e.code) || f.size > DB_MAX) throw e; }
    }
    if (S.cap.db) return await toDb(p, type);
    throw { code: 'no_store' };
  }
  async function uploadPending() {
    const ok = [], bad = [];
    for (const p of S.pending) {
      if (p.state === 'ok' && p.meta) { ok.push(p.meta); continue; }
      try { p.state = 'up'; p.note = ''; renderAtt(); p.meta = await uploadOne(p); p.state = 'ok'; p.note = ''; ok.push(p.meta); }
      catch (e) { console.warn('upload', p.file.name, e); p.state = 'bad'; p.note = errText(e, p.file); bad.push(p); }
      renderAtt();
    }
    return { ok, bad };
  }
  function addFiles(list) {
    for (const f of list || []) S.pending.push({ file: f, state: 'wait' });
    setCompErr(''); renderAtt();
    if (S.pending.length && !S.cap.assets && !S.cap.db && S.capReady) setCompErr('Chế độ xem này không lưu được tệp. Xem hướng dẫn ở đầu khung chat.');
  }
  function setCompErr(t) { const el = $('#compErr'); el.textContent = t; el.hidden = !t; }
  async function fileBlob(f) {
    if (f.store === 'db') {
      if (!S.cap.db) throw { code: 'no_store' };
      const snap = await S.cap.db.collection(`files/${f.id}/parts`).get();
      const txt = snap.docs.map(d => d.data()).sort((a, b) => a.i - b.i).map(x => x.d).join('');
      return new Blob([unb64(txt)], { type: f.type });
    }
    const ids = f.parts && f.parts.length ? f.parts : [f.id];
    if (f.enc !== 'b64') { const r = await fetch(f.url || '/_blob/' + ids[0]); if (!r.ok) throw new Error('HTTP ' + r.status); return r.blob(); }
    const chunks = [];
    for (const id of ids) { const r = await fetch('/_blob/' + id); if (!r.ok) throw new Error('HTTP ' + r.status); chunks.push(unb64(await r.text())); }
    return new Blob(chunks, { type: f.type });
  }
  async function download(f, btn) {
    if (btn) btn.classList.add('busy');
    try {
      const blob = await fileBlob(f);
      if (!S.cap.downloads) return toast('Chế độ xem này không cho tải tệp về máy. Mở phiên Claude Code của việc này để lấy tệp.', 6000);
      await S.cap.downloads.save({ filename: f.name, data: blob });
    } catch (e) {
      if (e && e.code === 'declined') return;
      toast(e && e.code === 'rejected_extension' ? `Trang không tải được loại tệp “${f.name}”; mở phiên Claude Code để lấy.` : 'Chưa tải được tệp: ' + errText(e, f), 6000);
    } finally { if (btn) btn.classList.remove('busy'); }
  }

  /* ---------- Phiếu giao việc gửi Claude Code ---------- */
  function ticket(t) {
    const s = STAFF[t.staff], d = DEPT[s.phong];
    return `[VĂN PHÒNG ẢO DAKO – PHIẾU GIAO VIỆC ${t.id}]
Nhân sự nhận việc: ${s.ten} – ${s.chuc_danh}, phòng ${d.ten}.
Việc: ${t.title}
Lệnh của trưởng phòng: "${t.command}"
Tóm tắt yêu cầu: ${t.brief}
${t.have && t.have.length ? 'Đã có: ' + t.have.join('; ') + '\n' : ''}${t.missing && t.missing.length ? 'Còn thiếu (hỏi anh nếu thật cần): ' + t.missing.join('; ') + '\n' : ''}Quy trình / kỹ năng dùng: ${s.ky_nang.join('; ') || 'theo mô tả công việc'}
Việc của vị trí này: ${s.lam.join('; ')}
Đầu ra cần giao: ${s.ra.join('; ')}
Tệp anh gửi kèm (văn phòng ảo; cách lấy xem kỹ năng van-phong-dako mục 2): ${t.files && t.files.length ? '\n' + t.files.map(fileLine).join('\n') : 'không có'}
Văn phòng ảo: ${CFG.artifactUrl || '(xem config/main)'} — bản ghi tasks/${t.id}, cuộc chat ${t.thread}.
Gợi ý việc tiếp theo cho: ${(s.tiep || []).map(id => `${id} (${STAFF[id].ten} – ${STAFF[id].viec})`).join('; ') || 'tùy kết quả'}
Làm theo kỹ năng "van-phong-dako" (repo dakojsc-maker/ATL--DAKO, .claude/skills/van-phong-dako/SKILL.md): nhận tệp, báo tiến độ, trả kết quả và gợi ý việc tiếp theo về văn phòng ảo.`;
  }
  function fileLine(f) {
    const where = f.store === 'db' ? `kho dữ liệu: files/${f.id}/parts (${f.nparts} phần)` : f.parts && f.parts.length > 1 ? `kho tệp, ${f.parts.length} phần theo thứ tự: ${f.parts.join(', ')}` : `kho tệp, id: ${f.id}`;
    return `- ${f.name} (${where}; enc: ${f.enc}; ${Math.max(1, Math.round(f.size / 1024))} KB; ${f.type})`;
  }
  const sessionLink = id => 'https://claude.ai/code/' + id;
  function findSession(r) { const m = JSON.stringify(r && (r.payload || r) || '').match(/session_[A-Za-z0-9]+/); return m ? m[0] : null; }

  const sleep = ms => new Promise(r => setTimeout(r, ms));
  const consentErr = e => !!e && (e.code === 'approval_required' || e.code === 'consent_required' || /confirm|consent|approv/i.test(String(e.message || '')));
  function createSession(t, s) {
    return S.cap.mcp.callTool(CCR, 'create_session', {
      prompt: ticket(t), title: `DAKO · ${s.ten} · ${t.title}`.slice(0, 120),
      source_url: CFG.repo, source_revision: CFG.nhanh, environment_id: CFG.moi_truong, tags: ['van-phong-dako', 'phong-' + s.phong]
    });
  }
  function permMsg(t, kind) {
    const text = kind === 'denied'
      ? 'Quyền dùng kết nối **Claude Code Remote** của trang đang **bị tắt**, nên em chưa mở được phiên làm việc. Anh bấm **Mở bảng quyền**, bật “Claude Code Remote”, rồi bấm **Giao thực thi** lại. Cần gấp thì chọn **Đưa vào hàng chờ**.'
      : 'Văn phòng cần anh **cho phép** dùng kết nối **Claude Code Remote** để mở phiên làm việc. Lần trước hộp hỏi chưa được xác nhận nên lệnh chưa gửi đi, **chưa có phiên nào được tạo**. Anh bấm **Cho phép và giao lại**, khi claude.ai hỏi thì chọn **Cho phép**.';
    const actions = kind === 'denied' ? [{ act: 'permpanel', label: 'Mở bảng quyền' }, { act: 'queue', id: t.id, label: 'Đưa vào hàng chờ' }]
      : [{ act: 'grant', id: t.id, label: 'Cho phép và giao lại', primary: true }, { act: 'queue', id: t.id, label: 'Đưa vào hàng chờ' }];
    addMsg({ who: 'dp_thu', thread: t.thread, taskId: t.id, kind: 'note', text, actions });
  }
  async function execute(id, opts = {}) {
    const t0 = S.tasks.get(id); if (!t0 || !['moi', 'loi', 'hang_cho'].includes(t0.status) || S.running === id) return;
    const s = STAFF[t0.staff], t = Object.assign({}, t0, { id });
    if (!S.cap.mcp || (S.mcpTools && !S.mcpTools.has('create_session')) || S.mcpBlocked) return queue(id);
    S.running = id;
    try {
      const perm = await ensurePerm();
      if (perm === 'denied') { saveTask(id, { status: 'moi', progress: null }); return permMsg(t, 'denied'); }
      if (perm === 'prompt') { saveTask(id, { status: 'moi', progress: null }); return permMsg(t, 'prompt'); }
      // Sau khi anh cho phép, danh sách công cụ mới là danh sách thật của tài khoản.
      if (perm === 'granted' && !S.toolsChecked) { S.toolsChecked = true; await loadTools(); }
      if (S.mcpTools && !S.mcpTools.has('create_session')) {
        saveTask(id, { status: 'moi', progress: null });
        return queue(id, S.mcpAuth === 'needs_reauth' ? 'Kết nối Claude Code Remote cần đăng nhập lại (claude.ai → Cài đặt → Kết nối).' : 'Kết nối Claude Code Remote của tài khoản chưa cho trang mở phiên mới.');
      }
      Office.dispatch(s.phong, s.id);
      saveTask(id, { status: 'dang_lam', mode: 'phien', progress: 'Đang mở phiên làm việc…', error: null });
      let r, last;
      for (let attempt = 0; attempt < 2 && !r; attempt++) {
        try { r = await createSession(t, s); }
        catch (e) {
          last = e;
          // Lệnh chưa tới được Claude Code (chưa xác nhận quyền / hộp hỏi bị đóng): thử lại một lần là an toàn.
          if (attempt === 0 && (e && e.retryable) && (consentErr(e) || e.code === 'upstream_error')) { saveTask(id, { progress: 'Đang xin quyền, thử lại…' }); await sleep(Math.min(e.retryAfterMs || 2500, 15000)); continue; }
          break;
        }
      }
      if (r) {
        const sid = findSession(r);
        saveTask(id, { sessionId: sid, progress: 'Đã nhận việc, đang làm', error: null });
        return addMsg({ who: s.id, thread: t.thread, taskId: id, kind: 'note', session: sid,
          text: `Dạ, em bắt đầu làm “${t.title}”. Xong em gửi kết quả về đây và vào mục **Bàn duyệt**.` });
      }
      const e = last, c = e && e.code;
      console.warn('create_session', e);
      if (consentErr(e)) { saveTask(id, { status: 'moi', progress: null, error: null }); refreshPerm(); return permMsg(t, S.ccrPerm === 'denied' ? 'denied' : 'prompt'); }
      if (['not_in_manifest', 'server_not_connected', 'blocked_by_policy', 'not_granted', 'capability_disabled', 'capability_removed', 'selection_required', 'needs_reauth'].includes(c)) {
        if (!['needs_reauth', 'selection_required', 'not_in_manifest'].includes(c)) S.mcpBlocked = true;
        saveTask(id, { status: 'moi', progress: null });
        return queue(id, c === 'needs_reauth' ? 'Kết nối Claude Code Remote cần đăng nhập lại (claude.ai → Cài đặt → Kết nối).'
          : c === 'selection_required' ? 'Anh có nhiều kết nối Claude Code Remote; claude.ai sẽ hỏi anh chọn một kết nối cho trang này.'
          : c === 'not_in_manifest' ? 'Kết nối Claude Code Remote đang bị tắt cho trang này (menu của trang → Quyền).'
          : c === 'server_not_connected' ? 'Tài khoản chưa có kết nối Claude Code Remote (claude.ai → Cài đặt → Kết nối).'
          : 'Chế độ xem này không cho trang mở phiên Claude Code.');
      }
      saveTask(id, { status: 'loi', progress: null, error: (e && (e.message || c)) || 'không rõ' });
      const why = c === 'tool_error' ? `Claude Code từ chối yêu cầu: ${esc(String(e.message || '').slice(0, 200))}` : c === 'server_unavailable' ? 'Dịch vụ Claude Code đang bận hoặc mạng chập chờn' : `Lỗi ${esc(c || 'không rõ')}`;
      addMsg({ who: 'dp_thu', thread: t.thread, taskId: id, kind: 'note', actions: [{ act: 'run', id, label: 'Thử lại', primary: true }, { act: 'queue', id, label: 'Đưa vào hàng chờ' }],
        text: `Chưa mở được phiên làm việc. ${why}. Lệnh có thể đã tới Claude Code: trước khi thử lại anh xem danh sách phiên trong Claude Code có phiên “DAKO · ${s.ten}” vừa tạo không.` });
    } finally { if (S.running === id) S.running = null; }
  }
  function queue(id, why) {
    const t = S.tasks.get(id); if (!t) return;
    saveTask(id, { status: 'hang_cho', mode: 'hang_cho', progress: null });
    addMsg({ who: 'dp_thu', thread: t.thread, taskId: id, kind: 'note',
      text: `${why ? why + ' ' : ''}Việc “${t.title}” đã vào **hàng chờ**. Anh mở Claude Code (repo ATL--DAKO) và nhắn: **Xử lý hàng chờ văn phòng DAKO** – hoặc bấm **Sao chép phiếu** rồi dán vào Claude Code.` });
  }
  async function copyTicket(id) {
    const t = S.tasks.get(id); const txt = ticket(t);
    try { await navigator.clipboard.writeText(txt); toast('Đã sao chép phiếu giao việc. Dán vào Claude Code để nhân sự làm.'); }
    catch (e) { showTicket(txt); }
  }
  function showTicket(txt) { $('#ticketText').value = txt; $('#ticketModal').hidden = false; $('#ticketText').select(); }

  async function forwardToSession(t, text, files) {
    const msg = `[Trưởng phòng nhắn từ văn phòng ảo – việc ${t.id}]\n${text}${files.length ? '\nTệp mới (văn phòng ảo):\n' + files.map(fileLine).join('\n') : ''}`;
    await S.cap.mcp.callTool(CCR, 'send_message', { session_id: t.sessionId, message: msg });
    saveTask(t.id, { status: 'dang_lam', question: null, files: (t.files || []).concat(files) });
    addMsg({ who: 'dp_thu', taskId: t.id, kind: 'note', text: `Em đã chuyển lời anh tới phiên làm việc của ${STAFF[t.staff].ten}.` });
  }

  /* ---------- Gửi tin ---------- */
  async function send(textIn, forcedTo, opts = {}) {
    const text = (textIn != null ? textIn : $('#input').value).trim();
    if ((!text && !S.pending.length) || S.busy) return;
    S.busy = true; setCompErr(''); render();
    let files = [];
    if (S.pending.length) {
      const r = await uploadPending();
      if (r.bad.length) {
        S.busy = false; if (textIn != null && !$('#input').value) $('#input').value = text; autosize();
        setCompErr(`Chưa gửi: ${r.bad.map(p => `“${p.file.name}” – ${p.note}`).join('; ')}. Anh bỏ tệp lỗi (×) hoặc bấm Gửi để thử lại.`);
        return render();
      }
      files = r.ok; S.pending = []; renderAtt();
    }
    $('#input').value = ''; autosize();
    const to = forcedTo || S.to;
    addMsg({ who: 'anh', to, text: text || '(gửi tệp)', files });
    try {
      const fw = S.forward && S.tasks.get(S.forward);
      const ask = [...S.tasks.values()].find(t => t.staff === to && t.status === 'cho_anh' && t.sessionId);
      const target = fw || ask;
      if (target && target.sessionId && canRun('send_message')) {
        S.forward = null;
        try { await forwardToSession(target, text, files); return; }
        catch (e) { toast('Chưa chuyển được lời tới phiên (' + (e.code || 'lỗi') + '), em xử lý như việc mới.'); }
      }
      S.forward = null;
      let p = await plan(text || 'Anh gửi tệp đính kèm', files, to);
      if (opts.assign && to !== 'dp_thu' && (!p.task || p.staff === 'dp_thu')) p = assignedPlan(text, files, to);
      const s = STAFF[p.staff];
      if (!p.task) { addMsg({ who: p.staff, text: p.reply }); return; }
      if (to === 'dp_thu' || to !== p.staff) addMsg({ who: 'dp_thu', kind: 'route', text: `Việc này em giao cho **${s.ten}** – ${s.chuc_danh} (phòng ${DEPT[s.phong].ten}).` });
      S.to = p.staff;
      const pend = pendingFor(p.staff);
      let id;
      if (pend && p.same_task !== false) {
        id = pend.id;
        saveTask(id, { title: p.title || pend.title, brief: p.brief, have: p.have, missing: p.missing, ready: p.ready !== false,
          command: pend.command + '\n' + text, files: (pend.files || []).concat(files), checklist: p.checklist || pend.checklist });
      } else {
        id = 'tk' + rand(10);
        saveTask(id, { title: p.title, staff: p.staff, dept: s.phong, command: text, brief: p.brief, have: p.have, missing: p.missing,
          ready: p.ready !== false, checklist: p.checklist || null, files, status: 'moi', thread: S.thread, createdAt: now() });
      }
      addMsg({ who: p.staff, kind: 'task', taskId: id, text: p.reply });
      Office.flash(p.staff);
    } catch (e) {
      addMsg({ who: 'dp_thu', text: 'Em chưa xử lý được tin này (' + (e.message || e.code || 'lỗi') + '). Anh gửi lại giúp em.' });
    } finally { S.busy = false; render(); }
  }

  /* ---------- Giao diện ---------- */
  let rq = 0, wantScroll = false;
  function render(scroll) { if (scroll) wantScroll = true; if (rq) return; rq = requestAnimationFrame(() => { rq = 0; renderAll(); }); }
  function staffStatusMap() {
    const m = {}; const rank = { idle: 0, ask: 1, work: 2 };
    for (const t of S.tasks.values()) { const s = (ST[t.status] || {}).s || 'idle'; if (rank[s] > rank[m[t.staff] || 'idle']) m[t.staff] = s; }
    const review = [...S.tasks.values()].some(t => t.status === 'cho_duyet' || t.status === 'cho_anh');
    if (review) m.tp = 'ask';
    return m;
  }
  function avatar(id, sm) { const s = STAFF[id] || STAFF.dp_thu; return `<span class="av ${id === 'dp_thu' ? 'av-dp' : ''} ${id === 'tp' ? 'av-tp' : ''} ${sm ? 'sm' : ''}" aria-hidden="true">${esc(initials(s))}</span>`; }
  function pill(st) { const x = ST[st] || ST.moi; return `<span class="pill t-${x.tone}">${esc(x.label)}</span>`; }

  function fileChips(files) {
    if (!files || !files.length) return '';
    return `<div class="files">${files.map(f => `<button class="file" data-act="dl" data-f='${esc(JSON.stringify(f))}'>${ICON.file}<span>${esc(f.name)}</span><small>${f.size ? Math.max(1, Math.round(f.size / 1024)) + ' KB' : ''}</small></button>`).join('')}</div>`;
  }
  function taskCard(t) {
    if (!t) return '';
    const s = STAFF[t.staff]; const info = S.sess[t.id];
    const check = (t.have || []).map(x => `<li class="ok">${esc(x)}</li>`).join('') + (t.missing || []).map(x => `<li class="miss">${esc(x)}</li>`).join('');
    const prep = !check && t.checklist && t.checklist.length ? `<div class="prep">Cần chuẩn bị: ${esc(t.checklist.join(' · '))}</div>` : '';
    let acts = '';
    if (t.status === 'moi') acts = `<button class="btn gold sm" data-act="run" data-id="${t.id}">${ICON.play}Giao thực thi</button><button class="btn ghost sm" data-act="more" data-id="${t.id}">Bổ sung</button><button class="btn ghost sm" data-act="cancel" data-id="${t.id}">Hủy</button>`;
    else if (t.status === 'loi') acts = `<button class="btn gold sm" data-act="run" data-id="${t.id}">Thử lại</button><button class="btn ghost sm" data-act="queue" data-id="${t.id}">Đưa vào hàng chờ</button>`;
    else if (t.status === 'dang_lam' || t.status === 'cho_anh') acts = t.sessionId && canRun('send_message') ? `<button class="btn ghost sm" data-act="fwd" data-id="${t.id}">Nhắn thêm cho ${esc(s.ten)}</button>` : '';
    const sessTxt = info ? `<span class="sess s-${info.k}">${esc(info.label)}</span>` : '';
    return `<div class="tcard" data-task="${t.id}">
      <div class="tc-top"><b>${esc(t.title)}</b>${pill(t.status)}</div>
      ${check ? `<ul class="check">${check}</ul>` : ''}${prep}
      ${t.progress && ['dang_lam', 'hang_cho'].includes(t.status) ? `<div class="prog"><span class="spin"></span>${esc(t.progress)}</div>` : ''}
      ${t.question && t.status === 'cho_anh' ? `<div class="ask">${md(t.question)}</div>` : ''}
      ${fileChips(t.files)}
      <div class="tc-acts">${acts}${t.sessionId ? `<a class="lnk" href="${sessionLink(t.sessionId)}" target="_blank" rel="noopener">Mở phiên làm việc ↗</a>` : ''}${['moi', 'hang_cho', 'loi'].includes(t.status) ? `<button class="lnk" data-act="copy" data-id="${t.id}">Sao chép phiếu</button>` : ''}${sessTxt}</div>
    </div>`;
  }
  function resultBlock(m) {
    const t = S.tasks.get(m.taskId);
    const next = (m.next || (t && t.result && t.result.next) || []).filter(n => n && n.label);
    const done = t && (t.status === 'xong' || t.status === 'huy');
    return `${fileChips(m.files)}
      <div class="next">${done ? `<span class="done-note">${ICON.check}Anh đã duyệt việc này</span>` : `<button class="btn navy sm" data-act="approve" data-id="${m.taskId}">${ICON.check}Duyệt – kết thúc</button><button class="btn ghost sm" data-act="revise" data-id="${m.taskId}">Yêu cầu sửa</button>`}</div>
      ${next.length ? `<div class="nx-label">Việc tiếp theo anh muốn giao?</div><div class="chips">${next.map(n => `<button class="chip" data-act="next" data-staff="${esc(n.staff || '')}" data-cmd="${esc(n.command || n.label)}">${esc(n.label)}${n.staff && STAFF[n.staff] ? ` <small>· ${esc(STAFF[n.staff].ten)}</small>` : ''}</button>`).join('')}</div>` : ''}`;
  }
  function noteActions(m) {
    if (!m.actions || !m.actions.length) return '';
    const t = m.taskId && S.tasks.get(m.taskId);
    if (t && !['moi', 'loi'].includes(t.status) && m.actions.some(a => a.id)) return '';
    return `<div class="tc-acts" style="margin-top:8px">${m.actions.map(a => `<button class="btn ${a.primary ? 'gold' : 'ghost'} sm" data-act="${esc(a.act)}"${a.id ? ` data-id="${esc(a.id)}"` : ''}>${esc(a.label)}</button>`).join('')}</div>`;
  }
  function intro() {
    const picks = ['cc_the', 'cc_gcn', 'gv_dsdd', 'gv_online', 'hd_baogia', 'kd_tracuu'];
    return `<div class="msg them intro">${avatar('dp_thu')}<div class="bub">
      <div class="who">Thư · Thư ký điều phối</div>
      <p>Chào anh. Anh nhắn việc cần làm, em giao đúng người. Nhân sự làm việc thật trong Claude Code bằng đúng quy trình và form chuẩn của DAKO, xong gửi kết quả về <b>Bàn duyệt</b>.</p>
      <div class="chips">${picks.map(id => `<button class="chip" data-act="quick" data-staff="${id}">${esc(STAFF[id].nhan)} <small>· ${esc(STAFF[id].ten)}</small></button>`).join('')}</div>
    </div></div>`;
  }
  function renderChat() {
    const box = $('#msgs'); const nearBottom = box.scrollHeight - box.scrollTop - box.clientHeight < 80;
    const list = threadMsgs();
    let html = intro();
    for (const m of list) {
      if (m.who === 'anh') { html += `<div class="msg me"><div class="bub">${md(m.text)}${fileChips(m.files)}<div class="meta">${fmtTime(m.t)}${m.to && m.to !== 'dp_thu' && STAFF[m.to] ? ' · gửi ' + esc(STAFF[m.to].ten) : ''}</div></div></div>`; continue; }
      const s = STAFF[m.who] || STAFF.dp_thu;
      const body = md(m.text) + (m.kind === 'task' ? taskCard(S.tasks.get(m.taskId)) : '') + (m.kind === 'result' ? resultBlock(m) : '') + (m.kind === 'question' ? `<div class="nx-label">Anh trả lời ngay trong khung chat, em chuyển vào phiên làm việc.</div>` : '') + noteActions(m);
      html += `<div class="msg them k-${esc(m.kind || 'text')}">${avatar(s.id)}<div class="bub"><div class="who">${esc(s.ten)} · ${esc(s.chuc_danh)}</div>${body}<div class="meta">${fmtTime(m.t)}${m.session ? ` · <a href="${sessionLink(m.session)}" target="_blank" rel="noopener">phiên Claude Code ↗</a>` : ''}</div></div></div>`;
    }
    if (S.busy) html += `<div class="msg them typing">${avatar(S.to)}<div class="bub"><span class="dots"><i></i><i></i><i></i></span></div></div>`;
    box.innerHTML = html;
    if (wantScroll || nearBottom) box.scrollTop = box.scrollHeight;
    wantScroll = false;
  }
  function renderHead() {
    const s = STAFF[S.to] || STAFF.dp_thu, st = staffStatusMap()[s.id] || 'idle';
    $('#whoBtn').innerHTML = `<span class="dot d-${st}"></span><span class="wl">${esc(s.id === 'dp_thu' ? 'Điều phối – tự chọn người' : s.ten + ' · ' + s.chuc_danh)}</span>${ICON.chev}`;
    const fw = S.forward && S.tasks.get(S.forward);
    $('#fwdBar').hidden = !fw; if (fw) $('#fwdText').textContent = `Đang nhắn vào phiên làm việc của ${STAFF[fw.staff].ten}: “${fw.title}”`;
    const hint = [];
    hint.push(S.cap.sample ? 'Điều phối: AI' : 'Điều phối: theo từ khóa');
    hint.push(!canRun('create_session') ? 'Thực thi: hàng chờ' : S.ccrPerm === 'granted' ? 'Thực thi: Claude Code' : S.ccrPerm === 'denied' ? 'Thực thi: Claude Code (quyền đang tắt)' : 'Thực thi: Claude Code (chưa cho phép)');
    hint.push(S.cap.assets ? 'Tệp: tối đa 100 MB' : S.cap.db ? 'Tệp: tối đa 12 MB' : S.capReady ? 'Tệp: chưa tải được' : 'Tệp: đang kiểm tra…');
    if (S.dbState === 'off') hint.push('Chưa lưu được dữ liệu');
    $('#capHint').textContent = hint.join(' · ');
    const ban = capBanner(); $('#capBanner').innerHTML = ban; $('#capBanner').hidden = !ban;
    $('#send').disabled = S.busy;
  }
  function framed() { try { return window.top !== window.self; } catch (e) { return true; } }
  function capBanner() {
    if (!S.capReady) return '';
    if ((S.cap.db || S.cap.assets) && canRun('create_session') && (S.ccrPerm === 'prompt' || S.ccrPerm === 'denied')) {
      return S.ccrPerm === 'denied'
        ? `<b>Quyền mở phiên Claude Code đang tắt</b><p>Nhân sự chưa làm việc được. Bật lại “Claude Code Remote” trong bảng quyền của trang.</p><div class="tc-acts" style="margin-top:6px"><button class="btn gold sm" data-act="permpanel">Mở bảng quyền</button></div>`
        : `<b>Cho phép văn phòng mở phiên Claude Code</b><p>Một lần duy nhất: claude.ai hỏi anh có cho trang dùng kết nối Claude Code Remote không. Chọn <b>Cho phép</b> để nhân sự làm việc thật.</p><div class="tc-acts" style="margin-top:6px"><button class="btn gold sm" data-act="grant">Cho phép ngay</button></div>`;
    }
    if (!S.cap.db && !S.cap.assets) {
      const outside = !(window.claude && window.claude.use) || !framed();
      return `<details><summary><b>Chế độ xem này chưa lưu việc và chưa nhận tệp</b> <span class="lnk">Cách khắc phục</span></summary>
        <p>${outside ? 'Trang đang mở ngoài khung xem của Claude (ví dụ mở link bằng trình duyệt khác), nên không lưu việc, không tải tệp và không gọi được Claude Code.' : 'Chế độ xem này chưa cấp cho trang quyền lưu dữ liệu và tải tệp.'}</p>
        <p>Để dùng đầy đủ: mở <b>claude.ai</b> bằng Chrome hoặc Edge trên máy tính, đăng nhập tài khoản chủ trang, vào <b>Artifacts</b> → “Văn phòng ảo DAKO”. Trong lúc này anh vẫn giao việc được: bấm <b>Sao chép phiếu</b> rồi dán vào Claude Code, tệp gửi thẳng ở đó.</p></details>`;
    }
    if (!S.cap.assets) return `<details><summary><b>Tệp lưu vào kho dự phòng, tối đa 12 MB</b> <span class="lnk">Chi tiết</span></summary><p>Chế độ xem này không có kho tệp nên trang lưu tệp vào kho dữ liệu. Tệp lớn hơn 12 MB: mở trang trên claude.ai bằng máy tính.</p></details>`;
    return '';
  }
  function renderAtt() {
    $('#attList').innerHTML = S.pending.map((p, i) => `<span class="att a-${p.state || 'wait'}" title="${esc(p.note || '')}">${p.state === 'up' ? '<span class="spin"></span>' : ICON.file}<span class="an">${esc(p.file.name)}</span><small>${esc(p.note || mb(p.file.size))}</small>${p.state === 'up' ? '' : `<button data-act="rmatt" data-i="${i}" aria-label="Bỏ tệp ${esc(p.file.name)}">×</button>`}</span>`).join('');
    $('#attList').hidden = !S.pending.length;
  }
  function deptStats(id) {
    const ts = [...S.tasks.values()].filter(t => STAFF[t.staff] && STAFF[t.staff].phong === id);
    const work = ts.filter(t => ['dang_lam', 'hang_cho'].includes(t.status)).length;
    const ask = ts.filter(t => ['moi', 'cho_anh', 'cho_duyet', 'loi'].includes(t.status)).length;
    const mth = new Date().toISOString().slice(0, 7);
    const done = ts.filter(t => t.status === 'xong' && (t.updatedAt || '').slice(0, 7) === mth).length;
    return { work, ask, done, all: ts };
  }
  function tagText(id) {
    if (id === 'dp') { const n = openTasks().length; return { s: n ? 'work' : 'idle', t: n ? `${n} việc đang mở` : 'Sẵn sàng nhận lệnh' }; }
    if (id === 'tp') { const n = [...S.tasks.values()].filter(t => ['cho_duyet', 'cho_anh'].includes(t.status)).length; return { s: n ? 'ask' : 'idle', t: n ? `${n} việc chờ anh` : 'Bàn duyệt trống' }; }
    const st = deptStats(id);
    if (st.work) return { s: 'work', t: `${st.work} việc đang làm` };
    if (st.ask) return { s: 'ask', t: `${st.ask} việc chờ anh` };
    return { s: 'idle', t: st.done ? `${st.done} việc xong tháng này` : 'Rảnh' };
  }
  function renderTags() {
    const narrow = innerWidth <= 760;
    $('#tags').innerHTML = R.phong.map(d => { const x = tagText(d.id); return `<button class="rtag" data-room="${d.id}" title="${esc(d.ten + ' · ' + x.t)}"><span class="dot d-${x.s}"></span><b>${esc(narrow ? d.ngan : d.ten)}</b>${narrow ? '' : `<span>· ${esc(x.t)}</span>`}</button>`; }).join('')
      + (S.roomOpen ? R.nhan_su.concat([STAFF.tp]).filter(s => s.phong === S.roomOpen).map(s => `<button class="ntag" data-staff="${s.id}">${esc(s.ten)}</button>`).join('') : '');
    placeTags();
  }
  function placeTags() {
    if (!Office.ready) return;
    const st = $('#stage').getBoundingClientRect();
    document.querySelectorAll('#tags .rtag').forEach(el => { const a = Office.roomAnchor(el.dataset.room); if (!a) return; const p = Office.project(a);
      el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y)}px) translate(-50%, -100%)`; el.style.visibility = p.x < -40 || p.y < -10 || p.x > st.width + 40 || p.y > st.height + 40 ? 'hidden' : 'visible'; });
    document.querySelectorAll('#tags .ntag').forEach(el => { const a = Office.staffAnchor(el.dataset.staff); if (!a) return; const p = Office.project(a);
      el.style.transform = `translate(${Math.round(p.x)}px, ${Math.round(p.y - 14)}px) translate(-50%, -100%)`; });
  }
  function renderRoom() {
    const id = S.roomOpen, el = $('#roomPanel');
    el.hidden = !id; $('#quick').hidden = !!id;
    if (!id) return;
    const d = DEPT[id]; const sm = staffStatusMap();
    const staff = R.nhan_su.filter(s => s.phong === id);
    const st = deptStats(id);
    const links = id === 'tp' ? `<div class="links"><a href="${R.lien_ket.quan_ly}" target="_blank" rel="noopener">Công cụ Quản lý Huấn luyện ↗</a><a href="${R.lien_ket.tra_cuu}" target="_blank" rel="noopener">Tra cứu nhóm huấn luyện ↗</a><a href="${R.lien_ket.drive_form}" target="_blank" rel="noopener">Thư mục form chuẩn trên Drive ↗</a></div>`
      : id === 'lt' ? `<div class="links"><a href="${R.lien_ket.drive_form}" target="_blank" rel="noopener">Thư mục form chuẩn trên Drive ↗</a></div>`
      : id === 'hd' || id === 'xl' ? `<div class="links"><a href="${R.lien_ket.quan_ly}" target="_blank" rel="noopener">Công cụ Quản lý Huấn luyện ↗</a></div>`
      : id === 'kd' ? `<div class="links"><a href="${R.lien_ket.tra_cuu}" target="_blank" rel="noopener">Tra cứu nhóm huấn luyện ↗</a></div>` : '';
    const recent = (id === 'tp' ? [...S.tasks.values()].filter(t => ['cho_duyet', 'cho_anh', 'moi'].includes(t.status)) : st.all).sort((a, b) => ((a.updatedAt || a.createdAt) < (b.updatedAt || b.createdAt) ? 1 : -1)).slice(0, 6);
    el.innerHTML = `<div class="rp-head"><div><div class="slug">${esc(d.slug)}${d.buoc ? ` · bước ${d.buoc}/6` : ''}</div><h3>${esc(d.ten)}</h3></div><button class="icon-btn" data-act="closeroom" aria-label="Đóng">×</button></div>
      <p class="rp-desc">${esc(d.mo_ta)}</p>${links}
      ${staff.map(s => `<details class="sc"><summary>${avatar(s.id)}<span class="sc-main"><b>${esc(s.ten)}</b><small>${esc(s.chuc_danh)}</small></span><span class="dot d-${sm[s.id] || 'idle'}" title="${{ idle: 'Rảnh', work: 'Đang làm', ask: 'Chờ anh' }[sm[s.id] || 'idle']}"></span></summary>
        <div class="sc-body"><p>${esc(s.viec)}</p>
        <div class="kv"><span>Làm</span><ul>${s.lam.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>
        ${s.can.length ? `<div class="kv"><span>Cần anh gửi</span><ul>${s.can.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        ${s.ra.length ? `<div class="kv"><span>Giao ra</span><ul>${s.ra.map(x => `<li>${esc(x)}</li>`).join('')}</ul></div>` : ''}
        ${s.ky_nang.length ? `<div class="kv"><span>Quy trình</span><p class="mono">${esc(s.ky_nang.join(' · '))}</p></div>` : ''}
        <button class="btn gold sm" data-act="assignTo" data-staff="${s.id}">Giao việc cho ${esc(s.ten)}</button></div></details>`).join('')}
      <h4>${id === 'tp' ? 'Việc chờ anh' : 'Việc gần đây'}</h4>
      ${recent.length ? `<ul class="recent">${recent.map(t => `<li><button data-act="openTask" data-id="${t.id}"><span>${esc(t.title)}</span>${pill(t.status)}</button></li>`).join('')}</ul>` : `<p class="muted">Chưa có việc nào. Bấm “Giao việc” ở một nhân sự để bắt đầu.</p>`}`;
  }
  function renderQuick() {
    const ids = ['cc_the', 'cc_gcn', 'cc_socap', 'gv_dsdd', 'gv_online', 'gv_chuyencan', 'hd_baogia', 'hd_hopdong', 'xl_lich', 'kd_tracuu'];
    $('#quickList').innerHTML = ids.map(id => `<li><button data-act="quick" data-staff="${id}"><span>${esc(STAFF[id].nhan)}</span><span class="qn">${esc(STAFF[id].ten)}</span></button></li>`).join('');
  }
  function renderDash() {
    const all = [...S.tasks.values()]; const mth = new Date().toISOString().slice(0, 7);
    const work = all.filter(t => ['dang_lam', 'hang_cho'].includes(t.status)).length;
    const review = all.filter(t => ['cho_duyet', 'cho_anh', 'moi', 'loi'].includes(t.status)).length;
    const done = all.filter(t => t.status === 'xong' && (t.updatedAt || '').slice(0, 7) === mth).length;
    $('#kWork').textContent = work; $('#kReview').textContent = review; $('#kDone').textContent = done; $('#kAll').textContent = all.length;
    $('#reviewCount').textContent = all.filter(t => ['cho_duyet', 'cho_anh'].includes(t.status)).length;
    $('#reviewCount').hidden = !Number($('#reviewCount').textContent);
    $('#flow').innerHTML = FLOW.map((id, i) => { const st = deptStats(id); const d = DEPT[id];
      return `<button class="fstep ${st.work ? 'on' : ''}" data-room="${id}"><span class="fn">${i + 1}</span><span class="ft">${esc(d.ngan)}</span><span class="fc"><b>${st.work + st.ask}</b> mở · ${st.done} xong</span></button>`; }).join('<span class="farr" aria-hidden="true"></span>');
    const days = []; for (let i = 6; i >= 0; i--) { const d = new Date(); d.setDate(d.getDate() - i); days.push(d); }
    const key = d => d.toISOString().slice(0, 10);
    const cnt = days.map(d => all.filter(t => (t.createdAt || '').slice(0, 10) === key(d)).length);
    const fin = days.map(d => all.filter(t => t.status === 'xong' && (t.updatedAt || '').slice(0, 10) === key(d)).length);
    const max = Math.max(2, ...cnt, ...fin); const W = 210, H = 70, bw = 11;
    let svg = `<svg viewBox="0 0 ${W} ${H + 16}" class="bars" role="img" aria-label="Việc giao và việc xong 7 ngày qua"><line x1="0" y1="${H}" x2="${W}" y2="${H}" class="ax"/>`;
    days.forEach((d, i) => { const x = 8 + i * 29; const h1 = cnt[i] / max * (H - 6), h2 = fin[i] / max * (H - 6);
      svg += `<rect x="${x}" y="${H - h1}" width="${bw}" height="${h1}" rx="2" class="b1"><title>${cnt[i]} việc giao</title></rect><rect x="${x + bw + 2}" y="${H - h2}" width="${bw}" height="${h2}" rx="2" class="b2"><title>${fin[i]} việc xong</title></rect>`;
      svg += `<text x="${x + bw}" y="${H + 13}" text-anchor="middle">${d.getDate()}/${d.getMonth() + 1}</text>`; });
    $('#act').innerHTML = svg + '</svg>';
  }
  function renderDrawer() {
    if ($('#drawer').hidden) return;
    const all = [...S.tasks.values()].sort((a, b) => ((a.updatedAt || a.createdAt) < (b.updatedAt || b.createdAt) ? 1 : -1));
    const groups = [['Chờ anh duyệt', t => t.status === 'cho_duyet'], ['Chờ anh trả lời', t => t.status === 'cho_anh'], ['Đang làm', t => ['dang_lam', 'hang_cho'].includes(t.status)],
      ['Chờ anh giao thực thi', t => ['moi', 'loi'].includes(t.status)], ['Đã xong gần đây', t => t.status === 'xong']];
    $('#drawerBody').innerHTML = groups.map(([name, f]) => { const ls = all.filter(f).slice(0, name.startsWith('Đã xong') ? 12 : 50);
      return `<section><h4>${esc(name)} <span class="cnt">${ls.length}</span></h4>${ls.length ? `<ul class="dlist">${ls.map(t => `<li><button data-act="openTask" data-id="${t.id}">${avatar(t.staff, true)}<span class="dl-main"><b>${esc(t.title)}</b><small>${esc((STAFF[t.staff] || {}).ten || '')} · ${esc(DEPT[(STAFF[t.staff] || {}).phong || 'dp'].ten)} · ${fmtTime(t.updatedAt || t.createdAt)}${t.nguon ? ' · ' + esc(t.nguon) : ''}</small></span>${pill(t.status)}</button></li>`).join('')}</ul>` : '<p class="muted">Không có.</p>'}</section>`; }).join('');
  }
  function renderAll() {
    renderChat(); renderHead(); renderDash(); renderTags(); renderRoom(); renderDrawer();
    if (Office.ready) Office.setStatus(staffStatusMap());
    else renderFallback();
  }
  function renderFallback() {
    const el = $('#fallback'); el.hidden = false;
    el.innerHTML = R.phong.map(d => { const x = tagText(d.id); return `<button class="fb-room" style="grid-row:${d.o[0] + 1};grid-column:${d.o[1] + 1}" data-room="${d.id}"><span class="slug">${esc(d.slug)}</span><b>${esc(d.ten)}</b><span><span class="dot d-${x.s}"></span>${esc(x.t)}</span></button>`; }).join('');
  }

  /* ---------- Phiên đang chạy ---------- */
  async function pollSessions() {
    clearTimeout(pollSessions.t); pollSessions.t = setTimeout(pollSessions, 45000);
    if (!canRun('get_session') || document.hidden) return;
    const act = [...S.tasks.values()].filter(t => t.sessionId && ['dang_lam', 'cho_anh'].includes(t.status)).slice(0, 4);
    for (const t of act) {
      try {
        const r = await S.cap.mcp.callTool(CCR, 'get_session', { session_id: t.sessionId }, { cache: false });
        const b = (JSON.stringify(r.payload || r).match(/SESSION_STATUS_BUCKET_([A-Z_]+)|"status_bucket":"([a-z_]+)"/) || []);
        const k = String(b[1] || b[2] || '').toLowerCase();
        S.sess[t.id] = k.includes('fail') ? { k: 'bad', label: 'Phiên gặp lỗi' } : k.includes('block') ? { k: 'ask', label: 'Phiên chờ anh trả lời' }
          : k.includes('work') ? { k: 'work', label: 'Phiên đang chạy' } : k ? { k: 'idle', label: 'Phiên đã dừng – mở phiên xem kết quả' } : null;
      } catch (e) { if (e && e.code !== 'server_unavailable') S.sess[t.id] = null; }
    }
    render();
  }

  /* ---------- Điều khiển ---------- */
  function setTo(id, prefill) {
    S.to = STAFF[id] ? id : 'dp_thu';
    if (prefill != null) { $('#input').value = prefill; autosize(); }
    setTab('chat'); render(); $('#input').focus();
  }
  function openRoom(id) {
    S.roomOpen = id; const wide = innerWidth > 760;
    Office.setPadLeft(wide ? 360 : 0); Office.focusRoom(id); render();
  }
  function closeRoom() { S.roomOpen = null; Office.setPadLeft(innerWidth > 760 ? 250 : 0); Office.fit(); render(); }
  function openThreadOf(id) {
    const t = S.tasks.get(id); if (!t) return;
    if (t.thread) { S.thread = t.thread; store.set('vp-thread', S.thread); }
    S.to = t.staff; $('#drawer').hidden = true; setTab('chat'); render(true);
    setTimeout(() => { const el = document.querySelector(`[data-task="${id}"]`); if (el) el.scrollIntoView({ block: 'center', behavior: 'smooth' }); }, 120);
  }
  function setTab(tab) { document.body.dataset.tab = tab; document.querySelectorAll('.mtabs button').forEach(b => b.setAttribute('aria-pressed', b.dataset.tab === tab)); }

  document.addEventListener('click', e => {
    const b = e.target.closest('[data-act],[data-room],[data-staff],[data-tab],[data-scene]'); if (!b) return;
    const a = b.dataset.act, id = b.dataset.id;
    if (b.dataset.scene) { Office.setTheme(b.dataset.scene); store.set('vp-scene', b.dataset.scene); document.querySelectorAll('[data-scene]').forEach(x => x.setAttribute('aria-pressed', x === b)); return; }
    if (b.dataset.tab && !a) { setTab(b.dataset.tab); if (b.dataset.tab === 'board') { $('#drawer').hidden = false; renderDrawer(); } return; }
    switch (a) {
      case 'run': return execute(id);
      case 'grant': return (async () => { const st = await ensurePerm(); if (st === 'granted' && id) return execute(id);
        if (st === 'denied') return openPermPanel(); if (st === 'granted') return toast('Đã cho phép. Nhân sự mở phiên Claude Code được rồi.');
        if (st === 'unknown' && id) return execute(id);
        toast('Hộp hỏi quyền chưa được xác nhận. Anh bấm lại và chọn Cho phép, hoặc mở menu của trang → Quyền.', 7000); })();
      case 'permpanel': return openPermPanel();
      case 'queue': return queue(id);
      case 'copy': return copyTicket(id);
      case 'cancel': saveTask(id, { status: 'huy' }); return addMsg({ who: 'dp_thu', taskId: id, kind: 'note', text: 'Đã hủy việc này.' });
      case 'more': { const t = S.tasks.get(id); return setTo(t.staff, ''); }
      case 'fwd': S.forward = id; return setTo(S.tasks.get(id).staff);
      case 'approve': { const t = S.tasks.get(id); if (!t) return; saveTask(id, { status: 'xong' }); Office.flash(t.staff);
        S.to = 'dp_thu'; return addMsg({ who: 'dp_thu', taskId: id, kind: 'note', text: `Đã đóng việc “${t.title}”. Anh giao việc tiếp theo hay kết thúc hôm nay ạ?` }); }
      case 'revise': { const t = S.tasks.get(id); if (!t) return; if (t.sessionId && canRun('send_message')) S.forward = id; return setTo(t.staff, 'Sửa lại: '); }
      case 'next': return setTo(b.dataset.staff || 'dp_thu', b.dataset.cmd || '');
      case 'quick': case 'assignTo': { const s = STAFF[b.dataset.staff]; $('#assignModal').hidden = true; return setTo(s.id, s.lenh_mau || ''); }
      case 'dl': try { return download(JSON.parse(b.dataset.f), b); } catch (err) { return; }
      case 'rmatt': if (S.busy) return; S.pending.splice(Number(b.dataset.i), 1); if (!S.pending.some(p => p.state === 'bad')) setCompErr(''); return renderAtt();
      case 'closeroom': return closeRoom();
      case 'openTask': return openThreadOf(id);
      case 'pickwho': $('#whoModal').hidden = true; return setTo(b.dataset.staff);
    }
    if (b.dataset.room) return openRoom(b.dataset.room);
    if (b.dataset.staff && b.classList.contains('ntag')) return setTo(b.dataset.staff);
  });

  /* ---------- Biểu mẫu và hộp thoại ---------- */
  const input = $('#input');
  function autosize() { input.style.height = 'auto'; input.style.height = Math.min(input.scrollHeight, 160) + 'px'; }
  input.addEventListener('input', autosize);
  input.addEventListener('keydown', e => { if (e.key === 'Enter' && !e.shiftKey && !e.isComposing) { e.preventDefault(); send(); } });
  $('#send').addEventListener('click', () => send());
  $('#file').addEventListener('change', e => { addFiles([...e.target.files]); e.target.value = ''; });
  $('#chat').addEventListener('dragover', e => { e.preventDefault(); $('#chat').classList.add('drop'); });
  $('#chat').addEventListener('dragleave', e => { if (e.target === $('#chat')) $('#chat').classList.remove('drop'); });
  $('#chat').addEventListener('drop', e => { e.preventDefault(); $('#chat').classList.remove('drop'); addFiles([...(e.dataTransfer && e.dataTransfer.files || [])]); });
  $('#input').addEventListener('paste', e => { const fs = [...(e.clipboardData && e.clipboardData.files || [])]; if (fs.length) addFiles(fs); });
  $('#fwdCancel').addEventListener('click', () => { S.forward = null; render(); });
  $('#btnNew').addEventListener('click', () => { S.thread = 'th' + rand(10); store.set('vp-thread', S.thread); S.to = 'dp_thu'; S.forward = null; render(true); input.focus(); });
  $('#whoBtn').addEventListener('click', () => {
    $('#whoList').innerHTML = R.phong.filter(d => d.id !== 'tp').map(d => `<section><h4>${esc(d.ten)}</h4>${R.nhan_su.filter(s => s.phong === d.id).map(s => `<button class="whoitem" data-act="pickwho" data-staff="${s.id}">${avatar(s.id, true)}<span><b>${esc(s.ten)}</b><small>${esc(s.chuc_danh)}</small></span></button>`).join('')}</section>`).join('');
    $('#whoModal').hidden = false;
  });
  $('#btnReview').addEventListener('click', () => { $('#drawer').hidden = false; renderDrawer(); });
  $('#drawerClose').addEventListener('click', () => { $('#drawer').hidden = true; if (document.body.dataset.tab === 'board') setTab('office'); });
  $('#btnAssign').addEventListener('click', () => {
    $('#asWho').innerHTML = `<option value="dp_thu">Điều phối tự chọn người phù hợp</option>` + R.phong.filter(d => !['tp', 'dp'].includes(d.id)).map(d => `<optgroup label="${esc(d.ten)}">${R.nhan_su.filter(s => s.phong === d.id).map(s => `<option value="${s.id}">${esc(s.ten)} – ${esc(s.viec)}</option>`).join('')}</optgroup>`).join('');
    $('#asWho').value = S.to; $('#asText').value = ''; $('#asFiles').value = ''; $('#assignModal').hidden = false; $('#asText').focus();
  });
  $('#asWho').addEventListener('change', e => { const s = STAFF[e.target.value]; if (s && s.lenh_mau && !$('#asText').value.trim()) $('#asText').placeholder = 'Ví dụ: ' + s.lenh_mau; });
  $('#assignForm').addEventListener('submit', e => {
    e.preventDefault(); const txt = $('#asText').value.trim(); if (!txt) return $('#asText').focus();
    addFiles([...$('#asFiles').files]);
    $('#assignModal').hidden = true; S.to = $('#asWho').value; setTab('chat'); send(txt, S.to, { assign: true });
  });
  document.querySelectorAll('[data-close]').forEach(b => b.addEventListener('click', () => (b.closest('.modal').hidden = true)));
  document.addEventListener('keydown', e => { if (e.key === 'Escape') { document.querySelectorAll('.modal').forEach(m => (m.hidden = true)); $('#drawer').hidden = true; } });
  $('#zIn').addEventListener('click', () => Office.zoomBy(1.25));
  $('#zOut').addEventListener('click', () => Office.zoomBy(0.8));
  $('#zFit').addEventListener('click', () => (S.roomOpen ? closeRoom() : Office.fit()));
  $('#ticketCopy').addEventListener('click', async () => { try { await navigator.clipboard.writeText($('#ticketText').value); toast('Đã sao chép.'); } catch (e) { $('#ticketText').select(); } });

  /* ---------- Khởi động ---------- */
  renderQuick(); setTab('office');
  const sceneOk = Office.init($('#stage'), $('#cv'), R, { logo: window.LOGO });
  if (!sceneOk) { $('#cv').hidden = true; renderFallback(); }
  const prefersDark = matchMedia('(prefers-color-scheme: dark)').matches || document.documentElement.dataset.theme === 'dark';
  const scene0 = store.get('vp-scene') || (prefersDark ? 'dem' : 'sang');
  Office.setTheme(scene0); document.querySelectorAll('[data-scene]').forEach(x => x.setAttribute('aria-pressed', x.dataset.scene === scene0));
  Office.setPadLeft(innerWidth > 760 ? 250 : 0); Office.fit(false);
  Office.onFrame(changed => { if (changed) placeTags(); });
  Office.onPick(u => {
    if (!u) return;
    if (u.review) { $('#drawer').hidden = false; return renderDrawer(); }
    if (u.staff) { const s = STAFF[u.staff]; if (s.id === 'tp') { $('#drawer').hidden = false; return renderDrawer(); } openRoom(s.phong); if (innerWidth > 760) return setTo(s.id); S.to = s.id; return render(); }
    if (u.room) openRoom(u.room);
  });
  Office.onHover((u, e) => {
    const tip = $('#tip');
    if (!u || !(u.staff || u.review)) { tip.hidden = true; return; }
    const r = $('#stage').getBoundingClientRect();
    if (u.review) tip.innerHTML = '<b>Bàn duyệt</b><span>Kết quả nhân sự gửi lên</span>';
    else { const s = STAFF[u.staff], st = staffStatusMap()[s.id] || 'idle'; tip.innerHTML = `<b>${esc(s.id === 'tp' ? 'Trưởng phòng' : s.ten + ' · ' + s.chuc_danh)}</b><span>${esc(s.viec)}</span><span class="st"><span class="dot d-${st}"></span>${{ idle: 'Rảnh – bấm để giao việc', work: 'Đang làm', ask: 'Chờ anh' }[st]}</span>`; }
    tip.style.transform = `translate(${Math.round(e.clientX - r.left + 14)}px, ${Math.round(e.clientY - r.top + 14)}px)`; tip.hidden = false;
  });
  if (document.fonts) document.fonts.ready.then(() => Office.redrawBoards());
  ['Anton', 'JetBrains Mono'].forEach(f => document.fonts && document.fonts.load(`40px "${f}"`).then(() => Office.redrawBoards()).catch(() => {}));
  render(true);
})();
