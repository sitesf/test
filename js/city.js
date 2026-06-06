import * as THREE from "three";

const canvas = document.getElementById("scene");
const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
renderer.setSize(innerWidth, innerHeight);
renderer.setPixelRatio(Math.min(devicePixelRatio, 1.65));
renderer.outputColorSpace = THREE.SRGBColorSpace;
renderer.shadowMap.enabled = true;

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x020713);
scene.fog = new THREE.FogExp2(0x020713, 0.0095);

const camera = new THREE.PerspectiveCamera(60, innerWidth / innerHeight, 0.1, 1400);
const clock = new THREE.Clock();

const world = new THREE.Group();
scene.add(world);

scene.add(new THREE.HemisphereLight(0xaed1ff, 0x03050c, 1.2));
const key = new THREE.DirectionalLight(0xffffff, 2.1);
key.position.set(-35, 70, 38);
scene.add(key);

const palette = {
  dark: 0x071326,
  road: 0x030915,
  blue: 0x4da3ff,
  cyan: 0x69f7ff,
  pink: 0xff4bd8,
  green: 0x67ffb8,
  purple: 0x9d6bff,
  white: 0xf5fbff,
  black: 0x02040a,
  yellow: 0xffd166
};

function material(color, emissive = 0x000000, intensity = 0, roughness = 0.42, metalness = 0.36) {
  return new THREE.MeshStandardMaterial({
    color, emissive, emissiveIntensity: intensity, roughness, metalness
  });
}

const mat = {
  ground: material(0x030b18),
  road: material(palette.road),
  dark: material(palette.dark),
  blue: material(palette.blue, 0x116fff, 0.55),
  cyan: material(palette.cyan, 0x20e8ff, 0.95),
  pink: material(palette.pink, 0xff2cd1, 0.8),
  green: material(palette.green, 0x20ff98, 0.7),
  purple: material(palette.purple, 0x6a37ff, 0.7),
  white: material(palette.white, 0x8ccfff, 0.12),
  black: material(palette.black),
  yellow: material(palette.yellow, 0xffbc42, 0.7)
};

let seed = 42;
function rnd() {
  seed = (seed * 16807) % 2147483647;
  return (seed - 1) / 2147483646;
}
function choose(arr) { return arr[Math.floor(rnd() * arr.length)] }

