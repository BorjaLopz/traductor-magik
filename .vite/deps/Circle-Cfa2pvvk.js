import { a as Target, b as EventType_default, n as abstract, t as BaseObject } from "./Object-DolGq2cf.js";
import { t as clear } from "./obj-BGAAjjDC.js";
import { s as toFixed, t as clamp } from "./math-C8anmfUQ.js";
//#region node_modules/ol/has.js
/**
* @module ol/has
*/
var ua = typeof navigator !== "undefined" && typeof navigator.userAgent !== "undefined" ? navigator.userAgent.toLowerCase() : "";
ua.includes("safari") && !ua.includes("chrom") && (ua.includes("version/15.4") || /cpu (os|iphone os) 15_4 like mac os x/.test(ua));
/**
* User agent string says we are dealing with a WebKit engine.
* @type {boolean}
*/
var WEBKIT = ua.includes("webkit") && !ua.includes("edge");
/**
* User agent string says we are dealing with a Mac as platform.
* @type {boolean}
*/
var MAC = ua.includes("macintosh");
/**
* The ratio between physical pixels and device-independent pixels
* (dips) on the device (`window.devicePixelRatio`).
* @const
* @type {number}
* @api
*/
var DEVICE_PIXEL_RATIO = typeof devicePixelRatio !== "undefined" ? devicePixelRatio : 1;
/**
* The execution context is a worker with OffscreenCanvas available.
* @const
* @type {boolean}
*/
var WORKER_OFFSCREEN_CANVAS = typeof WorkerGlobalScope !== "undefined" && typeof OffscreenCanvas !== "undefined" && self instanceof WorkerGlobalScope;
/**
* Image.prototype.decode() is supported.
* @type {boolean}
*/
var IMAGE_DECODE = typeof Image !== "undefined" && Image.prototype.decode;
/**
* @type {boolean}
*/
var PASSIVE_EVENT_LISTENERS = (function() {
	let passive = false;
	try {
		const options = Object.defineProperty({}, "passive", { get: function() {
			passive = true;
		} });
		window.addEventListener("_", null, options);
		window.removeEventListener("_", null, options);
	} catch {}
	return passive;
})();
//#endregion
//#region node_modules/ol/css.js
/**
* @module ol/css
*/
/**
* @typedef {Object} FontParameters
* @property {string} style Style.
* @property {string} variant Variant.
* @property {string} weight Weight.
* @property {string} size Size.
* @property {string} lineHeight LineHeight.
* @property {string} family Family.
* @property {Array<string>} families Families.
*/
/**
* The CSS class for hidden feature.
*
* @const
* @type {string}
*/
var CLASS_HIDDEN = "ol-hidden";
/**
* The CSS class that we'll give the DOM elements to have them unselectable.
*
* @const
* @type {string}
*/
var CLASS_UNSELECTABLE = "ol-unselectable";
/**
* The CSS class for controls.
*
* @const
* @type {string}
*/
var CLASS_CONTROL = "ol-control";
/**
* The CSS class that we'll give the DOM elements that are collapsed, i.e.
* to those elements which usually can be expanded.
*
* @const
* @type {string}
*/
var CLASS_COLLAPSED = "ol-collapsed";
/**
* From https://stackoverflow.com/questions/10135697/regex-to-parse-any-css-font
* @type {RegExp}
*/
var fontRegEx = new RegExp([
	"^\\s*(?=(?:(?:[-a-z]+\\s*){0,2}(italic|oblique))?)",
	"(?=(?:(?:[-a-z]+\\s*){0,2}(small-caps))?)",
	"(?=(?:(?:[-a-z]+\\s*){0,2}(bold(?:er)?|lighter|[1-9]00 ))?)",
	"(?:(?:normal|\\1|\\2|\\3)\\s*){0,3}((?:xx?-)?",
	"(?:small|large)|medium|smaller|larger|[\\.\\d]+(?:\\%|in|[cem]m|ex|p[ctx]))",
	"(?:\\s*\\/\\s*(normal|[\\.\\d]+(?:\\%|in|[cem]m|ex|p[ctx])?))",
	"?\\s*([-,\\\"\\'\\sa-z0-9]+?)\\s*$"
].join(""), "i");
/** @type {Array<'style'|'variant'|'weight'|'size'|'lineHeight'|'family'>} */
var fontRegExMatchIndex = [
	"style",
	"variant",
	"weight",
	"size",
	"lineHeight",
	"family"
];
/** @type {Object<string|number, number>} */
var fontWeights = {
	normal: 400,
	bold: 700
};
/**
* Get the list of font families from a font spec.  Note that this doesn't work
* for font families that have commas in them.
* @param {string} fontSpec The CSS font property.
* @return {FontParameters|null} The font parameters (or null if the input spec is invalid).
*/
var getFontParameters = function(fontSpec) {
	const match = fontSpec.match(fontRegEx);
	if (!match) return null;
	const style = {
		lineHeight: "normal",
		size: "1.2em",
		style: "normal",
		weight: "400",
		variant: "normal"
	};
	for (let i = 0, ii = fontRegExMatchIndex.length; i < ii; ++i) {
		const value = match[i + 1];
		if (value !== void 0) style[fontRegExMatchIndex[i]] = typeof value === "string" ? value.trim() : value;
	}
	if (isNaN(Number(style.weight)) && style.weight in fontWeights) style.weight = fontWeights[style.weight];
	style.families = style.family.split(/,\s?/).map((f) => f.trim().replace(/^['"]|['"]$/g, ""));
	return style;
};
//#endregion
//#region node_modules/ol/dom.js
/**
* @module ol/dom
*/
/**
* @typedef {Object} ImageAttributes
* @property {string|null} [crossOrigin] Cross origin.
* @property {ReferrerPolicy} [referrerPolicy]  Referrer policy.
*/
/**
* Create an html canvas element and returns its 2d context.
* @param {number} [width] Canvas width.
* @param {number} [height] Canvas height.
* @param {Array<HTMLCanvasElement|OffscreenCanvas>} [canvasPool] Canvas pool to take existing canvas from.
* @param {CanvasRenderingContext2DSettings} [settings] CanvasRenderingContext2DSettings
* @return {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} The context.
*/
function createCanvasContext2D(width, height, canvasPool, settings) {
	/** @type {HTMLCanvasElement|OffscreenCanvas} */
	let canvas;
	if (canvasPool && canvasPool.length) canvas = canvasPool.shift();
	else if (WORKER_OFFSCREEN_CANVAS) canvas = new class extends OffscreenCanvas {
		style = {};
	}(width ?? 300, height ?? 150);
	else canvas = document.createElement("canvas");
	if (width) canvas.width = width;
	if (height) canvas.height = height;
	return canvas.getContext("2d", settings);
}
/**
* @type {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D}
*/
var sharedCanvasContext;
/**
* @return {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} Shared canvas context.
*/
function getSharedCanvasContext2D() {
	if (!sharedCanvasContext) sharedCanvasContext = createCanvasContext2D(1, 1);
	return sharedCanvasContext;
}
/**
* Releases canvas memory to avoid exceeding memory limits in Safari.
* See https://pqina.nl/blog/total-canvas-memory-use-exceeds-the-maximum-limit/
* @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} context Context.
*/
function releaseCanvas(context) {
	const canvas = context.canvas;
	canvas.width = 1;
	canvas.height = 1;
	context.clearRect(0, 0, 1, 1);
}
/**
* @param {Node} newNode Node to replace old node
* @param {Node} oldNode The node to be replaced
*/
function replaceNode(newNode, oldNode) {
	const parent = oldNode.parentNode;
	if (parent) parent.replaceChild(newNode, oldNode);
}
/**
* @param {Node} node The node to remove the children from.
*/
function removeChildren(node) {
	while (node.lastChild) node.lastChild.remove();
}
/**
* Transform the children of a parent node so they match the
* provided list of children.  This function aims to efficiently
* remove, add, and reorder child nodes while maintaining a simple
* implementation (it is not guaranteed to minimize DOM operations).
* @param {Node} node The parent node whose children need reworking.
* @param {Array<Node>} children The desired children.
*/
function replaceChildren(node, children) {
	const oldChildren = node.childNodes;
	for (let i = 0;; ++i) {
		const oldChild = oldChildren[i];
		const newChild = children[i];
		if (!oldChild && !newChild) break;
		if (oldChild === newChild) continue;
		if (!oldChild) {
			node.appendChild(newChild);
			continue;
		}
		if (!newChild) {
			node.removeChild(oldChild);
			--i;
			continue;
		}
		node.insertBefore(newChild, oldChild);
	}
}
/**
* Creates a minimal structure that mocks a DIV to be used by the composite and
* layer renderer in a worker environment
* @return {HTMLDivElement} mocked DIV
*/
function createMockDiv() {
	return new Proxy({
		/**
		* @type {Array<HTMLElement>}
		*/
		childNodes: [],
		/**
		* @param {HTMLElement} node html node.
		* @return {HTMLElement} html node.
		*/
		appendChild: function(node) {
			this.childNodes.push(node);
			return node;
		},
		/**
		* dummy function, as this structure is not supposed to have a parent.
		*/
		remove: function() {},
		/**
		* @param {HTMLElement} node html node.
		* @return {HTMLElement} html node.
		*/
		removeChild: function(node) {
			const index = this.childNodes.indexOf(node);
			if (index === -1) throw new Error("Node to remove was not found");
			this.childNodes.splice(index, 1);
			return node;
		},
		/**
		* @param {HTMLElement} newNode new html node.
		* @param {HTMLElement} referenceNode reference html node.
		* @return {HTMLElement} new html node.
		*/
		insertBefore: function(newNode, referenceNode) {
			const index = this.childNodes.indexOf(referenceNode);
			if (index === -1) throw new Error("Reference node not found");
			this.childNodes.splice(index, 0, newNode);
			return newNode;
		},
		style: {}
	}, { get(target, prop, receiver) {
		if (prop === "firstElementChild") return target.childNodes.length > 0 ? target.childNodes[0] : null;
		return Reflect.get(target, prop, receiver);
	} });
}
/***
* @param {*} obj The object to check.
* @return {obj is (HTMLCanvasElement | OffscreenCanvas)} The object is a canvas.
*/
function isCanvas(obj) {
	return typeof HTMLCanvasElement !== "undefined" && obj instanceof HTMLCanvasElement || typeof OffscreenCanvas !== "undefined" && obj instanceof OffscreenCanvas;
}
//#endregion
//#region node_modules/ol/color.js
/**
* @module ol/color
*/
/**
* A color represented as a short array [red, green, blue, alpha].
* red, green, and blue should be integers in the range 0..255 inclusive.
* alpha should be a float in the range 0..1 inclusive. If no alpha value is
* given then `1` will be used.
* @typedef {Array<number>} Color
* @api
*/
/**
* Color to indicate that no color should be rendered. This is meant to be used for per-reference
* comparisons only.
* @type {Color}
*/
var NO_COLOR = [
	NaN,
	NaN,
	NaN,
	0
];
var colorParseContext;
/**
* @return {CanvasRenderingContext2D} The color parse context
*/
function getColorParseContext() {
	if (!colorParseContext) colorParseContext = createCanvasContext2D(1, 1, void 0, {
		willReadFrequently: true,
		desynchronized: true
	});
	return colorParseContext;
}
var rgbModernRegEx = /^rgba?\(\s*(\d+%?)\s+(\d+%?)\s+(\d+%?)(?:\s*\/\s*(\d+%|\d*\.\d+|[01]))?\s*\)$/i;
var rgbLegacyAbsoluteRegEx = /^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)(?:\s*,\s*(\d+%|\d*\.\d+|[01]))?\s*\)$/i;
var rgbLegacyPercentageRegEx = /^rgba?\(\s*(\d+%)\s*,\s*(\d+%)\s*,\s*(\d+%)(?:\s*,\s*(\d+%|\d*\.\d+|[01]))?\s*\)$/i;
var hexRegEx = /^#([\da-f]{3,4}|[\da-f]{6}|[\da-f]{8})$/i;
/**
* @param {string} s Color component as number or percentage.
* @param {number} divider Divider for percentage.
* @return {number} Color component.
*/
function toColorComponent(s, divider) {
	return s.endsWith("%") ? Number(s.substring(0, s.length - 1)) / divider : Number(s);
}
/**
* @param {string} color Color string.
*/
function throwInvalidColor(color) {
	throw new Error("failed to parse \"" + color + "\" as color");
}
/**
* @param {string} color Color string.
* @return {Color} RGBa color array.
*/
function parseRgba(color) {
	if (color.toLowerCase().startsWith("rgb")) {
		const rgb = color.match(rgbLegacyAbsoluteRegEx) || color.match(rgbModernRegEx) || color.match(rgbLegacyPercentageRegEx);
		if (rgb) {
			const alpha = rgb[4];
			const rgbDivider = 100 / 255;
			return [
				clamp(toColorComponent(rgb[1], rgbDivider) + .5 | 0, 0, 255),
				clamp(toColorComponent(rgb[2], rgbDivider) + .5 | 0, 0, 255),
				clamp(toColorComponent(rgb[3], rgbDivider) + .5 | 0, 0, 255),
				alpha !== void 0 ? clamp(toColorComponent(alpha, 100), 0, 1) : 1
			];
		}
		throwInvalidColor(color);
	}
	if (color.startsWith("#")) {
		if (hexRegEx.test(color)) {
			const hex = color.substring(1);
			const step = hex.length <= 4 ? 1 : 2;
			const colorFromHex = [
				0,
				0,
				0,
				255
			];
			for (let i = 0, ii = hex.length; i < ii; i += step) {
				let colorComponent = parseInt(hex.substring(i, i + step), 16);
				if (step === 1) colorComponent += colorComponent << 4;
				colorFromHex[i / step] = colorComponent;
			}
			colorFromHex[3] = colorFromHex[3] / 255;
			return colorFromHex;
		}
		throwInvalidColor(color);
	}
	const context = getColorParseContext();
	context.fillStyle = "#abcdef";
	let invalidCheckFillStyle = context.fillStyle;
	context.fillStyle = color;
	if (context.fillStyle === invalidCheckFillStyle) {
		context.fillStyle = "#fedcba";
		invalidCheckFillStyle = context.fillStyle;
		context.fillStyle = color;
		if (context.fillStyle === invalidCheckFillStyle) throwInvalidColor(color);
	}
	const colorString = context.fillStyle;
	if (colorString.startsWith("#") || colorString.startsWith("rgba")) return parseRgba(colorString);
	context.clearRect(0, 0, 1, 1);
	context.fillRect(0, 0, 1, 1);
	const colorFromImage = Array.from(context.getImageData(0, 0, 1, 1).data);
	colorFromImage[3] = toFixed(colorFromImage[3] / 255, 3);
	return colorFromImage;
}
/**
* Return the color as an rgba string.
* @param {Color|string} color Color.
* @return {string} Rgba string.
* @api
*/
function asString(color) {
	if (typeof color === "string") return color;
	return toString(color);
}
/**
* @type {number}
*/
var MAX_CACHE_SIZE = 1024;
/**
* We maintain a small cache of parsed strings.  Whenever the cache grows too large,
* we delete an arbitrary set of the entries.
*
* @type {Object<string, Color>}
*/
var cache = {};
/**
* @type {number}
*/
var cacheSize = 0;
/**
* @param {Color} color A color that may or may not have an alpha channel.
* @return {Color} The input color with an alpha channel.  If the input color has
* an alpha channel, the input color will be returned unchanged.  Otherwise, a new
* array will be returned with the input color and an alpha channel of 1.
*/
function withAlpha(color) {
	if (color.length === 4) return color;
	const output = color.slice();
	output[3] = 1;
	return output;
}
/**
* @param {number} v Input value.
* @return {number} Output value.
*/
function b1(v) {
	return v > .0031308 ? Math.pow(v, 1 / 2.4) * 269.025 - 14.025 : v * 3294.6;
}
/**
* @param {number} v Input value.
* @return {number} Output value.
*/
function b2(v) {
	return v > .2068965 ? Math.pow(v, 3) : (v - 4 / 29) * (108 / 841);
}
/**
* @param {number} v Input value.
* @return {number} Output value.
*/
function a1(v) {
	return v > 10.314724 ? Math.pow((v + 14.025) / 269.025, 2.4) : v / 3294.6;
}
/**
* @param {number} v Input value.
* @return {number} Output value.
*/
function a2(v) {
	return v > .0088564 ? Math.pow(v, 1 / 3) : v / (108 / 841) + 4 / 29;
}
/**
* @param {Color} color RGBA color.
* @return {Color} LCHuv color with alpha.
*/
function rgbaToLcha(color) {
	const r = a1(color[0]);
	const g = a1(color[1]);
	const b = a1(color[2]);
	const y = a2(r * .222488403 + g * .716873169 + b * .06060791);
	const l = 500 * (a2(r * .452247074 + g * .399439023 + b * .148375274) - y);
	const q = 200 * (y - a2(r * .016863605 + g * .117638439 + b * .865350722));
	const h = Math.atan2(q, l) * (180 / Math.PI);
	return [
		116 * y - 16,
		Math.sqrt(l * l + q * q),
		h < 0 ? h + 360 : h,
		color[3]
	];
}
/**
* @param {Color} color LCHuv color with alpha.
* @return {Color} RGBA color.
*/
function lchaToRgba(color) {
	const l = (color[0] + 16) / 116;
	const c = color[1];
	const h = color[2] * Math.PI / 180;
	const y = b2(l);
	const x = b2(l + c / 500 * Math.cos(h));
	const z = b2(l - c / 200 * Math.sin(h));
	const r = b1(x * 3.021973625 - y * 1.617392459 - z * .404875592);
	const g = b1(x * -.943766287 + y * 1.916279586 + z * .027607165);
	const b = b1(x * .069407491 - y * .22898585 + z * 1.159737864);
	return [
		clamp(r + .5 | 0, 0, 255),
		clamp(g + .5 | 0, 0, 255),
		clamp(b + .5 | 0, 0, 255),
		color[3]
	];
}
/**
* @param {string} s String.
* @return {Color} Color.
*/
function fromString(s) {
	if (s === "none") return NO_COLOR;
	if (cache.hasOwnProperty(s)) return cache[s];
	if (cacheSize >= MAX_CACHE_SIZE) {
		let i = 0;
		for (const key in cache) if ((i++ & 3) === 0) {
			delete cache[key];
			--cacheSize;
		}
	}
	const color = parseRgba(s);
	if (color.length !== 4) throwInvalidColor(s);
	for (const c of color) if (isNaN(c)) throwInvalidColor(s);
	cache[s] = color;
	++cacheSize;
	return color;
}
/**
* Return the color as an array. This function maintains a cache of calculated
* arrays which means the result should not be modified.
* @param {Color|string} color Color.
* @return {Color} Color.
* @api
*/
function asArray(color) {
	if (Array.isArray(color)) return color;
	return fromString(color);
}
/**
* @param {Color} color Color.
* @return {string} String.
*/
function toString(color) {
	let r = color[0];
	if (r != (r | 0)) r = r + .5 | 0;
	let g = color[1];
	if (g != (g | 0)) g = g + .5 | 0;
	let b = color[2];
	if (b != (b | 0)) b = b + .5 | 0;
	const a = color[3] === void 0 ? 1 : Math.round(color[3] * 1e3) / 1e3;
	return "rgba(" + r + "," + g + "," + b + "," + a + ")";
}
//#endregion
//#region node_modules/ol/size.js
/**
* Determines if a size has a positive area.
* @param {Size} size The size to test.
* @return {boolean} The size has a positive area.
*/
function hasArea(size) {
	return size[0] > 0 && size[1] > 0;
}
/**
* Returns an `Size` array for the passed in number (meaning: square) or
* `Size` array.
* (meaning: non-square),
* @param {number|Size} size Width and height.
* @param {Size} [dest] Optional reusable size array.
* @return {Size} Size.
* @api
*/
function toSize(size, dest) {
	if (Array.isArray(size)) return size;
	if (dest === void 0) dest = [size, size];
	else {
		dest[0] = size;
		dest[1] = size;
	}
	return dest;
}
//#endregion
//#region node_modules/ol/ImageState.js
/**
* @module ol/ImageState
*/
/**
* @enum {number}
*/
var ImageState_default = {
	IDLE: 0,
	LOADING: 1,
	LOADED: 2,
	ERROR: 3,
	EMPTY: 4
};
//#endregion
//#region node_modules/ol/Image.js
/**
* Loads an image.
* @param {HTMLImageElement} image Image, not yet loaded.
* @param {string} [src] `src` attribute of the image. Optional, not required if already present.
* @return {Promise<HTMLImageElement>} Promise resolving to an `HTMLImageElement`.
* @api
*/
function load(image, src) {
	return new Promise((resolve, reject) => {
		function handleLoad() {
			unlisten();
			resolve(image);
		}
		function handleError() {
			unlisten();
			reject(/* @__PURE__ */ new Error("Image load error"));
		}
		function unlisten() {
			image.removeEventListener("load", handleLoad);
			image.removeEventListener("error", handleError);
		}
		image.addEventListener("load", handleLoad);
		image.addEventListener("error", handleError);
		if (src) image.src = src;
	});
}
/**
* @param {HTMLImageElement} image Image, not yet loaded.
* @param {string} [src] `src` attribute of the image. Optional, not required if already present.
* @return {Promise<HTMLImageElement>} Promise resolving to an `HTMLImageElement`.
*/
function decodeFallback(image, src) {
	if (src) image.src = src;
	return image.src && IMAGE_DECODE ? new Promise((resolve, reject) => image.decode().then(() => resolve(image)).catch((e) => image.complete && image.width ? resolve(image) : reject(e))) : load(image);
}
//#endregion
//#region node_modules/ol/style/IconImageCache.js
/**
* @module ol/style/IconImageCache
*/
/**
* @classdesc
* Singleton class. Available through {@link module:ol/style/IconImageCache.shared}.
*/
var IconImageCache = class {
	constructor() {
		/**
		* @type {!Object<string, import("./IconImage.js").default>}
		* @private
		*/
		this.cache_ = {};
		/**
		* @type {!Object<string, CanvasPattern>}
		* @private
		*/
		this.patternCache_ = {};
		/**
		* @type {number}
		* @private
		*/
		this.cacheSize_ = 0;
		/**
		* @type {number}
		* @private
		*/
		this.maxCacheSize_ = 1024;
	}
	/**
	* FIXME empty description for jsdoc
	*/
	clear() {
		this.cache_ = {};
		this.patternCache_ = {};
		this.cacheSize_ = 0;
	}
	/**
	* @return {boolean} Can expire cache.
	*/
	canExpireCache() {
		return this.cacheSize_ > this.maxCacheSize_;
	}
	/**
	* FIXME empty description for jsdoc
	*/
	expire() {
		if (this.canExpireCache()) {
			let i = 0;
			for (const key in this.cache_) {
				const iconImage = this.cache_[key];
				if ((i++ & 3) === 0 && !iconImage.hasListener()) {
					delete this.cache_[key];
					delete this.patternCache_[key];
					--this.cacheSize_;
				}
			}
		}
	}
	/**
	* @param {string} src Src.
	* @param {import("../color.js").Color|string|null} color Color.
	* @return {import("./IconImage.js").default} Icon image.
	*/
	get(src, color) {
		const key = getCacheKey(src, color);
		return key in this.cache_ ? this.cache_[key] : null;
	}
	/**
	* @param {string} src Src.
	* @param {import("../color.js").Color|string|null} color Color.
	* @return {CanvasPattern} Icon image.
	*/
	getPattern(src, color) {
		const key = getCacheKey(src, color);
		return key in this.patternCache_ ? this.patternCache_[key] : null;
	}
	/**
	* @param {string} src Src.
	* @param {import("../color.js").Color|string|null} color Color.
	* @param {import("./IconImage.js").default|null} iconImage Icon image.
	* @param {boolean} [pattern] Also cache a `'repeat'` pattern with this `iconImage`.
	*/
	set(src, color, iconImage, pattern) {
		const key = getCacheKey(src, color);
		const update = key in this.cache_;
		this.cache_[key] = iconImage;
		if (pattern) {
			if (iconImage.getImageState() === ImageState_default.IDLE) iconImage.load();
			if (iconImage.getImageState() === ImageState_default.LOADING) iconImage.ready().then(() => {
				this.patternCache_[key] = getSharedCanvasContext2D().createPattern(iconImage.getImage(1), "repeat");
			});
			else this.patternCache_[key] = getSharedCanvasContext2D().createPattern(iconImage.getImage(1), "repeat");
		}
		if (!update) ++this.cacheSize_;
	}
	/**
	* Set the cache size of the icon cache. Default is `1024`. Change this value when
	* your map uses more than 1024 different icon images and you are not caching icon
	* styles on the application level.
	* @param {number} maxCacheSize Cache max size.
	* @api
	*/
	setSize(maxCacheSize) {
		this.maxCacheSize_ = maxCacheSize;
		this.expire();
	}
};
/**
* @param {string} src Src.
* @param {import("../color.js").Color|string|null} color Color.
* @return {string} Cache key.
*/
function getCacheKey(src, color) {
	const colorString = color ? asArray(color) : "null";
	return src + ":" + colorString;
}
/**
* The {@link module:ol/style/IconImageCache~IconImageCache} for
* {@link module:ol/style/Icon~Icon} images.
* @api
*/
var shared = new IconImageCache();
//#endregion
//#region node_modules/ol/style/IconImage.js
/**
* @module ol/style/IconImage
*/
/**
* @type {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D}
*/
var taintedTestContext = null;
var IconImage = class extends Target {
	/**
	* @param {HTMLImageElement|HTMLCanvasElement|OffscreenCanvas|ImageBitmap|null} image Image.
	* @param {string|undefined} src Src.
	* @param {import('../dom.js').ImageAttributes} imageAttributes Image attributes options.
	* @param {import("../ImageState.js").default|undefined} imageState Image state.
	* @param {import("../color.js").Color|string|null} color Color.
	*/
	constructor(image, src, imageAttributes, imageState, color) {
		super();
		/**
		* @private
		* @type {HTMLImageElement|OffscreenCanvas|HTMLCanvasElement|ImageBitmap}
		*/
		this.hitDetectionImage_ = null;
		/**
		* @private
		* @type {HTMLImageElement|HTMLCanvasElement|OffscreenCanvas|ImageBitmap|null}
		*/
		this.image_ = image;
		/**
		* @private
		* @type {string|null}
		*/
		this.crossOrigin_ = imageAttributes?.crossOrigin;
		/**
		* @private
		* @type {ReferrerPolicy}
		*/
		this.referrerPolicy_ = imageAttributes?.referrerPolicy;
		/**
		* @private
		* @type {Object<number, HTMLCanvasElement|OffscreenCanvas>}
		*/
		this.canvas_ = {};
		/**
		* @private
		* @type {import("../color.js").Color|string|null}
		*/
		this.color_ = color;
		/**
		* @private
		* @type {import("../ImageState.js").default}
		*/
		this.imageState_ = imageState === void 0 ? ImageState_default.IDLE : imageState;
		/**
		* @private
		* @type {import("../size.js").Size|null}
		*/
		this.size_ = image && image.width && image.height ? [image.width, image.height] : null;
		/**
		* @private
		* @type {string|undefined}
		*/
		this.src_ = src;
		/**
		* @private
		*/
		this.tainted_;
		/**
		* @private
		* @type {Promise<void>|null}
		*/
		this.ready_ = null;
	}
	/**
	* @private
	*/
	initializeImage_() {
		this.image_ = new Image();
		if (this.crossOrigin_ !== null) this.image_.crossOrigin = this.crossOrigin_;
		if (this.referrerPolicy_ !== void 0) this.image_.referrerPolicy = this.referrerPolicy_;
	}
	/**
	* @private
	* @return {boolean} The image canvas is tainted.
	*/
	isTainted_() {
		if (this.tainted_ === void 0 && this.imageState_ === ImageState_default.LOADED) {
			if (!taintedTestContext) taintedTestContext = createCanvasContext2D(1, 1, void 0, { willReadFrequently: true });
			taintedTestContext.drawImage(this.image_, 0, 0);
			try {
				taintedTestContext.getImageData(0, 0, 1, 1);
				this.tainted_ = false;
			} catch {
				taintedTestContext = null;
				this.tainted_ = true;
			}
		}
		return this.tainted_ === true;
	}
	/**
	* @private
	*/
	dispatchChangeEvent_() {
		this.dispatchEvent(EventType_default.CHANGE);
	}
	/**
	* @private
	*/
	handleImageError_() {
		this.imageState_ = ImageState_default.ERROR;
		this.dispatchChangeEvent_();
	}
	/**
	* @private
	*/
	handleImageLoad_() {
		this.imageState_ = ImageState_default.LOADED;
		this.size_ = [this.image_.width, this.image_.height];
		this.dispatchChangeEvent_();
	}
	/**
	* @param {number} pixelRatio Pixel ratio.
	* @return {HTMLImageElement|HTMLCanvasElement|OffscreenCanvas|ImageBitmap} Image or Canvas element or image bitmap.
	*/
	getImage(pixelRatio) {
		if (!this.image_) this.initializeImage_();
		this.replaceColor_(pixelRatio);
		return this.canvas_[pixelRatio] ? this.canvas_[pixelRatio] : this.image_;
	}
	/**
	* @param {HTMLImageElement|HTMLCanvasElement|OffscreenCanvas|ImageBitmap} image Image.
	*/
	setImage(image) {
		this.image_ = image;
	}
	/**
	* @param {number} pixelRatio Pixel ratio.
	* @return {number} Image or Canvas element.
	*/
	getPixelRatio(pixelRatio) {
		this.replaceColor_(pixelRatio);
		return this.canvas_[pixelRatio] ? pixelRatio : 1;
	}
	/**
	* @return {import("../ImageState.js").default} Image state.
	*/
	getImageState() {
		return this.imageState_;
	}
	/**
	* @return {HTMLImageElement|HTMLCanvasElement|OffscreenCanvas|ImageBitmap} Image element.
	*/
	getHitDetectionImage() {
		if (!this.image_) this.initializeImage_();
		if (!this.hitDetectionImage_) if (this.isTainted_()) {
			const width = this.size_[0];
			const height = this.size_[1];
			const context = createCanvasContext2D(width, height);
			context.fillRect(0, 0, width, height);
			this.hitDetectionImage_ = context.canvas;
		} else this.hitDetectionImage_ = this.image_;
		return this.hitDetectionImage_;
	}
	/**
	* Get the size of the icon (in pixels).
	* @return {import("../size.js").Size} Image size.
	*/
	getSize() {
		return this.size_;
	}
	/**
	* @return {string|undefined} Image src.
	*/
	getSrc() {
		return this.src_;
	}
	/**
	* Load not yet loaded URI.
	*/
	load() {
		if (this.imageState_ !== ImageState_default.IDLE) return;
		if (!this.image_) this.initializeImage_();
		this.imageState_ = ImageState_default.LOADING;
		try {
			if (this.src_ !== void 0)
 /** @type {HTMLImageElement} */ this.image_.src = this.src_;
		} catch {
			this.handleImageError_();
		}
		if (this.image_ instanceof HTMLImageElement) decodeFallback(this.image_, this.src_).then((image) => {
			this.image_ = image;
			this.handleImageLoad_();
		}).catch(this.handleImageError_.bind(this));
	}
	/**
	* @param {number} pixelRatio Pixel ratio.
	* @private
	*/
	replaceColor_(pixelRatio) {
		if (!this.color_ || this.canvas_[pixelRatio] || this.imageState_ !== ImageState_default.LOADED) return;
		const image = this.image_;
		const ctx = createCanvasContext2D(Math.ceil(image.width * pixelRatio), Math.ceil(image.height * pixelRatio));
		const canvas = ctx.canvas;
		ctx.scale(pixelRatio, pixelRatio);
		ctx.drawImage(image, 0, 0);
		ctx.globalCompositeOperation = "multiply";
		ctx.fillStyle = asString(this.color_);
		ctx.fillRect(0, 0, canvas.width / pixelRatio, canvas.height / pixelRatio);
		ctx.globalCompositeOperation = "destination-in";
		ctx.drawImage(image, 0, 0);
		this.canvas_[pixelRatio] = canvas;
	}
	/**
	* @return {Promise<void>} Promise that resolves when the image is loaded.
	*/
	ready() {
		if (!this.ready_) this.ready_ = new Promise((resolve) => {
			if (this.imageState_ === ImageState_default.LOADED || this.imageState_ === ImageState_default.ERROR) resolve();
			else {
				const onChange = () => {
					if (this.imageState_ === ImageState_default.LOADED || this.imageState_ === ImageState_default.ERROR) {
						this.removeEventListener(EventType_default.CHANGE, onChange);
						resolve();
					}
				};
				this.addEventListener(EventType_default.CHANGE, onChange);
			}
		});
		return this.ready_;
	}
};
/**
* @param {HTMLImageElement|HTMLCanvasElement|OffscreenCanvas|ImageBitmap|null} image Image.
* @param {string|undefined} src Src.
* @param {import('../dom.js').ImageAttributes} imageAttributes Image attributes options.
* @param {import("../ImageState.js").default|undefined} imageState Image state.
* @param {import("../color.js").Color|string|null} color Color.
* @param {boolean} [pattern] Also cache a `repeat` pattern with the icon image.
* @return {IconImage} Icon image.
*/
function get(image, src, imageAttributes, imageState, color, pattern) {
	let iconImage = src === void 0 ? void 0 : shared.get(src, color);
	if (!iconImage) {
		iconImage = new IconImage(image, image && "src" in image ? image.src || void 0 : src, imageAttributes, imageState, color);
		shared.set(src, color, iconImage, pattern);
	}
	if (pattern && iconImage && !shared.getPattern(src, color)) shared.set(src, color, iconImage, pattern);
	return iconImage;
}
//#endregion
//#region node_modules/ol/colorlike.js
/**
* @module ol/colorlike
*/
/**
* @typedef {Object} PatternDescriptor
* @property {string} src Pattern image URL
* @property {import("./color.js").Color|string} [color] Color to tint the pattern with.
* @property {import("./size.js").Size} [size] Size of the desired slice from the pattern image.
* Use this together with `offset` when the pattern image is a sprite sheet.
* @property {import("./size.js").Size} [offset] Offset of the desired slice from the pattern image.
* Use this together with `size` when the pattern image is a sprite sheet.
*/
/**
* A type accepted by CanvasRenderingContext2D.fillStyle
* or CanvasRenderingContext2D.strokeStyle.
* Represents a color, [CanvasPattern](https://developer.mozilla.org/en-US/docs/Web/API/CanvasPattern),
* or [CanvasGradient](https://developer.mozilla.org/en-US/docs/Web/API/CanvasGradient). The origin for
* patterns and gradients as fill style is an increment of 512 css pixels from map coordinate
* `[0, 0]`. For seamless repeat patterns, width and height of the pattern image
* must be a factor of two (2, 4, 8, ..., 512).
*
* @typedef {string|CanvasPattern|CanvasGradient} ColorLike
* @api
*/
/**
* @param {import("./color.js").Color|ColorLike|PatternDescriptor|null} color Color.
* @return {ColorLike|null} The color as an {@link ol/colorlike~ColorLike}.
* @api
*/
function asColorLike(color) {
	if (!color) return null;
	if (Array.isArray(color)) return toString(color);
	if (typeof color === "object" && "src" in color) return asCanvasPattern(color);
	return color;
}
/**
* @param {PatternDescriptor} pattern Pattern descriptor.
* @return {CanvasPattern|null} Canvas pattern or null if the pattern referenced in the
* PatternDescriptor was not found in the icon image cache.
*/
function asCanvasPattern(pattern) {
	if (!pattern.offset || !pattern.size) return shared.getPattern(pattern.src, pattern.color);
	const cacheKey = pattern.src + ":" + pattern.offset;
	const canvasPattern = shared.getPattern(cacheKey, pattern.color);
	if (canvasPattern) return canvasPattern;
	const iconImage = shared.get(pattern.src, null);
	if (iconImage.getImageState() !== ImageState_default.LOADED) return null;
	const patternCanvasContext = createCanvasContext2D(pattern.size[0], pattern.size[1]);
	patternCanvasContext.drawImage(iconImage.getImage(1), pattern.offset[0], pattern.offset[1], pattern.size[0], pattern.size[1], 0, 0, pattern.size[0], pattern.size[1]);
	get(patternCanvasContext.canvas, cacheKey, void 0, ImageState_default.LOADED, pattern.color, true);
	return shared.getPattern(cacheKey, pattern.color);
}
//#endregion
//#region node_modules/ol/render/canvas.js
/**
* @module ol/render/canvas
*/
/**
* @typedef {'Circle' | 'Image' | 'LineString' | 'Polygon' | 'Text' | 'Default'} BuilderType
*/
/**
* @typedef {Object} FillState
* @property {import("../colorlike.js").ColorLike} fillStyle FillStyle.
*/
/**
* @typedef Label
* @property {number} width Width.
* @property {number} height Height.
* @property {Array<string|number>} contextInstructions ContextInstructions.
*/
/**
* @typedef {Object} FillStrokeState
* @property {import("../colorlike.js").ColorLike} [currentFillStyle] Current FillStyle.
* @property {import("../colorlike.js").ColorLike} [currentStrokeStyle] Current StrokeStyle.
* @property {CanvasLineCap} [currentLineCap] Current LineCap.
* @property {Array<number>} currentLineDash Current LineDash.
* @property {number} [currentLineDashOffset] Current LineDashOffset.
* @property {CanvasLineJoin} [currentLineJoin] Current LineJoin.
* @property {number} [currentLineWidth] Current LineWidth.
* @property {number} [currentMiterLimit] Current MiterLimit.
* @property {number} [currentStrokeOffset] Current StrokeOffset.
* @property {number} [lastStroke] Last stroke.
* @property {import("../colorlike.js").ColorLike} [fillStyle] FillStyle.
* @property {import("../colorlike.js").ColorLike} [strokeStyle] StrokeStyle.
* @property {CanvasLineCap} [lineCap] LineCap.
* @property {Array<number>} lineDash LineDash.
* @property {number} [lineDashOffset] LineDashOffset.
* @property {CanvasLineJoin} [lineJoin] LineJoin.
* @property {number} [lineWidth] LineWidth.
* @property {number} [miterLimit] MiterLimit.
* @property {number} [strokeOffset] StrokeOffset.
* @property {number} [fillPatternScale] Fill pattern scale.
*/
/**
* @typedef {Object} StrokeState
* @property {CanvasLineCap} lineCap LineCap.
* @property {Array<number>} lineDash LineDash.
* @property {number} lineDashOffset LineDashOffset.
* @property {CanvasLineJoin} lineJoin LineJoin.
* @property {number} lineWidth LineWidth.
* @property {number} miterLimit MiterLimit.
* @property {number} [strokeOffset] StrokeOffset.
* @property {import("../colorlike.js").ColorLike} strokeStyle StrokeStyle.
*/
/**
* @typedef {Object} TextState
* @property {string} font Font.
* @property {CanvasTextAlign} [textAlign] TextAlign.
* @property {number} [repeat] Repeat.
* @property {import("../style/Text.js").TextJustify} [justify] Justify.
* @property {CanvasTextBaseline} textBaseline TextBaseline.
* @property {import("../style/Text.js").TextPlacement} [placement] Placement.
* @property {number} [maxAngle] MaxAngle.
* @property {boolean} [overflow] Overflow.
* @property {import("../style/Fill.js").default} [backgroundFill] BackgroundFill.
* @property {import("../style/Stroke.js").default} [backgroundStroke] BackgroundStroke.
* @property {import("../size.js").Size} [scale] Scale.
* @property {Array<number>} [padding] Padding.
*/
/**
* @typedef {Object} SerializableInstructions
* @property {Array<*>} instructions The rendering instructions.
* @property {Array<*>} hitDetectionInstructions The rendering hit detection instructions.
* @property {Array<number>} coordinates The array of all coordinates.
* @property {!Object<string, TextState>} [textStates] The text states (decluttering).
* @property {!Object<string, FillState>} [fillStates] The fill states (decluttering).
* @property {!Object<string, StrokeState>} [strokeStates] The stroke states (decluttering).
*/
/**
* @typedef {Object<number, import("./canvas/Executor.js").ReplayImageOrLabelArgs>} DeclutterImageWithText
*/
/**
* @const
* @type {string}
*/
var defaultFont = "10px sans-serif";
/**
* @const
* @type {string}
*/
var defaultFillStyle = "#000";
/**
* @const
* @type {CanvasLineCap}
*/
var defaultLineCap = "round";
/**
* @const
* @type {Array<number>}
*/
var defaultLineDash = [];
/**
* @const
* @type {CanvasLineJoin}
*/
var defaultLineJoin = "round";
/**
* @const
* @type {import("../colorlike.js").ColorLike}
*/
var defaultStrokeStyle = "#000";
/**
* @const
* @type {CanvasTextAlign}
*/
var defaultTextAlign = "center";
/**
* @const
* @type {CanvasTextBaseline}
*/
var defaultTextBaseline = "middle";
/**
* @const
* @type {Array<number>}
*/
var defaultPadding = [
	0,
	0,
	0,
	0
];
/**
* @type {BaseObject}
*/
var checkedFonts = new BaseObject();
/**
* @type {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D}
*/
var measureContext = null;
/**
* @type {string}
*/
var measureFont;
/**
* @type {!Object<string, number>}
*/
var textHeights = {};
var genericFontFamilies = new Set([
	"serif",
	"sans-serif",
	"monospace",
	"cursive",
	"fantasy",
	"system-ui",
	"ui-serif",
	"ui-sans-serif",
	"ui-monospace",
	"ui-rounded",
	"emoji",
	"math",
	"fangsong"
]);
/**
* @param {string} style Css font-style
* @param {string} weight Css font-weight
* @param {string} family Css font-family
* @return {string} Font key.
*/
function getFontKey(style, weight, family) {
	return `${style} ${weight} 16px "${family}"`;
}
/**
* Clears the label cache when a font becomes available.
* @param {string} fontSpec CSS font spec.
*/
var registerFont = (function() {
	const retries = 100;
	let timeout, fontFaceSet;
	/**
	* @param {string} fontSpec Css font spec
	* @return {Promise<boolean>} Font with style and weight is available
	*/
	async function isAvailable(fontSpec) {
		await fontFaceSet.ready;
		const fontFaces = await fontFaceSet.load(fontSpec);
		if (fontFaces.length === 0) return false;
		const font = getFontParameters(fontSpec);
		const checkFamily = font.families[0].toLowerCase();
		const checkWeight = font.weight;
		return fontFaces.some(
			/**
			* @param {import('../css.js').FontParameters} f Font.
			* @return {boolean} Font matches.
			*/
			(f) => {
				const family = f.family.replace(/^['"]|['"]$/g, "").toLowerCase();
				const weight = fontWeights[f.weight] || f.weight;
				return family === checkFamily && f.style === font.style && weight == checkWeight;
			}
		);
	}
	async function check() {
		await fontFaceSet.ready;
		let done = true;
		const checkedFontsProperties = checkedFonts.getProperties();
		const fonts = Object.keys(checkedFontsProperties).filter((key) => checkedFontsProperties[key] < retries);
		for (let i = fonts.length - 1; i >= 0; --i) {
			const font = fonts[i];
			let currentRetries = checkedFontsProperties[font];
			if (currentRetries < retries) if (await isAvailable(font)) {
				clear(textHeights);
				checkedFonts.set(font, retries);
			} else {
				currentRetries += 10;
				checkedFonts.set(font, currentRetries, true);
				if (currentRetries < retries) done = false;
			}
		}
		timeout = void 0;
		if (!done) timeout = setTimeout(check, 100);
	}
	return async function(fontSpec) {
		if (!fontFaceSet) fontFaceSet = WORKER_OFFSCREEN_CANVAS ? self.fonts : document.fonts;
		const font = getFontParameters(fontSpec);
		if (!font) return;
		const families = font.families;
		let needCheck = false;
		for (const family of families) {
			if (genericFontFamilies.has(family)) continue;
			const key = getFontKey(font.style, font.weight, family);
			if (checkedFonts.get(key) !== void 0) continue;
			checkedFonts.set(key, 0, true);
			needCheck = true;
		}
		if (needCheck) {
			clearTimeout(timeout);
			timeout = setTimeout(check, 100);
		}
	};
})();
/**
* @param {string} font Font to use for measuring.
* @return {import("../size.js").Size} Measurement.
*/
var measureTextHeight = (function() {
	/**
	* @type {HTMLDivElement}
	*/
	let measureElement;
	return function(fontSpec) {
		let height = textHeights[fontSpec];
		if (height == void 0) {
			if (WORKER_OFFSCREEN_CANVAS) {
				const font = getFontParameters(fontSpec);
				const metrics = measureText(fontSpec, "Žg");
				height = (isNaN(Number(font.lineHeight)) ? 1.2 : Number(font.lineHeight)) * (metrics.actualBoundingBoxAscent + metrics.actualBoundingBoxDescent);
			} else {
				if (!measureElement) {
					measureElement = document.createElement("div");
					measureElement.innerHTML = "M";
					measureElement.style.minHeight = "0";
					measureElement.style.maxHeight = "none";
					measureElement.style.height = "auto";
					measureElement.style.padding = "0";
					measureElement.style.border = "none";
					measureElement.style.position = "absolute";
					measureElement.style.display = "block";
					measureElement.style.left = "-99999px";
				}
				measureElement.style.font = fontSpec;
				document.body.appendChild(measureElement);
				height = measureElement.offsetHeight;
				document.body.removeChild(measureElement);
			}
			textHeights[fontSpec] = height;
		}
		return height;
	};
})();
/**
* @param {string} font Font.
* @param {string} text Text.
* @return {TextMetrics} Text metrics.
*/
function measureText(font, text) {
	if (!measureContext) measureContext = createCanvasContext2D(1, 1);
	if (font != measureFont) {
		measureContext.font = font;
		measureFont = measureContext.font;
	}
	return measureContext.measureText(text);
}
/**
* @param {string} font Font.
* @param {string} text Text.
* @return {number} Width.
*/
function measureTextWidth(font, text) {
	return measureText(font, text).width;
}
/**
* Measure text width using a cache.
* @param {string} font The font.
* @param {string} text The text to measure.
* @param {Object<string, number>} cache A lookup of cached widths by text.
* @return {number} The text width.
*/
function measureAndCacheTextWidth(font, text, cache) {
	if (text in cache) return cache[text];
	const width = text.split("\n").reduce((prev, curr) => Math.max(prev, measureTextWidth(font, curr)), 0);
	cache[text] = width;
	return width;
}
/**
* @param {TextState} baseStyle Base style.
* @param {Array<string>} chunks Text chunks to measure.
* @return {{width: number, height: number, widths: Array<number>, heights: Array<number>, lineWidths: Array<number>}}} Text metrics.
*/
function getTextDimensions(baseStyle, chunks) {
	const widths = [];
	const heights = [];
	const lineWidths = [];
	let width = 0;
	let lineWidth = 0;
	let height = 0;
	let lineHeight = 0;
	for (let i = 0, ii = chunks.length; i <= ii; i += 2) {
		const text = chunks[i];
		if (text === "\n" || i === ii) {
			width = Math.max(width, lineWidth);
			lineWidths.push(lineWidth);
			lineWidth = 0;
			height += lineHeight;
			lineHeight = 0;
			continue;
		}
		const font = chunks[i + 1] || baseStyle.font;
		const currentWidth = measureTextWidth(font, text);
		widths.push(currentWidth);
		lineWidth += currentWidth;
		const currentHeight = measureTextHeight(font);
		heights.push(currentHeight);
		lineHeight = Math.max(lineHeight, currentHeight);
	}
	return {
		width,
		height,
		widths,
		heights,
		lineWidths
	};
}
/**
* @param {CanvasRenderingContext2D|import("../render/canvas/ZIndexContext.js").ZIndexContextProxy} context Context.
* @param {import("../transform.js").Transform|null} transform Transform.
* @param {number} opacity Opacity.
* @param {Label|HTMLCanvasElement|HTMLImageElement|HTMLVideoElement} labelOrImage Label.
* @param {number} originX Origin X.
* @param {number} originY Origin Y.
* @param {number} w Width.
* @param {number} h Height.
* @param {number} x X.
* @param {number} y Y.
* @param {import("../size.js").Size} scale Scale.
*/
function drawImageOrLabel(context, transform, opacity, labelOrImage, originX, originY, w, h, x, y, scale) {
	context.save();
	if (opacity !== 1) if (context.globalAlpha === void 0) context.globalAlpha = (context) => context.globalAlpha *= opacity;
	else context.globalAlpha *= opacity;
	if (transform) context.transform.apply(context, transform);
	if (labelOrImage.contextInstructions) {
		context.translate(x, y);
		context.scale(scale[0], scale[1]);
		executeLabelInstructions(labelOrImage, context);
	} else if (scale[0] < 0 || scale[1] < 0) {
		context.translate(x, y);
		context.scale(scale[0], scale[1]);
		context.drawImage(labelOrImage, originX, originY, w, h, 0, 0, w, h);
	} else context.drawImage(labelOrImage, originX, originY, w, h, x, y, w * scale[0], h * scale[1]);
	context.restore();
}
/**
* @param {Label} label Label.
* @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} context Context.
*/
function executeLabelInstructions(label, context) {
	const contextInstructions = label.contextInstructions;
	for (let i = 0, ii = contextInstructions.length; i < ii; i += 2) if (Array.isArray(contextInstructions[i + 1])) context[contextInstructions[i]].apply(context, contextInstructions[i + 1]);
	else context[contextInstructions[i]] = contextInstructions[i + 1];
}
//#endregion
//#region node_modules/ol/style/Image.js
/**
* @module ol/style/Image
*/
/**
* @typedef {Object} Options
* @property {number} opacity Opacity.
* @property {boolean} rotateWithView If the image should get rotated with the view.
* @property {number} rotation Rotation.
* @property {number|import("../size.js").Size} scale Scale.
* @property {Array<number>} displacement Displacement.
* @property {import('../style/Style.js').DeclutterMode} declutterMode Declutter mode: `declutter`, `obstacle`, `none`.
*/
/**
* @classdesc
* A base class used for creating subclasses and not instantiated in
* apps. Base class for {@link module:ol/style/Icon~Icon}, {@link module:ol/style/Circle~CircleStyle} and
* {@link module:ol/style/RegularShape~RegularShape}.
* @abstract
* @api
*/
var ImageStyle = class ImageStyle {
	/**
	* @param {Options} options Options.
	*/
	constructor(options) {
		/**
		* @private
		* @type {number}
		*/
		this.opacity_ = options.opacity;
		/**
		* @private
		* @type {boolean}
		*/
		this.rotateWithView_ = options.rotateWithView;
		/**
		* @private
		* @type {number}
		*/
		this.rotation_ = options.rotation;
		/**
		* @private
		* @type {number|import("../size.js").Size}
		*/
		this.scale_ = options.scale;
		/**
		* @private
		* @type {import("../size.js").Size}
		*/
		this.scaleArray_ = toSize(options.scale);
		/**
		* @private
		* @type {Array<number>}
		*/
		this.displacement_ = options.displacement;
		/**
		* @private
		* @type {import('../style/Style.js').DeclutterMode}
		*/
		this.declutterMode_ = options.declutterMode;
	}
	/**
	* Clones the style.
	* @return {ImageStyle} The cloned style.
	* @api
	*/
	clone() {
		const scale = this.getScale();
		return new ImageStyle({
			opacity: this.getOpacity(),
			scale: Array.isArray(scale) ? scale.slice() : scale,
			rotation: this.getRotation(),
			rotateWithView: this.getRotateWithView(),
			displacement: this.getDisplacement().slice(),
			declutterMode: this.getDeclutterMode()
		});
	}
	/**
	* Get the symbolizer opacity.
	* @return {number} Opacity.
	* @api
	*/
	getOpacity() {
		return this.opacity_;
	}
	/**
	* Determine whether the symbolizer rotates with the map.
	* @return {boolean} Rotate with map.
	* @api
	*/
	getRotateWithView() {
		return this.rotateWithView_;
	}
	/**
	* Get the symoblizer rotation.
	* @return {number} Rotation.
	* @api
	*/
	getRotation() {
		return this.rotation_;
	}
	/**
	* Get the symbolizer scale.
	* @return {number|import("../size.js").Size} Scale.
	* @api
	*/
	getScale() {
		return this.scale_;
	}
	/**
	* Get the symbolizer scale array.
	* @return {import("../size.js").Size} Scale array.
	*/
	getScaleArray() {
		return this.scaleArray_;
	}
	/**
	* Get the displacement of the shape
	* @return {Array<number>} Shape's center displacement
	* @api
	*/
	getDisplacement() {
		return this.displacement_;
	}
	/**
	* Get the declutter mode of the shape
	* @return {import("./Style.js").DeclutterMode} Shape's declutter mode
	* @api
	*/
	getDeclutterMode() {
		return this.declutterMode_;
	}
	/**
	* Get the anchor point in pixels. The anchor determines the center point for the
	* symbolizer.
	* @abstract
	* @return {Array<number>} Anchor.
	*/
	getAnchor() {
		return abstract();
	}
	/**
	* Get the image element for the symbolizer.
	* @abstract
	* @param {number} pixelRatio Pixel ratio.
	* @return {import('../DataTile.js').ImageLike} Image element.
	*/
	getImage(pixelRatio) {
		return abstract();
	}
	/**
	* @abstract
	* @return {import('../DataTile.js').ImageLike} Image element.
	*/
	getHitDetectionImage() {
		return abstract();
	}
	/**
	* Get the image pixel ratio.
	* @param {number} pixelRatio Pixel ratio.
	* @return {number} Pixel ratio.
	*/
	getPixelRatio(pixelRatio) {
		return 1;
	}
	/**
	* @abstract
	* @return {import("../ImageState.js").default} Image state.
	*/
	getImageState() {
		return abstract();
	}
	/**
	* @abstract
	* @return {import("../size.js").Size} Image size.
	*/
	getImageSize() {
		return abstract();
	}
	/**
	* Get the origin of the symbolizer.
	* @abstract
	* @return {Array<number>} Origin.
	*/
	getOrigin() {
		return abstract();
	}
	/**
	* Get the size of the symbolizer (in pixels).
	* @abstract
	* @return {import("../size.js").Size} Size.
	*/
	getSize() {
		return abstract();
	}
	/**
	* Set the displacement.
	*
	* @param {Array<number>} displacement Displacement.
	* @api
	*/
	setDisplacement(displacement) {
		this.displacement_ = displacement;
	}
	/**
	* Set the opacity.
	*
	* @param {number} opacity Opacity.
	* @api
	*/
	setOpacity(opacity) {
		this.opacity_ = opacity;
	}
	/**
	* Set whether to rotate the style with the view.
	*
	* @param {boolean} rotateWithView Rotate with map.
	* @api
	*/
	setRotateWithView(rotateWithView) {
		this.rotateWithView_ = rotateWithView;
	}
	/**
	* Set the rotation.
	*
	* @param {number} rotation Rotation.
	* @api
	*/
	setRotation(rotation) {
		this.rotation_ = rotation;
	}
	/**
	* Set the scale.
	*
	* @param {number|import("../size.js").Size} scale Scale.
	* @api
	*/
	setScale(scale) {
		this.scale_ = scale;
		this.scaleArray_ = toSize(scale);
	}
	/**
	* @abstract
	* @param {function(import("../events/Event.js").default): void} listener Listener function.
	*/
	listenImageChange(listener) {
		abstract();
	}
	/**
	* Load not yet loaded URI.
	* @abstract
	*/
	load() {
		abstract();
	}
	/**
	* @abstract
	* @param {function(import("../events/Event.js").default): void} listener Listener function.
	*/
	unlistenImageChange(listener) {
		abstract();
	}
	/**
	* @return {Promise<void>} `false` or Promise that resolves when the style is ready to use.
	*/
	ready() {
		return Promise.resolve();
	}
};
//#endregion
//#region node_modules/ol/style/RegularShape.js
/**
* @module ol/style/RegularShape
*/
/**
* Specify radius for regular polygons, or both radius and radius2 for stars.
* @typedef {Object} Options
* @property {import("./Fill.js").default} [fill] Fill style.
* @property {number} points Number of points for stars and regular polygons. In case of a polygon, the number of points
* is the number of sides.
* @property {number} radius Radius of a regular polygon.
* @property {number} [radius2] Second radius to make a star instead of a regular polygon.
* @property {number} [angle=0] Shape's angle in radians. A value of 0 will have one of the shape's points facing up.
* @property {Array<number>} [displacement=[0, 0]] Displacement of the shape in pixels.
* Positive values will shift the shape right and up.
* @property {import("./Stroke.js").default} [stroke] Stroke style.
* @property {number} [rotation=0] Rotation in radians (positive rotation clockwise).
* @property {boolean} [rotateWithView=false] Whether to rotate the shape with the view.
* @property {number|import("../size.js").Size} [scale=1] Scale. Unless two dimensional scaling is required a better
* result may be obtained with appropriate settings for `radius` and `radius2`.
* @property {import('./Style.js').DeclutterMode} [declutterMode] Declutter mode.
*/
/**
* @typedef {Object} RenderOptions
* @property {import("../colorlike.js").ColorLike|undefined} strokeStyle StrokeStyle.
* @property {number} strokeWidth StrokeWidth.
* @property {number} size Size.
* @property {CanvasLineCap} lineCap LineCap.
* @property {Array<number>|null} lineDash LineDash.
* @property {number} lineDashOffset LineDashOffset.
* @property {CanvasLineJoin} lineJoin LineJoin.
* @property {number} miterLimit MiterLimit.
*/
/**
* @classdesc
* Set regular shape style for vector features. The resulting shape will be
* a regular polygon when `radius` is provided, or a star when both `radius` and
* `radius2` are provided.
* @api
*/
var RegularShape = class RegularShape extends ImageStyle {
	/**
	* @param {Options} options Options.
	*/
	constructor(options) {
		super({
			opacity: 1,
			rotateWithView: options.rotateWithView !== void 0 ? options.rotateWithView : false,
			rotation: options.rotation !== void 0 ? options.rotation : 0,
			scale: options.scale !== void 0 ? options.scale : 1,
			displacement: options.displacement !== void 0 ? options.displacement : [0, 0],
			declutterMode: options.declutterMode
		});
		/**
		* @private
		* @type {HTMLCanvasElement|OffscreenCanvas|null}
		*/
		this.hitDetectionCanvas_ = null;
		/**
		* @private
		* @type {import("./Fill.js").default|null}
		*/
		this.fill_ = options.fill !== void 0 ? options.fill : null;
		/**
		* @private
		* @type {Array<number>}
		*/
		this.origin_ = [0, 0];
		/**
		* @private
		* @type {number}
		*/
		this.points_ = options.points;
		/**
		* @protected
		* @type {number}
		*/
		this.radius = options.radius;
		/**
		* @private
		* @type {number|undefined}
		*/
		this.radius2_ = options.radius2;
		/**
		* @private
		* @type {number}
		*/
		this.angle_ = options.angle !== void 0 ? options.angle : 0;
		/**
		* @private
		* @type {import("./Stroke.js").default|null}
		*/
		this.stroke_ = options.stroke !== void 0 ? options.stroke : null;
		/**
		* @private
		* @type {import("../size.js").Size}
		*/
		this.size_;
		/**
		* @private
		* @type {RenderOptions}
		*/
		this.renderOptions_;
		/**
		* @private
		*/
		this.imageState_ = this.fill_ && this.fill_.loading() ? ImageState_default.LOADING : ImageState_default.LOADED;
		if (this.imageState_ === ImageState_default.LOADING) this.ready().then(() => this.imageState_ = ImageState_default.LOADED);
		this.render();
	}
	/**
	* Clones the style.
	* @return {RegularShape} The cloned style.
	* @api
	* @override
	*/
	clone() {
		const scale = this.getScale();
		const style = new RegularShape({
			fill: this.getFill() ? this.getFill().clone() : void 0,
			points: this.getPoints(),
			radius: this.getRadius(),
			radius2: this.getRadius2(),
			angle: this.getAngle(),
			stroke: this.getStroke() ? this.getStroke().clone() : void 0,
			rotation: this.getRotation(),
			rotateWithView: this.getRotateWithView(),
			scale: Array.isArray(scale) ? scale.slice() : scale,
			displacement: this.getDisplacement().slice(),
			declutterMode: this.getDeclutterMode()
		});
		style.setOpacity(this.getOpacity());
		return style;
	}
	/**
	* Get the anchor point in pixels. The anchor determines the center point for the
	* symbolizer.
	* @return {Array<number>} Anchor.
	* @api
	* @override
	*/
	getAnchor() {
		const size = this.size_;
		const displacement = this.getDisplacement();
		const scale = this.getScaleArray();
		return [size[0] / 2 - displacement[0] / scale[0], size[1] / 2 + displacement[1] / scale[1]];
	}
	/**
	* Get the angle used in generating the shape.
	* @return {number} Shape's rotation in radians.
	* @api
	*/
	getAngle() {
		return this.angle_;
	}
	/**
	* Get the fill style for the shape.
	* @return {import("./Fill.js").default|null} Fill style.
	* @api
	*/
	getFill() {
		return this.fill_;
	}
	/**
	* Set the fill style.
	* @param {import("./Fill.js").default|null} fill Fill style.
	* @api
	*/
	setFill(fill) {
		this.fill_ = fill;
		this.render();
	}
	/**
	* @return {HTMLCanvasElement|OffscreenCanvas} Image element.
	* @override
	*/
	getHitDetectionImage() {
		if (!this.hitDetectionCanvas_) this.hitDetectionCanvas_ = this.createHitDetectionCanvas_(this.renderOptions_);
		return this.hitDetectionCanvas_;
	}
	/**
	* Get the image icon.
	* @param {number} pixelRatio Pixel ratio.
	* @return {HTMLCanvasElement|OffscreenCanvas} Image or Canvas element.
	* @api
	* @override
	*/
	getImage(pixelRatio) {
		const fillKey = this.fill_?.getKey();
		const cacheKey = `${pixelRatio},${this.angle_},${this.radius},${this.radius2_},${this.points_},${fillKey}` + Object.values(this.renderOptions_).join(",");
		let image = shared.get(cacheKey, null)?.getImage(1);
		if (!image) {
			const renderOptions = this.renderOptions_;
			const size = Math.ceil(renderOptions.size * pixelRatio);
			const context = createCanvasContext2D(size, size);
			this.draw_(renderOptions, context, pixelRatio);
			image = context.canvas;
			const iconImage = new IconImage(image, void 0, null, ImageState_default.LOADED, null);
			shared.set(cacheKey, null, iconImage);
			createImageBitmap(image).then((imageBitmap) => {
				iconImage.setImage(imageBitmap);
			});
		}
		return image;
	}
	/**
	* Get the image pixel ratio.
	* @param {number} pixelRatio Pixel ratio.
	* @return {number} Pixel ratio.
	* @override
	*/
	getPixelRatio(pixelRatio) {
		return pixelRatio;
	}
	/**
	* @return {import("../size.js").Size} Image size.
	* @override
	*/
	getImageSize() {
		return this.size_;
	}
	/**
	* @return {import("../ImageState.js").default} Image state.
	* @override
	*/
	getImageState() {
		return this.imageState_;
	}
	/**
	* Get the origin of the symbolizer.
	* @return {Array<number>} Origin.
	* @api
	* @override
	*/
	getOrigin() {
		return this.origin_;
	}
	/**
	* Get the number of points for generating the shape.
	* @return {number} Number of points for stars and regular polygons.
	* @api
	*/
	getPoints() {
		return this.points_;
	}
	/**
	* Get the (primary) radius for the shape.
	* @return {number} Radius.
	* @api
	*/
	getRadius() {
		return this.radius;
	}
	/**
	* Set the (primary) radius for the shape.
	* @param {number} radius Radius.
	* @api
	*/
	setRadius(radius) {
		if (this.radius === radius) return;
		this.radius = radius;
		this.render();
	}
	/**
	* Get the secondary radius for the shape.
	* @return {number|undefined} Radius2.
	* @api
	*/
	getRadius2() {
		return this.radius2_;
	}
	/**
	* Set the secondary radius for the shape.
	* @param {number|undefined} radius2 Radius2.
	* @api
	*/
	setRadius2(radius2) {
		if (this.radius2_ === radius2) return;
		this.radius2_ = radius2;
		this.render();
	}
	/**
	* Get the size of the symbolizer (in pixels).
	* @return {import("../size.js").Size} Size.
	* @api
	* @override
	*/
	getSize() {
		return this.size_;
	}
	/**
	* Get the stroke style for the shape.
	* @return {import("./Stroke.js").default|null} Stroke style.
	* @api
	*/
	getStroke() {
		return this.stroke_;
	}
	/**
	* Set the stroke style.
	* @param {import("./Stroke.js").default|null} stroke Stroke style.
	* @api
	*/
	setStroke(stroke) {
		this.stroke_ = stroke;
		this.render();
	}
	/**
	* @param {function(import("../events/Event.js").default): void} listener Listener function.
	* @override
	*/
	listenImageChange(listener) {}
	/**
	* Load not yet loaded URI.
	* @override
	*/
	load() {}
	/**
	* @param {function(import("../events/Event.js").default): void} listener Listener function.
	* @override
	*/
	unlistenImageChange(listener) {}
	/**
	* Calculate additional canvas size needed for the miter.
	* @param {string} lineJoin Line join
	* @param {number} strokeWidth Stroke width
	* @param {number} miterLimit Miter limit
	* @return {number} Additional canvas size needed
	* @private
	*/
	calculateLineJoinSize_(lineJoin, strokeWidth, miterLimit) {
		if (strokeWidth === 0 || this.points_ === Infinity || lineJoin !== "bevel" && lineJoin !== "miter") return strokeWidth;
		let r1 = this.radius;
		let r2 = this.radius2_ === void 0 ? r1 : this.radius2_;
		if (r1 < r2) {
			const tmp = r1;
			r1 = r2;
			r2 = tmp;
		}
		const points = this.radius2_ === void 0 ? this.points_ : this.points_ * 2;
		const alpha = 2 * Math.PI / points;
		const a = r2 * Math.sin(alpha);
		const b = Math.sqrt(r2 * r2 - a * a);
		const d = r1 - b;
		const e = Math.sqrt(a * a + d * d);
		const miterRatio = e / a;
		if (lineJoin === "miter" && miterRatio <= miterLimit) return miterRatio * strokeWidth;
		const k = strokeWidth / 2 / miterRatio;
		const l = strokeWidth / 2 * (d / e);
		const bevelAdd = Math.sqrt((r1 + k) * (r1 + k) + l * l) - r1;
		if (this.radius2_ === void 0 || lineJoin === "bevel") return bevelAdd * 2;
		const aa = r1 * Math.sin(alpha);
		const bb = Math.sqrt(r1 * r1 - aa * aa);
		const dd = r2 - bb;
		const innerMiterRatio = Math.sqrt(aa * aa + dd * dd) / aa;
		if (innerMiterRatio <= miterLimit) {
			const innerLength = innerMiterRatio * strokeWidth / 2 - r2 - r1;
			return 2 * Math.max(bevelAdd, innerLength);
		}
		return bevelAdd * 2;
	}
	/**
	* @return {RenderOptions}  The render options
	* @protected
	*/
	createRenderOptions() {
		let lineCap = defaultLineCap;
		let lineJoin = defaultLineJoin;
		let miterLimit = 0;
		let lineDash = null;
		let lineDashOffset = 0;
		let strokeStyle;
		let strokeWidth = 0;
		if (this.stroke_) {
			strokeStyle = asColorLike(this.stroke_.getColor() ?? "#000");
			strokeWidth = this.stroke_.getWidth() ?? 1;
			lineDash = this.stroke_.getLineDash();
			lineDashOffset = this.stroke_.getLineDashOffset() ?? 0;
			lineJoin = this.stroke_.getLineJoin() ?? "round";
			lineCap = this.stroke_.getLineCap() ?? "round";
			miterLimit = this.stroke_.getMiterLimit() ?? 10;
		}
		const add = this.calculateLineJoinSize_(lineJoin, strokeWidth, miterLimit);
		const maxRadius = Math.max(this.radius, this.radius2_ || 0);
		const size = Math.ceil(2 * maxRadius + add);
		return {
			strokeStyle,
			strokeWidth,
			size,
			lineCap,
			lineDash,
			lineDashOffset,
			lineJoin,
			miterLimit
		};
	}
	/**
	* @protected
	*/
	render() {
		this.renderOptions_ = this.createRenderOptions();
		const size = this.renderOptions_.size;
		this.hitDetectionCanvas_ = null;
		this.size_ = [size, size];
	}
	/**
	* @private
	* @param {RenderOptions} renderOptions Render options.
	* @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} context The rendering context.
	* @param {number} pixelRatio The pixel ratio.
	*/
	draw_(renderOptions, context, pixelRatio) {
		context.scale(pixelRatio, pixelRatio);
		context.translate(renderOptions.size / 2, renderOptions.size / 2);
		this.createPath_(context);
		if (this.fill_) {
			let color = this.fill_.getColor();
			if (color === null) color = defaultFillStyle;
			context.fillStyle = asColorLike(color);
			context.fill();
		}
		if (renderOptions.strokeStyle) {
			context.strokeStyle = renderOptions.strokeStyle;
			context.lineWidth = renderOptions.strokeWidth;
			if (renderOptions.lineDash) {
				context.setLineDash(renderOptions.lineDash);
				context.lineDashOffset = renderOptions.lineDashOffset;
			}
			context.lineCap = renderOptions.lineCap;
			context.lineJoin = renderOptions.lineJoin;
			context.miterLimit = renderOptions.miterLimit;
			context.stroke();
		}
	}
	/**
	* @private
	* @param {RenderOptions} renderOptions Render options.
	* @return {HTMLCanvasElement|OffscreenCanvas} Canvas containing the icon
	*/
	createHitDetectionCanvas_(renderOptions) {
		let context;
		if (this.fill_) {
			let color = this.fill_.getColor();
			let opacity = 0;
			if (typeof color === "string") color = asArray(color);
			if (color === null) opacity = 1;
			else if (Array.isArray(color)) opacity = color.length === 4 ? color[3] : 1;
			if (opacity === 0) {
				context = createCanvasContext2D(renderOptions.size, renderOptions.size);
				this.drawHitDetectionCanvas_(renderOptions, context);
			}
		}
		return context ? context.canvas : this.getImage(1);
	}
	/**
	* @private
	* @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} context The context to draw in.
	*/
	createPath_(context) {
		let points = this.points_;
		const radius = this.radius;
		if (points === Infinity) context.arc(0, 0, radius, 0, 2 * Math.PI);
		else {
			const radius2 = this.radius2_ === void 0 ? radius : this.radius2_;
			if (this.radius2_ !== void 0) points *= 2;
			const startAngle = this.angle_ - Math.PI / 2;
			const step = 2 * Math.PI / points;
			for (let i = 0; i < points; i++) {
				const angle0 = startAngle + i * step;
				const radiusC = i % 2 === 0 ? radius : radius2;
				context.lineTo(radiusC * Math.cos(angle0), radiusC * Math.sin(angle0));
			}
			context.closePath();
		}
	}
	/**
	* @private
	* @param {RenderOptions} renderOptions Render options.
	* @param {CanvasRenderingContext2D|OffscreenCanvasRenderingContext2D} context The context.
	*/
	drawHitDetectionCanvas_(renderOptions, context) {
		context.translate(renderOptions.size / 2, renderOptions.size / 2);
		this.createPath_(context);
		context.fillStyle = defaultFillStyle;
		context.fill();
		if (renderOptions.strokeStyle) {
			context.strokeStyle = renderOptions.strokeStyle;
			context.lineWidth = renderOptions.strokeWidth;
			if (renderOptions.lineDash) {
				context.setLineDash(renderOptions.lineDash);
				context.lineDashOffset = renderOptions.lineDashOffset;
			}
			context.lineJoin = renderOptions.lineJoin;
			context.miterLimit = renderOptions.miterLimit;
			context.stroke();
		}
	}
	/**
	* @override
	*/
	ready() {
		return this.fill_ ? this.fill_.ready() : Promise.resolve();
	}
};
//#endregion
//#region node_modules/ol/style/Circle.js
/**
* @module ol/style/Circle
*/
/**
* @typedef {Object} Options
* @property {import("./Fill.js").default} [fill] Fill style.
* @property {number} radius Circle radius.
* @property {import("./Stroke.js").default} [stroke] Stroke style.
* @property {Array<number>} [displacement=[0,0]] displacement
* @property {number|import("../size.js").Size} [scale=1] Scale. A two dimensional scale will produce an ellipse.
* Unless two dimensional scaling is required a better result may be obtained with an appropriate setting for `radius`.
* @property {number} [rotation=0] Rotation in radians
* (positive rotation clockwise, meaningful only when used in conjunction with a two dimensional scale).
* @property {boolean} [rotateWithView=false] Whether to rotate the shape with the view
* (meaningful only when used in conjunction with a two dimensional scale).
* @property {import('./Style.js').DeclutterMode} [declutterMode] Declutter mode
*/
/**
* @classdesc
* Set circle style for vector features.
* @api
*/
var CircleStyle = class CircleStyle extends RegularShape {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		options = options ? options : { radius: 5 };
		super({
			points: Infinity,
			fill: options.fill,
			radius: options.radius,
			stroke: options.stroke,
			scale: options.scale !== void 0 ? options.scale : 1,
			rotation: options.rotation !== void 0 ? options.rotation : 0,
			rotateWithView: options.rotateWithView !== void 0 ? options.rotateWithView : false,
			displacement: options.displacement !== void 0 ? options.displacement : [0, 0],
			declutterMode: options.declutterMode
		});
	}
	/**
	* Clones the style.
	* @return {CircleStyle} The cloned style.
	* @api
	* @override
	*/
	clone() {
		const scale = this.getScale();
		const style = new CircleStyle({
			fill: this.getFill() ? this.getFill().clone() : void 0,
			stroke: this.getStroke() ? this.getStroke().clone() : void 0,
			radius: this.getRadius(),
			scale: Array.isArray(scale) ? scale.slice() : scale,
			rotation: this.getRotation(),
			rotateWithView: this.getRotateWithView(),
			displacement: this.getDisplacement().slice(),
			declutterMode: this.getDeclutterMode()
		});
		style.setOpacity(this.getOpacity());
		return style;
	}
};
//#endregion
export { toString as A, CLASS_COLLAPSED as B, hasArea as C, fromString as D, asArray as E, isCanvas as F, MAC as G, CLASS_HIDDEN as H, releaseCanvas as I, WORKER_OFFSCREEN_CANVAS as J, PASSIVE_EVENT_LISTENERS as K, removeChildren as L, createCanvasContext2D as M, createMockDiv as N, lchaToRgba as O, getSharedCanvasContext2D as P, replaceChildren as R, ImageState_default as S, NO_COLOR as T, CLASS_UNSELECTABLE as U, CLASS_CONTROL as V, DEVICE_PIXEL_RATIO as W, registerFont as _, defaultFillStyle as a, get as b, defaultLineDash as c, defaultStrokeStyle as d, defaultTextAlign as f, measureAndCacheTextWidth as g, getTextDimensions as h, checkedFonts as i, withAlpha as j, rgbaToLcha as k, defaultLineJoin as l, drawImageOrLabel as m, RegularShape as n, defaultFont as o, defaultTextBaseline as p, WEBKIT as q, ImageStyle as r, defaultLineCap as s, CircleStyle as t, defaultPadding as u, asColorLike as v, toSize as w, shared as x, IconImage as y, replaceNode as z };

//# sourceMappingURL=Circle-Cfa2pvvk.js.map