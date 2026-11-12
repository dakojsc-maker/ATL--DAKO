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
  use('db').then(db => { if (db) connectDb(db); else { S.dbState = 'off'; render(); } });
  use('assets').then(a => { S.cap.assets = a; render(); });
  use('sample').then(s => { S.cap.sample = s; render(); });
  use('downloads').then(d => { S.cap.downloads = d; });
  use('mcp').then(async m => {
    S.cap.mcp = m; if (!m) return render();
    try { const r = await m.listTools(CCR); const sv = (r.servers || []).find(x => x.server === CCR); S.mcpTools = sv ? new Set(sv.tools.map(t => t.name)) : new Set(); }
    catch (e) { S.mcpTools = new Set(); }
    render(); pollSessions();
  });
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
  const RAW_OK = /^(image\/(png|jpe?g|webp|gif)|application\/pdf|text\/(csv|plain|markdown)|application\/json)$/;
  const B64_MAX = 14.5 * 1024 * 1024, RAW_MAX = 20 * 1024 * 1024;
  const extType = n => ({ xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', xls: 'application/vnd.ms-excel',
    docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', doc: 'application/msword',
    pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation', zip: 'application/zip', rar: 'application/vnd.rar',
    pdf: 'application/pdf', jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', webp: 'image/webp', csv: 'text/csv', txt: 'text/plain', json: 'application/json', md: 'text/markdown', heic: 'image/heic' }[(n.split('.').pop() || '').toLowerCase()] || 'application/octet-stream');
  function b64(buf) { let s = ''; const u = new Uint8Array(buf); for (let i = 0; i < u.length; i += 0x8000) s += String.fromCharCode.apply(null, u.subarray(i, i + 0x8000)); return btoa(s); }
  async function uploadOne(f) {
    const type = f.type || extType(f.name);
    if (!S.cap.assets) throw { code: 'no_assets' };
    if (RAW_OK.test(type) && f.size <= RAW_MAX) {
      const r = await S.cap.assets.upload(f, { type });
      return { id: r.id, name: f.name, type, size: f.size, enc: 'raw', at: now() };
    }
    if (f.size > B64_MAX) throw { code: 'too_big' };
    const text = b64(await f.arrayBuffer());
    const r = await S.cap.assets.upload(new Blob([text], { type: 'text/plain' }), { type: 'text/plain' });
    return { id: r.id, name: f.name, type, size: f.size, enc: 'b64', at: now() };
  }
  async function uploadPending() {
    const out = [];
    for (const p of S.pending) {
      try { p.state = 'up'; renderAtt(); out.push(await uploadOne(p.file)); p.state = 'ok'; }
      catch (e) {
        p.state = 'bad';
        toast(e.code === 'too_big' ? `“${p.file.name}” lớn hơn 14 MB: anh gửi thẳng trong Claude Code nhé.`
          : e.code === 'no_assets' ? 'Chế độ xem này chưa tải tệp lên được. Anh mở trang trên claude.ai bằng tài khoản chủ trang.'
          : `Chưa tải được “${p.file.name}”: ${e.message || e.code}`, 6000);
      }
    }
    S.pending = []; renderAtt(); return out;
  }
  async function download(f) {
    try {
      const res = await fetch(f.url || '/_blob/' + f.id); if (!res.ok) throw new Error('HTTP ' + res.status);
      let blob;
      if (f.enc === 'b64') { const txt = (await res.text()).replace(/\s+/g, ''); const bin = atob(txt); const u = new Uint8Array(bin.length); for (let i = 0; i < bin.length; i++) u[i] = bin.charCodeAt(i); blob = new Blob([u], { type: f.type }); }
      else blob = await res.blob();
      if (S.cap.downloads) { await S.cap.downloads.save({ filename: f.name, data: blob }); }
      else toast('Chế độ xem này không cho tải tệp. Mở phiên Claude Code của việc này để lấy tệp.');
    } catch (e) {
      if (e && e.code === 'declined') return;
      toast(e && e.code === 'rejected_extension' ? `Không tải được loại tệp “${f.name}” trong trang; mở phiên Claude Code để lấy.` : 'Chưa tải được tệp: ' + (e.message || e.code));
    }
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
Tệp anh gửi kèm (kho tệp của văn phòng ảo): ${t.files && t.files.length ? '\n' + t.files.map(f => `- ${f.name} (id: ${f.id}, enc: ${f.enc}, ${Math.round(f.size / 1024)} KB)`).join('\n') : 'không có'}
Văn phòng ảo: ${CFG.artifactUrl || '(xem config/main)'} — bản ghi tasks/${t.id}, cuộc chat ${t.thread}.
Gợi ý việc tiếp theo cho: ${(s.tiep || []).map(id => `${id} (${STAFF[id].ten} – ${STAFF[id].viec})`).join('; ') || 'tùy kết quả'}
Làm theo kỹ năng "van-phong-dako" (repo dakojsc-maker/ATL--DAKO, .claude/skills/van-phong-dako/SKILL.md): nhận tệp, báo tiến độ, trả kết quả và gợi ý việc tiếp theo về văn phòng ảo.`;
  }
  const sessionLink = id => 'https://claude.ai/code/' + id;
  function findSession(r) { const m = JSON.stringify(r && (r.payload || r) || '').match(/session_[A-Za-z0-9]+/); return m ? m[0] : null; }

  async function execute(id) {
    const t = S.tasks.get(id); if (!t || !['moi', 'loi', 'hang_cho'].includes(t.status)) return;
    const s = STAFF[t.staff];
    Office.dispatch(s.phong, s.id);
    if (!canRun('create_session')) return queue(id);
    saveTask(id, { status: 'dang_lam', mode: 'phien', progress: 'Đang mở phiên làm việc…' });
    try {
      const r = await S.cap.mcp.callTool(CCR, 'create_session', {
        prompt: ticket(Object.assign({}, t, { id })), title: `DAKO · ${s.ten} · ${t.title}`.slice(0, 120),
        source_url: CFG.repo, source_revision: CFG.nhanh, environment_id: CFG.moi_truong, tags: ['van-phong-dako', 'phong-' + s.phong]
      });
      const sid = findSession(r);
      saveTask(id, { sessionId: sid, progress: 'Đã nhận việc, đang làm' });
      addMsg({ who: s.id, thread: t.thread, taskId: id, kind: 'note', session: sid,
        text: `Dạ, em bắt đầu làm “${t.title}”. Xong em gửi kết quả về đây và vào mục **Bàn duyệt**.` });
    } catch (e) {
      const c = e && e.code;
      if (['not_in_manifest', 'server_not_connected', 'blocked_by_policy', 'not_granted', 'capability_disabled', 'capability_removed', 'selection_required', 'needs_reauth'].includes(c)) {
        if (c !== 'needs_reauth' && c !== 'selection_required') S.mcpBlocked = true;
        saveTask(id, { status: 'moi' });
        return queue(id, c === 'needs_reauth' ? 'Kết nối Claude Code Remote cần đăng nhập lại (Cài đặt → Kết nối trên claude.ai).'
          : c === 'selection_required' ? 'Anh có nhiều kết nối Claude Code Remote, cần chọn một kết nối cho trang này.'
          : 'Trang chưa được phép mở phiên Claude Code.');
      }
      if (c === 'approval_required') {
        saveTask(id, { status: 'moi', progress: null });
        return addMsg({ who: 'dp_thu', thread: t.thread, taskId: id, kind: 'note', text: 'Văn phòng cần anh **cho phép** dùng kết nối Claude Code Remote. Anh bấm “Giao thực thi” lần nữa và chọn Cho phép.' });
      }
      saveTask(id, { status: 'loi', progress: null, error: (e && (e.message || c)) || 'không rõ' });
      addMsg({ who: 'dp_thu', thread: t.thread, taskId: id, kind: 'note',
        text: `Chưa mở được phiên làm việc (${esc(c || 'lỗi')}). Có thể phiên đã được tạo: anh xem danh sách phiên trong Claude Code trước khi bấm lại, hoặc chọn **Đưa vào hàng chờ**.` });
    }
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
    const msg = `[Trưởng phòng nhắn từ văn phòng ảo – việc ${t.id}]\n${text}${files.length ? '\nTệp mới (kho tệp văn phòng ảo):\n' + files.map(f => `- ${f.name} (id: ${f.id}, enc: ${f.enc})`).join('\n') : ''}`;
    await S.cap.mcp.callTool(CCR, 'send_message', { session_id: t.sessionId, message: msg });
    saveTask(t.id, { status: 'dang_lam', question: null, files: (t.files || []).concat(files) });
    addMsg({ who: 'dp_thu', taskId: t.id, kind: 'note', text: `Em đã chuyển lời anh tới phiên làm việc của ${STAFF[t.staff].ten}.` });
  }

  /* ---------- Gửi tin ---------- */
  async function send(textIn, forcedTo) {
    const text = (textIn != null ? textIn : $('#input').value).trim();
    if ((!text && !S.pending.length) || S.busy) return;
    S.busy = true; $('#input').value = ''; autosize(); render();
    const files = S.pending.length ? await uploadPending() : [];
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
      const p = await plan(text || 'Anh gửi tệp đính kèm', files, to);
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
      const body = md(m.text) + (m.kind === 'task' ? taskCard(S.tasks.get(m.taskId)) : '') + (m.kind === 'result' ? resultBlock(m) : '') + (m.kind === 'question' ? `<div class="nx-label">Anh trả lời ngay trong khung chat, em chuyển vào phiên làm việc.</div>` : '');
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
    hint.push(canRun('create_session') ? 'Thực thi: Claude Code' : 'Thực thi: hàng chờ');
    if (S.dbState === 'off') hint.push('Chưa lưu được dữ liệu');
    $('#capHint').textContent = hint.join(' · ');
    $('#send').disabled = S.busy;
  }
  function renderAtt() {
    $('#attList').innerHTML = S.pending.map((p, i) => `<span class="att a-${p.state || 'wait'}">${ICON.file}${esc(p.file.name)}<button data-act="rmatt" data-i="${i}" aria-label="Bỏ tệp">×</button></span>`).join('');
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
      case 'dl': try { return download(JSON.parse(b.dataset.f)); } catch (err) { return; }
      case 'rmatt': S.pending.splice(Number(b.dataset.i), 1); return renderAtt();
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
  $('#file').addEventListener('change', e => { for (const f of e.target.files) S.pending.push({ file: f }); e.target.value = ''; renderAtt(); });
  $('#chat').addEventListener('dragover', e => { e.preventDefault(); });
  $('#chat').addEventListener('drop', e => { e.preventDefault(); for (const f of e.dataTransfer.files) S.pending.push({ file: f }); renderAtt(); });
  $('#input').addEventListener('paste', e => { const fs = [...(e.clipboardData && e.clipboardData.files || [])]; if (fs.length) { fs.forEach(f => S.pending.push({ file: f })); renderAtt(); } });
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
    for (const f of $('#asFiles').files) S.pending.push({ file: f });
    $('#assignModal').hidden = true; S.to = $('#asWho').value; setTab('chat'); send(txt, S.to);
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
