// ==============================
// inputManager.js – Pointer Lock + Cube Placement (fixed)
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { getUIParams } from './uiManager.js';
import { createCube, removeCube } from './cubeManager.js';

let camera, scene, raycaster, renderer;
let keys = {};
let velocityY = 0;
let yaw = 0, pitch = 0;
let sensitivity = 0.0025;
let pointerLocked = false;
let leftClick = false, rightClick = false;

export function initInput(canvas, cam, scn, rend) {
  camera = cam;
  scene = scn;
  renderer = rend;
  raycaster = new THREE.Raycaster();

  // --- pointer lock setup ---
  canvas.addEventListener('click', () => {
    canvas.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    pointerLocked = document.pointerLockElement === canvas;
  });

  // --- mouse look ---
  document.addEventListener('mousemove', e => {
    if (!pointerLocked) return;
    const ui = getUIParams();
    const sens = ui.sensitivity ?? sensitivity;
    yaw -= e.movementX * sens;
    pitch -= e.movementY * sens;
    pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
    camera.rotation.set(pitch, yaw, 0);
  });

  // --- keyboard input ---
  window.addEventListener('keydown', e => keys[e.code] = true);
  window.addEventListener('keyup', e => keys[e.code] = false);

  // --- mouse clicks (bind to renderer canvas) ---
  renderer.domElement.addEventListener('mousedown', e => {
    if (e.button === 0) leftClick = true;
    if (e.button === 2) rightClick = true;
  });
  renderer.domElement.addEventListener('mouseup', e => {
    if (e.button === 0) leftClick = false;
    if (e.button === 2) rightClick = false;
  });
  renderer.domElement.addEventListener('contextmenu', e => e.preventDefault());
}

// -----------------------------------------------
// UPDATE LOOP
// -----------------------------------------------
export function updateInput(dt) {
  const ui = getUIParams();
  const mode = ui.Mode;
  const gravityEnabled = ui.Gravity;
  const flySpeed = ui.FlySpeed;
  const walkSpeed = ui.WalkSpeed;
  const jumpHeight = ui.JumpHeight;
  sensitivity = ui.sensitivity ?? 0.0025;

  const speed = (mode === 'Fly' ? flySpeed : walkSpeed) * dt;
  const dir = new THREE.Vector3();

  if (keys['KeyW']) dir.z += 1;
  if (keys['KeyS']) dir.z -= 1;
  if (keys['KeyA']) dir.x -= 1;
  if (keys['KeyD']) dir.x += 1;

  if (mode === 'Fly') {
    if (keys['Space']) dir.y += 1;
    if (keys['KeyC'] || keys['ControlLeft'] || keys['ShiftLeft']) dir.y -= 1;
  } else {
    if (keys['Space'] && camera.position.y <= 1.51) velocityY = jumpHeight;
    if (gravityEnabled) velocityY -= 9.8 * dt;
    camera.position.y += velocityY * dt;
    if (camera.position.y < 1.5) { camera.position.y = 1.5; velocityY = 0; }
  }

  // Movement relative to facing direction
  const forward = new THREE.Vector3(0, 0, -1).applyEuler(camera.rotation);
  const right = new THREE.Vector3(1, 0, 0).applyEuler(camera.rotation);
  const move = new THREE.Vector3()
    .addScaledVector(forward, dir.z)
    .addScaledVector(right, dir.x)
    .addScaledVector(new THREE.Vector3(0, 1, 0), dir.y)
    .normalize()
    .multiplyScalar(speed);
  camera.position.add(move);

  // --- Raycast from crosshair ---
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(scene.children, false);

  if (hits.length > 0) {
    const hit = hits[0];

    // Left click → place cube
    if (leftClick && ui.action === 'add') {
      const normal = hit.face.normal.clone();
      const pos = hit.point.clone().addScaledVector(normal, ui.cubeSize / 2);
      pos.x = Math.round(pos.x / ui.cubeSize) * ui.cubeSize;
      pos.y = Math.round(pos.y / ui.cubeSize) * ui.cubeSize;
      pos.z = Math.round(pos.z / ui.cubeSize) * ui.cubeSize;
      createCube(scene, { point: pos, face: hit.face }, ui);
      leftClick = false;
    }

    // Right click → remove cube
    if (rightClick && ui.action === 'remove' && hit.object.geometry.type === 'BoxGeometry') {
      removeCube(scene, hit.object);
      rightClick = false;
    }
  }
}

// -----------------------------------------------
// Optional helper for debugging ray data
// -----------------------------------------------
export function getRaycastData() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(scene.children, false);
  if (hits.length)
    return { hit: true, point: hits[0].point, face: hits[0].face, object: hits[0].object };
  return null;
}
