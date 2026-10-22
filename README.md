# Литературный мир — Robert Fader

Sitio web para leer las novelas de Robert Fader. Cada idioma (ES, IT, EN, DE, FR, TR, PT, CS, PL, SR, EO, ISV, VO, IA, LD) muestra solo las novelas escritas en ese idioma. El español es el idioma por defecto.

**Este sitio no tiene nada en ruso.** Las novelas rusas están en otro sitio, separado: https://luisfader.github.io/litmir2/ (repositorio `luisfader/litmir2`). Lo único que queda es una redirección invisible: los enlaces viejos a novelas rusas (`#/<novela-rusa>`) y `?lang=ru` llevan allí (lista `RU_SLUGS` en `index.html`). Los cursos se explican en inglés (el de inglés, en español).

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

## Cursos de idiomas

Cada idioma puede tener su curso (`#/learn`), con la teoría explicada en otros idiomas que el estudiante elige (por ejemplo, español con explicaciones en ruso o inglés). El botón aparece en la portada del idioma solo si existe un curso.

1. Agregar la unidad en `learn/catalog.json` (curso por `lang`, idiomas de explicación en `help`).
2. Teoría: `learn/<idioma>/<unidad>/theory.<idioma-de-explicación>.md` (mismo formato que los capítulos; admite glosas `**palabra**{traducción}`, tablas y ejercicios `[[a|*b|c]]` y `( V / F ){V}`).
3. Práctica: `learn/<idioma>/<unidad>/practice.<idioma-de-explicación>.json` (mismo formato que los tests de las novelas: `match`, `choice`, `reverse`, `fill`, `build`, `write`, `story`, `tf`).

## Novelas para adultos

Añadir `"adult": true` a la novela en `catalog.json`: aparece la marca 18+ y se pide confirmación de edad antes de leer.

## Traducciones

Si una novela existe en otro idioma, añadir `"translations": {"es": "slug-de-la-version-espanola"}`.

## Registro con Google

Los lectores pueden entrar con su cuenta de Google (botón «Entrar» arriba a la derecha). Firebase, proyecto `litmir2026`.

- **Sin registrarse:** los capítulos 1 a 4 de cada novela (y los prólogos o dosieres que haya antes del 5) y las unidades 1 a 3 del curso. El test de nivel es libre.
- **Con registro:** todo lo demás. Para cambiar el límite, editar `FREE_CHAPTERS` y `FREE_UNITS` en `index.html`.
- El progreso (capítulos leídos, último capítulo, notas de tests y cursos) se guarda en la cuenta y se sincroniza entre dispositivos. Tema, tamaño de letra, volumen e idioma quedan en cada dispositivo.
- Si Firebase no carga, nada queda bloqueado.
- Los capítulos 5+ y las unidades 4+ están **cifrados** en este repositorio (empiezan con `LITMIR-ENC1:`). La llave está en Firestore (`config/key`, campo `k`), que solo pueden leer los usuarios con sesión; la web descifra en el navegador.
- **Al agregar capítulos o unidades nuevas:** agregarlos en texto normal, actualizar el `catalog.json` y ejecutar `LITMIR_KEY='<llave>' node tools/cifrar.mjs`. Cifra lo que corresponda y no toca lo ya cifrado (`--descifrar` hace lo contrario). La llave no está en el repositorio.
