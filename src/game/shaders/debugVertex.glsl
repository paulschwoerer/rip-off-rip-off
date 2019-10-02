#version 300 es

in vec2 a_position;
uniform vec2 u_resolution;

void main() {
  // convert from pixels to clipspace
  vec2 zeroToOne = a_position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace , 0, 1);
}