"""Chỉ báo kỹ thuật cơ bản (thuần pandas, không cần thư viện TA)."""
from __future__ import annotations

import numpy as np
import pandas as pd


def sma(s: pd.Series, n: int, min_periods: int | None = None) -> pd.Series:
    return s.rolling(n, min_periods=min_periods or n).mean()


def ema(s: pd.Series, n: int) -> pd.Series:
    return s.ewm(span=n, adjust=False).mean()


def rsi(close: pd.Series, n: int = 14) -> pd.Series:
    """RSI kiểu Wilder."""
    d = close.diff()
    tang = d.clip(lower=0).ewm(alpha=1 / n, adjust=False).mean()
    giam = (-d.clip(upper=0)).ewm(alpha=1 / n, adjust=False).mean()
    rs = tang / giam.replace(0, np.nan)
    return (100 - 100 / (1 + rs)).fillna(100.0)


def atr(df: pd.DataFrame, n: int = 14) -> pd.Series:
    c_truoc = df["close"].shift(1)
    tr = pd.concat([df["high"] - df["low"], (df["high"] - c_truoc).abs(), (df["low"] - c_truoc).abs()], axis=1)
    return tr.max(axis=1).ewm(alpha=1 / n, adjust=False).mean()


def gtgd_ty(df: pd.DataFrame, n: int = 20) -> pd.Series:
    """Giá trị giao dịch bình quân n phiên, tỷ đồng (giá nghìn đồng × KL cổ phiếu / 1e6)."""
    return (df["close"] * df["volume"]).rolling(n, min_periods=max(5, n // 2)).mean() / 1e6


def nen_tuan(df: pd.DataFrame) -> pd.DataFrame:
    """Gộp nến ngày thành nến tuần (kết thúc thứ Sáu) – giống biểu đồ 1W trên TradingView."""
    w = df.resample("W-FRI").agg({"open": "first", "high": "max", "low": "min", "close": "last",
                                  "volume": "sum"})
    return w.dropna(subset=["close"])


def rs_tho(close: pd.Series) -> float:
    """Sức mạnh giá kiểu IBD: 40% hiệu suất 3 tháng + 20% mỗi mốc 6, 9, 12 tháng."""
    c = close.dropna()
    phan = []
    for w, n in ((0.4, 63), (0.2, 126), (0.2, 189), (0.2, 252)):
        if len(c) > n and c.iloc[-1 - n] > 0:
            phan.append((w, c.iloc[-1] / c.iloc[-1 - n] - 1))
    if not phan:
        return float("nan")
    return sum(w * r for w, r in phan) / sum(w for w, _ in phan)


def hieu_suat(close: pd.Series, n: int) -> float:
    c = close.dropna()
    if len(c) <= n or c.iloc[-1 - n] <= 0:
        return float("nan")
    return float(c.iloc[-1] / c.iloc[-1 - n] - 1)
