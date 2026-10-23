"""Chiến lược "lướt sóng 5–7%": đặc trưng (chỉ báo) theo bảng ngày × mã, mô phỏng lệnh theo luật thị trường Việt Nam,
và mô hình xác suất thắng.

Mọi hàm làm việc trên "bảng" (DataFrame: chỉ số = ngày, cột = mã) để tính được cả các chỉ báo so sánh chéo giữa các mã
(xếp hạng sức mạnh giá, sức mạnh nhóm ngành, độ rộng thị trường). Cùng một mã nguồn được dùng để nghiên cứu (14 năm dữ
liệu) và để lọc hằng ngày, nên chỉ báo lúc chạy thật giống hệt lúc kiểm định.

Luật mô phỏng (xem mo_phong):
  - tín hiệu sau giờ đóng cửa phiên t → mua giá mở cửa phiên t+1 (bỏ qua nếu t+1 trần cứng, không mua được);
  - T+2: cổ phiếu mua phiên e về tài khoản trưa phiên e+2 → phiên e+2 chỉ bán được buổi chiều (xét theo giá đóng cửa),
    từ phiên e+3 xét cả biên độ trong phiên;
  - chạm cắt lỗ và chốt lời cùng phiên → coi như cắt lỗ (thận trọng); mở cửa vượt ngưỡng → khớp giá mở cửa;
  - phiên sàn cứng (cả phiên nằm ở giá sàn) → không bán được, chờ phiên sau;
  - phí mua 0,15%, phí bán 0,15% + thuế 0,1%; cắt lỗ trượt giá thêm 0,2%.
"""
from __future__ import annotations

import os

import numpy as np
import pandas as pd

BIEN_DO = {"HOSE": 0.07, "HNX": 0.10, "UPCOM": 0.15}
PHI_MUA = 0.0015
PHI_BAN = 0.0025          # phí 0,15% + thuế thu nhập cá nhân 0,1%
TRUOT_CAT_LO = 0.002
GTGD_MIN = 3.0            # tỷ đồng/phiên (TB 20 phiên) – vũ trụ cổ phiếu đủ thanh khoản
SO_PHIEN_MIN = 260        # cần ~1 năm dữ liệu cho MA200 / đỉnh 52 tuần

# Tên các đặc trưng đưa vào mô hình (thứ tự cố định – mô hình đã huấn luyện dựa vào thứ tự này)
DAC_TRUNG = [
    # giá & xu hướng của mã
    "r1", "r3", "r5", "r10", "r20", "r60", "r120", "r250",
    "d_ma10", "d_ma20", "d_ma50", "d_ma100", "d_ma200",
    "sl_ma20", "sl_ma50", "sl_ma200",
    "d_dinh250", "vt_250", "d_dinh20", "d_day20",
    "rsi2", "rsi14", "stoch14", "atr_pct", "bien_dong20", "do_chat10",
    "vt_nen", "than_nen", "bong_tren", "gap",
    "chuoi_tang", "chuoi_giam", "so_tran10", "so_san10",
    # khối lượng & dòng tiền
    "kl_tb20", "kl_tb50", "kl5_50", "kl20_100", "ud_kl20", "ud_kl50", "log_gtgd20", "hang_gtgd",
    # sức mạnh tương đối
    "rs20", "rs60", "rs120", "rs250", "rs_tong", "vuot_vni20", "vuot_vni60", "beta60", "d_dinh_rs60",
    # nhóm ngành
    "nganh_rs20", "nganh_rs60", "nganh_tren_ma50", "hang_trong_nganh20",
    # thị trường chung
    "vni_d_ma20", "vni_d_ma50", "vni_d_ma200", "vni_r5", "vni_r20", "vni_r60", "vni_phan_phoi",
    "vni_bien_dong20", "rong_ma20", "rong_ma50", "rong_ma200", "dinh_tru_day20", "ad10",
    # sàn
    "ma_san",
]


