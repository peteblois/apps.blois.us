(function ($) {
	$.fn.applySVG = function () {

		return this.each(function () {
			// FF 3 and lower do not support SVG as background image.
			if ($.browser.mozilla) {
				$(document.createElement('object')).attr('data', $(this).attr('src')).attr('type', 'image/svg+xml').appendTo(this);
				$(this).css('position', 'relative');
				// put another div on top of the object to hide it from mouse input.
				// object tags screw this up.
				$(document.createElement('div'))
					.css('background', 'transparent')
					.css('width', '100%')
					.css('height', '100%')
					.css('position', 'absolute')
					.css('top', '0px')
					.css('right', '0px')
					.appendTo(this);
			}
			else {
				$(this).css('background-image', 'url(' + $(this).attr('src') + ')');
			}
		});

	};
})(jQuery);