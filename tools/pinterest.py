#!/usr/bin/env python3
"""Publica pines en Pinterest (API v5) a partir de las novelas y el blog del sitio.

Necesita la variable de entorno PINTEREST_ACCESS_TOKEN (scopes: boards:read, pins:write).
Opcional: PINTEREST_BOARD_ID (tablero por defecto) y PINTEREST_SITE_URL.

  python3 tools/pinterest.py boards
  python3 tools/pinterest.py novel dikij-chas --board 123
  python3 tools/pinterest.py blog entrevista-misterio-de-los-fader
  python3 tools/pinterest.py pin --title "..." --image novels/x/cover.jpg --link https://...
  python3 tools/pinterest.py novels --lang es --dry-run   # un pin por cada novela en español

--dry-run muestra lo que se enviaría sin publicar nada.
"""
import argparse
import base64
import json
import mimetypes
import os
import sys
import time
import urllib.error
import urllib.request
from pathlib import Path

API = "https://api.pinterest.com/v5"
ROOT = Path(__file__).resolve().parent.parent
SITE = os.environ.get("PINTEREST_SITE_URL", "https://luisfader.github.io/litmir/").rstrip("/") + "/"


def call(method, path, body=None):
    token = os.environ.get("PINTEREST_ACCESS_TOKEN")
    if not token:
        sys.exit("Falta PINTEREST_ACCESS_TOKEN en el entorno.")
    req = urllib.request.Request(
        API + path, method=method,
        data=json.dumps(body).encode() if body is not None else None,
        headers={"Authorization": f"Bearer {token}", "Content-Type": "application/json"})
    try:
        with urllib.request.urlopen(req, timeout=60) as r:
            return json.load(r)
    except urllib.error.HTTPError as e:
        sys.exit(f"Pinterest respondió {e.code}: {e.read().decode(errors='replace')}")


def media_source(image):
    if image.startswith(("http://", "https://")):
        return {"source_type": "image_url", "url": image}
    path = (ROOT / image) if not os.path.isabs(image) else Path(image)
    return {"source_type": "image_base64",
            "content_type": mimetypes.guess_type(path.name)[0] or "image/jpeg",
            "data": base64.b64encode(path.read_bytes()).decode()}


def clip(text, n):
    text = " ".join((text or "").split())
    return text if len(text) <= n else text[:n - 1].rstrip() + "…"


def create_pin(board, title, description, link, image, alt=None, dry_run=False):
    body = {"board_id": board, "title": clip(title, 100), "description": clip(description, 500),
            "link": link, "media_source": media_source(image)}
    if alt:
        body["alt_text"] = clip(alt, 500)
    if dry_run:
        shown = dict(body, media_source={**body["media_source"], "data": "<imagen>"}
                     if "data" in body["media_source"] else body["media_source"])
        print(json.dumps(shown, ensure_ascii=False, indent=2))
        return
    if not board:
        sys.exit("Falta el tablero: usa --board o PINTEREST_BOARD_ID (lista con: boards).")
    pin = call("POST", "/pins", body)
    print(f"Publicado: https://www.pinterest.com/pin/{pin['id']}/  ({body['title']})")


def novel_pin(n):
    desc = n.get("description", "")
    if n.get("genre"):
        desc = f"{n['genre']}. {desc}"
    return dict(title=n["title"], description=desc, link=f"{SITE}?lang={n['lang']}",
                image=n.get("cover"), alt=f"{n['title']} — {n.get('author', 'Robert Fader')}")


def main():
    p = argparse.ArgumentParser(description="Publicar pines en Pinterest")
    p.add_argument("--board", default=os.environ.get("PINTEREST_BOARD_ID"))
    p.add_argument("--dry-run", action="store_true")
    sub = p.add_subparsers(dest="cmd", required=True)
    sub.add_parser("boards", help="lista tus tableros y sus id")
    s = sub.add_parser("novel", help="pin de una novela del catálogo")
    s.add_argument("slug")
    s = sub.add_parser("novels", help="un pin por cada novela de un idioma")
    s.add_argument("--lang", required=True)
    s = sub.add_parser("blog", help="pin de una entrada del blog")
    s.add_argument("slug")
    s = sub.add_parser("pin", help="pin libre")
    s.add_argument("--title", required=True)
    s.add_argument("--image", required=True, help="ruta local o URL")
    s.add_argument("--description", default="")
    s.add_argument("--link", default=SITE)
    a = p.parse_args()

    if a.cmd == "boards":
        bookmark = None
        while True:
            r = call("GET", "/boards?page_size=100" + (f"&bookmark={bookmark}" if bookmark else ""))
            for b in r.get("items", []):
                print(f"{b['id']}\t{b['name']}")
            bookmark = r.get("bookmark")
            if not bookmark:
                return

    if a.cmd == "pin":
        return create_pin(a.board, a.title, a.description, a.link, a.image, dry_run=a.dry_run)

    if a.cmd == "blog":
        posts = json.loads((ROOT / "blog/catalog.json").read_text())["posts"]
        post = next((x for x in posts if x["slug"] == a.slug), None) or sys.exit(f"No existe la entrada {a.slug}")
        if not post.get("image"):
            sys.exit("La entrada no tiene 'image' en blog/catalog.json; usa el comando pin con --image.")
        return create_pin(a.board, post["title"], post.get("excerpt", ""),
                          f"{SITE}?lang={post['lang']}#/blog/{post['slug']}", post["image"],
                          dry_run=a.dry_run)

    novels = json.loads((ROOT / "novels/catalog.json").read_text())["novels"]
    if a.cmd == "novel":
        chosen = [x for x in novels if x["slug"] == a.slug] or sys.exit(f"No existe la novela {a.slug}")
    else:
        chosen = [x for x in novels if x["lang"] == a.lang and x.get("cover")]
    for i, n in enumerate(chosen):
        if not n.get("cover"):
            sys.exit(f"{n['slug']} no tiene portada; usa el comando pin con --image.")
        if i:
            time.sleep(2)  # no saturar el límite de peticiones
        create_pin(a.board, dry_run=a.dry_run, **novel_pin(n))


if __name__ == "__main__":
    main()
