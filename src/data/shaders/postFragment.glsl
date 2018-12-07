#version 300 es

precision mediump float;

//uniform float size;

out vec4 FragColor;

void main(void) {
	//vec2 colors = gl_FragCoord.xy / size;
	FragColor = vec4(0, 1.0, 0, 1); //vec4(colors.xy, 1, 1);
}

/*
in vec3 v_position;
in vec2 v_uv;
layout(location = 0) out vec4 FragColor;
layout(location = 1) out vec4 EmitColor;
const vec3 u_color			= vec3(0.1,0.775,0.189);
const float u_edgeThickness	= 2.07; //2.00;
const float u_edgeSharpness	= 35.0; //30.0;
const float u_edgeSubtract	= 0.4; //0.3;
const float u_glowStrength	= 4.0; //10.0;

void main(void){
  vec2 uv = abs(v_uv - 0.5) * u_edgeThickness;
  uv = pow(uv, vec2(u_edgeSharpness)) - u_edgeSubtract;

  float c = clamp(uv.x + uv.y, 0.0, 1.0);

  vec3 cc 	= mix(vec3(0.15,0.15,0.15), u_color ,c);

  FragColor	= vec4(cc , 1.0);  ////FragColor	= vec4(u_color * c, 1.0);
  EmitColor	= vec4(u_color * c * u_glowStrength, 1.0);
  return;
}
*/
