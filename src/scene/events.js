import {
  BoxGeometry,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  PlaneGeometry,
  SRGBColorSpace,
  TextureLoader
} from "three";
import { BASE_PATH } from "@/utils/utils.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import events from "@/public/posts.json";
import { FontLoader } from "three/addons";
import { gameState } from "@/state/state.js";

export const loadEvents = async (scene) => {
  const initialPosition = { x: 15, y: 2, z: -1 };
  const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date));

  const loadFont = (path) =>
    new Promise((resolve, reject) => {
      const loader = new FontLoader();
      loader.load(
        path,
        (font) => resolve(font),
        undefined,
        (error) => reject(error)
      );
    });

  const loadTexture = (path) =>
    new Promise((resolve, reject) => {
      const loader = new TextureLoader();
      loader.load(
        path,
        (texture) => resolve(texture),
        undefined,
        (error) => reject(error)
      );
    });

  for (let i = 0; i < sortedEvents.length; i++) {
    const event = sortedEvents[i];

    try {
      const font = await loadFont(`${BASE_PATH}Roboto_Regular.json`);
      const geometry = new TextGeometry(event.title, { font, size: 0.25, depth: 0.01 });
      geometry.computeBoundingBox();

      const textWidth = geometry.boundingBox.max.x - geometry.boundingBox.min.x;
      const textHeight = geometry.boundingBox.max.y - geometry.boundingBox.min.y;

      const padding = 0.4; 
      const overallWidth = Math.max(textWidth, 4) + padding;
      const overallHeight = textHeight + 3.2 + padding;

      const bgGeometry = new PlaneGeometry(overallWidth, overallHeight);
      const bgMaterial = new MeshBasicMaterial({ color: 0x000000 });
      const background = new Mesh(bgGeometry, bgMaterial);
      background.position.set(initialPosition.x - 0.5, initialPosition.y + 1, initialPosition.z + (-5 * i) - 0.05);

      const textMaterial = new MeshBasicMaterial({ color: 0xffffff });
      const text = new Mesh(geometry, textMaterial);

      text.position.set(
        background.position.x - textWidth / 2, 
        background.position.y + overallHeight / 2 - textHeight / 2 - 0.2, 
        background.position.z + 0.01 
      );

      const texture = await loadTexture(`${BASE_PATH}images/${event.image}`);
      texture.colorSpace = SRGBColorSpace;
      texture.minFilter = LinearFilter;

      const imageGeometry = new BoxGeometry(4, 3, 0.01);
      const imageMaterial = new MeshStandardMaterial({ map: texture });
      const image = new Mesh(imageGeometry, imageMaterial);
      image.position.set(
        background.position.x,
        background.position.y - overallHeight / 2 + 1.6,
        background.position.z + 0.02
      );

      scene.add(background);
      scene.add(text);
      scene.add(image);
      gameState.interactive.add(image);

      image.userData = { event };
      image.addEventListener("click", () => {
        document.getElementById("popup-content").innerHTML = `
          <div id="popup-info">
            <img width="480px" src="${BASE_PATH}images/${event.image}" alt="${event.title}" />
            <p>${event.description}</p>
          </div>
        `;
        document.getElementById("popup-title").innerText = event.title;
        document.getElementById("popup-close").addEventListener("click", () => {
          document.getElementById("popup").classList.add("hidden");
        });
        document.getElementById("popup").classList.remove("hidden");
      });
    } catch (error) {
      console.error(`Error loading resources for event "${event.title}":`, error);
    }
  }
};
