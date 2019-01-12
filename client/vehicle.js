import controllerSocketHandler from './socketHandler.js';

export default function createVehicle(world, meshes) {
    world.defaultContactMaterial.friction = 0.001;
    const groundMaterial = new CANNON.Material('groundMaterial');
    const wheelMaterial = new CANNON.Material('wheelMaterial');
    const wheelGroundContactMaterial = new CANNON.ContactMaterial(wheelMaterial, groundMaterial, {
        friction: 0.5,
        restitution: 0,
        contactEquationStiffness: 1000
    });
    world.addContactMaterial(wheelGroundContactMaterial);

    const chassisBody = new CANNON.Body({mass: Config.vehicle.mass});
    const chassisBaseShape = new CANNON.Box(new CANNON.Vec3(0.9, 0.4, 2.1));
    const chassisTopShape = new CANNON.Box(new CANNON.Vec3(0.9, 0.4, 1.2));
    chassisBody
        .addShape(chassisBaseShape, new CANNON.Vec3(0, 0, 0.1))
        .addShape(chassisTopShape, new CANNON.Vec3(0, 0.8, 0.8));

    const wheelOptions = {
        radius: 0.4,
        directionLocal: new CANNON.Vec3(0, -1, 0),
        suspensionStiffness: 30,
        suspensionRestLength: 0.3,
        frictionSlip: 1.4,
        dampingRelaxation: 2.3,
        dampingCompression: 4.4,
        maxSuspensionForce: 100000,
        rollInfluence:  0.5,
        axleLocal: new CANNON.Vec3(-1, 0, 0),
        chassisConnectionPointLocal: new CANNON.Vec3(),
        maxSuspensionTravel: 0.3,
        customSlidingRotationalSpeed: -30,
        useCustomSlidingRotationalSpeed: true,
    };
    // Create the vehicle
    const vehicle = new CANNON.RaycastVehicle({
        chassisBody: chassisBody,
        indexForwardAxis: 2,
        indexRightAxis: 0,
        indexUpAxis: 1,
    });
    
    const height = 0.3;
    wheelOptions.chassisConnectionPointLocal.set(0.85, -height, -1.2);
    vehicle.addWheel(wheelOptions);
    wheelOptions.chassisConnectionPointLocal.set(-0.85, -height, -1.2);
    vehicle.addWheel(wheelOptions);
    wheelOptions.chassisConnectionPointLocal.set(0.85, -height, 1.35);
    vehicle.addWheel(wheelOptions);
    wheelOptions.chassisConnectionPointLocal.set(-0.85, -height, 1.35);
    vehicle.addWheel(wheelOptions);
    vehicle.addToWorld(world);

    const wheelBodies = [];
    const wheelMeshes = [
        meshes['wheel_front_l'], meshes['wheel_front_r'], meshes['wheel_rear_l'], meshes['wheel_rear_r'],
    ];
    const wheelOrientation = new CANNON.Quaternion();
    wheelOrientation.setFromAxisAngle(new CANNON.Vec3(0, 1, 0), Math.PI / 2);

    vehicle.wheelInfos.forEach((wheel) => {
        const wheelShape = new CANNON.Cylinder(wheel.radius, wheel.radius, wheel.radius / 2, 8);
        const wheelBody = new CANNON.Body({mass: 0});
        wheelBody.type = CANNON.Body.KINEMATIC;
        wheelBody.collisionFilterGroup = 0; // turn off collisions
        wheelBody.addShape(wheelShape, new CANNON.Vec3(), wheelOrientation);
        wheelBodies.push(wheelBody);
        world.addBody(wheelBody);
    });

    // Update wheels
    let transform;
    let wheelBody;
    world.addEventListener('postStep', () => {
        for (let i = 0; i < vehicle.wheelInfos.length; i++) {
            vehicle.updateWheelTransform(i);
            transform = vehicle.wheelInfos[i].worldTransform;
            wheelBody = wheelBodies[i];

            wheelBody.position.copy(transform.position);
            wheelBody.quaternion.copy(transform.quaternion);

            wheelMeshes[i].position.copy(wheelBody.position);
            wheelMeshes[i].quaternion.copy(wheelBody.quaternion);
        }
        meshes['chassis'].position.copy(chassisBody.position);
        meshes['chassis'].quaternion.copy(chassisBody.quaternion);
        meshes['chassis'].translateOnAxis(new THREE.Vector3(0, 0, 1), 0.6);
    });

    initControls(vehicle);

    const maxAcceleration = 100;
    const maxSteeringValue = 0.5;
    const maxBrakeForce = 1;
    
    const minValues = {
        acceleration: -maxAcceleration,
        steeringValue: -maxSteeringValue,
        brakeForce: 0,
    };
    
    const maxValues = {
        acceleration: maxAcceleration,
        steeringValue: maxSteeringValue,
        brakeForce: maxBrakeForce,
    };
    
    const state = {
        acceleration: 0,
        steeringValue: 0,
        brakeForce: 0,
    };

    controllerSocketHandler.connectToServer();
    controllerSocketHandler.onmessage = (action) => {
        setState({[action.target]: action.value});
    };

    function setState(properties) {
        let stateChanged = false;
        Object.keys(properties).forEach(property => {
            if (state.hasOwnProperty(property) && state[property] !== properties[property]) {
                state[property] = getLimitedValue(properties[property], minValues[property], maxValues[property]);
                stateChanged = true;
            }
        });

        if (stateChanged) {
            onStateChange();
        }
    }

    function onStateChange() {
        [0, 1, 2, 3].forEach(wheelIndex => vehicle.applyEngineForce(state.acceleration * -maxAcceleration, wheelIndex));
    
        [0, 1].forEach(wheelIndex => vehicle.setSteeringValue(state.steeringValue * -1, wheelIndex));
    
        [0, 1, 2, 3].forEach(wheelIndex => vehicle.setBrake(state.brakeForce, wheelIndex));
    }

    return vehicle;
}

