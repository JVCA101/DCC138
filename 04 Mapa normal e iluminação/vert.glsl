varying vec3 fragPos;
varying vec2 vUV;
varying vec3 vNormal;

void main()
{
	vNormal = normalize(normal);
	fragPos = vec3(modelMatrix * vec4(position, 1.0));
	vUV = uv;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
