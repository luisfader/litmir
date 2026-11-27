/* Карта Мадрида — раздел романа «Тайна семьи Фадер: Вторая половина».
   LitmirMadrid.map(el, {slug, open(p), ch(p)}) рисует простую карту центра Мадрида (SVG, всё кодом) и точки мест из романа.
   Наведите мышь или проведите пальцем по карте — над точкой появится подпись; нажмите — откроются сцены романа
   и рассказ о месте в реальности. Сцена из непрочитанной главы закрыта, пока читатель до неё не дойдёт. */
(function(){
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const IMG = "novels/tajna-semi-fader-2/";

const KIND = {
  city:{t:"Улицы и площади", c:"#e8805a"},
  art:{t:"Музеи и библиотека", c:"#b994f0"},
  green:{t:"Парки и сады", c:"#7fcf7a"},
  road:{t:"Дорога и ночлег", c:"#e0b04b"}
};

/* x, y — точка на нашей карте (viewBox 400×470). Карта упрощённая: север сверху, центр крупно, Барахас — у края. */
const PLACES = [
  {id:"barajas", k:"road", x:372, y:46, far:"≈ 12 км", n:"Аэропорт Барахас", tag:"Здесь начинается Мадрид",
   real:"Главный аэропорт Испании, полное название — Адольфо Суарес Мадрид-Барахас. Он находится к северо-востоку от центра, примерно в 12 километрах от Пуэрта-дель-Соль.",
   scenes:[
     {ch:5, t:"Пограничник кричит «¡Olé!» над каждым паспортом, у ленты с багажом «тореадор» сражается с «быком» в пластиковых рогах. «Это Испания, — говорит Луис. — Испанцы не разговаривают. Они кричат»."},
     {ch:5, t:"У служебной двери стоит бородатый мужчина в безупречном костюме — единственный, кто не кричит. «Хоть один нормальный», — замечает Наталья. «Министр, наверное», — отвечает Луис."},
     {ch:5, t:"Таксист просит чаевые за зелёный свет, за «знаменитый склад», за хорошую погоду. Луис даёт ему лучшие чаевые в России — двести рублей, — и таксист кладёт их за козырёк, как святыню."}
   ]},
  {id:"hotel", k:"road", x:214, y:330, n:"Отель «Эль Дуэнде», улица Аточа", tag:"Их мадридский дом",
   real:"Отель «Эль Дуэнде» придуман для романа. Улица Аточа реальна: одна из самых старых улиц города, она спускается от Пласа-Майор к площади и вокзалу Аточа. «Дуэнде» в испанском фольклоре — домовой, а во фламенко — то самое необъяснимое вдохновение.",
   scenes:[
     {ch:5, t:"Таксист отказывается ехать дальше: «Дальше Мадрид сошёл с ума». Луис и Наталья пробираются к отелю пешком, прячась в подъездах от процессий с сардиной и тореадоров."},
     {ch:6, t:"Крошечный балкон, узкая кровать, которая «притворяется двуспальной». Наталья рассказывает, как много раз бывала в Мадриде — и всегда мечтала приехать сюда с тем, кого любит. «Te amo, mi loquita». А под окнами Мадрид сходит с ума, и они этого не замечают."},
     {ch:7, t:"Портье Пилар с выпученными глазами: «Мадридская вода из-под крана гораздо более мадридская, чем вода Мендосы!» Наталья решает пропустить континентальный завтрак."}
   ]},
  {id:"lavapies", k:"city", x:180, y:350, n:"Лавапьес", tag:"Маргаритки кусаются",
   real:"Старый квартал к югу от центра с узкими крутыми улицами и бельём на балконах. Когда-то здесь жили ремесленники, теперь это самый многонациональный район Мадрида: на одной улице можно услышать испанский, арабский и бенгальский.",
   scenes:[
     {ch:7, t:"Луис «срезает» и уводит их совсем не туда. Маргаритка в горшке кусает его за палец, а сеньора в бигуди кричит с балкона: «Мои маргаритки не кусают порядочных людей!» — и бросает в него деревянной ложкой."},
     {ch:7, t:"Уже уходя, Наталья слышит, как где-то позади мужчина с аргентинским выговором кричит: «¡NO PASARÁN!» Она оборачивается — улица пуста."}
   ]},
  {id:"bne", k:"art", x:268, y:150, n:"Национальная библиотека", tag:"Где королева положила первый камень",
   real:"Здание Библиотеки и Национальных музеев на бульваре Реколетос. Первый камень заложила королева Изабелла II 21 апреля 1866 года, акт об этом напечатали в «Гасета де Мадрид» на следующий день. Строили долго: библиотека переехала сюда только в 1896 году.",
   scenes:[
     {ch:8, t:"В читальном зале женщина в вышитом платье громко говорит по-испански то, чего в библиотеке не говорят. «Че, это вообще законно?» — шепчет Наталья. «Та, кто это сказала, не испанка», — отвечает Луис. Потом она вырывает страницу и пять секунд смотрит Луису прямо в глаза."},
     {ch:8, t:"Пол дрожит, с полки падает старый журнал с той же гравюрой, что висит у Карла. Молодой Карл показывает пальцем вниз, а на полях карандашом: «K. F. — Unter den Büchern»."},
     {ch:9, t:"Архивистка Ремедиос, сорок один год в этом здании, ведёт «племянников из Буэнос-Айреса» в фундамент. На гранитной глыбе — крошечные соты и буквы K. F. Внутри — латунный цилиндр, запечатанный воском с запахом медовухи."},
     {ch:9, t:"Перед лестницей стоит смирный каменный бык, вокруг аплодирует толпа. «Тут снимают кино», — уверен Луис. А существо в сером пальто с черепом быка вместо головы выхватывает цилиндр из рук Натальи."}
   ]},
  {id:"cibeles", k:"city", x:246, y:220, n:"Площадь Сибелес", tag:"Богиня на колеснице со львами",
   real:"Одна из главных площадей Мадрида. В фонтане (1782) богиня Кибела едет на колеснице, запряжённой львами. Над площадью стоит белый Дворец связи — бывший главный почтамт, теперь мэрия. Здесь празднуют победы болельщики «Реал Мадрида».",
   scenes:[
     {ch:10, t:"Существо идёт между машинами, и автобус проезжает прямо сквозь него. А Луису и Наталье приходится ждать светофора. «Если бы здесь был вчерашний таксист, ему пришлось бы дать на чай»."}
   ]},
  {id:"alcala", k:"city", x:288, y:214, n:"Ворота Алькала", tag:"«Ещё один Карл!»",
   real:"Триумфальные ворота с пятью проёмами, построенные при короле Карлосе III в 1778 году по проекту Франческо Сабатини. Когда-то через них въезжали в Мадрид по дороге из Алькала-де-Энарес.",
   scenes:[
     {ch:10, t:"«Их построили при Карлосе Третьем», — говорит Наталья. «Нати, в этом городе слишком много Карлов!» Существо впервые смотрит на них — и Наталья чувствует холодные пальцы в своих мыслях."}
   ]},
  {id:"retiro", k:"green", x:328, y:258, n:"Парк Ретиро", tag:"Пруд, лодки и король на коне",
   real:"Огромный парк в центре города, когда-то сад королевского дворца. На большом пруду катаются на лодках, над ним стоит полукруглый памятник Альфонсо XII. В глубине парка — Хрустальный дворец (1887), павильон из стекла и железа, построенный для выставки растений с Филиппин.",
   scenes:[
     {ch:6, t:"Ретиро — первый в списке «мест Натальи»: Хрустальный дворец, «будто стоишь внутри мыльного пузыря»."},
     {ch:10, t:"Продавец мороженого кричит на весь парк «¡Helado de turrón!» — и существо уходит от них прямо по воде, между лодками. «Аниматор», — объясняет парень в лодке своей девушке."},
     {ch:10, t:"У памятника Альфонсо XII Луис даёт второе обещание: Хрустальный дворец, когда всё закончится. «Мендосец сказал…»"}
   ]},
  {id:"prado", k:"art", x:264, y:276, n:"Музей Прадо", tag:"Менины и Сатурн",
   real:"Один из главных художественных музеев мира, открыт в 1819 году. Здесь «Менины» Веласкеса, где художник смотрит прямо на зрителя, а король с королевой видны только в маленьком зеркале, и «Чёрные картины» Гойи, которые он написал на стенах своего дома.",
   scenes:[
     {ch:11, t:"Существо проходит мимо рамки металлоискателя без билета. Луис и Наталья пятнадцать минут стоят в очереди за японской группой."},
     {ch:11, t:"Существо стоит перед «Менинами» и смотрит в зеркало: впервые кто-то смотрит на него. «Señor, no se puede tocar», — останавливает Луиса смотрительница."},
     {ch:11, t:"Перед «Сатурном» Гойи цилиндр начинает светиться, и серые пальцы существа светлеют. «Медовуха его перерабатывает», — понимает Наталья."}
   ]},
  {id:"sofia", k:"art", x:236, y:352, n:"Музей королевы Софии", tag:"«Герника»",
   real:"Музей современного искусства в здании бывшей больницы Сан-Карлос XVIII века. Здесь висит «Герника» Пикассо — картина, заказанная Республикой для испанского павильона на Всемирной выставке в Париже 1937 года. В Испанию она вернулась только в 1981 году.",
   scenes:[
     {ch:6, t:"Вид с балкона отеля. «Так это на неё работал Карл?» — «Нет. Карл работал на Изабеллу»."},
     {ch:12, t:"Перед «Герникой» Луис рассказывает о прадеде — мадридском милисиано, погибшем при бомбёжке города, — и понимает, как на самом деле родилась картина."},
     {ch:12, t:"Существо возвращает Луису цилиндр и рассыпается золотой пылью. Из пыли вылетает пчела. Внутри цилиндра — латунная пчела с цифрами «0,0»."}
   ]},
  {id:"sol", k:"city", x:150, y:254, n:"Пуэрта-дель-Соль", tag:"Нулевой километр",
   real:"Главная площадь Мадрида. На мостовой перед старым зданием почты лежит плитка «Нулевой километр»: от неё в Испании считают расстояния по главным дорогам. Здесь же стоит статуя медведя с земляничным деревом — символ города.",
   scenes:[
     {ch:12, t:"«Следующий шаг ты найдёшь там, где начинаются все дороги Испании. Там, где ноль. Пчела знает, куда сесть», — пишет Карл. «Пуэрта-дель-Соль», — сразу понимает Наталья."},
     {ch:13, t:"Часы на здании почты бьют двенадцать раз в девять вечера, а бронзовый медведь уходит с герба по улице Алькала. «Это не карнавал», — впервые признаёт Луис."},
     {ch:13, t:"Золотая пчела садится на латунную, и на камне нулевого километра проступают слова: «Plaza Mayor. Al alba. Bajo el caballo». А белые всадники начинают принюхиваться к мёду."},
     {ch:15, t:"Четыре утра, площадь полна неподвижных всадников. Наталья говорит белому коню «Duerme. Todavía no es hora» — и он засыпает."}
   ]},
  {id:"gines", k:"city", x:132, y:244, n:"Шоколадная Сан-Хинес", tag:"Чуррос в конце света",
   real:"Знаменитая шоколадная в узком проходе Пасадисо-де-Сан-Хинес, рядом с улицей Ареналь, открыта с 1894 года. Здесь едят чуррос и поррас, макая их в очень густой горячий шоколад, и работают до глубокой ночи: для мадридцев это классический финал ночной прогулки.",
   scenes:[
     {ch:13, t:"Дон Хоакин бьёт половником по стойке: «В моём доме не спорят. В моём доме едят» — и лампы перестают мигать. Старый немец, сеньор Карлос, каждый год сидел за столиком у зеркала и говорил: «Ещё рано»."},
     {ch:15, t:"Шоколад в четыре утра, как в списке Натальи. Двое призрачных копейщиков отошли от двери на два метра: дон Хоакин сказал им, что без заказа стоять нельзя."}
   ]},
  {id:"callao", k:"art", x:128, y:212, n:"Кинотеатр на Гран-Виа", tag:"Ночь за стеклянной дверью",
   real:"Гран-Виа — главный проспект Мадрида, построенный в начале XX века; вокруг площади Кальяо до сих пор стоят старые кинотеатры и театры с неоновыми вывесками. Его часто называют мадридским Бродвеем.",
   scenes:[
     {ch:14, t:"По Гран-Виа течёт белая армия. Киномеханик Пепе показывает «Последний куплет» пустому залу, а потом, услышав женщину с мегафоном, берёт ломик и уходит на площадь Испании."},
     {ch:14, t:"Над проспектом пролетает дракон. «Скажи, что это карнавал», — просит Наталья. «Я больше никогда в жизни не скажу слово „карнавал“», — отвечает Луис."},
     {ch:15, t:"Армия стоит неподвижно, на саблях иней, а между конями спят мадридцы со сковородками. Луис и Наталья проходят по узкой дорожке между ними."}
   ]},
  {id:"mayor", k:"city", x:140, y:284, n:"Пласа-Майор", tag:"Под копытами короля",
   real:"Главная площадь старого Мадрида, закрытая со всех сторон, с аркадами и девятью входами; ей около четырёхсот лет. В центре стоит конная статуя Филиппа III. Через открытый рот бронзового коня веками залетали птицы и не могли выбраться; в 1931 году взрыв петарды разворотил статую, и внутри нашли сотни птичьих костей. После ремонта рот запаяли.",
   scenes:[
     {ch:15, t:"На улице Майор молодой милисиано в синем комбинезоне стоит лицом к армии: «Por aquí ellos no pasan. Vosotros sí. Pasad». У него мамины брови, говорит Луис."},
     {ch:15, t:"Рассвет. Пустая площадь, как в списке Натальи. Под копытами коня — соты и буквы K. F. А из-под арки уже выходит штаб сопротивления."},
     {ch:16, t:"«¡No pasarán! ¡NO! ¡PASAREMOS NOSOTROS!» Наташа поднимает площадь, Луис плачет, а Наталья кричит вместе со всеми. «Я хочу быть как она»."},
     {ch:17, t:"«¡Dejadme pasar!» — кричит Наталья, и толпа расступается. Под конём — коробка от фиалковых леденцов, пустая бронзовая ячейка и записка Карла. «Тогда ищите быстро», — говорит Наташа по-русски."}
   ]},
  {id:"debod", k:"green", x:62, y:196, n:"Храм Дебод", tag:"Закат, который обещан",
   real:"Настоящий древнеегипетский храм, построенный больше двух тысяч лет назад. Египет подарил его Испании в 1968 году в благодарность за помощь в спасении нубийских памятников. Храм стоит на холме у площади Испании и отражается в воде; это одно из лучших мест в Мадриде, чтобы смотреть закат.",
   scenes:[
     {ch:6, t:"«Это самое красивое место в городе. Я всегда хотела посмотреть на этот закат не одна». — «Значит, посмотрим. Как только найдём противоядие»."},
     {ch:17, t:"«Последний шаг — там, где солнце садится в чужом храме. Приходи к воде, когда солнце коснётся воды. Пчела сядет». До заката девять часов, и все девять нельзя умирать."}
   ]}
];
const OFF = [
  {id:"mendoza", k:"road", n:"Мендоса", tag:"Финка Карла и дождь из листьев",
   real:"Новая столица Аргентины в романе. Финка Карла под Лухан-де-Куйо — место романа: найти её можно, только если знаешь, куда смотреть, и если у ворот ждёт лис.",
   scenes:[
     {ch:1, t:"Серхио и Моника берут три дня без указов. Ключ из Германии открывает тайную финку Карла: светящийся виноград, янтарная вода в арыке и тетрадь «Не читать во время сиесты»."},
     {ch:2, t:"Карл пишет: уставшая медовуха притягивает зло, может быть, чтобы его переработать. Вторая половина противоядия — «там, где королева положила первый камень»."},
     {ch:3, t:"Над новой площадью проливается дождь из виноградных листьев, и Мендоса ровно час сходит с ума. Серхио наконец звонит Луису."}
   ]},
  {id:"elbrus", k:"road", n:"Эльбрус", tag:"Звонок на высоте пяти тысяч",
   real:"Самая высокая гора Европы (5642 м), потухший вулкан на Кавказе. Восхождения обычно начинают глубокой ночью, чтобы к утру выйти на вершину; ближайший большой аэропорт — Минеральные Воды.",
   scenes:[
     {ch:4, img:"04-zvonok.jpg", t:"Второй час ночи, двенадцать налобных фонарей поворачиваются к Луису. «Папа, дай мне повод перестать подниматься». — «Вообще-то мне нужно, чтобы ты поехал в Мадрид»."},
     {ch:4, img:"04-shepot.jpg", t:"«Слава богу, что тебе позвонил папа», — шепчет Наталья. «Ты тоже?» — «Я ещё на четырёх тысячах хотела вниз»."},
     {ch:4, img:"04-khychin.jpg", t:"Хычины, чай с чабрецом и решение: «Никаких англичан и никаких янки. Мы — герои мендосско-московской истории»."}
   ]}
];

function svg(){
  const pins = PLACES.map((p, i) => { const c = KIND[p.k].c;
    return `<g class="md-pin" data-p="${p.id}" tabindex="0" role="button" aria-label="${esc(p.n)}" transform="translate(${p.x} ${p.y})" style="--c:${c}">
      <circle class="md-halo" r="15"/><circle class="md-dot" r="8.5"/><text class="md-num" y="3.6">${i + 1}</text>
      ${p.far ? `<text class="md-far" y="22"${p.x > 340 ? ` x="12" style="text-anchor:end"` : ""}>${esc(p.far)}</text>` : ""}</g>`; }).join("");
  return `<svg viewBox="0 0 400 470" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Карта Мадрида">
  <defs>
    <linearGradient id="mdSky" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#2b2236"/><stop offset="1" stop-color="#1b1624"/></linearGradient>
  </defs>
  <rect width="400" height="470" fill="url(#mdSky)"/>
  <!-- город -->
  <path d="M40 120 C 120 90 260 80 360 110 L 380 400 C 300 430 160 440 50 410 Z" fill="#2f2738" opacity=".95"/>
  <!-- Мансанарес -->
  <path d="M30 0 C 26 120 18 240 34 330 C 46 390 70 430 110 470" stroke="#4fa9c9" stroke-width="9" fill="none" opacity=".75"/>
  <text x="14" y="300" class="md-r" transform="rotate(-84 14 300)">Мансанарес</text>
  <!-- Ретиро и сады -->
  <path d="M300 196 L 372 200 L 376 318 L 300 320 Z" fill="#2c4a33" stroke="#4b7a52" stroke-width="1"/>
  <rect x="318" y="246" width="26" height="14" rx="2" fill="#3e7fa0" opacity=".85"/>
  <path d="M252 296 L 280 296 L 280 324 L 252 324 Z" fill="#2c4a33" stroke="#4b7a52" stroke-width="1"/>
  <path d="M44 176 L 84 172 L 86 214 L 46 216 Z" fill="#2c4a33" stroke="#4b7a52" stroke-width="1"/>
  <!-- улицы -->
  <g fill="none" stroke-linecap="round">
    <path d="M256 60 L 252 150 L 246 220 L 252 290 L 258 352" stroke="#c9a35a" stroke-width="4" opacity=".8"/>
    <path d="M150 254 C 190 240 220 226 246 220 L 288 214 L 300 212" stroke="#d8c7a0" stroke-width="3" opacity=".75"/>
    <path d="M86 196 C 130 200 190 206 246 220" stroke="#d8c7a0" stroke-width="3" opacity=".75"/>
    <path d="M150 254 C 180 290 210 320 250 350" stroke="#d8c7a0" stroke-width="2.4" opacity=".6"/>
    <path d="M150 254 L 96 258 M 150 254 L 140 300 M 150 254 L 158 200" stroke="#6b5f78" stroke-width="1.6" opacity=".7"/>
    <path d="M300 120 L 372 46" stroke="#b9a37a" stroke-width="1.2" stroke-dasharray="3 4" opacity=".7"/>
  </g>
  <!-- Королевский дворец -->
  <rect x="66" y="246" width="22" height="16" fill="none" stroke="#c9a35a" stroke-width="1" opacity=".7"/>
  <g class="md-lbl">
    <text x="262" y="196" class="s" transform="rotate(-86 262 196)">Реколетос</text>
    <text x="242" y="306" class="s" transform="rotate(-86 242 306)">Пасео-дель-Прадо</text>
    <text x="120" y="192" class="s">Гран-Виа</text>
    <text x="190" y="236" class="s" transform="rotate(-14 190 236)">Алькала</text>
    <text x="168" y="300" class="s" transform="rotate(40 168 300)">Аточа</text>
    <text x="40" y="278" class="s">Королевский дворец</text>
    <text x="300" y="340" class="d">РЕТИРО</text>
    <text x="110" y="150" class="d">ЦЕНТР</text>
    <text x="232" y="378" class="s">вокзал Аточа</text>
  </g>
  <g transform="translate(372 440)" class="md-compass"><circle r="14"/><path d="M0 -10 L4 2 L0 0 L-4 2 Z"/><text y="-17">С</text></g>
  ${pins}
</svg>`;
}

function css(){
  if (document.getElementById("mdCss")) return;
  const s = document.createElement("style"); s.id = "mdCss";
  s.textContent = `
.md{--bk:#0e1526;--pp:#f4ecdc;--ink:#2a2118;--mu:#6d5b47;--ac:#c9a35a;--rd:#9b3b2c;color:#e9edf3;font-family:var(--sans);background:linear-gradient(#141d30,#0e1526);border-radius:16px;padding:16px 12px 14px}
.md h3{margin:0;font:700 clamp(22px,5vw,28px)/1.15 var(--display,var(--serif));color:var(--ac);text-align:center}
.md .md-p{margin:8px auto 12px;max-width:560px;font-size:13.5px;line-height:1.55;color:#b7c2cf;text-align:center}
.md-kinds{display:flex;gap:6px;overflow-x:auto;padding:0 0 10px;scrollbar-width:none}.md-kinds::-webkit-scrollbar{display:none}
.md-kinds button{flex:0 0 auto;display:flex;align-items:center;gap:6px;padding:5px 11px;border-radius:16px;border:1.5px solid #33425e;background:#162037;color:#d2d9e2;font:inherit;font-size:12.5px;cursor:pointer}
.md-kinds button i{width:9px;height:9px;border-radius:50%;background:var(--c)}.md-kinds button.on{border-color:var(--c);background:#223052;color:#fff}
.md-map{position:relative;border-radius:12px;overflow:hidden;box-shadow:0 6px 24px #0008;touch-action:none;user-select:none;-webkit-user-select:none}
.md-map svg{display:block;width:100%;height:auto}
.md-stars circle{fill:#fff;opacity:.35}
.md-lbl text{font-family:var(--sans);fill:#8ea0b8}.md-r{font-size:10px;font-style:italic;fill:#7fc4dc;letter-spacing:.06em}.md-lbl .r{font-size:11px;font-style:italic;fill:#7fd3e4;letter-spacing:.06em}.md-lbl .d{font-size:9.5px;letter-spacing:.18em;font-weight:700;fill:#5f7090}.md-lbl .s{font-size:8.5px;fill:#6f7f98}
.md-compass circle{fill:#0e1526;stroke:#33425e}.md-compass path{fill:var(--ac)}.md-compass text{font-size:9px;fill:var(--ac);text-anchor:middle;font-weight:700}
.md-pin{cursor:pointer;outline:none}.md-pin .md-halo{fill:var(--c);opacity:0;transition:opacity .2s}.md-pin .md-dot{fill:var(--c);stroke:#0e1526;stroke-width:2.2;transition:r .15s}
.md-pin .md-num{font:700 9.5px var(--sans);fill:#10172a;text-anchor:middle;pointer-events:none}
.md-pin .md-far{font:600 7.5px var(--sans);fill:#c7d0dc;text-anchor:middle;paint-order:stroke;stroke:#0e1526;stroke-width:3px}
.md-pin:hover .md-halo,.md-pin:focus .md-halo,.md-pin.hot .md-halo{opacity:.35}.md-pin.on .md-halo{opacity:.55;animation:mdPulse 1.8s ease-in-out infinite}
.md-pin.on .md-dot,.md-pin.hot .md-dot{r:10.5}.md-pin.dim{opacity:.22}
@keyframes mdPulse{50%{opacity:.18}}
.md-tip{position:absolute;z-index:3;pointer-events:none;transform:translate(-50%,calc(-100% - 16px));background:#f4ecdc;color:#2a2118;border-radius:10px;padding:6px 10px;box-shadow:0 6px 18px #000a;min-width:120px;max-width:220px;text-align:center;opacity:0;transition:opacity .12s}
.md-tip.on{opacity:1}.md-tip b{display:block;font:700 14px/1.2 var(--display,var(--serif))}.md-tip small{display:block;font-size:11.5px;color:#6d5b47;margin-top:2px}
.md-tip:after{content:"";position:absolute;left:50%;bottom:-6px;margin-left:-6px;border:6px solid transparent;border-bottom:0;border-top-color:#f4ecdc}
.md-hint{margin:8px 0 0;text-align:center;font-size:12px;color:#8ea0b8}
.md-box{scroll-margin-top:70px}
.md-card{margin-top:12px;border-radius:14px;background:var(--pp);color:var(--ink);overflow:hidden;box-shadow:0 8px 26px #0007;border-top:4px solid var(--c)}
.md-head{display:flex;align-items:center;gap:10px;padding:14px 14px 4px}.md-head b.n{flex:0 0 auto;width:30px;height:30px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#10172a;font:700 14px var(--sans)}
.md-head h4{margin:0;font:700 21px/1.15 var(--display,var(--serif))}.md-head small{display:block;font:12.5px var(--sans);color:var(--mu);margin-top:2px}
.md-sec{padding:6px 14px 4px}.md-sec>b{display:block;font:700 11.5px var(--sans);letter-spacing:.08em;text-transform:uppercase;color:var(--rd);margin:8px 0 8px}
.md-scene{display:grid;gap:8px;margin:0 0 12px;padding:0 0 12px;border-bottom:1px dashed #d9c9aa}.md-scene:last-child{border-bottom:0;margin-bottom:0}
.md-scene img{width:100%;border-radius:10px;display:block;aspect-ratio:3/2;object-fit:cover;background:#e6dcc6}
.md-scene .ch{font:600 12px var(--sans);color:var(--mu)}.md-scene .ch a{color:var(--rd);text-decoration:none}.md-scene .ch a:hover{text-decoration:underline}
.md-scene p{margin:0;font:15.5px/1.6 var(--serif)}
.md-lock{display:flex;gap:9px;align-items:center;padding:9px 11px;border-radius:9px;background:#e8dcc3;font:13px/1.4 var(--sans);color:var(--mu)}.md-lock span{font-size:17px}.md-lock a{margin-left:auto;color:var(--rd);font-weight:700;white-space:nowrap;text-decoration:none}
.md-real{margin:4px 14px 12px;padding:10px 12px;border-radius:10px;background:#fffaf0;border:1px solid #e3d5b8;font:14px/1.55 var(--sans);color:#3b3025}
.md-nav{display:flex;gap:8px;padding:0 14px 14px}.md-nav button{flex:1;padding:9px;border-radius:10px;border:1.5px solid #d9c9aa;background:#fffaf0;color:var(--ink);font:600 13px var(--sans);cursor:pointer}.md-nav button:hover{border-color:var(--rd);color:var(--rd)}
.md-list{list-style:none;margin:14px 0 0;padding:0;display:grid;grid-template-columns:1fr 1fr;gap:6px}
.md-list button{width:100%;display:flex;align-items:center;gap:8px;padding:8px 9px;border-radius:10px;border:1.5px solid #2b3958;background:#162037;color:#dfe5ec;font:inherit;font-size:13px;text-align:left;cursor:pointer}
.md-list button:hover,.md-list button.on{border-color:var(--c)}.md-list b{flex:0 0 auto;width:20px;height:20px;border-radius:50%;display:grid;place-items:center;background:var(--c);color:#10172a;font-size:11px}
.md-off{margin:14px 0 0}.md-off>p{margin:0 0 6px;font-size:12px;letter-spacing:.08em;text-transform:uppercase;color:#8ea0b8;font-weight:700}
.md-count{font-weight:400;color:#8ea0b8;font-size:11.5px;margin-left:auto}
@media (max-width:420px){.md-list{grid-template-columns:1fr}}
`;
  document.head.appendChild(s);
}

function map(el, o){
  css();
  const all = PLACES.concat(OFF), byId = id => all.find(p => p.id === id);
  const open = o.open || (() => true), chi = o.ch || (p => ({title:"Глава " + p, href:"#/" + o.slug + "/" + p}));
  const openN = p => p.scenes.filter(s => open(s.ch)).length;
  let kind = null, sel = null;
  const listBtn = (p, num) => `<li><button type="button" data-l="${p.id}" style="--c:${KIND[p.k].c}"><b>${num}</b><span>${esc(p.n)}</span><span class="md-count">${openN(p)}/${p.scenes.length}</span></button></li>`;
  el.innerHTML = `<div class="md"><h3>Мадрид «Второй половины»</h3>
    <p class="md-p">Мадрид, по которому Луис и Наталья идут за Карлом: от Барахаса до «Герники». Наведите курсор или проведите пальцем по карте: над каждой точкой появится её название. Нажмите — и откроются сцены романа и рассказ о месте в реальности. Сцены из глав, которые вы ещё не прочитали, остаются закрытыми.</p>
    <div class="md-kinds">${Object.entries(KIND).map(([k, v]) => `<button type="button" data-k="${k}" style="--c:${v.c}"><i></i>${esc(v.t)}</button>`).join("")}</div>
    <div class="md-map">${svg()}<div class="md-tip"><b></b><small></small></div></div>
    <p class="md-hint">☝️ Ведите пальцем по карте — точки отзываются сами</p>
    <div class="md-box"></div>
    <ol class="md-list">${PLACES.map((p, i) => listBtn(p, i + 1)).join("")}</ol>
    <div class="md-off"><p>Вне карты</p><ol class="md-list">${OFF.map(p => listBtn(p, "?")).join("")}</ol></div></div>`;
  const mapEl = el.querySelector(".md-map"), sv = el.querySelector("svg"), tip = el.querySelector(".md-tip"), box = el.querySelector(".md-box");
  const apply = () => {
    el.querySelectorAll("[data-k]").forEach(b => b.classList.toggle("on", b.dataset.k === kind));
    el.querySelectorAll(".md-pin").forEach(g => { const p = byId(g.dataset.p); g.classList.toggle("dim", !!kind && p.k !== kind); g.classList.toggle("on", g.dataset.p === sel); });
    el.querySelectorAll("[data-l]").forEach(b => { const p = byId(b.dataset.l); b.closest("li").style.opacity = kind && p.k !== kind ? .35 : 1; b.classList.toggle("on", b.dataset.l === sel); });
  };
  const pinXY = p => { const r = sv.getBoundingClientRect(), m = mapEl.getBoundingClientRect(); return {x: r.left - m.left + p.x / 400 * r.width, y: r.top - m.top + p.y / 470 * r.height}; };
  const hot = id => {
    el.querySelectorAll(".md-pin").forEach(g => g.classList.toggle("hot", g.dataset.p === id));
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
      return `<div class="md-scene">${s.img ? `<img src="${IMG}${esc(s.img)}" alt="" loading="lazy">` : ""}<span class="ch">📖 <a href="${esc(c.href)}">${esc(refTxt(s.ch))}</a></span><p>${esc(s.t)}</p></div>`; }).join("")
      + (shut.length ? `<div class="md-scene"><div class="md-lock"><span aria-hidden="true">🔒</span>${shut.length === 1 ? `Сцена из главы ${shut[0].ch} откроется, когда вы до неё дочитаете` : `Ещё ${shut.length} ${pl(shut.length)} из глав ${shut.map(s => s.ch).join(", ")} откроются по мере чтения`}<a href="${esc(chi(shut[0].ch).href)}">Читать →</a></div></div>` : "");
    box.innerHTML = `<div class="md-card" style="--c:${K.c}"><div class="md-head"><b class="n">${i >= 0 ? i + 1 : "?"}</b><div><h4>${esc(p.n)}</h4><small>${esc(K.t)} · ${esc(p.tag)}</small></div></div>
      <div class="md-sec"><b>📖 В романе</b>${scenes}</div>
      <div class="md-sec"><b>🌍 В реальности</b></div><div class="md-real">${esc(p.real)}</div>
      <div class="md-nav"><button type="button" data-go="${list[(j - 1 + list.length) % list.length].id}">← ${esc(list[(j - 1 + list.length) % list.length].n)}</button><button type="button" data-go="${list[(j + 1) % list.length].id}">${esc(list[(j + 1) % list.length].n)} →</button></div></div>`;
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
  el.querySelectorAll(".md-pin").forEach(g => g.onkeydown = e => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); show(g.dataset.p, true); } });
  el.querySelectorAll("[data-l]").forEach(b => b.onclick = () => show(b.dataset.l, true));
  el.querySelectorAll("[data-k]").forEach(b => b.onclick = () => { kind = kind === b.dataset.k ? null : b.dataset.k; apply(); });
}

window.LitmirMadrid = {map};
})();
