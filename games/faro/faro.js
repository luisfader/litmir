/* «Гонка к маяку» / «La Corsa del Faro» — аркадная мини-игра по главе 1 романа «Ti amo in silenzio» (IT) / «Тихая любовь» (RU).
   Лето 1997 года, Синея. Фабрицио стартует последним на дедушкином зелёном мотоцикле 1968 года,
   обгоняет соперников на прибрежной дороге (12 км поворотов) и в конце сражается с Лючией.
   На Чёртовом повороте ветер нанёс песок: Лючию заносит на полсекунды — и тогда надо дать газу.
   Псевдо-3D в духе старых аркадных автоматов; всё рисуется кодом.
   Подключается из index.html: window.LitmirFaro.mount(el, {slug, lang, sfx, onWin, next, back}); lang — "it" или "ru". */
(function(){
"use strict";
const W = 400, H = 600, HY = 250;                 // холст и линия горизонта
const SEG = 200, ROAD = 1300, CAM_H = 1000, DEPTH = 1 / Math.tan(50 * Math.PI / 180), DRAW = 170;
const PLAYER_Z = CAM_H * DEPTH, MAX = SEG * 60;   // максимальная скорость: сегмент за кадр
const CENT = .22, ACCEL = MAX / 5, BRAKE = -MAX * .9, DECEL = -MAX / 6, OFF_DECEL = -MAX / 1.6, OFF_LIMIT = MAX / 4;
const N_BIKES = 21, KM = 12;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const easeIn = (a, b, t) => a + (b - a) * t * t, easeInOut = (a, b, t) => a + (b - a) * (-Math.cos(t * Math.PI) / 2 + .5);
const rnd = (a, b) => a + Math.random() * (b - a);
const hsh = i => { const x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(c, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }

/* ───────── Тексты (ru — «Тихая любовь», it — «Ti amo in silenzio») ───────── */
const TX = {
  ru:{crowd:"Из толпы", fab:"Фабрицио", nonno:"Дед Этторе", bruno:"Бруно", luc:"Лючия", judge:"Судья",
    legs:["Порт · старт", "Третий поворот", "Пятый поворот", "Поворот у Сосны", "Спуск к Каменистому пляжу", "Последние три километра"],
    pine:"СОСНА", devilSign:"ЧЁРТОВ ПОВОРОТ", gate:"ФИНИШ · МАЯК",
    kick:"Игра по главе 1 · «Тихая любовь»", title:"Гонка к маяку", aria:"Игра «Гонка к маяку»",
    intro:"Лето девяносто седьмого. В порту Синеи больше тысячи зрителей, на старте — двадцать два мотоцикла. Японские, итальянские, новые и блестящие. И дедушкин — зелёный, шестьдесят восьмого года, с помятым бензобаком.",
    steps:[["Двенадцать километров", "От порта до старого маяка: с одной стороны море, с другой горы."], ["Лёгкий, как кошка", "На прямых тебя обгоняют, зато в поворотах старый мотоцикл ловчее всех. Перед крутыми поворотами чуть притормози."], ["Чёртов поворот", "Прямо под маяком ветер наносит песок. Держись внутренней стороны — и, когда придёт момент, дай газу!"]],
    quote:"«Не смотри туда, где боишься упасть. Смотри туда, куда хочешь ехать».", go:"На старт!",
    keys:"<kbd>←</kbd><kbd>→</kbd> — руль, <kbd>↓</kbd> — тормоз, <kbd>Пробел</kbd> — газ!", touch:"Кнопки под экраном: руль, тормоз и «Газ!»", best:"Лучшее время",
    left:"Влево", right:"Вправо", brake:"Тормоз", gasBtn:"Газ!",
    note:"Мотор сам держит газ — тебе остаются руль и тормоз. Кнопка «Газ!» загорится один раз, в самый нужный момент. Играть необязательно — роман можно читать и без игры.",
    s1:"Эй, пекарь! Ты из музея мотоцикл угнал?", s2:"Это мотоцикл моего деда…", s3:"Не смотри туда, где боишься упасть. Смотри туда, куда хочешь ехать.",
    gasSay:"И я дал газу!", cough:"Мотор закашлял… Ну и ладно — по крайней мере, меня никто не видит.", sing:"И тут мой старый мотоцикл проснулся. Мотор запел!",
    crash:["Встаёшь! И не ноешь!", "Когда падаешь — встаёшь. Без слёз!"], lucBump:"Не так близко, пекарь!",
    c1:"Кто это там на зелёном мотоцикле?", c2:"Это сын пекаря!", c3:"Пекаря? Давай, пекарь, давай!",
    seeL:"Красный мотоцикл. Красный шлем с белой звездой. Лючия.", last3:"Последние три километра были самыми длинными в моей жизни.",
    look:"Она на миг обернулась. Даже сквозь шлем я понял: она удивилась.", warn:"Чёртов поворот. Песок! Смотри туда, куда хочешь ехать…",
    j1:"Фотофиниш… Номер семнадцать! Фабрицио Орсини!", j2:"Номер семнадцать! Фабрицио Орсини!",
    win:"Победа!", wPhoto:"Колесо в колесо. Никто из зрителей не понял, кто победил. Судья посмотрел фотофиниш, поднял руку и крикнул:", wCrowd:"Толпа взорвалась. Судья поднял руку и крикнул:",
    shout:"«Номер семнадцать! Фабрицио Орсини!»", dialog:"— Ты кто такой? — спросила Лючия.<br>— Я пеку хлеб.",
    time:"Время", newRec:"новый рекорд", rec:"рекорд", again:"Ещё заезд", next:"Читать главу 2", back:"К роману", retry:"Ещё раз",
    place:n => `${n}-е место`, l2:"Красный мотоцикл пересёк финиш первым. Лючия сняла шлем и даже не посмотрела в твою сторону.", lN:"Двенадцать километров позади, но до маяка первыми добрались другие.",
    tipT:"Совет Бруно", tip2:"На Чёртовом повороте держись внутренней стороны, подальше от песка. Когда Лючию занесёт — жми «Газ!».", tipN:"В поворотах старый мотоцикл сильнее всех: обгоняй там. Перед самыми крутыми чуть притормози, чтобы не вылететь на обочину.",
    of:n => `место из ${n}`, kmh:"км/ч", km:"км", GAS:"ГАЗ!", flag:"Флаг!", flagUp:"Судья гонки поднимает флаг…", pause:"Пауза"},
  it:{crowd:"Dal pubblico", fab:"Fabrizio", nonno:"Nonno Ettore", bruno:"Bruno", luc:"Lucia", judge:"Il giudice",
    legs:["Porto · partenza", "Terza curva", "Quinta curva", "Curva del Pino", "Discesa verso la spiaggia dei Sassi", "Ultimi tre chilometri"],
    pine:"PINO", devilSign:"CURVA DEL DIAVOLO", gate:"TRAGUARDO · FARO",
    kick:"Gioco sul capitolo 1 · «Ti amo in silenzio»", title:"La Corsa del Faro", aria:"Gioco «La Corsa del Faro»",
    intro:"Estate del 1997. Al porto di Sinea ci sono più di mille persone, alla partenza ventidue moto. Giapponesi, italiane, nuove e lucide. E poi c'è quella del nonno: verde, del 1968, con il serbatoio ammaccato.",
    steps:[["Dodici chilometri", "Dal porto fino al vecchio faro: il mare da una parte, la montagna dall'altra."], ["Agile come un gatto", "Sui rettilinei gli altri ti superano, ma nelle curve la vecchia moto è la più agile. Prima delle curve più strette, frena un po'."], ["La curva del Diavolo", "Proprio sotto il faro il vento porta la sabbia. Resta all'interno della curva e, al momento giusto, dai gas!"]],
    quote:"«Non devi guardare dove hai paura di cadere. Devi guardare dove vuoi andare.»", go:"Alla partenza!",
    keys:"<kbd>←</kbd><kbd>→</kbd> — sterzo, <kbd>↓</kbd> — freno, <kbd>Spazio</kbd> — gas!", touch:"Pulsanti sotto lo schermo: sterzo, freno e «Gas!»", best:"Miglior tempo",
    left:"Sinistra", right:"Destra", brake:"Freno", gasBtn:"Gas!",
    note:"Il motore accelera da solo: tu pensi allo sterzo e al freno. Il pulsante «Gas!» si accende una volta sola, nel momento giusto. Il gioco è facoltativo: puoi leggere il romanzo anche senza giocare.",
    s1:"Ehi, panettiere! Hai preso la moto da un museo?", s2:"È la moto di mio nonno…", s3:"Fabrizio, in moto non devi guardare dove hai paura di cadere. Devi guardare dove vuoi andare.",
    gasSay:"E ho dato gas!", cough:"La moto ha tossito… Bene, almeno nessuno mi vede.", sing:"Poi la mia vecchia moto si è svegliata. Il motore ha cominciato a cantare!",
    crash:["Ti rialzi! Senza piangere!", "Quando cadi, ti rialzi. Senza piangere!"], lucBump:"Non così vicino, panettiere!",
    c1:"Chi è quello con la moto verde?", c2:"È il figlio del panettiere!", c3:"Il panettiere? Vai, panettiere, vai!",
    seeL:"La moto rossa. Il casco rosso con la stella bianca. Lucia.", last3:"Gli ultimi tre chilometri sono stati i più lunghi della mia vita.",
    look:"Si è girata un attimo. Anche con il casco, ho capito che era sorpresa.", warn:"La curva del Diavolo. Sabbia! Guarda dove vuoi andare…",
    j1:"Fotofinish… Numero diciassette! Fabrizio Orsini!", j2:"Numero diciassette! Fabrizio Orsini!",
    win:"Vittoria!", wPhoto:"Ruota contro ruota. Nessuno, tra il pubblico, ha capito chi aveva vinto. Il giudice ha guardato la fotografia, ha alzato la mano e ha gridato:", wCrowd:"Il pubblico è esploso. Il giudice ha alzato la mano e ha gridato:",
    shout:"«Numero diciassette! Fabrizio Orsini!»", dialog:"«Chi sei tu?» ha chiesto Lucia.<br>«Faccio il pane.»",
    time:"Tempo", newRec:"nuovo record", rec:"record", again:"Un'altra gara", next:"Leggi il capitolo 2", back:"Torna al romanzo", retry:"Riprova",
    place:n => `${n}° posto`, l2:"La moto rossa ha tagliato il traguardo per prima. Lucia si è tolta il casco e non ti ha neanche guardato.", lN:"Dodici chilometri, ma al faro sono arrivati prima gli altri.",
    tipT:"Il consiglio di Bruno", tip2:"Nella curva del Diavolo resta all'interno, lontano dalla sabbia. Quando Lucia slitta, premi «Gas!».", tipN:"Nelle curve la vecchia moto è la più forte: supera lì. Prima delle curve più strette frena un po', così non esci di strada.",
    of:n => `posto su ${n}`, kmh:"km/h", km:"km", GAS:"GAS!", flag:"Via!", flagUp:"Il giudice di gara alza la bandiera…", pause:"Pausa"}
};
const LEG_AT = [0, .10, .19, .29, .40, .70];
const RIVAL_COL = ["#2f6fd6", "#f2c230", "#e8e6e0", "#1d1f24", "#ee7a2b", "#9aa3ad", "#7c4fc2", "#16a39a", "#c23b6b", "#3c4c9e", "#d9d2b6",
  "#5c6b2e", "#b83c2c", "#2b8fd9", "#f0f0f0", "#7d5a3a", "#5a5f69", "#d8a020", "#4a2f6a", "#1f6b4a", "#c9c3b5"];

/* ───────── Звук ───────── */
function makeSound(on){
  let ctx = null, eng = null;
  const ac = () => (ctx = ctx || new (window.AudioContext || window.webkitAudioContext)());
  const tone = (f, t0, d, type, g, f2) => { if (!on()) return; try { const c = ac(), s = c.currentTime + t0, o = c.createOscillator(), v = c.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d); v.gain.setValueAtTime(0, s); v.gain.linearRampToValueAtTime(g || .06, s + .01); v.gain.exponentialRampToValueAtTime(.0001, s + d); o.connect(v).connect(c.destination); o.start(s); o.stop(s + d + .05); } catch(e) {} };
  return {
    engine(p, cough){                            // непрерывный рокот мотора, частота растёт со скоростью
      if (!on()) { this.stop(); return; }
      try {
        const c = ac();
        if (!eng) { const o = c.createOscillator(), f = c.createBiquadFilter(), v = c.createGain(); o.type = "sawtooth"; f.type = "lowpass"; f.frequency.value = 600; v.gain.value = 0; o.connect(f).connect(v).connect(c.destination); o.start(); eng = {o, v}; }
        const g = cough ? (Math.random() < .35 ? 0 : .03) : .028;
        eng.o.frequency.setTargetAtTime(48 + p * 150 + (cough ? rnd(-15, 15) : 0), c.currentTime, .06);
        eng.v.gain.setTargetAtTime(g, c.currentTime, .05);
      } catch(e) {}
    },
    stop(){ if (!eng) return; try { eng.v.gain.setTargetAtTime(0, ctx.currentTime, .05); const o = eng.o; setTimeout(() => { try { o.stop(); } catch(e) {} }, 300); } catch(e) {} eng = null; },
    beep(hi){ tone(hi ? 1046 : 523, 0, hi ? .5 : .22, "square", .05); },
    pass(){ tone(660, 0, .1, "triangle", .05); tone(990, .07, .14, "triangle", .04); },
    bump(){ tone(150, 0, .22, "sawtooth", .07, 60); },
    crash(){ tone(220, 0, .5, "sawtooth", .08, 40); tone(90, .05, .4, "square", .05, 30); },
    skid(){ tone(1800, 0, .45, "sawtooth", .025, 900); },
    boost(){ tone(220, 0, .6, "sawtooth", .06, 660); },
    win(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .1, .35, "triangle", .06)); },
    lose(){ [392, 330, 262].forEach((f, i) => tone(f, i * .16, .3, "triangle", .05)); }
  };
}

