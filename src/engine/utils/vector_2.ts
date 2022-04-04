export interface ReadonlyVector2 {
  clone: () => Vector2;
  readonly x: number;
  readonly y: number;
  getWidth: () => number;
  getHeight: () => number;
}

export class Vector2 {
  static lerpVectors(
    v1: Vector2 | ReadonlyVector2,
    v2: Vector2 | ReadonlyVector2,
    alpha: number
  ): Vector2 {
    return Vector2.subVectors(v2, v1).multiplyScalar(alpha).add(v1);
  }

  static addVectors(
    a: Vector2 | ReadonlyVector2,
    b: Vector2 | ReadonlyVector2
  ): Vector2 {
    return new Vector2(a.x + b.x, a.y + b.y);
  }

  static subVectors(
    a: Vector2 | ReadonlyVector2,
    b: Vector2 | ReadonlyVector2
  ): Vector2 {
    return new Vector2(a.x - b.x, a.y - b.y);
  }

  static isEqual(
    a: Vector2 | ReadonlyVector2,
    b: Vector2 | ReadonlyVector2
  ): boolean {
    return a.x === b.x && a.y === b.y;
  }

  public x: number;
  public y: number;

  constructor(x: number = 0, y: number = 0) {
    this.x = x;
    this.y = y;
  }

  getWidth(): number {
    return this.x;
  }
  setWidth(value: number) {
    this.x = value;
  }
  getHeight() {
    return this.y;
  }
  setHeight(value: number) {
    this.y = value;
  }

  isEmpty() {
    return this.x === 0 && this.y === 0;
  }

  set(x: number, y: number): this {
    this.x = x;
    this.y = y;
    return this;
  }

  setScalar(scalar: number): void {
    this.x = scalar;
    this.y = scalar;
  }

  negate(): void {
    this.x = -this.x;
    this.y = -this.y;
  }

  setX(x: number): void {
    this.x = x;
  }
  setY(y: number): void {
    this.y = y;
  }

  clone(): Vector2 {
    return new Vector2(this.x, this.y);
  }

  copy(v: Vector2 | ReadonlyVector2): this {
    this.x = v.x;
    this.y = v.y;
    return this;
  }

  add(v: Vector2 | ReadonlyVector2): this {
    this.x += v.x;
    this.y += v.y;
    return this;
  }

  addScalar(s: number): void {
    this.x += s;
    this.y += s;
  }

  addScalars(x: number, y: number): this {
    this.x += x;
    this.y += y;
    return this;
  }

  min(v: Vector2 | ReadonlyVector2): void {
    this.x = Math.min(this.x, v.x);
    this.y = Math.min(this.y, v.y);
  }

  max(v: Vector2 | ReadonlyVector2): void {
    this.x = Math.max(this.x, v.x);
    this.y = Math.max(this.y, v.y);
  }

  subVectors(a: Vector2, b: Vector2): void {
    this.x = a.x - b.x;
    this.y = a.y - b.y;
  }

  sub(vector: Vector2 | ReadonlyVector2): this {
    this.x -= vector.x;
    this.y -= vector.y;
    return this;
  }

  subScalars(x: number, y: number): this {
    this.x -= x;
    this.y -= y;
    return this;
  }

  multiply(vector: Vector2 | ReadonlyVector2): this {
    this.x *= vector.x;
    this.y *= vector.y;

    return this;
  }

  multiplyScalar(scalar: number): this {
    this.x *= scalar;
    this.y *= scalar;
    return this;
  }

  divideScalar(scalar: number): this {
    return this.multiplyScalar(1 / scalar);
  }

  clamp(min: Vector2 | ReadonlyVector2, max: Vector2 | ReadonlyVector2): this {
    this.x = Math.max(min.x, Math.min(max.x, this.x));
    this.y = Math.max(min.y, Math.min(max.y, this.y));
    return this;
  }

  clampLength(min: number, max: number): void {
    const length: number = this.length();
    this.multiplyScalar(Math.max(min, Math.min(max, length)) / length);
  }

  length(): number {
    return Math.sqrt(this.x * this.x + this.y * this.y);
  }

  normalize(): this {
    this.divideScalar(this.length());
    return this;
  }

  angle(): number {
    let angle = Math.atan2(this.y, this.x);

    if (angle < 0) {
      angle += 2 * Math.PI;
    }

    return angle;
  }

  cross(vector: Vector2 | ReadonlyVector2): number {
    return this.x * vector.y - this.y * vector.x;
  }

  dot(vector: Vector2 | ReadonlyVector2): number {
    return this.x * vector.x + this.y * vector.y;
  }

  lengthSq(): number {
    return this.x * this.x + this.y * this.y;
  }

  distanceTo(v: Vector2 | ReadonlyVector2): number {
    return Math.sqrt(this.distanceToSquared(v));
  }

  distanceToSquared(vector: Vector2 | ReadonlyVector2): number {
    const dx = this.x - vector.x;
    const dy = this.y - vector.y;
    return dx * dx + dy * dy;
  }

  lerp(vector: Vector2 | ReadonlyVector2, alpha: number): void {
    this.x += (vector.x - this.x) * alpha;
    this.y += (vector.y - this.y) * alpha;
  }
}
