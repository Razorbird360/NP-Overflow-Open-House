import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { FBXLoader } from 'three/examples/jsm/loaders/FBXLoader.js';
import { gameState } from '@/state/state.js';
import { BASE_PATH } from "@/utils/utils.js";
import * as CANNON from 'cannon-es';
import { castShadow } from '@/scene/scene.js';

const fbxloader = new FBXLoader();
const gltfloader = new GLTFLoader();

export async function loadTrees(scene) {
    const smallTree = await gltfloader.loadAsync(
        `${BASE_PATH}world_objects/smallTree.glb`
    );
    gameState.objects.smallTree = smallTree.scene || smallTree;
    const mediumTree = await gltfloader.loadAsync(
        `${BASE_PATH}world_objects/mediumTree.glb`
    );
    gameState.objects.mediumTree = mediumTree.scene || mediumTree;
    const largeTree = await gltfloader.loadAsync(
        `${BASE_PATH}world_objects/bigTree.glb`
    );
    gameState.objects.largeTree = largeTree.scene || largeTree;


    createTree(-17, 0, -17, 'l', scene);
    createTree(-7, 0, -7, 'm', scene);
    createTree(-17, 0, -6, 's', scene);
    createTree(6, 0, -10, 's', scene);
    createTree(9, 0, 10, 'l', scene);
    createTree(-12, 0, 17, 'm', scene);
    createTree(10, 0, -20, 's', scene);
    createTree(20, 0, 20, 'l', scene);
    createTree(14, 0, 22, 'm', scene);
    createTree(1, 0, 16, 's', scene);
    createTree(25, 0, 0, 'l', scene);
    createTree(27, 0, 7, 'm', scene);
    createTree(22, 0, -9, 'l', scene);
    createTree(-22, 0, 10, 's', scene);
    createTree(1, 0, -20, 'm', scene);
    createTree(-5, 0, 19, 'l', scene);
    createTree(-35, 0, 3, 's', scene);
    createTree(-30, 0, -8, 'm', scene);
    createTree(-32, 0, 18, 'l', scene);
}

function createTree(x, y, z, size, scene) {
    let tree = null;
    let topRadius, bottomRadius, height;
    switch (size) {
        case 's':
            tree = gameState.objects.smallTree.clone();
            topRadius = 1.2;
            bottomRadius = 1.2;
            height = 5;
            break;
        case 'm':
            tree = gameState.objects.mediumTree.clone();
            topRadius = 0.2;
            bottomRadius = 0.2;
            height = 5;
            break;
        case 'l':
            tree = gameState.objects.largeTree.clone();
            topRadius = 1.8;
            bottomRadius = 1.8;
            height = 5;
            break;
    }
    tree.scale.set(0.5, 0.5, 0.5);
    tree.position.set(x, y, z);
    tree.castShadow = true;
    castShadow(tree);
    scene.add(tree);

    const shape = new CANNON.Cylinder(topRadius, bottomRadius, height, 16);
    const treeBody = new CANNON.Body({
        mass: 0,
        shape: shape,
        position: new CANNON.Vec3(x, y + height / 2, z),
    });

    gameState.world.addBody(treeBody);
}

