/* «El misterio de los Fader» / «Тайна семьи Фадер» — три раздела романа:
   LitmirFader.why   — «¿Por qué? / Почему?»: вопросы о Мендосе, два ответа (данные в novels/<slug>/why.json);
   LitmirFader.queen — «Votá a la reina de la Vendimia»: каждую минуту королевой становится другая героиня
                       (выбор зависит только от номера минуты — у всех читателей в эту минуту одна и та же королева);
   LitmirFader.fox   — «El zorro y el hidromiel»: лис бежит вдоль арыка, собирает светящийся виноград и в конце кусает Адольфо.
   Подключается из index.html по требованию. Графика игры рисуется кодом. */
(function(){
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const L = lang => lang === "ru" ? "ru" : "es";

/* ───────── стили (один раз) ───────── */
function css(){
  if (document.getElementById("fdCss")) return;
  const s = document.createElement("style"); s.id = "fdCss";
  s.textContent = `
.fd{font-family:var(--sans)}.fd h3{font:400 22px var(--serif);color:var(--ink);margin:2px 0 8px}
.fd .fd-p{font:14px/1.55 var(--sans);color:var(--muted);margin:0 0 12px}
.fd .fd-n{font:600 12px var(--sans);color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:0 0 6px}
.fd .fd-bar{height:4px;background:var(--bg);border-radius:4px;margin:0 0 12px;overflow:hidden}.fd .fd-bar i{display:block;height:100%;background:var(--accent);transition:width .3s}
.fd .fd-img{width:100%;aspect-ratio:16/9;object-fit:cover;border-radius:14px;display:block;margin:0 0 12px;background:var(--bg)}
.fd .fd-q{font:500 19px/1.35 var(--serif);color:var(--ink);margin:0 0 12px}
.fd .fd-a{display:grid;gap:8px}.fd .fd-a button{text-align:left;font:15px/1.4 var(--sans);color:var(--ink);background:var(--bg);border:2px solid transparent;border-radius:12px;padding:12px 14px;cursor:pointer}
.fd .fd-a button:hover:not(:disabled){border-color:var(--accent)}.fd .fd-a button:disabled{cursor:default}
.fd .fd-a button.ok{border-color:#3a9a5b;background:rgba(58,154,91,.12)}.fd .fd-a button.no{border-color:#c4473d;background:rgba(196,71,61,.1)}
.fd .fd-why{font:15px/1.55 var(--sans);color:var(--ink);background:var(--bg);border-radius:12px;padding:12px 14px;margin:12px 0}
.fd .fd-why b{display:block;margin-bottom:4px}
.fd .fd-btn{font:600 14px var(--sans);border:0;border-radius:999px;padding:10px 18px;background:var(--accent);color:#fff;cursor:pointer}
.fd .fd-c{text-align:center;padding:6px 2px}.fd .fd-big{font-size:52px;line-height:1.1}
.fd .fd-cands{display:grid;grid-template-columns:repeat(3,1fr);gap:10px;margin:0 0 12px}
.fd .fd-cd{position:relative;border:2px solid transparent;border-radius:14px;overflow:hidden;background:var(--bg);padding:0;cursor:pointer;text-align:left;color:var(--ink)}
.fd .fd-cd img{width:100%;aspect-ratio:3/4;object-fit:cover;object-position:50% 20%;display:block}
.fd .fd-cd span{display:block;padding:6px 8px 8px;font:600 13px/1.25 var(--sans)}.fd .fd-cd small{display:block;font:400 11px/1.3 var(--sans);color:var(--muted);margin-top:2px}
.fd .fd-cd:hover:not(:disabled){border-color:var(--accent)}.fd .fd-cd:disabled{cursor:default;opacity:.45}
.fd .fd-cd.win{opacity:1;border-color:#d4a72c;box-shadow:0 0 0 3px rgba(212,167,44,.35)}.fd .fd-cd.mine{opacity:1}
.fd .fd-cd.win::after{content:"👑";position:absolute;top:6px;right:8px;font-size:26px;filter:drop-shadow(0 2px 3px rgba(0,0,0,.4))}
.fd .fd-res{border-radius:14px;padding:14px;margin:0 0 12px;font:15px/1.55 var(--sans);color:var(--ink);background:var(--bg)}
.fd .fd-res.w{background:rgba(212,167,44,.16)}.fd .fd-res b{font:400 21px var(--serif);display:block;margin-bottom:4px}
.fd .fd-meta{display:flex;justify-content:space-between;gap:10px;font:600 13px var(--sans);color:var(--muted);margin:0 0 10px;flex-wrap:wrap}
.fd .fd-cv{width:100%;display:block;border-radius:14px;touch-action:manipulation;cursor:pointer;background:#24324a}
.fd .fd-row{display:flex;gap:8px;justify-content:center;flex-wrap:wrap;margin-top:10px}
@media (max-width:560px){.fd .fd-cands{grid-template-columns:repeat(2,1fr)}}`;
  document.head.appendChild(s);
}

/* ═════════ 1. ¿Por qué? ═════════ */
const WT = {
  es:{of:(a,b)=>`Pregunta ${a} de ${b}`, yes:"¡Exacto!", no:"¡No! Era la otra.", next:"Siguiente →", end:"Ver resultado", again:"Jugar otra vez", pts:(a,b)=>`${a} de ${b} respuestas correctas`},
  ru:{of:(a,b)=>`Вопрос ${a} из ${b}`, yes:"Точно!", no:"Нет! Правильный — другой.", next:"Дальше →", end:"Результат", again:"Сыграть ещё раз", pts:(a,b)=>`${a} из ${b} правильных ответов`}
};
async function why(el, o){
  css(); const T = WT[L(o.lang)];
  el.innerHTML = `<div class="loading">…</div>`;
  let d = null; try { d = await (await fetch(`novels/${o.slug}/why.json`, {cache:"no-cache"})).json(); } catch(e) {}
  if (!el.isConnected || !d) return;
  let i = 0, sc = 0; const N = d.questions.length;
  const draw = () => {
    if (!el.isConnected) return;
    if (i >= N) {
      const e = d.end.slice().sort((a, b) => b.min - a.min).find(e => sc >= e.min) || d.end[d.end.length - 1];
      try { o.store && o.store.set("why:" + o.slug, sc); } catch(_) {}
      el.innerHTML = `<div class="fd"><div class="fd-c"><div class="fd-big" aria-hidden="true">${sc >= 12 ? "🍇" : sc >= 8 ? "🍷" : "🌪️"}</div><h3>${esc(T.pts(sc, N))}</h3><p class="fd-p">${esc(e.t)}</p><button type="button" class="fd-btn">${esc(T.again)}</button></div></div>`;
      el.querySelector(".fd-btn").onclick = () => { i = 0; sc = 0; draw(); };
      return;
    }
    const x = d.questions[i];
    el.innerHTML = `<div class="fd">${i === 0 ? `<h3>${esc(d.title)}</h3><p class="fd-p">${esc(d.intro)}</p>` : ""}
      <p class="fd-n">${esc(T.of(i + 1, N))}</p><div class="fd-bar"><i style="width:${i / N * 100}%"></i></div>
      ${x.img ? `<img class="fd-img" src="${esc(x.img)}" alt="" loading="lazy">` : ""}
      <p class="fd-q">${esc(x.q)}</p><div class="fd-a">${x.a.map((a, k) => `<button type="button" data-a="${k}">${esc(a)}</button>`).join("")}</div><div class="fd-after"></div></div>`;
    const bs = [...el.querySelectorAll("[data-a]")];
    bs.forEach(b => b.onclick = () => {
      const k = +b.dataset.a, good = k === x.ok; if (good) sc++;
      bs.forEach(z => { z.disabled = true; if (+z.dataset.a === x.ok) z.classList.add("ok"); else if (z === b) z.classList.add("no"); });
      const af = el.querySelector(".fd-after");
      af.innerHTML = `<div class="fd-why"><b>${esc(good ? T.yes : T.no)}</b>${esc(x.why)}</div><button type="button" class="fd-btn">${esc(i + 1 < N ? T.next : T.end)}</button>`;
      af.querySelector(".fd-btn").onclick = () => { i++; draw(); el.scrollIntoView({block:"nearest"}); };
    });
  };
  draw();
}

/* ═════════ 2. Reina de la Vendimia ═════════ */
const IMG = "characters/img/";
const QUEENS = [
  {img:"natalia-fader-2.jpg", es:["Natalia","El misterio de los Fader","porque ya fue reina una vez y la corona sigue en su placard, al lado de los gorros de lana"], ru:["Наталья","Тайна семьи Фадер","потому что она уже была королевой, и корона до сих пор лежит у неё в шкафу — рядом с шерстяными шапками"]},
  {img:"natalia-cellist-1.jpg", es:["Natalia, la violonchelista","Presentimiento","porque tocó el violonchelo en la viña y las uvas maduraron dos semanas antes"], ru:["Наталья-виолончелистка","Предчувствие","потому что сыграла на виолончели в винограднике, и виноград созрел на две недели раньше"]},
  {img:"natalia-cardiologa-1.jpg", es:["Natalia, la doctora","Presentimiento","porque prometió revisarles el corazón gratis a todos los que la votaran"], ru:["Наталья-врач","Предчувствие","потому что пообещала бесплатно проверить сердце каждому, кто за неё проголосует"]},
  {img:"natalia-verdegrad-1.jpg", es:["Natalia de Verdegrado","Olas de amor","porque sonrió y en Sinea anularon todas las multas por reírse"], ru:["Наталья из Вердеграда","Волны любви","потому что улыбнулась — и в Синее отменили все штрафы за смех"]},
  {img:"natasha-1.jpg", es:["Natasha","La hora salvaje","porque llegó volando en un dragón y nadie se animó a votar en contra"], ru:["Наташа","Дикий час","потому что прилетела на драконе, и никто не рискнул голосовать против"]},
  {img:"chiara-1.jpg", es:["Chiara","La ciudad triste","porque contó un chiste y el jurado se rió tanto que se le cayeron las uvas"], ru:["Кьяра","Грустный город","потому что рассказала анекдот, и жюри так смеялось, что уронило весь виноград"]},
  {img:"laura-bellini-1.jpg", es:["Laura Bellini","Ladro di cuori","porque Alessio se robó todas las demás coronas en un abrir y cerrar de ojos"], ru:["Лаура Беллини","Похититель сердец","потому что Алессио в мгновение ока украл все остальные короны"]},
  {img:"julieta-diaz-1.jpg", es:["Julieta Díaz","El misterio de los Fader","porque lo anunció ella misma en vivo por televisión, y nadie se atrevió a desmentirla"], ru:["Хулиета Диас","Тайна семьи Фадер","потому что сама объявила это в прямом эфире, и никто не посмел возразить"]},
  {img:"monica-1.jpg", es:["Mónica","El misterio de los Fader","porque Sergio la votó catorce veces y nadie lo pudo frenar"], ru:["Моника","Тайна семьи Фадер","потому что Серхио проголосовал за неё четырнадцать раз, и никто не смог его остановить"]},
  {img:"silvana-roca-1.jpg", es:["María Silvana Roca","El misterio de los Fader","porque prometió no hacerle un monumento a nadie, y la gente aplaudió de pie"], ru:["Мария Сильвана Рока","Тайна семьи Фадер","потому что пообещала больше никому не ставить памятников, и площадь аплодировала стоя"]},
  {img:"oxana-utopia-2.jpg", es:["Oksana","Presentimiento","porque cantó con la guitarra y el viento Zonda se calmó para escucharla"], ru:["Оксана","Предчувствие","потому что спела под гитару, и ветер Сонда затих, чтобы послушать"]},
  {img:"sasha-1.jpg", es:["Sasha","Presentimiento","porque defendió la fortaleza, y defender una vendimia le pareció pan comido"], ru:["Саша","Предчувствие","потому что защищала крепость, а защитить Вендимию для неё — пустяк"]},
  {img:"elena-meteor-1.jpg", es:["Elena","Lluvia de meteoritos","porque una estrella fugaz cayó justo en su copa de Malbec"], ru:["Елена","Метеоритный дождь","потому что падающая звезда угодила прямо в её бокал мальбека"]},
  {img:"sofia-north-1.jpg", es:["Sofía","Amor del norte","porque trajo la aurora boreal a Mendoza, y queda divina sobre los Andes"], ru:["София","Северная любовь","потому что привезла в Мендосу северное сияние, а над Андами оно смотрится чудесно"]},
  {img:"lucy-thorne-1.jpg", es:["Lucy Thorne","Operación Londres","porque sirvió té inglés con Malbec y fue un éxito total"], ru:["Люси Торн","Тайна семьи Фадер: Операция «Лондон»","потому что подала английский чай с мальбеком, и это был полный успех"]},
  {img:"alicia-1.jpg", es:["Alicia","El tren fantasma","porque llegó en un tren fantasma que nadie vio salir de ninguna estación"], ru:["Алисия","Призрачный поезд","потому что приехала на призрачном поезде, который ни с одной станции не отправлялся"]},
  {img:"natalia-venice-1.jpg", es:["Natalia de Venecia","La hora salvaje: Hechizo veneciano","porque se sacó la máscara y el jurado entero suspiró al mismo tiempo"], ru:["Наталья из Венеции","Дикий час: Венецианское колдовство","потому что сняла маску, и всё жюри вздохнуло одновременно"]},
  {img:"natalia-anomalnyj-1.jpg", es:["Natalia","La hora anómala","porque su gata Pliushka miró fijo al jurado, y el jurado entendió"], ru:["Наталья","Аномальный час","потому что её кошка Плюшка пристально посмотрела на жюри, и жюри всё поняло"]}
];
const EXTRA = {
  es:["Además, el zorro de la finca Fader la aprobó con un movimiento de cola.","Además, pisó uvas con muchísima elegancia.","Además, el viento Zonda le despeinó todo menos la corona.","Además, Karl Fader dijo «gut», que en alemán es muchísimo.","Además, Luis la anunció por micrófono tres veces, por las dudas.","Además, los mozos del centro le regalaron una empanada en cada esquina.","Además, Marcos el detective investigó y no encontró nada raro. Lo cual es raro."],
  ru:["К тому же лис с финки Фадер одобрил её взмахом хвоста.","К тому же она давила виноград с невероятным изяществом.","К тому же ветер Сонда растрепал ей всё, кроме короны.","К тому же Карл Фадер сказал «gut», а для немца это очень много.","К тому же Луис объявил её в микрофон три раза — на всякий случай.","К тому же официанты в центре дарили ей эмпанаду на каждом углу.","К тому же детектив Марк всё проверил и ничего странного не нашёл. Что само по себе странно."]
};
const QT = {
  es:{h:"Votá a la reina de la Vendimia", p:"Cada minuto Mendoza elige una reina nueva. Elegí a tu candidata: si en este minuto la corona es suya, ganás. Si no… el jurado mendocino es impredecible.", next:s=>`Nueva elección en 0:${String(s).padStart(2,"0")}`, now:"Nueva elección: ¡ya!", score:(w,l)=>`Ganadas: ${w} · Perdidas: ${l}`,
       win:"¡Ganaste!", lose:"Perdiste…", is:(n,r)=>`En este minuto la reina de la Vendimia es ${n}, ${r}.`, mine:n=>`Votaste por ${n}. La corona es suya. El jurado te manda saludos y una botella de Malbec imaginaria.`, other:n=>`Votaste por ${n}, pero el jurado pensó otra cosa. Esperá al próximo minuto: en Mendoza todo puede cambiar.`, again:"Votar otra vez"},
  ru:{h:"Голосуй за королеву Вендимии", p:"Каждую минуту Мендоса выбирает новую королеву. Выбери свою кандидатку: если в эту минуту корона её — ты выиграл. Если нет… мендосское жюри непредсказуемо.", next:s=>`Новые выборы через 0:${String(s).padStart(2,"0")}`, now:"Новые выборы: уже!", score:(w,l)=>`Побед: ${w} · Поражений: ${l}`,
       win:"Победа!", lose:"Не угадал…", is:(n,r)=>`В эту минуту королева Вендимии — ${n}, ${r}.`, mine:n=>`Ты голосовал за: ${n}. Корона её! Жюри передаёт привет и воображаемую бутылку мальбека.`, other:n=>`Ты голосовал за: ${n}, но жюри решило иначе. Подожди следующей минуты: в Мендосе всё может измениться.`, again:"Голосовать снова"}
};
function rng(seed){ let a = seed >>> 0; return () => { a = (a + 0x6D2B79F5) >>> 0; let t = a; t = Math.imul(t ^ (t >>> 15), t | 1); t ^= t + Math.imul(t ^ (t >>> 7), t | 61); return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
function round(min){
  const r = rng(min * 2654435761 + 97), idx = QUEENS.map((_, i) => i);
  for (let i = idx.length - 1; i > 0; i--) { const j = Math.floor(r() * (i + 1)); [idx[i], idx[j]] = [idx[j], idx[i]]; }
  const c = idx.slice(0, 6); return {c, q:c[Math.floor(r() * 6)], x:Math.floor(r() * 7)};
}
function queen(el, o){
  css(); const lg = L(o.lang), T = QT[lg], st = o.store;
  const get = (k, d) => { try { return st ? st.get(k, d) : d; } catch(_) { return d; } }, set = (k, v) => { try { st && st.set(k, v); } catch(_) {} };
  let min = Math.floor(Date.now() / 60000), R = round(min), vote = -1, timer = 0;
  const nm = i => QUEENS[i][lg][0];
  const draw = () => {
    if (!el.isConnected) { clearInterval(timer); return; }
    const sc = get("queen:score", {w:0, l:0}), q = QUEENS[R.q][lg];
    el.innerHTML = `<div class="fd"><h3>${esc(T.h)}</h3><p class="fd-p">${esc(T.p)}</p>
      <div class="fd-meta"><span class="fd-t"></span><span>${esc(T.score(sc.w, sc.l))}</span></div>
      ${vote >= 0 ? `<div class="fd-res${vote === R.q ? " w" : ""}"><b>${esc(vote === R.q ? "👑 " + T.win : T.lose)}</b>${esc(T.is(q[0], q[2]))} ${esc(EXTRA[lg][R.x])}<br><br>${esc(vote === R.q ? T.mine(nm(vote)) : T.other(nm(vote)))}</div>` : ""}
      <div class="fd-cands">${R.c.map(i => { const c = QUEENS[i][lg];
        return `<button type="button" class="fd-cd${vote >= 0 && i === R.q ? " win" : ""}${i === vote ? " mine" : ""}" data-c="${i}"${vote >= 0 ? " disabled" : ""}><img src="${IMG + QUEENS[i].img}" alt="" loading="lazy"><span>${esc(c[0])}<small>${esc(c[1])}</small></span></button>`; }).join("")}</div>
      ${vote >= 0 ? `<div class="fd-row"><button type="button" class="fd-btn fd-ag" disabled>${esc(T.again)}</button></div>` : ""}</div>`;
    el.querySelectorAll("[data-c]").forEach(b => b.onclick = () => {
      vote = +b.dataset.c; const s = get("queen:score", {w:0, l:0}); if (vote === R.q) s.w++; else s.l++; set("queen:score", s); draw();
      el.querySelector(".fd-res").scrollIntoView({block:"nearest", behavior:"smooth"});
    });
    const ag = el.querySelector(".fd-ag"); if (ag) ag.onclick = () => { min = Math.floor(Date.now() / 60000); R = round(min); vote = -1; draw(); };
    tick();
  };
  const tick = () => {
    if (!el.isConnected) { clearInterval(timer); return; }
    const now = Date.now(), m = Math.floor(now / 60000), t = el.querySelector(".fd-t"), ag = el.querySelector(".fd-ag");
    if (m !== min) {
      if (vote < 0) { min = m; R = round(min); draw(); return; }
      if (t) t.textContent = T.now; if (ag) ag.disabled = false; return;
    }
    if (t) t.textContent = T.next(60 - Math.floor(now / 1000) % 60);
  };
  clearInterval(timer); timer = setInterval(tick, 1000); draw();
}

/* ═════════ 3. El zorro y el hidromiel ═════════ */
const FT = {
  es:{h:"El zorro y el hidromiel", p:"El frasco de hidromiel cayó a la acequia y Adolfo quiere robarlo. Ayudá al zorro de la finca Fader: juntá 30 uvas mágicas, saltá las piedras y las jarillas, y al final… ya sabés qué hacer.",
      start:"Jugar", tap:"Tocá la pantalla, la barra espaciadora o ↑ para saltar (dos veces = salto doble)", grapes:"Uvas", lives:"Vidas", best:"Récord",
      over:"¡Uy! El zorro tropezó", overP:"Adolfo se ríe desde su Torino. Pero un zorro de montaña no se rinde.", retry:"Otra vez",
      adolfo:"¡Ahí está Adolfo con el frasco!", bite:"¡MORDÉ!", ouch:"¡Zorro de m…!",
      win:"¡El zorro salvó el hidromiel!", winP:"Adolfo soltó el frasco, se agarró el trasero y salió corriendo hacia su Torino. El hidromiel volvió a la finca Fader, y las uvas brillan más que nunca. «Es nuestro guardián», dice Natalia.", again:"Jugar de nuevo"},
  ru:{h:"Лис и медовуха", p:"Флакон с медовухой упал в арык, и Адольфо хочет его украсть. Помоги лису с финки Фадер: собери 30 волшебных виноградин, перепрыгивай камни и кусты, а в конце… сам знаешь, что делать.",
      start:"Играть", tap:"Коснись экрана, нажми пробел или ↑, чтобы прыгнуть (дважды — двойной прыжок)", grapes:"Виноград", lives:"Жизни", best:"Рекорд",
      over:"Ой! Лис споткнулся", overP:"Адольфо смеётся из своего «Торино». Но горный лис не сдаётся.", retry:"Ещё раз",
      adolfo:"Вот он, Адольфо с флаконом!", bite:"КУСАЙ!", ouch:"Ах ты, лис!..",
      win:"Лис спас медовуху!", winP:"Адольфо выронил флакон, схватился за мягкое место и помчался к своему «Торино». Медовуха вернулась на финку Фадер, и виноград светится ярче прежнего. «Он наш страж», — говорит Наталья.", again:"Сыграть снова"}
};
function fox(el, o){
  css(); const lg = L(o.lang), T = FT[lg], st = o.store;
  const best = () => { try { return st ? st.get("fox:best", 0) : 0; } catch(_) { return 0; } };
  el.innerHTML = `<div class="fd"><h3>${esc(T.h)}</h3><p class="fd-p">${esc(T.p)}</p><canvas class="fd-cv" width="800" height="320" aria-label="${esc(T.h)}"></canvas><p class="fd-p" style="margin-top:8px;font-size:12px">${esc(T.tap)}</p></div>`;
  const cv = el.querySelector("canvas"), c = cv.getContext("2d"), W = 800, H = 320, GY = 262;
  const fit = () => { const w = cv.clientWidth || 600, dpr = Math.min(2, window.devicePixelRatio || 1); cv.width = Math.round(w * dpr); cv.height = Math.round(w * H / W * dpr); };
  fit();
  let S = null, raf = 0, last = 0, mode = "menu";
  const reset = () => { S = {t:0, sp:300, dist:0, fy:0, vy:0, jumps:0, lives:3, inv:0, g:0, obs:[], items:[], next:1.2, nextI:.6, parts:[], ad:null, bite:0, msg:"", end:0}; };
  const jump = () => {
    if (mode === "menu" || mode === "over" || mode === "win") { if (mode === "win" && S && S.end > 0) return; reset(); mode = "run"; return; }
    if (mode === "run") { if (S.jumps < 2) { S.vy = S.jumps ? -520 : -640; S.jumps++; } }
    else if (mode === "boss" && !S.bite) { S.bite = 1; S.vy = -560; S.jumps = 1; }
  };
  const key = e => { if (!cv.isConnected) { window.removeEventListener("keydown", key); return; } if ((e.code === "Space" || e.code === "ArrowUp") && cv.getBoundingClientRect().bottom > 0) { const r = cv.getBoundingClientRect(); if (r.top < innerHeight && r.bottom > 0) { e.preventDefault(); jump(); } } };
  cv.addEventListener("pointerdown", e => { e.preventDefault(); jump(); });
  window.addEventListener("keydown", key);
  const ro = window.ResizeObserver ? new ResizeObserver(fit) : null; if (ro) ro.observe(cv);

  /* рисование */
  const bg = t => {
    const g = c.createLinearGradient(0, 0, 0, GY); g.addColorStop(0, "#f7b267"); g.addColorStop(.55, "#f4d6a0"); g.addColorStop(1, "#e9dcc0");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = "rgba(255,240,200,.9)"; c.beginPath(); c.arc(640, 70, 28, 0, 7); c.fill();
    // Анды
    const mt = (off, col, snow, hgt, sp) => { const o = -((t * sp) % 400); c.fillStyle = col; c.beginPath(); c.moveTo(0, GY - 40);
      for (let x = o - 400; x < W + 400; x += 200) { c.lineTo(x + 100, GY - 40 - hgt - ((x / 200) % 2 ? 30 : 0)); c.lineTo(x + 200, GY - 40); }
      c.lineTo(W, GY); c.lineTo(0, GY); c.fill();
      if (snow) { c.fillStyle = "rgba(255,255,255,.85)"; for (let x = o - 400; x < W + 400; x += 200) { const pk = GY - 40 - hgt - ((x / 200) % 2 ? 30 : 0); c.beginPath(); c.moveTo(x + 100, pk); c.lineTo(x + 78, pk + 26); c.lineTo(x + 92, pk + 20); c.lineTo(x + 104, pk + 28); c.lineTo(x + 122, pk + 26); c.fill(); } } };
    mt(0, "#9a8fb5", true, 120, 12); mt(0, "#7c7aa0", false, 70, 28);
    // виноградники
    const o2 = -((t * 90) % 60); c.fillStyle = "#7d9a4a"; c.fillRect(0, GY - 46, W, 22);
    for (let x = o2; x < W + 60; x += 60) { c.fillStyle = "#5f7d34"; c.beginPath(); c.ellipse(x + 30, GY - 44, 26, 12, 0, 0, 7); c.fill(); c.fillStyle = "#6b3f7a"; c.beginPath(); c.arc(x + 22, GY - 38, 3, 0, 7); c.arc(x + 38, GY - 40, 3, 0, 7); c.fill(); }
    // арык и дорожка
    c.fillStyle = "#c8a776"; c.fillRect(0, GY - 24, W, 24);
    c.fillStyle = "#5aa6c8"; c.fillRect(0, GY - 24, W, 7); c.fillStyle = "rgba(255,255,255,.5)";
    const o3 = -((t * 300) % 40); for (let x = o3; x < W; x += 40) c.fillRect(x, GY - 21, 14, 2);
    c.fillStyle = "#b08f5e"; c.fillRect(0, GY, W, H - GY); c.fillStyle = "rgba(0,0,0,.08)";
    const o4 = -((t * 300) % 80); for (let x = o4; x < W; x += 80) c.fillRect(x, GY + 14, 30, 4);
  };
  const drawFox = (x, y, t, flash) => {
    if (flash && Math.floor(t * 12) % 2) return;
    const run = mode === "run" || mode === "boss", leg = run && S.fy === 0 ? Math.sin(t * 22) * 6 : 0;
    c.save(); c.translate(x, y);
    c.fillStyle = "#c4521d"; c.beginPath(); c.moveTo(-22, -22); c.quadraticCurveTo(-58, -40 + Math.sin(t * 8) * 4, -62, -16); c.quadraticCurveTo(-44, -12, -22, -14); c.fill();
    c.fillStyle = "#fff4e6"; c.beginPath(); c.moveTo(-56, -26); c.quadraticCurveTo(-64, -20, -62, -16); c.quadraticCurveTo(-56, -16, -52, -20); c.fill();
    c.fillStyle = "#3b2214"; c.fillRect(-16 + leg, -8, 5, 10); c.fillRect(10 - leg, -8, 5, 10); c.fillRect(-8 - leg, -8, 5, 10); c.fillRect(16 + leg, -8, 5, 10);
    c.fillStyle = "#df6a28"; c.beginPath(); c.ellipse(0, -18, 26, 12, 0, 0, 7); c.fill();
    c.fillStyle = "#fff4e6"; c.beginPath(); c.ellipse(6, -11, 14, 5, 0, 0, 7); c.fill();
    c.fillStyle = "#df6a28"; c.beginPath(); c.moveTo(18, -26); c.lineTo(42, -22); c.lineTo(48, -16); c.lineTo(36, -10); c.lineTo(18, -12); c.fill();
    c.beginPath(); c.moveTo(22, -26); c.lineTo(26, -42); c.lineTo(32, -26); c.fill(); c.beginPath(); c.moveTo(30, -26); c.lineTo(36, -40); c.lineTo(39, -24); c.fill();
    c.fillStyle = "#fff4e6"; c.beginPath(); c.moveTo(30, -14); c.lineTo(48, -16); c.lineTo(36, -10); c.fill();
    c.fillStyle = "#1b1b1b"; c.beginPath(); c.arc(48, -16, 2.5, 0, 7); c.fill();
    c.fillStyle = "#ffcf3f"; c.beginPath(); c.arc(32, -21, 2.6, 0, 7); c.fill(); c.fillStyle = "#1b1b1b"; c.beginPath(); c.arc(32.6, -21, 1.2, 0, 7); c.fill();
    c.restore();
  };
  const drawObs = ob => {
    c.save(); c.translate(ob.x, GY);
    if (ob.k === 0) { c.fillStyle = "#8a8378"; c.beginPath(); c.ellipse(0, -12, 20, 14, 0, Math.PI, 0); c.fill(); c.fillStyle = "#a59e92"; c.beginPath(); c.ellipse(-5, -18, 8, 5, 0, 0, 7); c.fill(); }
    else if (ob.k === 1) { c.strokeStyle = "#5c6b2e"; c.lineWidth = 3; for (let i = -3; i <= 3; i++) { c.beginPath(); c.moveTo(0, 0); c.lineTo(i * 6, -30 - Math.abs(i) * -2); c.stroke(); } c.fillStyle = "#8aa040"; for (let i = -3; i <= 3; i++) { c.beginPath(); c.arc(i * 6, -32 + Math.abs(i) * 2, 4, 0, 7); c.fill(); } c.fillStyle = "#f2d43b"; c.beginPath(); c.arc(-6, -34, 2, 0, 7); c.arc(9, -30, 2, 0, 7); c.fill(); }
    else { c.fillStyle = "#6e4a2a"; c.fillRect(-10, -44, 9, 44); c.fillStyle = "#5f7d34"; c.beginPath(); c.ellipse(-4, -46, 22, 10, 0, 0, 7); c.fill(); }
    c.restore();
  };
  const drawItem = (it, t) => {
    const y = it.y + Math.sin(t * 4 + it.x * .02) * 4;
    if (it.k === "h") {
      c.save(); c.translate(it.x, y); const g = c.createRadialGradient(0, 0, 2, 0, 0, 22); g.addColorStop(0, "rgba(255,214,90,.7)"); g.addColorStop(1, "rgba(255,214,90,0)"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 22, 0, 7); c.fill();
      c.fillStyle = "#e8a92c"; c.beginPath(); c.moveTo(0, -12); c.quadraticCurveTo(10, 2, 0, 10); c.quadraticCurveTo(-10, 2, 0, -12); c.fill(); c.fillStyle = "rgba(255,255,255,.7)"; c.beginPath(); c.arc(-3, 1, 2, 0, 7); c.fill(); c.restore(); return;
    }
    c.save(); c.translate(it.x, y); const g = c.createRadialGradient(0, 0, 2, 0, 0, 20); g.addColorStop(0, "rgba(120,240,220,.55)"); g.addColorStop(1, "rgba(120,240,220,0)"); c.fillStyle = g; c.beginPath(); c.arc(0, 0, 20, 0, 7); c.fill();
    c.fillStyle = "#7a3e95"; [[0,-6],[-5,-1],[5,-1],[0,4],[-3,8],[3,8]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 4.2, 0, 7); c.fill(); });
    c.strokeStyle = "#4d6b2a"; c.lineWidth = 2; c.beginPath(); c.moveTo(0, -10); c.lineTo(2, -15); c.stroke(); c.restore();
  };
  const drawAdolfo = (a, t) => {
    c.save(); c.translate(a.x, GY); const leg = a.hit ? 0 : Math.sin(t * 16) * 8;
    c.fillStyle = "#2c2c38"; c.fillRect(-10 + leg / 2, -40, 8, 40); c.fillRect(2 - leg / 2, -40, 8, 40);
    c.fillStyle = "#7a4b2c"; c.fillRect(-14, -86, 28, 48);
    c.fillStyle = "#e2b48c"; c.beginPath(); c.arc(0, -98, 12, 0, 7); c.fill();
    c.fillStyle = "#3a2a1e"; c.fillRect(-12, -112, 24, 6); c.fillRect(-8, -120, 16, 9);
    c.fillStyle = "#e2b48c"; c.fillRect(-22, -82, 8, 26);
    if (!a.drop) { c.fillStyle = "rgba(255,214,90,.45)"; c.beginPath(); c.arc(-18, -56, 14, 0, 7); c.fill(); c.fillStyle = "#3d8a5a"; c.fillRect(-24, -66, 12, 18); c.fillStyle = "#f0c64a"; c.fillRect(-23, -60, 10, 11); c.fillStyle = "#8b5a2b"; c.fillRect(-21, -70, 6, 4); }
    if (a.hit) { c.fillStyle = "#fff"; c.strokeStyle = "#222"; c.lineWidth = 2; c.beginPath(); c.roundRect ? c.roundRect(-70, -170, 150, 36, 10) : c.rect(-70, -170, 150, 36); c.fill(); c.stroke(); c.fillStyle = "#222"; c.font = "bold 17px sans-serif"; c.textAlign = "center"; c.fillText(T.ouch, 5, -146); }
    c.restore();
  };
  const hud = () => {
    c.fillStyle = "rgba(30,30,45,.55)"; c.beginPath(); c.roundRect ? c.roundRect(12, 12, 300, 34, 10) : c.rect(12, 12, 300, 34); c.fill();
    c.fillStyle = "#fff"; c.font = "bold 17px sans-serif"; c.textAlign = "left";
    c.fillText(`🍇 ${Math.min(S.g, 30)}/30    ${"❤".repeat(S.lives)}${"·".repeat(3 - S.lives)}`, 24, 35);
  };
  const panel = (title, sub, btn) => {
    c.fillStyle = "rgba(25,25,40,.62)"; c.fillRect(0, 0, W, H); c.textAlign = "center"; c.fillStyle = "#fff";
    c.font = "bold 30px Georgia, serif"; c.fillText(title, W / 2, 110);
    c.font = "16px sans-serif"; const words = sub.split(" "); let line = "", y = 148;
    for (const w of words) { if (c.measureText(line + w).width > 640) { c.fillText(line, W / 2, y); line = ""; y += 22; } line += w + " "; } c.fillText(line, W / 2, y);
    if (btn) { c.fillStyle = "#f0a23a"; const bw = Math.max(160, c.measureText(btn).width + 60); c.beginPath(); c.roundRect ? c.roundRect(W / 2 - bw / 2, y + 22, bw, 44, 22) : c.rect(W / 2 - bw / 2, y + 22, bw, 44); c.fill(); c.fillStyle = "#2a1a08"; c.font = "bold 18px sans-serif"; c.fillText("▶ " + btn, W / 2, y + 50); }
  };

  /* логика */
  const step = dt => {
    S.t += dt;
    S.vy += 1700 * dt; S.fy += S.vy * dt; if (S.fy > 0) { S.fy = 0; S.vy = 0; S.jumps = 0; }
    if (S.inv > 0) S.inv -= dt;
    if (mode === "run") {
      S.sp = Math.min(520, 300 + S.t * 6); S.dist += S.sp * dt;
      S.next -= dt; if (S.next <= 0) { S.obs.push({x:W + 30, k:Math.floor(Math.random() * 3)}); S.next = Math.max(.75, 1.7 - S.t * .012) + Math.random() * .9; }
      S.nextI -= dt; if (S.nextI <= 0) { const air = Math.random() < .45; S.items.push({x:W + 30, y:GY - (air ? 120 + Math.random() * 40 : 40), k:Math.random() < .1 ? "h" : "g"}); S.nextI = .45 + Math.random() * .6; }
      S.obs.forEach(ob => ob.x -= S.sp * dt); S.items.forEach(it => it.x -= S.sp * dt);
      S.obs = S.obs.filter(ob => ob.x > -60); S.items = S.items.filter(it => it.x > -40 && !it.got);
      const fx = 140, fy = GY + S.fy;
      for (const ob of S.obs) { const hh = ob.k === 2 ? 50 : ob.k === 1 ? 34 : 24, hw = ob.k === 0 ? 18 : 14;
        if (S.inv <= 0 && Math.abs(ob.x - fx) < hw + 20 && fy > GY - hh + 4) { S.lives--; S.inv = 1.3; S.vy = -380; if (S.lives <= 0) { mode = "over"; const b = best(); if (S.g > b) try { st && st.set("fox:best", S.g); } catch(_) {} } break; } }
      for (const it of S.items) if (Math.abs(it.x - fx - 10) < 30 && Math.abs(it.y - (fy - 20)) < 34) { it.got = 1; S.g += it.k === "h" ? 3 : 1; for (let k = 0; k < 8; k++) S.parts.push({x:it.x, y:it.y, vx:(Math.random() - .5) * 220, vy:-Math.random() * 220, l:.6, col:it.k === "h" ? "#ffd25a" : "#9ff2e0"}); }
      if (S.g >= 30) { mode = "boss"; S.obs = []; S.ad = {x:W + 60, hit:0, drop:0}; S.msg = T.adolfo; S.items = []; }
    } else if (mode === "boss") {
      S.dist += S.sp * dt; const a = S.ad;
      if (!a.hit) { a.x += ((a.x > 330 ? -260 : -40) + Math.sin(S.t * 3) * 30) * dt; if (a.x < 250) a.x = 250; }
      if (S.bite && !a.hit && S.fy > -10 && S.vy >= 0) { S.bite = 0; }
      if (S.bite && !a.hit && Math.abs(a.x - 190) < 90) { a.hit = 1; a.drop = 1; S.end = 1.6; S.items.push({x:a.x - 18, y:GY - 56, k:"h", fall:1}); }
      if (a.hit) { S.end -= dt; a.x += 380 * dt * (S.end < 1.1 ? 1 : 0); S.items.forEach(it => { if (it.fall) { it.y = Math.min(GY - 20, it.y + 200 * dt); it.x -= 60 * dt; } }); if (S.end <= 0) { mode = "win"; S.end = 0; const b = best(); if (S.g > b) try { st && st.set("fox:best", S.g); } catch(_) {} } }
    }
    S.parts.forEach(p => { p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 600 * dt; p.l -= dt; }); S.parts = S.parts.filter(p => p.l > 0);
  };
  const render = () => {
    const k = cv.width / W; c.setTransform(k, 0, 0, k, 0, 0);
    const t = S ? S.dist / 300 : performance.now() / 4000;
    bg(t);
    if (S) {
      S.items.forEach(it => drawItem(it, S.t)); S.obs.forEach(drawObs);
      if (S.ad) drawAdolfo(S.ad, S.t);
      drawFox(140, GY + S.fy, S.t, S.inv > 0);
      S.parts.forEach(p => { c.globalAlpha = Math.max(0, p.l / .6); c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, 3, 0, 7); c.fill(); }); c.globalAlpha = 1;
      if (mode === "run" || mode === "boss") hud();
      if (mode === "boss" && !S.ad.hit) { c.textAlign = "center"; c.fillStyle = "#fff"; c.strokeStyle = "rgba(0,0,0,.55)"; c.lineWidth = 5; c.font = "bold 22px sans-serif"; c.strokeText(S.msg, W / 2, 84); c.fillText(S.msg, W / 2, 84);
        if (Math.abs(S.ad.x - 190) < 90) { const pulse = 1 + Math.sin(S.t * 10) * .06; c.save(); c.translate(W / 2, 128); c.scale(pulse, pulse); c.font = "bold 40px sans-serif"; c.strokeText(T.bite, 0, 0); c.fillStyle = "#ffcf3f"; c.fillText(T.bite, 0, 0); c.restore(); } }
    } else drawFox(140, GY, performance.now() / 1000, false);
    const b = best();
    if (mode === "menu") panel(T.h, T.tap + (b ? ` · ${T.best}: ${b}` : ""), T.start);
    else if (mode === "over") panel(T.over, `${T.overP} 🍇 ${S.g}/30`, T.retry);
    else if (mode === "win") panel(T.win, T.winP, T.again);
  };
  const loop = ts => {
    if (!cv.isConnected) { cancelAnimationFrame(raf); window.removeEventListener("keydown", key); if (ro) ro.disconnect(); return; }
    const dt = Math.min(.033, (ts - (last || ts)) / 1000); last = ts;
    if (S && (mode === "run" || mode === "boss")) step(dt);
    render(); raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);
}

window.LitmirFader = {why, queen, fox};
})();
