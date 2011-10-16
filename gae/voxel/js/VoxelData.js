VoxelEditorData = function () {
	this.layers = new Array();
}

VoxelLayerData = function (layer) {
	this.voxels = new Array(layer.voxelItems.length);
	for (var y = 0; y < layer.voxelItems.length; ++y) {

		this.voxels[y] = new Array(layer.voxelItems[0].length);
		for (var x = 0; x < layer.voxelItems[0].length; ++x) {
			
			this.voxels[y][x] = new VoxelData(layer.voxelItems[y][x]);	
		}
	}
}

VoxelData = function (voxel) {
	this.color = voxel.color();
	this.isVisible = voxel.isVisible;
}