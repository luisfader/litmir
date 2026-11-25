/* Музыкальная игра «сыграй мелодию» внутри романа (sec.style "piano-game").
   Данные: novels/<slug>/<file>.json — {title, subtitle, author, tempo, notes:[[midi, начало в долях, длительность]],
   chords:[[бас, [ноты аккорда]]] (по такту, повторяются), chordNames, rounds:[сколько нот в раунде], phraseEnds:[индексы],
   keys:[[midi, "до", "A"]], black:[[midi, индекс белой клавиши слева]], about, ui:{...}}.
   Небо над фьордом: каждая верная нота поднимает столбы сияния (высокие для высоких нот).
   full (необязательно): {audio, sync, duration} — полная запись (mp3 через opt.audioUrl) и тайминг нот для неба/клавиш
   (sync: {melody:[[сек, длит, midi]], glow:[[сек, midi]]}); кнопка «whole» тогда играет запись, а не синтезатор.
   Сохраняется в браузере: lm:piano:<slug> — лучшие звёзды по режимам. */
(function () {
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (s, o) => String(s || "").replace(/\{(\w+)\}/g, (_, k) => o[k] != null ? o[k] : "");

function css() {
  if (document.getElementById("pg-css")) return;
  const st = document.createElement("style"); st.id = "pg-css";
  st.textContent = `
.pg{--pbg:#05141a;--pbg2:#0a2129;--pink:#e8f3f4;--pmute:#8fb0b6;--aur:#63f0b4;--pice:#d9f1f6;--fire:#ff8a4c;--pline:#1d3c45;background:var(--pbg);color:var(--pink);border-radius:18px;padding:16px clamp(10px,3vw,22px) 22px;font-family:var(--sans,system-ui,sans-serif)}
.pg *{box-sizing:border-box;min-width:0}
.pg-head{display:flex;flex-wrap:wrap;align-items:end;justify-content:space-between;gap:10px 18px;margin-bottom:12px}
.pg-head h3{font:700 clamp(24px,4.4vw,34px)/1.1 var(--serif,Georgia,serif);margin:0;color:var(--pink)}
.pg-head h3 i{display:block;font-weight:400;font-size:.5em;color:var(--pmute);margin-top:4px}
.pg-modes{display:flex;gap:4px;background:var(--pbg2);padding:4px;border-radius:999px;border:1px solid var(--pline)}
.pg-modes button{border:0;background:none;color:var(--pmute);font:600 14px var(--sans,sans-serif);padding:9px 15px;border-radius:999px;cursor:pointer;min-height:42px}
.pg-modes button[aria-pressed=true]{background:var(--pice);color:#05141a}
.pg-sky{position:relative;height:clamp(220px,40vh,360px);border-radius:16px;overflow:hidden;background:linear-gradient(#020a10,#08222b 70%,#0d2f38);border:1px solid var(--pline)}
.pg-sky canvas{position:absolute;inset:0;width:100%;height:100%}
.pg-msg{position:absolute;left:0;right:0;top:14px;text-align:center;padding:0 14px;pointer-events:none}
.pg-msg b{display:block;font:700 clamp(19px,3.2vw,26px)/1.15 var(--serif,Georgia,serif)}
.pg-msg span{color:var(--pmute);font-size:14px}
.pg-lives{position:absolute;right:14px;bottom:10px;font-size:19px;letter-spacing:4px;color:var(--pice)}
.pg-lives .off{opacity:.2}
.pg-round{position:absolute;left:14px;bottom:10px;color:var(--pmute);font-size:13px}
.pg-thread{display:flex;flex-wrap:wrap;gap:6px;justify-content:center;margin:14px 0 12px}
.pg-thread i{width:13px;height:13px;border-radius:50%;border:1.5px solid var(--pline);transition:.25s}
.pg-thread i.in{border-color:var(--pmute)}
.pg-thread i.done{background:var(--aur);border-color:var(--aur);box-shadow:0 0 8px var(--aur)}
.pg-thread i.now{background:var(--pice);border-color:var(--pice);transform:scale(1.3)}
.pg-thread i.gap{margin-right:10px}
.pg-kb{position:relative;display:flex;height:clamp(140px,25vh,200px);user-select:none;-webkit-user-select:none;touch-action:manipulation;padding:10px;background:linear-gradient(#0e2b34,#071820);border-radius:14px;border:1px solid var(--pline)}
.pg-w{flex:1;position:relative;margin:0 2px;border-radius:0 0 10px 10px;background:linear-gradient(#f4fbfd,#cfe7ee);border:0;cursor:pointer;display:flex;flex-direction:column;justify-content:end;align-items:center;padding:0 0 8px;color:#2b5561;font:600 13px var(--sans,sans-serif);box-shadow:inset 0 -6px 0 #a9cdd7;transition:background .08s}
.pg-b{position:absolute;top:10px;height:58%;border-radius:0 0 7px 7px;background:linear-gradient(#24434d,#0b1d24);border:0;padding:0;cursor:pointer;z-index:2;box-shadow:inset 0 -4px 0 #000;transition:background .08s}
.pg-w.on{background:linear-gradient(#bff9e1,#63f0b4);box-shadow:inset 0 -2px 0 #3bbf88,0 0 24px #63f0b4}
.pg-b.on{background:linear-gradient(#7fe9c0,#2f9e76)}
.pg-w.hint{box-shadow:inset 0 -6px 0 #a9cdd7,0 0 0 3px var(--fire),0 0 18px var(--fire)}
.pg-w.bad,.pg-b.bad{animation:pgshake .3s}
@keyframes pgshake{25%{transform:translateX(-4px)}75%{transform:translateX(4px)}}
.pg-w kbd{font:500 11px var(--sans,sans-serif);opacity:.55;margin-top:2px;background:none;border:0;padding:0;color:inherit}
.pg-kb.nolabel .pg-w span{visibility:hidden}
.pg-ctrl{display:flex;flex-wrap:wrap;gap:10px;justify-content:center;margin-top:14px}
.pg-btn{min-height:44px;padding:10px 18px;border-radius:999px;border:1px solid var(--pline);background:var(--pbg2);color:var(--pink);font:600 15px var(--sans,sans-serif);cursor:pointer}
.pg-btn.main{background:var(--aur);color:#04201a;border-color:var(--aur)}
.pg-btn[disabled]{opacity:.4;cursor:default}
.pg button:focus-visible{outline:3px solid var(--fire);outline-offset:2px}
.pg-about{color:var(--pmute);font-size:14.5px;max-width:640px;margin:18px auto 0;text-align:center;line-height:1.55}
.pg-about b{color:var(--pink)}
.pg-full{display:flex;align-items:center;gap:10px;margin-top:10px;padding:6px 12px 6px 6px;background:var(--pbg2);border:1px solid var(--pline);border-radius:999px}
.pg-full[hidden]{display:none}
.pg-full button{flex:none;width:40px;height:40px;border-radius:50%;border:0;background:var(--aur);color:#04201a;font:700 15px var(--sans,sans-serif);cursor:pointer}
.pg-full input{flex:1;accent-color:var(--aur);min-height:30px}
.pg-full span{flex:none;color:var(--pmute);font:500 13px var(--sans,sans-serif);font-variant-numeric:tabular-nums}
.pg-best{color:var(--pmute);font-size:13px;text-align:center;margin-top:8px}
@media(max-width:600px){.pg-w kbd{display:none}.pg-w{font-size:11px;margin:0 1px}}
@media(prefers-reduced-motion:reduce){.pg *{animation:none!important;transition:none!important}}`;
  document.head.appendChild(st);
}

function mount(pane, opt) {
  css();
  const D = opt.data, store = opt.store, key = "piano:" + opt.slug, U = D.ui || {};
  const MEL = D.notes, ROUNDS = D.rounds, PH = D.phraseEnds || [], BEAT = 60 / (D.tempo || 100);
  pane.innerHTML = `<div class="pg">
  <div class="pg-head"><h3>${esc(D.title)}<i>${esc(D.subtitle)}</i></h3>
    <div class="pg-modes" role="group"><button data-mode="learn" aria-pressed="true">${esc(U.learn)}</button><button data-mode="master" aria-pressed="false">${esc(U.master)}</button></div></div>
  <div class="pg-sky"><canvas></canvas><div class="pg-msg"><b class="pg-t"></b><span class="pg-s"></span></div><div class="pg-round"></div><div class="pg-lives"></div></div>
  <div class="pg-full" hidden><button data-act="fpause"></button><input type="range" min="0" max="1000" value="0"><span></span></div>
  <div class="pg-thread"></div>
  <div class="pg-kb"></div>
  <div class="pg-ctrl"><button class="pg-btn main" data-act="start">${esc(U.start)}</button><button class="pg-btn" data-act="again" disabled>${esc(U.again)}</button>
    <button class="pg-btn" data-act="labels">${esc(U.hideNames)}</button><button class="pg-btn" data-act="whole">${esc(U.whole)}</button></div>
  <div class="pg-best"></div>
  <p class="pg-about">${D.about}</p></div>`;
  const q = s => pane.querySelector(s), root = q(".pg"), kb = q(".pg-kb"), thread = q(".pg-thread"), cv = q("canvas"), cx = cv.getContext("2d");
  const bStart = q('[data-act=start]'), bAgain = q('[data-act=again]'), bLabels = q('[data-act=labels]'), bWhole = q('[data-act=whole]');
  kb.innerHTML = D.keys.map(([m, n, k]) => `<button class="pg-w" data-m="${m}" aria-label="${esc(n)}"><span>${esc(n)}</span><kbd>${esc(k)}</kbd></button>`).join("") +
    D.black.map(([m]) => `<button class="pg-b" data-m="${m}" aria-label="♯"></button>`).join("");
  const keyEl = m => kb.querySelector(`[data-m="${m}"]`);
  const placeBlack = () => { const ws = kb.querySelectorAll(".pg-w"); D.black.forEach(([m, i]) => { const a = ws[i], el = keyEl(m), w = a.offsetWidth * .6; el.style.width = w + "px"; el.style.left = (a.offsetLeft + a.offsetWidth + 2 - w / 2) + "px"; }); };
  const kro = new ResizeObserver(placeBlack); kro.observe(kb);
  thread.innerHTML = MEL.map((_, i) => `<i class="${PH.includes(i) ? "gap" : ""}"></i>`).join("");
  const lo = Math.min(...MEL.map(x => x[0])), hi = Math.max(...MEL.map(x => x[0])), span = Math.max(hi - lo, 1);

  // звук
  let ac = null, master = null;
  const audio = () => { if (!ac) { ac = new (window.AudioContext || window.webkitAudioContext)(); master = ac.createGain(); master.gain.value = .55; const c = ac.createDynamicsCompressor(); master.connect(c); c.connect(ac.destination); } if (ac.state === "suspended") ac.resume(); return ac; };
  const hz = m => 440 * 2 ** ((m - 69) / 12);
  function piano(m, t, len = 1.2, vol = .5) {
    const g = ac.createGain(), f = ac.createBiquadFilter(); f.type = "lowpass"; f.frequency.value = 2600;
    g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .012); g.gain.exponentialRampToValueAtTime(vol * .35, t + .35); g.gain.exponentialRampToValueAtTime(.0008, t + Math.max(len, .4) + 1);
    [["triangle", 1, 1], ["sine", 2, .3], ["sine", 3, .08]].forEach(([ty, mul, v]) => { const o = ac.createOscillator(), og = ac.createGain(); o.type = ty; o.frequency.value = hz(m) * mul; og.gain.value = v; o.connect(og); og.connect(f); o.start(t); o.stop(t + len + 1.2); });
    f.connect(g); g.connect(master);
  }
  function pad(ms, t, len, vol = .07) { ms.forEach(m => { const o = ac.createOscillator(), g = ac.createGain(); o.type = "sine"; o.frequency.value = hz(m); g.gain.setValueAtTime(0, t); g.gain.linearRampToValueAtTime(vol, t + .4); g.gain.setValueAtTime(vol, t + len - .3); g.gain.linearRampToValueAtTime(0, t + len + .4); o.connect(g); g.connect(master); o.start(t); o.stop(t + len + .5); }); }
  function thud() { const t = ac.currentTime, o = ac.createOscillator(), g = ac.createGain(); o.type = "sawtooth"; o.frequency.setValueAtTime(110, t); o.frequency.exponentialRampToValueAtTime(70, t + .25); g.gain.setValueAtTime(.12, t); g.gain.exponentialRampToValueAtTime(.001, t + .3); o.connect(g); g.connect(master); o.start(t); o.stop(t + .32); }

  // небо
  let W = 0, H = 0; const stars = [], pillars = [];
  const size = () => { const dpr = Math.min(devicePixelRatio || 1, 2); W = cv.clientWidth; H = cv.clientHeight; cv.width = W * dpr; cv.height = H * dpr; cx.setTransform(dpr, 0, 0, dpr, 0, 0); };
  const sro = new ResizeObserver(size); sro.observe(cv); size();
  for (let i = 0; i < 90; i++) stars.push([Math.random(), Math.random() * .6, Math.random() * 1.3 + .3, Math.random() * 6]);
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;
  function burst(m, strong = 1) { const r = Math.min(1, Math.max(0, (m - lo) / span)), h = .25 + .7 * r, c = .15 + .7 * r + (Math.random() - .5) * .15;
    for (let i = 0; i < 5; i++) pillars.push({ x: c + (i - 2.5) * .035 + (Math.random() - .5) * .02, h: h * (.75 + Math.random() * .3), a: strong, w: 10 + Math.random() * 16, v: Math.random() < .25 }); }
  function frame(ts) {
    if (!pane.isConnected || !root.isConnected) { kro.disconnect(); sro.disconnect(); clearT(); removeEventListener("keydown", onKey); if (full) full.el.pause(); return; }
    if (full && full.on && !full.el.paused) fullTick();
    cx.clearRect(0, 0, W, H);
    stars.forEach(([x, y, r, p]) => { cx.globalAlpha = .4 + .4 * Math.sin(ts / 900 + p); cx.fillStyle = "#e8f3f4"; cx.beginPath(); cx.arc(x * W, y * H, r, 0, 7); cx.fill(); });
    cx.globalAlpha = 1; const base = H * .78;
    const amb = cx.createLinearGradient(0, base - H * .5, 0, base); amb.addColorStop(0, "rgba(99,240,180,0)"); amb.addColorStop(1, "rgba(99,240,180,.08)"); cx.fillStyle = amb; cx.fillRect(0, base - H * .5, W, H * .5);
    cx.globalCompositeOperation = "lighter";
    for (let i = pillars.length - 1; i >= 0; i--) { const p = pillars[i], top = base - p.h * (base - 10), g = cx.createLinearGradient(0, top, 0, base), col = p.v ? "169,140,255" : "99,240,180";
      g.addColorStop(0, `rgba(${col},0)`); g.addColorStop(.35, `rgba(${col},${.35 * p.a})`); g.addColorStop(1, `rgba(${col},${.7 * p.a})`);
      cx.fillStyle = g; const sway = reduce ? 0 : Math.sin(ts / 700 + i) * 3; cx.fillRect(p.x * W - p.w / 2 + sway, top, p.w, base - top); p.a *= reduce ? .9 : .975; if (p.a < .02) pillars.splice(i, 1); }
    cx.globalCompositeOperation = "source-over";
    cx.fillStyle = "#04121a"; cx.beginPath(); cx.moveTo(0, H); cx.lineTo(0, base - 10);
    [[.08, -40], [.18, -12], [.27, -55], [.36, -8], [.62, -6], [.72, -48], [.82, -20], [.92, -62], [1, -25]].forEach(([x, y]) => cx.lineTo(x * W, base + y)); cx.lineTo(W, H); cx.fill();
    const px = W * .5; cx.fillStyle = "#bfe6ef"; cx.globalAlpha = .85; cx.beginPath(); cx.moveTo(px - 46, base);
    [[-46, -18], [-38, -34], [-30, -18], [-18, -18], [-12, -48], [-6, -26], [0, -70], [6, -26], [12, -48], [18, -18], [30, -18], [38, -34], [46, -18], [46, 0]].forEach(([x, y]) => cx.lineTo(px + x, base + y)); cx.fill();
    cx.globalAlpha = 1; cx.fillStyle = "#ffd27a"; [[-4, -16], [10, -12], [-20, -8]].forEach(([x, y]) => cx.fillRect(px + x, base + y, 3, 5));
    const wg = cx.createLinearGradient(0, base, 0, H); wg.addColorStop(0, "#0b2a33"); wg.addColorStop(1, "#05141a"); cx.fillStyle = wg; cx.fillRect(0, base, W, H - base);
    cx.globalAlpha = .25; cx.fillStyle = "#63f0b4"; pillars.forEach(p => cx.fillRect(p.x * W - p.w / 2, base + 3, p.w, p.h * (base - 10) * .25 * p.a)); cx.globalAlpha = 1;
    requestAnimationFrame(frame);
  }
  requestAnimationFrame(frame);

  // игра
  let mode = "learn", round = 0, pos = 0, state = "idle", lives = 3, errors = 0, timers = [];
  const best = store.get(key, {});
  const setMsg = (t, s) => { q(".pg-t").textContent = t; q(".pg-s").textContent = s; };
  const showBest = () => { const b = best[mode]; q(".pg-best").textContent = b ? fmt(U.best, { stars: "★".repeat(b) + "☆".repeat(3 - b) }) : ""; };
  function drawStatus() { const n = ROUNDS[round] || MEL.length;
    [...thread.children].forEach((d, i) => { d.className = (PH.includes(i) ? "gap " : "") + (state === "done" || (i < pos && state === "play") ? "done" : i === pos && state === "play" ? "now" : i < n && state !== "idle" ? "in" : ""); });
    q(".pg-round").textContent = state === "idle" ? "" : state === "done" ? U.played : fmt(U.round, { n: round + 1, total: ROUNDS.length });
    q(".pg-lives").innerHTML = mode === "master" && state !== "idle" ? [0, 1, 2].map(i => `<span class="${i < lives ? "" : "off"}">❄</span>`).join("") : ""; }
  function clearT() { timers.forEach(clearTimeout); timers = []; kb.querySelectorAll(".on").forEach(e => e.classList.remove("on")); }
  function flash(m, ms) { const e = keyEl(m); if (!e) return; e.classList.add("on"); timers.push(setTimeout(() => e.classList.remove("on"), ms)); }
  function playNotes(list, withChords, done) { audio(); clearT(); const t0 = ac.currentTime + .15, s0 = list[0][1]; let end = 0;
    list.forEach(([m, t, l]) => { const at = (t - s0) * BEAT; piano(m, t0 + at, l * BEAT); timers.push(setTimeout(() => { flash(m, Math.max(l * BEAT * 1000 - 60, 180)); burst(m, .9); }, at * 1000 + 150)); end = Math.max(end, at + l * BEAT); });
    if (withChords) { const bars = Math.ceil(end / (4 * BEAT)); for (let b = 0; b < bars; b++) { const [bass, ch] = D.chords[b % D.chords.length]; pad(ch, t0 + b * 4 * BEAT, 4 * BEAT); piano(bass, t0 + b * 4 * BEAT, 4 * BEAT, .25); } }
    timers.push(setTimeout(done, end * 1000 + 350)); }
  function listen() { state = "listen"; pos = 0; lives = 3; drawStatus(); bAgain.disabled = true; kb.querySelectorAll(".hint").forEach(e => e.classList.remove("hint"));
    setMsg(U.listen, fmt(U.listenSub, { n: ROUNDS[round] }));
    playNotes(MEL.slice(0, ROUNDS[round]), false, () => { state = "play"; drawStatus(); bAgain.disabled = false; setMsg(U.yourTurn, U.yourTurnSub); }); }
  function start() { if (full && full.on) stopFull(false); audio(); clearT(); round = 0; lives = 3; errors = 0; bStart.textContent = U.restart; listen(); }
  function win() { state = "done"; drawStatus(); bAgain.disabled = true;
    const s = errors === 0 ? 3 : errors <= 4 ? 2 : 1; setMsg(U.won, fmt(U.wonSub, { stars: "★".repeat(s) + "☆".repeat(3 - s), errors }));
    if (s > (best[mode] || 0)) { best[mode] = s; store.set(key, best); } showBest();
    timers.push(setTimeout(() => playNotes(MEL, true, () => {}), 900)); }
  function press(m) { audio(); const e = keyEl(m); if (e) { e.classList.add("on"); setTimeout(() => e.classList.remove("on"), 220); }
    if (state !== "play") { if (state !== "listen") { piano(m, ac.currentTime, .8); burst(m, .6); } return; }
    const want = MEL[pos][0];
    if (m === want) { piano(m, ac.currentTime, 1); burst(m, 1); kb.querySelectorAll(".hint").forEach(x => x.classList.remove("hint")); pos++; drawStatus();
      if (pos >= ROUNDS[round]) { state = "wait"; bAgain.disabled = true; round++;
        if (round >= ROUNDS.length) return win();
        const ph = PH.includes(pos - 1); setMsg(ph ? U.phrase : U.right, ph ? U.phraseSub : U.rightSub);
        timers.push(setTimeout(listen, 1300)); }
    } else { thud(); errors++; if (e) { e.classList.add("bad"); setTimeout(() => e.classList.remove("bad"), 320); }
      if (mode === "learn") { keyEl(want).classList.add("hint"); setMsg(U.almost, U.almostSub); }
      else { lives--; drawStatus();
        if (lives <= 0) { state = "wait"; setMsg(U.melted, U.meltedSub); timers.push(setTimeout(listen, 1600)); }
        else setMsg(U.miss, fmt(U.missSub, { n: lives })); } } }

  kb.addEventListener("pointerdown", e => { const k = e.target.closest("[data-m]"); if (!k) return; e.preventDefault(); press(+k.dataset.m); });
  kb.addEventListener("keydown", e => { if ((e.key === "Enter" || e.key === " ") && e.target.dataset.m) { e.preventDefault(); press(+e.target.dataset.m); } });
  const map = {}; D.keys.forEach(([m, , k]) => map[k.toLowerCase()] = m);
  function onKey(e) { if (e.repeat || e.metaKey || e.ctrlKey || e.altKey) return; const t = e.target; if (t && (t.tagName === "INPUT" || t.tagName === "TEXTAREA")) return;
    if (!root.getBoundingClientRect().height) return;
    const m = map[(e.code || "").replace("Key", "").toLowerCase()] || map[(e.key || "").toLowerCase()]; if (m) { e.preventDefault(); press(m); } }
  addEventListener("keydown", onKey);
  bStart.onclick = start;
  bAgain.onclick = () => { if (state === "play") listen(); };
  // полная запись (D.full)
  const F = D.full && opt.audioUrl ? D.full : null, fbar = q(".pg-full"), fbtn = q('[data-act=fpause]'), fseek = q(".pg-full input"), ftime = q(".pg-full span");
  let full = null, sync = null;
  const mmss = t => Math.floor(t / 60) + ":" + String(Math.floor(t % 60)).padStart(2, "0");
  const fdur = () => (full && isFinite(full.el.duration) && full.el.duration) || F.duration || 1;
  const firstAfter = (arr, t) => { let a = 0, b = arr.length; while (a < b) { const c = (a + b) >> 1; if (arr[c][0] < t) a = c + 1; else b = c; } return a; };
  function fullSeekIdx() { if (!sync) return; const t = full.el.currentTime; full.i = firstAfter(sync.melody, t); full.j = firstAfter(sync.glow, t); }
  function fullUI() { if (!full) return; const t = full.el.currentTime, d = fdur(); if (!full.drag) fseek.value = Math.round(t / d * 1000);
    ftime.textContent = mmss(t) + " / " + mmss(d); fbtn.textContent = full.el.paused ? "▶" : "❚❚"; fbtn.setAttribute("aria-label", full.el.paused ? U.fullPlay : U.fullPause); }
  function fullTick() { const t = full.el.currentTime; fullUI(); if (!sync) return;
    const M = sync.melody, G = sync.glow;
    if (full.i < M.length && t - M[full.i][0] > 1) fullSeekIdx();
    while (full.i < M.length && M[full.i][0] <= t) { const [, l, m] = M[full.i++]; const e = keyEl(m);
      if (e) { e.classList.add("on"); timers.push(setTimeout(() => e.classList.remove("on"), Math.max(l * 1000 - 60, 160))); } burst(m, .9); }
    while (full.j < G.length && G[full.j][0] <= t) burst(G[full.j++][1], .35); }
  function stopFull(restore = true) { if (!full || !full.on) return; full.on = false; full.el.pause(); fbar.hidden = true; bWhole.textContent = U.whole; clearT();
    if (restore) { state = full.was; bAgain.disabled = state !== "play"; if (state === "play") setMsg(U.yourTurn, U.resume); else if (state === "idle") setMsg(U.introTitle, U.introSub); } }
  function startFull() { audio(); clearT();
    if (!full) { full = { el: new Audio(opt.audioUrl(F.audio)), i: 0, j: 0, on: false, drag: false };
      full.el.preload = "auto";
      full.el.addEventListener("ended", () => stopFull());
      full.el.addEventListener("loadedmetadata", fullUI);
      full.el.addEventListener("pause", fullUI); full.el.addEventListener("play", () => { fullSeekIdx(); fullUI(); });
      if (F.sync) fetch(F.sync).then(r => r.json()).then(j => { sync = j; fullSeekIdx(); }).catch(() => {}); }
    full.was = state; full.on = true; state = "wait"; bAgain.disabled = true; full.el.currentTime = 0; full.i = full.j = 0;
    fbar.hidden = false; bWhole.textContent = U.wholeStop; setMsg(U.fullTitle, U.fullSub); fullUI();
    full.el.play().catch(() => { stopFull(false); state = full.was; setMsg(D.title, U.fullError); synthWhole(full.was); }); }
  fbtn.onclick = () => { if (!full) return; if (full.el.paused) full.el.play().catch(() => {}); else full.el.pause(); };
  fseek.addEventListener("input", () => { if (!full) return; full.drag = true; const t = fseek.value / 1000 * fdur(); ftime.textContent = mmss(t) + " / " + mmss(fdur()); });
  fseek.addEventListener("change", () => { if (!full) return; full.drag = false; full.el.currentTime = fseek.value / 1000 * fdur(); clearT(); fullSeekIdx(); fullUI(); });
  function synthWhole(was) { state = "wait"; bAgain.disabled = true;
    playNotes(MEL, true, () => { state = was; bAgain.disabled = was !== "play"; if (was === "play") setMsg(U.yourTurn, U.resume); }); }
  bWhole.onclick = () => { if (full && full.on) return stopFull(); if (state === "listen" || state === "wait") return; if (F) return startFull(); const was = state; state = "wait"; bAgain.disabled = true; setMsg(D.title, D.author);
    playNotes(MEL, true, () => { state = was; bAgain.disabled = was !== "play"; if (was === "play") setMsg(U.yourTurn, U.resume); }); };
  bLabels.onclick = () => { const off = kb.classList.toggle("nolabel"); bLabels.textContent = off ? U.showNames : U.hideNames; };
  function setMode(m) { if (full && full.on) stopFull(false); mode = m; pane.querySelectorAll(".pg-modes button").forEach(b => b.setAttribute("aria-pressed", b.dataset.mode === m)); clearT();
    state = "idle"; round = 0; pos = 0; lives = 3; bStart.textContent = U.start; bAgain.disabled = true;
    setMsg(m === "learn" ? U.learnTitle : U.masterTitle, m === "learn" ? U.learnSub : U.masterSub);
    kb.classList.toggle("nolabel", m === "master"); bLabels.textContent = m === "master" ? U.showNames : U.hideNames; drawStatus(); showBest(); }
  pane.querySelectorAll(".pg-modes button").forEach(b => b.onclick = () => setMode(b.dataset.mode));
  setMsg(U.introTitle, U.introSub); drawStatus(); showBest();
}
window.LitmirPiano = { mount };
})();
