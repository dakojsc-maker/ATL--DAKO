import sys, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
OUT=sys.argv[1]
plt.rcParams.update({
 'font.family':'Noto Sans KR','font.size':9,
 'axes.edgecolor':'#c3c2b7','axes.linewidth':0.8,'axes.labelcolor':'#52514e',
 'xtick.color':'#52514e','ytick.color':'#0b0b0b','text.color':'#0b0b0b',
 'axes.spines.top':False,'axes.spines.right':False,'axes.spines.left':False,
 'xtick.major.size':0,'ytick.major.size':0,'savefig.dpi':300,
 'legend.frameon':False,'legend.fontsize':8.5,
})
BLUE='#2a78d6'; ORANGE='#eb6834'; AQUA='#1baf7a'; YELLOW='#eda100'; RED='#e34948'
GRAY='#9aa3b2'; INK='#0b0b0b'; INK2='#52514e'; MUTED='#898781'; GRID='#e1e0d9'
LBLUE='#86b6ef'; DBLUE='#104281'
def vn(x,d=0):
    return f"{x:,.{d}f}"
def save(fig,name):
    path=os.path.join(OUT,name)
    fig.savefig(path,bbox_inches='tight',pad_inches=0.06,facecolor='white')
    plt.close(fig)
    # nén PNG về bảng 256 màu (biểu đồ màu phẳng, không ảnh hưởng độ nét)
    from PIL import Image
    Image.open(path).convert('RGB').quantize(colors=256,method=Image.Quantize.MEDIANCUT,dither=Image.Dither.NONE).save(path,optimize=True)
    print('saved',name)
def xgrid(ax):
    ax.xaxis.grid(True,color=GRID,lw=0.6); ax.set_axisbelow(True)

# 1. Thu & chi 2024-2025 (small multiples, shared scale)
fig,axs=plt.subplots(2,1,figsize=(6.3,3.5),sharex=True,gridspec_kw={'hspace':0.75})
years=['2024','2025']
thu=[(456.10,185.18,11.14),(540.00,308.62,2.00)]
chi=[(453.04,193.91,5.00),(549.92,251.58,5.10)]
def stack(ax,rows,labels,colors,inks,title,totals):
    for i,row in enumerate(rows):
        left=0; tot=sum(row)
        for v,c,ink,lab in zip(row,colors,inks,labels):
            ax.barh(i,v,left=left,color=c,height=0.56,edgecolor='white',linewidth=1.2,label=lab if i==0 else None)
            if v/tot>0.12:
                ax.text(left+v/2,i,f"{vn(v,1)}  ({vn(v/tot*100,1)}%)",ha='center',va='center',fontsize=8.3,color=ink,fontweight='bold')
            left+=v
        ax.text(left+10,i,f"{vn(totals[i],1)}",va='center',ha='left',fontsize=8.6,color=INK,fontweight='bold')
    ax.set_yticks(range(len(rows))); ax.set_yticklabels(years,fontsize=9)
    ax.invert_yaxis(); xgrid(ax); ax.set_xlim(0,950)
    ax.set_title(title,loc='left',fontsize=9.5,fontweight='bold',color=INK,pad=18)
    ax.legend(loc='lower left',bbox_to_anchor=(0,1.0),ncol=3,handlelength=1.1,columnspacing=1.2,borderaxespad=0.1)
stack(axs[0],thu,['투자자 지원금','등록금·수수료','기타 수입(과학기술, 기타 순수입)'],[BLUE,ORANGE,GRAY],['white','white',INK],'운영 수입 합계',[652.42,850.62])
stack(axs[1],chi,['인건비','시설·서비스비','학생 지원 및 기타 지출'],[AQUA,YELLOW,GRAY],[INK,INK,INK],'운영 지출 합계',[651.95,806.60])
axs[1].set_xlabel('억 동',fontsize=8.5,color=INK2)
axs[1].tick_params(axis='x',labelsize=8.3)
axs[1].xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
save(fig,'c_thu_chi.png')

# 2. Waterfall 2025 (horizontal)
steps=[('등록금·수수료',308.62,'in'),('투자자 경상비 지원금',540.00,'in2'),('과학기술·기타 수입',2.00,'in'),
       ('운영 수입 합계',850.62,'tot'),('인건비',-549.92,'out'),('시설·서비스비',-251.58,'out'),
       ('학생 지원 및 기타 지출',-5.10,'out'),('2025년 수지차',44.02,'tot')]
