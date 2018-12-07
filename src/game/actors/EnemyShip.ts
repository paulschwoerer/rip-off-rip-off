import ActorGeometryComponent from '@/game/actors/ActorGeometryComponent';
import CollisionActor from '@/game/actors/CollisionActor';
import Vector2f from '@/game/utils/Vector2f';
import { CollisionType } from '@/game/Game';
import GameContext from '@/game/GameContext';
import FuelTank from '@/game/actors/FuelTank';

export default class EnemyShip extends CollisionActor {
  private thrust : number = 0;

  constructor() {
    super(CollisionType.ENEMY_SHIP);

    this.components.push(new ActorGeometryComponent(this, [
      -10, 2,
      -2, 5,
      2, 5,
      10, 2,
      2, 2,
      2, -2,
      10, -2,
      2, -5,
      -2, -5,
      -10, -2,
      -2, -2,
      -2, 2
    ]));

    this.setScale(new Vector2f(1.4, 1.4));
  }

  setThrust(thrust : number) : this {
    this.thrust = thrust;

    return this;
  }

  tick(deltaTime : number, context : GameContext) {
    this.velocity.x = this.getForwardVector().x * this.thrust;
    this.velocity.y = this.getForwardVector().y * this.thrust;

    super.tick(deltaTime, context);
  }
}

