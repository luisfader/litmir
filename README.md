# LitFader — Robert Fader

Sitio web para leer las novelas de Robert Fader. Cada idioma (RU, ES, IT, EN, FR, TR, PT, CS, SR, EO, ISV) muestra solo las novelas escritas en ese idioma. El español es el idioma por defecto.

**Idiomas ocultos por ahora:** DE, PL, VO, IA, LD, LA, VEC, BG y SW. Sus archivos siguen en el repositorio, pero no aparecen en el sitio. Para volver a mostrar uno, quitar su código de `HIDDEN_LANGS` en `index.html` y de la lista equivalente en `characters.html`.

**Las novelas en ruso están en este sitio** (sección RU), igual que las de los demás idiomas. Antes de dar por hecho dónde está una novela, mirar `novels/catalog.json`.

**Nombre:** el sitio y la app se llaman **LitFader** en todos los idiomas, salvo en ruso, donde se escribe en cirílico: **ЛитФадер** (antes «Mundo literario» / «Литературный мир»). Los nombres internos del código (`Litmir…`, `litmir-lang`, la carpeta del repositorio) no se cambian.

**Menú lateral:** a la izquierda hay un menú con todas las secciones del idioma (novelas, personajes, blog, noticias, curso, juegos, revistas, pódcasts, favoritos). En pantallas anchas queda abierto y se pliega con ☰ (se recuerda en `snav`); en el celular se despliega desde la izquierda con ☰. Las secciones salen de `navItems()` en `index.html`: una sección nueva se añade ahí.

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

Formato del texto: párrafos separados por una línea en blanco, `*cursiva*`, `**negrita**`, `***` para un cambio de escena. Para poner una música dentro de un capítulo: `!audio[Texto que va debajo](novels/<novela>/music/archivo.mp3)` en un párrafo propio; muestra un reproductor y, al darle play, pausa la banda sonora.

Servicios de Meta (prohibida en Rusia): no nombrarlos en las novelas; usar los nombres inventados. Alfabeto latino: Guatsap (WhatsApp), Instadram (Instagram), Feisbut (Facebook). Cirílico: Гуатсап, Инстадрам, Фейсбут.

## Publicación



## App instalable (PWA)

El sitio se puede instalar como app, sin tiendas ni búsquedas: en el celular o la computadora aparece el botón «Instalar app» al pie de la página (en iPhone, un aviso explica cómo: Compartir → «Añadir a pantalla de inicio»). Una vez instalada, abre como app propia y las páginas ya visitadas funcionan sin conexión.

- `manifest.webmanifest`: nombre de la app («LitFader»), colores e íconos de la app.
- `sw.js`: service worker. Siempre pide primero lo más nuevo a la red y, sin conexión, usa lo guardado. Si se cambia la estrategia, subir el número de `CACHE`.
- `app/`: íconos (el zorro dibujado por Robert, a 192, 512, 180 para iPhone y favicon).
- El botón y el registro del service worker están al inicio del primer `<script>` de `index.html`.

## Revista (PDF)

Un idioma puede ofrecer sus revistas en PDF: en el menú de la portada aparece «Журналы» / «Riviste», que abre la página `#/magazine` con todas las revistas de ese idioma (portada, descripción, «Abrir» y «Descargar PDF»). Cada PDF va en `magazine/`, su miniatura en `magazine/covers/` y se registra en `MAGAZINES` dentro de `index.html` (`{ru: {…, items: [{file, cover, name, issue, pages, desc}]}}`, la más nueva primero). Ahora: RU — «Волны любви» № 1 y № 2 (noviembre de 2026, 20 páginas cada una) y «Литература перед сном» (noviembre de 2026); ES — «Aquella vez» n.º 1 (noviembre de 2026, segunda quincena, 20 páginas, basada en la parte española del sitio); IT — «L'uomo oggi» n.º 1 (noviembre de 2026, 15 páginas, revista de filosofía basada en todo el sitio), «Mistero letterario» n.º 1 (noviembre de 2026, 20 páginas, basada en la parte italiana del sitio) y «Al chiaro di luna» (noviembre de 2026, 20 páginas).