function getLimitedValue(value, min, max) {
    return Math.max(min, Math.min(value, max));
}

//// keyboard controls ////

function initControls(vehicle) {
    const keysPressed = new Set();
    const isKeyDown = (key) => keysPressed.has(key);
    const maxSteeringValue = 0.5;
    const maxForce = 30;
    const brakeForce = 1;

    const liftingPoint = new CANNON.Vec3();
    const liftingForce = new CANNON.Vec3(0, 360, 0);
    const upAxis = new CANNON.Vec3(0, 1, 0);
    let pressedKey;

    onkeydown = onkeyup = (e) => {
        pressedKey = e.key.toUpperCase();
        preventPageScrolling(e);
        if (isKeyDown('H')) {
            vehicle.chassisBody.quaternion.vmult(upAxis, liftingPoint);
            vehicle.chassisBody.position.vadd(liftingPoint, liftingPoint);
            vehicle.chassisBody.applyForce(liftingForce, liftingPoint);

            vehicle.chassisBody.angularDamping = 0.9;
            vehicle.chassisBody.linearDamping = 0.9;
        } else {
            vehicle.chassisBody.angularDamping = 0.01;
            vehicle.chassisBody.linearDamping = 0.01;
        }

        if (e.type === 'keydown' && e.repeat) {
            return;
        }
        if (e.type === 'keyup') {
            keysPressed.delete(pressedKey);
        } else {
            keysPressed.add(pressedKey);
        }

        const accelerationMultiplier = isKeyDown('W') ? 1 : isKeyDown('S') ? -1 : 0;
        [0, 1, 2, 3].forEach(wheelIndex => vehicle.applyEngineForce(maxForce * accelerationMultiplier, wheelIndex));
        

        const steeringDirection = isKeyDown('A') ? 1 : isKeyDown('D') ? -1 : 0;
        [0, 1].forEach(wheelIndex => vehicle.setSteeringValue(maxSteeringValue * steeringDirection, wheelIndex));

        const brakeMultiplier = Number(isKeyDown(' '));
        [2, 3].forEach(wheelIndex => vehicle.setBrake(brakeForce * brakeMultiplier, wheelIndex));
    };
}

function preventPageScrolling(e) {
    const navigationKeys = [
        ' ',
        'PageUp',
        'PageDown',
        'End',
        'Home',
        'ArrowLeft',
        'ArrowUp',
        'ArrowRight',
        'ArrowDown',
    ];

    if (navigationKeys.includes(e.key)) {
        e.preventDefault();
    }
}
