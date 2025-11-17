attribute vec4 tangent; // usar attribute apenas no vert.glsl

varying vec3 fragPos;
varying vec2 vUV;
varying mat3 TBN;

void main()
{
	vUV = uv;
	mat3 normalMatrix = mat3(transpose(inverse(modelViewMatrix)));
	vec3 T = normalize(vec3(modelViewMatrix * vec4(tangent.xyz, 0.0)));
	vec3 N = normalize(vec3(modelViewMatrix * vec4(normal, 0.0)));
	vec3 B = normalize(vec3(modelViewMatrix * vec4(cross(T, N), 0.0)));
	TBN = (mat3(T, B, N));
	fragPos = vec3(modelViewMatrix * vec4(position, 1.0));
	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
