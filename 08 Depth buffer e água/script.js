// https://fire-face.com/water/
// https://codesandbox.io/p/sandbox/funny-lake-7rkse

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

var camera, scene, renderer, controls, clock, water, renderTarget, depthMaterial;

init();

async function init()
{
	const vert = await (await fetch("vert.glsl")).text();
	const frag = await (await fetch("frag.glsl")).text();

    const vert_waterfall = await (await fetch("waterfall_vert.glsl")).text();
    const frag_waterfall = await (await fetch("waterfall_frag.glsl")).text();

	clock = new THREE.Clock();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.set(0, 3, 3);
	scene = new THREE.Scene();
	scene.add(camera);
	scene.add(new THREE.AmbientLight(0xaaaaaa));

	const pixelRatio = window.devicePixelRatio;

	depthMaterial = new THREE.MeshDepthMaterial();
	depthMaterial.depthPacking = THREE.RGBADepthPacking;
	depthMaterial.blending = THREE.NoBlending;

	const loader = new THREE.TextureLoader();
	const dudvMap = loader.load("assets/foam.png");
	dudvMap.wrapS = dudvMap.wrapT = THREE.RepeatWrapping;

    const noiseMap = loader.load("assets/noise.jpg");
    noiseMap.wrapS = noiseMap.wrapT = THREE.RepeatWrapping;

	const geometry = new THREE.PlaneGeometry(10, 10);
	const material = new THREE.ShaderMaterial(
	{
		uniforms: THREE.UniformsUtils.merge(
		[
			THREE.UniformsLib["common"],
			{
				biasMultiplier: { value: 1 },
				tDepth: { value: null },
				waterColor: { value: new THREE.Color(0xaaccff) },
				foamColor: { value: new THREE.Color(0xeeeeee) },
				threshold: { value: 0.1 },
				time: { value: 0 },
				tDudv: { value: dudvMap },
				resolution: { value: new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio) },
				cameraNear: { value: camera.near },
				cameraFar: { value: camera.far },
				material:
				{
					value:
					{
						diffuseColor: new THREE.Vector3(0.75, 0.75, 0.75),
						specularColor: new THREE.Vector3(1, 1, 1),
						shininess: 32
					}
				}
            }
        ]),
        vertexShader: vert,
        fragmentShader: frag,
    });


    const waterfall_material = new THREE.ShaderMaterial(
	{
		uniforms: THREE.UniformsUtils.merge(
		[
			THREE.UniformsLib["common"],
			{
                tNoise: { value: noiseMap },
				tDudv: { value: dudvMap },

                waterfall:
                {
                    value:{
                    topDark:     new THREE.Color(0x4e7a71),
                    topLight:    new THREE.Color(0xb0f7e9),
                    bottomDark:  new THREE.Color(0xb0f7e9),
                    bottomLight: new THREE.Color(0xb0f7e9)
                    }
                }
			}
		]),
		vertexShader: vert_waterfall,
		fragmentShader: frag_waterfall,
	});

	water = new THREE.Mesh(geometry, material);
	water.rotation.set(-Math.PI / 2, 0, 0);
	scene.add(water);

    var waterfall = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 8, 16), waterfall_material);
    scene.add(waterfall);

	scene.add(new THREE.Mesh(new THREE.SphereGeometry(2), new THREE.MeshBasicMaterial({ color: 0x666666 })));

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0xffffff, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);

	renderTarget = new THREE.WebGLRenderTarget(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
	renderTarget.texture.minFilter = THREE.NearestFilter;
	renderTarget.texture.magFilter = THREE.NearestFilter;
	renderTarget.texture.generateMipmaps = false;
	renderTarget.stencilBuffer = false;
	water.material.uniforms.tDepth.value = renderTarget.texture;

	controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Infinity;

	window.addEventListener("resize", onWindowResize);
}

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

	const pixelRatio = renderer.getPixelRatio();
	renderTarget.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
	water.material.uniforms.resolution.value.set(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
}

function animate()
{
	water.visible = false; // para ignorar a profundidade da água no cálculo inicial
	scene.overrideMaterial = depthMaterial; // sem essa linha, a cena é renderizada colorida, dando um efeito diferente do desejado
	renderer.setRenderTarget(renderTarget); // renderiza tudo, menos a água
	renderer.render(scene, camera);
	renderer.setRenderTarget(null);  // renderiza o canva inteiro
	scene.overrideMaterial = null;
	water.visible = true;

	var time = clock.getElapsedTime();
	water.material.uniforms.time.value = time;

	controls.update();
	renderer.render(scene, camera);
}
