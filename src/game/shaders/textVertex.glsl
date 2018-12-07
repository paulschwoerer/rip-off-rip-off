#version 300 es

in vec2 a_position;
uniform vec2 u_resolution;
uniform vec2 u_translation;
uniform float u_size;
uniform vec4 u_color;

out vec4 v_color;

void main() {
  v_color = u_color;

  vec2 position = (a_position * vec2(u_size)) + u_translation;

  // convert from pixels to clipspace
  vec2 zeroToOne = position / u_resolution;
  vec2 zeroToTwo = zeroToOne * 2.0;
  vec2 clipSpace = zeroToTwo - 1.0;

  gl_Position = vec4(clipSpace , 0, 1);
}
