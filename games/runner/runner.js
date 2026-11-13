/* «Бегущая Наталья» — мини-игры между главами (раннер в духе динозавра Chrome).
   Подключается из index.html: window.LitmirRunner.mount(el, {slug, level, sfx, onNext, onBack}). Игры необязательные: открываются из раздела «Игры» на странице романа.
   Уровни описаны в LEVELS (по одному на каждые 5 глав). Графика рисуется кодом, без картинок. */
(function(){
"use strict";
const H = 360, GY = 300, TW = 1600, TAU = Math.PI * 2;
const clamp = (v, a, b) => v < a ? a : v > b ? b : v;
const lerp = (a, b, k) => a + (b - a) * k;
function rng(a){ return function(){ a |= 0; a = a + 0x6D2B79F5 | 0; let t = Math.imul(a ^ a >>> 15, 1 | a); t = t + Math.imul(t ^ t >>> 7, 61 | t) ^ t; return ((t ^ t >>> 14) >>> 0) / 4294967296; }; }
function hash(n){ n = Math.imul(n ^ 0x9e3779b9, 0x85ebca6b); n ^= n >>> 13; n = Math.imul(n, 0xc2b2ae35); return ((n ^ n >>> 16) >>> 0) / 4294967296; }
function lg(c, x0, y0, x1, y1, stops){ const g = c.createLinearGradient(x0, y0, x1, y1); stops.forEach((s, i) => g.addColorStop(i / (stops.length - 1), s)); return g; }
function glow(c, x, y, r, rgb, a){ const g = c.createRadialGradient(x, y, 0, x, y, r); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); c.fillStyle = g; c.fillRect(x - r, y - r, r * 2, r * 2); }
function rrect(c, x, y, w, h, r){ c.beginPath(); c.moveTo(x + r, y); c.arcTo(x + w, y, x + w, y + h, r); c.arcTo(x + w, y + h, x, y + h, r); c.arcTo(x, y + h, x, y, r); c.arcTo(x, y, x + w, y, r); c.closePath(); }
function ell(c, x, y, rx, ry, col){ c.beginPath(); c.ellipse(x, y, Math.max(.1, rx), Math.max(.1, ry), 0, 0, TAU); if (col) { c.fillStyle = col; c.fill(); } }
function wrap(x, w, f){ f(x); if (x + w > TW) f(x - TW); if (x < 0) f(x + TW); }
function plural(n, f){ const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? f[0] : a >= 2 && a <= 4 && (b < 10 || b >= 20) ? f[1] : f[2]; }

/* ───────── Наталья ───────── */
const SKIN = "#f1c7a6", SKIN_D = "#d9a582", HAIR = "#a9441f", HAIR_L = "#cf6a35", BLOUSE = "#f7efe0", SKIRT = "#cd7f80", SKIRT_D = "#a95c63";
const POSES = {
  idle: {hip:44, lean:.03, t1:.12, k1:.1, t2:-.1, k2:.15, a1:.2, e1:.35, a2:-.12, e2:.3, flare:0, lift:0},
  jump: {hip:44, lean:.14, t1:.95, k1:1.7, t2:-.35, k2:1.0, a1:2.5, e1:.35, a2:-.6, e2:.7, flare:1, lift:.85},
  fall: {hip:44, lean:.1, t1:.5, k1:.6, t2:-.15, k2:.5, a1:1.6, e1:.4, a2:-.3, e2:.5, flare:.7, lift:.5},
  duck: {hip:24, lean:1.12, t1:1.35, k1:.3, t2:.2, k2:2.0, a1:-.5, e1:.7, a2:1.2, e2:.6, flare:.6, lift:.2},
  hurt: {hip:41, lean:-.35, t1:.5, k1:.3, t2:-.4, k2:.8, a1:2.8, e1:.2, a2:2.3, e2:.3, flare:.4, lift:.4},
  trip: {hip:38, lean:.78, t1:-.55, k1:1.5, t2:.6, k2:.2, a1:2.1, e1:-.3, a2:1.7, e2:-.2, flare:.8, lift:.7, mouth:1}
};
function runPose(ph){
  const s = Math.sin(ph), s2 = Math.sin(ph + Math.PI);
  return {hip:43 + 2.4 * Math.cos(2 * ph), lean:.17,
    t1:.78 * s, k1:.25 + 1.15 * Math.max(0, Math.sin(ph - 1.35)),
    t2:.78 * s2, k2:.25 + 1.15 * Math.max(0, Math.sin(ph + Math.PI - 1.35)),
    a1:-.95 * s, e1:1.25, a2:.95 * s, e2:1.25, flare:.35 + .25 * Math.abs(s), lift:.15 + .1 * Math.sin(2 * ph)};
}
function drawLeg(c, hx, hy, t, k, col, shoe){
  const kx = hx + 21 * Math.sin(t), ky = hy + 21 * Math.cos(t);
  const ax = kx + 20 * Math.sin(t - k), ay = ky + 20 * Math.cos(t - k);
  c.strokeStyle = col; c.lineCap = "round"; c.lineWidth = 6.5;
  c.beginPath(); c.moveTo(hx, hy); c.lineTo(kx, ky); c.lineTo(ax, ay); c.stroke();
  c.save(); c.translate(ax, ay); c.rotate(t - k - .1);
  ell(c, 3.2, 1.5, 5.6, 2.8, shoe); c.restore();
}
function drawArm(c, sx, sy, a, e, sleeve, skin){
  const ex = sx + 13 * Math.sin(a), ey = sy + 13 * Math.cos(a);
  const hx = ex + 12 * Math.sin(a + e), hy = ey + 12 * Math.cos(a + e);
  c.lineCap = "round";
  c.strokeStyle = skin; c.lineWidth = 4.4; c.beginPath(); c.moveTo(ex, ey); c.lineTo(hx, hy); c.stroke();
  ell(c, hx, hy, 2.7, 2.7, skin);
  c.strokeStyle = sleeve; c.lineWidth = 7; c.beginPath(); c.moveTo(sx, sy); c.lineTo(ex, ey); c.stroke();
}
/* Внешность героини. S0 — Наталья из «Волн любви» (коса, рюкзак с лисом); другие романы задают свой стиль через ext.HEROES. */
const S0 = {skin:SKIN, skinD:SKIN_D, hair:HAIR, hairL:HAIR_L, style:"braid", top:[ "#e9dcc6", BLOUSE, "#fffaf0"], sleeve:BLOUSE, sleeveD:"#e6dac6", skirt:[SKIRT, SKIRT_D], belt:SKIRT_D, hem:26, pack:"fox", shoe:["#5b3a2b", "#4a2f22"]};
function drawNatalia(c, x, y, P, t, ph, S){
  S = S || S0;
  const hx = x, hy = y - P.hip;
  c.save();
  // ноги (дальняя темнее)
  drawLeg(c, hx - 1, hy - 2, P.t2, P.k2, S.skinD, S.shoe[1]);
  // дальняя рука
  c.save(); c.translate(hx, hy); c.rotate(P.lean);
  drawArm(c, -1, -33, P.a2, P.e2, S.sleeveD, S.skinD);
  c.restore();
  drawLeg(c, hx + 1, hy - 2, P.t1, P.k1, S.skin, S.shoe[0]);
  // юбка (в системе бедра, с частью наклона)
  c.save(); c.translate(hx, hy); c.rotate(P.lean * .35);
  const hem = Math.min(S.hem, P.hip - 3), fl = P.flare, wv = Math.sin(t * 15) * 1.6;
  const bx = -14 - fl * 9, fx = 12 + fl * 4;
  c.beginPath(); c.moveTo(-8.5, -6);
  c.quadraticCurveTo(-11 - fl * 3, hem * .5, bx, hem + wv);
  c.quadraticCurveTo((bx + fx) * .5 - 4, hem + 4 - wv, (bx + fx) * .5, hem + 1);
  c.quadraticCurveTo((bx + fx) * .5 + 4, hem - 2 + wv, fx, hem - 1 - wv * .5);
  c.quadraticCurveTo(10, hem * .45, 8.5, -6); c.closePath();
  c.fillStyle = lg(c, 0, -6, 0, hem + 4, S.skirt); c.fill();
  c.strokeStyle = S.pleats ? "rgba(0,0,0,.18)" : "rgba(255,255,255,.18)"; c.lineWidth = 1;
  c.beginPath();
  const np = S.pleats ? 5 : 2;
  for (let q = 0; q < np; q++) { const u = np === 2 ? (q ? .62 : .38) : (q + .5) / np, tx = lerp(-8, 8, u), bxq = lerp(bx, fx, u); c.moveTo(tx, -4); c.quadraticCurveTo(lerp(tx, bxq, .5), hem * .6, bxq, hem - 1); }
  c.stroke();
  if (S.print) { c.fillStyle = S.print; for (let q = 0; q < 9; q++) ell(c, -9 + (q * 7.3) % 18 - fl * 3, 3 + (q * 11) % (hem - 4), 1.3, 1.3); c.fill(); }
  c.restore();
  // торс
  c.save(); c.translate(hx, hy); c.rotate(P.lean);
  const sw = Math.sin(ph * 2) * .5, lift = P.lift;
  if (S.style === "braid") {
    for (let i = 0; i < 6; i++) {
      const bxp = -7 - i * (2.2 + lift * 3.2) - sw * i * .8, byp = -44 + i * 5 * (1 - lift * .75);
      ell(c, bxp, byp, 3.4 - i * .18, 3.9 - i * .15, i % 2 ? S.hair : S.hairL);
    }
    { const i = 6, bxp = -7 - i * (2.2 + lift * 3.2) - sw * i * .8, byp = -44 + i * 5 * (1 - lift * .75);
      ell(c, bxp, byp - 1.5, 2.6, 1.6, "#f4e7cf"); ell(c, bxp - .5, byp + 2, 2, 3, S.hairL); }
  }
  // шарф: хвост развевается за спиной
  if (S.scarf) {
    const fw = Math.sin(t * 11) * 2.5, fl2 = 6 + lift * 6;
    c.fillStyle = S.scarf[1]; c.beginPath(); c.moveTo(-3, -38); c.quadraticCurveTo(-10 - fl2, -36 + fw, -20 - fl2, -30 - fw); c.lineTo(-19 - fl2, -25 - fw); c.quadraticCurveTo(-9 - fl2 * .5, -30 + fw, -2, -33); c.closePath(); c.fill();
  }
  // верх: блузка, куртка или платье
  c.beginPath(); c.moveTo(-8, -3); c.lineTo(-9.5, -27); c.quadraticCurveTo(-9, -36, -3, -37); c.lineTo(5, -37); c.quadraticCurveTo(10, -35, 9.5, -27); c.lineTo(8.5, -3); c.closePath();
  c.fillStyle = lg(c, -9, 0, 9, 0, S.top); c.fill();
  c.strokeStyle = "rgba(120,80,60,.25)"; c.lineWidth = .8; c.stroke();
  if (S.quilt) { c.strokeStyle = "rgba(255,255,255,.4)"; c.lineWidth = .9; c.beginPath(); for (let q = 0; q < 4; q++) { c.moveTo(-9, -30 + q * 7); c.lineTo(9, -31 + q * 7); } c.stroke(); c.strokeStyle = "rgba(150,90,100,.5)"; c.beginPath(); c.moveTo(3, -36); c.lineTo(3, -4); c.stroke(); }
  if (S.print) { c.fillStyle = S.print; for (let q = 0; q < 6; q++) ell(c, -6 + (q * 5.3) % 13, -33 + (q * 9) % 26, 1.2, 1.2); c.fill(); }
  if (S.belt) { c.fillStyle = S.belt; c.fillRect(-8.6, -7, 17.2, 3); }
  if (S.pack === "fox") {
    const bob = Math.sin(ph * 2) * 1.2;
    rrect(c, -19, -35, 12, 25, 4); c.fillStyle = lg(c, -19, -35, -7, -10, ["#9a6643", "#74472d"]); c.fill();
    rrect(c, -19.5, -35, 13, 9, 4); c.fillStyle = "#83532f"; c.fill();
    c.fillStyle = "#e0b45a"; c.fillRect(-14, -28, 3, 3);
    c.save(); c.translate(-12, -38 + bob * .6);
    c.fillStyle = "#e46f22"; c.beginPath(); c.moveTo(-6, -3); c.lineTo(-7.5, -12 - bob * .4); c.lineTo(-2, -6); c.closePath(); c.fill();
    c.beginPath(); c.moveTo(0, -5); c.lineTo(1, -13 - bob * .4); c.lineTo(4, -4); c.closePath(); c.fill();
    c.fillStyle = "#3b1d10"; c.beginPath(); c.moveTo(-6.3, -5); c.lineTo(-7, -10.5 - bob * .4); c.lineTo(-4.4, -6.5); c.fill();
    ell(c, -1, -1, 6.5, 5.6, "#ec7a2a");
    c.fillStyle = "#fff6ea"; c.beginPath(); c.moveTo(-1, 1); c.quadraticCurveTo(4, -2, 9, 0); c.quadraticCurveTo(4, 5, -1, 4); c.closePath(); c.fill();
    ell(c, 9, 0, 1.5, 1.3, "#1e120c"); ell(c, 2, -2.8, 1.1, 1.3, "#1e120c");
    c.restore();
    c.strokeStyle = "#6b4127"; c.lineWidth = 2.2; c.beginPath(); c.moveTo(-6, -35); c.quadraticCurveTo(2, -26, 3, -12); c.stroke();
  } else if (S.pack === "bag") {
    // маленькая чёрная сумка на ремешке
    const bob = Math.sin(ph * 2) * 1.5;
    c.strokeStyle = "#1b1a1e"; c.lineWidth = 1.6; c.beginPath(); c.moveTo(4, -36); c.quadraticCurveTo(-4, -22, -9, -9 + bob); c.stroke();
    c.save(); c.translate(-11, -6 + bob); c.rotate(.12 + sw * .2); rrect(c, -6, -6, 12, 10, 2.5); c.fillStyle = "#1f1d22"; c.fill(); c.fillStyle = "#b9944f"; c.fillRect(-1.5, -3, 3, 2.4); c.restore();
  }
  // шея и голова
  c.fillStyle = S.skin; c.fillRect(-.5, -42, 5, 7);
  if (S.scarf) { c.fillStyle = lg(c, -6, -40, 10, -34, S.scarf); rrect(c, -5, -41.5, 14, 7, 3.4); c.fill(); c.fillStyle = "rgba(255,240,210,.35)"; for (let q = 0; q < 4; q++) ell(c, -2 + q * 3.2, -38, .8, .8); c.fill(); }
  if (S.style === "bun") {
    // тёмные кудри, собранные в небрежный пучок
    for (const [bx2, by2, r2] of [[-5.5, -61, 5.2], [-1.5, -63.5, 4.6], [-8.5, -57, 4.4], [-3.5, -58.5, 4.2]]) ell(c, bx2, by2, r2, r2, S.hair);
    c.strokeStyle = S.hairL; c.lineWidth = 1; c.beginPath(); c.arc(-4.5, -60.5, 2.6, .4, 4.2); c.moveTo(-1, -62); c.arc(-1.5, -63.5, 2, 1, 5); c.stroke();
  }
  ell(c, 1.2, -50.5, 11.6, 11.8, S.hair);
  ell(c, 4.8, -48, 9.4, 9.6, S.skin);
  c.fillStyle = S.hairL; c.beginPath(); c.moveTo(-6, -55); c.quadraticCurveTo(4, -64, 13, -53); c.quadraticCurveTo(9, -55, 7, -51); c.quadraticCurveTo(4, -56, -1, -52); c.closePath(); c.fill();
  c.fillStyle = S.hair; c.beginPath(); c.moveTo(-9, -52); c.quadraticCurveTo(-11, -42, -6, -38); c.lineTo(-3, -46); c.closePath(); c.fill();
  if (S.style === "bun") { c.strokeStyle = S.hair; c.lineWidth = 1.6; c.beginPath(); c.moveTo(11, -52); c.quadraticCurveTo(14 + Math.sin(t * 6), -46, 12, -41); c.stroke(); }
  ell(c, -2, -57, 4, 1.4, "rgba(255,200,150,.35)");
  // лицо
  ell(c, 9.2, -48.6, 1.25, 1.75, S.eye || "#3a2418");
  ell(c, 9.6, -49.3, .45, .45, "#fff");
  c.strokeStyle = S.brow || "#7a3a1c"; c.lineWidth = .9; c.beginPath(); c.moveTo(7.6, -52.2); c.quadraticCurveTo(9.4, -53.4, 11.2, -52.4); c.stroke();
  ell(c, 8.4, -44.6, 2.2, 1.3, "rgba(240,120,110,.35)");
  c.strokeStyle = "#a2493c"; c.lineWidth = 1.1; c.beginPath();
  if (P.mouth > .15) { ell(c, 11.8, -43.2, 1.5, 1.8 * P.mouth, "#7b2f2a"); } else { c.moveTo(10.2, -43.4); c.quadraticCurveTo(11.8, -42.4, 13.1, -43.8); c.stroke(); }
  ell(c, -.2, -47.6, 1.7, 2.6, S.skinD);
  // ближняя рука
  drawArm(c, 1, -33, P.a1, P.e1, S.sleeve, S.skin);
  c.restore();
  c.restore();
}

/* ───────── Препятствия ─────────
   kind g — стоит на земле (прыгать), a — висит/летит (пригибаться).
   hb: dx, w — по горизонтали; top/bottom — высота над землёй. */
const OB = {
  puddle:{w:72, hb:{dx:10, w:52, top:7, bottom:0}, draw(c, x, t){ c.save(); ell(c, x + 36, GY + 5, 36, 7); c.fillStyle = lg(c, x, GY, x + 72, GY + 10, ["#6fa8c8", "#9fd0e6", "#5b8fb0"]); c.fill(); c.strokeStyle = "rgba(255,255,255,.7)"; c.lineWidth = 1.4; c.beginPath(); c.ellipse(x + 30, GY + 4, 14, 2.4, 0, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); const r = (t * 1.3) % 1; c.strokeStyle = `rgba(255,255,255,${.6 - r * .6})`; c.beginPath(); c.ellipse(x + 46, GY + 5, 3 + r * 10, .8 + r * 2.4, 0, 0, TAU); c.stroke(); c.restore(); }},
  pot:{w:34, hb:{dx:5, w:24, top:46, bottom:0}, draw(c, x, t){ c.save(); const sw = Math.sin(t * 2) * 1; for (let i = 0; i < 9; i++) { const a = -1.2 + i * .3; ell(c, x + 17 + Math.sin(a) * 9 + sw, GY - 34 - Math.cos(a) * 9, 5, 3.4, i % 2 ? "#4f8f3c" : "#6cad4f"); } c.beginPath(); c.moveTo(x + 4, GY - 28); c.lineTo(x + 30, GY - 28); c.lineTo(x + 26, GY); c.lineTo(x + 8, GY); c.closePath(); c.fillStyle = lg(c, x, 0, x + 34, 0, ["#b5532f", "#d9774a", "#a24526"]); c.fill(); c.fillStyle = "#c4613a"; rrect(c, x + 2, GY - 31, 30, 6, 2); c.fill(); c.restore(); }},
  bike:{w:66, hb:{dx:6, w:54, top:40, bottom:0}, draw(c, x){ c.save(); c.strokeStyle = "#2b2b30"; c.lineWidth = 2.6; for (const wx of [x + 14, x + 52]) { c.beginPath(); c.arc(wx, GY - 13, 12.5, 0, TAU); c.stroke(); c.strokeStyle = "rgba(60,60,70,.5)"; c.lineWidth = .7; for (let k = 0; k < 6; k++) { c.beginPath(); c.moveTo(wx, GY - 13); c.lineTo(wx + Math.cos(k) * 12, GY - 13 + Math.sin(k) * 12); c.stroke(); } c.strokeStyle = "#2b2b30"; c.lineWidth = 2.6; } c.strokeStyle = "#3d8f86"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 14, GY - 13); c.lineTo(x + 28, GY - 30); c.lineTo(x + 46, GY - 30); c.lineTo(x + 52, GY - 13); c.moveTo(x + 28, GY - 30); c.lineTo(x + 33, GY - 13); c.lineTo(x + 46, GY - 30); c.moveTo(x + 46, GY - 30); c.lineTo(x + 49, GY - 38); c.stroke(); c.fillStyle = "#3a2a20"; rrect(c, x + 22, GY - 35, 12, 4, 2); c.fill(); c.strokeStyle = "#2b2b30"; c.lineWidth = 2; c.beginPath(); c.moveTo(x + 44, GY - 39); c.lineTo(x + 55, GY - 40); c.stroke(); c.fillStyle = "#c79a5b"; rrect(c, x + 50, GY - 46, 14, 9, 2); c.fill(); ell(c, x + 54, GY - 48, 2.5, 2.5, "#e2463f"); ell(c, x + 59, GY - 48, 2.5, 2.5, "#f2c14e"); c.restore(); }},
  basket:{w:44, hb:{dx:3, w:38, top:32, bottom:0}, draw(c, x){ c.save(); ell(c, x + 15, GY - 26, 10, 7, "#f2f2f2"); ell(c, x + 28, GY - 25, 9, 6, "#e88a8a"); ell(c, x + 22, GY - 29, 7, 5, "#8ec1e6"); c.beginPath(); c.moveTo(x + 3, GY - 24); c.lineTo(x + 41, GY - 24); c.lineTo(x + 37, GY); c.lineTo(x + 7, GY); c.closePath(); c.fillStyle = "#c79a5b"; c.fill(); c.strokeStyle = "#9c7340"; c.lineWidth = 1.2; for (let k = 0; k < 4; k++) { c.beginPath(); c.moveTo(x + 5, GY - 19 + k * 5); c.lineTo(x + 39, GY - 19 + k * 5); c.stroke(); } c.restore(); }},
  laundry:{w:100, hb:{dx:8, w:84, top:130, bottom:60}, draw(c, x, t){ c.save(); c.strokeStyle = "#e9e2d4"; c.lineWidth = 1.5; c.beginPath(); c.moveTo(x - 40, GY - 175); c.quadraticCurveTo(x + 50, GY - 108, x + 140, GY - 175); c.stroke(); const cols = ["#f4f1ea", "#d7615d", "#6fa9d6", "#f2c14e"]; for (let k = 0; k < 4; k++) { const cx = x + 12 + k * 23, cy = GY - 128 + Math.abs(k - 1.5) * 2.5, sw = Math.sin(t * 3 + k) * 2; c.save(); c.translate(cx, cy); c.rotate(sw * .03); c.fillStyle = cols[k]; if (k % 2) { c.beginPath(); c.moveTo(-9, 0); c.lineTo(9, 0); c.lineTo(10, 64); c.lineTo(-8, 66); c.closePath(); c.fill(); } else { c.beginPath(); c.moveTo(-10, 0); c.lineTo(10, 0); c.lineTo(14, 9); c.lineTo(9, 12); c.lineTo(9, 66); c.lineTo(-9, 66); c.lineTo(-9, 12); c.lineTo(-14, 9); c.closePath(); c.fill(); } c.fillStyle = "rgba(0,0,0,.08)"; c.fillRect(-9, 40, 18, 4); c.fillStyle = "#b5895a"; c.fillRect(-1.5, -3, 3, 6); c.restore(); } c.restore(); }},
  gull:{w:46, vx:60, hb:{dx:6, w:34, top:94, bottom:66}, draw(c, x, t){ c.save(); const y = GY - 80 + Math.sin(t * 3) * 3, f = Math.sin(t * 12); ell(c, x + 23, y, 11, 5.5, "#f7f7f5"); ell(c, x + 12, y - 2, 5, 4.4, "#ffffff"); c.fillStyle = "#f0a12a"; c.beginPath(); c.moveTo(x + 7, y - 2); c.lineTo(x + 1, y - 1); c.lineTo(x + 7, y); c.fill(); ell(c, x + 10, y - 3, .9, .9, "#222"); c.fillStyle = "#c9ced3"; c.beginPath(); c.moveTo(x + 17, y - 2); c.quadraticCurveTo(x + 24, y - 14 * f - 4, x + 36, y - 18 * f - 2); c.quadraticCurveTo(x + 28, y - 4, x + 28, y); c.closePath(); c.fill(); c.fillStyle = "#555b62"; c.beginPath(); c.moveTo(x + 36, y - 18 * f - 2); c.lineTo(x + 31, y - 12 * f - 3); c.lineTo(x + 33, y - 9 * f); c.fill(); c.fillStyle = "#e9ecee"; c.beginPath(); c.moveTo(x + 33, y); c.lineTo(x + 42, y - 2); c.lineTo(x + 40, y + 3); c.fill(); c.restore(); }},
  bench:{w:62, hb:{dx:2, w:58, top:34, bottom:0}, draw(c, x){ c.save(); c.fillStyle = "#2a2833"; c.fillRect(x + 6, GY - 20, 4, 20); c.fillRect(x + 52, GY - 20, 4, 20); c.fillRect(x + 6, GY - 36, 3, 16); c.fillRect(x + 53, GY - 36, 3, 16); c.fillStyle = "#6b4a33"; for (let k = 0; k < 2; k++) { rrect(c, x, GY - 22 + k * 0, 62, 4, 1.5); c.fill(); } c.fillStyle = "#5a3d2a"; rrect(c, x + 2, GY - 34, 58, 4, 1.5); c.fill(); rrect(c, x + 2, GY - 28, 58, 4, 1.5); c.fill(); c.restore(); }},
  bin:{w:30, hb:{dx:2, w:26, top:44, bottom:0}, draw(c, x){ c.save(); c.fillStyle = lg(c, x, 0, x + 30, 0, ["#2f4f3e", "#43705a", "#2a463a"]); rrect(c, x + 2, GY - 38, 26, 38, 3); c.fill(); c.fillStyle = "#24392e"; rrect(c, x, GY - 44, 30, 7, 3); c.fill(); c.strokeStyle = "rgba(255,255,255,.12)"; c.lineWidth = 1; for (let k = 0; k < 3; k++) { c.beginPath(); c.moveTo(x + 8 + k * 7, GY - 34); c.lineTo(x + 8 + k * 7, GY - 4); c.stroke(); } c.restore(); }},
  cat:{w:34, hb:{dx:5, w:24, top:32, bottom:0}, draw(c, x, t){ c.save(); const tl = Math.sin(t * 2.5) * 4; c.strokeStyle = "#141420"; c.lineWidth = 4; c.lineCap = "round"; c.beginPath(); c.moveTo(x + 6, GY - 4); c.quadraticCurveTo(x - 6, GY - 8, x - 2 + tl, GY - 22); c.stroke(); ell(c, x + 16, GY - 11, 11, 11, "#141420"); ell(c, x + 20, GY - 26, 7.5, 7, "#141420"); c.fillStyle = "#141420"; c.beginPath(); c.moveTo(x + 14, GY - 30); c.lineTo(x + 15, GY - 38); c.lineTo(x + 19, GY - 32); c.moveTo(x + 21, GY - 32); c.lineTo(x + 26, GY - 38); c.lineTo(x + 26, GY - 29); c.fill(); const bl = (t % 3) > 2.85 ? .3 : 1; ell(c, x + 18, GY - 27, 1.8, 1.8 * bl, "#ffd34d"); ell(c, x + 24, GY - 27, 1.8, 1.8 * bl, "#ffd34d"); glow(c, x + 21, GY - 27, 10, "255,210,80", .25); c.restore(); }},
  thread:{w:24, hb:{dx:6, w:12, top:999, bottom:58}, draw(c, x, t){ c.save(); const sw = Math.sin(t * 1.7 + x * .01) * 6, by = GY - 58; for (let k = 0; k < 3; k++) { c.strokeStyle = k === 1 ? "rgba(205,210,220,.9)" : "rgba(150,156,170,.6)"; c.lineWidth = k === 1 ? 2 : 1.2; c.beginPath(); c.moveTo(x + 12 + (k - 1) * 3, -10); c.bezierCurveTo(x + 12 - sw, by * .35, x + 12 + sw + (k - 1) * 4, by * .7, x + 12 + (k - 1) * 2, by); c.stroke(); } glow(c, x + 12, by, 18, "190,196,210", .45 + .2 * Math.sin(t * 4)); ell(c, x + 12, by, 4.5, 4.5, "#c7ccd6"); ell(c, x + 11, by - 1, 1.6, 1.6, "#fff"); c.restore(); }},
  cone:{w:26, hb:{dx:4, w:18, top:36, bottom:0}, draw(c, x){ c.save(); c.fillStyle = "#2b2b2b"; c.fillRect(x, GY - 4, 26, 4); c.beginPath(); c.moveTo(x + 4, GY - 4); c.lineTo(x + 11, GY - 38); c.lineTo(x + 15, GY - 38); c.lineTo(x + 22, GY - 4); c.closePath(); c.fillStyle = lg(c, x, 0, x + 26, 0, ["#e2581c", "#ff7a2e", "#d14d16"]); c.fill(); c.fillStyle = "#f5f5f5"; c.beginPath(); c.moveTo(x + 7.5, GY - 20); c.lineTo(x + 18.5, GY - 20); c.lineTo(x + 17.3, GY - 26); c.lineTo(x + 8.7, GY - 26); c.fill(); c.restore(); }},
  barrier:{w:60, hb:{dx:2, w:56, top:40, bottom:0}, draw(c, x, t){ c.save(); c.fillStyle = "#3a3a40"; c.fillRect(x + 8, GY - 30, 4, 30); c.fillRect(x + 48, GY - 30, 4, 30); c.fillRect(x + 3, GY - 3, 14, 3); c.fillRect(x + 43, GY - 3, 14, 3); c.save(); rrect(c, x, GY - 36, 60, 11, 2); c.clip(); c.fillStyle = "#f4f4f4"; c.fillRect(x, GY - 36, 60, 11); c.fillStyle = "#d3302f"; for (let k = -1; k < 6; k++) { c.beginPath(); c.moveTo(x + k * 12, GY - 25); c.lineTo(x + k * 12 + 6, GY - 25); c.lineTo(x + k * 12 + 17, GY - 36); c.lineTo(x + k * 12 + 11, GY - 36); c.fill(); } c.restore(); const on = Math.sin(t * 8) > 0; ell(c, x + 30, GY - 40, 3.5, 3.5, on ? "#ffb02e" : "#7a5320"); if (on) glow(c, x + 30, GY - 40, 16, "255,170,40", .6); c.restore(); }},
  drone:{w:54, vx:40, hb:{dx:6, w:42, top:94, bottom:66}, draw(c, x, t){ c.save(); const y = GY - 80 + Math.sin(t * 4) * 3; c.strokeStyle = "#3a3d44"; c.lineWidth = 2.5; c.beginPath(); c.moveTo(x + 8, y - 6); c.lineTo(x + 46, y - 6); c.stroke(); for (const px of [x + 8, x + 46]) { c.fillStyle = "rgba(200,210,220,.45)"; ell(c, px, y - 9, 11 * Math.abs(Math.sin(t * 40)) + 3, 1.6); c.fill(); } rrect(c, x + 15, y - 8, 24, 10, 4); c.fillStyle = "#2c2f36"; c.fill(); ell(c, x + 20, y + 3, 4, 3.6, "#15171b"); ell(c, x + 19, y + 2.5, 1.4, 1.4, "#5fb8ff"); const b = Math.floor(t * 6) % 2; ell(c, x + 37, y - 3, 1.8, 1.8, b ? "#ff3b3b" : "#3b7bff"); glow(c, x + 37, y - 3, 12, b ? "255,60,60" : "60,120,255", .7); c.restore(); }},
  lowcable:{w:150, hb:{dx:45, w:60, top:118, bottom:60}, draw(c, x, t, o){ c.save(); const sag = GY - 64; c.strokeStyle = "#22222a"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x - 10, -10); c.quadraticCurveTo(x + 75, sag * 2 + 20, x + 160, -10); c.stroke(); if (o && o.pig) { for (let k = 0; k < 3; k++) { const px = x + 56 + k * 16, py = GY - 66 + Math.abs(k - 1) * 2; ell(c, px, py - 6, 6, 5, "#8d93a0"); ell(c, px + 4, py - 11, 3.6, 3.4, "#7a808d"); ell(c, px + 5, py - 11.5, .8, .8, "#f8d36a"); c.fillStyle = "#e9a24a"; c.beginPath(); c.moveTo(px + 7, py - 11); c.lineTo(px + 10, py - 10); c.lineTo(px + 7, py - 9.5); c.fill(); } } c.restore(); }},
  bucket:{w:32, hb:{dx:3, w:26, top:32, bottom:0}, draw(c, x){ c.save(); c.strokeStyle = "#a07b4c"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 18, GY - 20); c.lineTo(x + 34, GY - 62); c.stroke(); c.beginPath(); c.moveTo(x + 4, GY - 26); c.lineTo(x + 28, GY - 26); c.lineTo(x + 25, GY); c.lineTo(x + 7, GY); c.closePath(); c.fillStyle = lg(c, x, 0, x + 32, 0, ["#7f8a94", "#b9c3cb", "#6d7780"]); c.fill(); ell(c, x + 16, GY - 26, 12, 3, "#4f6c86"); c.strokeStyle = "#596570"; c.lineWidth = 1.2; c.beginPath(); c.arc(x + 16, GY - 24, 13, Math.PI * 1.1, Math.PI * 1.9); c.stroke(); c.restore(); }},
  folders:{w:42, hb:{dx:3, w:36, top:50, bottom:0}, draw(c, x){ c.save(); const cols = ["#c9b27a", "#8aa4c2", "#d08a74", "#a9b98a", "#c9b27a", "#e9e4d8"]; for (let k = 0; k < 6; k++) { c.fillStyle = cols[k]; rrect(c, x + 2 + (k % 2) * 3 - (k % 3), GY - 8 - k * 8, 36, 8, 1.5); c.fill(); c.fillStyle = "rgba(255,255,255,.5)"; c.fillRect(x + 6 + (k % 2) * 3, GY - 6 - k * 8, 22, 1); } c.fillStyle = "#c0392b"; c.font = "bold 6px sans-serif"; c.fillText("СЕКРЕТНО", x + 8, GY - 43); c.restore(); }},
  cart:{w:60, hb:{dx:2, w:56, top:46, bottom:0}, draw(c, x){ c.save(); c.fillStyle = "#2d5f8a"; rrect(c, x + 2, GY - 44, 52, 34, 3); c.fill(); c.fillStyle = "#3b77aa"; c.fillRect(x + 6, GY - 40, 20, 26); c.fillStyle = "#f2c14e"; rrect(c, x + 30, GY - 52, 14, 14, 2); c.fill(); c.fillStyle = "#e8eef2"; c.fillRect(x + 8, GY - 50, 10, 8); c.strokeStyle = "#7a8590"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 54, GY - 30); c.lineTo(x + 60, GY - 48); c.stroke(); for (const wx of [x + 12, x + 46]) { ell(c, wx, GY - 5, 5, 5, "#222"); ell(c, wx, GY - 5, 1.8, 1.8, "#888"); } c.restore(); }},
  stamp:{w:48, vx:80, hb:{dx:4, w:40, top:106, bottom:62}, draw(c, x, t){ c.save(); const y = GY - 84 + Math.sin(t * 5) * 4; c.translate(x + 24, y); c.rotate(Math.sin(t * 3) * .18); c.fillStyle = "#6b4a33"; ell(c, 0, -22, 7, 6); c.fill(); c.fillRect(-3, -18, 6, 12); c.fillStyle = "#3a3a40"; rrect(c, -18, -7, 36, 8, 2); c.fill(); c.fillStyle = "#b8282b"; rrect(c, -19, 1, 38, 9, 2); c.fill(); c.fillStyle = "#fff"; c.font = "bold 8px sans-serif"; c.textAlign = "center"; c.fillText("НЕТ", 0, 8.5); c.restore(); }},
  camera:{w:44, hb:{dx:6, w:30, top:999, bottom:60}, draw(c, x, t){ c.save(); c.fillStyle = "#4a4f57"; c.fillRect(x + 20, -10, 5, GY - 70); c.translate(x + 22, GY - 72); c.rotate(.25 + Math.sin(t * 1.2) * .25); c.fillStyle = "rgba(255,80,80,.08)"; c.beginPath(); c.moveTo(-10, 6); c.lineTo(-90, 80); c.lineTo(-10, 90); c.closePath(); c.fill(); rrect(c, -18, -2, 30, 13, 3); c.fillStyle = "#e4e7ea"; c.fill(); c.fillStyle = "#30343a"; rrect(c, -22, 0, 6, 9, 2); c.fill(); const on = Math.floor(t * 3) % 2; ell(c, 8, 2, 1.8, 1.8, on ? "#ff2d2d" : "#661b1b"); if (on) glow(c, 8, 2, 9, "255,40,40", .7); c.restore(); }},
  crate:{w:42, hb:{dx:2, w:38, top:40, bottom:0}, draw(c, x){ c.save(); c.fillStyle = lg(c, x, 0, x + 42, 0, ["#8a6038", "#a87a4a", "#7c5532"]); c.fillRect(x + 1, GY - 40, 40, 40); c.strokeStyle = "#5e3f22"; c.lineWidth = 2.4; c.strokeRect(x + 2, GY - 39, 38, 38); c.beginPath(); c.moveTo(x + 3, GY - 38); c.lineTo(x + 39, GY - 2); c.moveTo(x + 39, GY - 38); c.lineTo(x + 3, GY - 2); c.stroke(); c.strokeStyle = "rgba(255,230,190,.15)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 2, GY - 27); c.lineTo(x + 40, GY - 27); c.moveTo(x + 2, GY - 14); c.lineTo(x + 40, GY - 14); c.stroke(); c.restore(); }},
  rope:{w:46, hb:{dx:5, w:36, top:18, bottom:0}, draw(c, x){ c.save(); for (let k = 0; k < 4; k++) { c.strokeStyle = k % 2 ? "#c9a46a" : "#b38a50"; c.lineWidth = 4; c.beginPath(); c.ellipse(x + 23, GY - 4 - k * 3.6, 20 - k * 3, 5 - k * .6, 0, 0, TAU); c.stroke(); } c.restore(); }},
  bollard:{w:30, hb:{dx:3, w:24, top:32, bottom:0}, draw(c, x){ c.save(); c.fillStyle = "#1d1f25"; rrect(c, x + 5, GY - 26, 20, 26, 3); c.fill(); ell(c, x + 15, GY - 27, 13, 5, "#2a2d35"); ell(c, x + 15, GY - 29, 9, 3, "#3a3e48"); c.strokeStyle = "#b8925a"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 4, GY - 16); c.quadraticCurveTo(x + 15, GY - 10, x + 26, GY - 16); c.moveTo(x + 26, GY - 16); c.quadraticCurveTo(x + 40, GY - 6, x + 52, GY - 2); c.stroke(); c.restore(); }},
  shadow:{w:64, vx:50, hb:{dx:12, w:40, top:106, bottom:64}, draw(c, x, t){ c.save(); const y = GY - 86 + Math.sin(t * 2.6) * 5; for (let k = 6; k >= 0; k--) { const px = x + 22 + k * 8 + Math.sin(t * 5 + k) * 2, py = y + Math.sin(t * 3 + k * .8) * 4; ell(c, px, py, 16 - k * 1.6, 13 - k * 1.4, `rgba(8,6,14,${.92 - k * .11})`); } glow(c, x + 24, y, 34, "60,40,90", .35); c.fillStyle = "#e9f0ff"; c.beginPath(); c.ellipse(x + 17, y - 3, 3.6, 1.6, -.25, 0, TAU); c.fill(); c.beginPath(); c.ellipse(x + 27, y - 3, 3.6, 1.6, .25, 0, TAU); c.fill(); c.restore(); }},
  chimney:{w:38, hb:{dx:3, w:32, top:56, bottom:0}, draw(c, x, t){ c.save(); for (let k = 0; k < 3; k++) { const p = (t * .5 + k / 3) % 1; ell(c, x + 19 + p * 14, GY - 62 - p * 50, 6 + p * 10, 5 + p * 8, `rgba(180,180,195,${.35 * (1 - p)})`); } c.fillStyle = "#8a4632"; c.fillRect(x + 4, GY - 52, 30, 52); c.strokeStyle = "rgba(40,15,10,.4)"; c.lineWidth = 1; for (let r = 0; r < 7; r++) { c.beginPath(); c.moveTo(x + 4, GY - 52 + r * 7.5); c.lineTo(x + 34, GY - 52 + r * 7.5); c.stroke(); for (let q = 0; q < 3; q++) { const bx = x + 4 + (q * 10 + (r % 2) * 5); c.beginPath(); c.moveTo(bx, GY - 52 + r * 7.5); c.lineTo(bx, GY - 44.5 + r * 7.5); c.stroke(); } } c.fillStyle = "#5b2d22"; c.fillRect(x, GY - 58, 38, 7); c.restore(); }},
  antenna:{w:46, hb:{dx:17, w:12, top:62, bottom:0}, draw(c, x){ c.save(); c.strokeStyle = "#9aa0ab"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 23, GY); c.lineTo(x + 23, GY - 62); for (let k = 0; k < 4; k++) { const w = 20 - k * 4; c.moveTo(x + 23 - w, GY - 58 + k * 9); c.lineTo(x + 23 + w, GY - 58 + k * 9); } c.stroke(); c.fillStyle = "#555b66"; c.fillRect(x + 16, GY - 4, 14, 4); c.restore(); }},
  vent:{w:36, hb:{dx:3, w:30, top:32, bottom:0}, draw(c, x, t){ c.save(); c.fillStyle = lg(c, x, 0, x + 36, 0, ["#7d8792", "#b7c0c8", "#6f7882"]); c.fillRect(x + 8, GY - 20, 20, 20); c.save(); c.translate(x + 18, GY - 26); c.scale(1, .55); const a = t * 6; for (let k = 0; k < 6; k++) { c.fillStyle = k % 2 ? "#aab3bb" : "#d4dbe0"; c.beginPath(); c.moveTo(0, 0); c.arc(0, 0, 15, a + k * TAU / 6, a + (k + 1) * TAU / 6); c.fill(); } c.restore(); ell(c, x + 18, GY - 34, 4, 2.4, "#6f7882"); c.restore(); }},
  pbarrier:{w:64, hb:{dx:2, w:60, top:42, bottom:0}, draw(c, x){ c.save(); c.strokeStyle = "#a9b1ba"; c.lineWidth = 3; c.strokeRect(x + 3, GY - 40, 58, 32); c.lineWidth = 1.6; for (let k = 1; k < 9; k++) { c.beginPath(); c.moveTo(x + 3 + k * 6.4, GY - 40); c.lineTo(x + 3 + k * 6.4, GY - 8); c.stroke(); } c.lineWidth = 3; c.beginPath(); c.moveTo(x + 6, GY - 8); c.lineTo(x, GY); c.moveTo(x + 6, GY - 8); c.lineTo(x + 14, GY); c.moveTo(x + 58, GY - 8); c.lineTo(x + 50, GY); c.moveTo(x + 58, GY - 8); c.lineTo(x + 64, GY); c.stroke(); c.fillStyle = "#c62f2f"; rrect(c, x + 18, GY - 34, 28, 12, 2); c.fill(); c.fillStyle = "#fff"; c.font = "bold 8px sans-serif"; c.textAlign = "center"; c.fillText("СТОП", x + 32, GY - 25); c.restore(); }},
  drum:{w:38, hb:{dx:2, w:34, top:38, bottom:0}, draw(c, x){ c.save(); c.fillStyle = "#c33a36"; c.fillRect(x + 3, GY - 32, 32, 28); ell(c, x + 19, GY - 4, 16, 4, "#9e2b28"); ell(c, x + 19, GY - 32, 16, 4.5, "#f3ecdc"); c.strokeStyle = "#f2d27a"; c.lineWidth = 1.6; c.beginPath(); for (let k = 0; k <= 6; k++) c.lineTo(x + 3 + k * 5.33, GY - (k % 2 ? 8 : 28)); c.stroke(); c.strokeStyle = "#7a4a2a"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(x + 10, GY - 34); c.lineTo(x + 2, GY - 48); c.moveTo(x + 26, GY - 34); c.lineTo(x + 36, GY - 46); c.stroke(); c.restore(); }},
  chair:{w:36, hb:{dx:3, w:30, top:46, bottom:0}, draw(c, x){ c.save(); c.strokeStyle = "#3b6e8f"; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 6, GY); c.lineTo(x + 28, GY - 24); c.moveTo(x + 28, GY); c.lineTo(x + 8, GY - 24); c.moveTo(x + 28, GY - 24); c.lineTo(x + 28, GY - 46); c.stroke(); c.fillStyle = "#4e88ad"; rrect(c, x + 4, GY - 27, 28, 5, 2); c.fill(); rrect(c, x + 25, GY - 46, 7, 18, 2); c.fill(); c.restore(); }},
  flags:{w:170, hb:{dx:40, w:90, top:999, bottom:60}, draw(c, x, t){ c.save(); c.strokeStyle = "#5a4a3a"; c.lineWidth = 1.4; const sag = GY - 82; c.beginPath(); c.moveTo(x - 10, -10); c.quadraticCurveTo(x + 85, sag * 2 + 10, x + 180, -10); c.stroke(); const cols = ["#e94b3c", "#f7c948", "#3fa7d6", "#59c36a", "#f28ab2", "#ffffff"]; for (let k = 0; k < 9; k++) { const u = (k + .5) / 9, px = x - 10 + u * 190, py = (1 - u) * (1 - u) * -10 + 2 * u * (1 - u) * (sag * 2 + 10) + u * u * -10; if (py < 20) continue; const sw = Math.sin(t * 4 + k) * 2; c.fillStyle = cols[k % 6]; c.beginPath(); c.moveTo(px - 7, py); c.lineTo(px + 7, py); c.lineTo(px + sw, py + 20); c.closePath(); c.fill(); } c.restore(); }},
  gear:{w:50, vx:90, hb:{dx:7, w:36, top:42, bottom:0}, draw(c, x, t){ c.save(); c.translate(x + 25, GY - 22); c.rotate(-t * 7); c.fillStyle = "#b4893f"; c.beginPath(); for (let k = 0; k < 20; k++) { const r = k % 2 ? 22 : 17, a = k / 20 * TAU; c.lineTo(Math.cos(a) * r, Math.sin(a) * r); } c.closePath(); c.fill(); ell(c, 0, 0, 13, 13, "#d4a752"); ell(c, 0, 0, 5, 5, "#5a3d1e"); c.fillStyle = "#8e6a2e"; for (let k = 0; k < 4; k++) { c.rotate(TAU / 4); c.fillRect(6, -2, 6, 4); } c.restore(); }},
  step:{w:56, hb:{dx:2, w:52, top:24, bottom:0}, draw(c, x){ c.save(); c.fillStyle = lg(c, 0, GY - 24, 0, GY, ["#8f7d69", "#6b5b4b"]); c.fillRect(x, GY - 24, 56, 24); c.fillStyle = "#a8957f"; c.fillRect(x, GY - 24, 56, 4); c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x + 22, GY - 20); c.lineTo(x + 26, GY - 10); c.lineTo(x + 22, GY); c.stroke(); c.restore(); }},
  weight:{w:46, hb:{dx:5, w:36, top:999, bottom:60}, draw(c, x, t){ c.save(); const sw = Math.sin(t * 2.2 + x * .02) * 3; c.strokeStyle = "#5c5146"; c.lineWidth = 3; c.setLineDash([5, 3]); c.beginPath(); c.moveTo(x + 23, -10); c.lineTo(x + 23 + sw, GY - 104); c.stroke(); c.setLineDash([]); c.fillStyle = lg(c, x, 0, x + 46, 0, ["#3e3833", "#6d635a", "#37312c"]); rrect(c, x + 5 + sw, GY - 104, 36, 44, 4); c.fill(); c.fillStyle = "#a07c3e"; c.fillRect(x + 5 + sw, GY - 94, 36, 4); c.fillRect(x + 5 + sw, GY - 74, 36, 4); c.restore(); }}
};

