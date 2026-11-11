/* ============================================================
   STORE – 3 cách lưu dữ liệu, cùng một giao diện:
   • CloudBackend : bản dùng chung trên claude.ai (db + assets)
   • LocalBackend : mở file HTML trực tiếp – lưu IndexedDB trên máy
   • MemoryBackend: dữ liệu mẫu để xem thử (không lưu)
   ============================================================ */

const COLLECTIONS = ['trainers', 'classes', 'quotes', 'customers', 'settings', 'log'];
const RAW_UPLOAD = new Set(['application/pdf', 'image/png', 'image/jpeg', 'image/gif', 'image/webp']);
const MAX_RAW = 20 * 1024 * 1024;
const MAX_WRAPPED = Math.floor(MAX_RAW * 0.74);

function blobToBase64(blob) {
  return new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(String(r.result).split(',')[1] || '');
    r.onerror = () => rej(r.error);
    r.readAsDataURL(blob);
  });
}
function base64ToBlob(b64, type) {
  const bin = atob(b64.replace(/\s+/g, ''));
  const u8 = new Uint8Array(bin.length);
  for (let i = 0; i < bin.length; i++) u8[i] = bin.charCodeAt(i);
  return new Blob([u8], { type: type || 'application/octet-stream' });
}
function uploadErrorText(e) {
  const map = {
    too_large: 'File quá lớn (tối đa 20 MB; file Word/Excel tối đa khoảng 14 MB).',
    unsupported_type: 'Định dạng file chưa được hỗ trợ.',
    quota_or_state: 'Kho lưu file của công cụ đã đầy – hãy xóa bớt file không dùng.',
    not_granted: 'Tài khoản này không có quyền tải file lên.',
    rate_limited: 'Thao tác quá nhanh – thử lại sau vài giây.',
    upstream_auth: 'Phiên đăng nhập đã hết – hãy tải lại trang.',
  };
  return map[e?.code] || e?.message || 'Tải file lên không thành công.';
}

class MemoryBackend {
  constructor(kind = 'demo') {
    this.kind = kind;
    this.data = {}; COLLECTIONS.forEach((c) => (this.data[c] = new Map()));
    this.files = new Map(); this.subs = {}; this.urls = new Map();
  }
  async init() {}
  list(col) { return Array.from(this.data[col].values()).map((x) => ({ ...x })); }
  subscribe(col, next) {
    (this.subs[col] = this.subs[col] || new Set()).add(next);
    queueMicrotask(() => next(this.list(col), { fromCache: false }));
    return () => this.subs[col].delete(next);
  }
  emit(col) { const l = this.list(col); (this.subs[col] || []).forEach((f) => f(l, { fromCache: false })); }
  async set(col, id, rec) { const r = clone(rec); r.id = id; this.data[col].set(id, r); await this.persist(col, id, r); this.emit(col); }
  async del(col, id) { this.data[col].delete(id); await this.persistDel(col, id); this.emit(col); }
  async persist() {} async persistDel() {} async persistFile() {} async persistFileDel() {} async loadFile() { return null; }
  async putFile(file, name, type) {
    const id = uid('f');
    const blob = file instanceof Blob ? file : new Blob([file], { type });
    this.files.set(id, blob);
    await this.persistFile(id, blob);
    return { id, name, type, size: blob.size, enc: 'raw', at: new Date().toISOString() };
  }
  async getBlob(meta) {
    let b = this.files.get(meta.id);
    if (!b) { b = await this.loadFile(meta.id); if (b) this.files.set(meta.id, b); }
    if (!b) throw new Error('Không tìm thấy file trên máy này.');
    return b;
  }
  directUrl() { return null; }
  async objectUrl(meta) {
    if (this.urls.has(meta.id)) return this.urls.get(meta.id);
    const u = URL.createObjectURL(await this.getBlob(meta)); this.urls.set(meta.id, u); return u;
  }
  async delFile(meta) {
    this.files.delete(meta.id);
    if (this.urls.has(meta.id)) { URL.revokeObjectURL(this.urls.get(meta.id)); this.urls.delete(meta.id); }
    await this.persistFileDel(meta.id);
  }
  async download(filename, data) {
    const blob = data instanceof Blob ? data : new Blob([data]);
    const a = document.createElement('a'); a.href = URL.createObjectURL(blob); a.download = filename;
    document.body.append(a); a.click(); setTimeout(() => { URL.revokeObjectURL(a.href); a.remove(); }, 1500);
    return true;
  }
}

