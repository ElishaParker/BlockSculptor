import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

const overlay = document.getElementById('overlay');
const buttons = overlay.querySelectorAll('button');

let scene, camera, renderer, gui;
let roomSize = 50; // default medium

buttons.forEach(btn => {
  btn.addEventListener('click', () => {
    const size = btn.dataset.size;
    if (size === 'small') roomSize = 20;
    if (size === 'medium') roomSize = 50;
    if (size === 'large') roomSize = 100;
    initScene();
    overlay.remove();
  });
});

function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(0x0a0a0a);

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 1000);
  camera.position.set(roomSize / 4, roomSize / 6, roomSize / 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lighting
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, 1);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Floor grid
  const grid = new THREE.GridHelper(roomSize, roomSize / 2, 0x444444, 0x222222);
  scene.add(grid);

  // Room boundary
  const boxGeo = new THREE.BoxGeometry(roomSize, roomSize, roomSize);
  const edges = new THREE.EdgesGeometry(boxGeo);
  const line = new THREE.LineSegments(
    edges,
    new THREE.LineBasicMaterial({ color: 0x333333 })
  );
  line.position.y = roomSize / 2;
  scene.add(line);

  // GUI placeholder
  gui = new GUI();
  const params = {
    brightness: 1,
    background: '#0a0a0a'
  };
  gui.add(params, 'brightness', 0.2, 2).onChange(v => dirLight.intensity = v);
  gui.addColor(params, 'background').onChange(v => scene.background.set(v));

  window.addEventListener('resize', onWindowResize);
  animate();
}

function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  renderer.render(scene, camera);
}
