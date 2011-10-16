Matrix3D = function () {
	this.m00 = 1;
	this.m01 = 0;
	this.m02 = 0;
	this.m03 = 0;
	this.m10 = 0;
	this.m11 = 1;
	this.m12 = 0;
	this.m13 = 0;
	this.m20 = 0;
	this.m21 = 0;
	this.m22 = 1;
	this.m23 = 0;
	this.m30 = 0;
	this.m31 = 0;
	this.m32 = 0;
	this.m33 = 1;
}

Matrix3D.prototype = {
	toCSSValue: function () {
		var value = 'matrix3D(' + this.m00 + ',' + this.m01 + ',' + this.m02 + ',' + this.m03 + ',' + this.m10 + ',' + this.m11 + ',' + this.m12 + ',' + this.m13 + ',' + this.m20 + ',' + this.m21 + ',' + this.m22 + ',' + this.m23 + ',' + this.m30 + ',' + this.m31 + ',' + this.m32 + ',' + this.m33 + ')';
		return value;
	},

	multiply: function (b) {
		var c = new Matrix3D();
		var a = this;

		c.m00 = a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20 + a.m03 * b.m30;
		c.m01 = a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21 + a.m03 * b.m31;
		c.m02 = a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22 + a.m03 * b.m32;
		c.m03 = a.m00 * b.m03 + a.m01 * b.m13 + a.m02 * b.m23 + a.m03 * b.m33;
		c.m10 = a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20 + a.m13 * b.m30;
		c.m11 = a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31;
		c.m12 = a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32;
		c.m13 = a.m10 * b.m03 + a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33;
		c.m20 = a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20 + a.m23 * b.m30;
		c.m21 = a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31;
		c.m22 = a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32;
		c.m23 = a.m20 * b.m03 + a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33;
		c.m30 = a.m30 * b.m00 + a.m31 * b.m10 + a.m32 * b.m20 + a.m33 * b.m30;
		c.m31 = a.m30 * b.m01 + a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31;
		c.m32 = a.m30 * b.m02 + a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32;
		c.m33 = a.m30 * b.m03 + a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33;

		return c;
	},

	rotateY: function (angle) {
		var matrix = new Matrix3D();
		matrix.m00 = Math.cos(angle);
		matrix.m02 = Math.sin(angle);
		matrix.m20 = -Math.sin(angle);
		matrix.m22 = Math.cos(angle);

		return this.multiply(matrix);
	},

	rotateX: function (radians) {
		var matrix = new Matrix3D();
		matrix.m11 = Math.cos(radians);
		matrix.m12 = -Math.sin(radians);
		matrix.m21 = Math.sin(radians);
		matrix.m22 = Math.cos(radians);

		return this.multiply(matrix);
	},

	rotateXY: function (x, y) {
		var matrix = new Matrix3D();
		matrix.m00 = Math.cos(y);
		matrix.m01 = Math.sin(x) * Math.sin(y);
		matrix.m02 = Math.cos(x) * Math.sin(y);
		matrix.m10 = 0;
		matrix.m11 = Math.cos(x);
		matrix.m12 = -Math.sin(x)
		matrix.m20 = -Math.sin(y);
		matrix.m21 = Math.sin(x) * Math.cos(y);
		matrix.m22 = Math.cos(x) * Math.cos(y);

		return this.multiply(matrix);
	},

	rotateZ: function (radians) {
		var matrix = new Matrix3D();
		matrix.m00 = Math.cos(radians);
		matrix.m01 = -Math.sin(radians);
		matrix.m10 = Math.sin(radians);
		matrix.m11 = Math.cos(radians);
	},

	translate: function (x, y, z) {
		var matrix = new Matrix3D();
		matrix.m30 = x;
		matrix.m31 = y;
		matrix.m32 = z;

		return this.multiply(matrix);
	},

	//var w = 1 / ((((x * this.m03) + (y * this.m13)) + (z * this.m23)) + this.m33);

	//		return new Point3D(
	//				((((x * this.m00) + (y * this.m10)) + (z * this.m20)) + this.m30) * w,
	//				((((x * this.m01) + (y * this.m11)) + (z * this.m21)) + this.m31) * w,
	//				((((x * this.m02) + (y * this.m12)) + (z * this.m22)) + this.m32) * w
	//			);
	transform: function (point) {
		var x = point.x;
		var y = point.y;
		var z = point.z;

		return {
			x: ((((x * this.m00) + (y * this.m10)) + (z * this.m20)) + this.m30),
			y: ((((x * this.m01) + (y * this.m11)) + (z * this.m21)) + this.m31),
			z: ((((x * this.m02) + (y * this.m12)) + (z * this.m22)) + this.m32)
		};
	},

	inverse: function () {
		var inv = new Matrix3D()
		var det;
		var i;

		inv.m00 = this.m11 * this.m22 * this.m33 - this.m11 * this.m23 * this.m32 - this.m21 * this.m12 * this.m33
		+ this.m21 * this.m13 * this.m32 + this.m31 * this.m12 * this.m23 - this.m31 * this.m13 * this.m22;
		inv.m10 = -this.m10 * this.m22 * this.m33 + this.m10 * this.m23 * this.m32 + this.m20 * this.m12 * this.m33
		- this.m20 * this.m13 * this.m32 - this.m30 * this.m12 * this.m23 + this.m30 * this.m13 * this.m22;
		inv.m20 = this.m10 * this.m21 * this.m33 - this.m10 * this.m23 * this.m31 - this.m20 * this.m11 * this.m33
		+ this.m20 * this.m13 * this.m31 + this.m30 * this.m11 * this.m23 - this.m30 * this.m13 * this.m21;
		inv.m30 = -this.m10 * this.m21 * this.m32 + this.m10 * this.m22 * this.m31 + this.m20 * this.m11 * this.m32
		- this.m20 * this.m12 * this.m31 - this.m30 * this.m11 * this.m22 + this.m30 * this.m12 * this.m21;
		inv.m01 = -this.m01 * this.m22 * this.m33 + this.m01 * this.m23 * this.m32 + this.m21 * this.m02 * this.m33
		- this.m21 * this.m03 * this.m32 - this.m31 * this.m02 * this.m23 + this.m31 * this.m03 * this.m22;
		inv.m11 = this.m00 * this.m22 * this.m33 - this.m00 * this.m23 * this.m32 - this.m20 * this.m02 * this.m33
		+ this.m20 * this.m03 * this.m32 + this.m30 * this.m02 * this.m23 - this.m30 * this.m03 * this.m22;
		inv.m21 = -this.m00 * this.m21 * this.m33 + this.m00 * this.m23 * this.m31 + this.m20 * this.m01 * this.m33
		- this.m20 * this.m03 * this.m31 - this.m30 * this.m01 * this.m23 + this.m30 * this.m03 * this.m21;
		inv.m31 = this.m00 * this.m21 * this.m32 - this.m00 * this.m22 * this.m31 - this.m20 * this.m01 * this.m32
		+ this.m20 * this.m02 * this.m31 + this.m30 * this.m01 * this.m22 - this.m30 * this.m02 * this.m21;
		inv.m02 = this.m01 * this.m12 * this.m33 - this.m01 * this.m13 * this.m32 - this.m11 * this.m02 * this.m33
		+ this.m11 * this.m03 * this.m32 + this.m31 * this.m02 * this.m13 - this.m31 * this.m03 * this.m12;
		inv.m12 = -this.m00 * this.m12 * this.m33 + this.m00 * this.m13 * this.m32 + this.m10 * this.m02 * this.m33
		- this.m10 * this.m03 * this.m32 - this.m30 * this.m02 * this.m13 + this.m30 * this.m03 * this.m12;
		inv.m22 = this.m00 * this.m11 * this.m33 - this.m00 * this.m13 * this.m31 - this.m10 * this.m01 * this.m33
		+ this.m10 * this.m03 * this.m31 + this.m30 * this.m01 * this.m13 - this.m30 * this.m03 * this.m11;
		inv.m32 = -this.m00 * this.m11 * this.m32 + this.m00 * this.m12 * this.m31 + this.m10 * this.m01 * this.m32
		- this.m10 * this.m02 * this.m31 - this.m30 * this.m01 * this.m12 + this.m30 * this.m02 * this.m11;
		inv.m03 = -this.m01 * this.m12 * this.m23 + this.m01 * this.m13 * this.m22 + this.m11 * this.m02 * this.m23
		- this.m11 * this.m03 * this.m22 - this.m21 * this.m02 * this.m13 + this.m21 * this.m03 * this.m12;
		inv.m13 = this.m00 * this.m12 * this.m23 - this.m00 * this.m13 * this.m22 - this.m10 * this.m02 * this.m23
		+ this.m10 * this.m03 * this.m22 + this.m20 * this.m02 * this.m13 - this.m20 * this.m03 * this.m12;
		inv.m23 = -this.m00 * this.m11 * this.m23 + this.m00 * this.m13 * this.m21 + this.m10 * this.m01 * this.m23
		- this.m10 * this.m03 * this.m21 - this.m20 * this.m01 * this.m13 + this.m20 * this.m03 * this.m11;
		inv.m33 = this.m00 * this.m11 * this.m22 - this.m00 * this.m12 * this.m21 - this.m10 * this.m01 * this.m22
		+ this.m10 * this.m02 * this.m21 + this.m20 * this.m01 * this.m12 - this.m20 * this.m02 * this.m11;

		det = this.m00 * inv.m00 + this.m01 * inv.m10 + this.m02 * inv.m20 + this.m03 * inv.m30;
		if (det == 0)
			return null;

		det = 1.0 / det;

		inv.m00 = inv.m00 * det;
		inv.m01 = inv.m01 * det;
		inv.m02 = inv.m02 * det;
		inv.m03 = inv.m03 * det;
		inv.m10 = inv.m10 * det;
		inv.m11 = inv.m11 * det;
		inv.m12 = inv.m12 * det;
		inv.m13 = inv.m13 * det;
		inv.m20 = inv.m20 * det;
		inv.m21 = inv.m21 * det;
		inv.m22 = inv.m22 * det;
		inv.m23 = inv.m23 * det;
		inv.m30 = inv.m30 * det;
		inv.m31 = inv.m31 * det;
		inv.m32 = inv.m32 * det;
		inv.m33 = inv.m33 * det;

		return inv;
	}
}

