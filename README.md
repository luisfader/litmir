# Литературный мир — Robert Fader

Sitio web para leer las novelas de Robert Fader. Cada idioma (RU, ES, IT, EN, DE, FR, TR, PT, CS, PL, SR, EO, ISV, VO, IA, LD, LA, SW, BG, VEC) muestra solo las novelas escritas en ese idioma. El español es el idioma por defecto.

**Las novelas en ruso están en este sitio** (sección RU), igual que las de los demás idiomas. Antes de dar por hecho dónde está una novela, mirar `novels/catalog.json`.

## Estructura

```
index.html                  el sitio completo (no necesita compilación)
novels/catalog.json         lista de novelas, títulos, descripciones y capítulos
novels/<novela>/            un archivo .md por capítulo (01.md, 02.md, …)
```

## Añadir una novela

1. Crear la carpeta `novels/<nombre-corto>/<idioma>/` con un archivo por capítulo.
2. Añadir la novela a `novels/catalog.json` con su título en cada idioma y la lista de capítulos.
3. Si la novela no está terminada, añadir `"wip": true` (ver «Novelas en proceso de escritura»).
4. Opcional: una portada (`"cover": "novels/<nombre-corto>/cover.jpg"`). Sin portada, el sitio genera una.
5. Clasificación por edad: `"rating": "12+"` o `"16+"`, o `"adult": true` para 18+ (muestra un aviso antes de entrar). Toda novela debe tener una de las dos.

Formato del texto: párrafos separados por una línea en blanco, `*cursiva*`, `**negrita**`, `***` para un cambio de escena.

Servicios de Meta (prohibida en Rusia): no nombrarlos en las novelas; usar los nombres inventados. Alfabeto latino: Guatsap (WhatsApp), Instadram (Instagram), Feisbut (Facebook). Cirílico: Гуатсап, Инстадрам, Фейсбут.

## Publicación



## Revista (PDF)

Un idioma puede ofrecer su revista en PDF para descargar: un botón en la portada de ese idioma. El archivo va en `magazine/` y se registra en `MAGAZINES` dentro de `index.html` (`{ru: {file, btn}}`). Ahora: «Литература перед сном», noviembre de 2026 (RU).

## Blog

Cada idioma tiene su propio blog (`#/blog`), al que se llega desde el botón «Blog» de la portada. Cada idioma muestra solo sus entradas.

1. Escribir la entrada en `blog/<idioma>/<nombre-corto>.md` (mismo formato que los capítulos).
2. Añadirla a `blog/catalog.json`:

```json
{"slug": "nombre-corto", "lang": "es", "title": "Título", "date": "2026-10-20",
 "excerpt": "Resumen para la lista", "image": "novels/la-corazonada/cover-v4.jpg"}
```

`excerpt` e `image` son opcionales. Las entradas se ordenan por fecha, la más reciente primero, y cada una tiene sus propios comentarios.

## Cursos de idiomas

Cada idioma puede tener su curso (`#/learn`), con la teoría explicada en otros idiomas que el estudiante elige (por ejemplo, español con explicaciones en ruso o inglés). El botón aparece en la portada del idioma solo si existe un curso.

1. Agregar la unidad en `learn/catalog.json` (curso por `lang`, idiomas de explicación en `help`).
2. Teoría: `learn/<idioma>/<unidad>/theory.<idioma-de-explicación>.md` (mismo formato que los capítulos; admite glosas `**palabra**{traducción}`, tablas y ejercicios `[[a|*b|c]]` y `( V / F ){V}`).
3. Práctica: `learn/<idioma>/<unidad>/practice.<idioma-de-explicación>.json` (mismo formato que los tests de las novelas: `match`, `choice`, `reverse`, `fill`, `build`, `write`, `story`, `tf`).

## Novelas en proceso de escritura

**Toda novela que no esté terminada debe llevar `"wip": true`** en `catalog.json`. Así aparece la etiqueta «En proceso» en la tarjeta y en la ficha, y un aviso de que llegarán capítulos nuevos. Hay que revisarlo cada vez que se añade una novela o capítulos nuevos: si falta el final (o faltan capítulos intermedios), lleva `"wip": true`. Cuando el autor la termine, se quita la marca.

## Juego de las novelas

En las secciones ES, RU, IT y EN hay un juego (`#/game`, botón «🎲» en la portada): partidas de 10 preguntas al azar, con corazones, XP, rachas y récord. Mezcla cuatro tipos de preguntas:

- **¿Quién es?** — la descripción (o el retrato) de un personaje de la galería (`characters/catalog.json`, `characters/img/`).
- **¿De qué novela es esta frase?** — una frase real de los capítulos 1–3 de cada novela.
- **¿En qué novela aparece…?** — sale del campo `novels` de cada personaje.
- **La trama** — preguntas escritas a mano en `games/plot.<idioma>.json` (la primera opción es la correcta; comprobar cada dato en el texto).

Las preguntas están en `games/<idioma>.json`. **Al añadir novelas o personajes, regenerarlas:** `python3 tools/juego.py .` Las novelas 18+ quedan fuera del juego. Para dejar fuera otra novela, añadir su slug a `EXCLUDE` en `tools/juego.py`.

## Ajedrez de las novelas

