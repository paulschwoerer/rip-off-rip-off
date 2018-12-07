import { radToDeg } from '@/game/utils/mathUtils';

export default class Vector2f {
  public x : number;
  public y : number;

  constructor(x : number, y : number) {
    this.x = x;
    this.y = y;
  }

  toArray() : Array<number> {
    return [this.x, this.y];
  }

  copy() : Vector2f {
    return new Vector2f(
        this.x,
        this.y
    );
  }

  length() {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize() : this {
    const length = this.length();

    this.x /= length;
    this.y /= length;

    return this;
  }

  normalized() : Vector2f {
    const length = this.length();

    return new Vector2f(
        this.x / length,
        this.y / length
    );
  }

  static distance(vec1 : Vector2f, vec2 : Vector2f) : number {
    return new Vector2f(
        vec2.x - vec1.x,
        vec2.y - vec1.y
    ).length();
  }

  static dot(vec1 : Vector2f, vec2 : Vector2f) : number {
    return vec1.x * vec2.x + vec1.y * vec2.y;
  }

  static angle(vec1 : Vector2f, vec2 : Vector2f) : number {
    return radToDeg(Math.atan2(vec2.y, vec2.x) - Math.atan2(vec1.y, vec1.x));
  }

  static fromTo(from : Vector2f, to : Vector2f) {
    return new Vector2f(
        to.x - from.x,
        to.y - from.y
    );
  }

}