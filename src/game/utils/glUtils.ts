import Vector2f from '@/game/utils/Vector2f';

export interface RenderTarget {
  buffer : WebGLFramebuffer | null;
  texture : WebGLTexture | null;
}

export const createShader = (gl : WebGLRenderingContext, type : number, source : string) : WebGLShader | null => {
  const shader = gl.createShader(type);

  if (!shader) {
    return null;
  }

  gl.shaderSource(shader, source);
  gl.compileShader(shader);

  if (gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    return shader;
  }

  console.warn(`Error for shader ${source}`);
  console.error(gl.getShaderInfoLog(shader));
  gl.deleteShader(shader);

  return null;
};

export const createProgram = (gl : WebGLRenderingContext, vertexShaderSource: string, fragmentShaderSource: string) : WebGLProgram | null => {
  const program = gl.createProgram();
  const shader1 = createShader(gl, gl.VERTEX_SHADER, vertexShaderSource);
  const shader2 = createShader(gl, gl.FRAGMENT_SHADER, fragmentShaderSource);

  if (!program || !shader1 || !shader2) {
    return null;
  }

  gl.attachShader(program, shader1);
  gl.attachShader(program, shader2);
  gl.linkProgram(program);

  if (gl.getProgramParameter(program, gl.LINK_STATUS)) {
    return program;
  }

  console.error(gl.getProgramInfoLog(program));
  gl.deleteProgram(program);

  return null;
};

export const resizeCanvasToDisplaySize = (canvas : HTMLCanvasElement) : void => {
  // Lookup the size the browser is displaying the canvas.
  const displayWidth = canvas.clientWidth;
  const displayHeight = canvas.clientHeight;

  // Check if the canvas is not the same size.
  if (canvas.width !== displayWidth || canvas.height !== displayHeight) {
    // Make the canvas the same size
    canvas.width = displayWidth;
    canvas.height = displayHeight;
  }
};

export const createRenderTarget = (gl : WebGLRenderingContext, size : Vector2f) : RenderTarget => {
  const buffer = gl.createFramebuffer();
  const texture = createTexture(gl, size);

  gl.bindFramebuffer(gl.FRAMEBUFFER, buffer);
  gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, texture, 0);
  gl.bindFramebuffer(gl.FRAMEBUFFER, null);

  return {
    texture,
    buffer
  };
};

export const createTexture = (gl : WebGLRenderingContext, size : Vector2f) => {
  const texture = gl.createTexture();
  //set properties for the texture
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.NEAREST);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.NEAREST);

  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, size.x, size.y, 0, gl.RGBA, gl.UNSIGNED_BYTE, null);

  return texture;
};
