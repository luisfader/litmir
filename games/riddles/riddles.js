/* «Загадки» — раздел романа: Наталья и Луис загадывают друг другу загадки о Петербурге.
   Сцена рисуется кодом (фоны Петербурга, Наталья и Луис из LitmirRunner.ext), реплики — в облачках.
   Подключение: window.LitmirRiddles.mount(el, {slug, store}). Прогресс хранится в store под ключом "rid:<slug>". */
(function(){
"use strict";
const R = window.LitmirRunner; if (!R || !R.ext) return;
const X = R.ext, {H, GY, TW, clamp, lg, glow, ell, drawNatalia} = X.h;

const SETS = {
  "rezonans-lyubvi":{
    who:{luis:"Луис", nat:"Наталья"},
    yes:{luis:["Браво, москвичка!", "Город вами доволен.", "Вы точно из Москвы?", "Верно. Петербург запомнит."], nat:["Ладно, засчитано, товарищ великан.", "Хм. Угадали.", "Слишком легко для агента!", "Верно. Не зазнавайтесь."]},
    no:{luis:["Почти. Но нет.", "Петербург хранит свои тайны.", "Не совсем, москвичка."], nat:["Ха! Даже петербуржцы ошибаются.", "Неправильно! Я это запишу.", "Агент, вы меня разочаровываете."]},
    items:[
      {by:"luis", bg:"spbDawn", q:"Загадка для москвички. Я стою на Невском и ношу имя швейной машинки, а на крыше у меня стеклянный глобус. Кто я?",
       opts:["Дом Зингера", "Елисеевский магазин", "Гостиный двор", "Казанский собор"], a:0,
       fact:"Дом компании «Зингер» построили в начале XX века, глобус на куполе — её символ. Сегодня там Дом книги — тот самый, где в романе просыпаются книги."},
      {by:"nat", bg:"spbDay", q:"Теперь моя очередь, товарищ великан. Что в Москве называют бордюром, а у вас тут…?",
       opts:["Поребрик", "Парапет", "Бровка", "Тротуар"], a:0,
       fact:"Поребрик — тот самый камень у Аничкова моста, о который Наталья споткнулась в первый день. С него всё и началось."},
      {by:"luis", bg:"spbDay", q:"На одном мосту четыре коня, их укрощают четыре юноши, и ни один конь до сих пор не убежал. Что это за мост?",
       opts:["Аничков мост", "Дворцовый мост", "Банковский мост", "Троицкий мост"], a:0,
       fact:"Скульптуры «Укрощение коня человеком» создал Пётр Клодт в XIX веке. Рядом с ними Наталья и встретила Луиса."},
      {by:"nat", bg:"spbNeva", q:"Как вы, петербуржцы, называете подъезд?",
       opts:["Парадная", "Сени", "Лестница", "Крыльцо"], a:0,
       fact:"В Петербурге подъезд — это парадная. Как и поребрик, это слово сразу выдаёт, кто здесь местный."},
      {by:"luis", bg:"spbDay", q:"Он золотой и держит кораблик на самом кончике иглы. Над каким зданием плывёт этот кораблик?",
       opts:["Адмиралтейство", "Петропавловский собор", "Исаакиевский собор", "Зимний дворец"], a:0,
       fact:"Кораблик на шпиле Адмиралтейства — один из главных символов Петербурга. Шпиль видно с Невского проспекта."},
      {by:"nat", bg:"spbNeva", q:"Каждый день ровно в полдень здесь стреляет пушка, и весь город сверяет часы. Где это?",
       opts:["Петропавловская крепость", "Дворцовая площадь", "Кронштадт", "Летний сад"], a:0,
       fact:"Полуденный выстрел гремит с Нарышкина бастиона Петропавловской крепости."},
      {by:"luis", bg:"spbNeva", q:"Им больше трёх тысяч лет, их привезли из Египта, и они лежат у Невы. В романе один из них сбежал на Миллионную. Где они лежат?",
       opts:["Университетская набережная", "Дворцовая набережная", "Английская набережная", "Набережная Фонтанки"], a:0,
       fact:"Египетские сфинксы лежат у Академии художеств на Университетской набережной Васильевского острова."},
      {by:"nat", bg:"spbWhite", q:"Летом у вас ночью светло, как вечером, и никто не хочет спать. Как это называется?",
       opts:["Белые ночи", "Полярный день", "Северное сияние", "Золотой час"], a:0,
       fact:"Белые ночи в Петербурге бывают примерно с конца мая до середины июля."},
      {by:"luis", bg:"spbWhite", q:"Ночью Нева поднимает их к небу, и кто не успел — остаётся на острове до утра. Что делают ночью с мостами?",
       opts:["Разводят", "Закрывают на ключ", "Перекрашивают", "Уносят на склад"], a:0,
       fact:"Мосты разводят по ночам с весны до осени, чтобы по Неве прошли корабли."},
      {by:"nat", bg:"spbDay", q:"Десять каменных великанов держат портик на Миллионной улице. В романе они брали двести рублей за проход! Что это за здание?",
       opts:["Новый Эрмитаж", "Русский музей", "Мариинский театр", "Кунсткамера"], a:0,
       fact:"Десять гранитных атлантов держат портик Нового Эрмитажа. В романе они однажды ушли с места — и начали брать плату."},
      {by:"luis", bg:"spbDay", q:"Как в Петербурге называют пончик с сахарной пудрой?",
       opts:["Пышка", "Ватрушка", "Бублик", "Сушка"], a:0,
       fact:"Пышки едят горячими, с кофе. Наталья собирала их в первом уровне игры."},
      {by:"nat", bg:"spbWhite", q:"Купола как разноцветные луковки, храм стоит на канале Грибоедова. Как его называют?",
       opts:["Спас на Крови", "Казанский собор", "Смольный собор", "Исаакиевский собор"], a:0,
       fact:"Храм Спаса на Крови построили на месте, где в 1881 году был смертельно ранен император Александр II."},
      {by:"luis", bg:"spbWhite", q:"Последняя. Четыре зверя с золотыми крыльями держат мост через канал Грибоедова. Как называется мост?",
       opts:["Банковский мост", "Львиный мост", "Аничков мост", "Поцелуев мост"], a:0,
       fact:"На Банковском мосту сидят четыре грифона с золотыми крыльями — родня тех, что в романе унесли Наталью над каналом."}
    ],
    ranks:[[13, "Настоящий петербуржец"], [9, "Почти петербуржец"], [5, "Турист со стажем"], [0, "Москвичка в отпуске"]]
  }
};

const CSS = `
.rd{font-family:var(--sans,system-ui)}
.rd-top{display:flex;justify-content:space-between;align-items:center;font:600 13px var(--sans);color:var(--muted);margin-bottom:8px}
.rd-dots{display:flex;gap:4px;flex-wrap:wrap}.rd-dots i{width:8px;height:8px;border-radius:50%;background:var(--line)}.rd-dots i.ok{background:#3aa55a}.rd-dots i.bad{background:#d9534f}.rd-dots i.cur{outline:2px solid var(--accent);outline-offset:1px}
.rd-scene{position:relative;border-radius:16px;overflow:hidden;box-shadow:0 2px 6px rgba(40,20,10,.12),0 14px 30px rgba(40,20,10,.16);background:#ccc}
.rd-scene canvas{display:block;width:100%}
.rd-bub{position:absolute;top:12px;max-width:min(76%,460px);background:#fffdf8;color:#2a2018;border-radius:14px;padding:10px 14px;font:500 clamp(15px,2.1vw,17px)/1.42 var(--sans,system-ui);box-shadow:0 3px 10px rgba(0,0,0,.18);animation:rdIn .35s ease-out}
.rd-bub b{display:block;font:700 11px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--accent);margin-bottom:3px}
.rd-bub::after{content:"";position:absolute;bottom:-9px;width:0;height:0;border:10px solid transparent;border-top-color:#fffdf8;border-bottom:0}
.rd-bub.l{left:12px}.rd-bub.l::after{left:22%}.rd-bub.r{right:12px}.rd-bub.r::after{right:22%}
@keyframes rdIn{from{opacity:0;transform:translateY(6px) scale(.97)}to{opacity:1;transform:none}}
.rd-ask{font:600 13px var(--sans);color:var(--muted);margin:12px 0 8px}
.rd-opts{display:grid;grid-template-columns:repeat(auto-fill,minmax(200px,1fr));gap:8px}
.rd-opts button{appearance:none;text-align:left;border:1.5px solid var(--line);background:var(--paper);color:var(--ink);border-radius:12px;padding:12px 14px;font:600 15px var(--sans);cursor:pointer;transition:transform .12s,border-color .12s}
.rd-opts button:hover:not([disabled]){border-color:var(--accent);transform:translateY(-1px)}
.rd-opts button.ok{background:#e3f5e6;border-color:#3aa55a;color:#1f5a2c}.rd-opts button.bad{background:#fbe5e3;border-color:#d9534f;color:#7a2320}
.rd-opts button[disabled]{cursor:default}
.rd-fact{margin-top:12px;background:var(--accent-soft);border-radius:12px;padding:12px 14px;font:14px/1.55 var(--sans);color:var(--ink)}
.rd-fact b{color:var(--accent)}
.rd-row{display:flex;gap:8px;justify-content:flex-end;margin-top:12px;flex-wrap:wrap}
.rd-btn{appearance:none;border:0;border-radius:999px;padding:10px 22px;font:600 15px var(--sans);color:#fff;background:var(--accent);cursor:pointer}
.rd-btn.ghost{background:transparent;color:var(--accent);border:1.5px solid var(--accent)}
.rd-end{text-align:center;padding:6px 0}.rd-end h3{font-family:var(--serif,Georgia,serif);font-weight:400;font-size:26px;margin:10px 0 4px;color:var(--ink)}.rd-end p{color:var(--muted);margin:0 0 6px}`;

function mount(el, opt){
  const S = SETS[opt.slug]; if (!S) return false;
  if (!document.getElementById("rdCss")) { const st = document.createElement("style"); st.id = "rdCss"; st.textContent = CSS; document.head.appendChild(st); }
  const store = opt.store, key = "rid:" + opt.slug, N = S.items.length;
  let st = store.get(key, null) || {i:0, ans:{}};
  const save = () => store.set(key, st);
  const score = () => Object.keys(st.ans).filter(k => st.ans[k] === S.items[k].a).length;
  const cache = {};
  function sceneLayers(theme, sc){
    const id = theme + ":" + sc; if (cache[id]) return cache[id];
    const T = X.THEMES[theme];
    return cache[id] = T.layers.map((ly, i) => { const lc = document.createElement("canvas"); lc.width = TW * sc; lc.height = H * sc; const x = lc.getContext("2d"); x.scale(sc, sc); ly.paint(x, X.h.rng(11 + i * 13)); return {cv:lc, f:ly.f}; });
  }
  function drawScene(cv, it, idx, mood){
    // на узком экране сверху добавляется небо, чтобы облачко с загадкой не закрывало героев
    const w = cv.clientWidth || 600, base = Math.round(clamp(w * .62, 250, 360)), extra = w < 560 ? Math.round(clamp(150 - w * .05, 110, 150)) : 0;
    const hpx = base + extra, dpr = Math.min(2, window.devicePixelRatio || 1), k = base / H, VW = w / k;
    cv.style.height = hpx + "px"; cv.width = Math.round(w * dpr); cv.height = Math.round(hpx * dpr);
    const c = cv.getContext("2d"), T = X.THEMES[it.bg], sc = clamp(k * dpr, 1, 2);
    c.setTransform(1, 0, 0, 1, 0, 0); c.fillStyle = lg(c, 0, 0, 0, cv.height * .8, [T.sky[0], T.sky[0], T.sky[1]]); c.fillRect(0, 0, cv.width, cv.height);
    c.setTransform(k * dpr, 0, 0, k * dpr, 0, extra * dpr);
    c.fillStyle = lg(c, 0, 0, 0, GY, T.sky); c.fillRect(0, 0, VW, H);
    if (T.sun) { glow(c, T.sun.x * VW, T.sun.y, T.sun.r * 4, T.sun.col, .55); ell(c, T.sun.x * VW, T.sun.y, T.sun.r, T.sun.r, `rgba(${T.sun.col},1)`); }
    if (T.moon) { glow(c, T.moon.x * VW, T.moon.y, T.moon.r * 6, "220,225,255", .3); ell(c, T.moon.x * VW, T.moon.y, T.moon.r, T.moon.r, "#f3f0dc"); }
    const scroll = 200 + idx * 410, L = sceneLayers(it.bg, sc);
    for (const ly of L) { if (ly.f >= 1) continue; const off = ((scroll * ly.f) % TW + TW) % TW; c.drawImage(ly.cv, -off, 0, TW, H); if (TW - off < VW) c.drawImage(ly.cv, TW - off, 0, TW, H); }
    T.ground(c, scroll, VW + 2);
    for (const ly of L) { if (ly.f < 1) continue; const off = scroll % TW; c.drawImage(ly.cv, -off, 0, TW, H); if (TW - off < VW) c.drawImage(ly.cv, TW - off, 0, TW, H); }
    const nx = VW * .5 - 46, lx = VW * .5 + 46;
    const HS = X.HEROES[opt.slug] ? X.HEROES[opt.slug](it.bg === "spbDay" ? 1 : it.bg === "spbNeva" ? 2 : 3) : null;
    // Наталья: обычная поза, радуется (руки вверх) или огорчается
    const P = Object.assign({}, X.POSES.idle);
    if (mood === "natWin") Object.assign(P, {a1:2.7, e1:.2, a2:2.4, e2:.3, mouth:1});
    if (mood === "natLose") Object.assign(P, {lean:-.1, a1:.9, e1:2.4});
    c.save(); c.translate(nx, GY); c.scale(1.15, 1.15); drawNatalia(c, 0, 0, P, 1.3, 0, HS); c.restore();
    c.save(); X.PEOPLE.luis(c, lx, GY, 1.7); c.restore();
    if (mood === "luisWin" || mood === "natWin") glow(c, mood === "natWin" ? nx : lx, GY - 70, 90, "255,220,120", .25);
  }
  function render(){
    el.innerHTML = "";
    const root = document.createElement("div"); root.className = "rd"; el.appendChild(root);
    if (st.i >= N) return renderEnd(root);
    const it = S.items[st.i], other = it.by === "luis" ? "nat" : "luis", chosen = st.ans[st.i];
    const answered = chosen !== undefined, ok = chosen === it.a;
    root.innerHTML = `<div class="rd-top"><span>Загадка ${st.i + 1} из ${N} · отгадано ${score()}</span><span class="rd-dots">${S.items.map((q, j) => `<i class="${st.ans[j] === undefined ? "" : st.ans[j] === q.a ? "ok" : "bad"}${j === st.i ? " cur" : ""}"></i>`).join("")}</span></div>
      <div class="rd-scene"><canvas></canvas></div>
      <div class="rd-ask">${S.who[it.by]} загадывает — ты отвечаешь за ${other === "nat" ? "Наталью" : "Луиса"}:</div>
      <div class="rd-opts">${it.opts.map((o, j) => `<button type="button" data-o="${j}"${answered ? " disabled" : ""} class="${answered ? (j === it.a ? "ok" : j === chosen ? "bad" : "") : ""}">${o}</button>`).join("")}</div>
      ${answered ? `<div class="rd-fact"><b>${ok ? "Верно!" : `Правильный ответ: ${it.opts[it.a]}.`}</b> ${it.fact}</div>
      <div class="rd-row">${st.i > 0 ? `<button class="rd-btn ghost" data-act="prev">← Назад</button>` : ""}<button class="rd-btn" data-act="next">${st.i < N - 1 ? "Следующая загадка →" : "Итог"}</button></div>` : ""}`;
    const scene = root.querySelector(".rd-scene"), cv = scene.querySelector("canvas");
    const mood = !answered ? null : ok ? (other === "nat" ? "natWin" : "luisWin") : (other === "nat" ? "natLose" : "luisLose");
    drawScene(cv, it, st.i, mood);
    const bub = (who, text) => { const b = document.createElement("div"); b.className = "rd-bub " + (who === "nat" ? "l" : "r"); b.innerHTML = `<b>${S.who[who]}</b>${text}`; scene.appendChild(b); };
    if (!answered) bub(it.by, it.q);
    else { const pool = ok ? S.yes[it.by] : S.no[it.by]; bub(it.by, pool[st.i % pool.length]); }
    root.querySelectorAll("[data-o]").forEach(b => b.onclick = () => { st.ans[st.i] = +b.dataset.o; save(); render(); });
    const nx = root.querySelector("[data-act=next]"); if (nx) nx.onclick = () => { st.i++; save(); render(); root.scrollIntoView({block:"nearest"}); };
    const pv = root.querySelector("[data-act=prev]"); if (pv) pv.onclick = () => { st.i--; save(); render(); };
  }
  function renderEnd(root){
    const sc = score(), rank = S.ranks.find(r => sc >= r[0])[1];
    root.innerHTML = `<div class="rd-scene"><canvas></canvas></div>
      <div class="rd-end"><h3>${rank}</h3><p>Отгадано ${sc} из ${N} загадок о Петербурге.</p></div>
      <div class="rd-row" style="justify-content:center"><button class="rd-btn ghost" data-act="review">Посмотреть ответы</button><button class="rd-btn" data-act="again">Загадать заново</button></div>`;
    const scene = root.querySelector(".rd-scene"), cv = scene.querySelector("canvas");
    drawScene(cv, {bg:"spbSunset"}, 3, sc >= 9 ? "natWin" : null);
    const b = document.createElement("div"); b.className = "rd-bub r"; b.innerHTML = `<b>Луис</b>${sc >= 9 ? "Признаю: Петербург вас принял. Даже поребрики." : "Ничего. Город открывает тайны не сразу — приходите ещё."}`; scene.appendChild(b);
    root.querySelector("[data-act=again]").onclick = () => { st = {i:0, ans:{}}; save(); render(); };
    root.querySelector("[data-act=review]").onclick = () => { st.i = 0; save(); render(); };
  }
  render();
  let rt = 0; const onR = () => { if (!el.isConnected) return window.removeEventListener("resize", onR); clearTimeout(rt); rt = setTimeout(() => { const cv = el.querySelector(".rd-scene canvas"); if (cv) render(); }, 150); };
  window.addEventListener("resize", onR);
  return true;
}
window.LitmirRiddles = {mount, has(slug){ return !!SETS[slug]; }, count(slug){ return SETS[slug] ? SETS[slug].items.length : 0; }};
})();