# ----------------------------------------------------------------------------------------------
# Bảng dữ liệu
# ----------------------------------------------------------------------------------------------
def tao_bang(du_lieu: dict[str, pd.DataFrame]) -> dict[str, pd.DataFrame]:
    """{mã: DataFrame ngày × open/high/low/close/volume} → {"O","H","L","C","V": bảng ngày × mã}."""
    cot = {"O": "open", "H": "high", "L": "low", "C": "close", "V": "volume"}
    bang = {}
    for k, c in cot.items():
        bang[k] = pd.DataFrame({ma: df[c] for ma, df in du_lieu.items() if df is not None and len(df)}).sort_index()
        bang[k] = bang[k].astype("float64")
    # phiên không có dòng dữ liệu nằm giữa hai phiên có giao dịch (tạm ngừng, không khớp lệnh) – giữ giá cũ để chỉ báo
    # liên tục, KL = 0; trước niêm yết và sau phiên cuối cùng của mã thì để trống
    C = bang["C"]
    bang["C"] = C.ffill().where(C.bfill().notna())
    bang["V"] = bang["V"].where(bang["C"].notna()).fillna(0.0)
    for k in ("O", "H", "L"):
        bang[k] = bang[k].fillna(bang["C"])
    return bang


def _sma(x: pd.DataFrame, n: int) -> pd.DataFrame:
    return x.rolling(n, min_periods=n).mean()


def _rsi(c: pd.DataFrame, n: int) -> pd.DataFrame:
    d = c.diff()
    tang = d.clip(lower=0).ewm(alpha=1 / n, adjust=False, min_periods=n).mean()
    giam = (-d).clip(lower=0).ewm(alpha=1 / n, adjust=False, min_periods=n).mean()
    with np.errstate(divide="ignore", invalid="ignore"):
        return 100 - 100 / (1 + tang / giam)


def _chuoi(dk: pd.DataFrame) -> pd.DataFrame:
    """Số phiên liên tiếp (tính đến hôm nay) thoả điều kiện."""
    a = dk.to_numpy(bool)
    kq = np.zeros(a.shape, dtype=np.float32)
    for i in range(1, a.shape[0]):
        kq[i] = np.where(a[i], kq[i - 1] + 1, 0)
    kq[0] = a[0]
    return pd.DataFrame(kq, index=dk.index, columns=dk.columns)


def bien_do_san(san: pd.Series) -> pd.Series:
    return san.map(BIEN_DO).fillna(0.07)


