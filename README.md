# Литературный мир — Robert Fader

Sitio web para leer las novelas de Robert Fader. Cada idioma (RU, ES, IT, EN, FR, TR, PT, CS, SR, EO, ISV) muestra solo las novelas escritas en ese idioma. El español es el idioma por defecto.

**Idiomas ocultos por ahora:** DE, PL, VO, IA, LD, LA, VEC, BG y SW. Sus archivos siguen en el repositorio, pero no aparecen en el sitio. Para volver a mostrar uno, quitar su código de `HIDDEN_LANGS` en `index.html` y de la lista equivalente en `characters.html`.

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

Un idioma también puede ofrecer pódcasts: en el menú de la portada aparece «🎙 Podcast», que abre la página `#/podcast` con los episodios de ese idioma (portada de la novela, descripción, reproductor, «Leggi il romanzo» y «Scarica MP3»). Cada MP3 va en `podcasts/` y se registra en `PODCASTS` dentro de `index.html` (`{it: {…, items: [{file, novel, cover, name, issue, duration, desc, credit}]}}`, el más nuevo primero). Ahora: RU — «Страницы в эфире», выпуск 4: «Грустный город» (18 de noviembre de 2026, 3:14, música de fondo «Impacto de amor», con pausas en las que sube la música), выпуск 3: «Северная любовь: Плач с севера», capítulos 1–2 (18 de noviembre de 2026, 2:39, música de fondo «Плач с Севера 2026»), выпуск 2: «Тайна семьи Фадер» (16 de noviembre de 2026, 3:09, música de fondo «Запах мальбека») y выпуск 1: «Предчувствие» (11 de noviembre de 2026, 3:14, música de fondo «Страсти (Versión de combate)»); IT — «Pagine in onda», episodio 1: «Onde d'amore» (2:48).

## Secciones de la novela (banda sonora, juegos, galería)

En la página de la novela, un botón «Разделы романа» abre hasta tres pestañas:

