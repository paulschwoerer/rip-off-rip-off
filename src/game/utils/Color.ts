export default class Color {
  constructor(r : number, g : number, b : number, a : number = 1) {
    this.r = r;
    this.g = g;
    this.b = b;
    this.a = a;
  }

  static readonly WHITE = new Color(1, 1, 1, 1);
  static readonly BLACK = new Color(0, 0, 0, 1);

  r : number;
  g : number;
  b : number;
  a : number;

  toArray() : number[] {
    return [this.r, this.g, this.b, this.a];
  }
}