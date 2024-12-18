import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';


const scene = new THREE.Scene();

const renderer = new THREE.WebGLRenderer({
  canvas: document.querySelector('#canvas'),
});

renderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(renderer.domElement);

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(0, 20, 0);

const controls = new OrbitControls(camera, renderer.domElement);

const axesHelper = new THREE.AxesHelper(5);
scene.add(axesHelper);

const planeGeometry = new THREE.PlaneGeometry(30, 30);
const planeMaterial = new THREE.MeshBasicMaterial({ color: 0xFFFFFF, side: THREE.DoubleSide });
const plane = new THREE.Mesh(planeGeometry, planeMaterial);
plane.rotation.x = Math.PI / 2;
scene.add(plane);

const ambientLight = new THREE.AmbientLight(0xFFFFFF, 1);
scene.add(ambientLight);

const initModel = async () => {
  //leonard GLTF
  const loader = new GLTFLoader();
  const leonard = await loader.loadAsync(
    '/resources/leonard/leonard_animated.glb',
  );

  const guy = leonard.scene;
  scene.add(guy);
  leonard.scene.scale.set(1, 1, 1);
  leonard.scene.position.set(0, 0, 0);
}

initModel().then(() => {});

camera.position.z = 5;

// this sets the maximum fps to 60 regardless of the computer refresh rate.
const fps = 60;
const interval = 1000 / fps;
let lastTime = 0;

function animate() {
  requestAnimationFrame(animate);
  const time = Date.now()
  if (time - lastTime >= interval) {
    lastTime = time;
    renderer.render(scene, camera);
  }
}

renderer.setAnimationLoop(animate)