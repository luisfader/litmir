/* «Героиня в 3D» — раздел романа: 3D-модель персонажа, которую можно вращать, двигать и анимировать.
   Подключение: window.LitmirModel3d.mount(el, {lang, slug, model}), где model = n.model3d из catalog.json:
   {"title": …, "about": …, "models": [{"file": "novels/<novela>/3d/<archivo>.glb", "name": …, "note": …}]}
   Three.js se carga desde cdn.jsdelivr.net solo al abrir la sección. Anims del .glb: Respirar, Caminar, Saludar, Bailar. */
(function(){
"use strict";
const V = "0.160.0", CDN = `https://cdn.jsdelivr.net/npm/three@${V}`;
let libs = null;
const loadLibs = () => libs || (libs = Promise.all([
  import(`${CDN}/+esm`),
  import(`${CDN}/examples/jsm/controls/OrbitControls.js/+esm`),
  import(`${CDN}/examples/jsm/loaders/GLTFLoader.js/+esm`)
]).then(([THREE, oc, gl]) => ({THREE, OrbitControls: oc.OrbitControls, GLTFLoader: gl.GLTFLoader})));

const TX = {
  ru:{load:"Загружаю модель…", err:"Не удалось загрузить 3D-модель. Проверьте интернет и попробуйте ещё раз.", anim:"Анимация", still:"Стоит", Respirar:"Дышит", Caminar:"Идёт", Saludar:"Машет рукой", Bailar:"Танцует",
      speed:"Скорость", turn:"Повернуть", walk:"Гуляет по сцене", spin:"Камера кружит", center:"В центр", front:"Анфас", full:"На весь экран", exit:"Свернуть",
      hint:"Перетащите героиню — она пойдёт по полу. Перетащите фон — повернётся камера. Колёсико или два пальца — приблизить."},
  es:{load:"Cargando el modelo…", err:"No se pudo cargar el modelo 3D. Revisá la conexión y probá de nuevo.", anim:"Animación", still:"Quieta", Respirar:"Respira", Caminar:"Camina", Saludar:"Saluda", Bailar:"Baila",
      speed:"Velocidad", turn:"Girarla", walk:"Que pasee por el escenario", spin:"Cámara girando", center:"Al centro", front:"De frente", full:"Pantalla completa", exit:"Salir",
      hint:"Arrastrala para moverla por el piso. Arrastrá el fondo para girar la cámara. Rueda o dos dedos para acercar."},
  sr:{load:"Учитавам модел…", err:"3D модел није учитан. Проверите везу и покушајте поново.", anim:"Анимација", still:"Стоји", Respirar:"Дише", Caminar:"Хода", Saludar:"Маше", Bailar:"Плеше",
      speed:"Брзина", turn:"Окрени", walk:"Шета по сцени", spin:"Камера кружи", center:"У центар", front:"Спреда", full:"Цео екран", exit:"Изађи",
      hint:"Превуците јунакињу да је померите. Превуците позадину да окренете камеру. Точкић или два прста — приближи."},
  en:{load:"Loading the model…", err:"Couldn't load the 3D model. Check your connection and try again.", anim:"Animation", still:"Still", Respirar:"Breathing", Caminar:"Walking", Saludar:"Waving", Bailar:"Dancing",
      speed:"Speed", turn:"Turn", walk:"Stroll around the stage", spin:"Orbiting camera", center:"Center", front:"Front view", full:"Full screen", exit:"Exit",
      hint:"Drag her to move her across the floor. Drag the background to orbit. Wheel or pinch to zoom."}
};
const ORDER = ["Respirar", "Caminar", "Saludar", "Bailar"];
const esc = s => String(s == null ? "" : s).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));

