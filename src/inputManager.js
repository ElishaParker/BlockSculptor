// ==============================
// inputManager.js  –  Movement + Raycast
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
let dom, camera, scene, raycaster, mouse = new THREE.Vector2(), pointerLock = false;
let leftClick = false, rightClick = false;
let keys = {};
export function initInput(el, cam, scn) {
  dom = el; camera = cam; scene = scn;
  raycaster = new THREE.Raycaster();
  dom.addEventListener('click', () => dom.requestPointerLock());
  document.addEventListener('pointerlockchange', () => pointerLock = document.pointerLockElement === dom);
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('mousedown', e => { if (e.button === 0) leftClick = true; if (e.button === 2) rightClick = true; });
  document.addEventListener('mouseup', () => { leftClick = false; rightClick = false; });
  document.addEventListener('keydown', e => keys[e.code] = true);
  document.addEventListener('keyup', e => keys[e.code] = false);
}
let yaw = 0, pitch = 0;
export function updateInput(dt) {
  if (!pointerLock) return;
  const spd = (keys['ShiftLeft'] ? 10 : 5) * dt;
  const dir = new THREE.Vector3();
  if (keys['KeyW']) dir.z -= 1;
  if (keys['KeyS']) dir.z += 1;
  if (keys['KeyA']) dir.x -= 1;
  if (keys['KeyD']) dir.x += 1;
  if (keys['Space']) dir.y += 1;
  if (keys['ControlLeft']) dir.y -= 1;
  dir.normalize();
  const mat = new THREE.Matrix4();
  mat.extractRotation(camera.matrix);
  dir.applyMatrix4(mat);
  camera.position.addScaledVector(dir, spd);
}
export function onMouseMove(e) {
  if (!pointerLock) return;
  const sens = 0.002;
  yaw -= e.movementX * sens;
  pitch -= e.movementY * sens;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  camera.rotation.set(pitch, yaw, 0);
}
export function getRaycastData() {
  raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);
  const hits = raycaster.intersectObjects(scene.children, false);
  if (hits.length) return { hit: true, point: hits[0].point, face: hits[0].face, object: hits[0].object, leftClick, rightClick };
  return null;
}
