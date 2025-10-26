// ==============================
// uiManager.js  –  GUI + Crosshair (Fixed)
// ==============================
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

let params, gui, cross;

export function initUI(scene, camera) {
  params = {
    action: 'add',
    cubeSize: 1,
    cubeColor: '#88ccff',
    cubeTransparency: 0,
    cubeType: 'Static',
    shading: 'Flat',
    reflectivity: 0.2,
    crossVisible: true,
    crossColor: '#ffffff'
  };

  gui = new GUI({ width: 300 });
  const f1 = gui.addFolder('Cube');
  f1.add(params, 'action', ['add', 'remove']);
  f1.add(params, 'cubeSize', 0.25, 4, 0.25);
  f1.addColor(params, 'cubeColor');
  f1.add(params, 'cubeTransparency', 0, 1, 0.01);
  f1.add(params, 'cubeType', ['Static', 'Gravity']);
  f1.add(params, 'shading', ['Flat', 'Smooth']);
  f1.add(params, 'reflectivity', 0, 1, 0.01);
  const f2 = gui.addFolder('Crosshair');
  f2.add(params, 'crossVisible');
  f2.addColor(params, 'crossColor');
  gui.close();

  // Create proper crosshair and attach to camera
  const geoH = new THREE.PlaneGeometry(0.02, 0.002);
  const geoV = new THREE.PlaneGeometry(0.002, 0.02);
  const mat = new THREE.MeshBasicMaterial({ color: params.crossColor });
  const horiz = new THREE.Mesh(geoH, mat);
  const vert = new THREE.Mesh(geoV, mat);
  cross = new THREE.Group();
  cross.add(horiz, vert);
  cross.position.set(0, 0, -1); // center of view
  camera.add(cross);
  scene.add(camera); // ensure camera (with cross) is in scene
}

export function getUIParams() { return params; }

export function updateUI() {
  if (!cross) return; // prevents undefined errors
  cross.visible = params.crossVisible;
  cross.children.forEach(c => c.material.color.set(params.crossColor));
}
