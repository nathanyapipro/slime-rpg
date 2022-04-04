import { Material } from "./core/Material";
import { Sprite } from "./core/Sprite";
import * as basicShader from "./shaders/basic";

export interface WebGlEngineDef {
  rootEl: HTMLDivElement;
}

export class WebGlEngine {
  readonly def: WebGlEngineDef;
  private canvasEl: HTMLCanvasElement;
  private lastUpdateTime: number;
  private gl: WebGL2RenderingContext;

  private sprite: Sprite;

  constructor(def: WebGlEngineDef) {
    this.def = def;

    this.stop();

    const prevCanvas = this.def.rootEl.firstElementChild;
    if (prevCanvas === null || prevCanvas.tagName !== "CANVAS") {
      this.canvasEl = document.createElement("canvas");

      this.canvasEl.height = 600;
      this.canvasEl.width = 800;

      this.lastUpdateTime = 0;

      this.def.rootEl.append(this.canvasEl);
    } else {
      this.canvasEl = prevCanvas as HTMLCanvasElement;
    }

    const gl = this.canvasEl.getContext("webgl2");

    if (gl === null) {
      throw new Error("Was not able to create webgl2 context");
    }

    this.gl = gl;
    this.gl.clearColor(0.4, 0.6, 1.0, 1.0);

    this.sprite = new Sprite(this.gl, {
      imgUrl: "/sprites/SlimeWalkSheet.png",
      vsSource: basicShader.vsSource,
      fsSource: basicShader.fsSource,
    });
  }

  start() {
    const step = () => {
      this.update();

      // @ts-ignore
      window.stepFunc = requestAnimationFrame(step);
    };
    step();
  }

  stop() {
    // @ts-ignore
    if (window.stepFunc !== undefined) {
      // @ts-ignore
      window.cancelAnimationFrame(window.stepFunc);
    }
    // @ts-ignore
    window.stepFunc = undefined;
  }

  update() {
    this.gl.viewport(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);

    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.sprite.render();

    this.gl.flush();
  }
}