def dac_trung(bang: dict[str, pd.DataFrame], vni: pd.DataFrame, nganh: pd.Series, san: pd.Series) -> dict:
    """Tính mọi đặc trưng. Trả {tên: bảng ngày × mã} + "trong_vu_tru" (mã đủ thanh khoản/lịch sử từng ngày)."""
    O, H, L, C, V = (bang[k] for k in ("O", "H", "L", "C", "V"))
    cols = C.columns
    vni = vni.reindex(C.index).ffill()
    vc = vni["close"]
    f: dict[str, pd.DataFrame] = {}

    r1 = C.pct_change(fill_method=None)
    for n in (1, 3, 5, 10, 20, 60, 120, 250):
        f[f"r{n}"] = C.pct_change(n, fill_method=None)
    ma = {n: _sma(C, n) for n in (10, 20, 50, 100, 200)}
    for n, m in ma.items():
        f[f"d_ma{n}"] = C / m - 1
    f["sl_ma20"] = ma[20] / ma[20].shift(5) - 1
    f["sl_ma50"] = ma[50] / ma[50].shift(10) - 1
    f["sl_ma200"] = ma[200] / ma[200].shift(20) - 1
    h250 = H.rolling(250, min_periods=200).max()
    l250 = L.rolling(250, min_periods=200).min()
    f["d_dinh250"] = C / h250 - 1
    f["vt_250"] = (C - l250) / (h250 - l250).replace(0, np.nan)
    f["d_dinh20"] = C / H.rolling(20).max() - 1
    f["d_day20"] = C / L.rolling(20).min() - 1
    f["rsi2"] = _rsi(C, 2)
    f["rsi14"] = _rsi(C, 14)
    l14, h14 = L.rolling(14).min(), H.rolling(14).max()
    f["stoch14"] = (C - l14) / (h14 - l14).replace(0, np.nan)
    c1 = C.shift(1)
    tr = np.maximum(np.maximum(H - L, (H - c1).abs()), (L - c1).abs())
    f["atr_pct"] = tr.ewm(alpha=1 / 14, adjust=False, min_periods=14).mean() / C
    f["bien_dong20"] = r1.rolling(20).std()
    f["do_chat10"] = (H.rolling(10).max() - L.rolling(10).min()) / C
    rng = (H - L).replace(0, np.nan)
    f["vt_nen"] = ((C - L) / rng).fillna(0.5)
    f["than_nen"] = C / O.replace(0, np.nan) - 1
    f["bong_tren"] = (H - np.maximum(O, C)) / C
    f["gap"] = O / c1 - 1
    f["chuoi_tang"] = _chuoi(r1 > 0)
    f["chuoi_giam"] = _chuoi(r1 < 0)
    lim = bien_do_san(san.reindex(cols))
    f["so_tran10"] = (r1.ge(lim * 0.95, axis=1)).astype(float).rolling(10).sum()
    f["so_san10"] = (r1.le(-lim * 0.95, axis=1)).astype(float).rolling(10).sum()

    # ---- khối lượng & dòng tiền ----
    v20 = V.shift(1).rolling(20).mean()
    v50 = V.shift(1).rolling(50).mean()
    f["kl_tb20"] = np.log1p(V / v20.replace(0, np.nan))
    f["kl_tb50"] = np.log1p(V / v50.replace(0, np.nan))
    f["kl5_50"] = np.log1p(V.rolling(5).mean() / v50.replace(0, np.nan))
    f["kl20_100"] = np.log1p(V.rolling(20).mean() / V.rolling(100).mean().replace(0, np.nan))
    for n in (20, 50):
        up = V.where(r1 > 0, 0.0).rolling(n).sum()
        dn = V.where(r1 < 0, 0.0).rolling(n).sum()
        f[f"ud_kl{n}"] = np.log((up + 1) / (dn + 1))
    gtgd20 = (C * V).rolling(20).mean() / 1e6          # giá nghìn đồng × KL → tỷ đồng
    f["log_gtgd20"] = np.log1p(gtgd20)
    du_lich_su = C.notna().cumsum() >= SO_PHIEN_MIN
    vu_tru = du_lich_su & (gtgd20 >= GTGD_MIN) & (V > 0)
    f["hang_gtgd"] = gtgd20.where(vu_tru).rank(axis=1, pct=True)

    # ---- sức mạnh tương đối ----
    def hang(x):
        return x.where(vu_tru).rank(axis=1, pct=True)

    for n in (20, 60, 120, 250):
        f[f"rs{n}"] = hang(f[f"r{n}"])
    tong = 0.4 * C.pct_change(63, fill_method=None) + 0.2 * C.pct_change(126, fill_method=None) + \
        0.2 * C.pct_change(189, fill_method=None) + 0.2 * f["r250"]
    f["rs_tong"] = hang(tong)
    f["vuot_vni20"] = f["r20"].sub(vc.pct_change(20), axis=0)
    f["vuot_vni60"] = f["r60"].sub(vc.pct_change(60), axis=0)
    rv = vc.pct_change()
    cov = r1.mul(rv, axis=0).rolling(60).mean() - r1.rolling(60).mean().mul(rv.rolling(60).mean(), axis=0)
    f["beta60"] = cov.div(rv.rolling(60).var(ddof=0), axis=0)
    rs_line = C.div(vc, axis=0)
    f["d_dinh_rs60"] = rs_line / rs_line.rolling(60).max() - 1

    # ---- nhóm ngành (ICB cấp 2) ----
    ng = nganh.reindex(cols).fillna("?").astype(str)
    r20u, r60u = f["r20"].where(vu_tru), f["r60"].where(vu_tru)
    tren50 = (C > ma[50]).astype(float).where(vu_tru)
    g20 = r20u.T.groupby(ng).median().T
    g60 = r60u.T.groupby(ng).median().T
    gb = tren50.T.groupby(ng).mean().T
    dem = vu_tru.astype(float).T.groupby(ng).sum().T
    g20, g60 = g20.where(dem >= 3), g60.where(dem >= 3)
    hg20, hg60 = g20.rank(axis=1, pct=True), g60.rank(axis=1, pct=True)
    f["nganh_rs20"] = hg20.reindex(columns=ng.values).set_axis(cols, axis=1)
    f["nganh_rs60"] = hg60.reindex(columns=ng.values).set_axis(cols, axis=1)
    f["nganh_tren_ma50"] = gb.reindex(columns=ng.values).set_axis(cols, axis=1)
    f["hang_trong_nganh20"] = r20u.T.groupby(ng).rank(pct=True).T

    # ---- thị trường chung ----
    vm20, vm50, vm200 = vc.rolling(20).mean(), vc.rolling(50).mean(), vc.rolling(200).mean()
    vv = vni["volume"]
    vr = vc.pct_change()
    thi_truong = {
        "vni_d_ma20": vc / vm20 - 1, "vni_d_ma50": vc / vm50 - 1, "vni_d_ma200": vc / vm200 - 1,
        "vni_r5": vc.pct_change(5), "vni_r20": vc.pct_change(20), "vni_r60": vc.pct_change(60),
        "vni_phan_phoi": ((vr <= -0.002) & (vv > vv.shift(1))).astype(float).rolling(25).sum(),
        "vni_bien_dong20": vr.rolling(20).std(),
        "rong_ma20": (C > ma[20]).where(vu_tru).mean(axis=1),
        "rong_ma50": tren50.mean(axis=1),
        "rong_ma200": (C > ma[200]).where(vu_tru).mean(axis=1),
        "dinh_tru_day20": ((C >= H.rolling(20).max()).where(vu_tru).mean(axis=1)
                           - (C <= L.rolling(20).min()).where(vu_tru).mean(axis=1)),
        "ad10": ((r1 > 0).where(vu_tru).sum(axis=1) - (r1 < 0).where(vu_tru).sum(axis=1)).rolling(10).sum()
        / vu_tru.sum(axis=1).rolling(10).sum().replace(0, np.nan),
    }
    mot = pd.DataFrame(1.0, index=C.index, columns=cols)
    for k, s in thi_truong.items():
        f[k] = mot.mul(s, axis=0)
    f["ma_san"] = mot.mul(san.reindex(cols).map({"HOSE": 0.0, "HNX": 1.0, "UPCOM": 2.0}).fillna(2.0), axis=1)
    f["trong_vu_tru"] = vu_tru
    f["_thi_truong"] = pd.DataFrame(thi_truong)
    f["_gtgd20"] = gtgd20
    return f


