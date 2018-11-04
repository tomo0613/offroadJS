const WebSocket = require('ws');

function createWebSocketServer(httpServer) {
    console.info('create WebSocket server');
    const socketServer = new WebSocket.Server({server: httpServer});

    socketServer.on('connection', (client, request) => initSocketConnection(client, socketServer, request));
}

let connectionCounter = 0;

function initSocketConnection(client, server, request) {
    client.id = connectionCounter++;

    console.info('SocketServer::', `client connected[${client.id}]`);
    
    client.sendMessage = (message) => sendMessage(client, message);
    client.on('message', (message) => onClientMessage(JSON.parse(message)));

    // client.on('close', () => game.removeStateListener(onUpdate));

    function onClientMessage(message) {
        console.log('handleClientMessage', message);

        if (message.type === 'register_controller') {
            client.isController = true;
        }

        if (client.isController && message.type === 'controls_from_controller') {
            getClientList()
                .filter(aClient => !aClient.isController)
                .forEach(aClient => aClient.sendMessage({
                    type: 'controls_from_server',
                    target: message.target,
                    value: message.value,
                }));
        }
        // ToDo forward controls to client
    }

    function getClientList() {
        return [...server.clients];
    }
}

function sendMessage(client, message) {
    if (client.readyState === WebSocket.OPEN) {
        const msg = JSON.stringify(message);

        client.send(msg);
    }
}

function handleDisconnection(client) {
    return () => {

    };
}

module.exports = createWebSocketServer;
