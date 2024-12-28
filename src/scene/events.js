import {BoxGeometry, Mesh, MeshBasicMaterial, TextureLoader} from "three";
import {BASE_PATH} from "@/utils/utils.js";
import { TextGeometry } from 'three/addons/geometries/TextGeometry.js';
import events from "@/public/posts.json"
import {FontLoader} from "three/addons";
import init from "three/addons/offscreen/scene.js";

export const loadEvents = async (scene) => {
  console.log(events)
  const initalPosition = {x: 15, y: 2, z: -1}
  const sortedEvents = events.sort((a, b) => new Date(b.date) - new Date(a.date))
  for (const i in sortedEvents) {
    const event = sortedEvents[i]
    console.log(event)
    const font = new FontLoader();
    font.load(`${BASE_PATH}Roboto_Regular.json`, function (font) {
      const geometry = new TextGeometry(event.title, {
        font: font,
        size: 0.1,
        height: 0.01,
      });
      const textMaterial = new MeshBasicMaterial({color: 0xFFFFFF});
      const text = new Mesh(geometry, textMaterial);
      text.position.set(initalPosition.x, initalPosition.y + 2, initalPosition.z+(-5*i));
      scene.add(text)
    });

    const textureLoader = await new TextureLoader().loadAsync(`${BASE_PATH}images/${event.image}`);
    const geometry = new BoxGeometry(4, 3, 0.01);
    const material = new MeshBasicMaterial({ map: textureLoader });
    const image = new Mesh(geometry, material);
    image.position.set(initalPosition.x, initalPosition.y, initalPosition.z+(-5*i));
    scene.add(image)
  }
}