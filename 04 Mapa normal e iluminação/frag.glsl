#include <common>
#include <lights_pars_begin>

struct Material
{
	vec3 specular;
	float shininess;
};

uniform Material material;
uniform sampler2D myTexture;
uniform sampler2D normalMap;
uniform vec3 cameraPos;

varying vec2 vUV;
varying vec3 fragPos;
varying vec3 vNormal;

void main()
{
	// vec3 norm = vNormal;
	vec3 norm = normalize(texture2D(normalMap, vUV).rgb * 2.0 - 1.0);
	vec3 diffuse, specular, ambient = ambientLightColor;
	vec3 fragColor;

	// tendo mais de 1, fazer um laço para calcular com todas as luzes
	#if NUM_DIR_LIGHTS > 0

		vec3 lightDir = normalize(directionalLights[0].direction);
		float diff = max(0.0, dot(norm, lightDir));
		diffuse = directionalLights[0].color * diff;

		vec3 cameraDir = normalize(cameraPos - fragPos);
		vec3 reflectDir = reflect(-lightDir, norm);
		float spec = pow(max(dot(cameraDir, reflectDir), 0.0), material.shininess);
		specular = material.specular * spec * directionalLights[0].color;

		fragColor = ambient + diffuse + specular;

	#endif

	vec4 tex = texture2D(myTexture, vUV);
	gl_FragColor = tex * vec4(fragColor, 1.0);
}
