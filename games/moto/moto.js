/* «Погоня по Синее» — мини-игра по главе 10 романа «Грустный город».
   Франко уезжает на тайном мотоцикле отца, случайно встречает Кьяру, полиция простреливает ей колесо,
   она перепрыгивает к нему, и вдвоём они уходят от машин и вертолётов до старого тоннеля.
   Три этапа: 1) уйти от патрулей и не упустить Кьяру; 2) поравняться с ней, чтобы она перепрыгнула; 3) уйти вдвоём до тоннеля.
   Вид сверху, всё рисуется кодом. Подключается из index.html: window.LitmirMoto.mount(el, {sfx, onWin, next, back}). */
(function(){
"use strict";
const W = 360, H = 600, RL = 44, RR = 316, NL = 4, LW = (RR - RL) / NL, TAU = Math.PI * 2;
const L0 = 9000, L2 = 15000;                      // длина 1-го и 3-го этапов (в пикселях дороги)
const clamp = (v, a, b) => v < a ? a : v > b ? b : v, lerp = (a, b, t) => a + (b - a) * t;
const rnd = (a, b) => a + Math.random() * (b - a), pick = a => a[Math.floor(Math.random() * a.length)];
const laneX = i => RL + LW * (i + .5), laneOf = x => clamp(Math.floor((x - RL) / LW), 0, NL - 1);
const hsh = i => { let x = Math.sin(i * 127.1 + 311.7) * 43758.5453; return x - Math.floor(x); };
function rr(c, x, y, w, h, r){ r = Math.min(r, w / 2, h / 2); c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function glow(c, x, y, r, rgb, a){ const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
const overlap = (a, b) => Math.abs(a.x - b.x) * 2 < a.w + b.w && Math.abs(a.y - b.y) * 2 < a.h + b.h;

/* ───────── Тексты ───────── */
const F = "Франко", K = "Кьяра", SYS = "";
const STAGES = [
  {name:"Этап 1 · Тайный мотоцикл", goal:"Уйди от патрулей и не упусти Кьяру из виду"},
  {name:"Этап 2 · «Прыгай!»", goal:"Поравняйся с Кьярой и держись рядом"},
  {name:"Этап 3 · «Держись!»", goal:"Уходите вдвоём — ищи старый тоннель"}
];
const JOKES = [
  "Офицер, у вас мигалка мигает! А, это так задумано?",
  "Штраф за улыбку? Тогда я должен вам за весь город!",
  "Осторожно, господа, смех заразен!",
  "Догоните — расскажу анекдот целиком!",
  "Я бы остановился, но у меня пицца остывает!"
];
const CAR_COL = ["#6d7178", "#8a8f96", "#4d5560", "#7b6a58", "#5a6b62", "#9a958c", "#3e4652", "#8c6b5a", "#a39f97"];

/* ───────── Звук ───────── */
function makeSound(on){
  let ctx = null;
  const tone = (f, t0, d, type, g, f2) => { if (!on()) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); const s = ctx.currentTime + t0, o = ctx.createOscillator(), v = ctx.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d); v.gain.setValueAtTime(0, s); v.gain.linearRampToValueAtTime(g || .06, s + .01); v.gain.exponentialRampToValueAtTime(.0001, s + d); o.connect(v).connect(ctx.destination); o.start(s); o.stop(s + d + .05); } catch(e) {} };
  return {
    pick(){ tone(784, 0, .12, "triangle", .06); tone(1175, .06, .16, "sine", .04); },
    hit(){ tone(180, 0, .3, "sawtooth", .06, 70); },
    shot(){ tone(1400, 0, .06, "square", .05, 200); tone(1200, .18, .06, "square", .05, 180); },
    joke(){ [523, 659, 523, 784].forEach((f, i) => tone(f, i * .08, .14, "triangle", .05)); },
    siren(){ tone(700, 0, .35, "sine", .025, 950); tone(950, .35, .35, "sine", .025, 700); },
    jump(){ tone(330, 0, .3, "triangle", .06, 880); },
    win(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .1, .35, "triangle", .06)); },
    lose(){ [392, 330, 262].forEach((f, i) => tone(f, i * .16, .3, "triangle", .05)); }
  };
}

