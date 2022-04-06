import { Matrix3, Vector2 } from "../utils";
import { Material } from "./material";

export interface SpriteDef {
  imgUrl: string;
  vsSource: string;
  fsSource: string;
  options?: {
    width?: number;
    height?: number;
  };
}

export class Sprite {
  private gl: WebGL2RenderingContext;
  private material: Material;
  private image: HTMLImageElement;
  private isLoaded: boolean;
  private glTexture?: WebGLTexture;
  private geoBuffer?: WebGLBuffer;
  private texBuffer?: WebGLBuffer;
  private size: Vector2;
  private uv?: Vector2;

  constructor(gl: WebGL2RenderingContext, def: SpriteDef) {
    this.gl = gl;
    this.isLoaded = false;

    this.size = new Vector2(64, 64);

    if (def.options?.width !== undefined) {
      this.size.x = def.options.width;
    }
    if (def.options?.height !== undefined) {
      this.size.y = def.options.height;
    }

    this.material = new Material(gl, {
      fsSource: def.fsSource,
      vsSource: def.vsSource,
    });

    this.image = new Image();
    this.image.src = def.imgUrl;

    this.image.onload = () => {
      this.setup();
    };
  }

  static createRectArray(
    params: {
      x: number;
      y: number;
      width: number;
      height: number;
    } = {
      x: 0,
      y: 0,
      width: 1,
      height: 1,
    }
  ) {
    const { x, y, width, height } = params;
    // create 2 triangles (6 vertices)
    /*
    (x, y+h)-----(x+w,y+h)
    +                |
    |  +       2     |
    |    +           |
    |      +         |
    |        +       |
    |   1      +     |
    |            +   |
    (x,y)-------- (x+w,y)
    */
    // prettier-ignore
    return new Float32Array([
      x, y,
      x+width, y,
      x, y+height,
      x, y+height,
      x+width, y,
      x+width, y+height
    ]);
  }

  setup() {
    const gl = this.gl;

    gl.useProgram(this.material.program);
    this.glTexture = gl.createTexture()!;

    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.MIRRORED_REPEAT);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.MIRRORED_REPEAT);

    // pixelated filter (could use interpolation/bilinear here)
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);

    gl.texImage2D(
      gl.TEXTURE_2D,
      0,
      gl.RGBA,
      gl.RGBA,
      gl.UNSIGNED_BYTE,
      this.image
    );

    gl.bindTexture(gl.TEXTURE_2D, null);

    // convert to 0-1 range
    const uvX = this.size.x / this.image.width;
    const uvY = this.size.y / this.image.height;
    this.uv = new Vector2(uvX, uvY);

    // texture
    this.texBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      Sprite.createRectArray({
        x: 0,
        y: 0,
        width: this.uv.x,
        height: this.uv.y,
      }),
      gl.STATIC_DRAW
    );

    // geometry
    this.geoBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geoBuffer);
    gl.bufferData(
      gl.ARRAY_BUFFER,
      Sprite.createRectArray({
        x: 0,
        y: 0,
        width: this.size.x,
        height: this.size.y,
      }),
      gl.STATIC_DRAW
    );

    gl.useProgram(null);

    this.isLoaded = true;
  }

  render(params: { position: Vector2; frame: Vector2 }) {
    const gl = this.gl;
    if (
      this.isLoaded === false ||
      this.uv === undefined ||
      this.glTexture === undefined ||
      this.texBuffer === undefined ||
      this.geoBuffer === undefined
    ) {
      return;
    }

    const worldSpace = window.engine.worldSpaceMatrix;
    const { position, frame } = params;

    const frameX = Math.floor(frame.x) * this.uv.x;
    const frameY = Math.floor(frame.y) * this.uv.y;

    const objectMatrix = new Matrix3();
    objectMatrix.translateByVector(position);

    gl.useProgram(this.material.program);

    gl.activeTexture(gl.TEXTURE0);
    gl.bindTexture(gl.TEXTURE_2D, this.glTexture);
    this.material.setParameter("u_image", 0);

    // add texture buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.texBuffer);
    this.material.setParameter("a_texCoord");

    // add geo buffer
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geoBuffer);
    this.material.setParameter("a_position");

    this.material.setParameter("u_frame", frameX, frameY);
    this.material.setParameter("u_world", worldSpace.getFloatArray());
    this.material.setParameter("u_object", objectMatrix.getFloatArray());

    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 6);

    gl.useProgram(null);
  }
}
