import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { gameState } from '@/state/state.js';
import {BASE_PATH} from "@/utils/utils.js";
import {loadEvents} from "@/scene/events.js";
import {loadNotice} from "@/scene/notice.js";

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

  // Load fence
  const fenceModel = await fbxloader.loadAsync(
    `${BASE_PATH}world_objects/fence.fbx`
  );
  gameState.objects.fence = fenceModel.scene ? fenceModel.scene : fenceModel;
  scene.add(gameState.objects.fence);

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

  const workshopsModel = await loadEvents(scene);
  const bulletin = await loadNotice(scene)

  // Configure loaded objects
  changeModelColor(gameState.objects.fence, 0x7d5b4e);
  gameState.objects.fence.position.set(10, 0, 0);
  gameState.objects.fence.scale.set(0.01, 0.01, 0.01);

  gameState.objects.house.position.set(-0.3, 0, -5);
  gameState.objects.house.rotation.y = -Math.PI / 2;
  gameState.objects.house.scale.set(2, 2, 2);

  gameState.objects.golfball.position.set(-20, 0, 0);
  gameState.objects.golfball.scale.set(0.001, 0.001, 0.001);

  gameState.loadedObjects = true;
}
