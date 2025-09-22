uniform float time;

varying vec3 fragPos;

vec3 hsv2rgb(vec3 c)
{
    vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
    vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
    return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main()
{
	float r = 1.0 - length(fragPos.xy - vec2(0.0, 0.433));
	float g = 1.0 - length(fragPos.xy - vec2(-0.5, -0.433));
	float b = 1.0 - length(fragPos.xy - vec2(0.5, -0.433));

	if(fragPos.x > 0.0)
		gl_FragColor = vec4(hsv2rgb(vec3(time, 1.0, 1.0)), 1.0);
	else
		gl_FragColor = vec4(vec3(r, g, b), 1.0);
}
