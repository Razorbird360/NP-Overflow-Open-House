import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { WebGPURenderer } from "three/webgpu";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js"; 

export function createScene() {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color(0x808080);

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

  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  const ambientLight = new THREE.AmbientLight(0xffffff, 3);
  scene.add(ambientLight);

  // golf flag
  loadGolfFlag(scene);

  return { scene, renderer, camera, listener, controls };
}

export function createGround() {
  const canvas = document.createElement("canvas");
  canvas.width = 1024;
  canvas.height = 1024;
  const ctx = canvas.getContext("2d");

  const gradient = ctx.createRadialGradient(
    canvas.width / 2,
    canvas.height / 2,
    0,
    canvas.width / 2,
    canvas.height / 2,
    canvas.width / 2
  );
  gradient.addColorStop(0, "#5AC45A");
  gradient.addColorStop(0.3, "#228B22");

  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, canvas.width, canvas.height);
  const texture = new THREE.CanvasTexture(canvas);

  const planeGeometry = new THREE.PlaneGeometry(100, 100);
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(planeGeometry, planeMaterial);
  ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

  return ground;
}

// loadGolfFlag function to load into the scene
async function loadGolfFlag(scene) {
  const fbxloader = new FBXLoader();
  try {
    const flagModel = await fbxloader.loadAsync(
      `${BASE_PATH}world_objects/golf_flag.fbx` 
    );
    flagModel.scale.set(0.02, 0.02, 0.02); 
    flagModel.position.set(5, 0, -10); 
    scene.add(flagModel);

    console.log("Golf flag loaded successfully!");
  } catch (error) {
    console.error("Error loading golf flag:", error);
  }
}