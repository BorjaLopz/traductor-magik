import { n as isEmpty, t as clear } from "./obj-BGAAjjDC.js";
//#region node_modules/ol/ObjectEventType.js
/**
* @module ol/ObjectEventType
*/
/**
* @enum {string}
*/
var ObjectEventType_default = { 
/**
* Triggered when a property is changed.
* @event module:ol/Object.ObjectEvent#propertychange
* @api
*/
PROPERTYCHANGE: "propertychange" };
/**
* @typedef {'propertychange'} Types
*/
//#endregion
//#region node_modules/ol/events.js
/**
* @module ol/events
*/
/**
* Key to use with {@link module:ol/Observable.unByKey}.
* @typedef {Object} EventsKey
* @property {ListenerFunction} listener Listener.
* @property {import("./events/Target.js").EventTargetLike} target Target.
* @property {string} type Type.
* @api
*/
/**
* Listener function. This function is called with an event object as argument.
* When the function returns `false`, event propagation will stop.
*
* @typedef {function((Event|import("./events/Event.js").default)): (void|boolean)} ListenerFunction
* @api
*/
/**
* @typedef {Object} ListenerObject
* @property {ListenerFunction} handleEvent HandleEvent listener function.
*/
/**
* @typedef {ListenerFunction|ListenerObject} Listener
*/
/**
* Registers an event listener on an event target. Inspired by
* https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
*
* This function efficiently binds a `listener` to a `this` object, and returns
* a key for use with {@link module:ol/events.unlistenByKey}.
*
* @param {import("./events/Target.js").EventTargetLike} target Event target.
* @param {string} type Event type.
* @param {ListenerFunction} listener Listener.
* @param {Object} [thisArg] Object referenced by the `this` keyword in the
*     listener. Default is the `target`.
* @param {boolean} [once] If true, add the listener as one-off listener.
* @return {EventsKey} Unique key for the listener.
*/
function listen(target, type, listener, thisArg, once) {
	if (once) {
		const originalListener = listener;
		/**
		* @param {Event|import('./events/Event.js').default} event The event
		* @return {void|boolean} When the function returns `false`, event propagation will stop.
		* @this {typeof target}
		*/
		listener = function(event) {
			target.removeEventListener(type, listener);
			return originalListener.call(thisArg ?? this, event);
		};
	} else if (thisArg && thisArg !== target) listener = listener.bind(thisArg);
	const eventsKey = {
		target,
		type,
		listener
	};
	target.addEventListener(type, listener);
	return eventsKey;
}
/**
* Registers a one-off event listener on an event target. Inspired by
* https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
*
* This function efficiently binds a `listener` as self-unregistering listener
* to a `this` object, and returns a key for use with
* {@link module:ol/events.unlistenByKey} in case the listener needs to be
* unregistered before it is called.
*
* When {@link module:ol/events.listen} is called with the same arguments after this
* function, the self-unregistering listener will be turned into a permanent
* listener.
*
* @param {import("./events/Target.js").EventTargetLike} target Event target.
* @param {string} type Event type.
* @param {ListenerFunction} listener Listener.
* @param {Object} [thisArg] Object referenced by the `this` keyword in the
*     listener. Default is the `target`.
* @return {EventsKey} Key for unlistenByKey.
*/
function listenOnce(target, type, listener, thisArg) {
	return listen(target, type, listener, thisArg, true);
}
/**
* Unregisters event listeners on an event target. Inspired by
* https://google.github.io/closure-library/api/source/closure/goog/events/events.js.src.html
*
* The argument passed to this function is the key returned from
* {@link module:ol/events.listen} or {@link module:ol/events.listenOnce}.
*
* @param {EventsKey} key The key.
*/
function unlistenByKey(key) {
	if (key && key.target) {
		key.target.removeEventListener(key.type, key.listener);
		clear(key);
	}
}
//#endregion
//#region node_modules/ol/events/EventType.js
/**
* @module ol/events/EventType
*/
/**
* @enum {string}
* @const
*/
var EventType_default = {
	/**
	* Generic change event. Triggered when the revision counter is increased.
	* @event module:ol/events/Event~BaseEvent#change
	* @api
	*/
	CHANGE: "change",
	/**
	* Generic error event. Triggered when an error occurs.
	* @event module:ol/events/Event~BaseEvent#error
	* @api
	*/
	ERROR: "error",
	BLUR: "blur",
	CLEAR: "clear",
	CONTEXTMENU: "contextmenu",
	CLICK: "click",
	DBLCLICK: "dblclick",
	DRAGENTER: "dragenter",
	DRAGOVER: "dragover",
	DROP: "drop",
	FOCUS: "focus",
	KEYDOWN: "keydown",
	KEYPRESS: "keypress",
	LOAD: "load",
	RESIZE: "resize",
	TOUCHMOVE: "touchmove",
	WHEEL: "wheel"
};
//#endregion
//#region node_modules/ol/Disposable.js
/**
* @module ol/Disposable
*/
/**
* @classdesc
* Objects that need to clean up after themselves.
*/
var Disposable = class {
	constructor() {
		/**
		* The object has already been disposed.
		* @type {boolean}
		* @protected
		*/
		this.disposed = false;
	}
	/**
	* Clean up.
	*/
	dispose() {
		if (!this.disposed) {
			this.disposed = true;
			this.disposeInternal();
		}
	}
	/**
	* Extension point for disposable objects.
	* @protected
	*/
	disposeInternal() {}
};
//#endregion
//#region node_modules/ol/array.js
/**
* @module ol/array
*/
/**
* Performs a binary search on the provided sorted list and returns the index of the item if found. If it can't be found it'll return -1.
* https://github.com/darkskyapp/binary-search
*
* @param {Array<*>} haystack Items to search through.
* @param {*} needle The item to look for.
* @param {Function} [comparator] Comparator function.
* @return {number} The index of the item if found, -1 if not.
*/
function binarySearch(haystack, needle, comparator) {
	let mid, cmp;
	comparator = comparator || ascending;
	let low = 0;
	let high = haystack.length;
	let found = false;
	while (low < high) {
		mid = low + (high - low >> 1);
		cmp = +comparator(haystack[mid], needle);
		if (cmp < 0) low = mid + 1;
		else {
			high = mid;
			found = !cmp;
		}
	}
	return found ? low : ~low;
}
/**
* Compare function sorting arrays in ascending order.  Safe to use for numeric values.
* @param {*} a The first object to be compared.
* @param {*} b The second object to be compared.
* @return {number} A negative number, zero, or a positive number as the first
*     argument is less than, equal to, or greater than the second.
*/
function ascending(a, b) {
	return a > b ? 1 : a < b ? -1 : 0;
}
/**
* Compare function sorting arrays in descending order.  Safe to use for numeric values.
* @param {*} a The first object to be compared.
* @param {*} b The second object to be compared.
* @return {number} A negative number, zero, or a positive number as the first
*     argument is greater than, equal to, or less than the second.
*/
function descending(a, b) {
	return a < b ? 1 : a > b ? -1 : 0;
}
/**
* {@link module:ol/tilegrid/TileGrid~TileGrid#getZForResolution} can use a function
* of this type to determine which nearest resolution to use.
*
* This function takes a `{number}` representing a value between two array entries,
* a `{number}` representing the value of the nearest higher entry and
* a `{number}` representing the value of the nearest lower entry
* as arguments and returns a `{number}`. If a negative number or zero is returned
* the lower value will be used, if a positive number is returned the higher value
* will be used.
* @typedef {function(number, number, number): number} NearestDirectionFunction
* @api
*/
/**
* @param {Array<number>} arr Array in descending order.
* @param {number} target Target.
* @param {number|NearestDirectionFunction} direction
*    0 means return the nearest,
*    > 0 means return the largest nearest,
*    < 0 means return the smallest nearest.
* @return {number} Index.
*/
function linearFindNearest(arr, target, direction) {
	if (arr[0] <= target) return 0;
	const n = arr.length;
	if (target <= arr[n - 1]) return n - 1;
	if (typeof direction === "function") {
		for (let i = 1; i < n; ++i) {
			const candidate = arr[i];
			if (candidate === target) return i;
			if (candidate < target) {
				if (direction(target, arr[i - 1], candidate) > 0) return i - 1;
				return i;
			}
		}
		return n - 1;
	}
	if (direction > 0) {
		for (let i = 1; i < n; ++i) if (arr[i] < target) return i - 1;
		return n - 1;
	}
	if (direction < 0) {
		for (let i = 1; i < n; ++i) if (arr[i] <= target) return i;
		return n - 1;
	}
	for (let i = 1; i < n; ++i) {
		if (arr[i] == target) return i;
		if (arr[i] < target) {
			if (arr[i - 1] - target < target - arr[i]) return i - 1;
			return i;
		}
	}
	return n - 1;
}
/**
* @param {Array<*>} arr Array.
* @param {number} begin Begin index.
* @param {number} end End index.
*/
function reverseSubArray(arr, begin, end) {
	while (begin < end) {
		const tmp = arr[begin];
		arr[begin] = arr[end];
		arr[end] = tmp;
		++begin;
		--end;
	}
}
/**
* @param {Array<VALUE>} arr The array to modify.
* @param {!Array<VALUE>|VALUE} data The elements or arrays of elements to add to arr.
* @template VALUE
*/
function extend(arr, data) {
	const extension = Array.isArray(data) ? data : [data];
	const length = extension.length;
	for (let i = 0; i < length; i++) arr[arr.length] = extension[i];
}
/**
* @param {Array<any>|Uint8ClampedArray} arr1 The first array to compare.
* @param {Array<any>|Uint8ClampedArray} arr2 The second array to compare.
* @return {boolean} Whether the two arrays are equal.
*/
function equals(arr1, arr2) {
	const len1 = arr1.length;
	if (len1 !== arr2.length) return false;
	for (let i = 0; i < len1; i++) if (arr1[i] !== arr2[i]) return false;
	return true;
}
//#endregion
//#region node_modules/ol/functions.js
/**
* @module ol/functions
*/
/**
* Always returns true.
* @return {boolean} true.
*/
function TRUE() {
	return true;
}
/**
* Always returns false.
* @return {boolean} false.
*/
function FALSE() {
	return false;
}
/**
* A reusable function, used e.g. as a default for callbacks.
*
* @return {void} Nothing.
*/
function VOID() {}
/**
* Wrap a function in another function that remembers the last return.  If the
* returned function is called twice in a row with the same arguments and the same
* this object, it will return the value from the first call in the second call.
*
* @param {function(...any): ReturnType} fn The function to memoize.
* @return {function(...any): ReturnType} The memoized function.
* @template ReturnType
*/
function memoizeOne(fn) {
	/** @type {ReturnType} */
	let lastResult;
	/** @type {Array<any>|undefined} */
	let lastArgs;
	let lastThis;
	/**
	* @this {*} Only need to know if `this` changed, don't care what type
	* @return {ReturnType} Memoized value
	*/
	return function() {
		const nextArgs = Array.prototype.slice.call(arguments);
		if (!lastArgs || this !== lastThis || !equals(nextArgs, lastArgs)) {
			lastThis = this;
			lastArgs = nextArgs;
			lastResult = fn.apply(this, arguments);
		}
		return lastResult;
	};
}
/**
* @template T
* @param {function(): (T | Promise<T>)} getter A function that returns a value or a promise for a value.
* @return {Promise<T>} A promise for the value.
*/
function toPromise(getter) {
	function promiseGetter() {
		let value;
		try {
			value = getter();
		} catch (err) {
			return Promise.reject(err);
		}
		if (value instanceof Promise) return value;
		return Promise.resolve(value);
	}
	return promiseGetter();
}
//#endregion
//#region node_modules/ol/events/Event.js
/**
* @module ol/events/Event
*/
/**
* @classdesc
* Stripped down implementation of the W3C DOM Level 2 Event interface.
* See https://www.w3.org/TR/DOM-Level-2-Events/events.html#Events-interface.
*
* This implementation only provides `type` and `target` properties, and
* `stopPropagation` and `preventDefault` methods. It is meant as base class
* for higher level events defined in the library, and works with
* {@link module:ol/events/Target~Target}.
*/
var BaseEvent = class {
	/**
	* @param {string} type Type.
	*/
	constructor(type) {
		/**
		* @type {boolean}
		*/
		this.propagationStopped;
		/**
		* @type {boolean}
		*/
		this.defaultPrevented;
		/**
		* The event type.
		* @type {string}
		* @api
		*/
		this.type = type;
		/**
		* The event target.
		* @type {Object}
		* @api
		*/
		this.target = null;
	}
	/**
	* Prevent default. This means that no emulated `click`, `singleclick` or `doubleclick` events
	* will be fired.
	* @api
	*/
	preventDefault() {
		this.defaultPrevented = true;
	}
	/**
	* Stop event propagation.
	* @api
	*/
	stopPropagation() {
		this.propagationStopped = true;
	}
};
//#endregion
//#region node_modules/ol/events/Target.js
/**
* @module ol/events/Target
*/
/**
* @typedef {EventTarget|Target} EventTargetLike
*/
/**
* @classdesc
* A simplified implementation of the W3C DOM Level 2 EventTarget interface.
* See https://www.w3.org/TR/2000/REC-DOM-Level-2-Events-20001113/events.html#Events-EventTarget.
*
* There are two important simplifications compared to the specification:
*
* 1. The handling of `useCapture` in `addEventListener` and
*    `removeEventListener`. There is no real capture model.
* 2. The handling of `stopPropagation` and `preventDefault` on `dispatchEvent`.
*    There is no event target hierarchy. When a listener calls
*    `stopPropagation` or `preventDefault` on an event object, it means that no
*    more listeners after this one will be called. Same as when the listener
*    returns false.
*/
var Target = class extends Disposable {
	/**
	* @param {*} [target] Default event target for dispatched events.
	*/
	constructor(target) {
		super();
		/**
		* @private
		* @type {*}
		*/
		this.eventTarget_ = target;
		/**
		* @private
		* @type {Object<string, number>|null}
		*/
		this.pendingRemovals_ = null;
		/**
		* @private
		* @type {Object<string, number>|null}
		*/
		this.dispatching_ = null;
		/**
		* @private
		* @type {Object<string, Array<import("../events.js").Listener>>|null}
		*/
		this.listeners_ = null;
	}
	/**
	* @param {string} type Type.
	* @param {import("../events.js").Listener} listener Listener.
	*/
	addEventListener(type, listener) {
		if (!type || !listener) return;
		const listeners = this.listeners_ || (this.listeners_ = {});
		const listenersForType = listeners[type] || (listeners[type] = []);
		if (!listenersForType.includes(listener)) listenersForType.push(listener);
	}
	/**
	* Dispatches an event and calls all listeners listening for events
	* of this type. The event parameter can either be a string or an
	* Object with a `type` property.
	*
	* @param {import("./Event.js").default|string} event Event object.
	* @return {boolean|undefined} `false` if anyone called preventDefault on the
	*     event object or if any of the listeners returned false.
	* @api
	*/
	dispatchEvent(event) {
		const isString = typeof event === "string";
		const type = isString ? event : event.type;
		const listeners = this.listeners_ && this.listeners_[type];
		if (!listeners) return;
		const evt = isString ? new BaseEvent(event) : event;
		if (!evt.target) evt.target = this.eventTarget_ || this;
		const dispatching = this.dispatching_ || (this.dispatching_ = {});
		const pendingRemovals = this.pendingRemovals_ || (this.pendingRemovals_ = {});
		if (!(type in dispatching)) {
			dispatching[type] = 0;
			pendingRemovals[type] = 0;
		}
		++dispatching[type];
		let propagate;
		for (let i = 0, ii = listeners.length; i < ii; ++i) {
			if ("handleEvent" in listeners[i]) propagate = listeners[i].handleEvent(evt);
			else propagate = listeners[i].call(this, evt);
			if (propagate === false || evt.propagationStopped) {
				propagate = false;
				break;
			}
		}
		if (--dispatching[type] === 0) {
			let pr = pendingRemovals[type];
			delete pendingRemovals[type];
			while (pr--) this.removeEventListener(type, VOID);
			delete dispatching[type];
		}
		return propagate;
	}
	/**
	* Clean up.
	* @override
	*/
	disposeInternal() {
		this.listeners_ && clear(this.listeners_);
	}
	/**
	* Get the listeners for a specified event type. Listeners are returned in the
	* order that they will be called in.
	*
	* @param {string} type Type.
	* @return {Array<import("../events.js").Listener>|undefined} Listeners.
	*/
	getListeners(type) {
		return this.listeners_ && this.listeners_[type] || void 0;
	}
	/**
	* @param {string} [type] Type. If not provided,
	*     `true` will be returned if this event target has any listeners.
	* @return {boolean} Has listeners.
	*/
	hasListener(type) {
		if (!this.listeners_) return false;
		return type ? type in this.listeners_ : Object.keys(this.listeners_).length > 0;
	}
	/**
	* @param {string} type Type.
	* @param {import("../events.js").Listener} listener Listener.
	*/
	removeEventListener(type, listener) {
		if (!this.listeners_) return;
		const listeners = this.listeners_[type];
		if (!listeners) return;
		const index = listeners.indexOf(listener);
		if (index !== -1) if (this.pendingRemovals_ && type in this.pendingRemovals_) {
			listeners[index] = VOID;
			++this.pendingRemovals_[type];
		} else {
			listeners.splice(index, 1);
			if (listeners.length === 0) delete this.listeners_[type];
		}
	}
};
//#endregion
//#region node_modules/ol/Observable.js
/**
* @module ol/Observable
*/
/***
* @template {string} Type
* @template {Event|import("./events/Event.js").default} EventClass
* @template Return
* @typedef {(type: Type, listener: (event: EventClass) => ?) => Return} OnSignature
*/
/***
* @template {string} Type
* @template Return
* @typedef {(type: Type[], listener: (event: Event|import("./events/Event.js").default) => ?) => Return extends void ? void : Return[]} CombinedOnSignature
*/
/**
* @typedef {'change'|'error'} EventTypes
*/
/***
* @template Return
* @typedef {OnSignature<EventTypes, import("./events/Event.js").default, Return> & CombinedOnSignature<EventTypes, Return>} ObservableOnSignature
*/
/**
* @classdesc
* Abstract base class; normally only used for creating subclasses and not
* instantiated in apps.
* An event target providing convenient methods for listener registration
* and unregistration. A generic `change` event is always available through
* {@link module:ol/Observable~Observable#changed}.
*
* @fires import("./events/Event.js").default
* @api
*/
var Observable = class extends Target {
	constructor() {
		super();
		this.on = this.onInternal;
		this.once = this.onceInternal;
		this.un = this.unInternal;
		/**
		* @private
		* @type {number}
		*/
		this.revision_ = 0;
	}
	/**
	* Increases the revision counter and dispatches a 'change' event.
	* @api
	*/
	changed() {
		++this.revision_;
		this.dispatchEvent(EventType_default.CHANGE);
	}
	/**
	* Get the version number for this object.  Each time the object is modified,
	* its version number will be incremented.
	* @return {number} Revision.
	* @api
	*/
	getRevision() {
		return this.revision_;
	}
	/**
	* @param {string|Array<string>} type Type.
	* @param {function((Event|import("./events/Event.js").default)): ?} listener Listener.
	* @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Event key.
	* @protected
	*/
	onInternal(type, listener) {
		if (Array.isArray(type)) {
			const len = type.length;
			const keys = new Array(len);
			for (let i = 0; i < len; ++i) keys[i] = listen(this, type[i], listener);
			return keys;
		}
		return listen(this, type, listener);
	}
	/**
	* @param {string|Array<string>} type Type.
	* @param {function((Event|import("./events/Event.js").default)): ?} listener Listener.
	* @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Event key.
	* @protected
	*/
	onceInternal(type, listener) {
		let key;
		if (Array.isArray(type)) {
			const len = type.length;
			key = new Array(len);
			for (let i = 0; i < len; ++i) key[i] = listenOnce(this, type[i], listener);
		} else key = listenOnce(this, type, listener);
		/** @type {Object} */ listener.ol_key = key;
		return key;
	}
	/**
	* Unlisten for a certain type of event.
	* @param {string|Array<string>} type Type.
	* @param {function((Event|import("./events/Event.js").default)): ?} listener Listener.
	* @protected
	*/
	unInternal(type, listener) {
		const key = listener.ol_key;
		if (key) unByKey(key);
		else if (Array.isArray(type)) for (let i = 0, ii = type.length; i < ii; ++i) this.removeEventListener(type[i], listener);
		else this.removeEventListener(type, listener);
	}
};
/**
* Listen for a certain type of event.
* @function
* @param {string|Array<string>} type The event type or array of event types.
* @param {function((Event|import("./events/Event.js").default)): ?} listener The listener function.
* @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Unique key for the listener. If
*     called with an array of event types as the first argument, the return
*     will be an array of keys.
* @api
*/
Observable.prototype.on;
/**
* Listen once for a certain type of event.
* @function
* @param {string|Array<string>} type The event type or array of event types.
* @param {function((Event|import("./events/Event.js").default)): ?} listener The listener function.
* @return {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} Unique key for the listener. If
*     called with an array of event types as the first argument, the return
*     will be an array of keys.
* @api
*/
Observable.prototype.once;
/**
* Unlisten for a certain type of event.
* @function
* @param {string|Array<string>} type The event type or array of event types.
* @param {function((Event|import("./events/Event.js").default)): ?} listener The listener function.
* @api
*/
Observable.prototype.un;
/**
* Removes an event listener using the key returned by `on()` or `once()`.
* @param {import("./events.js").EventsKey|Array<import("./events.js").EventsKey>} key The key returned by `on()`
*     or `once()` (or an array of keys).
* @api
*/
function unByKey(key) {
	if (Array.isArray(key)) for (let i = 0, ii = key.length; i < ii; ++i) unlistenByKey(key[i]);
	else unlistenByKey(key);
}
//#endregion
//#region node_modules/ol/util.js
/**
* @module ol/util
*/
/**
* @return {never} Any return.
*/
function abstract() {
	throw new Error("Unimplemented abstract method.");
}
/**
* Counter for getUid.
* @type {number}
* @private
*/
var uidCounter_ = 0;
/**
* Gets a unique ID for an object. This mutates the object so that further calls
* with the same object as a parameter returns the same value. Unique IDs are generated
* as a strictly increasing sequence. Adapted from goog.getUid.
*
* @param {Object} obj The object to get the unique ID for.
* @return {string} The unique ID for the object.
* @api
*/
function getUid(obj) {
	return obj.ol_uid || (obj.ol_uid = String(++uidCounter_));
}
//#endregion
//#region node_modules/ol/Object.js
/**
* @module ol/Object
*/
/**
* @classdesc
* Events emitted by {@link module:ol/Object~BaseObject} instances are instances of this type.
*/
var ObjectEvent = class extends BaseEvent {
	/**
	* @param {string} type The event type.
	* @param {string} key The property name.
	* @param {*} oldValue The old value for `key`.
	*/
	constructor(type, key, oldValue) {
		super(type);
		/**
		* The name of the property whose value is changing.
		* @type {string}
		* @api
		*/
		this.key = key;
		/**
		* The old value. To get the new value use `e.target.get(e.key)` where
		* `e` is the event object.
		* @type {*}
		* @api
		*/
		this.oldValue = oldValue;
	}
};
/***
* @template Return
* @typedef {import("./Observable.js").OnSignature<import("./Observable.js").EventTypes, import("./events/Event.js").default, Return> &
*    import("./Observable.js").OnSignature<import("./ObjectEventType.js").Types, ObjectEvent, Return> &
*    import("./Observable.js").CombinedOnSignature<import("./Observable.js").EventTypes|import("./ObjectEventType.js").Types, Return>} ObjectOnSignature
*/
/**
* @classdesc
* Abstract base class; normally only used for creating subclasses and not
* instantiated in apps.
* Most non-trivial classes inherit from this.
*
* This extends {@link module:ol/Observable~Observable} with observable
* properties, where each property is observable as well as the object as a
* whole.
*
* Classes that inherit from this have pre-defined properties, to which you can
* add your owns. The pre-defined properties are listed in this documentation as
* 'Observable Properties', and have their own accessors; for example,
* {@link module:ol/Map~Map} has a `target` property, accessed with
* `getTarget()` and changed with `setTarget()`. Not all properties are however
* settable. There are also general-purpose accessors `get()` and `set()`. For
* example, `get('target')` is equivalent to `getTarget()`.
*
* The `set` accessors trigger a change event, and you can monitor this by
* registering a listener. For example, {@link module:ol/View~View} has a
* `center` property, so `view.on('change:center', function(evt) {...});` would
* call the function whenever the value of the center property changes. Within
* the function, `evt.target` would be the view, so `evt.target.getCenter()`
* would return the new center.
*
* You can add your own observable properties with
* `object.set('prop', 'value')`, and retrieve that with `object.get('prop')`.
* You can listen for changes on that property value with
* `object.on('change:prop', listener)`. You can get a list of all
* properties with {@link module:ol/Object~BaseObject#getProperties}.
*
* Note that the observable properties are separate from standard JS properties.
* You can, for example, give your map object a title with
* `map.title='New title'` and with `map.set('title', 'Another title')`. The
* first will be a `hasOwnProperty`; the second will appear in
* `getProperties()`. Only the second is observable.
*
* Properties can be deleted by using the unset method. E.g.
* object.unset('foo').
*
* @fires ObjectEvent
* @template {Object<string, *>} [Properties=Object<string, *>]
* @api
*/
var BaseObject = class extends Observable {
	/**
	* @param {NoInfer<Properties>} [values] An object with key-value pairs.
	*/
	constructor(values) {
		super();
		/***
		* @type {ObjectOnSignature<import("./events.js").EventsKey>}
		*/
		this.on;
		/***
		* @type {ObjectOnSignature<import("./events.js").EventsKey>}
		*/
		this.once;
		/***
		* @type {ObjectOnSignature<void>}
		*/
		this.un;
		getUid(this);
		/**
		* @private
		* @type {Partial<NoInfer<Properties>>|null}
		*/
		this.values_ = null;
		if (values !== void 0) this.setProperties(values);
	}
	/**
	* Gets a value.
	* @param {string} key Key name.
	* @return {*} Value.
	* @api
	*/
	get(key) {
		let value;
		if (this.values_ && this.values_.hasOwnProperty(key)) value = this.values_[key];
		return value;
	}
	/**
	* Get a list of object property names.
	* @return {Array<string>} List of property names.
	* @api
	*/
	getKeys() {
		return this.values_ && Object.keys(this.values_) || [];
	}
	/**
	* Get an object of all property names and values.
	* @return {NoInfer<Properties>} Object.
	* @api
	*/
	getProperties() {
		return this.values_ && Object.assign({}, this.values_) || {};
	}
	/**
	* Get an object of all property names and values.
	* @return {Partial<NoInfer<Properties>>?} Object.
	*/
	getPropertiesInternal() {
		return this.values_;
	}
	/**
	* @return {boolean} The object has properties.
	*/
	hasProperties() {
		return !!this.values_;
	}
	/**
	* @param {string} key Key name.
	* @param {*} oldValue Old value.
	*/
	notify(key, oldValue) {
		let eventType;
		eventType = `change:${key}`;
		if (this.hasListener(eventType)) this.dispatchEvent(new ObjectEvent(eventType, key, oldValue));
		eventType = ObjectEventType_default.PROPERTYCHANGE;
		if (this.hasListener(eventType)) this.dispatchEvent(new ObjectEvent(eventType, key, oldValue));
	}
	/**
	* @param {string} key Key name.
	* @param {import("./events.js").Listener} listener Listener.
	*/
	addChangeListener(key, listener) {
		this.addEventListener(`change:${key}`, listener);
	}
	/**
	* @param {string} key Key name.
	* @param {import("./events.js").Listener} listener Listener.
	*/
	removeChangeListener(key, listener) {
		this.removeEventListener(`change:${key}`, listener);
	}
	/**
	* Sets a value.
	* @param {string} key Key name.
	* @param {*} value Value.
	* @param {boolean} [silent] Update without triggering an event.
	* @api
	*/
	set(key, value, silent) {
		const values = this.values_ || (this.values_ = {});
		if (silent) values[key] = value;
		else {
			const oldValue = values[key];
			values[key] = value;
			if (oldValue !== value) this.notify(key, oldValue);
		}
	}
	/**
	* Sets a collection of key-value pairs.  Note that this changes any existing
	* properties and adds new ones (it does not remove any existing properties).
	* @param {Partial<NoInfer<Properties>>} values Values.
	* @param {boolean} [silent] Update without triggering an event.
	* @api
	*/
	setProperties(values, silent) {
		for (const key in values) this.set(key, values[key], silent);
	}
	/**
	* Apply any properties from another object without triggering events.
	* @param {BaseObject} source The source object.
	* @protected
	*/
	applyProperties(source) {
		if (!source.values_) return;
		Object.assign(this.values_ || (this.values_ = {}), source.values_);
	}
	/**
	* Unsets a property.
	* @param {string} key Key name.
	* @param {boolean} [silent] Unset without triggering an event.
	* @api
	*/
	unset(key, silent) {
		if (this.values_ && key in this.values_) {
			const oldValue = this.values_[key];
			delete this.values_[key];
			if (isEmpty(this.values_)) this.values_ = null;
			if (!silent) this.notify(key, oldValue);
		}
	}
};
//#endregion
export { ObjectEventType_default as C, unlistenByKey as S, linearFindNearest as _, Target as a, EventType_default as b, TRUE as c, toPromise as d, ascending as f, extend as g, equals as h, Observable as i, VOID as l, descending as m, abstract as n, BaseEvent as o, binarySearch as p, getUid as r, FALSE as s, BaseObject as t, memoizeOne as u, reverseSubArray as v, listen as x, Disposable as y };

//# sourceMappingURL=Object-DolGq2cf.js.map