# ----------------------------------------------------------------------------------------------
# Mô phỏng lệnh theo luật Việt Nam
# ----------------------------------------------------------------------------------------------
def mo_phong(bang: dict[str, pd.DataFrame], san: pd.Series, muc_tieu: float, cat_lo: float, so_phien: int,
             gap_toi_da: float | None = None, them_phien_khoa: int = 10) -> dict[str, pd.DataFrame]:
    """Kết quả của lệnh mua cho MỌI (ngày tín hiệu t, mã): mua mở cửa t+1, chốt lời +muc_tieu, cắt lỗ −cat_lo,
    bán hết sau `so_phien` phiên nắm giữ (tính từ phiên mua). Trả các bảng: lai (lãi/lỗ ròng sau phí), ly_do
    (1 chốt lời, −1 cắt lỗ, 0 hết thời gian, NaN chưa đủ dữ liệu / không mua được), giu (số phiên nắm giữ)."""
    O, H, L, C, V = (bang[k] for k in ("O", "H", "L", "C", "V"))
    lim = bien_do_san(san.reindex(C.columns))
    ref = C.shift(1)
    tran = ref.mul(1 + lim, axis=1)
    san_gia = ref.mul(1 - lim, axis=1)

    vao = O.shift(-1).to_numpy()
    khoa_tran = (L.shift(-1) >= tran.shift(-1) * 0.997).to_numpy()
    co_gd = (V.shift(-1) > 0).to_numpy()
    mua_duoc = np.isfinite(vao) & ~khoa_tran & co_gd & (vao > 0)
    if gap_toi_da is not None:
        mua_duoc &= vao <= C.to_numpy() * (1 + gap_toi_da)
    tp = vao * (1 + muc_tieu)
    sl = vao * (1 - cat_lo)

    gia_ra = np.full(vao.shape, np.nan)
    ly_do = np.full(vao.shape, np.nan)
    giu = np.full(vao.shape, np.nan)
    con = mua_duoc.copy()
    On, Hn, Ln, Cn, Fn = (x.to_numpy() for x in (O, H, L, C, san_gia))
    n = len(C)
    for j in range(2, so_phien + them_phien_khoa + 1):
        k = 1 + j                       # phiên thoát = t + 1 + j
        if k >= n:
            break
        def tr(a):
            out = np.full(a.shape, np.nan)
            out[:-k] = a[k:]
            return out
        Oj, Hj, Lj, Cj, Fj = tr(On), tr(Hn), tr(Ln), tr(Cn), tr(Fn)
        hop_le = np.isfinite(Cj)
        khoa_san = Hj <= Fj * 1.003
        duoc_ban = con & hop_le & ~khoa_san
        if j == 2:                       # chỉ phiên chiều → xét giá đóng cửa
            cham_tp = Cj >= tp
            cham_sl = Cj <= sl
            px = np.where(cham_tp, tp, Cj * (1 - TRUOT_CAT_LO))
            ra = duoc_ban & (cham_tp | cham_sl)
            ld = np.where(cham_tp, 1.0, -1.0)
        else:
            gap_giam = Oj <= sl
            gap_tang = Oj >= tp
            cham_sl = Lj <= sl
            cham_tp = Hj >= tp
            px = np.where(gap_giam, Oj * (1 - TRUOT_CAT_LO),
                          np.where(gap_tang, Oj, np.where(cham_sl, sl * (1 - TRUOT_CAT_LO), tp)))
            ld = np.where(gap_giam | (cham_sl & ~gap_tang), -1.0, 1.0)
            ra = duoc_ban & (gap_giam | gap_tang | cham_sl | cham_tp)
        if j >= so_phien:                # hết thời gian nắm giữ → bán giá đóng cửa
            het_gio = duoc_ban & ~ra
            px = np.where(het_gio, Cj, px)
            ld = np.where(het_gio, 0.0, ld)
            ra = ra | het_gio
        gia_ra = np.where(ra, px, gia_ra)
        ly_do = np.where(ra, ld, ly_do)
        giu = np.where(ra, j, giu)
        con &= ~ra
    lai = gia_ra * (1 - PHI_BAN) / (vao * (1 + PHI_MUA)) - 1
    idx, cols = C.index, C.columns
    return {"lai": pd.DataFrame(lai, idx, cols), "ly_do": pd.DataFrame(ly_do, idx, cols),
            "giu": pd.DataFrame(giu, idx, cols), "mua_duoc": pd.DataFrame(mua_duoc, idx, cols)}


