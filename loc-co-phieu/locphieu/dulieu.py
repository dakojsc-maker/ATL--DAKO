"""Tải dữ liệu giá ngày (OHLCV) cổ phiếu Việt Nam từ các nguồn miễn phí, có bộ nhớ đệm trên đĩa.

Chuẩn hoá đầu ra: index = ngày (Timestamp, không có giờ), cột open/high/low/close tính bằng NGHÌN đồng,
volume tính bằng cổ phiếu (khớp lệnh).

Các nguồn được thử lần lượt; nguồn nào lỗi liên tục sẽ bị bỏ qua trong lần chạy đó:
  VCI  – Vietcap      POST https://trading.vietcap.com.vn/api/chart/OHLCChart/gap-chart   (giá: đồng)
  KBS  – KB Securities GET https://kbbuddywts.kbsec.com.vn/iis-server/investment/stocks/{MÃ}/data_day
  DNSE – Entrade      GET https://services.entrade.com.vn/chart-api/v2/ohlcs/stock
  VND  – VNDirect     GET https://dchart-api.vndirect.com.vn/dchart/history
  CSV  – thư mục CSV tự chuẩn bị (chạy offline, xem README)
Định dạng VCI/KBS lấy theo mã nguồn thư viện vnstock (tháng 10/2026); DNSE/VND theo định dạng
TradingView-UDF quen thuộc. Bộ đọc JSON tự nhận dạng nhiều kiểu trả về để chịu được thay đổi nhỏ.
"""
from __future__ import annotations

import datetime as dt
import json
import os
import re
import threading
import time
from concurrent.futures import ThreadPoolExecutor, as_completed

import pandas as pd

from .thoigian import VN_TZ, gio_vn, moc_chot_du_lieu

try:
    import requests
except ImportError:  # vẫn chạy được chế độ CSV khi chưa cài requests
    requests = None

COT = ["open", "high", "low", "close", "volume"]
CHI_SO = {"VNINDEX", "VN30", "VN100", "HNXINDEX", "HNX30", "UPCOMINDEX", "VNMIDCAP", "VNSML"}

HEADERS_CHUNG = {
    "User-Agent": ("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 "
                   "(KHTML, like Gecko) Chrome/128.0.0.0 Safari/537.36"),
    "Accept": "application/json, text/plain, */*",
    "Accept-Language": "vi-VN,vi;q=0.9,en-US;q=0.8,en;q=0.7",
    "Cache-Control": "no-cache",
    "Pragma": "no-cache",
}

# Tên miền cần được phép truy cập (khi chạy trong môi trường có tường lửa, ví dụ Claude Code trên web).
TEN_MIEN = [
    "trading.vietcap.com.vn",
    "kbbuddywts.kbsec.com.vn",
    "services.entrade.com.vn",
    "dchart-api.vndirect.com.vn",
]


class LoiNguon(Exception):
    """Nguồn trả lỗi hoặc dữ liệu không đọc được."""


class LoiTamThoi(LoiNguon):
    """Lỗi tạm thời (quá tải 429, 5xx, hết thời gian chờ) – nên thử lại."""


class LoiKetNoi(LoiNguon):
    """Không kết nối được hoặc bị chặn (tường lửa, 401/403/407) – nguồn coi như không dùng được."""


# ----------------------------------------------------------------------------------------------
# Đọc & chuẩn hoá JSON
# ----------------------------------------------------------------------------------------------
_ALIAS = {
    "t": "time", "time": "time", "tradingDate": "time", "date": "time", "TradingDate": "time",
    "o": "open", "open": "open", "Open": "open",
    "h": "high", "high": "high", "High": "high",
    "l": "low", "low": "low", "Low": "low",
    "c": "close", "close": "close", "Close": "close",
    "v": "volume", "volume": "volume", "Volume": "volume", "nmVolume": "volume",
}


def _rong() -> pd.DataFrame:
    df = pd.DataFrame(columns=COT, dtype=float)
    df.index = pd.DatetimeIndex([], name="date")
    return df


