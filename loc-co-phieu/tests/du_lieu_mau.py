"""Dữ liệu ngày THẬT của DRI, MSR và VN-Index (nguồn VCI, giá đã điều chỉnh, từ 05/02/2025 đến 09/10/2026),
lưu sẵn trong tests/du_lieu/ để kiểm thử không cần mạng. Đây là hai ca mẫu mà công cụ được xây dựng để bắt:
  MSR: nền 3/9–18/9/2026 (đỉnh 49,06) → breakout 21/9 (đóng cửa 51,90, KL 2,4× TB20)
  DRI: nền 24/8–22/9/2026 (đỉnh 14,17) → breakout 23/9 (đóng cửa 14,50, KL 2,4× TB20)
"""
from __future__ import annotations

import os

import pandas as pd

THU_MUC = os.path.join(os.path.dirname(os.path.abspath(__file__)), "du_lieu")


def du_lieu(ma: str) -> pd.DataFrame:
    df = pd.read_csv(os.path.join(THU_MUC, f"{ma.upper()}.csv"), index_col=0, parse_dates=True)
    df.index.name = "date"
    return df[["open", "high", "low", "close", "volume"]].astype(float)


def vnindex_mau() -> pd.DataFrame:
    return du_lieu("VNINDEX")
