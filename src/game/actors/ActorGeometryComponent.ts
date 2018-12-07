import Vector2f from '@/game/utils/Vector2f';
import { arrayVerticesToVector2Vertices, BoundingBox, degToRad, getMinMax, radToDeg } from '@/game/utils/mathUtils';
import Actor from '@/game/actors/Actor';

export default class ActorGeometryComponent {
  private geometry : Array<number>;
  private rotation : number;
  private position : Vector2f;
  private scale : Vector2f;

  private parent : Actor;

  constructor(
      parent : Actor,
      geometry : Array<number>,
      position : Vector2f = new Vector2f(0, 0),
      rotation : number = 0,
      scale : Vector2f = new Vector2f(1, 1)
  ) {
    this.parent = parent;
    this.geometry = geometry;
    this.position = position;
    this.rotation = rotation;
    this.scale = scale;
  }

  setLocalScale(scale : Vector2f) : this {
    this.scale = scale;

    return this;
  }

  getLocalGeometry() : number[] {
    return this.geometry;
  }

  getLocalRotation() : number {
    return this.rotation;
  }

  getLocalPosition() : Vector2f {
    return this.position;
  }

  getLocalScale() : Vector2f {
    return this.scale;
  }

  getWorldScale() : Vector2f {
    return new Vector2f(
        this.parent.getScale().x * this.scale.x,
        this.parent.getScale().y * this.scale.y
    );
  }

  getWorldPosition() : Vector2f {
    return new Vector2f(
        this.parent.getPosition().x + this.position.x,
        this.parent.getPosition().y + this.position.y
    );
  }

  getWorldRotation() : number {
    return this.parent.getRotation() + this.rotation;
  }

  getWorldGeometry() : number[] {
    const points : number[] = [];

    const rad = degToRad(-this.getWorldRotation());
    const scale = this.getWorldScale();
    const translation = this.getWorldPosition();
    const sin = Math.sin(rad);
    const cos = Math.cos(rad);

    for (let i = 0; i < this.geometry.length; i += 2) {
      const scaled = new Vector2f(
          this.geometry[i] * scale.x,
          this.geometry[i + 1] * scale.y
      );

      const rotated = new Vector2f(
          scaled.x * cos - scaled.y * sin,
          scaled.x * sin + scaled.y * cos
      );

      points.push(
          rotated.x + translation.x,
          rotated.y + translation.y
      );
    }

    return points;
  }

  getBoundingBox() : BoundingBox {
    return getMinMax(arrayVerticesToVector2Vertices(this.getWorldGeometry()));
  }
}