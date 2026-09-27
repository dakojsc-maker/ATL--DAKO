"""Tổng hợp nhạc nền + hiệu ứng âm thanh cho video (không dùng nhạc có bản quyền).

python3 synth.py info.json out.wav
info.json do `node render.js info` sinh ra: độ dài video và các mốc (cue) âm thanh.
"""
import json
import sys

import numpy as np
import scipy.signal as sg

SR = 48000
rng = np.random.default_rng(7)

info = json.load(open(sys.argv[1]))
OUT = sys.argv[2]
DUR = info["duration"] + 0.3
N = int(DUR * SR)
marks = info["marks"]
sec = {m["type"]: m["t"] for m in marks if m["type"].startswith("sec_")}

# ---------- nhịp: điểm nhấn chính rơi đúng phách mạnh ----------
T0 = 5.5                      # vào nhạc chính (logo xuất hiện)
T_MAIN = sec["sec_main"]      # "Đã đến lúc thay đổi"
BAR = (T_MAIN - T0) / round((T_MAIN - T0) / 2.4)
BEAT = BAR / 4
T_TENSE = T0 + np.ceil((sec["sec_tension"] - T0) / BEAT) * BEAT
T_SOFT = T0 + np.floor((sec["sec_soft"] - T0) / BAR + 1) * BAR
T_END = sec["sec_end"]


def midi(n):
    return 440.0 * 2 ** ((n - 69) / 12)


PROG = [  # I – V – vi – IV (Rê trưởng)
    dict(pad=[57, 62, 66, 69], arp=[74, 78, 81, 86], bass=38),  # D
    dict(pad=[57, 61, 64, 69], arp=[73, 76, 81, 85], bass=33),  # A
    dict(pad=[59, 62, 66, 71], arp=[71, 74, 78, 83], bass=35),  # Bm
    dict(pad=[59, 62, 67, 71], arp=[71, 74, 79, 83], bass=31),  # G
]
EM = dict(pad=[59, 64, 67, 71], arp=[71, 76, 79, 83], bass=40)
BM, G, A, D = PROG[2], PROG[3], PROG[1], PROG[0]


def section(t):
    if t < T0:
        return "intro"
    if t < T_TENSE:
        return "groove"
    if t < T_MAIN:
        return "tense"
    if t < T_SOFT:
        return "groove"
    if t < T_END:
        return "soft"
    return "end"


def chord_at(t):
    if t >= T_END:
        return D
    if T_TENSE <= t < T_MAIN:
        k = (t - T_MAIN) / BAR  # âm: số ô nhịp trước khi trở lại
        if k < -2:
            return EM
        if k < -1:
            return BM
        return G if k < -0.5 else A
    k = int(np.floor((t - T0) / BAR))
    return PROG[k % 4]


# ---------- buses ----------
pad = np.zeros((2, N))
pluck = np.zeros((2, N))
bass = np.zeros(N)
drums = np.zeros((2, N))
sfx = np.zeros((2, N))
kicks = []


def add(buf, start, sig, gain=1.0, pan=0.0):
    i0 = int(round(start * SR))
    if i0 >= N:
        return
    if i0 < 0:
        sig = sig[..., -i0:]
        i0 = 0
    n = min(sig.shape[-1], N - i0)
    if buf.ndim == 1:
        buf[i0:i0 + n] += gain * sig[:n]
    else:
        lg, rg = np.cos((pan + 1) * np.pi / 4), np.sin((pan + 1) * np.pi / 4)
        buf[0, i0:i0 + n] += gain * lg * np.sqrt(2) * sig[:n]
        buf[1, i0:i0 + n] += gain * rg * np.sqrt(2) * sig[:n]


