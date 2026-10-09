"""Tổng hợp thuyết minh tiếng Việt (giọng nữ) cho từng câu trong narration.json.

python3 tts.py narration.json build/vo
  → build/vo/<id>.wav (48 kHz mono) và vo.json (độ dài từng câu, main.js dùng để canh thời lượng cảnh).

Giọng đọc: Piper vi_VN-vais1000-medium (bộ dữ liệu VAIS-1000, CC BY 4.0) chạy offline qua sherpa-onnx.
  VOICE_DIR = thư mục vits-piper-vi_VN-vais1000-medium (tải từ github.com/k2-fsa/sherpa-onnx/releases, mục tts-models)
Kiểm tra phát âm (tuỳ chọn): ASR_DIR = sherpa-onnx-zipformer-vi-int8-2025-04-20 (mục asr-models) – nhận dạng lại
  từng câu và in tỉ lệ khớp chữ.
"""
import json
import os
import re
import sys
import wave

import numpy as np
import scipy.signal as sg
import sherpa_onnx

SPEED = float(os.environ.get("SPEED", "0.95"))
VOICE = os.environ.get("VOICE_DIR", "voice/vits-piper-vi_VN-vais1000-medium")
ASR = os.environ.get("ASR_DIR", "")
src, out = sys.argv[1], sys.argv[2]
os.makedirs(out, exist_ok=True)
N = json.load(open(src))["scenes"]

name = [f for f in os.listdir(VOICE) if f.endswith(".onnx")][0]
tts = sherpa_onnx.OfflineTts(sherpa_onnx.OfflineTtsConfig(model=sherpa_onnx.OfflineTtsModelConfig(
    vits=sherpa_onnx.OfflineTtsVitsModelConfig(model=f"{VOICE}/{name}", tokens=f"{VOICE}/tokens.txt", data_dir=f"{VOICE}/espeak-ng-data",
                                               noise_scale=0.6, noise_scale_w=0.7, length_scale=1.0), num_threads=4)))
asr = None
if ASR:
    asr = sherpa_onnx.OfflineRecognizer.from_transducer(
        encoder=f"{ASR}/encoder-epoch-12-avg-8.int8.onnx", decoder=f"{ASR}/decoder-epoch-12-avg-8.onnx",
        joiner=f"{ASR}/joiner-epoch-12-avg-8.int8.onnx", tokens=f"{ASR}/tokens.txt", num_threads=4, decoding_method="greedy_search")


def trim(x, sr, thr_db=-42, pad=0.04):
    env = np.convolve(np.abs(x), np.ones(int(0.01 * sr)) / int(0.01 * sr), "same")
    on = np.where(env > 10 ** (thr_db / 20))[0]
    if not len(on):
        return x
    a, b = max(0, on[0] - int(pad * sr)), min(len(x), on[-1] + int(pad * 2 * sr))
    y = x[a:b].copy()
    f = int(0.008 * sr)
    y[:f] *= np.linspace(0, 1, f)
    y[-f:] *= np.linspace(1, 0, f)
    return y


TAKES = int(os.environ.get("TAKES", "1"))
ACR = [p.strip().lower() for p in os.environ.get("ACRONYMS", "").split(",") if p.strip()]


def strip_acr(s):  # bỏ các từ viết tắt (máy nhận dạng không đánh vần được) khỏi phép so khớp
    s = s.lower()
    for p in ACR:
        s = s.replace(p, " ")
    return s


def words(s):
    s = re.sub(r"\ba i\b", "ai", s.lower().replace("ây ai", "ai").replace("ét tê pê", "stp"))
    return re.findall(r"[0-9a-zà-ỹđ]+", s)


ONLY = set(os.environ.get("ONLY", "").split(",")) - {""}  # chỉ đọc lại các câu này, giữ nguyên câu khác
OLD = {b["id"]: b for v in json.load(open("vo.json"))["scenes"].values() for b in v} if ONLY and os.path.exists("vo.json") else {}
res, tot_w, tot_ok = {}, 0, 0
for sc, beats in N.items():
    res[sc] = []
    for i, b in enumerate(beats):
        bid = f"{sc}b{i + 1}"
        if ONLY and bid not in ONLY and bid in OLD and OLD[bid]["say"] == b["say"]:
            res[sc].append({**OLD[bid], "sub": b["sub"]})
            continue
        best = None
        for take in range(TAKES if asr else 1):  # đọc nhiều lần, giữ bản nhận dạng khớp nhất
            a = tts.generate(b["say"], sid=0, speed=SPEED)
            x = trim(np.array(a.samples, dtype=np.float32), a.sample_rate)
            if not asr:
                break
            s = asr.create_stream(); s.accept_waveform(16000, sg.resample_poly(x, 16000, a.sample_rate).astype(np.float32)); asr.decode_stream(s)
            ref, hyp = words(strip_acr(b["say"])), words(s.result.text)
            sm = __import__("difflib").SequenceMatcher(a=ref, b=hyp)
            ok = sum(m.size for m in sm.get_matching_blocks())
            if best is None or ok > best[0]:
                best = (ok, len(ref), x, a.sample_rate, hyp)
            if ok == len(ref):
                break
        if asr:
            ok, nref, x, _, hyp = best
        x48 = sg.resample_poly(x, 320, 147) if a.sample_rate == 22050 else sg.resample_poly(x, 48000, a.sample_rate)
        rms = np.sqrt(np.mean(x48 ** 2)) + 1e-9
        x48 *= 10 ** (-20 / 20) / rms
        pk = np.max(np.abs(x48))
        if pk > 0.89:
            x48 *= 0.89 / pk
        with wave.open(f"{out}/{bid}.wav", "wb") as w:
            w.setnchannels(1); w.setsampwidth(2); w.setframerate(48000)
            w.writeframes((x48 * 32767).astype(np.int16).tobytes())
        d = len(x48) / 48000
        res[sc].append({"id": bid, "dur": round(d, 3), "say": b["say"], "sub": b["sub"]})
        line = f"{bid:6s} {d:5.2f}s"
        if asr:
            tot_w += nref; tot_ok += ok
            line += f"  khớp {ok}/{nref}"
            if ok < nref:
                line += f"\n        ASR: {' '.join(hyp)}"
        print(line, flush=True)
json.dump({"speed": SPEED, "scenes": res}, open("vo.json", "w"), ensure_ascii=False, indent=1)
total = sum(b["dur"] for v in res.values() for b in v)
print(f"tổng thời lượng lời đọc: {total:.1f}s" + (f" · khớp ASR {tot_ok}/{tot_w} từ ({100 * tot_ok / max(1, tot_w):.1f}%)" if asr else ""))
