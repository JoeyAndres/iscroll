let _IScroll = require('./core');

function extend(destination, source) {
    var property;
    for (property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            utils.deepExtend(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
};

class IScroll extends _IScroll {}
extend(IScroll.prototype, require('./default/_animate'));
extend(IScroll.prototype, require('./default/handleEvent'));
extend(IScroll.prototype, require('./indicator/indicator'));

(function (window, document, Math) {
    if (typeof module !== 'undefined') {
        module.exports = IScroll;
    }

    if ( typeof window !== 'undefined' && !window.IScroll) {
        window.IScroll = IScroll;
    }
})(window, document, Math);