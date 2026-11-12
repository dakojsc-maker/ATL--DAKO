/* ============================================================
   UI – biểu tượng, hộp thoại, thông báo, file, trình xem file, biểu đồ
   ============================================================ */

const ICONS = {
  dash: '<path d="M3 13h8V3H3zM13 21h8V11h-8zM3 21h8v-6H3zM13 3v6h8V3z"/>',
  cal: '<rect x="3" y="4" width="18" height="18" rx="2"/><path d="M16 2v4M8 2v4M3 10h18"/>',
  users: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M22 21v-2a4 4 0 0 0-3-3.87M16 3.13a4 4 0 0 1 0 7.75"/>',
  file: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6M8 13h8M8 17h5"/>',
  sign: '<path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"/><path d="M14 2v6h6"/><path d="m9 15 2 2 4-4"/>',
  building: '<path d="M3 21h18M5 21V7l7-4 7 4v14M9 9h1M14 9h1M9 13h1M14 13h1M9 17h1M14 17h1"/>',
  gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1A1.7 1.7 0 0 0 9 19.4a1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1A1.7 1.7 0 0 0 4.6 15a1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1A1.7 1.7 0 0 0 4.6 9a1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1A1.7 1.7 0 0 0 9 4.6a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8 1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
  plus: '<path d="M12 5v14M5 12h14"/>',
  search: '<circle cx="11" cy="11" r="7"/><path d="m21 21-4.3-4.3"/>',
  left: '<path d="m15 18-6-6 6-6"/>',
  right: '<path d="m9 18 6-6-6-6"/>',
  x: '<path d="M18 6 6 18M6 6l12 12"/>',
  edit: '<path d="M12 20h9"/><path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4z"/>',
  trash: '<path d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>',
  eye: '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8S1 12 1 12z"/><circle cx="12" cy="12" r="3"/>',
  down: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3"/>',
  up: '<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M17 8l-5-5-5 5M12 3v12"/>',
  copy: '<rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1"/>',
  phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6A19.8 19.8 0 0 1 2.1 4.2 2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1.9.4 1.8.7 2.7a2 2 0 0 1-.5 2.1L8 9.8a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.4c.9.3 1.8.6 2.7.7a2 2 0 0 1 1.7 2z"/>',
  ext: '<path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14 21 3"/>',
  table: '<rect x="3" y="3" width="18" height="18" rx="2"/><path d="M3 9h18M3 15h18M9 3v18"/>',
  list: '<path d="M8 6h13M8 12h13M8 18h13M3 6h.01M3 12h.01M3 18h.01"/>',
  rows: '<path d="M3 5h18M3 12h18M3 19h18M8 3v18"/>',
  check: '<path d="M20 6 9 17l-5-5"/>',
  money: '<rect x="2" y="6" width="20" height="12" rx="2"/><circle cx="12" cy="12" r="2.5"/>',
  pin: '<path d="M12 22s7-6.2 7-12a7 7 0 1 0-14 0c0 5.8 7 12 7 12z"/><circle cx="12" cy="10" r="2.5"/>',
  clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
};
const ic = (n, cls = '') => `<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"${cls ? ` class="${cls}"` : ''}>${ICONS[n] || ''}</svg>`;

