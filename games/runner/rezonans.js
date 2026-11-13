/* «Резонанс любви» — уровни раннера «Бегущая Наталья» по роману (по одному на каждые 5 глав).
   Главная тайна игры — питерский поребрик: Наталья о него спотыкается, ругается, и город отвечает ей холодным ветром,
   как в первой главе. В конце каждого уровня она прибегает к героям романа, и они коротко договаривают сцену.
   Подключается после runner.js и пользуется его расширениями (LitmirRunner.ext). Графика рисуется кодом. */
(function(){
"use strict";
const X = window.LitmirRunner && window.LitmirRunner.ext; if (!X) return;
const {H, GY, TW, TAU, clamp, lerp, hash, lg, glow, rrect, ell, cloud} = X.h;
const SLUG = "rezonans-lyubvi";

/* ───────── Петербург: фасады и силуэты ───────── */
function spbFacade(c, r, x, w, h, col, o){
  o = o || {};
  const GY = o.base || X.h.GY;   // нижний край фасада (для дальнего берега — выше дорожки)
  const top = GY - h, trim = o.trim || "#f4efe4";
  c.fillStyle = col; c.fillRect(x, top, w, h);
  // руст первого этажа
  c.fillStyle = "rgba(0,0,0,.1)"; c.fillRect(x, GY - 46, w, 46);
  c.strokeStyle = "rgba(0,0,0,.1)"; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(x, GY - 44 + k * 11); c.lineTo(x + w, GY - 44 + k * 11); } c.stroke();
  // карниз
  c.fillStyle = trim; c.fillRect(x - 3, top - 2, w + 6, 6); c.fillStyle = "rgba(0,0,0,.18)"; c.fillRect(x - 3, top + 4, w + 6, 3);
  c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(x - 2, GY - 50, w + 4, 4);
  // пилястры
  if (o.pil !== false && w > 120) { c.fillStyle = "rgba(255,255,255,.22)"; for (let k = 0; k <= 2; k++) c.fillRect(x + 6 + k * (w - 18) / 2, top + 8, 6, h - 58); }
  // окна
  const cols = Math.max(2, Math.floor(w / 30)), rows = Math.max(2, Math.floor((h - 70) / 40)), cw = (w - 20) / cols;
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const wx = x + 10 + i * cw + (cw - 12) / 2, wy = top + 16 + j * 40;
    const lit = o.night && r() < (o.lit || .4);
    c.fillStyle = trim; c.fillRect(wx - 2, wy - 2, 16, 26);
    c.fillStyle = lit ? "#ffd889" : (o.glass || "#4c5f72"); c.fillRect(wx, wy, 12, 22);
    if (lit) glow(c, wx + 6, wy + 11, 22, "255,206,120", .22);
    c.fillStyle = "rgba(255,255,255,.25)"; c.fillRect(wx + 5.5, wy, 1, 22);
    if (j === 0 && i % 2 === 0) { c.fillStyle = trim; c.beginPath(); c.moveTo(wx - 4, wy - 4); c.lineTo(wx + 6, wy - 11); c.lineTo(wx + 16, wy - 4); c.fill(); }
    else { c.fillStyle = trim; c.fillRect(wx - 4, wy - 6, 20, 3); }
  }
  // витрины и парадная
  c.fillStyle = o.night ? "#1b1d2e" : "#3e4a55";
  for (let k = 0; k < Math.floor(w / 46); k++) { const sx = x + 8 + k * 46; rrect(c, sx, GY - 38, 30, 34, 13); c.fill(); }
  if (o.night) { c.fillStyle = "rgba(255,210,130,.5)"; c.fillRect(x + 12, GY - 30, 22, 20); }
}
function lamp(c, x, col, on){
  c.fillStyle = col; c.fillRect(x - 1.6, GY - 92, 3.2, 92); c.fillRect(x - 6, GY - 4, 12, 4);
  c.strokeStyle = col; c.lineWidth = 2; c.beginPath(); c.moveTo(x, GY - 86); c.quadraticCurveTo(x + 10, GY - 96, x + 14, GY - 88); c.moveTo(x, GY - 86); c.quadraticCurveTo(x - 10, GY - 96, x - 14, GY - 88); c.stroke();
  for (const dx of [-14, 14]) { c.fillStyle = on ? "#ffe2a0" : "#dfe6ea"; rrect(c, x + dx - 4, GY - 88, 8, 10, 2); c.fill(); if (on) glow(c, x + dx, GY - 83, 26, "255,214,140", .45); }
}
function isaac(c, x, b, col, gold){
  c.fillStyle = col; c.fillRect(x - 60, b - 40, 120, 40); c.fillRect(x - 30, b - 70, 60, 30);
  for (let k = 0; k < 8; k++) c.fillRect(x - 28 + k * 8, b - 66, 3, 26);
  c.fillStyle = gold; c.beginPath(); c.ellipse(x, b - 70, 30, 30, 0, Math.PI, TAU); c.fill(); c.fillRect(x - 3, b - 112, 6, 14); ell(c, x, b - 114, 4, 4, gold);
}
function adm(c, x, b, col, gold){
  c.fillStyle = col; c.fillRect(x - 80, b - 30, 160, 30); c.fillRect(x - 16, b - 62, 32, 32); c.fillRect(x - 10, b - 76, 20, 14);
  c.fillStyle = gold; c.beginPath(); c.moveTo(x - 4, b - 76); c.lineTo(x, b - 168); c.lineTo(x + 4, b - 76); c.fill();
  c.strokeStyle = gold; c.lineWidth = 1; c.beginPath(); c.moveTo(x, b - 168); c.lineTo(x, b - 176); c.stroke(); c.fillRect(x - 4, b - 178, 8, 3);
}
function kazan(c, x, b, col){
  c.fillStyle = col; c.fillRect(x - 24, b - 56, 48, 26); c.beginPath(); c.ellipse(x, b - 56, 24, 22, 0, Math.PI, TAU); c.fill(); c.fillRect(x - 2, b - 90, 4, 14);
  for (let side of [-1, 1]) { c.beginPath(); c.moveTo(x + side * 26, b - 30); c.quadraticCurveTo(x + side * 80, b - 44, x + side * 130, b - 20); c.lineTo(x + side * 130, b); c.lineTo(x + side * 26, b); c.fill(); }
  c.fillRect(x - 40, b - 34, 80, 34);
}
function onions(c, x, b, dark){
  const cs = dark ? ["#3d4a6e", "#5a4a76", "#3e5e64", "#6b5a3a", "#4b5576"] : ["#4b76b9", "#d8a33c", "#4f9a7a", "#c94f5a", "#e6e1d0"];
  c.fillStyle = dark ? "#5e5470" : "#b9706a"; c.fillRect(x - 40, b - 60, 80, 60); c.fillRect(x - 14, b - 104, 28, 44);
  const dm = [[-30, -60, 9, 0], [30, -60, 9, 2], [-14, -78, 11, 3], [16, -82, 10, 4], [0, -104, 13, 1]];
  for (const [dx, dy, rr, k] of dm) {
    c.fillStyle = dark ? "#4f4766" : "#a75f5a"; c.fillRect(x + dx - rr * .55, b + dy, rr * 1.1, 12);
    c.fillStyle = cs[k]; c.beginPath(); c.moveTo(x + dx, b + dy - rr * 2.4); c.bezierCurveTo(x + dx + rr * 1.6, b + dy - rr * 1.3, x + dx + rr * 1.2, b + dy, x + dx, b + dy); c.bezierCurveTo(x + dx - rr * 1.2, b + dy, x + dx - rr * 1.6, b + dy - rr * 1.3, x + dx, b + dy - rr * 2.4); c.fill();
    if (!dark) { c.strokeStyle = "rgba(255,255,255,.45)"; c.lineWidth = 1.4; c.beginPath(); c.moveTo(x + dx - rr * .6, b + dy - rr * .5); c.quadraticCurveTo(x + dx, b + dy - rr * 1.8, x + dx + rr * .6, b + dy - rr * .5); c.stroke(); }
    c.fillStyle = dark ? "#8a7a55" : "#e8c35a"; c.fillRect(x + dx - .8, b + dy - rr * 2.4 - 8, 1.6, 8); c.fillRect(x + dx - 3, b + dy - rr * 2.4 - 6, 6, 1.4);
  }
}
function peterPaul(c, x, b, col, gold){
  c.fillStyle = col; c.fillRect(x - 260, b - 16, 520, 16); c.fillRect(x - 40, b - 40, 70, 24); c.fillRect(x - 10, b - 64, 22, 24); c.fillRect(x - 6, b - 80, 14, 16);
  c.fillStyle = gold; c.beginPath(); c.moveTo(x - 4, b - 80); c.lineTo(x + 1, b - 190); c.lineTo(x + 6, b - 80); c.fill();
  c.fillStyle = gold; c.fillRect(x - 3, b - 196, 8, 2); ell(c, x + 1, b - 199, 2.4, 2.4, gold);
}
function rostral(c, x, b, col, red){
  c.fillStyle = col; c.fillRect(x - 10, b - 14, 20, 14);
  c.fillStyle = red; c.fillRect(x - 5, b - 92, 10, 78);
  for (let k = 0; k < 4; k++) { c.fillRect(x - 11, b - 30 - k * 17, 22, 4); c.beginPath(); c.moveTo(x + 11, b - 30 - k * 17); c.lineTo(x + 16, b - 33 - k * 17); c.lineTo(x + 11, b - 26 - k * 17); c.fill(); }
  c.fillStyle = col; c.fillRect(x - 8, b - 98, 16, 6);
}
function singer(c, x, b, col, glass, gold){
  c.fillStyle = col; c.fillRect(x - 70, b - 150, 140, 150);
  c.fillRect(x - 22, b - 176, 44, 26);
  c.fillStyle = glass; c.beginPath(); c.moveTo(x - 20, b - 176); c.quadraticCurveTo(x - 18, b - 214, x, b - 222); c.quadraticCurveTo(x + 18, b - 214, x + 20, b - 176); c.fill();
  c.strokeStyle = "rgba(255,255,255,.35)"; c.lineWidth = 1; c.beginPath(); for (let k = -2; k <= 2; k++) { c.moveTo(x + k * 7, b - 176); c.quadraticCurveTo(x + k * 3, b - 205, x, b - 222); } c.stroke();
  ell(c, x, b - 232, 11, 11, gold); c.strokeStyle = "rgba(90,60,20,.6)"; c.beginPath(); c.ellipse(x, b - 232, 11, 4, 0, 0, TAU); c.moveTo(x, b - 243); c.lineTo(x, b - 221); c.stroke();
  c.fillStyle = "rgba(0,0,0,.18)"; for (let i = 0; i < 6; i++) for (let j = 0; j < 4; j++) c.fillRect(x - 60 + i * 21, b - 136 + j * 32, 12, 20);
}
function horse(c, x, b, col){
  // Аничков мост: укротитель и вздыбленный конь на постаменте
  c.fillStyle = "#8b8f93"; c.fillRect(x - 26, b - 26, 52, 26); c.fillStyle = "#a3a7ab"; c.fillRect(x - 30, b - 30, 60, 6);
  c.fillStyle = col;
  c.beginPath(); c.ellipse(x + 2, b - 54, 22, 11, -.5, 0, TAU); c.fill();
  c.beginPath(); c.moveTo(x + 16, b - 66); c.quadraticCurveTo(x + 26, b - 88, x + 34, b - 92); c.lineTo(x + 40, b - 86); c.quadraticCurveTo(x + 30, b - 78, x + 24, b - 62); c.fill();
  c.lineWidth = 4; c.strokeStyle = col; c.lineCap = "round"; c.beginPath(); c.moveTo(x + 16, b - 58); c.lineTo(x + 28, b - 70); c.lineTo(x + 34, b - 64); c.moveTo(x + 10, b - 52); c.lineTo(x + 22, b - 58); c.moveTo(x - 14, b - 46); c.lineTo(x - 18, b - 30); c.moveTo(x - 8, b - 44); c.lineTo(x - 4, b - 30); c.stroke();
  c.beginPath(); c.moveTo(x - 18, b - 54); c.quadraticCurveTo(x - 32, b - 50, x - 30, b - 36); c.stroke();
  // укротитель
  c.lineWidth = 4; c.beginPath(); c.moveTo(x - 6, b - 30); c.lineTo(x - 10, b - 50); c.lineTo(x - 2, b - 66); c.moveTo(x - 4, b - 62); c.lineTo(x + 18, b - 70); c.stroke(); ell(c, x - 1, b - 72, 4, 4, col);
}
function drawbridge(c, x, b, col){
  c.fillStyle = col; c.fillRect(x - 160, b - 12, 120, 12); c.fillRect(x + 40, b - 12, 120, 12);
  c.save(); c.translate(x - 40, b - 10); c.rotate(-1.05); c.fillRect(0, -6, 46, 8); c.restore();
  c.save(); c.translate(x + 40, b - 10); c.rotate(1.05 + Math.PI); c.fillRect(0, -2, 46, 8); c.restore();
  for (const px of [-120, -70, 70, 120]) c.fillRect(x + px - 3, b - 30, 6, 20);
}
function water(c, r, y0, cols, glint){
  c.fillStyle = lg(c, 0, y0, 0, GY, cols); c.fillRect(0, y0, TW, GY - y0 + 2);
  c.strokeStyle = glint; c.lineWidth = 1; for (let i = 0; i < 70; i++) { const x = r() * TW, y = y0 + 4 + r() * (GY - y0 - 6); c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6 + r() * 14, y); c.stroke(); }
}
function parapet(c, r, col, colD, lampCol, lampOn){
  // гранитный парапет набережной с фонарями
  c.fillStyle = lg(c, 0, GY - 30, 0, GY, [col, colD]); c.fillRect(0, GY - 30, TW, 30);
  c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(0, GY - 30, TW, 3);
  c.strokeStyle = "rgba(0,0,0,.18)"; c.lineWidth = 1; c.beginPath(); for (let x = 0; x < TW; x += 64) { c.moveTo(x, GY - 27); c.lineTo(x, GY); } c.stroke();
  for (let x = 110; x < TW; x += 320) lamp(c, x, lampCol, lampOn);
}
function railing(c, col){
  // чугунная решётка канала
  c.strokeStyle = col; c.lineWidth = 1.6; c.beginPath(); c.moveTo(0, GY - 34); c.lineTo(TW, GY - 34); c.moveTo(0, GY - 6); c.lineTo(TW, GY - 6); c.stroke();
  for (let x = 0; x < TW; x += 18) { c.beginPath(); c.ellipse(x + 9, GY - 20, 6, 12, 0, 0, TAU); c.stroke(); }
  c.fillStyle = col; for (let x = 0; x < TW; x += 144) c.fillRect(x - 3, GY - 40, 6, 40);
}
function slabs(c, s, w, a, b, line){
  c.fillStyle = lg(c, 0, GY, 0, H, [a, b]); c.fillRect(0, GY, w, H - GY);
  c.fillStyle = "rgba(255,255,255,.22)"; c.fillRect(0, GY, w, 3);
  c.strokeStyle = line; c.lineWidth = 1; c.beginPath();
  for (let row = 0; row < 3; row++) { const sw = 74, y = GY + 4 + row * 19, off = (s * (1 + row * .06) + row * 31) % sw; c.moveTo(0, y); c.lineTo(w, y); for (let x = -off; x < w + sw; x += sw) { c.moveTo(x, y); c.lineTo(x - 6 - row * 4, y + 19); } }
  c.stroke();
}
function petals(c, time, scroll, VW, col, n){
  c.fillStyle = col;
  for (let i = 0; i < n; i++) { const sp = 30 + hash(i * 5) * 50, x = ((hash(i * 11) * (VW + 100) - scroll * .5 - time * sp) % (VW + 100) + VW + 100) % (VW + 100) - 50, y = (hash(i * 3) * H + time * (20 + hash(i) * 30)) % H;
    c.save(); c.translate(x, y); c.rotate(time * 2 + i); c.beginPath(); c.ellipse(0, 0, 3.2, 1.8, 0, 0, TAU); c.fill(); c.restore(); }
}