def env_adsr(n, a=0.01, r=0.1):
    e = np.ones(n)
    na = min(int(a * SR), n // 2)
    nr = min(int(r * SR), n - na)
    if na:
        e[:na] = np.linspace(0, 1, na)
    if nr:
        e[-nr:] *= np.linspace(1, 0, nr)
    return e


def lp(x, fc, order=2):
    b, a = sg.butter(order, fc / (SR / 2), "low")
    return sg.lfilter(b, a, x, axis=-1)


def hp(x, fc, order=2):
    b, a = sg.butter(order, fc / (SR / 2), "high")
    return sg.lfilter(b, a, x, axis=-1)


def bp(x, lo, hi, order=2):
    b, a = sg.butter(order, [lo / (SR / 2), hi / (SR / 2)], "band")
    return sg.lfilter(b, a, x, axis=-1)


# ---------- PAD: hợp âm trải dài ----------
seg_edges = sorted(set([0.0] + [T0 + k * BAR for k in range(-3, 60)] + [T_TENSE + k * BAR / 2 for k in range(0, 8)] + [T_END, DUR]))
seg_edges = [e for e in seg_edges if 0 <= e <= DUR]
for s0, s1 in zip(seg_edges[:-1], seg_edges[1:]):
    if s1 - s0 < 0.05:
        continue
    ch = chord_at(s0 + 0.01)
    rel = 0.9 if s1 < T_END else 0.0
    L = s1 - s0 + rel if s1 < DUR else s1 - s0
    n = int(L * SR)
    t = np.arange(n) / SR
    v = np.zeros((2, n))
    for j, note in enumerate(ch["pad"]):
        for d, side in ((-6, 0), (0, None), (6, 1)):
            f = midi(note) * 2 ** (d / 1200)
            w = sg.sawtooth(2 * np.pi * f * t + rng.uniform(0, 6.28)) * 0.5 + np.sin(2 * np.pi * f * t) * 0.5
            if side is None:
                v += w * 0.5
            else:
                v[side] += w * 0.7
    v *= env_adsr(n, a=0.5, r=min(rel + 0.3, L * 0.5))
    sect = section(s0 + 0.01)
    fc = {"intro": 1400, "groove": 2600, "tense": 900, "soft": 2000, "end": 2200}[sect]
    v = lp(v, fc, 2) * 0.11
    add(pad, s0, v[0], pan=-1)
    add(pad, s0, v[1], pan=1)

# pad nhỏ dần về cuối
pad_env = np.ones(N)
tt = np.arange(N) / SR
pad_env *= np.clip(tt / 2.0, 0, 1)
pad *= pad_env

# ---------- PLUCK arpeggio (móc 1/8) ----------
def pluck_note(f, dur=0.55, bright=1.0):
    n = int(dur * SR)
    t = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * t) + 0.5 * bright * np.sin(4 * np.pi * f * t) + 0.22 * bright * np.sin(6 * np.pi * f * t) + 0.08 * bright * np.sin(8 * np.pi * f * t)
    e = np.exp(-t / 0.2) * np.minimum(1, t / 0.004)
    return s * e


PAT = [0, 2, 1, 3, 2, 1, 3, 2]
k0 = int(np.floor((0.8 - T0) / (BEAT / 2)))
k1 = int(np.ceil((DUR - T0) / (BEAT / 2)))
for k in range(k0, k1):
    t = T0 + k * BEAT / 2
    if t < 0.8:
        continue
    sect = section(t)
    if sect == "tense":
        continue
    if sect == "end" and t > T_END + 4 * BEAT * 2:
        continue
    step = k % 8
    ch = chord_at(t + 0.001)
    note = ch["arp"][PAT[step]]
    vel = [1.0, 0.55, 0.75, 0.55, 0.85, 0.55, 0.75, 0.6][step]
    g = {"intro": 0.12, "groove": 0.17, "soft": 0.14, "end": 0.12}[sect]
    if sect == "end":  # chậm lại ở cảnh cuối
        if step % 2:
            continue
    add(pluck, t, pluck_note(midi(note), bright=0.8 if sect == "intro" else 1.0), gain=g * vel, pan=(-0.35 if step % 2 else 0.35))

# delay ping-pong 3/8 nhịp cho pluck
dly = int(BEAT * 0.75 * SR)
echo = np.zeros_like(pluck)
fb = 0.38
src = pluck.copy()
for i in range(1, 5):
    g = fb ** i
    sh = dly * i
    ch_idx = i % 2
    echo[ch_idx, sh:] += g * lp(src[1 - ch_idx, :-sh], 5000, 1)
