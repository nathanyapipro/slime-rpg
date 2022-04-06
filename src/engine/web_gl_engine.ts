import { Sprite } from "./core/sprite";
import * as basicShader from "./shaders/basic";
import { Matrix3, Vector2 } from "./utils";

export interface WebGlEngineDef {
  rootEl: HTMLDivElement;
}

export class WebGlEngine {
  readonly def: WebGlEngineDef;
  private canvasEl: HTMLCanvasElement;
  private lastUpdateTime: number;
  private gl: WebGL2RenderingContext;
  public worldSpaceMatrix: Matrix3;

  private spritePosition: Vector2;
  private spriteFrame: Vector2;

  private sprite: Sprite;

  constructor(def: WebGlEngineDef) {
    this.def = def;

    const { gl, canvasEl } = this.initialize();
    this.gl = gl;
    this.canvasEl = canvasEl;

    window.addEventListener("resize", () => {
      this.resize(window.innerWidth, window.innerHeight);
    });

    this.canvasEl = canvasEl;

    this.worldSpaceMatrix = new Matrix3();
    this.resize(this.def.rootEl.clientWidth, this.def.rootEl.clientHeight);

    this.sprite = new Sprite(this.gl, {
      imgUrl: "/sprites/SlimeWalkSheet.png",
      vsSource: basicShader.vsSource,
      fsSource: basicShader.fsSource,
      options: {
        height: 32,
        width: 32,
      },
    });

    this.spritePosition = new Vector2();
    this.spriteFrame = new Vector2();
  }

  private initialize() {
    this.stop();

    let canvasEl: HTMLCanvasElement | undefined;
    const prevCanvas = this.def.rootEl.firstElementChild;
    if (prevCanvas === null || prevCanvas.tagName !== "CANVAS") {
      canvasEl = document.createElement("canvas");

      canvasEl.height = 600;
      canvasEl.width = 800;

      this.lastUpdateTime = 0;

      this.def.rootEl.append(canvasEl);
    } else {
      canvasEl = prevCanvas as HTMLCanvasElement;
    }

    const gl = canvasEl.getContext("webgl2");

    if (gl === null) {
      throw new Error("Was not able to create webgl2 context");
    }

    gl.clearColor(0.4, 0.6, 1.0, 1.0);

    return { gl, canvasEl };
  }

  public start() {
    this.loop();
  }

  private loop() {
    this.update();
    // @ts-ignore
    window.stepFunc = requestAnimationFrame(this.loop.bind(this));
  }

  public stop() {
    // @ts-ignore
    if (window.stepFunc !== undefined) {
      // @ts-ignore
      window.cancelAnimationFrame(window.stepFunc);
    }
    // @ts-ignore
    window.stepFunc = undefined;
  }

  private resize(width: number, height: number) {
    this.canvasEl.width = width;
    this.canvasEl.height = height;

    // identity
    this.worldSpaceMatrix = new Matrix3();

    // move topLeft
    this.worldSpaceMatrix.setTranslation(-1, 1);

    // scale
    const wRatio = width / (height / 240);
    this.worldSpaceMatrix.scale(2 / wRatio, -2 / 240);
  }

  private update() {
    this.gl.viewport(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.spriteFrame.x = (new Date().getTime() * 0.006) % 6;
    this.spriteFrame.y = 1; //(new Date().getTime() * 0.001) % 4;

    this.spritePosition.x = (this.spritePosition.x + 0.3) % 256;

    this.sprite.render({
      position: this.spritePosition,
      frame: this.spriteFrame,
    });

    this.gl.flush();
  }
}