def doc_json_ohlc(obj, ma: str | None = None) -> pd.DataFrame:
    """Đọc các dạng JSON OHLC thường gặp → DataFrame cột time/open/high/low/close/volume (giá thô)."""
    if isinstance(obj, dict):
        if obj.get("s") == "no_data":
            return pd.DataFrame()
        for khoa in ("data", "data_day", "bars", "items", "result"):
            if khoa in obj and isinstance(obj[khoa], (list, dict)):
                return doc_json_ohlc(obj[khoa], ma)
        mang = {_ALIAS[k]: v for k, v in obj.items() if k in _ALIAS and isinstance(v, list)}
        if "time" in mang and "close" in mang:  # dạng mảng song song (TradingView UDF, VCI, DNSE)
            n = len(mang["time"])
            return pd.DataFrame({k: v for k, v in mang.items() if len(v) == n})
        raise LoiNguon("Không nhận dạng được JSON trả về: khoá " + ", ".join(list(obj)[:8]))
    if isinstance(obj, list):
        if not obj:
            return pd.DataFrame()
        dau = obj[0]
        if isinstance(dau, dict) and any(isinstance(dau.get(k), list) for k in ("c", "close", "t")):
            # VCI: danh sách các mã, mỗi mã là một dict mảng song song
            muc = dau
            if ma:
                muc = next((x for x in obj if str(x.get("symbol", "")).upper() == ma.upper()), dau)
            return doc_json_ohlc({k: v for k, v in muc.items() if k != "symbol"}, ma)
        if isinstance(dau, dict):
            df = pd.DataFrame(obj)
            return df.rename(columns={k: _ALIAS[k] for k in df.columns if k in _ALIAS})
    raise LoiNguon(f"Không nhận dạng được dữ liệu trả về (kiểu {type(obj).__name__})")


def doc_thoi_gian(s) -> pd.Series:
    """Epoch (giây/mili giây) hoặc chuỗi ngày → ngày theo giờ Việt Nam (không múi giờ, 00:00)."""
    s = pd.Series(list(s))
    so = pd.to_numeric(s, errors="coerce")
    if len(s) and so.notna().all():
        x = so.astype("int64")
        don_vi = "ms" if x.abs().max() > 10 ** 11 else "s"
        t = pd.to_datetime(x, unit=don_vi, utc=True)
    else:
        t = pd.to_datetime(s.astype(str), utc=True, errors="coerce")
    return t.dt.tz_convert(VN_TZ).dt.tz_localize(None).dt.normalize()


def chuan_hoa(raw: pd.DataFrame, don_vi: str = "auto", la_chi_so: bool = False) -> pd.DataFrame:
    """Chuẩn hoá về index ngày + cột giá (nghìn đồng) và khối lượng.

    don_vi: "vnd" (chia 1000), "nghin" (giữ nguyên) hoặc "auto" (đoán theo trung vị giá đóng cửa).
    """
    if raw is None or len(raw) == 0:
        return _rong()
    raw = raw.copy()
    if "volume" not in raw.columns:
        raw["volume"] = 0.0
    thieu = [c for c in ["time", "open", "high", "low", "close"] if c not in raw.columns]
    if thieu:
        raise LoiNguon("Thiếu cột: " + ", ".join(thieu))
    df = pd.DataFrame({"date": doc_thoi_gian(raw["time"]).to_numpy()})
    for c in COT:
        df[c] = pd.to_numeric(pd.Series(list(raw[c])), errors="coerce").to_numpy()
    df = df.dropna(subset=["date", "close"])
    df = df[df["close"] > 0].copy()
    if df.empty:
        return _rong()
    if not la_chi_so:
        chia = don_vi == "vnd" or (don_vi == "auto" and float(df["close"].median()) > 1000)
        if chia:
            for c in ["open", "high", "low", "close"]:
                df[c] = df[c] / 1000.0
    df["open"] = df["open"].where(df["open"] > 0, df["close"])
    df["volume"] = df["volume"].fillna(0.0).clip(lower=0)
    gia = df[["open", "high", "low", "close"]]
    df["high"] = gia.max(axis=1)
    df["low"] = gia.min(axis=1)
    df = df.drop_duplicates("date", keep="last").sort_values("date").set_index("date")
    return df[COT].astype(float)


