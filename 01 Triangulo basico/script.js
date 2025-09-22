import * as THREE from "https://threejs.org/build/three.module.js";

var camera, scene, renderer, mesh;
var clock = new THREE.Clock();

init();

async function init()
{
	const vert = await (await fetch("vert.glsl")).text();
	const frag = await (await fetch("frag.glsl")).text();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.z = 1;

	scene = new THREE.Scene();

	const geometry = new THREE.BufferGeometry().setFromPoints(
	[
		new THREE.Vector3(-0.5, -0.433, 0),
		new THREE.Vector3(0.5, -0.433, 0),
		new THREE.Vector3(0, 0.433, 0),
	]);
	const material = new THREE.ShaderMaterial(
	{
		uniforms:
		{
			time: { value: 0 }
		},
		vertexShader: vert,
		fragmentShader: frag
	});

	mesh = new THREE.Mesh(geometry, material);
	scene.add(mesh);

	renderer = new THREE.WebGLRenderer({ antialias: true });
	renderer.setClearColor(0xffffff, 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
	document.body.appendChild(renderer.domElement);

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
	mesh.material.uniforms.time.value += clock.getDelta() * 0.5;

	if(mesh.material.uniforms.time.value > 1.0)
		mesh.material.uniforms.time.value = 0.0;

	renderer.render(scene, camera);
}