fig,ax=plt.subplots(figsize=(6.3,3.6))
run=0
for i,(lab,v,kind) in enumerate(steps):
    if kind=='tot':
        ax.barh(i,v,left=0,color='#52514e',height=0.6); run=v; x_end=v
        ax.text(v+10,i,vn(v,1),va='center',ha='left',fontsize=8.6,fontweight='bold')
    else:
        start=run; run=run+v
        lo=min(start,run); w=abs(v)
        col={'in':BLUE,'in2':LBLUE,'out':RED}[kind]
        ax.barh(i,w,left=lo,color=col,height=0.6)
        txt=('+' if v>0 else '−')+vn(abs(v),1)
        ax.text(max(start,run)+10,i,txt,va='center',ha='left',fontsize=8.6,color=INK,fontweight='bold')
    if i<len(steps)-1:
        ax.plot([run,run],[i+0.3,i+0.7],color=MUTED,lw=0.7)
ax.set_yticks(range(len(steps))); ax.set_yticklabels([s[0] for s in steps],fontsize=8.6)
ax.invert_yaxis(); xgrid(ax); ax.set_xlim(0,1000)
ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
ax.set_xlabel('억 동',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8.3)
from matplotlib.patches import Patch
ax.legend(handles=[Patch(color=BLUE,label='자체 수입'),Patch(color=LBLUE,label='투자자 지원금'),Patch(color=RED,label='지출'),Patch(color='#52514e',label='합계·결과')],
          loc='lower left',bbox_to_anchor=(0,1.0),ncol=4,handlelength=1.1,columnspacing=1.2)
save(fig,'c_waterfall.png')

# 3. Quy mô theo ngành
progs=[('물류·공급망관리',209,139),('정보기술',200,62),('멀티미디어커뮤니케이션',119,50),
       ('마케팅',68,31),('경영학',52,22),('국제경영',32,18),('그래픽디자인',24,13),('스포츠경영',22,0)]
fig,ax=plt.subplots(figsize=(6.3,3.7))
import numpy as np
y=np.arange(len(progs)); h=0.36
a=ax.barh(y-h/2,[p[1] for p in progs],height=h,color=BLUE,label='재학생 수(2026.5.31)',edgecolor='white',linewidth=1)
b=ax.barh(y+h/2,[p[2] for p in progs],height=h,color=ORANGE,label='2025년 입학생',edgecolor='white',linewidth=1)
for i,p in enumerate(progs):
    ax.text(p[1]+3,i-h/2,vn(p[1]),va='center',fontsize=8.3,color=INK)
    ax.text(p[2]+3,i+h/2,vn(p[2]),va='center',fontsize=8.3,color=INK2)
ax.set_yticks(y); ax.set_yticklabels([p[0] for p in progs],fontsize=8.6); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,240); ax.set_xlabel('학생 수(명)',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8.3)
ax.legend(loc='lower left',bbox_to_anchor=(0,1.0),ncol=2,handlelength=1.1)
save(fig,'c_quymo.png')

# 4. Giảng viên theo trình độ + tỷ lệ TS
fig,(ax1,ax2)=plt.subplots(2,1,figsize=(6.3,2.9),gridspec_kw={'height_ratios':[1,1.15],'hspace':0.95})
seg=[('학사',1,'#86b6ef',INK),('석사',141,'#3987e5','white'),('박사',38,'#1c5cab','white'),('부교수',2,'#0d366b','white')]
left=0
for lab,v,c,ink in seg:
    ax1.barh(0,v,left=left,color=c,height=0.6,edgecolor='white',linewidth=1.2,label=f'{lab}: {v}명')
    if v>=20: ax1.text(left+v/2,0,f'{lab} {v}명 ({vn(v/182*100,1)}%)',ha='center',va='center',fontsize=8.4,color=ink,fontweight='bold')
    left+=v
ax1.set_xlim(0,182); ax1.set_yticks([]); ax1.set_xticks([0,50,100,150,182]); ax1.tick_params(axis='x',labelsize=8)
ax1.set_title('전임교원 182명의 학위별 구성',loc='left',fontsize=9.3,fontweight='bold',pad=20)
ax1.legend(loc='lower left',bbox_to_anchor=(0,1.0),ncol=4,handlelength=1.1,columnspacing=1.2,fontsize=8)
# gauge
ax2.barh(0,40,color='#eceae4',height=0.5)
ax2.barh(0,23.17,color=BLUE,height=0.5)
ax2.text(0.7,0,'공시보고서: 23.17%',va='center',ha='left',fontsize=8.4,color='white',fontweight='bold')
ax2.plot(21.98,-0.36,marker='^',ms=6,color=INK)
ax2.text(21.98,-0.5,'재계산 40/182 = 21.98%',va='top',ha='center',fontsize=7.8,color=INK2)
for t,lab in [(20,'기준 20%'),(30,'기준 30%(2030년부터)')]:
    ax2.plot([t,t],[-0.3,0.3],color=RED,lw=1.3,ls=(0,(3,2)))
    ax2.text(t,0.4,lab,ha='center',va='bottom',fontsize=7.8,color=RED)
