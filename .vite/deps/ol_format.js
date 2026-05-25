import { g as extend, n as abstract } from "./Object-DolGq2cf.js";
import { n as isEmpty } from "./obj-BGAAjjDC.js";
import { E as asArray, S as ImageState_default } from "./Circle-Cfa2pvvk.js";
import { t as assert } from "./asserts-CxKOIJBj.js";
import { c as toRadians } from "./math-C8anmfUQ.js";
import { G as padNumber, K as boundingExtent, P as Projection, W as compareVersions, Z as containsExtent, tt as createOrUpdate, y as get } from "./proj-BM-4T99l.js";
import { A as Geometry, E as SimpleGeometry, O as getStrideForLayout, _ as deflateCoordinates } from "./intersectsextent-Bqx-JGI7.js";
import { h as LinearRing, m as Point, o as inflateEnds, s as linearRingIsClockwise, t as Polygon } from "./Polygon-BePo0SOh.js";
import { a as Fill, t as Style } from "./Style-D0OHOC_M.js";
import { n as Icon, t as Text } from "./Text-DOTJW4YE.js";
import Stroke from "./ol_style_Stroke.js";
import Feature from "./ol_Feature.js";
import { t as LineString } from "./LineString-CQ7TDKcW.js";
import { i as MultiLineString, r as MultiPoint, t as MultiPolygon } from "./MultiPolygon-CU2pbURn.js";
import { t as GeometryCollection } from "./GeometryCollection-9sZ4xAy5.js";
import { t as RenderFeature } from "./Feature-DFhL74iV.js";
import { a as transformGeometryWithOptions, i as transformExtentWithOptions, n as JSONFeature, r as FeatureFormat, t as GeoJSON } from "./GeoJSON-C-RoDr-h.js";
//#region node_modules/ol/format/EsriJSON.js
/**
* @module ol/format/EsriJSON
*/
/**
* @typedef {import("arcgis-rest-api").Feature} EsriJSONFeature
* @typedef {import("arcgis-rest-api").FeatureSet} EsriJSONFeatureSet
* @typedef {import("arcgis-rest-api").Geometry} EsriJSONGeometry
* @typedef {import("arcgis-rest-api").Point} EsriJSONPoint
* @typedef {import("arcgis-rest-api").Polyline} EsriJSONPolyline
* @typedef {import("arcgis-rest-api").Polygon} EsriJSONPolygon
* @typedef {import("arcgis-rest-api").Multipoint} EsriJSONMultipoint
* @typedef {import("arcgis-rest-api").HasZM} EsriJSONHasZM
* @typedef {import("arcgis-rest-api").Position} EsriJSONPosition
* @typedef {import("arcgis-rest-api").SpatialReferenceWkid} EsriJSONSpatialReferenceWkid
*/
/**
* @typedef {Object} EsriJSONMultiPolygon
* @property {Array<Array<Array<Array<number>>>>} rings Rings for the MultiPolygon.
* @property {boolean} [hasM] If the polygon coordinates have an M value.
* @property {boolean} [hasZ] If the polygon coordinates have a Z value.
* @property {EsriJSONSpatialReferenceWkid} [spatialReference] The coordinate reference system.
*/
/**
* @const
* @type {Object<import("../geom/Geometry.js").Type, function(EsriJSONGeometry): import("../geom/Geometry.js").default>}
*/
var GEOMETRY_READERS$1 = {
	Point: readPointGeometry$1,
	LineString: readLineStringGeometry$1,
	Polygon: readPolygonGeometry$1,
	MultiPoint: readMultiPointGeometry$1,
	MultiLineString: readMultiLineStringGeometry$1,
	MultiPolygon: readMultiPolygonGeometry$1
};
/**
* @const
* @type {Object<import("../geom/Geometry.js").Type, function(import("../geom/Geometry.js").default, import("./Feature.js").WriteOptions=): (EsriJSONGeometry)>}
*/
var GEOMETRY_WRITERS = {
	Point: writePointGeometry,
	LineString: writeLineStringGeometry,
	Polygon: writePolygonGeometry,
	MultiPoint: writeMultiPointGeometry,
	MultiLineString: writeMultiLineStringGeometry,
	MultiPolygon: writeMultiPolygonGeometry
};
/**
* @typedef {Object} Options
* @property {string} [geometryName] Geometry name to use when creating features.
*/
/**
* @classdesc
* Feature format for reading and writing data in the EsriJSON format.
*
* @api
*/
var EsriJSON = class extends JSONFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		options = options ? options : {};
		super();
		/**
		* Name of the geometry attribute for features.
		* @type {string|undefined}
		* @private
		*/
		this.geometryName_ = options.geometryName;
	}
	/**
	* @param {Object} object Object.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @param {string} [idField] Name of the field where to get the id from.
	* @protected
	* @return {import("../Feature.js").default} Feature.
	* @override
	*/
	readFeatureFromObject(object, options, idField) {
		const esriJSONFeature = object;
		const geometry = readGeometry(esriJSONFeature.geometry, options);
		const feature = new Feature();
		if (this.geometryName_) feature.setGeometryName(this.geometryName_);
		feature.setGeometry(geometry);
		if (esriJSONFeature.attributes) {
			feature.setProperties(esriJSONFeature.attributes, true);
			const id = esriJSONFeature.attributes[idField];
			if (id !== void 0) feature.setId(id);
		}
		return feature;
	}
	/**
	* @param {Object} object Object.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {Array<Feature>} Features.
	* @override
	*/
	readFeaturesFromObject(object, options) {
		options = options ? options : {};
		if (object["features"]) {
			const esriJSONFeatureSet = object;
			/** @type {Array<import("../Feature.js").default>} */
			const features = [];
			const esriJSONFeatures = esriJSONFeatureSet.features;
			for (let i = 0, ii = esriJSONFeatures.length; i < ii; ++i) features.push(this.readFeatureFromObject(esriJSONFeatures[i], options, object.objectIdFieldName));
			return features;
		}
		return [this.readFeatureFromObject(object, options)];
	}
	/**
	* @param {EsriJSONGeometry} object Object.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @override
	*/
	readGeometryFromObject(object, options) {
		return readGeometry(object, options);
	}
	/**
	* @param {Object} object Object.
	* @protected
	* @return {import("../proj/Projection.js").default} Projection.
	* @override
	*/
	readProjectionFromObject(object) {
		if (object["spatialReference"] && object["spatialReference"]["wkid"] !== void 0) {
			const crs = object["spatialReference"].wkid;
			return get("EPSG:" + crs);
		}
		return null;
	}
	/**
	* Encode a geometry as a EsriJSON object.
	*
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {EsriJSONGeometry} Object.
	* @api
	* @override
	*/
	writeGeometryObject(geometry, options) {
		return writeGeometry(geometry, this.adaptOptions(options));
	}
	/**
	* Encode a feature as a esriJSON Feature object.
	*
	* @param {import("../Feature.js").default} feature Feature.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {Object} Object.
	* @api
	* @override
	*/
	writeFeatureObject(feature, options) {
		options = this.adaptOptions(options);
		const object = {};
		if (!feature.hasProperties()) {
			object["attributes"] = {};
			return object;
		}
		const properties = feature.getProperties();
		const geometry = feature.getGeometry();
		if (geometry) {
			object["geometry"] = writeGeometry(geometry, options);
			const projection = options && (options.dataProjection || options.featureProjection);
			if (projection) object["geometry"]["spatialReference"] = { wkid: Number(get(projection).getCode().split(":").pop()) };
			delete properties[feature.getGeometryName()];
		}
		if (!isEmpty(properties)) object["attributes"] = properties;
		else object["attributes"] = {};
		return object;
	}
	/**
	* Encode an array of features as a EsriJSON object.
	*
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {EsriJSONFeatureSet} EsriJSON Object.
	* @api
	* @override
	*/
	writeFeaturesObject(features, options) {
		options = this.adaptOptions(options);
		const objects = [];
		for (let i = 0, ii = features.length; i < ii; ++i) objects.push(this.writeFeatureObject(features[i], options));
		return { "features": objects };
	}
};
/**
* @param {EsriJSONGeometry} object Object.
* @param {import("./Feature.js").ReadOptions} [options] Read options.
* @return {import("../geom/Geometry.js").default} Geometry.
*/
function readGeometry(object, options) {
	if (!object) return null;
	/** @type {import("../geom/Geometry.js").Type} */
	let type;
	if (typeof object["x"] === "number" && typeof object["y"] === "number") type = "Point";
	else if (object["points"]) type = "MultiPoint";
	else if (object["paths"]) if (object.paths.length === 1) type = "LineString";
	else type = "MultiLineString";
	else if (object["rings"]) {
		const esriJSONPolygon = object;
		const layout = getGeometryLayout(esriJSONPolygon);
		const rings = convertRings(esriJSONPolygon.rings, layout);
		if (rings.length === 1) {
			type = "Polygon";
			object = Object.assign({}, object, { ["rings"]: rings[0] });
		} else {
			type = "MultiPolygon";
			object = Object.assign({}, object, { ["rings"]: rings });
		}
	}
	const geometryReader = GEOMETRY_READERS$1[type];
	return transformGeometryWithOptions(geometryReader(object), false, options);
}
/**
* Determines inner and outer rings.
* Checks if any polygons in this array contain any other polygons in this
* array. It is used for checking for holes.
* Logic inspired by: https://github.com/Esri/terraformer-arcgis-parser
* @param {Array<!Array<!Array<number>>>} rings Rings.
* @param {import("../geom/Geometry.js").GeometryLayout} layout Geometry layout.
* @return {Array<!Array<!Array<!Array<number>>>>} Transformed rings.
*/
function convertRings(rings, layout) {
	const flatRing = [];
	const outerRings = [];
	const holes = [];
	let i, ii;
	for (i = 0, ii = rings.length; i < ii; ++i) {
		flatRing.length = 0;
		deflateCoordinates(flatRing, 0, rings[i], layout.length);
		if (linearRingIsClockwise(flatRing, 0, flatRing.length, layout.length)) outerRings.push([rings[i]]);
		else holes.push(rings[i]);
	}
	while (holes.length) {
		const hole = holes.shift();
		let matched = false;
		for (i = outerRings.length - 1; i >= 0; i--) {
			const outerRing = outerRings[i][0];
			if (containsExtent(new LinearRing(outerRing).getExtent(), new LinearRing(hole).getExtent())) {
				outerRings[i].push(hole);
				matched = true;
				break;
			}
		}
		if (!matched) outerRings.push([hole.reverse()]);
	}
	return outerRings;
}
/**
* @param {EsriJSONPoint} object Object.
* @return {import("../geom/Geometry.js").default} Point.
*/
function readPointGeometry$1(object) {
	let point;
	if (object.m !== void 0 && object.z !== void 0) point = new Point([
		object.x,
		object.y,
		object.z,
		object.m
	], "XYZM");
	else if (object.z !== void 0) point = new Point([
		object.x,
		object.y,
		object.z
	], "XYZ");
	else if (object.m !== void 0) point = new Point([
		object.x,
		object.y,
		object.m
	], "XYM");
	else point = new Point([object.x, object.y]);
	return point;
}
/**
* @param {EsriJSONPolyline} object Object.
* @return {import("../geom/Geometry.js").default} LineString.
*/
function readLineStringGeometry$1(object) {
	const layout = getGeometryLayout(object);
	return new LineString(object.paths[0], layout);
}
/**
* @param {EsriJSONPolyline} object Object.
* @return {import("../geom/Geometry.js").default} MultiLineString.
*/
function readMultiLineStringGeometry$1(object) {
	const layout = getGeometryLayout(object);
	return new MultiLineString(object.paths, layout);
}
/**
* @param {EsriJSONHasZM} object Object.
* @return {import("../geom/Geometry.js").GeometryLayout} The geometry layout to use.
*/
function getGeometryLayout(object) {
	/** @type {import("../geom/Geometry.js").GeometryLayout} */
	let layout = "XY";
	if (object.hasZ === true && object.hasM === true) layout = "XYZM";
	else if (object.hasZ === true) layout = "XYZ";
	else if (object.hasM === true) layout = "XYM";
	return layout;
}
/**
* @param {EsriJSONMultipoint} object Object.
* @return {import("../geom/Geometry.js").default} MultiPoint.
*/
function readMultiPointGeometry$1(object) {
	const layout = getGeometryLayout(object);
	return new MultiPoint(object.points, layout);
}
/**
* @param {EsriJSONMultiPolygon} object Object.
* @return {import("../geom/Geometry.js").default} MultiPolygon.
*/
function readMultiPolygonGeometry$1(object) {
	const layout = getGeometryLayout(object);
	return new MultiPolygon(object.rings, layout);
}
/**
* @param {EsriJSONPolygon} object Object.
* @return {import("../geom/Geometry.js").default} Polygon.
*/
function readPolygonGeometry$1(object) {
	const layout = getGeometryLayout(object);
	return new Polygon(object.rings, layout);
}
/**
* @param {import("../geom/Point.js").default} geometry Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPoint} EsriJSON geometry.
*/
function writePointGeometry(geometry, options) {
	const coordinates = geometry.getCoordinates();
	/** @type {EsriJSONPoint} */
	let esriJSON;
	const layout = geometry.getLayout();
	if (layout === "XYZ") esriJSON = {
		x: coordinates[0],
		y: coordinates[1],
		z: coordinates[2]
	};
	else if (layout === "XYM") esriJSON = {
		x: coordinates[0],
		y: coordinates[1],
		m: coordinates[2]
	};
	else if (layout === "XYZM") esriJSON = {
		x: coordinates[0],
		y: coordinates[1],
		z: coordinates[2],
		m: coordinates[3]
	};
	else if (layout === "XY") esriJSON = {
		x: coordinates[0],
		y: coordinates[1]
	};
	else throw new Error("Invalid geometry layout");
	return esriJSON;
}
/**
* @param {import("../geom/SimpleGeometry.js").default} geometry Geometry.
* @return {Object} Object with boolean hasZ and hasM keys.
*/
function getHasZM(geometry) {
	const layout = geometry.getLayout();
	return {
		hasZ: layout === "XYZ" || layout === "XYZM",
		hasM: layout === "XYM" || layout === "XYZM"
	};
}
/**
* @param {import("../geom/LineString.js").default} lineString Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPolyline} EsriJSON geometry.
*/
function writeLineStringGeometry(lineString, options) {
	const hasZM = getHasZM(lineString);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		paths: [lineString.getCoordinates()]
	};
}
/**
* @param {import("../geom/Polygon.js").default} polygon Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPolygon} EsriJSON geometry.
*/
function writePolygonGeometry(polygon, options) {
	const hasZM = getHasZM(polygon);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		rings: polygon.getCoordinates(false)
	};
}
/**
* @param {import("../geom/MultiLineString.js").default} multiLineString Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPolyline} EsriJSON geometry.
*/
function writeMultiLineStringGeometry(multiLineString, options) {
	const hasZM = getHasZM(multiLineString);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		paths: multiLineString.getCoordinates()
	};
}
/**
* @param {import("../geom/MultiPoint.js").default} multiPoint Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONMultipoint} EsriJSON geometry.
*/
function writeMultiPointGeometry(multiPoint, options) {
	const hasZM = getHasZM(multiPoint);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		points: multiPoint.getCoordinates()
	};
}
/**
* @param {import("../geom/MultiPolygon.js").default} geometry Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONPolygon} EsriJSON geometry.
*/
function writeMultiPolygonGeometry(geometry, options) {
	const hasZM = getHasZM(geometry);
	const coordinates = geometry.getCoordinates(false);
	const output = [];
	for (let i = 0; i < coordinates.length; i++) for (let x = coordinates[i].length - 1; x >= 0; x--) output.push(coordinates[i][x]);
	return {
		hasZ: hasZM.hasZ,
		hasM: hasZM.hasM,
		rings: output
	};
}
/**
* @param {import("../geom/Geometry.js").default} geometry Geometry.
* @param {import("./Feature.js").WriteOptions} [options] Write options.
* @return {EsriJSONGeometry} EsriJSON geometry.
*/
function writeGeometry(geometry, options) {
	const geometryWriter = GEOMETRY_WRITERS[geometry.getType()];
	return geometryWriter(transformGeometryWithOptions(geometry, true, options), options);
}
//#endregion
//#region node_modules/ol/xml.js
/**
* @module ol/xml
*/
/**
* When using {@link module:ol/xml.makeChildAppender} or
* {@link module:ol/xml.makeSimpleNodeFactory}, the top `objectStack` item needs
* to have this structure.
* @typedef {Object} NodeStackItem
* @property {Element} node Node.
*/
/**
* @typedef {function(Element, Array<*>): void} Parser
*/
/**
* @typedef {function(Element, *, Array<*>): void} Serializer
*/
/**
* @type {string}
*/
var XML_SCHEMA_INSTANCE_URI = "http://www.w3.org/2001/XMLSchema-instance";
/**
* @param {string} namespaceURI Namespace URI.
* @param {string} qualifiedName Qualified name.
* @return {Element} Node.
*/
function createElementNS(namespaceURI, qualifiedName) {
	return getDocument().createElementNS(namespaceURI, qualifiedName);
}
/**
* Recursively grab all text content of child nodes into a single string.
* @param {Node} node Node.
* @param {boolean} normalizeWhitespace Normalize whitespace: remove all line
* breaks.
* @return {string} All text content.
* @api
*/
function getAllTextContent(node, normalizeWhitespace) {
	return getAllTextContent_(node, normalizeWhitespace, []).join("");
}
/**
* Recursively grab all text content of child nodes into a single string.
* @param {Node} node Node.
* @param {boolean} normalizeWhitespace Normalize whitespace: remove all line
* breaks.
* @param {Array<string>} accumulator Accumulator.
* @private
* @return {Array<string>} Accumulator.
*/
function getAllTextContent_(node, normalizeWhitespace, accumulator) {
	if (node.nodeType == Node.CDATA_SECTION_NODE || node.nodeType == Node.TEXT_NODE) if (normalizeWhitespace) accumulator.push(String(node.nodeValue).replace(/(\r\n|\r|\n)/g, ""));
	else accumulator.push(node.nodeValue);
	else {
		let n;
		for (n = node.firstChild; n; n = n.nextSibling) getAllTextContent_(n, normalizeWhitespace, accumulator);
	}
	return accumulator;
}
/**
* @param {Object} object Object.
* @return {boolean} Is a document.
*/
function isDocument(object) {
	return "documentElement" in object;
}
/**
* @param {Element} node Node.
* @param {?string} namespaceURI Namespace URI.
* @param {string} name Attribute name.
* @return {string} Value
*/
function getAttributeNS(node, namespaceURI, name) {
	return node.getAttributeNS(namespaceURI, name) || "";
}
/**
* Parse an XML string to an XML Document.
* @param {string} xml XML.
* @return {Document} Document.
* @api
*/
function parse(xml) {
	return new DOMParser().parseFromString(xml, "application/xml");
}
/**
* Make an array extender function for extending the array at the top of the
* object stack.
* @param {function(this: T, Node, Array<*>): (Array<*>|undefined)} valueReader Value reader.
* @param {T} [thisArg] The object to use as `this` in `valueReader`.
* @return {Parser} Parser.
* @template T
*/
function makeArrayExtender(valueReader, thisArg) {
	return (function(node, objectStack) {
		const value = valueReader.call(thisArg ?? this, node, objectStack);
		if (value !== void 0) {
			const array = objectStack[objectStack.length - 1];
			extend(array, value);
		}
	});
}
/**
* Make an array pusher function for pushing to the array at the top of the
* object stack.
* @param {function(this: T, Element, Array<*>): *} valueReader Value reader.
* @param {T} [thisArg] The object to use as `this` in `valueReader`.
* @return {Parser} Parser.
* @template T
*/
function makeArrayPusher(valueReader, thisArg) {
	return (function(node, objectStack) {
		const value = valueReader.call(thisArg ?? this, node, objectStack);
		if (value !== void 0) objectStack[objectStack.length - 1].push(value);
	});
}
/**
* Make an object stack replacer function for replacing the object at the
* top of the stack.
* @param {function(this: T, Node, Array<*>): *} valueReader Value reader.
* @param {T} [thisArg] The object to use as `this` in `valueReader`.
* @return {Parser} Parser.
* @template T
*/
function makeReplacer(valueReader, thisArg) {
	return (function(node, objectStack) {
		const value = valueReader.call(thisArg ?? this, node, objectStack);
		if (value !== void 0) objectStack[objectStack.length - 1] = value;
	});
}
/**
* Make an object property pusher function for adding a property to the
* object at the top of the stack.
* @param {function(this: T, Element, Array<*>): *} valueReader Value reader.
* @param {string} [property] Property.
* @param {T} [thisArg] The object to use as `this` in `valueReader`.
* @return {Parser} Parser.
* @template T
*/
function makeObjectPropertyPusher(valueReader, property, thisArg) {
	return (function(node, objectStack) {
		const value = valueReader.call(thisArg ?? this, node, objectStack);
		if (value !== void 0) {
			const object = objectStack[objectStack.length - 1];
			const name = property !== void 0 ? property : node.localName;
			let array;
			if (name in object) array = object[name];
			else {
				array = [];
				object[name] = array;
			}
			array.push(value);
		}
	});
}
/**
* Make an object property setter function.
* @param {function(this: T, Element, Array<*>): *} valueReader Value reader.
* @param {string} [property] Property.
* @param {T} [thisArg] The object to use as `this` in `valueReader`.
* @return {Parser} Parser.
* @template T
*/
function makeObjectPropertySetter(valueReader, property, thisArg) {
	return (function(node, objectStack) {
		const value = valueReader.call(thisArg ?? this, node, objectStack);
		if (value !== void 0) {
			const object = objectStack[objectStack.length - 1];
			const name = property !== void 0 ? property : node.localName;
			object[name] = value;
		}
	});
}
/**
* Create a serializer that appends nodes written by its `nodeWriter` to its
* designated parent. The parent is the `node` of the
* {@link module:ol/xml~NodeStackItem} at the top of the `objectStack`.
* @param {function(this: T, Node, V, Array<*>): void} nodeWriter Node writer.
* @param {T} [thisArg] The object to use as `this` in `nodeWriter`.
* @return {Serializer} Serializer.
* @template T, V
*/
function makeChildAppender(nodeWriter, thisArg) {
	return (function(node, value, objectStack) {
		nodeWriter.call(thisArg ?? this, node, value, objectStack);
		objectStack[objectStack.length - 1].node.appendChild(node);
	});
}
/**
* Create a serializer that calls the provided `nodeWriter` from
* {@link module:ol/xml.serialize}. This can be used by the parent writer to have the
* `nodeWriter` called with an array of values when the `nodeWriter` was
* designed to serialize a single item. An example would be a LineString
* geometry writer, which could be reused for writing MultiLineString
* geometries.
* @param {function(this: T, Element, V, Array<*>): void} nodeWriter Node writer.
* @param {T} [thisArg] The object to use as `this` in `nodeWriter`.
* @return {Serializer} Serializer.
* @template T, V
*/
function makeArraySerializer(nodeWriter, thisArg) {
	let serializersNS, nodeFactory;
	return function(node, value, objectStack) {
		if (serializersNS === void 0) {
			serializersNS = {};
			const serializers = {};
			serializers[node.localName] = nodeWriter;
			serializersNS[node.namespaceURI] = serializers;
			nodeFactory = makeSimpleNodeFactory(node.localName);
		}
		serialize(serializersNS, nodeFactory, value, objectStack);
	};
}
/**
* Create a node factory which can use the `keys` passed to
* {@link module:ol/xml.serialize} or {@link module:ol/xml.pushSerializeAndPop} as node names,
* or a fixed node name. The namespace of the created nodes can either be fixed,
* or the parent namespace will be used.
* @param {string} [fixedNodeName] Fixed node name which will be used for all
*     created nodes. If not provided, the 3rd argument to the resulting node
*     factory needs to be provided and will be the nodeName.
* @param {string} [fixedNamespaceURI] Fixed namespace URI which will be used for
*     all created nodes. If not provided, the namespace of the parent node will
*     be used.
* @return {function(*, Array<*>, string=): (Node|undefined)} Node factory.
*/
function makeSimpleNodeFactory(fixedNodeName, fixedNamespaceURI) {
	return (function(value, objectStack, newNodeName) {
		const node = objectStack[objectStack.length - 1].node;
		let nodeName = fixedNodeName;
		if (nodeName === void 0) nodeName = newNodeName;
		return createElementNS(fixedNamespaceURI !== void 0 ? fixedNamespaceURI : node.namespaceURI, nodeName);
	});
}
/**
* A node factory that creates a node using the parent's `namespaceURI` and the
* `nodeName` passed by {@link module:ol/xml.serialize} or
* {@link module:ol/xml.pushSerializeAndPop} to the node factory.
* @const
* @type {function(*, Array<*>, string=): (Node|undefined)}
*/
var OBJECT_PROPERTY_NODE_FACTORY = makeSimpleNodeFactory();
/**
* Create an array of `values` to be used with {@link module:ol/xml.serialize} or
* {@link module:ol/xml.pushSerializeAndPop}, where `orderedKeys` has to be provided as
* `key` argument.
* @param {Object<string, *>} object Key-value pairs for the sequence. Keys can
*     be a subset of the `orderedKeys`.
* @param {Array<string>} orderedKeys Keys in the order of the sequence.
* @return {Array<*>} Values in the order of the sequence. The resulting array
*     has the same length as the `orderedKeys` array. Values that are not
*     present in `object` will be `undefined` in the resulting array.
*/
function makeSequence(object, orderedKeys) {
	const length = orderedKeys.length;
	const sequence = new Array(length);
	for (let i = 0; i < length; ++i) sequence[i] = object[orderedKeys[i]];
	return sequence;
}
/**
* Create a namespaced structure, using the same values for each namespace.
* This can be used as a starting point for versioned parsers, when only a few
* values are version specific.
* @param {Array<string>} namespaceURIs Namespace URIs.
* @param {T} structure Structure.
* @param {Object<string, T>} [structureNS] Namespaced structure to add to.
* @return {Object<string, T>} Namespaced structure.
* @template T
*/
function makeStructureNS(namespaceURIs, structure, structureNS) {
	structureNS = structureNS !== void 0 ? structureNS : {};
	let i, ii;
	for (i = 0, ii = namespaceURIs.length; i < ii; ++i) structureNS[namespaceURIs[i]] = structure;
	return structureNS;
}
/**
* Parse a node using the parsers and object stack.
* @param {Object<string, Object<string, Parser>>} parsersNS
*     Parsers by namespace.
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @param {*} [thisArg] The object to use as `this`.
*/
function parseNode(parsersNS, node, objectStack, thisArg) {
	let n;
	for (n = node.firstElementChild; n; n = n.nextElementSibling) {
		const parsers = parsersNS[n.namespaceURI];
		if (parsers !== void 0) {
			const parser = parsers[n.localName];
			if (parser !== void 0) parser.call(thisArg, n, objectStack);
		}
	}
}
/**
* Push an object on top of the stack, parse and return the popped object.
* @param {T} object Object.
* @param {Object<string, Object<string, Parser>>} parsersNS
*     Parsers by namespace.
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @param {*} [thisArg] The object to use as `this`.
* @return {T} Object.
* @template T
*/
function pushParseAndPop(object, parsersNS, node, objectStack, thisArg) {
	objectStack.push(object);
	parseNode(parsersNS, node, objectStack, thisArg);
	return objectStack.pop();
}
/**
* Walk through an array of `values` and call a serializer for each value.
* @param {Object<string, Object<string, Serializer>>} serializersNS
*     Namespaced serializers.
* @param {function(this: T, *, Array<*>, (string|undefined)): (Node|undefined)} nodeFactory
*     Node factory. The `nodeFactory` creates the node whose namespace and name
*     will be used to choose a node writer from `serializersNS`. This
*     separation allows us to decide what kind of node to create, depending on
*     the value we want to serialize. An example for this would be different
*     geometry writers based on the geometry type.
* @param {Array<*>} values Values to serialize. An example would be an array
*     of {@link module:ol/Feature~Feature} instances.
* @param {Array<*>} objectStack Node stack.
* @param {Array<string>} [keys] Keys of the `values`. Will be passed to the
*     `nodeFactory`. This is used for serializing object literals where the
*     node name relates to the property key. The array length of `keys` has
*     to match the length of `values`. For serializing a sequence, `keys`
*     determines the order of the sequence.
* @param {T} [thisArg] The object to use as `this` for the node factory and
*     serializers.
* @template T
*/
function serialize(serializersNS, nodeFactory, values, objectStack, keys, thisArg) {
	const length = (keys !== void 0 ? keys : values).length;
	let value, node;
	for (let i = 0; i < length; ++i) {
		value = values[i];
		if (value !== void 0) {
			node = nodeFactory.call(thisArg, value, objectStack, keys !== void 0 ? keys[i] : void 0);
			if (node !== void 0) serializersNS[node.namespaceURI][node.localName].call(thisArg, node, value, objectStack);
		}
	}
}
/**
* @param {O} object Object.
* @param {Object<string, Object<string, Serializer>>} serializersNS
*     Namespaced serializers.
* @param {function(this: T, *, Array<*>, (string|undefined)): (Node|undefined)} nodeFactory
*     Node factory. The `nodeFactory` creates the node whose namespace and name
*     will be used to choose a node writer from `serializersNS`. This
*     separation allows us to decide what kind of node to create, depending on
*     the value we want to serialize. An example for this would be different
*     geometry writers based on the geometry type.
* @param {Array<*>} values Values to serialize. An example would be an array
*     of {@link module:ol/Feature~Feature} instances.
* @param {Array<*>} objectStack Node stack.
* @param {Array<string>} [keys] Keys of the `values`. Will be passed to the
*     `nodeFactory`. This is used for serializing object literals where the
*     node name relates to the property key. The array length of `keys` has
*     to match the length of `values`. For serializing a sequence, `keys`
*     determines the order of the sequence.
* @param {T} [thisArg] The object to use as `this` for the node factory and
*     serializers.
* @return {O|undefined} Object.
* @template O, T
*/
function pushSerializeAndPop(object, serializersNS, nodeFactory, values, objectStack, keys, thisArg) {
	objectStack.push(object);
	serialize(serializersNS, nodeFactory, values, objectStack, keys, thisArg);
	return objectStack.pop();
}
var xmlSerializer_ = void 0;
/**
* @return {XMLSerializer} The XMLSerializer.
*/
function getXMLSerializer() {
	if (xmlSerializer_ === void 0 && typeof XMLSerializer !== "undefined") xmlSerializer_ = new XMLSerializer();
	return xmlSerializer_;
}
var document_ = void 0;
/**
* Get a document that should be used when creating nodes for XML serializations.
* @return {Document} The document.
*/
function getDocument() {
	if (document_ === void 0 && typeof document !== "undefined") document_ = document.implementation.createDocument("", "", null);
	return document_;
}
//#endregion
//#region node_modules/ol/format/XMLFeature.js
/**
* @module ol/format/XMLFeature
*/
/**
* @classdesc
* Abstract base class; normally only used for creating subclasses and not
* instantiated in apps.
* Base class for XML feature formats.
*
* @abstract
*/
var XMLFeature = class extends FeatureFormat {
	constructor() {
		super();
		/**
		* @type {XMLSerializer}
		* @private
		*/
		this.xmlSerializer_ = getXMLSerializer();
	}
	/**
	* @return {import("./Feature.js").Type} Format.
	* @override
	*/
	getType() {
		return "xml";
	}
	/**
	* Read a single feature.
	*
	* @param {Document|Element|Object|string} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../Feature.js").default} Feature.
	* @api
	* @override
	*/
	readFeature(source, options) {
		if (!source) return null;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readFeatureFromDocument(doc, options);
		}
		if (isDocument(source)) return this.readFeatureFromDocument(source, options);
		return this.readFeatureFromNode(source, options);
	}
	/**
	* @param {Document} doc Document.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {import("../Feature.js").default} Feature.
	*/
	readFeatureFromDocument(doc, options) {
		const features = this.readFeaturesFromDocument(doc, options);
		if (features.length > 0) return features[0];
		return null;
	}
	/**
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {import("../Feature.js").default} Feature.
	*/
	readFeatureFromNode(node, options) {
		return null;
	}
	/**
	* Read all features from a feature collection.
	*
	* @param {Document|Element|Object|string} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @api
	* @override
	*/
	readFeatures(source, options) {
		if (!source) return [];
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readFeaturesFromDocument(doc, options);
		}
		if (isDocument(source)) return this.readFeaturesFromDocument(source, options);
		return this.readFeaturesFromNode(source, options);
	}
	/**
	* @param {Document} doc Document.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @protected
	* @return {Array<import("../Feature.js").default>} Features.
	*/
	readFeaturesFromDocument(doc, options) {
		/** @type {Array<import("../Feature.js").default>} */
		const features = [];
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) extend(features, this.readFeaturesFromNode(n, options));
		return features;
	}
	/**
	* @abstract
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @protected
	* @return {Array<import("../Feature.js").default>} Features.
	*/
	readFeaturesFromNode(node, options) {
		return abstract();
	}
	/**
	* Read a single geometry from a source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @override
	*/
	readGeometry(source, options) {
		if (!source) return null;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readGeometryFromDocument(doc, options);
		}
		if (isDocument(source)) return this.readGeometryFromDocument(source, options);
		return this.readGeometryFromNode(source, options);
	}
	/**
	* @param {Document} doc Document.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	*/
	readGeometryFromDocument(doc, options) {
		return null;
	}
	/**
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	*/
	readGeometryFromNode(node, options) {
		return null;
	}
	/**
	* Read the projection from the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @return {import("../proj/Projection.js").default} Projection.
	* @api
	* @override
	*/
	readProjection(source) {
		if (!source) return null;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readProjectionFromDocument(doc);
		}
		if (isDocument(source)) return this.readProjectionFromDocument(source);
		return this.readProjectionFromNode(source);
	}
	/**
	* @param {Document} doc Document.
	* @protected
	* @return {import("../proj/Projection.js").default} Projection.
	*/
	readProjectionFromDocument(doc) {
		return this.dataProjection;
	}
	/**
	* @param {Element} node Node.
	* @protected
	* @return {import("../proj/Projection.js").default} Projection.
	*/
	readProjectionFromNode(node) {
		return this.dataProjection;
	}
	/**
	* Encode a feature as string.
	*
	* @param {import("../Feature.js").default} feature Feature.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string} Encoded feature.
	* @override
	*/
	writeFeature(feature, options) {
		const node = this.writeFeatureNode(feature, options);
		return this.xmlSerializer_.serializeToString(node);
	}
	/**
	* @param {import("../Feature.js").default} feature Feature.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @protected
	* @return {Node} Node.
	*/
	writeFeatureNode(feature, options) {
		return null;
	}
	/**
	* Encode an array of features as string.
	*
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string} Result.
	* @api
	* @override
	*/
	writeFeatures(features, options) {
		const node = this.writeFeaturesNode(features, options);
		return this.xmlSerializer_.serializeToString(node);
	}
	/**
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @return {Node} Node.
	*/
	writeFeaturesNode(features, options) {
		return null;
	}
	/**
	* Encode a geometry as string.
	*
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string} Encoded geometry.
	* @override
	*/
	writeGeometry(geometry, options) {
		const node = this.writeGeometryNode(geometry, options);
		return this.xmlSerializer_.serializeToString(node);
	}
	/**
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @return {Node} Node.
	*/
	writeGeometryNode(geometry, options) {
		return null;
	}
};
//#endregion
//#region node_modules/ol/format/GMLBase.js
/**
* @module ol/format/GMLBase
*/
/**
* @const
* @type {string}
*/
var GMLNS = "http://www.opengis.net/gml";
/**
* A regular expression that matches if a string only contains whitespace
* characters. It will e.g. match `''`, `' '`, `'\n'` etc.
*
* @const
* @type {RegExp}
*/
var ONLY_WHITESPACE_RE = /^\s*$/;
/**
* @typedef {Object} Options
* @property {Object<string, string>|string} [featureNS] Feature
* namespace. If not defined will be derived from GML. If multiple
* feature types have been configured which come from different feature
* namespaces, this will be an object with the keys being the prefixes used
* in the entries of featureType array. The values of the object will be the
* feature namespaces themselves. So for instance there might be a featureType
* item `topp:states` in the `featureType` array and then there will be a key
* `topp` in the featureNS object with value `http://www.openplans.org/topp`.
* @property {Array<string>|string} [featureType] Feature type(s) to parse.
* If multiple feature types need to be configured
* which come from different feature namespaces, `featureNS` will be an object
* with the keys being the prefixes used in the entries of featureType array.
* The values of the object will be the feature namespaces themselves.
* So for instance there might be a featureType item `topp:states` and then
* there will be a key named `topp` in the featureNS object with value
* `http://www.openplans.org/topp`.
* @property {string} [srsName] srsName to use when writing geometries.
* @property {boolean} [surface=false] Write gml:Surface instead of gml:Polygon
* elements. This also affects the elements in multi-part geometries.
* @property {boolean} [curve=false] Write gml:Curve instead of gml:LineString
* elements. This also affects the elements in multi-part geometries.
* @property {boolean} [multiCurve=true] Write gml:MultiCurve instead of gml:MultiLineString.
* Since the latter is deprecated in GML 3.
* @property {boolean} [multiSurface=true] Write gml:multiSurface instead of
* gml:MultiPolygon. Since the latter is deprecated in GML 3.
* @property {string} [schemaLocation] Optional schemaLocation to use when
* writing out the GML, this will override the default provided.
* @property {boolean} [hasZ=false] If coordinates have a Z value.
*/
/**
* @classdesc
* Abstract base class; normally only used for creating subclasses and not
* instantiated in apps.
* Feature base format for reading and writing data in the GML format.
* This class cannot be instantiated, it contains only base content that
* is shared with versioned format classes GML2 and GML3.
*
* @abstract
* @api
*/
var GMLBase = class extends XMLFeature {
	/**
	* @param {Options} [options] Optional configuration object.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @protected
		* @type {Array<string>|string|undefined}
		*/
		this.featureType = options.featureType;
		/**
		* @protected
		* @type {Object<string, string>|string|undefined}
		*/
		this.featureNS = options.featureNS;
		/**
		* @protected
		* @type {string|undefined}
		*/
		this.srsName = options.srsName;
		/**
		* @protected
		* @type {string}
		*/
		this.schemaLocation = "";
		/**
		* @type {Object<string, Object<string, Object>>}
		*/
		this.FEATURE_COLLECTION_PARSERS = {};
		this.FEATURE_COLLECTION_PARSERS[this.namespace] = {
			"featureMember": makeArrayPusher(this.readFeaturesInternal),
			"featureMembers": makeReplacer(this.readFeaturesInternal)
		};
		this.supportedMediaTypes = ["application/gml+xml"];
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<Feature> | undefined} Features.
	*/
	readFeaturesInternal(node, objectStack) {
		const localName = node.localName;
		let features = null;
		if (localName == "FeatureCollection") features = pushParseAndPop([], this.FEATURE_COLLECTION_PARSERS, node, objectStack, this);
		else if (localName == "featureMembers" || localName == "featureMember" || localName == "member") {
			const context = objectStack[0];
			let featureType = context["featureType"];
			let featureNS = context["featureNS"];
			const prefix = "p";
			const defaultPrefix = "p0";
			if (!featureType && node.childNodes) {
				featureType = [], featureNS = {};
				for (let i = 0, ii = node.childNodes.length; i < ii; ++i) {
					const child = node.childNodes[i];
					if (child.nodeType === 1) {
						const ft = child.nodeName.split(":").pop();
						if (!featureType.includes(ft)) {
							let key = "";
							let count = 0;
							const uri = child.namespaceURI;
							for (const candidate in featureNS) {
								if (featureNS[candidate] === uri) {
									key = candidate;
									break;
								}
								++count;
							}
							if (!key) {
								key = prefix + count;
								featureNS[key] = uri;
							}
							featureType.push(key + ":" + ft);
						}
					}
				}
				if (localName != "featureMember") {
					context["featureType"] = featureType;
					context["featureNS"] = featureNS;
				}
			}
			if (typeof featureNS === "string") {
				const ns = featureNS;
				featureNS = {};
				featureNS[defaultPrefix] = ns;
			}
			/** @type {Object<string, Object<string, import("../xml.js").Parser>>} */
			const parsersNS = {};
			const featureTypes = Array.isArray(featureType) ? featureType : [featureType];
			for (const p in featureNS) {
				/** @type {Object<string, import("../xml.js").Parser>} */
				const parsers = {};
				for (let i = 0, ii = featureTypes.length; i < ii; ++i) if ((featureTypes[i].includes(":") ? featureTypes[i].split(":")[0] : defaultPrefix) === p) parsers[featureTypes[i].split(":").pop()] = localName == "featureMembers" ? makeArrayPusher(this.readFeatureElement, this) : makeReplacer(this.readFeatureElement, this);
				parsersNS[featureNS[p]] = parsers;
			}
			if (localName == "featureMember" || localName == "member") features = pushParseAndPop(void 0, parsersNS, node, objectStack);
			else features = pushParseAndPop([], parsersNS, node, objectStack);
		}
		if (features === null) features = [];
		return features;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {import("../geom/Geometry.js").default|import("../extent.js").Extent|undefined} Geometry.
	*/
	readGeometryOrExtent(node, objectStack) {
		const context = objectStack[0];
		context["srsName"] = node.firstElementChild.getAttribute("srsName");
		context["srsDimension"] = node.firstElementChild.getAttribute("srsDimension");
		return pushParseAndPop(null, this.GEOMETRY_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {import("../extent.js").Extent|undefined} Geometry.
	*/
	readExtentElement(node, objectStack) {
		const context = objectStack[0];
		const extent = this.readGeometryOrExtent(node, objectStack);
		return extent ? transformExtentWithOptions(extent, context) : void 0;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {import("../geom/Geometry.js").default|undefined} Geometry.
	*/
	readGeometryElement(node, objectStack) {
		const context = objectStack[0];
		const geometry = this.readGeometryOrExtent(node, objectStack);
		return geometry ? transformGeometryWithOptions(geometry, false, context) : void 0;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @param {boolean} asFeature whether result should be wrapped as a feature.
	* @return {Feature|Object} Feature
	*/
	readFeatureElementInternal(node, objectStack, asFeature) {
		let geometryName;
		const values = {};
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) {
			let value;
			const localName = n.localName;
			if (n.childNodes.length === 0 || n.childNodes.length === 1 && (n.firstChild.nodeType === 3 || n.firstChild.nodeType === 4)) {
				value = getAllTextContent(n, false);
				if (ONLY_WHITESPACE_RE.test(value)) value = void 0;
			} else {
				if (asFeature) value = localName === "boundedBy" ? this.readExtentElement(n, objectStack) : this.readGeometryElement(n, objectStack);
				if (!value) value = this.readFeatureElementInternal(n, objectStack, false);
				else if (localName !== "boundedBy") geometryName = localName;
			}
			const len = n.attributes.length;
			if (len > 0 && !(value instanceof Geometry)) {
				value = { _content_: value };
				for (let i = 0; i < len; i++) {
					const attName = n.attributes[i].name;
					value[attName] = n.attributes[i].value;
				}
			}
			if (values[localName]) {
				if (!(values[localName] instanceof Array)) values[localName] = [values[localName]];
				values[localName].push(value);
			} else values[localName] = value;
		}
		if (!asFeature) return values;
		const feature = new Feature(values);
		if (geometryName) feature.setGeometryName(geometryName);
		const fid = node.getAttribute("fid") || getAttributeNS(node, this.namespace, "id");
		if (fid) feature.setId(fid);
		return feature;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Feature} Feature.
	*/
	readFeatureElement(node, objectStack) {
		return this.readFeatureElementInternal(node, objectStack, true);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Point|undefined} Point.
	*/
	readPoint(node, objectStack) {
		const flatCoordinates = this.readFlatCoordinatesFromNode(node, objectStack);
		if (flatCoordinates) return new Point(flatCoordinates, "XYZ");
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {MultiPoint|undefined} MultiPoint.
	*/
	readMultiPoint(node, objectStack) {
		/** @type {Array<Array<number>>} */
		const coordinates = pushParseAndPop([], this.MULTIPOINT_PARSERS, node, objectStack, this);
		if (coordinates) return new MultiPoint(coordinates);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {MultiLineString|undefined} MultiLineString.
	*/
	readMultiLineString(node, objectStack) {
		/** @type {Array<LineString>} */
		const lineStrings = pushParseAndPop([], this.MULTILINESTRING_PARSERS, node, objectStack, this);
		if (lineStrings) return new MultiLineString(lineStrings);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {MultiPolygon|undefined} MultiPolygon.
	*/
	readMultiPolygon(node, objectStack) {
		/** @type {Array<Polygon>} */
		const polygons = pushParseAndPop([], this.MULTIPOLYGON_PARSERS, node, objectStack, this);
		if (polygons) return new MultiPolygon(polygons);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	pointMemberParser(node, objectStack) {
		parseNode(this.POINTMEMBER_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	lineStringMemberParser(node, objectStack) {
		parseNode(this.LINESTRINGMEMBER_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	polygonMemberParser(node, objectStack) {
		parseNode(this.POLYGONMEMBER_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {LineString|undefined} LineString.
	*/
	readLineString(node, objectStack) {
		const flatCoordinates = this.readFlatCoordinatesFromNode(node, objectStack);
		if (flatCoordinates) return new LineString(flatCoordinates, "XYZ");
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} LinearRing flat coordinates.
	*/
	readFlatLinearRing(node, objectStack) {
		const ring = pushParseAndPop(null, this.GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack, this);
		if (ring) return ring;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {LinearRing|undefined} LinearRing.
	*/
	readLinearRing(node, objectStack) {
		const flatCoordinates = this.readFlatCoordinatesFromNode(node, objectStack);
		if (flatCoordinates) return new LinearRing(flatCoordinates, "XYZ");
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Polygon|undefined} Polygon.
	*/
	readPolygon(node, objectStack) {
		/** @type {Array<Array<number>>} */
		const flatLinearRings = pushParseAndPop([null], this.FLAT_LINEAR_RINGS_PARSERS, node, objectStack, this);
		if (flatLinearRings && flatLinearRings[0]) {
			const flatCoordinates = flatLinearRings[0];
			const ends = [flatCoordinates.length];
			let i, ii;
			for (i = 1, ii = flatLinearRings.length; i < ii; ++i) {
				extend(flatCoordinates, flatLinearRings[i]);
				ends.push(flatCoordinates.length);
			}
			return new Polygon(flatCoordinates, "XYZ", ends);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>} Flat coordinates.
	*/
	readFlatCoordinatesFromNode(node, objectStack) {
		return pushParseAndPop(null, this.GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @override
	*/
	readGeometryFromNode(node, options) {
		const geometry = this.readGeometryElement(node, [this.getReadOptions(node, options ? options : {})]);
		return geometry ? geometry : null;
	}
	/**
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @override
	*/
	readFeaturesFromNode(node, options) {
		const internalOptions = {
			featureType: this.featureType,
			featureNS: this.featureNS
		};
		if (internalOptions) Object.assign(internalOptions, this.getReadOptions(node, options));
		return this.readFeaturesInternal(node, [internalOptions]) || [];
	}
	/**
	* @param {Element} node Node.
	* @return {import("../proj/Projection.js").default} Projection.
	* @override
	*/
	readProjectionFromNode(node) {
		return get(this.srsName ? this.srsName : node.firstElementChild.getAttribute("srsName"));
	}
};
GMLBase.prototype.namespace = GMLNS;
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.FLAT_LINEAR_RINGS_PARSERS = { "http://www.opengis.net/gml": {} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = { "http://www.opengis.net/gml": {} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.GEOMETRY_PARSERS = { "http://www.opengis.net/gml": {} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.MULTIPOINT_PARSERS = { "http://www.opengis.net/gml": {
	"pointMember": makeArrayPusher(GMLBase.prototype.pointMemberParser),
	"pointMembers": makeArrayPusher(GMLBase.prototype.pointMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.MULTILINESTRING_PARSERS = { "http://www.opengis.net/gml": {
	"lineStringMember": makeArrayPusher(GMLBase.prototype.lineStringMemberParser),
	"lineStringMembers": makeArrayPusher(GMLBase.prototype.lineStringMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.MULTIPOLYGON_PARSERS = { "http://www.opengis.net/gml": {
	"polygonMember": makeArrayPusher(GMLBase.prototype.polygonMemberParser),
	"polygonMembers": makeArrayPusher(GMLBase.prototype.polygonMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.POINTMEMBER_PARSERS = { "http://www.opengis.net/gml": { "Point": makeArrayPusher(GMLBase.prototype.readFlatCoordinatesFromNode) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.LINESTRINGMEMBER_PARSERS = { "http://www.opengis.net/gml": { "LineString": makeArrayPusher(GMLBase.prototype.readLineString) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.POLYGONMEMBER_PARSERS = { "http://www.opengis.net/gml": { "Polygon": makeArrayPusher(GMLBase.prototype.readPolygon) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.RING_PARSERS = { "http://www.opengis.net/gml": { "LinearRing": makeReplacer(GMLBase.prototype.readFlatLinearRing) } };
//#endregion
//#region node_modules/ol/format/xsd.js
/**
* @module ol/format/xsd
*/
/**
* @param {Node} node Node.
* @return {boolean|undefined} Boolean.
*/
function readBoolean(node) {
	return readBooleanString(getAllTextContent(node, false));
}
/**
* @param {string} string String.
* @return {boolean|undefined} Boolean.
*/
function readBooleanString(string) {
	const m = /^\s*(true|1)|(false|0)\s*$/.exec(string);
	if (m) return m[1] !== void 0 || false;
}
/**
* @param {Node} node Node.
* @return {number|undefined} DateTime in seconds.
*/
function readDateTime(node) {
	const s = getAllTextContent(node, false);
	const dateTime = Date.parse(s);
	return isNaN(dateTime) ? void 0 : dateTime / 1e3;
}
/**
* @param {Node} node Node.
* @return {number|undefined} Decimal.
*/
function readDecimal(node) {
	return readDecimalString(getAllTextContent(node, false));
}
/**
* @param {string} string String.
* @return {number|undefined} Decimal.
*/
function readDecimalString(string) {
	const m = /^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)\s*$/i.exec(string);
	if (m) return parseFloat(m[1]);
}
/**
* @param {Node} node Node.
* @return {number|undefined} Non negative integer.
*/
function readPositiveInteger(node) {
	return readNonNegativeIntegerString(getAllTextContent(node, false));
}
/**
* @param {string} string String.
* @return {number|undefined} Non negative integer.
*/
function readNonNegativeIntegerString(string) {
	const m = /^\s*(\d+)\s*$/.exec(string);
	if (m) return parseInt(m[1], 10);
}
/**
* @param {Node} node Node.
* @return {string|undefined} String.
*/
function readString(node) {
	return getAllTextContent(node, false).trim();
}
/**
* @param {Node} node Node to append a TextNode with the boolean to.
* @param {boolean} bool Boolean.
*/
function writeBooleanTextNode(node, bool) {
	writeStringTextNode(node, bool ? "1" : "0");
}
/**
* @param {Node} node Node to append a CDATA Section with the string to.
* @param {string} string String.
*/
function writeCDATASection(node, string) {
	node.appendChild(getDocument().createCDATASection(string));
}
/**
* @param {Node} node Node to append a TextNode with the dateTime to.
* @param {number} dateTime DateTime in seconds.
*/
function writeDateTimeTextNode(node, dateTime) {
	const date = /* @__PURE__ */ new Date(dateTime * 1e3);
	const string = date.getUTCFullYear() + "-" + padNumber(date.getUTCMonth() + 1, 2) + "-" + padNumber(date.getUTCDate(), 2) + "T" + padNumber(date.getUTCHours(), 2) + ":" + padNumber(date.getUTCMinutes(), 2) + ":" + padNumber(date.getUTCSeconds(), 2) + "Z";
	node.appendChild(getDocument().createTextNode(string));
}
/**
* @param {Node} node Node to append a TextNode with the decimal to.
* @param {number} decimal Decimal.
*/
function writeDecimalTextNode(node, decimal) {
	const string = decimal.toPrecision();
	node.appendChild(getDocument().createTextNode(string));
}
/**
* @param {Node} node Node to append a TextNode with the decimal to.
* @param {number} nonNegativeInteger Non negative integer.
*/
function writeNonNegativeIntegerTextNode(node, nonNegativeInteger) {
	const string = nonNegativeInteger.toString();
	node.appendChild(getDocument().createTextNode(string));
}
var whiteSpaceStart = /^\s/;
var whiteSpaceEnd = /\s$/;
var cdataCharacters = /(\n|\t|\r|<|&| {2})/;
/**
* @param {Node} node Node to append a TextNode with the string to.
* @param {string} string String.
*/
function writeStringTextNode(node, string) {
	if (typeof string === "string" && (whiteSpaceStart.test(string) || whiteSpaceEnd.test(string) || cdataCharacters.test(string))) string.split("]]>").forEach((part, i, a) => {
		if (i < a.length - 1) part += "]]";
		if (i > 0) part = ">" + part;
		writeCDATASection(node, part);
	});
	else node.appendChild(getDocument().createTextNode(string));
}
//#endregion
//#region node_modules/ol/format/GML2.js
/**
* @module ol/format/GML2
*/
/**
* @const
* @type {string}
*/
var schemaLocation$1 = GMLNS + " http://schemas.opengis.net/gml/2.1.2/feature.xsd";
/**
* @const
* @type {Object<string, string>}
*/
var MULTIGEOMETRY_TO_MEMBER_NODENAME$1 = {
	"MultiLineString": "lineStringMember",
	"MultiCurve": "curveMember",
	"MultiPolygon": "polygonMember",
	"MultiSurface": "surfaceMember"
};
/**
* @classdesc
* Feature format for reading and writing data in the GML format,
* version 2.1.2.
*
* @api
*/
var GML2 = class extends GMLBase {
	/**
	* @param {import("./GMLBase.js").Options} [options] Optional configuration object.
	*/
	constructor(options) {
		options = options ? options : {};
		super(options);
		this.FEATURE_COLLECTION_PARSERS[GMLNS]["featureMember"] = makeArrayPusher(this.readFeaturesInternal);
		/**
		* @type {string}
		*/
		this.schemaLocation = options.schemaLocation ? options.schemaLocation : schemaLocation$1;
	}
	/**
	* @param {Node} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} Flat coordinates.
	*/
	readFlatCoordinates(node, objectStack) {
		const s = getAllTextContent(node, false).replace(/^\s*|\s*$/g, "");
		const containerSrs = objectStack[0]["srsName"];
		let axisOrientation = "enu";
		if (containerSrs) {
			const proj = get(containerSrs);
			if (proj) axisOrientation = proj.getAxisOrientation();
		}
		const coordsGroups = s.trim().split(/\s+/);
		const flatCoordinates = [];
		for (let i = 0, ii = coordsGroups.length; i < ii; i++) {
			const coords = coordsGroups[i].split(/,+/);
			const x = parseFloat(coords[0]);
			const y = parseFloat(coords[1]);
			const z = coords.length === 3 ? parseFloat(coords[2]) : 0;
			if (axisOrientation.startsWith("en")) flatCoordinates.push(x, y, z);
			else flatCoordinates.push(y, x, z);
		}
		return flatCoordinates;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {import("../extent.js").Extent|undefined} Envelope.
	*/
	readBox(node, objectStack) {
		/** @type {Array<number>} */
		const flatCoordinates = pushParseAndPop([null], this.BOX_PARSERS_, node, objectStack, this);
		return createOrUpdate(flatCoordinates[1][0], flatCoordinates[1][1], flatCoordinates[1][3], flatCoordinates[1][4]);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	innerBoundaryIsParser(node, objectStack) {
		/** @type {Array<number>|undefined} */
		const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
		if (flatLinearRing) objectStack[objectStack.length - 1].push(flatLinearRing);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	outerBoundaryIsParser(node, objectStack) {
		/** @type {Array<number>|undefined} */
		const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
		if (flatLinearRing) {
			const flatLinearRings = objectStack[objectStack.length - 1];
			flatLinearRings[0] = flatLinearRing;
		}
	}
	/**
	* @const
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Element|undefined} Node.
	* @private
	*/
	GEOMETRY_NODE_FACTORY_(value, objectStack, nodeName) {
		const context = objectStack[objectStack.length - 1];
		const multiSurface = context["multiSurface"];
		const surface = context["surface"];
		const multiCurve = context["multiCurve"];
		if (!Array.isArray(value)) {
			nodeName = value.getType();
			if (nodeName === "MultiPolygon" && multiSurface === true) nodeName = "MultiSurface";
			else if (nodeName === "Polygon" && surface === true) nodeName = "Surface";
			else if (nodeName === "MultiLineString" && multiCurve === true) nodeName = "MultiCurve";
		} else nodeName = "Envelope";
		return createElementNS("http://www.opengis.net/gml", nodeName);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../Feature.js").default} feature Feature.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeFeatureElement(node, feature, objectStack) {
		const fid = feature.getId();
		if (fid) node.setAttribute("fid", fid);
		const context = objectStack[objectStack.length - 1];
		const featureNS = context["featureNS"];
		const geometryName = feature.getGeometryName();
		if (!context.serializers) {
			context.serializers = {};
			context.serializers[featureNS] = {};
		}
		const keys = [];
		const values = [];
		if (feature.hasProperties()) {
			const properties = feature.getProperties();
			for (const key in properties) {
				const value = properties[key];
				if (value !== null && value !== void 0) {
					keys.push(key);
					values.push(value);
					if (key == geometryName || typeof value.getSimplifiedGeometry === "function") {
						if (!(key in context.serializers[featureNS])) context.serializers[featureNS][key] = makeChildAppender(this.writeGeometryElement, this);
					} else if (!(key in context.serializers[featureNS])) context.serializers[featureNS][key] = makeChildAppender(writeStringTextNode);
				}
			}
		}
		const item = Object.assign({}, context);
		item.node = node;
		pushSerializeAndPop(item, context.serializers, makeSimpleNodeFactory(void 0, featureNS), values, objectStack, keys);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LineString.js").default} geometry LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeCurveOrLineString(node, geometry, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (node.nodeName !== "LineStringSegment" && srsName) node.setAttribute("srsName", srsName);
		if (node.nodeName === "LineString" || node.nodeName === "LineStringSegment") {
			const coordinates = this.createCoordinatesNode_(node.namespaceURI);
			node.appendChild(coordinates);
			this.writeCoordinates_(coordinates, geometry, objectStack);
		} else if (node.nodeName === "Curve") {
			const segments = createElementNS(node.namespaceURI, "segments");
			node.appendChild(segments);
			this.writeCurveSegments_(segments, geometry, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LineString.js").default} line LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeLineStringOrCurveMember(node, line, objectStack) {
		const child = this.GEOMETRY_NODE_FACTORY_(line, objectStack);
		if (child) {
			node.appendChild(child);
			this.writeCurveOrLineString(child, line, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/MultiLineString.js").default} geometry MultiLineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiCurveOrLineString(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		const curve = context["curve"];
		if (srsName) node.setAttribute("srsName", srsName);
		const lines = geometry.getLineStrings();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName,
			curve
		}, this.LINESTRINGORCURVEMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, lines, objectStack, void 0, this);
	}
	/**
	* @param {Node} node Node.
	* @param {import("../geom/Geometry.js").default|import("../extent.js").Extent} geometry Geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeGeometryElement(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const item = Object.assign({}, context);
		item["node"] = node;
		let value;
		if (Array.isArray(geometry)) value = transformExtentWithOptions(geometry, context);
		else value = transformGeometryWithOptions(geometry, true, context);
		pushSerializeAndPop(item, this.GEOMETRY_SERIALIZERS, this.GEOMETRY_NODE_FACTORY_, [value], objectStack, void 0, this);
	}
	/**
	* @param {string} namespaceURI XML namespace.
	* @return {Element} coordinates node.
	* @private
	*/
	createCoordinatesNode_(namespaceURI) {
		const coordinates = createElementNS(namespaceURI, "coordinates");
		coordinates.setAttribute("decimal", ".");
		coordinates.setAttribute("cs", ",");
		coordinates.setAttribute("ts", " ");
		return coordinates;
	}
	/**
	* @param {Node} node Node.
	* @param {import("../geom/LineString.js").default|import("../geom/LinearRing.js").default} value Geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeCoordinates_(node, value, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		const points = value.getCoordinates();
		const len = points.length;
		const parts = new Array(len);
		for (let i = 0; i < len; ++i) {
			const point = points[i];
			parts[i] = this.getCoords_(point, srsName, hasZ);
		}
		writeStringTextNode(node, parts.join(" "));
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LineString.js").default} line LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeCurveSegments_(node, line, objectStack) {
		const child = createElementNS(node.namespaceURI, "LineStringSegment");
		node.appendChild(child);
		this.writeCurveOrLineString(child, line, objectStack);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Polygon.js").default} geometry Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeSurfaceOrPolygon(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		if (node.nodeName !== "PolygonPatch" && srsName) node.setAttribute("srsName", srsName);
		if (node.nodeName === "Polygon" || node.nodeName === "PolygonPatch") {
			const rings = geometry.getLinearRings();
			pushSerializeAndPop({
				node,
				hasZ,
				srsName
			}, this.RING_SERIALIZERS, this.RING_NODE_FACTORY_, rings, objectStack, void 0, this);
		} else if (node.nodeName === "Surface") {
			const patches = createElementNS(node.namespaceURI, "patches");
			node.appendChild(patches);
			this.writeSurfacePatches_(patches, geometry, objectStack);
		}
	}
	/**
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Node} Node.
	* @private
	*/
	RING_NODE_FACTORY_(value, objectStack, nodeName) {
		const context = objectStack[objectStack.length - 1];
		const parentNode = context.node;
		const exteriorWritten = context["exteriorWritten"];
		if (exteriorWritten === void 0) context["exteriorWritten"] = true;
		return createElementNS(parentNode.namespaceURI, exteriorWritten !== void 0 ? "innerBoundaryIs" : "outerBoundaryIs");
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Polygon.js").default} polygon Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeSurfacePatches_(node, polygon, objectStack) {
		const child = createElementNS(node.namespaceURI, "PolygonPatch");
		node.appendChild(child);
		this.writeSurfaceOrPolygon(child, polygon, objectStack);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LinearRing.js").default} ring LinearRing geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeRing(node, ring, objectStack) {
		const linearRing = createElementNS(node.namespaceURI, "LinearRing");
		node.appendChild(linearRing);
		this.writeLinearRing(linearRing, ring, objectStack);
	}
	/**
	* @param {Array<number>} point Point geometry.
	* @param {string} [srsName] Optional srsName
	* @param {boolean} [hasZ] whether the geometry has a Z coordinate (is 3D) or not.
	* @return {string} The coords string.
	* @private
	*/
	getCoords_(point, srsName, hasZ) {
		let coords = (srsName ? get(srsName).getAxisOrientation() : "enu").startsWith("en") ? point[0] + "," + point[1] : point[1] + "," + point[0];
		if (hasZ) {
			const z = point[2] || 0;
			coords += "," + z;
		}
		return coords;
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Point.js").default} geometry Point geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writePoint(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const coordinates = this.createCoordinatesNode_(node.namespaceURI);
		node.appendChild(coordinates);
		const point = geometry.getCoordinates();
		writeStringTextNode(coordinates, this.getCoords_(point, srsName, hasZ));
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/MultiPoint.js").default} geometry MultiPoint geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiPoint(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const points = geometry.getPoints();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName
		}, this.POINTMEMBER_SERIALIZERS, makeSimpleNodeFactory("pointMember"), points, objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Point.js").default} point Point geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writePointMember(node, point, objectStack) {
		const child = createElementNS(node.namespaceURI, "Point");
		node.appendChild(child);
		this.writePoint(child, point, objectStack);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LinearRing.js").default} geometry LinearRing geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeLinearRing(node, geometry, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const coordinates = this.createCoordinatesNode_(node.namespaceURI);
		node.appendChild(coordinates);
		this.writeCoordinates_(coordinates, geometry, objectStack);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/MultiPolygon.js").default} geometry MultiPolygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiSurfaceOrPolygon(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		const surface = context["surface"];
		if (srsName) node.setAttribute("srsName", srsName);
		const polygons = geometry.getPolygons();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName,
			surface
		}, this.SURFACEORPOLYGONMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, polygons, objectStack, void 0, this);
	}
	/**
	* @param {Node} node Node.
	* @param {import("../geom/Polygon.js").default} polygon Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeSurfaceOrPolygonMember(node, polygon, objectStack) {
		const child = this.GEOMETRY_NODE_FACTORY_(polygon, objectStack);
		if (child) {
			node.appendChild(child);
			this.writeSurfaceOrPolygon(child, polygon, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {import("../extent.js").Extent} extent Extent.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeEnvelope(node, extent, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const keys = ["lowerCorner", "upperCorner"];
		const values = [extent[0] + " " + extent[1], extent[2] + " " + extent[3]];
		pushSerializeAndPop({ node }, this.ENVELOPE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, keys, this);
	}
	/**
	* @const
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Node|undefined} Node.
	* @private
	*/
	MULTIGEOMETRY_MEMBER_NODE_FACTORY_(value, objectStack, nodeName) {
		const parentNode = objectStack[objectStack.length - 1].node;
		return createElementNS("http://www.opengis.net/gml", MULTIGEOMETRY_TO_MEMBER_NODENAME$1[parentNode.nodeName]);
	}
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML2.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = { "http://www.opengis.net/gml": { "coordinates": makeReplacer(GML2.prototype.readFlatCoordinates) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML2.prototype.FLAT_LINEAR_RINGS_PARSERS = { "http://www.opengis.net/gml": {
	"innerBoundaryIs": GML2.prototype.innerBoundaryIsParser,
	"outerBoundaryIs": GML2.prototype.outerBoundaryIsParser
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML2.prototype.BOX_PARSERS_ = { "http://www.opengis.net/gml": { "coordinates": makeArrayPusher(GML2.prototype.readFlatCoordinates) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML2.prototype.GEOMETRY_PARSERS = { "http://www.opengis.net/gml": {
	"Point": makeReplacer(GMLBase.prototype.readPoint),
	"MultiPoint": makeReplacer(GMLBase.prototype.readMultiPoint),
	"LineString": makeReplacer(GMLBase.prototype.readLineString),
	"MultiLineString": makeReplacer(GMLBase.prototype.readMultiLineString),
	"LinearRing": makeReplacer(GMLBase.prototype.readLinearRing),
	"Polygon": makeReplacer(GMLBase.prototype.readPolygon),
	"MultiPolygon": makeReplacer(GMLBase.prototype.readMultiPolygon),
	"Box": makeReplacer(GML2.prototype.readBox)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML2.prototype.GEOMETRY_SERIALIZERS = { "http://www.opengis.net/gml": {
	"Curve": makeChildAppender(GML2.prototype.writeCurveOrLineString),
	"MultiCurve": makeChildAppender(GML2.prototype.writeMultiCurveOrLineString),
	"Point": makeChildAppender(GML2.prototype.writePoint),
	"MultiPoint": makeChildAppender(GML2.prototype.writeMultiPoint),
	"LineString": makeChildAppender(GML2.prototype.writeCurveOrLineString),
	"MultiLineString": makeChildAppender(GML2.prototype.writeMultiCurveOrLineString),
	"LinearRing": makeChildAppender(GML2.prototype.writeLinearRing),
	"Polygon": makeChildAppender(GML2.prototype.writeSurfaceOrPolygon),
	"MultiPolygon": makeChildAppender(GML2.prototype.writeMultiSurfaceOrPolygon),
	"Surface": makeChildAppender(GML2.prototype.writeSurfaceOrPolygon),
	"MultiSurface": makeChildAppender(GML2.prototype.writeMultiSurfaceOrPolygon),
	"Envelope": makeChildAppender(GML2.prototype.writeEnvelope)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML2.prototype.LINESTRINGORCURVEMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": {
	"lineStringMember": makeChildAppender(GML2.prototype.writeLineStringOrCurveMember),
	"curveMember": makeChildAppender(GML2.prototype.writeLineStringOrCurveMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML2.prototype.RING_SERIALIZERS = { "http://www.opengis.net/gml": {
	"outerBoundaryIs": makeChildAppender(GML2.prototype.writeRing),
	"innerBoundaryIs": makeChildAppender(GML2.prototype.writeRing)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML2.prototype.POINTMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": { "pointMember": makeChildAppender(GML2.prototype.writePointMember) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML2.prototype.SURFACEORPOLYGONMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": {
	"surfaceMember": makeChildAppender(GML2.prototype.writeSurfaceOrPolygonMember),
	"polygonMember": makeChildAppender(GML2.prototype.writeSurfaceOrPolygonMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML2.prototype.ENVELOPE_SERIALIZERS = { "http://www.opengis.net/gml": {
	"lowerCorner": makeChildAppender(writeStringTextNode),
	"upperCorner": makeChildAppender(writeStringTextNode)
} };
//#endregion
//#region node_modules/ol/format/GML3.js
/**
* @module ol/format/GML3
*/
/**
* @const
* @type {string}
* @private
*/
var schemaLocation = GMLNS + " http://schemas.opengis.net/gml/3.1.1/profiles/gmlsfProfile/1.0.0/gmlsf.xsd";
/**
* @const
* @type {Object<string, string>}
*/
var MULTIGEOMETRY_TO_MEMBER_NODENAME = {
	"MultiLineString": "lineStringMember",
	"MultiCurve": "curveMember",
	"MultiPolygon": "polygonMember",
	"MultiSurface": "surfaceMember"
};
/**
* @classdesc
* Feature format for reading and writing data in the GML format
* version 3.1.1.
* Currently only supports GML 3.1.1 Simple Features profile.
*
* @api
*/
var GML3 = class extends GMLBase {
	/**
	* @param {import("./GMLBase.js").Options} [options] Optional configuration object.
	*/
	constructor(options) {
		options = options ? options : {};
		super(options);
		/**
		* @private
		* @type {boolean}
		*/
		this.surface_ = options.surface !== void 0 ? options.surface : false;
		/**
		* @private
		* @type {boolean}
		*/
		this.curve_ = options.curve !== void 0 ? options.curve : false;
		/**
		* @private
		* @type {boolean}
		*/
		this.multiCurve_ = options.multiCurve !== void 0 ? options.multiCurve : true;
		/**
		* @private
		* @type {boolean}
		*/
		this.multiSurface_ = options.multiSurface !== void 0 ? options.multiSurface : true;
		/**
		* @type {string}
		*/
		this.schemaLocation = options.schemaLocation ? options.schemaLocation : schemaLocation;
		/**
		* @private
		* @type {boolean}
		*/
		this.hasZ = options.hasZ !== void 0 ? options.hasZ : false;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {MultiLineString|undefined} MultiLineString.
	*/
	readMultiCurve(node, objectStack) {
		/** @type {Array<LineString>} */
		const lineStrings = pushParseAndPop([], this.MULTICURVE_PARSERS, node, objectStack, this);
		if (lineStrings) return new MultiLineString(lineStrings);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} Polygon.
	*/
	readFlatCurveRing(node, objectStack) {
		/** @type {Array<LineString>} */
		const lineStrings = pushParseAndPop([], this.MULTICURVE_PARSERS, node, objectStack, this);
		const flatCoordinates = [];
		for (let i = 0, ii = lineStrings.length; i < ii; ++i) extend(flatCoordinates, lineStrings[i].getFlatCoordinates());
		return flatCoordinates;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {MultiPolygon|undefined} MultiPolygon.
	*/
	readMultiSurface(node, objectStack) {
		/** @type {Array<Polygon>} */
		const polygons = pushParseAndPop([], this.MULTISURFACE_PARSERS, node, objectStack, this);
		if (polygons) return new MultiPolygon(polygons);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	curveMemberParser(node, objectStack) {
		parseNode(this.CURVEMEMBER_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	surfaceMemberParser(node, objectStack) {
		parseNode(this.SURFACEMEMBER_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<(Array<number>)>|undefined} flat coordinates.
	*/
	readPatch(node, objectStack) {
		return pushParseAndPop([null], this.PATCHES_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} flat coordinates.
	*/
	readSegment(node, objectStack) {
		return pushParseAndPop([], this.SEGMENTS_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<(Array<number>)>|undefined} flat coordinates.
	*/
	readPolygonPatch(node, objectStack) {
		return pushParseAndPop([null], this.FLAT_LINEAR_RINGS_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} flat coordinates.
	*/
	readLineStringSegment(node, objectStack) {
		return pushParseAndPop([null], this.GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack, this);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	interiorParser(node, objectStack) {
		/** @type {Array<number>|undefined} */
		const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
		if (flatLinearRing) objectStack[objectStack.length - 1].push(flatLinearRing);
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	*/
	exteriorParser(node, objectStack) {
		/** @type {Array<number>|undefined} */
		const flatLinearRing = pushParseAndPop(void 0, this.RING_PARSERS, node, objectStack, this);
		if (flatLinearRing) {
			const flatLinearRings = objectStack[objectStack.length - 1];
			flatLinearRings[0] = flatLinearRing;
		}
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Polygon|undefined} Polygon.
	*/
	readSurface(node, objectStack) {
		/** @type {Array<Array<number>>} */
		const flatLinearRings = pushParseAndPop([null], this.SURFACE_PARSERS, node, objectStack, this);
		if (flatLinearRings && flatLinearRings[0]) {
			const flatCoordinates = flatLinearRings[0];
			const ends = [flatCoordinates.length];
			let i, ii;
			for (i = 1, ii = flatLinearRings.length; i < ii; ++i) {
				extend(flatCoordinates, flatLinearRings[i]);
				ends.push(flatCoordinates.length);
			}
			return new Polygon(flatCoordinates, "XYZ", ends);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {LineString|undefined} LineString.
	*/
	readCurve(node, objectStack) {
		/** @type {Array<number>} */
		const flatCoordinates = pushParseAndPop([null], this.CURVE_PARSERS, node, objectStack, this);
		if (flatCoordinates) return new LineString(flatCoordinates, "XYZ");
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {import("../extent.js").Extent|undefined} Envelope.
	*/
	readEnvelope(node, objectStack) {
		/** @type {Array<number>} */
		const flatCoordinates = pushParseAndPop([null], this.ENVELOPE_PARSERS, node, objectStack, this);
		return createOrUpdate(flatCoordinates[1][0], flatCoordinates[1][1], flatCoordinates[2][0], flatCoordinates[2][1]);
	}
	/**
	* @param {Node} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} Flat coordinates.
	*/
	readFlatPos(node, objectStack) {
		let s = getAllTextContent(node, false);
		const re = /^\s*([+\-]?\d*\.?\d+(?:[eE][+\-]?\d+)?)\s*/;
		/** @type {Array<number>} */
		const flatCoordinates = [];
		let m;
		while (m = re.exec(s)) {
			flatCoordinates.push(parseFloat(m[1]));
			s = s.substr(m[0].length);
		}
		if (s !== "") return;
		const containerSrs = objectStack[0]["srsName"];
		if ((containerSrs ? get(containerSrs).getAxisOrientation() : "enu") === "neu") for (let i = 0, ii = flatCoordinates.length; i < ii; i += 3) {
			const y = flatCoordinates[i];
			flatCoordinates[i] = flatCoordinates[i + 1];
			flatCoordinates[i + 1] = y;
		}
		const len = flatCoordinates.length;
		if (len == 2) flatCoordinates.push(0);
		if (len === 0) return;
		return flatCoordinates;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<number>|undefined} Flat coordinates.
	*/
	readFlatPosList(node, objectStack) {
		const s = getAllTextContent(node, false).replace(/^\s*|\s*$/g, "");
		const context = objectStack[0];
		const containerSrs = context["srsName"];
		const contextDimension = context["srsDimension"];
		const axisOrientation = containerSrs ? get(containerSrs).getAxisOrientation() : "enu";
		const coords = s.split(/\s+/);
		let dim = 2;
		if (node.getAttribute("srsDimension")) dim = readNonNegativeIntegerString(node.getAttribute("srsDimension"));
		else if (node.getAttribute("dimension")) dim = readNonNegativeIntegerString(node.getAttribute("dimension"));
		else if (node.parentNode.getAttribute("srsDimension")) dim = readNonNegativeIntegerString(
			/** @type {Element} */
			node.parentNode.getAttribute("srsDimension")
		);
		else if (contextDimension) dim = readNonNegativeIntegerString(contextDimension);
		const asXYZ = axisOrientation.startsWith("en");
		let x, y, z;
		const flatCoordinates = [];
		for (let i = 0, ii = coords.length; i < ii; i += dim) {
			x = parseFloat(coords[i]);
			y = parseFloat(coords[i + 1]);
			z = dim === 3 ? parseFloat(coords[i + 2]) : 0;
			if (asXYZ) flatCoordinates.push(x, y, z);
			else flatCoordinates.push(y, x, z);
		}
		return flatCoordinates;
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Point.js").default} value Point geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writePos_(node, value, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsDimension = hasZ ? "3" : "2";
		node.setAttribute("srsDimension", srsDimension);
		const srsName = context["srsName"];
		const axisOrientation = srsName ? get(srsName).getAxisOrientation() : "enu";
		const point = value.getCoordinates();
		let coords = axisOrientation.startsWith("en") ? point[0] + " " + point[1] : point[1] + " " + point[0];
		if (hasZ) {
			const z = point[2] || 0;
			coords += " " + z;
		}
		writeStringTextNode(node, coords);
	}
	/**
	* @param {Array<number>} point Point geometry.
	* @param {string} [srsName] Optional srsName
	* @param {boolean} [hasZ] whether the geometry has a Z coordinate (is 3D) or not.
	* @return {string} The coords string.
	* @private
	*/
	getCoords_(point, srsName, hasZ) {
		let coords = (srsName ? get(srsName).getAxisOrientation() : "enu").startsWith("en") ? point[0] + " " + point[1] : point[1] + " " + point[0];
		if (hasZ) {
			const z = point[2] || 0;
			coords += " " + z;
		}
		return coords;
	}
	/**
	* @param {Element} node Node.
	* @param {LineString|import("../geom/LinearRing.js").default} value Geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writePosList_(node, value, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsDimension = hasZ ? "3" : "2";
		node.setAttribute("srsDimension", srsDimension);
		const srsName = context["srsName"];
		const points = value.getCoordinates();
		const len = points.length;
		const parts = new Array(len);
		let point;
		for (let i = 0; i < len; ++i) {
			point = points[i];
			parts[i] = this.getCoords_(point, srsName, hasZ);
		}
		writeStringTextNode(node, parts.join(" "));
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Point.js").default} geometry Point geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writePoint(node, geometry, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const pos = createElementNS(node.namespaceURI, "pos");
		node.appendChild(pos);
		this.writePos_(pos, geometry, objectStack);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../extent.js").Extent} extent Extent.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeEnvelope(node, extent, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const keys = ["lowerCorner", "upperCorner"];
		const values = [extent[0] + " " + extent[1], extent[2] + " " + extent[3]];
		pushSerializeAndPop({ node }, this.ENVELOPE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, keys, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LinearRing.js").default} geometry LinearRing geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeLinearRing(node, geometry, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (srsName) node.setAttribute("srsName", srsName);
		const posList = createElementNS(node.namespaceURI, "posList");
		node.appendChild(posList);
		this.writePosList_(posList, geometry, objectStack);
	}
	/**
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Node} Node.
	* @private
	*/
	RING_NODE_FACTORY_(value, objectStack, nodeName) {
		const context = objectStack[objectStack.length - 1];
		const parentNode = context.node;
		const exteriorWritten = context["exteriorWritten"];
		if (exteriorWritten === void 0) context["exteriorWritten"] = true;
		return createElementNS(parentNode.namespaceURI, exteriorWritten !== void 0 ? "interior" : "exterior");
	}
	/**
	* @param {Element} node Node.
	* @param {Polygon} geometry Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeSurfaceOrPolygon(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		if (node.nodeName !== "PolygonPatch" && srsName) node.setAttribute("srsName", srsName);
		if (node.nodeName === "Polygon" || node.nodeName === "PolygonPatch") {
			const rings = geometry.getLinearRings();
			pushSerializeAndPop({
				node,
				hasZ,
				srsName
			}, this.RING_SERIALIZERS, this.RING_NODE_FACTORY_, rings, objectStack, void 0, this);
		} else if (node.nodeName === "Surface") {
			const patches = createElementNS(node.namespaceURI, "patches");
			node.appendChild(patches);
			this.writeSurfacePatches_(patches, geometry, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {LineString} geometry LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeCurveOrLineString(node, geometry, objectStack) {
		const srsName = objectStack[objectStack.length - 1]["srsName"];
		if (node.nodeName !== "LineStringSegment" && srsName) node.setAttribute("srsName", srsName);
		if (node.nodeName === "LineString" || node.nodeName === "LineStringSegment") {
			const posList = createElementNS(node.namespaceURI, "posList");
			node.appendChild(posList);
			this.writePosList_(posList, geometry, objectStack);
		} else if (node.nodeName === "Curve") {
			const segments = createElementNS(node.namespaceURI, "segments");
			node.appendChild(segments);
			this.writeCurveSegments_(segments, geometry, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {MultiPolygon} geometry MultiPolygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiSurfaceOrPolygon(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		const surface = context["surface"];
		if (srsName) node.setAttribute("srsName", srsName);
		const polygons = geometry.getPolygons();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName,
			surface
		}, this.SURFACEORPOLYGONMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, polygons, objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/MultiPoint.js").default} geometry MultiPoint geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiPoint(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const srsName = context["srsName"];
		const hasZ = context["hasZ"];
		if (srsName) node.setAttribute("srsName", srsName);
		const points = geometry.getPoints();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName
		}, this.POINTMEMBER_SERIALIZERS, makeSimpleNodeFactory("pointMember"), points, objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {MultiLineString} geometry MultiLineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeMultiCurveOrLineString(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const hasZ = context["hasZ"];
		const srsName = context["srsName"];
		const curve = context["curve"];
		if (srsName) node.setAttribute("srsName", srsName);
		const lines = geometry.getLineStrings();
		pushSerializeAndPop({
			node,
			hasZ,
			srsName,
			curve
		}, this.LINESTRINGORCURVEMEMBER_SERIALIZERS, this.MULTIGEOMETRY_MEMBER_NODE_FACTORY_, lines, objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/LinearRing.js").default} ring LinearRing geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeRing(node, ring, objectStack) {
		const linearRing = createElementNS(node.namespaceURI, "LinearRing");
		node.appendChild(linearRing);
		this.writeLinearRing(linearRing, ring, objectStack);
	}
	/**
	* @param {Node} node Node.
	* @param {Polygon} polygon Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeSurfaceOrPolygonMember(node, polygon, objectStack) {
		const child = this.GEOMETRY_NODE_FACTORY_(polygon, objectStack);
		if (child) {
			node.appendChild(child);
			this.writeSurfaceOrPolygon(child, polygon, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {import("../geom/Point.js").default} point Point geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writePointMember(node, point, objectStack) {
		const child = createElementNS(node.namespaceURI, "Point");
		node.appendChild(child);
		this.writePoint(child, point, objectStack);
	}
	/**
	* @param {Node} node Node.
	* @param {LineString} line LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeLineStringOrCurveMember(node, line, objectStack) {
		const child = this.GEOMETRY_NODE_FACTORY_(line, objectStack);
		if (child) {
			node.appendChild(child);
			this.writeCurveOrLineString(child, line, objectStack);
		}
	}
	/**
	* @param {Element} node Node.
	* @param {Polygon} polygon Polygon geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeSurfacePatches_(node, polygon, objectStack) {
		const child = createElementNS(node.namespaceURI, "PolygonPatch");
		node.appendChild(child);
		this.writeSurfaceOrPolygon(child, polygon, objectStack);
	}
	/**
	* @param {Element} node Node.
	* @param {LineString} line LineString geometry.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeCurveSegments_(node, line, objectStack) {
		const child = createElementNS(node.namespaceURI, "LineStringSegment");
		node.appendChild(child);
		this.writeCurveOrLineString(child, line, objectStack);
	}
	/**
	* @param {Node} node Node.
	* @param {import("../geom/Geometry.js").default|import("../extent.js").Extent} geometry Geometry.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeGeometryElement(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const item = Object.assign({}, context);
		item["node"] = node;
		let value;
		if (Array.isArray(geometry)) value = transformExtentWithOptions(geometry, context);
		else value = transformGeometryWithOptions(geometry, true, context);
		pushSerializeAndPop(item, this.GEOMETRY_SERIALIZERS, this.GEOMETRY_NODE_FACTORY_, [value], objectStack, void 0, this);
	}
	/**
	* @param {Element} node Node.
	* @param {import("../Feature.js").default} feature Feature.
	* @param {Array<*>} objectStack Node stack.
	*/
	writeFeatureElement(node, feature, objectStack) {
		const fid = feature.getId();
		if (fid) node.setAttribute("fid", fid);
		const context = objectStack[objectStack.length - 1];
		const featureNS = context["featureNS"];
		const geometryName = feature.getGeometryName();
		if (!context.serializers) {
			context.serializers = {};
			context.serializers[featureNS] = {};
		}
		const keys = [];
		const values = [];
		if (feature.hasProperties()) {
			const properties = feature.getProperties();
			for (const key in properties) {
				const value = properties[key];
				if (value !== null && value !== void 0) {
					keys.push(key);
					values.push(value);
					if (key == geometryName || typeof value.getSimplifiedGeometry === "function") {
						if (!(key in context.serializers[featureNS])) context.serializers[featureNS][key] = makeChildAppender(this.writeGeometryElement, this);
					} else if (!(key in context.serializers[featureNS])) context.serializers[featureNS][key] = makeChildAppender(writeStringTextNode);
				}
			}
		}
		const item = Object.assign({}, context);
		item.node = node;
		pushSerializeAndPop(item, context.serializers, makeSimpleNodeFactory(void 0, featureNS), values, objectStack, keys);
	}
	/**
	* @param {Node} node Node.
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {Array<*>} objectStack Node stack.
	* @private
	*/
	writeFeatureMembers_(node, features, objectStack) {
		const context = objectStack[objectStack.length - 1];
		const featureType = context["featureType"];
		const featureNS = context["featureNS"];
		/** @type {Object<string, Object<string, import("../xml.js").Serializer>>} */
		const serializers = {};
		serializers[featureNS] = {};
		serializers[featureNS][featureType] = makeChildAppender(this.writeFeatureElement, this);
		const item = Object.assign({}, context);
		item.node = node;
		pushSerializeAndPop(item, serializers, makeSimpleNodeFactory(featureType, featureNS), features, objectStack);
	}
	/**
	* @const
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Node|undefined} Node.
	* @private
	*/
	MULTIGEOMETRY_MEMBER_NODE_FACTORY_(value, objectStack, nodeName) {
		const parentNode = objectStack[objectStack.length - 1].node;
		return createElementNS(this.namespace, MULTIGEOMETRY_TO_MEMBER_NODENAME[parentNode.nodeName]);
	}
	/**
	* @const
	* @param {*} value Value.
	* @param {Array<*>} objectStack Object stack.
	* @param {string} [nodeName] Node name.
	* @return {Element|undefined} Node.
	* @private
	*/
	GEOMETRY_NODE_FACTORY_(value, objectStack, nodeName) {
		const context = objectStack[objectStack.length - 1];
		const multiSurface = context["multiSurface"];
		const surface = context["surface"];
		const curve = context["curve"];
		const multiCurve = context["multiCurve"];
		if (!Array.isArray(value)) {
			nodeName = value.getType();
			if (nodeName === "MultiPolygon" && multiSurface === true) nodeName = "MultiSurface";
			else if (nodeName === "Polygon" && surface === true) nodeName = "Surface";
			else if (nodeName === "LineString" && curve === true) nodeName = "Curve";
			else if (nodeName === "MultiLineString" && multiCurve === true) nodeName = "MultiCurve";
		} else nodeName = "Envelope";
		return createElementNS(this.namespace, nodeName);
	}
	/**
	* Encode a geometry in GML 3.1.1 Simple Features.
	*
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @return {Node} Node.
	* @api
	* @override
	*/
	writeGeometryNode(geometry, options) {
		options = this.adaptOptions(options);
		const geom = createElementNS(this.namespace, "geom");
		const context = {
			node: geom,
			hasZ: this.hasZ,
			srsName: this.srsName,
			curve: this.curve_,
			surface: this.surface_,
			multiSurface: this.multiSurface_,
			multiCurve: this.multiCurve_
		};
		if (options) Object.assign(context, options);
		this.writeGeometryElement(geom, geometry, [context]);
		return geom;
	}
	/**
	* Encode an array of features in the GML 3.1.1 format as an XML node.
	*
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @return {Element} Node.
	* @api
	* @override
	*/
	writeFeaturesNode(features, options) {
		options = this.adaptOptions(options);
		const node = createElementNS(this.namespace, "featureMembers");
		node.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", this.schemaLocation);
		const context = {
			srsName: this.srsName,
			hasZ: this.hasZ,
			curve: this.curve_,
			surface: this.surface_,
			multiSurface: this.multiSurface_,
			multiCurve: this.multiCurve_,
			featureNS: this.featureNS,
			featureType: this.featureType
		};
		if (options) Object.assign(context, options);
		this.writeFeatureMembers_(node, features, [context]);
		return node;
	}
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = { "http://www.opengis.net/gml": {
	"pos": makeReplacer(GML3.prototype.readFlatPos),
	"posList": makeReplacer(GML3.prototype.readFlatPosList),
	"coordinates": makeReplacer(GML2.prototype.readFlatCoordinates)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.FLAT_LINEAR_RINGS_PARSERS = { "http://www.opengis.net/gml": {
	"interior": GML3.prototype.interiorParser,
	"exterior": GML3.prototype.exteriorParser
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.GEOMETRY_PARSERS = { "http://www.opengis.net/gml": {
	"Point": makeReplacer(GMLBase.prototype.readPoint),
	"MultiPoint": makeReplacer(GMLBase.prototype.readMultiPoint),
	"LineString": makeReplacer(GMLBase.prototype.readLineString),
	"MultiLineString": makeReplacer(GMLBase.prototype.readMultiLineString),
	"LinearRing": makeReplacer(GMLBase.prototype.readLinearRing),
	"Polygon": makeReplacer(GMLBase.prototype.readPolygon),
	"MultiPolygon": makeReplacer(GMLBase.prototype.readMultiPolygon),
	"Surface": makeReplacer(GML3.prototype.readSurface),
	"MultiSurface": makeReplacer(GML3.prototype.readMultiSurface),
	"Curve": makeReplacer(GML3.prototype.readCurve),
	"MultiCurve": makeReplacer(GML3.prototype.readMultiCurve),
	"Envelope": makeReplacer(GML3.prototype.readEnvelope)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.MULTICURVE_PARSERS = { "http://www.opengis.net/gml": {
	"curveMember": makeArrayPusher(GML3.prototype.curveMemberParser),
	"curveMembers": makeArrayPusher(GML3.prototype.curveMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.MULTISURFACE_PARSERS = { "http://www.opengis.net/gml": {
	"surfaceMember": makeArrayPusher(GML3.prototype.surfaceMemberParser),
	"surfaceMembers": makeArrayPusher(GML3.prototype.surfaceMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.CURVEMEMBER_PARSERS = { "http://www.opengis.net/gml": {
	"LineString": makeArrayPusher(GMLBase.prototype.readLineString),
	"Curve": makeArrayPusher(GML3.prototype.readCurve)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.SURFACEMEMBER_PARSERS = { "http://www.opengis.net/gml": {
	"Polygon": makeArrayPusher(GMLBase.prototype.readPolygon),
	"Surface": makeArrayPusher(GML3.prototype.readSurface)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.SURFACE_PARSERS = { "http://www.opengis.net/gml": { "patches": makeReplacer(GML3.prototype.readPatch) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.CURVE_PARSERS = { "http://www.opengis.net/gml": { "segments": makeReplacer(GML3.prototype.readSegment) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.ENVELOPE_PARSERS = { "http://www.opengis.net/gml": {
	"lowerCorner": makeArrayPusher(GML3.prototype.readFlatPosList),
	"upperCorner": makeArrayPusher(GML3.prototype.readFlatPosList)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.PATCHES_PARSERS = { "http://www.opengis.net/gml": { "PolygonPatch": makeReplacer(GML3.prototype.readPolygonPatch) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML3.prototype.SEGMENTS_PARSERS = { "http://www.opengis.net/gml": { "LineStringSegment": makeArrayExtender(GML3.prototype.readLineStringSegment) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GMLBase.prototype.RING_PARSERS = { "http://www.opengis.net/gml": {
	"LinearRing": makeReplacer(GMLBase.prototype.readFlatLinearRing),
	"Ring": makeReplacer(GML3.prototype.readFlatCurveRing)
} };
/**
* Encode an array of features in GML 3.1.1 Simple Features.
*
* @function
* @param {Array<import("../Feature.js").default>} features Features.
* @param {import("./Feature.js").WriteOptions} [options] Options.
* @return {string} Result.
* @api
*/
GML3.prototype.writeFeatures;
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.RING_SERIALIZERS = { "http://www.opengis.net/gml": {
	"exterior": makeChildAppender(GML3.prototype.writeRing),
	"interior": makeChildAppender(GML3.prototype.writeRing)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.ENVELOPE_SERIALIZERS = { "http://www.opengis.net/gml": {
	"lowerCorner": makeChildAppender(writeStringTextNode),
	"upperCorner": makeChildAppender(writeStringTextNode)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.SURFACEORPOLYGONMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": {
	"surfaceMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember),
	"polygonMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.POINTMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": { "pointMember": makeChildAppender(GML3.prototype.writePointMember) } };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.LINESTRINGORCURVEMEMBER_SERIALIZERS = { "http://www.opengis.net/gml": {
	"lineStringMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember),
	"curveMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML3.prototype.GEOMETRY_SERIALIZERS = { "http://www.opengis.net/gml": {
	"Curve": makeChildAppender(GML3.prototype.writeCurveOrLineString),
	"MultiCurve": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
	"Point": makeChildAppender(GML3.prototype.writePoint),
	"MultiPoint": makeChildAppender(GML3.prototype.writeMultiPoint),
	"LineString": makeChildAppender(GML3.prototype.writeCurveOrLineString),
	"MultiLineString": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
	"LinearRing": makeChildAppender(GML3.prototype.writeLinearRing),
	"Polygon": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
	"MultiPolygon": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
	"Surface": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
	"MultiSurface": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
	"Envelope": makeChildAppender(GML3.prototype.writeEnvelope)
} };
//#endregion
//#region node_modules/ol/format/GML.js
/**
* @module ol/format/GML
*/
/**
* Feature format for reading and writing data in the GML format
* version 3.1.1.
* Currently only supports GML 3.1.1 Simple Features profile.
*
* @class
* @param {import("./GMLBase.js").Options} [options]
*     Optional configuration object.
* @api
*/
var GML = GML3;
/**
* Encode an array of features in GML 3.1.1 Simple Features.
*
* @function
* @param {Array<import("../Feature.js").default>} features Features.
* @param {import("./Feature.js").WriteOptions} [options] Options.
* @return {string} Result.
* @api
*/
GML.prototype.writeFeatures;
/**
* Encode an array of features in the GML 3.1.1 format as an XML node.
*
* @function
* @param {Array<import("../Feature.js").default>} features Features.
* @param {import("./Feature.js").WriteOptions} [options] Options.
* @return {Node} Node.
* @api
*/
GML.prototype.writeFeaturesNode;
//#endregion
//#region node_modules/ol/format/GPX.js
/**
* @module ol/format/GPX
*/
/**
* @const
* @type {Array<null|string>}
*/
var NAMESPACE_URIS$4 = [
	null,
	"http://www.topografix.com/GPX/1/0",
	"http://www.topografix.com/GPX/1/1"
];
/**
* @const
* @type {string}
*/
var SCHEMA_LOCATION$1 = "http://www.topografix.com/GPX/1/1 http://www.topografix.com/GPX/1/1/gpx.xsd";
/**
* @const
* @type {Object<string, function(Node, Array<*>): (Feature|undefined)>}
*/
var FEATURE_READER = {
	"rte": readRte,
	"trk": readTrk,
	"wpt": readWpt
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var GPX_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"rte": makeArrayPusher(readRte),
	"trk": makeArrayPusher(readTrk),
	"wpt": makeArrayPusher(readWpt)
});
/**
* @typedef {Object} GPXLink
* @property {string} [text] text
* @property {string} [type] type
*/
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LINK_PARSERS$1 = makeStructureNS(NAMESPACE_URIS$4, {
	"text": makeObjectPropertySetter(readString, "linkText"),
	"type": makeObjectPropertySetter(readString, "linkType")
});
/**
* @typedef {Object} GPXAuthor
* @property {string} [name] name
* @property {string} [email] email
* @property {GPXLink} [link] link
*/
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var AUTHOR_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"name": makeObjectPropertySetter(readString),
	"email": parseEmail,
	"link": parseLink
});
/**
* @typedef {Object} GPXMetadata
* @property {string} [name] name
* @property {string} [desc] desc
* @property {GPXAuthor} [author] author
* @property {GPXLink} [link] link
* @property {number} [time] time
* @property {string} [keywords] keywords
* @property {Array<number>} [bounds] bounds
* @property {Object} [extensions] extensions
*
*/
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var METADATA_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"name": makeObjectPropertySetter(readString),
	"desc": makeObjectPropertySetter(readString),
	"author": makeObjectPropertySetter(readAuthor),
	"copyright": makeObjectPropertySetter(readCopyright),
	"link": parseLink,
	"time": makeObjectPropertySetter(readDateTime),
	"keywords": makeObjectPropertySetter(readString),
	"bounds": parseBounds,
	"extensions": parseExtensions
});
/**
* @typedef {Object} GPXCopyright
* @property {string} [author] author
* @property {number} [year] year
* @property {string} [license] license
*/
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var COPYRIGHT_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"year": makeObjectPropertySetter(readPositiveInteger),
	"license": makeObjectPropertySetter(readString)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var GPX_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$4, {
	"rte": makeChildAppender(writeRte),
	"trk": makeChildAppender(writeTrk),
	"wpt": makeChildAppender(writeWpt)
});
/**
* @typedef {Object} Options
* @property {function(Feature, Node):void} [readExtensions] Callback function
* to process `extensions` nodes. To prevent memory leaks, this callback function must
* not store any references to the node. Note that the `extensions`
* node is not allowed in GPX 1.0. Moreover, only `extensions`
* nodes from `wpt`, `rte` and `trk` can be processed, as those are
* directly mapped to a feature.
*/
/**
* @typedef {Object} LayoutOptions
* @property {boolean} [hasZ] HasZ.
* @property {boolean} [hasM] HasM.
*/
/**
* @typedef {function(Feature, Node): void} ReadExtensions
*/
/**
* @classdesc
* Feature format for reading and writing data in the GPX format.
*
* Note that {@link module:ol/format/GPX~GPX#readFeature} only reads the first
* feature of the source.
*
* When reading, routes (`<rte>`) are converted into LineString geometries, and
* tracks (`<trk>`) into MultiLineString. Any properties on route and track
* waypoints are ignored.
*
* When writing, LineString geometries are output as routes (`<rte>`), and
* MultiLineString as tracks (`<trk>`).
*
* @api
*/
var GPX = class extends XMLFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @type {import("../proj/Projection.js").default}
		*/
		this.dataProjection = get("EPSG:4326");
		/**
		* @type {ReadExtensions|undefined}
		* @private
		*/
		this.readExtensions_ = options.readExtensions;
	}
	/**
	* @param {Array<Feature>} features List of features.
	* @private
	*/
	handleReadExtensions_(features) {
		if (!features) features = [];
		for (let i = 0, ii = features.length; i < ii; ++i) {
			const feature = features[i];
			if (this.readExtensions_) {
				const extensionsNode = feature.get("extensionsNode_") || null;
				this.readExtensions_(feature, extensionsNode);
			}
			feature.set("extensionsNode_", void 0);
		}
	}
	/**
	* Reads a GPX file's metadata tag, reading among other things:
	*   - the name and description of this GPX
	*   - its author
	*   - the copyright associated with this GPX file
	*
	* Will return null if no metadata tag is present (or no valid source is given).
	*
	* @param {Document|Element|Object|string} source Source.
	* @return {GPXMetadata | null} Metadata
	* @api
	*/
	readMetadata(source) {
		if (!source) return null;
		if (typeof source === "string") return this.readMetadataFromDocument(parse(source));
		if (isDocument(source)) return this.readMetadataFromDocument(source);
		return this.readMetadataFromNode(source);
	}
	/**
	* @param {Document} doc Document.
	* @return {GPXMetadata | null} Metadata
	*/
	readMetadataFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType === Node.ELEMENT_NODE) {
			const metadata = this.readMetadataFromNode(n);
			if (metadata) return metadata;
		}
		return null;
	}
	/**
	* @param {Element} node Node.
	* @return {Object} Metadata
	*/
	readMetadataFromNode(node) {
		if (!NAMESPACE_URIS$4.includes(node.namespaceURI)) return null;
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) if (NAMESPACE_URIS$4.includes(n.namespaceURI) && n.localName === "metadata") return pushParseAndPop({}, METADATA_PARSERS, n, []);
		return null;
	}
	/**
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {import("../Feature.js").default} Feature.
	* @override
	*/
	readFeatureFromNode(node, options) {
		if (!NAMESPACE_URIS$4.includes(node.namespaceURI)) return null;
		const featureReader = FEATURE_READER[node.localName];
		if (!featureReader) return null;
		const feature = featureReader(node, [this.getReadOptions(node, options)]);
		if (!feature) return null;
		this.handleReadExtensions_([feature]);
		return feature;
	}
	/**
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @override
	*/
	readFeaturesFromNode(node, options) {
		if (!NAMESPACE_URIS$4.includes(node.namespaceURI)) return [];
		if (node.localName == "gpx") {
			/** @type {Array<Feature>} */
			const features = pushParseAndPop([], GPX_PARSERS, node, [this.getReadOptions(node, options)]);
			if (features) {
				this.handleReadExtensions_(features);
				return features;
			}
			return [];
		}
		return [];
	}
	/**
	* Encode an array of features in the GPX format as an XML node.
	* LineString geometries are output as routes (`<rte>`), and MultiLineString
	* as tracks (`<trk>`).
	*
	* @param {Array<Feature>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @return {Node} Node.
	* @api
	* @override
	*/
	writeFeaturesNode(features, options) {
		options = this.adaptOptions(options);
		const gpx = createElementNS("http://www.topografix.com/GPX/1/1", "gpx");
		gpx.setAttributeNS("http://www.w3.org/2000/xmlns/", "xmlns:xsi", XML_SCHEMA_INSTANCE_URI);
		gpx.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", SCHEMA_LOCATION$1);
		gpx.setAttribute("version", "1.1");
		gpx.setAttribute("creator", "OpenLayers");
		pushSerializeAndPop({ node: gpx }, GPX_SERIALIZERS, GPX_NODE_FACTORY, features, [options]);
		return gpx;
	}
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var RTE_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"name": makeObjectPropertySetter(readString),
	"cmt": makeObjectPropertySetter(readString),
	"desc": makeObjectPropertySetter(readString),
	"src": makeObjectPropertySetter(readString),
	"link": parseLink,
	"number": makeObjectPropertySetter(readPositiveInteger),
	"extensions": parseExtensions,
	"type": makeObjectPropertySetter(readString),
	"rtept": parseRtePt
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var RTEPT_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"ele": makeObjectPropertySetter(readDecimal),
	"time": makeObjectPropertySetter(readDateTime)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TRK_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"name": makeObjectPropertySetter(readString),
	"cmt": makeObjectPropertySetter(readString),
	"desc": makeObjectPropertySetter(readString),
	"src": makeObjectPropertySetter(readString),
	"link": parseLink,
	"number": makeObjectPropertySetter(readPositiveInteger),
	"type": makeObjectPropertySetter(readString),
	"extensions": parseExtensions,
	"trkseg": parseTrkSeg
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TRKSEG_PARSERS = makeStructureNS(NAMESPACE_URIS$4, { "trkpt": parseTrkPt });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TRKPT_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"ele": makeObjectPropertySetter(readDecimal),
	"time": makeObjectPropertySetter(readDateTime)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var WPT_PARSERS = makeStructureNS(NAMESPACE_URIS$4, {
	"ele": makeObjectPropertySetter(readDecimal),
	"time": makeObjectPropertySetter(readDateTime),
	"magvar": makeObjectPropertySetter(readDecimal),
	"geoidheight": makeObjectPropertySetter(readDecimal),
	"name": makeObjectPropertySetter(readString),
	"cmt": makeObjectPropertySetter(readString),
	"desc": makeObjectPropertySetter(readString),
	"src": makeObjectPropertySetter(readString),
	"link": parseLink,
	"sym": makeObjectPropertySetter(readString),
	"type": makeObjectPropertySetter(readString),
	"fix": makeObjectPropertySetter(readString),
	"sat": makeObjectPropertySetter(readPositiveInteger),
	"hdop": makeObjectPropertySetter(readDecimal),
	"vdop": makeObjectPropertySetter(readDecimal),
	"pdop": makeObjectPropertySetter(readDecimal),
	"ageofdgpsdata": makeObjectPropertySetter(readDecimal),
	"dgpsid": makeObjectPropertySetter(readPositiveInteger),
	"extensions": parseExtensions
});
/**
* @const
* @type {Array<string>}
*/
var LINK_SEQUENCE = ["text", "type"];
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var LINK_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$4, {
	"text": makeChildAppender(writeStringTextNode),
	"type": makeChildAppender(writeStringTextNode)
});
/**
* @const
* @type {Object<string, Array<string>>}
*/
var RTE_SEQUENCE = makeStructureNS(NAMESPACE_URIS$4, [
	"name",
	"cmt",
	"desc",
	"src",
	"link",
	"number",
	"type",
	"rtept"
]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var RTE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$4, {
	"name": makeChildAppender(writeStringTextNode),
	"cmt": makeChildAppender(writeStringTextNode),
	"desc": makeChildAppender(writeStringTextNode),
	"src": makeChildAppender(writeStringTextNode),
	"link": makeChildAppender(writeLink),
	"number": makeChildAppender(writeNonNegativeIntegerTextNode),
	"type": makeChildAppender(writeStringTextNode),
	"rtept": makeArraySerializer(makeChildAppender(writeWptType))
});
/**
* @const
* @type {Object<string, Array<string>>}
*/
var RTEPT_TYPE_SEQUENCE = makeStructureNS(NAMESPACE_URIS$4, ["ele", "time"]);
/**
* @const
* @type {Object<string, Array<string>>}
*/
var TRK_SEQUENCE = makeStructureNS(NAMESPACE_URIS$4, [
	"name",
	"cmt",
	"desc",
	"src",
	"link",
	"number",
	"type",
	"trkseg"
]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var TRK_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$4, {
	"name": makeChildAppender(writeStringTextNode),
	"cmt": makeChildAppender(writeStringTextNode),
	"desc": makeChildAppender(writeStringTextNode),
	"src": makeChildAppender(writeStringTextNode),
	"link": makeChildAppender(writeLink),
	"number": makeChildAppender(writeNonNegativeIntegerTextNode),
	"type": makeChildAppender(writeStringTextNode),
	"trkseg": makeArraySerializer(makeChildAppender(writeTrkSeg))
});
/**
* @const
* @type {function(*, Array<*>, string=): (Node|undefined)}
*/
var TRKSEG_NODE_FACTORY = makeSimpleNodeFactory("trkpt");
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var TRKSEG_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$4, { "trkpt": makeChildAppender(writeWptType) });
/**
* @const
* @type {Object<string, Array<string>>}
*/
var WPT_TYPE_SEQUENCE = makeStructureNS(NAMESPACE_URIS$4, [
	"ele",
	"time",
	"magvar",
	"geoidheight",
	"name",
	"cmt",
	"desc",
	"src",
	"link",
	"sym",
	"type",
	"fix",
	"sat",
	"hdop",
	"vdop",
	"pdop",
	"ageofdgpsdata",
	"dgpsid"
]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var WPT_TYPE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$4, {
	"ele": makeChildAppender(writeDecimalTextNode),
	"time": makeChildAppender(writeDateTimeTextNode),
	"magvar": makeChildAppender(writeDecimalTextNode),
	"geoidheight": makeChildAppender(writeDecimalTextNode),
	"name": makeChildAppender(writeStringTextNode),
	"cmt": makeChildAppender(writeStringTextNode),
	"desc": makeChildAppender(writeStringTextNode),
	"src": makeChildAppender(writeStringTextNode),
	"link": makeChildAppender(writeLink),
	"sym": makeChildAppender(writeStringTextNode),
	"type": makeChildAppender(writeStringTextNode),
	"fix": makeChildAppender(writeStringTextNode),
	"sat": makeChildAppender(writeNonNegativeIntegerTextNode),
	"hdop": makeChildAppender(writeDecimalTextNode),
	"vdop": makeChildAppender(writeDecimalTextNode),
	"pdop": makeChildAppender(writeDecimalTextNode),
	"ageofdgpsdata": makeChildAppender(writeDecimalTextNode),
	"dgpsid": makeChildAppender(writeNonNegativeIntegerTextNode)
});
/**
* @const
* @type {Object<string, string>}
*/
var GEOMETRY_TYPE_TO_NODENAME$1 = {
	"Point": "wpt",
	"LineString": "rte",
	"MultiLineString": "trk"
};
/**
* @param {*} value Value.
* @param {Array<*>} objectStack Object stack.
* @param {string} [nodeName] Node name.
* @return {Node|undefined} Node.
*/
function GPX_NODE_FACTORY(value, objectStack, nodeName) {
	const geometry = value.getGeometry();
	if (geometry) {
		const nodeName = GEOMETRY_TYPE_TO_NODENAME$1[geometry.getType()];
		if (nodeName) {
			const parentNode = objectStack[objectStack.length - 1].node;
			return createElementNS(parentNode.namespaceURI, nodeName);
		}
	}
}
/**
* @param {Array<number>} flatCoordinates Flat coordinates.
* @param {LayoutOptions} layoutOptions Layout options.
* @param {Element} node Node.
* @param {!Object} values Values.
* @return {Array<number>} Flat coordinates.
*/
function appendCoordinate(flatCoordinates, layoutOptions, node, values) {
	flatCoordinates.push(parseFloat(node.getAttribute("lon")), parseFloat(node.getAttribute("lat")));
	if ("ele" in values) {
		flatCoordinates.push(values["ele"]);
		delete values["ele"];
		layoutOptions.hasZ = true;
	} else flatCoordinates.push(0);
	if ("time" in values) {
		flatCoordinates.push(values["time"]);
		delete values["time"];
		layoutOptions.hasM = true;
	} else flatCoordinates.push(0);
	return flatCoordinates;
}
/**
* Choose GeometryLayout based on flags in layoutOptions and adjust flatCoordinates
* and ends arrays by shrinking them accordingly (removing unused zero entries).
*
* @param {LayoutOptions} layoutOptions Layout options.
* @param {Array<number>} flatCoordinates Flat coordinates.
* @param {Array<number>} [ends] Ends.
* @return {import("../geom/Geometry.js").GeometryLayout} Layout.
*/
function applyLayoutOptions(layoutOptions, flatCoordinates, ends) {
	/** @type {import("../geom/Geometry.js").GeometryLayout} */
	let layout = "XY";
	let stride = 2;
	if (layoutOptions.hasZ && layoutOptions.hasM) {
		layout = "XYZM";
		stride = 4;
	} else if (layoutOptions.hasZ) {
		layout = "XYZ";
		stride = 3;
	} else if (layoutOptions.hasM) {
		layout = "XYM";
		stride = 3;
	}
	if (stride !== 4) {
		for (let i = 0, ii = flatCoordinates.length / 4; i < ii; i++) {
			flatCoordinates[i * stride] = flatCoordinates[i * 4];
			flatCoordinates[i * stride + 1] = flatCoordinates[i * 4 + 1];
			if (layoutOptions.hasZ) flatCoordinates[i * stride + 2] = flatCoordinates[i * 4 + 2];
			if (layoutOptions.hasM) flatCoordinates[i * stride + 2] = flatCoordinates[i * 4 + 3];
		}
		flatCoordinates.length = flatCoordinates.length / 4 * stride;
		if (ends) for (let i = 0, ii = ends.length; i < ii; i++) ends[i] = ends[i] / 4 * stride;
	}
	return layout;
}
/**
* @param {Element} node Node.
* @param {Array<any>} objectStack Object stack.
* @return {GPXAuthor | undefined} Person object.
*/
function readAuthor(node, objectStack) {
	const values = pushParseAndPop({}, AUTHOR_PARSERS, node, objectStack);
	if (values) return values;
}
/**
* @param {Element} node Node.
* @param {Array<any>} objectStack Object stack.
* @return {GPXCopyright | undefined} Person object.
*/
function readCopyright(node, objectStack) {
	const values = pushParseAndPop({}, COPYRIGHT_PARSERS, node, objectStack);
	if (values) {
		const author = node.getAttribute("author");
		if (author !== null) values["author"] = author;
		return values;
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function parseBounds(node, objectStack) {
	const values = objectStack[objectStack.length - 1];
	const minlat = node.getAttribute("minlat");
	const minlon = node.getAttribute("minlon");
	const maxlat = node.getAttribute("maxlat");
	const maxlon = node.getAttribute("maxlon");
	if (minlon !== null && minlat !== null && maxlon !== null && maxlat !== null) values["bounds"] = [[parseFloat(minlon), parseFloat(minlat)], [parseFloat(maxlon), parseFloat(maxlat)]];
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function parseEmail(node, objectStack) {
	const values = objectStack[objectStack.length - 1];
	const id = node.getAttribute("id");
	const domain = node.getAttribute("domain");
	if (id !== null && domain !== null) values["email"] = `${id}@${domain}`;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function parseLink(node, objectStack) {
	const values = objectStack[objectStack.length - 1];
	const href = node.getAttribute("href");
	if (href !== null) values["link"] = href;
	parseNode(LINK_PARSERS$1, node, objectStack);
}
/**
* @param {Node} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function parseExtensions(node, objectStack) {
	const values = objectStack[objectStack.length - 1];
	values["extensionsNode_"] = node;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function parseRtePt(node, objectStack) {
	const values = pushParseAndPop({}, RTEPT_PARSERS, node, objectStack);
	if (values) {
		const rteValues = objectStack[objectStack.length - 1];
		const flatCoordinates = rteValues["flatCoordinates"];
		const layoutOptions = rteValues["layoutOptions"];
		appendCoordinate(flatCoordinates, layoutOptions, node, values);
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function parseTrkPt(node, objectStack) {
	const values = pushParseAndPop({}, TRKPT_PARSERS, node, objectStack);
	if (values) {
		const trkValues = objectStack[objectStack.length - 1];
		const flatCoordinates = trkValues["flatCoordinates"];
		const layoutOptions = trkValues["layoutOptions"];
		appendCoordinate(flatCoordinates, layoutOptions, node, values);
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function parseTrkSeg(node, objectStack) {
	const values = objectStack[objectStack.length - 1];
	parseNode(TRKSEG_PARSERS, node, objectStack);
	const flatCoordinates = values["flatCoordinates"];
	values["ends"].push(flatCoordinates.length);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Feature|undefined} Track.
*/
function readRte(node, objectStack) {
	const options = objectStack[0];
	const values = pushParseAndPop({
		"flatCoordinates": [],
		"layoutOptions": {}
	}, RTE_PARSERS, node, objectStack);
	if (!values) return;
	const flatCoordinates = values["flatCoordinates"];
	delete values["flatCoordinates"];
	const layoutOptions = values["layoutOptions"];
	delete values["layoutOptions"];
	const geometry = new LineString(flatCoordinates, applyLayoutOptions(layoutOptions, flatCoordinates));
	transformGeometryWithOptions(geometry, false, options);
	const feature = new Feature(geometry);
	feature.setProperties(values, true);
	return feature;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Feature|undefined} Track.
*/
function readTrk(node, objectStack) {
	const options = objectStack[0];
	const values = pushParseAndPop({
		"flatCoordinates": [],
		"ends": [],
		"layoutOptions": {}
	}, TRK_PARSERS, node, objectStack);
	if (!values) return;
	const flatCoordinates = values["flatCoordinates"];
	delete values["flatCoordinates"];
	const ends = values["ends"];
	delete values["ends"];
	const layoutOptions = values["layoutOptions"];
	delete values["layoutOptions"];
	const geometry = new MultiLineString(flatCoordinates, applyLayoutOptions(layoutOptions, flatCoordinates, ends), ends);
	transformGeometryWithOptions(geometry, false, options);
	const feature = new Feature(geometry);
	feature.setProperties(values, true);
	return feature;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Feature|undefined} Waypoint.
*/
function readWpt(node, objectStack) {
	const options = objectStack[0];
	const values = pushParseAndPop({}, WPT_PARSERS, node, objectStack);
	if (!values) return;
	const layoutOptions = {};
	const coordinates = appendCoordinate([], layoutOptions, node, values);
	const geometry = new Point(coordinates, applyLayoutOptions(layoutOptions, coordinates));
	transformGeometryWithOptions(geometry, false, options);
	const feature = new Feature(geometry);
	feature.setProperties(values, true);
	return feature;
}
/**
* @param {Element} node Node.
* @param {string} value Value for the link's `href` attribute.
* @param {Array<*>} objectStack Node stack.
*/
function writeLink(node, value, objectStack) {
	node.setAttribute("href", value);
	const properties = objectStack[objectStack.length - 1]["properties"];
	const link = [properties["linkText"], properties["linkType"]];
	pushSerializeAndPop({ node }, LINK_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, link, objectStack, LINK_SEQUENCE);
}
/**
* @param {Element} node Node.
* @param {import("../coordinate.js").Coordinate} coordinate Coordinate.
* @param {Array<*>} objectStack Object stack.
*/
function writeWptType(node, coordinate, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const namespaceURI = context.node.namespaceURI;
	const properties = context["properties"];
	node.setAttributeNS(null, "lat", String(coordinate[1]));
	node.setAttributeNS(null, "lon", String(coordinate[0]));
	switch (context["geometryLayout"]) {
		case "XYZM": if (coordinate[3] !== 0) properties["time"] = coordinate[3];
		case "XYZ":
			if (coordinate[2] !== 0) properties["ele"] = coordinate[2];
			break;
		case "XYM":
			if (coordinate[2] !== 0) properties["time"] = coordinate[2];
			break;
		default:
	}
	const orderedKeys = node.nodeName == "rtept" ? RTEPT_TYPE_SEQUENCE[namespaceURI] : WPT_TYPE_SEQUENCE[namespaceURI];
	const values = makeSequence(properties, orderedKeys);
	pushSerializeAndPop({
		node,
		"properties": properties
	}, WPT_TYPE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
}
/**
* @param {Node} node Node.
* @param {Feature} feature Feature.
* @param {Array<*>} objectStack Object stack.
*/
function writeRte(node, feature, objectStack) {
	const options = objectStack[0];
	const properties = feature.getProperties();
	const context = { node };
	context["properties"] = properties;
	const geometry = feature.getGeometry();
	if (geometry.getType() == "LineString") {
		const lineString = transformGeometryWithOptions(geometry, true, options);
		context["geometryLayout"] = lineString.getLayout();
		properties["rtept"] = lineString.getCoordinates();
	}
	const orderedKeys = RTE_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, RTE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
}
/**
* @param {Element} node Node.
* @param {Feature} feature Feature.
* @param {Array<*>} objectStack Object stack.
*/
function writeTrk(node, feature, objectStack) {
	const options = objectStack[0];
	const properties = feature.getProperties();
	/** @type {import("../xml.js").NodeStackItem} */
	const context = { node };
	context["properties"] = properties;
	const geometry = feature.getGeometry();
	if (geometry.getType() == "MultiLineString") properties["trkseg"] = transformGeometryWithOptions(geometry, true, options).getLineStrings();
	const orderedKeys = TRK_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, TRK_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
}
/**
* @param {Element} node Node.
* @param {LineString} lineString LineString.
* @param {Array<*>} objectStack Object stack.
*/
function writeTrkSeg(node, lineString, objectStack) {
	/** @type {import("../xml.js").NodeStackItem} */
	const context = { node };
	context["geometryLayout"] = lineString.getLayout();
	context["properties"] = {};
	pushSerializeAndPop(context, TRKSEG_SERIALIZERS, TRKSEG_NODE_FACTORY, lineString.getCoordinates(), objectStack);
}
/**
* @param {Element} node Node.
* @param {Feature} feature Feature.
* @param {Array<*>} objectStack Object stack.
*/
function writeWpt(node, feature, objectStack) {
	const options = objectStack[0];
	const context = objectStack[objectStack.length - 1];
	context["properties"] = feature.getProperties();
	const geometry = feature.getGeometry();
	if (geometry.getType() == "Point") {
		const point = transformGeometryWithOptions(geometry, true, options);
		context["geometryLayout"] = point.getLayout();
		writeWptType(node, point.getCoordinates(), objectStack);
	}
}
//#endregion
//#region node_modules/ol/format/TextFeature.js
/**
* @module ol/format/TextFeature
*/
/**
* @classdesc
* Abstract base class; normally only used for creating subclasses and not
* instantiated in apps.
* Base class for text feature formats.
*
* @abstract
*/
var TextFeature = class extends FeatureFormat {
	constructor() {
		super();
	}
	/**
	* @return {import("./Feature.js").Type} Format.
	* @override
	*/
	getType() {
		return "text";
	}
	/**
	* Read the feature from the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../Feature.js").default} Feature.
	* @api
	* @override
	*/
	readFeature(source, options) {
		return this.readFeatureFromText(getText(source), this.adaptOptions(options));
	}
	/**
	* @abstract
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {import("../Feature.js").default} Feature.
	*/
	readFeatureFromText(text, options) {
		return abstract();
	}
	/**
	* Read the features from the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @api
	* @override
	*/
	readFeatures(source, options) {
		return this.readFeaturesFromText(getText(source), this.adaptOptions(options));
	}
	/**
	* @abstract
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {Array<import("../Feature.js").default>} Features.
	*/
	readFeaturesFromText(text, options) {
		return abstract();
	}
	/**
	* Read the geometry from the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @api
	* @override
	*/
	readGeometry(source, options) {
		return this.readGeometryFromText(getText(source), this.adaptOptions(options));
	}
	/**
	* @abstract
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	*/
	readGeometryFromText(text, options) {
		return abstract();
	}
	/**
	* Read the projection from the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @return {import("../proj/Projection.js").default|undefined} Projection.
	* @api
	* @override
	*/
	readProjection(source) {
		return this.readProjectionFromText(getText(source));
	}
	/**
	* @param {string} text Text.
	* @protected
	* @return {import("../proj/Projection.js").default|undefined} Projection.
	*/
	readProjectionFromText(text) {
		return this.dataProjection;
	}
	/**
	* Encode a feature as a string.
	*
	* @param {import("../Feature.js").default} feature Feature.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string} Encoded feature.
	* @api
	* @override
	*/
	writeFeature(feature, options) {
		return this.writeFeatureText(feature, this.adaptOptions(options));
	}
	/**
	* @abstract
	* @param {import("../Feature.js").default} feature Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	*/
	writeFeatureText(feature, options) {
		return abstract();
	}
	/**
	* Encode an array of features as string.
	*
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string} Encoded features.
	* @api
	* @override
	*/
	writeFeatures(features, options) {
		return this.writeFeaturesText(features, this.adaptOptions(options));
	}
	/**
	* @abstract
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	*/
	writeFeaturesText(features, options) {
		return abstract();
	}
	/**
	* Write a single geometry.
	*
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string} Geometry.
	* @api
	* @override
	*/
	writeGeometry(geometry, options) {
		return this.writeGeometryText(geometry, this.adaptOptions(options));
	}
	/**
	* @abstract
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	*/
	writeGeometryText(geometry, options) {
		return abstract();
	}
};
/**
* @param {Document|Element|Object|string} source Source.
* @return {string} Text.
*/
function getText(source) {
	if (typeof source === "string") return source;
	return "";
}
//#endregion
//#region node_modules/ol/format/IGC.js
/**
* @module ol/format/IGC
*/
/**
* @typedef {'barometric' | 'gps' | 'none'} IGCZ
* IGC altitude/z. One of 'barometric', 'gps', 'none'.
*/
/**
* @const
* @type {RegExp}
*/
var B_RECORD_RE = /^B(\d{2})(\d{2})(\d{2})(\d{2})(\d{5})([NS])(\d{3})(\d{5})([EW])([AV])(\d{5})(\d{5})/;
/**
* @const
* @type {RegExp}
*/
var H_RECORD_RE = /^H.([A-Z]{3}).*?:(.*)/;
/**
* @const
* @type {RegExp}
*/
var HFDTE_RECORD_RE = /^HFDTE(\d{2})(\d{2})(\d{2})/;
/**
* @const
* @type {RegExp}
*/
var HFDTEDATE_RECORD_RE = /^HFDTEDATE:(\d{2})(\d{2})(\d{2}),(\d{2})/;
/**
* A regular expression matching the newline characters `\r\n`, `\r` and `\n`.
*
* @const
* @type {RegExp}
*/
var NEWLINE_RE = /\r\n|\r|\n/;
/**
* @typedef {Object} Options
* @property {IGCZ} [altitudeMode='none'] Altitude mode. Possible
* values are `'barometric'`, `'gps'`, and `'none'`.
*/
/**
* @classdesc
* Feature format for `*.igc` flight recording files.
*
* As IGC sources contain a single feature,
* {@link module:ol/format/IGC~IGC#readFeatures} will return the feature in an
* array
*
* @api
*/
var IGC = class extends TextFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @type {import("../proj/Projection.js").default}
		*/
		this.dataProjection = get("EPSG:4326");
		/**
		* @private
		* @type {IGCZ}
		*/
		this.altitudeMode_ = options.altitudeMode ? options.altitudeMode : "none";
		/**
		* @private
		* @type {boolean}
		*/
		this.lad_ = false;
		/**
		* @private
		* @type {boolean}
		*/
		this.lod_ = false;
		/**
		* @private
		* @type {number}
		*/
		this.ladStart_ = 0;
		/**
		* @private
		* @type {number}
		*/
		this.ladStop_ = 0;
		/**
		* @private
		* @type {number}
		*/
		this.lodStart_ = 0;
		/**
		* @private
		* @type {number}
		*/
		this.lodStop_ = 0;
	}
	/**
	* @protected
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../Feature.js").default} Feature.
	* @override
	*/
	readFeatureFromText(text, options) {
		const altitudeMode = this.altitudeMode_;
		const lines = text.split(NEWLINE_RE);
		/** @type {Object<string, string>} */
		const properties = {};
		const flatCoordinates = [];
		let year = 2e3;
		let month = 0;
		let day = 1;
		let lastDateTime = -1;
		let i, ii;
		for (i = 0, ii = lines.length; i < ii; ++i) {
			const line = lines[i];
			let m;
			if (line.charAt(0) == "B") {
				m = B_RECORD_RE.exec(line);
				if (m) {
					const hour = parseInt(m[1], 10);
					const minute = parseInt(m[2], 10);
					const second = parseInt(m[3], 10);
					let y = parseInt(m[4], 10) + parseInt(m[5], 10) / 6e4;
					if (this.lad_) y += parseInt(line.slice(this.ladStart_, this.ladStop_), 10) / 6e4 / 10 ** (this.ladStop_ - this.ladStart_);
					if (m[6] == "S") y = -y;
					let x = parseInt(m[7], 10) + parseInt(m[8], 10) / 6e4;
					if (this.lod_) x += parseInt(line.slice(this.lodStart_, this.lodStop_), 10) / 6e4 / 10 ** (this.lodStop_ - this.lodStart_);
					if (m[9] == "W") x = -x;
					flatCoordinates.push(x, y);
					if (altitudeMode != "none") {
						let z;
						if (altitudeMode == "gps") z = parseInt(m[11], 10);
						else if (altitudeMode == "barometric") z = parseInt(m[12], 10);
						else z = 0;
						flatCoordinates.push(z);
					}
					let dateTime = Date.UTC(year, month, day, hour, minute, second);
					if (dateTime < lastDateTime) dateTime = Date.UTC(year, month, day + 1, hour, minute, second);
					flatCoordinates.push(dateTime / 1e3);
					lastDateTime = dateTime;
				}
			} else if (line.charAt(0) == "H") {
				m = HFDTEDATE_RECORD_RE.exec(line);
				if (m) {
					day = parseInt(m[1], 10);
					month = parseInt(m[2], 10) - 1;
					year = 2e3 + parseInt(m[3], 10);
				} else {
					m = HFDTE_RECORD_RE.exec(line);
					if (m) {
						day = parseInt(m[1], 10);
						month = parseInt(m[2], 10) - 1;
						year = 2e3 + parseInt(m[3], 10);
					} else {
						m = H_RECORD_RE.exec(line);
						if (m) properties[m[1]] = m[2].trim();
					}
				}
			} else if (line.charAt(0) == "I") {
				const numberAdds = parseInt(line.slice(1, 3), 10);
				for (let i = 0; i < numberAdds; i++) {
					const addCode = line.slice(7 + i * 7, 10 + i * 7);
					if (addCode === "LAD" || addCode === "LOD") {
						const addStart = parseInt(line.slice(3 + i * 7, 5 + i * 7), 10) - 1;
						const addStop = parseInt(line.slice(5 + i * 7, 7 + i * 7), 10);
						if (addCode === "LAD") {
							this.lad_ = true;
							this.ladStart_ = addStart;
							this.ladStop_ = addStop;
						} else if (addCode === "LOD") {
							this.lod_ = true;
							this.lodStart_ = addStart;
							this.lodStop_ = addStop;
						}
					}
				}
			}
		}
		if (flatCoordinates.length === 0) return null;
		const feature = new Feature(transformGeometryWithOptions(new LineString(flatCoordinates, altitudeMode == "none" ? "XYM" : "XYZM"), false, options));
		feature.setProperties(properties, true);
		return feature;
	}
	/**
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {Array<Feature>} Features.
	* @override
	*/
	readFeaturesFromText(text, options) {
		const feature = this.readFeatureFromText(text, options);
		if (feature) return [feature];
		return [];
	}
};
//#endregion
//#region node_modules/ol/format/IIIFInfo.js
/**
* @module ol/format/IIIFInfo
*/
/**
* @typedef {Object} PreferredOptions
* @property {string} [format] Preferred image format. Will be used if the image information
* indicates support for that format.
* @property {string} [quality] IIIF image qualitiy.  Will be used if the image information
* indicates support for that quality.
*/
/**
* @typedef {Object} SupportedFeatures
* @property {Array<string>} [supports] Supported IIIF image size and region
* calculation features.
* @property {Array<string>} [formats] Supported image formats.
* @property {Array<string>} [qualities] Supported IIIF image qualities.
*/
/**
* @typedef {Object} TileInfo
* @property {Array<number>} scaleFactors Supported resolution scaling factors.
* @property {number} width Tile width in pixels.
* @property {number} [height] Tile height in pixels. Same as tile width if height is
* not given.
*/
/**
* @typedef {Object} IiifProfile
* @property {Array<string>} [formats] Supported image formats for the image service.
* @property {Array<string>} [qualities] Supported IIIF image qualities.
* @property {Array<string>} [supports] Supported features.
* @property {number} [maxArea] Maximum area (pixels) available for this image service.
* @property {number} [maxHeight] Maximum height.
* @property {number} [maxWidth] Maximum width.
*/
/**
* @typedef {Object<string,string|number|Array<number|string|IiifProfile|Object<string, number>|TileInfo>>}
*    ImageInformationResponse
*/
/**
* Enum representing the major IIIF Image API versions
* @enum {string}
*/
var Versions = {
	VERSION1: "version1",
	VERSION2: "version2",
	VERSION3: "version3"
};
/**
* Supported image formats, qualities and supported region / size calculation features
* for different image API versions and compliance levels
* @const
* @type {Object<string, Object<string, SupportedFeatures>>}
*/
var IIIF_PROFILE_VALUES = {};
IIIF_PROFILE_VALUES[Versions.VERSION1] = {
	"level0": {
		supports: [],
		formats: [],
		qualities: ["native"]
	},
	"level1": {
		supports: [
			"regionByPx",
			"sizeByW",
			"sizeByH",
			"sizeByPct"
		],
		formats: ["jpg"],
		qualities: ["native"]
	},
	"level2": {
		supports: [
			"regionByPx",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: [
			"native",
			"color",
			"grey",
			"bitonal"
		]
	}
};
IIIF_PROFILE_VALUES[Versions.VERSION2] = {
	"level0": {
		supports: [],
		formats: ["jpg"],
		qualities: ["default"]
	},
	"level1": {
		supports: [
			"regionByPx",
			"sizeByW",
			"sizeByH",
			"sizeByPct"
		],
		formats: ["jpg"],
		qualities: ["default"]
	},
	"level2": {
		supports: [
			"regionByPx",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByDistortedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: ["default", "bitonal"]
	}
};
IIIF_PROFILE_VALUES[Versions.VERSION3] = {
	"level0": {
		supports: [],
		formats: ["jpg"],
		qualities: ["default"]
	},
	"level1": {
		supports: [
			"regionByPx",
			"regionSquare",
			"sizeByW",
			"sizeByH",
			"sizeByWh"
		],
		formats: ["jpg"],
		qualities: ["default"]
	},
	"level2": {
		supports: [
			"regionByPx",
			"regionSquare",
			"regionByPct",
			"sizeByW",
			"sizeByH",
			"sizeByPct",
			"sizeByConfinedWh",
			"sizeByWh"
		],
		formats: ["jpg", "png"],
		qualities: ["default"]
	}
};
IIIF_PROFILE_VALUES["none"] = { "none": {
	supports: [],
	formats: [],
	qualities: []
} };
var COMPLIANCE_VERSION1 = /^https?:\/\/library\.stanford\.edu\/iiif\/image-api\/(?:1\.1\/)?compliance\.html#level[0-2]$/;
var COMPLIANCE_VERSION2 = /^https?:\/\/iiif\.io\/api\/image\/2\/level[0-2](?:\.json)?$/;
var COMPLIANCE_VERSION3 = /(^https?:\/\/iiif\.io\/api\/image\/3\/level[0-2](?:\.json)?$)|(^level[0-2]$)/;
function generateVersion1Options(iiifInfo) {
	let levelProfile = iiifInfo.getComplianceLevelSupportedFeatures();
	if (levelProfile === void 0) levelProfile = IIIF_PROFILE_VALUES[Versions.VERSION1]["level0"];
	return {
		url: iiifInfo.imageInfo["@id"] === void 0 ? void 0 : iiifInfo.imageInfo["@id"].replace(/\/?(?:info\.json)?$/g, ""),
		supports: levelProfile.supports,
		formats: [...levelProfile.formats, iiifInfo.imageInfo.formats === void 0 ? [] : iiifInfo.imageInfo.formats],
		qualities: [...levelProfile.qualities, iiifInfo.imageInfo.qualities === void 0 ? [] : iiifInfo.imageInfo.qualities],
		resolutions: iiifInfo.imageInfo.scale_factors,
		tileSize: iiifInfo.imageInfo.tile_width !== void 0 ? iiifInfo.imageInfo.tile_height !== void 0 ? [iiifInfo.imageInfo.tile_width, iiifInfo.imageInfo.tile_height] : [iiifInfo.imageInfo.tile_width, iiifInfo.imageInfo.tile_width] : iiifInfo.imageInfo.tile_height != void 0 ? [iiifInfo.imageInfo.tile_height, iiifInfo.imageInfo.tile_height] : void 0
	};
}
function generateVersion2Options(iiifInfo) {
	const levelProfile = iiifInfo.getComplianceLevelSupportedFeatures(), additionalProfile = Array.isArray(iiifInfo.imageInfo.profile) && iiifInfo.imageInfo.profile.length > 1, profileSupports = additionalProfile && iiifInfo.imageInfo.profile[1].supports ? iiifInfo.imageInfo.profile[1].supports : [], profileFormats = additionalProfile && iiifInfo.imageInfo.profile[1].formats ? iiifInfo.imageInfo.profile[1].formats : [], profileQualities = additionalProfile && iiifInfo.imageInfo.profile[1].qualities ? iiifInfo.imageInfo.profile[1].qualities : [];
	return {
		url: iiifInfo.imageInfo["@id"].replace(/\/?(?:info\.json)?$/g, ""),
		sizes: iiifInfo.imageInfo.sizes === void 0 ? void 0 : iiifInfo.imageInfo.sizes.map(function(size) {
			return [size.width, size.height];
		}),
		tileSize: iiifInfo.imageInfo.tiles === void 0 ? void 0 : [iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.width;
		})[0], iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.height === void 0 ? tile.width : tile.height;
		})[0]],
		resolutions: iiifInfo.imageInfo.tiles === void 0 ? void 0 : iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.scaleFactors;
		})[0],
		supports: [...levelProfile.supports, ...profileSupports],
		formats: [...levelProfile.formats, ...profileFormats],
		qualities: [...levelProfile.qualities, ...profileQualities]
	};
}
function generateVersion3Options(iiifInfo) {
	const levelProfile = iiifInfo.getComplianceLevelSupportedFeatures(), formats = iiifInfo.imageInfo.extraFormats === void 0 ? levelProfile.formats : [...levelProfile.formats, ...iiifInfo.imageInfo.extraFormats], preferredFormat = iiifInfo.imageInfo.preferredFormats !== void 0 && Array.isArray(iiifInfo.imageInfo.preferredFormats) && iiifInfo.imageInfo.preferredFormats.length > 0 ? iiifInfo.imageInfo.preferredFormats.filter(function(format) {
		return [
			"jpg",
			"png",
			"gif"
		].includes(format);
	}).reduce(function(acc, format) {
		return acc === void 0 && formats.includes(format) ? format : acc;
	}, void 0) : void 0;
	return {
		url: iiifInfo.imageInfo["id"],
		sizes: iiifInfo.imageInfo.sizes === void 0 ? void 0 : iiifInfo.imageInfo.sizes.map(function(size) {
			return [size.width, size.height];
		}),
		tileSize: iiifInfo.imageInfo.tiles === void 0 ? void 0 : [iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.width;
		})[0], iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.height;
		})[0]],
		resolutions: iiifInfo.imageInfo.tiles === void 0 ? void 0 : iiifInfo.imageInfo.tiles.map(function(tile) {
			return tile.scaleFactors;
		})[0],
		supports: iiifInfo.imageInfo.extraFeatures === void 0 ? levelProfile.supports : [...levelProfile.supports, ...iiifInfo.imageInfo.extraFeatures],
		formats,
		qualities: iiifInfo.imageInfo.extraQualities === void 0 ? levelProfile.qualities : [...levelProfile.qualities, ...iiifInfo.imageInfo.extraQualities],
		preferredFormat
	};
}
var versionFunctions = {};
versionFunctions[Versions.VERSION1] = generateVersion1Options;
versionFunctions[Versions.VERSION2] = generateVersion2Options;
versionFunctions[Versions.VERSION3] = generateVersion3Options;
/**
* @classdesc
* Format for transforming IIIF Image API image information responses into
* IIIF tile source ready options
*
* @api
*/
var IIIFInfo = class {
	/**
	* @param {string|ImageInformationResponse} imageInfo
	* Deserialized image information JSON response object or JSON response as string
	*/
	constructor(imageInfo) {
		this.setImageInfo(imageInfo);
	}
	/**
	* @param {string|ImageInformationResponse} imageInfo
	* Deserialized image information JSON response object or JSON response as string
	* @api
	*/
	setImageInfo(imageInfo) {
		if (typeof imageInfo == "string") this.imageInfo = JSON.parse(imageInfo);
		else this.imageInfo = imageInfo;
	}
	/**
	* @return {Versions|undefined} Major IIIF version.
	* @api
	*/
	getImageApiVersion() {
		if (this.imageInfo === void 0) return;
		let context = this.imageInfo["@context"] || "ol-no-context";
		if (typeof context == "string") context = [context];
		for (let i = 0; i < context.length; i++) switch (context[i]) {
			case "http://library.stanford.edu/iiif/image-api/1.1/context.json":
			case "http://iiif.io/api/image/1/context.json": return Versions.VERSION1;
			case "http://iiif.io/api/image/2/context.json": return Versions.VERSION2;
			case "http://iiif.io/api/image/3/context.json": return Versions.VERSION3;
			case "ol-no-context":
				if (this.getComplianceLevelEntryFromProfile(Versions.VERSION1) && this.imageInfo.identifier) return Versions.VERSION1;
				break;
			default:
		}
		assert(false, "Cannot determine IIIF Image API version from provided image information JSON");
	}
	/**
	* @param {Versions} version Optional IIIF image API version
	* @return {string|undefined} Compliance level as it appears in the IIIF image information
	* response.
	*/
	getComplianceLevelEntryFromProfile(version) {
		if (this.imageInfo === void 0 || this.imageInfo.profile === void 0) return;
		if (version === void 0) version = this.getImageApiVersion();
		switch (version) {
			case Versions.VERSION1:
				if (COMPLIANCE_VERSION1.test(this.imageInfo.profile)) return this.imageInfo.profile;
				break;
			case Versions.VERSION3:
				if (COMPLIANCE_VERSION3.test(this.imageInfo.profile)) return this.imageInfo.profile;
				break;
			case Versions.VERSION2:
				if (typeof this.imageInfo.profile === "string" && COMPLIANCE_VERSION2.test(this.imageInfo.profile)) return this.imageInfo.profile;
				if (Array.isArray(this.imageInfo.profile) && this.imageInfo.profile.length > 0 && typeof this.imageInfo.profile[0] === "string" && COMPLIANCE_VERSION2.test(this.imageInfo.profile[0])) return this.imageInfo.profile[0];
				break;
			default:
		}
	}
	/**
	* @param {Versions} version Optional IIIF image API version
	* @return {string} Compliance level, on of 'level0', 'level1' or 'level2' or undefined
	*/
	getComplianceLevelFromProfile(version) {
		const complianceLevel = this.getComplianceLevelEntryFromProfile(version);
		if (complianceLevel === void 0) return;
		const level = complianceLevel.match(/level[0-2](?:\.json)?$/g);
		return Array.isArray(level) ? level[0].replace(".json", "") : void 0;
	}
	/**
	* @return {SupportedFeatures|undefined} Image formats, qualities and region / size calculation
	* methods that are supported by the IIIF service.
	*/
	getComplianceLevelSupportedFeatures() {
		if (this.imageInfo === void 0) return;
		const version = this.getImageApiVersion();
		const level = this.getComplianceLevelFromProfile(version);
		if (level === void 0) return IIIF_PROFILE_VALUES["none"]["none"];
		return IIIF_PROFILE_VALUES[version][level];
	}
	/**
	* @param {PreferredOptions} [preferredOptions] Optional options for preferred format and quality.
	* @return {import("../source/IIIF.js").Options|undefined} IIIF tile source ready constructor options.
	* @api
	*/
	getTileSourceOptions(preferredOptions) {
		const options = preferredOptions || {}, version = this.getImageApiVersion();
		if (version === void 0) return;
		const imageOptions = version === void 0 ? void 0 : versionFunctions[version](this);
		if (imageOptions === void 0) return;
		return {
			url: imageOptions.url,
			version,
			size: [this.imageInfo.width, this.imageInfo.height],
			sizes: imageOptions.sizes,
			format: options.format !== void 0 && imageOptions.formats.includes(options.format) ? options.format : imageOptions.preferredFormat !== void 0 ? imageOptions.preferredFormat : "jpg",
			supports: imageOptions.supports,
			quality: options.quality && imageOptions.qualities.includes(options.quality) ? options.quality : imageOptions.qualities.includes("native") ? "native" : "default",
			resolutions: Array.isArray(imageOptions.resolutions) ? imageOptions.resolutions.sort(function(a, b) {
				return b - a;
			}) : void 0,
			tileSize: imageOptions.tileSize
		};
	}
};
//#endregion
//#region node_modules/ol/format/KML.js
/**
* @module ol/format/KML
*/
/**
* @typedef {Object} Vec2
* @property {number} x X coordinate.
* @property {import("../style/Icon.js").IconAnchorUnits} xunits Units of x.
* @property {number} y Y coordinate.
* @property {import("../style/Icon.js").IconAnchorUnits} yunits Units of Y.
* @property {import("../style/Icon.js").IconOrigin} [origin] Origin.
*/
/**
* @typedef {Object} GxTrackObject
* @property {Array<Array<number>>} coordinates Coordinates.
* @property {Array<number>} whens Whens.
*/
/**
* @const
* @type {Array<string>}
*/
var GX_NAMESPACE_URIS = ["http://www.google.com/kml/ext/2.2"];
/**
* @const
* @type {Array<null|string>}
*/
var NAMESPACE_URIS$3 = [
	null,
	"http://earth.google.com/kml/2.0",
	"http://earth.google.com/kml/2.1",
	"http://earth.google.com/kml/2.2",
	"http://www.opengis.net/kml/2.2"
];
/**
* @const
* @type {string}
*/
var SCHEMA_LOCATION = "http://www.opengis.net/kml/2.2 https://developers.google.com/kml/schema/kml22gx.xsd";
/**
* @type {Object<string, import("../style/Icon.js").IconAnchorUnits>}
*/
var ICON_ANCHOR_UNITS_MAP = {
	"fraction": "fraction",
	"pixels": "pixels",
	"insetPixels": "pixels"
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var PLACEMARK_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"ExtendedData": extendedDataParser,
	"Region": regionParser,
	"MultiGeometry": makeObjectPropertySetter(readMultiGeometry, "geometry"),
	"LineString": makeObjectPropertySetter(readLineString, "geometry"),
	"LinearRing": makeObjectPropertySetter(readLinearRing, "geometry"),
	"Point": makeObjectPropertySetter(readPoint, "geometry"),
	"Polygon": makeObjectPropertySetter(readPolygon, "geometry"),
	"Style": makeObjectPropertySetter(readStyle$2),
	"StyleMap": placemarkStyleMapParser,
	"address": makeObjectPropertySetter(readString),
	"description": makeObjectPropertySetter(readString),
	"name": makeObjectPropertySetter(readString),
	"open": makeObjectPropertySetter(readBoolean),
	"phoneNumber": makeObjectPropertySetter(readString),
	"styleUrl": makeObjectPropertySetter(readStyleURL),
	"visibility": makeObjectPropertySetter(readBoolean)
}, makeStructureNS(GX_NAMESPACE_URIS, {
	"MultiTrack": makeObjectPropertySetter(readGxMultiTrack, "geometry"),
	"Track": makeObjectPropertySetter(readGxTrack, "geometry")
}));
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var NETWORK_LINK_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"ExtendedData": extendedDataParser,
	"Region": regionParser,
	"Link": linkParser,
	"address": makeObjectPropertySetter(readString),
	"description": makeObjectPropertySetter(readString),
	"name": makeObjectPropertySetter(readString),
	"open": makeObjectPropertySetter(readBoolean),
	"phoneNumber": makeObjectPropertySetter(readString),
	"visibility": makeObjectPropertySetter(readBoolean)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LINK_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "href": makeObjectPropertySetter(readURI) });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var CAMERA_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	Altitude: makeObjectPropertySetter(readDecimal),
	Longitude: makeObjectPropertySetter(readDecimal),
	Latitude: makeObjectPropertySetter(readDecimal),
	Tilt: makeObjectPropertySetter(readDecimal),
	AltitudeMode: makeObjectPropertySetter(readString),
	Heading: makeObjectPropertySetter(readDecimal),
	Roll: makeObjectPropertySetter(readDecimal)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var REGION_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"LatLonAltBox": latLonAltBoxParser,
	"Lod": lodParser
});
/**
* @const
* @type {Object<string, Array<string>>}
*/
var KML_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, ["Document", "Placemark"]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var KML_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"Document": makeChildAppender(writeDocument),
	"Placemark": makeChildAppender(writePlacemark)
});
/**
* @type {import("../color.js").Color}
*/
var DEFAULT_COLOR;
/**
* @type {Fill|null}
*/
var DEFAULT_FILL_STYLE = null;
/**
* @type {import("../size.js").Size}
*/
var DEFAULT_IMAGE_STYLE_ANCHOR;
/**
* @type {import("../style/Icon.js").IconAnchorUnits}
*/
var DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS;
/**
* @type {import("../style/Icon.js").IconAnchorUnits}
*/
var DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS;
/**
* @type {import("../size.js").Size}
*/
var DEFAULT_IMAGE_STYLE_SIZE;
/**
* @type {string}
*/
var DEFAULT_IMAGE_STYLE_SRC;
/**
* @type {import("../style/Image.js").default|null}
*/
var DEFAULT_IMAGE_STYLE = null;
/**
* @type {string}
*/
var DEFAULT_NO_IMAGE_STYLE;
/**
* @type {Stroke|null}
*/
var DEFAULT_STROKE_STYLE = null;
/**
* @type {Stroke}
*/
var DEFAULT_TEXT_STROKE_STYLE;
/**
* @type {Text|null}
*/
var DEFAULT_TEXT_STYLE = null;
/**
* @type {Style|null}
*/
var DEFAULT_STYLE = null;
/**
* @type {Array<Style>|null}
*/
var DEFAULT_STYLE_ARRAY = null;
/**
* Function that returns the scale needed to normalize an icon image to 32 pixels.
* @param {import("../size.js").Size} size Image size.
* @return {number} Scale.
*/
function scaleForSize(size) {
	return 32 / Math.min(size[0], size[1]);
}
function createStyleDefaults() {
	DEFAULT_COLOR = [
		255,
		255,
		255,
		1
	];
	DEFAULT_FILL_STYLE = new Fill({ color: DEFAULT_COLOR });
	DEFAULT_IMAGE_STYLE_ANCHOR = [20, 2];
	DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS = "pixels";
	DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS = "pixels";
	DEFAULT_IMAGE_STYLE_SIZE = [64, 64];
	DEFAULT_IMAGE_STYLE_SRC = "https://maps.google.com/mapfiles/kml/pushpin/ylw-pushpin.png";
	DEFAULT_IMAGE_STYLE = new Icon({
		anchor: DEFAULT_IMAGE_STYLE_ANCHOR,
		anchorOrigin: "bottom-left",
		anchorXUnits: DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS,
		anchorYUnits: DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS,
		crossOrigin: "anonymous",
		rotation: 0,
		scale: scaleForSize(DEFAULT_IMAGE_STYLE_SIZE),
		size: DEFAULT_IMAGE_STYLE_SIZE,
		src: DEFAULT_IMAGE_STYLE_SRC
	});
	DEFAULT_NO_IMAGE_STYLE = "NO_IMAGE";
	DEFAULT_STROKE_STYLE = new Stroke({
		color: DEFAULT_COLOR,
		width: 1
	});
	DEFAULT_TEXT_STROKE_STYLE = new Stroke({
		color: [
			51,
			51,
			51,
			1
		],
		width: 2
	});
	DEFAULT_TEXT_STYLE = new Text({
		font: "bold 16px Helvetica",
		fill: DEFAULT_FILL_STYLE,
		stroke: DEFAULT_TEXT_STROKE_STYLE,
		scale: .8
	});
	DEFAULT_STYLE = new Style({
		fill: DEFAULT_FILL_STYLE,
		image: DEFAULT_IMAGE_STYLE,
		text: DEFAULT_TEXT_STYLE,
		stroke: DEFAULT_STROKE_STYLE,
		zIndex: 0
	});
	DEFAULT_STYLE_ARRAY = [DEFAULT_STYLE];
}
/**
* @type {HTMLTextAreaElement}
*/
var TEXTAREA;
/**
* A function that takes a url `{string}` and returns a url `{string}`.
* Might be used to change an icon path or to substitute a
* data url obtained from a KMZ array buffer.
*
* @typedef {function(string):string} IconUrlFunction
* @api
*/
/**
* Function that returns a url unchanged.
* @param {string} href Input url.
* @return {string} Output url.
*/
function defaultIconUrlFunction(href) {
	return href;
}
/**
* @typedef {Object} Options
* @property {boolean} [extractStyles=true] Extract styles from the KML.
* @property {boolean} [showPointNames=true] Show names as labels for placemarks which contain points.
* @property {Array<Style>} [defaultStyle] Default style. The
* default default style is the same as Google Earth.
* @property {boolean} [writeStyles=true] Write styles into KML.
* @property {null|string} [crossOrigin='anonymous'] The `crossOrigin` attribute for loaded images. Note that you must provide a
* `crossOrigin` value if you want to access pixel data with the Canvas renderer.
* @property {ReferrerPolicy} [referrerPolicy] The `referrerPolicy` property for loaded images.
* @property {IconUrlFunction} [iconUrlFunction] Function that takes a url string and returns a url string.
* Might be used to change an icon path or to substitute a data url obtained from a KMZ array buffer.
*/
/**
* @classdesc
* Feature format for reading and writing data in the KML format.
*
* {@link module:ol/format/KML~KML#readFeature} will read the first feature from
* a KML source.
*
* MultiGeometries are converted into GeometryCollections if they are a mix of
* geometry types, and into MultiPoint/MultiLineString/MultiPolygon if they are
* all of the same type.
*
* @api
*/
var KML = class extends XMLFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		if (!DEFAULT_STYLE_ARRAY) createStyleDefaults();
		/**
		* @type {import("../proj/Projection.js").default}
		*/
		this.dataProjection = get("EPSG:4326");
		/**
		* @private
		* @type {Array<Style>}
		*/
		this.defaultStyle_ = options.defaultStyle ? options.defaultStyle : DEFAULT_STYLE_ARRAY;
		/**
		* @private
		* @type {boolean}
		*/
		this.extractStyles_ = options.extractStyles !== void 0 ? options.extractStyles : true;
		/**
		* @type {boolean}
		*/
		this.writeStyles_ = options.writeStyles !== void 0 ? options.writeStyles : true;
		/**
		* @private
		* @type {!Object<string, (Array<Style>|string)>}
		*/
		this.sharedStyles_ = {};
		/**
		* @private
		* @type {boolean}
		*/
		this.showPointNames_ = options.showPointNames !== void 0 ? options.showPointNames : true;
		/**
		* @type {null|string}
		*/
		this.crossOrigin_ = options.crossOrigin !== void 0 ? options.crossOrigin : "anonymous";
		/**
		* @type {ReferrerPolicy}
		*/
		this.referrerPolicy_ = options.referrerPolicy;
		/**
		* @type {IconUrlFunction}
		*/
		this.iconUrlFunction_ = options.iconUrlFunction ? options.iconUrlFunction : defaultIconUrlFunction;
		this.supportedMediaTypes = ["application/vnd.google-earth.kml+xml"];
	}
	/**
	* @param {Node} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @private
	* @return {Array<Feature>|undefined} Features.
	*/
	readDocumentOrFolder_(node, objectStack) {
		/** @type {Array<Feature>} */
		const features = pushParseAndPop([], makeStructureNS(NAMESPACE_URIS$3, {
			"Document": makeArrayExtender(this.readDocumentOrFolder_, this),
			"Folder": makeArrayExtender(this.readDocumentOrFolder_, this),
			"Placemark": makeArrayPusher(this.readPlacemark_, this),
			"Style": this.readSharedStyle_.bind(this),
			"StyleMap": this.readSharedStyleMap_.bind(this)
		}), node, objectStack, this);
		if (features) return features;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @private
	* @return {Feature|undefined} Feature.
	*/
	readPlacemark_(node, objectStack) {
		const object = pushParseAndPop({ "geometry": null }, PLACEMARK_PARSERS, node, objectStack, this);
		if (!object) return;
		const feature = new Feature();
		const id = node.getAttribute("id");
		if (id !== null) feature.setId(id);
		const options = objectStack[0];
		const geometry = object["geometry"];
		if (geometry) transformGeometryWithOptions(geometry, false, options);
		feature.setGeometry(geometry);
		delete object["geometry"];
		if (this.extractStyles_) {
			const style = object["Style"];
			const styleUrl = object["styleUrl"];
			const styleFunction = createFeatureStyleFunction(style, styleUrl, this.defaultStyle_, this.sharedStyles_, this.showPointNames_);
			feature.setStyle(styleFunction);
		}
		delete object["Style"];
		feature.setProperties(object, true);
		return feature;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @private
	*/
	readSharedStyle_(node, objectStack) {
		const id = node.getAttribute("id");
		if (id !== null) {
			const style = readStyle$2.call(this, node, objectStack);
			if (style) {
				let styleUri;
				let baseURI = node.baseURI;
				if (!baseURI || baseURI == "about:blank") baseURI = window.location.href;
				if (baseURI) styleUri = new URL("#" + id, baseURI).href;
				else styleUri = "#" + id;
				this.sharedStyles_[styleUri] = style;
			}
		}
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @private
	*/
	readSharedStyleMap_(node, objectStack) {
		const id = node.getAttribute("id");
		if (id === null) return;
		const styleMapValue = readStyleMapValue.call(this, node, objectStack);
		if (!styleMapValue) return;
		let styleUri;
		let baseURI = node.baseURI;
		if (!baseURI || baseURI == "about:blank") baseURI = window.location.href;
		if (baseURI) styleUri = new URL("#" + id, baseURI).href;
		else styleUri = "#" + id;
		this.sharedStyles_[styleUri] = styleMapValue;
	}
	/**
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {import("../Feature.js").default} Feature.
	* @override
	*/
	readFeatureFromNode(node, options) {
		if (!NAMESPACE_URIS$3.includes(node.namespaceURI)) return null;
		const feature = this.readPlacemark_(node, [this.getReadOptions(node, options)]);
		if (feature) return feature;
		return null;
	}
	/**
	* @protected
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @override
	*/
	readFeaturesFromNode(node, options) {
		if (!NAMESPACE_URIS$3.includes(node.namespaceURI)) return [];
		let features;
		const localName = node.localName;
		if (localName == "Document" || localName == "Folder") {
			features = this.readDocumentOrFolder_(node, [this.getReadOptions(node, options)]);
			if (features) return features;
			return [];
		}
		if (localName == "Placemark") {
			const feature = this.readPlacemark_(node, [this.getReadOptions(node, options)]);
			if (feature) return [feature];
			return [];
		}
		if (localName == "kml") {
			features = [];
			for (let n = node.firstElementChild; n; n = n.nextElementSibling) {
				const fs = this.readFeaturesFromNode(n, options);
				if (fs) extend(features, fs);
			}
			return features;
		}
		return [];
	}
	/**
	* Read the name of the KML.
	*
	* @param {Document|Element|string} source Source.
	* @return {string|undefined} Name.
	* @api
	*/
	readName(source) {
		if (!source) return;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readNameFromDocument(doc);
		}
		if (isDocument(source)) return this.readNameFromDocument(source);
		return this.readNameFromNode(source);
	}
	/**
	* @param {Document} doc Document.
	* @return {string|undefined} Name.
	*/
	readNameFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) {
			const name = this.readNameFromNode(n);
			if (name) return name;
		}
	}
	/**
	* @param {Element} node Node.
	* @return {string|undefined} Name.
	*/
	readNameFromNode(node) {
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) if (NAMESPACE_URIS$3.includes(n.namespaceURI) && n.localName == "name") return readString(n);
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) {
			const localName = n.localName;
			if (NAMESPACE_URIS$3.includes(n.namespaceURI) && (localName == "Document" || localName == "Folder" || localName == "Placemark" || localName == "kml")) {
				const name = this.readNameFromNode(n);
				if (name) return name;
			}
		}
	}
	/**
	* Read the network links of the KML.
	*
	* @param {Document|Element|string} source Source.
	* @return {Array<Object>} Network links.
	* @api
	*/
	readNetworkLinks(source) {
		const networkLinks = [];
		if (typeof source === "string") {
			const doc = parse(source);
			extend(networkLinks, this.readNetworkLinksFromDocument(doc));
		} else if (isDocument(source)) extend(networkLinks, this.readNetworkLinksFromDocument(source));
		else extend(networkLinks, this.readNetworkLinksFromNode(source));
		return networkLinks;
	}
	/**
	* @param {Document} doc Document.
	* @return {Array<Object>} Network links.
	*/
	readNetworkLinksFromDocument(doc) {
		const networkLinks = [];
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) extend(networkLinks, this.readNetworkLinksFromNode(n));
		return networkLinks;
	}
	/**
	* @param {Element} node Node.
	* @return {Array<Object>} Network links.
	*/
	readNetworkLinksFromNode(node) {
		const networkLinks = [];
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) if (NAMESPACE_URIS$3.includes(n.namespaceURI) && n.localName == "NetworkLink") {
			const obj = pushParseAndPop({}, NETWORK_LINK_PARSERS, n, []);
			networkLinks.push(obj);
		}
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) {
			const localName = n.localName;
			if (NAMESPACE_URIS$3.includes(n.namespaceURI) && (localName == "Document" || localName == "Folder" || localName == "kml")) extend(networkLinks, this.readNetworkLinksFromNode(n));
		}
		return networkLinks;
	}
	/**
	* Read the regions of the KML.
	*
	* @param {Document|Element|string} source Source.
	* @return {Array<Object>} Regions.
	* @api
	*/
	readRegion(source) {
		const regions = [];
		if (typeof source === "string") {
			const doc = parse(source);
			extend(regions, this.readRegionFromDocument(doc));
		} else if (isDocument(source)) extend(regions, this.readRegionFromDocument(source));
		else extend(regions, this.readRegionFromNode(source));
		return regions;
	}
	/**
	* @param {Document} doc Document.
	* @return {Array<Object>} Region.
	*/
	readRegionFromDocument(doc) {
		const regions = [];
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) extend(regions, this.readRegionFromNode(n));
		return regions;
	}
	/**
	* @param {Element} node Node.
	* @return {Array<Object>} Region.
	* @api
	*/
	readRegionFromNode(node) {
		const regions = [];
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) if (NAMESPACE_URIS$3.includes(n.namespaceURI) && n.localName == "Region") {
			const obj = pushParseAndPop({}, REGION_PARSERS, n, []);
			regions.push(obj);
		}
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) {
			const localName = n.localName;
			if (NAMESPACE_URIS$3.includes(n.namespaceURI) && (localName == "Document" || localName == "Folder" || localName == "kml")) extend(regions, this.readRegionFromNode(n));
		}
		return regions;
	}
	/**
	* @typedef {Object} KMLCamera Specifies the observer's viewpoint and associated view parameters.
	* @property {number} [Latitude] Latitude of the camera.
	* @property {number} [Longitude] Longitude of the camera.
	* @property {number} [Altitude] Altitude of the camera.
	* @property {string} [AltitudeMode] Floor-related altitude mode.
	* @property {number} [Heading] Horizontal camera rotation.
	* @property {number} [Tilt] Lateral camera rotation.
	* @property {number} [Roll] Vertical camera rotation.
	*/
	/**
	* Read the cameras of the KML.
	*
	* @param {Document|Element|string} source Source.
	* @return {Array<KMLCamera>} Cameras.
	* @api
	*/
	readCamera(source) {
		const cameras = [];
		if (typeof source === "string") {
			const doc = parse(source);
			extend(cameras, this.readCameraFromDocument(doc));
		} else if (isDocument(source)) extend(cameras, this.readCameraFromDocument(source));
		else extend(cameras, this.readCameraFromNode(source));
		return cameras;
	}
	/**
	* @param {Document} doc Document.
	* @return {Array<KMLCamera>} Cameras.
	*/
	readCameraFromDocument(doc) {
		const cameras = [];
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType === Node.ELEMENT_NODE) extend(cameras, this.readCameraFromNode(n));
		return cameras;
	}
	/**
	* @param {Element} node Node.
	* @return {Array<KMLCamera>} Cameras.
	* @api
	*/
	readCameraFromNode(node) {
		const cameras = [];
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) if (NAMESPACE_URIS$3.includes(n.namespaceURI) && n.localName === "Camera") {
			const obj = pushParseAndPop({}, CAMERA_PARSERS, n, []);
			cameras.push(obj);
		}
		for (let n = node.firstElementChild; n; n = n.nextElementSibling) {
			const localName = n.localName;
			if (NAMESPACE_URIS$3.includes(n.namespaceURI) && (localName === "Document" || localName === "Folder" || localName === "Placemark" || localName === "kml")) extend(cameras, this.readCameraFromNode(n));
		}
		return cameras;
	}
	/**
	* Encode an array of features in the KML format as an XML node. GeometryCollections,
	* MultiPoints, MultiLineStrings, and MultiPolygons are output as MultiGeometries.
	*
	* @param {Array<Feature>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Options.
	* @return {Node} Node.
	* @api
	* @override
	*/
	writeFeaturesNode(features, options) {
		options = this.adaptOptions(options);
		const kml = createElementNS(NAMESPACE_URIS$3[4], "kml");
		const xmlnsUri = "http://www.w3.org/2000/xmlns/";
		kml.setAttributeNS(xmlnsUri, "xmlns:gx", GX_NAMESPACE_URIS[0]);
		kml.setAttributeNS(xmlnsUri, "xmlns:xsi", XML_SCHEMA_INSTANCE_URI);
		kml.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", SCHEMA_LOCATION);
		const context = { node: kml };
		/** @type {!Object<string, (Array<Feature>|Feature|undefined)>} */
		const properties = {};
		if (features.length > 1) properties["Document"] = features;
		else if (features.length == 1) properties["Placemark"] = features[0];
		const orderedKeys = KML_SEQUENCE[kml.namespaceURI];
		pushSerializeAndPop(context, KML_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), [options], orderedKeys, this);
		return kml;
	}
};
/**
* @param {Style|undefined} foundStyle Style.
* @param {string} name Name.
* @return {Style} style Style.
*/
function createNameStyleFunction(foundStyle, name) {
	const textOffset = [0, 0];
	/** @type {CanvasTextAlign} */
	let textAlign = "start";
	const imageStyle = foundStyle.getImage();
	if (imageStyle) {
		const imageSize = imageStyle.getSize();
		if (imageSize && imageSize.length == 2) {
			const imageScale = imageStyle.getScaleArray();
			const anchor = imageStyle.getAnchor();
			textOffset[0] = imageScale[0] * (imageSize[0] - anchor[0]);
			textOffset[1] = imageScale[1] * (imageSize[1] / 2 - anchor[1]);
			textAlign = "left";
		}
	}
	let textStyle = foundStyle.getText();
	if (textStyle) {
		textStyle = textStyle.clone();
		textStyle.setFont(textStyle.getFont() || DEFAULT_TEXT_STYLE.getFont());
		textStyle.setScale(textStyle.getScale() || DEFAULT_TEXT_STYLE.getScale());
		textStyle.setFill(textStyle.getFill() || DEFAULT_TEXT_STYLE.getFill());
		textStyle.setStroke(textStyle.getStroke() || DEFAULT_TEXT_STROKE_STYLE);
	} else textStyle = DEFAULT_TEXT_STYLE.clone();
	textStyle.setText(name);
	textStyle.setOffsetX(textOffset[0]);
	textStyle.setOffsetY(textOffset[1]);
	textStyle.setTextAlign(textAlign);
	return new Style({
		image: imageStyle,
		text: textStyle
	});
}
/**
* @param {Array<Style>|undefined} style Style.
* @param {string} styleUrl Style URL.
* @param {Array<Style>} defaultStyle Default style.
* @param {!Object<string, (Array<Style>|string)>} sharedStyles Shared styles.
* @param {boolean|undefined} showPointNames true to show names for point placemarks.
* @return {import("../style/Style.js").StyleFunction} Feature style function.
*/
function createFeatureStyleFunction(style, styleUrl, defaultStyle, sharedStyles, showPointNames) {
	return (function(feature, resolution) {
		let drawName = showPointNames;
		let name = "";
		let multiGeometryPoints = [];
		if (drawName) {
			const geometry = feature.getGeometry();
			if (geometry) if (geometry instanceof GeometryCollection) {
				multiGeometryPoints = geometry.getGeometriesArrayRecursive().filter(function(geometry) {
					const type = geometry.getType();
					return type === "Point" || type === "MultiPoint";
				});
				drawName = multiGeometryPoints.length > 0;
			} else {
				const type = geometry.getType();
				drawName = type === "Point" || type === "MultiPoint";
			}
		}
		if (drawName) {
			name = feature.get("name");
			drawName = drawName && !!name;
			if (drawName && /&[^&]+;/.test(name)) {
				if (!TEXTAREA) TEXTAREA = document.createElement("textarea");
				TEXTAREA.innerHTML = name;
				name = TEXTAREA.value;
			}
		}
		let featureStyle = defaultStyle;
		if (style) featureStyle = style;
		else if (styleUrl) featureStyle = findStyle(styleUrl, defaultStyle, sharedStyles);
		if (drawName) {
			const nameStyle = createNameStyleFunction(featureStyle[0], name);
			if (multiGeometryPoints.length > 0) {
				nameStyle.setGeometry(new GeometryCollection(multiGeometryPoints));
				return [nameStyle, new Style({
					geometry: featureStyle[0].getGeometry(),
					image: null,
					fill: featureStyle[0].getFill(),
					stroke: featureStyle[0].getStroke(),
					text: null
				})].concat(featureStyle.slice(1));
			}
			return nameStyle;
		}
		return featureStyle;
	});
}
/**
* @param {Array<Style>|string|undefined} styleValue Style value.
* @param {Array<Style>} defaultStyle Default style.
* @param {!Object<string, (Array<Style>|string)>} sharedStyles
* Shared styles.
* @return {Array<Style>} Style.
*/
function findStyle(styleValue, defaultStyle, sharedStyles) {
	if (Array.isArray(styleValue)) return styleValue;
	if (typeof styleValue === "string") return findStyle(sharedStyles[styleValue], defaultStyle, sharedStyles);
	return defaultStyle;
}
/**
* @param {Node} node Node.
* @return {import("../color.js").Color|undefined} Color.
*/
function readColor(node) {
	const s = getAllTextContent(node, false);
	const m = /^\s*#?\s*([0-9A-Fa-f]{8})\s*$/.exec(s);
	if (m) {
		const hexColor = m[1];
		return [
			parseInt(hexColor.substr(6, 2), 16),
			parseInt(hexColor.substr(4, 2), 16),
			parseInt(hexColor.substr(2, 2), 16),
			parseInt(hexColor.substr(0, 2), 16) / 255
		];
	}
}
/**
* @param {Node} node Node.
* @return {Array<number>|undefined} Flat coordinates.
*/
function readFlatCoordinates(node) {
	let s = getAllTextContent(node, false);
	const flatCoordinates = [];
	s = s.replace(/\s*,\s*/g, ",");
	const re = /^\s*([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?),([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)(?:\s+|,|$)(?:([+\-]?\d*\.?\d+(?:e[+\-]?\d+)?)(?:\s+|$))?\s*/i;
	let m;
	while (m = re.exec(s)) {
		const x = parseFloat(m[1]);
		const y = parseFloat(m[2]);
		const z = m[3] ? parseFloat(m[3]) : 0;
		flatCoordinates.push(x, y, z);
		s = s.substr(m[0].length);
	}
	if (s !== "") return;
	return flatCoordinates;
}
/**
* @param {Node} node Node.
* @return {string} URI.
*/
function readURI(node) {
	const s = getAllTextContent(node, false).trim();
	let baseURI = node.baseURI;
	if (!baseURI || baseURI == "about:blank") baseURI = window.location.href;
	if (baseURI) return new URL(s, baseURI).href;
	return s;
}
/**
* @param {Node} node Node.
* @return {string} URI.
*/
function readStyleURL(node) {
	const s = getAllTextContent(node, false).trim().replace(/^(?!.*#)/, "#");
	let baseURI = node.baseURI;
	if (!baseURI || baseURI == "about:blank") baseURI = window.location.href;
	if (baseURI) return new URL(s, baseURI).href;
	return s;
}
/**
* @param {Element} node Node.
* @return {Vec2} Vec2.
*/
function readVec2(node) {
	const xunits = node.getAttribute("xunits");
	const yunits = node.getAttribute("yunits");
	/** @type {import('../style/Icon.js').IconOrigin} */
	let origin;
	if (xunits !== "insetPixels") if (yunits !== "insetPixels") origin = "bottom-left";
	else origin = "top-left";
	else if (yunits !== "insetPixels") origin = "bottom-right";
	else origin = "top-right";
	return {
		x: parseFloat(node.getAttribute("x")),
		xunits: ICON_ANCHOR_UNITS_MAP[xunits],
		y: parseFloat(node.getAttribute("y")),
		yunits: ICON_ANCHOR_UNITS_MAP[yunits],
		origin
	};
}
/**
* @param {Node} node Node.
* @return {number|undefined} Scale.
*/
function readScale(node) {
	return readDecimal(node);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var STYLE_MAP_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "Pair": pairDataParser });
/**
* @this {KML}
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Array<Style>|string|undefined} StyleMap.
*/
function readStyleMapValue(node, objectStack) {
	return pushParseAndPop(void 0, STYLE_MAP_PARSERS, node, objectStack, this);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var ICON_STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"Icon": makeObjectPropertySetter(readIcon),
	"color": makeObjectPropertySetter(readColor),
	"heading": makeObjectPropertySetter(readDecimal),
	"hotSpot": makeObjectPropertySetter(readVec2),
	"scale": makeObjectPropertySetter(readScale)
});
/**
* @this {KML}
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function iconStyleParser(node, objectStack) {
	const object = pushParseAndPop({}, ICON_STYLE_PARSERS, node, objectStack);
	if (!object) return;
	const styleObject = objectStack[objectStack.length - 1];
	const IconObject = "Icon" in object ? object["Icon"] : {};
	const drawIcon = !("Icon" in object) || Object.keys(IconObject).length > 0;
	let src;
	const href = IconObject["href"];
	if (href) src = href;
	else if (drawIcon) src = DEFAULT_IMAGE_STYLE_SRC;
	let anchor, anchorXUnits, anchorYUnits;
	/** @type {import('../style/Icon.js').IconOrigin|undefined} */
	let anchorOrigin = "bottom-left";
	const hotSpot = object["hotSpot"];
	if (hotSpot) {
		anchor = [hotSpot.x, hotSpot.y];
		anchorXUnits = hotSpot.xunits;
		anchorYUnits = hotSpot.yunits;
		anchorOrigin = hotSpot.origin;
	} else if (/^https?:\/\/maps\.(?:google|gstatic)\.com\//.test(src)) {
		if (src.includes("pushpin")) {
			anchor = DEFAULT_IMAGE_STYLE_ANCHOR;
			anchorXUnits = DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS;
			anchorYUnits = DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS;
		} else if (src.includes("arrow-reverse")) {
			anchor = [54, 42];
			anchorXUnits = DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS;
			anchorYUnits = DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS;
		} else if (src.includes("paddle")) {
			anchor = [32, 1];
			anchorXUnits = DEFAULT_IMAGE_STYLE_ANCHOR_X_UNITS;
			anchorYUnits = DEFAULT_IMAGE_STYLE_ANCHOR_Y_UNITS;
		}
	}
	let offset;
	const x = IconObject["x"];
	const y = IconObject["y"];
	if (x !== void 0 && y !== void 0) offset = [x, y];
	let size;
	const w = IconObject["w"];
	const h = IconObject["h"];
	if (w !== void 0 && h !== void 0) size = [w, h];
	let rotation;
	const heading = object["heading"];
	if (heading !== void 0) rotation = toRadians(heading);
	const scale = object["scale"];
	const color = object["color"];
	if (drawIcon) {
		if (src == DEFAULT_IMAGE_STYLE_SRC) size = DEFAULT_IMAGE_STYLE_SIZE;
		const imageStyle = new Icon({
			anchor,
			anchorOrigin,
			anchorXUnits,
			anchorYUnits,
			crossOrigin: this.crossOrigin_,
			referrerPolicy: this.referrerPolicy_,
			offset,
			offsetOrigin: "bottom-left",
			rotation,
			scale,
			size,
			src: this.iconUrlFunction_(src),
			color
		});
		const imageScale = imageStyle.getScaleArray()[0];
		const imageSize = imageStyle.getSize();
		if (imageSize === null) {
			const imageState = imageStyle.getImageState();
			if (imageState === ImageState_default.IDLE || imageState === ImageState_default.LOADING) {
				const listener = function() {
					const imageState = imageStyle.getImageState();
					if (!(imageState === ImageState_default.IDLE || imageState === ImageState_default.LOADING)) {
						const imageSize = imageStyle.getSize();
						if (imageSize && imageSize.length == 2) {
							const resizeScale = scaleForSize(imageSize);
							imageStyle.setScale(imageScale * resizeScale);
						}
						imageStyle.unlistenImageChange(listener);
					}
				};
				imageStyle.listenImageChange(listener);
				if (imageState === ImageState_default.IDLE) imageStyle.load();
			}
		} else if (imageSize.length == 2) {
			const resizeScale = scaleForSize(imageSize);
			imageStyle.setScale(imageScale * resizeScale);
		}
		styleObject["imageStyle"] = imageStyle;
	} else styleObject["imageStyle"] = DEFAULT_NO_IMAGE_STYLE;
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LABEL_STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"color": makeObjectPropertySetter(readColor),
	"scale": makeObjectPropertySetter(readScale)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function labelStyleParser(node, objectStack) {
	const object = pushParseAndPop({}, LABEL_STYLE_PARSERS, node, objectStack);
	if (!object) return;
	const styleObject = objectStack[objectStack.length - 1];
	styleObject["textStyle"] = new Text({
		fill: new Fill({ color: "color" in object ? object["color"] : DEFAULT_COLOR }),
		scale: object["scale"]
	});
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LINE_STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"color": makeObjectPropertySetter(readColor),
	"width": makeObjectPropertySetter(readDecimal)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function lineStyleParser(node, objectStack) {
	const object = pushParseAndPop({}, LINE_STYLE_PARSERS, node, objectStack);
	if (!object) return;
	const styleObject = objectStack[objectStack.length - 1];
	styleObject["strokeStyle"] = new Stroke({
		color: "color" in object ? object["color"] : DEFAULT_COLOR,
		width: "width" in object ? object["width"] : 1
	});
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var POLY_STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"color": makeObjectPropertySetter(readColor),
	"fill": makeObjectPropertySetter(readBoolean),
	"outline": makeObjectPropertySetter(readBoolean)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function polyStyleParser(node, objectStack) {
	const object = pushParseAndPop({}, POLY_STYLE_PARSERS, node, objectStack);
	if (!object) return;
	const styleObject = objectStack[objectStack.length - 1];
	styleObject["fillStyle"] = new Fill({ color: "color" in object ? object["color"] : DEFAULT_COLOR });
	const fill = object["fill"];
	if (fill !== void 0) styleObject["fill"] = fill;
	const outline = object["outline"];
	if (outline !== void 0) styleObject["outline"] = outline;
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var FLAT_LINEAR_RING_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "coordinates": makeReplacer(readFlatCoordinates) });
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Array<number>} LinearRing flat coordinates.
*/
function readFlatLinearRing(node, objectStack) {
	return pushParseAndPop(null, FLAT_LINEAR_RING_PARSERS, node, objectStack);
}
/**
* @param {Node} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function gxCoordParser(node, objectStack) {
	const coordinates = objectStack[objectStack.length - 1].coordinates;
	const s = getAllTextContent(node, false);
	const m = /^\s*([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s+([+\-]?\d+(?:\.\d*)?(?:e[+\-]?\d*)?)\s*$/i.exec(s);
	if (m) {
		const x = parseFloat(m[1]);
		const y = parseFloat(m[2]);
		const z = parseFloat(m[3]);
		coordinates.push([
			x,
			y,
			z
		]);
	} else coordinates.push([]);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var GX_MULTITRACK_GEOMETRY_PARSERS = makeStructureNS(GX_NAMESPACE_URIS, { "Track": makeArrayPusher(readGxTrack) });
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {MultiLineString|undefined} MultiLineString.
*/
function readGxMultiTrack(node, objectStack) {
	const lineStrings = pushParseAndPop([], GX_MULTITRACK_GEOMETRY_PARSERS, node, objectStack);
	if (!lineStrings) return;
	return new MultiLineString(lineStrings);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var GX_TRACK_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "when": whenParser }, makeStructureNS(GX_NAMESPACE_URIS, { "coord": gxCoordParser }));
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {LineString|undefined} LineString.
*/
function readGxTrack(node, objectStack) {
	const gxTrackObject = pushParseAndPop({
		coordinates: [],
		whens: []
	}, GX_TRACK_PARSERS, node, objectStack);
	if (!gxTrackObject) return;
	const flatCoordinates = [];
	const coordinates = gxTrackObject.coordinates;
	const whens = gxTrackObject.whens;
	for (let i = 0, ii = Math.min(coordinates.length, whens.length); i < ii; ++i) if (coordinates[i].length == 3) flatCoordinates.push(coordinates[i][0], coordinates[i][1], coordinates[i][2], whens[i]);
	return new LineString(flatCoordinates, "XYZM");
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var ICON_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "href": makeObjectPropertySetter(readURI) }, makeStructureNS(GX_NAMESPACE_URIS, {
	"x": makeObjectPropertySetter(readDecimal),
	"y": makeObjectPropertySetter(readDecimal),
	"w": makeObjectPropertySetter(readDecimal),
	"h": makeObjectPropertySetter(readDecimal)
}));
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object} Icon object.
*/
function readIcon(node, objectStack) {
	const iconObject = pushParseAndPop({}, ICON_PARSERS, node, objectStack);
	if (iconObject) return iconObject;
	return null;
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var GEOMETRY_FLAT_COORDINATES_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "coordinates": makeReplacer(readFlatCoordinates) });
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Array<number>} Flat coordinates.
*/
function readFlatCoordinatesFromNode(node, objectStack) {
	return pushParseAndPop(null, GEOMETRY_FLAT_COORDINATES_PARSERS, node, objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var EXTRUDE_AND_ALTITUDE_MODE_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"extrude": makeObjectPropertySetter(readBoolean),
	"tessellate": makeObjectPropertySetter(readBoolean),
	"altitudeMode": makeObjectPropertySetter(readString)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {LineString|undefined} LineString.
*/
function readLineString(node, objectStack) {
	const properties = pushParseAndPop({}, EXTRUDE_AND_ALTITUDE_MODE_PARSERS, node, objectStack);
	const flatCoordinates = readFlatCoordinatesFromNode(node, objectStack);
	if (flatCoordinates) {
		const lineString = new LineString(flatCoordinates, "XYZ");
		lineString.setProperties(properties, true);
		return lineString;
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Polygon|undefined} Polygon.
*/
function readLinearRing(node, objectStack) {
	const properties = pushParseAndPop({}, EXTRUDE_AND_ALTITUDE_MODE_PARSERS, node, objectStack);
	const flatCoordinates = readFlatCoordinatesFromNode(node, objectStack);
	if (flatCoordinates) {
		const polygon = new Polygon(flatCoordinates, "XYZ", [flatCoordinates.length]);
		polygon.setProperties(properties, true);
		return polygon;
	}
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var MULTI_GEOMETRY_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"LineString": makeArrayPusher(readLineString),
	"LinearRing": makeArrayPusher(readLinearRing),
	"MultiGeometry": makeArrayPusher(readMultiGeometry),
	"Point": makeArrayPusher(readPoint),
	"Polygon": makeArrayPusher(readPolygon)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {import("../geom/Geometry.js").default} Geometry.
*/
function readMultiGeometry(node, objectStack) {
	const geometries = pushParseAndPop([], MULTI_GEOMETRY_PARSERS, node, objectStack);
	if (!geometries) return null;
	if (geometries.length === 0) return new GeometryCollection(geometries);
	let multiGeometry;
	let homogeneous = true;
	const type = geometries[0].getType();
	let geometry;
	for (let i = 1, ii = geometries.length; i < ii; ++i) {
		geometry = geometries[i];
		if (geometry.getType() != type) {
			homogeneous = false;
			break;
		}
	}
	if (homogeneous) {
		let layout;
		let flatCoordinates;
		if (type == "Point") {
			const point = geometries[0];
			layout = point.getLayout();
			flatCoordinates = point.getFlatCoordinates();
			for (let i = 1, ii = geometries.length; i < ii; ++i) {
				geometry = geometries[i];
				extend(flatCoordinates, geometry.getFlatCoordinates());
			}
			multiGeometry = new MultiPoint(flatCoordinates, layout);
			setCommonGeometryProperties(multiGeometry, geometries);
		} else if (type == "LineString") {
			multiGeometry = new MultiLineString(geometries);
			setCommonGeometryProperties(multiGeometry, geometries);
		} else if (type == "Polygon") {
			multiGeometry = new MultiPolygon(geometries);
			setCommonGeometryProperties(multiGeometry, geometries);
		} else if (type == "GeometryCollection" || type.startsWith("Multi")) multiGeometry = new GeometryCollection(geometries);
		else throw new Error("Unknown geometry type found");
	} else multiGeometry = new GeometryCollection(geometries);
	return multiGeometry;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Point|undefined} Point.
*/
function readPoint(node, objectStack) {
	const properties = pushParseAndPop({}, EXTRUDE_AND_ALTITUDE_MODE_PARSERS, node, objectStack);
	const flatCoordinates = readFlatCoordinatesFromNode(node, objectStack);
	if (flatCoordinates) {
		const point = new Point(flatCoordinates, "XYZ");
		point.setProperties(properties, true);
		return point;
	}
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var FLAT_LINEAR_RINGS_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"innerBoundaryIs": innerBoundaryIsParser,
	"outerBoundaryIs": outerBoundaryIsParser
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Polygon|undefined} Polygon.
*/
function readPolygon(node, objectStack) {
	const properties = pushParseAndPop({}, EXTRUDE_AND_ALTITUDE_MODE_PARSERS, node, objectStack);
	const flatLinearRings = pushParseAndPop([null], FLAT_LINEAR_RINGS_PARSERS, node, objectStack);
	if (flatLinearRings && flatLinearRings[0]) {
		const flatCoordinates = flatLinearRings[0];
		const ends = [flatCoordinates.length];
		for (let i = 1, ii = flatLinearRings.length; i < ii; ++i) {
			extend(flatCoordinates, flatLinearRings[i]);
			ends.push(flatCoordinates.length);
		}
		const polygon = new Polygon(flatCoordinates, "XYZ", ends);
		polygon.setProperties(properties, true);
		return polygon;
	}
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var STYLE_PARSERS$2 = makeStructureNS(NAMESPACE_URIS$3, {
	"IconStyle": iconStyleParser,
	"LabelStyle": labelStyleParser,
	"LineStyle": lineStyleParser,
	"PolyStyle": polyStyleParser
});
/**
* @this {KML}
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Array<Style>} Style.
*/
function readStyle$2(node, objectStack) {
	const styleObject = pushParseAndPop({}, STYLE_PARSERS$2, node, objectStack, this);
	if (!styleObject) return null;
	let fillStyle = "fillStyle" in styleObject ? styleObject["fillStyle"] : DEFAULT_FILL_STYLE;
	const fill = styleObject["fill"];
	if (fill !== void 0 && !fill) fillStyle = null;
	let imageStyle;
	if ("imageStyle" in styleObject) {
		if (styleObject["imageStyle"] != DEFAULT_NO_IMAGE_STYLE) imageStyle = styleObject["imageStyle"];
	} else imageStyle = DEFAULT_IMAGE_STYLE;
	const textStyle = "textStyle" in styleObject ? styleObject["textStyle"] : DEFAULT_TEXT_STYLE;
	const strokeStyle = "strokeStyle" in styleObject ? styleObject["strokeStyle"] : DEFAULT_STROKE_STYLE;
	const outline = styleObject["outline"];
	if (outline !== void 0 && !outline) return [new Style({
		geometry: function(feature) {
			const geometry = feature.getGeometry();
			const type = geometry.getType();
			if (type === "GeometryCollection") return new GeometryCollection(geometry.getGeometriesArrayRecursive().filter(function(geometry) {
				const type = geometry.getType();
				return type !== "Polygon" && type !== "MultiPolygon";
			}));
			if (type !== "Polygon" && type !== "MultiPolygon") return geometry;
		},
		fill: fillStyle,
		image: imageStyle,
		stroke: strokeStyle,
		text: textStyle,
		zIndex: void 0
	}), new Style({
		geometry: function(feature) {
			const geometry = feature.getGeometry();
			const type = geometry.getType();
			if (type === "GeometryCollection") return new GeometryCollection(geometry.getGeometriesArrayRecursive().filter(function(geometry) {
				const type = geometry.getType();
				return type === "Polygon" || type === "MultiPolygon";
			}));
			if (type === "Polygon" || type === "MultiPolygon") return geometry;
		},
		fill: fillStyle,
		stroke: null,
		zIndex: void 0
	})];
	return [new Style({
		fill: fillStyle,
		image: imageStyle,
		stroke: strokeStyle,
		text: textStyle,
		zIndex: void 0
	})];
}
/**
* Reads an array of geometries and creates arrays for common geometry
* properties. Then sets them to the multi geometry.
* @param {MultiPoint|MultiLineString|MultiPolygon} multiGeometry A multi-geometry.
* @param {Array<import("../geom/Geometry.js").default>} geometries List of geometries.
*/
function setCommonGeometryProperties(multiGeometry, geometries) {
	const ii = geometries.length;
	const extrudes = new Array(geometries.length);
	const tessellates = new Array(geometries.length);
	const altitudeModes = new Array(geometries.length);
	let hasExtrude, hasTessellate, hasAltitudeMode;
	hasExtrude = false;
	hasTessellate = false;
	hasAltitudeMode = false;
	for (let i = 0; i < ii; ++i) {
		const geometry = geometries[i];
		extrudes[i] = geometry.get("extrude");
		tessellates[i] = geometry.get("tessellate");
		altitudeModes[i] = geometry.get("altitudeMode");
		hasExtrude = hasExtrude || extrudes[i] !== void 0;
		hasTessellate = hasTessellate || tessellates[i] !== void 0;
		hasAltitudeMode = hasAltitudeMode || altitudeModes[i];
	}
	if (hasExtrude) multiGeometry.set("extrude", extrudes);
	if (hasTessellate) multiGeometry.set("tessellate", tessellates);
	if (hasAltitudeMode) multiGeometry.set("altitudeMode", altitudeModes);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var DATA_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"displayName": makeObjectPropertySetter(readString),
	"value": makeObjectPropertySetter(readString)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function dataParser(node, objectStack) {
	const name = node.getAttribute("name");
	parseNode(DATA_PARSERS, node, objectStack);
	const featureObject = objectStack[objectStack.length - 1];
	if (name && featureObject.displayName) featureObject[name] = {
		value: featureObject.value,
		displayName: featureObject.displayName,
		toString: function() {
			return featureObject.value;
		}
	};
	else if (name !== null) featureObject[name] = featureObject.value;
	else if (featureObject.displayName !== null) featureObject[featureObject.displayName] = featureObject.value;
	delete featureObject["value"];
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var EXTENDED_DATA_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"Data": dataParser,
	"SchemaData": schemaDataParser
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function extendedDataParser(node, objectStack) {
	parseNode(EXTENDED_DATA_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function regionParser(node, objectStack) {
	parseNode(REGION_PARSERS, node, objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var PAIR_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"Style": makeObjectPropertySetter(readStyle$2),
	"key": makeObjectPropertySetter(readString),
	"styleUrl": makeObjectPropertySetter(readStyleURL)
});
/**
* @this {KML}
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function pairDataParser(node, objectStack) {
	const pairObject = pushParseAndPop({}, PAIR_PARSERS, node, objectStack, this);
	if (!pairObject) return;
	const key = pairObject["key"];
	if (key && key == "normal") {
		const styleUrl = pairObject["styleUrl"];
		if (styleUrl) objectStack[objectStack.length - 1] = styleUrl;
		const style = pairObject["Style"];
		if (style) objectStack[objectStack.length - 1] = style;
	}
}
/**
* @this {KML}
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function placemarkStyleMapParser(node, objectStack) {
	const styleMapValue = readStyleMapValue.call(this, node, objectStack);
	if (!styleMapValue) return;
	const placemarkObject = objectStack[objectStack.length - 1];
	if (Array.isArray(styleMapValue)) placemarkObject["Style"] = styleMapValue;
	else if (typeof styleMapValue === "string") placemarkObject["styleUrl"] = styleMapValue;
	else throw new Error("`styleMapValue` has an unknown type");
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var SCHEMA_DATA_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "SimpleData": simpleDataParser });
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function schemaDataParser(node, objectStack) {
	parseNode(SCHEMA_DATA_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function simpleDataParser(node, objectStack) {
	const name = node.getAttribute("name");
	if (name !== null) {
		const data = readString(node);
		const featureObject = objectStack[objectStack.length - 1];
		featureObject[name] = data;
	}
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LAT_LON_ALT_BOX_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"altitudeMode": makeObjectPropertySetter(readString),
	"minAltitude": makeObjectPropertySetter(readDecimal),
	"maxAltitude": makeObjectPropertySetter(readDecimal),
	"north": makeObjectPropertySetter(readDecimal),
	"south": makeObjectPropertySetter(readDecimal),
	"east": makeObjectPropertySetter(readDecimal),
	"west": makeObjectPropertySetter(readDecimal)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function latLonAltBoxParser(node, objectStack) {
	const object = pushParseAndPop({}, LAT_LON_ALT_BOX_PARSERS, node, objectStack);
	if (!object) return;
	const regionObject = objectStack[objectStack.length - 1];
	regionObject["extent"] = [
		parseFloat(object["west"]),
		parseFloat(object["south"]),
		parseFloat(object["east"]),
		parseFloat(object["north"])
	];
	regionObject["altitudeMode"] = object["altitudeMode"];
	regionObject["minAltitude"] = parseFloat(object["minAltitude"]);
	regionObject["maxAltitude"] = parseFloat(object["maxAltitude"]);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LOD_PARSERS = makeStructureNS(NAMESPACE_URIS$3, {
	"minLodPixels": makeObjectPropertySetter(readDecimal),
	"maxLodPixels": makeObjectPropertySetter(readDecimal),
	"minFadeExtent": makeObjectPropertySetter(readDecimal),
	"maxFadeExtent": makeObjectPropertySetter(readDecimal)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function lodParser(node, objectStack) {
	const object = pushParseAndPop({}, LOD_PARSERS, node, objectStack);
	if (!object) return;
	const lodObject = objectStack[objectStack.length - 1];
	lodObject["minLodPixels"] = parseFloat(object["minLodPixels"]);
	lodObject["maxLodPixels"] = parseFloat(object["maxLodPixels"]);
	lodObject["minFadeExtent"] = parseFloat(object["minFadeExtent"]);
	lodObject["maxFadeExtent"] = parseFloat(object["maxFadeExtent"]);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var INNER_BOUNDARY_IS_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "LinearRing": makeArrayPusher(readFlatLinearRing) });
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function innerBoundaryIsParser(node, objectStack) {
	const innerBoundaryFlatLinearRings = pushParseAndPop([], INNER_BOUNDARY_IS_PARSERS, node, objectStack);
	if (innerBoundaryFlatLinearRings.length > 0) objectStack[objectStack.length - 1].push(...innerBoundaryFlatLinearRings);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var OUTER_BOUNDARY_IS_PARSERS = makeStructureNS(NAMESPACE_URIS$3, { "LinearRing": makeReplacer(readFlatLinearRing) });
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function outerBoundaryIsParser(node, objectStack) {
	/** @type {Array<number>|undefined} */
	const flatLinearRing = pushParseAndPop(void 0, OUTER_BOUNDARY_IS_PARSERS, node, objectStack);
	if (flatLinearRing) {
		const flatLinearRings = objectStack[objectStack.length - 1];
		flatLinearRings[0] = flatLinearRing;
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function linkParser(node, objectStack) {
	parseNode(LINK_PARSERS, node, objectStack);
}
/**
* @param {Node} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function whenParser(node, objectStack) {
	const whens = objectStack[objectStack.length - 1].whens;
	const s = getAllTextContent(node, false);
	const when = Date.parse(s);
	whens.push(isNaN(when) ? 0 : when);
}
/**
* @param {Node} node Node to append a TextNode with the color to.
* @param {import("../color.js").Color|string} color Color.
*/
function writeColorTextNode(node, color) {
	const rgba = asArray(color);
	/** @type {Array<string|number>} */
	const abgr = [
		(rgba.length == 4 ? rgba[3] : 1) * 255,
		rgba[2],
		rgba[1],
		rgba[0]
	];
	for (let i = 0; i < 4; ++i) {
		const hex = Math.floor(abgr[i]).toString(16);
		abgr[i] = hex.length == 1 ? "0" + hex : hex;
	}
	writeStringTextNode(node, abgr.join(""));
}
/**
* @param {Node} node Node to append a TextNode with the coordinates to.
* @param {Array<number>} coordinates Coordinates.
* @param {Array<*>} objectStack Object stack.
*/
function writeCoordinatesTextNode(node, coordinates, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const layout = context["layout"];
	const stride = context["stride"];
	let dimension;
	if (layout == "XY" || layout == "XYM") dimension = 2;
	else if (layout == "XYZ" || layout == "XYZM") dimension = 3;
	else throw new Error("Invalid geometry layout");
	const ii = coordinates.length;
	let text = "";
	if (ii > 0) {
		text += coordinates[0];
		for (let d = 1; d < dimension; ++d) text += "," + coordinates[d];
		for (let i = stride; i < ii; i += stride) {
			text += " " + coordinates[i];
			for (let d = 1; d < dimension; ++d) text += "," + coordinates[i + d];
		}
	}
	writeStringTextNode(node, text);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var EXTENDEDDATA_NODE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"Data": makeChildAppender(writeDataNode),
	"value": makeChildAppender(writeDataNodeValue),
	"displayName": makeChildAppender(writeDataNodeName)
});
/**
* @param {Element} node Node.
* @param {{name: *, value: *}} pair Name value pair.
* @param {Array<*>} objectStack Object stack.
*/
function writeDataNode(node, pair, objectStack) {
	node.setAttribute("name", pair.name);
	const context = { node };
	const value = pair.value;
	if (typeof value == "object") {
		if (value !== null && value.displayName) pushSerializeAndPop(context, EXTENDEDDATA_NODE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, [value.displayName], objectStack, ["displayName"]);
		if (value !== null && value.value) pushSerializeAndPop(context, EXTENDEDDATA_NODE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, [value.value], objectStack, ["value"]);
	} else pushSerializeAndPop(context, EXTENDEDDATA_NODE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, [value], objectStack, ["value"]);
}
/**
* @param {Node} node Node to append a TextNode with the name to.
* @param {string} name DisplayName.
*/
function writeDataNodeName(node, name) {
	writeStringTextNode(node, name);
}
/**
* @param {Node} node Node to append a CDATA Section with the value to.
* @param {string} value Value.
*/
function writeDataNodeValue(node, value) {
	writeStringTextNode(node, value);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var DOCUMENT_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, { "Placemark": makeChildAppender(writePlacemark) });
/**
* @const
* @param {*} value Value.
* @param {Array<*>} objectStack Object stack.
* @param {string} [nodeName] Node name.
* @return {Node|undefined} Node.
*/
var DOCUMENT_NODE_FACTORY = function(value, objectStack, nodeName) {
	const parentNode = objectStack[objectStack.length - 1].node;
	return createElementNS(parentNode.namespaceURI, "Placemark");
};
/**
* @param {Element} node Node.
* @param {Array<Feature>} features Features.
* @param {Array<*>} objectStack Object stack.
* @this {KML}
*/
function writeDocument(node, features, objectStack) {
	pushSerializeAndPop({ node }, DOCUMENT_SERIALIZERS, DOCUMENT_NODE_FACTORY, features, objectStack, void 0, this);
}
/**
* A factory for creating Data nodes.
* @const
* @type {function(*, Array<*>): (Node|undefined)}
*/
var DATA_NODE_FACTORY = makeSimpleNodeFactory("Data");
/**
* @param {Element} node Node.
* @param {{names: Array<string>, values: (Array<*>)}} namesAndValues Names and values.
* @param {Array<*>} objectStack Object stack.
*/
function writeExtendedData(node, namesAndValues, objectStack) {
	const context = { node };
	const names = namesAndValues.names;
	const values = namesAndValues.values;
	const length = names.length;
	for (let i = 0; i < length; i++) pushSerializeAndPop(context, EXTENDEDDATA_NODE_SERIALIZERS, DATA_NODE_FACTORY, [{
		name: names[i],
		value: values[i]
	}], objectStack);
}
/**
* @const
* @type {Object<string, Array<string>>}
*/
var ICON_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, ["href"], makeStructureNS(GX_NAMESPACE_URIS, [
	"x",
	"y",
	"w",
	"h"
]));
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var ICON_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, { "href": makeChildAppender(writeStringTextNode) }, makeStructureNS(GX_NAMESPACE_URIS, {
	"x": makeChildAppender(writeDecimalTextNode),
	"y": makeChildAppender(writeDecimalTextNode),
	"w": makeChildAppender(writeDecimalTextNode),
	"h": makeChildAppender(writeDecimalTextNode)
}));
/**
* @const
* @param {*} value Value.
* @param {Array<*>} objectStack Object stack.
* @param {string} [nodeName] Node name.
* @return {Node|undefined} Node.
*/
var GX_NODE_FACTORY = function(value, objectStack, nodeName) {
	return createElementNS(GX_NAMESPACE_URIS[0], "gx:" + nodeName);
};
/**
* @param {Element} node Node.
* @param {Object} icon Icon object.
* @param {Array<*>} objectStack Object stack.
*/
function writeIcon(node, icon, objectStack) {
	const context = { node };
	let orderedKeys = ICON_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	let values = makeSequence(icon, orderedKeys);
	pushSerializeAndPop(context, ICON_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, values, objectStack, orderedKeys);
	orderedKeys = ICON_SEQUENCE[GX_NAMESPACE_URIS[0]];
	values = makeSequence(icon, orderedKeys);
	pushSerializeAndPop(context, ICON_SERIALIZERS, GX_NODE_FACTORY, values, objectStack, orderedKeys);
}
/**
* @const
* @type {Object<string, Array<string>>}
*/
var ICON_STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, [
	"scale",
	"heading",
	"Icon",
	"color",
	"hotSpot"
]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var ICON_STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"Icon": makeChildAppender(writeIcon),
	"color": makeChildAppender(writeColorTextNode),
	"heading": makeChildAppender(writeDecimalTextNode),
	"hotSpot": makeChildAppender(writeVec2),
	"scale": makeChildAppender(writeScaleTextNode)
});
/**
* @param {Element} node Node.
* @param {import("../style/Icon.js").default} style Icon style.
* @param {Array<*>} objectStack Object stack.
*/
function writeIconStyle(node, style, objectStack) {
	const context = { node };
	const properties = {};
	const src = style.getSrc();
	const size = style.getSize();
	const iconImageSize = style.getImageSize();
	const iconProperties = { "href": src };
	if (size) {
		iconProperties["w"] = size[0];
		iconProperties["h"] = size[1];
		const anchor = style.getAnchor();
		const origin = style.getOrigin();
		if (origin && iconImageSize && origin[0] !== 0 && origin[1] !== size[1]) {
			iconProperties["x"] = origin[0];
			iconProperties["y"] = iconImageSize[1] - (origin[1] + size[1]);
		}
		if (anchor && (anchor[0] !== size[0] / 2 || anchor[1] !== size[1] / 2)) properties["hotSpot"] = {
			x: anchor[0],
			xunits: "pixels",
			y: size[1] - anchor[1],
			yunits: "pixels"
		};
	}
	properties["Icon"] = iconProperties;
	let scale = style.getScaleArray()[0];
	let imageSize = size;
	if (imageSize === null) imageSize = DEFAULT_IMAGE_STYLE_SIZE;
	if (imageSize.length == 2) {
		const resizeScale = scaleForSize(imageSize);
		scale = scale / resizeScale;
	}
	if (scale !== 1) properties["scale"] = scale;
	const rotation = style.getRotation();
	if (rotation !== 0) properties["heading"] = rotation;
	const color = style.getColor();
	if (color) properties["color"] = color;
	const orderedKeys = ICON_STYLE_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, ICON_STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
}
/**
* @const
* @type {Object<string, Array<string>>}
*/
var LABEL_STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, ["color", "scale"]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var LABEL_STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"color": makeChildAppender(writeColorTextNode),
	"scale": makeChildAppender(writeScaleTextNode)
});
/**
* @param {Element} node Node.
* @param {Text} style style.
* @param {Array<*>} objectStack Object stack.
*/
function writeLabelStyle(node, style, objectStack) {
	const context = { node };
	const properties = {};
	const fill = style.getFill();
	if (fill) properties["color"] = fill.getColor();
	const scale = style.getScale();
	if (scale && scale !== 1) properties["scale"] = scale;
	const orderedKeys = LABEL_STYLE_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, LABEL_STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
}
/**
* @const
* @type {Object<string, Array<string>>}
*/
var LINE_STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, ["color", "width"]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var LINE_STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"color": makeChildAppender(writeColorTextNode),
	"width": makeChildAppender(writeDecimalTextNode)
});
/**
* @param {Element} node Node.
* @param {Stroke} style style.
* @param {Array<*>} objectStack Object stack.
*/
function writeLineStyle(node, style, objectStack) {
	const context = { node };
	const properties = {
		"color": style.getColor(),
		"width": Number(style.getWidth()) || 1
	};
	const orderedKeys = LINE_STYLE_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, LINE_STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
}
/**
* @const
* @type {Object<string, string>}
*/
var GEOMETRY_TYPE_TO_NODENAME = {
	"Point": "Point",
	"LineString": "LineString",
	"LinearRing": "LinearRing",
	"Polygon": "Polygon",
	"MultiPoint": "MultiGeometry",
	"MultiLineString": "MultiGeometry",
	"MultiPolygon": "MultiGeometry",
	"GeometryCollection": "MultiGeometry"
};
/**
* @const
* @param {*} value Value.
* @param {Array<*>} objectStack Object stack.
* @param {string} [nodeName] Node name.
* @return {Node|undefined} Node.
*/
var GEOMETRY_NODE_FACTORY = function(value, objectStack, nodeName) {
	if (value) {
		const parentNode = objectStack[objectStack.length - 1].node;
		return createElementNS(parentNode.namespaceURI, GEOMETRY_TYPE_TO_NODENAME[value.getType()]);
	}
};
/**
* A factory for creating Point nodes.
* @const
* @type {function(*, Array<*>, string=): (Node|undefined)}
*/
var POINT_NODE_FACTORY = makeSimpleNodeFactory("Point");
/**
* A factory for creating LineString nodes.
* @const
* @type {function(*, Array<*>, string=): (Node|undefined)}
*/
var LINE_STRING_NODE_FACTORY = makeSimpleNodeFactory("LineString");
/**
* A factory for creating LinearRing nodes.
* @const
* @type {function(*, Array<*>, string=): (Node|undefined)}
*/
var LINEAR_RING_NODE_FACTORY = makeSimpleNodeFactory("LinearRing");
/**
* A factory for creating Polygon nodes.
* @const
* @type {function(*, Array<*>, string=): (Node|undefined)}
*/
var POLYGON_NODE_FACTORY = makeSimpleNodeFactory("Polygon");
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var MULTI_GEOMETRY_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"LineString": makeChildAppender(writePrimitiveGeometry),
	"Point": makeChildAppender(writePrimitiveGeometry),
	"Polygon": makeChildAppender(writePolygon),
	"GeometryCollection": makeChildAppender(writeMultiGeometry)
});
/**
* @param {Element} node Node.
* @param {import("../geom/Geometry.js").default} geometry Geometry.
* @param {Array<*>} objectStack Object stack.
*/
function writeMultiGeometry(node, geometry, objectStack) {
	/** @type {import("../xml.js").NodeStackItem} */
	const context = { node };
	const type = geometry.getType();
	/** @type {Array<import("../geom/Geometry.js").default>} */
	let geometries = [];
	/** @type {function(*, Array<*>, string=): (Node|undefined)} */
	let factory;
	if (type === "GeometryCollection") {
		/** @type {GeometryCollection} */ geometry.getGeometriesArrayRecursive().forEach(function(geometry) {
			const type = geometry.getType();
			if (type === "MultiPoint") geometries = geometries.concat(
				/** @type {MultiPoint} */
				geometry.getPoints()
			);
			else if (type === "MultiLineString") geometries = geometries.concat(
				/** @type {MultiLineString} */
				geometry.getLineStrings()
			);
			else if (type === "MultiPolygon") geometries = geometries.concat(
				/** @type {MultiPolygon} */
				geometry.getPolygons()
			);
			else if (type === "Point" || type === "LineString" || type === "Polygon") geometries.push(geometry);
			else throw new Error("Unknown geometry type");
		});
		factory = GEOMETRY_NODE_FACTORY;
	} else if (type === "MultiPoint") {
		geometries = geometry.getPoints();
		factory = POINT_NODE_FACTORY;
	} else if (type === "MultiLineString") {
		geometries = geometry.getLineStrings();
		factory = LINE_STRING_NODE_FACTORY;
	} else if (type === "MultiPolygon") {
		geometries = geometry.getPolygons();
		factory = POLYGON_NODE_FACTORY;
	} else throw new Error("Unknown geometry type");
	pushSerializeAndPop(context, MULTI_GEOMETRY_SERIALIZERS, factory, geometries, objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var BOUNDARY_IS_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, { "LinearRing": makeChildAppender(writePrimitiveGeometry) });
/**
* @param {Element} node Node.
* @param {import("../geom/LinearRing.js").default} linearRing Linear ring.
* @param {Array<*>} objectStack Object stack.
*/
function writeBoundaryIs(node, linearRing, objectStack) {
	pushSerializeAndPop({ node }, BOUNDARY_IS_SERIALIZERS, LINEAR_RING_NODE_FACTORY, [linearRing], objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var PLACEMARK_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"ExtendedData": makeChildAppender(writeExtendedData),
	"MultiGeometry": makeChildAppender(writeMultiGeometry),
	"LineString": makeChildAppender(writePrimitiveGeometry),
	"LinearRing": makeChildAppender(writePrimitiveGeometry),
	"Point": makeChildAppender(writePrimitiveGeometry),
	"Polygon": makeChildAppender(writePolygon),
	"Style": makeChildAppender(writeStyle),
	"address": makeChildAppender(writeStringTextNode),
	"description": makeChildAppender(writeStringTextNode),
	"name": makeChildAppender(writeStringTextNode),
	"open": makeChildAppender(writeBooleanTextNode),
	"phoneNumber": makeChildAppender(writeStringTextNode),
	"styleUrl": makeChildAppender(writeStringTextNode),
	"visibility": makeChildAppender(writeBooleanTextNode)
});
/**
* @const
* @type {Object<string, Array<string>>}
*/
var PLACEMARK_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, [
	"name",
	"open",
	"visibility",
	"address",
	"phoneNumber",
	"description",
	"styleUrl",
	"Style"
]);
/**
* A factory for creating ExtendedData nodes.
* @const
* @type {function(*, Array<*>): (Node|undefined)}
*/
var EXTENDEDDATA_NODE_FACTORY = makeSimpleNodeFactory("ExtendedData");
/**
* FIXME currently we do serialize arbitrary/custom feature properties
* (ExtendedData).
* @param {Element} node Node.
* @param {Feature} feature Feature.
* @param {Array<*>} objectStack Object stack.
* @this {KML}
*/
function writePlacemark(node, feature, objectStack) {
	const context = { node };
	if (feature.getId()) node.setAttribute("id", feature.getId());
	const properties = feature.getProperties();
	const filter = {
		"address": 1,
		"description": 1,
		"name": 1,
		"open": 1,
		"phoneNumber": 1,
		"styleUrl": 1,
		"visibility": 1
	};
	filter[feature.getGeometryName()] = 1;
	const keys = Object.keys(properties || {}).sort().filter(function(v) {
		return !filter[v];
	});
	const styleFunction = feature.getStyleFunction();
	if (styleFunction) {
		const styles = styleFunction(feature, 0);
		if (styles) {
			const styleArray = Array.isArray(styles) ? styles : [styles];
			let pointStyles = styleArray;
			if (feature.getGeometry()) pointStyles = styleArray.filter(function(style) {
				const geometry = style.getGeometryFunction()(feature);
				if (geometry) {
					const type = geometry.getType();
					if (type === "GeometryCollection") return geometry.getGeometriesArrayRecursive().filter(function(geometry) {
						const type = geometry.getType();
						return type === "Point" || type === "MultiPoint";
					}).length;
					return type === "Point" || type === "MultiPoint";
				}
			});
			if (this.writeStyles_) {
				let lineStyles = styleArray;
				let polyStyles = styleArray;
				if (feature.getGeometry()) {
					lineStyles = styleArray.filter(function(style) {
						const geometry = style.getGeometryFunction()(feature);
						if (geometry) {
							const type = geometry.getType();
							if (type === "GeometryCollection") return geometry.getGeometriesArrayRecursive().filter(function(geometry) {
								const type = geometry.getType();
								return type === "LineString" || type === "MultiLineString";
							}).length;
							return type === "LineString" || type === "MultiLineString";
						}
					});
					polyStyles = styleArray.filter(function(style) {
						const geometry = style.getGeometryFunction()(feature);
						if (geometry) {
							const type = geometry.getType();
							if (type === "GeometryCollection") return geometry.getGeometriesArrayRecursive().filter(function(geometry) {
								const type = geometry.getType();
								return type === "Polygon" || type === "MultiPolygon";
							}).length;
							return type === "Polygon" || type === "MultiPolygon";
						}
					});
				}
				properties["Style"] = {
					pointStyles,
					lineStyles,
					polyStyles
				};
			}
			if (pointStyles.length && properties["name"] === void 0) {
				const textStyle = pointStyles[0].getText();
				if (textStyle) properties["name"] = textStyle.getText();
			}
		}
	}
	const orderedKeys = PLACEMARK_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, PLACEMARK_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
	if (keys.length > 0) pushSerializeAndPop(context, PLACEMARK_SERIALIZERS, EXTENDEDDATA_NODE_FACTORY, [{
		names: keys,
		values: makeSequence(properties, keys)
	}], objectStack);
	const options = objectStack[0];
	let geometry = feature.getGeometry();
	if (geometry) geometry = transformGeometryWithOptions(geometry, true, options);
	pushSerializeAndPop(context, PLACEMARK_SERIALIZERS, GEOMETRY_NODE_FACTORY, [geometry], objectStack);
}
/**
* @const
* @type {Object<string, Array<string>>}
*/
var PRIMITIVE_GEOMETRY_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, [
	"extrude",
	"tessellate",
	"altitudeMode",
	"coordinates"
]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var PRIMITIVE_GEOMETRY_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"extrude": makeChildAppender(writeBooleanTextNode),
	"tessellate": makeChildAppender(writeBooleanTextNode),
	"altitudeMode": makeChildAppender(writeStringTextNode),
	"coordinates": makeChildAppender(writeCoordinatesTextNode)
});
/**
* @param {Element} node Node.
* @param {import("../geom/SimpleGeometry.js").default} geometry Geometry.
* @param {Array<*>} objectStack Object stack.
*/
function writePrimitiveGeometry(node, geometry, objectStack) {
	const flatCoordinates = geometry.getFlatCoordinates();
	const context = { node };
	context["layout"] = geometry.getLayout();
	context["stride"] = geometry.getStride();
	const properties = geometry.getProperties();
	properties.coordinates = flatCoordinates;
	const orderedKeys = PRIMITIVE_GEOMETRY_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, PRIMITIVE_GEOMETRY_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
}
/**
* @const
* @type {Object<string, Array<string>>}
*/
var POLY_STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, [
	"color",
	"fill",
	"outline"
]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var POLYGON_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"outerBoundaryIs": makeChildAppender(writeBoundaryIs),
	"innerBoundaryIs": makeChildAppender(writeBoundaryIs)
});
/**
* A factory for creating innerBoundaryIs nodes.
* @const
* @type {function(*, Array<*>, string=): (Node|undefined)}
*/
var INNER_BOUNDARY_NODE_FACTORY = makeSimpleNodeFactory("innerBoundaryIs");
/**
* A factory for creating outerBoundaryIs nodes.
* @const
* @type {function(*, Array<*>, string=): (Node|undefined)}
*/
var OUTER_BOUNDARY_NODE_FACTORY = makeSimpleNodeFactory("outerBoundaryIs");
/**
* @param {Element} node Node.
* @param {Polygon} polygon Polygon.
* @param {Array<*>} objectStack Object stack.
*/
function writePolygon(node, polygon, objectStack) {
	const linearRings = polygon.getLinearRings();
	const outerRing = linearRings.shift();
	const context = { node };
	pushSerializeAndPop(context, POLYGON_SERIALIZERS, INNER_BOUNDARY_NODE_FACTORY, linearRings, objectStack);
	pushSerializeAndPop(context, POLYGON_SERIALIZERS, OUTER_BOUNDARY_NODE_FACTORY, [outerRing], objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var POLY_STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"color": makeChildAppender(writeColorTextNode),
	"fill": makeChildAppender(writeBooleanTextNode),
	"outline": makeChildAppender(writeBooleanTextNode)
});
/**
* @param {Element} node Node.
* @param {Style} style Style.
* @param {Array<*>} objectStack Object stack.
*/
function writePolyStyle(node, style, objectStack) {
	const context = { node };
	const fill = style.getFill();
	const stroke = style.getStroke();
	const properties = {
		"color": fill ? fill.getColor() : void 0,
		"fill": fill ? void 0 : false,
		"outline": stroke ? void 0 : false
	};
	const orderedKeys = POLY_STYLE_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, POLY_STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
}
/**
* @param {Node} node Node to append a TextNode with the scale to.
* @param {number|undefined} scale Scale.
*/
function writeScaleTextNode(node, scale) {
	writeDecimalTextNode(node, Math.round(scale * 1e6) / 1e6);
}
/**
* @const
* @type {Object<string, Array<string>>}
*/
var STYLE_SEQUENCE = makeStructureNS(NAMESPACE_URIS$3, [
	"IconStyle",
	"LabelStyle",
	"LineStyle",
	"PolyStyle"
]);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var STYLE_SERIALIZERS = makeStructureNS(NAMESPACE_URIS$3, {
	"IconStyle": makeChildAppender(writeIconStyle),
	"LabelStyle": makeChildAppender(writeLabelStyle),
	"LineStyle": makeChildAppender(writeLineStyle),
	"PolyStyle": makeChildAppender(writePolyStyle)
});
/**
* @param {Element} node Node.
* @param {Object<string, Array<Style>>} styles Styles.
* @param {Array<*>} objectStack Object stack.
*/
function writeStyle(node, styles, objectStack) {
	const context = { node };
	const properties = {};
	if (styles.pointStyles.length) {
		const textStyle = styles.pointStyles[0].getText();
		if (textStyle) properties["LabelStyle"] = textStyle;
		const imageStyle = styles.pointStyles[0].getImage();
		if (imageStyle && typeof imageStyle.getSrc === "function") properties["IconStyle"] = imageStyle;
	}
	if (styles.lineStyles.length) {
		const strokeStyle = styles.lineStyles[0].getStroke();
		if (strokeStyle) properties["LineStyle"] = strokeStyle;
	}
	if (styles.polyStyles.length) {
		const strokeStyle = styles.polyStyles[0].getStroke();
		if (strokeStyle && !properties["LineStyle"]) properties["LineStyle"] = strokeStyle;
		properties["PolyStyle"] = styles.polyStyles[0];
	}
	const orderedKeys = STYLE_SEQUENCE[objectStack[objectStack.length - 1].node.namespaceURI];
	pushSerializeAndPop(context, STYLE_SERIALIZERS, OBJECT_PROPERTY_NODE_FACTORY, makeSequence(properties, orderedKeys), objectStack, orderedKeys);
}
/**
* @param {Element} node Node to append a TextNode with the Vec2 to.
* @param {Vec2} vec2 Vec2.
*/
function writeVec2(node, vec2) {
	node.setAttribute("x", String(vec2.x));
	node.setAttribute("y", String(vec2.y));
	node.setAttribute("xunits", vec2.xunits);
	node.setAttribute("yunits", vec2.yunits);
}
//#endregion
//#region node_modules/pbf/index.js
var SHIFT_LEFT_32 = 65536 * 65536;
var SHIFT_RIGHT_32 = 1 / SHIFT_LEFT_32;
var TEXT_DECODER_MIN_LENGTH = 12;
var utf8TextDecoder = typeof TextDecoder === "undefined" ? null : new TextDecoder("utf-8");
var PBF_VARINT = 0;
var PBF_FIXED64 = 1;
var PBF_BYTES = 2;
var PBF_FIXED32 = 5;
var Pbf = class {
	/**
	* @param {Uint8Array | ArrayBuffer} [buf]
	*/
	constructor(buf = new Uint8Array(16)) {
		this.buf = ArrayBuffer.isView(buf) ? buf : new Uint8Array(buf);
		this.dataView = new DataView(this.buf.buffer);
		this.pos = 0;
		this.type = 0;
		this.length = this.buf.length;
	}
	/**
	* @template T
	* @param {(tag: number, result: T, pbf: Pbf) => void} readField
	* @param {T} result
	* @param {number} [end]
	*/
	readFields(readField, result, end = this.length) {
		while (this.pos < end) {
			const val = this.readVarint(), tag = val >> 3, startPos = this.pos;
			this.type = val & 7;
			readField(tag, result, this);
			if (this.pos === startPos) this.skip(val);
		}
		return result;
	}
	/**
	* @template T
	* @param {(tag: number, result: T, pbf: Pbf) => void} readField
	* @param {T} result
	*/
	readMessage(readField, result) {
		return this.readFields(readField, result, this.readVarint() + this.pos);
	}
	readFixed32() {
		const val = this.dataView.getUint32(this.pos, true);
		this.pos += 4;
		return val;
	}
	readSFixed32() {
		const val = this.dataView.getInt32(this.pos, true);
		this.pos += 4;
		return val;
	}
	readFixed64() {
		const val = this.dataView.getUint32(this.pos, true) + this.dataView.getUint32(this.pos + 4, true) * SHIFT_LEFT_32;
		this.pos += 8;
		return val;
	}
	readSFixed64() {
		const val = this.dataView.getUint32(this.pos, true) + this.dataView.getInt32(this.pos + 4, true) * SHIFT_LEFT_32;
		this.pos += 8;
		return val;
	}
	readFloat() {
		const val = this.dataView.getFloat32(this.pos, true);
		this.pos += 4;
		return val;
	}
	readDouble() {
		const val = this.dataView.getFloat64(this.pos, true);
		this.pos += 8;
		return val;
	}
	/**
	* @param {boolean} [isSigned]
	*/
	readVarint(isSigned) {
		const buf = this.buf;
		let val, b;
		b = buf[this.pos++];
		val = b & 127;
		if (b < 128) return val;
		b = buf[this.pos++];
		val |= (b & 127) << 7;
		if (b < 128) return val;
		b = buf[this.pos++];
		val |= (b & 127) << 14;
		if (b < 128) return val;
		b = buf[this.pos++];
		val |= (b & 127) << 21;
		if (b < 128) return val;
		b = buf[this.pos];
		val |= (b & 15) << 28;
		return readVarintRemainder(val, isSigned, this);
	}
	readVarint64() {
		return this.readVarint(true);
	}
	readSVarint() {
		const num = this.readVarint();
		return num % 2 === 1 ? (num + 1) / -2 : num / 2;
	}
	readBoolean() {
		return Boolean(this.readVarint());
	}
	readString() {
		const end = this.readVarint() + this.pos;
		const pos = this.pos;
		this.pos = end;
		if (end - pos >= TEXT_DECODER_MIN_LENGTH && utf8TextDecoder) return utf8TextDecoder.decode(this.buf.subarray(pos, end));
		return readUtf8(this.buf, pos, end);
	}
	readBytes() {
		const end = this.readVarint() + this.pos, buffer = this.buf.subarray(this.pos, end);
		this.pos = end;
		return buffer;
	}
	/**
	* @param {number[]} [arr]
	* @param {boolean} [isSigned]
	*/
	readPackedVarint(arr = [], isSigned) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readVarint(isSigned));
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedSVarint(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readSVarint());
		return arr;
	}
	/** @param {boolean[]} [arr] */
	readPackedBoolean(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readBoolean());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedFloat(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readFloat());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedDouble(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readDouble());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedFixed32(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readFixed32());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedSFixed32(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readSFixed32());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedFixed64(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readFixed64());
		return arr;
	}
	/** @param {number[]} [arr] */
	readPackedSFixed64(arr = []) {
		const end = this.readPackedEnd();
		while (this.pos < end) arr.push(this.readSFixed64());
		return arr;
	}
	readPackedEnd() {
		return this.type === PBF_BYTES ? this.readVarint() + this.pos : this.pos + 1;
	}
	/** @param {number} val */
	skip(val) {
		const type = val & 7;
		if (type === PBF_VARINT) while (this.buf[this.pos++] > 127);
		else if (type === PBF_BYTES) this.pos = this.readVarint() + this.pos;
		else if (type === PBF_FIXED32) this.pos += 4;
		else if (type === PBF_FIXED64) this.pos += 8;
		else throw new Error(`Unimplemented type: ${type}`);
	}
	/**
	* @param {number} tag
	* @param {number} type
	*/
	writeTag(tag, type) {
		this.writeVarint(tag << 3 | type);
	}
	/** @param {number} min */
	realloc(min) {
		let length = this.length || 16;
		while (length < this.pos + min) length *= 2;
		if (length !== this.length) {
			const buf = new Uint8Array(length);
			buf.set(this.buf);
			this.buf = buf;
			this.dataView = new DataView(buf.buffer);
			this.length = length;
		}
	}
	finish() {
		this.length = this.pos;
		this.pos = 0;
		return this.buf.subarray(0, this.length);
	}
	/** @param {number} val */
	writeFixed32(val) {
		this.realloc(4);
		this.dataView.setInt32(this.pos, val, true);
		this.pos += 4;
	}
	/** @param {number} val */
	writeSFixed32(val) {
		this.realloc(4);
		this.dataView.setInt32(this.pos, val, true);
		this.pos += 4;
	}
	/** @param {number} val */
	writeFixed64(val) {
		this.realloc(8);
		this.dataView.setInt32(this.pos, val & -1, true);
		this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
		this.pos += 8;
	}
	/** @param {number} val */
	writeSFixed64(val) {
		this.realloc(8);
		this.dataView.setInt32(this.pos, val & -1, true);
		this.dataView.setInt32(this.pos + 4, Math.floor(val * SHIFT_RIGHT_32), true);
		this.pos += 8;
	}
	/** @param {number} val */
	writeVarint(val) {
		val = +val || 0;
		if (val > 268435455 || val < 0) {
			writeBigVarint(val, this);
			return;
		}
		this.realloc(4);
		this.buf[this.pos++] = val & 127 | (val > 127 ? 128 : 0);
		if (val <= 127) return;
		this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
		if (val <= 127) return;
		this.buf[this.pos++] = (val >>>= 7) & 127 | (val > 127 ? 128 : 0);
		if (val <= 127) return;
		this.buf[this.pos++] = val >>> 7 & 127;
	}
	/** @param {number} val */
	writeSVarint(val) {
		this.writeVarint(val < 0 ? -val * 2 - 1 : val * 2);
	}
	/** @param {boolean} val */
	writeBoolean(val) {
		this.writeVarint(+val);
	}
	/** @param {string} str */
	writeString(str) {
		str = String(str);
		this.realloc(str.length * 4);
		this.pos++;
		const startPos = this.pos;
		this.pos = writeUtf8(this.buf, str, this.pos);
		const len = this.pos - startPos;
		if (len >= 128) makeRoomForExtraLength(startPos, len, this);
		this.pos = startPos - 1;
		this.writeVarint(len);
		this.pos += len;
	}
	/** @param {number} val */
	writeFloat(val) {
		this.realloc(4);
		this.dataView.setFloat32(this.pos, val, true);
		this.pos += 4;
	}
	/** @param {number} val */
	writeDouble(val) {
		this.realloc(8);
		this.dataView.setFloat64(this.pos, val, true);
		this.pos += 8;
	}
	/** @param {Uint8Array} buffer */
	writeBytes(buffer) {
		const len = buffer.length;
		this.writeVarint(len);
		this.realloc(len);
		for (let i = 0; i < len; i++) this.buf[this.pos++] = buffer[i];
	}
	/**
	* @template T
	* @param {(obj: T, pbf: Pbf) => void} fn
	* @param {T} obj
	*/
	writeRawMessage(fn, obj) {
		this.pos++;
		const startPos = this.pos;
		fn(obj, this);
		const len = this.pos - startPos;
		if (len >= 128) makeRoomForExtraLength(startPos, len, this);
		this.pos = startPos - 1;
		this.writeVarint(len);
		this.pos += len;
	}
	/**
	* @template T
	* @param {number} tag
	* @param {(obj: T, pbf: Pbf) => void} fn
	* @param {T} obj
	*/
	writeMessage(tag, fn, obj) {
		this.writeTag(tag, PBF_BYTES);
		this.writeRawMessage(fn, obj);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedVarint(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedVarint, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedSVarint(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedSVarint, arr);
	}
	/**
	* @param {number} tag
	* @param {boolean[]} arr
	*/
	writePackedBoolean(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedBoolean, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedFloat(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedFloat, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedDouble(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedDouble, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedFixed32(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedFixed32, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedSFixed32(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedSFixed32, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedFixed64(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedFixed64, arr);
	}
	/**
	* @param {number} tag
	* @param {number[]} arr
	*/
	writePackedSFixed64(tag, arr) {
		if (arr.length) this.writeMessage(tag, writePackedSFixed64, arr);
	}
	/**
	* @param {number} tag
	* @param {Uint8Array} buffer
	*/
	writeBytesField(tag, buffer) {
		this.writeTag(tag, PBF_BYTES);
		this.writeBytes(buffer);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeFixed32Field(tag, val) {
		this.writeTag(tag, PBF_FIXED32);
		this.writeFixed32(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeSFixed32Field(tag, val) {
		this.writeTag(tag, PBF_FIXED32);
		this.writeSFixed32(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeFixed64Field(tag, val) {
		this.writeTag(tag, PBF_FIXED64);
		this.writeFixed64(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeSFixed64Field(tag, val) {
		this.writeTag(tag, PBF_FIXED64);
		this.writeSFixed64(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeVarintField(tag, val) {
		this.writeTag(tag, PBF_VARINT);
		this.writeVarint(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeSVarintField(tag, val) {
		this.writeTag(tag, PBF_VARINT);
		this.writeSVarint(val);
	}
	/**
	* @param {number} tag
	* @param {string} str
	*/
	writeStringField(tag, str) {
		this.writeTag(tag, PBF_BYTES);
		this.writeString(str);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeFloatField(tag, val) {
		this.writeTag(tag, PBF_FIXED32);
		this.writeFloat(val);
	}
	/**
	* @param {number} tag
	* @param {number} val
	*/
	writeDoubleField(tag, val) {
		this.writeTag(tag, PBF_FIXED64);
		this.writeDouble(val);
	}
	/**
	* @param {number} tag
	* @param {boolean} val
	*/
	writeBooleanField(tag, val) {
		this.writeVarintField(tag, +val);
	}
};
/**
* @param {number} l
* @param {boolean | undefined} s
* @param {Pbf} p
*/
function readVarintRemainder(l, s, p) {
	const buf = p.buf;
	let h, b;
	b = buf[p.pos++];
	h = (b & 112) >> 4;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 127) << 3;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 127) << 10;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 127) << 17;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 127) << 24;
	if (b < 128) return toNum(l, h, s);
	b = buf[p.pos++];
	h |= (b & 1) << 31;
	if (b < 128) return toNum(l, h, s);
	throw new Error("Expected varint not more than 10 bytes");
}
/**
* @param {number} low
* @param {number} high
* @param {boolean} [isSigned]
*/
function toNum(low, high, isSigned) {
	return isSigned ? high * 4294967296 + (low >>> 0) : (high >>> 0) * 4294967296 + (low >>> 0);
}
/**
* @param {number} val
* @param {Pbf} pbf
*/
function writeBigVarint(val, pbf) {
	let low, high;
	if (val >= 0) {
		low = val % 4294967296 | 0;
		high = val / 4294967296 | 0;
	} else {
		low = ~(-val % 4294967296);
		high = ~(-val / 4294967296);
		if (low ^ 4294967295) low = low + 1 | 0;
		else {
			low = 0;
			high = high + 1 | 0;
		}
	}
	if (val >= 0x10000000000000000 || val < -0x10000000000000000) throw new Error("Given varint doesn't fit into 10 bytes");
	pbf.realloc(10);
	writeBigVarintLow(low, high, pbf);
	writeBigVarintHigh(high, pbf);
}
/**
* @param {number} high
* @param {number} low
* @param {Pbf} pbf
*/
function writeBigVarintLow(low, high, pbf) {
	pbf.buf[pbf.pos++] = low & 127 | 128;
	low >>>= 7;
	pbf.buf[pbf.pos++] = low & 127 | 128;
	low >>>= 7;
	pbf.buf[pbf.pos++] = low & 127 | 128;
	low >>>= 7;
	pbf.buf[pbf.pos++] = low & 127 | 128;
	low >>>= 7;
	pbf.buf[pbf.pos] = low & 127;
}
/**
* @param {number} high
* @param {Pbf} pbf
*/
function writeBigVarintHigh(high, pbf) {
	const lsb = (high & 7) << 4;
	pbf.buf[pbf.pos++] |= lsb | ((high >>>= 3) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127 | ((high >>>= 7) ? 128 : 0);
	if (!high) return;
	pbf.buf[pbf.pos++] = high & 127;
}
/**
* @param {number} startPos
* @param {number} len
* @param {Pbf} pbf
*/
function makeRoomForExtraLength(startPos, len, pbf) {
	const extraLen = len <= 16383 ? 1 : len <= 2097151 ? 2 : len <= 268435455 ? 3 : Math.floor(Math.log(len) / (Math.LN2 * 7));
	pbf.realloc(extraLen);
	for (let i = pbf.pos - 1; i >= startPos; i--) pbf.buf[i + extraLen] = pbf.buf[i];
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedVarint(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeVarint(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedSVarint(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeSVarint(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedFloat(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeFloat(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedDouble(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeDouble(arr[i]);
}
/**
* @param {boolean[]} arr
* @param {Pbf} pbf
*/
function writePackedBoolean(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeBoolean(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedFixed32(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeFixed32(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedSFixed32(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeSFixed32(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedFixed64(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeFixed64(arr[i]);
}
/**
* @param {number[]} arr
* @param {Pbf} pbf
*/
function writePackedSFixed64(arr, pbf) {
	for (let i = 0; i < arr.length; i++) pbf.writeSFixed64(arr[i]);
}
/**
* @param {Uint8Array} buf
* @param {number} pos
* @param {number} end
*/
function readUtf8(buf, pos, end) {
	let str = "";
	let i = pos;
	while (i < end) {
		const b0 = buf[i];
		let c = null;
		let bytesPerSequence = b0 > 239 ? 4 : b0 > 223 ? 3 : b0 > 191 ? 2 : 1;
		if (i + bytesPerSequence > end) break;
		let b1, b2, b3;
		if (bytesPerSequence === 1) {
			if (b0 < 128) c = b0;
		} else if (bytesPerSequence === 2) {
			b1 = buf[i + 1];
			if ((b1 & 192) === 128) {
				c = (b0 & 31) << 6 | b1 & 63;
				if (c <= 127) c = null;
			}
		} else if (bytesPerSequence === 3) {
			b1 = buf[i + 1];
			b2 = buf[i + 2];
			if ((b1 & 192) === 128 && (b2 & 192) === 128) {
				c = (b0 & 15) << 12 | (b1 & 63) << 6 | b2 & 63;
				if (c <= 2047 || c >= 55296 && c <= 57343) c = null;
			}
		} else if (bytesPerSequence === 4) {
			b1 = buf[i + 1];
			b2 = buf[i + 2];
			b3 = buf[i + 3];
			if ((b1 & 192) === 128 && (b2 & 192) === 128 && (b3 & 192) === 128) {
				c = (b0 & 15) << 18 | (b1 & 63) << 12 | (b2 & 63) << 6 | b3 & 63;
				if (c <= 65535 || c >= 1114112) c = null;
			}
		}
		if (c === null) {
			c = 65533;
			bytesPerSequence = 1;
		} else if (c > 65535) {
			c -= 65536;
			str += String.fromCharCode(c >>> 10 & 1023 | 55296);
			c = 56320 | c & 1023;
		}
		str += String.fromCharCode(c);
		i += bytesPerSequence;
	}
	return str;
}
/**
* @param {Uint8Array} buf
* @param {string} str
* @param {number} pos
*/
function writeUtf8(buf, str, pos) {
	for (let i = 0, c, lead; i < str.length; i++) {
		c = str.charCodeAt(i);
		if (c > 55295 && c < 57344) if (lead) if (c < 56320) {
			buf[pos++] = 239;
			buf[pos++] = 191;
			buf[pos++] = 189;
			lead = c;
			continue;
		} else {
			c = lead - 55296 << 10 | c - 56320 | 65536;
			lead = null;
		}
		else {
			if (c > 56319 || i + 1 === str.length) {
				buf[pos++] = 239;
				buf[pos++] = 191;
				buf[pos++] = 189;
			} else lead = c;
			continue;
		}
		else if (lead) {
			buf[pos++] = 239;
			buf[pos++] = 191;
			buf[pos++] = 189;
			lead = null;
		}
		if (c < 128) buf[pos++] = c;
		else {
			if (c < 2048) buf[pos++] = c >> 6 | 192;
			else {
				if (c < 65536) buf[pos++] = c >> 12 | 224;
				else {
					buf[pos++] = c >> 18 | 240;
					buf[pos++] = c >> 12 & 63 | 128;
				}
				buf[pos++] = c >> 6 & 63 | 128;
			}
			buf[pos++] = c & 63 | 128;
		}
	}
	return pos;
}
//#endregion
//#region node_modules/ol/format/MVT.js
/**
* @module ol/format/MVT
*/
/**
* @template {import("../Feature.js").FeatureLike} [FeatureType=import("../render/Feature.js").default]
* @typedef {Object} Options
* @property {import('./Feature.js').FeatureToFeatureClass<FeatureType>} [featureClass] Class for features returned by
* {@link module:ol/format/MVT~MVT#readFeatures}. Set to {@link module:ol/Feature~Feature} to get full editing and geometry
* support at the cost of decreased rendering performance. The default is
* {@link module:ol/render/Feature~RenderFeature}, which is optimized for rendering and hit detection.
* @property {string} [geometryName='geometry'] Geometry name to use when creating features.
* @property {string} [layerName='layer'] Name of the feature attribute that holds the layer name.
* @property {Array<string>} [layers] Layers to read features from. If not provided, features will be read from all
* @property {string} [idProperty] Optional property that will be assigned as the feature id and removed from the properties.
* layers.
*/
/**
* @classdesc
* Feature format for reading data in the Mapbox MVT format.
*
* @template {import('../Feature.js').FeatureLike} [FeatureType=RenderFeature]
* @extends {FeatureFormat<FeatureType>}
* @api
*/
var MVT = class extends FeatureFormat {
	/**
	* @param {Options<FeatureType>} [options] Options.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @type {Projection}
		*/
		this.dataProjection = new Projection({
			code: "",
			units: "tile-pixels"
		});
		this.featureClass = options.featureClass ? options.featureClass : RenderFeature;
		/**
		* @private
		* @type {string|undefined}
		*/
		this.geometryName_ = options.geometryName;
		/**
		* @private
		* @type {string}
		*/
		this.layerName_ = options.layerName ? options.layerName : "layer";
		/**
		* @private
		* @type {Array<string>|null}
		*/
		this.layers_ = options.layers ? options.layers : null;
		/**
		* @private
		* @type {string}
		*/
		this.idProperty_ = options.idProperty;
		this.supportedMediaTypes = ["application/vnd.mapbox-vector-tile", "application/x-protobuf"];
	}
	/**
	* Read the raw geometry from the pbf offset stored in a raw feature's geometry
	* property.
	* @param {PBF} pbf PBF.
	* @param {Object} feature Raw feature.
	* @param {Array<number>} flatCoordinates Array to store flat coordinates in.
	* @param {Array<number>} ends Array to store ends in.
	* @private
	*/
	readRawGeometry_(pbf, feature, flatCoordinates, ends) {
		pbf.pos = feature.geometry;
		const end = pbf.readVarint() + pbf.pos;
		let cmd = 1;
		let length = 0;
		let x = 0;
		let y = 0;
		let coordsLen = 0;
		let currentEnd = 0;
		while (pbf.pos < end) {
			if (!length) {
				const cmdLen = pbf.readVarint();
				cmd = cmdLen & 7;
				length = cmdLen >> 3;
			}
			length--;
			if (cmd === 1 || cmd === 2) {
				x += pbf.readSVarint();
				y += pbf.readSVarint();
				if (cmd === 1) {
					if (coordsLen > currentEnd) {
						ends.push(coordsLen);
						currentEnd = coordsLen;
					}
				}
				flatCoordinates.push(x, y);
				coordsLen += 2;
			} else if (cmd === 7) {
				if (coordsLen > currentEnd) {
					flatCoordinates.push(flatCoordinates[currentEnd], flatCoordinates[currentEnd + 1]);
					coordsLen += 2;
				}
			} else throw new Error("Invalid command found in the PBF");
		}
		if (coordsLen > currentEnd) {
			ends.push(coordsLen);
			currentEnd = coordsLen;
		}
	}
	/**
	* @private
	* @param {PBF} pbf PBF
	* @param {Object} rawFeature Raw Mapbox feature.
	* @param {import("./Feature.js").ReadOptions} options Read options.
	* @return {FeatureType|null} Feature.
	*/
	createFeature_(pbf, rawFeature, options) {
		const type = rawFeature.type;
		if (type === 0) return null;
		let feature;
		const values = rawFeature.properties;
		let id;
		if (!this.idProperty_) id = rawFeature.id;
		else {
			id = values[this.idProperty_];
			delete values[this.idProperty_];
		}
		values[this.layerName_] = rawFeature.layer.name;
		const flatCoordinates = [];
		const ends = [];
		this.readRawGeometry_(pbf, rawFeature, flatCoordinates, ends);
		const geometryType = getGeometryType(type, ends.length);
		if (this.featureClass === RenderFeature) {
			feature = new this.featureClass(geometryType, flatCoordinates, ends, 2, values, id);
			feature.transform(options.dataProjection);
		} else {
			let geom;
			if (geometryType == "Polygon") {
				const endss = inflateEnds(flatCoordinates, ends);
				geom = endss.length > 1 ? new MultiPolygon(flatCoordinates, "XY", endss) : new Polygon(flatCoordinates, "XY", ends);
			} else geom = geometryType === "Point" ? new Point(flatCoordinates, "XY") : geometryType === "LineString" ? new LineString(flatCoordinates, "XY") : geometryType === "MultiPoint" ? new MultiPoint(flatCoordinates, "XY") : geometryType === "MultiLineString" ? new MultiLineString(flatCoordinates, "XY", ends) : null;
			const ctor = this.featureClass;
			feature = new ctor();
			if (this.geometryName_) feature.setGeometryName(this.geometryName_);
			const geometry = transformGeometryWithOptions(geom, false, options);
			feature.setGeometry(geometry);
			if (id !== void 0) feature.setId(id);
			feature.setProperties(values, true);
		}
		return feature;
	}
	/**
	* @return {import("./Feature.js").Type} Format.
	* @override
	*/
	getType() {
		return "arraybuffer";
	}
	/**
	* Read all features.
	*
	* @param {ArrayBuffer} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {Array<FeatureType>} Features.
	* @api
	* @override
	*/
	readFeatures(source, options) {
		const layers = this.layers_;
		options = this.adaptOptions(options);
		const dataProjection = get(options.dataProjection);
		dataProjection.setWorldExtent(options.extent);
		options.dataProjection = dataProjection;
		const pbf = new Pbf(source);
		const pbfLayers = pbf.readFields(layersPBFReader, {});
		const features = [];
		for (const name in pbfLayers) {
			if (layers && !layers.includes(name)) continue;
			const pbfLayer = pbfLayers[name];
			const extent = pbfLayer ? [
				0,
				0,
				pbfLayer.extent,
				pbfLayer.extent
			] : null;
			dataProjection.setExtent(extent);
			for (let i = 0, ii = pbfLayer.length; i < ii; ++i) {
				const rawFeature = readRawFeature(pbf, pbfLayer, i);
				const feature = this.createFeature_(pbf, rawFeature, options);
				if (feature !== null) features.push(feature);
			}
		}
		return features;
	}
	/**
	* Read the projection from the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @return {import("../proj/Projection.js").default} Projection.
	* @api
	* @override
	*/
	readProjection(source) {
		return this.dataProjection;
	}
	/**
	* Sets the layers that features will be read from.
	* @param {Array<string>} layers Layers.
	* @api
	*/
	setLayers(layers) {
		this.layers_ = layers;
	}
};
/**
* Reader callback for parsing layers.
* @param {number} tag The tag.
* @param {Object} layers The layers object.
* @param {PBF} pbf The PBF.
*/
function layersPBFReader(tag, layers, pbf) {
	if (tag === 3) {
		const layer = {
			keys: [],
			values: [],
			features: []
		};
		const end = pbf.readVarint() + pbf.pos;
		pbf.readFields(layerPBFReader, layer, end);
		layer.length = layer.features.length;
		if (layer.length) layers[layer.name] = layer;
	}
}
/**
* Reader callback for parsing layer.
* @param {number} tag The tag.
* @param {Object} layer The layer object.
* @param {PBF} pbf The PBF.
*/
function layerPBFReader(tag, layer, pbf) {
	if (tag === 15) layer.version = pbf.readVarint();
	else if (tag === 1) layer.name = pbf.readString();
	else if (tag === 5) layer.extent = pbf.readVarint();
	else if (tag === 2) layer.features.push(pbf.pos);
	else if (tag === 3) layer.keys.push(pbf.readString());
	else if (tag === 4) {
		let value = null;
		const end = pbf.readVarint() + pbf.pos;
		while (pbf.pos < end) {
			tag = pbf.readVarint() >> 3;
			value = tag === 1 ? pbf.readString() : tag === 2 ? pbf.readFloat() : tag === 3 ? pbf.readDouble() : tag === 4 ? pbf.readVarint64() : tag === 5 ? pbf.readVarint() : tag === 6 ? pbf.readSVarint() : tag === 7 ? pbf.readBoolean() : null;
		}
		layer.values.push(value);
	}
}
/**
* Reader callback for parsing feature.
* @param {number} tag The tag.
* @param {Object} feature The feature object.
* @param {PBF} pbf The PBF.
*/
function featurePBFReader(tag, feature, pbf) {
	if (tag == 1) feature.id = pbf.readVarint();
	else if (tag == 2) {
		const end = pbf.readVarint() + pbf.pos;
		while (pbf.pos < end) {
			const key = feature.layer.keys[pbf.readVarint()];
			const value = feature.layer.values[pbf.readVarint()];
			feature.properties[key] = value;
		}
	} else if (tag == 3) feature.type = pbf.readVarint();
	else if (tag == 4) feature.geometry = pbf.pos;
}
/**
* Read a raw feature from the pbf offset stored at index `i` in the raw layer.
* @param {PBF} pbf PBF.
* @param {Object} layer Raw layer.
* @param {number} i Index of the feature in the raw layer's `features` array.
* @return {Object} Raw feature.
*/
function readRawFeature(pbf, layer, i) {
	pbf.pos = layer.features[i];
	const end = pbf.readVarint() + pbf.pos;
	const feature = {
		layer,
		type: 0,
		properties: {}
	};
	pbf.readFields(featurePBFReader, feature, end);
	return feature;
}
/**
* @param {number} type The raw feature's geometry type
* @param {number} numEnds Number of ends of the flat coordinates of the
* geometry.
* @return {import("../render/Feature.js").Type} The geometry type.
*/
function getGeometryType(type, numEnds) {
	/** @type {import("../render/Feature.js").Type} */
	let geometryType;
	if (type === 1) geometryType = numEnds === 1 ? "Point" : "MultiPoint";
	else if (type === 2) geometryType = numEnds === 1 ? "LineString" : "MultiLineString";
	else if (type === 3) geometryType = "Polygon";
	return geometryType;
}
//#endregion
//#region node_modules/ol/format/XML.js
/**
* @module ol/format/XML
*/
/**
* @classdesc
* Generic format for reading non-feature XML data
*
* @abstract
*/
var XML = class {
	/**
	* Read the source document.
	*
	* @param {Document|Element|string} source The XML source.
	* @return {Object|null} An object representing the source.
	* @api
	*/
	read(source) {
		if (!source) return null;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readFromDocument(doc);
		}
		if (isDocument(source)) return this.readFromDocument(source);
		return this.readFromNode(source);
	}
	/**
	* @param {Document} doc Document.
	* @return {Object|null} Object
	*/
	readFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) return this.readFromNode(n);
		return null;
	}
	/**
	* @abstract
	* @param {Element} node Node.
	* @return {Object|null} Object
	*/
	readFromNode(node) {
		abstract();
	}
};
//#endregion
//#region node_modules/ol/format/xlink.js
/**
* @module ol/format/xlink
*/
/**
* @const
* @type {string}
*/
var NAMESPACE_URI = "http://www.w3.org/1999/xlink";
/**
* @param {Element} node Node.
* @return {string|null} href.
*/
function readHref(node) {
	return node.getAttributeNS(NAMESPACE_URI, "href");
}
//#endregion
//#region node_modules/ol/format/OWS.js
/**
* @module ol/format/OWS
*/
/**
* @const
* @type {Array<null|string>}
*/
var NAMESPACE_URIS$2 = [null, "http://www.opengis.net/ows/1.1"];
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var PARSERS$2 = makeStructureNS(NAMESPACE_URIS$2, {
	"ServiceIdentification": makeObjectPropertySetter(readServiceIdentification),
	"ServiceProvider": makeObjectPropertySetter(readServiceProvider),
	"OperationsMetadata": makeObjectPropertySetter(readOperationsMetadata)
});
var OWS = class extends XML {
	constructor() {
		super();
	}
	/**
	* @param {Element} node Node.
	* @return {Object|null} Object
	* @override
	*/
	readFromNode(node) {
		const owsObject = pushParseAndPop({}, PARSERS$2, node, []);
		return owsObject ? owsObject : null;
	}
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var ADDRESS_PARSERS = makeStructureNS(NAMESPACE_URIS$2, {
	"DeliveryPoint": makeObjectPropertySetter(readString),
	"City": makeObjectPropertySetter(readString),
	"AdministrativeArea": makeObjectPropertySetter(readString),
	"PostalCode": makeObjectPropertySetter(readString),
	"Country": makeObjectPropertySetter(readString),
	"ElectronicMailAddress": makeObjectPropertySetter(readString)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var ALLOWED_VALUES_PARSERS = makeStructureNS(NAMESPACE_URIS$2, { "Value": makeObjectPropertyPusher(readValue) });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var CONSTRAINT_PARSERS = makeStructureNS(NAMESPACE_URIS$2, { "AllowedValues": makeObjectPropertySetter(readAllowedValues) });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var CONTACT_INFO_PARSERS = makeStructureNS(NAMESPACE_URIS$2, {
	"Phone": makeObjectPropertySetter(readPhone),
	"Address": makeObjectPropertySetter(readAddress)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var DCP_PARSERS = makeStructureNS(NAMESPACE_URIS$2, { "HTTP": makeObjectPropertySetter(readHttp) });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var HTTP_PARSERS$1 = makeStructureNS(NAMESPACE_URIS$2, {
	"Get": makeObjectPropertyPusher(readGet),
	"Post": void 0
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var OPERATION_PARSERS = makeStructureNS(NAMESPACE_URIS$2, { "DCP": makeObjectPropertySetter(readDcp) });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var OPERATIONS_METADATA_PARSERS = makeStructureNS(NAMESPACE_URIS$2, { "Operation": readOperation });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var PHONE_PARSERS = makeStructureNS(NAMESPACE_URIS$2, {
	"Voice": makeObjectPropertySetter(readString),
	"Facsimile": makeObjectPropertySetter(readString)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var REQUEST_METHOD_PARSERS = makeStructureNS(NAMESPACE_URIS$2, { "Constraint": makeObjectPropertyPusher(readConstraint) });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var SERVICE_CONTACT_PARSERS = makeStructureNS(NAMESPACE_URIS$2, {
	"IndividualName": makeObjectPropertySetter(readString),
	"PositionName": makeObjectPropertySetter(readString),
	"ContactInfo": makeObjectPropertySetter(readContactInfo)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var SERVICE_IDENTIFICATION_PARSERS = makeStructureNS(NAMESPACE_URIS$2, {
	"Abstract": makeObjectPropertySetter(readString),
	"AccessConstraints": makeObjectPropertySetter(readString),
	"Fees": makeObjectPropertySetter(readString),
	"Title": makeObjectPropertySetter(readString),
	"ServiceTypeVersion": makeObjectPropertySetter(readString),
	"ServiceType": makeObjectPropertySetter(readString)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var SERVICE_PROVIDER_PARSERS = makeStructureNS(NAMESPACE_URIS$2, {
	"ProviderName": makeObjectPropertySetter(readString),
	"ProviderSite": makeObjectPropertySetter(readHref),
	"ServiceContact": makeObjectPropertySetter(readServiceContact)
});
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The address.
*/
function readAddress(node, objectStack) {
	return pushParseAndPop({}, ADDRESS_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The values.
*/
function readAllowedValues(node, objectStack) {
	return pushParseAndPop({}, ALLOWED_VALUES_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The constraint.
*/
function readConstraint(node, objectStack) {
	const name = node.getAttribute("name");
	if (!name) return;
	return pushParseAndPop({ "name": name }, CONSTRAINT_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The contact info.
*/
function readContactInfo(node, objectStack) {
	return pushParseAndPop({}, CONTACT_INFO_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The DCP.
*/
function readDcp(node, objectStack) {
	return pushParseAndPop({}, DCP_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The GET object.
*/
function readGet(node, objectStack) {
	const href = readHref(node);
	if (!href) return;
	return pushParseAndPop({ "href": href }, REQUEST_METHOD_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The HTTP object.
*/
function readHttp(node, objectStack) {
	return pushParseAndPop({}, HTTP_PARSERS$1, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The operation.
*/
function readOperation(node, objectStack) {
	const name = node.getAttribute("name");
	const value = pushParseAndPop({}, OPERATION_PARSERS, node, objectStack);
	if (!value) return;
	const object = objectStack[objectStack.length - 1];
	object[name] = value;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The operations metadata.
*/
function readOperationsMetadata(node, objectStack) {
	return pushParseAndPop({}, OPERATIONS_METADATA_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The phone.
*/
function readPhone(node, objectStack) {
	return pushParseAndPop({}, PHONE_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The service identification.
*/
function readServiceIdentification(node, objectStack) {
	return pushParseAndPop({}, SERVICE_IDENTIFICATION_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The service contact.
*/
function readServiceContact(node, objectStack) {
	return pushParseAndPop({}, SERVICE_CONTACT_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} The service provider.
*/
function readServiceProvider(node, objectStack) {
	return pushParseAndPop({}, SERVICE_PROVIDER_PARSERS, node, objectStack);
}
/**
* @param {Node} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {string|undefined} The value.
*/
function readValue(node, objectStack) {
	return readString(node);
}
//#endregion
//#region node_modules/ol/geom/flat/flip.js
/**
* @module ol/geom/flat/flip
*/
/**
* @param {Array<number>} flatCoordinates Flat coordinates.
* @param {number} offset Offset.
* @param {number} end End.
* @param {number} stride Stride.
* @param {Array<number>} [dest] Destination.
* @param {number} [destOffset] Destination offset.
* @return {Array<number>} Flat coordinates.
*/
function flipXY(flatCoordinates, offset, end, stride, dest, destOffset) {
	if (dest !== void 0) {
		dest = dest;
		destOffset = destOffset !== void 0 ? destOffset : 0;
	} else {
		dest = [];
		destOffset = 0;
	}
	let j = offset;
	while (j < end) {
		const x = flatCoordinates[j++];
		dest[destOffset++] = flatCoordinates[j++];
		dest[destOffset++] = x;
		for (let k = 2; k < stride; ++k) dest[destOffset++] = flatCoordinates[j++];
	}
	dest.length = destOffset;
	return dest;
}
//#endregion
//#region node_modules/ol/format/Polyline.js
/**
* @module ol/format/Polyline
*/
/**
* @typedef {Object} Options
* @property {number} [factor=1e5] The factor by which the coordinates values will be scaled.
* @property {import("../geom/Geometry.js").GeometryLayout} [geometryLayout='XY'] Layout of the
* feature geometries created by the format reader.
*/
/**
* @classdesc
* Feature format for reading and writing data in the Encoded
* Polyline Algorithm Format.
*
* When reading features, the coordinates are assumed to be in two dimensions
* and in [latitude, longitude] order.
*
* As Polyline sources contain a single feature,
* {@link module:ol/format/Polyline~Polyline#readFeatures} will return the
* feature in an array.
*
* @api
*/
var Polyline = class extends TextFeature {
	/**
	* @param {Options} [options] Optional configuration object.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @type {import("../proj/Projection.js").default}
		*/
		this.dataProjection = get("EPSG:4326");
		/**
		* @private
		* @type {number}
		*/
		this.factor_ = options.factor ? options.factor : 1e5;
		/**
		* @private
		* @type {import("../geom/Geometry.js").GeometryLayout}
		*/
		this.geometryLayout_ = options.geometryLayout ? options.geometryLayout : "XY";
	}
	/**
	* @protected
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../Feature.js").default} Feature.
	* @override
	*/
	readFeatureFromText(text, options) {
		return new Feature(this.readGeometryFromText(text, options));
	}
	/**
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {Array<Feature>} Features.
	* @override
	*/
	readFeaturesFromText(text, options) {
		return [this.readFeatureFromText(text, options)];
	}
	/**
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @override
	*/
	readGeometryFromText(text, options) {
		const stride = getStrideForLayout(this.geometryLayout_);
		const flatCoordinates = decodeDeltas(text, stride, this.factor_);
		flipXY(flatCoordinates, 0, flatCoordinates.length, stride, flatCoordinates);
		return transformGeometryWithOptions(new LineString(flatCoordinates, this.geometryLayout_), false, this.adaptOptions(options));
	}
	/**
	* @param {import("../Feature.js").default<LineString>} feature Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeFeatureText(feature, options) {
		const geometry = feature.getGeometry();
		if (geometry) return this.writeGeometryText(geometry, options);
		throw new Error("Expected `feature` to have a geometry");
	}
	/**
	* @param {Array<import("../Feature.js").default<LineString>>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeFeaturesText(features, options) {
		return this.writeFeatureText(features[0], options);
	}
	/**
	* @param {LineString} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeGeometryText(geometry, options) {
		geometry = transformGeometryWithOptions(geometry, true, this.adaptOptions(options));
		const flatCoordinates = geometry.getFlatCoordinates();
		const stride = geometry.getStride();
		flipXY(flatCoordinates, 0, flatCoordinates.length, stride, flatCoordinates);
		return encodeDeltas(flatCoordinates, stride, this.factor_);
	}
};
/**
* Encode a list of n-dimensional points and return an encoded string
*
* Attention: This function will modify the passed array!
*
* @param {Array<number>} numbers A list of n-dimensional points.
* @param {number} stride The number of dimension of the points in the list.
* @param {number} [factor] The factor by which the numbers will be
*     multiplied. The remaining decimal places will get rounded away.
*     Default is `1e5`.
* @return {string} The encoded string.
* @api
* @deprecated
*/
function encodeDeltas(numbers, stride, factor) {
	factor = factor ? factor : 1e5;
	const lastNumbers = new Array(stride).fill(0);
	for (let i = 0, ii = numbers.length; i < ii;) for (let d = 0; d < stride; ++d, ++i) {
		const value = numbers[i] * factor;
		const num = value < 0 ? Math.ceil(value - .5) : Math.round(value);
		const delta = num - lastNumbers[d];
		lastNumbers[d] = num;
		numbers[i] = delta;
	}
	return encodeSignedIntegers(numbers);
}
/**
* Decode a list of n-dimensional points from an encoded string
*
* @param {string} encoded An encoded string.
* @param {number} stride The number of dimension of the points in the
*     encoded string.
* @param {number} [factor] The factor by which the resulting numbers will
*     be divided. Default is `1e5`.
* @return {Array<number>} A list of n-dimensional points.
* @api
* @deprecated
*/
function decodeDeltas(encoded, stride, factor) {
	factor = factor ? factor : 1e5;
	/** @type {Array<number>} */
	const lastNumbers = new Array(stride).fill(0);
	const numbers = decodeSignedIntegers(encoded);
	for (let i = 0, ii = numbers.length; i < ii;) for (let d = 0; d < stride; ++d, ++i) {
		lastNumbers[d] += numbers[i];
		numbers[i] = lastNumbers[d] / factor;
	}
	return numbers;
}
/**
* Encode a list of signed integers and return an encoded string
*
* Attention: This function will modify the passed array!
*
* @param {Array<number>} numbers A list of signed integers.
* @return {string} The encoded string.
*/
function encodeSignedIntegers(numbers) {
	for (let i = 0, ii = numbers.length; i < ii; ++i) {
		const num = numbers[i];
		numbers[i] = num < 0 ? ~(num << 1) : num << 1;
	}
	return encodeUnsignedIntegers(numbers);
}
/**
* Decode a list of signed integers from an encoded string
*
* @param {string} encoded An encoded string.
* @return {Array<number>} A list of signed integers.
*/
function decodeSignedIntegers(encoded) {
	const numbers = decodeUnsignedIntegers(encoded);
	for (let i = 0, ii = numbers.length; i < ii; ++i) {
		const num = numbers[i];
		numbers[i] = num & 1 ? ~(num >> 1) : num >> 1;
	}
	return numbers;
}
/**
* Encode a list of unsigned integers and return an encoded string
*
* @param {Array<number>} numbers A list of unsigned integers.
* @return {string} The encoded string.
*/
function encodeUnsignedIntegers(numbers) {
	let encoded = "";
	for (let i = 0, ii = numbers.length; i < ii; ++i) encoded += encodeUnsignedInteger(numbers[i]);
	return encoded;
}
/**
* Decode a list of unsigned integers from an encoded string
*
* @param {string} encoded An encoded string.
* @return {Array<number>} A list of unsigned integers.
*/
function decodeUnsignedIntegers(encoded) {
	const numbers = [];
	let current = 0;
	let shift = 0;
	for (let i = 0, ii = encoded.length; i < ii; ++i) {
		const b = encoded.charCodeAt(i) - 63;
		current |= (b & 31) << shift;
		if (b < 32) {
			numbers.push(current);
			current = 0;
			shift = 0;
		} else shift += 5;
	}
	return numbers;
}
/**
* Encode one single unsigned integer and return an encoded string
*
* @param {number} num Unsigned integer that should be encoded.
* @return {string} The encoded string.
*/
function encodeUnsignedInteger(num) {
	let value, encoded = "";
	while (num >= 32) {
		value = (32 | num & 31) + 63;
		encoded += String.fromCharCode(value);
		num >>= 5;
	}
	value = num + 63;
	encoded += String.fromCharCode(value);
	return encoded;
}
//#endregion
//#region node_modules/ol/format/TopoJSON.js
/**
* @module ol/format/TopoJSON
*/
/**
* @typedef {import("topojson-specification").Topology} TopoJSONTopology
* @typedef {import("topojson-specification").GeometryCollection} TopoJSONGeometryCollection
* @typedef {import("topojson-specification").GeometryObject} TopoJSONGeometry
* @typedef {import("topojson-specification").Point} TopoJSONPoint
* @typedef {import("topojson-specification").MultiPoint} TopoJSONMultiPoint
* @typedef {import("topojson-specification").LineString} TopoJSONLineString
* @typedef {import("topojson-specification").MultiLineString} TopoJSONMultiLineString
* @typedef {import("topojson-specification").Polygon} TopoJSONPolygon
* @typedef {import("topojson-specification").MultiPolygon} TopoJSONMultiPolygon
*/
/**
* @typedef {Object} Options
* @property {import("../proj.js").ProjectionLike} [dataProjection='EPSG:4326'] Default data projection.
* @property {string} [layerName] Set the name of the TopoJSON topology
* `objects`'s children as feature property with the specified name. This means
* that when set to `'layer'`, a topology like
* ```
* {
*   "type": "Topology",
*   "objects": {
*     "example": {
*       "type": "GeometryCollection",
*       "geometries": []
*     }
*   }
* }
* ```
* will result in features that have a property `'layer'` set to `'example'`.
* When not set, no property will be added to features.
* @property {Array<string>} [layers] Names of the TopoJSON topology's
* `objects`'s children to read features from.  If not provided, features will
* be read from all children.
*/
/**
* @classdesc
* Feature format for reading data in the TopoJSON format.
*
* @api
*/
var TopoJSON = class extends JSONFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @private
		* @type {string|undefined}
		*/
		this.layerName_ = options.layerName;
		/**
		* @private
		* @type {?Array<string>}
		*/
		this.layers_ = options.layers ? options.layers : null;
		/**
		* @type {import("../proj/Projection.js").default}
		*/
		this.dataProjection = get(options.dataProjection ? options.dataProjection : "EPSG:4326");
	}
	/**
	* @param {Object} object Object.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {Array<Feature>} Features.
	* @override
	*/
	readFeaturesFromObject(object, options) {
		if (object.type == "Topology") {
			const topoJSONTopology = object;
			let transform, scale = null, translate = null;
			if (topoJSONTopology["transform"]) {
				transform = topoJSONTopology["transform"];
				scale = transform["scale"];
				translate = transform["translate"];
			}
			const arcs = topoJSONTopology["arcs"];
			if (transform) transformArcs(arcs, scale, translate);
			/** @type {Array<Feature>} */
			const features = [];
			const topoJSONFeatures = topoJSONTopology["objects"];
			const property = this.layerName_;
			let feature;
			for (const objectName in topoJSONFeatures) {
				if (this.layers_ && !this.layers_.includes(objectName)) continue;
				if (topoJSONFeatures[objectName].type === "GeometryCollection") {
					feature = topoJSONFeatures[objectName];
					features.push.apply(features, readFeaturesFromGeometryCollection(feature, arcs, scale, translate, property, objectName, options));
				} else {
					feature = topoJSONFeatures[objectName];
					features.push(readFeatureFromGeometry(feature, arcs, scale, translate, property, objectName, options));
				}
			}
			return features;
		}
		return [];
	}
	/**
	* @param {Object} object Object.
	* @protected
	* @return {import("../proj/Projection.js").default} Projection.
	* @override
	*/
	readProjectionFromObject(object) {
		return this.dataProjection;
	}
};
/**
* @const
* @type {Object<string, function(TopoJSONGeometry, Array, ...Array=): import("../geom/Geometry.js").default>}
*/
var GEOMETRY_READERS = {
	"Point": readPointGeometry,
	"LineString": readLineStringGeometry,
	"Polygon": readPolygonGeometry,
	"MultiPoint": readMultiPointGeometry,
	"MultiLineString": readMultiLineStringGeometry,
	"MultiPolygon": readMultiPolygonGeometry
};
/**
* Concatenate arcs into a coordinate array.
* @param {Array<number>} indices Indices of arcs to concatenate.  Negative
*     values indicate arcs need to be reversed.
* @param {Array<Array<import("../coordinate.js").Coordinate>>} arcs Array of arcs (already
*     transformed).
* @return {Array<import("../coordinate.js").Coordinate>} Coordinates array.
*/
function concatenateArcs(indices, arcs) {
	/** @type {Array<import("../coordinate.js").Coordinate>} */
	const coordinates = [];
	let index;
	for (let i = 0, ii = indices.length; i < ii; ++i) {
		index = indices[i];
		if (i > 0) coordinates.pop();
		if (index >= 0) {
			const arc = arcs[index];
			for (let j = 0, jj = arc.length; j < jj; ++j) coordinates.push(arc[j].slice(0));
		} else {
			const arc = arcs[~index];
			for (let j = arc.length - 1; j >= 0; --j) coordinates.push(arc[j].slice(0));
		}
	}
	return coordinates;
}
/**
* Create a point from a TopoJSON geometry object.
*
* @param {TopoJSONPoint} object TopoJSON object.
* @param {Array<number>} scale Scale for each dimension.
* @param {Array<number>} translate Translation for each dimension.
* @return {Point} Geometry.
*/
function readPointGeometry(object, scale, translate) {
	const coordinates = object["coordinates"];
	if (scale && translate) transformVertex(coordinates, scale, translate);
	return new Point(coordinates);
}
/**
* Create a multi-point from a TopoJSON geometry object.
*
* @param {TopoJSONMultiPoint} object TopoJSON object.
* @param {Array<number>} scale Scale for each dimension.
* @param {Array<number>} translate Translation for each dimension.
* @return {MultiPoint} Geometry.
*/
function readMultiPointGeometry(object, scale, translate) {
	const coordinates = object["coordinates"];
	if (scale && translate) for (let i = 0, ii = coordinates.length; i < ii; ++i) transformVertex(coordinates[i], scale, translate);
	return new MultiPoint(coordinates);
}
/**
* Create a linestring from a TopoJSON geometry object.
*
* @param {TopoJSONLineString} object TopoJSON object.
* @param {Array<Array<import("../coordinate.js").Coordinate>>} arcs Array of arcs.
* @return {LineString} Geometry.
*/
function readLineStringGeometry(object, arcs) {
	return new LineString(concatenateArcs(object["arcs"], arcs));
}
/**
* Create a multi-linestring from a TopoJSON geometry object.
*
* @param {TopoJSONMultiLineString} object TopoJSON object.
* @param {Array<Array<import("../coordinate.js").Coordinate>>} arcs Array of arcs.
* @return {MultiLineString} Geometry.
*/
function readMultiLineStringGeometry(object, arcs) {
	const coordinates = [];
	for (let i = 0, ii = object["arcs"].length; i < ii; ++i) coordinates[i] = concatenateArcs(object["arcs"][i], arcs);
	return new MultiLineString(coordinates);
}
/**
* Create a polygon from a TopoJSON geometry object.
*
* @param {TopoJSONPolygon} object TopoJSON object.
* @param {Array<Array<import("../coordinate.js").Coordinate>>} arcs Array of arcs.
* @return {Polygon} Geometry.
*/
function readPolygonGeometry(object, arcs) {
	const coordinates = [];
	for (let i = 0, ii = object["arcs"].length; i < ii; ++i) coordinates[i] = concatenateArcs(object["arcs"][i], arcs);
	return new Polygon(coordinates);
}
/**
* Create a multi-polygon from a TopoJSON geometry object.
*
* @param {TopoJSONMultiPolygon} object TopoJSON object.
* @param {Array<Array<import("../coordinate.js").Coordinate>>} arcs Array of arcs.
* @return {MultiPolygon} Geometry.
*/
function readMultiPolygonGeometry(object, arcs) {
	const coordinates = [];
	for (let i = 0, ii = object["arcs"].length; i < ii; ++i) {
		const polyArray = object["arcs"][i];
		const ringCoords = [];
		for (let j = 0, jj = polyArray.length; j < jj; ++j) ringCoords[j] = concatenateArcs(polyArray[j], arcs);
		coordinates[i] = ringCoords;
	}
	return new MultiPolygon(coordinates);
}
/**
* Create features from a TopoJSON GeometryCollection object.
*
* @param {TopoJSONGeometryCollection} collection TopoJSON Geometry
*     object.
* @param {Array<Array<import("../coordinate.js").Coordinate>>} arcs Array of arcs.
* @param {Array<number>} scale Scale for each dimension.
* @param {Array<number>} translate Translation for each dimension.
* @param {string|undefined} property Property to set the `GeometryCollection`'s parent
*     object to.
* @param {string} name Name of the `Topology`'s child object.
* @param {import("./Feature.js").ReadOptions} [options] Read options.
* @return {Array<Feature>} Array of features.
*/
function readFeaturesFromGeometryCollection(collection, arcs, scale, translate, property, name, options) {
	const geometries = collection["geometries"];
	const features = [];
	for (let i = 0, ii = geometries.length; i < ii; ++i) features[i] = readFeatureFromGeometry(geometries[i], arcs, scale, translate, property, name, options);
	return features;
}
/**
* Create a feature from a TopoJSON geometry object.
*
* @param {TopoJSONGeometry} object TopoJSON geometry object.
* @param {Array<Array<import("../coordinate.js").Coordinate>>} arcs Array of arcs.
* @param {Array<number>} scale Scale for each dimension.
* @param {Array<number>} translate Translation for each dimension.
* @param {string|undefined} property Property to set the `GeometryCollection`'s parent
*     object to.
* @param {string} name Name of the `Topology`'s child object.
* @param {import("./Feature.js").ReadOptions} [options] Read options.
* @return {Feature} Feature.
*/
function readFeatureFromGeometry(object, arcs, scale, translate, property, name, options) {
	let geometry = null;
	const type = object.type;
	if (type) {
		const geometryReader = GEOMETRY_READERS[type];
		if (type === "Point" || type === "MultiPoint") geometry = geometryReader(object, scale, translate);
		else geometry = geometryReader(object, arcs);
		geometry = transformGeometryWithOptions(geometry, false, options);
	}
	const feature = new Feature({ geometry });
	if (object.id !== void 0) feature.setId(object.id);
	let properties = object.properties;
	if (property) {
		if (!properties) properties = {};
		properties[property] = name;
	}
	if (properties) feature.setProperties(properties, true);
	return feature;
}
/**
* Apply a linear transform to array of arcs.  The provided array of arcs is
* modified in place.
*
* @param {Array<Array<import("../coordinate.js").Coordinate>>} arcs Array of arcs.
* @param {Array<number>} scale Scale for each dimension.
* @param {Array<number>} translate Translation for each dimension.
*/
function transformArcs(arcs, scale, translate) {
	for (let i = 0, ii = arcs.length; i < ii; ++i) transformArc(arcs[i], scale, translate);
}
/**
* Apply a linear transform to an arc.  The provided arc is modified in place.
*
* @param {Array<import("../coordinate.js").Coordinate>} arc Arc.
* @param {Array<number>} scale Scale for each dimension.
* @param {Array<number>} translate Translation for each dimension.
*/
function transformArc(arc, scale, translate) {
	let x = 0;
	let y = 0;
	for (let i = 0, ii = arc.length; i < ii; ++i) {
		const vertex = arc[i];
		x += vertex[0];
		y += vertex[1];
		vertex[0] = x;
		vertex[1] = y;
		transformVertex(vertex, scale, translate);
	}
}
/**
* Apply a linear transform to a vertex.  The provided vertex is modified in
* place.
*
* @param {import("../coordinate.js").Coordinate} vertex Vertex.
* @param {Array<number>} scale Scale for each dimension.
* @param {Array<number>} translate Translation for each dimension.
*/
function transformVertex(vertex, scale, translate) {
	vertex[0] = vertex[0] * scale[0] + translate[0];
	vertex[1] = vertex[1] * scale[1] + translate[1];
}
//#endregion
//#region node_modules/ol/format/GML32.js
/**
* @module ol/format/GML32
*/
/**
* @classdesc Feature format for reading and writing data in the GML format
*            version 3.2.1.
* @api
*/
var GML32 = class extends GML3 {
	/**
	* @param {import("./GMLBase.js").Options} [options] Optional configuration object.
	*/
	constructor(options) {
		options = options ? options : {};
		super(options);
		/**
		* @type {string}
		*/
		this.schemaLocation = options.schemaLocation ? options.schemaLocation : this.namespace + " http://schemas.opengis.net/gml/3.2.1/gml.xsd";
	}
	/**
	* @param {Node} node Node.
	* @param {import("../geom/Geometry.js").default|import("../extent.js").Extent} geometry Geometry.
	* @param {Array<*>} objectStack Node stack.
	* @override
	*/
	writeGeometryElement(node, geometry, objectStack) {
		const context = objectStack[objectStack.length - 1];
		objectStack[objectStack.length - 1] = Object.assign({
			multiCurve: true,
			multiSurface: true
		}, context);
		super.writeGeometryElement(node, geometry, objectStack);
	}
};
GML32.prototype.namespace = "http://www.opengis.net/gml/3.2";
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.GEOMETRY_FLAT_COORDINATES_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"pos": makeReplacer(GML3.prototype.readFlatPos),
	"posList": makeReplacer(GML3.prototype.readFlatPosList),
	"coordinates": makeReplacer(GML2.prototype.readFlatCoordinates)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.FLAT_LINEAR_RINGS_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"interior": GML3.prototype.interiorParser,
	"exterior": GML3.prototype.exteriorParser
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.GEOMETRY_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"Point": makeReplacer(GMLBase.prototype.readPoint),
	"MultiPoint": makeReplacer(GMLBase.prototype.readMultiPoint),
	"LineString": makeReplacer(GMLBase.prototype.readLineString),
	"MultiLineString": makeReplacer(GMLBase.prototype.readMultiLineString),
	"LinearRing": makeReplacer(GMLBase.prototype.readLinearRing),
	"Polygon": makeReplacer(GMLBase.prototype.readPolygon),
	"MultiPolygon": makeReplacer(GMLBase.prototype.readMultiPolygon),
	"Surface": makeReplacer(GML32.prototype.readSurface),
	"MultiSurface": makeReplacer(GML3.prototype.readMultiSurface),
	"Curve": makeReplacer(GML32.prototype.readCurve),
	"MultiCurve": makeReplacer(GML3.prototype.readMultiCurve),
	"Envelope": makeReplacer(GML32.prototype.readEnvelope)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTICURVE_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"curveMember": makeArrayPusher(GML3.prototype.curveMemberParser),
	"curveMembers": makeArrayPusher(GML3.prototype.curveMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTISURFACE_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"surfaceMember": makeArrayPusher(GML3.prototype.surfaceMemberParser),
	"surfaceMembers": makeArrayPusher(GML3.prototype.surfaceMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.CURVEMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"LineString": makeArrayPusher(GMLBase.prototype.readLineString),
	"Curve": makeArrayPusher(GML3.prototype.readCurve)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.SURFACEMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"Polygon": makeArrayPusher(GMLBase.prototype.readPolygon),
	"Surface": makeArrayPusher(GML3.prototype.readSurface)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.SURFACE_PARSERS = { "http://www.opengis.net/gml/3.2": { "patches": makeReplacer(GML3.prototype.readPatch) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.CURVE_PARSERS = { "http://www.opengis.net/gml/3.2": { "segments": makeReplacer(GML3.prototype.readSegment) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.ENVELOPE_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"lowerCorner": makeArrayPusher(GML3.prototype.readFlatPosList),
	"upperCorner": makeArrayPusher(GML3.prototype.readFlatPosList)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.PATCHES_PARSERS = { "http://www.opengis.net/gml/3.2": { "PolygonPatch": makeReplacer(GML3.prototype.readPolygonPatch) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.SEGMENTS_PARSERS = { "http://www.opengis.net/gml/3.2": { "LineStringSegment": makeArrayExtender(GML3.prototype.readLineStringSegment) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTIPOINT_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"pointMember": makeArrayPusher(GMLBase.prototype.pointMemberParser),
	"pointMembers": makeArrayPusher(GMLBase.prototype.pointMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTILINESTRING_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"lineStringMember": makeArrayPusher(GMLBase.prototype.lineStringMemberParser),
	"lineStringMembers": makeArrayPusher(GMLBase.prototype.lineStringMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.MULTIPOLYGON_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"polygonMember": makeArrayPusher(GMLBase.prototype.polygonMemberParser),
	"polygonMembers": makeArrayPusher(GMLBase.prototype.polygonMemberParser)
} };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.POINTMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": { "Point": makeArrayPusher(GMLBase.prototype.readFlatCoordinatesFromNode) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.LINESTRINGMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": { "LineString": makeArrayPusher(GMLBase.prototype.readLineString) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.POLYGONMEMBER_PARSERS = { "http://www.opengis.net/gml/3.2": { "Polygon": makeArrayPusher(GMLBase.prototype.readPolygon) } };
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
GML32.prototype.RING_PARSERS = { "http://www.opengis.net/gml/3.2": {
	"LinearRing": makeReplacer(GMLBase.prototype.readFlatLinearRing),
	"Ring": makeReplacer(GML32.prototype.readFlatCurveRing)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.RING_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"exterior": makeChildAppender(GML3.prototype.writeRing),
	"interior": makeChildAppender(GML3.prototype.writeRing)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.ENVELOPE_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"lowerCorner": makeChildAppender(writeStringTextNode),
	"upperCorner": makeChildAppender(writeStringTextNode)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.SURFACEORPOLYGONMEMBER_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"surfaceMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember),
	"polygonMember": makeChildAppender(GML3.prototype.writeSurfaceOrPolygonMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.POINTMEMBER_SERIALIZERS = { "http://www.opengis.net/gml/3.2": { "pointMember": makeChildAppender(GML3.prototype.writePointMember) } };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.LINESTRINGORCURVEMEMBER_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"lineStringMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember),
	"curveMember": makeChildAppender(GML3.prototype.writeLineStringOrCurveMember)
} };
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
GML32.prototype.GEOMETRY_SERIALIZERS = { "http://www.opengis.net/gml/3.2": {
	"Curve": makeChildAppender(GML3.prototype.writeCurveOrLineString),
	"MultiCurve": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
	"Point": makeChildAppender(GML32.prototype.writePoint),
	"MultiPoint": makeChildAppender(GML3.prototype.writeMultiPoint),
	"LineString": makeChildAppender(GML3.prototype.writeCurveOrLineString),
	"MultiLineString": makeChildAppender(GML3.prototype.writeMultiCurveOrLineString),
	"LinearRing": makeChildAppender(GML3.prototype.writeLinearRing),
	"Polygon": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
	"MultiPolygon": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
	"Surface": makeChildAppender(GML3.prototype.writeSurfaceOrPolygon),
	"MultiSurface": makeChildAppender(GML3.prototype.writeMultiSurfaceOrPolygon),
	"Envelope": makeChildAppender(GML3.prototype.writeEnvelope)
} };
//#endregion
//#region node_modules/ol/format/filter/Filter.js
/**
* @module ol/format/filter/Filter
*/
/**
* @classdesc
* Abstract class; normally only used for creating subclasses and not instantiated in apps.
* Base class for WFS GetFeature filters.
*
* @abstract
*/
var Filter = class {
	/**
	* @param {!string} tagName The XML tag name for this filter.
	*/
	constructor(tagName) {
		/**
		* @private
		* @type {!string}
		*/
		this.tagName_ = tagName;
	}
	/**
	* The XML tag name for a filter.
	* @return {!string} Name.
	*/
	getTagName() {
		return this.tagName_;
	}
};
//#endregion
//#region node_modules/ol/format/filter/LogicalNary.js
/**
* @module ol/format/filter/LogicalNary
*/
/**
* @classdesc
* Abstract class; normally only used for creating subclasses and not instantiated in apps.
* Base class for WFS GetFeature n-ary logical filters.
*
* @abstract
*/
var LogicalNary = class extends Filter {
	/**
	* @param {!string} tagName The XML tag name for this filter.
	* @param {Array<import("./Filter.js").default>} conditions Conditions.
	*/
	constructor(tagName, conditions) {
		super(tagName);
		/**
		* @type {Array<import("./Filter.js").default>}
		*/
		this.conditions = conditions;
		assert(this.conditions.length >= 2, "At least 2 conditions are required");
	}
};
//#endregion
//#region node_modules/ol/format/filter/And.js
/**
* @module ol/format/filter/And
*/
/**
* @classdesc
* Represents a logical `<And>` operator between two or more filter conditions.
*
* @abstract
*/
var And = class extends LogicalNary {
	/**
	* @param {...import("./Filter.js").default} conditions Conditions.
	*/
	constructor(conditions) {
		super("And", Array.prototype.slice.call(arguments));
	}
};
//#endregion
//#region node_modules/ol/format/filter/Bbox.js
/**
* @module ol/format/filter/Bbox
*/
/**
* @classdesc
* Represents a `<BBOX>` operator to test whether a geometry-valued property
* intersects a fixed bounding box
*
* @api
*/
var Bbox = class extends Filter {
	/**
	* @param {!string} geometryName Geometry name to use.
	* @param {!import("../../extent.js").Extent} extent Extent.
	* @param {string} [srsName] SRS name. No srsName attribute will be set
	* on geometries when this is not provided.
	*/
	constructor(geometryName, extent, srsName) {
		super("BBOX");
		/**
		* @type {!string}
		*/
		this.geometryName = geometryName;
		/**
		* @type {import("../../extent.js").Extent}
		*/
		this.extent = extent;
		if (extent.length !== 4) throw new Error("Expected an extent with four values ([minX, minY, maxX, maxY])");
		/**
		* @type {string|undefined}
		*/
		this.srsName = srsName;
	}
};
//#endregion
//#region node_modules/ol/format/filter.js
/**
* @module ol/format/filter
*/
/**
* Create a logical `<And>` operator between two or more filter conditions.
*
* @param {...import("./filter/Filter.js").default} conditions Filter conditions.
* @return {!And} `<And>` operator.
* @api
*/
function and(conditions) {
	const params = [null].concat(Array.prototype.slice.call(arguments));
	return new (Function.prototype.bind.apply(And, params))();
}
/**
* Create a `<BBOX>` operator to test whether a geometry-valued property
* intersects a fixed bounding box
*
* @param {!string} geometryName Geometry name to use.
* @param {!import("../extent.js").Extent} extent Extent.
* @param {string} [srsName] SRS name. No srsName attribute will be
*    set on geometries when this is not provided.
* @return {!Bbox} `<BBOX>` operator.
* @api
*/
function bbox(geometryName, extent, srsName) {
	return new Bbox(geometryName, extent, srsName);
}
//#endregion
//#region node_modules/ol/format/WFS.js
/**
* @module ol/format/WFS
*/
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var FEATURE_COLLECTION_PARSERS = {
	"http://www.opengis.net/gml": { "boundedBy": makeObjectPropertySetter(GMLBase.prototype.readExtentElement, "bounds") },
	"http://www.opengis.net/wfs/2.0": { "member": makeArrayPusher(GMLBase.prototype.readFeaturesInternal) }
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TRANSACTION_SUMMARY_PARSERS = {
	"http://www.opengis.net/wfs": {
		"totalInserted": makeObjectPropertySetter(readPositiveInteger),
		"totalUpdated": makeObjectPropertySetter(readPositiveInteger),
		"totalDeleted": makeObjectPropertySetter(readPositiveInteger)
	},
	"http://www.opengis.net/wfs/2.0": {
		"totalInserted": makeObjectPropertySetter(readPositiveInteger),
		"totalUpdated": makeObjectPropertySetter(readPositiveInteger),
		"totalDeleted": makeObjectPropertySetter(readPositiveInteger)
	}
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TRANSACTION_RESPONSE_PARSERS = {
	"http://www.opengis.net/wfs": {
		"TransactionSummary": makeObjectPropertySetter(readTransactionSummary, "transactionSummary"),
		"InsertResults": makeObjectPropertySetter(readInsertResults, "insertIds")
	},
	"http://www.opengis.net/wfs/2.0": {
		"TransactionSummary": makeObjectPropertySetter(readTransactionSummary, "transactionSummary"),
		"InsertResults": makeObjectPropertySetter(readInsertResults, "insertIds")
	}
};
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var QUERY_SERIALIZERS = {
	"http://www.opengis.net/wfs": { "PropertyName": makeChildAppender(writeStringTextNode) },
	"http://www.opengis.net/wfs/2.0": { "PropertyName": makeChildAppender(writeStringTextNode) }
};
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var TRANSACTION_SERIALIZERS = {
	"http://www.opengis.net/wfs": {
		"Insert": makeChildAppender(writeFeature),
		"Update": makeChildAppender(writeUpdate),
		"Delete": makeChildAppender(writeDelete),
		"Property": makeChildAppender(writeProperty),
		"Native": makeChildAppender(writeNative)
	},
	"http://www.opengis.net/wfs/2.0": {
		"Insert": makeChildAppender(writeFeature),
		"Update": makeChildAppender(writeUpdate),
		"Delete": makeChildAppender(writeDelete),
		"Property": makeChildAppender(writeProperty),
		"Native": makeChildAppender(writeNative)
	}
};
/**
* @typedef {Object} Options
* @property {Object<string, string>|string} [featureNS] The namespace URI used for features.
* @property {Array<string>|string} [featureType] The feature type to parse. Only used for read operations.
* @property {GMLBase} [gmlFormat] The GML format to use to parse the response.
* Default is `ol/format/GML2` for WFS 1.0.0, `ol/format/GML3` for WFS 1.1.0 and `ol/format/GML32` for WFS 2.0.0.
* @property {string} [schemaLocation] Optional schemaLocation to use for serialization, this will override the default.
* @property {string} [version='1.1.0'] WFS version to use. Can be either `1.0.0`, `1.1.0` or `2.0.0`.
*/
/**
* @typedef {Object} WriteGetFeatureOptions
* @property {string} featureNS The namespace URI used for features.
* @property {string} featurePrefix The prefix for the feature namespace.
* @property {Array<string|FeatureType>} featureTypes The feature type names or FeatureType objects to
* define a unique bbox filter per feature type name (in this case, options `bbox` and `geometryName` are
* ignored.).
* @property {string} [srsName] SRS name. No srsName attribute will be set on
* geometries when this is not provided.
* @property {string} [handle] Handle.
* @property {string} [outputFormat] Output format.
* @property {number} [maxFeatures] Maximum number of features to fetch.
* @property {string} [geometryName] Geometry name to use in a BBOX filter.
* @property {Array<string>} [propertyNames] Optional list of property names to serialize.
* @property {string} [viewParams] viewParams GeoServer vendor parameter.
* @property {number} [startIndex] Start index to use for WFS paging. This is a
* WFS 2.0 feature backported to WFS 1.1.0 by some Web Feature Services.
* @property {number} [count] Number of features to retrieve when paging. This is a
* WFS 2.0 feature backported to WFS 1.1.0 by some Web Feature Services. Please note that some
* Web Feature Services have repurposed `maxfeatures` instead.
* @property {import("../extent.js").Extent} [bbox] Extent to use for the BBOX filter. The `geometryName`
* option must be set.
* @property {import("./filter/Filter.js").default} [filter] Filter condition. See
* {@link module:ol/format/filter} for more information.
* @property {string} [resultType] Indicates what response should be returned,
* e.g. `hits` only includes the `numberOfFeatures` attribute in the response and no features.
*/
/**
* @typedef {Object} FeatureType
* @property {!string} name The feature type name.
* @property {!import("../extent.js").Extent} bbox Extent to use for the BBOX filter.
* @property {!string} geometryName Geometry name to use in the BBOX filter.
*/
/**
* @typedef {Object} WriteTransactionOptions
* @property {string} featureNS The namespace URI used for features.
* @property {string} featurePrefix The prefix for the feature namespace.
* @property {string} featureType The feature type name.
* @property {string} [srsName] SRS name. No srsName attribute will be set on
* geometries when this is not provided.
* @property {string} [handle] Handle.
* @property {boolean} [hasZ] Must be set to true if the transaction is for
* a 3D layer. This will allow the Z coordinate to be included in the transaction.
* @property {Array<Object>} nativeElements Native elements. Currently not supported.
* @property {import("./GMLBase.js").Options} [gmlOptions] GML options for the WFS transaction writer.
* @property {string} [version='1.1.0'] WFS version to use for the transaction. Can be either `1.0.0`, `1.1.0` or `2.0.0`.
*/
/**
* Number of features; bounds/extent.
* @typedef {Object} FeatureCollectionMetadata
* @property {number} numberOfFeatures NumberOfFeatures.
* @property {import("../extent.js").Extent} bounds Bounds.
*/
/**
* @typedef {Object} TransactionSummary
* @property {number} totalDeleted TotalDeleted.
* @property {number} totalInserted TotalInserted.
* @property {number} totalUpdated TotalUpdated.
*/
/**
* Total deleted; total inserted; total updated; array of insert ids.
* @typedef {Object} TransactionResponse
* @property {TransactionSummary} transactionSummary Transaction summary.
* @property {Array<string>} insertIds InsertIds.
*/
/**
* @type {string}
*/
var FEATURE_PREFIX = "feature";
/**
* @type {string}
*/
var XMLNS = "http://www.w3.org/2000/xmlns/";
/**
* @type {Object<string, string>}
*/
var OGCNS = {
	"2.0.0": "http://www.opengis.net/ogc/1.1",
	"1.1.0": "http://www.opengis.net/ogc",
	"1.0.0": "http://www.opengis.net/ogc"
};
/**
* @type {Object<string, string>}
*/
var WFSNS = {
	"2.0.0": "http://www.opengis.net/wfs/2.0",
	"1.1.0": "http://www.opengis.net/wfs",
	"1.0.0": "http://www.opengis.net/wfs"
};
/**
* @type {Object<string, string>}
*/
var FESNS = {
	"2.0.0": "http://www.opengis.net/fes/2.0",
	"1.1.0": "http://www.opengis.net/fes",
	"1.0.0": "http://www.opengis.net/fes"
};
/**
* @type {Object<string, string>}
*/
var SCHEMA_LOCATIONS = {
	"2.0.0": "http://www.opengis.net/wfs/2.0 http://schemas.opengis.net/wfs/2.0/wfs.xsd",
	"1.1.0": "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.1.0/wfs.xsd",
	"1.0.0": "http://www.opengis.net/wfs http://schemas.opengis.net/wfs/1.0.0/wfs.xsd"
};
/**
* @type {Object<string, object>}
*/
var GML_FORMATS = {
	"2.0.0": GML32,
	"1.1.0": GML3,
	"1.0.0": GML2
};
/**
* @const
* @type {string}
*/
var DEFAULT_VERSION = "1.1.0";
/**
* @classdesc
* Feature format for reading and writing data in the WFS format.
* By default, supports WFS version 1.1.0. You can pass a GML format
* as option to override the default.
* Also see {@link module:ol/format/GMLBase~GMLBase} which is used by this format.
*
* @api
*/
var WFS = class extends XMLFeature {
	/**
	* @param {Options} [options] Optional configuration object.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @private
		* @type {string}
		*/
		this.version_ = options.version ? options.version : DEFAULT_VERSION;
		/**
		* @private
		* @type {Array<string>|string|undefined}
		*/
		this.featureType_ = options.featureType;
		/**
		* @private
		* @type {Object<string, string>|string|undefined}
		*/
		this.featureNS_ = options.featureNS;
		/**
		* @private
		* @type {GMLBase}
		*/
		this.gmlFormat_ = options.gmlFormat ? options.gmlFormat : new GML_FORMATS[this.version_]();
		/**
		* @private
		* @type {string}
		*/
		this.schemaLocation_ = options.schemaLocation ? options.schemaLocation : SCHEMA_LOCATIONS[this.version_];
	}
	/**
	* @return {Array<string>|string|undefined} featureType
	*/
	getFeatureType() {
		return this.featureType_;
	}
	/**
	* @param {Array<string>|string|undefined} featureType Feature type(s) to parse.
	*/
	setFeatureType(featureType) {
		this.featureType_ = featureType;
	}
	/**
	* @protected
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @override
	*/
	readFeaturesFromNode(node, options) {
		/** @type {import("../xml.js").NodeStackItem} */
		const context = { node };
		Object.assign(context, {
			"featureType": this.featureType_,
			"featureNS": this.featureNS_
		});
		Object.assign(context, this.getReadOptions(node, options ? options : {}));
		const objectStack = [context];
		let featuresNS;
		if (this.version_ === "2.0.0") featuresNS = FEATURE_COLLECTION_PARSERS;
		else featuresNS = this.gmlFormat_.FEATURE_COLLECTION_PARSERS;
		let features = pushParseAndPop([], featuresNS, node, objectStack, this.gmlFormat_);
		if (!features) features = [];
		return features;
	}
	/**
	* Read transaction response of the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @return {TransactionResponse|undefined} Transaction response.
	* @api
	*/
	readTransactionResponse(source) {
		if (!source) return;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readTransactionResponseFromDocument(doc);
		}
		if (isDocument(source)) return this.readTransactionResponseFromDocument(source);
		return this.readTransactionResponseFromNode(source);
	}
	/**
	* Read feature collection metadata of the source.
	*
	* @param {Document|Element|Object|string} source Source.
	* @return {FeatureCollectionMetadata|undefined}
	*     FeatureCollection metadata.
	* @api
	*/
	readFeatureCollectionMetadata(source) {
		if (!source) return;
		if (typeof source === "string") {
			const doc = parse(source);
			return this.readFeatureCollectionMetadataFromDocument(doc);
		}
		if (isDocument(source)) return this.readFeatureCollectionMetadataFromDocument(source);
		return this.readFeatureCollectionMetadataFromNode(source);
	}
	/**
	* @param {Document} doc Document.
	* @return {FeatureCollectionMetadata|undefined}
	*     FeatureCollection metadata.
	*/
	readFeatureCollectionMetadataFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) return this.readFeatureCollectionMetadataFromNode(n);
	}
	/**
	* @param {Element} node Node.
	* @return {FeatureCollectionMetadata|undefined}
	*     FeatureCollection metadata.
	*/
	readFeatureCollectionMetadataFromNode(node) {
		const result = {};
		result["numberOfFeatures"] = readNonNegativeIntegerString(node.getAttribute("numberOfFeatures"));
		return pushParseAndPop(result, FEATURE_COLLECTION_PARSERS, node, [], this.gmlFormat_);
	}
	/**
	* @param {Document} doc Document.
	* @return {TransactionResponse|undefined} Transaction response.
	*/
	readTransactionResponseFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) return this.readTransactionResponseFromNode(n);
	}
	/**
	* @param {Element} node Node.
	* @return {TransactionResponse|undefined} Transaction response.
	*/
	readTransactionResponseFromNode(node) {
		return pushParseAndPop({}, TRANSACTION_RESPONSE_PARSERS, node, []);
	}
	/**
	* Encode format as WFS `GetFeature` and return the Node.
	*
	* @param {WriteGetFeatureOptions} options Options.
	* @return {Node} Result.
	* @api
	*/
	writeGetFeature(options) {
		const node = createElementNS(WFSNS[this.version_], "GetFeature");
		node.setAttribute("service", "WFS");
		node.setAttribute("version", this.version_);
		if (options.handle) node.setAttribute("handle", options.handle);
		if (options.outputFormat) node.setAttribute("outputFormat", options.outputFormat);
		if (options.maxFeatures !== void 0) node.setAttribute("maxFeatures", String(options.maxFeatures));
		if (options.resultType) node.setAttribute("resultType", options.resultType);
		if (options.startIndex !== void 0) node.setAttribute("startIndex", String(options.startIndex));
		if (options.count !== void 0) node.setAttribute("count", String(options.count));
		if (options.viewParams !== void 0) node.setAttribute("viewParams", options.viewParams);
		node.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", this.schemaLocation_);
		/** @type {import("../xml.js").NodeStackItem} */
		const context = { node };
		Object.assign(context, {
			"version": this.version_,
			"srsName": options.srsName,
			"featureNS": options.featureNS ? options.featureNS : this.featureNS_,
			"featurePrefix": options.featurePrefix,
			"propertyNames": options.propertyNames ? options.propertyNames : []
		});
		assert(Array.isArray(options.featureTypes), "`options.featureTypes` must be an Array");
		if (typeof options.featureTypes[0] === "string") {
			let filter = options.filter;
			if (options.bbox) {
				assert(options.geometryName, "`options.geometryName` must also be provided when `options.bbox` is set");
				filter = this.combineBboxAndFilter(options.geometryName, options.bbox, options.srsName, filter);
			}
			Object.assign(context, {
				"geometryName": options.geometryName,
				"filter": filter
			});
			writeGetFeature(node, options.featureTypes, [context]);
		} else options.featureTypes.forEach((featureType) => {
			const completeFilter = this.combineBboxAndFilter(featureType.geometryName, featureType.bbox, options.srsName, options.filter);
			Object.assign(context, {
				"geometryName": featureType.geometryName,
				"filter": completeFilter
			});
			writeGetFeature(node, [featureType.name], [context]);
		});
		return node;
	}
	/**
	* Create a bbox filter and combine it with another optional filter.
	*
	* @param {!string} geometryName Geometry name to use.
	* @param {!import("../extent.js").Extent} extent Extent.
	* @param {string} [srsName] SRS name. No srsName attribute will be
	*    set on geometries when this is not provided.
	* @param {import("./filter/Filter.js").default} [filter] Filter condition.
	* @return {import("./filter/Filter.js").default} The filter.
	*/
	combineBboxAndFilter(geometryName, extent, srsName, filter) {
		const bboxFilter = bbox(geometryName, extent, srsName);
		if (filter) return and(filter, bboxFilter);
		return bboxFilter;
	}
	/**
	* Encode format as WFS `Transaction` and return the Node.
	*
	* @param {Array<import("../Feature.js").default>} inserts The features to insert.
	* @param {Array<import("../Feature.js").default>} updates The features to update.
	* @param {Array<import("../Feature.js").default>} deletes The features to delete.
	* @param {WriteTransactionOptions} options Write options.
	* @return {Node} Result.
	* @api
	*/
	writeTransaction(inserts, updates, deletes, options) {
		const objectStack = [];
		const version = options.version ? options.version : this.version_;
		const node = createElementNS(WFSNS[version], "Transaction");
		node.setAttribute("service", "WFS");
		node.setAttribute("version", version);
		let baseObj;
		/** @type {import("../xml.js").NodeStackItem} */
		if (options) {
			baseObj = options.gmlOptions ? options.gmlOptions : {};
			if (options.handle) node.setAttribute("handle", options.handle);
		}
		node.setAttributeNS(XML_SCHEMA_INSTANCE_URI, "xsi:schemaLocation", SCHEMA_LOCATIONS[version]);
		const request = createTransactionRequest(node, baseObj, version, options);
		if (inserts) serializeTransactionRequest("Insert", inserts, objectStack, request);
		if (updates) serializeTransactionRequest("Update", updates, objectStack, request);
		if (deletes) serializeTransactionRequest("Delete", deletes, objectStack, request);
		if (options.nativeElements) serializeTransactionRequest("Native", options.nativeElements, objectStack, request);
		return node;
	}
	/**
	* @param {Document} doc Document.
	* @return {import("../proj/Projection.js").default} Projection.
	* @override
	*/
	readProjectionFromDocument(doc) {
		for (let n = doc.firstChild; n; n = n.nextSibling) if (n.nodeType == Node.ELEMENT_NODE) return this.readProjectionFromNode(n);
		return null;
	}
	/**
	* @param {Element} node Node.
	* @return {import("../proj/Projection.js").default} Projection.
	* @override
	*/
	readProjectionFromNode(node) {
		if (node.firstElementChild && node.firstElementChild.firstElementChild) {
			node = node.firstElementChild.firstElementChild;
			for (let n = node.firstElementChild; n; n = n.nextElementSibling) if (!(n.childNodes.length === 0 || n.childNodes.length === 1 && n.firstChild.nodeType === 3)) {
				const objectStack = [{}];
				this.gmlFormat_.readGeometryElement(n, objectStack);
				return get(objectStack.pop().srsName);
			}
		}
		return null;
	}
};
/**
* @param {Element} node Node.
* @param {*} baseObj Base object.
* @param {string} version Version.
* @param {WriteTransactionOptions} options Options.
* @return {Object} Request object.
*/
function createTransactionRequest(node, baseObj, version, options) {
	const featurePrefix = options.featurePrefix ? options.featurePrefix : FEATURE_PREFIX;
	let gmlVersion;
	if (version === "1.0.0") gmlVersion = 2;
	else if (version === "1.1.0") gmlVersion = 3;
	else if (version === "2.0.0") gmlVersion = 3.2;
	return Object.assign({ node }, {
		version,
		"featureNS": options.featureNS,
		"featureType": options.featureType,
		"featurePrefix": featurePrefix,
		"gmlVersion": gmlVersion,
		"hasZ": options.hasZ,
		"srsName": options.srsName
	}, baseObj);
}
/**
* @param {string} type Request type.
* @param {Array<import("../Feature.js").default>} features Features.
* @param {Array<*>} objectStack Object stack.
* @param {Element} request Transaction Request.
*/
function serializeTransactionRequest(type, features, objectStack, request) {
	pushSerializeAndPop(request, TRANSACTION_SERIALIZERS, makeSimpleNodeFactory(type), features, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Transaction Summary.
*/
function readTransactionSummary(node, objectStack) {
	return pushParseAndPop({}, TRANSACTION_SUMMARY_PARSERS, node, objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var OGC_FID_PARSERS = {
	"http://www.opengis.net/ogc": { "FeatureId": makeArrayPusher(function(node, objectStack) {
		return node.getAttribute("fid");
	}) },
	"http://www.opengis.net/ogc/1.1": { "FeatureId": makeArrayPusher(function(node, objectStack) {
		return node.getAttribute("fid");
	}) }
};
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
*/
function fidParser(node, objectStack) {
	parseNode(OGC_FID_PARSERS, node, objectStack);
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var INSERT_RESULTS_PARSERS = {
	"http://www.opengis.net/wfs": { "Feature": fidParser },
	"http://www.opengis.net/wfs/2.0": { "Feature": fidParser }
};
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Array<string>|undefined} Insert results.
*/
function readInsertResults(node, objectStack) {
	return pushParseAndPop([], INSERT_RESULTS_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {import("../Feature.js").default} feature Feature.
* @param {Array<*>} objectStack Node stack.
*/
function writeFeature(node, feature, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const featureType = context["featureType"];
	const featureNS = context["featureNS"];
	const gmlVersion = context["gmlVersion"];
	const child = createElementNS(featureNS, featureType);
	node.appendChild(child);
	if (gmlVersion === 2) GML2.prototype.writeFeatureElement(child, feature, objectStack);
	else if (gmlVersion === 3) GML3.prototype.writeFeatureElement(child, feature, objectStack);
	else GML32.prototype.writeFeatureElement(child, feature, objectStack);
}
/**
* @param {Node} node Node.
* @param {number|string} fid Feature identifier.
* @param {Array<*>} objectStack Node stack.
*/
function writeOgcFidFilter(node, fid, objectStack) {
	const ns = OGCNS[objectStack[objectStack.length - 1]["version"]];
	const filter = createElementNS(ns, "Filter");
	const child = createElementNS(ns, "FeatureId");
	filter.appendChild(child);
	child.setAttribute("fid", fid);
	node.appendChild(filter);
}
/**
* @param {string|undefined} featurePrefix The prefix of the feature.
* @param {string} featureType The type of the feature.
* @return {string} The value of the typeName property.
*/
function getTypeName(featurePrefix, featureType) {
	featurePrefix = featurePrefix ? featurePrefix : FEATURE_PREFIX;
	const prefix = featurePrefix + ":";
	if (featureType.startsWith(prefix)) return featureType;
	return prefix + featureType;
}
/**
* @param {Element} node Node.
* @param {import("../Feature.js").default} feature Feature.
* @param {Array<*>} objectStack Node stack.
*/
function writeDelete(node, feature, objectStack) {
	const context = objectStack[objectStack.length - 1];
	assert(feature.getId() !== void 0, "Features must have an id set");
	const featureType = context["featureType"];
	const featurePrefix = context["featurePrefix"];
	const featureNS = context["featureNS"];
	const typeName = getTypeName(featurePrefix, featureType);
	node.setAttribute("typeName", typeName);
	node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
	const fid = feature.getId();
	if (fid !== void 0) writeOgcFidFilter(node, fid, objectStack);
}
/**
* @param {Element} node Node.
* @param {import("../Feature.js").default} feature Feature.
* @param {Array<*>} objectStack Node stack.
*/
function writeUpdate(node, feature, objectStack) {
	const context = objectStack[objectStack.length - 1];
	assert(feature.getId() !== void 0, "Features must have an id set");
	const version = context["version"];
	const featureType = context["featureType"];
	const featurePrefix = context["featurePrefix"];
	const featureNS = context["featureNS"];
	const typeName = getTypeName(featurePrefix, featureType);
	const geometryName = feature.getGeometryName();
	node.setAttribute("typeName", typeName);
	node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
	const fid = feature.getId();
	if (fid !== void 0) {
		const keys = feature.getKeys();
		const values = [];
		for (let i = 0, ii = keys.length; i < ii; i++) {
			const value = feature.get(keys[i]);
			if (value !== void 0) {
				let name = keys[i];
				if (value && typeof value.getSimplifiedGeometry === "function") name = geometryName;
				values.push({
					name,
					value
				});
			}
		}
		pushSerializeAndPop({
			version,
			"gmlVersion": context["gmlVersion"],
			node,
			"hasZ": context["hasZ"],
			"srsName": context["srsName"]
		}, TRANSACTION_SERIALIZERS, makeSimpleNodeFactory("Property"), values, objectStack);
		writeOgcFidFilter(node, fid, objectStack);
	}
}
/**
* @param {Node} node Node.
* @param {Object} pair Property name and value.
* @param {Array<*>} objectStack Node stack.
*/
function writeProperty(node, pair, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const version = context["version"];
	const ns = WFSNS[version];
	const name = createElementNS(ns, version === "2.0.0" ? "ValueReference" : "Name");
	const gmlVersion = context["gmlVersion"];
	node.appendChild(name);
	writeStringTextNode(name, pair.name);
	if (pair.value !== void 0 && pair.value !== null) {
		const value = createElementNS(ns, "Value");
		node.appendChild(value);
		if (pair.value && typeof pair.value.getSimplifiedGeometry === "function") if (gmlVersion === 2) GML2.prototype.writeGeometryElement(value, pair.value, objectStack);
		else if (gmlVersion === 3) GML3.prototype.writeGeometryElement(value, pair.value, objectStack);
		else GML32.prototype.writeGeometryElement(value, pair.value, objectStack);
		else writeStringTextNode(value, pair.value);
	}
}
/**
* @param {Element} node Node.
* @param {{vendorId: string, safeToIgnore: boolean, value: string}} nativeElement The native element.
* @param {Array<*>} objectStack Node stack.
*/
function writeNative(node, nativeElement, objectStack) {
	if (nativeElement.vendorId) node.setAttribute("vendorId", nativeElement.vendorId);
	if (nativeElement.safeToIgnore !== void 0) node.setAttribute("safeToIgnore", String(nativeElement.safeToIgnore));
	if (nativeElement.value !== void 0) writeStringTextNode(node, nativeElement.value);
}
/**
* @type {Object<string, Object<string, import("../xml.js").Serializer>>}
*/
var GETFEATURE_SERIALIZERS = {
	"http://www.opengis.net/wfs": { "Query": makeChildAppender(writeQuery) },
	"http://www.opengis.net/wfs/2.0": { "Query": makeChildAppender(writeQuery) },
	"http://www.opengis.net/ogc": {
		"During": makeChildAppender(writeDuringFilter),
		"And": makeChildAppender(writeLogicalFilter),
		"Or": makeChildAppender(writeLogicalFilter),
		"Not": makeChildAppender(writeNotFilter),
		"BBOX": makeChildAppender(writeBboxFilter),
		"Contains": makeChildAppender(writeSpatialFilter),
		"Intersects": makeChildAppender(writeSpatialFilter),
		"Within": makeChildAppender(writeSpatialFilter),
		"DWithin": makeChildAppender(writeDWithinFilter),
		"PropertyIsEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsNotEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsLessThan": makeChildAppender(writeComparisonFilter),
		"PropertyIsLessThanOrEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsGreaterThan": makeChildAppender(writeComparisonFilter),
		"PropertyIsGreaterThanOrEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsNull": makeChildAppender(writeIsNullFilter),
		"PropertyIsBetween": makeChildAppender(writeIsBetweenFilter),
		"PropertyIsLike": makeChildAppender(writeIsLikeFilter)
	},
	"http://www.opengis.net/fes/2.0": {
		"During": makeChildAppender(writeDuringFilter),
		"And": makeChildAppender(writeLogicalFilter),
		"Or": makeChildAppender(writeLogicalFilter),
		"Not": makeChildAppender(writeNotFilter),
		"BBOX": makeChildAppender(writeBboxFilter),
		"Contains": makeChildAppender(writeSpatialFilter),
		"Disjoint": makeChildAppender(writeSpatialFilter),
		"Intersects": makeChildAppender(writeSpatialFilter),
		"ResourceId": makeChildAppender(writeResourceIdFilter),
		"Within": makeChildAppender(writeSpatialFilter),
		"DWithin": makeChildAppender(writeDWithinFilter),
		"PropertyIsEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsNotEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsLessThan": makeChildAppender(writeComparisonFilter),
		"PropertyIsLessThanOrEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsGreaterThan": makeChildAppender(writeComparisonFilter),
		"PropertyIsGreaterThanOrEqualTo": makeChildAppender(writeComparisonFilter),
		"PropertyIsNull": makeChildAppender(writeIsNullFilter),
		"PropertyIsBetween": makeChildAppender(writeIsBetweenFilter),
		"PropertyIsLike": makeChildAppender(writeIsLikeFilter)
	}
};
/**
* @param {Element} node Node.
* @param {string} featureType Feature type.
* @param {Array<*>} objectStack Node stack.
*/
function writeQuery(node, featureType, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const version = context["version"];
	const featurePrefix = context["featurePrefix"];
	const featureNS = context["featureNS"];
	const propertyNames = context["propertyNames"];
	const srsName = context["srsName"];
	let typeName;
	if (featurePrefix) typeName = getTypeName(featurePrefix, featureType);
	else typeName = featureType;
	let typeNameAttr;
	if (version === "2.0.0") typeNameAttr = "typeNames";
	else typeNameAttr = "typeName";
	node.setAttribute(typeNameAttr, typeName);
	if (srsName) node.setAttribute("srsName", srsName);
	if (featureNS) node.setAttributeNS(XMLNS, "xmlns:" + featurePrefix, featureNS);
	const item = Object.assign({}, context);
	item.node = node;
	pushSerializeAndPop(item, QUERY_SERIALIZERS, makeSimpleNodeFactory("PropertyName"), propertyNames, objectStack);
	const filter = context["filter"];
	if (filter) {
		const child = createElementNS(getFilterNS(version), "Filter");
		node.appendChild(child);
		writeFilterCondition(child, filter, objectStack);
	}
}
/**
* @param {Element} node Node.
* @param {import("./filter/Filter.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeFilterCondition(node, filter, objectStack) {
	const context = objectStack[objectStack.length - 1];
	/** @type {import("../xml.js").NodeStackItem} */
	const item = { node };
	Object.assign(item, { context });
	pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(filter.getTagName()), [filter], objectStack);
}
/**
* @param {Node} node Node.
* @param {import("./filter/Bbox.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeBboxFilter(node, filter, objectStack) {
	const parent = objectStack[objectStack.length - 1];
	const version = parent["context"]["version"];
	parent["srsName"] = filter.srsName;
	const format = GML_FORMATS[version];
	writePropertyName(version, node, filter.geometryName);
	format.prototype.writeGeometryElement(node, filter.extent, objectStack);
}
/**
* @param {Element} node Element.
* @param {import("./filter/ResourceId.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeResourceIdFilter(node, filter, objectStack) {
	node.setAttribute("rid", filter.rid);
}
/**
* @param {Node} node Node.
* @param {import("./filter/Spatial.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeSpatialFilter(node, filter, objectStack) {
	const parent = objectStack[objectStack.length - 1];
	const version = parent["context"]["version"];
	parent["srsName"] = filter.srsName;
	const format = GML_FORMATS[version];
	writePropertyName(version, node, filter.geometryName);
	format.prototype.writeGeometryElement(node, filter.geometry, objectStack);
}
/**
* @param {Node} node Node.
* @param {import("./filter/DWithin.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeDWithinFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	writeSpatialFilter(node, filter, objectStack);
	const distance = createElementNS(getFilterNS(version), "Distance");
	writeStringTextNode(distance, filter.distance.toString());
	if (version === "2.0.0") distance.setAttribute("uom", filter.unit);
	else distance.setAttribute("units", filter.unit);
	node.appendChild(distance);
}
/**
* @param {Node} node Node.
* @param {import("./filter/During.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeDuringFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	writeExpression(FESNS[version], "ValueReference", node, filter.propertyName);
	const timePeriod = createElementNS(GMLNS, "TimePeriod");
	node.appendChild(timePeriod);
	const begin = createElementNS(GMLNS, "begin");
	timePeriod.appendChild(begin);
	writeTimeInstant(begin, filter.begin);
	const end = createElementNS(GMLNS, "end");
	timePeriod.appendChild(end);
	writeTimeInstant(end, filter.end);
}
/**
* @param {Element} node Node.
* @param {import("./filter/LogicalNary.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeLogicalFilter(node, filter, objectStack) {
	const context = objectStack[objectStack.length - 1]["context"];
	/** @type {import("../xml.js").NodeStackItem} */
	const item = { node };
	Object.assign(item, { context });
	const conditions = filter.conditions;
	for (let i = 0, ii = conditions.length; i < ii; ++i) {
		const condition = conditions[i];
		pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(condition.getTagName()), [condition], objectStack);
	}
}
/**
* @param {Element} node Node.
* @param {import("./filter/Not.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeNotFilter(node, filter, objectStack) {
	const context = objectStack[objectStack.length - 1]["context"];
	/** @type {import("../xml.js").NodeStackItem} */
	const item = { node };
	Object.assign(item, { context });
	const condition = filter.condition;
	pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory(condition.getTagName()), [condition], objectStack);
}
/**
* @param {Element} node Node.
* @param {import("./filter/ComparisonBinary.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeComparisonFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	if (filter.matchCase !== void 0) node.setAttribute("matchCase", filter.matchCase.toString());
	writePropertyName(version, node, filter.propertyName);
	writeLiteral(version, node, "" + filter.expression);
}
/**
* @param {Node} node Node.
* @param {import("./filter/IsNull.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeIsNullFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	writePropertyName(version, node, filter.propertyName);
}
/**
* @param {Node} node Node.
* @param {import("./filter/IsBetween.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeIsBetweenFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	const ns = getFilterNS(version);
	writePropertyName(version, node, filter.propertyName);
	const lowerBoundary = createElementNS(ns, "LowerBoundary");
	node.appendChild(lowerBoundary);
	writeLiteral(version, lowerBoundary, "" + filter.lowerBoundary);
	const upperBoundary = createElementNS(ns, "UpperBoundary");
	node.appendChild(upperBoundary);
	writeLiteral(version, upperBoundary, "" + filter.upperBoundary);
}
/**
* @param {Element} node Node.
* @param {import("./filter/IsLike.js").default} filter Filter.
* @param {Array<*>} objectStack Node stack.
*/
function writeIsLikeFilter(node, filter, objectStack) {
	const version = objectStack[objectStack.length - 1]["context"]["version"];
	node.setAttribute("wildCard", filter.wildCard);
	node.setAttribute("singleChar", filter.singleChar);
	node.setAttribute("escapeChar", filter.escapeChar);
	if (filter.matchCase !== void 0) node.setAttribute("matchCase", filter.matchCase.toString());
	writePropertyName(version, node, filter.propertyName);
	writeLiteral(version, node, "" + filter.pattern);
}
/**
* @param {string} ns Namespace.
* @param {string} tagName Tag name.
* @param {Node} node Node.
* @param {string} value Value.
*/
function writeExpression(ns, tagName, node, value) {
	const property = createElementNS(ns, tagName);
	writeStringTextNode(property, value);
	node.appendChild(property);
}
/**
* @param {string} version Version.
* @param {Node} node Node.
* @param {string} value PropertyName value.
*/
function writeLiteral(version, node, value) {
	writeExpression(getFilterNS(version), "Literal", node, value);
}
/**
* @param {string} version Version.
* @param {Node} node Node.
* @param {string} value PropertyName value.
*/
function writePropertyName(version, node, value) {
	if (version === "2.0.0") writeExpression(FESNS[version], "ValueReference", node, value);
	else writeExpression(OGCNS[version], "PropertyName", node, value);
}
/**
* @param {Node} node Node.
* @param {string} time PropertyName value.
*/
function writeTimeInstant(node, time) {
	const timeInstant = createElementNS(GMLNS, "TimeInstant");
	node.appendChild(timeInstant);
	const timePosition = createElementNS(GMLNS, "timePosition");
	timeInstant.appendChild(timePosition);
	writeStringTextNode(timePosition, time);
}
/**
* @param {Element} node Node.
* @param {Array<string>} featureTypes Feature types.
* @param {Array<*>} objectStack Node stack.
*/
function writeGetFeature(node, featureTypes, objectStack) {
	const context = objectStack[objectStack.length - 1];
	const item = Object.assign({}, context);
	item.node = node;
	pushSerializeAndPop(item, GETFEATURE_SERIALIZERS, makeSimpleNodeFactory("Query"), featureTypes, objectStack);
}
function getFilterNS(version) {
	let ns;
	if (version === "2.0.0") ns = FESNS[version];
	else ns = OGCNS[version];
	return ns;
}
//#endregion
//#region node_modules/ol/format/WKB.js
/**
* @module ol/format/WKB
*/
/**
* @const
* @enum {number}
*/
var WKBGeometryType = {
	POINT: 1,
	LINE_STRING: 2,
	POLYGON: 3,
	MULTI_POINT: 4,
	MULTI_LINE_STRING: 5,
	MULTI_POLYGON: 6,
	GEOMETRY_COLLECTION: 7,
	POLYHEDRAL_SURFACE: 15,
	TIN: 16,
	TRIANGLE: 17
};
var WkbReader = class {
	/**
	* @param {DataView} view source to read
	*/
	constructor(view) {
		/** @private */
		this.view_ = view;
		/**
		* @type {number}
		* @private
		*/
		this.pos_ = 0;
		/**
		* @type {boolean}
		* @private
		*/
		this.initialized_ = false;
		/**
		* @type {boolean}
		* @private
		*/
		this.isLittleEndian_ = false;
		/**
		* @type {boolean}
		* @private
		*/
		this.hasZ_ = false;
		/**
		* @type {boolean}
		* @private
		*/
		this.hasM_ = false;
		/**
		* @type {number|null}
		* @private
		*/
		this.srid_ = null;
		/**
		* @type {import("../geom/Geometry.js").GeometryLayout}
		* @private
		*/
		this.layout_ = "XY";
	}
	/**
	* @return {number} value
	*/
	readUint8() {
		return this.view_.getUint8(this.pos_++);
	}
	/**
	* @param {boolean} [isLittleEndian] Whether read value as little endian
	* @return {number} value
	*/
	readUint32(isLittleEndian) {
		return this.view_.getUint32((this.pos_ += 4) - 4, isLittleEndian !== void 0 ? isLittleEndian : this.isLittleEndian_);
	}
	/**
	* @param {boolean} [isLittleEndian] Whether read value as little endian
	* @return {number} value
	*/
	readDouble(isLittleEndian) {
		return this.view_.getFloat64((this.pos_ += 8) - 8, isLittleEndian !== void 0 ? isLittleEndian : this.isLittleEndian_);
	}
	/**
	* @return {import('../coordinate.js').Coordinate} coords for Point
	*/
	readPoint() {
		/** @type {import('../coordinate.js').Coordinate} */
		const coords = [];
		coords.push(this.readDouble());
		coords.push(this.readDouble());
		if (this.hasZ_) coords.push(this.readDouble());
		if (this.hasM_) coords.push(this.readDouble());
		return coords;
	}
	/**
	* @return {Array<import('../coordinate.js').Coordinate>} coords for LineString / LinearRing
	*/
	readLineString() {
		const numPoints = this.readUint32();
		/** @type {Array<import('../coordinate.js').Coordinate>} */
		const coords = [];
		for (let i = 0; i < numPoints; i++) coords.push(this.readPoint());
		return coords;
	}
	/**
	* @return {Array<Array<import('../coordinate.js').Coordinate>>} coords for Polygon like
	*/
	readPolygon() {
		const numRings = this.readUint32();
		/** @type {Array<Array<import('../coordinate.js').Coordinate>>} */
		const rings = [];
		for (let i = 0; i < numRings; i++) rings.push(this.readLineString());
		return rings;
	}
	/**
	* @param {number} [expectedTypeId] Expected WKB Type ID
	* @return {number} WKB Type ID
	*/
	readWkbHeader(expectedTypeId) {
		const isLittleEndian = this.readUint8() > 0;
		const wkbType = this.readUint32(isLittleEndian);
		const wkbTypeThousandth = Math.floor((wkbType & 268435455) / 1e3);
		const hasZ = Boolean(wkbType & 2147483648) || wkbTypeThousandth === 1 || wkbTypeThousandth === 3;
		const hasM = Boolean(wkbType & 1073741824) || wkbTypeThousandth === 2 || wkbTypeThousandth === 3;
		const hasSRID = Boolean(wkbType & 536870912);
		const typeId = (wkbType & 268435455) % 1e3;
		const layout = [
			"XY",
			hasZ ? "Z" : "",
			hasM ? "M" : ""
		].join("");
		const srid = hasSRID ? this.readUint32(isLittleEndian) : null;
		if (expectedTypeId !== void 0 && expectedTypeId !== typeId) throw new Error("Unexpected WKB geometry type " + typeId);
		if (this.initialized_) {
			if (this.isLittleEndian_ !== isLittleEndian) throw new Error("Inconsistent endian");
			if (this.layout_ !== layout) throw new Error("Inconsistent geometry layout");
			if (srid && this.srid_ !== srid) throw new Error("Inconsistent coordinate system (SRID)");
		} else {
			this.isLittleEndian_ = isLittleEndian;
			this.hasZ_ = hasZ;
			this.hasM_ = hasM;
			this.layout_ = layout;
			this.srid_ = srid;
			this.initialized_ = true;
		}
		return typeId;
	}
	/**
	* @param {number} typeId WKB Type ID
	* @return {any} values read
	*/
	readWkbPayload(typeId) {
		switch (typeId) {
			case WKBGeometryType.POINT: return this.readPoint();
			case WKBGeometryType.LINE_STRING: return this.readLineString();
			case WKBGeometryType.POLYGON:
			case WKBGeometryType.TRIANGLE: return this.readPolygon();
			case WKBGeometryType.MULTI_POINT: return this.readMultiPoint();
			case WKBGeometryType.MULTI_LINE_STRING: return this.readMultiLineString();
			case WKBGeometryType.MULTI_POLYGON:
			case WKBGeometryType.POLYHEDRAL_SURFACE:
			case WKBGeometryType.TIN: return this.readMultiPolygon();
			case WKBGeometryType.GEOMETRY_COLLECTION: return this.readGeometryCollection();
			default: throw new Error("Unsupported WKB geometry type " + typeId + " is found");
		}
	}
	/**
	* @param {number} expectedTypeId Expected WKB Type ID
	* @return {any} values read
	*/
	readWkbBlock(expectedTypeId) {
		return this.readWkbPayload(this.readWkbHeader(expectedTypeId));
	}
	/**
	* @param {Function} reader reader function for each item
	* @param {number} [expectedTypeId] Expected WKB Type ID
	* @return {any} values read
	*/
	readWkbCollection(reader, expectedTypeId) {
		const num = this.readUint32();
		const items = [];
		for (let i = 0; i < num; i++) {
			const result = reader.call(this, expectedTypeId);
			if (result) items.push(result);
		}
		return items;
	}
	/**
	* @return {Array<import('../coordinate.js').Coordinate>} coords for MultiPoint
	*/
	readMultiPoint() {
		return this.readWkbCollection(this.readWkbBlock, WKBGeometryType.POINT);
	}
	/**
	* @return {Array<Array<import('../coordinate.js').Coordinate>>} coords for MultiLineString like
	*/
	readMultiLineString() {
		return this.readWkbCollection(this.readWkbBlock, WKBGeometryType.LINE_STRING);
	}
	/**
	* @return {Array<Array<Array<import('../coordinate.js').Coordinate>>>} coords for MultiPolygon like
	*/
	readMultiPolygon() {
		return this.readWkbCollection(this.readWkbBlock, WKBGeometryType.POLYGON);
	}
	/**
	* @return {Array<import('../geom/Geometry.js').default>} array of geometries
	*/
	readGeometryCollection() {
		return this.readWkbCollection(this.readGeometry);
	}
	/**
	* @return {import('../geom/Geometry.js').default} geometry
	*/
	readGeometry() {
		const typeId = this.readWkbHeader();
		const result = this.readWkbPayload(typeId);
		switch (typeId) {
			case WKBGeometryType.POINT: return new Point(result, this.layout_);
			case WKBGeometryType.LINE_STRING: return new LineString(result, this.layout_);
			case WKBGeometryType.POLYGON:
			case WKBGeometryType.TRIANGLE: return new Polygon(result, this.layout_);
			case WKBGeometryType.MULTI_POINT: return new MultiPoint(result, this.layout_);
			case WKBGeometryType.MULTI_LINE_STRING: return new MultiLineString(result, this.layout_);
			case WKBGeometryType.MULTI_POLYGON:
			case WKBGeometryType.POLYHEDRAL_SURFACE:
			case WKBGeometryType.TIN: return new MultiPolygon(result, this.layout_);
			case WKBGeometryType.GEOMETRY_COLLECTION: return new GeometryCollection(result);
			default: return null;
		}
	}
	/**
	* @return {number|null} SRID in the EWKB. `null` if not defined.
	*/
	getSrid() {
		return this.srid_;
	}
};
var WkbWriter = class {
	/**
	* @type {Object}
	* @property {string} [layout] geometryLayout
	* @property {boolean} [littleEndian=true] littleEndian
	* @property {boolean} [ewkb=true] Whether writes in EWKB format
	* @property {Object} [nodata] NoData value for each axes
	* @param {Object} opts options
	*/
	constructor(opts) {
		opts = opts || {};
		/** @type {string} */
		this.layout_ = opts.layout;
		this.isLittleEndian_ = opts.littleEndian !== false;
		this.isEWKB_ = opts.ewkb !== false;
		/** @type {Array<Array<number>>} */
		this.writeQueue_ = [];
		/**
		* @type {Object}
		* @property {number} X NoData value for X
		* @property {number} Y NoData value for Y
		* @property {number} Z NoData value for Z
		* @property {number} M NoData value for M
		*/
		this.nodata_ = Object.assign({
			X: 0,
			Y: 0,
			Z: 0,
			M: 0
		}, opts.nodata);
	}
	/**
	* @param {number} value value
	*/
	writeUint8(value) {
		this.writeQueue_.push([1, value]);
	}
	/**
	* @param {number} value value
	*/
	writeUint32(value) {
		this.writeQueue_.push([4, value]);
	}
	/**
	* @param {number} value value
	*/
	writeDouble(value) {
		this.writeQueue_.push([8, value]);
	}
	/**
	* @param {import('../coordinate.js').Coordinate} coords coords
	* @param {import("../geom/Geometry.js").GeometryLayout} layout layout
	*/
	writePoint(coords, layout) {
		/**
		* @type {Object}
		* @property {number} X NoData value for X
		* @property {number} Y NoData value for Y
		* @property {number} [Z] NoData value for Z
		* @property {number} [M] NoData value for M
		*/
		const coordsObj = Object.assign.apply(null, layout.split("").map((axis, idx) => ({ [axis]: coords[idx] })));
		for (const axis of this.layout_) this.writeDouble(axis in coordsObj ? coordsObj[axis] : this.nodata_[axis]);
	}
	/**
	* @param {Array<import('../coordinate.js').Coordinate>} coords coords
	* @param {import("../geom/Geometry.js").GeometryLayout} layout layout
	*/
	writeLineString(coords, layout) {
		this.writeUint32(coords.length);
		for (let i = 0; i < coords.length; i++) this.writePoint(coords[i], layout);
	}
	/**
	* @param {Array<Array<import('../coordinate.js').Coordinate>>} rings rings
	* @param {import("../geom/Geometry.js").GeometryLayout} layout layout
	*/
	writePolygon(rings, layout) {
		this.writeUint32(rings.length);
		for (let i = 0; i < rings.length; i++) this.writeLineString(rings[i], layout);
	}
	/**
	* @param {number} wkbType WKB Type ID
	* @param {number} [srid] SRID
	*/
	writeWkbHeader(wkbType, srid) {
		wkbType %= 1e3;
		if (this.layout_.includes("Z")) wkbType += this.isEWKB_ ? 2147483648 : 1e3;
		if (this.layout_.includes("M")) wkbType += this.isEWKB_ ? 1073741824 : 2e3;
		if (this.isEWKB_ && Number.isInteger(srid)) wkbType |= 536870912;
		this.writeUint8(this.isLittleEndian_ ? 1 : 0);
		this.writeUint32(wkbType);
		if (this.isEWKB_ && Number.isInteger(srid)) this.writeUint32(srid);
	}
	/**
	* @param {Array<import('../coordinate.js').Coordinate>} coords coords
	* @param {import("../geom/Geometry.js").GeometryLayout} layout layout
	*/
	writeMultiPoint(coords, layout) {
		this.writeUint32(coords.length);
		for (let i = 0; i < coords.length; i++) {
			this.writeWkbHeader(1);
			this.writePoint(coords[i], layout);
		}
	}
	/**
	* @param {Array<Array<import('../coordinate.js').Coordinate>>} coords coords
	* @param {import("../geom/Geometry.js").GeometryLayout} layout layout
	*/
	writeMultiLineString(coords, layout) {
		this.writeUint32(coords.length);
		for (let i = 0; i < coords.length; i++) {
			this.writeWkbHeader(2);
			this.writeLineString(coords[i], layout);
		}
	}
	/**
	* @param {Array<Array<Array<import('../coordinate.js').Coordinate>>>} coords coords
	* @param {import("../geom/Geometry.js").GeometryLayout} layout layout
	*/
	writeMultiPolygon(coords, layout) {
		this.writeUint32(coords.length);
		for (let i = 0; i < coords.length; i++) {
			this.writeWkbHeader(3);
			this.writePolygon(coords[i], layout);
		}
	}
	/**
	* @param {Array<import('../geom/Geometry.js').default>} geometries geometries
	*/
	writeGeometryCollection(geometries) {
		this.writeUint32(geometries.length);
		for (let i = 0; i < geometries.length; i++) this.writeGeometry(geometries[i]);
	}
	/**
	* @param {import("../geom/Geometry.js").default} geom geometry
	* @param {import("../geom/Geometry.js").GeometryLayout} [layout] layout
	* @return {import("../geom/Geometry.js").GeometryLayout} minimum layout made by common axes
	*/
	findMinimumLayout(geom, layout = "XYZM") {
		/**
		* @param {import("../geom/Geometry.js").GeometryLayout} a A
		* @param {import("../geom/Geometry.js").GeometryLayout} b B
		* @return {import("../geom/Geometry.js").GeometryLayout} minimum layout made by common axes
		*/
		const GeometryLayout_min = (a, b) => {
			if (a === b) return a;
			if (a === "XYZM") return b;
			if (b === "XYZM") return a;
			return "XY";
		};
		if (geom instanceof SimpleGeometry) return GeometryLayout_min(geom.getLayout(), layout);
		if (geom instanceof GeometryCollection) {
			const geoms = geom.getGeometriesArray();
			for (let i = 0; i < geoms.length && layout !== "XY"; i++) layout = this.findMinimumLayout(geoms[i], layout);
		}
		return layout;
	}
	/**
	* @param {import("../geom/Geometry.js").default} geom geometry
	* @param {number} [srid] SRID
	*/
	writeGeometry(geom, srid) {
		/**
		* @type {Object<import("../geom/Geometry.js").Type, WKBGeometryType>}
		*/
		const wkblut = {
			Point: WKBGeometryType.POINT,
			LineString: WKBGeometryType.LINE_STRING,
			Polygon: WKBGeometryType.POLYGON,
			MultiPoint: WKBGeometryType.MULTI_POINT,
			MultiLineString: WKBGeometryType.MULTI_LINE_STRING,
			MultiPolygon: WKBGeometryType.MULTI_POLYGON,
			GeometryCollection: WKBGeometryType.GEOMETRY_COLLECTION
		};
		const geomType = geom.getType();
		const typeId = wkblut[geomType];
		if (!typeId) throw new Error("GeometryType " + geomType + " is not supported");
		if (!this.layout_) this.layout_ = this.findMinimumLayout(geom);
		this.writeWkbHeader(typeId, srid);
		if (geom instanceof SimpleGeometry) ({
			Point: this.writePoint,
			LineString: this.writeLineString,
			Polygon: this.writePolygon,
			MultiPoint: this.writeMultiPoint,
			MultiLineString: this.writeMultiLineString,
			MultiPolygon: this.writeMultiPolygon
		})[geomType].call(this, geom.getCoordinates(), geom.getLayout());
		else if (geom instanceof GeometryCollection) this.writeGeometryCollection(geom.getGeometriesArray());
	}
	getBuffer() {
		const byteLength = this.writeQueue_.reduce((acc, item) => acc + item[0], 0);
		const buffer = new ArrayBuffer(byteLength);
		const view = new DataView(buffer);
		let pos = 0;
		this.writeQueue_.forEach((item) => {
			switch (item[0]) {
				case 1:
					view.setUint8(pos, item[1]);
					break;
				case 4:
					view.setUint32(pos, item[1], this.isLittleEndian_);
					break;
				case 8:
					view.setFloat64(pos, item[1], this.isLittleEndian_);
					break;
				default: break;
			}
			pos += item[0];
		});
		return buffer;
	}
};
/**
* @typedef {Object} Options
* @property {boolean} [splitCollection=false] Whether to split GeometryCollections into multiple features on reading.
* @property {boolean} [hex=true] Returns hex string instead of ArrayBuffer for output. This also is used as a hint internally whether it should load contents as text or ArrayBuffer on reading.
* @property {boolean} [littleEndian=true] Use littleEndian for output.
* @property {boolean} [ewkb=true] Use EWKB format for output.
* @property {import("../geom/Geometry.js").GeometryLayout} [geometryLayout=null] Use specific coordinate layout for output features (null: auto detect)
* @property {number} [nodataZ=0] If the `geometryLayout` doesn't match with geometry to be output, this value is used to fill missing coordinate value of Z.
* @property {number} [nodataM=0] If the `geometryLayout` doesn't match with geometry to be output, this value is used to fill missing coordinate value of M.
* @property {number|boolean} [srid=true] SRID for output. Specify integer value to enforce the value as a SRID. Specify `true` to extract from `dataProjection`. `false` to suppress the output. This option only takes effect when `ewkb` is `true`.
*/
/**
* @classdesc
* Geometry format for reading and writing data in the `Well-Known Binary` (WKB) format.
* Also supports `Extended Well-Known Binary` (EWKB) format, used in PostGIS for example.
*
* @api
*/
var WKB = class extends FeatureFormat {
	/**
	* @param {Options} [options] Optional configuration object.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		this.splitCollection = Boolean(options.splitCollection);
		this.viewCache_ = null;
		this.hex_ = options.hex !== false;
		this.littleEndian_ = options.littleEndian !== false;
		this.ewkb_ = options.ewkb !== false;
		this.layout_ = options.geometryLayout;
		this.nodataZ_ = options.nodataZ || 0;
		this.nodataM_ = options.nodataM || 0;
		this.srid_ = options.srid;
	}
	/**
	* @return {import("./Feature.js").Type} Format.
	* @override
	*/
	getType() {
		return this.hex_ ? "text" : "arraybuffer";
	}
	/**
	* Read a single feature from a source.
	*
	* @param {string|ArrayBuffer|ArrayBufferView} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../Feature.js").default} Feature.
	* @api
	* @override
	*/
	readFeature(source, options) {
		return new Feature({ geometry: this.readGeometry(source, options) });
	}
	/**
	* Read all features from a source.
	*
	* @param {string|ArrayBuffer|ArrayBufferView} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @api
	* @override
	*/
	readFeatures(source, options) {
		let geometries = [];
		const geometry = this.readGeometry(source, options);
		if (this.splitCollection && geometry instanceof GeometryCollection) geometries = geometry.getGeometriesArray();
		else geometries = [geometry];
		return geometries.map((geometry) => new Feature({ geometry }));
	}
	/**
	* Read a single geometry from a source.
	*
	* @param {string|ArrayBuffer|ArrayBufferView} source Source.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @api
	* @override
	*/
	readGeometry(source, options) {
		const view = getDataView(source);
		if (!view) return null;
		const geometry = new WkbReader(view).readGeometry();
		this.viewCache_ = view;
		options = this.getReadOptions(source, options);
		this.viewCache_ = null;
		return transformGeometryWithOptions(geometry, false, options);
	}
	/**
	* Read the projection from a source.
	*
	* @param {string|ArrayBuffer|ArrayBufferView} source Source.
	* @return {import("../proj/Projection.js").default|undefined} Projection.
	* @api
	* @override
	*/
	readProjection(source) {
		const view = this.viewCache_ || getDataView(source);
		if (!view) return;
		const reader = new WkbReader(view);
		reader.readWkbHeader();
		return reader.getSrid() && get("EPSG:" + reader.getSrid()) || void 0;
	}
	/**
	* Encode a feature in this format.
	*
	* @param {import("../Feature.js").default} feature Feature.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string|ArrayBuffer} Result.
	* @api
	* @override
	*/
	writeFeature(feature, options) {
		return this.writeGeometry(feature.getGeometry(), options);
	}
	/**
	* Encode an array of features in this format.
	*
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string|ArrayBuffer} Result.
	* @api
	* @override
	*/
	writeFeatures(features, options) {
		return this.writeGeometry(new GeometryCollection(features.map((f) => f.getGeometry())), options);
	}
	/**
	* Write a single geometry in this format.
	*
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @return {string|ArrayBuffer} Result.
	* @api
	* @override
	*/
	writeGeometry(geometry, options) {
		options = this.adaptOptions(options);
		const writer = new WkbWriter({
			layout: this.layout_,
			littleEndian: this.littleEndian_,
			ewkb: this.ewkb_,
			nodata: {
				Z: this.nodataZ_,
				M: this.nodataM_
			}
		});
		let srid = Number.isInteger(this.srid_) ? Number(this.srid_) : null;
		if (this.srid_ !== false && !Number.isInteger(this.srid_)) {
			const dataProjection = options.dataProjection && get(options.dataProjection);
			if (dataProjection) {
				const code = dataProjection.getCode();
				if (code.startsWith("EPSG:")) srid = Number(code.substring(5));
			}
		}
		writer.writeGeometry(transformGeometryWithOptions(geometry, true, options), srid);
		const buffer = writer.getBuffer();
		return this.hex_ ? encodeHexString(buffer) : buffer;
	}
};
/**
* @param {ArrayBuffer} buffer source buffer
* @return {string} encoded hex string
*/
function encodeHexString(buffer) {
	const view = new Uint8Array(buffer);
	return Array.from(view.values()).map((x) => (x < 16 ? "0" : "") + Number(x).toString(16).toUpperCase()).join("");
}
/**
* @param {string} text source text
* @return {DataView} decoded binary buffer
*/
function decodeHexString(text) {
	const buffer = new Uint8Array(text.length / 2);
	for (let i = 0; i < text.length / 2; i++) buffer[i] = parseInt(text.substr(i * 2, 2), 16);
	return new DataView(buffer.buffer);
}
/**
* @param {string | ArrayBuffer | ArrayBufferView} source source
* @return {DataView} data view
*/
function getDataView(source) {
	if (typeof source === "string") return decodeHexString(source);
	if (ArrayBuffer.isView(source)) {
		if (source instanceof DataView) return source;
		return new DataView(source.buffer, source.byteOffset, source.byteLength);
	}
	if (source instanceof ArrayBuffer) return new DataView(source);
	return null;
}
//#endregion
//#region node_modules/ol/format/WKT.js
/**
* @module ol/format/WKT
*/
/**
* Geometry constructors
* @enum {function (new:import("../geom/Geometry.js").default, Array, import("../geom/Geometry.js").GeometryLayout)}
*/
var GeometryConstructor = {
	"POINT": Point,
	"LINESTRING": LineString,
	"POLYGON": Polygon,
	"MULTIPOINT": MultiPoint,
	"MULTILINESTRING": MultiLineString,
	"MULTIPOLYGON": MultiPolygon
};
/**
* @typedef {Object} Options
* @property {boolean} [splitCollection=false] Whether to split GeometryCollections into
* multiple features on reading.
*/
/**
* @typedef {Object} Token
* @property {number} type Type.
* @property {number|string} [value] Value.
* @property {number} position Position.
*/
/**
* @const
* @type {string}
*/
var EMPTY = "EMPTY";
/**
* @const
* @type {string}
*/
var Z = "Z";
/**
* @const
* @type {string}
*/
var M = "M";
/**
* @const
* @type {string}
*/
var ZM = "ZM";
/**
* @const
* @enum {number}
*/
var TokenType = {
	START: 0,
	TEXT: 1,
	LEFT_PAREN: 2,
	RIGHT_PAREN: 3,
	NUMBER: 4,
	COMMA: 5,
	EOF: 6
};
/**
* @type {Object<import("../geom/Geometry.js").Type, string>}
*/
var wktTypeLookup = {
	Point: "POINT",
	LineString: "LINESTRING",
	Polygon: "POLYGON",
	MultiPoint: "MULTIPOINT",
	MultiLineString: "MULTILINESTRING",
	MultiPolygon: "MULTIPOLYGON",
	GeometryCollection: "GEOMETRYCOLLECTION",
	Circle: "CIRCLE"
};
/**
* Class to tokenize a WKT string.
*/
var Lexer = class {
	/**
	* @param {string} wkt WKT string.
	*/
	constructor(wkt) {
		/**
		* @type {string}
		*/
		this.wkt = wkt;
		/**
		* @type {number}
		* @private
		*/
		this.index_ = -1;
	}
	/**
	* @param {string} c Character.
	* @return {boolean} Whether the character is alphabetic.
	* @private
	*/
	isAlpha_(c) {
		return c >= "a" && c <= "z" || c >= "A" && c <= "Z";
	}
	/**
	* @param {string} c Character.
	* @param {boolean} [decimal] Whether the string number
	*     contains a dot, i.e. is a decimal number.
	* @return {boolean} Whether the character is numeric.
	* @private
	*/
	isNumeric_(c, decimal) {
		decimal = decimal !== void 0 ? decimal : false;
		return c >= "0" && c <= "9" || c == "." && !decimal;
	}
	/**
	* @param {string} c Character.
	* @return {boolean} Whether the character is whitespace.
	* @private
	*/
	isWhiteSpace_(c) {
		return c == " " || c == "	" || c == "\r" || c == "\n";
	}
	/**
	* @return {string} Next string character.
	* @private
	*/
	nextChar_() {
		return this.wkt.charAt(++this.index_);
	}
	/**
	* Fetch and return the next token.
	* @return {Token} Next string token.
	*/
	nextToken() {
		const c = this.nextChar_();
		const position = this.index_;
		/** @type {number|string} */
		let value = c;
		let type;
		if (c == "(") type = TokenType.LEFT_PAREN;
		else if (c == ",") type = TokenType.COMMA;
		else if (c == ")") type = TokenType.RIGHT_PAREN;
		else if (this.isNumeric_(c) || c == "-") {
			type = TokenType.NUMBER;
			value = this.readNumber_();
		} else if (this.isAlpha_(c)) {
			type = TokenType.TEXT;
			value = this.readText_();
		} else if (this.isWhiteSpace_(c)) return this.nextToken();
		else if (c === "") type = TokenType.EOF;
		else throw new Error("Unexpected character: " + c);
		return {
			position,
			value,
			type
		};
	}
	/**
	* @return {number} Numeric token value.
	* @private
	*/
	readNumber_() {
		let c;
		const index = this.index_;
		let decimal = false;
		let scientificNotation = false;
		do {
			if (c == ".") decimal = true;
			else if (c == "e" || c == "E") scientificNotation = true;
			c = this.nextChar_();
		} while (this.isNumeric_(c, decimal) || !scientificNotation && (c == "e" || c == "E") || scientificNotation && (c == "-" || c == "+"));
		return parseFloat(this.wkt.substring(index, this.index_--));
	}
	/**
	* @return {string} String token value.
	* @private
	*/
	readText_() {
		let c;
		const index = this.index_;
		do
			c = this.nextChar_();
		while (this.isAlpha_(c));
		return this.wkt.substring(index, this.index_--).toUpperCase();
	}
};
/**
* Class to parse the tokens from the WKT string.
*/
var Parser = class {
	/**
	* @param {Lexer} lexer The lexer.
	*/
	constructor(lexer) {
		/**
		* @type {Lexer}
		* @private
		*/
		this.lexer_ = lexer;
		/**
		* @type {Token}
		* @private
		*/
		this.token_ = {
			position: 0,
			type: TokenType.START
		};
		/**
		* @type {import("../geom/Geometry.js").GeometryLayout}
		* @private
		*/
		this.layout_ = "XY";
	}
	/**
	* Fetch the next token form the lexer and replace the active token.
	* @private
	*/
	consume_() {
		this.token_ = this.lexer_.nextToken();
	}
	/**
	* Tests if the given type matches the type of the current token.
	* @param {TokenType} type Token type.
	* @return {boolean} Whether the token matches the given type.
	*/
	isTokenType(type) {
		return this.token_.type == type;
	}
	/**
	* If the given type matches the current token, consume it.
	* @param {TokenType} type Token type.
	* @return {boolean} Whether the token matches the given type.
	*/
	match(type) {
		const isMatch = this.isTokenType(type);
		if (isMatch) this.consume_();
		return isMatch;
	}
	/**
	* Try to parse the tokens provided by the lexer.
	* @return {import("../geom/Geometry.js").default} The geometry.
	*/
	parse() {
		this.consume_();
		return this.parseGeometry_();
	}
	/**
	* Try to parse the dimensional info.
	* @return {import("../geom/Geometry.js").GeometryLayout} The layout.
	* @private
	*/
	parseGeometryLayout_() {
		/** @type {import("../geom/Geometry.js").GeometryLayout} */
		let layout = "XY";
		const dimToken = this.token_;
		if (this.isTokenType(TokenType.TEXT)) {
			const dimInfo = dimToken.value;
			if (dimInfo === Z) layout = "XYZ";
			else if (dimInfo === M) layout = "XYM";
			else if (dimInfo === ZM) layout = "XYZM";
			if (layout !== "XY") this.consume_();
		}
		return layout;
	}
	/**
	* @return {Array<import("../geom/Geometry.js").default>} A collection of geometries.
	* @private
	*/
	parseGeometryCollectionText_() {
		if (this.match(TokenType.LEFT_PAREN)) {
			const geometries = [];
			do
				geometries.push(this.parseGeometry_());
			while (this.match(TokenType.COMMA));
			if (this.match(TokenType.RIGHT_PAREN)) return geometries;
		}
		throw new Error(this.formatErrorMessage_());
	}
	/**
	* @return {Array<number>} All values in a point.
	* @private
	*/
	parsePointText_() {
		if (this.match(TokenType.LEFT_PAREN)) {
			const coordinates = this.parsePoint_();
			if (this.match(TokenType.RIGHT_PAREN)) return coordinates;
		}
		throw new Error(this.formatErrorMessage_());
	}
	/**
	* @return {Array<Array<number>>} All points in a linestring.
	* @private
	*/
	parseLineStringText_() {
		if (this.match(TokenType.LEFT_PAREN)) {
			const coordinates = this.parsePointList_();
			if (this.match(TokenType.RIGHT_PAREN)) return coordinates;
		}
		throw new Error(this.formatErrorMessage_());
	}
	/**
	* @return {Array<Array<Array<number>>>} All points in a polygon.
	* @private
	*/
	parsePolygonText_() {
		if (this.match(TokenType.LEFT_PAREN)) {
			const coordinates = this.parseLineStringTextList_();
			if (this.match(TokenType.RIGHT_PAREN)) return coordinates;
		}
		throw new Error(this.formatErrorMessage_());
	}
	/**
	* @return {Array<Array<number>>} All points in a multipoint.
	* @private
	*/
	parseMultiPointText_() {
		if (this.match(TokenType.LEFT_PAREN)) {
			let coordinates;
			if (this.token_.type == TokenType.LEFT_PAREN) coordinates = this.parsePointTextList_();
			else coordinates = this.parsePointList_();
			if (this.match(TokenType.RIGHT_PAREN)) return coordinates;
		}
		throw new Error(this.formatErrorMessage_());
	}
	/**
	* @return {Array<Array<Array<number>>>} All linestring points
	*                                          in a multilinestring.
	* @private
	*/
	parseMultiLineStringText_() {
		if (this.match(TokenType.LEFT_PAREN)) {
			const coordinates = this.parseLineStringTextList_();
			if (this.match(TokenType.RIGHT_PAREN)) return coordinates;
		}
		throw new Error(this.formatErrorMessage_());
	}
	/**
	* @return {Array<Array<Array<Array<number>>>>} All polygon points in a multipolygon.
	* @private
	*/
	parseMultiPolygonText_() {
		if (this.match(TokenType.LEFT_PAREN)) {
			const coordinates = this.parsePolygonTextList_();
			if (this.match(TokenType.RIGHT_PAREN)) return coordinates;
		}
		throw new Error(this.formatErrorMessage_());
	}
	/**
	* @return {Array<number>} A point.
	* @private
	*/
	parsePoint_() {
		const coordinates = [];
		const dimensions = this.layout_.length;
		for (let i = 0; i < dimensions; ++i) {
			const token = this.token_;
			if (this.match(TokenType.NUMBER)) coordinates.push(token.value);
			else break;
		}
		if (coordinates.length == dimensions) return coordinates;
		throw new Error(this.formatErrorMessage_());
	}
	/**
	* @return {Array<Array<number>>} An array of points.
	* @private
	*/
	parsePointList_() {
		const coordinates = [this.parsePoint_()];
		while (this.match(TokenType.COMMA)) coordinates.push(this.parsePoint_());
		return coordinates;
	}
	/**
	* @return {Array<Array<number>>} An array of points.
	* @private
	*/
	parsePointTextList_() {
		const coordinates = [this.parsePointText_()];
		while (this.match(TokenType.COMMA)) coordinates.push(this.parsePointText_());
		return coordinates;
	}
	/**
	* @return {Array<Array<Array<number>>>} An array of points.
	* @private
	*/
	parseLineStringTextList_() {
		const coordinates = [this.parseLineStringText_()];
		while (this.match(TokenType.COMMA)) coordinates.push(this.parseLineStringText_());
		return coordinates;
	}
	/**
	* @return {Array<Array<Array<Array<number>>>>} An array of points.
	* @private
	*/
	parsePolygonTextList_() {
		const coordinates = [this.parsePolygonText_()];
		while (this.match(TokenType.COMMA)) coordinates.push(this.parsePolygonText_());
		return coordinates;
	}
	/**
	* @return {boolean} Whether the token implies an empty geometry.
	* @private
	*/
	isEmptyGeometry_() {
		const isEmpty = this.isTokenType(TokenType.TEXT) && this.token_.value == EMPTY;
		if (isEmpty) this.consume_();
		return isEmpty;
	}
	/**
	* Create an error message for an unexpected token error.
	* @return {string} Error message.
	* @private
	*/
	formatErrorMessage_() {
		return "Unexpected `" + this.token_.value + "` at position " + this.token_.position + " in `" + this.lexer_.wkt + "`";
	}
	/**
	* @return {import("../geom/Geometry.js").default} The geometry.
	* @private
	*/
	parseGeometry_() {
		const token = this.token_;
		if (this.match(TokenType.TEXT)) {
			const geomType = token.value;
			this.layout_ = this.parseGeometryLayout_();
			const isEmpty = this.isEmptyGeometry_();
			if (geomType == "GEOMETRYCOLLECTION") {
				if (isEmpty) return new GeometryCollection([]);
				return new GeometryCollection(this.parseGeometryCollectionText_());
			}
			const ctor = GeometryConstructor[geomType];
			if (!ctor) throw new Error("Invalid geometry type: " + geomType);
			let coordinates;
			if (isEmpty) if (geomType == "POINT") coordinates = [NaN, NaN];
			else coordinates = [];
			else switch (geomType) {
				case "POINT":
					coordinates = this.parsePointText_();
					break;
				case "LINESTRING":
					coordinates = this.parseLineStringText_();
					break;
				case "POLYGON":
					coordinates = this.parsePolygonText_();
					break;
				case "MULTIPOINT":
					coordinates = this.parseMultiPointText_();
					break;
				case "MULTILINESTRING":
					coordinates = this.parseMultiLineStringText_();
					break;
				case "MULTIPOLYGON":
					coordinates = this.parseMultiPolygonText_();
					break;
				default: break;
			}
			return new ctor(coordinates, this.layout_);
		}
		throw new Error(this.formatErrorMessage_());
	}
};
/**
* @classdesc
* Geometry format for reading and writing data in the `WellKnownText` (WKT)
* format.
*
* @api
*/
var WKT = class extends TextFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* Split GeometryCollection into multiple features.
		* @type {boolean}
		* @private
		*/
		this.splitCollection_ = options.splitCollection !== void 0 ? options.splitCollection : false;
	}
	/**
	* Parse a WKT string.
	* @param {string} wkt WKT string.
	* @return {import("../geom/Geometry.js").default}
	*     The geometry created.
	* @private
	*/
	parse_(wkt) {
		return new Parser(new Lexer(wkt)).parse();
	}
	/**
	* @protected
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @return {import("../Feature.js").default} Feature.
	* @override
	*/
	readFeatureFromText(text, options) {
		const geom = this.readGeometryFromText(text, options);
		const feature = new Feature();
		feature.setGeometry(geom);
		return feature;
	}
	/**
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {Array<Feature>} Features.
	* @override
	*/
	readFeaturesFromText(text, options) {
		let geometries = [];
		const geometry = this.readGeometryFromText(text, options);
		if (this.splitCollection_ && geometry.getType() == "GeometryCollection") geometries = geometry.getGeometriesArray();
		else geometries = [geometry];
		const features = [];
		for (let i = 0, ii = geometries.length; i < ii; ++i) {
			const feature = new Feature();
			feature.setGeometry(geometries[i]);
			features.push(feature);
		}
		return features;
	}
	/**
	* @param {string} text Text.
	* @param {import("./Feature.js").ReadOptions} [options] Read options.
	* @protected
	* @return {import("../geom/Geometry.js").default} Geometry.
	* @override
	*/
	readGeometryFromText(text, options) {
		return transformGeometryWithOptions(this.parse_(text), false, options);
	}
	/**
	* @param {import("../Feature.js").default} feature Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeFeatureText(feature, options) {
		const geometry = feature.getGeometry();
		if (geometry) return this.writeGeometryText(geometry, options);
		return "";
	}
	/**
	* @param {Array<import("../Feature.js").default>} features Features.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeFeaturesText(features, options) {
		if (features.length == 1) return this.writeFeatureText(features[0], options);
		const geometries = [];
		for (let i = 0, ii = features.length; i < ii; ++i) geometries.push(features[i].getGeometry());
		const collection = new GeometryCollection(geometries);
		return this.writeGeometryText(collection, options);
	}
	/**
	* @param {import("../geom/Geometry.js").default} geometry Geometry.
	* @param {import("./Feature.js").WriteOptions} [options] Write options.
	* @protected
	* @return {string} Text.
	* @override
	*/
	writeGeometryText(geometry, options) {
		return encode(transformGeometryWithOptions(geometry, true, options));
	}
};
/**
* @param {Point} geom Point geometry.
* @return {string} Coordinates part of Point as WKT.
*/
function encodePointGeometry(geom) {
	const coordinates = geom.getCoordinates();
	if (coordinates.length === 0) return "";
	return coordinates.join(" ");
}
/**
* @param {MultiPoint} geom MultiPoint geometry.
* @return {string} Coordinates part of MultiPoint as WKT.
*/
function encodeMultiPointGeometry(geom) {
	const array = [];
	const components = geom.getPoints();
	for (let i = 0, ii = components.length; i < ii; ++i) array.push("(" + encodePointGeometry(components[i]) + ")");
	return array.join(",");
}
/**
* @param {GeometryCollection} geom GeometryCollection geometry.
* @return {string} Coordinates part of GeometryCollection as WKT.
*/
function encodeGeometryCollectionGeometry(geom) {
	const array = [];
	const geoms = geom.getGeometries();
	for (let i = 0, ii = geoms.length; i < ii; ++i) array.push(encode(geoms[i]));
	return array.join(",");
}
/**
* @param {LineString|import("../geom/LinearRing.js").default} geom LineString geometry.
* @return {string} Coordinates part of LineString as WKT.
*/
function encodeLineStringGeometry(geom) {
	const coordinates = geom.getCoordinates();
	const array = [];
	for (let i = 0, ii = coordinates.length; i < ii; ++i) array.push(coordinates[i].join(" "));
	return array.join(",");
}
/**
* @param {MultiLineString} geom MultiLineString geometry.
* @return {string} Coordinates part of MultiLineString as WKT.
*/
function encodeMultiLineStringGeometry(geom) {
	const array = [];
	const components = geom.getLineStrings();
	for (let i = 0, ii = components.length; i < ii; ++i) array.push("(" + encodeLineStringGeometry(components[i]) + ")");
	return array.join(",");
}
/**
* @param {Polygon} geom Polygon geometry.
* @return {string} Coordinates part of Polygon as WKT.
*/
function encodePolygonGeometry(geom) {
	const array = [];
	const rings = geom.getLinearRings();
	for (let i = 0, ii = rings.length; i < ii; ++i) array.push("(" + encodeLineStringGeometry(rings[i]) + ")");
	return array.join(",");
}
/**
* @param {MultiPolygon} geom MultiPolygon geometry.
* @return {string} Coordinates part of MultiPolygon as WKT.
*/
function encodeMultiPolygonGeometry(geom) {
	const array = [];
	const components = geom.getPolygons();
	for (let i = 0, ii = components.length; i < ii; ++i) array.push("(" + encodePolygonGeometry(components[i]) + ")");
	return array.join(",");
}
/**
* @param {import("../geom/SimpleGeometry.js").default} geom SimpleGeometry geometry.
* @return {string} Potential dimensional information for WKT type.
*/
function encodeGeometryLayout(geom) {
	const layout = geom.getLayout();
	let dimInfo = "";
	if (layout === "XYZ" || layout === "XYZM") dimInfo += Z;
	if (layout === "XYM" || layout === "XYZM") dimInfo += M;
	return dimInfo;
}
/**
* @const
* @type {Object<string, function(import("../geom/Geometry.js").default): string>}
*/
var GeometryEncoder = {
	"Point": encodePointGeometry,
	"LineString": encodeLineStringGeometry,
	"Polygon": encodePolygonGeometry,
	"MultiPoint": encodeMultiPointGeometry,
	"MultiLineString": encodeMultiLineStringGeometry,
	"MultiPolygon": encodeMultiPolygonGeometry,
	"GeometryCollection": encodeGeometryCollectionGeometry
};
/**
* Encode a geometry as WKT.
* @param {import("../geom/Geometry.js").default} geom The geometry to encode.
* @return {string} WKT string for the geometry.
*/
function encode(geom) {
	const type = geom.getType();
	const geometryEncoder = GeometryEncoder[type];
	const enc = geometryEncoder(geom);
	let wktType = wktTypeLookup[type];
	if (typeof geom.getFlatCoordinates === "function") {
		const dimInfo = encodeGeometryLayout(geom);
		if (dimInfo.length > 0) wktType += " " + dimInfo;
	}
	if (enc.length === 0) return wktType + " EMPTY";
	return wktType + "(" + enc + ")";
}
//#endregion
//#region node_modules/ol/format/WMSCapabilities.js
/**
* @module ol/format/WMSCapabilities
*/
/**
* @const
* @type {Array<null|string>}
*/
var NAMESPACE_URIS$1 = [
	null,
	"http://www.opengis.net/wms",
	"http://www.opengis.net/sld"
];
function isV13(objectStack) {
	return compareVersions(objectStack[0].version, "1.3") >= 0;
}
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var PARSERS$1 = makeStructureNS(NAMESPACE_URIS$1, {
	"Service": makeObjectPropertySetter(readService),
	"Capability": makeObjectPropertySetter(readCapability)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var CAPABILITY_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"Request": makeObjectPropertySetter(readRequest),
	"Exception": makeObjectPropertySetter(readException),
	"Layer": makeObjectPropertySetter(readCapabilityLayer),
	"UserDefinedSymbolization": makeObjectPropertySetter(readUserDefinedSymbolization)
});
/**
* @typedef {Object} RootObject
* @property {string} version Version
* @property {boolean} v13 Whether version is 1.3 or higher
*/
/**
* @classdesc
* Format for reading WMS capabilities data
*
* @api
*/
var WMSCapabilities = class extends XML {
	constructor() {
		super();
		/**
		* @type {string|undefined}
		*/
		this.version = void 0;
	}
	/**
	* @param {Element} node Node.
	* @return {Object|null} Object
	* @override
	*/
	readFromNode(node) {
		this.version = node.getAttribute("version").trim();
		const wmsCapabilityObject = pushParseAndPop({ "version": this.version }, PARSERS$1, node, []);
		return wmsCapabilityObject ? wmsCapabilityObject : null;
	}
};
var COMMON_SERVICE_PARSERS = {
	"Name": makeObjectPropertySetter(readString),
	"Title": makeObjectPropertySetter(readString),
	"Abstract": makeObjectPropertySetter(readString),
	"KeywordList": makeObjectPropertySetter(readKeywordList),
	"OnlineResource": makeObjectPropertySetter(readHref),
	"ContactInformation": makeObjectPropertySetter(readContactInformation),
	"Fees": makeObjectPropertySetter(readString),
	"AccessConstraints": makeObjectPropertySetter(readString)
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var SERVICE_PARSERS = makeStructureNS(NAMESPACE_URIS$1, COMMON_SERVICE_PARSERS);
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var SERVICE_PARSERS_V13 = makeStructureNS(NAMESPACE_URIS$1, {
	...COMMON_SERVICE_PARSERS,
	"LayerLimit": makeObjectPropertySetter(readPositiveInteger),
	"MaxWidth": makeObjectPropertySetter(readPositiveInteger),
	"MaxHeight": makeObjectPropertySetter(readPositiveInteger)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var CONTACT_INFORMATION_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"ContactPersonPrimary": makeObjectPropertySetter(readContactPersonPrimary),
	"ContactPosition": makeObjectPropertySetter(readString),
	"ContactAddress": makeObjectPropertySetter(readContactAddress),
	"ContactVoiceTelephone": makeObjectPropertySetter(readString),
	"ContactFacsimileTelephone": makeObjectPropertySetter(readString),
	"ContactElectronicMailAddress": makeObjectPropertySetter(readString)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var CONTACT_PERSON_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"ContactPerson": makeObjectPropertySetter(readString),
	"ContactOrganization": makeObjectPropertySetter(readString)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var CONTACT_ADDRESS_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"AddressType": makeObjectPropertySetter(readString),
	"Address": makeObjectPropertySetter(readString),
	"City": makeObjectPropertySetter(readString),
	"StateOrProvince": makeObjectPropertySetter(readString),
	"PostCode": makeObjectPropertySetter(readString),
	"Country": makeObjectPropertySetter(readString)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var EXCEPTION_PARSERS = makeStructureNS(NAMESPACE_URIS$1, { "Format": makeArrayPusher(readString) });
var COMMON_LAYER_PARSERS = {
	"Name": makeObjectPropertySetter(readString),
	"Title": makeObjectPropertySetter(readString),
	"Abstract": makeObjectPropertySetter(readString),
	"KeywordList": makeObjectPropertySetter(readKeywordList),
	"BoundingBox": makeObjectPropertyPusher(readBoundingBox$1),
	"Dimension": makeObjectPropertyPusher(readDimension),
	"Attribution": makeObjectPropertySetter(readAttribution),
	"AuthorityURL": makeObjectPropertyPusher(readAuthorityURL),
	"Identifier": makeObjectPropertyPusher(readString),
	"MetadataURL": makeObjectPropertyPusher(readMetadataURL),
	"DataURL": makeObjectPropertyPusher(readFormatOnlineresource),
	"FeatureListURL": makeObjectPropertyPusher(readFormatOnlineresource),
	"Style": makeObjectPropertyPusher(readStyle$1),
	"Layer": makeObjectPropertyPusher(readLayer$1)
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LAYER_PARSERS$1 = makeStructureNS(NAMESPACE_URIS$1, {
	...COMMON_LAYER_PARSERS,
	"SRS": makeObjectPropertyPusher(readString),
	"Extent": makeObjectPropertySetter(readExtent),
	"ScaleHint": makeObjectPropertyPusher(readScaleHint),
	"LatLonBoundingBox": makeObjectPropertySetter((node, objectStack) => readBoundingBox$1(node, objectStack, false)),
	"Layer": makeObjectPropertyPusher(readLayer$1)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LAYER_PARSERS_V13 = makeStructureNS(NAMESPACE_URIS$1, {
	...COMMON_LAYER_PARSERS,
	"CRS": makeObjectPropertyPusher(readString),
	"EX_GeographicBoundingBox": makeObjectPropertySetter(readEXGeographicBoundingBox),
	"MinScaleDenominator": makeObjectPropertySetter(readDecimal),
	"MaxScaleDenominator": makeObjectPropertySetter(readDecimal),
	"Layer": makeObjectPropertyPusher(readLayer$1)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var ATTRIBUTION_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"Title": makeObjectPropertySetter(readString),
	"OnlineResource": makeObjectPropertySetter(readHref),
	"LogoURL": makeObjectPropertySetter(readSizedFormatOnlineresource)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var EX_GEOGRAPHIC_BOUNDING_BOX_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"westBoundLongitude": makeObjectPropertySetter(readDecimal),
	"eastBoundLongitude": makeObjectPropertySetter(readDecimal),
	"southBoundLatitude": makeObjectPropertySetter(readDecimal),
	"northBoundLatitude": makeObjectPropertySetter(readDecimal)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var REQUEST_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"GetCapabilities": makeObjectPropertySetter(readOperationType),
	"GetMap": makeObjectPropertySetter(readOperationType),
	"GetFeatureInfo": makeObjectPropertySetter(readOperationType),
	"DescribeLayer": makeObjectPropertySetter(readOperationType),
	"GetLegendGraphic": makeObjectPropertySetter(readOperationType)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var OPERATIONTYPE_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"Format": makeObjectPropertyPusher(readString),
	"DCPType": makeObjectPropertyPusher(readDCPType)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var DCPTYPE_PARSERS = makeStructureNS(NAMESPACE_URIS$1, { "HTTP": makeObjectPropertySetter(readHTTP) });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var HTTP_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"Get": makeObjectPropertySetter(readFormatOnlineresource),
	"Post": makeObjectPropertySetter(readFormatOnlineresource)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var STYLE_PARSERS$1 = makeStructureNS(NAMESPACE_URIS$1, {
	"Name": makeObjectPropertySetter(readString),
	"Title": makeObjectPropertySetter(readString),
	"Abstract": makeObjectPropertySetter(readString),
	"LegendURL": makeObjectPropertyPusher(readSizedFormatOnlineresource),
	"StyleSheetURL": makeObjectPropertySetter(readFormatOnlineresource),
	"StyleURL": makeObjectPropertySetter(readFormatOnlineresource)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var FORMAT_ONLINERESOURCE_PARSERS = makeStructureNS(NAMESPACE_URIS$1, {
	"Format": makeObjectPropertySetter(readString),
	"OnlineResource": makeObjectPropertySetter(readHref)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var KEYWORDLIST_PARSERS = makeStructureNS(NAMESPACE_URIS$1, { "Keyword": makeArrayPusher(readString) });
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Attribution object.
*/
function readAttribution(node, objectStack) {
	return pushParseAndPop({}, ATTRIBUTION_PARSERS, node, objectStack);
}
function readUserDefinedSymbolization(node, objectStack) {
	return {
		"SupportSLD": !!readBooleanString(node.getAttribute("SupportSLD")),
		"UserLayer": !!readBooleanString(node.getAttribute("UserLayer")),
		"UserStyle": !!readBooleanString(node.getAttribute("UserStyle")),
		"RemoteWFS": !!readBooleanString(node.getAttribute("RemoteWFS")),
		"InlineFeatureData": !!readBooleanString(node.getAttribute("InlineFeatureData")),
		"RemoteWCS": !!readBooleanString(node.getAttribute("RemoteWCS"))
	};
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @param {boolean} withCrs Whether to include the CRS attribute.
* @return {Object} Bounding box object.
*/
function readBoundingBox$1(node, objectStack, withCrs = true) {
	const result = {
		extent: [
			readDecimalString(node.getAttribute("minx")),
			readDecimalString(node.getAttribute("miny")),
			readDecimalString(node.getAttribute("maxx")),
			readDecimalString(node.getAttribute("maxy"))
		],
		res: [readDecimalString(node.getAttribute("resx")), readDecimalString(node.getAttribute("resy"))]
	};
	if (!withCrs) return result;
	/** @type {RootObject} */
	if (isV13(objectStack)) result.crs = node.getAttribute("CRS");
	else result.srs = node.getAttribute("SRS");
	return result;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {import("../extent.js").Extent|undefined} Bounding box object.
*/
function readEXGeographicBoundingBox(node, objectStack) {
	const geographicBoundingBox = pushParseAndPop({}, EX_GEOGRAPHIC_BOUNDING_BOX_PARSERS, node, objectStack);
	if (!geographicBoundingBox) return;
	const westBoundLongitude = geographicBoundingBox["westBoundLongitude"];
	const southBoundLatitude = geographicBoundingBox["southBoundLatitude"];
	const eastBoundLongitude = geographicBoundingBox["eastBoundLongitude"];
	const northBoundLatitude = geographicBoundingBox["northBoundLatitude"];
	if (westBoundLongitude === void 0 || southBoundLatitude === void 0 || eastBoundLongitude === void 0 || northBoundLatitude === void 0) return;
	return [
		westBoundLongitude,
		southBoundLatitude,
		eastBoundLongitude,
		northBoundLatitude
	];
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Capability object.
*/
function readCapability(node, objectStack) {
	return pushParseAndPop({}, CAPABILITY_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Service object.
*/
function readService(node, objectStack) {
	return pushParseAndPop({}, isV13(objectStack) ? SERVICE_PARSERS_V13 : SERVICE_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Contact information object.
*/
function readContactInformation(node, objectStack) {
	return pushParseAndPop({}, CONTACT_INFORMATION_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Contact person object.
*/
function readContactPersonPrimary(node, objectStack) {
	return pushParseAndPop({}, CONTACT_PERSON_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Contact address object.
*/
function readContactAddress(node, objectStack) {
	return pushParseAndPop({}, CONTACT_ADDRESS_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Array<string>|undefined} Format array.
*/
function readException(node, objectStack) {
	return pushParseAndPop([], EXCEPTION_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Layer object.
*/
function readCapabilityLayer(node, objectStack) {
	const layerObject = pushParseAndPop({}, isV13(objectStack) ? LAYER_PARSERS_V13 : LAYER_PARSERS$1, node, objectStack);
	if (layerObject["Layer"] === void 0) return Object.assign(layerObject, readLayer$1(node, objectStack));
	return layerObject;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Layer object.
*/
function readLayer$1(node, objectStack) {
	const v13 = isV13(objectStack);
	const parentLayerObject = objectStack[objectStack.length - 1];
	const layerObject = pushParseAndPop({}, v13 ? LAYER_PARSERS_V13 : LAYER_PARSERS$1, node, objectStack);
	if (!layerObject) return;
	let queryable = readBooleanString(node.getAttribute("queryable"));
	if (queryable === void 0) queryable = parentLayerObject["queryable"];
	layerObject["queryable"] = queryable !== void 0 ? queryable : false;
	let cascaded = readNonNegativeIntegerString(node.getAttribute("cascaded"));
	if (cascaded === void 0) cascaded = parentLayerObject["cascaded"];
	layerObject["cascaded"] = cascaded;
	let opaque = readBooleanString(node.getAttribute("opaque"));
	if (opaque === void 0) opaque = parentLayerObject["opaque"];
	layerObject["opaque"] = opaque !== void 0 ? opaque : false;
	let noSubsets = readBooleanString(node.getAttribute("noSubsets"));
	if (noSubsets === void 0) noSubsets = parentLayerObject["noSubsets"];
	layerObject["noSubsets"] = noSubsets !== void 0 ? noSubsets : false;
	let fixedWidth = readDecimalString(node.getAttribute("fixedWidth"));
	if (!fixedWidth) fixedWidth = parentLayerObject["fixedWidth"];
	layerObject["fixedWidth"] = fixedWidth;
	let fixedHeight = readDecimalString(node.getAttribute("fixedHeight"));
	if (!fixedHeight) fixedHeight = parentLayerObject["fixedHeight"];
	layerObject["fixedHeight"] = fixedHeight;
	const addKeys = ["Style", "AuthorityURL"];
	if (v13) addKeys.push("CRS");
	else addKeys.push("SRS", "Dimension");
	addKeys.forEach(function(key) {
		if (key in parentLayerObject) layerObject[key] = (layerObject[key] || []).concat(parentLayerObject[key]);
	});
	const replaceKeys = ["BoundingBox", "Attribution"];
	if (v13) replaceKeys.push("Dimension", "EX_GeographicBoundingBox", "MinScaleDenominator", "MaxScaleDenominator");
	else replaceKeys.push("LatLonBoundingBox", "ScaleHint", "Extent");
	replaceKeys.forEach(function(key) {
		if (!(key in layerObject)) layerObject[key] = parentLayerObject[key];
	});
	return layerObject;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object} Dimension object.
*/
function readDimension(node, objectStack) {
	const dimensionObject = {
		"name": node.getAttribute("name"),
		"units": node.getAttribute("units"),
		"unitSymbol": node.getAttribute("unitSymbol")
	};
	if (isV13(objectStack)) Object.assign(dimensionObject, {
		"default": node.getAttribute("default"),
		"multipleValues": readBooleanString(node.getAttribute("multipleValues")),
		"nearestValue": readBooleanString(node.getAttribute("nearestValue")),
		"current": readBooleanString(node.getAttribute("current")),
		"values": readString(node)
	});
	return dimensionObject;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object} Extent object.
*/
function readExtent(node, objectStack) {
	return {
		"name": node.getAttribute("name"),
		"default": node.getAttribute("default"),
		"nearestValue": readBooleanString(node.getAttribute("nearestValue"))
	};
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object} ScaleHint object.
*/
function readScaleHint(node, objectStack) {
	return {
		"min": readDecimalString(node.getAttribute("min")),
		"max": readDecimalString(node.getAttribute("max"))
	};
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Online resource object.
*/
function readFormatOnlineresource(node, objectStack) {
	return pushParseAndPop({}, FORMAT_ONLINERESOURCE_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Request object.
*/
function readRequest(node, objectStack) {
	return pushParseAndPop({}, REQUEST_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} DCP type object.
*/
function readDCPType(node, objectStack) {
	return pushParseAndPop({}, DCPTYPE_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} HTTP object.
*/
function readHTTP(node, objectStack) {
	return pushParseAndPop({}, HTTP_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Operation type object.
*/
function readOperationType(node, objectStack) {
	return pushParseAndPop({}, OPERATIONTYPE_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Online resource object.
*/
function readSizedFormatOnlineresource(node, objectStack) {
	const formatOnlineresource = readFormatOnlineresource(node, objectStack);
	if (formatOnlineresource) {
		formatOnlineresource["size"] = [readNonNegativeIntegerString(node.getAttribute("width")), readNonNegativeIntegerString(node.getAttribute("height"))];
		return formatOnlineresource;
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Authority URL object.
*/
function readAuthorityURL(node, objectStack) {
	const authorityObject = readFormatOnlineresource(node, objectStack);
	if (authorityObject) {
		authorityObject["name"] = node.getAttribute("name");
		return authorityObject;
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Metadata URL object.
*/
function readMetadataURL(node, objectStack) {
	const metadataObject = readFormatOnlineresource(node, objectStack);
	if (metadataObject) {
		metadataObject["type"] = node.getAttribute("type");
		return metadataObject;
	}
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Style object.
*/
function readStyle$1(node, objectStack) {
	return pushParseAndPop({}, STYLE_PARSERS$1, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Array<string>|undefined} Keyword list.
*/
function readKeywordList(node, objectStack) {
	return pushParseAndPop([], KEYWORDLIST_PARSERS, node, objectStack);
}
//#endregion
//#region node_modules/ol/format/WMSGetFeatureInfo.js
/**
* @module ol/format/WMSGetFeatureInfo
*/
/**
* @typedef {Object} Options
* @property {Array<string>} [layers] If set, only features of the given layers will be returned by the format when read.
*/
/**
* @const
* @type {string}
*/
var featureIdentifier = "_feature";
/**
* @const
* @type {string}
*/
var layerIdentifier = "_layer";
/**
* @classdesc
* Format for reading WMSGetFeatureInfo format. It uses
* {@link module:ol/format/GML2~GML2} to read features.
*
* @api
*/
var WMSGetFeatureInfo = class extends XMLFeature {
	/**
	* @param {Options} [options] Options.
	*/
	constructor(options) {
		super();
		options = options ? options : {};
		/**
		* @private
		* @type {string}
		*/
		this.featureNS_ = "http://mapserver.gis.umn.edu/mapserver";
		/**
		* @private
		* @type {GML2}
		*/
		this.gmlFormat_ = new GML2();
		/**
		* @private
		* @type {Array<string>|null}
		*/
		this.layers_ = options.layers ? options.layers : null;
	}
	/**
	* @return {Array<string>|null} layers
	*/
	getLayers() {
		return this.layers_;
	}
	/**
	* @param {Array<string>|null} layers Layers to parse.
	*/
	setLayers(layers) {
		this.layers_ = layers;
	}
	/**
	* @param {Element} node Node.
	* @param {Array<*>} objectStack Object stack.
	* @return {Array<import("../Feature.js").default>} Features.
	* @private
	*/
	readFeatures_(node, objectStack) {
		node.setAttribute("namespaceURI", this.featureNS_);
		const localName = node.localName;
		/** @type {Array<import("../Feature.js").default>} */
		let features = [];
		if (node.childNodes.length === 0) return features;
		if (localName == "msGMLOutput") for (let i = 0, ii = node.childNodes.length; i < ii; i++) {
			const layer = node.childNodes[i];
			if (layer.nodeType !== Node.ELEMENT_NODE) continue;
			const layerElement = layer;
			const context = objectStack[0];
			const toRemove = layerIdentifier;
			const layerName = layerElement.localName.replace(toRemove, "");
			if (this.layers_ && !this.layers_.includes(layerName)) continue;
			const featureType = layerName + featureIdentifier;
			context["featureType"] = featureType;
			context["featureNS"] = this.featureNS_;
			/** @type {Object<string, import("../xml.js").Parser>} */
			const parsers = {};
			parsers[featureType] = makeArrayPusher(this.gmlFormat_.readFeatureElement, this.gmlFormat_);
			const parsersNS = makeStructureNS([context["featureNS"], null], parsers);
			layerElement.setAttribute("namespaceURI", this.featureNS_);
			const layerFeatures = pushParseAndPop([], parsersNS, layerElement, objectStack, this.gmlFormat_);
			if (layerFeatures) extend(features, layerFeatures);
		}
		if (localName == "FeatureCollection") {
			const gmlFeatures = pushParseAndPop([], this.gmlFormat_.FEATURE_COLLECTION_PARSERS, node, [{}], this.gmlFormat_);
			if (gmlFeatures) features = gmlFeatures;
		}
		return features;
	}
	/**
	* @protected
	* @param {Element} node Node.
	* @param {import("./Feature.js").ReadOptions} [options] Options.
	* @return {Array<import("../Feature.js").default>} Features.
	* @override
	*/
	readFeaturesFromNode(node, options) {
		const internalOptions = {};
		if (options) Object.assign(internalOptions, this.getReadOptions(node, options));
		return this.readFeatures_(node, [internalOptions]);
	}
};
//#endregion
//#region node_modules/ol/format/WMTSCapabilities.js
/**
* @module ol/format/WMTSCapabilities
*/
/**
* @const
* @type {Array<null|string>}
*/
var NAMESPACE_URIS = [null, "http://www.opengis.net/wmts/1.0"];
/**
* @const
* @type {Array<null|string>}
*/
var OWS_NAMESPACE_URIS = [null, "http://www.opengis.net/ows/1.1"];
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var PARSERS = makeStructureNS(NAMESPACE_URIS, { "Contents": makeObjectPropertySetter(readContents) });
/**
* @classdesc
* Format for reading WMTS capabilities data.
*
* @api
*/
var WMTSCapabilities = class extends XML {
	constructor() {
		super();
		/**
		* @type {OWS}
		* @private
		*/
		this.owsParser_ = new OWS();
	}
	/**
	* @param {Element} node Node.
	* @return {Object|null} Object
	* @override
	*/
	readFromNode(node) {
		let version = node.getAttribute("version");
		if (version) version = version.trim();
		let WMTSCapabilityObject = this.owsParser_.readFromNode(node);
		if (!WMTSCapabilityObject) return null;
		WMTSCapabilityObject["version"] = version;
		WMTSCapabilityObject = pushParseAndPop(WMTSCapabilityObject, PARSERS, node, []);
		return WMTSCapabilityObject ? WMTSCapabilityObject : null;
	}
};
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var CONTENTS_PARSERS = makeStructureNS(NAMESPACE_URIS, {
	"Layer": makeObjectPropertyPusher(readLayer),
	"TileMatrixSet": makeObjectPropertyPusher(readTileMatrixSet)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var LAYER_PARSERS = makeStructureNS(NAMESPACE_URIS, {
	"Style": makeObjectPropertyPusher(readStyle),
	"Format": makeObjectPropertyPusher(readString),
	"TileMatrixSetLink": makeObjectPropertyPusher(readTileMatrixSetLink),
	"Dimension": makeObjectPropertyPusher(readDimensions),
	"ResourceURL": makeObjectPropertyPusher(readResourceUrl)
}, makeStructureNS(OWS_NAMESPACE_URIS, {
	"Title": makeObjectPropertySetter(readString),
	"Abstract": makeObjectPropertySetter(readString),
	"WGS84BoundingBox": makeObjectPropertySetter(readBoundingBox),
	"BoundingBox": makeObjectPropertyPusher(readBoundingBoxWithCrs),
	"Identifier": makeObjectPropertySetter(readString)
}));
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var STYLE_PARSERS = makeStructureNS(NAMESPACE_URIS, { "LegendURL": makeObjectPropertyPusher(readLegendUrl) }, makeStructureNS(OWS_NAMESPACE_URIS, {
	"Title": makeObjectPropertySetter(readString),
	"Identifier": makeObjectPropertySetter(readString)
}));
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TMS_LINKS_PARSERS = makeStructureNS(NAMESPACE_URIS, {
	"TileMatrixSet": makeObjectPropertySetter(readString),
	"TileMatrixSetLimits": makeObjectPropertySetter(readTileMatrixLimitsList)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TMS_LIMITS_LIST_PARSERS = makeStructureNS(NAMESPACE_URIS, { "TileMatrixLimits": makeArrayPusher(readTileMatrixLimits) });
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TMS_LIMITS_PARSERS = makeStructureNS(NAMESPACE_URIS, {
	"TileMatrix": makeObjectPropertySetter(readString),
	"MinTileRow": makeObjectPropertySetter(readPositiveInteger),
	"MaxTileRow": makeObjectPropertySetter(readPositiveInteger),
	"MinTileCol": makeObjectPropertySetter(readPositiveInteger),
	"MaxTileCol": makeObjectPropertySetter(readPositiveInteger)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var DIMENSION_PARSERS = makeStructureNS(NAMESPACE_URIS, {
	"Default": makeObjectPropertySetter(readString),
	"Value": makeObjectPropertyPusher(readString)
}, makeStructureNS(OWS_NAMESPACE_URIS, { "Identifier": makeObjectPropertySetter(readString) }));
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var WGS84_BBOX_READERS = makeStructureNS(OWS_NAMESPACE_URIS, {
	"LowerCorner": makeArrayPusher(readCoordinates),
	"UpperCorner": makeArrayPusher(readCoordinates)
});
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TMS_PARSERS = makeStructureNS(NAMESPACE_URIS, {
	"WellKnownScaleSet": makeObjectPropertySetter(readString),
	"TileMatrix": makeObjectPropertyPusher(readTileMatrix)
}, makeStructureNS(OWS_NAMESPACE_URIS, {
	"SupportedCRS": makeObjectPropertySetter(readString),
	"Identifier": makeObjectPropertySetter(readString),
	"BoundingBox": makeObjectPropertySetter(readBoundingBox)
}));
/**
* @const
* @type {Object<string, Object<string, import("../xml.js").Parser>>}
*/
var TM_PARSERS = makeStructureNS(NAMESPACE_URIS, {
	"TopLeftCorner": makeObjectPropertySetter(readCoordinates),
	"ScaleDenominator": makeObjectPropertySetter(readDecimal),
	"TileWidth": makeObjectPropertySetter(readPositiveInteger),
	"TileHeight": makeObjectPropertySetter(readPositiveInteger),
	"MatrixWidth": makeObjectPropertySetter(readPositiveInteger),
	"MatrixHeight": makeObjectPropertySetter(readPositiveInteger)
}, makeStructureNS(OWS_NAMESPACE_URIS, { "Identifier": makeObjectPropertySetter(readString) }));
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Attribution object.
*/
function readContents(node, objectStack) {
	return pushParseAndPop({}, CONTENTS_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Layers object.
*/
function readLayer(node, objectStack) {
	return pushParseAndPop({}, LAYER_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Tile Matrix Set object.
*/
function readTileMatrixSet(node, objectStack) {
	return pushParseAndPop({}, TMS_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Style object.
*/
function readStyle(node, objectStack) {
	const style = pushParseAndPop({}, STYLE_PARSERS, node, objectStack);
	if (!style) return;
	style["isDefault"] = node.getAttribute("isDefault") === "true";
	return style;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Tile Matrix Set Link object.
*/
function readTileMatrixSetLink(node, objectStack) {
	return pushParseAndPop({}, TMS_LINKS_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Dimension object.
*/
function readDimensions(node, objectStack) {
	return pushParseAndPop({}, DIMENSION_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Resource URL object.
*/
function readResourceUrl(node, objectStack) {
	const format = node.getAttribute("format");
	const template = node.getAttribute("template");
	const resourceType = node.getAttribute("resourceType");
	const resource = {};
	if (format) resource["format"] = format;
	if (template) resource["template"] = template;
	if (resourceType) resource["resourceType"] = resourceType;
	return resource;
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} BBox object.
*/
function readBoundingBox(node, objectStack) {
	const coordinates = pushParseAndPop([], WGS84_BBOX_READERS, node, objectStack);
	if (coordinates.length != 2) return;
	return boundingExtent(coordinates);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} BBox object.
*/
function readBoundingBoxWithCrs(node, objectStack) {
	const crs = node.getAttribute("crs");
	const coordinates = pushParseAndPop([], WGS84_BBOX_READERS, node, objectStack);
	if (coordinates.length != 2) return;
	return {
		extent: boundingExtent(coordinates),
		crs
	};
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Legend object.
*/
function readLegendUrl(node, objectStack) {
	const legend = {};
	legend["format"] = node.getAttribute("format");
	legend["href"] = readHref(node);
	return legend;
}
/**
* @param {Node} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} Coordinates object.
*/
function readCoordinates(node, objectStack) {
	const coordinates = readString(node).split(/\s+/);
	if (!coordinates || coordinates.length != 2) return;
	const x = +coordinates[0];
	const y = +coordinates[1];
	if (isNaN(x) || isNaN(y)) return;
	return [x, y];
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} TileMatrix object.
*/
function readTileMatrix(node, objectStack) {
	return pushParseAndPop({}, TM_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} TileMatrixSetLimits Object.
*/
function readTileMatrixLimitsList(node, objectStack) {
	return pushParseAndPop([], TMS_LIMITS_LIST_PARSERS, node, objectStack);
}
/**
* @param {Element} node Node.
* @param {Array<*>} objectStack Object stack.
* @return {Object|undefined} TileMatrixLimits Array.
*/
function readTileMatrixLimits(node, objectStack) {
	return pushParseAndPop({}, TMS_LIMITS_PARSERS, node, objectStack);
}
//#endregion
export { EsriJSON, GML, GPX, GeoJSON, IGC, IIIFInfo, KML, MVT, OWS, Polyline, TopoJSON, WFS, WKB, WKT, WMSCapabilities, WMSGetFeatureInfo, WMTSCapabilities };

//# sourceMappingURL=ol_format.js.map