/* ───────── Предметы ───────── */
const ITEM = {
  smile(c, x, y, t){ glow(c, x, y, 26, "255,210,90", .55); ell(c, x, y, 12, 12); c.fillStyle = lg(c, x, y - 12, x, y + 12, ["#ffe98a", "#f6b42c"]); c.fill(); ell(c, x - 4, y - 3, 1.6, 2.2, "#6b3b12"); ell(c, x + 4, y - 3, 1.6, 2.2, "#6b3b12"); c.strokeStyle = "#6b3b12"; c.lineWidth = 1.8; c.lineCap = "round"; c.beginPath(); c.arc(x, y + 1, 6, .25, Math.PI - .25); c.stroke(); ell(c, x - 4, y - 7, 3, 1.6, "rgba(255,255,255,.6)"); },
  note(c, x, y, t){ glow(c, x, y, 26, "255,214,120", .55); c.fillStyle = "#ffd36e"; c.strokeStyle = "#ffd36e"; c.save(); c.translate(x, y); c.rotate(-.15); ell(c, -4, 8, 6, 4.4); c.fill(); c.lineWidth = 2.4; c.beginPath(); c.moveTo(1.5, 8); c.lineTo(1.5, -12); c.quadraticCurveTo(9, -8, 9, 0); c.stroke(); c.restore(); },
  wave(c, x, y, t){ glow(c, x, y, 26, "120,220,255", .5); ell(c, x - 6, y + 2, 3.4, 3.4, "#bff0ff"); c.strokeStyle = "#8fe3ff"; c.lineCap = "round"; for (let k = 1; k <= 3; k++) { c.globalAlpha = .4 + .6 * ((Math.sin(t * 6 - k) + 1) / 2); c.lineWidth = 2.2; c.beginPath(); c.arc(x - 6, y + 2, k * 5.5, -.8, .8); c.stroke(); } c.globalAlpha = 1; },
  card(c, x, y, t){ glow(c, x, y, 26, "255,150,190", .5); c.save(); c.translate(x, y); c.rotate(Math.sin(t * 3) * .2); rrect(c, -10, -12, 20, 24, 3); c.fillStyle = "#ffd6e3"; c.fill(); c.strokeStyle = "#e57ea0"; c.lineWidth = 1.2; c.stroke(); ell(c, -3.5, -3, 1.4, 1.8, "#8b2d4c"); ell(c, 3.5, -3, 1.4, 1.8, "#8b2d4c"); c.strokeStyle = "#8b2d4c"; c.lineWidth = 1.6; c.beginPath(); c.arc(0, 1, 5, .3, Math.PI - .3); c.stroke(); c.restore(); },
  lantern(c, x, y, t){ const f = .8 + .2 * Math.sin(t * 13) * Math.sin(t * 7); glow(c, x, y + 2, 34 * f, "255,180,80", .6); c.fillStyle = "#3a2c1c"; c.fillRect(x - 6, y - 10, 12, 3); c.fillRect(x - 7, y + 9, 14, 3); c.strokeStyle = "#3a2c1c"; c.lineWidth = 1.4; c.beginPath(); c.arc(x, y - 13, 4, Math.PI, 0); c.stroke(); rrect(c, x - 5.5, y - 7, 11, 16, 2); c.fillStyle = "rgba(255,226,150,.55)"; c.fill(); ell(c, x, y + 2, 2.6 * f, 4.6 * f, "#fff2b8"); },
  rose(c, x, y, t){ glow(c, x, y - 2, 26, "255,90,110", .45); c.strokeStyle = "#3f7d3a"; c.lineWidth = 2; c.beginPath(); c.moveTo(x, y + 2); c.quadraticCurveTo(x + 2, y + 10, x - 1, y + 16); c.stroke(); ell(c, x + 4, y + 9, 4, 2, "#4f9a45"); ell(c, x, y - 2, 8.5, 7.5, "#c81d35"); c.strokeStyle = "#8e0f22"; c.lineWidth = 1.2; c.beginPath(); c.arc(x, y - 2, 4.5, 0, Math.PI * 1.6); c.stroke(); c.beginPath(); c.arc(x + 1, y - 3, 2, Math.PI, TAU * .95); c.stroke(); ell(c, x - 3, y - 6, 2.4, 1.2, "rgba(255,255,255,.35)"); },
  balloon(c, x, y, t, id){ const cols = ["#ef4b4b", "#f7c133", "#3aa0e8", "#4cc26e", "#e86fb3", "#9a6cf0"], col = cols[id % 6]; c.strokeStyle = "rgba(80,70,60,.7)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x, y + 13); c.quadraticCurveTo(x - 4, y + 20, x + 1, y + 28); c.stroke(); glow(c, x, y, 24, "255,255,255", .35); ell(c, x, y, 10.5, 13, col); c.fillStyle = col; c.beginPath(); c.moveTo(x - 2.5, y + 15); c.lineTo(x + 2.5, y + 15); c.lineTo(x, y + 12); c.fill(); ell(c, x - 4, y - 5, 2.6, 4, "rgba(255,255,255,.55)"); },
  bell(c, x, y, t){ glow(c, x, y, 28, "255,205,90", .55); c.save(); c.translate(x, y - 8); c.rotate(Math.sin(t * 6) * .25); c.fillStyle = lg(c, -12, 0, 12, 0, ["#b9852b", "#ffd76a", "#c08f2f"]); c.beginPath(); c.moveTo(-3, 0); c.quadraticCurveTo(-9, 2, -9, 12); c.lineTo(-12, 18); c.lineTo(12, 18); c.lineTo(9, 12); c.quadraticCurveTo(9, 2, 3, 0); c.closePath(); c.fill(); ell(c, 0, 20, 2.8, 2.8, "#8a5d1a"); c.strokeStyle = "#8a5d1a"; c.lineWidth = 2; c.beginPath(); c.arc(0, -1, 2.5, Math.PI, 0); c.stroke(); c.restore(); }
};

/* ───────── Фоны ───────── */
function facade(c, r, x, w, h, col, shut, opt){
  const top = GY - h;
  c.fillStyle = col; c.fillRect(x, top, w, h);
  c.fillStyle = "rgba(0,0,0,.07)"; c.fillRect(x + w - 6, top, 6, h);
  c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(x, top, w, 5);
  c.fillStyle = "rgba(0,0,0,.12)"; c.fillRect(x - 2, top - 4, w + 4, 5);
  const cols = Math.max(2, Math.floor(w / 34)), rows = Math.max(2, Math.floor((h - 50) / 44));
  for (let i = 0; i < cols; i++) for (let j = 0; j < rows; j++) {
    const wx = x + 12 + i * ((w - 24) / cols) + ((w - 24) / cols - 14) / 2, wy = top + 18 + j * 44;
    const lit = opt && opt.night && r() < .35;
    c.fillStyle = lit ? "#ffd27a" : (opt && opt.night ? "#141629" : "#3b4a5a"); c.fillRect(wx, wy, 14, 22);
    if (lit) glow(c, wx + 7, wy + 11, 26, "255,200,110", .25);
    if (shut && !(opt && opt.night)) { c.fillStyle = shut; c.fillRect(wx - 6, wy, 5, 22); c.fillRect(wx + 15, wy, 5, 22); }
    if (r() < .25 && j < rows - 1) { c.fillStyle = opt && opt.night ? "#0f1020" : "#2f2a28"; c.fillRect(wx - 5, wy + 23, 24, 2); if (!(opt && opt.night)) for (let q = 0; q < 4; q++) ell(c, wx - 2 + q * 6, wy + 21, 2.6, 2.4, ["#d9473f", "#e9a1b8", "#f2c14e", "#5c9a44"][(i + j + q) % 4]); }
  }
  // дверь
  const dx = x + w * (.3 + r() * .3);
  c.fillStyle = opt && opt.night ? "#0d0e1c" : "#4a3a2c"; rrect(c, dx, GY - 38, 20, 38, 9); c.fill();
}
function hillsLine(c, r, base, amp, col, n){
  c.fillStyle = col; c.beginPath(); c.moveTo(0, H);
  const pts = []; for (let i = 0; i <= n; i++) pts.push(base - r() * amp);
  pts[n] = pts[0];
  for (let i = 0; i <= n; i++) { const x = i / n * TW; if (i === 0) c.lineTo(x, pts[i]); else { const px = (i - .5) / n * TW; c.quadraticCurveTo(px, pts[i - 1] - amp * .3, x, pts[i]); } }
  c.lineTo(TW, H); c.closePath(); c.fill(); return pts;
}
function cloud(c, x, y, s, col){ c.fillStyle = col; for (const [dx, dy, rr] of [[0, 0, 22], [20, -10, 18], [38, 0, 20], [18, 6, 20], [-16, 6, 14], [52, 6, 13]]) ell(c, x + dx * s, y + dy * s, rr * s * 1.3, rr * s); }
function stars(c, r, n, maxY){ for (let i = 0; i < n; i++) { const x = r() * TW, y = r() * maxY, a = .3 + r() * .7; c.fillStyle = `rgba(255,255,240,${a})`; c.fillRect(x, y, r() < .1 ? 2 : 1.2, r() < .1 ? 2 : 1.2); } }

const THEMES = {
  day:{
    sky:["#5eaedb", "#a7d7ef", "#fde6c4"], sun:{x:.8, y:60, r:26, col:"255,236,170"},
    dust:"rgba(150,120,90,.35)", hud:"#2a2420",
    layers:[
      {f:.04, paint(c, r){ for (let i = 0; i < 7; i++) cloud(c, r() * TW, 30 + r() * 70, .6 + r() * .6, "rgba(255,255,255,.8)"); }},
      {f:.14, paint(c, r){ c.fillStyle = lg(c, 0, 190, 0, GY, ["#3f90b8", "#78bfd6"]); c.fillRect(0, 196, TW, H); c.strokeStyle = "rgba(255,255,255,.5)"; c.lineWidth = 1; for (let i = 0; i < 60; i++) { const x = r() * TW, y = 205 + r() * 40; c.beginPath(); c.moveTo(x, y); c.lineTo(x + 6 + r() * 12, y); c.stroke(); }
        for (let b = 0; b < 4; b++) { const cx = b * 400 + r() * 200, w = 260 + r() * 160; c.fillStyle = "#a9b77f"; c.beginPath(); c.moveTo(cx - w / 2, GY); c.quadraticCurveTo(cx, 120 + r() * 40, cx + w / 2, GY); c.fill();
          for (let k = 0; k < 14; k++) { const u = r(), hx = cx - w * .38 + u * w * .76, hy = GY - (1 - Math.pow((u - .5) * 2, 2)) * (100 + r() * 20) + 14 + r() * 30; c.fillStyle = r() < .5 ? "#f6f1e6" : "#efe0c8"; c.fillRect(hx, hy, 12, 10); c.fillStyle = "#c46a46"; c.beginPath(); c.moveTo(hx - 2, hy); c.lineTo(hx + 6, hy - 6); c.lineTo(hx + 14, hy); c.fill(); } }
        c.fillStyle = "#f4efe6"; c.fillRect(1300, 150, 10, 50); c.fillStyle = "#c94a3a"; c.fillRect(1300, 162, 10, 6); c.fillRect(1300, 178, 10, 6); c.fillStyle = "#333"; c.fillRect(1298, 144, 14, 6); }},
      {f:.45, paint(c, r){ let x = 0; const pal = ["#f2c879", "#efb08e", "#f4d9b0", "#e8a7a0", "#d9c38f", "#f6e7c9", "#e9bf7e"];
        while (x < TW) { const w = 110 + Math.floor(r() * 70), h = 120 + Math.floor(r() * 80);
          if (r() < .22) { c.fillStyle = "#c8b293"; rrect(c, x + 10, GY - 120, w - 20, 120, 40); c.fill(); c.fillStyle = "#7cc0d8"; rrect(c, x + 20, GY - 108, w - 40, 108, 32); c.fill(); c.fillStyle = "#e9e0cf"; for (let s = 0; s < 6; s++) c.fillRect(x + 20, GY - 8 - s * 6, w - 40, 3); x += w; continue; }
          facade(c, r, x, w, h, pal[Math.floor(r() * pal.length)], r() < .6 ? "#4f7a5a" : "#5a7fa0"); x += w; }
        for (let i = 0; i < 6; i++) { const x0 = r() * TW, y0 = 40 + r() * 40; c.strokeStyle = "rgba(240,236,228,.8)"; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + 60, y0 + 18, x0 + 120, y0); c.stroke(); for (let k = 0; k < 5; k++) { c.fillStyle = ["#f4f1ea", "#d7615d", "#6fa9d6", "#f2c14e", "#9fcf8a"][k]; c.fillRect(x0 + 14 + k * 20, y0 + 7 + Math.sin(k / 4 * Math.PI) * 6, 10, 14); } } }}
    ],
    ground(c, s, w){ c.fillStyle = "#b9a588"; c.fillRect(0, GY, w, H - GY); c.fillStyle = "#d8c8a9"; c.fillRect(0, GY, w, 5);
      for (let row = 0; row < 4; row++) { const sw = 26, off = (s + row * 13) % sw, y = GY + 9 + row * 13; for (let x = -off; x < w + sw; x += sw) { const id = Math.floor((x + s + row * 13) / sw); c.fillStyle = `hsl(32,${18 + hash(id * 7 + row) * 12}%,${56 + hash(id * 3 + row) * 10}%)`; rrect(c, x + 1, y, sw - 3, 10, 4); c.fill(); } } }
  },
  night:{
    sky:["#070d26", "#1d1c45", "#3c2d58"], moon:{x:.74, y:62, r:20}, stars:150, dust:"rgba(180,180,220,.25)", hud:"#f1ead8", dark:true,
    layers:[
      {f:.1, paint(c, r){ c.strokeStyle = "rgba(170,175,195,.18)"; c.lineWidth = 1; for (let i = 0; i < 70; i++) { const x = r() * TW; c.beginPath(); c.moveTo(x, GY - 40); c.quadraticCurveTo(x + (r() - .5) * 80, 120, 800 + (x - 800) * .2, -20); c.stroke(); }
        hillsLine(c, r, 215, 40, "#161936", 8);
        for (let i = 0; i < 26; i++) { const x = r() * TW, y = 190 + r() * 40, h = 20 + r() * 40, w = 14 + r() * 22; c.fillStyle = "#1a1d3c"; c.fillRect(x, y, w, h + 60); if (r() < .5) { c.fillStyle = "#ffcf78"; c.fillRect(x + 4, y + 8, 3, 4); glow(c, x + 5, y + 10, 10, "255,200,110", .3); } } }},
      {f:.42, paint(c, r){ let x = 0; while (x < TW) { const w = 100 + Math.floor(r() * 80), h = 140 + Math.floor(r() * 110); facade(c, r, x, w, h, ["#232649", "#272a52", "#1f2244", "#2b2b50"][Math.floor(r() * 4)], null, {night:true}); x += w; }
        for (let i = 0; i < 6; i++) { const lx = 60 + i * 270 + r() * 40; c.fillStyle = "#11121f"; c.fillRect(lx, GY - 110, 4, 110); c.fillRect(lx - 8, GY - 112, 20, 4); ell(c, lx + 2, GY - 104, 6, 5, "#ffe3a0"); glow(c, lx + 2, GY - 100, 70, "255,214,140", .35); } }}
    ],
    ground(c, s, w){ c.fillStyle = "#24253a"; c.fillRect(0, GY, w, H - GY); c.fillStyle = "#3a3b57"; c.fillRect(0, GY, w, 4);
      for (let row = 0; row < 4; row++) { const sw = 26, off = (s + row * 13) % sw, y = GY + 9 + row * 13; for (let x = -off; x < w + sw; x += sw) { const id = Math.floor((x + s + row * 13) / sw); c.fillStyle = `hsl(235,${12 + hash(id * 7 + row) * 10}%,${17 + hash(id * 3 + row) * 7}%)`; rrect(c, x + 1, y, sw - 3, 10, 4); c.fill(); } } }
  },
  dawn:{
    sky:["#5a4b8c", "#e6847a", "#ffd9a6"], sun:{x:.3, y:200, r:46, col:"255,220,150"}, dust:"rgba(120,90,80,.35)", hud:"#2a2420",
    layers:[
      {f:.05, paint(c, r){ for (let i = 0; i < 6; i++) cloud(c, r() * TW, 50 + r() * 80, .7 + r() * .5, "rgba(255,190,170,.55)"); }},
      {f:.1, paint(c, r){ c.fillStyle = "#8a5f86"; c.beginPath(); c.moveTo(0, GY); c.quadraticCurveTo(400, 150, 800, 170); c.quadraticCurveTo(1200, 190, TW, GY); c.lineTo(TW, H); c.lineTo(0, H); c.fill();
        const tx = 760; c.fillStyle = "#4a3552"; c.beginPath(); c.moveTo(tx - 14, 172); c.lineTo(tx - 4, 40); c.lineTo(tx + 4, 40); c.lineTo(tx + 14, 172); c.fill(); c.fillRect(tx - 1.5, 6, 3, 36); rrect(c, tx - 12, 60, 24, 14, 4); c.fill(); for (const y of [8, 60]) { ell(c, tx, y, 2.5, 2.5, "#ff4b4b"); glow(c, tx, y, 12, "255,70,70", .6); }
        hillsLine(c, r, 250, 30, "#6e4d74", 10); }},
      {f:.38, paint(c, r){ hillsLine(c, r, 270, 30, "#7a5a64", 7); for (let i = 0; i < 22; i++) { const x = r() * TW, h = 70 + r() * 70; wrap(x, 20, X => { c.fillStyle = "#2f4a3c"; c.beginPath(); c.moveTo(X, GY - 6); c.quadraticCurveTo(X - 10, GY - h * .5, X, GY - h); c.quadraticCurveTo(X + 10, GY - h * .5, X, GY - 6); c.fill(); c.fillStyle = "rgba(255,190,140,.18)"; c.beginPath(); c.moveTo(X, GY - h); c.quadraticCurveTo(X + 9, GY - h * .5, X + 1, GY - 6); c.lineTo(X + 3, GY - 6); c.fill(); }); }
        c.fillStyle = "#a9907c"; c.fillRect(0, GY - 16, TW, 16); c.fillStyle = "#8f7867"; for (let x = 0; x < TW; x += 24) c.fillRect(x, GY - 16, 22, 7); }}
    ],
    ground(c, s, w){ c.fillStyle = "#4c4a56"; c.fillRect(0, GY, w, H - GY); c.fillStyle = "#f2efe8"; c.fillRect(0, GY, w, 3);
      const off = s % 80; c.fillStyle = "#f1e7c8"; for (let x = -off; x < w + 80; x += 80) c.fillRect(x, GY + 28, 40, 4); c.fillStyle = "rgba(255,255,255,.04)"; for (let x = -(s % 9); x < w; x += 9) c.fillRect(x, GY + 6 + (Math.floor((x + s) / 9) % 5) * 9, 2, 2); }
  },
  office:{
    sky:["#c4cbcf", "#d5dadc", "#b6bec3"], dust:"rgba(120,120,120,.3)", hud:"#2a2420", indoor:true,
    layers:[
      {f:.3, paint(c, r){ for (let x = 0; x < TW; x += 200) { c.fillStyle = "#e3e7e9"; c.fillRect(x + 40, 70, 120, 150); c.fillStyle = "#9aa6ad"; c.fillRect(x + 46, 76, 108, 138); c.fillStyle = "#7f8b93"; for (let k = 0; k < 4; k++) c.fillRect(x + 50 + k * 26, 150 - k * 14, 20, 64 + k * 14); c.fillStyle = "rgba(235,238,240,.75)"; for (let y = 78; y < 212; y += 7) c.fillRect(x + 46, y, 108, 4); c.fillStyle = "#b0b8bd"; c.fillRect(x, 40, 26, GY - 40); c.fillStyle = "rgba(0,0,0,.06)"; c.fillRect(x + 20, 40, 6, GY - 40); } }},
      {f:.62, paint(c, r){ const posters = ["УЛЫБКА —\nНАРУШЕНИЕ", "СПОКОЙСТВИЕ\nЭТО ПОРЯДОК", "СМЕХ\n1000 €", "НЕ\nУЛЫБАЙТЕСЬ"]; for (let i = 0; i < 8; i++) { const x = i * 200 + r() * 40, kind = i % 4;
          if (kind === 0 || kind === 2) { c.fillStyle = "#5b4230"; c.fillRect(x, GY - 130, 64, 130); c.fillStyle = "#6d503b"; c.fillRect(x + 6, GY - 124, 52, 56); c.fillRect(x + 6, GY - 62, 52, 56); ell(c, x + 52, GY - 64, 2.5, 2.5, "#d6b46a"); c.fillStyle = "#e6e2d6"; c.fillRect(x + 12, GY - 148, 40, 12); c.fillStyle = "#333"; c.font = "bold 8px sans-serif"; c.fillText("КАБ. " + (200 + Math.floor(r() * 99)), x + 15, GY - 139); }
          else if (kind === 1) { c.fillStyle = "#8e979c"; c.fillRect(x, GY - 96, 46, 96); c.fillStyle = "#a3acb1"; for (let k = 0; k < 4; k++) { c.fillRect(x + 3, GY - 93 + k * 23, 40, 20); c.fillStyle = "#555"; c.fillRect(x + 18, GY - 85 + k * 23, 10, 3); c.fillStyle = "#a3acb1"; } }
          else { c.fillStyle = "#6e5a3e"; c.fillRect(x + 8, GY - 24, 22, 24); c.strokeStyle = "#7a6a4a"; c.lineWidth = 2; for (let k = 0; k < 5; k++) { c.beginPath(); c.moveTo(x + 19, GY - 24); c.quadraticCurveTo(x + 19 + (k - 2) * 8, GY - 50, x + 19 + (k - 2) * 14, GY - 44); c.stroke(); } ell(c, x + 26, GY - 52, 4, 2, "#8a7a5a"); }
          const px = x + 90; c.fillStyle = "#f4f1e8"; c.fillRect(px, GY - 190, 64, 84); c.fillStyle = "#b8282b"; c.fillRect(px, GY - 190, 64, 12); c.fillStyle = "#222"; c.font = "bold 9px sans-serif"; posters[i % 4].split("\n").forEach((ln, k) => c.fillText(ln, px + 5, GY - 158 + k * 13)); c.strokeStyle = "#b8282b"; c.lineWidth = 2; c.beginPath(); c.arc(px + 32, GY - 124, 9, 0, TAU); c.moveTo(px + 26, GY - 130); c.lineTo(px + 38, GY - 118); c.stroke(); } }},
      {f:1, paint(c){ c.fillStyle = "#9aa3a8"; c.fillRect(0, 0, TW, 34); c.fillStyle = "#8a9398"; c.fillRect(0, 34, TW, 4); for (let x = 30; x < TW; x += 160) { c.fillStyle = "#f6fbff"; rrect(c, x, 30, 90, 7, 3); c.fill(); glow(c, x + 45, 40, 70, "235,245,255", .35); } }}
    ],
    ground(c, s, w){ const sz = 30, off = s % (sz * 2); for (let x = -off; x < w + sz * 2; x += sz) for (let r = 0; r < 3; r++) { const id = Math.floor((x + s) / sz) + r; c.fillStyle = id % 2 ? "#8b968c" : "#a5ae9f"; c.fillRect(x, GY + r * 20, sz, 20); } c.fillStyle = "rgba(255,255,255,.18)"; c.fillRect(0, GY, w, 2); c.fillStyle = "#6c766b"; c.fillRect(0, GY - 6, w, 6); }
  },
  port:{
    sky:["#0d1a2e", "#25384e", "#4d6274"], moon:{x:.2, y:70, r:18, hazy:true}, stars:50, dust:"rgba(200,200,220,.2)", hud:"#f1ead8", dark:true, fog:true, lighthouse:true,
    layers:[
      {f:.12, paint(c, r){ c.fillStyle = "#2f4458"; c.fillRect(0, 230, TW, H); for (let i = 0; i < 5; i++) { const x = 100 + i * 320 + r() * 80; c.strokeStyle = "#1a283a"; c.lineWidth = 5; c.beginPath(); c.moveTo(x, 240); c.lineTo(x + 10, 110); c.lineTo(x + 120, 100); c.moveTo(x + 10, 110); c.lineTo(x - 40, 120); c.stroke(); c.lineWidth = 1; c.beginPath(); c.moveTo(x + 100, 102); c.lineTo(x + 100, 170); c.stroke(); ell(c, x + 10, 108, 2, 2, "#ff5050"); glow(c, x + 10, 108, 10, "255,80,80", .5); }
        for (let i = 0; i < 4; i++) { const x = r() * TW; wrap(x, 160, X => { c.fillStyle = "#1c2a3c"; c.beginPath(); c.moveTo(X, 222); c.lineTo(X + 160, 222); c.lineTo(X + 145, 240); c.lineTo(X + 12, 240); c.fill(); c.fillRect(X + 30, 196, 60, 26); c.fillRect(X + 100, 186, 12, 36); for (let k = 0; k < 5; k++) { ell(c, X + 38 + k * 11, 206, 1.6, 1.6, "#ffd68a"); } }); } }},
      {f:.4, paint(c, r){ let x = 0; while (x < TW) { const w = 140 + r() * 100, h = 70 + r() * 70; if (r() < .5) { c.fillStyle = "#26303d"; c.fillRect(x, GY - h, w, h); c.fillStyle = "#1d2530"; c.beginPath(); c.moveTo(x - 6, GY - h); c.lineTo(x + w / 2, GY - h - 26); c.lineTo(x + w + 6, GY - h); c.fill(); c.fillStyle = "#353f4c"; c.fillRect(x + w * .3, GY - 54, w * .4, 54); if (r() < .6) { ell(c, x + w / 2, GY - h + 14, 5, 5, "#ffcf7a"); glow(c, x + w / 2, GY - h + 14, 30, "255,200,110", .35); } }
          else { const cols = ["#5b2b2b", "#2b4a5b", "#3b5232", "#5b4a2b"]; for (let k = 0; k < 3; k++) for (let j = 0; j < 1 + Math.floor(r() * 3); j++) { c.fillStyle = cols[Math.floor(r() * 4)]; c.fillRect(x + k * 46, GY - 26 - j * 26, 44, 25); c.fillStyle = "rgba(0,0,0,.2)"; for (let q = 0; q < 7; q++) c.fillRect(x + k * 46 + 3 + q * 6, GY - 24 - j * 26, 2, 21); } }
          x += w + 20 + r() * 40; }
        for (let i = 0; i < 3; i++) { const bx = r() * TW; c.strokeStyle = "#141c26"; c.lineWidth = 2; c.beginPath(); c.moveTo(bx + 40, GY - 30); c.lineTo(bx + 40, GY - 140); c.moveTo(bx + 40, GY - 130); c.lineTo(bx + 90, GY - 40); c.stroke(); } }}
    ],
    ground(c, s, w){ c.fillStyle = "#4f3d2f"; c.fillRect(0, GY, w, H - GY); c.fillStyle = "#6b5442"; c.fillRect(0, GY, w, 4); const pw = 34, off = s % pw; for (let x = -off; x < w + pw; x += pw) { c.fillStyle = "rgba(0,0,0,.35)"; c.fillRect(x, GY, 2, H - GY); c.fillStyle = "rgba(255,230,190,.06)"; c.fillRect(x + 6, GY + 12 + (Math.floor((x + s) / pw) % 3) * 12, 18, 2); ell(c, x + 17, GY + 6, 1.2, 1.2, "#2a1f17"); } }
  },
  roofs:{
    sky:["#090b20", "#22193c", "#3d2a4c"], moon:{x:.85, y:58, r:16}, stars:170, dust:"rgba(220,160,140,.3)", hud:"#f1ead8", dark:true, searchlights:true,
    layers:[
      {f:.1, paint(c, r){ c.fillStyle = "#1b1834"; let x = 0; while (x < TW) { const w = 40 + r() * 80, h = 50 + r() * 70; c.fillRect(x, GY - 40 - h, w, h + 40); if (r() < .3) { ell(c, x + w / 2, GY - 40 - h, w / 2.4, w / 3, "#1b1834"); c.fillRect(x + w / 2 - 1.5, GY - 40 - h - w / 3 - 14, 3, 14); } if (r() < .25) { c.fillRect(x + w / 2 - 8, GY - 40 - h - 50, 16, 50); c.beginPath(); c.moveTo(x + w / 2 - 10, GY - 90 - h); c.lineTo(x + w / 2, GY - 112 - h); c.lineTo(x + w / 2 + 10, GY - 90 - h); c.fill(); } for (let k = 0; k < 3; k++) if (r() < .4) { c.fillStyle = "#e9b866"; c.fillRect(x + 6 + r() * (w - 12), GY - 30 - r() * h, 3, 4); c.fillStyle = "#1b1834"; } x += w; }
        const ox = 800; c.fillStyle = "#0b0a14"; c.beginPath(); c.moveTo(ox - 10, GY - 40); c.lineTo(ox - 4, 80); c.lineTo(ox, 70); c.lineTo(ox + 4, 80); c.lineTo(ox + 10, GY - 40); c.fill(); glow(c, ox, 100, 50, "170,175,200", .25); }},
      {f:.4, paint(c, r){ let x = 0; while (x < TW) { const w = 120 + r() * 120, h = 40 + r() * 70; c.fillStyle = "#2c2038"; c.fillRect(x, GY - h, w, h); c.fillStyle = "#5a2a2a"; c.beginPath(); c.moveTo(x - 8, GY - h); c.lineTo(x + w * .5, GY - h - 30); c.lineTo(x + w + 8, GY - h); c.fill(); c.strokeStyle = "rgba(0,0,0,.25)"; c.lineWidth = 1; for (let k = 1; k < 5; k++) { c.beginPath(); c.moveTo(x - 8 + k * 4, GY - h - k * 0); c.stroke(); }
          if (r() < .6) { c.fillStyle = "#4a2620"; c.fillRect(x + w * .7, GY - h - 34, 12, 26); }
          if (r() < .5) { c.fillStyle = "#ffcf7a"; c.fillRect(x + 20 + r() * (w - 40), GY - h + 14, 10, 14); glow(c, x + w / 2, GY - h + 20, 40, "255,200,110", .2); }
          if (r() < .3) { c.fillStyle = "#0a0a12"; const cx = x + w * .3, cy = GY - h - 14; ell(c, cx, cy, 6, 7); c.fill(); ell(c, cx, cy - 9, 4, 4); c.fill(); c.beginPath(); c.moveTo(cx - 4, cy - 11); c.lineTo(cx - 3, cy - 16); c.lineTo(cx - 1, cy - 12); c.moveTo(cx + 1, cy - 12); c.lineTo(cx + 3, cy - 16); c.lineTo(cx + 4, cy - 11); c.fill(); }
          x += w + r() * 30; } }}
    ],
    ground(c, s, w){ c.fillStyle = "#6e2e22"; c.fillRect(0, GY, w, H - GY); const tw = 22; for (let row = 0; row < 5; row++) { const off = (s + row * 11) % tw, y = GY + row * 12; for (let x = -off; x < w + tw; x += tw) { c.fillStyle = row % 2 ? "#97432f" : "#a84d36"; c.beginPath(); c.moveTo(x, y); c.lineTo(x + tw, y); c.lineTo(x + tw, y + 8); c.quadraticCurveTo(x + tw / 2, y + 16, x, y + 8); c.closePath(); c.fill(); c.fillStyle = "rgba(255,200,170,.12)"; c.fillRect(x + 3, y + 1, tw - 8, 2); } } c.fillStyle = "#5a241b"; c.fillRect(0, GY - 3, w, 4); }
  },
  piazza:{
    sky:["#4aa8ee", "#9fd5fb", "#e8f6ff"], sun:{x:.15, y:50, r:24, col:"255,250,210"}, dust:"rgba(150,130,100,.35)", hud:"#2a2420", confetti:true,
    layers:[
      {f:.04, paint(c, r){ for (let i = 0; i < 6; i++) cloud(c, r() * TW, 40 + r() * 50, .6 + r() * .5, "rgba(255,255,255,.85)"); }},
      {f:.12, paint(c, r){ const cx = 800; c.fillStyle = "#e9dcc0"; c.fillRect(cx - 220, 120, 440, 120); c.fillStyle = "#d8c8a6"; for (let k = 0; k < 9; k++) { c.fillRect(cx - 210 + k * 50, 150, 22, 60); } c.fillStyle = "#cdbb96"; c.fillRect(cx - 230, 112, 460, 12); c.fillStyle = "#e9dcc0"; c.fillRect(cx - 28, 30, 56, 100); c.fillStyle = "#c46a46"; c.beginPath(); c.moveTo(cx - 34, 30); c.lineTo(cx, 0); c.lineTo(cx + 34, 30); c.fill(); ell(c, cx, 62, 18, 18, "#fbf6ea"); c.strokeStyle = "#3a2a1c"; c.lineWidth = 2.4; c.beginPath(); c.moveTo(cx, 62); c.lineTo(cx, 50); c.moveTo(cx, 62); c.lineTo(cx + 9, 66); c.stroke(); c.strokeStyle = "#b39466"; c.lineWidth = 1.5; c.beginPath(); c.arc(cx, 62, 18, 0, TAU); c.stroke();
        for (const dx of [-560, 420]) { const x = cx + dx; c.fillStyle = "#efe4cc"; c.fillRect(x, 150, 160, 90); ell(c, x + 80, 150, 56, 46, "#cfd8d6"); c.fillStyle = "#b9c4c2"; c.fillRect(x + 77, 92, 6, 18); } }},
      {f:.42, paint(c, r){ const shirts = ["#e94b3c", "#f7c948", "#3fa7d6", "#59c36a", "#f28ab2", "#ffffff", "#8a6cf0", "#ff8a3d"]; for (let row = 0; row < 2; row++) for (let i = 0; i < 110; i++) { const x = i * 15 + r() * 8 + row * 7, y = GY - 18 - row * 16 - r() * 6; c.fillStyle = row ? "#c7b38d" : "#b8a37b"; c.fillStyle = shirts[Math.floor(r() * shirts.length)]; c.globalAlpha = row ? .7 : 1; rrect(c, x - 7, y - 4, 14, 30, 5); c.fill(); ell(c, x, y - 11, 6, 6.5, ["#f1c7a6", "#d9a582", "#a87452", "#f5d3b8"][Math.floor(r() * 4)]); ell(c, x, y - 14, 6.2, 4, ["#3a2418", "#a9441f", "#e2c27a", "#1d1410"][Math.floor(r() * 4)]); if (r() < .25) { c.strokeStyle = c.fillStyle; c.lineWidth = 3; c.beginPath(); c.moveTo(x + 5, y); c.lineTo(x + 9, y - 20); c.stroke(); } if (r() < .1) { const bc = shirts[Math.floor(r() * 6)]; c.strokeStyle = "#555"; c.lineWidth = .8; c.beginPath(); c.moveTo(x + 9, y - 20); c.lineTo(x + 12, y - 60); c.stroke(); ell(c, x + 12, y - 68, 7, 9, bc); } c.globalAlpha = 1; }
        for (let i = 0; i < 5; i++) { const x0 = i * 330 + r() * 40; c.strokeStyle = "#7a6650"; c.lineWidth = 1; c.beginPath(); c.moveTo(x0, 60); c.quadraticCurveTo(x0 + 120, 110, x0 + 240, 60); c.stroke(); for (let k = 0; k < 10; k++) { const u = (k + .5) / 10, px = x0 + u * 240, py = 60 + 2 * u * (1 - u) * 50 * 2 * .5; c.fillStyle = shirts[k % 6]; c.beginPath(); c.moveTo(px - 6, py); c.lineTo(px + 6, py); c.lineTo(px, py + 14); c.fill(); } } }}
    ],
    ground(c, s, w){ c.fillStyle = "#d9c7a3"; c.fillRect(0, GY, w, H - GY); const sw = 60, off = s % sw; c.strokeStyle = "rgba(120,95,60,.35)"; c.lineWidth = 1.2; for (let x = -off; x < w + sw; x += sw) { c.beginPath(); c.moveTo(x, GY); c.lineTo(x - 22, H); c.stroke(); } for (const y of [GY + 18, GY + 42]) { c.beginPath(); c.moveTo(0, y); c.lineTo(w, y); c.stroke(); } c.fillStyle = "#efe2c4"; c.fillRect(0, GY, w, 4); }
  },
  clock:{
    sky:["#1a110b", "#2c1e14", "#3e2b1d"], dust:"rgba(255,210,150,.3)", hud:"#f1ead8", dark:true, indoor:true, gears:true, shafts:true,
    layers:[
      {f:.3, paint(c, r){ for (let y = 0; y < GY; y += 26) for (let x = (y / 26 % 2) * 30; x < TW; x += 60) { c.fillStyle = `rgb(${60 + r() * 14},${44 + r() * 10},${32 + r() * 8})`; c.fillRect(x + 1, y + 1, 58, 24); }
        for (let i = 0; i < 6; i++) { const x = 100 + i * 270; c.fillStyle = "#170f09"; rrect(c, x, 60, 18, 70, 9); c.fill(); c.fillStyle = "#ffd89a"; rrect(c, x + 5, 66, 8, 58, 4); c.fill(); glow(c, x + 9, 95, 60, "255,210,140", .3); }
        c.strokeStyle = "#1b130d"; c.lineWidth = 3; for (let i = 0; i < 5; i++) { const x = r() * TW; c.setLineDash([6, 4]); c.beginPath(); c.moveTo(x, 0); c.lineTo(x, 160 + r() * 80); c.stroke(); } c.setLineDash([]); }}
    ],
    ground(c, s, w){ c.fillStyle = "#4a3b2f"; c.fillRect(0, GY, w, H - GY); const sw = 48, off = s % sw; for (let row = 0; row < 3; row++) for (let x = -off - (row % 2) * 24; x < w + sw; x += sw) { const id = Math.floor((x + s) / sw) * 3 + row; c.fillStyle = `rgb(${82 + hash(id) * 20},${66 + hash(id + 1) * 14},${52 + hash(id + 2) * 10})`; c.fillRect(x + 1, GY + 4 + row * 20, sw - 2, 18); } c.fillStyle = "#7d6a56"; c.fillRect(0, GY, w, 4); }
  }
};

