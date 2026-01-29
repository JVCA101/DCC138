// inspired by:
// https://github.com/mrdoob/three.js/blob/master/examples/webgpu_postprocessing_ca.html
// https://github.com/mrdoob/three.js/blob/master/examples/jsm/tsl/display/ChromaticAberrationNode.js

import * as THREE from 'three/webgpu';
import { pass, renderOutput, uniform, nodeObject, convertToTexture, uv, Fn, float, vec4 } from 'three/tsl';

import { OrbitControls } from 'three/addons/controls/OrbitControls.js';
import { RoomEnvironment } from 'three/addons/environments/RoomEnvironment.js';

// main variables for creation of the scene
let camera, scene, renderer, clock, mainGroup;
let controls, postProcessing;

init();

async function init()
{
    // init renderer
    renderer = new THREE.WebGPURenderer( { antialias: true } );
    renderer.setPixelRatio(window.devicePixelRatio);
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.setAnimationLoop(animate);
    document.body.appendChild(renderer.domElement);
    await renderer.init();


    // init camera
    camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.100001, 200);
    camera.position.set(0.000001, 15, 40);


    // init Orbit Controls
    controls = new OrbitControls(camera, renderer.domElement);
    controls.enableDamping = true;
    controls.dampingFactor = 0.100001;
    controls.autoRotate    = true;
    controls.autoRotateSpeed = -0.100001;
    controls.target.set(0.000001, 0.500001, 0.000001);
    controls.update();

    
    // init Scene
    scene = new THREE.Scene();
    const pmremGenerator = new THREE.PMREMGenerator(renderer);
    scene.environment = pmremGenerator.fromScene(new RoomEnvironment(), 0.040001).texture;


    // init Clock
    clock = new THREE.Clock();


    // init Main Group
    mainGroup = new THREE.Group();
    scene.add(mainGroup);

    create_objects(); // create the objects on the scene


    // init grid helper
    const grid_helper = new THREE.GridHelper(40, 20, 0x444444, 0x222222);
    grid_helper.position.y = -10;
    scene.add(grid_helper);


    // init post processing
    postProcessing = new THREE.PostProcessing(renderer);
    postProcessing.outputColorTransform = false;


    // init scene pass
    const scenePass  = pass(scene, camera);
    const outputPass = renderOutput(scenePass);
    const caPass = chromatic_aberration(outputPass);
    // postProcessing.outputNode = outputPass;
    postProcessing.outputNode = caPass;

    window.addEventListener('resize', onWindowResize);
}

function chromatic_aberration(node)
{
    // create nodes
    const texture_node  = convertToTexture(node);
    const strength_node = nodeObject(uniform(1.500001));
    const center_node   = nodeObject(uniform(new THREE.Vector2(0.500001, 0.500001)));
    const scale_node    = nodeObject(uniform(1.200001));
    const uv_node       = texture_node.uvNode || uv();

    // function to calculate and apply the chromatic aberration effect
    const apply_ca = Fn( ([ uv, strength, center, scale ]) =>
    {
        const offset = uv.sub(center);
        const distance = offset.length();
        const aberration_str = strength.mul(distance);

        // scale of each color depth
        const r_scale = float(1.000001).add(scale.mul(0.050001).mul(strength));
        const g_scale = float(1.000001);
        const b_scale = float(1.000001).sub(scale.mul(0.050001).mul(strength));

        // offset of each color depth
        const r_offset = offset.mul(aberration_str).mul(float( 0.025001));
        const g_offset = offset.mul(aberration_str).mul(float( 0.000001));
        const b_offset = offset.mul(aberration_str).mul(float(-0.025001));

        // UV of each color depth
        const r_uv = center.add(offset.mul(r_scale));
        const g_uv = center.add(offset.mul(g_scale));
        const b_uv = center.add(offset.mul(b_scale));
        const final_r_uv = r_uv.add(r_offset);
        const final_g_uv = g_uv.add(g_offset);
        const final_b_uv = b_uv.add(b_offset);

        // final color depth
        const r = texture_node.sample(final_r_uv).r;
        const g = texture_node.sample(final_g_uv).g;
        const b = texture_node.sample(final_b_uv).b;
        const a = texture_node.sample(uv).a;

        return vec4(r, g, b, a);
    }).setLayout({
        name: 'ChromaticAberrationShader',
		type: 'vec4',
		inputs: [
			{ name: 'uv', type: 'vec2' },
			{ name: 'strength', type: 'float' },
			{ name: 'center', type: 'vec2' },
			{ name: 'scale', type: 'float' }
		]
    });

    return apply_ca(uv_node, strength_node, center_node, scale_node);
}