Un idioma también puede ofrecer pódcasts: en el menú de la portada aparece «🎙 Podcast», que abre la página `#/podcast` con los episodios de ese idioma (portada de la novela, descripción, reproductor, «Leggi il romanzo» y «Scarica MP3»). Cada MP3 va en `podcasts/` del repositorio `luisfader/podcasts` y se registra en `PODCASTS` dentro de `index.html` (`{it: {…, items: [{file, novel, cover, name, issue, duration, desc, credit}]}}`, el más nuevo primero). Ahora: RU — «Страницы в эфире», спецвыпуск: «Аномальный час» (28 de octubre de 2026, 6:48, sin música; va último en la lista), выпуск 11: «Дикий час: Венецианское колдовство» (19 de noviembre de 2026, 4:21, música de fondo «Pizzicato d'amore», bien baja), выпуск 10: «Дикий час: Карнавал раздора» (19 de noviembre de 2026, 4:14, música de fondo «Сражение», bien baja), выпуск 9: «Стратег» (18 de noviembre de 2026, 17:52, episodio largo; de fondo se encadenan «Игра в прятки со звёздами», «Bello amanecer» y «Explorarte» y vuelven a empezar), выпуск 8: «Метеоритный дождь» (18 de noviembre de 2026, 3:14, música de fondo «Lluvia de destinos»), выпуск 7: «Опасное свидание» (18 de noviembre de 2026, 3:04, música de fondo «Женский заговор»), выпуск 6: «Волны любви. Крепость в полумраке» (18 de noviembre de 2026, 2:55, una voz; la música alterna «Вердеград» en los momentos luminosos y «Penumbra misteriosa» en los oscuros), выпуск 5: «Венецианская маска» y «Maschera di Venezia» (18 de noviembre de 2026, 4:50, diálogo a dos voces que compara las versiones rusa e italiana, música de fondo «Ilusiones de agua»), выпуск 4: «Грустный город» (18 de noviembre de 2026, 3:14, música de fondo «Impacto de amor», con pausas en las que sube la música), выпуск 3: «Северная любовь: Плач с севера», capítulos 1–2 (18 de noviembre de 2026, 2:39, música de fondo «Плач с Севера 2026»), выпуск 2: «Тайна семьи Фадер» (16 de noviembre de 2026, 3:09, música de fondo «Запах мальбека») y выпуск 1: «Предчувствие» (11 de noviembre de 2026, 3:14, música de fondo «Страсти (Versión de combate)»); IT — «Pagine in onda», episodio 2: «Antonio e il segreto di Roma» (18 de noviembre de 2026, 3:04) y episodio 1: «Onde d'amore» (2:48).

## Secciones de la novela (banda sonora, juegos, galería)

En la página de la novela, un botón «Разделы романа» abre la lista de secciones, **una debajo de la otra** (ícono, título y, si la sección tiene `"desc"` en `sections`, una línea de descripción). Al tocar una, se abre sola con el botón «‹ Todas las secciones» para volver a la lista; si la novela tiene una sola sección, se abre directamente. Secciones posibles:

- **Banda sonora**: sale sola si la novela tiene `soundtrack`.
- **Juegos**: `"runner": 8` en `catalog.json` (número de niveles). Son minijuegos opcionales de correr y saltar (como el dinosaurio de Chrome), uno por cada 5 capítulos; **no bloquean la lectura**. Al final de los capítulos 5, 10, 15… aparece una invitación discreta a jugar. Cada nivel tiene su página: `#/<novela>/juego/<n>`. Los niveles se definen en `LEVELS`, dentro de `games/runner/runner.js`; todo se dibuja con código. Ahora solo «Волны любви: Город без улыбок» tiene juegos (8 niveles).
- **Juego de la moto**: `"moto": {"ch": 10, "title": …, "about": …, "note": …}` en `catalog.json`. Un solo juego sobre un capítulo, con su página `#/<novela>/juego/moto`; al final del capítulo `ch` aparece la invitación (`note`). Código: `games/moto/moto.js` y `games/moto/moto.css` (vista desde arriba, todo dibujado con código). Ahora: «Грустный город», «Погоня по Синее» (capítulo 10): Franco huye en la moto secreta del padre, sigue a Kiara, la ayuda a saltar a su moto cuando la policía le revienta la rueda y escapan juntos hasta el túnel. Tres etapas; si se pierde, se puede seguir desde la última etapa alcanzada. Las «смешинки» (caritas) cargan una broma que desconcierta a la policía.
- **Otra carrera de motos con la misma página**: dentro de `"moto"` se pueden poner `"js"` (script del juego), `"api"` (nombre del objeto en `window`), `"css"` (estilos extra; `games/moto/moto.css` se carga siempre como base), `"icon"` y `"bg"` (ícono y fondo de la tarjeta). Ahora: «Ti amo in silenzio» — «La Corsa del Faro» (capítulo 1; textos en italiano y en ruso según `lang`), `games/faro/faro.js` y `games/faro/faro.css`: carrera arcade en pseudo-3D por la ruta de la costa de Sinea hasta el faro. Fabrizio sale último con la moto verde del abuelo, adelanta en las curvas (la moto vieja es más ágil, las grandes son más rápidas en las rectas) y al final pelea con Lucia, que le cierra el paso; en la Curva del Diablo hay arena, a Lucia la moto le patina medio segundo y se enciende el botón «Газ!». Gana solo quien llega primero. El mejor tiempo se guarda en `faro:best:<novela>`.
- **Galería**: `"gallery": true` y un archivo `novels/<novela>/gallery.json` con `[{ch, src, th}]` (capítulo, imagen, miniatura en `img/thumbs/`). El lector solo ve las imágenes de los capítulos que ya leyó; las demás aparecen con candado.
- **Mapa de Belgrado** (`"belgradeMap": true`, «Дикий час»): `games/maps/belgrade.js` dibuja Belgrado de noche con 12 lugares de la novela y 2 «fuera del mapa» (el departamento de Natasha y el búnker). Al pasar el mouse o el dedo aparece el nombre; al tocar se abren las escenas (con ilustraciones de `img/`) y la explicación real del lugar. Las escenas de capítulos no leídos quedan bloqueadas. Zedanj es un lugar de la novela y está ubicado de forma aproximada.
- **Test con título propio**: `"quiz": true` usa `novels/<novela>/quiz.json` (preguntas con opciones y puntos, y veredictos por puntaje mínimo). Con `"quizTitle"` y `"quizIcon"` la pestaña muestra ese nombre en lugar de «Test». Ahora: «La chica del retrato» — «¿Qué tan buen hacker sos?» (10 preguntas de dos opciones, 6 resultados).
- **El hackeo** (`"hack": {"title", "icon", "about", "image"}` en `catalog.json`): juego de 10 niveles, cómico, en el que nadie hackea nada de verdad. Código y textos: `games/hack/hack.js` (todo dibujado con código; el nivel 10 usa la portada de la novela, o `image`). Cada nivel abre el siguiente; el progreso se guarda en `hack:<novela>`. Aparece también en «Juegos» (`NOVEL_GAME_TABS`). Ahora: «La chica del retrato» — 1) la compu de la abuela Rosa (pistas en el escritorio, contraseña `donpepe83`), 2) la contraseña que te olvidaste (recuerdos que descartan combinaciones + pistas 🟢🟡; código 4592), 3) la verdulería de Don Tito (panel escondido, contraseña `zapallito`, apagar el «modo buena onda» y publicar que las cebollas son malas), 4) «Operación Corazón» con Valeria, la del kiosco (ganan las respuestas sinceras), 5) el semáforo de la avenida (peatones 45 s), 6) el Wi-Fi del vecino Ernesto (código César, `empanada`), 7) Radio Sinea 101.3 con interruptores binarios, 8) Sinea a oscuras (tablero 3×3 de luces), 9) el código del espejo («La abuela ya sabe todo») y 10) el retrato (rompecabezas deslizante). Final: la abuela era la administradora de todo.
- **Cubo de Rubik**: `"cube": true` en `catalog.json`. Un cubo 3×3×3 real con dos modos a elegir: **clásico** (colores normales, sin dibujos; seis niveles con 1…6 giros de mezcla y una «Свободная игра» con 20 giros; hay que armar el cubo entero) y **con dibujos** (una imagen en cada cara; seis combinaciones, y en cada una hay que armar una cara para que aparezca el personaje). Los datos (caras, nombres, textos, cantidad de giros de mezcla) están en `DATA`, dentro de `games/cube/cube.js`; las imágenes (480×480) en `games/cube/img/`. El progreso se guarda en el navegador (`cube:<novela>` para los dibujos, `cubeC:<novela>` para el clásico). Ahora: «Дикий час» — Луис, Наташа, София, Змай, Белград, Луис и Наташа.
- **Audionovela** (`"style": "audiobook"`, un `.json` en la carpeta de la novela): primero la lista de episodios (miniatura, número, duración, «✓ Ascoltato»), y cada episodio se abre solo, con su ilustración, un reproductor propio (play, barra, velocidad 1× / 0,85× / 1,25×), el texto, «Parole e idee», «Lo sapevi?», el enlace al capítulo completo y «‹ Precedente / Successivo ›». Colores del cielo de noche de Natalia (azul noche, plata y oro, estrellas). JSON: `title`, `subtitle`, `cover`, `intro`, `note`, `ui` (textos de los botones) y `episodes: [{n, title, lettura, img, audio, duration, text: […], words: […], fact, read, ch}]`. Los episodios escuchados se guardan en `ab:<novela>`. Ahora: «Maschera di Venezia» — `novels/maschera-di-venezia/audionovela.json`, «🎧 L'audioromanzo», episodios 1–5 de la versión B1 del cuaderno «Ciao, amore! 2» (Lettura 01–05 = capítulos 1–7; ilustraciones del cuaderno en `img/audio/`, sacadas de Figma). Los MP3 están en `luisfader/podcasts`, `novels/maschera-di-venezia/audionovela/capitolo-NN.mp3`. Narradora mujer; los hombres con voz de hombre y las mujeres con voz de mujer (ElevenLabs).
- **Mapa del mundo**: una sección en `"sections"` con `"style": "map"` y un archivo `.json` en la carpeta de la novela: `intro`, `home` (el lugar desde el que se miden las distancias), `places` (`id`, `icon`, `name`, `x`, `y` en un marco de 1000×780, `at` = capítulo desde el que se ve, `dist`, `what`, `who`, `secrets: [{at, text}]`, opcional `"lp": "up"` para poner el nombre encima del punto) y `edges` (flechas al borde: `icon`, `name`, `x`, `y`, `at`, `text`). La distancia en el mapa es la distancia aproximada en el mundo; debajo hay una escala «qué tan lejos». El dibujo (río, bosque, desierto, mar, ruinas, foso) está en `mapHTML()` de `index.html`. Ahora: «Предчувствие» — `novels/predchuvstvie/karta.json` (Некрология lo más lejos, el campamento de los salvajes a mitad de camino, el mar lejos pero menos que Некрология). Cada novela tiene su propio mapa, aunque sea la misma historia en otro idioma: las versiones son distintas. Campos extra: `art` (`utopia` = desierto de Предчувствие, con anillos, rutas y escala de distancias; `venice` = Venecia con la laguna), `theme` (`night`, `carta`…), `layers: true` (botones «sobre / bajo el agua»; los lugares con `"layer": "under"` solo se ven abajo), `legend` (lista de todos los lugares; en el mapa el nombre sale solo al tocar el punto), `nowhere` (título de la lista de lugares sin `x`/`y`, sin dirección exacta) y `net` (líneas de una red: `from` → `to`, aparecen en `at` y se encienden en `glow`). Ahora también: «Венецианская маска» — `novels/venecianskaya-maska/karta.json` (Venecia nocturna, red de cartas venecianas, Сан-Микеле-дель-Абиссо bajo la isla-cementerio) y «Maschera di Venezia» — `novels/maschera-di-venezia/mappa.json` (carta náutica antigua, la Loggia, las mazmorras bajo el Palazzo Ducale).
- **Partida contra la computadora**: una sección en `"sections"` con `"style": "chess-play"` y un `.json` en la carpeta de la novela: `title`, `intro`, `levels` (`id`, `name`, `about`, `engine` = nivel del motor 1–5 de `games/chess-engine.js`, `quote`, y opcionales `win`/`loss`, el texto al ganar o perder en ese nivel) y `ui` (textos de los botones y `end.win/loss/draw`). Se elige el nivel y el color (blancas, negras o al azar); se puede deshacer, pedir pista, rendirse y empezar otra. Las figuras son las clásicas, como en los diagramas. Código: `games/chess-play/play.js` (usa el mismo motor que `#/ajedrez`, en un Web Worker). Se guardan en el navegador la partida en curso (`cplay:<novela>`) y las victorias por nivel (`cplayW:<novela>`). Ahora: «Стратег» — `novels/strateg/partiya.json`, «Партия с компьютером», tres niveles: Лёгкий (motor 2), Средний (3), Мастер (5).
- **Enciclopedia**: una sección propia en `"sections"` con `"style": "encyclopedia"` y un archivo `.md` en la carpeta de la novela. Formato: `## 🚂 Categoría`, `### Término`, una línea `@NN.md` (capítulo a partir del cual se ve la entrada), el primer párrafo en `*cursiva*` es la definición corta, los párrafos que empiezan con `{NN.md}` se abren después de ese capítulo, y una línea `→ Término A · Término B` crea los enlaces «Ver también». Tiene buscador, filtro por categorías, índice alfabético y barra de progreso; nada se muestra antes de que el lector llegue al capítulo. Ahora: «Энциклопедия Призрачного поезда» (`novels/prizrachnyj-poezd/enciklopediya.md`, 91 entradas).
- **Tarot** (`"style": "tarot"` y `"style": "tarot-read"`, las dos con el mismo `.json`): la primera muestra la baraja (cuadrícula de cartas; al tocar una se abre grande, con la opción de verla invertida, palabras clave, significado derecho e invertido, la nota de la protagonista, una posdata opcional de otro personaje y una nota «В романе» que se abre después del capítulo `at`). La segunda es una tirada: el lector elige tema, pregunta propia opcional, tipo de tirada (`spreads`, cada una con sus `pos`) y si hay cartas invertidas; se baraja, saca las cartas del abanico, las da vuelta y el personaje las interpreta (`sayUp`/`sayRev` de cada carta, `openers`, `closers`, `advice`, `mark`). La última tirada se guarda en `taro:<novela>`. Las cartas son SVG en `novels/<novela>/taro/NN.svg` y `back.svg`, dibujadas con `python3 tools/taro/make.py`. Ahora: «Знак» — «Колода Алисии» y «Алисия раскладывает карты» (`novels/znak/taro.json`, 22 arcanos mayores con un rincón de Sinea en cada uno: el faro, la cúpula de cobre del Planetario, el binocular verde, el hilo rojo con nudos).

