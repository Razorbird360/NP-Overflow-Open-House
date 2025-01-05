// main.js
import {gameState} from '/state/state.js';
import {createGround, createScene} from '/scene/scene.js';
import {initPhysicalBodies, setupCharacterPhysics, setupPhysicsWorld, updatePhysics} from '/physics/physics.js';
import {characterMovement, initCharacter, isMoving} from '/scene/character.js';
import {initAudio} from '/audio/audio.js';
import {loadWorldObjects} from '/scene/objects.js';
import {setupInputHandlers} from '/input.js';
import * as THREE from 'three';
import {updateCamera} from './camera/camera';
import {InteractionManager} from "three.interactive";

gameState.keys.t = 1;
async function init() {
  // Setup scene and core components
  const { scene, renderer, camera, listener, controls } = createScene();
  gameState.camera = camera;
  gameState.renderer = renderer;

  // Create ground
  const ground = createGround();
  scene.add(ground);

  // Setup physics
  const { world, groundBody, groundMat } = setupPhysicsWorld();
  gameState.world = world;
  gameState.interactive = new InteractionManager(
    renderer,
    camera,
    renderer.domElement
  );
  
  const { characterBody, hitboxMesh } = setupCharacterPhysics(world, groundMat);
  gameState.characterBody = characterBody;
  // scene.add(hitboxMesh);

  // Initialize character, audio, and world objects
  await Promise.all([
    initCharacter(scene),
    initAudio(listener),
    loadWorldObjects(scene),
    initPhysicalBodies(scene, world)
  ]);

  // Setup input handlers
  setupInputHandlers();

  // Initialize animation loop
  const clock = new THREE.Clock();
  const fps = 60;
  const interval = 1000 / fps;
  let lastTime = 0;

  function animate() {
    requestAnimationFrame(animate);

    const time = Date.now();
    if (time - lastTime >= interval) {
      lastTime = time;
      controls.update();
      renderer.render(scene, camera);

      const deltaTime = clock.getDelta();

      
      updateCamera(camera, controls, gameState.characterBody, isMoving());
      

      if (gameState.mixer) {
        gameState.mixer.update(deltaTime);
      }

      if (gameState.character) {
        characterMovement(deltaTime);
        updatePhysics(deltaTime, ground, groundBody, hitboxMesh);
      }
      if (gameState.interactive) {
        gameState.interactive.update();
      } 
    }
  }

  await renderer.setAnimationLoop(animate);
}

// Start the application
init().catch(console.error);