Matrix3D.multiply = function (a, b, c) {
	var c = new Matrix3D();

	c.m00 = a.m00 * b.m00 + a.m01 * b.m10 + a.m02 * b.m20 + a.m03 * b.m30;
	c.m01 = a.m00 * b.m01 + a.m01 * b.m11 + a.m02 * b.m21 + a.m03 * b.m31;
	c.m02 = a.m00 * b.m02 + a.m01 * b.m12 + a.m02 * b.m22 + a.m03 * b.m32;
	c.m03 = a.m00 * b.m03 + a.m01 * b.m13 + a.m02 * b.m23 + a.m03 * b.m33;
	c.m10 = a.m10 * b.m00 + a.m11 * b.m10 + a.m12 * b.m20 + a.m13 * b.m30;
	c.m11 = a.m10 * b.m01 + a.m11 * b.m11 + a.m12 * b.m21 + a.m13 * b.m31;
	c.m12 = a.m10 * b.m02 + a.m11 * b.m12 + a.m12 * b.m22 + a.m13 * b.m32;
	c.m13 = a.m10 * b.m03 + a.m11 * b.m13 + a.m12 * b.m23 + a.m13 * b.m33;
	c.m20 = a.m20 * b.m00 + a.m21 * b.m10 + a.m22 * b.m20 + a.m23 * b.m30;
	c.m21 = a.m20 * b.m01 + a.m21 * b.m11 + a.m22 * b.m21 + a.m23 * b.m31;
	c.m22 = a.m20 * b.m02 + a.m21 * b.m12 + a.m22 * b.m22 + a.m23 * b.m32;
	c.m23 = a.m20 * b.m03 + a.m21 * b.m13 + a.m22 * b.m23 + a.m23 * b.m33;
	c.m30 = a.m30 * b.m00 + a.m31 * b.m10 + a.m32 * b.m20 + a.m33 * b.m30;
	c.m31 = a.m30 * b.m01 + a.m31 * b.m11 + a.m32 * b.m21 + a.m33 * b.m31;
	c.m32 = a.m30 * b.m02 + a.m31 * b.m12 + a.m32 * b.m22 + a.m33 * b.m32;
	c.m33 = a.m30 * b.m03 + a.m31 * b.m13 + a.m32 * b.m23 + a.m33 * b.m33;

	return c;
}

