/* «Аномальный час» — два раздела романа:
   LitmirAnomal.map   — «Карта Москвы»: нарисованная карта хранителя, места романа и эпохи, в которые там открывалась Москва;
   LitmirAnomal.diary — «Дневник хранителя»: странные страницы дневника Никиты Андреевича (прапрадеда Натальи):
                        проступающие буквы, страница 27, которая переписывает себя, ультрафиолет под зачёркнутым листом.
   Всё рисуется кодом (SVG), картинки — иллюстрации глав из novels/anomalnyj-chas/img. Подключается из index.html по требованию. */
(function(){
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IMG = "novels/anomalnyj-chas/img/", SLUG = "anomalnyj-chas";

function fonts(){
  if (document.getElementById("anFonts")) return;
  const l = document.createElement("link"); l.id = "anFonts"; l.rel = "stylesheet";
  l.href = "https://fonts.googleapis.com/css2?family=Marck+Script&family=Bad+Script&family=Caveat:wght@500;700&family=Neucha&display=swap";
  document.head.appendChild(l);
}
function css(){
  if (document.getElementById("anCss")) return;
  const s = document.createElement("style"); s.id = "anCss";
  s.textContent = `
.an{font-family:var(--sans);color:var(--ink)}.an h3{font:400 22px var(--serif);margin:2px 0 8px}.an .an-p{font:14px/1.55 var(--sans);color:var(--muted);margin:0 0 12px}
.an-paper{background:#efe2c2;background-image:radial-gradient(ellipse at 30% 20%,rgba(255,250,235,.55),transparent 60%),radial-gradient(circle at 85% 80%,rgba(120,80,30,.16),transparent 35%),radial-gradient(circle at 12% 88%,rgba(120,80,30,.12),transparent 30%),radial-gradient(ellipse at center,transparent 55%,rgba(90,55,20,.28) 100%);box-shadow:0 2px 14px rgba(60,35,10,.25),inset 0 0 40px rgba(110,70,25,.25);border-radius:6px;color:#2b1d10}
.an-map{position:relative;border-radius:10px;overflow:hidden}.an-map svg{display:block;width:100%;height:auto}
.an-map .pin{cursor:pointer;outline:none}.an-map .pin:focus-visible circle.seal{stroke:#ffcf3f;stroke-width:4}.an-map .pin circle.seal{transition:r .15s}.an-map .pin:hover circle.seal,.an-map .pin.on circle.seal{r:19}
.an-map .pin.dim{opacity:.18;pointer-events:none}.an-map .pin text{font:700 15px Inter,sans-serif;fill:#fff;pointer-events:none}
.an-eras{display:flex;flex-wrap:wrap;gap:6px;margin:0 0 10px}.an-eras button{font:600 12px var(--sans);border:2px solid var(--c);color:var(--ink);background:transparent;border-radius:999px;padding:5px 10px;cursor:pointer;display:inline-flex;align-items:center;gap:6px}
.an-eras button i{width:9px;height:9px;border-radius:50%;background:var(--c);display:inline-block}.an-eras button.on{background:var(--c);color:#fff}.an-eras button.on i{background:#fff}
.an-tools{display:flex;gap:8px;flex-wrap:wrap;margin:10px 0}.an-btn{font:600 13px var(--sans);border:0;border-radius:999px;padding:9px 16px;background:var(--accent);color:#fff;cursor:pointer}.an-btn.ghost{background:var(--bg);color:var(--ink)}
.an-card{display:grid;grid-template-columns:200px 1fr;gap:14px;background:var(--bg);border-radius:14px;padding:12px;margin:10px 0}.an-card img{width:100%;border-radius:10px;aspect-ratio:4/3;object-fit:cover}
.an-card h4{font:400 21px var(--serif);margin:0 0 4px}.an-card p{font:14.5px/1.55 var(--sans);margin:6px 0}.an-card a{color:var(--accent);font-weight:600;text-decoration:none}
.an-chip{display:inline-block;font:600 11px var(--sans);color:#fff;border-radius:999px;padding:3px 8px;margin:2px 4px 2px 0}
.an-list{list-style:none;margin:8px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:4px 14px}.an-list li button{all:unset;cursor:pointer;display:flex;gap:8px;align-items:baseline;font:14px/1.35 var(--sans);padding:4px 0}
.an-list li button b{min-width:22px;height:22px;border-radius:50%;color:#fff;font:700 11px/22px Inter,sans-serif;text-align:center;flex:none}.an-list li button:hover span{color:var(--accent)}
@media (max-width:560px){.an-card{grid-template-columns:1fr}.an-list{grid-template-columns:1fr}}
.an-book{position:relative;max-width:600px;margin:0 auto;perspective:1600px}
.an-page{position:relative;min-height:560px;padding:34px 30px 46px 40px;font:21px/1.5 'Marck Script',cursive;transform-origin:left center;overflow:hidden}
.an-page::before{content:"";position:absolute;left:0;top:0;bottom:0;width:26px;background:linear-gradient(90deg,rgba(80,50,20,.35),rgba(80,50,20,0));pointer-events:none}
.an-page .dt{font:700 20px 'Marck Script',cursive;display:block;margin:0 0 6px;color:#3b2611}.an-page p{margin:0 0 8px}
.an-page .no{position:absolute;bottom:14px;right:22px;font:16px 'Marck Script',cursive;color:#6d5232}
.an-page .note{font:italic 14px/1.45 'PT Serif',serif;color:#6d5232;margin:10px 0}
.an-page .emil{font:19px/1.55 'Bad Script',cursive;color:#2f2140}.an-page .blue{font:20px/1.45 Neucha,cursive;color:#1f3f8f}.an-page .pencil{font:600 24px/1.35 Caveat,cursive;color:#555;transform:rotate(-2deg);display:block}
.an-page svg{display:block;margin:6px auto}.an-ink{color:#24170a}
.an-turn{animation:anTurn .55s ease}@keyframes anTurn{0%{transform:rotateY(-70deg);opacity:.2}100%{transform:none;opacity:1}}
.an-nav{display:flex;align-items:center;justify-content:space-between;gap:10px;margin:12px 0 0}.an-nav button{font:600 14px var(--sans);border:0;border-radius:999px;padding:9px 16px;background:var(--accent);color:#fff;cursor:pointer}.an-nav button:disabled{opacity:.35;cursor:default}
.an-nav span{font:600 13px var(--sans);color:var(--muted)}
.an-dots{display:flex;flex-wrap:wrap;justify-content:center;gap:5px;margin:10px 0 0}.an-dots button{width:9px;height:9px;border-radius:50%;border:0;padding:0;background:var(--muted);opacity:.35;cursor:pointer}.an-dots button.on{opacity:1;background:var(--accent)}
.an-appear span{opacity:0;animation:anApp .9s forwards;filter:blur(2px)}@keyframes anApp{to{opacity:1;filter:none}}
.an-fresh{background:linear-gradient(100deg,#2f2140 40%,#6a4b9a 50%,#2f2140 60%);background-size:300% 100%;-webkit-background-clip:text;background-clip:text;color:transparent;animation:anShine 3.5s linear infinite}@keyframes anShine{from{background-position:100% 0}to{background-position:-100% 0}}
.an-fade{transition:opacity .6s,filter .6s}.an-fade.out{opacity:0;filter:blur(3px)}
.an-uv{position:relative;min-height:400px;touch-action:none}.an-uv .hid{position:absolute;inset:0;padding:4px 2px;font:18px/1.5 'Marck Script',cursive;color:#c49bff;text-shadow:0 0 6px rgba(190,140,255,.9);opacity:0;pointer-events:none;
 -webkit-mask-image:radial-gradient(circle var(--r,95px) at var(--x,50%) var(--y,40%),#000 55%,transparent 100%);mask-image:radial-gradient(circle var(--r,95px) at var(--x,50%) var(--y,40%),#000 55%,transparent 100%);overflow:hidden}
.an-uv.on .hid{opacity:1}.an-uv.on.all .hid{-webkit-mask-image:none;mask-image:none}
.an-uv .lamp{position:absolute;width:190px;height:190px;margin:-95px 0 0 -95px;left:var(--x,50%);top:var(--y,40%);border-radius:50%;background:radial-gradient(circle,rgba(150,80,255,.28),rgba(80,20,160,.05) 70%,transparent 72%);pointer-events:none;display:none;mix-blend-mode:multiply}
.an-uv.on .lamp{display:block}.an-uv.on.all .lamp{display:none}.an-uv.on .scrib{opacity:.55}
.an-page.dark{background:#1b1030;transition:background .4s}.an-page.dark .no{color:#a58bd4}
.an-blot{position:relative}.an-blot svg{position:absolute;left:0;right:0;margin:auto}
@media (max-width:560px){.an-page{padding:26px 18px 44px 30px;font-size:19px;min-height:520px}.an-page .emil{font-size:17px}}`;
  document.head.appendChild(s);
}

/* ═════════════ 1. Карта Москвы ═════════════ */
const ERAS = [
  {k:"2026", t:"2026 · наши дни", c:"#2f6f8f"},
  {k:"1242", t:"XIII век · тевтонцы", c:"#6e6e6e"},
  {k:"1571", t:"1571 · Иван Грозный", c:"#8b1e1e"},
  {k:"1606", t:"1606 · Лжедмитрий", c:"#b5651d"},
  {k:"1697", t:"1697 · заговор Циклера", c:"#4f7a28"},
  {k:"1812", t:"1812 · Наполеон", c:"#1f3a7a"},
  {k:"1876", t:"1876–1913 · хранитель Никита", c:"#7a5a2a"},
  {k:"1917", t:"1917 · революция", c:"#c0392b"},
  {k:"1979", t:"1979 · правнук хранителя", c:"#5b4a8a"}
];
const EC = Object.fromEntries(ERAS.map(e => [e.k, e]));
const PLACES = [
  {id:"patr", n:"Патриаршие пруды", ll:[55.7637,37.5925], e:["2026","1812","1571","1917","1876"], ch:[1,2,26,27], img:"02b.jpg",
   d:"Здесь всё началось. Луис ищет метро и третий раз возвращается к пруду, Наталья показывает дорогу. В кафе у окна — один кофе на двоих, разбитая чашка и Наполеон с французскими солдатами прямо за стеклом. 25 августа в 21:03 здесь открывается сам Аномальный час: всадники в чёрном с собачьими головами у сёдел, пожар, броневик с красным флагом — и матрос, который с интересом смотрит на Плюшку.",
   h:"В 1913-м на этой же скамейке хранитель Никита увидел женщину со «светящейся плиткой, на которой нарисованы улицы». А у пруда Эмиль встретил Веру — и в тот день родился Час."},
  {id:"gruz", n:"Малая Грузинская, католический собор", ll:[55.7676,37.5730], e:["2026","1242","1876"], ch:[3], img:"03a.jpg",
   d:"Сумерки, фонари вдоль Малой Грузинской — и серебристый разлом, из которого один за другим выходят пятеро рыцарей в белых плащах с чёрными крестами. Тевтонский орден посреди припаркованных машин. Пятый — заметно моложе остальных.",
   h:"20 августа 1913 года Никита записал: у только что достроенного собора стоял в переулке рыцарь в белом плаще с чёрным крестом. «Совсем молодой, почти мальчик»."},
  {id:"khov", n:"Квартира Натальи в Ховрине", ll:[55.8590,37.5190], e:["2026","1242","1876"], ch:[4,6], img:"06b.jpg",
   d:"Ночью спальня Натальи на мгновение превращается в бедный деревянный дом старого Ховрина. Потом в подъезд приходят тевтонцы: рыцари у лифта, соседка в халате с чугунной сковородой, полиция, пули отскакивают от щитов. Наталья уходит — и прогоняет рыцарей автомобильной сигнализацией.",
   h:"Ховрино — родное село хранителей. «Дед, отец, я — все мы когда-то бегали тут босиком», — писал Никита в 1912-м. «Хорошо, что город сюда не дошёл. Хотя дойдёт, конечно»."},
  {id:"vor", n:"Воробьёвы горы", ll:[55.7106,37.5536], e:["2026","1571"], ch:[7,8], img:"07d.jpg",
   d:"Тихое место у смотровой, внизу огромный город. Луис наконец рассказывает про Аномальный час — и Москва вокруг машины проваливается в XVI век: грязные дороги, деревянные заборы, стрельцы, всадники и стрела, вонзившаяся в забор у самого Peugeot."},
  {id:"krem", n:"Кремль", ll:[55.7520,37.6175], e:["1571","1606"], ch:[8,16,17], img:"08c.jpg",
   d:"Москва Ивана Грозного: Кремль белый — «белокаменная Москва». У башни — Елисей Бомелий, лекарь, астролог и алхимик царя, «Распутин шестнадцатого века». Великий свиток у него. Наталья смеётся слишком громко — и им приходится бежать.",
   h:"Май 1606 года: «Люди Шуйского подняли народ! К Кремлю! Сегодня самозванцу конец!» Лжедмитрия убьют в тот же день."},
  {id:"krym", n:"Крымский мост", ll:[55.7340,37.6000], e:["2026"], ch:[9], img:"09a.jpg",
   d:"Вечер 24 августа. Серый Peugeot 407 стоит у моста, Луис и Наталья смотрят на машины. После стрел, всадников и гонки к закрывающемуся окну обычный городской шум кажется почти успокаивающим."},
  {id:"shop", n:"«Небесная любовь», магазин Алисии", ll:[55.8045,37.6385], e:["2026"], ch:[9,11,12,20,22,23,24,25], img:"09c.jpg",
   d:"Эзотерический магазин у проспекта Мира: свечи, хрустальные шары, книги и хозяйка, которая знает больше, чем кажется. Штаб героев. Здесь тевтонцы крадут дневник, здесь пергаменты складывают в круг по линиям испанских карт, здесь Марк возвращается из «других Москв», а один рыцарь садится прямо на коробку с ароматическими свечами."},
  {id:"ost", n:"Останкинская башня", ll:[55.8197,37.6117], e:["2026","1242","1876"], ch:[12], img:"12b.jpg",
   d:"Погоня за тевтонцами на краденых мотоциклах через ночную Москву — мимо огней ВДНХ, к игле башни. Серебристый разлом. Здесь Луис отпускает самого молодого рыцаря.",
   h:"В Останкине в 1913-м ведунья Агафья отдала хранителю четвёртый свиток — он лежал в сундуке, завёрнутый в вышитое полотенце, рядом со старым железным ключом."},
  {id:"lib", n:"Библиотека № 27, Ховрино", ll:[55.8770,37.4930], e:["2026","1979"], ch:[13], img:"13b.jpg",
   d:"«Двадцать седьмой дом слова», где «книги стоят вместо стражей, а чужая речь скрывает то, что не должно быть прочитано». Посреди урока испанского Луис вытаскивает из стены первый пергамент.",
   h:"14 мая 1979 года правнук хранителя записал синей ручкой: «Сегодня в Ховрино начали строить библиотеку. Номер двадцать семь. Совпадение, конечно»."},
  {id:"azs", n:"Заправка на Ленинградском шоссе", ll:[55.8440,37.4880], e:["2026","1697"], ch:[14,15], img:"14a.jpg",
   d:"Посреди ночи над городом вдруг сияет солнце. На заправке рекламные щиты становятся прозрачными, асфальт превращается в грязь — и появляются стрельцы. Примерно 1697 год. Peugeot прячут в сарае, героев переодевают в кафтаны и юбки, и они идут пешком к дому Ивана Циклера — того, кто «служил двум хозяевам и обоих предал»."},
  {id:"push", n:"Памятник Пушкину, Пушкинская площадь", ll:[55.7656,37.6055], e:["2026","1606"], ch:[16], img:"16b.jpg",
   d:"«Спор двух словесников. Один стоит там, где имя его повторяет площадь…» Один конец тонкого серого кабеля — здесь, у Пушкина. Не самая обычная прогулка по бульварам.",
   h:"В 1913-м Никита не понял подсказку: Пушкин тогда стоял на Страстной площади, и «никакая площадь в Москве так не зовётся»."},
  {id:"gog", n:"Памятник Гоголю на бульваре", ll:[55.7505,37.6000], e:["2026","1606"], ch:[16,17], img:"16d.jpg",
   d:"«…Другой смотрит на Москву со своего бульвара». Белая линия пробегает по кабелю от Пушкина к Гоголю — и открывается дверь в май 1606-го: Шуйские поднимают народ, по улицам ловят поляков, в кабаке пытаются изгнать «дымную кошку». Это Плюшка."},
  {id:"mus", n:"Музей Отечественной войны 1812 года", ll:[55.7563,37.6188], e:["2026","1812"], ch:[20,21], img:"21b.jpg",
   d:"«Память Двенадцатого года хранит следующий след. Ищи там, где войну с французом превратили в историю и сохранили рядом с Красной площадью». Утро 25 августа — и прямо отсюда в лагерь Наполеона: пушки, дым, маршал Даву и фургон с пергаментами."},
  {id:"sad", n:"Садовое кольцо", ll:[55.7700,37.5963], e:["2026"], ch:[24], img:"24a.jpg",
   d:"Ночная погоня: Peugeot против тевтонцев на мотоциклах. Редкие такси, одинокий троллейбус — и рыцарь, который на светофоре старательно пропускает встречную машину."},
  {id:"tver", n:"Тверской бульвар и Никитские ворота", ll:[55.7580,37.5985], e:["2026","1876","1917"], ch:[27], img:"27a.jpg",
   d:"Последняя ночь — просто прогулка, «как у нормальных людей». Тверской бульвар, Никитские ворота, где бабушка Натальи когда-то снимала комнату, Москва-река — и снова скамейка у Патриарших. На рассвете из-за угла выезжает первый утренний трамвай.",
   h:"В 1913-м на Тверском бульваре Никите встретились Маги Севера в светлых пальто: «Добрый вечер, хранитель. Передавайте поклон сестре». В ноябре 1917-го у Никитских ворот стреляли, и неделю семья сидела в подвале."},
  {id:"sukh", n:"Сухарева башня (снесена в 1934 году)", ll:[55.7722,37.6335], e:["1876"], ch:[30], img:null,
   d:"14 марта 1877 года, шестой час вечера: посреди площади стрелец с бердышом смотрит на конку, «будто видел чёрта». Никита бьёт по камню у основания башни три раза — не два и не четыре — и стрелец исчезает. Остаётся запах дыма и мокрой шерсти.",
   h:"В августе 1913-го за кладкой у лестницы нашли первый свиток. Городовому Эмиль сказал: «Я есть художник. Я рисую стена»."},
  {id:"kit", n:"Китай-город, Ильинка", ll:[55.7553,37.6282], e:["1876"], ch:[30], img:null,
   d:"9 августа 1913 года: второй и третий свитки — в подвале старого купеческого дома. Лысый и злой хозяин гнался за хранителем и Эмилем с поленом до самой Ильинки. «Эмиль бежал и смеялся. Я бежал и думал, что для таких развлечений шестьдесят два уже многовато»."},
  {id:"vag", n:"Ваганьковское кладбище", ll:[55.7686,37.5520], e:["1876"], ch:[30], img:null,
   d:"Здесь в октябре 1876-го похоронили отца Никиты — шёл мокрый снег. Шестой свиток лежал в часовне у его могилы. «Отец знал. Всё это время знал, где он, и молчал»."},
  {id:"mya", n:"Мясницкая, архив хранителей", ll:[55.7628,37.6368], e:["1876"], ch:[30], img:null,
   d:"Архив, куда велел сходить отец. Старик-архивариус, «сухой, как вобла», посмотрел на знак на перстне и сказал только: «Наконец-то». В августе 1914-го на Мясницкой толпа пела гимн и била витрины немецких магазинов."}
];
const ROUTE = ["patr","gruz","khov","vor","krem","krym","shop","ost","lib","azs","push","gog","shop","mus","shop","sad","patr","tver","patr"];
const K0 = [55.7520, 37.6175];
function proj(ll){
  const dx = (ll[1] - K0[1]) * 111.32 * Math.cos(K0[0] * Math.PI / 180), dy = (ll[0] - K0[0]) * 110.57;
  const r = Math.hypot(dx, dy); if (r < 1e-6) return [500, 560];
  const R = 6 * Math.log(1 + r / 1.2) * 30;
  return [500 + dx / r * R, 560 - dy / r * R];
}
const pts = a => a.map(p => proj(p).map(v => v.toFixed(1)).join(",")).join(" ");
const smooth = a => { const P = a.map(proj); let d = `M${P[0][0].toFixed(1)},${P[0][1].toFixed(1)}`;
  for (let i = 1; i < P.length - 1; i++) { const mx = (P[i][0] + P[i + 1][0]) / 2, my = (P[i][1] + P[i + 1][1]) / 2; d += ` Q${P[i][0].toFixed(1)},${P[i][1].toFixed(1)} ${mx.toFixed(1)},${my.toFixed(1)}`; }
  const L = P[P.length - 1]; return d + ` L${L[0].toFixed(1)},${L[1].toFixed(1)}`; };
const RIVER = [[55.770,37.455],[55.758,37.482],[55.750,37.505],[55.748,37.535],[55.754,37.560],[55.752,37.575],[55.744,37.570],[55.737,37.566],[55.727,37.556],[55.717,37.552],[55.712,37.562],[55.716,37.580],[55.725,37.596],[55.734,37.601],[55.743,37.607],[55.748,37.614],[55.7485,37.627],[55.744,37.642],[55.735,37.650],[55.722,37.665],[55.705,37.695]];
const TVER = [[55.7560,37.6130],[55.7656,37.6055],[55.7700,37.5963],[55.7770,37.5820],[55.7900,37.5600],[55.8050,37.5150],[55.8250,37.4970],[55.8440,37.4880],[55.8560,37.4790]];
const MIRA = [[55.7600,37.6330],[55.7720,37.6335],[55.7810,37.6330],[55.7950,37.6370],[55.8090,37.6400],[55.8230,37.6440]];
const ring = km => { const a = []; for (let i = 0; i <= 64; i++) { const t = i / 64 * Math.PI * 2, dx = Math.cos(t) * km, dy = Math.sin(t) * km * .92;
  a.push([K0[0] + dy / 110.57, K0[1] + dx / (111.32 * Math.cos(K0[0] * Math.PI / 180))]); } return a; };

function mapSVG(){
  const np = PLACES.map((p, i) => ({...p, i:i + 1, xy:proj(p.ll)}));
  const ROUGH = `<filter id="anR"><feTurbulence type="fractalNoise" baseFrequency=".035" numOctaves="2" seed="4"/><feDisplacementMap in="SourceGraphic" scale="5"/></filter>`;
  const lbl = (ll, t, dx, dy, sz, rot) => { const [x, y] = proj(ll); return `<text x="${(x + (dx || 0)).toFixed(0)}" y="${(y + (dy || 0)).toFixed(0)}" font-family="Marck Script, cursive" font-size="${sz || 26}" fill="#5a3c1c" ${rot ? `transform="rotate(${rot} ${x.toFixed(0)} ${y.toFixed(0)})"` : ""}>${t}</text>`; };
  const route = ROUTE.map(id => np.find(p => p.id === id).xy);
  let rd = `M${route[0][0].toFixed(0)},${route[0][1].toFixed(0)}`; for (let i = 1; i < route.length; i++) { const a = route[i - 1], b = route[i], mx = (a[0] + b[0]) / 2 + (b[1] - a[1]) * .18, my = (a[1] + b[1]) / 2 - (b[0] - a[0]) * .18; rd += ` Q${mx.toFixed(0)},${my.toFixed(0)} ${b[0].toFixed(0)},${b[1].toFixed(0)}`; }
  const [kx, ky] = proj(K0);
  return `<svg viewBox="0 0 1000 1000" role="img" aria-label="Карта Москвы хранителя">
  <defs>${ROUGH}<radialGradient id="anVig" cx="50%" cy="50%" r="70%"><stop offset="60%" stop-color="#000" stop-opacity="0"/><stop offset="100%" stop-color="#5a3510" stop-opacity=".35"/></radialGradient>
  <pattern id="anHatch" width="8" height="8" patternUnits="userSpaceOnUse" patternTransform="rotate(35)"><line x1="0" y1="0" x2="0" y2="8" stroke="#8a6a3a" stroke-width="1" opacity=".35"/></pattern></defs>
  <rect width="1000" height="1000" fill="#efe2c2"/>
  <g filter="url(#anR)" fill="none" stroke-linecap="round">
    <path d="${smooth(RIVER)}" stroke="#7d9db0" stroke-width="16" opacity=".55"/>
    <path d="${smooth(RIVER)}" stroke="#4d6e85" stroke-width="2" opacity=".7"/>
    <polyline points="${pts(ring(2.35))}" stroke="#7a5a2a" stroke-width="3" stroke-dasharray="10 7" opacity=".55"/>
    <polyline points="${pts(ring(1.35))}" stroke="#4f7a28" stroke-width="3" stroke-dasharray="2 7" opacity=".55"/>
    <path d="${smooth(TVER)}" stroke="#7a5a2a" stroke-width="4" opacity=".45"/>
    <path d="${smooth(MIRA)}" stroke="#7a5a2a" stroke-width="4" opacity=".45"/>
    <path d="M${kx - 22},${ky + 16} L${kx - 8},${ky - 22} L${kx + 26},${ky - 14} L${kx + 20},${ky + 18} Z" stroke="#8b1e1e" stroke-width="3" fill="url(#anHatch)"/>
    <ellipse cx="${proj([55.7637,37.5925])[0].toFixed(0)}" cy="${proj([55.7637,37.5925])[1].toFixed(0)}" rx="16" ry="10" stroke="#4d6e85" stroke-width="2" fill="#a9c2cf"/>
    ${(() => { const [x, y] = proj([55.8197,37.6117]); return `<path d="M${x},${y - 70} L${x - 5},${y} L${x + 5},${y} Z M${x - 12},${y - 40} h24" stroke="#5a3c1c" stroke-width="2.5"/>`; })()}
    ${(() => { const [x, y] = proj([55.7722,37.6335]); return `<path d="M${x - 9},${y} v-26 h18 v26 M${x - 6},${y - 26} v-12 h12 v12 M${x},${y - 38} v-14" stroke="#5a3c1c" stroke-width="2"/>`; })()}
  </g>
  ${lbl([55.7470,37.5150], "Москва-река", 0, 34, 24, 8)}
  ${lbl(K0, "Кремль", 28, 40, 22)}
  ${lbl([55.8590,37.5190], "Ховрино", 22, 12, 28)}
  ${lbl([55.8197,37.6117], "Останкино", 14, -54, 24)}
  ${lbl([55.7106,37.5536], "Воробьёвы горы", -70, 44, 24)}
  ${lbl([55.8060,37.5150], "Ленинградское шоссе", -30, 10, 19, -55)}
  ${lbl([55.7950,37.6370], "проспект Мира", 14, 24, 19, -80)}
  ${lbl([55.7820,37.5950], "Садовое кольцо", -150, -6, 18)}
  <g transform="translate(905 92)" font-family="Marck Script, cursive" fill="#5a3c1c"><circle r="34" fill="none" stroke="#5a3c1c" stroke-width="2"/><path d="M0,-30 L7,0 L0,30 L-7,0 Z" fill="#8b1e1e" opacity=".8"/><text y="-40" text-anchor="middle" font-size="22">С</text></g>
  <text x="40" y="930" font-family="Marck Script, cursive" font-size="40" fill="#3b2611">Карта хранителя</text>
  <text x="42" y="962" font-family="Marck Script, cursive" font-size="22" fill="#6d5232">Москва, где время тонкое, как старая ткань</text>
  <path class="an-route" d="${rd}" fill="none" stroke="#8b1e1e" stroke-width="3" stroke-dasharray="7 9" opacity="0" stroke-linecap="round"/>
  <g class="pins">${np.map(p => { const c = EC[p.e[0]].c, [x, y] = p.xy;
    return `<g class="pin" data-p="${p.id}" tabindex="0" role="button" aria-label="${esc(p.n)}" transform="translate(${x.toFixed(1)} ${y.toFixed(1)})">
      ${p.e.slice(1, 4).map((e, j) => `<circle r="${22 + j * 4}" fill="none" stroke="${EC[e].c}" stroke-width="3" opacity=".75"/>`).join("")}
      <circle class="seal" r="16" fill="${c}" stroke="#fff" stroke-width="2.5"/><text text-anchor="middle" dy="5">${p.i}</text></g>`; }).join("")}</g>
  <rect width="1000" height="1000" fill="url(#anVig)" pointer-events="none"/></svg>`;
}
function map(el){
  css(); fonts();
  let era = null, sel = null;
  el.innerHTML = `<div class="an"><h3>Карта Москвы</h3><p class="an-p">Все места, где побывали Луис, Наталья, Алисия — и хранитель Никита за сто лет до них. Цвет печати — эпоха, в которую там открывалась Москва; кольца вокруг — другие времена того же места. Нажми на номер.</p>
    <div class="an-eras">${ERAS.map(e => `<button type="button" data-e="${e.k}" style="--c:${e.c}"><i></i>${esc(e.t)}</button>`).join("")}</div>
    <div class="an-map an-paper">${mapSVG()}</div>
    <div class="an-tools"><button type="button" class="an-btn" data-route>✦ Показать путь героев</button><button type="button" class="an-btn ghost" data-zoom>🔍 Центр крупнее</button><button type="button" class="an-btn ghost" data-all>Все эпохи</button></div>
    <div class="an-cardbox"></div>
    <ol class="an-list">${PLACES.map((p, i) => `<li><button type="button" data-l="${p.id}"><b style="background:${EC[p.e[0]].c}">${i + 1}</b><span>${esc(p.n)}</span></button></li>`).join("")}</ol></div>`;
  const svg = el.querySelector("svg"), box = el.querySelector(".an-cardbox");
  const apply = () => {
    el.querySelectorAll("[data-e]").forEach(b => b.classList.toggle("on", b.dataset.e === era));
    el.querySelectorAll(".pin").forEach(g => { const p = PLACES.find(x => x.id === g.dataset.p); g.classList.toggle("dim", !!era && !p.e.includes(era)); g.classList.toggle("on", g.dataset.p === sel); });
  };
  const show = id => {
    sel = id; const p = PLACES.find(x => x.id === id), i = PLACES.indexOf(p) + 1; apply();
    box.innerHTML = `<div class="an-card">${p.img ? `<img src="${IMG + p.img}" alt="" loading="lazy">` : `<div class="an-paper" style="display:flex;align-items:center;justify-content:center;aspect-ratio:4/3;font:24px 'Marck Script',cursive;padding:10px;text-align:center">Из дневника хранителя</div>`}
      <div><h4>${i}. ${esc(p.n)}</h4><div>${p.e.map(e => `<span class="an-chip" style="background:${EC[e].c}">${esc(EC[e].t)}</span>`).join("")}</div>
      <p>${esc(p.d)}</p>${p.h ? `<p style="font-style:italic;color:var(--muted)">${esc(p.h)}</p>` : ""}
      <p>${p.ch.map(c => `<a href="#/${SLUG}/${c}">Глава ${c}</a>`).join(" · ")}</p></div></div>`;
    box.scrollIntoView({block:"nearest", behavior:"smooth"});
  };
  el.querySelectorAll(".pin").forEach(g => { g.onclick = () => show(g.dataset.p); g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(g.dataset.p); } }; });
  el.querySelectorAll("[data-l]").forEach(b => b.onclick = () => show(b.dataset.l));
  el.querySelectorAll("[data-e]").forEach(b => b.onclick = () => { era = era === b.dataset.e ? null : b.dataset.e; apply(); });
  el.querySelector("[data-all]").onclick = () => { era = null; apply(); };
  let zoom = false; el.querySelector("[data-zoom]").onclick = e => { zoom = !zoom; svg.setAttribute("viewBox", zoom ? "260 300 480 480" : "0 0 1000 1000"); e.currentTarget.textContent = zoom ? "🔍 Вся Москва" : "🔍 Центр крупнее"; };
  el.querySelector("[data-route]").onclick = () => {
    const r = svg.querySelector(".an-route"), L = r.getTotalLength(); r.style.transition = "none"; r.style.opacity = 1;
    r.style.strokeDasharray = `${L} ${L}`; r.style.strokeDashoffset = L; r.getBoundingClientRect();
    r.style.transition = "stroke-dashoffset 7s ease-in-out"; r.style.strokeDashoffset = 0;
    setTimeout(() => { if (r.isConnected) { r.style.transition = "none"; r.style.strokeDasharray = "7 9"; r.style.strokeDashoffset = 0; } }, 7200);
  };
}

