import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
// import { finite_state_machine } from './classes';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 7);

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 3);
scene.add(ambientLight);


//load leonard GLB file and define animations
let mixer;
let leonard, character;
let animations = {};
const initModel = async () => {
  //leonard GLTF model contains scene and animations
  const loader = new GLTFLoader();
  leonard = await loader.loadAsync(
    '/resources/leonard/leonard_animated.glb',
  );

  character = leonard.scene;
  scene.add(character);
  character.scale.set(1, 1, 1);
  character.position.set(0, 0, 0);

  mixer = new THREE.AnimationMixer(character);
  const clips = leonard.animations;

  const idle = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'idle'));
  const run = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'run'));
  const turnleft = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'turnleft'));
  const turnright = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'turnright'));
  const walk = mixer.clipAction(THREE.AnimationClip.findByName(clips, 'walk'));

  animations['idle'] = idle;
  animations['run'] = run;
  animations['turnleft'] = turnleft;
  animations['turnright'] = turnright;
  animations['walk'] = walk;
  animations.idle.play();
}

initModel().then(() => {});


let facing = 'back';

function face(direction) {
  if (facing === direction) {
    return;
  }

  let rotateto = 0;

  //target rotation
  switch (direction) {
    case 'back':
      rotateto = 0;
      break;
    case 'front':
      rotateto = Math.PI;
      break;
    case 'right':
      rotateto = Math.PI / 2;
      break;
    case 'left':
      rotateto = -Math.PI / 2;
      break;
  }

  const rot = character.rotation.y;
  const pi = Math.PI;

  //difference between current rotation rot and rotateto
  let difference = rotateto - rot;

  //ensures difference is between -pi and pi
  //when difference > pi, character should rotate to the left, opposite is true for difference < pi
  //subtract 2pi from difference to flip the direction of rotation
  if (difference > Math.PI) {
    difference -= 2 * Math.PI;
  } else if (difference <= -Math.PI) {
    difference += 2 * Math.PI;
  }

  //find which direction to rotate to based on the difference 
  if (difference > 0) {
    character.rotation.y += 0.09;
  } else {
    character.rotation.y -= 0.09;
  }

  //checks for 3 ranges of rotation to ensure character rotation does not go out of bounds
  if (
    (rot > -0.1 && rot < 0.1) ||
    (rot > 2 * pi - 0.1 && rot < 2 * pi + 0.1) ||
    (rot > -(2 * pi) - 0.1 && rot < -(2 * pi) + 0.1)
  ) {
    facing = 'back';
    if (!(rot > -0.1 && rot < 0.1)) { //if character rotation is not in the middle range it will be defaulted to the middle range
      character.rotation.y = 0;
    }
  } else if (
    (rot > pi - 0.1 && rot < pi + 0.1) ||
    (rot > 3 * pi - 0.1 && rot < 3 * pi + 0.1) ||
    (rot > -pi - 0.1 && rot < -pi + 0.1)
  ) {
    facing = 'front';
    if (!(rot > pi - 0.1 && rot < pi + 0.1)) {
      character.rotation.y = Math.PI;
    }
  } else if (
    (rot > pi / 2 - 0.1 && rot < pi / 2 + 0.1) ||
    (rot > 5 * pi / 2 - 0.1 && rot < 5 * pi / 2 + 0.1) ||
    (rot > -(3 * pi) / 2 - 0.1 && rot < -(3 * pi) / 2 + 0.1)
  ) {
    facing = 'right';
    if (!(rot > pi / 2 - 0.1 && rot < pi / 2 + 0.1)) {
      character.rotation.y = pi / 2;
    }
  } else if (
    (rot > -pi / 2 - 0.1 && rot < -pi / 2 + 0.1) ||
    (rot > 3 * pi / 2 - 0.1 && rot < 3 * pi / 2 + 0.1) ||
    (rot > -5 * pi / 2 - 0.1 && rot < -5 * pi / 2 + 0.1)
  ) {
    facing = 'left';
    if (!(rot > -pi / 2 - 0.1 && rot < -pi / 2 + 0.1)) {
      character.rotation.y = -pi / 2;
    }
  }
  
  console.log(facing, character.rotation.y);
}



//https://threejs.org/docs/#api/en/animation/AnimationAction.stop

