/* Videoclip de una canción del romance: imagen de fondo + canción + «código» verde con frases de la novela
   que aparecen y desaparecen al ritmo de la música (WebAudio: se mide la energía de los graves y los golpes).
   LitmirClip.mount(el, {slug, clip:{audio, image, title, lines}}) — lines: JSON [{ch, t}] con frases de la novela. */
(function(){
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const fmt = s => { s = Math.max(0, Math.floor(s || 0)); return Math.floor(s / 60) + ":" + String(s % 60).padStart(2, "0"); };

function css(){
  if (document.getElementById("clipCss")) return;
  const s = document.createElement("style"); s.id = "clipCss";
  s.textContent = `
.clip-wrap h3{font:400 22px var(--serif);color:var(--ink);margin:2px 0 8px}.clip-wrap .clip-p{font:14px/1.55 var(--sans);color:var(--muted);margin:0 0 12px}
.clip{position:relative;margin:0 auto;width:100%;max-width:640px;aspect-ratio:896/1152;max-height:86vh;border-radius:14px;overflow:hidden;background:#05080c center/cover no-repeat;box-shadow:0 6px 30px rgba(0,0,0,.35);user-select:none;-webkit-user-select:none}
.clip:fullscreen{max-width:none;max-height:none;width:100vw;height:100vh;border-radius:0;background-size:contain;background-color:#000}
.clip [hidden]{display:none!important}
.clip canvas{position:absolute;inset:0;width:100%;height:100%;display:block}
.clip .clip-start{position:absolute;inset:0;display:flex;flex-direction:column;align-items:center;justify-content:center;gap:14px;background:radial-gradient(ellipse at center,rgba(0,0,0,.25),rgba(0,0,0,.65));color:#d8ffe2;border:0;cursor:pointer;font:600 15px var(--sans);width:100%}
.clip .clip-start b{width:84px;height:84px;border-radius:50%;background:rgba(57,255,106,.16);border:2px solid #39ff6a;box-shadow:0 0 30px rgba(57,255,106,.55);display:flex;align-items:center;justify-content:center;font-size:34px;color:#39ff6a;padding-left:6px}
.clip .clip-start span{font:500 13px ui-monospace,Menlo,Consolas,monospace;letter-spacing:.08em;text-shadow:0 0 8px #39ff6a;color:#9dffb6}
.clip .clip-bar{position:absolute;left:0;right:0;bottom:0;display:flex;align-items:center;gap:10px;padding:10px 12px;background:linear-gradient(transparent,rgba(0,0,0,.75));color:#c9ffd6;font:12px ui-monospace,Menlo,Consolas,monospace;opacity:1;transition:opacity .4s}
.clip.idle .clip-bar{opacity:0}.clip.idle{cursor:none}
.clip .clip-bar button{all:unset;cursor:pointer;width:32px;height:32px;border-radius:50%;display:flex;align-items:center;justify-content:center;color:#39ff6a;border:1px solid rgba(57,255,106,.5);font-size:14px;flex:none}
.clip .clip-seek{flex:1;height:4px;background:rgba(255,255,255,.18);border-radius:4px;position:relative;cursor:pointer}.clip .clip-seek i{position:absolute;left:0;top:0;bottom:0;background:#39ff6a;border-radius:4px;box-shadow:0 0 8px #39ff6a}`;
  document.head.appendChild(s);
}

const TPL = [
  (c, t) => `> retrato.cap(${c}): "${t}"`,
  (c, t) => `// cap. ${c} — ${t}`,
  (c, t) => `$ grep -n "${t.split(" ").slice(0, 2).join(" ")}" cap_${c}.txt`,
  (c, t) => `echo "${t}" >> sinea.log`,
  (c, t) => `if (tatiana.miedo) { leer(${c}); }  /* ${t} */`,
  (c, t) => `0x${(0x1A00 + c * 97).toString(16).toUpperCase()}  ${t}`,
  (c, t) => `[${c}] ${t}`,
  (c, t) => `admirador_secreto.send("${t}")`
];
const GLY = "01アイウエオカキクケコサシスセソ0123456789ABCDEF<>/{}[]=;:#$%&*+";

function mount(el, o){
  css();
  const C = o.clip, lang = o.lang || "es";
  el.innerHTML = `<div class="clip-wrap"><h3>${esc(C.title)}</h3><p class="clip-p">${esc(C.about || "")}</p>
    <div class="clip" style="background-image:url('${esc(C.image)}')"><canvas></canvas>
      <button type="button" class="clip-start"><b>▶</b><span>${esc(C.startLabel || "PLAY")}</span></button>
      <div class="clip-bar" hidden><button type="button" data-pp aria-label="Pausa">❚❚</button><span class="clip-t">0:00</span><div class="clip-seek"><i></i></div><span class="clip-d">0:00</span><button type="button" data-fs aria-label="Pantalla completa">⛶</button></div></div></div>`;
  const box = el.querySelector(".clip"), cv = box.querySelector("canvas"), c = cv.getContext("2d"), start = box.querySelector(".clip-start"), bar = box.querySelector(".clip-bar"),
        pp = bar.querySelector("[data-pp]"), seek = bar.querySelector(".clip-seek"), fill = seek.querySelector("i"), tEl = bar.querySelector(".clip-t"), dEl = bar.querySelector(".clip-d");
  const audio = new Audio(C.audio); audio.preload = "metadata";
  let lines = [], ctx = null, an = null, data = null, raf = 0, W = 0, H = 0, dpr = 1, avg = 0, last = 0, cool = 0, snips = [], cols = [], flash = 0, idleT = 0;
  fetch(C.lines, {cache:"no-cache"}).then(r => r.json()).then(j => { lines = j; }).catch(() => {});
  const fit = () => { dpr = Math.min(2, window.devicePixelRatio || 1); W = box.clientWidth; H = box.clientHeight; cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    const n = Math.max(8, Math.floor(W / 16)); cols = Array.from({length:n}, (_, i) => ({x:(i + .5) * W / n, y:Math.random() * H, v:40 + Math.random() * 90, on:Math.random() < .35})); };
  fit(); const ro = window.ResizeObserver ? new ResizeObserver(fit) : null; if (ro) ro.observe(box);

  const spawn = (big) => {
    if (!lines.length) return;
    const L = lines[Math.floor(Math.random() * lines.length)], ch = String(L.ch).padStart(2, "0");
    const txt = TPL[Math.floor(Math.random() * TPL.length)](ch, L.t);
    const fs = Math.max(11, Math.min(18, W / 34)) * (big ? 1.25 : 1);
    c.font = `${big ? "700 " : ""}${fs}px ui-monospace,Menlo,Consolas,monospace`;
    const maxW = W * .86; let parts = [txt];
    if (c.measureText(txt).width > maxW) { const words = txt.split(" "); parts = []; let cur = ""; for (const w of words) { if (c.measureText(cur + w).width > maxW && cur) { parts.push(cur.trim()); cur = ""; } cur += w + " "; } if (cur.trim()) parts.push(cur.trim()); }
    const wMax = Math.max(...parts.map(p => c.measureText(p).width));
    let x = 10 + Math.random() * Math.max(10, W - wMax - 20), y = 30 + Math.random() * (H * .78);
    for (let k = 0; k < 8 && snips.some(s => Math.abs(s.y - y) < fs * 2.2 * Math.max(1, s.parts.length)); k++) y = 30 + Math.random() * (H * .78);
    snips.push({parts, x, y, fs, t:0, type:22 + Math.random() * 20, hold:1.6 + Math.random() * 2.2, big});
    if (snips.length > 9) snips.shift();
  };

  const draw = (dt) => {
    c.setTransform(dpr, 0, 0, dpr, 0, 0); c.clearRect(0, 0, W, H);
    let e = 0, bass = 0;
    if (an && !audio.paused) { an.getByteFrequencyData(data); for (let i = 0; i < 12; i++) bass += data[i]; bass /= 12 * 255; for (let i = 0; i < data.length; i++) e += data[i]; e /= data.length * 255; }
    avg = avg * .94 + bass * .06;
    const playing = !audio.paused;
    // velo
    c.fillStyle = `rgba(0,10,4,${playing ? .16 + e * .22 : .12})`; c.fillRect(0, 0, W, H);
    // lluvia de código
    c.font = `${Math.max(10, W / 48)}px ui-monospace,Menlo,Consolas,monospace`; c.textAlign = "center";
    for (const k of cols) {
      if (!k.on && playing && Math.random() < e * .02) k.on = true;
      if (!k.on) continue;
      k.y += k.v * dt * (playing ? .6 + e * 2.2 : .25);
      for (let j = 0; j < 7; j++) { const a = (1 - j / 7) * (playing ? .18 + e * .5 : .1); c.fillStyle = `rgba(57,255,106,${a.toFixed(3)})`; c.fillText(GLY[Math.floor(Math.random() * GLY.length)], k.x, k.y - j * 15); }
      if (k.y > H + 110) { k.y = -20; k.on = Math.random() < .5; }
    }
    c.textAlign = "left";
    // golpes → frases
    cool -= dt;
    if (playing && cool <= 0 && (bass > avg * 1.28 + .03 || Math.random() < dt * .25)) { spawn(bass > avg * 1.6); cool = .55 + Math.random() * .5; if (bass > avg * 1.6) flash = .25; }
    // frases
    for (const s of snips) {
      s.t += dt * (playing ? 1 : .5);
      const total = s.parts.join("").length, typed = Math.min(total, Math.floor(s.t * s.type * (playing ? 1 + e : 1))), life = total / s.type + s.hold, out = s.t - life;
      const a = out > 0 ? Math.max(0, 1 - out / .9) : 1;
      c.font = `${s.big ? "700 " : ""}${s.fs}px ui-monospace,Menlo,Consolas,monospace`;
      let n = typed;
      s.parts.forEach((p, i) => {
        let shown = p.slice(0, Math.max(0, n)); n -= p.length;
        if (out > 0) shown = shown.split("").map(ch => ch !== " " && Math.random() < out * .9 ? GLY[Math.floor(Math.random() * GLY.length)] : ch).join("");
        const y = s.y + i * s.fs * 1.35;
        c.shadowColor = "#39ff6a"; c.shadowBlur = 10 + e * 18;
        c.fillStyle = `rgba(0,0,0,${.45 * a})`; const w = c.measureText(shown).width; if (w) c.fillRect(s.x - 4, y - s.fs, w + 8, s.fs * 1.3);
        c.fillStyle = `rgba(${s.big ? "190,255,205" : "57,255,106"},${a.toFixed(3)})`; c.fillText(shown, s.x, y);
        if (i === s.parts.length - 1 && typed < total && Math.floor(s.t * 6) % 2 === 0) c.fillRect(s.x + c.measureText(shown).width + 2, y - s.fs * .8, s.fs * .55, s.fs);
        c.shadowBlur = 0;
      });
    }
    snips = snips.filter(s => s.t < s.parts.join("").length / s.type + s.hold + 1);
    // destello / scanlines
    if (flash > 0) { c.fillStyle = `rgba(57,255,106,${(flash * .35).toFixed(3)})`; c.fillRect(0, 0, W, H); flash -= dt;
      const yy = Math.random() * H; c.drawImage(cv, 0, yy * dpr, cv.width, 18 * dpr, (Math.random() - .5) * 30, yy, W, 18); }
    c.fillStyle = "rgba(0,0,0,.12)"; for (let y = 0; y < H; y += 3) c.fillRect(0, y, W, 1);
    // barra
    if (audio.duration) { fill.style.width = (audio.currentTime / audio.duration * 100) + "%"; tEl.textContent = fmt(audio.currentTime); dEl.textContent = fmt(audio.duration); }
    if (playing) { idleT += dt; box.classList.toggle("idle", idleT > 3); }
  };
  const loop = ts => {
    if (!box.isConnected) { audio.pause(); audio.src = ""; cancelAnimationFrame(raf); if (ro) ro.disconnect(); if (ctx) ctx.close().catch(() => {}); return; }
    const dt = Math.min(.05, (ts - (last || ts)) / 1000); last = ts; draw(dt); raf = requestAnimationFrame(loop);
  };
  raf = requestAnimationFrame(loop);

  const play = () => {
    try { if (!ctx) { const AC = window.AudioContext || window.webkitAudioContext; ctx = new AC(); const src = ctx.createMediaElementSource(audio); an = ctx.createAnalyser(); an.fftSize = 256; an.smoothingTimeConstant = .7; data = new Uint8Array(an.frequencyBinCount); src.connect(an); an.connect(ctx.destination); }
      if (ctx.state === "suspended") ctx.resume(); } catch(_) {}
    document.querySelectorAll("audio").forEach(a => { if (a !== audio && !a.paused) a.pause(); });
    audio.play().catch(() => {}); start.hidden = true; bar.hidden = false; pp.textContent = "❚❚";
    spawn(true);
  };
  start.onclick = play;
  pp.onclick = () => { if (audio.paused) play(); else { audio.pause(); pp.textContent = "▶"; box.classList.remove("idle"); } };
  audio.onended = () => { pp.textContent = "↻"; box.classList.remove("idle"); };
  seek.onclick = e => { if (!audio.duration) return; const r = seek.getBoundingClientRect(); audio.currentTime = (e.clientX - r.left) / r.width * audio.duration; };
  bar.querySelector("[data-fs]").onclick = () => { if (document.fullscreenElement) document.exitFullscreen(); else if (box.requestFullscreen) box.requestFullscreen().catch(() => {}); };
  box.addEventListener("pointermove", () => { idleT = 0; box.classList.remove("idle"); });
  box.addEventListener("click", e => { if (e.target === cv && !start.hidden) return; if (e.target === cv) pp.click(); });
}

window.LitmirClip = {mount};
})();
