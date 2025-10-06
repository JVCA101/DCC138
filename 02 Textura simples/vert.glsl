uniform float time;

varying vec2 vUV;
varying vec2 vUV2;

void main()
{
	vUV  = vec2(-uv.x + time, uv.y + sin((time * 5.0 + uv.x * 3.0) * 6.28) / 20.0);
	vUV2 = vec2(uv.x + time, uv.y + sin((time * 5.0 + uv.x * 3.0) * 6.28) / 20.0);

	// maior multiplicador em vUV.x, aumenta a frequencia de onda
	// maior multiplicador em time, aumenta a velocidade
	// maior divisor do sin, diminui a distorção
	// vUV.y += sin((time * 5.0 + vUV.x * 3.0) * 6.28) / 20.0;

	gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
}
