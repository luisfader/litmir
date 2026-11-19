/* «El hackeo» — juego de 10 niveles para «La chica del retrato».
   Un «hackeo» que de hackeo no tiene nada: acertijos, cuentas y un poco de sentido común.
   LitmirHack.mount(el, {lang, slug, hack:{title, about, image}}) — el progreso se guarda en hack:<slug>. */
(function(){
"use strict";
const esc = s => String(s == null ? "" : s).replace(/[&<>"']/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[c]));
const norm = s => String(s || "").toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9ñ]/g, "");
const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
const load = k => { try { return JSON.parse(localStorage.getItem(k)) || null; } catch (e) { return null; } };
const save = (k, v) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) {} };

function css(){
  if (document.getElementById("hackCss")) return;
  const s = document.createElement("style"); s.id = "hackCss";
  s.textContent = `
.hk{--g:#39e27a;--gd:#1f8a4a;--bgk:#07110b;--pk:#0d1c13;--tx:#cfeedd;--mu:#7fa892;--warn:#ffcf5a;--bad:#ff7a6b;
  font:15px/1.55 var(--sans);color:var(--tx);background:var(--bgk);border-radius:14px;padding:16px;box-shadow:0 6px 30px rgba(0,0,0,.3);position:relative;overflow:hidden}
.hk::before{content:"";position:absolute;inset:0;pointer-events:none;background:repeating-linear-gradient(0deg,rgba(57,226,122,.035) 0 1px,transparent 1px 3px)}
.hk *{box-sizing:border-box}.hk [hidden]{display:none!important}
.hk h3{font:700 20px/1.25 ui-monospace,Menlo,Consolas,monospace;color:var(--g);margin:0 0 6px;letter-spacing:.3px}
.hk h4{font:700 15px ui-monospace,Menlo,Consolas,monospace;color:var(--g);margin:14px 0 6px}
.hk p{margin:0 0 10px}.hk .hk-mu{color:var(--mu);font-size:13.5px}
.hk .hk-mono{font-family:ui-monospace,Menlo,Consolas,monospace}
.hk .hk-top{display:flex;align-items:center;justify-content:space-between;gap:8px;margin-bottom:10px}
.hk .hk-bar{height:6px;background:#12301f;border-radius:4px;overflow:hidden;margin:8px 0 14px}.hk .hk-bar i{display:block;height:100%;background:var(--g);transition:width .4s}
.hk .hk-lv{display:grid;grid-template-columns:repeat(auto-fill,minmax(150px,1fr));gap:8px}
.hk .hk-lv button{all:unset;cursor:pointer;background:var(--pk);border:1px solid #1d3b29;border-radius:10px;padding:10px;display:flex;gap:8px;align-items:flex-start;min-height:62px}
.hk .hk-lv button:hover:not([disabled]){border-color:var(--g)}
.hk .hk-lv button[disabled]{opacity:.45;cursor:not-allowed}
.hk .hk-lv b{display:block;font:700 12px ui-monospace,Menlo,monospace;color:var(--g)}.hk .hk-lv small{display:block;font-size:13px;line-height:1.3;color:var(--tx)}
.hk .hk-lv .hk-e{font-size:22px;line-height:1}
.hk .hk-card{background:var(--pk);border:1px solid #1d3b29;border-radius:12px;padding:14px;margin:10px 0}
.hk .hk-story{border-left:3px solid var(--gd);padding-left:10px}
.hk button.hk-b{all:unset;cursor:pointer;display:inline-block;background:var(--g);color:#04210f;font:700 14px var(--sans);padding:9px 14px;border-radius:9px;margin:4px 6px 4px 0}
.hk button.hk-b:hover{filter:brightness(1.1)}.hk button.hk-b.hk-o{background:transparent;color:var(--g);border:1px solid var(--gd)}
.hk button.hk-b[disabled]{opacity:.4;cursor:not-allowed}
.hk input.hk-in{width:100%;max-width:320px;background:#030a06;color:var(--g);border:1px solid var(--gd);border-radius:8px;padding:9px 11px;font:16px ui-monospace,Menlo,monospace;outline:none}
.hk input.hk-in:focus{border-color:var(--g);box-shadow:0 0 0 2px rgba(57,226,122,.2)}
.hk textarea.hk-in{width:100%;max-width:none;min-height:70px;resize:vertical;background:#030a06;color:var(--g);border:1px solid var(--gd);border-radius:8px;padding:9px 11px;font:15px ui-monospace,Menlo,monospace}
.hk .hk-msg{min-height:22px;font:14px ui-monospace,Menlo,monospace;margin:8px 0}.hk .hk-ok{color:var(--g)}.hk .hk-no{color:var(--bad)}.hk .hk-w{color:var(--warn)}
.hk .hk-win{background:#0f2a1a;border:1px solid var(--g);border-radius:12px;padding:14px;margin-top:12px;animation:hkIn .4s ease}
@keyframes hkIn{from{opacity:0;transform:translateY(8px)}to{opacity:1;transform:none}}
.hk .hk-hint{background:#2a2410;border:1px dashed var(--warn);color:#ffe7a6;border-radius:8px;padding:8px 10px;font-size:14px;margin-top:8px}
.hk .hk-desk{display:flex;flex-wrap:wrap;gap:8px;margin:6px 0 10px}
.hk .hk-desk button{all:unset;cursor:pointer;font-size:30px;width:56px;height:56px;display:grid;place-items:center;background:#10241a;border:1px solid #1d3b29;border-radius:12px;transition:transform .15s}
.hk .hk-desk button:hover{transform:translateY(-2px);border-color:var(--g)}.hk .hk-desk button.seen{border-color:var(--gd);background:#143322}
.hk .hk-note{background:#fff8c4;color:#3b3205;font:15px/1.4 "Comic Sans MS","Segoe Print",cursive;padding:10px 12px;border-radius:4px;transform:rotate(-1deg);box-shadow:2px 3px 0 rgba(0,0,0,.3);margin:6px 0 10px;max-width:420px}
.hk .hk-mem{list-style:none;padding:0;margin:0 0 10px}.hk .hk-mem li{padding:6px 0;border-bottom:1px dashed #1d3b29}.hk .hk-mem li::before{content:"🧠 "}
.hk .hk-big{font:700 28px ui-monospace,Menlo,monospace;color:var(--g)}
.hk .hk-hist{font:14px ui-monospace,Menlo,monospace;margin:8px 0 0;padding:0;list-style:none;max-height:170px;overflow:auto}
.hk .hk-site{background:#fffdf6;color:#333;border-radius:10px;overflow:hidden;font-family:Georgia,serif}
.hk .hk-site header{background:#3d8b37;color:#fff;padding:12px;text-align:center}.hk .hk-site header b{font-size:20px;display:block}.hk .hk-site header small{opacity:.9}
.hk .hk-prods{display:grid;grid-template-columns:repeat(auto-fill,minmax(130px,1fr));gap:8px;padding:12px}
.hk .hk-prod{border:1px solid #e3dccb;border-radius:8px;padding:8px;text-align:center;background:#fff}.hk .hk-prod span{font-size:34px;display:block}.hk .hk-prod b{display:block}.hk .hk-prod small{display:block;color:#666;font-size:12.5px;line-height:1.35}
.hk .hk-prod.hk-onion{outline:2px solid transparent;transition:outline .3s}.hk .hk-prod.hk-onion.edited{outline-color:#c0392b}
.hk .hk-site footer{font-size:12px;color:#888;padding:8px 12px;border-top:1px solid #eee;display:flex;justify-content:space-between;align-items:center}
.hk .hk-site footer button{all:unset;cursor:pointer;font-size:11px;opacity:.55;padding:2px 4px}.hk .hk-site footer button:hover{opacity:1}
.hk .hk-admin{background:#f2f2f2;color:#222;border-top:3px solid #999;padding:12px;font-family:var(--sans)}
.hk .hk-admin input,.hk .hk-admin textarea{background:#fff;color:#222;border:1px solid #bbb;border-radius:6px;padding:7px 9px;font:15px var(--sans);width:100%;max-width:300px;margin:2px 0 8px}
.hk .hk-admin textarea{max-width:none;min-height:60px}
.hk .hk-admin button{all:unset;cursor:pointer;background:#3d8b37;color:#fff;font:700 14px var(--sans);padding:7px 12px;border-radius:6px;margin-right:6px}
.hk .hk-admin .hk-tg{background:#888}.hk .hk-admin .hk-tg.on{background:#e67e22}
.hk .hk-admin .hk-msg{font-family:var(--sans)}.hk .hk-admin .hk-no{color:#b0302a}.hk .hk-admin .hk-ok{color:#2c7a28}.hk .hk-admin .hk-w{color:#a0610f}
.hk .hk-chat{display:flex;flex-direction:column;gap:6px;margin:8px 0}
.hk .hk-bub{max-width:80%;padding:8px 11px;border-radius:14px;font-size:14.5px;animation:hkIn .3s ease}
.hk .hk-bub.her{align-self:flex-start;background:#26364a;color:#e8f0ff;border-bottom-left-radius:4px}.hk .hk-bub.me{align-self:flex-end;background:#1d6b3e;color:#eafff2;border-bottom-right-radius:4px}
.hk .hk-opts{display:flex;flex-direction:column;gap:6px}.hk .hk-opts button{all:unset;cursor:pointer;background:#10241a;border:1px solid #1d3b29;border-radius:10px;padding:9px 11px;font-size:14.5px}.hk .hk-opts button:hover{border-color:var(--g)}
.hk .hk-heart{font-size:13px;color:var(--mu)}.hk .hk-heart b{color:#ff8fb1}
.hk .hk-rows{display:grid;gap:10px}
.hk .hk-step{display:flex;align-items:center;gap:8px;flex-wrap:wrap}.hk .hk-step > span{min-width:150px}
.hk .hk-step button{all:unset;cursor:pointer;width:34px;height:34px;display:grid;place-items:center;border-radius:8px;background:#10241a;border:1px solid var(--gd);color:var(--g);font:700 18px var(--sans)}
.hk .hk-step output{font:700 20px ui-monospace,Menlo,monospace;color:var(--g);min-width:48px;text-align:center}
.hk .hk-checks{list-style:none;padding:0;margin:8px 0}.hk .hk-checks li{padding:3px 0;font-size:14px}
.hk .hk-light{display:flex;gap:10px;align-items:center;margin:6px 0}.hk .hk-light i{width:26px;height:26px;border-radius:50%;background:#222;display:inline-block;box-shadow:inset 0 0 4px #000}
.hk .hk-light i.r{background:#e74c3c}.hk .hk-light i.y{background:#f1c40f}.hk .hk-light i.g{background:#2ecc71}
.hk .hk-mat{font:700 30px/1.2 ui-monospace,Menlo,monospace;letter-spacing:6px;background:#5a3b22;color:#e8c99a;display:inline-block;padding:14px 20px;border-radius:8px;border:4px dashed #8a6136;margin:4px 0 10px}
.hk .hk-wifi{list-style:none;padding:0;margin:6px 0 10px;font:14px ui-monospace,Menlo,monospace}.hk .hk-wifi li{padding:3px 0}
.hk .hk-dial{display:flex;align-items:center;gap:10px;flex-wrap:wrap;margin:8px 0}.hk .hk-dial input[type=range]{width:220px;accent-color:#39e27a}
.hk .hk-radio{background:linear-gradient(#5b3a26,#3a2416);border-radius:14px;padding:14px;color:#f3dcb8}
.hk .hk-freq{font:700 34px ui-monospace,Menlo,monospace;color:#ffb347;background:#1a0f06;border-radius:8px;padding:8px 14px;display:inline-block;text-shadow:0 0 8px rgba(255,179,71,.6)}
.hk .hk-stn{font:14px ui-monospace,Menlo,monospace;color:#f3dcb8;margin:6px 0 10px;min-height:20px}
.hk .hk-sw{display:flex;flex-wrap:wrap;gap:6px}
.hk .hk-sw button{all:unset;cursor:pointer;width:46px;text-align:center;padding:6px 0 4px;border-radius:8px;background:#2a1a0e;border:1px solid #7a5232}
.hk .hk-sw button i{display:block;width:18px;height:28px;margin:0 auto 3px;border-radius:5px;background:#555;position:relative}
.hk .hk-sw button i::after{content:"";position:absolute;left:2px;right:2px;height:12px;bottom:2px;background:#ccc;border-radius:3px;transition:bottom .15s}
.hk .hk-sw button.on i{background:#ffb347}.hk .hk-sw button.on i::after{bottom:14px}
.hk .hk-sw button small{font:11px ui-monospace,Menlo,monospace;color:#e8c99a}
.hk .hk-grid{display:grid;grid-template-columns:repeat(3,1fr);gap:8px;max-width:360px}
.hk .hk-grid button{all:unset;cursor:pointer;aspect-ratio:1;border-radius:12px;display:flex;flex-direction:column;align-items:center;justify-content:center;font-size:13px;text-align:center;background:#0b1410;border:1px solid #20382a;color:#4e6a5a;transition:background .2s}
.hk .hk-grid button span{font-size:26px;filter:grayscale(1) brightness(.5)}
.hk .hk-grid button.on{background:#ffe27a;color:#3b2c00;border-color:#ffd23f;box-shadow:0 0 16px rgba(255,214,80,.55)}.hk .hk-grid button.on span{filter:none}
.hk .hk-grid button.tip{outline:3px dashed var(--warn);outline-offset:2px}
.hk .hk-mirror{font:700 26px/1.3 ui-monospace,Menlo,monospace;color:#9fe8ff;background:#061620;border:1px solid #1b4a5e;border-radius:10px;padding:16px;display:inline-block;transform:scaleX(-1);text-shadow:0 0 8px rgba(120,220,255,.5);transition:transform .6s}
.hk .hk-mirror.flip{transform:scaleX(1)}
.hk .hk-slide{display:grid;grid-template-columns:repeat(3,1fr);gap:3px;width:min(100%,300px);aspect-ratio:2/3;background:#000;border-radius:8px;padding:3px}
.hk .hk-slide button{all:unset;cursor:pointer;background-repeat:no-repeat;background-size:300% 300%;border-radius:3px;position:relative}
.hk .hk-slide button.empty{background:#0b1410!important;cursor:default}
.hk .hk-slide button em{position:absolute;left:4px;top:2px;font:700 11px ui-monospace,monospace;color:#fff;text-shadow:0 0 3px #000;font-style:normal}
.hk .hk-final{background:#000;border-radius:12px;padding:18px;text-align:center;border:2px solid var(--g)}
.hk .hk-final .hk-granny{font-size:64px;line-height:1}.hk .hk-final p{font:16px/1.5 ui-monospace,Menlo,monospace;color:var(--g)}
.hk .hk-cert{background:#fbf5e4;color:#3b2f22;border:6px double #b08a3e;border-radius:6px;padding:16px;text-align:center;font-family:Georgia,serif;margin-top:12px}
.hk .hk-cert b{font-size:20px;display:block;margin:4px 0}
.hk .hk-type::after{content:"▋";animation:hkBl 1s steps(1) infinite;color:var(--g)}@keyframes hkBl{50%{opacity:0}}
`;
  document.head.appendChild(s);
}

