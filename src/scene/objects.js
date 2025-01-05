import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { gameState } from '@/state/state.js';
import {BASE_PATH} from "@/utils/utils.js";
import {loadEvents} from "@/scene/events.js";
import {loadNotice} from "@/scene/notice.js";
import { loadGolf } from "@/scene/golf.js";

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

export async function loadWorldObjects(scene) {
  const fbxloader = new FBXLoader();
  const gltfloader = new GLTFLoader();


  // Load house
  const houseModel = await gltfloader.loadAsync(
    `${BASE_PATH}world_objects/cottage.glb`
  );
  gameState.objects.house = houseModel.scene ? houseModel.scene : houseModel;
  scene.add(gameState.objects.house);

  const golfballModel = await fbxloader.loadAsync(
    `${BASE_PATH}world_objects/golf_ball.fbx`
  );
  gameState.objects.golfball = golfballModel.scene
    ? golfballModel.scene
    : golfballModel;
  scene.add(gameState.objects.golfball);

  // Loading in golf_flag.glb file
  await loadFlag(scene);

  const workshopsModel = await loadEvents(scene);
  const bulletin = await loadNotice(scene);
  const golf = await loadGolf(scene);

  // Configure loaded objects
  changeModelColor(gameState.objects.fence, 0x7d5b4e);

  gameState.objects.house.position.set(-0.3, 0, -5);
  gameState.objects.house.rotation.y = -Math.PI / 2;
  gameState.objects.house.scale.set(2, 2, 2);

  gameState.objects.golfball.position.set(-10, 0, 0);
  gameState.objects.golfball.scale.set(0.001, 0.001, 0.001);

  gameState.loadedObjects = true;
}

// Configuring the function to the golf_flag_pit.glb object
export async function loadFlag(scene) {
  const gltfloader = new GLTFLoader(); // Use GLTFLoader for .glb files
  try {
    const flagModel = await gltfloader.loadAsync(
      `${BASE_PATH}world_objects/golf_flag.glb` // Path to golf_flag.glb file
    );
    gameState.objects.ukFlag = flagModel.scene || flagModel;
    gameState.objects.ukFlag.scale.set(0.2, 0.2, 0.2);
    gameState.objects.ukFlag.position.set(-23, 0, 0); // Flag position
    gameState.objects.ukFlag.rotation.y = Math.PI / 2; // Rotate the flag

    scene.add(gameState.objects.ukFlag);
    console.log("Golf flag loaded successfully!");
  } catch (error) {
    console.error("Error loading golf flag:", error);
  }
}