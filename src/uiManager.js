// ==============================
// uiManager.js – GUI + Crosshair (Guaranteed Stable)
// ==============================
import { GUI } from 'https://cdn.jsdelivr.net/npm/lil-gui@0.19/+esm';
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

let params, gui, cross = null, horiz = null, vert = null;

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

  // --- create crosshair immediately ---
  const matH = new THREE.MeshBasicMaterial({ color: params.crossColor });
  const matV = new THREE.MeshBasicMaterial({ color: params.crossColor });
  horiz = new THREE.Mesh(new THREE.PlaneGeometry(0.02, 0.002), matH);
  vert = new THREE.Mesh(new THREE.PlaneGeometry(0.002, 0.02), matV);
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
  if (!cross || !horiz || !vert) return; // double guard
  horiz.material.color.set(getUIParams().crossColor);
  vert.material.color.set(getUIParams().crossColor);
  cross.visible = getUIParams().crossVisible;
}