/* ═════════════ 2. Дневник хранителя ═════════════ */
const ROUGH = `<defs><filter id="anInk"><feTurbulence type="fractalNoise" baseFrequency=".05" numOctaves="2" seed="7"/><feDisplacementMap in="SourceGraphic" scale="3.2"/></filter>
  <radialGradient id="anTq"><stop offset="0" stop-color="#5ff2dc" stop-opacity=".9"/><stop offset="1" stop-color="#5ff2dc" stop-opacity="0"/></radialGradient></defs>`;
const SIGIL = (sz, glow) => `<svg viewBox="-110 -110 220 220" width="${sz}" height="${sz}">${ROUGH}<g filter="url(#anInk)" fill="none" stroke="#24170a" stroke-width="2.4" stroke-linecap="round">
  ${glow ? `<circle r="105" fill="url(#anTq)" stroke="none" opacity=".6"><animate attributeName="opacity" values=".35;.75;.35" dur="3s" repeatCount="indefinite"/></circle>` : ""}
  <circle r="86"/><circle r="80" stroke-width="1" opacity=".6"/>
  ${[0,1,2,3,4,5,6].map(i => { const a = i / 7 * Math.PI * 2 - Math.PI / 2, b = a + Math.PI * (3 / 7); return `<line x1="${(86 * Math.cos(a)).toFixed(1)}" y1="${(86 * Math.sin(a)).toFixed(1)}" x2="${(86 * Math.cos(b)).toFixed(1)}" y2="${(86 * Math.sin(b)).toFixed(1)}" stroke-width="1.3"/>`; }).join("")}
  <path d="M-26,14 L-30,-16 L-14,-2 L0,-24 L14,-2 L30,-16 L26,14 Z" stroke-width="2.6" fill="#efe2c2"/><line x1="-26" y1="22" x2="26" y2="22" stroke-width="3"/>
  <circle cx="0" cy="-28" r="3.5" fill="#24170a"/><circle cx="-30" cy="-20" r="2.5" fill="#24170a"/><circle cx="30" cy="-20" r="2.5" fill="#24170a"/></g></svg>`;
