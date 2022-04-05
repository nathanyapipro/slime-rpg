import { Vector2 } from "./vector_2";

export class Matrix3 {
  a: number;
  b: number;
  c: number;
  d: number;
  tx: number;
  ty: number;

  constructor(a = 1, b = 0, c = 0, d = 1, tx = 0, ty = 0) {
    /**
     * a c tx
     * b d ty
     * 0 0 1
     */
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
  }

  set(
    a: number,
    b: number,
    c: number,
    d: number,
    tx: number,
    ty: number
  ): this {
    this.a = a;
    this.b = b;
    this.c = c;
    this.d = d;
    this.tx = tx;
    this.ty = ty;
    return this;
  }

  copy(matrix: Matrix3): void {
    this.a = matrix.a;
    this.b = matrix.b;
    this.c = matrix.c;
    this.d = matrix.d;
    this.tx = matrix.tx;
    this.ty = matrix.ty;
  }

  clone(): Matrix3 {
    return new Matrix3(this.a, this.b, this.c, this.d, this.tx, this.ty);
  }

  identity(): this {
    this.a = this.d = 1;
    this.b = this.c = this.tx = this.ty = 0;
    return this;
  }

  setPosition(x: number, y: number): void {
    this.tx = x;
    this.ty = y;
  }

  setTranslation(x: number, y: number): void {
    this.tx = x;
    this.ty = y;
  }

  translate(x: number, y: number): this {
    this.tx += x * this.a + y * this.c;
    this.ty += x * this.b + y * this.d;
    return this;
  }

  translateByVector(vector: Vector2): void {
    this.translate(vector.x, vector.y);
  }

  scaleByCenter(
    x: number,
    y: number,
    center: Vector2 = new Vector2()
  ): Matrix3 {
    this.translate(center.x, center.y);

    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;

    this.translate(-center.x, -center.y);

    return this;
  }

  scale(x: number, y: number): this {
    this.a *= x;
    this.b *= x;
    this.c *= y;
    this.d *= y;
    return this;
  }

  rotateByCenter(angle: number, center = new Vector2()): this {
    const rad = (angle * Math.PI) / 180;
    // Concatenate rotation matrix into this one
    const x = center.x;
    const y = center.y;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const tx = x - x * cos + y * sin;
    const ty = y - x * sin - y * cos;
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    this.a = cos * a + sin * c;
    this.b = cos * b + sin * d;
    this.c = -sin * a + cos * c;
    this.d = -sin * b + cos * d;
    this.tx += tx * a + ty * c;
    this.ty += tx * b + ty * d;
    return this;
  }

  rotateRad(rad: number): this {
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    this.a = cos * a + sin * c;
    this.b = cos * b + sin * d;
    this.c = -sin * a + cos * c;
    this.d = -sin * b + cos * d;
    return this;
  }

  rotate(angle: number): this {
    const rad = (angle * Math.PI) / 180;
    const cos = Math.cos(rad);
    const sin = Math.sin(rad);
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    this.a = cos * a + sin * c;
    this.b = cos * b + sin * d;
    this.c = -sin * a + cos * c;
    this.d = -sin * b + cos * d;
    return this;
  }

  multiply(mx: Matrix3): this {
    const a1 = this.a;
    const b1 = this.b;
    const c1 = this.c;
    const d1 = this.d;
    const a2 = mx.a;
    const b2 = mx.c;
    const c2 = mx.b;
    const d2 = mx.d;
    const tx2 = mx.tx;
    const ty2 = mx.ty;

    this.a = a2 * a1 + c2 * c1;
    this.c = b2 * a1 + d2 * c1;
    this.b = a2 * b1 + c2 * d1;
    this.d = b2 * b1 + d2 * d1;
    this.tx += tx2 * a1 + ty2 * c1;
    this.ty += tx2 * b1 + ty2 * d1;

    return this;
  }