/* ───────── Фоны ───────── */
Object.assign(X.THEMES, {
  spbDay:{
    sky:["#7fb2dd", "#c3ddf0", "#fbe8d2"], sun:{x:.78, y:56, r:24, col:"255,240,190"}, dust:"rgba(140,140,150,.35)", hud:"#26242a",
    fx(c, t, s, VW){ petals(c, t, s, VW, "rgba(250,196,210,.85)", 18); },
    layers:[
      {f:.04, paint(c, r){ for (let i = 0; i < 7; i++) cloud(c, r() * TW, 30 + r() * 60, .5 + r() * .6, "rgba(255,255,255,.85)"); }},
      {f:.12, paint(c, r){ const col = "#b3c1d2"; c.fillStyle = col; let x = 0; while (x < TW) { const w = 60 + r() * 90, h = 70 + r() * 40; c.fillRect(x, GY - 60 - h, w, h + 60); x += w; }
        isaac(c, 380, GY - 120, "#a8b6c8", "#d9b45a"); adm(c, 980, GY - 120, "#aab8ca", "#e2bf5f"); kazan(c, 1380, GY - 100, "#a5b3c5"); }},
      {f:.45, paint(c, r){ let x = 0; const pal = ["#f0d79b", "#efc0b0", "#cfe2d2", "#f4e3c4", "#e8b98a", "#d7d0e6", "#f1ccc0"];
        while (x < TW) { const w = 130 + Math.floor(r() * 70), h = 150 + Math.floor(r() * 50);
          if (x > 650 && x < 900) { c.fillStyle = "#c9c3b5"; c.fillRect(x, GY - 14, 220, 14); horse(c, x + 50, GY - 14, "#3b3a36"); horse(c, x + 170, GY - 14, "#3b3a36"); x += 230; continue; }
          spbFacade(c, r, x, w, h, pal[Math.floor(r() * pal.length)]); x += w; }
        for (let lx = 80; lx < TW; lx += 260) lamp(c, lx, "#2f3236", false);
        c.strokeStyle = "rgba(40,40,45,.55)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, 70); c.lineTo(TW, 74); c.moveTo(0, 80); c.lineTo(TW, 84); c.stroke(); }}
    ],
    ground(c, s, w){ slabs(c, s, w, "#a7a9ad", "#8d9095", "rgba(60,62,70,.35)"); }
  },
  spbNeva:{
    sky:["#3f5d8c", "#d99a72", "#f8d7a2"], sun:{x:.25, y:150, r:30, col:"255,190,120"}, dust:"rgba(150,120,110,.35)", hud:"#2a2024",
    layers:[
      {f:.04, paint(c, r){ for (let i = 0; i < 6; i++) cloud(c, r() * TW, 40 + r() * 60, .6 + r() * .5, "rgba(255,200,170,.55)"); }},
      {f:.1, paint(c, r){ peterPaul(c, 500, 214, "#5b4b5a", "#e7b75a"); rostral(c, 1150, 214, "#6a5a66", "#8e3d36"); rostral(c, 1300, 214, "#6a5a66", "#8e3d36");
        c.fillStyle = "#6a5a66"; c.fillRect(1180, 190, 100, 24); for (let k = 0; k < 9; k++) c.fillRect(1184 + k * 11, 176, 4, 14); c.beginPath(); c.moveTo(1176, 176); c.lineTo(1230, 160); c.lineTo(1284, 176); c.fill(); }},
      {f:.2, paint(c, r){ water(c, r, 214, ["#c48a76", "#5a6f93", "#384d72"], "rgba(255,210,160,.55)"); }},
      {f:.55, paint(c, r){ parapet(c, r, "#a78f8c", "#7c6866", "#2d2a2e", true); }}
    ],
    ground(c, s, w){ slabs(c, s, w, "#a0898a", "#7a6466", "rgba(50,35,40,.35)"); }
  },
  spbWhite:{
    sky:["#8a96c4", "#d3c3de", "#f3dddd"], moon:{x:.82, y:62, r:14, hazy:true}, dust:"rgba(150,140,170,.35)", hud:"#2a2433",
    fx(c, t, s, VW){ c.fillStyle = "rgba(255,240,250,.07)"; c.fillRect(0, 0, VW, H); },
    layers:[
      {f:.04, paint(c, r){ for (let i = 0; i < 5; i++) cloud(c, r() * TW, 50 + r() * 50, .7, "rgba(240,225,240,.5)"); }},
      {f:.1, paint(c, r){ c.fillStyle = "#9a8fae"; let x = 0; while (x < TW) { const w = 70 + r() * 80, h = 50 + r() * 40; c.fillRect(x, GY - 110 - h, w, h + 60); x += w; } onions(c, 560, GY - 92, true); drawbridge(c, 1200, GY - 96, "#7a7194"); }},
      {f:.2, paint(c, r){ let x = 0; const pal = ["#cdb9a3", "#b8a6b5", "#a9b5b0", "#c9b48c", "#bba0a0"];
        while (x < TW) { if (x > 420 && x < 600) { x += 260; continue; } const w = 120 + Math.floor(r() * 60), h = 120 + Math.floor(r() * 30); spbFacade(c, r, x, w, h, pal[Math.floor(r() * pal.length)], {night:true, lit:.5, glass:"#3a3d5a", base:GY - 66}); x += w; }
        c.fillStyle = "#6f6a86"; c.fillRect(0, GY - 70, TW, 6); }},
      {f:.3, paint(c, r){ water(c, r, GY - 64, ["#b2a6c4", "#7a7598", "#55527a"], "rgba(255,240,255,.5)"); for (let i = 0; i < 18; i++) { c.fillStyle = "rgba(255,214,140,.35)"; c.fillRect(r() * TW, GY - 58 + r() * 40, 2, 8 + r() * 10); } }},
      {f:1, paint(c, r){ railing(c, "#26232f"); }}
    ],
    ground(c, s, w){ slabs(c, s, w, "#8d8696", "#6e6878", "rgba(30,25,40,.4)"); }
  },
  spbDawn:{
    sky:["#6a80b4", "#f0ad9a", "#ffe0ae"], sun:{x:.62, y:120, r:26, col:"255,210,150"}, dust:"rgba(150,130,120,.35)", hud:"#2a2226",
    fx(c, t, s, VW){ for (let i = 0; i < 5; i++) { const x = ((hash(i * 9) * VW * 1.5 - s * .7 - t * 40) % (VW + 80) + VW + 80) % (VW + 80) - 40, y = 60 + hash(i * 4) * 120 + Math.sin(t * 2 + i) * 8;
      c.save(); c.translate(x, y); c.rotate(Math.sin(t * 3 + i) * .4); c.fillStyle = "rgba(255,252,240,.8)"; c.fillRect(-5, -6, 10, 12); c.restore(); } },
    layers:[
      {f:.04, paint(c, r){ for (let i = 0; i < 6; i++) cloud(c, r() * TW, 50 + r() * 60, .6, "rgba(255,215,200,.6)"); }},
      {f:.12, paint(c, r){ c.fillStyle = "#9a8fa8"; let x = 0; while (x < TW) { const w = 60 + r() * 90, h = 60 + r() * 50; c.fillRect(x, GY - 60 - h, w, h + 60); x += w; } kazan(c, 600, GY - 90, "#8f849e"); isaac(c, 1260, GY - 110, "#8f849e", "#e0b766"); }},
      {f:.45, paint(c, r){ let x = 0; const pal = ["#e9cfa2", "#e7b5a6", "#d1dccb", "#efdcbd", "#d9b38c"];
        while (x < TW) { if (x > 700 && x < 860) { singer(c, x + 80, GY, "#c9b8a2", "rgba(120,170,200,.8)", "#e8c068"); x += 160; continue; }
          const w = 130 + Math.floor(r() * 60), h = 150 + Math.floor(r() * 50); spbFacade(c, r, x, w, h, pal[Math.floor(r() * pal.length)]); x += w; }
        for (let lx = 80; lx < TW; lx += 260) lamp(c, lx, "#2f3236", true); }}
    ],
    ground(c, s, w){ slabs(c, s, w, "#9e9aa2", "#7e7a84", "rgba(50,45,60,.35)"); c.fillStyle = "rgba(255,210,170,.12)"; c.fillRect(0, GY + 3, w, 10); }
  },
  spbSky:{
    sky:["#4d8fd9", "#a3cff3", "#fff0d6"], sun:{x:.72, y:70, r:28, col:"255,236,180"}, dust:"rgba(255,220,140,.5)", hud:"#1d2a3a",
    fx(c, t, s, VW){ c.save(); c.globalCompositeOperation = "lighter"; for (let i = 0; i < 22; i++) { const x = ((hash(i * 7) * VW * 1.3 - s * .9) % (VW + 40) + VW + 40) % (VW + 40) - 20, y = GY - 6 - hash(i * 5) * 60 - (t * 30 + i * 13) % 60; glow(c, x, y, 6, "255,214,110", .5); } c.restore(); },
    layers:[
      {f:.03, paint(c, r){ for (let i = 0; i < 8; i++) cloud(c, r() * TW, 40 + r() * 140, .6 + r() * .7, "rgba(255,255,255,.75)"); }},
      {f:.1, paint(c, r){ for (let i = 0; i < 6; i++) island(c, r, 120 + i * 260 + r() * 80, 120 + r() * 60, .55, "#b7b2c8", "#d8c7a2"); }},
      {f:.3, paint(c, r){ for (let i = 0; i < 4; i++) island(c, r, 200 + i * 400 + r() * 100, 170 + r() * 40, 1, "#9a8f9c", "#e8cf9a");
        c.strokeStyle = "rgba(255,206,90,.7)"; c.lineWidth = 2; c.beginPath(); for (let i = 0; i < 4; i++) { const x0 = 260 + i * 400; c.moveTo(x0, 175); c.quadraticCurveTo(x0 + 200, 120, x0 + 400, 180); } c.stroke(); }}
    ],
    ground(c, s, w){
      c.fillStyle = lg(c, 0, GY, 0, H, ["#bfe0f7", "#e8f3fb"]); c.fillRect(0, GY, w, H - GY);
      for (let i = 0; i < 6; i++) { const x = ((i * 260 - s * .6) % (w + 300) + w + 300) % (w + 300) - 150; cloud(c, x, GY + 40 + (i % 2) * 14, .7, "rgba(255,255,255,.9)"); }
      c.fillStyle = lg(c, 0, GY, 0, GY + 12, ["#fff2b8", "#f2be4c", "rgba(242,190,76,0)"]); c.fillRect(0, GY, w, 14);
      c.fillStyle = "rgba(255,255,255,.8)"; for (let x = -(s % 40); x < w; x += 40) c.fillRect(x, GY + 1, 14, 1.5);
    }
  },
  spbSunset:{
    sky:["#40336e", "#e0716a", "#ffc985"], sun:{x:.5, y:190, r:34, col:"255,170,110"}, dust:"rgba(140,100,110,.35)", hud:"#2a1d26",
    fx(c, t, s, VW){ petals(c, t, s, VW, "rgba(255,226,236,.85)", 22); },
    layers:[
      {f:.04, paint(c, r){ for (let i = 0; i < 6; i++) cloud(c, r() * TW, 50 + r() * 70, .7 + r() * .4, "rgba(255,170,160,.5)"); }},
      {f:.1, paint(c, r){ c.fillStyle = "#3f3050"; c.fillRect(0, 206, TW, 10); peterPaul(c, 300, 214, "#3f3050", "#f0b45a"); drawbridge(c, 1050, 214, "#3f3050"); isaac(c, 1400, 212, "#3f3050", "#d9a14f"); }},
      {f:.2, paint(c, r){ water(c, r, 214, ["#e48c74", "#7a5884", "#46395f"], "rgba(255,200,150,.6)"); }},
      {f:.55, paint(c, r){ parapet(c, r, "#9b7e88", "#6e5662", "#2a2228", true); }}
    ],
    ground(c, s, w){ slabs(c, s, w, "#97808a", "#71606b", "rgba(40,25,35,.35)"); }
  }
});
X.THEMES.spbDay.back = crowd(6, .72); X.THEMES.spbNeva.back = crowd(4, .7); X.THEMES.spbWhite.back = crowd(3, .7);
X.THEMES.spbDawn.back = crowd(4, .72); X.THEMES.spbSunset.back = crowd(4, .7);
function island(c, r, x, y, s, rock, build){
  c.fillStyle = rock; c.beginPath(); c.moveTo(x - 70 * s, y); c.lineTo(x + 70 * s, y); c.lineTo(x + 30 * s, y + 40 * s); c.lineTo(x, y + 70 * s); c.lineTo(x - 36 * s, y + 36 * s); c.closePath(); c.fill();
  c.fillStyle = build; c.fillRect(x - 50 * s, y - 34 * s, 100 * s, 34 * s);
  c.fillStyle = "rgba(0,0,0,.15)"; for (let k = 0; k < 7; k++) c.fillRect(x - 46 * s + k * 14 * s, y - 30 * s, 4 * s, 26 * s);
  c.fillStyle = build; c.beginPath(); c.moveTo(x - 54 * s, y - 34 * s); c.lineTo(x, y - 54 * s); c.lineTo(x + 54 * s, y - 34 * s); c.fill();
  glow(c, x, y + 20 * s, 60 * s, "255,214,120", .18);
}

/* ───────── Прохожие: немного людей на улицах (не мешают, просто идут по своим делам) ───────── */
const WALK = [
  {coat:"#c9b28f", legs:"#3a3a40", hair:"#4a3020", bag:"#5a3a28"}, {coat:"#5d6b7a", legs:"#2a2a30", hair:"#1f1a18", cap:"#3a3f48"},
  {coat:"#8a3f4a", legs:"#2e2a2e", hair:"#c99a5a", long:true}, {coat:"#3f5a4a", legs:"#2a2a2a", hair:"#6b4a30", umbrella:"#2f3e5c"},
  {coat:"#d8cfc0", legs:"#4a4a52", hair:"#8a8a8f", long:true}, {coat:"#2f3550", legs:"#22222a", hair:"#3a2418", phone:true}
];
function walker(c, x, s, t, o, dir){
  const y = GY - 2, ph = t * 7 + x * .01, sw = Math.sin(ph) * .45;
  c.save(); c.translate(x, y); c.scale(dir * s, s); c.globalAlpha = .88;
  c.strokeStyle = o.legs; c.lineWidth = 6; c.lineCap = "round";
  c.beginPath(); c.moveTo(0, -44); c.lineTo(Math.sin(sw) * 22, -2); c.moveTo(0, -44); c.lineTo(Math.sin(-sw) * 22, -2); c.stroke();
  c.fillStyle = o.coat; c.beginPath(); c.moveTo(-10, -92); c.lineTo(10, -92); c.lineTo(o.long ? 15 : 12, o.long ? -30 : -42); c.lineTo(o.long ? -15 : -12, o.long ? -30 : -42); c.closePath(); c.fill();
  c.strokeStyle = o.coat; c.lineWidth = 6; c.beginPath(); c.moveTo(0, -88); c.lineTo(Math.sin(-sw) * 14, -56); c.stroke();
  if (o.bag) { c.fillStyle = o.bag; rrect(c, Math.sin(-sw) * 14 - 5, -58, 11, 12, 2); c.fill(); }
  if (o.phone) { c.fillStyle = "#111"; c.fillRect(8, -82, 4, 7); c.strokeStyle = o.coat; c.beginPath(); c.moveTo(4, -86); c.lineTo(10, -80); c.stroke(); }
  c.fillStyle = "#e3c1a5"; ell(c, 2, -101, 8, 9); c.fill();
  c.fillStyle = o.cap || o.hair; c.beginPath(); c.ellipse(0, -104, 9, 7, 0, Math.PI, TAU); c.fill(); if (!o.cap) c.fillRect(-9, -104, 6, 9);
  if (o.umbrella) { c.strokeStyle = "#222"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(4, -84); c.lineTo(4, -128); c.stroke(); c.fillStyle = o.umbrella; c.beginPath(); c.moveTo(-24, -122); c.quadraticCurveTo(4, -150, 32, -122); c.closePath(); c.fill(); }
  c.restore();
}
function crowd(n, s){
  return function(c, t, scroll, VW){
    const span = VW + 300;
    for (let i = 0; i < n; i++) {
      const dir = hash(i * 17) < .5 ? -1 : 1, v = 26 + hash(i * 5) * 22;
      const x = ((i * span / n + hash(i * 3) * 120 - scroll * .92 + dir * t * v) % span + span) % span - 150;
      walker(c, x, s * (.9 + hash(i * 9) * .15), t + i, WALK[i % WALK.length], dir);
    }
  };
}

/* ───────── Препятствия ───────── */
Object.assign(X.OB, {
  // Поребрик: низкий гранитный бортик. Не отнимает сердце, но Наталья спотыкается и ругается.
  kerb:{w:66, trip:true, hb:{dx:3, w:60, top:12, bottom:0}, draw(c, x){ c.save();
    c.fillStyle = "rgba(0,0,0,.2)"; c.fillRect(x + 3, GY - 1, 66, 4);
    c.fillStyle = lg(c, 0, GY - 13, 0, GY, ["#c4c2c0", "#8f8c8a"]); c.fillRect(x, GY - 11, 66, 11);
    c.fillStyle = "#d9d7d4"; c.fillRect(x, GY - 13, 66, 3);
    c.fillStyle = "rgba(60,55,55,.35)"; for (let k = 0; k < 14; k++) c.fillRect(x + 2 + (k * 13.7) % 62, GY - 9 + (k * 5) % 7, 1.4, 1.4);
    c.strokeStyle = "rgba(60,55,55,.35)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 33, GY - 12); c.lineTo(x + 33, GY); c.stroke(); c.restore(); }},
  sphinx:{w:88, vx:70, hb:{dx:12, w:66, top:46, bottom:0}, draw(c, x, t){ c.save();
    const g = "#8a747a", gd = "#6d5a60", st = Math.sin(t * 9) * 5;
    c.strokeStyle = gd; c.lineWidth = 5; c.lineCap = "round"; c.beginPath();
    c.moveTo(x + 22, GY - 18); c.lineTo(x + 18 + st, GY - 2); c.moveTo(x + 30, GY - 18); c.lineTo(x + 32 - st, GY - 2);
    c.moveTo(x + 62, GY - 18); c.lineTo(x + 58 - st, GY - 2); c.moveTo(x + 70, GY - 18); c.lineTo(x + 74 + st, GY - 2); c.stroke();
    ell(c, x + 47, GY - 24, 28, 11, g);
    c.strokeStyle = g; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 74, GY - 26); c.quadraticCurveTo(x + 88, GY - 30 + st * .4, x + 84, GY - 40); c.stroke();
    // голова в немесе
    c.fillStyle = "#a99064"; c.beginPath(); c.moveTo(x + 12, GY - 30); c.lineTo(x + 16, GY - 50); c.lineTo(x + 32, GY - 50); c.lineTo(x + 36, GY - 28); c.closePath(); c.fill();
    c.strokeStyle = "rgba(70,50,30,.45)"; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 4; k++) { c.moveTo(x + 15 + k * 1, GY - 46 + k * 5); c.lineTo(x + 34 - k * .4, GY - 46 + k * 5); } c.stroke();
    ell(c, x + 20, GY - 38, 6, 7.5, g); ell(c, x + 17, GY - 40, 1.1, 1.1, "#2a1e1e"); c.fillStyle = gd; c.fillRect(x + 13, GY - 37, 3, 2);
    c.restore(); }},
  toll:{w:64, hb:{dx:2, w:60, top:40, bottom:0}, draw(c, x, t){ c.save();
    for (const px of [x + 5, x + 57]) { c.fillStyle = lg(c, px - 3, 0, px + 3, 0, ["#a07a2c", "#f0cf72", "#9a7428"]); c.fillRect(px - 2.5, GY - 38, 5, 38); ell(c, px, GY - 40, 4, 4, "#e5c063"); c.fillRect(px - 7, GY - 3, 14, 3); }
    c.strokeStyle = "#a3172b"; c.lineWidth = 4.5; c.beginPath(); c.moveTo(x + 6, GY - 36); c.quadraticCurveTo(x + 31, GY - 18, x + 56, GY - 36); c.stroke();
    c.fillStyle = "#1d2a3c"; rrect(c, x + 16, GY - 30, 30, 15, 3); c.fill(); c.fillStyle = "#f6d77a"; c.font = "bold 9px sans-serif"; c.textAlign = "center"; c.fillText("200 ₽", x + 31, GY - 19.5); c.restore(); }},
  chaos:{w:66, hb:{dx:2, w:62, top:42, bottom:0}, draw(c, x, t){ c.save();
    c.strokeStyle = "#20263a"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 8, GY - 22); c.lineTo(x, GY); c.moveTo(x + 8, GY - 22); c.lineTo(x + 16, GY); c.moveTo(x + 58, GY - 22); c.lineTo(x + 50, GY); c.moveTo(x + 58, GY - 22); c.lineTo(x + 66, GY); c.stroke();
    c.save(); rrect(c, x, GY - 40, 66, 18, 3); c.clip(); c.fillStyle = "#1e2a4a"; c.fillRect(x, GY - 40, 66, 18); c.fillStyle = "#ffd23f"; for (let k = -1; k < 7; k++) { c.beginPath(); c.moveTo(x + k * 12, GY - 22); c.lineTo(x + k * 12 + 5, GY - 22); c.lineTo(x + k * 12 + 15, GY - 40); c.lineTo(x + k * 12 + 10, GY - 40); c.fill(); } c.restore();
    c.fillStyle = "#1e2a4a"; rrect(c, x + 9, GY - 37, 48, 12, 2); c.fill(); c.fillStyle = "#fff"; c.font = "bold 6.5px sans-serif"; c.textAlign = "center"; c.fillText("ПОЛИЦИЯ ХАОСА", x + 33, GY - 28.5);
    const on = Math.sin(t * 9) > 0; ell(c, x + 33, GY - 44, 3.5, 3.5, on ? "#4aa3ff" : "#ff4a4a"); glow(c, x + 33, GY - 44, 16, on ? "70,160,255" : "255,70,70", .7); c.restore(); }},
  chain:{w:100, hb:{dx:4, w:92, top:28, bottom:0}, draw(c, x, t){ c.save();
    for (const px of [x + 8, x + 90]) { c.fillStyle = lg(c, px - 9, 0, px + 9, 0, ["#7f726f", "#a99a96", "#6c605d"]); c.beginPath(); c.moveTo(px - 8, GY); c.lineTo(px - 6, GY - 26); c.lineTo(px + 6, GY - 26); c.lineTo(px + 8, GY); c.fill(); ell(c, px, GY - 27, 7, 3, "#b7a8a4"); }
    c.strokeStyle = "#26262c"; c.lineWidth = 1.6; const sw = Math.sin(t * 2) * 1.5;
    for (let k = 0; k <= 12; k++) { const u = k / 12, px = lerp(x + 13, x + 85, u), py = GY - 22 + Math.sin(u * Math.PI) * (12 + sw); c.beginPath(); c.ellipse(px, py, 3.4, k % 2 ? 1.4 : 2.4, Math.cos(u * Math.PI) * .5, 0, TAU); c.stroke(); }
    c.restore(); }},
  griffin:{w:94, vx:70, hb:{dx:12, w:70, top:104, bottom:64}, draw(c, x, t){ c.save();
    const y = GY - 84 + Math.sin(t * 3) * 3, f = Math.sin(t * 9);
    c.fillStyle = "#e9c25a"; c.beginPath(); c.moveTo(x + 40, y - 6); c.quadraticCurveTo(x + 52, y - 30 * f - 18, x + 80, y - 40 * f - 10); c.quadraticCurveTo(x + 66, y - 8, x + 66, y - 2); c.fill();
    ell(c, x + 50, y, 26, 10, "#c99a3e");
    c.strokeStyle = "#a87a2e"; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(x + 36, y + 6); c.lineTo(x + 30, y + 16); c.moveTo(x + 64, y + 6); c.lineTo(x + 72, y + 16); c.stroke();
    c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 74, y - 2); c.quadraticCurveTo(x + 92, y - 4, x + 90, y - 14); c.stroke();
    ell(c, x + 22, y - 8, 10, 9, "#f3dc8a"); c.fillStyle = "#d1902a"; c.beginPath(); c.moveTo(x + 13, y - 10); c.lineTo(x + 4, y - 5); c.lineTo(x + 13, y - 4); c.fill(); ell(c, x + 18, y - 11, 1.4, 1.4, "#2a1a10");
    c.fillStyle = "#f7d978"; c.beginPath(); c.moveTo(x + 46, y - 4); c.quadraticCurveTo(x + 40, y - 34 * f - 22, x + 18, y - 44 * f - 18); c.quadraticCurveTo(x + 34, y - 10, x + 36, y - 2); c.fill();
    glow(c, x + 46, y - 4, 40, "255,214,110", .25); c.restore(); }},
  book:{w:44, vx:100, hb:{dx:4, w:34, top:100, bottom:64}, draw(c, x, t){ c.save();
    const y = GY - 82 + Math.sin(t * 4 + x * .01) * 6, f = Math.sin(t * 14) * .7;
    c.translate(x + 22, y); c.fillStyle = "#7a2a2a"; c.save(); c.rotate(-.5 - f); c.fillRect(-18, -2, 18, 14); c.restore(); c.save(); c.rotate(.5 + f); c.fillRect(0, -2, 18, 14); c.restore();
    c.fillStyle = "#f6efdf"; c.save(); c.rotate(-.35 - f * .8); c.fillRect(-16, -1, 16, 11); c.restore(); c.save(); c.rotate(.35 + f * .8); c.fillRect(0, -1, 16, 11); c.restore();
    c.fillStyle = "#e3c06a"; c.fillRect(-1, -2, 2, 14); c.restore(); }},
  books:{w:46, hb:{dx:3, w:40, top:44, bottom:0}, draw(c, x){ c.save(); const cols = ["#7a2a2a", "#2e4a6b", "#4a6b3a", "#8a6a2a", "#5a3a6a", "#2a2a2a"];
    for (let k = 0; k < 6; k++) { c.fillStyle = cols[k]; rrect(c, x + 3 + (k % 2) * 3 - (k % 3) * 2, GY - 7 - k * 7, 38 - (k % 3) * 3, 7, 1.5); c.fill(); c.fillStyle = "#e3c06a"; c.fillRect(x + 8 + (k % 2) * 3, GY - 5 - k * 7, 2, 3); } c.restore(); }},
  scooter:{w:54, hb:{dx:4, w:46, top:40, bottom:0}, draw(c, x){ c.save();
    c.fillStyle = "#1b1b1f"; ell(c, x + 10, GY - 5, 5, 5); c.fill(); ell(c, x + 44, GY - 5, 5, 5); c.fill();
    c.fillStyle = "#44b36a"; rrect(c, x + 10, GY - 11, 34, 5, 2); c.fill();
    c.strokeStyle = "#2f8a52"; c.lineWidth = 3.4; c.beginPath(); c.moveTo(x + 44, GY - 8); c.lineTo(x + 40, GY - 42); c.stroke();
    c.strokeStyle = "#1b1b1f"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 33, GY - 42); c.lineTo(x + 47, GY - 42); c.stroke(); c.restore(); }},
  fragment:{w:78, vx:30, hb:{dx:6, w:66, top:112, bottom:64}, draw(c, x, t){ c.save();
    const y = GY - 88 + Math.sin(t * 1.6) * 5; c.translate(x + 39, y); c.rotate(Math.sin(t * .8) * .06);
    c.fillStyle = "#958a92"; c.beginPath(); c.moveTo(-36, -4); c.lineTo(36, -6); c.lineTo(26, 12); c.lineTo(0, 22); c.lineTo(-24, 12); c.closePath(); c.fill();
    c.fillStyle = "#efe2c4"; c.fillRect(-30, -24, 60, 18); c.fillStyle = "rgba(0,0,0,.15)"; for (let k = 0; k < 5; k++) c.fillRect(-27 + k * 12, -22, 4, 15);
    c.fillStyle = "#e6d6b2"; c.beginPath(); c.moveTo(-33, -24); c.lineTo(0, -36); c.lineTo(33, -24); c.fill();
    glow(c, 0, 14, 40, "255,214,120", .3); c.restore(); }},
  column:{w:34, hb:{dx:4, w:26, top:48, bottom:0}, draw(c, x){ c.save();
    c.fillStyle = "#d6c9ad"; c.fillRect(x + 1, GY - 6, 32, 6); c.fillStyle = lg(c, x + 6, 0, x + 28, 0, ["#cdbfa2", "#f1e6cc", "#c2b394"]); c.fillRect(x + 7, GY - 44, 20, 38);
    c.fillStyle = "rgba(0,0,0,.12)"; for (let k = 0; k < 4; k++) c.fillRect(x + 10 + k * 4.5, GY - 44, 1.4, 38);
    c.fillStyle = "#cdbfa2"; c.beginPath(); c.moveTo(x + 7, GY - 44); c.lineTo(x + 12, GY - 50); c.lineTo(x + 17, GY - 45); c.lineTo(x + 22, GY - 52); c.lineTo(x + 27, GY - 44); c.fill(); c.restore(); }},
  goldline:{w:24, hb:{dx:6, w:12, top:999, bottom:58}, draw(c, x, t){ c.save(); const sw = Math.sin(t * 2 + x * .01) * 6, by = GY - 58;
    c.strokeStyle = "rgba(255,206,90,.95)"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x + 12, -10); c.bezierCurveTo(x + 12 - sw, by * .3, x + 12 + sw, by * .7, x + 12, by); c.stroke();
    c.strokeStyle = "rgba(255,240,180,.6)"; c.lineWidth = 1; c.beginPath(); for (let k = 0; k < 4; k++) { const yy = by - 10 - k * 30; c.moveTo(x + 12, yy); c.lineTo(x + 12 + (k % 2 ? 8 : -8), yy - 8); } c.stroke();
    glow(c, x + 12, by, 20, "255,206,90", .7 + .2 * Math.sin(t * 6)); ell(c, x + 12, by, 4, 4, "#fff0b0"); c.restore(); }},
  penguin:{w:32, vx:28, hb:{dx:5, w:22, top:36, bottom:0}, draw(c, x, t){ c.save(); const wd = Math.sin(t * 10) * .12; c.translate(x + 16, GY); c.rotate(wd);
    ell(c, 0, -17, 10, 17, "#1d1f26"); ell(c, -2, -15, 6.5, 13, "#f4f2ec"); ell(c, -1, -34, 7, 6.5, "#1d1f26");
    c.fillStyle = "#f0a12a"; c.beginPath(); c.moveTo(-7, -34); c.lineTo(-12, -32); c.lineTo(-7, -31); c.fill(); ell(c, -4, -35.5, 1.1, 1.1, "#fff");
    ell(c, -4, 0, 4, 1.8, "#f0a12a"); ell(c, 4, 0, 4, 1.8, "#f0a12a"); c.restore(); }}
});