const CAT = w => `<svg viewBox="0 0 120 120" width="${w}" height="${w}"><g filter="url(#anInk)" fill="none" stroke="#3b2611" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
  <path d="M40,104 C30,80 34,60 46,50 C40,42 40,30 44,22 L52,34 C58,32 64,32 70,34 L78,22 C82,30 82,42 76,50 C88,60 92,82 82,104 Z"/>
  <path d="M82,104 C100,104 108,92 102,80 C98,72 90,78 94,84"/><path d="M52,44 q3,-3 6,0 M66,44 q3,-3 6,0"/><path d="M60,52 l2,3 l2,-3"/>
  <path d="M46,54 l-16,-3 M46,57 l-15,3 M76,54 l16,-3 M76,57 l15,3" stroke-width="1"/><path d="M50,104 v-14 M70,104 v-14" stroke-width="1.4"/></g></svg>`;
const SUKH = `<svg viewBox="0 0 300 230" width="300" height="230" style="max-width:100%">${ROUGH}<g filter="url(#anInk)" fill="none" stroke="#24170a" stroke-width="1.8" stroke-linecap="round">
  <path d="M20,200 H280"/><path d="M40,200 V140 H260 V200"/><path d="M50,140 l10,-12 H240 l10,12"/>
  ${[60,90,120,180,210,240].map(x => `<path d="M${x},190 v-28 a7,7 0 0 1 14,0 v28"/>`).join("")}
  <path d="M120,128 V80 H180 V128"/><path d="M128,80 V56 H172 V80"/><path d="M134,56 l8,-14 h16 l8,14"/><path d="M150,42 V12"/><path d="M144,18 l6,-8 l6,8"/>
  ${[132,148,164].map(x => `<rect x="${x}" y="92" width="8" height="16" rx="4"/>`).join("")}<rect x="144" y="62" width="12" height="12" rx="6"/>
  ${[0,1,2,3,4,5,6,7,8,9].map(i => `<line x1="${44 + i * 21}" y1="146" x2="${36 + i * 21}" y2="158" stroke-width=".7" opacity=".6"/>`).join("")}
  <g transform="translate(268 160)"><circle cx="0" cy="-30" r="5"/><path d="M0,-25 V5 M0,5 l-6,14 M0,5 l6,14 M0,-18 l-8,10 M0,-18 l8,8"/><path d="M10,-48 V20" stroke-width="2.2"/><path d="M10,-48 q12,6 0,20" fill="#24170a" opacity=".85"/></g>
  <g stroke-width="3"><path d="M112,212 v14"/><path d="M122,212 v14"/><path d="M132,212 v14"/></g></g>
  <text x="146" y="225" font-family="Marck Script, cursive" font-size="14" fill="#3b2611">— три. не два и не четыре</text></svg>`;
