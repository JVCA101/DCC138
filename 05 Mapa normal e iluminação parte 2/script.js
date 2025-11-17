// https://learnopengl.com/Advanced-Lighting/Normal-Mapping

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";

var camera, scene, renderer, spotTarget, dirTarget, rot, boxes, controls;

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
	const geometry = new THREE.BoxGeometry(1, 1, 1);
	geometry.computeTangents();
	

	const material = new THREE.ShaderMaterial(
	{
		map: textureLoader.load("assets/goose.png"),
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
	boxes = [];
	for (var i = 0; i < 3; i++)
	{
		for (var j = 0; j < 3; j++)
		{
			for (var k = 0; k < 3; k++)
			{
				var x = i * 9 + j * 3 + k;
				if (x == 13)
					continue;
				else if (x > 13)
					x--;
				boxes.push(new THREE.Mesh(geometry, material.clone()));
				boxes[x].position.set((i - 1) * s, (j - 1) * s, (k - 1) * s);
				scene.add(boxes[x]);
			}
		}
	}

	const dirLight = new THREE.DirectionalLight(0xffffff, 0.25);
	dirLight.position.set(100, -100, -100);
	dirLight.target = dirTarget;
	scene.add(dirLight);

	const pointLight = new THREE.PointLight(0xffffff, 3.0);
	pointLight.position.set(0, 0, 0);
	scene.add(pointLight);

	const spotLight = new THREE.SpotLight(0xffffff, 4.0);
	spotLight.target = spotTarget;
	spotLight.position.set(0, 0, 0);
	spotLight.penumbra = 0.3;
	scene.add(spotLight);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0xffffff, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

	controls = new OrbitControls(camera, renderer.domElement);
	controls.maxPolarAngle = Infinity;
	controls.enablePan = false;

	window.addEventListener("resize", onWindowResize);

	console.log(boxes[0].material.uniforms);
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
	rot -= 0.02;
	if (rot < 0)
		rot += Math.PI * 2;
	spotTarget.position.set(-Math.cos(rot) * 5, 0, Math.sin(rot) * 5);
	renderer.render(scene, camera);
}