/* ───────── Трасса ───────── */
function buildTrack(){
  const segs = [], marks = {};
  const lastY = () => segs.length ? segs[segs.length - 1].p2.world.y : 0;
  function add(curve, y){
    const i = segs.length;
    segs.push({index:i, curve, sprites:[], bikes:[], sand:null, clip:0,
      p1:{world:{y:lastY(), z:i * SEG}, camera:{}, screen:{}}, p2:{world:{y, z:(i + 1) * SEG}, camera:{}, screen:{}},
      dark:Math.floor(i / 3) % 2});
  }
  function road(enter, hold, leave, curve, hill){
    hold = Math.round(hold * 1.25);
    const y0 = lastY(), y1 = y0 + (hill || 0) * SEG, tot = enter + hold + leave;
    for (let n = 0; n < enter; n++) add(easeIn(0, curve, n / enter), easeInOut(y0, y1, n / tot));
    for (let n = 0; n < hold; n++) add(curve, easeInOut(y0, y1, (enter + n) / tot));
    for (let n = 0; n < leave; n++) add(easeInOut(curve, 0, n / leave), easeInOut(y0, y1, (enter + hold + n) / tot));
  }
  const mark = k => { marks[k] = segs.length; };
  const S = (n, hill) => road(10, n, 10, 0, hill);
  mark("start"); S(70, 0);
  road(30, 60, 30, 2, 8); S(30, 0); road(30, 50, 30, -3, 14);
  mark("c3"); road(30, 70, 30, 4, 0); S(50, -6);
  road(25, 60, 25, -4, -10); mark("c5"); road(25, 60, 25, 5, 4); S(80, 24);
  mark("pino"); road(30, 90, 30, -6, 10); S(40, 0);
  road(20, 50, 20, 3, -16); mark("discesa"); S(60, -40); road(30, 60, 30, -4, -30); road(25, 50, 25, 3, -10);
  mark("spiaggia"); S(110, 0);
  road(25, 50, 25, 4, 20); road(25, 50, 25, -5, 26); S(70, 0); road(30, 60, 30, 3, 0); road(30, 60, 30, -3, -10); S(90, 18);
  mark("final"); road(20, 40, 20, 4, 0); road(20, 40, 20, -4, 8); road(20, 40, 20, 5, -8); S(50, 0); road(20, 50, 20, -5, 10); S(60, 0);
  mark("devilWarn"); S(30, 6);
  mark("devil"); road(14, 37, 0, 6.5, 0); mark("devilExit"); road(0, 0, 18, 6.5, 0); mark("devilOut");
  S(40, 0); mark("finish"); S(DRAW + 120, 0);
  /* песок, нанесённый ветром: внешняя часть поворота, на выходе — почти вся дорога */
  for (let i = marks.devil + 8; i < marks.devilExit; i++) if (hsh(i) < .6) segs[i].sand = [-1, -.3 + .3 * hsh(i + 5)];
  for (let i = marks.devilExit; i < marks.devilOut + 6; i++) segs[i].sand = [-1, .42];
  return {segs, marks};
}
function decorate(T, X){
  const {segs, marks} = T, L = segs.length;
  const put = (i, kind, x, extra) => { if (i >= 0 && i < L) segs[i].sprites.push(Object.assign({kind, x}, extra || {})); };
  for (let i = 0; i < marks.finish + 60; i++) {
    const h = hsh(i), h2 = hsh(i + 999);
    if (i % 4 === 0) put(i, "post", -1.14);                                   // каменный парапет над морем
    if (i % 9 === 0 && h < .7) put(i, h < .35 ? "pine" : "cypress", 1.35 + h2 * 1.4);
    if (i % 13 === 5 && h2 < .5) put(i, "rock", 1.25 + h * .6);
  }
  const crowd = (a, b, side, every) => { for (let i = a; i < b; i += every) put(i, "crowd", side * (1.32 + hsh(i) * .25), {seed:i}); };
  crowd(0, marks.start + 70, 1, 3); crowd(4, marks.start + 70, -1, 4);
  crowd(marks.spiaggia, marks.spiaggia + 100, 1, 6); crowd(marks.final - 30, marks.final + 20, -1, 5);
  crowd(marks.devilOut, marks.finish + 10, 1, 3); crowd(marks.devilOut + 4, marks.finish + 10, -1, 3);
  put(marks.start + 3, "flagman", -1.3);
  [["c3", "3"], ["c5", "5"]].forEach(([k, t]) => put(marks[k] - 25, "sign", 1.3, {txt:t}));
  put(marks.pino + 45, "bigpine", -1.6); put(marks.pino - 20, "sign", 1.3, {txt:X.pine});
  put(marks.discesa - 10, "sign", 1.3, {txt:"⬇ 12%"});
  put(marks.devilWarn, "sign", 1.3, {txt:X.devilSign, wide:true});
  for (let i = marks.devil; i < marks.devilOut; i += 5) put(i, "chevron", -1.3);
  put(marks.finish + 14, "lighthouse", 2.6);
  put(marks.finish, "gate", 0);
}

