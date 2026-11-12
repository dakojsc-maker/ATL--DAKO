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
    pg.goto(URL); pg.wait_for_timeout(300)
    res=pg.evaluate("""()=>{
      const nvf=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
      const W=s=>(s.toLowerCase().match(/[\\p{L}\\p{N}]+/gu)||[]);
      const EXP=['cong nhan','lanh dao','lai xe','tai xe','y te','van phong'];
      let tests=0, bad=[];
      for(const ind of STP.IND){
        const rows=ind.blocks.flatMap(b=>b.rows);
        const vocab=new Set(); rows.forEach(r=>W(r.p).forEach(w=>vocab.add(w)));
        for(const w of vocab){
          for(const q of [w, nvf(w)]){
            const sens = q!==nvf(q);
            const r=STP.search(ind,q);
            tests++;
            const exp=new Set(rows.filter(x=>W(x.p).some(t=>sens? t===q : nvf(t)===q)).map(x=>x.id));
            const got=new Set(r.list.map(x=>x.r.id));
            const isConcept=EXP.includes(nvf(q));
            if(!isConcept){
              if(r.mode!=='name'||r.prefix) bad.push([ind.id,q,'mode',r.mode,r.prefix]);
              else if(exp.size!==got.size||[...exp].some(i=>!got.has(i))) bad.push([ind.id,q,'set',exp.size,got.size]);
            }
          }
        }
      }
      return {tests, nbad:bad.length, bad:bad.slice(0,15)};
    }""")
    print(res)
    # DOM-level highlight check: chips + sample queries in every industry
    dom=pg.evaluate("""()=>{
      const out=[]; 
      const nvf=s=>s.normalize('NFD').replace(/[\\u0300-\\u036f]/g,'').replace(/đ/g,'d').replace(/Đ/g,'D').toLowerCase();
      for(const ind of STP.IND){
        STP.S.ind=ind.id; STP.S.picker=false;
        for(const q of ['Công nhân','Thợ','Kỹ sư','Giám sát','Giám đốc','Trưởng phòng','Kế toán','Bảo vệ','Lái xe','Vận hành','Thủ kho','Nhân viên','tho','thủ kho','xe nâng','an toàn','y tế']){
          STP.S.q=q; STP.renderAll();
          const marks=[...document.querySelectorAll('#find-list mark')].map(m=>nvf(m.textContent));
          const rowsN=document.querySelectorAll('#find-list .rr').length;
          const nm=document.querySelectorAll('#find-list .rr .rr-name').length;
          // every mark must be a whole word sequence in its own name text
          const badm=[];
          document.querySelectorAll('#find-list .rr').forEach(row=>{
            const nameEl=row.querySelector('.rr-name'); const noteEl=row.querySelector('.rr-note');
            [nameEl,noteEl].forEach(el=>{ if(!el) return;
              el.querySelectorAll('mark').forEach(m=>{
                const txt=el.textContent; 
                // find the mark in the text by walking nodes
                let pre=''; for(const n of el.childNodes){ if(n===m) break; pre+=n.textContent; }
                const before=pre.slice(-1), after=(txt.slice(pre.length+m.textContent.length)).slice(0,1);
                const isL=c=>/[\\p{L}\\p{N}]/u.test(c||'');
                if(isL(before)||isL(after)) badm.push(row.dataset.id+':'+txt.slice(0,40)+' ['+m.textContent+']');
              });
            });
          });
          out.push({ind:ind.id,q,n:rowsN,mode:STP.search(ind,q).mode,badm});
        }
      }
      return out;}""")
    bad=[d for d in dom if d['badm']]
    print('dom checks',len(dom),'bad highlight cases',len(bad), bad[:5])
    modes={}
    for d in dom: modes[d['mode']]=modes.get(d['mode'],0)+1
    print(modes)
    for d in dom:
        if d['mode']!='name': print('non-name:',d['ind'],d['q'],d['mode'],d['n'])
    b.close()
print(errs)
