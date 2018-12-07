import GameContext from '@/game/GameContext';
import EnemyShip from '@/game/actors/EnemyShip';
import Vector2f from '@/game/utils/Vector2f';
import { OnDestroyListener } from '@/game/actors/CollisionActor';
import FuelTank from '@/game/actors/FuelTank';
import {
  getClosestPointOutsideOfArea, getRandomPointInArea,
  getRandomPointOutsideOfArea
} from '@/game/utils/mathUtils';
import Color from '@/game/utils/Color';

export default class EnemyController implements OnDestroyListener {
  private static SPAWN_PADDING = 30;

  private static MAX_ROTATION_RATE = 150;
  private static MAX_THRUST = 150;
  private static ATTACH_DISTANCE = 20;

  private target : FuelTank | null = null;

  private readonly ship : EnemyShip;

  private willDespawn = false;

  private escapePosition : Vector2f | null = null;
  private randomPosition : Vector2f | null = null;

  constructor(context : GameContext) {
    this.ship = new EnemyShip().setPosition(getRandomPointOutsideOfArea(
        context.getWorldBounds(),
        EnemyController.SPAWN_PADDING
    )).setRotation(Math.random() * 360);

    this.ship.addOnDestroyedListener(this);

    context.spawnActor(this.ship);
  }

  private getNextWaypoint(context : GameContext) : Vector2f {
    if (this.target && !this.target.isAttached()) {
      if (context.isDebugging()) {
        this.ship.setColor(new Color(0, 1, 0));
      }

      return this.target.getPosition();
    }

    if (this.target && this.target.isAttachedTo(this.ship)) {
      if (context.isDebugging()) {
        this.ship.setColor(new Color(1, 0, 0));
      }

      if (!this.escapePosition) {
        this.escapePosition = getClosestPointOutsideOfArea(
            context.getWorldBounds(),
            this.ship.getPosition(),
            EnemyController.SPAWN_PADDING
        );
      }

      return this.escapePosition;
    }

    if (context.isDebugging()) {
      this.ship.setColor(new Color(0, 0, 1));
    }

    if (!this.randomPosition) {
      this.randomPosition = getRandomPointInArea(context.getWorldBounds(), 20);
    }

    return this.randomPosition;
  }

  tick(deltaTime : number, context : GameContext) {
    const worldBounds = context.getWorldBounds();

    if (!this.target || this.isTargetAttachedByOtherShip()) {
      this.target = this.getFreeTarget(context);
    }

    const nextWaypoint = this.getNextWaypoint(context);

    const shipPosition = this.ship.getPosition();

    const targetDistance = Vector2f.distance(shipPosition, nextWaypoint);

    const vectorToTarget = new Vector2f(
        nextWaypoint.x - shipPosition.x,
        nextWaypoint.y - shipPosition.y
    ).normalize();

    const forwardVector = this.ship.getForwardVector();

    const rot = vectorToTarget.x * forwardVector.y - vectorToTarget.y * forwardVector.x;

    if (rot < -0.02) {
      this.ship.setRotationRate(-EnemyController.MAX_ROTATION_RATE);
    } else if (rot > 0.02) {
      this.ship.setRotationRate(EnemyController.MAX_ROTATION_RATE);
    } else {
      this.ship.setRotationRate(0);
    }

    this.ship.setThrust(this.target === null || this.hasTargetAttached() ? EnemyController.MAX_THRUST : Math.min(
        targetDistance,
        EnemyController.MAX_THRUST)
    );

    if (targetDistance < EnemyController.ATTACH_DISTANCE) {
      if (this.target !== null && !this.target.isAttached()) {
        this.target.attachTo(this.ship);
      }
    }

    if (this.hasTargetAttached() && !this.willDespawn && (
        shipPosition.x >= worldBounds.maxX + EnemyController.SPAWN_PADDING / 2 ||
        shipPosition.y >= worldBounds.maxY + EnemyController.SPAWN_PADDING / 2 ||
        shipPosition.x <= -EnemyController.SPAWN_PADDING / 2 ||
        shipPosition.y <= -EnemyController.SPAWN_PADDING / 2
    )) {
      context.onEnemyExtraction();

      return this.despawn();
    }
  }

  getWillDespawn() : boolean {
    return this.willDespawn;
  }

  onActorDestroyed() : void {
    if (this.hasTargetAttached()) {
      // @ts-ignore
      this.target.detach();
    }

    this.despawn();
  }

  despawn() {
    this.willDespawn = true;
  }

  dispose() {
    if (this.ship) {
      this.ship.despawn();
    }
  }

  private hasTargetAttached() {
    return this.target && (this.target.isAttached() && this.target.isAttachedTo(this.ship));
  }

  private isTargetAttachedByOtherShip() {
    return this.target && (this.target.isAttached() && !this.target.isAttachedTo(this.ship));
  }

  private getFreeTarget(context : GameContext) : FuelTank | null {
    const found = context.getActors().find(tank => tank instanceof FuelTank && !tank.isAttached());

    return found ? found as FuelTank : null;
  }
}