const BENCH = `<svg viewBox="0 0 300 170" width="300" height="170" style="max-width:100%">${ROUGH}<g filter="url(#anInk)" fill="none" stroke="#24170a" stroke-width="1.7" stroke-linecap="round">
  <path d="M10,150 q60,-10 120,0 t160,-4" stroke="#4d6e85" opacity=".6"/><path d="M30,118 H210 M34,104 H206 M40,118 v24 M200,118 v24 M44,104 v-30 M196,104 v-30 M44,80 H196"/>
  <g transform="translate(120 0)"><circle cx="0" cy="44" r="10"/><path d="M-6,38 q6,-12 14,-4 q6,-2 8,10" /><path d="M-2,54 q-10,20 -6,48 h22 q2,-28 -6,-48 Z"/><path d="M-8,102 l-4,24 M12,102 l2,24"/>
   <rect x="-14" y="76" width="14" height="20" rx="2" transform="rotate(-12 -7 86)" fill="url(#anTq)" stroke="#2a8f86"/></g>
  <path d="M70,40 l8,-6 M250,30 q-6,10 4,14" stroke-width="1" opacity=".5"/></g></svg>`;
const SCROLLS = `<svg viewBox="-130 -130 260 260" width="290" height="290" style="max-width:100%">${ROUGH}
  <circle r="125" fill="url(#anTq)" opacity=".5"><animate attributeName="opacity" values=".25;.7;.25" dur="2.6s" repeatCount="indefinite"/></circle>
  <g filter="url(#anInk)" fill="none" stroke="#24170a" stroke-width="1.6" stroke-linecap="round"><circle r="92" stroke-dasharray="3 5"/>
  ${[0,1,2,3,4,5,6].map(i => { const a = i / 7 * Math.PI * 2 - Math.PI / 2, x = 92 * Math.cos(a), y = 92 * Math.sin(a), rot = a * 180 / Math.PI + 90 + (i === 4 ? 180 : 0), b = a + Math.PI * 4 / 7;
    return `<line x1="${x.toFixed(1)}" y1="${y.toFixed(1)}" x2="${(92 * Math.cos(b)).toFixed(1)}" y2="${(92 * Math.sin(b)).toFixed(1)}" stroke="#2a8f86" stroke-width="1.1" opacity=".8"/>
    <g transform="translate(${x.toFixed(1)} ${y.toFixed(1)}) rotate(${rot.toFixed(0)})"><rect x="-13" y="-18" width="26" height="36" rx="2" fill="#f3e6c8"/><ellipse cx="0" cy="-18" rx="15" ry="4" fill="#e6d3a8"/><ellipse cx="0" cy="18" rx="15" ry="4" fill="#e6d3a8"/>
    <path d="M-7,-8 h14 M-7,-2 h10 M-7,4 h14 M-7,10 h8" stroke-width=".8"/>${i === 0 ? `<path d="M-4,-14 l4,-3 l4,3" stroke="#8b1e1e"/>` : ""}</g>`; }).join("")}</g>
  <text x="0" y="4" text-anchor="middle" font-family="Marck Script, cursive" font-size="17" fill="#3b2611">семь</text><text x="-128" y="126" font-family="Marck Script, cursive" font-size="13" fill="#3b2611">↑ этот вверх ногами</text></svg>`;