## Ilustraciones con pie de foto y galerías en los capítulos

- `![m|Pie de foto](ruta)` — imagen mediana (520 px) con pie de foto; `![w|Pie de foto](ruta)` — ancha (760 px) con pie.
- Galería: un bloque que empieza con `::: gallery` y una imagen por línea `![pie](ruta)`. Variantes: `::: gallery cards` (cuadrícula de miniaturas, para cartas), `pair` (dos lado a lado), `trio` (tres por fila), `pages` (páginas de libro).
- «Знак»: cada capítulo tiene ilustraciones del cielo dibujadas con `python3 tools/astro/make.py` → `novels/znak/img/astro/*.svg`. Las cartas de las constelaciones salen de `novels/znak/nebo.json` (las mismas estrellas y líneas que la sección «Звёздное небо»; norte arriba, este a la izquierda, como se ve el cielo), las 12 medallas de los signos están en `tools/astro/emblems.py`, y hay láminas de la eclíptica, de «12 signos y 13 constelaciones» (límites de la UAI), del cielo de Sinea en febrero y en septiembre (latitud de `nebo.json`), de las páginas del libro de Aurelia Brancati (datos de `goroskop.json`) y de las cartas de tarot que se mencionan (incluidas las «descoloridas» de las hermanas Ferri: `taro/17-faded.svg`, `19-faded.svg`).

