Transform = function () {
	this.rotationX = 0;
	this.rotationY = 0;
	this.rotationZ = 0;
	this.translation = new Point3D(0, 0, 0);
	this.center = new Point3D(0, 0, 0);
}

Transform.prototype = {
	translate: function (translation) {
		if (translation != undefined) {
			this.translation.x = translation.x;
			this.translation.y = translation.y;
			this.translation.z = translation.z;

			this._matrix = null;
			this._invMatrix = null;
		}

		return this.translation;
	},

	rotateX: function (radians) {
		if (radians != undefined) {
			this.rotationX = radians;

			this._matrix = null;
			this._invMatrix = null;
		}

		return this.rotationX;
	},

	rotateY: function (radians) {
		if (radians != undefined) {
			this.rotationY = radians;

			this._matrix = null;
			this._invMatrix = null;
		}

		return this.rotationY;
	},

	rotateZ: function (radians) {
		if (radians != undefined) {
			this.rotationZ = radians;

			this._matrix = null;
			this._invMatrix = null;
		}

		return this.rotationZ;
	},

	_matrix: null,
	matrix: function () {
		if (this._matrix == null) {
			var matrix = Matrix3D.translate(-this.center.x, -this.center.y, -this.center.z);
			//matrix = matrix.multiply(Matrix3D.rotateY(this.rotationY).rotateX(this.rotationX));
			matrix = matrix.rotateXY(this.rotationX, this.rotationY);
			matrix = matrix.translate(this.center.x + this.translation.x, this.center.y + this.translation.y, this.center.z + this.translation.z);

			this._matrix = matrix;
		}

		return this._matrix;
	},

	_invMatrix: null,
	invMatrix: function () {
		if (this._invMatrix == null) {
			this._invMatrix = this.matrix().inverse();
		}
		return this._invMatrix;
	}
}