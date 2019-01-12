import createVehicle from './vehicle.js';
import * as utils from './utils.js';
import {generateTerrain, heightFieldToMesh} from './terrainHelper.js';
import {cameraHelper} from './cameraHelper.js';

const worldStep = 1/60;

const gWorld = new CANNON.World();
const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer();
const gCamera = new THREE.PerspectiveCamera(50, getAspectRatio(), 0.1, 1000);
const gCannonDebugRenderer = new THREE.CannonDebugRenderer(gScene, gWorld);
let wireFrameRenderer = null;
let pause = false;
gRenderer.gammaOutput = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const sunLight = new THREE.DirectionalLight(0xf5f4d3, 0.9);
sunLight.position.set(-1, 100, -1).normalize();
gScene.add(ambientLight);
gScene.add(sunLight);

gWorld.gravity.set(...Config.world.gravity);
gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);

gRenderer.setSize(window.innerWidth, window.innerHeight);
document.body.appendChild(gRenderer.domElement);

(async function init() {
    utils.loadResource('model/skybox.jpg').then((cubeTexture) => {
        const skyBox = new THREE.CubeTexture(utils.sliceCubeTexture(cubeTexture));
        skyBox.needsUpdate = true;
        gScene.background = skyBox;
    });

    const [wheelGLTF, chassisGLTF] = await Promise.all([
        utils.loadResource('model/lowPoly_car_wheel.gltf'),
        utils.loadResource('model/mg.gltf'),
    ]);
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

    const terrain = generateTerrain();
    const vehicle = createVehicle(gWorld, meshes);
    vehicle.chassisBody.position.y = 2;
    // mirror meshes suffixed with '_r'
    Object.keys(meshes).forEach((meshName) => {
        if (meshName.split('_')[2] === 'r') {
            ['x', 'y', 'z'].forEach(axis => meshes[meshName].scale[axis] *= -1);
        }
        gScene.add(meshes[meshName]);
    });
    
    gWorld.addBody(terrain);
    gScene.add(heightFieldToMesh(terrain));
    
    cameraHelper.init(gCamera, chassis);

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

    if (wireFrameRenderer) {
        wireFrameRenderer.update();
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

let pressedKey;
const instructions = document.getElementById('instructions');

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
        case 'ESCAPE':
            instructions.classList.toggle('hidden');
            break;
    }
});

Object.defineProperty(window, 'showWireFrame', {
    get() {
        if (wireFrameRenderer) {
            wireFrameRenderer.reset();
            wireFrameRenderer = null;
        } else {
            wireFrameRenderer = gCannonDebugRenderer;
        }
    },
});
