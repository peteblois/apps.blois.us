/*
Rendering of an individual Voxel, by color.

This is used by each Voxel to stamp out instances.
*/
VoxelRenderer = function (geometry, color) {
	this.color = color;
	this.canvas = document.createElement('canvas');
	this.geometry = geometry;

	var size = Voxel.size;
	this.size = size;

	this.canvas.width = VoxelRenderer.width;
	this.canvas.height = VoxelRenderer.height;

	$(this.canvas).css('width', this.canvas.width);
	$(this.canvas).css('height', this.canvas.height);

	this.context = this.canvas.getContext('2d');

	// IE is about 10x faster rendering via an image than a Canvas, results in 2x perf improvement overall.
	this.useImageRenderer = $.browser.msie;
	if (this.useImageRenderer == true)
		this.rendering = document.createElement('img');
	else
		this.rendering = this.canvas;
}

VoxelRenderer.width = 44;
VoxelRenderer.height = 44;

VoxelRenderer.prototype = {

	invalidate: function () {
		this.isValid = false;
		this.data = null;
	},

	ensureValid: function () {

		this.isValid = true;

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
		this.context.save();

		this.geometry.draw(this.context, this.color);

		this.context.restore();

		if (this.useImageRenderer == true) {
			this.rendering.src = this.canvas.toDataURL();
		}
	},

	// For testing non-cached drawing.
	drawAt: function (context, point) {
		context.save();

		context.translate(point.x, point.y);

		this.geometry.draw(context, this.color);

		context.restore();
	},

	isValid: false,
	getRendering: function () {
		if (!this.isValid)
			this.ensureValid();
		return this.rendering;
	},

	data: null,
	hitTest: function (point) {
		if (!this.isValid)
			this.ensureValid();

		if (point.x < 0 || point.x >= this.canvas.width || point.y < 0 || point.y >= this.canvas.height)
			return false;

		if (VoxelCache.currentRenderData == null) {
			VoxelCache.currentRenderData = this.context.getImageData(0, 0, this.canvas.width, this.canvas.height);
		}

		var alpha = VoxelCache.currentRenderData.data[(Math.floor(point.y) * 4 * VoxelCache.currentRenderData.width) + (Math.floor(point.x) * 4) + 3];
		if (alpha != 0)
			return true;
		return false;
	}
}