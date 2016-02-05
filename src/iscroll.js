let _IScroll = require('./core');
let _ = require('underscore');

class IScroll extends _IScroll {
    constructor(el, options) {
        options = _.extend(options, {
            resizeScrollbars: true,
            mouseWheelSpeed: 20,
            snapThreshold: 0.334
        });
        super(el, options);
    }

    refresh() {
        super.refresh();
        require('./snap/refresh').call(this);
    }

    _init() {
        super._init();
        if ( this.options.scrollbars || this.options.indicators ) { this._initIndicators(); }
        if ( this.options.mouseWheel ) { this._initWheel(); }
        if ( this.options.snap ) { this._initSnap(); }
        if ( this.options.keyBindings ) { this._initKeys(); }
    }

    _transitionTime(time) {
        super._transitionTime(time);
        return require('./indicator/_transitionTime').call(this, time);
    }

    _transitionTimingFunction (easing) {
        super._transitionTimingFunction (easing);
        return require('./indicator/_transitionTimingFunction').call(this, easing);
    }

    _translate (x, y) {
        super._translate(x, y);
        return require('./indicator/_translate').call(this, x, y);
    }

    _normalize () {
        if (this.options.shrinkScrollbars == 'scale') {
            this.options.useTransition = false;
        }
        this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;
        super._normalize();
    }

    _initIndicators () {
        return require('./indicator/_initIndicators').call(this);
    }
}

_.extend(IScroll.prototype, require('./wheel/wheel'));
_.extend(IScroll.prototype, require('./snap/snap'));
_.extend(IScroll.prototype, require('./snap/_end'));
_.extend(IScroll.prototype, require('./keys/keys'));
_.extend(IScroll.prototype, require('./default/_animate'));
_.extend(IScroll.prototype, require('./default/handleEvent'));
_.extend(IScroll.prototype, require('./indicator/indicator'));

(function (window, document, Math) {
    if ( typeof window !== 'undefined' && !window.IScroll) {
        window.IScroll = IScroll;
    }
})(window, document, Math);