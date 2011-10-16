LayerGrid = function (xCount, yCount, width, height) {
	this.xCount = xCount;
	this.yCount = yCount;
	this.width = width;
	this.height = height;

	this.canvas = document.createElement('canvas');
	$(this.canvas).addClass('voxelLayer');

	this.canvas.width = width;
	this.canvas.height = height;

	$(this.canvas).css('width', width);
	$(this.canvas).css('height', height);

	this.context = this.canvas.getContext('2d');

	this.transform = new Transform();
	//this.transform.translate({ x: width / 2 - Voxel.size * xCount / 2 + Voxel.size / 2, y: height / 2, z: -Voxel.size * yCount / 2 });
	//this.transform.translate({ x: width / 2 - Voxel.size * xCount / 2 + Voxel.size / 2, y: height / 2, z: -Voxel.size * yCount / 2 });
	//this.transform.translate({ x: 0, y: 0, z: -Voxel.size * yCount / 2 });
	//this.transform.translate({ x: VoxelEditor.xOffset, y: 0, z: 0 });
	//this.transform.center = new Point3D((xCount - 1) * Voxel.size / 2, 0, (yCount - 1) * Voxel.size / 2);

	this.transform.center = new Point3D(
		(xCount - 1) * Voxel.size / 2,
		Voxel.size * (VoxelEditor.layerCount / 2 - this.index),
		(yCount - 1) * Voxel.size / 2
	);

	this.updateTransform();
	this.isDirty = true;
}

LayerGrid.prototype = {
	index: 0,

	invalidate: function () {
		this.isDirty = true;
	},

	clear: function () {
		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);
	},

	updateTransform: function () {
		this.isDirty = true;

		this.transform.translate({ x: VoxelEditor.xOffset, y: Voxel.size * (VoxelEditor.layerCount - this.index - 1) + VoxelEditor.yOffset, z: 0 });

		var x = this.transform.center.x;
		var y = this.transform.center.y;
		this.transform.center = new Point3D(
			(this.xCount - 1) * Voxel.size / 2,
			-Voxel.size * (VoxelEditor.layerCount / 2 - this.index - 1),
			(this.yCount - 1) * Voxel.size / 2
		);
	},

	draw: function () {

		if (!this.isDirty)
			return;

		this.isDirty = false;
		this.clear();
		this.context.save();

		this.context.globalAlpha = .5;
		var matrix = this.transform.matrix();


		var v2 = Voxel.size / 2;

		var topLeft = matrix.transform(new Point3D(-v2, v2, -v2));
		var topRight = matrix.transform(new Point3D(Voxel.size * this.xCount - v2, v2, -v2));
		var bottomRight = matrix.transform(new Point3D(Voxel.size * this.xCount - v2, v2, Voxel.size * this.yCount - v2));
		var bottomLeft = matrix.transform(new Point3D(-v2, v2, Voxel.size * this.yCount - v2));

		this.context.fillStyle = '#6F6F6F';
		this.context.strokeStyle = '#2F2F2F'; ;
		this.context.beginPath();
		this.context.lineTo(topLeft.x, topLeft.y);
		this.context.lineTo(topRight.x, topRight.y);
		this.context.lineTo(bottomRight.x, bottomRight.y);
		this.context.lineTo(bottomLeft.x, bottomLeft.y);
		this.context.closePath();
		this.context.fill();



		for (var x = 0; x <= this.xCount; ++x) {
			var start = matrix.transform(new Point3D(Voxel.size * x - v2, v2, -v2));
			var end = matrix.transform(new Point3D(Voxel.size * x - v2, v2, Voxel.size * this.yCount - v2));

			
			this.context.beginPath();
			this.context.lineTo(start.x, start.y);
			this.context.lineTo(end.x, end.y);
			this.context.stroke();
		}
		for (var y = 0; y <= this.yCount; ++y) {
			var start = matrix.transform(new Point3D(-v2, v2, Voxel.size * y - v2));
			var end = matrix.transform(new Point3D(Voxel.size * this.xCount - v2, v2, Voxel.size * y - v2));

			this.context.beginPath();
			this.context.lineTo(start.x, start.y);
			this.context.lineTo(end.x, end.y);
			this.context.stroke();
		}

		this.context.restore();
	}
}