/* ---------- Niveles ---------- */
const LEVELS = [
  {id:1, e:"👵", t:"La compu de la abuela",
   story:`La abuela Rosa te llamó desesperada: «Nene, la impresora no anda». Fuiste corriendo. Problema: la compu tiene contraseña y la abuela no se acuerda. «Era algo con el gato… o con la torta… no sé, vos sos el de las computadoras».<br><br>Revisá el escritorio. Tocá las cosas.`,
   hint:"El post-it dice cómo se arma: nombre del gato + edad de la abuela, todo junto y sin espacios.",
   win:"<b>ACCESO CONCEDIDO.</b> En el escritorio de la abuela hay: un solitario, 4.312 fotos de Don Pepe y una carpeta llamada «NO TOCAR — recetas».<br><br>Ah, y la impresora no estaba enchufada.",
   play: lv1},
  {id:2, e:"🤦", t:"La contraseña que te olvidaste",
   story:`Volviste a casa orgulloso. Abrís tu archivo más importante, <span class="hk-mono">todas_mis_contraseñas.txt</span>, y… te pide contraseña. Le pusiste contraseña al archivo de las contraseñas. Una genialidad.<br><br>Era de 4 cifras. Hacé memoria: cada recuerdo descarta combinaciones. Y podés probar las que quieras.`,
   hint:"Con los seis recuerdos queda una sola combinación. Si probás un número, 🟢 = cifra correcta en su lugar; 🟡 = la cifra está, pero en otro lugar.",
   win:`<b>ARCHIVO ABIERTO.</b> Contenido de <span class="hk-mono">todas_mis_contraseñas.txt</span>:<br><span class="hk-mono">1. Mail: la de siempre.<br>2. Banco: la de siempre pero con mayúscula.<br>3. Este archivo: 4592 (NO TE LA OLVIDES).</span>`,
   play: lv2},
  {id:3, e:"🧅", t:"La verdulería de la esquina",
   story:`Don Tito, el de la verdulería de la esquina, te vendió tres cebollas que lloraban más que vos viendo novelas. Y en su página web dice que son «de primerísima calidad».<br><br>Llegó la hora de la verdad: en la página de Don Tito va a decir que las cebollas son malas. Primero hay que encontrar por dónde se entra.`,
   hint:"1) Mirá bien el pie de la página: hay algo chiquito. 2) Don Tito no esconde nada: su verdura favorita está en la vitrina. 3) El «modo buena onda» corrige todo lo negativo: apagalo en la configuración.",
   win:"<b>PUBLICADO.</b> Al día siguiente, todo el barrio fue a la verdulería a ver si las cebollas eran tan malas como decía la página. Se agotaron en dos horas.<br><br>Don Tito, agradecido, te regaló una bolsa. De cebollas.",
   play: lv3},
  {id:4, e:"💌", t:"Operación Corazón",
   story:`Valeria, la del kiosco de enfrente, cree que sos un robot: cada vez que vas a comprar chicles le hablás de procesadores.<br><br>Misión: hacerle creer que te gusta. Tenés cuatro mensajes. Elegí bien: ella detecta el modo robot a kilómetros.`,
   hint:"Ningún truco de hacker funciona acá. Las respuestas que andan son las sinceras y simples.",
   win:"<b>MISIÓN CUMPLIDA.</b> Análisis del sistema: no tuviste que hacerle creer nada. Te gusta de verdad.<br><br><span class=\"hk-mono\">ERROR 404: hacker no encontrado. Solo un chico nervioso con un café pendiente para el sábado.</span>",
   play: lv4},
  {id:5, e:"🚦", t:"El semáforo de la avenida",
   story:`La abuela Rosa ahora cruza la avenida todos los días para ir a la verdulería (las cebollas de Don Tito están de moda). Pero el semáforo le da poquísimo tiempo y ella se para a saludar a todo el mundo.<br><br>Entraste al tablero del semáforo. Reprogramalo para que todos estén contentos.`,
   hint:"Peatones: el único múltiplo de 9 que deja lugar para los autos es 45. Con 45, autos + amarillo tienen que sumar 45, y el amarillo tiene que ser primo.",
   win:"<b>SEMÁFORO ACTUALIZADO.</b> La abuela cruzó, saludó al diariero, al perro del diariero y a Ramón el colectivero, y todavía le sobraron cinco segundos para mirar vidrieras.",
   play: lv5},
  {id:6, e:"📶", t:"El Wi-Fi del vecino",
   story:`Se cortó internet en tu casa. Ernesto, el vecino, te dijo: «Usá mi Wi-Fi, pibe, la contraseña está en el felpudo». Bajaste corriendo. En el felpudo hay algo escrito… «en código, para que no me la roben».<br><br>Ernesto tiene tres gatos, tres autos de colección y se casó tres veces. Le gusta mucho un número.`,
   hint:"Es un código César: cada letra corrida unos lugares en el abecedario. Mové la perilla hasta que aparezca una comida.",
   win:"<b>CONECTADO A «Ernesto_5G».</b> Velocidad: la de una tortuga con sueño. Pero ya podés seguir.",
   play: lv6},
  {id:7, e:"📻", t:"Radio Sinea, 101.3",
   story:`Querés dedicarle una canción a la abuela en Radio Sinea, que está en el <b>101.3 FM</b>. Pero la radio que tenés a mano es la del abuelo, y no tiene perilla: tiene diez interruptores con números.<br><br>La frecuencia es la suma de los interruptores prendidos, dividida por 10.`,
   hint:"Necesitás sumar 1013. Empezá por el más grande: 512 + 256 + 128 + 64 + 32 + 16 = 1008. ¿Cuánto falta?",
   win:"<b>AL AIRE.</b> «Esta canción va para la abuela Rosa, que cruza la avenida como una campeona». La abuela llamó a la radio para quejarse de que estaba muy fuerte. Y para pedir otra.",
   play: lv7},
  {id:8, e:"🌃", t:"Sinea a oscuras",
   story:`Se cortó la luz en nueve barrios de Sinea. Otra vez. Llegaste a la usina y el tablero es más viejo que la abuela: cada palanca cambia su barrio y también los de al lado (arriba, abajo, izquierda y derecha).<br><br>Prendé los nueve barrios.`,
   hint:"Tocar dos veces el mismo barrio es como no tocarlo. Si te trabás, el botón de pista te marca una palanca que sirve.",
   win:"<b>SINEA ILUMINADA.</b> Los vecinos salieron a los balcones a aplaudir. Uno gritó «¡Gracias, Edesur!». No le aclaraste nada.",
   play: lv8},
  {id:9, e:"🪞", t:"El código del espejo",
   story:`En la pantalla gigante de la plaza alguien dejó un mensaje que solo se lee en el espejo. El sistema dice: «Escribí lo que dice el mensaje y te dejo pasar».<br><br>No tenés espejo. Tenés que dar vuelta las letras con la cabeza.`,
   hint:"Leelo de derecha a izquierda. Son cinco palabras y empieza por «LA».",
   win:"<b>CORRECTO.</b> Un escalofrío te recorre la espalda. ¿Qué es lo que sabe la abuela? ¿Desde cuándo lo sabe?",
   play: lv9},
  {id:10, e:"🖼", t:"El retrato",
   story:`Última barrera. La pantalla gigante muestra un retrato roto en pedazos y un cartel: «Armalo y el sistema de Sinea es tuyo».<br><br>Tocá una pieza que esté al lado del hueco para moverla.`,
   hint:"Armá primero la fila de arriba, después la del medio. La última fila se acomoda girando las piezas alrededor del hueco.",
   win:"", play: lv10}
];