class LocalBackend extends MemoryBackend {
  constructor() { super('local'); }
  idb(storeName, mode, fn) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction(storeName, mode); const st = tx.objectStore(storeName);
      let out; Promise.resolve(fn(st)).then((v) => (out = v));
      tx.oncomplete = () => res(out); tx.onerror = () => rej(tx.error); tx.onabort = () => rej(tx.error);
    });
  }
  async init() {
    this.db = await new Promise((res, rej) => {
      const r = indexedDB.open('dako-atld', 1);
      r.onupgradeneeded = () => { r.result.createObjectStore('records'); r.result.createObjectStore('files'); };
      r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error);
    });
    await new Promise((res, rej) => {
      const tx = this.db.transaction('records', 'readonly'); const cur = tx.objectStore('records').openCursor();
      cur.onsuccess = () => {
        const c = cur.result; if (!c) return;
        const [col, ...rest] = String(c.key).split('/'); const id = rest.join('/');
        if (this.data[col]) this.data[col].set(id, { ...c.value, id });
        c.continue();
      };
      tx.oncomplete = res; tx.onerror = () => rej(tx.error);
    });
  }
  persist(col, id, rec) { return this.idb('records', 'readwrite', (st) => { st.put(rec, `${col}/${id}`); }); }
  persistDel(col, id) { return this.idb('records', 'readwrite', (st) => { st.delete(`${col}/${id}`); }); }
  persistFile(id, blob) { return this.idb('files', 'readwrite', (st) => { st.put(blob, id); }); }
  persistFileDel(id) { return this.idb('files', 'readwrite', (st) => { st.delete(id); }); }
  loadFile(id) {
    return new Promise((res, rej) => {
      const tx = this.db.transaction('files', 'readonly'); const r = tx.objectStore('files').get(id);
      r.onsuccess = () => res(r.result || null); r.onerror = () => rej(r.error);
    });
  }
}

class CloudBackend {
  constructor(db, assets) { this.kind = 'cloud'; this.db = db; this.assets = assets; this.urls = new Map(); }
  async init() {}
  subscribe(col, next, error) {
    let ref = this.db.collection(col);
    if (col === 'log') ref = ref.where('month', '>=', ymAdd(todayISO().slice(0, 7), -2));
    return ref.onSnapshot((snap) => next(snap.docs.map((d) => ({ ...d.data(), id: d.id })), snap.metadata), error);
  }
  async set(col, id, rec) {
    const r = JSON.parse(JSON.stringify(rec)); delete r.id;
    await this.db.collection(col).doc(id).set(r);
  }
  async del(col, id) { await this.db.collection(col).doc(id).delete(); }
  async putFile(file, name, type) {
    if (!this.assets) throw new Error('Tài khoản này không có quyền tải file lên (cần quyền Chỉnh sửa).');
    const at = new Date().toISOString();
    try {
      if (RAW_UPLOAD.has(type)) {
        if (file.size > MAX_RAW) throw { code: 'too_large' };
        const r = await this.assets.upload(file, { type });
        return { id: r.id, name, type, size: file.size, enc: 'raw', at };
      }
      if (file.size > MAX_WRAPPED) throw { code: 'too_large' };
      const b64 = await blobToBase64(file);
      const r = await this.assets.upload(new Blob([b64], { type: 'text/plain' }), { type: 'text/plain' });
      return { id: r.id, name, type, size: file.size, enc: 'b64', at };
    } catch (e) { throw new Error(uploadErrorText(e)); }
  }
  async getBlob(meta) {
    const res = await fetch(meta.url || '/_blob/' + meta.id);
    if (!res.ok) throw new Error(res.status === 404 ? 'File không còn trên hệ thống.' : 'Không tải được file (mã ' + res.status + ').');
    if (meta.enc === 'b64') return base64ToBlob((await res.text()).trim(), meta.type);
    return await res.blob();
  }
  directUrl(meta) { return meta.enc === 'raw' ? meta.url || '/_blob/' + meta.id : null; }
  async objectUrl(meta) {
    const d = this.directUrl(meta); if (d) return d;
    if (this.urls.has(meta.id)) return this.urls.get(meta.id);
    const u = URL.createObjectURL(await this.getBlob(meta)); this.urls.set(meta.id, u); return u;
  }
  async delFile(meta) { try { if (this.assets) await this.assets.delete(meta.id); } catch (e) { /* đã xóa hoặc không có quyền */ } }
  async download(filename, data) {
    const dl = await window.claude.use('downloads');
    if (!dl) throw new Error('Trình xem này không cho phép tải file về.');
    try { await dl.save({ filename, data: data instanceof Blob ? data : new Blob([data]) }); return true; } catch (e) {
      if (e?.code === 'declined') return false;
      if (e?.code === 'rejected_extension') throw new Error('Định dạng file này không tải về được từ trang dùng chung – hãy nhờ người tải lên gửi bản PDF.');
      throw new Error(e?.message || 'Không tải được file.');
    }
  }
}

