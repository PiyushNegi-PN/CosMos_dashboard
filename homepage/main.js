import * as THREE from "https://cdn.jsdelivr.net/npm/three@0.160.0/build/three.module.js";
import { OrbitControls } from "https://cdn.jsdelivr.net/npm/three@0.160.0/examples/jsm/controls/OrbitControls.js";
import { gsap } from "https://cdn.jsdelivr.net/npm/gsap@3.12.5/index.js";

const assets = {
  starfield: "assets/starfield.jpg",
  mercury: "assets/tex_mercury.jpg",
  venus: "assets/tex_venus.jpg",
  earth: "assets/tex_earth.jpg",
  earthClouds: "assets/tex_earth_clouds.png",
  mars: "assets/tex_mars.jpg",
  jupiter: "assets/tex_jupiter.jpg",
  saturn: "assets/tex_saturn.jpg",
  saturnRing: "assets/tex_saturn_ring.png",
};

const planetsDef = [
  { id: "mercury", size: 0.6, dist: 6, speed: 0.018, texture: assets.mercury, name: "Mercury" },
  { id: "venus", size: 0.9, dist: 9, speed: 0.012, texture: assets.venus, name: "Venus" },
  { id: "earth", size: 1.0, dist: 12, speed: 0.01, texture: assets.earth, clouds: assets.earthClouds, name: "Earth" },
  { id: "mars", size: 0.8, dist: 15, speed: 0.008, texture: assets.mars, name: "Mars" },
  { id: "jupiter", size: 2.2, dist: 18, speed: 0.006, texture: assets.jupiter, name: "Jupiter" },
  { id: "saturn", size: 1.6, dist: 23, speed: 0.004, texture: assets.saturn, ring: assets.saturnRing, name: "Saturn" },
];

const root = document.getElementById("three-root");
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, root.clientWidth / root.clientHeight, 0.1, 2000);
camera.position.set(0, 6, 40);

const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });
renderer.setSize(root.clientWidth, root.clientHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
root.appendChild(renderer.domElement);

const loader = new THREE.TextureLoader();
loader.load(assets.starfield, (tex) => {
  const bgGeo = new THREE.SphereGeometry(500, 64, 64);
  const bgMat = new THREE.MeshBasicMaterial({ map: tex, side: THREE.BackSide });
  const bg = new THREE.Mesh(bgGeo, bgMat);
  scene.add(bg);
});

const sunLight = new THREE.PointLight(0xffffff, 2.2, 0);
sunLight.position.set(0, 0, 0);
scene.add(sunLight);
scene.add(new THREE.AmbientLight(0x222244, 0.3));

const sunGeo = new THREE.SphereGeometry(3.2, 64, 64);
const sunMat = new THREE.MeshBasicMaterial({ color: 0xffcc55 });
const sun = new THREE.Mesh(sunGeo, sunMat);
scene.add(sun);

const planets = {};
planetsDef.forEach((def) => {
  const geom = new THREE.SphereGeometry(def.size, 48, 48);
  const mat = new THREE.MeshStandardMaterial({
    map: loader.load(def.texture),
    roughness: 1,
    metalness: 0,
  });
  const mesh = new THREE.Mesh(geom, mat);
  mesh.position.x = def.dist;
  mesh.userData = { id: def.id, name: def.name, def };
  scene.add(mesh);

  if (def.clouds) {
    const cloudGeo = new THREE.SphereGeometry(def.size * 1.03, 48, 48);
    const cloudMat = new THREE.MeshLambertMaterial({
      map: loader.load(def.clouds),
      transparent: true,
    });
    const cloudMesh = new THREE.Mesh(cloudGeo, cloudMat);
    mesh.add(cloudMesh);
    mesh.userData.cloud = cloudMesh;
  }

  if (def.ring) {
    const ringGeo = new THREE.RingGeometry(def.size * 1.4, def.size * 2.4, 64);
    const ringMat = new THREE.MeshBasicMaterial({
      map: loader.load(def.ring),
      side: THREE.DoubleSide,
      transparent: true,
    });
    const ring = new THREE.Mesh(ringGeo, ringMat);
    ring.rotation.x = Math.PI / 2;
    mesh.add(ring);
  }

  planets[def.id] = { mesh, def, angle: Math.random() * Math.PI * 2 };
});

planetsDef.forEach((def) => {
  const ringGeo = new THREE.RingGeometry(def.dist - 0.02, def.dist + 0.02, 128);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x8888aa,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.08,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  scene.add(ring);
});
const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.dampingFactor = 0.08;
controls.minDistance = 8;
controls.maxDistance = 120;

const raycaster = new THREE.Raycaster();
const mouse = new THREE.Vector2();

window.addEventListener("click", (event) => {
  mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
  mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

  raycaster.setFromCamera(mouse, camera);
  const intersects = raycaster.intersectObjects(Object.values(planets).map((p) => p.mesh));

  if (intersects.length > 0) {
    const planet = intersects[0].object.userData.name;
    showPlanetInfo(planet);
  }
});

function showPlanetInfo(planet) {
  const infoBox = document.querySelector(".planet-info");
  infoBox.innerHTML = `<div class="glass-box">
      <h2>${planet}</h2>
      <p>Information about ${planet} goes here...</p>
    </div>`;
  gsap.fromTo(".glass-box", { opacity: 0, y: 50 }, { opacity: 1, y: 0, duration: 1 });
}

let last = performance.now();
function animate() {
  requestAnimationFrame(animate);
  const now = performance.now();
  const dt = (now - last) / 1000;
  last = now;

  sun.rotation.y += 0.0015 * dt * 60;

  Object.values(planets).forEach((p) => {
    const { mesh, def } = p;
    p.angle += def.speed * (dt * 60);
    mesh.position.x = Math.cos(p.angle) * def.dist;
    mesh.position.z = Math.sin(p.angle) * def.dist;
    mesh.rotation.y += 0.01 * (dt * 60);
    if (mesh.userData.cloud) mesh.userData.cloud.rotation.y += 0.012;
  });

  controls.update();
  renderer.render(scene, camera);
}
animate();
window.addEventListener("resize", () => {
  const w = root.clientWidth,
    h = root.clientHeight;
  camera.aspect = w / h;
  camera.updateProjectionMatrix();
  renderer.setSize(w, h);
});