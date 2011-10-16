Voxel = function (layer) {
	this.layer = layer;

	this.size = Voxel.size;

	this.transform = new Transform();

	this.color({ h: 0, l: .9, s: 0 });
	this.originalColor = this.color();

	this.setVisible(false);

	this.depth = 0;
}

Voxel.size = 25;

Voxel.prototype = {

	updateDepth: function (matrix) {
		var point = this.transform.matrix().transform({ x: this.size / 2, y: this.size / 2, z: 0 });
		this.depth = matrix.transform(point).z;

		//this.depth = this.transform.matrix().multiply(matrix).transform(new Point3D(this.size / 2, this.size / 2, 0)).z
	},

	draw: function (context, matrix) {
		if (this._opacity == 0)
			return;

		//matrix = this.transform.matrix().multiply(matrix);
		//var point = matrix.transform({x:0, y:0, z:0});

		var point = this.transform.matrix().transform({ x: 0, y: 0, z: 0 });
		point = matrix.transform(point);
		//var point = matrix.transform({x:0, y:0, z:0});

		// Store the image offset for doing hit-testing later.
		this.hitOffset = { x: point.x - this.renderer.canvas.width / 2, y: point.y - this.renderer.canvas.height / 2, z: 0 };

		context.globalAlpha = this._opacity;

		context.drawImage(this.renderer.getRendering(), this.hitOffset.x, this.hitOffset.y);

		// For testing non-cached rendering.
		//this.renderer.drawAt(context, this.hitOffset);
	},

	updateHitTesting: function (matrix) {
		//matrix = this.transform.matrix().multiply(matrix);
		//var point = matrix.transform(new Point3D(0, 0, 0));

		var point = this.transform.matrix().transform({ x: 0, y: 0, z: 0 });
		point = matrix.transform(point);

		// Store the image offset for doing hit-testing later.
		this.hitOffset = new Point3D(point.x - this.renderer.canvas.width / 2, point.y - this.renderer.canvas.height / 2, 0);
	},

	hitTest: function (point) {
		var translated = new Point3D(point.x - this.hitOffset.x, point.y - this.hitOffset.y, 0);

		return this.renderer.hitTest(translated);
	},

	preview: function (mode) {

		this.originalColor = this.color();
		if (mode.isVisible == true) {
			this.opacity(.75);
			this.color(mode.color);
		}
		else
			this.opacity(.25);
	},

	cancelPreview: function () {
		if (this.isVisible)
			this.opacity(1);
		else
			this.opacity(0);
		this.color(this.originalColor);
	},

	applyMode: function (mode) {
		this.originalColor = mode.color;
		this.setVisible(mode.isVisible);
		this.color(mode.color);
	},

	_color: { h: 0, l: .9, s: 0 },
	color: function (color) {
		if (color != undefined) {
			this._color = color;

			this.renderer = this.layer.voxelCache.getRenderer(color);

			this.invalidate();
		}
		return this._color;
	},

	_opacity: 1,
	opacity: function (opacity) {
		if (opacity != undefined) {
			this._opacity = opacity;

			this.invalidate();
		}
		return this._opacity;
	},

	//	setOpacity: function (opacity) {
	//		this.opacity = opacity;

	//		this.invalidate();
	//	},

	setVisible: function (visibility) {
		this.isVisible = visibility;

		if (this.isVisible == true)
			this.opacity(1);
		else
			this.opacity(0);
	},

	invalidate: function () {
		this.layer.invalidate();
	}
}