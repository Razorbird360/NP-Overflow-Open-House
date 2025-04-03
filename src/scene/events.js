import {
  BoxGeometry,
  CylinderGeometry,
  Group,
  LinearFilter,
  Mesh,
  MeshStandardMaterial,
  SRGBColorSpace,
  TextureLoader,
  FrontSide
} from "three";
import { BASE_PATH } from "@/utils/utils.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import events from "@/public/posts.json";
import { FontLoader } from "three/addons";
import { gameState } from "@/state/state.js";
import { castShadow } from '@/scene/scene.js';

export const loadEvents = async (scene) => {
  const initialPosition = { x: 15, y: 0, z: -1 };
  const spacingZ = -5;
  const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date));

  const loadFont = (path) =>
    new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load(path, resolve, undefined, reject);
    });

  const loadTexture = (path) =>
    new Promise((resolve, reject) => {
      const loader = new TextureLoader();
      loader.load(path, resolve, undefined, reject);
    });

  const standHeight = 1.5;
  const standRadius = 0.05;
  const baseHeight = 0.1;
  const baseRadius = 0.3;
  const standMaterial = new MeshStandardMaterial({ color: 0x654321, roughness: 0.8, metalness: 0.2 });

  const backgroundDepth = 0.1;
  const backgroundMaterial = new MeshStandardMaterial({ color: 0x222222, roughness: 0.9 });

  const textMaterial = new MeshStandardMaterial({ color: 0xffffff, roughness: 0.8 });

  const imageWidth = 4;
  const imageHeight = 3;
  const imageDepth = 0.05;
  const imageBackingMaterial = new MeshStandardMaterial({ color: 0x333333 });

  try {
    const font = await loadFont(`${BASE_PATH}Roboto_Regular.json`);

    for (let i = 0; i < sortedEvents.length; i++) {
      const event = sortedEvents[i];
      const eventGroup = new Group();

      const postGeo = new CylinderGeometry(standRadius, standRadius, standHeight, 16);
      const postMesh = new Mesh(postGeo, standMaterial);
      postMesh.position.y = standHeight / 2 + baseHeight;

      const baseGeo = new CylinderGeometry(baseRadius, baseRadius, baseHeight, 16);
      const baseMesh = new Mesh(baseGeo, standMaterial);
      baseMesh.position.y = baseHeight / 2;

      eventGroup.add(postMesh);
      eventGroup.add(baseMesh);

      const textGeo = new TextGeometry(event.title, { font, size: 0.25, depth: 0.01 });
      textGeo.computeBoundingBox();
      const textWidth = textGeo.boundingBox.max.x - textGeo.boundingBox.min.x;
      const textHeight = textGeo.boundingBox.max.y - textGeo.boundingBox.min.y;

      const padding = 0.4;
      const overallWidth = Math.max(textWidth, imageWidth) + padding;
      const spaceBetweenTextAndImage = 0.2;
      const overallHeight = textHeight + imageHeight + spaceBetweenTextAndImage + padding * 2;

      const bgGeometry = new BoxGeometry(overallWidth, overallHeight, backgroundDepth);
      const backgroundMesh = new Mesh(bgGeometry, backgroundMaterial);
      backgroundMesh.position.y = standHeight + baseHeight + overallHeight / 2;
      backgroundMesh.position.z = 0;
      eventGroup.add(backgroundMesh);

      const textMesh = new Mesh(textGeo, textMaterial);
      textMesh.position.x = -textWidth / 2;
      textMesh.position.y = backgroundMesh.position.y + overallHeight / 2 - textHeight - padding;
      textMesh.position.z = backgroundDepth / 2 + 0.01;
      eventGroup.add(textMesh);

      const texture = await loadTexture(`${BASE_PATH}images/${event.image}`);
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;
      texture.magFilter = LinearFilter;

      const imageMaterialWithTexture = new MeshStandardMaterial({ map: texture, side: FrontSide });

      const imageMaterials = [
        imageBackingMaterial,
        imageBackingMaterial,
        imageBackingMaterial,
        imageBackingMaterial,
        imageMaterialWithTexture,
        imageBackingMaterial,
      ];

      const imageGeometry = new BoxGeometry(imageWidth, imageHeight, imageDepth);
      const imageMesh = new Mesh(imageGeometry, imageMaterials);

      imageMesh.position.x = 0;
      imageMesh.position.y = backgroundMesh.position.y - overallHeight / 2 + imageHeight / 2 + padding;
      imageMesh.position.z = backgroundDepth / 2 + 0.01;

      eventGroup.add(imageMesh);

      eventGroup.position.set(
        initialPosition.x,
        initialPosition.y,
        initialPosition.z + i * spacingZ
      );
      scene.add(eventGroup);
      castShadow(eventGroup);

      imageMesh.userData = { event };
      gameState.interactive.add(imageMesh);

      imageMesh.addEventListener("click", () => {
        document.getElementById("popup-content").innerHTML = `
          <div id="popup-info">
            <img width="480px" src="${BASE_PATH}images/${event.image}" alt="${event.title}" />
            <p>${event.description}</p>
          </div>
        `;
        document.getElementById("popup-title").innerText = event.title;
        const popup = document.getElementById("popup");
        const closeButton = document.getElementById("popup-close");

        const newCloseButton = closeButton.cloneNode(true);
        closeButton.parentNode.replaceChild(newCloseButton, closeButton);

        newCloseButton.addEventListener("click", () => {
          popup.classList.add("hidden");
        }, { once: true });

        popup.classList.remove("hidden");
      });

    }
  } catch (error) {
    console.error(`Error loading event resources:`, error);
  }
};