`chess.html` (botón «♞» en la portada de ES, RU, IT, EN, DE, FR y PT): ajedrez contra la computadora en el que las figuras son personajes de las novelas. El jugador elige su ejército, el de la computadora, el color y uno de cinco niveles (Principiante, Fácil, Intermedio, Difícil, Maestro). Se puede deshacer, pedir una pista y rendirse; la partida en curso, la configuración y las victorias por nivel se guardan en el navegador (`lm:chess:game`, `lm:chess:cfg`, `lm:chess:wins`).

- Motor: `games/chess-engine.js`, sin dependencias. Corre en un Web Worker para que el tablero no se congele mientras la computadora piensa.
- Ejércitos: seis personajes de un mismo mundo, uno por figura (rey, dama, torre, alfil, caballo, peón). Se definen en `ARMIES` dentro de `tools/ajedrez.py`, junto con el recorte de cada retrato alrededor de la cara (`CROP`).
- **Al cambiar ejércitos, recortes o nombres, regenerar:** `python3 tools/ajedrez.py .` (escribe `games/chess.json` y los retratos redondos de `games/chess/`).

## Noticias satíricas

En ES, IT y EN hay un periódico satírico (`#/news`, botón «📰» en la portada), con noticias políticas inventadas a partir de las novelas de cada idioma: *El Heraldo de Sinea* (ES), *Il Corriere del Sorriso* (IT) y *The Sinea Herald* (EN). El botón aparece solo en los idiomas que tienen periódico.

1. Escribir la noticia en `news/<idioma>/<nombre-corto>.md` (mismo formato que los capítulos).
2. Añadirla a `news/catalog.json`:

```json
{"slug": "nombre-corto", "lang": "es", "date": "2026-10-28", "section": "Gobierno",
 "title": "Titular", "deck": "Bajada", "novels": ["el-impostor"], "lead": true}
```

`lead: true` la pone como noticia principal de la portada. `novels` enlaza las novelas en las que se basa (de ahí sale la portada que se usa como imagen); `image` permite usar otra ilustración. Cada periódico tiene al final de la portada una sección de chimentos (*Chimentos*, *Pettegolezzi*, *Gossip*): están en `papers.<idioma>.gossip`, cada uno con su texto y la novela de la que sale (`{"text": "…", "novel": "el-impostor"}`). Para un idioma nuevo, añadir su periódico en `papers` (nombre, lema, precio, aviso).

Cada periódico tiene al final de la portada una sección de chimentos (ES «Chimentos», IT «Pettegolezzi», EN «Gossip»), en `papers.<idioma>.gossip`: `title`, `sub` y una lista `items` con `title`, `text` y `novel` (la novela a la que enlaza). Las noticias no usan personas reales: solo personajes de las novelas. Las novelas 18+ quedan fuera.

## Recomendación del día

En la portada de cada idioma aparece una tarjeta «Recomendación del día» con una novela de ese idioma y el porqué. Los datos están en `recs/calendar.json`:

- `{"date": "MM-DD", "slug": …, "why": …}`: una efeméride o un aniversario que se repite cada año (por ejemplo, el 21 de abril, Natale di Roma → *Antonio e il segreto di Roma*).
- `{"easter": -47, …}`: una fiesta móvil, contada en días desde el Domingo de Pascua (−47 = martes de Carnaval).
- `{"month": 10, …}`: la recomendación de todo el mes, cuando ese día no hay efeméride.

Si no hay nada para ese día, se elige una novela al azar (la misma durante todo el día) y se muestra el principio de su descripción. Las novelas para adultos nunca se recomiendan. El motivo (`why`) se escribe en el idioma de la novela. Antes de añadir una fecha histórica, hay que comprobarla.

## Novelas para adultos

Añadir `"adult": true` a la novela en `catalog.json`: aparece la marca 18+ y se pide confirmación de edad antes de leer.

## Traducciones

Si una novela existe en otro idioma, añadir `"translations": {"es": "slug-de-la-version-espanola"}`.

## Sin registro

Todo el sitio es libre: todos los capítulos y todas las unidades se leen sin registrarse, no hay inicio de sesión y nada está cifrado. El progreso de lectura (capítulos leídos, último capítulo, notas de tests y cursos, «Mis lecturas») y la lista de novelas favoritas se guardan exclusivamente en el navegador de cada lector mediante `localStorage` (`lm:done:<slug>`, `lm:last:<slug>`, `lm:favorites`). No existe sincronización entre dispositivos, cuentas de usuario ni envío de estas preferencias a una base de datos. Al borrar los datos del sitio en el navegador, se pierden las preferencias y el progreso.

`tools/cifrar.mjs` quedó de cuando los capítulos 5+ estaban cifrados; ya no se usa.

## Capítulos con contraseña

Una novela puede dejar libres los primeros capítulos y pedir una contraseña para el resto. La contraseña no se guarda en ningún archivo: los capítulos se cifran y solo se pueden leer con ella.

```
LITMIR_PASSWORD='…' node tools/proteggi.mjs <slug> 5          # cifra del capítulo 6 en adelante
LITMIR_PASSWORD='…' node tools/proteggi.mjs <slug> --decifra  # vuelve a texto normal (para editar)
```

Para editar un capítulo protegido: descifrar, editar, volver a cifrar.
