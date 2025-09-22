varying vec3 fragPos;

void main()
{
	fragPos = position;
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
