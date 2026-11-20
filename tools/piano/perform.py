"""Performance events (shared by MIDI and audio) + MIDI writer."""
import random, struct

TPQ = 480


def events(p, bars, seed=7):
    """list of dicts: start/end in beats, midi, vel; plus pedal list [(down, up)] in beats."""
    rnd = random.Random(seed + p["ch"])
    beats = p["beats"]; notes = []; pedals = []
    nb = len(bars)
    for bi, bar in enumerate(bars):
        t0 = bi * beats
        last = bi == nb - 1
        # phrase shape: louder toward middle of each 4-bar phrase
        shape = [0.92, 1.0, 1.04, 0.95][bi % 4]
        t = t0
        for i, (ns, d) in enumerate(bar["rh"]):
            for n in ns:
                acc = 6 if abs((t - t0) % beats) < 1e-6 else 0
                v = int((68 + acc + rnd.randint(-4, 4)) * shape)
                dur = d * (1.6 if last and i == len(bar["rh"]) - 1 else 0.96)
                notes.append(dict(s=t + rnd.uniform(0, 0.015), e=t + dur, m=n.midi, v=max(30, min(100, v))))
            t += d
        t = t0
        for ns, d in bar["lh"]:
            for k, n in enumerate(sorted(ns, key=lambda n: n.midi)):
                roll = 0.03 * k if len(ns) > 2 else 0.0      # gentle rolled chords
                v = int((50 + rnd.randint(-3, 3) - 2 * k) * shape)
                notes.append(dict(s=t + roll, e=t + d * 0.98, m=n.midi, v=max(28, v)))
            t += d
        # pedal: change on every bar (and at half bar for 'half' pattern)
        chunks = [beats] if p["lh"] != "half" else [2] * (beats // 2)
        tt = t0
        for c in chunks:
            pedals.append((tt + 0.08, tt + c - 0.03 if not last else tt + c + 3))
            tt += c
    return notes, pedals


def _vlq(n):
    b = [n & 0x7f]; n >>= 7
    while n: b.append((n & 0x7f) | 0x80); n >>= 7
    return bytes(reversed(b))


def write_midi(path, p, notes, pedals):
    ev = []  # (tick, order, bytes)
    us = int(60_000_000 / p["bpm"])
    ev.append((0, 0, b'\xff\x51\x03' + us.to_bytes(3, 'big')))
    den = 2  # quarter
    ev.append((0, 0, b'\xff\x58\x04' + bytes([p["beats"], den, 24, 8])))
    ev.append((0, 0, b'\xff\x59\x02' + struct.pack('bB', p["key"], 0)))
    name = p["title"].encode('utf-8')
    ev.append((0, 0, b'\xff\x03' + _vlq(len(name)) + name))
    ev.append((0, 0, bytes([0xC0, 0])))          # Acoustic Grand Piano
    ev.append((0, 0, bytes([0xB0, 91, 70])))     # reverb send
    ev.append((0, 0, bytes([0xB0, 7, 100])))
    for d, u in pedals:
        ev.append((int(d * TPQ), 1, bytes([0xB0, 64, 127])))
        ev.append((int(u * TPQ), 0, bytes([0xB0, 64, 0])))
    for n in notes:
        ev.append((int(n['s'] * TPQ), 2, bytes([0x90, n['m'], n['v']])))
        ev.append((int(n['e'] * TPQ), 0, bytes([0x80, n['m'], 0])))
    ev.sort(key=lambda x: (x[0], x[1]))
    trk = b''; last = 0
    for tk, _, data in ev:
        trk += _vlq(tk - last) + data; last = tk
    trk += b'\x00\xff\x2f\x00'
    with open(path, 'wb') as f:
        f.write(b'MThd' + struct.pack('>IHHH', 6, 0, 1, TPQ))
        f.write(b'MTrk' + struct.pack('>I', len(trk)) + trk)
