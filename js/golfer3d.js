window.GolfScene = (function () {
  let renderer, scene, camera, golfer, clubGroup, clubHead, shaft, ball, tee;
  let orbit = { theta: 0.85, phi: 1.15, radius: 5.4, targetY: 1.15 };

  function mat(color, extras = {}) {
    return new THREE.MeshStandardMaterial({
      color,
      roughness: extras.roughness ?? 0.55,
      metalness: extras.metalness ?? 0.08,
      ...extras
    });
  }

  function limb(w, h, d, color) {
    const m = new THREE.Mesh(new THREE.BoxGeometry(w, h, d), mat(color));
    m.castShadow = true;
    m.receiveShadow = true;
    return m;
  }

  function createGolfer() {
    const root = new THREE.Group();
    const skin = 0xc4a07a;
    const shirt = 0xf3efe4;
    const pants = 0x163024;
    const shoe = 0xf2f2f2;
    const cap = 0x1f6b3a;

    const hips = limb(0.42, 0.18, 0.26, pants);
    hips.position.y = 1.05;
    root.add(hips);

    const torso = limb(0.46, 0.62, 0.28, shirt);
    torso.position.y = 1.48;
    torso.name = "torso";
    root.add(torso);

    const head = new THREE.Mesh(new THREE.SphereGeometry(0.16, 24, 18), mat(skin));
    head.position.y = 1.95;
    head.castShadow = true;
    root.add(head);

    const hat = new THREE.Mesh(new THREE.CylinderGeometry(0.17, 0.18, 0.08, 20), mat(cap));
    hat.position.set(0, 2.08, 0);
    root.add(hat);
    const brim = new THREE.Mesh(new THREE.BoxGeometry(0.16, 0.02, 0.18), mat(cap));
    brim.position.set(0, 2.05, 0.16);
    root.add(brim);

    const lLeg = limb(0.16, 0.7, 0.18, pants);
    lLeg.position.set(-0.12, 0.62, 0);
    root.add(lLeg);
    const rLeg = limb(0.16, 0.7, 0.18, pants);
    rLeg.position.set(0.12, 0.62, 0);
    root.add(rLeg);

    const lShoe = limb(0.16, 0.1, 0.3, shoe);
    lShoe.position.set(-0.12, 0.22, 0.04);
    root.add(lShoe);
    const rShoe = limb(0.16, 0.1, 0.3, shoe);
    rShoe.position.set(0.12, 0.22, 0.04);
    root.add(rShoe);

    const lArm = limb(0.12, 0.58, 0.12, shirt);
    lArm.position.set(-0.34, 1.42, 0.08);
    lArm.rotation.z = 0.35;
    lArm.rotation.x = -0.35;
    lArm.name = "lArm";
    root.add(lArm);

    const rArm = limb(0.12, 0.58, 0.12, shirt);
    rArm.position.set(0.34, 1.42, 0.08);
    rArm.rotation.z = -0.55;
    rArm.rotation.x = -0.55;
    rArm.name = "rArm";
    root.add(rArm);

    clubGroup = new THREE.Group();
    clubGroup.position.set(0.42, 1.12, 0.28);
    clubGroup.rotation.set(-0.15, 0.2, -0.85);
    root.add(clubGroup);

    shaft = new THREE.Mesh(
      new THREE.CylinderGeometry(0.018, 0.022, 1.55, 12),
      mat(0xcfd6d4, { metalness: 0.7, roughness: 0.25 })
    );
    shaft.position.y = -0.55;
    clubGroup.add(shaft);

    clubHead = new THREE.Mesh(new THREE.BoxGeometry(0.12, 0.08, 0.28), mat(0x2a2f33, { metalness: 0.6, roughness: 0.3 }));
    clubHead.position.set(0.02, -1.32, 0);
    clubGroup.add(clubHead);

    const grip = new THREE.Mesh(
      new THREE.CylinderGeometry(0.028, 0.026, 0.28, 10),
      mat(0x1a1a1a, { roughness: 0.9 })
    );
    grip.position.y = 0.22;
    clubGroup.add(grip);

    root.traverse((o) => {
      if (o.isMesh) {
        o.castShadow = true;
        o.receiveShadow = true;
      }
    });
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
    shaft.geometry.dispose();
    shaft.geometry = new THREE.CylinderGeometry(0.016, 0.02, L.shaft, 12);
    shaft.position.y = -L.shaft * 0.32;
    shaft.material.color.setHex(L.shaftColor);
    clubHead.geometry.dispose();
    clubHead.geometry = new THREE.BoxGeometry(...L.head);
    clubHead.position.set(0.03, -L.shaft * 0.78, 0);
    clubHead.rotation.x = L.loft;
    clubHead.material.color.setHex(L.headColor);
  }

  function setPose(club, problem) {
    golfer.rotation.set(0, 0.15, 0);
    const lArm = golfer.getObjectByName("lArm");
    const rArm = golfer.getObjectByName("rArm");
    const torso = golfer.getObjectByName("torso");
    const poses = {
      driver: { golferRot: [-0.02, 0.2, 0], club: [-0.05, 0.15, -0.7], clubPos: [0.48, 1.22, 0.22], lArm: [-0.25, 0, 0.28], rArm: [-0.62, 0, -0.62], torso: [0.08, 0, 0.06], ball: [0.55, 0.08, 0.85] },
      jern: { golferRot: [0.02, 0.12, 0], club: [0.05, 0.05, -0.95], clubPos: [0.38, 1.08, 0.18], lArm: [-0.4, 0, 0.38], rArm: [-0.5, 0, -0.48], torso: [0.16, 0, 0.04], ball: [0.22, 0.06, 0.62] },
      wedge: { golferRot: [0.05, 0.08, 0], club: [0.12, 0.0, -1.05], clubPos: [0.32, 1.0, 0.16], lArm: [-0.48, 0, 0.42], rArm: [-0.42, 0, -0.4], torso: [0.22, 0, 0.02], ball: [0.12, 0.06, 0.48] },
      putter: { golferRot: [0.12, 0.0, 0], club: [0.35, 0, -0.05], clubPos: [0.02, 1.12, 0.32], lArm: [-0.7, 0, 0.15], rArm: [-0.7, 0, -0.15], torso: [0.38, 0, 0], ball: [0.02, 0.045, 0.62] }
    };
    const p = poses[club];
    golfer.rotation.set(...p.golferRot);
    clubGroup.rotation.set(...p.club);
    clubGroup.position.set(...p.clubPos);
    lArm.rotation.set(...p.lArm);
    rArm.rotation.set(...p.rArm);
    torso.rotation.set(...p.torso);
    ball.position.set(...p.ball);
    tee.visible = club === "driver";
    tee.position.set(p.ball[0], 0.02, p.ball[2]);
    if (club === "driver") ball.position.y = 0.14;
    if (problem === "slice" || problem === "push") clubHead.rotation.y = 0.35;
    else if (problem === "hook" || problem === "pull") clubHead.rotation.y = -0.28;
    else clubHead.rotation.y = 0;
  }

  function sizeOf(canvas) {
    const parent = canvas.parentElement || canvas;
    const w = Math.max(parent.clientWidth || canvas.clientWidth || 800, 1);
    const h = Math.max(parent.clientHeight || canvas.clientHeight || 600, 1);
    return { w, h };
  }

  function applyCamera() {
    const x = orbit.radius * Math.sin(orbit.phi) * Math.cos(orbit.theta);
    const y = orbit.radius * Math.cos(orbit.phi) + 0.35;
    const z = orbit.radius * Math.sin(orbit.phi) * Math.sin(orbit.theta);
    camera.position.set(x, y, z);
    camera.lookAt(0, orbit.targetY, 0);
  }

  function bindOrbit(canvas) {
    let dragging = false;
    let lastX = 0;
    let lastY = 0;
    canvas.addEventListener("pointerdown", (e) => {
      dragging = true;
      lastX = e.clientX;
      lastY = e.clientY;
      canvas.setPointerCapture(e.pointerId);
    });
    canvas.addEventListener("pointerup", () => { dragging = false; });
    canvas.addEventListener("pointercancel", () => { dragging = false; });
    canvas.addEventListener("pointermove", (e) => {
      if (!dragging) return;
      const dx = e.clientX - lastX;
      const dy = e.clientY - lastY;
      lastX = e.clientX;
      lastY = e.clientY;
      orbit.theta -= dx * 0.008;
      orbit.phi = Math.min(1.45, Math.max(0.25, orbit.phi - dy * 0.008));
      applyCamera();
    });
    canvas.addEventListener("wheel", (e) => {
      e.preventDefault();
      orbit.radius = Math.min(9, Math.max(2.6, orbit.radius + e.deltaY * 0.008));
      applyCamera();
    }, { passive: false });
  }

  function init(canvas) {
    if (typeof THREE === "undefined") throw new Error("Three.js ble ikke lastet");
    scene = new THREE.Scene();
    scene.background = new THREE.Color(0x0a1a10);
    scene.fog = new THREE.Fog(0x0a1a10, 8, 22);
    const { w, h } = sizeOf(canvas);
    camera = new THREE.PerspectiveCamera(42, w / h, 0.1, 80);
    applyCamera();
    renderer = new THREE.WebGLRenderer({ canvas, antialias: true, alpha: false });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(w, h, false);
    renderer.shadowMap.enabled = true;
    bindOrbit(canvas);
    scene.add(new THREE.HemisphereLight(0xdde7d8, 0x1a2a18, 0.85));
    const sun = new THREE.DirectionalLight(0xfff3d0, 1.15);
    sun.position.set(4, 8, 3);
    sun.castShadow = true;
    scene.add(sun);
    const fill = new THREE.DirectionalLight(0x7aa4ff, 0.25);
    fill.position.set(-4, 2, -2);
    scene.add(fill);
    const ground = new THREE.Mesh(new THREE.CircleGeometry(8, 48), mat(0x1c5a32, { roughness: 0.95 }));
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    scene.add(ground);
    const fringe = new THREE.Mesh(new THREE.RingGeometry(3.2, 7.6, 48), mat(0x164a28, { roughness: 1 }));
    fringe.rotation.x = -Math.PI / 2;
    fringe.position.y = 0.002;
    scene.add(fringe);
    ball = new THREE.Mesh(new THREE.SphereGeometry(0.045, 16, 12), mat(0xf7f7f2, { roughness: 0.4 }));
    ball.castShadow = true;
    scene.add(ball);
    tee = new THREE.Mesh(new THREE.CylinderGeometry(0.012, 0.018, 0.08, 8), mat(0xe8d36a));
    scene.add(tee);
    golfer = createGolfer();
    scene.add(golfer);
    const grid = new THREE.GridHelper(8, 16, 0x2f6a40, 0x204a30);
    grid.position.y = 0.01;
    scene.add(grid);
    setClubLook("driver");
    setPose("driver", "slice");
    window.addEventListener("resize", onResize);
    requestAnimationFrame(onResize);
    setTimeout(onResize, 80);
    animate();
  }

  function onResize() {
    if (!renderer) return;
    const { w, h } = sizeOf(renderer.domElement);
    camera.aspect = w / h;
    camera.updateProjectionMatrix();
    renderer.setSize(w, h, false);
  }

  function animate() {
    requestAnimationFrame(animate);
    renderer.render(scene, camera);
  }

  function update(club, problem) {
    if (!golfer || !clubHead) return;
    setClubLook(club);
    setPose(club, problem);
  }

  return { init, update };
})();