- **Banda sonora**: sale sola si la novela tiene `soundtrack`.
- **Juegos**: `"runner": 8` en `catalog.json` (número de niveles). Son minijuegos opcionales de correr y saltar (como el dinosaurio de Chrome), uno por cada 5 capítulos; **no bloquean la lectura**. Al final de los capítulos 5, 10, 15… aparece una invitación discreta a jugar. Cada nivel tiene su página: `#/<novela>/juego/<n>`. Los niveles se definen en `LEVELS`, dentro de `games/runner/runner.js`; todo se dibuja con código. Ahora solo «Волны любви: Город без улыбок» tiene juegos (8 niveles).
- **Juego de la moto**: `"moto": {"ch": 10, "title": …, "about": …, "note": …}` en `catalog.json`. Un solo juego sobre un capítulo, con su página `#/<novela>/juego/moto`; al final del capítulo `ch` aparece la invitación (`note`). Código: `games/moto/moto.js` y `games/moto/moto.css` (vista desde arriba, todo dibujado con código). Ahora: «Грустный город», «Погоня по Синее» (capítulo 10): Franco huye en la moto secreta del padre, sigue a Kiara, la ayuda a saltar a su moto cuando la policía le revienta la rueda y escapan juntos hasta el túnel. Tres etapas; si se pierde, se puede seguir desde la última etapa alcanzada. Las «смешинки» (caritas) cargan una broma que desconcierta a la policía.
- **Otra carrera de motos con la misma página**: dentro de `"moto"` se pueden poner `"js"` (script del juego), `"api"` (nombre del objeto en `window`), `"css"` (estilos extra; `games/moto/moto.css` se carga siempre como base), `"icon"` y `"bg"` (ícono y fondo de la tarjeta). Ahora: «Ti amo in silenzio» — «La Corsa del Faro» (capítulo 1; textos en italiano y en ruso según `lang`), `games/faro/faro.js` y `games/faro/faro.css`: carrera arcade en pseudo-3D por la ruta de la costa de Sinea hasta el faro. Fabrizio sale último con la moto verde del abuelo, adelanta en las curvas (la moto vieja es más ágil, las grandes son más rápidas en las rectas) y al final pelea con Lucia, que le cierra el paso; en la Curva del Diablo hay arena, a Lucia la moto le patina medio segundo y se enciende el botón «Газ!». Gana solo quien llega primero. El mejor tiempo se guarda en `faro:best:<novela>`.
- **Galería**: `"gallery": true` y un archivo `novels/<novela>/gallery.json` con `[{ch, src, th}]` (capítulo, imagen, miniatura en `img/thumbs/`). El lector solo ve las imágenes de los capítulos que ya leyó; las demás aparecen con candado.
- **Mapa de Belgrado** (`"belgradeMap": true`, «Дикий час»): `games/maps/belgrade.js` dibuja Belgrado de noche con 12 lugares de la novela y 2 «fuera del mapa» (el departamento de Natasha y el búnker). Al pasar el mouse o el dedo aparece el nombre; al tocar se abren las escenas (con ilustraciones de `img/`) y la explicación real del lugar. Las escenas de capítulos no leídos quedan bloqueadas. Zedanj es un lugar de la novela y está ubicado de forma aproximada.
- **Test con título propio**: `"quiz": true` usa `novels/<novela>/quiz.json` (preguntas con opciones y puntos, y veredictos por puntaje mínimo). Con `"quizTitle"` y `"quizIcon"` la pestaña muestra ese nombre en lugar de «Test». Ahora: «La chica del retrato» — «¿Qué tan buen hacker sos?» (10 preguntas de dos opciones, 6 resultados).
- **Cubo de Rubik**: `"cube": true` en `catalog.json`. Un cubo 3×3×3 real con dos modos a elegir: **clásico** (colores normales, sin dibujos; seis niveles con 1…6 giros de mezcla y una «Свободная игра» con 20 giros; hay que armar el cubo entero) y **con dibujos** (una imagen en cada cara; seis combinaciones, y en cada una hay que armar una cara para que aparezca el personaje). Los datos (caras, nombres, textos, cantidad de giros de mezcla) están en `DATA`, dentro de `games/cube/cube.js`; las imágenes (480×480) en `games/cube/img/`. El progreso se guarda en el navegador (`cube:<novela>` para los dibujos, `cubeC:<novela>` para el clásico). Ahora: «Дикий час» — Луис, Наташа, София, Змай, Белград, Луис и Наташа.
- **Mapa del mundo**: una sección en `"sections"` con `"style": "map"` y un archivo `.json` en la carpeta de la novela: `intro`, `home` (el lugar desde el que se miden las distancias), `places` (`id`, `icon`, `name`, `x`, `y` en un marco de 1000×780, `at` = capítulo desde el que se ve, `dist`, `what`, `who`, `secrets: [{at, text}]`, opcional `"lp": "up"` para poner el nombre encima del punto) y `edges` (flechas al borde: `icon`, `name`, `x`, `y`, `at`, `text`). La distancia en el mapa es la distancia aproximada en el mundo; debajo hay una escala «qué tan lejos». El dibujo (río, bosque, desierto, mar, ruinas, foso) está en `mapHTML()` de `index.html`. Ahora: «Предчувствие» — `novels/predchuvstvie/karta.json` (Некрология lo más lejos, el campamento de los salvajes a mitad de camino, el mar lejos pero menos que Некрология). Cada novela tiene su propio mapa, aunque sea la misma historia en otro idioma: las versiones son distintas. Campos extra: `art` (`utopia` = desierto de Предчувствие, con anillos, rutas y escala de distancias; `venice` = Venecia con la laguna), `theme` (`night`, `carta`…), `layers: true` (botones «sobre / bajo el agua»; los lugares con `"layer": "under"` solo se ven abajo), `legend` (lista de todos los lugares; en el mapa el nombre sale solo al tocar el punto), `nowhere` (título de la lista de lugares sin `x`/`y`, sin dirección exacta) y `net` (líneas de una red: `from` → `to`, aparecen en `at` y se encienden en `glow`). Ahora también: «Венецианская маска» — `novels/venecianskaya-maska/karta.json` (Venecia nocturna, red de cartas venecianas, Сан-Микеле-дель-Абиссо bajo la isla-cementerio) y «Maschera di Venezia» — `novels/maschera-di-venezia/mappa.json` (carta náutica antigua, la Loggia, las mazmorras bajo el Palazzo Ducale).
- **Enciclopedia**: una sección propia en `"sections"` con `"style": "encyclopedia"` y un archivo `.md` en la carpeta de la novela. Formato: `## 🚂 Categoría`, `### Término`, una línea `@NN.md` (capítulo a partir del cual se ve la entrada), el primer párrafo en `*cursiva*` es la definición corta, los párrafos que empiezan con `{NN.md}` se abren después de ese capítulo, y una línea `→ Término A · Término B` crea los enlaces «Ver también». Tiene buscador, filtro por categorías, índice alfabético y barra de progreso; nada se muestra antes de que el lector llegue al capítulo. Ahora: «Энциклопедия Призрачного поезда» (`novels/prizrachnyj-poezd/enciklopediya.md`, 91 entradas).

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