/* ───────── Рисунки (вид сверху) ───────── */
function carSprite(c, o, t, dusk){
  const w = o.w, h = o.h;
  c.save(); c.translate(o.x, o.y); if (o.rot) c.rotate(o.rot);
  c.fillStyle = "rgba(0,0,0,.35)"; rr(c, -w / 2 + 3, -h / 2 + 5, w, h, 9); c.fill();
  if (o.kind === "bus" || o.kind === "truck" || o.kind === "tram") return bigSprite(c, o, t), c.restore();
  const body = o.cop ? "#1c2740" : o.col;
  c.fillStyle = body; rr(c, -w / 2, -h / 2, w, h, 9); c.fill();
  if (o.cop) { c.fillStyle = "#e8e9ec"; c.fillRect(-w / 2 + 1, -6, w - 2, 14); c.fillStyle = "#2f6bd8"; c.fillRect(-w / 2 + 1, 2, w - 2, 3); }
  if (o.kind === "van") { c.fillStyle = "#e46d2c"; c.fillRect(-w / 2 + 1, -h / 2 + 30, w - 2, 6); }
  const g = c.createLinearGradient(-w / 2, 0, w / 2, 0); g.addColorStop(0, "rgba(255,255,255,.12)"); g.addColorStop(.5, "rgba(255,255,255,0)"); g.addColorStop(1, "rgba(0,0,0,.18)");
  c.fillStyle = g; rr(c, -w / 2, -h / 2, w, h, 9); c.fill();
  c.fillStyle = "#18202b"; rr(c, -w / 2 + 5, -h / 2 + 15, w - 10, 13, 4); c.fill();
  c.fillStyle = "rgba(180,210,255,.18)"; c.fillRect(-w / 2 + 8, -h / 2 + 17, w / 3, 3);
  if (o.kind !== "van") { c.fillStyle = o.cop ? "#2a3756" : "rgba(255,255,255,.1)"; rr(c, -w / 2 + 6, -h / 2 + 31, w - 12, h - 52, 5); c.fill(); }
  c.fillStyle = "#18202b"; rr(c, -w / 2 + 6, h / 2 - 18, w - 12, 9, 3); c.fill();
  c.fillStyle = "#2a2d33"; c.fillRect(-w / 2 - 3, -h / 2 + 20, 3, 5); c.fillRect(w / 2, -h / 2 + 20, 3, 5);
  c.fillStyle = "#fff3c8"; c.fillRect(-w / 2 + 3, -h / 2 + 1, 7, 3); c.fillRect(w / 2 - 10, -h / 2 + 1, 7, 3);
  c.fillStyle = "#e0333a"; c.fillRect(-w / 2 + 3, h / 2 - 4, 7, 3); c.fillRect(w / 2 - 10, h / 2 - 4, 7, 3);
  if (o.cop) {
    const fl = Math.floor(t * 8) % 2;
    c.fillStyle = "#111"; rr(c, -w / 2 + 6, -3, w - 12, 7, 2); c.fill();
    c.fillStyle = fl ? "#4aa3ff" : "#1b3a70"; rr(c, -w / 2 + 7, -2, (w - 14) / 2, 5, 2); c.fill();
    c.fillStyle = fl ? "#5a1c22" : "#ff4a55"; rr(c, 0, -2, (w - 14) / 2, 5, 2); c.fill();
  }
  c.restore();
}
function bigSprite(c, o){
  const w = o.w, h = o.h;
  if (o.kind === "bus") {
    c.fillStyle = "#b5753e"; rr(c, -w / 2, -h / 2, w, h, 8); c.fill();
    c.fillStyle = "#e9e4da"; rr(c, -w / 2 + 4, -h / 2 + 4, w - 8, h - 8, 6); c.fill();
    c.fillStyle = "#2a3340"; c.fillRect(-w / 2, -h / 2 + 22, 3, h - 34); c.fillRect(w / 2 - 3, -h / 2 + 22, 3, h - 34);
    c.fillStyle = "#c9c3b7"; for (let k = 0; k < 3; k++) rr(c, -10, -h / 2 + 30 + k * 36, 20, 16, 3), c.fill();
    c.fillStyle = "#18202b"; rr(c, -w / 2 + 4, -h / 2 + 2, w - 8, 10, 4); c.fill();
  } else if (o.kind === "truck") {
    c.fillStyle = "#566576"; rr(c, -w / 2 + 3, -h / 2, w - 6, 30, 7); c.fill();
    c.fillStyle = "#18202b"; rr(c, -w / 2 + 7, -h / 2 + 4, w - 14, 9, 3); c.fill();
    c.fillStyle = "#8d9298"; rr(c, -w / 2, -h / 2 + 34, w, h - 34, 3); c.fill();
    c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = 1.5; c.beginPath(); for (let y = -h / 2 + 44; y < h / 2; y += 10) { c.moveTo(-w / 2 + 2, y); c.lineTo(w / 2 - 2, y); } c.stroke();
  } else {
    c.fillStyle = "#9a3434"; rr(c, -w / 2, -h / 2, w, h, 10); c.fill();
    c.fillStyle = "#c9c2b4"; rr(c, -w / 2 + 5, -h / 2 + 6, w - 10, h - 12, 7); c.fill();
    c.fillStyle = "#2a3340"; c.fillRect(-w / 2, -h / 2 + 14, 3, h - 28); c.fillRect(w / 2 - 3, -h / 2 + 14, 3, h - 28);
    c.strokeStyle = "#333"; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, 0); c.lineTo(0, -16); c.lineTo(12, 0); c.lineTo(0, 16); c.closePath(); c.stroke();
    c.strokeStyle = "rgba(0,0,0,.25)"; c.beginPath(); c.moveTo(-w / 2, -h / 6); c.lineTo(w / 2, -h / 6); c.moveTo(-w / 2, h / 6); c.lineTo(w / 2, h / 6); c.stroke();
  }
}
function hair(c, x, y, t, len, col){
  c.strokeStyle = col; c.lineCap = "round";
  for (let k = -2; k <= 2; k++) {
    c.lineWidth = 2.6 - Math.abs(k) * .3; c.beginPath(); c.moveTo(x + k * 1.6, y + 2);
    c.quadraticCurveTo(x + k * 3 + Math.sin(t * 9 + k) * 3, y + len * .55, x + k * 4.5 + Math.sin(t * 7 + k * 1.3) * 6, y + len - Math.abs(k) * 3);
    c.stroke();
  }
}
function moto(c, x, y, o){
  c.save(); c.translate(x, y); c.rotate(o.tilt || 0);
  c.fillStyle = "rgba(0,0,0,.35)"; c.beginPath(); c.ellipse(3, 5, 11, 30, 0, 0, TAU); c.fill();
  c.fillStyle = "#0b0b0d"; rr(c, -4, 13, 8, 15, 3); c.fill(); rr(c, -3.5, -28, 7, 13, 3); c.fill();
  c.fillStyle = "#141519"; rr(c, -7, -18, 14, 36, 6); c.fill();
  c.fillStyle = "#24262d"; c.beginPath(); c.ellipse(0, -5, 6.5, 9, 0, 0, TAU); c.fill();
  c.fillStyle = "rgba(255,255,255,.35)"; c.fillRect(-1.2, -12, 1.4, 12);
  c.strokeStyle = "#9aa0a8"; c.lineWidth = 2; c.beginPath(); c.moveTo(-12, -15); c.lineTo(12, -15); c.stroke();
  c.fillStyle = "#ffeeb8"; c.beginPath(); c.arc(0, -27, 2.6, 0, TAU); c.fill();
  c.fillStyle = "#e3343c"; c.fillRect(-2.5, 26, 5, 2.5);
  if (o.flat) { c.fillStyle = "rgba(255,200,120,.8)"; for (let k = 0; k < 3; k++) c.fillRect(-6 + Math.random() * 12, 27 + Math.random() * 6, 2, 2); }
  const t = o.t || 0;
  if (o.pass) {   // Кьяра за спиной у Франко
    c.strokeStyle = "#1b1b20"; c.lineWidth = 4; c.lineCap = "round";
    c.beginPath(); c.moveTo(-9, 11); c.quadraticCurveTo(-12, 2, -6, -2); c.moveTo(9, 11); c.quadraticCurveTo(12, 2, 6, -2); c.stroke();
    c.fillStyle = "#1b1b20"; c.beginPath(); c.ellipse(0, 12, 10.5, 7, 0, 0, TAU); c.fill();
    hair(c, 0, 9, t, 34, "#6e3218");
    c.fillStyle = "#7b3a1c"; c.beginPath(); c.arc(0, 8, 5.3, 0, TAU); c.fill();
  }
  if (o.rider) {
    const jk = o.rider === "kiara" ? "#1b1b20" : "#4f5d3b", hc = o.rider === "kiara" ? "#7b3a1c" : "#e2c675";
    c.strokeStyle = jk; c.lineWidth = 4; c.lineCap = "round";
    c.beginPath(); c.moveTo(-9, 0); c.lineTo(-11, -14); c.moveTo(9, 0); c.lineTo(11, -14); c.stroke();
    c.fillStyle = jk; c.beginPath(); c.ellipse(0, 1, 12, 8, 0, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,255,255,.1)"; c.beginPath(); c.ellipse(-3, -1, 6, 4, 0, 0, TAU); c.fill();
    if (o.rider === "kiara") hair(c, 0, -3, t, 30, "#6e3218");
    else { c.strokeStyle = "#cdb060"; c.lineWidth = 2; c.beginPath(); for (let k = -1; k <= 1; k++) { c.moveTo(k * 2.5, -3); c.lineTo(k * 3 + Math.sin(t * 11 + k) * 1.5, 4); } c.stroke(); }
    c.fillStyle = hc; c.beginPath(); c.arc(0, -4, 5.8, 0, TAU); c.fill();
    c.fillStyle = "rgba(255,255,255,.25)"; c.beginPath(); c.arc(-1.8, -6, 2, 0, TAU); c.fill();
  }
  c.restore();
}
function binSprite(c, o){
  c.save(); c.translate(o.x, o.y);
  if (o.down) { c.rotate(o.rot); c.fillStyle = "#3d5a3e"; rr(c, -8, -12, 16, 24, 3); c.fill(); c.fillStyle = "#2a3d2b"; c.fillRect(-8, -12, 16, 4); }
  else { c.fillStyle = "rgba(0,0,0,.3)"; c.beginPath(); c.arc(2, 3, 10, 0, TAU); c.fill(); c.fillStyle = "#466b47"; c.beginPath(); c.arc(0, 0, 9.5, 0, TAU); c.fill(); c.fillStyle = "#355236"; c.beginPath(); c.arc(0, 0, 6, 0, TAU); c.fill(); c.strokeStyle = "#5f8a60"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(-6, 0); c.lineTo(6, 0); c.stroke(); }
  c.restore();
}
function smile(c, x, y, t, r){
  r = r || 9;
  glow(c, x, y, r * 2.4, "255,214,90", .35 + Math.sin(t * 5) * .1);
  c.fillStyle = "#ffd447"; c.beginPath(); c.arc(x, y, r, 0, TAU); c.fill();
  c.fillStyle = "#5a3a10"; c.beginPath(); c.arc(x - r * .35, y - r * .25, r * .13, 0, TAU); c.arc(x + r * .35, y - r * .25, r * .13, 0, TAU); c.fill();
  c.strokeStyle = "#5a3a10"; c.lineWidth = r * .16; c.lineCap = "round"; c.beginPath(); c.arc(x, y + r * .05, r * .5, .2 * Math.PI, .8 * Math.PI); c.stroke();
}
function heliSprite(c, h, t){
  c.save(); c.translate(h.x, h.y); c.rotate(h.rot);
  c.globalAlpha = .92;
  c.fillStyle = "#23272e"; c.beginPath(); c.ellipse(0, 0, 11, 20, 0, 0, TAU); c.fill();
  c.fillRect(-2, 14, 4, 30); c.fillRect(-7, 40, 14, 3);
  c.fillStyle = "#4b6f9a"; c.beginPath(); c.ellipse(0, -11, 7, 7, 0, 0, TAU); c.fill();
  c.strokeStyle = "rgba(200,205,215,.55)"; c.lineWidth = 3;
  const a = t * 30; c.beginPath(); for (let k = 0; k < 2; k++) { const ang = a + k * Math.PI / 2; c.moveTo(Math.cos(ang) * 34, Math.sin(ang) * 34); c.lineTo(-Math.cos(ang) * 34, -Math.sin(ang) * 34); } c.stroke();
  c.fillStyle = "rgba(200,205,215,.08)"; c.beginPath(); c.arc(0, 0, 34, 0, TAU); c.fill();
  c.fillStyle = Math.floor(t * 4) % 2 ? "#ff4a55" : "#4aa3ff"; c.beginPath(); c.arc(0, 44, 2, 0, TAU); c.fill();
  c.restore();
}

