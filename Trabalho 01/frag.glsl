uniform float time;

varying vec3 fragPos;

void main()
{
	float r = length(fragPos.xyy);
    float b = length(fragPos.xzz);

	float R = r * time;
	float G = 0.0;
	float B = b / time;

	if(B < 0.25 || R < 0.25)
	{
		R = R / time;
		B = B * time;
	}
	else
	{
		R = R * time;
		B = B / time;
	}

	gl_FragColor = vec4(R, G, B, 1.0);
}
