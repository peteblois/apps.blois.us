VoxelEditor = function () {

	this.colorPicker = new ColorPicker();
	$(this.colorPicker).bind('selectionChanged', $.proxy(this.colorChanged, this));
	this.currentColor = this.colorPicker.currentColor;

	this.voxelCache = new VoxelCache();
	this.voxelCache.colorPicker = this.colorPicker;

	$('#saveButton').bind('click', $.proxy(this.save, this));
	$('#newButton').bind('click', $.proxy(this.createNew, this));
	$('#restoreButton').bind('click', $.proxy(this.restore, this));
	$('#browseButton').bind('click', $.proxy(this.browse, this));
	$('#testSpeed').bind('click', $.proxy(this.testSpeed, this));

	this.container = $('#container3D');


	
	this.slider = new Slider(document.getElementById('layerSlider'));
	$(this.slider).bind('valueChanged', $.proxy(this.layerChanged, this));
	this.slider.max(VoxelEditor.layerCount - 1);
	
	$('#layerUp').css('visibility', this.slider.value() == this.slider.max() ? 'hidden' : 'visible');
	$('#layerDown').css('visibility', this.slider.value() == this.slider.min() ? 'hidden' : 'visible');

	this.miniView = new VoxelMiniView(this);

	this.mousemoveHandler = $.proxy(this.mousemove, this);
	this.mouseupHandler = $.proxy(this.mouseup, this);

	this.container.mousedown($.proxy(this.mousedown, this));
	this.container.bind('mousemove', this.mousemoveHandler);

	this.container.bind('touchstart', $.proxy(this.touchStart, this));
	this.container.bind('touchmove', $.proxy(this.touchMove, this));
	this.container.bind('touchend', $.proxy(this.touchEnd, this));
	this.container.mousewheel($.proxy(this.mouseWheel, this));

	this.container.css('width', this.width);
	this.container.css('height', this.height);

	this.layerGrid = new LayerGrid(this.xCount, this.yCount, this.layerWidth, this.layerHeight);
	this.container.append(this.layerGrid.canvas);

	this.layerGrid.transform.translate({ x: VoxelEditor.xOffset, y: VoxelEditor.yOffset, z: 0 });

	this.layers = new Array();

	this.cleanup();

	if (!window.localStorage || !window.localStorage.getItem('voxel'))
		this.createDefault();
	else
		this.restore();

	this.rotateY(Matrix3D.dtor(45));
	this.rotateX(Matrix3D.dtor(30));

	this.updateTransform();

	this.redraw();


	this.drawMode = null;
	this.isRotating = false;

	this.browser = new DrawingBrowser(this);
	this.saveDialog = new SaveDialog(this);

	var options = {};
	if (window.location.hash.length > 1) {
		var params = window.location.hash.substr(1).split(';');
		
		for (var i = 0; i < params.length; ++i) {
			var split = params[i].split('=');
			options[split[0]] = split[1];
		}
	}

	if (options['id'])
		this.browser.open(options['id']);
	else if (options['browse'])
		this.browseMode();
}

VoxelEditor.xOffset = 110;
VoxelEditor.yOffset = 145;
VoxelEditor.layerCount = 16;
VoxelEditor.preventNormalStartup = false;

