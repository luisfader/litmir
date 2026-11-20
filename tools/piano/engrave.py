"""Grand-staff engraver (PIL) for the simple pieces in pieces.py."""
import math
from PIL import Image, ImageDraw, ImageFont
from pieces import Note, LETTERS, key_acc, SHARPS

SP = 17                       # staff space
W = 1660
ML, MR = 70, 46
FREESERIF = "/usr/share/fonts/truetype/freefont/FreeSerif.ttf"
SERIF_B = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Bold.ttf"
SERIF_BI = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-BoldItalic.ttf"
SERIF_I = "/usr/share/fonts/truetype/dejavu/DejaVuSerif-Italic.ttf"
SERIF = "/usr/share/fonts/truetype/dejavu/DejaVuSerif.ttf"
INK = (20, 20, 22)

REF = {'treble': Note('E', 0, 4).dia, 'bass': Note('G', 0, 2).dia}
MID = {'treble': Note('B', 0, 4).dia, 'bass': Note('D', 0, 3).dia}
KEYPOS = {
    'treble': {1: "F5 C5 G5 D5 A4 E5 B4", -1: "B4 E5 A4 D5 G4 C5 F4"},
    'bass': {1: "F3 C3 G3 D3 A2 E3 B2", -1: "B2 E3 A2 D3 G2 C3 F2"},
}


def font(path, size): return ImageFont.truetype(path, int(size))


def glyph(ch, height, path=FREESERIF):
    """render a glyph so that its ink bbox has the given pixel height; returns RGBA image"""
    f = font(path, 200)
    im = Image.new('L', (400, 500), 0); d = ImageDraw.Draw(im)
    d.text((100, 100), ch, font=f, fill=255)
    bb = im.getbbox(); im = im.crop(bb)
    s = height / im.height
    im = im.resize((max(1, int(im.width * s)), max(1, int(height))), Image.LANCZOS)
    out = Image.new('RGBA', im.size, INK + (0,)); out.putalpha(im)
    return out


class Staff:
    def __init__(self, kind, top):
        self.kind, self.top = kind, top
        self.bottom = top + 4 * SP
    def y(self, n):
        return self.bottom - (n.dia - REF[self.kind]) * SP / 2
    def ydia(self, dia):
        return self.bottom - (dia - REF[self.kind]) * SP / 2


