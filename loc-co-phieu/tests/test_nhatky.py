"""Kiểm thử nhật ký gợi ý: ghi gợi ý, theo dõi lời/lỗ theo quy tắc bán, thống kê độ tin cậy, gộp qua git."""
import json
import os
import subprocess
import sys
import tempfile
import unittest

import pandas as pd

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from locphieu import nhatky  # noqa: E402
from locphieu.cauhinh import CauHinh  # noqa: E402
from locphieu.chienluoc import boi_canh_thi_truong, phan_tich_ma  # noqa: E402
from tests.du_lieu_mau import du_lieu, vnindex_mau  # noqa: E402

CFG = CauHinh()


def cat(df, ngay):
    return df[df.index <= pd.Timestamp(ngay)]


def chay_ngay(nk, du_lieu_day_du, vn, ngay):
    """Mô phỏng một lần lọc sau giờ đóng cửa của phiên `ngay`."""
    dl = {m: cat(d, ngay) for m, d in du_lieu_day_du.items()}
    vn_d = cat(vn, ngay)
    kq = [phan_tich_ma(m, d, CFG, vnindex=vn_d) for m, d in dl.items()]
    moi = nhatky.ghi_goi_y_moi(nk, [k for k in kq if k], boi_canh_thi_truong(vn_d), vn_d, CFG)
    nhatky.cap_nhat(nk, dl, vn_d, CFG)
    return moi


def them_phien(df, hang):
    """Nối thêm các phiên (ngày, mở, cao, thấp, đóng, KL) vào sau dữ liệu."""
    them = pd.DataFrame([h[1:] for h in hang], columns=["open", "high", "low", "close", "volume"],
                        index=pd.to_datetime([h[0] for h in hang]))
    return pd.concat([df, them])


