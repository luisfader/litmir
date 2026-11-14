/* «Поединок» — файтинг в духе Street Fighter по роману «Резонанс любви».
   Агент по небесным делам Луис дерётся с двумя противниками: капитаном полиции хаоса и Дмитрием Петровичем.
   Нужны runner.js и rezonans.js (фоны Петербурга и рисовальные функции берутся из LitmirRunner.ext).
   Подключение: window.LitmirFight.mount(el, {slug, stage, sfx, onWin, onBack, onNext}). Графика рисуется кодом. */
(function(){
"use strict";
const R = window.LitmirRunner; if (!R || !R.ext) return;
const X = R.ext, {H, GY, TW, TAU, clamp, lerp, lg, glow, rrect, ell, hash, drawNatalia} = X.h;
const AW = 1000, G = 1900, ROUND_T = 60;

/* ───────── Бойцы ───────── */
const CH = {
  luis:{name:"Луис", sub:"агент по небесным делам", hp:100, spd:175, jump:660, s:1.08, special:"mandarin", superName:"Грифоны!",
    look:{skin:"#d9b294", hair:"#b9b9bf", hairStyle:"swept", coat:"#1f2433", arm:"#262c3e", lining:"#8a2230", pants:"#17181e", shoe:"#0c0c0f", shirt:"#2d2d33", long:true, stubble:true}},
  atlant:{name:"Атлант", sub:"берёт двести рублей за проход", hp:140, spd:120, jump:520, s:1.3, special:"stone", superName:"Двести рублей!",
    look:{skin:"#9a948e", hair:"#7d7772", hairStyle:"curly", beard:true, coat:"#9a948e", arm:"#9a948e", pants:"#8d8782", shoe:"#7d7772", shirt:null, stone:true, bulk:1.45}},
  agent:{name:"Агент", sub:"полиция хаоса", hp:100, spd:195, jump:680, s:1.0, special:"cuffs", superName:"Задержание!",
    look:{skin:"#e6c3a6", hair:"#2c2420", hairStyle:"short", cap:"#1a2236", coat:"#1c2438", arm:"#232d46", pants:"#161b28", shoe:"#0b0b0e", shirt:"#e8eef5", epaulet:true}},
  dp:{name:"Дмитрий Петрович", sub:"глава службы небесных дел", hp:125, spd:140, jump:560, s:1.02, special:"thread", superName:"Золотой луч!",
    look:{skin:"#e3c2a8", hair:"#ecebe7", hairStyle:"short", coat:"#59606e", arm:"#636b7a", pants:"#383d48", shoe:"#151515", shirt:"#ece9e2", tie:"#c9a23a", glasses:true, aura:true}}
};
const MV = {
  punch:  {st:.06, act:.08, rec:.15, dmg:6,  x0:6,  x1:60, h0:66, h1:96, kb:90,  stun:.26, pose:"punch"},
  kick:   {st:.11, act:.10, rec:.24, dmg:9,  x0:10, x1:74, h0:30, h1:66, kb:160, stun:.32, pose:"kick"},
  lowkick:{st:.09, act:.10, rec:.22, dmg:7,  x0:10, x1:72, h0:0,  h1:24, kb:90,  stun:.3,  pose:"lowkick"},
  jkick:  {st:.05, act:.30, rec:.02, dmg:8,  x0:2,  x1:56, h0:10, h1:60, kb:120, stun:.3,  pose:"jkick", air:true},
  throw:  {st:.2,  act:.02, rec:.3,  pose:"throw", proj:true},
  super:  {st:.4,  act:.02, rec:.55, pose:"super", sup:true},
  rush:   {st:.25, act:.35, rec:.3,  dmg:18, x0:0, x1:56, h0:30, h1:96, kb:260, stun:.5, pose:"punch", dash:620}
};
const PS = {
  idle:   {lean:.06,  a1:.55, e1:2.3,  a2:.35,  e2:2.5, h1:.32, k1:-.38, h2:-.32, k2:-.12},
  walk:   {lean:.08,  a1:.6,  e1:2.2,  a2:.4,   e2:2.4, h1:.3,  k1:-.3,  h2:-.3,  k2:-.2},
  crouch: {lean:.25,  a1:.75, e1:2.2,  a2:.45,  e2:2.3, h1:1.35,k1:-2.0, h2:.15,  k2:-1.75},
  punch:  {lean:.24,  a1:1.57,e1:0,    a2:.3,   e2:2.5, h1:.5,  k1:-.3,  h2:-.5,  k2:-.05},
  kick:   {lean:-.32, a1:.9,  e1:1.8,  a2:-.6,  e2:1.3, h1:1.6, k1:0,    h2:-.12, k2:0},
  lowkick:{lean:.05,  a1:.7,  e1:2.2,  a2:.3,   e2:2.2, h1:1.5, k1:.05,  h2:.1,   k2:-1.9},
  jump:   {lean:.1,   a1:.6,  e1:2.3,  a2:.3,   e2:2.4, h1:1.3, k1:-2.2, h2:.5,   k2:-1.9},
  jkick:  {lean:-.15, a1:.9,  e1:1.6,  a2:-.5,  e2:1.2, h1:1.25,k1:.15,  h2:.35,  k2:-2.0},
  hit:    {lean:-.45, a1:-.3, e1:.8,   a2:-.7,  e2:.6,  h1:.25, k1:-.2,  h2:-.45, k2:-.2},
  block:  {lean:-.1,  a1:1.05,e1:2.45, a2:.85,  e2:2.55,h1:.28, k1:-.42, h2:-.42, k2:-.12},
  cblock: {lean:.1,   a1:1.05,e1:2.45, a2:.85,  e2:2.55,h1:1.35,k1:-2.0, h2:.15,  k2:-1.75},
  wind:   {lean:-.15, a1:-1.5,e1:.7,   a2:.6,   e2:2.2, h1:.45, k1:-.35, h2:-.4,  k2:-.1},
  throw:  {lean:.3,   a1:1.85,e1:-.25, a2:-.4,  e2:1.0, h1:.55, k1:-.4,  h2:-.55, k2:0},
  super:  {lean:-.18, a1:2.8, e1:.1,   a2:2.6,  e2:.2,  h1:.4,  k1:-.3,  h2:-.4,  k2:0},
  win:    {lean:-.06, a1:2.95,e1:.15,  a2:.3,   e2:.4,  h1:.16, k1:0,    h2:-.16, k2:0},
  ko:     {lean:-.2,  a1:2.4, e1:.3,   a2:2.0,  e2:.4,  h1:.2,  k1:-.1,  h2:-.1,  k2:-.1}
};
const KEYS = Object.keys(PS.idle);

/* ───────── Этапы ───────── */
const FIGHTS = {
  "rezonans-lyubvi":{hero:"luis", foes:[
    {id:"atlant", theme:"spbDay", place:"Миллионная улица, у Нового Эрмитажа",
     intro:"Миллионная улица. Каменный атлант сошёл с портика Нового Эрмитажа и никого не пропускает без двухсот рублей. Луис торопится к Наталье — и платить не собирается.",
     win:"Атлант вернулся держать портик. Проход снова бесплатный.",
     lines:[["atlant", "Проход — двести рублей."], ["luis", "Я агент по небесным делам. У меня служебный пропуск."], ["atlant", "Пропуски не принимаем."]]},
    {id:"agent", theme:"spbWhite", place:"Канал Грибоедова, белая ночь",
     intro:"Белая ночь, канал Грибоедова. Агент полиции хаоса перекрыл дорогу к гостинице «Океан», где ждёт Наталья. Он очень хочет верить, что поймает Луиса.",
     win:"Агент полиции хаоса отступил. Дорога к Наталье свободна.",
     lines:[["agent", "Надо верить, что мы тебя поймаем, Луис."], ["luis", "Верь. Это бесплатно."]]},
    {id:"dp", theme:"spbDawn", place:"Невский, рассвет у Дома Зингера",
     win:"Город снова принадлежит самому себе.",
     intro:"Рассвет над Невским. Дмитрий Петрович тянет золотые нити к куполу Дома Зингера и поднимает город в небо. Остановить его может только агент, которому больше нечего терять.",
     lines:[["dp", "Город должен принадлежать тем, кто его понимает."], ["luis", "Город принадлежит самому себе."]]}
  ], finale:[["nat", "Вы что, дрались мандаринами?"], ["luis", "Привет от витаминного отдела."], ["nat", "Мой герой… в мандариновом соке."]]}
};

/* ───────── Звук ───────── */
function makeSound(on){
  let ctx = null;
  const tone = (f, t0, d, type, g, f2) => { if (!on()) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); const s = ctx.currentTime + t0, o = ctx.createOscillator(), v = ctx.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d); v.gain.setValueAtTime(0, s); v.gain.linearRampToValueAtTime(g || .06, s + .01); v.gain.exponentialRampToValueAtTime(.0001, s + d); o.connect(v).connect(ctx.destination); o.start(s); o.stop(s + d + .05); } catch(e) {} };
  const noise = (d, g) => { if (!on()) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); const n = ctx.sampleRate * d, b = ctx.createBuffer(1, n, ctx.sampleRate), a = b.getChannelData(0); for (let i = 0; i < n; i++) a[i] = (Math.random() * 2 - 1) * (1 - i / n); const s = ctx.createBufferSource(), v = ctx.createGain(); v.gain.value = g; s.buffer = b; s.connect(v).connect(ctx.destination); s.start(); } catch(e) {} };
  return {
    whoosh(){ noise(.08, .05); },
    hit(big){ noise(big ? .16 : .09, big ? .22 : .14); tone(big ? 120 : 170, 0, .12, "square", .05, 60); },
    block(){ tone(700, 0, .06, "square", .03, 500); },
    throw(){ tone(500, 0, .14, "triangle", .05, 900); },
    super(){ [392, 523, 659, 784].forEach((f, i) => tone(f, i * .07, .25, "sawtooth", .04)); },
    ko(){ [330, 262, 196, 131].forEach((f, i) => tone(f, i * .14, .3, "square", .05)); },
    bell(){ tone(880, 0, .5, "triangle", .07); tone(1320, 0, .4, "sine", .04); },
    win(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .1, .35, "triangle", .06)); }
  };
}

