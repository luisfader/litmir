"""Двенадцать эмблем знаков зодиака — золотая гравюра на ночном синем, в духе колоды Алисии.

emblem(id) → SVG-фрагмент в квадрате 200×200 (центр 100,100, рисунок в круге r≈72).
medallion(id) → готовая круглая медаль (фрагмент, без <svg>).
"""
import math

GOLD, GOLD2, GOLD3 = "#e6c27a", "#f7e2a8", "#b8914a"
INK, NAVY, NAVY2 = "#0a0f26", "#14204a", "#1d2c62"
CREAM, WHITE, SKIN, SKIN2 = "#efe3c6", "#f6f1e4", "#efd0ae", "#d9b08c"
ROSE, ROSE2, LAV = "#c4504a", "#8f2f35", "#a995d8"
SEA, TEAL = "#1c4a6b", "#3d8aa3"
COPPER, COPPER2, GREEN, GREEN2 = "#c98448", "#8f5a2c", "#4f8a68", "#2f5e47"
HAIR, HAIR2, SUN, SUN2 = "#6b4a32", "#3a2a20", "#ffcf6a", "#f39a3c"
SERIF = "Georgia, 'Times New Roman', 'DejaVu Serif', serif"
GLYPH = "'DejaVu Sans', 'Segoe UI Symbol', 'Noto Sans Symbols', sans-serif"

SIGNS = ["ari", "tau", "gem", "cnc", "leo", "vir", "lib", "sco", "sgr", "cap", "aqr", "psc"]
GL = dict(zip(SIGNS, "♈♉♊♋♌♍♎♏♐♑♒♓"))


def f(v):
    return ("%.1f" % v).rstrip("0").rstrip(".")


def P(d, fill="none", stroke=GOLD, sw=1.6, extra=""):
    return f'<path d="{d}" fill="{fill}" stroke="{stroke}" stroke-width="{sw}" stroke-linejoin="round" stroke-linecap="round"{extra}/>'


def star4(x, y, r, fill=GOLD2):
    k = r * .28
    return (f'<path d="M{f(x)},{f(y-r)} L{f(x+k)},{f(y-k)} L{f(x+r)},{f(y)} L{f(x+k)},{f(y+k)} '
            f'L{f(x)},{f(y+r)} L{f(x-k)},{f(y+k)} L{f(x-r)},{f(y)} L{f(x-k)},{f(y-k)} Z" fill="{fill}"/>')


def spiral(cx, cy, r0, turns, sign=1, a0=0):
    pts = []
    n = int(36 * turns)
    for i in range(n + 1):
        t = i / n
        a = a0 + sign * t * turns * 2 * math.pi
        r = r0 * (1 - .78 * t)
        pts.append((cx + r * math.cos(a), cy + r * math.sin(a)))
    return "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)


def head(x, y, r, hair=HAIR, long=True):
    s = ""
    if long:
        s += P(f"M{f(x-r-2)},{f(y-2)} Q{f(x-r-5)},{f(y+r*2)} {f(x-r+2)},{f(y+r*2.4)} L{f(x+r-2)},{f(y+r*2.4)} Q{f(x+r+5)},{f(y+r*2)} {f(x+r+2)},{f(y-2)} Z", hair, GOLD3, .7)
        s += P(f"M{f(x-r*.3)},{f(y+r*.5)} L{f(x-r*.36)},{f(y+r*1.6)} Q{f(x)},{f(y+r*1.85)} {f(x+r*.36)},{f(y+r*1.6)} L{f(x+r*.3)},{f(y+r*.5)} Z", SKIN2, "none", 0)
    s += f'<circle cx="{f(x)}" cy="{f(y)}" r="{f(r)}" fill="{SKIN}" stroke="{GOLD3}" stroke-width=".8"/>'
    s += P(f"M{f(x-r-.5)},{f(y+1)} Q{f(x-r)},{f(y-r-2)} {f(x)},{f(y-r-1.5)} Q{f(x+r)},{f(y-r-2)} {f(x+r+.5)},{f(y+1)} Q{f(x+r*.5)},{f(y-r*.45)} {f(x)},{f(y-r*.55)} Q{f(x-r*.5)},{f(y-r*.45)} {f(x-r-.5)},{f(y+1)} Z", hair, "none", 0)
    e = r * .36
    s += P(f"M{f(x-e-1.6)},{f(y+1)} q1.6,1.3 3.2,0 M{f(x+e-1.6)},{f(y+1)} q1.6,1.3 3.2,0", "none", HAIR2, .8)
    s += P(f"M{f(x-1.8)},{f(y+r*.5)} q1.8,1.2 3.6,0", "none", ROSE2, .8)
    return s


