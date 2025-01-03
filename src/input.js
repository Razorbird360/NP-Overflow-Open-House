// input.js
import { gameState } from './state/state.js';

export function setupInputHandlers() {
  window.addEventListener('keydown', onKeyDown);
  window.addEventListener('keyup', onKeyUp);
  window.addEventListener('resize', onWindowResize);
}

function onKeyDown(event) {
  if (!gameState.character || !gameState.mixer) return;

  const keyActions = {
    w: () => { gameState.keys.w = true; },
    a: () => { gameState.keys.a = true; },
    s: () => { gameState.keys.s = true; },
    d: () => { gameState.keys.d = true; },
    shift: () => { gameState.keys.shift = true; }
  };

  const action = keyActions[event.key.toLowerCase()];
  if (action) action();
}

function onKeyUp(event) {
  if (!gameState.character || !gameState.mixer) return;

  const keyActions = {
    w: () => gameState.keys.w = false,
    a: () => gameState.keys.a = false,
    s: () => gameState.keys.s = false,
    d: () => gameState.keys.d = false,
    shift: () => gameState.keys.shift = false
  };

  const action = keyActions[event.key.toLowerCase()];
  if (action) action();
}

function onWindowResize() {
  const camera = gameState.camera;
  const renderer = gameState.renderer;

  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}