function addBox(w, h, d, x, y, z, m = mat.dark, parent = world) {
  const mesh = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), m);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function addCylinder(r1, r2, h, x, y, z, m = mat.cyan, seg = 32, parent = world) {
  const mesh = new THREE.Mesh(new THREE.CylinderGeometry(r1, r2, h, seg), m);
  mesh.position.set(x, y + h / 2, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function addSphere(r, x, y, z, m = mat.cyan, parent = world) {
  const mesh = new THREE.Mesh(new THREE.SphereGeometry(r, 32, 32), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  mesh.receiveShadow = true;
  parent.add(mesh);
  return mesh;
}
function addTorus(R, r, x, y, z, m = mat.cyan, parent = world) {
  const mesh = new THREE.Mesh(new THREE.TorusGeometry(R, r, 18, 120), m);
  mesh.position.set(x, y, z);
  mesh.castShadow = true;
  parent.add(mesh);
  return mesh;
}

/* CITY GROUND */
addBox(220, 0.15, 520, 0, -0.08, -185, mat.ground);

/* ROAD NETWORK */
for (let z = 45; z > -440; z -= 28) addBox(180, 0.08, 2.2, 0, 0.02, z, mat.road);
for (let x = -80; x <= 80; x += 20) addBox(3.1, 0.08, 500, x, 0.03, -185, mat.road);
for (let x = -80; x <= 80; x += 20) {
  for (let z = 45; z > -430; z -= 28) addBox(0.75, 0.08, 0.75, x, 0.08, z, mat.cyan);
}

/* SKYLINE */
const buildings = [];
const neonMats = [mat.blue, mat.cyan, mat.pink, mat.green, mat.purple];
for (let row = 0; row < 18; row++) {
  for (let col = -5; col <= 5; col++) {
    const x = col * 17 + (rnd() - 0.5) * 4;
    const z = 25 - row * 24 + (rnd() - 0.5) * 3;
    if (Math.abs(x) < 13 && row < 2) continue;
    const h = 8 + rnd() * 38 + row * 0.65;
    const w = 6.5 + rnd() * 5.5;
    const d = 6.5 + rnd() * 6;
    const b = addBox(w, h, d, x, 0, z, mat.dark);
    b.userData.baseY = b.scale.y;
    buildings.push(b);

    if (rnd() > 0.25) {
      const cap = addBox(w * 0.68, 0.38, d * 0.68, x, h + 0.22, z, choose(neonMats));
      buildings.push(cap);
    }

    if (rnd() > 0.45) {
      for (let k = 2.8; k < h - 2; k += 4.3) {
        addBox(w + 0.08, 0.09, 0.12, x, k, z + d / 2 + 0.08, choose([mat.cyan, mat.blue, mat.purple]));
      }
    }
  }
}

/* DISTRICTS */
function createDistrict({ x, z, mainMat, accentMat, height, rings = true }) {
  const g = new THREE.Group();
  g.position.set(x, 0, z);
  world.add(g);

  addCylinder(6, 8.2, height, 0, 0, 0, mainMat, 8, g);
  addCylinder(3.4, 4.2, height * 0.65, 0, height * 0.28, 0, accentMat, 12, g);

  if (rings) {
    const r1 = addTorus(9, 0.18, 0, height + 2.2, 0, accentMat, g);
    r1.rotation.x = Math.PI / 2;
    const r2 = addTorus(12, 0.1, 0, height * 0.55, 0, mainMat, g);
    r2.rotation.x = Math.PI / 2;
    g.userData.rings = [r1, r2];
  }

  for (let i = 0; i < 6; i++) {
    const a = (i / 6) * Math.PI * 2;
    addBox(1.2, 7 + rnd() * 13, 1.2, Math.cos(a) * 13, 0, Math.sin(a) * 13, accentMat, g);
  }
  return g;
}

const miraDistrict = createDistrict({ x: -46, z: -42, mainMat: mat.cyan, accentMat: mat.green, height: 25 });
const hrDistrict = createDistrict({ x: 44, z: -98, mainMat: mat.purple, accentMat: mat.pink, height: 37 });
const docDistrict = createDistrict({ x: -42, z: -160, mainMat: mat.green, accentMat: mat.cyan, height: 28 });
const analyticsDistrict = createDistrict({ x: 43, z: -224, mainMat: mat.pink, accentMat: mat.blue, height: 45 });

/* GIANT PHONE */
const phone = new THREE.Group();
phone.position.set(-58, 2, -40);
phone.rotation.y = 0.42;
world.add(phone);
addBox(11, 20, 0.85, 0, 0, 0, mat.black, phone);
addBox(8.9, 16.2, 0.92, 0, 1.55, 0.08, material(0x041a2f, 0x0a9dff, 0.25), phone);
for (let i = 0; i < 7; i++) {
  addBox(5 + rnd() * 2.5, 0.48, 1.02, (rnd() - 0.5) * 1.5, 14 - i * 2.05, 0.62, choose([mat.cyan, mat.green, mat.blue]), phone);
}

/* HR CV RAIN AND SORTING LANES */
const cvs = [];
for (let i = 0; i < 120; i++) {
  const cv = addBox(2.2, 0.05, 3.1, 27 + rnd() * 34, 14 + rnd() * 58, -75 - rnd() * 50, material(0xf7fbff, 0x58a6ff, 0.08));
  cv.rotation.set(rnd(), rnd(), rnd());
  cv.userData.v = 0.04 + rnd() * 0.09;
  cvs.push(cv);
}
["TOP", "INTERVIU", "RESPINS", "ALT ROL"].forEach((_, i) => {
  addBox(10, 0.18, 3, 18 + i * 9, 1.2, -126, choose([mat.green, mat.cyan, mat.pink, mat.purple]));
});

/* DOCUMENT FACTORY */
for (let i = 0; i < 6; i++) {
  addBox(36, 0.28, 2.2, -42, 1.2 + i * 0.85, -170 + i * 4.5, mat.green);
}
for (let i = 0; i < 42; i++) {
  addBox(2.2, 0.08, 2.4, -60 + rnd() * 36, 2 + rnd() * 10, -183 + rnd() * 36, material(0xeaf4ff, 0x66ffb6, 0.12));
}

/* ANALYTICS BARS */
for (let i = 0; i < 18; i++) {
  addBox(1.35, 3 + rnd() * 24, 1.35, 22 + i * 2.2, 0, -240 + rnd() * 12, choose([mat.pink, mat.cyan, mat.purple, mat.blue]));
}

/* NEXAS CORE */
const core = new THREE.Group();
core.position.set(0, 0, -318);
world.add(core);
addCylinder(18, 25, 10, 0, 0, 0, mat.blue, 12, core);
addCylinder(10, 14, 18, 0, 7, 0, mat.purple, 10, core);
const coreSphere = addSphere(9.5, 0, 30, 0, mat.cyan, core);
const coreRings = [
  addTorus(15, 0.22, 0, 30, 0, mat.cyan, core),
  addTorus(18, 0.16, 0, 30, 0, mat.purple, core),
  addTorus(22, 0.12, 0, 30, 0, mat.pink, core)
];
coreRings[0].rotation.x = Math.PI / 2;
coreRings[1].rotation.y = Math.PI / 2;

/* ROBOTS */
function createRobot(scale = 1, bodyMat = mat.white, eyeMat = mat.cyan) {
  const r = new THREE.Group();
  r.scale.setScalar(scale);
  addSphere(0.86, 0, 3.85, 0, bodyMat, r);
  addBox(1.35, 0.28, 0.1, 0, 3.82, 0.82, mat.black, r);
  addSphere(0.075, -0.27, 3.84, 0.9, eyeMat, r);
  addSphere(0.075, 0.27, 3.84, 0.9, eyeMat, r);

  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.75, 1.35, 8, 18), bodyMat);
  body.position.y = 2.25; r.add(body);

  const armL = new THREE.Mesh(new THREE.CapsuleGeometry(0.16, 1.2, 6, 12), bodyMat);
  armL.position.set(-0.95, 2.25, 0); armL.rotation.z = 0.25; r.add(armL);
  const armR = armL.clone();
  armR.position.x = 0.95; armR.rotation.z = -0.25; r.add(armR);

  const legL = new THREE.Mesh(new THREE.CapsuleGeometry(0.17, 1, 6, 12), bodyMat);
  legL.position.set(-0.32, 0.85, 0); r.add(legL);
  const legR = legL.clone();
  legR.position.x = 0.32; r.add(legR);

  const halo = addTorus(1.15, 0.03, 0, 4.75, 0, eyeMat, r);
  halo.rotation.x = Math.PI / 2;
  r.userData = { armL, armR, legL, legR, halo };
  return r;
}
const guide = createRobot(1.55, mat.white, mat.cyan);
world.add(guide);

const agentRobots = [];
[
  { n: "MIRA", pos: [-40, 0, -40], m: mat.green },
  { n: "HR", pos: [37, 0, -100], m: mat.purple },
  { n: "PDF", pos: [-34, 0, -162], m: mat.green },
  { n: "ALEX", pos: [36, 0, -224], m: mat.pink },
  { n: "CORE", pos: [8, 0, -312], m: mat.blue }
].forEach((a) => {
  const rb = createRobot(0.95, a.m, mat.cyan);
  rb.position.set(...a.pos);
  world.add(rb);
  agentRobots.push(rb);
});

/* PEOPLE, CARS, DRONES */
const people = [];
for (let i = 0; i < 150; i++) {
  const p = new THREE.Group();
  addSphere(0.16, 0, 0.9, 0, choose([mat.cyan, mat.pink, mat.green, mat.blue]), p);
  const body = new THREE.Mesh(new THREE.CapsuleGeometry(0.11, 0.55, 4, 8), mat.white);
  body.position.y = 0.43; p.add(body);
  p.position.set(-80 + rnd() * 160, 0.06, 35 - rnd() * 420);
  p.userData.speed = 0.012 + rnd() * 0.03;
  world.add(p);
  people.push(p);
}

const cars = [];
for (let i = 0; i < 54; i++) {
  const c = new THREE.Group();
  addBox(2.2, 0.55, 3.3, 0, 0.15, 0, choose([mat.blue, mat.cyan, mat.pink, mat.green]), c);
  addBox(1.45, 0.4, 1.2, 0, 0.62, -0.2, material(0x071226, 0x65f7ff, 0.2), c);
  c.position.set(choose([-80, -60, -40, -20, 20, 40, 60, 80]), 0, 40 - rnd() * 430);
  c.userData.speed = 0.08 + rnd() * 0.14;
  world.add(c);
  cars.push(c);
}

const drones = [];
for (let i = 0; i < 38; i++) {
  const d = new THREE.Group();
  addSphere(0.25, 0, 0, 0, choose([mat.cyan, mat.pink, mat.green]), d);
  addBox(2, 0.05, 0.05, 0, 0, 0, mat.cyan, d);
  addBox(0.05, 0.05, 2, 0, 0, 0, mat.cyan, d);
  d.position.set((rnd() - 0.5) * 160, 14 + rnd() * 42, 40 - rnd() * 420);
  d.userData.speed = 0.055 + rnd() * 0.1;
  world.add(d);
  drones.push(d);
}

/* PORTALS */
const portals = [];
[
  [-24, 8, -18, mat.cyan],
  [-5, 8, -68, mat.purple],
  [11, 8, -130, mat.green],
  [-10, 8, -194, mat.pink],
  [0, 10, -270, mat.blue]
].forEach((p) => {
  const portal = addTorus(7, 0.13, p[0], p[1], p[2], p[3]);
  portal.rotation.y = Math.PI / 2;
  portals.push(portal);
});

/* DATA PARTICLES */
const particleCount = 3600;
const pGeo = new THREE.BufferGeometry();
const pPos = new Float32Array(particleCount * 3);
const pCol = new Float32Array(particleCount * 3);
const colors = [0x4da3ff, 0x69f7ff, 0xff4bd8, 0x67ffb8, 0x9d6bff].map(c => new THREE.Color(c));
for (let i = 0; i < particleCount; i++) {
  pPos[i * 3] = (rnd() - 0.5) * 180;
  pPos[i * 3 + 1] = 1 + rnd() * 65;
  pPos[i * 3 + 2] = 55 - rnd() * 470;
  const c = choose(colors);
  pCol[i * 3] = c.r; pCol[i * 3 + 1] = c.g; pCol[i * 3 + 2] = c.b;
}
pGeo.setAttribute("position", new THREE.BufferAttribute(pPos, 3));
pGeo.setAttribute("color", new THREE.BufferAttribute(pCol, 3));
const particles = new THREE.Points(pGeo, new THREE.PointsMaterial({
  size: 0.11, vertexColors: true, transparent: true, opacity: 0.9,
  blending: THREE.AdditiveBlending, depthWrite: false
}));
world.add(particles);

/* COLORED DUST EXPLOSION */
const dustCount = 1000;
const dustGeo = new THREE.BufferGeometry();
const dustPos = new Float32Array(dustCount * 3);
for (let i = 0; i < dustCount; i++) {
  dustPos[i * 3] = (rnd() - 0.5) * 1.6;
  dustPos[i * 3 + 1] = (rnd() - 0.5) * 1.6;
  dustPos[i * 3 + 2] = (rnd() - 0.5) * 1.6;
}
dustGeo.setAttribute("position", new THREE.BufferAttribute(dustPos, 3));
const dust = new THREE.Points(dustGeo, new THREE.PointsMaterial({
  size: 0.16, color: 0xff4bd8, transparent: true, opacity: 0.18,
  blending: THREE.AdditiveBlending, depthWrite: false
}));
world.add(dust);

/* CAMERA STORY */
const stops = [
  { p: [0, 20, 72], l: [0, 4, -30], r: [0, 0, 18], step: 0, t: "Eu sunt ghidul NEXAS. Orasul traieste, chiar si cand tu nu faci nimic." },
  { p: [-54, 14, -12], l: [-56, 11, -42], r: [-38, 0, -35], step: 1, t: "Aici lucreaza MIRA. Clientii intra pe WhatsApp. Actiunile ies in sistem." },
  { p: [43, 17, -72], l: [44, 19, -102], r: [34, 0, -86], step: 2, t: "Aici CV-urile cad haotic. NEXAS HR le organizeaza in cateva secunde." },
  { p: [-42, 14, -133], l: [-43, 11, -164], r: [-33, 0, -148], step: 3, t: "Fabrica digitala transforma PDF-uri, Excel-uri si facturi in date curate." },
  { p: [42, 18, -194], l: [43, 24, -226], r: [31, 0, -207], step: 4, t: "Turnul Analytics iti arata miscarea firmei in timp real." },
  { p: [8, 18, -250], l: [0, 24, -318], r: [2, 0, -278], step: 5, t: "Agentii au roluri diferite. MIRA, INA, ALEX, ISA si HR lucreaza ca o echipa." },
  { p: [0, 31, -286], l: [0, 30, -318], r: [-8, 0, -306], step: 6, t: "Toate fluxurile se conecteaza in NEXAS CORE. Acesta este creierul." },
  { p: [0, 50, -350], l: [0, 5, -220], r: [0, 0, -318], step: 7, t: "De sus vezi ideea. Robotii fac repetitivul. Tu iei deciziile." },
  { p: [0, 18, -380], l: [0, 30, -318], r: [0, 0, -326], step: 8, t: "Acum alegi primul task. De aici se construieste primul agent." }
];

const panels = [...document.querySelectorAll(".panel")];
const speech = document.getElementById("speech");
const speechText = document.getElementById("speechText");
let activeStep = -1;

function setActive(step) {
  if (step === activeStep) return;
  activeStep = step;
  panels.forEach(p => p.classList.toggle("visible", Number(p.dataset.step) === step));
  speechText.textContent = stops[step].t;
  speech.classList.add("visible");
  setTimeout(() => speech.classList.remove("visible"), 2600);
}

function smooth(t) { return t * t * (3 - 2 * t); }
function lerp(a, b, t) { return a + (b - a) * t; }
function mixVec(a, b, t) { return a.map((v, i) => lerp(v, b[i], t)); }

function updateScroll() {
  const max = document.body.scrollHeight - innerHeight;
  const raw = Math.max(0, Math.min(1, scrollY / max));
  document.getElementById("progressBar").style.width = `${raw * 100}%`;

  const f = raw * (stops.length - 1);
  const index = Math.min(stops.length - 2, Math.floor(f));
  const t = smooth(f - index);
  const A = stops[index];
  const B = stops[index + 1];

  const cp = mixVec(A.p, B.p, t);
  const cl = mixVec(A.l, B.l, t);
  const rp = mixVec(A.r, B.r, t);

  camera.position.set(cp[0], cp[1], cp[2]);
  camera.lookAt(cl[0], cl[1], cl[2]);

  guide.position.set(rp[0], rp[1], rp[2]);
  guide.lookAt(camera.position.x, guide.position.y, camera.position.z);

  const step = t > 0.55 ? B.step : A.step;
  setActive(step);

  document.getElementById("actions").textContent = Math.floor(240 + raw * 24800).toLocaleString("en-US");
  document.getElementById("timeSaved").textContent = Math.floor(22 + raw * 1680).toLocaleString("en-US");
  document.getElementById("agents").textContent = Math.max(1, Math.floor(1 + raw * 10)).toString();

  const dustLocations = [
    [0, 8, 0], [-56, 11, -42], [44, 18, -100], [-43, 12, -164],
    [43, 22, -226], [0, 20, -270], [0, 31, -318], [0, 24, -300], [0, 32, -318]
  ];
  const dl = dustLocations[step] || dustLocations[0];
  dust.position.set(dl[0], dl[1], dl[2]);
  dust.material.opacity = 0.10 + Math.abs(Math.sin(raw * Math.PI * 22)) * 0.18;
  dust.material.color.setHex([palette.blue, palette.green, palette.purple, palette.green, palette.pink, palette.cyan, palette.blue, palette.yellow, palette.pink][step]);
}

/* ANIMATION LOOP */
function animate() {
  requestAnimationFrame(animate);
  const time = clock.getElapsedTime();

  guide.position.y += Math.sin(time * 3) * 0.003;
  guide.userData.halo.rotation.z += 0.03;
  guide.userData.armL.rotation.z = 0.22 + Math.sin(time * 3) * 0.13;
  guide.userData.armR.rotation.z = -0.22 + Math.cos(time * 2.6) * 0.16;
  guide.userData.legL.rotation.x = Math.sin(time * 4) * 0.08;
  guide.userData.legR.rotation.x = -Math.sin(time * 4) * 0.08;

  agentRobots.forEach((r, i) => {
    r.position.y = 0.12 + Math.sin(time * 2 + i) * 0.18;
    r.rotation.y = Math.sin(time + i) * 0.45;
    r.userData.halo.rotation.z += 0.04;
  });

  cars.forEach((c) => {
    c.position.z += c.userData.speed;
    if (c.position.z > 55) c.position.z = -430;
  });

  people.forEach((p) => {
    p.position.z += p.userData.speed;
    p.rotation.y = Math.sin(time * 2 + p.position.x) * 0.7;
    if (p.position.z > 55) p.position.z = -430;
  });

  drones.forEach((d) => {
    d.position.z += d.userData.speed;
    d.position.y += Math.sin(time * 2 + d.position.x) * 0.012;
    d.rotation.y += 0.045;
    if (d.position.z > 60) d.position.z = -430;
  });

  cvs.forEach((cv) => {
    cv.position.y -= cv.userData.v;
    cv.rotation.x += 0.011;
    cv.rotation.z += 0.013;
    if (cv.position.y < 2) {
      cv.position.y = 60;
      cv.position.x = 27 + rnd() * 34;
      cv.position.z = -75 - rnd() * 50;
    }
  });

  const pArray = particles.geometry.attributes.position.array;
  for (let i = 0; i < particleCount; i++) {
    const k = i * 3;
    pArray[k + 2] += 0.31 + (i % 5) * 0.012;
    pArray[k + 1] += Math.sin(time + i) * 0.003;
    if (pArray[k + 2] > 60) pArray[k + 2] = -430;
  }
  particles.geometry.attributes.position.needsUpdate = true;

  const dArray = dust.geometry.attributes.position.array;
  for (let i = 0; i < dustCount; i++) {
    const k = i * 3;
    dArray[k] *= 1.006;
    dArray[k + 1] *= 1.006;
    dArray[k + 2] *= 1.006;
    if (Math.abs(dArray[k]) + Math.abs(dArray[k + 1]) + Math.abs(dArray[k + 2]) > 28) {
      dArray[k] = (Math.random() - 0.5) * 1.6;
      dArray[k + 1] = (Math.random() - 0.5) * 1.6;
      dArray[k + 2] = (Math.random() - 0.5) * 1.6;
    }
  }
  dust.geometry.attributes.position.needsUpdate = true;
  dust.rotation.y += 0.006;

  [miraDistrict, hrDistrict, docDistrict, analyticsDistrict].forEach((d, i) => {
    if (d.userData.rings) {
      d.userData.rings[0].rotation.z += 0.012 + i * 0.002;
      d.userData.rings[1].rotation.z -= 0.007;
    }
  });

  coreSphere.scale.setScalar(1 + Math.sin(time * 2) * 0.045);
  coreRings[0].rotation.z += 0.008;
  coreRings[1].rotation.x += 0.006;
  coreRings[2].rotation.y += 0.01;

  portals.forEach((p, i) => {
    p.rotation.z += 0.017 + i * 0.002;
    p.scale.setScalar(1 + Math.sin(time * 2 + i) * 0.045);
  });

  buildings.forEach((b, i) => {
    if (i % 7 === 0) b.scale.y = 1 + Math.sin(time + i) * 0.012;
  });

  updateScroll();
  renderer.render(scene, camera);
}

animate();

addEventListener("resize", () => {
  renderer.setSize(innerWidth, innerHeight);
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
});

addEventListener("scroll", updateScroll, { passive: true });
