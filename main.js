import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';

const scene = new THREE.Scene();
scene.background = new THREE.Color(0x808080);


const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
});
renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 6, 7);

const listener = new THREE.AudioListener();
camera.add(listener);

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 3);
scene.add(ambientLight);


//https://threejs.org/docs/#api/en/constants/Textures
const canvas = document.createElement('canvas');
canvas.width = 1024;
canvas.height = 1024; //canvas width and height define the resolution of the texture not the actual size of it as defined in planegeometry
//gets the 2d rendering context of the canvas to draw on it
const ctx = canvas.getContext('2d');

//first 2 parameters are the x and y coordinates of the starting circle, 3rd parameter (0) is the radius of the starting circle and 4th parameter is the x coordinate of the ending circle
const gradient = ctx.createRadialGradient(
  canvas.width / 2, canvas.height / 2, 0, canvas.width / 2, canvas.height / 2, canvas.width / 2
);
gradient.addColorStop(0, '#5AC45A');
gradient.addColorStop(0.3, '#228B22');

//apply the gradient to the canvas and create texture
ctx.fillStyle = gradient;
ctx.fillRect(0, 0, canvas.width, canvas.height); //fills the canvas with the gradient completely
const texture = new THREE.CanvasTexture(canvas);

const planeGeometry = new THREE.PlaneGeometry(100, 100);
const planeMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide
});
const ground = new THREE.Mesh(planeGeometry, planeMaterial);
ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);
scene.add(ground);






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
  // const euler = new THREE.Euler();
  // let rot = euler.setFromQuaternion(characterBody.quaternion).y;


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

  // if (difference > 0) {
  //   angle += 0.09;
  // } else if (difference < 0) {
  //   angle -= 0.09;
  // }
  // characterBody.quaternion.setFromEuler(0, angle, 0);
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
      // characterBody.quaternion.setFromEuler(0, 0, 0);
      character.rotation.y = 0;
    }
  } else if (
    (rot > pi - 0.1 && rot < pi + 0.1) ||
    (rot > 3 * pi - 0.1 && rot < 3 * pi + 0.1) ||
    (rot > -pi - 0.1 && rot < -pi + 0.1)
  ) {
    facing = 'front';
    if (!(rot > pi - 0.1 && rot < pi + 0.1)) {
      // characterBody.quaternion.setFromEuler(0, Math.PI, 0);
      character.rotation.y = Math.PI;
    }
  } else if (
    (rot > pi / 2 - 0.1 && rot < pi / 2 + 0.1) ||
    (rot > 5 * pi / 2 - 0.1 && rot < 5 * pi / 2 + 0.1) ||
    (rot > -(3 * pi) / 2 - 0.1 && rot < -(3 * pi) / 2 + 0.1)
  ) {
    facing = 'right';
    if (!(rot > pi / 2 - 0.1 && rot < pi / 2 + 0.1)) {
      // characterBody.quaternion.setFromEuler(0, pi / 2, 0);
      character.rotation.y = pi / 2;
    }
  } else if (
    (rot > -pi / 2 - 0.1 && rot < -pi / 2 + 0.1) ||
    (rot > 3 * pi / 2 - 0.1 && rot < 3 * pi / 2 + 0.1) || 
    (rot > -5 * pi / 2 - 0.1 && rot < -5 * pi / 2 + 0.1)
  ) {
    facing = 'left';
    if (!(rot > -pi / 2 - 0.1 && rot < -pi / 2 + 0.1)) {
      // characterBody.quaternion.setFromEuler(0, -pi / 2, 0);
      character.rotation.y = -pi / 2;
    }
  }
  
  console.log(characterBody.position);
}





//https://threejs.org/docs/#api/en/animation/AnimationAction.stop

