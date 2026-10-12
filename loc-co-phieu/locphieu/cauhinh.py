"""Tham số chiến lược "nền chặt sát đỉnh → bùng nổ khối lượng" (mẫu DRI, MSR tháng 9–10/2026).

Đơn vị: giá = nghìn đồng, giá trị giao dịch = tỷ đồng, độ dài = số phiên (5 phiên ≈ 1 tuần).
Các con số mặc định được hiệu chỉnh để bắt đúng hai ca DRI và MSR; xem PHAN-TICH-DRI-MSR.md.
"""
from __future__ import annotations

from dataclasses import dataclass


@dataclass
class CauHinh:
    # ---------- Lọc sơ bộ ----------
    gia_min: float = 5.0             # bỏ cổ phiếu dưới 5.000 đ
    gtgd_min: float = 3.0            # giá trị giao dịch bình quân 20 phiên tối thiểu (tỷ đồng)
    so_phien_min: int = 120          # cần tối thiểu 120 phiên lịch sử

    # ---------- Xu hướng (biểu đồ tuần của bạn: MA20 tuần ≈ MA100 ngày, MA50 tuần ≈ MA250 ngày) ----------
    ma_trung_han: int = 100
    ma_dai_han: int = 250
    gan_dinh_1nam: float = 0.75      # đỉnh nền ≥ 75% đỉnh cao nhất 1 năm

    # ---------- Nhịp tăng trước nền ("cán cờ") ----------
    can_co_phien: int = 60           # tìm đáy rũ bỏ trong 60 phiên (12 tuần) trước nền
    can_co_tang_min: float = 0.15    # từ đáy đó lên đỉnh nền tăng ≥ 15% (DRI +23%, MSR +58%)

    # ---------- Nền tích lũy sát đỉnh ----------
    nen_do_dai: tuple = (10, 15, 20, 25, 30)   # 2–6 tuần (DRI 4 tuần, MSR 3 tuần)
    nen_bien_do_max: float = 0.12              # (cao nhất − thấp nhất)/cao nhất; DRI ~9%, MSR ~8%
    nen_bien_do_dong_cua_max: float = 0.08     # cùng phép đo nhưng theo giá đóng cửa
    nen_hoi_max: float = 0.50                  # nền không hồi quá 50% nhịp tăng trước đó
    kl_can_max: float = 0.75                   # KL TB 5 phiên thấp nhất trong nền ≤ 75% KL TB 50 phiên

    # ---------- Điểm mua (breakout) ----------
    kl_breakout_min: float = 1.5             # KL phiên vượt nền ≥ 1,5× TB 20 phiên trước đó
    vi_tri_dong_cua_min: float = 0.5         # đóng cửa ở nửa trên biên độ phiên
    mua_toi_da_tren_pivot: float = 0.05      # không mua đuổi quá 5% trên pivot
    so_phien_breakout_gan: int = 5           # breakout ≤ 5 phiên trước vẫn mua được nếu còn trong vùng mua
    that_bai_duoi_pivot: float = 0.03        # đóng cửa thấp hơn pivot > 3% sau breakout = thất bại

    # ---------- Quản trị vị thế ----------
    cat_lo_max: float = 0.07                 # cắt lỗ tối đa 7% dưới giá mua
    chot_loi_1: float = 0.20                 # mục tiêu 1: +20% từ pivot
    nong_ma20: float = 0.15                  # giá cách MA20 ngày > 15% → tăng nóng
    nong_ma50: float = 0.30                  # giá cách MA50 ngày > 30% → tăng nóng
    rui_ro_moi_lenh: float = 0.01            # mỗi lệnh chỉ chấp nhận mất 1% tổng vốn
    ty_trong_toi_da: float = 0.25            # một mã không quá 25% tổng vốn
    theo_doi_sau_breakout: int = 40          # theo dõi tối đa 40 phiên (8 tuần) sau breakout
