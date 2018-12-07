import Vector2f from '@/game/utils/Vector2f';
import { assert } from '@/game/utils/debugUtils';

export interface BoundingBox {
  minX : number;
  minY : number;
  maxX : number;
  maxY : number;
}

export const getRectangleVertices = (x : number, y : number, width : number, height : number) : Array<number> => {
  const x1 = x;
  const x2 = x + width;
  const y1 = y;
  const y2 = y + height;

  return [
    x1, y1,
    x2, y1,
    x1, y2,
    x1, y2,
    x2, y1,
    x2, y2
  ];
};

export const arrayVerticesToVector2Vertices = (vertices : number[]) : Vector2f[] => {
  const vectors = [];

  for (let i = 0; i < vertices.length; i+= 2) {
    vectors.push(new Vector2f(vertices[i], vertices[i + 1]));
  }

  return vectors;
};

export const getMinMax = (polygon : Vector2f[]) : BoundingBox => {
  assert(polygon.length > 1, 'Polygon should at least have 2 vertices.');

  let minX = polygon[0].x,
      minY = polygon[0].y,
      maxX = minX,
      maxY = minY;

  for (let i = 1; i < polygon.length; i++) {
    if (polygon[i].x < minX) {
      minX = polygon[i].x;
    }

    if (polygon[i].y < minY) {
      minY = polygon[i].y;
    }

    if (polygon[i].x > maxX) {
      maxX = polygon[i].x;
    }

    if (polygon[i].y > maxY) {
      maxY = polygon[i].y;
    }
  }

  return {
    minX,
    minY,
    maxX,
    maxY
  };
};

export const getRandomPointInArea = (area : BoundingBox, padding : number) : Vector2f => {
  return new Vector2f(
      area.minX + padding + Math.random() * (area.maxX - area.minX - 2 * padding),
      area.minY + padding + Math.random() * (area.maxY - area.minY - 2 * padding)
  );
};

export const getPolygonEdges = (polygon : number[]) : number[][] => {
  const edges : number[][] = [];
  for (let i = 0; i < polygon.length; i += 2) {
    const isLast = i === polygon.length - 2;

    edges.push([
      polygon[i], // x1
      polygon[i + 1], // y1
      polygon[isLast ? 0 : i + 2], // x2
      polygon[isLast ? 1 : i + 3] // y2
    ]);
  }

  return edges;
};

export const getClosestPointOutsideOfArea = (area : BoundingBox, origin : Vector2f, padding : number) => {
  const minXD = Math.abs(origin.x - area.minX);
  const maxXD = Math.abs(area.maxX - origin.x);
  const minYD = Math.abs(origin.y - area.minY);
  const maxYD = Math.abs(area.maxY - origin.y);

  const xD = Math.min(minXD, maxXD);
  const yD = Math.min(minXD, maxXD);

  return xD <= yD ?
      new Vector2f(minXD < maxXD ? -padding : area.maxX + padding, origin.y) :
      new Vector2f(origin.x, minYD < maxYD ? -padding : area.maxY + padding);
};

export const getRandomPointOutsideOfArea = (area : BoundingBox, padding : number) : Vector2f => {
  let x, y;
  const random = Math.random();

  if (random > 0.75) {
    x = area.minX + Math.random() * (area.maxX - area.minX);
    y = -padding;
  } else if (random > 0.5) {
    x = -padding;
    y = area.minY + Math.random() * (area.maxY - area.minY);
  } else if (random > 0.25) {
    x = area.minX + Math.random() * (area.maxX - area.minX);
    y = area.maxY + padding;
  } else {
    x = area.maxX + padding;
    y = area.minY + Math.random() * (area.maxY - area.minY);
  }

  return new Vector2f(x, y);
};

export const degToRad = (deg : number) : number => {
  return deg * Math.PI / 180.0;
};

export const radToDeg = (rad : number) : number => {
  return rad * 180.0 / Math.PI;
};

export const cross = (x1 : number, y1 : number, x2 : number, y2 : number) : number =>
    (x1 * y2 - y1 * x2);

export const vecEqual = (x1 : number, y1 : number, x2 : number, y2 : number) : boolean =>
    (x1 === x2 && y1 === y2);

export const areIntersecting = (
    line1 : number[], // x1, y1, x2, y2
    line2 : number[], // x1, y1, x2, y2
) : boolean => {
  const X1 = 0;
  const Y1 = 1;
  const X2 = 2;
  const Y2 = 3;

  const d1x = line1[X2] - line1[X1];
  const d1y = line1[Y2] - line1[Y1];
  const d2x = line2[X2] - line2[X1];
  const d2y = line2[Y2] - line2[Y1];

  const n = cross(line2[X1] - line1[X1], line2[Y1] - line1[Y1], d1x, d1y);
  const d = cross(d1x, d1y, d2x, d2y);

  if (n === 0 && d === 0) {
    if (
        vecEqual(line1[X1], line1[Y1], line2[X1], line2[Y1]) ||
        vecEqual(line1[X1], line1[Y1], line2[X2], line2[Y2]) ||
        vecEqual(line1[X2], line1[Y2], line2[X2], line2[Y2]) ||
        vecEqual(line1[X2], line1[Y2], line2[X1], line2[Y1])
    ) {
      return true;
    }

    return (
        line1[X1] - line2[X1] < 0 &&
        line1[X1] - line2[X2] < 0 &&
        line1[X2] - line2[X1] < 0 &&
        line1[X2] - line2[X2] < 0
    ) || (
        line2[X1] - line1[X1] < 0 &&
        line2[X1] - line1[X2] < 0 &&
        line2[X2] - line1[X1] < 0 &&
        line2[X2] - line1[X2] < 0
    );
  }

  if (d === 0) {
    return false;
  }

  const u = n / d;
  const t = cross(line2[X1] - line1[X1], line2[Y1] - line1[Y1], d2x, d2y) / d;

  return t >= 0 && t <= 1 && u >= 0 && u <= 1;
};
