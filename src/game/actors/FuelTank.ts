import Actor from '@/game/actors/Actor';
import ActorGeometryComponent from '@/game/actors/ActorGeometryComponent';
import Color from '@/game/utils/Color';
import EnemyShip from '@/game/actors/EnemyShip';
import GameContext from '@/game/GameContext';

export default class FuelTank extends Actor {
  private attachTarget : EnemyShip | null = null;

  constructor() {
    super();

    this.components.push(new ActorGeometryComponent(this, [
      5, -3,
      5, 3,
      -10, 5,
      -10, -5,
    ]));

    this.setColor(new Color(1, 1, 1, 0.7))
  }

  tick(deltaTime : number, context : GameContext) {
    if (this.attachTarget !== null) {
      this.position.x = this.attachTarget.getPosition().x + this.attachTarget.getForwardVector().x * 30;
      this.position.y = this.attachTarget.getPosition().y + this.attachTarget.getForwardVector().y * 30;
      this.rotation = this.attachTarget.getRotation();

      if(context.isDebugging()) {
        this.setColor(new Color(1, 0, 0));
      }
    } else {
      if(context.isDebugging()) {
        this.setColor(new Color(0, 1, 0));
      }

      super.tick(deltaTime, context);
    }
  }

  attachTo(other : EnemyShip) : boolean {
    if (other === null || other.getWillDespawn()) {
      return false;
    }

    this.attachTarget = other;

    return true;
  }

  isAttachedTo(other : EnemyShip) : boolean {
    return other !== null && this.attachTarget !== null && other === this.attachTarget;
  }

  isAttached() {
    return this.attachTarget !== null;
  }

  detach() {
    this.attachTarget = null;
  }
}