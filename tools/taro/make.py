#!/usr/bin/env python3
"""Колода Алисии («Знак»): 22 старших аркана, нарисованные кодом.

python3 tools/taro/make.py            → novels/znak/taro/00.svg … 21.svg
python3 tools/taro/make.py --png DIR  → ещё и PNG (через rsvg-convert) для проверки

Каждая карта — 300×500: тёмно-синее ночное небо Синеи, золотая гравюра,
римская цифра сверху и название снизу. Сцены — классические (Райдер — Уэйт),
но на каждой прячется что-то из Синеи: маяк, медный купол Планетария,
зелёный бинокль на набережной, трамвай, красная нитка с узлами.
"""
import math, os, random, subprocess, sys

ROOT = os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))
OUT = os.path.join(ROOT, "novels", "znak", "taro")

GOLD, GOLD2, GOLD3 = "#e6c27a", "#f7e2a8", "#b8914a"
INK, NAVY, NAVY2 = "#0a0f26", "#14204a", "#1d2c62"
CREAM, WHITE, SKIN, SKIN2 = "#efe3c6", "#f6f1e4", "#efd0ae", "#d9b08c"
ROSE, ROSE2, LAV, LAV2 = "#c4504a", "#8f2f35", "#a995d8", "#6f5aa8"
SEA, SEA2, TEAL = "#1c4a6b", "#123352", "#3d8aa3"
COPPER, COPPER2, GREEN, GREEN2 = "#c98448", "#8f5a2c", "#4f8a68", "#2f5e47"
GREY, GREY2, HAIR, HAIR2 = "#8d93a6", "#5d6378", "#6b4a32", "#3a2a20"
SUN, SUN2 = "#ffcf6a", "#f39a3c"
SERIF = "Georgia, 'Times New Roman', 'DejaVu Serif', serif"

WIN = "M24,432 L24,132 A126,78 0 0 1 276,132 L276,432 Z"  # арочное окно сцены


def f(v):
    return ("%.1f" % v).rstrip("0").rstrip(".")


def pts(p):
    return " ".join(f"{f(x)},{f(y)}" for x, y in p)


# ───────────── примитивы ─────────────
def star4(x, y, r, fill=GOLD2, op=1):
    k = r * .28
    return (f'<path d="M{f(x)},{f(y-r)} L{f(x+k)},{f(y-k)} L{f(x+r)},{f(y)} L{f(x+k)},{f(y+k)} '
            f'L{f(x)},{f(y+r)} L{f(x-k)},{f(y+k)} L{f(x-r)},{f(y)} L{f(x-k)},{f(y-k)} Z" fill="{fill}" opacity="{op}"/>')


def starN(x, y, R, r, n=8, fill=GOLD2, stroke=None, rot=-90, sw=1):
    p = []
    for i in range(n * 2):
        a = math.radians(rot + i * 180 / n)
        rr = R if i % 2 == 0 else r
        p.append((x + rr * math.cos(a), y + rr * math.sin(a)))
    s = f' stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round"' if stroke else ""
    return f'<polygon points="{pts(p)}" fill="{fill}"{s}/>'


def sky_stars(seed, n=55, y0=56, y1=300, x0=28, x1=272, avoid=None):
    rnd = random.Random(seed)
    out = []
    for _ in range(n):
        x, y = rnd.uniform(x0, x1), rnd.uniform(y0, y1)
        if avoid and any((x - ax) ** 2 + (y - ay) ** 2 < ar * ar for ax, ay, ar in avoid):
            continue
        r = rnd.choice([.6, .7, .8, .9, 1.1, 1.3])
        if rnd.random() < .12:
            out.append(star4(x, y, r * 3.2, GOLD2, .9))
        else:
            out.append(f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{WHITE}" opacity="{f(rnd.uniform(.35, .95))}"/>')
    return "".join(out)


def crescent(x, y, r, fill=GOLD2, d=.38, ang=0):
    # серп: круг минус смещённый круг (через маску)
    mid = f"m{x:.0f}{y:.0f}{r:.0f}{ang}".replace("-", "n").replace(".", "")
    dx, dy = r * d * 2 * math.cos(math.radians(ang)), r * d * 2 * math.sin(math.radians(ang))
    return (f'<mask id="{mid}"><circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="#fff"/>'
            f'<circle cx="{f(x+dx)}" cy="{f(y+dy)}" r="{f(r*.92)}" fill="#000"/></mask>'
            f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{fill}" mask="url(#{mid})"/>')


def limb(p, w, fill, out=GOLD, ow=1.1):
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in p)
    return (f'<path d="{d}" fill="none" stroke="{out}" stroke-width="{f(w+ow*2)}" stroke-linecap="round" stroke-linejoin="round"/>'
            f'<path d="{d}" fill="none" stroke="{fill}" stroke-width="{f(w)}" stroke-linecap="round" stroke-linejoin="round"/>')


def hand(x, y, r=3.2):
    return f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{SKIN}" stroke="{GOLD3}" stroke-width=".8"/>'


def head(x, y, r=11, hair=HAIR, style="short", face=True, turn=0):
    h = ""
    if style == "long":
        h += (f'<path d="M{f(x-r-2)},{f(y-2)} Q{f(x-r-5)},{f(y+r*2.2)} {f(x-r+3)},{f(y+r*2.6)} L{f(x+r-3)},{f(y+r*2.6)} '
              f'Q{f(x+r+5)},{f(y+r*2.2)} {f(x+r+2)},{f(y-2)} Z" fill="{hair}" stroke="{GOLD3}" stroke-width=".7"/>')
    if style == "long":
        h += f'<path d="M{f(x-r*.32)},{f(y+r*.5)} L{f(x-r*.38)},{f(y+r*1.7)} Q{f(x)},{f(y+r*1.95)} {f(x+r*.38)},{f(y+r*1.7)} L{f(x+r*.32)},{f(y+r*.5)} Z" fill="{SKIN2}"/>'
    h += f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{SKIN}" stroke="{GOLD3}" stroke-width=".9"/>'
    if style in ("short", "long", "bun"):
        h += (f'<path d="M{f(x-r-.6)},{f(y+1)} Q{f(x-r)},{f(y-r-2)} {f(x)},{f(y-r-1.5)} Q{f(x+r)},{f(y-r-2)} {f(x+r+.6)},{f(y+1)} '
              f'Q{f(x+r*.5)},{f(y-r*.45)} {f(x)},{f(y-r*.55)} Q{f(x-r*.5)},{f(y-r*.45)} {f(x-r-.6)},{f(y+1)} Z" fill="{hair}"/>')
    if style == "bun":
        h += f'<circle cx="{f(x)}" cy="{f(y-r-3)}" r="{f(r*.42)}" fill="{hair}"/>'
    if style == "bald":
        pass
    if face:
        ex = r * .36
        h += (f'<path d="M{f(x-ex-2+turn)},{f(y+1)} q2,1.6 4,0 M{f(x+ex-2+turn)},{f(y+1)} q2,1.6 4,0" stroke="{HAIR2}" stroke-width=".9" fill="none" stroke-linecap="round"/>'
              f'<path d="M{f(x-2.2+turn)},{f(y+r*.5)} q2.2,1.4 4.4,0" stroke="{ROSE2}" stroke-width=".9" fill="none" stroke-linecap="round"/>')
    return h


def robe(cx, top, bot, wt, wb, fill, out=GOLD, trim=None, sw=1.2):
    mid = (top + bot) / 2
    d = (f"M{f(cx-5)},{f(top)} L{f(cx-wt/2)},{f(top+7)} Q{f(cx-wt/2-3)},{f(mid)} {f(cx-wb/2)},{f(bot)} "
         f"Q{f(cx)},{f(bot+6)} {f(cx+wb/2)},{f(bot)} Q{f(cx+wt/2+3)},{f(mid)} {f(cx+wt/2)},{f(top+7)} L{f(cx+5)},{f(top)} Z")
    s = f'<path d="{d}" fill="{fill}" stroke="{out}" stroke-width="{sw}" stroke-linejoin="round"/>'
    if trim:
        s += f'<path d="M{f(cx)},{f(top+2)} L{f(cx)},{f(bot+4)}" stroke="{trim}" stroke-width="2.2"/>'
        s += f'<path d="M{f(cx-wb/2+2)},{f(bot-1)} Q{f(cx)},{f(bot+5)} {f(cx+wb/2-2)},{f(bot-1)}" stroke="{trim}" stroke-width="2" fill="none"/>'
    return s


def sea(y, color=SEA, color2=SEA2, x0=24, x1=276, y1=432, waves=4, seed=1):
    rnd = random.Random(seed)
    s = f'<rect x="{x0}" y="{f(y)}" width="{x1-x0}" height="{f(y1-y)}" fill="url(#seaG)"/>'
    for i in range(waves):
        yy = y + 8 + i * (y1 - y - 10) / waves
        d = f"M{x0},{f(yy)}"
        x = x0
        while x < x1:
            w = rnd.uniform(14, 24)
            d += f" q{f(w/2)},-3 {f(w)},0"
            x += w
        s += f'<path d="{d}" stroke="{GOLD}" stroke-width=".7" fill="none" opacity="{f(.55-i*.08)}"/>'
    return s


def sinea(y, x0=24, x1=276, seed=3, lighthouse=None, dome=None, op=1):
    """Силуэт Синеи на горизонте: дома с черепицей, маяк, медный купол Планетария."""
    rnd = random.Random(seed)
    s = f'<g opacity="{op}">'
    x = x0
    while x < x1:
        w = rnd.uniform(9, 17)
        h = rnd.uniform(8, 22)
        s += f'<rect x="{f(x)}" y="{f(y-h)}" width="{f(w)}" height="{f(h+1)}" fill="{NAVY2}" stroke="{GOLD3}" stroke-width=".5"/>'
        s += f'<path d="M{f(x-1)},{f(y-h)} L{f(x+w/2)},{f(y-h-rnd.uniform(4,7))} L{f(x+w+1)},{f(y-h)} Z" fill="{COPPER2}" opacity=".9"/>'
        if rnd.random() < .55:
            s += f'<rect x="{f(x+w/2-1.3)}" y="{f(y-h+3)}" width="2.6" height="3" fill="{SUN}" opacity=".85"/>'
        x += w + rnd.uniform(-1, 2)
    if dome is not None:
        dx = dome
        s += (f'<rect x="{f(dx-16)}" y="{f(y-30)}" width="32" height="30" fill="{NAVY2}" stroke="{GOLD3}" stroke-width=".6"/>'
              f'<path d="M{f(dx-18)},{f(y-30)} A18,17 0 0 1 {f(dx+18)},{f(y-30)} Z" fill="{COPPER}" stroke="{GOLD}" stroke-width=".8"/>'
              f'<path d="M{f(dx)},{f(y-47)} L{f(dx)},{f(y-53)}" stroke="{GOLD}" stroke-width="1"/>'
              f'<path d="M{f(dx-9)},{f(y-35)} A10,10 0 0 1 {f(dx+9)},{f(y-35)}" stroke="{GOLD2}" stroke-width=".6" fill="none" opacity=".7"/>')
    if lighthouse is not None:
        s += lighthouse_at(lighthouse, y, 1)
    return s + "</g>"


def lighthouse_at(x, y, k=1.0, beam=True):
    s = ""
    if beam:
        s += (f'<path d="M{f(x)},{f(y-50*k)} L{f(x-70*k)},{f(y-66*k)} L{f(x-70*k)},{f(y-40*k)} Z" fill="{GOLD2}" opacity=".16"/>'
              f'<path d="M{f(x)},{f(y-50*k)} L{f(x+60*k)},{f(y-62*k)} L{f(x+60*k)},{f(y-42*k)} Z" fill="{GOLD2}" opacity=".1"/>')
    s += (f'<path d="M{f(x-6*k)},{f(y)} L{f(x-4*k)},{f(y-44*k)} L{f(x+4*k)},{f(y-44*k)} L{f(x+6*k)},{f(y)} Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".6"/>'
          f'<path d="M{f(x-5.4*k)},{f(y-14*k)} L{f(x+5.4*k)},{f(y-14*k)} L{f(x+5*k)},{f(y-22*k)} L{f(x-5*k)},{f(y-22*k)} Z" fill="{ROSE}"/>'
          f'<path d="M{f(x-4.6*k)},{f(y-30*k)} L{f(x+4.6*k)},{f(y-30*k)} L{f(x+4.3*k)},{f(y-37*k)} L{f(x-4.3*k)},{f(y-37*k)} Z" fill="{ROSE}"/>'
          f'<rect x="{f(x-3.5*k)}" y="{f(y-53*k)}" width="{f(7*k)}" height="{f(9*k)}" fill="{SUN}" stroke="{GOLD}" stroke-width=".6"/>'
          f'<path d="M{f(x-5*k)},{f(y-53*k)} L{f(x)},{f(y-59*k)} L{f(x+5*k)},{f(y-53*k)} Z" fill="{ROSE2}"/>')
    return s


def hills(y, color=GREEN2, seed=5, amp=18, op=1, x0=24, x1=276):
    rnd = random.Random(seed)
    d = f"M{x0},432 L{x0},{f(y)}"
    x = x0
    while x < x1:
        w = rnd.uniform(40, 80)
        d += f" Q{f(x+w/2)},{f(y-rnd.uniform(amp*.4, amp))} {f(min(x+w, x1))},{f(y+rnd.uniform(-4, 4))}"
        x += w
    d += f" L{x1},432 Z"
    return f'<path d="{d}" fill="{color}" stroke="{GOLD3}" stroke-width=".7" opacity="{op}"/>'


def mountains(y, seed=7, color="#2a3a72", snow=True, op=1, tall=60):
    rnd = random.Random(seed)
    s = ""
    x = 10
    while x < 290:
        w = rnd.uniform(50, 90)
        h = rnd.uniform(tall * .5, tall)
        px = x + w / 2
        s += f'<path d="M{f(x)},{f(y)} L{f(px)},{f(y-h)} L{f(x+w)},{f(y)} Z" fill="{color}" stroke="{GOLD3}" stroke-width=".7" opacity="{op}"/>'
        if snow:
            s += (f'<path d="M{f(px-h*.18)},{f(y-h*.78)} L{f(px)},{f(y-h)} L{f(px+h*.18)},{f(y-h*.78)} '
                  f'L{f(px+h*.07)},{f(y-h*.82)} L{f(px)},{f(y-h*.74)} L{f(px-h*.08)},{f(y-h*.82)} Z" fill="{WHITE}" opacity=".85"/>')
        x += w * .62
    return s


def rose(x, y, r=6, fill=WHITE):
    s = f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{fill}" stroke="{GOLD3}" stroke-width=".7"/>'
    for i in range(5):
        a = math.radians(i * 72 - 90)
        s += f'<circle cx="{f(x+r*.62*math.cos(a))}" cy="{f(y+r*.62*math.sin(a))}" r="{f(r*.5)}" fill="{fill}" stroke="{GOLD3}" stroke-width=".5"/>'
    s += f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r*.32)}" fill="{GOLD}"/>'
    return s


