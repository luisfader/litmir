"""Genera partituras (PNG), MIDI y MP3 de piano para las piezas de pieces.py.
Uso: python3 tools/piano/make.py <carpeta-de-salida>
Escribe img/score-*.png, midi/*.mid y music/*.mp3 (los MP3 van al repositorio luisfader/podcasts)."""
import os, sys
sys.path.insert(0, os.path.dirname(__file__))
from pieces import PIECES, build
from perform import events, write_midi
from audio import render
from engrave import Engraver
from PIL import Image

out = sys.argv[1] if len(sys.argv) > 1 else "out"
for sub in ("img", "midi", "music"):
    os.makedirs(os.path.join(out, sub), exist_ok=True)
for p in PIECES:
    bars = build(p); notes, ped = events(p, bars)
    write_midi(f"{out}/midi/{p['slug']}.mid", p, notes, ped)
    render(p, notes, ped, f"{out}/tmp.wav", f"{out}/music/{p['slug']}.mp3")
    png = f"{out}/img/score-{p['slug']}.png"
    Engraver(p, bars).render(f"Глава {p['ch']} · «Северная любовь: Восточный ветер»", png)
    Image.open(png).convert("L").save(png, optimize=True)
    print(p["slug"])
os.remove(f"{out}/tmp.wav")