def robe(cx, top, bot, wt, wb, fill):
    mid = (top + bot) / 2
    return P(f"M{f(cx-4)},{f(top)} L{f(cx-wt/2)},{f(top+6)} Q{f(cx-wt/2-3)},{f(mid)} {f(cx-wb/2)},{f(bot)} "
             f"Q{f(cx)},{f(bot+5)} {f(cx+wb/2)},{f(bot)} Q{f(cx+wt/2+3)},{f(mid)} {f(cx+wt/2)},{f(top+6)} L{f(cx+4)},{f(top)} Z", fill, GOLD, 1.2)


def limb(pts, w, fill):
    d = "M" + " L".join(f"{f(x)},{f(y)}" for x, y in pts)
    return P(d, "none", GOLD, w + 2.2) + P(d, "none", fill, w)


# ───────────── эмблемы ─────────────
def e_ari():  # голова барана анфас, рога-спирали
    s = P(spiral(62, 74, 30, 1.25, -1, math.radians(-20)), "none", GOLD, 7) + P(spiral(62, 74, 30, 1.25, -1, math.radians(-20)), "none", CREAM, 4.4)
    s += P(spiral(138, 74, 30, 1.25, 1, math.radians(200)), "none", GOLD, 7) + P(spiral(138, 74, 30, 1.25, 1, math.radians(200)), "none", CREAM, 4.4)
    s += P("M84,60 Q100,50 116,60 Q124,92 114,130 Q108,150 100,152 Q92,150 86,130 Q76,92 84,60 Z", WHITE, GOLD, 1.6)
    s += P("M84,66 Q70,70 62,82 Q74,86 86,80 Z M116,66 Q130,70 138,82 Q126,86 114,80 Z", WHITE, GOLD, 1.2)
    for y in (64, 72, 80):
        s += P(f"M88,{y} q6,-5 12,0 q6,-5 12,0", "none", GOLD3, 1)
    s += P("M89,96 q4,-3 8,0 M103,96 q4,-3 8,0", "none", INK, 1.6)
    s += P("M94,140 Q100,146 106,140 M100,132 L100,140", "none", ROSE2, 1.4)
    s += f'<ellipse cx="100" cy="134" rx="7" ry="4" fill="{SKIN2}" opacity=".7"/>'
    return s


def e_tau():  # голова быка
    s = P("M70,72 Q46,64 40,36 Q56,52 76,60 Z", CREAM, GOLD, 1.4) + P("M130,72 Q154,64 160,36 Q144,52 124,60 Z", CREAM, GOLD, 1.4)
    s += P("M70,70 Q54,72 46,84 Q60,92 76,84 Z M130,70 Q146,72 154,84 Q140,92 124,84 Z", COPPER, GOLD, 1.2)
    s += P("M74,62 Q100,50 126,62 Q132,96 122,126 Q114,150 100,152 Q86,150 78,126 Q68,96 74,62 Z", COPPER, GOLD, 1.6)
    s += P("M86,64 Q100,58 114,64 Q108,74 100,74 Q92,74 86,64 Z", COPPER2, "none", 0)
    s += P("M84,94 q5,-4 10,0 M106,94 q5,-4 10,0", "none", INK, 1.8)
    s += f'<ellipse cx="100" cy="134" rx="17" ry="12" fill="{SKIN2}" stroke="{GOLD}" stroke-width="1.2"/>'
    s += f'<circle cx="93" cy="134" r="2.6" fill="{INK}"/><circle cx="107" cy="134" r="2.6" fill="{INK}"/>'
    s += P("M90,146 Q100,158 110,146", "none", GOLD2, 2.4)
    s += f'<circle cx="100" cy="156" r="5" fill="none" stroke="{GOLD2}" stroke-width="2"/>'
    return s


