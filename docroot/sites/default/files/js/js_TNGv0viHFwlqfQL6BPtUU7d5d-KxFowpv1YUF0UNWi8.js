/*! iScroll v5.1.1 ~ (c) 2008-2014 Matteo Spinelli ~ http://cubiq.org/license */
(function (window, document, Math) {
var rAF = window.requestAnimationFrame	||
	window.webkitRequestAnimationFrame	||
	window.mozRequestAnimationFrame		||
	window.oRequestAnimationFrame		||
	window.msRequestAnimationFrame		||
	function (callback) { window.setTimeout(callback, 1000 / 60); };

var utils = (function () {
	var me = {};

	var _elementStyle = document.createElement('div').style;
	var _vendor = (function () {
		var vendors = ['t', 'webkitT', 'MozT', 'msT', 'OT'],
			transform,
			i = 0,
			l = vendors.length;

		for ( ; i < l; i++ ) {
			transform = vendors[i] + 'ransform';
			if ( transform in _elementStyle ) return vendors[i].substr(0, vendors[i].length-1);
		}

		return false;
	})();

	function _prefixStyle (style) {
		if ( _vendor === false ) return false;
		if ( _vendor === '' ) return style;
		return _vendor + style.charAt(0).toUpperCase() + style.substr(1);
	}

	me.getTime = Date.now || function getTime () { return new Date().getTime(); };

	me.extend = function (target, obj) {
		for ( var i in obj ) {
			target[i] = obj[i];
		}
	};

	me.addEvent = function (el, type, fn, capture) {
		if (el.addEventListener) {
			el.addEventListener(type, fn, !!capture);
		}
		else {
			el.attachEvent(type, fn);
		}
	};

	me.removeEvent = function (el, type, fn, capture) {
		el.removeEventListener(type, fn, !!capture);
	};

	me.momentum = function (current, start, time, lowerMargin, wrapperSize, deceleration) {
		var distance = current - start,
			speed = Math.abs(distance) / time,
			destination,
			duration;

		deceleration = deceleration === undefined ? 0.0006 : deceleration;

		destination = current + ( speed * speed ) / ( 2 * deceleration ) * ( distance < 0 ? -1 : 1 );
		duration = speed / deceleration;

		if ( destination < lowerMargin ) {
			destination = wrapperSize ? lowerMargin - ( wrapperSize / 2.5 * ( speed / 8 ) ) : lowerMargin;
			distance = Math.abs(destination - current);
			duration = distance / speed;
		} else if ( destination > 0 ) {
			destination = wrapperSize ? wrapperSize / 2.5 * ( speed / 8 ) : 0;
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
		hasPointer: navigator.msPointerEnabled,
		hasTransition: _prefixStyle('transition') in _elementStyle
	});

	// This should find all Android browsers lower than build 535.19 (both stock browser and webview)
	me.isBadAndroid = /Android /.test(window.navigator.appVersion) && !(/Chrome\/\d/.test(window.navigator.appVersion));

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
		if ( me.hasClass(e, c) ) {
			return;
		}

		var newclass = e.className.split(' ');
		newclass.push(c);
		e.className = newclass.join(' ');
	};

	me.removeClass = function (e, c) {
		if ( !me.hasClass(e, c) ) {
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
		for ( var i in exceptions ) {
			if ( exceptions[i].test(el[i]) ) {
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

		MSPointerDown: 3,
		MSPointerMove: 3,
		MSPointerUp: 3
	});

	me.extend(me.ease = {}, {
		quadratic: {
			style: 'cubic-bezier(0.25, 0.46, 0.45, 0.94)',
			fn: function (k) {
				return k * ( 2 - k );
			}
		},
		circular: {
			style: 'cubic-bezier(0.1, 0.57, 0.1, 1)',	// Not properly "circular" but this looks better, it should be (0.075, 0.82, 0.165, 1)
			fn: function (k) {
				return Math.sqrt( 1 - ( --k * k ) );
			}
		},
		back: {
			style: 'cubic-bezier(0.175, 0.885, 0.32, 1.275)',
			fn: function (k) {
				var b = 4;
				return ( k = k - 1 ) * k * ( ( b + 1 ) * k + b ) + 1;
			}
		},
		bounce: {
			style: '',
			fn: function (k) {
				if ( ( k /= 1 ) < ( 1 / 2.75 ) ) {
					return 7.5625 * k * k;
				} else if ( k < ( 2 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 1.5 / 2.75 ) ) * k + 0.75;
				} else if ( k < ( 2.5 / 2.75 ) ) {
					return 7.5625 * ( k -= ( 2.25 / 2.75 ) ) * k + 0.9375;
				} else {
					return 7.5625 * ( k -= ( 2.625 / 2.75 ) ) * k + 0.984375;
				}
			}
		},
		elastic: {
			style: '',
			fn: function (k) {
				var f = 0.22,
					e = 0.4;

				if ( k === 0 ) { return 0; }
				if ( k == 1 ) { return 1; }

				return ( e * Math.pow( 2, - 10 * k ) * Math.sin( ( k - f / 4 ) * ( 2 * Math.PI ) / f ) + 1 );
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

		if ( !(/(SELECT|INPUT|TEXTAREA)/i).test(target.tagName) ) {
			ev = document.createEvent('MouseEvents');
			ev.initMouseEvent('click', true, true, e.view, 1,
				target.screenX, target.screenY, target.clientX, target.clientY,
				e.ctrlKey, e.altKey, e.shiftKey, e.metaKey,
				0, null);

			ev._constructed = true;
			target.dispatchEvent(ev);
		}
	};

	return me;
})();

function IScroll (el, options) {
	this.wrapper = typeof el == 'string' ? document.querySelector(el) : el;
	this.scroller = this.wrapper.children[0];
	this.scrollerStyle = this.scroller.style;		// cache style for better performance

	this.options = {

		resizeScrollbars: true,

		mouseWheelSpeed: 20,

		snapThreshold: 0.334,

// INSERT POINT: OPTIONS 

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
		useTransform: true
	};

	for ( var i in options ) {
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

	if ( this.options.tap === true ) {
		this.options.tap = 'tap';
	}

	if ( this.options.shrinkScrollbars == 'scale' ) {
		this.options.useTransition = false;
	}

	this.options.invertWheelDirection = this.options.invertWheelDirection ? -1 : 1;

// INSERT POINT: NORMALIZATION

	// Some defaults	
	this.x = 0;
	this.y = 0;
	this.directionX = 0;
	this.directionY = 0;
	this._events = {};

// INSERT POINT: DEFAULTS

	this._init();
	this.refresh();

	this.scrollTo(this.options.startX, this.options.startY);
	this.enable();
}

IScroll.prototype = {
	version: '5.1.1',

	_init: function () {
		this._initEvents();

		if ( this.options.scrollbars || this.options.indicators ) {
			this._initIndicators();
		}

		if ( this.options.mouseWheel ) {
			this._initWheel();
		}

		if ( this.options.snap ) {
			this._initSnap();
		}

		if ( this.options.keyBindings ) {
			this._initKeys();
		}

// INSERT POINT: _init

	},

	destroy: function () {
		this._initEvents(true);

		this._execEvent('destroy');
	},

	_transitionEnd: function (e) {
		if ( e.target != this.scroller || !this.isInTransition ) {
			return;
		}

		this._transitionTime();
		if ( !this.resetPosition(this.options.bounceTime) ) {
			this.isInTransition = false;
			this._execEvent('scrollEnd');
		}
	},

	_start: function (e) {
		// React to left mouse button only
		if ( utils.eventType[e.type] != 1 ) {
			if ( e.button !== 0 ) {
				return;
			}
		}

		if ( !this.enabled || (this.initiated && utils.eventType[e.type] !== this.initiated) ) {
			return;
		}

		if ( this.options.preventDefault && !utils.isBadAndroid && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
			e.preventDefault();
		}

		var point = e.touches ? e.touches[0] : e,
			pos;

		this.initiated	= utils.eventType[e.type];
		this.moved		= false;
		this.distX		= 0;
		this.distY		= 0;
		this.directionX = 0;
		this.directionY = 0;
		this.directionLocked = 0;

		this._transitionTime();

		this.startTime = utils.getTime();

		if ( this.options.useTransition && this.isInTransition ) {
			this.isInTransition = false;
			pos = this.getComputedPosition();
			this._translate(Math.round(pos.x), Math.round(pos.y));
			this._execEvent('scrollEnd');
		} else if ( !this.options.useTransition && this.isAnimating ) {
			this.isAnimating = false;
			this._execEvent('scrollEnd');
		}

		this.startX    = this.x;
		this.startY    = this.y;
		this.absStartX = this.x;
		this.absStartY = this.y;
		this.pointX    = point.pageX;
		this.pointY    = point.pageY;

		this._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault ) {	// increases performance on Android? TODO: check!
			e.preventDefault();
		}

		var point		= e.touches ? e.touches[0] : e,
			deltaX		= point.pageX - this.pointX,
			deltaY		= point.pageY - this.pointY,
			timestamp	= utils.getTime(),
			newX, newY,
			absDistX, absDistY;

		this.pointX		= point.pageX;
		this.pointY		= point.pageY;

		this.distX		+= deltaX;
		this.distY		+= deltaY;
		absDistX		= Math.abs(this.distX);
		absDistY		= Math.abs(this.distY);

		// We need to move at least 10 pixels for the scrolling to initiate
		if ( timestamp - this.endTime > 300 && (absDistX < 10 && absDistY < 10) ) {
			return;
		}

		// If you are scrolling in one direction lock the other
		if ( !this.directionLocked && !this.options.freeScroll ) {
			if ( absDistX > absDistY + this.options.directionLockThreshold ) {
				this.directionLocked = 'h';		// lock horizontally
			} else if ( absDistY >= absDistX + this.options.directionLockThreshold ) {
				this.directionLocked = 'v';		// lock vertically
			} else {
				this.directionLocked = 'n';		// no lock
			}
		}

		if ( this.directionLocked == 'h' ) {
			if ( this.options.eventPassthrough == 'vertical' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'horizontal' ) {
				this.initiated = false;
				return;
			}

			deltaY = 0;
		} else if ( this.directionLocked == 'v' ) {
			if ( this.options.eventPassthrough == 'horizontal' ) {
				e.preventDefault();
			} else if ( this.options.eventPassthrough == 'vertical' ) {
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
		if ( newX > 0 || newX < this.maxScrollX ) {
			newX = this.options.bounce ? this.x + deltaX / 3 : newX > 0 ? 0 : this.maxScrollX;
		}
		if ( newY > 0 || newY < this.maxScrollY ) {
			newY = this.options.bounce ? this.y + deltaY / 3 : newY > 0 ? 0 : this.maxScrollY;
		}

		this.directionX = deltaX > 0 ? -1 : deltaX < 0 ? 1 : 0;
		this.directionY = deltaY > 0 ? -1 : deltaY < 0 ? 1 : 0;

		if ( !this.moved ) {
			this._execEvent('scrollStart');
		}

		this.moved = true;

		this._translate(newX, newY);

/* REPLACE START: _move */

		if ( timestamp - this.startTime > 300 ) {
			this.startTime = timestamp;
			this.startX = this.x;
			this.startY = this.y;
		}

/* REPLACE END: _move */

	},

	_end: function (e) {
		if ( !this.enabled || utils.eventType[e.type] !== this.initiated ) {
			return;
		}

		if ( this.options.preventDefault && !utils.preventDefaultException(e.target, this.options.preventDefaultException) ) {
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
		if ( this.resetPosition(this.options.bounceTime) ) {
			return;
		}

		this.scrollTo(newX, newY);	// ensures that the last position is rounded

		// we scrolled less than 10 pixels
		if ( !this.moved ) {
			if ( this.options.tap ) {
				utils.tap(e, this.options.tap);
			}

			if ( this.options.click ) {
				utils.click(e);
			}

			this._execEvent('scrollCancel');
			return;
		}

		if ( this._events.flick && duration < 200 && distanceX < 100 && distanceY < 100 ) {
			this._execEvent('flick');
			return;
		}

		// start momentum animation if needed
		if ( this.options.momentum && duration < 300 ) {
			momentumX = this.hasHorizontalScroll ? utils.momentum(this.x, this.startX, duration, this.maxScrollX, this.options.bounce ? this.wrapperWidth : 0, this.options.deceleration) : { destination: newX, duration: 0 };
			momentumY = this.hasVerticalScroll ? utils.momentum(this.y, this.startY, duration, this.maxScrollY, this.options.bounce ? this.wrapperHeight : 0, this.options.deceleration) : { destination: newY, duration: 0 };
			newX = momentumX.destination;
			newY = momentumY.destination;
			time = Math.max(momentumX.duration, momentumY.duration);
			this.isInTransition = 1;
		}


		if ( this.options.snap ) {
			var snap = this._nearestSnap(newX, newY);
			this.currentPage = snap;
			time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(newX - snap.x), 1000),
						Math.min(Math.abs(newY - snap.y), 1000)
					), 600);
			newX = snap.x;
			newY = snap.y;

			this.directionX = 0;
			this.directionY = 0;
			easing = this.options.bounceEasing;
		}

// INSERT POINT: _end

		if ( newX != this.x || newY != this.y ) {
			// change easing function when scroller goes out of the boundaries
			if ( newX > 0 || newX < this.maxScrollX || newY > 0 || newY < this.maxScrollY ) {
				easing = utils.ease.quadratic;
			}

			this.scrollTo(newX, newY, time, easing);
			return;
		}

		this._execEvent('scrollEnd');
	},

	_resize: function () {
		var that = this;

		clearTimeout(this.resizeTimeout);

		this.resizeTimeout = setTimeout(function () {
			that.refresh();
		}, this.options.resizePolling);
	},

	resetPosition: function (time) {
		var x = this.x,
			y = this.y;

		time = time || 0;

		if ( !this.hasHorizontalScroll || this.x > 0 ) {
			x = 0;
		} else if ( this.x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( !this.hasVerticalScroll || this.y > 0 ) {
			y = 0;
		} else if ( this.y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		if ( x == this.x && y == this.y ) {
			return false;
		}

		this.scrollTo(x, y, time, this.options.bounceEasing);

		return true;
	},

	disable: function () {
		this.enabled = false;
	},

	enable: function () {
		this.enabled = true;
	},

	refresh: function () {
		var rf = this.wrapper.offsetHeight;		// Force reflow

		this.wrapperWidth	= this.wrapper.clientWidth;
		this.wrapperHeight	= this.wrapper.clientHeight;

/* REPLACE START: refresh */

		this.scrollerWidth	= this.scroller.offsetWidth;
		this.scrollerHeight	= this.scroller.offsetHeight;

		this.maxScrollX		= this.wrapperWidth - this.scrollerWidth;
		this.maxScrollY		= this.wrapperHeight - this.scrollerHeight;

/* REPLACE END: refresh */

		this.hasHorizontalScroll	= this.options.scrollX && this.maxScrollX < 0;
		this.hasVerticalScroll		= this.options.scrollY && this.maxScrollY < 0;

		if ( !this.hasHorizontalScroll ) {
			this.maxScrollX = 0;
			this.scrollerWidth = this.wrapperWidth;
		}

		if ( !this.hasVerticalScroll ) {
			this.maxScrollY = 0;
			this.scrollerHeight = this.wrapperHeight;
		}

		this.endTime = 0;
		this.directionX = 0;
		this.directionY = 0;

		this.wrapperOffset = utils.offset(this.wrapper);

		this._execEvent('refresh');

		this.resetPosition();

// INSERT POINT: _refresh

	},

	on: function (type, fn) {
		if ( !this._events[type] ) {
			this._events[type] = [];
		}

		this._events[type].push(fn);
	},

	off: function (type, fn) {
		if ( !this._events[type] ) {
			return;
		}

		var index = this._events[type].indexOf(fn);

		if ( index > -1 ) {
			this._events[type].splice(index, 1);
		}
	},

	_execEvent: function (type) {
		if ( !this._events[type] ) {
			return;
		}

		var i = 0,
			l = this._events[type].length;

		if ( !l ) {
			return;
		}

		for ( ; i < l; i++ ) {
			this._events[type][i].apply(this, [].slice.call(arguments, 1));
		}
	},

	scrollBy: function (x, y, time, easing) {
		x = this.x + x;
		y = this.y + y;
		time = time || 0;

		this.scrollTo(x, y, time, easing);
	},

	scrollTo: function (x, y, time, easing) {
		easing = easing || utils.ease.circular;

		this.isInTransition = this.options.useTransition && time > 0;

		if ( !time || (this.options.useTransition && easing.style) ) {
			this._transitionTimingFunction(easing.style);
			this._transitionTime(time);
			this._translate(x, y);
		} else {
			this._animate(x, y, time, easing.fn);
		}
	},

	scrollToElement: function (el, time, offsetX, offsetY, easing) {
		el = el.nodeType ? el : this.scroller.querySelector(el);

		if ( !el ) {
			return;
		}

		var pos = utils.offset(el);

		pos.left -= this.wrapperOffset.left;
		pos.top  -= this.wrapperOffset.top;

		// if offsetX/Y are true we center the element to the screen
		if ( offsetX === true ) {
			offsetX = Math.round(el.offsetWidth / 2 - this.wrapper.offsetWidth / 2);
		}
		if ( offsetY === true ) {
			offsetY = Math.round(el.offsetHeight / 2 - this.wrapper.offsetHeight / 2);
		}

		pos.left -= offsetX || 0;
		pos.top  -= offsetY || 0;

		pos.left = pos.left > 0 ? 0 : pos.left < this.maxScrollX ? this.maxScrollX : pos.left;
		pos.top  = pos.top  > 0 ? 0 : pos.top  < this.maxScrollY ? this.maxScrollY : pos.top;

		time = time === undefined || time === null || time === 'auto' ? Math.max(Math.abs(this.x-pos.left), Math.abs(this.y-pos.top)) : time;

		this.scrollTo(pos.left, pos.top, time, easing);
	},

	_transitionTime: function (time) {
		time = time || 0;

		this.scrollerStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.scrollerStyle[utils.style.transitionDuration] = '0.001s';
		}


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTime(time);
			}
		}


// INSERT POINT: _transitionTime

	},

	_transitionTimingFunction: function (easing) {
		this.scrollerStyle[utils.style.transitionTimingFunction] = easing;


		if ( this.indicators ) {
			for ( var i = this.indicators.length; i--; ) {
				this.indicators[i].transitionTimingFunction(easing);
			}
		}


// INSERT POINT: _transitionTimingFunction

	},

	_translate: function (x, y) {
		if ( this.options.useTransform ) {

/* REPLACE START: _translate */

			this.scrollerStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.translateZ;

/* REPLACE END: _translate */

		} else {
			x = Math.round(x);
			y = Math.round(y);
			this.scrollerStyle.left = x + 'px';
			this.scrollerStyle.top = y + 'px';
		}

		this.x = x;
		this.y = y;


	if ( this.indicators ) {
		for ( var i = this.indicators.length; i--; ) {
			this.indicators[i].updatePosition();
		}
	}


// INSERT POINT: _translate

	},

	_initEvents: function (remove) {
		var eventType = remove ? utils.removeEvent : utils.addEvent,
			target = this.options.bindToWrapper ? this.wrapper : window;

		eventType(window, 'orientationchange', this);
		eventType(window, 'resize', this);

		if ( this.options.click ) {
			eventType(this.wrapper, 'click', this, true);
		}

		if ( !this.options.disableMouse ) {
			eventType(this.wrapper, 'mousedown', this);
			eventType(target, 'mousemove', this);
			eventType(target, 'mousecancel', this);
			eventType(target, 'mouseup', this);
		}

		if ( utils.hasPointer && !this.options.disablePointer ) {
			eventType(this.wrapper, 'MSPointerDown', this);
			eventType(target, 'MSPointerMove', this);
			eventType(target, 'MSPointerCancel', this);
			eventType(target, 'MSPointerUp', this);
		}

		if ( utils.hasTouch && !this.options.disableTouch ) {
			eventType(this.wrapper, 'touchstart', this);
			eventType(target, 'touchmove', this);
			eventType(target, 'touchcancel', this);
			eventType(target, 'touchend', this);
		}

		eventType(this.scroller, 'transitionend', this);
		eventType(this.scroller, 'webkitTransitionEnd', this);
		eventType(this.scroller, 'oTransitionEnd', this);
		eventType(this.scroller, 'MSTransitionEnd', this);
	},

	getComputedPosition: function () {
		var matrix = window.getComputedStyle(this.scroller, null),
			x, y;

		if ( this.options.useTransform ) {
			matrix = matrix[utils.style.transform].split(')')[0].split(', ');
			x = +(matrix[12] || matrix[4]);
			y = +(matrix[13] || matrix[5]);
		} else {
			x = +matrix.left.replace(/[^-\d.]/g, '');
			y = +matrix.top.replace(/[^-\d.]/g, '');
		}

		return { x: x, y: y };
	},

	_initIndicators: function () {
		var interactive = this.options.interactiveScrollbars,
			customStyle = typeof this.options.scrollbars != 'string',
			indicators = [],
			indicator;

		var that = this;

		this.indicators = [];

		if ( this.options.scrollbars ) {
			// Vertical scrollbar
			if ( this.options.scrollY ) {
				indicator = {
					el: createDefaultScrollbar('v', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeScrollbars,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenX: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}

			// Horizontal scrollbar
			if ( this.options.scrollX ) {
				indicator = {
					el: createDefaultScrollbar('h', interactive, this.options.scrollbars),
					interactive: interactive,
					defaultScrollbars: true,
					customStyle: customStyle,
					resize: this.options.resizeScrollbars,
					shrink: this.options.shrinkScrollbars,
					fade: this.options.fadeScrollbars,
					listenY: false
				};

				this.wrapper.appendChild(indicator.el);
				indicators.push(indicator);
			}
		}

		if ( this.options.indicators ) {
			// TODO: check concat compatibility
			indicators = indicators.concat(this.options.indicators);
		}

		for ( var i = indicators.length; i--; ) {
			this.indicators.push( new Indicator(this, indicators[i]) );
		}

		// TODO: check if we can use array.map (wide compatibility and performance issues)
		function _indicatorsMap (fn) {
			for ( var i = that.indicators.length; i--; ) {
				fn.call(that.indicators[i]);
			}
		}

		if ( this.options.fadeScrollbars ) {
			this.on('scrollEnd', function () {
				_indicatorsMap(function () {
					this.fade();
				});
			});

			this.on('scrollCancel', function () {
				_indicatorsMap(function () {
					this.fade();
				});
			});

			this.on('scrollStart', function () {
				_indicatorsMap(function () {
					this.fade(1);
				});
			});

			this.on('beforeScrollStart', function () {
				_indicatorsMap(function () {
					this.fade(1, true);
				});
			});
		}


		this.on('refresh', function () {
			_indicatorsMap(function () {
				this.refresh();
			});
		});

		this.on('destroy', function () {
			_indicatorsMap(function () {
				this.destroy();
			});

			delete this.indicators;
		});
	},

	_initWheel: function () {
		utils.addEvent(this.wrapper, 'wheel', this);
		utils.addEvent(this.wrapper, 'mousewheel', this);
		utils.addEvent(this.wrapper, 'DOMMouseScroll', this);

		this.on('destroy', function () {
			utils.removeEvent(this.wrapper, 'wheel', this);
			utils.removeEvent(this.wrapper, 'mousewheel', this);
			utils.removeEvent(this.wrapper, 'DOMMouseScroll', this);
		});
	},

	_wheel: function (e) {
		if ( !this.enabled ) {
			return;
		}

		e.preventDefault();
		e.stopPropagation();

		var wheelDeltaX, wheelDeltaY,
			newX, newY,
			that = this;

		if ( this.wheelTimeout === undefined ) {
			that._execEvent('scrollStart');
		}

		// Execute the scrollEnd event after 400ms the wheel stopped scrolling
		clearTimeout(this.wheelTimeout);
		this.wheelTimeout = setTimeout(function () {
			that._execEvent('scrollEnd');
			that.wheelTimeout = undefined;
		}, 400);

		if ( 'deltaX' in e ) {
			wheelDeltaX = -e.deltaX;
			wheelDeltaY = -e.deltaY;
		} else if ( 'wheelDeltaX' in e ) {
			wheelDeltaX = e.wheelDeltaX / 120 * this.options.mouseWheelSpeed;
			wheelDeltaY = e.wheelDeltaY / 120 * this.options.mouseWheelSpeed;
		} else if ( 'wheelDelta' in e ) {
			wheelDeltaX = wheelDeltaY = e.wheelDelta / 120 * this.options.mouseWheelSpeed;
		} else if ( 'detail' in e ) {
			wheelDeltaX = wheelDeltaY = -e.detail / 3 * this.options.mouseWheelSpeed;
		} else {
			return;
		}

		wheelDeltaX *= this.options.invertWheelDirection;
		wheelDeltaY *= this.options.invertWheelDirection;

		if ( !this.hasVerticalScroll ) {
			wheelDeltaX = wheelDeltaY;
			wheelDeltaY = 0;
		}

		if ( this.options.snap ) {
			newX = this.currentPage.pageX;
			newY = this.currentPage.pageY;

			if ( wheelDeltaX > 0 ) {
				newX--;
			} else if ( wheelDeltaX < 0 ) {
				newX++;
			}

			if ( wheelDeltaY > 0 ) {
				newY--;
			} else if ( wheelDeltaY < 0 ) {
				newY++;
			}

			this.goToPage(newX, newY);

			return;
		}

		newX = this.x + Math.round(this.hasHorizontalScroll ? wheelDeltaX : 0);
		newY = this.y + Math.round(this.hasVerticalScroll ? wheelDeltaY : 0);

		if ( newX > 0 ) {
			newX = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
		}

		if ( newY > 0 ) {
			newY = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
		}

		this.scrollTo(newX, newY, 0);

// INSERT POINT: _wheel
	},

	_initSnap: function () {
		this.currentPage = {};

		if ( typeof this.options.snap == 'string' ) {
			this.options.snap = this.scroller.querySelectorAll(this.options.snap);
		}

		this.on('refresh', function () {
			var i = 0, l,
				m = 0, n,
				cx, cy,
				x = 0, y,
				stepX = this.options.snapStepX || this.wrapperWidth,
				stepY = this.options.snapStepY || this.wrapperHeight,
				el;

			this.pages = [];

			if ( !this.wrapperWidth || !this.wrapperHeight || !this.scrollerWidth || !this.scrollerHeight ) {
				return;
			}

			if ( this.options.snap === true ) {
				cx = Math.round( stepX / 2 );
				cy = Math.round( stepY / 2 );

				while ( x > -this.scrollerWidth ) {
					this.pages[i] = [];
					l = 0;
					y = 0;

					while ( y > -this.scrollerHeight ) {
						this.pages[i][l] = {
							x: Math.max(x, this.maxScrollX),
							y: Math.max(y, this.maxScrollY),
							width: stepX,
							height: stepY,
							cx: x - cx,
							cy: y - cy
						};

						y -= stepY;
						l++;
					}

					x -= stepX;
					i++;
				}
			} else {
				el = this.options.snap;
				l = el.length;
				n = -1;

				for ( ; i < l; i++ ) {
					if ( i === 0 || el[i].offsetLeft <= el[i-1].offsetLeft ) {
						m = 0;
						n++;
					}

					if ( !this.pages[m] ) {
						this.pages[m] = [];
					}

					x = Math.max(-el[i].offsetLeft, this.maxScrollX);
					y = Math.max(-el[i].offsetTop, this.maxScrollY);
					cx = x - Math.round(el[i].offsetWidth / 2);
					cy = y - Math.round(el[i].offsetHeight / 2);

					this.pages[m][n] = {
						x: x,
						y: y,
						width: el[i].offsetWidth,
						height: el[i].offsetHeight,
						cx: cx,
						cy: cy
					};

					if ( x > this.maxScrollX ) {
						m++;
					}
				}
			}

			this.goToPage(this.currentPage.pageX || 0, this.currentPage.pageY || 0, 0);

			// Update snap threshold if needed
			if ( this.options.snapThreshold % 1 === 0 ) {
				this.snapThresholdX = this.options.snapThreshold;
				this.snapThresholdY = this.options.snapThreshold;
			} else {
				this.snapThresholdX = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].width * this.options.snapThreshold);
				this.snapThresholdY = Math.round(this.pages[this.currentPage.pageX][this.currentPage.pageY].height * this.options.snapThreshold);
			}
		});

		this.on('flick', function () {
			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.x - this.startX), 1000),
						Math.min(Math.abs(this.y - this.startY), 1000)
					), 300);

			this.goToPage(
				this.currentPage.pageX + this.directionX,
				this.currentPage.pageY + this.directionY,
				time
			);
		});
	},

	_nearestSnap: function (x, y) {
		if ( !this.pages.length ) {
			return { x: 0, y: 0, pageX: 0, pageY: 0 };
		}

		var i = 0,
			l = this.pages.length,
			m = 0;

		// Check if we exceeded the snap threshold
		if ( Math.abs(x - this.absStartX) < this.snapThresholdX &&
			Math.abs(y - this.absStartY) < this.snapThresholdY ) {
			return this.currentPage;
		}

		if ( x > 0 ) {
			x = 0;
		} else if ( x < this.maxScrollX ) {
			x = this.maxScrollX;
		}

		if ( y > 0 ) {
			y = 0;
		} else if ( y < this.maxScrollY ) {
			y = this.maxScrollY;
		}

		for ( ; i < l; i++ ) {
			if ( x >= this.pages[i][0].cx ) {
				x = this.pages[i][0].x;
				break;
			}
		}

		l = this.pages[i].length;

		for ( ; m < l; m++ ) {
			if ( y >= this.pages[0][m].cy ) {
				y = this.pages[0][m].y;
				break;
			}
		}

		if ( i == this.currentPage.pageX ) {
			i += this.directionX;

			if ( i < 0 ) {
				i = 0;
			} else if ( i >= this.pages.length ) {
				i = this.pages.length - 1;
			}

			x = this.pages[i][0].x;
		}

		if ( m == this.currentPage.pageY ) {
			m += this.directionY;

			if ( m < 0 ) {
				m = 0;
			} else if ( m >= this.pages[0].length ) {
				m = this.pages[0].length - 1;
			}

			y = this.pages[0][m].y;
		}

		return {
			x: x,
			y: y,
			pageX: i,
			pageY: m
		};
	},

	goToPage: function (x, y, time, easing) {
		easing = easing || this.options.bounceEasing;

		if ( x >= this.pages.length ) {
			x = this.pages.length - 1;
		} else if ( x < 0 ) {
			x = 0;
		}

		if ( y >= this.pages[x].length ) {
			y = this.pages[x].length - 1;
		} else if ( y < 0 ) {
			y = 0;
		}

		var posX = this.pages[x][y].x,
			posY = this.pages[x][y].y;

		time = time === undefined ? this.options.snapSpeed || Math.max(
			Math.max(
				Math.min(Math.abs(posX - this.x), 1000),
				Math.min(Math.abs(posY - this.y), 1000)
			), 300) : time;

		this.currentPage = {
			x: posX,
			y: posY,
			pageX: x,
			pageY: y
		};

		this.scrollTo(posX, posY, time, easing);
	},

	next: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x++;

		if ( x >= this.pages.length && this.hasVerticalScroll ) {
			x = 0;
			y++;
		}

		this.goToPage(x, y, time, easing);
	},

	prev: function (time, easing) {
		var x = this.currentPage.pageX,
			y = this.currentPage.pageY;

		x--;

		if ( x < 0 && this.hasVerticalScroll ) {
			x = 0;
			y--;
		}

		this.goToPage(x, y, time, easing);
	},

	_initKeys: function (e) {
		// default key bindings
		var keys = {
			pageUp: 33,
			pageDown: 34,
			end: 35,
			home: 36,
			left: 37,
			up: 38,
			right: 39,
			down: 40
		};
		var i;

		// if you give me characters I give you keycode
		if ( typeof this.options.keyBindings == 'object' ) {
			for ( i in this.options.keyBindings ) {
				if ( typeof this.options.keyBindings[i] == 'string' ) {
					this.options.keyBindings[i] = this.options.keyBindings[i].toUpperCase().charCodeAt(0);
				}
			}
		} else {
			this.options.keyBindings = {};
		}

		for ( i in keys ) {
			this.options.keyBindings[i] = this.options.keyBindings[i] || keys[i];
		}

		utils.addEvent(window, 'keydown', this);

		this.on('destroy', function () {
			utils.removeEvent(window, 'keydown', this);
		});
	},

	_key: function (e) {
		if ( !this.enabled ) {
			return;
		}

		var snap = this.options.snap,	// we are using this alot, better to cache it
			newX = snap ? this.currentPage.pageX : this.x,
			newY = snap ? this.currentPage.pageY : this.y,
			now = utils.getTime(),
			prevTime = this.keyTime || 0,
			acceleration = 0.250,
			pos;

		if ( this.options.useTransition && this.isInTransition ) {
			pos = this.getComputedPosition();

			this._translate(Math.round(pos.x), Math.round(pos.y));
			this.isInTransition = false;
		}

		this.keyAcceleration = now - prevTime < 200 ? Math.min(this.keyAcceleration + acceleration, 50) : 0;

		switch ( e.keyCode ) {
			case this.options.keyBindings.pageUp:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX += snap ? 1 : this.wrapperWidth;
				} else {
					newY += snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.pageDown:
				if ( this.hasHorizontalScroll && !this.hasVerticalScroll ) {
					newX -= snap ? 1 : this.wrapperWidth;
				} else {
					newY -= snap ? 1 : this.wrapperHeight;
				}
				break;
			case this.options.keyBindings.end:
				newX = snap ? this.pages.length-1 : this.maxScrollX;
				newY = snap ? this.pages[0].length-1 : this.maxScrollY;
				break;
			case this.options.keyBindings.home:
				newX = 0;
				newY = 0;
				break;
			case this.options.keyBindings.left:
				newX += snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.up:
				newY += snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.right:
				newX -= snap ? -1 : 5 + this.keyAcceleration>>0;
				break;
			case this.options.keyBindings.down:
				newY -= snap ? 1 : 5 + this.keyAcceleration>>0;
				break;
			default:
				return;
		}

		if ( snap ) {
			this.goToPage(newX, newY);
			return;
		}

		if ( newX > 0 ) {
			newX = 0;
			this.keyAcceleration = 0;
		} else if ( newX < this.maxScrollX ) {
			newX = this.maxScrollX;
			this.keyAcceleration = 0;
		}

		if ( newY > 0 ) {
			newY = 0;
			this.keyAcceleration = 0;
		} else if ( newY < this.maxScrollY ) {
			newY = this.maxScrollY;
			this.keyAcceleration = 0;
		}

		this.scrollTo(newX, newY, 0);

		this.keyTime = now;
	},

	_animate: function (destX, destY, duration, easingFn) {
		var that = this,
			startX = this.x,
			startY = this.y,
			startTime = utils.getTime(),
			destTime = startTime + duration;

		function step () {
			var now = utils.getTime(),
				newX, newY,
				easing;

			if ( now >= destTime ) {
				that.isAnimating = false;
				that._translate(destX, destY);

				if ( !that.resetPosition(that.options.bounceTime) ) {
					that._execEvent('scrollEnd');
				}

				return;
			}

			now = ( now - startTime ) / duration;
			easing = easingFn(now);
			newX = ( destX - startX ) * easing + startX;
			newY = ( destY - startY ) * easing + startY;
			that._translate(newX, newY);

			if ( that.isAnimating ) {
				rAF(step);
			}
		}

		this.isAnimating = true;
		step();
	},
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
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
				if ( !e._constructed ) {
					e.preventDefault();
					e.stopPropagation();
				}
				break;
		}
	}
};
function createDefaultScrollbar (direction, interactive, type) {
	var scrollbar = document.createElement('div'),
		indicator = document.createElement('div');

	if ( type === true ) {
		scrollbar.style.cssText = 'position:absolute;z-index:9999';
		indicator.style.cssText = '-webkit-box-sizing:border-box;-moz-box-sizing:border-box;box-sizing:border-box;position:absolute;background:rgba(0,0,0,0.5);border:1px solid rgba(255,255,255,0.9);border-radius:3px';
	}

	indicator.className = 'iScrollIndicator';

	if ( direction == 'h' ) {
		if ( type === true ) {
			scrollbar.style.cssText += ';height:7px;left:2px;right:2px;bottom:0';
			indicator.style.height = '100%';
		}
		scrollbar.className = 'iScrollHorizontalScrollbar';
	} else {
		if ( type === true ) {
			scrollbar.style.cssText += ';width:7px;bottom:2px;top:2px;right:1px';
			indicator.style.width = '100%';
		}
		scrollbar.className = 'iScrollVerticalScrollbar';
	}

	scrollbar.style.cssText += ';overflow:hidden';

	if ( !interactive ) {
		scrollbar.style.pointerEvents = 'none';
	}

	scrollbar.appendChild(indicator);

	return scrollbar;
}