# ----------------------------------------------------------------------------------------------
# Các nguồn dữ liệu
# ----------------------------------------------------------------------------------------------
_tls = threading.local()


def _http():
    if requests is None:
        raise LoiNguon("Chưa cài thư viện requests: pip install requests")
    s = getattr(_tls, "s", None)
    if s is None:
        s = requests.Session()
        s.headers.update(HEADERS_CHUNG)
        _tls.s = s
    return s


def _goi(phuong_thuc: str, url: str, timeout: float = 20, **kw):
    phien = _http()
    try:
        r = phien.request(phuong_thuc, url, timeout=timeout, **kw)
    except requests.exceptions.Timeout as e:
        raise LoiTamThoi(f"Hết thời gian chờ: {url}") from e
    except requests.exceptions.ConnectionError as e:
        raise LoiKetNoi(f"Không kết nối được {url.split('/')[2]} ({type(e).__name__})") from e
    if r.status_code == 429 or r.status_code >= 500:
        raise LoiTamThoi(f"HTTP {r.status_code} từ {url.split('/')[2]}")
    if r.status_code in (401, 403, 407):
        raise LoiKetNoi(f"HTTP {r.status_code} từ {url.split('/')[2]} (bị chặn)")
    if r.status_code >= 400:
        raise LoiNguon(f"HTTP {r.status_code} từ {url.split('/')[2]}")
    try:
        return r.json()
    except ValueError as e:
        raise LoiNguon(f"{url.split('/')[2]} không trả JSON") from e


class Nguon:
    ten = "?"
    mo_ta = ""
    don_vi = "auto"

    def lay(self, ma: str, so_phien: int, la_chi_so: bool = False) -> pd.DataFrame:
        raise NotImplementedError

    @staticmethod
    def _khoang(so_phien: int):
        den = dt.datetime.now(dt.timezone.utc) + dt.timedelta(days=1)
        tu = den - dt.timedelta(days=int(so_phien * 1.5) + 15)
        return tu, den


class NguonVCI(Nguon):
    ten = "VCI"
    mo_ta = "Vietcap – trading.vietcap.com.vn"
    don_vi = "vnd"
    URL = "https://trading.vietcap.com.vn/api/chart/OHLCChart/gap-chart"
    URL_DS = "https://trading.vietcap.com.vn/api/price/symbols/getAll"
    HEADERS = {"Referer": "https://trading.vietcap.com.vn/", "Origin": "https://trading.vietcap.com.vn/",
               "Content-Type": "application/json"}

    def lay(self, ma, so_phien, la_chi_so=False):
        _, den = self._khoang(so_phien)
        data = _goi("POST", self.URL, headers=self.HEADERS,
                    json={"timeFrame": "ONE_DAY", "symbols": [ma], "to": int(den.timestamp()),
                          "countBack": int(so_phien)})
        return chuan_hoa(doc_json_ohlc(data, ma), self.don_vi, la_chi_so)

    def danh_sach(self) -> pd.DataFrame:
        data = _goi("GET", self.URL_DS, headers=self.HEADERS)
        if isinstance(data, dict):
            data = data.get("data", data.get("items", []))
        df = pd.DataFrame(data)
        if df.empty or "symbol" not in df.columns:
            raise LoiNguon("VCI: danh sách mã rỗng")
        if "type" in df.columns:
            df = df[df["type"].astype(str).str.upper() == "STOCK"]
        san = df["board"] if "board" in df.columns else df.get("exchange", "")
        ten = df["organShortName"] if "organShortName" in df.columns else df.get("organName", "")
        nganh = df["icbCode2"] if "icbCode2" in df.columns else ""
        return pd.DataFrame({"ma": df["symbol"], "san": san, "ten": ten, "nganh": nganh})


