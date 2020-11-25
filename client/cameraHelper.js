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

function initChaseCamera(camera, target) {
    const cameraMovementSpeed = 0.05; 
    const cameraLookPositionHeightOffset = 5;
    const cameraMountPosition = new THREE.Vector3();
    const cameraLookPosition = new THREE.Vector3();
    const chaseCameraMountPositionHelper = new THREE.Object3D();
    chaseCameraMountPositionHelper.position.set(0, 8, 15);
    target.add(chaseCameraMountPositionHelper);

    return () => {
        chaseCameraMountPositionHelper.getWorldPosition(cameraMountPosition);

        if (cameraMountPosition.y < target.position.y) {
            cameraMountPosition.setY(target.position.y);
        }

        camera.position.lerp(cameraMountPosition, cameraMovementSpeed);
        cameraLookPosition.copy(target.position).y += cameraLookPositionHeightOffset;

        camera.lookAt(cameraLookPosition);
    };
}