/* ───────── Предметы ───────── */
Object.assign(X.ITEM, {
  pyshka(c, x, y, t){ glow(c, x, y, 24, "255,214,150", .5); ell(c, x, y, 12, 10, "#d9a061"); ell(c, x, y - 1, 11, 8.5, "#f2e6d4"); ell(c, x, y - 1, 4, 3, "#c98c4f"); c.fillStyle = "#fff"; for (let k = 0; k < 7; k++) { const a = k * .9 + t; c.fillRect(x + Math.cos(a) * 7, y - 1 + Math.sin(a) * 5, 1.3, 1.3); } },
  syrnik(c, x, y, t){ glow(c, x, y, 24, "255,200,110", .5); ell(c, x, y + 3, 12, 5, "#b9732e"); ell(c, x, y, 12, 6, "#e8a54a"); ell(c, x, y - 1, 10, 4.5, "#f3c06a"); ell(c, x + 2, y - 4, 4.5, 2.6, "#fbf6ea"); },
  feather(c, x, y, t){ glow(c, x, y, 24, "255,214,110", .55); c.save(); c.translate(x, y); c.rotate(-.6 + Math.sin(t * 3) * .2);
    c.fillStyle = lg(c, -4, -14, 4, 14, ["#fff2b0", "#e9b545"]); c.beginPath(); c.moveTo(0, -15); c.quadraticCurveTo(8, -4, 2, 12); c.lineTo(-2, 12); c.quadraticCurveTo(-8, -4, 0, -15); c.fill();
    c.strokeStyle = "#a8782a"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -13); c.lineTo(0, 15); c.stroke(); c.restore(); },
  page(c, x, y, t){ glow(c, x, y, 22, "255,250,230", .5); c.save(); c.translate(x, y); c.rotate(Math.sin(t * 3) * .25); c.fillStyle = "#fbf6e8"; c.fillRect(-9, -12, 18, 24);
    c.fillStyle = "rgba(90,70,50,.5)"; for (let k = 0; k < 6; k++) c.fillRect(-6, -8 + k * 3.6, k === 5 ? 7 : 12, 1); c.restore(); },
  shard(c, x, y, t){ glow(c, x, y, 28, "255,206,90", .6); c.save(); c.translate(x, y); c.rotate(t * .8);
    c.fillStyle = lg(c, -8, -12, 8, 12, ["#fff6c8", "#f2c14e", "#c98a2a"]); c.beginPath(); c.moveTo(0, -13); c.lineTo(8, -2); c.lineTo(3, 13); c.lineTo(-7, 4); c.closePath(); c.fill();
    c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1; c.beginPath(); c.moveTo(0, -13); c.lineTo(1, 4); c.lineTo(-7, 4); c.stroke(); c.restore(); },
  petal(c, x, y, t){ glow(c, x, y, 24, "255,190,215", .5); c.save(); c.translate(x, y); c.rotate(Math.sin(t * 2) * .5);
    for (let k = 0; k < 5; k++) { c.rotate(TAU / 5); c.fillStyle = k % 2 ? "#ffd9e6" : "#fff1f5"; c.beginPath(); c.ellipse(0, -6, 4.5, 7, 0, 0, TAU); c.fill(); } ell(c, 0, 0, 2.6, 2.6, "#f2c14e"); c.restore(); }
});