const BLOT = (w, h, seed) => { let s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; const n = 26, cx = w / 2, cy = h / 2; let d = "";
  for (let i = 0; i <= n; i++) { const a = i / n * Math.PI * 2, rr = (Math.min(w, h) / 2) * (.6 + r() * .38) * (i % 5 === 0 ? 1.25 : 1); d += (i ? " L" : "M") + (cx + Math.cos(a) * rr * (w / h > 1 ? w / h * .8 : 1)).toFixed(1) + "," + (cy + Math.sin(a) * rr).toFixed(1); }
  const drips = [0,1,2].map(() => { const x = cx + (r() - .5) * w * .5, l = 20 + r() * 40; return `<path d="M${x},${cy + h * .25} v${l}" stroke="#1a1008" stroke-width="${3 + r() * 4}" stroke-linecap="round"/><circle cx="${x}" cy="${cy + h * .25 + l}" r="4" fill="#1a1008"/>`; }).join("");
  return `<svg viewBox="0 0 ${w} ${h + 60}" width="100%" style="max-width:${w}px" preserveAspectRatio="xMidYMid meet">${ROUGH}<g filter="url(#anInk)"><path d="${d} Z" fill="#1a1008" opacity=".92"/>${drips}
  ${[0,1,2,3,4,5].map(() => `<circle cx="${(r() * w).toFixed(0)}" cy="${(r() * h).toFixed(0)}" r="${(2 + r() * 5).toFixed(1)}" fill="#1a1008" opacity=".85"/>`).join("")}</g></svg>`; };