function Indicator (scroller, options) {
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

	for ( var i in options ) {
		this.options[i] = options[i];
	}

	this.sizeRatioX = 1;
	this.sizeRatioY = 1;
	this.maxPosX = 0;
	this.maxPosY = 0;

	if ( this.options.interactive ) {
		if ( !this.options.disableTouch ) {
			utils.addEvent(this.indicator, 'touchstart', this);
			utils.addEvent(window, 'touchend', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(this.indicator, 'MSPointerDown', this);
			utils.addEvent(window, 'MSPointerUp', this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(this.indicator, 'mousedown', this);
			utils.addEvent(window, 'mouseup', this);
		}
	}

	if ( this.options.fade ) {
		this.wrapperStyle[utils.style.transform] = this.scroller.translateZ;
		this.wrapperStyle[utils.style.transitionDuration] = utils.isBadAndroid ? '0.001s' : '0ms';
		this.wrapperStyle.opacity = '0';
	}
}

Indicator.prototype = {
	handleEvent: function (e) {
		switch ( e.type ) {
			case 'touchstart':
			case 'MSPointerDown':
			case 'mousedown':
				this._start(e);
				break;
			case 'touchmove':
			case 'MSPointerMove':
			case 'mousemove':
				this._move(e);
				break;
			case 'touchend':
			case 'MSPointerUp':
			case 'mouseup':
			case 'touchcancel':
			case 'MSPointerCancel':
			case 'mousecancel':
				this._end(e);
				break;
		}
	},

	destroy: function () {
		if ( this.options.interactive ) {
			utils.removeEvent(this.indicator, 'touchstart', this);
			utils.removeEvent(this.indicator, 'MSPointerDown', this);
			utils.removeEvent(this.indicator, 'mousedown', this);

			utils.removeEvent(window, 'touchmove', this);
			utils.removeEvent(window, 'MSPointerMove', this);
			utils.removeEvent(window, 'mousemove', this);

			utils.removeEvent(window, 'touchend', this);
			utils.removeEvent(window, 'MSPointerUp', this);
			utils.removeEvent(window, 'mouseup', this);
		}

		if ( this.options.defaultScrollbars ) {
			this.wrapper.parentNode.removeChild(this.wrapper);
		}
	},

	_start: function (e) {
		var point = e.touches ? e.touches[0] : e;

		e.preventDefault();
		e.stopPropagation();

		this.transitionTime();

		this.initiated = true;
		this.moved = false;
		this.lastPointX	= point.pageX;
		this.lastPointY	= point.pageY;

		this.startTime	= utils.getTime();

		if ( !this.options.disableTouch ) {
			utils.addEvent(window, 'touchmove', this);
		}
		if ( !this.options.disablePointer ) {
			utils.addEvent(window, 'MSPointerMove', this);
		}
		if ( !this.options.disableMouse ) {
			utils.addEvent(window, 'mousemove', this);
		}

		this.scroller._execEvent('beforeScrollStart');
	},

	_move: function (e) {
		var point = e.touches ? e.touches[0] : e,
			deltaX, deltaY,
			newX, newY,
			timestamp = utils.getTime();

		if ( !this.moved ) {
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
	},

	_end: function (e) {
		if ( !this.initiated ) {
			return;
		}

		this.initiated = false;

		e.preventDefault();
		e.stopPropagation();

		utils.removeEvent(window, 'touchmove', this);
		utils.removeEvent(window, 'MSPointerMove', this);
		utils.removeEvent(window, 'mousemove', this);

		if ( this.scroller.options.snap ) {
			var snap = this.scroller._nearestSnap(this.scroller.x, this.scroller.y);

			var time = this.options.snapSpeed || Math.max(
					Math.max(
						Math.min(Math.abs(this.scroller.x - snap.x), 1000),
						Math.min(Math.abs(this.scroller.y - snap.y), 1000)
					), 300);

			if ( this.scroller.x != snap.x || this.scroller.y != snap.y ) {
				this.scroller.directionX = 0;
				this.scroller.directionY = 0;
				this.scroller.currentPage = snap;
				this.scroller.scrollTo(snap.x, snap.y, time, this.scroller.options.bounceEasing);
			}
		}

		if ( this.moved ) {
			this.scroller._execEvent('scrollEnd');
		}
	},

	transitionTime: function (time) {
		time = time || 0;
		this.indicatorStyle[utils.style.transitionDuration] = time + 'ms';

		if ( !time && utils.isBadAndroid ) {
			this.indicatorStyle[utils.style.transitionDuration] = '0.001s';
		}
	},

	transitionTimingFunction: function (easing) {
		this.indicatorStyle[utils.style.transitionTimingFunction] = easing;
	},

	refresh: function () {
		this.transitionTime();

		if ( this.options.listenX && !this.options.listenY ) {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll ? 'block' : 'none';
		} else if ( this.options.listenY && !this.options.listenX ) {
			this.indicatorStyle.display = this.scroller.hasVerticalScroll ? 'block' : 'none';
		} else {
			this.indicatorStyle.display = this.scroller.hasHorizontalScroll || this.scroller.hasVerticalScroll ? 'block' : 'none';
		}

		if ( this.scroller.hasHorizontalScroll && this.scroller.hasVerticalScroll ) {
			utils.addClass(this.wrapper, 'iScrollBothScrollbars');
			utils.removeClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '8px';
				} else {
					this.wrapper.style.bottom = '8px';
				}
			}
		} else {
			utils.removeClass(this.wrapper, 'iScrollBothScrollbars');
			utils.addClass(this.wrapper, 'iScrollLoneScrollbar');

			if ( this.options.defaultScrollbars && this.options.customStyle ) {
				if ( this.options.listenX ) {
					this.wrapper.style.right = '2px';
				} else {
					this.wrapper.style.bottom = '2px';
				}
			}
		}

		var r = this.wrapper.offsetHeight;	// force refresh

		if ( this.options.listenX ) {
			this.wrapperWidth = this.wrapper.clientWidth;
			if ( this.options.resize ) {
				this.indicatorWidth = Math.max(Math.round(this.wrapperWidth * this.wrapperWidth / (this.scroller.scrollerWidth || this.wrapperWidth || 1)), 8);
				this.indicatorStyle.width = this.indicatorWidth + 'px';
			} else {
				this.indicatorWidth = this.indicator.clientWidth;
			}

			this.maxPosX = this.wrapperWidth - this.indicatorWidth;

			if ( this.options.shrink == 'clip' ) {
				this.minBoundaryX = -this.indicatorWidth + 8;
				this.maxBoundaryX = this.wrapperWidth - 8;
			} else {
				this.minBoundaryX = 0;
				this.maxBoundaryX = this.maxPosX;
			}

			this.sizeRatioX = this.options.speedRatioX || (this.scroller.maxScrollX && (this.maxPosX / this.scroller.maxScrollX));	
		}

		if ( this.options.listenY ) {
			this.wrapperHeight = this.wrapper.clientHeight;
			if ( this.options.resize ) {
				this.indicatorHeight = Math.max(Math.round(this.wrapperHeight * this.wrapperHeight / (this.scroller.scrollerHeight || this.wrapperHeight || 1)), 8);
				this.indicatorStyle.height = this.indicatorHeight + 'px';
			} else {
				this.indicatorHeight = this.indicator.clientHeight;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;

			if ( this.options.shrink == 'clip' ) {
				this.minBoundaryY = -this.indicatorHeight + 8;
				this.maxBoundaryY = this.wrapperHeight - 8;
			} else {
				this.minBoundaryY = 0;
				this.maxBoundaryY = this.maxPosY;
			}

			this.maxPosY = this.wrapperHeight - this.indicatorHeight;
			this.sizeRatioY = this.options.speedRatioY || (this.scroller.maxScrollY && (this.maxPosY / this.scroller.maxScrollY));
		}

		this.updatePosition();
	},

	updatePosition: function () {
		var x = this.options.listenX && Math.round(this.sizeRatioX * this.scroller.x) || 0,
			y = this.options.listenY && Math.round(this.sizeRatioY * this.scroller.y) || 0;

		if ( !this.options.ignoreBoundaries ) {
			if ( x < this.minBoundaryX ) {
				if ( this.options.shrink == 'scale' ) {
					this.width = Math.max(this.indicatorWidth + x, 8);
					this.indicatorStyle.width = this.width + 'px';
				}
				x = this.minBoundaryX;
			} else if ( x > this.maxBoundaryX ) {
				if ( this.options.shrink == 'scale' ) {
					this.width = Math.max(this.indicatorWidth - (x - this.maxPosX), 8);
					this.indicatorStyle.width = this.width + 'px';
					x = this.maxPosX + this.indicatorWidth - this.width;
				} else {
					x = this.maxBoundaryX;
				}
			} else if ( this.options.shrink == 'scale' && this.width != this.indicatorWidth ) {
				this.width = this.indicatorWidth;
				this.indicatorStyle.width = this.width + 'px';
			}

			if ( y < this.minBoundaryY ) {
				if ( this.options.shrink == 'scale' ) {
					this.height = Math.max(this.indicatorHeight + y * 3, 8);
					this.indicatorStyle.height = this.height + 'px';
				}
				y = this.minBoundaryY;
			} else if ( y > this.maxBoundaryY ) {
				if ( this.options.shrink == 'scale' ) {
					this.height = Math.max(this.indicatorHeight - (y - this.maxPosY) * 3, 8);
					this.indicatorStyle.height = this.height + 'px';
					y = this.maxPosY + this.indicatorHeight - this.height;
				} else {
					y = this.maxBoundaryY;
				}
			} else if ( this.options.shrink == 'scale' && this.height != this.indicatorHeight ) {
				this.height = this.indicatorHeight;
				this.indicatorStyle.height = this.height + 'px';
			}
		}

		this.x = x;
		this.y = y;

		if ( this.scroller.options.useTransform ) {
			this.indicatorStyle[utils.style.transform] = 'translate(' + x + 'px,' + y + 'px)' + this.scroller.translateZ;
		} else {
			this.indicatorStyle.left = x + 'px';
			this.indicatorStyle.top = y + 'px';
		}
	},

	_pos: function (x, y) {
		if ( x < 0 ) {
			x = 0;
		} else if ( x > this.maxPosX ) {
			x = this.maxPosX;
		}

		if ( y < 0 ) {
			y = 0;
		} else if ( y > this.maxPosY ) {
			y = this.maxPosY;
		}

		x = this.options.listenX ? Math.round(x / this.sizeRatioX) : this.scroller.x;
		y = this.options.listenY ? Math.round(y / this.sizeRatioY) : this.scroller.y;

		this.scroller.scrollTo(x, y);
	},

	fade: function (val, hold) {
		if ( hold && !this.visible ) {
			return;
		}

		clearTimeout(this.fadeTimeout);
		this.fadeTimeout = null;

		var time = val ? 250 : 500,
			delay = val ? 0 : 300;

		val = val ? '1' : '0';

		this.wrapperStyle[utils.style.transitionDuration] = time + 'ms';

		this.fadeTimeout = setTimeout((function (val) {
			this.wrapperStyle.opacity = val;
			this.visible = +val;
		}).bind(this, val), delay);
	}
};

IScroll.utils = utils;

if ( typeof module != 'undefined' && module.exports ) {
	module.exports = IScroll;
} else {
	window.IScroll = IScroll;
}

})(window, document, Math);;
/**
* jquery-match-height 0.7.2 by @liabru
* http://brm.io/jquery-match-height/
* License: MIT
*/

