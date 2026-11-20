#!/usr/bin/env python3
"""Иллюстрации неба для «Знака»: созвездия, знаки, эклиптика, виды неба над Синеей.

python3 tools/astro/make.py            → novels/znak/img/astro/*.svg
python3 tools/astro/make.py --png DIR  → ещё и PNG для проверки (rsvg-convert)

Звёзды и линии созвездий берутся из novels/znak/nebo.json (прямое восхождение в часах,
склонение в градусах, звёздная величина) — те же данные, что в разделе «Звёздное небо»,
поэтому рисунки совпадают с ним. Карты нарисованы так, как небо видно с земли:
север сверху, восток слева.
"""
import json, math, os, subprocess, sys
sys.path.insert(0, os.path.dirname(os.path.abspath(__file__)))
from emblems import (GOLD, GOLD2, GOLD3, INK, NAVY, NAVY2, CREAM, WHITE, ROSE, ROSE2, TEAL, COPPER, COPPER2,
                     SUN, SERIF, GLYPH, SIGNS, GL, medallion, star4, f)

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
NOV = os.path.join(ROOT, "novels", "znak")
OUT = os.path.join(NOV, "img", "astro")
NEBO = json.load(open(os.path.join(NOV, "nebo.json")))
HORO = json.load(open(os.path.join(NOV, "goroskop.json")))
CON = {c["id"]: c for c in NEBO["constellations"]}
HS = {s["id"]: s for s in HORO["signs"]}
LAT = NEBO.get("lat", 45)
EPS = math.radians(23.4393)
RED = {"Антарес": "#ff8a5a", "Альдебаран": "#ffb070", "Бетельгейзе": "#ffa060", "Арктур": "#ffc890", "Поллукс": "#ffd9a0"}
GEN = {"ari": "Овна", "tau": "Тельца", "gem": "Близнецов", "cnc": "Рака", "leo": "Льва", "vir": "Девы", "lib": "Весов",
       "sco": "Скорпиона", "oph": "Змееносца", "sgr": "Стрельца", "cap": "Козерога", "aqr": "Водолея", "psc": "Рыб"}
MON = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"]


def esc(s):
    return s.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;")


def svg(w, h, body, label):
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {w} {h}" width="{w}" height="{h}" role="img" aria-label="{esc(label)}">'
            f'<defs><linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e2a8"/><stop offset=".5" stop-color="#d9b062"/><stop offset="1" stop-color="#a8823e"/></linearGradient>'
            f'<radialGradient id="skyG" cx=".5" cy=".45" r=".75"><stop offset="0" stop-color="#1f2f6a"/><stop offset="1" stop-color="#0b1233"/></radialGradient>'
            f'<radialGradient id="halo"><stop offset="0" stop-color="#fff3c4" stop-opacity=".55"/><stop offset="1" stop-color="#fff3c4" stop-opacity="0"/></radialGradient></defs>'
            f'{body}</svg>')


def frame(w, h, title=None, sub=None):
    s = (f'<rect width="{w}" height="{h}" rx="16" fill="{INK}"/>'
         f'<rect x="7" y="7" width="{w-14}" height="{h-14}" rx="12" fill="none" stroke="url(#goldG)" stroke-width="2.2"/>'
         f'<rect x="13" y="13" width="{w-26}" height="{h-26}" rx="8" fill="none" stroke="{GOLD3}" stroke-width=".8"/>')
    s += "".join(star4(x, y, 5.5, GOLD) for x, y in ((22, 22), (w - 22, 22), (22, h - 22), (w - 22, h - 22)))
    if title:
        s += f'<text x="{w/2}" y="46" text-anchor="middle" font-family="{SERIF}" font-size="24" font-weight="700" letter-spacing="2" fill="url(#goldG)">{esc(title)}</text>'
    if sub:
        s += f'<text x="{w/2}" y="68" text-anchor="middle" font-family="{SERIF}" font-size="14" font-style="italic" fill="{CREAM}" opacity=".85">{esc(sub)}</text>'
    return s


# ───────────── геометрия ─────────────
def vec(ra_h, dec):
    a, d = math.radians(ra_h * 15), math.radians(dec)
    return (math.cos(d) * math.cos(a), math.cos(d) * math.sin(a), math.sin(d))


def stereo(lon, lat, lon0, lat0):
    """Стереографическая проекция (радианы). Возвращает X (к востоку/по долготе), Y (к северу/вверх)."""
    cosc = math.sin(lat0) * math.sin(lat) + math.cos(lat0) * math.cos(lat) * math.cos(lon - lon0)
    k = 2 / (1 + max(cosc, -0.95))
    X = k * math.cos(lat) * math.sin(lon - lon0)
    Y = k * (math.cos(lat0) * math.sin(lat) - math.sin(lat0) * math.cos(lat) * math.cos(lon - lon0))
    return X, Y, cosc


def mag_r(m, k=1.0):
    return max(1.0, (5.2 - 0.95 * m)) * k


