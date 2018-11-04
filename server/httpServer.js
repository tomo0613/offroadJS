const fs = require('fs');
const http = require('http');
const utils = require('./utils');
const createSocketServer = require('./socketServer');

const port = process.env.PORT || 3000;
const defaultPath = '/index.html';

const httpServer = http.createServer(onRequest);

createSocketServer(httpServer);

httpServer.listen(port, () => console.info(`Server is listening at http://localhost:${port} \n`));

function onRequest(request, response) {
    let basePath = './client';

    if (utils.isMobileDevice(request.headers['user-agent'])) {
        basePath = './controller';
    }

    const resourcePath = basePath + (request.url === '/' ? defaultPath : request.url);

    console.info(`request: "${request.url}" response: "${resourcePath}"`);
    serveFile(resourcePath, response);
}

async function serveFile(filePath, response) {
    try {
        const fileContent = await readFile(filePath);
        response.setHeader('Content-Type', getContentType(filePath));
        response.end(fileContent);
    } catch (error) {
        console.error(error);
    }
}

function readFile(filePath, options) {
    return new Promise((resolve, reject) => {
        fs.readFile(filePath, options, (error, data) => {
            if (error) {
                reject(error);
            } else {
                resolve(data);
            }
        });
    });
}

function getContentType(filePath) {
    const fileExtension = filePath.split('.').pop();

    switch (fileExtension) {
        case 'css':
            return 'text/css';
        case 'html':
            return 'text/html';
        case 'js':
            return 'application/javascript';
        case 'json':
            return 'application/json';
        default:
            return 'text/plain';
    }
}