/* ---------- Montaje ---------- */
let root, ctx, state;
const KEY = () => "hack:" + ctx.slug;
function mount(el, opts){
  css(); ctx = opts || {}; root = el;
  state = load(KEY()) || {done:[]};
  menu();
}
const done = id => state.done.includes(id);
const unlocked = id => id === 1 || done(id - 1);
function finish(id){ if (!done(id)) { state.done.push(id); save(KEY(), state); } }

function menu(){
  const h = ctx.hack || {}, n = state.done.length;
  root.innerHTML = `<div class="hk">
    <div class="hk-top"><h3>${esc(h.title || "El hackeo")}<span class="hk-type"></span></h3><span class="hk-mu hk-mono">${n}/10</span></div>
    <p>${esc(h.about || "")}</p>
    <p class="hk-mu">⚠️ Aviso legal: en este juego nadie hackea nada. Son acertijos, cuentas y mucha cara dura. Ninguna abuela, verdulero ni semáforo salió lastimado.</p>
    <div class="hk-bar"><i style="width:${n * 10}%"></i></div>
    <div class="hk-lv">${LEVELS.map(L => `<button type="button" data-lv="${L.id}" ${unlocked(L.id) ? "" : "disabled"}>
      <span class="hk-e">${unlocked(L.id) ? L.e : "🔒"}</span><span><b>NIVEL ${L.id}${done(L.id) ? " ✓" : ""}</b><small>${unlocked(L.id) ? esc(L.t) : "Bloqueado"}</small></span></button>`).join("")}</div>
    ${n ? `<p style="margin-top:12px"><button type="button" class="hk-b hk-o" data-reset>Borrar progreso</button></p>` : ""}
  </div>`;
  root.querySelectorAll("[data-lv]").forEach(b => b.onclick = () => level(+b.dataset.lv));
  const r = root.querySelector("[data-reset]");
  if (r) r.onclick = () => { if (confirm("¿Borrar todo el progreso de «El hackeo»?")) { state = {done:[]}; save(KEY(), state); menu(); } };
}