ax2.set_xlim(0,40); ax2.set_ylim(-1.0,0.9); ax2.set_yticks([]); ax2.set_xticks([0,10,40]); ax2.set_xticklabels(['0%','10%','40%'],fontsize=8)
ax2.set_title('박사학위 교원 비율(부교수 포함)과 기준선',loc='left',fontsize=9.3,fontweight='bold',pad=10)
save(fig,'c_giangvien.png')

# 5. Diện tích sàn theo hạng mục
items=[('실외 체육시설(3)',6490,'C'),('주차장(3)',4629.2,'C'),('100석 미만 강의실(46)',2773.24,'A'),('기숙사(30실)',1536.69,'D'),
 ('250석 이상 강당(2)',1125,'A'),('구내식당(2)',1069.5,'D'),('실습실·실험실(10)',974.1,'A'),('기타 행정부서실(17)',930.1,'B'),
 ('학부·학과 사무실(10)',696.4,'B'),('100석 이상 대형강의실(3)',492,'A'),('도서관(1)',485.5,'A'),('화장실(41)',484.8,'B'),
 ('편의시설(3)',213.5,'D'),('교원 회의실(6)',169.3,'B'),('총장단 집무실(8)',143.2,'B'),
 ('단체 사무실(1)',70,'B'),('교수·부교수 연구실(2)',31.5,'B'),('대학이사회실(2)',31,'B'),('보건실(2)',24,'B')]
col={'A':BLUE,'B':GRAY,'C':ORANGE,'D':AQUA}
lab={'A':'교육·학습','B':'업무·행정·지원','C':'실외 체육시설·주차장','D':'기숙사·식당·편의시설'}
fig,ax=plt.subplots(figsize=(6.3,5.2))
for i,(n,v,g) in enumerate(items):
    ax.barh(i,v,color=col[g],height=0.66)
    ax.text(v+60,i,vn(v,2) if v%1 else vn(v),va='center',fontsize=7.9,color=INK)
ax.set_yticks(range(len(items))); ax.set_yticklabels([x[0] for x in items],fontsize=8.1); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,7600); ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
ax.set_xlabel('건축 연면적 m²(괄호 안: 수량)',fontsize=8.3,color=INK2); ax.tick_params(axis='x',labelsize=8)
tot={g:sum(v for _,v,gg in items if gg==g) for g in 'ABCD'}
ax.legend(handles=[Patch(color=col[g],label=f"{lab[g]}: {vn(tot[g],0)} m² ({vn(tot[g]/22369.03*100,1)}%)") for g in 'CADB'],
          loc='lower left',bbox_to_anchor=(0,1.0),ncol=2,handlelength=1.1,columnspacing=1.0,fontsize=7.9)
save(fig,'c_san.png')
print({g:round(t,2) for g,t in tot.items()})

# 6. Công suất
cap=[('현재 재학생(2026.5.31)',727,'now'),
 ('연면적 기준 상한(2.8 m²/인),\n교육·업무 공간만 산입*',2107,'c'),
 ('부지 기준 상한(25 m²/인),\n3개 캠퍼스 전체(74,241.8 m²)',2969,'c'),
 ('정보보안 전공 개설안의\n안정 규모(2025.11)',3200,'p'),
 ('연면적 기준 상한(2.8 m²/인),\n공시 교육용 연면적(13,684.54 m²)',4887,'c'),
 ('개교 발표 시 목표(2021.11)',10000,'p')]
fig,ax=plt.subplots(figsize=(6.3,3.4))
cc={'now':ORANGE,'c':BLUE,'p':LBLUE}
for i,(n,v,k) in enumerate(cap):
    ax.barh(i,v,color=cc[k],height=0.6)
    ax.text(v+120,i,('> ' if v==10000 else '')+vn(v),va='center',fontsize=8.5,fontweight='bold')
