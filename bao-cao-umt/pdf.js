const { chromium } = require('playwright');
const path = require('path');
const FILE = 'file://' + path.join(__dirname, 'UMT_Ho-so-tham-dinh.html');
const OUT = path.join(__dirname, 'UMT_Ho-so-tham-dinh.pdf');
(async () => {
  const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined });
  const ctx = await browser.newContext({ colorScheme: 'light', viewport: { width: 1200, height: 900 } });
  const page = await ctx.newPage();
  await page.goto(FILE, { waitUntil: 'networkidle', timeout: 60000 });
  await page.evaluate(() => document.fonts.ready);
  await page.emulateMedia({ media: 'print', colorScheme: 'light' });
  await page.pdf({
    path: OUT, format: 'A4', printBackground: true,
    margin: { top: '14mm', bottom: '16mm', left: '13mm', right: '13mm' },
    displayHeaderFooter: true,
    headerTemplate: '<div></div>',
    footerTemplate: '<div style="width:100%;font-size:8px;color:#6a7487;padding:0 13mm;display:flex;justify-content:space-between;font-family:DejaVu Sans,Arial,sans-serif"><span>UMT · Hồ sơ thẩm định sơ bộ · Bảo mật · Dữ liệu đến 27/10/2026</span><span><span class="pageNumber"></span>/<span class="totalPages"></span></span></div>',
  });
  await browser.close();
  console.log('pdf written', OUT);
})().catch(e => { console.error(e); process.exit(1); });
