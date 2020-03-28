import * as utils from './utils.js';
import createVehicle from './raycastVehicle.js';
import {meshToHeightField, createPlatform} from './terrainHelper.js';
import {cameraHelper} from './cameraHelper.js';

const worldStep = 1/60;

const gWorld = new CANNON.World();
const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer(/*{antialias: true}*/);
const gCamera = new THREE.PerspectiveCamera(50, getAspectRatio(), 0.1, 1000);
const gCannonDebugRenderer = new THREE.CannonDebugRenderer(gScene, gWorld);
let wireframeRenderer = null;
let pause = false;
gRenderer.gammaOutput = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const sunLight = new THREE.DirectionalLight(0xf5f4d3, 0.9);
sunLight.position.set(-1, 100, -1).normalize();
gScene.add(ambientLight);
gScene.add(sunLight);

gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);
gWorld.gravity.set(...Config.world.gravity);
gWorld.defaultContactMaterial.friction = 0.001;

gRenderer.setPixelRatio(window.devicePixelRatio);
gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);

const vehicleInitialPosition = new THREE.Vector3(250, 5, 250);
const vehicleInitialRotation = new THREE.Quaternion().setFromAxisAngle(new CANNON.Vec3(0, -1, 0), -Math.PI / 2);
let resetVehicle = () => {};

(async function init() {
    utils.loadResource('model/skybox.jpg').then((cubeTexture) => {
        const skyBox = new THREE.CubeTexture(utils.sliceCubeTexture(cubeTexture));
        skyBox.needsUpdate = true;
        gScene.background = skyBox;
    });

    const [wheelGLTF, chassisGLTF, terrainGLB] = await Promise.all([
        utils.loadResource('model/lowPoly_car_wheel.gltf'),
        utils.loadResource('model/mg.gltf'),
        utils.loadResource('model/terrain.glb'),
    ]);
    
    const terrain = terrainGLB.scene;
    const heightField = meshToHeightField(terrain);

    gScene.add(terrain);
    gWorld.addBody(heightField);

    const wheel = wheelGLTF.scene;
    const chassis = chassisGLTF.scene;

    setMaterials(wheel, chassis);
    chassis.scale.set(0.7, 0.7, 0.7);

    const meshes = {
        wheel_front_r: wheel,
        wheel_front_l: wheel.clone(),
        wheel_rear_r: wheel.clone(),
        wheel_rear_l: wheel.clone(),
        chassis,
    };

    const vehicle = createVehicle();
    vehicle.addToWorld(gWorld, meshes);

    resetVehicle = () => {
        vehicle.chassisBody.position.copy(vehicleInitialPosition);
        vehicle.chassisBody.quaternion.copy(vehicleInitialRotation);
        vehicle.chassisBody.velocity.set(0, 0, 0);
        vehicle.chassisBody.angularVelocity.set(0, 0, 0);
    };
    resetVehicle();
    // mirror meshes suffixed with '_r'
    Object.keys(meshes).forEach((meshName) => {
        if (meshName.split('_')[2] === 'r') {
            ['x', 'y', 'z'].forEach(axis => meshes[meshName].scale[axis] *= -1);
        }
        gScene.add(meshes[meshName]);
    });

    createPlatform({x: 2, y: 2, z: 2}, {x: 250, y: 0.1, z: 260}, {axis: 'z', angle: Math.PI / 5}).append(gScene, gWorld);

    // const wheelContactMaterial = new CANNON.ContactMaterial(vehicle.wheelMaterial, terrain.material, {
    //     friction: 0.9,
    //     restitution: 0,
    //     contactEquationStiffness: 1000,
    // });
    // gWorld.addContactMaterial(wheelContactMaterial);
    
    cameraHelper.init(gCamera, chassis, gRenderer.domElement);

    render();
})();

function updatePhysics() {
    gWorld.step(worldStep);
}

function render() {
    if (pause) {
        return;
    }

    updatePhysics();

    if (wireframeRenderer) {
        wireframeRenderer.update();
    }

    cameraHelper.update();

    gRenderer.render(gScene, gCamera);

    requestAnimationFrame(render);
}

