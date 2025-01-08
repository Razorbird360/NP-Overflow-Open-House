import {BASE_PATH} from "@/utils/utils.js";
import {OBJLoader} from "three/examples/jsm/loaders/OBJLoader.js";
import {BoxGeometry, LinearFilter, Mesh, MeshStandardMaterial, SRGBColorSpace, TextureLoader, Vector3} from "three";
import * as CANNON from "cannon-es";
import {gameState} from "@/state/state.js";
import { castShadow } from '@/scene/scene.js';

export const loadNotice = async (scene) => {
  const model = await new OBJLoader().loadAsync(`${BASE_PATH}world_objects/notice_board/model_1.obj`);
  model.rotateX(300);
  const tl = new TextureLoader()
  const texture = await tl.loadAsync(`${BASE_PATH}world_objects/notice_board/bulletinboard_texture.tga.png`)
  texture.colorSpace = SRGBColorSpace;
  texture.generateMipmaps = true;
  texture.minFilter = LinearFilter;
  texture.magFilter = LinearFilter;
  const mesh = new MeshStandardMaterial({ map: texture });
  model.traverse( function( child ) {
    if ( child instanceof Mesh ) {
      child.material = mesh;
      castShadow(child);
    }
  });
  const body = new CANNON.Body({
    position: new CANNON.Vec3(0, 0, 10),
  })


  body.addShape(new CANNON.Box(new CANNON.Vec3(2.8, 5, 0.5)))

  gameState.world !== null ? gameState.world.addBody(body) : null
    model.scale.divideScalar(30) // all hardcoded lol gl
  model.position.set(0, 2, 10)

  scene.add(model)
  // https://www.figma.com/design/ekif73iQ68cpzkSRA5RSJ2/NP-Overflow-OH-2025
  const image = await tl.loadAsync(`${BASE_PATH}images/overflow-oh.png`)

  image.colorSpace = SRGBColorSpace;
  image.generateMipmaps = true;
  image.minFilter = LinearFilter;
  image.magFilter = LinearFilter;
  const imageMesh = new MeshStandardMaterial({map: image});
  const box = new BoxGeometry(4, 2, 0.01)
  const notice = new Mesh(box, imageMesh)
  notice.position.set(0, 2.1, 9.9)
  castShadow(notice);
  scene.add(notice)
}