// Render khung hình từ index.html → MP4 (H.264) qua ffmpeg.
// node render.js video <out.mp4> [startSec] [endSec]
// node render.js snap <outDir> t1 t2 ...
const path = require('path');
const { chromium } = require(process.env.PLAYWRIGHT || 'playwright');
const { spawn } = require('child_process');
const FPS = 30;
const URL = process.env.URL || 'http://127.0.0.1:8123/index.html';

(async () => {
  const [mode, out, ...rest] = process.argv.slice(2);
  const browser = await chromium.launch();
  const page = await browser.newPage({ viewport: { width: 1920, height: 1080 }, deviceScaleFactor: 1 });
  page.on('pageerror', (e) => console.error('PAGE ERROR', e.message));
  page.on('console', (m) => { if (m.type() === 'error') console.error('CONSOLE', m.text()); });
  await page.goto(URL);
  await page.waitForFunction(() => window.__ready === true, null, { timeout: 120000 });
  const dur = await page.evaluate(() => window.__duration);
  if (mode === 'info') {
    const marks = await page.evaluate(() => window.__marks);
    require('fs').writeFileSync(out, JSON.stringify({ duration: dur, fps: FPS, marks }, null, 1));
    console.log('duration', dur, 'marks', marks.length);
  } else if (mode === 'snap') {
    require('fs').mkdirSync(out, { recursive: true });
    for (const s of rest) {
      const t = parseFloat(s);
      await page.evaluate((t) => window.__seek(t), t);
      await page.screenshot({ path: path.join(out, `t${t.toFixed(2).padStart(7, '0')}.jpg`), type: 'jpeg', quality: 85 });
    }
  } else {
    const t0 = parseFloat(rest[0] ?? 0), t1 = parseFloat(rest[1] ?? dur);
    const f0 = Math.round(t0 * FPS), f1 = Math.round(t1 * FPS);
    const ff = spawn(process.env.FFMPEG || 'ffmpeg', ['-y', '-loglevel', 'error', '-f', 'image2pipe', '-framerate', String(FPS), '-c:v', 'mjpeg', '-i', '-',
      '-c:v', 'libx264', '-preset', 'slow', '-crf', '17', '-pix_fmt', 'yuv420p', '-r', String(FPS), out], { stdio: ['pipe', 'inherit', 'inherit'] });
    const start = Date.now();
    for (let f = f0; f < f1; f++) {
      await page.evaluate((t) => window.__seek(t), f / FPS);
      const buf = await page.screenshot({ type: 'jpeg', quality: 95 });
      if (!ff.stdin.write(buf)) await new Promise((r) => ff.stdin.once('drain', r));
      if ((f - f0) % 150 === 0) console.log(`${out}: frame ${f - f0}/${f1 - f0} (${((Date.now() - start) / 1000).toFixed(0)}s)`);
    }
    ff.stdin.end();
    await new Promise((r) => ff.on('close', r));
  }
  await browser.close();
})().catch((e) => { console.error(e); process.exit(1); });