pluck += echo * 0.8

# ---------- DRUMS ----------
def kick(g=1.0, tone=1.0):
    n = int(0.45 * SR)
    t = np.arange(n) / SR
    f = 44 + 95 * tone * np.exp(-t / 0.035)
    ph = 2 * np.pi * np.cumsum(f) / SR
    s = np.sin(ph) * np.exp(-t / 0.26) + 0.35 * np.sin(2 * ph) * np.exp(-t / 0.08)
    s[: int(0.003 * SR)] += rng.normal(0, 0.4, int(0.003 * SR))
    return np.tanh(1.6 * s) * g


def clap():
    n = int(0.3 * SR)
    t = np.arange(n) / SR
    s = bp(rng.normal(0, 1, n), 900, 4200)
    e = np.exp(-t / 0.085)
    for d in (0.0, 0.011, 0.022):
        e += 0.6 * np.exp(-np.maximum(t - d, 0) / 0.01) * (t >= d)
    return s * e * 0.5


def hat(open_=False):
    n = int((0.2 if open_ else 0.06) * SR)
    t = np.arange(n) / SR
    s = hp(rng.normal(0, 1, n), 7500)
    return s * np.exp(-t / (0.07 if open_ else 0.018))


kb = int(np.floor((0 - T0) / BEAT))
for k in range(kb, int((DUR - T0) / BEAT) + 1):
    t = T0 + k * BEAT
    sect = section(t + 0.001)
    beat_in_bar = k % 4
    if sect in ("groove",):
        add(drums, t, kick(0.9), gain=0.5)
        kicks.append(t)
        if beat_in_bar in (1, 3):
            add(drums, t, clap(), gain=0.4, pan=0.1)
        add(drums, t + BEAT / 2, hat(), gain=0.3, pan=0.3)
        if beat_in_bar == 3:
            add(drums, t + BEAT * 0.75, hat(), gain=0.16, pan=0.3)
    elif sect == "soft":
        if beat_in_bar in (0, 2):
            add(drums, t, kick(0.6), gain=0.5)
            kicks.append(t)
        add(drums, t + BEAT / 2, hat(), gain=0.18, pan=0.3)
    elif sect == "tense":
        if beat_in_bar == 0:  # nhịp tim
            add(drums, t, lp(kick(0.8, 0.6), 500), gain=0.6)
            add(drums, t + BEAT * 0.45, lp(kick(0.55, 0.6), 500), gain=0.6)
            kicks += [t, t + BEAT * 0.45]
    elif sect == "intro" and t > T0 - BAR:  # đoạn dồn trước khi vào
        add(drums, t, hat(), gain=0.08 + 0.05 * (k % 4), pan=0.3)
        add(drums, t + BEAT / 2, hat(), gain=0.08, pan=-0.3)

# ---------- BASS (móc 1/8 theo hợp âm) ----------
for k in range(int(np.floor((0 - T0) / (BEAT / 2))), int((DUR - T0) / (BEAT / 2)) + 1):
    t = T0 + k * BEAT / 2
    if t < 0:
        continue
    sect = section(t + 0.001)
    if sect in ("intro",):
        continue
    ch = chord_at(t + 0.001)
    f = midi(ch["bass"])
    if sect == "tense":
        if k % 8:
            continue
        L = BAR
    elif sect == "end":
        if t > T_END + 0.2:
            continue
        L = BEAT / 2
    else:
        L = BEAT / 2
    n = int(L * SR)
    tt_ = np.arange(n) / SR
    s = np.sin(2 * np.pi * f * tt_) + 0.5 * np.sin(4 * np.pi * f * tt_) + 0.25 * np.sin(6 * np.pi * f * tt_)
    e = np.minimum(1, tt_ / 0.006) * (np.exp(-tt_ / 0.22) if sect != "tense" else np.exp(-tt_ / 1.6))
    s = np.tanh(1.5 * s * e) * 0.085 * (0.8 if k % 2 else 1.0)
    add(bass, t, s)

