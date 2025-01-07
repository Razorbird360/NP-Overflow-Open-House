import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { OBJLoader } from 'three/examples/jsm/loaders/OBJLoader.js';
import { MTLLoader } from 'three/examples/jsm/loaders/MTLLoader.js';
import { gameState } from '@/state/state.js';
import { BASE_PATH } from "@/utils/utils.js";
import { castShadow } from '@/scene/scene.js';
import { changeModelColor } from '@/scene/objects.js';
import * as CANNON from 'cannon-es';



const fbxloader = new FBXLoader();
const gltfloader = new GLTFLoader();
const objloader = new OBJLoader();
const mtlloader = new MTLLoader();

export async function loadSoccer(scene) {
    await loadFence();
    dupFence(scene);
    await loadSoccerBall(scene);
    await loadDice(scene);
}

async function loadFence() {

    const fenceModel = await fbxloader.loadAsync(
        `${BASE_PATH}world_objects/soccer/fence.fbx`
    );
    gameState.objects.fence = fenceModel.scene || fenceModel;
    changeModelColor(gameState.objects.fence, 0x964B00);
    gameState.objects.fence.position.set(-10, 0, 0);
    gameState.objects.fence.scale.set(0.01, 0.01, 0.01);
}

function dupFence(scene) {
    if (!gameState.objects.fence) {
        return;
    }
    const fenceCount = 5;
    const spacing = 3;

    for (let i = 0; i < fenceCount; i++) {
        const fenceClone = gameState.objects.fence.clone();
        fenceClone.position.set(-i * spacing -10, 0, -3);
        castShadow(fenceClone);
        scene.add(fenceClone);
    }
    for (let i = 0; i < fenceCount; i++) {
        const fenceClone = gameState.objects.fence.clone();
        fenceClone.position.set(-i * spacing -10, 0, 3);
        castShadow(fenceClone);
        scene.add(fenceClone);
    }
}

async function loadSoccerBall(scene) {
    if (gameState.soccerBall) {
        return;
    }
    mtlloader.load(
      `${BASE_PATH}world_objects/soccer/soccerBall.mtl`,
      function (materials) {
        materials.preload();
        objloader.setMaterials(materials);
        objloader.load(
          `${BASE_PATH}world_objects/soccer/soccerBall.obj`,
          function (soccerBall) {
            gameState.soccerBall = soccerBall;
            gameState.soccerBall.position.set(0, -1000, 0);
            castShadow(gameState.soccerBall);
            scene.add(gameState.soccerBall);
          }
        );
      }
    );
}

async function loadDice(scene) {
    const diceModel1 = await gltfloader.loadAsync(
        `${BASE_PATH}world_objects/dice1.glb`
    );
    const diceModel2 = await gltfloader.loadAsync(
        `${BASE_PATH}world_objects/dice2.glb`
    );
    const diceModel3 = await gltfloader.loadAsync(
        `${BASE_PATH}world_objects/dice3.glb`
    );
  gameState.dice1 = diceModel1.scene || diceModel1;
  gameState.dice2 = diceModel2.scene || diceModel2;
  gameState.dice3 = diceModel3.scene || diceModel3;
  gameState.dice1.position.set(-5, -1000, 0);
  gameState.dice2.position.set(0, -1000, 0);
  gameState.dice3.position.set(5, -1000, 0);
  gameState.dice1.scale.set(0.85, 0.85, 0.85);
  gameState.dice2.scale.set(0.85, 0.85, 0.85);
  gameState.dice3.scale.set(0.85, 0.85, 0.85);
  castShadow(gameState.dice1);
  castShadow(gameState.dice2);
  castShadow(gameState.dice3);
  scene.add(gameState.dice1);
  scene.add(gameState.dice2);
  scene.add(gameState.dice3);
}