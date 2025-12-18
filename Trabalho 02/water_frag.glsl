#include <common>
#include <packing>
#include <fog_pars_fragment>

uniform vec2      resolution;
uniform vec3      foamColor;
uniform vec3      cameraPos;
uniform float     cameraNear;
uniform float     cameraFar;
uniform float     threshold;
uniform float     time;
uniform float     index_of_refract;
uniform sampler2D tDepth;
uniform sampler2D tDudv;
uniform sampler2D tRefraction;

varying vec2 vUV;
varying vec3 vNormal;
varying vec3 vWorldPos;
varying vec3 viewDir;
varying vec3 fragPos;

float getDepth(vec2 screenPosition)
{
	return unpackRGBAToDepth(texture2D(tDepth, screenPosition));
}

float getViewZ(float depth)
{
	if (isOrthographic)
		return orthographicDepthToViewZ(depth, cameraNear, cameraFar);
	else
		return perspectiveDepthToViewZ(depth, cameraNear, cameraFar);
}

float fresnel(float amount, vec3 normal, vec3 view) {
    return pow((1.0 - clamp(dot(normalize(normal), normalize(view)), 0.0, 1.0)), amount);
}

void main()
{
    vec4 water_color   = vec4(0., 0.1, 0.3, 0.6);

    vec3 eyeVec = normalize(cameraPos - vWorldPos);
    vec3 refracted = refract(eyeVec, vNormal, 1.00000000 / index_of_refract);


    vec2 screenUV = gl_FragCoord.xy / resolution;

    vec2 displacement = texture2D( tDudv, ( vUV * 2.0 ) - time * 0.05 ).rg * 0.02;
    displacement = ( ( displacement * 2.0 ) - 1.0 ) * 0.1;

    float view_angle = dot(normalize(vNormal), normalize(viewDir));
    float refraction_str = clamp(view_angle * 2.0, 0.1, 0.5);
    vec2 refractedUV = screenUV + refracted.xy * refraction_str + displacement;
    vec4 refract_color = texture2D(tRefraction, refractedUV);

    float fresnel_thres = fresnel(2.0, vNormal, viewDir);

    float fragmentLinearEyeDepth = getViewZ(gl_FragCoord.z);
    float linearEyeDepth = getViewZ(getDepth(screenUV));
    float depth_diff = saturate(fragmentLinearEyeDepth - linearEyeDepth);

    depth_diff += displacement.x * 2.0;

    float foam_mask = 1.0 - step(threshold, depth_diff);
    vec3  foam_effect = mix(refract_color.rgb, foamColor, foam_mask);

    vec3 final_color = mix(foam_effect, water_color.rgb, fresnel_thres * 0.5);

    // gl_FragColor.rgb = mix( foamColor, water_color.rgb, step( threshold, diff ) );
    // gl_FragColor.rgb = water_color.rgb;
    gl_FragColor.rgb = mix(final_color, final_color * water_color.rgb, 0.3);
    gl_FragColor.a = water_color.a;

    #include <tonemapping_fragment>
    #include <fog_fragment>
}