def star_dot(x, y, m, name="", k=1.0, dim=False):
    r = mag_r(m, k)
    col = RED.get(name, WHITE)
    s = ""
    if not dim and m < 1.6:
        s += f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r*3.4)}" fill="url(#halo)"/>'
    if name in ("Плеяды", "Ясли"):  # скопление — горсть звёздочек
        for dx, dy, rr in ((0, 0, 1.6), (-4, -2, 1.2), (3, -4, 1.3), (5, 1, 1.1), (-2, 4, 1.1), (2, 3, 1), (-5, 2, .9)):
            s += f'<circle cx="{f(x+dx*k)}" cy="{f(y+dy*k)}" r="{f(rr*k)}" fill="{WHITE}" opacity="{.5 if dim else .95}"/>'
        return s
    if name == "Туманность Андромеды":
        return s + f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="{f(6*k)}" ry="{f(2.4*k)}" transform="rotate(-35 {f(x)} {f(y)})" fill="{CREAM}" opacity=".55"/>'
    return s + f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{col}" opacity="{.45 if dim else 1}"/>'


class Labels:
    """Простая раскладка подписей без наложений."""
    def __init__(self, box):
        self.boxes = []
        self.lim = box

    def block(self, x, y, r):
        self.boxes.append((x - r, y - r, x + r, y + r))

    def free(self, b):
        x0, y0, x1, y1 = self.lim
        if b[0] < x0 or b[2] > x1 or b[1] < y0 or b[3] > y1:
            return False
        return all(b[2] < o[0] or b[0] > o[2] or b[3] < o[1] or b[1] > o[3] for o in self.boxes)

    def place(self, x, y, text, size=12.5, r=4, color=CREAM, italic=False, weight="normal", force=False):
        w = len(text) * size * .56
        h = size
        cand = [(x + r + 4, y + h * .36, "start"), (x - r - 4, y + h * .36, "end"), (x, y - r - 5, "middle"),
                (x, y + r + h + 2, "middle"), (x + r + 3, y - r - 2, "start"), (x - r - 3, y + r + h, "end")]
        for tx, ty, anc in cand:
            bx0 = tx if anc == "start" else tx - w if anc == "end" else tx - w / 2
            b = (bx0 - 1, ty - h, bx0 + w + 1, ty + 3)
            if self.free(b) or force:
                self.boxes.append(b)
                st = ' font-style="italic"' if italic else ""
                return (f'<text x="{f(tx)}" y="{f(ty)}" text-anchor="{anc}" font-family="{SERIF}" font-size="{size}" font-weight="{weight}"{st} '
                        f'fill="{color}" stroke="{INK}" stroke-width="3" paint-order="stroke">{esc(text)}</text>')
        return ""


# ───────────── карта созвездий ─────────────
def chart(ids, w=640, h=480, title=None, sub=None, emblem=None, names=True, con_labels=None, field=True,
          box=None, highlight=(), grid=True, k=1.0, extra=None, center=None, scale_pad=1.0, link_others=False, con_at=None):
    """ids — созвездия, которые рисуются полностью (с линиями и именами звёзд)."""
    box = box or (34, 86 if title else 34, w - 34, h - 34)
    bx0, by0, bx1, by1 = box
    stars = [s for c in ids for s in CON[c]["s"]]
    if center:
        ra0, dec0 = center
    else:
        vs = [vec(s[0], s[1]) for s in stars]
        x, y, z = (sum(v[i] for v in vs) for i in range(3))
        ra0 = (math.degrees(math.atan2(y, x)) / 15) % 24
        dec0 = math.degrees(math.atan2(z, math.hypot(x, y)))
    L0, B0 = math.radians(ra0 * 15), math.radians(dec0)

    def pj(ra, dec):
        X, Y, c = stereo(math.radians(ra * 15), math.radians(dec), L0, B0)
        return -X, Y, c  # восток слева
    P = [pj(s[0], s[1]) for s in stars]
    xs, ys = [p[0] for p in P], [p[1] for p in P]
    spanx, spany = (max(xs) - min(xs)) or .1, (max(ys) - min(ys)) or .1
    sc = min((bx1 - bx0) / spanx, (by1 - by0) / spany) * .8 / scale_pad
    mx, my = (max(xs) + min(xs)) / 2, (max(ys) + min(ys)) / 2
    cx, cy = (bx0 + bx1) / 2, (by0 + by1) / 2

    def to(ra, dec):
        X, Y, c = pj(ra, dec)
        return cx + (X - mx) * sc, cy - (Y - my) * sc, c

    def inside(x, y, m=0):
        return bx0 - m <= x <= bx1 + m and by0 - m <= y <= by1 + m
    s = f'<clipPath id="cb"><rect x="{bx0}" y="{by0}" width="{bx1-bx0}" height="{by1-by0}" rx="10"/></clipPath>'
    s += f'<rect x="{bx0}" y="{by0}" width="{bx1-bx0}" height="{by1-by0}" rx="10" fill="url(#skyG)" stroke="{GOLD3}" stroke-width=".8"/>'
    g = ""
    if grid:  # сетка: часы прямого восхождения и десятки градусов склонения
        for dec in range(-80, 90, 10):
            pts = [to(ra / 10, dec) for ra in range(0, 241)]
            d, pen = "", False
            for x, y, c in pts:
                if c > -.2 and inside(x, y, 200):
                    d += ("L" if pen else "M") + f"{f(x)},{f(y)} "
                    pen = True
                else:
                    pen = False
            g += f'<path d="{d}" fill="none" stroke="{GOLD}" stroke-width=".5" opacity="{.35 if dec == 0 else .14}"/>'
        for ra in range(24):
            pts = [to(ra, dec / 2) for dec in range(-170, 171)]
            d, pen = "", False
            for x, y, c in pts:
                if c > -.2 and inside(x, y, 200):
                    d += ("L" if pen else "M") + f"{f(x)},{f(y)} "
                    pen = True
                else:
                    pen = False
            g += f'<path d="{d}" fill="none" stroke="{GOLD}" stroke-width=".5" opacity=".14"/>'
    lab = Labels((bx0 + 4, by0 + 4, bx1 - 4, by1 - 4))
    # фон: звёзды и (тускло) линии остальных созвездий из того же атласа
    if field:
        for cid, c in CON.items():
            if cid in ids:
                continue
            pts = [to(s[0], s[1]) for s in c["s"]]
            if not any(inside(x, y) and cc > 0 for x, y, cc in pts):
                continue
            if link_others:
                for a, b in c["l"]:
                    (x1, y1, c1), (x2, y2, c2) = pts[a], pts[b]
                    if c1 > 0 and c2 > 0:
                        g += f'<path d="M{f(x1)},{f(y1)} L{f(x2)},{f(y2)}" stroke="{GOLD}" stroke-width=".8" opacity=".28"/>'
            for (x, y, cc), st in zip(pts, c["s"]):
                if cc > 0 and inside(x, y):
                    g += star_dot(x, y, st[2], st[3], k * .85, True)
                    lab.block(x, y, mag_r(st[2], k) + 1)
    # линии
    for cid in ids:
        c = CON[cid]
        pts = [to(s[0], s[1]) for s in c["s"]]
        for a, b in c["l"]:
            (x1, y1, _), (x2, y2, _) = pts[a], pts[b]
            g += f'<path d="M{f(x1)},{f(y1)} L{f(x2)},{f(y2)}" stroke="{GOLD}" stroke-width="1.5" opacity=".75" stroke-linecap="round"/>'
    # звёзды
    named = []
    for cid in ids:
        for st in CON[cid]["s"]:
            x, y, _ = to(st[0], st[1])
            if st[3] and any(n[3] == st[3] for n in named):
                continue
            g += star_dot(x, y, st[2], st[3], k)
            lab.block(x, y, mag_r(st[2], k) + 1.5)
            if st[3]:
                named.append((st[2], x, y, st[3]))
    if extra:
        g += extra(to, lab)
    txt = ""
    # подписи созвездий
    if con_labels:
        for cid in ids:
            c = CON[cid]
            pts = [to(s[0], s[1]) for s in c["s"]]
            ys_ = [p[1] for p in pts]
            x = sum(p[0] for p in pts) / len(pts)
            yc_ = sum(ys_) / len(ys_)
            name = con_labels.get(cid, c["name"]) if isinstance(con_labels, dict) else c["name"]
            t = ""
            if con_at and cid in con_at:
                xx, yy, _ = to(*con_at[cid])
                t = lab.place(xx, yy, name.upper(), 13, 0, GOLD, False, "700", force=True)
            for (xx, yy) in ([] if t else  ((x, max(ys_) + 20), (x, yc_), (x, min(ys_) - 12), (x - 40, yc_ + 24), (x + 40, yc_ + 24), (x, yc_ - 30), (x, yc_ + 30))):
                t = lab.place(xx, yy, name.upper(), 13, 0, GOLD, False, "700")
                if t:
                    break
            txt += t or lab.place(x, yc_, name.upper(), 13, 0, GOLD, False, "700", force=True)
    # подписи звёзд: сначала яркие
    if names:
        seen = set()
        for m, x, y, nm in sorted(named, key=lambda t: (t[3] not in highlight, t[0])):
            if nm in seen:
                continue
            seen.add(nm)
            hl = nm in highlight
            txt += lab.place(x, y, nm, 14 if hl else 12, mag_r(m, k), GOLD2 if hl else CREAM, False, "700" if hl else "normal", force=hl)
    s += f'<g clip-path="url(#cb)">{g}{txt}</g>'
    body = frame(w, h, title, sub) + s
    if emblem:
        body += f'<g transform="translate({w-90},14) scale(.34)">{medallion(emblem, "e" + emblem)}</g>'
    body += (f'<text x="{bx0+10}" y="{by1-10}" font-family="{SERIF}" font-size="11" fill="{CREAM}" opacity=".55">С ↑ · В ←</text>')
    return body


def con_plate(cid, highlight=(), title=None, sub=None, emblem=True, w=640, h=480, **kw):
    c = CON[cid]
    t = title or f"{c['name']} · {c['lat']}"
    zod = cid in HS
    if sub is None:
        sub = f"созвездие {GEN.get(cid, c['name'])}" + (f" · знак {c.get('sign', GL.get(cid, ''))}" if zod else "")
    return svg(w, h, chart([cid], w, h, t, sub, cid if (emblem and zod) else None, highlight=highlight, **kw), t)


# ───────────── эмблема знака крупно ─────────────
def sign_plate(sid, w=420, h=520, note=None):
    hs = HS[sid]
    fr, to_ = hs["from"], hs["to"]
    dates = f"{fr[1]} {MON[fr[0]-1]} — {to_[1]} {MON[to_[0]-1]}"
    s = frame(w, h)
    s += f'<g transform="translate({w/2-130},40) scale(1.3)">{medallion(sid, "s" + sid)}</g>'
    s += f'<text x="{w/2}" y="342" text-anchor="middle" font-family="{GLYPH}" font-size="34" fill="url(#goldG)">{GL[sid]}︎</text>'
    s += f'<text x="{w/2}" y="386" text-anchor="middle" font-family="{SERIF}" font-size="30" font-weight="700" letter-spacing="3" fill="url(#goldG)">{hs["name"].upper()}</text>'
    s += f'<text x="{w/2}" y="414" text-anchor="middle" font-family="{SERIF}" font-size="16" fill="{CREAM}">{esc(dates)}</text>'
    s += f'<text x="{w/2}" y="440" text-anchor="middle" font-family="{SERIF}" font-size="15" font-style="italic" fill="{CREAM}" opacity=".85">стихия — {esc(hs["el"])} · звезда — {esc(hs["star"])}</text>'
    if note:
        s += f'<text x="{w/2}" y="474" text-anchor="middle" font-family="{SERIF}" font-size="15" fill="{GOLD2}">{esc(note)}</text>'
    return svg(w, h, s, f"Знак {hs['name']}")


# ───────────── страница из книги Аурелии Бранкати ─────────────
def grimoire_page(sid, w=360, h=500):
    hs = HS[sid]
    c = CON[sid]
    s = (f'<rect width="{w}" height="{h}" rx="10" fill="#efe3c6"/>'
         f'<rect x="10" y="10" width="{w-20}" height="{h-20}" rx="6" fill="none" stroke="#8f5a2c" stroke-width="1.2"/>'
         f'<rect x="15" y="15" width="{w-30}" height="{h-30}" rx="4" fill="none" stroke="#8f5a2c" stroke-width=".5"/>')
    s += f'<text x="{w/2}" y="48" text-anchor="middle" font-family="{SERIF}" font-size="24" font-weight="700" letter-spacing="2" fill="#5a2f18">{GL[sid]}︎ {hs["name"].upper()}</text>'
    s += f'<text x="{w/2}" y="70" text-anchor="middle" font-family="{SERIF}" font-size="14" font-style="italic" fill="#7a4a28">{esc(hs["role"])} · сила — {esc(hs["power"])}</text>'
    # мини-карта созвездия чернилами
    body = chart([sid], w, 300, None, None, None, names=True, field=False, grid=False, box=(30, 84, w - 30, 290), k=.85, highlight=(hs["star"],))
    # перекрашиваем ночную карту в «чернила на бумаге»
    body = body.split("</rect>", 0)[0]
    s += f'<g>{ink(body)}</g>'
    s += f'<g transform="translate({w/2-46},300) scale(.46)">{medallion(sid, "g" + sid, ring=False)}</g>'
    s += f'<text x="{w/2}" y="420" text-anchor="middle" font-family="{SERIF}" font-size="15" fill="#5a2f18">звезда: <tspan font-weight="700">{esc(hs["star"])}</tspan></text>'
    am = " · ".join(hs["amulets"])
    lines = wrap(am if am.startswith("оберег") else f"оберег: {am}", 40)
    for i, ln in enumerate(lines[:2]):
        s += f'<text x="{w/2}" y="{444+i*20}" text-anchor="middle" font-family="{SERIF}" font-size="14" font-style="italic" fill="#7a4a28">{esc(ln)}</text>'
    return svg(w, h, s, f"{hs['name']} — страница из книги")


def ink(body):
    """Ночную карту → рисунок чернилами на бумаге."""
    rep = [('fill="url(#skyG)"', 'fill="none"'), (f'stroke="{GOLD3}" stroke-width=".8"', 'stroke="none"'),
           (f'stroke="{GOLD}"', 'stroke="#7a4a28"'), (f'fill="{WHITE}"', 'fill="#3a2414"'), (f'fill="{CREAM}"', 'fill="#5a2f18"'),
           (f'fill="{GOLD2}"', 'fill="#8f2f35"'), (f'stroke="{INK}"', 'stroke="#efe3c6"'), ('fill="url(#halo)"', 'fill="none"')]
    for a, b in rep:
        body = body.replace(a, b)
    for v in RED.values():
        body = body.replace(f'fill="{v}"', 'fill="#8f2f35"')
    # убрать двойную рамку карты
    i = body.find(f'<rect width=')
    return body[body.find('<clipPath'):] if '<clipPath' in body else body


def wrap(t, n):
    out, cur = [], ""
    for wd in t.split():
        if len(cur) + len(wd) + 1 > n and cur:
            out.append(cur)
            cur = wd
        else:
            cur = (cur + " " + wd).strip()
    return out + ([cur] if cur else [])


# ───────────── эклиптика: тринадцать созвездий на пути Солнца ─────────────
def ecl(ra_h, dec):
    a, d = math.radians(ra_h * 15), math.radians(dec)
    lam = math.degrees(math.atan2(math.sin(a) * math.cos(EPS) + math.tan(d) * math.sin(EPS), math.cos(a))) % 360
    bet = math.degrees(math.asin(math.sin(d) * math.cos(EPS) - math.cos(d) * math.sin(EPS) * math.sin(a)))
    return lam, bet


def ecliptic_plate(w=900, h=860):
    order = NEBO["zodiacOrder"]
    s = frame(w, h, "Путь Солнца среди звёзд", "эклиптика и тринадцать созвездий, через которые она проходит")
    rows = [(0, 180), (180, 360)]
    rh, top = 344, 92
    bx0, bx1 = 40, w - 40
    sc = (bx1 - bx0) / 195
    for ri, (l0, l1) in enumerate(rows):
        y0 = top + ri * (rh + 22)
        yc = y0 + rh / 2 + 8
        mid = (l0 + l1) / 2

        def X(lam):
            return (bx0 + bx1) / 2 - (lam - mid) * sc  # восток (большая долгота) — слева

        def Y(b):
            return yc - b * sc
        s += f'<clipPath id="r{ri}"><rect x="{bx0}" y="{y0}" width="{bx1-bx0}" height="{rh}" rx="10"/></clipPath>'
        s += f'<rect x="{bx0}" y="{y0}" width="{bx1-bx0}" height="{rh}" rx="10" fill="url(#skyG)" stroke="{GOLD3}" stroke-width=".8"/>'
        g = ""
        for lam in range(int(l0) - 10, int(l1) + 11, 10):
            g += f'<path d="M{f(X(lam))},{y0} L{f(X(lam))},{y0+rh}" stroke="{GOLD}" stroke-width=".5" opacity=".12"/>'
        g += f'<path d="M{bx0},{f(yc)} L{bx1},{f(yc)}" stroke="{GOLD}" stroke-width="2.4" opacity=".9"/>'
        lab = Labels((bx0 + 4, y0 + 4, bx1 - 4, y0 + rh - 4))
        for cid in order:
            c = CON[cid]
            E = [ecl(st[0], st[1]) for st in c["s"]]
            lm = math.degrees(math.atan2(sum(math.sin(math.radians(e[0])) for e in E), sum(math.cos(math.radians(e[0])) for e in E))) % 360
            for shift in (-360, 0, 360):
                if not (l0 - 8 <= lm + shift < l1 + 8 and (ri == 0 and lm + shift < 186 or ri == 1 and lm + shift >= 174)):
                    continue
                if ri == 0 and lm + shift >= 180 or ri == 1 and lm + shift < 180:
                    continue
                pts = []
                for (lam, bet) in E:
                    dl = (lam - lm + 180) % 360 - 180
                    pts.append((X(lm + shift + dl), Y(bet)))
                for a, b in c["l"]:
                    g += f'<path d="M{f(pts[a][0])},{f(pts[a][1])} L{f(pts[b][0])},{f(pts[b][1])}" stroke="{GOLD}" stroke-width="1.3" opacity=".7"/>'
                for (x, y), st in zip(pts, c["s"]):
                    g += star_dot(x, y, st[2], st[3], .9)
                    lab.block(x, y, mag_r(st[2], .9) + 1)
                ys = [p[1] for p in pts]
                lx = sum(p[0] for p in pts) / len(pts)
                hl = cid == "oph"
                txt = lab.place(lx, max(ys) + 18 if max(ys) + 22 < y0 + rh else min(ys) - 10, c["name"].upper(), 13, 0, ROSE if hl else GOLD, False, "700", force=True)
                g += txt
        s += f'<g clip-path="url(#r{ri})">{g}</g>'
        # стрелка движения Солнца
        s += f'<text x="{bx1-12}" y="{y0+rh-12}" text-anchor="end" font-family="{SERIF}" font-size="12" font-style="italic" fill="{CREAM}" opacity=".75">← Солнце идёт за год</text>'
    s += f'<text x="{w/2}" y="{h-26}" text-anchor="middle" font-family="{SERIF}" font-size="13" fill="{CREAM}" opacity=".8">Золотая линия — эклиптика. Восток слева, как на небе. Красным — Змееносец, тринадцатый.</text>'
    return svg(w, h, s, "Эклиптика и тринадцать созвездий")


# ───────────── двенадцать знаков и тринадцать созвездий ─────────────
# Границы созвездий на эклиптике (эклиптическая долгота, эпоха J2000, по границам МАС).
IAU = [("psc", 351.6, 28.7), ("ari", 28.7, 53.5), ("tau", 53.5, 90.4), ("gem", 90.4, 118.3), ("cnc", 118.3, 138.2),
       ("leo", 138.2, 174.2), ("vir", 174.2, 218.0), ("lib", 218.0, 241.0), ("sco", 241.0, 247.7), ("oph", 247.7, 266.3),
       ("sgr", 266.3, 299.7), ("cap", 299.7, 327.9), ("aqr", 327.9, 351.6)]


def rings_plate(w=700, h=840):
    s = frame(w, h, "Двенадцать знаков и тринадцать созвездий", "знаки — по линейке, ровно по 30°; созвездия — какие есть на небе")
    cx, cy = w / 2, 420
    R1, R2, R3, R4 = 128, 196, 206, 286

    def P(r, lam):  # долгота растёт против часовой стрелки, 0° (точка Овна) — слева
        a = math.radians(180 - lam)
        return cx + r * math.cos(a), cy - r * math.sin(a)

    def sector(r0, r1, a0, a1, fill, op=1, stroke=GOLD):
        x0, y0 = P(r1, a0)
        x1, y1 = P(r1, a1)
        x2, y2 = P(r0, a1)
        x3, y3 = P(r0, a0)
        big = 1 if (a1 - a0) % 360 > 180 else 0
        return (f'<path d="M{f(x0)},{f(y0)} A{r1},{r1} 0 {big} 0 {f(x1)},{f(y1)} L{f(x2)},{f(y2)} A{r0},{r0} 0 {big} 1 {f(x3)},{f(y3)} Z" '
                f'fill="{fill}" opacity="{op}" stroke="{stroke}" stroke-width="1"/>')
    s += f'<circle cx="{cx}" cy="{cy}" r="{R4+16}" fill="url(#skyG)" stroke="{GOLD3}" stroke-width=".8"/>'
    # внешнее кольцо: созвездия
    for i, (cid, a0, a1) in enumerate(IAU):
        span = (a1 - a0) % 360
        col = ROSE2 if cid == "oph" else (NAVY2 if i % 2 else "#24357a")
        s += sector(R3, R4, a0, a0 + span, col)
        mid = a0 + span / 2
        x, y = P((R3 + R4) / 2, mid)
        rot = 90 - mid if 0 <= (mid % 360) < 180 else 270 - mid
        name = CON[cid]["name"]
        fs = 12 if span > 20 else 10.5
        if cid == "sco":  # самый узкий кусок — подпись снаружи
            xo, yo = P(R4 + 26, mid)
            s += f'<path d="M{f(P(R4,mid)[0])},{f(P(R4,mid)[1])} L{f(xo)},{f(yo)}" stroke="{CREAM}" stroke-width=".8"/>'
            s += f'<text x="{f(xo)}" y="{f(yo+12)}" text-anchor="middle" font-family="{SERIF}" font-size="12" fill="{CREAM}">Скорпион</text>'
        else:
            s += (f'<text x="{f(x)}" y="{f(y)}" text-anchor="middle" dominant-baseline="central" font-family="{SERIF}" font-size="{fs}" '
                  f'font-weight="{700 if cid == "oph" else 400}" fill="{WHITE}" transform="rotate({f(rot)} {f(x)} {f(y)})">{name}</text>')
    # внутреннее кольцо: знаки по 30°
    for i, sid in enumerate(SIGNS):
        a0 = i * 30
        s += sector(R1, R2, a0, a0 + 30, "#1a2a5e" if i % 2 else "#22346e")
        x, y = P(R2 - 22, a0 + 15)
        s += f'<text x="{f(x)}" y="{f(y)}" text-anchor="middle" dominant-baseline="central" font-family="{GLYPH}" font-size="20" fill="{GOLD2}">{GL[sid]}︎</text>'
        x, y = P(R1 + 22, a0 + 15)
        rot = 90 - (a0 + 15) if (a0 + 15) < 180 else 270 - (a0 + 15)
        s += f'<text x="{f(x)}" y="{f(y)}" text-anchor="middle" dominant-baseline="central" font-family="{SERIF}" font-size="10.5" fill="{CREAM}" transform="rotate({f(rot)} {f(x)} {f(y)})">{HS[sid]["name"]}</text>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{R1}" fill="#0d1534" stroke="{GOLD}" stroke-width="1.2"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{(R2+R3)/2}" fill="none" stroke="url(#goldG)" stroke-width="3"/>'
    for k in range(12):
        x0, y0 = P(R1, k * 30)
        x1, y1 = P(R2, k * 30)
        s += f'<path d="M{f(x0)},{f(y0)} L{f(x1)},{f(y1)}" stroke="{GOLD}" stroke-width="1"/>'
    # центр: Планетарий
    s += (f'<path d="M{cx-52},{cy+18} A52,48 0 0 1 {cx+52},{cy+18} Z" fill="{COPPER}" stroke="{GOLD2}" stroke-width="1.4"/>'
          f'<rect x="{cx-60}" y="{cy+18}" width="120" height="26" fill="{NAVY}" stroke="{GOLD}" stroke-width="1.2"/>'
          f'<path d="M{cx},{cy-30} L{cx},{cy-44}" stroke="{GOLD}" stroke-width="1.6"/>')
    for x in range(int(cx) - 48, int(cx) + 49, 16):
        s += f'<rect x="{x}" y="{cy+24}" width="8" height="13" rx="4" fill="{SUN}" opacity=".85"/>'
    s += f'<text x="{cx}" y="{cy-56}" text-anchor="middle" font-family="{SERIF}" font-size="12" fill="{CREAM}">точка Овна — слева</text>'
    s += (f'<text x="{w/2}" y="{h-62}" text-anchor="middle" font-family="{SERIF}" font-size="14" fill="{CREAM}">Внутри — двенадцать знаков, ровные куски по 30°. Снаружи — созвездия:</text>'
          f'<text x="{w/2}" y="{h-38}" text-anchor="middle" font-family="{SERIF}" font-size="14" fill="{CREAM}">Дева — 44°, Скорпион — меньше 7°, а между Скорпионом и Стрельцом — <tspan fill="#ff9a8a" font-weight="700">Змееносец</tspan>.</text>')
    return svg(w, h, s, "Знаки и созвездия на эклиптике")


# ───────────── колесо над Планетарием (гл. 8) и круг считалки (гл. 15) ─────────────
def wheel_plate(w=640, h=640, dim="aqr", title="Колесо над Планетарием", sub="двенадцать знаков — и один мигает", arrows=False):
    s = frame(w, h, title, sub)
    cx, cy, R = w / 2, 344 if title else 320, 214
    s += f'<circle cx="{cx}" cy="{cy}" r="{R+40}" fill="url(#skyG)" stroke="{GOLD3}" stroke-width=".8"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{R+26}" fill="none" stroke="{GOLD3}" stroke-width="1" stroke-dasharray="2 5"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{R-46}" fill="none" stroke="{GOLD}" stroke-width="1.4"/>'
    for i, sid in enumerate(SIGNS):
        a = math.radians(-90 - i * 30)  # Овен сверху, по кругу против часовой (как на небе — к востоку)
        a = math.radians(-90 + i * 30)
        x, y = cx + R * math.cos(a), cy + R * math.sin(a)
        b = math.radians(-75 + i * 30)
        s += f'<path d="M{f(cx+(R-46)*math.cos(b))},{f(cy+(R-46)*math.sin(b))} L{f(cx+(R+26)*math.cos(b))},{f(cy+(R+26)*math.sin(b))}" stroke="{GOLD3}" stroke-width=".8"/>'
        isd = sid == dim
        s += f'<g transform="translate({f(x-36)},{f(y-36)}) scale(.36)"{" opacity=\".45\"" if isd else ""}>{medallion(sid, "w" + sid + str(int(arrows)), dim=isd)}</g>'
        if isd:
            s += f'<circle cx="{f(x)}" cy="{f(y)}" r="40" fill="none" stroke="{GOLD2}" stroke-width="1.6" stroke-dasharray="3 4"/>'
        tx, ty = cx + (R - 64) * math.cos(a), cy + (R - 64) * math.sin(a)
        s += f'<text x="{f(tx)}" y="{f(ty)}" text-anchor="middle" dominant-baseline="central" font-family="{SERIF}" font-size="12.5" fill="{CREAM}">{HS[sid]["name"]}</text>'
        if arrows:
            m = math.radians(-75 + i * 30)
            ax, ay = cx + (R + 34) * math.cos(m), cy + (R + 34) * math.sin(m)
            rot = math.degrees(m) + 90
            s += f'<path d="M-6,-4 L4,0 L-6,4" transform="translate({f(ax)},{f(ay)}) rotate({f(rot)})" fill="none" stroke="{GOLD2}" stroke-width="1.6"/>'
    if arrows:
        s += f'<text x="{cx}" y="{cy-10}" text-anchor="middle" font-family="{SERIF}" font-size="17" font-style="italic" fill="{GOLD2}">«…А проснёшься —</text>'
        s += f'<text x="{cx}" y="{cy+16}" text-anchor="middle" font-family="{SERIF}" font-size="17" font-style="italic" fill="{GOLD2}">и снова Овен»</text>'
    else:
        s += (f'<path d="M{cx-60},{cy+48} A60,56 0 0 1 {cx+60},{cy+48} Z" fill="{COPPER}" stroke="{GOLD2}" stroke-width="1.4"/>'
              f'<rect x="{cx-70}" y="{cy+48}" width="140" height="30" fill="{NAVY}" stroke="{GOLD}" stroke-width="1.2"/>'
              f'<path d="M{cx},{cy-8} L{cx},{cy-24}" stroke="{GOLD}" stroke-width="1.6"/>')
        for x in range(int(cx) - 56, int(cx) + 57, 16):
            s += f'<rect x="{x}" y="{cy+55}" width="8" height="15" rx="4" fill="{SUN}" opacity=".85"/>'
        s += f'<text x="{cx}" y="{cy+102}" text-anchor="middle" font-family="{SERIF}" font-size="12" font-style="italic" fill="{CREAM}" opacity=".8">медная чаша Планетария</text>'
    return svg(w, h, s, title or "Круг знаков")


# ───────────── вид неба с земли ─────────────
def altaz(ra_h, dec, lst_h, lat=LAT):
    H = math.radians((lst_h - ra_h) * 15)
    d, p = math.radians(dec), math.radians(lat)
    e = -math.cos(d) * math.sin(H)
    n = math.sin(d) * math.cos(p) - math.cos(d) * math.cos(H) * math.sin(p)
    u = math.sin(d) * math.sin(p) + math.cos(d) * math.cos(H) * math.cos(p)
    return math.atan2(e, n), math.asin(max(-1, min(1, u)))  # азимут от севера к востоку, высота


def view_plate(lst, az0, alt0, fov, ids, title, sub, w=900, h=600, highlight=(), con_names=None, skyline=True):
    A0, H0 = math.radians(az0), math.radians(alt0)
    bx0, by0, bx1, by1 = 30, 84, w - 30, h - 30
    s = frame(w, h, title, sub)
    sc = (bx1 - bx0) / (2 * 2 * math.tan(math.radians(fov / 4)))

    yc = by1 - 46 + 2 * math.tan(-H0 / 2) * sc  # горизонт на юге — над нижним краем

    def to(ra, dec):
        A, Hh = altaz(ra, dec, lst)
        X, Y, c = stereo(A, Hh, A0, H0)
        return (bx0 + bx1) / 2 + X * sc, yc - Y * sc, c, Hh

    def toAH(A, Hh):
        X, Y, c = stereo(A, Hh, A0, H0)
        return (bx0 + bx1) / 2 + X * sc, yc - Y * sc
    s += f'<clipPath id="cv"><rect x="{bx0}" y="{by0}" width="{bx1-bx0}" height="{by1-by0}" rx="10"/></clipPath>'
    g = f'<rect x="{bx0}" y="{by0}" width="{bx1-bx0}" height="{by1-by0}" fill="url(#skyG)"/>'
    lab = Labels((bx0 + 4, by0 + 4, bx1 - 4, by1 - 4))
    # высотные круги
    for alt in (30, 60):
        pts = [toAH(math.radians(a), math.radians(alt)) for a in range(int(az0 - 130), int(az0 + 131), 2)]
        g += f'<path d="M' + " L".join(f"{f(x)},{f(y)}" for x, y in pts) + f'" fill="none" stroke="{GOLD}" stroke-width=".6" stroke-dasharray="3 5" opacity=".3"/>'
        x, y = toAH(A0 + math.radians(fov / 2 - 6), math.radians(alt))
    for cid, c in CON.items():
        pts = [to(st[0], st[1]) for st in c["s"]]
        main = cid in ids
        for a, b in c["l"]:
            p1, p2 = pts[a], pts[b]
            if p1[3] > -.05 and p2[3] > -.05 and p1[2] > 0 and p2[2] > 0:
                g += f'<path d="M{f(p1[0])},{f(p1[1])} L{f(p2[0])},{f(p2[1])}" stroke="{GOLD}" stroke-width="{1.4 if main else .8}" opacity="{.75 if main else .3}"/>'
        for p, st in zip(pts, c["s"]):
            if p[3] > 0 and p[2] > 0:
                g += star_dot(p[0], p[1], st[2], st[3], 1 if main else .85, not main)
                lab.block(p[0], p[1], mag_r(st[2]) + 1)
    # подписи звёзд
    named = []
    for cid in ids:
        for st in CON[cid]["s"]:
            x, y, c, Hh = to(st[0], st[1])
            if st[3] and Hh > 0 and c > 0:
                named.append((st[2], x, y, st[3]))
    txt = ""
    seen = set()
    for m, x, y, nm in sorted(named, key=lambda t: (t[3] not in highlight, t[0])):
        if nm in seen:
            continue
        seen.add(nm)
        hl = nm in highlight
        txt += lab.place(x, y, nm, 14 if hl else 12, mag_r(m), GOLD2 if hl else CREAM, False, "700" if hl else "normal", force=hl)
    for cid in ids:
        pts = [to(st[0], st[1]) for st in CON[cid]["s"]]
        vis = [p for p in pts if p[3] > 0 and p[2] > 0]
        if not vis:
            continue
        x = sum(p[0] for p in vis) / len(vis)
        y = max(p[1] for p in vis) + 22
        txt += lab.place(x, y, (con_names or {}).get(cid, CON[cid]["name"]).upper(), 13, 0, GOLD, False, "700", force=True)
    # земля и горизонт
    hz = [toAH(math.radians(a), 0) for a in range(int(az0 - 140), int(az0 + 141), 2)]
    ground = f'M{f(hz[0][0])},{by1+40} ' + " ".join(f"L{f(x)},{f(y)}" for x, y in hz) + f' L{f(hz[-1][0])},{by1+40} Z'
    gg = f'<path d="{ground}" fill="#0a1024" stroke="{GOLD}" stroke-width="1.2"/>'
    if skyline:
        gg += sinea_on(hz, toAH, az0)
    for a, nm in ((90, "В"), (135, "ЮВ"), (180, "Ю"), (225, "ЮЗ"), (270, "З"), (45, "СВ"), (315, "СЗ"), (0, "С"), (360, "С")):
        if abs(a - az0) < fov / 2 - 4:
            x, y = toAH(math.radians(a), 0)
            gg += f'<text x="{f(x)}" y="{f(y+26)}" text-anchor="middle" font-family="{SERIF}" font-size="15" font-weight="700" fill="{GOLD2}">{nm}</text>'
    s += f'<g clip-path="url(#cv)">{g}{txt}{gg}</g>'
    s += f'<rect x="{bx0}" y="{by0}" width="{bx1-bx0}" height="{by1-by0}" rx="10" fill="none" stroke="{GOLD3}" stroke-width=".8"/>'
    return svg(w, h, s, title)


def sinea_on(hz, toAH, az0):
    """Силуэт Синеи по линии горизонта: черепичные крыши, маяк, медный купол Планетария."""
    import random
    rnd = random.Random(7)
    s = ""
    xs = [p[0] for p in hz]
    x = min(xs)
    xmax = max(xs)

    def yat(xx):
        for (x1, y1), (x2, y2) in zip(hz, hz[1:]):
            if x1 <= xx <= x2 or x2 <= xx <= x1:
                t = (xx - x1) / ((x2 - x1) or 1)
                return y1 + t * (y2 - y1)
        return hz[-1][1]
    while x < xmax:
        wd = rnd.uniform(10, 20)
        hh = rnd.uniform(6, 18)
        y = yat(x + wd / 2)
        s += f'<rect x="{f(x)}" y="{f(y-hh)}" width="{f(wd)}" height="{f(hh+2)}" fill="#141c3c" stroke="{GOLD3}" stroke-width=".4"/>'
        s += f'<path d="M{f(x-1)},{f(y-hh)} L{f(x+wd/2)},{f(y-hh-rnd.uniform(3,6))} L{f(x+wd+1)},{f(y-hh)} Z" fill="{COPPER2}" opacity=".8"/>'
        if rnd.random() < .5:
            s += f'<rect x="{f(x+wd/2-1)}" y="{f(y-hh+3)}" width="2.4" height="3" fill="{SUN}" opacity=".8"/>'
        x += wd + rnd.uniform(0, 3)
    # купол Планетария — левее центра, маяк — правее
    dx = (min(xs) + xmax) / 2 - 150
    y = yat(dx)
    s += (f'<rect x="{f(dx-20)}" y="{f(y-26)}" width="40" height="28" fill="#141c3c" stroke="{GOLD3}" stroke-width=".6"/>'
          f'<path d="M{f(dx-22)},{f(y-26)} A22,20 0 0 1 {f(dx+22)},{f(y-26)} Z" fill="{COPPER}" stroke="{GOLD}" stroke-width=".8"/>')
    lx = (min(xs) + xmax) / 2 + 210
    y = yat(lx)
    s += (f'<path d="M{f(lx-5)},{f(y)} L{f(lx-3.5)},{f(y-40)} L{f(lx+3.5)},{f(y-40)} L{f(lx+5)},{f(y)} Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".5"/>'
          f'<rect x="{f(lx-4.6)}" y="{f(y-20)}" width="9.2" height="6" fill="{ROSE}"/>'
          f'<rect x="{f(lx-3)}" y="{f(y-48)}" width="6" height="8" fill="{SUN}"/>'
          f'<path d="M{f(lx)},{f(y-45)} L{f(lx-70)},{f(y-60)} L{f(lx-70)},{f(y-36)} Z" fill="{GOLD2}" opacity=".12"/>')
    return s


# ───────────── ретроградный Меркурий (гл. 4) ─────────────
def retro_plate(w=760, h=470):
    """Схема: Меркурий и Земля на орбитах; с Земли Меркурий на фоне звёзд описывает петлю."""
    s = frame(w, h, "Почему Меркурий «пятится»", "схема: видимое движение планеты на фоне звёзд")
    # слева: орбиты
    cx, cy = 200, 280
    rm, re_ = 62, 150
    s += f'<rect x="34" y="92" width="{w-68}" height="{h-130}" rx="10" fill="url(#skyG)" stroke="{GOLD3}" stroke-width=".8"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{re_}" fill="none" stroke="{TEAL}" stroke-width="1.2" stroke-dasharray="4 4"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="{rm}" fill="none" stroke="{GOLD}" stroke-width="1.2" stroke-dasharray="3 4"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="16" fill="{SUN}" stroke="{GOLD2}" stroke-width="1"/>'
    s += f'<text x="{cx}" y="{cy+34}" text-anchor="middle" font-family="{SERIF}" font-size="12" fill="{CREAM}">Солнце</text>'
    # Земля справа, Меркурий в нижнем соединении — между Землёй и Солнцем
    ex, ey = cx + re_, cy
    s += f'<circle cx="{ex}" cy="{ey}" r="9" fill="{TEAL}" stroke="{WHITE}" stroke-width="1"/>'
    s += f'<text x="{ex}" y="{ey+26}" text-anchor="middle" font-family="{SERIF}" font-size="12" fill="{CREAM}">Земля</text>'
    for k, a in enumerate((-35, -18, 0, 18, 35)):
        r = math.radians(a)
        mx, my = cx + rm * math.cos(r), cy - rm * math.sin(r)
        s += f'<circle cx="{f(mx)}" cy="{f(my)}" r="{5 if a == 0 else 3.4}" fill="{CREAM if a == 0 else GOLD2}" opacity="{1 if a == 0 else .7}"/>'
        s += f'<path d="M{ex},{ey} L{f(ex+(mx-ex)*2.3)},{f(ey+(my-ey)*2.3)}" stroke="{GOLD2}" stroke-width=".6" opacity=".35"/>'
    s += f'<text x="{cx+rm-4}" y="{cy-rm*.62}" font-family="{SERIF}" font-size="12" fill="{CREAM}">Меркурий</text>'
    s += f'<path d="M{cx+rm+8},{cy+30} A{rm+8},{rm+8} 0 0 0 {cx+rm+8},{cy-30}" fill="none" stroke="{GOLD2}" stroke-width="1.4"/>'
    s += f'<path d="M-5,-4 L3,0 L-5,4" transform="translate({cx+rm+8},{cy-30}) rotate(-80)" fill="none" stroke="{GOLD2}" stroke-width="1.4"/>'
    s += (f'<text x="{cx}" y="{h-50}" text-anchor="middle" font-family="{SERIF}" font-size="12.5" fill="{CREAM}" opacity=".85">'
          f'Меркурий обгоняет Землю по внутренней орбите…</text>')
    # справа: путь на фоне звёзд (восток слева)
    x0, x1, y0 = 400, w - 60, 260
    import random
    rnd = random.Random(4)
    pts = []
    for i in range(41):
        t = i / 40
        x = x1 - t * (x1 - x0)
        loop = math.exp(-((t - .5) / .16) ** 2)
        xx = x + loop * 150 * math.sin((t - .5) * math.pi / .32) * .5
        yy = y0 - 50 * loop * math.cos((t - .5) * math.pi / .32) + 30 * (t - .5)
        pts.append((xx, yy))
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)
    s += f'<path d="{d}" fill="none" stroke="{GOLD2}" stroke-width="2" stroke-dasharray="1 5" stroke-linecap="round"/>'
    for i in range(0, 41, 4):
        x, y = pts[i]
        s += f'<circle cx="{f(x)}" cy="{f(y)}" r="3.4" fill="{CREAM}"/>'
    for i, lbl in ((6, "вперёд"), (20, "назад"), (34, "снова вперёд")):
        x, y = pts[i]
        x2, y2 = pts[i + 2]
        ang = math.degrees(math.atan2(y2 - y, x2 - x))
        s += f'<path d="M-6,-4 L4,0 L-6,4" transform="translate({f(x2)},{f(y2)}) rotate({f(ang)})" fill="none" stroke="{GOLD}" stroke-width="1.8"/>'
        s += f'<text x="{f(x)}" y="{f(y-14 if i != 20 else y-34)}" text-anchor="middle" font-family="{SERIF}" font-size="13" font-style="italic" fill="{GOLD2}">{lbl}</text>'
    s += (f'<text x="{(x0+x1)/2}" y="{h-50}" text-anchor="middle" font-family="{SERIF}" font-size="12.5" fill="{CREAM}" opacity=".85">'
          f'…и нам кажется, что он пошёл назад. Восток слева.</text>')
    return svg(w, h, s, "Ретроградный Меркурий")


