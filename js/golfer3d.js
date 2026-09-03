window.GolfScene = (function () {
  let renderer, scene, camera, golfer, clubGroup, clubHead, shaft, ball, tee;
  let orbit = { theta: 0.95, phi: 1.12, radius: 4.35, targetY: 1.05 };

  function mat(color, extras = {}) {
    return new THREE.MeshStandardMaterial({ color, roughness: extras.roughness ?? 0.55, metalness: extras.metalness ?? 0.08, ...extras });
  }
  function limb(w, h, d, color) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    m.castShadow = true; m.receiveShadow = true; return m;
  }

  function createGolfer() {
    const root = new THREE.Group();
    const skin = 0xc4a07a, shirt = 0xf3efe4, pants = 0x163024, shoe = 0xf2f2f2, cap = 0x1f6b3a;
    const hips = limb(0.42, 0.18, 0.26, pants); hips.position.y = 1.05; root.add(hips);
    const torso = limb(0.46, 0.62, 0.28, shirt); torso.position.y = 1.48; torso.name = "torso"; root.add(torso);
    const head = new THREE.Mesh(new THREE.SphereGeometry(0.13, 24, 18), mat(skin));
    head.position.y = 1.95; head.scale.set(1, 1, 0.65); head.name = "head"; head.castShadow = true; root.add(head);
    const face = new THREE.Mesh(new THREE.CircleGeometry(0.16, 48), new THREE.MeshStandardMaterial({
      color: 0xffffff, roughness: 0.45, metalness: 0, side: THREE.DoubleSide, depthWrite: true,
      polygonOffset: true, polygonOffsetFactor: -4, polygonOffsetUnits: -4
    }));
    face.position.set(0, 1.96, 0.22); face.name = "face"; face.visible = false; root.add(face);
    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.08, 20), mat(cap)); hat.position.set(0, 2.08, 0); root.add(hat);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.18), mat(cap)); brim.position.set(0, 2.05, 0.16); root.add(brim);
    const lLeg = limb(0.16, 0.7, 0.18, pants); lLeg.position.set(0.22, 0.62, 0); lLeg.name = "lLeg"; root.add(lLeg);
    const rLeg = limb(0.16, 0.7, 0.18, pants); rLeg.position.set(-0.22, 0.62, 0); rLeg.name = "rLeg"; root.add(rLeg);
    const lShoe = limb(0.16, 0.1, 0.32, shoe); lShoe.position.set(0.22, 0.22, 0.02); lShoe.name = "lShoe"; root.add(lShoe);
    const rShoe = limb(0.16, 0.1, 0.32, shoe); rShoe.position.set(-0.22, 0.22, 0.02); rShoe.name = "rShoe"; root.add(rShoe);
    const lArm = limb(0.12, 0.58, 0.12, shirt); lArm.position.set(0.34, 1.42, 0.08); lArm.rotation.z = -0.35; lArm.rotation.x = -0.35; lArm.name = "lArm"; root.add(lArm);
    const rArm = limb(0.12, 0.58, 0.12, shirt); rArm.position.set(-0.34, 1.42, 0.08); rArm.rotation.z = 0.55; rArm.rotation.x = -0.55; rArm.name = "rArm"; root.add(rArm);
    clubGroup = new THREE.Group(); root.add(clubGroup);
    shaft = new THREE.Mesh(new THREE.CylinderGeometry(0.018, 0.022, 1.55, 12), mat(0xcfd6d4, { metalness: 0.7, roughness: 0.25 })); shaft.position.y = -0.55; clubGroup.add(shaft);
    clubHead = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.28), mat(0x2a2f33, { metalness: 0.6, roughness: 0.3 })); clubHead.position.set(0.02, -1.32, 0); clubGroup.add(clubHead);
    const grip = new THREE.Mesh(new THREE.CylinderGeometry(0.028, 0.026, 0.28, 10), mat(0x1a1a1a, { roughness: 0.9 })); grip.position.y = 0.22; clubGroup.add(grip);
    root.traverse((o) => { if (o.isMesh) { o.castShadow = true; o.receiveShadow = true; } });
    return root;
  }

  function setClubLook(club) {
    const looks = {
      driver: { shaft: 1.72, head: [0.16, 0.1, 0.32], headColor: 0x1a1f24, loft: 0.08, shaftColor: 0xd7dde0 },
      jern: { shaft: 1.42, head: [0.08, 0.1, 0.22], headColor: 0x9aa3a8, loft: 0.28, shaftColor: 0xc5ccd0 },
      wedge: { shaft: 1.28, head: [0.09, 0.12, 0.22], headColor: 0xb7c0c4, loft: 0.48, shaftColor: 0xc5ccd0 },
      putter: { shaft: 1.05, head: [0.08, 0.06, 0.3], headColor: 0x2f3a36, loft: 0.02, shaftColor: 0xc0a35b }
    };
    const L = looks[club];
    shaft.geometry.dispose(); shaft.geometry = new THREE.CylinderGeometry(0.016, 0.02, L.shaft, 12); shaft.position.y = -L.shaft * 0.32; shaft.material.color.setHex(L.shaftColor);
    clubHead.geometry.dispose(); clubHead.geometry = new THREE.BoxGeometry(...L.head); clubHead.position.set(0.03, -L.shaft * 0.78, 0); clubHead.rotation.x = L.loft; clubHead.material.color.setHex(L.headColor);
  }

  function snapClubHeadToBall() {
    if (!clubHead || !ball || !clubGroup || !golfer) return;
    golfer.updateMatrixWorld(true);
    const headWorld = new THREE.Vector3();
    clubHead.getWorldPosition(headWorld);
    const target = ball.position.clone();
    target.z -= 0.03;
    clubGroup.position.add(target.sub(headWorld));
  }

  function setPose(club, problem) {
    const lArm = golfer.getObjectByName("lArm"), rArm = golfer.getObjectByName("rArm"), torso = golfer.getObjectByName("torso");
    const lShoe = golfer.getObjectByName("lShoe"), rShoe = golfer.getObjectByName("rShoe");
    const lLeg = golfer.getObjectByName("lLeg"), rLeg = golfer.getObjectByName("rLeg");
    const setups = {
      driver: { stance: 0.28, ball: [0.10, 0.13, 0.09], torso: [0.10, 0, 0.04], lArm: [-0.35, 0.05, -0.22], rArm: [-0.55, -0.08, 0.42] },
      jern: { stance: 0.22, ball: [0.00, 0.045, 0.07], torso: [0.18, 0, 0.02], lArm: [-0.42, 0.02, -0.28], rArm: [-0.48, -0.04, 0.36] },
      wedge: { stance: 0.16, ball: [-0.05, 0.04, 0.07], torso: [0.24, 0, 0], lArm: [-0.48, 0, -0.32], rArm: [-0.42, 0, 0.30] },
      putter: { stance: 0.15, ball: [0.00, 0.035, 0.09], torso: [0.36, 0, 0], lArm: [-0.72, 0, -0.12], rArm: [-0.72, 0, 0.12] }
    };
    const p = setups[club];
    golfer.rotation.set(0, 0, 0);
    lShoe.position.set(p.stance, 0.22, 0.02); rShoe.position.set(-p.stance, 0.22, 0.02);
    lLeg.position.set(p.stance, 0.62, 0); rLeg.position.set(-p.stance, 0.62, 0);
    lArm.rotation.set(...p.lArm); rArm.rotation.set(...p.rArm); torso.rotation.set(...p.torso);
    ball.position.set(p.ball[0], p.ball[1], p.ball[2]);
    tee.visible = club === "driver"; tee.position.set(p.ball[0], 0.02, p.ball[2]);
    const looks = { driver: { shaft: 1.72, lean: 0.18 }, jern: { shaft: 1.42, lean: 0.32 }, wedge: { shaft: 1.28, lean: 0.42 }, putter: { shaft: 1.05, lean: 0.06 } };
    const L = looks[club];
    clubGroup.rotation.set(L.lean, 0, -0.05);
    const headLocalY = -L.shaft * 0.78;
    clubGroup.position.set(p.ball[0], p.ball[1] - headLocalY + 0.03, p.ball[2] - Math.sin(L.lean) * Math.abs(headLocalY) - 0.05);
    snapClubHeadToBall();
    if (problem === "slice" || problem === "push") clubHead.rotation.y = 0.28;
    else if (problem === "hook" || problem === "pull") clubHead.rotation.y = -0.24;
    else clubHead.rotation.y = 0;
  }

  function sizeOf(canvas) {
    const parent = canvas.parentElement || canvas;
    return { w: Math.max(parent.clientWidth || 800, 1), h: Math.max(parent.clientHeight || 600, 1) };
  }
  function applyCamera() {
    camera.position.set(orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta), orbit.radius * Math.cos(orbit.phi) + 0.35, orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta));
    camera.lookAt(0, orbit.targetY, 0);
  }
  function bindOrbit(canvas) {
    let dragging = false, lastX = 0, lastY = 0;
    canvas.addEventListener("pointerdown", (e) => { dragging = true; lastX = e.clientX; lastY = e.clientY; canvas.setPointerCapture(e.pointerId); });
    canvas.addEventListener("pointerup", () => { dragging = false; });
    canvas.addEventListener("pointercancel", () => { dragging = false; });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      orbit.theta -= (e.clientX - lastX) * 0.008; orbit.phi = Math.min(1.45, Math.max(0.25, orbit.phi - (e.clientY - lastY) * 0.008));
      lastX = e.clientX; lastY = e.clientY; applyCamera();
    });
    canvas.addEventListener("wheel", (e) => { e.preventDefault(); orbit.radius = Math.min(9, Math.max(2.6, orbit.radius + e.deltaY * 0.008)); applyCamera(); }, { passive: false });
  }

  function init(canvas) {
    if (typeof THREE === "undefined") throw new Error("Three.js ble ikke lastet");
    scene = new THREE.Scene(); scene.background = new THREE.Color(0x0a1a10); scene.fog = new THREE.Fog(0x0a1a10, 8, 22);
    const { w, h } = sizeOf(canvas);
    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 80); applyCamera();
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true }); renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2)); renderer.setSize(w, h, false); renderer.shadowMap.enabled = true;
    bindOrbit(canvas);
    scene.add(new THREE.HemisphereLight(0xdde7d8, 0x1a2a18, 0.85));
    const sun = new THREE.DirectionalLight(0xfff3d0, 1.15); sun.position.set(4, 8, 3); sun.castShadow = true; scene.add(sun);
    const fill = new THREE.DirectionalLight(0x7aa4ff, 0.25); fill.position.set(-4, 2, -2); scene.add(fill);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 48), mat(0x1c5a32, { roughness: 0.95 })); ground.rotation.x = -Math.PI / 2; ground.receiveShadow = true; scene.add(ground);
    ball = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), mat(0xf7f7f2, { roughness: 0.4 })); ball.castShadow = true; scene.add(ball);
    tee = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.08, 8), mat(0xe8d36a)); scene.add(tee);
    golfer = createGolfer(); scene.add(golfer);
    const grid = new THREE.GridHelper(8, 16, 0x2f6a40, 0x204a30); grid.position.y = 0.01; scene.add(grid);
    setClubLook("driver"); setPose("driver", "slice");
    if (window.DEFAULT_FACE) setFace(window.DEFAULT_FACE);
    window.addEventListener("resize", onResize); requestAnimationFrame(onResize); setTimeout(onResize, 80); animate();
  }
  function onResize() {
    if (!renderer) return; const { w, h } = sizeOf(renderer.domElement);
    camera.aspect = w / h; camera.updateProjectionMatrix(); renderer.setSize(w, h, false);
  }
  function aimFaceAtCamera() {
    const face = golfer && golfer.getObjectByName("face"); if (!face || !face.visible || !camera) return;
    const head = new THREE.Vector3(0, 1.96, 0);
    const dir = camera.position.clone().sub(head).normalize();
    face.position.copy(head.clone().add(dir.multiplyScalar(0.22)));
    face.lookAt(camera.position);
  }
  function animate() { requestAnimationFrame(animate); aimFaceAtCamera(); renderer.render(scene, camera); }
  function update(club, problem) { if (!golfer || !clubHead) return; setClubLook(club); setPose(club, problem); }
  function circleCrop(image) {
    const size = 512, canvas = document.createElement("canvas"); canvas.width = size; canvas.height = size;
    const ctx = canvas.getContext("2d");
    ctx.fillStyle = "#c4a07a"; ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.closePath(); ctx.fill();
    ctx.save(); ctx.beginPath(); ctx.arc(size / 2, size / 2, size / 2, 0, Math.PI * 2); ctx.closePath(); ctx.clip();
    const side = Math.min(image.width, image.height);
    ctx.drawImage(image, (image.width - side) / 2, (image.height - side) / 2, side, side, 0, 0, size, size);
    ctx.restore(); return canvas;
  }
  function setFace(fileOrUrl) {
    const face = golfer && golfer.getObjectByName("face"); if (!face) return;
    const apply = (img) => {
      const tex = new THREE.CanvasTexture(circleCrop(img));
      tex.colorSpace = THREE.SRGBColorSpace || THREE.sRGBEncoding;
      if (face.material.map) face.material.map.dispose();
      face.material.map = tex; face.material.transparent = false; face.material.opacity = 1; face.material.needsUpdate = true; face.visible = true;
      const skull = golfer.getObjectByName("head"); if (skull) skull.visible = false;
    };
    const img = new Image();
    if (typeof fileOrUrl === "string") { img.onload = () => apply(img); img.src = fileOrUrl; }
    else { const url = URL.createObjectURL(fileOrUrl); img.onload = () => { apply(img); URL.revokeObjectURL(url); }; img.src = url; }
  }
  return { init, update, setFace };
})();