/* ───────── Уровни ───────── */
const LEVELS = {
  "volny-lyubvi-gorod-bez-ulybok": [
    {theme:"day", title:"Бегом от полиции", item:"smile", names:["улыбку","улыбки","улыбок"], goal:10, speed:250,
     intro:"Мариса рассмеялась на привокзальной площади — и двое полицейских уже идут к вам. Беги за ней по старому городу Синеи: перепрыгивай лужи и велосипеды, пригибайся под бельём. По дороге собери улыбки, которые горожане боятся показывать.",
     obs:{puddle:3, pot:2, bike:2, basket:2, laundry:3, gull:2}},
    {theme:"night", title:"Серые нити", item:"note", names:["ноту","ноты","нот"], goal:11, speed:260,
     intro:"Синея спит, а над головами горожан тянутся серые нити — к четырём башням. Не дай им коснуться тебя: пригибайся. Перепрыгивай скамейки и чёрных котов и собери рассыпанные ноты Луисовой мелодии.",
     obs:{bench:2, bin:2, cat:2, pot:1, thread:5}},
    {theme:"dawn", title:"Вниз с телебашни", item:"wave", names:["волну","волны","волн"], goal:12, speed:270,
     intro:"Синея проснулась под песню из эфира, а по серпантину к телебашне уже поднимаются машины. Беги вниз по дороге, уворачивайся от дронов и низких проводов и лови волны эфира, которые разносят музыку по городу.",
     obs:{cone:3, barrier:2, drone:3, lowcable:2}},
    {theme:"office", title:"Коридоры министерства", item:"card", names:["улыбку","улыбки","улыбок"], goal:12, speed:280,
     intro:"Центральное управление Службы эмоционального контроля. Ты — уборщица с тележкой, но камеры не спят, а печати «НЕТ» летают по коридорам. Собери конфискованные улыбки, пока никто не заметил.",
     obs:{bucket:3, folders:2, cart:2, stamp:3, camera:2}},
    {theme:"port", title:"Тень в порту", item:"lantern", names:["огонёк","огонька","огоньков"], goal:13, speed:290,
     intro:"Ночью Тень пришла на «Синьору Фортуну». Беги по причалам сквозь туман, перепрыгивай ящики и канаты, пригибайся, когда Тень проносится над головой. Тень боится света — собери огоньки фонарей.",
     obs:{crate:3, rope:2, bollard:2, shadow:3, gull:1}},
    {theme:"roofs", title:"По крышам к русалке", item:"rose", names:["розу","розы","роз"], goal:14, speed:300,
     intro:"Полночь над площадью Порядка, по крышам шарят прожекторы. Беги по черепице, перепрыгивай трубы и антенны, пригибайся под проводами с голубями. Собери розы: когда-то здесь был цветочный рынок, и каменная русалка их ждёт.",
     obs:{chimney:3, antenna:2, vent:2, lowcable:3, gull:1}},
    {theme:"piazza", title:"Площадь Данте", item:"balloon", names:["шарик","шарика","шариков"], goal:14, speed:310,
     intro:"На площади Данте собрался весь город. Пробеги сквозь праздник — через барьеры и барабаны, под гирляндами флажков — и собери воздушные шарики: каждый из них — чей-то вернувшийся смех.",
     obs:{pbarrier:3, drum:2, chair:2, flags:3}},
    {theme:"clock", title:"Часовая башня", item:"bell", names:["колокольчик","колокольчика","колокольчиков"], goal:15, speed:320,
     intro:"Двести ступеней, триста… Внутри часовой башни бьётся каменное сердце, катятся шестерёнки и раскачиваются противовесы, а в темноте прячутся тени. Собери колокольчики карильона, чтобы Синея снова запела.",
     obs:{gear:3, step:2, crate:1, weight:3, shadow:2}}
  ]
};

