// Hồ sơ năng lực Lĩnh vực Đào tạo – Viện STP (A4 đứng, PPTX)
// node build.js [output.pptx]
const fs = require('fs');
const path = require('path');
const pptxgen = require('pptxgenjs');
const { imageSize } = require('image-size');
const React = require('react');
const ReactDOMServer = require('react-dom/server');
const sharp = require('sharp');
const fa = require('react-icons/fa6');
const md = require('react-icons/md');

const OUT = process.argv[2] || path.join(__dirname, '..', 'Vien-STP_Ho-so-nang-luc_Dao-tao_A4.pptx');
const A = (p) => path.join(__dirname, 'assets', p);

// ---------------------------------------------------------------- theme
const THEME = {
  name: 'STP Institute',
  headFontFace: 'Calibri',
  bodyFontFace: 'Calibri',
  colors: {
    dk1: '1F2D1A', lt1: 'FFFFFF', dk2: '123A00', lt2: 'EBF8E1',
    accent1: '1A6600', accent2: '7CC43A', accent3: 'CFE8B8', accent4: 'D32F2F',
    accent5: '5B6B57', accent6: 'E39A00', hlink: '1A6600', folHlink: '5B6B57',
  },
};
const HEX = THEME.colors;

const pres = new pptxgen();
pres.defineLayout({ name: 'A4P', width: 8.27, height: 11.69 });
pres.layout = 'A4P';
pres.theme = { headFontFace: THEME.headFontFace, bodyFontFace: THEME.bodyFontFace };
pres.title = 'Hồ sơ năng lực Lĩnh vực Đào tạo – Viện STP';
pres.author = 'Viện STP';
pres.company = 'STP Institute';

const C = pres.SchemeColor;
const TX = C.text1, DG = C.text2, WH = C.background1, MINT = C.background2;
const GR = C.accent1, LIME = C.accent2, SOFT = C.accent3, RED = C.accent4, MUTED = C.accent5, AMB = C.accent6;

const W = 8.27, H = 11.69, M = 0.6, CW = W - 2 * M;
const FOOT = 'STP INSTITUTE  |  Hồ sơ năng lực Đào tạo  |  www.vienstp.com';

// ---------------------------------------------------------------- helpers
const dimCache = {};
function dims(p) {
  if (!dimCache[p]) dimCache[p] = imageSize(fs.readFileSync(p));
  return dimCache[p];
}
// image cropped to fill the box
function imgCover(s, p, x, y, w, h, o = {}) {
  const d = dims(p);
  s.addImage(Object.assign({ path: p, x, y, w: d.width / 100, h: d.height / 100, sizing: { type: 'cover', w, h } }, o));
}
// image scaled to fit inside the box, centered
function imgFit(s, p, x, y, w, h, o = {}) {
  const d = dims(p);
  const r = Math.min(w / d.width, h / d.height);
  const iw = d.width * r, ih = d.height * r;
  s.addImage(Object.assign({ path: p, x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih }, o));
  return { x: x + (w - iw) / 2, y: y + (h - ih) / 2, w: iw, h: ih };
}
function T(s, text, o) {
  s.addText(text, Object.assign({
    isTextBox: true, margin: 0, valign: 'top', fontSize: 14, color: TX,
    lineSpacingMultiple: 1.05, paraSpaceAfter: 0,
  }, o));
}
function rr(s, x, y, w, h, fill, o = {}) {
  s.addShape(pres.shapes.ROUNDED_RECTANGLE, Object.assign({
    x, y, w, h, rectRadius: 0.12, fill: { color: fill }, line: { type: 'none' },
  }, o));
}
function rect(s, x, y, w, h, fill, o = {}) {
  s.addShape(pres.shapes.RECTANGLE, Object.assign({ x, y, w, h, fill: { color: fill }, line: { type: 'none' } }, o));
}
const shadow = () => ({ type: 'outer', color: '0B2A00', opacity: 0.16, blur: 8, offset: 2, angle: 90 });
function card(s, x, y, w, h, fill = WH, o = {}) {
  rr(s, x, y, w, h, fill, Object.assign({ shadow: shadow(), line: { color: SOFT, width: 0.75 } }, o));
}
// runs: ['plain', ['styled', {bold:true}], ['\n'] (ends the paragraph), ...]
const R = (arr) => {
  const out = [];
  for (const r of arr) {
    if (Array.isArray(r) && r[0] === '\n') {
      if (out.length) out[out.length - 1].options.breakLine = true;
      continue;
    }
    out.push(typeof r === 'string' ? { text: r, options: {} } : { text: r[0], options: Object.assign({}, r[1] || {}) });
  }
  return out;
};

// icons ------------------------------------------------------------------------------------
const iconCache = {};
async function icon(Comp, hex) {
  const key = (Comp.displayName || Comp.name) + hex;
  if (iconCache[key]) return iconCache[key];
  const svg = ReactDOMServer.renderToStaticMarkup(React.createElement(Comp, { color: '#' + hex, size: 256 }));
  const png = await sharp(Buffer.from(svg)).resize(256, 256).png().toBuffer();
  iconCache[key] = 'image/png;base64,' + png.toString('base64');
  return iconCache[key];
}
async function iconCircle(s, Comp, x, y, d, circleFill, iconHex, ratio = 0.52) {
  s.addShape(pres.shapes.OVAL, { x, y, w: d, h: d, fill: { color: circleFill }, line: { type: 'none' } });
  const id = d * ratio;
  s.addImage({ data: await icon(Comp, iconHex), x: x + (d - id) / 2, y: y + (d - id) / 2, w: id, h: id });
}
async function iconAt(s, Comp, hex, x, y, d) {
  s.addImage({ data: await icon(Comp, hex), x, y, w: d, h: d });
}

// browser-style frame around a screenshot
function screenshot(s, p, x, y, w) {
  const d = dims(p);
  const ih = w * d.height / d.width;
  const bar = 0.2;
  card(s, x - 0.06, y - 0.06, w + 0.12, ih + bar + 0.12, WH, { rectRadius: 0.08 });
  [0, 1, 2].forEach((i) => s.addShape(pres.shapes.OVAL, {
    x: x + 0.06 + i * 0.12, y: y + 0.05, w: 0.08, h: 0.08,
    fill: { color: [RED, AMB, LIME][i] }, line: { type: 'none' },
  }));
  s.addImage({ path: p, x, y: y + bar, w, h: ih });
  return ih + bar;
}

function kicker(s, text, o = {}) {
  T(s, text, Object.assign({ x: M, y: 0.4, w: 6.2, h: 0.28, fontSize: 11, bold: true, color: GR, charSpacing: 2 }, o));
}
function title(s, text) {
  s.addText(text, { placeholder: 'title' });
}
function heading(s, text, x, y, w, o = {}) {
  T(s, text, Object.assign({ x, y, w, h: 0.34, fontSize: 16, bold: true, color: DG, charSpacing: 1 }, o));
}

// ---------------------------------------------------------------- layouts
const footer = (color) => ({ text: { text: FOOT, options: { x: M, y: 11.22, w: 5.6, h: 0.26, fontSize: 9, color, margin: 0, valign: 'middle' } } });
const slideNum = (color) => ({ x: 7.07, y: 11.18, w: 0.6, h: 0.32, fontSize: 12, bold: true, color, align: 'right', margin: 0 });

pres.defineSlideMaster({
  title: 'COVER',
  background: { path: A('bg/cover.jpg') },
  objects: [],
});
pres.defineSlideMaster({
  title: 'DARK',
  background: { path: A('bg/dark.jpg') },
  objects: [
    { image: { path: A('logo/stp.png'), x: 7.0, y: 0.32, w: 0.82, h: 0.82 } },
    footer(SOFT),
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.6, w: 6.2, h: 0.6, fontSize: 28, bold: true, color: WH, margin: 0, valign: 'middle', align: 'left' }, text: '' } },
  ],
  slideNumber: slideNum(LIME),
});
pres.defineSlideMaster({
  title: 'CONTENT',
  background: { path: A('bg/light.jpg') },
  objects: [
    { image: { path: A('logo/stp.png'), x: 7.0, y: 0.32, w: 0.82, h: 0.82 } },
    footer(MUTED),
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 0.66, w: 6.25, h: 0.56, fontSize: 28, bold: true, color: DG, margin: 0, valign: 'middle', align: 'left' }, text: '' } },
  ],
  slideNumber: slideNum(GR),
});
const HB = 3.6; // hero band height on section openers
pres.defineSlideMaster({
  title: 'OPENER',
  background: { path: A('bg/light.jpg') },
  objects: [
    { image: { path: A('bg/dark.jpg'), x: 0, y: 0, w: 12.4, h: 17.54, sizing: { type: 'cover', w: W, h: HB } } },
    { image: { path: A('logo/stp.png'), x: M, y: 0.35, w: 0.85, h: 0.85 } },
    footer(MUTED),
    { placeholder: { options: { name: 'title', type: 'title', x: M, y: 1.62, w: 3.6, h: 1.3, fontSize: 26, bold: true, color: WH, margin: 0, valign: 'bottom', align: 'left', lineSpacingMultiple: 0.95 }, text: '' } },
  ],
  slideNumber: slideNum(GR),
});

function opener(s, { kick, sub, photo, photoX = 4.35 }) {
  imgCover(s, photo, photoX, 0, W - photoX, HB);
  T(s, kick, { x: M, y: 1.3, w: 3.6, h: 0.28, fontSize: 12, bold: true, color: LIME, charSpacing: 3 });
  T(s, sub, { x: M, y: 3.0, w: 3.55, h: 0.5, fontSize: 14, color: SOFT, valign: 'top' });
}

