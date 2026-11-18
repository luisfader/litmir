#!/usr/bin/env python3
"""Dibuja diagramas de ajedrez (PNG) para las novelas.

Uso: python3 tools/diagramas_ajedrez.py <archivo.json> <carpeta-de-salida>

El JSON es una lista de diagramas:
  {"file": "01.png", "fen": "startpos" | "<FEN>", "moves": ["e2e4", ...],
   "flip": false, "hl": ["e4"], "red": ["d8"], "arrows": [["b5","e8"]],
   "red_arrows": [["g4","g7"]], "caption": "Texto bajo el tablero",
   "labels": {"e1": "Мэрия"}}

Las jugadas se aplican sin comprobar la legalidad (desde→hasta; el enroque
se escribe como dos jugadas: e1c1 y a1d1). Hay que comprobarlas a mano.
"""
import json, math, sys
from PIL import Image, ImageDraw, ImageFont

GLYPH = {"k": "♚", "q": "♛", "r": "♜", "b": "♝", "n": "♞", "p": "♟"}
FONT = "/usr/share/fonts/truetype/dejavu/DejaVuSans.ttf"
FONT_B = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
LIGHT, DARK = (240, 222, 190), (176, 136, 99)
HL, RED = (246, 214, 90), (230, 110, 95)
BG, INK = (34, 30, 28), (238, 228, 210)
START = "rnbqkbnr/pppppppp/8/8/8/8/PPPPPPPP/RNBQKBNR"


def parse(fen):
    if fen == "startpos":
        fen = START
    rows = fen.split()[0].split("/")
    b = {}
    for r, row in enumerate(rows):
        f = 0
        for ch in row:
            if ch.isdigit():
                f += int(ch)
            else:
                b["abcdefgh"[f] + str(8 - r)] = ch
                f += 1
    return b


def sq_xy(sq, S, M, flip):
    f = "abcdefgh".index(sq[0]); r = int(sq[1]) - 1
    if flip:
        f, r = 7 - f, 7 - r
    return M + f * S, M + (7 - r) * S


def arrow(d, a, b, S, M, flip, col):
    x1, y1 = sq_xy(a, S, M, flip); x2, y2 = sq_xy(b, S, M, flip)
    x1 += S / 2; y1 += S / 2; x2 += S / 2; y2 += S / 2
    ang = math.atan2(y2 - y1, x2 - x1)
    L = S * 0.42
    x1, y1 = x1 + math.cos(ang) * S * 0.3, y1 + math.sin(ang) * S * 0.3
    ex, ey = x2 - math.cos(ang) * L * 0.8, y2 - math.sin(ang) * L * 0.8
    w = int(S * 0.16)
    d.line([(x1, y1), (ex, ey)], fill=col, width=w)
    p = [(x2 - math.cos(ang) * S * 0.12, y2 - math.sin(ang) * S * 0.12)]
    for s in (1, -1):
        p.append((ex + math.cos(ang + s * math.pi / 2) * S * 0.2, ey + math.sin(ang + s * math.pi / 2) * S * 0.2))
    d.polygon(p, fill=col)


def draw(spec, out):
    S, M = 100, 46
    W = S * 8 + 2 * M
    cap = spec.get("caption", "")
    capfont = ImageFont.truetype(FONT, 30)
    lines = []
    for para in cap.split("\n"):
        cur = ""
        for w in para.split():
            t = (cur + " " + w).strip()
            if capfont.getlength(t) > W - 2 * M and cur:
                lines.append(cur); cur = w
            else:
                cur = t
        if cur:
            lines.append(cur)
    H = W + (len(lines) * 40 + 30 if lines else 0)
    img = Image.new("RGB", (W, H), BG)
    board = parse(spec.get("fen", "startpos"))
    last = None
    for mv in spec.get("moves", []):
        a, b = mv[:2], mv[2:4]
        pc = board.pop(a)
        if len(mv) == 5:
            pc = mv[4].upper() if pc.isupper() else mv[4]
        board[b] = pc
        last = (a, b)
    flip = spec.get("flip", False)
    d = ImageDraw.Draw(img, "RGBA")
    for f in range(8):
        for r in range(8):
            sq = "abcdefgh"[f] + str(r + 1)
            x, y = sq_xy(sq, S, M, flip)
            col = LIGHT if (f + r) % 2 else DARK
            d.rectangle([x, y, x + S, y + S], fill=col)
            if spec.get("last", True) and last and sq in last:
                d.rectangle([x, y, x + S, y + S], fill=(205, 210, 106, 140))
            if sq in spec.get("hl", []):
                d.rectangle([x, y, x + S, y + S], fill=HL + (190,))
            if sq in spec.get("red", []):
                d.rectangle([x, y, x + S, y + S], fill=RED + (200,))
    cf = ImageFont.truetype(FONT_B, 22)
    for i in range(8):
        fl = "abcdefgh"[7 - i if flip else i]
        rk = str(i + 1 if flip else 8 - i)
        d.text((M + i * S + S / 2, W - M / 2), fl, font=cf, fill=INK, anchor="mm")
        d.text((M / 2, M + i * S + S / 2), rk, font=cf, fill=INK, anchor="mm")
    pf = ImageFont.truetype(FONT, 84)
    for sq, pc in board.items():
        x, y = sq_xy(sq, S, M, flip)
        g = GLYPH[pc.lower()]
        cx, cy = x + S / 2, y + S / 2 + 4
        if pc.isupper():
            d.text((cx, cy), g, font=pf, anchor="mm", fill=(255, 252, 244), stroke_width=4, stroke_fill=(20, 20, 20))
        else:
            d.text((cx, cy), g, font=pf, anchor="mm", fill=(22, 20, 20), stroke_width=2, stroke_fill=(250, 244, 230))
    for a, b in spec.get("arrows", []):
        arrow(d, a, b, S, M, flip, (40, 140, 70, 200))
    for a, b in spec.get("red_arrows", []):
        arrow(d, a, b, S, M, flip, (200, 40, 40, 205))
    lf = ImageFont.truetype(FONT_B, 17)
    for sq, txt in spec.get("labels", {}).items():
        x, y = sq_xy(sq, S, M, flip)
        tw = lf.getlength(txt)
        bx = x + S / 2 - tw / 2 - 5
        d.rounded_rectangle([bx, y + S - 27, bx + tw + 10, y + S - 3], 5, fill=(20, 20, 30, 215))
        d.text((x + S / 2, y + S - 15), txt, font=lf, fill=(255, 240, 200), anchor="mm")
    for i, ln in enumerate(lines):
        d.text((W / 2, W + 20 + i * 40), ln, font=capfont, fill=INK, anchor="ma")
    img.save(out, optimize=True)


if __name__ == "__main__":
    specs = json.load(open(sys.argv[1], encoding="utf-8"))
    for s in specs:
        draw(s, sys.argv[2].rstrip("/") + "/" + s["file"])
        print(s["file"])
