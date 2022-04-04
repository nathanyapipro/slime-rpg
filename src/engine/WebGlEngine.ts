import { Material } from "./core/Material";
import { Sprite } from "./core/Sprite";
import * as basicShader from "./shaders/basic";

export interface WebGlEngineDef {
  rootEl: HTMLDivElement;
}

export class WebGlEngine {
  readonly def: WebGlEngineDef;
  private canvasEl: HTMLCanvasElement;
  private stepFunc: undefined | number;
  private lastUpdateTime: number;
  private gl: WebGL2RenderingContext;

  constructor(def: WebGlEngineDef) {
    this.def = def;

    const prevCanvas = this.def.rootEl.firstElementChild;
    if (prevCanvas === null || prevCanvas.tagName !== "CANVAS") {
      this.canvasEl = document.createElement("canvas");

      this.canvasEl.height = 600;
      this.canvasEl.width = 800;

      this.stepFunc = undefined;
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

    const sprite = new Sprite(this.gl, {
      imgUrl: "/sprites/SlimeWalkSheet.png",
      vsSource: basicShader.vsSource,
      fsSource: basicShader.fsSource,
    });
  }

  start() {
    const step = () => {
      this.update();
      this.stepFunc = requestAnimationFrame(step);
    };
    step();
  }

  stop() {
    if (this.stepFunc !== undefined) {
      window.cancelAnimationFrame(this.stepFunc);
    }
    this.stepFunc = undefined;
  }

  update() {
    this.gl.viewport(0, 0, this.canvasEl.width, this.canvasEl.height);
    this.gl.clear(this.gl.COLOR_BUFFER_BIT);
    this.gl.enable(this.gl.BLEND);
    this.gl.blendFunc(this.gl.SRC_ALPHA, this.gl.ONE_MINUS_SRC_ALPHA);

    this.gl.flush();
  }
}