;(function(factory) { // eslint-disable-line no-extra-semi
    'use strict';
    if (typeof define === 'function' && define.amd) {
        // AMD
        define(['jquery'], factory);
    } else if (typeof module !== 'undefined' && module.exports) {
        // CommonJS
        module.exports = factory(require('jquery'));
    } else {
        // Global
        factory(jQuery);
    }
})(function($) {
    /*
    *  internal
    */

    var _previousResizeWidth = -1,
        _updateTimeout = -1;

    /*
    *  _parse
    *  value parse utility function
    */

    var _parse = function(value) {
        // parse value and convert NaN to 0
        return parseFloat(value) || 0;
    };

    /*
    *  _rows
    *  utility function returns array of jQuery selections representing each row
    *  (as displayed after float wrapping applied by browser)
    */

    var _rows = function(elements) {
        var tolerance = 1,
            $elements = $(elements),
            lastTop = null,
            rows = [];

        // group elements by their top position
        $elements.each(function(){
            var $that = $(this),
                top = $that.offset().top - _parse($that.css('margin-top')),
                lastRow = rows.length > 0 ? rows[rows.length - 1] : null;

            if (lastRow === null) {
                // first item on the row, so just push it
                rows.push($that);
            } else {
                // if the row top is the same, add to the row group
                if (Math.floor(Math.abs(lastTop - top)) <= tolerance) {
                    rows[rows.length - 1] = lastRow.add($that);
                } else {
                    // otherwise start a new row group
                    rows.push($that);
                }
            }

            // keep track of the last row top
            lastTop = top;
        });

        return rows;
    };

    /*
    *  _parseOptions
    *  handle plugin options
    */

    var _parseOptions = function(options) {
        var opts = {
            byRow: true,
            property: 'height',
            target: null,
            remove: false
        };

        if (typeof options === 'object') {
            return $.extend(opts, options);
        }

        if (typeof options === 'boolean') {
            opts.byRow = options;
        } else if (options === 'remove') {
            opts.remove = true;
        }

        return opts;
    };

    /*
    *  matchHeight
    *  plugin definition
    */

    var matchHeight = $.fn.matchHeight = function(options) {
        var opts = _parseOptions(options);

        // handle remove
        if (opts.remove) {
            var that = this;

            // remove fixed height from all selected elements
            this.css(opts.property, '');

            // remove selected elements from all groups
            $.each(matchHeight._groups, function(key, group) {
                group.elements = group.elements.not(that);
            });

            // TODO: cleanup empty groups

            return this;
        }

        if (this.length <= 1 && !opts.target) {
            return this;
        }

        // keep track of this group so we can re-apply later on load and resize events
        matchHeight._groups.push({
            elements: this,
            options: opts
        });

        // match each element's height to the tallest element in the selection
        matchHeight._apply(this, opts);

        return this;
    };

    /*
    *  plugin global options
    */

    matchHeight.version = '0.7.2';
    matchHeight._groups = [];
    matchHeight._throttle = 80;
    matchHeight._maintainScroll = false;
    matchHeight._beforeUpdate = null;
    matchHeight._afterUpdate = null;
    matchHeight._rows = _rows;
    matchHeight._parse = _parse;
    matchHeight._parseOptions = _parseOptions;

    /*
    *  matchHeight._apply
    *  apply matchHeight to given elements
    */

    matchHeight._apply = function(elements, options) {
        var opts = _parseOptions(options),
            $elements = $(elements),
            rows = [$elements];

        // take note of scroll position
        var scrollTop = $(window).scrollTop(),
            htmlHeight = $('html').outerHeight(true);

        // get hidden parents
        var $hiddenParents = $elements.parents().filter(':hidden');

        // cache the original inline style
        $hiddenParents.each(function() {
            var $that = $(this);
            $that.data('style-cache', $that.attr('style'));
        });

        // temporarily must force hidden parents visible
        $hiddenParents.css('display', 'block');

        // get rows if using byRow, otherwise assume one row
        if (opts.byRow && !opts.target) {

            // must first force an arbitrary equal height so floating elements break evenly
            $elements.each(function() {
                var $that = $(this),
                    display = $that.css('display');

                // temporarily force a usable display value
                if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
                    display = 'block';
                }

                // cache the original inline style
                $that.data('style-cache', $that.attr('style'));

                $that.css({
                    'display': display,
                    'padding-top': '0',
                    'padding-bottom': '0',
                    'margin-top': '0',
                    'margin-bottom': '0',
                    'border-top-width': '0',
                    'border-bottom-width': '0',
                    'height': '100px',
                    'overflow': 'hidden'
                });
            });

            // get the array of rows (based on element top position)
            rows = _rows($elements);

            // revert original inline styles
            $elements.each(function() {
                var $that = $(this);
                $that.attr('style', $that.data('style-cache') || '');
            });
        }

        $.each(rows, function(key, row) {
            var $row = $(row),
                targetHeight = 0;

            if (!opts.target) {
                // skip apply to rows with only one item
                if (opts.byRow && $row.length <= 1) {
                    $row.css(opts.property, '');
                    return;
                }

                // iterate the row and find the max height
                $row.each(function(){
                    var $that = $(this),
                        style = $that.attr('style'),
                        display = $that.css('display');

                    // temporarily force a usable display value
                    if (display !== 'inline-block' && display !== 'flex' && display !== 'inline-flex') {
                        display = 'block';
                    }

                    // ensure we get the correct actual height (and not a previously set height value)
                    var css = { 'display': display };
                    css[opts.property] = '';
                    $that.css(css);

                    // find the max height (including padding, but not margin)
                    if ($that.outerHeight(false) > targetHeight) {
                        targetHeight = $that.outerHeight(false);
                    }

                    // revert styles
                    if (style) {
                        $that.attr('style', style);
                    } else {
                        $that.css('display', '');
                    }
                });
            } else {
                // if target set, use the height of the target element
                targetHeight = opts.target.outerHeight(false);
            }

            // iterate the row and apply the height to all elements
            $row.each(function(){
                var $that = $(this),
                    verticalPadding = 0;

                // don't apply to a target
                if (opts.target && $that.is(opts.target)) {
                    return;
                }

                // handle padding and border correctly (required when not using border-box)
                if ($that.css('box-sizing') !== 'border-box') {
                    verticalPadding += _parse($that.css('border-top-width')) + _parse($that.css('border-bottom-width'));
                    verticalPadding += _parse($that.css('padding-top')) + _parse($that.css('padding-bottom'));
                }

                // set the height (accounting for padding and border)
                $that.css(opts.property, (targetHeight - verticalPadding) + 'px');
            });
        });

        // revert hidden parents
        $hiddenParents.each(function() {
            var $that = $(this);
            $that.attr('style', $that.data('style-cache') || null);
        });

        // restore scroll position if enabled
        if (matchHeight._maintainScroll) {
            $(window).scrollTop((scrollTop / htmlHeight) * $('html').outerHeight(true));
        }

        return this;
    };

    /*
    *  matchHeight._applyDataApi
    *  applies matchHeight to all elements with a data-match-height attribute
    */

    matchHeight._applyDataApi = function() {
        var groups = {};

        // generate groups by their groupId set by elements using data-match-height
        $('[data-match-height], [data-mh]').each(function() {
            var $this = $(this),
                groupId = $this.attr('data-mh') || $this.attr('data-match-height');

            if (groupId in groups) {
                groups[groupId] = groups[groupId].add($this);
            } else {
                groups[groupId] = $this;
            }
        });

        // apply matchHeight to each group
        $.each(groups, function() {
            this.matchHeight(true);
        });
    };

    /*
    *  matchHeight._update
    *  updates matchHeight on all current groups with their correct options
    */

    var _update = function(event) {
        if (matchHeight._beforeUpdate) {
            matchHeight._beforeUpdate(event, matchHeight._groups);
        }

        $.each(matchHeight._groups, function() {
            matchHeight._apply(this.elements, this.options);
        });

        if (matchHeight._afterUpdate) {
            matchHeight._afterUpdate(event, matchHeight._groups);
        }
    };

    matchHeight._update = function(throttle, event) {
        // prevent update if fired from a resize event
        // where the viewport width hasn't actually changed
        // fixes an event looping bug in IE8
        if (event && event.type === 'resize') {
            var windowWidth = $(window).width();
            if (windowWidth === _previousResizeWidth) {
                return;
            }
            _previousResizeWidth = windowWidth;
        }

        // throttle updates
        if (!throttle) {
            _update(event);
        } else if (_updateTimeout === -1) {
            _updateTimeout = setTimeout(function() {
                _update(event);
                _updateTimeout = -1;
            }, matchHeight._throttle);
        }
    };

    /*
    *  bind events
    */

    // apply on DOM ready event
    $(matchHeight._applyDataApi);

    // use on or bind where supported
    var on = $.fn.on ? 'on' : 'bind';

    // update heights on load and resize events
    $(window)[on]('load', function(event) {
        matchHeight._update(false, event);
    });

    // throttled update heights on resize events
    $(window)[on]('resize orientationchange', function(event) {
        matchHeight._update(true, event);
    });

});
;
/**
 * @file
 * Open Rose JS.
 */

(function ($) {
  "use strict";
  Drupal.openy_rose = Drupal.openy_rose || {};
  Drupal.behaviors.openy_rose_theme = {
    attach: function (context, settings) {
      $('.ui-tabs').tabs({
        active: false,
        collapsible: true
      });
    }
  };

  // Sidebar collapsible.
  Drupal.behaviors.sidebar = {
    attach: function (context, settings) {
      var current_scroll = 0;
      $('.sidebar')
        .once()
        .on('show.bs.collapse',
          // Add custom class for expand specific styling. in = open.
          function (e) {
            $(this)
              .next('.viewport')
              .addBack()
              .removeClass('out')
              .addClass('collapsing-in')
              .removeAttr('aria-hidden');

            current_scroll = $(window).scrollTop();
            $('.nav-global').css({
              top: current_scroll
            });
          }
        )
        .on('shown.bs.collapse',
          // Allow css to control open rest state.
          function () {
            $(this)
              .next('.viewport')
              .addBack()
              .removeClass('collapsing-in')
              .addClass('in')
              .removeAttr('aria-hidden');

            var body = $('body');

            body.addClass('sidebar-in');

            $('html').addClass('sidebar-in');
          }
        )
        .on('hide.bs.collapse',
          // Add custom class for collapse specific styling. out = closed.
          function (e) {
            var sidebar = $(this);
            sidebar
              .next('.viewport')
              .addBack()
              .removeClass('in')
              .addClass('collapsing-out')
              .attr('aria-hidden', 'true');


            $(window).scrollTop(current_scroll);

            $('#page-head').css({
              marginTop: ''
            });

          }
        )
        .on('hidden.bs.collapse',
          // Allow css to control closed rest state.
          function () {
            $(this)
              .next('.viewport')
              .addBack()
              .addClass('out')
              .removeClass('collapsing-out');

            $('body').removeClass('sidebar-in');
            $('html').removeClass('sidebar-in');

            $('.nav-global').css({
              top: 0
            });
          }
        )
        .find('li')
        .on('hide.bs.dropdown',
          // For nested dropdowns, prevent collapse of other dropdowns.
          function (e) {
            e.preventDefault();
          }
        );
    }
  };

  // Sidebar collapsible menu items.
  Drupal.behaviors.sidebarMenuCollapsible = {
    attach: function (context, settings) {
      $('.sidebar .dropdown-toggle').on('click', function () {
        var expanded = $(this).attr('aria-expanded');
        if (expanded == 'true') {
          $(this).removeAttr('aria-expanded');
          $(this).parent().removeClass('open');
          return false;
        }
      });
    }
  };

  // Horizontal scroll for camp menu.
  Drupal.behaviors.scrollableList = {
    attach: function (context, settings) {
      $('.camp-menu-wrapper', context).once().each(function () {
        var $this = $(this),
            $list = $this.find('ul'),
            $items = $list.find('li'),
            listWidth = 0,
            listPadding = 40;

        setTimeout(function () {
          $items.each(function () {
            listWidth += $(this).outerWidth();
          });

          $list.css('width', listWidth + listPadding + "px");

          var columns = $this.find('.wrapper');
          if (columns.length == 0) {
            return;
          }
          var scroll = new IScroll(columns[0], {
            scrollX: true,
            scrollY: false,
            momentum: false,
            snap: false,
            bounce: true,
            touch: true,
            eventPassthrough: true
          });

          // GRADIENT BEHAVIOUR SCRIPT.
          var obj = $('.camp-menu');
          var objWrap = columns.append('<div class="columns-gradient gradient-right" onclick="void(0)"></div>');
          objWrap = document.querySelector('.columns-gradient');
          var sliderLength = listWidth - objWrap.offsetWidth + 40;
          var firstGap = 20;

          if (window.innerWidth > 768) {
            sliderLength = listWidth - objWrap.offsetWidth + 150;
            firstGap = 60;
          }

          obj.get(0).addEventListener('touchmove', function () {
            var transformMatrix = obj.css("-webkit-transform") ||
                obj.css("-moz-transform")    ||
                obj.css("-ms-transform")     ||
                obj.css("-o-transform")      ||
                obj.css("transform");
            var matrix = transformMatrix.replace(/[^0-9\-.,]/g, '').split(',');
            var x = matrix[12] || matrix[4];
            var y = matrix[13] || matrix[5];
            console.log(x, y);
            if (x <= -sliderLength + listPadding) {
              objWrap.classList.remove('gradient-right');
            }
            else {
              objWrap.classList.add('gradient-right');
            }

            if (x >= -firstGap) {
              objWrap.classList.remove('gradient-left');
            }
            else {
              objWrap.classList.add('gradient-left');
            }
          });
        }, 100);
      });
    }
  };

  // Adjust labels for hamburger menu icon.
  Drupal.behaviors.menuIconLabelChange = {
    attach: function (context, settings) {
      $('.navbar-toggle').on('click', function () {
        if ($(this).attr('aria-expanded') == 'false') {
          $(this).children('.sr-only').text(Drupal.t('Close main navigation'));
        } else {
          $(this).children('.sr-only').text(Drupal.t('Navigation menu'));
        }
      });
    }
  };

  /**
   * Adjust the top nav position when the skip link is in focus.
   */
  Drupal.behaviors.adjustSkipLink = {
    attach: function (context, settings) {
      // On focus, move the top nav down to show the skip link.
      $('.skip-link').on('focus', function () {
        var link_height = $(this).height();
        $('.top-navs').css({'margin-top': link_height});
      });
      // When focus is lost, remove the unneeded height.
      $('.skip-link').on('focusout', function () {
        $('.top-navs').css({'margin-top': '0'});
      });
    }
  };

  /**
   * Add focus for first loaded element.
   */
  Drupal.behaviors.load_more_focus = {
    attach: function (context, settings) {
      $('.views-element-container .load_more_button .button', context).click(function () {
        var $viewsRow = $('.views-element-container .views-row'),
          indexLastRow = $viewsRow.length,
          getElement,
          itemFocus;
        if (Drupal.views !== undefined) {
          $.each(Drupal.views.instances, function (i, view) {
            if (view.settings.view_name.length != 0) {
              $(document).ajaxComplete(function (event, xhr, settings) {
                getElement = $('.views-element-container .views-row');
                itemFocus = getElement[indexLastRow];
                // Add focus to element.
                $(itemFocus).find('h3 a').focus();
                // Update number indexLastRow.
                $viewsRow = $('.views-element-container .views-row');
                indexLastRow = $viewsRow.length;
              });
            }
          });
        }
      });
    }
  };

  // Location collapsible.
  Drupal.behaviors.schedules_location_collapse = {
    attach: function (context, settings) {
      $('label[for="form-group-location"]').on('click', function () {
        let status = $(this).attr('aria-expanded');
        if (status === 'false') {
          $(this).attr('aria-expanded', 'true');
        }
        else {
          $(this).attr('aria-expanded', 'false');
        }
      });
    }
  };

})(jQuery);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (Drupal, drupalSettings) {
  Drupal.behaviors.activeLinks = {
    attach: function attach(context) {
      var path = drupalSettings.path;
      var queryString = JSON.stringify(path.currentQuery);
      var querySelector = path.currentQuery ? '[data-drupal-link-query=\'' + queryString + '\']' : ':not([data-drupal-link-query])';
      var originalSelectors = ['[data-drupal-link-system-path="' + path.currentPath + '"]'];
      var selectors = void 0;

      if (path.isFront) {
        originalSelectors.push('[data-drupal-link-system-path="<front>"]');
      }

      selectors = [].concat(originalSelectors.map(function (selector) {
        return selector + ':not([hreflang])';
      }), originalSelectors.map(function (selector) {
        return selector + '[hreflang="' + path.currentLanguage + '"]';
      }));

      selectors = selectors.map(function (current) {
        return current + querySelector;
      });

      var activeLinks = context.querySelectorAll(selectors.join(','));
      var il = activeLinks.length;
      for (var i = 0; i < il; i++) {
        activeLinks[i].classList.add('is-active');
      }
    },
    detach: function detach(context, settings, trigger) {
      if (trigger === 'unload') {
        var activeLinks = context.querySelectorAll('[data-drupal-link-system-path].is-active');
        var il = activeLinks.length;
        for (var i = 0; i < il; i++) {
          activeLinks[i].classList.remove('is-active');
        }
      }
    }
  };
})(Drupal, drupalSettings);;
/**
 * @file
 * openy_ckeditor.js
 *
 * CKEditor Javascript routines.
 */

(function ($) {
  "use strict";

  /**
   * Fill ckeditor table cell padding with value for cellpadding.
   */
  Drupal.behaviors.ckeditorTablePadding = {
    attach: function (context, settings) {
      $("table", context).each(function () {
        var padding = $(this).attr("cellpadding");
        if (padding !== 0) {
          $(this).find("td").css("padding", padding);
        }
      });
    }
  };

})(jQuery);
;
(function ($) {
  "use strict";
  Drupal.openy_tour = Drupal.openy_tour || {};

  $(document).ajaxSuccess(function() {
    var queryString = decodeURI(window.location.search);
    if (/tour=?/i.test(queryString) || window.location.hash == '#tour=1') {
      var processed = true;
      $('.joyride-tip-guide').each(function() {
        if ($(this).css('display') == 'block' && processed) {
          $(this).find('.joyride-next-tip').trigger('click');
          processed = false;
        }
      });
    }
  });

  Drupal.behaviors.openy_tour = {
    attach: function (context, settings) {
      $('body').on('tourStart', function () {
        window.location.hash = 'tour=1';
        Drupal.openy_tour.click_button();
      });
      $('body').on('tourStop', function () {
        window.location.hash = '';
      });
      Drupal.openy_tour.focus_on_button();
    }
  };

  Drupal.openy_tour.click_button = function () {
    $('.joyride-tip-guide').each(function() {
      // Hide original next button if custom is appear.
      if ($(this).find('.openy-click-button').length > 0) {
        $(this).find('.joyride-next-tip').hide();
      }
    });
    $('.openy-click-button').on('click', function (e) {
      e.preventDefault();
      var selector = $(this).data('tour-selector'),
          element = {};
      // Click on link if class/id is provided.
      if ($(selector).length > 0) {
        element = $(selector);
      }
      // Click on input if data selector is provided.
      if ($('[data-drupal-selector="' + selector + '"]').length > 0) {
        element = $('[data-drupal-selector="' + selector + '"]');
        element.parents('details').attr('open', true);
        element.trigger('mousedown');
      }
      else {
        element.parents('details').attr('open', true);
        element.trigger('click');
        $(this)
          .hide()
          .parent()
          .parent()
          .find('.joyride-next-tip')
          .trigger('click');
      }
    });
  };

  Drupal.openy_tour.focus_on_button = function () {
    $(document).click(function(e) {
      if ($('.joyride-next-tip').on('clicked')) {
        if (this.activeElement.classList.contains('joyride-next-tip')) {
          let parentEl = this.activeElement.parentElement.parentElement.classList;
          let activeTip = parentEl[parentEl.length - 1];
          let precessedEl = '';
          if (!$('#tour li.' +  activeTip).next().data('class')) {
            precessedEl = $('#tour li.' +  activeTip).next().data('id');
          }
          else {
            precessedEl = $('#tour li.' +  activeTip).next().data('class');
          }
          if ($('#' + precessedEl).length > 0) {
            $('#' + precessedEl ).attr('open', true);
            $('#' + precessedEl + ' summary').mousedown();
          }
        }
        $('.openy-click-button:visible').focus();
      }
    });
  };

})(jQuery);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal, drupalSettings, storage) {
  var currentUserID = parseInt(drupalSettings.user.uid, 10);

  var secondsIn30Days = 2592000;
  var thirtyDaysAgo = Math.round(new Date().getTime() / 1000) - secondsIn30Days;

  var embeddedLastReadTimestamps = false;
  if (drupalSettings.history && drupalSettings.history.lastReadTimestamps) {
    embeddedLastReadTimestamps = drupalSettings.history.lastReadTimestamps;
  }

  Drupal.history = {
    fetchTimestamps: function fetchTimestamps(nodeIDs, callback) {
      if (embeddedLastReadTimestamps) {
        callback();
        return;
      }

      $.ajax({
        url: Drupal.url('history/get_node_read_timestamps'),
        type: 'POST',
        data: { 'node_ids[]': nodeIDs },
        dataType: 'json',
        success: function success(results) {
          Object.keys(results || {}).forEach(function (nodeID) {
            storage.setItem('Drupal.history.' + currentUserID + '.' + nodeID, results[nodeID]);
          });
          callback();
        }
      });
    },
    getLastRead: function getLastRead(nodeID) {
      if (embeddedLastReadTimestamps && embeddedLastReadTimestamps[nodeID]) {
        return parseInt(embeddedLastReadTimestamps[nodeID], 10);
      }
      return parseInt(storage.getItem('Drupal.history.' + currentUserID + '.' + nodeID) || 0, 10);
    },
    markAsRead: function markAsRead(nodeID) {
      $.ajax({
        url: Drupal.url('history/' + nodeID + '/read'),
        type: 'POST',
        dataType: 'json',
        success: function success(timestamp) {
          if (embeddedLastReadTimestamps && embeddedLastReadTimestamps[nodeID]) {
            return;
          }

          storage.setItem('Drupal.history.' + currentUserID + '.' + nodeID, timestamp);
        }
      });
    },
    needsServerCheck: function needsServerCheck(nodeID, contentTimestamp) {
      if (contentTimestamp < thirtyDaysAgo) {
        return false;
      }

      if (embeddedLastReadTimestamps && embeddedLastReadTimestamps[nodeID]) {
        return contentTimestamp > parseInt(embeddedLastReadTimestamps[nodeID], 10);
      }

      var minLastReadTimestamp = parseInt(storage.getItem('Drupal.history.' + currentUserID + '.' + nodeID) || 0, 10);
      return contentTimestamp > minLastReadTimestamp;
    }
  };
})(jQuery, Drupal, drupalSettings, window.localStorage);;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function (window, Drupal, drupalSettings) {
  window.addEventListener('load', function () {
    if (drupalSettings.history && drupalSettings.history.nodesToMarkAsRead) {
      Object.keys(drupalSettings.history.nodesToMarkAsRead).forEach(Drupal.history.markAsRead);
    }
  });
})(window, Drupal, drupalSettings);;
/**
 * @file better_exposed_filters.js
 *
 * Provides some client-side functionality for the Better Exposed Filters module
 */
(function ($, Drupal, drupalSettings) {
  Drupal.behaviors.betterExposedFilters = {
    attach: function(context, settings) {
      // Add highlight class to checked checkboxes for better theming
      $('.bef-tree input[type=checkbox], .bef-checkboxes input[type=checkbox]')
        // Highlight newly selected checkboxes
        .change(function() {
          _bef_highlight(this, context);
        })
        .filter(':checked').closest('.form-item', context).addClass('highlight')
      ;
    }
  };

  /*
   * Helper functions
   */

  /**
   * Adds/Removes the highlight class from the form-item div as appropriate
   */
  function _bef_highlight(elem, context) {
    $elem = $(elem, context);
    $elem.attr('checked')
      ? $elem.closest('.form-item', context).addClass('highlight')
      : $elem.closest('.form-item', context).removeClass('highlight');
  }

}) (jQuery, Drupal, drupalSettings);
;
/**
* DO NOT EDIT THIS FILE.
* See the following change record for more information,
* https://www.drupal.org/node/2815083
* @preserve
**/

