// ======================================================
//  Block Sculptor – Phase 2.2
//  FPS Controls + Custom Room Size + Collisions
// ======================================================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

// ---------- Variables ----------
let scene, camera, renderer;
let pointerLock = false;
let roomSize = 50;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let moveUp = false, moveDown = false, canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let yaw = 0, pitch = 0;
let gravity = -9.8;
let onGround = false;

// ---------- Parameters & GUI ----------
const params = {
  mode: 'Fly',
  speedMode: 'Slow',
  flySpeed: 8,
  walkSpeed: 4,
  jumpStrength: 1,
  brightness: 1,
  background: '#0a0a0a'
};
let gui;

// ---------- Room Selection ----------
const overlay = document.getElementById('overlay');
const buttons = overlay.querySelectorAll('button');
const customBtn = document.createElement('button');
customBtn.textContent = 'Custom Room';
overlay.querySelector('.buttons').appendChild(customBtn);

customBtn.addEventListener('click', () => {
  const input = document.createElement('input');
  input.type = 'number';
  input.min = 10; input.max = 100;
  input.placeholder = 'Enter size (10–100)';
  input.style.marginTop = '1rem';
  input.style.padding = '.5rem';
  overlay.querySelector('.overlay-content').appendChild(input);

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter') {
      const val = Number(input.value);
      if (val >= 10 && val <= 100) {
        roomSize = val;
        initScene();
        overlay.remove();
      } else {
        input.style.border = '2px solid red';
        input.placeholder = 'Must be 10–100';
      }
    }
  });
});

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

// ---------- Initialize Scene ----------
function initScene() {
  scene = new THREE.Scene();
  scene.background = new THREE.Color(params.background);

  camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 2000);
  camera.position.set(0, 2, 5);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, params.brightness);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Floor Grid + Room edges
  const grid = new THREE.GridHelper(roomSize, roomSize / 2, 0x444444, 0x222222);
  scene.add(grid);
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(roomSize, roomSize, roomSize));
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
  line.position.y = roomSize / 2;
  scene.add(line);

  // GUI
  gui = new GUI({ title: 'Controls', width: 300 });
  const env = gui.addFolder('Environment');
  env.addColor(params, 'background').onChange(v => scene.background.set(v));
  env.add(params, 'brightness', 0.2, 2).onChange(v => dirLight.intensity = v);

  const move = gui.addFolder('Movement');
  move.add(params, 'mode', ['Fly', 'Walk']);
  move.add(params, 'speedMode', ['Slow', 'Fast']);
  move.add(params, 'flySpeed', 1, 30, 0.5);
  move.add(params, 'walkSpeed', 1, 15, 0.5);
  move.add(params, 'jumpStrength', 0.5, 5, 0.1);

  gui.close();

  // reopen button
  const reopen = document.createElement('button');
  reopen.textContent = '⚙️';
  Object.assign(reopen.style, {
    position: 'absolute', bottom: '10px', right: '10px',
    background: 'rgba(40,40,40,0.7)', border: 'none', borderRadius: '6px',
    color: '#fff', fontSize: '18px', cursor: 'pointer'
  });
  reopen.onclick = () => gui.show(gui._hidden);
  document.body.appendChild(reopen);

  setupPointerLock();
  window.addEventListener('resize', onWindowResize);
  animate();
}

// ---------- Pointer Lock ----------
function setupPointerLock() {
  document.body.addEventListener('click', () => renderer.domElement.requestPointerLock());
  document.addEventListener('pointerlockchange', () => {
    pointerLock = document.pointerLockElement === renderer.domElement;
  });
  document.addEventListener('mousemove', onMouseMove);
  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);
}

function onMouseMove(event) {
  if (!pointerLock) return;
  const sensitivity = 0.002;
  yaw -= event.movementX * sensitivity;
  pitch -= event.movementY * sensitivity;
  pitch = Math.max(-Math.PI / 2, Math.min(Math.PI / 2, pitch));
  camera.rotation.set(pitch, yaw, 0);
}

// ---------- Keyboard ----------
function onKeyDown(e) {
  switch (e.code) {
    case 'KeyW': moveForward = true; break;
    case 'KeyA': moveLeft = true; break;
    case 'KeyS': moveBackward = true; break;
    case 'KeyD': moveRight = true; break;
    case 'Space': moveUp = true; if (params.mode === 'Walk' && onGround) jump(); break;
    case 'ControlLeft':
    case 'KeyC': moveDown = true; break;
    case 'ShiftLeft': params.speedMode = 'Fast'; break;
  }
}
function onKeyUp(e) {
  switch (e.code) {
    case 'KeyW': moveForward = false; break;
    case 'KeyA': moveLeft = false; break;
    case 'KeyS': moveBackward = false; break;
    case 'KeyD': moveRight = false; break;
    case 'Space': moveUp = false; break;
    case 'ControlLeft':
    case 'KeyC': moveDown = false; break;
    case 'ShiftLeft': params.speedMode = 'Slow'; break;
  }
}

// ---------- Jump ----------
function jump() {
  velocity.y = params.jumpStrength * 5;
  onGround = false;
}

// ---------- Resize ----------
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

// ---------- Animate ----------
function animate() {
  requestAnimationFrame(animate);
  const delta = 0.016;

  if (pointerLock) updateMovement(delta);
  renderer.render(scene, camera);
}

// ---------- Movement Update ----------
function updateMovement(delta) {
  const speedFactor = params.speedMode === 'Fast' ? 2 : 1;
  const flySpeed = params.flySpeed * speedFactor * delta;
  const walkSpeed = params.walkSpeed * speedFactor * delta;

  direction.set(0, 0, 0);
  if (moveForward) direction.z -= 1;
  if (moveBackward) direction.z += 1;
  if (moveLeft) direction.x -= 1;
  if (moveRight) direction.x += 1;
  direction.normalize();

  if (params.mode === 'Fly') {
    const moveVec = new THREE.Vector3();
    moveVec.x = Math.sin(yaw) * direction.z + Math.cos(yaw) * direction.x;
    moveVec.z = Math.cos(yaw) * direction.z - Math.sin(yaw) * direction.x;
    camera.position.addScaledVector(moveVec, flySpeed);
    if (moveUp) camera.position.y += flySpeed;
    if (moveDown) camera.position.y -= flySpeed;
  } else {
    velocity.x -= velocity.x * 10.0 * delta;
    velocity.z -= velocity.z * 10.0 * delta;
    velocity.y += gravity * delta;
    if (onGround && velocity.y < 0) velocity.y = 0;

    if (moveForward) velocity.z = -walkSpeed * 60 * delta;
    if (moveBackward) velocity.z = walkSpeed * 60 * delta;
    if (moveLeft) velocity.x = -walkSpeed * 60 * delta;
    if (moveRight) velocity.x = walkSpeed * 60 * delta;

    const dir = new THREE.Vector3(Math.sin(yaw), 0, Math.cos(yaw));
    camera.position.x += velocity.x * dir.z + velocity.z * dir.x;
    camera.position.z += velocity.x * -dir.x + velocity.z * dir.z;
    camera.position.y += velocity.y * delta;

    if (camera.position.y <= 1.6) { camera.position.y = 1.6; onGround = true; }
  }
  applyCollision();
}

// ---------- Collision ----------
function applyCollision() {
  const half = roomSize / 2 - 0.5;
  camera.position.x = Math.max(-half, Math.min(half, camera.position.x));
  camera.position.y = Math.max(1, Math.min(roomSize - 1, camera.position.y));
  camera.position.z = Math.max(-half, Math.min(half, camera.position.z));
}