/* ───────── Игра ───────── */
function mount(el, opt){
  opt = opt || {};
  const snd = makeSound(() => !opt.sfx || opt.sfx.on());
  const cpKey = "moto:cp:" + (opt.slug || "grustnyj-gorod");
  let cp = 0; try { cp = +sessionStorage.getItem(cpKey) || 0; } catch(e) {}
  el.innerHTML = `
  <div class="mt">
    <div class="mt-head"><div class="mt-kick">Игра по главе 10 · «Грустный город»</div><h1>Погоня по Синее</h1></div>
    <div class="mt-stage">
      <canvas class="mt-cv" aria-label="Игра «Погоня по Синее»"></canvas>
      <div class="mt-ov mt-start">
        <div class="mt-big">Погоня по Синее</div>
        <p>Отец отдал Франко ключ от своего тайного мотоцикла. Полиция ищет его по всему городу, впереди вечерняя Синея — и встреча, которой он совсем не ждёт.</p>
        <ul class="mt-steps">${STAGES.map(s => `<li><b>${s.name}</b><br>${s.goal}</li>`).join("")}</ul>
        <div class="mt-row"><button class="mt-btn" data-act="go">Поехали!</button>${cp > 0 ? `<button class="mt-btn mt-ghost" data-act="cp">С этапа ${cp + 1}</button>` : ""}</div>
        <div class="mt-keys"><span><kbd>←</kbd><kbd>→</kbd><kbd>↑</kbd><kbd>↓</kbd> — руль, газ и тормоз</span><span><kbd>Пробел</kbd> — шутка</span><span class="mt-touch">Веди пальцем по экрану — мотоцикл поедет за ним</span></div>
      </div>
      <div class="mt-ov mt-end" hidden></div>
    </div>
    <div class="mt-pad"><button class="mt-joke" type="button" disabled>😄 Шутка <small>0/3</small></button></div>
    <p class="mt-note">Собирай смешинки: три смешинки — и Франко может пошутить. Полицейские в Синее отвыкли от шуток и на пару секунд теряются. Играть необязательно — роман можно читать и без игры.</p>
  </div>`;
  const root = el.querySelector(".mt"), stage = root.querySelector(".mt-stage"), cv = root.querySelector("canvas"), c = cv.getContext("2d");
  const ovStart = root.querySelector(".mt-start"), ovEnd = root.querySelector(".mt-end"), jokeBtn = root.querySelector(".mt-joke");
  let k = 1, dpr = 1;
  function size(){
    const avail = Math.min(root.clientWidth || 360, 460);
    let cw = avail, ch = cw * H / W;
    const maxH = Math.max(420, (window.innerHeight || 800) - 200);
    if (ch > maxH) { ch = maxH; cw = ch * W / H; }
    stage.style.width = cw + "px"; stage.style.height = ch + "px";
    dpr = Math.min(2, window.devicePixelRatio || 1); k = cw / W;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
  }
  size(); window.addEventListener("resize", size);

  /* ── состояние ── */
  let S = null, mode = "ready", tPrev = 0, clock = 0;
  const keys = {l:false, r:false, u:false, d:false};
  let drag = null;

  function fresh(stage){
    S = {stage, t:0, dist:0, world:0, st2:0, speed:0, hearts:3, inv:0, shake:0, flash:0,
      p:{x:laneX(1), y:H - 130, vx:0, vy:0, tilt:0}, cars:[], cops:[], items:[], bins:[], fx:[], walls:null, helis:[], beams:[],
      kiara:null, bub:null, q:[], joke:0, laugh:0, heat:0, banner:3, spawnC:.4, spawnI:1.2, lost:0, ev:0, smiles:0, rescue:null,
      withK:stage === 2, dusk:stage * .35, tunnel:false, crashes:0};
    if (stage >= 1) { S.helis = [newHeli(-1)]; S.beams = [newBeam()]; }
    if (stage === 1) setupRescue();
    if (stage === 2) { S.helis.push(newHeli(1)); S.beams.push(newBeam()); S.st2 = 0; spawnCop(true); }
    try { sessionStorage.setItem(cpKey, Math.max(cp, stage)); cp = Math.max(cp, stage); } catch(e) {}
  }
  function enterStage(n){
    S.stage = n; S.t = 0; S.dist = 0; S.banner = 3; S.ev = 0; S.hearts = Math.max(S.hearts, 2);
    if (n === 1) setupRescue();
    if (n === 2) { S.withK = true; S.kiara = null; S.st2 = S.world; if (S.helis.length < 2) { S.helis.push(newHeli(1)); S.beams.push(newBeam()); } spawnCop(true); }
    try { if (n > cp) { cp = n; sessionStorage.setItem(cpKey, n); } } catch(e) {}
  }
  function say(who, text){ const it = {who, text, t:Math.min(4.6, 1.4 + text.length * .045)}; if (!S.bub) S.bub = it; else S.q.push(it); }
  function newHeli(side){ return {x:side < 0 ? -60 : W + 60, y:60, tx:side < 0 ? 90 : 270, rot:side < 0 ? .5 : -.5, side}; }
  function newBeam(){ return {x:W / 2, y:120, r:44, ph:Math.random() * TAU}; }
  function setupRescue(){
    S.rescue = {t:0, flat:false, timer:10, bond:0, jump:null, done:false, fail:false};
    if (!S.kiara) S.kiara = {x:laneX(1), y:-40, ty:150, flat:false};
    S.kiara.ty = 150;
  }
  function spawnCop(behind){
    const lim = S.stage === 2 ? 2 : 1;
    if (S.cops.filter(o => o.st !== "crash").length >= lim) return;
    const x = clamp(S.p.x + rnd(-60, 60), RL + 24, RR - 24);
    S.cops.push({x, y:H + 90, w:40, h:74, v:S.speed + 90, st:S.stage === 1 ? "follow" : "chase", t:0, rams:0, dir:1, rot:0, cop:true, wob:Math.random() * 6});
    if (behind) snd.siren();
  }
  function spawnCar(kind){
    const busy = new Set(S.cars.filter(o => o.y < 150).map(o => laneOf(o.x)));
    if (busy.size >= NL - 1 && !kind) return;
    const free = [...Array(NL).keys()].filter(i => !S.cars.some(o => laneOf(o.x) === i && o.y < 70));
    if (!free.length) return;
    let lane = pick(free);
    if (S.walls) lane = clamp(lane, 1, 2);
    const kd = kind || (Math.random() < .12 ? "van" : "car");
    const dims = {car:[38, 68], van:[40, 78]}[kd];
    S.cars.push({kind:kd, x:laneX(lane), tx:laneX(lane), y:-80, w:dims[0], h:dims[1], v:S.speed * rnd(.38, .66), col:pick(CAR_COL)});
  }
  function spawnItem(){
    const lanes = [...Array(NL).keys()].filter(i => !S.cars.some(o => laneOf(o.x) === i && o.y < 120) && !S.bins.some(b => laneOf(b.x) === i && b.y < 60));
    if (!lanes.length) return;
    S.items.push({x:laneX(pick(lanes)) + rnd(-12, 12), y:-20, t:Math.random() * 5});
  }
  function sparks(x, y, n, col){ for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = 60 + Math.random() * 180; S.fx.push({x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, life:.5, max:.5, col:col || "255,190,90", s:1.5 + Math.random() * 2}); } }
  function hurt(){
    if (S.inv > 0 || mode !== "play") return;
    S.hearts--; S.inv = 1.7; S.shake = .35; S.flash = .25; snd.hit(); sparks(S.p.x, S.p.y - 10, 16);
    if (S.hearts <= 0) over("crash");
  }

  /* ── сценарий ── */
  const SCRIPT = [
    [ [.01, () => say(F, "Папа, кто же ты такой…")],
      [.2, () => say(SYS, "Собирай смешинки — они пригодятся")],
      [.3, () => { S.kiara = {x:RL + 14, y:H + 50, ty:120, enter:true}; snd.jump(); }],
      [.32, () => say(F, "Кьяра?..")],
      [.36, () => say(F, "Нет, нет, нет… Почему я вообще это делаю?")],
      [.5, () => say(F, "Потому что я дурак. Потому что это сильнее меня.")],
      [.62, () => { S.helis = [newHeli(-1)]; S.beams = [newBeam()]; say(SYS, "Над крышами — гул вертолётов"); }],
      [.66, () => say(F, "Ну конечно. А я-то надеялся, что сегодня мы больше не увидимся.")],
      [.72, () => { say(SYS, "Не попадай в луч прожектора!"); spawnCop(true); }] ],
    [],
    [ [.01, () => say(F, "Держись!")],
      [.05, () => say(K, "Нам нужно уйти от них! В нашем клубе есть предатель!")],
      [.11, () => say(F, "Отлично! Значит, за мной гонятся не только из-за меня!")],
      [.16, () => say(K, "Сейчас не время для шуток!")],
      [.21, () => { S.cars.push({kind:"van", x:-50, tx:-50, y:S.p.y - 420, w:40, h:78, v:0, vx:190, rot:Math.PI / 2, col:"#d8d6d0", cross:true}); say(SYS, "Фургон доставки!"); }],
      [.25, () => say(K, "Франко! Только не говори, что у тебя нет плана!")],
      [.3, () => say(F, "У меня отличный план! Сначала не умереть. Потом всё остальное!")],
      [.35, () => { const l = Math.floor(rnd(0, NL - 1)); for (let i = 0; i < 5; i++) S.bins.push({x:laneX(l) + rnd(-20, LW + 20), y:-20 - i * 34 - rnd(0, 20)}); }],
      [.4, () => say(F, "А где твой парень?")],
      [.43, () => say(K, "Какой ещё парень?")],
      [.455, () => S.cars.push({kind:"tram", x:laneX(1), tx:laneX(1), y:-120, w:44, h:190, v:S.speed * .5, lock:true})],
      [.47, () => say(K, "Если ты видел рыжего высокого парня, то это мой брат!")],
      [.52, () => say(F, "Брат?..")],
      [.56, () => say(K, "Его забрали! Сначала уйдём отсюда — потом вытащим брата.")],
      [.66, () => { const v = S.speed * .55;
          S.cars.push({kind:"bus", x:laneX(1) - 14, tx:laneX(1) - 14, y:-110, w:52, h:150, v, lock:true});
          S.cars.push({kind:"truck", x:laneX(2) + 14, tx:laneX(2) + 14, y:-100, w:52, h:132, v, lock:true});
          S.cars.push({kind:"car", x:laneX(0), tx:laneX(0), y:-70, w:38, h:68, v, col:pick(CAR_COL), lock:true});
          S.cars.push({kind:"car", x:laneX(3), tx:laneX(3), y:-90, w:38, h:68, v, col:pick(CAR_COL), lock:true});
          say(SYS, "Проскочи между автобусом и грузовиком!"); }],
      [.75, () => say(K, "Ты умеешь водить как сумасшедший!")],
      [.79, () => say(F, "Спасибо! Это лучшее, что я слышал за сегодня!")],
      [.86, () => say(SYS, "Впереди старый тоннель — ныряй в него!")],
      [.9, () => { S.walls = {y:-60, l:RL + LW * 1.1, r:RL + LW * 2.9}; }] ]
  ];

  /* ── обновление ── */
  function update(dt){
    S.t += dt; clock += dt;
    const p = S.p, st = S.stage;
    const target = st === 0 ? lerp(250, 300, S.dist / L0) : st === 1 ? 270 : lerp(300, 345, S.dist / L2);
    S.speed = lerp(S.speed || target, target, Math.min(1, dt * 2));
    if (S.tunnel) S.speed = lerp(S.speed, 240, dt);
    S.dist += S.speed * dt; S.world += S.speed * dt;
    S.dusk = clamp(st === 0 ? S.dist / L0 * .45 : st === 1 ? .5 : .55 + S.dist / L2 * .45, 0, 1);
    if (S.banner > 0) S.banner -= dt;
    if (S.inv > 0) S.inv -= dt; if (S.shake > 0) S.shake -= dt; if (S.flash > 0) S.flash -= dt;
    if (S.laugh > 0) S.laugh -= dt;
    if (S.bub) { S.bub.t -= dt * (S.q.length > 2 ? 1.6 : 1); if (S.bub.t <= 0) S.bub = S.q.shift() || null; }

    const sc = SCRIPT[st], frac = st === 0 ? S.dist / L0 : S.dist / L2;
    while (S.ev < sc.length && frac >= sc[S.ev][0]) sc[S.ev++][1]();

    // игрок
    let ax = 0, ay = 0;
    if (drag) { ax = clamp((drag.x - p.x) * 9, -340, 340); ay = clamp((drag.y - 70 - p.y) * 6, -280, 280); }
    else { ax = ((keys.r ? 1 : 0) - (keys.l ? 1 : 0)) * 250; ay = ((keys.d ? 1 : 0) - (keys.u ? 1 : 0)) * 200; }
    p.vx = lerp(p.vx, ax, Math.min(1, dt * 10)); p.vy = lerp(p.vy, ay, Math.min(1, dt * 8));
    p.x += p.vx * dt; p.y += p.vy * dt;
    let minX = RL + 12, maxX = RR - 12;
    if (S.tunnel) { minX = S.walls.l + 12; maxX = S.walls.r - 12; }
    p.x = clamp(p.x, minX, maxX); p.y = clamp(p.y, 190, H - 56);
    p.tilt = lerp(p.tilt, p.vx / 340 * .38, Math.min(1, dt * 10));
    const pr = {x:p.x, y:p.y + (S.withK ? 3 : 0), w:15, h:S.withK ? 48 : 42};

    // машины
    S.spawnC -= dt;
    const carsOn = st === 0 || (st === 2 && frac < .86);
    if (S.spawnC <= 0) { S.spawnC = rnd(.65, 1.25) * (st === 2 ? .85 : 1); if (carsOn) spawnCar(); }
    for (const o of S.cars) {
      if (o.cross) { o.x += o.vx * dt; }
      else {
        if (!o.lock && Math.random() < dt * .08) { const nl = clamp(laneOf(o.x) + (Math.random() < .5 ? -1 : 1), 0, NL - 1); if (!S.cars.some(q => q !== o && laneOf(q.x) === nl && Math.abs(q.y - o.y) < 110)) o.tx = laneX(nl); }
        if (S.walls && !o.lock) { const l = laneOf(o.tx); if (l === 0) o.tx = laneX(1); if (l === 3) o.tx = laneX(2); }
        o.x = lerp(o.x, o.tx, Math.min(1, dt * 1.6));
      }
      o.y += (S.speed - o.v) * dt;
      if (mode === "play" && overlap(pr, {x:o.x, y:o.y, w:o.rot ? o.h - 8 : o.w - 6, h:o.rot ? o.w - 6 : o.h - 8})) hurt();
    }
    S.cars = S.cars.filter(o => o.y < H + 220 && o.x > -120 && o.x < W + 120);

    // мусорные баки
    for (const b of S.bins) {
      b.y += S.speed * dt; if (b.down) { b.x += b.vx * dt; b.vx *= .96; }
      if (!b.down && mode === "play" && overlap(pr, {x:b.x, y:b.y, w:15, h:15})) { b.down = true; b.rot = rnd(-1.5, 1.5); b.vx = rnd(-60, 60); hurt(); }
    }
    S.bins = S.bins.filter(b => b.y < H + 40);

    // смешинки
    S.spawnI -= dt;
    if (S.spawnI <= 0) { S.spawnI = rnd(2, 3.4); if (st !== 1 && !S.walls) spawnItem(); }
    for (const it of S.items) {
      it.y += S.speed * dt; it.t += dt;
      if (!it.got && Math.hypot(it.x - p.x, it.y - p.y) < 22) { it.got = true; S.smiles++; if (S.joke < 3) S.joke++; snd.pick(); sparks(it.x, it.y, 10, "255,220,100"); }
    }
    S.items = S.items.filter(it => !it.got && it.y < H + 30);

    // полиция
    for (const o of S.cops) {
      o.t += dt;
      if (o.st === "crash") { o.rot += o.spin * dt; o.v = lerp(o.v, 0, dt * 2); o.y += (S.speed - o.v) * dt; continue; }
      if (S.laugh > 0) { o.v = S.speed - 110; o.x += Math.sin(o.t * 8 + o.wob) * 40 * dt; }
      else if (o.st === "follow") { o.v = o.y > p.y + 150 ? S.speed + 40 : S.speed; o.x = lerp(o.x, p.x, dt * .8); }
      else if (o.st === "chase") {
        o.v = o.y > p.y + 30 ? S.speed + 85 : o.y < p.y - 60 ? S.speed - 50 : S.speed + 10;
        const side = o.x < p.x ? -1 : 1, d = p.x + side * 50 - o.x;
        o.x += Math.sign(d) * Math.min(Math.abs(d), 95 * dt);
        if (Math.abs(o.y - p.y) < 34 && o.t > 1) { o.st = "ram"; o.t = 0; o.dir = Math.sign(p.x - o.x) || 1; o.rams++; }
      } else if (o.st === "ram") {
        o.x += o.dir * 175 * dt; o.v = S.speed + 5;
        if (o.t > .55) { o.st = o.rams >= 3 ? "leave" : "back"; o.t = 0; }
      } else if (o.st === "back") { o.v = S.speed - 70; if (o.t > 1.2) { o.st = "chase"; o.t = 0; } }
      else if (o.st === "leave") o.v = S.speed - 120;
      o.x = clamp(o.x, RL + 22, RR - 22);
      o.y += (S.speed - o.v) * dt;
      const orr = {x:o.x, y:o.y, w:o.w - 6, h:o.h - 8};
      for (const q of S.cars) if (overlap(orr, {x:q.x, y:q.y, w:q.rot ? q.h : q.w, h:q.rot ? q.w : q.h})) { crashCop(o); break; }
      if (o.st !== "crash") for (const b of S.bins) if (!b.down && overlap(orr, {x:b.x, y:b.y, w:16, h:16})) { b.down = true; b.rot = rnd(-1.5, 1.5); b.vx = rnd(-120, 120); sparks(b.x, b.y, 6, "160,200,160"); o.v -= 60; }
      if (o.st !== "crash" && S.walls && wallHit(orr)) crashCop(o);
      if (o.st !== "crash" && mode === "play" && overlap(pr, orr)) { hurt(); if (o.st === "ram") { o.st = "back"; o.t = 0; } }
    }
    for (let i = 0; i < S.cops.length; i++) for (let j = i + 1; j < S.cops.length; j++) {
      const a = S.cops[i], q = S.cops[j]; if (a.st === "crash" || q.st === "crash") continue;
      if (Math.abs(a.x - q.x) < 44 && Math.abs(a.y - q.y) < 80) { const d = a.x < q.x ? -1 : 1; a.x = clamp(a.x + d * 80 * dt, RL + 22, RR - 22); q.x = clamp(q.x - d * 80 * dt, RL + 22, RR - 22); if (Math.abs(a.x - q.x) < 20) q.y += 90 * dt; }
    }
    S.cops = S.cops.filter(o => o.y < H + 160 && o.y > -200);
    if (st === 0 && frac > .72 && frac < .95 && Math.random() < dt * .08) spawnCop(true);
    if (st === 2 && frac < .86 && Math.random() < dt * .3) spawnCop(Math.random() < .5);

    // вертолёты и прожекторы
    S.helis.forEach((h, i) => { const b = S.beams[i]; if (!b) { h.y -= 70 * dt; h.x += h.side * 30 * dt; return; } h.x = lerp(h.x, b.x + h.side * 40, dt * .9); h.y = lerp(h.y, Math.max(40, b.y - 110), dt * .9); h.rot = Math.sin(clock * .7 + i) * .3 + h.side * .25; });
    let lit = false;
    S.beams.forEach((b, i) => {
      b.ph += dt;
      const tx = p.x + Math.sin(b.ph * 1.1 + i * 2) * 85, ty = p.y - 30 + Math.cos(b.ph * .8 + i) * 110;
      b.x = lerp(b.x, tx, dt * (st === 2 ? 1.05 : .85)); b.y = lerp(b.y, ty, dt * .8);
      if (S.laugh <= 0 && !S.tunnel && Math.hypot((p.x - b.x) / 1.1, p.y - b.y) < b.r) lit = true;
    });
    S.lit = lit;
    if (S.beams.length && !S.tunnel) {
      S.heat = clamp(S.heat + (lit ? dt * .65 : -dt * .22), 0, 1);
      if (S.heat >= 1) { S.heat = .3; say(SYS, "Нас засекли!"); if (st !== 1) spawnCop(true); else hurt(); }
    }

    // Кьяра впереди (этап 1)
    const kk = S.kiara;
    if (kk && st === 0) {
      if (kk.enter) { kk.y -= (S.speed * .9) * dt; kk.x = lerp(kk.x, laneX(1), dt * .8); if (kk.y < 180) kk.enter = false; }
      else {
        const gap = p.y - kk.y;
        if (gap > 320) { kk.y -= 75 * dt; S.warn = true; } else { kk.y = lerp(kk.y, 115 + Math.sin(clock * .9) * 18, dt * 1.2); S.warn = false; }
        let best = laneOf(kk.x), bestD = -1;
        for (let l = 0; l < NL; l++) { const ahead = S.cars.filter(o => laneOf(o.x) === l && o.y < kk.y + 50 && o.y > kk.y - 260); const d = ahead.length ? Math.min(...ahead.map(o => kk.y - o.y)) : 999; const sc2 = d - Math.abs(l - laneOf(kk.x)) * 40; if (sc2 > bestD) { bestD = sc2; best = l; } }
        kk.x = lerp(kk.x, laneX(best), dt * 2.2);
        if (kk.y < -30) { S.lost += dt; if (S.lost > 2.2) { S.lost = 0; kk.y = 60; say(F, "Где она?! А, вот…"); hurt(); } } else S.lost = 0;
      }
      if (frac >= 1 && !kk.enter) enterStage(1);
    } else if (st === 0 && frac >= 1) enterStage(1);

    // спасение (этап 2)
    if (S.stage === 1) rescue(dt);

    // тоннель (этап 3)
    if (S.walls) {
      S.walls.y += S.speed * dt;
      if (!S.tunnel && mode === "play" && wallHit(pr)) { hurt(); p.x = clamp(p.x, S.walls.l + 14, S.walls.r - 14); }
      if (!S.tunnel && S.walls.y > p.y + 10) { S.tunnel = true; S.beams = []; S.heat = 0; }
      if (S.tunnel && S.walls.y > p.y + 300 && mode === "play") win();
    }

    for (const f of S.fx) { f.x += f.vx * dt; f.y += f.vy * dt + S.speed * dt * .5; f.life -= dt; }
    S.fx = S.fx.filter(f => f.life > 0);
    jokeUI();
  }
  function wallHit(r){ const w = S.walls; if (!w) return false; const top = w.y - 26, bot = w.y; return r.y + r.h / 2 > top && r.y - r.h / 2 < bot && (r.x - r.w / 2 < w.l || r.x + r.w / 2 > w.r); }
  function crashCop(o){ o.st = "crash"; o.spin = rnd(-5, 5); sparks(o.x, o.y, 18); S.crashes++; if (S.crashes === 1 || Math.random() < .4) say(SYS, pick(["Полицейская машина не вписалась!", "Минус одна мигалка!", "Грохот — и сирена отстала"])); }
  function rescue(dt){
    const R = S.rescue, kk = S.kiara, p = S.p; R.t += dt;
    if (!kk) return;
    if (kk.enter || kk.y < 0) { kk.enter = false; kk.y = lerp(kk.y, 150, dt * 2); }
    if (R.t > .2 && R.ev === undefined) { R.ev = 0; say(K, "Франко?!"); if (!S.cops.length) spawnCop(false); S.cops.forEach(o => { if (o.st !== "crash") o.st = "follow"; }); }
    if (R.t > 1.3 && !R.flat) { R.flat = true; kk.flat = true; snd.shot(); S.flash = .15; sparks(kk.x, kk.y + 26, 14); say(K, "Чёрт!"); say(F, "Прыгай! На мой мото!"); say(K, "Ты с ума сошёл!"); say(F, "Да! Но это сейчас не главная проблема! Быстро!"); }
    if (R.jump) {
      R.jump.t += dt;
      const j = R.jump, a = clamp(j.t / .7, 0, 1);
      j.x = lerp(j.x0, p.x, a); j.y = lerp(j.y0, p.y + 11, a) - Math.sin(a * Math.PI) * 26;
      kk.y += S.speed * .6 * dt; kk.x += 40 * dt; kk.rot = (kk.rot || 0) + dt * 3;
      if (j.t > .7 && !R.done) { R.done = true; S.withK = true; sparks(kk.x, kk.y, 20); say(F, "Держись!"); S.banner = 0; setTimeout(() => { if (S && S.rescue === R && S.stage === 1 && mode === "play") enterStage(2); }, 600); }
      return;
    }
    if (R.flat) {
      R.timer -= dt;
      kk.ty = lerp(kk.ty, 330, dt * .12);
      kk.y = lerp(kk.y, kk.ty, dt * 1.2);
      kk.x += (15 + Math.sin(R.t * 5) * 30) * dt;
      kk.wob = Math.sin(R.t * 11) * .25;
      if (Math.random() < dt * 8) sparks(kk.x, kk.y + 26, 2);
      const dx = Math.abs(p.x - kk.x), dy = Math.abs(p.y - kk.y);
      R.near = dx > 24 && dx < 68 && dy < 36;
      R.bond = R.near ? R.bond + dt : Math.max(0, R.bond - dt * .5);
      if (R.bond >= 1.3) { R.jump = {t:0, x0:kk.x, y0:kk.y, x:kk.x, y:kk.y}; snd.jump(); }
      else if ((R.timer <= 0 || kk.x > RR - 16) && mode === "play") { sparks(kk.x, kk.y, 30); snd.hit(); over("kiara"); }
    } else { kk.y = lerp(kk.y, 150, dt * 1.5); kk.x = lerp(kk.x, laneX(1), dt); }
  }
  function jokeUI(){
    const ready = S && S.joke >= 3 && mode === "play";
    jokeBtn.disabled = !ready; jokeBtn.classList.toggle("ready", ready);
    jokeBtn.querySelector("small").textContent = (S ? S.joke : 0) + "/3";
  }
  function doJoke(){
    if (!S || S.joke < 3 || mode !== "play") return;
    S.joke = 0; S.laugh = 3.2; S.heat = Math.max(0, S.heat - .5); snd.joke();
    S.bub = {who:F, text:pick(JOKES), t:2.6}; S.q = S.q.slice(-2);
    S.q.unshift({who:SYS, text:"Полицейские растерялись!", t:1.6});
    S.cops.forEach(o => { if (o.st === "ram") { o.st = "back"; o.t = 0; } });
  }

  /* ── рисование ── */
  function segAt(wd){
    if (S.stage < 2) return "street";
    const f = (wd - S.st2) / L2;
    if (S.walls && wd > S.world + (H - S.walls.y) + 4) return "tunnel";
    if (f > .42 && f < .6) return "tram";
    if (f >= .6 && f < .72) return "bridge";
    if (f >= .78 && f < .84) return "over";
    return "street";
  }
  function drawWorld(){
    const T = 20, i0 = Math.floor(S.world / T), i1 = Math.floor((S.world + H) / T) + 1;
    const dusk = S.dusk;
    c.fillStyle = "#2b2d33"; c.fillRect(RL, 0, RR - RL, H);
    for (let i = i0; i <= i1; i++) {
      const y = H - ((i + 1) * T - S.world), kind = segAt(i * T + T / 2);
      if (kind === "tunnel") {
        c.fillStyle = "#16171b"; c.fillRect(0, y, W, T + 1);
        c.fillStyle = "#24252b"; c.fillRect(S.walls.l, y, S.walls.r - S.walls.l, T + 1);
        c.fillStyle = "#3a3b42"; c.fillRect(S.walls.l - 6, y, 6, T + 1); c.fillRect(S.walls.r, y, 6, T + 1);
        continue;
      }
      if (kind === "bridge") {
        c.fillStyle = "#18283a"; c.fillRect(0, y, RL - 6, T + 1); c.fillRect(RR + 6, y, W - RR - 6, T + 1);
        if (hsh(i) < .5) { c.fillStyle = "rgba(160,190,230,.18)"; c.fillRect(hsh(i * 3) * (RL - 20), y + 6, 14, 2); c.fillRect(RR + 10 + hsh(i * 5) * 20, y + 12, 12, 2); }
        c.fillStyle = "#6c6f78"; c.fillRect(RL - 6, y, 6, T + 1); c.fillRect(RR, y, 6, T + 1);
        if (i % 3 === 0) { c.fillStyle = "#9a9da5"; c.fillRect(RL - 7, y, 8, 3); c.fillRect(RR - 1, y, 8, 3); }
      } else {
        const blk = Math.floor(i / 9), roof = 70 + Math.floor(hsh(blk) * 30);
        const rc = `rgb(${roof},${roof - 2},${roof + 4})`;
        c.fillStyle = rc; c.fillRect(0, y, RL - 14, T + 1); c.fillStyle = `rgb(${roof - 6},${roof - 6},${roof - 2})`; c.fillRect(RR + 14, y, W - RR - 14, T + 1);
        if (i % 9 === 0) { c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(0, y + T - 3, RL - 14, 3); c.fillRect(RR + 14, y + T - 3, W - RR - 14, 3); }
        if (hsh(i * 7) < .18) { c.fillStyle = "#555860"; c.fillRect(6 + hsh(i) * 12, y + 4, 8, 8); }
        if (hsh(i * 11) < .18) { c.fillStyle = "#585a62"; c.fillRect(RR + 20 + hsh(i * 2) * 12, y + 5, 9, 7); }
        if (hsh(i * 13) < .12 && dusk > .3) { c.fillStyle = `rgba(255,205,120,${dusk * .7})`; c.fillRect(4 + hsh(i * 17) * 18, y + 9, 6, 4); }
        c.fillStyle = "#77746d"; c.fillRect(RL - 14, y, 14, T + 1); c.fillRect(RR, y, 14, T + 1);
        c.fillStyle = "#8d8a82"; c.fillRect(RL - 3, y, 3, T + 1); c.fillRect(RR, y, 3, T + 1);
        if (i % 26 === 5) poster(c, i % 2 ? 2 : RR + 16, y - 6);
      }
      if (kind === "tram") { c.fillStyle = "#8f949c"; c.fillRect(laneX(1) - 11, y, 2, T + 1); c.fillRect(laneX(1) + 9, y, 2, T + 1); }
    }
    // разметка
    c.fillStyle = "rgba(235,232,220,.75)";
    for (let i = i0 - 2; i <= i1; i++) {
      const wd = i * T; if (segAt(wd) === "tunnel") continue;
      const y = H - (wd - S.world);
      if (((wd % 60) + 60) % 60 < 30) for (let l = 1; l < NL; l++) c.fillRect(RL + LW * l - 1, y, 2, T);
      c.fillRect(RL + 4, y, 2, T + 1); c.fillRect(RR - 6, y, 2, T + 1);
    }
    // тень эстакады
    for (let i = i0; i <= i1; i++) { if (segAt(i * T) !== "over") continue; const y = H - ((i + 1) * T - S.world); c.fillStyle = "rgba(0,0,0,.42)"; c.fillRect(0, y, W, T + 1); if (i % 8 === 0) { c.fillStyle = "#4a4c53"; c.fillRect(RL - 12, y, 10, 16); c.fillRect(RR + 2, y, 10, 16); } }
    // фонари
    if (dusk > .15) {
      c.globalCompositeOperation = "lighter";
      for (let i = i0 - 4; i <= i1 + 4; i++) {
        if (i % 9 !== 0) continue; const kind = segAt(i * T); const y = H - (i * T - S.world);
        if (kind === "tunnel") { glow(c, S.walls.l + 4, y, 40, "255,170,80", .45); glow(c, S.walls.r - 4, y + 90, 40, "255,170,80", .45); continue; }
        if (kind === "bridge" || kind === "over") continue;
        const a = clamp((dusk - .15) * 1.2, 0, .55);
        glow(c, RL - 2, y, 56, "255,200,120", a); glow(c, RR + 2, y + 90, 56, "255,200,120", a);
        c.fillStyle = `rgba(255,210,140,${a * .25})`; c.fillRect(RL + 6, y + 10, 4, 60); c.fillRect(RR - 10, y + 100, 4, 60);
      }
      c.globalCompositeOperation = "source-over";
      for (let i = i0 - 4; i <= i1 + 4; i++) { if (i % 9 !== 0) continue; const kind = segAt(i * T); if (kind !== "street" && kind !== "tram") continue; const y = H - (i * T - S.world); c.fillStyle = "#2e2f34"; c.beginPath(); c.arc(RL - 4, y, 3, 0, TAU); c.arc(RR + 4, y + 90, 3, 0, TAU); c.fill(); }
    }
  }
  function poster(c, x, y){
    c.fillStyle = "#3a3c44"; c.fillRect(x, y, 26, 30);
    c.strokeStyle = "#c9c4b8"; c.lineWidth = 1.5; c.beginPath(); c.arc(x + 13, y + 15, 9, 0, TAU); c.stroke();
    c.beginPath(); c.arc(x + 13, y + 21, 5, 1.15 * Math.PI, 1.85 * Math.PI); c.stroke();
    c.strokeStyle = "#d24a4a"; c.beginPath(); c.moveTo(x + 6, y + 8); c.lineTo(x + 20, y + 22); c.stroke();
  }
  function drawWalls(){
    const w = S.walls; if (!w) return;
    const y = w.y;
    c.fillStyle = "#4b4c53"; c.fillRect(0, y - 26, w.l, 26); c.fillRect(w.r, y - 26, W - w.r, 26);
    c.save(); c.beginPath(); c.rect(0, y - 6, w.l, 6); c.rect(w.r, y - 6, W - w.r, 6); c.clip();
    for (let x = -10; x < W; x += 12) { c.fillStyle = (Math.floor(x / 12) % 2) ? "#f2c13a" : "#1d1d1f"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6, y - 6); c.lineTo(x + 12, y - 6); c.lineTo(x + 6, y); c.fill(); }
    c.restore();
    c.fillStyle = "#5b5c64"; c.fillRect(w.l - 8, y - 30, 8, 30); c.fillRect(w.r, y - 30, 8, 30);
  }
  function drawLights(){
    c.globalCompositeOperation = "lighter";
    const a = .12 + S.dusk * .3;
    const cone = (x, y, len, wid, al) => { const g = c.createLinearGradient(x, y, x, y - len); g.addColorStop(0, `rgba(255,236,180,${al})`); g.addColorStop(1, "rgba(255,236,180,0)"); c.fillStyle = g; c.beginPath(); c.moveTo(x - 3, y); c.lineTo(x - wid, y - len); c.lineTo(x + wid, y - len); c.lineTo(x + 3, y); c.fill(); };
    for (const o of S.cars) if (!o.rot) { cone(o.x - o.w / 2 + 6, o.y - o.h / 2, 70, 14, a * .8); cone(o.x + o.w / 2 - 6, o.y - o.h / 2, 70, 14, a * .8); glow(c, o.x, o.y + o.h / 2, 22, "255,40,40", a * .6); }
    for (const o of S.cops) if (o.st !== "crash") {
      cone(o.x, o.y - o.h / 2, 80, 22, a);
      const fl = Math.floor(clock * 8) % 2;
      glow(c, o.x - 6, o.y, 70, fl ? "70,150,255" : "255,60,70", .32);
      c.fillStyle = fl ? "rgba(70,150,255,.12)" : "rgba(255,60,70,.12)"; c.fillRect(o.x - 18, o.y + o.h / 2, 36, 70);
    }
    const p = S.p; cone(p.x, p.y - 28, 120, 22, .22 + S.dusk * .3);
    if (S.kiara && !S.withK) cone(S.kiara.x, S.kiara.y - 28, 100, 18, .2 + S.dusk * .25);
    c.globalCompositeOperation = "source-over";
  }
  function drawBeams(){
    if (!S.beams.length) return;
    c.globalCompositeOperation = "lighter";
    S.beams.forEach((b, i) => {
      const h = S.helis[i], dim = S.laugh > 0 ? .35 : 1;
      if (h) { c.fillStyle = `rgba(230,240,255,${.06 * dim})`; c.beginPath(); c.moveTo(h.x - 3, h.y); c.lineTo(b.x - b.r, b.y); c.lineTo(b.x + b.r, b.y); c.lineTo(h.x + 3, h.y); c.fill(); }
      const g = c.createRadialGradient(b.x, b.y, 0, b.x, b.y, b.r * 1.15);
      g.addColorStop(0, `rgba(235,242,255,${.42 * dim})`); g.addColorStop(.75, `rgba(220,232,255,${.22 * dim})`); g.addColorStop(1, "rgba(220,232,255,0)");
      c.fillStyle = g; c.beginPath(); c.ellipse(b.x, b.y, b.r * 1.25, b.r * 1.1, 0, 0, TAU); c.fill();
    });
    c.globalCompositeOperation = "source-over";
  }
  function heart(x, y, on){
    c.fillStyle = on ? "#ff5a6a" : "rgba(255,255,255,.18)";
    c.beginPath(); c.moveTo(x, y + 4); c.bezierCurveTo(x - 9, y - 3, x - 5, y - 10, x, y - 5); c.bezierCurveTo(x + 5, y - 10, x + 9, y - 3, x, y + 4); c.fill();
  }
  function drawHUD(){
    const st = S.stage;
    c.fillStyle = "rgba(10,12,20,.55)"; rr(c, 6, 6, W - 12, 30, 10); c.fill();
    for (let i = 0; i < 3; i++) heart(22 + i * 20, 22, i < S.hearts);
    for (let i = 0; i < 3; i++) { if (i < S.joke) smile(c, W - 66 + i * 20, 21, clock, 7); else { c.strokeStyle = "rgba(255,255,255,.3)"; c.lineWidth = 1.5; c.beginPath(); c.arc(W - 66 + i * 20, 21, 7, 0, TAU); c.stroke(); } }
    const bx = 86, bw = W - 186;
    let f = st === 0 ? S.dist / L0 : st === 1 ? (S.rescue ? clamp(S.rescue.bond / 1.3, 0, 1) : 0) : S.dist / L2;
    c.fillStyle = "rgba(255,255,255,.15)"; rr(c, bx, 17, bw, 8, 4); c.fill();
    c.fillStyle = st === 1 ? "#7fd18b" : "#ffd36e"; rr(c, bx, 17, Math.max(8, bw * clamp(f, 0, 1)), 8, 4); c.fill();
    c.fillStyle = "rgba(255,255,255,.85)"; c.font = "600 9px system-ui, sans-serif"; c.textAlign = "center";
    c.fillText(st === 1 ? "РЯДОМ С КЬЯРОЙ" : "ЭТАП " + (st + 1) + " ИЗ 3", bx + bw / 2, 14);
    if (S.beams.length && !S.tunnel) {
      c.fillStyle = "rgba(10,12,20,.55)"; rr(c, bx, 40, bw, 14, 7); c.fill();
      c.fillStyle = S.heat > .7 ? "#ff5a6a" : "#9fb6e8"; rr(c, bx + 2, 42, Math.max(4, (bw - 4) * S.heat), 10, 5); c.fill();
      c.fillStyle = "#fff"; c.font = "600 8px system-ui, sans-serif"; c.fillText(S.lit ? "ПРОЖЕКТОР! УХОДИ ИЗ ЛУЧА" : "ПРОЖЕКТОР", bx + bw / 2, 50);
    }
    if (st === 1 && S.rescue && S.rescue.flat && !S.rescue.jump) {
      const R = S.rescue; c.fillStyle = R.timer < 3 ? "#ff6a6a" : "#fff"; c.font = "700 13px system-ui, sans-serif";
      c.fillText(Math.max(0, R.timer).toFixed(1) + " c", W / 2, 72);
    }
    if (S.warn && st === 0) {
      const a = .6 + Math.sin(clock * 10) * .4; c.fillStyle = `rgba(255,211,110,${a})`; c.font = "700 13px system-ui, sans-serif";
      c.fillText("▲ Не отставай от Кьяры!", W / 2, 76);
    }
    c.textAlign = "left";
  }
  function wrap(text, maxW){ const words = text.split(" "), lines = []; let cur = ""; for (const w of words) { const t2 = cur ? cur + " " + w : w; if (c.measureText(t2).width > maxW && cur) { lines.push(cur); cur = w; } else cur = t2; } if (cur) lines.push(cur); return lines; }
  function drawBubble(){
    const b = S.bub; if (!b) return;
    c.font = "600 13px system-ui, sans-serif";
    const name = b.who ? b.who + ": " : "", maxW = W - 44;
    const lines = wrap(name + b.text, maxW), h = 14 + lines.length * 17, y = H - 20 - h;
    const a = clamp(b.t * 4, 0, 1);
    c.globalAlpha = a; c.fillStyle = "rgba(12,14,22,.78)"; rr(c, 12, y, W - 24, h, 10); c.fill();
    c.fillStyle = b.who === F ? "#a9cf7f" : b.who === K ? "#f0a774" : "#ffd36e"; c.fillRect(12, y + 8, 3, h - 16);
    lines.forEach((ln, i) => {
      const yy = y + 21 + i * 17;
      if (i === 0 && name) { c.fillStyle = b.who === F ? "#a9cf7f" : "#f0a774"; c.fillText(name, 22, yy); const w0 = c.measureText(name).width; c.fillStyle = "#f4f1ea"; c.fillText(ln.slice(name.length), 22 + w0, yy); }
      else { c.fillStyle = b.who ? "#f4f1ea" : "#ffd36e"; c.fillText(ln, 22, yy); }
    });
    c.globalAlpha = 1;
  }
  function drawBanner(){
    if (S.banner <= 0) return;
    const s = STAGES[S.stage], a = clamp(S.banner, 0, 1) * clamp((3 - S.banner) * 3, 0, 1);
    c.globalAlpha = a; c.fillStyle = "rgba(10,12,20,.7)"; rr(c, 24, H / 2 - 64, W - 48, 74, 14); c.fill();
    c.textAlign = "center"; c.fillStyle = "#ffd36e"; c.font = "700 17px Georgia, serif"; c.fillText(s.name, W / 2, H / 2 - 34);
    c.fillStyle = "#f4f1ea"; c.font = "13px system-ui, sans-serif"; c.fillText(s.goal, W / 2, H / 2 - 12);
    c.textAlign = "left"; c.globalAlpha = 1;
  }
  function draw(){
    c.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    if (!S) { c.fillStyle = "#1a1c24"; c.fillRect(0, 0, W, H); return; }
    c.save();
    if (S.shake > 0) c.translate((Math.random() - .5) * 8 * S.shake / .35, (Math.random() - .5) * 8 * S.shake / .35);
    drawWorld();
    for (const it of S.items) smile(c, it.x, it.y, it.t);
    for (const b of S.bins) binSprite(c, b);
    drawWalls();
    drawLights();
    for (const o of S.cars) carSprite(c, o, clock, S.dusk);
    const kk = S.kiara, R = S.rescue;
    if (kk && !(S.stage === 2)) {
      if (S.stage === 1 && R && R.flat && !R.jump) {
        const pulse = .5 + Math.sin(clock * 6) * .3;
        c.strokeStyle = R.near ? `rgba(127,209,139,${pulse + .2})` : `rgba(255,211,110,${pulse})`; c.lineWidth = 2; c.setLineDash([5, 5]);
        for (const s of [-1, 1]) { const gx = kk.x + s * 46; if (gx > RL + 8 && gx < RR - 8) { c.beginPath(); c.ellipse(gx, kk.y, 14, 30, 0, 0, TAU); c.stroke(); } }
        c.setLineDash([]);
      }
      const jumping = R && R.jump;
      c.save(); if (kk.rot) { c.translate(kk.x, kk.y); c.rotate(kk.rot); c.translate(-kk.x, -kk.y); }
      moto(c, kk.x, kk.y, {rider:jumping ? null : "kiara", tilt:kk.wob || 0, t:clock, flat:kk.flat});
      c.restore();
      if (jumping && !R.done) { c.save(); c.translate(R.jump.x, R.jump.y); const s2 = 1 + Math.sin(clamp(R.jump.t / .7, 0, 1) * Math.PI) * .3; c.scale(s2, s2); c.fillStyle = "#1b1b20"; c.beginPath(); c.ellipse(0, 0, 10, 7, 0, 0, TAU); c.fill(); hair(c, 0, -2, clock, 26, "#6e3218"); c.fillStyle = "#7b3a1c"; c.beginPath(); c.arc(0, -3, 5.3, 0, TAU); c.fill(); c.restore(); }
    }
    const p = S.p;
    if (!(S.inv > 0 && Math.floor(clock * 14) % 2)) moto(c, p.x, p.y, {rider:"franco", pass:S.withK, tilt:p.tilt, t:clock});
    for (const o of S.cops) carSprite(c, o, clock, S.dusk);
    drawBeams();
    for (const f of S.fx) { c.fillStyle = `rgba(${f.col},${f.life / f.max})`; c.fillRect(f.x, f.y, f.s, f.s); }
    for (const h of S.helis) heliSprite(c, h, clock);
    // сумерки и туннель
    const g = c.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, `rgba(255,140,70,${.16 * (1 - S.dusk)})`); g.addColorStop(.5, `rgba(120,80,120,${.08 * (1 - S.dusk)})`); g.addColorStop(1, "rgba(0,0,0,0)");
    c.fillStyle = g; c.fillRect(0, 0, W, H);
    c.fillStyle = `rgba(8,12,34,${.08 + S.dusk * .3})`; c.fillRect(0, 0, W, H);
    if (S.laugh > 0) { c.fillStyle = `rgba(255,220,120,${Math.min(.12, S.laugh * .05)})`; c.fillRect(0, 0, W, H); }
    if (S.flash > 0) { c.fillStyle = `rgba(255,255,255,${S.flash * 1.6})`; c.fillRect(0, 0, W, H); }
    c.restore();
    drawHUD(); drawBanner(); drawBubble();
  }

  /* ── экраны ── */
  function start(stage){
    fresh(stage); mode = "play"; ovStart.hidden = true; ovEnd.hidden = true; jokeUI();
    const box = root.querySelector(".mt-stage").getBoundingClientRect();
    const bar = document.querySelector(".reader-bar") || document.querySelector("header.top"), off = bar ? Math.min(140, bar.getBoundingClientRect().bottom) + 6 : 10;
    if (Math.abs(box.top - off) > 4) try { window.scrollTo({top:window.scrollY + box.top - off, behavior:"smooth"}); } catch(e) {}
  }
  function over(why){
    mode = "over"; snd.lose(); jokeUI();
    const st = S.stage;
    const txt = why === "kiara"
      ? `<div class="mt-big">Кьяра не удержалась…</div><p>Мотоцикл с простреленным колесом занесло к бордюру. Подъезжай к ней сбоку — слева или справа — и держись рядом, пока полоска не заполнится.</p>`
      : `<div class="mt-big">Погоня не удалась</div><p>${st === 0 ? "Франко не ушёл от патрулей." : "Полиция всё-таки прижала мотоцикл."} Объезжай машины, уходи из луча прожектора и не забывай про шутки — полицейские в Синее от них теряются.</p>`;
    ovEnd.innerHTML = `${txt}<div class="mt-row"><button class="mt-btn" data-act="retry">Ещё раз — этап ${st + 1}</button>${st > 0 ? `<button class="mt-btn mt-ghost" data-act="go">С самого начала</button>` : ""}</div>`;
    ovEnd.hidden = false;
  }
  function win(){
    mode = "win"; snd.win(); jokeUI();
    try { sessionStorage.removeItem(cpKey); } catch(e) {} cp = 0;
    if (opt.onWin) opt.onWin();
    ovEnd.innerHTML = `<div class="mt-big">Оторвались!</div>
      <p class="mt-q">— Кажется… оторвались, — выдохнула Кьяра.<br>— Пока да. Но давай не будем сообщать об этом слишком громко. В этом городе даже стены могут настучать мэру.</p>
      <p>Тоннель вывел их в другой квартал, и сирены остались далеко позади. Смешинок собрано: <b>${S.smiles}</b>. Сердец осталось: <b>${S.hearts}</b> из 3.</p>
      <div class="mt-row">${opt.next ? `<a class="mt-btn" href="${opt.next}">Читать дальше →</a>` : ""}<button class="mt-btn mt-ghost" data-act="go">Сыграть ещё раз</button>${opt.back ? `<button class="mt-btn mt-ghost" data-act="back">К роману</button>` : ""}</div>`;
    ovEnd.hidden = false;
  }
  root.addEventListener("click", e => {
    const b = e.target.closest("[data-act]"); if (!b) return;
    const a = b.dataset.act;
    if (a === "go") start(0); else if (a === "cp") start(cp); else if (a === "retry") start(S ? S.stage : 0); else if (a === "back" && opt.back) opt.back();
  });
  jokeBtn.addEventListener("click", doJoke);

  /* ── управление ── */
  const KEYS = {ArrowLeft:"l", KeyA:"l", ArrowRight:"r", KeyD:"r", ArrowUp:"u", KeyW:"u", ArrowDown:"d", KeyS:"d"};
  function kd(e){
    if (!cv.isConnected) return cleanup();
    if (mode !== "play") { if ((e.code === "Enter" || e.code === "Space") && !ovStart.hidden && !e.target.closest("button,a,input,textarea")) { e.preventDefault(); start(0); } return; }
    const m = KEYS[e.code]; if (m) { keys[m] = true; drag = null; e.preventDefault(); }
    if (e.code === "Space") { e.preventDefault(); doJoke(); }
  }
  function ku(e){ const m = KEYS[e.code]; if (m) keys[m] = false; }
  const toV = e => { const r = cv.getBoundingClientRect(); return {x:(e.clientX - r.left) / r.width * W, y:(e.clientY - r.top) / r.height * H}; };
  cv.addEventListener("pointerdown", e => { if (mode !== "play") return; drag = toV(e); try { cv.setPointerCapture(e.pointerId); } catch(_) {} e.preventDefault(); });
  cv.addEventListener("pointermove", e => { if (drag) drag = toV(e); });
  const up = () => { drag = null; };
  cv.addEventListener("pointerup", up); cv.addEventListener("pointercancel", up);
  window.addEventListener("keydown", kd); window.addEventListener("keyup", ku);
  function cleanup(){ window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("resize", size); }

  root.__moto = () => S;   // для проверки игры из консоли
  /* ── цикл ── */
  fresh(0); S.banner = 0;
  function frame(now){
    if (!cv.isConnected) return cleanup();
    const dt = Math.min(.05, ((now - tPrev) / 1000) || 0); tPrev = now;
    if (mode === "play") update(dt);
    else if (mode === "ready") { clock += dt; S.world += 120 * dt; S.dist = 0; S.dusk = .2; }
    else clock += dt;
    draw();
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(t => { tPrev = t; frame(t); });
  return true;
}

window.LitmirMoto = {mount};
})();
