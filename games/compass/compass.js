/* Brújula de la lectura — sección de novela (n.compass).
   Datos: novels/<slug>/compass.json {title, intro, empty, letters:{E:{pos, word, reveal, hint}}, steps:[{ch, dir, angle?, label?, text}]}.
   La aguja apunta a la letra del último capítulo leído; las palabras de las letras se revelan solo después
   del capítulo «reveal», así que no hay spoilers. Al abrir la sección, si se leyó algo nuevo desde la última
   visita, la aguja gira desde donde estaba. Con ◀ ▶ (o «Recorrer el viaje») se repasa el camino de la aguja.
   Uso: LitmirCompass.mount(pane, {slug, store, isRead}). */
(function(){
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const POS = {top:0, right:90, bottom:180, left:270};
const XY = {top:[130,60], right:[200,130], bottom:[130,200], left:[60,130]};
const WXY = {top:[130,84], right:[200,157], bottom:[130,176], left:[60,157]};
const CSS = `
.cp{max-width:620px;margin:0 auto;font-family:var(--sans)}
.cp-intro{color:var(--muted);font-size:14.5px;line-height:1.55;text-align:center;margin:0 auto 14px;max-width:520px}
.cp-stage{position:relative;width:min(300px,80vw);margin:6px auto 10px;aspect-ratio:1}
.cp-stage svg{width:100%;height:100%;display:block;overflow:visible}
.cp-ring{fill:url(#cpBrass);stroke:#6b4a1c;stroke-width:2}
.cp-face{fill:url(#cpFace)}
.cp-tick{stroke:#8a6a3a;stroke-width:1.2;opacity:.55}
.cp-tick.big{stroke-width:2.2;opacity:.9}
.cp-trail{fill:none;stroke:#c8963e;stroke-width:2;stroke-dasharray:3 6;stroke-linecap:round;opacity:.75}
.cp-let{font:700 30px "Cormorant Garamond",Georgia,serif;fill:#6a5434;text-anchor:middle;dominant-baseline:central;transition:fill .6s}
.cp-let.on{fill:#a8323f}
.cp-let.now{fill:#a8323f;filter:url(#cpGlow)}
.cp-word{font:600 8px var(--sans);letter-spacing:.1em;text-transform:uppercase;fill:#8a6a3a;text-anchor:middle}
.cp-needle{transform-origin:130px 130px;transition:transform 1.8s cubic-bezier(.25,1.45,.4,1)}
.cp-needle.idle{transition:none;animation:cpSpin 9s linear infinite}
.cp-needle.shake .cp-nd{animation:cpShake .5s ease-in-out 2}
.cp-nd{transform-origin:130px 130px}
@keyframes cpSpin{to{transform:rotate(360deg)}}
@keyframes cpShake{0%,100%{transform:rotate(0)}25%{transform:rotate(-5deg)}75%{transform:rotate(5deg)}}
.cp-tip{fill:#a8323f}.cp-tail{fill:#e9dcc0;stroke:#8a6a3a;stroke-width:.8}
.cp-hub{fill:#c8963e;stroke:#6b4a1c;stroke-width:1.5}
.cp-sun{fill:#ffd36b;opacity:0;transition:opacity 1.2s}
.cp-sun.on{opacity:.55;animation:cpPulse 2.6s ease-in-out infinite}
@keyframes cpPulse{50%{opacity:.25}}
.cp-card{background:var(--paper);border:1px solid var(--line);border-radius:16px;padding:16px 18px;text-align:center;box-shadow:var(--shadow)}
.cp-k{font:600 11.5px var(--sans);text-transform:uppercase;letter-spacing:.14em;color:var(--accent);margin-bottom:6px}
.cp-card h3{font-family:var(--display);font-size:21px;margin:0 0 8px}
.cp-card p{margin:0;color:var(--ink);font-size:15px;line-height:1.55}
.cp-new{display:inline-block;margin-bottom:8px;padding:3px 10px;border-radius:999px;background:var(--accent);color:#fff;font:600 12px var(--sans)}
.cp-nav{display:flex;justify-content:center;gap:8px;margin:12px 0 4px;flex-wrap:wrap}
.cp-nav button{font:600 14px var(--sans);padding:8px 14px;border-radius:999px;border:1px solid var(--line);background:var(--paper);color:var(--ink);cursor:pointer}
.cp-nav button:disabled{opacity:.4;cursor:default}
.cp-nav button.go{background:var(--accent);border-color:var(--accent);color:#fff}
.cp-h{font:600 11.5px var(--sans);text-transform:uppercase;letter-spacing:.14em;color:var(--muted);margin:22px 0 10px}
.cp-keys{display:grid;grid-template-columns:repeat(4,1fr);gap:8px}
@media (max-width:560px){.cp-keys{grid-template-columns:repeat(2,1fr)}}
.cp-key{border:1px solid var(--line);border-radius:12px;padding:10px 6px;text-align:center;background:var(--paper)}
.cp-key b{display:block;font:700 24px "Cormorant Garamond",Georgia,serif;color:var(--accent)}
.cp-key span{font-size:12.5px;color:var(--muted)}
.cp-key.lock b{color:var(--muted)}
.cp-key small{display:block;font-size:11.5px;color:var(--muted);margin-top:4px;line-height:1.35}
.cp-log{list-style:none;margin:0;padding:0;display:flex;flex-direction:column;gap:6px}
.cp-log button{all:unset;box-sizing:border-box;width:100%;display:flex;gap:12px;align-items:center;padding:9px 12px;border-radius:12px;cursor:pointer;border:1px solid transparent}
.cp-log button:hover,.cp-log button.cur{background:var(--accent-soft);border-color:var(--line)}
.cp-log .b{flex:none;width:34px;height:34px;border-radius:50%;display:grid;place-items:center;font:700 18px "Cormorant Garamond",Georgia,serif;background:#efe2c4;color:#6b4a1c;border:1px solid #c8963e}
.cp-log .t{font-size:14px;line-height:1.35}.cp-log .t small{display:block;color:var(--muted);font-size:12.5px}
.cp-log .lock{opacity:.5;cursor:default}
.cp-log .lock .b{background:transparent;border-style:dashed}
`;

function mount(pane, opt){
  pane.innerHTML = `<div class="loading">…</div>`;
  if (!document.getElementById("cpCss")) { const st = document.createElement("style"); st.id = "cpCss"; st.textContent = CSS; document.head.appendChild(st); }
  fetch(`novels/${opt.slug}/compass.json`, {cache:"no-cache"}).then(r => r.json()).then(D => draw(pane, opt, D))
    .catch(() => { pane.innerHTML = `<p class="cp-intro">—</p>`; });
}

const UI_DEF = {chapter:"Capítulo", points:"La aguja señala", letterRef:"la {k}", moved:"¡La aguja se movió!", play:"▶ Recorrer el viaje", pause:"❚❚ Pausa",
  prev:"Anterior", next:"Siguiente", letters:"Las letras", locked:"Se revela en la lectura", diary:"El diario de la aguja", keepReading:"Seguí leyendo para que la aguja se mueva", order:["E","R","S","C"]};
function draw(pane, opt, D){
  const U = Object.assign({}, UI_DEF, D.ui || {});
  const isRead = opt.isRead, store = opt.store, KEY = "compass:" + opt.slug;
  const steps = D.steps, maxCh = Math.max(...steps.map(s => s.ch));
  // Último capítulo leído (los capítulos de después del final cuentan como el final)
  let reached = 0; for (let ch = 1; ch <= maxCh + 5; ch++) if (isRead(ch)) reached = Math.min(ch, maxCh);
  const open = steps.filter(s => s.ch <= reached);
  const revealed = k => reached >= (D.letters[k].reveal || 99);
  const angleOf = s => s.dir in D.letters ? POS[D.letters[s.dir].pos] : (s.angle || 0);
  const seen = store.get(KEY, 0) || 0;
  store.set(KEY, reached);

  const ticks = Array.from({length:36}, (_, i) => { const a = i * 10 * Math.PI / 180, big = i % 9 === 0, r1 = big ? 84 : 90;
    return `<line class="cp-tick${big ? " big" : ""}" x1="${130 + r1 * Math.sin(a)}" y1="${130 - r1 * Math.cos(a)}" x2="${130 + 97 * Math.sin(a)}" y2="${130 - 97 * Math.cos(a)}"/>`; }).join("");
  // Huella del camino: las letras visitadas, en orden
  const path = []; open.forEach(s => { if (s.dir in D.letters && path[path.length - 1] !== s.dir) path.push(s.dir); });
  const trail = path.length > 1 ? `<polyline class="cp-trail" points="${path.map(k => XY[D.letters[k].pos].map(v => (v - 130) * .78 + 130).join(",")).join(" ")}"/>` : "";
  const letters = Object.keys(D.letters).map(k => { const L = D.letters[k], [x, y] = XY[L.pos], on = path.includes(k);
    return `<text class="cp-let${on ? " on" : ""}" data-l="${k}" x="${x}" y="${y}">${esc(k)}</text>` +
      (revealed(k) ? `<text class="cp-word" x="${WXY[L.pos][0]}" y="${WXY[L.pos][1]}">${esc(L.word)}</text>` : ""); }).join("");

  pane.innerHTML = `<div class="cp">
    <p class="cp-intro">${esc(D.intro)}</p>
    <div class="cp-stage"><svg viewBox="0 0 260 260" role="img" aria-label="${esc(D.title)}">
      <defs>
        <radialGradient id="cpBrass" cx="35%" cy="30%"><stop offset="0" stop-color="#f3d58f"/><stop offset=".55" stop-color="#c8963e"/><stop offset="1" stop-color="#7a5420"/></radialGradient>
        <radialGradient id="cpFace" cx="45%" cy="40%"><stop offset="0" stop-color="#fbf3df"/><stop offset="1" stop-color="#e6d3a8"/></radialGradient>
        <filter id="cpGlow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="2.4" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
      </defs>
      <circle class="cp-ring" cx="130" cy="130" r="122"/><circle class="cp-face" cx="130" cy="130" r="104"/>
      <circle class="cp-sun${reached >= maxCh ? " on" : ""}" cx="130" cy="130" r="60" filter="url(#cpGlow)"/>
      ${ticks}${trail}${letters}
      <g class="cp-needle${reached ? "" : " idle"}"><g class="cp-nd">
        <polygon class="cp-tail" points="130,130 121,136 130,206 139,136"/>
        <polygon class="cp-tip" points="130,130 121,124 130,54 139,124"/>
        <circle class="cp-hub" cx="130" cy="130" r="9"/></g></g>
    </svg></div>
    <div class="cp-card" id="cpCard"></div>
    ${open.length ? `<div class="cp-nav"><button type="button" id="cpPrev" aria-label="${esc(U.prev)}">◀</button><button type="button" class="go" id="cpPlay">${esc(U.play)}</button><button type="button" id="cpNext" aria-label="${esc(U.next)}">▶</button></div>` : ""}
    <h4 class="cp-h">${esc(U.letters)}</h4>
    <div class="cp-keys">${U.order.filter(k => D.letters[k]).map(k => revealed(k)
      ? `<div class="cp-key"><b>${k}</b><span>${esc(D.letters[k].word)}</span><small>${esc(D.letters[k].hint)}</small></div>`
      : `<div class="cp-key lock"><b>${k}</b><span>?</span><small>${esc(U.locked)}</small></div>`).join("")}</div>
    <h4 class="cp-h">${esc(U.diary)}</h4>
    <ol class="cp-log">${steps.map((s, i) => s.ch <= reached
      ? `<li><button type="button" data-i="${i}"><span class="b">${s.dir in D.letters ? esc(s.dir) : "✦"}</span><span class="t">${esc(U.chapter)} ${s.ch}<small>${esc(s.text.split(/(?<=[.!?…»])\s/)[0])}</small></span></button></li>`
      : `<li><button type="button" class="lock" disabled><span class="b">?</span><span class="t">${esc(U.chapter)} ${s.ch}<small>${esc(U.keepReading)}</small></span></button></li>`).join("")}</ol>
  </div>`;

  const needle = pane.querySelector(".cp-needle"), card = pane.querySelector("#cpCard");
  let rot = 0, cur = -1, timer = null;
  const turn = (a, spin) => {
    let d = ((a - rot) % 360 + 540) % 360 - 180; if (spin) d += d >= 0 ? 360 : -360;
    rot += d; needle.style.transform = `rotate(${rot}deg)`;
    needle.classList.remove("shake"); void needle.offsetWidth; setTimeout(() => needle.classList.add("shake"), 1500);
  };
  const show = (i, spin, fresh) => {
    cur = i; const s = open[i];
    pane.querySelectorAll(".cp-let").forEach(t => t.classList.toggle("now", t.dataset.l === s.dir));
    pane.querySelectorAll(".cp-log [data-i]").forEach(b => b.classList.toggle("cur", +b.dataset.i === i));
    const where = s.dir in D.letters ? (revealed(s.dir) ? `${s.dir} · ${D.letters[s.dir].word}` : U.letterRef.replace("{k}", s.dir)) : (s.label || "");
    card.innerHTML = `${fresh ? `<div class="cp-new">${esc(U.moved)}</div>` : ""}<div class="cp-k">${esc(U.chapter)} ${s.ch} · ${esc(U.points)} ${esc(where)}</div><p>${esc(s.text)}</p>`;
    turn(angleOf(s), spin);
    const p = pane.querySelector("#cpPrev"), n = pane.querySelector("#cpNext");
    if (p) p.disabled = i <= 0; if (n) n.disabled = i >= open.length - 1;
  };

  if (!open.length) { card.innerHTML = `<p>${esc(D.empty)}</p>`; return; }
  // Posición anterior (la de la última visita) y luego, si hay novedades, el giro hasta la nueva
  const last = open.length - 1, before = open.filter(s => s.ch <= seen).length - 1;
  if (before >= 0 && before < last) {
    rot = angleOf(open[before]); needle.style.transition = "none"; needle.style.transform = `rotate(${rot}deg)`; void needle.offsetWidth; needle.style.transition = "";
    setTimeout(() => show(last, angleOf(open[last]) !== angleOf(open[before]), true), 350);
  } else if (before < 0) setTimeout(() => show(last, true, seen === 0 && reached > 0 && open.length > 0), 200);
  else { rot = angleOf(open[last]); needle.style.transition = "none"; show(last, false, false); void needle.offsetWidth; needle.style.transition = ""; }

  const stop = () => { if (timer) { clearInterval(timer); timer = null; const b = pane.querySelector("#cpPlay"); if (b) b.textContent = U.play; } };
  pane.querySelectorAll(".cp-log [data-i]").forEach(b => b.onclick = () => { stop(); show(+b.dataset.i, false, false); });
  const prev = pane.querySelector("#cpPrev"), next = pane.querySelector("#cpNext"), play = pane.querySelector("#cpPlay");
  if (prev) prev.onclick = () => { stop(); if (cur > 0) show(cur - 1, false, false); };
  if (next) next.onclick = () => { stop(); if (cur < open.length - 1) show(cur + 1, false, false); };
  if (play) play.onclick = () => {
    if (timer) return stop();
    play.textContent = U.pause; show(0, true, false); let i = 0;
    timer = setInterval(() => { if (!pane.isConnected) return stop(); if (++i >= open.length) return stop(); show(i, false, false); }, 3200);
  };
}

window.LitmirCompass = {mount};
})();
