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

export const loadEvents = async (scene) => {
  const initalPosition = {x: 15, y: 2, z: -1}
  const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date))
  for (const i in sortedEvents) {
    const event = sortedEvents[i]
    const font = new FontLoader();
    font.load(`${BASE_PATH}Roboto_Regular.json`, function (font) {
      const geometry = new TextGeometry(event.title, {
        font: font,
        size: 0.25,
        depth: 0.01,
      });
      const textMaterial = new MeshBasicMaterial({color: 0xFFFFFF});
      const text = new Mesh(geometry, textMaterial);
      text.position.set(initialPosition.x -1, initialPosition.y + 2, initialPosition.z+(-5*i));
      scene.add(text)
    });

    const maxLineLength = 30;
      const words = event.description.split(' ');
      const lines = words.reduce((acc, word) => {
        if (acc[acc.length - 1].length + word.length + 1 <= maxLineLength) {
          acc[acc.length - 1] += ' ' + word;
        } else {
          acc.push(word);
        }
        return acc;
      }, ['']);

      lines.forEach((line, index) => {
        const lineGeometry = new TextGeometry(line, {
          font: font,
          size: 0.15,
          depth: 0.01,
        });
        const lineMaterial = new MeshBasicMaterial({ color: 0xAAAAAA });
        const lineText = new Mesh(lineGeometry, lineMaterial);
        lineText.position.set(initialPosition.x - 1, initialPosition.y - 1 - index * 0.2, initialPosition.z + (-5 * i));
        scene.add(lineText);
      });
    };

    const texture = await new TextureLoader().loadAsync(`${BASE_PATH}images/${event.image}`);
    texture.colorSpace = SRGBColorSpace;
    texture.generateMipmaps = true;
    texture.minFilter = LinearFilter;
    texture.magFilter = LinearFilter;

    const geometry = new BoxGeometry(4, 3, 0.01);

    const material = new MeshStandardMaterial({ map: texture });
    const image = new Mesh(geometry, material);
    image.position.set(initialPosition.x, initialPosition.y, initialPosition.z+(-5*i));
    scene.add(image)
}
