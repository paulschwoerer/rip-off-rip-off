import { KeyName, PlayerId } from '@/game/Game';
import GameContext from '@/game/GameContext';
import { OnDestroyListener } from '@/game/actors/CollisionActor';
import PlayerShip from '@/game/actors/PlayerShip';
import InputHandler from '@/game/InputHandler';
import { getRandomPointInArea } from '@/game/utils/mathUtils';
import Vector2f from '@/game/utils/Vector2f';

export class PlayerKeyMap {
  constructor(thrust : KeyName, right : KeyName, left : KeyName, fire : KeyName) {
    this.thrust = thrust;
    this.right = right;
    this.left = left;
    this.fire = fire;
  }

  readonly thrust : KeyName;
  readonly right : KeyName;
  readonly left : KeyName;
  readonly fire : KeyName;
}

export default class PlayerController implements OnDestroyListener {
  private static readonly RESPAWN_TIME = 3;
  private static readonly INVINCIBILITY_TIME = 3;

  private invincibilityTimer : number = 0;

  private readonly keyMap : PlayerKeyMap;

  private ship : PlayerShip | null = null;

  private respawnTimer : number | undefined = undefined;

  private readonly context : GameContext;

  private readonly id : PlayerId;

  private score : number = 0;

  constructor(id : PlayerId, keyMap : PlayerKeyMap, context : GameContext) {
    this.keyMap = keyMap;

    this.context = context;
    this.id = id;

    this.spawnNewShip();
  }

  tick(deltaTime : number, context : GameContext, inputHandler : InputHandler) {
    if (this.ship != null) {
      if (inputHandler.isKeyDown(this.keyMap.thrust)) {
        this.ship.setThrust(Math.min(
            PlayerShip.MAX_THRUST,
            this.ship.getThrust() + PlayerShip.ACCELERATION * deltaTime
        ));
      } else {
        this.ship.setThrust(Math.max(0, this.ship.getThrust() - PlayerShip.DRAG * deltaTime));
      }

      let rotationRate = 0;

      if (inputHandler.isKeyDown(this.keyMap.left)) {
        rotationRate -= PlayerShip.ROTATION_RATE;
      }

      if (inputHandler.isKeyDown(this.keyMap.right)) {
        rotationRate += PlayerShip.ROTATION_RATE;
      }

      this.ship.setRotationRate(rotationRate);

      if (inputHandler.isKeyDown(this.keyMap.fire)) {
        const missile = this.ship.fireMissile();

        if (missile) {
          context.spawnActor(missile.addOnDestroyedListener(new class implements OnDestroyListener {
            private readonly player : PlayerController;

            constructor(player : PlayerController) {
              this.player = player;
            }

            onActorDestroyed() : void {
              this.player.givePoints(1);

              if (context) {
                context.onPlayerScoreUpdate(this.player);
              }
            }
          }(this)));
        }
      }

      if (this.invincibilityTimer <= PlayerController.INVINCIBILITY_TIME) {
        this.invincibilityTimer += deltaTime;

        this.ship.setIsVisible(this.invincibilityTimer % 0.5 < 0.25);
      } else if (!this.ship.getIsCollisionEnabled()) {
        this.ship.setIsVisible(true);
        this.ship.setIsCollisionEnabled(true);
      }
    }
  }

  onActorDestroyed() : void {
    this.ship = null;

    //this.givePoints(-5);
    //this.context.onPlayerScoreUpdate(this);

    this.respawnTimer = setTimeout(this.spawnNewShip.bind(this), PlayerController.RESPAWN_TIME * 1000);
  }

  dispose() {
    if (this.respawnTimer) {
      clearTimeout(this.respawnTimer);
    }

    if (this.ship) {
      this.ship.removeOnDestroyedListener(this);
    }
  }

  givePoints(amount : number) {
    this.score = Math.max(0, this.score + amount);
  }

  getScore() : number {
    return this.score;
  }

  getId() : PlayerId {
    return this.id;
  }

  private spawnNewShip() {
    const worldBounds = this.context.getWorldBounds();
    const position = getRandomPointInArea(worldBounds, 40);
    const worldCenter = new Vector2f(worldBounds.maxX / 2, worldBounds.maxY / 2);

    const rotation = Vector2f.angle(Vector2f.fromTo(position, worldCenter), new Vector2f(1, 0));
    this.ship = new PlayerShip(this).setPosition(position).setRotation(rotation);

    this.ship.addOnDestroyedListener(this);

    this.ship.setIsCollisionEnabled(false);

    this.invincibilityTimer = 0;

    this.context.spawnActor(this.ship);
  }
}