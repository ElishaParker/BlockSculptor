// ==============================
// inputManager.js – Movement + Raycast (with camera pivot)
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { getUIParams } from './uiManager.js';

let camera, scene, raycaster;
let keys = {};
let velocityY = 0;
let yaw = 0; // rotation left/right
let pitch = 0; // (optional future use)

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
  const turnSpeed = 1.8; // rotation speed (radians/sec)

  const speed = (mode === 'Fly' ? flySpeed : walkSpeed) * dt;
  const dir = new THREE.Vector3();

  // Rotation (A/D)
  if (keys['KeyA']) yaw += turnSpeed * dt;
  if (keys['KeyD']) yaw -= turnSpeed * dt;

  // Apply rotation to camera
  camera.rotation.y = yaw;

  // Forward / backward
  if (keys['KeyW']) dir.z -= 1;
  if (keys['KeyS']) dir.z += 1;

  if (mode === 'Fly') {
    if (keys['Space']) dir.y += 1;
    if (keys['KeyC'] || keys['ControlLeft'] || keys['ShiftLeft']) dir.y -= 1;
  } else {
    // Walk mode with gravity
    if (keys['Space'] && camera.position.y <= 1.51) velocityY = jumpHeight;
    if (gravityEnabled) velocityY -= 9.8 * dt;
    camera.position.y += velocityY * dt;
    if (camera.position.y < 1.5) { camera.position.y = 1.5; velocityY = 0; }
  }

  // Move relative to facing direction
  const forward = new THREE.Vector3(0, 0, -1).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);
  const right = new THREE.Vector3(1, 0, 0).applyAxisAngle(new THREE.Vector3(0, 1, 0), yaw);

  const move = new THREE.Vector3()
    .addScaledVector(forward, dir.z)
    .addScaledVector(right, dir.x)
    .addScaledVector(new THREE.Vector3(0, 1, 0), dir.y)
    .normalize()
    .multiplyScalar(speed);

  camera.position.add(move);
}

export function getRaycastData() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(scene.children, false);
  if (hits.length) return { hit: true, point: hits[0].point, face: hits[0].face, object: hits[0].object };
  return null;
}
