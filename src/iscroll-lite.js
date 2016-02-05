let _IScroll = require('./core');
let {rAF: rAF, utils: utils} = require('./utils');

class IScroll extends _IScroll {}
utils.extend(IScroll.prototype, require('./default/_animate'));
utils.extend(IScroll.prototype, require('./default/handleEvent'));
utils.extend(IScroll.prototype, require('./indicator/indicator'));

(function (window, document, Math) {
    if (typeof module !== 'undefined') {
        module.exports = IScroll;
    }

    if ( typeof window !== 'undefined' && !window.IScroll) {
        window.IScroll = IScroll;
    }
})(window, document, Math);