/* ══════════════════════════════════════════════════
   AMPARTABOX 2.0 — three-scene.js
   Subtle macOS-style 3D ambient background
══════════════════════════════════════════════════ */

(function () {
  if (typeof THREE === 'undefined') return;

  const canvas = document.getElementById('threeCanvas');
  if (!canvas) return;

  const W = window.innerWidth;
  const H = window.innerHeight;

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(W, H);
  renderer.setClearColor(0x000000, 0);

  const scene  = new THREE.Scene();
  const camera = new THREE.PerspectiveCamera(55, W / H, 0.1, 300);
  camera.position.z = 32;

  const clock = new THREE.Clock();
  const mouse = new THREE.Vector2();

  document.addEventListener('mousemove', e => {
    mouse.x =  (e.clientX / window.innerWidth  - .5) * 2;
    mouse.y = -(e.clientY / window.innerHeight - .5) * 2;
  });

  /* ── 1. Soft particle cloud */
  const PC = 1200;
  const pPos = new Float32Array(PC * 3);
  const pCol = new Float32Array(PC * 3);

  const ca = new THREE.Color(0x1d6bff);
  const cb = new THREE.Color(0x40b8ff);
  const cc = new THREE.Color(0x003eab);

  for (let i = 0; i < PC; i++) {
    const r  = 42;
    const th = Math.random() * Math.PI * 2;
    const ph = Math.acos(2 * Math.random() - 1);
    pPos[i*3]   = r * Math.sin(ph) * Math.cos(th);
    pPos[i*3+1] = r * Math.sin(ph) * Math.sin(th) * .6;
    pPos[i*3+2] = r * Math.cos(ph) - 10;

    const t = Math.random();
    const c = t < .4 ? ca : t < .75 ? cb : cc;
    pCol[i*3]   = c.r;
    pCol[i*3+1] = c.g;
    pCol[i*3+2] = c.b;
  }

  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute('position', new THREE.BufferAttribute(pPos, 3));
  pGeo.setAttribute('color',    new THREE.BufferAttribute(pCol, 3));

  const pMat = new THREE.PointsMaterial({
    size: .08, vertexColors: true, transparent: true,
    opacity: .45, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const points = new THREE.Points(pGeo, pMat);
  scene.add(points);

  /* ── 2. Thin wireframe planes (glass-panel-like) */
  const panels = [];
  const panelDefs = [
    { w:14, h:9,  x:-12, y: 3,  z:-14, rx:.3, ry:.4,  rz:.05 },
    { w:10, h:14, x: 14, y:-2,  z:-18, rx:.5, ry:-.3, rz:.1  },
    { w:18, h:11, x:  2, y:-6,  z:-22, rx:.1, ry: .6,  rz:.08 },
    { w: 8, h: 8, x:-16, y:-5,  z:-10, rx:.4, ry:-.5, rz:.2  },
  ];
  panelDefs.forEach(d => {
    const geo = new THREE.PlaneGeometry(d.w, d.h, 2, 2);
    const mat = new THREE.MeshBasicMaterial({
      color: 0x1d6bff, wireframe: true, transparent: true,
      opacity: .04, blending: THREE.AdditiveBlending, depthWrite: false,
    });
    const m = new THREE.Mesh(geo, mat);
    m.position.set(d.x, d.y, d.z);
    m.rotation.set(d.rx, d.ry, d.rz);
    m.userData = d;
    scene.add(m);
    panels.push(m);
  });

  /* ── 3. Dodecahedron (macOS app-icon shape suggestion) */
  const dodGeo = new THREE.DodecahedronGeometry(3.2, 0);
  const dodMat = new THREE.MeshBasicMaterial({
    color: 0x40b8ff, wireframe: true, transparent: true,
    opacity: .045, blending: THREE.AdditiveBlending,
  });
  const dod = new THREE.Mesh(dodGeo, dodMat);
  dod.position.set(8, 4, -8);
  scene.add(dod);

  /* ── 4. Torus (subtle ring) */
  const torGeo = new THREE.TorusGeometry(7, .018, 6, 100);
  const torMat = new THREE.MeshBasicMaterial({
    color: 0x40b8ff, transparent: true, opacity: .06,
    blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const torus = new THREE.Mesh(torGeo, torMat);
  torus.position.set(-8, -3, -12);
  torus.rotation.x = .8;
  scene.add(torus);

  /* ── 5. Octahedron */
  const octGeo = new THREE.OctahedronGeometry(2.4, 0);
  const octMat = new THREE.MeshBasicMaterial({
    color: 0x0051d5, wireframe: true, transparent: true,
    opacity: .05, blending: THREE.AdditiveBlending,
  });
  const oct = new THREE.Mesh(octGeo, octMat);
  oct.position.set(-10, 6, -6);
  scene.add(oct);

  /* ── 6. Thin horizontal grid (floor hint) */
  const gridGeo = new THREE.PlaneGeometry(80, 40, 20, 10);
  const gridMat = new THREE.MeshBasicMaterial({
    color: 0x1d6bff, wireframe: true, transparent: true,
    opacity: .025, blending: THREE.AdditiveBlending, depthWrite: false,
  });
  const grid = new THREE.Mesh(gridGeo, gridMat);
  grid.rotation.x = -Math.PI * .45;
  grid.position.set(0, -14, -10);
  scene.add(grid);

  /* ── Scroll */
  let scrollY = 0;
  window.addEventListener('scroll', () => { scrollY = window.scrollY; });

  /* ── Camera lerp target */
  const camT = new THREE.Vector3(0, 0, 32);

  /* ── Animate */
  function tick() {
    requestAnimationFrame(tick);
    const t = clock.getElapsedTime();

    camT.x = mouse.x * 1.8;
    camT.y = mouse.y * 1.0;
    camT.z = 32 - scrollY * .004;
    camera.position.lerp(camT, .035);
    camera.lookAt(0, -scrollY * .002, 0);

    points.rotation.y = t * .014;
    points.rotation.x = t * .006;

    panels.forEach((p, i) => {
      p.rotation.y = p.userData.ry + Math.sin(t * .18 + i * 1.2) * .04;
      p.rotation.x = p.userData.rx + Math.cos(t * .14 + i * .9) * .03;
    });

    dod.rotation.y = t * .14;
    dod.rotation.x = t * .09;

    torus.rotation.z = t * .07;

    oct.rotation.y = -t * .11;
    oct.rotation.z =  t * .08;

    grid.position.y = -14 - scrollY * .005;

    renderer.render(scene, camera);
  }
  tick();

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });
})();