// ---------------------------------------------------------------- pages
async function build() {
  // ============================================================== 1. COVER
  {
    const s = pres.addSlide({ masterName: 'COVER' });
    s.addImage({ path: A('logo/stp.png'), x: 0.55, y: 0.45, w: 1.25, h: 1.25 });
    T(s, 'VIỆN NGHIÊN CỨU PHÁT TRIỂN GIÁO DỤC & NGHỀ NGHIỆP STP', { x: 1.98, y: 0.55, w: 5.8, h: 0.6, fontSize: 16, bold: true, color: WH, valign: 'middle' });
    T(s, 'Tổ chức Khoa học & Công nghệ trực thuộc Liên hiệp các Hội Khoa học và Kỹ thuật Việt Nam (VUSTA)', { x: 1.98, y: 1.16, w: 5.7, h: 0.5, fontSize: 13, color: SOFT });
    T(s, 'HỒ SƠ NĂNG LỰC', { x: 0.55, y: 2.25, w: 5, h: 0.5, fontSize: 24, bold: true, color: WH, charSpacing: 4 });
    T(s, 'LĨNH VỰC\nĐÀO TẠO', { x: 0.55, y: 2.75, w: 6.5, h: 1.85, fontSize: 62, bold: true, color: LIME, lineSpacingMultiple: 0.86 });
    T(s, 'EDUCATION & TRAINING PROFILE', { x: 0.55, y: 4.62, w: 5.5, h: 0.34, fontSize: 14, bold: true, color: WH, charSpacing: 4 });
    T(s, 'Các chương trình đào tạo, bồi dưỡng và cấp chứng chỉ của Viện STP – từ chứng chỉ nghiệp vụ, an toàn lao động đến ứng dụng AI và khảo thí tiếng Anh chuẩn Cambridge.',
      { x: 0.55, y: 5.12, w: 3.95, h: 1.3, fontSize: 14, color: WH });
    const pills = [
      [fa.FaAward, 'CHỨNG CHỈ NGHIỆP VỤ NGẮN HẠN'],
      [fa.FaHelmetSafety, 'AN TOÀN LAO ĐỘNG & SỐ HÓA'],
      [fa.FaBrain, 'ĐÀO TẠO ỨNG DỤNG AI'],
      [fa.FaGraduationCap, 'TUYỂN SINH & KHẢO THÍ CAMBRIDGE'],
    ];
    for (let i = 0; i < pills.length; i++) {
      const y = 6.62 + i * 0.64;
      rr(s, 0.55, y, 3.95, 0.5, WH, { rectRadius: 0.1 });
      await iconCircle(s, pills[i][0], 0.62, y + 0.06, 0.38, DG, HEX.lt1);
      T(s, pills[i][1], { x: 1.12, y, w: 3.3, h: 0.5, fontSize: 14, bold: true, color: DG, valign: 'middle' });
    }
    rr(s, 0.55, 9.35, 5.95, 1.05, WH, { rectRadius: 0.1 });
    T(s, 'EDUCATION  ·  CONSULTING  ·  TECHNOLOGY  ·  PARTNERSHIP', { x: 0.7, y: 9.45, w: 5.65, h: 0.3, fontSize: 13, bold: true, color: DG, align: 'center', charSpacing: 1 });
    T(s, 'Kết nối tri thức, nguồn lực và các chủ thể trong hệ sinh thái giáo dục – khoa học – dịch vụ chuyên môn',
      { x: 0.75, y: 9.78, w: 5.55, h: 0.55, fontSize: 13, color: TX, align: 'center' });
    rr(s, 6.7, 9.35, 1.05, 1.05, WH, { rectRadius: 0.08 });
    s.addImage({ path: A('logo/qr_web.png'), x: 6.75, y: 9.4, w: 0.95, h: 0.95 });
    const contacts = [[fa.FaPhone, '0827.695.368 · 0968.702.701', 0.55, 2.6], [fa.FaEnvelope, 'viencongnghestp@gmail.com', 3.42, 2.3], [fa.FaGlobe, 'www.vienstp.com', 6.12, 1.6]];
    for (const [ic, t, x, w] of contacts) {
      await iconAt(s, ic, HEX.accent2, x, 10.66, 0.22);
      T(s, t, { x: x + 0.3, y: 10.6, w, h: 0.34, fontSize: 13, bold: true, color: WH, valign: 'middle' });
    }
  }

  // ============================================================== 2. LỜI MỞ ĐẦU & NỘI DUNG
  {
    const s = pres.addSlide({ masterName: 'DARK' });
    title(s, 'LỜI MỞ ĐẦU');
    T(s, R([
      'Trong kỷ nguyên số, ', ['chất lượng nguồn nhân lực', { bold: true, color: LIME }],
      ' là chìa khóa then chốt giúp cơ quan, doanh nghiệp nâng cao hiệu quả vận hành và năng lực cạnh tranh.',
      ['\n', { breakLine: false }],
      ['Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP', { bold: true }],
      ' – tổ chức khoa học và công nghệ trực thuộc VUSTA – là đối tác đồng hành tin cậy với hệ sinh thái đào tạo toàn diện: bồi dưỡng và cấp chứng chỉ nghiệp vụ ngắn hạn; huấn luyện an toàn, vệ sinh lao động gắn với số hóa quản lý; đào tạo ứng dụng AI theo nghiệp vụ từng cơ quan, đơn vị; tuyển sinh và khảo thí tiếng Anh chuẩn Cambridge.',
      ['\n', {}],
      'Chúng tôi đồng hành từ khảo sát nhu cầu, xây dựng lộ trình đến ứng dụng thực tiễn – ', ['học đến đâu, làm được đến đó.', { bold: true, color: LIME }],
    ]), { x: M, y: 1.42, w: CW, h: 3.25, fontSize: 15, color: WH, paraSpaceAfter: 8, lineSpacingMultiple: 1.08 });

    const stats = [
      ['2020', 'Năm được cấp Giấy chứng nhận hoạt động KH&CN'],
      ['VUSTA', 'Tổ chức KH&CN trực thuộc Liên hiệp các Hội KH&KT Việt Nam'],
      ['03', 'Văn phòng: Hà Nội · Nha Trang · TP. Hồ Chí Minh'],
      ['250', 'Thí sinh/ca tại phòng thi máy tính'],
    ];
    const sw = (CW - 3 * 0.16) / 4;
    stats.forEach(([n, l], i) => {
      const x = M + i * (sw + 0.16);
      rr(s, x, 4.6, sw, 1.85, WH, { fill: { color: WH, transparency: 90 }, line: { color: LIME, width: 0.75 } });
      T(s, n, { x: x + 0.15, y: 4.73, w: sw - 0.3, h: 0.55, fontSize: n.length > 4 ? 26 : 32, bold: true, color: LIME, valign: 'middle' });
      T(s, l, { x: x + 0.15, y: 5.33, w: sw - 0.25, h: 1.05, fontSize: 14, color: WH });
    });

    T(s, 'NỘI DUNG', { x: M, y: 6.72, w: 4, h: 0.4, fontSize: 18, bold: true, color: LIME, charSpacing: 3 });
    const toc = [
      ['01', 'GIỚI THIỆU VIỆN STP', 'VUSTA, Viện STP, pháp lý và lĩnh vực trọng tâm', '03'],
      ['02', 'CHỨNG CHỈ NGHIỆP VỤ NGẮN HẠN', 'Đường thủy nội địa, Xây dựng và các chứng chỉ khác', '05'],
      ['03', 'AN TOÀN, VỆ SINH LAO ĐỘNG', '6 nhóm huấn luyện và số hóa quản lý qua phần mềm', '07'],
      ['04', 'ĐÀO TẠO ỨNG DỤNG AI', 'Thiết kế riêng theo nghiệp vụ từng cơ quan, đơn vị', '11'],
      ['05', 'TUYỂN SINH & KHẢO THÍ CAMBRIDGE', 'Trung tâm tuyển sinh, đào tạo và khảo thí tiếng Anh', '15'],
      ['06', 'ĐỐI TÁC & HỆ THỐNG VĂN PHÒNG', 'Mạng lưới liên kết, khách hàng và văn phòng', '18'],
    ];
    toc.forEach(([n, t, d, p], i) => {
      const y = 7.22 + i * 0.62;
      s.addShape(pres.shapes.LINE, { x: M, y: y + 0.57, w: CW, h: 0, line: { color: WH, width: 0.5, transparency: 70 } });
      T(s, n, { x: M, y, w: 0.65, h: 0.52, fontSize: 24, bold: true, color: LIME, valign: 'middle' });
      T(s, t, { x: 1.35, y: y + 0.02, w: 5.2, h: 0.27, fontSize: 15, bold: true, color: WH });
      T(s, d, { x: 1.35, y: y + 0.28, w: 5.2, h: 0.26, fontSize: 14, color: SOFT });
      T(s, 'tr. ' + p, { x: 6.6, y, w: 1.07, h: 0.52, fontSize: 14, bold: true, color: LIME, align: 'right', valign: 'middle' });
    });
  }

  // ============================================================== 3. GIỚI THIỆU CHUNG
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 01 · GIỚI THIỆU VIỆN STP');
    title(s, 'GIỚI THIỆU CHUNG');
    T(s, 'Về VUSTA', { x: M, y: 1.5, w: 3.1, h: 0.45, fontSize: 24, bold: true, color: GR });
    T(s, R([
      ['Liên hiệp các Hội khoa học và kỹ thuật Việt Nam (VUSTA)', { bold: true, color: GR }],
      ' là tổ chức chính trị - xã hội nghề nghiệp hoạt động trên phạm vi cả nước theo quy định của pháp luật.',
      ['\n', {}],
      'VUSTA có hệ thống tổ chức rộng khắp với các hội ngành toàn quốc, liên hiệp hội tỉnh, thành phố trực thuộc Trung ương cùng mạng lưới các viện nghiên cứu, trung tâm khoa học, cơ sở đào tạo và đơn vị thông tin khoa học, đóng vai trò quan trọng trong việc kết nối, phát huy nguồn lực trí thức và thúc đẩy các hoạt động khoa học - công nghệ, giáo dục và phát triển nguồn nhân lực.',
    ]), { x: M, y: 2.05, w: 3.1, h: 4.6, fontSize: 14, paraSpaceAfter: 6, align: 'justify' });

    rr(s, 3.92, 1.4, 3.75, 4.95, DG, { shadow: shadow() });
    T(s, 'Về Viện STP', { x: 4.17, y: 1.55, w: 3.3, h: 0.45, fontSize: 24, bold: true, color: WH });
    T(s, R([
      'Là tổ chức khoa học và công nghệ trực thuộc VUSTA, ',
      ['Viện Nghiên cứu Phát triển Giáo dục và Nghề nghiệp STP (Viện STP)', { bold: true, color: LIME }],
      ' được thành lập với sứ mệnh kết nối tri thức, nguồn lực và các chủ thể trong hệ sinh thái giáo dục – khoa học – dịch vụ chuyên môn.',
      ['\n', {}],
      'Thông qua nghiên cứu khoa học, đào tạo và cấp chứng chỉ nghiệp vụ, tuyển sinh và hợp tác quốc tế cùng các hoạt động xúc tiến văn hóa, giáo dục và du lịch, Viện STP đóng vai trò kết nối hệ sinh thái, lan tỏa tri thức và tạo dựng các giá trị hợp tác thiết thực cho Nhà nước, doanh nghiệp và cộng đồng.',
    ]), { x: 4.17, y: 2.1, w: 3.28, h: 4.55, fontSize: 14, color: WH, paraSpaceAfter: 6, align: 'justify' });

    rr(s, M, 6.55, CW, 4.4, MINT);
    T(s, 'Hoạt động pháp lý', { x: 0.85, y: 6.68, w: 5, h: 0.42, fontSize: 22, bold: true, color: GR });
    T(s, R([
      ['Giấy chứng nhận đăng ký hoạt động Khoa học và Công nghệ', { bold: true, color: DG, breakLine: true }],
      'Số: 234/QĐ-LHHVN do Liên hiệp các Hội Khoa học và Kỹ thuật Việt Nam cấp ngày 24/03/2020.',
    ]), { x: 0.85, y: 7.14, w: 6.6, h: 0.75, fontSize: 14 });
    const lw = [3.21, 3.27];
    let lx = 0.85;
    ['crop/license1.jpg', 'crop/license2.jpg'].forEach((p, i) => {
      rr(s, lx - 0.05, 8.1, lw[i] + 0.1, 2.45, WH, { rectRadius: 0.05, shadow: shadow(), line: { color: GR, width: 1.5 } });
      imgCover(s, A(p), lx, 8.15, lw[i], 2.35);
      lx += lw[i] + 0.15;
    });
  }

  // ============================================================== 4. LĨNH VỰC TRỌNG TÂM
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 01 · GIỚI THIỆU VIỆN STP');
    title(s, 'LĨNH VỰC TRỌNG TÂM');
    const items = [
      { n: '01', ic: fa.FaFlask, h: 1.4, body: R([['Nghiên cứu Khoa học: ', { bold: true, color: GR }], 'Hợp tác với các tổ chức, cá nhân trong và ngoài nước thực hiện các nhiệm vụ nghiên cứu khoa học. Hỗ trợ đăng các bài báo chuyên ngành trong và ngoài nước.']) },
      { n: '02', ic: fa.FaMicrochip, h: 1.4, tag: 'tr. 11', body: R([['Cung cấp tư vấn trọn gói các giải pháp tích hợp trí tuệ nhân tạo (AI) đa thể thức', { bold: true, color: GR }], ' cho doanh nghiệp theo đặc thù kinh doanh và quản lý nhà nước']) },
      { n: '03', ic: fa.FaAward, h: 1.86, tag: 'tr. 05', body: R([
        ['Đào tạo, bồi dưỡng và cấp Chứng chỉ nghiệp vụ chuyên sâu:', { bold: true, color: GR, breakLine: true }],
        ['Các chương trình tiên tiến dành cho học sinh, sinh viên, giáo viên, cán bộ quản lý giáo dục', { bullet: { indent: 14 }, breakLine: true }],
        ['Các chương trình dành cho công chức, viên chức cấp chứng chỉ: An toàn đường thuỷ nội địa; lĩnh vực Xây dựng...', { bullet: { indent: 14 } }],
      ]) },
      { n: '04', ic: fa.FaEarthAsia, h: 1.68, tag: 'tr. 15', body: R([
        ['Trung tâm tuyển sinh: ', { bold: true, color: GR }],
        ['liên kết hợp tác với các trường cao đẳng – đại học uy tín trong và ngoài nước tuyển sinh chính quy trình độ từ Sơ cấp đến Tiến sĩ', { breakLine: true }],
        ['Tổ chức: ', { bold: true, color: GR }], 'Hội nghị, hội thảo khoa học, giáo dục, công nghệ',
      ]) },
      { n: '05', ic: fa.FaFileInvoiceDollar, h: 2.55, body: R([
        'Bên cạnh chức năng nghiên cứu khoa học và đào tạo nghề, Viện STP xác định ',
        ['tư vấn và đề xuất các giải pháp chuyên sâu cho tổ chức hành chính sự nghiệp, doanh nghiệp và tập đoàn', { bold: true, color: GR }],
        [' là hoạt động trọng tâm trong chiến lược phát triển.', { breakLine: true }],
        ['Trên cơ sở đó, Viện STP tập trung vào 2 lĩnh vực sau:', { breakLine: true }],
        ['Tư vấn thẩm định giá', { bold: true, color: GR, bullet: { indent: 14 }, breakLine: true }],
        ['Giải pháp tem điện tử chống giả và truy xuất nguồn gốc qua Cổng Mã vạch Quốc gia', { bold: true, color: GR, bullet: { indent: 14 } }],
      ]) },
    ];
    let y = 1.45;
    const nb = 1.25;
    for (let i = 0; i < items.length; i++) {
      const it = items[i];
      const left = i % 2 === 1; // number block on the left for even cards
      card(s, M, y, CW, it.h);
      const bx = left ? M : M + CW - nb;
      s.addShape(pres.shapes.ROUNDED_RECTANGLE, { x: bx, y, w: nb, h: it.h, rectRadius: 0.12, fill: { color: GR }, line: { type: 'none' } });
      // square off the inner edge of the number block
      rect(s, left ? bx + nb - 0.2 : bx, y, 0.2, it.h, GR);
      const gh = 1.0 + (it.tag ? 0.3 : 0);
      const gy = y + (it.h - gh) / 2;
      T(s, it.n, { x: bx, y: gy, w: nb, h: 0.6, fontSize: 34, bold: true, color: WH, align: 'center', valign: 'middle' });
      await iconAt(s, it.ic, 'E8F5DC', bx + nb / 2 - 0.17, gy + 0.66, 0.34);
      if (it.tag) T(s, '→ ' + it.tag, { x: bx, y: gy + 1.06, w: nb, h: 0.24, fontSize: 11, bold: true, color: SOFT, align: 'center' });
      const tx = left ? M + nb + 0.28 : M + 0.28;
      T(s, it.body, { x: tx, y: y + 0.16, w: CW - nb - 0.52, h: it.h - 0.3, fontSize: 14, valign: 'middle', paraSpaceAfter: 2 });
      y += it.h + 0.14;
    }
  }

  // ============================================================== 5. OPENER: CHỨNG CHỈ NGHIỆP VỤ NGẮN HẠN
  {
    const s = pres.addSlide({ masterName: 'OPENER' });
    opener(s, { kick: 'PHẦN 02', sub: 'Nâng cao năng lực chuyên môn, kỹ năng nghề và kỹ năng quản lý', photo: A('crop/students.jpg') });
    title(s, 'ĐÀO TẠO & CẤP CHỨNG CHỈ NGHIỆP VỤ NGẮN HẠN');
    T(s, R([
      ['Viện STP', { bold: true, color: GR }],
      ' trực tiếp tổ chức các chương trình đào tạo, bồi dưỡng và cấp chứng chỉ nghề nghiệp ngắn hạn nhằm nâng cao năng lực chuyên môn, kỹ năng nghề và kỹ năng quản lý cho cá nhân, tổ chức và doanh nghiệp.',
      ['\n', {}],
      'Các chương trình được xây dựng ', ['theo hướng ứng dụng, bám sát nhu cầu thực tiễn và yêu cầu của thị trường lao động.', { bold: true, color: DG }],
    ]), { x: M, y: 3.85, w: CW, h: 1.7, fontSize: 15, paraSpaceAfter: 6, align: 'justify' });
    heading(s, 'CÁC NHÓM CHƯƠNG TRÌNH CHỨNG CHỈ', M, 5.72, CW);
    const cards = [
      [fa.FaShip, 'AN TOÀN ĐƯỜNG THỦY NỘI ĐỊA', 'Bồi dưỡng nghiệp vụ bảo đảm an toàn giao thông đường thủy nội địa; lĩnh vực khai thác vận tải giao thông đường thủy.'],
      [fa.FaHelmetSafety, 'LĨNH VỰC XÂY DỰNG', 'Bồi dưỡng nghiệp vụ Giám sát thi công xây dựng công trình và Chỉ huy trưởng công trình.'],
      [fa.FaUserShield, 'AN TOÀN, VỆ SINH LAO ĐỘNG', 'Huấn luyện 6 nhóm đối tượng theo quy định, cấp chứng chỉ và số hóa quản lý ATVSLĐ cho doanh nghiệp.', 'TRỌNG TÂM · tr. 07'],
      [fa.FaLayerGroup, 'CHỨNG CHỈ NGHIỆP VỤ KHÁC', 'Sơ cấp cứu, an toàn điện, an toàn hóa chất, giáo dục nghề nghiệp; chương trình cho học sinh, sinh viên, giáo viên.'],
    ];
    const cw = (CW - 0.18) / 2, ch = 2.12;
    for (let i = 0; i < 4; i++) {
      const [ic, t, d, tag] = cards[i];
      const x = M + (i % 2) * (cw + 0.18), y = 6.25 + Math.floor(i / 2) * (ch + 0.24);
      card(s, x, y, cw, ch, tag ? MINT : WH, tag ? { line: { color: LIME, width: 1.25 } } : {});
      await iconCircle(s, ic, x + 0.22, y + 0.22, 0.62, tag ? GR : MINT, tag ? HEX.lt1 : HEX.accent1);
      T(s, t, { x: x + 0.98, y: y + 0.2, w: cw - 1.15, h: 0.66, fontSize: 15, bold: true, color: GR, valign: 'middle' });
      T(s, d, { x: x + 0.22, y: y + 0.98, w: cw - 0.42, h: 1.05, fontSize: 14.5 });
      if (tag) {
        rr(s, x + cw - 1.75, y - 0.17, 1.6, 0.32, LIME, { rectRadius: 0.16 });
        T(s, tag, { x: x + cw - 1.75, y: y - 0.17, w: 1.6, h: 0.32, fontSize: 11, bold: true, color: DG, align: 'center', valign: 'middle' });
      }
    }
  }

  // ============================================================== 6. CHỨNG CHỈ CHUYÊN NGÀNH
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 02 · CHỨNG CHỈ NGHIỆP VỤ NGẮN HẠN');
    title(s, 'CHỨNG CHỈ CHUYÊN NGÀNH');
    T(s, 'Học viên hoàn thành khóa học được cấp Chứng nhận nghiệp vụ song ngữ Việt – Anh (Certificate of Knowledge) do Viện STP cấp, có số hiệu và số vào sổ cấp chứng nhận.',
      { x: M, y: 1.38, w: CW, h: 0.56, fontSize: 14, italic: true, color: MUTED });
    // A. đường thủy
    await iconCircle(s, fa.FaShip, M, 2.12, 0.5, GR, HEX.lt1);
    T(s, 'AN TOÀN ĐƯỜNG THỦY\nNỘI ĐỊA', { x: 1.22, y: 2.08, w: 3.1, h: 0.58, fontSize: 16, bold: true, color: GR, valign: 'middle' });
    T(s, R([
      ['Lĩnh vực: ', { bold: true, color: DG }], ['Khai thác vận tải giao thông đường thủy', { breakLine: true }],
      ['Khóa học: ', { bold: true, color: DG }], ['Bồi dưỡng nghiệp vụ Bảo đảm an toàn giao thông đường thủy nội địa', { breakLine: true }],
      ['Đối tượng: ', { bold: true, color: DG }], 'Công chức, viên chức và cá nhân hoạt động trong lĩnh vực đường thủy nội địa',
    ]), { x: M, y: 2.75, w: 3.62, h: 1.95, fontSize: 14, paraSpaceAfter: 6 });
    rr(s, 4.42, 2.12, 3.27, 2.32, WH, { rectRadius: 0.05, shadow: shadow(), line: { color: SOFT, width: 0.75 } });
    imgCover(s, A('crop/cert_dt.jpg'), 4.47, 2.17, 3.17, 2.22);

    // B. xây dựng
    await iconCircle(s, fa.FaHelmetSafety, M, 4.9, 0.5, GR, HEX.lt1);
    T(s, 'LĨNH VỰC XÂY DỰNG', { x: 1.22, y: 4.9, w: 5, h: 0.5, fontSize: 16, bold: true, color: GR, valign: 'middle' });
    const xd = [
      ['crop/cert_xd.jpg', 'Giám sát thi công xây dựng công trình', 'Theo Thông tư 25/2009/TT-BXD ngày 29/7/2009 của Bộ Xây dựng'],
      ['crop/cert_cht.jpg', 'Chỉ huy trưởng công trình', 'Bồi dưỡng nghiệp vụ Chỉ huy trưởng công trình (Site Manager)'],
    ];
    const xw = (CW - 0.2) / 2;
    xd.forEach(([p, t, d], i) => {
      const x = M + i * (xw + 0.2);
      rr(s, x, 5.55, xw, 2.48, WH, { rectRadius: 0.05, shadow: shadow(), line: { color: SOFT, width: 0.75 } });
      imgCover(s, A(p), x + 0.05, 5.6, xw - 0.1, 2.38);
      T(s, R([[t, { bold: true, color: DG, breakLine: true }], [d, { color: MUTED }]]), { x, y: 8.12, w: xw, h: 0.8, fontSize: 14 });
    });

    // C. khác
    heading(s, 'CÁC CHỨNG CHỈ NGHIỆP VỤ KHÁC', M, 9.02, CW);
    const other = [
      ['Sơ cấp cứu', 'TT 19/2016/TT-BYT'], ['An toàn điện', 'TT 05/2021/TT-BCT'], ['An toàn hóa chất', 'NĐ 113/2017/NĐ-CP'],
      ['Giáo dục nghề nghiệp', 'TT 42, 43/2015/TT-BLĐTBXH'], ['Chương trình giáo dục', 'HS, SV, giáo viên, CBQL giáo dục'], ['An toàn, vệ sinh lao động', 'Nhóm 1 – 6 · xem trang 07'],
    ];
    const ow = (CW - 2 * 0.14) / 3;
    other.forEach(([t, d], i) => {
      const x = M + (i % 3) * (ow + 0.14), y = 9.44 + Math.floor(i / 3) * 0.76;
      const hl = i === 5;
      rr(s, x, y, ow, 0.66, hl ? GR : MINT, { rectRadius: 0.08 });
      T(s, R([[t, { bold: true, color: hl ? WH : DG, breakLine: true }], [d, { fontSize: 11.5, color: hl ? SOFT : MUTED }]]), { x: x + 0.14, y: y + 0.06, w: ow - 0.2, h: 0.56, fontSize: 14, valign: 'middle' });
    });
  }

  // ============================================================== 7. OPENER: ATVSLĐ
  {
    const s = pres.addSlide({ masterName: 'OPENER' });
    opener(s, { kick: 'PHẦN 03 · TRỌNG TÂM', sub: 'Đào tạo · Cấp chứng chỉ · Số hóa quản lý cho doanh nghiệp', photo: A('atl/hero.jpg') });
    title(s, 'AN TOÀN,\nVỆ SINH LAO ĐỘNG');
    T(s, 'An toàn lao động – nền tảng phát triển bền vững của doanh nghiệp', { x: M, y: 3.82, w: CW, h: 0.34, fontSize: 16, bold: true, color: DG });
    T(s, R([
      'Trong bối cảnh an toàn, vệ sinh lao động trở thành yêu cầu bắt buộc, công tác huấn luyện ATLĐ không chỉ nhằm tuân thủ pháp luật mà còn góp phần ',
      ['bảo vệ con người, tài sản và uy tín của tổ chức.', { bold: true, color: GR }],
      ['\n', {}],
      ['Viện STP', { bold: true, color: GR }], ' phối hợp cùng ', ['Công ty CP Kỹ thuật Hàng Hải DAKO', { bold: true, color: GR }],
      ' (thuộc hệ sinh thái Viện STP) xây dựng và triển khai các chương trình huấn luyện ATLĐ, VSLĐ cho doanh nghiệp, cơ quan, tổ chức trong nước và quốc tế – nội dung ',
      ['bài bản, có tính hệ thống, gắn chặt với thực tiễn sản xuất kinh doanh.', { bold: true, color: GR }],
    ]), { x: M, y: 4.25, w: CW, h: 2.05, fontSize: 14, paraSpaceAfter: 6, align: 'justify' });
    const badges = [
      [fa.FaBuildingShield, 'Được Bộ Nội vụ cấp phép huấn luyện'],
      [fa.FaLandmark, 'Viện STP trực thuộc VUSTA'],
      [fa.FaEarthAsia, 'Phục vụ DN trong nước & quốc tế'],
    ];
    const bw = (CW - 0.3) / 3;
    for (let i = 0; i < 3; i++) {
      const x = M + i * (bw + 0.15);
      rr(s, x, 6.38, bw, 0.92, MINT, { rectRadius: 0.1 });
      await iconCircle(s, badges[i][0], x + 0.12, 6.59, 0.5, GR, HEX.lt1);
      T(s, badges[i][1], { x: x + 0.72, y: 6.43, w: bw - 0.8, h: 0.82, fontSize: 14, bold: true, color: DG, valign: 'middle' });
    }
    heading(s, 'MÔ HÌNH HỢP TÁC VIỆN STP – DAKO', M, 7.48, CW);
    const roles = [
      [A('logo/stp.png'), 'VIỆN STP', 'Đơn vị nghiên cứu & phát triển giải pháp', 'Xây dựng chương trình theo quy định và đặc thù doanh nghiệp; tư vấn ISO 45001; phát triển nền tảng số.'],
      [A('logo/dako.png'), 'DAKO MARINE TECHNOLOGY', 'Đơn vị triển khai huấn luyện', 'Huấn luyện theo giấy phép; thi, kiểm tra, cấp chứng chỉ; lưu trữ hồ sơ theo pháp luật.'],
    ];
    const rw = (CW - 0.2) / 2;
    roles.forEach(([logo, n, r, d], i) => {
      const x = M + i * (rw + 0.2);
      card(s, x, 7.9, rw, 1.62);
      imgFit(s, logo, x + 0.14, 8.0, 0.62, 0.62);
      T(s, R([[n, { bold: true, color: GR, fontSize: 14, breakLine: true }], [r, { italic: true, color: MUTED, fontSize: 12 }]]), { x: x + 0.86, y: 8.0, w: rw - 0.95, h: 0.62, valign: 'middle' });
      T(s, d, { x: x + 0.16, y: 8.7, w: rw - 0.3, h: 0.78, fontSize: 14 });
    });
    rr(s, M, 9.7, CW, 1.15, DG);
    T(s, 'DOANH NGHIỆP NHẬN ĐƯỢC', { x: 0.85, y: 9.8, w: 4, h: 0.3, fontSize: 12, bold: true, color: LIME, charSpacing: 2 });
    const gains = ['Giải pháp toàn diện', 'Tuân thủ pháp luật', 'Giảm rủi ro', 'Phát triển bền vững'];
    const gw = (CW - 0.5) / 4;
    for (let i = 0; i < 4; i++) {
      const x = 0.85 + i * gw;
      await iconAt(s, fa.FaCircleCheck, HEX.accent2, x, 10.25, 0.26);
      T(s, gains[i], { x: x + 0.33, y: 10.16, w: gw - 0.35, h: 0.45, fontSize: 14, bold: true, color: WH, valign: 'middle' });
    }
  }

  // ============================================================== 8. 6 NHÓM HUẤN LUYỆN
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 03 · (1) HUẤN LUYỆN & CẤP CHỨNG CHỈ');
    title(s, '6 NHÓM HUẤN LUYỆN ATVSLĐ');
    T(s, 'Theo Nghị định 44/2016/NĐ-CP và Nghị định 140/2018/NĐ-CP · phân theo nhóm đối tượng, vị trí công việc · lý thuyết kết hợp thực hành tại chỗ.',
      { x: M, y: 1.36, w: CW, h: 0.55, fontSize: 14, italic: true, color: MUTED });
    const groups = [
      ['1', 'Người quản lý, chỉ huy sản xuất', 'Khoản 5, Điều 1, NĐ 140/2018/NĐ-CP', 'Người đứng đầu đơn vị, cơ sở SXKD; phụ trách sản xuất, kỹ thuật; quản đốc phân xưởng.', 'Chuẩn hóa hệ thống quản lý ATLĐ, nâng cao hiệu quả sản xuất', 'image73.jpeg'],
      ['2', 'Người làm công tác ATVSLĐ', 'Khoản 5, Điều 1, NĐ 140/2018/NĐ-CP', 'Cán bộ chuyên trách, bán chuyên trách ATVSLĐ; người giám sát ATVSLĐ tại nơi làm việc.', 'Đội ngũ ATLĐ vững chuyên môn, chủ động kiểm soát rủi ro', 'image76.jpeg'],
      ['3', 'Người làm công việc yêu cầu nghiêm ngặt', 'Khoản 5, Điều 1, NĐ 140/2018/NĐ-CP', 'Công việc thuộc Danh mục có yêu cầu nghiêm ngặt về ATVSLĐ do Bộ Nội vụ ban hành.', 'Vận hành an toàn, giảm tai nạn, sản xuất ổn định', 'image77.jpeg'],
      ['4', 'Người lao động khác', 'Không thuộc nhóm 1, 3, 5, 6 · NĐ 140/2018', 'Lao động phổ thông, văn phòng, sản xuất; kể cả người học nghề, tập nghề, thử việc.', 'Chuẩn hóa hành vi an toàn, đáp ứng thanh tra, kiểm tra', 'image80.jpeg'],
      ['5', 'Người làm công tác y tế', 'Khoản 5, Điều 1, NĐ 140/2018/NĐ-CP', 'Nhân sự y tế tại đơn vị: chăm sóc sức khỏe, sơ cấp cứu, phòng chống dịch bệnh.', 'Sơ cấp cứu, phòng chống TNLĐ & bệnh nghề nghiệp', 'image81.jpeg'],
      ['6', 'An toàn, vệ sinh viên', 'Điều 74 Luật An toàn, vệ sinh lao động', 'Lực lượng giám sát, nhắc nhở, phát hiện sớm nguy cơ mất an toàn tại nơi làm việc.', 'Nhận diện nguy cơ, xây dựng văn hóa an toàn', 'image83.jpeg'],
    ];
    const gw = (CW - 0.16) / 2, gh = 2.86;
    for (let i = 0; i < 6; i++) {
      const [n, name, ref, dt, gt, ph] = groups[i];
      const x = M + (i % 2) * (gw + 0.16), y = 1.98 + Math.floor(i / 2) * (gh + 0.13);
      card(s, x, y, gw, gh);
      imgCover(s, A('atl/' + ph), x + gw - 1.13, y + 0.16, 0.96, 0.96, { rounding: true });
      rr(s, x + 0.18, y + 0.18, 0.98, 0.32, DG, { rectRadius: 0.16 });
      T(s, 'NHÓM ' + n, { x: x + 0.18, y: y + 0.18, w: 0.98, h: 0.32, fontSize: 12, bold: true, color: LIME, align: 'center', valign: 'middle', charSpacing: 1 });
      T(s, name, { x: x + 0.18, y: y + 0.56, w: gw - 1.45, h: 0.56, fontSize: 15, bold: true, color: DG, valign: 'middle', lineSpacingMultiple: 0.95 });
      T(s, ref, { x: x + 0.18, y: y + 1.17, w: gw - 0.3, h: 0.24, fontSize: 11.5, italic: true, color: MUTED });
      T(s, R([['Đối tượng: ', { bold: true, color: GR }], dt]), { x: x + 0.18, y: y + 1.44, w: gw - 0.34, h: 0.8, fontSize: 14 });
      rr(s, x + 0.12, y + gh - 0.64, gw - 0.24, 0.52, MINT, { rectRadius: 0.08 });
      await iconAt(s, fa.FaCircleCheck, HEX.accent1, x + 0.22, y + gh - 0.5, 0.24);
      T(s, gt, { x: x + 0.52, y: y + gh - 0.63, w: gw - 0.62, h: 0.5, fontSize: 14, bold: true, color: GR, valign: 'middle' });
    }
  }

  // ============================================================== 9. SỐ HÓA QUẢN LÝ ATVSLĐ
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 03 · (2) SỐ HÓA ATVSLĐ QUA PHẦN MỀM');
    title(s, 'SỐ HÓA QUẢN LÝ ATVSLĐ');
    T(s, R([['Một khóa học có thể kết thúc sau vài ngày – ', {}], ['nhưng công tác an toàn, vệ sinh lao động cần được quản lý mỗi ngày.', { bold: true, color: GR }]]),
      { x: M, y: 1.36, w: CW, h: 0.55, fontSize: 15, italic: true, color: DG });
    // old way
    const lx = M, lw = 3.22, ty = 2.02, th = 5.78;
    card(s, lx, ty, lw, th, 'F6F7F5');
    T(s, 'CÁCH QUẢN LÝ CŨ', { x: lx + 0.2, y: ty + 0.15, w: lw - 0.4, h: 0.32, fontSize: 14, bold: true, color: MUTED, charSpacing: 2 });
    const olds = [[fa.FaFileExcel, 'Excel'], [fa.FaFileLines, 'Hồ sơ giấy'], [fa.FaPenToSquare, 'Thủ công']];
    for (let i = 0; i < 3; i++) {
      const x = lx + 0.2 + i * 0.96;
      rr(s, x, ty + 0.55, 0.88, 0.62, WH, { rectRadius: 0.08, line: { color: 'D9DED6', width: 0.75 } });
      await iconAt(s, olds[i][0], '8A9387', x + 0.32, ty + 0.6, 0.24);
      T(s, olds[i][1], { x, y: ty + 0.86, w: 0.88, h: 0.26, fontSize: 11, color: MUTED, align: 'center' });
    }
    const probs = [
      'Theo dõi nhân sự, lịch sử huấn luyện bằng Excel',
      'Bị động trước hạn kiểm định máy móc, thiết bị',
      'Đánh giá rủi ro chưa được cập nhật liên tục',
      'Lãnh đạo thiếu dữ liệu để ra quyết định',
      'Mất chứng chỉ, khó xác minh thông tin đào tạo',
    ];
    for (let i = 0; i < probs.length; i++) {
      const y = ty + 1.38 + i * 0.66;
      await iconCircle(s, fa.FaXmark, lx + 0.2, y + 0.1, 0.3, 'FBE3E3', HEX.accent4, 0.6);
      T(s, probs[i], { x: lx + 0.6, y, w: lw - 0.72, h: 0.56, fontSize: 14, color: TX, valign: 'middle' });
    }
    T(s, 'Quản lý thủ công: mất thời gian, dễ bỏ sót, khó kiểm soát.',
      { x: lx + 0.2, y: ty + 4.82, w: lw - 0.4, h: 0.8, fontSize: 14, italic: true, bold: true, color: RED });
    // arrow
    await iconCircle(s, fa.FaArrowRight, 3.67, ty + th / 2 - 0.25, 0.5, LIME, HEX.dk2, 0.5);
    // new way
    const rx = 4.27, rw = W - M - rx;
    rr(s, rx, ty, rw, th, DG, { shadow: shadow() });
    T(s, 'GIẢI PHÁP CỦA VIỆN STP', { x: rx + 0.2, y: ty + 0.15, w: rw - 0.4, h: 0.3, fontSize: 14, bold: true, color: LIME, charSpacing: 2 });
    T(s, R([['Quản lý ATVSLĐ thông minh 4.0', { bold: true, color: WH, breakLine: true }], ['Tập trung · Trực quan · Chủ động · Số hóa', { bold: true, color: LIME, fontSize: 13 }]]),
      { x: rx + 0.2, y: ty + 0.48, w: rw - 0.3, h: 0.78, fontSize: 14 });
    const feats = [
      [fa.FaFolderOpen, 'Quản lý tập trung hồ sơ ATVSLĐ từng người'],
      [fa.FaClockRotateLeft, 'Theo dõi lịch sử huấn luyện, hạn chứng chỉ'],
      [fa.FaBell, 'Cảnh báo tự động chứng chỉ, thiết bị sắp hết hạn'],
      [fa.FaTriangleExclamation, 'Báo cáo nguy cơ, sự cố ngay tại hiện trường'],
      [fa.FaQrcode, 'Tra cứu hồ sơ bằng QR Code, không lo thất lạc'],
      [fa.FaDatabase, 'Lưu trữ tập trung, dễ tìm kiếm, truy xuất'],
      [fa.FaChartPie, 'Dashboard trực quan theo thời gian thực'],
      [fa.FaRobot, 'Ứng dụng AI, dữ liệu số cảnh báo rủi ro'],
    ];
    for (let i = 0; i < feats.length; i++) {
      const y = ty + 1.32 + i * 0.55;
      await iconAt(s, feats[i][0], HEX.accent2, rx + 0.2, y + 0.13, 0.26);
      T(s, feats[i][1], { x: rx + 0.58, y, w: rw - 0.7, h: 0.52, fontSize: 14, color: WH, valign: 'middle' });
    }
    // ecosystem
    heading(s, 'HỆ SINH THÁI KẾT NỐI 3 BÊN', M, 7.96, CW);
    T(s, R([
      'Ký hợp đồng đào tạo → doanh nghiệp có ', ['tài khoản quản lý EHS/ATVSLĐ riêng', { bold: true, color: GR }],
      ' (không phải mua phần mềm), mỗi học viên có ', ['tài khoản cá nhân.', { bold: true, color: GR }],
    ]), { x: M, y: 8.32, w: CW, h: 0.52, fontSize: 14 });
    const eco = [
      [fa.FaBuilding, 'DOANH NGHIỆP', 'Quản lý tập trung', 'doanhnghiep.vienstp.com', WH],
      [fa.FaHandshake, 'VIỆN STP', 'Đồng hành xuyên suốt', 'Đào tạo & giải pháp', DG],
      [fa.FaUserGraduate, 'NGƯỜI LAO ĐỘNG', 'Chủ động tra cứu', 'daotao.vienstp.com', WH],
    ];
    const ew = (CW - 0.5) / 3;
    for (let i = 0; i < 3; i++) {
      const [ic, n, d, u, f] = eco[i];
      const x = M + i * (ew + 0.25), y = 8.94;
      const dark = f === DG;
      card(s, x, y, ew, 1.14, f);
      await iconCircle(s, ic, x + 0.12, y + 0.1, 0.42, dark ? LIME : MINT, dark ? HEX.dk2 : HEX.accent1);
      T(s, n, { x: x + 0.62, y: y + 0.1, w: ew - 0.66, h: 0.42, fontSize: 13.5, bold: true, color: dark ? WH : DG, valign: 'middle' });
      T(s, d, { x: x + 0.14, y: y + 0.56, w: ew - 0.2, h: 0.28, fontSize: 14, bold: true, color: dark ? LIME : GR });
      T(s, u, { x: x + 0.14, y: y + 0.84, w: ew - 0.2, h: 0.24, fontSize: 11.5, color: dark ? SOFT : MUTED });
      if (i < 2) T(s, '⇄', { x: x + ew, y: y + 0.36, w: 0.25, h: 0.4, fontSize: 16, bold: true, color: GR, align: 'center', valign: 'middle' });
    }
    const steps = ['Quản lý hồ sơ', 'Quản lý con người', 'Quản lý nguy cơ', 'Chủ động phòng ngừa'];
    const cwv = (CW + 0.15) / 4;
    steps.forEach((t, i) => {
      s.addShape(i === 0 ? pres.shapes.PENTAGON : pres.shapes.CHEVRON, {
        x: M + i * (cwv - 0.05), y: 10.25, w: cwv, h: 0.62,
        fill: { color: [SOFT, LIME, GR, DG][i] }, line: { type: 'none' },
      });
      T(s, t, { x: M + i * (cwv - 0.05) + (i === 0 ? 0.08 : 0.3), y: 10.25, w: cwv - 0.46, h: 0.62, fontSize: 13.5, bold: true, color: i < 2 ? DG : WH, align: 'center', valign: 'middle' });
    });
  }

  // ============================================================== 10. NỀN TẢNG QUẢN LÝ SỐ STP
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 03 · (2) SỐ HÓA ATVSLĐ QUA PHẦN MỀM');
    title(s, 'NỀN TẢNG QUẢN LÝ SỐ STP');
    // A. doanh nghiệp
    heading(s, 'TÀI KHOẢN DOANH NGHIỆP', M, 1.42, 3.3);
    rr(s, 3.62, 1.43, 2.3, 0.32, MINT, { rectRadius: 0.16 });
    T(s, 'doanhnghiep.vienstp.com', { x: 3.62, y: 1.43, w: 2.3, h: 0.32, fontSize: 11.5, bold: true, color: GR, align: 'center', valign: 'middle' });
    T(s, 'Tổng quan an toàn & nhân sự của doanh nghiệp trong một cú click.', { x: M, y: 1.8, w: CW, h: 0.3, fontSize: 14, italic: true, color: MUTED });
    screenshot(s, A('atl/image100.jpeg'), M + 0.06, 2.3, 4.2);
    const da = [
      [fa.FaChartPie, 'Chỉ số tuân thủ', 'Tỷ lệ % nhân sự đã / chưa huấn luyện'],
      [fa.FaBell, 'Chứng chỉ sắp hết hạn', 'Cảnh báo trước 30 ngày'],
      [fa.FaGears, 'Thiết bị & kiểm định', 'Theo dõi hạn kiểm định máy móc'],
    ];
    for (let i = 0; i < 3; i++) {
      const y = 2.22 + i * 0.78;
      await iconCircle(s, da[i][0], 5.1, y + 0.05, 0.42, MINT, HEX.accent1);
      T(s, R([[da[i][1], { bold: true, color: DG, breakLine: true }], [da[i][2], {}]]), { x: 5.6, y, w: 2.1, h: 0.74, fontSize: 14 });
    }
    // B. modules
    const mods = [
      ['MODULE ĐÀO TẠO', 'atl/image104.jpeg', ['Danh mục khóa học Nhóm 1–6', 'Đăng ký nhanh, thêm nhân sự', 'Quản lý lớp, hợp đồng, thanh toán']],
      ['MODULE AN TOÀN & TÀI SẢN', 'atl/image106.jpeg', ['Thiết bị, cảnh báo hạn kiểm định', 'Tai nạn, sự cố, vật tư, hóa chất', 'Cấp phát đồ bảo hộ (PPE)']],
    ];
    const mw = (CW - 0.2) / 2;
    mods.forEach(([t, p, bl], i) => {
      const x = M + i * (mw + 0.2), y = 4.62;
      card(s, x, y, mw, 3.62);
      T(s, t, { x: x + 0.18, y: y + 0.12, w: mw - 0.3, h: 0.3, fontSize: 14, bold: true, color: GR, charSpacing: 1 });
      screenshot(s, A(p), x + 0.2, y + 0.52, mw - 0.4);
      T(s, bl.map((b, k) => ({ text: b, options: { bullet: { indent: 12 }, breakLine: k < bl.length - 1 } })), { x: x + 0.16, y: y + 2.5, w: mw - 0.26, h: 1.0, fontSize: 14, paraSpaceAfter: 3 });
    });
    // C. học viên
    heading(s, 'TÀI KHOẢN HỌC VIÊN & TRA CỨU 24/7', M, 8.45, 4.6);
    rr(s, 5.25, 8.46, 2.42, 0.32, MINT, { rectRadius: 0.16 });
    T(s, 'daotao.vienstp.com', { x: 5.25, y: 8.46, w: 2.42, h: 0.32, fontSize: 11.5, bold: true, color: GR, align: 'center', valign: 'middle' });
    screenshot(s, A('atl/image113.jpeg'), M + 0.06, 8.98, 2.2);
    screenshot(s, A('atl/image114.jpeg'), 3.04, 8.98, 2.2);
    T(s, R([
      ['Tra cứu 24/7 ', { bold: true, color: DG }], ['theo mã chứng chỉ hoặc số CCCD; mã xác thực chống giả mạo.', { breakLine: true }],
      ['Learner Portal: ', { bold: true, color: DG }], 'khóa học, yêu cầu BHLĐ, báo cáo sự cố.',
    ]), { x: 5.45, y: 8.92, w: 2.25, h: 2.0, fontSize: 14, paraSpaceAfter: 6 });
  }

  // ============================================================== 11. OPENER: AI
  {
    const s = pres.addSlide({ masterName: 'OPENER' });
    opener(s, { kick: 'PHẦN 04', sub: 'Thiết kế riêng theo nghiệp vụ của từng cơ quan, đơn vị và người học', photo: A('bg/sphere.jpg') });
    title(s, 'ĐÀO TẠO\nỨNG DỤNG AI');
    T(s, R([
      'Trong kỷ nguyên số, ', ['Trí tuệ nhân tạo (AI)', { bold: true, color: GR }],
      ' là chìa khóa then chốt giúp nhân sự và doanh nghiệp tối ưu hiệu suất vận hành và bứt phá năng lực cạnh tranh. Viện STP là đối tác đồng hành tin cậy, chuyên cung cấp ',
      ['các chương trình đào tạo AI chuyên sâu và giải pháp tích hợp đa thể thức', { bold: true, color: GR }], ' theo đặc thù từng cơ quan, doanh nghiệp.',
    ]), { x: M, y: 3.82, w: CW, h: 1.35, fontSize: 14, align: 'justify' });
    const pil = [
      [fa.FaBrain, 'Phổ cập kiến thức AI', 'Xây dựng năng lực làm việc cùng AI cho đội ngũ nhân sự'],
      [fa.FaGears, 'Tư vấn giải pháp', 'Giải pháp AI đa thể thức theo đặc thù từng đơn vị'],
      [fa.FaHandshake, 'Đồng hành thực tiễn', 'Từ khảo sát, lộ trình đến ứng dụng vào công việc'],
    ];
    const pw = (CW - 0.3) / 3;
    for (let i = 0; i < 3; i++) {
      const x = M + i * (pw + 0.15);
      rr(s, x, 5.3, pw, 1.68, DG, { shadow: shadow() });
      await iconCircle(s, pil[i][0], x + 0.15, 5.44, 0.46, LIME, HEX.dk2);
      T(s, pil[i][1], { x: x + 0.7, y: 5.44, w: pw - 0.8, h: 0.46, fontSize: 14, bold: true, color: WH, valign: 'middle' });
      T(s, pil[i][2], { x: x + 0.15, y: 5.98, w: pw - 0.26, h: 0.95, fontSize: 14, color: SOFT });
    }
    heading(s, 'NĂNG LỰC CỐT LÕI', M, 7.28, CW);
    const core = [
      ['Tư vấn Chiến lược & Đào tạo “May đo”', 'Không dùng giáo trình rập khuôn; khảo sát “điểm nghẽn” vận hành để thiết kế nội dung riêng.'],
      ['Phát triển Giải pháp & Tự động hóa', 'Làm chủ lõi công nghệ AI; phần mềm chuyên ngành, Chatbot, tự động hóa quy trình.'],
      ['Đội ngũ Chuyên gia “Thực thi kép”', 'Cố vấn chuyển đổi số, giám đốc đào tạo cùng kỹ sư, PM giàu kinh nghiệm (Agile/Scrum).'],
      ['Bề dày Triển khai Đa ngành', 'Dự án quy mô lớn: Y tế, Khối Nhà nước/Xã hội, Tập đoàn/Vận hành (AI Office).'],
    ];
    const kw = (CW - 0.16) / 2, kh = 1.62;
    core.forEach(([t, d], i) => {
      const x = M + (i % 2) * (kw + 0.16), y = 7.7 + Math.floor(i / 2) * (kh + 0.14);
      card(s, x, y, kw, kh, MINT, { line: { type: 'none' } });
      rr(s, x + 0.16, y + 0.17, 0.42, 0.42, GR, { rectRadius: 0.08 });
      T(s, String(i + 1), { x: x + 0.16, y: y + 0.17, w: 0.42, h: 0.42, fontSize: 18, bold: true, color: WH, align: 'center', valign: 'middle' });
      T(s, t, { x: x + 0.7, y: y + 0.1, w: kw - 0.82, h: 0.56, fontSize: 14, bold: true, color: DG, valign: 'middle' });
      T(s, d, { x: x + 0.16, y: y + 0.7, w: kw - 0.28, h: 0.86, fontSize: 14 });
    });
  }

  // ============================================================== 12. CHƯƠNG TRÌNH ĐÀO TẠO AI
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 04 · ĐÀO TẠO ỨNG DỤNG AI');
    title(s, 'CHƯƠNG TRÌNH ĐÀO TẠO AI');
    const rows = [
      [fa.FaLandmark, 'Cơ quan nhà nước', 'Ứng dụng AI chuyên biệt nhằm tối ưu hóa quy trình xử lý văn bản, rút ngắn thời gian tác nghiệp và nâng cao hiệu suất làm việc.',
        ['Văn phòng Quốc hội', 'Bộ Văn Hóa', 'Sở Khoa học & Công nghệ', 'Sở Y tế', 'Sở Công Thương', 'Sở Nội Vụ'], ['gov1', 'gov2', 'gov3', 'gov4', 'gov5']],
      [fa.FaBriefcase, 'Doanh nghiệp', 'Ứng dụng AI thực chiến trong quản lý và công việc hàng ngày, giải quyết các bài toán đặc thù cho từng phòng ban.',
        ['Lãnh đạo', 'Marketing', 'HR', 'Doanh nghiệp sản xuất', 'Kinh doanh và bán hàng'], ['biz1', 'biz2', 'biz3', 'biz4', 'biz5']],
      [fa.FaSchool, 'Đơn vị giáo dục', 'Chuẩn hóa năng lực số, đổi mới phương pháp giảng dạy cho hệ thống giáo dục.',
        ['Ban giám hiệu', 'Giảng viên đại học', 'Giáo viên các cấp', 'Sinh viên', 'Học sinh các cấp', 'Trung tâm giáo dục'], ['edu1', 'edu2', 'edu3', 'edu4', 'edu5']],
      [fa.FaUser, 'Cá nhân', 'Biến AI thành “trợ lý đắc lực” giúp bứt phá năng suất gấp nhiều lần trong công việc, giảng dạy, học tập và đời sống.',
        ['AI cho mọi người', 'AI cho nhà lãnh đạo', 'Xây dựng Chatbot', 'AI Automation', 'Vibe Coding', 'AI cho HR', 'AI sản xuất Media', 'AI cho Giảng dạy', 'AI cho trẻ em'], []],
    ];
    const rhs = [2.25, 2.15, 2.25, 2.2];
    let y = 1.45;
    for (let i = 0; i < rows.length; i++) {
      const [ic, t, d, chips, logos] = rows[i];
      const rh = rhs[i];
      card(s, M, y, CW, rh, i % 2 ? WH : MINT, i % 2 ? {} : { line: { type: 'none' } });
      await iconCircle(s, ic, M + 0.18, y + 0.2, 0.52, GR, HEX.lt1);
      T(s, R([['ĐÀO TẠO AI CHO', { fontSize: 11, color: MUTED, bold: true, charSpacing: 1, breakLine: true }], [t.toUpperCase(), { fontSize: 16, bold: true, color: DG }]]), { x: M + 0.82, y: y + 0.16, w: 2.4, h: 0.6, valign: 'middle' });
      T(s, d, { x: M + 0.18, y: y + 0.86, w: 3.05, h: rh - 0.95, fontSize: 14 });
      // chips (flow layout)
      const cx0 = M + 3.42, cxMax = M + CW - 0.15;
      let cx = cx0, cy = y + 0.2;
      for (const c of chips) {
        const cw = Math.min(c.length * 0.078 + 0.3, cxMax - cx0);
        if (cx + cw > cxMax) { cx = cx0; cy += 0.42; }
        rr(s, cx, cy, cw, 0.34, GR, { rectRadius: 0.17 });
        T(s, c, { x: cx, y: cy, w: cw, h: 0.34, fontSize: 13, bold: true, color: WH, align: 'center', valign: 'middle' });
        cx += cw + 0.08;
      }
      if (logos.length) {
        const lw = (cxMax - cx0 - 4 * 0.08) / 5;
        logos.forEach((l, k) => {
          const lx = cx0 + k * (lw + 0.08), ly = y + rh - 0.52;
          rr(s, lx, ly, lw, 0.36, WH, { rectRadius: 0.05, line: { color: 'DDE5D6', width: 0.5 } });
          imgFit(s, A('ai/' + l + '.png'), lx + 0.03, ly + 0.03, lw - 0.06, 0.3);
        });
      }
      y += rh + 0.14;
    }
  }

  // ============================================================== 13. AI CHO KHỐI HÀNH CHÍNH
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 04 · CHƯƠNG TRÌNH CHUYÊN SÂU');
    title(s, 'AI CHO KHỐI HÀNH CHÍNH');
    T(s, R([['Ứng dụng Trí tuệ nhân tạo trong công tác văn phòng – hành chính', { bold: true, color: GR, breakLine: true }], ['Dành cho cán bộ, công chức, viên chức các cơ quan hành chính nhà nước các cấp', { italic: true, color: MUTED }]]),
      { x: M, y: 1.36, w: CW, h: 0.6, fontSize: 14 });
    rr(s, M, 2.1, CW, 1.72, DG, { shadow: shadow() });
    await iconCircle(s, fa.FaSliders, M + 0.25, 2.5, 0.85, LIME, HEX.dk2);
    T(s, 'ĐIỂM NỔI BẬT', { x: 1.9, y: 2.2, w: 5.5, h: 0.28, fontSize: 12, bold: true, color: LIME, charSpacing: 2 });
    T(s, R([['Chương trình đào tạo được thiết kế riêng ', {}], ['theo nghiệp vụ của từng cơ quan, đơn vị', { color: LIME }]]), { x: 1.9, y: 2.48, w: 5.6, h: 0.62, fontSize: 17, bold: true, color: WH });
    T(s, 'Thực hành trên chính tác vụ hằng ngày của đơn vị: văn bản, báo cáo, thủ tục hành chính, cuộc họp – học đến đâu, làm được đến đó.',
      { x: 1.9, y: 3.1, w: 5.65, h: 0.66, fontSize: 14, color: SOFT });
    heading(s, 'MỤC TIÊU CỦA CHƯƠNG TRÌNH', M, 4.0, CW);
    [['30%', 'Kiến thức nền tảng', MINT, GR], ['70%', 'Thực hành nghiệp vụ thực tế', GR, WH]].forEach(([n, l, f, c], i) => {
      const x = M + i * 1.5;
      rr(s, x, 4.42, 1.38, 1.5, f, { line: { color: SOFT, width: 0.75 } });
      T(s, n, { x, y: 4.5, w: 1.38, h: 0.62, fontSize: 30, bold: true, color: c, align: 'center', valign: 'middle' });
      T(s, l, { x: x + 0.06, y: 5.1, w: 1.26, h: 0.76, fontSize: 14, bold: true, color: c, align: 'center' });
    });
    T(s, R([['Học đến đâu – làm được đến đó. ', { bold: true, color: GR }], 'Người học biết giao việc cho AI, chỉ dùng dữ liệu được phép và kiểm chứng kết quả trước khi trình ký – ', ['AI hỗ trợ, cán bộ chịu trách nhiệm.', { bold: true, color: DG }]]),
      { x: 3.72, y: 4.42, w: 3.95, h: 1.5, fontSize: 14, valign: 'middle' });
    heading(s, 'NGƯỜI HỌC SẼ ĐẠT ĐƯỢC', M, 6.12, CW);
    const outs = [
      ['Sử dụng AI an toàn, đúng quy định: ', 'không đưa bí mật nhà nước, dữ liệu cá nhân lên AI công cộng; kiểm chứng kết quả trước khi dùng.'],
      ['Soạn thảo văn bản hành chính với AI ', '(công văn, tờ trình, kế hoạch, báo cáo…) đúng thể thức Nghị định 30/2020/NĐ-CP.'],
      ['Xử lý nhanh văn bản đến: ', 'tóm tắt, trích xuất nội dung chỉ đạo, việc cần làm, đơn vị chủ trì và thời hạn.'],
      ['Tổng hợp báo cáo định kỳ, chuyên đề ', 'từ báo cáo các đơn vị và bảng số liệu: so sánh, nhận xét, biểu đồ.'],
      ['Tra cứu văn bản pháp luật có căn cứ ', 'và tự xây dựng Trợ lý AI nghiệp vụ trên bộ tài liệu của đơn vị.'],
      ['Hỗ trợ thủ tục hành chính, cuộc họp, tuyên truyền: ', 'hướng dẫn hồ sơ, hỏi – đáp, thông báo kết luận, tin bài.'],
      ['Hoàn thành bộ sản phẩm dùng ngay: ', 'thư viện câu lệnh, Trợ lý AI và quy trình AI cho một nghiệp vụ lặp lại.'],
    ];
    for (let i = 0; i < outs.length; i++) {
      const y = 6.52 + i * 0.63;
      rr(s, M, y, CW, 0.56, i % 2 ? WH : MINT, { rectRadius: 0.08, line: i % 2 ? { color: 'E1EADB', width: 0.5 } : { type: 'none' } });
      await iconAt(s, fa.FaCircleCheck, HEX.accent1, M + 0.14, y + 0.15, 0.26);
      T(s, R([[outs[i][0], { bold: true, color: GR }], outs[i][1]]), { x: M + 0.5, y: y + 0.01, w: CW - 0.58, h: 0.54, fontSize: 14, valign: 'middle' });
    }
  }

  // ============================================================== 14. NỘI DUNG CHƯƠNG TRÌNH
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 04 · CHƯƠNG TRÌNH CHUYÊN SÂU');
    title(s, 'NỘI DUNG CHƯƠNG TRÌNH');
    const parts = [
      ['PHẦN 1', 'AI an toàn, khai thác văn bản pháp luật & Trợ lý AI', [
        ['AI an toàn & kỹ thuật câu lệnh', 'Bảo mật trong công vụ; cấu trúc câu lệnh: vai trò – căn cứ – yêu cầu – thể thức.', 'Nguyên tắc AI an toàn, câu lệnh mẫu'],
        ['Khai thác văn bản & Trợ lý AI', 'Data Grounding, NotebookLM có trích dẫn; Custom GPTs, Gemini Gems theo nghiệp vụ.', 'Trợ lý AI hỏi – đáp có trích dẫn'],
        ['Thực hành theo nhóm & Q&A', 'Thiết kế trợ lý văn thư, tổng hợp, một cửa trên tài liệu thực tế, không mật.', '01 Trợ lý AI nghiệp vụ dùng ngay'],
      ]],
      ['PHẦN 2', 'Ứng dụng AI trong nghiệp vụ văn phòng – hành chính', [
        ['Văn bản đi – đến', 'Dự thảo từ ý kiến chỉ đạo; rà soát thể thức NĐ 30/2020/NĐ-CP; tóm tắt văn bản đến.', 'Dự thảo + phiếu tóm tắt 1 trang'],
        ['Báo cáo tổng hợp & số liệu', 'Báo cáo tháng, quý, năm (NĐ 09/2019/NĐ-CP); so sánh cùng kỳ, phát hiện bất thường.', 'Báo cáo đúng đề cương, có biểu đồ'],
        ['TTHC, cuộc họp & tuyên truyền', 'Hướng dẫn hồ sơ TTHC (NĐ 118/2025/NĐ-CP); thông báo kết luận họp (QĐ 45/2018/QĐ-TTg).', '“Gói nghiệp vụ” TTHC – họp'],
      ]],
    ];
    const pw = (CW - 0.18) / 2;
    for (let p = 0; p < 2; p++) {
      const [lab, t, mods] = parts[p];
      const x = M + p * (pw + 0.18);
      rr(s, x, 1.42, pw, 0.92, DG, { shadow: shadow() });
      T(s, lab, { x: x + 0.2, y: 1.48, w: 2, h: 0.26, fontSize: 12, bold: true, color: LIME, charSpacing: 2 });
      T(s, t, { x: x + 0.2, y: 1.72, w: pw - 0.3, h: 0.58, fontSize: 14, bold: true, color: WH });
      for (let m = 0; m < 3; m++) {
        const [mt, md_, prod] = mods[m];
        const y = 2.47 + m * 1.9;
        card(s, x, y, pw, 1.8);
        s.addShape(pres.shapes.OVAL, { x: x + 0.14, y: y + 0.14, w: 0.36, h: 0.36, fill: { color: GR }, line: { type: 'none' } });
        T(s, String(m + 1), { x: x + 0.14, y: y + 0.14, w: 0.36, h: 0.36, fontSize: 14, bold: true, color: WH, align: 'center', valign: 'middle' });
        T(s, mt, { x: x + 0.6, y: y + 0.1, w: pw - 0.72, h: 0.44, fontSize: 14, bold: true, color: GR, valign: 'middle' });
        T(s, md_, { x: x + 0.14, y: y + 0.52, w: pw - 0.24, h: 0.74, fontSize: 14 });
        rr(s, x + 0.08, y + 1.3, pw - 0.16, 0.42, MINT, { rectRadius: 0.06 });
        T(s, R([['→ ', { bold: true, color: GR }], [prod, { color: DG, bold: true }]]), { x: x + 0.14, y: y + 1.3, w: pw - 0.2, h: 0.42, fontSize: 14, valign: 'middle' });
      }
    }
    heading(s, 'SẢN PHẨM ĐẦU RA SAU TẬP HUẤN', M, 8.24, CW);
    const outs = [
      'Trợ lý AI nghiệp vụ của đơn vị', 'Thư viện câu lệnh hành chính',
      'Văn bản đi & phiếu tóm tắt', 'Báo cáo tổng hợp có biểu đồ',
      'Hướng dẫn TTHC, hỏi – đáp', 'Quy trình AI nghiệp vụ lặp lại',
      'Nguyên tắc dùng AI an toàn', 'Áp dụng ngay vào chuyên môn',
    ];
    for (let i = 0; i < outs.length; i++) {
      const x = M + (i % 2) * (pw + 0.18), y = 8.64 + Math.floor(i / 2) * 0.44;
      T(s, '01', { x, y: y + 0.04, w: 0.44, h: 0.36, fontSize: 13, bold: true, color: WH, align: 'center', valign: 'middle', fill: { color: i === 7 ? LIME : GR } });
      T(s, outs[i], { x: x + 0.54, y, w: pw - 0.56, h: 0.44, fontSize: 14, color: TX, valign: 'middle', bold: i === 7 });
    }
    T(s, 'Căn cứ xây dựng nội dung: NĐ 30/2020/NĐ-CP về công tác văn thư · NĐ 09/2019/NĐ-CP về chế độ báo cáo · NĐ 118/2025/NĐ-CP về cơ chế một cửa, một cửa liên thông · QĐ 45/2018/QĐ-TTg về chế độ họp · Luật Bảo vệ bí mật nhà nước 2018 · Luật Bảo vệ dữ liệu cá nhân 2025 · Luật Trí tuệ nhân tạo 2025 · Công văn 557/BKHCN-CĐSQG về nguyên tắc sử dụng chatbot AI.',
      { x: M, y: 10.46, w: CW, h: 0.6, fontSize: 9.5, italic: true, color: MUTED });
  }

  // ============================================================== 15. OPENER: TUYỂN SINH
  {
    const s = pres.addSlide({ masterName: 'OPENER' });
    opener(s, { kick: 'PHẦN 05', sub: 'Liên kết tuyển sinh chính quy từ Sơ cấp đến Tiến sĩ', photo: A('crop/ts3.jpg') });
    title(s, 'TRUNG TÂM\nTUYỂN SINH');
    T(s, R([
      'Trung tâm Tuyển sinh của Viện STP đóng vai trò là ', ['đầu mối tư vấn và tuyển sinh', { bold: true, color: GR }],
      ' cho các chương trình đào tạo chính quy từ cao đẳng đến sau đại học của các trường đại học, cao đẳng uy tín trong nước và quốc tế.',
      ['\n', {}],
      'Viện thực hiện chức năng ', ['kết nối, định hướng và hỗ trợ người học', { bold: true, color: GR }],
      ' tiếp cận đúng chương trình, đúng đối tác đào tạo, trên cơ sở minh bạch thông tin và tuân thủ quy định pháp luật.',
    ]), { x: M, y: 3.85, w: 3.55, h: 3.45, fontSize: 14, paraSpaceAfter: 8, align: 'justify' });
    imgCover(s, A('crop/ts4.jpg'), 4.35, 3.95, 3.32, 3.2, { shadow: shadow() });
    heading(s, 'TRÌNH ĐỘ TUYỂN SINH', M, 7.45, CW);
    const lv = ['Sơ cấp', 'Trung cấp', 'Cao đẳng', 'Đại học', 'Thạc sĩ', 'Tiến sĩ'];
    const lw = (CW + 0.25) / 6;
    lv.forEach((t, i) => {
      s.addShape(i === 0 ? pres.shapes.PENTAGON : pres.shapes.CHEVRON, { x: M + i * (lw - 0.05), y: 7.88, w: lw, h: 0.5, fill: { color: [SOFT, SOFT, LIME, LIME, GR, DG][i] }, line: { type: 'none' } });
      T(s, t, { x: M + i * (lw - 0.05) + (i ? 0.2 : 0.05), y: 7.88, w: lw - 0.35, h: 0.5, fontSize: 13, bold: true, color: i < 4 ? DG : WH, align: 'center', valign: 'middle' });
    });
    const tw = (CW - 0.3) / 3;
    imgCover(s, A('crop/ts1.jpg'), M, 8.62, tw, 2.25);
    imgCover(s, A('crop/ts2.jpg'), M + tw + 0.15, 8.62, tw, 2.25);
    const x3 = M + 2 * (tw + 0.15);
    rr(s, x3, 8.62, tw, 2.25, DG);
    await iconCircle(s, fa.FaPeopleGroup, x3 + 0.2, 8.8, 0.55, LIME, HEX.dk2);
    T(s, R([['TỔ CHỨC', { fontSize: 12, bold: true, color: LIME, charSpacing: 2, breakLine: true }], ['Hội nghị, hội thảo khoa học, giáo dục, công nghệ', { fontSize: 15, bold: true, color: WH }]]),
      { x: x3 + 0.2, y: 9.45, w: tw - 0.35, h: 1.3 });
  }

  // ============================================================== 16. KHẢO THÍ CAMBRIDGE
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 05 · TRUNG TÂM ĐÀO TẠO & KHẢO THÍ');
    title(s, 'ĐÀO TẠO & KHẢO THÍ');
    imgCover(s, A('crop/cam_building.jpg'), M, 1.45, 3.5, 5.6, { shadow: shadow() });
    const rx = 4.38, rw = W - M - rx;
    await iconCircle(s, fa.FaCertificate, rx, 1.5, 0.62, GR, HEX.lt1);
    T(s, R([['CHUẨN TIẾNG ANH', { fontSize: 13, bold: true, color: GR, charSpacing: 1, breakLine: true }], ['CAMBRIDGE', { fontSize: 26, bold: true, color: DG }]]), { x: rx + 0.75, y: 1.45, w: rw - 0.75, h: 0.75, valign: 'middle' });
    s.addShape(pres.shapes.LINE, { x: rx, y: 2.38, w: rw, h: 0, line: { color: GR, width: 1 } });
    const ex = ['CEST', 'LINGUASKILL', 'PROFICIENCY (CPE)', 'ADVANCED (CAE)', 'FIRST (FCE)', 'PRELIMINARY (PET)', 'KEY (KET)', 'FLYERS', 'MOVERS', 'STARTERS'];
    for (let i = 0; i < ex.length; i++) {
      const y = 2.52 + i * 0.4;
      await iconAt(s, fa.FaCheck, HEX.accent1, rx + 0.08, y + 0.06, 0.24);
      T(s, ex[i], { x: rx + 0.48, y, w: rw - 0.5, h: 0.36, fontSize: 15, bold: true, color: TX, valign: 'middle' });
    }
    rr(s, rx, 6.6, rw - 0.95, 0.45, WH, { rectRadius: 0.22, line: { color: GR, width: 1.25 } });
    T(s, 'QR hướng dẫn đường đi  →', { x: rx, y: 6.6, w: rw - 0.95, h: 0.45, fontSize: 13, bold: true, color: DG, align: 'center', valign: 'middle' });
    rr(s, W - M - 0.85, 6.22, 0.85, 0.85, WH, { rectRadius: 0.04, line: { color: GR, width: 1.25 } });
    s.addImage({ path: A('logo/qr_map.png'), x: W - M - 0.8, y: 6.27, w: 0.75, h: 0.75 });
    heading(s, 'KHÔNG GIAN HỌC TẬP', M, 7.28, CW);
    imgCover(s, A('crop/class2.jpg'), M, 7.7, 4.35, 3.2);
    imgCover(s, A('crop/class1.jpg'), M + 4.5, 7.7, CW - 4.5, 1.53);
    imgCover(s, A('crop/class3.jpg'), M + 4.5, 9.37, CW - 4.5, 1.53);
  }

  // ============================================================== 17. PHÒNG THI
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 05 · TRUNG TÂM ĐÀO TẠO & KHẢO THÍ');
    title(s, 'PHÒNG THI MÁY TÍNH');
    rr(s, M, 1.45, CW, 1.3, DG, { shadow: shadow() });
    T(s, '250', { x: 0.85, y: 1.5, w: 1.9, h: 1.2, fontSize: 60, bold: true, color: LIME, valign: 'middle' });
    T(s, R([['THÍ SINH / CA THI', { fontSize: 20, bold: true, color: WH, charSpacing: 2, breakLine: true }], ['Phòng thi với hệ thống máy đáp ứng lên đến 250 thí sinh / ca thi', { fontSize: 14, color: SOFT }]]),
      { x: 2.85, y: 1.55, w: 4.65, h: 1.1, valign: 'middle' });
    const gw = (CW - 0.15) / 2;
    ['exam1', 'exam2', 'exam3', 'exam4'].forEach((p, i) => {
      imgCover(s, A('crop/' + p + '.jpg'), M + (i % 2) * (gw + 0.15), 2.95 + Math.floor(i / 2) * 2.08, gw, 1.95);
    });
    const tw = (CW - 0.3) / 3;
    ['exam5', 'exam6', 'exam7'].forEach((p, i) => imgCover(s, A('crop/' + p + '.jpg'), M + i * (tw + 0.15), 7.13, tw, 3.8));
  }

  // ============================================================== 18. ĐỐI TÁC & KHÁCH HÀNG
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 06 · ĐỐI TÁC & MẠNG LƯỚI LIÊN KẾT');
    title(s, 'ĐỐI TÁC & KHÁCH HÀNG');
    T(s, R([
      'Viện STP xây dựng và phát triển ', ['mạng lưới hợp tác rộng khắp', { bold: true, color: GR }], ' với các trường đại học, cao đẳng, viện nghiên cứu, doanh nghiệp và tổ chức trong nước và quốc tế.',
      ['\n', {}],
      'Thông qua mạng lưới này, chúng tôi đóng vai trò kết nối, phối hợp và đồng hành cùng đối tác trong việc triển khai các chương trình đào tạo, nghiên cứu khoa học, tư vấn chuyên môn và hoạt động phát triển nguồn nhân lực bền vững.',
    ]), { x: M, y: 1.38, w: CW, h: 1.62, fontSize: 14, paraSpaceAfter: 6, align: 'justify' });
    const lw = (CW - 3 * 0.14) / 4, lh = 0.92;
    for (let i = 0; i < 16; i++) {
      const x = M + (i % 4) * (lw + 0.14), y = 3.1 + Math.floor(i / 4) * (lh + 0.1);
      rr(s, x, y, lw, lh, WH, { rectRadius: 0.08, shadow: shadow(), line: { color: 'E1EADB', width: 0.5 } });
      imgFit(s, A('crop/partner' + String(i + 1).padStart(2, '0') + '.jpg'), x + 0.08, y + 0.05, lw - 0.16, lh - 0.1);
    }
    heading(s, 'KHÁCH HÀNG TIÊU BIỂU – HUẤN LUYỆN ATLĐ', M, 7.32, CW);
    const cl = ['Công ty TNHH SX-TM-DV Asanka', 'Công ty TNHH Emivest Feedmill V.N', 'Công ty TNHH Hogetsu Việt Nam', 'Công ty TNHH Thang máy Pacific',
      'Công ty Cổ phần đầu tư HT Vina', 'Công ty TNHH Toyota Thanh Xuân', 'Công ty TNHH TM-DV-XNK Vina T&T', 'Công ty TNHH P.Dussmann Việt Nam'];
    const pw = (CW - 3 * 0.12) / 4, ph = 1.55;
    for (let i = 0; i < 8; i++) {
      const x = M + (i % 4) * (pw + 0.12), y = 7.74 + Math.floor(i / 4) * (ph + 0.1);
      imgCover(s, A('atl/image' + (128 + i) + '.jpeg'), x, y, pw, ph);
      T(s, cl[i], { x: x + 0.08, y: y + ph - 0.52, w: pw - 0.14, h: 0.46, fontSize: 11, bold: true, color: WH, valign: 'bottom' });
    }
  }

  // ============================================================== 19. HỆ THỐNG VĂN PHÒNG
  {
    const s = pres.addSlide({ masterName: 'CONTENT' });
    kicker(s, 'PHẦN 06 · ĐỐI TÁC & HỆ THỐNG VĂN PHÒNG');
    title(s, 'HỆ THỐNG VĂN PHÒNG');
    const mx = 0.1, my = 1.45, mw = 5.25, mh = mw * 1755 / 1210;
    s.addImage({ path: A('crop/map_vn.png'), x: mx, y: my, w: mw, h: mh });
    const pins = [[0.43, 0.206], [0.762, 0.735], [0.541, 0.838]];
    pins.forEach(([px, py], i) => {
      const cx = mx + px * mw, cy = my + py * mh;
      s.addShape(pres.shapes.OVAL, { x: cx - 0.2, y: cy - 0.48, w: 0.4, h: 0.4, fill: { color: DG }, line: { color: WH, width: 1.5 } });
      T(s, String(i + 1), { x: cx - 0.2, y: cy - 0.48, w: 0.4, h: 0.4, fontSize: 14, bold: true, color: LIME, align: 'center', valign: 'middle' });
    });
    T(s, 'HÀ NỘI', { x: mx + 0.43 * mw - 1.45, y: my + 0.206 * mh - 0.42, w: 1.2, h: 0.3, fontSize: 14, bold: true, color: DG, align: 'right' });
    T(s, 'NHA TRANG', { x: mx + 0.762 * mw - 1.55, y: my + 0.735 * mh - 0.42, w: 1.3, h: 0.3, fontSize: 14, bold: true, color: DG, align: 'right' });
    T(s, 'TP. HỒ CHÍ MINH', { x: mx + 0.541 * mw - 2.2, y: my + 0.838 * mh - 0.42, w: 1.95, h: 0.3, fontSize: 14, bold: true, color: DG, align: 'right' });
    const offices = [
      ['Trụ sở tại Hà Nội', 'office_hn', [['Tầng 12 - Tòa nhà Diamond Flower, ', { bold: true, color: GR }], 'số 48 đường Lê Văn Lương, Khu đô thị mới N1, phường Yên Hoà, TP Hà Nội']],
      ['Văn phòng tại Nha Trang', 'office_nt', [['B19-03 Khu Đô Thị An Bình Tân, ', { bold: true, color: GR }], 'Phường Nam Nha Trang, Tỉnh Khánh Hòa']],
      ['Trung tâm tuyển sinh tại TP.HCM', 'office_hcm', [['Số 28, D9 KDC Carric, ', { bold: true, color: GR }], 'phường An Khánh, Thành Phố Hồ Chí Minh']],
    ];
    const ox = 5.28, ow = W - M - ox;
    const ohs = [2.8, 2.55, 2.55];
    let oy = 1.45;
    offices.forEach(([t, p, addr], i) => {
      const oh = ohs[i];
      card(s, ox, oy, ow, oh);
      rr(s, ox, oy, ow, 0.46, DG, { rectRadius: 0.12 });
      rect(s, ox, oy + 0.3, ow, 0.16, DG);
      s.addShape(pres.shapes.OVAL, { x: ox + 0.1, y: oy + 0.07, w: 0.32, h: 0.32, fill: { color: LIME }, line: { type: 'none' } });
      T(s, String(i + 1), { x: ox + 0.1, y: oy + 0.07, w: 0.32, h: 0.32, fontSize: 12, bold: true, color: DG, align: 'center', valign: 'middle' });
      T(s, t, { x: ox + 0.5, y: oy, w: ow - 0.55, h: 0.46, fontSize: 13, bold: true, color: WH, valign: 'middle' });
      imgCover(s, A('crop/' + p + '.jpg'), ox + 0.12, oy + 0.56, ow - 0.24, 0.86);
      T(s, R(addr), { x: ox + 0.12, y: oy + 1.5, w: ow - 0.18, h: oh - 1.55, fontSize: 14 });
      oy += oh + 0.13;
    });
    rr(s, M, 9.74, CW, 1.3, MINT, { rectRadius: 0.1 });
    T(s, 'LIÊN HỆ NHANH', { x: 0.85, y: 9.8, w: 3, h: 0.3, fontSize: 12, bold: true, color: GR, charSpacing: 2 });
    const cc = [[fa.FaPhone, 'Hotline: 0827.695.368 · 0968.702.701'], [fa.FaEnvelope, 'Email: viencongnghestp@gmail.com'], [fa.FaGlobe, 'Website: www.vienstp.com']];
    for (let i = 0; i < 3; i++) {
      const y = 10.12 + i * 0.29;
      await iconAt(s, cc[i][0], HEX.accent1, 0.88, y + 0.04, 0.2);
      T(s, cc[i][1], { x: 1.2, y, w: 4.8, h: 0.28, fontSize: 13.5, bold: true, color: DG, valign: 'middle' });
    }
    s.addImage({ path: A('logo/qr_web.png'), x: W - M - 1.18, y: 9.82, w: 1.12, h: 1.12 });
  }

  // ============================================================== 20. LIÊN HỆ (BACK COVER)
  {
    const s = pres.addSlide({ masterName: 'COVER' });
    s.addImage({ path: A('logo/stp.png'), x: W / 2 - 0.95, y: 0.7, w: 1.9, h: 1.9 });
    T(s, 'VIỆN NGHIÊN CỨU PHÁT TRIỂN GIÁO DỤC & NGHỀ NGHIỆP STP', { x: 0.8, y: 2.75, w: W - 1.6, h: 0.65, fontSize: 18, bold: true, color: WH, align: 'center', valign: 'middle' });
    T(s, 'STP INSTITUTE OF EDUCATION AND PROFESSIONALS DEVELOPMENT RESEARCH', { x: 0.8, y: 3.4, w: W - 1.6, h: 0.3, fontSize: 11, color: SOFT, align: 'center', charSpacing: 1 });
    T(s, 'XIN CẢM ƠN!', { x: 0.8, y: 3.95, w: W - 1.6, h: 0.85, fontSize: 48, bold: true, color: LIME, align: 'center', valign: 'middle' });
    T(s, 'Hãy để Viện STP đồng hành cùng Quý cơ quan, doanh nghiệp trong hành trình phát triển nguồn nhân lực.', { x: 1.0, y: 4.85, w: W - 2.0, h: 0.6, fontSize: 14, color: WH, align: 'center' });
    rr(s, M, 5.75, CW, 4.95, WH, { fill: { color: WH, transparency: 8 } });
    T(s, 'THÔNG TIN LIÊN HỆ', { x: 0.9, y: 5.9, w: 4, h: 0.35, fontSize: 15, bold: true, color: GR, charSpacing: 2 });
    const info = [
      [fa.FaGlobe, 'Website', 'www.vienstp.com'],
      [fa.FaEnvelope, 'Email', 'viencongnghestp@gmail.com'],
      [fa.FaPhone, 'Hotline', '0827.695.368 · 0968.702.701'],
    ];
    for (let i = 0; i < info.length; i++) {
      const y = 6.38 + i * 0.5;
      await iconCircle(s, info[i][0], 0.9, y, 0.38, GR, HEX.lt1);
      T(s, R([[info[i][1] + ':  ', { color: MUTED }], [info[i][2], { bold: true, color: DG }]]), { x: 1.4, y: y - 0.03, w: 4.4, h: 0.44, fontSize: 14, valign: 'middle' });
    }
    rr(s, 6.12, 6.3, 1.3, 1.3, WH, { rectRadius: 0.05, line: { color: GR, width: 1.25 } });
    s.addImage({ path: A('logo/qr_web.png'), x: 6.17, y: 6.35, w: 1.2, h: 1.2 });
    T(s, 'Quét mã QR', { x: 6.0, y: 7.62, w: 1.55, h: 0.25, fontSize: 11, color: MUTED, align: 'center' });
    s.addShape(pres.shapes.LINE, { x: 0.9, y: 7.98, w: CW - 0.6, h: 0, line: { color: SOFT, width: 0.75 } });
    const adr = [
      ['Trụ sở tại Hà Nội: ', 'Tầng 12 - Tòa nhà Diamond Flower, số 48 đường Lê Văn Lương, Khu đô thị mới N1, phường Yên Hoà, TP Hà Nội'],
      ['Văn phòng tại Nha Trang: ', 'B19-03 Khu Đô Thị An Bình Tân, Phường Nam Nha Trang, Tỉnh Khánh Hòa'],
      ['Trung tâm tuyển sinh tại TP.HCM: ', 'Số 28, D9 KDC Carric, phường An Khánh, Thành Phố Hồ Chí Minh'],
    ];
    for (let i = 0; i < adr.length; i++) {
      const y = 8.12 + i * 0.84;
      await iconAt(s, fa.FaLocationDot, HEX.accent1, 0.92, y + 0.06, 0.28);
      T(s, R([[adr[i][0], { bold: true, color: GR }], adr[i][1]]), { x: 1.35, y, w: 6.1, h: 0.78, fontSize: 14 });
    }
  }

  await pres.writeFile({ fileName: OUT });
  await applyThemeColors(OUT, THEME);
  console.log('wrote', OUT);
}

