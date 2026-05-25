import { g as extend } from "./Object-DolGq2cf.js";
import { i as squaredDistance } from "./math-C8anmfUQ.js";
import { Q as containsXY, Y as closestSquaredDistanceXY, et as createEmpty, it as createOrUpdateFromFlatCoordinates } from "./proj-BM-4T99l.js";
import { E as SimpleGeometry, S as assignClosestMultiArrayPoint, T as multiArrayMaxSquaredDelta, _ as deflateCoordinates, b as arrayMaxSquaredDelta, d as quantizeMultiArray, h as inflateMultiCoordinatesArray, i as intersectsLinearRingMultiArray, l as douglasPeuckerArray, m as inflateCoordinatesArray, n as intersectsLineStringArray, p as inflateCoordinates, s as linearRingssContainsXY, v as deflateCoordinatesArray, x as assignClosestArrayPoint, y as deflateMultiCoordinatesArray } from "./intersectsextent-Bqx-JGI7.js";
import { d as orientLinearRingsArray, g as linearRingss$1, l as linearRingssAreOriented, m as Point, p as getInteriorPointsOfMultiArray, t as Polygon } from "./Polygon-BePo0SOh.js";
import { n as interpolatePoint, r as lineStringsCoordinateAtM, t as LineString } from "./LineString-CQ7TDKcW.js";
import { t as lineStringLength } from "./length-BywQShYR.js";
//#region node_modules/ol/geom/MultiLineString.js
/**
* @module ol/geom/MultiLineString
*/
/**
* @classdesc
* Multi-linestring geometry.
*
* @api
*/
var MultiLineString = class MultiLineString extends SimpleGeometry {
	/**
	* @param {Array<Array<import("../coordinate.js").Coordinate>|LineString>|Array<number>} coordinates
	*     Coordinates or LineString geometries. (For internal use, flat coordinates in
	*     combination with `layout` and `ends` are also accepted.)
	* @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
	* @param {Array<number>} [ends] Flat coordinate ends for internal use.
	*/
	constructor(coordinates, layout, ends) {
		super();
		/**
		* @type {Array<number>}
		* @private
		*/
		this.ends_ = [];
		/**
		* @private
		* @type {number}
		*/
		this.maxDelta_ = -1;
		/**
		* @private
		* @type {number}
		*/
		this.maxDeltaRevision_ = -1;
		if (Array.isArray(coordinates[0])) this.setCoordinates(coordinates, layout);
		else if (layout !== void 0 && ends) {
			this.setFlatCoordinates(layout, coordinates);
			this.ends_ = ends;
		} else {
			const lineStrings = coordinates;
			/** @type {Array<number>} */
			const flatCoordinates = [];
			const ends = [];
			for (let i = 0, ii = lineStrings.length; i < ii; ++i) {
				const lineString = lineStrings[i];
				extend(flatCoordinates, lineString.getFlatCoordinates());
				ends.push(flatCoordinates.length);
			}
			const layout = lineStrings.length === 0 ? this.getLayout() : lineStrings[0].getLayout();
			this.setFlatCoordinates(layout, flatCoordinates);
			this.ends_ = ends;
		}
	}
	/**
	* Append the passed linestring to the multilinestring.
	* @param {LineString} lineString LineString.
	* @api
	*/
	appendLineString(lineString) {
		extend(this.flatCoordinates, lineString.getFlatCoordinates().slice());
		this.ends_.push(this.flatCoordinates.length);
		this.changed();
	}
	/**
	* Make a complete copy of the geometry.
	* @return {!MultiLineString} Clone.
	* @api
	* @override
	*/
	clone() {
		const multiLineString = new MultiLineString(this.flatCoordinates.slice(), this.layout, this.ends_.slice());
		multiLineString.applyProperties(this);
		return multiLineString;
	}
	/**
	* @param {number} x X.
	* @param {number} y Y.
	* @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
	* @param {number} minSquaredDistance Minimum squared distance.
	* @return {number} Minimum squared distance.
	* @override
	*/
	closestPointXY(x, y, closestPoint, minSquaredDistance) {
		if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) return minSquaredDistance;
		if (this.maxDeltaRevision_ != this.getRevision()) {
			this.maxDelta_ = Math.sqrt(arrayMaxSquaredDelta(this.flatCoordinates, 0, this.ends_, this.stride, 0));
			this.maxDeltaRevision_ = this.getRevision();
		}
		return assignClosestArrayPoint(this.flatCoordinates, 0, this.ends_, this.stride, this.maxDelta_, false, x, y, closestPoint, minSquaredDistance);
	}
	/**
	* Returns the coordinate at `m` using linear interpolation, or `null` if no
	* such coordinate exists.
	*
	* `extrapolate` controls extrapolation beyond the range of Ms in the
	* MultiLineString. If `extrapolate` is `true` then Ms less than the first
	* M will return the first coordinate and Ms greater than the last M will
	* return the last coordinate.
	*
	* `interpolate` controls interpolation between consecutive LineStrings
	* within the MultiLineString. If `interpolate` is `true` the coordinates
	* will be linearly interpolated between the last coordinate of one LineString
	* and the first coordinate of the next LineString.  If `interpolate` is
	* `false` then the function will return `null` for Ms falling between
	* LineStrings.
	*
	* @param {number} m M.
	* @param {boolean} [extrapolate] Extrapolate. Default is `false`.
	* @param {boolean} [interpolate] Interpolate. Default is `false`.
	* @return {import("../coordinate.js").Coordinate|null} Coordinate.
	* @api
	*/
	getCoordinateAtM(m, extrapolate, interpolate) {
		if (this.layout != "XYM" && this.layout != "XYZM" || this.flatCoordinates.length === 0) return null;
		extrapolate = extrapolate !== void 0 ? extrapolate : false;
		interpolate = interpolate !== void 0 ? interpolate : false;
		return lineStringsCoordinateAtM(this.flatCoordinates, 0, this.ends_, this.stride, m, extrapolate, interpolate);
	}
	/**
	* Return the coordinates of the multilinestring.
	* @return {Array<Array<import("../coordinate.js").Coordinate>>} Coordinates.
	* @api
	* @override
	*/
	getCoordinates() {
		return inflateCoordinatesArray(this.flatCoordinates, 0, this.ends_, this.stride);
	}
	/**
	* @return {Array<number>} Ends.
	*/
	getEnds() {
		return this.ends_;
	}
	/**
	* Return the linestring at the specified index.
	* @param {number} index Index.
	* @return {LineString} LineString.
	* @api
	*/
	getLineString(index) {
		if (index < 0 || this.ends_.length <= index) return null;
		return new LineString(this.flatCoordinates.slice(index === 0 ? 0 : this.ends_[index - 1], this.ends_[index]), this.layout);
	}
	/**
	* Return the linestrings of this multilinestring.
	* @return {Array<LineString>} LineStrings.
	* @api
	*/
	getLineStrings() {
		const flatCoordinates = this.flatCoordinates;
		const ends = this.ends_;
		const layout = this.layout;
		/** @type {Array<LineString>} */
		const lineStrings = [];
		let offset = 0;
		for (let i = 0, ii = ends.length; i < ii; ++i) {
			const end = ends[i];
			const lineString = new LineString(flatCoordinates.slice(offset, end), layout);
			lineStrings.push(lineString);
			offset = end;
		}
		return lineStrings;
	}
	/**
	* Return the sum of all line string lengths
	* @return {number} Length (on projected plane).
	* @api
	*/
	getLength() {
		const ends = this.ends_;
		let start = 0;
		let length = 0;
		for (let i = 0, ii = ends.length; i < ii; ++i) {
			length += lineStringLength(this.flatCoordinates, start, ends[i], this.stride);
			start = ends[i];
		}
		return length;
	}
	/**
	* @return {Array<number>} Flat midpoints.
	*/
	getFlatMidpoints() {
		/** @type {Array<number>} */
		const midpoints = [];
		const flatCoordinates = this.flatCoordinates;
		let offset = 0;
		const ends = this.ends_;
		const stride = this.stride;
		for (let i = 0, ii = ends.length; i < ii; ++i) {
			const end = ends[i];
			extend(midpoints, interpolatePoint(flatCoordinates, offset, end, stride, .5));
			offset = end;
		}
		return midpoints;
	}
	/**
	* @param {number} squaredTolerance Squared tolerance.
	* @return {MultiLineString} Simplified MultiLineString.
	* @protected
	* @override
	*/
	getSimplifiedGeometryInternal(squaredTolerance) {
		/** @type {Array<number>} */
		const simplifiedFlatCoordinates = [];
		/** @type {Array<number>} */
		const simplifiedEnds = [];
		simplifiedFlatCoordinates.length = douglasPeuckerArray(this.flatCoordinates, 0, this.ends_, this.stride, squaredTolerance, simplifiedFlatCoordinates, 0, simplifiedEnds);
		return new MultiLineString(simplifiedFlatCoordinates, "XY", simplifiedEnds);
	}
	/**
	* Get the type of this geometry.
	* @return {import("./Geometry.js").Type} Geometry type.
	* @api
	* @override
	*/
	getType() {
		return "MultiLineString";
	}
	/**
	* Test if the geometry and the passed extent intersect.
	* @param {import("../extent.js").Extent} extent Extent.
	* @return {boolean} `true` if the geometry and the extent intersect.
	* @api
	* @override
	*/
	intersectsExtent(extent) {
		return intersectsLineStringArray(this.flatCoordinates, 0, this.ends_, this.stride, extent);
	}
	/**
	* Set the coordinates of the multilinestring.
	* @param {!Array<Array<import("../coordinate.js").Coordinate>>} coordinates Coordinates.
	* @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
	* @api
	* @override
	*/
	setCoordinates(coordinates, layout) {
		this.setLayout(layout, coordinates, 2);
		if (!this.flatCoordinates) this.flatCoordinates = [];
		const ends = deflateCoordinatesArray(this.flatCoordinates, 0, coordinates, this.stride, this.ends_);
		this.flatCoordinates.length = ends.length === 0 ? 0 : ends[ends.length - 1];
		this.changed();
	}
};
//#endregion
//#region node_modules/ol/geom/MultiPoint.js
/**
* @module ol/geom/MultiPoint
*/
/**
* @classdesc
* Multi-point geometry.
*
* @api
*/
var MultiPoint = class MultiPoint extends SimpleGeometry {
	/**
	* @param {Array<import("../coordinate.js").Coordinate>|Array<number>} coordinates Coordinates.
	*     For internal use, flat coordinates in combination with `layout` are also accepted.
	* @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
	*/
	constructor(coordinates, layout) {
		super();
		if (layout && !Array.isArray(coordinates[0])) this.setFlatCoordinates(layout, coordinates);
		else this.setCoordinates(coordinates, layout);
	}
	/**
	* Append the passed point to this multipoint.
	* @param {Point} point Point.
	* @api
	*/
	appendPoint(point) {
		extend(this.flatCoordinates, point.getFlatCoordinates());
		this.changed();
	}
	/**
	* Make a complete copy of the geometry.
	* @return {!MultiPoint} Clone.
	* @api
	* @override
	*/
	clone() {
		const multiPoint = new MultiPoint(this.flatCoordinates.slice(), this.layout);
		multiPoint.applyProperties(this);
		return multiPoint;
	}
	/**
	* @param {number} x X.
	* @param {number} y Y.
	* @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
	* @param {number} minSquaredDistance Minimum squared distance.
	* @return {number} Minimum squared distance.
	* @override
	*/
	closestPointXY(x, y, closestPoint, minSquaredDistance) {
		if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) return minSquaredDistance;
		const flatCoordinates = this.flatCoordinates;
		const stride = this.stride;
		for (let i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
			const squaredDistance$1 = squaredDistance(x, y, flatCoordinates[i], flatCoordinates[i + 1]);
			if (squaredDistance$1 < minSquaredDistance) {
				minSquaredDistance = squaredDistance$1;
				for (let j = 0; j < stride; ++j) closestPoint[j] = flatCoordinates[i + j];
				closestPoint.length = stride;
			}
		}
		return minSquaredDistance;
	}
	/**
	* Return the coordinates of the multipoint.
	* @return {Array<import("../coordinate.js").Coordinate>} Coordinates.
	* @api
	* @override
	*/
	getCoordinates() {
		return inflateCoordinates(this.flatCoordinates, 0, this.flatCoordinates.length, this.stride);
	}
	/**
	* Return the point at the specified index.
	* @param {number} index Index.
	* @return {Point} Point.
	* @api
	*/
	getPoint(index) {
		const n = this.flatCoordinates.length / this.stride;
		if (index < 0 || n <= index) return null;
		return new Point(this.flatCoordinates.slice(index * this.stride, (index + 1) * this.stride), this.layout);
	}
	/**
	* Return the points of this multipoint.
	* @return {Array<Point>} Points.
	* @api
	*/
	getPoints() {
		const flatCoordinates = this.flatCoordinates;
		const layout = this.layout;
		const stride = this.stride;
		/** @type {Array<Point>} */
		const points = [];
		for (let i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
			const point = new Point(flatCoordinates.slice(i, i + stride), layout);
			points.push(point);
		}
		return points;
	}
	/**
	* Get the type of this geometry.
	* @return {import("./Geometry.js").Type} Geometry type.
	* @api
	* @override
	*/
	getType() {
		return "MultiPoint";
	}
	/**
	* Test if the geometry and the passed extent intersect.
	* @param {import("../extent.js").Extent} extent Extent.
	* @return {boolean} `true` if the geometry and the extent intersect.
	* @api
	* @override
	*/
	intersectsExtent(extent) {
		const flatCoordinates = this.flatCoordinates;
		const stride = this.stride;
		for (let i = 0, ii = flatCoordinates.length; i < ii; i += stride) {
			const x = flatCoordinates[i];
			const y = flatCoordinates[i + 1];
			if (containsXY(extent, x, y)) return true;
		}
		return false;
	}
	/**
	* Set the coordinates of the multipoint.
	* @param {!Array<import("../coordinate.js").Coordinate>} coordinates Coordinates.
	* @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
	* @api
	* @override
	*/
	setCoordinates(coordinates, layout) {
		this.setLayout(layout, coordinates, 1);
		if (!this.flatCoordinates) this.flatCoordinates = [];
		this.flatCoordinates.length = deflateCoordinates(this.flatCoordinates, 0, coordinates, this.stride);
		this.changed();
	}
};
//#endregion
//#region node_modules/ol/geom/flat/center.js
/**
* @module ol/geom/flat/center
*/
/**
* @param {Array<number>} flatCoordinates Flat coordinates.
* @param {number} offset Offset.
* @param {Array<Array<number>>} endss Endss.
* @param {number} stride Stride.
* @return {Array<number>} Flat centers.
*/
function linearRingss(flatCoordinates, offset, endss, stride) {
	const flatCenters = [];
	let extent = createEmpty();
	for (let i = 0, ii = endss.length; i < ii; ++i) {
		const ends = endss[i];
		extent = createOrUpdateFromFlatCoordinates(flatCoordinates, offset, ends[0], stride);
		flatCenters.push((extent[0] + extent[2]) / 2, (extent[1] + extent[3]) / 2);
		offset = ends[ends.length - 1];
	}
	return flatCenters;
}
//#endregion
//#region node_modules/ol/geom/MultiPolygon.js
/**
* @module ol/geom/MultiPolygon
*/
/**
* @classdesc
* Multi-polygon geometry.
*
* @api
*/
var MultiPolygon = class MultiPolygon extends SimpleGeometry {
	/**
	* @param {Array<Array<Array<import("../coordinate.js").Coordinate>>|Polygon>|Array<number>} coordinates Coordinates.
	*     For internal use, flat coordinates in combination with `layout` and `endss` are also accepted.
	* @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
	* @param {Array<Array<number>>} [endss] Array of ends for internal use with flat coordinates.
	*/
	constructor(coordinates, layout, endss) {
		super();
		/**
		* @type {Array<Array<number>>}
		* @private
		*/
		this.endss_ = [];
		/**
		* @private
		* @type {number}
		*/
		this.flatInteriorPointsRevision_ = -1;
		/**
		* @private
		* @type {Array<number>|null}
		*/
		this.flatInteriorPoints_ = null;
		/**
		* @private
		* @type {number}
		*/
		this.maxDelta_ = -1;
		/**
		* @private
		* @type {number}
		*/
		this.maxDeltaRevision_ = -1;
		/**
		* @private
		* @type {number}
		*/
		this.orientedRevision_ = -1;
		/**
		* @private
		* @type {Array<number>|null}
		*/
		this.orientedFlatCoordinates_ = null;
		if (!endss && !Array.isArray(coordinates[0])) {
			const polygons = coordinates;
			/** @type {Array<number>} */
			const flatCoordinates = [];
			const thisEndss = [];
			for (let i = 0, ii = polygons.length; i < ii; ++i) {
				const polygon = polygons[i];
				const offset = flatCoordinates.length;
				const ends = polygon.getEnds();
				for (let j = 0, jj = ends.length; j < jj; ++j) ends[j] += offset;
				extend(flatCoordinates, polygon.getFlatCoordinates());
				thisEndss.push(ends);
			}
			layout = polygons.length === 0 ? this.getLayout() : polygons[0].getLayout();
			coordinates = flatCoordinates;
			endss = thisEndss;
		}
		if (layout !== void 0 && endss) {
			this.setFlatCoordinates(layout, coordinates);
			this.endss_ = endss;
		} else this.setCoordinates(coordinates, layout);
	}
	/**
	* Append the passed polygon to this multipolygon.
	* @param {Polygon} polygon Polygon.
	* @api
	*/
	appendPolygon(polygon) {
		/** @type {Array<number>} */
		let ends;
		if (!this.flatCoordinates) {
			this.flatCoordinates = polygon.getFlatCoordinates().slice();
			ends = polygon.getEnds().slice();
			this.endss_.push();
		} else {
			const offset = this.flatCoordinates.length;
			extend(this.flatCoordinates, polygon.getFlatCoordinates());
			ends = polygon.getEnds().slice();
			for (let i = 0, ii = ends.length; i < ii; ++i) ends[i] += offset;
		}
		this.endss_.push(ends);
		this.changed();
	}
	/**
	* Make a complete copy of the geometry.
	* @return {!MultiPolygon} Clone.
	* @api
	* @override
	*/
	clone() {
		const len = this.endss_.length;
		const newEndss = new Array(len);
		for (let i = 0; i < len; ++i) newEndss[i] = this.endss_[i].slice();
		const multiPolygon = new MultiPolygon(this.flatCoordinates.slice(), this.layout, newEndss);
		multiPolygon.applyProperties(this);
		return multiPolygon;
	}
	/**
	* @param {number} x X.
	* @param {number} y Y.
	* @param {import("../coordinate.js").Coordinate} closestPoint Closest point.
	* @param {number} minSquaredDistance Minimum squared distance.
	* @return {number} Minimum squared distance.
	* @override
	*/
	closestPointXY(x, y, closestPoint, minSquaredDistance) {
		if (minSquaredDistance < closestSquaredDistanceXY(this.getExtent(), x, y)) return minSquaredDistance;
		if (this.maxDeltaRevision_ != this.getRevision()) {
			this.maxDelta_ = Math.sqrt(multiArrayMaxSquaredDelta(this.flatCoordinates, 0, this.endss_, this.stride, 0));
			this.maxDeltaRevision_ = this.getRevision();
		}
		return assignClosestMultiArrayPoint(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, this.maxDelta_, true, x, y, closestPoint, minSquaredDistance);
	}
	/**
	* @param {number} x X.
	* @param {number} y Y.
	* @return {boolean} Contains (x, y).
	* @override
	*/
	containsXY(x, y) {
		return linearRingssContainsXY(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, x, y);
	}
	/**
	* Return the area of the multipolygon on projected plane.
	* @return {number} Area (on projected plane).
	* @api
	*/
	getArea() {
		return linearRingss$1(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride);
	}
	/**
	* Get the coordinate array for this geometry.  This array has the structure
	* of a GeoJSON coordinate array for multi-polygons.
	*
	* @param {boolean} [right] Orient coordinates according to the right-hand
	*     rule (counter-clockwise for exterior and clockwise for interior rings).
	*     If `false`, coordinates will be oriented according to the left-hand rule
	*     (clockwise for exterior and counter-clockwise for interior rings).
	*     By default, coordinate orientation will depend on how the geometry was
	*     constructed.
	* @return {Array<Array<Array<import("../coordinate.js").Coordinate>>>} Coordinates.
	* @api
	* @override
	*/
	getCoordinates(right) {
		let flatCoordinates;
		if (right !== void 0) {
			flatCoordinates = this.getOrientedFlatCoordinates().slice();
			orientLinearRingsArray(flatCoordinates, 0, this.endss_, this.stride, right);
		} else flatCoordinates = this.flatCoordinates;
		return inflateMultiCoordinatesArray(flatCoordinates, 0, this.endss_, this.stride);
	}
	/**
	* @return {Array<Array<number>>} Endss.
	*/
	getEndss() {
		return this.endss_;
	}
	/**
	* @return {Array<number>} Flat interior points.
	*/
	getFlatInteriorPoints() {
		if (this.flatInteriorPointsRevision_ != this.getRevision()) {
			const flatCenters = linearRingss(this.flatCoordinates, 0, this.endss_, this.stride);
			this.flatInteriorPoints_ = getInteriorPointsOfMultiArray(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, flatCenters);
			this.flatInteriorPointsRevision_ = this.getRevision();
		}
		return this.flatInteriorPoints_;
	}
	/**
	* Return the interior points as {@link module:ol/geom/MultiPoint~MultiPoint multipoint}.
	* @return {MultiPoint} Interior points as XYM coordinates, where M is
	* the length of the horizontal intersection that the point belongs to.
	* @api
	*/
	getInteriorPoints() {
		return new MultiPoint(this.getFlatInteriorPoints().slice(), "XYM");
	}
	/**
	* @return {Array<number>} Oriented flat coordinates.
	*/
	getOrientedFlatCoordinates() {
		if (this.orientedRevision_ != this.getRevision()) {
			const flatCoordinates = this.flatCoordinates;
			if (linearRingssAreOriented(flatCoordinates, 0, this.endss_, this.stride)) this.orientedFlatCoordinates_ = flatCoordinates;
			else {
				this.orientedFlatCoordinates_ = flatCoordinates.slice();
				this.orientedFlatCoordinates_.length = orientLinearRingsArray(this.orientedFlatCoordinates_, 0, this.endss_, this.stride);
			}
			this.orientedRevision_ = this.getRevision();
		}
		return this.orientedFlatCoordinates_;
	}
	/**
	* @param {number} squaredTolerance Squared tolerance.
	* @return {MultiPolygon} Simplified MultiPolygon.
	* @protected
	* @override
	*/
	getSimplifiedGeometryInternal(squaredTolerance) {
		/** @type {Array<number>} */
		const simplifiedFlatCoordinates = [];
		/** @type {Array<Array<number>>} */
		const simplifiedEndss = [];
		simplifiedFlatCoordinates.length = quantizeMultiArray(this.flatCoordinates, 0, this.endss_, this.stride, Math.sqrt(squaredTolerance), simplifiedFlatCoordinates, 0, simplifiedEndss);
		return new MultiPolygon(simplifiedFlatCoordinates, "XY", simplifiedEndss);
	}
	/**
	* Return the polygon at the specified index.
	* @param {number} index Index.
	* @return {Polygon} Polygon.
	* @api
	*/
	getPolygon(index) {
		if (index < 0 || this.endss_.length <= index) return null;
		let offset;
		if (index === 0) offset = 0;
		else {
			const prevEnds = this.endss_[index - 1];
			offset = prevEnds[prevEnds.length - 1];
		}
		const ends = this.endss_[index].slice();
		const end = ends[ends.length - 1];
		if (offset !== 0) for (let i = 0, ii = ends.length; i < ii; ++i) ends[i] -= offset;
		return new Polygon(this.flatCoordinates.slice(offset, end), this.layout, ends);
	}
	/**
	* Return the polygons of this multipolygon.
	* @return {Array<Polygon>} Polygons.
	* @api
	*/
	getPolygons() {
		const layout = this.layout;
		const flatCoordinates = this.flatCoordinates;
		const endss = this.endss_;
		const polygons = [];
		let offset = 0;
		for (let i = 0, ii = endss.length; i < ii; ++i) {
			const ends = endss[i].slice();
			const end = ends[ends.length - 1];
			if (offset !== 0) for (let j = 0, jj = ends.length; j < jj; ++j) ends[j] -= offset;
			const polygon = new Polygon(flatCoordinates.slice(offset, end), layout, ends);
			polygons.push(polygon);
			offset = end;
		}
		return polygons;
	}
	/**
	* Get the type of this geometry.
	* @return {import("./Geometry.js").Type} Geometry type.
	* @api
	* @override
	*/
	getType() {
		return "MultiPolygon";
	}
	/**
	* Test if the geometry and the passed extent intersect.
	* @param {import("../extent.js").Extent} extent Extent.
	* @return {boolean} `true` if the geometry and the extent intersect.
	* @api
	* @override
	*/
	intersectsExtent(extent) {
		return intersectsLinearRingMultiArray(this.getOrientedFlatCoordinates(), 0, this.endss_, this.stride, extent);
	}
	/**
	* Set the coordinates of the multipolygon.
	* @param {!Array<Array<Array<import("../coordinate.js").Coordinate>>>} coordinates Coordinates.
	* @param {import("./Geometry.js").GeometryLayout} [layout] Layout.
	* @api
	* @override
	*/
	setCoordinates(coordinates, layout) {
		this.setLayout(layout, coordinates, 3);
		if (!this.flatCoordinates) this.flatCoordinates = [];
		const endss = deflateMultiCoordinatesArray(this.flatCoordinates, 0, coordinates, this.stride, this.endss_);
		if (endss.length === 0) this.flatCoordinates.length = 0;
		else {
			const lastEnds = endss[endss.length - 1];
			this.flatCoordinates.length = lastEnds.length === 0 ? 0 : lastEnds[lastEnds.length - 1];
		}
		this.changed();
	}
};
//#endregion
export { MultiLineString as i, linearRingss as n, MultiPoint as r, MultiPolygon as t };

//# sourceMappingURL=MultiPolygon-CU2pbURn.js.map