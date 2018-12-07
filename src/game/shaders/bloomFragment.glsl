#version 300 es
precision mediump float;

out vec4 outColor;

in vec2 v_texCoord;

uniform sampler2D u_texture;

uniform int u_horizontal;
uniform float u_weight[5];

float rand(vec2 co){
    return fract(sin(dot(co.xy, vec2(12.9898,78.233))) * 43758.5453);
}

void main()
{
    vec2 tex_offset = vec2(1) / vec2(textureSize(u_texture, 0));
    vec3 result = texture(u_texture, v_texCoord).rgb * u_weight[0];
    if(u_horizontal == 1)
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(u_texture, v_texCoord + vec2(tex_offset.x * float(i), 0.0)).rgb * u_weight[i];
            result += texture(u_texture, v_texCoord - vec2(tex_offset.x * float(i), 0.0)).rgb * u_weight[i];
        }
    }
    else
    {
        for(int i = 1; i < 5; ++i)
        {
            result += texture(u_texture, v_texCoord + vec2(0.0, tex_offset.y * float(i))).rgb * u_weight[i];
            result += texture(u_texture, v_texCoord - vec2(0.0, tex_offset.y * float(i))).rgb * u_weight[i];
        }
    }

    outColor = vec4(result.r * 0.8, result.g, result.b, 1.0);
}