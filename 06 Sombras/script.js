// https://learnopengl.com/Advanced-Lighting/Shadows/Shadow-Mapping
// https://github.com/mrdoob/three.js/tree/master/src/renderers/shaders/ShaderChunk

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

var camera, scene, renderer, spotTarget, dirTarget, rot, box, controls;

init();

async function init()
{
	const vert = await (await fetch("vert.glsl")).text();
	const frag = await (await fetch("frag.glsl")).text();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.set(0, 2, 2);
	scene = new THREE.Scene();
	scene.add(camera);
	scene.add(new THREE.AmbientLight(0x777777));

	const textureLoader = new THREE.TextureLoader();
	const geometry = new THREE.BoxGeometry(1, 1, 1);
	geometry.computeTangents();
	const material = new THREE.ShaderMaterial(
	{
		uniforms: THREE.UniformsUtils.merge(
		[
			THREE.UniformsLib["lights"],
			{
				cameraPos: { value: camera.position },
				myTexture: { value: textureLoader.load("assets/goose.png") },
				normalMap: { value: textureLoader.load("assets/normal_map.png") },
				useNormalMap: { value: true },
				useTexture: { value: true },
				noTexColor: { value: new THREE.Color(0, 0, 0) },

				material:
				{
					value:
					{
						specular: new THREE.Vector3(0.75, 0.75, 0.75),
						shininess: 16
					}
				}
			}
		]),
		vertexShader: vert,
		fragmentShader: frag,
		lights: true
	});

	rot = 0;
	dirTarget = new THREE.Object3D();
	spotTarget = new THREE.Object3D();
	scene.add(dirTarget);
	scene.add(spotTarget);

	const s = 3;
	box = new THREE.Mesh(geometry, material.clone());
	box.position.set(0, 0.5, 0);
	box.castShadow = true;
	scene.add(box);

	const planeGeo = new THREE.PlaneGeometry(10, 10);
	const planeMat = material.clone();
	planeMat.uniforms.useTexture.value = false;
	planeMat.uniforms.useNormalMap.value = false;
	planeMat.uniforms.noTexColor.value = new THREE.Color(0.8, 0.8, 0.8);
	const floor = new THREE.Mesh(planeGeo, planeMat);
	floor.castShadow = floor.receiveShadow = true;
	floor.rotation.set(-Math.PI / 2, 0, 0);
	scene.add(floor);

    const lado = 15;

	const dirLight = new THREE.DirectionalLight(0xffffff, 0.25);
	dirLight.position.set(-5, 5, -5);
	dirLight.target = dirTarget;
	dirLight.castShadow = true;
    dirLight.shadow.mapSize = new THREE.Vector2(2048, 2048);
    dirLight.shadow.camera.left = -lado;
    dirLight.shadow.camera.right = lado;
    dirLight.shadow.camera.top = lado;
    dirLight.shadow.camera.bottom = -lado;
    dirLight.shadow.camera.far = 2*lado;
    dirLight.shadow.bias = 0.002;
	scene.add(dirLight);
    const helper = new THREE.CameraHelper(dirLight.shadow.camera);
    scene.add(helper);

	const pointLight = new THREE.PointLight(0xffffff, 3.0);
	pointLight.position.set(-3, 2, 0);
	pointLight.castShadow = true;
    pointLight.shadow.bias = 0.002;
	scene.add(pointLight);

	const pointLight2 = new THREE.PointLight(0xffffff, 3.0);
	pointLight2.position.set(3, 2, 0);
	pointLight2.castShadow = false;
    pointLight2.shadow.bias = 0.002;
	scene.add(pointLight2);

	const spotLight = new THREE.SpotLight(0xffffff, 4.0);
	spotLight.target = spotTarget;
	spotLight.position.set(3, 3, 3);
	spotLight.penumbra = 0.15;
	spotLight.castShadow = true;
    spotLight.shadow.bias = 0.002;
	scene.add(spotLight);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0xffffff, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Infinity;
	controls.enablePan = false;

	window.addEventListener("resize", onWindowResize);
}

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate()
{
	controls.update();
	renderer.render(scene, camera);
}