def cup(x, y, k=1, fill=GOLD):
    return (f'<path d="M{f(x-8*k)},{f(y-14*k)} Q{f(x-8*k)},{f(y-2*k)} {f(x)},{f(y-1*k)} Q{f(x+8*k)},{f(y-2*k)} {f(x+8*k)},{f(y-14*k)} Z" fill="{fill}" stroke="{GOLD2}" stroke-width=".8"/>'
            f'<path d="M{f(x-1.5*k)},{f(y-1*k)} L{f(x-1.5*k)},{f(y+6*k)} L{f(x-6*k)},{f(y+8*k)} L{f(x+6*k)},{f(y+8*k)} L{f(x+1.5*k)},{f(y+6*k)} L{f(x+1.5*k)},{f(y-1*k)} Z" fill="{fill}" stroke="{GOLD2}" stroke-width=".7"/>')


def pentacle(x, y, r, fill=GOLD):
    return (f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{fill}" stroke="{GOLD2}" stroke-width=".8"/>'
            + starN(x, y, r * .78, r * .3, 5, "none", INK, rot=-90, sw=1.1))


def sword(x1, y1, x2, y2, w=3):
    a = math.atan2(y2 - y1, x2 - x1)
    nx, ny = -math.sin(a), math.cos(a)
    L = math.hypot(x2 - x1, y2 - y1)
    gx, gy = x1 + (x2 - x1) * .18, y1 + (y2 - y1) * .18
    tip = (x2, y2)
    b1 = (gx + nx * w / 2, gy + ny * w / 2)
    b2 = (gx - nx * w / 2, gy - ny * w / 2)
    t1 = (x2 - (x2 - x1) * .06 + nx * w / 2, y2 - (y2 - y1) * .06 + ny * w / 2)
    t2 = (x2 - (x2 - x1) * .06 - nx * w / 2, y2 - (y2 - y1) * .06 - ny * w / 2)
    s = f'<polygon points="{pts([b1, t1, tip, t2, b2])}" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".7"/>'
    s += limb([(gx + nx * 9, gy + ny * 9), (gx - nx * 9, gy - ny * 9)], 2.2, GOLD, GOLD3, .5)
    s += limb([(x1, y1), (gx, gy)], 2.4, COPPER2, GOLD3, .5)
    s += f'<circle cx="{f(x1)}" cy="{f(y1)}" r="2.4" fill="{GOLD}"/>'
    return s


def wand(x1, y1, x2, y2, leaves=True):
    s = limb([(x1, y1), (x2, y2)], 3.2, COPPER, GOLD3, .6)
    if leaves:
        for t in (.25, .55, .8):
            x, y = x1 + (x2 - x1) * t, y1 + (y2 - y1) * t
            s += f'<path d="M{f(x)},{f(y)} q-6,-4 -7,-9 q6,1 7,9 Z" fill="{GREEN}" stroke="{GOLD3}" stroke-width=".4"/>'
    return s


def pillar(x, top, bot, w, fill, letter=None, lc=WHITE):
    s = (f'<rect x="{f(x-w/2)}" y="{f(top)}" width="{f(w)}" height="{f(bot-top)}" fill="{fill}" stroke="{GOLD}" stroke-width="1"/>'
         f'<rect x="{f(x-w/2-4)}" y="{f(top-8)}" width="{f(w+8)}" height="8" fill="{fill}" stroke="{GOLD}" stroke-width="1"/>'
         f'<rect x="{f(x-w/2-4)}" y="{f(bot-6)}" width="{f(w+8)}" height="6" fill="{fill}" stroke="{GOLD}" stroke-width="1"/>'
         f'<path d="M{f(x-w/2-4)},{f(top-8)} Q{f(x)},{f(top-20)} {f(x+w/2+4)},{f(top-8)}" fill="{fill}" stroke="{GOLD}" stroke-width="1"/>')
    for i in range(1, 4):
        s += f'<path d="M{f(x-w/2+i*w/4)},{f(top+4)} L{f(x-w/2+i*w/4)},{f(bot-10)}" stroke="{GOLD3}" stroke-width=".5" opacity=".6"/>'
    if letter:
        s += f'<text x="{f(x)}" y="{f(top+28)}" text-anchor="middle" font-family="{SERIF}" font-size="15" font-weight="700" fill="{lc}">{letter}</text>'
    return s


def red_thread(x1, y1, x2, y2, knots=3, sag=8):
    mx, my = (x1 + x2) / 2, (y1 + y2) / 2 + sag
    s = f'<path d="M{f(x1)},{f(y1)} Q{f(mx)},{f(my)} {f(x2)},{f(y2)}" stroke="{ROSE}" stroke-width="1.6" fill="none"/>'
    for i in range(knots):
        t = (i + 1) / (knots + 1)
        x = (1 - t) ** 2 * x1 + 2 * (1 - t) * t * mx + t * t * x2
        y = (1 - t) ** 2 * y1 + 2 * (1 - t) * t * my + t * t * y2
        s += f'<circle cx="{f(x)}" cy="{f(y)}" r="2.3" fill="{ROSE}" stroke="{ROSE2}" stroke-width=".6"/>'
    return s


def binocular(x, y, k=1):
    """Зелёный чугунный бинокль на набережной."""
    return (f'<g transform="translate({f(x)},{f(y)}) scale({f(k)})">'
            f'<path d="M-3,0 L-2,-26 L2,-26 L3,0 Z" fill="{GREEN}" stroke="{GOLD3}" stroke-width=".6"/>'
            f'<rect x="-9" y="-2" width="18" height="4" rx="1.5" fill="{GREEN2}"/>'
            f'<g transform="rotate(-14 0 -30)"><rect x="-13" y="-36" width="26" height="11" rx="4" fill="{GREEN}" stroke="{GOLD3}" stroke-width=".6"/>'
            f'<rect x="10" y="-38" width="7" height="15" rx="2" fill="{GREEN2}" stroke="{GOLD3}" stroke-width=".6"/>'
            f'<circle cx="17" cy="-33.5" r="2" fill="{GOLD2}" opacity=".8"/><circle cx="17" cy="-28" r="2" fill="{GOLD2}" opacity=".8"/></g>'
            f'</g>')


def sphinx(x, y, c, flip=1, k=1.0):
    """Лежащий сфинкс: тело льва, голова в полосатом платке."""
    st = GOLD
    return (f'<g transform="translate({f(x)},{f(y)}) scale({f(flip*k)},{f(k)})">'
            f'<path d="M-30,0 L-30,-10 Q-30,-20 -18,-20 L8,-20 Q14,-20 16,-14 L22,-2 L30,-2 L30,0 Z" fill="{c}" stroke="{st}" stroke-width="1"/>'
            f'<path d="M8,0 L8,-6 L28,-6 L28,0 Z" fill="{c}" stroke="{st}" stroke-width=".8"/>'
            f'<path d="M-30,-8 q-10,-2 -8,8" stroke="{c}" stroke-width="2.4" fill="none"/>'
            f'<path d="M2,-20 L4,-36 Q12,-46 20,-36 L22,-20 Z" fill="{c}" stroke="{st}" stroke-width="1"/>'
            f'<path d="M0,-34 L24,-34 L26,-18 L-2,-18 Z" fill="{GOLD}" opacity=".85"/>'
            f'<path d="M1,-30 L25,-30 M0,-26 L26,-26 M-1,-22 L26,-22" stroke="#2f5d96" stroke-width="1.4"/>'
            f'<circle cx="13" cy="-30" r="6.5" fill="{SKIN}" stroke="{GOLD3}" stroke-width=".6"/>'
            f'<path d="M7,-36 Q13,-42 19,-36 L19,-34 L7,-34 Z" fill="{GOLD}"/>'
            f'<path d="M10,-30 l2,0 M15,-30 l2,0" stroke="{INK}" stroke-width=".9"/></g>')


def ground(y, fill="#243058", x0=24, x1=276):
    return f'<path d="M{x0},432 L{x0},{f(y)} Q150,{f(y-6)} {x1},{f(y)} L{x1},432 Z" fill="{fill}" stroke="{GOLD3}" stroke-width=".8"/>'


def zodiac_glyph(x, y, ch, size=13, fill=GOLD2):
    return f'<text x="{f(x)}" y="{f(y)}" text-anchor="middle" dominant-baseline="central" font-family="\'DejaVu Sans\', \'Segoe UI Symbol\', sans-serif" font-size="{size}" fill="{fill}">{ch}︎</text>'


# ───────────── оформление карты ─────────────
ROMAN = ["0", "I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII", "XIII", "XIV",
         "XV", "XVI", "XVII", "XVIII", "XIX", "XX", "XXI"]