/* ───────── Рисование бойца ───────── */
function limb(c, x, y, a, l1, e, l2, w1, w2, col, col2){
  const kx = x + Math.sin(a) * l1, ky = y + Math.cos(a) * l1, ex = kx + Math.sin(a + e) * l2, ey = ky + Math.cos(a + e) * l2;
  c.lineCap = "round"; c.strokeStyle = col; c.lineWidth = w1; c.beginPath(); c.moveTo(x, y); c.lineTo(kx, ky); c.stroke();
  c.strokeStyle = col2 || col; c.lineWidth = w2; c.beginPath(); c.moveTo(kx, ky); c.lineTo(ex, ey); c.stroke();
  return [ex, ey, a + e];
}
function legEnd(h, k){ return [Math.sin(h) * 27 + Math.sin(h + k) * 27, Math.cos(h) * 27 + Math.cos(h + k) * 27]; }
function drawFighter(c, f, t){
  const L = f.d.look, P = f.P, s = f.d.s;
  c.save(); c.translate(f.x, GY - f.y); c.scale(f.face * s, s);
  if (f.st === "ko" && f.y <= 0) { const k = Math.min(1, f.t * 3); c.translate(-20 * k, 0); c.rotate(-1.45 * k); c.translate(0, -8 * k); }
  // тень, аура
  c.save(); c.scale(1, .25); ell(c, 0, f.y / .25 / s * 0 + 4, 30, 14, "rgba(0,0,0,.25)"); c.restore();
  if (L.aura) glow(c, 0, -60, 70, "255,206,90", .18 + .08 * Math.sin(t * 3));
  const f1 = legEnd(P.h1, P.k1), f2 = legEnd(P.h2, P.k2);
  const hipY = f.y > 0 ? -54 : -Math.max(f1[1], f2[1], 20);
  const sx = Math.sin(P.lean) * 42, sy = hipY - Math.cos(P.lean) * 42;
  // дальние рука и нога
  const bk = L.bulk || 1;
  limb(c, sx - 3, sy + 4, P.a2, 21, P.e2, 20, 8 * bk, 7 * bk, L.stone ? "#857f79" : L.arm, L.stone ? "#857f79" : L.arm);
  { const [ex, ey] = [sx - 3 + Math.sin(P.a2) * 21 + Math.sin(P.a2 + P.e2) * 20, sy + 4 + Math.cos(P.a2) * 21 + Math.cos(P.a2 + P.e2) * 20]; ell(c, ex, ey, 4.4, 4.4, L.skin); }
  const [b2x, b2y] = limb(c, -3, hipY, P.h2, 27, P.k2, 27, 10 * bk, 9 * bk, L.stone ? "#827c77" : L.pants);
  ell(c, b2x + 4, b2y + 2, 8, 3.6, L.shoe);
  // пальто: полы развеваются
  if (L.long) {
    const fl = Math.min(1, Math.abs(f.vx) / 200) * 8 + (f.y > 0 ? 8 : 0) + Math.sin(t * 6) * 1.5;
    c.fillStyle = L.lining; c.beginPath(); c.moveTo(-10, hipY - 6); c.lineTo(-20 - fl, hipY + 40); c.lineTo(-8, hipY + 38); c.closePath(); c.fill();
    c.fillStyle = L.coat; c.beginPath(); c.moveTo(-12, hipY - 6); c.lineTo(12, hipY - 6); c.lineTo(16 + fl * .3, hipY + 38); c.quadraticCurveTo(0, hipY + 42, -17 - fl, hipY + 40); c.closePath(); c.fill();
  }
  // ближняя нога
  const [b1x, b1y] = limb(c, 3, hipY, P.h1, 27, P.k1, 27, 10.5 * bk, 9.5 * bk, L.pants);
  ell(c, b1x + 4, b1y + 2, 8.5, 3.8, L.shoe);
  // торс
  c.save(); c.translate(0, hipY); c.rotate(P.lean);
  if (L.stone) {
    // каменный торс атланта: мышцы, трещинки и набедренная повязка
    c.fillStyle = lg(c, -16, 0, 16, 0, ["#7f7974", "#aaa49e", "#8a847f"]); rrect(c, -16, -48, 32, 52, 10); c.fill();
    c.strokeStyle = "rgba(60,55,52,.45)"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(0, -42); c.lineTo(0, -8); c.moveTo(-12, -34); c.quadraticCurveTo(-4, -28, 0, -34); c.quadraticCurveTo(4, -28, 12, -34);
    for (let k = 0; k < 3; k++) { c.moveTo(-7, -22 + k * 7); c.lineTo(7, -22 + k * 7); } c.moveTo(-14, -12); c.lineTo(-10, -18); c.stroke();
    c.fillStyle = "#77716c"; c.beginPath(); c.moveTo(-15, -4); c.lineTo(15, -4); c.lineTo(10, 14); c.lineTo(-12, 14); c.closePath(); c.fill();
  } else {
    c.fillStyle = L.coat; rrect(c, -13, -46, 26, 50, 8); c.fill();
    c.fillStyle = L.shirt; c.beginPath(); c.moveTo(-1, -46); c.lineTo(7, -46); c.lineTo(4, -28); c.closePath(); c.fill();
  }
  if (L.tie) { c.fillStyle = L.tie; c.beginPath(); c.moveTo(3, -44); c.lineTo(6, -38); c.lineTo(4, -22); c.lineTo(2, -38); c.fill(); }
  if (L.epaulet) { c.fillStyle = "#e3b84e"; c.fillRect(-14, -47, 10, 3.5); c.fillRect(5, -47, 9, 3.5); c.fillRect(-12, -6, 25, 3); for (let k = 0; k < 3; k++) ell(c, 9, -36 + k * 9, 1.4, 1.4, "#e3b84e"); }
  if (L.long) { c.fillStyle = L.lining; c.fillRect(9, -44, 3, 46); }
  // голова
  c.fillStyle = L.skin; c.fillRect(-3, -54, 7, 9);
  const hy = -64;
  ell(c, 1, hy, 10.5, 11.5, L.skin);
  ell(c, 10.5, hy + 1, 2, 2.2, L.skin);
  ell(c, 6.5, hy - 2, 1.3, 1.6, "#1f1818");
  c.strokeStyle = "#5a3a2a"; c.lineWidth = 1.2; c.beginPath(); c.moveTo(4.5, hy - 5.5); c.lineTo(9, hy - 5); c.stroke();
  if (L.glasses) { c.strokeStyle = "#222"; c.lineWidth = 1.1; c.beginPath(); c.arc(6.5, hy - 2, 3.6, 0, TAU); c.moveTo(3, hy - 2); c.lineTo(-6, hy - 3); c.stroke(); }
  if (L.beard) { c.fillStyle = L.hair; c.beginPath(); c.moveTo(-6, hy + 1); c.quadraticCurveTo(2, hy + 22, 11, hy + 3); c.lineTo(10, hy + 8); c.quadraticCurveTo(3, hy + 9, -2, hy + 5); c.fill(); for (let q = 0; q < 4; q++) ell(c, -3 + q * 4, hy + 12 + (q % 2) * 3, 2.6, 2.6, L.hair); }
  if (L.stubble) { c.fillStyle = "rgba(110,110,115,.4)"; c.beginPath(); c.ellipse(3, hy + 6, 8, 5, 0, 0, Math.PI); c.fill(); }
  c.strokeStyle = L.lips ? "#b0484a" : "#8a4a3a"; c.lineWidth = 1.3; c.beginPath();
  if (f.st === "hit" || f.st === "ko") { ell(c, 7, hy + 6, 1.8, 2.2, "#5a1e1e"); } else { c.moveTo(4, hy + 6); c.lineTo(9, hy + 5.5); c.stroke(); }
  c.fillStyle = L.hair;
  if (L.hairStyle === "curly") { for (const [hx2, hy2] of [[-8, -6], [-3, -10], [3, -11], [8, -8], [-10, 0], [-6, 4]]) ell(c, hx2, hy + hy2, 4.6, 4.6, L.hair); }
  else if (L.hairStyle === "bun") { ell(c, -2, hy - 5, 11, 9, L.hair); ell(c, -10, hy - 9, 6, 6, L.hair); c.fillRect(-11, hy - 6, 7, 12); }
  else if (L.hairStyle === "swept") { c.beginPath(); c.ellipse(-1, hy - 5, 11.5, 8.5, 0, Math.PI * .9, TAU * 1.03); c.fill(); c.fillRect(-11, hy - 6, 8, 13); c.beginPath(); c.moveTo(9, hy - 8); c.quadraticCurveTo(0, hy - 20, -12, hy - 8); c.lineTo(-10, hy - 3); c.fill(); }
  else { c.beginPath(); c.ellipse(-1, hy - 6, 11, 7, 0, Math.PI * .95, TAU * 1.02); c.fill(); c.fillRect(-11, hy - 6, 7, 10); }
  if (L.cap) { c.fillStyle = L.cap; c.beginPath(); c.ellipse(0, hy - 9, 12, 5, 0, Math.PI, TAU); c.fill(); c.fillRect(-11, hy - 10, 22, 4); c.fillStyle = "#111"; c.beginPath(); c.ellipse(9, hy - 6.5, 7, 2, 0, 0, TAU); c.fill(); c.fillStyle = "#e3b84e"; ell(c, 3, hy - 11, 2.2, 2.2); c.fill(); }
  c.restore();
  // ближняя рука (поверх всего)
  const [fx, fy] = limb(c, sx + 2, sy + 4, P.a1, 21, P.e1, 20, 9 * bk, 8 * bk, L.arm, L.arm);
  ell(c, fx, fy, 5 * bk, 5 * bk, L.skin);
  if (f.st === "attack" && f.mv && f.mv.pose === "wind" && f.d.special === "mandarin") drawMandarin(c, fx, fy - 2, t, 6);
  c.restore();
}
function drawMandarin(c, x, y, t, r){ ell(c, x, y, r, r * .92, "#f58a1f"); ell(c, x - r * .3, y - r * .3, r * .35, r * .3, "rgba(255,220,150,.7)"); c.fillStyle = "#3f8a3a"; c.beginPath(); c.ellipse(x + r * .4, y - r, r * .5, r * .25, -.5, 0, TAU); c.fill(); }