const pill = (label, tone = 'muted', dot = false) => `<span class="pill ${tone}">${dot ? '<span class="dot"></span>' : ''}${esc(label)}</span>`;
const classPill = (c) => pill(CLASS_STATUS[c.status]?.label || 'Dự kiến', CLASS_STATUS[c.status]?.tone || 'muted');
const quotePill = (q) => pill(QUOTE_STATUS[q.status]?.label || 'Đang soạn', QUOTE_STATUS[q.status]?.tone || 'muted');
const rtag = (rid) => `<span class="rtag"><span class="sw" style="background:${regionColor(rid)}"></span>${esc(regionName(rid))}</span>`;
function avatar(t, cls = '') {
  if (t?.photo?.id) return `<span class="ava ${cls}"><img data-file="${esc(t.photo.id)}" alt=""></span>`;
  return `<span class="ava ${cls}" aria-hidden="true">${esc(initials(t?.name))}</span>`;
}
function photo(t, cls = '') {
  if (t?.photo?.id) return `<span class="photo ${cls}"><img data-file="${esc(t.photo.id)}" alt="Ảnh ${esc(t.name)}"></span>`;
  return `<span class="photo ${cls}" aria-hidden="true">${esc(initials(t?.name))}</span>`;
}
const copyBtn = (text, label = 'Sao chép') => `<button type="button" class="copy" data-act="copy" data-text="${esc(text)}" title="${esc(label)}" aria-label="${esc(label)}">${ic('copy')}</button>`;
const phoneLink = (p) => (p ? `<a href="tel:${esc(String(p).replace(/[^\d+]/g, ''))}" class="phone num">${esc(p)}</a>${copyBtn(p, 'Sao chép số điện thoại')}` : '<span class="muted">Chưa có SĐT</span>');

/* lazily fill <img data-file> from the store */
async function hydrate(root = document) {
  for (const img of $$('img[data-file]:not([data-ok])', root)) {
    const meta = FILES.get(img.dataset.file) || { id: img.dataset.file, enc: 'raw', type: 'image/jpeg', name: 'anh.jpg' };
    img.dataset.ok = '1';
    try { img.src = await Store.backend.objectUrl(meta); } catch (e) { img.replaceWith(Object.assign(document.createElement('span'), { textContent: '?' })); }
  }
}

/* ---------- toast ---------- */
function toast(msg, tone = '') {
  const el = document.createElement('div'); el.className = 'toast ' + tone; el.textContent = msg; el.setAttribute('role', 'status');
  $('#toast-root').append(el); setTimeout(() => el.remove(), tone === 'bad' ? 6500 : 3200);
}

/* ---------- modal ---------- */
const Modals = [];
function openModal({ title, sub = '', body = '', foot = '', size = '', guard = null, onClose = null }) {
  const back = document.createElement('div'); back.className = 'modal-back';
  const hid = uid('mh');
  back.innerHTML = `<div class="modal ${size}" role="dialog" aria-modal="true" aria-labelledby="${hid}">
    <div class="modal-h"><div class="grow"><h2 id="${hid}">${title}</h2>${sub ? `<div class="sub">${sub}</div>` : ''}</div>
    <button type="button" class="btn icon ghost x" data-close aria-label="Đóng">${ic('x')}</button></div>
    <div class="modal-b">${body}</div>${foot ? `<div class="modal-f">${foot}</div>` : ''}</div>`;
  $('#modal-root').append(back);
  const m = {
    back, el: back.querySelector('.modal'), body: back.querySelector('.modal-b'), foot: back.querySelector('.modal-f'), guard, refresh: null,
    async tryClose() { if (m.guard && !(await m.guard())) return; m.close(); },
    close() {
      back.remove(); const i = Modals.indexOf(m); if (i >= 0) Modals.splice(i, 1);
      if (!Modals.length) document.body.style.overflow = '';
      onClose && onClose();
    },
  };
  back.addEventListener('mousedown', (e) => { if (e.target === back && !m.guard) m.close(); });
  back.querySelector('[data-close]').addEventListener('click', () => m.tryClose());
  Modals.push(m); document.body.style.overflow = 'hidden';
  setTimeout(() => { const f = m.el.querySelector('input:not([type=hidden]):not([type=file]):not([type=checkbox]):not([type=radio]), select, textarea'); if (f && guard) f.focus(); }, 30);
  hydrate(m.el);
  return m;
}
document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && Modals.length) Modals[Modals.length - 1].tryClose(); });

