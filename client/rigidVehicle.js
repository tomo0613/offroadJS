// view-source:http://schteppe.github.io/cannon.js/demos/rigidVehicle.html
export class RigidVehicle {
    constructor({chassisBody}) {
        this.chassisBody = chassisBody;
        this.wheels = [];
        this.torque = new CANNON.Vec3();

        this._wheelRotation = new THREE.Euler();
        this._wheelRotationAxis = new THREE.Vector3();
        this._wheelRotationMatrix = new THREE.Matrix4();

        this._update = this._update.bind(this);
        this._applyWheelForce = this._applyWheelForce.bind(this);
    }

    addWheel({body,  position, spinAxis}) {
        const wheelAxisConstraint = new CANNON.HingeConstraint(this.chassisBody, body, {
            pivotA: position,
            axisA: spinAxis,
            pivotB: CANNON.Vec3.ZERO,
            axisB: spinAxis,
        });

        //  set `wheelBody.position` relative to `chassisBody.position`
        this.chassisBody.pointToWorldFrame(position, body.position);

        // var spring = new CANNON.Spring(boxBody,sphereBody,{
        //     localAnchorA: new CANNON.Vec3(size,0,size),
        //     localAnchorB: new CANNON.Vec3(0,0,0),
        //     restLength : 0,
        //     stiffness : 50,
        //     damping : 1,
        // });

        this.wheels.push({body, axis: spinAxis, force: 0, axisConstraint: wheelAxisConstraint});
    }

    addToWorld(world) {
        world.addBody(this.chassisBody);
        this.wheels.forEach(({body, axisConstraint}) => {
            world.addBody(body);
            world.addConstraint(axisConstraint);
        });

        world.addEventListener('preStep', this._update);


        // const m1 = new CANNON.Material('m1');
        // const platformMaterial = new CANNON.Material('platformMaterial');
        // const cm = new CANNON.ContactMaterial(m1, platformMaterial, {
        //     friction: 0.5,
        //     restitution: 0,
        //     contactEquationStiffness: 1000,
        // });
        // gWorld.addContactMaterial(cm);
    }

    setSteeringValue(value, wheelIndex) {
        // if () return;
        this._wheelRotation.y = value;
        this._wheelRotationMatrix.makeRotationFromEuler(this._wheelRotation);
        this._wheelRotationAxis.copy(this.wheels[wheelIndex].axis).applyMatrix4(this._wheelRotationMatrix);
        this.wheels[wheelIndex].axisConstraint.axisA.copy(this._wheelRotationAxis);
    };

    setWheelForce(value, wheelIndex) {
        this.wheels[wheelIndex].force = value;
    }

    _applyWheelForce(wheel) {
        wheel.axis.scale(wheel.force, this.torque);
        wheel.body.vectorToWorldFrame(this.torque, this.torque);
        wheel.body.torque.vadd(this.torque, wheel.body.torque);
    }

    _update() {
        this.wheels.forEach(this._applyWheelForce);
        // spring.applyForce();
    }

    get wheelMaterial() {
        return this.wheels[0].body.material;
    }
}

export default function createVehicle() {
    const chassisBody = new CANNON.Body({mass: 60});
    const chassisBaseShape = new CANNON.Box(new CANNON.Vec3(2.1, 0.4, 0.9));
    const chassisTopShape = new CANNON.Box(new CANNON.Vec3(1.2, 0.4, 0.9));
    chassisBody
        .addShape(chassisBaseShape, new CANNON.Vec3(0.1, 0, 0))
        .addShape(chassisTopShape, new CANNON.Vec3(0.8, 0.8, 0));

    // Create the vehicle
    const vehicle = new RigidVehicle({chassisBody});

    // const axisWidth = 1.7;
    const axisWidth = 2.7;
    const height = -0.5;
    const wheelAxis = new CANNON.Vec3(0, 0, 1);
    const wheelSuspensionAxis = new CANNON.Vec3(0, -1, 0);

    const wheelMaterial = new CANNON.Material('wheelMaterial');
    const wheelShape = new CANNON.Cylinder(0.5, 0.5, 0.4, 20);

    function createWheelBody() {
        return new CANNON.Body({mass: 1, material: wheelMaterial, shape: wheelShape, angularDamping: 0.4});
    }

    // 
    vehicle.addWheel({
        body: createWheelBody(),
        position: new CANNON.Vec3(-1.2, height, -axisWidth/2),
        spinAxis: wheelAxis,
        suspensionAxis: wheelSuspensionAxis,
    });
    vehicle.addWheel({
        body: createWheelBody(),
        position: new CANNON.Vec3(-1.2, height, axisWidth/2),
        spinAxis: wheelAxis,
        suspensionAxis: wheelSuspensionAxis,
    });
    vehicle.addWheel({
        body: createWheelBody(),
        position: new CANNON.Vec3(1.35, height, -axisWidth/2),
        spinAxis: wheelAxis,
        suspensionAxis: wheelSuspensionAxis,
    });
    vehicle.addWheel({
        body: createWheelBody(),
        position: new CANNON.Vec3(1.35, height, axisWidth/2),
        spinAxis: wheelAxis,
        suspensionAxis: wheelSuspensionAxis,
    });

    initControls(vehicle);

    return vehicle;
}

function initControls(vehicle) {
    const keysPressed = new Set();
    const isKeyDown = (key) => keysPressed.has(key);
    const maxSteeringValue = 0.5;
    const maxForce = 80;

    const liftingPoint = new CANNON.Vec3();
    const liftingForce = new CANNON.Vec3(0, 3000, 0);
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
        [0, 1, 2, 3].forEach(wheelIndex => vehicle.setWheelForce(maxForce * accelerationMultiplier, wheelIndex));

        const steeringDirection = isKeyDown('A') ? 1 : isKeyDown('D') ? -1 : 0;
        [0, 1].forEach(wheelIndex => vehicle.setSteeringValue(maxSteeringValue * steeringDirection, wheelIndex));

        if (isKeyDown(' ')) {
            [2, 3].forEach(wheelIndex => vehicle.setWheelForce(0, wheelIndex));
        }
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