class TestNhatKy(unittest.TestCase):
    def setUp(self):
        self.vn = vnindex_mau()
        self.dl = {"DRI": du_lieu("DRI"), "MSR": du_lieu("MSR")}

    def test_ghi_mot_lan_va_theo_doi_loi_lo(self):
        nk = nhatky.rong()
        ghi = {}
        for d in pd.bdate_range("2026-09-14", "2026-10-09"):
            for g in chay_ngay(nk, self.dl, self.vn, d):
                ghi[g["id"]] = d.strftime("%Y-%m-%d")
        self.assertEqual(ghi, {"MSR-2026-09-21": "2026-09-21", "DRI-2026-09-23": "2026-09-23"})
        self.assertEqual(len(nk["goi_y"]), 2)                       # không ghi trùng ở các ngày sau
        dri = next(g for g in nk["goi_y"] if g["ma"] == "DRI")
        self.assertEqual(dri["loai"], "MUA")
        self.assertAlmostEqual(dri["gia_vao"], 14.50, places=2)
        self.assertEqual(dri["trang_thai"], "DANG_MO")
        self.assertAlmostEqual(dri["lai"], 16.90 / 14.50 - 1, places=3)
        self.assertEqual(dri["cham_mt1"], "2026-10-09")              # mục tiêu 1 = 17,00; phiên 9/10 cao nhất 17,20
        self.assertAlmostEqual(dri["dung_lo"], 14.50, places=2)     # đã dời dừng lỗ về hoà vốn
        self.assertIsNotNone(dri.get("vuot_vnindex"))
        msr = next(g for g in nk["goi_y"] if g["ma"] == "MSR")
        self.assertEqual(msr["trang_thai"], "DANG_MO")
        self.assertGreater(msr["dung_lo"], 55)                      # dừng lỗ động bám MA10

    def test_breakout_that_bai_duoc_ghi_lo(self):
        dl = {"DRI": them_phien(cat(self.dl["DRI"], "2026-09-23"), [
            ("2026-09-24", 14.40, 14.45, 14.00, 14.05, 1.6e6),
            ("2026-09-25", 14.00, 14.05, 13.60, 13.65, 1.8e6)])}         # 13,65 < 14,17 − 3%
        nk = nhatky.rong()
        chay_ngay(nk, dl, self.vn, "2026-09-23")
        chay_ngay(nk, dl, self.vn, "2026-09-25")
        g = nk["goi_y"][0]
        self.assertEqual(g["trang_thai"], "DA_DONG")
        self.assertEqual(g["ket_qua"], "Breakout thất bại")
        self.assertAlmostEqual(g["lai"], 13.65 / 14.50 - 1, places=3)
        self.assertEqual(g["ngay_dong"], "2026-09-25")

    def test_cat_lo_khi_gap_giam(self):
        dl = {"DRI": them_phien(cat(self.dl["DRI"], "2026-09-23"), [
            ("2026-09-24", 13.30, 13.40, 13.10, 13.20, 2.5e6)])}         # mở cửa dưới mức cắt lỗ 13,48
        nk = nhatky.rong()
        chay_ngay(nk, dl, self.vn, "2026-09-23")
        chay_ngay(nk, dl, self.vn, "2026-09-24")
        g = nk["goi_y"][0]
        self.assertEqual(g["ket_qua"], "Cắt lỗ")
        self.assertAlmostEqual(g["gia_dong"], 13.30, places=2)        # bán giá mở cửa
        self.assertLess(g["lai"], -0.07)

    def test_gia_dieu_chinh_co_tuc_khong_lam_sai_ket_qua(self):
        nk = nhatky.rong()
        chay_ngay(nk, self.dl, self.vn, "2026-09-23")
        dieu_chinh = {m: d.assign(**{c: d[c] * 0.9 for c in ("open", "high", "low", "close")}) for m, d in self.dl.items()}
        nhatky.cap_nhat(nk, dieu_chinh, self.vn, CFG)
        dri = next(g for g in nk["goi_y"] if g["ma"] == "DRI")
        self.assertAlmostEqual(dri["lai"], 16.90 / 14.50 - 1, places=3)
        self.assertAlmostEqual(dri["gia_hien_tai"], 16.90, places=2)   # hiển thị theo thang giá lúc gợi ý

    def test_luu_va_tai_lai(self):
        nk = nhatky.rong()
        chay_ngay(nk, self.dl, self.vn, "2026-09-23")
        nk["goi_y"][0]["gia_dong"] = float("nan")
        with tempfile.TemporaryDirectory() as tmp:
            p = os.path.join(tmp, "nhat-ky", "goi-y.json")
            nhatky.luu(p, nk)
            with open(p, encoding="utf-8") as f:
                json.loads(f.read())                                   # JSON hợp lệ (NaN → null)
            self.assertEqual([g["id"] for g in nhatky.tai(p)["goi_y"]], [g["id"] for g in nk["goi_y"]])

    def test_gop_nhieu_ban(self):
        a = {"goi_y": [{"id": "X-1", "ma": "X", "ngay_goi_y": "2026-09-01", "ngay_cap_nhat": "2026-09-10", "lai": 0.1},
                       {"id": "Y-1", "ma": "Y", "ngay_goi_y": "2026-09-02", "ngay_cap_nhat": "2026-09-10"}]}
        b = {"goi_y": [{"id": "X-1", "ma": "X", "ngay_goi_y": "2026-09-01", "ngay_cap_nhat": "2026-09-20", "lai": 0.2},
                       {"id": "Z-1", "ma": "Z", "ngay_goi_y": "2026-09-05", "ngay_cap_nhat": "2026-09-20"}]}
        tong = nhatky.gop(a, b)
        self.assertEqual([g["id"] for g in tong["goi_y"]], ["X-1", "Y-1", "Z-1"])
        self.assertEqual(tong["goi_y"][0]["lai"], 0.2)                  # giữ bản đánh giá mới nhất


