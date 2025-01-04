// main.js
import { gameState } from '/state/state.js';
import { createScene, createGround } from '/scene/scene.js';
import { setupPhysicsWorld, setupCharacterPhysics, updatePhysics, initPhysicalBodies } from '/physics/physics.js';
import { initCharacter, characterMovement, isMoving } from '/scene/character.js';
import { initAudio } from '/audio/audio.js';
import { loadWorldObjects } from '/scene/objects.js';
import { setupInputHandlers } from '/input.js';
import * as THREE from 'three';
import { updateCamera } from './camera/camera';

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

  const { characterBody, hitboxMesh } = setupCharacterPhysics(world, groundMat);
  gameState.characterBody = characterBody;
  scene.add(hitboxMesh);

  // Add a rotating cube
   const geometry = new THREE.BoxGeometry();
   const material = new THREE.MeshBasicMaterial({ color: 0x00ff00 });
   const cube = new THREE.Mesh(geometry, material);
   scene.add(cube);
   camera.position.z = 5;

  // Setup raycaster and mouse
   const raycaster = new THREE.Raycaster();
   const mouse = new THREE.Vector2();

   function onDocumentClick(event) {
     event.preventDefault();
     mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
     mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
     raycaster.setFromCamera(mouse, camera);
     const intersects = raycaster.intersectObjects(scene.children);
     if (intersects.length > 0) {
       const clickedObject = intersects[0].object;
       console.log('Object clicked:', clickedObject.name || clickedObject);
     }
   }
   window.addEventListener('click', onDocumentClick, false);

  // Initialize character, audio, and world objects
  await Promise.all([
    initCharacter(scene),
    initAudio(listener),
    loadWorldObjects(scene),
    initPhysicalBodies(scene, world)
  ]);

  // Fetch and handle JSON data
  fetch('@/public/posts.json')
    .then((response) => {
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      return response.json();
    })
    .then((event) => {
      document.getElementById('popupImage').src = event.image;
      document.getElementById('popupTitle').textContent = event.title;
      document.getElementById('popupDescription').innerHTML = event.description;
      document.getElementById('closePopup').textContent = "Close";
    })
    .catch((error) => {
      console.error('Error loading JSON:', error);
    });

  window.addEventListener('click', () => {
    document.getElementById('popup').style.display = 'block';
  });

  document.getElementById('closePopup').addEventListener('click', () => {
    document.getElementById('popup').style.display = 'none';
  });

  
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

      if (!isMoving()) {
        controls.enabled = true;
      } 
      else {
        updateCamera(camera, controls, gameState.characterBody);
      }

      if (gameState.mixer) {
        gameState.mixer.update(deltaTime);
      }

      if (gameState.character) {
        characterMovement(deltaTime);
        updatePhysics(deltaTime, ground, groundBody, hitboxMesh);
      }
    }
  }

  await renderer.setAnimationLoop(animate);
}

// Start the application
init().catch(console.error);
