#include <common>
#include <uv_pars_vertex>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>

attribute vec4 tangent;

varying vec3 fragPos;
varying vec3 viewDir;
varying vec2 vUV;

void main()
{
	#include <uv_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>

	vUV = uv;
	fragPos = vec3(modelViewMatrix * vec4(position, 1.0));
	viewDir = normalize(-(viewMatrix * modelMatrix * vec4(position, 1.0)).xyz);
}
