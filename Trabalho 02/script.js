import * as THREE from "https://threejs.org/build/three.module.js";
import { OrbitControls } from "three/addons/controls/OrbitControls.js";
import { GLTFLoader } from "three/addons/loaders/GLTFLoader.js";

// general variables
var camera, scene, renderer, controls;
var clock        = new THREE.Clock();
const pixelRatio = window.devicePixelRatio;

// variables for foam
var depthMaterial, renderTarget;
const dudvMap = loader.load("assets/foam.png");

// objects in the scene
var water, ground, island, egyptian_ship, bizantine_ship, whale, penguin, koi;

// loaders
const loader   = new THREE.TextureLoader();
var glb_loader = new GLTFLoader();


init();
async function init()
{
    // water shader
	const water_vert = await (await fetch("water_vert.glsl")).text();
	const water_frag = await (await fetch("water_frag.glsl")).text();
	
    // ground shader
    const ground_vert = await (await fetch("ground_vert.glsl")).text();
	const ground_frag = await (await fetch("ground_frag.glsl")).text();

    // general variables set
	camera   = new THREE.PerspectiveCamera(50, window.innerWidth / window.innerHeight, 0.1, 100);
	scene    = new THREE.Scene();
    renderer = new THREE.WebGLRenderer({ antialias: true });
  	controls = new OrbitControls(camera, renderer.domElement);
    camera.position.set(0, 0, 50);
	renderer.setClearColor("lightblue", 1);
	renderer.setPixelRatio(window.devicePixelRatio);
	renderer.setSize(window.innerWidth, window.innerHeight);
	renderer.setAnimationLoop(animate);
    renderer.shadowMap.enabled = true;
	document.body.appendChild(renderer.domElement);controls.maxPolarAngle = Infinity;

    // foam variables set
    depthMaterial = new THREE.MeshDepthMaterial();
	renderTarget  = new THREE.WebGLRenderTarget(window.innerWidth * renderer.getPixelRatio(), window.innerHeight * renderer.getPixelRatio());
    dudvMap.wrapS = dudvMap.wrapT        = THREE.RepeatWrapping;
	depthMaterial.depthPacking           = THREE.RGBADepthPacking;
    depthMaterial.blending               = THREE.NoBlending;
	renderTarget.texture.minFilter       = THREE.NearestFilter;
	renderTarget.texture.magFilter       = THREE.NearestFilter;
	renderTarget.stencilBuffer           = false;
	renderTarget.texture.generateMipmaps = false;

    // ground and water geometry
    const water_geometry  = new THREE.PlaneGeometry(200, 200, 1000, 1000);
    const ground_geometry = new THREE.PlaneGeometry(200, 200, 100, 100);

    const refractionTarget = new THREE.WebGLRenderTarget(
        window.innerWidth, 
        window.innerHeight,
        { 
            minFilter: THREE.LinearFilter,
            magFilter: THREE.LinearFilter,
            format: THREE.RGBAFormat
        }
    );
    refractionTarget.depthTexture        = new THREE.DepthTexture();
    refractionTarget.depthTexture.format = THREE.DepthFormat;
    refractionTarget.depthTexture.type   = THREE.UnsignedShortType;
    window.refractionTarget = refractionTarget;


    // water
    const water_material = new THREE.ShaderMaterial({
		uniforms:
		{
			time            : { value: 0 },
            noiseMultiplier : { value: 150.0000000000 },
            tDepth          : { value: null },
			foamColor       : { value: new THREE.Color(0xeeeeee) },
			threshold       : { value: 0.100000000000 },
            tRefraction     : { value: refractionTarget },
			tDudv           : { value: dudvMap },
			resolution      : { value: new THREE.Vector2(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio) },
            cameraPos       : { value: camera.position },
			cameraNear      : { value: camera.near },
			cameraFar       : { value: camera.far },
            index_of_refract: { value: 1.333333333333 }
		},
		vertexShader:   water_vert,
		fragmentShader: water_frag,
        transparent:    true
	});
    water_material.side = THREE.DoubleSide;
    water = new THREE.Mesh(water_geometry, water_material);
    water.rotation.x = Math.PI / 2;
    water.position.y = -1;
	water.material.uniforms.tDepth.value = renderTarget.texture;
	scene.add(water);


    // ground
    const ground_material = new THREE.ShaderMaterial({
        uniforms:
        {
            noise_multiplier: { value: 150.0 },
            frag_alpha      : { value: 0.6   }
        },
        vertexShader:   ground_vert,
        fragmentShader: ground_frag
    });
    ground_material.side = THREE.BackSide;
    ground = new THREE.Mesh(ground_geometry, ground_material);
    ground.rotation.x = Math.PI / 2;
    ground.position.y = -20;
    scene.add(ground);

    // island
    const island_geometry = new THREE.CylinderGeometry(10, 30, 25, 64, 16);
    const island_material = new THREE.ShaderMaterial({
        uniforms:
        {
            noise_multiplier: { value: 0.0  },
            frag_alpha      : { value: 0.65 }
        },
        vertexShader:   ground_vert,
        fragmentShader: ground_frag
    });
    island = new THREE.Mesh(island_geometry, island_material);
    island.position.set(0, -13, -30);
    scene.add(island);

    // ships
    let egyptian_ship_glb = await glb_loader.loadAsync("assets/egyptian_ship.glb");
    egyptian_ship         = egyptian_ship_glb.scene;
    egyptian_ship.scale.set(0.009, 0.009, 0.009);
    egyptian_ship.position.set(-5, -0.625, 2);
    egyptian_ship.rotation.y = Math.PI / 2;
    scene.add(egyptian_ship);

    let bizantine_ship_glb = await glb_loader.loadAsync("assets/dromon_medieval_ship.glb");
    bizantine_ship_glb.scene.traverse((child) => {
        if(child.isMesh)
            child.material.depthWrite = true;
    });
    bizantine_ship = bizantine_ship_glb.scene;
    bizantine_ship.scale.set(0.009, 0.009, 0.009);
    bizantine_ship.position.set(-5, -0.625, 2);
    bizantine_ship.rotation.y = Math.PI / 2;
    scene.add(bizantine_ship);

    // Whale
    let whale_glb = await glb_loader.loadAsync("assets/whale.glb");
    whale         = whale_glb.scene;
    whale.scale.set(8, 8, 8);
    whale.position.set(8, -14, 8);
    whale.rotation.y = -Math.PI / 8;
    whale.rotation.z = -Math.PI / 32;
    scene.add(whale);

    // Penguin
    let penguin_glb = await glb_loader.loadAsync("assets/penguin_swimming.glb");
    penguin         = penguin_glb.scene;
    penguin.scale.set(0.25, 0.25, 0.25);
    penguin.position.set(-13, -11, -0.3);
    penguin.rotation.y = Math.PI * 0.8;
    scene.add(penguin);

    // Koi fish
    let koi_glb = await glb_loader.loadAsync("assets/koi_fish.glb");
    koi         = koi_glb.scene;
    koi.scale.set(0.002, 0.002, 0.002);
    koi.position.set(-15, -9, -3.5);
    koi.rotation.y = Math.PI * 1.3;
    koi.rotation.x = Math.PI * 0.15;
    scene.add(koi);


    // directional light
    var dirLight = new THREE.DirectionalLight(0xffffff, 0.75);
    scene.add(dirLight);

    // resize window
	window.addEventListener("resize", onWindowResize);
}

function onWindowResize()
{
	camera.aspect = window.innerWidth / window.innerHeight;
	camera.updateProjectionMatrix();
	renderer.setSize(window.innerWidth, window.innerHeight);

    renderTarget.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);

    if(window.refractionTarget)
        window.refractionTarget.setSize(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);

    water.material.uniforms.resolution.value.set(window.innerWidth * pixelRatio, window.innerHeight * pixelRatio);
}

function animate()
{
    // update time of water
    water.material.uniforms.time.value = clock.getElapsedTime();
    water.material.uniforms.cameraPos.value.copy(camera.position);

    // render scene without water for foam
    water.visible = false;
	scene.overrideMaterial = depthMaterial;
	renderer.setRenderTarget(renderTarget);
    renderer.render(scene, camera);
	renderer.setRenderTarget(null);
	scene.overrideMaterial = null;
    
    // render scene without water for refraction
    renderer.setRenderTarget(window.refractionTarget);
    renderer.render(scene, camera);

    // render entire scene
    water.visible = true;
    renderer.setRenderTarget(null);
	renderer.render(scene, camera);
    
    controls.update();
}
