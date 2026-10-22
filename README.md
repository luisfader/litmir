# Литературный мир — Robert Fader

Sitio web para leer las novelas de Robert Fader. Cada idioma (RU, ES, IT, EN, DE, FR, TR, PT, CS, SR, EO, ISV, VO, IA) muestra solo las novelas escritas en ese idioma.

## Estructura

```
index.html                  el sitio completo (no necesita compilación)
novels/catalog.json         lista de novelas, títulos, descripciones y capítulos
novels/<novela>/            un archivo .md por capítulo (01.md, 02.md, …)
```

## Añadir una novela

1. Crear la carpeta `novels/<nombre-corto>/<idioma>/` con un archivo por capítulo.
2. Añadir la novela a `novels/catalog.json` con su título en cada idioma y la lista de capítulos.
3. Opcional: una portada (`"cover": "novels/<nombre-corto>/cover.jpg"`). Sin portada, el sitio genera una.

Formato del texto: párrafos separados por una línea en blanco, `*cursiva*`, `**negrita**`, `***` para un cambio de escena.

## Publicación



## Blog

Cada idioma tiene su propio blog (`#/blog`), al que se llega desde el botón «Blog» de la portada. Cada idioma muestra solo sus entradas.

1. Escribir la entrada en `blog/<idioma>/<nombre-corto>.md` (mismo formato que los capítulos).
2. Añadirla a `blog/catalog.json`:

```json
{"slug": "nombre-corto", "lang": "es", "title": "Título", "date": "2026-10-20",
 "excerpt": "Resumen para la lista", "image": "novels/la-corazonada/cover.jpg"}
```

`excerpt` e `image` son opcionales. Las entradas se ordenan por fecha, la más reciente primero, y cada una tiene sus propios comentarios.

## Novelas para adultos

Añadir `"adult": true` a la novela en `catalog.json`: aparece la marca 18+ y se pide confirmación de edad antes de leer.

## Traducciones

Si una novela existe en otro idioma, añadir `"translations": {"es": "slug-de-la-version-espanola"}`.

## Pinterest

`tools/pinterest.py` publica pines a partir del catálogo (sin dependencias, solo Python 3).
Necesita `PINTEREST_ACCESS_TOKEN` (de una app en developers.pinterest.com, con `boards:read` y `pins:write`)
y, opcionalmente, `PINTEREST_BOARD_ID`.

```
python3 tools/pinterest.py boards                       # ver tus tableros y su id
python3 tools/pinterest.py novel la-corazonada          # pin con la portada y la sinopsis
python3 tools/pinterest.py novels --lang es             # un pin por cada novela en español
python3 tools/pinterest.py blog <slug>                  # pin de una entrada (necesita "image")
python3 tools/pinterest.py pin --title ... --image ... --link ...
```

Añade `--dry-run` (antes del comando) para ver el pin sin publicarlo.
