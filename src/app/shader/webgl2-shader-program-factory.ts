/**
 * The <b>WebGL2ShaderProgramFactory</b> creates shader instances and compiles shader programs.
 */
export class WebGL2ShaderProgramFactory {

  /**
   * Creates a shader program from a pair of shader source strings (vertex and fragment shader)
   *
   * @param gl the WebGL 2 rendering context
   * @param vertexShaderSource the source code of an ES 3.0 vertex shader (code begins with #version 300 es)
   * @param fragmentShaderSource the source code of an ES 3.0 fragment shader (code begins with #version 300 es)
   */
  public static createProgramFromSources(gl: WebGL2RenderingContext,
                                         vertexShaderSource: string,
                                         fragmentShaderSource: string): WebGLProgram {
    const program = gl.createProgram();

    const vertexShader = this.createShader(gl, vertexShaderSource, gl.VERTEX_SHADER);
    const fragmentShader = this.createShader(gl, fragmentShaderSource, gl.FRAGMENT_SHADER);

    gl.attachShader(program, vertexShader);
    gl.attachShader(program, fragmentShader);
    gl.linkProgram(program);
    const success = gl.getProgramParameter(program, gl.LINK_STATUS);
    if (success) {
      return program;
    }

    console.log(gl.getProgramInfoLog(program));
    gl.deleteProgram(program);
  }

  /**
   * Creates a WebGLShader instance for a given context
   *
   * @param gl the WebGL 2 rendering context
   * @param sourceCode the source code of an ES 3.0 shader (code begins with #version 300 es)
   * @param type GLenum.VERTEX_SHADER or GLenum.FRAGMENT_SHADER
   * @throws an error with addition information, if the shader program did not compile
   */
  public static createShader(gl: WebGL2RenderingContext, sourceCode: string, type: GLenum): WebGLShader {
    // Compiles either a shader of type GLenum.VERTEX_SHADER or GLenum.FRAGMENT_SHADER
    const shader = gl.createShader(type);
    gl.shaderSource(shader, sourceCode);
    gl.compileShader(shader);

    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
      const info = gl.getShaderInfoLog(shader);
      throw new Error('Could not compile WebGL 2 program. \n\n' + info);
    }

    return shader;
  }
}