def mo_phong_mot_ma(df: pd.DataFrame, san: str, ngay_tin_hieu, chot_loi: float, cat_lo: float,
                    so_phien: int) -> dict:
    """Kết quả (đến hiện tại) của một lệnh lướt sóng: tín hiệu cuối phiên `ngay_tin_hieu`, mua mở cửa phiên sau.
    Dùng cho nhật ký gợi ý. ket_qua: "Chờ mua" | "Không mua được" | "Đang giữ" | "Chốt lời" | "Cắt lỗ" | "Hết hạn"."""
    df = df[["open", "high", "low", "close", "volume"]].astype(float)
    ngay = pd.Timestamp(ngay_tin_hieu)
    if ngay not in df.index:
        return {"ket_qua": "Chờ mua"}
    i = int(df.index.get_loc(ngay))
    if i + 1 >= len(df):
        return {"ket_qua": "Chờ mua"}
    bang = {k: df[[c]].set_axis(["X"], axis=1) for k, c in
            (("O", "open"), ("H", "high"), ("L", "low"), ("C", "close"), ("V", "volume"))}
    s = pd.Series({"X": san})
    mp = mo_phong(bang, s, chot_loi, cat_lo, so_phien)
    gia_vao = float(df["open"].iat[i + 1])
    kq = {"ngay_mua": df.index[i + 1].strftime("%Y-%m-%d"), "gia_vao": gia_vao}
    if not bool(mp["mua_duoc"]["X"].iat[i]):
        return {**kq, "ket_qua": "Không mua được"}
    ld = mp["ly_do"]["X"].iat[i]
    gia_cuoi = float(df["close"].iat[-1])
    so_phien_da_giu = len(df) - (i + 1) - 1
    j = len(df) - 1
    if np.isfinite(ld):
        j = min(i + 1 + int(mp["giu"]["X"].iat[i]), len(df) - 1)
    dinh = float(df["high"].iloc[i + 1:j + 1].max())
    day = float(df["low"].iloc[i + 1:j + 1].min())
    kq.update({"lai_max": dinh / gia_vao - 1, "lo_max": day / gia_vao - 1})
    if np.isfinite(ld):
        giu = int(mp["giu"]["X"].iat[i])
        lai = float(mp["lai"]["X"].iat[i])
        gia_ra = (1 + lai) * gia_vao * (1 + PHI_MUA) / (1 - PHI_BAN)
        return {**kq, "ket_qua": {1.0: "Chốt lời", -1.0: "Cắt lỗ", 0.0: "Hết hạn"}[float(ld)],
                "ngay_dong": df.index[j].strftime("%Y-%m-%d"), "gia_dong": gia_ra, "lai": lai, "so_phien": giu}
    lai_tam = gia_cuoi * (1 - PHI_BAN) / (gia_vao * (1 + PHI_MUA)) - 1
    return {**kq, "ket_qua": "Đang giữ", "gia_hien_tai": gia_cuoi, "lai": lai_tam, "so_phien": so_phien_da_giu,
            "ngay_cap_nhat": df.index[-1].strftime("%Y-%m-%d")}