def e_gem():  # двое, держатся за руки, над ними звёзды Кастор и Поллукс
    s = star4(76, 34, 8) + star4(124, 34, 8)
    s += limb([(72, 140), (70, 168)], 6, SKIN) + limb([(80, 140), (82, 168)], 6, SKIN)
    s += limb([(120, 140), (118, 168)], 6, SKIN) + limb([(128, 140), (130, 168)], 6, SKIN)
    s += robe(76, 74, 144, 26, 38, ROSE) + robe(124, 74, 144, 26, 38, "#2f5d96")
    s += limb([(86, 84), (100, 104)], 5, SKIN) + limb([(114, 84), (100, 104)], 5, SKIN)
    s += f'<circle cx="100" cy="105" r="4" fill="{SKIN}" stroke="{GOLD3}" stroke-width=".8"/>'
    s += limb([(66, 84), (56, 108)], 5, SKIN) + limb([(134, 84), (144, 108)], 5, SKIN)
    s += f'<path d="M56,110 L50,70" stroke="{GOLD}" stroke-width="2.2"/>' + f'<path d="M144,110 L150,70" stroke="{GOLD}" stroke-width="2.2"/>'
    s += f'<path d="M44,70 Q50,58 56,70 Z M144,70 Q150,58 156,70 Z" fill="{GOLD}"/>'
    s += head(76, 60, 11, HAIR, False) + head(124, 60, 11, HAIR, False)
    return s


def e_cnc():  # краб сверху
    s = ""
    for side in (-1, 1):
        for k in range(4):
            y0 = 104 + k * 9
            s += P(f"M{100+side*30},{y0} Q{100+side*50},{y0-6+k*3} {100+side*62},{y0+10+k*5}", "none", GOLD, 5) + P(f"M{100+side*30},{y0} Q{100+side*50},{y0-6+k*3} {100+side*62},{y0+10+k*5}", "none", ROSE, 3)
        # клешни
        s += P(f"M{100+side*26},{92} Q{100+side*44},{70} {100+side*46},{54}", "none", GOLD, 7) + P(f"M{100+side*26},{92} Q{100+side*44},{70} {100+side*46},{54}", "none", ROSE, 4.6)
        s += P(f"M{100+side*46},{58} Q{100+side*62},{40} {100+side*50},{28} Q{100+side*44},{38} {100+side*46},{46} Q{100+side*36},{36} {100+side*34},{28} Q{100+side*28},{44} {100+side*46},{58} Z", ROSE, GOLD, 1.4)
    s += f'<ellipse cx="100" cy="110" rx="36" ry="28" fill="{ROSE}" stroke="{GOLD}" stroke-width="1.6"/>'
    s += P("M70,104 Q100,90 130,104 M74,118 Q100,128 126,118", "none", ROSE2, 1.4)
    s += f'<circle cx="90" cy="88" r="4" fill="{INK}" stroke="{GOLD2}" stroke-width="1"/><circle cx="110" cy="88" r="4" fill="{INK}" stroke="{GOLD2}" stroke-width="1"/>'
    s += P("M90,92 L92,98 M110,92 L108,98", "none", GOLD, 1.6)
    # «Ясли» — скопление в сердце
    for x, y in ((96, 110), (104, 108), (100, 115), (106, 116), (94, 117)):
        s += f'<circle cx="{x}" cy="{y}" r="1.7" fill="{GOLD2}"/>'
    return s


def e_leo():  # голова льва анфас
    s = ""
    for k in range(22):
        a = math.radians(k * 360 / 22)
        x1, y1 = 100 + 44 * math.cos(a), 100 + 44 * math.sin(a)
        x2, y2 = 100 + 70 * math.cos(a + .12), 100 + 70 * math.sin(a + .12)
        s += P(f"M{f(x1)},{f(y1)} Q{f(100+64*math.cos(a-.12))},{f(100+64*math.sin(a-.12))} {f(x2)},{f(y2)} Q{f(100+56*math.cos(a+.22))},{f(100+56*math.sin(a+.22))} {f(100+40*math.cos(a+.2))},{f(100+40*math.sin(a+.2))}", COPPER, GOLD, 1.1)
    s += f'<circle cx="100" cy="102" r="44" fill="{SUN2}" stroke="{GOLD}" stroke-width="1.6"/>'
    s += P("M70,72 Q62,60 72,56 Q80,60 78,70 Z M130,72 Q138,60 128,56 Q120,60 122,70 Z", SUN2, GOLD, 1.2)
    s += P("M80,92 q6,-5 12,0 M108,92 q6,-5 12,0", "none", INK, 2)
    s += P("M88,104 L112,104 L104,116 Q100,120 96,116 Z", HAIR2, GOLD3, 1)
    s += P("M100,118 L100,126 M100,126 Q92,134 84,128 M100,126 Q108,134 116,128", "none", HAIR2, 1.6)
    s += f'<ellipse cx="100" cy="132" rx="18" ry="9" fill="{CREAM}" opacity=".55"/>'
    for x, y in ((86, 124), (90, 128), (114, 124), (110, 128)):
        s += f'<circle cx="{x}" cy="{y}" r="1" fill="{HAIR2}"/>'
    s += P("M66,118 L40,114 M66,124 L42,128 M134,118 L160,114 M134,124 L158,128", "none", CREAM, 1)
    s += star4(100, 80, 6, WHITE)  # Регул — «сердце»-звезда на лбу
    return s


