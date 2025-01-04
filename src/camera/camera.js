import { gameState } from '@/state/state.js';
import * as THREE from 'three';
export function updateCamera(camera, controls, characterBody, isMoving) {
    console.log(gameState.keys.t);
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

function firstPerson(camera, controls) {
    controls.enabled = false;
    const { x, y, z } = gameState.character.position;
    camera.position.set(x, y + 3, z);
    const quaternion = new THREE.Quaternion();
    quaternion.setFromEuler(new THREE.Euler(0, gameState.character.rotation.y, 0));
    const direction = new THREE.Vector3(0, 0, 1).applyQuaternion(quaternion);
    const targetPosition = new THREE.Vector3( x + direction.x * 5, y + 3, z + direction.z * 5 );
    camera.lookAt(targetPosition);
    camera.updateMatrixWorld();
    controls.update();
}

