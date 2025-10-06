uniform float time;
uniform sampler2D myTexture;
uniform sampler2D secondTexture;

varying vec2 vUV; // varying UV
varying vec2 vUV2; // varying UV2

vec3 hsv2rgb(vec3 c)
{
	vec4 K = vec4(1.0, 2.0 / 3.0, 1.0 / 3.0, 3.0);
	vec3 p = abs(fract(c.xxx + K.xyz) * 6.0 - K.www);
	return c.z * mix(K.xxx, clamp(p - K.xxx, 0.0, 1.0), c.y);
}

void main()
{
	vec4 tex1    = texture2D(myTexture    , vUV);
	vec4 tex2    = texture2D(secondTexture, vUV2);

	vec3 rainbow  = hsv2rgb(vec3(time, 1.0, 1.0));
	vec3 rainbow2 = hsv2rgb(vec3(time, 1.0, 1.0));

	gl_FragColor = mix(tex1 * vec4(rainbow, 1.0), tex2 * vec4(rainbow2, 1.0), time);
}
