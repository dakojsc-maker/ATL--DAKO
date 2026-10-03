// node tools/patch_ui.js  → assets/ph/ui_lookup_cn.png, ui_dash_cn.png (đổi sang .jpg bằng ffmpeg) (chữ "chứng chỉ" → "chứng nhận")
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const fs = require('fs');
(async () => {
  const b = await chromium.launch(); const p = await b.newPage();
  await p.goto(`http://127.0.0.1:${process.env.PORT || 8130}/tools/patch_ui.html`);
  await p.waitForFunction(() => window.ready);
  const out = await p.evaluate(() => window.run());
  for (const [n, d] of Object.entries(out)) fs.writeFileSync(`assets/ph/${n}_cn.png`, Buffer.from(d.split(',')[1], 'base64'));
  await b.close();
})();
