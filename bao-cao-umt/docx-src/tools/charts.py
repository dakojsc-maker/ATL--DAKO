import sys, os
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
from matplotlib.patches import FancyBboxPatch
OUT=sys.argv[1]
plt.rcParams.update({
 'font.family':'Liberation Sans','font.size':9,
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
    s=f"{x:,.{d}f}"
    return s.replace(',','§').replace('.',',').replace('§','.')
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
thu=[(45.610,18.518,1.114),(54.000,30.862,0.200)]
chi=[(45.304,19.391,0.500),(54.992,25.158,0.510)]
def stack(ax,rows,labels,colors,inks,title,totals):
    for i,row in enumerate(rows):
        left=0; tot=sum(row)
        for v,c,ink,lab in zip(row,colors,inks,labels):
            ax.barh(i,v,left=left,color=c,height=0.56,edgecolor='white',linewidth=1.2,label=lab if i==0 else None)
            if v/tot>0.12:
                ax.text(left+v/2,i,f"{vn(v,2)}  ({vn(v/tot*100,1)}%)",ha='center',va='center',fontsize=8.3,color=ink,fontweight='bold')
            left+=v
        ax.text(left+1.0,i,f"{vn(totals[i],2)}",va='center',ha='left',fontsize=8.6,color=INK,fontweight='bold')
    ax.set_yticks(range(len(rows))); ax.set_yticklabels(years,fontsize=9)
    ax.invert_yaxis(); xgrid(ax); ax.set_xlim(0,95)
    ax.set_title(title,loc='left',fontsize=9.5,fontweight='bold',color=INK,pad=18)
    ax.legend(loc='lower left',bbox_to_anchor=(0,1.0),ncol=3,handlelength=1.1,columnspacing=1.2,borderaxespad=0.1)
stack(axs[0],thu,['Hỗ trợ của nhà đầu tư','Học phí, lệ phí','Thu khác (KH&CN, thu nhập ròng khác)'],[BLUE,ORANGE,GRAY],['white','white',INK],'Tổng thu hoạt động',[65.242,85.062])
stack(axs[1],chi,['Chi lương, thu nhập','Chi cơ sở vật chất và dịch vụ','Chi hỗ trợ người học và chi khác'],[AQUA,YELLOW,GRAY],[INK,INK,INK],'Tổng chi hoạt động',[65.195,80.660])
axs[1].set_xlabel('Tỷ đồng',fontsize=8.5,color=INK2)
axs[1].tick_params(axis='x',labelsize=8.3)
axs[1].xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
save(fig,'c_thu_chi.png')

# 2. Waterfall 2025 (horizontal)
steps=[('Học phí, lệ phí',30.862,'in'),('Hỗ trợ chi thường xuyên của nhà đầu tư',54.000,'in2'),('Thu KH&CN và thu khác',0.200,'in'),
       ('Tổng thu hoạt động',85.062,'tot'),('Chi lương, thu nhập',-54.992,'out'),('Chi cơ sở vật chất và dịch vụ',-25.158,'out'),
       ('Chi hỗ trợ người học và chi khác',-0.510,'out'),('Chênh lệch thu chi 2025',4.402,'tot')]
fig,ax=plt.subplots(figsize=(6.3,3.6))
run=0
for i,(lab,v,kind) in enumerate(steps):
    if kind=='tot':
        ax.barh(i,v,left=0,color='#52514e',height=0.6); run=v; x_end=v
        ax.text(v+1,i,vn(v,2),va='center',ha='left',fontsize=8.6,fontweight='bold')
    else:
        start=run; run=run+v
        lo=min(start,run); w=abs(v)
        col={'in':BLUE,'in2':LBLUE,'out':RED}[kind]
        ax.barh(i,w,left=lo,color=col,height=0.6)
        txt=('+' if v>0 else '−')+vn(abs(v),2)
        ax.text(max(start,run)+1,i,txt,va='center',ha='left',fontsize=8.6,color=INK,fontweight='bold')
    if i<len(steps)-1:
        ax.plot([run,run],[i+0.3,i+0.7],color=MUTED,lw=0.7)
ax.set_yticks(range(len(steps))); ax.set_yticklabels([s[0] for s in steps],fontsize=8.6)
ax.invert_yaxis(); xgrid(ax); ax.set_xlim(0,100)
ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
ax.set_xlabel('Tỷ đồng',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8.3)
from matplotlib.patches import Patch
ax.legend(handles=[Patch(color=BLUE,label='Thu tự tạo'),Patch(color=LBLUE,label='Hỗ trợ của nhà đầu tư'),Patch(color=RED,label='Chi'),Patch(color='#52514e',label='Tổng, kết quả')],
          loc='lower left',bbox_to_anchor=(0,1.0),ncol=4,handlelength=1.1,columnspacing=1.2)
save(fig,'c_waterfall.png')

# 3. Quy mô theo ngành
progs=[('Logistics và Quản lý chuỗi cung ứng',209,139),('Công nghệ thông tin',200,62),('Truyền thông đa phương tiện',119,50),
       ('Marketing',68,31),('Quản trị kinh doanh',52,22),('Kinh doanh quốc tế',32,18),('Thiết kế đồ họa',24,13),('Quản lý thể dục thể thao',22,0)]
fig,ax=plt.subplots(figsize=(6.3,3.7))
import numpy as np
y=np.arange(len(progs)); h=0.36
a=ax.barh(y-h/2,[p[1] for p in progs],height=h,color=BLUE,label='Quy mô đào tạo (31/5/2026)',edgecolor='white',linewidth=1)
b=ax.barh(y+h/2,[p[2] for p in progs],height=h,color=ORANGE,label='Nhập học năm 2025',edgecolor='white',linewidth=1)
for i,p in enumerate(progs):
    ax.text(p[1]+3,i-h/2,vn(p[1]),va='center',fontsize=8.3,color=INK)
    ax.text(p[2]+3,i+h/2,vn(p[2]),va='center',fontsize=8.3,color=INK2)
ax.set_yticks(y); ax.set_yticklabels([p[0] for p in progs],fontsize=8.6); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,240); ax.set_xlabel('Sinh viên',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8.3)
ax.legend(loc='lower left',bbox_to_anchor=(0,1.0),ncol=2,handlelength=1.1)
save(fig,'c_quymo.png')

# 4. Giảng viên theo trình độ + tỷ lệ TS
fig,(ax1,ax2)=plt.subplots(2,1,figsize=(6.3,2.9),gridspec_kw={'height_ratios':[1,1.15],'hspace':0.95})
seg=[('Đại học',1,'#86b6ef',INK),('Thạc sĩ',141,'#3987e5','white'),('Tiến sĩ',38,'#1c5cab','white'),('Phó Giáo sư',2,'#0d366b','white')]
left=0
for lab,v,c,ink in seg:
    ax1.barh(0,v,left=left,color=c,height=0.6,edgecolor='white',linewidth=1.2,label=f'{lab}: {v}')
    if v>=20: ax1.text(left+v/2,0,f'{lab} {v} ({vn(v/182*100,1)}%)',ha='center',va='center',fontsize=8.4,color=ink,fontweight='bold')
    left+=v
ax1.set_xlim(0,182); ax1.set_yticks([]); ax1.set_xticks([0,50,100,150,182]); ax1.tick_params(axis='x',labelsize=8)
ax1.set_title('182 giảng viên toàn thời gian theo trình độ (người)',loc='left',fontsize=9.3,fontweight='bold',pad=20)
ax1.legend(loc='lower left',bbox_to_anchor=(0,1.0),ncol=4,handlelength=1.1,columnspacing=1.2,fontsize=8)
# gauge
ax2.barh(0,40,color='#eceae4',height=0.5)
ax2.barh(0,23.17,color=BLUE,height=0.5)
ax2.text(0.7,0,'BC công khai: 23,17%',va='center',ha='left',fontsize=8.4,color='white',fontweight='bold')
ax2.plot(21.98,-0.36,marker='^',ms=6,color=INK)
ax2.text(21.98,-0.5,'Tính lại 40/182 = 21,98%',va='top',ha='center',fontsize=7.8,color=INK2)
for t,lab in [(20,'Ngưỡng 20%'),(30,'Ngưỡng 30% (từ 2030)')]:
    ax2.plot([t,t],[-0.3,0.3],color=RED,lw=1.3,ls=(0,(3,2)))
    ax2.text(t,0.4,lab,ha='center',va='bottom',fontsize=7.8,color=RED)
ax2.set_xlim(0,40); ax2.set_ylim(-1.0,0.9); ax2.set_yticks([]); ax2.set_xticks([0,10,40]); ax2.set_xticklabels(['0%','10%','40%'],fontsize=8)
ax2.set_title('Tỷ lệ giảng viên có trình độ tiến sĩ (gồm PGS) so với ngưỡng chuẩn',loc='left',fontsize=9.3,fontweight='bold',pad=10)
save(fig,'c_giangvien.png')

# 5. Diện tích sàn theo hạng mục
items=[('Sân thể thao ngoài trời (3)',6490,'C'),('Nhà để xe (3)',4629.2,'C'),('Phòng học dưới 100 chỗ (46)',2773.24,'A'),('Ký túc xá (30 phòng)',1536.69,'D'),
 ('Hội trường từ 250 chỗ (2)',1125,'A'),('Nhà ăn (2)',1069.5,'D'),('Xưởng thực hành, phòng thí nghiệm (10)',974.1,'A'),('Phòng chức năng khác (17)',930.1,'B'),
 ('Phòng làm việc khoa, bộ môn (10)',696.4,'B'),('Giảng đường từ 100 chỗ (3)',492,'A'),('Thư viện (1)',485.5,'A'),('Nhà vệ sinh (41)',484.8,'B'),
 ('Công trình dịch vụ công cộng (3)',213.5,'D'),('Phòng họp giảng viên (6)',169.3,'B'),('Phòng làm việc Ban Giám hiệu (8)',143.2,'B'),
 ('Phòng đoàn thể (1)',70,'B'),('Phòng GS, PGS (2)',31.5,'B'),('Hội đồng nhà trường (2)',31,'B'),('Phòng y tế (2)',24,'B')]
col={'A':BLUE,'B':GRAY,'C':ORANGE,'D':AQUA}
lab={'A':'Giảng dạy, học tập','B':'Làm việc, hành chính, phụ trợ','C':'Sân thể thao ngoài trời, nhà để xe','D':'Ký túc xá, nhà ăn, dịch vụ'}
fig,ax=plt.subplots(figsize=(6.3,5.2))
for i,(n,v,g) in enumerate(items):
    ax.barh(i,v,color=col[g],height=0.66)
    ax.text(v+60,i,vn(v,2) if v%1 else vn(v),va='center',fontsize=7.9,color=INK)
ax.set_yticks(range(len(items))); ax.set_yticklabels([x[0] for x in items],fontsize=8.1); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,7600); ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
ax.set_xlabel('m² sàn xây dựng (trong ngoặc: số lượng)',fontsize=8.3,color=INK2); ax.tick_params(axis='x',labelsize=8)
tot={g:sum(v for _,v,gg in items if gg==g) for g in 'ABCD'}
ax.legend(handles=[Patch(color=col[g],label=f"{lab[g]}: {vn(tot[g],0)} m² ({vn(tot[g]/22369.03*100,1)}%)") for g in 'CADB'],
          loc='lower left',bbox_to_anchor=(0,1.0),ncol=2,handlelength=1.1,columnspacing=1.0,fontsize=7.9)
