// ==============================
// inputManager.js – Movement + Raycast (Full Integration)
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { getUIParams } from './uiManager.js';

let camera, scene, raycaster;
let keys = {};
let velocityY = 0;

export function initInput(el, cam, scn) {
  camera = cam;
  scene = scn;
  raycaster = new THREE.Raycaster();

  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);
}

export function updateInput(dt) {
  const ui = getUIParams();
  const mode = ui.Mode;
  const gravityEnabled = ui.Gravity;
  const flySpeed = ui.FlySpeed;
  const walkSpeed = ui.WalkSpeed;
  const jumpHeight = ui.JumpHeight;

  const speed = (mode === 'Fly' ? flySpeed : walkSpeed) * dt;
  const dir = new THREE.Vector3();

  // Basic direction
  if (keys['KeyW']) dir.z -= 1;
  if (keys['KeyS']) dir.z += 1;
  if (keys['KeyA']) dir.x -= 1;
  if (keys['KeyD']) dir.x += 1;

  if (mode === 'Fly') {
    if (keys['Space']) dir.y += 1;
    if (keys['KeyC'] || keys['ControlLeft'] || keys['ShiftLeft']) dir.y -= 1;
  } else {
    // Walk mode with gravity + jump
    if (keys['Space'] && camera.position.y <= 1.51) velocityY = jumpHeight;
    if (gravityEnabled) velocityY -= 9.8 * dt;
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