VoxelEditor.prototype = {
	layerWidth: 600,
	layerHeight: 685,
	xCount: 16,
	yCount: 16,

	createDefault: function () {

		for (var i = VoxelEditor.layerCount - 1; i >= 0; --i) {
			var layer = new VoxelLayer(this.voxelCache, this.xCount, this.yCount, this.layerWidth, this.layerHeight, i);
			this.layers.push(layer);
			layer.makeInactive();

			layer.transform.translate({ x: VoxelEditor.xOffset, y: Voxel.size * i + VoxelEditor.yOffset, z: 0 });

			this.container.append(layer.canvas);
		}

		this.setLayer(0);
	},

	mousedown: function (e) {

		var offset = $(this.container).offset();
		var mousePosition = new Point3D(e.pageX - offset.left, e.pageY - offset.top, 0);

		this.onMouseDown(mousePosition);

		e.preventDefault();
	},

	touchStart: function (event) {
		var touch = event.touches[0];

		var offset = $(this.container).offset();
		var mousePosition = new Point3D(touch.pageX - offset.left, touch.pageY - offset.top, 0);

		this.onMouseDown(mousePosition);

		event.preventDefault();
	},

	onMouseDown: function (point) {
		this.mouseDownX = point.x;
		this.mouseDownY = point.y;

		$(document.body).bind('mousemove', this.mousemoveHandler);
		$(document.body).bind('mouseup', this.mouseupHandler);

		var hitVoxel = this.hitTest(point);
		if (hitVoxel != null) {

			this.isRotating = false;

			if (ColorUtils.compareHls(this.currentColor, hitVoxel.originalColor)) {
				this.drawMode = {
					color: this.currentColor,
					isVisible: !hitVoxel.isVisible
				};
			}
			else {
				this.drawMode = {
					color: this.currentColor,
					isVisible: true
				};
			}

			hitVoxel.applyMode(this.drawMode);
			this.colorPicker.addRecent(this.drawMode.color);
			this.mouseOverVoxel = null;
		}
		else {
			this.isRotating = true;
		}

		this.isMouseDown = true;

		this.redraw();
	},

	mouseup: function (event) {
		this.onMouseUp();

		$(document.body).unbind('mousemove');
		$(document.body).unbind('mouseup');
	},

	touchEnd: function (event) {
		this.onMouseUp();
	},

	onMouseUp: function () {
		this.isMouseDown = false;
		this.isRotating = false;
		this.drawMode = null;
	},

	mousemove: function (e) {
		var offset = $(this.container).offset();
		var mousePosition = new Point3D(e.pageX - offset.left, e.pageY - offset.top, 0);
		this.onMouseMove(mousePosition);

		e.preventDefault();
	},

	touchMove: function (event) {
		var touch = event.touches[0];

		var offset = $(this.container).offset();
		var mousePosition = new Point3D(touch.pageX - offset.left, touch.pageY - offset.top, 0);

		this.onMouseMove(mousePosition);

		event.preventDefault();
	},

	mouseOverVoxel: null,
	onMouseMove: function (point) {

		if (this.isRotating) {
			var deltaX = point.x - this.mouseDownX;
			var deltaY = point.y - this.mouseDownY;
			this.mouseDownX = point.x;
			this.mouseDownY = point.y;

			var rotY = this.rotateY();
			rotY -= deltaX * .01;
			if (rotY < 0)
				rotY += Math.PI * 2;
			else if (rotY > Math.PI * 2)
				rotY -= Math.PI * 2;

			this.rotateY(rotY);

			var rotX = this.rotateX();
			rotX += deltaY * .01;
			rotX = Math.max(Math.min(rotX, Matrix3D.dtor(90)), Matrix3D.dtor(0));
			this.rotateX(rotX);


			this.updateTransform();
			this.redraw();
		}
		else {
			var voxel = this.hitTest(point);
			if (voxel != this.mouseOverVoxel) {
				if (this.mouseOverVoxel != null)
					this.mouseOverVoxel.cancelPreview();

				this.mouseOverVoxel = voxel;

				if (this.mouseOverVoxel != null) {
					if (this.drawMode != null) {
						this.mouseOverVoxel.applyMode(this.drawMode);
						this.colorPicker.addRecent(this.drawMode.color);
					}
					else {
						var drawMode = {
							color: this.currentColor,
							isVisible: !this.mouseOverVoxel.isVisible
						};

						if (!ColorUtils.compareHls(this.currentColor, this.mouseOverVoxel.originalColor)) {
							drawMode.isVisible = true;
						}

						this.mouseOverVoxel.preview(drawMode);
					}
				}
			}
			this.redraw();
		}

		if (this.drawMode != null && this.mouseOverVoxel != null) {
		}
	},
	eventCount:0,
	mouseWheel: function (event, delta) {
		++this.eventCount;
		// getting double events on Chrome.
		if (!$.browser.webkit || (this.eventCount % 2 == 0)) {
			if (delta > 0)
				this.setLayer(this.layerIndex + 1);
			else
				this.setLayer(this.layerIndex - 1);
		}
		event.preventDefault();
	},

	colorChanged: function (event) {
		this.currentColor = event.currentTarget.currentColor;
	},

	rotateX: function (radians) {
		if (radians != undefined) {
			this.voxelCache.transform.rotateX(radians);
			this.layerGrid.transform.rotateX(radians);

			for (var i = 0; i < this.layers.length; ++i)
				this.layers[i].transform.rotateX(radians);
		}
		return this.voxelCache.transform.rotateX();
	},

	rotateY: function (radians) {
		if (radians != undefined) {
			this.voxelCache.transform.rotateY(radians);
			this.layerGrid.transform.rotateY(radians);

			for (var i = 0; i < this.layers.length; ++i)
				this.layers[i].transform.rotateY(radians);
		}
		return this.voxelCache.transform.rotateY();
	},

	hitTest: function (point) {
		var hitVoxel = this.currentLayer.hitTest(point);
		return hitVoxel;
	},

	updateTransform: function () {
		for (var i = 0; i < this.layers.length; ++i)
			this.layers[i].updateTransform();

		if (this.currentLayer != null)
			this.currentLayer.updateHitTesting();

		this.layerGrid.updateTransform();

		this.voxelCache.draw();
	},

	redraw: function () {

		for (var i = 0; i < this.layers.length; ++i)
			this.layers[i].draw();

		this.miniView.redraw();
		this.layerGrid.draw();
	},

	layerChanged: function (event, ui) {
		//this.setLayer(ui.value);
		this.setLayer(this.slider.value());

		$('#layerUp').css('visibility', this.slider.value() == this.slider.max() ? 'hidden' : 'visible');
		$('#layerDown').css('visibility', this.slider.value() == this.slider.min() ? 'hidden' : 'visible');
	},

	setLayer: function (index) {
		index = Math.min(Math.max(index, 0), this.layers.length - 1);

		$(this.layerGrid.canvas).detach();

		for (var i = 0; i < this.layers.length; ++i) {
			var layer = this.layers[i];

			var parent = $(layer.canvas).parent();
			if (i > index) {
				$(layer.canvas).detach();
			}
			else if (parent.length == 0) {
				this.container.append(layer.canvas);
			}
		}

		if (this.currentLayer != null) {
			this.currentLayer.drawGrid = false;
			this.currentLayer.invalidate();
			this.currentLayer.makeInactive();
		}

		this.layerIndex = index;
		this.currentLayer = this.layers[this.layerIndex];

		$(this.currentLayer.canvas).before(this.layerGrid.canvas)

		this.slider.value(index);

		this.currentLayer.invalidate();
		this.currentLayer.makeActive();

		this.layerGrid.index = this.layerIndex;

		this.layerGrid.updateTransform();
		this.layerGrid.invalidate();


		this.redraw();
	},

	createNew: function () {
		_gaq.push(['_trackEvent', 'document', 'new']);

		this.cleanup();
		this.createDefault();
		this.editMode();

		this.rotateX(this.rotateX());
		this.rotateY(this.rotateY());

		this.updateTransform();

		this.redraw();
	},

	save: function () {
		var data = new VoxelEditorData();
		for (var i = 0; i < this.layers.length; ++i) {
			var layerData = new VoxelLayerData(this.layers[i]);
			data.layers.push(layerData);
		};

		this.currentDrawing.drawing_data = JSON.stringify(data);
		this.currentDrawing.drawing_image = this.miniView.canvas.toDataURL('image/png');

		this.saveDialog.show(this.currentDrawing);
	},

	load: function (drawing) {
		this.cleanup();

		this.currentDrawing = drawing;
		window.location.hash = "#id=" + drawing.drawing_id;

		var drawingDataString = drawing.drawing_data;
		var data = JSON.parse(drawingDataString);

		for (var i = data.layers.length - 1; i >= 0; --i) {
			var layerData = data.layers[data.layers.length - i - 1];

			var yCount = layerData.voxels.length;
			var xCount = layerData.voxels[0].length;

			var layer = new VoxelLayer(this.voxelCache, xCount, yCount, this.layerWidth, this.layerHeight, i);
			this.layers.push(layer);

			for (var y = 0; y < yCount; ++y) {
				for (var x = 0; x < xCount; ++x) {
					layer.voxelItems[y][x].color(layerData.voxels[y][x].color);
					layer.voxelItems[y][x].setVisible(layerData.voxels[y][x].isVisible);
					if (layer.voxelItems[y][x].isVisible)
						this.colorPicker.addRecent(layerData.voxels[y][x].color);
				}
			}

			layer.makeInactive();

			this.container.append(layer.canvas);

			layer.makeInactive();
		}

		this.slider.max(data.layers.length - 1);

		this.setLayer(this.layers.length - 1);

		this.rotateX(this.rotateX());
		this.rotateY(this.rotateY());

		this.updateTransform();

		this.redraw();
	},

	cleanup: function () {
		while (this.layers.length > 0) {
			var layer = this.layers.pop();
			$(layer.canvas).detach();
		}

		this.colorPicker.clearRecents();
		this.currentDrawing = {
			drawing_name: '',
			drawing_author: '',
		};
	},

	show: function () {
		$('#editor').removeClass('drawingsCollapsed');
	},

	hide: function () {
		$('#editor').addClass('drawingsCollapsed');
	},

	browsing: false,
	browse: function () {
		if (!this.browsing)
			this.browseMode();
		else
			this.editMode();
	},

	browseMode: function () {
		this.browsing = true;
		window.location.hash = "#browse=true";
		this.hide();
		this.browser.show();
	},

	editMode: function () {
		this.browsing = false;
		this.show();
		this.browser.hide();
	},

	testSpeed: function() {
		var start = (new Date).getTime();

		for (var i = 0; i < 100; ++i) {
			var rotY = this.rotateY();
			rotY += .01;
			this.rotateY(rotY);


			this.updateTransform();
			this.redraw();
		}

		delta = (new Date).getTime() - start;

		var msPerFrame = delta / 100;
		var fps = 1000 / msPerFrame;
		//alert(fps + 'fps');
	}
}

var isCSSFlexBoxSupported = (function() {
  var docEl = document.documentElement, s;
  if (docEl && (s = docEl.style)) {
      return typeof s.boxAlign == "string" 
        || typeof s.MozBoxAlign == "string" 
        || typeof s.WebkitBoxAlign == "string" 
        || typeof s.KhtmlBoxAlign == "string"
		|| typeof s.MsBoxAlign == "string";
  }
  return false;
})();

$(document).ready(function () {
	if (!VoxelEditor.preventNormalStartup) {
		if (!isCSSFlexBoxSupported) {
			var link = document.createElement('link');
			link.href = 'ColorPicker.ie.css';
			link.rel = 'stylesheet';
			link.type = 'text/css';
			document.getElementsByTagName('head')[0].appendChild(link);
		}
		$('.svg').applySVG();
		new VoxelEditor();
	}
});

function jsonCallback(fn) {
	var index = 0;
	while (window['jsonCallback' + index] != undefined)
		++index;

	window['jsonCallback' + index] = function () {
		eval('delete window.jsonCallback' + index);
		fn(arguments);
	}
}