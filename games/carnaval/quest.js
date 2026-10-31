/* Quest «La hora salvaje: El carnaval de la discordia» — point-and-click adventure based on the novel
   «Дикий час: Карнавал раздора» by Robert Fader. Mounted by index.html on #/quest.
   Images live in games/carnaval/img/. Missing optional images fall back to other art. */
(function(){
"use strict";
const BASE = "games/carnaval/img/";
const NOVEL = "novels/dikij-chas-karnaval-razdora/img/";
const KEY = "carnaval:quest:v1";
let L = "es", root, stage, bgEl, fxEl, sprEl, spotEl, ovEl, dlgEl, invEl, chEl, run = 0;
let S = null;            // saved state {scene, inv:[], f:{}}
let selected = null;     // selected inventory item id
let onInvPick = null;    // callback while waiting in a room
let sheetOk = false;     // image 21 (objetos.png) loaded

const T = (es, ru) => L === "ru" ? ru : es;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const esc = s => String(s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const ABORT = {};
const guard = tok => { if (tok !== run) throw ABORT; };

/* ---------- images ---------- */
const BG = {
  titulo: [BASE+"titulo.jpg"], refugio: [BASE+"refugio.jpg"], atocha: [BASE+"atocha.jpg"],
  lavapies: [BASE+"lavapies.jpg"], estatuas: [BASE+"estatuas.jpg"], toreros: [BASE+"toreros.jpg"],
  margaritas: [BASE+"margaritas.jpg"], biblioteca: [BASE+"biblioteca.jpg"], sala: [BASE+"sala.jpg"],
  tauran: [BASE+"tauran.jpg", BASE+"biblioteca.jpg"], manso: [BASE+"tauran-manso.jpg", BASE+"biblioteca.jpg"],
  colon: [NOVEL+"13-1.jpg"], mariquita: [BASE+"mariquita.jpg", NOVEL+"13-1.jpg"],
  rezo: [NOVEL+"13-2.jpg"], batalla: [NOVEL+"13-3.jpg"], rey: [NOVEL+"13-4.jpg"],
  final: [BASE+"final.jpg", NOVEL+"13-4.jpg"], negro: []
};
const SPR = { // sprite file, head centre (x fraction), portrait zoom
  luis: {f:"luis.webp", cx:.47, z:2.6, w:387},
  nata: {f:"natasha-a.webp", cx:.48, z:2.6, w:388},
  natb: {f:"natasha-b.webp", cx:.55, z:3.1, w:474},
  agl:  {f:"agente-l.webp", cx:.5, z:4.2, w:638},
  mar:  {f:"mariano.webp", cx:.485, z:2.4, w:353},
  bib:  {f:"bibliotecario.webp", cx:.55, z:1.85, w:268},
  tor:  {f:"torero.webp", cx:.5, z:4.4, w:674}
};
const WHO = () => ({
  luis: {n: T("Luis","Луис"), s:"luis"},
  nat:  {n: T("Natasha","Наташа"), s: S && S.f.vestido ? "natb" : "nata"},
  agl:  {n: T("Agente L","Агент Л"), s:"agl"},
  mar:  {n: T("Mariano Ferreira","Мариано Феррейра"), s:"mar"},
  bib:  {n: T("El bibliotecario","Библиотекарь"), s:"bib"},
  tor:  {n: T("El torero","Главный тореадор"), s:"tor"},
  sec:  {n: T("La secretaria","Секретарь"), e:"📋"},
  jefe: {n: T("El jefe de la unidad","Начальник подразделения"), e:"🕴️"},
  cos:  {n: T("La costurera","Портниха"), e:"🧵"},
  act:  {n: T("Una activista","Активистка"), e:"📣"},
  mob:  {n: T("La multitud","Толпа"), e:"👥"},
  rey:  {n: T("El rey fantasma","Призрачный король"), e:"👑"},
  nina: {n: T("La niña mariquita","Девочка-божья коровка"), e:"🐞"},
  sra:  {n: T("Una señora","Пожилая сеньора"), e:"👵"},
  voz:  {n: T("Una voz en la oscuridad","Голос в темноте"), e:"🌑"},
  reloj:{n: T("El reloj negro","Чёрные часы"), e:"⌚"}
});

/* ---------- inventory ---------- */
const ITEMS = () => ({
  cubo:      {n:T("Cubo de Rubik","Кубик Рубика"), d:T("Parece un cubo de Rubik normal. Solo lo parece.","Обычным он выглядит только для того, кто не знает Луиса."), s:0},
  tablet:    {n:T("Tablet de fondo místico","Планшет мистического фона"), d:T("Mide el fondo místico y dibuja el mapa de la anomalía.","Измеряет мистический фон и строит карту аномалии."), s:1, e:"🗺️"},
  telefono:  {n:T("Teléfono","Телефон"), d:T("Un teléfono con algunas… funciones extra. Por ejemplo, convertirse en espada.","Телефон с некоторыми… дополнительными функциями. Например, превращаться в меч."), s:2, e:"📱"},
  reloj:     {n:T("Reloj negro","Чёрные часы"), d:T("Tiene un menú para cada tipo de situación.","У них есть меню для любого типа ситуации."), s:3, e:"⌚"},
  cartera:   {n:T("Billetera","Бумажник"), d:T("Tarjeta, carnet serbio, el ticket del buffet de Filosofía… y una cartulina doblada que Luis nunca saca.","Банковская карточка, сербское удостоверение, чек из буфета философского факультета… и сложенная картонка, которую Луис никогда не достаёт."), e:"👛"},
  pagina:    {n:T("Página arrancada","Вырванная страница"), d:T("La página del manuscrito sobre los dioses cornudos. Mejor mirarla de cerca.","Страница рукописи о рогатых богах. Стоит рассмотреть её поближе."), s:5, e:"📜"},
  megafono:  {n:T("Megáfono","Мегафон"), d:T("Prestado por un ayudante de Mariano.","Одолжен у помощника Феррейры."), s:6, e:"📢"},
  estampita: {n:T("Estampita del Gauchito Gil","Эстампита Гаучито Хиля"), d:T("Un joven gaucho de pelo negro, camisa y pañuelo rojos, con una cruz a la espalda. Atada con una cinta roja descolorida.","Молодой гаучо с длинными чёрными волосами, в красной рубахе и красном платке, с крестом за спиной. Перевязана выцветшей красной ленточкой."), s:7, e:"🎴"},
  cruz:      {n:T("Cruz de Natasha","Крестик Наташи"), d:T("«Me la devolvés. Junto con vos.»","«Вернёшь. Вместе с собой.»"), s:8, e:"✝️"}
});
const RUBIK = () => { const c = ["#c62828","#1565c0","#f9a825","#2e7d32","#fff","#ef6c00"]; let h = '<span class="cq-rubik">'; for (let i=0;i<9;i++) h += `<i style="background:${c[(i*7+3)%6]}"></i>`; return h + "</span>"; };
function itemIcon(id){
  const it = ITEMS()[id];
  if (sheetOk && it.s != null) { const col = it.s % 4, row = Math.floor(it.s / 4); return `<span class="sheet" style="background-image:url(${BASE}objetos.png);background-size:400% 300%;background-position:${col*100/3}% ${row*50}%"></span>`; }
  return id === "cubo" ? RUBIK() : it.e;
}
function drawInv(newId){
  const items = ITEMS();
  invEl.innerHTML = `<span class="cq-lbl">${T("Objetos","Предметы")}</span>` + (S.inv.length ? S.inv.map(id =>
    `<button class="cq-item${id===newId?" new":""}" data-it="${id}" aria-pressed="${selected===id}" title="${esc(items[id].n)}" aria-label="${esc(items[id].n)}">${itemIcon(id)}</button>`).join("")
    : `<span class="cq-empty">${T("Todavía nada.","Пока ничего.")}</span>`);
  root.classList.toggle("using", !!selected);
}
const has = id => S.inv.includes(id);
function give(id){ if (!has(id)) S.inv.push(id); drawInv(id); toast(`<b>+ ${esc(ITEMS()[id].n)}</b>`); save(); }
function take(id){ S.inv = S.inv.filter(x => x !== id); if (selected === id) selected = null; drawInv(); save(); }

/* ---------- save ---------- */
function save(){ try { localStorage.setItem(KEY, JSON.stringify(S)); } catch(e){} }
function load(){ try { return JSON.parse(localStorage.getItem(KEY)); } catch(e){ return null; } }
function wipe(){ try { localStorage.removeItem(KEY); } catch(e){} }

/* ---------- stage helpers ---------- */
function setBg(key, opt = {}){
  const urls = BG[key] || [];
  bgEl.style.backgroundImage = urls.map(u => `url("${u}")`).join(",") || "none";
  bgEl.style.backgroundSize = opt.size || "cover";
  bgEl.style.backgroundPosition = opt.pos || "center";
  bgEl.classList.remove("zoom"); void bgEl.offsetWidth; if (opt.zoom) bgEl.classList.add("zoom");
  fx(opt.fx || "");
}
function fx(cls){ fxEl.className = "cq-fx " + (cls || ""); }
async function hit(kind, ms = 900){ stage.classList.remove(kind); void stage.offsetWidth; stage.classList.add(kind); await sleep(ms); stage.classList.remove(kind); }
function sprites(list){
  sprEl.innerHTML = (list || []).map(s => `<img src="${BASE+SPR[s.k].f}" alt="" style="left:${s.x}%;bottom:${s.b ?? 2}%;height:${s.h || 78}%" class="${s.flip ? "flip" : ""}">`).join("");
}
function chapter(t){ chEl.textContent = t; }
function hint(t){ S.hint = t; }
let toastT;
function toast(html, ms = 2600){
  const old = stage.querySelector(".cq-toast"); if (old) old.remove();
  const d = document.createElement("div"); d.className = "cq-toast"; d.innerHTML = html; stage.appendChild(d);
  clearTimeout(toastT); toastT = setTimeout(() => d.remove(), ms);
}
function face(w){
  if (!w) return "";
  if (w.e) return `<div class="cq-face">${w.e}</div>`;
  const sp = SPR[w.s]; const r = 1100 / sp.w, z = sp.z;
  const px = Math.max(0, Math.min(100, (sp.cx * z - .5) / (z - 1) * 100)), py = Math.max(0, (.004 * z * r) / (z * r - 1) * 100);
  return `<div class="cq-face" style="background-image:url(${BASE+sp.f});background-size:${z*100}% auto;background-position:${px}% ${py}%"></div>`;
}

/* ---------- dialogue ---------- */
function idle(text){ dlgEl.className = "cq-dlg idle"; dlgEl.innerHTML = `<div class="cq-txt">${esc(text || T("¿Qué hacemos? Tocá la escena o un objeto.","Что делаем? Нажмите на сцену или предмет."))}</div>`; }
function say(who, text){
  const tok = run;
  return new Promise(res => {
    const w = who ? WHO()[who] : null;
    dlgEl.className = "cq-dlg";
    dlgEl.innerHTML = `${face(w)}<div class="cq-say">${w ? `<div class="cq-name">${esc(w.n)}</div>` : ""}<div class="cq-txt"></div></div>`;
    const tx = dlgEl.querySelector(".cq-txt");
    const full = w ? text : `<i>${esc(text)}</i>`;
    let i = 0, done = false; const plain = w ? text : null;
    const show = () => { tx.innerHTML = (w ? esc(text) : full) + `<span class="cq-more">▸</span>`; done = true; };
    const step = () => { if (tok !== run || done) return; i += 2; if (i >= text.length) return show(); tx.innerHTML = w ? esc(plain.slice(0, i)) : `<i>${esc(text.slice(0, i))}</i>`; setTimeout(step, 14); };
    step();
    const next = e => {
      if (e.type === "keydown" && !(e.key === "Enter" || e.key === " " || e.key === "ArrowRight")) return;
      if (e.type === "keydown") e.preventDefault();
      if (!done) { show(); return; }
      dlgEl.removeEventListener("click", next); stage.removeEventListener("click", next); document.removeEventListener("keydown", next);
      if (tok === run) res();
    };
    setTimeout(() => { dlgEl.addEventListener("click", next); stage.addEventListener("click", next); document.addEventListener("keydown", next); }, 120);
  });
}
const N = text => say(null, text);
async function talk(lines){ for (const [w, es, ru] of lines) await say(w, T(es, ru)); }
function choose(opts, who, prompt){
  const tok = run;
  return new Promise(res => {
    const w = who ? WHO()[who] : null;
    dlgEl.className = "cq-dlg"; dlgEl.style.cursor = "default";
    dlgEl.innerHTML = `${face(w)}<div class="cq-say">${w ? `<div class="cq-name">${esc(w.n)}</div>` : ""}${prompt ? `<div class="cq-txt">${esc(prompt)}</div>` : ""}<div class="cq-chs">${opts.map((o, i) => `<button data-i="${i}"${o.off ? " disabled" : ""}>${esc(o.t || o)}</button>`).join("")}</div></div>`;
    dlgEl.querySelectorAll("button").forEach(b => b.onclick = e => { e.stopPropagation(); dlgEl.style.cursor = ""; if (tok === run) res(+b.dataset.i); });
    const f = dlgEl.querySelector("button:not([disabled])"); if (f && matchMedia("(hover:hover)").matches) f.focus({preventScroll:true});
  });
}

/* ---------- rooms (hotspots) ---------- */
function pickSpot(spots){
  const tok = run;
  return new Promise(res => {
    idle(S.hintIdle);
    spotEl.innerHTML = "";
    spots.filter(s => !s.when || s.when()).forEach(s => {
      const b = document.createElement("button"); b.className = "cq-spot";
      Object.assign(b.style, {left:s.x+"%", top:s.y+"%", width:s.w+"%", height:s.h+"%"});
      b.innerHTML = `<span>${esc(s.l)}</span>`; b.setAttribute("aria-label", s.l);
      b.onclick = e => { e.stopPropagation(); if (tok !== run) return; spotEl.innerHTML = ""; onInvPick = null; res({spot:s, item:selected}); };
      spotEl.appendChild(b);
    });
    onInvPick = (id, again) => { if (again) { spotEl.innerHTML = ""; onInvPick = null; res({inv:id}); } };
  });
}
const NOPE = () => [T("Eso no sirve acá.","Здесь это не поможет."), T("Mmm… no. No creo.","Хм… нет. Не думаю."), T("Eso no es buena idea. Ni siquiera para mí.","Плохая идея. Даже для меня.")];
async function room(getSpots, isDone, combos = {}){
  while (true){
    const r = await pickSpot(getSpots());
    if (r.inv){ // second tap on an item: describe it, or combine
      const it = ITEMS()[r.inv]; selected = null; drawInv();
      if (combos[r.inv + ":self"]) { const x = await combos[r.inv + ":self"](); if (x === "exit") return; }
      else await say(null, `${it.n}. ${it.d}`);
      if (isDone && isDone()) return; continue;
    }
    const s = r.spot, item = r.item; selected = null; drawInv();
    let out;
    if (item){ const h = s.use && s.use[item]; if (h) out = await h(); else { const n = NOPE(); await say("luis", n[Math.floor(Math.random()*n.length)]); } }
    else if (s.go) out = await s.go();
    if (out === "exit") return;
    if (isDone && isDone()) return;
  }
}

/* ---------- overlays & minigames ---------- */
function overlay(html){ ovEl.innerHTML = html; ovEl.classList.add("on"); dlgEl.style.visibility = "hidden"; return ovEl; }
function closeOv(){ ovEl.classList.remove("on"); ovEl.innerHTML = ""; dlgEl.style.visibility = ""; }
function card(title, body, btn){
  return new Promise(res => {
    overlay(`<div class="cq-card">${title ? `<h2>${esc(title)}</h2>` : ""}${body}<div><button class="cq-btn">${esc(btn || T("Seguir","Дальше"))}</button></div></div>`);
    ovEl.querySelector(".cq-btn").onclick = e => { e.stopPropagation(); closeOv(); res(); };
  });
}
// Quick-time event: one prompt, options [{t,k,ok}], ms. Resolves true/false.
function qte(q, opts, ms, extra = ""){
  const tok = run;
  return new Promise(res => {
    overlay(`<div class="cq-card cq-qte" style="background:rgba(10,6,4,.78)"><div class="cq-q">${esc(q)}</div><div class="cq-opts">${opts.map((o,i)=>`<button data-i="${i}">${esc(o.t)}</button>`).join("")}</div><div class="cq-bar"><i></i></div>${extra}</div>`);
    const bar = ovEl.querySelector(".cq-bar i"); bar.style.transition = `width ${ms}ms linear`; requestAnimationFrame(() => requestAnimationFrame(() => bar.style.width = "0%"));
    let over = false;
    const end = ok => { if (over) return; over = true; clearTimeout(tm); document.removeEventListener("keydown", key); closeOv(); if (tok === run) res(ok); };
    const tm = setTimeout(() => end(false), ms);
    const key = e => { const i = opts.findIndex(o => o.k === e.key); if (i >= 0) { e.preventDefault(); end(!!opts[i].ok); } };
    document.addEventListener("keydown", key);
    ovEl.querySelectorAll("button").forEach(b => b.onclick = e => { e.stopPropagation(); end(!!opts[+b.dataset.i].ok); });
  });
}
const DIRS = () => ({l:{t:"⬅ "+T("Izquierda","Влево"),k:"ArrowLeft"}, u:{t:"⬆ "+T("Saltar","Прыжок"),k:"ArrowUp"}, r:{t:T("Derecha","Вправо")+" ➡",k:"ArrowRight"}});
async function dodgeRun(rounds, needed, ms, onWin){
  let ok = 0, hearts = 3;
  while (ok < needed){
    const r = rounds[(ok + 3 - hearts) % rounds.length];
    const D = DIRS(); const opts = ["l","u","r"].map(k => Object.assign({}, D[k], {ok: k === r.a}));
    const won = await qte(r.q, opts, ms, `<div class="cq-hearts">${"❤️".repeat(hearts)}${"🖤".repeat(3-hearts)}</div><div class="cq-prog">${ok} / ${needed}</div>`);
    if (won){ ok++; if (onWin) await onWin(ok); }
    else { hearts--; await hit("shake", 500); toast(`<b>${T("¡BUM!","БУМ!")}</b> ${T("Casi…","Чуть не…")}`, 1200);
      if (hearts <= 0){ await N(T("El golpe pasa rozando. Respirá y probá de nuevo.","Удар проходит совсем рядом. Переведите дух и попробуйте ещё раз.")); hearts = 3; } }
  }
}
function cubeCombo(seq){
  const tok = run;
  return new Promise(async res => {
    const cols = {L1:"#c62828",R1:"#1565c0",U1:"#f9a825",L2:"#ef6c00",R2:"#2e7d32",U2:"#eeeeee"};
    overlay(`<div class="cq-card"><h2>${T("El cubo de Luis","Кубик Луиса")}</h2><p>${T("Mirá la combinación y repetila.","Запомните комбинацию и повторите её.")}</p><div class="cq-seq"></div><div class="cq-pad">${Object.keys(cols).map(k=>`<button data-k="${k}" style="background:${cols[k]}" disabled>${k}</button>`).join("")}</div><p class="cq-prog"></p></div>`);
    const sq = ovEl.querySelector(".cq-seq"), btns = [...ovEl.querySelectorAll(".cq-pad button")], pr = ovEl.querySelector(".cq-prog");
    const demo = async () => { btns.forEach(b => b.disabled = true); sq.textContent = ""; for (const k of seq){ await sleep(650); if (tok !== run) return; sq.textContent += (sq.textContent ? " " : "") + k + "…"; } await sleep(900); sq.textContent = "· · · · ·".slice(0, seq.length*2-1); btns.forEach(b => b.disabled = false); pr.textContent = T("Tu turno: girá las caras.","Ваш ход: поверните грани."); };
    let pos = 0; await demo();
    btns.forEach(b => b.onclick = async e => {
      e.stopPropagation();
      if (b.dataset.k === seq[pos]){ pos++; sq.textContent = seq.slice(0,pos).join(" ") + (pos < seq.length ? " …" : ""); if (pos === seq.length){ pr.textContent = T("¡Clic!","Щёлк!"); await sleep(600); closeOv(); if (tok === run) res(); } }
      else { pos = 0; pr.textContent = T("Clic… nada. Otra vez.","Щёлк… ничего. Ещё раз."); await sleep(700); await demo(); }
    });
  });
}
function southernCross(){
  const tok = run;
  return new Promise(res => {
    const cross = [[50,18],[50,78],[36,46],[64,42],[56,58]];
    const other = [[12,20],[20,70],[30,12],[78,16],[86,62],[72,80],[16,44],[90,34],[40,88],[68,26],[26,58],[82,48]];
    const all = cross.map((p,i)=>({p,c:1,s:i===4?7:12})).concat(other.map(p=>({p,c:0,s:5+((p[0]+p[1])%4)}))).sort((a,b)=>a.p[0]-b.p[0]);
    overlay(`<div class="cq-card"><h2>${T("Verificación por estrellas","Проверка по звёздам")}</h2><p>${T("La Yugopedia solo se abre ante la Cruz del Sur. Tocá sus cinco estrellas.","Югопедия открывается только перед Южным Крестом. Нажмите на пять его звёзд.")}</p><div class="cq-sky">${all.map((s,i)=>`<button class="cq-star" data-c="${s.c}" style="left:${s.p[0]}%;top:${s.p[1]}%;width:${s.s}px;height:${s.s}px" aria-label="★"></button>`).join("")}</div><p class="cq-prog">0 / 5</p></div>`);
    let n = 0; const pr = ovEl.querySelector(".cq-prog");
    ovEl.querySelectorAll(".cq-star").forEach(b => b.onclick = async e => {
      e.stopPropagation(); if (b.classList.contains("on")) return;
      if (b.dataset.c === "1"){ b.classList.add("on"); n++; pr.textContent = n + " / 5"; if (n === 5){ pr.textContent = T("✦ Acceso concedido ✦","✦ Доступ разрешён ✦"); await sleep(900); closeOv(); if (tok === run) res(); } }
      else { ovEl.querySelectorAll(".cq-star.on").forEach(x => x.classList.remove("on")); n = 0; pr.textContent = T("Esa no es de la Cruz del Sur. De nuevo.","Это звезда не из Южного Креста. Заново.");}
    });
  });
}
function watchMenu(steps){
  const tok = run;
  return new Promise(res => {
    let i = 0;
    const draw = msg => {
      const st = steps[i];
      overlay(`<div class="cq-watch"><div class="t">${esc(st.t)}</div>${st.o.map((o,k)=>`<button data-k="${k}">${esc(o.t)}</button>`).join("")}<div class="msg">${esc(msg || "")}</div></div>`);
      ovEl.querySelectorAll(".cq-watch button").forEach(b => b.onclick = async e => {
        e.stopPropagation(); const o = st.o[+b.dataset.k];
        if (o.ok){ i++; if (i === steps.length){ closeOv(); if (tok === run) res(); } else draw(); }
        else draw(o.m);
      });
    };
    draw();
  });
}
function catchCube(ms){
  const tok = run;
  return new Promise(res => {
    const b = document.createElement("button"); b.className = "cq-target"; b.innerHTML = RUBIK(); b.setAttribute("aria-label", T("El cubo","Кубик"));
    stage.appendChild(b);
    const pts = [[38,40],[52,30],[45,55],[60,42],[35,60],[55,62]]; let k = 0;
    const move = () => { const p = pts[k++ % pts.length]; b.style.left = p[0]+"%"; b.style.top = p[1]+"%"; };
    move(); const iv = setInterval(move, 600);
    const end = ok => { clearInterval(iv); clearTimeout(tm); b.remove(); if (tok === run) res(ok); };
    const tm = setTimeout(() => end(false), ms);
    b.onclick = e => { e.stopPropagation(); end(true); };
  });
}
function pageView(glow){
  return new Promise(res => {
    const svg = `<svg viewBox="0 0 100 100" aria-hidden="true"><defs><radialGradient id="cqg"><stop offset="0" stop-color="#d8261b" stop-opacity=".55"/><stop offset="1" stop-color="#d8261b" stop-opacity="0"/></radialGradient></defs>
      ${Array.from({length:18},(_,i)=>`<line x1="50" y1="40" x2="${50+40*Math.cos(i/18*6.283)}" y2="${40+30*Math.sin(i/18*6.283)}" stroke="#9a6b2c" stroke-width=".4" opacity=".6"/>`).join("")}
      <circle cx="50" cy="40" r="17" fill="${glow?"url(#cqg)":"none"}" stroke="#5a3214" stroke-width="1"/>
      <path d="M38 33c2 6 5 8 12 8s10-2 12-8c-3 3-6 4-8 4l-4 2-4-2c-2 0-5-1-8-4z M44 41c0 6 2 10 6 12 4-2 6-6 6-12z" fill="#5a3214"/>
      <circle cx="47" cy="44" r="1" fill="${glow?"#ff3b2b":"#e9d7aa"}"/><circle cx="53" cy="44" r="1" fill="${glow?"#ff3b2b":"#e9d7aa"}"/>
      ${Array.from({length:7},(_,i)=>{const a=-1.57+i/7*6.283;return `<circle cx="${50+22*Math.cos(a)}" cy="${40+22*Math.sin(a)}" r="1.8" fill="${glow?"#e0281c":"#5a3214"}"/>`}).join("")}
      <path d="M14 78h10v-6h4v6h6v-9h5v9h8M60 78h8v-7h5v7h6v-5h4v5h5" fill="none" stroke="#7a4a1c" stroke-width=".8"/>
      <text x="50" y="68" font-size="3.4" text-anchor="middle" fill="#6b3d17" font-family="serif">ΤΑVRAN · ᛏ ᚢ ᚱ · 𐌕𐌀𐌖</text></svg>`;
    overlay(`<div class="cq-card" style="background:transparent;border:0;box-shadow:none;padding:0"><div class="cq-page${glow?" glow":""}"><img src="${BASE}pagina.jpg" alt="" onerror="this.outerHTML=this.dataset.f" data-f="${esc(svg + '<div class=note>Hay que coger el toro por las astas</div>')}"></div><div><button class="cq-btn">${T("Cerrar","Закрыть")}</button></div></div>`);
    ovEl.querySelector(".cq-btn").onclick = e => { e.stopPropagation(); closeOv(); res(); };
  });
}
function findButton(){
  const tok = run;
  return new Promise(res => {
    const fb = `<svg viewBox="0 0 160 90" style="width:100%;height:100%"><defs><linearGradient id="cqh" x1="0" x2="1"><stop offset="0" stop-color="#2b1a14"/><stop offset=".5" stop-color="#6b4632"/><stop offset="1" stop-color="#1a0d08"/></linearGradient></defs>
      <path d="M-5 95 C30 60 60 40 110 30 C135 25 150 12 158 0 L170 0 L170 95 Z" fill="url(#cqh)"/>
      ${Array.from({length:14},(_,i)=>`<path d="M${10+i*11} ${88-i*4} q6 -8 3 -16" stroke="#d8261b" stroke-width=".8" fill="none" opacity=".7"/>`).join("")}
      <path d="M20 90 C40 70 55 66 72 60" stroke="#e2b45a" stroke-width="10" stroke-linecap="round" fill="none" opacity=".35"/>
      <g transform="translate(96,40) rotate(-14)"><rect x="-9" y="-4" width="18" height="8" rx="1.5" fill="#9aa0a6" stroke="#333" stroke-width=".6"/><text x="0" y="1.4" font-size="2.3" text-anchor="middle" font-family="monospace" fill="#111">HACERLO MANSITO</text></g></svg>`;
    overlay(`<div class="cq-card" style="max-width:800px"><p>${T("El mundo da vueltas. Buscá algo raro en el cuerno.","Мир вращается. Найдите на роге что-то странное.")}</p><div class="cq-horn"><img src="${BASE}boton.jpg" alt="" onerror="this.outerHTML=this.dataset.f" data-f="${esc(fb)}"><button class="hit" style="left:51%;top:35%;width:17%;height:22%" aria-label="?"></button></div><p class="cq-prog">&nbsp;</p></div>`);
    const horn = ovEl.querySelector(".cq-horn"), pr = ovEl.querySelector(".cq-prog");
    const im = horn.querySelector("img");
    if (im) im.addEventListener("load", () => { const h = horn.querySelector(".hit"); Object.assign(h.style, {left:"30%", top:"25%", width:"40%", height:"50%"}); });
    const lines = [T("Piedra…","Камень…"), T("Piedra caliente…","Горячий камень…"), T("¿Metal?","Металл?")]; let n = 0;
    horn.onclick = e => { e.stopPropagation(); pr.textContent = lines[Math.min(n++, 2)]; };
    horn.querySelector(".hit").onclick = e => { e.stopPropagation(); closeOv(); if (tok === run) res(); };
  });
}

/* ---------- scenes ---------- */
const ORDER = ["refugio","atocha","lavapies","lavapies2","toreros","margaritas","sala","tauran","colon","final"];
const SC = {};

SC.prologo = async () => {
  chapter(T("Prólogo","Пролог")); setBg("titulo", {fx:"dark", zoom:true}); sprites([]);
  await N(T("Madrid se despertó distinta de como se había dormido.","Мадрид проснулся не таким, каким заснул."));
  await N(T("A las tres de la madrugada, en la noche de carnaval, siete luces brillantes aparecieron sobre el oeste de la ciudad. Cayeron. No hubo explosiones. Y entonces la gente empezó a cambiar.","Около трёх часов ночи, в ночь карнавала, над западной частью города появились семь ярких огней. Они упали. Взрывов не было. А затем люди начали меняться."));
  await talk([
    ["sec","Unos se disfrazan de toreros. Otros adoran a un toro de bronce. Lo llaman el Gran Cornudo.","Одни переодеваются тореадорами. Другие поклоняются бронзовому быку. Называют его Великим Рогатым."],
    ["mar","¿Y los tomates? ¿Al menos no adoran a los tomates?","А помидоры? Им хотя бы не поклоняются?"],
    ["sec","Por ahora, no.","Пока нет."],
    ["mar","Excelente. Eso ya es progreso.","Отлично. Уже прогресс."],
    ["mar","Mi España… mi querida España. Otra vez víctima de la Alianza del Norte. Necesitamos a nuestro mejor agente.","Моя Испания… Моя любимая Испания. И опять ты стала жертвой Северного альянса. Нам нужен наш лучший агент."],
    ["jefe","Se retiró. Dijo que nunca más trabajaría para nosotros.","Он ушёл. Сказал, что больше никогда не будет работать на нас."],
    ["mar","Le haremos una oferta que no podrá rechazar. Necesitamos a Luis Fader.","Мы сделаем ему предложение, от которого он не сможет отказаться. Нам нужен Луис Фадер."]
  ]);
  await N(T("En Belgrado, Luis estudiaba filosofía y comía milanesa a la napolitana. Dijo «no» varias veces. Después le mostraron un documento con la firma del presidente.","В Белграде Луис изучал философию и ел миланесу по-неаполитански. Он несколько раз сказал «нет». А потом ему показали документ с подписью президента."));
  await N(T("Nadie sabe qué decía ese papel. Pero esta vez Luis no dijo «no». Y Natasha, por supuesto, fue con él.","Никто не знает, что было написано в той бумаге. Но на этот раз Луис не сказал «нет». А Наташа, конечно, поехала с ним."));
};

SC.refugio = async () => {
  chapter(T("I · La casa segura","I · Безопасный дом")); setBg("refugio"); sprites([]);
  hint(T("Juntá lo que Luis necesita antes de salir: mirá bien la mesa.","Соберите всё, что нужно Луису перед выходом: внимательно осмотрите стол."));
  if (!S.f.refIntro){
    await talk([
      ["luis","¡Qué noche me hiciste pasar…!","Ну и ночь ты мне устроила…"],
      ["nat","Las quejas se aceptan de nueve a diez.","Жалобы принимаются с девяти до десяти."],
      ["nat","Soy tu reina. Todas las noches conmigo tienen que ser así. No hay vuelta atrás.","Я твоя королева. Все ночи со мной должны быть именно такими. Обратного пути нет."],
      ["luis","Tenemos una misión. Calle Atocha. La gente camina en grupos, como en una procesión sin fin.","У нас задание. Улица Аточа. Люди двигаются группами, как бесконечная процессия."],
      ["nat","Ni siquiera tomaste el café.","Даже кофе не выпил."]
    ]);
    S.f.refIntro = 1; save();
  }
  const need = ["cubo","tablet","telefono","reloj"];
  await room(() => [
    {x:24,y:46,w:23,h:22,l:T("Tablet","Планшет"), when:()=>!has("tablet"), go: async () => { give("tablet"); await talk([
      ["luis","Interesante aparato. Mide el fondo místico. Antes yo tenía que sentir la dirección; ahora dibuja el mapa.","Интересная штука. Измеряет мистический фон. Раньше мне приходилось чувствовать направление источника. Теперь прибор строит карту."],
      ["nat","¿Y eso rojo?","Что это красное?"],
      ["luis","La actividad más fuerte. Atocha… y Chueca, donde los hombres no se sacan el traje de torero ni de noche.","Самая сильная активность. Аточа… и Чуэка, где мужчины не снимают костюмы тореадоров даже ночью."]]); }},
    {x:57.5,y:76,w:12,h:13,l:T("Teléfono","Телефон"), when:()=>!has("telefono"), go: async () => { give("telefono"); await say("luis", T("Mi teléfono. Con algunas… funciones extra.","Мой телефон. С некоторыми… дополнительными функциями.")); }},
    {x:67.5,y:68,w:8.5,h:14,l:T("Cubo de Rubik","Кубик Рубика"), when:()=>!has("cubo"), go: async () => { give("cubo"); await talk([
      ["luis","Parece un cubo de Rubik normal.","Похож на обычный кубик Рубика."],
      ["nat","Solo lo parece. Ese yo lo agarro con guante.","Только похож. Этот я беру только в перчатке."]]); }},
    {x:77,y:71,w:10.5,h:12,l:T("Reloj negro","Чёрные часы"), when:()=>!has("reloj"), go: async () => { give("reloj"); await say("luis", T("El reloj negro. Tiene un menú para cada tipo de situación. Ojalá no lo necesite.","Чёрные часы. У них есть меню для любого типа ситуации. Надеюсь, не понадобятся.")); }},
    {x:0,y:73,w:16,h:20,l:T("Billetera","Бумажник"), when:()=>!has("cartera"), go: async () => { give("cartera"); await say("luis", T("La billetera. Tarjeta, carnet serbio, el ticket del buffet de Filosofía… y algo que nunca saco.","Бумажник. Карточка, сербское удостоверение, чек из буфета философского факультета… и кое-что, что я никогда не достаю.")); }},
    {x:54,y:57,w:9,h:11,l:T("Café","Кофе"), go: async () => { S.f.cafe = 1; await talk([
      ["nat","Huevos, pan tostado, queso, fruta y café fuerte. Desayuno de reina.","Яйца, поджаренный хлеб, сыр, фрукты и крепкий кофе. Королевский завтрак."],
      ["luis","Ahora sí puedo salvar España.","Вот теперь можно спасать Испанию."]]); }},
    {x:59,y:39,w:7,h:16,l:T("Bolso","Сумка"), go: () => N(T("El bolso de Luis. Ahí van el cubo y unos aparatos cuyo origen es mejor no averiguar.","Сумка Луиса. Внутри кубик и несколько устройств, происхождение которых лучше не выяснять.")) },
    {x:60,y:0,w:10,h:22,l:T("Mapa","Карта"), go: () => N(T("Un mapa de Madrid. Siete puntos marcados en rojo. Siete luces, siete caídas, siete focos de locura.","Карта Мадрида. Семь красных точек. Семь огней, семь мест падения, семь очагов безумия.")) },
    {x:28,y:0,w:16,h:44,l:T("Salir a la calle","Выйти на улицу"), go: async () => {
      if (!need.every(has)) { await say("luis", T("Me falta algo. Sin el cubo, la tablet, el teléfono y el reloj no salgo ni a comprar pan.","Чего-то не хватает. Без кубика, планшета, телефона и часов я даже за хлебом не выйду.")); return; }
      await talk([["nat","¿Llamamos a Zmaj, por las dudas?","Может, позовём Змая на всякий случай?"],["luis","Si hace falta, lo llamamos.","Если понадобится — позовём."],["nat","…Sí. Claro.","…Да. Конечно."]]);
      return "exit"; }}
  ]);
};

SC.atocha = async () => {
  chapter(T("II · Calle Atocha","II · Улица Аточа")); setBg("atocha", {zoom:true}); sprites([]);
  hint(T("Esquivá los obstáculos: flechas del teclado o botones.","Уворачивайтесь: стрелки на клавиатуре или кнопки."));
  await N(T("Gritos. La gente corre por Atocha: unos en ropa normal, otros disfrazados, algunos con traje de torero. Ríen y miran hacia atrás, como si fuera parte de una fiesta enorme.","Крики. По Аточе бегут люди: в обычной одежде, в карнавальных костюмах, в костюмах тореадоров. Они смеются и оглядываются, словно всё это часть огромного праздника."));
  await say("mob", "¡El toro! ¡El toro!");
  await hit("shake"); await N(T("BUM. BUM. BUM.","БУМ. БУМ. БУМ."));
  await talk([
    ["nat","Luis… es una estatua.","Луис… Это статуя."],
    ["luis","Ya veo. Es uno de los toros de bronce del Palacio Vistalegre.","Вижу. Это один из бронзовых быков у дворца Висталегре."],
    ["nat","¿Y está lejos de aquí?","И далеко он должен находиться отсюда?"],
    ["luis","Lo bastante como para no venir corriendo solo.","Достаточно далеко, чтобы точно не прибежать сюда самостоятельно."]]);
  await hit("shake"); await N(T("¡BA-BAM! El toro arranca una señal de tránsito.","БА-БАХ! Бык сносит дорожный знак."));
  await say("nat", T("Ahora, obviamente, es independiente.","Теперь он, очевидно, самостоятельный."));
  await say("luis", T("Me mira. No me gusta cómo me mira… ¡CORRAMOS!","Он смотрит на нас. Мне не нравится, как он смотрит… БЕЖИМ!"));
  const rounds = [
    {q:T("¡Un contenedor a la derecha!","Контейнер справа!"), a:"l"},
    {q:T("¡Una bicicleta tirada!","Перевёрнутый велосипед!"), a:"u"},
    {q:T("¡Un cartel publicitario a la izquierda!","Рекламный щит слева!"), a:"r"},
    {q:T("¡El toro embiste por la izquierda!","Бык атакует слева!"), a:"r"},
    {q:T("¡Un coche cruzado a la derecha!","Машина поперёк дороги справа!"), a:"l"}
  ];
  const lines = [
    [["luis","¡Necesitamos a Zmaj!","Нам нужен Змай!"],["nat","¡No va a poder venir!","Не получится!"]],
    [["luis","¡¿Por qué?!","Почему?!"],["nat","¡Está de vacaciones!","Он в отпуске!"]],
    [["luis","¡¿UN DRAGÓN DE VACACIONES?!","У ДРАКОНА ОТПУСК?!"],["nat","¡No grites! ¡También tiene derechos! Le di tres días.","Не кричи! У него тоже есть права! Я дала ему три дня!"]],
    [["luis","¡¿Y DÓNDE ESTÁ?!","И ГДЕ ОН?!"],["nat","¡En Crimea! Hace mucho que quería visitar a su amiga. Una dragona.","В Крыму! Он давно хотел навестить свою подругу. Драконицу."]],
    [["luis","¡¿Mandaste a nuestro único dragón a Crimea justo cuando venimos a investigar una anomalía mística?!","Ты отправила нашего единственного дракона в Крым именно тогда, когда мы приехали расследовать мистическую аномалию?!"],["nat","¡Zmaj también tiene derecho a una vida privada!","У Змая тоже должна быть личная жизнь!"]]
  ];
  await dodgeRun(rounds, 5, 2600, async k => { await talk(lines[k-1]); });
  await N(T("Adelante, la multitud se detiene de golpe: decenas de madrileños parados hombro con hombro, con la cara vacía. Detrás, el toro de bronce.","Впереди толпа неожиданно остановилась: десятки мадридцев стоят плечом к плечу с совершенно пустыми лицами. Позади — бронзовый бык."));
  await say("nat", T("Espero que tengas otro plan.","Надеюсь, у тебя есть другой план."));
  await choose([{t:T("Girar el cubo de Rubik","Повернуть грани кубика")}], "luis");
  await N(T("Clic. Clic.","Щёлк. Щёлк."));
  await talk([["luis","Hay uno.","Есть."],["nat","¿Cuál?","Какой?"],["luis","Ahora lo vamos a saber.","Сейчас узнаем."]]);
  await hit("flash");
  await N(T("Todo se mezcló: la multitud se dispersó, el toro cambió de rumbo y ellos doblaron por un callejón, y otro, y otro, entre balcones con ropa tendida y cafés cerrados…","Всё смешалось: толпа ринулась в разные стороны, бык сменил направление, а они свернули в переулок, потом ещё в один и ещё — между балконами с бельём и закрытыми кафе…"));
};

SC.lavapies = async () => {
  chapter(T("III · Lavapiés","III · Лавапьес")); setBg("lavapies"); sprites([{k:"luis",x:38,h:72,b:6},{k:"nata",x:60,h:70,b:6}]);
  await talk([
    ["luis","Uf… paremos… un minuto.","Всё… на минуту… остановимся."],
    ["nat","Si me hubieras avisado que el paseo por Madrid incluía huir de una escultura viva, me habría puesto otro calzado.","Если бы ты предупредил, что экскурсия по Мадриду включает бегство от ожившей скульптуры, я бы надела другую обувь."],
    ["luis","Lo admito. No podemos depender siempre de Zmaj.","Ладно. Признаю. Мы не можем всё время зависеть от Змая."],
    ["nat","¿Como en nuestro primer encuentro en Belgrado?","Как в нашу первую встречу в Белграде?"],
    ["luis","Exacto.","Именно."]]);
  await N(T("Él la abraza por la cintura. Por unos segundos, el Madrid enloquecido desaparece. Se besan… y Natasha abre los ojos de golpe.","Луис обнимает её за талию. На несколько секунд безумный Мадрид исчезает. Они целуются… и вдруг Наташа резко распахивает глаза."));
  await say("nat", T("Esperá…","Подожди…"));
  setBg("estatuas", {zoom:true}); sprites([]);
  await N(T("Por la calle avanzan estatuas. Bronce y piedra: un viejo noble madrileño, una mujer de capa larga, un militar severo que arrastra su pedestal roto sacando chispas. Lentas. Solemnes. Imparables.","По улице к ним двигались статуи. Бронзовые и каменные: старый мадридский дворянин, женщина в длинном плаще, суровый военный, волочащий отломанный пьедестал и выбивающий искры. Медленно. Торжественно. Неумолимо."));
  await N(T("Natasha extiende la mano y se concentra. Una estatua se estremece… se detiene… y vuelve a avanzar.","Наташа вытягивает руку и сосредотачивается. Одна статуя вздрагивает… замирает… и снова идёт вперёд."));
  await talk([
    ["nat","No… con ellas no funciona. Mi fuerza interior sirve cuando hay un lazo emocional. Memoria. Dolor.","Нет… с ними так не получится. Моё внутреннее воздействие работает, когда есть эмоциональная связь. Память. Боль."],
    ["nat","Cuando recuerdo las bombas que caían cuando yo tenía catorce años, me alcanza con pensarlo para empujar, romper. Ahora no siento nada. Solo una fuerza ajena.","Когда я вспоминаю бомбы, которые сбрасывали, когда мне было четырнадцать, мне достаточно только подумать — и я могу давить, ломать. А сейчас я не чувствую ничего. Только чужую силу."],
    ["luis","Entonces probemos de otra manera.","Тогда попробуем по-другому."]]);
  hint(T("Repetí la combinación que dice Luis.","Повторите комбинацию, которую называет Луис."));
  await cubeCombo(["L1","R1","U2","L2","R2"]);
  await hit("flash");
  await N(T("Un rayo plateado golpea al hombre de bronce del bastón. Una grieta luminosa le cruza el pecho… y se cierra sola.","Серебристый луч бьёт в бронзового мужчину с тростью. По его груди проходит светящаяся трещина… и медленно смыкается."));
  await say("luis", T("No. No funcionó. Hoy la ciudad decidió probar cuánta paciencia tengo.","Нет. Не сработало. Похоже, сегодня город решил проверить, сколько у меня терпения."));
  await hit("shake");
  await N(T("Entonces se oyen cascos de metal. El toro de bronce vuelve… pero ahora alguien lo monta, agarrándolo por los cuernos.","И тут раздаётся знакомый удар металлических копыт. Бронзовый бык возвращается… но теперь на нём сидит человек, держащий его за рога."));
  await talk([
    ["agl","Atrás. Vuelvan a sus lugares.","Назад. Возвращайтесь на свои места."]]);
  await N(T("Y las estatuas obedecen. Una a una se van. La mujer de bronce gira la cabeza un instante hacia Natasha antes de desaparecer.","И статуи подчиняются. Одна за другой они уходят. Бронзовая женщина на секунду поворачивает голову к Наташе — и исчезает среди домов."));
  setBg("lavapies"); sprites([{k:"luis",x:28,h:72,b:6},{k:"nata",x:44,h:70,b:6},{k:"agl",x:74,h:84,b:4}]);
  await talk([
    ["luis","Impresionante.","Впечатляет."],
    ["agl","Me alegra haber llegado a tiempo.","Рад, что успел вовремя."],
    ["nat","¿Y usted quién es?","А вы кто такой?"],
    ["agl","Pueden llamarme agente L.","Можете называть меня агент Л."],
    ["luis","Me gusta esa letra.","Мне нравится эта буква."],
    ["agl","Normalmente o la aman o la temen.","Обычно её либо любят, либо боятся."]]);
  const asked = {};
  while (true){
    const q = await choose([
      {t:T("«¿Quién le encargó esta misión?»","«Кто вам поручил такую миссию?»"), off:asked[0]},
      {t:T("«¿Para qué organización trabaja?»","«На кого вы работаете?»"), off:asked[1]},
      {t:T("«¿Somos aliados, enemigos o qué?»","«Мы союзники, враги или что?»")}], "luis");
    asked[q] = 1;
    if (q === 0) await talk([["agl","Mi jefe. El señor Petrović.","Мой начальник. Господин Петрович."]]);
    if (q === 1) await talk([["agl","Es una estructura secreta. Se llama «El Legado de Pedro».","Это секретная структура. Она называется «Наследие Педро»."],["nat","Perdón… ¿qué?","Простите… что?"],["agl","«El Legado de Pedro».","«Наследие Педро»."],["nat","¿Es un chiste?","Это шутка?"],["agl","No.","Нет."]]);
    if (q === 2) break;
  }
  await N(T("Algo zumba sobre sus cabezas. Un enjambre… pero no de insectos. Cientos de margaritas blancas vuelan en formación militar hacia el centro.","Над головами что-то загудело. Рой… но не насекомых. Сотни белых маргариток летят военным строем в сторону центра."));
  await talk([
    ["nat","Bueno, esto ya es completamente anormal.","Ну уж, вот это уже совсем ненормально."],
    ["agl","Perdón. Ahora no tengo tiempo de explicar. Quizá volvamos a vernos. En una ciudad así, casi seguro.","Простите. Сейчас у меня нет времени объяснять. Возможно, мы ещё увидимся. В таком городе — почти наверняка."]]);
  sprites([{k:"luis",x:38,h:72,b:6},{k:"nata",x:60,h:70,b:6}]);
  await talk([
    ["nat","Que nos ayude un hombre sobre un toro vivo, que se presente con una letra, diga «El Legado de Pedro» y se vaya galopando detrás de unas margaritas voladoras… eso nunca nos pasó.","Чтобы нам помог человек на ожившей статуе быка, представился одной буквой, назвал организацию «Наследие Педро» и ускакал за летающими маргаритками — такого ещё не случалось."],
    ["luis","Bueno, estamos en el país de Salvador Dalí.","Ну, мы всё-таки в стране Сальвадора Дали."]]);
};

SC.lavapies2 = async () => {
  chapter(T("III · Lavapiés","III · Лавапьес")); setBg("lavapies"); sprites([{k:"luis",x:38,h:72,b:6},{k:"nata",x:60,h:70,b:6}]);
  if (!S.f.celos){
    await talk([["luis","Espero no cruzarnos más con ese tipo.","Надеюсь, мы больше не столкнёмся с этим типом."],["nat","¿Por qué? No parece mala persona.","Почему? По-моему, он не похож на плохого человека."]]);
    const c = await choose([
      {t:T("«Algo esconde. Y esa gente que se presenta con una sola letra…»","«Что-то он скрывает. Люди, которые представляются одной буквой…»")},
      {t:T("«Ah, entiendo. Te gustan los hombres más altos que yo. Y canosos.»","«А-а, понятно. Значит, тебе нравятся мужчины выше меня. И седые.»")}], "luis");
    if (c === 1){
      await N(T("Pausa. Exactamente dos segundos.","Наступила пауза. Ровно две секунды."));
      await hit("flash", 500); S.f.bofetada = 1;
      await N(T("¡PAF!","ШЛЁП!"));
      await talk([
        ["nat","Nunca. Nunca dudes de mi fidelidad. Mi alma es solo tuya. ¿Entendido?","Никогда не сомневайся в моей верности. Моя душа принадлежит только тебе. Понятно?"],
        ["luis","Entendido.","Понятно."],
        ["nat","Solo tuya. Así como vos sos mío. Solo mío.","Только тебе. Так же как ты принадлежишь мне. Ты мой. Только мой."],
        ["luis","Sí, sí… amor mío. Qué amor fuerte tenés.","Да-да… любовь моя. Сильная у тебя любовь."],
        ["nat","No me provoques.","Не провоцируй меня."]]);
    } else await say("nat", T("Vos también te presentás como «Luis» y nadie sabe qué hacés con ese cubo.","Ты тоже представляешься просто «Луис», и никто не знает, что ты делаешь с этим кубиком."));
    S.f.celos = 1; save();
  }
  hint(T("Averiguá qué son las margaritas: sentate en el banco con la tablet. Y Natasha no va a correr más en sandalias…","Выясните, что за маргаритки: сядьте на скамейку с планшетом. И в сандалиях Наташа больше бегать не будет…"));
  S.hintIdle = T("Lavapiés. ¿Qué hacemos?","Лавапьес. Что делаем?");
  await room(() => [
    {x:36,y:36,w:32,h:36,l:T("Fuente","Фонтан"), go: () => N(T("La vieja fuente de Lavapiés. Sus chorros parecen ahora casi irrealmente normales.","Старый фонтан Лавапьеса. Его брызги кажутся сейчас почти неправдоподобно нормальными.")) },
    {x:2,y:34,w:22,h:36,l:T("Café","Кафе"), go: () => N(T("Gente tomando algo como si nada. Nadie sospecha que hace un rato las estatuas paseaban solas.","Люди сидят за столиками как ни в чём не бывало. Никто не подозревает, что недавно по соседним улицам разгуливали статуи.")) },
    {x:28,y:40,w:16,h:17,l:T("Mural","Граффити"), go: () => say("nat", T("Lindo mural. Aunque después de hoy, si me guiña un ojo no me sorprendo.","Красивое граффити. Хотя после сегодняшнего я не удивлюсь, если оно мне подмигнёт.")) },
    {x:88,y:32,w:12,h:38,l:T("Zapatería","Обувная лавка"), go: async () => {
      if (S.f.zapas) return say("nat", T("Ya tengo mis zapatillas. Que vengan los toros.","Кроссовки у меня уже есть. Пусть приходят быки."));
      await say("nat", T("Una parada. Esperame acá.","Одна остановка. Подожди здесь."));
      sprites([{k:"luis",x:38,h:72,b:6}]); await N(T("Natasha desaparece en la zapatería. Unos minutos después vuelve con una caja, se sienta en el borde de la fuente y se cambia las sandalias.","Наташа исчезает в обувной лавке. Через несколько минут возвращается с коробкой, садится на край фонтана и снимает сандалии."));
      sprites([{k:"luis",x:38,h:72,b:6},{k:"nata",x:60,h:70,b:6}]);
      S.f.zapas = 1; save();
      await talk([["luis","¿Te cambiás el calzado justo ahora?","Ты решила поменять обувь прямо сейчас?"],["nat","Por cómo va nuestra excursión, hoy vamos a correr muchas veces más.","Судя по тому, как проходит наша экскурсия, сегодня мы ещё много раз будем бегать."],["luis","Por fin una decisión racional.","Наконец-то рациональное решение."]]); }},
    {x:76,y:54,w:7,h:10,l:T("Banco","Скамейка"), go: () => say("luis", T("Buen lugar para conectarse a la base de Sur Místico… si uso la tablet.","Хорошее место, чтобы подключиться к базе Sur Místico… если воспользоваться планшетом.")),
      use:{tablet: async () => {
        if (S.f.yugo) return say("luis", T("Ya sabemos adónde ir: la Biblioteca Nacional, en Recoletos.","Мы уже знаем, куда идти: Национальная библиотека, Реколетос."));
        await talk([["luis","Tendré que entrar en la base oficial de Sur Místico.","Придётся зайти в официальную базу Sur Místico."],["nat","Dijiste que no querías volver a conectarte a su sistema.","Ты же говорил, что не хочешь снова подключаться к их системе."],["luis","No quiero. Pero no hay opción. Contraseña… huella… y verificación por estrellas.","Не хочу. Но выбора нет. Пароль… отпечаток… и проверка по звёздам."],["nat","Claro. ¿Por qué habré preguntado?","Конечно. Почему я вообще спросила?"]]);
        await southernCross();
        await card("", `<div class="cq-yugo"><div class="h">${T("YUGOPEDIA","ЮГОПЕДИЯ")}</div><div class="s">${T("Enciclopedia cerrada de Sur Místico · Madrid","Закрытая энциклопедия Sur Místico · Мадрид")}</div>
          03:07 — ${T("primeros objetos luminosos desconocidos","первое появление неизвестных светящихся объектов")}<br>03:19 — ${T("siete zonas de caída","зафиксированы семь зон падения")}<br>04:02 — ${T("primeros cambios de conducta","первые случаи изменения поведения")}<br>04:37 — ${T("simbología obsesiva del toro","массовые проявления символики быка")}<br>05:10 — ${T("estatuas en movimiento","появление движущихся статуй")}<br>06:25 — <b>${T("organismos voladores de origen vegetal","летающие организмы растительного происхождения")}</b><br><br>
          ${T("Fuente relacionada: «Sobre los cultos de los dioses cornudos del Mediterráneo occidental». Manuscrito. No digitalizado. Biblioteca Nacional de España.","Связанный источник: «О культах рогатых богов западного Средиземноморья». Рукопись. Не оцифрована. Biblioteca Nacional de España.")}</div>`);
        await talk([
          ["nat","¿Esa margarita tiene… dientes?","У неё что… зубы?"],
          ["luis","Vuelan en enjambre, eligen a una persona y la muerden. Después, la conducta cambia: en minutos quieren vestirse de toreros.","Они летают стаями, выбирают человека и кусают. После укуса поведение меняется: через несколько минут человек хочет переодеться тореадором."],
          ["nat","Ahora sí que dejo de confiar en las flores.","Теперь я окончательно перестану доверять цветам."],
          ["luis","Y el manuscrito no se puede descargar.","А рукопись скачать нельзя."],
          ["nat","Entonces, biblioteca.","Значит, библиотека."],
          ["luis","Entonces, biblioteca. Al noreste, hacia Recoletos.","Значит, библиотека. На северо-восток, к Реколетос."]]);
        S.f.yugo = 1; save(); }}},
    {x:65,y:42,w:9,h:15,l:T("Calle al noreste","Улица на северо-восток"), go: async () => {
      if (!S.f.yugo) return say("luis", T("Antes de ir a ciegas, tengo que averiguar qué son esas margaritas.","Прежде чем идти наугад, надо выяснить, что это за маргаритки."));
      if (!S.f.zapas) return say("nat", T("¿Otra carrera con sandalias? Ni loca. Esperá, que ahí hay una zapatería.","Ещё одна пробежка в сандалиях? Ни за что. Подожди, вон там обувная лавка."));
      return "exit"; }}
  ]);
};

SC.toreros = async () => {
  chapter(T("IV · ¡No pasarán!","IV · Не пройдут!")); setBg("toreros"); sprites([{k:"tor",x:30,h:80,b:3},{k:"luis",x:62,h:72,b:5,flip:true},{k:"nata",x:78,h:70,b:5,flip:true}]);
  await N(T("De pronto, un silencio terrible. Los vecinos se apartan, alguien cierra una ventana. De un callejón salen hombres con traje de torero: decenas, con capas rojas y picas improvisadas, los ojos vacíos y brillantes de oro.","Вокруг становится неожиданно тихо. Это страшная тишина. Из переулка выходят мужчины в костюмах тореадоров — десятки, с красными плащами и импровизированными пиками, с пустыми, золотисто светящимися глазами."));
  await talk([
    ["tor","¡Bruja! ¡Agarren a la bruja!","Ведьма! Схватить ведьму!"],
    ["nat","¡¿Qué?!","Что?!"],
    ["luis","Nunca me gustó la corrida.","Никогда не любил корриду."],
    ["nat","Muy buen momento para decírselo.","Сейчас очень подходящий момент сообщить им об этом."]]);
  await N(T("Luis levanta el cubo. El estoque del torero brilla con líneas azules y… ¡clang! El cubo sale volando de su mano y se pega a la hoja.","Луис поднимает кубик. Эсток тореадора вспыхивает синими линиями и… дзынь! Кубик вырывается из пальцев Луиса и прилипает к клинку."));
  take("cubo");
  await talk([
    ["tor","Ahora es mío.","Теперь это принадлежит мне."],
    ["luis","No tenés idea de qué mala idea es eso.","Ты даже не представляешь, насколько плохая это идея."],
    ["nat","Malón. Luis, llamá al Malón.","Малон. Луис, вызови Малон."]]);
  hint(T("El Malón se guarda para cuando no haya otra salida. Mirá tus objetos: el teléfono tiene funciones extra.","Малон бережётся на крайний случай. Посмотрите на предметы: у телефона есть дополнительные функции."));
  S.hintIdle = T("Los toreros avanzan. Usá un objeto sobre ellos.","Тореадоры наступают. Используйте предмет на них.");
  await room(() => [
    {x:5,y:30,w:42,h:68,l:T("Los toreros","Тореадоры"), go: async () => {
      const c = await choose([{t:T("Invocar al Malón","Призвать Малон")},{t:T("Pensar otra cosa","Придумать другое")}], "luis");
      if (c === 0) await talk([["luis","No. No ahora. Mirá a tu alrededor: estatuas vivas, margaritas voladoras, un toro de bronce… y todavía no sabemos qué hay detrás. El Malón puede hacer falta donde de verdad no haya otra salida.","Нет. Не сейчас. Посмотри вокруг: ожившие статуи, летающие маргаритки, бронзовый бык… а мы ещё даже не понимаем, что за всем этим стоит. Малон может понадобиться там, где другого выхода действительно не будет."]]);
      else await say("luis", T("Sin el cubo… todavía me queda algo en el bolsillo.","Без кубика… у меня ещё кое-что осталось.")); },
      use:{ telefono: async () => {
        await say("luis", T("Amor mío, voy a tener que pelear.","Любовь моя, мне придётся драться."));
        await N(T("Luis desliza el dedo por el costado del teléfono. La carcasa hace clic y se despliega: una sección de hoja, otra, otra. En segundos tiene una espada en la mano.","Луис проводит пальцем по боковой панели телефона. Корпус щёлкает и раскладывается: одна клинковая секция, вторая, третья. Через несколько секунд в его руке меч."));
        await talk([
          ["luis","Natasha, corré al noreste, hacia Recoletos. La Biblioteca Nacional está ahí.","Наташа, беги на северо-восток. В сторону Реколетос. Национальная библиотека там."],
          ["nat","No te voy a dejar acá.","Я тебя здесь не оставлю."],
          ["luis","Tenés que llegar al manuscrito. Te alcanzo.","Ты должна добраться до рукописи. Я догоню."],
          ["nat","Ni se te ocurra no alcanzarme.","Только попробуй не догнать меня."]]);
        return "exit"; }}},
    {x:62,y:20,w:38,h:70,l:T("Los manifestantes","Демонстранты"), go: () => N(T("Del otro lado de la calle, una pequeña manifestación contra la tauromaquia. No están hechizados: discuten, filman con el celular, están indignados.","С другой стороны улицы — небольшая демонстрация против корриды. Они не под воздействием аномалии: спорят, снимают на телефоны, возмущаются.")) }
  ]);
  sprites([{k:"tor",x:30,h:80,b:3},{k:"luis",x:62,h:72,b:5,flip:true}]);
  await N(T("Las nuevas zapatillas de Natasha justifican su existencia: en un segundo ya dobló la esquina.","Новые кроссовки Наташи сразу оправдывают своё существование: через секунду она уже за углом."));
  await talk([["tor","¿Uno contra todos?","Один против всех?"],["luis","Peor me fue.","Бывало хуже."]]);
  await N(T("Luis mira a los manifestantes. Después a los toreros. Y sonríe.","Луис смотрит на активистов. Потом на тореадоров. И улыбается."));
  await say("luis", T("¡ASESINOS DE TOROS! ¡NO PASARÁN!","УБИЙЦЫ БЫКОВ! НЕ ПРОЙДУТ!"));
  await say("mob", "¡No pasarán! ¡Fuera la tauromaquia! ¡Vamos!");
  await say("tor", T("Uno contra uno.","Один на один."));
  hint(T("Pará los golpes del estoque: elegí el lado correcto a tiempo.","Отбивайте удары эстока: вовремя выбирайте нужную сторону."));
  const A = [{q:T("¡Estocada alta!","Удар сверху!"),a:"u"},{q:T("¡Viene por la derecha!","Удар справа!"),a:"r"},{q:T("¡Por la izquierda!","Удар слева!"),a:"l"}];
  let parried = 0;
  while (parried < 3){
    const a = A[parried];
    const ok = await qte(a.q, [{t:"⬅ "+T("Parar izq.","Блок слева"),k:"ArrowLeft",ok:a.a==="l"},{t:"⬆ "+T("Parar arriba","Блок сверху"),k:"ArrowUp",ok:a.a==="u"},{t:T("Parar der.","Блок справа")+" ➡",k:"ArrowRight",ok:a.a==="r"}], 2400, `<div class="cq-prog">${parried} / 3</div>`);
    if (ok){ parried++; toast(T("<b>¡Clang!</b> Metal contra metal.","<b>Дзынь!</b> Металл о металл."), 1100); }
    else { await hit("shake", 450); await say("mob", "¡Olé!"); }
  }
  hint(T("Ahora atacá. Si el torero siempre esquiva… pensá como filósofo.","Теперь атакуйте. Если тореадор всё время уворачивается… думайте как философ."));
  while (true){
    const c = await choose([{t:T("Estocada directa","Прямой выпад")},{t:T("Golpe lateral","Удар сбоку")},{t:T("Tres golpes rápidos: arriba, derecha, abajo","Три быстрых удара: сверху, справа, снизу")},{t:T("Hablarle de filosofía y cambiar de golpe la dirección","Заговорить о философии и резко сменить направление удара")}], "luis");
    if (c < 3){ await say("mob", "¡Olé!"); await say("luis", [T("Empiezo a odiar esa palabra.","Я начинаю ненавидеть это слово."),T("¡Ya basta con eso!","Да прекратите уже!"),T("Muy gracioso…","Очень смешно…")][c]); continue; }
    await talk([
      ["tor","Para alguien que habla tanto, pegás sorprendentemente mal.","Для человека, который так много говорит, ты удивительно плохо попадаешь."],
      ["luis","Soy filósofo.","Я философ."],
      ["tor","¿Qué?","Что?"],
      ["luis","Nos especializamos en las preguntas, no en las respuestas.","Мы специализируемся на вопросах, а не на ответах."]]);
    await hit("flash", 400);
    await N(T("Luis cambia de golpe la dirección. La hoja corta el borde de la lujosa capa roja. Los manifestantes estallan en aplausos.","Луис внезапно меняет направление удара. Лезвие рассекает край роскошного красного плаща. Активисты взрываются аплодисментами."));
    await talk([["tor","¡Me la vas a pagar!","Ты заплатишь за это!"],["luis","Ahí está. Por fin una reacción normal.","Вот. Наконец-то нормальная реакция."]]);
    break;
  }
  await N(T("Los manifestantes avanzan en bloque con pancartas y megáfonos. Y pasa algo casi cómico: los toreros se asustan. El jefe se da vuelta un segundo…","Активисты плотной стеной идут на заражённых с плакатами и мегафонами. И происходит почти комическое: тореадоры пугаются. Предводитель отвлекается всего на секунду…"));
  hint(T("¡Atrapá el cubo! Tocalo mientras se mueve.","Поймайте кубик! Нажмите на него, пока он движется."));
  toast(T("<b>¡Ahora!</b> Atrapá el cubo.","<b>Сейчас!</b> Поймайте кубик."), 1500);
  while (!(await catchCube(4200))) await say("luis", T("¡Casi! Otra vez…","Почти! Ещё раз…"));
  give("cubo");
  await talk([["luis","Gracias. Volvió a casa.","Спасибо. Вернулся домой."],["tor","Esto no terminó.","Это ещё не конец."],["luis","Espero sinceramente que sí. Tengo cosas que hacer.","Я очень надеюсь, что конец. У меня вообще-то дела."]]);
  sprites([{k:"luis",x:62,h:72,b:5,flip:true}]);
  await N(T("Los toreros huyen por las calles vecinas. Los manifestantes celebran como si hubieran ganado una batalla de verdad.","Тореадоры бегут по соседним улицам. Активисты празднуют победу так, будто выиграли настоящее сражение."));
};

SC.margaritas = async () => {
  chapter(T("V · El toro burdeos","V · Бордовый бык")); setBg("margaritas", {size:"165% auto", pos:"100% 45%"}); sprites([]);
  await N(T("Un grito. Sobre los techos, una nube blanca. Margaritas. Margaritas con dientes.","Испуганный крик. Над крышами белое облако. Маргаритки. Маргаритки с зубами."));
  await say("luis", T("¡No son lindas! ¡Corran!","Они не красивые! Бегите!"));
  await N(T("El enjambre cae sobre la plaza y empieza a morder. Pero con Luis pasa algo raro: las flores se le acercan… y lo esquivan. Una se queda frente a su cara, abre su boquita llena de dientes, lo estudia… y se va.","Рой обрушивается на площадь и начинает кусаться. Но с Луисом происходит что-то странное: цветы подлетают… и облетают его стороной. Одна зависает прямо перед его лицом, раскрывает зубастый ротик, изучает его… и улетает."));
  await say("luis", T("¿Qué diablos…?","Что за чёрт?.."));
  await talk([
    ["act","¿Qué estoy haciendo…? Los toros… los toros son hermosos.","Что я вообще делаю?.. Быки… Быки прекрасны."],
    ["mob","¡Toro! ¡Vos! ¡El toro burdeos!","Бык! Ты! Бордовый бык!"],
    ["luis","¿Solo por el color de la camisa? ¿En serio?","Только из-за цвета? Вы серьёзно?"],
    ["mob","¡Toro burdeos! ¡Toro burdeos! ¡Que no escape!","¡Toro burdeos! ¡Toro burdeos! ¡Que no escape!"],
    ["luis","Ahora sí que tengo miedo.","Вот теперь мне действительно страшно."]]);
  hint(T("Los patinetes eléctricos piden desbloqueo. Algo en tu inventario abre casi cualquier cosa.","Электросамокаты требуют разблокировки. Кое-что в инвентаре открывает почти всё."));
  S.hintIdle = T("¡Te persiguen! Rápido…","За тобой гонятся! Быстрее…");
  await room(() => [
    {x:60,y:66,w:40,h:34,l:T("Patinetes eléctricos","Электросамокаты"), go: () => say("luis", T("La pantalla pide desbloqueo. ¡Vamos…!","Экран требует разблокировку. Да брось…")),
      use:{cubo: async () => { await N(T("Un giro rápido de una cara. El patinete pita. En la pantalla: LISTO.","Одно быстрое движение гранью. Самокат коротко пищит. На дисплее: LISTO.")); await talk([["luis","Por esto te quiero.","Вот за это я тебя и люблю."],["luis","Perdón, dueño. Lo devuelvo si sobrevivo.","Простите, хозяин. Верну, если выживу."]]); return "exit"; }}},
    {x:0,y:10,w:55,h:60,l:T("Los toreros nuevos","Новые тореадоры"), go: () => say("mob", "¡Toro burdeos!") }
  ]);
  await N(T("Luis acelera a la máxima velocidad permitida: veinte kilómetros por hora. Un día normal alcanza. Hoy es una burla. Los toreros corren casi igual de rápido.","Луис несётся на максимально допустимой скорости — двадцать километров в час. В обычный день этого хватает. Сегодня это издевательство. Тореадоры бегут почти с той же скоростью."));
  await talk([["mob","¡Ven aquí, toro burdeos! ¡No escaparás!","¡Ven aquí, toro burdeos! ¡No escaparás!"],["luis","¡NO SOY UN TORO! …Dale, veintiuno. Aunque sea veinte y medio. …Normas europeas.","Я НЕ БЫК! …Давай двадцать один. Хотя бы двадцать с половиной. …Европейские нормы."]]);
  hint(T("A esta situación hay que ponerle el nombre correcto.","Этой ситуации нужно дать правильное название."));
  while (true){
    const c = await choose([{t:T("Acelerar más","Прибавить газу")},{t:T("Gritar que no es un toro","Крикнуть, что он не бык")},{t:T("Frenar y mirar el reloj negro","Затормозить и посмотреть на чёрные часы")}], "luis");
    if (c === 0) { await N("20 km/h"); continue; }
    if (c === 1) { await say("mob", "¡TORO BURDEOS!"); continue; }
    break;
  }
  await say("luis", T("Por favor… no me falles.","Пожалуйста… только не подведи."));
  await watchMenu([
    {t:T("TIPO DE SITUACIÓN","ТИП СИТУАЦИИ"), o:[{t:T("Peligrosa","Опасная"),m:T("Demasiado general.","Слишком общо.")},{t:T("Complicada","Сложная"),m:T("Demasiado general.","Слишком общо.")},{t:T("Absurda","Абсурдная"),ok:1}]},
    {t:T("RESULTADO DESEADO","ЖЕЛАЕМЫЙ РЕЗУЛЬТАТ"), o:[{t:T("Con sangre","С кровью"),m:T("Son madrileños hechizados, no enemigos.","Это заколдованные мадридцы, а не враги.")},{t:T("Sin sangre","Без крови"),ok:1}]},
    {t:T("NIVEL DE CRUELDAD","УРОВЕНЬ ЖЕСТОКОСТИ"), o:[{t:T("Muy cruel","Очень жестоко"),m:T("Incompatible con «sin sangre».","Несовместимо с «без крови».")},{t:T("Cruel","Жестоко"),m:T("Incompatible con «sin sangre».","Несовместимо с «без крови».")},{t:T("No muy cruel","Не очень жестоко"),ok:1},{t:T("Casi cortés","Почти вежливо"),m:T("«Casi cortés» suena sospechoso.","«Почти вежливо» звучит подозрительно.")}]}
  ]);
  await say("reloj", T("SOLUCIÓN ENCONTRADA","РЕШЕНИЕ НАЙДЕНО"));
  await hit("flashred", 700);
  await N(T("Un rayo azul golpea el asfalto. El aire tiembla y se espesa: aparece un toro enorme, rojo, translúcido y brillante. El holograma resopla… y sale corriendo.","Тонкий голубой луч бьёт в асфальт. Воздух дрожит и сгущается: перед заражёнными появляется огромный алый полупрозрачный бык. Голограмма фыркает… и уносится прочь."));
  await say("mob", "¡EL TORO!");
  await N(T("Toda la multitud sale detrás del animal que no existe.","Вся толпа, не сомневаясь ни секунды, бросается вслед за несуществующим животным."));
  await talk([["luis","¿«No muy cruel»?","«Не очень жестоко»?"],["reloj","DE NADA","ПОЖАЛУЙСТА"],["luis","No te hagas el vivo.","Не умничай."]]);
  setBg("biblioteca", {fx:"dark"}); sprites([{k:"luis",x:40,h:70,b:4},{k:"nata",x:58,h:68,b:4}]);
  await talk([
    ["luis","¡Natasha! ¡Subí, te llevo!","Наташа! Садись! Подвезу!"],
    ["nat","¿Lo robaste?","Ты его украл?"],
    ["luis","Lo expropié temporalmente. ¡Subí!","Временно экспроприировал. Садись!"],
    ["nat","Es gracioso… nuestras aventuras también empezaron gracias a un patinete.","Забавно… Наши приключения ведь тоже начались благодаря самокату."],
    ["luis","Y ahora una sigue en patinete. Más lento, eso sí.","А теперь одно из них продолжается на самокате. Правда, медленнее."],
    ["nat","Somos dos.","Нас двое."],
    ["luis","Gracias por la explicación. No me había dado cuenta.","Спасибо за объяснение. Я не заметил."]]);
  // interlude: the dark room
  setBg("negro"); sprites([]);
  chapter(T("Mientras tanto…","Тем временем…"));
  await N(T("Una habitación completamente a oscuras. Ni caras ni siluetas: solo voces.","Комната совершенно тёмная. Ни лиц, ни силуэтов — только голоса."));
  await talk([
    ["voz","Creo que llegó la hora de abrir las compuertas. Esta vez todo será mucho más rápido.","Думаю, пришло время открыть шлюзы. Только на этот раз всё будет гораздо быстрее."],
    ["voz","¿Y esos dos que andan por Madrid?","А те двое, которые сейчас бродят по Мадриду?"],
    ["voz","Que corran. Son útiles. Mientras todos miran estatuas, toreros y flores voladoras, nadie ve lo que de verdad pasa.","Пусть бегают. Они даже полезны. Пока все смотрят на ожившие статуи, тореадоров и летающие цветы, никто не замечает того, что действительно происходит."],
    ["voz","Solo hay un problema: el nombre. No podemos seguir llamándola España. …New Albion.","Есть только одна проблема: название. Мы ведь не можем продолжать называть её Испанией. …New Albion."],
    ["voz","Abran las compuertas.","Открывайте шлюзы."]]);
};

SC.sala = async () => {
  chapter(T("VI · La Biblioteca Nacional","VI · Национальная библиотека")); setBg("biblioteca"); sprites([{k:"luis",x:40,h:62,b:4},{k:"nata",x:56,h:60,b:4}]);
  await talk([["luis","Espero que adentro al menos los libros no muerdan.","Надеюсь, внутри хотя бы книги не кусаются."],["nat","Después de esta mañana, yo no contaría con eso.","После сегодняшнего утра я бы на это не рассчитывала."]]);
  setBg("sala"); sprites([{k:"luis",x:18,h:70,b:0},{k:"nata",x:31,h:68,b:0}]);
  await say("nat", T("Ya me gusta este lugar. Silencio, fresco, nadie intenta matarnos.","Мне уже нравится это место. Тихо, прохладно, никто не пытается нас убить."));
  sprites([{k:"luis",x:18,h:70,b:0},{k:"nata",x:31,h:68,b:0},{k:"bib",x:4,h:80,b:0}]);
  await talk([["bib","Más bajo, por favor.","Тише, пожалуйста."],["luis","Ya estamos susurrando.","Мы и так шепчем."],["bib","Susurren más bajo.","Шепчите тише."]]);
  const noBib = () => sprites([{k:"luis",x:18,h:70,b:0},{k:"nata",x:31,h:68,b:0}]);
  const shh = async () => { sprites([{k:"luis",x:18,h:70,b:0},{k:"nata",x:31,h:68,b:0},{k:"bib",x:4,h:80,b:0}]); await say("bib", T("¡Silencio!","Тише!")); noBib(); };
  noBib();
  hint(T("Buscá el manuscrito en el catálogo. Y para la foto… vas a necesitar distraer a alguien.","Найдите рукопись в каталоге. А для фотографии… придётся кого-то отвлечь."));
  S.hintIdle = T("Sala de lectura. En silencio, por favor.","Читальный зал. Тише, пожалуйста.");
  await room(() => [
    {x:77,y:9,w:7,h:25,l:T("Cartel de normas","Табличка с правилами"), go: () => N(T("Prohibido fotografiar. Prohibido comer. Prohibido hablar. Prohibido, probablemente, respirar fuerte.","Фотографировать нельзя. Есть нельзя. Разговаривать нельзя. Вероятно, громко дышать тоже нельзя.")) },
    {x:56,y:0,w:20,h:42,l:T("Estanterías","Стеллажи"), go: async () => { await say("luis", T("Filosofía… Historia… ¡Kant! Mañana tocaba «la cosa en sí»…","Философия… История… Кант! Завтра мы должны были проходить «вещь в себе»…")); await N(T("La bolsa de Luis roza un atril de madera. Toc.","Сумка Луиса задевает деревянную стойку. Тук.")); await shh(); }},
    {x:24,y:54,w:18,h:12,l:T("Catálogo electrónico","Электронный каталог"), go: async () => {
      if (S.f.catalogo) return say("luis", T("Ya lo pedimos. Está ahí, sobre el atril.","Мы его уже заказали. Он там, на подставке."));
      const c = await choose([{t:T("«Breve historia de la tortilla de patatas»","«Краткая история тортильи с картошкой»")},{t:T("«Sobre los cultos de los dioses cornudos del Mediterráneo occidental»","«О культах рогатых богов западного Средиземноморья»")},{t:T("«Crítica de la razón dependiente»","«Критика зависимого разума»")}], "luis", T("¿Qué título busca Luis?","Какое название ищет Луис?"));
      if (c === 0) return say("nat", T("Después. Primero salvamos España, después la tortilla.","Потом. Сначала спасаем Испанию, потом тортилья."));
      if (c === 2) return say("nat", T("Ese es tu futuro tratado filosófico. Todavía no lo escribiste.","Это название твоего будущего философского трактата. Ты его ещё не написал."));
      await talk([
        ["nat","Sabés… Quiero que me cojas sin parar en la biblioteca.","Знаешь… Quiero que me cojas sin parar en la biblioteca."],
        ["luis","Ya te expliqué. En España ese chiste no funciona. «Coger» acá es un verbo normal: tomar, agarrar.","Я тебе уже объяснял. В Испании эта шутка не работает. Coger здесь совершенно нормальный глагол."],
        ["nat","¿Nada de nada?","Совсем не работает?"],
        ["luis","Nada. Admití la derrota.","Совсем. Признай поражение."]]);
      await N(T("Natasha entrecierra los ojos, piensa unos segundos… y susurra otra palabra. Una que en España sí funciona. Toda la sala levanta la vista. Luis se pone rojo como su camisa.","Наташа прищуривается, думает несколько секунд… и шепчет другое слово. Такое, которое в Испании точно работает. Весь читальный зал поднимает глаза. Луис краснеет до цвета своей рубашки."));
      sprites([{k:"luis",x:18,h:70,b:0},{k:"nata",x:31,h:68,b:0},{k:"bib",x:4,h:80,b:0}]);
      await talk([["bib","Esto es una biblioteca.","Это библиотека."],["nat","Lo sé.","Я знаю."],["bib","Y usted también.","И вы тоже."],["luis","¡Pero si yo no dije nada!","А я вообще ничего не сказал!"],["bib","Silencio.","Тише."]]);
      noBib(); S.f.catalogo = 1; save();
      await N(T("Un empleado trae un manuscrito pesado, de cuero oscurecido. Huele a papel viejo, a polvo y a tierra seca después de un largo calor.","Сотрудник приносит тяжёлую рукопись в потемневшем кожаном переплёте. Она пахнет старой бумагой, пылью и сухой землёй после долгой жары.")); }},
    {x:44,y:44,w:36,h:33,l:T("Manuscrito","Рукопись"), when:()=>S.f.catalogo, go: async () => {
      await talk([
        ["luis","Acá lo llaman Taurán. Antiguo dios ibérico de la fuerza, la furia y la sumisión.","Здесь его называют Тауран. Древний иберийский бог силы, ярости и подчинения."],
        ["luis","Según el autor, Taurán no pedía adoración voluntaria. Entraba en la mente por los símbolos repetidos, la excitación de masas y el miedo colectivo.","Согласно автору, Тауран не требовал добровольного поклонения. Он проникал в сознание через повторяющиеся символы, массовое возбуждение и коллективный страх."],
        ["nat","Por eso la gente se vuelve torera y adora toros.","Поэтому люди превращаются в тореадоров и начинают поклоняться быкам."],
        ["luis","Y mirá: una cabeza con cuernos dentro de un círculo… y siete puntitos alrededor.","А вот: рогатая голова внутри окружности… и семь маленьких точек вокруг."],
        ["nat","Siete. Como los siete objetos que cayeron sobre Madrid. Sacale una foto.","Семь. Как семь объектов, упавших на Мадрид. Сфотографируй страницу."]]); },
      use:{ telefono: async () => {
        if (S.f.pagina) return;
        sprites([{k:"luis",x:18,h:70,b:0},{k:"nata",x:31,h:68,b:0},{k:"bib",x:4,h:80,b:0}]);
        await talk([["bib","No se puede fotografiar el manuscrito.","Фотографировать рукопись нельзя."],["luis","¿Usted alguna vez se mueve de forma normal?","Вы вообще умеете перемещаться обычным способом?"],["bib","Silencio.","Тише."]]);
        await talk([["luis","Como en Belgrado.","Как в Белграде."],["nat","Como en Belgrado.","Как в Белграде."]]);
        hint(T("Distraé al bibliotecario con algo que le apasione.","Отвлеките библиотекаря чем-нибудь, что его по-настоящему увлечёт."));
        while (true){
          const c = await choose([{t:T("«Perdón, ¿dónde está el baño?»","«Простите, где здесь туалет?»")},{t:T("«¡Mire! ¡Un toro de bronce en la ventana!»","«Смотрите! Бронзовый бык в окне!»")},{t:T("«¿La clasificación de los manuscritos antiguos sigue la tradición francesa o es una escuela española propia?»","«Система классификации старых рукописей у вас основана на французской традиции или это собственная испанская школа?»")}], "luis");
          if (c === 0) { await say("bib", T("Al fondo. En silencio.","В конце зала. Тихо.")); continue; }
          if (c === 1) { await say("bib", T("Los toros no entran en la biblioteca. Y usted tampoco debería gritar.","Быки в библиотеку не заходят. И вам тоже не следует кричать.")); continue; }
          break;
        }
        await say("bib", T("Ah… Verá, todo es bastante más complejo. La historia de la catalogación de este fondo empieza ya en…","Видите ли, всё значительно сложнее… История каталогизации этого фонда начинается ещё…"));
        await N(T("Luis escucha con la cara de alguien de cuya respuesta depende el destino de la filosofía europea. Detrás de él, Natasha toma con cuidado el borde de la hoja y tira.","Луис слушает с таким видом, будто от ответа зависит судьба европейской философии. За его спиной Наташа осторожно берётся за край листа и тянет."));
        await hit("shake", 400);
        await N(T("Trrrrrrrrr…","Тр-р-р-р-р-р…"));
        await say("bib", T("¿Qué fue eso?","Что это было?"));
        while (true){
          const c = await choose([{t:T("«Fue mi estómago. No desayuné bien.»","«Это мой желудок. Я плохо позавтракал.»")},{t:T("«Me parece que alguien rompió un libro allá al fondo.»","«По-моему, кто-то там порвал книгу.»")}], "luis");
          if (c === 0) { await say("bib", T("¿Su estómago lee manuscritos?","Ваш желудок читает рукописи?")); continue; }
          break;
        }
        await say("bib", T("¡¿Qué?! ¡¿Quién fue?!","Что?! Кто это сделал?!"));
        noBib(); S.f.pagina = 1; give("pagina");
        await say("luis", T("Corramos.","Бежим."));
        return "exit"; }}}
  ]);
};

SC.tauran = async () => {
  chapter(T("VII · Taurán","VII · Тауран")); setBg("biblioteca"); sprites([{k:"luis",x:40,h:62,b:4},{k:"nata",x:56,h:60,b:4}]);
  await talk([["nat","Lo logramos.","Получилось."],["luis","Arrancaste una hoja de un manuscrito antiguo de la Biblioteca Nacional de España.","Ты только что вырвала лист из старинной рукописи Национальной библиотеки Испании."],["nat","Y vos distrajiste al hombre que me tenía que impedir hacerlo.","А ты отвлёк человека, который должен был мне помешать."],["luis","Hice una pregunta científica. Es distinto.","Я задавал научный вопрос. Это другое."]]);
  await pageView(true);
  fx("red");
  await N(T("Los siete puntos se encienden uno tras otro. El toro dibujado abre los ojos.","Одна за другой загораются семь точек. Нарисованный бык открывает глаза."));
  await talk([["luis","El libro mantenía el contorno cerrado. Mientras la hoja estaba dentro, el símbolo era parte del todo.","Книга удерживала контур замкнутым. Пока лист находился внутри переплёта, знак оставался частью целого."],["nat","Y yo lo rompí.","А я его разорвала."]]);
  await hit("shake"); await hit("shake");
  setBg("tauran", {fx:"red", zoom:true}); sprites([]);
  await N(T("El aire se oscurece y se espesa. Primero unos cuernos enormes, después la cabeza, el pecho, las patas… Un ser hecho de piedra al rojo y metal negro, con grietas que laten de luz carmesí. Taurán, el dios-toro ibérico.","Воздух темнеет и сгущается. Сначала огромные рога, затем тяжёлая голова, грудь, ноги… Существо из раскалённого камня и чёрного металла, в трещинах пульсирует багровый свет. Тауран, иберийский бог-бык."));
  await talk([["luis","Vino por la hoja.","Он пришёл за ней."],["nat","Entonces que la pida con educación.","Тогда пусть попросит вежливо."],["luis","Parece que hoy la cortesía está cancelada.","Кажется, вежливость сегодня отменяется."]]);
  await hit("flash"); await N(T("Rayo plateado del cubo, directo al pecho. Cuando el polvo se disipa… Taurán retrocedió medio paso.","Серебристый луч из кубика — прямо в грудь. Когда дым рассеивается… бог-бык отступил всего на полшага."));
  await say("luis", T("¿Eso es todo?","Это всё?"));
  hint(T("¡Esquivá la embestida!","Уворачивайтесь от атаки!"));
  while (!(await qte(T("¡Taurán embiste!","Тауран бросается вперёд!"), [{t:"⬅ "+T("Tirarse a la izquierda","Прыжок влево"),k:"ArrowLeft",ok:1},{t:"⬆ "+T("Quedarse quieto","Стоять на месте"),k:"ArrowUp"},{t:T("Correr hacia él","Бежать к нему")+" ➡",k:"ArrowRight"}], 2200))) { await hit("shake", 400); await say("nat", T("¡Luis! ¡Al costado!","Луис! В сторону!")); }
  await hit("flash", 500);
  await N(T("¡BRRRAAANG! Un acorde de guitarra recorre la calle. Una ola dorada golpea a Taurán en el costado y lo hace retroceder.","БРРААНГ! По улице разносится мощный гитарный аккорд. Золотистая волна ударяет Таурана в бок и отбрасывает его."));
  sprites([{k:"agl",x:80,h:80,b:2}]);
  await talk([
    ["luis","¿De dónde sacaste eso?","Откуда ты это взял?"],
    ["agl","Larga historia. Si detenemos a Taurán, se rompe el efecto sobre los toreros. Están conectados a él.","Долгая история. Если остановим Таурана, разрушится воздействие на тореадоров. Они связаны с ним."],
    ["luis","Espada: inútil. El Malón: demasiado. Y convertirme en gigante hoy no tengo ganas.","Меч не поможет… Малон — это уж чересчур. А становиться гигантом я сегодня не хочу."],
    ["agl","¿Sabés convertirte en gigante?","Ты умеешь становиться гигантом?"],
    ["luis","¡Claro! Bueno… lo hice una sola vez.","Конечно! Правда… я это делал только один раз."]]);
  hint(T("Mirá de cerca la página robada (tocala dos veces en el inventario).","Рассмотрите украденную страницу (нажмите на неё дважды в инвентаре)."));
  S.hintIdle = T("La guitarra de L lo frena… por ahora.","Гитара агента Л сдерживает его… пока.");
  await room(() => [
    {x:30,y:15,w:40,h:55,l:"Taurán", go: () => N(T("Las ondas doradas lo envuelven y lo frenan. Pero se están rompiendo una a una.","Золотые линии оплетают его и сдерживают. Но рвутся одна за другой.")) },
    {x:40,y:16,w:28,h:36,l:T("Ventanas del segundo piso","Окна второго этажа"), when:()=>S.f.astas, go: async () => {
      await N(T("Luis atraviesa la puerta rota, sube las escaleras de dos en dos (el bibliotecario grita que está prohibido correr) y abre un ventanal sobre la balaustrada.","Луис проскакивает через разбитую дверь, мчится вверх по лестнице (где-то позади библиотекарь кричит, что бегать запрещено) и открывает высокое окно на балюстраду."));
      await choose([{t:T("Saltar sobre Taurán","Прыгнуть на Таурана")}], "luis", T("Bueno. Agarremos al toro por las astas.","Ну что ж. Берём быка за рога."));
      return "exit"; }}
  ], () => false, {
    "pagina:self": async () => {
      if (S.f.astas) return pageView(false);
      await pageView(false);
      await talk([["nat","Acá abajo dice: «Hay que coger el toro por las astas».","Здесь написано: «Hay que coger el toro por las astas»."],["nat","¿Otra vez coger? ¿Qué significa?","Опять coger? Что это значит?"]]);
      while (true){
        const c = await choose([{t:T("«Hay que escapar del toro antes de que te agarre.»","«Надо убежать от быка, пока он тебя не поймал.»")},{t:T("«Es un refrán: enfrentar un problema difícil de frente, sin esquivar el peligro.»","«Это фразеологизм: решительно взяться за трудную проблему, не избегая опасности.»")},{t:T("«Hay que hacerse amigo del toro.»","«Надо подружиться с быком.»")}], "luis");
        if (c !== 1) { await say("nat", T("No te creo. Tenés cara de saber la respuesta.","Не верю. У тебя лицо человека, который знает ответ.")); continue; }
        break;
      }
      await talk([
        ["nat","Ni se te ocurra decirme que…","Только не говори мне…"],
        ["luis","A veces los refranes hay que entenderlos literalmente.","Иногда фразеологизмы надо понимать буквально."],
        ["nat","¡Luis!","Луис!"],
        ["agl","¿Siempre es así?","Он всегда такой?"],
        ["nat","Solo cuando tiene competencia…","Только когда у него появляется конкуренция…"]]);
      S.f.astas = 1; save();
      hint(T("Subí a la biblioteca: las ventanas del segundo piso.","Поднимитесь в библиотеку: к окнам второго этажа.")); },
  });
  // the rodeo is inside the same scene: the room above exits only via the windows
};
SC.tauran2 = async () => {
  chapter(T("VII · Agarrar al toro por las astas","VII · Взять быка за рога")); setBg("tauran", {fx:"red"}); sprites([]);
  await hit("shake");
  await N(T("Luis salta. Cae casi sobre el cuello de Taurán y se agarra de los dos cuernos. El toro ruge, salta, gira, se sacude…","Луис прыгает. Он приземляется почти на шею Таурана и обеими руками хватается за рога. Бык ревёт, подпрыгивает, крутится, бьётся всем телом…"));
  await say("luis", T("¡Me voy a morir de mareo antes que de toro!","Я скорее умру от головокружения, чем от быка!"));
  await say("nat", T("¡Agarrate!","Держись!"));
  hint(T("¡Aguantá los sacudones!","Держитесь!"));
  const R = [{q:T("¡Se sacude a la izquierda!","Рывок влево!"),a:"r"},{q:T("¡Se para en dos patas!","Встаёт на дыбы!"),a:"u"},{q:T("¡Gira a la derecha!","Разворот вправо!"),a:"l"},{q:T("¡Corcovea!","Брыкается!"),a:"u"}];
  let i = 0;
  while (i < 4){
    const r = R[i]; const D = DIRS();
    const ok = await qte(r.q, [{t:"⬅ "+T("Inclinarse izq.","Наклон влево"),k:"ArrowLeft",ok:r.a==="l"},{t:"⬆ "+T("Agarrarse fuerte","Держаться крепче"),k:"ArrowUp",ok:r.a==="u"},{t:T("Inclinarse der.","Наклон вправо")+" ➡",k:"ArrowRight",ok:r.a==="r"}], 2000, `<div class="cq-prog">${i} / 4</div>`);
    if (ok) i++; else { await hit("shake", 400); toast(T("<b>¡Uy!</b> Casi se cae.","<b>Ой!</b> Чуть не сорвался."), 1100); }
  }
  await N(T("Al agarrar con más fuerza el cuerno izquierdo, Luis siente bajo la palma algo completamente antinatural. No es piedra.","Сильнее обхватив левый рог, Луис вдруг чувствует под ладонью что-то совершенно неестественное. Не камень."));
  await findButton();
  await say("luis", T("«HACERLO MANSITO»… Me están cargando.","«HACERLO MANSITO»… Вы издеваетесь…"));
  await N(T("PIP.","ПИП."));
  setBg("manso"); fx(""); sprites([]);
  await N(T("Las grietas carmesí se apagan. Los ojos dejan de brillar. Hace un segundo, un dios antiguo iba a destruir la biblioteca; ahora se queda quieto y deja que Luis le rasque entre los cuernos.","Багровые трещины гаснут. Глаза перестают светиться. Ещё секунду назад древний бог собирался разрушить библиотеку; теперь он спокойно стоит и даже позволяет Луису почесать себя между рогами."));
  await N(T("En todo Madrid, la luz dorada desaparece de los ojos de los toreros. Se miran, confundidos. Alguien encuentra encima un traje de luces y no sabe de dónde salió.","По всему Мадриду золотой свет исчезает из глаз заражённых тореадоров. Они растерянно смотрят друг на друга. Кто-то обнаруживает на себе костюм тореадора и не понимает, откуда он взялся."));
  sprites([{k:"nata",x:66,h:62,b:3}]);
  await talk([
    ["nat","¡Síííí! ¡Amor! ¡Lo lograste!","Да-а-а! Любимый! Ты сделал это!"],
    ["luis","Había literalmente un botón que decía «hacerlo mansito».","Здесь буквально была кнопка «сделать его послушным»."],
    ["nat","Pero el que saltó sobre el toro fuiste vos.","Но прыгнул на быка ты."]]);
  await N(T("Luis busca con la mirada al agente L. Solo alcanza a ver, al borde de la plaza, un largo abrigo oscuro que desaparece entre la gente.","Луис оглядывается, чтобы увидеть реакцию агента Л. Но далеко у края площади лишь на мгновение мелькает длинный тёмный плащ — и исчезает между людьми."));
  await talk([["nat","Creo que se ofendió. Pensaba que esta victoria era suya.","Кажется, обиделся. Думаю, он считал эту победу своей."],["luis","Entonces la próxima vez que lea las instrucciones.","Тогда в следующий раз пусть читает инструкцию."]]);
  await talk([["nat","Luis… mirá la página. Esto no es solo magia antigua. Hay líneas geométricas, una estructura moderna. Alguien metió tecnología dentro de un ritual ibero.","Луис… посмотри на страницу. Это не только древняя магия. Здесь есть современная структура. Кто-то встроил технологию в старый иберийский ритуал."],["luis","¿La Alianza del Norte?","Северный альянс?"],["nat","Parece su trabajo.","Похоже на их работу."]]);
};

SC.colon = async () => {
  chapter(T("VIII · Anillo alrededor de Madrid","VIII · Кольцо вокруг Мадрида")); setBg("manso"); sprites([{k:"mar",x:30,h:72,b:2},{k:"luis",x:52,h:68,b:2},{k:"nata",x:68,h:66,b:2}]);
  await talk([
    ["mar","¡Luis! Felicitaciones. Parece que hoy Madrid te debe muchísimo.","Луис! Поздравляю. Похоже, Мадрид сегодня действительно обязан тебе очень многим."],
    ["nat","¡Sí! ¡Mi marido es un héroe!","Да. Мой муж — герой!"],
    ["luis","Y ahora vas a tener que cumplir lo que prometiste.","А теперь вам придётся выполнить то, что вы обещали."],
    ["mar","Tenés razón. Y no habrá mejor momento: hay gente, periodistas, televisión. Lo haremos ahora, en público.","Ты прав. И лучшего момента не будет: здесь люди, журналисты, телевидение. Можно сделать это прямо сейчас, публично."]]);
  await say("cos", T("Señorita… soy costurera. Me encanta su vestido. Hace poco cosí uno parecido, con motivos españoles. ¿Puedo regalárselo? Por lo que hizo hoy por nosotros.","Señorita… Я портниха. Мне очень нравится ваше платье. Я недавно сшила одно похожее, только с испанскими мотивами. Можно я подарю его вам? За то, что вы сделали сегодня для нас."));
  await choose([{t:T("Aceptar el regalo y abrazarla","Принять подарок и обнять её")}], "nat");
  S.f.vestido = 1; save();
  sprites([{k:"mar",x:30,h:72,b:2},{k:"luis",x:52,h:68,b:2}]); await sleep(500);
  sprites([{k:"mar",x:30,h:72,b:2},{k:"luis",x:52,h:68,b:2},{k:"natb",x:70,h:68,b:2}]);
  await talk([["nat","¿Y?","Ну?"],["luis","Creo que España acaba de hacer la acción diplomática más exitosa de todo el día.","Я думаю, Испания только что совершила самое успешное дипломатическое действие за весь сегодняшний день."]]);
  await say("mar", T("¡Damas y caballeros! Cumpliendo el compromiso asumido con el hombre que ayudó a detener esta catástrofe, debo anunciar oficialmente que…","Дамы и господа! Выполняя обязательство, принятое перед человеком, который помог остановить эту катастрофу, я должен официально объявить…"));
  await hit("shake");
  setBg("colon", {zoom:true}); sprites([]);
  await N(T("No terminó. Por las calles aparecen figuras transparentes. Decenas, cientos, miles. Espíritus de distintas épocas avanzan sin ruido, desde todas las direcciones. Rodean la ciudad.","Он не закончил. На улицах появляются прозрачные фигуры. Десятки, сотни, тысячи. Духи разных эпох движутся бесшумно, со всех сторон. Они окружают город."));
  await say("rey", "أَيُّهَا الإسبان! سَتَعُودُ بِلَادُكُمْ إِلَى مَجْدِ الأَنْدَلُس!");
  await say("luis", T("Dicen: «¡Españoles! Su país volverá a la grandeza de Al-Ándalus».","Они говорят: «Испанцы! Ваша страна будет возвращена к величию Аль-Андалуса»."));
  await say("rey", "استسلموا! ولن يكون الانتقال مؤلماً! مدريد محاصرة.");
  await talk([
    ["luis","«Ríndanse y la transición no será dolorosa. Madrid está rodeada.»","«Сдавайтесь, и переход не будет болезненным. Мадрид окружён»."],
    ["nat","¡No me digas que sabés árabe!","Только не говори, что знаешь арабский!"],
    ["luis","Después de tantas aventuras no necesito entender: sé lo que viene.","После стольких приключений мне не нужно понимать: я знаю, что будет дальше."],
    ["luis","¡Y ahora vas a usar esto para no decir lo que prometiste!","Теперь ты воспользуешься этим, чтобы не сказать то, что обещал!"],
    ["mar","¡Luis, tenemos la ciudad rodeada por un ejército de espíritus!","Луис, у нас город окружён армией духов!"],
    ["luis","¡Muy conveniente!","Очень удобно!"],
    ["cos","Natasha… ayúdenos.","Наташа… помогите нам."],
    ["luis","Amor mío, necesito tu ayuda. Hay que llevar a la gente bajo tierra. Al metro.","Любовь моя, мне нужна твоя помощь. Людей надо увести с улиц. В метро."],
    ["mar","La estación Colón está a dos minutos. Línea 4. Mis hombres abren todos los accesos y paran los trenes.","Станция «Колон» в двух минутах отсюда. Линия четыре. Мои люди откроют все входы и остановят поезда."]]);
  give("megafono");
  hint(T("Usá el megáfono sobre la multitud. Natasha tiene un español muy… contextual.","Используйте мегафон на толпе. У Наташи очень… контекстный испанский."));
  S.hintIdle = T("La plaza no se mueve. Usá el megáfono.","Площадь не двигается. Используйте мегафон.");
  let tries = 0;
  await room(() => [
    {x:0,y:30,w:60,h:70,l:T("La multitud","Толпа"), go: () => say("mob", T("¿Qué pasa? ¿Es parte del espectáculo?","Что происходит? Это часть представления?")),
      use:{megafono: async () => {
        const c = await choose([{t:"«¡Por favor! ¡Todos al metro! ¡Ahora! ¡Rápido!»"},{t:"«¡Al metro! ¡Peligro! ¡Fantasmas!»"},{t:"«¿Sois gilipollas o qué?»"}], "nat");
        if (c === 0){ tries++; await talk([["mob","¿Perdón? ¿Qué ha dicho?","¿Perdón? ¿Qué ha dicho?"],["sra","¿De dónde es la chica? ¿Polaca? ¿Ucraniana?","Откуда эта девушка? Из Польши? Из Украины?"]]); return; }
        if (c === 1){ tries++; await talk([["mob","¿Fantasmas? Ja, ja… ¿Y quién es ella? ¿Pero por qué al metro?","¿Fantasmas? Ха-ха… ¿Y quién es ella? ¿Pero por qué al metro?"]]); return; }
        await N(T("Silencio absoluto sobre la plaza. El chico con máscara de pirata baja la mano. El hombre con la camiseta del Atlético se queda con la boca abierta.","Над площадью повисает тишина. Молодой человек в маске пирата опускает руку. Мужчина в футболке «Атлетико» так и не закрывает рот."));
        await talk([["sra","¡Ay, Dios mío! ¡Esta chica habla como mi suegra!","¡Ay, Dios mío! ¡Esta chica habla como mi suegra!"],["mob","¡Vale, vale! ¡Al metro! ¡Venga, vamos! ¡Ya habéis oído a la señora!","¡Vale, vale! ¡Al metro! ¡Venga, vamos! ¡Ya habéis oído a la señora!"]]);
        S.f.megafono = 1; return "exit"; }}},
    {x:72,y:55,w:28,h:30,l:T("Entrada del metro","Вход в метро"), go: () => say("mar", T("Abierto. ENTRADA LIBRE. Falta que la gente se mueva.","Открыто. ENTRADA LIBRE. Осталось, чтобы люди двинулись.")) }
  ]);
  await talk([
    ["luis","¿Dónde aprendiste eso?","Где ты этому научилась?"],
    ["nat","Una vez, cocinando, puse un audiolibro sobre insultos españoles. Había un capítulo entero sobre «gilipollas». Vos dijiste que el idioma se aprende en contexto.","Однажды, когда готовила ужин, включила аудиокнигу про испанские ругательства. Там была целая глава про «gilipollas». Ты же сам говорил, что язык нужно изучать в контексте."],
    ["luis","Me refería a Cervantes.","Я имел в виду Сервантеса."],
    ["nat","Cervantes también era español. Seguro que me entendería. ¡Venga, venga! ¡Que no tenemos todo el día, joder!","Сервантес тоже был испанцем. Уверена, он бы меня понял. ¡Venga, venga! ¡Que no tenemos todo el día, joder!"]]);
  setBg("mariquita"); sprites([]);
  await N(T("Una nena disfrazada de mariquita perdió a su mamá. Está sola en medio de la plaza, abrazando un toro de peluche.","Маленькая девочка в костюме божьей коровки потеряла маму. Она стоит посреди площади, крепко прижимая к себе плюшевого быка."));
  await talk([["nat","¿Dónde está tu mamá?","¿Dónde está tu mamá?"],["nina","Mamá tiene un paraguas rojo… y llora mucho.","Мама с красным зонтиком… и очень плачет."]]);
  while (true){
    const c = await choose([{t:T("Primera entrada: una señora con bolso azul","Первый вход: женщина с синей сумкой")},{t:T("Segunda entrada: una mujer llorando, con un paraguas rojo","Второй вход: плачущая женщина с красным зонтиком")},{t:T("Tercera entrada: un señor con un perro","Третий вход: мужчина с собакой")}], "nat", T("¿Adónde la lleva Natasha?","Куда Наташа несёт девочку?"));
    if (c === 1) break;
    await say("nina", T("Esa no es mi mamá…","Это не моя мама…"));
  }
  await say("nat", "¡Una mariquita! ¡He encontrado una mariquita! ¿De quién es?");
  S.f.mariquita = 1;
  await N(T("La madre se lanza hacia su hija y llora, tratando de abrazar a la vez a la nena y a Natasha.","Мать бросается к дочери, плачет и пытается одновременно обнять и ребёнка, и Наташу."));
  setBg("colon"); sprites([]);
  await N(T("En la entrada principal hay demasiada gente. Alguien grita, alguien se cuela, alguien discute si se puede bajar con un perro, dos bicicletas y una heladera de cerveza. Está por armarse una avalancha.","У главного входа слишком много людей. Кто-то кричит, кто-то лезет без очереди, кто-то спорит, можно ли спуститься в метро с собакой, двумя велосипедами и холодильником для пива. Ещё немного — и начнётся давка."));
  while (true){
    const c = await choose([{t:T("Que los agentes de Mariano pongan orden","Пусть агенты Феррейры наведут порядок")},{t:T("Que Taurán bloquee la avenida","Пусть Тауран перекроет проспект")},{t:T("…¿Y si alguien con verdadera autoridad dijera una sola palabra?","…А если бы кто-то с настоящим авторитетом сказал одно-единственное слово?")}], "luis");
    if (c === 0) { await N(T("Los agentes en traje negro lo intentan. Nadie les hace caso.","Агенты в строгих костюмах пытаются. Их никто не слушает.")); continue; }
    if (c === 1) { await N(T("Taurán, mansito, se cruza en el Paseo de Recoletos y ningún conductor se atreve a pasar. Pero en la escalera del metro siguen empujando.","Смирный Тауран встаёт поперёк Пасео-де-Реколетос, и ни один водитель не решается объехать. Но у входа в метро толкаются по-прежнему.")); await say("luis", T("Buen chico.","Хороший мальчик.")); continue; }
    break;
  }
  sprites([{k:"bib",x:50,h:78,b:2}]);
  await say("bib", T("¡SILENCIO!","ТИШЕ!"));
  await say("bib", T("Entramos de a uno. Sin hablar. Sin empujar. Esto no es un estadio.","Входим по одному. Без разговоров. Без толкотни. Это не стадион."));
  await N(T("Y la multitud obedece. Cientos de personas bajan en una columna perfecta y silenciosa.","И толпа подчиняется. Сотни людей молча, ровной колонной спускаются по лестнице."));
  sprites([{k:"luis",x:40,h:68,b:2},{k:"natb",x:60,h:68,b:2}]);
  await talk([
    ["nat","Teníamos que haberlo traído desde el principio.","Нам нужно было взять его с собой с самого начала."],
    ["luis","Les habría exigido a los toreros que agitaran las capas más bajo.","Он бы потребовал, чтобы тореадоры размахивали плащами тише."],
    ["nat","Y le habrían hecho caso. …Ahora vos.","И они бы послушались. …Теперь ты."],
    ["luis","No. Alguien tiene que frenarlos. Allá abajo hay miles de personas; si hay pánico, solo te van a escuchar a vos. A vos… y a él.","Нет. Кто-то должен их задержать. Внизу тысячи людей. Если начнётся паника, они послушают только тебя. Ну… тебя и его."],
    ["nat","Vas a invocar al Malón.","Ты собираешься вызвать Малон."],
    ["luis","Mirá allá, amor mío. Este es el momento.","Посмотри туда, любовь моя. Это он и есть."]]);
  await N(T("Natasha se saca del cuello una cadenita con una crucecita de plata y se la pone en la palma.","Наташа снимает с шеи тонкую цепочку с маленьким серебряным крестиком и вкладывает ему в ладонь."));
  give("cruz");
  await talk([["nat","Me la devolvés.","Вернёшь."],["luis","Claro.","Обязательно."],["nat","No «claro». Me la devolvés junto con vos.","Не обязательно. Обязательно — вместе с собой."]]);
  sprites([{k:"luis",x:40,h:68,b:2},{k:"bib",x:66,h:76,b:2}]);
  await talk([["bib","Suerte, señor.","Удачи, сеньор."],["bib","Y más bajo, por favor.","И потише там."]]);
  take("megafono");
};

SC.final = async () => {
  chapter(T("IX · El Malón Supremo","IX · Высший Малон")); setBg("colon", {fx:"night", size:"240% auto", pos:"100% 12%"}); sprites([]);
  await N(T("Luis se quedó solo. Plaza de Colón. Arriba, la columna con el navegante; detrás, una enorme bandera española. Por la avenida avanza un ejército. Su ejército: un hombre con camisa burdeos.","Луис остался один. Площадь Колумба. Над ним колонна с фигурой мореплавателя, за спиной огромный испанский флаг. По проспекту идёт армия. Его войско — один человек в бордовой рубашке."));
  await say("luis", T("Bueno… peor me fue. …No. Creo que no, peor no me fue nunca.","Ну что ж… Бывало и хуже. …Нет. Пожалуй, не бывало."));
  hint(T("Usá el reloj sobre Luis. Y después… abrí la billetera.","Используйте часы на Луисе. А потом… откройте бумажник."));
  S.hintIdle = T("El ejército fantasma se acerca.","Призрачная армия приближается.");
  await room(() => [
    {x:40,y:20,w:20,h:78,l:"Luis", go: () => say("luis", T("Piensa, Luis. Piensa.","Думай, Луис. Думай.")),
      use:{
        reloj: async () => {
          if (S.f.malonOk) return say("luis", T("El Malón solo no alcanza. Hace falta algo más.","Одного Малона не хватит. Нужно что-то большее."));
          await watchMenu([{t:T("TIPO DE SITUACIÓN","ТИП СИТУАЦИИ"), o:[{t:T("Peligrosa","Опасная"),m:T("Se queda corto.","Слабо сказано.")},{t:T("Complicada","Сложная"),m:T("Se queda corto.","Слабо сказано.")},{t:T("Absurda","Абсурдная"),m:T("Ya no es gracioso.","Уже не смешно.")},{t:T("Desesperada","Безнадёжная"),ok:1}]}]);
          await say("luis", T("Por lo menos alguien acá es honesto.","Хоть кто-то здесь честен."));
          await say("reloj", T("INVOCACIÓN DISPONIBLE: MALÓN","ПРИЗЫВ ДОСТУПЕН: МАЛОН"));
          await N(T("Luis levanta la mano… y se detiene. Cientos. Miles. Decenas de miles. El Malón común podría romper las primeras filas… y desaparecer sin cambiar nada.","Луис поднимает руку… и останавливается. Сотни. Тысячи. Десятки тысяч. Обычный Малон мог бы разбить первые ряды… и исчезнуть, так и не изменив исход битвы."));
          await say("luis", T("Hace falta algo más grande.","Нужно что-то большее."));
          S.f.malonOk = 1; },
        cartera: async () => {
          if (!S.f.malonOk) return say("luis", T("Primero tengo que saber a qué me enfrento.","Сначала надо понять, с чем я имею дело."));
          if (has("estampita")) return;
          await N(T("Detrás de la tarjeta, del carnet serbio y del ticket del buffet de Filosofía, hay una cartulina doblada de bordes gastados. Una estampita: el Gauchito Gil.","За банковской карточкой, сербским удостоверением и чеком из буфета философского факультета лежит маленькая сложенная картонка с потрёпанными краями. Эстампита: Гаучито Хиль."));
          give("estampita");
          await N(T("Luis recuerda a su abuela. Una casita en las afueras, una tarde de verano tan caliente que hasta las cigarras callaban. Ella, de rodillas frente al pequeño altar, encendía una vela roja.","Луису вспоминается бабушка. Маленький дом на окраине, летний вечер, такой жаркий, что даже цикады замолкали. Она стояла на коленях перед крошечным алтарём и зажигала красную свечу."));
          await N(T("—Abuela, ¿de verdad ayuda?\n—Ayuda a los que ya no tienen nada. Por eso lo quieren tanto los pobres.","— Бабушка, а он правда помогает?\n— Он помогает тем, у кого больше ничего не осталось. Поэтому его так любят бедные."));
          await say("luis", T("Bueno, abuela… parece que ya no me queda nada.","Ну что, бабушка… Кажется, у меня больше ничего не осталось."));
          hint(T("Usá la estampita (o la cruz de Natasha) sobre Luis.","Используйте эстампиту (или крестик Наташи) на Луисе.")); },
        estampita: async () => {
          if (!has("cruz")) return;
          return "exit"; },
        cruz: async () => { if (!has("estampita")) return say("luis", T("La cruz de Natasha. Se la tengo que devolver.","Крестик Наташи. Я должен его вернуть.")); return "exit"; }
      }},
    {x:70,y:10,w:30,h:70,l:T("El ejército fantasma","Призрачная армия"), go: () => N(T("Miles de guerreros translúcidos con albornoces, sables curvos y escudos redondos. A la cabeza, en un caballo blanco, el rey fantasma con su corona de plata fría.","Тысячи полупрозрачных воинов в бурнусах, с изогнутыми саблями и круглыми щитами. Во главе на белом коне — призрачный король в короне из холодного серебра.")) }
  ]);
  setBg("rezo", {zoom:true}); sprites([]);
  await N(T("Luis se arrodilla en medio de la plaza, bajo la bandera, frente al ejército. Junta las manos con la estampita y la cruz de Natasha entre las palmas. Cierra los ojos. Y reza como rezaba ella.","Луис опускается на одно колено посреди площади, под испанским флагом, перед надвигающейся армией духов. Складывает ладони, держа между ними картонку и крестик Наташи. Закрывает глаза. И начинает молиться так, как когда-то молилась она."));
  await say("luis", "Gauchito Gil, por la sangre que derramaste, por la injusticia que sufriste… Vos que ayudás a los que no tienen a nadie… Dame la fuerza que me falta. No te pido por mí. Te pido por ellos." + (L === "ru" ? "\n\n(«Гаучито Хиль, ради крови, которую ты пролил… Дай мне силу, которой мне не хватает. Я прошу не за себя. Я прошу за них».)" : ""));
  await N(T("El viento se detiene. La cinta roja de la estampita se levanta sola en el aire.","Ветер стих. Красная ленточка на эстампите медленно поднимается в воздух, хотя ветра больше нет."));
  await say("luis", T("Malón.\n…Malón Supremo.","Малон.\n…Высший Малон."));
  fx("pampa"); await hit("shake");
  await N(T("Primero, el sonido: un galope lejano, bajo el asfalto, bajo los túneles, bajo las piedras romanas y moriscas. Miles de cascos. El cielo de Madrid se vuelve rojo y naranja: la luz de la pampa.","Сначала был звук: далёкий топот, под асфальтом, под тоннелями метро, под древними римскими и мавританскими камнями. Тысячи копыт. Небо Мадрида окрашивается в красно-оранжевый: это свет пампы."));
  setBg("batalla", {zoom:true}); await hit("flashred");
  await N(T("El espacio se desgarra. Mapuches, ranqueles, tehuelches, pampas: miles de jinetes fantasmas con tacuaras y boleadoras se lanzan por el Paseo de Recoletos como una tormenta de verano sobre la llanura.","Пространство разрывается. Мапуче, ранкели, техуэльче, пампа: тысячи призрачных всадников с такуарами и болеадорасами несутся по Пасео-де-Реколетос, как летняя гроза над равниной."));
  await N(T("Al borde de la grieta carmesí, por un instante, se ve una figura sola con camisa y pañuelo rojos. No galopa. Solo mira. Luis parpadea, y ya no está.","На самом краю багрового разлома на мгновение мелькает одинокая фигура в красной рубахе и красном платке. Человек не скачет вместе со всеми. Он просто стоит и смотрит. Луис моргает — и фигуры уже нет."));
  await N(T("El frente fantasma se dobla. Tiembla. Retrocede. Y entonces el rey gira la cabeza: no hacia su ejército, sino hacia Luis. El Malón es una fuerza. Pero toda fuerza tiene una fuente. Y la fuente está sola en la plaza.","Фронт призрачной армии прогибается. Дрожит. Отступает. И тогда король поворачивает голову — не к армии, а к Луису. Малон был силой. Но у этой силы был источник. И этот источник стоял один посреди пустой площади."));
  await say("luis", T("Uy…","Ох…"));
  setBg("rey", {zoom:true}); sprites([]);
  await N(T("El rey desmonta y desenvaina su sable. Luis despliega la espada del teléfono. Un golpe. Otro. El rey es más rápido, más fuerte, infinitamente más tranquilo.","Король спешивается и вынимает саблю. Луис раскладывает меч из телефона. Удар. Ещё удар. Король быстрее, сильнее и бесконечно спокойнее."));
  await say("luis", T("Normalmente… los villanos… primero dan un discurso…","Знаешь… Обычно… злодеи… сначала произносят речь…"));
  await hit("flashred");
  await N(T("El sable traza un arco plateado. El reloj negro sale volando y se apaga. Un viento frío, del norte, ajeno, arrastra la estampita del Gauchito Gil hacia lo alto, hasta que es solo un puntito rojo… y desaparece.","Сабля описывает серебряную дугу. Чёрные часы слетают с руки и гаснут. Холодный, северный, чужой ветер подхватывает эстампиту Гаучито Хиля и уносит всё выше, пока она не превращается в крошечную красную точку… и не исчезает совсем."));
  take("reloj"); take("estampita");
  await N(T("El cielo de la pampa se apaga. Los jinetes se desvanecen uno a uno. El guerrero de la cinta roja levanta su lanza en un último saludo.","Свет пампы уходит. Всадники растворяются один за другим. Воин с красной лентой в волосах поднимает копьё в последнем приветствии."));
  await N(T("Luis, de rodillas, sangrando, aprieta en la mano izquierda la crucecita de plata de Natasha. Sobre él, el rey fantasma levanta el sable.","Луис стоит на коленях, кровь пропитала рубашку. Левая рука всё ещё сжимает маленький серебряный крестик Наташи. Над ним призрачный король медленно поднимает саблю."));
  setBg("negro"); fx("");
  await N(T("Y en algún lugar bajo tierra, en los túneles de la estación Colón, entre miles de personas asustadas, Natasha se detuvo en mitad de una frase.\n\nY sintió que se le partía el corazón.","А где-то глубоко под землёй, в тоннелях станции «Колон», среди тысяч испуганных людей, Наташа вдруг остановилась на полуслове.\n\nИ почувствовала, как у неё обрывается сердце."));
  S.scene = "fin"; save();
};

/* ---------- flow ---------- */
const FLOW = ["prologo","refugio","atocha","lavapies","lavapies2","toreros","margaritas","sala","tauran","tauran2","colon","final"];
async function play(from){
  const tok = run;
  try {
    for (let i = FLOW.indexOf(from); i < FLOW.length; i++){
      S.scene = FLOW[i]; S.hintIdle = ""; save(); closeOv(); spotEl.innerHTML = "";
      await SC[FLOW[i]](); guard(tok);
    }
    ending();
  } catch(e){ if (e !== ABORT) console.error(e); }
}
function ending(){
  setBg("final", {fx:"dark"}); sprites([]); spotEl.innerHTML = ""; chapter(T("Continuará…","Продолжение следует…"));
  const logros = [
    [S.f.cafe, T("Desayuno de reina: Luis tomó el café antes de salvar España","Королевский завтрак: Луис выпил кофе, прежде чем спасать Испанию")],
    [S.f.bofetada, T("¡PAF!: dudaste de la fidelidad de Natasha","ШЛЁП!: усомнились в верности Наташи")],
    [S.f.mariquita, T("¡Una mariquita!: devolviste a la nena a su mamá","Божья коровка!: вернули девочку маме")],
    [1, T("Hacerlo mansito: domaste a un dios ibérico con un botón","Сделать смирным: укротили иберийского бога одной кнопкой")]];
  dlgEl.className = "cq-dlg idle"; dlgEl.innerHTML = "";
  overlay(`<div class="cq-card cq-end"><h2>${T("Continuará…","Продолжение следует…")}</h2>
    <p>${T("La novela «La hora salvaje: El carnaval de la discordia» de Robert Fader todavía se está escribiendo. ¿Qué pasará con Luis en la plaza de Colón?","Роман Роберта Фадера «Дикий час: Карнавал раздора» ещё пишется. Что будет с Луисом на площади Колумба?")}</p>
    <ul>${logros.map(([ok, t]) => `<li class="${ok ? "" : "off"}">${ok ? "🏅" : "▫️"} ${esc(t)}</li>`).join("")}</ul>
    <div><a class="cq-btn" href="#/dikij-chas-karnaval-razdora">${T("Leer la novela (en ruso)","Читать роман")}</a><button class="cq-btn ghost" data-a="again">${T("Jugar de nuevo","Играть заново")}</button></div></div>`);
  ovEl.querySelector('[data-a="again"]').onclick = e => { e.stopPropagation(); wipe(); start(true); };
}
function titleScreen(){
  setBg("titulo"); fx(""); sprites([]); spotEl.innerHTML = ""; chapter("");
  dlgEl.className = "cq-dlg idle"; dlgEl.innerHTML = "";
  const saved = load(); const can = saved && saved.scene && saved.scene !== "prologo";
  const t = document.createElement("div"); t.className = "cq-title";
  t.innerHTML = `<div class="k">${T("Quest","Квест")}</div><h1>${T("La hora salvaje","Дикий час")}<small>${T("El carnaval de la discordia","Карнавал раздора")}</small></h1><div class="by">${T("Una aventura basada en la novela de Robert Fader","Приключение по роману Роберта Фадера")}</div>
    <div class="acts">${can ? `<button class="cq-btn" data-a="cont">${T("Continuar","Продолжить")}</button><button class="cq-btn ghost" data-a="new">${T("Nueva partida","Новая игра")}</button>` : `<button class="cq-btn" data-a="new">${T("Empezar","Начать")}</button>`}</div>`;
  stage.appendChild(t);
  t.querySelectorAll("[data-a]").forEach(b => b.onclick = e => {
    e.stopPropagation(); t.remove();
    if (b.dataset.a === "cont" && saved.scene === "fin") { S = saved; drawInv(); ending(); return; }
    if (b.dataset.a === "cont") { S = saved; drawInv(); play(saved.scene); }
    else { wipe(); S = {scene:"prologo", inv:[], f:{}}; drawInv(); play("prologo"); }
  });
}
function start(fresh){
  run++; closeOv(); stage.querySelectorAll(".cq-title,.cq-target,.cq-toast").forEach(x => x.remove());
  selected = null; S = {scene:"prologo", inv:[], f:{}}; drawInv();
  titleScreen();
}

function mount(el, lang, opts = {}){
  L = lang === "ru" ? "ru" : "es";
  run++;
  el.innerHTML = `<div class="cq"><div class="cq-wrap">
    <div class="cq-top"><a href="#/">← ${esc(opts.back || T("Volver a las novelas","К романам"))}</a><div class="cq-ch"></div>
      <button class="cq-tb" data-a="spots" aria-pressed="false">🔍 ${T("Zonas","Зоны")}</button><button class="cq-tb" data-a="hint">💡 ${T("Pista","Подсказка")}</button><button class="cq-tb" data-a="menu">☰ ${T("Inicio","Меню")}</button></div>
    <div class="cq-screen"><div class="cq-stage"><div class="cq-bg"></div><div class="cq-fx"></div><div class="cq-spr"></div><div class="cq-spots"></div><div class="cq-ov"></div></div><div class="cq-dlg idle"></div></div>
    <div class="cq-inv"></div>
    <p class="cq-note">${T("Tocá las cosas de la escena para mirarlas. Para usar un objeto, tocalo en el inventario y después tocá dónde usarlo; tocalo dos veces para examinarlo.","Нажимайте на предметы в сцене, чтобы их рассмотреть. Чтобы использовать предмет, выберите его в инвентаре и нажмите туда, где его применить; нажмите дважды, чтобы рассмотреть.")}<br>${T("Basado en la novela","По роману")} <a href="#/dikij-chas-karnaval-razdora">«Дикий час: Карнавал раздора»</a>.</p>
  </div></div>`;
  root = el.querySelector(".cq"); stage = root.querySelector(".cq-stage"); bgEl = root.querySelector(".cq-bg"); fxEl = root.querySelector(".cq-fx");
  sprEl = root.querySelector(".cq-spr"); spotEl = root.querySelector(".cq-spots"); ovEl = root.querySelector(".cq-ov"); dlgEl = root.querySelector(".cq-dlg");
  invEl = root.querySelector(".cq-inv"); chEl = root.querySelector(".cq-ch");
  const img = new Image(); img.onload = () => { sheetOk = true; if (S) drawInv(); }; img.src = BASE + "objetos.png";
  invEl.onclick = e => {
    const b = e.target.closest("[data-it]"); if (!b) return; e.stopPropagation();
    const id = b.dataset.it;
    if (selected === id){ selected = null; drawInv(); if (onInvPick) onInvPick(id, true); else toast(`<b>${esc(ITEMS()[id].n)}</b>. ${esc(ITEMS()[id].d)}`, 4200); return; }
    selected = id; drawInv();
    if (!onInvPick) { selected = null; drawInv(); toast(`<b>${esc(ITEMS()[id].n)}</b>. ${esc(ITEMS()[id].d)}`, 4200); }
    else toast(T(`Usar <b>${esc(ITEMS()[id].n)}</b> en… (tocalo otra vez para examinarlo)`,`Использовать <b>${esc(ITEMS()[id].n)}</b> на… (нажмите ещё раз, чтобы рассмотреть)`), 2600);
  };
  root.querySelector('[data-a="spots"]').onclick = e => { const on = !root.classList.contains("show-spots"); root.classList.toggle("show-spots", on); e.currentTarget.setAttribute("aria-pressed", on); };
  root.querySelector('[data-a="hint"]').onclick = () => toast(`💡 ${esc(S && S.hint || T("Tocá la pantalla para seguir.","Нажмите на экран, чтобы продолжить."))}`, 5000);
  root.querySelector('[data-a="menu"]').onclick = () => start(false);
  start(false);
  const stop = () => { if (!location.hash.startsWith("#/quest")) { run++; window.removeEventListener("hashchange", stop); } };
  window.addEventListener("hashchange", stop);
}
window.CarnavalQuest = { mount };
})();
