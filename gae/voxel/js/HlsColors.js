ColorUtils = {};
// from http://support.microsoft.com/kb/29240

ColorUtils.hlsToRgb2 = function (hlsColor) {
	var hue = hlsColor.h;
	var lum = hlsColor.l;
	var sat = hlsColor.s;
	var RGBMAX = 1;
	var HLSMAX = 1;
	var R, G, B;                /* RGB component values */
	var Magic1, Magic2;       /* calculated magic numbers (really!) */

	if (sat == 0) {            /* achromatic case */
		R = G = B = lum;
	}
	else {                    /* chromatic case */
		var hue = ((hue - Math.floor(hue)) * 6);

		/* set up magic numbers */
		if (lum <= .5)
			Magic2 = (lum * (1 + sat));
		else
			Magic2 = lum + sat - (lum * sat);

		Magic1 = 2 * lum - Magic2;

		/* get RGB, change units from HLSMAX to RGBMAX */
		R = ColorUtils.hueToRGB(Magic1, Magic2, hue + 2);
		G = ColorUtils.hueToRGB(Magic1, Magic2, hue);
		B = ColorUtils.hueToRGB(Magic1, Magic2, hue - 2);
	}

	return { r: R, g: G, b: B, a: hlsColor.a };
	//return (RGB(R, G, B));
}

ColorUtils.rgbToHls2 = function (rgbColor) {
	var R = rgbColor.r;
	var G = rgbColor.g;
	var B = rgbColor.b;
	var HLSMAX = 1;
	var RGBMAX = 1;
	var H = 0;
	var L = 0;
	var S = 0;

	// calculate lightness
	var cMax = Math.max(Math.max(R, G), B);
	var cMin = Math.min(Math.min(R, G), B);
	L = (cMax + cMin) / 2;

	if (cMax == cMin) {           // r=g=b --> achromatic case
		S = 0;                     // saturation
	}
	else {                        // chromatic case
		// saturation
		if (L <= (HLSMAX / 2))
			S = (((cMax - cMin) * HLSMAX) + ((cMax + cMin) / 2)) / (cMax + cMin);
		else
			S = (((cMax - cMin) * HLSMAX) + ((2 * RGBMAX - cMax - cMin) / 2))
               / (2 * RGBMAX - cMax - cMin);

		// hue
		var Rdelta = (((cMax - R) * (HLSMAX / 6)) + ((cMax - cMin) / 2)) / (cMax - cMin);
		var Gdelta = (((cMax - G) * (HLSMAX / 6)) + ((cMax - cMin) / 2)) / (cMax - cMin);
		var Bdelta = (((cMax - B) * (HLSMAX / 6)) + ((cMax - cMin) / 2)) / (cMax - cMin);

		if (R == cMax)
			H = Bdelta - Gdelta;
		else if (G == cMax)
			H = (HLSMAX / 3) + Rdelta - Bdelta;
		else // B == cMax
			H = ((2 * HLSMAX) / 3) + Gdelta - Rdelta;

		if (H < 0)
			H += HLSMAX;
		if (H > HLSMAX)
			H -= HLSMAX;
	}

	H = Math.min(1, Math.max(0, H));
	L = Math.min(1, Math.max(0, L));
	S = Math.min(1, Math.max(0, S));

	return { h: H, l: L, s: S };
}

ColorUtils.hueToRGB = function (n1, n2, hue) {
	var RGBMAX = 1;
	var HLSMAX = 1;

	/* range check: note values passed add/subtract thirds of range */
	if (hue < 0)
		hue += 6;

	if (hue > 6)
		hue -= 6;

	/* return r,g, or b value from this tridrant */
	if (hue < 1)
		return (n1 + (n2 - n1) * hue);
	if (hue < 3)
		return (n2);
	if (hue < 4)
		return (n1 + (n2 - n1) * (4 - hue));
	else
		return (n1);
}

ColorUtils.rgbaToHex = function (rgba) {
	var r = Math.floor(rgba.r * 255).toString(16);
	while (r.length < 2)
		r = '0' + r;

	var g = Math.floor(rgba.g * 255).toString(16);
	while (g.length < 2)
		g = '0' + g;

	var b = Math.floor(rgba.b * 255).toString(16);
	while (b.length < 2)
		b = '0' + b;

	var color = '#' + r + g + b;
	return color;
}

ColorUtils.compareHls = function (a, b) {
	return a.h == b.h && a.l == b.l && a.s == b.s;
}