const SCRIB = (w, h, seed, rows) => { let s = seed; const r = () => (s = (s * 9301 + 49297) % 233280) / 233280; let d = "";
  for (let k = 0; k < rows; k++) { const y0 = 20 + k * (h - 40) / rows; let x = 10, y = y0; d += `M${x},${y}`; while (x < w - 10) { x += 6 + r() * 14; y = y0 + (r() - .5) * 34; d += ` L${x.toFixed(0)},${y.toFixed(0)}`; } }
  return `<svg class="scrib" viewBox="0 0 ${w} ${h}" width="100%" height="100%" preserveAspectRatio="none" style="position:absolute;inset:0;transition:opacity .3s">${ROUGH}<path d="${d}" fill="none" stroke="#120a04" stroke-width="6" stroke-linejoin="round" filter="url(#anInk)" opacity=".93"/></svg>`; };
const letters = (txt, base, step) => [...txt].map((ch, i) => ch === "\n" ? "<br>" : `<span style="animation-delay:${(base + i * step).toFixed(2)}s">${ch === " " ? "&nbsp;" : esc(ch)}</span>`).join("");

const P27 = [
  {d:"12 августа 1913 г.", t:["Не ищи там, где башни видят весь город.","Ищи там, где северный ветер хранит двадцать семь голосов.","Там книги стоят вместо стражей,","а старое Ховрино прячет память под новым именем.","Тот, кто найдёт двадцать седьмой дом слова,","пусть спросит книгу, которой нет в каталоге."]},
  {d:"13 августа 1913 г., утром", t:["Не ищи там, где башни видят весь город.","Северный ветер приведёт тебя туда, где старое село стало частью новой Москвы.","Найди двадцать седьмой дом слова.","Там книги стоят вместо стражей, а чужая речь скрывает то, что не должно быть прочитано.","Ищи книгу, которой никогда не было в каталоге."]}
];
const UVTXT = "Пишу это ночью тринадцатого года, когда всё уже кончилось. Час закрыт. Москва спит спокойно. А моя сестра Вера каждый вечер садится у окна и плачет, не зная почему.\nЕго звали Эмиль. Когда мы собрали все семь, свитки сказали нам правду: Час родился в тот день, когда Эмиль встретил Веру на Патриарших. Чтобы закрыть его, Эмиль должен был исчезнуть, будто никогда не приезжал. Он согласился сразу.\nВера хотела сказать ему слово. Я закрыл ей рот рукой. Я выбрал город. Я выбрал порядок.\nНо если слово скажут двое, над всеми семью свитками, — свитки не зашивают шов. Они его переписывают. Чужой перестаёт быть чужим.\nЕсли ты всё-таки нашёл эту страницу — не закрывай ей рот.\nН. А.";

