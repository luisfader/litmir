"""Build the novels chess set: games/chess.json and the round portraits in games/chess/.

Each army is six characters from one novel world, one per chess piece
(king, queen, rook, bishop, knight, pawn). Portraits are cut from the gallery
(characters/img/) around the face: (file, centre x, centre y, side) — the
centre is a fraction of the width/height, the side a fraction of the width.
Names come from characters/catalog.json in each language; the subtitle of an
army is the novel of that world in the reader's language.

    python3 tools/ajedrez.py .
"""
import json, os, re, sys
from PIL import Image

ROOT = sys.argv[1] if len(sys.argv) > 1 else "."
LANGS = ["es", "ru", "it", "en", "de", "fr", "pt"]
ROLES = ["k", "q", "r", "b", "n", "p"]

CROP = {
    "robert": ("robert-3.jpg", .52, .25, .68), "natalia-cellist": ("natalia-cellist-1.jpg", .40, .17, .30),
    "kennet": ("kennet-1.jpg", .45, .33, .35), "luis-utopia": ("luis-utopia-2.jpg", .55, .17, .65),
    "sasha": ("sasha-2.jpg", .5, .45, .62), "oxana-utopia": ("oxana-utopia-2.jpg", .5, .2, .1),
    "luis": ("luis-1.jpg", .41, .15, .2), "natasha": ("natasha-1.jpg", .5, .1, .25),
    "mariano-ferreira": ("mariano-ferreira-1.jpg", .4, .14, .35), "natalia-anomalnyj": ("natalia-anomalnyj-3.jpg", .45, .27, .26),
    "agente-l": ("agente-l-1.jpg", .4, .15, .4), "julieta-diaz": ("julieta-diaz-1.jpg", .55, .2, .35),
    "luis-fader": ("luis-fader-1.jpg", .45, .22, .5), "natalia-fader": ("natalia-fader-4.jpg", .6, .26, .32),
    "sergio-fader": ("sergio-fader-1.jpg", .2, .25, .38), "fernando-fader": ("fernando-fader-1.jpg", .23, .26, .25),
    "heinrich": ("heinrich-1.jpg", .5, .25, .35), "adolfo-fader": ("adolfo-fader-1.jpg", .45, .22, .55),
    "lorenzo": ("lorenzo-2.jpg", .67, .14, .2), "carlotta": ("carlotta-1.jpg", .3, .22, .2),
    "luca-pittore": ("luca-pittore-1.jpg", .2, .2, .3), "laura-bellini": ("laura-bellini-1.jpg", .38, .11, .38),
    "alessio": ("alessio-3.jpg", .62, .24, .42), "aurora": ("aurora-1.jpg", .65, .75, .2),
    "luciano": ("luciano-1.jpg", .32, .08, .3), "laura": ("laura-3.jpg", .5, .3, .3),
    "pyotr-argenta": ("pyotr-argenta-2.jpg", .62, .1, .5), "maria-argenta": ("maria-argenta-1.jpg", .75, .3, .45),
    "ivan-argenta": ("ivan-argenta-2.jpg", .42, .22, .45), "maskvell": ("maskvell-1.jpg", .52, .23, .4),
    "franco": ("franco-1.jpg", .38, .07, .25), "chiara": ("chiara-1.jpg", .7, .1, .25),
    "oxana-voice": ("oxana-voice-1.jpg", .45, .25, .4), "sasha-voice": ("sasha-voice-2.jpg", .55, .32, .35),
    "romeo": ("romeo-1.jpg", .7, .18, .2), "gaia": ("gaia-1.jpg", .55, .13, .3),
}

