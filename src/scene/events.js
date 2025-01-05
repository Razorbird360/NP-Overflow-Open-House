import {
  BoxGeometry,
  LinearFilter,
  Mesh,
  MeshBasicMaterial,
  MeshStandardMaterial,
  SRGBColorSpace,
  TextureLoader
} from "three";
import {BASE_PATH} from "@/utils/utils.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import events from "@/public/posts.json"
import {FontLoader} from "three/addons";
import {gameState} from "@/state/state.js";

export const loadEvents = async (scene) => {
  const initialPosition = {x: 15, y: 2, z: -1}
  const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date))

  for (const i in sortedEvents) {
    const event = sortedEvents[i]
    const font = new FontLoader();
    
    font.load(`${BASE_PATH}Roboto_Regular.json`, function (font) {
      // console.log(font);

      const geometry = new TextGeometry(event.title, {
        font: font,
        size: 0.25,
        depth: 0.01,
      });
      const textMaterial = new MeshBasicMaterial({color: 0xFFFFFF});
      const text = new Mesh(geometry, textMaterial);
      text.position.set(initialPosition.x - 1, initialPosition.y + 2, initialPosition.z + (-5 * i));
      scene.add(text);
    });

    const texture = await new TextureLoader().loadAsync(`${BASE_PATH}images/${event.image}`);
    texture.colorSpace = SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;

    const geometry = new BoxGeometry(4, 3, 0.01);
    const material = new MeshStandardMaterial({ map: texture });
    const image = new Mesh(geometry, material);
    image.position.set(initialPosition.x, initialPosition.y, initialPosition.z + (-5 * i));
    scene.add(image);
    gameState.interactive.add(image);
    image.addEventListener("click", (e) => {
      document.getElementById("popup-content").innerHTML = `
        <div id="popup-info">
            <img width="480px" src="${BASE_PATH}images/${event.image}" alt=${event.title} />
            <p>${event.description}</p>
        </div>
      `

      document.getElementById("popup-title").innerText = event.title;
      document.getElementById("popup-close").addEventListener("click", (e) => {
        document.getElementById("popup").classList.add("hidden")
      })
      document.getElementById("popup").classList.remove("hidden");
    })
  }
};
