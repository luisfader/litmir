"""Minimal SoundFont 2 reader + sample-based renderer (numpy)."""
import struct, numpy as np

GEN_NAMES = {0:'startAddrsOffset',1:'endAddrsOffset',2:'startloopAddrsOffset',3:'endloopAddrsOffset',
 4:'startAddrsCoarseOffset',12:'endAddrsCoarseOffset',17:'pan',33:'delayVolEnv',34:'attackVolEnv',35:'holdVolEnv',
 36:'decayVolEnv',37:'sustainVolEnv',38:'releaseVolEnv',41:'instrument',43:'keyRange',44:'velRange',
 45:'startloopAddrsCoarseOffset',48:'initialAttenuation',50:'endloopAddrsCoarseOffset',51:'coarseTune',52:'fineTune',
 53:'sampleID',54:'sampleModes',56:'scaleTuning',58:'overridingRootKey',8:'initialFilterFc',9:'initialFilterQ'}

def _chunks(data, off, end):
    while off < end:
        cid = data[off:off+4]; size = struct.unpack('<I', data[off+4:off+8])[0]
        yield cid, off+8, size
        off += 8 + size + (size & 1)

class SF2:
    def __init__(self, path):
        d = open(path, 'rb').read()
        assert d[:4] == b'RIFF' and d[8:12] == b'sfbk'
        lists = {}
        for cid, o, s in _chunks(d, 12, len(d)):
            if cid == b'LIST':
                lists[d[o:o+4]] = (o+4, o+s)
        o, e = lists[b'sdta']
        for cid, co, cs in _chunks(d, o, e):
            if cid == b'smpl':
                self.smpl = np.frombuffer(d[co:co+cs], dtype='<i2').astype(np.float32) / 32768.0
        o, e = lists[b'pdta']
        pd = {cid: d[co:co+cs] for cid, co, cs in _chunks(d, o, e)}
        self.phdr = [struct.unpack('<20sHHHIII', pd[b'phdr'][i:i+38]) for i in range(0, len(pd[b'phdr']), 38)]
        self.pbag = [struct.unpack('<HH', pd[b'pbag'][i:i+4]) for i in range(0, len(pd[b'pbag']), 4)]
        self.pgen = [struct.unpack('<Hh', pd[b'pgen'][i:i+4]) for i in range(0, len(pd[b'pgen']), 4)]
        self.inst = [struct.unpack('<20sH', pd[b'inst'][i:i+22]) for i in range(0, len(pd[b'inst']), 22)]
        self.ibag = [struct.unpack('<HH', pd[b'ibag'][i:i+4]) for i in range(0, len(pd[b'ibag']), 4)]
        self.igen = [struct.unpack('<Hh', pd[b'igen'][i:i+4]) for i in range(0, len(pd[b'igen']), 4)]
        self.shdr = [struct.unpack('<20sIIIIIBbHH', pd[b'shdr'][i:i+46]) for i in range(0, len(pd[b'shdr']), 46)]

    @staticmethod
    def _gens(gens, a, b):
        out = {}
        for op, amt in gens[a:b]:
            if op in (43, 44):
                lo = amt & 0xff; hi = (amt >> 8) & 0xff
                out[op] = (lo, hi)
            else:
                out[op] = amt
        return out

    def zones(self, bank, prog):
        """Flattened zones for preset: list of dicts (instrument gens merged w/ preset additive gens)."""
        pi = next(i for i, p in enumerate(self.phdr[:-1]) if p[1] == prog and p[2] == bank)
        p = self.phdr[pi]; pn = self.phdr[pi+1]
        pzones = []
        for bi in range(p[3], pn[3]):
            g = self._gens(self.pgen, self.pbag[bi][0], self.pbag[bi+1][0])
            pzones.append(g)
        pglobal = {}
        if pzones and 41 not in pzones[0]:
            pglobal = pzones.pop(0)
        result = []
        for pz in pzones:
            pg = dict(pglobal); pg.update(pz)
            ii = pg[41]
            ins = self.inst[ii]; insn = self.inst[ii+1]
            izones = [self._gens(self.igen, self.ibag[b][0], self.ibag[b+1][0]) for b in range(ins[1], insn[1])]
            iglobal = {}
            if izones and 53 not in izones[0]:
                iglobal = izones.pop(0)
            for iz in izones:
                z = dict(iglobal); z.update(iz)
                # preset ranges intersect
                kr = z.get(43, (0, 127)); pkr = pg.get(43, (0, 127))
                vr = z.get(44, (0, 127)); pvr = pg.get(44, (0, 127))
                z[43] = (max(kr[0], pkr[0]), min(kr[1], pkr[1]))
                z[44] = (max(vr[0], pvr[0]), min(vr[1], pvr[1]))
                for op, amt in pg.items():   # additive
                    if op in (41, 43, 44, 53, 54, 58, 0, 1, 2, 3, 4, 12, 45, 50):
                        continue
                    z[op] = z.get(op, 0) + amt
                result.append(z)
        return result


from scipy.signal import butter, lfilter
_LPC = {}
def _lp(x, fc, sr):
    k = int(fc)
    if k not in _LPC: _LPC[k] = butter(2, fc / (sr / 2))
    b, a = _LPC[k]
    return lfilter(b, a, x).astype(np.float32)