def e_vir():  # дева с колосом
    s = robe(100, 82, 170, 34, 64, "#2f5d96")
    s += P("M84,100 Q100,112 116,100", "none", GOLD, 1.6)
    s += limb([(112, 92), (130, 104), (140, 84)], 6, "#2f5d96") + f'<circle cx="140" cy="82" r="4" fill="{SKIN}" stroke="{GOLD3}" stroke-width=".8"/>'
    # колос
    s += P("M141,82 L150,32", "none", GOLD, 2)
    for k in range(7):
        y = 40 + k * 6
        x = 149 - k * 1.1
        s += f'<ellipse cx="{f(x-4)}" cy="{f(y)}" rx="3" ry="5.6" transform="rotate(-24 {f(x-4)} {f(y)})" fill="{GOLD2}" stroke="{GOLD3}" stroke-width=".5"/>'
        s += f'<ellipse cx="{f(x+4)}" cy="{f(y)}" rx="3" ry="5.6" transform="rotate(30 {f(x+4)} {f(y)})" fill="{GOLD2}" stroke="{GOLD3}" stroke-width=".5"/>'
    s += star4(144, 64, 7, WHITE)  # Спика
    s += limb([(88, 92), (74, 120), (84, 138)], 6, "#2f5d96") + f'<circle cx="85" cy="139" r="4" fill="{SKIN}" stroke="{GOLD3}" stroke-width=".8"/>'
    s += head(100, 64, 14, HAIR, True)
    s += "".join(f'<circle cx="{f(100+16*math.cos(math.radians(a)))}" cy="{f(58+7*math.sin(math.radians(a)))}" r="2.4" fill="{GOLD2}"/>' for a in range(190, 360, 34))
    return s


def e_lib():  # весы
    s = P("M100,40 L100,160", "none", GOLD, 4)
    s += P("M76,166 L124,166 L114,156 L86,156 Z", GOLD, GOLD2, 1)
    s += f'<circle cx="100" cy="40" r="7" fill="{GOLD}" stroke="{GOLD2}" stroke-width="1"/>'
    s += P("M44,60 Q100,50 156,60", "none", GOLD, 3.4)
    s += P("M100,56 L94,70 L106,70 Z", GOLD2, GOLD, 1)
    for x in (48, 152):
        s += P(f"M{x},60 L{x-20},112 M{x},60 L{x+20},112 M{x},60 L{x},108", "none", GOLD2, 1)
        s += P(f"M{x-26},112 Q{x},134 {x+26},112 Z", GOLD, GOLD2, 1.2)
        s += f'<circle cx="{x}" cy="60" r="3.4" fill="{GOLD2}"/>'
    s += star4(48, 120, 5, WHITE) + star4(152, 120, 5, WHITE)  # Зубен-эль-Генуби и Зубен-эш-Шемали
    return s


