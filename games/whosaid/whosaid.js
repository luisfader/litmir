/* «Кто это сказал?» — раздел романа: квадратные карточки с фразами едут слева направо,
   игрок угадывает, кто сказал фразу. Данные: novels/<slug>/whosaid.json
   {title, intro, who:{m,n}, round, win, prize, quotes:[{w, ch, t}]}.
   Подключение: window.LitmirWho.mount(el, {slug, store}). Лучший счёт — store "who:<slug>",
   собранные «волны любви» — store "whoPrize:<slug>". */
(function(){
"use strict";
const CSS = `
.ws{font-family:var(--sans);color:var(--ink)}
.ws-start,.ws-end{text-align:center;padding:18px 8px 6px}
.ws-start h3,.ws-end h3{font-family:var(--serif,Georgia,serif);font-size:24px;margin:0 0 8px}
.ws-start p,.ws-end p{color:var(--muted);font-size:14.5px;line-height:1.5;max-width:460px;margin:0 auto 16px}
.ws-faces{display:flex;justify-content:center;gap:14px;margin:4px 0 18px}
.ws-face{display:flex;align-items:center;gap:8px;font-weight:600;font-size:14px}
.ws-face i{width:30px;height:30px;border-radius:50%;display:grid;place-items:center;color:#fff;font-style:normal;font-weight:700;font-size:13px}
.ws-m i,.ws-btn.m{background:linear-gradient(135deg,#e86a5c,#b83a4b)}
.ws-n i,.ws-btn.n{background:linear-gradient(135deg,#3fbfb0,#2a7f9e)}
.ws-go{border:0;border-radius:999px;padding:11px 28px;font:600 15px var(--sans);color:#fff;background:var(--accent);cursor:pointer}
.ws-hud{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--muted);margin:2px 2px 8px}
.ws-hud b{color:var(--ink)}
.ws-track{position:relative;height:186px;overflow:hidden;border-radius:14px;background:linear-gradient(180deg,rgba(63,191,176,.10),rgba(232,106,92,.10));border:1px solid var(--line)}
.ws-track::after{content:"";position:absolute;left:0;right:0;top:50%;height:2px;background:repeating-linear-gradient(90deg,var(--line) 0 10px,transparent 10px 20px);z-index:0}
.ws-card{position:absolute;top:18px;width:150px;height:150px;box-sizing:border-box;padding:12px 12px 10px;border-radius:12px;background:var(--paper);border:1.5px solid var(--line);box-shadow:0 6px 16px rgba(0,0,0,.12);font-family:var(--serif,Georgia,serif);font-size:13.5px;line-height:1.32;display:flex;flex-direction:column;justify-content:center;z-index:1;will-change:transform;transition:border-color .15s,box-shadow .15s,opacity .4s}
.ws-card q{quotes:"«" "»"}
.ws-card.on{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft,rgba(160,60,60,.18)),0 8px 20px rgba(0,0,0,.16)}
.ws-card .ws-st{position:absolute;left:8px;right:8px;bottom:8px;text-align:center;font:700 11.5px var(--sans);letter-spacing:.04em;border-radius:6px;padding:3px 4px;color:#fff}
.ws-card.ok{border-color:#2e9e6b}.ws-card.ok .ws-st{background:#2e9e6b}
.ws-card.bad{border-color:#c0392b;opacity:.85}.ws-card.bad .ws-st{background:#c0392b}
.ws-card.ok q,.ws-card.bad q{opacity:.55}
.ws-btns{display:grid;grid-template-columns:1fr 1fr;gap:10px;margin-top:12px}
.ws-btn{border:0;border-radius:12px;padding:14px 8px;font:700 16px var(--sans);color:#fff;cursor:pointer;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.ws-btn:active{transform:scale(.97)}
.ws-hint{text-align:center;font-size:12px;color:var(--muted);margin-top:8px}
.ws-prize{font-size:46px;line-height:1;margin:6px 0 4px}
.ws-wave{display:inline-block;font-family:var(--serif,Georgia,serif);font-size:22px;font-weight:700;background:linear-gradient(90deg,#e86a5c,#d76fb0,#3fbfb0);-webkit-background-clip:text;background-clip:text;color:transparent;margin-bottom:8px}
.ws-list{list-style:none;padding:0;margin:14px auto 16px;max-width:480px;text-align:left;font-size:13px}
.ws-list li{padding:6px 0;border-top:1px solid var(--line);color:var(--muted)}
.ws-list li b{color:var(--ink)}
@media (max-width:480px){.ws-card{width:136px;height:136px;font-size:12.5px;padding:10px 10px 8px}.ws-track{height:172px}}
`;
function css(){ if (document.getElementById("ws-css")) return; const s = document.createElement("style"); s.id = "ws-css"; s.textContent = CSS; document.head.appendChild(s); }
const esc = s => String(s ?? "").replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const shuffle = a => { a = a.slice(); for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const waves = n => { const m10 = n % 10, m100 = n % 100; return (m10 === 1 && m100 !== 11) ? "волну" : (m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14)) ? "волны" : "волн"; };

async function mount(el, opt){
  css();
  const store = opt.store, slug = opt.slug;
  el.innerHTML = `<div class="loading">…</div>`;
  let D = null;
  try { D = await (await fetch(`novels/${slug}/whosaid.json`, {cache:"no-cache"})).json(); } catch(e) {}
  if (!D || !el.isConnected) return;
  const W = D.who, faces = `<div class="ws-faces"><span class="ws-face ws-m"><i>${esc(W.m[0])}</i>${esc(W.m)}</span><span class="ws-face ws-n"><i>${esc(W.n[0])}</i>${esc(W.n)}</span></div>`;
  let raf = 0, keyH = null;
  const stop = () => { cancelAnimationFrame(raf); if (keyH) document.removeEventListener("keydown", keyH); keyH = null; };

  function start(){
    const best = store.get("who:" + slug, null), total = store.get("whoPrize:" + slug, 0);
    el.innerHTML = `<div class="ws"><div class="ws-start"><h3>${esc(D.title)}</h3><p>${esc(D.intro)}</p>${faces}
      <button type="button" class="ws-go">Играть</button>
      ${best !== null ? `<p style="margin-top:14px">Лучший результат: <b>${best} из ${D.round}</b>${total ? ` · собрано <b>${total} ${waves(total)} любви</b>` : ""}</p>` : ""}</div></div>`;
    el.querySelector(".ws-go").onclick = play;
  }

  function play(){
    stop();
    const deck = shuffle(D.quotes).slice(0, Math.min(D.round, D.quotes.length)), N = deck.length;
    el.innerHTML = `<div class="ws"><div class="ws-hud"><span>Карточка <b class="ws-i">0</b> из ${N}</span><span>Верно: <b class="ws-sc">0</b></span></div>
      <div class="ws-track"></div>
      <div class="ws-btns"><button type="button" class="ws-btn m">${esc(W.m)}</button><button type="button" class="ws-btn n">${esc(W.n)}</button></div>
      <div class="ws-hint">Отвечай за карточку в рамке — ту, что ближе к правому краю. Клавиши: ← ${esc(W.m)}, → ${esc(W.n)}</div></div>`;
    const track = el.querySelector(".ws-track"), hudI = el.querySelector(".ws-i"), hudS = el.querySelector(".ws-sc");
    let cards = [], next = 0, score = 0, done = 0, t = 0, spawnAt = 0, last = performance.now();
    const log = [];
    const geom = () => { const tw = track.clientWidth, cw = tw <= 480 ? 136 : 150; const v = Math.max(55, (tw + cw) / (tw <= 480 ? 8.5 : 10)); return {tw, cw, v, gap: (cw + 26) / v}; };
    const active = () => { let a = null; for (const c of cards) if (!c.ans && (!a || c.x > a.x)) a = c; return a; };
    const mark = () => { const a = active(); cards.forEach(c => c.el.classList.toggle("on", c === a)); };
    const finishCard = (c, ok, label) => {
      c.ans = true; done++; if (ok) score++;
      c.el.classList.remove("on"); c.el.classList.add(ok ? "ok" : "bad");
      c.el.insertAdjacentHTML("beforeend", `<span class="ws-st">${esc(label)}</span>`);
      log.push({q:c.q, ok}); hudS.textContent = score; mark();
    };
    const answer = w => {
      const c = active(); if (!c) return;
      const ok = c.q.w === w;
      finishCard(c, ok, ok ? `✓ ${W[c.q.w]} · гл. ${c.q.ch}` : `✗ Это ${W[c.q.w]} · гл. ${c.q.ch}`);
    };
    el.querySelector(".ws-btn.m").onclick = () => answer("m");
    el.querySelector(".ws-btn.n").onclick = () => answer("n");
    keyH = e => { if (!el.isConnected) return stop(); if (e.key === "ArrowLeft") { e.preventDefault(); answer("m"); } else if (e.key === "ArrowRight") { e.preventDefault(); answer("n"); } };
    document.addEventListener("keydown", keyH);
    const spawn = g => {
      const q = deck[next++], d = document.createElement("div");
      d.className = "ws-card"; d.innerHTML = `<q>${esc(q.t)}</q>`;
      track.appendChild(d); cards.push({q, el:d, x:-g.cw, ans:false});
      hudI.textContent = next; mark();
    };
    const tick = now => {
      if (!el.isConnected) return stop();
      const dt = Math.min(0.05, (now - last) / 1000); last = now; t += dt;
      const g = geom();
      if (next < N && t >= spawnAt) { spawn(g); spawnAt = t + g.gap; }
      for (const c of cards) {
        c.x += g.v * dt;
        c.el.style.transform = `translateX(${c.x}px)`;
        if (!c.ans && c.x > g.tw - g.cw * 0.25) finishCard(c, false, `⌛ Это ${W[c.q.w]} · гл. ${c.q.ch}`);
      }
      cards = cards.filter(c => { if (c.x > g.tw + 10) { c.el.remove(); return false; } return true; });
      if (done >= N && !cards.length) return end(score, N, log);
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(n => { last = n; tick(n); });
  }

  function end(score, N, log){
    stop();
    const prevBest = store.get("who:" + slug, null);
    if (prevBest === null || score > prevBest) store.set("who:" + slug, score);
    const won = score >= Math.min(D.win, N);
    let total = store.get("whoPrize:" + slug, 0);
    if (won) { total += D.prize; store.set("whoPrize:" + slug, total); }
    const miss = log.filter(x => !x.ok);
    el.innerHTML = `<div class="ws"><div class="ws-end">
      ${won ? `<div class="ws-prize" aria-hidden="true">🌊💗</div><div class="ws-wave">Ты выиграл ${D.prize} ${waves(D.prize)} любви!</div>`
            : `<div class="ws-prize" aria-hidden="true">🌫</div><h3>Почти!</h3>`}
      <p>Верно: <b>${score} из ${N}</b>. ${won ? "Мариса и Наталья гордятся тобой." : `Для приза нужно ${D.win} из ${N}. Попробуй ещё раз — серые нити не любят, когда сдаются.`}${total ? `<br>Всего собрано: <b>${total} ${waves(total)} любви</b>.` : ""}</p>
      ${miss.length ? `<ul class="ws-list">${miss.map(x => `<li>«${esc(x.q.t)}» — <b>${esc(W[x.q.w])}</b>, гл. ${x.q.ch}</li>`).join("")}</ul>` : ""}
      <button type="button" class="ws-go">Играть ещё раз</button></div></div>`;
    el.querySelector(".ws-go").onclick = play;
  }
  start();
}
window.LitmirWho = {mount};
})();
