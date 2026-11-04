/* Dựng thế giới 3D thực tế cho tham quan 360°: tường đủ cao, trần, cửa sổ, cửa, vật liệu, đồ đạc,
   biển hiệu và tranh theo bộ nhận diện Heragrain, bầu trời, núi, cây.
   Mặt bằng lấy từ 3-so-do-3d/du-lieu.js (window.HERAGRAIN); điểm đứng và trang trí ở diem-360.js (window.HERAGRAIN_360).
   Mọi hình (logo, bao bì, biển, tranh, vân vật liệu) vẽ bằng canvas, không tải ảnh ngoài. */
(function () {
"use strict";
const H = window.HERAGRAIN, V = window.HERAGRAIN_360;
const FONT = '"Be Vietnam Pro", "Segoe UI", Roboto, Arial, sans-serif';
const SERIF = '"Source Serif 4", Georgia, "Times New Roman", serif';
const MAU = { xanh: '#1D4B3A', xanhDam: '#12301F', vang: '#E4A92A', tim: '#7A3E8F', la: '#5E9E68', kem: '#F4EFE3' };
const FY = 0.15; // mặt sàn
const T = 0.2;   // độ dày tường
let root = null, anis = 4;

/* ---------- tiện ích ---------- */
function rng(a) { return function () { a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hat(g, w, h, n, mau, r0, r1, seed, a0, a1) {
  const R = rng(seed);
  for (let i = 0; i < n; i++) { g.globalAlpha = a0 + R() * (a1 - a0); g.fillStyle = mau[(R() * mau.length) | 0]; const r = r0 + R() * (r1 - r0); g.fillRect(R() * w, R() * h, r, r); }
  g.globalAlpha = 1;
}
const TX = {};
/* hình vẽ canvas; lap = [rộng, cao] (mét) mà một lần hình phủ, để vân lặp đúng kích thước thật */
function tx(key, w, h, ve, lap) {
  if (TX[key]) return TX[key];
  const c = document.createElement('canvas'); c.width = w; c.height = h;
  ve(c.getContext('2d'), w, h);
  const t = new THREE.CanvasTexture(c); t.anisotropy = anis;
  if (lap) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(1 / lap[0], 1 / lap[1]); }
  return (TX[key] = t);
}
function nen(g, w, h, mau) { g.fillStyle = mau; g.fillRect(0, 0, w, h); }
function vua(g, text, maxW, size, weight, family) { // cỡ chữ lớn nhất vừa bề rộng
  let s = size; do { g.font = `${weight} ${s}px ${family || FONT}`; s -= 2; } while (g.measureText(text).width > maxW && s > 8); return s + 2;
}
function gianChu(g, s, x, y, sp) { for (const ch of s) { g.fillText(ch, x, y); x += g.measureText(ch).width + sp; } }
function rongGian(g, s, sp) { let w = 0; for (const ch of s) w += g.measureText(ch).width; return w + sp * (s.length - 1); }
function dongChu(g, text, x, y, maxW, lh) { // xuống dòng theo từ, trả về y sau dòng cuối
  const tu = text.split(' '); let dong = '';
  tu.forEach((t) => { const thu = dong ? dong + ' ' + t : t; if (g.measureText(thu).width > maxW && dong) { g.fillText(dong, x, y); y += lh; dong = t; } else dong = thu; });
  if (dong) { g.fillText(dong, x, y); y += lh; }
  return y;
}

/* ---------- vân vật liệu ---------- */
function beMat(key) {
  switch (key) {
    case 'son': return tx(key, 256, 256, (g, w, h) => { nen(g, w, h, '#EEE8DA'); hat(g, w, h, 1600, ['#FFFFFF', '#D9D0BC'], 1, 3, 1, 0.05, 0.18); }, [2, 2]);
    case 'sonNgoai': return tx(key, 256, 256, (g, w, h) => { nen(g, w, h, '#F1EADA'); hat(g, w, h, 1800, ['#FFFFFF', '#D6CCB4'], 1, 3, 2, 0.05, 0.2); }, [2, 2]);
    case 'sonVang': return tx(key, 256, 256, (g, w, h) => { nen(g, w, h, '#EAD6A2'); hat(g, w, h, 1800, ['#F6E7BE', '#CDB57A'], 1, 3, 3, 0.05, 0.2); }, [2, 2]);
    case 'sonXanhChan': return tx(key, 256, 512, (g, w, h) => {
      nen(g, w, h, '#EEE8DA'); hat(g, w, h, 2400, ['#FFFFFF', '#D9D0BC'], 1, 3, 4, 0.05, 0.18);
      const m = h / 4; g.fillStyle = MAU.xanh; g.fillRect(0, h - m * 1.05, w, m * 1.05);
      g.fillStyle = MAU.vang; g.fillRect(0, h - m * 1.05 - 4, w, 4);
    }, [2, 4]);
    case 'gachMen': return tx(key, 512, 512, (g, w, h) => {
      const R = rng(5); nen(g, w, h, '#D3D8D3');
      for (let r = 0; r < 4; r++) for (let c = 0; c < 2; c++) { const v = 244 + ((R() * 8) | 0); g.fillStyle = `rgb(${v},${v + 1},${v - 2})`; g.fillRect(c * 256 + 2, r * 128 + 2, 252, 124); }
    }, [1.2, 1.2]);
    case 'gachLat': return tx(key, 512, 512, (g, w, h) => {
      const R = rng(6); nen(g, w, h, '#C9BBA0');
      for (let r = 0; r < 2; r++) for (let c = 0; c < 2; c++) { const v = (R() * 10) | 0; g.fillStyle = `rgb(${226 + v},${216 + v},${194 + v})`; g.fillRect(c * 256 + 2, r * 256 + 2, 252, 252); }
      hat(g, w, h, 900, ['#FFFFFF', '#BFAF8F'], 1, 3, 6, 0.05, 0.15);
    }, [1.2, 1.2]);
    case 'go': return tx(key, 512, 512, (g, w, h) => {
      const R = rng(7), toneS = ['#B88A5A', '#A97C4F', '#C29669', '#9F7246', '#B4834F'], hang = 12, hh = h / hang;
      for (let r = 0; r < hang; r++) { let x = -R() * 200; while (x < w) { const L = 140 + R() * 220; g.fillStyle = toneS[(R() * toneS.length) | 0]; g.fillRect(x, r * hh, L - 2, hh - 2); g.strokeStyle = 'rgba(80,50,25,0.18)'; for (let k = 0; k < 4; k++) { g.beginPath(); g.moveTo(x, r * hh + R() * hh); g.lineTo(x + L, r * hh + R() * hh); g.stroke(); } x += L; } }
    }, [2.4, 2.4]);
    case 'epoxyBan': return tx(key, 256, 256, (g, w, h) => { nen(g, w, h, '#E3DBC6'); hat(g, w, h, 1400, ['#F1EBDC', '#CFC4A8'], 1, 3, 8, 0.05, 0.2); }, [3, 3]);
    case 'epoxySach': return tx(key, 256, 256, (g, w, h) => { nen(g, w, h, '#CFE3D3'); hat(g, w, h, 1400, ['#E4F0E6', '#B5CFBC'], 1, 3, 9, 0.05, 0.2); }, [3, 3]);
    case 'epoxyXam': return tx(key, 256, 256, (g, w, h) => { nen(g, w, h, '#D7DAD5'); hat(g, w, h, 1400, ['#E8EAE6', '#BFC3BD'], 1, 3, 10, 0.05, 0.2); }, [3, 3]);
    case 'betong': return tx(key, 256, 256, (g, w, h) => { nen(g, w, h, '#C9C6BD'); hat(g, w, h, 2400, ['#DAD7CF', '#ABA79C', '#B9B5AA'], 1, 4, 11, 0.06, 0.25); }, [3, 3]);
    case 'tran': return tx(key, 128, 128, (g, w, h) => { nen(g, w, h, '#F3F2EE'); hat(g, w, h, 300, ['#FFFFFF', '#E1DFD8'], 1, 2, 12, 0.05, 0.15); }, [2, 2]);
    case 'san': return tx(key, 512, 512, (g, w, h) => {
      const R = rng(13); nen(g, w, h, '#B8B1A1');
      for (let r = 0; r < 4; r++) for (let c = 0; c < 4; c++) { const v = (R() * 14) | 0; g.fillStyle = `rgb(${210 + v},${205 + v},${193 + v})`; g.fillRect(c * 128 + 2, r * 128 + 2, 124, 124); }
      hat(g, w, h, 1500, ['#EAE6DC', '#A8A08E'], 1, 3, 13, 0.05, 0.2);
    }, [2, 2]);
    case 'gach': return tx(key, 512, 256, (g, w, h) => {
      const R = rng(14), bw = 102, bh = 32; nen(g, w, h, '#B9AA97');
      for (let r = 0; r < 8; r++) for (let c = -1; c < 6; c++) { const x = c * bw + (r % 2 ? bw / 2 : 0); const v = (R() * 30) | 0; g.fillStyle = `rgb(${150 + v},${72 + v / 2},${48 + v / 3})`; g.fillRect(x + 2, r * bh + 2, bw - 4, bh - 4); }
    }, [1, 0.5]);
    case 'tonXanh': return tx(key, 256, 64, (g, w, h) => { for (let i = 0; i < 4; i++) { const gr = g.createLinearGradient(i * 64, 0, i * 64 + 64, 0); gr.addColorStop(0, '#173F30'); gr.addColorStop(0.45, '#2A6049'); gr.addColorStop(0.55, '#2E664E'); gr.addColorStop(1, '#173F30'); g.fillStyle = gr; g.fillRect(i * 64, 0, 64, h); } }, [1, 0.25]);
    case 'tonXam': return tx(key, 256, 64, (g, w, h) => { for (let i = 0; i < 4; i++) { const gr = g.createLinearGradient(i * 64, 0, i * 64 + 64, 0); gr.addColorStop(0, '#7F8786'); gr.addColorStop(0.5, '#A9B0AE'); gr.addColorStop(1, '#7F8786'); g.fillStyle = gr; g.fillRect(i * 64, 0, 64, h); } hat(g, w, h, 300, ['#6E5A47', '#8F7F70'], 1, 3, 15, 0.05, 0.2); }, [1, 0.25]);
    case 'ngoi': return tx(key, 256, 256, (g, w, h) => {
      nen(g, w, h, '#7E3A22');
      for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) { const x = c * 32 + (r % 2) * 16, y = r * 32; const gr = g.createLinearGradient(0, y, 0, y + 32); gr.addColorStop(0, '#B4583A'); gr.addColorStop(1, '#8A4027'); g.fillStyle = gr; g.beginPath(); g.moveTo(x, y); g.lineTo(x + 32, y); g.lineTo(x + 32, y + 22); g.quadraticCurveTo(x + 16, y + 34, x, y + 22); g.closePath(); g.fill(); }
    }, [0.8, 0.8]);
    case 'co': return tx(key, 512, 512, (g, w, h) => { nen(g, w, h, '#6F8F4C'); hat(g, w, h, 9000, ['#5C7D3E', '#86A65C', '#7B9A52', '#526F37', '#94B26A'], 1, 4, 16, 0.25, 0.6); }, [5, 5]);
    case 'nhua': return tx(key, 512, 512, (g, w, h) => { nen(g, w, h, '#5B605D'); hat(g, w, h, 6000, ['#6C716E', '#4B504D', '#7A7F7B'], 1, 3, 17, 0.2, 0.5); }, [5, 5]);
    case 'luoi': return tx(key, 64, 64, (g, w, h) => { g.clearRect(0, 0, w, h); g.strokeStyle = 'rgba(232,238,234,0.9)'; g.lineWidth = 2; for (let i = 0; i <= 64; i += 16) { g.beginPath(); g.moveTo(i, 0); g.lineTo(i, h); g.stroke(); g.beginPath(); g.moveTo(0, i); g.lineTo(w, i); g.stroke(); } }, [0.12, 0.12]);
    case 'poly': return tx(key, 256, 64, (g, w, h) => { nen(g, w, h, '#F4F7F5'); g.fillStyle = 'rgba(190,205,198,0.8)'; for (let i = 0; i < 256; i += 32) g.fillRect(i, 0, 3, h); }, [1, 0.25]);
    case 'hangRao': return tx(key, 256, 128, (g, w, h) => { g.clearRect(0, 0, w, h); g.fillStyle = MAU.xanh; for (let i = 6; i < w; i += 22) g.fillRect(i, 0, 7, h); g.fillRect(0, 6, w, 8); g.fillRect(0, h - 14, w, 8); }, [1.2, 1.8]);
    case 'soc': return tx(key, 128, 256, (g, w, h) => { nen(g, w, h, MAU.xanh); g.strokeStyle = MAU.vang; g.lineWidth = 6; for (let i = -h; i < h * 2; i += 36) { g.beginPath(); g.moveTo(0, i); g.lineTo(w, i + w); g.stroke(); } }, [0.6, 1.2]);
    default: return null;
  }
}

/* ---------- vật liệu ---------- */
const DS = THREE.DoubleSide;
const L = (o) => new THREE.MeshLambertMaterial(o);
const VL = {};
const MAU_VL = {
  inox: 0xC6CDCE, inoxToi: 0x8E989A, xanh: 0x1D4B3A, xanhNhat: 0x3E6E57, xanhLa: 0x4F8A55, vang: 0xE4A92A, tim: 0x7A3E8F,
  goDam: 0x7A5434, goSang: 0xC39A6B, trang: 0xF2F2EE, den: 0x2A2E2C, nhuaXanh: 0x2E7D4F, canhCay: 0x3E7A45, canhCay2: 0x5A9150,
  than: 0x6B4A2F, tra: 0x56703A, traiCay: 0xE9B53A, kraft: 0xC79E66, tre: 0xC9A86A, xamNhat: 0xB9BDB8, nuoc: 0x8FB9C4, chau: 0xC27A4E, kem: 0xF4EFE3,
  bao: 0xB39467, cacao: 0x6B4226, socola: 0x3B2416, nau: 0x7A4A2A, traiCacao: 0xD9A23A
};
function vl(key) {
  if (VL[key]) return VL[key];
  let m;
  if (key === 'kinh') m = L({ color: 0xA7C9D3, transparent: true, opacity: 0.3, depthWrite: false });
  else if (key === 'rem') m = L({ color: 0xD3EAEE, transparent: true, opacity: 0.32, depthWrite: false, side: DS });
  else if (key === 'luoi') m = L({ map: beMat('luoi'), transparent: true, depthWrite: false, side: DS });
  else if (key === 'poly') m = L({ map: beMat('poly'), transparent: true, opacity: 0.6, depthWrite: false, side: DS });
  else if (key === 'hangRao') m = L({ map: beMat('hangRao'), transparent: true, alphaTest: 0.5, side: DS });
  else if (key === 'led') m = new THREE.MeshBasicMaterial({ color: 0xFFFDF2 });
  else if (MAU_VL[key] !== undefined) m = L({ color: MAU_VL[key] });
  else if (key.endsWith('2')) m = L({ map: beMat(key.slice(0, -1)), side: DS });
  else m = L({ map: beMat(key) });
  return (VL[key] = m);
}
/* vật liệu có hình nhận diện (biển, tranh, bao bì): tự sáng nhẹ để đọc được trong phòng */
function vlHinh(key, t, sang) {
  const k = 'h:' + key;
  return VL[k] || (VL[k] = L({ map: t, emissive: 0xffffff, emissiveMap: t, emissiveIntensity: sang === undefined ? 0.22 : sang }));
}

/* ---------- hình nhận diện ---------- */
function veLa(g, x, y, d, goc, mau) {
  g.save(); g.translate(x, y); g.rotate(goc); g.fillStyle = mau;
  g.beginPath(); g.moveTo(0, 0); g.quadraticCurveTo(d * 0.5, -d * 0.42, d, 0); g.quadraticCurveTo(d * 0.5, d * 0.42, 0, 0); g.fill();
  g.strokeStyle = 'rgba(255,255,255,0.35)'; g.lineWidth = Math.max(1, d * 0.04); g.beginPath(); g.moveTo(d * 0.1, 0); g.lineTo(d * 0.88, 0); g.stroke();
  g.restore();
}
/* logo chữ Heragrain, hai lá trên chữ H, chữ FOODS vàng giãn cách; y = đường chân chữ */
function veLogo(g, cx, y, s, toi) {
  g.save(); g.textBaseline = 'alphabetic'; g.textAlign = 'left';
  g.font = `800 ${s}px ${FONT}`;
  const chu = 'Heragrain', w = g.measureText(chu).width, x0 = cx - w / 2, wH = g.measureText('H').width;
  g.fillStyle = toi ? MAU.kem : MAU.xanh; g.fillText(chu, x0, y);
  veLa(g, x0 + wH * 0.5, y - s * 0.73, s * 0.33, -2.3, toi ? '#8CC59A' : MAU.la);
  veLa(g, x0 + wH * 0.5, y - s * 0.73, s * 0.4, -0.8, toi ? '#B9DDBF' : '#3F7F52');
  const fs = s * 0.32; g.font = `700 ${fs}px ${FONT}`; g.fillStyle = MAU.vang;
  const sp = fs * 0.42; gianChu(g, 'FOODS', x0 + w - rongGian(g, 'FOODS', sp), y + fs * 1.18, sp);
  g.restore();
}
function veNetNui(g, x, y, w, h, mau, lw) {
  g.save(); g.strokeStyle = mau; g.lineWidth = lw; g.lineJoin = 'round'; g.lineCap = 'round';
  const ve = (pts, a) => { g.globalAlpha = a; g.beginPath(); pts.forEach(([u, v], i) => (i ? g.lineTo(x + u * w, y + v * h) : g.moveTo(x + u * w, y + v * h))); g.stroke(); };
  ve([[0, 1], [0.16, 0.5], [0.3, 0.72], [0.48, 0.12], [0.64, 0.56], [0.79, 0.34], [1, 0.86]], 1);
  ve([[0.06, 1], [0.24, 0.66], [0.4, 0.82], [0.57, 0.42], [0.72, 0.7], [0.9, 0.52], [1, 0.62]], 0.55);
  g.globalAlpha = 1;
  for (let i = 0; i < 6; i++) { const u = 0.08 + i * 0.16; g.beginPath(); g.moveTo(x + u * w, y + h); g.quadraticCurveTo(x + (u + 0.03) * w, y + h * 0.9, x + (u + 0.01) * w, y + h * 0.82); g.stroke(); }
  g.restore();
}
function veCanh(g, x, y, w, h, seed) {
  const sky = g.createLinearGradient(0, y, 0, y + h * 0.6); sky.addColorStop(0, '#9CC7E0'); sky.addColorStop(1, '#F4E7C8');
  g.fillStyle = sky; g.fillRect(x, y, w, h);
  const sx = x + w * 0.72, sy = y + h * 0.3, sun = g.createRadialGradient(sx, sy, 2, sx, sy, h * 0.3);
  sun.addColorStop(0, 'rgba(255,240,200,0.95)'); sun.addColorStop(1, 'rgba(255,240,200,0)'); g.fillStyle = sun; g.fillRect(x, y, w, h);
  [['#A9C2B5', 0.4, 0.1], ['#88A897', 0.52, 0.09], ['#5E8A6B', 0.64, 0.08], ['#3E6B4C', 0.77, 0.06], ['#2C5638', 0.9, 0.04]].forEach(([mau, cao, bien], li) => {
    g.fillStyle = mau; g.beginPath(); g.moveTo(x, y + h);
    for (let i = 0; i <= 80; i++) { const u = i / 80; const v = cao + Math.sin(u * 6.28 * (1.2 + li * 0.45) + li * 1.7 + seed) * bien * 0.55 + Math.sin(u * 6.28 * (3.3 + li) + li + seed) * bien * 0.25; g.lineTo(x + u * w, y + h * v); }
    g.lineTo(x + w, y + h); g.closePath(); g.fill();
  });
  g.fillStyle = 'rgba(25,60,35,0.55)';
  for (let r = 0; r < 4; r++) for (let i = 0; i < 46; i++) { g.beginPath(); g.arc(x + (i / 46 + (r % 2) * 0.011) * w, y + h * (0.86 + r * 0.035), h * 0.011 * (1 + r * 0.45), 0, 6.29); g.fill(); }
}
function duongH(g, x, y, w, h) { // đường viền chữ H (cửa sổ H của bao bì)
  const c = w * 0.32, a = h * 0.38, b = h * 0.62;
  g.beginPath(); g.moveTo(x, y); g.lineTo(x + c, y); g.lineTo(x + c, y + a); g.lineTo(x + w - c, y + a); g.lineTo(x + w - c, y); g.lineTo(x + w, y);
  g.lineTo(x + w, y + h); g.lineTo(x + w - c, y + h); g.lineTo(x + w - c, y + b); g.lineTo(x + c, y + b); g.lineTo(x + c, y + h); g.lineTo(x, y + h); g.closePath();
}
function veTraiTrongH(g, x, y, w, h, mau, seed) {
  g.save(); duongH(g, x, y, w, h); g.clip(); g.fillStyle = mau[0]; g.fillRect(x, y, w, h);
  const R = rng(seed);
  for (let i = 0; i < 80; i++) { g.fillStyle = mau[(R() * mau.length) | 0]; g.beginPath(); g.ellipse(x + R() * w, y + R() * h, w * (0.04 + R() * 0.07), w * (0.03 + R() * 0.04), R() * 3, 0, 6.29); g.fill(); g.strokeStyle = 'rgba(110,70,20,0.25)'; g.lineWidth = 1.5; g.stroke(); }
  g.restore(); g.strokeStyle = 'rgba(29,75,58,0.55)'; g.lineWidth = Math.max(2, w * 0.012); duongH(g, x, y, w, h); g.stroke();
}
const SP = {
  nibs: { nen: '#5A3825', ten: 'ROASTED COCOA NIBS', vn: 'NIBS CA CAO RANG', trai: ['#6B4226', '#4E2E1A', '#8A5A36'], kl: '200 g' },
  socola: { nen: '#2E1C12', ten: 'DARK CHOCOLATE 70%', vn: 'SOCOLA ĐEN ĐẮK LẮK', trai: ['#3A2216', '#4A2C1C', '#2E1A10'], kl: '80 g' },
  bot: { nen: '#7A4A2A', ten: 'PURE COCOA POWDER', vn: 'BỘT CA CAO NGUYÊN CHẤT', trai: ['#7B4A2D', '#8C5A38', '#6A3E24'], kl: '250 g' }
};
function veTui(g, x, y, w, h, key) {
  const s = SP[key];
  g.fillStyle = '#F6F1E6'; g.fillRect(x, y, w, h);
  veLogo(g, x + w / 2, y + h * 0.13, w * 0.15, false);
  veTraiTrongH(g, x + w * 0.24, y + h * 0.18, w * 0.52, h * 0.42, s.trai, key.length * 7);
  g.fillStyle = s.nen; g.beginPath(); g.moveTo(x, y + h * 0.68); g.quadraticCurveTo(x + w / 2, y + h * 0.62, x + w, y + h * 0.68); g.lineTo(x + w, y + h); g.lineTo(x, y + h); g.closePath(); g.fill();
  g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'alphabetic';
  vua(g, s.ten, w * 0.86, w * 0.09, 800); g.fillText(s.ten, x + w / 2, y + h * 0.79);
  vua(g, s.vn, w * 0.8, w * 0.058, 600); g.fillText(s.vn, x + w / 2, y + h * 0.84);
  g.font = `500 ${w * 0.04}px ${FONT}`; g.textAlign = 'left'; g.fillText('Single origin', x + w * 0.06, y + h * 0.93); g.fillText('Đắk Lắk · Việt Nam', x + w * 0.06, y + h * 0.965);
  g.textAlign = 'right'; g.font = `700 ${w * 0.05}px ${FONT}`; g.fillText(s.kl, x + w * 0.94, y + h * 0.955);
}
function veBien(g, w, h, text, sub, kieu) {
  const K = { xanh: [MAU.xanh, MAU.kem, MAU.vang], vang: [MAU.vang, '#1D2B22', MAU.xanh], la: [MAU.la, '#FFFFFF', MAU.kem], kem: [MAU.kem, MAU.xanh, MAU.vang] }[kieu || 'xanh'];
  nen(g, w, h, K[0]); g.strokeStyle = K[2]; g.lineWidth = h * 0.035; g.strokeRect(h * 0.05, h * 0.05, w - h * 0.1, h - h * 0.1);
  g.fillStyle = K[1]; g.textAlign = 'center'; g.textBaseline = 'middle';
  if (sub) {
    vua(g, text, w * 0.9, h * 0.42, 800); g.fillText(text, w / 2, h * 0.38);
    g.fillStyle = K[2] === MAU.kem ? K[1] : K[2]; vua(g, sub, w * 0.86, h * 0.22, 600); g.fillText(sub, w / 2, h * 0.74);
  } else { vua(g, text, w * 0.9, h * 0.56, 800); g.fillText(text, w / 2, h * 0.53); }
}
function veTieuDePoster(g, w, text, mauNen) { g.fillStyle = mauNen || MAU.xanh; g.fillRect(0, 0, w, 120); g.fillStyle = MAU.kem; g.textAlign = 'center'; g.textBaseline = 'middle'; vua(g, text, w * 0.86, 50, 800); g.fillText(text, w / 2, 62); }

/* các hình có tên, dùng cho biển ngoài nhà, tranh treo tường, bao bì */
function hinh(key) {
  switch (key) {
    case 'matTien': return tx(key, 2560, 206, (g, w, h) => {
      nen(g, w, h, MAU.xanh); g.strokeStyle = MAU.vang; g.lineWidth = 4; g.strokeRect(8, 8, w - 16, h - 16);
      veLogo(g, 330, 128, 104, true);
      g.fillStyle = MAU.vang; g.fillRect(640, 40, 3, h - 80); g.fillRect(1820, 40, 3, h - 80);
      g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillStyle = MAU.vang; g.font = `italic 600 76px ${SERIF}`; g.fillText('Thấy tận mắt, ăn yên tâm.', 1230, h / 2);
      g.fillStyle = MAU.kem; g.font = `800 50px ${FONT}`; g.fillText('HTX HERAGRAIN', 2190, 82);
      g.font = `500 30px ${FONT}`; g.fillText('Xưởng chế biến trái cây sấy & trà', 2190, 132); g.fillText('Đắk Lắk · Việt Nam', 2190, 170);
    });
    case 'logoKem': return tx(key, 1080, 400, (g, w, h) => {
      nen(g, w, h, MAU.kem); g.strokeStyle = MAU.vang; g.lineWidth = 6; g.strokeRect(14, 14, w - 28, h - 28);
      veLogo(g, w / 2, 230, 176, false);
      g.fillStyle = MAU.xanh; g.textAlign = 'center'; g.font = `600 34px ${FONT}`; g.fillText('CA CAO & SOCOLA · ĐẮK LẮK · VIỆT NAM', w / 2, 345);
    });
    case 'bangHTX': return tx(key, 520, 220, (g, w, h) => {
      nen(g, w, h, MAU.xanh); g.strokeStyle = MAU.vang; g.lineWidth = 5; g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = MAU.kem; g.textAlign = 'center'; g.font = `800 56px ${FONT}`; g.fillText('HTX HERAGRAIN', w / 2, 100);
      g.fillStyle = MAU.vang; g.font = `500 28px ${FONT}`; g.fillText('Xưởng ca cao · Kho thành phẩm', w / 2, 158);
    });
    case 'cuaXuong': return tx(key, 1024, 220, (g, w, h) => veBien(g, w, h, 'XƯỞNG CA CAO HERAGRAIN', 'Cửa vào xưởng · Rèm nhựa luôn đóng', 'xanh'));
    case 'tuongLogo': return tx(key, 1300, 800, (g, w, h) => {
      nen(g, w, h, MAU.xanh); veNetNui(g, 40, h * 0.62, w - 80, h * 0.3, MAU.vang, 4);
      veLogo(g, w / 2, h * 0.42, 190, true);
      g.textAlign = 'center'; g.fillStyle = MAU.vang; g.font = `italic 600 64px ${SERIF}`; g.fillText('Thấy tận mắt, ăn yên tâm.', w / 2, h * 0.58);
      g.fillStyle = MAU.kem; g.font = `600 30px ${FONT}`; g.fillText('CA CAO & SOCOLA · ĐẮK LẮK · VIỆT NAM', w / 2, h * 0.94);
    });
    case 'tuongTayNguyen': return tx(key, 2300, 300, (g, w, h) => {
      veCanh(g, 0, 0, w, h, 2);
      g.fillStyle = 'rgba(244,239,227,0.88)'; g.fillRect(40, 40, 620, h - 80);
      veLogo(g, 350, 150, 74, false);
      g.fillStyle = MAU.xanh; g.textAlign = 'center'; g.font = `italic 600 40px ${SERIF}`; g.fillText('Ca cao từ đất đỏ bazan Tây Nguyên', 350, 222);
    });
    case 'tranhPhongCanh': return tx(key, 1000, 450, (g, w, h) => { veCanh(g, 0, 0, w, h, 5); g.strokeStyle = MAU.xanh; g.lineWidth = 18; g.strokeRect(9, 9, w - 18, h - 18); });
    case 'khauhieu': return tx(key, 600, 820, (g, w, h) => {
      veCanh(g, 0, 0, w, h * 0.62, 3); g.fillStyle = MAU.kem; g.fillRect(0, h * 0.62, w, h * 0.38);
      g.fillStyle = MAU.xanh; g.textAlign = 'center'; g.font = `italic 600 54px ${SERIF}`; g.fillText('Thấy tận mắt,', w / 2, h * 0.72); g.fillText('ăn yên tâm.', w / 2, h * 0.795);
      veLogo(g, w / 2, h * 0.92, 64, false);
    });
    case 'sanPham': return tx(key, 600, 820, (g, w, h) => {
      nen(g, w, h, MAU.kem); veTieuDePoster(g, w, 'CA CAO HERAGRAIN', '#5A3825');
      ['nibs', 'socola', 'bot'].forEach((k, i) => veTui(g, 30 + i * 186, 170, 168, 252, k));
      g.fillStyle = MAU.xanh; g.textAlign = 'center'; g.font = `italic 600 44px ${SERIF}`; g.fillText('Thấy tận mắt, ăn yên tâm.', w / 2, 520);
      g.font = `500 26px ${FONT}`; ['Nibs rang · Socola đen 70–100 %', 'Bột ca cao · Bơ ca cao', 'Hạt lên men từ HTX Đắk Lắk'].forEach((t, i) => g.fillText(t, w / 2, 600 + i * 46));
      veNetNui(g, 40, 720, w - 80, 70, MAU.vang, 3);
    });
    case 'ruaTay': return tx(key, 600, 820, (g, w, h) => {
      nen(g, w, h, '#FFFFFF'); veTieuDePoster(g, w, 'RỬA TAY ĐÚNG CÁCH');
      ['Làm ướt tay', 'Xoa xà phòng', 'Chà lòng bàn tay', 'Chà mu tay, kẽ ngón', 'Xả sạch dưới vòi', 'Lau bằng khăn giấy'].forEach((t, i) => {
        const cx = 160 + (i % 2) * 280, cy = 220 + Math.floor(i / 2) * 175;
        g.fillStyle = MAU.la; g.beginPath(); g.arc(cx, cy, 52, 0, 6.29); g.fill();
        g.fillStyle = '#FFFFFF'; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 50px ${FONT}`; g.fillText(String(i + 1), cx, cy + 2);
        g.fillStyle = MAU.xanh; g.font = `600 26px ${FONT}`; g.fillText(t, cx, cy + 82);
      });
      g.fillStyle = MAU.vang; g.fillRect(0, h - 110, w, 110); g.fillStyle = '#1D2B22'; g.font = `700 30px ${FONT}`; g.textAlign = 'center'; g.fillText('Bắt buộc trước khi vào khu sạch', w / 2, h - 55);
    });
    case 'baoHo': return tx(key, 600, 820, (g, w, h) => {
      nen(g, w, h, '#FFFFFF'); veTieuDePoster(g, w, 'TRANG PHỤC BẢO HỘ');
      [['Mũ trùm tóc', 0], ['Khẩu trang', 1], ['Áo, tạp dề sạch', 2], ['Ủng', 3]].forEach(([t, i]) => {
        const y = 200 + i * 128; g.fillStyle = MAU.la; g.beginPath(); g.arc(110, y, 46, 0, 6.29); g.fill();
        g.fillStyle = '#FFFFFF';
        if (i === 0) { g.beginPath(); g.arc(110, y + 8, 28, Math.PI, 0); g.fill(); }
        if (i === 1) g.fillRect(84, y - 12, 52, 26);
        if (i === 2) { g.fillRect(92, y - 26, 36, 54); g.fillRect(80, y - 26, 60, 10); }
        if (i === 3) { g.fillRect(96, y - 28, 20, 44); g.fillRect(96, y + 8, 38, 14); }
        g.fillStyle = MAU.xanh; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = `600 34px ${FONT}`; g.fillText(t, 180, y);
      });
      g.fillStyle = MAU.xanh; g.fillRect(0, h - 120, w, 120); g.fillStyle = MAU.kem; g.textAlign = 'center'; g.font = `600 25px ${FONT}`;
      g.fillText('Không đeo trang sức, không mang', w / 2, h - 76); g.fillText('đồ ăn, điện thoại vào xưởng', w / 2, h - 40);
    });
    case 'ccp': return tx(key, 600, 600, (g, w, h) => {
      nen(g, w, h, MAU.vang); g.strokeStyle = MAU.xanh; g.lineWidth = 20; g.strokeRect(10, 10, w - 20, h - 20);
      g.fillStyle = MAU.xanh; g.textAlign = 'center'; g.textBaseline = 'middle'; g.font = `800 190px ${FONT}`; g.fillText('CCP', w / 2, 220);
      g.font = `700 40px ${FONT}`; g.fillText('ĐIỂM KIỂM SOÁT TỚI HẠN', w / 2, 370);
      g.font = `500 30px ${FONT}`; g.fillText('Ghi nhiệt độ, thời gian', w / 2, 440); g.fillText('từng mẻ rang, dò kim loại', w / 2, 482);
    });
    case 'lotrinh': return tx(key, 2560, 512, (g, w, h) => {
      nen(g, w, h, MAU.kem); g.fillStyle = MAU.xanh; g.fillRect(0, 0, w, 96);
      g.fillStyle = MAU.kem; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = `800 52px ${FONT}`; g.fillText('LỘ TRÌNH 4 GIAI ĐOẠN DÒNG CA CAO', 48, 50);
      veLogo(g, w - 260, 70, 50, true);
      const mau = ['#5E9E68', '#23765C', '#E4A92A', '#86479B'], bw = (w - 96 - 3 * 40) / 4;
      (H.PH || []).forEach((p, i) => {
        const x = 48 + i * (bw + 40), y = 130;
        g.fillStyle = mau[i]; g.fillRect(x, y, bw, 352);
        if (i < 3) { g.fillStyle = MAU.xanh; g.beginPath(); g.moveTo(x + bw + 8, y + 150); g.lineTo(x + bw + 32, y + 176); g.lineTo(x + bw + 8, y + 202); g.fill(); }
        const chu = i === 2 ? '#1D2B22' : '#FFFFFF'; g.fillStyle = chu; g.textAlign = 'left'; g.textBaseline = 'alphabetic';
        g.font = `600 30px ${FONT}`; g.fillText('GIAI ĐOẠN ' + p.n + ' · ' + p.when, x + 28, y + 52);
        g.font = `800 50px ${FONT}`; g.fillText(p.tab, x + 28, y + 116);
        g.font = `500 27px ${FONT}`; let yy = dongChu(g, p.cert, x + 28, y + 170, bw - 56, 36);
        g.font = `600 27px ${FONT}`; dongChu(g, 'Nhân sự ' + p.people, x + 28, Math.min(yy + 12, y + 320), bw - 56, 34);
      });
    });
    case 'quytrinh': return tx(key, 2048, 512, (g, w, h) => {
      nen(g, w, h, MAU.kem); g.fillStyle = MAU.xanh; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = `800 50px ${FONT}`; g.fillText('QUY TRÌNH 11 BƯỚC', 40, 58);
      g.font = `500 28px ${FONT}`; g.fillStyle = MAU.la; g.fillText('Hàng thô: 1 → 6 · Socola: 7 → 9 → 10 · Bột, bơ: 8 → 10 · Không quay lại phòng trước', 560, 58);
      const st = H.STEPS || [], bw = (w - 80) / st.length;
      st.forEach((s, i) => {
        const cx = 40 + bw * (i + 0.5), cy = 220;
        if (i < st.length - 1) { g.strokeStyle = MAU.vang; g.lineWidth = 6; g.beginPath(); g.moveTo(cx + 50, cy); g.lineTo(cx + bw - 50, cy); g.stroke(); }
        g.fillStyle = i < 3 ? MAU.vang : i < 6 ? '#23765C' : MAU.la; g.beginPath(); g.arc(cx, cy, 48, 0, 6.29); g.fill();
        g.fillStyle = i < 3 ? '#1D2B22' : '#FFFFFF'; g.textAlign = 'center'; g.font = `800 46px ${FONT}`; g.fillText(String(s.n), cx, cy + 2);
        g.fillStyle = MAU.xanh; g.textBaseline = 'alphabetic'; g.font = `600 26px ${FONT}`; dongChu(g, s.name, cx, cy + 100, bw - 16, 32); g.textBaseline = 'middle';
      });
    });
    case 'cutTest': return tx(key, 600, 820, (g, w, h) => {
      nen(g, w, h, '#FFFFFF'); veTieuDePoster(g, w, 'CUT TEST 300 HẠT', '#5A3825');
      [['#7A4A2A', 'Lên men tốt', 'nâu, rãnh rõ'], ['#6E4A86', 'Lên men chưa đủ', 'tím, tím nâu'], ['#5E6266', 'Hạt đá', 'xám, không lên men'], ['#7E8B5A', 'Hạt mốc', 'loại bỏ'], ['#B89B6A', 'Hạt sâu, nảy mầm', 'loại bỏ']].forEach(([mau, t, sub], i) => {
        const y = 190 + i * 110; g.fillStyle = mau; g.beginPath(); g.ellipse(110, y, 62, 40, 0, 0, 6.29); g.fill();
        g.strokeStyle = 'rgba(255,255,255,0.5)'; g.lineWidth = 3; for (let k = -2; k <= 2; k++) { g.beginPath(); g.moveTo(80, y + k * 12); g.lineTo(140, y + k * 9); g.stroke(); }
        g.fillStyle = MAU.xanh; g.textAlign = 'left'; g.textBaseline = 'middle'; g.font = `700 32px ${FONT}`; g.fillText(t, 200, y - 14);
        g.fillStyle = '#566860'; g.font = `500 24px ${FONT}`; g.fillText(sub, 200, y + 22);
      });
      g.fillStyle = MAU.vang; g.fillRect(0, h - 90, w, 90); g.fillStyle = '#1D2B22'; g.textAlign = 'center'; g.font = `700 28px ${FONT}`; g.fillText('Độ ẩm nhận lô: theo hợp đồng (đề xuất ≤ 7,5 %)', w / 2, h - 45);
    });
    case 'hopqua': return tx(key, 512, 384, (g, w, h) => {
      nen(g, w, h, MAU.xanh); g.strokeStyle = MAU.vang; g.lineWidth = 4; g.strokeRect(14, 14, w - 28, h - 28);
      veNetNui(g, 250, 240, 240, 110, MAU.vang, 3); veLogo(g, 140, 100, 52, true);
      veTraiTrongH(g, 60, 140, 150, 200, SP.socola.trai, 3);
      g.fillStyle = MAU.vang; g.font = `500 22px ${FONT}`; g.textAlign = 'left'; g.fillText('Cacao & Chocolate', 260, 120);
    });
    case 'thung': return tx(key, 512, 384, (g, w, h) => {
      nen(g, w, h, '#C99F68'); hat(g, w, h, 2500, ['#B88E58', '#D8B27E', '#A97F4B'], 1, 3, 21, 0.1, 0.35);
      g.fillStyle = 'rgba(0,0,0,0.08)'; g.fillRect(0, 0, w, 40);
      veLogo(g, w / 2, 210, 80, false);
      g.fillStyle = MAU.xanh; g.textAlign = 'center'; g.font = `600 26px ${FONT}`; g.fillText('Ca cao & socola · Đắk Lắk', w / 2, 290);
      g.font = `800 36px ${FONT}`; g.fillText('↑↑', w - 60, 90);
    });
    case 'cont': return tx(key, 2048, 512, (g, w, h) => {
      nen(g, w, h, MAU.xanh); for (let i = 0; i < w; i += 40) { g.fillStyle = 'rgba(0,0,0,0.12)'; g.fillRect(i, 0, 4, h); }
      veNetNui(g, 1240, 250, 760, 210, MAU.vang, 6); veLogo(g, 560, 300, 210, true);
      g.fillStyle = MAU.vang; g.font = `italic 600 64px ${SERIF}`; g.textAlign = 'center'; g.fillText('Thấy tận mắt, ăn yên tâm.', 560, 430);
    });
    case 'tuTui': return tx(key, 256, 512, (g, w, h) => {
      nen(g, w, h, '#DCE3E2'); for (let r = 0; r < 4; r++) { g.fillStyle = '#9AA3A4'; g.fillRect(0, 120 + r * 120, w, 6); ['nibs', 'socola', 'bot', 'socola'].forEach((k, i) => veTui(g, 12 + i * 60, 40 + r * 120, 52, 78, k)); }
      g.strokeStyle = '#8E989A'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    });
    case 'tuMau': return tx(key, 256, 512, (g, w, h) => {
      nen(g, w, h, '#E6EBEA'); for (let r = 0; r < 5; r++) { g.fillStyle = '#9AA3A4'; g.fillRect(0, 96 + r * 96, w, 5); for (let i = 0; i < 6; i++) { g.fillStyle = ['#6B4226', '#3A2216', '#8C5A38'][(i + r) % 3]; g.fillRect(16 + i * 38, 50 + r * 96, 26, 44); g.fillStyle = '#FFFFFF'; g.fillRect(16 + i * 38, 46 + r * 96, 26, 8); } }
      g.strokeStyle = '#8E989A'; g.lineWidth = 10; g.strokeRect(5, 5, w - 10, h - 10);
    });
    case 'troi': return tx(key, 2048, 1024, (g, w, h) => {
      const hz = h * 0.5, sky = g.createLinearGradient(0, 0, 0, hz);
      sky.addColorStop(0, '#5B98C8'); sky.addColorStop(0.6, '#A8CBE0'); sky.addColorStop(1, '#E3ECE6'); g.fillStyle = sky; g.fillRect(0, 0, w, hz);
      g.fillStyle = '#C7D4C9'; g.fillRect(0, hz, w, h - hz);
      const R = rng(31);
      for (let i = 0; i < 42; i++) {
        const cx = R() * w, cy = hz * (0.3 + R() * 0.5), rx = 60 + R() * 170, ry = rx * (0.16 + R() * 0.1);
        for (let k = 0; k < 7; k++) { const gx = cx + (R() - 0.5) * rx * 1.2, gy = cy + (R() - 0.5) * ry; const gr = g.createRadialGradient(gx, gy, 1, gx, gy, rx * 0.5); gr.addColorStop(0, 'rgba(255,255,255,0.5)'); gr.addColorStop(1, 'rgba(255,255,255,0)'); g.fillStyle = gr; g.beginPath(); g.ellipse(gx, gy, rx * 0.5, ry, 0, 0, 6.29); g.fill(); }
      }
      [['#AFC3B8', 0.034, 0.022], ['#93AE9D', 0.022, 0.015], ['#729480', 0.012, 0.009]].forEach(([mau, cao, bien], li) => {
        g.fillStyle = mau; g.beginPath(); g.moveTo(0, hz + 2);
        for (let i = 0; i <= 512; i++) { const u = i / 512, a = u * Math.PI * 2; const v = cao + bien * (Math.sin(a * (3 + li) + li * 2) * 0.6 + Math.sin(a * (7 + 2 * li) + li) * 0.3 + Math.sin(a * (17 + li)) * 0.1); g.lineTo(u * w, hz - v * h); }
        g.lineTo(w, hz + 2); g.closePath(); g.fill();
      });
    });
    default: return null;
  }
}
function hinhBien(text, sub, kieu) { return tx('bien:' + text + '|' + sub + '|' + kieu, 1024, sub ? 300 : 220, (g, w, h) => veBien(g, w, h, text, sub, kieu)); }
function hinhTui(key) { return tx('tui:' + key, 384, 576, (g, w, h) => veTui(g, 0, 0, w, h, key)); }

/* ---------- hình khối ---------- */
/* hộp có UV tính theo mét để vân lặp đúng kích thước; y0 = cao độ chân hộp, giữ vân tường liền mạch theo chiều cao */
function hopUV(w, h, d, y0) {
  const g = new THREE.BoxGeometry(w, h, d), uv = g.attributes.uv;
  const kt = [[d, h], [d, h], [w, d], [w, d], [w, h], [w, h]];
  for (let f = 0; f < 6; f++) for (let i = 0; i < 4; i++) {
    const k = f * 4 + i, dung = f !== 2 && f !== 3;
    uv.setXY(k, uv.getX(k) * kt[f][0], uv.getY(k) * kt[f][1] + (dung ? (y0 || 0) : 0));
  }
  return g;
}
const GC = {};
const bx = (w, h, d) => GC['b' + w + '|' + h + '|' + d] || (GC['b' + w + '|' + h + '|' + d] = new THREE.BoxGeometry(w, h, d));
const cy = (r1, r2, h, s) => GC['c' + r1 + '|' + r2 + '|' + h + '|' + (s || 14)] || (GC['c' + r1 + '|' + r2 + '|' + h + '|' + (s || 14)] = new THREE.CylinderGeometry(r1, r2, h, s || 14));
function mesh(geo, mat, x, y, z, o) {
  const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z);
  if (o) { if (o.ry) m.rotation.y = o.ry; if (o.rx) m.rotation.x = o.rx; if (o.rz) m.rotation.z = o.rz; }
  m.castShadow = !(o && o.cast === false); m.receiveShadow = true; root.add(m); return m;
}
function tamGiac(pts, key) {
  const g = new THREE.BufferGeometry(), pos = [], uv = [];
  const dx = Math.abs(pts[0][0] - pts[1][0]) + Math.abs(pts[1][0] - pts[2][0]);
  pts.forEach((p) => { pos.push(p[0], p[1], p[2]); uv.push(dx > 0.01 ? p[0] : p[2], p[1]); });
  g.setAttribute('position', new THREE.Float32BufferAttribute(pos, 3)); g.setAttribute('uv', new THREE.Float32BufferAttribute(uv, 2)); g.computeVertexNormals();
  return mesh(g, vl(key + '2'), 0, 0, 0);
}
const QUAY = { N: Math.PI, S: 0, E: Math.PI / 2, W: -Math.PI / 2 };

/* ---------- khu, tường, cửa ---------- */
let ZONES = [], ROOMS = [];
const KHOANG = { ke: 1, cui: 1, gian: 1, long: 1, vach: 1 };
function doiZ(z, dz) {
  z.box[2] += dz; z.box[3] += dz;
  (z.doors || []).forEach((d) => { if (d.side === 'W' || d.side === 'E') d.at += dz; });
  if (z.pin) z.pin[2] += dz;
  (z.do || []).forEach((p) => { if (KHOANG[p[0]]) { p[3] += dz; p[4] += dz; } else p[2] += dz; });
}
const P = (z) => V.PHONG[z.id] || {};
const dims = (z) => { const [x0, x1, z0, z1] = z.box; return { x0, x1, z0, z1, cx: (x0 + x1) / 2, cz: (z0 + z1) / 2, w: x1 - x0, d: z1 - z0 }; };
const tuongTrong = (z) => P(z).tuong || 'son';
const tuongNgoai = (z) => P(z).ngoai || 'sonNgoai';
function caoTuong(z) { if (z.kind === 'house') return 3.1; if (z.noRoof) return 2.4; return Math.round(z.h * 8) / 10; }
const sidesOf = (z) => ['N', 'S', 'W', 'E'].filter((s) => !(z.open || []).includes(s));
function canh(k, s) {
  return { N: { fixed: k.z0, from: k.x0, len: k.w, ngang: true }, S: { fixed: k.z1, from: k.x0, len: k.w, ngang: true },
    W: { fixed: k.x0, from: k.z0, len: k.d, ngang: false }, E: { fixed: k.x1, from: k.z0, len: k.d, ngang: false } }[s];
}
function phongTai(x, zz) {
  let best = null, ba = 1e9;
  ROOMS.forEach((r) => { const [a, b, c, d] = r.box; if (x > a + 0.02 && x < b - 0.02 && zz > c + 0.02 && zz < d - 0.02) { const ar = (b - a) * (d - c); if (ar < ba) { best = r; ba = ar; } } });
  return best;
}
function benNgoai(z, s, fixed, t) {
  const o = 0.35, p = s === 'N' ? [t, fixed - o] : s === 'S' ? [t, fixed + o] : s === 'W' ? [fixed - o, t] : [fixed + o, t];
  const r = phongTai(p[0], p[1]); return r && r !== z ? r : null;
}
/* một khối tường dọc theo mặt s từ a đến b, cao từ y0 đến y1; mặt trong và mặt ngoài dùng vật liệu riêng */
function khoi(s, fixed, a, b, y0, y1, mIn, mOut, day) {
  const Lg = b - a, h = y1 - y0, c = (a + b) / 2, d = day || T;
  if (Lg < 0.02 || h < 0.02) return;
  const ngang = s === 'N' || s === 'S';
  const mats = [mIn, mIn, mIn, mIn, mIn, mIn];
  mats[{ N: 4, S: 5, W: 0, E: 1 }[s]] = mIn; mats[{ N: 5, S: 4, W: 1, E: 0 }[s]] = mOut;
  mesh(ngang ? hopUV(Lg, h, d, y0) : hopUV(d, h, Lg, y0), mats, ngang ? c : fixed, y0 + h / 2, ngang ? fixed : c);
}
function vienNgoai(s, fixed, a, b, y0, h, key) { // dải màu sát mặt ngoài tường (chân tường, diềm)
  const ra = { N: -1, S: 1, W: -1, E: 1 }[s] * (T / 2 + 0.012), ngang = s === 'N' || s === 'S', Lg = b - a, c = (a + b) / 2;
  mesh(ngang ? bx(Lg, h, 0.02) : bx(0.02, h, Lg), vl(key), ngang ? c : fixed + ra, y0 + h / 2, ngang ? fixed + ra : c, { cast: false });
}
function kinh(s, fixed, a, b, y0, y1) {
  const ngang = s === 'N' || s === 'S', Lg = b - a, c = (a + b) / 2, h = y1 - y0;
  const g = mesh(ngang ? bx(Lg, h, 0.03) : bx(0.03, h, Lg), vl('kinh'), ngang ? c : fixed, y0 + h / 2, ngang ? fixed : c, { cast: false });
  g.castShadow = false;
  const k = (w, hh, dx, dy) => mesh(ngang ? bx(w, hh, 0.07) : bx(0.07, hh, w), vl('xanh'), ngang ? c + dx : fixed, y0 + h / 2 + dy, ngang ? fixed : c + dx, { cast: false });
  k(Lg, 0.05, 0, h / 2); k(Lg, 0.05, 0, -h / 2); k(0.05, h, -Lg / 2, 0); k(0.05, h, Lg / 2, 0); k(0.04, h, 0, 0);
}
function cuaSoCua(z, Hw) {
  const c = P(z).cuaSo; if (!c) return null;
  if (c === 'thuong') return { bau: 0.9, dinh: Math.min(2.1, Hw - 0.4) };
  return Hw >= 3 ? { bau: Hw - 1.0, dinh: Hw - 0.3 } : null;
}
function doanTuong(z, s, cd, a, b, Hw, mIn) {
  const nb = benNgoai(z, s, cd.fixed, (a + b) / 2), ngoai = !nb, mOut = vl(nb ? tuongTrong(nb) : tuongNgoai(z));
  const cs = ngoai && !(P(z).tuongKin || []).includes(s) ? cuaSoCua(z, Hw) : null, Lg = b - a;
  if (!cs || Lg < 1.8) khoi(s, cd.fixed, a, b, FY, FY + Hw, mIn, mOut);
  else {
    khoi(s, cd.fixed, a, b, FY, FY + cs.bau, mIn, mOut); khoi(s, cd.fixed, a, b, FY + cs.dinh, FY + Hw, mIn, mOut);
    const n = Math.max(1, Math.floor((Lg - 0.6) / 2.8)), ww = Math.min(1.5, (Lg - 0.6) / n - 0.5);
    let cur = a;
    for (let i = 0; i < n; i++) { const c = a + Lg * (i + 0.5) / n, w0 = c - ww / 2, w1 = c + ww / 2; khoi(s, cd.fixed, cur, w0, FY + cs.bau, FY + cs.dinh, mIn, mOut); kinh(s, cd.fixed, w0, w1, FY + cs.bau, FY + cs.dinh); cur = w1; }
    khoi(s, cd.fixed, cur, b, FY + cs.bau, FY + cs.dinh, mIn, mOut);
  }
  if (ngoai && !z.noRoof) { vienNgoai(s, cd.fixed, a, b, FY, 0.45, 'xanh'); if (Hw >= 2.8 && z.kind !== 'house') vienNgoai(s, cd.fixed, a, b, FY + Hw - 0.3, 0.3, 'xanh'); }
}
function canhCua(z, s, fixed, a, b, dh, key, doi) {
  const vao = { N: 1, S: -1, W: 1, E: -1 }[s], ngang = s === 'N' || s === 'S';
  const la = (bat, Lg) => { // bản lề tại bat, cánh mở vuông góc vào trong
    const c = fixed + vao * (Lg / 2 + 0.06);
    mesh(ngang ? bx(0.05, dh - 0.05, Lg) : bx(Lg, dh - 0.05, 0.05), vl(key), ngang ? bat : c, FY + dh / 2, ngang ? c : bat);
  };
  if (doi) { const Lg = (b - a) / 2 - 0.06; la(a + 0.05, Lg); la(b - 0.05, Lg); } else la(a + 0.05, b - a - 0.1);
}
function remNhua(s, fixed, a, b, dh) {
  const ngang = s === 'N' || s === 'S', n = Math.max(2, Math.floor((b - a) / 0.22));
  for (let i = 0; i < n; i++) { const c = a + (b - a) * (i + 0.5) / n; mesh(ngang ? bx(0.2, dh - 0.12, 0.012) : bx(0.012, dh - 0.12, 0.2), vl('rem'), ngang ? c : fixed, FY + (dh - 0.12) / 2 + 0.06, ngang ? fixed : c, { cast: false }); }
  mesh(ngang ? bx(b - a, 0.06, 0.06) : bx(0.06, 0.06, b - a), vl('inox'), ngang ? (a + b) / 2 : fixed, FY + dh - 0.03, ngang ? fixed : (a + b) / 2, { cast: false });
}
function loCua(z, s, cd, d, Hw, mIn) {
  if (z.noRoof) return;
  const a = d.at - d.w / 2, b = d.at + d.w / 2, nb = benNgoai(z, s, cd.fixed, d.at), mOut = vl(nb ? tuongTrong(nb) : tuongNgoai(z));
  const lon = d.w >= 2.4, dh = lon ? Math.min(3.0, Hw - 0.3) : Math.min(2.25, Hw - 0.15);
  if (Hw - dh > 0.05) khoi(s, cd.fixed, a, b, FY + dh, FY + Hw, mIn, mOut);
  const ngang = s === 'N' || s === 'S';
  [a, b].forEach((t) => mesh(ngang ? bx(0.06, dh, T + 0.04) : bx(T + 0.04, dh, 0.06), vl('xanh'), ngang ? t : cd.fixed, FY + dh / 2, ngang ? cd.fixed : t, { cast: false }));
  const sx = P(z).sx || (nb && P(nb).sx);
  if (sx) remNhua(s, cd.fixed, a, b, dh);
  else if (!lon) canhCua(z, s, cd.fixed, a, b, dh, z.kind === 'house' ? 'goDam' : V.KHU_CU.includes(z.id) ? 'inoxToi' : 'goSang', z.kind === 'house' && d.w > 1.6);
  if (lon && !nb) { const vao = { N: 1, S: -1, W: 1, E: -1 }[s]; mesh(ngang ? bx(b - a, 0.34, 0.34) : bx(0.34, 0.34, b - a), vl('xanh'), ngang ? (a + b) / 2 : cd.fixed + vao * 0.3, FY + dh + 0.17, ngang ? cd.fixed + vao * 0.3 : (a + b) / 2); }
}
function xayTuong(z) {
  const k = dims(z), Hw = caoTuong(z), mIn = vl(tuongTrong(z));
  sidesOf(z).forEach((s) => {
    const cd = canh(k, s), ds = (z.doors || []).filter((d) => d.side === s).sort((p, q) => p.at - q.at);
    let cur = cd.from; const end = cd.from + cd.len;
    ds.forEach((d) => { const a = d.at - d.w / 2, b = d.at + d.w / 2; if (a > cur) doanTuong(z, s, cd, cur, a, Hw, mIn); cur = Math.max(cur, b); });
    if (cur < end) doanTuong(z, s, cd, cur, end, Hw, mIn);
    ds.forEach((d) => loCua(z, s, cd, d, Hw, mIn));
  });
}
function sanPhong(z) {
  if (z.noFloor) return;
  const k = dims(z), be = vl('betong');
  mesh(hopUV(k.w, FY, k.d), [be, be, vl(P(z).san || 'betong'), be, be, be], k.cx, FY / 2, k.cz, { cast: false });
}
function tranPhong(z) {
  if (z.noRoof || z.kind !== 'hall') return;
  const k = dims(z), y = FY + caoTuong(z), tr = vl('trang');
  mesh(hopUV(k.w, 0.12, k.d), [tr, tr, vl('tonXanh'), vl('tran'), tr, tr], k.cx, y + 0.06, k.cz);
  if (k.w * k.d < 3) return;
  const nx = Math.max(1, Math.round(k.w / 2.4)), nz = Math.max(1, Math.round(k.d / 2.4));
  for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) mesh(bx(0.6, 0.03, 0.6), vl('led'), k.x0 + k.w * (i + 0.5) / nx, y - 0.015, k.z0 + k.d * (j + 0.5) / nz, { cast: false });
}

/* ---------- mái dốc ---------- */
function maiDoc(m, keyHoi) {
  const [x0, x1, z0, z1] = m.tuong, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, mat = vl(m.vl), dua = m.dua, dau = 0.3;
  if (m.truc === 'x') {
    const runW = (z1 - z0) / 2, slope = (m.noc - m.cao) / runW, eave = m.cao - dua * slope, run = runW + dua, rise = m.noc - eave;
    const Lg = Math.hypot(run, rise), ang = Math.atan2(rise, run), len = x1 - x0 + 2 * dau;
    [-1, 1].forEach((sg) => mesh(hopUV(len, 0.07, Lg), mat, cx, eave + rise / 2, cz + sg * run / 2, { rx: sg * ang }));
    [z0 - dua, z1 + dua].forEach((zz) => mesh(bx(len, 0.24, 0.06), vl('xanh'), cx, eave - 0.06, zz));
    [x0 - 0.11, x1 + 0.11].forEach((xx) => tamGiac([[xx, m.cao - 0.04, z0], [xx, m.cao - 0.04, z1], [xx, m.noc - 0.06, cz]], keyHoi || 'sonNgoai'));
  } else {
    const runW = (x1 - x0) / 2, slope = (m.noc - m.cao) / runW, eave = m.cao - dua * slope, run = runW + dua, rise = m.noc - eave;
    const Lg = Math.hypot(run, rise), ang = Math.atan2(rise, run), len = z1 - z0 + 2 * dau;
    [-1, 1].forEach((sg) => mesh(hopUV(Lg, 0.07, len), mat, cx + sg * run / 2, eave + rise / 2, cz, { rz: -sg * ang }));
    [x0 - dua, x1 + dua].forEach((xx) => mesh(bx(0.06, 0.24, len), vl('xanh'), xx, eave - 0.06, cz));
    [z0 - 0.11, z1 + 0.11].forEach((zz) => tamGiac([[x0, m.cao - 0.04, zz], [x1, m.cao - 0.04, zz], [cx, m.noc - 0.06, zz]], keyHoi || 'sonNgoai'));
  }
}

/* ---------- kiểu khu ---------- */
const KIEU = {
  thietbi() {},
  lenmen(z) { // thùng gỗ ủ hạt dưới lán, giàn phơi cách đất của HTX
    const k = dims(z), lx = k.x0 + 2.2, lz = k.z0 + 2.4;
    mesh(hopUV(k.w, 0.08, k.d), vl('betong'), k.cx, 0.04, k.cz, { cast: false });
    [[-1.6, -1.8], [1.6, -1.8], [-1.6, 1.8], [1.6, 1.8]].forEach(([a, b]) => mesh(bx(0.14, 2.4, 0.14), vl('goDam'), lx + a, 1.2, lz + b));
    mesh(hopUV(3.9, 0.08, 4.3), vl('tonXanh'), lx, 2.44, lz);
    [0, 1, 2].forEach((j) => { mesh(bx(1.0, 0.7, 1.0), vl('goDam'), lx - 0.9 + j * 0.9, 0.35 + (2 - j) * 0.5, lz); mesh(bx(0.86, 0.02, 0.86), vl('traiCacao'), lx - 0.9 + j * 0.9, 0.71 + (2 - j) * 0.5, lz, { cast: false }); });
    for (let r = 0; r < 3; r++) {
      const gz = k.z0 + 1.2 + r * 2.6, gx0 = k.x0 + 5, gx1 = k.x1 - 0.8, gw = gx1 - gx0, gcx = (gx0 + gx1) / 2;
      [gx0, gcx, gx1].forEach((px) => [-0.6, 0.6].forEach((dz) => mesh(bx(0.07, 0.8, 0.07), vl('goDam'), px, 0.4, gz + dz)));
      mesh(bx(gw, 0.05, 1.3), vl('tre'), gcx, 0.82, gz);
      mesh(bx(gw - 0.2, 0.03, 1.15), vl('cacao'), gcx, 0.86, gz, { cast: false });
    }
  },
  hall(z) { sanPhong(z); xayTuong(z); tranPhong(z); },
  house(z) {
    sanPhong(z); xayTuong(z);
    const k = dims(z), top = FY + caoTuong(z), tr = vl('tran');
    mesh(hopUV(k.w, 0.1, k.d), [tr, tr, tr, tr, tr, tr], k.cx, top + 0.05, k.cz);
    maiDoc({ tuong: z.box, cao: top + 0.08, dua: 0.6, noc: z.h - 0.4, truc: 'x', vl: 'ngoi' }, tuongNgoai(z));
  },
  block(z) {
    const k = dims(z), Hh = z.h - FY, mN = vl(tuongNgoai(z));
    mesh(hopUV(k.w + 0.6, FY, k.d + 0.6), vl('betong'), k.cx, FY / 2, k.cz, { cast: false });
    mesh(hopUV(k.w, Hh, k.d, FY), mN, k.cx, FY + Hh / 2, k.cz);
    mesh(hopUV(k.w + 0.3, 0.14, k.d + 0.3), vl('betong'), k.cx, z.h + 0.07, k.cz);
    const cua = z.cua || 'S', ra = 0.03;
    const at = { N: [k.cx, k.z0 - ra], S: [k.cx, k.z1 + ra], W: [k.x0 - ra, k.cz], E: [k.x1 + ra, k.cz] }[cua], ngang = cua === 'N' || cua === 'S';
    mesh(ngang ? bx(0.9, 2.1, 0.05) : bx(0.05, 2.1, 0.9), vl('inoxToi'), at[0], FY + 1.05, at[1]);
    mesh(ngang ? bx(0.7, 0.35, 0.04) : bx(0.04, 0.35, 0.7), vl('kinh'), at[0], FY + 2.55, at[1], { cast: false });
    ['N', 'S', 'W', 'E'].forEach((s) => { const cd = canh(k, s); vienNgoai(s, cd.fixed, cd.from, cd.from + cd.len, FY, 0.45, 'xanh'); });
  },
  door(z) {
    const k = dims(z), Hd = z.h, Lg = k.w;
    [k.x0, k.x1].forEach((x) => mesh(bx(0.3, Hd, 0.3), vl('xanh'), x, FY + Hd / 2, k.cz));
    mesh(bx(Lg + 0.3, 0.3, 0.3), vl('xanh'), k.cx, FY + Hd + 0.15, k.cz);
    const bien = mesh(new THREE.PlaneGeometry(Lg + 0.6, 0.62), vlHinh('cuaXuong', hinh('cuaXuong'), 0.3), k.cx, FY + Hd + 0.62, k.cz + 0.17);
    bien.castShadow = false;
    const la = Lg / 2 - 0.2, soc = vl('soc');
    [k.x0 + 0.2, k.x1 - 0.2].forEach((x) => mesh(hopUV(0.05, Hd - 0.15, la), soc, x, FY + (Hd - 0.15) / 2, k.cz - la / 2 - 0.1));
    mesh(hopUV(Lg, 0.03, 0.8), soc, k.cx, FY + 0.015, k.cz + 0.5, { cast: false });
  },
  dryhouse(z) {
    const k = dims(z), wh = z.wallH || 2.3, mL = vl('luoi');
    sanPhong(z);
    sidesOf(z).forEach((s) => {
      const cd = canh(k, s), ds = (z.doors || []).filter((d) => d.side === s).sort((p, q) => p.at - q.at);
      let cur = cd.from; const end = cd.from + cd.len, segs = [];
      ds.forEach((d) => { if (d.at - d.w / 2 > cur) segs.push([cur, d.at - d.w / 2]); cur = d.at + d.w / 2; });
      if (cur < end) segs.push([cur, end]);
      segs.forEach(([a, b]) => { khoi(s, cd.fixed, a, b, FY, FY + 0.5, vl('betong'), vl('betong'), 0.18); khoi(s, cd.fixed, a, b, FY + 0.5, FY + wh, mL, mL, 0.02); });
      ds.forEach((d) => remNhua(s, cd.fixed, d.at - d.w / 2, d.at + d.w / 2, 2.1));
      const n = Math.max(1, Math.round(cd.len / 2.2));
      for (let i = 0; i <= n; i++) { const t = cd.from + cd.len * i / n; mesh(bx(0.1, wh, 0.1), vl('trang'), cd.ngang ? t : cd.fixed, FY + wh / 2, cd.ngang ? cd.fixed : t); }
    });
    maiDoc({ tuong: z.box, cao: FY + wh, dua: 0.2, noc: z.h, truc: 'x', vl: 'poly' }, 'sonNgoai');
    for (let i = 0; i <= Math.round(k.w / 2.2); i++) mesh(bx(0.08, 0.08, k.d), vl('trang'), k.x0 + k.w * i / Math.round(k.w / 2.2), FY + wh + 0.05, k.cz);
  },
  woodshed(z) {
    const k = dims(z), h = z.h;
    sanPhong(z);
    [[k.x0, k.z0], [k.x1, k.z0], [k.x0, k.z1], [k.x1, k.z1], [k.cx, k.z1]].forEach(([x, zz]) => mesh(bx(0.12, h, 0.12), vl('inoxToi'), x, FY + h / 2, zz));
    mesh(hopUV(k.w + 0.4, 0.06, k.d + 0.5), vl('tonXanh'), k.cx, FY + h + 0.03, k.cz + 0.1, { rx: 0.08 });
  },
  septic(z) {
    const k = dims(z);
    mesh(hopUV(k.w, 0.25, k.d), vl('betong'), k.cx, 0.125, k.cz);
    const n = Math.max(2, Math.round(k.w / 2.6));
    for (let i = 0; i < n; i++) { const x = k.x0 + k.w * (i + 0.5) / n; mesh(cy(0.36, 0.36, 0.06, 20), vl('inoxToi'), x, 0.28, k.cz); mesh(cy(0.05, 0.05, 1.2), vl('inoxToi'), x + 0.6, 0.85, k.cz - 0.8); }
    mesh(bx(0.7, 0.6, 0.6), vl('xanh'), k.x1 - 0.5, 0.55, k.z0 + 0.45);
    mesh(cy(0.08, 0.08, 1.4), vl('inoxToi'), k.x1 - 1.4, 0.2, k.z1 + 0.4, { rx: Math.PI / 2 });
  },
  bins(z) {
    const k = dims(z);
    sanPhong(z);
    sidesOf(z).forEach((s) => { const cd = canh(k, s); khoi(s, cd.fixed, cd.from, cd.from + cd.len, FY, FY + 1.2, vl('sonNgoai'), vl('sonNgoai'), 0.15); });
    [[k.x0, k.z0], [k.x1, k.z0], [k.x0, k.z1], [k.x1, k.z1]].forEach(([x, zz]) => mesh(bx(0.08, z.h, 0.08), vl('inoxToi'), x, FY + z.h / 2, zz));
    mesh(hopUV(k.w + 0.3, 0.05, k.d + 0.3), vl('tonXanh'), k.cx, FY + z.h, k.cz);
    for (let i = 0; i < 3; i++) { const x = k.x0 + 0.55 + i * 0.95; mesh(bx(0.62, 0.95, 0.72), vl('nhuaXanh'), x, FY + 0.48, k.cz); mesh(bx(0.66, 0.06, 0.76), vl('xanh'), x, FY + 0.98, k.cz); }
  },
  passdryer(z) {
    const k = dims(z), n = Math.max(1, Math.round(k.d / 1.5)), Lg = k.d / n;
    for (let i = 0; i < n; i++) {
      const c = k.z0 + Lg * (i + 0.5);
      mesh(bx(k.w, 2.2, Lg - 0.08), vl('inox'), k.cx, FY + 1.1, c);
      [k.x0 - 0.02, k.x1 + 0.02].forEach((x) => { mesh(bx(0.03, 1.9, Lg - 0.4), vl('inoxToi'), x, FY + 1.05, c); mesh(bx(0.05, 0.5, 0.05), vl('den'), x + (x < k.cx ? -0.03 : 0.03), FY + 1.1, c + Lg / 2 - 0.35); });
      mesh(bx(0.03, 0.22, 0.32), vl('den'), k.x1 + 0.04, FY + 1.75, c - Lg / 4);
    }
    mesh(bx(k.w * 0.7, 0.5, k.d * 0.5), vl('trang'), k.cx, FY + 2.45, k.cz);
  },
  detector(z) {
    const k = dims(z), dz = k.d >= k.w, Lg = dz ? k.d : k.w;
    mesh(dz ? bx(0.6, 0.06, Lg) : bx(Lg, 0.06, 0.6), vl('den'), k.cx, FY + 0.86, k.cz);
    mesh(dz ? bx(0.66, 0.1, Lg) : bx(Lg, 0.1, 0.66), vl('inox'), k.cx, FY + 0.78, k.cz);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(bx(0.05, 0.75, 0.05), vl('inox'), k.cx + a * (dz ? 0.28 : Lg / 2 - 0.1), FY + 0.37, k.cz + b * (dz ? Lg / 2 - 0.1 : 0.28)));
    mesh(dz ? bx(1.0, 0.75, 0.55) : bx(0.55, 0.75, 1.0), vl('trang'), k.cx, FY + 1.25, k.cz);
    const p = mesh(new THREE.PlaneGeometry(0.42, 0.42), vlHinh('ccp', hinh('ccp'), 0.3), k.cx + (dz ? 0.51 : 0), FY + 1.3, k.cz + (dz ? 0 : 0.51), { ry: dz ? Math.PI / 2 : 0, cast: false });
    p.castShadow = false;
  },
  equip(z) {
    const k = dims(z);
    mesh(bx(k.w - 0.9, 2.2, k.d - 0.4), vl('trang'), k.x0 + (k.w - 0.9) / 2, FY + 1.1, k.cz);
    mesh(bx(0.04, 1.9, k.d - 1.2), vl('inoxToi'), k.x0 - 0.02, FY + 1.0, k.cz);
    mesh(bx(0.8, 1.3, 1.3), vl('inoxToi'), k.x1 - 0.45, FY + 0.65, k.cz);
    mesh(cy(0.4, 0.4, 0.06, 20), vl('den'), k.x1 - 0.45, FY + 1.33, k.cz);
  },
  cont(z) {
    const k = dims(z), czz = k.cz, len = k.w - 2.6, ct = hinh('cont'), mC = vlHinh('cont', ct, 0.12), xn = vl('xanh');
    mesh(bx(2.1, 2.3, 2.4), vl('trang'), k.x0 + 1.1, 1.75, czz);
    mesh(bx(0.05, 0.9, 2.0), vl('kinh'), k.x0 + 0.04, 2.2, czz, { cast: false });
    mesh(bx(k.w, 0.3, 2.2), vl('den'), k.cx, 0.75, czz);
    mesh(bx(len, 2.6, 2.44), [xn, xn, xn, xn, mC, mC], k.x1 - len / 2, 2.25, czz);
    [k.x0 + 1.1, k.x1 - 3.2, k.x1 - 1.8].forEach((x) => [-1, 1].forEach((s) => mesh(cy(0.48, 0.48, 0.32, 18), vl('den'), x, 0.48, czz + s * 1.0, { rx: Math.PI / 2 })));
  },
  fence(z) {
    const lines = z.lines || [];
    lines.forEach((Pp) => Pp.slice(0, -1).forEach((a, i) => {
      const b = Pp[i + 1], dx = b[0] - a[0], dz = b[1] - a[1], Lg = Math.hypot(dx, dz), ux = dx / Lg, uz = dz / Lg;
      const gaps = (z.gates || []).map((g) => { const px = g.at[0] - a[0], pz = g.at[1] - a[1], s = px * ux + pz * uz, off = Math.abs(px * uz - pz * ux); return off < 0.3 && s >= -0.01 && s <= Lg + 0.01 ? [s - g.w / 2, s + g.w / 2] : null; }).filter(Boolean).sort((p, q) => p[0] - q[0]);
      let cur = 0; const segs = [];
      gaps.forEach(([g0, g1]) => { if (g0 > cur) segs.push([cur, g0]); cur = Math.max(cur, g1); });
      if (cur < Lg) segs.push([cur, Lg]);
      const ry = -Math.atan2(dz, dx);
      segs.forEach(([s0, s1]) => {
        const n = Math.max(1, Math.round((s1 - s0) / 2.4));
        for (let j = 0; j <= n; j++) { const s = s0 + (s1 - s0) * j / n; mesh(bx(0.08, 1.9, 0.08), vl('xanh'), a[0] + ux * s, FY + 0.95, a[1] + uz * s); }
        const pl = new THREE.PlaneGeometry(s1 - s0, 1.8), uv = pl.attributes.uv; for (let q = 0; q < uv.count; q++) uv.setX(q, uv.getX(q) * (s1 - s0));
        mesh(pl, vl('hangRao'), a[0] + ux * (s0 + s1) / 2, FY + 0.95, a[1] + uz * (s0 + s1) / 2, { ry });
      });
      gaps.forEach(([g0, g1]) => [g0, g1].forEach((s) => { mesh(bx(0.42, 2.3, 0.42), vl('sonNgoai'), a[0] + ux * s, FY + 1.15, a[1] + uz * s); mesh(bx(0.5, 0.1, 0.5), vl('vang'), a[0] + ux * s, FY + 2.35, a[1] + uz * s); }));
    }));
    (z.cams || []).forEach(([x, zz]) => { mesh(cy(0.06, 0.06, 3), vl('inoxToi'), x, FY + 1.5, zz); mesh(bx(0.34, 0.18, 0.18), vl('trang'), x, FY + 3.05, zz + 0.08); });
  }
};

/* ---------- đồ đạc ---------- */
function tui3D(x, y, z, key, ry) { const m = vlHinh('tui:' + key, hinhTui(key), 0.15), b = vl('kem'); return mesh(bx(0.16, 0.24, 0.05), [b, b, b, b, m, m], x, y + 0.12, z, { ry: ry || 0 }); }
function hopQua(x, y, z, ry) { const m = vlHinh('hopqua', hinh('hopqua'), 0.12), xn = vl('xanh'); return mesh(bx(0.42, 0.12, 0.3), [xn, xn, m, xn, xn, xn], x, y + 0.06, z, { ry: ry || 0 }); }
function thungCarton(x, y, z, w, h, d) { const m = vlHinh('thung', hinh('thung'), 0.08), kr = vl('kraft'); return mesh(bx(w, h, d), [m, m, kr, kr, m, m], x, y + h / 2, z); }
function chauCay(x, z, s) {
  mesh(cy(0.2 * s, 0.15 * s, 0.4 * s, 16), vl('xanh'), x, FY + 0.2 * s, z);
  const R = rng(Math.round(x * 13 + z * 7));
  for (let i = 0; i < 5; i++) mesh(new THREE.IcosahedronGeometry(0.22 * s, 0), vl(i % 2 ? 'canhCay' : 'canhCay2'), x + (R() - 0.5) * 0.25 * s, FY + (0.55 + R() * 0.55) * s, z + (R() - 0.5) * 0.25 * s);
}
const SAN_PHAM = ['nibs', 'socola', 'bot'];
function doTrenBan(z, x, zz, w, d, y) {
  const l = P(z).loai, R = rng(Math.round(x * 31 + zz * 17));
  if (z.id === 'socola') { // khuôn socola, thanh socola đã tách khuôn, hộp
    const n = Math.max(1, Math.floor(w / 0.42));
    for (let i = 0; i < n; i++) { const px = x - w / 2 + w * (i + 0.5) / n; mesh(bx(0.34, 0.03, 0.22), vl('trang'), px, y + 0.015, zz - d * 0.15); for (let k = 0; k < 3; k++) mesh(bx(0.08, 0.02, 0.17), vl('socola'), px - 0.1 + k * 0.1, y + 0.04, zz - d * 0.15, { cast: false }); }
    for (let i = 0; i < 3; i++) tui3D(x - w / 2 + 0.3 + i * 0.3, y, zz + d * 0.25, SAN_PHAM[i % 3], R() * 0.4 - 0.2);
    return;
  }
  if (z.id === 'nibs' || z.id === 'kho') { // khay nibs, mẫu hạt cut test
    const n = Math.max(1, Math.round(w / 0.6));
    for (let i = 0; i < n; i++) { const px = x - w / 2 + w * (i + 0.5) / n; mesh(bx(0.48, 0.05, Math.min(0.36, d - 0.15)), vl('inoxToi'), px, y + 0.025, zz); for (let k = 0; k < 10; k++) mesh(new THREE.IcosahedronGeometry(0.035, 0), vl(['cacao', 'nau', 'socola'][(k + i) % 3]), px + (R() - 0.5) * 0.38, y + 0.07, zz + (R() - 0.5) * 0.24); }
    if (z.id === 'nibs') for (let i = 0; i < 3; i++) tui3D(x + w / 2 - 0.25 - i * 0.22, y, zz + 0.1, 'nibs', 0.2);
    return;
  }
  if (l === 'ban') { // khay nguyên liệu
    const n = Math.max(1, Math.round(w / 0.7));
    for (let i = 0; i < n; i++) { const px = x - w / 2 + w * (i + 0.5) / n; mesh(bx(Math.min(0.55, w / n - 0.1), 0.05, Math.min(0.4, d - 0.15)), vl('inoxToi'), px, y + 0.025, zz); for (let k = 0; k < 6; k++) mesh(new THREE.IcosahedronGeometry(0.06, 0), vl(['traiCay', 'tim', 'xanhLa'][i % 3]), px + (R() - 0.5) * 0.35, y + 0.08, zz + (R() - 0.5) * 0.22); }
  } else if (l === 'sach' || l === 'sao') {
    const n = Math.max(1, Math.round(Math.max(w, d) / 0.7)), doc = d > w;
    for (let i = 0; i < n; i++) { const t = (i + 0.5) / n - 0.5, px = x + (doc ? 0 : t * w), pz = zz + (doc ? t * d : 0); mesh(bx(0.5, 0.05, 0.36), vl('inoxToi'), px, y + 0.025, pz); mesh(bx(0.42, 0.03, 0.3), vl(i % 2 || l === 'sao' ? 'tra' : 'traiCay'), px, y + 0.06, pz); }
    if (l === 'sach') for (let i = 0; i < 4; i++) tui3D(x + (R() - 0.5) * (w - 0.3), y, zz + (R() - 0.5) * (d - 0.2), SAN_PHAM[i % 3], R() * 0.6 - 0.3);
  } else if (l === 'dg') {
    for (let i = 0; i < 6; i++) tui3D(x - w / 2 + 0.2 + i * (w - 0.4) / 5, y, zz - d * 0.2, SAN_PHAM[i % 3], R() * 0.4 - 0.2);
    hopQua(x + w * 0.25, y, zz + d * 0.15, 0.2); hopQua(x - w * 0.15, y, zz + d * 0.2, -0.1);
  } else if (l === 'qc') {
    for (let i = 0; i < 8; i++) mesh(cy(0.04, 0.04, 0.14, 10), vl(['traiCay', 'xanhLa', 'tim'][i % 3]), x - w / 2 + 0.3 + i * 0.25, y + 0.07, zz - 0.15);
    mesh(bx(0.3, 0.12, 0.25), vl('trang'), x + w * 0.3, y + 0.06, zz + 0.1); mesh(bx(0.36, 0.02, 0.26), vl('den'), x - w * 0.25, y + 0.01, zz + 0.12);
  } else if (l === 'vanphong') {
    mesh(bx(0.34, 0.02, 0.24), vl('den'), x - 0.4, y + 0.01, zz); mesh(bx(0.34, 0.22, 0.02), vl('den'), x - 0.4, y + 0.12, zz - 0.12, { rx: -0.2 });
    hopQua(x + 0.5, y, zz, 0.3); tui3D(x + 0.1, y, zz + 0.2, 'socola', 0.4);
  }
}
const DO = {
  ban(z, x, zz, w, d) {
    const l = P(z).loai;
    if (l === 'vanphong' || l === 'an' || l === 'nha') {
      mesh(bx(w, 0.05, d), vl('goSang'), x, FY + 0.74, zz);
      [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(bx(0.06, 0.72, 0.06), vl('goDam'), x + a * (w / 2 - 0.08), FY + 0.36, zz + b * (d / 2 - 0.08)));
      if (l === 'vanphong') {
        const ghe = (gx, gz, ry) => { mesh(bx(0.46, 0.06, 0.46), vl('xanh'), gx, FY + 0.46, gz); mesh(bx(0.46, 0.5, 0.06), vl('xanh'), gx - Math.sin(ry) * 0.22, FY + 0.74, gz - Math.cos(ry) * 0.22, { ry }); mesh(cy(0.03, 0.03, 0.44), vl('den'), gx, FY + 0.22, gz); };
        const dai = w >= d, n = Math.max(1, Math.floor((dai ? w : d) / 0.75));
        for (let i = 0; i < n; i++) { const t = (i + 0.5) / n - 0.5; if (dai) { ghe(x + t * w, zz - d / 2 - 0.35, 0); ghe(x + t * w, zz + d / 2 + 0.35, Math.PI); } else { ghe(x - w / 2 - 0.35, zz + t * d, Math.PI / 2); ghe(x + w / 2 + 0.35, zz + t * d, -Math.PI / 2); } }
        doTrenBan(z, x, zz, w, d, FY + 0.77);
      }
      return;
    }
    mesh(bx(w, 0.04, d), vl('inox'), x, FY + 0.88, zz);
    mesh(bx(w - 0.1, 0.03, d - 0.1), vl('inoxToi'), x, FY + 0.25, zz, { cast: false });
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(bx(0.04, 0.86, 0.04), vl('inox'), x + a * (w / 2 - 0.05), FY + 0.43, zz + b * (d / 2 - 0.05)));
    doTrenBan(z, x, zz, w, d, FY + 0.9);
  },
  ghe(z, x, zz, w, d) {
    const l = P(z).loai;
    if (l === 'nghi' || l === 'nha') { mesh(bx(w, 0.4, d), vl('xanh'), x, FY + 0.2, zz); mesh(bx(w - 0.1, 0.1, d - 0.1), vl('xanhNhat'), x, FY + 0.45, zz); mesh(bx(Math.min(w, d) * 0.6, 0.14, 0.3), vl('vang'), x, FY + 0.56, zz - d / 2 + 0.3); return; }
    mesh(bx(w, 0.05, d), vl('goSang'), x, FY + 0.44, zz);
    [[-1, -1], [1, -1], [-1, 1], [1, 1]].forEach(([a, b]) => mesh(bx(0.05, 0.42, 0.05), vl('goDam'), x + a * (w / 2 - 0.06), FY + 0.21, zz + b * (d / 2 - 0.06)));
  },
  may(z, x, zz, w, h, d) {
    const id = z.id;
    if (id === 'thay') { mesh(bx(w, h, d), vl('xanhNhat'), x, FY + h / 2, zz); const n = Math.max(2, Math.round(w / 0.4)); for (let i = 1; i < n; i++) mesh(bx(0.015, h - 0.05, 0.01), vl('den'), x - w / 2 + w * i / n, FY + h / 2, zz + d / 2 + 0.005, { cast: false }); return; }
    if (id === 'vp' || id === 'nha') { mesh(bx(w, h, d), vl('goSang'), x, FY + h / 2, zz); return; }
    if (id === 'travo') { mesh(bx(w, h, d), vl('trang'), x, FY + h / 2, zz); mesh(bx(w * 0.8, h * 0.75, 0.03), vl('kinh'), x, FY + h * 0.5, zz + d / 2 + 0.02, { cast: false }); for (let i = 0; i < 5; i++) mesh(bx(w * 0.75, 0.02, d * 0.8), vl('bao'), x, FY + 0.3 + i * 0.3, zz, { cast: false }); return; }
    if (id === 'tn') { mesh(bx(w, 0.08, d), vl('inoxToi'), x, FY + 0.04, zz); mesh(bx(0.05, 1.0, 0.05), vl('inox'), x + w / 2 - 0.05, FY + 0.5, zz); mesh(bx(0.3, 0.2, 0.08), vl('den'), x + w / 2 - 0.05, FY + 1.05, zz); return; }
    if (id === 'dem') { mesh(bx(w, h, d), vl('xanh'), x, FY + h / 2, zz); mesh(bx(w - 0.1, 0.02, d - 0.1), vl('kinh'), x, FY + h + 0.005, zz, { cast: false }); return; }
    if (id === 'sc') { mesh(bx(w, h, d), vl('inox'), x, FY + h / 2, zz); [-1, 1].forEach((s) => { mesh(bx(w - 0.15, 0.02, d / 2 - 0.12), vl('nuoc'), x, FY + h - 0.06, zz + s * d / 4, { cast: false }); mesh(cy(0.02, 0.02, 0.35), vl('inox'), x - w / 2 + 0.08, FY + h + 0.17, zz + s * d / 4); }); return; }
    if (id === 'sach' && h > 1.5) { mesh(bx(w, h, d), vl('inox'), x, FY + h / 2, zz); mesh(new THREE.PlaneGeometry(d - 0.1, h - 0.1), vlHinh('tuTui', hinh('tuTui'), 0.15), x + w / 2 + 0.01, FY + h / 2, zz, { ry: Math.PI / 2, cast: false }); return; }
    if (id === 'qc') { mesh(bx(w, h, d), vl('trang'), x, FY + h / 2, zz); mesh(new THREE.PlaneGeometry(d - 0.1, h - 0.1), vlHinh('tuMau', hinh('tuMau'), 0.15), x - w / 2 - 0.01, FY + h / 2, zz, { ry: -Math.PI / 2, cast: false }); return; }
    if (id === 'sach' || id === 'dg') { mesh(bx(w, h * 0.75, d), vl('trang'), x, FY + h * 0.375, zz); mesh(bx(w + 0.2, 0.06, d * 0.5), vl('inox'), x, FY + h * 0.78, zz); mesh(bx(0.22, 0.16, 0.04), vl('den'), x, FY + h * 0.6, zz + d / 2 + 0.02); return; }
    mesh(bx(w, h, d), vl('inox'), x, FY + h / 2, zz);
  },
  bon(z, x, zz, r, h, y0) {
    const y = FY + (y0 || 0);
    if (y0) { mesh(cy(r, r, h, 20), vl('inox'), x, y + h / 2, zz); mesh(cy(r * 1.02, r * 1.02, 0.06, 20), vl('inoxToi'), x, y + h, zz); return; }
    if (r <= 0.3) { mesh(bx(0.12, 0.8, 0.12), vl('inox'), x, y + 0.4, zz); mesh(bx(0.5, 0.16, 0.4), vl('inox'), x, y + 0.86, zz); mesh(bx(0.4, 0.02, 0.3), vl('nuoc'), x, y + 0.93, zz, { cast: false }); mesh(cy(0.015, 0.015, 0.28), vl('inox'), x, y + 1.05, zz - 0.16); return; }
    mesh(cy(r, r * 0.92, h, 22), vl('inox'), x, y + h / 2, zz); mesh(cy(r * 0.94, r * 0.94, 0.02, 22), vl('nuoc'), x, y + h - 0.05, zz, { cast: false });
  },
  ke(z, x0, x1, z0, z1, tang) {
    const dx = x1 - x0 >= z1 - z0, Lg = dx ? x1 - x0 : z1 - z0, D = dx ? z1 - z0 : x1 - x0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, H0 = 0.35 + tang * 0.95;
    const B = (len, h, dep) => (dx ? bx(len, h, dep) : bx(dep, h, len)), at = (t, u) => (dx ? [cx + t, cz + u] : [cx + u, cz + t]);
    const n = Math.max(1, Math.round(Lg / 1.8));
    for (let i = 0; i <= n; i++) [-D / 2, D / 2].forEach((u) => { const [px, pz] = at(-Lg / 2 + Lg * i / n, u); mesh(bx(0.07, H0, 0.07), vl('xanh'), px, FY + H0 / 2, pz); });
    for (let l = 0; l < tang; l++) { const y = FY + 0.25 + l * 0.95; mesh(B(Lg, 0.04, D), vl('xamNhat'), cx, y, cz); [-D / 2, D / 2].forEach((u) => { const [px, pz] = at(0, u); mesh(B(Lg, 0.08, 0.05), vl('vang'), px, y + 0.02, pz); }); }
    const loai = P(z).loai, R = rng(Math.round(x0 * 7 + z0 * 3));
    for (let l = 0; l < tang; l++) {
      const y = FY + 0.27 + l * 0.95, m = Math.floor(Lg / 0.62);
      for (let i = 0; i < m; i++) {
        if (R() < 0.12) continue;
        const [px, pz] = at(-Lg / 2 + 0.31 + i * 0.62, 0);
        if (z.id === 'trungbay') tui3D(px, y, pz, SAN_PHAM[(i + l) % 3], 0);
        else if (loai === 'kho' && z.id === 'tp') thungCarton(px, y, pz, dx ? 0.52 : D * 0.85, 0.42 + (R() < 0.5 ? 0.1 : 0), dx ? D * 0.85 : 0.52);
        else if (z.id === 'kbb') { if (i % 3 === 0) mesh(cy(0.13, 0.13, D * 0.8, 16), vl('trang'), px, y + 0.14, pz, dx ? { rx: Math.PI / 2 } : { rz: Math.PI / 2 }); else mesh(dx ? bx(0.5, 0.18 + R() * 0.2, D * 0.85) : bx(D * 0.85, 0.18 + R() * 0.2, 0.5), vl('kraft'), px, y + 0.15, pz); }
        else if (z.id === 'dc') mesh(dx ? bx(0.4, 0.22, D * 0.8) : bx(D * 0.8, 0.22, 0.4), vl(i % 2 ? 'xanhNhat' : 'inoxToi'), px, y + 0.11, pz);
        else mesh(dx ? bx(0.5, 0.32, D * 0.8) : bx(D * 0.8, 0.32, 0.5), vl(['kraft', 'xamNhat', 'xanhNhat'][(i + l) % 3]), px, y + 0.16, pz);
      }
    }
  },
  thung(z, x, zz, nx, nz) {
    const R = rng(Math.round(x * 11 + zz * 5));
    for (let i = 0; i < nx; i++) for (let j = 0; j < nz; j++) {
      const px = x + i * 0.75, pz = zz + j * 0.6;
      if (z.id === 'kho') { mesh(bx(0.6, 0.42, 0.42), vl('nhuaXanh'), px, FY + 0.21, pz); mesh(bx(0.52, 0.02, 0.34), vl('cacao'), px, FY + 0.41, pz, { cast: false }); continue; }
      if (P(z).loai === 'ban') { const cao = R() < 0.5 ? 2 : 1; for (let k = 0; k < cao; k++) { mesh(bx(0.6, 0.3, 0.42), vl('nhuaXanh'), px, FY + 0.15 + k * 0.31, pz); } for (let k = 0; k < 5; k++) mesh(new THREE.IcosahedronGeometry(0.09, 0), vl(['xanhLa', 'tim', 'traiCay'][(i + j) % 3]), px + (R() - 0.5) * 0.4, FY + cao * 0.31 + 0.02, pz + (R() - 0.5) * 0.26); }
      else thungCarton(px, FY, pz, 0.56, 0.4 + ((i + j) % 2) * 0.2, 0.42);
    }
  },
  pallet(z, x, zz) {
    mesh(bx(1.2, 0.14, 1.0), vl('goSang'), x, FY + 0.07, zz);
    for (let a = 0; a < 2; a++) for (let b = 0; b < 2; b++) for (let c = 0; c < 3; c++) thungCarton(x - 0.29 + a * 0.58, FY + 0.14 + c * 0.42, zz - 0.24 + b * 0.48, 0.56, 0.41, 0.46);
  },
  bep(z, x, zz, dz) {
    mesh(hopUV(1.5, 0.85, 1.0), vl('gach'), x, FY + 0.425, zz);
    mesh(bx(1.6, 0.06, 1.1), vl('betong'), x, FY + 0.88, zz);
    mesh(cy(0.45, 0.32, 0.18, 22), vl('den'), x, FY + 0.98, zz);
    mesh(cy(0.36, 0.36, 0.05, 20), vl('tra'), x, FY + 1.05, zz, { cast: false });
    const chx = dz ? x : x + 0.5, chz = dz ? zz + dz : zz + 0.3, chH = z.h + 2.4;
    if (dz) { mesh(hopUV(0.6, 0.6, Math.abs(dz)), vl('gach'), x, FY + 0.3, zz + dz / 2); mesh(bx(0.4, 0.3, 0.05), vl('den'), x, FY + 0.3, zz + dz + 0.3); }
    mesh(cy(0.15, 0.15, chH, 14), vl('inoxToi'), chx, FY + chH / 2, chz); mesh(cy(0.22, 0.22, 0.12, 14), vl('den'), chx, FY + chH, chz);
  },
  cui(z, x0, x1, z0, z1) {
    const geo = cy(0.075, 0.075, z1 - z0, 8), n = Math.floor((x1 - x0) / 0.16), m = new THREE.InstancedMesh(geo, vl('than'), n * 4), d = new THREE.Object3D(); let i = 0;
    for (let l = 0; l < 4; l++) for (let c = 0; c < n; c++) { d.position.set(x0 + 0.08 + c * 0.16 + (l % 2) * 0.08, FY + 0.08 + l * 0.14, (z0 + z1) / 2); d.rotation.set(Math.PI / 2, 0, 0); d.updateMatrix(); m.setMatrixAt(i++, d.matrix); }
    m.castShadow = m.receiveShadow = true; root.add(m);
  },
  gian(z, x0, x1, z0, z1) {
    const w = x1 - x0, d = z1 - z0, cx = (x0 + x1) / 2, cz = (z0 + z1) / 2, n = Math.max(1, Math.round(w / 2.2));
    for (let i = 0; i <= n; i++) [z0, z1].forEach((pz) => mesh(bx(0.05, 1.6, 0.05), vl('inox'), x0 + w * i / n, FY + 0.8, pz));
    [0.55, 0.95, 1.35].forEach((y, l) => { for (let i = 0; i < n; i++) { const px = x0 + w * (i + 0.5) / n; mesh(bx(w / n - 0.1, 0.03, d - 0.08), vl('tre'), px, FY + y, cz, { cast: false }); mesh(bx(w / n - 0.25, 0.025, d - 0.22), vl((i + l) % 3 === 2 ? 'traiCay' : 'tra'), px, FY + y + 0.025, cz, { cast: false }); } });
    mesh(bx(w, 0.04, 0.04), vl('inox'), cx, FY + 1.6, z0); mesh(bx(w, 0.04, 0.04), vl('inox'), cx, FY + 1.6, z1);
  },
  long(z, x0, x1, z0, z1) {
    const w = x1 - x0, d = z1 - z0, mL = vl('luoi');
    [[x0 + w / 2, z0, w, 0], [x0 + w / 2, z1, w, 0], [x0, z0 + d / 2, d, 1], [x1, z0 + d / 2, d, 1]].forEach(([x, zz, Lg, q]) => mesh(q ? bx(0.02, 1.8, Lg) : bx(Lg, 1.8, 0.02), mL, x, FY + 0.9, zz, { cast: false }));
    [[x0, z0], [x1, z0], [x0, z1], [x1, z1]].forEach(([x, zz]) => mesh(bx(0.05, 1.85, 0.05), vl('inoxToi'), x, FY + 0.92, zz));
    const t = hinhBien('LÔ CHỜ KẾT QUẢ', 'Không xuất khi chưa đạt', 'vang');
    mesh(new THREE.PlaneGeometry(1.0, 0.3), vlHinh('bienLo', t, 0.3), x0 + w / 2, FY + 1.5, z1 + 0.03, { cast: false });
  },
  vach(z, x0, x1, z0, z1) {
    const dx = Math.abs(x1 - x0) >= Math.abs(z1 - z0), Lg = dx ? x1 - x0 : z1 - z0;
    for (let t = 0; t <= Lg; t += 1.2) mesh(dx ? bx(0.6, 0.02, 0.1) : bx(0.1, 0.02, 0.6), vl('vang'), dx ? x0 + t : x0, FY + 0.01, dx ? z0 : z0 + t, { cast: false });
  }
};

/* ---------- thiết bị dây chuyền ca cao ---------- */
Object.assign(DO, {
  bao(z, x, zz, n) { // pallet bao đay hạt ca cao
    mesh(bx(1.2, 0.14, 1.0), vl('goSang'), x, FY + 0.07, zz);
    const R = rng(Math.round(x * 19 + zz * 3));
    for (let l = 0; l < (n || 4); l++) for (let i = 0; i < 2; i++) {
      const m = mesh(bx(0.55, 0.23, 0.92), vl('bao'), x - 0.29 + i * 0.58 + (R() - 0.5) * 0.04, FY + 0.26 + l * 0.24, zz + (R() - 0.5) * 0.04, { ry: (R() - 0.5) * 0.08 });
      m.scale.set(1, 1, 1);
    }
  },
  can(z, x, zz) {
    mesh(bx(1.0, 0.08, 1.0), vl('inoxToi'), x, FY + 0.04, zz);
    mesh(bx(0.05, 1.05, 0.05), vl('inox'), x + 0.45, FY + 0.52, zz - 0.45);
    mesh(bx(0.34, 0.24, 0.08), vl('den'), x + 0.45, FY + 1.1, zz - 0.45);
    mesh(bx(0.55, 0.23, 0.9), vl('bao'), x, FY + 0.2, zz);
  },
  rang(z, x, zz) { // máy rang trống nằm ngang, phễu nạp, sàng làm nguội, ống khói qua mái
    mesh(bx(1.7, 0.75, 0.9), vl('xanh'), x, FY + 0.375, zz);
    mesh(cy(0.45, 0.45, 1.45, 24), vl('inox'), x, FY + 1.2, zz, { rz: Math.PI / 2 });
    mesh(cy(0.47, 0.47, 0.06, 24), vl('den'), x + 0.75, FY + 1.2, zz, { rz: Math.PI / 2 });
    mesh(cy(0.06, 0.06, 0.08, 10), vl('vang'), x + 0.8, FY + 1.35, zz + 0.15, { rz: Math.PI / 2 });
    mesh(cy(0.34, 0.08, 0.5, 16), vl('inox'), x - 0.35, FY + 1.85, zz);
    mesh(bx(0.28, 0.4, 0.08), vl('den'), x + 0.6, FY + 0.95, zz - 0.47);
    // sàng làm nguội phía nam
    mesh(cy(0.06, 0.06, 0.6, 8), vl('inoxToi'), x + 0.2, FY + 0.3, zz + 1.15);
    mesh(cy(0.58, 0.58, 0.18, 26), vl('inox'), x + 0.2, FY + 0.69, zz + 1.15);
    mesh(cy(0.54, 0.54, 0.02, 26), vl('cacao'), x + 0.2, FY + 0.77, zz + 1.15, { cast: false });
    // ống khói
    const top = z.h + 1.6;
    mesh(cy(0.13, 0.13, top - 1.6, 12), vl('inoxToi'), x - 0.55, 1.6 + (top - 1.6) / 2, zz - 0.2);
    mesh(cy(0.22, 0.22, 0.14, 12), vl('den'), x - 0.55, top, zz - 0.2);
  },
  tachvo(z, x, zz) { // máy nghiền vỡ, quạt tách vỏ, cyclone, bao hứng vỏ
    mesh(bx(1.0, 1.35, 0.7), vl('xanh'), x, FY + 0.675, zz);
    mesh(cy(0.36, 0.1, 0.45, 14), vl('inox'), x - 0.2, FY + 1.58, zz);
    mesh(bx(0.5, 0.06, 0.4), vl('inox'), x - 0.1, FY + 0.6, zz + 0.38);
    mesh(cy(0.26, 0.26, 0.8, 18), vl('inox'), x + 0.78, FY + 1.6, zz);
    mesh(cy(0.26, 0.05, 0.55, 18), vl('inox'), x + 0.78, FY + 0.93, zz);
    mesh(cy(0.07, 0.07, 0.55, 10), vl('inoxToi'), x + 0.45, FY + 1.75, zz, { rz: Math.PI / 2 });
    mesh(bx(0.42, 0.55, 0.36), vl('bao'), x + 0.78, FY + 0.28, zz);
  },
  melanger(z, x, zz) { // máy nghiền đá: chân đế, nồi inox có con lăn đá, khối socola
    mesh(bx(0.6, 0.55, 0.6), vl('trang'), x, FY + 0.275, zz);
    mesh(cy(0.3, 0.3, 0.36, 24), vl('inox'), x, FY + 0.73, zz);
    mesh(cy(0.27, 0.27, 0.02, 24), vl('socola'), x, FY + 0.88, zz, { cast: false });
    [-1, 1].forEach((s) => mesh(cy(0.09, 0.09, 0.14, 16), vl('xamNhat'), x + s * 0.12, FY + 0.9, zz, { rx: Math.PI / 2 }));
    mesh(cy(0.03, 0.03, 0.3, 8), vl('inoxToi'), x, FY + 1.05, zz);
  },
  ep(z, x, zz) { // máy ép thủy lực: khung 4 trụ, xi lanh, nồi ép, khay hứng bơ
    mesh(bx(1.0, 0.3, 0.9), vl('xanh'), x, FY + 0.15, zz);
    [[-0.4, -0.35], [0.4, -0.35], [-0.4, 0.35], [0.4, 0.35]].forEach(([a, b]) => mesh(cy(0.05, 0.05, 1.7, 10), vl('inox'), x + a, FY + 1.0, zz + b));
    mesh(bx(1.0, 0.18, 0.9), vl('xanh'), x, FY + 1.85, zz);
    mesh(cy(0.24, 0.24, 0.5, 20), vl('inox'), x, FY + 0.58, zz);
    mesh(cy(0.12, 0.12, 0.6, 14), vl('inoxToi'), x, FY + 1.45, zz);
    mesh(bx(0.4, 0.08, 0.3), vl('vang'), x + 0.25, FY + 0.34, zz + 0.32);
  },
  nghienbot(z, x, zz) { // máy nghiền bột và rây rung
    mesh(cy(0.28, 0.28, 0.9, 18), vl('inox'), x - 0.2, FY + 0.45, zz);
    mesh(cy(0.25, 0.08, 0.4, 16), vl('inox'), x - 0.2, FY + 1.1, zz);
    mesh(bx(0.5, 0.42, 0.5), vl('xanh'), x + 0.3, FY + 0.21, zz);
    mesh(cy(0.3, 0.3, 0.2, 22), vl('inox'), x + 0.3, FY + 0.55, zz);
    mesh(cy(0.27, 0.27, 0.02, 22), vl('nau'), x + 0.3, FY + 0.66, zz, { cast: false });
  },
  temper(z, x, zz) { // máy tôi socola
    mesh(bx(0.7, 1.0, 0.7), vl('inox'), x, FY + 0.5, zz);
    mesh(cy(0.25, 0.22, 0.22, 22), vl('inoxToi'), x, FY + 1.1, zz);
    mesh(cy(0.23, 0.23, 0.02, 22), vl('socola'), x, FY + 1.2, zz, { cast: false });
    mesh(bx(0.36, 0.18, 0.04), vl('den'), x, FY + 0.78, zz + 0.37);
    mesh(cy(0.04, 0.04, 0.12, 8), vl('inox'), x, FY + 0.95, zz + 0.32, { rx: 0.6 });
  },
  tumat(z, x, zz, w, d) { // tủ mát làm cứng socola, cửa kính
    mesh(bx(w, 1.9, d), vl('trang'), x, FY + 0.95, zz);
    mesh(bx(w * 0.86, 1.55, 0.03), vl('kinh'), x, FY + 1.0, zz + d / 2 + 0.02, { cast: false });
    for (let i = 0; i < 5; i++) { mesh(bx(w * 0.8, 0.02, d * 0.8), vl('inoxToi'), x, FY + 0.35 + i * 0.3, zz, { cast: false }); mesh(bx(w * 0.6, 0.03, d * 0.5), vl('socola'), x, FY + 0.37 + i * 0.3, zz, { cast: false }); }
  },
  dieuhoa(z, x, zz, side) { // máy lạnh treo tường
    const ns = side === 'N' || side === 'S', off = side === 'N' ? 0.12 : side === 'S' ? -0.12 : side === 'W' ? 0.12 : -0.12;
    mesh(ns ? bx(0.95, 0.3, 0.22) : bx(0.22, 0.3, 0.95), vl('trang'), x + (ns ? 0 : off), FY + 2.3, zz + (ns ? off : 0));
    mesh(ns ? bx(0.8, 0.03, 0.02) : bx(0.02, 0.03, 0.8), vl('inoxToi'), x + (ns ? 0 : off * 2), FY + 2.2, zz + (ns ? off * 2 : 0), { cast: false });
  },
  panning(z, x, zz) { // nồi bao bọc socola
    mesh(bx(0.6, 0.7, 0.6), vl('inox'), x, FY + 0.35, zz);
    mesh(cy(0.36, 0.2, 0.5, 22), vl('inox'), x, FY + 1.0, zz + 0.06, { rx: 0.7 });
    mesh(cy(0.3, 0.3, 0.02, 20), vl('socola'), x, FY + 1.13, zz + 0.2, { rx: 0.7, cast: false });
  }
});

/* ---------- trang trí ---------- */
function treoTuong(z, mat, mang, t, y, w, h) {
  const k = dims(z), e = T / 2 + 0.012;
  const v = { N: [k.x0 + t, k.z0 + e, 0], S: [k.x0 + t, k.z1 - e, Math.PI], W: [k.x0 + e, k.z0 + t, Math.PI / 2], E: [k.x1 - e, k.z0 + t, -Math.PI / 2] }[mang];
  const m = mesh(new THREE.PlaneGeometry(w, h), mat, v[0], FY + y, v[1], { ry: v[2], cast: false });
  m.castShadow = false;
  const n = { N: [0, 1], S: [0, -1], W: [1, 0], E: [-1, 0] }[mang];
  mesh(mang === 'N' || mang === 'S' ? bx(w + 0.06, h + 0.06, 0.02) : bx(0.02, h + 0.06, w + 0.06), vl('xanh'), v[0] - n[0] * 0.012, FY + y, v[1] - n[1] * 0.012, { cast: false });
}
function trangTri(z) {
  (V.TRANG_TRI[z.id] || []).forEach((it) => {
    const k = dims(z);
    if (it[0] === 'bien') { const [, mang, t, y, w, h, text, sub, kieu] = it; treoTuong(z, vlHinh('bien' + text + sub, hinhBien(text, sub, kieu), 0.3), mang, t, y, w, h); }
    else if (it[0] === 'tranh') { const [, mang, t, y, w, h, key] = it; treoTuong(z, vlHinh(key, hinh(key), 0.25), mang, t, y, w, h); }
    else if (it[0] === 'cay') chauCay(k.x0 + it[1], k.z0 + it[2], it[3] || 1);
    else if (it[0] === 'ketui') {
      const [, dx, dz, w, d, h] = it, x = k.x0 + dx + w / 2, zz = k.z0 + dz + d / 2, tang = 4;
      [-1, 1].forEach((s) => mesh(bx(0.04, h, d), vl('goSang'), x + s * (w / 2 - 0.02), FY + h / 2, zz));
      mesh(bx(w, h, 0.02), vl('xanh'), x, FY + h / 2, zz + d / 2 - 0.01);
      for (let l = 0; l < tang; l++) {
        const y = FY + 0.12 + l * (h - 0.2) / (tang - 1);
        mesh(bx(w, 0.03, d), vl('goSang'), x, y, zz);
        if (l === tang - 1) continue;
        for (let i = 0; i < 6; i++) { if (l === 1 && i % 2) hopQua(x - w / 2 + 0.25 + i * (w - 0.5) / 5, y + 0.015, zz, 0); else tui3D(x - w / 2 + 0.2 + i * (w - 0.4) / 5, y + 0.015, zz - 0.03, SAN_PHAM[(i + l) % 3], 0); }
      }
    }
  });
}
function bienNgoai(b) {
  const t = hinh(b.tex), m = vlHinh(b.tex, t, 0.18), ry = QUAY[b.quay];
  const p = mesh(new THREE.PlaneGeometry(b.w, b.h), m, b.p[0], b.p[1], b.p[2], { ry, cast: false });
  if (b.khung) { const n = { N: [0, 1], S: [0, -1], E: [-1, 0], W: [1, 0] }[b.quay]; mesh(b.quay === 'N' || b.quay === 'S' ? bx(b.w + 0.1, b.h + 0.1, 0.12) : bx(0.12, b.h + 0.1, b.w + 0.1), vl('xanh'), b.p[0] + n[0] * 0.07, b.p[1], b.p[2] + n[1] * 0.07); }
  return p;
}

/* ---------- cảnh quan ---------- */
function canhQuan(scene) {
  const troi = new THREE.Mesh(new THREE.SphereGeometry(1100, 48, 24), new THREE.MeshBasicMaterial({ map: hinh('troi'), side: THREE.BackSide, fog: false, depthWrite: false }));
  troi.renderOrder = -1; scene.add(troi);
  const dat = new THREE.Mesh(new THREE.PlaneGeometry(3000, 3000), L({ map: beMat('co') }));
  dat.geometry.attributes.uv.array.forEach((v, i, a) => { a[i] = v * 3000; }); dat.rotation.x = -Math.PI / 2; dat.receiveShadow = true; scene.add(dat);
  V.DUONG.forEach(([x0, x1, z0, z1]) => {
    mesh(hopUV(x1 - x0, 0.06, z1 - z0), vl('nhua'), (x0 + x1) / 2, 0.03, (z0 + z1) / 2, { cast: false });
    const dx = x1 - x0 >= z1 - z0, Lg = dx ? x1 - x0 : z1 - z0;
    for (let t = 1; t < Lg - 1; t += 4.5) mesh(dx ? bx(2.2, 0.01, 0.12) : bx(0.12, 0.01, 2.2), vl('trang'), dx ? x0 + t : (x0 + x1) / 2, 0.065, dx ? (z0 + z1) / 2 : z0 + t, { cast: false });
  });
  V.NEN.forEach(([x0, x1, z0, z1]) => mesh(hopUV(x1 - x0, 0.1, z1 - z0), vl('san'), (x0 + x1) / 2, 0.05, (z0 + z1) / 2, { cast: false }));
  // cây: sầu riêng tán lớn, cà phê thấp theo hàng; tránh sân, đường
  const tranh = [...V.NEN, ...V.DUONG].map(([a, b, c, d]) => [a - 3, b + 3, c - 3, d + 3]);
  const trong = (x, z) => tranh.some(([a, b, c, d]) => x > a && x < b && z > c && z < d);
  const tamKhu = [[3, -18]], R = rng(77), saurieng = [], caphe = [];
  tamKhu.forEach(([cx, cz]) => {
    for (let i = 0; i < 160; i++) { const r = 24 + R() * 110, a = R() * Math.PI * 2, x = cx + Math.cos(a) * r, z = cz + Math.sin(a) * r; if (!trong(x, z)) saurieng.push([x, z, 0.8 + R() * 0.6]); }
    for (let row = 0; row < 24; row++) for (let i = 0; i < 40; i++) { const x = cx - 60 + i * 3 + (row % 2) * 1.5, z = cz + 34 + row * 2.6; if (!trong(x, z) && R() > 0.08) caphe.push([x, z, 0.7 + R() * 0.4]); }
  });
  const d = new THREE.Object3D(), c = new THREE.Color();
  const than = new THREE.InstancedMesh(cy(0.18, 0.25, 1, 7), vl('than'), saurieng.length), tan = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), L({ color: 0xffffff }), saurieng.length);
  saurieng.forEach(([x, z, s], i) => {
    d.position.set(x, 1.6 * s, z); d.scale.set(1, 3.2 * s, 1); d.rotation.set(0, 0, 0); d.updateMatrix(); than.setMatrixAt(i, d.matrix);
    d.position.set(x, 4.2 * s, z); d.scale.set(2.4 * s, 2.8 * s, 2.4 * s); d.updateMatrix(); tan.setMatrixAt(i, d.matrix);
    tan.setColorAt(i, c.setHSL(0.3 + R() * 0.06, 0.38, 0.24 + R() * 0.08));
  });
  const bui = new THREE.InstancedMesh(new THREE.IcosahedronGeometry(1, 1), L({ color: 0xffffff }), caphe.length);
  caphe.forEach(([x, z, s], i) => { d.position.set(x, 0.75 * s, z); d.scale.set(0.95 * s, 0.85 * s, 0.95 * s); d.updateMatrix(); bui.setMatrixAt(i, d.matrix); bui.setColorAt(i, c.setHSL(0.31 + R() * 0.04, 0.42, 0.2 + R() * 0.06)); });
  [than, tan, bui].forEach((m) => { m.castShadow = true; m.receiveShadow = true; scene.add(m); });
  return troi;
}

/* ---------- dựng toàn bộ ---------- */
async function build(scene, renderer) {
  anis = Math.min(8, renderer.capabilities.getMaxAnisotropy());
  try { await Promise.race([Promise.all(['800 64px "Be Vietnam Pro"', '600 64px "Be Vietnam Pro"', 'italic 600 64px "Source Serif 4"'].map((f) => document.fonts.load(f))), new Promise((r) => setTimeout(r, 2500))]); } catch (e) { /* không có phông thì dùng phông máy */ }
  root = new THREE.Group(); scene.add(root);
  const old = new Set(V.KHU_CU);
  ZONES = H.ZONES.filter((z) => z.id !== 'vung').map((z) => { const c = JSON.parse(JSON.stringify(z)); if (old.has(c.id)) doiZ(c, V.DOI_CU); return c; });
  ROOMS = ZONES.filter((z) => z.kind === 'hall' || z.kind === 'house');
  const troi = canhQuan(scene);
  ZONES.forEach((z) => {
    (KIEU[z.kind] || KIEU.hall)(z);
    (z.do || []).forEach(([t, ...a]) => { if (DO[t]) DO[t](z, ...a); });
    trangTri(z);
  });
  V.MAI.forEach((m) => maiDoc(m));
  V.BIEN_NGOAI.forEach(bienNgoai);
  return { zones: ZONES, troi };
}

window.HeragrainTheGioi = { build, veLogo, MAU };
})();