class NguonKBS(Nguon):
    ten = "KBS"
    mo_ta = "KB Securities – kbbuddywts.kbsec.com.vn"
    don_vi = "vnd"
    URL = "https://kbbuddywts.kbsec.com.vn/iis-server/investment/{loai}/{ma}/data_day"
    URL_DS = "https://kbbuddywts.kbsec.com.vn/iis-server/investment/stock/search/data"

    def lay(self, ma, so_phien, la_chi_so=False):
        tu, den = self._khoang(so_phien)
        url = self.URL.format(loai="index" if la_chi_so else "stocks", ma=ma)
        data = _goi("GET", url, params={"sdate": tu.astimezone(VN_TZ).strftime("%d-%m-%Y"),
                                        "edate": den.astimezone(VN_TZ).strftime("%d-%m-%Y")})
        return chuan_hoa(doc_json_ohlc(data, ma), self.don_vi, la_chi_so)

    def danh_sach(self) -> pd.DataFrame:
        data = _goi("GET", self.URL_DS)
        if isinstance(data, dict):
            data = data.get("data", [])
        df = pd.DataFrame(data)
        if df.empty or "symbol" not in df.columns:
            raise LoiNguon("KBS: danh sách mã rỗng")
        if "type" in df.columns:
            df = df[df["type"].astype(str).str.lower() == "stock"]
        return pd.DataFrame({"ma": df["symbol"], "san": df.get("exchange", ""), "ten": df.get("name", "")})


class NguonDNSE(Nguon):
    ten = "DNSE"
    mo_ta = "DNSE/Entrade – services.entrade.com.vn"
    URL = "https://services.entrade.com.vn/chart-api/v2/ohlcs/{loai}"

    def lay(self, ma, so_phien, la_chi_so=False):
        tu, den = self._khoang(so_phien)
        data = _goi("GET", self.URL.format(loai="index" if la_chi_so else "stock"),
                    params={"from": int(tu.timestamp()), "to": int(den.timestamp()),
                            "symbol": ma, "resolution": "1D"})
        return chuan_hoa(doc_json_ohlc(data, ma), self.don_vi, la_chi_so)


class NguonVND(Nguon):
    ten = "VND"
    mo_ta = "VNDirect – dchart-api.vndirect.com.vn"
    URL = "https://dchart-api.vndirect.com.vn/dchart/history"
    HEADERS = {"Referer": "https://dchart.vndirect.com.vn/", "Origin": "https://dchart.vndirect.com.vn"}

    def lay(self, ma, so_phien, la_chi_so=False):
        tu, den = self._khoang(so_phien)
        data = _goi("GET", self.URL, headers=self.HEADERS,
                    params={"resolution": "D", "symbol": ma, "from": int(tu.timestamp()),
                            "to": int(den.timestamp())})
        return chuan_hoa(doc_json_ohlc(data, ma), self.don_vi, la_chi_so)


class NguonCSV(Nguon):
    """Đọc <thư mục>/<MÃ>.csv. Nhận cột tiếng Anh hoặc tiếng Việt: date/ngay, open/mo, high/cao,
    low/thap, close/dong, volume/kl. Giá theo đồng hay nghìn đồng đều được (tự nhận biết)."""
    ten = "CSV"
    mo_ta = "Thư mục CSV"
    _COT = {"date": "time", "ngay": "time", "time": "time", "datetime": "time",
            "open": "open", "mo": "open", "mo_cua": "open",
            "high": "high", "cao": "high", "cao_nhat": "high",
            "low": "low", "thap": "low", "thap_nhat": "low",
            "close": "close", "dong": "close", "dong_cua": "close", "adj close": "close",
            "volume": "volume", "kl": "volume", "khoi_luong": "volume", "vol": "volume"}

    def __init__(self, thu_muc: str):
        self.thu_muc = thu_muc

    def lay(self, ma, so_phien, la_chi_so=False):
        duong_dan = os.path.join(self.thu_muc, f"{ma}.csv")
        if not os.path.exists(duong_dan):
            return _rong()
        raw = pd.read_csv(duong_dan)
        raw.columns = [self._COT.get(str(c).strip().lower(), str(c).strip().lower()) for c in raw.columns]
        if "time" in raw.columns:
            chuoi = raw["time"].astype(str).str.strip()
            # dd/mm/yyyy (kiểu Việt Nam, ví dụ tệp tải từ CafeF) → ngày đứng trước
            kieu_vn = chuoi.str.fullmatch(r"\d{1,2}[/.-]\d{1,2}[/.-]\d{4}").mean() > 0.5
            try:
                ngay = pd.to_datetime(chuoi, errors="coerce", dayfirst=bool(kieu_vn),
                                      format=None if kieu_vn else "mixed")
            except (TypeError, ValueError):  # pandas < 2.0 không có format="mixed"
                ngay = pd.to_datetime(chuoi, errors="coerce", dayfirst=bool(kieu_vn))
            raw["time"] = ngay.dt.strftime("%Y-%m-%d")
        return chuan_hoa(raw, self.don_vi, la_chi_so).tail(so_phien)


