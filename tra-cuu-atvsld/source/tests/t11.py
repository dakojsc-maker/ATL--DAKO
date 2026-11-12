import json
from playwright.sync_api import sync_playwright
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))          # thư mục gói
OUTD = os.path.join(HERE, 'out'); os.makedirs(OUTD, exist_ok=True)   # ảnh chụp, file docx thử
SP = HERE
URL = 'file://' + ROOT + '/Tra_cuu_nhom_huan_luyen_ATVSLD_VienSTP_DAKO.html'
CHROME = '/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None

errs=[]
def clickjs(pg,sel,i=0):
    pg.evaluate("([s,i])=>{const e=document.querySelectorAll(s)[i]; e.scrollIntoView({block:'center'}); e.click()}",[sel,i])
def run(name, vp, mobile):
    with sync_playwright() as p:
        b=p.chromium.launch(executable_path=CHROME)
        ctx=b.new_context(viewport=vp, device_scale_factor=2 if mobile else 1, is_mobile=mobile, has_touch=mobile, accept_downloads=True)
        pg=ctx.new_page()
        pg.on('pageerror', lambda e: errs.append(str(e)))
        pg.on('console', lambda m: errs.append(m.text) if m.type in('error',) else None)
        pg.goto(URL); pg.wait_for_timeout(300)
        clickjs(pg,'button[data-act="ind"][data-id="01"]'); pg.wait_for_timeout(200)
        pg.fill('#f-q','công nhân'); pg.wait_for_timeout(250)
        print(name,'banner:',pg.inner_text('#find-top .cnt'))
        pg.screenshot(path=OUTD+f'/{name}_a1.png')
        pg.fill('#f-q','phụ hồ'); pg.wait_for_timeout(250)
        print(name,'banner:',pg.inner_text('#find-top .cnt'))
        print(pg.inner_text('#find-list')[:600])
        pg.screenshot(path=OUTD+f'/{name}_a2.png')
        pg.fill('#f-q','thợ'); pg.wait_for_timeout(250)
        print(name,'thợ banner:',pg.inner_text('#find-top .cnt'))
        # no row name contains thời
        print('names:',pg.eval_on_selector_all('#find-list .rr-name','e=>e.map(x=>x.innerText)')[:40])
        pg.screenshot(path=OUTD+f'/{name}_a3.png')
        # add 3 rows then phụ hồ
        pg.fill('#f-q','công nhân'); pg.wait_for_timeout(200)
        for i in [0,1,2]: clickjs(pg,'#find-list .add',i)
        pg.fill('#f-q','phụ hồ'); pg.wait_for_timeout(200)
        clickjs(pg,'#find-list .add',0)
        pg.fill('#f-q','trưởng'); pg.wait_for_timeout(200)
        clickjs(pg,'#find-list .add',0); clickjs(pg,'#find-list .add',1)
        pg.wait_for_timeout(200)
        if mobile: clickjs(pg,'.bottom-nav button[data-view="list"]')
        else: clickjs(pg,'#tabs button[data-view="list"]')
        pg.wait_for_timeout(300)
        ids=pg.eval_on_selector_all('#list-rows .sc','e=>e.map(x=>x.dataset.id)')
        print(name,'selected',ids)
        for k,i in enumerate(ids):
            pg.fill('input[data-in="n"][data-id="%s"]'%i,str(20+k*10))
        pg.fill('#cust-name','Công ty TNHH Xây dựng ABC') if pg.locator('#cust-name').is_visible() else None
        pg.wait_for_timeout(200)
        pg.screenshot(path=OUTD+f'/{name}_a4.png', full_page=True)
        print(pg.inner_text('#print-area')[:1500] if not mobile else '')
        if not mobile:
            pg.click('button[data-act="export"]'); pg.wait_for_timeout(200)
            with pg.expect_download() as dl: pg.click('#x-go')
            dl.value.save_as(OUTD+'/n2_out.docx'); print('docx ok')
        print(name,'overflow',pg.evaluate("document.documentElement.scrollWidth-document.documentElement.clientWidth"))
        b.close()
run('dk',{'width':1366,'height':900},False)
run('mb',{'width':390,'height':844},True)
print('ERRS',errs)
