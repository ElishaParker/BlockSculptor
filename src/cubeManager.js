// ==============================
// cubeManager.js – Cube Logic (safe + grid aligned)
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { makeMaterial } from './materials.js';

let cubes = [];

// ----------------------------------------------------
// CREATE CUBE (handles both raycast + manual placement)
// ----------------------------------------------------
export function createCube(scene, ray, ui) {
  const size = ui.cubeSize || 1;
  let pos = new THREE.Vector3();

  // ✅ Flexible input handling
  if (ray && ray.face && ray.face.normal && ray.point) {
    // If we have a surface normal (from raycast)
    pos.copy(ray.point).addScaledVector(ray.face.normal, size / 2);
  } else if (ray && ray.point) {
    // If only a point is given
    pos.copy(ray.point);
  } else if (ray && ray.position) {
    // Safety: support alternate structure
    pos.copy(ray.position);
  } else {
    console.warn('⚠️ createCube() called with invalid position data:', ray);
    return;
  }

  // ✅ Snap cube perfectly to grid
  pos.x = Math.round(pos.x / size) * size;
  pos.y = Math.round(pos.y / size) * size;
  pos.z = Math.round(pos.z / size) * size;

  // ✅ Create material + cube mesh
  const mat = makeMaterial(ui);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
  cube.position.copy(pos);
  cube.userData.type = ui.cubeType || 'Static';

  // ✅ Add cube to scene + array
  scene.add(cube);
  cubes.push(cube);

  // ✅ Optional: enable gravity cubes
  if (cube.userData.type === 'Gravity') {
    cube.userData.vel = new THREE.Vector3(0, 0, 0);
  }

  console.log(`🧊 Cube created at: (${pos.x}, ${pos.y}, ${pos.z})`);
}

// ----------------------------------------------------
// REMOVE CUBE
// ----------------------------------------------------
export function removeCube(scene, obj) {
  if (!obj) return;
  scene.remove(obj);
  cubes = cubes.filter(c => c !== obj);
  console.log('🗑️ Cube removed');
}

// ----------------------------------------------------
// UPDATE CUBES (gravity + physics)
// ----------------------------------------------------
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
