/* Portadas generadas para el catálogo de la Biblioteca del Amor.
   Cada libro de libros.json trae cover = {c1, c2, ink, motif, style}.
   Si un libro trae cover.img (ruta a una imagen), se usa la imagen en lugar de la portada generada. */
(function(){
const S = 'fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"';
/* Motivos dibujados en una caja de 100×100 */
const M = {
  heart:`<path ${S} d="M50 82C22 62 14 46 18 34c4-12 20-16 32-2 12-14 28-10 32 2 4 12-4 28-32 48z"/><path ${S} d="M50 70c-14-10-20-19-18-27"/>`,
  wave:`<path ${S} d="M10 40q10-10 20 0t20 0 20 0 20 0"/><path ${S} d="M10 55q10-10 20 0t20 0 20 0 20 0"/><path ${S} d="M10 70q10-10 20 0t20 0 20 0 20 0"/>`,
  scales:`<path ${S} d="M50 18v62M30 80h40M22 32h56"/><path ${S} d="M22 32l-10 22h20zM78 32l-10 22h20z"/><path ${S} d="M12 54q10 8 20 0M68 54q10 8 20 0"/><circle cx="50" cy="16" r="3" fill="currentColor"/>`,
  hourglass:`<path ${S} d="M28 14h44M28 86h44M32 14c0 22 36 28 36 36S32 64 32 86M68 14c0 22-36 28-36 36s36 14 36 36"/><path d="M40 78q10-10 20 0z" fill="currentColor"/>`,
  flask:`<path ${S} d="M40 14h20M44 14v22L24 76q-4 10 8 10h36q12 0 8-10L56 36V14"/><path ${S} d="M32 64h36"/><circle cx="44" cy="74" r="3" fill="currentColor"/><circle cx="56" cy="70" r="2" fill="currentColor"/>`,
  drop:`<path ${S} d="M50 14C36 36 28 48 28 60a22 22 0 0044 0c0-12-8-24-22-46z"/><path ${S} d="M40 62a10 10 0 0010 10"/>`,
  sun:`<circle ${S} cx="50" cy="50" r="16"/><path ${S} d="M50 14v12M50 74v12M14 50h12M74 50h12M25 25l8 8M67 67l8 8M75 25l-8 8M33 67l-8 8"/>`,
  stars:`<path d="M50 18l5 14 15 1-12 9 4 15-12-8-12 8 4-15-12-9 15-1z" fill="currentColor"/><path d="M22 62l2.5 7 7.5.5-6 4.5 2 7.5-6-4-6 4 2-7.5-6-4.5 7.5-.5zM78 58l2.5 7 7.5.5-6 4.5 2 7.5-6-4-6 4 2-7.5-6-4.5 7.5-.5z" fill="currentColor"/><path ${S} d="M24 70L50 37 78 66" stroke-dasharray="2 5"/>`,
  snow:`<path ${S} d="M50 14v72M19 32l62 36M81 32L19 68"/><path ${S} d="M42 20l8 8 8-8M42 80l8-8 8 8M20 44l11-3-3-11M80 56l-11 3 3 11M80 44l-11-3 3-11M20 56l11 3-3 11"/>`,
  galaxy:`<path ${S} d="M50 50c0-8 12-10 16-2 6 12-8 26-22 22-20-6-18-34 2-40 26-8 44 20 30 40"/><path ${S} d="M50 50c0 8-12 10-16 2-6-12 8-26 22-22"/><circle cx="50" cy="50" r="3" fill="currentColor"/><circle cx="22" cy="24" r="1.6" fill="currentColor"/><circle cx="82" cy="78" r="1.6" fill="currentColor"/>`,
  cross:`<circle cx="50" cy="18" r="5" fill="currentColor"/><circle cx="50" cy="82" r="6" fill="currentColor"/><circle cx="24" cy="48" r="4.5" fill="currentColor"/><circle cx="74" cy="44" r="4" fill="currentColor"/><circle cx="60" cy="60" r="2.5" fill="currentColor"/><path ${S} d="M50 24v52M28 48l42-4" stroke-dasharray="2 6"/>`,
  sphinx:`<path ${S} d="M14 80h72M20 80V62q0-8 10-10h26l6-14q2-14 12-16 10 2 10 16v40"/><path ${S} d="M64 30q10-6 20 0M68 38h12M70 46h8"/><path ${S} d="M30 80v-12M46 80v-12"/>`,
  eye:`<path ${S} d="M10 50q40-40 80 0-40 40-80 0z"/><circle ${S} cx="50" cy="50" r="13"/><circle cx="50" cy="50" r="5" fill="currentColor"/><path ${S} d="M50 14v8M28 20l4 7M72 20l-4 7"/>`,
  ouroboros:`<path ${S} d="M74 34A30 30 0 1 0 80 52"/><path ${S} d="M80 52l-10 2 4-10z" fill="currentColor"/><path ${S} d="M74 34l6-6M74 34l8 2"/><circle cx="50" cy="50" r="4" fill="currentColor"/>`,
  flame:`<path ${S} d="M50 86c-18 0-26-12-24-26 2-12 12-18 14-32 10 8 12 18 10 26 6-4 8-10 8-16 10 10 16 20 14 30-2 12-10 18-22 18z"/><path ${S} d="M50 86c-6 0-10-6-8-12 2-6 8-8 8-16 6 6 10 12 8 18-1 6-4 10-8 10z"/>`,
  notes:`<path ${S} d="M36 70V26l38-8v44"/><ellipse cx="29" cy="70" rx="8" ry="6" fill="currentColor"/><ellipse cx="67" cy="62" rx="8" ry="6" fill="currentColor"/><path ${S} d="M36 36l38-8"/>`,
  crown:`<path ${S} d="M18 70l-4-36 20 18 16-28 16 28 20-18-4 36z"/><path ${S} d="M18 80h64"/><circle ${S} cx="50" cy="50" r="22" stroke-dasharray="1 6"/>`,
  blank:`<rect x="24" y="18" width="52" height="64" rx="3" fill="none" stroke="currentColor" stroke-width="1.6" stroke-dasharray="4 4"/><path d="M38 50h24" stroke="currentColor" stroke-width="1.6" stroke-dasharray="2 4"/>`,
  horns:`<path ${S} d="M50 70c-8 0-14-8-14-18s6-16 14-16 14 6 14 16-6 18-14 18z"/><path ${S} d="M38 42C24 38 16 26 18 12c6 12 14 18 24 20M62 42c14-4 22-16 20-30-6 12-14 18-24 20"/><circle cx="44" cy="52" r="2" fill="currentColor"/><circle cx="56" cy="52" r="2" fill="currentColor"/>`,
  radio:`<rect ${S} x="18" y="38" width="64" height="42" rx="6"/><circle ${S} cx="38" cy="59" r="10"/><path ${S} d="M60 50h14M60 58h14M60 66h14M30 38l26-22"/><path ${S} d="M62 14q8 4 10 12M68 8q12 6 14 18"/>`,
  telescope:`<path ${S} d="M16 52l52-26 6 12-52 26z"/><path ${S} d="M68 26l10-4 6 12-10 4M40 58l-12 28M46 56l14 30"/><circle cx="80" cy="14" r="2" fill="currentColor"/><circle cx="90" cy="26" r="1.5" fill="currentColor"/>`,
  bear:`<circle cx="20" cy="30" r="3" fill="currentColor"/><circle cx="34" cy="34" r="3" fill="currentColor"/><circle cx="46" cy="40" r="3" fill="currentColor"/><circle cx="58" cy="44" r="3" fill="currentColor"/><circle cx="62" cy="62" r="3" fill="currentColor"/><circle cx="84" cy="64" r="3" fill="currentColor"/><circle cx="82" cy="44" r="3" fill="currentColor"/><path ${S} d="M20 30l14 4 12 6 12 4 24 0 2 20-22-2-4-18" stroke-width="1.4"/>`,
  planet:`<circle ${S} cx="50" cy="50" r="20"/><ellipse ${S} cx="50" cy="50" rx="40" ry="11" transform="rotate(-18 50 50)"/><circle cx="20" cy="20" r="2" fill="currentColor"/><circle cx="84" cy="80" r="1.6" fill="currentColor"/>`,
  fish:`<path ${S} d="M14 34q20-14 40 0t30 0M16 66q20 14 40 0t30 0"/><path ${S} d="M84 34l6-8M84 34l6 6M86 66l6 8M86 66l6-6"/><path ${S} d="M54 34q-10 16 0 32" stroke-dasharray="3 4"/>`,
  mars:`<circle ${S} cx="42" cy="58" r="22"/><path ${S} d="M58 42l22-22M62 20h18v18"/>`,
  knight:`<path ${S} d="M30 84h44M34 84l4-14h28l2 14"/><path ${S} d="M38 70c-4-14 2-22 10-28-8-2-14 2-18-2 2-10 10-20 20-22l2-6 6 8c12 6 16 22 12 50"/><circle cx="46" cy="30" r="2.4" fill="currentColor"/>`,
  board:`<path ${S} d="M20 20h60v60H20z"/><path d="M20 20h15v15H20zM50 20h15v15H50zM35 35h15v15H35zM65 35h15v15H65zM20 50h15v15H20zM50 50h15v15H50zM35 65h15v15H35zM65 65h15v15H65z" fill="currentColor" opacity=".8"/>`,
  lock:`<rect ${S} x="24" y="44" width="52" height="40" rx="6"/><path ${S} d="M34 44V32a16 16 0 0132 0v12"/><circle cx="50" cy="62" r="5" fill="currentColor"/><path ${S} d="M50 66v8"/>`,
  key:`<circle ${S} cx="30" cy="50" r="14"/><circle cx="30" cy="50" r="4" fill="currentColor"/><path ${S} d="M44 50h42M74 50v12M84 50v8"/>`,
  mask:`<path ${S} d="M12 38q38-14 76 0-2 26-24 28-8 0-14-10-6 10-14 10-22-2-24-28z"/><path ${S} d="M28 46q6-6 12 0M60 46q6-6 12 0"/><path ${S} d="M88 38l6-12M12 38l-4-14"/>`,
  pan:`<ellipse ${S} cx="46" cy="56" rx="34" ry="14"/><path ${S} d="M80 52l16-6"/><circle cx="32" cy="54" r="3" fill="currentColor"/><circle cx="46" cy="50" r="3" fill="currentColor"/><circle cx="58" cy="58" r="3" fill="currentColor"/><path ${S} d="M36 32q4-8 0-14M48 30q4-8 0-14M60 32q4-8 0-14"/>`,
  footsteps:`<ellipse cx="34" cy="74" rx="7" ry="10" fill="currentColor"/><ellipse cx="56" cy="54" rx="7" ry="10" fill="currentColor" opacity=".75"/><ellipse cx="38" cy="34" rx="7" ry="10" fill="currentColor" opacity=".5"/><ellipse cx="62" cy="16" rx="6" ry="8" fill="currentColor" opacity=".3"/>`,
  train:`<rect ${S} x="22" y="20" width="56" height="52" rx="10"/><path ${S} d="M22 46h56M36 20v26M64 20v26"/><circle cx="36" cy="60" r="4" fill="currentColor"/><circle cx="64" cy="60" r="4" fill="currentColor"/><path ${S} d="M32 72l-10 14M68 72l10 14M30 82h40"/>`,
  cupcake:`<path ${S} d="M28 54h44l-6 30H34z"/><path ${S} d="M26 54q-4-18 14-18 0-14 10-14t10 14q18 0 14 18"/><path ${S} d="M40 62l2 18M50 62v18M60 62l-2 18"/><circle cx="50" cy="20" r="3" fill="currentColor"/>`,
  house:`<path ${S} d="M18 50L50 22l32 28M26 44v40h48V44"/><path ${S} d="M42 84V64h16v20"/><path ${S} d="M60 24v10" /><path ${S} d="M14 92h72" stroke-dasharray="3 5"/>`,
  rabbit:`<path ${S} d="M40 44c-6-10-8-30-2-32s10 16 10 30M58 42c2-12 8-30 14-28s-2 22-10 32"/><ellipse ${S} cx="52" cy="62" rx="22" ry="20"/><circle cx="44" cy="58" r="2.4" fill="currentColor"/><circle cx="60" cy="58" r="2.4" fill="currentColor"/><path ${S} d="M48 68q4 4 8 0"/>`,
  fox:`<path ${S} d="M22 22l14 22h28l14-22-4 30-24 26-24-26z"/><circle cx="40" cy="52" r="2.4" fill="currentColor"/><circle cx="60" cy="52" r="2.4" fill="currentColor"/><path d="M46 64h8l-4 5z" fill="currentColor"/>`,
  car:`<path ${S} d="M14 64h72v-12l-10-4-10-14H34l-10 14-10 4z"/><circle ${S} cx="30" cy="66" r="7"/><circle ${S} cx="70" cy="66" r="7"/><path ${S} d="M38 36v12M60 36v12"/><path ${S} d="M78 80q4-8 10-6" /><circle cx="86" cy="82" r="4" fill="currentColor"/>`,
  flower:`<circle cx="50" cy="40" r="6" fill="currentColor"/><path ${S} d="M50 34q-6-14 0-20 6 6 0 20M56 40q14-6 20 0-6 6-20 0M44 40q-14-6-20 0 6 6 20 0M50 46q-6 14 0 20 6-6 0-20"/><path ${S} d="M50 66v22M50 78q-12-4-16-12M50 82q10-4 14-10"/>`,
  map:`<path ${S} d="M14 26l22-8 28 8 22-8v56l-22 8-28-8-22 8z"/><path ${S} d="M36 18v56M64 26v56"/><path ${S} d="M22 56q14-14 26 0t26-6" stroke-dasharray="3 4"/>`,
  crowd:`<circle ${S} cx="50" cy="36" r="9"/><path ${S} d="M32 76q0-24 18-24t18 24"/><circle ${S} cx="24" cy="44" r="7"/><path ${S} d="M10 78q0-18 14-18"/><circle ${S} cx="76" cy="44" r="7"/><path ${S} d="M90 78q0-18-14-18"/>`,
  quill:`<path ${S} d="M80 14C50 18 30 42 24 76c14-24 30-34 48-40-12 0-20 2-28 8 10-16 24-24 36-30z"/><path ${S} d="M24 76l-6 12M14 88h32"/>`,
  feather:`<path ${S} d="M50 88V30M50 30C36 40 30 56 34 74 42 68 48 58 50 50 52 58 58 68 66 74 70 56 64 40 50 30z"/><path ${S} d="M50 12v18"/>`,
  horse:`<path ${S} d="M26 82l6-22c-6-6-8-16-4-24 6-12 20-18 32-14l12-8-2 12c8 8 10 20 6 30l-10-2-6-10-10 6 4 32"/><circle cx="56" cy="32" r="2.4" fill="currentColor"/><path ${S} d="M40 36q-6-8-2-16"/>`,
  mountain:`<path ${S} d="M8 80l28-40 14 18 12-24 30 46z"/><path ${S} d="M56 46l6-12 8 12-6 4z" /><circle ${S} cx="74" cy="22" r="7"/>`,
  owl:`<path ${S} d="M26 30l10 8h28l10-8v40q0 16-24 16T26 70z"/><circle ${S} cx="40" cy="48" r="8"/><circle ${S} cx="60" cy="48" r="8"/><circle cx="40" cy="48" r="3" fill="currentColor"/><circle cx="60" cy="48" r="3" fill="currentColor"/><path d="M46 58h8l-4 6z" fill="currentColor"/>`,
  jester:`<path ${S} d="M30 56q-8-30-20-26 14 6 20 26M70 56q8-30 20-26-14 6-20 26M50 54q0-34-6-40 12 6 6 40"/><circle cx="10" cy="30" r="4" fill="currentColor"/><circle cx="90" cy="30" r="4" fill="currentColor"/><circle cx="44" cy="14" r="4" fill="currentColor"/><path ${S} d="M28 56h44M32 56q0 28 18 28t18-28"/><path ${S} d="M42 70q8 6 16 0"/>`,
  cannon:`<path ${S} d="M20 54l52-20 6 14-52 20z"/><circle ${S} cx="34" cy="72" r="12"/><circle cx="34" cy="72" r="3" fill="currentColor"/><circle cx="84" cy="30" r="5" fill="currentColor"/><path ${S} d="M10 86h60"/>`,
  laurel:`<path ${S} d="M50 84C26 76 18 56 22 30M50 84C74 76 82 56 78 30"/><path d="M22 36q-8-4-8-12 8 2 8 12zM20 50q-10-2-12-10 10 0 12 10zM24 64q-10 0-14-8 10-2 14 8zM78 36q8-4 8-12-8 2-8 12zM80 50q10-2 12-10-10 0-12 10zM76 64q10 0 14-8-10-2-14 8z" fill="currentColor"/>`,
  snake:`<path ${S} d="M70 22q-20-8-30 4t6 22 10 22-16 14q-14-2-16-14"/><circle cx="68" cy="22" r="6" fill="currentColor"/><path ${S} d="M74 22l8-2M74 22l8 4"/>`,
  scroll:`<path ${S} d="M30 20h44q8 0 8 8t-8 8H30M30 20q-8 0-8 8v44q0 8 8 8h44q-8 0-8-8V28"/><path ${S} d="M36 46h22M36 56h22M36 66h14"/>`,
  clock:`<circle ${S} cx="50" cy="50" r="32"/><path ${S} d="M50 28v22l14 10"/><path ${S} d="M50 18v4M50 78v4M18 50h4M78 50h4"/>`,
  lighthouse:`<path ${S} d="M40 84l4-46h12l4 46zM38 38h24M44 38V28h12v10M50 20v8"/><path ${S} d="M56 30l30-10M56 32l30 6M44 30l-30-10M44 32l-30 6" stroke-dasharray="3 4"/><path ${S} d="M20 84q15-6 30 0t30 0"/>`,
  moto:`<circle ${S} cx="24" cy="66" r="13"/><circle ${S} cx="78" cy="66" r="13"/><path ${S} d="M24 66l16-22h18l10 22M58 44l8-14h10M40 44l-4-8h-10M48 56h20"/><path ${S} d="M8 88h86" stroke-dasharray="4 4"/><path ${S} d="M60 22l6-10 6 6 8-8" />`
};
/* Ornamentos de esquina para las tapas de cuero */
const corner = (x, y, sx, sy) => `<path transform="translate(${x} ${y}) scale(${sx} ${sy})" d="M0 0h18M0 0v18M5 5q8 0 8 8M5 5h6M5 5v6" fill="none" stroke="currentColor" stroke-width="1.2"/>`;

function wrap(title, max){
  const words = title.split(/\s+/); const lines = []; let cur = "";
  for (const w of words){ if ((cur + " " + w).trim().length > max && cur){ lines.push(cur); cur = w; } else cur = (cur + " " + w).trim(); }
  if (cur) lines.push(cur); return lines;
}
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;","\"":"&quot;"}[c]));
let uid = 0;
window.bookCover = function(b, opts){
  opts = opts || {};
  const c = b.cover || {}; if (c.img) return `<img class="cover-img" src="${esc(c.img)}" alt="">`;
  const id = "cv" + (++uid), st = c.style || "leather", ink = c.ink || "#f0d48a";
  // El título visible en la tapa: el original, como es el objeto dentro de la novela
  let t = b.title; const main = t.split(/[:.,]\s| или | o | – | — /)[0];
  const short = main.length < t.length && t.length > 48 ? main : t;
  const L = short.length, max = L > 70 ? 17 : L > 40 ? 15 : L > 22 ? 13 : 11;
  const lines = wrap(short, max).slice(0, 6), fs = lines.length > 4 ? 15 : lines.length > 2 ? 17 : L < 12 ? 22 : 19;
  const ty = 214 - (lines.length - 1) * fs * .55;
  const font = st === "kids" ? "'Inter',system-ui,sans-serif" : st === "modern" ? "'Inter',system-ui,sans-serif" : "'Cormorant Garamond','PT Serif',Georgia,serif";
  const weight = st === "kids" || st === "modern" ? 700 : 600;
  const titleSvg = lines.map((l, i) => `<tspan x="100" y="${(ty + i * fs * 1.08).toFixed(1)}">${esc(l)}</tspan>`).join("");
  const author = b.author && b.author !== "—" ? (b.author.length > 26 ? b.author.slice(0, 25) + "…" : b.author) : "";
  let bg = `<defs><linearGradient id="${id}g" x1="0" y1="0" x2=".6" y2="1"><stop offset="0" stop-color="${c.c1}"/><stop offset="1" stop-color="${c.c2}"/></linearGradient>
    <radialGradient id="${id}r" cx=".3" cy=".2" r="1"><stop offset="0" stop-color="#fff" stop-opacity=".22"/><stop offset=".6" stop-color="#fff" stop-opacity="0"/></radialGradient>
    <filter id="${id}n"><feTurbulence type="fractalNoise" baseFrequency=".9" numOctaves="2" stitchTiles="stitch"/><feColorMatrix values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  0 0 0 .18 0"/><feComposite in2="SourceGraphic" operator="in"/></filter></defs>
    <rect width="200" height="300" rx="5" fill="url(#${id}g)"/>`;
  let deco = "";
  if (st === "leather" || st === "relic" || st === "burnt"){
    deco += `<rect width="200" height="300" rx="5" filter="url(#${id}n)" fill="#000"/>
      <rect x="11" y="11" width="178" height="278" rx="3" fill="none" stroke="currentColor" stroke-width="1.3" opacity=".8"/>
      <rect x="16" y="16" width="168" height="268" rx="2" fill="none" stroke="currentColor" stroke-width=".6" opacity=".6"/>
      ${corner(16,16,1,1)}${corner(184,16,-1,1)}${corner(16,284,1,-1)}${corner(184,284,-1,-1)}
      <path d="M60 260h80" stroke="currentColor" stroke-width=".8" opacity=".7"/><circle cx="100" cy="260" r="2" fill="currentColor"/>`;
  }
  if (st === "relic") deco += `<path d="M30 40l18 22-6 20 14 14M150 30l-10 26 12 18M40 230l20-14 4 18" fill="none" stroke="#000" stroke-opacity=".28" stroke-width="1"/>`;
  if (st === "burnt") deco += `<rect width="200" height="300" rx="5" fill="none" stroke="#000" stroke-width="18" opacity=".55"/><path d="M0 250q30-10 40 10t40 0 50 10 70-10V300H0z" fill="#000" opacity=".5"/>`;
  if (st === "paper" || st === "torn"){
    deco += `<rect width="200" height="300" rx="5" filter="url(#${id}n)" fill="#5a4630"/>
      <rect x="14" y="14" width="172" height="272" fill="none" stroke="currentColor" stroke-width=".9" opacity=".7"/>
      <path d="M30 34h140M30 266h140" stroke="currentColor" stroke-width=".6" opacity=".6"/>`;
    if (st === "torn") deco += `<path d="M0 270l12-6 10 8 14-5 12 7 16-6 10 5 14-6 12 7 16-4 14 6 12-5 14 6 14-6V300H0z" fill="#000" opacity=".25"/>`;
  }
  if (st === "kids") deco += `<circle cx="170" cy="40" r="46" fill="#fff" opacity=".18"/><circle cx="20" cy="270" r="60" fill="#fff" opacity=".14"/><rect x="14" y="14" width="172" height="272" rx="14" fill="none" stroke="currentColor" stroke-width="2" stroke-dasharray="1 7" opacity=".7"/>`;
  if (st === "modern") deco += `<path d="M0 190L200 120V300H0z" fill="#fff" opacity=".06"/><path d="M0 80L200 20" stroke="currentColor" stroke-width=".6" opacity=".5"/><circle cx="160" cy="250" r="70" fill="none" stroke="currentColor" stroke-width=".5" opacity=".35"/>`;
  if (st === "ice") deco += `<path d="M0 0l60 80-20 40 50 60M200 20l-50 70 30 50-40 70" fill="none" stroke="#fff" stroke-width="1" opacity=".55"/><rect x="12" y="12" width="176" height="276" rx="4" fill="none" stroke="#fff" stroke-width="1.2" opacity=".8"/>`;
  if (st === "ghost") deco += `<rect x="12" y="12" width="176" height="276" rx="3" fill="none" stroke="currentColor" stroke-width="1" stroke-dasharray="5 5" opacity=".6"/>`;
  const sala = opts.label ? `<text x="100" y="38" text-anchor="middle" font-family="'Inter',system-ui,sans-serif" font-size="6.6" letter-spacing="2.4" fill="currentColor" opacity=".75">${esc(opts.label)}</text>` : "";
  const motif = M[c.motif] || M.heart;
  const sz = lines.length > 4 ? 64 : 76;
  return `<svg class="cover-svg" viewBox="0 0 200 300" role="img" aria-label="${esc(b.title)}" style="color:${ink}" xmlns="http://www.w3.org/2000/svg">${bg}${deco}
    <rect width="200" height="300" rx="5" fill="url(#${id}r)"/>
    ${sala}
    <g transform="translate(${100 - sz / 2} ${st === "ghost" ? 70 : 56}) scale(${sz / 100})" ${st === "ghost" ? 'opacity=".5"' : ""}>${motif}</g>
    <text text-anchor="middle" font-family="${font}" font-weight="${weight}" font-size="${fs}" fill="currentColor">${titleSvg}</text>
    ${author ? `<text x="100" y="278" text-anchor="middle" font-family="'Inter',system-ui,sans-serif" font-size="7.4" letter-spacing="1.2" fill="currentColor" opacity=".85">${esc(author.toUpperCase())}</text>` : ""}
    <rect x="0" y="0" width="7" height="300" fill="#000" opacity=".18"/><rect x="7" y="0" width="1.2" height="300" fill="#fff" opacity=".12"/>
  </svg>`;
};
})();