/* ───────── Звук ───────── */
function makeSound(on){
  let ctx = null;
  const tone = (f, t0, d, type, g, f2) => { if (!on()) return; try { ctx = ctx || new (window.AudioContext || window.webkitAudioContext)(); const s = ctx.currentTime + t0, o = ctx.createOscillator(), v = ctx.createGain(); o.type = type || "sine"; o.frequency.setValueAtTime(f, s); if (f2) o.frequency.exponentialRampToValueAtTime(f2, s + d); v.gain.setValueAtTime(0, s); v.gain.linearRampToValueAtTime(g || .06, s + .01); v.gain.exponentialRampToValueAtTime(.0001, s + d); o.connect(v).connect(ctx.destination); o.start(s); o.stop(s + d + .05); } catch(e) {} };
  return {
    jump(){ tone(380, 0, .16, "triangle", .05, 720); },
    pick(n){ const sc = [523, 587, 659, 784, 880, 1047]; tone(sc[n % 6], 0, .16, "triangle", .06); tone(sc[n % 6] * 1.5, .06, .18, "sine", .04); },
    hit(){ tone(200, 0, .25, "sawtooth", .05, 90); },
    win(){ [523, 659, 784, 1047, 1319].forEach((f, i) => tone(f, i * .1, .35, "triangle", .06)); },
    lose(){ [392, 330, 262].forEach((f, i) => tone(f, i * .16, .3, "triangle", .05)); }
  };
}