Matrix3D.rotateZ = function (angle) {
	var matrix = new Matrix3D();
	matrix.m00 = Math.cos(angle);
	matrix.m01 = -Math.sin(angle);
	matrix.m10 = Math.sin(angle);
	matrix.m11 = Math.cos(angle);

	return matrix;
}

Matrix3D.rotateY = function (angle) {
	var matrix = new Matrix3D();
	matrix.m00 = Math.cos(angle);
	matrix.m02 = Math.sin(angle);
	matrix.m20 = -Math.sin(angle);
	matrix.m22 = Math.cos(angle);

	return matrix;
}

Matrix3D.rotateX = function (radians) {
	var matrix = new Matrix3D();
	matrix.m11 = Math.cos(radians);
	matrix.m12 = -Math.sin(radians);
	matrix.m21 = Math.sin(radians);
	matrix.m22 = Math.cos(radians);

	return matrix;
}

Matrix3D.translate = function (x, y, z) {
	var matrix = new Matrix3D();
	matrix.m30 = x;
	matrix.m31 = y;
	matrix.m32 = z;

	return matrix;
}

Matrix3D.dtor = function(degrees) {
	return degrees / 180 * Math.PI;
}

Point3D = function (x, y, z) {
	this.x = x;
	this.y = y;
	this.z = z;
}

Point3D.prototype = {
	cross: function (b) {
		var result = new Point3D(
			(this.y * b.z) - (this.z * b.y),
			(this.z * b.x) - (this.x * b.z),
			(this.x * b.y) - (this.y * b.x)
		);

		return result;
	},

	dot: function (b) {
		return (this.x * b.x) + (this.y * b.y) + (this.z * b.z);
	},

	sub: function (b) {
		return new Point3D(this.x - b.x, this.y - b.y, this.z - b.z);
	},

	add: function (b) {
		return new Point3D(this.x + b.x, this.y + b.y, this.z + b.z);
	},

	mul: function (scalar) {
		return new Point3D(this.x * scalar, this.y * scalar, this.z * scalar);
	},

	length: function () {
		return Math.sqrt((this.x * this.x) + (this.y * this.y) + (this.z * this.z));
	},

	normalize: function () {
		var normal = new Point3D();
		var length = this.length();

		normal.x = this.x / length;
		normal.y = this.y / length;
		normal.z = this.z / length;

		return normal;
	}
}

Point3D.normalize = function (point) {
	var length = Math.sqrt((point.x * point.x) + (point.y * point.y) + (point.z * point.z));

	return {
		x: point.x / length,
		y: point.y / length,
		z: point.z / length
	}
}