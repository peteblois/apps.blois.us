Slider = function (element) {
	this.track = $(element).addClass('slider_track');

	this.thumb = this.track.find('.slider_thumb');
	if (this.thumb.length == 0)
		this.thumb = $(document.createElement('div')).addClass('slider_thumb');

	this.track.append(this.thumb);

	this.mouseMoveHandler = $.proxy(this.handleMouseMove, this);
	this.mouseUpHandler = $.proxy(this.handleMouseUp, this);
	//this.track.bind('mousedown', $.proxy(this.handleTrackMouseDown, this));
	this.track.bind('mousedown', $.proxy(this.handleMouseDown, this));

	this.value(this.min());
}

Slider.prototype = {
	isMouseDown: false,
	increment: 1,

	handleMouseDown: function (event) {
		this.isMouseDown = true;

		$(document).bind('mousemove', this.mouseMoveHandler);
		$(document).bind('mouseup', this.mouseUpHandler);

		this.thumb.addClass('slider_thumb_down');

		event.preventDefault();

		this.mouseY = event.pageY;

		var offset = (this.trackRange() - (event.pageY - this.track.offset().top)) / this.trackRange() * (this.max() - this.min());
		this.value(offset);

		this.downValue = this.value();
	},

	handleMouseMove: function (event) {
		var deltaY = this.mouseY - event.pageY;

		var deltaValue = (deltaY / this.trackRange()) * (this.max() - this.min());
		this.value(this.downValue + deltaValue);
	},

	// Allowable room on the track
	trackRange: function () {
		return this.track.height(); // -this.thumb.height();
	},

	_min: 0,
	min: function (value) {
		if (value != undefined) {
			this._min = value;
		}
		return this._min;
	},

	_max: 100,
	max: function (value) {
		if (value != undefined) {
			this._max = value;
		}
		return this._max;
	},

	_value: undefined,
	value: function (value) {
		if (value != undefined) {
			value = Math.min(Math.max(value, this.min()), this.max());

			value = Math.round((value - this.min()) / this.increment) * (this.increment);
			if (value != this._value) {
				this._value = value;
				var position = this.thumb.position();

				this.thumb.css('top', this.trackRange() - (this._value - this.min()) / (this.max() - this.min()) * this.trackRange() - this.thumb.height() / 2);

				$(this).trigger('valueChanged');
			}
		}
		return this._value;
	},

	handleMouseUp: function (event) {
		this.isMouseDown = false;
		this.thumb.removeClass('slider_thumb_down');

		$(document).unbind('mousemove', this.mouseMoveHandler);
		$(document).unbind('mouseup', this.mouesUpHandler);
	}
}