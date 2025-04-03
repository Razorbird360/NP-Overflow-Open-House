import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { gameState } from '@/state/state.js';
import {BASE_PATH} from "@/utils/utils.js";

export function face(direction) {
  if (gameState.facing === direction) {
    return;
  }

  let rotateto = 0;
  switch (direction) {
    case 'back': rotateto = 0; break;
    case 'front': rotateto = Math.PI; break;
    case 'right': rotateto = Math.PI / 2; break;
    case 'left': rotateto = -Math.PI / 2; break;
  }

  const rot = gameState.character.rotation.y;
  const pi = Math.PI;
  let difference = rotateto - rot;

  if (difference > Math.PI) {
    difference -= 2 * Math.PI;
  } else if (difference <= -Math.PI) {
    difference += 2 * Math.PI;
  }

  if (difference > 0) {
    gameState.character.rotation.y += 0.09;
  } else {
    gameState.character.rotation.y -= 0.09;
  }

  // Update facing based on rotation ranges
  const rotationRanges = [
    {
      range: rot => (rot > -0.1 && rot < 0.1) ||
        (rot > 2 * pi - 0.1 && rot < 2 * pi + 0.1) ||
        (rot > -(2 * pi) - 0.1 && rot < -(2 * pi) + 0.1),
      facing: 'back',
      defaultRotation: 0
    },
    {
      range: rot => (rot > pi - 0.1 && rot < pi + 0.1) ||
        (rot > 3 * pi - 0.1 && rot < 3 * pi + 0.1) ||
        (rot > -pi - 0.1 && rot < -pi + 0.1),
      facing: 'front',
      defaultRotation: Math.PI
    },
    {
      range: rot => (rot > pi / 2 - 0.1 && rot < pi / 2 + 0.1) ||
        (rot > 5 * pi / 2 - 0.1 && rot < 5 * pi / 2 + 0.1) ||
        (rot > -(3 * pi) / 2 - 0.1 && rot < -(3 * pi) / 2 + 0.1),
      facing: 'right',
      defaultRotation: pi / 2
    },
    {
      range: rot => (rot > -pi / 2 - 0.1 && rot < -pi / 2 + 0.1) ||
        (rot > 3 * pi / 2 - 0.1 && rot < 3 * pi / 2 + 0.1) ||
        (rot > -5 * pi / 2 - 0.1 && rot < -5 * pi / 2 + 0.1),
      facing: 'left',
      defaultRotation: -pi / 2
    }
  ];

  for (const { range, facing, defaultRotation } of rotationRanges) {
    if (range(rot)) {
      gameState.facing = facing;
      if (!range(rot)) {
        gameState.character.rotation.y = defaultRotation;
      }
      break;
    }
  }
}

export function playAnimation(event) {
  if (!gameState.mixer) return;

  const animationMap = {
    idle: gameState.animations.idle,
    walk: gameState.animations.walk,
    run: gameState.animations.run
  };

  const targetAction = animationMap[event];
  if (!targetAction || gameState.currentAction === targetAction) return;

  targetAction.reset();
  targetAction.setEffectiveTimeScale(1.0);
  targetAction.setEffectiveWeight(1.0);
  targetAction.clampWhenFinished = true;

  if (gameState.currentAction) {
    targetAction.crossFadeFrom(gameState.currentAction, 0.5, true);
  }

  targetAction.play();
  gameState.currentAction = targetAction;
}

export function move(speed, deltaTime) {
  const direction = new THREE.Vector3(
    Math.sin(gameState.character.rotation.y),
    0,
    Math.cos(gameState.character.rotation.y)
  );

  direction.normalize();

  gameState.characterBody.velocity.set(
    direction.x * speed * deltaTime,
    gameState.characterBody.velocity.y,
    direction.z * speed * deltaTime
  );
}


function handleRunningSound() {
  if (gameState.sounds.walking.isPlaying) gameState.sounds.walking.stop();
  if (!gameState.sounds.running.isPlaying) gameState.sounds.running.play();
}

function handleWalkingSound() {
  if (gameState.sounds.running.isPlaying) gameState.sounds.running.stop();
  if (!gameState.sounds.walking.isPlaying) gameState.sounds.walking.play();
}

function stopMovementSounds() {
  if (gameState.sounds.walking.isPlaying) gameState.sounds.walking.stop();
  if (gameState.sounds.running.isPlaying) gameState.sounds.running.stop();
}

export function characterMovement(deltaTime) {
  const walkingSpeed = 150;
  const runningSpeed = 300;
  const backwardSpeed = 75;
  const turnSpeed = 3;

  if (gameState.keys.space) {
    if (gameState.currentAction !== gameState.animations.dance) {
      gameState.dancing = true;
      playAnimation("dance");
      if (gameState.sounds.dance) {
        fadeInDance(gameState.sounds.dance, 0.2, 500); // 0.5 sec to fade in
      }
    }
    stopMovementSounds();
    gameState.characterBody.velocity.x = 0;
    gameState.characterBody.velocity.z = 0;
    return;
  } else {
    if (gameState.sounds.dance && gameState.sounds.dance.isPlaying) {
      fadeOutDance(gameState.sounds.dance, 1000); // 1 sec to fade out
    }
    gameState.dancing = false;
  }

  if (!gameState.dancing) {
    if (gameState.keys.a) gameState.character.rotation.y += turnSpeed * deltaTime;
    if (gameState.keys.d) gameState.character.rotation.y -= turnSpeed * deltaTime;
  }

  if (gameState.keys.shift && gameState.keys.w) {
    move(runningSpeed, deltaTime);
    playAnimation("run");
    handleRunningSound();
  } else if (gameState.keys.w) {
    move(walkingSpeed, deltaTime);
    playAnimation("walk");
    handleWalkingSound();
  } else if (gameState.keys.s) {
    move(-backwardSpeed, deltaTime);
    playAnimation("bwalk");
    handleWalkingSound();
  } else if (gameState.keys.a || gameState.keys.d) {
    if (gameState.currentAction !== gameState.animations.walk) {
      playAnimation("walk");
    }
    // A minimal movement when only turning.
    move(0.1, deltaTime);
  } else {
    playAnimation("idle");
    stopMovementSounds();
    gameState.characterBody.velocity.x = 0;
    gameState.characterBody.velocity.z = 0;
  }
}


export async function initCharacter(scene) {
  const gltfloader = new GLTFLoader();
  const leonard = await gltfloader.loadAsync(`${BASE_PATH}leonard/leonard_animated.glb`);

  gameState.character = leonard.scene;
  scene.add(gameState.character);
  gameState.character.scale.set(1, 1, 1);
  gameState.character.position.set(0, 0, 0);

  gameState.mixer = new THREE.AnimationMixer(gameState.character);
  const clips = leonard.animations;

  const animationNames = ['idle', 'run', 'turnleft', 'turnright', 'walk'];
  animationNames.forEach(name => {
    gameState.animations[name] = gameState.mixer.clipAction(
      THREE.AnimationClip.findByName(clips, name)
    );
  });

  gameState.currentAction = gameState.animations.idle;
  gameState.animations.idle.play();
}

export function isMoving() {
  const velocity = gameState.characterBody.velocity;
  const moving = 
    Math.abs(velocity.x) > 0.02 ||
    Math.abs(velocity.y) > 0.02 ||
    Math.abs(velocity.z) > 0.02;
  return moving;
}
