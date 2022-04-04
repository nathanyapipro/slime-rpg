import { Material } from "./Material";

export interface SpriteDef {
  imgUrl: string;
  vsSource: string;
  fsSource: string;
}

export class Sprite {
  private gl: WebGL2RenderingContext;
  private material: Material;
  private image: HTMLImageElement;
  private isLoaded: boolean;
  private texture?: WebGLTexture;
  private geoBuffer?: WebGLBuffer;
  constructor(gl: WebGL2RenderingContext, def: SpriteDef) {
    this.gl = gl;
    this.isLoaded = false;

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

  setup() {
    const gl = this.gl;

    gl.useProgram(this.material.program);
    this.texture = gl.createTexture()!;

    gl.bindTexture(gl.TEXTURE_2D, this.texture);
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

    this.geoBuffer = gl.createBuffer()!;
    gl.bindBuffer(gl.ARRAY_BUFFER, this.geoBuffer);
    gl.bufferData(gl.ARRAY_BUFFER, Sprite.createRectArray(), gl.STATIC_DRAW);
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
    |  +             |
    |    +           |
    |      +         |
    |        +       |
    |          +     |
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
}
