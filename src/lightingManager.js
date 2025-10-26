// ==============================
// lightingManager.js  –  Lights + Ambient
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
let ambient, dir;
export function initLighting(scene) {
  ambient = new THREE.AmbientLight(0xffffff, 0.5);
  dir = new THREE.DirectionalLight(0xffffff, 1);
  dir.position.set(5, 10, 7);
  scene.add(ambient);
  scene.add(dir);
}
export function updateLighting(scene, ui) {
  dir.intensity = 1;
  ambient.intensity = 0.5;
}