# ---------- sidechain (nén theo trống kick) ----------
duck = np.ones(N)
for t in kicks:
    i0 = int(t * SR)
    n = int(0.3 * SR)
    if i0 >= N:
        continue
    n = min(n, N - i0)
    tt_ = np.arange(n) / SR
    duck[i0:i0 + n] = np.minimum(duck[i0:i0 + n], 1 - 0.45 * np.exp(-tt_ / 0.1))
pad *= duck
bass *= duck
pluck *= 0.6 + 0.4 * duck

# ---------- SFX ----------
def whoosh(L=0.9, lo=300, hi=3500, gain=1.0):
    n = int(L * SR)
    t = np.arange(n) / SR
    x = rng.normal(0, 1, n)
    # sweep qua các dải tần
    out = np.zeros(n)
    segs = 24
    for i in range(segs):
        a, b = i * n // segs, (i + 1) * n // segs
        ph = i / (segs - 1)
        c = lo * (hi / lo) ** (np.sin(np.pi * ph))
        y = bp(x[max(0, a - 2000):b], c * 0.7, min(c * 1.4, 20000))
        out[a:b] = y[-(b - a):]
    e = np.sin(np.pi * np.clip(t / L, 0, 1)) ** 2
    return out * e * gain


def sweep_tone(f0, f1, L, gain=1.0, decay=None):
    n = int(L * SR)
    t = np.arange(n) / SR
    f = f0 * (f1 / f0) ** (t / L)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR)
    e = np.exp(-t / decay) if decay else env_adsr(n, 0.005, L * 0.4)
    return s * e * np.minimum(1, t / 0.003) * gain


def bell(f, L=1.6):
    n = int(L * SR)
    t = np.arange(n) / SR
    s = (np.sin(2 * np.pi * f * t) * np.exp(-t / 0.9)
         + 0.5 * np.sin(2 * np.pi * f * 2.005 * t) * np.exp(-t / 0.45)
         + 0.25 * np.sin(2 * np.pi * f * 3.01 * t) * np.exp(-t / 0.25))
    return s * np.minimum(1, t / 0.002)


def boom(L=2.2):
    n = int(L * SR)
    t = np.arange(n) / SR
    f = 38 + 60 * np.exp(-t / 0.08)
    s = np.sin(2 * np.pi * np.cumsum(f) / SR) * np.exp(-t / 0.8)
    s += lp(rng.normal(0, 1, n), 900) * np.exp(-t / 0.35) * 0.35
    return np.tanh(1.3 * s)


def riser(L):
    n = int(L * SR)
    t = np.arange(n) / SR
    x = rng.normal(0, 1, n)
    out = np.zeros(n)
    segs = 30
    for i in range(segs):
        a, b = i * n // segs, (i + 1) * n // segs
        c = 400 * (8000 / 400) ** (i / (segs - 1))
        y = bp(x[max(0, a - 2000):b], c * 0.8, min(c * 1.3, 20000))
        out[a:b] = y[-(b - a):]
    return out * (t / L) ** 2.2


