let {rAF: rAF, utils: utils} = require('./utils');

class IScroll {
    constructor(el, options) {
        this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
        this.scroller = this.wrapper.children[0];
        this.scrollerStyle = this.scroller.style;		// cache style for better performance

        this.options = {
            startX: 0,
            startY: 0,
            scrollY: true,
            directionLockThreshold: 5,
            momentum: true,

            bounce: true,
            bounceTime: 600,
            bounceEasing: '',

            preventDefault: true,
            preventDefaultException: {tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/},

            HWCompositing: true,
            useTransition: true,
            useTransform: true,

            stopPropagation: true
        };

        for (var i in options) {
            this.options[i] = options[i];
        }

        // Normalize options
        this.translateZ = this.options.HWCompositing && utils.hasPerspective ? ' translateZ(0)' : '';

        this.options.useTransition = utils.hasTransition && this.options.useTransition;
        this.options.useTransform = utils.hasTransform && this.options.useTransform;

        this.options.eventPassthrough = this.options.eventPassthrough === true ? 'vertical' : this.options.eventPassthrough;
        this.options.preventDefault = !this.options.eventPassthrough && this.options.preventDefault;

        // If you want eventPassthrough I have to lock one of the axes
        this.options.scrollY = this.options.eventPassthrough == 'vertical' ? false : this.options.scrollY;
        this.options.scrollX = this.options.eventPassthrough == 'horizontal' ? false : this.options.scrollX;

        // With eventPassthrough we also need lockDirection mechanism
        this.options.freeScroll = this.options.freeScroll && !this.options.eventPassthrough;
        this.options.directionLockThreshold = this.options.eventPassthrough ? 0 : this.options.directionLockThreshold;

        this.options.bounceEasing = typeof this.options.bounceEasing == 'string' ? utils.ease[this.options.bounceEasing] || utils.ease.circular : this.options.bounceEasing;

        this.options.resizePolling = this.options.resizePolling === undefined ? 60 : this.options.resizePolling;

        if (this.options.tap === true) {
            this.options.tap = 'tap';
        }

        this._normalize();

        // Some defaults
        this.x = 0;
        this.y = 0;
        this.directionX = 0;
        this.directionY = 0;
        this._events = {};

        this._insert_point();

        this._init();
        this.refresh();

        this.scrollTo(this.options.startX, this.options.startY);
        this.enable();

        this.version = '5.1.3';
    }

    _init () { this._initEvents(); }

    destroy () {
        this._initEvents(true);

        this._execEvent('destroy');
    }

    _transitionEnd(e) {
        if (e.target != this.scroller || !this.isInTransition) {
            return;
        }

        this._transitionTime();
        if (!this.resetPosition(this.options.bounceTime)) {
            this.isInTransition = false;
            this._execEvent('scrollEnd');
        }
    }

    _start(e) {
        if (this.options.stopPropagation) { e.stopPropagation(); }

        // React to left mouse button only
        if (utils.eventType[e.type] != 1) {
            if (e.button !== 0) {
                return;
            }
        }

        if (!this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated)) {
            return;
        }

        if (this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
            e.preventDefault();
        }

        var point = e.touches ? e.touches[0] : e,
            pos;

        this.initiated = utils.eventType[e.type];
        this.moved = false;
        this.distX = 0;
        this.distY = 0;
        this.directionX = 0;
        this.directionY = 0;
        this.directionLocked = 0;

        this._transitionTime();

        this.startTime = utils.getTime();

        if (this.options.useTransition && this.isInTransition) {
            this.isInTransition = false;
            pos = this.getComputedPosition();
            this._translate(Math.round(pos.x), Math.round(pos.y));
            this._execEvent('scrollEnd');
        } else if (!this.options.useTransition && this.isAnimating) {
            this.isAnimating = false;
            this._execEvent('scrollEnd');
        }

        this.startX = this.x;
        this.startY = this.y;
        this.absStartX = this.x;
        this.absStartY = this.y;
        this.pointX = point.pageX;
        this.pointY = point.pageY;