function confirmBox(message, { ok = 'Đồng ý', danger = false, title = 'Xác nhận' } = {}) {
  return new Promise((resolve) => {
    let done = false;
    const m = openModal({
      title: esc(title), size: 'narrow', body: `<p style="margin:0">${message}</p>`,
      foot: `<span class="sp"></span><button type="button" class="btn" data-no>Hủy</button><button type="button" class="btn ${danger ? 'danger' : 'primary'}" data-yes>${esc(ok)}</button>`,
      onClose: () => { if (!done) resolve(false); },
    });
    m.foot.querySelector('[data-no]').onclick = () => m.close();
    m.foot.querySelector('[data-yes]').onclick = () => { done = true; m.close(); resolve(true); };
    m.foot.querySelector('[data-yes]').focus();
  });
}

/* ---------- money input formatting ---------- */
function bindMoney(root) {
  for (const inp of $$('input[data-money]', root)) {
    inp.addEventListener('input', () => {
      const n = parseMoney(inp.value);
      inp.value = inp.value.trim() === '' ? '' : money(n);
      inp.setSelectionRange(inp.value.length, inp.value.length);
    });
  }
}

/* ---------- photo resize (3x4 portrait friendly) ---------- */
async function prepareImage(file, maxSide = 900) {
  const url = URL.createObjectURL(file);
  try {
    const img = await new Promise((res, rej) => { const i = new Image(); i.onload = () => res(i); i.onerror = () => rej(new Error('decode')); i.src = url; });
    const scale = Math.min(1, maxSide / Math.max(img.naturalWidth, img.naturalHeight));
    const w = Math.round(img.naturalWidth * scale), h = Math.round(img.naturalHeight * scale);
    const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
    const ctx = cv.getContext('2d'); ctx.fillStyle = '#fff'; ctx.fillRect(0, 0, w, h); ctx.drawImage(img, 0, 0, w, h);
    const blob = await new Promise((res) => cv.toBlob(res, 'image/jpeg', 0.86));
    return new File([blob], (file.name || 'anh').replace(/\.[^.]+$/, '') + '.jpg', { type: 'image/jpeg' });
  } catch (e) {
    throw new Error(/heic|heif/i.test(file.name + file.type) ? 'Ảnh HEIC (iPhone) chưa đọc được – hãy đổi sang JPG rồi tải lại.' : 'Không đọc được ảnh này – hãy dùng file JPG hoặc PNG.');
  } finally { URL.revokeObjectURL(url); }
}

/* ---------- file list (read-only display) ---------- */
function fileRow(f, { removable = false } = {}) {
  const k = extClass(f);
  return `<div class="file" data-fid="${esc(f.id)}"><span class="ext ${k}">${esc(extOf(f.name) || 'file')}</span>
    <span class="fn"><b title="${esc(f.name)}">${esc(f.name)}</b><span>${f.size ? fmtSize(f.size) : ''}${f.at ? ' · ' + fmtD(f.at.slice(0, 10)) : ''}</span></span>
    <button type="button" class="btn xs" data-act="file-view" data-fid="${esc(f.id)}">${ic('eye')} Xem</button>
    ${removable ? `<button type="button" class="btn xs danger" data-remove="${esc(f.id)}" aria-label="Gỡ file ${esc(f.name)}">${ic('x')}</button>` : ''}</div>`;
}
function filesBlock(files, emptyText = 'Chưa có file') {
  if (!files || !files.length) return `<div class="muted small">${esc(emptyText)}</div>`;
  return `<div class="files">${files.map((f) => fileRow(f)).join('')}</div>`;
}
/** Nút xem nhanh dùng trong bảng: data-act=file-open với danh sách id */
function fileButtons(files, label, { upAct = '', upId = '' } = {}) {
  if (files && files.length) {
    const ids = files.map((f) => f.id).join(',');
    return `<button type="button" class="fbtn" data-act="files-open" data-fids="${esc(ids)}" title="${esc(files.map((f) => f.name).join('\n'))}">${ic('eye')}${esc(label)}${files.length > 1 ? ` (${files.length})` : ''}</button>`;
  }
  if (upAct) return `<button type="button" class="fbtn none edit-only" data-act="${upAct}" data-id="${esc(upId)}" style="cursor:pointer">${ic('up')}Tải ${esc(label)}</button><span class="muted small ro-only">—</span>`;
  return '<span class="muted small">—</span>';
}