save(fig,'c_san.png')
print({g:round(t,2) for g,t in tot.items()})

# 6. Công suất
cap=[('Sinh viên hiện có (31/5/2026)',727,'now'),
 ('Trần theo sàn 2,8 m²/người học,\nchỉ tính sàn học tập – làm việc*',2107,'c'),
 ('Trần theo đất 25 m²/người học,\ntoàn bộ 3 cơ sở (74.241,8 m²)',2969,'c'),
 ('Quy mô ổn định theo đề án\nmở ngành ATTT (11/2025)',3200,'p'),
 ('Trần theo sàn 2,8 m²/người học,\ntheo sàn đào tạo công bố (13.684,54 m²)',4887,'c'),
 ('Mục tiêu công bố khi ra mắt (11/2021)',10000,'p')]
fig,ax=plt.subplots(figsize=(6.3,3.4))
cc={'now':ORANGE,'c':BLUE,'p':LBLUE}
for i,(n,v,k) in enumerate(cap):
    ax.barh(i,v,color=cc[k],height=0.6)
    ax.text(v+120,i,('> ' if v==10000 else '')+vn(v),va='center',fontsize=8.5,fontweight='bold')
ax.set_yticks(range(len(cap))); ax.set_yticklabels([c[0] for c in cap],fontsize=8.1); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,11200); ax.xaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
ax.set_xlabel('Người học',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8)
ax.legend(handles=[Patch(color=ORANGE,label='Hiện trạng'),Patch(color=BLUE,label='Trần theo chuẩn (tính toán của tư vấn)'),Patch(color=LBLUE,label='Mục tiêu do UMT công bố')],
          loc='lower left',bbox_to_anchor=(0,1.0),ncol=3,handlelength=1.1,columnspacing=1.0,fontsize=8)
