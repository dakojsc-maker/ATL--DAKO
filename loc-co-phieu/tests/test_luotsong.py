"""Kiểm thử chiến lược lướt sóng: mô phỏng lệnh theo luật Việt Nam (T+2, biên độ, phí), đặc trưng, mô hình, nhật ký."""
import unittest

import numpy as np
import pandas as pd

from locphieu import luotsong as ls
from locphieu import nhatky
from tests.du_lieu_mau import du_lieu, vnindex_mau


def _mot_ma(dong: list[tuple]) -> pd.DataFrame:
    """dong: [(open, high, low, close)], KL 1 triệu cổ/phiên."""
    ngay = pd.bdate_range("2026-01-05", periods=len(dong))
    df = pd.DataFrame(dong, index=ngay, columns=["open", "high", "low", "close"], dtype=float)
    df["volume"] = 1e6
    return df


def _bang(df: pd.DataFrame) -> dict:
    return {k: df[[c]].set_axis(["X"], axis=1) for k, c in
            (("O", "open"), ("H", "high"), ("L", "low"), ("C", "close"), ("V", "volume"))}


def _lai(gia_ra, gia_vao=10.0):
    return gia_ra * (1 - ls.PHI_BAN) / (gia_vao * (1 + ls.PHI_MUA)) - 1


class TestMoPhong(unittest.TestCase):
    SAN = pd.Series({"X": "HOSE"})

    def chay(self, dong, h=20, tp=0.06, sl=0.04):
        mp = ls.mo_phong(_bang(_mot_ma(dong)), self.SAN, tp, sl, h)
        return {k: mp[k]["X"].iat[0] for k in ("lai", "ly_do", "giu", "mua_duoc")}

    def test_t2_khong_ban_duoc_hai_phien_dau_roi_cat_lo_theo_gia_dong_cua(self):
        kq = self.chay([(10, 10, 10, 10),            # phiên tín hiệu
                        (10, 10.2, 9.5, 9.7),        # mua mở cửa 10; thủng cắt lỗ nhưng chưa có cổ phiếu
                        (9.7, 9.8, 9.0, 9.4),        # e+1: vẫn chưa bán được
                        (9.4, 9.9, 9.3, 9.5)])       # e+2: chiều bán được, đóng cửa 9,5 ≤ 9,6 → cắt lỗ
        self.assertEqual(kq["ly_do"], -1)
        self.assertEqual(kq["giu"], 2)
        self.assertAlmostEqual(kq["lai"], _lai(9.5 * (1 - ls.TRUOT_CAT_LO)), places=6)

    def test_chot_loi_trong_phien(self):
        kq = self.chay([(10, 10, 10, 10), (10, 10.2, 9.9, 10.1), (10.1, 10.3, 10, 10.2), (10.2, 10.4, 10.1, 10.3),
                        (10.3, 10.8, 10.2, 10.5)])
        self.assertEqual(kq["ly_do"], 1)
        self.assertAlmostEqual(kq["lai"], _lai(10.6), places=6)

    def test_cung_phien_cham_ca_hai_nguong_tinh_cat_lo(self):
        kq = self.chay([(10, 10, 10, 10), (10, 10.1, 9.9, 10), (10, 10.1, 9.9, 10), (10, 10.1, 9.9, 10),
                        (10, 10.7, 9.5, 10)])
        self.assertEqual(kq["ly_do"], -1)
        self.assertAlmostEqual(kq["lai"], _lai(9.6 * (1 - ls.TRUOT_CAT_LO)), places=6)

    def test_mo_cua_giam_qua_cat_lo_khop_gia_mo_cua(self):
        kq = self.chay([(10, 10, 10, 10), (10, 10.1, 9.9, 10), (10, 10.1, 9.9, 10), (10, 10.1, 9.9, 10),
                        (9.3, 9.5, 9.2, 9.4)])
        self.assertEqual(kq["ly_do"], -1)
        self.assertAlmostEqual(kq["lai"], _lai(9.3 * (1 - ls.TRUOT_CAT_LO)), places=6)

    def test_san_cung_khong_ban_duoc(self):
        # e+3 nằm sàn cả phiên (10 × 0,93 = 9,3) → không bán được; e+4 mở cửa 9,0 → bán giá mở cửa
        kq = self.chay([(10, 10, 10, 10), (10, 10.1, 9.9, 10), (10, 10.1, 9.9, 10), (10, 10.1, 9.9, 10),
                        (9.3, 9.3, 9.3, 9.3), (9.0, 9.2, 8.8, 9.0)])
        self.assertEqual(kq["ly_do"], -1)
        self.assertEqual(kq["giu"], 4)
        self.assertAlmostEqual(kq["lai"], _lai(9.0 * (1 - ls.TRUOT_CAT_LO)), places=6)

    def test_tran_cung_phien_mua_thi_khong_mua_duoc(self):
        kq = self.chay([(10, 10, 10, 10), (10.7, 10.7, 10.7, 10.7), (10.7, 11, 10.5, 10.8)])
        self.assertFalse(kq["mua_duoc"])
        self.assertTrue(np.isnan(kq["lai"]))

    def test_het_han_ban_gia_dong_cua(self):
        dong = [(10, 10, 10, 10)] + [(10, 10.2, 9.8, 10.1)] * 12
        kq = self.chay(dong, h=10)
        self.assertEqual(kq["ly_do"], 0)
        self.assertEqual(kq["giu"], 10)
        self.assertAlmostEqual(kq["lai"], _lai(10.1), places=6)

    def test_chua_du_du_lieu_thi_de_trong(self):
        kq = self.chay([(10, 10, 10, 10), (10, 10.2, 9.9, 10.1), (10.1, 10.3, 10, 10.2)])
        self.assertTrue(kq["mua_duoc"])
        self.assertTrue(np.isnan(kq["ly_do"]))

    def test_mot_ma_cho_nhat_ky(self):
        df = _mot_ma([(10, 10, 10, 10), (10, 10.2, 9.9, 10.1), (10.1, 10.3, 10, 10.2)])
        self.assertEqual(ls.mo_phong_mot_ma(df.iloc[:1], "HOSE", df.index[0], 0.06, 0.04, 20)["ket_qua"], "Chờ mua")
        r = ls.mo_phong_mot_ma(df, "HOSE", df.index[0], 0.06, 0.04, 20)
        self.assertEqual(r["ket_qua"], "Đang giữ")
        self.assertAlmostEqual(r["gia_vao"], 10.0)
        self.assertAlmostEqual(r["lai"], _lai(10.2), places=6)