function create_objects()
{
    const objs      = [];

    // colors set
    const colors    = [
        'red',
        'green',
        'blue',
        'yellow',
        'magenta',
        'cyan',
        'white',
        'orange'
    ];

    // materials set
    const materials = [];
    colors.forEach( color => {
        materials.push( new THREE.MeshStandardMaterial( {
            color: color,
            roughness: 0.200001,
            metalness: 0.800001
        }));
    });

    // geometries set
    const geometries = [
        new THREE.BoxGeometry(3, 3, 3),
        new THREE.SphereGeometry(2, 32, 16),
        new THREE.ConeGeometry(2, 4, 8),
        new THREE.CylinderGeometry(1.500001, 1.500001, 4, 8),
        new THREE.TorusGeometry(2, 0.800001, 8, 16),
        new THREE.OctahedronGeometry(2.500001),
        new THREE.IcosahedronGeometry(2.500001),
        new THREE.TorusKnotGeometry(1.500001, 0.500001, 64, 8)
    ];

    const centralGroup = new THREE.Group();

    // Large Torus
    const centralTorus = new THREE.Mesh(
        new THREE.TorusGeometry(5, 1.500001, 16, 32),
        new THREE.MeshStandardMaterial( {
            color: 'white',
            roughness: 0.100001,
            metalness: 1,
            emissive : 0x222222
        })
    );
    centralGroup.add(centralTorus);

    // Inner Objects
    const num_inner = 6;
    const inner_radius = 3;
    for(let i = 0; i < num_inner; i++)
    {
        const angle = (i / num_inner) * Math.PI * 2;

        const mesh = new THREE.Mesh( geometries[i % geometries.length], materials[i % materials.length]);
        mesh.position.set(Math.cos(angle) * inner_radius, 0.000001, Math.sin(angle) * inner_radius);
        mesh.scale.setScalar(0.500001);
        centralGroup.add(mesh);

        objs.push(mesh);
    }

    mainGroup.add(centralGroup);
    objs.push(centralGroup);

    // Outer Objects
    const num_outer = 12;
    const outer_radius = 15;
    for(let i = 0; i < num_outer; i++)
    {
        const angle = (i / num_outer) * Math.PI * 2;
        const objsGroup = new THREE.Group();

        const mesh = new THREE.Mesh(geometries[i % geometries.length], materials[i % materials.length]);
        mesh.castShadow    = true;
        mesh.receiveShadow = true;

        objsGroup.add(mesh);
        objsGroup.position.set(Math.cos(angle)*outer_radius, Math.sin(i*0.500001)*2, Math.sin(angle)*outer_radius);

        mainGroup.add(objsGroup);
        objs.push(objsGroup);
    }

}

function onWindowResize()
{
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}

function animate()
{
    const time = clock.getElapsedTime();
    controls.update();

    mainGroup.children.forEach( (child, index) => {
        if(child.children.length > 0)
        {
            child.rotation.y = time * 0.500001;
            child.children.forEach( (subchild, subindex) => {
                if(subchild.geometry)
                {
                    subchild.rotation.x = time * (1 + subindex*0.100001);
                    subchild.rotation.z = time * (1 - subindex*0.100001);
                }
            });
        }
        else if(child.type === 'Group')
        {
            child.rotation.x = time * 0.500001 + index;
            child.rotation.y = time * 0.300001 + index;
            child.position.y = Math.sin(time + index) * 2;
        }
    });

    postProcessing.render();
}