/* ───────── Игра ───────── */
function mount(el, opt){
  const cfg = FIGHTS[opt.slug]; if (!cfg) return false;
  const stage = clamp((opt.stage || 1) - 1, 0, cfg.foes.length - 1), F = cfg.foes[stage], T = X.THEMES[F.theme];
  const keyFail = "fg-fail:" + opt.slug + ":" + stage;
  let fails = 0; try { fails = +sessionStorage.getItem(keyFail) || 0; } catch(e) {}
  const snd = makeSound(() => !opt.sfx || opt.sfx.on());
  const hero = CH[cfg.hero], foe = CH[F.id];
  el.innerHTML = `
  <div class="rn fg">
    <div class="rn-head"><div class="rn-kick">Поединок · бой ${stage + 1} из ${cfg.foes.length}</div><h1>${hero.name} против: ${foe.name}</h1></div>
    <div class="rn-stage">
      <canvas class="rn-cv" aria-label="Поединок: ${hero.name} против ${foe.name}"></canvas>
      <div class="rn-ov rn-start">
        <div class="fg-vs"><span><b>${hero.name}</b><small>${hero.sub}</small></span><i>VS</i><span><b>${foe.name}</b><small>${foe.sub}</small></span></div>
        <p>${F.intro}</p>
        <div class="rn-goal">Выиграй <b>два раунда</b> из трёх.</div>
        <button class="rn-btn" data-act="go">В бой!</button>
        <div class="rn-keys"><span><kbd>←</kbd><kbd>→</kbd> шаг · назад — блок</span><span><kbd>↑</kbd> прыжок · <kbd>↓</kbd> присесть</span><span><kbd>J</kbd> удар · <kbd>K</kbd> пинок</span><span><kbd>L</kbd> мандарин · <kbd>I</kbd> супер</span><span class="rn-touch">На телефоне — кнопки под игрой</span></div>
      </div>
      <div class="rn-ov rn-end" hidden></div>
    </div>
    <div class="fg-pad">
      <div class="fg-dpad"><button data-k="l" aria-label="Влево">◀</button><button data-k="u" aria-label="Прыжок">▲</button><button data-k="d" aria-label="Присесть">▼</button><button data-k="r" aria-label="Вправо">▶</button></div>
      <div class="fg-btns"><button data-k="p">Удар</button><button data-k="k">Пинок</button><button data-k="s">🍊</button><button data-k="x" class="fg-sup">Супер</button></div>
    </div>
    <p class="rn-note">Назад — это блок. Присесть можно от наручников и золотого луча, а от ударной волны атланта — только прыгать. Мандарин летит через всю арену, а когда шкала внизу заполнится — жми «Супер».</p>
  </div>`;
  const root = el.querySelector(".fg"), cv = root.querySelector("canvas"), c = cv.getContext("2d");
  const ovStart = root.querySelector(".rn-start"), ovEnd = root.querySelector(".rn-end");
  let VW = 640, k = 1, dpr = 1, layers = [];
  const VIEW = 640;
  function size(){
    const cw = cv.clientWidth || 600; dpr = Math.min(2, window.devicePixelRatio || 1);
    const ch = Math.round(clamp(cw * H / VIEW, 220, 480));
    cv.style.height = ch + "px"; k = ch / H; VW = cw / k;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    const sc = clamp(k * dpr, 1, 2);
    if (!layers.length || layers.sc !== sc) { layers = T.layers.map((ly, i) => { const lc = document.createElement("canvas"); lc.width = TW * sc; lc.height = H * sc; const x = lc.getContext("2d"); x.scale(sc, sc); ly.paint(x, X.h.rng(31 + stage * 7 + i * 13)); return {cv:lc, f:ly.f}; }); layers.sc = sc; }
  }
  size();

  // ── состояние
  const assist = Math.max(.6, 1 - fails * .1);
  const AI = {atlant:{react:.26, block:.28, special:.26, aggr:.7, jump:.02}, agent:{react:.17, block:.45, special:.24, aggr:.8, jump:.1}, dp:{react:.16, block:.52, special:.32, aggr:.62, jump:.05}}[F.id];
  let phase = "ready", time = 0, roundT = ROUND_T, round = 1, msg = null, hitstop = 0, shake = 0, slowmo = 1, phaseT = 0, cam = 0;
  let parts = [], projs = [], fx = [], bubble = null, nat = null, finI = -1;
  let A, B;
  const inp = {l:false, r:false, u:false, d:false}, press = {p:false, k:false, s:false, x:false};
  function mk(id, x, face){ const d = CH[id]; return {id, d, x, y:0, vx:0, vy:0, face, hp:d.hp, shown:d.hp, meter:0, st:"idle", t:0, mv:null, mvT:0, hitDone:false, stun:0, crouch:false, block:false, cool:0, ph:0, wins:0, combo:0, P:Object.assign({}, PS.idle), ai:null}; }
  function newRound(){
    const wa = A ? A.wins : 0, wb = B ? B.wins : 0, ma = A ? A.meter : 0, mb = B ? B.meter : 0;
    A = mk(cfg.hero, AW / 2 - 110, 1); B = mk(F.id, AW / 2 + 110, -1);
    A.wins = wa; B.wins = wb; A.meter = ma; B.meter = mb;
    B.ai = {t:0, hold:0, dir:0, want:null};
    projs = []; fx = []; parts = []; roundT = ROUND_T; slowmo = 1; cam = AW / 2 - VW / 2;
    phase = "pre"; phaseT = 0; msg = {text:`Раунд ${round}`, t:1.1}; snd.bell();
  }
  function start(){ A = null; B = null; round = 1; ovStart.hidden = true; ovEnd.hidden = true; phase = "talk"; phaseT = 0; newRound(); phase = "talk"; msg = null; finI = -1; }
  function say(who, text, dur){ bubble = {who, text, t:dur || 3}; }

  // ── атаки
  function begin(f, name){
    if (f.mv) return false;
    const m = MV[name];
    if (m.air && f.y <= 0) return false;
    if (m.sup) { if (f.meter < 100) return false; f.meter = 0; snd.super(); msg = {text:f.d.superName, t:1.1, small:true}; shake = .3; }
    if (m.proj) { if (f.cool > 0) return false; f.cool = f.d.special === "thread" ? 1.6 : 1.1; }
    f.mv = m; f.mvName = name; f.mvT = 0; f.hitDone = false; f.st = "attack"; f.vx = m.air ? f.vx : 0;
    if (!m.proj && !m.sup) snd.whoosh();
    return true;
  }
  function boxHit(f, m, tgt){
    const s = f.d.s, x0 = f.x + f.face * m.x0 * s, x1 = f.x + f.face * m.x1 * s, ax = Math.min(x0, x1), bx = Math.max(x0, x1);
    const h0 = f.y + m.h0 * s, h1 = f.y + m.h1 * s;
    const ts = tgt.d.s, tx0 = tgt.x - 18 * ts, tx1 = tgt.x + 18 * ts, th0 = tgt.y, th1 = tgt.y + (tgt.crouch && tgt.y <= 0 ? 64 : 112) * ts;
    return bx > tx0 && ax < tx1 && h1 > th0 && h0 < th1;
  }
  function canBlock(t){ return t.block && t.y <= 0 && !t.mv && t.st !== "ko"; }
  function applyHit(att, tgt, dmg, kb, stun, opts){
    opts = opts || {};
    const mult = att === A ? 1 : assist;
    const hx = tgt.x - att.face * 6, hy = GY - tgt.y - (opts.low ? 18 : tgt.crouch ? 40 : 70) * tgt.d.s;
    if (canBlock(tgt) && !opts.unblock) {
      tgt.hp -= dmg * .15 * mult; tgt.stun = .17; tgt.st = "block"; tgt.vx = att.face * kb * .7; tgt.meter = Math.min(100, tgt.meter + 4);
      spark(hx, hy, "160,210,255", 8); snd.block();
    } else {
      const was = tgt.stun > 0 && tgt.st === "hit";
      tgt.hp -= dmg * mult; tgt.stun = stun; tgt.st = "hit"; tgt.mv = null; tgt.vx = att.face * kb;
      if (tgt.y > 0 || opts.launch) { tgt.vy = 330; tgt.y = Math.max(tgt.y, 1); }
      att.meter = Math.min(100, att.meter + 10); tgt.meter = Math.min(100, tgt.meter + 6);
      att.combo = was ? att.combo + 1 : 1;
      if (att.combo >= 2) fx.push({kind:"combo", x:att === A ? 70 : VW - 70, n:att.combo, t:1});
      spark(hx, hy, dmg >= 15 ? "255,200,90" : "255,250,220", dmg >= 15 ? 22 : 12); hitstop = dmg >= 15 ? .12 : .06; shake = Math.max(shake, dmg >= 15 ? .35 : .15); snd.hit(dmg >= 12);
    }
    if (tgt.hp <= 0) { tgt.hp = 0; ko(tgt, att); }
  }
  function spark(x, y, rgb, n){ for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = 80 + Math.random() * 260; parts.push({x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, life:.35, max:.35, rgb, s:2 + Math.random() * 2.5}); } fx.push({kind:"flash", x, y, rgb, t:.15}); }
  function ko(t, w){
    t.st = "ko"; t.t = 0; t.mv = null; t.vy = 380; t.y = Math.max(1, t.y); t.vx = w.face * 240;
    w.wins++; phase = "end"; phaseT = 0; slowmo = .3; msg = {text:"Нокаут!", t:2.2}; snd.ko();
  }
  function timeUp(){
    phase = "end"; phaseT = 0; msg = {text:"Время!", t:2};
    const a = A.hp / A.d.hp, b = B.hp / B.d.hp;
    if (a >= b) { A.wins++; B.st = "ko"; B.t = 0; } else { B.wins++; A.st = "ko"; A.t = 0; }
    snd.bell();
  }
  function spawnProj(f){
    const s = f.d.s;
    if (f.d.special === "mandarin") projs.push({kind:"mandarin", owner:f, x:f.x + f.face * 40 * s, h:f.y + 80 * s, vx:f.face * 430, t:0, dmg:9, kb:130, stun:.3});
    else if (f.d.special === "cuffs") projs.push({kind:"cuffs", owner:f, x:f.x + f.face * 40 * s, h:f.y + 84 * s, vx:f.face * 540, t:0, dmg:7, kb:90, stun:.32});
    else if (f.d.special === "stone") projs.push({kind:"stone", owner:f, x:f.x + f.face * 50 * s, h:f.y + 60, vx:f.face * 300, t:0, dmg:12, kb:180, stun:.4});
    else if (f.d.special === "thread") { const tg = f === A ? B : A; projs.push({kind:"thread", owner:f, x:tg.x, h:0, vx:0, t:0, dmg:12, kb:60, stun:.4}); }
    snd.throw();
  }
  function doSuper(f){
    const tg = f === A ? B : A;
    if (f.d.special === "mandarin") projs.push({kind:"griffin", owner:f, x:f.x - f.face * 120, h:50, vx:f.face * 760, t:0, dmg:26, kb:300, stun:.7, launch:true});
    else if (f.d.special === "cuffs") { f.mv = MV.rush; f.mvName = "rush"; f.mvT = 0; f.hitDone = false; }
    else if (f.d.special === "stone") { shake = .5; projs.push({kind:"wave", owner:f, x:f.x + f.face * 40, h:8, vx:f.face * 420, t:0, dmg:20, kb:200, stun:.6, launch:true}); }
    else projs.push({kind:"beam", owner:f, x:f.x + f.face * 40, h:f.y + 70, vx:0, t:0, dmg:22, kb:220, stun:.6, dir:f.face});
  }

  // ── обновление бойца
  function control(f, o, inp, press, dt){
    f.t += dt; f.cool = Math.max(0, f.cool - dt);
    const grounded = f.y <= 0;
    if (f.st === "ko" || f.st === "win") { f.mv = null; return; }
    if (f.stun > 0) { f.stun -= dt; f.vx *= Math.pow(.02, dt); if (f.stun <= 0 && grounded) f.st = "idle"; f.block = false; return; }
    if (f.mv) {
      const m = f.mv; f.mvT += dt;
      if (m.dash && f.mvT > m.st && f.mvT < m.st + m.act) f.vx = f.face * m.dash; else if (!m.air) f.vx *= Math.pow(.001, dt);
      if (m.proj && !f.hitDone && f.mvT >= m.st) { f.hitDone = true; spawnProj(f); }
      if (m.sup && !f.hitDone && f.mvT >= m.st) { f.hitDone = true; doSuper(f); if (f.mvName === "rush") return; }
      if (m.dmg && !f.hitDone && f.mvT >= m.st && f.mvT < m.st + m.act && boxHit(f, m, o) && o.st !== "ko") { f.hitDone = true; applyHit(f, o, m.dmg, m.kb, m.stun, {low:f.mvName === "lowkick", launch:f.mvName === "rush"}); }
      if (m.air ? grounded && f.mvT > .05 : f.mvT >= m.st + m.act + m.rec) { f.mv = null; f.st = grounded ? "idle" : "jump"; }
      return;
    }
    if (grounded) {
      f.face = o.x > f.x ? 1 : -1;
      const dir = (inp.r ? 1 : 0) - (inp.l ? 1 : 0);
      f.crouch = inp.d;
      f.block = dir === -f.face;
      if (press.x && f.meter >= 100) { begin(f, "super"); return; }
      if (press.s) { if (begin(f, "throw")) return; }
      if (press.p) { begin(f, "punch"); return; }
      if (press.k) { begin(f, f.crouch ? "lowkick" : "kick"); return; }
      if (inp.u) { f.vy = f.d.jump; f.y = 1; f.vx = dir * f.d.spd * 1.05; f.st = "jump"; f.crouch = false; return; }
      f.vx = f.crouch ? 0 : dir * f.d.spd * (dir === -f.face ? .75 : 1);
      f.st = f.crouch ? "crouch" : dir ? "walk" : "idle";
    } else {
      f.block = false;
      if (press.k || press.p) begin(f, "jkick");
    }
  }
  function physics(f, dt){
    if (f.y > 0 || f.vy > 0) { f.vy -= G * dt; f.y += f.vy * dt; if (f.y <= 0) { f.y = 0; f.vy = 0; if (f.st === "jump") f.st = "idle"; if (f.st !== "ko") puff(f.x); } }
    else if (f.st === "ko") f.vx *= Math.pow(.01, dt);
    f.x += f.vx * dt;
    f.x = clamp(f.x, 40, AW - 40);
    f.ph += dt * Math.abs(f.vx) / 22;
    // поза
    let tgt = PS.idle;
    if (f.st === "ko") tgt = PS.ko; else if (f.st === "win") tgt = PS.win;
    else if (f.st === "hit") tgt = PS.hit; else if (f.st === "block") tgt = f.crouch ? PS.cblock : PS.block;
    else if (f.mv) tgt = f.mvT < f.mv.st ? (f.mv.proj || f.mv.sup ? (f.mv.sup ? PS.super : PS.wind) : f.mv.air ? PS.jump : PS.idle) : PS[f.mv.pose];
    else if (f.y > 0) tgt = PS.jump; else if (f.crouch) tgt = f.block ? PS.cblock : PS.crouch;
    else if (f.st === "walk") { tgt = Object.assign({}, PS.walk); const s = Math.sin(f.ph); tgt.h1 = .3 + s * .45; tgt.h2 = -.3 - s * .45; tgt.k1 = -.25 - Math.max(0, -s) * .7; tgt.k2 = -.25 - Math.max(0, s) * .7; }
    else if (f.block && f.y <= 0) tgt = PS.block;
    if (f.mv && f.mv.pose === "wind") tgt = PS.wind;
    if (f.mv && f.mvName === "throw" && f.mvT < f.mv.st) tgt = PS.wind;
    const kk = 1 - Math.exp(-dt * (f.mv && f.mvT >= f.mv.st ? 40 : 18));
    const bob = f.st === "idle" ? Math.sin(time * 4 + (f === A ? 0 : 2)) * .05 : 0;
    for (const key of KEYS) f.P[key] = lerp(f.P[key], tgt[key] + (key === "e1" || key === "e2" ? bob : 0), kk);
  }
  function puff(x){ for (let i = 0; i < 6; i++) parts.push({x:x + (Math.random() - .5) * 30, y:GY - 2, vx:(Math.random() - .5) * 80, vy:-20 - Math.random() * 40, life:.4, max:.4, rgb:"180,170,160", s:3}); }

  // ── ИИ противника
  function think(f, o, dt){
    const ai = f.ai, out = {l:false, r:false, u:false, d:false}, pr = {p:false, k:false, s:false, x:false};
    ai.t -= dt; ai.hold -= dt;
    const dx = o.x - f.x, dist = Math.abs(dx), toward = dx > 0 ? "r" : "l", away = dx > 0 ? "l" : "r";
    const danger = (o.mv && o.mvT < o.mv.st + o.mv.act && dist < 100) || projs.some(p => p.owner === o && Math.abs(p.x - f.x) < 170 && p.kind !== "thread");
    if (ai.hold > 0 && ai.want) { Object.assign(out, ai.want.inp); return [out, pr]; }
    if (ai.t > 0) { if (ai.walk) out[ai.walk] = true; return [out, pr]; }
    ai.t = AI.react * (.7 + Math.random() * .6) / Math.max(.75, assist); ai.walk = null;
    if (danger && Math.random() < AI.block * assist) {
      const lowP = projs.some(p => p.owner === o && p.kind === "cuffs");
      if (projs.some(p => p.owner === o && (p.kind === "mandarin") && Math.abs(p.x - f.x) < 170) && Math.random() < .45) { out.u = true; out[toward] = true; return [out, pr]; }
      ai.want = {inp:{[away]:true, d:lowP && Math.random() < .5}}; ai.hold = .35; Object.assign(out, ai.want.inp); return [out, pr];
    }
    if (f.meter >= 100 && dist < 320 && Math.random() < .6) { pr.x = true; return [out, pr]; }
    if (dist > 150) {
      if (f.cool <= 0 && Math.random() < AI.special) { pr.s = true; return [out, pr]; }
      if (Math.random() < AI.jump) { out.u = true; out[toward] = true; return [out, pr]; }
      ai.walk = toward; out[toward] = true; return [out, pr];
    }
    if (dist > 75) { if (Math.random() < AI.aggr) { ai.walk = toward; out[toward] = true; } else if (f.cool <= 0 && Math.random() < AI.special * .6) pr.s = true; else { ai.walk = away; out[away] = true; } return [out, pr]; }
    const r = Math.random();
    if (r < .38) pr.p = true; else if (r < .66) pr.k = true; else if (r < .78) { out.d = true; pr.k = true; } else if (r < .86) { ai.walk = away; out[away] = true; } else { ai.want = {inp:{[away]:true}}; ai.hold = .3; out[away] = true; }
    return [out, pr];
  }

  // ── главный шаг
  function update(dt){
    time += dt;
    for (const m of fx) m.t -= dt; fx = fx.filter(m => m.t > 0);
    if (msg) { msg.t -= dt; if (msg.t <= 0) msg = null; }
    if (bubble) { bubble.t -= dt; if (bubble.t <= 0) bubble = null; }
    shake = Math.max(0, shake - dt);
    if (phase === "ready" || phase === "paused") return;
    if (hitstop > 0) { hitstop -= dt; return; }
    const sdt = dt * slowmo; slowmo = lerp(slowmo, 1, dt * 1.5);
    phaseT += dt;
    if (phase === "talk") {
      const L = F.lines, step = 3.4, i = Math.floor(phaseT / step);
      if (i < L.length && (!bubble || bubble.i !== i)) { say(L[i][0], L[i][1], step - .2); bubble.i = i; }
      if (phaseT > L.length * step) { phase = "pre"; phaseT = 0; msg = {text:`Раунд ${round}`, t:1.1}; snd.bell(); }
    } else if (phase === "pre") {
      if (phaseT > 1.1 && phaseT - dt <= 1.1) { msg = {text:"Бой!", t:.8}; }
      if (phaseT > 1.7) { phase = "fight"; phaseT = 0; }
    } else if (phase === "fight") {
      roundT -= sdt; if (roundT <= 0) { roundT = 0; timeUp(); }
    } else if (phase === "end") {
      if (phaseT > 1.6) { const w = A.st !== "ko" ? A : B; if (w.st !== "ko" && w.y <= 0 && !w.mv) w.st = "win"; }
      if (phaseT > 3.2) {
        if (A.wins >= 2 || B.wins >= 2) { matchEnd(A.wins >= 2); return; }
        round++; newRound(); return;
      }
    } else if (phase === "finale") {
      if (nat) { nat.x = Math.min(nat.tx, nat.x + 160 * dt); nat.ph += dt * 10; }
      const L = cfg.finale, step = 3.6, i = Math.floor((phaseT - 1.2) / step);
      if (i >= 0 && i < L.length && i !== finI) { finI = i; say(L[i][0], L[i][1], step - .2); }
      if (phaseT > 1.2 + L.length * step + .3 && ovEnd.hidden) showFinal();
    }
    const fight = phase === "fight";
    const [bi, bp] = fight && B.ai ? think(B, A, sdt) : [{}, {}];
    control(A, B, fight ? inp : {}, fight ? press : {}, sdt);
    control(B, A, fight ? bi : {}, fight ? bp : {}, sdt);
    press.p = press.k = press.s = press.x = false;
    physics(A, sdt); physics(B, sdt);
    // не проходят друг сквозь друга
    const gap = 36 * (A.d.s + B.d.s) / 2, dx = B.x - A.x;
    if (Math.abs(dx) < gap && A.y <= 40 && B.y <= 40 && A.st !== "ko" && B.st !== "ko") { const push = (gap - Math.abs(dx)) / 2 * (dx >= 0 ? 1 : -1); A.x = clamp(A.x - push, 40, AW - 40); B.x = clamp(B.x + push, 40, AW - 40); }
    // снаряды
    for (const p of projs) {
      p.t += sdt; p.x += p.vx * sdt;
      const tg = p.owner === A ? B : A;
      if (p.done || tg.st === "ko") continue;
      if (p.kind === "thread") {
        if (p.t > .65 && p.t < .85 && Math.abs(tg.x - p.x) < 26) { p.done = true; applyHit(p.owner, tg, p.dmg, p.kb, p.stun); }
        if (p.t > 1) p.done = true; continue;
      }
      if (p.kind === "beam") {
        if (p.t > .15 && p.t < .7 && (tg.x - p.x) * p.dir > 0 && !(tg.crouch && tg.y <= 0) && tg.y < 90) { p.done = true; applyHit(p.owner, tg, p.dmg, p.kb, p.stun); }
        if (p.t > .9) p.done = true; continue;
      }
      const ts = tg.d.s, top = tg.y + (tg.crouch && tg.y <= 0 ? 64 : 112) * ts;
      if (Math.abs(p.x - tg.x) < 22 * ts + 8 && p.h > tg.y && p.h < top) { p.done = true; applyHit(p.owner, tg, p.dmg, p.kb, p.stun, {launch:p.launch}); }
      for (const q of projs) if (q !== p && !q.done && q.owner !== p.owner && q.kind !== "thread" && q.kind !== "beam" && q.kind !== "wave" && p.kind !== "wave" && p.kind !== "griffin" && q.kind !== "griffin" && Math.abs(q.x - p.x) < 20) { p.done = q.done = true; spark(p.x, GY - p.h, "255,220,150", 10); }
      if (p.x < -100 || p.x > AW + 100) p.done = true;
    }
    projs = projs.filter(p => !p.done || (p.kind === "thread" && p.t < 1) || (p.kind === "beam" && p.t < .9));
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += 300 * dt; }
    parts = parts.filter(p => p.life > 0);
    A.shown = lerp(A.shown, A.hp, dt * 3); B.shown = lerp(B.shown, B.hp, dt * 3);
    const mid = (A.x + B.x) / 2; cam = lerp(cam, clamp(mid - VW / 2, 0, AW - VW), dt * 5);
  }
  function matchEnd(won){
    phase = "over";
    if (won) {
      try { sessionStorage.removeItem(keyFail); } catch(e) {}
      if (opt.onWin) opt.onWin(stage + 1);
      snd.win();
      if (stage === cfg.foes.length - 1 && cfg.finale) { phase = "finale"; phaseT = 0; finI = -1; nat = {x:cam - 40, tx:A.x - 70, ph:0}; A.st = "win"; A.face = -1; return; }
      ovEnd.hidden = false;
      ovEnd.innerHTML = `<div class="rn-big">Победа!</div><p>${F.win}</p><div class="rn-row">${cfg.foes[stage + 1] ? `<button class="rn-btn" data-act="next">Следующий бой →</button>` : ""}<button class="rn-btn rn-ghost" data-act="again">Ещё раз</button><button class="rn-btn rn-ghost" data-act="back">К роману</button></div>`;
    } else {
      fails++; try { sessionStorage.setItem(keyFail, fails); } catch(e) {}
      ovEnd.hidden = false;
      ovEnd.innerHTML = `<div class="rn-big">Поражение</div><p>${foe.name} оказался сильнее в этот раз. В следующей попытке противник будет чуть медленнее.</p><div class="rn-row"><button class="rn-btn" data-act="again">Реванш</button><button class="rn-btn rn-ghost" data-act="back">К роману</button></div>`;
    }
    const b = ovEnd.querySelector("button"); if (b) b.focus({preventScroll:true});
  }
  function showFinal(){
    ovEnd.hidden = false;
    ovEnd.innerHTML = `<div class="rn-big">Петербург свободен!</div><p>Луис победил всех противников. Дмитрий Петрович больше не держит город золотыми нитями.</p><div class="rn-row"><button class="rn-btn" data-act="again">Сыграть ещё</button><button class="rn-btn rn-ghost" data-act="back">К роману</button></div>`;
  }

  // ── отрисовка
  function speech(x, y, text){
    c.save(); c.font = "600 17px system-ui, -apple-system, Segoe UI, sans-serif";
    const words = text.split(" "), lines = []; let cur = "";
    for (const wd of words) { const tst = cur ? cur + " " + wd : wd; if (c.measureText(tst).width > Math.min(320, VW - 40) && cur) { lines.push(cur); cur = wd; } else cur = tst; }
    lines.push(cur);
    const w = Math.max(...lines.map(l => c.measureText(l).width)) + 26, h = lines.length * 22 + 14;
    const x0 = clamp(x - w / 2, 6, VW - w - 6), y0 = Math.max(46, y - h - 10);
    c.fillStyle = "rgba(0,0,0,.2)"; rrect(c, x0 + 2, y0 + 3, w, h, 10); c.fill();
    c.fillStyle = "#fffdf8"; rrect(c, x0, y0, w, h, 10); c.fill();
    const tx = clamp(x, x0 + 14, x0 + w - 14); c.beginPath(); c.moveTo(tx - 7, y0 + h - 1); c.lineTo(tx - 1, y0 + h + 9); c.lineTo(tx + 6, y0 + h - 1); c.fill();
    c.fillStyle = "#2a2018"; c.textBaseline = "top"; lines.forEach((l, i) => c.fillText(l, x0 + 13, y0 + 8 + i * 22));
    c.restore();
  }
  function bar(x, w, f, right){
    const y = 14, h = 16, frac = f.hp / f.d.hp, shown = f.shown / f.d.hp;
    c.fillStyle = "rgba(0,0,0,.45)"; rrect(c, x - 2, y - 2, w + 4, h + 4, 5); c.fill();
    c.fillStyle = "#5a1414"; c.fillRect(x, y, w, h);
    const dw = w * clamp(shown, 0, 1), fw = w * clamp(frac, 0, 1);
    c.fillStyle = "#f0d060"; right ? c.fillRect(x + w - dw, y, dw, h) : c.fillRect(x, y, dw, h);
    c.fillStyle = lg(c, 0, y, 0, y + h, frac > .3 ? ["#7cf08a", "#2fae4a"] : ["#ff7a6a", "#d23a2a"]); right ? c.fillRect(x + w - fw, y, fw, h) : c.fillRect(x, y, fw, h);
    c.fillStyle = "rgba(255,255,255,.3)"; c.fillRect(x, y + 1, w, 3);
    c.font = "700 13px system-ui, -apple-system, Segoe UI, sans-serif"; c.textBaseline = "top"; c.fillStyle = "#fff"; c.strokeStyle = "rgba(0,0,0,.6)"; c.lineWidth = 3;
    c.textAlign = right ? "right" : "left"; const nx = right ? x + w : x; c.strokeText(f.d.name, nx, y + h + 5); c.fillText(f.d.name, nx, y + h + 5);
    for (let i = 0; i < 2; i++) { const cx = right ? x + w - 8 - i * 16 - c.measureText(f.d.name).width - 14 : x + c.measureText(f.d.name).width + 16 + i * 16; ell(c, cx, y + h + 12, 5, 5, i < f.wins ? "#ffd34d" : "rgba(255,255,255,.25)"); }
    // шкала супера
    const my = H - 22, mw = Math.min(150, w * .6), mx = right ? x + w - mw : x;
    c.fillStyle = "rgba(0,0,0,.45)"; rrect(c, mx - 2, my - 2, mw + 4, 12, 4); c.fill();
    const full = f.meter >= 100;
    c.fillStyle = full ? `hsl(${(time * 200) % 360},90%,60%)` : "#4fb3ff"; c.fillRect(mx, my, mw * f.meter / 100, 8);
    c.font = "700 10px system-ui, sans-serif"; c.textAlign = right ? "right" : "left"; c.fillStyle = full ? "#ffe680" : "rgba(255,255,255,.75)"; c.fillText(full ? "СУПЕР ГОТОВ!" : "СУПЕР", right ? mx - 6 : mx + mw + 6, my - 1);
    c.textAlign = "left"; c.textBaseline = "alphabetic";
  }
  function render(){
    c.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    if (shake > 0) c.translate((Math.random() - .5) * 10 * shake, (Math.random() - .5) * 10 * shake);
    c.fillStyle = lg(c, 0, 0, 0, GY, T.sky); c.fillRect(-10, -10, VW + 20, H + 20);
    if (T.sun) { const sx = T.sun.x * VW - cam * .05; glow(c, sx, T.sun.y, T.sun.r * 4, T.sun.col, .55); ell(c, sx, T.sun.y, T.sun.r, T.sun.r, `rgba(${T.sun.col},1)`); }
    if (T.moon) { const mx = T.moon.x * VW - cam * .05; glow(c, mx, T.moon.y, T.moon.r * 6, "220,225,255", .3); ell(c, mx, T.moon.y, T.moon.r, T.moon.r, "#f3f0dc"); }
    const base = 300;
    for (const ly of layers) { if (ly.f >= 1) continue; const off = (((base + cam) * ly.f) % TW + TW) % TW; c.drawImage(ly.cv, -off, 0, TW, H); if (TW - off < VW) c.drawImage(ly.cv, TW - off, 0, TW, H); }
    T.ground(c, base + cam, VW + 2);
    for (const ly of layers) { if (ly.f < 1) continue; const off = ((base + cam) % TW + TW) % TW; c.drawImage(ly.cv, -off, 0, TW, H); if (TW - off < VW) c.drawImage(ly.cv, TW - off, 0, TW, H); }
    c.save(); c.translate(-cam, 0);
    // нити Дмитрия Петровича (метка и удар)
    for (const p of projs) if (p.kind === "thread") {
      if (p.t < .65) { c.strokeStyle = `rgba(255,210,90,${.4 + .4 * Math.sin(p.t * 30)})`; c.lineWidth = 2; c.beginPath(); c.ellipse(p.x, GY + 2, 30, 7, 0, 0, TAU); c.stroke(); c.strokeStyle = "rgba(255,210,90,.35)"; c.setLineDash([4, 6]); c.beginPath(); c.moveTo(p.x, 0); c.lineTo(p.x, GY); c.stroke(); c.setLineDash([]); }
      else { const a = 1 - clamp((p.t - .65) / .35, 0, 1); c.save(); c.globalCompositeOperation = "lighter"; const g = c.createLinearGradient(p.x - 26, 0, p.x + 26, 0); g.addColorStop(0, "rgba(255,200,80,0)"); g.addColorStop(.5, `rgba(255,236,160,${a})`); g.addColorStop(1, "rgba(255,200,80,0)"); c.fillStyle = g; c.fillRect(p.x - 26, 0, 52, GY + 4); c.restore(); }
    }
    // бойцы: атакующий поверх
    const order = A.mv ? [B, A] : [A, B];
    for (const f of order) drawFighter(c, f, time);
    if (nat) { const S = X.HEROES["rezonans-lyubvi"] ? X.HEROES["rezonans-lyubvi"](3) : null; const moving = nat.x < nat.tx - 1; drawNatalia(c, nat.x, GY, moving ? X.h.runPose(nat.ph) : X.POSES.idle, time, nat.ph, S); }
    for (const p of projs) {
      const y = GY - p.h;
      if (p.kind === "mandarin") { c.save(); c.translate(p.x, y); c.rotate(p.t * 14); drawMandarin(c, 0, 0, p.t, 8); c.restore(); glow(c, p.x, y, 20, "255,160,60", .3); for (let i = 1; i < 4; i++) ell(c, p.x - p.vx * .012 * i, y, 5 - i, 5 - i, `rgba(255,150,40,${.3 - i * .07})`); }
      else if (p.kind === "cuffs") { c.save(); c.translate(p.x, y); c.rotate(p.t * 16); c.strokeStyle = "#cfd4da"; c.lineWidth = 2.6; c.beginPath(); c.arc(-6, 0, 5, 0, TAU); c.stroke(); c.beginPath(); c.arc(6, 0, 5, 0, TAU); c.stroke(); c.lineWidth = 1.6; c.beginPath(); c.moveTo(-1, 0); c.lineTo(1, 0); c.stroke(); c.restore(); }
      else if (p.kind === "stone") { c.save(); c.translate(p.x, y); c.rotate(p.t * 5); c.fillStyle = lg(c, -14, -12, 14, 12, ["#b3ada6", "#7d7772"]); c.fillRect(-14, -11, 28, 22); c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(-14, 4, 28, 3); c.fillRect(-2, -11, 3, 22); c.restore(); }
      else if (p.kind === "wave") { c.save(); c.translate(p.x, GY); c.scale(p.vx > 0 ? 1 : -1, 1); c.fillStyle = "rgba(150,140,130,.75)"; c.beginPath(); c.moveTo(-40, 0); c.quadraticCurveTo(-10, -26 - Math.sin(p.t * 30) * 4, 14, 0); c.fill(); for (let i = 0; i < 5; i++) ell(c, -20 + i * 8, -6 - (i % 2) * 10, 4, 4, "rgba(120,110,100,.8)"); c.restore(); }
      else if (p.kind === "dart") { c.save(); c.translate(p.x, y); c.scale(p.vx > 0 ? 1 : -1, 1); c.strokeStyle = "#333"; c.lineWidth = 2; c.beginPath(); c.moveTo(-14, 0); c.lineTo(6, 0); c.stroke(); c.fillStyle = "#c22"; c.beginPath(); c.moveTo(-16, 0); c.lineTo(-22, -5); c.lineTo(-19, 0); c.lineTo(-22, 5); c.fill(); c.fillStyle = "#ccc"; c.beginPath(); c.moveTo(6, -1.5); c.lineTo(12, 0); c.lineTo(6, 1.5); c.fill(); c.restore(); }
      else if (p.kind === "griffin") { c.save(); c.translate(p.x, 0); if (p.vx > 0) c.scale(-1, 1); c.scale(1.4, 1.4); c.translate(-47, -GY * .4 / 1.4 * 0 - (GY * 1.4 - GY) / 1.4); X.OB.griffin.draw(c, 0, p.t * 1.6); c.restore(); glow(c, p.x, GY - 90, 70, "255,214,110", .4); }
      else if (p.kind === "beam") { const a = p.t < .15 ? p.t / .15 : 1 - clamp((p.t - .7) / .2, 0, 1); c.save(); c.globalCompositeOperation = "lighter"; const x0 = p.x, x1 = p.dir > 0 ? AW + 50 : -50; const g = c.createLinearGradient(0, y - 16, 0, y + 16); g.addColorStop(0, "rgba(255,200,80,0)"); g.addColorStop(.5, `rgba(255,240,170,${a})`); g.addColorStop(1, "rgba(255,200,80,0)"); c.fillStyle = g; c.fillRect(Math.min(x0, x1), y - 16, Math.abs(x1 - x0), 32); c.restore(); }
    }
    for (const p of parts) { c.globalAlpha = clamp(p.life / p.max, 0, 1); c.fillStyle = `rgb(${p.rgb})`; c.beginPath(); c.arc(p.x, p.y, p.s, 0, TAU); c.fill(); }
    c.globalAlpha = 1;
    for (const m of fx) if (m.kind === "flash") { glow(c, m.x, m.y, 40, m.rgb, m.t / .15 * .9); }
    c.restore();
    if (T.fx) T.fx(c, time, base + cam, VW);
    // реплики
    if (bubble) {
      const f = bubble.who === "nat" ? null : [A, B].find(q => q.id === bubble.who);
      const bx = f ? f.x - cam : nat ? nat.x - cam : VW / 2, by = f ? GY - f.y - 128 * f.d.s : GY - 108;
      speech(bx, by, bubble.text);
    }
    // HUD
    if (phase !== "ready" && A) {
      const bw = Math.min(250, VW * .38);
      bar(14, bw, A, false); bar(VW - 14 - bw, bw, B, true);
      c.font = "800 26px system-ui, -apple-system, Segoe UI, sans-serif"; c.textAlign = "center"; c.textBaseline = "top"; c.lineWidth = 4; c.strokeStyle = "rgba(0,0,0,.6)"; c.fillStyle = roundT < 10 ? "#ff8a7a" : "#fff";
      const tt = String(Math.ceil(roundT)); c.strokeText(tt, VW / 2, 10); c.fillText(tt, VW / 2, 10);
      for (const m of fx) if (m.kind === "combo") { c.font = "800 18px system-ui, sans-serif"; c.textAlign = m.x < VW / 2 ? "left" : "right"; c.fillStyle = `rgba(255,215,80,${Math.min(1, m.t * 2)})`; c.strokeText(`${m.n} удара!`.replace(/^([5-9]|\d\d) удара/, "$1 ударов"), m.x < VW / 2 ? 16 : VW - 16, 64); c.fillText(`${m.n} удара!`.replace(/^([5-9]|\d\d) удара/, "$1 ударов"), m.x < VW / 2 ? 16 : VW - 16, 64); }
      if (msg) {
        const a = Math.min(1, msg.t * 4), sc = msg.small ? 1 : 1 + Math.max(0, msg.t - (msg.t > .9 ? .9 : 0)) * .0;
        c.save(); c.globalAlpha = a; c.translate(VW / 2, H * .42); c.scale(sc, sc);
        c.font = `900 ${msg.small ? 34 : 54}px Georgia, serif`; c.textAlign = "center"; c.textBaseline = "middle"; c.lineWidth = 7; c.strokeStyle = "rgba(40,10,10,.85)"; c.strokeText(msg.text, 0, 0);
        c.fillStyle = lg(c, 0, -26, 0, 26, ["#fff4b0", "#ffb52e", "#e2561c"]); c.fillText(msg.text, 0, 0); c.restore();
      }
      c.textAlign = "left"; c.textBaseline = "alphabetic";
    }
  }

  // ── цикл и управление
  let last = performance.now(), raf = 0, paused = false;
  function frame(now){
    if (!document.body.contains(cv)) return cleanup();
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!paused) update(dt);
    render();
    raf = requestAnimationFrame(frame);
  }
  const KM = {ArrowLeft:"l", KeyA:"l", ArrowRight:"r", KeyD:"r", ArrowUp:"u", KeyW:"u", Space:"u", ArrowDown:"d", KeyS:"d"};
  const PM = {KeyJ:"p", KeyZ:"p", KeyK:"k", KeyX:"k", KeyL:"s", KeyC:"s", KeyI:"x", KeyV:"x"};
  const isTyping = e => e.target && e.target.closest && e.target.closest("input,textarea,select,[contenteditable]");
  function kd(e){
    if (isTyping(e)) return;
    if (e.code === "Escape" || e.code === "KeyP") { togglePause(); return; }
    const a = KM[e.code], b = PM[e.code]; if (!a && !b) return;
    e.preventDefault();
    if (phase === "ready" && !e.repeat && (e.code === "Space" || b)) { start(); return; }
    if (phase === "talk" && b && !e.repeat) { phaseT = 99; bubble = null; return; }
    if (a) inp[a] = true; if (b && !e.repeat) press[b] = true;
  }
  function ku(e){ const a = KM[e.code]; if (a) inp[a] = false; }
  function togglePause(){ if (phase !== "fight" && phase !== "paused") return; paused = !paused; phase = paused ? "paused" : "fight"; if (paused) { ovEnd.hidden = false; ovEnd.innerHTML = `<div class="rn-big">Пауза</div><button class="rn-btn" data-act="resume">Продолжить</button>`; } else { ovEnd.hidden = true; last = performance.now(); } }
  function vis(){ if (document.hidden && phase === "fight") togglePause(); }
  root.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (!b) return; const a = b.dataset.act;
    if (a === "go" || a === "again") { nat = null; start(); } else if (a === "resume") togglePause(); else if (a === "next") opt.onNext && opt.onNext(stage + 2); else if (a === "back") opt.onBack && opt.onBack(); });
  root.querySelectorAll(".fg-pad [data-k]").forEach(b => { const key = b.dataset.k, hold = "lrud".includes(key);
    const on = e => { e.preventDefault(); b.classList.add("on"); if (phase === "ready") { start(); return; } if (phase === "talk") { phaseT = 99; bubble = null; return; } if (hold) inp[key] = true; else press[key] = true; };
    const off = e => { e.preventDefault(); b.classList.remove("on"); if (hold) inp[key] = false; };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off); b.addEventListener("contextmenu", e => e.preventDefault()); });
  window.addEventListener("keydown", kd); window.addEventListener("keyup", ku); window.addEventListener("resize", size); document.addEventListener("visibilitychange", vis);
  function cleanup(){ cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("resize", size); document.removeEventListener("visibilitychange", vis); }
  A = mk(cfg.hero, AW / 2 - 110, 1); B = mk(F.id, AW / 2 + 110, -1); cam = AW / 2 - VW / 2;
  raf = requestAnimationFrame(frame);
  window.LitmirFight._debug = {get phase(){ return phase; }, get A(){ return A; }, get B(){ return B; }, start, fast(n){ for (let i = 0; i < n; i++) update(1 / 60); }, press, inp, ko(){ B.hp = 1; applyHit(A, B, 5, 100, .3, {unblock:true}); }, lose(){ A.hp = 1; applyHit(B, A, 5, 100, .3, {unblock:true}); }};
  return true;
}