## Diagramas de ajedrez en los capítulos

Las novelas pueden llevar diagramas de ajedrez como imágenes normales (`![](novels/<novela>/img/NN.png)`). Se dibujan con `python3 tools/diagramas_ajedrez.py novels/<novela>/diagramas.json novels/<novela>/img` (solo necesita Pillow y la fuente DejaVu). Cada entrada del JSON lleva `file`, `fen` (o `startpos`), `moves` (desde→hasta, sin comprobar la legalidad: hay que verificar cada jugada a mano; el enroque son dos jugadas, `e1c1` y `a1d1`), y opcionalmente `hl`/`red` (casillas resaltadas), `arrows`/`red_arrows`, `labels` (texto sobre una casilla) y `caption` (texto debajo del tablero). Ahora: «Стратег» (`novels/strateg/`, RU, 20 capítulos, 17 diagramas): Мигель, el hermano de 12 años de Марк (el detective de «Призрачный поезд»), resuelve casos con ajedrez como el anónimo «Шахматист» y, con Василий, frena un golpe contra el alcalde Альфредо Гранде planeado por Энцо Ферреро en alianza con el Северный город.

## Música de piano con partitura (MIDI)

`tools/piano/` compone y prepara la música de piano de una novela: escribe la partitura como imagen (pentagrama doble, acordes, tempo), el archivo MIDI y el MP3. El MP3 se hace con el piano del banco de sonidos del sistema (`/usr/share/sounds/sf2/TimGM6mb.sf2`), con pedal, un filtro suave para que no suene chillón y reverberación. Las piezas (melodía y acordes por compás) están en `tools/piano/pieces.py`; se generan con `python3 tools/piano/make.py <carpeta>`. En el capítulo van tres párrafos: la partitura `![Партитура «…»](novels/<novela>/img/score-….png)`, el reproductor `!audio[…](novels/<novela>/music/….mp3)` (el MP3 se sube a `luisfader/podcasts`) y el enlace `[🎼 Скачать MIDI «…»](novels/<novela>/midi/….mid)`. Ahora: «Северная любовь: Восточный ветер», una pieza por capítulo (8).

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
2. Teoría: `learn/<idioma>/<unidad>/theory.<idioma-de-explicación>.md` (mismo formato que los capítulos; admite glosas `**palabra**{traducción}`, tablas y ejercicios `[[a|*b|c]]` y `( V / F ){V}`). En capítulos y teoría también hay ejercicios para ordenar palabras tocándolas, `[[= palabra / palabra / palabra => Frase correcta.|Otra frase válida.]]`, y para escribir la respuesta, `[[~ Respuesta.|Otra respuesta válida.]]`; cada ítem va en su propio párrafo y los ítems seguidos comparten el botón «Verifica». Las glosas pueden llevar varias traducciones, `**palabra**{слово|word}`, con el orden de `glossLangs` en el catálogo.
3. Práctica: `learn/<idioma>/<unidad>/practice.<idioma-de-explicación>.json` (mismo formato que los tests de las novelas: `match`, `choice`, `reverse`, `fill`, `build`, `write`, `story`, `tf`).

