import Actor from '@/game/actors/Actor';
import GameContext from '@/game/GameContext';
import ActorGeometryComponent from '@/game/actors/ActorGeometryComponent';
import Vector2f from '@/game/utils/Vector2f';
import { easeOutQuad } from '@/game/utils/animUtils';

export default class Explosion extends Actor {
  static DEFAULT_DURATION = .2;

  private timePassed = 0;

  private readonly duration : number;

  constructor(duration : number = Explosion.DEFAULT_DURATION) {
    super();

    this.duration = duration;

    const count = 10;

    for (let i = 0; i < count; i++) {
      this.components.push(
          new ActorGeometryComponent(this, [
            4, 0,
            20 + Math.random() * 20, 0
          ], new Vector2f(0, 0), (360 / count) * i)
      );
    }
  }

  tick(deltaTime : number, context : GameContext) {
    this.timePassed += deltaTime;

    if (this.timePassed >= this.duration) {
      this.despawn();
    } else {
      for (const component of this.components) {
        component.setLocalScale(
            new Vector2f(
                easeOutQuad(this.timePassed, 0, 1, this.duration),
                1
            )
        );
      }
    }
  }
}