def card(num, name, scene, day=False, seed=0):
    bg = ('<linearGradient id="win" x1="0" y1="0" x2="0" y2="1">'
          + ('<stop offset="0" stop-color="#f7d68f"/><stop offset=".45" stop-color="#e9a25e"/><stop offset="1" stop-color="#8a4a3a"/>'
             if day == "sun" else
             '<stop offset="0" stop-color="#6f86c9"/><stop offset=".55" stop-color="#3a4f97"/><stop offset="1" stop-color="#1b2658"/>'
             if day else
             '<stop offset="0" stop-color="#0b1233"/><stop offset=".55" stop-color="#1b2a63"/><stop offset="1" stop-color="#2b3d7e"/>')
          + '</linearGradient>')
    defs = (f'<defs>{bg}'
            '<linearGradient id="seaG" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#24577a"/><stop offset="1" stop-color="#0e2743"/></linearGradient>'
            '<radialGradient id="glow"><stop offset="0" stop-color="#fff3c4" stop-opacity=".9"/><stop offset=".4" stop-color="#ffd27a" stop-opacity=".35"/><stop offset="1" stop-color="#ffd27a" stop-opacity="0"/></radialGradient>'
            '<radialGradient id="sunG"><stop offset="0" stop-color="#fff6d0"/><stop offset=".6" stop-color="#ffd36b"/><stop offset="1" stop-color="#f3a23c"/></radialGradient>'
            '<linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e2a8"/><stop offset=".5" stop-color="#d9b062"/><stop offset="1" stop-color="#a8823e"/></linearGradient>'
            f'<clipPath id="cw"><path d="{WIN}"/></clipPath>'
            '</defs>')
    corner = "".join(star4(x, y, 6, GOLD, 1) for x, y in ((24, 24), (276, 24), (24, 476), (276, 476)))
    # маленькие знаки по бокам цифры
    top = (f'<text x="150" y="44" text-anchor="middle" font-family="{SERIF}" font-size="21" font-weight="700" fill="url(#goldG)" letter-spacing="2">{ROMAN[num]}</text>'
           + star4(104, 37, 4.5, GOLD) + star4(196, 37, 4.5, GOLD)
           + f'<path d="M70,37 L96,37 M204,37 L230,37" stroke="{GOLD3}" stroke-width=".8"/>')
    fs = 19 if len(name) <= 11 else 16 if len(name) <= 15 else 14
    plate = (f'<path d="M34,440 L266,440 L276,456 L266,472 L34,472 L24,456 Z" fill="#0d1534" stroke="{GOLD}" stroke-width="1.3"/>'
             f'<path d="M40,444 L260,444 L268,456 L260,468 L40,468 L32,456 Z" fill="none" stroke="{GOLD3}" stroke-width=".6"/>'
             f'<text x="150" y="462" text-anchor="middle" font-family="{SERIF}" font-size="{fs}" font-weight="700" fill="url(#goldG)" letter-spacing="1.5">{name.upper()}</text>')
    body = (f'<rect x="0" y="0" width="300" height="500" rx="16" fill="{INK}"/>'
            f'<rect x="7" y="7" width="286" height="486" rx="12" fill="none" stroke="url(#goldG)" stroke-width="2.4"/>'
            f'<rect x="13" y="13" width="274" height="474" rx="8" fill="none" stroke="{GOLD3}" stroke-width=".8"/>'
            + corner + top
            + f'<g clip-path="url(#cw)"><rect x="20" y="50" width="260" height="390" fill="url(#win)"/>{scene}</g>'
            + f'<path d="{WIN}" fill="none" stroke="url(#goldG)" stroke-width="2"/>'
            + f'<path d="M20,436 L20,130 A130,82 0 0 1 280,130 L280,436" fill="none" stroke="{GOLD3}" stroke-width=".7"/>'
            + plate)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 500" width="300" height="500" role="img" aria-label="{ROMAN[num]} {name}">'
            f'{defs}{body}</svg>')


# ───────────── 22 сцены ─────────────
def c00():  # Шут
    s = sky_stars(0, 60, y1=260, avoid=[(205, 120, 34)])
    s += f'<circle cx="205" cy="120" r="44" fill="url(#glow)"/>' + crescent(205, 120, 22, GOLD2, .34, 200)
    s += sea(330, seed=2) + sinea(330, 150, 276, seed=11, lighthouse=262, op=.85)
    # обрыв
    s += f'<path d="M24,300 L118,296 Q132,300 136,312 L150,432 L24,432 Z" fill="#2a3768" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<path d="M30,318 Q70,312 110,318 M36,350 Q80,340 120,352 M40,392 Q90,380 135,396" stroke="{GOLD3}" stroke-width=".6" fill="none" opacity=".7"/>'
    # Шут
    s += '<g transform="translate(98,300) scale(1.3) translate(-98,-300)">'
    s += limb([(104, 262), (112, 294)], 6, CREAM) + limb([(94, 262), (80, 292)], 6, CREAM)
    s += f'<path d="M78,296 l-6,2 l9,0 Z M110,296 l10,1 l-8,-3 Z" fill="{COPPER2}"/>'
    s += robe(98, 212, 266, 30, 46, LAV, trim=GOLD)
    s += f'<path d="M80,236 L116,236" stroke="{GOLD}" stroke-width="1"/>'
    s += limb([(88, 222), (70, 212), (58, 196)], 6, LAV) + hand(57, 194)
    s += wand(130, 166, 60, 214, False)
    s += f'<path d="M126,160 q16,-4 18,10 q-6,12 -20,6 Z" fill="{ROSE}" stroke="{GOLD}" stroke-width=".8"/>'  # узелок
    s += limb([(108, 222), (124, 210), (128, 196)], 6, LAV) + hand(129, 194)
    s += rose(132, 188, 5)
    s += head(98, 196, 11, HAIR, "short")
    s += f'<path d="M86,190 Q98,168 112,186 Q118,176 122,184 Q112,180 110,190 Z" fill="{ROSE}" stroke="{GOLD}" stroke-width=".8"/>'  # шапочка
    s += f'<path d="M115,183 q10,-10 16,-4" stroke="{ROSE}" stroke-width="2" fill="none"/><circle cx="131" cy="179" r="2.4" fill="{GOLD}"/>'
    # собачка
    s += (f'<g transform="translate(64,299)"><path d="M0,0 q-4,-14 6,-18 q8,-2 12,4 l14,0 q10,0 10,10 l0,10 -4,0 0,-6 -18,0 0,6 -4,0 0,-6 q-10,0 -16,0 Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".8"/>'
          f'<path d="M4,-14 l-4,-8 l8,4 Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".6"/><circle cx="6" cy="-11" r="1" fill="{INK}"/>'
          f'<path d="M42,-4 q8,-6 6,-14" stroke="{WHITE}" stroke-width="2.4" fill="none" stroke-linecap="round"/></g>')
    return s + '</g>'


def c01():  # Маг
    s = sky_stars(1, 50, y1=230)
    s += sinea(300, seed=4, dome=150, op=.6)
    # бесконечность
    s += f'<path d="M150,92 C138,78 116,78 116,92 C116,106 138,106 150,92 C162,78 184,78 184,92 C184,106 162,106 150,92 Z" fill="none" stroke="url(#goldG)" stroke-width="3"/>'
    s += f'<circle cx="150" cy="92" r="30" fill="url(#glow)" opacity=".6"/>'
    # маг
    s += robe(150, 150, 320, 46, 76, ROSE, trim=GOLD)
    s += f'<path d="M126,164 L120,316 L132,318 L138,166 Z M174,164 L180,316 L168,318 L162,166 Z" fill="{WHITE}" opacity=".9"/>'
    s += limb([(138, 160), (124, 136), (122, 112)], 7, WHITE) + hand(122, 110)
    s += f'<path d="M122,108 L122,74" stroke="{WHITE}" stroke-width="3.4" stroke-linecap="round"/>' + star4(122, 72, 8, GOLD2)
    s += limb([(162, 160), (184, 186), (200, 210)], 7, WHITE) + hand(201, 212)
    s += f'<path d="M204,214 l10,10" stroke="{GOLD2}" stroke-width="1.4"/>'
    s += f'<path d="M138,196 Q150,204 162,196" stroke="{GOLD}" stroke-width="2.4" fill="none"/>'
    s += head(150, 136, 12, HAIR2, "short")
    s += f'<path d="M138,128 L162,128" stroke="{GOLD}" stroke-width="2"/>'
    # стол с четырьмя мастями
    s += f'<rect x="40" y="318" width="220" height="12" fill="{COPPER}" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<path d="M48,330 L48,432 M252,330 L252,432" stroke="{COPPER2}" stroke-width="8"/>'
    s += f'<path d="M40,330 L260,330 L250,350 L50,350 Z" fill="{COPPER2}" stroke="{GOLD3}" stroke-width=".8"/>'
    s += cup(74, 304, 1.1) + pentacle(118, 302, 13) + sword(160, 314, 214, 270) + wand(226, 316, 250, 280, False)
    # розы и лилии
    s += "".join(rose(x, 418, 6, ROSE) for x in (40, 66, 234, 260)) + "".join(rose(x, 398, 5, WHITE) for x in (52, 248))
    return s


def c02():  # Верховная Жрица
    s = sky_stars(2, 40, y1=200)
    s += f'<rect x="56" y="150" width="188" height="250" fill="{NAVY}" opacity=".6"/>'
    # завеса с гранатами
    s += f'<rect x="70" y="150" width="160" height="236" fill="#3a2a6b" stroke="{GOLD3}" stroke-width=".8"/>'
    for i, (x, y) in enumerate([(88, 172), (120, 168), (180, 170), (212, 174), (96, 210), (204, 212), (90, 252), (210, 250)]):
        s += f'<circle cx="{x}" cy="{y}" r="7" fill="{ROSE}" stroke="{GOLD}" stroke-width=".7"/><path d="M{x-2},{y-7} l2,-4 l2,4" fill="{GOLD}"/>'
        s += f'<path d="M{x-14},{y+2} q6,-6 8,0 M{x+6},{y+2} q6,-6 8,0" stroke="{GREEN}" stroke-width="2" fill="none"/>'
    s += pillar(62, 140, 404, 24, INK, "B") + pillar(238, 140, 404, 24, CREAM, "J", INK)
    # жрица
    s += robe(150, 196, 396, 52, 108, "#2f5d96", trim=WHITE)
    s += f'<path d="M110,394 Q150,420 196,394 L200,420 Q150,436 104,420 Z" fill="#2f5d96" stroke="{GOLD}" stroke-width="1"/>'
    s += crescent(150, 414, 18, GOLD2, .4, -90)
    s += f'<path d="M126,206 L174,206 M150,200 L150,240 M136,220 L164,220" stroke="{WHITE}" stroke-width="2.6"/>'
    s += f'<path d="M120,276 L180,268 L182,300 L122,306 Z" fill="{CREAM}" stroke="{GOLD}" stroke-width=".8"/>'
    s += f'<text x="151" y="292" text-anchor="middle" font-family="{SERIF}" font-size="11" font-weight="700" fill="{INK}">ТОРА</text>'
    s += limb([(132, 222), (124, 260), (130, 284)], 7, "#2f5d96") + hand(132, 286)
    s += head(150, 178, 13, "#2f5d96", "long", True)
    s += f'<path d="M134,160 A14,14 0 0 1 166,160" stroke="{WHITE}" stroke-width="2" fill="none"/>'
    s += crescent(136, 156, 7, GOLD2, .45, 0) + crescent(164, 156, 7, GOLD2, .45, 180)
    s += f'<circle cx="150" cy="154" r="7" fill="{WHITE}" stroke="{GOLD}" stroke-width=".8"/>'
    return s