## Menú «Explorar el sitio»

Los accesos de la portada (Personajes, Blog, Noticias, curso, juego, ajedrez, quest, revista, Mis lecturas) no se muestran como botones sueltos: están en una ventana que se abre con el botón «☰ Explorar el sitio», debajo de la recomendación del día. Cuando el README dice que una sección tiene «botón en la portada», se refiere a una entrada de esta ventana. Para añadir una, agregar un `<a class="hm-item">` dentro de `.hm-list` en `home()` de `index.html`.

## Vista por sagas

En la portada de cada idioma, encima de las novelas, hay un pequeño selector «Clásica / Por sagas». La vista clásica es la de siempre (por defecto). «Por sagas» agrupa las novelas de ese idioma según `series` en `novels/catalog.json`, en el orden de la lista de cada saga, y deja el resto en «Otras novelas». Solo se muestra una saga si tiene al menos dos novelas en ese idioma; si no hay ninguna, el selector no aparece. La elección se guarda en el navegador (`lm:homeView`). **Al añadir una novela de una saga, añadir su slug a la lista `novels` de esa saga, en orden de lectura.**

## Novelas en proceso de escritura

**Toda novela que no esté terminada debe llevar `"wip": true`** en `catalog.json`. Así aparece la etiqueta «En proceso» en la tarjeta y en la ficha, y un aviso de que llegarán capítulos nuevos. Hay que revisarlo cada vez que se añade una novela o capítulos nuevos: si falta el final (o faltan capítulos intermedios), lleva `"wip": true`. Cuando el autor la termine, se quita la marca.

## Brújula de la lectura («Las coordenadas del amor»)

Pestaña «🧭 La brújula» en «Secciones de la novela» (`n.compass` en el catálogo; código en `games/compass/compass.js`; textos en `novels/<slug>/compass.json`). La aguja apunta a la letra del último capítulo leído (C → mapa → E → R → S → C); las palabras de las letras (Esperanza, Riqueza, Sacrificio, Corazón) se revelan solo después del capítulo indicado en `reveal`, sin spoilers. Al volver a abrirla, si se leyó algo nuevo, la aguja gira desde donde estaba («¡La aguja se movió!»); «Recorrer el viaje» repasa el camino. `n.compass` es un objeto {"<capítulo>": "nota"}: al final de esos capítulos aparece un aviso con el enlace a la brújula.