function setMaterials(wheel, chassis) {
    const baseMaterial = new THREE.MeshLambertMaterial({color: 0x111111});
    const fenderMaterial = new THREE.MeshBasicMaterial({color: 0x050505});
    const grillMaterial = new THREE.MeshBasicMaterial({color: 0x222222});
    const chromeMaterial = new THREE.MeshPhongMaterial({color: 0xCCCCCC});
    const glassMaterial = new THREE.MeshPhongMaterial({color: 0x1155FF});
    const tailLightMaterial = new THREE.MeshPhongMaterial({color: 0x550000});
    const headLightMaterial = new THREE.MeshPhongMaterial({color: 0xFFFFBB});
    const wheelMaterial = new THREE.MeshBasicMaterial();
    wheelMaterial.alphaTest = 0.5;
    wheelMaterial.skinning = true;
    
    wheel.traverse((childMesh) => {
        if (childMesh.material) {
            wheelMaterial.map = childMesh.material.map;

            childMesh.material = wheelMaterial;
            childMesh.material.needsUpdate = true;
        }
    });

    chassis.traverse((childMesh) => {
        if (childMesh.material) {
            childMesh.material = getChassisMaterialByPartName(childMesh.name);
        }
    });

    function getChassisMaterialByPartName(partName) {
        switch (partName) {
            case 'front_bumper':
            case 'rear_bumper':
            case 'front_fender':
            case 'rear_fender':
                return fenderMaterial;
            case 'grill':
                return grillMaterial;
            case 'brushGuard':
                return chromeMaterial;
            case 'glass':
                return glassMaterial;
            case 'tail_lights':
                return tailLightMaterial;
            case 'head_lights':
                return headLightMaterial;
            default:
                return baseMaterial;
        };
    }
}

function getAspectRatio() {
    return window.innerWidth / window.innerHeight;
}

function windowResizeHandler() {
    gCamera.aspect = getAspectRatio();
    gCamera.updateProjectionMatrix();
    gRenderer.setSize(window.innerWidth, window.innerHeight);
}

window.onresize = utils.debounce(windowResizeHandler, 500);

const instructionsContainer = document.getElementById('instructions-container');
const instructionsCloseButton = document.getElementById('instructions-close-button');
const resolutionController = document.getElementById('resolution-controller');
const wireframeToggleButton = document.getElementById('wireframe-toggle-button');

window.addEventListener('keyup', (e) => {
    switch (e.key.toUpperCase()) {
        case 'C':
            cameraHelper.switch();
            break;
        case 'P':
            pause = !pause;
            if (pause) {
                console.info('Pause');
            } else {
                render();
            }
            break;
        case 'R':
            resetVehicle();
            break;
        case 'ESCAPE':
            instructionsContainer.classList.toggle('hidden');
            break;
    }
});

instructionsCloseButton.addEventListener('click', () => {
    instructionsContainer.classList.add('hidden');
});

instructionsContainer.addEventListener('mousedown', (e) => {
    console.log('instructions mousedown');
    e.stopImmediatePropagation;
    e.stopPropagation;
});

wireframeToggleButton.addEventListener('click', () => {   
    if (wireframeRenderer) {
        wireframeRenderer._meshes.forEach(mesh => gScene.remove(mesh));
        wireframeRenderer._meshes = [];
        wireframeRenderer = null;
    } else {
        wireframeRenderer = gCannonDebugRenderer;
    }
});

(function initResolutionController() {
    const maxWidth = window.screen.availWidth;
    const maxHeight = window.screen.availHeight;

    [1/1, 3/4, 1/2, 1/4].forEach(ratio => {
        const option = document.createElement('option');
        option.value = ratio;
        option.innerText = `${Math.floor(maxWidth * ratio)} x ${Math.floor(maxHeight * ratio)}`;

        resolutionController.appendChild(option);
    });

    resolutionController.addEventListener('change', (e) => gRenderer.setPixelRatio(e.currentTarget.value));
})();