class TestDacTrungVaQuyTac(unittest.TestCase):
    @classmethod
    def setUpClass(cls):
        du = {"DRI": du_lieu("DRI"), "MSR": du_lieu("MSR")}
        cls.bang = ls.tao_bang(du)
        cls.f = ls.dac_trung(cls.bang, vnindex_mau(), pd.Series({"DRI": "1300", "MSR": "1700"}),
                             pd.Series({"DRI": "UPCOM", "MSR": "UPCOM"}))

    def test_du_dac_trung_va_khong_nhin_tuong_lai(self):
        for k in ls.DAC_TRUNG:
            self.assertIn(k, self.f)
        # đặc trưng ngày t chỉ phụ thuộc dữ liệu đến t: cắt bớt dữ liệu tương lai không làm đổi giá trị
        ngay = self.bang["C"].index[-30]
        cat = {k: v.loc[:ngay] for k, v in self.bang.items()}
        f2 = ls.dac_trung(cat, vnindex_mau(), pd.Series({"DRI": "1300", "MSR": "1700"}),
                          pd.Series({"DRI": "UPCOM", "MSR": "UPCOM"}))
        for k in ("r20", "d_ma50", "rsi14", "kl_tb20", "ud_kl50", "beta60", "vni_d_ma50", "atr_pct"):
            a, b = self.f[k].loc[ngay], f2[k].loc[ngay]
            np.testing.assert_allclose(a.to_numpy(float), b.to_numpy(float), rtol=1e-9, equal_nan=True,
                                       err_msg=k)

    def test_ma_tran_ngay_cuoi(self):
        X = ls.ma_tran(self.f, tu_dong=-1)
        self.assertEqual(list(X.columns), ls.DAC_TRUNG)
        self.assertTrue((X.index.get_level_values(0) == self.bang["C"].index[-1]).all())

    def test_goi_y_chi_khi_thi_truong_thuan_loi_hoac_xac_nhan(self):
        du = {"DRI": du_lieu("DRI"), "MSR": du_lieu("MSR")}
        san, nganh = pd.Series({"DRI": "UPCOM", "MSR": "UPCOM"}), pd.Series({"DRI": "1300", "MSR": "1700"})
        vni = vnindex_mau()
        for n in (len(vni) - 40, len(vni) - 1):
            cat = {m: d.iloc[: d.index.get_indexer([vni.index[n]], method="pad")[0] + 1] for m, d in du.items()}
            kq, tt = ls.goi_y(cat, vni.iloc[: n + 1], san, nganh)
            self.assertIn(tt["che_do"], (0, 1, 2))
            for k in kq:
                self.assertTrue(tt["che_do"] == 2 or tt["xac_nhan"])
                self.assertAlmostEqual(k["chot_loi"], k["gia"] * (1 + ls.CHOT_LOI))
                self.assertAlmostEqual(k["cat_lo"], k["gia"] * (1 - ls.CAT_LO))
                self.assertIn(k["loai"], ("dan_dat", "xac_nhan"))

    def test_ngay_xac_nhan_tang(self):
        ngay = pd.bdate_range("2026-01-01", periods=80)
        c = np.r_[np.full(40, 100.0), np.linspace(100, 85, 25), np.linspace(85, 88, 14), [89.5]]
        v = np.r_[np.full(79, 1e8), [1.2e8]]
        vni = pd.DataFrame({"open": c, "high": c * 1.002, "low": c * 0.998, "close": c, "volume": v}, index=ngay)
        tt = ls.trang_thai_vni(vni)
        self.assertTrue(tt["xac_nhan"], tt)
        vni2 = vni.copy()
        vni2.iloc[-1, vni2.columns.get_loc("volume")] = 0.9e8       # khối lượng thấp hơn hôm qua → chưa xác nhận
        self.assertFalse(ls.trang_thai_vni(vni2)["xac_nhan"])


