import createSlider from './slider.js';

let socketConnection;

connect();
createSliders();

function connect() {
    socketConnection = new WebSocket('ws://' + window.location.host);
    
    initConnection();
};

function initConnection() {
    console.info('init WebSocket connection');
    socketConnection.addEventListener('open', () => {
        console.info('connected');

        sendSocketMessage({type: 'register_controller'});

        socketConnection.addEventListener('message', onSocketMessage);
        socketConnection.addEventListener('close', onSocketClose);
    });
    socketConnection.addEventListener('error', () => alert('connection error'));
}

function sendSocketMessage(data) {
    if (socketConnection && socketConnection.readyState === socketConnection.OPEN) {
        socketConnection.send(JSON.stringify(data));
    }
}

function onSocketMessage(e) {
    console.log(JSON.parse(e.data));
}

function onSocketClose() {
    console.info('disconnected');
    alert('connection lost');
}

function createSliders() {
    [{
        id: 'acceleration',
        width: 50,
        height: 250,
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 0,
    }, {
        id: 'brakeForce',
        width: 50,
        height: 250,
        min: 0,
        max: 1,
        step: 0.01,
        defaultValue: 0,
    }, {
        id: 'steeringValue',
        width: 250,
        height: 50,
        min: -0.5,
        max: 0.5,
        step: 0.01,
        defaultValue: 0,
    }].forEach((props) => {
        props.onChange = (value) => {
            sendSocketMessage({
                type: 'controls_from_controller',
                target: props.id,
                value
            });
        };

        createSlider(props, document.body);
    });
}

if (window.DeviceOrientationEvent) {
    const rotationAxis = 'beta';
    const rotationLimit = 15;
    let originRotation = 0;
    let currentRotation = 0;
    let value;

    /**
     * Use of the orientation sensor is deprecated
     */
    addEventListener('deviceorientation', (e) => {
        value = Math.round(e[rotationAxis]); // ToDo -origin
        value = Math.max(-rotationLimit, Math.min(value, rotationLimit));
        value = value / rotationLimit * 0.5

        if (currentRotation === value) {
            return;            
        }

        currentRotation = value;

        // console.log(currentRotation);

        sendSocketMessage({
            type: 'controls_from_controller',
            target: 'steeringValue',
            value
        });
    });
}
