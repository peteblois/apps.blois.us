VoxelMiniView = function (editor, container) {
	this.editor = editor;

	this.canvas = document.createElement('canvas');

	$('#voxelMiniView').append(this.canvas);

	this.canvas.height = 200;
	this.canvas.width = 200;

	this.context = this.canvas.getContext('2d');
	this.context.mozImageSmoothingEnabled = false;

	window.setInterval($.proxy(this.handleTimer, this), 500);

	this.isDirty = false;
}

VoxelMiniView.prototype = {
	redraw: function () {
		this.isDirty = true;
	},

	handleTimer: function () {
		if (!this.isDirty)
			return;

		this.isDirty = false;

		this.context.clearRect(0, 0, this.canvas.width, this.canvas.height);

		this.context.save();
		this.context.scale(.3, .3);
		for (var i = 0; i < this.editor.layers.length; ++i) {
			var canvas = this.editor.layers[i].canvas;
			this.context.drawImage(canvas, 0, 0, canvas.width, canvas.height);
		}

		this.context.restore();
	}
}