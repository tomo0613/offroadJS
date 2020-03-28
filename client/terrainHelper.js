const heightMap = [
    [40.36, 30.0, 15.72, 13.62, 11.29, 8.71, 3.27, 1.17, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 51.19, 69.62, 70.5, 73.24, 78.6],
    [30.0, 24.55, 12.92, 11.29, 8.71, 7.31, 2.57, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 70.39, 70.39, 66.48, 74.18, 80.39],
    [25.28, 18.37, 11.99, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 71.99, 68.02, 61.37, 80.39, 86.29],
    [25.28, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 35.73, 60.14, 60.14, 60.14, 62.81, 72.63],
    [25.28, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 35.73, 51.19, 60.14, 60.14, 64.54, 76.61],
    [27.73, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 35.73, 51.19, 57.79, 60.14, 51.94, 74.95],
    [28.1, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 12.36, 27.06, 51.19, 51.19, 51.19, 51.94, 71.97],
    [31.36, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 18.68, 46.55, 51.19, 51.19, 51.94, 63.02],
    [34.36, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 23.3, 49.2, 56.16, 51.19, 51.94, 59.37],
    [30.47, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 25.9, 43.97, 51.19, 46.22, 51.94, 55.73],
    [25.28, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 29.65, 35.73, 40.37, 40.37, 45.09, 55.73],
    [25.28, 18.37, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 25.93, 35.73, 40.37, 40.37, 41.12, 55.73],
    [31.56, 21.25, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 23.23, 23.91, 35.73, 40.37, 39.04, 41.12, 55.73],
    [28.45, 19.81, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 33.26, 30.66, 35.73, 40.37, 40.37, 40.37, 53.23],
    [25.28, 17.48, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 0.0, 3.19, 5.23, 26.63, 35.73, 35.73, 45.24, 35.73, 35.73, 51.55],
    [25.28, 13.46, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 0.0, 2.69, 8.67, 8.67, 29.97, 48.45, 51.82, 48.41, 35.73, 35.73, 45.12],
    [20.1, 10.46, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 4.68, 6.43, 8.67, 12.49, 35.73, 44.15, 47.62, 38.5, 35.73, 35.73, 45.12],
    [20.1, 9.64, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 0.0, 4.93, 7.7, 8.67, 16.73, 35.73, 35.73, 35.73, 31.76, 35.73, 35.73, 45.12],
    [25.28, 11.01, 8.71, 8.71, 8.71, 3.44, 0.0, 0.0, 0.0, 4.93, 8.67, 8.67, 13.76, 19.7, 28.6, 32.67, 35.73, 34.54, 35.73, 40.0, 49.39],
    [21.18, 12.46, 8.71, 8.71, 8.71, 8.71, 0.0, 0.0, 4.68, 8.67, 8.67, 8.67, 14.34, 21.79, 29.79, 35.73, 35.73, 35.73, 35.73, 42.65, 50.48],
    [14.64, 14.64, 8.71, 8.71, 8.71, 8.71, 7.63, 8.67, 8.67, 8.67, 11.72, 17.32, 29.1, 35.73, 43.36, 50.49, 52.01, 52.01, 48.96, 50.83, 55.51],
];

const groundMaterial = new CANNON.Material('groundMaterial');

export function generateTerrain() {
    const scaledHeightMap = heightMap.map(row => row.map(heightValue => heightValue * 0.5));
    const mapRows = heightMap.length;
    const mapColumns = heightMap[0].length;
    const terrainShape = new CANNON.Heightfield(scaledHeightMap, {elementSize: 5});
    const terrain = new CANNON.Body({mass: 0, shape: terrainShape, material: groundMaterial});

    terrain.quaternion.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    terrain.position.set(-mapRows * terrainShape.elementSize / 2, 0, mapColumns * terrainShape.elementSize / 2);

    return terrain;
}

export function createPlatform(size, position, rotation = {axis: 'x', angle: 0}) {
    const platformGeometry = new THREE.BoxGeometry(size.x * 2, size.y * 2, size.z * 2);
    const platformMesh = new THREE.Mesh(platformGeometry, new THREE.MeshLambertMaterial());

    const platformShape = new CANNON.Box(new CANNON.Vec3(size.x, size.y, size.z));
    const platformBody = new CANNON.Body({mass: 0, shape: platformShape, material: groundMaterial});
    const rotationAxis = new CANNON.Vec3();
    rotationAxis[rotation.axis] = 1;

    platformBody.position.set(position.x, position.y, position.z);
    platformMesh.position.copy(platformBody.position);

    platformBody.quaternion.setFromAxisAngle(rotationAxis, rotation.angle);
    platformMesh.quaternion.copy(platformBody.quaternion);

    return {
        mesh: platformMesh,
        body: platformBody,
        append(scene, world) {
            scene.add(platformMesh);
            world.addBody(platformBody);
        },
    };
}

const defaultOptions = {
    receiveShadow: false,
    castShadow: false,
    color: 0xB59058,
};

