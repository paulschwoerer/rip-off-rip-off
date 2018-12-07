import GameContext from '@/game/GameContext';
import Vector2f from '@/game/utils/Vector2f';
import ActorGeometryComponent from '@/game/actors/ActorGeometryComponent';
import CollisionActor, { OnDestroyListener } from '@/game/actors/CollisionActor';
import { CollisionType } from '@/game/Game';
import PlayerController from '@/game/PlayerController';
import PlayerShip from '@/game/actors/PlayerShip';

export default class Missile extends CollisionActor {
  static VELOCITY = 450;

  constructor() {
    super(CollisionType.MISSILE, [CollisionType.ENEMY_SHIP]);

    this.components.push(new ActorGeometryComponent(this, [
      0, 0,
      -3, 1,
      -3, -1
    ]));

    this.setScale(new Vector2f(1.5, 1.5));

    this.setHasDestructionEffect(false);
  }

  setInitialVelocity(x : number, y : number) : this {
    this.velocity = new Vector2f(x, y);

    return this;
  }

  tick(deltaTime : number, context : GameContext) {
    const pos = this.getPosition();
    const canvasSize = context.getWorldDimensions();

    if (pos.x > canvasSize.x || pos.x < 0 || pos.y > canvasSize.y || pos.y < 0) {
      return this.despawn();
    }

    super.tick(deltaTime, context);
  }
}