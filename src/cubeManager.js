// ==============================
// cubeManager.js – Stable version (syntax-checked)
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { makeMaterial } from './materials.js';

let cubes = [];

// --------------------------------------
// CREATE CUBE (safe from nulls)
// --------------------------------------
export function createCube(scene, ray, ui) {
  const size = ui?.cubeSize || 1;
  const mat = makeMaterial(ui);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);

  // Determine placement position
  let pos = new THREE.Vector3();

  if (ray?.point) {
    // Use hit point; if a normal exists, offset by half-size
    pos.copy(ray.point);
    if (ray.face && ray.face.normal) {
      pos.addScaledVector(ray.face.normal, size / 2);
    }
  } else if (ray?.position) {
    pos.copy(ray.position);
  } else {
    // Fallback: place near origin
    pos.set(0, size / 2, 0);
  }

  // Snap to grid
  pos.x = Math.round(pos.x / size) * size;
  pos.y = Math.round(pos.y / size) * size;
  pos.z = Math.round(pos.z / size) * size;

  cube.position.copy(pos);
  cube.userData.type = ui?.cubeType || 'Static';
  scene.add(cube);
  cubes.push(cube);

  if (cube.userData.type === 'Gravity') {
    cube.userData.vel = new THREE.Vector3(0, 0, 0);
  }

  console.log(`🧊 Cube created at`, pos);
}

// --------------------------------------
// REMOVE CUBE
// --------------------------------------
export function removeCube(scene, obj) {
  if (!obj) return;
  scene.remove(obj);
  cubes = cubes.filter(c => c !== obj);
}

// --------------------------------------
// UPDATE CUBES
// --------------------------------------
export function updateCubes(dt) {
  for (const c of cubes) {
    if (c.userData.type === 'Gravity') {
      c.userData.vel.y -= 9.8 * dt;
      c.position.addScaledVector(c.userData.vel, dt);

      if (c.position.y < 0.5) {
        c.position.y = 0.5;
        c.userData.vel.y = 0;
      }
    }
  }
}