(function ($, Drupal) {
  Drupal.behaviors.dialog = {
    attach: function attach(context, settings) {
      var $context = $(context);

      if (!$('#drupal-modal').length) {
        $('<div id="drupal-modal" class="ui-front"/>').hide().appendTo('body');
      }

      var $dialog = $context.closest('.ui-dialog-content');
      if ($dialog.length) {
        if ($dialog.dialog('option', 'drupalAutoButtons')) {
          $dialog.trigger('dialogButtonsChange');
        }

        $dialog.dialog('widget').trigger('focus');
      }

      var originalClose = settings.dialog.close;

      settings.dialog.close = function (event) {
        for (var _len = arguments.length, args = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
          args[_key - 1] = arguments[_key];
        }

        originalClose.apply(settings.dialog, [event].concat(args));
        $(event.target).remove();
      };
    },
    prepareDialogButtons: function prepareDialogButtons($dialog) {
      var buttons = [];
      var $buttons = $dialog.find('.form-actions input[type=submit], .form-actions a.button');
      $buttons.each(function () {
        var $originalButton = $(this).css({ display: 'none' });
        buttons.push({
          text: $originalButton.html() || $originalButton.attr('value'),
          class: $originalButton.attr('class'),
          click: function click(e) {
            if ($originalButton.is('a')) {
              $originalButton[0].click();
            } else {
              $originalButton.trigger('mousedown').trigger('mouseup').trigger('click');
              e.preventDefault();
            }
          }
        });
      });
      return buttons;
    }
  };

  Drupal.AjaxCommands.prototype.openDialog = function (ajax, response, status) {
    if (!response.selector) {
      return false;
    }
    var $dialog = $(response.selector);
    if (!$dialog.length) {
      $dialog = $('<div id="' + response.selector.replace(/^#/, '') + '" class="ui-front"/>').appendTo('body');
    }

    if (!ajax.wrapper) {
      ajax.wrapper = $dialog.attr('id');
    }

    response.command = 'insert';
    response.method = 'html';
    ajax.commands.insert(ajax, response, status);

    if (!response.dialogOptions.buttons) {
      response.dialogOptions.drupalAutoButtons = true;
      response.dialogOptions.buttons = Drupal.behaviors.dialog.prepareDialogButtons($dialog);
    }

    $dialog.on('dialogButtonsChange', function () {
      var buttons = Drupal.behaviors.dialog.prepareDialogButtons($dialog);
      $dialog.dialog('option', 'buttons', buttons);
    });

    response.dialogOptions = response.dialogOptions || {};
    var dialog = Drupal.dialog($dialog.get(0), response.dialogOptions);
    if (response.dialogOptions.modal) {
      dialog.showModal();
    } else {
      dialog.show();
    }

    $dialog.parent().find('.ui-dialog-buttonset').addClass('form-actions');
  };

  Drupal.AjaxCommands.prototype.closeDialog = function (ajax, response, status) {
    var $dialog = $(response.selector);
    if ($dialog.length) {
      Drupal.dialog($dialog.get(0)).close();
      if (!response.persist) {
        $dialog.remove();
      }
    }

    $dialog.off('dialogButtonsChange');
  };

  Drupal.AjaxCommands.prototype.setDialogOption = function (ajax, response, status) {
    var $dialog = $(response.selector);
    if ($dialog.length) {
      $dialog.dialog('option', response.optionName, response.optionValue);
    }
  };

  $(window).on('dialog:aftercreate', function (e, dialog, $element, settings) {
    $element.on('click.dialog', '.dialog-cancel', function (e) {
      dialog.close('cancel');
      e.preventDefault();
      e.stopPropagation();
    });
  });

  $(window).on('dialog:beforeclose', function (e, dialog, $element) {
    $element.off('.dialog');
  });
})(jQuery, Drupal);;
/**
 * @file
 * Attaches behaviors for the Geysir module.
 */

(function($, Drupal, drupalSettings) {

  "use strict";

  Drupal.behaviors.geysir = {
    attach: function(context, settings) {
      var cut_links = $('.geysir-field-paragraph-links', context).find('.cut');
      cut_links.on('click', function (e) {
        e.preventDefault();

        var $this = $(e.target);

        // Find parent paragraph.
        var parent = $this.closest('[data-geysir-paragraph-id]');
        var parent_id = parent.data('geysir-paragraph-id');
        parent.addClass('geysir-cut-paste-disabled');

        // Find the geysir field wrapper.
        var field_wrapper_id = $this.data('geysir-field-paragraph-field-wrapper');
        var field_wrapper = $('[data-geysir-field-paragraph-field-wrapper="' + field_wrapper_id + '"]', context);
        // Add class to the geysir field wrapper to toggle cut behavior.
        field_wrapper.addClass('geysir-cut-paste');

        // Rewrite all paste links based on the paragraph which is currently cut.
        var paragraphs = $('[data-geysir-paragraph-id]', field_wrapper);
        paragraphs.each(function(index, paragraph) {
          paragraph = $(paragraph);
          var paragraph_id = paragraph.data('geysir-paragraph-id');
          var paste_link_wrappers = $('.paste-after, .paste-before', paragraph);
          var paste_links = paste_link_wrappers.find('a');
          paste_links.each(function(index, paste_link) {
            paste_link = $(paste_link);
            var href = paste_link.attr('href');

            $.each(Drupal.ajax.instances, function (index, event) {
              var element = $(event.element);
              if (element.hasClass('geysir-paste')) {
                if (href === event.element_settings.url) {
                  event.options.url = event.options.url.replace('/' + paragraph_id + '/', '/' + parent_id + '/');
                }
              }
            });
          });
        });

        return false;
      });
    }
  };

  /**
   * Triggered by AJAX action for page reload.
   */
  $.fn.reloadPageAjaxAction = function() {
    location.reload();
  };

})(jQuery, Drupal, drupalSettings);
;
/*! jQuery UI - v1.12.1 - 2017-03-31
* http://jqueryui.com
* Copyright jQuery Foundation and other contributors; Licensed  */
!function(a){"function"==typeof define&&define.amd?define(["jquery","../keycode","../position","../safe-active-element","../unique-id","../version","../widget"],a):a(jQuery)}(function(a){return a.widget("ui.menu",{version:"1.12.1",defaultElement:"<ul>",delay:300,options:{icons:{submenu:"ui-icon-caret-1-e"},items:"> *",menus:"ul",position:{my:"left top",at:"right top"},role:"menu",blur:null,focus:null,select:null},_create:function(){this.activeMenu=this.element,this.mouseHandled=!1,this.element.uniqueId().attr({role:this.options.role,tabIndex:0}),this._addClass("ui-menu","ui-widget ui-widget-content"),this._on({"mousedown .ui-menu-item":function(a){a.preventDefault()},"click .ui-menu-item":function(b){var c=a(b.target),d=a(a.ui.safeActiveElement(this.document[0]));!this.mouseHandled&&c.not(".ui-state-disabled").length&&(this.select(b),b.isPropagationStopped()||(this.mouseHandled=!0),c.has(".ui-menu").length?this.expand(b):!this.element.is(":focus")&&d.closest(".ui-menu").length&&(this.element.trigger("focus",[!0]),this.active&&1===this.active.parents(".ui-menu").length&&clearTimeout(this.timer)))},"mouseenter .ui-menu-item":function(b){if(!this.previousFilter){var c=a(b.target).closest(".ui-menu-item"),d=a(b.currentTarget);c[0]===d[0]&&(this._removeClass(d.siblings().children(".ui-state-active"),null,"ui-state-active"),this.focus(b,d))}},mouseleave:"collapseAll","mouseleave .ui-menu":"collapseAll",focus:function(a,b){var c=this.active||this.element.find(this.options.items).eq(0);b||this.focus(a,c)},blur:function(b){this._delay(function(){var c=!a.contains(this.element[0],a.ui.safeActiveElement(this.document[0]));c&&this.collapseAll(b)})},keydown:"_keydown"}),this.refresh(),this._on(this.document,{click:function(a){this._closeOnDocumentClick(a)&&this.collapseAll(a),this.mouseHandled=!1}})},_destroy:function(){var b=this.element.find(".ui-menu-item").removeAttr("role aria-disabled"),c=b.children(".ui-menu-item-wrapper").removeUniqueId().removeAttr("tabIndex role aria-haspopup");this.element.removeAttr("aria-activedescendant").find(".ui-menu").addBack().removeAttr("role aria-labelledby aria-expanded aria-hidden aria-disabled tabIndex").removeUniqueId().show(),c.children().each(function(){var b=a(this);b.data("ui-menu-submenu-caret")&&b.remove()})},_keydown:function(b){var c,d,e,f,g=!0;switch(b.keyCode){case a.ui.keyCode.PAGE_UP:this.previousPage(b);break;case a.ui.keyCode.PAGE_DOWN:this.nextPage(b);break;case a.ui.keyCode.HOME:this._move("first","first",b);break;case a.ui.keyCode.END:this._move("last","last",b);break;case a.ui.keyCode.UP:this.previous(b);break;case a.ui.keyCode.DOWN:this.next(b);break;case a.ui.keyCode.LEFT:this.collapse(b);break;case a.ui.keyCode.RIGHT:this.active&&!this.active.is(".ui-state-disabled")&&this.expand(b);break;case a.ui.keyCode.ENTER:case a.ui.keyCode.SPACE:this._activate(b);break;case a.ui.keyCode.ESCAPE:this.collapse(b);break;default:g=!1,d=this.previousFilter||"",f=!1,e=b.keyCode>=96&&b.keyCode<=105?(b.keyCode-96).toString():String.fromCharCode(b.keyCode),clearTimeout(this.filterTimer),e===d?f=!0:e=d+e,c=this._filterMenuItems(e),c=f&&c.index(this.active.next())!==-1?this.active.nextAll(".ui-menu-item"):c,c.length||(e=String.fromCharCode(b.keyCode),c=this._filterMenuItems(e)),c.length?(this.focus(b,c),this.previousFilter=e,this.filterTimer=this._delay(function(){delete this.previousFilter},1e3)):delete this.previousFilter}g&&b.preventDefault()},_activate:function(a){this.active&&!this.active.is(".ui-state-disabled")&&(this.active.children("[aria-haspopup='true']").length?this.expand(a):this.select(a))},refresh:function(){var b,c,d,e,f,g=this,h=this.options.icons.submenu,i=this.element.find(this.options.menus);this._toggleClass("ui-menu-icons",null,!!this.element.find(".ui-icon").length),d=i.filter(":not(.ui-menu)").hide().attr({role:this.options.role,"aria-hidden":"true","aria-expanded":"false"}).each(function(){var b=a(this),c=b.prev(),d=a("<span>").data("ui-menu-submenu-caret",!0);g._addClass(d,"ui-menu-icon","ui-icon "+h),c.attr("aria-haspopup","true").prepend(d),b.attr("aria-labelledby",c.attr("id"))}),this._addClass(d,"ui-menu","ui-widget ui-widget-content ui-front"),b=i.add(this.element),c=b.find(this.options.items),c.not(".ui-menu-item").each(function(){var b=a(this);g._isDivider(b)&&g._addClass(b,"ui-menu-divider","ui-widget-content")}),e=c.not(".ui-menu-item, .ui-menu-divider"),f=e.children().not(".ui-menu").uniqueId().attr({tabIndex:-1,role:this._itemRole()}),this._addClass(e,"ui-menu-item")._addClass(f,"ui-menu-item-wrapper"),c.filter(".ui-state-disabled").attr("aria-disabled","true"),this.active&&!a.contains(this.element[0],this.active[0])&&this.blur()},_itemRole:function(){return{menu:"menuitem",listbox:"option"}[this.options.role]},_setOption:function(a,b){if("icons"===a){var c=this.element.find(".ui-menu-icon");this._removeClass(c,null,this.options.icons.submenu)._addClass(c,null,b.submenu)}this._super(a,b)},_setOptionDisabled:function(a){this._super(a),this.element.attr("aria-disabled",String(a)),this._toggleClass(null,"ui-state-disabled",!!a)},focus:function(a,b){var c,d,e;this.blur(a,a&&"focus"===a.type),this._scrollIntoView(b),this.active=b.first(),d=this.active.children(".ui-menu-item-wrapper"),this._addClass(d,null,"ui-state-active"),this.options.role&&this.element.attr("aria-activedescendant",d.attr("id")),e=this.active.parent().closest(".ui-menu-item").children(".ui-menu-item-wrapper"),this._addClass(e,null,"ui-state-active"),a&&"keydown"===a.type?this._close():this.timer=this._delay(function(){this._close()},this.delay),c=b.children(".ui-menu"),c.length&&a&&/^mouse/.test(a.type)&&this._startOpening(c),this.activeMenu=b.parent(),this._trigger("focus",a,{item:b})},_scrollIntoView:function(b){var c,d,e,f,g,h;this._hasScroll()&&(c=parseFloat(a.css(this.activeMenu[0],"borderTopWidth"))||0,d=parseFloat(a.css(this.activeMenu[0],"paddingTop"))||0,e=b.offset().top-this.activeMenu.offset().top-c-d,f=this.activeMenu.scrollTop(),g=this.activeMenu.height(),h=b.outerHeight(),e<0?this.activeMenu.scrollTop(f+e):e+h>g&&this.activeMenu.scrollTop(f+e-g+h))},blur:function(a,b){b||clearTimeout(this.timer),this.active&&(this._removeClass(this.active.children(".ui-menu-item-wrapper"),null,"ui-state-active"),this._trigger("blur",a,{item:this.active}),this.active=null)},_startOpening:function(a){clearTimeout(this.timer),"true"===a.attr("aria-hidden")&&(this.timer=this._delay(function(){this._close(),this._open(a)},this.delay))},_open:function(b){var c=a.extend({of:this.active},this.options.position);clearTimeout(this.timer),this.element.find(".ui-menu").not(b.parents(".ui-menu")).hide().attr("aria-hidden","true"),b.show().removeAttr("aria-hidden").attr("aria-expanded","true").position(c)},collapseAll:function(b,c){clearTimeout(this.timer),this.timer=this._delay(function(){var d=c?this.element:a(b&&b.target).closest(this.element.find(".ui-menu"));d.length||(d=this.element),this._close(d),this.blur(b),this._removeClass(d.find(".ui-state-active"),null,"ui-state-active"),this.activeMenu=d},this.delay)},_close:function(a){a||(a=this.active?this.active.parent():this.element),a.find(".ui-menu").hide().attr("aria-hidden","true").attr("aria-expanded","false")},_closeOnDocumentClick:function(b){return!a(b.target).closest(".ui-menu").length},_isDivider:function(a){return!/[^\-\u2014\u2013\s]/.test(a.text())},collapse:function(a){var b=this.active&&this.active.parent().closest(".ui-menu-item",this.element);b&&b.length&&(this._close(),this.focus(a,b))},expand:function(a){var b=this.active&&this.active.children(".ui-menu ").find(this.options.items).first();b&&b.length&&(this._open(b.parent()),this._delay(function(){this.focus(a,b)}))},next:function(a){this._move("next","first",a)},previous:function(a){this._move("prev","last",a)},isFirstItem:function(){return this.active&&!this.active.prevAll(".ui-menu-item").length},isLastItem:function(){return this.active&&!this.active.nextAll(".ui-menu-item").length},_move:function(a,b,c){var d;this.active&&(d="first"===a||"last"===a?this.active["first"===a?"prevAll":"nextAll"](".ui-menu-item").eq(-1):this.active[a+"All"](".ui-menu-item").eq(0)),d&&d.length&&this.active||(d=this.activeMenu.find(this.options.items)[b]()),this.focus(c,d)},nextPage:function(b){var c,d,e;return this.active?void(this.isLastItem()||(this._hasScroll()?(d=this.active.offset().top,e=this.element.height(),this.active.nextAll(".ui-menu-item").each(function(){return c=a(this),c.offset().top-d-e<0}),this.focus(b,c)):this.focus(b,this.activeMenu.find(this.options.items)[this.active?"last":"first"]()))):void this.next(b)},previousPage:function(b){var c,d,e;return this.active?void(this.isFirstItem()||(this._hasScroll()?(d=this.active.offset().top,e=this.element.height(),this.active.prevAll(".ui-menu-item").each(function(){return c=a(this),c.offset().top-d+e>0}),this.focus(b,c)):this.focus(b,this.activeMenu.find(this.options.items).first()))):void this.next(b)},_hasScroll:function(){return this.element.outerHeight()<this.element.prop("scrollHeight")},select:function(b){this.active=this.active||a(b.target).closest(".ui-menu-item");var c={item:this.active};this.active.has(".ui-menu").length||this.collapseAll(b,!0),this._trigger("select",b,c)},_filterMenuItems:function(b){var c=b.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&"),d=new RegExp("^"+c,"i");return this.activeMenu.find(this.options.items).filter(".ui-menu-item").filter(function(){return d.test(a.trim(a(this).children(".ui-menu-item-wrapper").text()))})}})});;
/*! jQuery UI - v1.12.1 - 2017-03-31
* http://jqueryui.com
* Copyright jQuery Foundation and other contributors; Licensed  */
!function(a){"function"==typeof define&&define.amd?define(["jquery","./menu","../keycode","../position","../safe-active-element","../version","../widget"],a):a(jQuery)}(function(a){return a.widget("ui.autocomplete",{version:"1.12.1",defaultElement:"<input>",options:{appendTo:null,autoFocus:!1,delay:300,minLength:1,position:{my:"left top",at:"left bottom",collision:"none"},source:null,change:null,close:null,focus:null,open:null,response:null,search:null,select:null},requestIndex:0,pending:0,_create:function(){var b,c,d,e=this.element[0].nodeName.toLowerCase(),f="textarea"===e,g="input"===e;this.isMultiLine=f||!g&&this._isContentEditable(this.element),this.valueMethod=this.element[f||g?"val":"text"],this.isNewMenu=!0,this._addClass("ui-autocomplete-input"),this.element.attr("autocomplete","off"),this._on(this.element,{keydown:function(e){if(this.element.prop("readOnly"))return b=!0,d=!0,void(c=!0);b=!1,d=!1,c=!1;var f=a.ui.keyCode;switch(e.keyCode){case f.PAGE_UP:b=!0,this._move("previousPage",e);break;case f.PAGE_DOWN:b=!0,this._move("nextPage",e);break;case f.UP:b=!0,this._keyEvent("previous",e);break;case f.DOWN:b=!0,this._keyEvent("next",e);break;case f.ENTER:this.menu.active&&(b=!0,e.preventDefault(),this.menu.select(e));break;case f.TAB:this.menu.active&&this.menu.select(e);break;case f.ESCAPE:this.menu.element.is(":visible")&&(this.isMultiLine||this._value(this.term),this.close(e),e.preventDefault());break;default:c=!0,this._searchTimeout(e)}},keypress:function(d){if(b)return b=!1,void(this.isMultiLine&&!this.menu.element.is(":visible")||d.preventDefault());if(!c){var e=a.ui.keyCode;switch(d.keyCode){case e.PAGE_UP:this._move("previousPage",d);break;case e.PAGE_DOWN:this._move("nextPage",d);break;case e.UP:this._keyEvent("previous",d);break;case e.DOWN:this._keyEvent("next",d)}}},input:function(a){return d?(d=!1,void a.preventDefault()):void this._searchTimeout(a)},focus:function(){this.selectedItem=null,this.previous=this._value()},blur:function(a){return this.cancelBlur?void delete this.cancelBlur:(clearTimeout(this.searching),this.close(a),void this._change(a))}}),this._initSource(),this.menu=a("<ul>").appendTo(this._appendTo()).menu({role:null}).hide().menu("instance"),this._addClass(this.menu.element,"ui-autocomplete","ui-front"),this._on(this.menu.element,{mousedown:function(b){b.preventDefault(),this.cancelBlur=!0,this._delay(function(){delete this.cancelBlur,this.element[0]!==a.ui.safeActiveElement(this.document[0])&&this.element.trigger("focus")})},menufocus:function(b,c){var d,e;return this.isNewMenu&&(this.isNewMenu=!1,b.originalEvent&&/^mouse/.test(b.originalEvent.type))?(this.menu.blur(),void this.document.one("mousemove",function(){a(b.target).trigger(b.originalEvent)})):(e=c.item.data("ui-autocomplete-item"),!1!==this._trigger("focus",b,{item:e})&&b.originalEvent&&/^key/.test(b.originalEvent.type)&&this._value(e.value),d=c.item.attr("aria-label")||e.value,void(d&&a.trim(d).length&&(this.liveRegion.children().hide(),a("<div>").text(d).appendTo(this.liveRegion))))},menuselect:function(b,c){var d=c.item.data("ui-autocomplete-item"),e=this.previous;this.element[0]!==a.ui.safeActiveElement(this.document[0])&&(this.element.trigger("focus"),this.previous=e,this._delay(function(){this.previous=e,this.selectedItem=d})),!1!==this._trigger("select",b,{item:d})&&this._value(d.value),this.term=this._value(),this.close(b),this.selectedItem=d}}),this.liveRegion=a("<div>",{role:"status","aria-live":"assertive","aria-relevant":"additions"}).appendTo(this.document[0].body),this._addClass(this.liveRegion,null,"ui-helper-hidden-accessible"),this._on(this.window,{beforeunload:function(){this.element.removeAttr("autocomplete")}})},_destroy:function(){clearTimeout(this.searching),this.element.removeAttr("autocomplete"),this.menu.element.remove(),this.liveRegion.remove()},_setOption:function(a,b){this._super(a,b),"source"===a&&this._initSource(),"appendTo"===a&&this.menu.element.appendTo(this._appendTo()),"disabled"===a&&b&&this.xhr&&this.xhr.abort()},_isEventTargetInWidget:function(b){var c=this.menu.element[0];return b.target===this.element[0]||b.target===c||a.contains(c,b.target)},_closeOnClickOutside:function(a){this._isEventTargetInWidget(a)||this.close()},_appendTo:function(){var b=this.options.appendTo;return b&&(b=b.jquery||b.nodeType?a(b):this.document.find(b).eq(0)),b&&b[0]||(b=this.element.closest(".ui-front, dialog")),b.length||(b=this.document[0].body),b},_initSource:function(){var b,c,d=this;a.isArray(this.options.source)?(b=this.options.source,this.source=function(c,d){d(a.ui.autocomplete.filter(b,c.term))}):"string"==typeof this.options.source?(c=this.options.source,this.source=function(b,e){d.xhr&&d.xhr.abort(),d.xhr=a.ajax({url:c,data:b,dataType:"json",success:function(a){e(a)},error:function(){e([])}})}):this.source=this.options.source},_searchTimeout:function(a){clearTimeout(this.searching),this.searching=this._delay(function(){var b=this.term===this._value(),c=this.menu.element.is(":visible"),d=a.altKey||a.ctrlKey||a.metaKey||a.shiftKey;b&&(!b||c||d)||(this.selectedItem=null,this.search(null,a))},this.options.delay)},search:function(a,b){return a=null!=a?a:this._value(),this.term=this._value(),a.length<this.options.minLength?this.close(b):this._trigger("search",b)!==!1?this._search(a):void 0},_search:function(a){this.pending++,this._addClass("ui-autocomplete-loading"),this.cancelSearch=!1,this.source({term:a},this._response())},_response:function(){var b=++this.requestIndex;return a.proxy(function(a){b===this.requestIndex&&this.__response(a),this.pending--,this.pending||this._removeClass("ui-autocomplete-loading")},this)},__response:function(a){a&&(a=this._normalize(a)),this._trigger("response",null,{content:a}),!this.options.disabled&&a&&a.length&&!this.cancelSearch?(this._suggest(a),this._trigger("open")):this._close()},close:function(a){this.cancelSearch=!0,this._close(a)},_close:function(a){this._off(this.document,"mousedown"),this.menu.element.is(":visible")&&(this.menu.element.hide(),this.menu.blur(),this.isNewMenu=!0,this._trigger("close",a))},_change:function(a){this.previous!==this._value()&&this._trigger("change",a,{item:this.selectedItem})},_normalize:function(b){return b.length&&b[0].label&&b[0].value?b:a.map(b,function(b){return"string"==typeof b?{label:b,value:b}:a.extend({},b,{label:b.label||b.value,value:b.value||b.label})})},_suggest:function(b){var c=this.menu.element.empty();this._renderMenu(c,b),this.isNewMenu=!0,this.menu.refresh(),c.show(),this._resizeMenu(),c.position(a.extend({of:this.element},this.options.position)),this.options.autoFocus&&this.menu.next(),this._on(this.document,{mousedown:"_closeOnClickOutside"})},_resizeMenu:function(){var a=this.menu.element;a.outerWidth(Math.max(a.width("").outerWidth()+1,this.element.outerWidth()))},_renderMenu:function(b,c){var d=this;a.each(c,function(a,c){d._renderItemData(b,c)})},_renderItemData:function(a,b){return this._renderItem(a,b).data("ui-autocomplete-item",b)},_renderItem:function(b,c){return a("<li>").append(a("<div>").text(c.label)).appendTo(b)},_move:function(a,b){return this.menu.element.is(":visible")?this.menu.isFirstItem()&&/^previous/.test(a)||this.menu.isLastItem()&&/^next/.test(a)?(this.isMultiLine||this._value(this.term),void this.menu.blur()):void this.menu[a](b):void this.search(null,b)},widget:function(){return this.menu.element},_value:function(){return this.valueMethod.apply(this.element,arguments)},_keyEvent:function(a,b){this.isMultiLine&&!this.menu.element.is(":visible")||(this._move(a,b),b.preventDefault())},_isContentEditable:function(a){if(!a.length)return!1;var b=a.prop("contentEditable");return"inherit"===b?this._isContentEditable(a.parent()):"true"===b}}),a.extend(a.ui.autocomplete,{escapeRegex:function(a){return a.replace(/[\-\[\]{}()*+?.,\\\^$|#\s]/g,"\\$&")},filter:function(b,c){var d=new RegExp(a.ui.autocomplete.escapeRegex(c),"i");return a.grep(b,function(a){return d.test(a.label||a.value||a)})}}),a.widget("ui.autocomplete",a.ui.autocomplete,{options:{messages:{noResults:"No search results.",results:function(a){return a+(a>1?" results are":" result is")+" available, use up and down arrow keys to navigate."}}},__response:function(b){var c;this._superApply(arguments),this.options.disabled||this.cancelSearch||(c=b&&b.length?this.options.messages.results(b.length):this.options.messages.noResults,this.liveRegion.children().hide(),a("<div>").text(c).appendTo(this.liveRegion))}}),a.ui.autocomplete});;
!function(t){var e={};function n(r){if(e[r])return e[r].exports;var i=e[r]={i:r,l:!1,exports:{}};return t[r].call(i.exports,i,i.exports,n),i.l=!0,i.exports}n.m=t,n.c=e,n.d=function(t,e,r){n.o(t,e)||Object.defineProperty(t,e,{enumerable:!0,get:r})},n.r=function(t){"undefined"!=typeof Symbol&&Symbol.toStringTag&&Object.defineProperty(t,Symbol.toStringTag,{value:"Module"}),Object.defineProperty(t,"__esModule",{value:!0})},n.t=function(t,e){if(1&e&&(t=n(t)),8&e)return t;if(4&e&&"object"==typeof t&&t&&t.__esModule)return t;var r=Object.create(null);if(n.r(r),Object.defineProperty(r,"default",{enumerable:!0,value:t}),2&e&&"string"!=typeof t)for(var i in t)n.d(r,i,function(e){return t[e]}.bind(null,i));return r},n.n=function(t){var e=t&&t.__esModule?function(){return t.default}:function(){return t};return n.d(e,"a",e),e},n.o=function(t,e){return Object.prototype.hasOwnProperty.call(t,e)},n.p="",n(n.s=158)}([function(t,e,n){var r=n(8),i=n(27),o=n(9),a=n(29),s=n(73),c=function(t,e,n){var l,u,h,f,p=t&c.F,_=t&c.G,d=t&c.S,g=t&c.P,m=t&c.B,v=_?r:d?r[e]||(r[e]={}):(r[e]||{}).prototype,y=_?i:i[e]||(i[e]={}),x=y.prototype||(y.prototype={});for(l in _&&(n=e),n)h=((u=!p&&v&&void 0!==v[l])?v:n)[l],f=m&&u?s(h,r):g&&"function"==typeof h?s(Function.call,h):h,v&&a(v,l,h,t&c.U),y[l]!=h&&o(y,l,f),g&&x[l]!=h&&(x[l]=h)};r.core=i,c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,e,n){var r=n(51)("wks"),i=n(50),o=n(8).Symbol,a="function"==typeof o;(t.exports=function(t){return r[t]||(r[t]=a&&o[t]||(a?o:i)("Symbol."+t))}).store=r},function(t,e,n){var r=n(46)("wks"),i=n(26),o=n(4).Symbol,a="function"==typeof o;(t.exports=function(t){return r[t]||(r[t]=a&&o[t]||(a?o:i)("Symbol."+t))}).store=r},function(t,e,n){var r=n(18);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e){var n=t.exports={version:"2.6.11"};"number"==typeof __e&&(__e=n)},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e){var n=t.exports="undefined"!=typeof window&&window.Math==Math?window:"undefined"!=typeof self&&self.Math==Math?self:Function("return this")();"number"==typeof __g&&(__g=n)},function(t,e,n){var r=n(28),i=n(71);t.exports=n(14)?function(t,e,n){return r.f(t,e,i(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e,n){var r=n(11),i=n(24);t.exports=n(12)?function(t,e,n){return r.f(t,e,i(1,n))}:function(t,e,n){return t[e]=n,t}},function(t,e,n){var r=n(15),i=n(61),o=n(39),a=Object.defineProperty;e.f=n(12)?Object.defineProperty:function(t,e,n){if(r(t),e=o(e,!0),r(n),i)try{return a(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e,n){t.exports=!n(23)((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(t,e,n){var r=n(93),i=n(42);t.exports=function(t){return r(i(t))}},function(t,e,n){t.exports=!n(6)((function(){return 7!=Object.defineProperty({},"a",{get:function(){return 7}}).a}))},function(t,e,n){var r=n(16);t.exports=function(t){if(!r(t))throw TypeError(t+" is not an object!");return t}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e){t.exports={}},function(t,e){t.exports=function(t){return"object"==typeof t?null!==t:"function"==typeof t}},function(t,e){t.exports=function(t){if(null==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e,n){var r=n(34),i=Math.min;t.exports=function(t){return t>0?i(r(t),9007199254740991):0}},function(t,e,n){var r=n(19);t.exports=function(t){return Object(r(t))}},function(t,e,n){t.exports=n(131)},function(t,e){t.exports=function(t){try{return!!t()}catch(t){return!0}}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){t.exports=!0},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e){var n=t.exports={version:"2.6.11"};"number"==typeof __e&&(__e=n)},function(t,e,n){var r=n(3),i=n(107),o=n(108),a=Object.defineProperty;e.f=n(14)?Object.defineProperty:function(t,e,n){if(r(t),e=o(e,!0),r(n),i)try{return a(t,e,n)}catch(t){}if("get"in n||"set"in n)throw TypeError("Accessors not supported!");return"value"in n&&(t[e]=n.value),t}},function(t,e,n){var r=n(8),i=n(9),o=n(30),a=n(50)("src"),s=n(109),c=(""+s).split("toString");n(27).inspectSource=function(t){return s.call(t)},(t.exports=function(t,e,n,s){var l="function"==typeof n;l&&(o(n,"name")||i(n,"name",e)),t[e]!==n&&(l&&(o(n,a)||i(n,a,t[e]?""+t[e]:c.join(String(e)))),t===r?t[e]=n:s?t[e]?t[e]=n:i(t,e,n):(delete t[e],i(t,e,n)))})(Function.prototype,"toString",(function(){return"function"==typeof this&&this[a]||s.call(this)}))},function(t,e){var n={}.hasOwnProperty;t.exports=function(t,e){return n.call(t,e)}},function(t,e,n){var r=n(111),i=n(76);t.exports=Object.keys||function(t){return r(t,i)}},function(t,e,n){var r=n(74),i=n(19);t.exports=function(t){return r(i(t))}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e,n){"use strict";var r=n(6);t.exports=function(t,e){return!!t&&r((function(){e?t.call(null,(function(){}),1):t.call(null)}))}},function(t,e,n){"use strict";var r=n(121),i=RegExp.prototype.exec;t.exports=function(t,e){var n=t.exec;if("function"==typeof n){var o=n.call(t,e);if("object"!=typeof o)throw new TypeError("RegExp exec method returned something other than an Object or null");return o}if("RegExp"!==r(t))throw new TypeError("RegExp#exec called on incompatible receiver");return i.call(t,e)}},function(t,e,n){"use strict";n(122);var r=n(29),i=n(9),o=n(6),a=n(19),s=n(1),c=n(54),l=s("species"),u=!o((function(){var t=/./;return t.exec=function(){var t=[];return t.groups={a:"7"},t},"7"!=="".replace(t,"$<a>")})),h=function(){var t=/(?:)/,e=t.exec;t.exec=function(){return e.apply(this,arguments)};var n="ab".split(t);return 2===n.length&&"a"===n[0]&&"b"===n[1]}();t.exports=function(t,e,n){var f=s(t),p=!o((function(){var e={};return e[f]=function(){return 7},7!=""[t](e)})),_=p?!o((function(){var e=!1,n=/a/;return n.exec=function(){return e=!0,null},"split"===t&&(n.constructor={},n.constructor[l]=function(){return n}),n[f](""),!e})):void 0;if(!p||!_||"replace"===t&&!u||"split"===t&&!h){var d=/./[f],g=n(a,f,""[t],(function(t,e,n,r,i){return e.exec===c?p&&!i?{done:!0,value:d.call(e,n,r)}:{done:!0,value:t.call(n,e,r)}:{done:!1}})),m=g[0],v=g[1];r(String.prototype,t,m),i(RegExp.prototype,f,2==e?function(t,e){return v.call(t,this,e)}:function(t){return v.call(t,this)})}}},function(t,e,n){var r=n(4),i=n(5),o=n(87),a=n(10),s=n(7),c=function(t,e,n){var l,u,h,f=t&c.F,p=t&c.G,_=t&c.S,d=t&c.P,g=t&c.B,m=t&c.W,v=p?i:i[e]||(i[e]={}),y=v.prototype,x=p?r:_?r[e]:(r[e]||{}).prototype;for(l in p&&(n=e),n)(u=!f&&x&&void 0!==x[l])&&s(v,l)||(h=u?x[l]:n[l],v[l]=p&&"function"!=typeof x[l]?n[l]:g&&u?o(h,r):m&&x[l]==h?function(t){var e=function(e,n,r){if(this instanceof t){switch(arguments.length){case 0:return new t;case 1:return new t(e);case 2:return new t(e,n)}return new t(e,n,r)}return t.apply(this,arguments)};return e.prototype=t.prototype,e}(h):d&&"function"==typeof h?o(Function.call,h):h,d&&((v.virtual||(v.virtual={}))[l]=h,t&c.R&&y&&!y[l]&&a(y,l,h)))};c.F=1,c.G=2,c.S=4,c.P=8,c.B=16,c.W=32,c.U=64,c.R=128,t.exports=c},function(t,e,n){var r=n(16);t.exports=function(t,e){if(!r(t))return t;var n,i;if(e&&"function"==typeof(n=t.toString)&&!r(i=n.call(t)))return i;if("function"==typeof(n=t.valueOf)&&!r(i=n.call(t)))return i;if(!e&&"function"==typeof(n=t.toString)&&!r(i=n.call(t)))return i;throw TypeError("Can't convert object to primitive value")}},function(t,e){var n={}.toString;t.exports=function(t){return n.call(t).slice(8,-1)}},function(t,e,n){n(90);for(var r=n(4),i=n(10),o=n(17),a=n(2)("toStringTag"),s="CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,TextTrackList,TouchList".split(","),c=0;c<s.length;c++){var l=s[c],u=r[l],h=u&&u.prototype;h&&!h[a]&&i(h,a,l),o[l]=o.Array}},function(t,e){t.exports=function(t){if(null==t)throw TypeError("Can't call method on  "+t);return t}},function(t,e,n){var r=n(67),i=n(47);t.exports=Object.keys||function(t){return r(t,i)}},function(t,e){var n=Math.ceil,r=Math.floor;t.exports=function(t){return isNaN(t=+t)?0:(t>0?r:n)(t)}},function(t,e,n){var r=n(46)("keys"),i=n(26);t.exports=function(t){return r[t]||(r[t]=i(t))}},function(t,e,n){var r=n(5),i=n(4),o=i["__core-js_shared__"]||(i["__core-js_shared__"]={});(t.exports=function(t,e){return o[t]||(o[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(25)?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e,n){var r=n(11).f,i=n(7),o=n(2)("toStringTag");t.exports=function(t,e,n){t&&!i(t=n?t:t.prototype,o)&&r(t,o,{configurable:!0,value:e})}},function(t,e,n){"use strict";var r=n(101)(!0);n(64)(String,"String",(function(t){this._t=String(t),this._i=0}),(function(){var t,e=this._t,n=this._i;return n>=e.length?{value:void 0,done:!0}:(t=r(e,n),this._i+=t.length,{value:t,done:!1})}))},function(t,e){var n=0,r=Math.random();t.exports=function(t){return"Symbol(".concat(void 0===t?"":t,")_",(++n+r).toString(36))}},function(t,e,n){var r=n(27),i=n(8),o=i["__core-js_shared__"]||(i["__core-js_shared__"]={});(t.exports=function(t,e){return o[t]||(o[t]=void 0!==e?e:{})})("versions",[]).push({version:r.version,mode:n(72)?"pure":"global",copyright:"© 2019 Denis Pushkarev (zloirock.ru)"})},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,n){var r=n(51)("keys"),i=n(50);t.exports=function(t){return r[t]||(r[t]=i(t))}},function(t,e,n){"use strict";var r,i,o=n(123),a=RegExp.prototype.exec,s=String.prototype.replace,c=a,l=(r=/a/,i=/b*/g,a.call(r,"a"),a.call(i,"a"),0!==r.lastIndex||0!==i.lastIndex),u=void 0!==/()??/.exec("")[1];(l||u)&&(c=function(t){var e,n,r,i,c=this;return u&&(n=new RegExp("^"+c.source+"$(?!\\s)",o.call(c))),l&&(e=c.lastIndex),r=a.call(c,t),l&&r&&(c.lastIndex=c.global?r.index+r[0].length:e),u&&r&&r.length>1&&s.call(r[0],n,(function(){for(i=1;i<arguments.length-2;i++)void 0===arguments[i]&&(r[i]=void 0)})),r}),t.exports=c},function(t,e,n){"use strict";var r=n(127)(!0);t.exports=function(t,e,n){return e+(n?r(t,e).length:1)}},function(t,e,n){e.f=n(2)},function(t,e,n){var r=n(4),i=n(5),o=n(25),a=n(56),s=n(11).f;t.exports=function(t){var e=i.Symbol||(i.Symbol=o?{}:r.Symbol||{});"_"==t.charAt(0)||t in e||s(e,t,{value:a.f(t)})}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e){t.exports={}},function(t,e,n){var r=n(73),i=n(74),o=n(21),a=n(20),s=n(151);t.exports=function(t,e){var n=1==t,c=2==t,l=3==t,u=4==t,h=6==t,f=5==t||h,p=e||s;return function(e,s,_){for(var d,g,m=o(e),v=i(m),y=r(s,_,3),x=a(v.length),b=0,w=n?p(e,x):c?p(e,0):void 0;x>b;b++)if((f||b in v)&&(g=y(d=v[b],b,m),t))if(n)w[b]=g;else if(g)switch(t){case 3:return!0;case 5:return d;case 6:return b;case 2:w.push(d)}else if(u)return!1;return h?-1:l||u?u:w}}},function(t,e,n){t.exports=!n(12)&&!n(23)((function(){return 7!=Object.defineProperty(n(62)("div"),"a",{get:function(){return 7}}).a}))},function(t,e,n){var r=n(16),i=n(4).document,o=r(i)&&r(i.createElement);t.exports=function(t){return o?i.createElement(t):{}}},function(t,e,n){var r=n(40);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,e,n){"use strict";var r=n(25),i=n(38),o=n(65),a=n(10),s=n(17),c=n(94),l=n(48),u=n(100),h=n(2)("iterator"),f=!([].keys&&"next"in[].keys()),p=function(){return this};t.exports=function(t,e,n,_,d,g,m){c(n,e,_);var v,y,x,b=function(t){if(!f&&t in L)return L[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},w=e+" Iterator",k="values"==d,S=!1,L=t.prototype,O=L[h]||L["@@iterator"]||d&&L[d],M=O||b(d),E=d?k?b("entries"):M:void 0,P="Array"==e&&L.entries||O;if(P&&(x=u(P.call(new t)))!==Object.prototype&&x.next&&(l(x,w,!0),r||"function"==typeof x[h]||a(x,h,p)),k&&O&&"values"!==O.name&&(S=!0,M=function(){return O.call(this)}),r&&!m||!f&&!S&&L[h]||a(L,h,M),s[e]=M,s[w]=p,d)if(v={values:k?M:b("values"),keys:g?M:b("keys"),entries:E},m)for(y in v)y in L||o(L,y,v[y]);else i(i.P+i.F*(f||S),e,v);return v}},function(t,e,n){t.exports=n(10)},function(t,e,n){var r=n(15),i=n(95),o=n(47),a=n(45)("IE_PROTO"),s=function(){},c=function(){var t,e=n(62)("iframe"),r=o.length;for(e.style.display="none",n(99).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),c=t.F;r--;)delete c.prototype[o[r]];return c()};t.exports=Object.create||function(t,e){var n;return null!==t?(s.prototype=r(t),n=new s,s.prototype=null,n[a]=t):n=c(),void 0===e?n:i(n,e)}},function(t,e,n){var r=n(7),i=n(13),o=n(96)(!1),a=n(45)("IE_PROTO");t.exports=function(t,e){var n,s=i(t),c=0,l=[];for(n in s)n!=a&&r(s,n)&&l.push(n);for(;e.length>c;)r(s,n=e[c++])&&(~o(l,n)||l.push(n));return l}},function(t,e,n){var r=n(42);t.exports=function(t){return Object(r(t))}},function(t,e,n){var r=n(40),i=n(2)("toStringTag"),o="Arguments"==r(function(){return arguments}());t.exports=function(t){var e,n,a;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),i))?n:o?r(e):"Object"==(a=r(e))&&"function"==typeof e.callee?"Arguments":a}},function(t,e,n){var r=n(18),i=n(8).document,o=r(i)&&r(i.createElement);t.exports=function(t){return o?i.createElement(t):{}}},function(t,e){t.exports=function(t,e){return{enumerable:!(1&t),configurable:!(2&t),writable:!(4&t),value:e}}},function(t,e){t.exports=!1},function(t,e,n){var r=n(52);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,i){return t.call(e,n,r,i)}}return function(){return t.apply(e,arguments)}}},function(t,e,n){var r=n(33);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e,n){var r=n(32),i=n(20),o=n(112);t.exports=function(t){return function(e,n,a){var s,c=r(e),l=i(c.length),u=o(a,l);if(t&&n!=n){for(;l>u;)if((s=c[u++])!=s)return!0}else for(;l>u;u++)if((t||u in c)&&c[u]===n)return t||u||0;return!t&&-1}}},function(t,e){t.exports="constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf".split(",")},function(t,e){e.f=Object.getOwnPropertySymbols},function(t,e,n){var r=n(67),i=n(47).concat("length","prototype");e.f=Object.getOwnPropertyNames||function(t){return r(t,i)}},function(t,e,n){var r=n(1)("unscopables"),i=Array.prototype;null==i[r]&&n(9)(i,r,{}),t.exports=function(t){i[r][t]=!0}},function(t,e,n){var r=n(28).f,i=n(30),o=n(1)("toStringTag");t.exports=function(t,e,n){t&&!i(t=n?t:t.prototype,o)&&r(t,o,{configurable:!0,value:e})}},function(t,e,n){t.exports=n(85)},function(t,e,n){t.exports=n(89)},function(t,e,n){t.exports=n(104)},function(t,e,n){t.exports=n(130)},function(t,e,n){n(86),t.exports=n(5).Array.isArray},function(t,e,n){var r=n(38);r(r.S,"Array",{isArray:n(63)})},function(t,e,n){var r=n(88);t.exports=function(t,e,n){if(r(t),void 0===e)return t;switch(n){case 1:return function(n){return t.call(e,n)};case 2:return function(n,r){return t.call(e,n,r)};case 3:return function(n,r,i){return t.call(e,n,r,i)}}return function(){return t.apply(e,arguments)}}},function(t,e){t.exports=function(t){if("function"!=typeof t)throw TypeError(t+" is not a function!");return t}},function(t,e,n){n(41),n(49),t.exports=n(102)},function(t,e,n){"use strict";var r=n(91),i=n(92),o=n(17),a=n(13);t.exports=n(64)(Array,"Array",(function(t,e){this._t=a(t),this._i=0,this._k=e}),(function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,i(1)):i(0,"keys"==e?n:"values"==e?t[n]:[n,t[n]])}),"values"),o.Arguments=o.Array,r("keys"),r("values"),r("entries")},function(t,e){t.exports=function(){}},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){var r=n(40);t.exports=Object("z").propertyIsEnumerable(0)?Object:function(t){return"String"==r(t)?t.split(""):Object(t)}},function(t,e,n){"use strict";var r=n(66),i=n(24),o=n(48),a={};n(10)(a,n(2)("iterator"),(function(){return this})),t.exports=function(t,e,n){t.prototype=r(a,{next:i(1,n)}),o(t,e+" Iterator")}},function(t,e,n){var r=n(11),i=n(15),o=n(43);t.exports=n(12)?Object.defineProperties:function(t,e){i(t);for(var n,a=o(e),s=a.length,c=0;s>c;)r.f(t,n=a[c++],e[n]);return t}},function(t,e,n){var r=n(13),i=n(97),o=n(98);t.exports=function(t){return function(e,n,a){var s,c=r(e),l=i(c.length),u=o(a,l);if(t&&n!=n){for(;l>u;)if((s=c[u++])!=s)return!0}else for(;l>u;u++)if((t||u in c)&&c[u]===n)return t||u||0;return!t&&-1}}},function(t,e,n){var r=n(44),i=Math.min;t.exports=function(t){return t>0?i(r(t),9007199254740991):0}},function(t,e,n){var r=n(44),i=Math.max,o=Math.min;t.exports=function(t,e){return(t=r(t))<0?i(t+e,0):o(t,e)}},function(t,e,n){var r=n(4).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(7),i=n(68),o=n(45)("IE_PROTO"),a=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=i(t),r(t,o)?t[o]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?a:null}},function(t,e,n){var r=n(44),i=n(42);t.exports=function(t){return function(e,n){var o,a,s=String(i(e)),c=r(n),l=s.length;return c<0||c>=l?t?"":void 0:(o=s.charCodeAt(c))<55296||o>56319||c+1===l||(a=s.charCodeAt(c+1))<56320||a>57343?t?s.charAt(c):o:t?s.slice(c,c+2):a-56320+(o-55296<<10)+65536}}},function(t,e,n){var r=n(15),i=n(103);t.exports=n(5).getIterator=function(t){var e=i(t);if("function"!=typeof e)throw TypeError(t+" is not iterable!");return r(e.call(t))}},function(t,e,n){var r=n(69),i=n(2)("iterator"),o=n(17);t.exports=n(5).getIteratorMethod=function(t){if(null!=t)return t[i]||t["@@iterator"]||o[r(t)]}},function(t,e,n){n(41),n(49),t.exports=n(105)},function(t,e,n){var r=n(69),i=n(2)("iterator"),o=n(17);t.exports=n(5).isIterable=function(t){var e=Object(t);return void 0!==e[i]||"@@iterator"in e||o.hasOwnProperty(r(e))}},function(t,e,n){var r=n(0),i=n(110)(!0);r(r.S,"Object",{entries:function(t){return i(t)}})},function(t,e,n){t.exports=!n(14)&&!n(6)((function(){return 7!=Object.defineProperty(n(70)("div"),"a",{get:function(){return 7}}).a}))},function(t,e,n){var r=n(18);t.exports=function(t,e){if(!r(t))return t;var n,i;if(e&&"function"==typeof(n=t.toString)&&!r(i=n.call(t)))return i;if("function"==typeof(n=t.valueOf)&&!r(i=n.call(t)))return i;if(!e&&"function"==typeof(n=t.toString)&&!r(i=n.call(t)))return i;throw TypeError("Can't convert object to primitive value")}},function(t,e,n){t.exports=n(51)("native-function-to-string",Function.toString)},function(t,e,n){var r=n(14),i=n(31),o=n(32),a=n(113).f;t.exports=function(t){return function(e){for(var n,s=o(e),c=i(s),l=c.length,u=0,h=[];l>u;)n=c[u++],r&&!a.call(s,n)||h.push(t?[n,s[n]]:s[n]);return h}}},function(t,e,n){var r=n(30),i=n(32),o=n(75)(!1),a=n(53)("IE_PROTO");t.exports=function(t,e){var n,s=i(t),c=0,l=[];for(n in s)n!=a&&r(s,n)&&l.push(n);for(;e.length>c;)r(s,n=e[c++])&&(~o(l,n)||l.push(n));return l}},function(t,e,n){var r=n(34),i=Math.max,o=Math.min;t.exports=function(t,e){return(t=r(t))<0?i(t+e,0):o(t,e)}},function(t,e){e.f={}.propertyIsEnumerable},function(t,e,n){"use strict";n(115)("trim",(function(t){return function(){return t(this,3)}}))},function(t,e,n){var r=n(0),i=n(19),o=n(6),a=n(116),s="["+a+"]",c=RegExp("^"+s+s+"*"),l=RegExp(s+s+"*$"),u=function(t,e,n){var i={},s=o((function(){return!!a[t]()||"​"!="​"[t]()})),c=i[t]=s?e(h):a[t];n&&(i[n]=c),r(r.P+r.F*s,"String",i)},h=u.trim=function(t,e){return t=String(i(t)),1&e&&(t=t.replace(c,"")),2&e&&(t=t.replace(l,"")),t};t.exports=u},function(t,e){t.exports="\t\n\v\f\r   ᠎             　\u2028\u2029\ufeff"},function(t,e,n){"use strict";var r=n(0),i=n(75)(!1),o=[].indexOf,a=!!o&&1/[1].indexOf(1,-0)<0;r(r.P+r.F*(a||!n(35)(o)),"Array",{indexOf:function(t){return a?o.apply(this,arguments)||0:i(this,t,arguments[1])}})},function(t,e,n){"use strict";var r=n(0),i=n(52),o=n(21),a=n(6),s=[].sort,c=[1,2,3];r(r.P+r.F*(a((function(){c.sort(void 0)}))||!a((function(){c.sort(null)}))||!n(35)(s)),"Array",{sort:function(t){return void 0===t?s.call(o(this)):s.call(o(this),i(t))}})},function(t,e,n){"use strict";var r=n(3),i=n(120),o=n(36);n(37)("search",1,(function(t,e,n,a){return[function(n){var r=t(this),i=null==n?void 0:n[e];return void 0!==i?i.call(n,r):new RegExp(n)[e](String(r))},function(t){var e=a(n,t,this);if(e.done)return e.value;var s=r(t),c=String(this),l=s.lastIndex;i(l,0)||(s.lastIndex=0);var u=o(s,c);return i(s.lastIndex,l)||(s.lastIndex=l),null===u?-1:u.index}]}))},function(t,e){t.exports=Object.is||function(t,e){return t===e?0!==t||1/t==1/e:t!=t&&e!=e}},function(t,e,n){var r=n(33),i=n(1)("toStringTag"),o="Arguments"==r(function(){return arguments}());t.exports=function(t){var e,n,a;return void 0===t?"Undefined":null===t?"Null":"string"==typeof(n=function(t,e){try{return t[e]}catch(t){}}(e=Object(t),i))?n:o?r(e):"Object"==(a=r(e))&&"function"==typeof e.callee?"Arguments":a}},function(t,e,n){"use strict";var r=n(54);n(0)({target:"RegExp",proto:!0,forced:r!==/./.exec},{exec:r})},function(t,e,n){"use strict";var r=n(3);t.exports=function(){var t=r(this),e="";return t.global&&(e+="g"),t.ignoreCase&&(e+="i"),t.multiline&&(e+="m"),t.unicode&&(e+="u"),t.sticky&&(e+="y"),e}},function(t,e,n){"use strict";var r=n(125),i=n(3),o=n(126),a=n(55),s=n(20),c=n(36),l=n(54),u=n(6),h=Math.min,f=[].push,p=!u((function(){RegExp(4294967295,"y")}));n(37)("split",2,(function(t,e,n,u){var _;return _="c"=="abbc".split(/(b)*/)[1]||4!="test".split(/(?:)/,-1).length||2!="ab".split(/(?:ab)*/).length||4!=".".split(/(.?)(.?)/).length||".".split(/()()/).length>1||"".split(/.?/).length?function(t,e){var i=String(this);if(void 0===t&&0===e)return[];if(!r(t))return n.call(i,t,e);for(var o,a,s,c=[],u=(t.ignoreCase?"i":"")+(t.multiline?"m":"")+(t.unicode?"u":"")+(t.sticky?"y":""),h=0,p=void 0===e?4294967295:e>>>0,_=new RegExp(t.source,u+"g");(o=l.call(_,i))&&!((a=_.lastIndex)>h&&(c.push(i.slice(h,o.index)),o.length>1&&o.index<i.length&&f.apply(c,o.slice(1)),s=o[0].length,h=a,c.length>=p));)_.lastIndex===o.index&&_.lastIndex++;return h===i.length?!s&&_.test("")||c.push(""):c.push(i.slice(h)),c.length>p?c.slice(0,p):c}:"0".split(void 0,0).length?function(t,e){return void 0===t&&0===e?[]:n.call(this,t,e)}:n,[function(n,r){var i=t(this),o=null==n?void 0:n[e];return void 0!==o?o.call(n,i,r):_.call(String(i),n,r)},function(t,e){var r=u(_,t,this,e,_!==n);if(r.done)return r.value;var l=i(t),f=String(this),d=o(l,RegExp),g=l.unicode,m=(l.ignoreCase?"i":"")+(l.multiline?"m":"")+(l.unicode?"u":"")+(p?"y":"g"),v=new d(p?l:"^(?:"+l.source+")",m),y=void 0===e?4294967295:e>>>0;if(0===y)return[];if(0===f.length)return null===c(v,f)?[f]:[];for(var x=0,b=0,w=[];b<f.length;){v.lastIndex=p?b:0;var k,S=c(v,p?f:f.slice(b));if(null===S||(k=h(s(v.lastIndex+(p?0:b)),f.length))===x)b=a(f,b,g);else{if(w.push(f.slice(x,b)),w.length===y)return w;for(var L=1;L<=S.length-1;L++)if(w.push(S[L]),w.length===y)return w;b=x=k}}return w.push(f.slice(x)),w}]}))},function(t,e,n){var r=n(18),i=n(33),o=n(1)("match");t.exports=function(t){var e;return r(t)&&(void 0!==(e=t[o])?!!e:"RegExp"==i(t))}},function(t,e,n){var r=n(3),i=n(52),o=n(1)("species");t.exports=function(t,e){var n,a=r(t).constructor;return void 0===a||null==(n=r(a)[o])?e:i(n)}},function(t,e,n){var r=n(34),i=n(19);t.exports=function(t){return function(e,n){var o,a,s=String(i(e)),c=r(n),l=s.length;return c<0||c>=l?t?"":void 0:(o=s.charCodeAt(c))<55296||o>56319||c+1===l||(a=s.charCodeAt(c+1))<56320||a>57343?t?s.charAt(c):o:t?s.slice(c,c+2):a-56320+(o-55296<<10)+65536}}},function(t,e,n){var r=n(21),i=n(31);n(129)("keys",(function(){return function(t){return i(r(t))}}))},function(t,e,n){var r=n(0),i=n(27),o=n(6);t.exports=function(t,e){var n=(i.Object||{})[t]||Object[t],a={};a[t]=e(n),r(r.S+r.F*o((function(){n(1)})),"Object",a)}},function(t,e,n){n(49),n(41),t.exports=n(56).f("iterator")},function(t,e,n){n(132),n(137),n(138),n(139),t.exports=n(5).Symbol},function(t,e,n){"use strict";var r=n(4),i=n(7),o=n(12),a=n(38),s=n(65),c=n(133).KEY,l=n(23),u=n(46),h=n(48),f=n(26),p=n(2),_=n(56),d=n(57),g=n(134),m=n(63),v=n(15),y=n(16),x=n(68),b=n(13),w=n(39),k=n(24),S=n(66),L=n(135),O=n(136),M=n(77),E=n(11),P=n(43),j=O.f,A=E.f,T=L.f,C=r.Symbol,I=r.JSON,N=I&&I.stringify,R=p("_hidden"),F=p("toPrimitive"),W={}.propertyIsEnumerable,G=u("symbol-registry"),B=u("symbols"),V=u("op-symbols"),z=Object.prototype,D="function"==typeof C&&!!M.f,U=r.QObject,q=!U||!U.prototype||!U.prototype.findChild,H=o&&l((function(){return 7!=S(A({},"a",{get:function(){return A(this,"a",{value:7}).a}})).a}))?function(t,e,n){var r=j(z,e);r&&delete z[e],A(t,e,n),r&&t!==z&&A(z,e,r)}:A,$=function(t){var e=B[t]=S(C.prototype);return e._k=t,e},J=D&&"symbol"==typeof C.iterator?function(t){return"symbol"==typeof t}:function(t){return t instanceof C},Y=function(t,e,n){return t===z&&Y(V,e,n),v(t),e=w(e,!0),v(n),i(B,e)?(n.enumerable?(i(t,R)&&t[R][e]&&(t[R][e]=!1),n=S(n,{enumerable:k(0,!1)})):(i(t,R)||A(t,R,k(1,{})),t[R][e]=!0),H(t,e,n)):A(t,e,n)},Z=function(t,e){v(t);for(var n,r=g(e=b(e)),i=0,o=r.length;o>i;)Y(t,n=r[i++],e[n]);return t},K=function(t){var e=W.call(this,t=w(t,!0));return!(this===z&&i(B,t)&&!i(V,t))&&(!(e||!i(this,t)||!i(B,t)||i(this,R)&&this[R][t])||e)},Q=function(t,e){if(t=b(t),e=w(e,!0),t!==z||!i(B,e)||i(V,e)){var n=j(t,e);return!n||!i(B,e)||i(t,R)&&t[R][e]||(n.enumerable=!0),n}},X=function(t){for(var e,n=T(b(t)),r=[],o=0;n.length>o;)i(B,e=n[o++])||e==R||e==c||r.push(e);return r},tt=function(t){for(var e,n=t===z,r=T(n?V:b(t)),o=[],a=0;r.length>a;)!i(B,e=r[a++])||n&&!i(z,e)||o.push(B[e]);return o};D||(s((C=function(){if(this instanceof C)throw TypeError("Symbol is not a constructor!");var t=f(arguments.length>0?arguments[0]:void 0),e=function(n){this===z&&e.call(V,n),i(this,R)&&i(this[R],t)&&(this[R][t]=!1),H(this,t,k(1,n))};return o&&q&&H(z,t,{configurable:!0,set:e}),$(t)}).prototype,"toString",(function(){return this._k})),O.f=Q,E.f=Y,n(78).f=L.f=X,n(58).f=K,M.f=tt,o&&!n(25)&&s(z,"propertyIsEnumerable",K,!0),_.f=function(t){return $(p(t))}),a(a.G+a.W+a.F*!D,{Symbol:C});for(var et="hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables".split(","),nt=0;et.length>nt;)p(et[nt++]);for(var rt=P(p.store),it=0;rt.length>it;)d(rt[it++]);a(a.S+a.F*!D,"Symbol",{for:function(t){return i(G,t+="")?G[t]:G[t]=C(t)},keyFor:function(t){if(!J(t))throw TypeError(t+" is not a symbol!");for(var e in G)if(G[e]===t)return e},useSetter:function(){q=!0},useSimple:function(){q=!1}}),a(a.S+a.F*!D,"Object",{create:function(t,e){return void 0===e?S(t):Z(S(t),e)},defineProperty:Y,defineProperties:Z,getOwnPropertyDescriptor:Q,getOwnPropertyNames:X,getOwnPropertySymbols:tt});var ot=l((function(){M.f(1)}));a(a.S+a.F*ot,"Object",{getOwnPropertySymbols:function(t){return M.f(x(t))}}),I&&a(a.S+a.F*(!D||l((function(){var t=C();return"[null]"!=N([t])||"{}"!=N({a:t})||"{}"!=N(Object(t))}))),"JSON",{stringify:function(t){for(var e,n,r=[t],i=1;arguments.length>i;)r.push(arguments[i++]);if(n=e=r[1],(y(e)||void 0!==t)&&!J(t))return m(e)||(e=function(t,e){if("function"==typeof n&&(e=n.call(this,t,e)),!J(e))return e}),r[1]=e,N.apply(I,r)}}),C.prototype[F]||n(10)(C.prototype,F,C.prototype.valueOf),h(C,"Symbol"),h(Math,"Math",!0),h(r.JSON,"JSON",!0)},function(t,e,n){var r=n(26)("meta"),i=n(16),o=n(7),a=n(11).f,s=0,c=Object.isExtensible||function(){return!0},l=!n(23)((function(){return c(Object.preventExtensions({}))})),u=function(t){a(t,r,{value:{i:"O"+ ++s,w:{}}})},h=t.exports={KEY:r,NEED:!1,fastKey:function(t,e){if(!i(t))return"symbol"==typeof t?t:("string"==typeof t?"S":"P")+t;if(!o(t,r)){if(!c(t))return"F";if(!e)return"E";u(t)}return t[r].i},getWeak:function(t,e){if(!o(t,r)){if(!c(t))return!0;if(!e)return!1;u(t)}return t[r].w},onFreeze:function(t){return l&&h.NEED&&c(t)&&!o(t,r)&&u(t),t}}},function(t,e,n){var r=n(43),i=n(77),o=n(58);t.exports=function(t){var e=r(t),n=i.f;if(n)for(var a,s=n(t),c=o.f,l=0;s.length>l;)c.call(t,a=s[l++])&&e.push(a);return e}},function(t,e,n){var r=n(13),i=n(78).f,o={}.toString,a="object"==typeof window&&window&&Object.getOwnPropertyNames?Object.getOwnPropertyNames(window):[];t.exports.f=function(t){return a&&"[object Window]"==o.call(t)?function(t){try{return i(t)}catch(t){return a.slice()}}(t):i(r(t))}},function(t,e,n){var r=n(58),i=n(24),o=n(13),a=n(39),s=n(7),c=n(61),l=Object.getOwnPropertyDescriptor;e.f=n(12)?l:function(t,e){if(t=o(t),e=a(e,!0),c)try{return l(t,e)}catch(t){}if(s(t,e))return i(!r.f.call(t,e),t[e])}},function(t,e){},function(t,e,n){n(57)("asyncIterator")},function(t,e,n){n(57)("observable")},function(t,e,n){var r=n(28).f,i=Function.prototype,o=/^\s*function ([^ (]*)/;"name"in i||n(14)&&r(i,"name",{configurable:!0,get:function(){try{return(""+this).match(o)[1]}catch(t){return""}}})},function(t,e,n){for(var r=n(142),i=n(31),o=n(29),a=n(8),s=n(9),c=n(59),l=n(1),u=l("iterator"),h=l("toStringTag"),f=c.Array,p={CSSRuleList:!0,CSSStyleDeclaration:!1,CSSValueList:!1,ClientRectList:!1,DOMRectList:!1,DOMStringList:!1,DOMTokenList:!0,DataTransferItemList:!1,FileList:!1,HTMLAllCollection:!1,HTMLCollection:!1,HTMLFormElement:!1,HTMLSelectElement:!1,MediaList:!0,MimeTypeArray:!1,NamedNodeMap:!1,NodeList:!0,PaintRequestList:!1,Plugin:!1,PluginArray:!1,SVGLengthList:!1,SVGNumberList:!1,SVGPathSegList:!1,SVGPointList:!1,SVGStringList:!1,SVGTransformList:!1,SourceBufferList:!1,StyleSheetList:!0,TextTrackCueList:!1,TextTrackList:!1,TouchList:!1},_=i(p),d=0;d<_.length;d++){var g,m=_[d],v=p[m],y=a[m],x=y&&y.prototype;if(x&&(x[u]||s(x,u,f),x[h]||s(x,h,m),c[m]=f,v))for(g in r)x[g]||o(x,g,r[g],!0)}},function(t,e,n){"use strict";var r=n(79),i=n(143),o=n(59),a=n(32);t.exports=n(144)(Array,"Array",(function(t,e){this._t=a(t),this._i=0,this._k=e}),(function(){var t=this._t,e=this._k,n=this._i++;return!t||n>=t.length?(this._t=void 0,i(1)):i(0,"keys"==e?n:"values"==e?t[n]:[n,t[n]])}),"values"),o.Arguments=o.Array,r("keys"),r("values"),r("entries")},function(t,e){t.exports=function(t,e){return{value:e,done:!!t}}},function(t,e,n){"use strict";var r=n(72),i=n(0),o=n(29),a=n(9),s=n(59),c=n(145),l=n(80),u=n(149),h=n(1)("iterator"),f=!([].keys&&"next"in[].keys()),p=function(){return this};t.exports=function(t,e,n,_,d,g,m){c(n,e,_);var v,y,x,b=function(t){if(!f&&t in L)return L[t];switch(t){case"keys":case"values":return function(){return new n(this,t)}}return function(){return new n(this,t)}},w=e+" Iterator",k="values"==d,S=!1,L=t.prototype,O=L[h]||L["@@iterator"]||d&&L[d],M=O||b(d),E=d?k?b("entries"):M:void 0,P="Array"==e&&L.entries||O;if(P&&(x=u(P.call(new t)))!==Object.prototype&&x.next&&(l(x,w,!0),r||"function"==typeof x[h]||a(x,h,p)),k&&O&&"values"!==O.name&&(S=!0,M=function(){return O.call(this)}),r&&!m||!f&&!S&&L[h]||a(L,h,M),s[e]=M,s[w]=p,d)if(v={values:k?M:b("values"),keys:g?M:b("keys"),entries:E},m)for(y in v)y in L||o(L,y,v[y]);else i(i.P+i.F*(f||S),e,v);return v}},function(t,e,n){"use strict";var r=n(146),i=n(71),o=n(80),a={};n(9)(a,n(1)("iterator"),(function(){return this})),t.exports=function(t,e,n){t.prototype=r(a,{next:i(1,n)}),o(t,e+" Iterator")}},function(t,e,n){var r=n(3),i=n(147),o=n(76),a=n(53)("IE_PROTO"),s=function(){},c=function(){var t,e=n(70)("iframe"),r=o.length;for(e.style.display="none",n(148).appendChild(e),e.src="javascript:",(t=e.contentWindow.document).open(),t.write("<script>document.F=Object<\/script>"),t.close(),c=t.F;r--;)delete c.prototype[o[r]];return c()};t.exports=Object.create||function(t,e){var n;return null!==t?(s.prototype=r(t),n=new s,s.prototype=null,n[a]=t):n=c(),void 0===e?n:i(n,e)}},function(t,e,n){var r=n(28),i=n(3),o=n(31);t.exports=n(14)?Object.defineProperties:function(t,e){i(t);for(var n,a=o(e),s=a.length,c=0;s>c;)r.f(t,n=a[c++],e[n]);return t}},function(t,e,n){var r=n(8).document;t.exports=r&&r.documentElement},function(t,e,n){var r=n(30),i=n(21),o=n(53)("IE_PROTO"),a=Object.prototype;t.exports=Object.getPrototypeOf||function(t){return t=i(t),r(t,o)?t[o]:"function"==typeof t.constructor&&t instanceof t.constructor?t.constructor.prototype:t instanceof Object?a:null}},function(t,e,n){"use strict";var r=n(0),i=n(60)(0),o=n(35)([].forEach,!0);r(r.P+r.F*!o,"Array",{forEach:function(t){return i(this,t,arguments[1])}})},function(t,e,n){var r=n(152);t.exports=function(t,e){return new(r(t))(e)}},function(t,e,n){var r=n(18),i=n(153),o=n(1)("species");t.exports=function(t){var e;return i(t)&&("function"!=typeof(e=t.constructor)||e!==Array&&!i(e.prototype)||(e=void 0),r(e)&&null===(e=e[o])&&(e=void 0)),void 0===e?Array:e}},function(t,e,n){var r=n(33);t.exports=Array.isArray||function(t){return"Array"==r(t)}},function(t,e,n){"use strict";var r=n(0),i=n(60)(1);r(r.P+r.F*!n(35)([].map,!0),"Array",{map:function(t){return i(this,t,arguments[1])}})},function(t,e,n){"use strict";var r=n(3),i=n(21),o=n(20),a=n(34),s=n(55),c=n(36),l=Math.max,u=Math.min,h=Math.floor,f=/\$([$&`']|\d\d?|<[^>]*>)/g,p=/\$([$&`']|\d\d?)/g;n(37)("replace",2,(function(t,e,n,_){return[function(r,i){var o=t(this),a=null==r?void 0:r[e];return void 0!==a?a.call(r,o,i):n.call(String(o),r,i)},function(t,e){var i=_(n,t,this,e);if(i.done)return i.value;var h=r(t),f=String(this),p="function"==typeof e;p||(e=String(e));var g=h.global;if(g){var m=h.unicode;h.lastIndex=0}for(var v=[];;){var y=c(h,f);if(null===y)break;if(v.push(y),!g)break;""===String(y[0])&&(h.lastIndex=s(f,o(h.lastIndex),m))}for(var x,b="",w=0,k=0;k<v.length;k++){y=v[k];for(var S=String(y[0]),L=l(u(a(y.index),f.length),0),O=[],M=1;M<y.length;M++)O.push(void 0===(x=y[M])?x:String(x));var E=y.groups;if(p){var P=[S].concat(O,L,f);void 0!==E&&P.push(E);var j=String(e.apply(void 0,P))}else j=d(S,f,L,O,E,e);L>=w&&(b+=f.slice(w,L)+j,w=L+S.length)}return b+f.slice(w)}];function d(t,e,r,o,a,s){var c=r+t.length,l=o.length,u=p;return void 0!==a&&(a=i(a),u=f),n.call(s,u,(function(n,i){var s;switch(i.charAt(0)){case"$":return"$";case"&":return t;case"`":return e.slice(0,r);case"'":return e.slice(c);case"<":s=a[i.slice(1,-1)];break;default:var u=+i;if(0===u)return n;if(u>l){var f=h(u/10);return 0===f?n:f<=l?void 0===o[f-1]?i.charAt(1):o[f-1]+i.charAt(1):n}s=o[u-1]}return void 0===s?"":s}))}}))},function(t,e,n){"use strict";var r=n(3),i=n(20),o=n(55),a=n(36);n(37)("match",1,(function(t,e,n,s){return[function(n){var r=t(this),i=null==n?void 0:n[e];return void 0!==i?i.call(n,r):new RegExp(n)[e](String(r))},function(t){var e=s(n,t,this);if(e.done)return e.value;var c=r(t),l=String(this);if(!c.global)return a(c,l);var u=c.unicode;c.lastIndex=0;for(var h,f=[],p=0;null!==(h=a(c,l));){var _=String(h[0]);f[p]=_,""===_&&(c.lastIndex=o(l,i(c.lastIndex),u)),p++}return 0===p?null:f}]}))},function(t,e,n){"use strict";var r=n(0),i=n(60)(5),o=!0;"find"in[]&&Array(1).find((function(){o=!1})),r(r.P+r.F*o,"Array",{find:function(t){return i(this,t,arguments.length>1?arguments[1]:void 0)}}),n(79)("find")},function(t,e,n){"use strict";n.r(e);var r=n(81),i=n.n(r);var o=n(82),a=n.n(o),s=n(83),c=n.n(s);function l(t,e){return function(t){if(i()(t))return t}(t)||function(t,e){if(c()(Object(t))||"[object Arguments]"===Object.prototype.toString.call(t)){var n=[],r=!0,i=!1,o=void 0;try{for(var s,l=a()(t);!(r=(s=l.next()).done)&&(n.push(s.value),!e||n.length!==e);r=!0);}catch(t){i=!0,o=t}finally{try{r||null==l.return||l.return()}finally{if(i)throw o}}return n}}(t,e)||function(){throw new TypeError("Invalid attempt to destructure non-iterable instance")}()}n(106),n(114),n(117),n(118),n(119),n(124),n(128);var u=n(84),h=n.n(u),f=n(22),p=n.n(f);function _(t){return(_="function"==typeof p.a&&"symbol"==typeof h.a?function(t){return typeof t}:function(t){return t&&"function"==typeof p.a&&t.constructor===p.a&&t!==p.a.prototype?"symbol":typeof t})(t)}n(140),n(141),n(150),n(154),n(155),n(156),n(157);!function(t,e,n,r){n.openyMap=function(){return{locations:null,marker_image_url:null,shadow_image_url:null,map:null,tags:{},distance_limit:null,center_point:null,search_center_point:null,search_center_marker:null,geocoder:function(){return void 0!==google.maps?new google.maps.Geocoder:{}},libraryIsLoaded:function(){return void 0!==e.google},normalize_point:function(t){return{lat:t.lat(),lon:t.lng()}},toRad:function(t){return t*Math.PI/180},init:function(e){this.component_el=e.component_el,this.map_data=e.map_data,this.tags_style=e.tags_style,this.locations=this.map_data,this.marker_image_url=e.marker_image_url||null,this.shadow_image_url=e.shadow_image_url||null,this.search_center_marker=e.search_center_marker||null,this.map_el=this.component_el.find(".openy-map"),this.messages_el=this.component_el.find(".messages"),this.map_controls_el=this.component_el.find(".map_controls"),this.search_field_el=this.map_controls_el.find("input.search_field"),this.distance_limit_el=this.map_controls_el.find("select.distance_limit_value"),this.locate_me_el=this.map_controls_el.find(".locateme"),this.tags={},this.default_tags=r.openyMapSettings.default_tags,this.init_map(),this.init_tags(),this.init_map_locations(),this.draw_map_controls(),this.hookup_map_controls_events(),this.update_tag_filters(),this.update_amenities_filters(),this.draw_map_locations(),this.draw_list_locations();var n=document.location.href.match(/&?[amp;]?map_location=([\w|\+]*)&?[amp;]?/),i=this;navigator.geolocation||t(".with-geo").remove(),this.component_el.find(".zip-code .btn-submit").on("click",t.proxy(this.apply_search,this)),this.search_field_el.on("keypress",(function(t){13==t.keyCode&&i.apply_search()})),n&&(t(".search_field").val(n[1].replace(/\+/g," ")),t(".distance_limit option").eq(2).attr("selected",!0),t(".zip-code .btn-submit").click())},init_map:function(){this.map=new google.maps.Map(this.map_el[0],{scaleControl:!0,center:this.center,zoom:9,scrollwheel:!1,mapTypeId:google.maps.MapTypeId.ROADMAP}),this.init_map_center(),this.component_el.trigger("initialized",[this.map])},init_map_center:function(){this.search_center_marker=this.search_center_marker||new google.maps.Marker({position:this.center_point,animation:google.maps.Animation.DROP}),this.search_center_marker&&(this.search_center_marker.setVisible(!1),this.search_center_marker.setMap(this.map))},filter_change:function(e){if(e){var n=t(e.currentTarget),r=this.component_el.find("nav.types input."+n.attr("class")+"[type=checkbox]");r.prop("checked",n.prop("checked")),r.parents("label").toggleClass("checked",n.prop("checked"))}this.update_tag_filters(),this.update_amenities_filters(),this.redraw_map_locations(),this.draw_list_locations()},hookup_map_controls_events:function(){this.map_controls_el.find(".tag_filters input[type=checkbox]").on("change",t.proxy(this.filter_change,this)),this.search_field_el.on("change",t.proxy(this.apply_search,this)),this.distance_limit_el.on("change",t.proxy(this.apply_distance_limit,this)),this.locate_me_el.on("click",t.proxy(this.locate_me_onclick,this)),this.component_el.find("nav.types input[type=checkbox]").on("change",t.proxy(this.bar_filter_change,this)),this.search_field_el.on("autocompleteselect",t.proxy(this.apply_autocomplete_search,this)),t("#views-exposed-form-location-by-amenities-block-1").find("input[type=checkbox]").on("change",t.proxy(this.filter_change,this))},apply_search:function(){var e=this.search_field_el.val();if(""!=e){this.geocoder().geocode({address:e},t.proxy((function(t,e){if("OK"==e){if(this.search_center_point=t[0].geometry.location,t[0].geometry.bounds)this.map.fitBounds(t[0].geometry.bounds);else{var n=new google.maps.LatLngBounds;if(n.extend(this.search_center_point),n.getNorthEast().equals(n.getSouthWest())){var r=new google.maps.LatLng(n.getNorthEast().lat()+.001,n.getNorthEast().lng()+.001),i=new google.maps.LatLng(n.getNorthEast().lat()-.001,n.getNorthEast().lng()-.001);n.extend(r),n.extend(i)}this.map.fitBounds(n)}this.search_center=this.map.getCenter(),this.draw_search_center(),this.apply_distance_limit()}}),this))}else this.reset_search_results()},apply_autocomplete_search:function(e,r){var i=[];this.locations.forEach((function(t){t.name==r.item.value&&i.push(t)})),null===this.search_center&&(this.search_center=this.map.getCenter()),this.distance_limit="",this.search_center_marker.setPosition(this.search_center_point),this.search_center_marker.setVisible(!1);for(var o=new google.maps.LatLngBounds,a=0;a<i.length;a++){var s=i[a];o.extend(s.marker.getPosition()),s.marker.setVisible(!0)}this.map.fitBounds(o);for(var c=0;c<this.locations.length;c++)void 0!==this.locations[c].element&&(this.locations[c].element.hide(),t(this.locations[c].element).parents(".locations-list").find(".location-title").hide());if(i.length)for(var l=0;l<i.length;l++)void 0!==i[l].element&&(i[l].element.show(),t(i[l].element).parents(".locations-list").find(".location-title").show());else{var u='<div class="col-xs-12 text-center"><p>'+n.t("We're sorry no results were found in your area")+"</p></div>";this.messages_el.hide().html(u).fadeIn()}},apply_distance_limit:function(){null===this.search_center&&(this.search_center=this.map.getCenter()),this.distance_limit=this.distance_limit_el.val(),this.draw_search_center(),this.redraw_map_locations(),this.draw_list_locations()},reset_search_results:function(){null===this.search_center&&(this.search_center=this.map.getCenter()),this.distance_limit="",this.search_center_marker.setPosition(this.search_center_point),this.search_center_marker.setVisible(!1),this.redraw_map_locations(),this.draw_list_locations()},locate_me_onclick:function(e){navigator.geolocation&&(this.search_field_el.val(""),this.geolocation_watcher=navigator.geolocation.watchPosition(t.proxy(this.locate_me,this)))},locate_me:function(e){var n=e.coords.lat,r=e.coords.lng;this.search_center_point=new google.maps.LatLng(n,r),this.map.setCenter(this.search_center_point),this.map.setZoom(14),e.coords.accuracy<=15840&&(this.geocoder().geocode({latLng:this.search_center_point},t.proxy((function(t,e){t[0]&&this.search_field_el.val(t[0].formatted_address),this.apply_search()}),this)),navigator.geolocation.clearWatch(this.geolocation_watcher)),this.draw_search_center()},init_tags:function(){for(var e=0;e<this.locations.length;e++){var n=this.locations[e];n.tags||(n.tags=[]),_(n.tags)===_("")&&(n.tags=[n.tags]);for(var r=0;r<n.tags.length;r++){var i=n.tags[r];i in this.tags||(this.tags[i]={marker_icons:[]}),n.icon&&-1==t.inArray(n.icon,this.tags[i].marker_icons)&&this.tags[i].marker_icons.push(n.icon)}}},update_tag_filters:function(){this.tag_filters=[];var e=this;this.map_controls_el.find(".tag_filters input[type=checkbox]:checked").each((function(n){var r=t(this);e.tag_filters.push(r.val())}))},update_amenities_filters:function(){this.amenities_filters=[];var e=this;t("#views-exposed-form-location-by-amenities-block-1").find("input[type=checkbox]:checked").each((function(n){var r=t(this);e.amenities_filters.push(r.val())}))},apply_filters:function(t){return t=this.apply_tag_filters(t),t=this.apply_distance_filters(t),t=this.apply_amenities_filters(t),this.set_url_parameters(),t},apply_tag_filters:function(e){var n=this.tag_filters.length,r=Object.keys(this.tags).length,i=r>this.default_tags.length;if(0===n||n===r&&i)return e;for(var o=[],a=0;a<e.length;a++)for(var s=e[a],c=0;c<this.tag_filters.length;c++){var l=this.tag_filters[c];t.inArray(l,s.tags)>=0&&o.push(s)}return o},apply_distance_filters:function(t){if(!this.search_center)return t;if(!this.distance_limit||""===this.distance_limit)return t;for(var e=this.normalize_point(this.search_center),n=[],r=parseFloat(e.lat),i=parseFloat(e.lon),o=this.toRad(r),a=0;a<t.length;a++){var s=t[a],c=parseFloat(s.lat),l=parseFloat(s.lng),u=this.toRad(c-r),h=this.toRad(l-i),f=this.toRad(c),p=Math.sin(u/2)*Math.sin(u/2)+Math.sin(h/2)*Math.sin(h/2)*Math.cos(o)*Math.cos(f),_=3963*(2*Math.atan2(Math.sqrt(p),Math.sqrt(1-p)));_<=this.distance_limit&&(s.distance=_,n.push(s))}return n},apply_amenities_filters:function(e){if(0===this.amenities_filters.length)return e;for(var n=[],r=0;r<e.length;r++)for(var i=e[r],o=0;o<this.amenities_filters.length;o++){var a=this.amenities_filters[o];t.inArray(a,i.amenities)>=0&&n.push(i)}return n},init_active_tags:function(){if(this.initial_active_tags)return this.initial_active_tags;var e=[],n=this.get_parameters().type,r=n?n.split(","):[];for(var i in this.tags)0===r.length?e.push(i):t.inArray(this.encode_to_url_format(i),r)>=0&&e.push(i);this.initial_active_tags=e,0===r.length&&(this.initial_active_tags=this.default_tags)},get_parameters:function(){for(var t=e.location.search.substring(1).split("&"),n={},r=0;r<t.length;r++){var i=t[r].split("=");n[unescape(i[0])]=unescape(i[1])}return n},set_url_parameters:function(){var n=this,r=document.location.pathname,i=this.get_parameters(),o=this.tag_filters,a=this.amenities_filters,s="",c="",l=t(".search_field").val()||i.hasOwnProperty("map_location")&&i.map_location||"";l&&(l="?map_location="+this.encode_to_url_format(l)),o&&(s=l?"&":"?",s+="type=",o.forEach((function(t){s+=n.encode_to_url_format(t)+","}),this,s),s=s.substring(0,s.length-1)),a&&(c="&",c+="amenities=",a.forEach((function(t){c+=n.encode_to_url_format(t)+","}),this,c),c=c.substring(0,c.length-1)),e.history.replaceState(null,null,r+l+s+c)},draw_map_controls:function(){var e=this;this.init_active_tags();var n="";if("list-checkboxes"==this.tags_style){n='<select id="tag-filter" class="form-control multiselect" name="tag_filter" multiple="multiple">';var r=Object.keys(this.tags).sort();r.splice(r.indexOf("YMCA"),1),r.splice(r.indexOf("Camps"),1),r.unshift("Camps"),r.unshift("YMCA"),r.forEach((function(r){var i="";t.inArray(r,e.initial_active_tags)>=0&&(i="selected"),n+='<option value="'+r+'" '+i+">"+r+"</option>"}),this),n+="</select>"}else for(var i in this.tags){var o="";t.inArray(i,this.initial_active_tags)>=0&&(o='checked="checked"');var a='<label class="btn btn-default" for="tag_'+i+'">';a+='<input autocomplete="off" id="tag_'+i+'" class="tag_'+i+'" type="checkbox" value="'+i+'" '+o+"/>"+i;for(var s=0;s<this.tags[i].marker_icons.length;s++)a+='<img class="tag_icon inline-hidden-sm" src="'+this.tags[i].marker_icons[s]+'" aria-hidden="true" />';n+=a+="</label>"}this.map_controls_el.find(".tag_filters").append(n),"list-checkboxes"==this.tags_style&&t(".tag_filters .multiselect").multiselect({columns:1,showCheckbox:!0,minHeight:50,texts:{placeholder:"Select options"},onOptionClick:t.proxy(this.filter_change,this)});var c=[];this.locations.forEach((function(t){c.push(t.name)})),this.search_field_el.autocomplete({minLength:3,source:c})},encode_to_url_format:function(t){return t.toLowerCase().replace(/[^\w ]+/g,"").replace(/ +/g,"-")},draw_map_locations:function(){var t=this.apply_filters(this.locations);if(0!==t.length){for(var e=new google.maps.LatLngBounds,n=0;n<t.length;n++){var r=t[n];e.extend(r.marker.getPosition()),r.marker.setVisible(!0)}if(e.getNorthEast().equals(e.getSouthWest())){var i=new google.maps.LatLng(e.getNorthEast().lat()+.001,e.getNorthEast().lng()+.001),o=new google.maps.LatLng(e.getNorthEast().lat()-.001,e.getNorthEast().lng()-.001);e.extend(i),e.extend(o)}this.map.fitBounds(e)}else this.map.setCenter(this.search_center_point)},redraw_map_locations:function(){for(var t=0;t<this.locations.length;t++){this.locations[t].marker.setVisible(!1)}this.draw_map_locations()},draw_list_locations:function(){for(var e=this.apply_filters(this.locations),r=0;r<this.locations.length;r++)void 0!==this.locations[r].element&&(this.locations[r].element.hide(),t(this.locations[r].element).parents(".locations-list").find(".location-title").hide());if(e.length){this.messages_el.hide();for(var i=0;i<e.length;i++)void 0!==e[i].element&&(e[i].element.show(),t(e[i].element).parents(".locations-list").find(".location-title").show())}else{var o='<div class="col-xs-12 text-center"><p>'+n.t("No locations were found in this area. Please try a different area or increase your search distance.")+"</p></div>";this.messages_el.hide().html(o).fadeIn()}},draw_list_location:function(t){return t.markup},draw_map_location:function(t){return this.draw_list_location(t)},init_map_locations:function(){for(var t=this,e=this.locations,n=function(e,n){return function(){for(var r=0;r<t.locations.length;r++)t.locations[r].infowindow.close();e.open(this.map,n)}},r=0;r<e.length;r++){var i=e[r];i.point=new google.maps.LatLng(i.lat,i.lng);var o='<div class="marker_tooltip">'+this.draw_map_location(i)+"</div>",a=new google.maps.MarkerImage(this.marker_image_url)||null;a=i.icon?new google.maps.MarkerImage(i.icon):a;var s=i.shadow?new google.maps.MarkerImage(i.shadow):null,c=new google.maps.Marker({position:i.point,icon:a,shadow:s,animation:google.maps.Animation.DROP}),l=new google.maps.InfoWindow({content:o});i.infowindow=l,google.maps.event.addListener(c,"click",n(l,c)),c.setVisible(!1),c.setMap(this.map),i.marker=c}},draw_search_center:function(){this.search_center_marker.setPosition(this.search_center_point),this.search_center_marker.setVisible(!0)},bar_filter_change:function(e){var n=t(e.currentTarget),r=this.map_controls_el.find("input."+n.attr("class")+"[type=checkbox]");this.map_controls_el.find("input[type=checkbox]").prop("checked",!1),this.component_el.find("nav.types input[type=checkbox]").prop("checked",!1),this.component_el.find("nav.types label").removeClass("checked"),r.prop("checked",!0),n.prop("checked",!0),n.parents("label").addClass("checked"),this.filter_change()},build_google_url:function(t){return(t=(t=t.trim()).replace(/ /g,"+")).length>0&&(t+="+"),t}}},n.baseLayerWikimedia={tilePattern:"https://maps.wikimedia.org/osm-intl/{z}/{x}/{y}{r}.png",options:{attribution:'<a href="https://wikimediafoundation.org/wiki/Maps_Terms_of_Use">Wikimedia</a>',minZoom:1,maxZoom:19}},n.baseLayerEsriWorldStreetMap={tilePattern:"https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}",options:{attribution:"Tiles &copy; Esri &mdash; Source: Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom, 2012"}},n.baseLayerEsriNatGeoWorldMap={tilePattern:"https://server.arcgisonline.com/ArcGIS/rest/services/NatGeo_World_Map/MapServer/tile/{z}/{y}/{x}",options:{attribution:"Tiles &copy; Esri &mdash; National Geographic, Esri, DeLorme, NAVTEQ, UNEP-WCMC, USGS, NASA, ESA, METI, NRCAN, GEBCO, NOAA, iPC",maxZoom:16}},n.baseLayerOpenStreetMapMapnik={tilePattern:"https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png",options:{attribution:'&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>',maxZoom:19}},n.openyMapLeaflet=function(){return{baseLayer:n.baseLayerWikimedia,locations:null,marker_image_url:null,shadow_image_url:null,map:null,tags:{},distance_limit:null,center_point:null,search_center_point:null,search_center_marker:null,fitBoundsOptions:null,default_search_location:null,libraryIsLoaded:function(){return void 0!==e.L},normalize_point:function(t){return{lat:t.lat(),lon:t.lng()}},toRad:function(t){return t*Math.PI/180},init:function(e){this.component_el=e.component_el,this.map_data=e.map_data,this.tags_style=e.tags_style,this.locations=this.map_data,this.fitBoundsOptions={paddingTopLeft:L.point(0,40),paddingBottomRight:L.point(0,10)},this.marker_image_url=e.marker_image_url||null,this.shadow_image_url=e.shadow_image_url||null,this.search_center_marker=e.search_center_marker||null,this.map_el=this.component_el.find(".openy-map"),this.messages_el=this.component_el.find(".messages"),this.map_controls_el=this.component_el.find(".map_controls"),this.search_field_el=this.map_controls_el.find("input.search_field"),this.distance_limit_el=this.map_controls_el.find("select.distance_limit_value"),this.locate_me_el=this.map_controls_el.find(".locateme"),this.tags={},this.default_tags=r.openyMapSettings.default_tags,this.init_map(),this.init_tags(),this.init_map_locations(),this.draw_map_controls(),this.hookup_map_controls_events(),this.update_tag_filters(),this.update_amenities_filters(),this.draw_map_locations(),this.draw_list_locations();var n=document.location.href.match(/&?[amp;]?map_location=([\w|\+]*)&?[amp;]?/),i=this;navigator.geolocation||t(".with-geo").remove(),this.component_el.find(".zip-code .btn-submit").on("click",t.proxy(this.apply_search,this)),this.search_field_el.on("keypress",(function(t){13==t.keyCode&&i.apply_search()})),n&&(t(".search_field").val(n[1].replace(/\+/g," ")),t(".distance_limit option").eq(2).attr("selected",!0),t(".zip-code .btn-submit").click())},init_map:function(){this.map=L.map(this.map_el[0]).setView([51.505,-.09],13),L.tileLayer(this.baseLayer.tilePattern,this.baseLayer.options).addTo(this.map),this.map.scrollWheelZoom.disable(),L.Browser.mobile&&this.map.dragging.disable(),this.init_map_center()},init_map_center:function(){var t=L.icon({iconUrl:this.search_icon,iconRetinaUrl:this.search_icon_retina,shadowUrl:"https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",iconSize:[25,41],iconAnchor:[12,41],popupAnchor:[1,-34],shadowSize:[41,41]});this.search_center_marker=this.search_center_marker||L.marker(this.map.getCenter(),{icon:t}),this.search_center_marker&&this.search_center_marker.removeFrom(this.map)},filter_change:function(e){if(e){var n=t(e.currentTarget),r=this.component_el.find("nav.types input."+n.attr("class")+"[type=checkbox]");r.prop("checked",n.prop("checked")),r.parents("label").toggleClass("checked",n.prop("checked"))}this.update_tag_filters(),this.update_amenities_filters(),this.redraw_map_locations(),this.draw_list_locations()},hookup_map_controls_events:function(){this.map_controls_el.find(".tag_filters input[type=checkbox]").on("change",t.proxy(this.filter_change,this)),this.search_field_el.on("change",t.proxy(this.apply_search,this)),this.distance_limit_el.on("change",t.proxy(this.apply_distance_limit,this)),this.locate_me_el.on("click",t.proxy(this.locate_me_onclick,this)),this.component_el.find("nav.types input[type=checkbox]").on("change",t.proxy(this.bar_filter_change,this)),this.search_field_el.on("autocompleteselect",t.proxy(this.apply_autocomplete_search,this)),t("#views-exposed-form-location-by-amenities-block-1").find("input[type=checkbox]").on("change",t.proxy(this.filter_change,this))},apply_search:function(){var t=this,e=this.search_field_el.val();""!=e?this.geocode(e,(function(e,n){if("success"==n&&e.length>0){if(t.search_center_point=L.latLng(e[0].lat,e[0].lon),e[0].boundingbox){var r=L.latLngBounds();r.extend(L.latLng(e[0].boundingbox[0],e[0].boundingbox[2])),r.extend(L.latLng(e[0].boundingbox[1],e[0].boundingbox[3])),t.map.fitBounds(r,t.fitBoundsOptions)}t.search_center=t.search_center_point,t.draw_search_center(),t.apply_distance_limit()}})):this.reset_search_results()},geocode:function(e,n){var r=this.default_search_location?"+"+this.default_search_location:"";t.getJSON("https://nominatim.openstreetmap.org/search?format=json&limit=5&q="+e+r,n)},apply_autocomplete_search:function(e,r){var i=[];this.locations.forEach((function(t){t.name==r.item.value&&i.push(t)})),null===this.search_center&&(this.search_center=this.map.getCenter()),this.distance_limit="",this.search_center_marker.removeFrom(this.maps);for(var o=L.latLngBounds(),a=0;a<i.length;a++){var s=i[a];o.extend(s.point),s.marker.addTo(this.map)}this.map.fitBounds(o,this.fitBoundsOptions);for(var c=0;c<this.locations.length;c++)void 0!==this.locations[c].element&&(this.locations[c].element.hide(),t(this.locations[c].element).parents(".locations-list").find(".location-title").hide());if(i.length)for(var l=0;l<i.length;l++)void 0!==i[l].element&&(i[l].element.show(),t(i[l].element).parents(".locations-list").find(".location-title").show());else{var u='<div class="col-xs-12 text-center"><p>'+n.t("We're sorry no results were found in your area")+"</p></div>";this.messages_el.hide().html(u).fadeIn()}},apply_distance_limit:function(){null===this.search_center&&(this.search_center=this.map.getCenter()),this.distance_limit=this.distance_limit_el.val(),this.draw_search_center(),this.redraw_map_locations(),this.draw_list_locations()},reset_search_results:function(){null===this.search_center&&(this.search_center=this.map.getCenter()),this.distance_limit="",this.search_center_point&&(this.search_center_marker.setLatLng(this.search_center_point),this.search_center_marker.addTo(this.map)),this.redraw_map_locations(),this.draw_list_locations(),this.set_url_parameters()},locate_me_onclick:function(e){navigator.geolocation&&(this.search_field_el.val(""),this.geolocation_watcher=navigator.geolocation.watchPosition(t.proxy(this.locate_me,this)))},locate_me:function(t){var e=t.coords.lat,n=t.coords.lng;this.search_center_point=L.latLng(e,n),this.map.setView(this.search_center_point,14),t.coords.accuracy<=15840&&navigator.geolocation.clearWatch(this.geolocation_watcher),this.draw_search_center()},init_tags:function(){for(var e=0;e<this.locations.length;e++){var n=this.locations[e];n.tags||(n.tags=[]),_(n.tags)===_("")&&(n.tags=[n.tags]);for(var r=0;r<n.tags.length;r++){var i=n.tags[r];i in this.tags||(this.tags[i]={marker_icons:[]}),n.icon&&-1==t.inArray(n.icon,this.tags[i].marker_icons)&&this.tags[i].marker_icons.push(n.icon)}}},update_tag_filters:function(){this.tag_filters=[];var e=this;this.map_controls_el.find(".tag_filters input[type=checkbox]:checked").each((function(n){var r=t(this);e.tag_filters.push(r.val())}))},update_amenities_filters:function(){this.amenities_filters=[];var e=this;t("#views-exposed-form-location-by-amenities-block-1").find("input[type=checkbox]:checked").each((function(n){var r=t(this);e.amenities_filters.push(r.val())}))},apply_filters:function(t){return t=this.apply_tag_filters(t),t=this.apply_distance_filters(t),t=this.apply_amenities_filters(t),this.set_url_parameters(),t},apply_tag_filters:function(e){var n=this.tag_filters.length,r=Object.keys(this.tags).length,i=r>this.default_tags.length;if(0===n||n===r&&i)return e;for(var o=[],a=0;a<e.length;a++)for(var s=e[a],c=0;c<this.tag_filters.length;c++){var l=this.tag_filters[c];t.inArray(l,s.tags)>=0&&o.push(s)}return o},apply_distance_filters:function(t){if(!this.search_center)return t;if(!this.distance_limit||""===this.distance_limit)return t;for(var e=this.search_center,n=[],r=parseFloat(e.lat),i=parseFloat(e.lng),o=this.toRad(r),a=0;a<t.length;a++){var s=t[a],c=parseFloat(s.point.lat),l=parseFloat(s.point.lng),u=this.toRad(c-r),h=this.toRad(l-i),f=this.toRad(c),p=Math.sin(u/2)*Math.sin(u/2)+Math.sin(h/2)*Math.sin(h/2)*Math.cos(o)*Math.cos(f),_=3963*(2*Math.atan2(Math.sqrt(p),Math.sqrt(1-p)));_<=this.distance_limit&&(s.distance=_,n.push(s))}return n},apply_amenities_filters:function(e){if(0===this.amenities_filters.length)return e;for(var n=[],r=0;r<e.length;r++){for(var i=e[r],o=0,a=0;a<this.amenities_filters.length;a++){var s=this.amenities_filters[a];t.inArray(s,i.amenities)>=0&&o++}o===this.amenities_filters.length&&n.push(i)}return n},init_active_tags:function(){if(this.initial_active_tags)return this.initial_active_tags;var e=[],n=this.get_parameters().type,r=n?n.split(","):[];for(var i in this.tags)0===r.length?e.push(i):t.inArray(this.encode_to_url_format(i),r)>=0&&e.push(i);this.initial_active_tags=e,0===r.length&&(this.initial_active_tags=this.default_tags)},get_parameters:function(){for(var t=e.location.search.substring(1).split("&"),n=[],r=0;r<t.length;r++){var i=t[r].split("=");n[unescape(i[0])]=unescape(i[1])}return n},set_url_parameters:function(){for(var n=document.location.pathname,r=this.get_parameters(),i=this.tag_filters,o=this.amenities_filters,a="",s="",c={},u="",h=t(".search_field").val()||r.hasOwnProperty("map_location")&&r.map_location||"",f=0,p=Object.entries(r);f<p.length;f++){var _=l(p[f],2),d=_[0],g=_[1];"utm"===d.split("_")[0]&&(c[d]=g)}Object.keys(c).length&&(u="&",u+=jQuery.param(c)),h&&(h="?map_location="+this.encode_to_url_format(h)),i&&(a=h?"&":"?",a+="type=",i.forEach((function(t){a+=this.encode_to_url_format(t)+","}),this,a),a=a.substring(0,a.length-1)),o&&(s="&",s+="amenities=",o.forEach((function(t){s+=this.encode_to_url_format(t)+","}),this,s),s=s.substring(0,s.length-1)),e.history.replaceState(null,null,n+h+a+s+u)},draw_map_controls:function(){this.init_active_tags();var e="";if("list-checkboxes"==this.tags_style){e='<select id="tag-filter" class="form-control multiselect" name="tag_filter" multiple="multiple">';var n=Object.keys(this.tags).sort();n.splice(n.indexOf("YMCA"),1),n.splice(n.indexOf("Camps"),1),n.unshift("Camps"),n.unshift("YMCA"),n.forEach((function(n){var r="";t.inArray(n,this.initial_active_tags)>=0&&(r="selected"),e+='<option value="'+n+'" '+r+">"+n+"</option>"}),this),e+="</select>"}else for(var r in this.tags){var i="";t.inArray(r,this.initial_active_tags)>=0&&(i='checked="checked"');var o='<label class="btn btn-default" for="tag_'+r+'">';o+='<input autocomplete="off" id="tag_'+r+'" class="tag_'+r+'" type="checkbox" value="'+r+'" '+i+"/>"+r;for(var a=0;a<this.tags[r].marker_icons.length;a++)o+='<img class="tag_icon inline-hidden-sm" src="'+this.tags[r].marker_icons[a]+'" aria-hidden="true" />';e+=o+="</label>"}this.map_controls_el.find(".tag_filters").append(e),"list-checkboxes"==this.tags_style&&t(".tag_filters .multiselect").multiselect({columns:1,showCheckbox:!0,minHeight:50,texts:{placeholder:"Select options"},onOptionClick:t.proxy(this.filter_change,this)});var s=[];this.locations.forEach((function(t){s.push(t.name)})),this.search_field_el.autocomplete({minLength:3,source:s})},encode_to_url_format:function(t){return t.toLowerCase().replace(/[^\w ]+/g,"").replace(/ +/g,"-")},draw_map_locations:function(){var t=this.apply_filters(this.locations);if(0!==t.length){for(var e=L.latLngBounds([]),n=0;n<t.length;n++){var r=t[n];e.extend(r.point),r.marker.addTo(this.map)}if(e.getNorthEast().equals(e.getSouthWest())){var i=L.latLng(e.getNorthEast().lat+.001,e.getNorthEast().lng+.001),o=L.latLng(e.getNorthEast().lat-.001,e.getNorthEast().lng-.001);e.extend(i),e.extend(o)}this.map.fitBounds(e,this.fitBoundsOptions)}else null!==this.search_center_point&&this.map.setView(this.search_center_point)},redraw_map_locations:function(){for(var t=0;t<this.locations.length;t++){this.locations[t].marker.removeFrom(this.map)}this.draw_map_locations()},draw_list_locations:function(){for(var e=this.apply_filters(this.locations),r=0;r<this.locations.length;r++)void 0!==this.locations[r].element&&(this.locations[r].element.hide(),t(this.locations[r].element).parents(".locations-list").find(".location-title").hide());if(e.length){this.messages_el.hide();for(var i=0;i<e.length;i++)void 0!==e[i].element&&(e[i].element.show(),t(e[i].element).parents(".locations-list").find(".location-title").show())}else{var o='<div class="col-xs-12 text-center"><p>'+n.t("No locations were found in this area. Please try a different area or increase your search distance.")+"</p></div>";this.messages_el.hide().html(o).fadeIn()}},draw_list_location:function(t){return t.markup},draw_map_location:function(t){return this.draw_list_location(t)},init_map_locations:function(){for(var e=this.locations,n=["iconSize","shadowSize","iconAnchor","shadowAnchor","popupAnchor"],r=0;r<e.length;r++){var i=e[r];i.point=L.latLng(i.lat,i.lng);var o='<div class="marker_tooltip">'+this.draw_map_location(i)+"</div>",a={iconUrl:i.icon,iconSize:[32,42],iconAnchor:[16,38],popupAnchor:[0,-36]};t(n).each((function(t){void 0!==i[t]&&(a[t]=i[t])}));var s=i.icon?L.icon(a):new L.Icon.Default,c=L.marker(i.point,{icon:s});c.bindPopup(o,{maxWidth:180}).openPopup(),i.marker=c}},draw_search_center:function(){this.search_center_point&&(this.search_center_marker.setLatLng(this.search_center_point),this.search_center_marker.addTo(this.map))},bar_filter_change:function(e){var n=t(e.currentTarget),r=this.map_controls_el.find("input."+n.attr("class")+"[type=checkbox]");this.map_controls_el.find("input[type=checkbox]").prop("checked",!1),this.component_el.find("nav.types input[type=checkbox]").prop("checked",!1),this.component_el.find("nav.types label").removeClass("checked"),r.prop("checked",!0),n.prop("checked",!0),n.parents("label").addClass("checked"),this.filter_change()}}},n.behaviors.openyMap={attach:function(e,r){if(void 0!==r.openyMap&&void 0!==r.openyMapSettings){var i,o=r.openyMap;switch(r.openyMapSettings.engine){case"gmaps":i=new n.openyMap;break;case"leaflet":default:switch((i=new n.openyMapLeaflet).default_search_location=r.openyMapSettings.default_location,i.search_icon=r.openyMapSettings.search_icon,i.search_icon_retina=r.openyMapSettings.search_icon_retina,r.openyMapSettings.base_layer){case"Esri.WorldStreetMap":i.baseLayer=n.baseLayerEsriWorldStreetMap;break;case"Esri.NatGeoWorldMap":i.baseLayer=n.baseLayerEsriNatGeoWorldMap;break;case"OpenStreetMap.Mapnik":i.baseLayer=n.baseLayerOpenStreetMapMapnik;break;case"Wikimedia":i.baseLayer=n.baseLayerWikimedia}var a=r.openyMapSettings.base_layer_override;a.enable&&a.pattern&&(i.baseLayer.tilePattern=a.pattern)}t(".locations-list .node--view-mode-teaser").each((function(){for(var e=t(this),n=0;n<o.length;n++)void 0!==o[n]&&"undefined"!==e.find(".location-item--title")[0].innerText&&t.trim(e.find(".location-item--title")[0].innerText).toLowerCase()==t.trim(o[n].name).toLocaleLowerCase()&&(o[n].element={},o[n].element=e.parent(),o[n].amenities=[],o[n].amenities=e.data("amenities"))})),t(".openy-map-canvas",e).once().each((function(){var e=t(this),n=setInterval((function(){i.libraryIsLoaded()&&(i.init({component_el:e.closest(".openy-map-wrapper"),map_data:o,tags_style:e.closest(".location-finder-filters").attr("data-tags-style")}),r.openyMap=[],clearInterval(n))}),100)}))}}}}(jQuery,window,Drupal,drupalSettings)}]);;
/**
 * Display a nice easy to use multiselect list
 * @Version: 2.3.9
 * @Author: Patrick Springstubbe
 * @Contact: @JediNobleclem
 * @Website: springstubbe.us
 * @Source: https://github.com/nobleclem/jQuery-MultiSelect
 * @Notes: If select list is hidden on page load use the jquery.actual plugin
 *     to resolve issues with preselected items placeholder text
 *     https://github.com/dreamerslab/jquery.actual
 *
 * Usage:
 *   $('select[multiple]').multiselect();
 *   $('select[multiple]').multiselect({ texts: { placeholder: 'Select options' } });
 *   $('select[multiple]').multiselect('reload');
 *   $('select[multiple]').multiselect( 'loadOptions', [{
 *     name   : 'Option Name 1',
 *     value  : 'option-value-1',
 *     checked: false,
 *     attributes : {
 *       custom1: 'value1',
 *       custom2: 'value2'
 *     }
 *   },{
 *     name   : 'Option Name 2',
 *     value  : 'option-value-2',
 *     checked: false,
 *     attributes : {
 *       custom1: 'value1',
 *       custom2: 'value2'
 *     }
 *   }]);
 *
 **/
(function($){
  var defaults = {
    columns     : 1,        // how many columns should be use to show options
    search    : false,      // include option search box
    // search filter options
    searchOptions : {
      delay    : 250,          // time (in ms) between keystrokes until search happens
      showOptGroups: false,        // show option group titles if no options remaining
      onSearch   : function( element ){} // fires on keyup before search on options happens
    },
    texts: {
      placeholder:   'Select options', // text to use in dummy input
      search:      'Search',     // search input placeholder text
      selectedOptions: ' selected',    // selected suffix text
      selectAll:     'Select all',   // select all text
      unselectAll:   'Unselect all',   // unselect all text
      noneSelected:  'None Selected'   // None selected text
    },
    selectAll   : false, // add select all option
    selectGroup   : false, // select entire optgroup
    minHeight   : 200,   // minimum height of option overlay
    maxHeight   : null,  // maximum height of option overlay
    showCheckbox  : true,  // display the checkbox to the user
    jqActualOpts  : {},  // options for jquery.actual
    optionAttributes: [],  // attributes to copy to the checkbox from the option element

    // Callbacks
    onLoad    : function( element ) {},  // fires at end of list initialization
    onOptionClick : function( element, option ){}, // fires when an option is clicked
    onControlClose: function( element ){}, // fires when the options list is closed

    // @NOTE: these are for future development
    maxWidth    : null,  // maximum width of option overlay (or selector)
    minSelect   : false, // minimum number of items that can be selected
    maxSelect   : false, // maximum number of items that can be selected
  };

  var msCounter = 1;

  // FOR LEGACY BROWSERS (talking to you IE8)
  if( typeof Array.prototype.map !== 'function' ) {
    Array.prototype.map = function( callback, thisArg ) {
      if( typeof thisArg === 'undefined' ) {
        thisArg = this;
      }

      return $.isArray( thisArg ) ? $.map( thisArg, callback ) : [];
    };
  }
  if( typeof String.prototype.trim !== 'function' ) {
    String.prototype.trim = function() {
      return this.replace(/^\s+|\s+$/g, '');
    }
  }

  function MultiSelect( element, options )
  {
    this.element = element;
    this.options = $.extend( true, {}, defaults, options );
    this.updatePlaceholder = true;

    /** BACKWARDS COMPATIBILITY **/
    if( 'placeholder' in this.options ) {
      this.options.texts.placeholder = this.options.placeholder;
      delete this.options.placeholder;
    }
    if( 'default' in this.options.searchOptions ) {
      this.options.texts.search = this.options.searchOptions['default'];
      delete this.options.searchOptions['default'];
    }
    /** END BACKWARDS COMPATIBILITY **/

    // load this instance
    this.load();
  }

  MultiSelect.prototype = {
    /* LOAD CUSTOM MULTISELECT DOM/ACTIONS */
    load: function() {
      var instance = this;

      // make sure this is a select list and not loaded
      if( (instance.element.nodeName != 'SELECT') || $(instance.element).hasClass('jqmsLoaded') ) {
        return true;
      }

      // sanity check so we don't double load on a select element
      $(instance.element).addClass('jqmsLoaded').data( 'plugin_multiselect-instance', instance );

      // add option container
      $(instance.element).after('<div class="ms-options-wrap"><button>None Selected</button><div class="ms-options"><ul></ul></div></div>');

      var placeholder = $(instance.element).next('.ms-options-wrap').find('> button:first-child');
      var optionsWrap = $(instance.element).next('.ms-options-wrap').find('> .ms-options');
      var optionsList = optionsWrap.find('> ul');
      var hasOptGroup = $(instance.element).find('optgroup').length ? true : false;

      // don't show checkbox (add class for css to hide checkboxes)
      if( !instance.options.showCheckbox ) {
        optionsWrap.addClass('hide-checkbox');
      }

      // check if list is disabled
      if( $(instance.element).prop( 'disabled' ) ) {
        placeholder.prop( 'disabled', true );
      }

      // determine maxWidth
      var maxWidth = null;
      if( typeof instance.options.width == 'number' ) {
        optionsWrap.parent().css( 'position', 'relative' );
        maxWidth = instance.options.width;
      }
      else if( typeof instance.options.width == 'string' ) {
        $( instance.options.width ).css( 'position', 'relative' );
        maxWidth = '100%';
      }
      else {
        optionsWrap.parent().css( 'position', 'relative' );
      }

      // cacl default maxHeight
      var maxHeight = ($(window).height() - optionsWrap.offset().top + $(window).scrollTop() - 20);

      // override with user defined maxHeight
      if( instance.options.maxHeight ) {
        maxHeight = instance.options.maxHeight;
      }

      // maxHeight cannot be less than options.minHeight
      maxHeight = maxHeight < instance.options.minHeight ? instance.options.minHeight : maxHeight;

      optionsWrap.css({
        maxWidth : maxWidth,
        minHeight: instance.options.minHeight,
        maxHeight: maxHeight,
        overflow : 'auto'
      }).hide();

      // isolate options scroll
      // @source: https://github.com/nobleclem/jQuery-IsolatedScroll
      optionsWrap.bind( 'touchmove mousewheel DOMMouseScroll', function ( e ) {
        if( ($(this).outerHeight() < $(this)[0].scrollHeight) ) {
          var e0 = e.originalEvent,
            delta = e0.wheelDelta || -e0.detail;

          if( ($(this).outerHeight() + $(this)[0].scrollTop) > $(this)[0].scrollHeight ) {
            e.preventDefault();
            this.scrollTop += ( delta < 0 ? 1 : -1 );
          }
        }
      });

      // hide options menus if click happens off of the list placeholder button
      $(document).off('click.ms-hideopts').on('click.ms-hideopts', function( event ){
        if( !$(event.target).closest('.ms-options-wrap').length ) {
          if( $('.ms-options-wrap > .ms-options:visible').length ) {
            $('.ms-options-wrap > .ms-options:visible').each(function(){
              $(this).hide();

              var thisInst = $(this).parent().prev('.jqmsLoaded').data('plugin_multiselect-instance');

              // USER CALLBACK
              if( typeof thisInst.options.onControlClose == 'function' ) {
                thisInst.options.onControlClose( thisInst.element );
              }
            });
          }
        }
      });

      // disable button action
      placeholder.bind('mousedown',function( event ){
        // ignore if its not a left click
        if( event.which != 1 ) {
          return true;
        }

        // hide other menus before showing this one
        $('.ms-options-wrap > .ms-options:visible').each(function(){
          if( $(this).parent().prev()[0] != optionsWrap.parent().prev()[0] ) {
            $(this).hide();

            var thisInst = $(this).parent().prev('.jqmsLoaded').data('plugin_multiselect-instance');

            // USER CALLBACK
            if( typeof thisInst.options.onControlClose == 'function' ) {
              thisInst.options.onControlClose( thisInst.element );
            }
          }
        });

        // show/hide options
        optionsWrap.toggle();

        // recalculate height
        if( optionsWrap.is(':visible') ) {
          optionsWrap.css( 'maxHeight', '' );

          // cacl default maxHeight
          var maxHeight = ($(window).height() - optionsWrap.offset().top + $(window).scrollTop() - 20);

          // override with user defined maxHeight
          if( instance.options.maxHeight ) {
            maxHeight = instance.options.maxHeight;
          }

          // maxHeight cannot be less than options.minHeight
          maxHeight = maxHeight < instance.options.minHeight ? instance.options.minHeight : maxHeight;

          optionsWrap.css( 'maxHeight', maxHeight );
        }
        else if( typeof instance.options.onControlClose == 'function' ) {
          instance.options.onControlClose( instance.element );
        }
      }).click(function( event ){ event.preventDefault(); });

      // add placeholder copy
      if( instance.options.texts.placeholder ) {
        placeholder.text( instance.options.texts.placeholder );
      }

      // add search box
      if( instance.options.search ) {
        optionsList.before('<div class="ms-search"><input type="text" value="" placeholder="'+ instance.options.texts.search +'" /></div>');

        var search = optionsWrap.find('.ms-search input');
        search.on('keyup', function(){
          // ignore keystrokes that don't make a difference
          if( $(this).data('lastsearch') == $(this).val() ) {
            return true;
          }

          // pause timeout
          if( $(this).data('searchTimeout') ) {
            clearTimeout( $(this).data('searchTimeout') );
          }

          var thisSearchElem = $(this);

          $(this).data('searchTimeout', setTimeout(function(){
            thisSearchElem.data('lastsearch', thisSearchElem.val() );

            // USER CALLBACK
            if( typeof instance.options.searchOptions.onSearch == 'function' ) {
              instance.options.searchOptions.onSearch( instance.element );
            }

            // search non optgroup li's
            optionsList.find('li:not(.optgroup)').each(function(){
              var optText = $(this).text();

              // show option if string exists
              if( optText.toLowerCase().indexOf( search.val().toLowerCase() ) > -1 ) {
                $(this).show();
              }
              // don't hide selected items
              else if( !$(this).hasClass('selected') ) {
                $(this).hide();
              }

              // hide / show optgroups depending on if options within it are visible
              var optGroup = $(this).closest('li.optgroup');
              if( !instance.options.searchOptions.showOptGroups && optGroup ) {
                optGroup.show();

                if( optGroup.find('li:visible').length ) {
                  optGroup.show();
                }
                else {
                  optGroup.hide();
                }
              }
            });

            instance._updateSelectAllText();
          }, instance.options.searchOptions.delay ));
        });
      }

      // add global select all options
      if( instance.options.selectAll ) {
        optionsList.before('<a href="#" class="ms-selectall global">' + instance.options.texts.selectAll + '</a>');
      }

      // handle select all option
      optionsWrap.on('click', '.ms-selectall', function( event ){
        event.preventDefault();

        instance.updatePlaceholder = false;

        if( $(this).hasClass('global') ) {
          // check if any options are not selected if so then select them
          if( optionsList.find('li:not(.optgroup)').filter(':not(.selected)').filter(':visible').length ) {
            optionsList.find('li:not(.optgroup)').filter(':not(.selected)').filter(':visible').find('input[type="checkbox"]').trigger('click');
          }
          // deselect everything
          else {
            optionsList.find('li:not(.optgroup).selected:visible input[type="checkbox"]').trigger('click');
          }
        }
        else if( $(this).closest('li').hasClass('optgroup') ) {
          var optgroup = $(this).closest('li.optgroup');

          // check if any selected if so then select them
          if( optgroup.find('li:not(.selected)').filter(':visible').length ) {
            optgroup.find('li:not(.selected):visible input[type="checkbox"]').trigger('click');
          }
          // deselect everything
          else {
            optgroup.find('li.selected:visible input[type="checkbox"]').trigger('click');
          }
        }

        instance._updateSelectAllText();

        instance.updatePlaceholder = true;

        instance._updatePlaceholderText();
      });

      // add options to wrapper
      var options = [];
      $(instance.element).children().each(function(){
        if( this.nodeName == 'OPTGROUP' ) {
          var groupOptions = [];

          $(this).children('option').each(function(){
            var thisOptionAtts = {};
            for( var i = 0; i < instance.options.optionAttributes.length; i++ ) {
              var thisOptAttr = instance.options.optionAttributes[ i ];

              if( $(this).attr( thisOptAttr ) !== undefined ) {
                thisOptionAtts[ thisOptAttr ] = $(this).attr( thisOptAttr );
              }
            }

            groupOptions.push({
              name   : $(this).text(),
              value  : $(this).val(),
              checked: $(this).prop( 'selected' ),
              attributes: thisOptionAtts
            });
          });

          options.push({
            label  : $(this).attr('label'),
            options: groupOptions
          });
        }
        else if( this.nodeName == 'OPTION' ) {
          var thisOptionAtts = {};
          for( var i = 0; i < instance.options.optionAttributes.length; i++ ) {
            var thisOptAttr = instance.options.optionAttributes[ i ];

            if( $(this).attr( thisOptAttr ) !== undefined ) {
              thisOptionAtts[ thisOptAttr ] = $(this).attr( thisOptAttr );
            }
          }

          options.push({
            name    : $(this).text(),
            value   : $(this).val(),
            checked   : $(this).prop( 'selected' ),
            attributes: thisOptionAtts
          });
        }
        else {
          // bad option
          return true;
        }
      });
      instance.loadOptions( options, true, false );

      // update un/select all logic
      instance._updateSelectAllText( false );

      // BIND SELECT ACTION
      optionsWrap.on( 'click', 'input[type="checkbox"]', function(){
        $(this).closest( 'li' ).toggleClass( 'selected' );

        var select = optionsWrap.parent().prev();

        // toggle clicked option
        select.find('option[value="'+ $(this).val() +'"]').prop(
          'selected', $(this).is(':checked')
        ).closest('select').trigger('change');

        // USER CALLBACK
        if( typeof instance.options.onOptionClick == 'function' ) {
          instance.options.onOptionClick(instance.element, this);
        }

        instance._updateSelectAllText();
        instance._updatePlaceholderText();
      });

      // BIND FOCUS EVENT
      optionsWrap.on('focusin', 'input[type="checkbox"]', function(){
        $(this).closest('label').addClass('focused');
      }).on('focusout', 'input[type="checkbox"]', function(){
        $(this).closest('label').removeClass('focused');
      });

      // USER CALLBACK
      if( typeof instance.options.onLoad === 'function' ) {
        instance.options.onLoad( instance.element );
      }

      // hide native select list
      $(instance.element).hide();
    },

    /* LOAD SELECT OPTIONS */
    loadOptions: function( options, overwrite, updateSelect ) {
      overwrite  = (typeof overwrite == 'boolean') ? overwrite : true;
      updateSelect = (typeof updateSelect == 'boolean') ? updateSelect : true;

      var instance  = this;
      var optionsList = $(instance.element).next('.ms-options-wrap').find('> .ms-options > ul');
      var optionsWrap = $(instance.element).next('.ms-options-wrap').find('> .ms-options');
      var select    = optionsWrap.parent().prev();

      if( overwrite ) {
        optionsList.find('> li').remove();

        if( updateSelect ) {
          select.find('> *').remove();
        }
      }

      for( var key in options ) {
        // Prevent prototype methods injected into options from being iterated over.
        if( !options.hasOwnProperty( key ) ) {
          continue;
        }

        var thisOption    = options[ key ];
        var container     = $('<li></li>');
        var appendContainer = true;

        // OPTGROUP
        if( thisOption.hasOwnProperty('options') ) {
          optionsList.find('> li.optgroup > span.label').each(function(){
            if( $(this).text() == thisOption.label ) {
              container     = $(this).closest('.optgroup');
              appendContainer = false;
            }
          });

          // prepare to append optgroup to select element
          if( updateSelect ) {
            if( select.find('optgroup[label="'+ thisOption.label +'"]').length ) {
              var optGroup = select.find('optgroup[label="'+ thisOption.label +'"]');
            }
            else {
              var optGroup = $('<optgroup label="'+ thisOption.label +'"></optgroup>');
              select.append( optGroup );
            }
          }

          // setup container
          if( appendContainer ) {
            container.addClass('optgroup');
            container.append('<span class="label">'+ thisOption.label +'</span>');
            container.find('> .label').css({
              clear: 'both'
            });

            // add select all link
            if( instance.options.selectGroup ) {
              container.append('<a href="#" class="ms-selectall">' + instance.options.texts.selectAll + '</a>')
            }

            container.append('<ul></ul>');
          }

          for( var gKey in thisOption.options ) {
            // Prevent prototype methods injected into options from
            // being iterated over.
            if( !thisOption.options.hasOwnProperty( gKey ) ) {
              continue;
            }

            var thisGOption = thisOption.options[ gKey ];
            var gContainer  = $('<li></li>').addClass('ms-reflow');

            // no clue what this is we hit (skip)
            if( !thisGOption.hasOwnProperty('value') ) {
              continue;
            }

            instance._addOption( gContainer, thisGOption );

            container.find('> ul').append( gContainer );

            // add option to optgroup in select element
            if( updateSelect ) {
              var selOption = $('<option value="'+ thisGOption.value +'">'+ thisGOption.name +'</option>');

              // add custom user attributes
              if( thisGOption.hasOwnProperty('attributes') && Object.keys( thisGOption.attributes ).length ) {
                //selOption.attr( thisGOption.attributes );
              }

              // mark option as selected
              if( thisGOption.checked ) {
                selOption.prop( 'selected', true );
              }

              optGroup.append( selOption );
            }
          }
        }
        // OPTION
        else if( thisOption.hasOwnProperty('value') ) {
          container.addClass('ms-reflow')

          // add option to ms dropdown
          instance._addOption( container, thisOption );

          if( updateSelect ) {
            var selOption = $('<option value="'+ thisOption.value +'">'+ thisOption.name +'</option>');

            // add custom user attributes
            if( thisOption.hasOwnProperty('attributes') && Object.keys( thisOption.attributes ).length ) {
              selOption.attr( thisOption.attributes );
            }

            // mark option as selected
            if( thisOption.checked ) {
              selOption.prop( 'selected', true );
            }

            select.append( selOption );
          }
        }
        else {
          // no clue what this is we hit (skip)
          continue;
        }

        if( appendContainer ) {
          optionsList.append( container );
        }
      }

      optionsList.find('.ms-reflow input[type="checkbox"]').each(function( idx ){
        if( $(this).css('display').match(/block$/) ) {
          var checkboxWidth = $(this).outerWidth();
          checkboxWidth = checkboxWidth ? checkboxWidth : 15;

          $(this).closest('label').css(
            'padding-left',
            (parseInt( $(this).closest('label').css('padding-left') ) * 2) + checkboxWidth
          );

          $(this).closest('.ms-reflow').removeClass('ms-reflow');
        }
      });

      // update placeholder text
      instance._updatePlaceholderText();

      // RESET COLUMN STYLES
      optionsWrap.find('ul').css({
        'column-count'    : '',
        'column-gap'      : '',
        '-webkit-column-count': '',
        '-webkit-column-gap'  : '',
        '-moz-column-count'   : '',
        '-moz-column-gap'   : ''
      });

      // COLUMNIZE
      if( select.find('optgroup').length ) {
        // float non grouped options
        optionsList.find('> li:not(.optgroup)').css({
          'float': 'left',
          width: (100 / instance.options.columns) +'%'
        });

        // add CSS3 column styles
        optionsList.find('li.optgroup').css({
          clear: 'both'
        }).find('> ul').css({
          'column-count'    : instance.options.columns,
          'column-gap'      : 0,
          '-webkit-column-count': instance.options.columns,
          '-webkit-column-gap'  : 0,
          '-moz-column-count'   : instance.options.columns,
          '-moz-column-gap'   : 0
        });

        // for crappy IE versions float grouped options
        if( this._ieVersion() && (this._ieVersion() < 10) ) {
          optionsList.find('li.optgroup > ul > li').css({
            'float': 'left',
            width: (100 / instance.options.columns) +'%'
          });
        }
      }
      else {
        // add CSS3 column styles
        optionsList.css({
          'column-count'    : instance.options.columns,
          'column-gap'      : 0,
          '-webkit-column-count': instance.options.columns,
          '-webkit-column-gap'  : 0,
          '-moz-column-count'   : instance.options.columns,
          '-moz-column-gap'   : 0
        });

        // for crappy IE versions float grouped options
        if( this._ieVersion() && (this._ieVersion() < 10) ) {
          optionsList.find('> li').css({
            'float': 'left',
            width: (100 / instance.options.columns) +'%'
          });
        }
      }
    },

    /* UPDATE MULTISELECT CONFIG OPTIONS */
    settings: function( options ) {
      this.options = $.extend( true, {}, this.options, options );
      this.reload();
    },

    /* RESET THE DOM */
    unload: function() {
      $(this.element).next('.ms-options-wrap').remove();
      $(this.element).show(function(){
        $(this).css('display','').removeClass('jqmsLoaded');
      });
    },

    /* RELOAD JQ MULTISELECT LIST */
    reload: function() {
      // remove existing options
      $(this.element).next('.ms-options-wrap').remove();
      $(this.element).removeClass('jqmsLoaded');

      // load element
      this.load();
    },

    // RESET BACK TO DEFAULT VALUES & RELOAD
    reset: function() {
      var defaultVals = [];
      $(this.element).find('option').each(function(){
        if( $(this).prop('defaultSelected') ) {
          defaultVals.push( $(this).val() );
        }
      });

      $(this.element).val( defaultVals );

      this.reload();
    },

    disable: function( status ) {
      status = (typeof status !== 'boolean') ? true : false;
      $(this.element).prop( 'disabled', status );
      $(this.element).next('.ms-options-wrap').find('button:first-child')
        .prop( 'disabled', status );
    },

    /** PRIVATE FUNCTIONS **/
    // update the un/select all texts based on selected options and visibility
    _updateSelectAllText: function( visibleOnly ){
      if( typeof visibleOnly !== 'boolean' ) {
        visibleOnly = true;
      }

      var instance = this;

      // select all not used at all so just do nothing
      if( !instance.options.selectAll && !instance.options.selectGroup ) {
        return;
      }

      var optionsWrap = $(instance.element).next('.ms-options-wrap').find('> .ms-options');

      // update un/select all text
      optionsWrap.find('.ms-selectall').each(function(){
        var unselected = $(this).parent().find('li:not(.optgroup)').filter(':not(.selected)');

        // filter out visible options
        if( visibleOnly ) {
          unselected = unselected.filter(':visible');
        }

        $(this).text(
          unselected.length ? instance.options.texts.selectAll : instance.options.texts.unselectAll
        );
      });
    },

    // update selected placeholder text
    _updatePlaceholderText: function(){
      if( !this.updatePlaceholder ) {
        return;
      }

      var instance  = this;
      var placeholder = $(instance.element).next('.ms-options-wrap').find('> button:first-child');
      var optionsWrap = $(instance.element).next('.ms-options-wrap').find('> .ms-options');
      var select    = optionsWrap.parent().prev();

      // get selected options
      var selOpts = [];
      select.find('option:selected').each(function(){
        selOpts.push( $(this).text() );
      });

      // UPDATE PLACEHOLDER TEXT WITH OPTIONS SELECTED
      placeholder.text( selOpts.join( ', ' ) );
      var copy = placeholder.clone().css({
        display   : 'inline',
        width   : 'auto',
        visibility: 'hidden'
      }).appendTo( optionsWrap.parent() );

      // if the jquery.actual plugin is loaded use it to get the widths
      var copyWidth  = (typeof $.fn.actual !== 'undefined') ? copy.actual( 'width', instance.options.jqActualOpts ) : copy.width();
      var placeWidth = (typeof $.fn.actual !== 'undefined') ? placeholder.actual( 'width', instance.options.jqActualOpts ) : placeholder.width();

      // if copy is larger than button width use "# selected"
      if( copyWidth > placeWidth ) {
        placeholder.text( selOpts.length + instance.options.texts.selectedOptions );
      }
      // if options selected then use those
      else if( selOpts.length ) {
        // trim each element in case of extra spaces
        placeholder.text(
          selOpts.map(function( element ){
            return element.trim();
          }).join(', ')
        );
      }
      // replace placeholder text
      else {
        placeholder.text( instance.options.texts.placeholder );
      }

      // remove dummy element
      copy.remove();
    },

    // Add option to the custom dom list
    _addOption: function( container, option ) {
      container.text( option.name );

      var thisCheckbox = $('<input type="checkbox" value="" title="" />')
        .val( option.value )
        .attr( 'title', option.name )
        .attr( 'id', 'ms-opt-'+ msCounter );

      // add user defined attributes
      if( option.hasOwnProperty('attributes') && Object.keys( option.attributes ).length ) {
        thisCheckbox.attr( option.attributes );
      }

      container.prepend( thisCheckbox );

      if( option.checked ) {
        container.addClass('default');
        container.addClass('selected');
        container.find( 'input[type="checkbox"]' ).prop( 'checked', true );
      }

      var label = $('<label></label>').attr( 'for', 'ms-opt-'+ msCounter );
      container.wrapInner( label );

      msCounter = msCounter + 1;
    },

    // check ie version
    _ieVersion: function() {
      var myNav = navigator.userAgent.toLowerCase();
      return (myNav.indexOf('msie') != -1) ? parseInt(myNav.split('msie')[1]) : false;
    }
  };

  // ENABLE JQUERY PLUGIN FUNCTION
  $.fn.multiselect = function( options ){
    var args = arguments;
    var ret;

    // menuize each list
    if( (options === undefined) || (typeof options === 'object') ) {
      return this.each(function(){
        if( !$.data( this, 'plugin_multiselect' ) ) {
          $.data( this, 'plugin_multiselect', new MultiSelect( this, options ) );
        }
      });
    } else if( (typeof options === 'string') && (options[0] !== '_') && (options !== 'init') ) {
      this.each(function(){
        var instance = $.data( this, 'plugin_multiselect' );

        if( instance instanceof MultiSelect && typeof instance[ options ] === 'function' ) {
          ret = instance[ options ].apply( instance, Array.prototype.slice.call( args, 1 ) );
        }

        // special destruct handler
        if( options === 'unload' ) {
          $.data( this, 'plugin_multiselect', null );
        }
      });

      return ret;
    }
  };
}(jQuery));
;