save(fig,'c_congsuat.png')

# 7. Học bổng
tiers=[('Toàn phần GLOBAL',363,'≈ 363 (100% học phí, suy ra)'),('Unique',218,'từ 218'),('Liberal',174,'từ 174'),('Future',109,'từ 109'),('Ưu đãi Sinh viên Sáng lập',90,'từ 90')]
ramp=['#0d366b','#184f95','#256abf','#3987e5','#86b6ef']
fig,ax=plt.subplots(figsize=(6.3,2.6))
for i,(n,v,t) in enumerate(tiers):
    if i==0: ax.barh(i,v,color='white',edgecolor=ramp[0],linewidth=1.2,height=0.6,hatch='////')
    else: ax.barh(i,v,color=ramp[i],height=0.6)
    ax.text(v+5,i,t,va='center',fontsize=8.5,fontweight='bold' if i else None)
ax.axvline(363,color=RED,lw=1,ls=(0,(3,2)))
ax.text(363,-0.75,'Học phí toàn khóa suy ra ≈ 363 triệu',ha='right',va='bottom',fontsize=7.8,color=RED)
ax.set_yticks(range(len(tiers))); ax.set_yticklabels([x[0] for x in tiers],fontsize=8.6); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,460); ax.set_xlabel('Triệu đồng/suất, áp dụng toàn khóa',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8)
save(fig,'c_hocbong.png')

