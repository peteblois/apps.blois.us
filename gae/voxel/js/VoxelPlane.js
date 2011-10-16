Plane = function (width, height) {
	this.width = width;
	this.height = height;

	this.points = new Array();
	this.points.push(new Point3D(0, 0, 0));
	this.points.push(new Point3D(this.width, 0, 0));
	this.points.push(new Point3D(this.width, this.height, 0));
	this.points.push(new Point3D(0, this.height, 0));
	this.points.push(new Point3D(0, 0, 0));


	this.matrix = new Matrix3D();

	var u = this.points[1].sub(this.points[0]);
	var v = this.points[2].sub(this.points[0]);

	this.n = u.cross(v);
}

Plane.prototype = {
	draw: function (context, matrix, color) {

		matrix = this.matrix.multiply(matrix);

		var normal = Point3D.normalize(matrix.transform(this.n));

		context.fillStyle = this.colorize(color, normal);

		for (var i = 0; i < this.points.length; ++i) {
			var point = matrix.transform(this.points[i]);

			if (i == 0) {
				context.moveTo(point.x, point.y);
				context.beginPath();
			}
			else
				context.lineTo(point.x, point.y);
		}

		context.closePath();
		context.fill();
	},

	apply: function (matrix) {
		this.matrix = matrix;

		return this;
	},

	updateDepth: function (matrix) {
		this.depth = this.matrix.multiply(matrix).transform(new Point3D(this.width / 2, this.height / 2, 0)).z
	},

	colorize: function (color, normal) {
		//var newColor = { h: color.h, l: color.l, s: color.s, a: color.a };
		//newColor.l = Math.abs(normal.z) * color.l;
		//return ColorUtils.rgbaToHex(ColorUtils.hlsToRgb2(newColor));
		var newColor = ColorUtils.hlsToRgb2(color);
		newColor.r = newColor.r * Math.abs(normal.z);
		newColor.g = newColor.g * Math.abs(normal.z);
		newColor.b = newColor.b * Math.abs(normal.z);
		return ColorUtils.rgbaToHex(newColor);
	}
}