SCALE = [74, 76, 78, 79, 81, 83, 86]
tick_i, last_tick = 0, -10
for m in marks:
    t, ty = m["t"], m["type"]
    if ty == "whoosh":
        add(sfx, t - 0.05, whoosh(0.95), gain=0.16, pan=-0.3)
        add(sfx, t + 0.02, whoosh(0.9, 500, 5000), gain=0.1, pan=0.4)
    elif ty == "swish":
        add(sfx, t, whoosh(0.55, 800, 6000), gain=0.08, pan=0.2)
    elif ty == "pop":
        add(sfx, t, sweep_tone(620, 1150, 0.09, decay=0.04), gain=0.08)
    elif ty == "notif":
        add(sfx, t, bell(1318.5, 0.6), gain=0.05, pan=rng.uniform(-0.5, 0.5))
        add(sfx, t + 0.09, bell(987.8, 0.8), gain=0.045)
    elif ty == "tick":
        tick_i = tick_i + 1 if t - last_tick < 1.2 else 0
        last_tick = t
        add(sfx, t, pluck_note(midi(SCALE[min(tick_i, 6)]), 0.5), gain=0.09, pan=-0.4 + 0.15 * tick_i)
    elif ty == "click":
        n = int(0.012 * SR)
        add(sfx, t, hp(rng.normal(0, 1, n), 2500) * np.exp(-np.arange(n) / SR / 0.003), gain=0.25)
    elif ty == "stamp":
        add(sfx, t, kick(1.0, 0.8), gain=0.35)
        add(sfx, t, lp(rng.normal(0, 1, int(0.2 * SR)), 1500) * np.exp(-np.arange(int(0.2 * SR)) / SR / 0.05), gain=0.2)
    elif ty == "scan":
        L = 1.7
        n = int(L * SR)
        tt_ = np.arange(n) / SR
        s = sweep_tone(700, 1400, L, gain=1.0) * (0.6 + 0.4 * np.sin(2 * np.pi * 14 * tt_))
        add(sfx, t, s, gain=0.025)
    elif ty == "ding":
        add(sfx, t, bell(1760.0), gain=0.07)
        add(sfx, t + 0.12, bell(2637.0), gain=0.045)
    elif ty == "hit":
        add(sfx, t, boom(), gain=0.3)

# điểm nhấn âm nhạc
add(sfx, T0, boom(), gain=0.32)
add(sfx, T0 - 1.8, riser(1.8), gain=0.05)
add(sfx, T_MAIN - 2.2, riser(2.2), gain=0.07)
add(sfx, T_MAIN, boom(), gain=0.3)
add(sfx, T_END, boom(2.8), gain=0.25)

# ---------- reverb (IR nhiễu giảm dần) ----------
def reverb_ir(L=2.4, decay=0.55):
    n = int(L * SR)
    t = np.arange(n) / SR
    irs = []
    for _ in range(2):
        x = rng.normal(0, 1, n) * np.exp(-t / decay)
        x = lp(x, 5000, 1)
        x[: int(0.012 * SR)] = 0
        irs.append(x / np.sqrt(np.sum(x ** 2)))
    return np.array(irs)


IR = reverb_ir()


def verb(x, wet):
    y = np.stack([sg.fftconvolve(x[c], IR[c])[:N] for c in range(2)])
    return x + wet * y


pad = verb(pad, 0.55)
pluck = verb(pluck, 0.35)
sfx = verb(sfx, 0.25)

bass2 = np.stack([bass, bass])
music = pad + pluck + bass2 + drums
# fade vào/ra
fade = np.ones(N)
fin = int(0.25 * SR)
fade[:fin] = np.linspace(0, 1, fin)
fout = int(3.0 * SR)
fade[-fout:] = np.linspace(1, 0, fout) ** 1.5
music *= fade

mix = music * 0.9 + sfx
mix = hp(mix, 28, 2)
# chuẩn hoá: RMS ~ -15.5 dBFS rồi giới hạn đỉnh mềm
rms = np.sqrt(np.mean(mix ** 2))
mix *= (10 ** (-15.5 / 20)) / rms
mix = np.tanh(mix * 1.1) / 1.1
peak = np.max(np.abs(mix))
if peak > 0.89:
    mix *= 0.89 / peak
mix[:, -int(0.05 * SR):] *= np.linspace(1, 0, int(0.05 * SR))

pcm = (mix.T * 32767).astype(np.int16)
import wave

with wave.open(OUT, "wb") as w:
    w.setnchannels(2)
    w.setsampwidth(2)
    w.setframerate(SR)
    w.writeframes(pcm.tobytes())
print(f"bar={BAR:.4f}s bpm={240 / BAR:.2f} tense={T_TENSE:.2f} main={T_MAIN:.2f} soft={T_SOFT:.2f} end={T_END:.2f}")
print("rms dBFS", 20 * np.log10(np.sqrt(np.mean(mix ** 2))), "peak", np.max(np.abs(mix)))