class Engraver:
    def __init__(self, p, bars, per_line=4):
        self.p, self.bars, self.per = p, bars, per_line
        self.kacc = key_acc(p["key"])
        nsys = math.ceil(len(bars) / per_line)
        self.head_h = 190
        self.sys_h = 27 * SP
        H = self.head_h + nsys * self.sys_h + 30
        self.im = Image.new('RGB', (W, H), 'white')
        self.d = ImageDraw.Draw(self.im)
        self.gclef = glyph('\U0001D11E', 7.4 * SP)
        self.fclef = glyph('\U0001D122', 3.3 * SP)
        self.qrest = glyph('\U0001D13D', 3.0 * SP)
        self.erest = glyph('\U0001D13E', 1.9 * SP)
        self.sharp = glyph('♯', 2.7 * SP)
        self.flat = glyph('♭', 2.3 * SP)
        self.natural = glyph('♮', 2.6 * SP)

    # ---------- primitives
    def paste(self, g, x, y):  # x,y = top-left
        self.im.paste(g, (int(round(x)), int(round(y))), g)

    def ellipse(self, cx, cy, rx, ry, ang, fill):
        pts = []
        ca, sa = math.cos(ang), math.sin(ang)
        for i in range(48):
            a = 2 * math.pi * i / 48
            x, y = rx * math.cos(a), ry * math.sin(a)
            pts.append((cx + x * ca - y * sa, cy + x * sa + y * ca))
        self.d.polygon(pts, fill=fill)

    def head(self, cx, cy, kind):
        if kind == 'whole':
            self.ellipse(cx, cy, 0.78 * SP, 0.52 * SP, 0, INK)
            self.ellipse(cx, cy, 0.36 * SP, 0.30 * SP, math.radians(55), 'white')
        elif kind == 'half':
            self.ellipse(cx, cy, 0.66 * SP, 0.47 * SP, math.radians(-22), INK)
            self.ellipse(cx, cy, 0.52 * SP, 0.21 * SP, math.radians(-32), 'white')
        else:
            self.ellipse(cx, cy, 0.66 * SP, 0.47 * SP, math.radians(-22), INK)

    def line(self, x1, y1, x2, y2, w=2):
        self.d.line([(x1, y1), (x2, y2)], fill=INK, width=w)

    def acc_glyph(self, a):
        return {1: self.sharp, -1: self.flat, 0: self.natural}[a]

    def put_acc(self, a, x_right, cy):
        g = self.acc_glyph(a)
        # vertical anchor: sharps/naturals centered, flats: bowl on the note
        if a == -1: y = cy - g.height * 0.70
        else: y = cy - g.height / 2
        self.paste(g, x_right - g.width, y)

    def text(self, xy, s, f, anchor='la'):
        self.d.text(xy, s, font=f, fill=INK, anchor=anchor)

    # ---------- staff furniture
    def staff_lines(self, st, x1, x2):
        for i in range(5):
            y = st.top + i * SP
            self.line(x1, y, x2, y, 2)

    def clef(self, st, x):
        if st.kind == 'treble':
            self.paste(self.gclef, x, st.top - 1.55 * SP)
            return self.gclef.width
        self.paste(self.fclef, x, st.top - 0.05 * SP)
        return self.fclef.width

    def keysig(self, st, x):
        k = self.p["key"]
        if k == 0: return 0
        pos = KEYPOS[st.kind][1 if k > 0 else -1].split()[:abs(k)]
        for i, ps in enumerate(pos):
            n = Note(ps[0], 0, int(ps[1]))
            g = self.sharp if k > 0 else self.flat
            cy = st.y(n)
            y = cy - g.height * (0.70 if k < 0 else 0.5)
            self.paste(g, x + i * 0.95 * SP, y)
        return abs(k) * 0.95 * SP + 0.4 * SP

    def timesig(self, st, x):
        f = font(SERIF_B, 2.75 * SP)
        b = str(self.p["beats"])
        self.text((x + SP * 0.8, st.top + SP * 1.0), b, f, 'mm')
        self.text((x + SP * 0.8, st.top + SP * 3.0), "4", f, 'mm')
        return 2.2 * SP

    # ---------- notes
    def ledger(self, st, n, cx):
        dia = n.dia; ref = REF[st.kind]
        top_line = ref + 8
        x1, x2 = cx - 1.05 * SP, cx + 1.05 * SP
        if dia <= ref - 2:
            for dl in range(ref - 2, dia - 1, -2):
                y = st.ydia(dl); self.line(x1, y, x2, y, 2)
        if dia >= top_line + 2:
            for dl in range(top_line + 2, dia + 1, 2):
                y = st.ydia(dl); self.line(x1, y, x2, y, 2)

    def draw_event(self, st, ns, dur, cx, accstate, stem_dir=None, stem_tip=None, flag=True):
        """draw notes (chord) or rest; returns (stem_x, stem_tip_y, dir)"""
        if not ns:
            self.rest(st, dur, cx); return None
        kind = 'whole' if dur >= 4 else ('half' if dur >= 2 else 'q')
        dotted = dur in (1.5, 3.0, 0.75)
        ns = sorted(ns, key=lambda n: n.dia)
        if stem_dir is None:
            avg = sum(n.dia for n in ns) / len(ns)
            stem_dir = 'down' if avg >= MID[st.kind] else 'up'
        rx = 0.62 * SP
        for n in ns:
            cy = st.y(n)
            self.ledger(st, n, cx)
            want = n.acc; key = (n.letter, n.octave)
            cur = accstate.get(key, self.kacc[n.letter])
            if want != cur:
                self.put_acc(want, cx - rx - 0.25 * SP, cy)
                accstate[key] = want
            self.head(cx, cy, kind)
            if dotted:
                dy = -SP / 2 if (n.dia - REF[st.kind]) % 2 == 0 else 0
                dx = cx + rx + (0.75 * SP if kind != 'whole' else 0.9 * SP)
                self.d.ellipse([dx - 3.2, cy + dy - 3.2, dx + 3.2, cy + dy + 3.2], fill=INK)
        if kind == 'whole':
            return None
        lo, hi = st.y(ns[0]), st.y(ns[-1])   # lo is lower on page (bigger y)
        if stem_dir == 'up':
            sx = cx + rx - 1.0; y0 = lo; tip = stem_tip if stem_tip is not None else min(hi - 3.4 * SP, st.ydia(MID[st.kind]))
        else:
            sx = cx - rx + 1.0; y0 = hi; tip = stem_tip if stem_tip is not None else max(lo + 3.4 * SP, st.ydia(MID[st.kind]))
        self.line(sx, y0, sx, tip, 2)
        if dur in (0.5, 0.75) and flag:
            self.flag(sx, tip, stem_dir)
        return sx, tip, stem_dir

    def flag(self, sx, tip, d):
        s = 1 if d == 'up' else -1
        pts = []
        for i in range(21):
            t = i / 20
            x = sx + 0.9 * SP * math.sin(t * math.pi * 0.85) + 0.15 * SP * t
            y = tip + s * (2.6 * SP * t)
            pts.append((x, y))
        for w, off in ((5, 0), (3, 0.25 * SP)):
            self.d.line([(x, y + s * off * (1 - i / 20)) for i, (x, y) in enumerate(pts)], fill=INK, width=w)

    def rest(self, st, dur, cx):
        if dur >= 4:
            y = st.top + SP; self.d.rectangle([cx - 0.6 * SP, y, cx + 0.6 * SP, y + 0.5 * SP], fill=INK)
        elif dur >= 2:
            y = st.top + 2 * SP; self.d.rectangle([cx - 0.6 * SP, y - 0.5 * SP, cx + 0.6 * SP, y], fill=INK)
        elif dur >= 1:
            g = self.qrest; self.paste(g, cx - g.width / 2, st.top + 0.5 * SP)
        else:
            g = self.erest; self.paste(g, cx - g.width / 2, st.top + 1.0 * SP)

    def voice(self, st, events, x_of, accstate):
        """events: list of (notes, dur, t). beams eighth pairs within a beat."""
        i = 0
        while i < len(events):
            ns, d, t = events[i]
            if d == 0.5 and ns and i + 1 < len(events):
                ns2, d2, t2 = events[i + 1]
                if d2 == 0.5 and ns2 and abs(t - math.floor(t)) < 1e-6:
                    self.beam_pair(st, (ns, t), (ns2, t2), x_of, accstate)
                    i += 2; continue
            self.draw_event(st, ns, d, x_of(t), accstate)
            i += 1

    def beam_pair(self, st, a, b, x_of, accstate):
        (n1, t1), (n2, t2) = a, b
        avg = (sum(n.dia for n in n1 + n2)) / len(n1 + n2)
        d = 'down' if avg >= MID[st.kind] else 'up'
        y1 = st.y(sorted(n1, key=lambda n: n.dia)[-1 if d == 'up' else 0])
        y2 = st.y(sorted(n2, key=lambda n: n.dia)[-1 if d == 'up' else 0])
        s = -1 if d == 'up' else 1
        tip1, tip2 = y1 + s * 3.3 * SP, y2 + s * 3.3 * SP
        slope = max(-0.6 * SP, min(0.6 * SP, (tip2 - tip1) * 0.5))
        mid = (tip1 + tip2) / 2
        tip1, tip2 = mid - slope / 2, mid + slope / 2
        # keep stems long enough
        if d == 'up':
            sh = min(0, min(y1 - 2.6 * SP - tip1, y2 - 2.6 * SP - tip2)) if False else 0
            need = max(tip1 - (y1 - 2.6 * SP), tip2 - (y2 - 2.6 * SP), 0)
            tip1 -= need; tip2 -= need
        else:
            need = max((y1 + 2.6 * SP) - tip1, (y2 + 2.6 * SP) - tip2, 0)
            tip1 += need; tip2 += need
        r1 = self.draw_event(st, n1, 0.5, x_of(t1), accstate, d, tip1, flag=False)
        r2 = self.draw_event(st, n2, 0.5, x_of(t2), accstate, d, tip2, flag=False)
        (sx1, _, _), (sx2, _, _) = r1, r2
        th = 0.48 * SP
        if d == 'up':
            poly = [(sx1, tip1), (sx2, tip2), (sx2, tip2 + th), (sx1, tip1 + th)]
        else:
            poly = [(sx1, tip1 - th), (sx2, tip2 - th), (sx2, tip2), (sx1, tip1)]
        self.d.polygon(poly, fill=INK)

    # ---------- page
    def header(self, chapter_line):
        p = self.p
        self.text((W / 2, 62), f"«{p['title']}»", font(SERIF_BI, 34), 'mm')
        self.text((W / 2, 104), "для фортепиано", font(SERIF_I, 21), 'mm')
        f = font(SERIF_B, 20)
        self.text((ML + 10, 152), p["tempo"], f, 'ls')
        w = self.d.textlength(p["tempo"], font=f)
        q = font(FREESERIF, 30)
        self.text((ML + 10 + w + 14, 152), "♩", q, 'ls')
        self.text((ML + 10 + w + 34, 152), f"= {p['bpm']}", font(SERIF, 20), 'ls')
        self.text((W - MR, 152), chapter_line, font(SERIF_I, 18), 'rs')

    def brace(self, x, y1, y2):
        f = font(SERIF, 200)
        im = Image.new('L', (300, 400), 0); d = ImageDraw.Draw(im)
        d.text((50, 20), "{", font=f, fill=255)
        im = im.crop(im.getbbox()).resize((int(0.95 * SP), int(y2 - y1)), Image.LANCZOS)
        g = Image.new('RGBA', im.size, INK + (0,)); g.putalpha(im)
        self.paste(g, x - g.width - 4, y1)

    def chord_label(self, s):
        return s.replace('b', '♭').replace('#', '♯')

    def render(self, chapter_line, path):
        self.header(chapter_line)
        bars = self.bars; beats = self.p["beats"]
        y = self.head_h
        x_end = W - MR
        for si in range(0, len(bars), self.per):
            chunk = bars[si:si + self.per]
            tr = Staff('treble', y + 6 * SP)
            bs = Staff('bass', tr.bottom + 8.5 * SP)
            first = si == 0
            x0 = ML
            self.staff_lines(tr, x0, x_end); self.staff_lines(bs, x0, x_end)
            self.line(x0, tr.top, x0, bs.bottom, 3)
            self.brace(x0, tr.top - 2, bs.bottom + 2)
            if si > 0:
                self.text((x0 - 4, tr.top - 1.8 * SP), str(si + 1), font(SERIF_I, 17), 'ls')
            x = x0 + 0.6 * SP
            wc = max(self.clef(tr, x), self.clef(bs, x)); x += wc + 0.7 * SP
            wk = max(self.keysig(tr, x), self.keysig(bs, x)); x += wk
            if first:
                self.timesig(tr, x); x += self.timesig(bs, x)
            x += 0.6 * SP
            n = len(chunk)
            bw = (x_end - x) / self.per if len(bars) >= self.per else (x_end - x) / n
            for bi, bar in enumerate(chunk):
                bx = x + bi * bw
                lead = 1.9 * SP; tail = 1.4 * SP
                usable = bw - lead - tail
                x_of = (lambda bx=bx, usable=usable, lead=lead: (lambda t: bx + lead + (t / beats) * usable))()
                # chord symbol
                self.text((x_of(0) - 0.4 * SP, tr.top - 3.3 * SP), self.chord_label(bar["chord"]), font(SERIF_B, 21), 'ls')
                acc_t, acc_b = {}, {}
                t = 0; ev = []
                for ns, d in bar["rh"]:
                    ev.append((ns, d, t)); t += d
                self.voice(tr, ev, x_of, acc_t)
                t = 0; ev = []
                for ns, d in bar["lh"]:
                    ev.append((ns, d, t)); t += d
                self.voice(bs, ev, x_of, acc_b)
                xb = bx + bw
                last = si + bi == len(bars) - 1
                if last:
                    self.line(xb - 9, tr.top, xb - 9, bs.bottom, 2)
                    self.d.rectangle([xb - 5, tr.top, xb, bs.bottom], fill=INK)
                else:
                    self.line(xb, tr.top, xb, bs.bottom, 2)
            if first:
                self.text((x + 1.2 * SP, bs.bottom + 4.2 * SP), "con Ped.", font(SERIF_I, 18), 'ls')
            y += self.sys_h
        self.im.save(path, optimize=True)
