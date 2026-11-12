import json, base64
from playwright.sync_api import sync_playwright
import os
HERE = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(os.path.dirname(HERE))          # thư mục gói
OUTD = os.path.join(HERE, 'out'); os.makedirs(OUTD, exist_ok=True)   # ảnh chụp, file docx thử
SP = HERE
URL = 'file://' + ROOT + '/Tra_cuu_nhom_huan_luyen_ATVSLD_VienSTP_DAKO.html'
CHROME = '/opt/pw-browsers/chromium' if os.path.exists('/opt/pw-browsers/chromium') else None

errs=[]
with sync_playwright() as p:
    b=p.chromium.launch(executable_path=CHROME)
    pg=b.new_context(viewport={'width':1366,'height':900}).new_page()
    pg.on('pageerror', lambda e: errs.append(str(e)))
    pg.on('console', lambda m: errs.append(m.text) if m.type=='error' else None)
    pg.goto(URL); pg.wait_for_timeout(300)
    res=pg.evaluate("""async()=>{
      const out=[];
      for(const ind of STP.IND){
        STP.S.ind=ind.id; STP.S.picker=false; STP.S.selBy[ind.id]={};
        STP.S.cust.heads='300'; STP.S.cust.type=''; STP.S.cust.name='Test '+ind.id;
        ind.blocks.forEach(b=>b.rows.forEach(r=>STP.pickRow(r.id,true)));
        STP.renderAll();
        ['table','sum','content'].forEach(t=>{});
        const m=STP.buildModel();
        let blob=null, err=null;
        try{ blob=await STP.makeDoc(STP.presetOpts('int')); }catch(e){ err=String(e); }
        let b64=null;
        if(blob){ const buf=new Uint8Array(await blob.arrayBuffer()); let s=''; for(let i=0;i<buf.length;i+=8192) s+=String.fromCharCode.apply(null,buf.subarray(i,i+8192)); b64=btoa(s); }
        out.push({id:ind.id,name:ind.name,rows:m.rows.length,clusters:m.clusters.length,noCl:m.noCl.length,used:m.usedGroups,err,size:blob?blob.size:0,b64:(ind.id==='01'||ind.id==='05'||ind.id==='17'||ind.id==='12')?b64:null});
      }
      return out;}""")
    for r in res:
        b64=r.pop('b64')
        if b64: open(OUTD+'/all_%s.docx'%r['id'],'wb').write(base64.b64decode(b64))
        print(r)
    b.close()
print('ERRS',errs)
