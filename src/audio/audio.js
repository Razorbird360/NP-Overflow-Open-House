import * as THREE from 'three';
import { gameState } from '/src/state/state.js';

export async function initAudio(listener) {
  const audioLoader = new THREE.AudioLoader();

  // Initialize walking sound
  gameState.sounds.walking = new THREE.Audio(listener);
  const walkBuffer = await audioLoader.loadAsync('/resources/Sounds/walkingSound.mp3');
  gameState.sounds.walking.setBuffer(walkBuffer);
  gameState.sounds.walking.setLoop(true);
  gameState.sounds.walking.setVolume(0.1);

  // Initialize running sound
  gameState.sounds.running = new THREE.Audio(listener);
  const runBuffer = await audioLoader.loadAsync('/resources/Sounds/runningSound.mp3');
  gameState.sounds.running.setBuffer(runBuffer);
  gameState.sounds.running.setLoop(true);
  gameState.sounds.running.setVolume(2);
}