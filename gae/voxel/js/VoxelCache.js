/*
Cache of all Voxels, by color.

The voxel gets rendered once per color, then each instance of it just blits
the rendered voxel when needed.
*/
VoxelCache = function () {
	this.transform = new Transform();

	this.transform.center = new Point3D(Voxel.size, Voxel.size, Voxel.size);

	this.geometry = new VoxelGeometry();

	this.renderers = new Array();
	this.colorCache = {};

};

VoxelCache.currentRenderData = null;

VoxelCache.prototype = {

	draw: function () {
		this.geometry.transform.rotateX(this.transform.rotateX());
		this.geometry.transform.rotateY(this.transform.rotateY());
		VoxelCache.currentRender = null;
		this.geometry.update();

		for (var i = 0; i < this.renderers.length; ++i)
			this.renderers[i].invalidate();
	},

	getRenderer: function (hls) {
		var colorKey = ColorUtils.rgbaToHex(ColorUtils.hlsToRgb2(hls));
		var renderer = this.colorCache[colorKey];

		if (renderer != undefined)
			return renderer;

		renderer = new VoxelRenderer(this.geometry, hls);
		this.colorCache[colorKey] = renderer;
		this.renderers.push(renderer);

		return renderer;
	}
}