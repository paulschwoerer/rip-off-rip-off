import TextRenderHelper from '@/game/ui/TextRenderHelper';
import Vector2f from '@/game/utils/Vector2f';
import Color from '@/game/utils/Color';

export enum TextAlign {
  Left,
  Center,
  Right
}

export class Character {
  private readonly vertices : number[];

  private readonly offset : number;

  constructor(char : string, offset : number) {
    this.vertices = TextRenderHelper.getCharVertices(char);
    this.offset = offset;
  }

  getVertices() : number[] {
    return this.vertices;
  }

  getOffset() : number {
    return this.offset;
  }
}

export default class SimpleText {
  // @ts-ignore
  private text : string;

  private characters : Character[] = [];

  private readonly position : Vector2f;

  private readonly size : number;

  private readonly color : Color;

  private readonly alignment : TextAlign;

  constructor(
      text : string,
      position : Vector2f,
      size : number = 24,
      alignment : TextAlign = TextAlign.Left,
      color : Color = Color.WHITE
  ) {
    this.position = position;
    this.size = size;
    this.color = color;
    this.alignment = alignment;

    this.setText(text);
  }

  setText(text : string) : this {
    this.text = text;

    this.characters = [];
    const textChars = text.split('');
    for (let i = 0; i < textChars.length; i++) {
      this.characters.push(new Character(textChars[i], this.computeOffset(i)));
    }

    return this;
  }

  getCharacters() : Character[] {
    return this.characters;
  }

  getPosition() : Vector2f {
    return this.position;
  }

  getColor() : Color {
    return this.color;
  }

  getSize() : number {
    return this.size;
  }

  getLength() {
    return this.text.length;
  }

  private computeOffset(index : number) {
    switch (this.alignment) {
      default:
      case TextAlign.Left:
        return index * this.size;
      case TextAlign.Center:
        return (-(this.getLength() / 2) + index) * this.size;
      case TextAlign.Right:
        return (-this.getLength() + index) * this.size;
    }
  }
}