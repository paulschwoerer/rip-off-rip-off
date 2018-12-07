import Vector2f from '@/game/utils/Vector2f';
import GameContext from '@/game/GameContext';
import ActorGeometryComponent from '@/game/actors/ActorGeometryComponent';
import Color from '@/game/utils/Color';
import { degToRad } from '@/game/utils/mathUtils';

export default abstract class Actor {
  protected position : Vector2f = new Vector2f(0, 0);
  protected scale : Vector2f = new Vector2f(1, 1);
  protected rotation : number = 0;
  protected velocity : Vector2f = new Vector2f(0, 0);
  protected rotationRate : number = 0;
  private willDespawn = false;
  protected zIndex : number = 0;
  protected components : Array<ActorGeometryComponent> = [];
  private color : Color = Color.WHITE;

  private isVisible = true;

  setPosition(position : Vector2f) : this {
    this.position = position;

    return this;
  }

  setRotation(rotation : number) : this {
    this.rotation = rotation;

    return this;
  }

  setRotationRate(rate : number) : this {
    this.rotationRate = rate;

    return this;
  }

  getPosition() : Vector2f {
    return this.position;
  }

  getRotation() : number {
    return this.rotation;
  }

  setScale(scale : Vector2f) : this {
    this.scale = scale;

    return this;
  }

  getScale() : Vector2f {
    return this.scale;
  }

  setZIndex(zIndex : number) : this {
    this.zIndex = zIndex;

    return this;
  }

  getZIndex() : number {
    return this.zIndex;
  }

  setColor(color : Color) : this {
    this.color = color;

    return this;
  }

  getColor() : Color {
    if (this.isVisible) {
      return this.color;
    }

    return new Color(0, 0, 0, 0);
  }

  getComponents() : Array<ActorGeometryComponent> {
    return this.components;
  }

  getForwardVector() : Vector2f {
    const rad = degToRad(this.rotation);

    return new Vector2f(
        Math.cos(rad),
        -Math.sin(rad)
    );
  }

  tick(deltaTime : number, context : GameContext) {
    this.position.x += this.velocity.x * deltaTime;
    this.position.y += this.velocity.y * deltaTime;
    this.rotation += this.rotationRate * deltaTime;
  };

  getWillDespawn() : boolean {
    return this.willDespawn;
  }

  despawn() : void {
    this.willDespawn = true;
  }

  isDamageable() : boolean {
    return false;
  }

  getIsVisible() {
    return this.isVisible;
  }

  setIsVisible(visible : boolean) : this {
    this.isVisible = visible;

    return this;
  }

  dispose() {
  }
}
