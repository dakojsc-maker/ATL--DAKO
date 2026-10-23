"""Đồng hồ phiên giao dịch chứng khoán Việt Nam (giờ Việt Nam UTC+7, không có giờ mùa hè).

Lịch phiên (sau khi HOSE chuyển sang hệ thống KRX, 5/2025):
  HOSE : ATO 9:00–9:15 · khớp liên tục 9:15–11:30 · nghỉ trưa · 13:00–14:30 · ATC 14:30–14:45
  HNX  : khớp liên tục 9:00–11:30 · 13:00–14:30 · ATC 14:30–14:45 · PLO 14:45–15:00
  UPCOM: khớp liên tục 9:00–11:30 · 13:00–15:00 (không có ATC)
Ngày lễ không được xử lý — vào ngày lễ công cụ coi như ngày thường nhưng sẽ không có nến mới.
"""
from __future__ import annotations

import datetime as dt
from dataclasses import dataclass

VN_TZ = dt.timezone(dt.timedelta(hours=7), "ICT")


def gio_vn(now: dt.datetime | None = None) -> dt.datetime:
    """Giờ Việt Nam hiện tại, hoặc quy đổi `now` sang giờ Việt Nam (giờ không múi coi là giờ VN)."""
    if now is None:
        return dt.datetime.now(VN_TZ)
    if now.tzinfo is None:
        return now.replace(tzinfo=VN_TZ)
    return now.astimezone(VN_TZ)


def _p(h: int, m: int) -> int:
    return h * 60 + m


# Tỷ lệ khối lượng khớp lệnh luỹ kế trong ngày theo giờ — ước lượng dạng chữ U (sôi động đầu và
# cuối phiên). Chỉ dùng để dự phóng khối lượng cả ngày khi chạy trong phiên, nên là con số gần đúng.
_LUY_KE = {
    "HOSE": [(_p(9, 0), 0.0), (_p(9, 15), 0.04), (_p(9, 30), 0.12), (_p(10, 0), 0.25),
             (_p(10, 30), 0.35), (_p(11, 0), 0.43), (_p(11, 30), 0.50), (_p(13, 0), 0.50),
             (_p(13, 30), 0.60), (_p(14, 0), 0.72), (_p(14, 15), 0.79), (_p(14, 30), 0.87),
             (_p(14, 45), 1.0)],
    "UPCOM": [(_p(9, 0), 0.0), (_p(9, 30), 0.16), (_p(10, 0), 0.27), (_p(10, 30), 0.36),
              (_p(11, 0), 0.44), (_p(11, 30), 0.51), (_p(13, 0), 0.51), (_p(13, 30), 0.61),
              (_p(14, 0), 0.72), (_p(14, 30), 0.85), (_p(15, 0), 1.0)],
}
_LUY_KE["HNX"] = _LUY_KE["HOSE"]


def ty_le_kl_da_khop(now: dt.datetime, san: str = "HOSE") -> float:
    """Phần khối lượng cả ngày (0–1) thường đã khớp tính tới thời điểm `now`."""
    now = gio_vn(now)
    if now.weekday() >= 5:
        return 1.0
    t = now.hour * 60 + now.minute + now.second / 60
    bang = _LUY_KE.get((san or "HOSE").upper(), _LUY_KE["HOSE"])
    if t <= bang[0][0]:
        return 0.0
    if t >= bang[-1][0]:
        return 1.0
    for (t0, v0), (t1, v1) in zip(bang, bang[1:]):
        if t0 <= t <= t1:
            return v0 if t1 == t0 else v0 + (v1 - v0) * (t - t0) / (t1 - t0)
    return 1.0


def moc_chot_du_lieu(now: dt.datetime | None = None) -> dt.datetime:
    """Thời điểm gần nhất mà dữ liệu ngày đã chốt (15:30 của ngày giao dịch gần nhất)."""
    now = gio_vn(now)
    if now.weekday() < 5 and (now.hour, now.minute) >= (15, 30):
        return now.replace(hour=15, minute=30, second=0, microsecond=0)
    d = now - dt.timedelta(days=1)
    while d.weekday() >= 5:
        d -= dt.timedelta(days=1)
    return d.replace(hour=15, minute=30, second=0, microsecond=0)


@dataclass
class TrangThaiPhien:
    ma: str             # mã trạng thái
    ten: str            # mô tả ngắn
    trong_phien: bool   # nến ngày hôm nay chưa hoàn chỉnh
    sao: int            # 0–3: mức phù hợp để chạy lọc
    loi_khuyen: str

    @property
    def sao_txt(self) -> str:
        return "★" * self.sao + "☆" * (3 - self.sao)


