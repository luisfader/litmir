/* «Кубик Рубика» — раздел романа: настоящий кубик 3×3×3, на каждой грани — картина.
   Шесть комбинаций (уровней): в каждой надо собрать одну грань — и на ней появляется герой.
   Данные по романам — в DATA ниже (картинки 480×480 в games/cube/img/).
   Подключение: window.LitmirCube.mount(el, {slug, store}). Прогресс — store "cube:<slug>" (сколько комбинаций собрано).
   Координаты как в CSS: x вправо, y вниз, z к зрителю. Грани: F(+z) R(+x) B(−z) L(−x) D(+y) U(−y). */
(function(){
"use strict";
const DATA = {
  "dikij-chas": {
    title: "Кубик Рубика",
    intro: "В романе Луис достаёт из кармана кубик Рубика. Теперь он у вас. Шесть граней — шесть картин, шесть комбинаций. Соберите грань — и на ней появится герой.",
    end: "Все шесть комбинаций собраны. Кубик Луиса теперь слушается и вас.",
    levels: [
      {f:"F", img:"luis.jpg",    name:"Луис",          n:1, text:"Художник и путешественник. Приехал в Сербию рисовать города и учить язык — и нашёл гораздо больше."},
      {f:"R", img:"natasha.jpg", name:"Наташа",        n:2, text:"Белградка с характером и непростым прошлым. Одна случайная встреча с ней меняет всё."},
      {f:"B", img:"sofia.jpg",   name:"София",         n:3, text:"Давняя подруга Наташи. Знает историю Белграда — и готовит город к Дикому часу."},
      {f:"L", img:"zmaj.jpg",    name:"Змай",          n:4, text:"Слишком велик, чтобы быть врагом, и слишком древен, чтобы быть союзником."},
      {f:"D", img:"belgrad.jpg", name:"Белград",       n:5, text:"Город с тайной. Иногда город выбирает тебя — и тогда назад пути нет."},
      {f:"U", img:"vmeste.jpg",  name:"Луис и Наташа", n:6, text:"Вместе. Между свободой и ответственностью, страхом и доверием, бегством и любовью они выбрали друг друга."}
    ]
  }
};
const FACES = {
  F:{n:[0,0,1],  tf:"",                 ex:[1,0,0],  ey:[0,1,0],  view:[0,0]},
  R:{n:[1,0,0],  tf:"rotateY(90deg)",   ex:[0,0,-1], ey:[0,1,0],  view:[0,-90]},
  B:{n:[0,0,-1], tf:"rotateY(180deg)",  ex:[-1,0,0], ey:[0,1,0],  view:[0,180]},
  L:{n:[-1,0,0], tf:"rotateY(-90deg)",  ex:[0,0,1],  ey:[0,1,0],  view:[0,90]},
  U:{n:[0,-1,0], tf:"rotateX(90deg)",   ex:[1,0,0],  ey:[0,0,1],  view:[-90,0]},
  D:{n:[0,1,0],  tf:"rotateX(-90deg)",  ex:[1,0,0],  ey:[0,0,-1], view:[90,0]}
};
const FK = Object.keys(FACES), AXN = ["X","Y","Z"];
const CSS = `
.rc{font-family:var(--sans);color:var(--ink);max-width:520px;margin:0 auto}
.rc h3{font-family:var(--serif,Georgia,serif);font-size:24px;font-weight:400;margin:0 0 8px;text-align:center}
.rc-p{color:var(--muted);font-size:14.5px;line-height:1.5;text-align:center;max-width:460px;margin:0 auto 14px}
.rc-lv{display:flex;justify-content:center;gap:8px;flex-wrap:wrap;margin:0 0 12px}
.rc-lv button{position:relative;width:46px;height:46px;border-radius:10px;border:2px solid var(--line);background:var(--paper) center/cover;cursor:pointer;padding:0;font:700 15px var(--sans);color:var(--muted);overflow:hidden}
.rc-lv button.done{color:transparent}
.rc-lv button.done::after{content:"✓";position:absolute;right:2px;bottom:1px;font-size:12px;color:#fff;text-shadow:0 0 3px #000,0 0 3px #000}
.rc-lv button.on{border-color:var(--accent);box-shadow:0 0 0 3px var(--accent-soft,rgba(160,60,60,.2))}
.rc-lv button:disabled{cursor:default;opacity:.55}
.rc-goal{display:flex;align-items:center;gap:12px;justify-content:center;margin:0 0 6px;font-size:14.5px;line-height:1.35}
.rc-goal i{flex:none;width:54px;height:54px;border-radius:10px;background:center/cover;border:1px solid var(--line)}
.rc-goal b{display:block;font-size:16px}
.rc-goal span{color:var(--muted);font-size:13px}
.rc-stage{position:relative;height:var(--h);perspective:900px;touch-action:none;user-select:none;-webkit-user-select:none;cursor:grab;border-radius:16px;background:radial-gradient(circle at 50% 45%,rgba(120,90,200,.16),transparent 68%)}
.rc-stage:active{cursor:grabbing}
.rc-cube{position:absolute;left:50%;top:50%;width:0;height:0;transform-style:preserve-3d}
.rc-cube.anim{transition:transform .7s ease}
.rc-c{position:absolute;left:0;top:0;width:0;height:0;transform-style:preserve-3d}
.rc-f{position:absolute;left:calc(var(--s)/-2);top:calc(var(--s)/-2);width:var(--s);height:var(--s);background:#111;backface-visibility:hidden;-webkit-backface-visibility:hidden;box-sizing:border-box}
.rc-f.st::after{content:"";position:absolute;inset:2px;border-radius:5px;background-image:inherit;background-size:300% 300%;background-position:inherit;background-repeat:no-repeat}
.rc-f.st{background-color:#111;background-size:0 0}
.rc-hud{display:flex;justify-content:space-between;align-items:center;font-size:13px;color:var(--muted);margin:6px 2px 8px}
.rc-hud b{color:var(--ink)}
.rc-dir{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:999px;padding:6px 12px;font:600 13px var(--sans);cursor:pointer}
.rc-faces{display:grid;grid-template-columns:repeat(6,1fr);gap:6px;margin:0 0 10px}
.rc-faces button{aspect-ratio:1;border-radius:10px;border:2px solid var(--line);background:center/cover;cursor:pointer;padding:0;position:relative;overflow:hidden}
.rc-faces button.goal{border-color:var(--accent)}
.rc-faces button::after{content:attr(data-a);position:absolute;right:3px;bottom:0;color:#fff;font:700 15px var(--sans);text-shadow:0 0 4px #000,0 0 4px #000}
.rc-faces button:active{transform:scale(.94)}
.rc-tip{font-size:12.5px;color:var(--muted);text-align:center;margin:0 0 10px;line-height:1.45}
.rc-act{display:flex;gap:8px;justify-content:center;flex-wrap:wrap}
.rc-btn{border:1px solid var(--line);background:var(--paper);color:var(--ink);border-radius:999px;padding:9px 18px;font:600 14px var(--sans);cursor:pointer}
.rc-go{border:0;border-radius:999px;padding:11px 28px;font:600 15px var(--sans);color:#fff;background:var(--accent);cursor:pointer}
.rc-win{text-align:center;padding:4px 6px 0;animation:rcIn .5s ease}
.rc-win i{display:block;width:150px;height:150px;margin:0 auto 12px;border-radius:16px;background:center/cover;box-shadow:0 10px 26px rgba(0,0,0,.25)}
.rc-win small{display:block;color:var(--muted);font-size:12.5px;margin:0 0 4px;letter-spacing:.06em;text-transform:uppercase}
@keyframes rcIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.rc-busy .rc-faces button,.rc-busy .rc-btn{pointer-events:none;opacity:.6}
`;
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const rot = (a, q) => a === 0 ? [[1,0,0],[0,0,-q],[0,q,0]] : a === 1 ? [[0,0,q],[0,1,0],[-q,0,0]] : [[0,-q,0],[q,0,0],[0,0,1]];
const mv = (m, v) => m.map(r => r[0]*v[0] + r[1]*v[1] + r[2]*v[2]);
const mm = (a, b) => a.map(r => [0,1,2].map(j => r[0]*b[0][j] + r[1]*b[1][j] + r[2]*b[2][j]));
const ID = () => [[1,0,0],[0,1,0],[0,0,1]];
const isId = m => m.every((r, i) => r.every((v, j) => v === (i === j ? 1 : 0)));
const dot = (a, b) => a[0]*b[0] + a[1]*b[1] + a[2]*b[2];
const wait = ms => new Promise(r => setTimeout(r, ms));

function mount(el, opt){
  const slug = opt.slug, store = opt.store, D = DATA[slug];
  if (!D) { el.innerHTML = ""; return; }
  if (!document.getElementById("rcCss")) { const st = document.createElement("style"); st.id = "rcCss"; st.textContent = CSS; document.head.appendChild(st); }
  const IMG = "games/cube/img/", L = D.levels, byFace = {}; L.forEach(l => byFace[l.f] = l);
  const KEY = "cube:" + slug, done = () => Math.min(L.length, store.get(KEY, 0) || 0);
  const chips = cur => `<div class="rc-lv">${L.map((l, i) => { const d = i < done(); return `<button type="button" data-lv="${i}" class="${d ? "done" : ""}${i === cur ? " on" : ""}" ${i > done() ? "disabled" : ""} ${d ? `style="background-image:url(${IMG}${l.img})"` : ""} aria-label="Комбинация ${i + 1}">${i > done() ? "🔒" : i + 1}</button>`; }).join("")}</div>`;
  const bindChips = () => el.querySelectorAll("[data-lv]").forEach(b => b.onclick = () => play(+b.dataset.lv));

  function start(){
    const d = done();
    el.innerHTML = `<div class="rc"><h3>${esc(D.title)}</h3><p class="rc-p">${esc(d >= L.length ? D.end : D.intro)}</p>${chips(-1)}
      <div class="rc-act"><button type="button" class="rc-go">${d === 0 ? "Играть" : d >= L.length ? "Собрать ещё раз" : "Продолжить"}</button></div></div>`;
    el.querySelector(".rc-go").onclick = () => play(d >= L.length ? 0 : d);
    bindChips();
  }

  function play(lv){
    const T = L[lv], tf = FACES[T.f], w = Math.min(el.clientWidth || 340, 520), s = Math.max(40, Math.min(64, Math.floor((w - 30) / 5.4)));
    el.innerHTML = `<div class="rc" style="--s:${s}px;--h:${Math.round(s * 5.6)}px">${chips(lv)}
      <div class="rc-goal"><i style="background-image:url(${IMG}${T.img})"></i><div><span>Комбинация ${lv + 1} из ${L.length}</span><b>Соберите грань: ${esc(T.name)}</b></div></div>
      <div class="rc-stage"><div class="rc-cube"></div></div>
      <div class="rc-hud"><span>Ходов: <b class="rc-n">0</b></span><button type="button" class="rc-dir"></button></div>
      <div class="rc-faces">${L.map(l => `<button type="button" data-f="${l.f}" class="${l.f === T.f ? "goal" : ""}" style="background-image:url(${IMG}${l.img})" aria-label="Повернуть грань: ${esc(l.name)}"></button>`).join("")}</div>
      <p class="rc-tip">Нажмите на картинку — и эта грань повернётся (середина грани всегда остаётся на месте). Кубик можно вращать пальцем, а грань — повернуть и нажатием прямо на кубике.</p>
      <div class="rc-act"><button type="button" class="rc-btn" data-a="hint">Подсказка</button><button type="button" class="rc-btn" data-a="mix">Перемешать заново</button></div>
      <div class="rc-out"></div></div>`;
    bindChips();
    const root = el.querySelector(".rc"), stage = el.querySelector(".rc-stage"), cube = el.querySelector(".rc-cube"), nEl = el.querySelector(".rc-n"), dirB = el.querySelector(".rc-dir");
    let rx = tf.view[0] ? tf.view[0] * .72 : -22, ry = tf.view[0] ? -24 : tf.view[1] - 30, cw = true, busy = false, won = false, moves = 0, hints = 0, stack = [], alive = true;
    const setView = () => { cube.style.transform = `rotateX(${rx}deg) rotateY(${ry}deg)`; };
    const setDir = () => { dirB.textContent = cw ? "↻ по часовой" : "↺ против часовой"; el.querySelectorAll(".rc-faces button").forEach(b => b.dataset.a = cw ? "↻" : "↺"); };
    setView(); setDir();
    dirB.onclick = () => { cw = !cw; setDir(); };

    /* кубики */
    const cubies = [];
    for (let x = -1; x <= 1; x++) for (let y = -1; y <= 1; y++) for (let z = -1; z <= 1; z++) {
      if (!x && !y && !z) continue;
      const home = [x, y, z], e = document.createElement("div"); e.className = "rc-c";
      FK.forEach(k => { const F = FACES[k], f = document.createElement("div"), out = dot(home, F.n) === 1;
        f.className = "rc-f" + (out ? " st" : ""); f.style.transform = `${F.tf} translateZ(${s / 2}px)`;
        if (out) { f.style.backgroundImage = `url(${IMG}${byFace[k].img})`; f.style.backgroundPosition = `${(dot(home, F.ex) + 1) * 50}% ${(dot(home, F.ey) + 1) * 50}%`; f.dataset.k = k; }
        e.appendChild(f); });
      const c = {home, pos: home.slice(), m: ID(), e}; e._c = c; cubies.push(c); cube.appendChild(e);
    }
    const base = c => `translate3d(${c.pos[0] * s}px,${c.pos[1] * s}px,${c.pos[2] * s}px) matrix3d(${c.m[0][0]},${c.m[1][0]},${c.m[2][0]},0,${c.m[0][1]},${c.m[1][1]},${c.m[2][1]},0,${c.m[0][2]},${c.m[1][2]},${c.m[2][2]},0,0,0,0,1)`;
    const place = c => { c.e.style.transition = "none"; c.e.style.transform = base(c); };
    cubies.forEach(place);
    const solved = k => { const F = FACES[k]; return cubies.every(c => dot(c.home, F.n) !== 1 || (isId(c.m) && c.pos.every((v, i) => v === c.home[i]))); };

    /* поворот грани k: q = +1 по часовой (если смотреть на грань снаружи) */
    async function turn(k, q, ms){
      const F = FACES[k], a = F.n.findIndex(v => v), sgn = F.n[a], r = sgn * q, R = rot(a, r), set = cubies.filter(c => c.pos[a] === sgn);
      if (ms) {
        set.forEach(c => { c.e.style.transition = "none"; c.e.style.transform = `rotate${AXN[a]}(0deg) ${base(c)}`; });
        void cube.offsetWidth;
        set.forEach(c => { c.e.style.transition = `transform ${ms}ms ease`; c.e.style.transform = `rotate${AXN[a]}(${r * 90}deg) ${base(c)}`; });
        await wait(ms + 30);
      }
      set.forEach(c => { c.pos = mv(R, c.pos); c.m = mm(R, c.m); place(c); });
    }
    const push = (k, q) => { const t = stack[stack.length - 1]; if (t && t[0] === k && t[1] === -q) stack.pop(); else stack.push([k, q]);
      const n = stack.length; if (n >= 3 && stack[n-1][0] === k && stack[n-2][0] === k && stack[n-3][0] === k && stack[n-2][1] === q && stack[n-3][1] === q) { stack.length = n - 3; stack.push([k, -q]); } };
    const lock = v => { busy = v; root.classList.toggle("rc-busy", v); };

    async function mix(){
      if (busy) return; lock(true); won = false; el.querySelector(".rc-out").innerHTML = "";
      /* вернуть в собранное состояние и показать картину */
      cubies.forEach(c => { c.pos = c.home.slice(); c.m = ID(); place(c); }); stack = []; moves = 0; hints = 0; nEl.textContent = 0;
      await wait(900); if (!alive) return;
      const len = T.n; let seq;
      do { seq = []; while (seq.length < len) { const k = FK[Math.random() * 6 | 0], q = Math.random() < .5 ? 1 : -1, p = seq[seq.length - 1];
          if (p && p[0] === k) continue; if (!seq.length && dot(FACES[k].n, tf.n) !== 0) continue; seq.push([k, q]); } } while (!checkSeq(seq));
      for (const [k, q] of seq) { await turn(k, q, 260); if (!alive) return; push(k, q); await wait(60); }
      lock(false);
    }
    /* перемешивание должно реально разрушать нужную грань */
    function checkSeq(seq){
      const sim = cubies.map(c => ({home: c.home, pos: c.home.slice(), m: ID()}));
      seq.forEach(([k, q]) => { const F = FACES[k], a = F.n.findIndex(v => v), sgn = F.n[a], R = rot(a, sgn * q); sim.forEach(c => { if (c.pos[a] === sgn) { c.pos = mv(R, c.pos); c.m = mm(R, c.m); } }); });
      const bad = sim.filter(c => dot(c.home, tf.n) === 1 && !(isId(c.m) && c.pos.every((v, i) => v === c.home[i]))).length;
      return bad >= Math.min(6, 1 + 2 * seq.length);
    }
    async function move(k, q, hint){
      if (busy || won) return; lock(true);
      await turn(k, q, 240); if (!alive) return;
      push(k, q); moves++; if (hint) hints++; nEl.textContent = moves;
      if (solved(T.f)) return win();
      lock(false);
    }
    function win(){
      won = true; busy = false; root.classList.remove("rc-busy");
      if (lv + 1 > done()) store.set(KEY, lv + 1);
      cube.classList.add("anim"); rx = tf.view[0] ? tf.view[0] * .8 : -12; ry = tf.view[0] ? 0 : tf.view[1] - 14; setView();
      const last = lv + 1 >= L.length;
      el.querySelector(".rc-faces").style.display = "none"; el.querySelector(".rc-tip").style.display = "none"; el.querySelector(".rc-act").style.display = "none"; el.querySelector(".rc-hud").style.display = "none";
      el.querySelector(".rc-out").innerHTML = `<div class="rc-win"><i style="background-image:url(${IMG}${T.img})"></i><small>Комбинация ${lv + 1} собрана · ходов: ${moves}${hints ? `, подсказок: ${hints}` : ""}</small><h3>${esc(T.name)}</h3><p class="rc-p">${esc(T.text)}</p>${last ? `<p class="rc-p"><b>${esc(D.end)}</b></p>` : ""}
        <div class="rc-act"><button type="button" class="rc-go">${last ? "К началу" : "Следующая комбинация"}</button></div></div>`;
      el.querySelector(".rc-win .rc-go").onclick = () => last ? start() : play(lv + 1);
      el.querySelectorAll("[data-lv]").forEach((b, i) => { if (i <= lv) { b.classList.add("done"); b.style.backgroundImage = `url(${IMG}${L[i].img})`; b.textContent = i + 1; } if (i <= lv + 1) b.disabled = false; });
      el.querySelector(".rc-win").scrollIntoView({block: "nearest", behavior: "smooth"});
    }
    el.querySelectorAll(".rc-faces button").forEach(b => b.onclick = () => move(b.dataset.f, cw ? 1 : -1));
    el.querySelector('[data-a="mix"]').onclick = mix;
    el.querySelector('[data-a="hint"]').onclick = () => { const t = stack[stack.length - 1]; if (t) move(t[0], -t[1], true); };

    /* вращение кубика пальцем; короткое нажатие на наклейку — поворот грани, на которой она сейчас */
    let drag = null;
    stage.onpointerdown = e => { drag = {x: e.clientX, y: e.clientY, mx: 0, t: e.target}; cube.classList.remove("anim"); try { stage.setPointerCapture(e.pointerId); } catch(_) {} };
    stage.onpointermove = e => { if (!drag) return; const dx = e.clientX - drag.x, dy = e.clientY - drag.y; drag.x = e.clientX; drag.y = e.clientY; drag.mx += Math.abs(dx) + Math.abs(dy);
      ry += dx * .55; rx = Math.max(-90, Math.min(90, rx - dy * .55)); setView(); };
    stage.onpointerup = stage.onpointercancel = e => { const d = drag; drag = null; if (!d || e.type === "pointercancel" || d.mx > 8) return;
      const f = d.t && d.t.closest ? d.t.closest(".rc-f.st") : null; if (!f) return;
      const c = f.parentNode._c, nrm = mv(c.m, FACES[f.dataset.k].n), k = FK.find(x => FACES[x].n.every((v, i) => v === nrm[i])); if (k) move(k, cw ? 1 : -1); };
    const mo = new MutationObserver(() => { if (!root.isConnected) { alive = false; mo.disconnect(); } }); mo.observe(el, {childList: true});
    mix();
  }
  start();
}
window.LitmirCube = {mount};
})();
