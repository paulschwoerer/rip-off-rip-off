import Actor from '@/game/actors/Actor';
import GameContext from '@/game/GameContext';
import Explosion from '@/game/actors/Explosion';
import Vector2f from '@/game/utils/Vector2f';
import { CollisionType } from '@/game/Game';
import { areIntersecting, getPolygonEdges } from '@/game/utils/mathUtils';
import SoundManager, { SoundEffect } from '@/game/SoundManager';

export interface OnDestroyListener {
  onActorDestroyed() : void;
}

export default abstract class CollisionActor extends Actor {
  private isDestroyed : boolean = false;

  private readonly collisionType : CollisionType;
  private collideWith : CollisionType[] = [];

  private hasDestructionEffect = true;

  private onDestroyListeners : OnDestroyListener[] = [];

  private isCollisionEnabled : boolean = true;

  protected constructor(collisionType : CollisionType, collideWith : CollisionType[] = []) {
    super();

    this.collisionType = collisionType;
    this.collideWith = collideWith;
  }

  destroy() {
    this.isDestroyed = true;

    SoundManager.playSound(SoundEffect.Explosion);

    for (const listener of this.onDestroyListeners) {
      if (listener) {
        listener.onActorDestroyed();
      }
    }
  }

  addOnDestroyedListener(listener : OnDestroyListener) : this {
    this.onDestroyListeners.push(listener);

    return this;
  }

  removeOnDestroyedListener(listener : OnDestroyListener) : this {
    const index = this.onDestroyListeners.indexOf(listener);

    if (index > -1) {
      this.onDestroyListeners.splice(index, 1);
    }

    return this;
  }

  tick(deltaTime : number, context : GameContext) {
    if (this.isDestroyed) {
      if (this.hasDestructionEffect) {
        context.spawnActor(new Explosion().setPosition(this.position.copy()).setScale(new Vector2f(2, 2)));
      }
      return this.despawn();
    }

    // check collision with other collision actors
    if (this.getIsCollisionEnabled()) {
      for (const actor of context.getActors()) {
        if (actor !== this && actor.isDamageable()) {
          const damageableActor = actor as CollisionActor;

          if (damageableActor.getIsCollisionEnabled() &&
              !damageableActor.getIsDestroyed() &&
              this.collideWith.includes(damageableActor.getCollisionType())) {

            for (const component of actor.getComponents()) {
              const otherBBox = component.getBoundingBox();

              for (const selfComponent of this.getComponents()) {
                const selfBBox = selfComponent.getBoundingBox();

                if (
                    selfBBox.maxX >= otherBBox.minX &&
                    selfBBox.minX <= otherBBox.maxX &&
                    selfBBox.maxY >= otherBBox.minY &&
                    selfBBox.minY <= otherBBox.maxY
                ) {
                  // might be a collision
                  const selfEdges = getPolygonEdges(selfComponent.getWorldGeometry());
                  const otherEdges = getPolygonEdges(component.getWorldGeometry());

                  if (context.isDebugging()) {
                    context.addDebugOutput(selfEdges[0]);
                  }

                  for (let i = 0; i < selfEdges.length; i++) {
                    for (let ii = 0; ii < otherEdges.length; ii++) {
                      if (areIntersecting(selfEdges[i], otherEdges[ii])) {
                        damageableActor.destroy();

                        return this.destroy();
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    }

    super.tick(deltaTime, context);
  }

  isDamageable() : boolean {
    return true;
  }

  getIsDestroyed() : boolean {
    return this.isDestroyed;
  }

  getCollisionType() : CollisionType {
    return this.collisionType;
  }

  setHasDestructionEffect(hasDestructionEffect : boolean) {
    this.hasDestructionEffect = hasDestructionEffect;
  }

  setIsCollisionEnabled(enabled : boolean) : this {
    this.isCollisionEnabled = enabled;

    return this;
  }

  getIsCollisionEnabled() : boolean {
    return this.isCollisionEnabled;
  }
}