/* ───────── Герои, которые ждут в конце уровня (смотрят влево, на Наталью) ───────── */
function person(c, x, y, t, o){
  const s = o.h / 120, b = Math.sin(t * 2 + x) * .6;
  c.save(); c.translate(x, y); c.scale(s, s);
  // ноги
  c.fillStyle = o.legs; c.fillRect(-9, -46, 7, 44); c.fillRect(1, -46, 7, 44);
  c.fillStyle = "#151417"; ell(c, -8, -2, 7, 3); c.fill(); ell(c, 2, -2, 7, 3); c.fill();
  // пальто / пиджак / мундир
  const hem = o.long ? -30 : -44;
  c.fillStyle = o.coat; c.beginPath(); c.moveTo(-13, -94 + b); c.lineTo(13, -94 + b); c.lineTo(o.long ? 17 : 13, hem); c.lineTo(o.long ? -19 : -14, hem); c.closePath(); c.fill();
  if (o.lining) { c.fillStyle = o.lining; c.beginPath(); c.moveTo(-17, hem); c.lineTo(-13, -60); c.lineTo(-10, hem); c.fill(); }
  if (o.shirt) { c.fillStyle = o.shirt; c.beginPath(); c.moveTo(-6, -94 + b); c.lineTo(-1, -70); c.lineTo(3, -94 + b); c.fill(); }
  if (o.epaulet) { c.fillStyle = "#e3b84e"; c.fillRect(-14, -95 + b, 9, 3); c.fillRect(6, -95 + b, 9, 3); c.fillRect(-13, -76, 26, 2); }
  // руки
  c.fillStyle = o.coat; c.save(); c.translate(-10, -90 + b); c.rotate(o.armF || .12); c.fillRect(-4, 0, 8, 38); ell(c, 0, 40, 4, 4, o.skin); c.restore();
  if (o.folder) { c.fillStyle = o.folder; c.save(); c.translate(-18, -60); c.rotate(-.15); c.fillRect(-4, 0, 18, 24); c.restore(); }
  // голова
  c.fillStyle = o.skin; c.fillRect(-3, -102 + b, 6, 8);
  ell(c, 0, -111 + b, 10, 11, o.skin);
  ell(c, -10, -110 + b, 2.2, 2.2, o.skin);
  ell(c, -5, -113 + b, 1.2, 1.4, "#2a2020");
  if (o.glasses) { c.strokeStyle = "#2a2a30"; c.lineWidth = 1.1; c.beginPath(); c.arc(-5, -113 + b, 3.4, 0, TAU); c.moveTo(-1.6, -113 + b); c.lineTo(6, -112 + b); c.stroke(); }
  c.strokeStyle = "#7a4a3a"; c.lineWidth = 1; c.beginPath(); c.moveTo(-8, -104 + b); c.lineTo(-3, -104.5 + b); c.stroke();
  if (o.stubble) { c.fillStyle = "rgba(90,90,95,.35)"; c.beginPath(); c.ellipse(-2, -104 + b, 7, 5, 0, 0, Math.PI); c.fill(); }
  c.fillStyle = o.hair;
  if (o.hairStyle === "bun") { ell(c, 2, -116 + b, 10.5, 8.5, o.hair); ell(c, 9, -120 + b, 5, 5, o.hair); c.fillRect(2, -116 + b, 9, 12); }
  else { c.beginPath(); c.ellipse(2, -116 + b, 11, 8, 0, Math.PI * .95, TAU * 1.02); c.fill(); c.fillRect(3, -117 + b, 8.5, 12); if (o.hairStyle === "swept") { c.beginPath(); c.moveTo(-9, -116 + b); c.quadraticCurveTo(0, -128 + b, 12, -118 + b); c.lineTo(10, -112 + b); c.fill(); } }
  c.restore();
}
const P = X.PEOPLE;
P.luis = (c, x, y, t) => person(c, x, y, t, {h:132, legs:"#1c1d24", coat:"#1f2433", lining:"#7a1f2a", shirt:"#2b2b30", skin:"#d9b294", hair:"#b9b9bf", hairStyle:"swept", stubble:true, long:true});
P.luis.h = 140;
P.luisScooter = (c, x, y, t) => { X.OB.scooter.draw(c, x - 40, t); P.luis(c, x, y, t); };
P.luisScooter.h = 140;
P.dp = (c, x, y, t) => person(c, x, y, t, {h:114, legs:"#3a3f4a", coat:"#5b6270", shirt:"#e9e6e0", skin:"#e3c2a8", hair:"#e8e6e2", glasses:true, folder:"#8a6a3a"});
P.dp.h = 122;
P.cap = (c, x, y, t) => person(c, x, y, t, {h:116, legs:"#1a1f2c", coat:"#1c2333", epaulet:true, skin:"#efd2bf", hair:"#e8e2cf", hairStyle:"bun"});
P.cap.h = 124;
P.ivan = (c, x, y, t) => person(c, x, y, t, {h:112, legs:"#3b3a3f", coat:"#6b5a44", shirt:"#dfe6ee", skin:"#e8c7ab", hair:"#5a4030", glasses:true, folder:"#3e5a7a"});
P.ivan.h = 120;
P.griffin = (c, x, y, t) => { c.save();
  const b = Math.sin(t * 2) * 1.5;
  c.fillStyle = "#e9c25a"; c.beginPath(); c.moveTo(x + 4, y - 74); c.quadraticCurveTo(x + 30, y - 140 + b, x + 66, y - 128 + b); c.quadraticCurveTo(x + 46, y - 96, x + 40, y - 60); c.fill();
  ell(c, x + 20, y - 48, 34, 20, "#c99a3e");
  c.strokeStyle = "#a87a2e"; c.lineWidth = 7; c.lineCap = "round"; c.beginPath(); c.moveTo(x - 4, y - 36); c.lineTo(x - 6, y - 2); c.moveTo(x + 8, y - 34); c.lineTo(x + 10, y - 2); c.moveTo(x + 38, y - 36); c.lineTo(x + 36, y - 2); c.moveTo(x + 48, y - 38); c.lineTo(x + 52, y - 2); c.stroke();
  c.lineWidth = 3; c.beginPath(); c.moveTo(x + 52, y - 52); c.quadraticCurveTo(x + 74, y - 50, x + 70, y - 70); c.stroke();
  ell(c, x - 14, y - 74 + b, 13, 16, "#f3dc8a"); ell(c, x - 18, y - 90 + b, 11, 10, "#f3dc8a");
  c.fillStyle = "#d1902a"; c.beginPath(); c.moveTo(x - 27, y - 92 + b); c.quadraticCurveTo(x - 40, y - 88 + b, x - 34, y - 80 + b); c.lineTo(x - 26, y - 84 + b); c.fill();
  ell(c, x - 22, y - 93 + b, 1.8, 1.8, "#2a1a10");
  c.fillStyle = "#f7d978"; c.beginPath(); c.moveTo(x + 10, y - 66); c.quadraticCurveTo(x + 18, y - 124 + b, x + 50, y - 112 + b); c.quadraticCurveTo(x + 34, y - 84, x + 30, y - 52); c.fill();
  glow(c, x + 10, y - 70, 70, "255,214,110", .22); c.restore(); };