def e_sco():  # скорпион сверху, хвост вверх
    s = ""
    # лапы
    for side in (-1, 1):
        for k in range(4):
            y = 112 + k * 8
            s += P(f"M{100+side*12},{y} L{100+side*30},{y-6+k*2} L{100+side*40},{y+8+k*3}", "none", GOLD, 4) + P(f"M{100+side*12},{y} L{100+side*30},{y-6+k*2} L{100+side*40},{y+8+k*3}", "none", ROSE2, 2.2)
        s += P(f"M{100+side*14},{108} Q{100+side*36},{100} {100+side*42},{82}", "none", GOLD, 6) + P(f"M{100+side*14},{108} Q{100+side*36},{100} {100+side*42},{82}", "none", ROSE2, 4)
        s += P(f"M{100+side*42},{86} Q{100+side*58},{72} {100+side*48},{60} Q{100+side*42},{70} {100+side*44},{76} Q{100+side*36},{68} {100+side*34},{62} Q{100+side*30},{78} {100+side*42},{86} Z", ROSE2, GOLD, 1.2)
    # тело
    s += f'<ellipse cx="100" cy="122" rx="15" ry="22" fill="{ROSE2}" stroke="{GOLD}" stroke-width="1.4"/>'
    s += f'<ellipse cx="100" cy="100" rx="10" ry="8" fill="{ROSE2}" stroke="{GOLD}" stroke-width="1.2"/>'
    s += P("M88,116 L112,116 M87,126 L113,126 M89,136 L111,136", "none", GOLD3, 1)
    # хвост: сегменты вниз и загибом вверх
    pts = [(100, 146), (100, 158), (104, 168), (114, 172), (126, 166), (132, 152), (130, 136), (124, 126)]
    for (x, y) in pts:
        s += f'<circle cx="{x}" cy="{y}" r="6" fill="{ROSE2}" stroke="{GOLD}" stroke-width="1.1"/>'
    s += P("M124,126 Q116,116 122,108 Q126,118 130,120 Z", GOLD2, GOLD, 1)
    s += star4(100, 118, 6, "#ff8a5a")  # Антарес — красное сердце
    return s


def e_sgr():  # лук и стрела, направленная вверх-вправо
    g = P("M92,34 Q150,100 92,166", "none", GOLD, 7) + P("M92,34 Q150,100 92,166", "none", COPPER, 4.4)
    g += P("M86,32 l10,4 M86,168 l10,-4", "none", GOLD, 3)
    g += P("M92,34 L58,100 L92,166", "none", GOLD2, 1.3)  # тетива натянута
    g += P("M58,100 L164,100", "none", WHITE, 2.8)
    g += P("M168,100 L150,92 L154,100 L150,108 Z", GOLD2, GOLD, 1)
    g += P("M58,100 l10,-9 l8,0 l-8,9 Z M58,100 l10,9 l8,0 l-8,-9 Z", ROSE, "none", 0)
    s = f'<g transform="rotate(-40 100 100)">{g}</g>'
    # «чайник» — восемь звёзд астеризма
    for x, y in ((124, 134), (136, 136), (146, 148), (132, 152), (120, 146), (114, 156), (128, 164), (142, 162)):
        s += f'<circle cx="{x}" cy="{y}" r="1.9" fill="{GOLD2}" opacity=".9"/>'
    return s


def e_cap():  # козерог — коза с рыбьим хвостом
    s = ""
    # рыбий хвост — спираль
    s += P("M106,112 Q150,110 156,134 Q160,160 136,162 Q118,162 120,146 Q122,136 134,138", "none", GOLD, 14)
    s += P("M106,112 Q150,110 156,134 Q160,160 136,162 Q118,162 120,146 Q122,136 134,138", "none", TEAL, 11)
    for t in range(5):
        s += P(f"M{118+t*8},{114+t*2} q4,6 0,12", "none", GOLD3, .9)
    s += P("M134,138 Q148,128 150,116 Q140,122 136,130 Q132,120 140,108 Q128,116 130,136 Z", TEAL, GOLD, 1.2)
    # тело козы
    s += P("M60,108 Q60,88 84,86 Q104,86 112,100 Q116,116 104,124 Q84,130 66,124 Q58,118 60,108 Z", CREAM, GOLD, 1.6)
    # передние ноги (поджаты)
    s += limb([(70, 122), (64, 140), (74, 148)], 6, CREAM) + limb([(82, 124), (80, 144), (90, 150)], 6, CREAM)
    s += P("M72,148 l6,2 l-4,4 Z M88,150 l6,2 l-4,4 Z", HAIR2, "none", 0)
    # шея и голова
    s += P("M62,100 Q52,82 54,66 Q58,58 66,60 Q72,64 72,74 Q70,88 76,94 Z", CREAM, GOLD, 1.4)
    s += P("M54,66 Q44,70 40,80 Q46,84 54,80 Z", CREAM, GOLD, 1.2)
    s += f'<circle cx="60" cy="68" r="1.8" fill="{INK}"/>'
    s += P("M42,82 Q40,92 46,96", "none", CREAM, 3)  # бородка
    s += P("M64,60 Q60,38 78,28 Q70,42 72,58", "none", GOLD, 5) + P("M64,60 Q60,38 78,28 Q70,42 72,58", "none", COPPER, 2.8)
    s += P("M66,62 L80,58 L70,66 Z", CREAM, GOLD3, .8)
    s += star4(150, 150, 5, WHITE)  # Денеб Альгеди — хвост козы
    return s