function level(id){
  const L = LEVELS[id - 1];
  root.innerHTML = `<div class="hk">
    <div class="hk-top"><button type="button" class="hk-b hk-o" data-back>← Niveles</button><span class="hk-mu hk-mono">NIVEL ${id}/10</span></div>
    <h3>${L.e} ${esc(L.t)}</h3>
    <div class="hk-card hk-story"><p>${L.story}</p></div>
    <div class="hk-play"></div>
    <p><button type="button" class="hk-b hk-o" data-hint>💡 Pista</button></p>
    <div class="hk-hint" hidden>${esc(L.hint)}</div>
    <div class="hk-end"></div>
  </div>`;
  const box = root.querySelector(".hk");
  box.querySelector("[data-back]").onclick = menu;
  box.querySelector("[data-hint]").onclick = () => { box.querySelector(".hk-hint").hidden = false; };
  const win = () => {
    finish(id);
    box.querySelector("[data-hint]").parentNode.hidden = true; box.querySelector(".hk-hint").hidden = true;
    const end = box.querySelector(".hk-end");
    end.innerHTML = id === 10 ? finale() : `<div class="hk-win"><p>${L.win}</p>
      <button type="button" class="hk-b" data-next>Nivel ${id + 1} →</button><button type="button" class="hk-b hk-o" data-menu>Niveles</button></div>`;
    const nx = end.querySelector("[data-next]"); if (nx) nx.onclick = () => level(id + 1);
    end.querySelectorAll("[data-menu]").forEach(b => b.onclick = menu);
    setTimeout(() => end.scrollIntoView({block:"nearest", behavior:"smooth"}), 60);
  };
  L.play(box.querySelector(".hk-play"), win);
  root.scrollIntoView({block:"start", behavior:"smooth"});
}

/* Una caja de «escribí la contraseña» reutilizable */
function pwBox(el, label, check, onWin){
  el.insertAdjacentHTML("beforeend", `<div class="hk-card"><label class="hk-mono hk-mu">${esc(label)}</label><br>
    <input class="hk-in" type="text" autocomplete="off" autocapitalize="off" spellcheck="false" placeholder="••••••••">
    <button type="button" class="hk-b">Entrar</button><div class="hk-msg"></div></div>`);
  const c = el.lastElementChild, inp = c.querySelector("input"), msg = c.querySelector(".hk-msg");
  const go = () => { const r = check(inp.value); if (r === true) { msg.className = "hk-msg hk-ok"; msg.textContent = "✔ Correcto"; inp.disabled = true; c.querySelector("button").disabled = true; onWin(); } else { msg.className = "hk-msg hk-no"; msg.textContent = r; } };
  c.querySelector("button").onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); };
  return c;
}

/* ---------- Nivel 1: la compu de la abuela ---------- */
function lv1(el, win){
  const items = [
    ["🐈", "Una foto enmarcada de un gato gordo y naranja. Abajo dice: «Don Pepe, el rey de la casa»."],
    ["🎂", "Lo que queda de la torta del domingo. Las velitas son un 8 y un 3: la abuela cumplió 83."],
    ["📝", "post"],
    ["🧶", "Un ovillo de lana. No es una pista, pero es suavecito."],
    ["📺", "La tele está en el canal de cocina. La abuela siempre está en el canal de cocina."],
    ["👓", "Los anteojos de la abuela. Con razón no se acordaba de la contraseña: no la veía."]
  ];
  el.innerHTML = `<div class="hk-desk">${items.map((x, i) => `<button type="button" data-i="${i}" aria-label="Mirar">${x[0]}</button>`).join("")}</div><div class="hk-clue hk-mu">Tocá algo del escritorio.</div>`;
  const clue = el.querySelector(".hk-clue");
  el.querySelectorAll("[data-i]").forEach(b => b.onclick = () => {
    b.classList.add("seen"); const t = items[+b.dataset.i][1];
    clue.innerHTML = t === "post" ? `Un post-it pegado <b>en el monitor</b>, a la vista de todo el barrio:<div class="hk-note">Contraseña de la compu:<br>el nombre del gato + mi edad.<br>Todo junto, sin espacios.<br><b>¡NO LEER!</b></div>` : `<p>${esc(t)}</p>`;
    clue.className = "hk-clue";
  });
  const bad = ["Nop. La compu dice: «Contraseña incorrecta, querida».", "No. La abuela, desde la cocina: «¡No me la rompas, eh!».", "Tampoco. ¿Leíste el post-it? Está pegado en el monitor."];
  let k = 0;
  pwBox(el, "CONTRASEÑA DE «Rosa»:", v => norm(v) === "donpepe83" ? true : (norm(v) === "pepe83" ? "Casi: el gato tiene título. Es «Don»." : norm(v).includes("83") || norm(v).includes("pepe") ? "¡Caliente! Revisá el orden: gato primero, edad después." : bad[k++ % bad.length]), win);
}

