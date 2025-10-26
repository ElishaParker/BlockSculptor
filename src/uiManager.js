// ==============================
// uiManager.js – Unified GUI Controller
// ==============================
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { applyEnvironmentChanges } from './lightingManager.js';

let params, gui, cross, horiz, vert;
let sceneRef, camRef;

export function initUI(scene, camera) {
  sceneRef = scene;
  camRef = camera;

  params = {
    // --- Environment ---
    background: '#000000',
    brightness: 1.0,

    // --- Cube ---
    action: 'add',
    cubeSize: 1,
    cubeColor: '#88ccff',
    cubeTransparency: 0,
    cubeType: 'Static',
    shading: 'Flat',
    reflectivity: 0.2,

    // --- Crosshair ---
    crossVisible: true,
    crossColor: '#ffffff',

    // --- Movement ---
    Mode: 'Fly',
    Gravity: false,
    FlySpeed: 10,
    WalkSpeed: 5,
    JumpHeight: 2.5
  };

  gui = new GUI({ width: 300 });
  gui.title('Controls');

  // ENVIRONMENT
  const env = gui.addFolder('Environment');
  env.addColor(params, 'background').onChange(() => {
    sceneRef.background = new THREE.Color(params.background);
  });
  env.add(params, 'brightness', 0.1, 2, 0.01).onChange(() => {
    applyEnvironmentChanges(sceneRef, params);
  });

  // CUBE
  const cube = gui.addFolder('Cube');
  cube.add(params, 'action', ['add', 'remove']);
  cube.add(params, 'cubeSize', 0.25, 4, 0.25);
  cube.addColor(params, 'cubeColor');
  cube.add(params, 'cubeTransparency', 0, 1, 0.01);
  cube.add(params, 'cubeType', ['Static', 'Gravity']);
  cube.add(params, 'shading', ['Flat', 'Smooth']);
  cube.add(params, 'reflectivity', 0, 1, 0.01);

  // CROSSHAIR
  const crossFolder = gui.addFolder('Crosshair');
  crossFolder.add(params, 'crossVisible');
  crossFolder.addColor(params, 'crossColor');

  // MOVEMENT
  const move = gui.addFolder('Movement');
  move.add(params, 'Mode', ['Fly', 'Walk']);
  move.add(params, 'Gravity');
  move.add(params, 'FlySpeed', 1, 50, 0.5);
  move.add(params, 'WalkSpeed', 1, 20, 0.5);
  move.add(params, 'JumpHeight', 1, 10, 0.5);

  gui.close();

  // --- Crosshair setup ---
  const matH = new THREE.MeshBasicMaterial({ color: params.crossColor });
  const matV = new THREE.MeshBasicMaterial({ color: params.crossColor });
  const geoH = new THREE.PlaneGeometry(0.02, 0.002);
  const geoV = new THREE.PlaneGeometry(0.002, 0.02);
  horiz = new THREE.Mesh(geoH, matH);
  vert = new THREE.Mesh(geoV, matV);
  cross = new THREE.Group();
  cross.add(horiz, vert);
  cross.position.set(0, 0, -1);
  camera.add(cross);
  scene.add(camera);
}

export function getUIParams() { return params; }

export function updateUI() {
  if (!cross) return;
  horiz.material.color.set(params.crossColor);
  vert.material.color.set(params.crossColor);
  cross.visible = params.crossVisible;
}
