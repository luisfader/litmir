// Cifra los capítulos y unidades que solo pueden leer los usuarios registrados.
// Uso (en la raíz del repositorio):  LITMIR_KEY='<llave base64>' node tools/cifrar.mjs
//   --descifrar   hace lo contrario (vuelve a texto normal).
// Qué se cifra (lo mismo que bloquea index.html):
//   - novels: entradas con número de capítulo > FREE_CHAPTERS (prólogos y dosieres antes del 5 quedan libres)
//   - learn: todas las unidades con n > FREE_UNITS, salvo los cursos con "free": true (quedan libres)
// Formato: "LITMIR-ENC1:" + base64(IV de 12 bytes + AES-256-GCM). Lo ya cifrado no se toca.
import { readFileSync, writeFileSync, readdirSync, existsSync } from "node:fs";
import { webcrypto as wc } from "node:crypto";

const FREE_CHAPTERS = 4, FREE_UNITS = 3, ENC = "LITMIR-ENC1:";
const undo = process.argv.includes("--descifrar");
const raw = Buffer.from((process.env.LITMIR_KEY || "").trim(), "base64");
if (raw.length !== 32) { console.error("Falta LITMIR_KEY (llave AES-256 en base64)."); process.exit(1); }
const key = await wc.subtle.importKey("raw", raw, "AES-GCM", false, ["encrypt", "decrypt"]);

const files = [];
const novels = JSON.parse(readFileSync("novels/catalog.json", "utf8")).novels;
for (const n of novels) {
  let no = 0;
  n.chapters.forEach(c => { if (!c.label) no++; if (no > FREE_CHAPTERS) files.push(`novels/${n.slug}/${c.file}`); });
}
const courses = JSON.parse(readFileSync("learn/catalog.json", "utf8")).courses;
for (const c of courses) if (!c.free) for (const u of c.units) if (u.n > FREE_UNITS) {
  const dir = `learn/${c.lang}/${u.id}`;
  if (existsSync(dir)) for (const f of readdirSync(dir)) if (/\.(md|json)$/.test(f)) files.push(`${dir}/${f}`);
}

let done = 0, skipped = 0, missing = 0;
for (const p of [...new Set(files)]) {
  if (!existsSync(p)) { missing++; continue; }
  const s = readFileSync(p, "utf8"), isEnc = s.startsWith(ENC);
  if (undo ? !isEnc : isEnc) { skipped++; continue; }
  if (undo) {
    const b = Buffer.from(s.slice(ENC.length).trim(), "base64");
    const pt = await wc.subtle.decrypt({ name: "AES-GCM", iv: b.subarray(0, 12) }, key, b.subarray(12));
    writeFileSync(p, Buffer.from(pt));
  } else {
    const iv = wc.getRandomValues(new Uint8Array(12));
    const ct = await wc.subtle.encrypt({ name: "AES-GCM", iv }, key, Buffer.from(s, "utf8"));
    writeFileSync(p, ENC + Buffer.concat([Buffer.from(iv), Buffer.from(ct)]).toString("base64") + "\n");
  }
  done++;
}
console.log(`${undo ? "Descifrados" : "Cifrados"}: ${done} · ya estaban: ${skipped} · no encontrados: ${missing}`);
