// ==============================
// inputManager.js – Movement + Raycast (Flythrough Default)
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { getUIParams } from './uiManager.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

let camera, scene, raycaster, keys = {};
let mode = 'Fly', gravityEnabled = false;
let velocityY = 0;
let flySpeed = 10, walkSpeed = 5, jumpHeight = 2.5;
let gui, params = {};

export function initInput(el, cam, scn) {
  camera = cam;
  scene = scn;
  raycaster = new THREE.Raycaster();

  // --- keyboard events ---
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);

  // --- GUI integration ---
  params = {
    Mode: 'Fly',
    Gravity: false,
    FlySpeed: 10,
    WalkSpeed: 5,
    JumpHeight: 2.5
  };
  gui = new GUI({ width: 300 });
  const f = gui.addFolder('Movement');
  f.add(params, 'Mode', ['Fly', 'Walk']).onChange(v => mode = v);
  f.add(params, 'Gravity').onChange(v => gravityEnabled = v);
  f.add(params, 'FlySpeed', 1, 50, 0.5);
  f.add(params, 'WalkSpeed', 1, 20, 0.5);
  f.add(params, 'JumpHeight', 1, 10, 0.5);
  f.close();
}

export function updateInput(dt) {
  const speed = (mode === 'Fly' ? params.FlySpeed : params.WalkSpeed) * dt;
  const dir = new THREE.Vector3();

  if (keys['KeyW']) dir.z -= 1;
  if (keys['KeyS']) dir.z += 1;
  if (keys['KeyA']) dir.x -= 1;
  if (keys['KeyD']) dir.x += 1;

  if (mode === 'Fly') {
    if (keys['Space']) dir.y += 1;
    if (keys['ControlLeft']) dir.y -= 1;
  } else {
    // Walk mode
    if (keys['Space'] && camera.position.y <= 1.51) velocityY = params.JumpHeight;
    velocityY -= (gravityEnabled ? 9.8 * dt : 0);
    camera.position.y += velocityY * dt;
    if (camera.position.y < 1.5) { camera.position.y = 1.5; velocityY = 0; }
  }

  dir.normalize();
  const mat = new THREE.Matrix4().extractRotation(camera.matrix);
  dir.applyMatrix4(mat);
  camera.position.addScaledVector(dir, speed);
}

export function getRaycastData() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(scene.children, false);
  if (hits.length) return { hit: true, point: hits[0].point, face: hits[0].face, object: hits[0].object };
  return null;
}