ax.set_yticks(range(len(cap))); ax.set_yticklabels([c[0] for c in cap],fontsize=8.1); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,11200); ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
ax.set_xlabel('학생 수(명)',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8)
ax.legend(handles=[Patch(color=ORANGE,label='현황'),Patch(color=BLUE,label='기준상 상한(컨설턴트 산출)'),Patch(color=LBLUE,label='UMT 발표 목표')],
          loc='lower left',bbox_to_anchor=(0,1.0),ncol=3,handlelength=1.1,columnspacing=1.0,fontsize=8)
save(fig,'c_congsuat.png')

# 7. Học bổng
tiers=[('GLOBAL 전액 장학금',363,'≈ 363 (등록금 100%, 추정)'),('Unique',218,'최소 218'),('Liberal',174,'최소 174'),('Future',109,'최소 109'),('창립 신입생 우대',90,'최소 90')]
ramp=['#0d366b','#184f95','#256abf','#3987e5','#86b6ef']
fig,ax=plt.subplots(figsize=(6.3,2.6))
for i,(n,v,t) in enumerate(tiers):
    if i==0: ax.barh(i,v,color='white',edgecolor=ramp[0],linewidth=1.2,height=0.6,hatch='////')
    else: ax.barh(i,v,color=ramp[i],height=0.6)
    ax.text(v+5,i,t,va='center',fontsize=8.5,fontweight='bold' if i else None)
ax.axvline(363,color=RED,lw=1,ls=(0,(3,2)))
ax.text(363,-0.75,'추정 전 과정 등록금 ≈ 363백만 동',ha='right',va='bottom',fontsize=7.8,color=RED)
ax.set_yticks(range(len(tiers))); ax.set_yticklabels([x[0] for x in tiers],fontsize=8.6); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,470); ax.set_xlabel('백만 동/1인(전 과정 적용)',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8)
save(fig,'c_hocbong.png')

# 8. Học phí – chi phí bình quân (dot-range)
rows=[('추정 정가 등록금\n(363백만 동 ÷ 3.5년)',[103.7],BLUE),
      ('최소 장학금 90백만 동 차감 후\n(2026 리플릿 기준)',[78.0],BLUE),
      ('2025년 평균 실수납 등록금\n(공시보고서, 분모 2가지)',[42.5,60.6],ORANGE),
      ('2025년 1인당 운영비\n(공시보고서, 분모 2가지)',[110.9,158.5],RED)]
fig,ax=plt.subplots(figsize=(6.3,2.9))
for i,(n,vals,c) in enumerate(rows):
    if len(vals)==2:
        ax.plot(vals,[i,i],color=c,lw=3,alpha=0.35,solid_capstyle='round')
    for v in vals:
        ax.plot(v,i,'o',ms=7.5,color=c,mec='white',mew=1.2)
        ax.text(v,i-0.28,vn(v,1),ha='center',va='bottom',fontsize=8.4,fontweight='bold')
ax.set_yticks(range(len(rows))); ax.set_yticklabels([r[0] for r in rows],fontsize=8.2); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,175); ax.set_ylim(len(rows)-0.5,-0.8)
ax.set_xlabel('백만 동/학생/년',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8)
save(fig,'c_hocphi.png')

# 9. Hòa vốn
p=np.linspace(35,115,200); N=80660/p
fig,ax=plt.subplots(figsize=(6.3,3.1))
ax.plot(p,N,color=BLUE,lw=2)
ax.axhline(727,color=ORANGE,lw=1.4)
ax.text(36,727-45,'현재 규모: 727명',ha='left',va='top',fontsize=8.2,color=INK)
for pv,lab in [(42.5,'42.5'),(60.6,'60.6'),(78.0,'78.0'),(103.7,'103.7')]:
    n=80660/pv; ax.plot(pv,n,'o',ms=6.5,color=BLUE,mec='white',mew=1.2)
    if pv>100: ax.text(pv,n+110,f'{lab}백만 동 → {vn(round(n))}명',fontsize=8,va='bottom',ha='center')
    else: ax.text(pv+1.5,n+70,f'{lab}백만 동 → {vn(round(n))}명',fontsize=8,va='bottom')
ax.spines['left'].set_visible(True); ax.yaxis.grid(True,color=GRID,lw=0.6); ax.set_axisbelow(True)
ax.set_xlim(35,115); ax.set_ylim(0,2500)
ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
ax.set_xlabel('평균 실수납 등록금(백만 동/학생/년)',fontsize=8.5,color=INK2)
ax.set_ylabel('필요 학생 수(명)',fontsize=8.5,color=INK2); ax.tick_params(labelsize=8); ax.tick_params(axis='y',colors=INK2)
save(fig,'c_hoavon.png')
