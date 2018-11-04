export {
    loadResource,
    sliceCubeTexture,
};

function loadResource(url) {
    const extension = url.split('.').pop();
    let loader;

    switch (extension) {
        case 'jpg':
            loader = new THREE.ImageLoader();
            break;
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

const sliceCubeTexture = (img, imgSize = 1024) => {
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
};
