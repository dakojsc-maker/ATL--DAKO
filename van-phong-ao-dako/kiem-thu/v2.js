const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const SP = process.argv[2], PAGE = process.argv[3];
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const body = fs.readFileSync(PAGE, 'utf8');
  const html = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`;
  const three = fs.readFileSync(path.join(SP, 'three_x/package/build/three.min.js'));
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  for (const run of [{ name: 'v2-desk', vp: { width: 1440, height: 900 } }, { name: 'v2-phone', vp: { width: 390, height: 844 }, mobile: true }]) {
    const ctx = await browser.newContext({ viewport: run.vp, deviceScaleFactor: 1, isMobile: !!run.mobile, hasTouch: !!run.mobile });
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push(e.message)); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
    await ctx.route('https://claude.ai/**', r => r.fulfill({ body: 'chat', contentType: 'text/html' }));
    await page.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ body: three, contentType: 'application/javascript' }));
    await page.route('http://localhost:9999/', r => r.fulfill({ body: html, contentType: 'text/html' }));
    await page.goto('http://localhost:9999/'); await page.waitForTimeout(2000);
    ok((await page.evaluate(() => document.documentElement.scrollWidth - innerWidth)) <= 0, run.name + ': không tràn ngang');
    await page.screenshot({ path: path.join(SP, `test/${run.name}.png`) });
    if (!run.mobile) {
      const pos = await page.evaluate(() => { const st = document.querySelector('#stage').getBoundingClientRect(); const p = Office.project(Office.anchor('nv1')); return { x: st.left + p.x, y: st.top + p.y + 35 }; });
      await page.mouse.move(pos.x, pos.y); await page.waitForTimeout(300);
      const tip = await page.locator('#tip').innerText().catch(() => '');
      ok(await page.locator('#tip').isVisible() && /Kết quả đầu ra/i.test(tip) && /Thẻ an toàn lao động nhóm 3/.test(tip), 'rê chuột vào Bảo hiện danh sách đầu ra');
      await page.screenshot({ path: path.join(SP, 'test/v2-hover.png') });
      const [popup] = await Promise.all([ctx.waitForEvent('page', { timeout: 5000 }).catch(() => null), page.mouse.click(pos.x, pos.y)]);
      ok(popup && popup.url() === 'https://claude.ai/share/9cd7242d-0da5-41d5-b482-01cd5a61e254', 'bấm vào Bảo mở đúng phiên chat ' + (popup ? popup.url() : 'không mở'));
      await page.waitForTimeout(300);
      ok(await page.locator('#pinned').isVisible() && /Mrs\. Nga giao việc cho Bảo/.test(await page.locator('#pinned').innerText()), 'hiện thẻ có nút mở phiên chat dự phòng');
      await page.click('[data-giver-btn="lich"]'); await page.waitForTimeout(200);
      ok(/Mr\. Lịch giao việc cho Bảo/.test(await page.locator('#pinned').innerText()) && /Mr\. Lịch/.test(await page.locator('#giverName').innerText()), 'đổi người giao việc sang Mr. Lịch');
      const links = await page.$$eval('#staffList a', as => as.map(a => a.href));
      ok(links.length === 5 && links[4] === 'https://claude.ai/share/2a309b07-6129-442b-82b3-2f5db83ced10', 'danh sách bên phải có đủ 5 link đúng');
      await page.hover('#staffList .staff-card:nth-child(3)'); await page.waitForTimeout(200);
      ok(await page.locator('#staffList .staff-card:nth-child(3) .sc-out').isVisible(), 'rê chuột vào thẻ nhân viên bên phải hiện đầu ra');
      await page.screenshot({ path: path.join(SP, 'test/v2-pinned.png') });
    } else {
      const pos = await page.evaluate(() => { const st = document.querySelector('#stage').getBoundingClientRect(); const p = Office.project(Office.anchor('nv3')); return { x: st.left + p.x, y: st.top + p.y + 30 }; });
      await page.touchscreen.tap(pos.x, pos.y); await page.waitForTimeout(400);
      ok(await page.locator('#pinned').isVisible() && /Ngọc/.test(await page.locator('#pinned').innerText()), 'điện thoại: chạm vào nhân viên hiện đầu ra và nút mở chat');
      await page.screenshot({ path: path.join(SP, 'test/v2-phone-tap.png') });
    }
    ok(!errs.length, run.name + ': không lỗi JavaScript ' + errs.join(' | '));
    await ctx.close();
  }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