/* ---------- Nivel 2: la contraseña olvidada (Mastermind con recuerdos) ---------- */
function lv2(el, win){
  const SECRET = "4592";
  const MEM = [
    ["Eran cuatro cifras, todas distintas.", p => new Set(p).size === 4],
    ["Sumaban 20. Como los años que tenía cuando aprendí a hacer milanesas.", p => p.reduce((a, b) => a + b, 0) === 20],
    ["La primera era el doble de la última.", p => p[0] === 2 * p[3]],
    ["La segunda era impar, como mis medias.", p => p[1] % 2 === 1],
    ["La tercera era más grande que la segunda.", p => p[2] > p[1]],
    ["No tenía ningún 8. Le tengo miedo al 8 desde chico.", p => !p.includes(8)]
  ];
  let shown = 0; const hist = [];
  const all = []; for (let i = 0; i < 10000; i++) all.push(String(i).padStart(4, "0").split("").map(Number));
  el.innerHTML = `<div class="hk-card"><h4>Recuerdos</h4><ul class="hk-mem"></ul>
    <button type="button" class="hk-b hk-o" data-mem>🧠 Hacer memoria</button>
    <p class="hk-mu" style="margin-top:8px">Combinaciones posibles: <span class="hk-big" data-cnt>10000</span></p></div>
    <div class="hk-card"><label class="hk-mono hk-mu">PROBAR UNA COMBINACIÓN (4 cifras):</label><br>
    <input class="hk-in" inputmode="numeric" maxlength="4" autocomplete="off" placeholder="0000"> <button type="button" class="hk-b" data-try>Probar</button>
    <div class="hk-msg"></div><ul class="hk-hist"></ul></div>`;
  const ul = el.querySelector(".hk-mem"), cnt = el.querySelector("[data-cnt]"), memB = el.querySelector("[data-mem]");
  const recount = () => { const n = all.filter(p => MEM.slice(0, shown).every(m => m[1](p))).length; cnt.textContent = n; };
  memB.onclick = () => { if (shown >= MEM.length) return; ul.insertAdjacentHTML("beforeend", `<li>${esc(MEM[shown][0])}</li>`); shown++; recount(); if (shown === MEM.length) { memB.disabled = true; memB.textContent = "No te acordás de nada más"; } };
  const inp = el.querySelector("input"), msg = el.querySelector(".hk-msg"), hl = el.querySelector(".hk-hist");
  const jokes = ["Ese es el PIN de la tarjeta de la biblioteca.", "Ese es el número de la pizzería.", "Esa es la combinación del candado de la bici. Que te robaron.", "Ese es el código postal de la abuela."];
  const go = () => {
    const v = inp.value.replace(/\D/g, "");
    if (v.length !== 4) { msg.className = "hk-msg hk-w"; msg.textContent = "Tienen que ser 4 cifras."; return; }
    let g = 0, y = 0; const sa = SECRET.split(""), va = v.split("");
    va.forEach((d, i) => { if (d === sa[i]) g++; });
    const used = {}; sa.forEach((d, i) => { if (va[i] !== d) used[d] = (used[d] || 0) + 1; });
    va.forEach((d, i) => { if (d !== sa[i] && used[d]) { y++; used[d]--; } });
    hist.unshift(`${v}  ${"🟢".repeat(g)}${"🟡".repeat(y)}${!g && !y ? "—" : ""}`);
    hl.innerHTML = hist.map(h => `<li>${esc(h)}</li>`).join("");
    if (v === SECRET) { msg.className = "hk-msg hk-ok"; msg.textContent = `✔ ¡Era esa! Te llevó ${hist.length} intento${hist.length > 1 ? "s" : ""}.`; inp.disabled = true; el.querySelector("[data-try]").disabled = true; win(); }
    else { msg.className = "hk-msg hk-no"; msg.textContent = "✖ " + jokes[hist.length % jokes.length]; inp.select(); }
  };
  el.querySelector("[data-try]").onclick = go; inp.onkeydown = e => { if (e.key === "Enter") go(); };
}

