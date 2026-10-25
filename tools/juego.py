"""Build games/<lang>.json — the question pool for the novels game.

Every question is derived from data already on the site, so nothing is invented:
  * who   – «Who is it?»: a character's description from characters/catalog.json, options = names
  * quote – «Which novel is this line from?»: a real sentence from chapters 1–3 of a novel
  * where – «In which novel does X appear?»: from the character's `novels` list
  * plot  – hand-written questions in games/plot.<lang>.json (checked against the text)
Adult (18+) novels are left out of quotes and options; encrypted chapters are skipped.
"""
import json, random, re, os, sys

random.seed(7)
LANGS = ["es", "ru", "it", "en"]
# Novels left out of the game (by slug)
EXCLUDE = {"julian-la-hambru"}
P = {
 "es": {"who": "¿Quién es?", "quote": "¿De qué novela es esta frase?", "where": "¿En qué novela aparece {name}?", "plot": "La trama",
        "whyWho": "Es {name}, de «{novel}».", "whyQuote": "Es de «{novel}».", "whyWhere": "{name} aparece en «{novel}».", "photo": "¿Quién es este personaje?"},
 "ru": {"who": "Кто это?", "quote": "Из какого романа эта фраза?", "where": "В каком романе есть {name}?", "plot": "Сюжет",
        "whyWho": "Это {name} из романа «{novel}».", "whyQuote": "Это из романа «{novel}».", "whyWhere": "{name} — персонаж романа «{novel}».", "photo": "Кто этот персонаж?"},
 "it": {"who": "Chi è?", "quote": "Da quale romanzo è questa frase?", "where": "In quale romanzo compare {name}?", "plot": "La trama",
        "whyWho": "È {name}, da «{novel}».", "whyQuote": "È da «{novel}».", "whyWhere": "{name} compare in «{novel}».", "photo": "Chi è questo personaggio?"},
 "en": {"who": "Who is it?", "quote": "Which novel is this line from?", "where": "In which novel does {name} appear?", "plot": "The plot",
        "whyWho": "It’s {name}, from «{novel}».", "whyQuote": "It’s from «{novel}».", "whyWhere": "{name} appears in «{novel}».", "photo": "Who is this character?"},
}
GLOSS = re.compile(r"\*\*([^*]+)\*\*\{[^}]*\}")


def clean(t):
    t = GLOSS.sub(r"\1", t)
    t = re.sub(r"!\[[^\]]*\]\([^)]*\)", "", t)
    t = re.sub(r"\[\[[^\]]*\]\]", "", t)
    t = re.sub(r"[*_#>`|]", "", t)
    return re.sub(r"[ \t]+", " ", t)


def sentences(t):
    t = re.sub(r"\s*\n\s*", " ", t)
    return [s.strip() for s in re.split(r"(?<=[.!?…»“])\s+(?=[«„“\"—A-ZА-ЯЁÁÉÍÓÚÑÀÈÌÒÙ])", t) if s.strip()]


