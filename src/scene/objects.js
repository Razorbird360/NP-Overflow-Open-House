import { GLTFLoader } from "three/examples/jsm/loaders/GLTFLoader.js";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { gameState } from "@/state/state.js";
import { BASE_PATH } from "@/utils/utils.js";
import { loadEvents } from "@/scene/events.js";
import { loadNotice } from "@/scene/notice.js";
import { loadSoccer } from "@/scene/soccer.js";
import { castShadow } from "@/scene/scene.js";

export function changeModelColor(model, color) {
  let hasChildren = false;
  model.traverse(function (child) {
    if (child.isMesh) {
      hasChildren = true;
      if (child.material) {
        child.material.color.set(color);
        child.material.needsUpdate = true;
      }
    }
  });

  if (!hasChildren && model.material) {
    model.material.color.set(color);
    model.material.needsUpdate = true;
  }
}

export async function loadWorldObjects(scene, playerPosition) {
  const fbxloader = new FBXLoader();
  const gltfloader = new GLTFLoader();

  // Load house (check to avoid duplicate loading)
  if (!gameState.objects.house) {
    const houseModel = await gltfloader.loadAsync(
      `${BASE_PATH}world_objects/cottage.glb`
    );
    gameState.objects.house = houseModel.scene || houseModel;
    gameState.objects.house.position.set(-0.3, 0, -5);
    gameState.objects.house.rotation.y = -Math.PI / 2;
    gameState.objects.house.scale.set(2, 2, 2);
    castShadow(gameState.objects.house);
    scene.add(gameState.objects.house);
  }


  // Load grass
  await loadGrass(scene);

  // Load golf area signs
  await loadGolfAreaSign(scene, playerPosition);

  // Load additional objects
  const workshopsModel = await loadEvents(scene);
  const bulletin = await loadNotice(scene);
  const soccer = await loadSoccer(scene);

  gameState.loadedObjects = true;
}


// Load grass
export async function loadGrass(scene) {
  const loader = new GLTFLoader();
  try {
    const gltf = await loader.loadAsync(
      `${BASE_PATH}world_objects/low_poly_grass.glb`
    );
    const grassModel = gltf.scene;

    // Grass size
    grassModel.scale.set(0.02, 0.02, 0.02);

    const grassCount = 200;
    const groundSize = 100;

    for (let i = 0; i < grassCount; i++) {
      const clone = grassModel.clone();

      const x = Math.random() * groundSize - groundSize / 2;
      const z = Math.random() * groundSize - groundSize / 2;

      // Avoid placing grass near the flag location
      if (Math.abs(x + 23) < 5 && Math.abs(z) < 5) continue;

      clone.position.set(x, 0.1, z);
      clone.rotation.y = Math.random() * Math.PI * 2;

      scene.add(clone);
    }
  } catch (error) {
    console.error("Error loading grass:", error);
  }
}

// Load golf area signs
export async function loadGolfAreaSign(scene, playerPosition) {
  const gltfloader = new GLTFLoader();
  try {
    const signModel = await gltfloader.loadAsync(
      `${BASE_PATH}world_objects/golf_area_sign.glb`
    );

    // Left sign
    const leftSign = signModel.scene.clone();
    leftSign.scale.set(0.8, 0.8, 0.8); 
    leftSign.position.set(playerPosition.x - 5, playerPosition.y, playerPosition.z + 3); // Position left of the player
    
    // rotates the sign so that it faces the player
    const dx = playerPosition.x - leftSign.position.x;
    const dz = playerPosition.z - leftSign.position.z;
      leftSign.rotation.y = Math.atan2(dx, dz);
    
    castShadow(leftSign);
    scene.add(leftSign);

    // Load events area sign for the right sign
    const eventsSignModel = await gltfloader.loadAsync(
      `${BASE_PATH}world_objects/events_area_sign.glb`
    );

    // Right sign
    const rightSign = eventsSignModel.scene.clone();
    rightSign.scale.set(0.8, 0.8, 0.8); 
    rightSign.position.set(playerPosition.x + 5, playerPosition.y, playerPosition.z + 3); // Position right of the player
    
    // rotates the sign so that it faces the player
    const rightDx = playerPosition.x - rightSign.position.x;
    const rightDz = playerPosition.z - rightSign.position.z;
    rightSign.rotation.y = Math.atan2(rightDx, rightDz);
    
    castShadow(rightSign);
    scene.add(rightSign);
  } catch {
  }
}