La versión rusa, **«Координаты любви»** (`novels/koordinaty-lyubvi/`), no es una traducción sino una variación: un lugar sin nombre de la taiga siberiana, pirámides escondidas bajo las colinas, los simargly (lobos alados que primero roban y luego se dejan montar), el Gran Polóz, dueño del oro, y una brújula con las letras С·Н·Ж·Б (Сердце, Надежда, Жертва, Богатство). Tiene su propia brújula (`compass.json` con `ui` en ruso; `compass.js` toma los textos de ahí). La portada es tipográfica (dibujada en HTML).

## Sección «Juegos» (`#/juegos`)

Todos los juegos están reunidos en una sola sección del menú: «🎲 Juegos» / «Игры» / «Giochi» / «Games»… (`gamesHub` en `index.html`, textos en `JUEGOS_T`, estilos `.gh-*`). La página muestra:

- **Juegos del sitio:** el juego de preguntas (`#/game`), el ajedrez (`#/ajedrez`) y el quest (`#/quest`), solo los que existen en el idioma.
- **Juegos dentro de las novelas:** las novelas del idioma con minijuegos (pestañas `games`, `riddles`, `who`, `quiz`, `fox`, `cube` de «Secciones de la novela»; lista en `NOVEL_GAME_TABS`). Cada botón abre la novela con esa pestaña ya abierta.

**Juegos del portal** (copiados de `fader1234/juegos`, commit 28716c6) en `games/portal/`: Ladrillos, Bloques, Ajedrez «reta a los personajes», Escoba de 15 y Tatetí. Son páginas propias en es/en/it/ru (`games/portal/games/<id>/index.html`, textos en su `strings.js`, idiomas en `games/portal/js/i18n.js`); se abren con `?lang=` del idioma actual y su botón «← Juegos» vuelve a `#/juegos`. Se registran en `PORTAL_GAMES` de `index.html`.

En el menú lateral ya no hay entradas sueltas para cada juego; los botones «volver» de los juegos llevan a «Todos los juegos». Un juego nuevo se añade en `siteGames` (si es del sitio) o en `NOVEL_GAME_TABS` (si vive dentro de una novela).

## Juego de las novelas

En las secciones ES, RU, IT y EN hay un juego (`#/game`, botón «🎲» en la portada): partidas de 10 preguntas al azar, con corazones, XP, rachas y récord. Mezcla cuatro tipos de preguntas:

- **¿Quién es?** — la descripción (o el retrato) de un personaje de la galería (`characters/catalog.json`, `characters/img/`).
- **¿De qué novela es esta frase?** — una frase real de los capítulos 1–3 de cada novela.
- **¿En qué novela aparece…?** — sale del campo `novels` de cada personaje.
- **La trama** — preguntas escritas a mano en `games/plot.<idioma>.json` (la primera opción es la correcta; comprobar cada dato en el texto).

Las preguntas están en `games/<idioma>.json`. **Al añadir novelas o personajes, regenerarlas:** `python3 tools/juego.py .` Las novelas 18+ quedan fuera del juego. Para dejar fuera otra novela, añadir su slug a `EXCLUDE` en `tools/juego.py`.

## Ajedrez de las novelas

En la misma página del sitio (`#/ajedrez`, botón «♞» en la portada de ES, RU, IT, EN, DE, FR y PT): ajedrez contra la computadora en el que las figuras son personajes de las novelas. El jugador elige su ejército, el de la computadora, el color y uno de cinco niveles (Principiante, Fácil, Intermedio, Difícil, Maestro). Se puede deshacer, pedir una pista y rendirse; la partida en curso, la configuración y las victorias por nivel se guardan en el navegador (`lm:chess:game`, `lm:chess:cfg`, `lm:chess:wins`).

- El código de la página está en `index.html` (`chessPage`, textos en `UI` dentro de ella; estilos `.cz-*`). Motor: `games/chess-engine.js`, sin dependencias; se carga solo al abrir el ajedrez. Corre en un Web Worker para que el tablero no se congele mientras la computadora piensa.
- Ejércitos: seis personajes de un mismo mundo, uno por figura (rey, dama, torre, alfil, caballo, peón). Se definen en `ARMIES` dentro de `tools/ajedrez.py`, junto con el recorte de cada retrato alrededor de la cara (`CROP`).
- **Al cambiar ejércitos, recortes o nombres, regenerar:** `python3 tools/ajedrez.py .` (escribe `games/chess.json` y los retratos redondos de `games/chess/`).

## Quest: El carnaval de la discordia

Aventura de apuntar y hacer clic basada en «Дикий час: Карнавал раздора» (`#/quest`, botón «🐂» en la portada de ES y RU). Luis y Natasha recorren Madrid desde la casa segura hasta la plaza de Colón: escenas con zonas para tocar, inventario, diálogos con opciones y minijuegos (huir del toro de bronce, la Cruz del Sur, el duelo con el torero, el reloj negro, el rodeo sobre Taurán…). Termina donde termina la novela por ahora, con «Continuará…». El progreso se guarda en el navegador (`carnaval:quest:v1`).

