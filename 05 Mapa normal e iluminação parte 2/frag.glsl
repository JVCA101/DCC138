#include <common>
#include <lights_pars_begin>

struct Material
{
	vec3 specular;
	float shininess;
};

uniform sampler2D myTexture;
uniform sampler2D normalMap;
uniform vec3 cameraPos;
uniform Material material;

varying vec2 vUV;
varying vec3 fragPos;
varying mat3 TBN;

void main()
{
	vec3 ambient = ambientLightColor, phong = vec3(0.0);
	vec3 lightDir, viewDir, reflectDir;	
	float diff, spec, dist, att;
	vec3 normal = normalize(TBN * (texture2D(normalMap, vUV).rgb * 2.0 - 1.0));

	// #if NUM_DIR_LIGHTS > 0

	// 	// diffuse
	// 	lightDir = normalize(-directionalLights[0].direction);
	// 	diff = max(0.0, dot(normal, lightDir));
	// 	phong += directionalLights[0].color * diff;

	// 	// specular
	// 	viewDir = normalize(cameraPos - fragPos);
	// 	reflectDir = reflect(-lightDir, normal);
	// 	spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
	// 	phong += material.specular * spec * directionalLights[0].color;

	// #endif

	#if NUM_POINT_LIGHTS > 0

		dist = length(pointLights[0].position - fragPos);
		att  = getDistanceAttenuation(dist, pointLights[0].distance, pointLights[0].decay);

		// diffuse
		lightDir = normalize(pointLights[0].position - fragPos);
		diff = max(0.0, dot(normal, lightDir));
		phong += pointLights[0].color * diff * att;

		// specular
		viewDir = normalize(cameraPos - fragPos);
		reflectDir = reflect(-lightDir, normal);
		spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
		phong += material.specular * spec * pointLights[0].color * att;

	#endif

	#if NUM_SPOT_LIGHTS > 0

		lightDir = normalize(spotLights[0].position - fragPos);
		dist = length(spotLights[0].position - fragPos);

		// attenuation
		att  = getDistanceAttenuation(dist, spotLights[0].distance, spotLights[0].decay);
		att *= getSpotAttenuation(spotLights[0].coneCos, spotLights[0].penumbraCos, dot(lightDir, spotLights[0].direction));

		// diffuse
		diff = max(0.0, dot(normal, lightDir));
		phong += spotLights[0].color * diff * att;

		// specular
		viewDir = normalize(cameraPos - fragPos);
		reflectDir = reflect(-lightDir, normal);
		spec = pow(max(dot(viewDir, reflectDir), 0.0), material.shininess);
		phong += material.specular * spec * spotLights[0].color * att;

	#endif

	gl_FragColor = texture2D(myTexture, vUV) * vec4(ambient + phong, 1.0);
}
