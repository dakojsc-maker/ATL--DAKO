// Giả lập window.claude theo hợp đồng runtime 0.2.96 (db, assets, sample, mcp, downloads)
window.__mockCfg = window.__mockCfg || {};
(() => {
  const cfg = window.__MOCK || {};
  if (cfg.none) return;
  const clone = o => JSON.parse(JSON.stringify(o));
  const store = new Map(), listeners = [];
  const coll = p => p.split('/').slice(0, -1).join('/');
  const snapDoc = path => { const e = store.get(path); return { id: path.split('/').pop(), exists: !!e, data: () => (e ? clone(e) : undefined), metadata: { fromCache: false, hasPendingWrites: false } }; };
  function runQuery(q) {
    let docs = [...store.keys()].filter(k => coll(k) === q.path).map(snapDoc);
    if (q.order) { const [f, d] = q.order; docs = docs.filter(x => x.data()[f] !== undefined).sort((a, b) => { const A = a.data()[f], B = b.data()[f]; return (A < B ? -1 : A > B ? 1 : 0) * (d === 'desc' ? -1 : 1); }); }
    if (q.lim) docs = docs.slice(0, q.lim);
    return docs;
  }
  const qs = docs => ({ docs, size: docs.length, empty: !docs.length, docChanges: () => docs.map(d => ({ type: 'modified', doc: d })), metadata: {} });
  function notify(path) { for (const l of listeners) { if (l.kind === 'q' && coll(path) === l.q.path) l.cb(qs(runQuery(l.q))); if (l.kind === 'd' && l.path === path) l.cb(snapDoc(path)); } }
  function query(path, q = {}) {
    return { path, where() { return this; }, orderBy(f, d = 'asc') { return query(path, { ...q, order: [f, d] }); }, limit(n) { return query(path, { ...q, lim: n }); },
      async get() { return qs(runQuery({ path, ...q })); },
      onSnapshot(cb) { const l = { kind: 'q', q: { path, ...q }, cb }; listeners.push(l); setTimeout(() => cb(qs(runQuery(l.q))), 5); return () => {}; },
      doc(id) { return docRef(path + '/' + id); }, async add(d) { const r = docRef(path + '/' + Math.random().toString(36).slice(2)); await r.set(d); return r; } };
  }
  function docRef(path) {
    return { id: path.split('/').pop(), path, async get() { return snapDoc(path); },
      async set(d) { const s = JSON.stringify(d); if (s.length > 1048576) throw { code: 'too_large', message: 'document over 1 MiB' }; if (path.split('/').length % 2) throw { code: 'invalid_argument', message: 'bad doc path ' + path }; store.set(path, JSON.parse(s)); setTimeout(() => notify(path), 1); },
      async update(d) { const e = store.get(path); if (!e) throw { code: 'not_found' }; Object.assign(e, clone(d)); setTimeout(() => notify(path), 1); },
      async delete() { store.delete(path); setTimeout(() => notify(path), 1); },
      onSnapshot(cb) { listeners.push({ kind: 'd', path, cb }); setTimeout(() => cb(snapDoc(path)), 5); return () => {}; },
      collection(c) { return query(path + '/' + c); } };
  }
  const db = { doc: docRef, collection: p => query(p) };
  const blobs = new Map();
  const ACCEPT = new Set(['image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml', 'video/mp4', 'video/webm', 'application/pdf', 'text/csv', 'text/markdown', 'application/json', 'text/plain', 'text/css', 'text/javascript']);
  const assets = { async upload(blob, opt = {}) {
      if (!(blob instanceof Blob)) throw { code: 'invalid_request', message: 'not a blob' };
      if (window.__assetsFail) throw { code: window.__assetsFail, message: 'mock failure' };
      const type = opt.type || blob.type;
      if (!ACCEPT.has(type)) throw { code: 'unsupported_type', message: 'type ' + type };
      if (!blob.size) throw { code: 'invalid_request', message: 'empty' };
      if (blob.size > 20 * 1048576) throw { code: 'too_large', message: 'over 20 MiB' };
      const id = [...crypto.getRandomValues(new Uint8Array(16))].map(b => b.toString(16).padStart(2, '0')).join('');
      blobs.set(id, new Blob([await blob.arrayBuffer()], { type }));
      return { id, url: '/_blob/' + id, sizeBytes: blob.size, contentType: type };
    }, async list() { return { assets: [], usage: {} }; }, async delete() { return { deleted: true }; } };
  const of = window.fetch.bind(window);
  window.fetch = async (u, o) => { const m = String(u).match(/\/_blob\/([0-9a-f]{32})/); if (m) { const b = blobs.get(m[1]); return b ? new Response(b, { status: 200 }) : new Response('', { status: 404 }); } return of(u, o); };
  window.__prompts = [];
  const sample = { async json(input) { window.__prompts.push(input); const msg = (String(input).match(/TIN NHẮN MỚI CỦA ANH: """([\s\S]*?)"""/) || [])[1] || '';
      if (/thẻ/i.test(msg)) return { staff: 'cc_the', task: true, same_task: false, title: 'In thẻ ATLĐ nhóm 3 – Newstar', reply: 'Dạ anh, em Bảo nhận việc in thẻ nhóm 3 cho Newstar. Em đã thấy file danh sách và ảnh.', have: ['Excel danh sách học viên', 'Ảnh 3×4 (zip)'], missing: [], ready: true, brief: msg };
      return { staff: 'dp_thu', task: false, reply: 'Dạ anh, hiện chưa có việc nào dở.' }; },
    async limits() { return {}; } };
  window.__calls = [];
  let permState = cfg.perm || 'granted'; window.__permAsked = 0; window.__panel = 0; window.__failedOnce = false;
  const CONSENT = { code: 'upstream_error', retryable: true, retryAfterMs: 50, message: "connector access isn't confirmed for this artifact right now" };
  const permissions = { async state(n) { return n === 'mcp:Claude Code Remote' ? permState : 'unavailable'; },
    async request(names) { window.__permAsked++; if (cfg.permDelay) await new Promise(r => setTimeout(r, cfg.permDelay)); if (cfg.permAnswer) permState = cfg.permAnswer; return { [names[0]]: permState }; },
    async manage() { window.__panel++; } };
  const mcp = { async listTools() { return { servers: [{ server: 'Claude Code Remote', authStatus: 'connected', tools: ['create_session', 'get_session', 'send_message'].map(name => ({ name, description: '' })) }] }; },
    async callTool(server, tool, input) { window.__calls.push({ server, tool, input });
      if ((tool === 'create_session' || tool === 'get_session') && cfg.enforce && permState !== 'granted') throw CONSENT;
      if (tool === 'create_session' && cfg.failOnce && !window.__failedOnce) { window.__failedOnce = true; throw CONSENT; }
      if (tool === 'create_session') return { content: [{ type: 'text', text: '{"ccr":{"id":"session_TEST123"}}' }], payload: { ccr: { id: 'session_TEST123' } } };
      if (tool === 'get_session') return { content: [], payload: { ccr: { id: input.session_id, status_bucket: 'SESSION_STATUS_BUCKET_WORKING' } } };
      return { content: [], payload: { ok: true } }; } };
  window.__saved = [];
  const downloads = { async save({ filename, data }) { const buf = data instanceof Blob ? await data.arrayBuffer() : data; const h = await crypto.subtle.digest('SHA-256', buf);
      window.__saved.push({ filename, size: buf.byteLength, sha: [...new Uint8Array(h)].map(b => b.toString(16).padStart(2, '0')).join('') }); return { saved: true }; } };
  window.__sent = [];
  const comments = { async canSendToClaude() { return cfg.noClaude ? 'no_session' : 'available'; }, async anchorFor(el) { return { path: 'body', x: 0.5, y: 0.5 }; },
    async sendToClaude(t) { window.__sent.push(t); return { threadId: 'thr1', commentId: 'c1' }; }, async create() { return { threadId: 't', commentId: 'c' }; } };
  const NS = { comments, db, assets: cfg.noAssets ? null : assets, sample, mcp, downloads, permissions: cfg.noPerms ? null : permissions };
  window.__db = { store, db, blobs };
  window.claude = { use: n => new Promise(r => setTimeout(() => r(n in NS ? NS[n] : null), 20)) };
})();
