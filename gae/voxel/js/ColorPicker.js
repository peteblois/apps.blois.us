ColorPicker = function () {
	this.currentColor = { h: 0, l: .9, s: 0 };

	this.recents = new Array();

	$('.swatchPreview').css('background', ColorUtils.rgbaToHex(ColorUtils.hlsToRgb2(this.currentColor)));

	this.load();
}

ColorPicker.prototype = {
	load: function () {

		var colorPicker = this;
		$.ajax({
			url: '/voxel/Kuler.xml',
			async: true,
			success: function (msg) {

				$('[nodeName=kuler:themeItem]', msg).each(function () {

					var themeDiv = $('<div></div>').addClass('theme');
					$('#kuler').append(themeDiv);

					var swatches = $(this).find('[nodeName=kuler:swatch]');
					for (var i = 0; i < swatches.length; ++i) {
						var swatch = $(swatches[i]).find('[nodeName=kuler:swatchHexColor]')[0];
						var swatchColor = swatch.textContent ? swatch.textContent : swatch.text;

						var swatchDiv = $('<div></div>').addClass('swatch');
						swatchDiv.css('background', '#' + swatchColor);

						var rgb = new RGBColor('#' + swatchColor);

						swatchDiv[0].hls = ColorUtils.rgbToHls2({ r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 });

						themeDiv.append(swatchDiv);
					}
				});

				colorPicker.refresh();
			}
		});
	},

	addRecent: function (hls) {
		for (var i = 0; i < this.recents.length; ++i) {
			var recent = this.recents[i];

			if (ColorUtils.compareHls(hls, recent))
				return;
		}

		this.recents.push(hls);

		var swatchDiv = $('<div></div>').addClass('swatch');

		var rgb = ColorUtils.hlsToRgb2(hls);
		var hex = ColorUtils.rgbaToHex(rgb);

		swatchDiv.css('background', hex);
		swatchDiv[0].hls = hls;

		$('#recentColors').append(swatchDiv);
		swatchDiv.bind('mousedown', $.proxy(this.handleItemClicked, this));
	},

	clearRecents: function () {
		this.recents = [];

		$('#recentColors .swatch').unbind('mousedown');
		$('#recentColors .swatch').remove();

		//this.addRecent(this.currentColor);
	},

	handleItemClicked: function (event) {

		if (this.currentItem != null) {
			this.currentItem.removeClass('selected');
			this.currentItem.parent().removeClass('themeSelected');
		}

		this.currentItem = $(event.currentTarget);
		this.currentItem.addClass('selected');
		this.currentItem.parent().addClass('themeSelected');

		this.currentColor = this.getColor(this.currentItem);
		$(this).trigger('selectionChanged');

		$('.swatchPreview').css('background', this.currentItem.css('background'));
	},

	getColor: function (element) {
		return element.attr('hls');
		var rgb = new RGBColor(element.css('background-color'));

		return ColorUtils.rgbToHls2({ r: rgb.r / 255, g: rgb.g / 255, b: rgb.b / 255 });
	},

	currentItem: null,
	refresh: function () {
		$('.swatch').unbind('mousedown');
		$('.swatch').bind('mousedown', $.proxy(this.handleItemClicked, this));
	}
}