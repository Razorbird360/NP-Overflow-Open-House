import {BoxGeometry, Mesh, MeshBasicMaterial, TextureLoader} from "three";
import {BASE_PATH} from "@/utils/utils.js";

export const loadWorkshops = async (scene, world) => {
  const textureLoader = await new TextureLoader().loadAsync(`${BASE_PATH}images/overflow.png`);
  const geometry = new BoxGeometry(16, 9, 1);
  const material = new MeshBasicMaterial({ map: textureLoader });
  return new Mesh(geometry, material);
}