/* ---------- Nivel 3: la verdulería ---------- */
function lv3(el, win){
  const NICE = "Cebollas de primerísima calidad. ¡Te hacen llorar de la emoción!";
  el.innerHTML = `<div class="hk-site">
    <header><b>🥬 Verdulería Don Tito</b><small>Frescura desde 1987 · Envíos a toda la cuadra</small></header>
    <div class="hk-prods">
      <div class="hk-prod"><span>🍅</span><b>Tomate perita</b><small>Rojos como Don Tito cuando le preguntan la edad.</small></div>
      <div class="hk-prod"><span>🥒</span><b>Zapallito redondo</b><small>¡Mi verdura favorita de toda la vida! — Tito</small></div>
      <div class="hk-prod hk-onion"><span>🧅</span><b>Cebolla</b><small data-onion>${esc(NICE)}</small></div>
      <div class="hk-prod"><span>🥔</span><b>Papa</b><small>Para puré, para fritas, para lo que quieras.</small></div>
    </div>
    <footer><span>© Don Tito · Página hecha por mi sobrino</span><button type="button" data-panel aria-label="Panel">🔧 panel (no tocar)</button></footer>
    <div class="hk-admin" hidden></div></div><div class="hk-msg hk-mu">Paso 1: encontrá la entrada al panel de Don Tito.</div>`;
  const adm = el.querySelector(".hk-admin"), step = el.querySelector(".hk-msg"), onion = el.querySelector("[data-onion]");
  el.querySelector("[data-panel]").onclick = () => {
    if (!adm.hidden) return; adm.hidden = false; step.textContent = "Paso 2: entrá al panel.";
    adm.innerHTML = `<b>🔐 Panel de administración</b><br><small>Usuario</small><br><input value="tito" readonly><br><small>Contraseña</small><br><input type="text" data-pw autocomplete="off" autocapitalize="off" placeholder="Pista: mi verdura favorita"><br><button type="button" data-login>Entrar</button><div class="hk-msg"></div>`;
    const pw = adm.querySelector("[data-pw]"), m = adm.querySelector(".hk-msg");
    const login = () => {
      const v = norm(pw.value);
      if (v === "zapallito" || v === "zapallitoredondo") return editor();
      m.className = "hk-msg hk-no"; m.textContent = v === "cebolla" ? "¿La cebolla? Por favor. Tito tiene mejor gusto." : v === "tomate" ? "El tomate es una fruta, dice Tito. Muy ofendido." : "Contraseña incorrecta. Tito, ¿sos vos?";
    };
    adm.querySelector("[data-login]").onclick = login; pw.onkeydown = e => { if (e.key === "Enter") login(); };
  };
  const BAD = /\b(mala|malas|malisimas?|feas?|podridas?|horribles?|pesimas?|espantosas?|asquerosas?|baja calidad|mala calidad|lloronas?|tristes?|un desastre|no sirven)\b/;
  const FIX = [[/\bmalisimas?\b/g, "buenísimas"], [/\bmalas?\b/g, "maravillosas"], [/\bfeas?\b/g, "hermosas"], [/\bpodridas?\b/g, "fresquitas"], [/\bhorribles?\b/g, "divinas"], [/\bpesimas?\b/g, "óptimas"], [/\bespantosas?\b/g, "espectaculares"], [/\basquerosas?\b/g, "riquísimas"], [/\blloronas?\b/g, "alegres"], [/\btristes?\b/g, "felices"], [/\bun desastre\b/g, "una maravilla"], [/\bno sirven\b/g, "sirven para todo"], [/\bbaja calidad\b/g, "altísima calidad"]];
  function editor(){
    step.textContent = "Paso 3: cambiá la descripción de las cebollas.";
    let filter = true;
    adm.innerHTML = `<b>✏️ Editar producto: Cebolla</b><br><textarea data-txt>${esc(NICE)}</textarea><br>
      <button type="button" data-pub>Publicar</button><button type="button" class="hk-tg on" data-cfg>⚙️ Configuración</button>
      <div data-cfgbox hidden style="margin-top:8px;background:#fff;border:1px solid #ccc;border-radius:6px;padding:8px">
        <label><input type="checkbox" data-filter checked style="width:auto;margin-right:6px">🌸 Modo buena onda (corrige automáticamente lo negativo)</label><br>
        <label><input type="checkbox" checked style="width:auto;margin-right:6px">🎵 Música de fondo: cumbia</label><br>
        <label><input type="checkbox" checked style="width:auto;margin-right:6px">🐦 Avisarle a la tía Marta de cada cambio</label></div>
      <div class="hk-msg"></div>`;
    const txt = adm.querySelector("[data-txt]"), m = adm.querySelector(".hk-msg");
    adm.querySelector("[data-cfg]").onclick = () => { const b = adm.querySelector("[data-cfgbox]"); b.hidden = !b.hidden; };
    adm.querySelector("[data-filter]").onchange = e => { filter = e.target.checked; m.className = "hk-msg hk-w"; m.textContent = filter ? "Modo buena onda: ACTIVADO 🌸" : "Modo buena onda: apagado. Tito no lo va a notar."; };
    adm.querySelector("[data-pub]").onclick = () => {
      let v = txt.value.trim(); const low = v.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "");
      if (!v) { m.className = "hk-msg hk-no"; m.textContent = "No podés dejar la cebolla sin descripción. Pobre cebolla."; return; }
      if (!BAD.test(low)) { m.className = "hk-msg hk-no"; m.textContent = "Eso no dice que sean malas. Sé claro: escribí que son malas (o feas, o podridas…)."; return; }
      if (filter) {
        let out = low; FIX.forEach(([r, s]) => out = out.replace(r, s));
        out = out.charAt(0).toUpperCase() + out.slice(1);
        onion.textContent = out; txt.value = out;
        m.className = "hk-msg hk-w"; m.textContent = "🌸 El modo buena onda corrigió tu texto. Ahora las cebollas son todavía mejores. Revisá la configuración.";
        return;
      }
      onion.textContent = v; el.querySelector(".hk-onion").classList.add("edited");
      m.className = "hk-msg hk-ok"; m.textContent = "✔ Cambios publicados.";
      adm.querySelectorAll("button,textarea,input").forEach(x => x.disabled = true);
      step.textContent = "";
      win();
    };
  }
}

/* ---------- Nivel 4: Operación Corazón ---------- */
function lv4(el, win){
  const R = [
    {q:"Valeria levanta la vista del celular: «Hola. ¿Lo de siempre?»", o:[
      ["Hola. Iniciando protocolo de conversación v2.3.", "¿Me estás hablando o me estás instalando algo?"],
      ["Hola, Valeria. Lo de siempre, sí. ¿Te quedan de esos chicles de menta que te gustan a vos?", "¡Te acordaste! Me quedan dos. Uno para cada uno.", 1],
      ["¿Sabías que tu kiosco tiene la IP 192.168.0.1?", "Me voy a hacer la que no escuché eso."]]},
    {q:"«Bueno… ¿y qué contás? Hoy te veo raro.»", o:[
      ["Tus ojos tienen la resolución de un monitor 4K.", "¿Gracias…? Creo."],
      ["Sos más linda que un servidor sin errores.", "No sé qué es un servidor, pero suena a que me comparaste con una heladera."],
      ["Nada raro. Es que me gusta cómo te reís cuando te equivocás con el vuelto.", "¡Ay! Me equivoco siempre. Así que me reís siempre.", 1]]},
    {q:"Valeria se apoya en el mostrador. «A ver, ¿qué querés saber de mí?»", o:[
      ["Nada, ya sé todo: te busqué en internet.", "Eso fue espeluznante. Muy espeluznante."],
      ["Contame algo tuyo que no sepa nadie del barrio.", "Que me como los caramelos del kiosco. Y que dibujo. No se lo digas a nadie.", 1],
      ["¿Tenés Wi-Fi?", "Para vos, no."]]},
    {q:"«Bueno, me tengo que poner a acomodar las revistas… ¿algo más?»", o:[
      ["¿Querés venir a casa a ver cómo compilo un programa?", "Suena a plan para dormirse a las diez."],
      ["Te mando una invitación cifrada por calendario.", "¿Cifrada? ¿Me estás invitando o me estás secuestrando?"],
      ["Sí. ¿Te gustaría tomar un café conmigo el sábado? Prometo no hablar de computadoras.", "…Bueno. Pero si hablás de computadoras, pagás vos.", 1]]}
  ];
  let i = 0, heart = 0, oops = 0;
  el.innerHTML = `<div class="hk-card"><div class="hk-heart">Confianza de Valeria: <b data-h>🤍🤍🤍🤍</b> · Momentos robot: <span data-oops>0</span></div><div class="hk-chat"></div><div class="hk-opts"></div></div>`;
  const chat = el.querySelector(".hk-chat"), opts = el.querySelector(".hk-opts");
  const bub = (who, t) => chat.insertAdjacentHTML("beforeend", `<div class="hk-bub ${who}">${esc(t)}</div>`);
  const hearts = () => { el.querySelector("[data-h]").textContent = "❤️".repeat(heart) + "🤍".repeat(4 - heart); el.querySelector("[data-oops]").textContent = oops; };
  const ask = (r, first) => {
    if (first) bub("her", r.q);
    opts.innerHTML = shuffle(r.o.map((o, k) => k)).map(k => `<button type="button" data-k="${k}">${esc(r.o[k][0])}</button>`).join("");
    opts.querySelectorAll("[data-k]").forEach(b => b.onclick = () => {
      const o = r.o[+b.dataset.k]; bub("me", o[0]); opts.innerHTML = "";
      setTimeout(() => {
        bub("her", o[1]);
        if (o[2]) { heart++; hearts(); i++; if (i < R.length) setTimeout(() => ask(R[i], true), 700); else setTimeout(win, 400); }
        else { oops++; hearts(); setTimeout(() => ask(r, false), 700); }
      }, 550);
    });
  };
  hearts(); ask(R[0], true);
}