/** Ô tải file trong biểu mẫu. Trả về { value(), commit(), rollback() } */
function mountFileField(container, initial, { multiple = true, image = false, accept = '', hint = '' } = {}) {
  const st = { files: (initial || []).map((f) => ({ ...f })), added: [], removed: [] };
  const canUpload = S.role.canEdit && (Store.backend.kind !== 'cloud' || Store.backend.assets);
  const inputId = uid('fi');
  function render() {
    if (image) {
      const f = st.files[0];
      container.innerHTML = `<div style="display:flex;gap:12px;align-items:flex-end;flex-wrap:wrap">
        <span class="photo lg">${f ? `<img data-file="${esc(f.id)}" alt="Ảnh giảng viên">` : 'Ảnh 3×4'}</span>
        <div style="display:flex;flex-direction:column;gap:6px">
          ${canUpload ? `<label class="btn sm" for="${inputId}">${ic('up')} ${f ? 'Đổi ảnh' : 'Tải ảnh lên'}</label>` : ''}
          ${f && canUpload ? '<button type="button" class="btn sm danger" data-rm>Gỡ ảnh</button>' : ''}
          <span class="hint small muted">${esc(hint || 'JPG/PNG, ảnh chân dung 3×4')}</span>
        </div>
        <input type="file" id="${inputId}" accept="image/*" class="sr"></div>`;
      if (f) FILES.set(f.id, f);
      hydrate(container);
      container.querySelector('[data-rm]')?.addEventListener('click', () => { remove(st.files[0].id); });
    } else {
      st.files.forEach((f) => FILES.set(f.id, f));
      container.innerHTML = `<div class="files">${st.files.map((f) => fileRow(f, { removable: canUpload })).join('')}</div>
        ${canUpload ? `<label class="dropzone" for="${inputId}">${ic('up')}<span><b>Chọn file</b> hoặc kéo thả vào đây</span><span class="muted small">${esc(hint || 'PDF, Word, Excel, ảnh – tối đa 20 MB/file')}</span></label>
        <input type="file" id="${inputId}" ${multiple ? 'multiple' : ''} ${accept ? `accept="${esc(accept)}"` : ''} class="sr">` : (st.files.length ? '' : '<div class="muted small">Chưa có file</div>')}`;
      $$('[data-remove]', container).forEach((b) => b.addEventListener('click', () => remove(b.dataset.remove)));
      const dz = container.querySelector('.dropzone');
      if (dz) {
        dz.addEventListener('dragover', (e) => { e.preventDefault(); dz.classList.add('drag'); });
        dz.addEventListener('dragleave', () => dz.classList.remove('drag'));
        dz.addEventListener('drop', (e) => { e.preventDefault(); dz.classList.remove('drag'); addFiles(e.dataTransfer.files); });
      }
    }
    const inp = container.querySelector('input[type=file]');
    inp?.addEventListener('change', () => { addFiles(inp.files); inp.value = ''; });
  }
  function remove(id) {
    const f = st.files.find((x) => x.id === id); if (!f) return;
    st.files = st.files.filter((x) => x.id !== id);
    if (st.added.includes(f)) { st.added = st.added.filter((x) => x !== f); Store.backend.delFile(f); } else st.removed.push(f);
    render();
  }
  async function addFiles(list) {
    for (const file of Array.from(list || [])) {
      const note = document.createElement('div'); note.className = 'muted small'; note.textContent = `Đang tải lên ${file.name}…`;
      container.append(note);
      try {
        let f = file; let type = mimeOf(file);
        if (image) { f = await prepareImage(file); type = 'image/jpeg'; }
        const meta = await Store.backend.putFile(f, image ? f.name : file.name, type);
        if (image && st.files[0]) remove(st.files[0].id);
        st.files.push(meta); st.added.push(meta); FILES.set(meta.id, meta);
      } catch (e) { toast(`${file.name}: ${e.message}`, 'bad'); }
      note.remove(); render();
      if (!multiple && !image) break;
    }
  }
  render();
  return {
    value: () => (image ? st.files[0] || null : st.files.slice()),
    dirty: () => st.added.length > 0 || st.removed.length > 0,
    commit: () => { st.removed.forEach((f) => Store.backend.delFile(f)); st.removed = []; st.added = []; },
    rollback: () => { st.added.forEach((f) => Store.backend.delFile(f)); st.added = []; },
  };
}