def main(root):
    cat = json.load(open(f"{root}/novels/catalog.json", encoding="utf-8"))["novels"]
    chars = json.load(open(f"{root}/characters/catalog.json", encoding="utf-8"))["characters"]
    imgs = sorted(os.listdir(f"{root}/characters/img"))
    os.makedirs(f"{root}/games", exist_ok=True)
    for L in LANGS:
        p = P[L]
        novels = [n for n in cat if n["lang"] == L and not n.get("adult") and not n.get("hidden") and n["slug"] not in EXCLUDE]
        by_slug = {n["slug"]: n for n in novels}
        titles = [n["title"] for n in novels]
        pool = []

        def opts(right, others, k=3):
            others = [o for o in dict.fromkeys(others) if o != right]
            if len(others) < k: return None
            o = [right] + random.sample(others, k)
            random.shuffle(o)
            return o

        # --- characters of this language (only those in non-adult novels of this language)
        cs = []
        for c in chars:
            loc = (c.get("localizations") or {}).get(L)
            ns = [s for s in c.get("novels", []) if s in by_slug]
            if loc and loc.get("name") and ns:
                cs.append({"id": c["id"], "name": loc["name"].strip(), "desc": (loc.get("description") or "").strip(), "novels": ns})
        names = [c["name"] for c in cs]

        # who: description → name
        for c in cs:
            d = c["desc"]
            if len(d) < 40: continue
            for part in re.split(r"\s*/\s*", c["name"]):
                if len(part) > 2: d = re.sub(re.escape(part), "…", d)
            if len(d) > 260: d = d[:257].rsplit(" ", 1)[0] + "…"
            o = opts(c["name"], names)
            if not o: continue
            nov = by_slug[c["novels"][0]]["title"]
            pool.append({"type": "story", "kind": "who", "prompt": p["who"], "question": d, "options": o,
                         "answer": o.index(c["name"]), "why": p["whyWho"].format(name=c["name"], novel=nov)})

        # who with a portrait (characters/img/<id>-N.jpg)
        for c in cs:
            pics = [f for f in imgs if f.startswith(c["id"] + "-")]
            for f in pics[:2]:
                o = opts(c["name"], names)
                if not o: continue
                nov = by_slug[c["novels"][0]]["title"]
                pool.append({"type": "choice", "kind": "who", "prompt": p["photo"], "word": "", "img": f"characters/img/{f}",
                             "options": o, "answer": o.index(c["name"]), "why": p["whyWho"].format(name=c["name"], novel=nov)})

        # where: character → one of their novels (distractors: novels with no character of that name)
        same = {}
        for c in cs: same.setdefault(c["name"].lower(), set()).update(c["novels"])
        for c in cs:
            mine = same[c["name"].lower()]
            right = by_slug[c["novels"][0]]["title"]
            o = opts(right, [n["title"] for n in novels if n["slug"] not in mine])
            if not o: continue
            pool.append({"type": "story", "kind": "where", "prompt": p["plot"], "question": p["where"].format(name=c["name"]),
                         "options": o, "answer": o.index(right), "why": p["whyWhere"].format(name=c["name"], novel=right)})

        # quote: real sentences from chapters 1–3
        for n in novels:
            got = 0
            files = [x["file"] for x in n["chapters"] if not x.get("label") and x["file"].endswith(".md")][:3]
            cand = []
            for f in files:
                fp = f"{root}/novels/{n['slug']}/{f}"
                if not os.path.exists(fp): continue
                raw = open(fp, encoding="utf-8").read()
                if raw.startswith("LITMIR-ENC1:"): continue
                for s in sentences(clean(raw)):
                    if not (70 <= len(s) <= 170): continue
                    if any(w.lower() in s.lower() for w in re.findall(r"\w{5,}", n["title"])): continue
                    if re.search(r"https?:|\(|\)|\d{3,}|:|;|\[|\]|_{2,}", s): continue
                    if L != "ru" and re.search(r"[А-яЁё]", s): continue
                    if L == "ru" and len(re.findall(r"\b[A-Za-z]{3,}\b", s)) > 1: continue
                    if re.search(r"(?i)student|exerci|ejercici|esercizi|упражн|ответ|respuesta|rispost|answer|vocabul|словар|glosar", s): continue
                    if not re.search(r"\b[A-ZА-ЯЁ][a-zа-яё]{2,}", s[1:]): continue  # needs a name/place after the first word
                    cand.append(s)
            random.shuffle(cand)
            for s in cand[:3]:
                o = opts(n["title"], titles)
                if not o: break
                pool.append({"type": "story", "kind": "quote", "prompt": p["quote"], "question": "«" + s.strip("«»\"“„ ") + "»",
                             "options": o, "answer": o.index(n["title"]), "why": p["whyQuote"].format(novel=n["title"])})

        # hand-written plot questions
        hp = f"{root}/games/plot.{L}.json"
        if os.path.exists(hp):
            for q in json.load(open(hp, encoding="utf-8")):
                o = list(q["options"]); right = o[0]; random.shuffle(o)
                pool.append({"type": "story", "kind": "plot", "prompt": p["plot"], "question": q["question"], "options": o,
                             "answer": o.index(right), "why": q.get("why", "")})

        covers = [n["cover"] for n in novels if n.get("cover")]
        out = {"lang": L, "covers": covers, "pool": pool}
        json.dump(out, open(f"{root}/games/{L}.json", "w", encoding="utf-8"), ensure_ascii=False, indent=1)
        from collections import Counter
        print(L, len(novels), "novelas ·", len(pool), "preguntas", dict(Counter(q["kind"] for q in pool)))


main(sys.argv[1] if len(sys.argv) > 1 else ".")