const PAGES = [
  {no:1, h:() => `<p class="note">Толстая тетрадь в потемневшем кожаном переплёте. Углы стёрты, корешок подклеен бумажной полосой. Между листами — письма, газетные вырезки и засушенный кленовый лист.</p>
    <div style="margin:20px 0 6px">${SIGIL(230)}</div><p style="text-align:center;font-size:34px;margin:0">Москва</p>
    <svg viewBox="0 0 100 104" width="84" style="position:absolute;right:26px;bottom:44px;transform:rotate(18deg);opacity:.8"><g stroke="#8a3f18" stroke-width="1.6" stroke-linejoin="round"><path d="M50,4 L58,28 L75,18 L70,40 L92,37 L78,55 L88,62 L62,66 L64,82 L52,73 L51,100 L49,100 L48,73 L36,82 L38,66 L12,62 L22,55 L8,37 L30,40 L25,18 L42,28 Z" fill="rgba(196,104,44,.55)"/><path d="M50,96 V30 M50,60 L30,44 M50,60 L70,44 M50,74 L36,66 M50,74 L64,66" fill="none" stroke-width="1"/></g></svg>`},
  {no:4, h:() => `<span class="dt">3 октября 1876 г.</span><p>…«Никита. Теперь ты хранитель. Хранитель обязан делать три вещи: помнить, молчать перед чужими и записывать. Записывай всё, даже то, что покажется тебе глупым. <u>Особенно</u> то, что покажется глупым. Время любит прятаться в мелочах. Кошку не обижай. Она знает больше нас обоих».</p>
    <p>Кошку зовут Дымка. Серая, как пепел, и смотрит так, будто я ей должен денег.</p><div style="float:right;margin:-6px -4px 0 6px">${CAT(110)}</div><span class="dt" style="margin-top:14px">8 октября.</span><p>Болит зуб.</p>`},
  {no:9, h:() => `<span class="dt">14 марта 1877 г.</span><p>Оно случилось. У Сухаревой башни, в шестом часу вечера. Звуки ушли, будто уши заложило ватой. Посреди площади стоял мужчина в длинном кафтане, с бердышом, и смотрел на конку так, будто видел чёрта.</p>${SUKH}<p>Три удара по камню у основания башни. На третьем он посмотрел прямо на меня — и пропал. Остался запах дыма и мокрой шерсти.</p><p style="font-size:16px;opacity:.75;transform:rotate(-1.5deg)">Руки трясутся до сих пор. Пишу криво.</p>`},
  {no:18, h:() => `<span class="dt" style="text-align:center;letter-spacing:.08em">ОБ АНОМАЛЬНОМ ЧАСЕ</span><p style="font-size:18px">Прошлые проявления <i>(по архиву, сколько удалось разобрать)</i>:</p>
    <p style="font-size:18px">— 1571. Великий пожар. «Видеша в огне людей не нашего обличья». «Лекарь Бомелий держит Великий свиток. Боюсь его».<br>— 1606? <span style="opacity:.45;filter:blur(1px)">лист обгорел</span> «…дымная кошка порог переступила».<br>— 1697? «Свиток у стрелецкого подполковника. Взят не нами».<br>— 1812. «Французы увезли четыре свитка».</p>
    <svg viewBox="0 0 520 120" width="100%" style="max-width:520px">${ROUGH}<g font-family="Marck Script, cursive" font-size="22" fill="#24170a">
      <text x="10" y="30">1571 + 35 = 1606</text><text x="250" y="30">1697 − 1606 = 91</text><text x="10" y="64">1812 + 101 = 1913</text><text x="250" y="64">100? 101? 115?</text></g>
      <g filter="url(#anInk)" stroke="#24170a" stroke-width="2" fill="none"><path d="M248,22 L480,26"/><path d="M246,56 L470,50 M250,62 L460,44"/>
      <ellipse cx="120" cy="100" rx="66" ry="18" stroke-width="1.6"/><ellipse cx="121" cy="99" rx="72" ry="21" stroke-width="1"/></g>
      <text x="74" y="108" font-family="Marck Script, cursive" font-size="26" fill="#24170a">1913 (?)</text></svg>
    <p class="blue" style="margin-top:6px">Следующее проявление Аномального часа должно случиться 25 августа 2026 года.</p><p class="note">Приписка синими чернилами, другим почерком — крупным и прямым.</p>`},
  {no:"—", appear:true, h:() => `<p class="note">Середина тетради. Эта страница долгие годы оставалась пустой. Буквы появились на ней сами, тонкие и тёмные, будто проступили изнутри бумаги.</p>
    <div class="an-appear" style="font-size:24px;line-height:1.6;margin-top:34px;text-align:center">${letters("«Не ищи в свитках того, что было. Не ищи того, что будет. Свитки хранят путь, который выбрал идущий».", .4, .035)}<br><br>${letters("«Каждый выбор оставляет след. Каждый след становится дорогой. Каждая дорога стремится стать миром».", 4.4, .035)}<br><br>${letters("«Каждый выбор создаёт путь. Но не каждый путь может существовать одновременно».", 8.2, .035)}</div>`},
  {no:23, h:() => `<span class="dt">19 июня 1913 г.</span><p>У Патриаршего пруда со мной случилось странное. Всё вокруг побледнело, будто я смотрю сквозь кисею. Рядом, на той же скамейке — но как бы не совсем рядом — сидела женщина. Тёмные волосы, глаза светлые, голубые. Юбка короче, чем носят приличные дамы. В руках — маленькая светящаяся плитка, на которой нарисованы улицы.</p>${BENCH}<p>Она подняла голову и посмотрела прямо на меня. Нахмурилась, как будто вспоминала, где меня видела.</p>
    <span class="dt">20 июня.</span><p>У неё был наш подбородок. Отцовский. Глупость.</p>`},
  {no:24, h:() => `<span class="dt">2 июля 1913 г.</span><p>Сегодня на Малой Бронной я видел женщину, у которой</p><div class="an-blot">${BLOT(300, 150, 11)}</div><p class="note">Запись обрывается. Ниже на полстраницы — пятно, будто перо долго стояло на одном месте.</p>
    <span class="dt">3 июля 1913 г.</span><p>Не помню, что хотел написать вчера. Совсем не помню. Это пугает больше, чем все смещения вместе взятые.</p>`},
  {no:27, p27:true, h:() => `<p class="note">Страница 27. Почерк не тот, что на соседних листах: буквы круглые, с завитками, как у человека, привыкшего писать по-французски. Чернила свежие и блестят, будто высохли только что.</p>
    <span class="dt p27d">${esc(P27[0].d)}</span><div class="emil an-fade p27t" style="font-size:21px;line-height:1.7">${P27[0].t.map(l => `<span class="an-fresh">${esc(l)}</span>`).join("<br>")}</div>
    <p style="margin-top:14px">Я этого не писал. Ещё вчера вечером этот лист был пустым. Ключ у меня на шее. Дымка спала на ящике всю ночь.</p>
    <p style="text-align:center;margin-top:10px"><button type="button" class="an-btn p27b" style="font-family:Inter,sans-serif">☾ Перечитать утром</button></p>`},
  {no:31, h:() => `<span class="dt">23 августа 1913 г.</span><p>Семь свитков лежат у меня на столе. Мы сложили их кругом, по линиям Эмилевых карт: один пришлось повернуть почти вверх ногами, как перевёрнутую фигуру в колоде.</p>${SCROLLS}<p>Они светятся. Бирюзово, мягко, будто дышат. Час двадцать пятого. Вечером, в начале десятого.</p>`},
  {no:32, h:() => `<span class="dt">25 августа 1913 г.</span><p style="transform:rotate(2.5deg);transform-origin:left">Свитки сказали правду. Я не могу это</p>
    <div style="position:relative;height:120px;margin:10px 0">${SCRIB(500, 120, 5, 4)}</div><span class="dt">27 августа.</span>
    <p style="font-size:26px;line-height:1.35">Эмиль. Эмиль. Эмиль.<br><span style="transform:rotate(-2deg);display:inline-block">Эмиль. Эмиль.</span></p><p>Пишу, чтобы рука помнила, если голова начнёт забывать. Хранитель обязан помнить.</p>`},
  {no:34, h:() => `<div style="display:grid;grid-template-columns:120px 1fr;gap:10px;align-items:start"><div style="transform:rotate(-8deg)">${SIGIL(120)}</div>
    <div class="emil" style="transform:rotate(-1.5deg)">«Первый не хранит путь. Первый открывает время второго».<br>«Когда первый будет освобождён из стены, он позовёт второй. Не ищи его рядом. Второй спрятан не в месте, а во времени».</div></div>
    <div class="emil" style="font-size:16px;margin:10px 0 0 26px;transform:rotate(1deg)">«Ищи того, кто служил двум хозяевам и обоих предал. Он был со стрельцами, стоял за Софьей, потом поклонился Петру. Теперь он готовит царю огонь. Второй хранится у него, пока сам государь не войдёт в его дом».</div>
    <span class="dt" style="margin-top:14px">12 сентября 1913 г.</span><p>Утром нашёл это на полях. Почерк похож на руку Эмиля. Но Эмиля нет. Нет нигде. Циклер? Я сжёг бы эти страницы, если бы не знал, что тетрадь всё равно напишет их снова.</p>`},
  {no:35, h:() => `<p class="note">Строки той же круглой рукой. Чернила почти выцвели, словно этой записи не меньше ста лет.</p>
    <div class="emil" style="opacity:.55">«Если рыцари уйдут через незакрытый путь, ищи не их след, но спор двух словесников. Один стоит там, где имя его повторяет площадь. Другой смотрит на Москву со своего бульвара. Соедини их одной жилой, и два голоса откроют дверь туда, куда ушли преследователи».</div>
    <svg viewBox="0 0 400 110" width="100%" style="max-width:400px">${ROUGH}<g filter="url(#anInk)" fill="none" stroke="#24170a" stroke-width="1.7"><path d="M40,96 h40 M50,96 v-14 h20 v14 M56,82 v-36 h8 v36 M60,46 m-8,0 a8,8 0 1 0 16,0 a8,8 0 1 0 -16,0"/>
      <path d="M320,96 h40 M330,96 v-14 h20 v14 M335,82 q5,-30 10,0 M340,52 m-7,0 a7,7 0 1 0 14,0 a7,7 0 1 0 -14,0 M347,50 l8,-2"/>
      <path d="M80,70 C150,20 250,110 320,64" stroke-dasharray="4 6" stroke="#2a8f86"/></g><g font-family="Marck Script, cursive" font-size="15" fill="#3b2611"><text x="20" y="22">Пушкин?</text><text x="300" y="22">Гоголь?</text><text x="150" y="104">одной жилой</text></g></svg>
    <span class="dt">17 сентября 1913 г.</span><p>Пушкин стоит на Страстной, Гоголь — на Пречистенском бульваре. Но площадь не зовётся именем словесника. Никакая площадь в Москве так не зовётся. Чепуха. Или не для меня написано.</p>`},
  {no:36, uv:true, h:() => `<p class="note">Страница густо, в несколько слоёв, перечёркнута чернилами. Нажим такой, что бумага местами прорвана. Сквозь чернила читается только одна строка.</p>
    <div class="an-uv"><div style="position:relative;height:340px">${SCRIB(520, 340, 29, 13)}
      <p style="position:absolute;left:0;right:0;top:150px;text-align:center;font-size:22px;background:rgba(239,226,194,.9);padding:4px 0;margin:0;font-weight:700">Слово, сказанное над свитками, нельзя забрать назад.</p></div>
      <div class="hid">${esc(UVTXT).replace(/\n/g, "<br>")}</div><div class="lamp"></div></div>
    <p style="text-align:center;margin:12px 0 0"><button type="button" class="an-btn uvb" style="font-family:Inter,sans-serif;background:#5b2fa0">🔦 Включить ультрафиолет</button> <button type="button" class="an-btn ghost uva" style="font-family:Inter,sans-serif;display:none">Осветить всю страницу</button></p>
    <p class="note uvn" style="text-align:center;display:none">Води лампой по странице — пальцем или мышкой.</p>`},
  {no:41, h:() => `<p class="note">Синие шариковые чернила, другой почерк, крупный и прямой, с инженерной аккуратностью.</p><span class="dt blue">14 мая 1979 г.</span>
    <p class="blue">Нашёл в столе отца тетрадь прадеда. Прочёл за две ночи. Отец мне в детстве рассказывал, но я думал, это сказки.</p>
    <p class="blue">Пересчитал цифры прадеда на арифмометре в нашем КБ после смены, пока никто не видел. Выходит 25 августа 2026 года. Мне тогда будет девяносто, если доживу. Не доживу, конечно.</p>
    <p class="blue">Береги кошку, кто бы ты ни был. У нас опять серая. Пришла сама, как всегда.</p><div style="float:right;transform:scaleX(-1)">${CAT(90)}</div>
    <p class="blue" style="font-size:18px;transform:rotate(-1deg)">Сегодня в Ховрино начали строить библиотеку. Номер двадцать семь.<br>Совпадение, конечно.</p>`},
  {no:"", h:() => `<p class="note">Внутренняя сторона задней обложки. Карандашом, почерком Натальи.</p>
    <div style="margin-top:120px;text-align:center"><span class="pencil" style="font-size:34px">25 августа. 21:03.<br>Один кофе.</span><br><span class="pencil" style="font-size:40px;transform:rotate(1deg)">Я помню.</span></div>
    <svg viewBox="0 0 120 100" width="110" style="display:block;margin:30px auto 0;opacity:.8"><g fill="none" stroke="#555" stroke-width="2.2" stroke-linecap="round"><path d="M30,40 h56 v26 q0,20 -28,20 q-28,0 -28,-20 Z"/><path d="M86,46 q16,0 14,12 q-2,10 -14,8"/><path d="M20,92 h80"/><path d="M48,30 q-6,-10 2,-18 M62,30 q-6,-10 2,-18" opacity=".6"/></g></svg>`}
];

