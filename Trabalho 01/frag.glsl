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
	float r = length(fragPos.xyy);
	// float g = length(fragPos.yyx);
    float b = length(fragPos.xzz);

	float R = time*r;
	float B = b/time;
	float G = 0.0;

	bool change_direction = B < 0.25 || R < 0.25;

	if(change_direction)
	{
		// G = 1.0;
		R = R/time;
		B = B*time;
	}
	else
	{
		G = 0.0;
		R = R*time;
		B = B/time;
	}

	// float r2 = 1.0 - length(fragPos.xyy - vec3( 0.5,  0.25, 0.0));
	// float g2 = 1.0 - length(fragPos.xyy - vec3(-0.5, -0.25, 0.0));
	// float b2 = 1.0 - length(fragPos.xyy - vec3( 0.5, -0.25, 0.0));

	// gl_FragColor = vec4(hsv2rgb(vec3((r + g + b) + time, time, time)), 1.0);
	// if(change_direction)
	// 	gl_FragColor = vec4(time*r, 0.0, b*time, 1.0);
	// else

	gl_FragColor = vec4(R, G, B, 1.0);

	// gl_FragColor = mix(vec4(hsv2rgb(vec3(r+time, g+time, b+time)), 1.0), vec4(hsv2rgb(vec3(r2+time, g2+time, b2+time)), 1.0), 1.0);
}
