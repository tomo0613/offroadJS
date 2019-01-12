let socketConnection;
let onSocketMessage = (message) => console.log('unhandled message', message);

function connectToServer() {
    if (window.location.host.includes('github')) {
        console.info('WebSocket connection can only be established on non static servers');
        return;
    }
    socketConnection = new WebSocket('ws://' + window.location.host);

    socketConnection.addEventListener('open', () => {
        console.info('connected');

        socketConnection.addEventListener('message', (message) => {
            const action = JSON.parse(message.data);
            if (action.type === 'controls_from_server') {
                onSocketMessage(action);
            }
        });
        // socketConnection.addEventListener('close', onSocketClose); 
    });
}

function sendMessage(data) {
    if (socketConnection) {
        socketConnection.send(JSON.stringify(data));
    } else {
        console.error('no connection');
    }
}

const socketHandler = {
    connectToServer,
    sendMessage,
};

Object.defineProperty(socketHandler, 'onmessage', {
    set(handler) {
        if (typeof handler === 'function') {
            onSocketMessage = handler;
        } else {
            console.error('handler should be a function, ' + typeof handler + ' was given');
        }
    },
});

export default socketHandler;
