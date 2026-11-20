/* Партия с компьютером внутри романа (sec.style "chess-play").
   Данные: novels/<slug>/<file>.json — {title, intro, levels:[{id, name, about, engine, quote}], ui:{...}}.
   Движок: games/chess-engine.js (в Web Worker, если можно; иначе в основном потоке).
   Сохраняется в браузере: lm:cplay:<slug> (партия), lm:cplayW:<slug> (победы по уровням). */
(function () {
"use strict";
const GLYPH = { 1: "♟︎", 2: "♞", 3: "♝", 4: "♜", 5: "♛", 6: "♚" };
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" }[c]));
const fmt = (s, o) => String(s || "").replace(/\{(\w+)\}/g, (_, k) => o[k] != null ? o[k] : "");

function loadEngine() {
  if (window.Chess) return Promise.resolve();
  return new Promise((ok, fail) => { const s = document.createElement("script"); s.src = "games/chess-engine.js"; s.onload = ok; s.onerror = fail; document.head.appendChild(s); });
}

function css() {
  if (document.getElementById("cpl-css")) return;
  const st = document.createElement("style"); st.id = "cpl-css";
  st.textContent = `
.cpl{--sq-l:#efe2cb;--sq-d:#b98a66;--hl:rgba(214,170,60,.55);--sel:rgba(140,47,47,.45);font-family:var(--sans)}
:root[data-theme="dark"] .cpl{--sq-l:#cdb594;--sq-d:#86603f;--sel:rgba(217,140,122,.55)}
@media (prefers-color-scheme: dark){:root:not([data-theme]) .cpl{--sq-l:#cdb594;--sq-d:#86603f;--sel:rgba(217,140,122,.55)}}
.cpl h3{font:400 22px var(--serif);color:var(--ink);margin:2px 0 8px}
.cpl .cpl-p{color:var(--muted);margin:0 0 16px;font-size:15px;line-height:1.5}
.cpl-lbl{font:600 12px var(--sans);color:var(--muted);text-transform:uppercase;letter-spacing:.06em;margin:14px 0 8px}
.cpl-seg{display:grid;grid-template-columns:repeat(auto-fit,minmax(150px,1fr));gap:8px}
.cpl-seg button{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:12px;padding:11px 13px;text-align:left;cursor:pointer;font:inherit}
.cpl-seg button[aria-pressed="true"]{border-color:var(--accent);box-shadow:0 0 0 2px var(--accent) inset}
.cpl-seg b{display:block;font:600 15px var(--sans)}.cpl-seg small{display:block;font:12.5px/1.35 var(--sans);color:var(--muted);margin-top:3px}
.cpl-seg .cpl-w{float:right;font:600 12px var(--sans);color:var(--accent)}
.cpl-go{display:flex;gap:10px;flex-wrap:wrap;margin:20px 0 6px}
.cpl-btn{border:1px solid var(--accent);background:var(--accent);color:#fff;border-radius:30px;padding:11px 22px;font:600 15px var(--sans);cursor:pointer}
:root[data-theme="dark"] .cpl-btn{color:#1d1914}
@media (prefers-color-scheme: dark){:root:not([data-theme]) .cpl-btn{color:#1d1914}}
.cpl-btn.alt{background:transparent;color:var(--accent)}
.cpl-btn:disabled{opacity:.45;cursor:default}
.cpl-quote{font:italic 15px/1.45 var(--serif);color:var(--ink);border-left:3px solid var(--accent);padding:2px 0 2px 12px;margin:14px 0 4px}
.cpl-top{display:flex;justify-content:space-between;align-items:center;gap:10px;margin:0 0 8px;font-size:14px}
.cpl-top b{font-weight:600}.cpl-top span{color:var(--muted)}
.cpl-board{width:100%;max-width:440px;aspect-ratio:1;margin:0 auto;display:grid;grid-template-columns:repeat(8,1fr);grid-template-rows:repeat(8,1fr);border-radius:8px;overflow:hidden;box-shadow:var(--shadow);user-select:none;-webkit-user-select:none;touch-action:manipulation;-webkit-tap-highlight-color:transparent}
.cpl-sq{position:relative;border:0;margin:0;padding:0;background:var(--sq-l);display:grid;place-items:center;cursor:pointer;container-type:size}
.cpl-sq.d{background:var(--sq-d)}
.cpl-sq.last::before{content:"";position:absolute;inset:0;background:var(--hl)}
.cpl-sq.sel::before{content:"";position:absolute;inset:0;background:var(--sel)}
.cpl-sq.chk::before{content:"";position:absolute;inset:0;background:radial-gradient(circle,rgba(220,40,40,.85) 0,rgba(220,40,40,.35) 55%,transparent 72%)}
.cpl-sq.dot::after{content:"";position:absolute;width:30%;height:30%;border-radius:50%;background:rgba(40,30,20,.28)}
.cpl-sq.cap::after{content:"";position:absolute;inset:6%;border-radius:50%;border:4px solid rgba(40,30,20,.28)}
.cpl-pc{position:relative;z-index:1;font-size:min(9vw,44px);font-size:78cqh;line-height:1;font-family:"Segoe UI Symbol","DejaVu Sans","Noto Sans Symbols 2",serif;pointer-events:none}
.cpl-pc.w{color:#fffaf0;-webkit-text-stroke:1.2px #2a2118;text-shadow:0 1px 2px rgba(0,0,0,.35)}
.cpl-pc.b{color:#1d1914;text-shadow:0 1px 1px rgba(255,255,255,.25)}
.cpl-co{position:absolute;font:600 9px var(--sans);opacity:.75;pointer-events:none}.cpl-co.f{right:3px;bottom:1px}.cpl-co.r{left:3px;top:1px}
.cpl-sq.d .cpl-co{color:var(--sq-l)}.cpl-sq:not(.d) .cpl-co{color:var(--sq-d)}
.cpl-msg{min-height:24px;text-align:center;margin:10px 0 4px;font-size:15px;color:var(--ink)}
.cpl-think{display:inline-block;width:7px;height:7px;border-radius:50%;background:var(--accent);margin-left:6px;animation:cplp 1s infinite ease-in-out;vertical-align:middle}
@keyframes cplp{50%{opacity:.25;transform:scale(.7)}}
.cpl-bar{display:flex;flex-wrap:wrap;justify-content:center;gap:8px;margin:8px 0}
.cpl-bar button{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:20px;padding:8px 14px;font:14px var(--sans);cursor:pointer}
.cpl-bar button:disabled{opacity:.4;cursor:default}
.cpl-moves{font:13.5px/1.6 var(--sans);color:var(--muted);max-height:96px;overflow:auto;margin:6px auto 0;max-width:440px}
.cpl-moves b{color:var(--ink);font-weight:600;margin-right:3px}
.cpl-promo{display:flex;justify-content:center;gap:8px;margin:8px 0}
.cpl-promo button{width:52px;height:52px;border-radius:12px;border:1px solid var(--line);background:var(--sq-l);font-size:34px;line-height:1;cursor:pointer}
.cpl-end{text-align:center;padding:12px;border-radius:14px;background:var(--bg);margin:10px auto 0;max-width:440px}
.cpl-end h4{font:400 22px var(--serif);margin:4px 0}.cpl-end p{margin:4px 0 10px;color:var(--muted)}
`;
  document.head.appendChild(st);
}

function mount(pane, opts) {
  const D = opts.data, slug = opts.slug, store = opts.store, U = D.ui || {};
  const LV = D.levels || [];
  const KEY = "cplay:" + slug, WKEY = "cplayW:" + slug;
  let C, worker = null, reqId = 0, thinking = false;
  // game state
  let G = store.get(KEY, null); // {level, color: "w"|"b", moves: [uci], over}
  let pos, sel = -1, promoFor = null, hintMv = null;
  let cfg = { level: (G && G.level) || (LV[0] && LV[0].id), color: (G && G.color) || "w" };

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

  /* ---------- Setup screen ---------- */
  function setup() {
    if (!alive()) return;
    const W = wins();
    const colors = [["w", U.white, "♔"], ["b", U.black, "♚"], ["r", U.random, "?"]];
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

  /* ---------- Game ---------- */
  const me = () => G.color === "w" ? 0 : C.BLACK;
  const myTurn = () => pos.side === me();

  function play() {
    pos = C.fromMoves(G.moves);
    // drop moves that did not apply (corrupt save)
    sel = -1; promoFor = null; hintMv = null;
    draw();
    if (!G.over && !myTurn()) think();
  }

  function sqAt(r, c) { const flip = G.color === "b"; const file = flip ? 7 - c : c, rank = flip ? r : 7 - r; return rank * 16 + file; }
  function lastMove() { const u = G.moves[G.moves.length - 1]; return u ? [C.nameSq(u.slice(0, 2)), C.nameSq(u.slice(2, 4))] : []; }
  function kingSq(side) { for (let s = 0; s < 128; s++) { if (s & 0x88) { s += 7; continue; } const p = pos.b[s]; if ((p & 7) === C.K && (p & C.BLACK) === side) return s; } return -1; }

  function moveList() {
    const p = C.fromFen(C.START), out = [];
    for (let i = 0; i < G.moves.length; i++) {
      const m = C.fromUci(p, G.moves[i]); if (!m) break;
      const s = C.san(p, m, ["", "", "К", "С", "Л", "Ф", "Кр"]);
      out.push((i % 2 === 0 ? `<b>${i / 2 + 1}.</b>` : "") + esc(s));
      C.make(p, m);
    }
    return out.join(" ");
  }

  function draw() {
    if (!alive()) return;
    const L = lvl(G.level);
    const legal = C.legal(pos);
    const targets = sel >= 0 ? legal.filter(m => C.from(m) === sel).map(m => C.to(m)) : [];
    const lm = lastMove(), chk = C.inCheck(pos) ? kingSq(pos.side) : -1;
    let h = "";
    for (let r = 0; r < 8; r++) for (let c = 0; c < 8; c++) {
      const s = sqAt(r, c), p = pos.b[s], file = s & 7, rank = (s >> 4) + 1;
      const cls = ["cpl-sq"]; if ((file + rank) % 2 === 0) cls.push("d");
      if (lm.includes(s) || (hintMv && (C.from(hintMv) === s || C.to(hintMv) === s))) cls.push("last");
      if (s === sel) cls.push("sel"); if (s === chk) cls.push("chk");
      if (targets.includes(s)) cls.push(p ? "cap" : "dot");
      h += `<button type="button" class="${cls.join(" ")}" data-s="${s}" aria-label="${C.sqName(s)}">`
        + (p ? `<span class="cpl-pc ${p & C.BLACK ? "b" : "w"}">${GLYPH[p & 7]}</span>` : "")
        + (r === 7 ? `<span class="cpl-co f">${"abcdefgh"[file]}</span>` : "") + (c === 0 ? `<span class="cpl-co r">${rank}</span>` : "") + `</button>`;
    }
    let msg = "";
    if (G.over) msg = "";
    else if (thinking) msg = `${esc(U.thinking)}<span class="cpl-think"></span>`;
    else if (myTurn()) msg = esc(C.inCheck(pos) ? U.check : U.yourMove);
    const promo = promoFor ? `<div class="cpl-promo">${[5, 4, 3, 2].map(t => `<button type="button" data-pr="${t}">${GLYPH[t]}</button>`).join("")}</div>` : "";
    const end = G.over ? endHTML() : "";
    pane.innerHTML = `<div class="cpl">
      <div class="cpl-top"><b>${esc(L.name)}</b><span>${esc(G.color === "w" ? U.playWhite : U.playBlack)}</span></div>
      <div class="cpl-board">${h}</div>${promo}
      <div class="cpl-msg">${msg}</div>${end}
      <div class="cpl-bar">
        <button type="button" data-a="undo" ${G.over || thinking || G.moves.length < (G.color === "w" ? 1 : 2) ? "disabled" : ""}>↶ ${esc(U.undo)}</button>
        <button type="button" data-a="hint" ${G.over || thinking || !myTurn() ? "disabled" : ""}>💡 ${esc(U.hint)}</button>
        <button type="button" data-a="resign" ${G.over || !G.moves.length ? "disabled" : ""}>🏳 ${esc(U.resign)}</button>
        <button type="button" data-a="new">↻ ${esc(U.newGame)}</button>
      </div>
      <div class="cpl-moves">${moveList()}</div></div>`;
    pane.querySelectorAll(".cpl-sq").forEach(b => b.onclick = () => tap(+b.dataset.s));
    pane.querySelectorAll("[data-pr]").forEach(b => b.onclick = () => { const m = promoFor.find(x => C.promo(x) === +b.dataset.pr); promoFor = null; if (m) doMove(m); });
    pane.querySelectorAll("[data-a]").forEach(b => b.onclick = () => action(b.dataset.a));
    const nb = pane.querySelector(".cpl-end .cpl-btn"); if (nb) nb.onclick = () => action("again");
    const sb = pane.querySelector(".cpl-end .cpl-btn.alt"); if (sb) sb.onclick = () => action("new");
  }

  function endHTML() {
    const o = G.over, E = U.end || {};
    const e = E[o.r] || { title: o.r, text: "" };
    const L = lvl(G.level);
    const extra = o.r === "win" && L.win ? L.win : o.r === "loss" && L.loss ? L.loss : e.text;
    return `<div class="cpl-end"><h4>${esc(e.title)}</h4><p>${esc(extra)}</p><div class="cpl-go" style="justify-content:center;margin:6px 0 0"><button type="button" class="cpl-btn">${esc(U.again)}</button><button type="button" class="cpl-btn alt">${esc(U.change)}</button></div></div>`;
  }

  function tap(s) {
    if (G.over || thinking || !myTurn()) return;
    promoFor = null; hintMv = null;
    const p = pos.b[s];
    if (sel >= 0) {
      const ms = C.legal(pos).filter(m => C.from(m) === sel && C.to(m) === s);
      if (ms.length > 1) { promoFor = ms; draw(); return; }
      if (ms.length === 1) { doMove(ms[0]); return; }
    }
    sel = p && (p & C.BLACK) === me() && sel !== s ? s : -1;
    draw();
  }

  function doMove(m) {
    G.moves.push(C.uci(m)); C.make(pos, m);
    sel = -1; hintMv = null;
    if (finished()) return;
    save(); draw();
    if (!myTurn()) think();
  }

  function finished() {
    const st = C.status(pos);
    if (!st) return false;
    let r = "draw";
    if (st === "mate") r = myTurn() ? "loss" : "win";
    end(r, st);
    return true;
  }

  function end(r, why) {
    G.over = { r, why };
    if (r === "win") { const W = wins(); W[G.level] = (W[G.level] || 0) + 1; store.set(WKEY, W); }
    save(); draw();
  }

  /* ---------- Engine ---------- */
  function ask(level, cb) {
    const id = ++reqId, list = G.moves.slice();
    pending = { id, cb };
    if (worker) worker.postMessage({ id, moves: list, level });
    else setTimeout(() => { const p = C.fromMoves(list); const m = C.bestMove(p, level); onEngine({ id, move: m ? C.uci(m) : null }); }, 30);
  }
  let pending = null;
  function onEngine(d) {
    if (!pending || d.id !== pending.id) return;
    const cb = pending.cb; pending = null; cb(d.move);
  }

  function think() {
    thinking = true; draw();
    const started = Date.now(), L = lvl(G.level);
    ask(L.engine, u => {
      const wait = Math.max(0, 450 - (Date.now() - started)); // a short pause so the move is visible
      setTimeout(() => {
        thinking = false;
        if (!alive() || G.over) return;
        const m = u && C.fromUci(pos, u);
        if (!m) { draw(); return; }
        G.moves.push(u); C.make(pos, m);
        if (finished()) return;
        save(); draw();
      }, wait);
    });
  }

  function action(a) {
    if (a === "undo") {
      if (thinking) return;
      // take back to the last position where it is my move
      G.moves.pop(); if (G.moves.length && C.fromMoves(G.moves).side !== me()) G.moves.pop();
      if (G.color === "b" && !G.moves.length) { /* computer opens again */ }
      save(); play(); return;
    }
    if (a === "hint") {
      ask(Math.max(3, lvl(G.level).engine === 5 ? 4 : 3), u => { if (!alive()) return; hintMv = u ? C.fromUci(pos, u) : null; draw(); });
      return;
    }
    if (a === "resign") { if (!G.over && confirm(U.resignAsk || "?")) { pending = null; thinking = false; end("loss", "resign"); } return; }
    if (a === "again") { G = { level: G.level, color: G.color, moves: [], over: null }; save(); play(); return; }
    if (a === "new") { if (G && !G.over && G.moves.length && !confirm(U.leaveAsk || "?")) return; pending = null; thinking = false; if (G) cfg.level = G.level; G = null; store.set(KEY, null); setup(); }
  }
}

window.LitmirChessPlay = { mount };
})();
