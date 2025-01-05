import * as THREE from "three";
import { OrbitControls } from "three/examples/jsm/controls/OrbitControls.js";
import { WebGPURenderer } from "three/webgpu";
import { loadWorldObjects } from "@/scene/objects.js";

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

  // Add helper axes
  const axesHelper = new THREE.AxesHelper(5);
  scene.add(axesHelper);

  // Add ambient light
  const ambientLight = new THREE.AmbientLight(0xffffff, 3);
  scene.add(ambientLight);

  // Define player position (replace with dynamic positioning if necessary)
  const playerPosition = { x: 0, y: 0, z: 0 };

  // Load all world objects
  loadWorldObjects(scene, playerPosition);

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
  const planeMaterial = new THREE.MeshBasicMaterial({
    map: texture,
    side: THREE.DoubleSide,
  });
  const ground = new THREE.Mesh(planeGeometry, planeMaterial);

  // Rotate ground to be flat
  ground.rotateOnAxis(new THREE.Vector3(1, 0, 0), Math.PI / 2);

  return ground;
}