# ───────────── сборка ─────────────
def build():
    out = {}
    # гл. 1 — знак Водолея
    out["sign-aqr"] = sign_plate("aqr", note="«Солнце вошло в знак Водолея»")
    # гл. 2 — зимнее небо под куполом «Урании»: Сириус, Капелла, Бетельгейзе на плече Ориона
    out["winter-sky"] = svg(760, 600, chart(["ori", "cma", "aur", "tau"], 760, 600, "Зимнее небо под куполом",
                                            "Сириус, Капелла и Бетельгейзе на плече Ориона", con_labels=True,
                                            highlight=("Сириус", "Капелла", "Бетельгейзе")), "Зимнее небо")
    out["ecliptic"] = ecliptic_plate()
    # гл. 3 — Водолей с Садалсуудом, Садалмеликом и Фомальгаутом
    out["aqr"] = svg(700, 540, chart(["aqr", "psa"], 700, 540, "Водолей · Aquarius", "человек с кувшином; поток стекает к Фомальгауту",
                                     "aqr", con_labels={"aqr": "Водолей", "psa": "Южная Рыба"},
                                     highlight=("Садалсууд", "Садалмелик", "Фомальгаут")), "Созвездие Водолея")
    out["cas-cep"] = svg(700, 480, chart(["cas", "cep"], 700, 480, "Кассиопея и Цефей", "их каждый год путает студент на проекторе",
                                         con_labels=True, highlight=("Шедар", "Альдерамин")), "Кассиопея и Цефей")
    # гл. 4 — ретроградный Меркурий
    out["mercury"] = retro_plate()
    # гл. 6 — Козерог, Денеб Альгеди
    out["cap"] = con_plate("cap", highlight=("Денеб Альгеди", "Альгеди"), sub="коза с рыбьим хвостом; Денеб Альгеди — «хвост козы»")
    # гл. 8 — колесо
    out["wheel"] = wheel_plate()
    # гл. 9 / 14 — Рыбы и Альриша
    out["psc"] = con_plate("psc", highlight=("Альриша",), sub="две рыбы на двух верёвках; Альриша — узел")
    out["sign-psc"] = sign_plate("psc", note="Альриша — «узел»")
    # гл. 10 — страницы книги Аурелии Бранкати
    for sid in SIGNS:
        out[f"book-{sid}"] = grimoire_page(sid)
    # гл. 11 — созвездия на трамваях
    out["uma"] = con_plate("uma", sub="Ковш — семь звёзд", highlight=("Дубхе", "Мерак"))
    out["cas"] = con_plate("cas", sub="буква W на небе")
    out["ori"] = con_plate("ori", highlight=("Бетельгейзе", "Ригель"), sub="пояс — три звезды, «Три Марии»")
    out["leo"] = con_plate("leo", highlight=("Регул",), sub="Регул — «маленький царь» на груди Льва")
    # гл. 12 — Козерог-эмблема
    out["sign-cap"] = sign_plate("cap", note="коза, которая вышла из моря")
    # гл. 13 — двенадцать знаков и тринадцать созвездий; Змееносец
    out["rings"] = rings_plate()
    out["oph"] = svg(700, 560, chart(["oph", "sco", "sgr"], 700, 560, "Змееносец", "Асклепий со змеёй — между Скорпионом и Стрельцом",
                                     con_labels=True, highlight=("Рас Альхаге", "Антарес"), con_at={"oph": (17.15, 1.0)}), "Змееносец")
    # гл. 14 — Плеяды, Альдебаран, Бетельгейзе
    out["tau-ori"] = svg(700, 520, chart(["tau", "ori"], 700, 520, "Телец, Плеяды и Орион", "Альдебаран «следует за Плеядами»",
                                         con_labels=True, highlight=("Альдебаран", "Плеяды", "Бетельгейзе")), "Телец и Орион")
    # гл. 15 — круг считалки; небо возвращается
    out["counting"] = wheel_plate(dim=None, title="Круг знаков", sub="«Овен — в огонь, Телец — на луг…»", arrows=True)
    out["spring-sky"] = svg(760, 520, chart(["ori", "tau", "gem", "cnc", "leo"], 760, 520, "Небо возвращается",
                                            "Орион, Плеяды, Кастор и Поллукс, Регул", con_labels=True,
                                            highlight=("Кастор", "Поллукс", "Регул", "Плеяды")), "Небо возвращается")
    # гл. 16 — февральский вечер над Синеей и сентябрь: Садалсууд и Фомальгаут
    out["feb-south"] = view_plate(6.6, 170, 38, 150, ["ori", "tau", "gem", "cma", "cmi", "aur", "leo", "cnc"],
                                  "Февраль, девять вечера, вид на юг", "Альдебаран высоко, Близнецы, Лев восходит на востоке",
                                  highlight=("Альдебаран", "Кастор", "Поллукс", "Регул", "Сириус"))
    out["sep-south"] = view_plate(22.4, 180, 26, 130, ["aqr", "psa", "cap", "peg"],
                                  "Сентябрь, вечер, низко на юге", "Водолей, Садалсууд — и одинокий Фомальгаут у горизонта",
                                  highlight=("Садалсууд", "Фомальгаут"))
    return out


def main():
    os.makedirs(OUT, exist_ok=True)
    png = sys.argv[sys.argv.index("--png") + 1] if "--png" in sys.argv else None
    if png:
        os.makedirs(png, exist_ok=True)
    out = build()
    for name, s in out.items():
        p = os.path.join(OUT, name + ".svg")
        open(p, "w").write(s)
        if png:
            subprocess.run(["rsvg-convert", "-o", os.path.join(png, name + ".png"), p], check=True)
    print(len(out), "файлов →", OUT)


if __name__ == "__main__":
    main()
