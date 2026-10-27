const { chromium } = require('playwright');
(async()=>{
  const [,, html, out, w] = process.argv;
  const b = await chromium.launch();
  const p = await b.newPage({viewport:{width:parseInt(w||'772'),height:400},deviceScaleFactor:3});
  await p.goto('file://'+html);
  await p.waitForTimeout(300);
  const el = await p.$('body');
  await el.screenshot({path:out});
  await b.close(); console.log('shot',out);
})();