# ----------------------------------------------------------------------------------------------
# Bảng dài (mỗi dòng một (ngày, mã)) – dùng cho nghiên cứu và chấm điểm phiên cuối
# ----------------------------------------------------------------------------------------------
def ma_tran(f: dict, tu_dong: int = 0) -> pd.DataFrame:
    """Gom đặc trưng thành bảng dài: mỗi dòng một (ngày, mã) nằm trong vũ trụ, từ dòng thứ `tu_dong` của bảng
    (tu_dong = -1: chỉ ngày cuối – dùng khi lọc hằng ngày)."""
    vt = f["trong_vu_tru"]
    m = vt.to_numpy(bool).copy()
    m[: (len(m) + tu_dong) if tu_dong < 0 else tu_dong] = False
    ii, jj = np.nonzero(m)
    idx = pd.MultiIndex.from_arrays([vt.index[ii], vt.columns[jj]], names=["ngay", "ma"])
    X = np.empty((len(ii), len(DAC_TRUNG)), np.float32)
    for c, k in enumerate(DAC_TRUNG):
        X[:, c] = f[k].to_numpy(np.float64)[ii, jj]
    X[~np.isfinite(X)] = np.nan
    return pd.DataFrame(X, index=idx, columns=DAC_TRUNG)


# ----------------------------------------------------------------------------------------------
# Quy tắc chọn mã – kết quả nghiên cứu 2014–2026 (xem NGHIEN-CUU-LUOT-SONG.md)
# ----------------------------------------------------------------------------------------------
CHOT_LOI, CAT_LO, SO_PHIEN = 0.07, 0.07, 20
MUA_TOI_DA = 0.02          # không mua nếu giá mở cửa phiên sau cao hơn giá tham chiếu quá 2%
# Điểm tổng hợp: trọng số = hệ số thông tin (IC) trung bình 2014–2026 của các chỉ báo đúng dấu ≥ 70% số năm
TRONG_SO = {"d_dinh250": 0.0765, "d_dinh_rs60": 0.0633, "vt_250": 0.0621, "d_dinh20": 0.0605, "stoch14": 0.0360,
            "rsi14": 0.0311, "d_ma10": 0.0231, "kl5_50": -0.0179, "so_san10": -0.0193, "so_tran10": -0.0218,
            "kl20_100": -0.0275, "do_chat10": -0.0516, "bien_dong20": -0.0685, "atr_pct": -0.0825}