  invert(): Matrix3 | null {
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    const tx = this.tx;
    const ty = this.ty;
    const det = a * d - b * c;

    let res: Matrix3 | null = null;
    if (det && !isNaN(det) && isFinite(tx) && isFinite(ty)) {
      this.a = d / det;
      this.b = -b / det;
      this.c = -c / det;
      this.d = a / det;
      this.tx = (c * ty - d * tx) / det;
      this.ty = (b * tx - a * ty) / det;
      res = this;
    }

    return res;
  }

  isIdentity(): boolean {
    return (
      this.a === 1 &&
      this.b === 0 &&
      this.c === 0 &&
      this.d === 1 &&
      this.tx === 0 &&
      this.ty === 0
    );
  }

  isInvertible(): boolean {
    const det: number = this.a * this.d - this.c * this.b;
    return !isNaN(det) && isFinite(this.tx) && isFinite(this.ty);
  }

  isSingular(): boolean {
    return !this.isInvertible();
  }

  transformVector(vector: Vector2): Vector2 {
    const x = vector.x;
    const y = vector.y;
    return vector.set(
      x * this.a + y * this.c + this.tx,
      x * this.b + y * this.d + this.ty
    );
  }

  inverseTransform(point: Vector2, dest?: Vector2): Vector2 | null {
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    const tx = this.tx;
    const ty = this.ty;
    const det = a * d - b * c;
    let res: null | Vector2 = null;

    if (det && !isNaN(det) && isFinite(tx) && isFinite(ty)) {
      const x = point.x - this.tx;
      const y = point.y - this.ty;

      if (!dest) {
        dest = new Vector2();
      }

      res = dest.set((x * d - y * c) / det, (y * a - x * b) / det);
    }

    return res;
  }

  decompose(): {
    translation: Vector2;
    rotation: number;
    scaling: Vector2;
    skewing: Vector2;
  } {
    // http://dev.w3.org/csswg/css3-2d-transforms/#matrix-decomposition
    // http://www.maths-informatique-jeux.com/blog/frederic/?post/2013/12/01/Decomposition-of-2D-transform-matrices
    // https://github.com/wisec/DOMinator/blob/master/layout/style/nsStyleAnimation.cpp#L946
    const a = this.a;
    const b = this.b;
    const c = this.c;
    const d = this.d;
    const det = a * d - b * c;
    const sqrt = Math.sqrt;
    const atan2 = Math.atan2;
    const degrees = 180 / Math.PI;
    let rotate: number;
    let scale: [number, number];
    let skew: [number, number];

    if (a !== 0 || b !== 0) {
      const r = sqrt(a * a + b * b);
      rotate = Math.acos(a / r) * (b > 0 ? 1 : -1);
      scale = [r, det / r];
      skew = [atan2(a * c + b * d, r * r), 0];
    } else if (c !== 0 || d !== 0) {
      const s = sqrt(c * c + d * d);
      // rotate = Math.PI/2 - (d > 0 ? Math.acos(-c/s) : -Math.acos(c/s));
      rotate = Math.asin(c / s) * (d > 0 ? 1 : -1);
      scale = [det / s, s];
      skew = [0, atan2(a * c + b * d, s * s)];
    } else {
      // a = b = c = d = 0

      rotate = 0;
      skew = scale = [0, 0];
    }

    return {
      translation: this.getTranslation(),
      rotation: rotate * degrees,
      scaling: new Vector2(scale[0], scale[1]),
      skewing: new Vector2(skew[0] * degrees, skew[1] * degrees),
    };
  }

  getValues(): [number, number, number, number, number, number] {
    return [this.a, this.b, this.c, this.d, this.tx, this.ty];
  }

  getTranslation(): Vector2 {
    // No decomposition is required to extract translation.
    return new Vector2(this.tx, this.ty);
  }

  getScaling() {
    return this.decompose().scaling;
  }

  getRotation(): number {
    return this.decompose().rotation;
  }

  getFloatArray(): Float32Array {
    return new Float32Array([
      this.a,
      this.b,
      0,
      this.c,
      this.d,
      0,
      this.tx,
      this.ty,
      1,
    ]);
  }
}
