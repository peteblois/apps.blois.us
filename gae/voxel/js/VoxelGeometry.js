VoxelGeometry = function () {

	var size = Voxel.size;
	this.size = size;

	this.planes = new Array();
	this.planes.push(new Plane(size, size).apply(Matrix3D.translate(0, 0, 0)));
	this.planes.push(new Plane(size, size).apply(Matrix3D.rotateY(Matrix3D.dtor(90)).translate(0, 0, 0)));
	this.planes.push(new Plane(size, size).apply(Matrix3D.rotateY(Matrix3D.dtor(180)).translate(size, 0, size)));
	this.planes.push(new Plane(size, size).apply(Matrix3D.rotateY(Matrix3D.dtor(90)).translate(size, 0, 0)));
	this.planes.push(new Plane(size, size).apply(Matrix3D.rotateX(Matrix3D.dtor(90)).translate(0, 0, size)));
	this.planes.push(new Plane(size, size).apply(Matrix3D.rotateX(Matrix3D.dtor(90)).translate(0, size, size)));

	this.transform = new Transform();

	this.transform.translate({ x: VoxelRenderer.width / 2 - size / 2, y: VoxelRenderer.height / 2 - size / 2, z: 0 });
	//this.transform.translate({ x: VoxelRenderer.width / 2, y: VoxelRenderer.height / 2, z: 0 });
	this.transform.center = { x: size / 2, y: size / 2, z: size / 2 };
}

VoxelGeometry.prototype = {
	sortPlane: function (a, b) {
		return a.depth - b.depth;
	},

	update: function () {
		var matrix = this.transform.matrix();

		for (var i = 0; i < this.planes.length; ++i)
			this.planes[i].updateDepth(matrix);

		this.planes.sort(this.sortPlane);
	},

	draw: function (context, color) {
		for (var i = 0; i < this.planes.length; ++i)
			this.planes[i].draw(context, this.transform.matrix(), color);
	}
}