# Kết quả kiểm định 2017–2026 (mua mở cửa phiên sau, +7% / −7% / 20 phiên, đã trừ phí & thuế, tối đa 3 mã/ngày)
LICH_SU = {"tong": {"so_lenh": 2138, "thang": 0.55, "tb": 0.0038},
           "dan_dat": {"so_lenh": 1625, "thang": 0.55, "tb": 0.0038},
           "xac_nhan": {"so_lenh": 129, "thang": 0.62, "tb": 0.0155}}
TEN_LOAI = {"xac_nhan": "thị trường vừa xác nhận tăng lại – mua mã mạnh nhất",
            "dan_dat": "thị trường tăng thuận lợi – mã dẫn dắt ít biến động, sát đỉnh"}


def trang_thai_vni(vni: pd.DataFrame, ty_le_kl: float = 1.0) -> dict:
    """Thị trường ở phiên cuối: che_do (2 tăng thuận lợi / 1 tăng có áp lực / 0 điều chỉnh – giống phần còn lại của
    công cụ) và "ngày xác nhận tăng" (follow-through): VN-Index đang thấp hơn đỉnh 60 phiên ≥ 8%, đã hồi ≥ 3% từ đáy
    20 phiên, hôm nay tăng ≥ 1,2% với khối lượng lớn hơn hôm qua."""
    from .chienluoc import boi_canh_thi_truong
    vni = vni.copy()
    if 0 < ty_le_kl < 1:
        vni.iloc[-1, vni.columns.get_loc("volume")] /= max(ty_le_kl, 0.15)
    c, v = vni["close"], vni["volume"]
    bc = boi_canh_thi_truong(vni)
    r1 = float(c.iat[-1] / c.iat[-2] - 1)
    tu_dinh60 = float(c.iat[-1] / vni["high"].tail(60).max() - 1)
    tu_day20 = float(c.iat[-1] / vni["low"].tail(20).min() - 1)
    xac_nhan = tu_dinh60 <= -0.08 and tu_day20 >= 0.03 and r1 >= 0.012 and bool(v.iat[-1] > v.iat[-2])
    return {"che_do": int(bc["muc"]), "trang_thai": bc["trang_thai"], "xac_nhan": bool(xac_nhan), "r1": r1,
            "tu_dinh60": tu_dinh60, "tu_day20": tu_day20}


def ly_do(x: pd.Series) -> list[str]:
    """Vài lý do dễ hiểu để người dùng biết vì sao mã được chọn."""
    kq = []
    if x.get("d_dinh250", -1) >= -0.1:
        kq.append(f"cách đỉnh 52 tuần {abs(x['d_dinh250']) * 100:.0f}%")
    if x.get("d_dinh_rs60", -1) >= -0.02:
        kq.append("sức mạnh giá so với VN-Index đang ở đỉnh 3 tháng")
    if x.get("atr_pct", 1) <= 0.035:
        kq.append(f"ít biến động (dao động TB {x['atr_pct'] * 100:.1f}%/phiên)")
    if x.get("do_chat10", 1) <= 0.08:
        kq.append(f"10 phiên qua chỉ dao động {x['do_chat10'] * 100:.0f}% (nền chặt)")
    if x.get("kl5_50", 9) <= np.log1p(0.8):
        kq.append("khối lượng đang cạn dần")
    if x.get("rs_tong", 0) >= 0.8:
        kq.append(f"mạnh hơn {x['rs_tong'] * 100:.0f}% cổ phiếu trên thị trường")
    if x.get("nganh_rs60", 0) >= 0.7:
        kq.append("nhóm ngành đang mạnh")
    return kq


