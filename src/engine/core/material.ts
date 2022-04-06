import { getLinkUtilityClass } from "@mui/material";

export interface MaterialDef {
  vsSource: string;
  fsSource: string;
}

export class Material {
  private gl: WebGL2RenderingContext;
  public program: WebGLProgram;
  constructor(gl: WebGL2RenderingContext, def: MaterialDef) {
    this.gl = gl;

    const vsShader = this.getShader({
      source: def.vsSource,
      type: this.gl.VERTEX_SHADER,
    });

    const fsShader = this.getShader({
      source: def.fsSource,
      type: this.gl.FRAGMENT_SHADER,
    });

    this.program = gl.createProgram()!;
    gl.attachShader(this.program, vsShader);
    gl.attachShader(this.program, fsShader);
    gl.linkProgram(this.program);

    if (!gl.getProgramParameter(this.program, gl.LINK_STATUS)) {
      throw new Error(
        `Cannot load shader ${gl.getProgramInfoLog(this.program)}`
      );
    }

    gl.detachShader(this.program, vsShader);
    gl.detachShader(this.program, fsShader);
    gl.deleteShader(vsShader);
    gl.deleteShader(fsShader);

    gl.useProgram(null);
  }

  getShader(params: { source: string; type: number }): WebGLShader {
    const { source, type } = params;
    const gl = this.gl;

    const output = gl.createShader(type)!;
    gl.shaderSource(output, source);
    gl.compileShader(output);

    if (!gl.getShaderParameter(output, gl.COMPILE_STATUS)) {
      throw new Error(
        `Shader compilation error ${gl.getShaderInfoLog(output)}`
      );
    }

    return output;
  }
}
