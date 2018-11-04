import constants from './constants.js';
import createVehicle from './vehicle.js';
import {loadResource, sliceCubeTexture} from './utils.js';

const viewWidth = 512;
const viewHeight = 512;
const aspectRatio = viewWidth / viewHeight;
const worldStep = 1/60;

const gWorld = new CANNON.World();
const gScene = new THREE.Scene();
const gRenderer = new THREE.WebGLRenderer();
const gCannonDebugRenderer = new THREE.CannonDebugRenderer(gScene, gWorld);
const gCamera = new THREE.PerspectiveCamera(45, aspectRatio, 0.1, 1000);
// const gCameraController = new THREE.OrbitControls(gCamera, gRenderer.domElement);
const gCameraController = new THREE.OrbitControls(gCamera);
gRenderer.gammaOutput = true;

const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
const sunLight = new THREE.DirectionalLight(0xf5f4d3, 0.9);
sunLight.position.set(-1, 0.5, -1).normalize();
gScene.add(ambientLight);
gScene.add(sunLight);

gWorld.gravity.set(...constants.gravity);
gWorld.broadphase = new CANNON.SAPBroadphase(gWorld);

gRenderer.setSize(viewWidth, viewHeight);
document.body.appendChild(gRenderer.domElement);

(async function init() {
    // loadResource('model/skybox.jpg').then((cubeTexture) => {
    //     console.log(sliceCubeTexture(cubeTexture));
        
    //     const skyBox = new THREE.CubeTexture(sliceCubeTexture(cubeTexture));
    //     skyBox.needsUpdate = true;
    //     gScene.background = skyBox;
    // });

    const [wheelGLTF, chassisGLTF] = await Promise.all([
        loadResource('model/lowPoly_car_wheel.gltf'),
        loadResource('model/mg.gltf'),
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

    const ground = createGround();
    const vehicle = createVehicle(gWorld, meshes);
    vehicle.chassisBody.position.y = 2;

    Object.keys(meshes).forEach((name) => {
        if (name.split('_')[2] === 'r') {
            ['x', 'y', 'z'].forEach(axis => meshes[name].scale[axis] *= -1);
        }
        gScene.add(meshes[name]);
    });
    
    gWorld.addBody(ground);

    // gCameraController.position0 = new THREE.Vector3(0, 4, 20);
    // gCameraController.minDistance = 2;
    // gCameraController.reset();
    
    chassis.add(gCamera);
    gCamera.position.y = 3;
    gCamera.position.z = 12;

    render();
})();

function updatePhysics() {
    gWorld.step(worldStep);
}

function animate() {
}

function render() {
    updatePhysics();
    animate();

    gCannonDebugRenderer.update();

    // gCameraController.update();

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

function createGround() {
    const heightMap = [
        [10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10],
        [10, 10, 8, 8, 8, 8, 6, 6, 6, 6, 8, 8, 8, 10, 10, 10],
        [10, 8, 6, 6, 4, 0, 0, 0, 0, 2, 4, 6, 8, 8, 10, 10],
        [10, 6, 6, 4, 2, 0, 0, 0, 0, 0, 2, 4, 6, 8, 8, 10],
        [6, 4, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 8, 10],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6, 8],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4, 6],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2, 4],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 2],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [10, 10, 10, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 5, 5, 0],
        [20, 20, 20, 0.5, 0, 0, 0, 0, 0, 0, 0, 0, 5, 0, 0, 0],
        [30, 30, 25, 30, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
        [40, 40, 40, 35, 30, 25, 20, 15, 10, 5, 0, 0, 0, 0, 0, 0],
        [40, 40, 40, 35, 30, 25, 20, 15, 10, 5, 0, 0, 0, 0, 0, 0],
    ];

    const mapRows = heightMap.length;
    const mapColumns = heightMap[0].length;
    const terrainShape = new CANNON.Heightfield(heightMap, {elementSize: 10});
    const terrain = new CANNON.Body({mass: 0, shape: terrainShape});

    terrain.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    terrain.position.set(-mapRows * terrainShape.elementSize / 2, 0, mapColumns * terrainShape.elementSize / 2);

    return terrain;
}