/* ---------- Nivel 5: el semáforo ---------- */
function lv5(el, win){
  const v = {p:20, a:60, y:10};
  const isPrime = n => n > 1 && [...Array(n).keys()].slice(2).every(d => n % d);
  const rules = [
    ["El ciclo completo dura 90 segundos exactos (si no, el semáforo se marea).", () => v.p + v.a + v.y === 90],
    ["Peatones: 40 segundos o más (la abuela saluda a todos).", () => v.p >= 40],
    ["Autos: 35 segundos o más (si no, Ramón el colectivero toca bocina).", () => v.a >= 35],
    ["Amarillo: entre 3 y 6 segundos.", () => v.y >= 3 && v.y <= 6],
    ["Peatones: múltiplo de 9 (cábala de la abuela, no se discute).", () => v.p % 9 === 0],
    ["Amarillo: número primo (el técnico del semáforo es matemático).", () => isPrime(v.y)]
  ];
  const row = (k, label, cls) => `<div class="hk-step"><span><span class="hk-light"><i class="${cls}"></i> ${label}</span></span><button type="button" data-d="${k}:-5">−5</button><button type="button" data-d="${k}:-1">−</button><output data-o="${k}"></output><button type="button" data-d="${k}:1">+</button><button type="button" data-d="${k}:5">+5</button></div>`;
  el.innerHTML = `<div class="hk-card"><div class="hk-rows">${row("p", "Verde peatones", "g")}${row("a", "Verde autos", "g")}${row("y", "Amarillo", "y")}</div>
    <p class="hk-mu" style="margin-top:10px">Total del ciclo: <b data-tot></b> s</p><ul class="hk-checks"></ul>
    <button type="button" class="hk-b" data-ok>Guardar programa</button><div class="hk-msg"></div></div>`;
  const ul = el.querySelector(".hk-checks"), msg = el.querySelector(".hk-msg");
  const draw = () => { ["p", "a", "y"].forEach(k => el.querySelector(`[data-o="${k}"]`).textContent = v[k]); el.querySelector("[data-tot]").textContent = v.p + v.a + v.y; ul.innerHTML = rules.map(r => `<li>${r[1]() ? "✅" : "⬜"} ${esc(r[0])}</li>`).join(""); };
  el.querySelectorAll("[data-d]").forEach(b => b.onclick = () => { const [k, d] = b.dataset.d.split(":"); v[k] = Math.max(1, Math.min(90, v[k] + +d)); draw(); });
  el.querySelector("[data-ok]").onclick = () => {
    const bad = rules.filter(r => !r[1]());
    if (!bad.length) { msg.className = "hk-msg hk-ok"; msg.textContent = "✔ Programa guardado."; el.querySelectorAll("button").forEach(b => b.disabled = true); win(); }
    else { msg.className = "hk-msg hk-no"; msg.textContent = "✖ El semáforo se niega: «" + bad[0][0] + "»"; }
  };
  draw();
}

/* ---------- Nivel 6: el Wi-Fi del vecino (código César) ---------- */
function lv6(el, win){
  const PLAIN = "EMPANADA", SH = 3, A = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const enc = PLAIN.split("").map(c => A[(A.indexOf(c) + SH) % 26]).join("");
  const dec = n => enc.split("").map(c => A[(A.indexOf(c) - n + 26) % 26]).join("");
  el.innerHTML = `<div class="hk-card"><p class="hk-mu">Redes disponibles:</p><ul class="hk-wifi"><li>📶 NO_ES_LA_POLICIA</li><li>📶 Virus_Gratis_HacéClick</li><li>📶 <b>Ernesto_5G</b> 🔒</li><li>📶 La_de_la_abuela (pide contraseña: donpepe83, seguro)</li></ul>
    <p>En el felpudo de Ernesto dice:</p><div class="hk-mat">${enc}</div>
    <div class="hk-dial"><label for="hkSh">Correr letras hacia atrás:</label><input id="hkSh" type="range" min="0" max="25" value="0"><b class="hk-mono" data-n>0</b></div>
    <p class="hk-mono">Se lee: <span class="hk-big" data-dec>${enc}</span></p></div>`;
  const r = el.querySelector("#hkSh");
  r.oninput = () => { el.querySelector("[data-n]").textContent = r.value; el.querySelector("[data-dec]").textContent = dec(+r.value); };
  pwBox(el, "CONTRASEÑA DE «Ernesto_5G»:", v => norm(v) === "empanada" ? true : norm(v) === norm(enc) ? "Eso es lo que dice el felpudo, pero está en código." : "Conexión rechazada. Ernesto, desde el balcón: «¡Está en el felpudo, pibe!»", win);
}

/* ---------- Nivel 7: Radio Sinea (binario) ---------- */
function lv7(el, win){
  const VAL = [512, 256, 128, 64, 32, 16, 8, 4, 2, 1], on = VAL.map(() => false), TARGET = 1013;
  const ST = {880:"FM Tango Viejo: «…y el bandoneón lloraba…»", 905:"Radio Horóscopo: «Géminis, hoy no hackees nada»", 950:"La 95: cumbia sin parar", 999:"FM Recetas: «…y a las cebollas no les hagan caso…»", 1000:"FM Cien: transmisión del partido del barrio", 1023:"Radio Todo Prendido: «¡bajen el volumen!»", 1010:"Radio Pronóstico: «llueve en Sinea, como siempre»"};
  el.innerHTML = `<div class="hk-radio"><div class="hk-freq" data-f>0.0</div> <span class="hk-mono">FM</span><div class="hk-stn" data-s>kshhhh…</div>
    <div class="hk-sw">${VAL.map((v, i) => `<button type="button" data-i="${i}"><i></i><small>${v}</small></button>`).join("")}</div></div><div class="hk-msg"></div>`;
  const f = el.querySelector("[data-f]"), s = el.querySelector("[data-s]"), msg = el.querySelector(".hk-msg");
  let won = false;
  const draw = () => {
    const sum = VAL.reduce((a, v, i) => a + (on[i] ? v : 0), 0);
    f.textContent = (sum / 10).toFixed(1);
    s.textContent = sum === TARGET ? "📻 Radio Sinea 101.3: «¡Hola, hola! ¿Quién está en la línea?»" : ST[sum] || (Math.abs(sum - TARGET) <= 8 ? "kshh… «…Radio Si…» …kshhh (¡cerca!)" : "kshhhh…");
    msg.className = "hk-msg hk-mu"; msg.textContent = sum === TARGET ? "" : sum > TARGET ? "Te pasaste de frecuencia." : `Faltan ${((TARGET - sum) / 10).toFixed(1)} MHz.`;
    if (sum === TARGET && !won) { won = true; el.querySelectorAll("[data-i]").forEach(b => b.disabled = true); win(); }
  };
  el.querySelectorAll("[data-i]").forEach(b => b.onclick = () => { if (won) return; const i = +b.dataset.i; on[i] = !on[i]; b.classList.toggle("on", on[i]); draw(); });
  draw();
}

