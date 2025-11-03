uniform sampler2D myTexture;
varying vec2 vUV;

void main()
{
	vec4 tex = texture2D(myTexture, vUV);
	gl_FragColor = tex;
}