//animates character based on requested action
//first sets the animation frame to 0, timescale (speed of animation) and weight (how much animation affects the character) to 1
//then crossfades from the previous animation before updating previous animation
let currentAction = animations.idle;
function playanimation(event) {
  //code to display current action, uncomment for debugging
  // const currentActionKey = Object.keys(animations).find(key => animations[key] === currentAction);
  // console.log(currentActionKey);

  if (!mixer) {
    return;
  }
  let targetAction;

  switch (event) {
    case 'idle':
      targetAction = animations.idle;
      break;
    case 'walk':
      targetAction = animations.walk;
      break;
    case 'run':
      targetAction = animations.run;
      break;
    default:
      return;
  }

  if (currentAction === targetAction) {
    return;
  }

  targetAction.reset();
  targetAction.setEffectiveTimeScale(1.0);
  targetAction.setEffectiveWeight(1.0);
  targetAction.clampWhenFinished = true;

  if (currentAction) {
    targetAction.crossFadeFrom(currentAction, 0.5, true);
  }

  targetAction.play();
  currentAction = targetAction;
}


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

  if (!mixer) {
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

  if (!mixer) {
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



//character movement
//multiply speed and deltatime to ensure character moves at the same speed regardless of refresh rate (deltaTime is the time between current and previous frames)
function move(speed, deltaTime) {
  const direction = new THREE.Vector3(
    Math.sin(character.rotation.y),
    0,
    Math.cos(character.rotation.y)
  );

  direction.normalize();

  characterBody.velocity.set(
    direction.x * speed * deltaTime,
    characterBody.velocity.y,
    direction.z * speed * deltaTime
  );
  // const velocity = direction.normalize().multiplyScalar(speed * deltaTime);
  // characterBody.velocity.set(velocity.x, characterBody.velocity.y, velocity.z);
}





//https://threejs.org/docs/#api/en/audio/Audio
const audioLoader = new THREE.AudioLoader();
const walkingSound = new THREE.Audio(listener);

audioLoader.load('/resources/Sounds/walkingSound.mp3', function(buffer) {
  walkingSound.setBuffer(buffer);
  walkingSound.setLoop(true);
  walkingSound.setVolume(0.1);
});

const runningSound = new THREE.Audio(listener);

audioLoader.load('/resources/Sounds/runningSound.mp3', function(buffer) {
  runningSound.setBuffer(buffer);
  runningSound.setLoop(true);
  runningSound.setVolume(2);
});



//calls the playanimation function based on the keys pressed
function characterMovement(deltaTime) {
  const walkingSpeed = 150;
  const runningSpeed = 300;

  if (keys.shift) {
    move(runningSpeed, deltaTime);
    playanimation("run");
    if (walkingSound.isPlaying) {
      walkingSound.stop();
    }
    if (!runningSound.isPlaying) {
      runningSound.play();
    }
    return;
  } 
  if (keys.w || keys.a || keys.s || keys.d) {
    move(walkingSpeed, deltaTime);
    playanimation("walk");
    if (runningSound.isPlaying) {
      runningSound.stop();
    }
    if (!walkingSound.isPlaying) {
      walkingSound.play();
    }
    return;
  }
  playanimation("idle");
   if (walkingSound.isPlaying || runningSound.isPlaying) {
    walkingSound.stop();
    runningSound.stop();
  }
}


window.addEventListener('keydown', onkeydown);
window.addEventListener('keyup', onkeyup);



//https://stackoverflow.com/questions/68181912/using-physics-with-an-imported-model-in-three-js
const world = new CANNON.World({
  gravity: new CANNON.Vec3(0, -9.81, 0)
});

//physical body of ground
const groundMat = new CANNON.Material();
const groundBody = new CANNON.Body({
  shape: new CANNON.Plane(),
  type: CANNON.Body.STATIC,
  material: groundMat
});
groundBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
world.addBody(groundBody);



//physical body of character
//threejs mesh below is visual representation of the physical body, comment out to show character hitbox
const hitboxGeo = new THREE.CylinderGeometry(0.5, 0.5, 1.8, 16);
const hitboxMat = new THREE.MeshBasicMaterial({ color: 0xFFFF00, wireframe: true });
const hitboxMesh = new THREE.Mesh(hitboxGeo, hitboxMat);
scene.add(hitboxMesh);

//Vec3 represents the dimensions of the body, and should be half of thre threejs dimensions
const characterMat = new CANNON.Material();
const characterBody = new CANNON.Body({
  mass: 1000,
  position: new CANNON.Vec3(0, 0.5, 0),
  shape: new CANNON.Cylinder(0.5, 0.5, 1.8, 16),
  material: characterMat
});
characterBody.linearDamping = 0.9;
characterBody.allowSleep = true;
world.addBody(characterBody);

const characterGroundContact = new CANNON.ContactMaterial(
  groundMat, characterMat,
  {friction: 0}
);
world.addContactMaterial(characterGroundContact);


function clampVelocity(body) {
  if (Math.abs(body.velocity.x) < 0.005) body.velocity.x = 0;
  if (Math.abs(body.velocity.z) < 0.005) body.velocity.z = 0;
  if (Math.abs(body.velocity.y) < 0.005) body.velocity.y = 0;
}


//test ball
// const sphereGeo = new THREE.SphereGeometry(2);
// const sphereMat = new THREE.MeshBasicMaterial({ color: 0xFF0000, wireframe: true });
// const sphereMesh = new THREE.Mesh(sphereGeo, sphereMat);
// scene.add(sphereMesh);
// const sphereBody = new CANNON.Body({
//   mass: 1,
//   shape: new CANNON.Sphere(2),
//   position: new CANNON.Vec3(10, 10, 0),
// });
// world.addBody(sphereBody);


function updatePhysics(deltaTime) {
  ground.position.copy(groundBody.position);
  ground.quaternion.copy(groundBody.quaternion);

  hitboxMesh.position.copy(characterBody.position);
  hitboxMesh.quaternion.copy(characterBody.quaternion);
  
  character.position.copy(characterBody.position);
  character.position.y -= 0.9;
  // character.quaternion.copy(characterBody.quaternion);

  // sphereMesh.position.copy(sphereBody.position);
  // sphereMesh.quaternion.copy(sphereBody.quaternion);
  
  
  //reset angular velocity and quaternion to prevent rotation, clamp velocity to prevent sliding
  characterBody.quaternion.setFromEuler(0, 0, 0);
  characterBody.angularVelocity.set(0, 0, 0);
  clampVelocity(characterBody);
  world.step(1 / 60);
}




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
  const deltaTime = clock.getDelta();
  if (mixer) {
    //takes data from clock to display the correct animation frame
    mixer.update(deltaTime);
  }
  if (character) {
    characterMovement(deltaTime);
    updatePhysics(deltaTime);
  }

}

renderer.setAnimationLoop(animate)

window.addEventListener('resize', function() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
})