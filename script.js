/* Smooth Scroll */
document.querySelectorAll('nav a').forEach(link => {
  link.addEventListener('click', e => {
    e.preventDefault();
    document.querySelector(link.getAttribute('href')).scrollIntoView({ behavior:"smooth" });
  });
});

/* Meeresspiegel + 3D Terrain + Städte-Marker */
const seaSlider = document.getElementById("seaSlider");
const seaValue = document.getElementById("seaValue");
const impactText = document.getElementById("impactText");

const container = document.getElementById("terrain-container");

const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, container.offsetWidth/container.offsetHeight, 0.1, 1000);
camera.position.set(0, 20, 25);
camera.lookAt(0,0,0);

const renderer = new THREE.WebGLRenderer({ antialias:true, alpha:true });
renderer.setSize(container.offsetWidth, container.offsetHeight);
container.appendChild(renderer.domElement);

// Licht
const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
scene.add(ambientLight);
const directionalLight = new THREE.DirectionalLight(0xffffff, 0.6);
directionalLight.position.set(50,100,50);
scene.add(directionalLight);

// Höhenkarte laden
const loader = new THREE.TextureLoader();
loader.load("bilder/hoehenkarte_de.png", texture => {

  const size = 20;
const segments = 256;

const geometry = new THREE.PlaneGeometry(size, size, segments, segments);

const canvas = document.createElement("canvas");
canvas.width = texture.image.width;
canvas.height = texture.image.height;
const ctx = canvas.getContext("2d");
ctx.drawImage(texture.image, 0, 0);

const imgData = ctx.getImageData(0, 0, canvas.width, canvas.height).data;

for (let i = 0; i < geometry.attributes.position.count; i++) {
  const ix = i % (segments + 1);
  const iy = Math.floor(i / (segments + 1));

  const px = Math.floor(ix / segments * (canvas.width - 1));
  const py = Math.floor(iy / segments * (canvas.height - 1));

  const index = (py * canvas.width + px) * 4;

  // WICHTIG: realistische Höhe (sehr klein!)
  const height = imgData[index] / 255 * 1.2;

  geometry.attributes.position.setZ(i, height);
}

geometry.computeVertexNormals();

  const material = new THREE.MeshStandardMaterial({ color:0x88aa88, flatShading:true });
  const terrain = new THREE.Mesh(geometry, material);
  terrain.rotation.x = -Math.PI/2;
  scene.add(terrain);

  // Wasser Ebene
  const waterMat = new THREE.MeshStandardMaterial({
  color: 0x2b7fff,
  transparent: true,
  opacity: 0.55
});


  // Städte-Marker
  const cityMaterial = new THREE.MeshStandardMaterial({color:0xff0000});
  const cities = [
    {name:"Hamburg", x:-2, y:0, z:1},
    {name:"Venedig", x:3, y:0, z:-3},
    {name:"Niederlande", x:-3, y:0, z:2},
    {name:"Bangladesch", x:10, y:0, z:-5}
  ];
  const cityMeshes = [];

  cities.forEach(c=>{
    const sphere = new THREE.Mesh(new THREE.SphereGeometry(0.2,8,8), cityMaterial);
    sphere.position.set(c.x, c.z, c.y);
    scene.add(sphere);
    cityMeshes.push({mesh:sphere, y:c.z});
  });

  // Slider steuert Wasserhöhe
  seaSlider.addEventListener("input", () => {
    const val = seaSlider.value/100 * 5;
    seaValue.textContent = val.toFixed(1);
    water.position.y = val;

    if(val < 1){
      impactText.textContent = "Geringe Auswirkungen – Küstenschutz ist noch möglich.";
    } else if(val < 2){
      impactText.textContent = "Regelmäßige Überflutungen bedrohen erste Stadtteile.";
    } else if(val < 3){
      impactText.textContent = "Große Teile von Küstenstädten sind dauerhaft gefährdet.";
    } else {
      impactText.textContent = "Millionen Menschen verlieren ihre Heimat – Klimaflucht nimmt stark zu.";
    }
  });

});

// Animation
function animate(){
  requestAnimationFrame(animate);
  renderer.render(scene,camera);
}
animate();

// Resize
window.addEventListener("resize", ()=>{
  renderer.setSize(container.offsetWidth, container.offsetHeight);
  camera.aspect = container.offsetWidth/container.offsetHeight;
  camera.updateProjectionMatrix();
});
