// ==============================
// materials.js  –  Shading / FX
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
export function makeMaterial(ui) {
  const color = new THREE.Color(ui.cubeColor);
  const alpha = 1 - ui.cubeTransparency;
  let mat;
  if (ui.shading === 'Flat')
    mat = new THREE.MeshLambertMaterial({ color, transparent: alpha < 1, opacity: alpha, flatShading: true });
  else
    mat = new THREE.MeshStandardMaterial({ color, roughness: 1 - ui.reflectivity, metalness: ui.reflectivity, transparent: alpha < 1, opacity: alpha });
  return mat;
}
