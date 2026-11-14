/* «Тетрадь Луиса» — раздел романа: тетрадь с рисунками, которую можно листать.
   Данные: novels/<slug>/notebook.json {title, intro, blank, pages:[…]}.
   Страница: {img, ch, cap, heart, magic} — рисунок; {photo, ch, text[], front} — вложенная фотография;
   {notes, ch, titleCh, title, lyrics[]} — ноты, записанные с конца тетради (страница перевёрнута).
   Страницы с "magic" появляются только после главы ch (до этого — пустой лист), без спойлеров.
   Подключение: window.LitmirNotebook.mount(el, {slug, store, isRead}). Последняя страница — store "nb:<slug>". */
(function(){
"use strict";
const CSS = `
.nb{font-family:var(--sans);color:var(--ink);text-align:center}
.nb-intro{color:var(--muted);font-size:14px;line-height:1.5;max-width:520px;margin:4px auto 16px}
.nb-stage{position:relative;width:min(100%,440px);aspect-ratio:3/4;margin:0 auto;perspective:1800px;user-select:none;-webkit-user-select:none;touch-action:pan-y}
.nb-leaf{position:absolute;inset:0;border-radius:4px 12px 12px 4px;overflow:hidden;backface-visibility:hidden;-webkit-backface-visibility:hidden;transform-origin:left center;box-shadow:0 10px 26px rgba(40,25,10,.28),inset 6px 0 10px -6px rgba(60,40,20,.35)}
.nb-leaf.anim{transition:transform .62s cubic-bezier(.45,.05,.3,1),filter .62s}
.nb-paper{background:radial-gradient(ellipse at 30% 20%,#fffdf6,#f6efdf 70%,#efe5cf);color:#3b3530}
.nb-paper::before{content:"";position:absolute;left:0;top:0;bottom:0;width:22px;background:linear-gradient(90deg,rgba(120,90,50,.18),rgba(120,90,50,0));pointer-events:none}
.nb-paper::after{content:"";position:absolute;inset:0;background-image:radial-gradient(rgba(90,70,40,.05) 1px,transparent 1.2px);background-size:5px 5px;pointer-events:none}
.nb-pg{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;padding:26px 24px 30px 34px;box-sizing:border-box;gap:14px}
.nb-pg img{max-width:100%;max-height:72%;object-fit:contain;mix-blend-mode:multiply;filter:contrast(1.05);-webkit-user-drag:none;pointer-events:none}
.nb-cap{font-family:"Marck Script",cursive;font-size:23px;line-height:1.2;color:#3a3a4a;max-width:92%;transform:rotate(-1.2deg)}
.nb-heart{position:absolute;right:22px;bottom:20px;font-size:20px;color:#7a6f68;transform:rotate(12deg);font-family:serif}
.nb-num{position:absolute;bottom:10px;right:16px;font:12px "Marck Script",cursive;color:#9a8f80}
.nb-magic{position:absolute;top:12px;right:14px;font-size:11px;font-family:var(--sans);color:#b07a9c;letter-spacing:.04em;opacity:.85}
.nb-blank{font-family:"Marck Script",cursive;font-size:20px;color:#c9bca6}
.nb-cover{background:radial-gradient(ellipse at 35% 30%,#5a3a2a,#3a2418 60%,#24160e);color:#e8d7b8}
.nb-cover::before{content:"";position:absolute;inset:14px;border:1.5px dashed rgba(232,215,184,.45);border-radius:6px}
.nb-cover .nb-pg{gap:10px}
.nb-cover .nb-notes{font-size:34px;letter-spacing:10px;opacity:.75;text-shadow:0 1px 0 rgba(0,0,0,.5)}
.nb-cover .nb-ct{font-family:var(--display,Georgia,serif);font-size:30px;font-style:italic;opacity:.92}
.nb-silk{position:absolute;right:-30px;bottom:-30px;width:150px;height:150px;transform:rotate(45deg);background:linear-gradient(135deg,#f4c9d4,#e7a3b8 55%,#d98aa4);box-shadow:0 0 18px rgba(0,0,0,.35);opacity:.92}
.nb-back{background:radial-gradient(ellipse at 60% 70%,#4a2f22,#2c1a11)}
.nb-photo{position:relative;width:78%;background:#f8f4ea;padding:16px 16px 18px;box-shadow:0 6px 18px rgba(0,0,0,.25);transform:rotate(-3deg);text-align:left;cursor:pointer;transition:transform .5s}
.nb-photo p{font-family:"Marck Script",cursive;font-size:18px;line-height:1.25;color:#2f3f6a;margin:0 0 8px}
.nb-photo.front{background:linear-gradient(160deg,#cfc6b4,#8f877a);color:#fff}
.nb-photo.front p{font-family:var(--serif,Georgia,serif);font-style:italic;font-size:14.5px;color:#fbf6ea;text-shadow:0 1px 2px rgba(0,0,0,.35)}
.nb-photo .nb-corner{position:absolute;right:0;top:0;width:22px;height:22px;background:linear-gradient(225deg,var(--paper,#f5efe2) 50%,rgba(0,0,0,.18) 50%)}
.nb-turn{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:999px;padding:5px 12px;font:600 12px var(--sans);cursor:pointer}
.nb-flip{transition:transform .7s cubic-bezier(.45,.05,.3,1)}
.nb-flip.up{transform:rotate(180deg)}
.nb-ttl{font-family:"Marck Script",cursive;font-size:30px;color:#3a3a4a}
.nb-staff{width:100%;max-width:330px}
.nb-ly{font-family:"Marck Script",cursive;font-size:19px;line-height:1.3;color:#3a3a4a}
.nb-ctl{display:flex;align-items:center;justify-content:center;gap:16px;margin:16px 0 4px}
.nb-ctl button{width:44px;height:44px;border-radius:50%;border:1px solid var(--line);background:var(--paper);color:var(--ink);font-size:22px;cursor:pointer;line-height:1}
.nb-ctl button:disabled{opacity:.3;cursor:default}
.nb-ctl span{font-size:13px;color:var(--muted);min-width:110px}
.nb-hint{font-size:12px;color:var(--muted)}
`;
function css(){
  if (!document.getElementById("nb-css")) { const s = document.createElement("style"); s.id = "nb-css"; s.textContent = CSS; document.head.appendChild(s); }
  if (!document.getElementById("nb-font")) { const l = document.createElement("link"); l.id = "nb-font"; l.rel = "stylesheet"; l.href = "https://fonts.googleapis.com/css2?family=Marck+Script&display=swap"; document.head.appendChild(l); }
}
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

function staffSVG(){
  // нотный стан карандашом; последние три ноты — «три ноты» Луиса, обведены сердечком
  const lines = [0,1,2,3,4].map(i => `<path d="M8 ${30+i*9} Q120 ${29+i*9+(i%2)} 322 ${30+i*9}" stroke="#55505a" stroke-width="1" fill="none" opacity=".75"/>`).join("");
  const ys = [66,57,48,57,39,48,57,66,48,39,30];
  const notes = ys.map((y,i) => { const x = 62 + i*24, big = i >= 8;
    return `<ellipse cx="${x}" cy="${y}" rx="${big?5.6:5}" ry="${big?4.2:3.8}" transform="rotate(-20 ${x} ${y})" fill="#3a3a4a"/><path d="M${x+4.6} ${y-1} L${x+4.6} ${y-26}" stroke="#3a3a4a" stroke-width="1.3"/>`; }).join("");
  const heart = `<path d="M268 22 C252 6 236 26 254 44 L268 58 L282 44 C300 26 284 6 268 22 Z" fill="none" stroke="#c07a98" stroke-width="1.4" stroke-dasharray="3 2" transform="translate(0,4) scale(1)" opacity=".9"/>`;
  return `<svg class="nb-staff" viewBox="0 0 330 92" aria-hidden="true">${lines}<text x="12" y="70" font-size="44" fill="#3a3a4a" font-family="serif">𝄞</text>${notes}${heart}</svg>`;
}

async function mount(el, opt){
  css();
  const {slug, store} = opt, isRead = opt.isRead || (() => true);
  el.innerHTML = `<div class="loading">…</div>`;
  let D = null;
  try { D = await (await fetch(`novels/${slug}/notebook.json`, {cache:"no-cache"})).json(); } catch(e) {}
  if (!D || !el.isConnected) return;

  const leaves = [{cover:true}];
  D.pages.forEach(p => { if (p.photo && !isRead(p.ch)) return; leaves.push(p); });
  leaves.push({back:true});
  const N = leaves.length;
  let i = Math.min(store.get("nb:" + slug, 0) || 0, N - 1), busy = false, notesUp = false, photoFront = false;

  el.innerHTML = `<div class="nb"><p class="nb-intro">${esc(D.intro)}</p>
    <div class="nb-stage" aria-live="polite"></div>
    <div class="nb-ctl"><button type="button" class="nb-prev" aria-label="Назад">‹</button><span class="nb-cnt"></span><button type="button" class="nb-next" aria-label="Вперёд">›</button></div>
    <div class="nb-hint">Листай стрелками, свайпом или нажимая на край страницы</div></div>`;
  const stage = el.querySelector(".nb-stage"), bPrev = el.querySelector(".nb-prev"), bNext = el.querySelector(".nb-next"), cnt = el.querySelector(".nb-cnt");
  let pageNo = 0; const numOf = []; leaves.forEach((l, k) => { numOf[k] = (l.cover || l.back) ? 0 : ++pageNo; });

  function inner(l, k){
    if (l.cover) return `<div class="nb-pg"><div class="nb-notes">♪ ♪ ♪</div><div class="nb-ct">${esc(D.title)}</div></div><div class="nb-silk"></div>`;
    if (l.back) return `<div class="nb-pg"></div>`;
    const num = `<span class="nb-num">${numOf[k]}</span>`;
    if (l.photo) {
      const body = photoFront ? `<p>${esc(l.front)}</p>` : l.text.map(t => `<p>${esc(t)}</p>`).join("");
      return `<div class="nb-pg"><div class="nb-photo${photoFront ? " front" : ""}" data-photo>${body}<span class="nb-corner"></span></div>
        <button type="button" class="nb-turn" data-photo>${photoFront ? "Перевернуть: надпись на обороте" : "Перевернуть фотографию"}</button></div>${num}`;
    }
    if (l.notes) {
      if (!isRead(l.ch)) return `<div class="nb-pg"><div class="nb-blank">${esc(D.blank)}</div></div>${num}`;
      const full = isRead(l.titleCh || l.ch);
      return `<div class="nb-pg"><div class="nb-flip${notesUp ? "" : " up"}">
          ${full ? `<div class="nb-ttl">${esc(l.title)}</div>` : ""}${staffSVG()}${staffSVG().replace('class="nb-staff"', 'class="nb-staff" style="opacity:.8"')}
          ${full ? `<div class="nb-ly">${l.lyrics.map(esc).join("<br>")}</div>` : ""}</div>
          <button type="button" class="nb-turn" data-turn>↻ ${notesUp ? "Перевернуть обратно" : "Наталья пишет с конца — переверни тетрадь"}</button></div>${num}`;
    }
    if (l.magic && !isRead(l.ch)) return `<div class="nb-pg"><div class="nb-blank">${esc(D.blank)}</div></div>${num}`;
    return `<div class="nb-pg"><img src="novels/${slug}/${esc(l.img)}" alt="" draggable="false">${l.cap ? `<div class="nb-cap">${esc(l.cap)}</div>` : ""}</div>
      ${l.heart ? `<span class="nb-heart">♡</span>` : ""}${l.magic ? `<span class="nb-magic" title="Этой страницы раньше не было">✦</span>` : ""}${num}`;
  }
  function leafEl(k){
    const l = leaves[k], d = document.createElement("div");
    d.className = "nb-leaf " + (l.cover ? "nb-cover" : l.back ? "nb-back" : "nb-paper");
    d.innerHTML = inner(l, k);
    return d;
  }
  function ui(){
    bPrev.disabled = i <= 0; bNext.disabled = i >= N - 1;
    const l = leaves[i];
    cnt.textContent = l.cover ? "Обложка" : l.back ? "Задняя обложка" : `Страница ${numOf[i]} из ${pageNo}`;
    store.set("nb:" + slug, i);
  }
  function draw(){ stage.innerHTML = ""; stage.appendChild(leafEl(i)); ui(); }
  function go(to){
    if (busy || to < 0 || to >= N || to === i) return;
    busy = true; notesUp = false; photoFront = false;
    const fwd = to > i, cur = stage.firstElementChild, nxt = leafEl(to);
    if (fwd) {
      stage.insertBefore(nxt, cur);
      cur.classList.add("anim"); cur.style.zIndex = 2;
      requestAnimationFrame(() => requestAnimationFrame(() => { cur.style.transform = "rotateY(-178deg)"; cur.style.filter = "brightness(.75)"; }));
      setTimeout(() => { cur.remove(); done(); }, 650);
    } else {
      nxt.style.transform = "rotateY(-178deg)"; nxt.style.zIndex = 2; nxt.style.filter = "brightness(.75)";
      stage.appendChild(nxt);
      requestAnimationFrame(() => requestAnimationFrame(() => { nxt.classList.add("anim"); nxt.style.transform = "rotateY(0deg)"; nxt.style.filter = ""; }));
      setTimeout(() => { cur.remove(); nxt.classList.remove("anim"); nxt.style.zIndex = ""; done(); }, 650);
    }
    function done(){ i = to; busy = false; ui(); }
  }
  bPrev.onclick = () => go(i - 1);
  bNext.onclick = () => go(i + 1);
  stage.addEventListener("click", e => {
    if (e.target.closest("[data-turn]")) { notesUp = !notesUp; const f = stage.querySelector(".nb-flip"), b = e.target.closest("[data-turn]"); f.classList.toggle("up", !notesUp); b.textContent = "↻ " + (notesUp ? "Перевернуть обратно" : "Наталья пишет с конца — переверни тетрадь"); return; }
    if (e.target.closest("[data-photo]")) { photoFront = !photoFront; const cur = stage.firstElementChild; cur.innerHTML = inner(leaves[i], i); return; }
    const r = stage.getBoundingClientRect(); go(e.clientX - r.left > r.width * 0.5 ? i + 1 : i - 1);
  });
  let x0 = null;
  stage.addEventListener("touchstart", e => { x0 = e.touches[0].clientX; }, {passive:true});
  stage.addEventListener("touchend", e => { if (x0 === null) return; const dx = e.changedTouches[0].clientX - x0; x0 = null; if (Math.abs(dx) > 45) { e.preventDefault(); go(dx < 0 ? i + 1 : i - 1); } });
  const key = e => { if (!el.isConnected) return document.removeEventListener("keydown", key); if (e.target.closest && e.target.closest("input,textarea,select")) return; if (e.key === "ArrowRight") go(i + 1); else if (e.key === "ArrowLeft") go(i - 1); };
  document.addEventListener("keydown", key);
  draw();
}
window.LitmirNotebook = {mount};
})();
