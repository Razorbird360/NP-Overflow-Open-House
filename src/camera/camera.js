// camera.js
import * as THREE from 'three';

export function updateCamera(camera, controls, characterBody) {
    controls.enabled = false;
    let { x, y, z } = characterBody.position;
    camera.position.set(x, y + 6, z + 7);
    controls.target.set(x, y, z);
    camera.updateMatrixWorld();
    controls.update();
}