- Código: `games/carnaval/quest.js` (motor y escenas, textos en español y ruso con `T(es, ru)`) y `games/carnaval/quest.css`. Se cargan solo al abrir el quest; la ruta y el botón están en `index.html` (`questPage`, `QUEST_BTN`).
- Imágenes: `games/carnaval/img/`. Los fondos van a 1600×900 en JPG; los personajes, en WebP con fondo transparente. Para el final se usan las ilustraciones de la novela (`novels/dikij-chas-karnaval-razdora/img/13-*.jpg`).
- Imágenes opcionales: si se añaden, reemplazan a las de reserva sin tocar el código: `pagina.jpg` (la página del manuscrito), `tauran.jpg`, `boton.jpg` (el botón HACERLO MANSITO), `tauran-manso.jpg`, `objetos.png` (hoja de iconos 4×3 sobre fondo blanco), `mariquita.jpg` y `final.jpg`.

## Noticias políticas

En RU, ES, IT, SR y CS hay un periódico serio (`#/news`, botón «📰» en la portada) con los acontecimientos políticos que ocurren de fondo en las novelas de ese idioma: *Вестник миров* (RU), *Gaceta de los Mundos* (ES), *Gazzetta dei Mondi* (IT), *Весник светова* (SR) y *Kronika světů* (CS). No es satírico: cuenta en tono de noticia lo que pasa en cada novela (gobiernos, consejos, votaciones, leyes, guerras, revueltas, cambios de poder). Cada novela tiene su propio mundo y su propio tiempo, así que la cronología de una novela no coincide con la de otra. El botón aparece solo en los idiomas que tienen periódico; con dos novelas o más, la portada muestra un filtro por novela.

1. Escribir la noticia en `news/<idioma>/<nombre-corto>.md` (mismo formato que los capítulos).
2. Añadirla a `news/catalog.json`:

```json
{"slug": "nombre-corto", "lang": "ru", "date": "2026-11-04", "order": 18, "section": "Некрология",
 "title": "Titular", "deck": "Bajada", "novels": ["siyayushchij-gorizont"], "ch": [17, 18], "lead": true}
```

- `date`: el día en que se publicaron los capítulos de los que sale la noticia (así lo más nuevo queda arriba).
- `ch`: primer y último capítulo de la novela donde ocurre el hecho, con la numeración del sitio (los capítulos con `label` no cuentan). La noticia enlaza al primero.
- `order`: el último capítulo de `ch`; ordena las noticias de una misma fecha.
- `lead: true`: noticia principal de la portada (una por idioma).
- Los datos del periódico (nombre, lema, aviso) están en `papers.<idioma>`.

Reglas: solo hechos que están en el texto, comprobados capítulo por capítulo; nada inventado. Solo personajes de las novelas, nunca personas reales. Las novelas 18+ quedan fuera.

**Al publicar capítulos nuevos** de una novela en RU, ES, IT, SR o CS, revisar si traen acontecimientos políticos de fondo y, si los hay, añadir o actualizar la noticia (por ejemplo, *Дикий час: Карнавал раздора* está en proceso y su noticia dice que se va actualizando). La primera tanda (noviembre de 2026) salió de las 5 novelas actualizadas más recientemente de cada idioma.

## Recomendación del día

En la portada de cada idioma aparece una tarjeta «Recomendación del día» con una novela de ese idioma y el porqué. Los datos están en `recs/calendar.json`:

- `{"date": "MM-DD", "slug": …, "why": …}`: una efeméride o un aniversario que se repite cada año (por ejemplo, el 21 de abril, Natale di Roma → *Antonio e il segreto di Roma*).
- `{"easter": -47, …}`: una fiesta móvil, contada en días desde el Domingo de Pascua (−47 = martes de Carnaval).
- `{"month": 10, …}`: la recomendación de todo el mes, cuando ese día no hay efeméride.

Si no hay nada para ese día, se elige una novela al azar (la misma durante todo el día) y se muestra el principio de su descripción. Las novelas para adultos nunca se recomiendan. El motivo (`why`) se escribe en el idioma de la novela. Antes de añadir una fecha histórica, hay que comprobarla.

## Libros-juego

Novelas en las que el lector elige el camino: `"gamebook": true` en `catalog.json`. Cada sección es un archivo (`01.md`, `02.md`, …) y termina con las opciones como enlaces, `- [Texto de la opción — § 5](#/<slug>/5)`. Las secciones que son un final llevan `"ending": "tragic" | "neutral" | "good" | "happy"` (`happy` solo lo usa *Chi ha visto Sasha?*, para separar los finales felices de los alegres); los finales encontrados se guardan en el navegador. Con `"hideEndingKinds": true` la lista de finales no dice de qué tipo es cada uno, para no adelantar nada (así está *El tren*). Ahora: *Алмазный дождь* (RU), *Тайна в библиотеке* (RU), *El tren* (ES, nivel A2, con glosas en ruso e inglés; ocurre la misma noche que *El tren fantasma*), *Onde d'amore 2: Oscurità e armonia* (IT, nivel A2–B1) y *Chi ha visto Sasha?* (IT, nivel A1).

