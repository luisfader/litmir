# Литературный мир — Robert Fader

Sitio web para leer las novelas de Robert Fader. Cada idioma (RU, ES, IT, EN, DE, FR, TR, PT, CS, PL, SR, EO, ISV, VO, IA, LD, LA) muestra solo las novelas escritas en ese idioma. El español es el idioma por defecto.

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

Formato del texto: párrafos separados por una línea en blanco, `*cursiva*`, `**negrita**`, `***` para un cambio de escena.

## Publicación



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
