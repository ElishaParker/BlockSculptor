// ==============================
// main.js  –  Core Orchestrator
// ==============================
import { initLighting, updateLighting } from './lightingManager.js';
import { initUI, getUIParams, updateUI } from './uiManager.js';
import { initInput, updateInput, getRaycastData } from './inputManager.js';
import { createCube, removeCube, updateCubes } from './cubeManager.js';

import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';

let scene, camera, renderer;
let clock = new THREE.Clock();

init();

function init() {
  scene = new THREE.Scene();
  camera = new THREE.PerspectiveCamera(75, innerWidth / innerHeight, 0.1, 2000);
  camera.position.set(0, 3, 6);

  renderer = new THREE.WebGLRenderer({ antialias: true });
  renderer.setSize(innerWidth, innerHeight);
  document.body.appendChild(renderer.domElement);

  initLighting(scene);
  initUI(scene, camera);
  initInput(renderer.domElement, camera, scene);

  window.addEventListener('resize', onResize);
  animate();
}

function onResize() {
  camera.aspect = innerWidth / innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(innerWidth, innerHeight);
}

function animate() {
  requestAnimationFrame(animate);
  const dt = clock.getDelta();

  updateInput(dt);
  updateCubes(dt);
  updateLighting(scene, getUIParams());
  updateUI();

  const ray = getRaycastData();
  const ui = getUIParams();
  if (ray && ui.action === 'add' && ray.hit && ray.leftClick) createCube(scene, ray, ui);
  if (ray && ui.action === 'remove' && ray.hit && ray.rightClick) removeCube(scene, ray.object);

  renderer.render(scene, camera);
}