/* ---------- controller ---------- */
const Store = {
  backend: null, unsubs: [], loadTimer: null, logCache: {}, logQueue: Promise.resolve(),

  attach(backend) {
    this.unsubs.forEach((u) => { try { u(); } catch (e) { /* ignore */ } });
    this.unsubs = []; this.backend = backend; this.logCache = {};
    S.trainers = []; S.classes = []; S.quotes = []; S.customers = []; S.log = []; S.settings = clone(DEFAULT_SETTINGS);
    S.loaded = {}; rebuildIndex();
    S.sync = { state: 'loading', msg: 'Đang tải dữ liệu…' };
    clearTimeout(this.loadTimer);
    this.loadTimer = setTimeout(() => {
      if (COLLECTIONS.some((c) => !S.loaded[c])) { S.sync = { state: 'warn', msg: 'Chưa kết nối được kho dữ liệu – dữ liệu có thể chưa đầy đủ' }; renderChrome(); }
    }, 10000);
    for (const col of COLLECTIONS) {
      this.unsubs.push(backend.subscribe(col, (rows, meta) => this.onData(col, rows, meta), (err) => this.onError(col, err)));
    }
  },

  onData(col, rows, meta) {
    if (col === 'settings') {
      const main = rows.find((r) => r.id === 'main');
      S.settings = Object.assign(clone(DEFAULT_SETTINGS), main ? clone(main) : {});
      delete S.settings.id;
    } else {
      S[col] = rows;
    }
    if (!meta || !meta.fromCache) S.loaded[col] = true;
    if (COLLECTIONS.every((c) => S.loaded[c])) {
      clearTimeout(this.loadTimer);
      if (S.sync.state !== 'error') S.sync = { state: 'ok', msg: '' };
    }
    rebuildIndex();
    scheduleRender();
  },

  onError(col, err) {
    S.loaded[col] = true;
    S.sync = { state: 'error', msg: err?.code === 'revoked' ? 'Quyền truy cập đã thay đổi – hãy tải lại trang' : 'Mất kết nối kho dữ liệu – hãy tải lại trang' };
    scheduleRender();
  },

  async save(col, rec, label, action) {
    const now = new Date().toISOString();
    const isNew = !rec.createdAt;
    rec.id = rec.id || uid(col.slice(0, 2));
    rec.createdAt = rec.createdAt || now; rec.updatedAt = now; rec.updatedBy = S.me?.id || null; delete rec.via;
    try {
      await this.backend.set(col, rec.id, rec);
    } catch (e) {
      this.handleWriteError(e); throw e;
    }
    if (label) this.log(action || (isNew ? 'Thêm' : 'Cập nhật'), col, label);
    return rec;
  },

  async remove(col, rec, label) {
    try { await this.backend.del(col, rec.id); } catch (e) { this.handleWriteError(e); throw e; }
    if (label) this.log('Xóa', col, label);
  },

  async saveSettings(next) {
    const rec = clone(next); rec.updatedAt = new Date().toISOString(); rec.updatedBy = S.me?.id || null;
    try { await this.backend.set('settings', 'main', rec); } catch (e) { this.handleWriteError(e); throw e; }
    this.log('Cập nhật', 'settings', 'Cài đặt chung');
  },

  handleWriteError(e) {
    if (e?.code === 'invalid_argument' && this.backend.kind === 'cloud') {
      S.role.canEdit = false; applyRole();
      toast('Tài khoản này chỉ có quyền xem – không lưu được thay đổi.', 'bad');
    } else if (e?.code === 'quota_exceeded') {
      toast('Kho dữ liệu đã đầy – hãy xóa bớt bản ghi cũ.', 'bad');
    } else {
      toast('Lưu không thành công: ' + (e?.message || 'lỗi kết nối') + '. Hãy thử lại.', 'bad');
    }
  },

  log(action, col, label) {
    if (this.backend.kind === 'demo') return;
    const month = todayISO().slice(0, 7);
    const entry = { t: new Date().toISOString(), by: S.me?.id || null, a: action, k: col, l: String(label).slice(0, 160) };
    (this.logCache[month] = this.logCache[month] || []).push(entry);
    this.logQueue = this.logQueue.then(async () => {
      const doc = S.log.find((l) => l.id === month);
      const merged = new Map();
      for (const e of [...(doc?.entries || []), ...this.logCache[month]]) merged.set(e.t + '|' + e.l + '|' + e.a, e);
      const entries = Array.from(merged.values()).sort((a, b) => a.t.localeCompare(b.t)).slice(-300);
      await this.backend.set('log', month, { month, entries });
    }).catch(() => {});
  },
};

function rebuildIndex() {
  for (const col of ['trainers', 'classes', 'quotes', 'customers']) {
    const m = new Map(); for (const r of S[col]) m.set(r.id, r); S.byId[col] = m;
  }
  FILES.clear();
  const add = (f) => { if (f && f.id) FILES.set(f.id, f); };
  for (const t of S.trainers) { add(t.photo); (t.files || []).forEach(add); }
  for (const c of S.classes) (c.files || []).forEach(add);
  for (const q of S.quotes) { (q.quoteFiles || []).forEach(add); (q.contractFiles || []).forEach(add); }
}
const FILES = new Map();
