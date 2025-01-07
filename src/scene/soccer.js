import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { gameState } from '@/state/state.js';
import { BASE_PATH } from "@/utils/utils.js";
import { castShadow } from '@/scene/scene.js';
import { changeModelColor } from '@/scene/objects.js';


const fbxloader = new FBXLoader();
const gltfloader = new GLTFLoader();

export async function loadSoccer(scene) {
    await loadFence();
    dupFence(scene);

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