P.griffin.h = 128;
P.penguins = (c, x, y, t) => { X.OB.penguin.draw(c, x - 16, t); X.OB.penguin.draw(c, x + 10, t + 1.3); };
P.penguins.h = 50;

/* ───────── Внешность Натальи по главам ───────── */
const NAT = {skin:"#f2cdb0", skinD:"#ddae90", hair:"#3b2418", hairL:"#5d3a27", style:"bun", eye:"#4d5c6b", brow:"#3b2418", pack:"bag", belt:null, shoe:["#2b2326", "#211b1d"]};
X.HEROES[SLUG] = function(level){
  if (level === 1) return Object.assign({}, NAT, {top:["#e0aeb5", "#f2cbd0", "#fbe2e5"], sleeve:"#f0c5ca", sleeveD:"#d6a3aa", quilt:true, scarf:["#8a4b2c", "#c98a4a", "#6e3a24"], skirt:["#2c2c36", "#15151b"], hem:36});
  if (level === 2) return Object.assign({}, NAT, {top:["#cdd5c3", "#e4e9da", "#f0f3e9"], sleeve:"#e4e9da", sleeveD:"#c8cebd", skirt:["#e0e6d6", "#bcc4af"], hem:36, print:"rgba(110,130,170,.55)", belt:"#b6b09a", shoe:["#b98f6e", "#9b7556"]});
  return Object.assign({}, NAT, {top:["#e6e4df", "#fbfaf7", "#ffffff"], sleeve:"#fbfaf7", sleeveD:"#dcd8d1", skirt:["#d43c3c", "#a31e26"], hem:28, pleats:true, belt:"#8f1b22", shoe:["#f4f4f4", "#d8d8d8"]});
};