NGUON = {"VCI": NguonVCI, "KBS": NguonKBS, "DNSE": NguonDNSE, "VND": NguonVND}


# ----------------------------------------------------------------------------------------------
# Danh sách mã dự phòng (khi không lấy được danh sách từ VCI/KBS). Có thể đã cũ – chỉ để chữa cháy.
# ----------------------------------------------------------------------------------------------
_DU_PHONG = {
    "HOSE": """AAA ACB AGG AGR ANV APH ASM BAF BCG BCM BFC BIC BID BMP BSI BSR BVH BWE CII CMG CRE CSM
        CSV CTD CTG CTI CTS DBC DCM DGC DGW DHC DIG DPG DPM DPR DRC DXG DXS EIB ELC EVF FCN FMC FPT FRT
        FTS GAS GEE GEX GIL GMD GVR HAG HAH HAX HCM HDB HDC HDG HHS HHV HPG HQC HSG HT1 HVN IDI IJC IMP
        ITA KBC KDC KDH KHG KOS KSB LCG LHG LPB MBB MSB MSH MSN MWG NAB NAF NKG NLG NT2 NTL NVL OCB ORS
        PAN PC1 PDR PET PHR PLX PNJ POW PTB PVD PVT QCG REE SAB SAM SBT SCR SCS SHB SIP SJS SKG SSB SSI
        STB SZC TCB TCH TCM TCX TDC TLG TLH TNH TPB TV2 VCB VCG VCI VDS VGC VHC VHM VIB VIC VIX VJC VND
        VNM VOS VPB VPI VPL VRE VSC VTP YEG""",
    "HNX": """AMV API APS BAB BCC BVS CEO DDG DHT DTD DXP EVS HLD HUT IDC IDJ IVS L14 LAS MBS MST NBC NTP
        NVB PLC PSD PVB PVC PVI PVS S99 SHS TAR TDN THD TIG TNG TVC VC3 VCS VGS VIG""",
    "UPCOM": """ABB ACV BVB C4G CTR DDV DRI FOX G36 HBC HNG KLB LTG MCH MML MPC MSR NTC OIL PAT PHP PXL QNS
        SBS SGB SGP VAB VEA VEF VGI VGT VNZ""",
}


def danh_sach_du_phong() -> pd.DataFrame:
    hang = [(m, san, "") for san, chuoi in _DU_PHONG.items() for m in chuoi.split()]
    return pd.DataFrame(hang, columns=["ma", "san", "ten"])


def chuan_hoa_san(x) -> str:
    x = str(x or "").strip().upper()
    if x in ("HSX", "HOSE", "HCM"):
        return "HOSE"
    if x in ("HNX", "HASTC", "HN"):
        return "HNX"
    if x in ("UPCOM", "UPCOMX"):
        return "UPCOM"
    return ""


