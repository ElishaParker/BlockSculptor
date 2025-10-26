// ==============================
// uiManager.js – GUI + Crosshair (Stable Build)
// ==============================
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

let params, gui, cross, mat;

export function initUI(scene, camera) {
  params = {
    // Cube options
    action: 'add',
    cubeSize: 1,
    cubeColor: '#88ccff',
    cubeTransparency: 0,
    cubeType: 'Static',
    shading: 'Flat',
    reflectivity: 0.2,

    // Crosshair
    crossVisible: true,
    crossColor: '#ffffff',

    // Movement
    Mode: 'Fly',
    Gravity: false,
    FlySpeed: 10,
    WalkSpeed: 5,
    JumpHeight: 2.5,
  };

  gui = new GUI({ width: 300 });
  
  const cubeFolder = gui.addFolder('Cube');
  cubeFolder.add(params, 'action', ['add', 'remove']);
  cubeFolder.add(params, 'cubeSize', 0.25, 4, 0.25);
  cubeFolder.addColor(params, 'cubeColor');
  cubeFolder.add(params, 'cubeTransparency', 0, 1, 0.01);
  cubeFolder.add(params, 'cubeType', ['Static', 'Gravity']);
  cubeFolder.add(params, 'shading', ['Flat', 'Smooth']);
  cubeFolder.add(params, 'reflectivity', 0, 1, 0.01);

  const moveFolder = gui.addFolder('Movement');
  moveFolder.add(params, 'Mode', ['Fly', 'Walk']);
  moveFolder.add(params, 'Gravity');
  moveFolder.add(params, 'FlySpeed', 1, 30, 1);
  moveFolder.add(params, 'WalkSpeed', 1, 30, 1);
  moveFolder.add(params, 'JumpHeight', 0.5, 10, 0.5);
  moveFolder.add(params, 'sensitivity', 0.001, 0.01, 0.0005);


  const crossFolder = gui.addFolder('Crosshair');
  crossFolder.add(params, 'crossVisible');
  crossFolder.addColor(params, 'crossColor');

  gui.close();

  // Crosshair
  mat = new THREE.MeshBasicMaterial({ color: params.crossColor });
  const h = new THREE.PlaneGeometry(0.02, 0.002);
  const v = new THREE.PlaneGeometry(0.002, 0.02);
  const horiz = new THREE.Mesh(h, mat);
  const vert = new THREE.Mesh(v, mat);
  cross = new THREE.Group();
  cross.add(horiz, vert);
  cross.position.set(0, 0, -1);
  camera.add(cross);
  scene.add(camera);
}

export function getUIParams() {
  return params;
}

export function updateUI() {
  if (!mat || !cross || !params) return;
  mat.color.set(params.crossColor);
  cross.visible = params.crossVisible;
}
