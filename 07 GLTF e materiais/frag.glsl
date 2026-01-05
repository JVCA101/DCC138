#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <shadowmap_pars_fragment>

struct Material
{
	vec3 diffuseColor;
	vec3 specularColor;
    vec3 rimColor;
	float shininess;
};

uniform sampler2D map;
uniform sampler2D myTexture;
uniform sampler2D normalMap;
uniform bool useTexture;
uniform bool useNormalMap;
uniform vec3 noTexColor;
uniform Material material;
uniform float biasMultiplier;
uniform int toonSections;

varying vec2 vUV;
varying vec3 vNormal;
varying vec3 viewDir;
varying vec3 fragPos;

float toonify(float intensity, float tolerance, int sections)
{
    for(int i = 0; i < sections; i++)
        if(intensity < float(i) / float(sections) + tolerance)
            return float(i) / float(sections);
    return 1.0;
}

void main()
{
	vec3 ambient = ambientLightColor, phong = vec3(0.0);
	vec3 lightDir, reflectDir;
	float diff, spec, dist, att, shadow;
    float rimDot, rimAmount, rimThreshold, rimIntensity, rim;
	vec3 normal = vNormal;

    rimAmount    = 0.6;
    rimThreshold = 0.2;

	#if NUM_DIR_LIGHTS > 0

		#pragma unroll_loop_start
		for (int i = 0; i < NUM_DIR_LIGHTS; i++)
		{
			// diffuse
			lightDir = normalize(directionalLights[i].direction);
			// diff = smoothstep(0.0, 0.01, max(0.0, dot(normal, lightDir)));
            diff = toonify(max(0.0, dot(normal, lightDir)), 0.05, toonSections);

			// specular
			reflectDir = reflect(-lightDir, normal);
			spec = smoothstep(0.08, 0.1, pow(max(dot(viewDir, reflectDir), 0.0), material.shininess));

            // rim lighting
            rimDot = 1.0 - dot(viewDir, vNormal);
            rimIntensity = rimDot * pow(dot(normal, lightDir), rimThreshold);
            rim = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

			// shadow
			shadow = 1.0;
			#if UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS
				shadow = receiveShadow ? getShadow(
					directionalShadowMap[i],
					directionalLightShadows[i].shadowMapSize,
					directionalLightShadows[i].shadowIntensity,
					directionalLightShadows[i].shadowBias * biasMultiplier,
					directionalLightShadows[i].shadowRadius,
					vDirectionalShadowCoord[i]
				) : 1.0;
			#endif

			// phong
			phong += (diff * material.diffuseColor + spec * material.specularColor + rim * material.rimColor) * directionalLights[i].color * shadow;
		}
		#pragma unroll_loop_end

	#endif

	#if NUM_POINT_LIGHTS > 0

		#pragma unroll_loop_start
		for (int i = 0; i < NUM_POINT_LIGHTS; i++)
		{
			dist = length(pointLights[i].position - fragPos);
			att = getDistanceAttenuation(dist, pointLights[i].distance, pointLights[i].decay);

			// diffuse
			lightDir = normalize(pointLights[i].position - fragPos);
		    diff = toonify(max(0.0, dot(normal, lightDir)), 0.05, toonSections);

			// specular
			reflectDir = reflect(-lightDir, normal);
			spec = smoothstep(0.08, 0.1, pow(max(dot(viewDir, reflectDir), 0.0), material.shininess));

            // rim lighting
            rimDot = 1.0 - dot(viewDir, vNormal);
            rimIntensity = rimDot * pow(dot(normal, lightDir), rimThreshold);
            rim = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

			// shadow
			shadow = 1.0;
			#if UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS
				shadow = receiveShadow ? getPointShadow(
					pointShadowMap[i],
					pointLightShadows[i].shadowMapSize,
					pointLightShadows[i].shadowIntensity,
					pointLightShadows[i].shadowBias,
					pointLightShadows[i].shadowRadius,
					vPointShadowCoord[i],
					pointLightShadows[i].shadowCameraNear,
					pointLightShadows[i].shadowCameraFar
				) : 1.0;
			#endif

			// phong
			phong += (diff * material.diffuseColor + spec * material.specularColor + rim * material.rimColor) * pointLights[i].color * att * shadow;
		}
		#pragma unroll_loop_end

	#endif

	#if NUM_SPOT_LIGHTS > 0

		#pragma unroll_loop_start
		for (int i = 0; i < NUM_SPOT_LIGHTS; i++)
		{
			dist = length(spotLights[i].position - fragPos);
			lightDir = normalize(spotLights[i].position - fragPos);
			att = getDistanceAttenuation(dist, spotLights[i].distance, spotLights[i].decay);
			att *= getSpotAttenuation(spotLights[i].coneCos, spotLights[i].penumbraCos, dot(lightDir, spotLights[i].direction));

			// diffuse
            diff = toonify(max(0.0, dot(normal, lightDir)), 0.05, toonSections);

			// specular
			reflectDir = reflect(-lightDir, normal);
			spec = smoothstep(0.08, 0.1, pow(max(dot(viewDir, reflectDir), 0.0), material.shininess));

            // rim lighting
            rimDot = 1.0 - dot(viewDir, vNormal);
            rimIntensity = rimDot * pow(dot(normal, lightDir), rimThreshold);
            rim = smoothstep(rimAmount - 0.01, rimAmount + 0.01, rimIntensity);

			// shadow
			shadow = 1.0;
			#if UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS
				shadow = receiveShadow ? getShadow(
					spotShadowMap[i],
					spotLightShadows[i].shadowMapSize,
					spotLightShadows[i].shadowIntensity,
					spotLightShadows[i].shadowBias,
					spotLightShadows[i].shadowRadius,
					vSpotLightCoord[i]
				) : 1.0;
			#endif

			// phong
			phong += (diff * material.diffuseColor + spec * material.specularColor + rim * material.rimColor) * spotLights[i].color * att * shadow;
		}
		#pragma unroll_loop_end

	#endif

	gl_FragColor = (useTexture ? texture2D(map, vUV) : vec4(noTexColor, 1.0)) * vec4(ambient + phong, 1.0);

	#include <fog_fragment>
}
