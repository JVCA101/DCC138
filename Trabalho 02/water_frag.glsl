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
uniform float     indexOfRefract;
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

// calculate effect for refraction
float fresnel(float amount, vec3 normal, vec3 view) {
    return pow((1.0 - clamp(dot(normalize(normal), normalize(view)), 0.0, 1.0)), amount);
}

void main()
{
    // displacement calculation
    vec2 displacement = texture2d( tDudv, ( vUV * 2.0 ) - time * 0.05 ).rg;
    displacement = ( ( displacement * 2.0 ) - 1.0 );

    // screenUV calculation
    vec2 screen_UV = gl_FragCoord.xy / resolution;

    // set main water color
    vec4 water_color = vec4(0., 0.1, 0.3, 0.6);

    // refraction calculation
    vec3  eye_vec        = normalize(cameraPos - vWorldPos);
    vec3  refracted      = refract(eye_vec, vNormal, 1.00000000 / indexOfRefract);
    float view_angle     = dot(normalize(vNormal), normalize(viewDir));
    float refraction_str = clamp(view_angle * 2.0, 0.1, 0.5);
    vec2  refracted_UV   = screen_UV + refracted.xy * refraction_str + displacement;
    vec4  refract_color  = texture2D(tRefraction, refracted_UV);
    float fresnel_thres  = fresnel(2.0, vNormal, viewDir);

    // foam calculation
    float fragment_linear_eye_depth = getViewZ(gl_FragCoord.z);
    float linear_eye_depth         = getViewZ(getDepth(screen_UV));
    float diff = saturate(fragment_linear_eye_depth - linear_eye_depth);
    diff += displacement.x;
    float foam_mask = 1.0 - step(threshold, diff);
    vec3  foam_effect = mix(refract_color.rgb, foamColor, foam_mask);


    // scene water color calculation
    vec3 final_color = mix(foam_effect, water_color.rgb, fresnel_thres * 0.5);
    gl_FragColor.rgb = mix(final_color, final_color * water_color.rgb, 0.3);
    gl_FragColor.a = water_color.a;
}
