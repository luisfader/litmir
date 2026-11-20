import numpy as np, subprocess
from scipy.signal import fftconvolve, butter, sosfilt
from sf2 import SF2, Renderer

SR = 48000
_sf = None


def reverb_ir(seconds=3.4, sr=SR, seed=3):
    rng = np.random.default_rng(seed)
    n = int(seconds * sr); t = np.arange(n) / sr
    ir = np.zeros((2, n), np.float32)
    bands = [((None, 400), 2.9), ((400, 2500), 2.4), ((2500, None), 1.1)]
    for ch in range(2):
        noise = rng.standard_normal(n).astype(np.float32)
        acc = np.zeros(n, np.float32)
        for (lo, hi), rt in bands:
            if lo is None: sos = butter(2, hi, 'low', fs=sr, output='sos')
            elif hi is None: sos = butter(2, lo, 'high', fs=sr, output='sos')
            else: sos = butter(2, [lo, hi], 'band', fs=sr, output='sos')
            acc += sosfilt(sos, noise) * np.exp(-6.91 * t / rt)
        # soft onset (diffuse build-up) + predelay
        acc *= np.minimum(1, t / 0.06)
        pre = int(0.022 * sr)
        ir[ch, pre:] = acc[:n - pre]
    # a few early reflections
    for d, g, ch in [(0.011, .5, 0), (0.017, .45, 1), (0.029, .35, 0), (0.037, .3, 1), (0.051, .22, 0), (0.063, .2, 1)]:
        ir[ch, int(d * sr)] += g
    ir /= np.sqrt((ir ** 2).sum(axis=1, keepdims=True))
    return ir


def render(p, notes, pedals, wav, mp3):
    global _sf
    if _sf is None: _sf = SF2('/usr/share/sounds/sf2/TimGM6mb.sf2')
    r = Renderer(_sf, 0, 0, SR)
    r.bright = 300.0     # a little air, still mellow
    spb = 60.0 / p["bpm"]
    total = max(n['e'] for n in notes) * spb + 9
    out = np.zeros((2, int(total * SR)), np.float32)
    for n in notes:
        end = n['e']
        for d, u in pedals:
            if d <= end <= u: end = max(end, u)
        s = n['s'] * spb; dur = (end - n['s']) * spb
        st = r.note(n['m'], n['v'], dur)
        # gentle piano stereo image: low left, high right
        pan = (n['m'] - 64) / 64 * 0.35
        gl = np.cos((pan + 1) * np.pi / 4) * 1.41; gr = np.sin((pan + 1) * np.pi / 4) * 1.41
        i = int(s * SR); m = min(st.shape[1], out.shape[1] - i)
        out[0, i:i + m] += st[0, :m] * gl
        out[1, i:i + m] += st[1, :m] * gr
    # tone: tame anything shrill, warm low-mids
    out = sosfilt(butter(2, 30, 'high', fs=SR, output='sos'), out, axis=1)
    out = sosfilt(butter(2, 7500, 'low', fs=SR, output='sos'), out, axis=1)
    ir = reverb_ir()
    wet = np.stack([fftconvolve(out[0], ir[0])[:out.shape[1]] + 0.15 * fftconvolve(out[1], ir[0])[:out.shape[1]],
                    fftconvolve(out[1], ir[1])[:out.shape[1]] + 0.15 * fftconvolve(out[0], ir[1])[:out.shape[1]]])
    wet = sosfilt(butter(2, 5000, 'low', fs=SR, output='sos'), wet, axis=1)
    mix = out * 0.78 + wet * 0.42 * (np.abs(out).max() / max(np.abs(wet).max(), 1e-9))
    # trim trailing silence, fade
    env = np.abs(mix).max(axis=0)
    last = np.nonzero(env > env.max() * 0.002)[0][-1]
    mix = mix[:, :min(mix.shape[1], last + SR // 2)]
    f = SR * 2
    mix[:, -f:] *= np.linspace(1, 0, f) ** 2
    mix = mix / np.abs(mix).max() * 0.89
    pcm = (mix.T * 32767).astype('<i2')
    import wave
    with wave.open(wav, 'wb') as w:
        w.setnchannels(2); w.setsampwidth(2); w.setframerate(SR); w.writeframes(pcm.tobytes())
    subprocess.run(['ffmpeg', '-y', '-loglevel', 'error', '-i', wav, '-af', 'loudnorm=I=-17:TP=-1.5:LRA=11',
                    '-ar', '44100', '-codec:a', 'libmp3lame', '-b:a', '192k', mp3], check=True)
    return mix.shape[1] / SR
