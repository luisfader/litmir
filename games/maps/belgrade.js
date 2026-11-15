/* Карта Белграда — раздел романа «Дикий час».
   LitmirBelgrade.map(el, {slug, open(p), ch(p)}) рисует ночной Белград (SVG, всё кодом) и точки мест из романа.
   Наведите мышь или проведите пальцем по карте — над точкой появится подпись; нажмите — откроются сцены романа
   и рассказ о месте в реальности. Сцена из непрочитанной главы закрыта, пока читатель до неё не дойдёт. */
(function(){
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IMG = "novels/dikij-chas/img/";

const KIND = {
  old:{t:"Крепость и башни", c:"#e0a64b"},
  city:{t:"Улицы и площади", c:"#e86f5a"},
  sacred:{t:"Храм и библиотека", c:"#b994f0"},
  river:{t:"Реки и мосты", c:"#4fc3d9"},
  wild:{t:"За городом", c:"#7fcf7a"}
};

/* x, y — точка на нашей карте (viewBox 400×470). Карта стилизована: центр крупно, Авала и Зедань — у краёв. */
const PLACES = [
  {id:"knez", k:"city", x:206, y:205, n:"Улица Кнез-Михайлова", tag:"Здесь всё началось",
   real:"Главная пешеходная улица Белграда. Она ведёт от площади Республики к Калемегдану, и её дома XIX века охраняются как памятник культуры. Названа в честь князя Михаила Обреновича.",
   scenes:[
     {ch:1, img:"01-samokat.jpg", t:"Утро. Луис идёт по Кнез-Михайловой и разглядывает дома, чтобы потом нарисовать их по памяти. Сбоку налетает электросамокат. «Я Наташа. С ударением на первый слог», — говорит женщина, которая в него врезалась, и обещает показать ему Белград: «Если уж я в тебя врезалась — это моя ответственность»."}
   ]},
  {id:"kale", k:"old", x:178, y:178, n:"Калемегдан", tag:"Крепость над слиянием рек",
   real:"Белградская крепость и парк на высоком мысу, где Сава впадает в Дунай. Название соединяет турецкие слова «крепость» и «поле битвы». Здесь стояли римский Сингидунум, византийцы, сербские деспоты, турки и австрийцы — нынешние стены в основном XVIII века. Над слиянием рек стоит «Победитель» Ивана Мештровича (1928).",
   scenes:[
     {ch:1, img:"01-kalemegdan.jpg", t:"Наташа приводит Луиса на Калемегдан к закату. Реки внизу сливаются в одну светлую линию. «Белград не любит слабых. Но если он тебя примет… ты уже не уйдёшь прежним»."},
     {ch:12, img:"12-kalemegdan.jpg", t:"Первая точка на карте камней. На смотровой площадке Наташа рассказывает, за что любит город, и вдруг берёт Луиса за руку: «Ты мой». У старой пушки две женщины неотрывно смотрят на них."},
     {ch:13, img:"13-ne-smej.jpg", t:"Сумерки в крепости. Рыжеволосая делает резкое движение к Луису, и Наташа превращается в стихию: «Не смей». Она кусает нападающую, и агенты отступают в тень. Среди камней Луис находит первый камень с амулетом — защитным знаком Зарка."},
     {ch:26, t:"В бункере Ирина открывает Наташе недостающие листы: призыв нужно совершить «у старого капища под Калемегданом, где сходятся река, камень и память»."},
     {ch:35, img:"35-svadba.jpg", t:"Через несколько месяцев здесь проходит символическая свадьба — без алтаря и священника. Свидетелями становятся Марина и Катарина, Ирина поднимает тост, а над крепостью спокойно пролетает Змай. Той ночью луна чуть-чуть дрожит, как обещал Луис."},
     {ch:36, img:"36-interview.jpg", t:"На одной из террас Калемегдана Наташа даёт интервью. Белград за её спиной спокоен."}
   ]},
  {id:"nebo", k:"old", x:166, y:150, n:"Башня Небойша", tag:"Штаб заговора и место битвы",
   real:"Средневековая башня XV века. Она стоит в Нижнем городе у самого Дуная. При турках здесь была тюрьма, в 1798 году в ней казнили греческого поэта и революционера Ригаса Ферреоса. Сегодня в башне музей.",
   scenes:[
     {ch:4, img:"04-zagovor.jpg", t:"Ночью в окне башни горит свет. Артан, София и Джон сидят за массивным столом: через несколько дней придёт Дикий час, и тогда «этот город будет нашим»."},
     {ch:11, img:"11-dosje.jpg", t:"Джон кладёт перед Софией досье. На фотографии — Наташа Петрович, 39 лет, туристический гид, носительница древней крови. София узнаёт подругу и впервые сомневается."},
     {ch:27, img:"27-u-bashni.jpg", t:"Аналитики Джона восстанавливают вырванный лист: ритуал завершается в башне Небойша. Туда же едут Наташа и Луис с камнями. Внутри их уже ждут Джон и София с оружием."},
     {ch:28, t:"Луис смеётся над тем, как янки знают географию («Дунай протекает через Канаду»), и Джон опускает пистолет со слезами на глазах. Наташа даёт Софии пощёчину — и они бегут."},
     {ch:29, img:"29-tajnik.jpg", t:"«Я годами водила здесь экскурсии». Наташа знает тайный ход в маленькую комнату, о которой нет ни слова в планах. Башня содрогается, Джон падает на нижний ярус, а кубик Рубика превращает Марину и Катарину в великанш."},
     {ch:30, img:"30-zmaj.jpg", t:"На вершине башни Наташа отводит ракеты, как в 1999 году. Луис расставляет камни по схеме — и из огня возникает Змай. Он склоняет голову перед Наташей: «Отныне… я твой»."},
     {ch:32, img:"32-bitva.jpg", t:"Луис-великан бьётся с Алой-Артаном у подножия башни. Марина стреляет демону в глаз, Наташа кусает его, и после последних ударов от чудовища остаётся только пепел."}
   ]},
  {id:"dunav", k:"river", x:250, y:160, n:"Берег Дуная", tag:"Река, которая видела всё",
   real:"Дунай — вторая по длине река Европы. У Белграда он принимает Саву и поворачивает на восток. Вдоль набережной под крепостью идут прогулочные дорожки, а летом стоят речные кафе и клубы.",
   scenes:[
     {ch:23, img:"23-reka.jpg", t:"«Наташа у нас. Берег Дуная. Приходи один». Артан верит сообщению сразу. На тёмном берегу Джон дважды стреляет из пистолета с глушителем, и течение уносит Артана."},
     {ch:30, t:"Наташа отталкивает ракеты от города: одна уходит в сторону, вторая взрывается в небе, третья падает в Дунай, не долетев до берега."},
     {ch:31, t:"София добавляет к камням ещё один ингредиент, и из реки поднимается Ала — демон бурь. У него человеческое лицо. Лицо Артана."}
   ]},
  {id:"repub", k:"city", x:232, y:228, n:"Площадь Республики", tag:"Первые минуты безумия",
   real:"Главная площадь города. Здесь стоит конный памятник князю Михаилу (1882), Национальный музей и Национальный театр. Белградцы договариваются о встрече «код коња» — «у коня».",
   scenes:[
     {ch:30, t:"Дикий час начинается почти незаметно: люди замирают на ходу, кто-то смеётся слишком громко и слишком долго. Потом — вспышка. Мужчины у витрины бросаются друг на друга, бьётся стекло, воют сигнализации."}
   ]},
  {id:"skad", k:"city", x:266, y:216, n:"Скадарлия", tag:"Богемный квартал",
   real:"Старая богемная улица с брусчаткой, которую называют белградским Монмартром. В её кафанах с XIX века собирались поэты, художники и актёры. Самая известная из них — «Три шешира», она работает с 1864 года.",
   scenes:[
     {ch:7, t:"Днём Наташа ведёт Луиса в Скадарлию: брусчатка, старинные фасады, музыка из открытых окон. «Я горжусь тем, что я сербка. И тем, что я славянка»."},
     {ch:18, img:"18-sofija-i-dzhon.jpg", t:"Вторая точка на карте. Из старого дома выходит нервная София, оглядывается, а на углу к ней подходит Джон. Луис узнаёт его: этот человек предлагал туристам бесплатные уроки английского у входа в Калемегдан."}
   ]},
  {id:"wall", k:"city", x:218, y:288, n:"Стена со следами бомб", tag:"Память 1999 года",
   real:"Роман не называет улицу. Самый известный след бомбардировок НАТО 1999 года в центре Белграда — разрушенное здание Генерального штаба на улице Кнеза Милоша. Его руины многие годы стояли посреди города как незаживший шрам.",
   scenes:[
     {ch:7, img:"07-stena.jpg", t:"«Здесь падали бомбы». На изуродованном камне проступает женщина на коне со светлыми волосами и мечом, а за ней горит Белград. Это в точности рисунок из тетради Луиса. Он понимает: его рисунки оставляют следы."},
     {ch:17, t:"Наташа вспоминает девяносто девятый: сирены, дрожащие окна, тот свет. «Я не хочу, чтобы Белград снова горел. Никогда»."}
   ]},
  {id:"bibl", k:"sacred", x:236, y:338, n:"Национальная библиотека Сербии", tag:"Где нашли слово «Дикий час»",
   real:"Главная библиотека страны. Её прежнее здание сгорело 6 апреля 1941 года при немецкой бомбардировке вместе с сотнями тысяч книг и средневековыми рукописями. Нынешнее здание на Врачаре, рядом с храмом Святого Саввы, открыто в 1973 году.",
   scenes:[
     {ch:8, t:"Под надписью на рисунке Луиса проступает «Дикий час». Наташа решает искать ответ в книгах, а не в интернете. В потёртой книге написано: событие, происходящее раз в тысячу лет."},
     {ch:9, img:"09-stranica.jpg", t:"Фотографировать рукописи нельзя. «Отвлеки его. Спроси что-нибудь… про Библию». Пока Луис расспрашивает библиотекаря, Наташа вырывает страницу. «Временно заимствовала. И ради благого дела»."},
     {ch:10, img:"10-karta.jpg", t:"В маленьком кафе неподалёку Наташа разворачивает карту с пятью точками силы: Калемегдан, Скадарлия, храм, Авала… «Это не просто карта. Это путь»."}
   ]},
  {id:"sava", k:"sacred", x:266, y:352, n:"Храм Святого Саввы", tag:"Третья точка на карте",
   real:"Один из крупнейших православных храмов мира. Он стоит на Врачарском плато, где по преданию турки в 1594 году сожгли мощи святого Саввы. Строительство началось в 1935 году, а мозаики внутри закончили уже в XXI веке.",
   scenes:[
     {ch:20, t:"Храм залит холодным светом прожекторов. В саду неподалёку Марина и Катарина, ещё в синяках после встречи с Наташей, находят камень за массивным столбом. «Надеюсь, эта ведьма больше не появится»."}
   ]},
  {id:"brank", k:"river", x:138, y:250, n:"Бранков мост", tag:"Город теряет рассудок",
   real:"Один из главных мостов через Саву, соединяет Старый город с Новым Белградом. Назван по улице поэта Бранко Радичевича, к которой выходит.",
   scenes:[
     {ch:30, t:"Машины на мосту встают. Водители выходят и бьются лбами о металл, будто хотят выбить из себя то, что рвётся наружу. Город сходит с ума."}
   ]},
  {id:"avala", k:"wild", x:300, y:436, far:"≈ 16 км к югу", n:"Авала", tag:"Гора, откуда город виден со стороны",
   real:"Гора высотой 511 метров к югу от Белграда. На вершине стоит Памятник Неизвестному герою Ивана Мештровича (1938). Телебашню на Авале разрушили бомбы НАТО в 1999 году. Её отстроили заново и открыли в 2010 году.",
   scenes:[
     {ch:10, t:"Авала — одна из пяти точек на карте Наташи."},
     {ch:24, img:"24-avala.jpg", t:"Мотоцикл мчится через леса. Наташа впервые отдаёт руль: «Ты мой. Мой король». На Авале место пустое — земля потревожена, а под камнем лежит записка: «Дикий час близок. Если хотите остановить хаос — найдите нас»."}
   ]},
  {id:"zedan", k:"wild", x:372, y:250, far:"место из романа", n:"Зедань", tag:"Последняя точка",
   real:"Зедань — место романа, и в путеводителях его не найти: в книге сказано, что сюда приходят случайно или по наводке. Мы условно поставили его на холмах над Дунаем к востоку от города, откуда река выглядит «тонкой серебряной линией».",
   scenes:[
     {ch:20, t:"«Следующая точка — Зедань», — говорит Ирина оперативницам."},
     {ch:25, img:"25-zedanj.jpg", t:"Каменное плато над рекой. Луис поднимает последний камень, но из теней выходят Марина и Катарина. Наташа кусает Марину, а дротики с транквилизатором валят с ног сначала Луиса, потом её. «Я вернусь. И за это заплатят все»."}
   ]}
];
const OFF = [
  {id:"flat", k:"city", n:"Квартира Наташи", tag:"Где-то в старом городе",
   real:"Адрес роман не называет. Мы знаем только, что из окна видна река, а в комнате — старые книги и вещи с историей.",
   scenes:[
     {ch:3, img:"03-platje.jpg", t:"После ужина Наташа выходит к Луису в длинном сербском платье XIX века. «Это платье из моего города. Оно многое помнит»."},
     {ch:5, img:"05-portret.jpg", t:"Луис показывает тетради. На одном листе — Наташа, нарисованная до их встречи. «У тебя есть дар. Ты видишь будущее»."},
     {ch:6, img:"06-sofija-na-poroge.jpg", t:"Утром без стука входит София с сумкой тёмных камней. В тетради Луис находит её портрет: всадница с мечом на фоне горящего Белграда."},
     {ch:14, t:"«С этого момента ты будешь жить здесь». Наташа не спрашивает — она решает."},
     {ch:21, img:"21-igra-sofii.jpg", t:"София приходит, пока Наташи нет, и пытается соблазнить Луиса. Наташа возвращается вовремя: «Уходи. Сейчас же»."},
     {ch:22, img:"22-predlozhenie.jpg", t:"«Ты готов сделать меня своей женой?» И сразу: предложение будет на Калемегдане. «Там. И только там»."}
   ]},
  {id:"bunker", k:"wild", n:"Бункер Министерства", tag:"Глубоко под землёй",
   real:"Комплекс Министерства мистических дел Востока: бетон, металл и холодный свет. Его координаты в романе засекречены.",
   scenes:[
     {ch:15, img:"15-irina.jpg", t:"Ирина выслушивает отчёт о провале: «Нам не нужно её уничтожать. Нам нужно её получить»."},
     {ch:26, img:"26-plenniki.jpg", t:"Наташа и Луис привязаны к стульям спина к спине. «Да, я ведьма! И что?!» Луис признаётся, что он сотрудник Федерации Мистического Юга, и заключает с Ириной союз."},
     {ch:27, img:"27-dve-pary-far.jpg", t:"Ирина отдаёт камни: «Дикий Час невозможно отменить. Его можно лишь направить». Две пары фар исчезают в ночи."}
   ]}
];

function svg(){
  const pins = PLACES.map((p, i) => { const c = KIND[p.k].c;
    return `<g class="bg-pin" data-p="${p.id}" tabindex="0" role="button" aria-label="${esc(p.n)}" transform="translate(${p.x} ${p.y})" style="--c:${c}">
      <circle class="bg-halo" r="15"/><circle class="bg-dot" r="8.5"/><text class="bg-num" y="3.6">${i + 1}</text>
      ${p.far ? `<text class="bg-far" y="22"${p.x > 340 ? ` x="12" style="text-anchor:end"` : ""}>${esc(p.far)}</text>` : ""}</g>`; }).join("");
  const stars = Array.from({length:46}, (_, i) => { const x = (i * 97.3) % 400, y = (i * 53.7) % 470; return `<circle cx="${x.toFixed(1)}" cy="${y.toFixed(1)}" r="${(i % 3) * .35 + .4}" />`; }).join("");
  return `<svg viewBox="0 0 400 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Карта Белграда">
  <defs>
    <radialGradient id="bgSky" cx="45%" cy="38%" r="75%"><stop offset="0" stop-color="#1f2c45"/><stop offset=".6" stop-color="#141d30"/><stop offset="1" stop-color="#0b1120"/></radialGradient>
    <linearGradient id="bgRiver" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#2b6f86"/><stop offset="1" stop-color="#1c4f66"/></linearGradient>
    <filter id="bgGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3"/></filter>
  </defs>
  <rect width="400" height="470" fill="url(#bgSky)"/>
  <g class="bg-stars">${stars}</g>
  <!-- кварталы -->
  <path d="M168 170 C 220 168 300 176 400 205 L400 330 C 340 380 300 405 250 400 C 205 395 170 360 150 300 C 140 255 150 205 168 170 Z" fill="#1d2840" opacity=".9"/>
  <path d="M0 150 C 60 170 120 170 155 180 C 140 230 120 280 95 320 C 60 340 25 360 0 380 Z" fill="#18233a" opacity=".9"/>
  <path d="M0 40 C 40 50 70 70 95 100 C 80 130 50 140 0 140 Z" fill="#1a253c" opacity=".9"/>
  <g stroke="#2a3757" stroke-width=".8" fill="none" opacity=".7">
    <path d="M190 190 L 300 250 M 200 230 L 330 220 M 215 260 L 240 400 M 260 200 L 270 380 M 180 300 L 330 300 M 20 200 L 130 260 M 40 300 L 120 220 M 20 90 L 80 110"/>
  </g>
  <!-- Калемегдан -->
  <path d="M158 166 C 172 160 196 162 204 176 C 206 190 190 198 176 196 C 164 192 156 180 158 166 Z" fill="#23402f" stroke="#3f6b4a" stroke-width="1"/>
  <path d="M164 172 l10 -6 l12 2 l10 8 l-4 10 l-14 4 l-10 -6 Z" fill="none" stroke="#c9a35a" stroke-width="1" stroke-dasharray="2 2" opacity=".8"/>
  <!-- Ада Циганлия -->
  <ellipse cx="52" cy="386" rx="26" ry="8" transform="rotate(-38 52 386)" fill="#23402f" stroke="#3f6b4a"/>
  <!-- Авала -->
  <path d="M250 470 L 300 412 L 318 428 L 334 418 L 382 470 Z" fill="#1f3a2c" stroke="#3f6b4a"/>
  <path d="M300 412 l0 -16" stroke="#c9a35a" stroke-width="1.6"/><circle cx="300" cy="394" r="2" fill="#c9a35a"/>
  <!-- холмы Зеданя -->
  <path d="M330 270 L 352 236 L 366 250 L 380 232 L 400 262 L 400 280 Z" fill="#1f3a2c" stroke="#3f6b4a"/>
  <!-- дороги за город -->
  <path d="M250 330 C 270 370 290 395 300 412" stroke="#b9a37a" stroke-width="1.2" stroke-dasharray="3 4" fill="none" opacity=".7"/>
  <path d="M290 220 C 320 230 345 238 362 246" stroke="#b9a37a" stroke-width="1.2" stroke-dasharray="3 4" fill="none" opacity=".7"/>
  <!-- реки -->
  <g fill="none" stroke-linecap="round">
    <path d="M0 425 C 45 390 85 340 108 292 C 124 255 140 205 160 168" stroke="#4fc3d9" stroke-width="22" opacity=".18" filter="url(#bgGlow)"/>
    <path d="M86 0 C 76 55 108 120 160 165 C 205 172 262 160 322 176 C 360 186 385 200 400 210" stroke="#4fc3d9" stroke-width="34" opacity=".18" filter="url(#bgGlow)"/>
    <path d="M0 425 C 45 390 85 340 108 292 C 124 255 140 205 160 168" stroke="url(#bgRiver)" stroke-width="14"/>
    <path d="M86 0 C 76 55 108 120 160 165 C 205 172 262 160 322 176 C 360 186 385 200 400 210" stroke="url(#bgRiver)" stroke-width="22"/>
  </g>
  <!-- мосты -->
  <g stroke="#d8c7a0" stroke-width="2.4" stroke-linecap="round"><path d="M128 245 L 150 256"/><path d="M98 300 L 120 310"/></g>
  <!-- подписи -->
  <g class="bg-lbl">
    <text x="300" y="150" class="r" transform="rotate(8 300 150)">Д у н а й</text>
    <text x="70" y="335" class="r" transform="rotate(-55 70 335)">С а в а</text>
    <text x="22" y="98" class="d">ЗЕМУН</text>
    <text x="22" y="250" class="d">НОВИ</text><text x="22" y="263" class="d">БЕОГРАД</text>
    <text x="285" y="312" class="d">СТАРЫЙ ГРАД</text>
    <text x="300" y="350" class="d">ВРАЧАР</text>
    <text x="60" y="412" class="s">Ада Циганлия</text>
    <text x="96" y="20" class="s">↑ к Нови-Саду</text>
  </g>
  <g transform="translate(372 32)" class="bg-compass"><circle r="14"/><path d="M0 -10 L4 2 L0 0 L-4 2 Z"/><text y="-17">С</text></g>
  ${pins}
</svg>`;
}

function css(){
  if (document.getElementById("bgCss")) return;
  const s = document.createElement("style"); s.id = "bgCss";
  s.textContent = `
.bg{--bk:#0e1526;--pp:#f4ecdc;--ink:#2a2118;--mu:#6d5b47;--ac:#c9a35a;--rd:#9b3b2c;color:#e9edf3;font-family:var(--sans);background:linear-gradient(#141d30,#0e1526);border-radius:16px;padding:16px 12px 14px}
.bg h3{margin:0;font:700 clamp(22px,5vw,28px)/1.15 var(--display,var(--serif));color:var(--ac);text-align:center}
.bg .bg-p{margin:8px auto 12px;max-width:560px;font-size:13.5px;line-height:1.55;color:#b7c2cf;text-align:center}
.bg-kinds{display:flex;gap:6px;overflow-x:auto;padding:0 0 10px;scrollbar-width:none}.bg-kinds::-webkit-scrollbar{display:none}
.bg-kinds button{flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:5px 11px;border-radius:16px;border:1.5px solid #33425e;background:#162037;color:#d2d9e2;font:inherit;font-size:12.5px;cursor:pointer}
.bg-kinds button i{width:9px;height:9px;border-radius:50%;background:var(--c)}.bg-kinds button.on{border-color:var(--c);background:#223052;color:#fff}
.bg-map{position:relative;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px #0008;touch-action:none;user-select:none;-webkit-user-select:none}
.bg-map svg{display:block;width:100%;height:auto}
.bg-stars circle{fill:#fff;opacity:.35}
.bg-lbl text{font-family:var(--sans);fill:#8ea0b8}.bg-lbl .r{font-size:11px;font-style:italic;fill:#7fd3e4;letter-spacing:.06em}.bg-lbl .d{font-size:9.5px;letter-spacing:.18em;font-weight:700;fill:#5f7090}.bg-lbl .s{font-size:8.5px;fill:#6f7f98}
.bg-compass circle{fill:#0e1526;stroke:#33425e}.bg-compass path{fill:var(--ac)}.bg-compass text{font-size:9px;fill:var(--ac);text-anchor:middle;font-weight:700}
.bg-pin{cursor:pointer;outline:none}.bg-pin .bg-halo{fill:var(--c);opacity:0;transition:opacity .2s}.bg-pin .bg-dot{fill:var(--c);stroke:#0e1526;stroke-width:2.2;transition:r .15s}
.bg-pin .bg-num{font:700 9.5px var(--sans);fill:#10172a;text-anchor:middle;pointer-events:none}
.bg-pin .bg-far{font:600 7.5px var(--sans);fill:#c7d0dc;text-anchor:middle;paint-order:stroke;stroke:#0e1526;stroke-width:3px}
.bg-pin:hover .bg-halo,.bg-pin:focus .bg-halo,.bg-pin.hot .bg-halo{opacity:.35}.bg-pin.on .bg-halo{opacity:.55;animation:bgPulse 1.8s ease-in-out infinite}
.bg-pin.on .bg-dot,.bg-pin.hot .bg-dot{r:10.5}.bg-pin.dim{opacity:.22}
@keyframes bgPulse{50%{opacity:.18}}
.bg-tip{position:absolute;z-index:3;pointer-events:none;transform:translate(-50%,calc(-100% - 16px));background:#f4ecdc;color:#2a2118;border-radius:10px;padding:6px 10px;box-shadow:0 6px 18px #000a;min-width:120px;max-width:220px;text-align:center;opacity:0;transition:opacity .12s}
.bg-tip.on{opacity:1}.bg-tip b{display:block;font:700 14px/1.2 var(--display,var(--serif))}.bg-tip small{display:block;font-size:11.5px;color:#6d5b47;margin-top:2px}
.bg-tip:after{content:"";position:absolute;left:50%;bottom:-6px;margin-left:-6px;border:6px solid transparent;border-bottom:0;border-top-color:#f4ecdc}
.bg-hint{margin:8px 0 0;text-align:center;font-size:12px;color:#8ea0b8}
.bg-box{scroll-margin-top:70px}
.bg-card{margin-top:12px;border-radius:14px;background:var(--pp);color:var(--ink);overflow:hidden;box-shadow:0 8px 26px #0007;border-top:4px solid var(--c)}
.bg-head{display:flex;align-items:center;gap:10px;padding:14px 14px 4px}.bg-head b.n{flex:0 0 auto;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#10172a;font:700 14px var(--sans)}
.bg-head h4{margin:0;font:700 21px/1.15 var(--display,var(--serif))}.bg-head small{display:block;font:12.5px var(--sans);color:var(--mu);margin-top:2px}
.bg-sec{padding:6px 14px 4px}.bg-sec>b{display:block;font:700 11.5px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--rd);margin:8px 0 8px}
.bg-scene{display:grid;gap:8px;margin:0 0 12px;padding:0 0 12px;border-bottom:1px dashed #d9c9aa}.bg-scene:last-child{border-bottom:0;margin-bottom:0}
.bg-scene img{width:100%;border-radius:10px;display:block;aspect-ratio:3/2;object-fit:cover;background:#e6dcc6}
.bg-scene .ch{font:600 12px var(--sans);color:var(--mu)}.bg-scene .ch a{color:var(--rd);text-decoration:none}.bg-scene .ch a:hover{text-decoration:underline}
.bg-scene p{margin:0;font:15.5px/1.6 var(--serif)}
.bg-lock{display:flex;gap:9px;align-items:center;padding:9px 11px;border-radius:9px;background:#e8dcc3;font:13px/1.4 var(--sans);color:var(--mu)}.bg-lock span{font-size:17px}.bg-lock a{margin-left:auto;color:var(--rd);font-weight:700;white-space:nowrap;text-decoration:none}
.bg-real{margin:4px 14px 12px;padding:10px 12px;border-radius:10px;background:#fffaf0;border:1px solid #e3d5b8;font:14px/1.55 var(--sans);color:#3b3025}
.bg-nav{display:flex;gap:8px;padding:0 14px 14px}.bg-nav button{flex:1;padding:9px;border-radius:10px;border:1.5px solid #d9c9aa;background:#fffaf0;color:var(--ink);font:600 13px var(--sans);cursor:pointer}.bg-nav button:hover{border-color:var(--rd);color:var(--rd)}
.bg-list{list-style:none;margin:14px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.bg-list button{width:100%;display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:10px;border:1.5px solid #2b3958;background:#162037;color:#dfe5ec;font:inherit;font-size:13px;text-align:left;cursor:pointer}
.bg-list button:hover,.bg-list button.on{border-color:var(--c)}.bg-list b{flex:0 0 auto;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#10172a;font-size:11px}
.bg-off{margin:14px 0 0}.bg-off>p{margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8ea0b8;font-weight:700}
.bg-count{font-weight:400;color:#8ea0b8;font-size:11.5px;margin-left:auto}
@media (max-width:420px){.bg-list{grid-template-columns:1fr}}
`;
  document.head.appendChild(s);
}

function map(el, o){
  css();
  const all = PLACES.concat(OFF), byId = id => all.find(p => p.id === id);
  const open = o.open || (() => true), chi = o.ch || (p => ({title:"Глава " + p, href:"#/" + o.slug + "/" + p}));
  const openN = p => p.scenes.filter(s => open(s.ch)).length;
  let kind = null, sel = null;
  const listBtn = (p, num) => `<li><button type="button" data-l="${p.id}" style="--c:${KIND[p.k].c}"><b>${num}</b><span>${esc(p.n)}</span><span class="bg-count">${openN(p)}/${p.scenes.length}</span></button></li>`;
  el.innerHTML = `<div class="bg"><h3>Белград «Дикого часа»</h3>
    <p class="bg-p">Город с двумя душами — дневной и дикой. Наведите курсор или проведите пальцем по карте: над каждой точкой появится её название. Нажмите — и откроются сцены романа и рассказ о месте в реальности. Сцены из глав, которые вы ещё не прочитали, остаются закрытыми.</p>
    <div class="bg-kinds">${Object.entries(KIND).map(([k, v]) => `<button type="button" data-k="${k}" style="--c:${v.c}"><i></i>${esc(v.t)}</button>`).join("")}</div>
    <div class="bg-map">${svg()}<div class="bg-tip"><b></b><small></small></div></div>
    <p class="bg-hint">☝️ Ведите пальцем по карте — точки отзываются сами</p>
    <div class="bg-box"></div>
    <ol class="bg-list">${PLACES.map((p, i) => listBtn(p, i + 1)).join("")}</ol>
    <div class="bg-off"><p>Вне карты</p><ol class="bg-list">${OFF.map(p => listBtn(p, "?")).join("")}</ol></div></div>`;
  const mapEl = el.querySelector(".bg-map"), sv = el.querySelector("svg"), tip = el.querySelector(".bg-tip"), box = el.querySelector(".bg-box");
  const apply = () => {
    el.querySelectorAll("[data-k]").forEach(b => b.classList.toggle("on", b.dataset.k === kind));
    el.querySelectorAll(".bg-pin").forEach(g => { const p = byId(g.dataset.p); g.classList.toggle("dim", !!kind && p.k !== kind); g.classList.toggle("on", g.dataset.p === sel); });
    el.querySelectorAll("[data-l]").forEach(b => { const p = byId(b.dataset.l); b.closest("li").style.opacity = kind && p.k !== kind ? .35 : 1; b.classList.toggle("on", b.dataset.l === sel); });
  };
  const pinXY = p => { const r = sv.getBoundingClientRect(), m = mapEl.getBoundingClientRect(); return {x: r.left - m.left + p.x / 400 * r.width, y: r.top - m.top + p.y / 470 * r.height}; };
  const hot = id => {
    el.querySelectorAll(".bg-pin").forEach(g => g.classList.toggle("hot", g.dataset.p === id));
    if (!id) { tip.classList.remove("on"); return; }
    const p = byId(id), q = pinXY(p), w = mapEl.clientWidth;
    tip.querySelector("b").textContent = p.n; tip.querySelector("small").textContent = p.tag;
    tip.style.left = Math.max(70, Math.min(w - 70, q.x)) + "px"; tip.style.top = q.y + "px"; tip.classList.add("on");
  };
  const refTxt = ch => { const c = chi(ch); return c.label ? `«${c.title}»` : `Глава ${ch} «${c.title}»`; };
  const show = (id, scroll) => {
    sel = id; apply(); const p = byId(id), K = KIND[p.k], i = PLACES.indexOf(p), list = kind ? all.filter(x => x.k === kind) : all, j = list.indexOf(p);
    const shut = p.scenes.filter(s => !open(s.ch)), pl = n => n % 10 === 1 && n % 100 !== 11 ? "сцена" : n % 10 >= 2 && n % 10 <= 4 && (n % 100 < 10 || n % 100 >= 20) ? "сцены" : "сцен";
    const scenes = p.scenes.filter(s => open(s.ch)).map(s => { const c = chi(s.ch);
      return `<div class="bg-scene">${s.img ? `<img src="${IMG}${esc(s.img)}" alt="" loading="lazy">` : ""}<span class="ch">📖 <a href="${esc(c.href)}">${esc(refTxt(s.ch))}</a></span><p>${esc(s.t)}</p></div>`; }).join("")
      + (shut.length ? `<div class="bg-scene"><div class="bg-lock"><span aria-hidden="true">🔒</span>${shut.length === 1 ? `Сцена из главы ${shut[0].ch} откроется, когда вы до неё дочитаете` : `Ещё ${shut.length} ${pl(shut.length)} из глав ${shut.map(s => s.ch).join(", ")} откроются по мере чтения`}<a href="${esc(chi(shut[0].ch).href)}">Читать →</a></div></div>` : "");
    box.innerHTML = `<div class="bg-card" style="--c:${K.c}"><div class="bg-head"><b class="n">${i >= 0 ? i + 1 : "?"}</b><div><h4>${esc(p.n)}</h4><small>${esc(K.t)} · ${esc(p.tag)}</small></div></div>
      <div class="bg-sec"><b>📖 В романе</b>${scenes}</div>
      <div class="bg-sec"><b>🌍 В реальности</b></div><div class="bg-real">${esc(p.real)}</div>
      <div class="bg-nav"><button type="button" data-go="${list[(j - 1 + list.length) % list.length].id}">← ${esc(list[(j - 1 + list.length) % list.length].n)}</button><button type="button" data-go="${list[(j + 1) % list.length].id}">${esc(list[(j + 1) % list.length].n)} →</button></div></div>`;
    box.querySelectorAll("[data-go]").forEach(b => b.onclick = () => show(b.dataset.go, true));
    if (scroll) box.scrollIntoView({block:"start", behavior:"smooth"});
  };
  /* наведение мышью и «провести пальцем»: ближайшая точка в радиусе 26 px подсвечивается, отпустили — открыли */
  const nearest = (cx, cy) => { const r = sv.getBoundingClientRect(); let best = null, bd = 26 * 26;
    PLACES.forEach(p => { if (kind && p.k !== kind) return; const x = r.left + p.x / 400 * r.width, y = r.top + p.y / 470 * r.height, d = (x - cx) ** 2 + (y - cy) ** 2; if (d < bd) { bd = d; best = p.id; } }); return best; };
  let cur = null, down = false;
  mapEl.addEventListener("pointermove", e => { if (e.pointerType === "mouse" || down) { cur = nearest(e.clientX, e.clientY); hot(cur); mapEl.style.cursor = cur ? "pointer" : ""; } });
  mapEl.addEventListener("pointerdown", e => { down = true; try { mapEl.setPointerCapture(e.pointerId); } catch(_) {} cur = nearest(e.clientX, e.clientY); hot(cur); });
  const up = () => { if (!down) return; down = false; if (cur) show(cur, true); hot(null); };
  mapEl.addEventListener("pointerup", up); mapEl.addEventListener("pointercancel", () => { down = false; hot(null); });
  mapEl.addEventListener("pointerleave", e => { if (e.pointerType === "mouse") hot(null); });
  el.querySelectorAll(".bg-pin").forEach(g => g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(g.dataset.p, true); } });
  el.querySelectorAll("[data-l]").forEach(b => b.onclick = () => show(b.dataset.l, true));
  el.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { kind = kind === b.dataset.k ? null : b.dataset.k; apply(); });
}

window.LitmirBelgrade = {map};
})();
