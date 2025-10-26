// ==============================
// main.js – Core Orchestrator (Voxel Room Edition)
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { initLighting, updateLighting } from './lightingManager.js';
import { initUI, getUIParams, updateUI } from './uiManager.js';
import { initInput, updateInput } from './inputManager.js';
import { createCube, removeCube, updateCubes } from './cubeManager.js';

let scene, camera, renderer;
let clock = new THREE.Clock();
let room, walls = {}, grid, roomSize = 50, halfSize = roomSize / 2;

// ---------- Initialization ----------
init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
  camera.position.set(0, 3, 6);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  // --- GRID HELPER ---
  grid = new THREE.GridHelper(roomSize, roomSize, 0x444444, 0x222222);
  scene.add(grid);

  // --- VOXEL ROOM WALLS + FLOOR + CEILING ---
  const wallMat = new THREE.MeshStandardMaterial({ color: 0x555555, side: THREE.BackSide });
  const floorMat = new THREE.MeshStandardMaterial({ color: 0x333333 });
  const ceilMat = new THREE.MeshStandardMaterial({ color: 0x222222 });

  // Floor
  walls.floor = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), floorMat);
  walls.floor.rotation.x = -Math.PI / 2;
  walls.floor.position.y = 0;

  // Ceiling
  walls.ceiling = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), ceilMat);
  walls.ceiling.rotation.x = Math.PI / 2;
  walls.ceiling.position.y = roomSize;

  // Back wall
  walls.back = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), wallMat);
  walls.back.position.z = -halfSize;
  walls.back.position.y = halfSize;
  walls.back.rotation.y = Math.PI;

  // Front wall
  walls.front = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), wallMat);
  walls.front.position.z = halfSize;
  walls.front.position.y = halfSize;

  // Left wall
  walls.left = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), wallMat);
  walls.left.position.x = -halfSize;
  walls.left.position.y = halfSize;
  walls.left.rotation.y = Math.PI / 2;

  // Right wall
  walls.right = new THREE.Mesh(new THREE.PlaneGeometry(roomSize, roomSize), wallMat);
  walls.right.position.x = halfSize;
  walls.right.position.y = halfSize;
  walls.right.rotation.y = -Math.PI / 2;

  Object.values(walls).forEach(w => scene.add(w));

  // --- LIGHTING + UI + INPUT ---
  initLighting(scene);
  initUI(scene, camera);
  initInput(renderer.domElement, camera, scene);

  window.addEventListener('resize', onResize);
  animate();
}

// ---------- Collision ----------
function applyCollision(position) {
  position.x = Math.max(-halfSize + 0.5, Math.min(halfSize - 0.5, position.x));
  position.y = Math.max(0.5, Math.min(roomSize - 0.5, position.y));
  position.z = Math.max(-halfSize + 0.5, Math.min(halfSize - 0.5, position.z));
}

// ---------- Resize ----------
function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

// ---------- Animation ----------
function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  updateInput(dt);
  applyCollision(camera.position);
  updateCubes(dt);
  updateLighting(scene, getUIParams());
  updateUI();
  updateRoomVisuals();

  renderer.render(scene, camera);
}

// ---------- Room Visual Controls ----------
function updateRoomVisuals() {
  const ui = getUIParams();
  if (!ui) return;

  // Room colors and visibility
  if (ui.roomColors) {
    walls.floor.material.color.set(ui.roomColors.floor);
    walls.ceiling.material.color.set(ui.roomColors.ceiling);
    walls.front.material.color.set(ui.roomColors.walls);
    walls.back.material.color.set(ui.roomColors.walls);
    walls.left.material.color.set(ui.roomColors.walls);
    walls.right.material.color.set(ui.roomColors.walls);
  }

  walls.floor.visible = ui.showFloor;
  walls.ceiling.visible = ui.showCeiling;
  walls.front.visible = walls.back.visible = walls.left.visible = walls.right.visible = ui.showWalls;
  grid.visible = ui.showGrid;
}

// ---------- Voxel Snapping Helper ----------
export function snapToGrid(pos, cubeSize = 1) {
  return new THREE.Vector3(
    Math.round(pos.x / cubeSize) * cubeSize,
    Math.round(pos.y / cubeSize) * cubeSize,
    Math.round(pos.z / cubeSize) * cubeSize
  );
}