*Тайна в библиотеке* («Misterio en la biblioteca», RU, 16+): en la noche en que los lugares de Sinea despiertan, el lector entra en la Biblioteca del Amor (la de *Женщина из лепестков*) y cae de novela en novela de la parte rusa. En § 1 elige ser hombre o mujer; el texto va en «вы» para que sirva a los dos, y donde la historia cambia según el género la opción lo dice («Если вы мужчина…»). 70 secciones y 18 finales: 5 trágicos (`tragic`), 5 en los que uno se queda en la novela (`neutral`), 5 en los que la novela pasa a ser suya, 1 de vuelta a casa y 2 de vuelta a casa en pareja (los ocho, `good`). El texto fuente con claves en lugar de números y el script que lo numera no están en el repositorio: si se edita, editar los `.md` directamente y mantener los enlaces `#/tajna-v-biblioteke/N`.

*Onde d'amore 2: Oscurità e armonia* (IT, 12+, `onde-d-amore-2`): continúa *Onde d'amore* y se cruza con *Голос* / *La voix*. Unos tres años después de que Luis se volviera música, Sasha (la de *La voz*, que ahora estudia anomalías; Dima se fue un mes en un barco) invita a Natasha (la Natalia de Verdegrado, narra en primera persona) a su villa en Armonía. Allí le cuenta por primera vez la invasión de Sinea, los delfines, Ael y el Cuore Nero: Natasha nunca se había enterado, porque Sinea quedó aislada del mundo. Armonía tiene cinco barrios —Cuore, Sentimenti, Anima, Mente y Radici— y en el centro el Diapason, la torre de la que sale toda la luz. Cesare Muri, que creció sin barrio, divide el pueblo con la app Recinto (lo contrario de la app Delfino de *Голос*) y bots, y Armonía se queda a oscuras. Siempre hay dos opciones. 51 secciones y 16 finales: 5 tristes (`tragic`, no trágicos de verdad), 5 en los que el problema lo resuelven otros (`neutral`; uno es Oxana con un megáfono), 5 buenos y 1 supremo, § 51 (los seis, `good`). Cada final lo dice en su última línea. El texto fuente con claves y el script que lo numera no están en el repositorio: si se edita, editar los `.md` directamente y mantener los enlaces `#/onde-d-amore-2/N`.

*Chi ha visto Sasha?* (IT, 12+, nivel A1, `chi-ha-visto-sasha`): ocurre en Sinea, en el mundo de *Голос* / *La voix*, después de *Onde d'amore 2*. Narra en primera persona y en presente el detective Vasily (el de *Опасное свидание* y *Алмазный дождь*), que tiene una regla: un año sin amor. Oxana lo contrata porque Sasha desapareció del Faro di Ael la noche del 7 al 8 de noviembre: el faro se apagó siete minutos a las 3:07, quedaron sus zapatos, el diario sin la última página y un mensaje en la app Delfino. La verdad: el pequeño delfín Lume (hijo de Ael y de Nira) la llamó bajo el mar, a la Grotta del Canto, para cantar contra el Seme Nero, un pedazo del Cuore Nero que despertó cuando Ernesto Valli, ex científico del laboratorio secreto, encendió el «Orecchio» en la vieja central. Valli robó la pietra di Ael y quiere el Cuore del Mare; para abrir la porta 7 de los viejos túneles necesita a Maria Conti, la compañera de oficina de Sasha que soñaba con delfines. Vasily empieza a oír la voz de Sasha de noche y se enamora de ella. Dima está en un barco en el Mar del Norte (y allí está Greta, que aparece en varios finales). Italiano A1: presente y passato prossimo, sin imperfecto ni subjuntivo. 49 secciones y 20 finales: 5 trágicos (`tragic`), 5 neutros (`neutral`), 5 alegres en los que el caso se resuelve pero Vasily no se queda con Sasha (`good`; § 46 es el beso en el faro: Sasha ama a Dima, pero lo besa «per un giorno») y 5 felices con Sasha (`happy`; § 48, la pelea con Dima por la foto de la fiesta; § 49, el final supremo). El texto fuente con claves y el script que lo numera no están en el repositorio: si se edita, editar los `.md` directamente y mantener los enlaces `#/chi-ha-visto-sasha/N`. Personajes en italiano: Vasily, Sasha, Oxana, Dima, Ael, Nira, Maria Conti, Lume y Valli.

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

## Audio

Todo el audio del sitio (podcasts, bandas sonoras con sus trozos `.part` y los audios dentro de los capítulos) vive en el repositorio **`luisfader/podcasts`**, publicado en https://luisfader.github.io/podcasts/, con las mismas rutas que tenía acá (`podcasts/…`, `novels/<novela>/music/…`). `index.html` arma las direcciones con `AUDIO_BASE` y `audioUrl()`. Para agregar audio nuevo: subirlo a `luisfader/podcasts` con la ruta de siempre y registrarlo acá como siempre (catálogo, capítulo o `PODCASTS`).