function diary(el){
  css(); fonts();
  let i = 0, uvOn = false;
  el.innerHTML = `<div class="an"><h3>Дневник хранителя</h3><p class="an-p">Странные страницы из тетради Никиты Андреевича — прапрадеда Натальи, московского хранителя времени (1876–1919). Некоторые страницы живут своей жизнью: на одних буквы проступают сами, другие переписывают себя к утру, а под самой зачёркнутой прячется то, что видно только в ультрафиолете.</p>
    <div class="an-book"><div class="an-page an-paper"></div></div>
    <div class="an-nav"><button type="button" data-d="-1">← Назад</button><span class="an-cnt"></span><button type="button" data-d="1">Дальше →</button></div><div class="an-dots">${PAGES.map((_, k) => `<button type="button" data-k="${k}" aria-label="Страница ${k + 1}"></button>`).join("")}</div></div>`;
  const pg = el.querySelector(".an-page"), cnt = el.querySelector(".an-cnt");
  const draw = turn => {
    const P = PAGES[i]; uvOn = false; pg.classList.remove("dark");
    pg.innerHTML = P.h() + (P.no !== "" ? `<span class="no">${P.no === "—" ? "" : "стр. " + P.no}</span>` : "");
    if (turn) { pg.classList.remove("an-turn"); void pg.offsetWidth; pg.classList.add("an-turn"); }
    cnt.textContent = `${i + 1} / ${PAGES.length}`;
    el.querySelector('[data-d="-1"]').disabled = i === 0; el.querySelector('[data-d="1"]').disabled = i === PAGES.length - 1;
    el.querySelectorAll("[data-k]").forEach(b => b.classList.toggle("on", +b.dataset.k === i));
    if (P.p27) { let v = 0; const b = pg.querySelector(".p27b"), t = pg.querySelector(".p27t"), d = pg.querySelector(".p27d");
      b.onclick = () => { t.classList.add("out"); setTimeout(() => { v = 1 - v; t.innerHTML = P27[v].t.map(l => `<span class="an-fresh">${esc(l)}</span>`).join("<br>"); d.textContent = P27[v].d; b.textContent = v ? "☾ А вчера было иначе…" : "☾ Перечитать утром"; t.classList.remove("out"); }, 600); }; }
    if (P.uv) { const box = pg.querySelector(".an-uv"), b = pg.querySelector(".uvb"), a = pg.querySelector(".uva"), n = pg.querySelector(".uvn");
      const mv = e => { const r = box.getBoundingClientRect(); box.style.setProperty("--x", (e.clientX - r.left) + "px"); box.style.setProperty("--y", (e.clientY - r.top) + "px"); };
      box.addEventListener("pointermove", mv); box.addEventListener("pointerdown", e => { mv(e); try { box.setPointerCapture(e.pointerId); } catch(_) {} });
      b.onclick = () => { uvOn = !uvOn; box.classList.toggle("on", uvOn); box.classList.remove("all"); pg.classList.toggle("dark", uvOn); b.textContent = uvOn ? "Выключить лампу" : "🔦 Включить ультрафиолет"; a.style.display = n.style.display = uvOn ? "" : "none"; };
      a.onclick = () => box.classList.toggle("all"); }
  };
  el.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { const j = i + +b.dataset.d; if (j < 0 || j >= PAGES.length) return; i = j; draw(true); el.querySelector(".an-book").scrollIntoView({block:"nearest", behavior:"smooth"}); });
  el.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { i = +b.dataset.k; draw(true); });
  let sx = null; pg.addEventListener("touchstart", e => { if (!e.target.closest(".an-uv")) sx = e.touches[0].clientX; }, {passive:true});
  pg.addEventListener("touchend", e => { if (sx == null) return; const dx = e.changedTouches[0].clientX - sx; sx = null; if (Math.abs(dx) > 60) { const j = i + (dx < 0 ? 1 : -1); if (j >= 0 && j < PAGES.length) { i = j; draw(true); } } });
  draw(false);
}

window.LitmirAnomal = {map, diary};
})();