        this._execEvent('beforeScrollStart');
    }

    _move (e) {
        if (this.options.stopPropagation) { e.stopPropagation(); }

        if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
            return;
        }

        if (this.options.preventDefault) {  // increases performance on Android? TODO: check!
            e.preventDefault();
        }

        var point = e.touches ? e.touches[0] : e,
            deltaX = point.pageX - this.pointX,
            deltaY = point.pageY - this.pointY,
            timestamp = utils.getTime(),
            newX, newY,
            absDistX, absDistY;

        this.pointX = point.pageX;
        this.pointY = point.pageY;

        this.distX += deltaX;
        this.distY += deltaY;
        absDistX = Math.abs(this.distX);
        absDistY = Math.abs(this.distY);

        // We need to move at least 10 pixels for the scrolling to initiate
        if (timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10)) {
            return;
        }

        // If you are scrolling in one direction lock the other
        if (!this.directionLocked && !this.options.freeScroll) {
            if (absDistX > absDistY + this.options.directionLockThreshold) {
                this.directionLocked = 'h';		// lock horizontally
            } else if (absDistY >= absDistX + this.options.directionLockThreshold) {
                this.directionLocked = 'v';		// lock vertically
            } else {
                this.directionLocked = 'n';		// no lock
            }
        }

        if (this.directionLocked == 'h') {
            if (this.options.eventPassthrough == 'vertical') {
                e.preventDefault();
            } else if (this.options.eventPassthrough == 'horizontal') {
                this.initiated = false;
                return;
            }

            deltaY = 0;
        } else if (this.directionLocked == 'v') {
            if (this.options.eventPassthrough == 'horizontal') {
                e.preventDefault();
            } else if (this.options.eventPassthrough == 'vertical') {
                this.initiated = false;
                return;
            }

            deltaX = 0;
        }

        deltaX = this.hasHorizontalScroll ? deltaX : 0;
        deltaY = this.hasVerticalScroll ? deltaY : 0;

        newX = this.x + deltaX;
        newY = this.y + deltaY;

        // Slow down if outside of the boundaries
        if (newX > 0 || newX < this.maxScrollX) {
            newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
        }
        if (newY > 0 || newY < this.maxScrollY) {
            newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
        }

        this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
        this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

        if (!this.moved) {
            this._execEvent('scrollStart');
        }

        this.moved = true;

        this._translate(newX, newY);

        /* REPLACE START: _move */

        if (timestamp - this.startTime > 300) {
            this.startTime = timestamp;
            this.startX = this.x;
            this.startY = this.y;
        }

        /* REPLACE END: _move */

    }

    _end (e) {
        if (this.options.stopPropagation) { e.stopPropagation(); }

        if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
            return;
        }

        if (this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException)) {
            e.preventDefault();
        }

        var point = e.changedTouches ? e.changedTouches[0] : e,
            momentumX,
            momentumY,
            duration = utils.getTime() - this.startTime,
            newX = Math.round(this.x),
            newY = Math.round(this.y),
            distanceX = Math.abs(newX - this.startX),
            distanceY = Math.abs(newY - this.startY),
            time = 0,
            easing = '';

        this.isInTransition = 0;
        this.initiated = 0;
        this.endTime = utils.getTime();

        // reset if we are outside of the boundaries
        if (this.resetPosition(this.options.bounceTime)) {
            return;
        }

        this.scrollTo(newX, newY);	// ensures that the last position is rounded

        // we scrolled less than 10 pixels
        if (!this.moved) {
            if (this.options.tap) {
                utils.tap(e, this.options.tap);
            }

            if (this.options.click) {
                utils.click(e);
            }

            this._execEvent('scrollCancel');
            return;
        }

        if (this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100) {
            this._execEvent('flick');
            return;
        }

        // start momentum animation if needed
        if (this.options.momentum && duration < 300) {
            momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : {
                destination: newX,
                duration: 0
            };
            momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : {
                destination: newY,
                duration: 0
            };
            newX = momentumX.destination;
            newY = momentumY.destination;
            time = Math.max(momentumX.duration, momentumY.duration);
            this.isInTransition = 1;
        }

        let { newX: _newX, newY: _newY, time: _time, easing: _easing } = this.__end(newX, newY, time, easing);
        newX = _newX;
        newY = _newY;
        time = _time;
        easing = _easing;

        if (newX != this.x || newY != this.y) {
            // change easing function when scroller goes out of the boundaries
            if (newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY) {
                easing = utils.ease.quadratic;
            }

            this.scrollTo(newX, newY, time, easing);
            return;
        }

        this._execEvent('scrollEnd');
    }

    _resize () {
        var that = this;

        clearTimeout(this.resizeTimeout);

        this.resizeTimeout = setTimeout(function () {
            that.refresh();
        }, this.options.resizePolling);
    }

    resetPosition (time) {
        var x = this.x,
            y = this.y;

        time = time || 0;

        if (!this.hasHorizontalScroll || this.x > 0) {
            x = 0;
        } else if (this.x < this.maxScrollX) {
            x = this.maxScrollX;
        }

        if (!this.hasVerticalScroll || this.y > 0) {
            y = 0;
        } else if (this.y < this.maxScrollY) {
            y = this.maxScrollY;
        }

        if (x == this.x && y == this.y) {
            return false;
        }

        this.scrollTo(x, y, time, this.options.bounceEasing);

        return true;
    }

    disable () {
        this.enabled = false;
    }

    enable () {
        this.enabled = true;
    }

    refresh () {
        var rf = this.wrapper.offsetHeight;		// Force reflow

        this.wrapperWidth = this.wrapper.clientWidth;
        this.wrapperHeight = this.wrapper.clientHeight;

        let {width: width, height: height} = this._getScrollerSize();
        this.scrollerWidth = width;
        this.scrollerHeight = height;

        this.maxScrollX = this.wrapperWidth - this.scrollerWidth;
        this.maxScrollY = this.wrapperHeight - this.scrollerHeight;

        this.hasHorizontalScroll = this.options.scrollX && this.maxScrollX < 0;
        this.hasVerticalScroll = this.options.scrollY && this.maxScrollY < 0;

        if (!this.hasHorizontalScroll) {
            this.maxScrollX = 0;
            this.scrollerWidth = this.wrapperWidth;
        }

        if (!this.hasVerticalScroll) {
            this.maxScrollY = 0;
            this.scrollerHeight = this.wrapperHeight;
        }

        this.endTime = 0;
        this.directionX = 0;
        this.directionY = 0;

        this.wrapperOffset = utils.offset(this.wrapper);

        this._execEvent('refresh');

        this.resetPosition();
    }

    on (type, fn) {
        if (!this._events[type]) {
            this._events[type] = [];
        }

        this._events[type].push(fn);
    }

    off (type, fn) {
        if (!this._events[type]) {
            return;
        }

        var index = this._events[type].indexOf(fn);

        if (index > -1) {
            this._events[type].splice(index, 1);
        }
    }

    _execEvent (type) {
        if (!this._events[type]) {
            return;
        }

        var i = 0,
            l = this._events[type].length;

        if (!l) {
            return;
        }

        for (; i < l; i++) {
            this._events[type][i].apply(this, [].slice.call(arguments, 1));
        }
    }

    scrollBy (x, y, time, easing) {
        x = this.x + x;
        y = this.y + y;
        time = time || 0;

        this.scrollTo(x, y, time, easing);
    }

    scrollTo (x, y, time, easing) {
        easing = easing || utils.ease.circular;

        this.isInTransition = this.options.useTransition && time > 0;

        if (!time || (this.options.useTransition && easing.style)) {
            this._transitionTimingFunction(easing.style);
            this._transitionTime(time);
            this._translate(x, y);
        } else {
            this._animate(x, y, time, easing.fn);
        }
    }

    scrollToElement (el, time, offsetX, offsetY, easing) {
        el = el.nodeType ? el : this.scroller.querySelector(el);

        if (!el) {
            return;
        }

        var pos = utils.offset(el);

        pos.left -= this.wrapperOffset.left;
        pos.top -= this.wrapperOffset.top;

        // if offsetX/Y are true we center the element to the screen
        if (offsetX === true) {
            offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
        }
        if (offsetY === true) {
            offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
        }

        pos.left -= offsetX || 0;
        pos.top -= offsetY || 0;

        pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
        pos.top = pos.top > 0 ? 0 : pos.top < this.maxScrollY ? this.maxScrollY : pos.top;

        time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x - pos.left), Math.abs(this.y - pos.top)) : time;

        this.scrollTo(pos.left, pos.top, time, easing);
    }

    /**
     * Call this first when extending.
     * @param time
     * @private
     */
    _transitionTime (time) {
        time = time || 0;

        this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

        if (!time && utils.isBadAndroid) {
            this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
        }
    }

    /**
     * Call this first when extending.
     * @param easing
     * @private
     */
    _transitionTimingFunction (easing) {
        this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
    }

    _translate (x, y) {
        if (this.options.useTransform) {

            this.__translate (x, y);

        } else {
            x = Math.round(x);
            y = Math.round(y);
            this.scrollerStyle.left = x + 'px';
            this.scrollerStyle.top = y + 'px';
        }

        this.x = x;
        this.y = y;
    }

    _initEvents (remove) {
        var eventType = remove ? utils.removeEvent : utils.addEvent,
            target = this.options.bindToWrapper ? this.wrapper : window;

        eventType(window, 'orientationchange', this);
        eventType(window, 'resize', this);

        if (this.options.click) {
            eventType(this.wrapper, 'click', this, true);
        }

        if (!this.options.disableMouse) {
            eventType(this.wrapper, 'mousedown', this);
            eventType(target, 'mousemove', this);
            eventType(target, 'mousecancel', this);
            eventType(target, 'mouseup', this);
        }

        if (utils.hasPointer && !this.options.disablePointer) {
            eventType(this.wrapper, utils.prefixPointerEvent('pointerdown'), this);
            eventType(target, utils.prefixPointerEvent('pointermove'), this);
            eventType(target, utils.prefixPointerEvent('pointercancel'), this);
            eventType(target, utils.prefixPointerEvent('pointerup'), this);
        }

        if (utils.hasTouch && !this.options.disableTouch) {
            eventType(this.wrapper, 'touchstart', this);
            eventType(target, 'touchmove', this);
            eventType(target, 'touchcancel', this);
            eventType(target, 'touchend', this);
        }

        eventType(this.scroller, 'transitionend', this);
        eventType(this.scroller, 'webkitTransitionEnd', this);
        eventType(this.scroller, 'oTransitionEnd', this);
        eventType(this.scroller, 'MSTransitionEnd', this);
    }

    getComputedPosition () {
        var matrix = window.getComputedStyle(this.scroller, null),
            x, y;

        if (this.options.useTransform) {
            matrix = matrix[utils.style.transform].split(')')[0].split(', ');
            x = +(matrix[12] || matrix[4]);
            y = +(matrix[13] || matrix[5]);
        } else {
            x = +matrix.left.replace(/[^-\d.]/g, '');
            y = +matrix.top.replace(/[^-\d.]/g, '');
        }

        return {x: x, y: y};
    }

    _normalize() {}
    _insert_point() {}
    __end(newX, newY, time, easing) { return { newX, newY, time, easing }; }

    /**
     * Size of the content.
     * @returns {{width: number, height: number}}
     * @private
     */
    _getScrollerSize() {
        return { width: this.scroller.offsetWidth, height: this.scroller.offsetHeight };
    }
    __translate(x, y) {
        this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
    }
}
IScroll.utils = utils;

module.exports = IScroll;