//animates character based on requested action
//first sets the animation frame to 0, timescale (speed of animation) and weight (how much animation affects the character) to 1
//then crossfades from the previous animation before updating previous animation
let currentaction = animations.idle;
let prevaction = null;
function playanimation(event) {
  //code to display current action, uncomment for debugging
  // const currentActionKey = Object.keys(animations).find(key => animations[key] === currentaction);
  // console.log(currentActionKey);

  if (!mixer) {
    return;
  }

  switch (event) {
    case 'idle':
      if (currentaction === animations.idle) {
        return;
      }
      currentaction = animations.idle;

      currentaction.time = 0.0;
      currentaction.setEffectiveTimeScale(1.0);
      currentaction.setEffectiveWeight(1.0);
      currentaction.play();
      currentaction.clampWhenFinished = true;
      
      if (prevaction && prevaction !== currentaction) {
        prevaction.time = currentaction.time;
        currentaction.crossFadeFrom(prevaction, 0.5, true);
      }
      prevaction = currentaction;
      break;

    case 'walk':
      if (currentaction === animations.walk) {
        return;
      }
      currentaction = animations.walk;

      currentaction.time = 0.0;
      currentaction.setEffectiveTimeScale(1.0);
      currentaction.setEffectiveWeight(1.0);
      currentaction.play();
      currentaction.clampWhenFinished = true;

      if (prevaction && prevaction !== currentaction) {
        prevaction.time = currentaction.time;
        currentaction.crossFadeFrom(prevaction, 0.5, true);
      }
      prevaction = currentaction;
      break;
    
    case 'run':
      if (currentaction === animations.run) {
        return;
      }
      currentaction = animations.run;

      currentaction.time = 0.0;
      currentaction.setEffectiveTimeScale(1.0);
      currentaction.setEffectiveWeight(1.0);
      currentaction.play();
      currentaction.clampWhenFinished = true;

      if (prevaction && prevaction !== currentaction) {
        prevaction.time = currentaction.time;
        currentaction.crossFadeFrom(prevaction, 0.5, true);
      }
      prevaction = currentaction;
      break;
  }

  
}


let moving = false;
const keys = {
  w: false,
  a: false,
  s: false,
  d: false,
  shift: false,
}

//updates the keys object based on the key pressed
function onkeydown(event) {
  if (!character) {
    return;
  }
  else if (!mixer) {
    return;
  }

  switch (event.key.toLowerCase()) {
    case 'w':
      keys.w = true;
      face('front');
      break;

    case 'a':
      keys.a = true;
      face('left');
      break;

    case 's':
      keys.s = true;
      face('back');
      break;
    
    case 'd':
      keys.d = true;
      face('right');
      break;

    case 'shift':
      keys.shift = true;
      break;
  }

}

//updates the keys object based on the key released
function onkeyup(event) {
  if (!character) {
    return;
  }
  else if (!mixer) {
    return;
  }

  // mixer.stopAllAction();

  switch (event.key.toLowerCase()) {
    case 'w':
      keys.w = false;
      break;
    
    case 'a':
      keys.a = false;
      break;
    
    case 's':
      keys.s = false;
      break;

    case 'd':
      keys.d = false;
      break;

    case 'shift':
      keys.shift = false;
      break;
  }

}

//calls the playanimation function based on the keys pressed
function character_movement() {
  if (keys.shift) {
    playanimation("run");
    return
  } 
  if (keys.w || keys.a || keys.s || keys.d) {
    playanimation("walk");
    return;
  } 
  playanimation("idle");
}


window.addEventListener('keydown', onkeydown);
window.addEventListener('keyup', onkeyup);



// this sets the maximum fps to 60 regardless of the computer refresh rate.
const fps = 60;
const interval = 1000 / fps;
let lastTime = 0;

//clock indicates what time it is in the animation loop, similar to the blue indicator on blender
const clock = new THREE.Clock();
function animate() {
  requestAnimationFrame(animate);
  const time = Date.now()
  if (time - lastTime >= interval) {
    lastTime = time;
    renderer.render(scene, camera);
  }

  if (mixer) {
    //takes data from clock to display the correct animation frame
    mixer.update(clock.getDelta());
  }

  character_movement();

}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})