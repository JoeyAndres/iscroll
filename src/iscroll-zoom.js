let _IScroll = require('./core');
let {rAF: rAF, utils: utils} = require('./utils');

function extend(destination, source) {
    var property;
    for (property in source) {
        if (source[property] && source[property].constructor && source[property].constructor === Object) {
            destination[property] = destination[property] || {};
            extend(destination[property], source[property]);
        } else {
            destination[property] = source[property];
        }
    }
    return destination;
};

class IScroll extends _IScroll {
    constructor(el, options) {
        options = options || {};
        options = extend(options, {
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

extend(IScroll.prototype, require('./indicator/_initIndicators'));
extend(IScroll.prototype, require('./zoom/zoom'));
extend(IScroll.prototype, require('./wheel/wheel'));
extend(IScroll.prototype, require('./snap/snap'));
extend(IScroll.prototype, require('./snap/_end'));
extend(IScroll.prototype, require('./keys/keys'));
extend(IScroll.prototype, require('./default/_animate'));
extend(IScroll.prototype, require('./zoom/handleEvent'));
extend(IScroll.prototype, require('./indicator/indicator'));
extend(IScroll.prototype, require('./zoom/refresh'));

(function (window, document, Math) {
    if (typeof module !== 'undefined') {
        module.exports = IScroll;
    }

    if ( typeof window !== 'undefined' && !window.IScroll) {
        window.IScroll = IScroll;
    }
})(window, document, Math);