export function heightFieldToMesh(body, options = {}) {
    options = Object.assign({}, defaultOptions, options);
    const shape = body.shapes[0];
    const geometry = new THREE.Geometry();
    const material = new THREE.MeshLambertMaterial({color: options.color});
    const v0 = new CANNON.Vec3();
    const v1 = new CANNON.Vec3();
    const v2 = new CANNON.Vec3();

    for (let i = 0; i < shape.data.length - 1; i++) {
        for (let j = 0; j < shape.data[i].length - 1; j++) {
            for (let k = 0; k < 2; k++) {
                shape.getConvexTrianglePillar(i, j, k === 0);

                v0.copy(shape.pillarConvex.vertices[0]);
                v1.copy(shape.pillarConvex.vertices[1]);
                v2.copy(shape.pillarConvex.vertices[2]);
                v0.vadd(shape.pillarOffset, v0);
                v1.vadd(shape.pillarOffset, v1);
                v2.vadd(shape.pillarOffset, v2);

                geometry.vertices.push(
                  new THREE.Vector3(v0.x, v0.y, v0.z),
                  new THREE.Vector3(v1.x, v1.y, v1.z),
                  new THREE.Vector3(v2.x, v2.y, v2.z),
                );

                const n = geometry.vertices.length - 3;
                geometry.faces.push(new THREE.Face3(n, n + 1, n + 2));
            }
        }
    }

    geometry.computeBoundingSphere();
    geometry.computeFaceNormals();

    const mesh = new THREE.Mesh(geometry, material);
    mesh.receiveShadow = options.receiveShadow;
    mesh.castShadow = options.castShadow;
    mesh.position.set(body.position.x, body.position.y, body.position.z);
    mesh.quaternion.set(body.quaternion.x, body.quaternion.y, body.quaternion.z, body.quaternion.w);

    const obj = new THREE.Object3D();
    obj.add(mesh);

    return obj;
}

export function meshToHeightField(mesh) {
    const geometry = findGeometry(mesh);
    // positions coordinates are stored in a THREE.Float32BufferAttribute (array buffer [c0.x,c0.y,c0.z,c1.x, ...])
    const vertices = mapPositionBufferToVertices(geometry.getAttribute('position'));
    // if the the plane width equals to its length
    const rowCount = Math.sqrt(vertices.length);
    const columnCount = rowCount;

    geometry.computeBoundingBox();

    const minX = geometry.boundingBox.min.x;
    const maxX = geometry.boundingBox.max.x;
    const minZ = geometry.boundingBox.min.z;
    const maxZ = geometry.boundingBox.max.z;
    const gridWidth = maxX - minX;
    const gridLength = maxZ - minZ;
    // the scale is bit off, so it needs some adjustment (+ 0.1585)
    const gridElementSize = gridWidth / columnCount + 0.1585;

    // create grid
    const grid = [];
    for (let rowIndex = 0; rowIndex < rowCount; rowIndex++) {
        const row = [];

        for (let columnIndex = 0; columnIndex < columnCount; columnIndex++) {
            const vertexIndex = rowIndex * rowCount + columnIndex;
            const vertex = vertices[vertexIndex];

            row.push(vertex.y);
        }

        grid.push(row);
    }

    // create heightField from grid
    const heightFieldShape = new CANNON.Heightfield(grid, {elementSize: gridElementSize});
    const heightField = new CANNON.Body({mass: 0, shape: heightFieldShape});

    const q1 = new THREE.Quaternion();
    q1.setFromAxisAngle(new CANNON.Vec3(0, 0, 1), -Math.PI / 2);
    const q = new THREE.Quaternion();
    q.setFromAxisAngle(new CANNON.Vec3(1, 0, 0), -Math.PI / 2);
    q.multiply(q1);

    heightField.quaternion.copy(q);
    heightField.position.set(
        -gridWidth / 2,
        0,
        gridLength / 2 - gridLength,
    );

    return heightField;

    function findGeometry(mesh) {
        let geometry;

        mesh.traverse((child) => {
            if (!geometry && child.type === 'Mesh' && child.geometry) {
                geometry = child.geometry;
            }
        });

        return geometry;
    }

    function mapPositionBufferToVertices(positionBuffer) {
        const vertexArray = [];
        const vertexCount = positionBuffer.count;

        for (let i = 0; i < vertexCount; i++) {        
            vertexArray.push(new THREE.Vector3(
                positionBuffer.getX(i),
                positionBuffer.getY(i),
                positionBuffer.getZ(i),
            ));
        }
        // vertices in a mesh are not in order, sort them by x & z position
        vertexArray.sort((a, b) => {
            if (a.z === b.z) {
                return (a.x < b.x) ? -1 : (a.x > b.x) ? 1 : 0;
            } else {
                return (a.z < b.z) ? -1 : 1;
            }
        });
        // filter duplicated vertices
        return vertexArray.filter((vertex, index) => {
            const nextVertex = vertexArray[index + 1];
            const duplicated = nextVertex 
                && vertex.x === nextVertex.x
                && vertex.y === nextVertex.y
                && vertex.z === nextVertex.z;

            return !duplicated;
        });
    }
}