# id, title per language, pieces in the order k q r b n p
ARMIES = [
    ("utopia", {"es": "Nuestra Utopía", "ru": "Наша Утопия", "it": "La nostra Utopia", "en": "Our Utopia",
                "de": "Unsere Utopie", "fr": "Notre Utopie", "pt": "A nossa Utopia"},
     ["robert", "natalia-cellist", "kennet", "luis-utopia", "sasha", "oxana-utopia"]),
    ("hora-salvaje", {"es": "La hora salvaje", "ru": "Дикий час", "it": "L’ora selvaggia", "en": "The Wild Hour",
                      "de": "Die wilde Stunde", "fr": "L’heure sauvage", "pt": "A hora selvagem"},
     ["luis", "natasha", "mariano-ferreira", "natalia-anomalnyj", "agente-l", "julieta-diaz"]),
    ("fader", {"es": "Los Fader", "ru": "Семья Фадер", "it": "I Fader", "en": "The Faders",
               "de": "Die Faders", "fr": "Les Fader", "pt": "Os Fader"},
     ["luis-fader", "natalia-fader", "sergio-fader", "fernando-fader", "heinrich", "adolfo-fader"]),
    ("florencia", {"es": "Los artistas de Florencia", "ru": "Флорентийские художники", "it": "Gli artisti di Firenze",
                   "en": "The artists of Florence", "de": "Die Künstler von Florenz", "fr": "Les artistes de Florence",
                   "pt": "Os artistas de Florença"},
     ["lorenzo", "carlotta", "luca-pittore", "laura-bellini", "alessio", "aurora"]),
    ("argenta", {"es": "Argenta", "ru": "Аргента", "it": "Argenta", "en": "Argenta", "de": "Argenta", "fr": "Argenta", "pt": "Argenta"},
     ["luciano", "laura", "pyotr-argenta", "maria-argenta", "ivan-argenta", "maskvell"]),
    ("sinea", {"es": "Sinea", "ru": "Синея", "it": "Sinea", "en": "Sinea", "de": "Sinea", "fr": "Sinea", "pt": "Sinea"},
     ["franco", "chiara", "oxana-voice", "sasha-voice", "romeo", "gaia"]),
]


# Names missing from the gallery in some language
NAMES = {("lorenzo", "ru"): "Лоренцо", ("carlotta", "ru"): "Карлотта", ("aurora", "ru"): "Аврора"}


def base_name(p):
    n = p["name"].split("/")[0]
    return re.sub(r"\s*\(.*?\)", "", n).strip()


def local_name(p, lang):
    if (p["id"], lang) in NAMES:
        return NAMES[(p["id"], lang)]
    loc = p.get("localizations", {})
    for l in (lang, "es"):
        if l in loc and loc[l].get("name"):
            return loc[l]["name"].split(" — ")[0].strip()
    if lang == "ru" and "ru" in loc:
        return loc["ru"]["name"]
    return base_name(p)


def main():
    chars = {p["id"]: p for p in json.load(open(os.path.join(ROOT, "characters/catalog.json")))["characters"]}
    novels = json.load(open(os.path.join(ROOT, "novels/catalog.json")))["novels"]
    by_slug = {n["slug"]: n for n in novels}
    out_dir = os.path.join(ROOT, "games/chess")
    os.makedirs(out_dir, exist_ok=True)
    armies = []
    for aid, title, ids in ARMIES:
        pieces, count = {}, {}
        for role, cid in zip(ROLES, ids):
            p = chars[cid]
            f, cx, cy, sw = CROP[cid]
            im = Image.open(os.path.join(ROOT, "characters/img", f)).convert("RGB")
            W, H = im.size
            s = min(int(sw * W), W, H)
            x = max(0, min(W - s, int(cx * W - s / 2)))
            y = max(0, min(H - s, int(cy * H - s / 2)))
            im.crop((x, y, x + s, y + s)).resize((200, 200), Image.LANCZOS).save(
                os.path.join(out_dir, cid + ".jpg"), quality=84, optimize=True, progressive=True)
            pieces[role] = {"id": cid, "img": f"games/chess/{cid}.jpg",
                            "name": {l: local_name(p, l) for l in LANGS}}
            if role in "kq":
                for i, s_ in enumerate(p["novels"]):
                    count[s_] = count.get(s_, 0) + 10 - min(i, 9)
        # subtitle: the novel of this world in each language (the one king and queen share most, 18+ last)
        sub = {}
        ranked = sorted(count, key=lambda s_: (bool(by_slug.get(s_, {}).get("adult")), -count[s_]))
        for l in LANGS:
            for s_ in ranked:
                n = by_slug.get(s_)
                if n and n["lang"] == l and not n.get("hidden"):
                    sub[l] = {"title": n["title"], "slug": s_}
                    break
        armies.append({"id": aid, "title": title, "novel": sub, "pieces": pieces})
    with open(os.path.join(ROOT, "games/chess.json"), "w", encoding="utf-8") as fh:
        json.dump({"armies": armies}, fh, ensure_ascii=False, indent=1)
    print(f"{len(armies)} armies, {sum(len(a['pieces']) for a in armies)} portraits")


if __name__ == "__main__":
    main()
