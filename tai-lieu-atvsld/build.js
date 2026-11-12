#!/usr/bin/env node
// Dựng tài liệu ATVSLĐ gửi doanh nghiệp theo khung chuẩn.
//
//   node tai-lieu-atvsld/build.js 01            -> tai-lieu-atvsld/<tenFile>.docx (nội dung: nganh/01_*.js)
//   node tai-lieu-atvsld/build.js 01 --pdf      -> thêm bản PDF (cần LibreOffice)
//   node tai-lieu-atvsld/build.js 01 --out DIR  -> ghi vào thư mục khác (để xem thử, không đè bản chính)
//
// Khung định dạng: khung/khung_tai_lieu.js. Mô tả chuẩn: CHUAN.md.

const fs = require('fs');
const os = require('os');
const path = require('path');
const { execFileSync } = require('child_process');
const { Packer } = require('docx');
const { taoTaiLieu } = require('./khung/khung_tai_lieu');

const args = process.argv.slice(2);
const so = args.find((a) => /^\d{2}$/.test(a));
const xuatPdf = args.includes('--pdf');
const outIdx = args.indexOf('--out');
const outDir = path.resolve(outIdx >= 0 ? args[outIdx + 1] : __dirname);

if (!so) {
  console.error('Thiếu số tài liệu, ví dụ: node tai-lieu-atvsld/build.js 01 [--pdf] [--out DIR]');
  process.exit(1);
}
const thuMucNganh = path.join(__dirname, 'nganh');
const fileNganh = fs.readdirSync(thuMucNganh).find((f) => f.startsWith(`${so}_`) && f.endsWith('.js'));
if (!fileNganh) {
  console.error(`Không có file nội dung nganh/${so}_*.js`);
  process.exit(1);
}
const nd = require(path.join(thuMucNganh, fileNganh));

// Kiểm tra đủ các phần bắt buộc của khung
const BAT_BUOC = ['tenFile', 'tieuDeFile', 'moTaFile', 'dauTrang', 'chanTrang', 'bia', 'muc1', 'muc2', 'muc3', 'muc4', 'muc5', 'muc6', 'muc7'];
const thieu = BAT_BUOC.filter((k) => !nd[k]);
if (thieu.length) {
  console.error(`File ${fileNganh} thiếu: ${thieu.join(', ')}`);
  process.exit(1);
}
if (nd.bia.diemChinh.length !== 5) console.warn('Lưu ý: chuẩn dùng đúng 5 điều cần biết ở trang 1.');
if (nd.muc1.nhom.length !== 6) console.warn('Lưu ý: mục 1 phải đủ 6 nhóm.');
if (nd.muc2.bonCauHoi.length !== 4) console.warn('Lưu ý: khung tự xếp nhóm dùng đúng 4 câu hỏi.');
if (nd.muc4.dichVu.length % 2) console.warn('Lưu ý: mục 4 nên có số ô chẵn (lưới 2 cột).');
if (nd.muc6.quyTrinh.length !== 6 || nd.muc6.nhanDuoc.length !== 3) console.warn('Lưu ý: mục 6 dùng 6 bước và 3 ô "nhận được".');
if (JSON.stringify(nd).includes('Phiếu')) console.warn('Lưu ý: chuẩn không có phiếu chuẩn bị thông tin – kiểm tra lại chỗ nhắc tới "Phiếu".');

fs.mkdirSync(outDir, { recursive: true });
const docxPath = path.join(outDir, `${nd.tenFile}.docx`);

Packer.toBuffer(taoTaiLieu(nd)).then((buf) => {
  fs.writeFileSync(docxPath, buf);
  console.log('Đã ghi', docxPath, `${(buf.length / 1024).toFixed(1)} KB`);
  if (!xuatPdf) return;
  // LibreOffice: hồ sơ người dùng tạm để chạy được cả khi chưa từng mở LibreOffice
  const profile = fs.mkdtempSync(path.join(os.tmpdir(), 'lo_profile_'));
  try {
    execFileSync('soffice', [`-env:UserInstallation=file://${profile}`, '--headless', '--convert-to', 'pdf', '--outdir', outDir, docxPath],
      { stdio: 'ignore', env: { ...process.env, SAL_USE_VCLPLUGIN: 'svp' }, timeout: 180000 });
    console.log('Đã ghi', docxPath.replace(/\.docx$/, '.pdf'));
  } catch (e) {
    console.error('Không xuất được PDF bằng LibreOffice; mở file Word và chọn Lưu thành PDF.');
  } finally {
    fs.rmSync(profile, { recursive: true, force: true });
  }
});
