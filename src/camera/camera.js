import { gameState } from '@/state/state.js';
import * as THREE from 'three';
export function updateCamera(camera, controls, characterBody, isMoving) {
    // console.log(gameState.keys.t);
    switch (gameState.keys.t) {
        case 1:
            if (!isMoving) {
                controls.enabled = true;
            } else {

                thirdPerson(camera, controls, characterBody);
            }
            break;
        case 2:
            freeMoving(camera, controls, characterBody);
            break;
        case 3:
            firstPerson(camera, controls, characterBody);
            break;
    }
}
function thirdPerson(camera, controls, characterBody) {
    controls.enabled = false;
    let { x, y, z } = characterBody.position;
    camera.position.set(x, y + 6, z + 7);
    controls.target.set(x, y, z);
    camera.updateMatrixWorld();
    controls.update();
}

function freeMoving(camera, controls, characterBody) {
    controls.enabled = true;
    camera.updateMatrixWorld();
    controls.update();
}


function firstPerson(camera, controls, characterBody) {
    controls.enabled = true;
    let { x, y, z } = characterBody.position;
    camera.position.set(x , y + 1, z);
    const direction = new THREE.Vector3(
        Math.sin(gameState.character.rotation.y),
        0,
        Math.cos(gameState.character.rotation.y)
    );
    const cameraOffset = 5; 
    const targetX = x + direction.x * cameraOffset;
    const targetZ = z + direction.z * cameraOffset;
    const targetY = y + 1
    controls.target.set(targetX, targetY, targetZ);
    camera.updateMatrixWorld();
    controls.update();
}





