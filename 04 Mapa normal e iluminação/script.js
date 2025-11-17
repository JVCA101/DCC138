// https://learnopengl.com/Advanced-Lighting/Normal-Mapping

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

var camera, scene, renderer, mesh, controls;

init();

async function init()
{
	const vert = await (await fetch("vert.glsl")).text();
	const frag = await (await fetch("frag.glsl")).text();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.z = 1;
	scene = new THREE.Scene();
	scene.add(camera);
	scene.add(new THREE.AmbientLight(0x777777));

	const textureLoader = new THREE.TextureLoader();
	const material = new THREE.ShaderMaterial(
	{
		side: THREE.DoubleSide,
		uniforms: THREE.UniformsUtils.merge(
		[
			THREE.UniformsLib["lights"],
			{
				cameraPos: { value: camera.position },
				myTexture: { value: textureLoader.load("assets/goose.png") },
				normalMap: { value: textureLoader.load("assets/normal_map.png") },

				material:
				{
					value:
					{
						specular: new THREE.Vector3(0.5, 1.0, 1.0),
						shininess: 32.0
					}
				}
			}
		]),
		vertexShader: vert,
		fragmentShader: frag,
		lights: true
	});
	mesh = new THREE.Mesh(new THREE.PlaneGeometry(1, 1, 16, 16), material);
	scene.add(mesh);

	const dirLight = new THREE.DirectionalLight(0xffffff);
	dirLight.target = mesh;
	camera.add(dirLight);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0xffffff, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);

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
