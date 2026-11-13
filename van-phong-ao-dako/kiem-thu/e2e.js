const { chromium } = require('playwright');
const fs = require('fs'), path = require('path'), crypto = require('crypto');
const SP = process.argv[2], PAGE = process.argv[3];
const sha = b => crypto.createHash('sha256').update(b).digest('hex');
const ok = (c, m) => { console.log((c ? 'PASS ' : 'FAIL ') + m); if (!c) process.exitCode = 1; };
(async () => {
  const body = fs.readFileSync(PAGE, 'utf8');
  const html = `<!doctype html><html><head><meta charset=utf8><meta name=viewport content="width=device-width,initial-scale=1,viewport-fit=cover"><style>:root{color-scheme:light}body{margin:0}img{max-width:100%}[hidden]{display:none!important}</style></head><body>${body}</body></html>`;
  const three = fs.readFileSync(path.join(SP, 'three_x/package/build/three.min.js'));
  const mock = fs.readFileSync(path.join(SP, 'test/mock.js'), 'utf8');
  const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--ignore-gpu-blocklist'] });
  async function open(mcfg, vp = { width: 1440, height: 900 }) {
    const ctx = await browser.newContext({ viewport: vp, deviceScaleFactor: 1 });
    const page = await ctx.newPage(); const errs = [];
    page.on('pageerror', e => errs.push('pageerror: ' + e.message));
    page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()); });
    await page.addInitScript(`window.__MOCK=${JSON.stringify(mcfg)};\n${mock}`);
    await page.route('https://cdnjs.cloudflare.com/**', r => r.fulfill({ body: three, contentType: 'application/javascript' }));
    await page.route('http://localhost:9999/', r => r.fulfill({ body: html, contentType: 'text/html' }));
    await page.goto('http://localhost:9999/'); await page.waitForTimeout(1500);
    return { page, ctx, errs };
  }
  const xlsx = crypto.randomBytes(230 * 1024), jpg = crypto.randomBytes(180 * 1024), zip = crypto.randomBytes(21 * 1024 * 1024 + 777);
  const files = [{ name: 'DS hoc vien Newstar.xlsx', mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', buffer: xlsx },
    { name: 'Ảnh Nguyễn Văn A.jpg', mimeType: 'image/jpg', buffer: jpg }, { name: 'Anh_3x4.zip', mimeType: 'application/zip', buffer: zip }];

  // A. Đủ năng lực
  { const { page, ctx, errs } = await open({});
    await page.setInputFiles('#file', files);
    ok((await page.locator('#attList .att').count()) === 3, 'A: 3 tệp hiện trong danh sách đính kèm');
    await page.fill('#input', 'In thẻ ATLĐ nhóm 3 cho Công ty TNHH Newstar, học từ 12/11/2026');
    await page.press('#input', 'Enter');
    await page.waitForSelector('.tcard [data-act="run"]', { timeout: 60000 });
    const st = await page.evaluate(() => { const out = []; for (const [k, v] of window.__db.store) out.push([k, v]); return out; });
    const me = st.find(([k, v]) => k.startsWith('msgs/') && v.who === 'anh');
    ok(me && me[1].files.length === 3, 'A: tin nhắn của anh lưu đủ 3 tệp');
    const fz = me && me[1].files.find(f => f.name === 'Anh_3x4.zip'), fj = me && me[1].files.find(f => f.name.endsWith('.jpg')), fx = me && me[1].files.find(f => f.name.endsWith('.xlsx'));
    ok(fz && fz.parts && fz.parts.length === 3 && fz.enc === 'b64', 'A: zip 21 MB cắt thành 3 phần base64');
    ok(fj && fj.type === 'image/jpeg' && fj.enc === 'raw', 'A: ảnh image/jpg được đổi thành image/jpeg, tải nguyên tệp');
    ok(fx && fx.enc === 'b64' && fx.store === 'assets', 'A: Excel lưu base64 trong kho tệp');
    const task = st.find(([k, v]) => k.startsWith('tasks/'));
    ok(task && task[1].files.length === 3 && task[1].staff === 'cc_the', 'A: phiếu việc gắn đúng Bảo và đủ tệp');
    ok((await page.evaluate(() => window.__prompts[0] || '')).includes('Anh_3x4.zip'), 'A: trợ lý thấy tên tệp');
    ok((await page.inputValue('#input')) === '', 'A: ô nhập được xóa sau khi gửi');
    await page.click('.tcard [data-act="run"]'); await page.waitForTimeout(400);
    const call = await page.evaluate(() => window.__calls.find(c => c.tool === 'create_session'));
    ok(call && /PHIẾU GIAO VIỆC/.test(call.input.prompt) && call.input.prompt.includes(fz.parts.join(', ')) && call.input.environment_id && call.input.source_url, 'A: mở phiên Claude Code với phiếu có đủ thông tin tệp');
    const tid = task[0].split('/')[1];
    const t2 = await page.evaluate(id => window.__db.store.get('tasks/' + id), tid);
    ok(t2.status === 'dang_lam' && t2.sessionId === 'session_TEST123', 'A: việc chuyển sang Đang làm, có mã phiên');
    // Giả lập phiên Claude Code trả kết quả (như kỹ năng van-phong-dako)
    await page.evaluate(([id, fx, fz]) => { const db = window.__db.db; const thread = window.__db.store.get('tasks/' + id).thread;
      const result = { text: 'Dạ anh, em đã in **8 thẻ** cho Newstar.\n- 1 tờ A4\n- **Cần anh xem:** thiếu ảnh 1 người', files: [fx, fz], next: [{ label: 'Làm sổ cấp đợt này', staff: 'cc_socap', command: 'Làm sổ cấp cho đợt thẻ Newstar vừa in' }], at: new Date().toISOString() };
      db.doc('tasks/' + id).update({ status: 'cho_duyet', result });
      db.doc('msgs/mres1').set({ t: new Date().toISOString(), thread, who: 'cc_the', kind: 'result', taskId: id, text: result.text, files: result.files, next: result.next }); }, [tid, fx, fz]);
    await page.waitForSelector('[data-act="approve"]');
    ok((await page.locator('#reviewCount').innerText()) === '1', 'A: Bàn duyệt báo 1 việc chờ');
    await page.locator('.k-result .file').nth(1).click();
    await page.waitForFunction(() => window.__saved.length >= 1, null, { timeout: 30000 });
    await page.locator('.k-result .file').nth(0).click();
    await page.waitForFunction(() => window.__saved.length >= 2, null, { timeout: 30000 });
    const saved = await page.evaluate(() => window.__saved);
    ok(saved.some(s => s.filename === 'Anh_3x4.zip' && s.sha === sha(zip)), 'A: tải về zip 3 phần ghép lại đúng từng byte');
    ok(saved.some(s => s.filename === 'DS hoc vien Newstar.xlsx' && s.sha === sha(xlsx)), 'A: tải về Excel đúng từng byte');
    await page.screenshot({ path: path.join(SP, 'test/e2e-result.png') });
    await page.click('[data-act="approve"]'); await page.waitForTimeout(200);
    ok((await page.evaluate(id => window.__db.store.get('tasks/' + id).status, tid)) === 'xong', 'A: Duyệt – kết thúc đóng việc');
    await page.click('.chip[data-act="next"]');
    ok((await page.inputValue('#input')).includes('sổ cấp'), 'A: bấm việc tiếp theo điền sẵn lệnh cho Đức');
    ok(/Đức/.test(await page.locator('#whoBtn').innerText()), 'A: người nhận chuyển sang Đức');
    ok(!errs.length, 'A: không có lỗi JavaScript ' + errs.join(' | '));
    await ctx.close(); }

  // B. Không có kho tệp, chỉ có kho dữ liệu
  { const { page, ctx, errs } = await open({ noAssets: true });
    ok(await page.locator('#capBanner').isVisible(), 'B: báo tệp lưu vào kho dự phòng');
    await page.setInputFiles('#file', [files[0]]);
    await page.fill('#input', 'In thẻ nhóm 3 cho Newstar'); await page.press('#input', 'Enter');
    await page.waitForSelector('.tcard', { timeout: 30000 });
    const me = await page.evaluate(() => [...window.__db.store].find(([k, v]) => k.startsWith('msgs/') && v.who === 'anh')[1]);
    const f = me.files[0];
    ok(f && f.store === 'db' && f.nparts >= 1, 'B: Excel lưu vào kho dữ liệu theo phần');
    await page.locator('.msg.me .file').first().click(); await page.waitForTimeout(500);
    ok((await page.evaluate(() => window.__saved))[0].sha === sha(xlsx), 'B: tải về từ kho dữ liệu đúng từng byte');
    await page.setInputFiles('#file', [{ name: 'Lon.zip', mimeType: 'application/zip', buffer: crypto.randomBytes(13 * 1024 * 1024) }]);
    await page.fill('#input', 'Gửi ảnh'); await page.press('#input', 'Enter'); await page.waitForTimeout(800);
    ok(await page.locator('#compErr').isVisible() && /12 MB/.test(await page.locator('#compErr').innerText()), 'B: tệp 13 MB báo lỗi rõ, không gửi');
    ok((await page.inputValue('#input')) === 'Gửi ảnh', 'B: giữ nguyên lời nhắn khi chưa gửi được');
    ok(!errs.length, 'B: không có lỗi JavaScript ' + errs.join(' | '));
    await ctx.close(); }

  // C. Mở ngoài khung xem của Claude (không có window.claude)
  { const { page, ctx, errs } = await open({ none: true });
    await page.waitForTimeout(300);
    await page.click('#capBanner summary'); ok(await page.locator('#capBanner').isVisible() && /ngoài khung xem/.test(await page.locator('#capBanner').innerText()), 'C: hiện hướng dẫn mở đúng chỗ');
    await page.setInputFiles('#file', [files[0]]);
    ok(await page.locator('#compErr').isVisible(), 'C: báo ngay không lưu được tệp');
    await page.fill('#input', 'In thẻ nhóm 3'); await page.press('#input', 'Enter'); await page.waitForTimeout(500);
    ok((await page.inputValue('#input')) === 'In thẻ nhóm 3' && (await page.locator('#attList .a-bad').count()) === 1, 'C: không mất lời nhắn, tệp đánh dấu lỗi');
    await page.click('#attList [data-act="rmatt"]'); await page.press('#input', 'Enter'); await page.waitForTimeout(500);
    ok((await page.locator('.tcard').count()) === 1, 'C: bỏ tệp lỗi thì vẫn giao việc được (sao chép phiếu)');
    await page.screenshot({ path: path.join(SP, 'test/e2e-outside.png') });
    ok(!errs.length, 'C: không có lỗi JavaScript ' + errs.join(' | '));
    await ctx.close(); }

  // D. Kho tệp lỗi tạm thời rồi gửi lại
  { const { page, ctx, errs } = await open({});
    await page.evaluate(() => { window.__assetsFail = 'store_unavailable'; });
    await page.setInputFiles('#file', [files[1]]);
    await page.fill('#input', 'In thẻ nhóm 3 Newstar'); await page.press('#input', 'Enter'); await page.waitForTimeout(500);
    ok(/tạm lỗi/.test(await page.locator('#compErr').innerText()), 'D: báo kho tệp tạm lỗi');
    await page.evaluate(() => { window.__assetsFail = null; });
    await page.click('#send'); await page.waitForSelector('.tcard', { timeout: 20000 });
    ok(!(await page.locator('#compErr').isVisible()), 'D: gửi lại thành công, hết báo lỗi');
    ok(!errs.length, 'D: không có lỗi JavaScript ' + errs.join(' | '));
    await ctx.close(); }

  // E. Điện thoại: chọn tệp từ Phiếu giao việc
  { const { page, ctx, errs } = await open({}, { width: 390, height: 844 });
    await page.click('#btnAssign');
    await page.selectOption('#asWho', 'gv_dsdd');
    await page.fill('#asText', 'Làm danh sách điểm danh cho Newstar, học 12/11 đến 14/11/2026');
    await page.setInputFiles('#asFiles', [files[0]]);
    await page.click('#assignForm button[type=submit]');
    await page.waitForSelector('.tcard', { timeout: 20000 });
    const me = await page.evaluate(() => [...window.__db.store].find(([k, v]) => k.startsWith('msgs/') && v.who === 'anh')[1]);
    ok(me.files.length === 1 && me.to === 'gv_dsdd', 'E: Phiếu giao việc gửi tệp cho Mai');
    const box = await page.locator('.pick').boundingBox();
    ok(box && box.width >= 30, 'E: nút đính kèm bấm được trên điện thoại');
    await page.screenshot({ path: path.join(SP, 'test/e2e-phone.png') });
    ok(!errs.length, 'E: không có lỗi JavaScript ' + errs.join(' | '));
    await ctx.close(); }

  // F. Xin quyền dùng Claude Code Remote
  async function makeTask(page) {
    await page.fill('#input', 'In thẻ ATLĐ nhóm 3 cho Công ty KAT, học 12/11/2026'); await page.press('#input', 'Enter');
    await page.waitForSelector('.tcard [data-act="run"]', { timeout: 20000 });
    return page.evaluate(() => [...window.__db.store].find(([k]) => k.startsWith('tasks/'))[0].split('/')[1]);
  }
  const creates = page => page.evaluate(() => window.__calls.filter(c => c.tool === 'create_session').length);
  const status = (page, id) => page.evaluate(id => window.__db.store.get('tasks/' + id).status, id);
  { const { page, ctx, errs } = await open({ perm: 'prompt', permAnswer: 'granted', enforce: true });
    ok(await page.locator('#capBanner [data-act="grant"]').isVisible(), 'F1: hiện nút Cho phép ngay khi chưa cấp quyền');
    const id = await makeTask(page); await page.click('.tcard [data-act="run"]'); await page.waitForTimeout(600);
    ok((await page.evaluate(() => window.__permAsked)) === 1 && (await creates(page)) === 1 && (await status(page, id)) === 'dang_lam', 'F1: hỏi quyền một lần, anh cho phép, mở phiên ngay');
    ok(!(await page.locator('#capBanner').isVisible()), 'F1: hết thông báo xin quyền sau khi cho phép');
    ok(!errs.length, 'F1: không có lỗi JavaScript ' + errs.join(' | ')); await ctx.close(); }
  { const { page, ctx, errs } = await open({ perm: 'prompt', permAnswer: 'prompt', enforce: true });
    const id = await makeTask(page); await page.click('.tcard [data-act="run"]'); await page.waitForTimeout(600);
    ok((await creates(page)) === 0 && (await status(page, id)) === 'moi', 'F2: hộp hỏi bị đóng → chưa gửi lệnh, việc vẫn chờ giao');
    ok(await page.locator('.msg [data-act="grant"]').isVisible() && /chưa có phiên nào được tạo/.test(await page.locator('#msgs').innerText()), 'F2: báo đúng lý do, có nút Cho phép và giao lại');
    ok(!errs.length, 'F2: không có lỗi JavaScript ' + errs.join(' | ')); await ctx.close(); }
  { const { page, ctx, errs } = await open({ perm: 'denied', enforce: true });
    ok(/đang tắt/.test(await page.locator('#capBanner').innerText()), 'F3: báo quyền đang tắt');
    const id = await makeTask(page); await page.click('.tcard [data-act="run"]'); await page.waitForTimeout(500);
    ok((await creates(page)) === 0 && (await page.locator('.msg [data-act="permpanel"]').count()) >= 1, 'F3: quyền bị tắt → có nút Mở bảng quyền, không gửi lệnh');
    await page.locator('.msg [data-act="permpanel"]').first().click(); await page.waitForTimeout(200);
    ok((await page.evaluate(() => window.__panel)) === 1, 'F3: mở được bảng quyền');
    await page.locator('.msg [data-act="queue"]').first().click(); await page.waitForTimeout(300);
    ok((await status(page, id)) === 'hang_cho', 'F3: đưa vào hàng chờ được');
    ok(!errs.length, 'F3: không có lỗi JavaScript ' + errs.join(' | ')); await ctx.close(); }
  { const { page, ctx, errs } = await open({ noPerms: true, failOnce: true });
    const id = await makeTask(page); await page.click('.tcard [data-act="run"]'); await page.waitForTimeout(900);
    ok((await creates(page)) === 2 && (await status(page, id)) === 'dang_lam', 'F4: lần đầu bị chặn quyền → tự thử lại, mở phiên thành công');
    ok(!errs.length, 'F4: không có lỗi JavaScript ' + errs.join(' | ')); await ctx.close(); }
  { const { page, ctx, errs } = await open({ noPerms: true, perm: 'prompt', enforce: true });
    const id = await makeTask(page); await page.click('.tcard [data-act="run"]'); await page.waitForTimeout(900);
    ok((await creates(page)) === 2 && (await status(page, id)) === 'moi' && await page.locator('.msg [data-act="grant"]').isVisible(), 'F5: vẫn chưa có quyền sau khi thử lại → báo xin quyền, không báo nhầm là đã tạo phiên');
    await page.screenshot({ path: path.join(SP, 'test/e2e-perm.png') });
    ok(!errs.length, 'F5: không có lỗi JavaScript ' + errs.join(' | ')); await ctx.close(); }
  await browser.close();
})().catch(e => { console.error(e); process.exit(1); });