# ----------------------------------------------------------------------------------------------
# Kho dữ liệu: chọn nguồn, bộ nhớ đệm, tải song song
# ----------------------------------------------------------------------------------------------
class KhoDuLieu:
    SO_PHIEN_DAY_DU = 420     # ~1,7 năm: đủ cho MA250, đỉnh 52 tuần, sức mạnh giá 12 tháng
    SO_PHIEN_CAP_NHAT = 30

    def __init__(self, nguon: list[Nguon], thu_muc_cache: str | None = None, dung_cache: bool = True,
                 so_luong: int = 4, log=print):
        self.nguon = nguon
        self.cache = thu_muc_cache
        self.dung_cache = dung_cache and bool(thu_muc_cache)
        self.so_luong = max(1, int(so_luong))
        self.log = log
        self._khoa = threading.Lock()
        self._loi_lien_tiep = {n.ten: 0 for n in nguon}
        self._tat = set()
        self.loi_gan_nhat: dict[str, str] = {}
        self.dem_nguon: dict[str, int] = {}
        if self.cache:
            os.makedirs(os.path.join(self.cache, "gia"), exist_ok=True)

    # ---------- bộ nhớ đệm ----------
    def _tep(self, ma: str) -> str:
        return os.path.join(self.cache, "gia", f"{ma}.csv")

    def doc_cache(self, ma: str):
        """→ (DataFrame | None, thời điểm cập nhật dạng epoch)."""
        if not self.cache:
            return None, 0.0
        p = self._tep(ma)
        if not os.path.exists(p):
            return None, 0.0
        try:
            df = pd.read_csv(p, index_col=0, parse_dates=[0])
            df.index = pd.DatetimeIndex(df.index).normalize()
            df.index.name = "date"
            return df[COT].astype(float), os.path.getmtime(p)
        except Exception:
            return None, 0.0

    def ghi_cache(self, ma: str, df: pd.DataFrame):
        if not self.cache or df is None or df.empty:
            return
        tmp = self._tep(ma) + ".tmp"
        df.to_csv(tmp, date_format="%Y-%m-%d", float_format="%.4f")
        os.replace(tmp, self._tep(ma))

    # ---------- gọi nguồn ----------
    def _tu_nguon(self, ma: str, so_phien: int, la_chi_so: bool) -> pd.DataFrame:
        loi = []
        for n in self.nguon:
            if n.ten in self._tat:
                continue
            for lan in range(3):
                try:
                    df = n.lay(ma, so_phien, la_chi_so)
                    with self._khoa:
                        self._loi_lien_tiep[n.ten] = 0
                    if df is not None and not df.empty:
                        with self._khoa:
                            self.dem_nguon[n.ten] = self.dem_nguon.get(n.ten, 0) + 1
                        return df
                    loi.append(f"{n.ten}: không có dữ liệu")
                    break
                except LoiTamThoi as e:
                    loi.append(f"{n.ten}: {e}")
                    time.sleep(1.5 * (lan + 1))
                except LoiKetNoi as e:  # bị chặn / mất kết nối: đếm để tạm bỏ nguồn
                    loi.append(f"{n.ten}: {e}")
                    with self._khoa:
                        self._loi_lien_tiep[n.ten] += 1
                        if self._loi_lien_tiep[n.ten] >= 6 and n.ten not in self._tat:
                            self._tat.add(n.ten)
                            self.log(f"  ! Tạm bỏ nguồn {n.ten} trong lần chạy này (lỗi liên tục: {e})")
                    break
                except Exception as e:  # mã không có ở nguồn này, định dạng lạ… → sang nguồn kế tiếp
                    loi.append(f"{n.ten}: {e}")
                    break
        self.loi_gan_nhat[ma] = " | ".join(loi[-3:]) or "không có nguồn nào khả dụng"
        return _rong()

    @staticmethod
    def _ghep(cu: pd.DataFrame, moi: pd.DataFrame):
        """Ghép dữ liệu mới vào cache. Trả None nếu giá cũ đã bị điều chỉnh (cổ tức, tách cổ phiếu…)."""
        chung = cu.index.intersection(moi.index)
        if len(chung) == 0:
            return None if moi.index.min() > cu.index.max() + pd.Timedelta(days=10) else \
                pd.concat([cu, moi]).sort_index()
        so_sanh = chung[:-2] if len(chung) > 5 else chung
        lech = (cu.loc[so_sanh, "close"] / moi.loc[so_sanh, "close"] - 1).abs().max()
        if lech > 0.01:
            return None
        return pd.concat([cu[~cu.index.isin(moi.index)], moi]).sort_index()

    def tai(self, ma: str, la_chi_so: bool | None = None, bat_buoc_moi: bool = False,
            den_ngay=None) -> pd.DataFrame:
        """Dữ liệu ngày của một mã (đã chuẩn hoá). `bat_buoc_moi`: luôn hỏi nguồn (dùng trong phiên)."""
        ma = ma.upper().strip()
        if la_chi_so is None:
            la_chi_so = ma in CHI_SO
        cu, mtime = self.doc_cache(ma) if self.dung_cache else (None, 0.0)
        now = gio_vn()
        moc = moc_chot_du_lieu(now).timestamp()
        if den_ngay is not None and cu is not None and len(cu) and cu.index.max() >= pd.Timestamp(den_ngay):
            return cu  # chạy lại một ngày trong quá khứ: cache đã có đủ
        # nến hôm nay lưu từ lần chạy trong phiên (trước 15:30) là nến dở dang → phải tải lại
        nen_do_dang = cu is not None and len(cu) and cu.index.max().date() == now.date() and \
            mtime < now.replace(hour=15, minute=30, second=0, microsecond=0).timestamp()
        if cu is not None and len(cu) >= 200 and mtime >= moc and not bat_buoc_moi and not nen_do_dang:
            return cu
        if isinstance(self.nguon[0], NguonCSV) and len(self.nguon) == 1:
            return self._tu_nguon(ma, self.SO_PHIEN_DAY_DU, la_chi_so)
        if cu is not None and len(cu) >= 200:
            moi = self._tu_nguon(ma, self.SO_PHIEN_CAP_NHAT, la_chi_so)
            if moi.empty:
                return cu  # nguồn lỗi: dùng tạm cache
            ghep = self._ghep(cu, moi)
            if ghep is not None:
                self.ghi_cache(ma, ghep)
                return ghep
        df = self._tu_nguon(ma, self.SO_PHIEN_DAY_DU, la_chi_so)
        if df.empty and cu is not None:
            return cu
        self.ghi_cache(ma, df)
        return df

    def tai_nhieu(self, ds_ma: list[str], bat_buoc_moi: bool = False, den_ngay=None,
                  bo_qua=None) -> dict[str, pd.DataFrame]:
        """Tải song song nhiều mã. `bo_qua(ma)` → True thì chỉ dùng cache (mã kém thanh khoản)."""
        kq: dict[str, pd.DataFrame] = {}
        tong = len(ds_ma)
        bat_dau = time.time()

        def _mot(ma):
            if bo_qua is not None and bo_qua(ma):
                cu, _ = self.doc_cache(ma)
                if cu is not None:
                    return ma, cu
            return ma, self.tai(ma, bat_buoc_moi=bat_buoc_moi, den_ngay=den_ngay)

        with ThreadPoolExecutor(max_workers=self.so_luong) as ex:
            tuong_lai = [ex.submit(_mot, m) for m in ds_ma]
            for i, f in enumerate(as_completed(tuong_lai), 1):
                ma, df = f.result()
                if df is not None and not df.empty:
                    kq[ma] = df
                if tong >= 50 and (i % 100 == 0 or i == tong):
                    self.log(f"  … {i}/{tong} mã ({time.time() - bat_dau:.0f}s)")
        return kq

    # ---------- danh sách mã ----------
    def danh_sach_ma(self, san: list[str] | None = None) -> pd.DataFrame:
        """Danh sách cổ phiếu (ma, san, ten). Cache 7 ngày; dự phòng bằng danh sách cứng."""
        p = os.path.join(self.cache, "danh-sach-ma.csv") if self.cache else None
        df = None
        if p and os.path.exists(p) and time.time() - os.path.getmtime(p) < 7 * 86400:
            try:
                df = pd.read_csv(p, dtype=str, keep_default_na=False)
            except Exception:
                df = None
        if df is None:
            for n in self.nguon:
                if not hasattr(n, "danh_sach"):
                    continue
                try:
                    df = n.danh_sach()
                    self.log(f"  Danh sách mã lấy từ {n.ten}: {len(df)} mã")
                    break
                except Exception as e:
                    self.log(f"  ! Không lấy được danh sách mã từ {n.ten}: {e}")
            if df is None:
                df = danh_sach_du_phong()
                self.log(f"  ! Dùng danh sách mã dự phòng ({len(df)} mã thanh khoản tốt, có thể đã cũ).")
            df = df.copy()
            df["ma"] = df["ma"].astype(str).str.upper().str.strip()
            df["san"] = df["san"].map(chuan_hoa_san)
            df["ten"] = df["ten"].fillna("").astype(str)
            df = df[df["ma"].str.fullmatch(r"[A-Z0-9]{3}") & (df["san"] != "")]
            df = df.drop_duplicates("ma").sort_values(["san", "ma"]).reset_index(drop=True)
            if p and not df.empty and len(df) > 300:
                df.to_csv(p, index=False)
        if san:
            df = df[df["san"].isin([chuan_hoa_san(s) for s in san])]
        return df.reset_index(drop=True)

    # ---------- kiểm tra kết nối ----------
    def kiem_tra(self, ma_thu=("DRI", "MSR", "VNINDEX")) -> list[tuple]:
        """Thử từng nguồn với vài mã → [(nguồn, mã, kết quả, mô tả)]."""
        kq = []
        for n in self.nguon:
            for ma in ma_thu:
                t0 = time.time()
                try:
                    df = n.lay(ma, 30, ma in CHI_SO)
                    if df.empty:
                        kq.append((n.ten, ma, False, "không có dữ liệu"))
                    else:
                        cuoi = df.iloc[-1]
                        kq.append((n.ten, ma, True,
                                   f"{len(df)} phiên, phiên cuối {df.index[-1]:%d/%m/%Y} đóng cửa "
                                   f"{cuoi['close']:.2f}, KL {cuoi['volume']:,.0f} ({time.time() - t0:.1f}s)"))
                except Exception as e:
                    kq.append((n.ten, ma, False, str(e)[:160]))
            if hasattr(n, "danh_sach"):
                try:
                    ds = n.danh_sach()
                    kq.append((n.ten, "danh sách mã", True, f"{len(ds)} mã"))
                except Exception as e:
                    kq.append((n.ten, "danh sách mã", False, str(e)[:160]))
        return kq


