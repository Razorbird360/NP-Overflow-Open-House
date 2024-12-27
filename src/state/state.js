export class GameState {
  constructor() {
    this.character = null;
    this.mixer = null;
    this.animations = {};
    this.currentAction = null;
    this.facing = 'back';
    this.keys = {
      w: false,
      a: false,
      s: false,
      d: false,
      shift: false,
    };
    this.loadedObjects = false;
    this.objects = {
      fence: null,
      house: null,
      workshops: null
    };
    this.world = null;
    this.characterBody = null;
    this.sounds = {
      walking: null,
      running: null,
    };
  }
}

export const gameState = new GameState();