/* ───────── Игра ───────── */
function mount(el, opt){
  const levels = LEVELS[opt.slug] || [], L = levels[opt.level - 1];
  if (!L) return false;
  const T = THEMES[L.theme], keyFail = "rn-fail:" + opt.slug + ":" + opt.level;
  const HS = HEROES[opt.slug] ? HEROES[opt.slug](opt.level, L) : null;   // внешность героини для этого романа и уровня
  let fails = 0; try { fails = +sessionStorage.getItem(keyFail) || 0; } catch(e) {}
  const snd = makeSound(() => !opt.sfx || opt.sfx.on());
  const icon = (sz) => { const cv = document.createElement("canvas"), d = 2; cv.width = cv.height = sz * d; const c = cv.getContext("2d"); c.scale(d * sz / 40, d * sz / 40); ITEM[L.item](c, 20, 20, 0, 1); return cv.toDataURL(); };
  el.innerHTML = `
  <div class="rn">
    <div class="rn-head"><div class="rn-kick">Игра · уровень ${opt.level} из ${levels.length}</div><h1>${L.title}</h1></div>
    <div class="rn-stage">
      <canvas class="rn-cv" aria-label="Игра «${L.title}»"></canvas>
      <div class="rn-ov rn-start">
        <img class="rn-ico" src="${icon(44)}" alt="">
        <p>${L.intro}</p>
        <div class="rn-goal">Собери <b>${L.goal} ${plural(L.goal, L.names)}</b> — и уровень пройден.</div>
        <button class="rn-btn" data-act="go">Бежать!</button>
        <div class="rn-keys"><span><kbd>Пробел</kbd> или <kbd>↑</kbd> — прыжок</span><span><kbd>↓</kbd> — пригнуться</span><span class="rn-touch">На телефоне — кнопки под игрой</span></div>
      </div>
      <div class="rn-ov rn-end" hidden></div>
    </div>
    <div class="rn-pad"><button class="rn-pb" data-k="duck" aria-label="Пригнуться">▼<small>пригнуться</small></button><button class="rn-pb" data-k="jump" aria-label="Прыжок">▲<small>прыжок</small></button></div>
    <p class="rn-note">Игра по главам ${(opt.level - 1) * 5 + 1}–${opt.level * 5}. Играть необязательно — роман можно читать и без неё.</p>
  </div>`;
  const root = el.querySelector(".rn"), cv = root.querySelector("canvas"), c = cv.getContext("2d");
  const ovStart = root.querySelector(".rn-start"), ovEnd = root.querySelector(".rn-end");
  let VW = 960, k = 1, dpr = 1, layers = [];
  function size(){
    const cw = cv.clientWidth || 600; dpr = Math.min(2, window.devicePixelRatio || 1);
    const ch = Math.round(clamp(Math.max(cw * H / 960, cw * H / 620), 210, 420));
    cv.style.height = ch + "px"; k = ch / H; VW = cw / k;
    cv.width = Math.round(cw * dpr); cv.height = Math.round(ch * dpr);
    const sc = clamp(k * dpr, 1, 2);
    if (!layers.length || layers.sc !== sc) { layers = T.layers.map((ly, i) => { const lc = document.createElement("canvas"); lc.width = TW * sc; lc.height = H * sc; const x = lc.getContext("2d"); x.scale(sc, sc); ly.paint(x, rng(opt.level * 97 + i * 13 + 1)); return {cv:lc, f:ly.f}; }); layers.sc = sc; }
  }
  size();
  const starPts = []; { const r = rng(7 + opt.level); for (let i = 0; i < (T.stars || 0); i++) starPts.push([r(), r() * 200, r() * TAU, .4 + r() * .6]); }
  const confs = []; if (T.confetti) { const r = rng(3); for (let i = 0; i < 40; i++) confs.push({x:r() * 1000, y:r() * H, v:20 + r() * 40, a:r() * TAU, col:["#e94b3c", "#f7c948", "#3fa7d6", "#59c36a", "#f28ab2"][i % 5]}); }
  const fogs = []; if (T.fog) for (let i = 0; i < 6; i++) fogs.push({x:i * 260, y:200 + (i % 3) * 30, w:300 + (i % 2) * 120});
  const motes = []; for (let i = 0; i < 26; i++) motes.push({x:Math.random() * 1000, y:Math.random() * GY, s:Math.random()});

  // ── состояние
  const bag = []; for (const [n, w] of Object.entries(L.obs)) for (let i = 0; i < w; i++) bag.push(n);
  const assist = Math.max(.72, 1 - fails * .07);
  let state = "ready", time = 0, scroll = 0, speed = 0, hearts = 5, got = 0, inv = 0, shake = 0, endT = 0, slow = 1;
  let py = 0, vy = 0, onGround = true, ducking = false, holdJump = false, jumpT = 0, ph = 0, dustT = 0;
  let trips = 0, stumble = 0, chill = 0, bubble = null, meet = null, meetT = 0, meetI = -1, curseI = 0;
  let objs = [], items = [], parts = [], sinceOb = 0, gapOb = 500, sinceIt = 0, gapIt = 260, itemId = 0, lastOb = null;
  const PX = 150;
  const P = Object.assign({}, POSES.idle);
  const keys = {jump:false, duck:false};
  const base = () => L.speed * assist;
  function reset(){
    state = "play"; time = 0; scroll = 0; speed = base(); hearts = 5; got = 0; inv = 0; shake = 0; slow = 1;
    py = 0; vy = 0; onGround = true; objs = []; items = []; parts = []; sinceOb = 0; gapOb = 520;
    trips = 0; stumble = 0; chill = 0; bubble = null; meet = null; meetT = 0; meetI = -1; curseI = 0; sinceIt = 0; gapIt = 200; lastOb = null;
    ovStart.hidden = true; ovEnd.hidden = true;
  }
  function jump(){ if (state === "ready") return; if (state !== "play" || stumble > 0) return; if (onGround) { vy = -760; onGround = false; jumpT = 0; snd.jump(); puff(PX, GY, 6); } }
  function puff(x, y, n, col){ for (let i = 0; i < n; i++) parts.push({x, y:y - 2, vx:-40 - Math.random() * 80, vy:-20 - Math.random() * 50, life:.5, max:.5, col:col || T.dust, s:2 + Math.random() * 3, g:60}); }
  function sparkle(x, y, col, n){ for (let i = 0; i < n; i++) { const a = Math.random() * TAU, v = 60 + Math.random() * 140; parts.push({x, y, vx:Math.cos(a) * v, vy:Math.sin(a) * v, life:.6, max:.6, col, s:1.5 + Math.random() * 2.5, g:0, star:true}); } }
  function spawnOb(){
    let name = bag[Math.floor(Math.random() * bag.length)];
    if (lastOb && OB[lastOb.n].hb.bottom > 0 && OB[name].hb.bottom > 0 && Math.random() < .5) name = bag.find(n => OB[n].hb.bottom === 0) || name;
    const d = OB[name], o = {n:name, x:VW + 30, d, t:Math.random() * 10, pig:name === "lowcable" && L.theme === "roofs"};
    objs.push(o); lastOb = o;
    gapOb = speed * (1.05 + Math.random() * .9) + 150 + d.w;
  }
  function spawnItem(){
    let y = GY - 34;
    const near = objs.find(o => Math.abs((o.x + o.d.w / 2) - (VW + 40)) < o.d.w / 2 + 50);
    if (near) y = near.d.hb.bottom > 0 ? GY - 26 : GY - 118 - Math.min(20, near.d.hb.top - 30);
    else if (Math.random() < .38) y = GY - 112 - Math.random() * 20;
    items.push({x:VW + 40, y, id:itemId++, t:Math.random() * 6});
    gapIt = speed * (.42 + Math.random() * .6);
  }
  function pbox(){ const y = GY - py; if (!onGround) return [PX - 12, y - 88, PX + 14, y - 14]; if (ducking) return [PX - 16, y - 50, PX + 24, y - 3]; return [PX - 12, y - 92, PX + 13, y - 3]; }
  /* Поребрик: сердце не отнимает, но Наталья спотыкается, ругается — и город отвечает холодным ветром */
  function say(text, dur, who){ bubble = {text, t:dur || 1.8, who:who || "nat"}; }
  function trip(o){
    o.hit = true; trips++; stumble = .6; slow = .3; shake = .2; chill = 1; snd.hit();
    puff(PX + 14, GY, 8);
    const cs = L.curses || ["Ой!"], first = trips === 1 && L.firstCurse;
    say(first ? L.firstCurse : cs[curseI++ % cs.length], 1.9);
  }
  function hit(o){ if (o.d.trip) return trip(o); o.hit = true; hearts--; inv = 1.4; shake = .35; slow = .55; snd.hit(); sparkle(PX + 6, GY - py - 50, "rgba(255,120,120,.9)", 14); if (hearts <= 0) { state = "over"; endT = 0; snd.lose(); fails++; try { sessionStorage.setItem(keyFail, fails); } catch(e) {} } }
  function update(dt){
    time += dt;
    if (state === "ready") { ph += dt * 2; return; }
    const running = state === "play" || state === "win";
    stumble = Math.max(0, stumble - dt); chill = Math.max(0, chill - dt * .7);
    if (bubble) { bubble.t -= dt; if (bubble.t <= 0) bubble = null; }
    if (meet) meet.x -= speed * dt;
    if (state === "meet") {
      meetT += dt;
      const lines = L.meet.lines, step = 2.6, i = Math.floor((meetT - .3) / step);
      if (i >= 0 && i < lines.length && i !== meetI) { meetI = i; say(lines[i][1], step - .15, lines[i][0]); }
      if (meetT > .3 + lines.length * step + .2 && ovEnd.hidden) showEnd();
    }
    if (state === "play") speed = (base() + Math.min(70, time * 2)) * slow;
    else if (state === "win" && meet) { const d = meet.x - (PX + 64); speed = clamp(Math.min(base() * 1.05, d * 2.4), 0, 999); if (d < 3) { state = "meet"; speed = 0; meetT = 0; meetI = -1; } }
    else if (state === "meet") speed = 0;
    else if (state === "win") speed = lerp(speed, base() * 1.1, dt * 2);
    else speed = lerp(speed, 0, dt * 4);
    slow = lerp(slow, 1, dt * 1.6);
    scroll += speed * dt;
    // игрок
    ducking = state === "play" && keys.duck && onGround;
    if (!onGround) {
      jumpT += dt;
      let g = 2300; if (keys.jump && vy < 0 && jumpT < .24) g *= .5; if (keys.duck) g *= 2.6;
      vy += g * dt; py -= vy * dt;
      if (py <= 0) { py = 0; vy = 0; onGround = true; puff(PX, GY, 7); }
    } else if (state === "play" && keys.jump && !holdJump) { jump(); }
    holdJump = keys.jump;
    ph += dt * (speed / 400) * 11 * (stumble > 0 ? .4 : 1);
    if (running && onGround && !ducking) { dustT -= dt; if (dustT <= 0) { dustT = .14; puff(PX - 6, GY, 1); } }
    let target = state === "over" ? POSES.hurt : state === "meet" ? POSES.idle : stumble > 0 && onGround ? POSES.trip : !onGround ? (vy < 0 ? POSES.jump : POSES.fall) : ducking ? POSES.duck : runPose(ph);
    const kk = 1 - Math.exp(-dt * (onGround && !ducking && state !== "over" ? 30 : 14));
    for (const key in P) P[key] = lerp(P[key], target[key] || 0, kk);
    // спавн
    if (state === "play") {
      sinceOb += speed * dt; sinceIt += speed * dt;
      if (sinceOb >= gapOb && time > .8) { sinceOb = 0; spawnOb(); }
      if (sinceIt >= gapIt) { sinceIt = 0; spawnItem(); }
    }
    for (const o of objs) { o.x -= (speed + (o.d.vx || 0) * (state === "play" ? 1 : 0)) * dt; o.t += dt; }
    objs = objs.filter(o => o.x + o.d.w > -60);
    for (const it of items) { it.x -= speed * dt; it.t += dt; }
    items = items.filter(it => it.x > -40 && !it.got);
    // столкновения
    inv = Math.max(0, inv - dt);
    if (state === "play") {
      const [x0, y0, x1, y1] = pbox();
      if (!inv) for (const o of objs) { if (o.hit) continue; const hb = o.d.hb, ax = o.x + hb.dx + 3, bx = ax + hb.w - 6, ay = GY - hb.top + 3, by = GY - hb.bottom - 2; if (x1 > ax && x0 < bx && y1 > ay && y0 < by) { hit(o); break; } }
      for (const it of items) { if (it.got) continue; const bob = Math.sin(it.t * 3) * 4; if (it.x + 14 > x0 - 4 && it.x - 14 < x1 + 4 && it.y + bob + 14 > y0 - 4 && it.y + bob - 14 < y1 + 4) { it.got = true; got++; snd.pick(got); sparkle(it.x, it.y + bob, T.dark ? "rgba(255,226,150,.95)" : "rgba(255,200,80,.95)", 12); if (got >= L.goal) { state = "win"; endT = 0; snd.win(); if (L.meet) { objs = objs.filter(o => o.x + o.d.w < PX - 20); items = []; meet = {x:VW + 60}; } try { sessionStorage.removeItem(keyFail); } catch(e) {} for (let i = 0; i < 80; i++) { const a = Math.random() * TAU, v = 100 + Math.random() * 260; parts.push({x:PX + 10, y:GY - 70, vx:Math.cos(a) * v, vy:Math.sin(a) * v - 120, life:1.6, max:1.6, col:["#e94b3c", "#f7c948", "#3fa7d6", "#59c36a", "#f28ab2", "#ffffff"][i % 6], s:3 + Math.random() * 3, g:260, conf:true}); } } } }
    }
    for (const p of parts) { p.life -= dt; p.x += p.vx * dt; p.y += p.vy * dt; p.vy += (p.g || 0) * dt; if (!p.star && !p.conf) p.x -= speed * dt * .5; }
    parts = parts.filter(p => p.life > 0);
    shake = Math.max(0, shake - dt);
    if ((state === "win" && !meet) || state === "over") { endT += dt; if (endT > (state === "win" ? 1.5 : .9) && ovEnd.hidden) showEnd(); }
  }
  function showEnd(){
    ovEnd.hidden = false;
    if (state === "win" || state === "meet") {
      const tr = L.curses ? ` ${trips ? `Поребриков по дороге: ${trips} — и город всё слышал.` : "И ни разу не споткнулась о поребрик!"}` : "";
      ovEnd.innerHTML = `<div class="rn-big">${L.meet && L.meet.title ? L.meet.title : "Получилось!"}</div><p>Ты собрала ${L.goal} ${plural(L.goal, L.names)}.${tr}</p><div class="rn-row">${levels[opt.level] ? `<button class="rn-btn" data-act="next">Следующий уровень →</button>` : ""}<button class="rn-btn rn-ghost" data-act="back">К роману</button></div>`;
      if (opt.onUnlock) opt.onUnlock();
    } else {
      const easier = Math.max(.72, 1 - fails * .07) < assist || fails > 0;
      ovEnd.innerHTML = `<div class="rn-big">Ой!</div><p>Собрано ${got} из ${L.goal}. ${easier ? "В следующий раз бег будет чуть медленнее." : ""}</p><div class="rn-row"><button class="rn-btn" data-act="again">Ещё раз</button><button class="rn-btn rn-ghost" data-act="back">К роману</button></div>`;
    }
    const b = ovEnd.querySelector("button"); if (b) b.focus({preventScroll:true});
  }
  // ── отрисовка
  function speech(x, y, text, a){
    c.save(); c.globalAlpha = a; c.font = "600 14px system-ui, -apple-system, Segoe UI, sans-serif";
    const words = text.split(" "), lines = []; let cur = "";
    for (const wd of words) { const tst = cur ? cur + " " + wd : wd; if (c.measureText(tst).width > 230 && cur) { lines.push(cur); cur = wd; } else cur = tst; }
    lines.push(cur);
    const w = Math.max(...lines.map(l => c.measureText(l).width)) + 22, h = lines.length * 18 + 12;
    const x0 = clamp(x - w / 2, 6, VW - w - 6), y0 = Math.max(6, y - h - 9);
    c.fillStyle = "rgba(0,0,0,.18)"; rrect(c, x0 + 2, y0 + 3, w, h, 10); c.fill();
    c.fillStyle = "#fffdf8"; rrect(c, x0, y0, w, h, 10); c.fill();
    c.beginPath(); const tx = clamp(x, x0 + 14, x0 + w - 14); c.moveTo(tx - 7, y0 + h - 1); c.lineTo(tx - 2, y0 + h + 9); c.lineTo(tx + 6, y0 + h - 1); c.fill();
    c.fillStyle = "#2a2018"; c.textBaseline = "top"; c.textAlign = "left";
    lines.forEach((l, i) => c.fillText(l, x0 + 11, y0 + 7 + i * 18));
    c.restore(); c.textBaseline = "alphabetic";
  }
  function heart(x, y, s, col){ c.fillStyle = col; c.beginPath(); c.moveTo(x, y + s * .3); c.bezierCurveTo(x, y, x - s * .5, y, x - s * .5, y + s * .3); c.bezierCurveTo(x - s * .5, y + s * .6, x, y + s * .8, x, y + s); c.bezierCurveTo(x, y + s * .8, x + s * .5, y + s * .6, x + s * .5, y + s * .3); c.bezierCurveTo(x + s * .5, y, x, y, x, y + s * .3); c.fill(); }
  function render(){
    c.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    if (shake > 0) c.translate((Math.random() - .5) * 8 * shake, (Math.random() - .5) * 8 * shake);
    // небо
    c.fillStyle = lg(c, 0, 0, 0, GY, T.sky); c.fillRect(-10, -10, VW + 20, H + 20);
    for (const [x, y, p, a] of starPts) { c.fillStyle = `rgba(255,255,240,${a * (.6 + .4 * Math.sin(time * 2 + p))})`; c.fillRect((x * VW * 1.5 - scroll * .01) % (VW + 20), y, 1.5, 1.5); }
    if (T.sun) { const sx = T.sun.x * VW; glow(c, sx, T.sun.y, T.sun.r * 4, T.sun.col, .55); ell(c, sx, T.sun.y, T.sun.r, T.sun.r, `rgba(${T.sun.col},1)`); }
    if (T.moon) { const mx = T.moon.x * VW, my = T.moon.y; glow(c, mx, my, T.moon.r * (T.moon.hazy ? 6 : 4), "220,225,255", T.moon.hazy ? .35 : .25); ell(c, mx, my, T.moon.r, T.moon.r, "#f3f0dc"); ell(c, mx - 5, my - 4, 4, 4, "rgba(180,175,150,.45)"); ell(c, mx + 6, my + 5, 3, 3, "rgba(180,175,150,.4)"); }
    if (T.searchlights) for (let i = 0; i < 3; i++) { const bx = VW * (.2 + i * .33), a = -Math.PI / 2 + Math.sin(time * .5 + i * 2) * .6; c.save(); c.translate(bx, GY); c.rotate(a); const g = c.createLinearGradient(0, 0, 400, 0); g.addColorStop(0, "rgba(230,235,255,.28)"); g.addColorStop(1, "rgba(230,235,255,0)"); c.fillStyle = g; c.beginPath(); c.moveTo(0, -4); c.lineTo(420, -50); c.lineTo(420, 50); c.lineTo(0, 4); c.fill(); c.restore(); }
    for (const ly of layers) { if (ly.f >= 1) continue; const off = ((scroll * ly.f) % TW + TW) % TW; c.drawImage(ly.cv, -off, 0, TW, H); if (TW - off < VW) c.drawImage(ly.cv, TW - off, 0, TW, H); }
    if (T.gears) for (let i = 0; i < 4; i++) { const gx = ((i * 380 + 120 - scroll * .15) % 1520 + 1520) % 1520 - 200, gy = 90 + (i % 2) * 110, R = 60 + (i % 3) * 25; c.save(); c.translate(gx, gy); c.rotate(time * (i % 2 ? .4 : -.3)); c.fillStyle = "rgba(120,86,46,.55)"; c.beginPath(); const n = 16 + i * 2; for (let q = 0; q < n * 2; q++) { const rr = q % 2 ? R : R * .86, a = q / (n * 2) * TAU; c.lineTo(Math.cos(a) * rr, Math.sin(a) * rr); } c.closePath(); c.fill(); c.fillStyle = "rgba(40,26,16,.8)"; ell(c, 0, 0, R * .55, R * .55); c.fill(); c.fillStyle = "rgba(120,86,46,.55)"; for (let q = 0; q < 6; q++) { c.rotate(TAU / 6); c.fillRect(0, -4, R * .6, 8); } ell(c, 0, 0, 8, 8, "rgba(160,120,60,.9)"); c.restore(); }
    if (T.lighthouse) { const lx = ((1200 - scroll * .12) % TW + TW) % TW; if (lx < VW + 60) { c.fillStyle = "#1a2636"; c.beginPath(); c.moveTo(lx - 9, 232); c.lineTo(lx - 5, 150); c.lineTo(lx + 5, 150); c.lineTo(lx + 9, 232); c.fill(); ell(c, lx, 146, 6, 6, "#ffe9a8"); const a = time * 1.4; c.save(); c.translate(lx, 146); c.scale(Math.cos(a), 1); const g = c.createLinearGradient(0, 0, 300, 0); g.addColorStop(0, "rgba(255,240,190,.35)"); g.addColorStop(1, "rgba(255,240,190,0)"); c.fillStyle = g; c.beginPath(); c.moveTo(0, -3); c.lineTo(300, -26); c.lineTo(300, 26); c.lineTo(0, 3); c.fill(); c.restore(); glow(c, lx, 146, 30, "255,235,170", .6); } }
    if (T.shafts) { c.save(); c.globalCompositeOperation = "lighter"; for (let i = 0; i < 3; i++) { const sx = ((i * 520 + 200 - scroll * .3) % 1560 + 1560) % 1560 - 200; const g = c.createLinearGradient(sx, 80, sx + 160, GY); g.addColorStop(0, "rgba(255,200,120,.16)"); g.addColorStop(1, "rgba(255,200,120,0)"); c.fillStyle = g; c.beginPath(); c.moveTo(sx, 80); c.lineTo(sx + 18, 80); c.lineTo(sx + 200, GY); c.lineTo(sx + 120, GY); c.fill(); } c.restore(); }
    T.ground(c, scroll, VW + 2);
    for (const ly of layers) { if (ly.f < 1) continue; const off = scroll % TW; c.drawImage(ly.cv, -off, 0, TW, H); if (TW - off < VW) c.drawImage(ly.cv, TW - off, 0, TW, H); }
    // предметы
    for (const it of items) ITEM[L.item](c, it.x, it.y + Math.sin(it.t * 3) * 4, it.t, it.id);
    // препятствия (наземные)
    for (const o of objs) if (!o.d.hb.bottom) o.d.draw(c, o.x, o.t, o);
    // тень и Наталья
    const fy = GY - py; ell(c, PX + 2, GY + 2, 18 * (1 - Math.min(.6, py / 220)), 4 * (1 - Math.min(.6, py / 220)), "rgba(0,0,0,.22)");
    if (!(inv > 0 && Math.floor(inv * 12) % 2)) drawNatalia(c, PX, fy, P, time, ph, HS);
    if (meet) for (const w of L.meet.who) { const pd = PEOPLE[w.id]; if (pd) pd(c, meet.x + w.dx, GY, time, w); }
    for (const o of objs) if (o.d.hb.bottom) o.d.draw(c, o.x, o.t, o);
    // частицы
    for (const p of parts) { const a = clamp(p.life / p.max, 0, 1); c.globalAlpha = a; if (p.conf) { c.fillStyle = p.col; c.save(); c.translate(p.x, p.y); c.rotate(p.life * 9); c.fillRect(-p.s / 2, -p.s / 4, p.s, p.s / 2); c.restore(); } else if (p.star) { c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.s * a + .5, 0, TAU); c.fill(); } else { c.fillStyle = p.col; c.beginPath(); c.arc(p.x, p.y, p.s * (1.6 - a), 0, TAU); c.fill(); } }
    c.globalAlpha = 1;
    // атмосфера
    for (const m of motes) { const x = ((m.x - scroll * (.2 + m.s * .4)) % (VW + 20) + VW + 20) % (VW + 20), y = m.y + Math.sin(time + m.x) * 6; c.fillStyle = T.dark ? `rgba(255,230,170,${.15 + m.s * .25})` : `rgba(255,255,255,${.2 + m.s * .3})`; c.fillRect(x, y, 1.6, 1.6); }
    if (T.fog) for (const f of fogs) { const x = ((f.x - scroll * .6 - time * 20) % (VW + 600) + VW + 600) % (VW + 600) - 300; const g = c.createRadialGradient(x + f.w / 2, f.y, 0, x + f.w / 2, f.y, f.w / 2); g.addColorStop(0, "rgba(190,205,220,.22)"); g.addColorStop(1, "rgba(190,205,220,0)"); c.fillStyle = g; c.fillRect(x, f.y - f.w / 2, f.w, f.w); }
    if (T.confetti) for (const q of confs) { const y = (q.y + time * q.v) % H, x = ((q.x - scroll * .3) % (VW + 20) + VW + 20) % (VW + 20); c.fillStyle = q.col; c.save(); c.translate(x, y); c.rotate(q.a + time * 3); c.fillRect(-3, -1.5, 6, 3); c.restore(); }
    if (T.fx) T.fx(c, time, scroll, VW);
    if (T.indoor && !T.gears) { const g = c.createRadialGradient(VW / 2, H / 2, H * .4, VW / 2, H / 2, VW * .7); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.18)"); c.fillStyle = g; c.fillRect(0, 0, VW, H); }
    if (T.gears) { const g = c.createRadialGradient(VW / 2, H / 2, H * .3, VW / 2, H / 2, VW * .7); g.addColorStop(0, "rgba(0,0,0,0)"); g.addColorStop(1, "rgba(0,0,0,.45)"); c.fillStyle = g; c.fillRect(0, 0, VW, H); }
    if (chill > 0) { c.fillStyle = `rgba(150,190,235,${.28 * chill})`; c.fillRect(0, 0, VW, H); c.strokeStyle = `rgba(255,255,255,${.55 * chill})`; c.lineWidth = 1.2; c.beginPath();
      for (let i = 0; i < 26; i++) { const y = (hash(i * 13) * H), x = ((hash(i * 7) * VW * 1.4 - time * 900 * (1 + hash(i))) % (VW + 200) + VW + 200) % (VW + 200) - 100; c.moveTo(x, y); c.lineTo(x + 40 + hash(i * 3) * 50, y - 4); } c.stroke(); }
    if (bubble) {
      let bx = PX + 14, by = GY - py - (stumble > 0 ? 92 : 108);
      if (bubble.who !== "nat" && meet) { const w = L.meet.who.find(q => q.id === bubble.who) || L.meet.who[0], pdh = (PEOPLE[w.id] && PEOPLE[w.id].h) || 120; bx = meet.x + w.dx; by = GY - pdh - 8; }
      speech(bx, by, bubble.text, Math.min(1, bubble.t * 4));
    }
    // HUD
    c.setTransform(k * dpr, 0, 0, k * dpr, 0, 0);
    if (state !== "ready") {
      for (let i = 0; i < 5; i++) heart(24 + i * 26, 14, 18, i < hearts ? "#e8424f" : "rgba(120,110,110,.4)");
      if (L.curses && trips) { c.font = "600 12px system-ui, -apple-system, Segoe UI, sans-serif"; c.textAlign = "left"; c.fillStyle = T.hud; c.fillText(`поребрики: ${trips}`, 14, 48); }
      const txt = `${got} / ${L.goal}`; c.font = "600 18px system-ui, -apple-system, Segoe UI, sans-serif"; c.textAlign = "right"; c.textBaseline = "middle";
      const tw = c.measureText(txt).width; c.fillStyle = T.dark ? "rgba(0,0,0,.35)" : "rgba(255,255,255,.55)"; rrect(c, VW - tw - 62, 10, tw + 52, 30, 15); c.fill();
      c.fillStyle = T.hud; c.fillText(txt, VW - 16, 26); ITEM[L.item](c, VW - tw - 38, 25, time, 1);
      const pw = Math.min(220, VW * .3), px0 = (VW - pw) / 2; c.fillStyle = T.dark ? "rgba(255,255,255,.15)" : "rgba(0,0,0,.12)"; rrect(c, px0, 20, pw, 7, 3.5); c.fill(); c.fillStyle = "#f2b33d"; rrect(c, px0, 20, Math.max(7, pw * Math.min(1, got / L.goal)), 7, 3.5); c.fill();
      c.textAlign = "left"; c.textBaseline = "alphabetic";
    }
  }
  // ── цикл
  let last = performance.now(), raf = 0, paused = false;
  function frame(now){
    if (!document.body.contains(cv)) return cleanup();
    const dt = Math.min(.05, (now - last) / 1000); last = now;
    if (!paused) update(dt);
    render();
    raf = requestAnimationFrame(frame);
  }
  // ── управление
  const isTyping = e => e.target && e.target.closest && e.target.closest("input,textarea,select,[contenteditable]");
  function kd(e){
    if (isTyping(e)) return;
    const j = e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW", d = e.code === "ArrowDown" || e.code === "KeyS";
    if (!j && !d) { if (e.code === "Escape" || e.code === "KeyP") togglePause(); return; }
    e.preventDefault();
    if (state === "ready" && j && !e.repeat) { reset(); return; }
    if (state === "over" && j && !e.repeat && !ovEnd.hidden) { reset(); return; }
    if (j) keys.jump = true; if (d) keys.duck = true;
  }
  function ku(e){ const j = e.code === "Space" || e.code === "ArrowUp" || e.code === "KeyW", d = e.code === "ArrowDown" || e.code === "KeyS"; if (j) keys.jump = false; if (d) keys.duck = false; }
  function togglePause(){ if (state !== "play") return; paused = !paused; if (paused) { ovEnd.hidden = false; ovEnd.innerHTML = `<div class="rn-big">Пауза</div><button class="rn-btn" data-act="resume">Продолжить</button>`; } else { ovEnd.hidden = true; last = performance.now(); } }
  function vis(){ if (document.hidden && state === "play" && !paused) togglePause(); }
  root.addEventListener("click", e => { const b = e.target.closest("[data-act]"); if (!b) return; const a = b.dataset.act;
    if (a === "go" || a === "again") reset(); else if (a === "resume") togglePause(); else if (a === "next") opt.onNext && opt.onNext(); else if (a === "back") opt.onBack && opt.onBack(); });
  root.querySelectorAll(".rn-pb").forEach(b => { const kname = b.dataset.k;
    const on = e => { e.preventDefault(); if (state === "ready" || (state === "over" && !ovEnd.hidden)) { if (kname === "jump") reset(); return; } keys[kname] = true; b.classList.add("on"); };
    const off = e => { e.preventDefault(); keys[kname] = false; b.classList.remove("on"); };
    b.addEventListener("pointerdown", on); b.addEventListener("pointerup", off); b.addEventListener("pointercancel", off); b.addEventListener("pointerleave", off); b.addEventListener("contextmenu", e => e.preventDefault()); });
  cv.addEventListener("pointerdown", e => { e.preventDefault(); if (state === "play") { keys.jump = true; const up = () => { keys.jump = false; window.removeEventListener("pointerup", up); }; window.addEventListener("pointerup", up); } });
  window.addEventListener("keydown", kd); window.addEventListener("keyup", ku); window.addEventListener("resize", size); document.addEventListener("visibilitychange", vis);
  function cleanup(){ cancelAnimationFrame(raf); window.removeEventListener("keydown", kd); window.removeEventListener("keyup", ku); window.removeEventListener("resize", size); document.removeEventListener("visibilitychange", vis); }
  raf = requestAnimationFrame(frame);
  // для проверки: LitmirRunner._debug
  window.LitmirRunner._debug = {get state(){ return state; }, get objs(){ return objs; }, get got(){ return got; }, get hearts(){ return hearts; }, get trips(){ return trips; }, keys, PX, reset, win(){ got = L.goal - 1; items.push({x:PX, y:GY - 40, id:0, t:0}); }, pose(p){ Object.assign(P, POSES[p] || runPose(1)); }, fast(n){ for (let i = 0; i < n; i++) update(1 / 60); }};
  return true;
}

