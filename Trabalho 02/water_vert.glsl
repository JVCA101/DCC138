uniform float time;
uniform float noiseMultiplier;
uniform vec3 cameraPos;

varying vec3 fragPos;
varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 viewDir;

// Based on https://thebookofshaders.com/13/
float pseudo_random(in vec2 v)
{
    float mul     = dot(v, vec2(11.676767, 57.96666));
    float mul_sin = sin(mul);

    // retorna a parte fracionária da multiplicação
    return fract(mul_sin * 36729.1208391);
}

float noise(in vec2 v)
{
    vec2 int_part      = floor(v);
    vec2 fraction_part = fract(v);

    // 2D tile
    float point00 = pseudo_random(int_part);
    float point10 = pseudo_random(int_part + vec2(1.0, 0.0));
    float point01 = pseudo_random(int_part + vec2(0.0, 1.0));
    float point11 = pseudo_random(int_part + vec2(1.0, 1.0));

    vec2 interp_f = smoothstep(0., 1., fraction_part);

    float outpart1 = mix(point00, point10, interp_f.x);
    float outpart2 = (point01 - point00) * interp_f.y * (1.0 - interp_f.x);
    float outpart3 = (point11 - point10) * interp_f.x * interp_f.y;

    return outpart1 + outpart2 + outpart3;
}

// Fractional Brownian Motion
#define OCTAVES 32
float fbm(in vec2 v)
{
    float value      = 0.0000000;
    float amplitude  = 0.5000000;

    // soma a amplitude*ruído ao valor a cada oitava de onda
    int i;
    for(i=0; i < OCTAVES; i++)
    {
        value     += amplitude * noise(v);
        v         *= 2.0000000;
        amplitude *= 0.5000000;
    }

    return value;
}




void main()
{
    // create 3 waves to create a more realistic effect
	vUV                    = uv;
    vec2  texCoord         = vUV * noiseMultiplier + time * 0.1;
    float wave1            = fbm(texCoord);
    float wave2            = fbm(texCoord + vec2(0.01, 0.00));
    float wave3            = fbm(texCoord + vec2(0.00, 0.01));
    vec3  displaced_normal = normalize(vec3(wave1 - wave2, wave1 - wave3, 0.1));

    // values to be passed to water_frag.glsl
	fragPos   = vec3(modelMatrix * vec4(position, 1.0));
    vNormal   = normalize(normalMatrix * displaced_normal);
    vec3 pos  = position;
    pos.z    += wave1;
    vWorldPos = (modelMatrix * vec4(pos, 1.0)).xyz;
	viewDir   = normalize(cameraPos - fragPos);

	gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
}
