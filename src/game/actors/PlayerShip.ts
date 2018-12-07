import { CollisionType } from '@/game/Game';

import GameContext from '@/game/GameContext';
import Vector2f from '@/game/utils/Vector2f';
import ActorGeometryComponent from '@/game/actors/ActorGeometryComponent';
import CollisionActor from '@/game/actors/CollisionActor';
import Missile from '@/game/actors/Missile';
import PlayerController from '@/game/PlayerController';
import SoundManager, { SoundEffect } from '@/game/SoundManager';

export default class PlayerShip extends CollisionActor {
  static ROTATION_RATE = 135;
  static MAX_THRUST = 250;
  static DRAG = 160;
  static ACCELERATION = 350;
  static FIRE_RATE = 4; // shots / second

  private thrust = 0;

  private timeSinceLastShot : number = 1 / PlayerShip.FIRE_RATE;

  private readonly owner : PlayerController;

  constructor(owner : PlayerController) {
    super(CollisionType.PLAYER_SHIP, [CollisionType.ENEMY_SHIP, CollisionType.PLAYER_SHIP]);

    this.components.push(new ActorGeometryComponent(this, [
      10, 0,
      -10, 15,
      -4, 5,
      -8, 0,
      -4, -5,
      -10, -15
    ]));

    this.setZIndex(99);

    this.setScale(new Vector2f(1.3, 1.3));

    this.owner = owner;
  }

  tick(deltaTime : number, context : GameContext) : void {
    const forward = this.getForwardVector();
    const position = this.getPosition();
    const canvasDimensions = context.getWorldDimensions();

    this.velocity.x = forward.x * this.thrust;
    this.velocity.y = forward.y * this.thrust;

    if (position.x > canvasDimensions.x) {
      position.x = 0;
    }

    if (position.x < 0) {
      position.x = canvasDimensions.x;
    }

    if (position.y > canvasDimensions.y) {
      position.y = 0;
    }

    if (position.y < 0) {
      position.y = canvasDimensions.y;
    }

    this.timeSinceLastShot += deltaTime;

    super.tick(deltaTime, context);
  }

  setThrust(thrust : number) : this {
    this.thrust = thrust;

    return this;
  }

  getThrust() : number {
    return this.thrust;
  }

  fireMissile() : Missile | null {
    const forward = this.getForwardVector();

    if (this.timeSinceLastShot >= 1 / PlayerShip.FIRE_RATE) {
      this.timeSinceLastShot = 0;

      SoundManager.playSound(SoundEffect.Shoot);

      return new Missile()
          .setRotation(this.getRotation())
          .setPosition(new Vector2f(
              this.getPosition().x + (forward.x * 10),
              this.getPosition().y + (forward.y * 10)
          ))
          .setInitialVelocity(
              this.velocity.x + (Missile.VELOCITY * forward.x),
              this.velocity.y + (Missile.VELOCITY * forward.y)
          );
    }

    return null;
  }
}