/* Расширения: другие романы добавляют свои уровни, фоны, препятствия и героев (см. rezonans.js) */
const HEROES = {}, PEOPLE = {};
window.LitmirRunner = {
  ext:{LEVELS, THEMES, OB, ITEM, HEROES, PEOPLE, POSES, S0, h:{H, GY, TW, TAU, clamp, lerp, rng, hash, lg, glow, rrect, ell, wrap, facade, hillsLine, cloud, stars}},
  mount,
  has(slug, level){ return !!(LEVELS[slug] && LEVELS[slug][level - 1]); },
  count(slug){ return (LEVELS[slug] || []).length; },
  list(slug){ return (LEVELS[slug] || []).map((L, i) => ({n:i + 1, title:L.title, theme:L.theme, goal:L.goal, what:plural(L.goal, L.names), intro:L.intro, from:i * 5 + 1, to:i * 5 + 5})); },
  icon(slug, level, sz){ const L = (LEVELS[slug] || [])[level - 1]; if (!L) return ""; sz = sz || 48; const cv = document.createElement("canvas"); cv.width = cv.height = sz * 2; const c = cv.getContext("2d"); c.scale(sz * 2 / 40, sz * 2 / 40); ITEM[L.item](c, 20, 20, 0, 1); return cv.toDataURL(); },
  sky(slug, level){ const L = (LEVELS[slug] || [])[level - 1]; return L ? THEMES[L.theme].sky : null; }
};
})();