let css = false;
function addCss(){
  if (css) return; css = true;
  const st = document.createElement("style");
  st.textContent = `
.m3d{display:flex;flex-direction:column;gap:12px}
.m3d-about{margin:0;line-height:1.55;opacity:.85}
.m3d-tabs{display:flex;gap:6px;flex-wrap:wrap}
.m3d-stage{position:relative;height:min(72vh,620px);min-height:380px;border-radius:14px;overflow:hidden;background:linear-gradient(#f3ebdf,#e4d5c0);touch-action:none}
.m3d-stage canvas{display:block;width:100%;height:100%;touch-action:none}
.m3d-stage:fullscreen{height:100%;border-radius:0}
.m3d-msg{position:absolute;inset:0;display:grid;place-items:center;padding:20px;text-align:center;color:#6b5848;font-size:15px}
.m3d-msg[hidden]{display:none}
.m3d-fs{position:absolute;top:10px;right:10px;font:inherit;font-size:12.5px;padding:6px 10px;border-radius:8px;border:1px solid rgba(0,0,0,.12);background:rgba(255,250,243,.9);color:#3a2a1f;cursor:pointer}
.m3d-note{position:absolute;left:10px;bottom:10px;right:10px;font-size:12px;color:#6b5848;pointer-events:none;text-shadow:0 1px 0 rgba(255,255,255,.6)}
.m3d-ctl{display:flex;flex-direction:column;gap:10px}
.m3d-row{display:flex;flex-wrap:wrap;gap:6px;align-items:center}
.m3d b.m3d-h{font-size:12px;letter-spacing:.06em;text-transform:uppercase;opacity:.65;margin-right:4px}
.m3d button.m3d-b{font:inherit;font-size:13.5px;padding:7px 12px;border-radius:999px;border:1px solid rgba(127,127,127,.35);background:transparent;color:inherit;cursor:pointer}
.m3d button.m3d-b.on{background:#a7423a;border-color:#a7423a;color:#fff}
.m3d label{display:flex;align-items:center;gap:8px;font-size:13.5px}
.m3d input[type=range]{accent-color:#a7423a;width:150px}
.m3d input[type=checkbox]{accent-color:#a7423a}
.m3d-hint{font-size:12.5px;opacity:.7;margin:0;line-height:1.5}`;
  document.head.appendChild(st);
}

let live = null; // una sola escena activa
function stop(){ if (live) { live(); live = null; } }