def e_aqr():  # кувшин, из которого льётся вода
    s = P("M64,42 Q50,48 56,60 L66,82 Q50,96 56,120 Q64,140 92,138 Q116,134 120,112 Q122,94 104,82 L98,58 Q104,46 92,40 Z",
          COPPER, GOLD, 1.8, ' transform="rotate(38 88 90)"')
    s += P("M58,72 Q76,64 94,70 M56,110 Q80,118 104,108", "none", GOLD2, 1.4, ' transform="rotate(38 88 90)"')
    s += P("M70,100 Q90,92 112,100", "none", COPPER2, 6, ' transform="rotate(38 88 90)"')
    # вода — две волны, текущие вниз-вправо (знак ♒)
    for k, op in ((0, 1), (1, .85)):
        d = f"M112,{64+k*14} " + " ".join(f"q6,-8 12,0 q6,8 12,0" for _ in range(3))
        s += P(d, "none", WHITE, 3.4, f' opacity="{op}"') + P(d, "none", TEAL, 1.4)
    for x, y in ((122, 106), (136, 112), (150, 106), (128, 124), (144, 128), (160, 120)):
        s += P(f"M{x},{y} q-3,5 0,8 q3,-3 0,-8 Z", TEAL, WHITE, .6)
    s += star4(70, 92, 7, WHITE)  # Садалсууд
    return s


def e_psc():  # две рыбы, связанные шнуром; в узле — Альриша
    def fish(x, y, ang, col):
        return (f'<g transform="translate({x},{y}) rotate({ang})">'
                + P("M-34,0 Q-6,-20 26,0 Q-6,20 -34,0 Z", col, GOLD, 1.6)
                + P("M-34,0 L-48,-13 L-44,0 L-48,13 Z", col, GOLD, 1.4)
                + P("M-2,-12 Q4,0 -2,12", "none", GOLD3, 1)
                + P("M-14,-10 q8,-8 18,-6", "none", GOLD3, 1)
                + f'<circle cx="15" cy="-3" r="2.6" fill="{INK}" stroke="{GOLD2}" stroke-width=".8"/>'
                + P("M24,4 q-4,2 -8,0", "none", ROSE2, 1)
                + "</g>")
    s = P("M27,82 Q46,128 100,100", "none", ROSE, 2.4) + P("M173,118 Q154,72 100,100", "none", ROSE, 2.4)
    s += fish(72, 64, -20, TEAL) + fish(128, 136, 160, "#2f5d96")
    s += f'<circle cx="100" cy="100" r="8" fill="{ROSE}" stroke="{ROSE2}" stroke-width="1.2"/>'
    s += star4(100, 100, 8, GOLD2)  # Альриша — узел
    return s


DRAW = dict(ari=e_ari, tau=e_tau, gem=e_gem, cnc=e_cnc, leo=e_leo, vir=e_vir, lib=e_lib,
            sco=e_sco, sgr=e_sgr, cap=e_cap, aqr=e_aqr, psc=e_psc)


def emblem(sid):
    return DRAW[sid]()


def medallion(sid, uid="m", dim=False, ring=True):
    """Круглая медаль 200×200: синий диск, золотое кольцо, эмблема."""
    g = (f'<defs><radialGradient id="md{uid}" cx=".5" cy=".42" r=".62"><stop offset="0" stop-color="#2b3d7e"/><stop offset="1" stop-color="#0d1534"/></radialGradient>'
         f'<clipPath id="mc{uid}"><circle cx="100" cy="100" r="84"/></clipPath></defs>')
    g += f'<circle cx="100" cy="100" r="94" fill="{INK}"/>'
    g += f'<circle cx="100" cy="100" r="88" fill="url(#md{uid})" stroke="{GOLD}" stroke-width="2.6"/>'
    if ring:
        g += f'<circle cx="100" cy="100" r="94" fill="none" stroke="{GOLD3}" stroke-width="1"/>'
        for k in range(24):
            a = math.radians(k * 15)
            g += f'<circle cx="{f(100+91*math.cos(a))}" cy="{f(100+91*math.sin(a))}" r="1.1" fill="{GOLD}"/>'
    g += f'<g clip-path="url(#mc{uid})"{" opacity=\".35\"" if dim else ""}>{emblem(sid)}</g>'
    return g
