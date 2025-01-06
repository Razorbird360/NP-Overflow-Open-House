import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { WebGPURenderer } from "three/webgpu";
import { loadWorldObjects } from "@/scene/objects.js";
import { loadTrees } from "@/scene/trees.js";

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x87CEEB);

  const renderer = new WebGPURenderer({
    canvas: document.querySelector("#canvas"),
    antialias: true,
  });
  renderer.setSize(window.innerWidth, window.innerHeight);
  document.body.appendChild(renderer.domElement);

  const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
  );
  camera.position.set(0, 6, 7);

  const listener = new THREE.AudioListener();
  camera.add(listener);

  const controls = new OrbitControls(camera, renderer.domElement);

  // Add helper axes
  const axesHelper = new THREE.AxesHelper(5);
  // scene.add(axesHelper);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 1);
  scene.add(ambientLight);

  const directionalLight = new THREE.DirectionalLight(0xffffff, 2);
  directionalLight.position.set(100, 100, 70);
  directionalLight.target.position.set(0, 0, 0);
  directionalLight.castShadow = true;

  directionalLight.shadow.mapSize.width = 1024; 
  directionalLight.shadow.mapSize.height = 1024;
  directionalLight.shadow.camera.near = 0.1; 
  directionalLight.shadow.camera.far = 200;
  directionalLight.shadow.camera.left = -50; 
  directionalLight.shadow.camera.right = 50;
  directionalLight.shadow.camera.top = 50;
  directionalLight.shadow.camera.bottom = -50;

  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;

  scene.add(directionalLight);


  // Define player position (replace with dynamic positioning if necessary)
  const playerPosition = { x: 0, y: 0, z: 0 };

  // Load all world objects
  loadWorldObjects(scene, playerPosition);

  loadTrees(scene);

  return { scene, renderer, camera, listener, controls };
}

export function createGround() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  // Create radial gradient for the ground
  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0, "#5AC45A"); // Inner color
  gradient.addColorStop(0.3, "#228B22"); // Outer color

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Create ground texture and geometry
  const texture = new THREE.CanvasTexture(canvas);
  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshStandardMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(planeGeometry, planeMaterial);
  ground.receiveShadow = true;


  // Rotate ground to be flat
  ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

  return ground;
}

export function resize(renderer, camera) {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}

export function castShadow(object) {
  object.traverse((child) => {
    if (child instanceof THREE.Mesh) {
      child.castShadow = true;
      child.receiveShadow = true;
    }
  });
}


