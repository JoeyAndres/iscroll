"use strict";

var _createClass = function () { function defineProperties(target, props) { for (var i = 0; i < props.length; i++) { var descriptor = props[i]; descriptor.enumerable = descriptor.enumerable || false; descriptor.configurable = true; if ("value" in descriptor) descriptor.writable = true; Object.defineProperty(target, descriptor.key, descriptor); } } return function (Constructor, protoProps, staticProps) { if (protoProps) defineProperties(Constructor.prototype, protoProps); if (staticProps) defineProperties(Constructor, staticProps); return Constructor; }; }();

function _possibleConstructorReturn(self, call) { if (!self) { throw new ReferenceError("this hasn't been initialised - super() hasn't been called"); } return call && (typeof call === "object" || typeof call === "function") ? call : self; }

function _inherits(subClass, superClass) { if (typeof superClass !== "function" && superClass !== null) { throw new TypeError("Super expression must either be null or a function, not " + typeof superClass); } subClass.prototype = Object.create(superClass && superClass.prototype, { constructor: { value: subClass, enumerable: false, writable: true, configurable: true } }); if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass; }

function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

(function e(t, n, r) {
    function s(o, u) {
        if (!n[o]) {
            if (!t[o]) {
                var a = typeof require == "function" && require;if (!u && a) return a(o, !0);if (i) return i(o, !0);throw new Error("Cannot find module '" + o + "'");
            }var f = n[o] = { exports: {} };t[o][0].call(f.exports, function (e) {
                var n = t[o][1][e];return s(n ? n : e);
            }, f, f.exports, e, t, n, r);
        }return n[o].exports;
    }var i = typeof require == "function" && require;for (var o = 0; o < r.length; o++) {
        s(r[o]);
    }return s;
})({ 1: [function (require, module, exports) {
        var _require = require('./utils');

        var rAF = _require.rAF;
        var utils = _require.utils;

        var IScroll = function () {
            function IScroll(el, options) {
                _classCallCheck(this, IScroll);

                this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
                this.scroller = this.wrapper.children[0];
                this.scrollerStyle = this.scroller.style; // cache style for better performance

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
                    preventDefaultException: { tagName: /^(INPUT|TEXTAREA|BUTTON|SELECT)$/ },

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

            _createClass(IScroll, [{
                key: "_init",
                value: function _init() {
                    this._initEvents();
                }
            }, {
                key: "destroy",
                value: function destroy() {
                    this._initEvents(true);

                    this._execEvent('destroy');
                }
            }, {
                key: "_transitionEnd",
                value: function _transitionEnd(e) {
                    if (e.target != this.scroller || !this.isInTransition) {
                        return;
                    }

                    this._transitionTime();
                    if (!this.resetPosition(this.options.bounceTime)) {
                        this.isInTransition = false;
                        this._execEvent('scrollEnd');
                    }
                }
            }, {
                key: "_start",
                value: function _start(e) {
                    if (this.options.stopPropagation) {
                        e.stopPropagation();
                    }

                    // React to left mouse button only
                    if (utils.eventType[e.type] != 1) {
                        if (e.button !== 0) {
                            return;
                        }
                    }

                    if (!this.enabled || this.initiated && utils.eventType[e.type] !== this.initiated) {
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
            }, {
                key: "_move",
                value: function _move(e) {
                    if (this.options.stopPropagation) {
                        e.stopPropagation();
                    }

                    if (!this.enabled || utils.eventType[e.type] !== this.initiated) {
                        return;
                    }

                    if (this.options.preventDefault) {
                        // increases performance on Android? TODO: check!
                        e.preventDefault();
                    }

                    var point = e.touches ? e.touches[0] : e,
                        deltaX = point.pageX - this.pointX,
                        deltaY = point.pageY - this.pointY,
                        timestamp = utils.getTime(),
                        newX,
                        newY,
                        absDistX,
                        absDistY;

                    this.pointX = point.pageX;
                    this.pointY = point.pageY;

                    this.distX += deltaX;
                    this.distY += deltaY;
                    absDistX = Math.abs(this.distX);
                    absDistY = Math.abs(this.distY);

                    // We need to move at least 10 pixels for the scrolling to initiate
                    if (timestamp - this.endTime > 300 && absDistX < 10 && absDistY < 10) {
                        return;
                    }

                    // If you are scrolling in one direction lock the other
                    if (!this.directionLocked && !this.options.freeScroll) {
                        if (absDistX > absDistY + this.options.directionLockThreshold) {
                            this.directionLocked = 'h'; // lock horizontally
                        } else if (absDistY >= absDistX + this.options.directionLockThreshold) {
                                this.directionLocked = 'v'; // lock vertically
                            } else {
                                    this.directionLocked = 'n'; // no lock
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
            }, {
                key: "_end",
                value: function _end(e) {
                    if (this.options.stopPropagation) {
                        e.stopPropagation();
                    }

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

                    this.scrollTo(newX, newY); // ensures that the last position is rounded

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

                    var _end2 = this.__end(newX, newY, time, easing);

                    var _newX = _end2.newX;
                    var _newY = _end2.newY;
                    var _time = _end2.time;
                    var _easing = _end2.easing;

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
            }, {
                key: "_resize",
                value: function _resize() {
                    var that = this;

                    clearTimeout(this.resizeTimeout);

                    this.resizeTimeout = setTimeout(function () {
                        that.refresh();
                    }, this.options.resizePolling);
                }
            }, {
                key: "resetPosition",
                value: function resetPosition(time) {
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
            }, {
                key: "disable",
                value: function disable() {
                    this.enabled = false;
                }
            }, {
                key: "enable",
                value: function enable() {
                    this.enabled = true;
                }
            }, {
                key: "refresh",
                value: function refresh() {
                    var rf = this.wrapper.offsetHeight; // Force reflow

                    this.wrapperWidth = this.wrapper.clientWidth;
                    this.wrapperHeight = this.wrapper.clientHeight;

                    var _getScrollerSize2 = this._getScrollerSize();

                    var width = _getScrollerSize2.width;
                    var height = _getScrollerSize2.height;

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
            }, {
                key: "on",
                value: function on(type, fn) {
                    if (!this._events[type]) {
                        this._events[type] = [];
                    }

                    this._events[type].push(fn);
                }
            }, {
                key: "off",
                value: function off(type, fn) {
                    if (!this._events[type]) {
                        return;
                    }

                    var index = this._events[type].indexOf(fn);

                    if (index > -1) {
                        this._events[type].splice(index, 1);
                    }
                }
            }, {
                key: "_execEvent",
                value: function _execEvent(type) {
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
            }, {
                key: "scrollBy",
                value: function scrollBy(x, y, time, easing) {
                    x = this.x + x;
                    y = this.y + y;
                    time = time || 0;

                    this.scrollTo(x, y, time, easing);
                }
            }, {
                key: "scrollTo",
                value: function scrollTo(x, y, time, easing) {
                    easing = easing || utils.ease.circular;

                    this.isInTransition = this.options.useTransition && time > 0;

                    if (!time || this.options.useTransition && easing.style) {
                        this._transitionTimingFunction(easing.style);
                        this._transitionTime(time);
                        this._translate(x, y);
                    } else {
                        this._animate(x, y, time, easing.fn);
                    }
                }
            }, {
                key: "scrollToElement",
                value: function scrollToElement(el, time, offsetX, offsetY, easing) {
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

            }, {
                key: "_transitionTime",
                value: function _transitionTime(time) {
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

            }, {
                key: "_transitionTimingFunction",
                value: function _transitionTimingFunction(easing) {
                    this.scrollerStyle[utils.style.transitionTimingFunction] = easing;
                }
            }, {
                key: "_translate",
                value: function _translate(x, y) {
                    if (this.options.useTransform) {

                        this.__translate(x, y);
                    } else {
                        x = Math.round(x);
                        y = Math.round(y);
                        this.scrollerStyle.left = x + 'px';
                        this.scrollerStyle.top = y + 'px';
                    }

                    this.x = x;
                    this.y = y;
                }
            }, {
                key: "_initEvents",
                value: function _initEvents(remove) {
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
            }, {
                key: "getComputedPosition",
                value: function getComputedPosition() {
                    var matrix = window.getComputedStyle(this.scroller, null),
                        x,
                        y;

                    if (this.options.useTransform) {
                        matrix = matrix[utils.style.transform].split(')')[0].split(', ');
                        x = +(matrix[12] || matrix[4]);
                        y = +(matrix[13] || matrix[5]);
                    } else {
                        x = +matrix.left.replace(/[^-\d.]/g, '');
                        y = +matrix.top.replace(/[^-\d.]/g, '');
                    }

                    return { x: x, y: y };
                }
            }, {
                key: "_normalize",
                value: function _normalize() {}
            }, {
                key: "_insert_point",
                value: function _insert_point() {}
            }, {
                key: "__end",
                value: function __end(newX, newY, time, easing) {
                    return { newX: newX, newY: newY, time: time, easing: easing };
                }

                /**
                 * Size of the content.
                 * @returns {{width: number, height: number}}
                 * @private
                 */

            }, {
                key: "_getScrollerSize",
                value: function _getScrollerSize() {
                    return { width: this.scroller.offsetWidth, height: this.scroller.offsetHeight };
                }
            }, {
                key: "__translate",
                value: function __translate(x, y) {
                    this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;
                }
            }]);

            return IScroll;
        }();

        IScroll.utils = utils;

        module.exports = IScroll;
    }, { "./utils": 6 }], 2: [function (require, module, exports) {
        var _require2 = require('../utils');

        var rAF = _require2.rAF;
        var utils = _require2.utils;

        module.exports = {
            _animate: function _animate(destX, destY, duration, easingFn) {
                var that = this,
                    startX = this.x,
                    startY = this.y,
                    startTime = utils.getTime(),
                    destTime = startTime + duration;

                function step() {
                    var now = utils.getTime(),
                        newX,
                        newY,
                        easing;

                    if (now >= destTime) {
                        that.isAnimating = false;
                        that._translate(destX, destY);

                        if (!that.resetPosition(that.options.bounceTime)) {
                            that._execEvent('scrollEnd');
                        }

                        return;
                    }

                    now = (now - startTime) / duration;
                    easing = easingFn(now);
                    newX = (destX - startX) * easing + startX;
                    newY = (destY - startY) * easing + startY;
                    that._translate(newX, newY);

                    if (that.isAnimating) {
                        rAF(step);
                    }
                }

                this.isAnimating = true;
                step();
            }
        };
    }, { "../utils": 6 }], 3: [function (require, module, exports) {
        module.exports = {
            handleEvent: function handleEvent(e) {
                switch (e.type) {
                    case 'touchstart':
                    case 'pointerdown':
                    case 'MSPointerDown':
                    case 'mousedown':
                        this._start(e);
                        break;
                    case 'touchmove':
                    case 'pointermove':
                    case 'MSPointerMove':
                    case 'mousemove':
                        this._move(e);
                        break;
                    case 'touchend':
                    case 'pointerup':
                    case 'MSPointerUp':
                    case 'mouseup':
                    case 'touchcancel':
                    case 'pointercancel':
                    case 'MSPointerCancel':
                    case 'mousecancel':
                        this._end(e);
                        break;
                    case 'orientationchange':
                    case 'resize':
                        this._resize();
                        break;
                    case 'transitionend':
                    case 'webkitTransitionEnd':
                    case 'oTransitionEnd':
                    case 'MSTransitionEnd':
                        this._transitionEnd(e);
                        break;
                    case 'wheel':
                    case 'DOMMouseScroll':
                    case 'mousewheel':
                        this._wheel(e);
                        break;
                    case 'keydown':
                        this._key(e);
                        break;
                    case 'click':
                        if (!e._constructed) {
                            e.preventDefault();
                            e.stopPropagation();
                        }
                        break;
                }
            }
        };
    }, {}], 4: [function (require, module, exports) {
        var _IScroll = require('./core');

        var _require3 = require('./utils');

        var rAF = _require3.rAF;
        var utils = _require3.utils;

        var IScroll = function (_IScroll2) {
            _inherits(IScroll, _IScroll2);

            function IScroll() {
                _classCallCheck(this, IScroll);

                return _possibleConstructorReturn(this, Object.getPrototypeOf(IScroll).apply(this, arguments));
            }

            return IScroll;
        }(_IScroll);

        utils.extend(IScroll.prototype, require('./default/_animate'));
        utils.extend(IScroll.prototype, require('./default/handleEvent'));
        utils.extend(IScroll.prototype, require('./indicator/indicator'));

        (function (window, document, Math) {
            if (typeof module !== 'undefined') {
                module.exports = IScroll;
            }

            if (typeof window !== 'undefined' && !window.IScroll) {
                window.IScroll = IScroll;
            }
        })(window, document, Math);
    }, { "./core": 1, "./default/_animate": 2, "./default/handleEvent": 3, "./indicator/indicator": 5, "./utils": 6 }], 5: [function (require, module, exports) {
        var _require4 = require('../utils');

        var rAF = _require4.rAF;
        var utils = _require4.utils;

        function createDefaultScrollbar(direction, interactive, type) {
            var scrollbar = document.createElement('div'),
                indicator = document.createElement('div');

            if (type === true) {
                scrollbar.style.cssText = 'position:absolute;z-index:9999';
                indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
            }

            indicator.className = 'iScrollIndicator';

            if (direction == 'h') {
                if (type === true) {
                    scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
                    indicator.style.height = '100%';
                }
                scrollbar.className = 'iScrollHorizontalScrollbar';
            } else {
                if (type === true) {
                    scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
                    indicator.style.width = '100%';
                }
                scrollbar.className = 'iScrollVerticalScrollbar';
            }

            scrollbar.style.cssText += ';overflow:hidden';

            if (!interactive) {
                scrollbar.style.pointerEvents = 'none';
            }

            scrollbar.appendChild(indicator);

            return scrollbar;
        }

        var Indicator = function () {
            function Indicator(scroller, options) {
                _classCallCheck(this, Indicator);

                this.wrapper = typeof options.el == 'string' ? document.querySelector(options.el) : options.el;
                this.wrapperStyle = this.wrapper.style;
                this.indicator = this.wrapper.children[0];
                this.indicatorStyle = this.indicator.style;
                this.scroller = scroller;

                this.options = {
                    listenX: true,
                    listenY: true,
                    interactive: false,
                    resize: true,
                    defaultScrollbars: false,
                    shrink: false,
                    fade: false,
                    speedRatioX: 0,
                    speedRatioY: 0
                };

                for (var i in options) {
                    this.options[i] = options[i];
                }

                this.sizeRatioX = 1;
                this.sizeRatioY = 1;
                this.maxPosX = 0;
                this.maxPosY = 0;

                if (this.options.interactive) {
                    if (!this.options.disableTouch) {
                        utils.addEvent(this.indicator, 'touchstart', this);
                        utils.addEvent(window, 'touchend', this);
                    }
                    if (!this.options.disablePointer) {
                        utils.addEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                        utils.addEvent(window, utils.prefixPointerEvent('pointerup'), this);
                    }
                    if (!this.options.disableMouse) {
                        utils.addEvent(this.indicator, 'mousedown', this);
                        utils.addEvent(window, 'mouseup', this);
                    }
                }

                if (this.options.fade) {
                    this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
                    this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
                    this.wrapperStyle.opacity = '0';
                }
            }

            _createClass(Indicator, [{
                key: "handleEvent",
                value: function handleEvent(e) {
                    switch (e.type) {
                        case 'touchstart':
                        case 'pointerdown':
                        case 'MSPointerDown':
                        case 'mousedown':
                            this._start(e);
                            break;
                        case 'touchmove':
                        case 'pointermove':
                        case 'MSPointerMove':
                        case 'mousemove':
                            this._move(e);
                            break;
                        case 'touchend':
                        case 'pointerup':
                        case 'MSPointerUp':
                        case 'mouseup':
                        case 'touchcancel':
                        case 'pointercancel':
                        case 'MSPointerCancel':
                        case 'mousecancel':
                            this._end(e);
                            break;
                    }
                }
            }, {
                key: "destroy",
                value: function destroy() {
                    if (this.options.interactive) {
                        utils.removeEvent(this.indicator, 'touchstart', this);
                        utils.removeEvent(this.indicator, utils.prefixPointerEvent('pointerdown'), this);
                        utils.removeEvent(this.indicator, 'mousedown', this);

                        utils.removeEvent(window, 'touchmove', this);
                        utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
                        utils.removeEvent(window, 'mousemove', this);

                        utils.removeEvent(window, 'touchend', this);
                        utils.removeEvent(window, utils.prefixPointerEvent('pointerup'), this);
                        utils.removeEvent(window, 'mouseup', this);
                    }

                    if (this.options.defaultScrollbars) {
                        this.wrapper.parentNode.removeChild(this.wrapper);
                    }
                }
            }, {
                key: "_start",
                value: function _start(e) {
                    var point = e.touches ? e.touches[0] : e;

                    e.preventDefault();
                    e.stopPropagation();

                    this.transitionTime();

                    this.initiated = true;
                    this.moved = false;
                    this.lastPointX = point.pageX;
                    this.lastPointY = point.pageY;

                    this.startTime = utils.getTime();

                    if (!this.options.disableTouch) {
                        utils.addEvent(window, 'touchmove', this);
                    }
                    if (!this.options.disablePointer) {
                        utils.addEvent(window, utils.prefixPointerEvent('pointermove'), this);
                    }
                    if (!this.options.disableMouse) {
                        utils.addEvent(window, 'mousemove', this);
                    }

                    this.scroller._execEvent('beforeScrollStart');
                }
            }, {
                key: "_move",
                value: function _move(e) {
                    var point = e.touches ? e.touches[0] : e,
                        deltaX,
                        deltaY,
                        newX,
                        newY,
                        timestamp = utils.getTime();

                    if (!this.moved) {
                        this.scroller._execEvent('scrollStart');
                    }

                    this.moved = true;

                    deltaX = point.pageX - this.lastPointX;
                    this.lastPointX = point.pageX;

                    deltaY = point.pageY - this.lastPointY;
                    this.lastPointY = point.pageY;

                    newX = this.x + deltaX;
                    newY = this.y + deltaY;

                    this._pos(newX, newY);

                    // INSERT POINT: indicator._move

                    e.preventDefault();
                    e.stopPropagation();
                }
            }, {
                key: "_end",
                value: function _end(e) {
                    if (!this.initiated) {
                        return;
                    }

                    this.initiated = false;

                    e.preventDefault();
                    e.stopPropagation();

                    utils.removeEvent(window, 'touchmove', this);
                    utils.removeEvent(window, utils.prefixPointerEvent('pointermove'), this);
                    utils.removeEvent(window, 'mousemove', this);

                    if (this.scroller.options.snap) {
                        var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

                        var time = this.options.snapSpeed || Math.max(Math.max(Math.min(Math.abs(this.scroller.x - snap.x), 1000), Math.min(Math.abs(this.scroller.y - snap.y), 1000)), 300);

                        if (this.scroller.x != snap.x || this.scroller.y != snap.y) {
                            this.scroller.directionX = 0;
                            this.scroller.directionY = 0;
                            this.scroller.currentPage = snap;
                            this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
                        }
                    }

                    if (this.moved) {
                        this.scroller._execEvent('scrollEnd');
                    }
                }
            }, {
                key: "transitionTime",
                value: function transitionTime(time) {
                    time = time || 0;
                    this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

                    if (!time && utils.isBadAndroid) {
                        this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
                    }
                }
            }, {
                key: "transitionTimingFunction",
                value: function transitionTimingFunction(easing) {
                    this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
                }
            }, {
                key: "refresh",
                value: function refresh() {
                    this.transitionTime();

                    if (this.options.listenX && !this.options.listenY) {
                        this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
                    } else if (this.options.listenY && !this.options.listenX) {
                        this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
                    } else {
                        this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
                    }

                    if (this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll) {
                        utils.addClass(this.wrapper, 'iScrollBothScrollbars');
                        utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

                        if (this.options.defaultScrollbars && this.options.customStyle) {
                            if (this.options.listenX) {
                                this.wrapper.style.right = '8px';
                            } else {
                                this.wrapper.style.bottom = '8px';
                            }
                        }
                    } else {
                        utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
                        utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

                        if (this.options.defaultScrollbars && this.options.customStyle) {
                            if (this.options.listenX) {
                                this.wrapper.style.right = '2px';
                            } else {
                                this.wrapper.style.bottom = '2px';
                            }
                        }
                    }

                    var r = this.wrapper.offsetHeight; // force refresh

                    if (this.options.listenX) {
                        this.wrapperWidth = this.wrapper.clientWidth;
                        if (this.options.resize) {
                            this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
                            this.indicatorStyle.width = this.indicatorWidth + 'px';
                        } else {
                            this.indicatorWidth = this.indicator.clientWidth;
                        }

                        this.maxPosX = this.wrapperWidth - this.indicatorWidth;

                        if (this.options.shrink == 'clip') {
                            this.minBoundaryX = -this.indicatorWidth + 8;
                            this.maxBoundaryX = this.wrapperWidth - 8;
                        } else {
                            this.minBoundaryX = 0;
                            this.maxBoundaryX = this.maxPosX;
                        }

                        this.sizeRatioX = this.options.speedRatioX || this.scroller.maxScrollX && this.maxPosX / this.scroller.maxScrollX;
                    }

                    if (this.options.listenY) {
                        this.wrapperHeight = this.wrapper.clientHeight;
                        if (this.options.resize) {
                            this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
                            this.indicatorStyle.height = this.indicatorHeight + 'px';
                        } else {
                            this.indicatorHeight = this.indicator.clientHeight;
                        }

                        this.maxPosY = this.wrapperHeight - this.indicatorHeight;

                        if (this.options.shrink == 'clip') {
                            this.minBoundaryY = -this.indicatorHeight + 8;
                            this.maxBoundaryY = this.wrapperHeight - 8;
                        } else {
                            this.minBoundaryY = 0;
                            this.maxBoundaryY = this.maxPosY;
                        }

                        this.maxPosY = this.wrapperHeight - this.indicatorHeight;
                        this.sizeRatioY = this.options.speedRatioY || this.scroller.maxScrollY && this.maxPosY / this.scroller.maxScrollY;
                    }

                    this.updatePosition();
                }
            }, {
                key: "updatePosition",
                value: function updatePosition() {
                    var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
                        y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

                    if (!this.options.ignoreBoundaries) {
                        if (x < this.minBoundaryX) {
                            if (this.options.shrink == 'scale') {
                                this.width = Math.max(this.indicatorWidth + x, 8);
                                this.indicatorStyle.width = this.width + 'px';
                            }
                            x = this.minBoundaryX;
                        } else if (x > this.maxBoundaryX) {
                            if (this.options.shrink == 'scale') {
                                this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
                                this.indicatorStyle.width = this.width + 'px';
                                x = this.maxPosX + this.indicatorWidth - this.width;
                            } else {
                                x = this.maxBoundaryX;
                            }
                        } else if (this.options.shrink == 'scale' && this.width != this.indicatorWidth) {
                            this.width = this.indicatorWidth;
                            this.indicatorStyle.width = this.width + 'px';
                        }

                        if (y < this.minBoundaryY) {
                            if (this.options.shrink == 'scale') {
                                this.height = Math.max(this.indicatorHeight + y * 3, 8);
                                this.indicatorStyle.height = this.height + 'px';
                            }
                            y = this.minBoundaryY;
                        } else if (y > this.maxBoundaryY) {
                            if (this.options.shrink == 'scale') {
                                this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
                                this.indicatorStyle.height = this.height + 'px';
                                y = this.maxPosY + this.indicatorHeight - this.height;
                            } else {
                                y = this.maxBoundaryY;
                            }
                        } else if (this.options.shrink == 'scale' && this.height != this.indicatorHeight) {
                            this.height = this.indicatorHeight;
                            this.indicatorStyle.height = this.height + 'px';
                        }
                    }

                    this.x = x;
                    this.y = y;

                    if (this.scroller.options.useTransform) {
                        this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
                    } else {
                        this.indicatorStyle.left = x + 'px';
                        this.indicatorStyle.top = y + 'px';
                    }
                }
            }, {
                key: "_pos",
                value: function _pos(x, y) {
                    if (x < 0) {
                        x = 0;
                    } else if (x > this.maxPosX) {
                        x = this.maxPosX;
                    }

                    if (y < 0) {
                        y = 0;
                    } else if (y > this.maxPosY) {
                        y = this.maxPosY;
                    }

                    x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
                    y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

                    this.scroller.scrollTo(x, y);
                }
            }, {
                key: "fade",
                value: function fade(val, hold) {
                    if (hold && !this.visible) {
                        return;
                    }

                    clearTimeout(this.fadeTimeout);
                    this.fadeTimeout = null;

                    var time = val ? 250 : 500,
                        delay = val ? 0 : 300;

                    val = val ? '1' : '0';

                    this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

                    this.fadeTimeout = setTimeout(function (val) {
                        this.wrapperStyle.opacity = val;
                        this.visible = +val;
                    }.bind(this, val), delay);
                }
            }]);

            return Indicator;
        }();

        ;
    }, { "../utils": 6 }], 6: [function (require, module, exports) {
        module.exports = {
            rAF: window.requestAnimationFrame || window.webkitRequestAnimationFrame || window.mozRequestAnimationFrame || window.oRequestAnimationFrame || window.msRequestAnimationFrame || function (callback) {
                window.setTimeout(callback, 1000 / 60);
            },

            utils: function () {
                var me = {};

                var _elementStyle = document.createElement('div').style;
                var _vendor = function () {
                    var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
                        transform,
                        i = 0,
                        l = vendors.length;

                    for (; i < l; i++) {
                        transform = vendors[i] + 'ransform';
                        if (transform in _elementStyle) return vendors[i].substr(0, vendors[i].length - 1);
                    }

                    return false;
                }();

                function _prefixStyle(style) {
                    if (_vendor === false) return false;
                    if (_vendor === '') return style;
                    return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
                }

                me.getTime = Date.now || function getTime() {
                    return new Date().getTime();
                };

                me.extend = function (target, obj) {
                    for (var i in obj) {
                        target[i] = obj[i];
                    }
                };

                me.addEvent = function (el, type, fn, capture) {
                    el.addEventListener(type, fn, !!capture);
                };

                me.removeEvent = function (el, type, fn, capture) {
                    el.removeEventListener(type, fn, !!capture);
                };

                me.prefixPointerEvent = function (pointerEvent) {
                    return window.MSPointerEvent ? 'MSPointer' + pointerEvent.charAt(9).toUpperCase() + pointerEvent.substr(10) : pointerEvent;
                };

                me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
                    var distance = current - start,
                        speed = Math.abs(distance) / time,
                        destination,
                        duration;

                    deceleration = deceleration === undefined ? 0.0006 : deceleration;

                    destination = current + speed * speed / (2 * deceleration) * (distance < 0 ? -1 : 1);
                    duration = speed / deceleration;

                    if (destination < lowerMargin) {
                        destination = wrapperSize ? lowerMargin - wrapperSize / 2.5 * (speed / 8) : lowerMargin;
                        distance = Math.abs(destination - current);
                        duration = distance / speed;
                    } else if (destination > 0) {
                        destination = wrapperSize ? wrapperSize / 2.5 * (speed / 8) : 0;
                        distance = Math.abs(current) + destination;
                        duration = distance / speed;
                    }

                    return {
                        destination: Math.round(destination),
                        duration: duration
                    };
                };

                var _transform = _prefixStyle('transform');

                me.extend(me, {
                    hasTransform: _transform !== false,
                    hasPerspective: _prefixStyle('perspective') in _elementStyle,
                    hasTouch: 'ontouchstart' in window,
                    hasPointer: window.PointerEvent || window.MSPointerEvent, // IE10 is prefixed
                    hasTransition: _prefixStyle('transition') in _elementStyle
                });

                // This should find all Android browsers lower than build 535.19 (both stock browser and webview)
                me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !/Chrome\/\d/.test(window.navigator.appVersion);

                me.extend(me.style = {}, {
                    transform: _transform,
                    transitionTimingFunction: _prefixStyle('transitionTimingFunction'),
                    transitionDuration: _prefixStyle('transitionDuration'),
                    transitionDelay: _prefixStyle('transitionDelay'),
                    transformOrigin: _prefixStyle('transformOrigin')
                });

                me.hasClass = function (e, c) {
                    var re = new RegExp("(^|\\s)" + c + "(\\s|$)");
                    return re.test(e.className);
                };

                me.addClass = function (e, c) {
                    if (me.hasClass(e, c)) {
                        return;
                    }

                    var newclass = e.className.split(' ');
                    newclass.push(c);
                    e.className = newclass.join(' ');
                };

                me.removeClass = function (e, c) {
                    if (!me.hasClass(e, c)) {
                        return;
                    }

                    var re = new RegExp("(^|\\s)" + c + "(\\s|$)", 'g');
                    e.className = e.className.replace(re, ' ');
                };

                me.offset = function (el) {
                    var left = -el.offsetLeft,
                        top = -el.offsetTop;

                    // jshint -W084
                    while (el = el.offsetParent) {
                        left -= el.offsetLeft;
                        top -= el.offsetTop;
                    }
                    // jshint +W084

                    return {
                        left: left,
                        top: top
                    };
                };

                me.preventDefaultException = function (el, exceptions) {
                    for (var i in exceptions) {
                        if (exceptions[i].test(el[i])) {
                            return true;
                        }
                    }

                    return false;
                };

                me.extend(me.eventType = {}, {
                    touchstart: 1,
                    touchmove: 1,
                    touchend: 1,

                    mousedown: 2,
                    mousemove: 2,
                    mouseup: 2,

                    pointerdown: 3,
                    pointermove: 3,
                    pointerup: 3,

                    MSPointerDown: 3,
                    MSPointerMove: 3,
                    MSPointerUp: 3
                });

                me.extend(me.ease = {}, {
                    quadratic: {
                        style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
                        fn: function fn(k) {
                            return k * (2 - k);
                        }
                    },
                    circular: {
                        style: 'cubic-bezier(0.1, 0.57, 0.1, 1)', // Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
                        fn: function fn(k) {
                            return Math.sqrt(1 - --k * k);
                        }
                    },
                    back: {
                        style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
                        fn: function fn(k) {
                            var b = 4;
                            return (k = k - 1) * k * ((b + 1) * k + b) + 1;
                        }
                    },
                    bounce: {
                        style: '',
                        fn: function fn(k) {
                            if ((k /= 1) < 1 / 2.75) {
                                return 7.5625 * k * k;
                            } else if (k < 2 / 2.75) {
                                return 7.5625 * (k -= 1.5 / 2.75) * k + 0.75;
                            } else if (k < 2.5 / 2.75) {
                                return 7.5625 * (k -= 2.25 / 2.75) * k + 0.9375;
                            } else {
                                return 7.5625 * (k -= 2.625 / 2.75) * k + 0.984375;
                            }
                        }
                    },
                    elastic: {
                        style: '',
                        fn: function fn(k) {
                            var f = 0.22,
                                e = 0.4;

                            if (k === 0) {
                                return 0;
                            }
                            if (k == 1) {
                                return 1;
                            }

                            return e * Math.pow(2, -10 * k) * Math.sin((k - f / 4) * (2 * Math.PI) / f) + 1;
                        }
                    }
                });

                me.tap = function (e, eventName) {
                    var ev = document.createEvent('Event');
                    ev.initEvent(eventName, true, true);
                    ev.pageX = e.pageX;
                    ev.pageY = e.pageY;
                    e.target.dispatchEvent(ev);
                };

                me.click = function (e) {
                    var target = e.target,
                        ev;

                    if (!/(SELECT|INPUT|TEXTAREA)/i.test(target.tagName)) {
                        ev = document.createEvent('MouseEvents');
                        ev.initMouseEvent('click', true, true, e.view, 1, target.screenX, target.screenY, target.clientX, target.clientY, e.ctrlKey, e.altKey, e.shiftKey, e.metaKey, 0, null);

                        ev._constructed = true;
                        target.dispatchEvent(ev);
                    }
                };

                return me;
            }()
        };
    }, {}] }, {}, [4]);