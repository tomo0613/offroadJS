module.exports = {
    isMobileDevice,
};

function isMobileDevice(userAgent) {
    return [
        /Android/i,
        /iPhone/i,
    ].some(regExp => regExp.test(userAgent));
}
