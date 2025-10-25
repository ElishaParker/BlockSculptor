// ======================================================
//  Block Sculptor – Phase 2
//  FPS Controls + Fly / Walk Modes + Tunable Speeds
// ======================================================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';

// ---------- Variables ----------
let scene, camera, renderer, pointerLock;
let roomSize = 50;
let moveForward = false, moveBackward = false, moveLeft = false, moveRight = false;
let moveUp = false, moveDown = false, canJump = false;
let velocity = new THREE.Vector3();
let direction = new THREE.Vector3();
let gravity = -9.8;
let onGround = false;

// ---------- Parameters & GUI ----------
const params = {
  mode: 'Fly', // Fly or Walk
  speedMode: 'Slow', // Slow or Fast
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

  const aspect = window.innerWidth / window.innerHeight;
  camera = new THREE.PerspectiveCamera(75, aspect, 0.1, 2000);
  camera.position.set(roomSize / 4, roomSize / 6, roomSize / 4);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  // Lights
  const ambient = new THREE.AmbientLight(0xffffff, 0.4);
  scene.add(ambient);
  const dirLight = new THREE.DirectionalLight(0xffffff, params.brightness);
  dirLight.position.set(5, 10, 7);
  scene.add(dirLight);

  // Floor Grid
  const grid = new THREE.GridHelper(roomSize, roomSize / 2, 0x444444, 0x222222);
  scene.add(grid);

  // Room Box
  const edges = new THREE.EdgesGeometry(new THREE.BoxGeometry(roomSize, roomSize, roomSize));
  const line = new THREE.LineSegments(edges, new THREE.LineBasicMaterial({ color: 0x333333 }));
  line.position.y = roomSize / 2;
  scene.add(line);

  // GUI Setup
  gui = new GUI({ title: 'Controls', width: 300 });
  gui.domElement.style.position = 'absolute';
  gui.domElement.style.top = '10px';
  gui.domElement.style.right = '10px';

  const env = gui.addFolder('Environment');
  env.addColor(params, 'background').onChange(v => scene.background.set(v));
  env.add(params, 'brightness', 0.2, 2).onChange(v => dirLight.intensity = v);

  const movement = gui.addFolder('Movement');
  movement.add(params, 'mode', ['Fly', 'Walk']).name('Mode');
  movement.add(params, 'speedMode', ['Slow', 'Fast']).name('Speed Mode');
  movement.add(params, 'flySpeed', 1, 30, 0.5).name('Fly Speed');
  movement.add(params, 'walkSpeed', 1, 15, 0.5).name('Walk Speed');
  movement.add(params, 'jumpStrength', 0.5, 5, 0.1).name('Jump Height');

  gui.close(); // start collapsed

  // Reopen button
  const reopenBtn = document.createElement('button');
  reopenBtn.textContent = '⚙️';
  reopenBtn.style.position = 'absolute';
  reopenBtn.style.bottom = '10px';
  reopenBtn.style.right = '10px';
  reopenBtn.style.background = 'rgba(40,40,40,0.7)';
  reopenBtn.style.border = 'none';
  reopenBtn.style.borderRadius = '6px';
  reopenBtn.style.color = '#fff';
  reopenBtn.style.fontSize = '18px';
  reopenBtn.style.cursor = 'pointer';
  reopenBtn.onclick = () => gui.show(gui._hidden);
  document.body.appendChild(reopenBtn);

  setupPointerLock();
  window.addEventListener('resize', onWindowResize);
  animate();
}

// ---------- Pointer Lock + Keyboard ----------
function setupPointerLock() {
  const blocker = document.body;
  blocker.addEventListener('click', () => {
    renderer.domElement.requestPointerLock();
  });

  document.addEventListener('pointerlockchange', () => {
    pointerLock = document.pointerLockElement === renderer.domElement;
  });

  document.addEventListener('keydown', onKeyDown);
  document.addEventListener('keyup', onKeyUp);

  function onKeyDown(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': moveForward = true; break;
      case 'ArrowLeft':
      case 'KeyA': moveLeft = true; break;
      case 'ArrowDown':
      case 'KeyS': moveBackward = true; break;
      case 'ArrowRight':
      case 'KeyD': moveRight = true; break;
      case 'Space': moveUp = true; if (params.mode === 'Walk' && onGround) jump(); break;
      case 'ControlLeft':
      case 'ControlRight': moveDown = true; break;
      case 'ShiftLeft':
      case 'ShiftRight': params.speedMode = 'Fast'; break;
    }
  }
  function onKeyUp(event) {
    switch (event.code) {
      case 'ArrowUp':
      case 'KeyW': moveForward = false; break;
      case 'ArrowLeft':
      case 'KeyA': moveLeft = false; break;
      case 'ArrowDown':
      case 'KeyS': moveBackward = false; break;
      case 'ArrowRight':
      case 'KeyD': moveRight = false; break;
      case 'Space': moveUp = false; break;
      case 'ControlLeft':
      case 'ControlRight': moveDown = false; break;
      case 'ShiftLeft':
      case 'ShiftRight': params.speedMode = 'Slow'; break;
    }
  }
}

// ---------- Jump Logic ----------
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

// ---------- Main Loop ----------
function animate() {
  requestAnimationFrame(animate);
  const delta = 0.016; // fixed timestep for simplicity

  if (pointerLock) {
    const actualFlySpeed = (params.speedMode === 'Fast' ? 2 : 1) * params.flySpeed;
    const actualWalkSpeed = (params.speedMode === 'Fast' ? 2 : 1) * params.walkSpeed;

    direction.z = Number(moveForward) - Number(moveBackward);
    direction.x = Number(moveRight) - Number(moveLeft);
    direction.y = Number(moveUp) - Number(moveDown);
    direction.normalize();

    if (params.mode === 'Fly') {
      const speed = actualFlySpeed * delta;
      camera.position.addScaledVector(getCameraDirection(), direction.z * speed);
      camera.translateX(direction.x * speed);
      camera.translateY(direction.y * speed);
    } else {
      // Walk mode
      velocity.x -= velocity.x * 10.0 * delta;
      velocity.z -= velocity.z * 10.0 * delta;

      velocity.y += gravity * delta;

      if (onGround && velocity.y < 0) velocity.y = 0;

      if (moveForward) velocity.z = -actualWalkSpeed;
      if (moveBackward) velocity.z = actualWalkSpeed;
      if (moveLeft) velocity.x = -actualWalkSpeed;
      if (moveRight) velocity.x = actualWalkSpeed;

      camera.position.x += velocity.x * delta;
      camera.position.z += velocity.z * delta;
      camera.position.y += velocity.y * delta;

      if (camera.position.y <= 1.6) { // ground level
        camera.position.y = 1.6;
        onGround = true;
      }
    }
  }

  renderer.render(scene, camera);
}

// ---------- Utility ----------
function getCameraDirection() {
  const dir = new THREE.Vector3();
  camera.getWorldDirection(dir);
  return dir.normalize();
}
