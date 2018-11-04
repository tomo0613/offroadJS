// Slider for multi touch events
export default function createSlider(props, targetElement) {
    let sliderValue;
    const container = document.createElement('section');
    const thumb = document.createElement('div');

    const horizontal = props.width > props.height;
    const thumbSize = Math.min(props.width, props.height);
    thumb.className = 'controller-thumb';
    thumb.style.width = thumbSize + 'px';
    thumb.style.height = thumbSize + 'px';
    thumb.style.position = 'absolute';

    container.id = props.id;
    container.className = 'controller-container';
    container.style.width = props.width + 'px';
    container.style.height = props.height + 'px';
    container.style.position = 'relative';

    container.addEventListener('touchstart', setByTouch);
    container.addEventListener('touchmove', setByTouch);
    container.addEventListener('touchend', resetValue);
    container.addEventListener('touchcancel', resetValue);

    container.appendChild(thumb);
    targetElement.appendChild(container);

    const totalSteps = (props.max - props.min) / props.step;
    const effectiveSliderLength = container[horizontal ? 'offsetWidth' : 'offsetHeight'] - thumbSize;
    
    const sliderStepSize = effectiveSliderLength / totalSteps;

    resetValue();

    function setValue(value) {
        if (sliderValue === value) {
            return;
        }
        
        sliderValue = value;

        thumb.style[horizontal ? 'left' : 'bottom'] = valueToPosition(value) + 'px';

        if (typeof props.onChange === 'function') {
            props.onChange(value);
            console.log(value);
            
        }
    }

    function resetValue() {
        setValue(props.defaultValue);
    }

    function setByTouch(e) {
        e.preventDefault();

        const relevantTouchEvent = e.targetTouches[e.targetTouches.length - 1];
        const eventPosition = relevantTouchEvent[horizontal ? 'clientX' : 'clientY'];
        const relativeTouchPosition = horizontal
            ? eventPosition - container.offsetLeft
            : container.offsetTop + container.offsetHeight - eventPosition;

        const maxThumbPosition = container[horizontal ? 'offsetWidth' : 'offsetHeight'] - thumbSize;        
        const minThumbPosition = 0;
        const thumbPositionTarget = relativeTouchPosition - thumbSize / 2;
        const thumbPosition = Math.max(minThumbPosition, Math.min(thumbPositionTarget, maxThumbPosition));

        setValue(positionToValue(thumbPosition));
    }

    function positionToValue(thumbPosition) {
        const percentageByPosition = thumbPosition / sliderStepSize;

        return props.min + percentageByPosition / totalSteps;
    }

    function valueToPosition(sliderValue) {
        const percentageByValue = (sliderValue - props.min) * totalSteps;

        return sliderStepSize * percentageByValue
    }
}
