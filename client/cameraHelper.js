export const cameraHelper = {
    init: initCameraHelper,
    switch: () => {},
    update: () => {},
};

function initCameraHelper(camera, target, controllerScope) {
    const cameraController = new THREE.OrbitControls(camera, controllerScope);

    let cameraId = 0;

    cameraHelper.switch = () => {
        switch (cameraId++) {
            case 0:
                console.info('Chase camera');
                
                target.remove(camera);
                camera.fov = 50;
                cameraHelper.update = initChaseCamera(camera, target);
                break;
            case 1:
                console.info('Static camera');
    
                cameraHelper.update = () => camera.lookAt(target.position);
                break;
            case 2:
                console.info('Hood camera');
    
                target.add(camera);
                camera.position.set(0, 1.5, 0);
                camera.rotation.set(0, 0, 0);
                camera.fov = 70;
                cameraHelper.update = () => {};
                break;
            default:
                cameraId = 0;
                cameraHelper.switch();
        }
    }

    cameraHelper.switch();
}

function getChaseCamera(params) {
    // ToDo memo
}

function initChaseCamera(camera, target) {
    const cameraTargetPosition = new THREE.Vector3();
    const cameraOffset = new THREE.Vector3();
    const rotationMatrix = new THREE.Matrix4();

    return () => {
        cameraOffset.set(0, 3, 10);
        rotationMatrix.makeRotationFromQuaternion(target.quaternion);
    
        cameraOffset.applyMatrix4(rotationMatrix);
        cameraTargetPosition.copy(target.position).add(cameraOffset);
    
        camera.position.lerp(cameraTargetPosition, 0.1);
        camera.lookAt(target.position);
    };
}
