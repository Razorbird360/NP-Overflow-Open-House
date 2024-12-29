import * as CANNON from 'cannon-es';
import * as THREE from 'three';
import { gameState } from '@/state/state.js';

export function setupPhysicsWorld() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.81, 0)
  });

  const groundMat = new CANNON.Material();
  const groundBody = new CANNON.Body({
    shape: new CANNON.Plane(),
    type: CANNON.Body.STATIC,
    material: groundMat
  });
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  return { world, groundBody, groundMat };
}

export function setupCharacterPhysics(world, groundMat) {
  const characterMat = new CANNON.Material();
  const characterBody = new CANNON.Body({
    mass: 1000,
    position: new CANNON.Vec3(0, 1, 0),
    shape: new CANNON.Cylinder(0.5, 0.5, 1.8, 16),
    material: characterMat
  });

  characterBody.linearDamping = 0.3;
  characterBody.allowSleep = true;
  world.addBody(characterBody);

  const characterGroundContact = new CANNON.ContactMaterial(
    groundMat, characterMat,
    { friction: 10 }
  );
  world.addContactMaterial(characterGroundContact);

  // Create hitbox mesh for visualization
  const hitboxGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
  const hitboxMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00, wireframe: true });
  const hitboxMesh = new THREE.Mesh(hitboxGeo, hitboxMat);

  return { characterBody, hitboxMesh };
}

export function clampVelocity(body) {
  if (Math.abs(body.velocity.x) < 0.005) body.velocity.x = 0;
  if (Math.abs(body.velocity.z) < 0.005) body.velocity.z = 0;
  if (Math.abs(body.velocity.y) < 0.005) body.velocity.y = 0;
}

export function updatePhysics(deltaTime, ground, groundBody, hitboxMesh) {
  ground.position.copy(groundBody.position);
  ground.quaternion.copy(groundBody.quaternion);

  hitboxMesh.position.copy(gameState.characterBody.position);
  hitboxMesh.quaternion.copy(gameState.characterBody.quaternion);

  gameState.character.position.copy(gameState.characterBody.position);
  gameState.character.position.y -= 0.9;

  gameState.characterBody.quaternion.setFromEuler(0, 0, 0);
  gameState.characterBody.angularVelocity.set(0, 0, 0);
  clampVelocity(gameState.characterBody);
  gameState.world.step(1 / 60, deltaTime);
}