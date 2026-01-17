/* =========================
   DOM
========================= */
const seaSlider = document.getElementById("seaSlider");
const seaValue = document.getElementById("seaValue");
const impactText = document.getElementById("impactText");
const container = document.getElementById("terrain-container");

if (!seaSlider || !seaValue || !impactText || !container) {
  console.error("Ein oder mehrere DOM-Elemente wurden nicht gefunden.");
}

/* =========================
   THREE SETUP
========================= */
const scene = new THREE.Scene();

const camera = new THREE.PerspectiveCamera(
  45,
  container.clientWidth / container.clientHeight,
  0.1,
  1000
);
camera.position.set(0, 18, 24);
camera.lookAt(0, 0, 0);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(container.clientWidth, container.clientHeight);

/* Performance: Pixel Ratio begrenzen (wichtig für Handys) */
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));

container.appendChild(renderer.domElement);

/* =========================
   LICHT
========================= */
scene.add(new THREE.AmbientLight(0xffffff, 0.8));

const dirLight = new THREE.DirectionalLight(0xffffff, 1);
dirLight.position.set(40, 80, 40);
scene.add(dirLight);

/* =========================
   LOADER
========================= */
const loader = new THREE.TextureLoader();

/* =========================
   TERRAIN + WASSER
========================= */
let water = null;

loader.load(
  "bilder/hoehenkarte_de.png",
  (heightTexture) => {
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

      const px = Math.floor((ix / segments) * canvas.width);
      const py = Math.floor((iy / segments) * canvas.height);

      const index = (py * canvas.width + px) * 4;
      const h = (data[index] / 255) * 1.3;

      geometry.attributes.position.setZ(i, h);
    }

    geometry.computeVertexNormals();

    const terrain = new THREE.Mesh(
      geometry,
      new THREE.MeshStandardMaterial({
        color: 0x88aa88,
        roughness: 1
      })
    );

    terrain.rotation.x = -Math.PI / 2;
    scene.add(terrain);

    /* =========================
       WASSER
    ========================= */
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
       SLIDER LOGIK
    ========================= */
    seaSlider.addEventListener("input", () => {
      const level = (seaSlider.value / 100) * 3;
      seaValue.textContent = level.toFixed(1);
      water.position.y = level + 0.05;

      updateImpactText(level);
    });

    /* Starttext */
    updateImpactText(0);
  },
  undefined,
  (error) => {
    console.error("Fehler beim Laden der Höhenkarte:", error);
    impactText.textContent =
      "Das 3D-Modell konnte nicht geladen werden. Bitte überprüfe die Bilddatei.";
  }
);

/* =========================
   MENSCHENRECHTE-TEXTE
========================= */
function updateImpactText(level) {
  if (level < 0.8) {
    impactText.textContent =
      "Geringe Auswirkungen: Küstenschutz ist noch möglich. Das Recht auf Wohnen und Sicherheit kann in vielen Regionen erhalten werden.";
  } else if (level < 1.6) {
    impactText.textContent =
      "Mittlere Auswirkungen: Erste Städte werden regelmäßig überflutet. Das Recht auf sauberes Wasser, Bildung und eine sichere Lebensumgebung gerät unter Druck.";
  } else {
    impactText.textContent =
      "Schwere Auswirkungen: Große Teile der Küsten sind dauerhaft bedroht. Millionen Menschen verlieren ihr Zuhause – grundlegende Menschenrechte wie Sicherheit, Nahrung und Heimat sind massiv gefährdet.";
  }
}

/* =========================
   ANIMATION
========================= */
let waterWave = 0;

function animate() {
  requestAnimationFrame(animate);

  /* Sanfte Wasserbewegung */
  if (water) {
    waterWave += 0.01;
    water.material.opacity = 0.5 + Math.sin(waterWave) * 0.05;
  }

  renderer.render(scene, camera);
}

animate();

/* =========================
   RESIZE
========================= */
function resizeRenderer() {
  const width = container.clientWidth;
  const height = container.clientHeight;

  renderer.setSize(width, height);
  camera.aspect = width / height;
  camera.updateProjectionMatrix();
}

window.addEventListener("resize", resizeRenderer);
resizeRenderer();