/* ───────── Уровни: по одному на каждые пять глав ───────── */
const CURSES = ["Блин! Питерские поребрики!", "Опять поребрик!", "В Москве это называется бордюр!", "Кто меня сюда отдыхать отправил?!", "Да что ж такое!", "Ай! Мой отпуск!", "Ну, Петербург, погоди!"];
X.LEVELS[SLUG] = [
  {theme:"spbDay", title:"Питерские поребрики", item:"pyshka", names:["пышку", "пышки", "пышек"], goal:10, speed:240,
   curses:CURSES, firstCurse:"Блин! Питерские поребрики! Начинается мой приятный отдых!",
   intro:"Первый день отпуска: весна, Невский, толпа — и коварные питерские поребрики. Беги к Аничкову мосту, перепрыгивай лужи и бегущего сфинкса, не плати атлантам за проход и собирай пышки. Споткнёшься — выругаешься, и город это услышит.",
   obs:{kerb:4, puddle:2, toll:2, sphinx:2, lowcable:2, bench:1},
   meet:{title:"Аничков мост", who:[{id:"luis", dx:16}], lines:[
     ["luis", "Мне поручили спасать москвичек, которые спотыкаются о петербургские поребрики."],
     ["nat", "Во-первых, это бордюр. Во-вторых, меня не надо спасать!"],
     ["luis", "Тогда возьмите хотя бы визитку. Она ещё пригодится."]]}},
  {theme:"spbNeva", title:"Полиция хаоса", item:"syrnik", names:["сырник", "сырника", "сырников"], goal:11, speed:255,
   curses:CURSES,
   intro:"Полиция хаоса ищет москвичку, которая так громко высказалась о поребрике. Беги по гранитной набережной на Васильевский остров: перепрыгивай цепи между тумбами и заграждения, пригибайся под дронами и чайками. Собери сырники — завтрак для «товарища великана».",
   obs:{kerb:3, chain:3, chaos:2, drone:2, gull:1, sphinx:1},
   meet:{title:"Верховное собрание", who:[{id:"luis", dx:10}, {id:"dp", dx:62}], lines:[
     ["dp", "Так вот она — москвичка, на которую отозвался Петербург."],
     ["nat", "Я просто выразила мнение о поребрике!"],
     ["luis", "Город принял это очень близко к сердцу."]]}},
  {theme:"spbWhite", title:"Белая ночь", item:"feather", names:["перо", "пера", "перьев"], goal:12, speed:265,
   curses:CURSES,
   intro:"Белая ночь над каналом Грибоедова. Полиция хаоса уже стучит в дверь гостиницы «Океан», а над водой кружат золотые грифоны. Беги по набережной, пригибайся, когда грифон проносится над головой, и собирай золотые перья — по ним грифоны тебя узнают.",
   obs:{kerb:3, chain:2, griffin:3, chaos:2, puddle:1},
   meet:{title:"Грифоны ждут", who:[{id:"griffin", dx:40}], lines:[
     ["griffin", "Держитесь крепче."],
     ["nat", "Я в отпуске… Я просто в отпуске… И я лечу на грифоне!"]]}},
  {theme:"spbDawn", title:"Самокат против хаоса", item:"page", names:["страницу", "страницы", "страниц"], goal:12, speed:275,
   curses:CURSES,
   intro:"Рассвет на Невском. В Доме Зингера проснулись книги и разлетелись по проспекту. Пригибайся под летящими томами, перепрыгивай стопки книг и брошенные самокаты и собирай страницы — в них память города. Луис уже где-то рядом.",
   obs:{kerb:3, book:3, books:2, scooter:2, chaos:2},
   meet:{title:"Самокат против хаоса", who:[{id:"luisScooter", dx:50}], lines:[
     ["nat", "Вы приехали за мной… на самокате?"],
     ["luis", "Грифоны были заняты."],
     ["nat", "Ещё одно слово — и поеду я, а вы побежите."]]}},
  {theme:"spbSky", title:"Город на небе", item:"shard", names:["осколок", "осколка", "осколков"], goal:13, speed:285,
   curses:CURSES, firstCurse:"Даже на небе поребрики?!",
   intro:"Дмитрий Петрович поднял Петербург в небо: дворцы, театры и музеи висят над крышами, а между ними тянутся золотые дорожки. Беги по свету, пригибайся под обломками и золотыми нитями и собирай осколки памяти. И не удивляйся: поребрики есть даже здесь.",
   obs:{kerb:2, fragment:3, column:2, goldline:3, griffin:1},
   meet:{title:"Бело-розовая дорожка", who:[{id:"cap", dx:6}, {id:"luis", dx:58}], lines:[
     ["cap", "Дальше ведёт не приказ. Дальше — она."],
     ["luis", "Город говорит с вами честнее, чем мы."],
     ["nat", "Тогда я слушаю."]]}},
  {theme:"spbSunset", title:"Город возвращается", item:"petal", names:["лепесток", "лепестка", "лепестков"], goal:14, speed:295,
   curses:CURSES,
   intro:"Мост, который молчал, наконец заговорил, и Петербург опустился на землю. Закат на набережной. Пробеги последний путь, перепрыгни все поребрики и собери лепестки с бело-розовой дорожки. В конце тебя ждут все.",
   obs:{kerb:4, chain:2, penguin:2, puddle:1, bench:1, gull:1},
   meet:{title:"Конец истории", who:[{id:"ivan", dx:0}, {id:"cap", dx:46}, {id:"luis", dx:96}, {id:"penguins", dx:150}], lines:[
     ["ivan", "Пингвины? Это… из одной старой операции."],
     ["nat", "Этот город вообще бывает нормальным?"],
     ["luis", "Никогда. Он всегда был загадочным… любовь моя."]]}}
];
})();
