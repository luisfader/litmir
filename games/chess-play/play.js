/* Партия с компьютером внутри романа (sec.style "chess-play").
   Данные: novels/<slug>/<file>.json — {title, intro, levels:[{id, name, about, engine, quote, win, loss}], ui:{...}}.
   Движок: games/chess-engine.js (в Web Worker, если можно; иначе в основном потоке).
   Доска в духе Lichess: цвета brown, фигуры cburnett (games/chess-play/pieces, GPLv2+), анимация ходов,
   перетаскивание, точки и уголки целей, стрелка подсказки, взятые фигуры и перевес, звук ходов.
   Сохраняется в браузере: lm:cplay:<slug> (партия), lm:cplayW:<slug> (победы по уровням), lm:cplaySnd (звук). */
(function () {
"use strict";
const PDIR = "games/chess-play/pieces/";
const TL = { 1: "P", 2: "N", 3: "B", 4: "R", 5: "Q", 6: "K" };
const VAL = { 1: 1, 2: 3, 3: 3, 4: 5, 5: 9, 6: 0 };
const ANIM = 220;
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));

function loadEngine() {
  if (window.Chess) return Promise.resolve();
  return new Promise((ok, fail) => { const s = document.createElement("script"); s.src = "games/chess-engine.js"; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
}

function css() {
  if (document.getElementById("cpl-css")) return;
  const st = document.createElement("style"); st.id = "cpl-css";
  const pc = []; for (const c of "wb") for (const t of "PNBRQK") pc.push(`.cpl .${c}${t}{background-image:url("${PDIR}${c}${t}.svg")}`);
  st.textContent = pc.join("") + `
.cpl{font-family:var(--sans);--light:#f0d9b5;--dark:#b58863;--lm:rgba(155,199,0,.41);--selc:rgba(20,85,30,.5);--dest:rgba(20,85,30,.5)}
.cpl h3{font:400 22px var(--serif);color:var(--ink);margin:2px 0 8px}
.cpl .cpl-p{color:var(--muted);margin:0 0 16px;font-size:15px;line-height:1.5}
.cpl-lbl{font:600 12px var(--sans);color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:14px 0 8px}
.cpl-seg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.cpl-seg button{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:12px;padding:11px 13px;text-align:left;cursor:pointer;font:inherit;transition:transform .12s,box-shadow .12s}
.cpl-seg button:active{transform:scale(.98)}
.cpl-seg button[aria-pressed="true"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent) inset}
.cpl-seg b{display:flex;align-items:center;gap:8px;font:600 15px var(--sans)}.cpl-seg small{display:block;font:12.5px/1.35 var(--sans);color:var(--muted);margin-top:3px}
.cpl-seg .cpl-w{float:right;font:600 12px var(--sans);color:var(--accent)}
.cpl-seg i.cpl-ic{display:inline-block;width:28px;height:28px;background-size:contain;background-repeat:no-repeat;flex:none}
.cpl-go{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0 6px}
.cpl-btn{border:1px solid var(--accent);background:var(--accent);color:#fff;border-radius:30px;padding:11px 22px;font:600 15px var(--sans);cursor:pointer}
:root[data-theme="dark"] .cpl-btn{color:#1d1914}
@media (prefers-color-scheme: dark){:root:not([data-theme]) .cpl-btn{color:#1d1914}}
.cpl-btn.alt{background:transparent;color:var(--accent)}
.cpl-quote{font:italic 15px/1.45 var(--serif);color:var(--ink);border-left:3px solid var(--accent);padding:2px 0 2px 12px;margin:14px 0 4px}
.cpl-game{max-width:460px;margin:0 auto}
.cpl-pl{display:flex;align-items:center;gap:10px;min-height:38px;padding:4px 2px;font-size:14.5px;color:var(--ink)}
.cpl-pl .cpl-av{width:30px;height:30px;border-radius:8px;background:var(--bg);display:grid;place-items:center;font-size:17px;flex:none;box-shadow:inset 0 0 0 1px var(--line)}
.cpl-pl .cpl-nm{font-weight:600;white-space:nowrap}
.cpl-pl .cpl-nm small{font-weight:400;color:var(--muted);margin-left:5px}
.cpl-pl .cpl-cap{display:flex;align-items:center;flex-wrap:wrap;min-width:0;flex:1}
.cpl-pl .cpl-cap i{width:19px;height:19px;background-size:contain;background-repeat:no-repeat;opacity:.85}
.cpl-pl .cpl-cap i+i.same{margin-left:-11px}.cpl-pl .cpl-cap i+i:not(.same){margin-left:3px}
.cpl-pl .cpl-adv{font:600 12.5px var(--sans);color:var(--muted);margin-left:5px}
.cpl-pl .cpl-turn{width:9px;height:9px;border-radius:50%;background:transparent;flex:none;transition:background .2s}
.cpl-pl.on .cpl-turn{background:#629924;box-shadow:0 0 0 3px rgba(98,153,36,.25)}
.cpl-pl.think .cpl-turn{animation:cplp 1s infinite ease-in-out}
@keyframes cplp{50%{opacity:.3;transform:scale(.7)}}
.cpl-board{position:relative;width:100%;aspect-ratio:1;border-radius:4px;overflow:hidden;box-shadow:0 2px 3px rgba(0,0,0,.25),0 8px 24px rgba(0,0,0,.18);user-select:none;-webkit-user-select:none;touch-action:none;-webkit-tap-highlight-color:transparent;cursor:pointer}
.cpl-sqs{position:absolute;inset:0;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr)}
.cpl-s{position:relative;background:var(--light)}
.cpl-s.d{background:var(--dark)}
.cpl-s.lm::before,.cpl-s.sel::before,.cpl-s.hov::before{content:"";position:absolute;inset:0}
.cpl-s.lm::before{background:var(--lm)}
.cpl-s.sel::before{background:var(--selc)}
.cpl-s.hov::before{background:rgba(20,85,30,.3)}
.cpl-s.hint::before{content:"";position:absolute;inset:0;background:rgba(21,120,180,.25)}
.cpl-s.chk{background-image:radial-gradient(ellipse at center,rgb(255,0,0) 0%,rgb(231,0,0) 25%,rgba(169,0,0,0) 89%,rgba(158,0,0,0) 100%)}
.cpl-s.dest::after{content:"";position:absolute;inset:0;background:radial-gradient(var(--dest) 19%,rgba(0,0,0,0) 20%)}
.cpl-s.oc::after{content:"";position:absolute;inset:0;background:radial-gradient(transparent 0%,transparent 79%,rgba(20,85,0,.3) 80%)}
.cpl-s.dest.hov::after,.cpl-s.oc.hov::after{background:none}
.cpl-co{position:absolute;font:700 10px/1 var(--sans);pointer-events:none;z-index:1}
.cpl-co.f{left:3px;bottom:2px}.cpl-co.r{right:3px;top:3px}
.cpl-s.d .cpl-co{color:var(--light)}.cpl-s:not(.d) .cpl-co{color:var(--dark)}
.cpl-pcs{position:absolute;inset:0;pointer-events:none}
.cpl-pc{position:absolute;left:0;top:0;width:12.5%;height:12.5%;background-size:cover;will-change:transform;transition:transform ${ANIM}ms cubic-bezier(.25,.8,.35,1),opacity ${ANIM}ms;z-index:2}
.cpl-pc.anim{z-index:4}
.cpl-pc.drag{transition:none;z-index:9;filter:drop-shadow(0 6px 6px rgba(0,0,0,.35))}
.cpl-pc.snap{transition:none}
.cpl-pc.gone{opacity:0;z-index:1}
.cpl-pc.born{opacity:0}
.cpl-arrow{position:absolute;inset:0;width:100%;height:100%;pointer-events:none;z-index:6}
.cpl-promo{position:absolute;inset:0;background:rgba(250,250,250,.55);z-index:10;backdrop-filter:blur(1px)}
.cpl-promo button{position:absolute;width:12.5%;height:12.5%;border:0;padding:0;border-radius:50%;background:#b0b0b0 center/80% no-repeat;cursor:pointer;transition:border-radius .15s,background-color .15s,background-size .15s;box-shadow:0 2px 6px rgba(0,0,0,.3)}
.cpl-promo button:hover{border-radius:0;background-color:#d64f00;background-size:100%}
.cpl-msg{min-height:22px;text-align:center;margin:6px 0 0;font-size:14.5px;color:var(--ink)}
.cpl-bar{display:flex;flex-wrap:wrap;justify-content:center;gap:6px;margin:10px 0 6px}
.cpl-bar button{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:20px;padding:8px 13px;font:14px var(--sans);cursor:pointer;transition:transform .1s}
.cpl-bar button:active:not(:disabled){transform:scale(.95)}
.cpl-bar button:disabled{opacity:.4;cursor:default}
.cpl-moves{display:grid;grid-template-columns:2.6em 1fr 1fr;font:14px/1.2 var(--sans);max-height:132px;overflow:auto;border:1px solid var(--line);border-radius:10px;background:var(--paper);margin-top:6px}
.cpl-moves:empty{display:none}
.cpl-moves .n{background:var(--bg);color:var(--muted);text-align:center;padding:6px 0}
.cpl-moves .m{padding:6px 10px;color:var(--ink)}
.cpl-moves .m.cur{background:rgba(98,153,36,.22);font-weight:600}
.cpl-moves .res{grid-column:1/-1;text-align:center;padding:7px;font-weight:600;color:var(--ink);background:var(--bg)}
.cpl-end{text-align:center;padding:14px;border-radius:14px;background:var(--bg);margin:10px 0 0;animation:cplin .35s ease-out}
.cpl-end h4{font:400 22px var(--serif);margin:4px 0}.cpl-end p{margin:4px 0 10px;color:var(--muted)}
@keyframes cplin{from{opacity:0;transform:translateY(8px)}}
@media (prefers-reduced-motion: reduce){.cpl-pc{transition:none}}
`;
  document.head.appendChild(st);
}

/* --- Sound: a short wooden "tock", synthesized (no audio files) --- */
let AC = null;
function tock(kind) {
  try {
    AC = AC || new (window.AudioContext || window.webkitAudioContext)();
    if (AC.state === "suspended") AC.resume();
    const t = AC.currentTime, len = kind === "cap" ? .16 : .09;
    const buf = AC.createBuffer(1, Math.floor(AC.sampleRate * len), AC.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, kind === "cap" ? 3 : 6);
    const src = AC.createBufferSource(); src.buffer = buf;
    const bp = AC.createBiquadFilter(); bp.type = "bandpass"; bp.frequency.value = kind === "cap" ? 900 : kind === "chk" ? 1500 : 1150; bp.Q.value = 3.5;
    const g = AC.createGain(); g.gain.setValueAtTime(kind === "cap" ? 1.5 : 1.1, t);
    src.connect(bp).connect(g).connect(AC.destination); src.start(t);
    if (kind === "end") { const o = AC.createOscillator(), og = AC.createGain(); o.frequency.value = 523; o.frequency.setValueAtTime(659, t + .12); og.gain.setValueAtTime(.08, t); og.gain.exponentialRampToValueAtTime(.001, t + .5); o.connect(og).connect(AC.destination); o.start(t); o.stop(t + .5); }
  } catch (e) {}
}

function mount(pane, opts) {
  const D = opts.data, slug = opts.slug, store = opts.store, U = D.ui || {};
  const LV = D.levels || [];
  const KEY = "cplay:" + slug, WKEY = "cplayW:" + slug;
  let C, worker = null, reqId = 0, thinking = false, pending = null;
  let G = store.get(KEY, null); // {level, color: "w"|"b", moves: [uci], over}
  let pos, sel = -1, hintMv = null, sound = store.get("cplaySnd", true) !== false;
  let cfg = { level: (G && G.level) || (LV[0] && LV[0].id), color: (G && G.color) || "w" };
  let R = null; // game DOM refs
  let els = {}, prevB = null; // piece elements by square, previous board

  css();
  pane.innerHTML = `<div class="loading">…</div>`;
  loadEngine().then(() => {
    C = window.Chess;
    try { worker = new Worker("games/chess-engine.js"); worker.onmessage = e => onEngine(e.data); worker.onerror = () => { worker = null; }; } catch (e) { worker = null; }
    if (!pane.isConnected) return stop();
    if (G && G.moves && !G.over) play(); else setup();
  }, () => { pane.innerHTML = `<p class="cpl-p">${esc(U.noEngine || "—")}</p>`; });

  function stop() { if (worker) { worker.terminate(); worker = null; } }
  const alive = () => { if (!pane.isConnected) { stop(); return false; } return true; };
  const lvl = id => LV.find(l => l.id === id) || LV[0];
  const wins = () => store.get(WKEY, {}) || {};
  const save = () => store.set(KEY, G);
  const snd = k => { if (sound) tock(k); };

  /* ---------- Setup screen ---------- */
  function setup() {
    if (!alive()) return;
    R = null; els = {}; prevB = null;
    const W = wins();
    const colors = [["w", U.white, `<i class="cpl-ic wK"></i>`], ["b", U.black, `<i class="cpl-ic bK"></i>`], ["r", U.random, `<i class="cpl-ic" style="background:url('${PDIR}wK.svg') 0 0/28px no-repeat;clip-path:inset(0 50% 0 0)"></i><i class="cpl-ic" style="margin-left:-36px;background:url('${PDIR}bK.svg') 0 0/28px no-repeat;clip-path:inset(0 0 0 50%)"></i>`]];
    pane.innerHTML = `<div class="cpl">
      <h3>${esc(D.title)}</h3><p class="cpl-p">${esc(D.intro || "")}</p>
      <p class="cpl-lbl">${esc(U.level)}</p>
      <div class="cpl-seg" data-g="level">${LV.map(l => `<button type="button" data-v="${esc(l.id)}" aria-pressed="${l.id === cfg.level}">${W[l.id] ? `<span class="cpl-w">🏆 ${W[l.id]}</span>` : ""}<b>${esc(l.name)}</b><small>${esc(l.about)}</small></button>`).join("")}</div>
      <p class="cpl-lbl">${esc(U.color)}</p>
      <div class="cpl-seg" data-g="color">${colors.map(c => `<button type="button" data-v="${c[0]}" aria-pressed="${c[0] === cfg.color}"><b>${c[2]} ${esc(c[1])}</b></button>`).join("")}</div>
      <p class="cpl-quote"></p>
      <div class="cpl-go"><button type="button" class="cpl-btn cpl-start">${esc(U.start)}</button></div></div>`;
    const quote = () => { pane.querySelector(".cpl-quote").textContent = lvl(cfg.level).quote || ""; };
    pane.querySelectorAll(".cpl-seg").forEach(g => g.querySelectorAll("button").forEach(b => b.onclick = () => {
      cfg[g.dataset.g] = b.dataset.v;
      g.querySelectorAll("button").forEach(x => x.setAttribute("aria-pressed", x === b));
      quote();
    }));
    quote();
    pane.querySelector(".cpl-start").onclick = () => {
      const color = cfg.color === "r" ? (Math.random() < .5 ? "w" : "b") : cfg.color;
      G = { level: cfg.level, color, moves: [], over: null };
      save(); play();
    };
  }

  /* ---------- Geometry ---------- */
  const flip = () => G.color === "b";
  const me = () => G.color === "w" ? 0 : C.BLACK;
  const myTurn = () => pos.side === me();
  const colOf = s => flip() ? 7 - (s & 7) : (s & 7);
  const rowOf = s => flip() ? (s >> 4) : 7 - (s >> 4);
  const sqOf = (col, row) => { const f = flip() ? 7 - col : col, r = flip() ? row : 7 - row; return r * 16 + f; };
  const xf = s => `translate(${colOf(s) * 100}%,${rowOf(s) * 100}%)`;
  const pcls = p => (p & C.BLACK ? "b" : "w") + TL[p & 7];
  const board64 = () => { const a = []; for (let s = 0; s < 128; s++) { if (s & 0x88) { s += 7; continue; } a.push(s); } return a; };
  const SQ = [];

  /* ---------- Game ---------- */
  function play() {
    pos = C.fromMoves(G.moves);
    sel = -1; hintMv = null; els = {}; prevB = null;
    shell(); syncPieces(null); paint(); ui();
    if (!G.over && !myTurn()) think();
  }

  function shell() {
    if (!alive()) return;
    if (!SQ.length) SQ.push(...board64());
    let sq = "";
    for (let row = 0; row < 8; row++) for (let col = 0; col < 8; col++) {
      const s = sqOf(col, row), f = s & 7, r = s >> 4;
      sq += `<div class="cpl-s${(f + r) % 2 === 0 ? " d" : ""}" data-s="${s}">`
        + (row === 7 ? `<span class="cpl-co f">${"abcdefgh"[f]}</span>` : "") + (col === 7 ? `<span class="cpl-co r">${r + 1}</span>` : "") + `</div>`;
    }
    const L = lvl(G.level);
    pane.innerHTML = `<div class="cpl"><div class="cpl-game">
      <div class="cpl-pl" data-p="ai"><span class="cpl-av">🤖</span><span class="cpl-nm">${esc(U.computer || "Компьютер")}<small>${esc(L.name)}</small></span><span class="cpl-cap"></span><span class="cpl-turn"></span></div>
      <div class="cpl-board"><div class="cpl-sqs">${sq}</div><div class="cpl-pcs"></div>
        <svg class="cpl-arrow" viewBox="0 0 8 8"><defs><marker id="cpl-ah" markerWidth="4" markerHeight="4" refX="2.05" refY="2" orient="auto"><path d="M0,0 V4 L3,2 Z" fill="rgba(21,120,27,.85)"/></marker></defs><line/></svg></div>
      <div class="cpl-pl" data-p="me"><span class="cpl-av">${G.color === "w" ? "♔" : "♚"}</span><span class="cpl-nm">${esc(U.you || "Ты")}</span><span class="cpl-cap"></span><span class="cpl-turn"></span></div>
      <div class="cpl-msg"></div><div class="cpl-endbox"></div>
      <div class="cpl-bar">
        <button type="button" data-a="undo">↶ ${esc(U.undo)}</button>
        <button type="button" data-a="hint">💡 ${esc(U.hint)}</button>
        <button type="button" data-a="resign">🏳 ${esc(U.resign)}</button>
        <button type="button" data-a="new">↻ ${esc(U.newGame)}</button>
        <button type="button" data-a="snd" aria-label="${esc(U.sound || "Звук")}">${sound ? "🔊" : "🔇"}</button>
      </div>
      <div class="cpl-moves"></div></div></div>`;
    const q = s => pane.querySelector(s);
    R = { board: q(".cpl-board"), pcs: q(".cpl-pcs"), arrow: q(".cpl-arrow line"), svg: q(".cpl-arrow"), msg: q(".cpl-msg"), end: q(".cpl-endbox"), moves: q(".cpl-moves"),
      ai: q('[data-p="ai"]'), me: q('[data-p="me"]'), sq: {} };
    pane.querySelectorAll(".cpl-s").forEach(e => R.sq[e.dataset.s] = e);
    pane.querySelectorAll("[data-a]").forEach(b => b.onclick = () => action(b.dataset.a));
    R.board.addEventListener("pointerdown", down);
  }

  /* Move piece elements from the previous board to the current one; matching by piece code, preferring the move's own squares. */
  function syncPieces(mv) {
    const nb = pos.b, old = prevB, pool = Object.assign({}, els), next = {};
    const anim = !!old;
    const claimed = new Set();
    // unchanged squares keep their element
    for (const s of SQ) if (old && old[s] && old[s] === nb[s] && pool[s]) { next[s] = pool[s]; delete pool[s]; claimed.add(s); }
    const arrivals = SQ.filter(s => nb[s] && !next[s]);
    const vacated = old ? SQ.filter(s => old[s] && !claimed.has(s) && pool[s]) : [];
    const take = (from, to) => { const e = pool[from]; delete pool[from]; vacated.splice(vacated.indexOf(from), 1); next[to] = e; return e; };
    // the move itself first (handles promotion where the code changes)
    if (mv && old) {
      const f = C.from(mv), t = C.to(mv);
      if (nb[t] && pool[f] && vacated.includes(f) && arrivals.includes(t)) { const e = take(f, t); move(e, t, nb[t]); arrivals.splice(arrivals.indexOf(t), 1); }
    }
    for (const t of arrivals.slice()) {
      // nearest vacated square holding the same piece
      let best = -1, bd = 99;
      for (const f of vacated) if (old[f] === nb[t] && f !== t) { const d = Math.abs((f & 7) - (t & 7)) + Math.abs((f >> 4) - (t >> 4)); if (d < bd) { bd = d; best = f; } }
      if (best >= 0) { move(take(best, t), t, nb[t]); arrivals.splice(arrivals.indexOf(t), 1); }
    }
    // leftovers: captured pieces fade out, new ones fade in
    for (const s in pool) { const e = pool[s]; if (anim) { e.classList.add("gone"); setTimeout(() => e.remove(), ANIM + 30); } else e.remove(); }
    for (const t of arrivals) {
      const e = document.createElement("div"); e.className = "cpl-pc " + pcls(nb[t]); e.style.transform = xf(t);
      if (anim) { e.classList.add("born"); requestAnimationFrame(() => requestAnimationFrame(() => e.classList.remove("born"))); }
      R.pcs.appendChild(e); next[t] = e;
    }
    els = next; prevB = Array.from(nb);
    function move(e, t, p) {
      e.className = "cpl-pc " + pcls(p) + (anim && !e.classList.contains("snap") ? " anim" : "") + (e.classList.contains("snap") ? " snap" : "");
      e.style.transform = xf(t);
      setTimeout(() => e.classList.remove("anim", "snap"), ANIM + 30);
    }
  }

  function kingSq(side) { for (const s of SQ) { const p = pos.b[s]; if ((p & 7) === C.K && (p & C.BLACK) === side) return s; } return -1; }
  function lastMove() { const u = G.moves[G.moves.length - 1]; return u ? [C.nameSq(u.slice(0, 2)), C.nameSq(u.slice(2, 4))] : []; }

  function paint(hover) {
    if (!R) return;
    const legal = sel >= 0 && !G.over ? C.legal(pos).filter(m => C.from(m) === sel) : [];
    const dests = new Set(legal.map(m => C.to(m)));
    const lm = lastMove(), chk = C.inCheck(pos) ? kingSq(pos.side) : -1;
    for (const s of SQ) {
      const e = R.sq[s], c = e.classList;
      c.toggle("lm", lm.includes(s)); c.toggle("sel", s === sel); c.toggle("chk", s === chk);
      c.toggle("dest", dests.has(s) && !pos.b[s]); c.toggle("oc", dests.has(s) && !!pos.b[s]);
      c.toggle("hov", s === hover && dests.has(s));
      c.toggle("hint", !!hintMv && (C.from(hintMv) === s || C.to(hintMv) === s));
    }
    // hint arrow
    const a = R.arrow;
    if (hintMv) {
      const f = C.from(hintMv), t = C.to(hintMv), x1 = colOf(f) + .5, y1 = rowOf(f) + .5, x2 = colOf(t) + .5, y2 = rowOf(t) + .5;
      const L = Math.hypot(x2 - x1, y2 - y1), k = (L - .35) / L;
      a.setAttribute("x1", x1); a.setAttribute("y1", y1); a.setAttribute("x2", x1 + (x2 - x1) * k); a.setAttribute("y2", y1 + (y2 - y1) * k);
      a.setAttribute("stroke", "rgba(21,120,27,.85)"); a.setAttribute("stroke-width", ".16"); a.setAttribute("stroke-linecap", "round"); a.setAttribute("marker-end", "url(#cpl-ah)");
      R.svg.style.display = "";
    } else R.svg.style.display = "none";
  }

  function material() {
    const cnt = { 0: {}, 8: {} };
    for (const s of SQ) { const p = pos.b[s]; if (p) { const sd = p & C.BLACK, t = p & 7; cnt[sd][t] = (cnt[sd][t] || 0) + 1; } }
    const init = { 1: 8, 2: 2, 3: 2, 4: 2, 5: 1 };
    const lost = sd => { const out = []; for (const t of [5, 4, 3, 2, 1]) for (let i = 0; i < Math.max(0, init[t] - (cnt[sd][t] || 0)); i++) out.push(t); return out; };
    const sum = sd => Object.keys(cnt[sd]).reduce((a, t) => a + VAL[t] * cnt[sd][t], 0);
    return { lostW: lost(0), lostB: lost(C.BLACK), diff: sum(0) - sum(C.BLACK) };
  }

  function ui() {
    if (!R || !alive()) return;
    const M = material(), mine = me();
    const capHTML = (list, col, adv) => list.map((t, i) => `<i class="${col}${TL[t]}${i && list[i - 1] === t ? " same" : ""}"></i>`).join("") + (adv > 0 ? `<span class="cpl-adv">+${adv}</span>` : "");
    // pieces I captured are the opponent's lost ones
    const myAdv = mine === 0 ? M.diff : -M.diff;
    R.me.querySelector(".cpl-cap").innerHTML = capHTML(mine === 0 ? M.lostB : M.lostW, mine === 0 ? "b" : "w", myAdv);
    R.ai.querySelector(".cpl-cap").innerHTML = capHTML(mine === 0 ? M.lostW : M.lostB, mine === 0 ? "w" : "b", -myAdv);
    R.me.classList.toggle("on", !G.over && myTurn()); R.ai.classList.toggle("on", !G.over && !myTurn()); R.ai.classList.toggle("think", thinking);
    R.msg.textContent = G.over ? "" : thinking ? (U.thinking || "") + "…" : myTurn() ? (C.inCheck(pos) ? U.check : U.yourMove) : "";
    const btn = a => pane.querySelector(`[data-a="${a}"]`);
    btn("undo").disabled = !!G.over || thinking || G.moves.length < (G.color === "w" ? 1 : 2);
    btn("hint").disabled = !!G.over || thinking || !myTurn();
    btn("resign").disabled = !!G.over || !G.moves.length;
    btn("snd").textContent = sound ? "🔊" : "🔇";
    R.moves.innerHTML = moveList();
    R.moves.scrollTop = R.moves.scrollHeight;
    R.end.innerHTML = G.over ? endHTML() : "";
    const nb = R.end.querySelector(".cpl-btn:not(.alt)"); if (nb) nb.onclick = () => action("again");
    const sb = R.end.querySelector(".cpl-btn.alt"); if (sb) sb.onclick = () => action("new");
  }

  function moveList() {
    const p = C.fromFen(C.START), sans = [];
    for (const u of G.moves) { const m = C.fromUci(p, u); if (!m) break; sans.push(C.san(p, m, ["", "", "К", "С", "Л", "Ф", "Кр"])); C.make(p, m); }
    let h = "";
    for (let i = 0; i < sans.length; i += 2) {
      h += `<span class="n">${i / 2 + 1}</span><span class="m${i === sans.length - 1 ? " cur" : ""}">${esc(sans[i])}</span><span class="m${i + 1 === sans.length - 1 ? " cur" : ""}">${sans[i + 1] ? esc(sans[i + 1]) : ""}</span>`;
    }
    if (G.over) {
      const r = G.over.r, w = (r === "win") === (G.color === "w");
      h += `<span class="res">${r === "draw" ? "½–½" : w ? "1–0" : "0–1"}</span>`;
    }
    return h;
  }

  function endHTML() {
    const o = G.over, E = U.end || {};
    const e = E[o.r] || { title: o.r, text: "" };
    const L = lvl(G.level);
    const extra = o.r === "win" && L.win ? L.win : o.r === "loss" && L.loss ? L.loss : e.text;
    return `<div class="cpl-end"><h4>${esc(e.title)}</h4><p>${esc(extra)}</p><div class="cpl-go" style="justify-content:center;margin:6px 0 0"><button type="button" class="cpl-btn">${esc(U.again)}</button><button type="button" class="cpl-btn alt">${esc(U.change)}</button></div></div>`;
  }

  /* ---------- Input: tap or drag ---------- */
  let drag = null;
  function sqAtPoint(x, y) {
    const r = R.board.getBoundingClientRect();
    const col = Math.floor((x - r.left) / r.width * 8), row = Math.floor((y - r.top) / r.height * 8);
    if (col < 0 || col > 7 || row < 0 || row > 7) return -1;
    return sqOf(col, row);
  }
  const mine = s => pos.b[s] && (pos.b[s] & C.BLACK) === me();
  const canAct = () => !G.over && !thinking && myTurn() && !R.board.querySelector(".cpl-promo");

  function down(ev) {
    if (!canAct() || (ev.button != null && ev.button !== 0)) return;
    const s = sqAtPoint(ev.clientX, ev.clientY); if (s < 0) return;
    if (sel >= 0 && s !== sel && tryMove(sel, s, false)) return;
    if (!mine(s)) { if (sel >= 0) { sel = -1; paint(); } return; }
    if (hintMv) hintMv = null;
    const wasSel = sel === s;
    sel = s; paint();
    const e = els[s]; if (!e) return;
    const r = R.board.getBoundingClientRect();
    drag = { s, e, wasSel, x0: ev.clientX, y0: ev.clientY, moved: false, r, id: ev.pointerId };
    try { R.board.setPointerCapture(ev.pointerId); } catch (_) {}
    R.board.addEventListener("pointermove", dmove); R.board.addEventListener("pointerup", dup); R.board.addEventListener("pointercancel", dup);
    ev.preventDefault();
  }
  function dmove(ev) {
    if (!drag) return;
    if (!drag.moved && Math.hypot(ev.clientX - drag.x0, ev.clientY - drag.y0) < 4) return;
    drag.moved = true;
    const r = drag.r, sz = r.width / 8;
    drag.e.classList.add("drag");
    drag.e.style.transform = `translate(${ev.clientX - r.left - sz / 2}px,${ev.clientY - r.top - sz / 2}px) scale(1.12)`;
    paint(sqAtPoint(ev.clientX, ev.clientY));
  }
  function dup(ev) {
    R.board.removeEventListener("pointermove", dmove); R.board.removeEventListener("pointerup", dup); R.board.removeEventListener("pointercancel", dup);
    const d = drag; drag = null; if (!d) return;
    if (!d.moved) { if (d.wasSel) { sel = -1; paint(); } return; }
    const t = ev.type === "pointerup" ? sqAtPoint(ev.clientX, ev.clientY) : -1;
    d.e.classList.remove("drag");
    if (t >= 0 && t !== d.s) { d.e.classList.add("snap"); if (tryMove(d.s, t, true)) return; d.e.classList.remove("snap"); }
    d.e.style.transform = xf(d.s); paint();
  }

  function tryMove(f, t, dragged) {
    const ms = C.legal(pos).filter(m => C.from(m) === f && C.to(m) === t);
    if (!ms.length) return false;
    if (ms.length > 1) { promo(ms, dragged); return true; }
    doMove(ms[0]); return true;
  }

  function promo(ms, dragged) {
    const t = C.to(ms[0]), col = colOf(t), top = rowOf(t) === 0;
    const ov = document.createElement("div"); ov.className = "cpl-promo";
    const col0 = pos.side === C.BLACK ? "b" : "w";
    ov.innerHTML = [5, 2, 4, 3].map((p, i) => `<button type="button" data-p="${p}" class="${col0}${TL[p]}" style="left:${col * 12.5}%;top:${(top ? i : 7 - i) * 12.5}%"></button>`).join("");
    ov.addEventListener("pointerdown", ev => {
      ev.stopPropagation();
      const b = ev.target.closest("button"); ov.remove();
      const m = b && ms.find(x => C.promo(x) === +b.dataset.p);
      if (m) doMove(m); else { const e = els[C.from(ms[0])]; if (e) { e.classList.remove("snap"); e.style.transform = xf(C.from(ms[0])); } sel = -1; paint(); }
    });
    R.board.appendChild(ov);
  }

  function doMove(m) {
    const cap = !!pos.b[C.to(m)] || (pos.b[C.from(m)] & 7) === 1 && (C.from(m) & 7) !== (C.to(m) & 7);
    G.moves.push(C.uci(m)); C.make(pos, m);
    sel = -1; hintMv = null;
    syncPieces(m); paint();
    snd(C.inCheck(pos) ? "chk" : cap ? "cap" : "move");
    if (finished()) return;
    save(); ui();
    if (!myTurn()) setTimeout(think, ANIM);
  }

  function finished() {
    const st = C.status(pos);
    if (!st) return false;
    end(st === "mate" ? (myTurn() ? "loss" : "win") : "draw", st);
    return true;
  }

  function end(r, why) {
    G.over = { r, why };
    if (r === "win") { const W = wins(); W[G.level] = (W[G.level] || 0) + 1; store.set(WKEY, W); }
    save(); sel = -1; paint(); ui();
    setTimeout(() => snd("end"), ANIM);
    if (R) R.end.scrollIntoView({ block: "nearest", behavior: "smooth" });
  }

  /* ---------- Engine ---------- */
  function ask(level, cb) {
    const id = ++reqId, list = G.moves.slice();
    pending = { id, cb };
    if (worker) worker.postMessage({ id, moves: list, level });
    else setTimeout(() => { const p = C.fromMoves(list); const m = C.bestMove(p, level); onEngine({ id, move: m ? C.uci(m) : null }); }, 30);
  }
  function onEngine(d) {
    if (!pending || d.id !== pending.id) return;
    const cb = pending.cb; pending = null; cb(d.move);
  }

  function think() {
    if (!alive() || G.over || myTurn() || thinking) return;
    thinking = true; ui();
    const started = Date.now(), L = lvl(G.level);
    ask(L.engine, u => {
      const wait = Math.max(0, 500 - (Date.now() - started));
      setTimeout(() => {
        thinking = false;
        if (!alive() || G.over) return;
        const m = u && C.fromUci(pos, u);
        if (!m) { ui(); return; }
        doMove(m);
      }, wait);
    });
  }

  function action(a) {
    if (a === "snd") { sound = !sound; store.set("cplaySnd", sound); if (sound) tock("move"); ui(); return; }
    if (a === "undo") {
      if (thinking || G.over) return;
      G.moves.pop(); if (G.moves.length && C.fromMoves(G.moves).side !== me()) G.moves.pop();
      save(); pos = C.fromMoves(G.moves); sel = -1; hintMv = null;
      syncPieces(null); paint(); ui(); return;
    }
    if (a === "hint") {
      const lv = lvl(G.level).engine >= 5 ? 4 : 3;
      R.msg.textContent = (U.thinking || "") + "…";
      ask(lv, u => { if (!alive()) return; hintMv = u ? C.fromUci(pos, u) : null; sel = -1; paint(); ui(); });
      return;
    }
    if (a === "resign") { if (!G.over && confirm(U.resignAsk || "?")) { pending = null; thinking = false; end("loss", "resign"); } return; }
    if (a === "again") { G = { level: G.level, color: G.color, moves: [], over: null }; save(); pos = C.fromMoves([]); sel = -1; hintMv = null; syncPieces(null); paint(); ui(); if (!myTurn()) setTimeout(think, ANIM + 100); return; }
    if (a === "new") { if (G && !G.over && G.moves.length && !confirm(U.leaveAsk || "?")) return; pending = null; thinking = false; if (G) cfg.level = G.level; G = null; store.set(KEY, null); setup(); }
  }
}

window.LitmirChessPlay = { mount };
})();
