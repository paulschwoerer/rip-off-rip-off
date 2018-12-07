#version 300 es
precision mediump float;
     
uniform sampler2D u_texture;
     
in vec2 v_texCoord;
     
out vec4 outColor;
     
void main() {
  vec4 color = texture(u_texture, v_texCoord);

  float brightness = dot(color.rgb, vec3(0.2126, 0.7152, 0.0722));

  if (brightness > 0.1) {
    outColor = vec4(color.rgb, 1);
  } else {
    outColor = vec4(0, 0, 0, 1);
  }
}