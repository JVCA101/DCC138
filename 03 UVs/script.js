// https://threejs.org/manual/#en/load-obj

import * as THREE from "three";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { OBJLoader } from "three/addons/loaders/OBJLoader.js";
import { MTLLoader } from 'three/addons/loaders/MTLLoader.js';

var camera, scene, renderer, mesh, controls;

init();

async function init()
{
	const vert = await (await fetch("vert.glsl")).text();
	const frag = await (await fetch("frag.glsl")).text();

	camera = new THREE.PerspectiveCamera(70, window.innerWidth / window.innerHeight, 0.1, 100);
	camera.position.z = 1;

	scene = new THREE.Scene();

	const textureLoader = new THREE.TextureLoader();
	const texture = textureLoader.load("assets/goose.png");
/*
	// cubo basico
	const material = new THREE.ShaderMaterial(
	{
		uniforms:
		{
			myTexture: { value: texture }
		},
		vertexShader: vert,
		fragmentShader: frag
	});
	mesh = new THREE.Mesh(new THREE.BoxGeometry(0.5, 0.5, 0.5), material);
	scene.add(mesh);
*/
/*
	// cubo importado do Blender
	const objLoader = new OBJLoader();
	objLoader.load("assets/cube.obj", (root) =>
	{
		mesh = root.children[0];
		mesh.material = new THREE.ShaderMaterial(
		{
			uniforms:
			{
				myTexture: { value: texture }
			},
			vertexShader: vert,
			fragmentShader: frag
		});
		scene.add(mesh);
	});
*/

	// https://sketchfab.com/3d-models/turret-from-portal-2-original-35821cb3ae284537bc0ab06b7be73a09
	const objLoader = new OBJLoader();
	const mtlLoader = new MTLLoader();
	mtlLoader.load("assets/robot/mesh.mtl", (mtl) =>
	{
		mtl.preload();
		objLoader.setMaterials(mtl);
		objLoader.load("assets/robot/mesh.obj", (root) =>
		{
			console.log(mtl.materials);
			mtl.materials[".002"].side = THREE.DoubleSide;
			mtl.materials["Material"].side = THREE.DoubleSide;
			mtl.materials["material"].side = THREE.DoubleSide;
			root.position.set(0, -0.4, 0);
			root.scale.set(0.015, 0.015, 0.015);
			scene.add(root);
			scene.add(new THREE.AmbientLight(0xeeeeee));
		});
	});


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
