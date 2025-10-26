// ==============================
// cubeManager.js  –  Cube Logic
// ==============================
import * as THREE from 'https://unpkg.com/three@0.158.0/build/three.module.js';
import { makeMaterial } from './materials.js';

let cubes = [];
export function createCube(scene, ray, ui) {
  const size = ui.cubeSize;
  const pos = ray.point.clone().addScaledVector(ray.face.normal, size / 2);
  pos.divideScalar(size).floor().multiplyScalar(size).addScalar(size / 2);

  const mat = makeMaterial(ui);
  const cube = new THREE.Mesh(new THREE.BoxGeometry(size, size, size), mat);
  cube.position.copy(pos);
  cube.userData.type = ui.cubeType;
  scene.add(cube);
  cubes.push(cube);

  if (ui.cubeType === 'Gravity') cube.userData.vel = new THREE.Vector3(0, 0, 0);
}

export function removeCube(scene, obj) {
  scene.remove(obj);
  cubes = cubes.filter(c => c !== obj);
}

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
