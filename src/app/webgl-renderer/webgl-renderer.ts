import {Context, EventProvider, Invalidate, Renderer} from 'webgl-operate';
import {WebGL2ShaderProgramFactory} from '../shader/webgl2-shader-program-factory';

export class WebGLRenderer extends Renderer {

  private vertexShaderSource = `#version 300 es

// an attribute is an input (in) to a vertex shader.
// It will receive data from a buffer
in vec2 a_position;

// Used to pass in the resolution of the canvas
uniform vec2 u_resolution;

// all shaders have a main function
void main() {

  // convert the position from pixels to 0.0 to 1.0
  vec2 zeroToOne = a_position / u_resolution;

  // convert from 0->1 to 0->2
  vec2 zeroToTwo = zeroToOne * 2.0;

  // convert from 0->2 to -1->+1 (clipspace)
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace * vec2(1, -1), 0, 1);
}
`;

  private fragmentShaderSource = `#version 300 es

precision highp float;

uniform vec4 u_color;

// we need to declare an output for the fragment shader
out vec4 outColor;

void main() {
  outColor = u_color;
}
`;

  uninitialize() {
    super.uninitialize();
    console.log('uninitialized resources of the WebGLRenderer');
  }

  protected onDiscarded(): void {
  }

  protected onFrame(frameNumber: number): void {
    const gl = this.context.gl;

    // Use our boilerplate utils to compile the shaders and link into a program

    const program = WebGL2ShaderProgramFactory.createProgramFromSources(gl,
      this.vertexShaderSource, this.fragmentShaderSource);

    // look up where the vertex data needs to go.
    const positionAttributeLocation = gl.getAttribLocation(program, 'a_position');

    // look up uniform locations
    const resolutionUniformLocation = gl.getUniformLocation(program, 'u_resolution');
    const colorLocation = gl.getUniformLocation(program, 'u_color');

    // Create a buffer
    const positionBuffer = gl.createBuffer();

    // Create a vertex array object (attribute state)
    const vao = gl.createVertexArray();

    // and make it the one we're currently working with
    gl.bindVertexArray(vao);

    // Turn on the attribute
    gl.enableVertexAttribArray(positionAttributeLocation);

    // Bind it to ARRAY_BUFFER (think of it as ARRAY_BUFFER = positionBuffer)
    gl.bindBuffer(gl.ARRAY_BUFFER, positionBuffer);

    // Tell the attribute how to get data out of positionBuffer (ARRAY_BUFFER)
    const size = 2;          // 2 components per iteration
    const type = gl.FLOAT;   // the data is 32bit floats
    const normalize = false; // don't normalize the data
    const stride = 0;        // 0 = move forward size * sizeof(type) each iteration to get the next position
    let offset = 0;        // start at the beginning of the buffer
    gl.vertexAttribPointer(
      positionAttributeLocation, size, type, normalize, stride, offset);

    // Tell WebGL how to convert from clip space to pixels
    gl.viewport(0, 0, gl.drawingBufferWidth, gl.drawingBufferHeight);

    // Clear the canvas
    gl.clearColor(0, 0, 0, 0);
    // tslint:disable-next-line:no-bitwise
    gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

    // Tell it to use our program (pair of shaders)
    gl.useProgram(program);

    // Bind the attribute/buffer set we want.
    gl.bindVertexArray(vao);

    // Pass in the canvas resolution so we can convert from
    // pixels to clipspace in the shader
    gl.uniform2f(resolutionUniformLocation, gl.canvas.width, gl.canvas.height);

    // draw 50 random rectangles in random colors
    for (let ii = 0; ii < 50; ++ii) {
      // Put a rectangle in the position buffer
      this.setRectangle(
        gl, this.randomInt(gl.canvas.width - 290), this.randomInt(gl.canvas.height - 290), this.randomInt(300), this.randomInt(300));

      // Set a random color.
      gl.uniform4f(colorLocation, Math.random(), Math.random(), Math.random(), 1);

      // Draw the rectangle.
      const primitiveType = gl.TRIANGLES;
      offset = 0;
      const count = 6;
      gl.drawArrays(primitiveType, offset, count);
    }
  }

  protected onInitialize(context: Context, callback: Invalidate, eventProvider: EventProvider): boolean {
    if (context.isWebGL2) {
      console.log('WebGL 2.0');
      return true;
    }

    return false;
  }

  protected onPrepare(): void {
  }

  protected onUninitialize(): void {
    console.log('renderer is uninitialized');
  }

  protected onUpdate(): boolean {
    return false;
  }

  // Returns a random integer from 0 to range - 1.
  private randomInt(range: number): number {
    return Math.floor(Math.random() * range);
  }

  // Fill the buffer with the values that define a rectangle.
  private setRectangle(gl, x, y, width, height) {
    const x1 = x;
    const x2 = x + width;
    const y1 = y;
    const y2 = y + height;
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([
      x1, y1,
      x2, y1,
      x1, y2,
      x1, y2,
      x2, y1,
      x2, y2,
    ]), gl.STATIC_DRAW);
  }
}