def trang_thai_phien(now: dt.datetime | None = None) -> TrangThaiPhien:
    now = gio_vn(now)
    t = now.hour * 60 + now.minute
    if now.weekday() >= 5:
        return TrangThaiPhien(
            "cuoi_tuan", "Cuối tuần – thị trường nghỉ", False, 3,
            "Nến tuần đã đóng: thời điểm tốt để quét toàn thị trường, lập danh sách theo dõi cho tuần tới "
            "(mẫu DRI/MSR được nhận diện trên biểu đồ tuần).")
    if t < _p(8, 45):
        return TrangThaiPhien(
            "truoc_gio", "Trước giờ mở cửa", False, 2,
            "Dữ liệu là của phiên hôm qua (đã chốt) – kết quả giống lần quét tối qua. Dùng để đặt cảnh báo "
            "giá tại các pivot trước 9:00.")
    if t < _p(10, 0):
        return TrangThaiPhien(
            "dau_phien", "ATO / đầu phiên", True, 0,
            "KHÔNG nên lọc lúc này: giá và khối lượng đầu phiên nhiễu, dự phóng khối lượng chưa tin cậy, "
            "breakout giả xảy ra nhiều nhất. Chỉ theo dõi cảnh báo giá.")
    if t < _p(11, 30):
        return TrangThaiPhien(
            "phien_sang", "Giữa phiên sáng", True, 1,
            "Có thể xem mã nào đang vượt pivot, nhưng chưa nên quyết định – chờ xác nhận lúc 14:00–14:25.")
    if t < _p(13, 0):
        return TrangThaiPhien(
            "nghi_trua", "Nghỉ trưa", True, 2,
            "Dữ liệu phiên sáng đã đứng yên: phù hợp rà soát giữa phiên (danh sách theo dõi, cắt lỗ danh mục).")
    if t < _p(14, 0):
        return TrangThaiPhien(
            "phien_chieu", "Đầu phiên chiều", True, 1,
            "Theo dõi; khung xác nhận tốt nhất trong phiên là 14:00–14:25.")
    if t < _p(14, 30):
        return TrangThaiPhien(
            "khung_vang", "Khung xác nhận breakout trong phiên (14:00–14:30)", True, 2,
            "Chạy chế độ --theo-doi: ~70% khối lượng ngày đã khớp, giá đã ổn định. Mã vượt pivot với KL dự "
            "phóng ≥1,5× có thể đặt mua trong ATC (HOSE/HNX, 14:30–14:45) hoặc trước 15:00 (UPCOM).")
    if t < _p(15, 0):
        return TrangThaiPhien(
            "atc", "ATC (HOSE/HNX) – UPCOM vẫn khớp liên tục đến 15:00", True, 1,
            "Chỉ đặt lệnh theo kết quả 14:00–14:25, không lọc thêm.")
    if t < _p(15, 30):
        return TrangThaiPhien(
            "cho_chot", "Vừa đóng cửa – chờ dữ liệu chốt", False, 1,
            "Nguồn dữ liệu đang cập nhật giá đóng cửa/khối lượng cuối ngày; nên đợi sau 15:30.")
    return TrangThaiPhien(
        "sau_dong_cua", "Sau đóng cửa", False, 3,
        "THỜI ĐIỂM TỐT NHẤT để quét toàn thị trường: tín hiệu được xác nhận bằng giá đóng cửa và khối lượng "
        "cả ngày. Lập kế hoạch & đặt cảnh báo giá cho phiên mai.")


LICH_CHAY = [
    ("Sau 15:30 – tối (19:00–22:00)", "★★★", "Quét toàn thị trường (lệnh mặc định)",
     "Tín hiệu đã xác nhận bằng giá đóng cửa & KL cả ngày; lập danh sách mua/theo dõi cho phiên mai."),
    ("Thứ Sáu sau 15:30 / cuối tuần", "★★★", "Quét toàn thị trường",
     "Nến tuần đã đóng – đúng khung thời gian của mẫu DRI/MSR; lập kế hoạch cả tuần."),
    ("14:00 – 14:25", "★★☆", "--theo-doi (chỉ quét danh sách theo dõi)",
     "Xác nhận breakout trong phiên với KL dự phóng; đặt lệnh ATC (HOSE/HNX) hoặc trước 15:00 (UPCOM)."),
    ("11:30 – 13:00 (nghỉ trưa)", "★★☆", "--theo-doi --danh-muc ...",
     "Dữ liệu sáng đứng yên; kiểm tra cắt lỗ danh mục, xem mã nào đang thử vượt pivot."),
    ("9:00 – 10:00", "☆☆☆", "Không nên chạy",
     "ATO + đầu phiên nhiễu, dự phóng KL sai lệch lớn, nhiều breakout giả."),
]