/* стили (кнопки под игрой) */
if (!document.getElementById("fgCss")) { const st = document.createElement("style"); st.id = "fgCss"; st.textContent = `
.fg-vs{display:flex;align-items:center;gap:18px;font-family:var(--serif,Georgia,serif)}.fg-vs span{display:flex;flex-direction:column;align-items:center}.fg-vs b{font-size:clamp(18px,3vw,26px);font-weight:400}.fg-vs small{font:12px var(--sans,system-ui);opacity:.8}.fg-vs i{font:900 italic clamp(26px,5vw,40px) Georgia,serif;color:#ffb52e;text-shadow:0 2px 0 #7a1d0e}
.fg-pad{display:none;justify-content:space-between;gap:12px;margin-top:12px;touch-action:none;user-select:none;-webkit-user-select:none}
.fg-pad button{appearance:none;border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:14px;font:600 15px var(--sans,system-ui);touch-action:none;-webkit-tap-highlight-color:transparent}
.fg-pad button.on{background:var(--accent-soft);border-color:var(--accent)}
.fg-dpad{display:grid;grid-template-columns:repeat(2,58px);grid-template-rows:repeat(2,52px);gap:6px}
.fg-dpad [data-k=l]{grid-area:1/1/3/2}.fg-dpad [data-k=r]{grid-area:1/2/3/3}.fg-dpad{grid-template-columns:52px 52px 52px;grid-template-rows:48px 48px}.fg-dpad [data-k=l]{grid-area:1/1/3/2}.fg-dpad [data-k=u]{grid-area:1/2/2/3}.fg-dpad [data-k=d]{grid-area:2/2/3/3}.fg-dpad [data-k=r]{grid-area:1/3/3/4}
.fg-btns{display:grid;grid-template-columns:repeat(2,minmax(70px,1fr));gap:6px;flex:1;max-width:220px}.fg-btns button{min-height:48px}.fg-btns .fg-sup{background:linear-gradient(180deg,#ffd77a,#f2a93b);color:#2a1a10;border:0}
@media (pointer:coarse){.fg-pad{display:flex}}`; document.head.appendChild(st); }

window.LitmirFight = {mount, has(slug){ return !!FIGHTS[slug]; }, count(slug){ return FIGHTS[slug] ? FIGHTS[slug].foes.length : 0; },
  list(slug){ const f = FIGHTS[slug]; return f ? f.foes.map((q, i) => ({n:i + 1, id:q.id, name:CH[q.id].name, sub:CH[q.id].sub, place:q.place, theme:q.theme})) : []; }};
})();
