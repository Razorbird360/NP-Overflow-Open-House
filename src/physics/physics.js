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
  gameState.groundBody = groundBody;
  groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
  world.addBody(groundBody);

  return { world, groundBody, groundMat };
}

export function setupCharacterPhysics(world, groundMat) {
  const characterMat = new CANNON.Material();
  const characterBody = new CANNON.Body({
    mass: 1000,
    position: new CANNON.Vec3(0, 1.5, 0),
    shape: new CANNON.Cylinder(0.5, 0.5, 1.8, 16),
    material: characterMat
  });

  characterBody.linearDamping = 0.999;
  characterBody.allowSleep = true;
  world.addBody(characterBody);

  const characterGroundContact = new CANNON.ContactMaterial(
    groundMat, characterMat,
    { 
      friction: 0, 
      restitution: 0
    }
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

export function updatePhysics(deltaTime, ground, groundBody, soccerBall, soccerBallBody, dice1, dice2, dice3, diceBody1, diceBody2, diceBody3) {
  ground.position.copy(groundBody.position);
  ground.quaternion.copy(groundBody.quaternion);

  // hitboxMesh.position.copy(gameState.characterBody.position);
  // hitboxMesh.quaternion.copy(gameState.characterBody.quaternion);

  soccerBall.position.copy(soccerBallBody.position);
  soccerBall.quaternion.copy(soccerBallBody.quaternion);

  dice1.position.copy(diceBody1.position);
  dice1.quaternion.copy(diceBody1.quaternion);

  dice2.position.copy(diceBody2.position);
  dice2.quaternion.copy(diceBody2.quaternion);

  dice3.position.copy(diceBody3.position);
  dice3.quaternion.copy(diceBody3.quaternion);

  gameState.character.position.copy(gameState.characterBody.position);
  gameState.character.position.y -= 0.9;

  gameState.characterBody.quaternion.setFromEuler(0, 0, 0);
  gameState.characterBody.angularVelocity.set(0, 0, 0);
  clampVelocity(gameState.characterBody);
  gameState.world.step(1 / 60, deltaTime);
}

export function initPhysicalBodies(scene, world) {
  //Object bodies and visual representation
  const houseBoxGeo = new THREE.BoxGeometry(5.5, 10, 8.5, 16);
  const houseBoxMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00, wireframe: true });
  const houseBoxMesh = new THREE.Mesh(houseBoxGeo, houseBoxMat);
  houseBoxMesh.position.set(0, 5, -9);
  // scene.add(houseBoxMesh);

  const houseBoxBody = new CANNON.Body({
    shape: new CANNON.Box(new CANNON.Vec3(2.75, 5, 4.25)),
    type: CANNON.Body.STATIC,
    position: new CANNON.Vec3(0, 5, -9),
  });
  world.addBody(houseBoxBody);

  const soccerBallBody = new CANNON.Body({
    mass: 50,
    position: new CANNON.Vec3(-10, 3, 0),
    shape: new CANNON.Sphere(0.8),
  });
  world.addBody(soccerBallBody);
  gameState.soccerBallBody = soccerBallBody;

  const groundMaterial = new CANNON.Material();
  const ballMaterial = new CANNON.Material();
  // const groundBody = gameState.groundBody;
  // soccerBallBody.material = ballMaterial;
  // groundBody.material = groundMaterial;
  // const contactMaterial = new CANNON.ContactMaterial(groundMaterial, ballMaterial, {
  //   friction: 0,
  //   restitution: 0,
  // });
  soccerBallBody.linearDamping = 0.9;

  addFenceBody(world);
  addDiceBody(world);
}

function addFenceBody(world) {
  const length = 14.5;
  const width = 0.3;

  const fenceShape = new CANNON.Box(new CANNON.Vec3(length / 2, 2, width / 2));
  const fenceBody = new CANNON.Body({
      mass: 0,
      position: new CANNON.Vec3(-16, 1, 3)
  });
  fenceBody.addShape(fenceShape);
  world.addBody(fenceBody);

  const otherFence = new CANNON.Body({
    mass: 0,
    position: new CANNON.Vec3(-16, 1, -3)
  });
  otherFence.addShape(fenceShape);
  world.addBody(otherFence);
}

function addDiceBody(world) {
  const diceShape = new CANNON.Box(new CANNON.Vec3(0.8, 0.8, 0.8));

  const diceBody1 = new CANNON.Body({
    mass: 10,
    position: new CANNON.Vec3(-22, 0.75, -1),
    shape: diceShape
  });
  world.addBody(diceBody1);
  gameState.diceBody1 = diceBody1;

  const diceBody2 = new CANNON.Body({
    mass: 10,
    position: new CANNON.Vec3(-22, 2.5, 0),
    shape: diceShape
  });
  world.addBody(diceBody2);
  gameState.diceBody2 = diceBody2;

  const diceBody3 = new CANNON.Body({
    mass: 10,
    position: new CANNON.Vec3(-22, 0.75, 1),
    shape: diceShape
  });
  world.addBody(diceBody3);
  gameState.diceBody3 = diceBody3;
}