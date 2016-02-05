let _IScroll = require('./core');
let {rAF: rAF, utils: utils} = require('./utils');

class IScroll extends _IScroll {
    constructor(el, options) {
        options = options || {};
        utils.extend(options, {
            resizeScrollbars: true,
            mouseWheelSpeed: 20,
            snapThreshold: 0.334,

            zoomMin: 1,
            zoomMax: 4,
            startZoom: 1
        });
        super(el, options);
        this.scale = Math.min(Math.max(this.options.startZoom, this.options.zoomMin), this.options.zoomMax);
    }

    refresh() {
        super.refresh();
        require('./snap/refresh').call(this);
    }

    _init() {
        super._init();
        if ( this.options.scrollbars || this.options.indicators ) { this._initIndicators(); }
        if ( this.options.zoom ) { this._initZoom(); }
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

    __translate (x, y) {
        this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px) scale(' + this.scale + ') ' + this.translateZ;
    }

    _normalize () {
        if (this.options.shrinkScrollbars == 'scale') {
            this.options.useTransition = false;
        }
        this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;
        super._normalize();
    }
}

utils.extend(IScroll.prototype, require('./indicator/_initIndicators'));
utils.extend(IScroll.prototype, require('./zoom/zoom'));
utils.extend(IScroll.prototype, require('./wheel/wheel'));
utils.extend(IScroll.prototype, require('./snap/snap'));
utils.extend(IScroll.prototype, require('./snap/_end'));
utils.extend(IScroll.prototype, require('./keys/keys'));
utils.extend(IScroll.prototype, require('./default/_animate'));
utils.extend(IScroll.prototype, require('./zoom/handleEvent'));
utils.extend(IScroll.prototype, require('./indicator/indicator'));
utils.extend(IScroll.prototype, require('./zoom/refresh'));

(function (window, document, Math) {
    if (typeof module !== 'undefined') {
        module.exports = IScroll;
    }

    if ( typeof window !== 'undefined' && !window.IScroll) {
        window.IScroll = IScroll;
    }
})(window, document, Math);