def c03():  # Императрица
    s = sky_stars(3, 30, y1=150)
    s += hills(300, GREEN2, 31, 28) + hills(340, GREEN, 32, 16)
    # водопад и деревья
    s += f'<path d="M238,250 Q244,300 236,360 L250,360 Q256,300 250,250 Z" fill="{TEAL}" stroke="{GOLD2}" stroke-width=".7" opacity=".9"/>'
    for x, y in ((228, 236), (258, 232), (252, 262)):
        s += f'<path d="M{x},{y+40} L{x},{y}" stroke="{HAIR2}" stroke-width="3"/><circle cx="{x}" cy="{y}" r="16" fill="{GREEN2}" stroke="{GOLD3}" stroke-width=".8"/>'
    # пшеница
    for i in range(14):
        x = 36 + i * 15
        s += f'<path d="M{x},432 Q{x+3},406 {x+1},388" stroke="{GOLD}" stroke-width="1.2" fill="none"/>'
        for k in range(4):
            s += f'<ellipse cx="{x+1+(k%2)*3-1.5}" cy="{388+k*5}" rx="2" ry="3.4" fill="{GOLD2}"/>'
    # подушки и трон
    s += f'<rect x="88" y="300" width="124" height="60" rx="18" fill="{ROSE}" stroke="{GOLD}" stroke-width="1.2"/>'
    s += f'<path d="M100,250 Q150,226 200,250 L204,304 L96,304 Z" fill="{ROSE2}" stroke="{GOLD}" stroke-width="1"/>'
    s += robe(150, 214, 352, 48, 110, WHITE, trim=None)
    for k in range(10):
        x, y = 118 + (k % 4) * 20 + (k // 4) * 6, 240 + (k // 4) * 32
        s += f'<path d="M{x},{y} l4,-5 l4,5 l-4,5 Z" fill="{ROSE}" opacity=".8"/>'
    s += limb([(168, 226), (186, 236), (192, 200)], 7, WHITE) + hand(192, 198)
    s += f'<path d="M192,196 L192,150" stroke="{GOLD}" stroke-width="2.6"/><circle cx="192" cy="146" r="6" fill="{GOLD}"/>'
    s += limb([(132, 226), (114, 262), (110, 290)], 7, WHITE)
    # щит Венеры
    s += f'<path d="M84,280 L124,280 L124,312 Q104,334 84,312 Z" fill="{COPPER}" stroke="{GOLD}" stroke-width="1"/>'
    s += zodiac_glyph(104, 302, "♀", 22, INK)
    s += head(150, 196, 13, HAIR, "long")
    # венец из двенадцати звёзд
    for k in range(12):
        a = math.radians(200 + k * 140 / 11)
        s += star4(150 + 24 * math.cos(a), 192 + 22 * math.sin(a), 4.5, GOLD2)
    return s


def c04():  # Император
    s = sky_stars(4, 30, y1=140)
    s += mountains(300, 41, "#7a3b33", False, tall=110) + mountains(330, 42, "#5c2a2a", False, tall=70)
    s += f'<rect x="24" y="330" width="252" height="102" fill="#3a1f22"/>'
    # каменный трон с головами овна
    s += f'<rect x="78" y="168" width="144" height="250" fill="{GREY2}" stroke="{GOLD}" stroke-width="1.2"/>'
    s += f'<rect x="66" y="300" width="168" height="40" fill="{GREY}" stroke="{GOLD}" stroke-width="1"/>'
    for x, y in ((90, 184), (210, 184), (72, 316), (228, 316)):
        s += (f'<circle cx="{x}" cy="{y}" r="9" fill="{GREY}" stroke="{GOLD}" stroke-width=".8"/>'
              f'<path d="M{x-8},{y-4} q-8,6 -2,12 q2,-6 4,-6 M{x+8},{y-4} q8,6 2,12 q-2,-6 -4,-6" stroke="{GOLD2}" stroke-width="1.6" fill="none"/>')
    s += zodiac_glyph(150, 186, "♈", 20, GOLD2)
    # император
    s += robe(150, 220, 404, 56, 100, ROSE, trim=GOLD)
    s += f'<path d="M110,236 L190,236 L196,300 L104,300 Z" fill="{GREY}" stroke="{GOLD}" stroke-width=".8" opacity=".9"/>'
    s += limb([(170, 234), (192, 262), (196, 244)], 8, ROSE) + hand(197, 242)
    s += f'<path d="M197,238 L197,196" stroke="{GOLD}" stroke-width="3"/><circle cx="197" cy="190" r="7" fill="none" stroke="{GOLD}" stroke-width="2.4"/><path d="M190,200 L204,200" stroke="{GOLD}" stroke-width="2.4"/>'
    s += limb([(130, 234), (108, 262), (106, 272)], 8, ROSE) + hand(106, 274)
    s += f'<circle cx="106" cy="268" r="9" fill="{GOLD}" stroke="{GOLD2}" stroke-width=".8"/><path d="M106,259 L106,252 M102,255 L110,255" stroke="{GOLD}" stroke-width="1.6"/>'
    s += head(150, 204, 13, WHITE, "short")
    s += f'<path d="M140,212 Q150,240 160,212 Q156,222 150,222 Q144,222 140,212 Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".6"/>'  # борода
    s += f'<path d="M136,192 L136,176 L143,184 L150,172 L157,184 L164,176 L164,192 Z" fill="{GOLD}" stroke="{GOLD2}" stroke-width=".8"/>'
    s += f'<path d="M126,404 l-8,10 h16 Z M174,404 l8,10 h-16 Z" fill="{GREY}" stroke="{GOLD}" stroke-width=".8"/>'
    return s


def c05():  # Иерофант
    s = sky_stars(5, 26, y1=140)
    s += pillar(56, 150, 420, 22, GREY2) + pillar(244, 150, 420, 22, GREY2)
    s += f'<rect x="78" y="150" width="144" height="260" fill="#2a2752" stroke="{GOLD3}" stroke-width=".8"/>'
    s += robe(150, 196, 360, 56, 104, ROSE, trim=WHITE)
    s += f'<path d="M126,200 L134,360 M174,200 L166,360" stroke="{GOLD}" stroke-width="5"/>'
    s += limb([(132, 214), (118, 236), (128, 222)], 8, ROSE)
    s += f'<path d="M126,224 L126,172 M118,180 L134,180 M120,190 L132,190 M122,200 L130,200" stroke="{GOLD}" stroke-width="2.4"/>' + hand(126, 226)
    s += limb([(168, 214), (184, 226), (180, 204)], 8, ROSE) + hand(180, 202)
    s += f'<path d="M176,200 L176,190 M180,198 L180,186 M184,200 L184,192" stroke="{SKIN}" stroke-width="2.4" stroke-linecap="round"/>'
    s += head(150, 178, 13, WHITE, "bald")
    s += (f'<path d="M136,168 Q150,104 164,168 Z" fill="{GOLD}" stroke="{GOLD2}" stroke-width="1"/>'
          f'<path d="M140,158 L160,158 M142,144 L158,144 M145,130 L155,130" stroke="{ROSE2}" stroke-width="2"/>')
    # ключи накрест
    s += (f'<g stroke="{GOLD}" stroke-width="2.6" fill="none"><path d="M120,388 L180,352"/><path d="M180,388 L120,352"/></g>'
          f'<circle cx="114" cy="392" r="6" fill="none" stroke="{GOLD}" stroke-width="2.4"/><circle cx="186" cy="392" r="6" fill="none" stroke="{WHITE}" stroke-width="2.4"/>'
          f'<path d="M176,352 l6,-4 M172,355 l4,-6 M124,352 l-6,-4 M128,355 l-4,-6" stroke="{GOLD}" stroke-width="2"/>')
    # послушники
    for x, c in ((92, ROSE), (208, WHITE)):
        s += robe(x, 380, 440, 30, 46, c, trim=GOLD) + head(x, 368, 10, HAIR, "bald", False)
        s += f'<path d="M{x-6},360 q6,-6 12,0" stroke="{HAIR2}" stroke-width="1" fill="none"/>'
    return s


def c06():  # Влюблённые
    s = f'<circle cx="150" cy="104" r="60" fill="url(#glow)"/>'
    s += f'<circle cx="150" cy="104" r="26" fill="url(#sunG)"/>'
    for k in range(16):
        a = math.radians(k * 22.5)
        s += f'<path d="M{f(150+30*math.cos(a))},{f(104+30*math.sin(a))} L{f(150+46*math.cos(a))},{f(104+46*math.sin(a))}" stroke="{SUN}" stroke-width="2"/>'
    # ангел
    s += f'<path d="M150,150 Q96,104 52,128 Q86,150 118,186 Z M150,150 Q204,104 248,128 Q214,150 182,186 Z" fill="{ROSE}" stroke="{GOLD}" stroke-width="1.2" opacity=".95"/>'
    for k in range(5):
        s += f'<path d="M{70+k*10},{134+k*6} Q{100+k*6},{146+k*4} {118},{180}" stroke="{GOLD2}" stroke-width=".6" fill="none"/>'
        s += f'<path d="M{230-k*10},{134+k*6} Q{200-k*6},{146+k*4} {182},{180}" stroke="{GOLD2}" stroke-width=".6" fill="none"/>'
    s += robe(150, 160, 220, 34, 54, LAV, trim=GOLD) + head(150, 148, 11, ROSE2, "long")
    s += f'<path d="M130,200 Q150,234 170,200" fill="{CREAM}" opacity=".9"/>'
    s += f'<path d="M24,250 Q90,232 150,246 Q210,232 276,252 L276,262 Q150,246 24,262 Z" fill="{CREAM}" opacity=".35"/>'
    s += hills(360, GREEN, 61, 20) + mountains(370, 62, "#4b5aa0", True, .9, 40)
    s += f'<rect x="24" y="366" width="252" height="70" fill="{GREEN2}"/>'
    # деревья
    s += f'<path d="M60,410 L60,290" stroke="{HAIR2}" stroke-width="6"/><circle cx="60" cy="284" r="26" fill="{GREEN}" stroke="{GOLD3}"/>'
    for i in range(6):
        s += f'<path d="M{50+i*4},{270+i*4} q-2,-8 4,-10 q4,6 -4,10 Z" fill="{SUN2}"/>'  # пламя
    s += f'<path d="M240,410 L240,290" stroke="{HAIR2}" stroke-width="6"/><circle cx="240" cy="284" r="26" fill="{GREEN}" stroke="{GOLD3}"/>'
    for x, y in ((228, 276), (246, 270), (238, 294), (254, 288)):
        s += f'<circle cx="{x}" cy="{y}" r="4" fill="{ROSE}"/>'
    s += f'<path d="M244,300 q8,10 -2,22 q-8,8 4,18" stroke="{GREEN2}" stroke-width="3" fill="none"/>'  # змей
    # двое, а между ними — красная нитка
    s += limb([(94, 362), (92, 412)], 8, SKIN) + limb([(104, 362), (108, 412)], 8, SKIN)
    s += robe(98, 302, 366, 30, 34, SKIN, sw=1)
    s += head(98, 288, 11, HAIR2, "short")
    s += limb([(104, 312), (124, 330)], 6, SKIN) + hand(126, 332)
    s += limb([(196, 362), (192, 412)], 8, SKIN) + limb([(206, 362), (208, 412)], 8, SKIN)
    s += robe(202, 302, 366, 28, 36, SKIN, sw=1)
    s += head(202, 288, 11, HAIR, "long")
    s += limb([(196, 312), (176, 330)], 6, SKIN) + hand(174, 332)
    s += red_thread(126, 332, 174, 332, 3, 10)
    return s


def c07():  # Колесница
    s = sky_stars(7, 40, y1=200)
    s += sea(310, seed=7) + sinea(310, seed=71, dome=120, lighthouse=250, op=.75)
    # колесница — каменный короб
    s += f'<rect x="84" y="290" width="132" height="86" fill="{GREY2}" stroke="{GOLD}" stroke-width="1.2"/>'
    s += f'<path d="M136,316 Q150,300 164,316 L164,330 Q150,320 136,330 Z" fill="{WHITE}"/><path d="M128,318 q-14,-4 -20,6 q12,-2 20,2 M172,318 q14,-4 20,6 q-12,-2 -20,2" fill="{GOLD}"/>'
    s += f'<circle cx="150" cy="350" r="7" fill="{ROSE}" stroke="{GOLD}"/>'
    # балдахин со звёздами
    s += f'<path d="M84,290 L84,170 M216,290 L216,170" stroke="{GOLD}" stroke-width="3"/>'
    s += f'<path d="M76,170 Q150,150 224,170 L220,184 Q150,166 80,184 Z" fill="#2b3c88" stroke="{GOLD}" stroke-width="1"/>'
    for x in range(92, 214, 18):
        s += star4(x, 176 - (abs(x - 150) < 40) * 3, 3.5, GOLD2)
    # возница в доспехах
    s += robe(150, 222, 296, 44, 60, GREY, trim=GOLD)
    s += f'<path d="M132,236 Q150,250 168,236 L166,260 Q150,268 134,260 Z" fill="{GOLD3}" stroke="{GOLD2}" stroke-width=".8"/>'
    s += crescent(128, 232, 7, GOLD2, .42, 0) + crescent(172, 232, 7, GOLD2, .42, 180)
    s += star4(150, 244, 5, WHITE)
    s += limb([(168, 236), (184, 252), (190, 236)], 7, GREY) + hand(190, 234)
    s += f'<path d="M190,230 L192,196" stroke="{GOLD}" stroke-width="2.6"/>' + star4(192, 194, 5, GOLD2)
    s += head(150, 208, 12, HAIR, "short")
    s += f'<path d="M136,202 L138,190 L150,196 L162,190 L164,202 Z" fill="{GOLD}"/>' + starN(150, 186, 6, 2.5, 8, GOLD2)
    # колёса и сфинксы
    s += f'<circle cx="92" cy="380" r="16" fill="none" stroke="{GOLD}" stroke-width="2.4"/><circle cx="208" cy="380" r="16" fill="none" stroke="{GOLD}" stroke-width="2.4"/>'
    s += f'<path d="M76,380 L108,380 M92,364 L92,396 M192,380 L224,380 M208,364 L208,396" stroke="{GOLD}" stroke-width="1"/>'
    for x, c, flip in ((100, INK, 1), (200, WHITE, -1)):
        s += sphinx(x, 424, c, flip, 1.35)
    return s


def c08():  # Сила
    s = sky_stars(8, 26, y1=150)
    s += mountains(320, 81, "#4b5aa0", True, .9, 80) + hills(340, GREEN, 82, 18)
    s += f'<path d="M150,108 C140,96 122,96 122,108 C122,120 140,120 150,108 C160,96 178,96 178,108 C178,120 160,120 150,108 Z" fill="none" stroke="url(#goldG)" stroke-width="2.6"/>'
    # лев
    s += (f'<path d="M150,330 Q170,300 214,306 Q252,310 258,350 L258,404 L246,404 L244,372 L226,372 L224,404 L212,404 L210,370 Q176,376 160,360 Z" fill="{SUN2}" stroke="{GOLD}" stroke-width="1.2"/>'
          f'<path d="M258,350 q14,10 10,30 q-2,8 6,10" stroke="{SUN2}" stroke-width="3" fill="none"/><circle cx="274" cy="390" r="4" fill="{HAIR}"/>')
    s += f'<circle cx="124" cy="322" r="36" fill="{COPPER}" stroke="{GOLD}" stroke-width="1.2"/>'
    for k in range(18):
        a = math.radians(k * 20)
        s += f'<path d="M{f(124+30*math.cos(a))},{f(322+30*math.sin(a))} q{f(8*math.cos(a+.6))},{f(8*math.sin(a+.6))} {f(10*math.cos(a))},{f(10*math.sin(a))}" stroke="{COPPER2}" stroke-width="2" fill="none"/>'
    s += f'<circle cx="122" cy="324" r="22" fill="{SUN2}" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<circle cx="114" cy="316" r="2.2" fill="{INK}"/><circle cx="130" cy="316" r="2.2" fill="{INK}"/><path d="M118,326 L126,326 L122,330 Z" fill="{HAIR2}"/>'
    s += f'<path d="M112,334 Q122,346 132,334 Q122,340 112,334 Z" fill="{ROSE2}"/>'
    # женщина
    s += robe(150, 196, 390, 46, 92, WHITE)
    s += f'<path d="M124,230 Q150,250 176,230 M120,280 Q150,300 180,280" stroke="{ROSE}" stroke-width="3" fill="none"/>'
    for x, y in ((124, 230), (176, 230), (120, 280), (180, 280), (150, 244)):
        s += rose(x, y, 4, ROSE)
    s += limb([(136, 210), (118, 262), (112, 304)], 7, WHITE) + hand(112, 306)
    s += limb([(162, 210), (150, 270), (126, 338)], 7, WHITE) + hand(126, 340)
    s += head(150, 178, 13, HAIR, "long")
    s += "".join(rose(150 + 15 * math.cos(math.radians(a)), 166 + 7 * math.sin(math.radians(a)), 3.2, ROSE) for a in range(180, 361, 36))
    return s


def c09():  # Отшельник
    s = sky_stars(9, 70, y1=330)
    s += f'<circle cx="94" cy="96" r="12" fill="{WHITE}" opacity=".9"/>'
    s += sea(370, seed=9) + lighthouse_at(250, 378, .9)
    # скалы со снегом
    s += f'<path d="M24,432 L24,340 Q70,310 120,316 Q170,300 214,330 L236,432 Z" fill="#3a4a88" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<path d="M24,352 Q70,322 120,328 Q170,312 210,340 L212,346 Q170,320 120,336 Q70,330 24,360 Z" fill="{WHITE}" opacity=".9"/>'
    # отшельник
    s += robe(130, 150, 328, 46, 80, GREY, trim=None)
    s += f'<path d="M106,160 Q130,120 154,160 L150,184 Q130,170 110,184 Z" fill="{GREY}" stroke="{GOLD}" stroke-width="1"/>'
    s += head(132, 172, 11, WHITE, "bald")
    s += f'<path d="M122,178 Q132,208 142,178 Q136,186 132,186 Q128,186 122,178 Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".6"/>'
    s += f'<path d="M108,156 Q130,116 156,158 Q158,150 154,140 Q130,106 104,146 Z" fill="{GREY2}" stroke="{GOLD}" stroke-width="1"/>'
    s += limb([(108, 200), (98, 258), (96, 320)], 6, GREY)
    s += f'<path d="M92,204 L96,336" stroke="{COPPER}" stroke-width="3.4" stroke-linecap="round"/>' + hand(94, 232)
    s += limb([(152, 196), (180, 184), (196, 170)], 7, GREY) + hand(197, 168)
    # фонарь со звездой
    s += f'<circle cx="200" cy="188" r="40" fill="url(#glow)"/>'
    s += (f'<path d="M198,164 L198,172" stroke="{GOLD}" stroke-width="1.4"/>'
          f'<path d="M188,174 L212,174 L216,204 L184,204 Z" fill="#fff3c4" stroke="{GOLD}" stroke-width="1.4" opacity=".95"/>'
          f'<path d="M186,174 L200,166 L214,174 Z M182,204 L218,204 L214,210 L186,210 Z" fill="{GOLD}"/>')
    s += starN(200, 189, 9, 4, 6, SUN2)
    return s


def c10():  # Колесо Фортуны — с двенадцатью знаками на ободе
    s = sky_stars(10, 40, y1=420)
    for (x, y) in ((58, 112), (242, 112), (58, 396), (242, 396)):
        s += f'<ellipse cx="{x}" cy="{y}" rx="30" ry="18" fill="{CREAM}" opacity=".22"/><ellipse cx="{x}" cy="{y+4}" rx="24" ry="13" fill="{CREAM}" opacity=".25"/>'
    for (x, y), g in zip(((58, 106), (242, 106), (58, 392), (242, 392)), "♒♏♉♌"):
        s += f'<circle cx="{x}" cy="{y}" r="15" fill="{NAVY}" stroke="{GOLD}" stroke-width="1.2"/>' + zodiac_glyph(x, y + 1, g, 17, GOLD2)
    cx, cy = 150, 256
    s += f'<circle cx="{cx}" cy="{cy}" r="96" fill="url(#glow)" opacity=".5"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="86" fill="{COPPER}" stroke="{GOLD2}" stroke-width="2"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="66" fill="#2b3c88" stroke="{GOLD2}" stroke-width="1.4"/>'
    s += f'<circle cx="{cx}" cy="{cy}" r="40" fill="{NAVY}" stroke="{GOLD}" stroke-width="1.2"/>'
    for k, g in enumerate("♈♉♊♋♌♍♎♏♐♑♒♓"):
        a = math.radians(-90 + k * 30)
        b = math.radians(-75 + k * 30)
        s += f'<path d="M{f(cx+66*math.cos(b))},{f(cy+66*math.sin(b))} L{f(cx+86*math.cos(b))},{f(cy+86*math.sin(b))}" stroke="{GOLD2}" stroke-width="1"/>'
        s += zodiac_glyph(cx + 76 * math.cos(a), cy + 76 * math.sin(a) + 1, g, 13, INK)
    for k in range(8):
        a = math.radians(k * 45)
        s += f'<path d="M{f(cx+8*math.cos(a))},{f(cy+8*math.sin(a))} L{f(cx+40*math.cos(a))},{f(cy+40*math.sin(a))}" stroke="{GOLD}" stroke-width="1.4"/>'
    for k, ch in enumerate("ТАРО"):
        a = math.radians(-90 + k * 90 + 22.5)
        s += f'<text x="{f(cx+54*math.cos(a))}" y="{f(cy+54*math.sin(a)+4)}" text-anchor="middle" font-family="{SERIF}" font-size="12" font-weight="700" fill="{GOLD2}">{ch}</text>'
    s += f'<circle cx="{cx}" cy="{cy}" r="9" fill="{GOLD}" stroke="{GOLD2}"/>'
    # сфинкс сверху, змей слева
    s += sphinx(150, 172, SKIN2, 1, .7)
    s += f'<path d="M58,180 Q40,210 60,240 Q80,270 56,300 Q40,320 54,340" stroke="{GOLD2}" stroke-width="4" fill="none"/><path d="M54,340 l-4,8 l9,-4 Z" fill="{GOLD2}"/>'
    s += f'<path d="M250,190 Q262,240 244,300 Q236,330 246,350" stroke="{ROSE}" stroke-width="7" fill="none" stroke-linecap="round"/><circle cx="250" cy="186" r="9" fill="{ROSE}"/>'
    return s


def c11():  # Справедливость
    s = sky_stars(11, 26, y1=140)
    s += pillar(60, 150, 420, 22, GREY2) + pillar(240, 150, 420, 22, GREY2)
    s += f'<path d="M78,150 L222,150 L222,410 L78,410 Z" fill="{LAV2}" stroke="{GOLD3}" stroke-width=".8"/>'
    s += f'<path d="M78,150 Q150,190 222,150" fill="none" stroke="{GOLD}" stroke-width="1.2"/>'
    s += f'<rect x="88" y="200" width="124" height="200" rx="6" fill="{GREY}" stroke="{GOLD}" stroke-width="1"/>'
    s += robe(150, 212, 404, 52, 100, ROSE, trim=GOLD)
    s += f'<path d="M134,222 Q150,212 166,222 L162,240 Q150,234 138,240 Z" fill="{GREEN}" stroke="{GOLD}" stroke-width=".8"/>'
    s += limb([(170, 226), (190, 210), (196, 188)], 7, ROSE) + hand(196, 186) + sword(196, 194, 196, 106, 5)
    s += limb([(130, 226), (114, 252), (108, 266)], 7, ROSE) + hand(108, 268)
    # весы
    s += f'<path d="M108,266 L108,258 M76,262 L140,262" stroke="{GOLD}" stroke-width="2"/>'
    for x in (76, 140):
        s += f'<path d="M{x},262 L{x-12},294 M{x},262 L{x+12},294" stroke="{GOLD2}" stroke-width=".8"/><path d="M{x-14},294 Q{x},306 {x+14},294 Z" fill="{GOLD}" stroke="{GOLD2}" stroke-width=".8"/>'
    s += head(150, 194, 13, HAIR2, "long")
    s += f'<path d="M136,182 L136,170 L143,177 L150,166 L157,177 L164,170 L164,182 Z" fill="{GOLD}"/><rect x="146" y="172" width="8" height="6" fill="{ROSE}"/>'
    s += zodiac_glyph(150, 132, "♎", 18, GOLD2)
    return s


def c12():  # Повешенный
    s = sky_stars(12, 60, y1=420)
    s += f'<path d="M70,110 L230,110" stroke="{COPPER2}" stroke-width="12" stroke-linecap="round"/>'
    s += f'<path d="M80,104 L80,432 M220,104 L220,432" stroke="{COPPER2}" stroke-width="12"/>'
    for x, y in ((80, 160), (220, 200), (80, 300), (220, 340)):
        s += f'<path d="M{x},{y} q-10,-6 -12,-14 q8,2 12,14 Z M{x},{y} q10,-6 12,-14 q-8,2 -12,14 Z" fill="{GREEN}" stroke="{GOLD3}" stroke-width=".5"/>'
    s += f'<path d="M70,110 L230,110" stroke="{GOLD3}" stroke-width="1" opacity=".6"/>'
    # верёвка — красная нитка
    s += f'<path d="M150,114 L150,150" stroke="{ROSE}" stroke-width="2.4"/><circle cx="150" cy="126" r="3" fill="{ROSE}"/><circle cx="150" cy="138" r="3" fill="{ROSE}"/>'
    # ноги: одна прямая, другая согнута крестом
    s += limb([(150, 152), (150, 236)], 9, ROSE) + limb([(150, 196), (176, 214), (152, 236)], 9, ROSE)
    s += f'<path d="M144,150 L156,150 L156,158 L144,158 Z" fill="{COPPER2}"/>'
    s += f'<path d="M126,236 L174,236 L170,318 L130,318 Z" fill="#2f5d96" stroke="{GOLD}" stroke-width="1.2"/>'
    s += f'<path d="M126,240 L174,240" stroke="{GOLD}" stroke-width="3"/>'
    s += limb([(130, 250), (112, 282), (130, 314)], 7, "#2f5d96") + limb([(170, 250), (188, 282), (170, 314)], 7, "#2f5d96")
    s += f'<circle cx="150" cy="340" r="30" fill="url(#glow)"/><circle cx="150" cy="340" r="18" fill="none" stroke="{GOLD2}" stroke-width="2"/>'
    for k in range(12):
        a = math.radians(k * 30)
        s += f'<path d="M{f(150+20*math.cos(a))},{f(340+20*math.sin(a))} L{f(150+26*math.cos(a))},{f(340+26*math.sin(a))}" stroke="{GOLD2}" stroke-width="1.4"/>'
    # голова вниз
    s += f'<g transform="rotate(180 150 334)">{head(150, 334, 12, GOLD, "long")}</g>'
    return s


def c13():  # Смерть
    s = sky_stars(13, 30, y1=210, avoid=[(222, 296, 30)])
    s += f'<circle cx="222" cy="300" r="50" fill="url(#glow)"/>' + f'<circle cx="222" cy="300" r="18" fill="url(#sunG)"/>'
    s += f'<rect x="190" y="268" width="14" height="70" fill="{GREY2}" stroke="{GOLD}" stroke-width=".8"/><rect x="240" y="268" width="14" height="70" fill="{GREY2}" stroke="{GOLD}" stroke-width=".8"/>'
    s += f'<path d="M188,268 l9,-12 l9,12 Z M238,268 l9,-12 l9,12 Z" fill="{COPPER2}"/>'
    s += sea(330, seed=13)
    s += f'<path d="M210,360 L250,360 L244,368 L216,368 Z" fill="{COPPER2}"/><path d="M230,360 L230,340 L244,356 Z" fill="{CREAM}"/>'
    s += f'<path d="M24,432 L24,350 Q90,336 170,356 L190,432 Z" fill="#2a3768" stroke="{GOLD}" stroke-width="1"/>'
    # всадник без коня: фигура в чёрных латах с флагом
    s += robe(110, 196, 380, 54, 86, INK, trim=GOLD)
    s += f'<path d="M84,214 L136,214 L140,280 L80,280 Z" fill="#1b1e2e" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<path d="M86,232 L134,232 M86,250 L134,250" stroke="{GOLD3}" stroke-width=".8"/>'
    s += limb([(130, 220), (154, 200), (160, 178)], 7, INK) + hand(160, 176)
    s += f'<path d="M160,176 L160,96" stroke="{GOLD}" stroke-width="2.6"/>'
    s += f'<path d="M160,100 L222,106 Q212,132 222,158 L160,152 Z" fill="{INK}" stroke="{GOLD}" stroke-width="1.2"/>' + rose(190, 128, 12, WHITE)
    s += limb([(90, 220), (76, 262), (82, 290)], 7, INK)
    # череп
    s += (f'<circle cx="110" cy="176" r="15" fill="{WHITE}" stroke="{GOLD3}" stroke-width="1"/>'
          f'<path d="M100,186 L120,186 L118,196 L102,196 Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".8"/>'
          f'<ellipse cx="104" cy="176" rx="4" ry="5" fill="{INK}"/><ellipse cx="116" cy="176" rx="4" ry="5" fill="{INK}"/>'
          f'<path d="M110,182 l-2,4 h4 Z" fill="{INK}"/><path d="M104,192 L116,192 M106,189 L106,196 M110,189 L110,196 M114,189 L114,196" stroke="{GREY2}" stroke-width=".7"/>')
    s += f'<path d="M94,168 Q110,140 126,168 L124,160 Q110,150 96,160 Z" fill="{INK}" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<path d="M94,166 L126,166" stroke="{ROSE}" stroke-width="2.4"/>'
    # маленький розмарин у ног
    for x in (52, 64, 150):
        s += f'<path d="M{x},400 q-2,-14 2,-26 M{x},392 l-6,-4 M{x+1},384 l6,-4 M{x},378 l-5,-4" stroke="{GREY}" stroke-width="1.4" fill="none"/>'
    return s


def c14():  # Умеренность
    s = sky_stars(14, 30, y1=150)
    s += mountains(300, 141, "#4b5aa0", True, .8, 60)
    s += f'<circle cx="232" cy="236" r="22" fill="url(#glow)"/>'
    s += f'<path d="M222,240 L232,224 L242,240 Z" fill="{GOLD2}" stroke="{GOLD}"/>'
    s += f'<path d="M232,250 Q200,300 170,330 Q140,360 160,432" stroke="{CREAM}" stroke-width="5" fill="none" opacity=".6"/>'
    s += hills(330, GREEN, 142, 12)
    s += f'<path d="M24,370 Q60,360 110,372 L110,432 L24,432 Z" fill="{TEAL}" opacity=".85"/>'
    s += f'<path d="M30,386 q10,-3 20,0 M60,396 q10,-3 20,0 M36,410 q10,-3 20,0" stroke="{GOLD2}" stroke-width=".7" fill="none"/>'
    # ирисы
    for x in (210, 232, 254):
        s += f'<path d="M{x},432 L{x},392" stroke="{GREEN2}" stroke-width="2"/><path d="M{x},392 q-8,-10 0,-18 q8,8 0,18 Z M{x},392 q-10,2 -12,-8 M{x},392 q10,2 12,-8" fill="{LAV}" stroke="{LAV2}" stroke-width="1"/>'
    # крылья
    s += f'<path d="M150,190 Q90,140 66,170 Q90,210 128,236 Z M150,190 Q210,140 234,170 Q210,210 172,236 Z" fill="{ROSE}" stroke="{GOLD}" stroke-width="1.2"/>'
    s += robe(150, 186, 380, 48, 80, WHITE)
    s += f'<path d="M140,206 L160,206 L150,224 Z" fill="none" stroke="{SUN2}" stroke-width="1.6"/><rect x="136" y="200" width="28" height="30" fill="none" stroke="{GOLD3}" stroke-width=".8"/>'
    s += limb([(132, 204), (112, 232), (112, 252)], 7, WHITE) + hand(112, 254) + cup(110, 262, .9)
    s += limb([(168, 204), (190, 260), (192, 296)], 7, WHITE) + hand(192, 298) + cup(194, 312, .9)
    s += f'<path d="M112,256 Q150,278 190,300" stroke="{TEAL}" stroke-width="3" fill="none"/>'
    s += f'<path d="M112,256 Q150,278 190,300" stroke="{WHITE}" stroke-width="1" fill="none" opacity=".7"/>'
    s += f'<circle cx="150" cy="166" r="24" fill="url(#glow)"/>' + head(150, 168, 12, GOLD, "long")
    s += limb([(142, 378), (124, 394), (104, 396)], 6, SKIN) + limb([(158, 378), (162, 404)], 6, SKIN)
    s += zodiac_glyph(150, 128, "♐", 16, GOLD2)
    return s


def c15():  # Дьявол — тёмная пещера, цепи, серые саквояжи
    s = f'<rect x="20" y="50" width="260" height="390" fill="#0b0b18"/>'
    s += f'<circle cx="150" cy="164" r="90" fill="#3a1830" opacity=".7"/>'
    s += starN(150, 110, 22, 9, 5, "none", GOLD2, rot=90, sw=2)
    # крылья летучей мыши
    s += (f'<path d="M150,190 Q100,130 40,150 Q60,170 56,190 Q76,182 84,204 Q100,192 118,222 Z" fill="#2a1d36" stroke="{GOLD3}" stroke-width="1"/>'
          f'<path d="M150,190 Q200,130 260,150 Q240,170 244,190 Q224,182 216,204 Q200,192 182,222 Z" fill="#2a1d36" stroke="{GOLD3}" stroke-width="1"/>')
    # фигура
    s += f'<path d="M120,190 Q150,176 180,190 L176,268 Q150,280 124,268 Z" fill="#4a2c3a" stroke="{GOLD3}" stroke-width="1"/>'
    s += f'<circle cx="150" cy="166" r="20" fill="#5a3442" stroke="{GOLD3}" stroke-width="1"/>'
    s += f'<path d="M134,152 Q124,128 136,118 Q134,136 142,148 Z M166,152 Q176,128 164,118 Q166,136 158,148 Z" fill="{GREY}" stroke="{GOLD3}" stroke-width=".8"/>'
    s += f'<ellipse cx="143" cy="164" rx="3.4" ry="2" fill="{SUN}"/><ellipse cx="157" cy="164" rx="3.4" ry="2" fill="{SUN}"/><path d="M144,176 Q150,180 156,176" stroke="{INK}" stroke-width="1.2" fill="none"/>'
    s += limb([(178, 200), (198, 182), (200, 162)], 7, "#4a2c3a") + hand(200, 160)
    s += limb([(122, 200), (104, 228), (96, 252)], 7, "#4a2c3a")
    s += f'<path d="M96,250 L92,280" stroke="{SUN2}" stroke-width="3"/><path d="M88,280 q4,-14 8,0 q-4,10 -8,0 Z" fill="{SUN}"/>'
    # пьедестал
    s += f'<rect x="108" y="270" width="84" height="70" fill="#2a2a3a" stroke="{GOLD3}" stroke-width="1"/>'
    s += f'<circle cx="150" cy="292" r="5" fill="none" stroke="{GREY}" stroke-width="2"/>'
    # цепи к фигурам
    for (x0, x1) in ((150, 86), (150, 214)):
        for k in range(7):
            t = k / 6
            cx, cy = x0 + (x1 - x0) * t, 294 + 46 * t + 14 * math.sin(t * math.pi)
            s += f'<ellipse cx="{f(cx)}" cy="{f(cy)}" rx="4" ry="2.6" fill="none" stroke="{GREY}" stroke-width="1.4" transform="rotate({f(20 if x1 > x0 else -20)} {f(cx)} {f(cy)})"/>'
    for x, hairc, st in ((86, HAIR, "long"), (214, HAIR2, "short")):
        s += robe(x, 352, 420, 28, 34, SKIN2, sw=1) + head(x, 340, 10, hairc, st)
        s += f'<path d="M{x-4},330 q-4,-8 -2,-12 M{x+4},330 q4,-8 2,-12" stroke="{GREY}" stroke-width="1.6" fill="none"/>'
    # серые докторские саквояжи
    for x in (40, 236):
        s += (f'<path d="M{x},432 L{x},404 Q{x},396 {x+8},396 L{x+20},396 Q{x+28},396 {x+28},404 L{x+28},432 Z" fill="{GREY}" stroke="{GOLD3}" stroke-width="1"/>'
              f'<path d="M{x+8},396 Q{x+14},386 {x+20},396" stroke="{GREY2}" stroke-width="2" fill="none"/><rect x="{x+11}" y="402" width="6" height="4" fill="{COPPER}"/>')
    return s


def c16():  # Башня
    s = sky_stars(16, 40, y1=300)
    s += f'<path d="M24,50 L276,50 L276,170 Q150,140 24,170 Z" fill="#1a1130" opacity=".7"/>'
    s += f'<ellipse cx="80" cy="96" rx="60" ry="22" fill="{GREY2}" opacity=".6"/><ellipse cx="230" cy="80" rx="56" ry="20" fill="{GREY2}" opacity=".6"/>'
    s += sea(380, seed=16)
    s += f'<path d="M24,432 L24,380 Q80,350 116,352 L190,352 Q230,356 276,384 L276,432 Z" fill="#3a3550" stroke="{GOLD}" stroke-width="1"/>'
    # водонапорная башня
    s += f'<path d="M126,352 L132,180 L168,180 L174,352 Z" fill="{GREY}" stroke="{GOLD}" stroke-width="1.2"/>'
    for y in range(196, 350, 16):
        s += f'<path d="M{129+(y-180)*-0.035},{y} L{171+(y-180)*0.035},{y}" stroke="{GREY2}" stroke-width=".7"/>'
    for y in (210, 260, 310):
        s += f'<rect x="144" y="{y}" width="12" height="18" rx="6" fill="{SUN}"/>'
    s += f'<path d="M118,180 L182,180 L176,150 L124,150 Z" fill="{TEAL}" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<path d="M120,180 L180,180" stroke="{GOLD}" stroke-width="2"/>'
    # голубой свет на крыше и падающая корона
    s += f'<circle cx="150" cy="148" r="34" fill="#8fd3ff" opacity=".25"/>'
    s += f'<g transform="rotate(-24 196 128)"><path d="M182,136 L182,122 L189,128 L196,116 L203,128 L210,122 L210,136 Z" fill="{GOLD}" stroke="{GOLD2}"/></g>'
    # молния
    s += f'<path d="M240,52 L206,104 L222,106 L176,152 L200,112 L184,110 L214,52 Z" fill="{GOLD2}" stroke="{WHITE}" stroke-width="1"/>'
    # пламя и капли-искры
    for x, y in ((126, 168), (172, 162), (132, 230), (170, 280)):
        s += f'<path d="M{x},{y} q-8,-12 0,-24 q2,10 8,8 q2,10 -8,16 Z" fill="{SUN2}" stroke="{SUN}" stroke-width=".8"/>'
    for k in range(14):
        x, y = 60 + (k * 37) % 180, 170 + (k * 53) % 180
        s += f'<path d="M{x},{y} l2,6 l-4,0 Z" fill="{SUN}" opacity=".85"/>'
    # падающие фигуры
    s += f'<g transform="rotate(-50 92 230)">{robe(92, 226, 270, 22, 30, "#2f5d96")}{head(92, 216, 9, HAIR, "short")}</g>'
    s += f'<g transform="rotate(40 214 266)">{robe(214, 262, 306, 22, 30, ROSE)}{head(214, 252, 9, GOLD, "long")}</g>'
    return s


def c17():  # Звезда — Водолей
    s = sky_stars(17, 40, y1=300, avoid=[(150, 110, 46)])
    s += f'<circle cx="150" cy="110" r="56" fill="url(#glow)"/>'
    s += starN(150, 110, 38, 12, 8, GOLD2, GOLD, sw=1) + starN(150, 110, 22, 8, 8, SUN, rot=-67.5)
    for k in range(7):
        a = math.radians(200 + k * 140 / 6)
        x, y = 150 + 104 * math.cos(a), 168 + 84 * math.sin(a)
        s += starN(x, y, 10, 3.6, 8, WHITE, GOLD3, sw=.5)
    s += hills(330, GREEN2, 171, 14)
    s += f'<ellipse cx="190" cy="388" rx="90" ry="34" fill="url(#seaG)" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<path d="M130,388 q14,-4 28,0 M170,398 q14,-4 28,0 M206,380 q14,-4 28,0" stroke="{GOLD2}" stroke-width=".7" fill="none"/>'
    # дерево и птица
    s += f'<path d="M246,330 L246,250" stroke="{HAIR2}" stroke-width="5"/><circle cx="246" cy="246" r="20" fill="{GREEN}" stroke="{GOLD3}"/>'
    s += f'<path d="M240,232 q8,-10 16,-2 q-4,4 -2,10 q-8,2 -14,-8 Z" fill="{ROSE}"/><path d="M256,230 l10,-4" stroke="{ROSE2}" stroke-width="1.6"/>'
    # девушка на коленях: одно колено на земле, другая нога — в воде
    s += limb([(104, 334), (94, 372), (128, 376)], 9, SKIN) + limb([(120, 334), (150, 332), (158, 378)], 9, SKIN)
    s += robe(112, 274, 340, 28, 42, CREAM)
    s += f'<path d="M100,300 Q112,306 124,300" stroke="{GOLD3}" stroke-width=".8" fill="none"/>'
    s += limb([(124, 286), (150, 314), (170, 340)], 6, SKIN) + hand(170, 342)
    s += limb([(100, 286), (82, 316), (70, 342)], 6, SKIN) + hand(70, 344)
    s += head(112, 262, 12, GOLD, "long")
    for x, y in ((176, 348), (64, 352)):
        s += f'<path d="M{x-8},{y-8} Q{x-10},{y+10} {x},{y+12} Q{x+10},{y+10} {x+8},{y-8} Z" fill="{COPPER}" stroke="{GOLD}" stroke-width="1"/><path d="M{x-6},{y-8} L{x+6},{y-8}" stroke="{GOLD2}" stroke-width="2"/>'
    s += f'<path d="M180,360 Q196,372 198,388" stroke="{TEAL}" stroke-width="3" fill="none"/><path d="M180,360 Q196,372 198,388" stroke="{WHITE}" stroke-width="1" fill="none" opacity=".8"/>'
    s += f'<path d="M62,362 Q56,392 46,412 M62,362 Q62,396 70,414 M62,362 Q50,384 32,398" stroke="{TEAL}" stroke-width="2.4" fill="none"/>'
    s += zodiac_glyph(48, 300, "♒", 16, GOLD2)
    return s


def c18():  # Луна — Рыбы, карта Алисии
    s = sky_stars(18, 40, y1=300, avoid=[(150, 120, 52)])
    s += f'<circle cx="150" cy="120" r="62" fill="url(#glow)"/>'
    s += f'<circle cx="150" cy="120" r="40" fill="{CREAM}" stroke="{GOLD}" stroke-width="1.4"/>'
    s += crescent(150, 120, 40, SUN, .2, 0)
    for k in range(24):
        a = math.radians(k * 15)
        L = 52 if k % 2 else 60
        s += f'<path d="M{f(150+44*math.cos(a))},{f(120+44*math.sin(a))} L{f(150+L*math.cos(a))},{f(120+L*math.sin(a))}" stroke="{GOLD2}" stroke-width="1.4"/>'
    s += (f'<path d="M134,118 q6,-4 10,0 M156,118 q6,-4 10,0" stroke="{HAIR2}" stroke-width="1.4" fill="none"/>'
          f'<path d="M148,122 q-2,8 2,10" stroke="{HAIR2}" stroke-width="1" fill="none"/><path d="M142,138 q8,4 16,0" stroke="{HAIR2}" stroke-width="1.2" fill="none"/>')
    for k in range(9):
        x, y = 92 + k * 15, 186 + (k % 3) * 9
        s += f'<path d="M{x},{y} q3,6 0,9 q-3,-3 0,-9 Z" fill="{GOLD2}" opacity=".9"/>'
    # две башни, дорога
    s += mountains(300, 181, "#3a4a88", False, .9, 60)
    s += f'<rect x="34" y="214" width="34" height="110" fill="{GREY}" stroke="{GOLD}" stroke-width="1"/><rect x="232" y="214" width="34" height="110" fill="{GREY}" stroke="{GOLD}" stroke-width="1"/>'
    s += f'<rect x="44" y="232" width="12" height="18" rx="6" fill="{SUN}"/><rect x="244" y="232" width="12" height="18" rx="6" fill="{SUN}"/>'
    s += f'<path d="M30,214 l21,-14 l21,14 Z M228,214 l21,-14 l21,14 Z" fill="{COPPER2}"/>'
    s += hills(330, GREEN2, 182, 10)
    s += f'<path d="M144,330 Q120,310 150,290 Q176,270 152,250 L156,250 Q182,272 156,292 Q128,312 156,330 Z" fill="{CREAM}" opacity=".55"/>'
    # собака и волк
    for x, c, flip in ((84, WHITE, 1), (216, GREY, -1)):
        s += (f'<g transform="translate({x},336) scale({flip},1)"><path d="M-22,6 L-22,-12 Q-18,-24 -6,-24 L10,-24 L14,-34 L22,-30 Q34,-24 34,-18 L22,-14 L18,6 L12,6 L12,-6 L-12,-6 L-14,6 Z" fill="{c}" stroke="{GOLD3}" stroke-width="1"/>'
              f'<path d="M16,-34 L18,-46 L24,-34 Z" fill="{c}" stroke="{GOLD3}" stroke-width=".8"/><circle cx="20" cy="-22" r="1.6" fill="{INK}"/><path d="M-22,-8 q-10,-4 -12,-14" stroke="{c}" stroke-width="3" fill="none"/></g>')
    # заводь, рак — и две рыбы на красной нитке
    s += f'<ellipse cx="150" cy="396" rx="120" ry="34" fill="url(#seaG)" stroke="{GOLD}" stroke-width="1"/>'
    s += (f'<path d="M150,366 q-12,6 -12,18 q12,4 24,0 q0,-12 -12,-18 Z" fill="{ROSE}" stroke="{GOLD}" stroke-width=".8"/>'
          f'<path d="M140,368 l-8,-10 M160,368 l8,-10" stroke="{ROSE}" stroke-width="2"/><circle cx="131" cy="357" r="3" fill="{ROSE}"/><circle cx="169" cy="357" r="3" fill="{ROSE}"/>')
    for x, flip in ((92, 1), (208, -1)):
        s += (f'<g transform="translate({x},404) scale({flip},1)"><path d="M-14,0 Q0,-10 14,0 Q0,10 -14,0 Z" fill="{TEAL}" stroke="{GOLD2}" stroke-width=".8"/>'
              f'<path d="M-14,0 l-8,-6 l0,12 Z" fill="{TEAL}" stroke="{GOLD2}" stroke-width=".8"/><circle cx="8" cy="-1" r="1.4" fill="{WHITE}"/></g>')
    s += red_thread(104, 404, 196, 404, 3, 10)
    return s


def c19():  # Солнце
    s = f'<circle cx="150" cy="140" r="90" fill="#fff3c4" opacity=".35"/>'
    s += f'<circle cx="150" cy="140" r="46" fill="url(#sunG)" stroke="{GOLD}" stroke-width="1.4"/>'
    for k in range(24):
        a = math.radians(k * 15)
        if k % 2:
            s += f'<path d="M{f(150+50*math.cos(a))},{f(140+50*math.sin(a))} L{f(150+80*math.cos(a))},{f(140+80*math.sin(a))}" stroke="{SUN}" stroke-width="2.4"/>'
        else:
            p = [(150 + 50 * math.cos(a - .1), 140 + 50 * math.sin(a - .1)), (150 + 92 * math.cos(a), 140 + 92 * math.sin(a)), (150 + 50 * math.cos(a + .1), 140 + 50 * math.sin(a + .1))]
            s += f'<polygon points="{pts(p)}" fill="{SUN}" stroke="{GOLD}" stroke-width=".8"/>'
    s += (f'<path d="M132,134 q6,-4 10,0 M158,134 q6,-4 10,0" stroke="{SUN2}" stroke-width="1.6" fill="none"/>'
          f'<path d="M136,154 q14,10 28,0" stroke="{SUN2}" stroke-width="1.6" fill="none"/>')
    # стена и подсолнухи
    s += f'<rect x="24" y="300" width="252" height="54" fill="{GREY}" stroke="{GOLD3}" stroke-width="1"/>'
    for y in (318, 336):
        for x in range(24 + (y == 336) * 14, 276, 28):
            s += f'<rect x="{x}" y="{y-18}" width="28" height="18" fill="none" stroke="{GREY2}" stroke-width="1"/>'
    for x in (44, 84, 216, 256):
        s += f'<path d="M{x},300 L{x},268" stroke="{GREEN2}" stroke-width="3"/>'
        s += starN(x, 262, 13, 7, 12, SUN, GOLD, sw=.6) + f'<circle cx="{x}" cy="262" r="6" fill="{HAIR}"/>'
    s += f'<rect x="24" y="354" width="252" height="80" fill="{GREEN}"/>'
    # ребёнок на белом коне (конь — простой, мягкий)
    s += (f'<path d="M98,380 Q100,352 130,350 L184,350 Q202,346 210,330 L214,316 Q222,312 228,322 L232,338 Q226,342 220,340 L212,366 L210,402 L200,402 L198,376 L132,378 L126,404 L116,404 L114,384 Q100,388 98,380 Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width="1.2"/>'
          f'<path d="M212,318 Q200,326 198,344" stroke="{SUN2}" stroke-width="4" fill="none"/><circle cx="222" cy="322" r="1.6" fill="{INK}"/>'
          f'<path d="M100,370 q-12,8 -10,24" stroke="{SUN2}" stroke-width="3" fill="none"/>')
    s += limb([(150, 344), (156, 372)], 6, SKIN) + robe(150, 300, 346, 22, 26, SKIN, sw=.9)
    s += head(150, 290, 10, GOLD, "short") + "".join(rose(138 + k * 8, 280 - (k in (1, 2)) * 2, 2.6, ROSE) for k in range(4))
    s += limb([(158, 306), (176, 290), (184, 268)], 5, SKIN) + hand(184, 266)
    s += f'<path d="M186,268 L186,216" stroke="{COPPER2}" stroke-width="2"/><path d="M186,218 Q214,210 236,228 Q212,236 230,256 Q206,246 186,252 Z" fill="{ROSE}" stroke="{GOLD}" stroke-width="1"/>'
    s += limb([(142, 306), (124, 292), (118, 276)], 5, SKIN) + hand(118, 274)
    return s


def c20():  # Суд
    s = sky_stars(20, 30, y1=200)
    s += f'<ellipse cx="150" cy="170" rx="120" ry="46" fill="{CREAM}" opacity=".18"/><ellipse cx="150" cy="186" rx="90" ry="30" fill="{CREAM}" opacity=".2"/>'
    # ангел с трубой
    s += f'<path d="M150,120 Q96,74 54,98 Q86,124 128,140 Z M150,120 Q204,74 246,98 Q214,124 172,140 Z" fill="{ROSE}" stroke="{GOLD}" stroke-width="1.2"/>'
    s += robe(150, 128, 186, 34, 50, "#2f5d96", trim=GOLD) + head(150, 116, 11, GOLD, "long")
    s += f'<circle cx="150" cy="114" r="20" fill="url(#glow)"/>'
    s += limb([(140, 140), (128, 162), (118, 174)], 6, "#2f5d96")
    s += f'<path d="M150,144 L94,206 L86,220 Q98,222 104,212 L156,150 Z" fill="{GOLD}" stroke="{GOLD2}" stroke-width=".8"/>'
    s += f'<path d="M110,184 L130,206 L138,190 Z" fill="{WHITE}" stroke="{GOLD3}" stroke-width=".7"/><path d="M118,192 L130,198 M124,186 L124,204" stroke="{ROSE}" stroke-width="2"/>'
    for k in range(5):
        s += f'<path d="M{80-k*6},{226+k*6} q-8,4 -14,0" stroke="{GOLD2}" stroke-width="1" fill="none" opacity=".8"/>'
    s += mountains(330, 201, "#4b5aa0", True, .8, 70)
    s += sea(340, seed=20)
    # те, кто проснулся: поднимаются из лодок-гробов
    for x, c, hc, st in ((76, SKIN, HAIR, "long"), (150, SKIN2, HAIR2, "short"), (224, SKIN, GOLD, "long")):
        s += f'<path d="M{x-30},380 L{x+30},380 L{x+24},400 L{x-24},400 Z" fill="{GREY2}" stroke="{GOLD}" stroke-width="1"/>'
        s += robe(x, 336, 382, 22, 28, c, sw=.9) + head(x, 324, 9, hc, st)
        s += limb([(x - 8, 342), (x - 18, 322), (x - 20, 304)], 5, c) + limb([(x + 8, 342), (x + 18, 322), (x + 20, 304)], 5, c)
        s += hand(x - 20, 302, 2.6) + hand(x + 20, 302, 2.6)
    return s


def c21():  # Мир — круг не кончается
    s = sky_stars(21, 70, y1=420, avoid=[(150, 250, 96)])
    for (x, y), g in zip(((52, 102), (248, 102), (52, 400), (248, 400)), "♒♏♉♌"):
        s += f'<ellipse cx="{x}" cy="{y+4}" rx="28" ry="16" fill="{CREAM}" opacity=".2"/><circle cx="{x}" cy="{y}" r="15" fill="{NAVY}" stroke="{GOLD}" stroke-width="1.2"/>' + zodiac_glyph(x, y + 1, g, 17, GOLD2)
    # венок
    s += f'<ellipse cx="150" cy="252" rx="78" ry="128" fill="none" stroke="{GREEN}" stroke-width="12"/>'
    for k in range(40):
        a = math.radians(k * 9)
        x, y = 150 + 78 * math.cos(a), 252 + 128 * math.sin(a)
        s += f'<ellipse cx="{f(x)}" cy="{f(y)}" rx="7" ry="3.4" fill="{GREEN2 if k%2 else GREEN}" stroke="{GOLD3}" stroke-width=".4" transform="rotate({f(math.degrees(a)+90+ (25 if k%2 else -25))} {f(x)} {f(y)})"/>'
    s += red_thread(140, 126, 160, 126, 1, 4) + red_thread(140, 378, 160, 378, 1, -4)
    s += f'<path d="M140,126 l-6,10 M160,126 l6,10 M140,378 l-6,-10 M160,378 l6,-10" stroke="{ROSE}" stroke-width="2.4"/>'
    # танцовщица
    s += limb([(146, 312), (138, 360)], 7, SKIN) + limb([(150, 312), (174, 330), (150, 346)], 7, SKIN)
    s += f'<path d="M136,210 Q150,200 164,210 L162,316 Q150,322 138,316 Z" fill="{SKIN}" stroke="{GOLD3}" stroke-width="1"/>'
    s += f'<path d="M128,206 Q170,230 162,300 Q150,330 128,318 Q160,280 140,240 Q118,226 128,206 Z" fill="{LAV}" stroke="{GOLD}" stroke-width="1" opacity=".95"/>'
    s += limb([(140, 214), (118, 230), (106, 252)], 5, SKIN) + hand(106, 254)
    s += limb([(160, 214), (182, 236), (194, 262)], 5, SKIN) + hand(194, 264)
    for x, y in ((104, 238), (196, 248)):
        s += f'<path d="M{x},{y} L{x},{y+28}" stroke="{GOLD}" stroke-width="2.4"/><circle cx="{x}" cy="{y}" r="2.4" fill="{GOLD2}"/><circle cx="{x}" cy="{y+28}" r="2.4" fill="{GOLD2}"/>'
    s += head(150, 194, 11, HAIR, "long")
    return s


CARDS = [("Шут", c00), ("Маг", c01), ("Верховная Жрица", c02), ("Императрица", c03), ("Император", c04),
         ("Иерофант", c05), ("Влюблённые", c06), ("Колесница", c07), ("Сила", c08), ("Отшельник", c09),
         ("Колесо Фортуны", c10), ("Справедливость", c11), ("Повешенный", c12), ("Смерть", c13),
         ("Умеренность", c14), ("Дьявол", c15), ("Башня", c16), ("Звезда", c17), ("Луна", c18),
         ("Солнце", c19), ("Суд", c20), ("Мир", c21)]
DAY = {3: True, 6: True, 14: True, 19: "sun"}


def back():
    """Рубашка колоды: медный купол Планетария под двенадцатью знаками."""
    s = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 300 500" width="300" height="500" role="img" aria-label="Рубашка карты">'
         '<defs><linearGradient id="goldG" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#f7e2a8"/><stop offset=".5" stop-color="#d9b062"/><stop offset="1" stop-color="#a8823e"/></linearGradient>'
         '<radialGradient id="bk" cx=".5" cy=".45" r=".7"><stop offset="0" stop-color="#2b3d7e"/><stop offset="1" stop-color="#0a0f26"/></radialGradient>'
         '<pattern id="pt" width="20" height="20" patternUnits="userSpaceOnUse"><path d="M10,2 L12,10 L10,18 L8,10 Z M2,10 L10,8 L18,10 L10,12 Z" fill="#e6c27a" opacity=".12"/></pattern></defs>'
         f'<rect width="300" height="500" rx="16" fill="url(#bk)"/><rect width="300" height="500" rx="16" fill="url(#pt)"/>'
         f'<rect x="7" y="7" width="286" height="486" rx="12" fill="none" stroke="url(#goldG)" stroke-width="2.4"/>'
         f'<rect x="13" y="13" width="274" height="474" rx="8" fill="none" stroke="{GOLD3}" stroke-width=".8"/>')
    cx, cy = 150, 250
    s += f'<circle cx="{cx}" cy="{cy}" r="104" fill="none" stroke="url(#goldG)" stroke-width="2"/><circle cx="{cx}" cy="{cy}" r="84" fill="none" stroke="{GOLD3}" stroke-width="1"/>'
    for k, g in enumerate("♈♉♊♋♌♍♎♏♐♑♒♓"):
        a = math.radians(-90 + k * 30)
        s += zodiac_glyph(cx + 94 * math.cos(a), cy + 94 * math.sin(a) + 1, g, 14, GOLD2)
        b = math.radians(-75 + k * 30)
        s += f'<path d="M{f(cx+84*math.cos(b))},{f(cy+84*math.sin(b))} L{f(cx+104*math.cos(b))},{f(cy+104*math.sin(b))}" stroke="{GOLD3}" stroke-width=".8"/>'
    s += (f'<path d="M100,290 A50,48 0 0 1 200,290 Z" fill="{COPPER}" stroke="{GOLD2}" stroke-width="1.4"/>'
          f'<path d="M118,290 A32,34 0 0 1 182,290 M136,290 A14,26 0 0 1 164,290" fill="none" stroke="{GOLD2}" stroke-width=".8" opacity=".7"/>'
          f'<rect x="92" y="290" width="116" height="26" fill="#14204a" stroke="{GOLD}" stroke-width="1.2"/>'
          f'<path d="M150,242 L150,226" stroke="{GOLD}" stroke-width="1.6"/>')
    for x in range(104, 200, 16):
        s += f'<rect x="{x}" y="297" width="8" height="13" rx="4" fill="#ffcf6a" opacity=".85"/>'
    s += starN(150, 206, 16, 6, 8, GOLD2, GOLD, sw=.6)
    s += crescent(150, 70, 14, GOLD2, .35, 0) + crescent(150, 430, 14, GOLD2, .35, 180)
    s += "".join(star4(x, y, 6, GOLD) for x, y in ((24, 24), (276, 24), (24, 476), (276, 476)))
    s += f'<text x="150" y="370" text-anchor="middle" font-family="{SERIF}" font-size="13" letter-spacing="4" fill="url(#goldG)">СИНЕЯ</text>'
    return s + "</svg>"


def main():
    os.makedirs(OUT, exist_ok=True)
    png = None
    if "--png" in sys.argv:
        png = sys.argv[sys.argv.index("--png") + 1]
        os.makedirs(png, exist_ok=True)
    files = []
    for i, (name, fn) in enumerate(CARDS):
        svg = card(i, name, fn(), DAY.get(i, False), i)
        p = os.path.join(OUT, f"{i:02d}.svg")
        open(p, "w").write(svg)
        files.append(p)
    p = os.path.join(OUT, "back.svg")
    open(p, "w").write(back())
    files.append(p)
    if png:
        for p in files:
            subprocess.run(["rsvg-convert", "-w", "300", "-o", os.path.join(png, os.path.basename(p)[:-4] + ".png"), p], check=True)
    print(f"{len(files)} файлов → {OUT}")


if __name__ == "__main__":
    main()