/* ───────── Рисунки ───────── */
function bikeSprite(c, x, y, w, o){                       // мотоцикл сзади: x,y — точка на земле
  const h = w * 1.55;
  c.save(); c.translate(x, y); c.rotate(o.lean || 0);
  c.fillStyle = "rgba(0,0,0,.28)"; c.beginPath(); c.ellipse(0, 0, w * .48, w * .09, 0, 0, Math.PI * 2); c.fill();
  c.fillStyle = "#16171a"; rr(c, -w * .11, -h * .36, w * .22, h * .36, w * .08); c.fill();                // заднее колесо
  c.fillStyle = "#2a2c31"; rr(c, -w * .07, -h * .34, w * .14, h * .3, w * .05); c.fill();
  c.fillStyle = o.body; rr(c, -w * .3, -h * .5, w * .6, h * .2, w * .07); c.fill();                     // бак и обтекатель
  c.fillStyle = "rgba(255,255,255,.18)"; rr(c, -w * .26, -h * .5, w * .52, h * .05, w * .03); c.fill();
  c.fillStyle = o.old ? "#3b2a1c" : "#222"; rr(c, -w * .2, -h * .44, w * .4, h * .06, w * .03); c.fill(); // сиденье
  c.fillStyle = "#ff3a2a"; rr(c, -w * .09, -h * .34, w * .18, h * .045, 2); c.fill();                  // стоп-сигнал
  if (o.brake) { c.fillStyle = "rgba(255,60,40,.5)"; c.beginPath(); c.arc(0, -h * .32, w * .2, 0, Math.PI * 2); c.fill(); }
  c.fillStyle = o.suit; c.beginPath(); c.moveTo(-w * .3, -h * .45); c.lineTo(w * .3, -h * .45); c.lineTo(w * .22, -h * .78); c.lineTo(-w * .22, -h * .78); c.closePath(); c.fill(); // спина
  c.strokeStyle = o.suit; c.lineWidth = w * .1; c.lineCap = "round";
  c.beginPath(); c.moveTo(-w * .2, -h * .72); c.lineTo(-w * .44, -h * .56); c.moveTo(w * .2, -h * .72); c.lineTo(w * .44, -h * .56); c.stroke(); // руки к рулю
  c.fillStyle = "#111"; c.fillRect(-w * .5, -h * .58, w * .12, h * .04); c.fillRect(w * .38, -h * .58, w * .12, h * .04);
  if (o.hair) { c.fillStyle = "#2a1a12"; c.beginPath(); c.moveTo(-w * .14, -h * .82); c.quadraticCurveTo(-w * .32, -h * .6, -w * .18, -h * .5); c.lineTo(w * .18, -h * .5); c.quadraticCurveTo(w * .32, -h * .62, w * .14, -h * .82); c.fill(); }
  c.fillStyle = o.helmet; c.beginPath(); c.arc(0, -h * .86, w * .17, 0, Math.PI * 2); c.fill();          // шлем
  c.fillStyle = "rgba(255,255,255,.25)"; c.beginPath(); c.arc(-w * .05, -h * .9, w * .06, 0, Math.PI * 2); c.fill();
  if (o.star) star(c, 0, -h * .9, w * .08, "#fff");
  if (o.num) { c.fillStyle = "#fff"; rr(c, -w * .13, -h * .7, w * .26, h * .1, 2); c.fill(); c.fillStyle = "#111"; c.font = `700 ${Math.max(6, w * .13)}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(o.num, 0, -h * .65); }
  c.restore();
}
function star(c, x, y, r, col){ c.fillStyle = col; c.beginPath(); for (let i = 0; i < 10; i++) { const a = -Math.PI / 2 + i * Math.PI / 5, q = i % 2 ? r * .45 : r; c.lineTo(x + Math.cos(a) * q, y + Math.sin(a) * q); } c.closePath(); c.fill(); }
function drawSprite(c, s, x, y, k){                        // k — пикселей на единицу полуширины дороги
  const u = k * .12;
  switch (s.kind) {
    case "post": c.fillStyle = "#cbbd9c"; c.fillRect(x - u * .9, y - u * 2.2, u * 1.8, u * 2.2); c.fillStyle = "#a89a7a"; c.fillRect(x - u * .9, y - u * 2.2, u * 1.8, u * .4); break;
    case "pine": c.fillStyle = "#6b4a2c"; c.fillRect(x - u * .5, y - u * 9, u, u * 9);
      c.fillStyle = "#2f5a2a"; c.beginPath(); c.ellipse(x, y - u * 9.5, u * 5, u * 2, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#3f7a34"; c.beginPath(); c.ellipse(x - u, y - u * 10.2, u * 3.5, u * 1.3, 0, 0, Math.PI * 2); c.fill(); break;
    case "bigpine": c.fillStyle = "#5a3c22"; c.beginPath(); c.moveTo(x - u, y); c.lineTo(x + u, y); c.lineTo(x + u * 3, y - u * 16); c.lineTo(x + u * 1.6, y - u * 16); c.closePath(); c.fill();
      c.fillStyle = "#2a5226"; c.beginPath(); c.ellipse(x + u * 3, y - u * 17, u * 9, u * 3.2, -.1, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#3c7432"; c.beginPath(); c.ellipse(x + u * 1.5, y - u * 18.2, u * 6, u * 2, -.1, 0, Math.PI * 2); c.fill(); break;
    case "cypress": c.fillStyle = "#24452a"; c.beginPath(); c.ellipse(x, y - u * 6, u * 1.6, u * 6, 0, 0, Math.PI * 2); c.fill();
      c.fillStyle = "#2f5a36"; c.beginPath(); c.ellipse(x - u * .4, y - u * 6.5, u * .8, u * 5, 0, 0, Math.PI * 2); c.fill(); break;
    case "rock": c.fillStyle = "#9b8f7f"; c.beginPath(); c.moveTo(x - u * 3, y); c.lineTo(x - u * 2, y - u * 2.4); c.lineTo(x, y - u * 3); c.lineTo(x + u * 2.6, y - u * 1.6); c.lineTo(x + u * 3, y); c.closePath(); c.fill();
      c.fillStyle = "#b8ad9c"; c.beginPath(); c.moveTo(x - u * 2, y - u * 2.4); c.lineTo(x, y - u * 3); c.lineTo(x + u * .4, y - u * 1.6); c.closePath(); c.fill(); break;
    case "bush": c.fillStyle = "#c2508a"; c.beginPath(); c.arc(x, y - u * 1.2, u * 1.6, 0, Math.PI * 2); c.fill(); c.fillStyle = "#3f6a30"; c.beginPath(); c.arc(x + u, y - u * .8, u * 1.2, 0, Math.PI * 2); c.fill(); break;
    case "crowd": for (let j = 0; j < 5; j++) { const hj = hsh(s.seed * 7 + j), px = x + (j - 2) * u * 1.4, ph = u * (2.6 + hj * .8);
        c.fillStyle = ["#d04a3c", "#2f6fd6", "#f2c230", "#3a9a5a", "#eee", "#7c4fc2"][Math.floor(hj * 6)]; c.fillRect(px - u * .5, y - ph, u, ph);
        c.fillStyle = "#e8b48a"; c.beginPath(); c.arc(px, y - ph - u * .45, u * .45, 0, Math.PI * 2); c.fill();
        if (j === 2 && hj < .5) { c.strokeStyle = "#555"; c.lineWidth = Math.max(1, u * .15); c.beginPath(); c.moveTo(px + u * .5, y - ph); c.lineTo(px + u * .5, y - ph - u * 2.5); c.stroke(); c.fillStyle = hj < .25 ? "#1f9a4a" : "#d33"; c.fillRect(px + u * .5, y - ph - u * 2.5, u * 1.6, u); } } break;
    case "flagman": c.fillStyle = "#222"; c.fillRect(x - u * .5, y - u * 3, u, u * 3); c.fillStyle = "#e8b48a"; c.beginPath(); c.arc(x, y - u * 3.4, u * .5, 0, Math.PI * 2); c.fill(); break;
    case "sign": { const w2 = s.wide ? u * 9 : u * 3.4; c.fillStyle = "#555"; c.fillRect(x - u * .2, y - u * 4, u * .4, u * 4);
      c.fillStyle = s.wide ? "#ffd23a" : "#f4f1ea"; rr(c, x - w2 / 2, y - u * 6.4, w2, u * 2.6, u * .3); c.fill(); c.strokeStyle = s.wide ? "#111" : "#c22"; c.lineWidth = Math.max(1, u * .3); c.stroke();
      c.fillStyle = "#111"; c.font = `800 ${Math.max(5, u * (s.wide ? 1.2 : 1.6))}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(s.txt, x, y - u * 5.05); break; }
    case "chevron": c.fillStyle = "#ffd23a"; c.fillRect(x - u * 1.5, y - u * 3.6, u * 3, u * 2); c.fillStyle = "#111"; c.beginPath(); c.moveTo(x - u * .9, y - u * 3.4); c.lineTo(x + u * .5, y - u * 2.6); c.lineTo(x - u * .9, y - u * 1.8); c.lineTo(x - u * .3, y - u * 2.6); c.closePath(); c.fill();
      c.fillStyle = "#555"; c.fillRect(x - u * .15, y - u * 1.6, u * .3, u * 1.6); break;
    case "lighthouse": c.fillStyle = "#e9e4d8"; c.beginPath(); c.moveTo(x - u * 3, y); c.lineTo(x + u * 3, y); c.lineTo(x + u * 2, y - u * 26); c.lineTo(x - u * 2, y - u * 26); c.closePath(); c.fill();
      c.fillStyle = "#c23b2c"; [8, 16].forEach(t => c.fillRect(x - u * (3 - t / 13), y - u * (t + 2.5), u * (6 - t / 6.5), u * 2.5));
      c.fillStyle = "#333"; c.fillRect(x - u * 2.6, y - u * 27, u * 5.2, u * 1.2); c.fillStyle = "#ffe9a0"; c.fillRect(x - u * 1.6, y - u * 30, u * 3.2, u * 3);
      c.fillStyle = "#c23b2c"; c.beginPath(); c.moveTo(x - u * 2.2, y - u * 30); c.lineTo(x, y - u * 33); c.lineTo(x + u * 2.2, y - u * 30); c.fill(); break;
  }
}
function drawGate(c, x, y, half, txt){                        // финишная арка с клетчатым флагом
  const u = half * .12, top = y - u * 15, pl = x - half * 1.15, pr = x + half * 1.15;
  c.fillStyle = "#e8e4da"; c.fillRect(pl - u * .5, top, u, y - top); c.fillRect(pr - u * .5, top, u, y - top);
  const bw = pr - pl, cells = 16, cw = bw / cells, ch2 = u * 1.3;
  for (let r = 0; r < 2; r++) for (let i = 0; i < cells; i++) { c.fillStyle = (i + r) % 2 ? "#111" : "#fafafa"; c.fillRect(pl + i * cw, top + r * ch2, cw + .5, ch2 + .5); }
  c.fillStyle = "#c23b2c"; c.fillRect(pl, top + ch2 * 2, bw, u * 1.4);
  c.fillStyle = "#fff"; c.font = `800 ${Math.max(6, u * 1.1)}px system-ui, sans-serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.fillText(txt, x, top + ch2 * 2 + u * .72);
}

/* ───────── Игра ───────── */
function mount(el, opt){
  opt = opt || {};
  const L = TX[opt.lang] || TX.ru, CROWD = L.crowd, FAB = L.fab, NONNO = L.nonno, BRUNO = L.bruno, LUC = L.luc;
  const LEGS = L.legs.map((txt, i) => ({at:LEG_AT[i], txt}));
  const snd = makeSound(() => !opt.sfx || opt.sfx.on());
  const bestKey = "faro:best:" + (opt.slug || "tikhaya-lyubov");
  let best = 0; try { best = +localStorage.getItem(bestKey) || 0; } catch(e) {}
  el.innerHTML = `
  <div class="mt fr" lang="${opt.lang || "ru"}">
    <div class="mt-head"><div class="mt-kick">${L.kick}</div><h1>${L.title}</h1></div>
    <div class="mt-stage">
      <canvas class="mt-cv" aria-label="${L.aria}"></canvas>
      <div class="mt-ov fr-start">
        <div class="mt-big">${L.title}</div>
        <p>${L.intro}</p>
        <ul class="mt-steps">${L.steps.map(([b, t]) => `<li><b>${b}</b><br>${t}</li>`).join("")}</ul>
        <p class="mt-q">${L.quote}</p>
        <div class="mt-row"><button class="mt-btn" data-act="go">${L.go}</button></div>
        <div class="mt-keys"><span>${L.keys}</span><span class="mt-touch">${L.touch}</span></div>
        ${best ? `<div class="mt-keys">${L.best}: ${fmt(best)}</div>` : ""}
      </div>
      <div class="mt-ov fr-end" hidden></div>
    </div>
    <div class="fr-pad">
      <button class="fr-b" data-k="l" type="button" aria-label="${L.left}">◀</button>
      <button class="fr-b fr-br" data-k="d" type="button">${L.brake}</button>
      <button class="fr-b fr-gas" data-k="g" type="button" disabled>${L.gasBtn}</button>
      <button class="fr-b" data-k="r" type="button" aria-label="${L.right}">▶</button>
    </div>
    <p class="mt-note">${L.note}</p>
  </div>`;
  const root = el.querySelector(".mt"), stage = root.querySelector(".mt-stage"), cv = root.querySelector("canvas"), c = cv.getContext("2d");
  const ovStart = root.querySelector(".fr-start"), ovEnd = root.querySelector(".fr-end"), gasBtn = root.querySelector(".fr-gas");
  let k = 1, dpr = 1;
  function size(){
    const avail = Math.min(root.clientWidth || 360, 440);
    let cw = avail, ch = cw * H / W;
    const maxH = Math.max(420, (window.innerHeight || 800) - 230);
    if (ch > maxH) { ch = maxH; cw = ch * W / H; }
    stage.style.width = cw + "px"; stage.style.height = ch + "px";
    dpr = Math.min(2, window.devicePixelRatio || 1); k = cw / W;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  }
  size(); window.addEventListener("resize", size);

  const T = buildTrack(); decorate(T, L);
  const segs = T.segs, M = T.marks, LEN = segs.length * SEG;
  const finishZ = M.finish * SEG, raceLen = finishZ - PLAYER_Z;
  const seg = z => segs[clamp(Math.floor(z / SEG), 0, segs.length - 1)];
  const keys = {l:false, r:false, d:false};
  let S = null, mode = "ready", tPrev = 0, acc = 0, raf = 0;

  function fresh(){
    segs.forEach(s => { s.bikes.length = 0; });
    const bikes = [];
    for (let i = 0; i < N_BIKES; i++) {                       // стартовая решётка: по двое в ряд, Фабрицио последний
      const row = Math.floor(i / 2), lucia = i === 0;
      const b = {z:PLAYER_Z + (11 - row) * SEG * 3.2, x:(i % 2 ? .45 : -.45), speed:0, lucia,
        top:lucia ? .955 : rnd(.84, 1.03), grip:lucia ? .028 : rnd(.05, .085), react:rnd(.3, 1.4) + (lucia ? -.2 : row * .08),
        body:lucia ? "#c8221c" : RIVAL_COL[i], suit:lucia ? "#2a1a14" : ["#222", "#3a3f4a", "#5a2a20", "#1c2e4a"][i % 4],
        helmet:lucia ? "#d62a20" : ["#f4f4f4", "#111", "#2f6fd6", "#f2c230", "#c23b6b"][i % 5], star:lucia, hair:lucia,
        num:lucia ? "1" : String(i + 2 === 17 ? 23 : i + 2), skid:0, skidDone:false, fin:0, id:i};
      bikes.push(b);
    }
    S = {t:0, pos:0, x:0, speed:0, bikes, place:N_BIKES + 1, prevPlace:N_BIKES + 1, msg:null, q:[], leg:0, shake:0, lean:0,
      crash:0, sand:0, boost:0, gas:"off", fin:0, finT:0, done:false, lookBack:false, crowdLine:0, sung:false, flash:0, cd:3.2, photo:false};
    bikes.forEach(b => seg(b.z).bikes.push(b));
    say(CROWD, L.s1); say(FAB, L.s2); say(NONNO, L.s3);
    setGas("off");
  }
  function say(who, text){ const it = {who, text, t:Math.min(4.2, 1.4 + text.length * .04)}; if (!S.msg) S.msg = it; else if (S.q.length < 3) S.q.push(it); }
  function setGas(st){ S.gas = st; gasBtn.disabled = st !== "ready"; gasBtn.classList.toggle("ready", st === "ready"); }
  function fmt(t){ const m = Math.floor(t / 60), s = t - m * 60; return `${m}:${s < 10 ? "0" : ""}${s.toFixed(2)}`; }

  /* ── управление ── */
  const kmap = {ArrowLeft:"l", KeyA:"l", ArrowRight:"r", KeyD:"r", ArrowDown:"d", KeyS:"d"};
  function kd(e){ if (!cv.isConnected) return cleanup(); const kk = kmap[e.code]; if (kk) { keys[kk] = true; e.preventDefault(); } if ((e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW") && mode === "run") { gas(); e.preventDefault(); } }
  function ku(e){ const kk = kmap[e.code]; if (kk) keys[kk] = false; }
  window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
  root.querySelectorAll(".fr-b").forEach(b => {
    const kk = b.dataset.k;
    const on = e => { e.preventDefault(); if (kk === "g") { gas(); return; } keys[kk] = true; b.classList.add("on"); };
    const off = () => { if (kk !== "g") { keys[kk] = false; b.classList.remove("on"); } };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointerleave", off); b.addEventListener("pointercancel", off);
    b.addEventListener("contextmenu", e => e.preventDefault());
  });
  function gas(){ if (S && S.gas === "ready") { S.boost = 1.6; setGas("used"); snd.boost(); say(FAB, L.gasSay); } }
  function vis(){ if (document.hidden && mode === "run") { mode = "pause"; snd.stop(); } else if (!document.hidden && mode === "pause") { mode = "run"; tPrev = performance.now(); } }
  document.addEventListener("visibilitychange", vis);
  function cleanup(){ cancelAnimationFrame(raf); snd.stop(); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("resize", size); document.removeEventListener("visibilitychange", vis); }

  root.addEventListener("click", e => {
    const a = e.target.closest("[data-act]"); if (!a) return;
    const act = a.dataset.act;
    if (act === "go") { ovStart.hidden = true; ovEnd.hidden = true; fresh(); mode = "count"; tPrev = performance.now(); }
    else if (act === "back" && opt.back) { cleanup(); opt.back(); }
  });

  /* ── обновление ── */
  function updateBikes(dt){
    const pz = S.pos + PLAYER_Z, final = pz > M.final * SEG;
    S.bikes.forEach(b => {
      if (S.t < b.react) return;
      const old = seg(b.z), cur = old.curve, ac = Math.abs(cur);
      let target = MAX * b.top * (1 - ac * b.grip);
      if (b.lucia) {
        const lead = b.z - pz;
        if (!final && lead < SEG * 6) target *= 1.07;                          // чемпионка не любит, когда её догоняют
        else if (!final && lead > SEG * 90) target *= .9;
        else if (final && lead > SEG * 16) target *= .9;
        else if (final && lead < SEG * 3 && b.z < M.devil * SEG) target *= 1.08;      // в последних километрах борется до конца
        if (b.z > M.devilExit * SEG && !b.skidDone) { b.skidDone = true; b.skid = .55; if (pz > b.z - SEG * 30) { snd.skid(); say(LUC, "…!"); S.flash = .4; if (S.gas === "off") setGas("ready"); } }
        if (b.skid > 0) { b.skid -= dt; target = MAX * .42; b.x = clamp(b.x - dt * .9, -.95, .95); }
        let tx = ac > .5 ? Math.sign(cur) * .45 : 0;                           // идеальная траектория — по внутренней стороне
        if (final && lead > 0 && lead < SEG * 9 && b.skid <= 0 && b.z < M.devil * SEG) tx = clamp(S.x, -.75, .75);  // закрывает дорогу
        if (b.skid <= 0) b.x += clamp(tx - b.x, -dt * .9, dt * .9);
      } else {
        const tx = ac > .5 ? Math.sign(cur) * (.25 + (b.id % 3) * .15) : (b.id % 2 ? .4 : -.4);
        b.x += clamp(tx - b.x, -dt * .4, dt * .4);
        if (old.sand && b.x < old.sand[1]) target *= .7;
      }
      if (b.fin) target = MAX * .3;
      b.speed += clamp(target - b.speed, -MAX * 1.2 * dt, MAX * .22 * dt);
      b.z += b.speed * dt;
      if (!b.fin && b.z >= finishZ) b.fin = S.t;
      const nw = seg(b.z);
      if (nw !== old) { const i = old.bikes.indexOf(b); if (i >= 0) old.bikes.splice(i, 1); nw.bikes.push(b); }
    });
  }
  function update(dt){
    S.t += dt;
    if (S.msg && (S.msg.t -= dt) <= 0) S.msg = S.q.shift() || null;
    if (S.flash > 0) S.flash -= dt; if (S.shake > 0) S.shake -= dt; if (S.crash > 0) S.crash -= dt;
    const pz = S.pos + PLAYER_Z, ps = seg(pz), sp = S.speed / MAX, dx = dt * 2 * sp;
    /* старт: мотор кашляет, потом просыпается */
    const cough = S.t < 2.6, warm = pz < PLAYER_Z + raceLen / 12;
    let cap = MAX * (cough ? .28 : warm ? .82 : 1) * (S.boost > 0 ? 1.18 : 1);
    if (!S.sung && !cough && S.t > 2.6) { S.sung = true; say(FAB, L.cough); }
    if (S.sung === true && !warm && !S.done) { S.sung = 2; say(FAB, L.sing); }
    if (S.boost > 0) S.boost -= dt;
    /* песок */
    const onSand = ps.sand && S.x > ps.sand[0] - .05 && S.x < ps.sand[1];
    if (onSand) { if (S.sand <= 0) { snd.skid(); S.shake = .5; } S.sand = .25; }
    else if (S.sand > 0) S.sand -= dt;
    const grip = S.sand > 0 ? .6 : 1;
    if (S.crash <= 0 && !S.done) { if (keys.l) S.x -= dx * grip; if (keys.r) S.x += dx * grip; }
    S.x -= dx * sp * ps.curve * CENT * (S.sand > 0 ? 1.2 : 1);
    if (S.sand > 0) { S.x += rnd(-1, 1) * dt * .8; cap = Math.min(cap, MAX * .6); }
    S.lean = lerp(S.lean, ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * .32 * sp + ps.curve * .03 * sp, .15);
    /* скорость */
    if (S.done) S.speed += DECEL * 1.5 * dt;
    else if (S.crash > 0) S.speed += BRAKE * .5 * dt;
    else if (keys.d) S.speed += BRAKE * dt;
    else if (S.speed < cap) S.speed += ACCEL * (S.boost > 0 ? 2 : 1) * dt;
    else S.speed += DECEL * dt;
    if (S.speed > cap && !keys.d) S.speed = Math.max(cap, S.speed + DECEL * 2 * dt);
    /* обочина и препятствия */
    if (Math.abs(S.x) > 1) {
      if (S.speed > OFF_LIMIT) S.speed += OFF_DECEL * dt;
      for (const s of ps.sprites) {
        if (s.kind === "gate" || s.kind === "post" || s.kind === "bush" || s.kind === "chevron") continue;
        if (Math.abs(S.x - s.x) < (s.kind === "lighthouse" ? .5 : .22) && S.crash <= 0) {
          S.speed = MAX / 6; S.crash = 1; S.shake = .6; S.x = clamp(S.x - Math.sign(S.x) * .35, -1.2, 1.2); snd.crash();
          say(BRUNO, L.crash[Math.random() < .5 ? 0 : 1]); break;
        }
      }
    }
    if (S.x < -1.08) {                                                         // парапет над морем
      if (S.speed > MAX * .3) { S.speed *= .6; S.shake = .4; snd.bump(); }
      S.x = -1.04;
    }
    /* соперники: столкновения сзади */
    for (const b of ps.bikes.concat(seg(pz + SEG).bikes)) {
      const gap = b.z - pz;
      if (gap > -SEG * .2 && gap < SEG * .9 && Math.abs(S.x - b.x) < .3 && S.speed > b.speed) {
        S.speed = b.speed * .82; S.pos = b.z - PLAYER_Z - SEG * .9; S.shake = .25; snd.bump();
        if (b.lucia && Math.random() < .4) say(LUC, L.lucBump);
        break;
      }
    }
    S.x = clamp(S.x, -1.6, 1.6);
    S.speed = clamp(S.speed, 0, MAX * 1.25);
    S.pos = Math.min(S.pos + S.speed * dt, LEN - (DRAW + 5) * SEG);
    updateBikes(dt);
    /* места */
    const npz = S.pos + PLAYER_Z, LU = S.bikes[0];
    if (!S.done) {
      S.place = 1 + S.bikes.filter(b => b.z > npz).length;
      if (S.place < S.prevPlace && S.t > 3) snd.pass();
      if (S.place <= 10 && S.crowdLine === 0) { S.crowdLine = 1; say(CROWD, L.c1); say(CROWD, L.c2); }
      if (S.place <= 4 && S.crowdLine === 1) { S.crowdLine = 2; say(CROWD, L.c3); }
      if (S.place === 2 && S.crowdLine === 2) { S.crowdLine = 3; say(FAB, L.seeL); }
      S.prevPlace = S.place;
      const fr = (npz - PLAYER_Z) / raceLen;
      while (S.leg + 1 < LEGS.length && fr >= LEGS[S.leg + 1].at) { S.leg++; S.flash = Math.max(S.flash, .25); if (S.leg === LEGS.length - 1) say(FAB, L.last3); }
      if (!S.lookBack && LU.z - npz < SEG * 6 && LU.z > npz && npz > M.final * SEG) { S.lookBack = true; say(FAB, L.look); }
      if (npz > M.devilWarn * SEG && !S.warned) { S.warned = true; say(FAB, L.warn); }
      if (S.gas === "ready" && npz > M.finish * SEG) setGas("used");
      if (npz >= finishZ) finish(npz);
    } else if ((S.finT += dt) > 2.4) end();
    snd.engine(S.speed / MAX, cough);
  }
  function finish(npz){
    S.done = true; S.fin = S.t; setGas("used");
    const ahead = S.bikes.filter(b => b.fin && b.fin < S.t).length + S.bikes.filter(b => !b.fin && b.z > npz).length;
    S.place = 1 + ahead;
    const LU = S.bikes[0], lgap = LU.fin ? (S.t - LU.fin) : (npz - LU.z) / Math.max(1, LU.speed);
    S.photo = Math.abs(lgap) < .35;
    S.flash = .6;
    if (S.place === 1) { say(L.judge, S.photo ? L.j1 : L.j2); snd.win(); }
    else snd.lose();
  }
  function end(){
    mode = "end"; snd.stop();
    const win = S.place === 1, t = S.fin;
    if (win) { if (!best || t < best) { best = t; try { localStorage.setItem(bestKey, String(t)); } catch(e) {} } if (opt.onWin) opt.onWin(); }
    ovEnd.innerHTML = win ? `
      <div class="mt-big">${L.win}</div>
      <p>${S.photo ? L.wPhoto : L.wCrowd}</p>
      <p class="fr-shout">${L.shout}</p>
      <p class="mt-q">${L.dialog}</p>
      <div class="mt-keys">${L.time}: ${fmt(t)}${best === t ? ` · ${L.newRec}` : best ? ` · ${L.rec} ${fmt(best)}` : ""}</div>
      <div class="mt-row"><button class="mt-btn" data-act="go">${L.again}</button>${opt.next ? `<a class="mt-btn mt-ghost" href="${opt.next}">${L.next}</a>` : ""}<button class="mt-btn mt-ghost" data-act="back">${L.back}</button></div>` : `
      <div class="mt-big">${L.place(S.place)}</div>
      <p>${S.place === 2 ? L.l2 : L.lN}</p>
      <p class="mt-q">${L.quote}</p>
      <ul class="mt-steps"><li><b>${L.tipT}</b><br>${S.place === 2 ? L.tip2 : L.tipN}</li></ul>
      <div class="mt-row"><button class="mt-btn" data-act="go">${L.retry}</button><button class="mt-btn mt-ghost" data-act="back">${L.back}</button></div>`;
    ovEnd.hidden = false; setGas("off");
  }

  /* ── отрисовка ── */
  function project(p, cx, cy, cz){
    p.camera.x = (p.world.x || 0) - cx; p.camera.y = p.world.y - cy; p.camera.z = p.world.z - cz;
    p.screen.scale = DEPTH / p.camera.z;
    p.screen.x = W / 2 + p.screen.scale * p.camera.x * W / 2;
    p.screen.y = HY - p.screen.scale * p.camera.y * H / 2;
    p.screen.w = p.screen.scale * ROAD * W / 2;
  }
  function poly(x1, y1, x2, y2, x3, y3, x4, y4, col){ c.fillStyle = col; c.beginPath(); c.moveTo(x1, y1); c.lineTo(x2, y2); c.lineTo(x3, y3); c.lineTo(x4, y4); c.closePath(); c.fill(); }
  let bgOff = 0;
  function background(curve, dt){
    bgOff += curve * (S ? S.speed / MAX : 0) * dt * .02;
    const g = c.createLinearGradient(0, 0, 0, HY); g.addColorStop(0, "#5aa7e0"); g.addColorStop(.7, "#a9d6f0"); g.addColorStop(1, "#e9f2ec");
    c.fillStyle = g; c.fillRect(0, 0, W, HY + 2);
    const sx = ((.78 - bgOff * 1.2) % 1 + 1) % 1 * W * 1.4 - W * .2;
    c.fillStyle = "rgba(255,248,214,.55)"; c.beginPath(); c.arc(sx, 70, 34, 0, Math.PI * 2); c.fill(); c.fillStyle = "#fff8d6"; c.beginPath(); c.arc(sx, 70, 22, 0, Math.PI * 2); c.fill();
    c.fillStyle = "rgba(255,255,255,.8)";
    for (let i = 0; i < 6; i++) { const x = ((hsh(i) - bgOff * .6) % 1 + 1) % 1 * (W + 160) - 80, y = 30 + hsh(i + 9) * 110; c.beginPath(); c.ellipse(x, y, 40 + hsh(i + 3) * 30, 10, 0, 0, Math.PI * 2); c.ellipse(x + 22, y - 6, 24, 9, 0, 0, Math.PI * 2); c.fill(); }
    c.fillStyle = "#2f74a8"; c.fillRect(0, HY - 14, W, 16);                   // морской горизонт
    const mts = (col, amp, sp, base) => { c.fillStyle = col; c.beginPath(); c.moveTo(0, HY);
      for (let x = 0; x <= W; x += 6) { const u = (x / W) * .5 + bgOff * sp + .25, m = Math.sin(u * Math.PI * 2);   // горы — справа, море — слева
        const h = Math.max(0, m) * (amp + Math.sin(u * 37) * 12 + Math.sin(u * 91) * 6); c.lineTo(x, HY - base - h); }
      c.lineTo(W, HY); c.closePath(); c.fill(); };
    mts("#8fa6a8", 120, .8, 4); mts("#6f8a6a", 80, 1.1, 0);
  }
  function render(dt){
    c.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    const sh = S && S.shake > 0 ? S.shake * 6 : 0;
    if (sh) c.translate(rnd(-sh, sh), rnd(-sh, sh) * .5);
    const pos = S ? S.pos : 0, px = S ? S.x : 0;
    const base = seg(pos), bp = (pos % SEG) / SEG, ps = seg(pos + PLAYER_Z), pp = ((pos + PLAYER_Z) % SEG) / SEG;
    const pY = lerp(ps.p1.world.y, ps.p2.world.y, pp);
    background(ps.curve, dt);
    let maxy = H, x = 0, ddx = -(base.curve * bp);
    for (let n = 0; n < DRAW; n++) {
      const s = segs[base.index + n]; if (!s) break;
      s.clip = maxy; s.fog = n / DRAW;
      project(s.p1, px * ROAD - x, pY + CAM_H, pos); project(s.p2, px * ROAD - x - ddx, pY + CAM_H, pos);
      x += ddx; ddx += s.curve;
      if (s.p1.camera.z <= DEPTH || s.p2.screen.y >= s.p1.screen.y || s.p2.screen.y >= maxy) continue;
      drawSegment(s);
      maxy = s.p1.screen.y;
    }
    for (let n = DRAW - 1; n > 0; n--) {
      const s = segs[base.index + n]; if (!s || s.p1.camera.z <= DEPTH) continue;
      const sc = s.p1.screen.scale, half = s.p1.screen.w;
      c.save(); c.beginPath(); c.rect(0, 0, W, s.clip); c.clip();
      for (const sp of s.sprites) {
        const sx = s.p1.screen.x + half * sp.x, sy = s.p1.screen.y;
        if (sp.kind === "gate") drawGate(c, s.p1.screen.x, sy, half, L.gate); else if (half * .12 > .25 && sx > -half * 4 && sx < W + half * 4) drawSprite(c, sp, sx, sy, half);
      }
      for (const b of s.bikes) {
        const t = (b.z % SEG) / SEG, bx = lerp(s.p1.screen.x, s.p2.screen.x, t) + lerp(s.p1.screen.w, s.p2.screen.w, t) * b.x, by = lerp(s.p1.screen.y, s.p2.screen.y, t);
        const bw = lerp(s.p1.screen.w, s.p2.screen.w, t) * .28;
        if (bw > 1.2) bikeSprite(c, bx, by, bw, {body:b.body, suit:b.suit, helmet:b.helmet, star:b.star, hair:b.hair, num:bw > 24 ? b.num : "", lean:b.skid > 0 ? Math.sin(S.t * 30) * .25 : -s.curve * .04, brake:b.speed < MAX * .6 && b.speed > 0});
      }
      c.restore();
    }
    /* Фабрицио */
    const bounce = S && S.speed > 0 ? Math.sin(S.t * 40) * Math.min(1.5, S.speed / MAX * 1.5) : 0;
    const pyScreen = H - 36 + bounce + (ps.p2.world.y - ps.p1.world.y > 30 ? -2 : 0);
    bikeSprite(c, W / 2, pyScreen, DEPTH / PLAYER_Z * ROAD * W / 2 * .28, {body:"#3f8a3a", suit:"#5a4630", helmet:"#efe8d6", old:true, num:"17", lean:(S ? S.lean : 0) + (S && S.sand > 0 ? Math.sin(S.t * 25) * .12 : 0), brake:keys.d});
    if (S && S.boost > 0) { c.fillStyle = `rgba(255,190,80,${S.boost / 1.6 * .6})`; c.beginPath(); c.ellipse(W / 2, pyScreen - 50, 26, 10, 0, 0, Math.PI * 2); c.fill(); }
    if (S && S.sand > 0) { c.fillStyle = "rgba(226,196,140,.55)"; for (let i = 0; i < 8; i++) { c.beginPath(); c.arc(W / 2 + rnd(-50, 50), pyScreen - rnd(0, 20), rnd(3, 9), 0, Math.PI * 2); c.fill(); } }
    if (S && S.flash > 0) { c.fillStyle = `rgba(255,255,255,${S.flash * .5})`; c.fillRect(0, 0, W, H); }
    c.setTransform(dpr * k, 0, 0, dpr * k, 0, 0);
    if (S) hud();
  }
  function drawSegment(s){
    const a = s.p1.screen, b = s.p2.screen, fog = s.fog;
    const sea = s.dark ? "#2b6f9c" : "#3279a8", land = s.dark ? "#7f9a4a" : "#88a352", rumble = s.dark ? "#c94a3a" : "#f1ede2";
    const roadCol = s.dark ? "#6c6c70" : "#737377", lane = s.dark ? null : "#e9e4d4";
    poly(0, b.y, W, b.y, W, a.y, 0, a.y, land);
    const ex1 = a.x - a.w * 1.62, ex2 = b.x - b.w * 1.62;              // за набережной — море
    poly(0, b.y, Math.max(0, ex2), b.y, Math.max(0, ex1), a.y, 0, a.y, sea);
    poly(ex1, a.y, a.x - a.w * 1.04, a.y, b.x - b.w * 1.04, b.y, ex2, b.y, s.dark ? "#c9bb9a" : "#d2c4a3");   // каменная набережная
    poly(ex1, a.y, ex1 + a.w * .06, a.y, ex2 + b.w * .06, b.y, ex2, b.y, "#9d8f70");
    const r1 = a.w / 9, r2 = b.w / 9;
    poly(a.x - a.w - r1, a.y, a.x - a.w, a.y, b.x - b.w, b.y, b.x - b.w - r2, b.y, rumble);
    poly(a.x + a.w + r1, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x + b.w + r2, b.y, rumble);
    poly(a.x - a.w, a.y, a.x + a.w, a.y, b.x + b.w, b.y, b.x - b.w, b.y, roadCol);
    if (s.sand) { const [u0, u1] = s.sand; poly(a.x + a.w * u0, a.y, a.x + a.w * u1, a.y, b.x + b.w * u1, b.y, b.x + b.w * u0, b.y, s.dark ? "#d6b77a" : "#dcbf86"); }
    if (lane) { const l1 = a.w / 40, l2 = b.w / 40; poly(a.x - l1, a.y, a.x + l1, a.y, b.x + l2, b.y, b.x - l2, b.y, lane); }
    if (s.index === M.finish || s.index === M.finish + 1) { const n = 12; for (let i = 0; i < n; i++) { const t0 = -1 + 2 * i / n, t1 = -1 + 2 * (i + 1) / n; poly(a.x + a.w * t0, a.y, a.x + a.w * t1, a.y, b.x + b.w * t1, b.y, b.x + b.w * t0, b.y, (i + s.index) % 2 ? "#111" : "#fafafa"); } }
    if (fog > .35) { c.fillStyle = `rgba(233,242,236,${(fog - .35) * .9})`; c.fillRect(0, b.y, W, a.y - b.y + 1); }
  }
  function hud(){
    c.fillStyle = "rgba(14,18,28,.62)"; rr(c, 8, 8, W - 16, 46, 10); c.fill();
    c.fillStyle = "#fff"; c.textBaseline = "middle"; c.textAlign = "left";
    c.font = "800 20px system-ui, sans-serif"; c.fillText(`${S.place}`, 18, 26);
    c.font = "600 11px system-ui, sans-serif"; c.fillStyle = "#cfd6e4"; c.fillText(L.of(N_BIKES + 1), 18 + (S.place > 9 ? 26 : 14), 28);
    const fr = clamp(S.pos / raceLen, 0, 1);
    c.textAlign = "right"; c.fillStyle = "#fff"; c.font = "700 13px system-ui, sans-serif";
    c.fillText(`${Math.round(S.speed / MAX * 140)} ${L.kmh}`, W - 18, 22);
    c.font = "600 11px system-ui, sans-serif"; c.fillStyle = "#cfd6e4"; c.fillText(`${(fr * KM).toFixed(1).replace(".", ",")} / ${KM} ${L.km} · ${fmt(S.done ? S.fin : S.t)}`, W - 18, 38);
    const bx0 = 112, bx1 = W - 150, by = 42;                                   // полоска пути к маяку
    c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(bx0, by, bx1 - bx0, 3);
    const LU = S.bikes[0], lf = clamp((LU.z - PLAYER_Z) / raceLen, 0, 1);
    c.fillStyle = "#e0322a"; c.beginPath(); c.arc(bx0 + (bx1 - bx0) * lf, by + 1.5, 4, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#56c25a"; c.beginPath(); c.arc(bx0 + (bx1 - bx0) * fr, by + 1.5, 4.5, 0, Math.PI * 2); c.fill();
    c.fillStyle = "#fff"; c.fillRect(bx1 + 2, by - 7, 3, 10); c.fillStyle = "#e0322a"; c.fillRect(bx1 + 1, by - 9, 5, 3);
    c.textAlign = "center"; c.fillStyle = "#fff"; c.font = "600 11px system-ui, sans-serif"; c.fillText(LEGS[S.leg].txt, (bx0 + bx1) / 2 + 4, 24);
    if (S.msg) {
      const m = S.msg, fs = 13; c.font = `600 ${fs}px system-ui, sans-serif`;
      const words = m.text.split(" "), lines = []; let ln = "";
      words.forEach(w => { const t = ln ? ln + " " + w : w; if (c.measureText(t).width > W - 64) { lines.push(ln); ln = w; } else ln = t; }); lines.push(ln);
      const bh = 22 + lines.length * 17, y0 = 62;
      c.fillStyle = "rgba(250,246,236,.94)"; rr(c, 16, y0, W - 32, bh, 10); c.fill();
      c.textAlign = "left"; c.fillStyle = m.who === LUC ? "#c8221c" : m.who === FAB ? "#2f7a34" : "#8a5a20"; c.font = "700 11px system-ui, sans-serif"; c.fillText(m.who, 28, y0 + 12);
      c.fillStyle = "#1c1a16"; c.font = `600 ${fs}px system-ui, sans-serif`; lines.forEach((l, i) => c.fillText(l, 28, y0 + 29 + i * 17));
    }
    if (S.gas === "ready") { c.textAlign = "center"; c.font = "900 34px system-ui, sans-serif"; c.fillStyle = `rgba(255,${180 + Math.sin(S.t * 14) * 60},60,1)`; c.strokeStyle = "#2a1404"; c.lineWidth = 4; c.strokeText(L.GAS, W / 2, H * .62); c.fillText(L.GAS, W / 2, H * .62); }
    if (mode === "count") { const n = Math.ceil(S.cd - .2); c.textAlign = "center"; c.font = "900 56px system-ui, sans-serif"; c.fillStyle = "#fff"; c.strokeStyle = "rgba(0,0,0,.5)"; c.lineWidth = 5;
      const t = S.cd > .2 ? (n > 0 ? String(n) : "") : L.flag; c.strokeText(t, W / 2, H * .45); c.fillText(t, W / 2, H * .45);
      c.font = "600 13px system-ui, sans-serif"; c.fillStyle = "#fff"; c.fillText(L.flagUp, W / 2, H * .45 + 40); }
    if (mode === "pause") { c.fillStyle = "rgba(0,0,0,.5)"; c.fillRect(0, 0, W, H); c.fillStyle = "#fff"; c.textAlign = "center"; c.font = "700 22px system-ui, sans-serif"; c.fillText(L.pause, W / 2, H / 2); }
  }

  /* ── цикл ── */
  let lastCd = 4;
  function frame(now){
    if (!cv.isConnected) return cleanup();
    raf = requestAnimationFrame(frame);
    const dt = Math.min(.05, (now - (tPrev || now)) / 1000); tPrev = now;
    if (mode === "count") {
      S.cd -= dt; const n = Math.ceil(S.cd - .2);
      if (n !== lastCd && n >= 0) { lastCd = n; if (n > 0) snd.beep(false); else snd.beep(true); }
      if (S.msg && (S.msg.t -= dt) <= 0) S.msg = S.q.shift() || null;
      if (S.cd <= -.3) { mode = "run"; lastCd = 4; }
    } else if (mode === "run") {
      acc += dt; while (acc >= 1 / 60) { update(1 / 60); acc -= 1 / 60; if (mode !== "run") break; }
    }
    render(dt);
  }
  raf = requestAnimationFrame(frame);
  if (opt.debug) opt.debug.get = () => ({S, segs, M, keys, raceLen, MAX, SEG, PLAYER_Z, update, mode:() => mode, setMode:m => { mode = m; }, fresh});
}
window.LitmirFaro = {mount};
})();
