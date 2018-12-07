import { assert } from "@/game/utils/debugUtils";
import { Howl } from "howler";

// @ts-ignore
import ShootSrc from "@/assets/sounds/270343__littlerobotsoundfactory__shoot-01.wav";
// @ts-ignore
import MenuNavigateSrc from "@/assets/sounds/270315__littlerobotsoundfactory__menu-navigate-03.wav";
// @ts-ignore
import ExplosionSrc from "@/assets/sounds/270310__littlerobotsoundfactory__explosion-04.wav";

export enum SoundEffect {
  Shoot,
  Explosion,
  MenuNavigation
}

export default class SoundManager {
  private static sounds : Howl[] = [];

  static loadSounds() {
    this.loadSound(SoundEffect.Shoot, ShootSrc, .8);
    this.loadSound(SoundEffect.MenuNavigation, MenuNavigateSrc, .8);
    this.loadSound(SoundEffect.Explosion, ExplosionSrc, .5);
  }

  static playSound(id : SoundEffect) {
    assert(typeof this.sounds[id] !== 'undefined', 'Tried to play sound without loading it first.');

    this.sounds[id].play();
  }

  private static loadSound(id : number, src : string, volume = 1.0) {
    this.sounds[id] = new Howl({
      src,
      volume
    })
  }
}