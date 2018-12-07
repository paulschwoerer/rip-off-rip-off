#version 300 es
precision mediump float;
     
uniform sampler2D u_scene;
uniform sampler2D u_blur;

in vec2 v_texCoord;
     
out vec4 outColor;
     
void main() {
   const float gamma = 2.2;

   vec3 hdrColor = texture(u_scene, v_texCoord).rgb;
   vec3 bloomColor = texture(u_blur, v_texCoord).rgb;
   hdrColor += bloomColor; // additive blending
   // tone mapping
   vec3 result = vec3(1.0) - exp(-hdrColor * 0.2);
   // also gamma correct while we're at it
   result = pow(result, vec3(1.0 / gamma));

   outColor = vec4(result, 1.0);
}