# ----------------------------------------------------------------------------------------------
# Thanh khoản đã biết (để lần sau bỏ qua mã quá kém thanh khoản, đỡ tải)
# ----------------------------------------------------------------------------------------------
def doc_thanh_khoan(thu_muc_cache: str | None) -> dict:
    if not thu_muc_cache:
        return {}
    p = os.path.join(thu_muc_cache, "thanh-khoan.json")
    try:
        with open(p, encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {}


def ghi_thanh_khoan(thu_muc_cache: str | None, du_lieu: dict[str, pd.DataFrame]):
    if not thu_muc_cache:
        return
    cu = doc_thanh_khoan(thu_muc_cache)
    for ma, df in du_lieu.items():
        if df is None or len(df) < 20:
            continue
        gtgd = float((df["close"] * df["volume"]).tail(20).mean() / 1e6)
        cu[ma] = {"gtgd20": round(gtgd, 3), "ngay": f"{df.index[-1]:%Y-%m-%d}"}
    with open(os.path.join(thu_muc_cache, "thanh-khoan.json"), "w", encoding="utf-8") as f:
        json.dump(cu, f, ensure_ascii=False)


def la_ngay_hom_nay(df: pd.DataFrame, now=None) -> bool:
    if df is None or df.empty:
        return False
    return df.index[-1].date() == gio_vn(now).date()


def cat_den_ngay(df: pd.DataFrame, den_ngay) -> pd.DataFrame:
    if den_ngay is None or df is None:
        return df
    return df[df.index <= pd.Timestamp(den_ngay)]


__all__ = ["KhoDuLieu", "NGUON", "NguonCSV", "NguonVCI", "NguonKBS", "NguonDNSE", "NguonVND",
           "LoiNguon", "LoiKetNoi", "TEN_MIEN", "CHI_SO", "doc_json_ohlc", "chuan_hoa", "doc_thoi_gian",
           "danh_sach_du_phong", "doc_thanh_khoan", "ghi_thanh_khoan", "la_ngay_hom_nay", "cat_den_ngay"]