def tc2s(tc):
    return 2.0 ** (tc / 1200.0)


class Renderer:
    def __init__(self, sf, bank=0, prog=0, sr=48000):
        self.sf = sf; self.sr = sr
        self.zones = sf.zones(bank, prog)
        self.bright = 0.0

    def pick(self, key, vel):
        cands = [z for z in self.zones if z[43][0] <= key <= z[43][1] and z[44][0] <= vel <= z[44][1]]
        if not cands:
            cands = sorted(self.zones, key=lambda z: min(abs(key - z[43][0]), abs(key - z[43][1])))[:1]
        return cands

    def note(self, key, vel, dur_on):
        """Return stereo float array for one note held dur_on seconds (incl. pedal), with release tail."""
        outs = []
        for z in self.pick(key, vel):
            sh = self.sf.shdr[z[53]]
            name, start, end, sl, el, ssr, opitch, pcorr, link, typ = sh
            start += z.get(0, 0) + 32768 * z.get(4, 0)
            end += z.get(1, 0) + 32768 * z.get(12, 0)
            sl += z.get(2, 0) + 32768 * z.get(45, 0)
            el += z.get(3, 0) + 32768 * z.get(50, 0)
            root = z.get(58, -1)
            if root < 0: root = opitch
            cents = (key - root) * z.get(56, 100) + z.get(51, 0) * 100 + z.get(52, 0) + pcorr
            rate = (ssr / self.sr) * 2.0 ** (cents / 1200.0)
            modes = z.get(54, 0)
            release = min(tc2s(z.get(38, -12000)), 3.0)
            release = max(release, 0.35)
            total = dur_on + release
            n = int(total * self.sr)
            pos = np.arange(n, dtype=np.float64) * rate
            data = self.sf.smpl
            if modes in (1, 3) and el > sl + 8:
                L = el - sl
                rel = pos + (start - sl)  # relative to loop start
                idx = np.where(start + pos >= el, sl + np.mod(start + pos - sl, L), start + pos)
            else:
                idx = start + pos
                n_valid = int(np.searchsorted(idx, end - 2))
                idx = idx[:max(n_valid, 1)]
            i0 = np.floor(idx).astype(np.int64); fr = (idx - i0).astype(np.float32)
            sig = data[i0] * (1 - fr) + data[np.minimum(i0 + 1, len(data) - 1)] * fr
            m = len(sig)
            t = np.arange(m) / self.sr
            # volume envelope
            att = max(tc2s(z.get(34, -12000)), 0.002)
            hold = tc2s(z.get(35, -12000))
            dec = tc2s(z.get(36, -12000))
            sus_db = -min(max(z.get(37, 0), 0), 1440) / 10.0
            env_db = np.zeros(m, dtype=np.float32)
            a_end = att; h_end = a_end + hold
            env = np.ones(m, dtype=np.float32)
            env[t < a_end] = t[t < a_end] / a_end
            dm = t >= h_end
            if dec > 0.001:
                env_db[dm] = np.maximum(sus_db, -100.0 * (t[dm] - h_end) / dec) if sus_db > -100 else -100.0 * (t[dm] - h_end) / dec
                env_db[dm] = np.maximum(env_db[dm], sus_db)
            env = env * (10 ** (env_db / 20.0))
            # release
            rm = t >= dur_on
            env[rm] *= 10 ** ((-100.0 * (t[rm] - dur_on) / release) / 20.0)
            # short fade to avoid click at end
            env[-64:] *= np.linspace(1, 0, min(64, m))
            # filter: initialFc + modEnv->Fc, modEnv decays to sustain; velocity darkens soft notes
            fc0 = z.get(8, 13500); mfc = z.get(11, 0)
            mdec = tc2s(z.get(28, -12000)); mhold = tc2s(z.get(27, -12000)); msus = 1 - min(max(z.get(29, 0), 0), 1000) / 1000.0
            menv = np.ones(m, dtype=np.float32)
            md = t >= mhold
            menv[md] = np.maximum(msus, 1 - (t[md] - mhold) / max(mdec, 1e-3))
            vel_c = -1200.0 * (1 - vel / 127.0) ** 1.5
            fc_hi = fc0 + mfc + vel_c + self.bright; fc_lo = fc0 + vel_c + self.bright
            hz = lambda c: min(8.176 * 2 ** (c / 1200.0), 0.45 * self.sr)
            bh = _lp(sig, hz(fc_hi), self.sr); bl = _lp(sig, hz(fc_lo), self.sr)
            w = np.clip(menv, 0, 1)
            sig = bh * w + bl * (1 - w)
            att_db = -z.get(48, 0) / 10.0 * 0.4   # SF2 attenuation (scaled like most synths)
            vel_gain = (vel / 127.0) ** 1.6
            sig = sig * env * vel_gain * 10 ** (att_db / 20.0)
            pan = z.get(17, 0) / 500.0
            outs.append((sig, pan, typ))
        if not outs:
            return np.zeros((2, 1), np.float32)
        m = max(len(s) for s, _, _ in outs)
        st = np.zeros((2, m), np.float32)
        for s, pan, typ in outs:
            l = np.cos((pan + 1) * np.pi / 4); r = np.sin((pan + 1) * np.pi / 4)
            st[0, :len(s)] += s * l; st[1, :len(s)] += s * r
        return st