def goi_y(du_lieu: dict[str, pd.DataFrame], vni: pd.DataFrame, san: pd.Series, nganh: pd.Series,
          toi_da: int = 3, ty_le_kl: float = 1.0) -> tuple[list[dict], dict]:
    """Các mã lướt sóng của phiên cuối (điểm tổng hợp cao trước) và thông tin thị trường.
    ty_le_kl < 1: phiên cuối đang giao dịch dở → khối lượng được dự phóng cả ngày, tín hiệu chỉ là tạm thời."""
    bang = tao_bang(du_lieu)
    du_phong = 0 < ty_le_kl < 1
    if du_phong:
        bang["V"].iloc[-1] = bang["V"].iloc[-1] / max(ty_le_kl, 0.15)
    tt = trang_thai_vni(vni, ty_le_kl)
    tt["ngay"] = bang["C"].index[-1].strftime("%Y-%m-%d")
    f = dac_trung(bang, vni, nganh, san)
    X = ma_tran(f, tu_dong=-1)
    tt["so_ma"] = int(len(X))
    if X.empty:
        return [], tt
    R = X[list(TRONG_SO)].rank(pct=True) - 0.5
    X["diem"] = (R.fillna(0) * pd.Series(TRONG_SO)).sum(axis=1)
    dan_dat = ((tt["che_do"] == 2) & (X["d_dinh250"] >= -0.10) & (X["d_dinh_rs60"] >= -0.02)
               & (X["atr_pct"] <= 0.035) & (X["d_ma50"] > 0))
    xac_nhan = tt["xac_nhan"] & (X["rs_tong"] >= 0.8) & (X["d_ma50"] > 0)
    X["loai"] = np.select([xac_nhan.to_numpy(), dan_dat.to_numpy()], ["xac_nhan", "dan_dat"], "")
    ung_vien = X[X["loai"] != ""].sort_values("diem", ascending=False)
    tt["so_ung_vien"] = int(len(ung_vien))
    kq = []
    for (ngay, ma), x in ung_vien.head(toi_da).iterrows():
        gia = float(bang["C"].at[ngay, ma])
        kq.append({
            "ma": ma, "san": str(san.get(ma, "")), "ngay": ngay.strftime("%Y-%m-%d"), "gia": gia,
            "loai": x["loai"], "ten_loai": TEN_LOAI[x["loai"]], "diem": float(x["diem"]),
            "mua_toi_da": gia * (1 + MUA_TOI_DA), "chot_loi": gia * (1 + CHOT_LOI), "cat_lo": gia * (1 - CAT_LO),
            "chot_loi_pct": CHOT_LOI, "cat_lo_pct": CAT_LO, "so_phien": SO_PHIEN,
            "lich_su": LICH_SU[x["loai"]], "ly_do": ly_do(x), "du_phong_kl": du_phong,
        })
    return kq, tt


def doc_nganh(ds: pd.DataFrame | None = None) -> pd.Series:
    """Mã ngành ICB cấp 2 của từng mã: từ danh sách mã (VCI) nếu có, thiếu thì lấy bảng tĩnh locphieu/nganh.csv."""
    p = os.path.join(os.path.dirname(os.path.abspath(__file__)), "nganh.csv")
    tinh = pd.read_csv(p, dtype=str).set_index("ma")["nganh"] if os.path.exists(p) else pd.Series(dtype=str)
    if ds is not None and "nganh" in ds.columns:
        moi = ds.set_index("ma")["nganh"].astype(str).replace({"": np.nan, "nan": np.nan}).dropna()
        tinh = moi.combine_first(tinh)
    return tinh