# 8. Học phí – chi phí bình quân (dot-range)
rows=[('Học phí niêm yết suy ra\n(363 triệu ÷ 3,5 năm)',[103.7],BLUE),
      ('Sau học bổng tối thiểu 90 triệu\n(theo tờ rơi 2026)',[78.0],BLUE),
      ('Học phí thực thu bình quân 2025\n(BC công khai; 2 cách tính mẫu số)',[42.5,60.6],ORANGE),
      ('Chi phí hoạt động bình quân 2025\n(BC công khai; 2 cách tính mẫu số)',[110.9,158.5],RED)]
fig,ax=plt.subplots(figsize=(6.3,2.9))
for i,(n,vals,c) in enumerate(rows):
    if len(vals)==2:
        ax.plot(vals,[i,i],color=c,lw=3,alpha=0.35,solid_capstyle='round')
    for v in vals:
        ax.plot(v,i,'o',ms=7.5,color=c,mec='white',mew=1.2)
        ax.text(v,i-0.28,vn(v,1),ha='center',va='bottom',fontsize=8.4,fontweight='bold')
ax.set_yticks(range(len(rows))); ax.set_yticklabels([r[0] for r in rows],fontsize=8.2); ax.invert_yaxis(); xgrid(ax)
ax.set_xlim(0,175); ax.set_ylim(len(rows)-0.5,-0.8)
ax.set_xlabel('Triệu đồng/sinh viên/năm',fontsize=8.5,color=INK2); ax.tick_params(axis='x',labelsize=8)
save(fig,'c_hocphi.png')

# 9. Hòa vốn
p=np.linspace(35,115,200); N=80660/p
fig,ax=plt.subplots(figsize=(6.3,3.1))
ax.plot(p,N,color=BLUE,lw=2)
ax.axhline(727,color=ORANGE,lw=1.4)
ax.text(36,727-45,'Quy mô hiện tại: 727 sinh viên',ha='left',va='top',fontsize=8.2,color=INK)
for pv,lab in [(42.5,'42,5'),(60.6,'60,6'),(78.0,'78,0'),(103.7,'103,7')]:
    n=80660/pv; ax.plot(pv,n,'o',ms=6.5,color=BLUE,mec='white',mew=1.2)
    if pv>100: ax.text(pv,n+110,f'{lab} tr.đ → {vn(round(n))} SV',fontsize=8,va='bottom',ha='center')
    else: ax.text(pv+1.5,n+70,f'{lab} tr.đ → {vn(round(n))} SV',fontsize=8,va='bottom')
ax.spines['left'].set_visible(True); ax.yaxis.grid(True,color=GRID,lw=0.6); ax.set_axisbelow(True)
ax.set_xlim(35,115); ax.set_ylim(0,2500)
ax.yaxis.set_major_formatter(matplotlib.ticker.FuncFormatter(lambda x,p: vn(x,0)))
ax.set_xlabel('Học phí thực thu bình quân (triệu đồng/sinh viên/năm)',fontsize=8.5,color=INK2)
ax.set_ylabel('Sinh viên cần có',fontsize=8.5,color=INK2); ax.tick_params(labelsize=8); ax.tick_params(axis='y',colors=INK2)
save(fig,'c_hoavon.png')
