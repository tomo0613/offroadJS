export {
    loadResource,
    sliceCubeTexture,
    debounce,
    throttle,
};

function loadResource(url) {
    const extension = url.split('.').pop();
    let loader;

    switch (extension) {
        case 'jpg':
            loader = new THREE.ImageLoader();
            break;
        case 'glb':
        case 'gltf':
            loader = new THREE.GLTFLoader();
            break;
        default:
            return Promise.reject(new Error(`unknown resource type [${extension}]`));
    }

    return new Promise((resolve, reject) => {
        const onLoad = (resource) => resolve(resource);
        const onProgress = () => {};
        const onError = (e) => {
            console.error('Failed to load resource: ' + e.target.src);
            reject(e);
        };

        loader.load(url, onLoad, onProgress, onError);
    });
}

function sliceCubeTexture(img, imgSize = 1024) {
    const cubeTextureMap = [
        {x: 2, y: 1},
        {x: 0, y: 1},
        {x: 1, y: 0},
        {x: 1, y: 2},
        {x: 1, y: 1},
        {x: 3, y: 1},
    ];

    return cubeTextureMap.map((positionOffset) => getFace(positionOffset.x, positionOffset.y));

    function getFace(x, y) {
        const canvas = document.createElement('canvas');
        canvas.width = imgSize;
        canvas.height = imgSize;
        canvas.getContext('2d').drawImage(img, -x * imgSize, -y * imgSize);

        return canvas;
    }
}

function debounce(fnc, delay = 200, immediate = false) {
    let timeoutId;

    return (...args) => {
        if (immediate && !timeoutId) {
            fnc(...args);
        }
        clearTimeout(timeoutId);
        timeoutId = setTimeout(() => fnc(...args), delay);
    };
};

function throttle(fnc, timeToWaitBeforeNextCall = 200) {
    let timeoutId;
    let prevCallTime;
    let now;
    let nextScheduledCallTime;

    return (...args) => {
        nextScheduledCallTime = prevCallTime + timeToWaitBeforeNextCall;
        now = performance.now();

        if (!prevCallTime || now > nextScheduledCallTime) {
            fnc(...args);
            prevCallTime = now;
        } else {
            clearTimeout(timeoutId);
            timeoutId = setTimeout(() => {
                fnc(...args);
                prevCallTime = now;
            }, timeToWaitBeforeNextCall - (now - prevCallTime));
        }
    };
};
