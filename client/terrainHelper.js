import terrainHeightMap from './terrainHeightMap.js';

const groundMaterial = new CANNON.Material('groundMaterial');

export function generateTerrain() {
    const { heightMap, pointDistance, position: [x, y, z] } = terrainHeightMap;
    const terrainShape = new CANNON.Heightfield(heightMap, {elementSize: pointDistance});
    const terrain = new CANNON.Body({mass: 0, shape: terrainShape, material: groundMaterial});

    terrain.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    terrain.position.set(x, y, z);

    return terrain;
}

export async function generateHeightfieldFromMesh(mesh/*: Mesh*/, pointDistance/*: number*/) {
    // https://threejs.org/docs/index.html#api/en/core/Raycaster
    const rayCaster = new THREE.Raycaster();
    const rayCasterPosition = new THREE.Vector3();
    const upAxis = new THREE.Vector3(0, 1, 0);

    const heightMap = [];

    const geometry = findGeometry(mesh);
    geometry.computeBoundingBox();
    const {
        min: {x: minX, y: minY, z: minZ},
        max: {x: maxX, z: maxZ},
    } = geometry.boundingBox;

    const width = maxX - minX;
    const length = maxZ - minZ;
    console.log(width, length);
    const totalX = width / pointDistance + 1;
    const totalZ = length / pointDistance + 1;
    const totalSteps = totalX * totalZ;
    let currentStep = 0;

    for (let x = minX; x <= maxX; x += pointDistance) {
        const heightDataRow = [];
        heightMap.push(heightDataRow);

        for (let z = maxZ; z >= minZ; z -= pointDistance) {
            rayCasterPosition.set(x, minY, z);
            rayCaster.set(rayCasterPosition, upAxis);

            const y = await calculateMeshSurfaceDistanceByRayCast();

            heightDataRow.push(y);
        }
    }

    // console.log({
    //     pointDistance,
    //     position: [minX, 0, maxZ],
    //     heightMap,
    // });

    const terrainShape = new CANNON.Heightfield(heightMap, {elementSize: pointDistance});
    const heightfield = new CANNON.Body({ mass: 0, shape: terrainShape });
    heightfield.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    heightfield.position.set(minX, 0, maxZ);

    return heightfield;

    
    function calculateMeshSurfaceDistanceByRayCast() {
        return new Promise((resolve) => {
            window.setTimeout(() => {
                currentStep++;

                console.log(`generating height field... ${Math.floor(100 / totalSteps * currentStep)}%`);

                const [result] = rayCaster.intersectObject(mesh, true);

                resolve(result.distance);
            });
        });
    }
}

function findGeometry(mesh) {
    let geometry;

    mesh.traverse((child) => {
        if (!geometry && child.type === 'Mesh' && child.geometry) {
            geometry = child.geometry;
        }
    });

    return geometry;
}

// function meshToHeightfield() {
//     // https://threejs.org/docs/index.html#api/en/core/Raycaster
//     const rayCaster = new THREE.Raycaster();
//     const rayCasterPosition = new THREE.Vector3();
//     const upAxis = new THREE.Vector3(0, 1, 0);

//     const heightMap = []/* as number[][]*/;

//     const geometry = findGeometry(terrainMesh);
//     geometry.computeBoundingBox();
//     const {
//         min: {x: minX, y: minY, z: minZ},
//         max: {x: maxX, z: maxZ},
//     } = geometry.boundingBox;
//     let y;

//     for (let x = minX; x <= maxX; x += pointDistance) {
//         const heightDataRow = [];
//         heightMap.push(heightDataRow);

//         for (let z = maxZ; z >= minZ; z -= pointDistance) {
//             rayCasterPosition.set(x, minY, z);
//             rayCaster.set(rayCasterPosition, upAxis);
//             const [result] = rayCaster.intersectObject(terrainMesh, true);

//             y = result.distance;
//             heightDataRow.push(y);
//         }
//     }

//     const terrainShape = new CANNON.Heightfield(heightMap, {elementSize: pointDistance});
//     const heightfield = new CANNON.Body({ mass: 0, shape: terrainShape });
//     heightfield.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
//     heightfield.position.set(
//         -(maxX - minX) / 2,
//         0,
//         (maxZ - minZ) / 2,
//     );

//     return heightfield;
// }