class TestNhatKyLuotSong(unittest.TestCase):
    def test_ghi_va_cap_nhat(self):
        df = du_lieu("DRI")
        ngay = df.index[-25]
        gia = float(df["close"].at[ngay])
        goi_y = [{"ma": "DRI", "san": "UPCOM", "ngay": ngay.strftime("%Y-%m-%d"), "gia": gia, "p": 0.7,
                  "chot_loi": gia * 1.06, "cat_lo": gia * 0.96, "chot_loi_pct": 0.06, "cat_lo_pct": 0.04,
                  "so_phien": 20, "ly_do": ["thử"]}]
        nk = nhatky.rong()
        moi = nhatky.ghi_goi_y_luot_song(nk, goi_y, {"trang_thai": "TĂNG", "muc": 2}, vnindex_mau())
        self.assertEqual(len(moi), 1)
        # cùng mã đang mở → không ghi trùng
        self.assertEqual(nhatky.ghi_goi_y_luot_song(nk, goi_y, {}, None), [])
        nhatky.cap_nhat(nk, {"DRI": df}, vnindex_mau())
        g = nk["goi_y"][0]
        r = ls.mo_phong_mot_ma(df, "UPCOM", ngay, 0.06, 0.04, 20)
        self.assertEqual(g["ngay_mua"], r["ngay_mua"])
        self.assertAlmostEqual(g["gia_vao"], r["gia_vao"])
        self.assertAlmostEqual(g["lai"], r["lai"])
        if r["ket_qua"] == "Đang giữ":
            self.assertEqual(g["trang_thai"], "DANG_MO")
        else:
            self.assertEqual(g["trang_thai"], "DA_DONG")
            self.assertEqual(g["ket_qua"], r["ket_qua"])


if __name__ == "__main__":
    unittest.main()