// pptxgenjs writes Office's stock palette into the theme; scheme colors used above resolve
// against it, so replace the palette with THEME.colors.
async function applyThemeColors(file, theme) {
  const JSZip = require(require.resolve('jszip', { paths: [path.dirname(require.resolve('pptxgenjs'))] }));
  const zip = await JSZip.loadAsync(fs.readFileSync(file));
  const parts = Object.keys(zip.files).filter((n) => /^ppt\/theme\/theme\d+\.xml$/.test(n));
  for (const name of parts) {
    let xml = await zip.file(name).async('string');
    xml = xml.replace(/<a:clrScheme name="[^"]*">[\s\S]*?<\/a:clrScheme>/, (scheme) => {
      let out = scheme.replace(/<a:clrScheme name="[^"]*">/, `<a:clrScheme name="${theme.name}">`);
      for (const [slot, hex] of Object.entries(theme.colors)) {
        out = out.replace(new RegExp(`<a:${slot}>[\\s\\S]*?</a:${slot}>`), `<a:${slot}><a:srgbClr val="${hex}"/></a:${slot}>`);
      }
      return out;
    });
    zip.file(name, xml);
  }
  fs.writeFileSync(file, await zip.generateAsync({ type: 'nodebuffer', compression: 'DEFLATE' }));
}

build().catch((e) => { console.error(e); process.exit(1); });