function mount(el, opts){
  stop(); addCss();
  const T = TX[opts.lang] || TX.en, M = opts.model || {}, models = M.models || [];
  el.innerHTML = `<div class="m3d">
    ${M.about ? `<p class="m3d-about">${esc(M.about)}</p>` : ""}
    ${models.length > 1 ? `<div class="m3d-tabs">${models.map((m, i) => `<button type="button" class="m3d-b" data-m="${i}">${esc(m.name)}</button>`).join("")}</div>` : ""}
    <div class="m3d-stage"><div class="m3d-msg">${esc(T.load)}</div><button type="button" class="m3d-fs">⛶ ${esc(T.full)}</button><div class="m3d-note"></div></div>
    <div class="m3d-ctl"></div>
    <p class="m3d-hint">${esc(T.hint)}</p></div>`;
  const stage = el.querySelector(".m3d-stage"), ctl = el.querySelector(".m3d-ctl"), msg = stage.querySelector(".m3d-msg"), note = stage.querySelector(".m3d-note");
  const fsB = stage.querySelector(".m3d-fs");
  fsB.onclick = () => { try { if (document.fullscreenElement) document.exitFullscreen(); else stage.requestFullscreen(); } catch(e){} };
  document.addEventListener("fullscreenchange", () => { fsB.textContent = (document.fullscreenElement ? "✕ " + T.exit : "⛶ " + T.full); });

  loadLibs().then(({THREE, OrbitControls, GLTFLoader}) => {
    if (!stage.isConnected) return;
    const renderer = new THREE.WebGLRenderer({antialias:true, alpha:true});
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    stage.insertBefore(renderer.domElement, stage.firstChild);
    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(35, 1, 0.05, 60);
    camera.position.set(0.9, 1.35, 3.6);
    const controls = new OrbitControls(camera, renderer.domElement);
    controls.target.set(0, 0.95, 0); controls.enableDamping = true;
    controls.minDistance = 0.6; controls.maxDistance = 9; controls.maxPolarAngle = Math.PI * 0.495; controls.autoRotateSpeed = 1.2;
    scene.add(new THREE.HemisphereLight("#fff6e8", "#b69a7c", 1.25));
    const sun = new THREE.DirectionalLight("#fff1dc", 2.4); sun.position.set(2.5, 4.5, 3); sun.castShadow = true;
    sun.shadow.mapSize.set(2048, 2048); Object.assign(sun.shadow.camera, {left:-4, right:4, top:4, bottom:-4, near:.5, far:15});
    sun.shadow.bias = -0.0004; sun.shadow.normalBias = 0.02; scene.add(sun);
    const rim = new THREE.DirectionalLight("#ffd9b0", 0.9); rim.position.set(-3, 2.5, -3); scene.add(rim);
    const floor = new THREE.Mesh(new THREE.CircleGeometry(7, 72), new THREE.MeshStandardMaterial({color:"#e6d6bf", roughness:1}));
    floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
    const ring = new THREE.Mesh(new THREE.RingGeometry(2.95, 3, 96), new THREE.MeshBasicMaterial({color:"#cdb796", transparent:true, opacity:.55}));
    ring.rotation.x = -Math.PI / 2; ring.position.y = .002; scene.add(ring);

    let hero = null, mixer = null, actions = {}, current = null, alive = true;
    const loader = new GLTFLoader();

    function play(name){
      const next = name ? actions[name] : null;
      if (next !== current) { if (current) current.fadeOut(.35); if (next) next.reset().setEffectiveWeight(1).fadeIn(.35).play(); current = next; }
      ctl.querySelectorAll("[data-a]").forEach(b => b.classList.toggle("on", b.dataset.a === (name || "")));
    }
    function buildCtl(names){
      const anims = ORDER.filter(n => names.includes(n)).concat(names.filter(n => !ORDER.includes(n)));
      ctl.innerHTML = (anims.length ? `<div class="m3d-row"><b class="m3d-h">${esc(T.anim)}</b>
          <button type="button" class="m3d-b" data-a="">${esc(T.still)}</button>
          ${anims.map(a => `<button type="button" class="m3d-b" data-a="${esc(a)}">${esc(T[a] || a)}</button>`).join("")}</div>
        <div class="m3d-row"><label>${esc(T.speed)} <input type="range" class="m3d-speed" min=".2" max="2" step=".05" value="1"></label>
          ${names.includes("Caminar") ? `<label><input type="checkbox" class="m3d-walk"> ${esc(T.walk)}</label>` : ""}</div>` : "")
        + `<div class="m3d-row"><label>${esc(T.turn)} <input type="range" class="m3d-yaw" min="-180" max="180" step="1" value="0"></label>
          <label><input type="checkbox" class="m3d-spin"> ${esc(T.spin)}</label></div>
        <div class="m3d-row"><button type="button" class="m3d-b m3d-center">${esc(T.center)}</button><button type="button" class="m3d-b m3d-front">${esc(T.front)}</button></div>`;
      ctl.querySelectorAll("[data-a]").forEach(b => b.onclick = () => { play(b.dataset.a); const w = ctl.querySelector(".m3d-walk"); if (w && b.dataset.a !== "Caminar") w.checked = false; });
      const w = ctl.querySelector(".m3d-walk"); if (w) w.onchange = () => { if (w.checked) play("Caminar"); };
      ctl.querySelector(".m3d-yaw").oninput = e => { if (hero) hero.rotation.y = THREE.MathUtils.degToRad(+e.target.value); };
      ctl.querySelector(".m3d-spin").onchange = e => controls.autoRotate = e.target.checked;
      ctl.querySelector(".m3d-center").onclick = () => { if (hero) { hero.position.set(0, 0, 0); controls.target.set(0, .95, 0); } };
      ctl.querySelector(".m3d-front").onclick = () => { if (!hero) return; const p = hero.position, a = hero.rotation.y;
        controls.target.set(p.x, .95, p.z); camera.position.set(p.x + Math.sin(a) * 3.4, 1.3, p.z + Math.cos(a) * 3.4); };
      if (anims.includes("Respirar")) play("Respirar"); else play("");
    }
    function load(i){
      const m = models[i]; if (!m) return;
      el.querySelectorAll("[data-m]").forEach(b => b.classList.toggle("on", +b.dataset.m === i));
      msg.hidden = false; msg.textContent = T.load; note.textContent = m.note || "";
      if (hero) { scene.remove(hero); hero = null; } if (mixer) mixer.stopAllAction(); mixer = null; actions = {}; current = null;
      loader.load(m.file, g => {
        if (!alive) return;
        hero = g.scene;
        // normalizar: altura ~1.7 m, apoyada en el piso, centrada
        const box = new THREE.Box3().setFromObject(hero), size = box.getSize(new THREE.Vector3());
        const s = size.y > 0 ? 1.7 / size.y : 1;
        if (Math.abs(s - 1) > .02) hero.scale.setScalar(s);
        const b2 = new THREE.Box3().setFromObject(hero), c = b2.getCenter(new THREE.Vector3());
        const wrap = new THREE.Group(); hero.position.set(-c.x, -b2.min.y, -c.z); wrap.add(hero); hero = wrap;
        hero.traverse(o => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
        scene.add(hero);
        mixer = new THREE.AnimationMixer(g.scene);
        g.animations.forEach(a => actions[a.name] = mixer.clipAction(a));
        buildCtl(g.animations.map(a => a.name));
        msg.hidden = true;
      }, undefined, () => { msg.hidden = false; msg.textContent = T.err; });
    }
    el.querySelectorAll("[data-m]").forEach(b => b.onclick = () => load(+b.dataset.m));
    load(0);

    // arrastrar a la heroína por el piso
    const ray = new THREE.Raycaster(), ndc = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0);
    const off = new THREE.Vector3(), hit = new THREE.Vector3(); let drag = false;
    const cv = renderer.domElement;
    const setRay = e => { const r = cv.getBoundingClientRect(); ndc.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1); ray.setFromCamera(ndc, camera); };
    cv.addEventListener("pointerdown", e => { if (!hero || e.button !== 0) return; setRay(e);
      if (ray.intersectObject(hero, true).length) { drag = true; controls.enabled = false; ray.ray.intersectPlane(plane, hit); off.copy(hero.position).sub(hit); cv.setPointerCapture(e.pointerId); } });
    cv.addEventListener("pointermove", e => { if (!hero || !drag) return; setRay(e);
      if (ray.ray.intersectPlane(plane, hit)) { const p = hit.add(off); p.y = 0; if (p.length() > 6) p.setLength(6);
        const d = p.clone().sub(hero.position); hero.position.copy(p); controls.target.x += d.x; controls.target.z += d.z; camera.position.x += d.x; camera.position.z += d.z; } });
    const end = () => { if (drag) { drag = false; controls.enabled = true; } };
    cv.addEventListener("pointerup", end); cv.addEventListener("pointercancel", end);

    const resize = () => { const w = stage.clientWidth, h = stage.clientHeight; if (!w || !h) return; renderer.setSize(w, h, false); camera.aspect = w / h; camera.updateProjectionMatrix(); };
    const ro = new ResizeObserver(resize); ro.observe(stage); resize();
    const clock = new THREE.Clock();
    renderer.setAnimationLoop(() => {
      if (!stage.isConnected) { stop(); return; }
      const dt = Math.min(clock.getDelta(), .05), sp = +((ctl.querySelector(".m3d-speed") || {}).value || 1);
      if (mixer) mixer.update(dt * sp);
      const w = ctl.querySelector(".m3d-walk");
      if (hero && w && w.checked && !drag) {
        const st = .72 * sp * dt, dir = new THREE.Vector3(Math.sin(hero.rotation.y), 0, Math.cos(hero.rotation.y));
        if (hero.position.clone().addScaledVector(dir, st).length() > 2.6) {
          const want = Math.atan2(-hero.position.x, -hero.position.z); let df = want - hero.rotation.y; df = Math.atan2(Math.sin(df), Math.cos(df));
          hero.rotation.y += Math.sign(df) * Math.min(Math.abs(df), 1.6 * sp * dt); }
        hero.position.addScaledVector(dir, st);
        const y = ctl.querySelector(".m3d-yaw"); if (y) y.value = Math.round(THREE.MathUtils.radToDeg(Math.atan2(Math.sin(hero.rotation.y), Math.cos(hero.rotation.y))));
        const t = controls.target; t.x += (hero.position.x - t.x) * .04; t.z += (hero.position.z - t.z) * .04;
      }
      controls.update(); renderer.render(scene, camera);
    });
    live = () => { alive = false; renderer.setAnimationLoop(null); ro.disconnect(); controls.dispose(); renderer.dispose(); if (mixer) mixer.stopAllAction(); };
  }).catch(() => { msg.hidden = false; msg.textContent = T.err; });
}
window.LitmirModel3d = {mount};
})();
