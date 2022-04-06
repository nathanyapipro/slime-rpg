export interface MaterialDef {
  vsSource: string;
  fsSource: string;
}

type ShaderUniformParameter = {
  name: string;
  isUniform: true;
  location: WebGLUniformLocation;
  type: WebGLActiveInfo["type"];
};

type ShaderAttributeParameter = {
  name: string;
  isUniform: false;
  location: number;
  type: WebGLActiveInfo["type"];
};

export class Material {
  private gl: WebGL2RenderingContext;
  public program: WebGLProgram;
  private parameters: Record<
    string,
    ShaderUniformParameter | ShaderAttributeParameter
  >;

  constructor(gl: WebGL2RenderingContext, def: MaterialDef) {
    this.gl = gl;
    this.parameters = {};

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

    this.gatherParameters();

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

  gatherParameters() {
    const gl = this.gl;

    // get uniform params
    const uniformsCount = gl.getProgramParameter(
      this.program,
      gl.ACTIVE_UNIFORMS
    ) as number;

    for (let i = 0; i < uniformsCount; i++) {
      const details = gl.getActiveUniform(this.program, i);
      if (details === null) {
        continue;
      }
      const { name, type } = details;
      const location = gl.getUniformLocation(this.program, name);

      if (location === null) {
        continue;
      }

      this.parameters[name] = {
        name,
        type,
        location,
        isUniform: true,
      };
    }

    // get attribute params
    const attributeCount = gl.getProgramParameter(
      this.program,
      gl.ACTIVE_ATTRIBUTES
    ) as number;

    for (let i = 0; i < attributeCount; i++) {
      const details = gl.getActiveAttrib(this.program, i);
      if (details === null) {
        continue;
      }
      const { name, type } = details;
      const location = gl.getAttribLocation(this.program, name);

      this.parameters[name] = {
        name,
        type,
        location,
        isUniform: false,
      };
    }
  }

  setParameter(name: string, ...args: Array<any>) {
    const gl = this.gl;
    const parameter = this.parameters[name];

    let a = args[0];
    let b = args[1];
    let c = args[2];
    let d = args[3];

    if (parameter === undefined) {
      throw new Error(`Parameter nor found ${name}`);
    }

    if (parameter.isUniform) {
      switch (parameter.type) {
        case gl.FLOAT: {
          gl.uniform1f(parameter.location, a);
          break;
        }
        case gl.FLOAT_VEC2: {
          gl.uniform2f(parameter.location, a, b);
          break;
        }
        case gl.FLOAT_VEC3: {
          gl.uniform3f(parameter.location, a, b, c);
          break;
        }
        case gl.FLOAT_VEC4: {
          gl.uniform4f(parameter.location, a, b, c, d);
          break;
        }
        case gl.FLOAT_MAT3: {
          gl.uniformMatrix3fv(parameter.location, false, a);
          break;
        }
        case gl.FLOAT_MAT4: {
          gl.uniformMatrix4fv(parameter.location, false, a);
          break;
        }
        case gl.SAMPLER_2D: {
          gl.uniform1i(parameter.location, a);
          break;
        }
        default: {
          throw new Error(
            `Uniform Parameter (${parameter.name}) of type: ${parameter.type} is not supported`
          );
        }
      }
    } else {
      // type of variable
      if (a === undefined) {
        a = gl.FLOAT;
      }

      // normalization
      if (b === undefined) {
        b = false;
      }

      // stride
      if (c === undefined) {
        c = 0;
      }

      // offset
      if (d === undefined) {
        d = 0;
      }

      gl.enableVertexAttribArray(parameter.location);
      switch (parameter.type) {
        case gl.FLOAT: {
          gl.vertexAttribPointer(parameter.location, 1, a, b, c, d);
          break;
        }
        case gl.FLOAT_VEC2: {
          gl.vertexAttribPointer(parameter.location, 2, a, b, c, d);
          break;
        }
        case gl.FLOAT_VEC3: {
          gl.vertexAttribPointer(parameter.location, 3, a, b, c, d);
          break;
        }
        case gl.FLOAT_VEC4: {
          gl.vertexAttribPointer(parameter.location, 4, a, b, c, d);
          break;
        }

        default: {
          throw new Error(
            `Attribute Parameter (${parameter.name}) of type: ${parameter.type} is not supported`
          );
        }
      }
    }
  }
}