class TestThongKe(unittest.TestCase):
    def test_thong_ke(self):
        lenh = [{"ket_qua": "Dừng lỗ động", "lai": 0.30, "cham_mt1": "x", "so_phien": 20},
                {"ket_qua": "Cắt lỗ", "lai": -0.07, "cham_mt1": "", "so_phien": 5},
                {"ket_qua": "Breakout thất bại", "lai": -0.03, "cham_mt1": "", "so_phien": 3},
                {"ket_qua": "Hoà vốn", "lai": 0.0, "cham_mt1": "", "so_phien": 9},
                {"ket_qua": "Đang mở", "lai": 0.12, "cham_mt1": "x", "so_phien": 10},
                {"ket_qua": "Đang mở", "lai": 0.02, "cham_mt1": "", "so_phien": 2}]
        tk = nhatky.thong_ke(lenh)
        self.assertEqual((tk["tong"], tk["da_dong"], tk["dang_mo"]), (6, 4, 2))
        self.assertEqual((tk["thang"], tk["thua"], tk["hoa"]), (1, 2, 1))
        self.assertAlmostEqual(tk["ty_le_thang"], 0.25)
        self.assertAlmostEqual(tk["he_so_loi_nhuan"], 0.30 / 0.10)
        self.assertAlmostEqual(tk["lai_tb"], (0.30 - 0.07 - 0.03) / 4)
        self.assertEqual((tk["chinh_xac"], tk["da_ro"]), (2, 5))     # 4 đã đóng + 1 đang mở đã chạm MT1
        self.assertAlmostEqual(tk["lai_tb_mo"], 0.07)

    def test_danh_gia_tin_cay(self):
        it = nhatky.thong_ke([{"ket_qua": "Cắt lỗ", "lai": -0.07}] * 3)
        self.assertEqual(nhatky.danh_gia_tin_cay(it)[0], "CHƯA ĐỦ DỮ LIỆU")
        tot = nhatky.thong_ke([{"ket_qua": "Dừng lỗ động", "lai": 0.25}] * 6 + [{"ket_qua": "Cắt lỗ", "lai": -0.07}] * 6)
        self.assertEqual(nhatky.danh_gia_tin_cay(tot)[0], "TIN CẬY (tạm thời)")
        xau = nhatky.thong_ke([{"ket_qua": "Dừng lỗ động", "lai": 0.05}] * 10 + [{"ket_qua": "Cắt lỗ", "lai": -0.07}] * 30)
        self.assertEqual(nhatky.danh_gia_tin_cay(xau)[0], "CHƯA HIỆU QUẢ")


class TestDongBoGit(unittest.TestCase):
    """Mỗi cuộc trò chuyện trên Claude Code web là một nhánh git: nhật ký phải gộp được từ mọi nhánh."""

    def _git(self, cwd, *args):
        env = dict(os.environ, GIT_AUTHOR_NAME="t", GIT_AUTHOR_EMAIL="t@t", GIT_COMMITTER_NAME="t",
                   GIT_COMMITTER_EMAIL="t@t")
        subprocess.run(["git", *args], cwd=cwd, check=True, capture_output=True, env=env)

    def _ghi(self, thu_muc, ids):
        p = os.path.join(thu_muc, "nhat-ky", "goi-y.json")
        nhatky.luu(p, {"goi_y": [{"id": i, "ma": i[:3], "ngay_goi_y": "2026-09-22", "ngay_cap_nhat": "2026-09-22"}
                                 for i in ids], "kiem_dinh": None})
        return p

    def test_gop_tu_moi_nhanh(self):
        try:
            subprocess.run(["git", "--version"], check=True, capture_output=True)
        except (OSError, subprocess.CalledProcessError):
            self.skipTest("không có git")
        with tempfile.TemporaryDirectory() as tmp:
            goc, a, b = (os.path.join(tmp, x) for x in ("goc.git", "a", "b"))
            self._git(tmp, "init", "--bare", "-q", goc)
            self._git(tmp, "clone", "-q", goc, a)
            self._git(a, "checkout", "-q", "-b", "chinh")
            self._ghi(a, ["DRI-2026-09-22"])
            self._git(a, "add", "-A")
            self._git(a, "commit", "-q", "-m", "a")
            self._git(a, "push", "-q", "origin", "chinh")
            self._git(a, "checkout", "-q", "-b", "phien-2")
            self._ghi(a, ["DRI-2026-09-22", "MSR-2026-09-22"])
            self._git(a, "commit", "-q", "-am", "b")
            self._git(a, "push", "-q", "origin", "phien-2")
            self._git(tmp, "clone", "-q", "-b", "chinh", goc, b)           # cuộc trò chuyện mới, mở từ nhánh chính
            p = os.path.join(b, "nhat-ky", "goi-y.json")
            self.assertEqual(len(nhatky.tai(p)["goi_y"]), 1)
            them = nhatky.dong_bo_git(p, log=lambda s: None)
            self.assertEqual(them, 1)
            self.assertEqual(sorted(g["id"] for g in nhatky.tai(p)["goi_y"]), ["DRI-2026-09-22", "MSR-2026-09-22"])


if __name__ == "__main__":
    unittest.main()