/* ---------- external libraries (loaded only when needed) ---------- */
const LIBS = {
  pdf: ['https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.min.js', 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js'],
  mammoth: ['https://cdn.jsdelivr.net/npm/mammoth@1.6.0/mammoth.browser.min.js'],
  xlsx: ['https://cdn.jsdelivr.net/npm/xlsx@0.18.5/dist/xlsx.full.min.js'],
};
const scriptCache = {};
function loadScript(src) {
  if (!scriptCache[src]) {
    scriptCache[src] = new Promise((res, rej) => {
      const s = document.createElement('script'); s.src = src; s.async = true;
      s.onload = res; s.onerror = () => { delete scriptCache[src]; rej(new Error('Không tải được thư viện – kiểm tra kết nối mạng.')); };
      document.head.append(s);
    });
  }
  return scriptCache[src];
}
async function lib(name) {
  for (const src of LIBS[name]) await loadScript(src);
  if (name === 'pdf') { const p = window.pdfjsLib; if (p && !p.GlobalWorkerOptions.workerSrc) p.GlobalWorkerOptions.workerSrc = LIBS.pdf[1]; return p; }
  if (name === 'mammoth') return window.mammoth;
  return window.XLSX;
}

/* ---------- file viewer ---------- */
function sanitizeHTML(html) {
  const doc = new DOMParser().parseFromString(`<div>${html}</div>`, 'text/html');
  const allowed = new Set(['P', 'BR', 'STRONG', 'B', 'EM', 'I', 'U', 'S', 'H1', 'H2', 'H3', 'H4', 'H5', 'H6', 'UL', 'OL', 'LI', 'TABLE', 'THEAD', 'TBODY', 'TR', 'TD', 'TH', 'A', 'IMG', 'SUP', 'SUB', 'SPAN', 'DIV', 'BLOCKQUOTE']);
  const walk = (node) => {
    for (const el of Array.from(node.children)) {
      if (!allowed.has(el.tagName)) { el.replaceWith(...Array.from(el.childNodes)); continue; }
      for (const a of Array.from(el.attributes)) {
        const n = a.name.toLowerCase();
        const keep = (n === 'href' && /^(https?:|#)/i.test(a.value)) || (n === 'src' && el.tagName === 'IMG' && /^data:image\//i.test(a.value)) || ['colspan', 'rowspan', 'alt'].includes(n);
        if (!keep) el.removeAttribute(a.name);
      }
      if (el.tagName === 'A') { el.setAttribute('target', '_blank'); el.setAttribute('rel', 'noopener'); }
      walk(el);
    }
  };
  walk(doc.body.firstChild);
  return doc.body.firstChild.innerHTML;
}

function openViewer(files, start = 0, title = '') {
  files = (files || []).filter(Boolean);
  if (!files.length) { toast('Chưa có file để xem.'); return; }
  let idx = Math.min(start, files.length - 1); let token = 0;
  const m = openModal({
    title: esc(title || 'Xem file'), size: 'wide',
    body: `${files.length > 1 ? `<div class="vtabs">${files.map((f, i) => `<button type="button" class="chip" data-i="${i}" aria-pressed="${i === idx}">${esc(f.name)}</button>`).join('')}</div>` : ''}
      <div class="toolbar" style="margin:0"><b class="grow" data-name></b><span data-tools style="display:flex;gap:6px;flex-wrap:wrap"></span></div>
      <div class="viewer" data-view></div>`,
  });
  const view = m.el.querySelector('[data-view]');
  m.el.querySelectorAll('.vtabs .chip').forEach((b) => b.addEventListener('click', () => { idx = Number(b.dataset.i); m.el.querySelectorAll('.vtabs .chip').forEach((x) => x.setAttribute('aria-pressed', String(x === b))); show(); }));
  async function show() {
    const my = ++token; const f = files[idx];
    m.el.querySelector('[data-name]').textContent = f.name;
    const direct = Store.backend.directUrl(f);
    const absDirect = direct ? new URL(direct, location.href).href : '';
    m.el.querySelector('[data-tools]').innerHTML = `${absDirect ? `<a class="btn sm" href="${esc(absDirect)}" target="_blank" rel="noopener">${ic('ext')} Mở tab mới</a>` : ''}<button type="button" class="btn sm" data-dl>${ic('down')} Tải về</button>`;
    m.el.querySelector('[data-dl]').onclick = async () => { try { await Store.backend.download(f.name, await Store.backend.getBlob(f)); } catch (e) { toast(e.message, 'bad'); } };
    view.innerHTML = '<div class="msg">Đang mở file…</div>';
    try {
      const kind = fileKind(f);
      if (kind === 'img') {
        const u = await Store.backend.objectUrl(f); if (my !== token) return;
        view.innerHTML = `<img class="full" alt="${esc(f.name)}" src="${esc(u)}">`;
      } else if (kind === 'pdf') {
        const [pdfjs, blob] = await Promise.all([lib('pdf'), Store.backend.getBlob(f)]); if (my !== token) return;
        const pdf = await pdfjs.getDocument({ data: new Uint8Array(await blob.arrayBuffer()), isEvalSupported: false }).promise;
        view.innerHTML = `<div class="msg small" style="padding:8px">${pdf.numPages} trang</div>`;
        const width = Math.min(1000, view.clientWidth - 24);
        const max = Math.min(pdf.numPages, 40);
        for (let p = 1; p <= max; p++) {
          if (my !== token) return;
          const page = await pdf.getPage(p);
          const base = page.getViewport({ scale: 1 });
          const scale = (width / base.width) * (window.devicePixelRatio || 1);
          const vp = page.getViewport({ scale });
          const cv = document.createElement('canvas'); cv.width = vp.width; cv.height = vp.height; cv.style.width = width + 'px';
          view.append(cv);
          await page.render({ canvasContext: cv.getContext('2d'), viewport: vp }).promise;
        }
        if (pdf.numPages > max) view.insertAdjacentHTML('beforeend', `<div class="msg">Đã hiển thị ${max}/${pdf.numPages} trang – bấm “Tải về” để xem đầy đủ.</div>`);
      } else if (kind === 'docx') {
        const [mammoth, blob] = await Promise.all([lib('mammoth'), Store.backend.getBlob(f)]); if (my !== token) return;
        const r = await mammoth.convertToHtml({ arrayBuffer: await blob.arrayBuffer() });
        view.innerHTML = `<div class="doc">${sanitizeHTML(r.value) || '<p>(Tài liệu trống)</p>'}</div>`;
      } else if (kind === 'sheet') {
        const [XLSX, blob] = await Promise.all([lib('xlsx'), Store.backend.getBlob(f)]); if (my !== token) return;
        const wb = XLSX.read(new Uint8Array(await blob.arrayBuffer()), { type: 'array' });
        let html = '';
        for (const name of wb.SheetNames.slice(0, 8)) {
          const rows = XLSX.utils.sheet_to_json(wb.Sheets[name], { header: 1, raw: false, defval: '' }).slice(0, 400);
          html += `<div style="padding:10px 12px"><div class="sec-title">${esc(name)}</div><div class="tbl-wrap"><table class="sheet">${rows.map((r) => `<tr>${r.slice(0, 40).map((c) => `<td>${esc(c)}</td>`).join('')}</tr>`).join('')}</table></div></div>`;
        }
        view.innerHTML = html || '<div class="msg">Bảng tính trống.</div>';
      } else {
        view.innerHTML = `<div class="msg"><b>Định dạng .${esc(extOf(f.name) || '?')} chưa xem trực tiếp được.</b><br>Bấm “Tải về” để mở bằng phần mềm trên máy. Nên lưu báo giá/hợp đồng dạng PDF để ai cũng xem được ngay.</div>`;
      }
    } catch (e) {
      if (my === token) view.innerHTML = `<div class="msg"><b>Không mở được file.</b><br>${esc(e.message || '')}<br>Hãy bấm “Tải về” để xem trên máy.</div>`;
    }
  }
  show();
}

/* ---------- bar chart (single series) ---------- */
function barChart(data, { height = 190, fmt = moneyShort } = {}) {
  const W = 640, H = height, padL = 46, padR = 8, padT = 10, padB = 24;
  const max = Math.max(1, ...data.map((d) => d.value));
  const step = niceStep(max / 3);
  const top = Math.ceil(max / step) * step;
  const iw = W - padL - padR, ih = H - padT - padB;
  const bw = iw / data.length;
  let svg = `<svg class="chart" viewBox="0 0 ${W} ${H}" role="img" aria-label="Biểu đồ cột">`;
  for (let v = 0; v <= top + 1e-6; v += step) {
    const y = padT + ih - (v / top) * ih;
    svg += `<line class="grid" x1="${padL}" x2="${W - padR}" y1="${y}" y2="${y}"/><text x="${padL - 6}" y="${y + 4}" text-anchor="end">${esc(fmt(v))}</text>`;
  }
  data.forEach((d, i) => {
    const h = (d.value / top) * ih; const x = padL + i * bw; const w = Math.max(4, bw - 6);
    const y = padT + ih - h;
    const r = Math.min(4, h / 2);
    const path = h > 0 ? `M${x + 3},${padT + ih} V${y + r} q0,-${r} ${r},-${r} H${x + 3 + w - r} q${r},0 ${r},${r} V${padT + ih} Z` : '';
    svg += `<g data-tip="${esc(d.tip || d.label + ': ' + fmt(d.value))}"><rect class="hit" x="${x}" y="${padT}" width="${bw}" height="${ih}"/>${path ? `<path class="bar${d.cur ? ' cur' : ''}" d="${path}"/>` : ''}<title>${esc(d.tip || '')}</title></g>`;
    svg += `<text x="${x + bw / 2}" y="${H - 6}" text-anchor="middle"${d.cur ? ' style="font-weight:700;fill:var(--fg)"' : ''}>${esc(d.label)}</text>`;
  });
  return `<div class="chart-box">${svg}</svg></div>`;
}
function niceStep(raw) {
  if (raw <= 0) return 1;
  const p = Math.pow(10, Math.floor(Math.log10(raw))); const n = raw / p;
  return (n <= 1 ? 1 : n <= 2 ? 2 : n <= 2.5 ? 2.5 : n <= 5 ? 5 : 10) * p;
}
document.addEventListener('mousemove', (e) => {
  const g = e.target.closest?.('.chart-box g[data-tip]');
  const box = e.target.closest?.('.chart-box');
  $$('.chart-tip').forEach((t) => { if (!box || t.parentNode !== box || !g) t.remove(); });
  if (!g || !box) return;
  let tip = box.querySelector('.chart-tip');
  if (!tip) { tip = document.createElement('div'); tip.className = 'chart-tip'; box.append(tip); }
  tip.textContent = g.dataset.tip;
  const r = box.getBoundingClientRect();
  tip.style.left = Math.min(r.width - 60, Math.max(60, e.clientX - r.left)) + 'px';
  tip.style.top = e.clientY - r.top + 'px';
});
