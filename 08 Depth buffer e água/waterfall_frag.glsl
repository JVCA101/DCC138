#include <common>
#include <packing>
#include <fog_pars_fragment>

struct WaterfallColor
{
    vec3 topDark;
    vec3 topLight;
    vec3 bottomDark;
    vec3 bottomLight;
};

uniform sampler2D tNoise;
uniform sampler2D tDudv;
uniform WaterfallColor waterfall;
uniform vec3 foamColor;
uniform float time;

varying vec2 vUV;

float round(float num) {
    return floor(num + 0.5);
}

int main()
{
    vec2 displacement = texture2D(tDudv, (vUV * 2.0) - time * 0.06).rg;
    displacement = ((displacement) * 2.0 - 1.0);

    float noise = texture2D(tNoise, vec2(vUV.x, (vUV.y / 5.0) + time * 0.2) + displacement).r;
    noise = round(noise * 5.0) / 5.0;

    vec3 waterfall_color = mix(mix(waterfall.bottomDark, waterfall.topDark, vUV.y), mix(waterfall.bottomLight, waterfall.topLight, vUV.y), noise);
    gl_FragColor = vec4(mix(waterfall_color, foamColor, step(vUV.y + displacement.y, 0.1)), 1.0);

}
