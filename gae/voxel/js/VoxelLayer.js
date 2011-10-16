VoxelLayer = function (voxelCache, xCount, yCount, width, height, index) {
	this.voxelCache = voxelCache;
	this.xCount = xCount;
	this.yCount = yCount;

	this.voxels = new Array();
	this.voxelItems = new Array(yCount);

	for (var y = 0; y < yCount; ++y) {
		this.voxelItems[y] = new Array(xCount);

		for (var x = 0; x < xCount; ++x) {
			var voxel = new Voxel(this);
			this.voxels.push(voxel);

			this.voxelItems[y][x] = voxel;

			voxel.transform.translate({ x: voxel.size * x, y: 0, z: voxel.size * y });
		}
	}

	this.allVoxels = this.voxels;

	this.transform = new Transform();

	this.transform.center = new Point3D(
		(xCount - 1) * Voxel.size / 2, 
		Voxel.size * (VoxelEditor.layerCount / 2 - index), 
		(yCount - 1) * Voxel.size / 2
	);

	this.transform.translate({ x: VoxelEditor.xOffset, y: Voxel.size * index + VoxelEditor.yOffset, z: 0 });

	this.canvas = document.createElement('canvas');
	$(this.canvas).addClass('voxelLayer');

	$(this.canvas).css('width', width);
	$(this.canvas).css('height', height);


	this.canvas.width = width;
	this.canvas.height = height;

	this.mouseOverVoxel = null;

	this.isDirty = true;

	this.context = this.canvas.getContext('2d');
	this.context.mozImageSmoothingEnabled = false;
}

VoxelLayer.prototype = {

	onMouseEnter: function (point) {
	},

	onMouseLeave: function () {
		if (this.mouseOverVoxel != null) {
			this.mouseOverVoxel.onMouseLeave();
			this.mouseOverVoxel = null;
		}
	},

	onMouseMove: function (point) {
		var newElement = this.hitTest(point);
		if (newElement != this.mouseOverVoxel) {
			if (this.mouseOverVoxel != null)
				this.mouseOverVoxel.onMouseLeave();

			this.mouseOverVoxel = newElement;

			if (this.mouseOverVoxel != null)
				this.mouseOverVoxel.onMouseEnter();
		}
		return newElement;
	},

	onMouseDown: function (point) {
		var hit = this.hitTest(point);
		if (hit)
			return hit.onMouseDown();

		return null;
	},

	sortVoxels: function (a, b) {
		return a.depth - b.depth;
	},

	invalidate: function () {
		this.isDirty = true;
	},

	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	quadrantY: -1,
	updateTransform: function () {
		var matrix = this.transform.matrix();

//		var angle = this.transform.rotateY();
//		if (angle < 0)
//			angle += (Math.PI * 2);

//		var quadrant = 3;
//		if (angle < Math.PI / 2)
//			quadrant = 0;
//		else if (angle < Math.PI)
//			quadrant = 1;
//		else if (angle < Math.PI + Math.PI / 2)
//			quadrant = 2;

//		if (quadrant != this.quadrantY) {
//			this.quadrantY = quadrant;

			for (var i = 0; i < this.voxels.length; ++i)
				this.voxels[i].updateDepth(matrix);

			this.voxels.sort(this.sortVoxels);
		//}

		this.isDirty = true;
	},

	makeInactive: function () {
		this.visibleVoxels = new Array();
		for (var i = 0; i < this.allVoxels.length; ++i) {
			if (this.allVoxels[i].isVisible)
				this.visibleVoxels.push(this.allVoxels[i]);
		}

		this.voxels = this.visibleVoxels;
	},

	makeActive: function () {
		this.voxels = this.allVoxels;
		this.quadrantY = -1;
		this.updateTransform();
		this.updateHitTesting();
	},

	draw: function () {

		if (!this.isDirty)
			return;

		this.isDirty = false;
		this.clear();
		this.context.save();

		this.context.globalAlpha = .5;
		var matrix = this.transform.matrix();

		this.context.globalAlpha = 1;

		for (var i = 0; i < this.voxels.length; ++i)
			this.voxels[i].draw(this.context, matrix);

		this.context.restore();
	},

	updateHitTesting: function () {
		var matrix = this.transform.matrix();

		for (var i = 0; i < this.voxels.length; ++i)
			this.voxels[i].updateHitTesting(matrix);
	},

	hitTest: function (point) {
		//point = this.transform.invMatrix().transform(point);
		for (var i = this.voxels.length - 1; i >= 0; --i) {
			if (this.voxels[i].hitTest(point))
				return this.voxels[i];
		}

		return null;
	}
}