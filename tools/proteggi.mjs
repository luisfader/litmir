// Protegge con password i capitoli di un romanzo (dal capitolo lock.free + 1 in poi).
// Uso (nella radice del repository):
//   LITMIR_PASSWORD='…' node tools/proteggi.mjs <slug> [libres]     cifra (la prima volta crea "lock" in catalog.json)
//   LITMIR_PASSWORD='…' node tools/proteggi.mjs <slug> --decifra    torna al testo normale
// La password non viene mai scritta nel repository: in catalog.json resta solo il sale (salt).
// Formato: "LITMIR-PW1:" + base64(IV di 12 byte + AES-256-GCM), chiave = PBKDF2-SHA256(password, salt, iter).
import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { webcrypto as wc } from "node:crypto";

const MARK = "LITMIR-PW1:";
const [slug, arg] = process.argv.slice(2);
const undo = process.argv.includes("--decifra");
const pass = process.env.LITMIR_PASSWORD || "";
if (!slug || !pass) { console.error("Uso: LITMIR_PASSWORD='…' node tools/proteggi.mjs <slug> [libres|--decifra]"); process.exit(1); }

const catPath = "novels/catalog.json", catText = readFileSync(catPath, "utf8"), cat = JSON.parse(catText);
const n = cat.novels.find(x => x.slug === slug);
if (!n) { console.error("Romanzo non trovato: " + slug); process.exit(1); }
if (!n.lock) {
  if (undo) { console.error("Questo romanzo non è protetto."); process.exit(1); }
  n.lock = { free: parseInt(arg, 10) || 5, salt: Buffer.from(wc.getRandomValues(new Uint8Array(16))).toString("base64"), iter: 250000 };
  writeFileSync(catPath, JSON.stringify(cat, null, catText.includes('\n  "') ? 2 : undefined) + (catText.endsWith("\n") ? "\n" : ""));
}
const base = await wc.subtle.importKey("raw", new TextEncoder().encode(pass), "PBKDF2", false, ["deriveKey"]);
const key = await wc.subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt: Buffer.from(n.lock.salt, "base64"), iterations: n.lock.iter },
  base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);

let done = 0, skipped = 0;
for (const c of n.chapters.slice(n.lock.free)) {
  const p = `novels/${slug}/${c.file}`; if (!existsSync(p)) continue;
  const s = readFileSync(p, "utf8"), isEnc = s.startsWith(MARK);
  if (undo ? !isEnc : isEnc) { skipped++; continue; }
  if (undo) {
    const b = Buffer.from(s.slice(MARK.length).trim(), "base64");
    writeFileSync(p, Buffer.from(await wc.subtle.decrypt({ name: "AES-GCM", iv: b.subarray(0, 12) }, key, b.subarray(12))));
  } else {
    const iv = wc.getRandomValues(new Uint8Array(12));
    const ct = await wc.subtle.encrypt({ name: "AES-GCM", iv }, key, Buffer.from(s, "utf8"));
    writeFileSync(p, MARK + Buffer.concat([Buffer.from(iv), Buffer.from(ct)]).toString("base64") + "\n");
  }
  done++;
}
console.log(`${undo ? "Decifrati" : "Cifrati"}: ${done} · già pronti: ${skipped}`);
