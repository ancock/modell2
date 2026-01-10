/* =========================
   Smooth Scroll
========================= */
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({
      behavior: "smooth"
    });
  });
});

/* =========================
   DOM
========================= */
const seaSlider = document.getElementById("seaSlider");
const seaValue = document.getElementById("seaValue");
const impactText = document.getElementById("impactText");
const container = document.getElementById("terrain-container");

/* =========================
   Three.js Setup
========================= */
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  container.offsetWidth / container.offsetHeight,
  0.1,
  1000
);
camera.position.set(0, 18, 24);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.offsetWidth, container.offsetHeight);
renderer.setPixelRatio(window.devicePixelRatio);
container.appendChild(renderer.domElement);

/* =========================
   Licht
========================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.9));

const dirLight = new THREE.DirectionalLight(0xffffff, 0.8);
dirLight.position.set(30, 60, 30);
scene.add(dirLight);

/* =========================
   Textures
========================= */
const loader = new THREE.TextureLoader();
const heightTexture = loader.load("bilder/hoehenkarte_de.png");
const germanyTexture = loader.load("bilder/deutschland_textur.jpg");

/* =========================
   Globale Objekte
========================= */
let terrain, water;
const cityMeshes = [];

/* =========================
   Terrain + Wasser
========================= */
heightTexture.onLoad = () => {

  const size = 20;
  const segments = 256;
  const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

  const canvas = document.createElement("canvas");
  canvas.width = heightTexture.image.width;
  canvas.height = heightTexture.image.height;
  const ctx = canvas.getContext("2d");
  ctx.drawImage(heightTexture.image, 0, 0);

  const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

  for (let i = 0; i < geometry.attributes.position.count; i++) {
    const ix = i % (segments + 1);
    const iy = Math.floor(i / (segments + 1));

    const px = Math.floor(ix / segments * (canvas.width - 1));
    const py = Math.floor(iy / segments * (canvas.height - 1));
    const index = (py * canvas.width + px) * 4;

    const height = data[index] / 255 * 1.2;
    geometry.attributes.position.setZ(i, height);
  }

  geometry.computeVertexNormals();

  terrain = new THREE.Mesh(
    geometry,
    new THREE.MeshStandardMaterial({
      map: germanyTexture,
      roughness: 1,
      metalness: 0
    })
  );
  terrain.rotation.x = -Math.PI / 2;
  scene.add(terrain);

  // Wasser
  water = new THREE.Mesh(
    new THREE.PlaneGeometry(size, size),
    new THREE.MeshStandardMaterial({
      color: 0x2b7fff,
      transparent: true,
      opacity: 0.55
    })
  );
  water.rotation.x = -Math.PI / 2;
  water.position.y = 0.05;
  scene.add(water);

  /* =========================
     Städte (mit Höhenwert!)
  ========================= */
  const cityData = [
    { name: "Hamburg", x: -2, z: 2, height: 0.6 },
    { name: "Niederlande", x: -3, z: 3, height: 0.4 },
    { name: "Venedig", x: 3, z: -3, height: 0.2 }
  ];

  cityData.forEach(c => {
    const mesh = new THREE.Mesh(
      new THREE.SphereGeometry(0.28, 16, 16),
      new THREE.MeshStandardMaterial({ color: 0x22ff22 })
    );
    mesh.position.set(c.x, c.height, c.z);
    scene.add(mesh);

    cityMeshes.push({
      mesh,
      baseHeight: c.height
    });
  });

  /* =========================
     Slider (manuell)
  ========================= */
  seaSlider.addEventListener("input", () => {
    setSeaLevel(seaSlider.value / 100 * 3);
  });

  /* =========================
     Story-Modus automatisch
  ========================= */
  startStoryMode();
};

/* =========================
   Meeresspiegel setzen
========================= */
function setSeaLevel(level) {
  water.position.y = level + 0.05;
  seaValue.textContent = level.toFixed(1);

  cityMeshes.forEach(c => {
    if (level > c.baseHeight) {
      c.mesh.material.color.set(0xff3333);
      c.mesh.scale.setScalar(1.2 + Math.sin(Date.now() * 0.01) * 0.2);
    } else {
      c.mesh.material.color.set(0x22ff22);
      c.mesh.scale.setScalar(1);
    }
  });

  if (level < 0.8) {
    impactText.textContent =
      "2020: Küstenstädte sind größtenteils noch geschützt.";
  } else if (level < 1.6) {
    impactText.textContent =
      "2050: Regelmäßige Überflutungen gefährden erste Städte.";
  } else {
    impactText.textContent =
      "2100: Große Teile Europas sind dauerhaft vom Meer bedroht.";
  }
}

/* =========================
   Story-Modus
========================= */
function startStoryMode() {
  const stages = [
    { year: 2020, level: 0.3 },
    { year: 2050, level: 1.0 },
    { year: 2100, level: 2.5 }
  ];

  let index = 0;

  function nextStage() {
    if (index >= stages.length) return;

    const target = stages[index];
    let current = water.position.y;

    const interval = setInterval(() => {
      current += 0.02;
      setSeaLevel(current);

      if (current >= target.level) {
        clearInterval(interval);
        index++;
        setTimeout(nextStage, 2000);
      }
    }, 30);
  }

  setTimeout(nextStage, 1500);
}

/* =========================
   Animation
========================= */
function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
animate();

/* =========================
   Resize
========================= */
window.addEventListener("resize", () => {
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect = container.offsetWidth / container.offsetHeight;
  camera.updateProjectionMatrix();
});