/* ---------- Nivel 8: Sinea a oscuras (Lights Out 3×3) ---------- */
function lv8(el, win){
  const NB = [["⚓", "Puerto"], ["🏛", "Centro"], ["⛰", "Las Lomas"], ["⛲", "La Plaza"], ["🛒", "Mercado"], ["🚉", "Estación"], ["🗼", "El Faro"], ["🌳", "Parque"], ["🌉", "El Río"]];
  const nbr = i => [i, i - 3, i + 3, i % 3 ? i - 1 : -1, i % 3 < 2 ? i + 1 : -1].filter(j => j >= 0 && j < 9);
  const press = (b, i) => { nbr(i).forEach(j => b[j] = !b[j]); };
  let start; do { start = Array(9).fill(true); shuffle([...Array(9).keys()]).slice(0, 4).forEach(i => press(start, i)); } while (start.every(Boolean) || start.filter(Boolean).length > 5);
  let b = start.slice(), moves = 0, won = false;
  const solve = st => { for (let m = 0; m < 512; m++) { const t = st.slice(); for (let i = 0; i < 9; i++) if (m >> i & 1) press(t, i); if (t.every(Boolean)) return [...Array(9).keys()].filter(i => m >> i & 1); } return []; };
  el.innerHTML = `<div class="hk-card"><div class="hk-grid">${NB.map((n, i) => `<button type="button" data-i="${i}"><span>${n[0]}</span>${n[1]}</button>`).join("")}</div>
    <p class="hk-mu" style="margin-top:10px">Barrios con luz: <b data-c></b>/9 · Palancas: <b data-m>0</b></p>
    <button type="button" class="hk-b hk-o" data-tip>🔦 ¿Cuál toco?</button><button type="button" class="hk-b hk-o" data-rs>↺ Empezar de nuevo</button></div>`;
  const cells = el.querySelectorAll("[data-i]");
  const draw = () => { cells.forEach((c, i) => { c.classList.toggle("on", b[i]); c.classList.remove("tip"); }); el.querySelector("[data-c]").textContent = b.filter(Boolean).length; el.querySelector("[data-m]").textContent = moves; };
  cells.forEach(c => c.onclick = () => { if (won) return; press(b, +c.dataset.i); moves++; draw(); if (b.every(Boolean)) { won = true; win(); } });
  el.querySelector("[data-tip]").onclick = () => { if (won) return; const s = solve(b); if (s.length) { draw(); cells[s[0]].classList.add("tip"); } };
  el.querySelector("[data-rs]").onclick = () => { if (won) return; b = start.slice(); moves = 0; draw(); };
  draw();
}

/* ---------- Nivel 9: el código del espejo ---------- */
function lv9(el, win){
  const PHRASE = "LA ABUELA YA SABE TODO";
  el.innerHTML = `<div class="hk-card" style="text-align:center"><div class="hk-mirror">${PHRASE}</div>
    <p class="hk-mu" style="margin-top:10px"><button type="button" class="hk-b hk-o" data-peek>🪞 Mirar un segundo en el vidrio</button></p></div>`;
  let peeks = 0;
  el.querySelector("[data-peek]").onclick = e => {
    if (peeks >= 2) { e.target.disabled = true; e.target.textContent = "El vidrio se empañó"; return; }
    peeks++; const m = el.querySelector(".hk-mirror"); m.classList.add("flip"); setTimeout(() => m.classList.remove("flip"), 700);
    if (peeks >= 2) { e.target.disabled = true; e.target.textContent = "El vidrio se empañó"; }
  };
  pwBox(el, "EL MENSAJE DICE:", v => norm(v) === norm(PHRASE) ? true : norm(v).startsWith("laabuela") ? "Vas bien… seguí leyendo." : "La pantalla parpadea: «Leelo al revés, genio».", win);
}

/* ---------- Nivel 10: el retrato (rompecabezas deslizante) ---------- */
function lv10(el, win){
  const img = (ctx.hack && ctx.hack.image) || `novels/${ctx.slug}/cover.jpg`;
  const solved = [0, 1, 2, 3, 4, 5, 6, 7, 8]; // 8 = hueco
  let t = solved.slice(), last = -1;
  const adj = i => [i - 3, i + 3, i % 3 ? i - 1 : -1, i % 3 < 2 ? i + 1 : -1].filter(j => j >= 0 && j < 9);
  do { t = solved.slice(); let h = 8; for (let k = 0; k < 60; k++) { const o = adj(h).filter(j => j !== last); const j = o[Math.floor(Math.random() * o.length)]; [t[h], t[j]] = [t[j], t[h]]; last = h; h = j; } } while (t.every((v, i) => v === i));
  let moves = 0, won = false, nums = false;
  el.innerHTML = `<div class="hk-card"><div class="hk-slide"></div><p class="hk-mu" style="margin-top:8px">Movimientos: <b data-m>0</b></p>
    <button type="button" class="hk-b hk-o" data-num>🔢 Mostrar números</button></div>`;
  const g = el.querySelector(".hk-slide");
  const draw = () => {
    g.innerHTML = t.map((v, i) => v === 8 && !won ? `<button type="button" class="empty" aria-label="Hueco"></button>` :
      `<button type="button" data-i="${i}" style="background-image:url('${esc(img)}');background-position:${(v % 3) * 50}% ${Math.floor(v / 3) * 50}%">${nums && !won ? `<em>${v + 1}</em>` : ""}</button>`).join("");
    el.querySelector("[data-m]").textContent = moves;
    g.querySelectorAll("[data-i]").forEach(b => b.onclick = () => {
      if (won) return; const i = +b.dataset.i, h = t.indexOf(8);
      if (!adj(h).includes(i)) return;
      [t[h], t[i]] = [t[i], t[h]]; moves++;
      if (t.every((v, k) => v === k)) { won = true; draw(); el.querySelector("[data-num]").hidden = true; setTimeout(win, 500); } else draw();
    });
  };
  el.querySelector("[data-num]").onclick = e => { nums = !nums; e.target.textContent = nums ? "🔢 Ocultar números" : "🔢 Mostrar números"; draw(); };
  draw();
}

function finale(){
  const d = new Date().toLocaleDateString("es-AR", {day:"numeric", month:"long", year:"numeric"});
  return `<div class="hk-win"><div class="hk-final">
      <p>&gt; ACCESO TOTAL AL SISTEMA DE SINEA…<br>&gt; Cargando mensaje del administrador…</p>
      <div class="hk-granny">👵</div>
      <p><b>«Muy bien, nene. Te estuve mirando todo el tiempo.<br>Ahora vení a tomar la leche, que se enfría.<br>Y enchufá la impresora.»</b><br>— La abuela Rosa</p>
      <p class="hk-mu" style="color:#7fa892">El usuario «donpepe83» tenía permisos de administradora en toda Sinea desde 1998.</p></div>
    <div class="hk-cert">CERTIFICADO OFICIAL<b>Hacker de nivel Abuela</b>
      Por abrir una compu con un post-it, olvidarse de su propia contraseña, arruinarle (y salvarle) el negocio a Don Tito,
      conseguir un café con Valeria, hacer cruzar a la abuela, robar Wi-Fi con permiso, salir en la radio, prender Sinea
      y armar un retrato.<br><br><i>Sinea, ${esc(d)}</i></div>
    <p style="margin-top:12px"><button type="button" class="hk-b" data-menu>Volver a los niveles</button></p></div>`;
}

window.LitmirHack = {mount};
})();
