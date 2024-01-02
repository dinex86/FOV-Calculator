var allGames = {
	'hfov': {
		"hFov": {
			decimals: 0,
			factor: 1
		},
		"Project CARS 1/2": {
			min: 35,
			max: 180,
			decimals: 0,
			factor: 1
		},
		"European & American Truck Simulator": {
			min: 35,
			max: 180,
			decimals: 0,
			factor: 1
		},
		"RaceRoom Racing Experience" : {
			min: 35,
			max: 180,
			decimals: 1,
			factor: 1,
		},
	},
	'hfovrad': {
		"Richard Burns Rally": {
			min: 10,
			max: 180,
			decimals: 6,
			factor: 1
		}
	},
	'hfov_base_step': {
		"F1 2016-2018": { // https://www.reddit.com/r/F1Game/comments/7x0of9/codemasters_f1_20162017_fov_slider/
			min: -1,
			max: +1,
			decimals: 2,
			factor: 1,
			base: 77, // Base values for other cameras: T-Cam + Nose: 82, T-Cam with offset: 85
			increment: 2,
			step: 0.05, // slider step
		},
		"F1 2019-2020": {
			min: -10,
			max: +10,
			decimals: 1,
			factor: 1,
			base: 77,
			increment: 2,
			step: 0.1,
		},
		"F1 2021+": {
			min: -20,
			max: +20,
			decimals: 0,
			factor: 1,
			base: 77,
			increment: 2,
			step: 1,
		}
	},
	'vfov' : {
		"vFov": {
			decimals: 0,
			factor: 1
		},
		"Assetto Corsa, Assetto Corsa Competizione": {
			min: 10,
			max: 120,
			decimals: 1,
			factor: 1
		},
		"rFactor 1 & 2, GSC, GSCE, SCE, AMS (ISI Engine)": {
			min: 10,
			max: 100,
			decimals: 0,
			factor: 1
		},
		"DiRT Rally 1/2, GRID Autosport": {
			min: 10,
			max: 115,
			decimals: 0,
			factor: 2
		}
	},
	'vfovx': {
		"GTR2" : {
			min: 0.5,
			max: 1.5,
			decimals: 1,
			factor: 1,
			baseSingle: 58,
			baseTriple: 58
		},
		"Race07" : {
			min: 0.4,
			max: 1.5,
			decimals: 1,
			factor: 1,
			baseSingle: 58,
			baseTriple: 58
		}
	},
	'tangle': {
		"Triple Screen Angle" : {
			min: 10,
			max: 180,
			decimals: 2,
			factor: 1
		}
	}
};

$(document).ready(function() {
	$("select").selectmenu({
		change: function(event, data) {
	        calculateFOV();
		}
	});

	var screensizeHandle = $('#screensize-handle');
	var distanceHandle = $('#distance-handle');
	var bezelHandle = $('#bezel-handle');
	var radiusHandle = $('#radius-handle');

	$( "#screensizeSlider" ).slider({
		range: false,
		value: 27,
		min: 20,
		max: 80,
		create: function() {
			screensizeHandle.text($(this).slider("value") + '\'\'');
			$("#screensize").val($(this).slider("value"));
		},
		slide: function(event, ui) {
			screensizeHandle.text(ui.value + '\'\'');
			$("#screensize").val(ui.value);
			calculateFOV();
		}
	});

	$( "#distanceSlider" ).slider({
		range: false,
		value: 50,
		min: 30,
		max: 200,
		step: 1,
		create: function() {
			distanceHandle.text($(this).slider("value"));
			$("#distance").val($(this).slider("value"));
		},
		slide: function( event, ui ) {
	        distanceHandle.text(ui.value);
			$("#distance").val(ui.value);
			calculateFOV();
	    }
	});

	$( "#bezelSlider" ).slider({
		range: false,
		value: 0,
		min: 0,
		max: 100,
		create: function() {
			bezelHandle.text($(this).slider("value"));
			$("#bezel").val($(this).slider("value"));
		},
		slide: function(event, ui) {
			bezelHandle.text(ui.value);
			$("#bezel").val(ui.value);
			calculateFOV();
		}
	});

	$( "#curved" ).change(function() {
		calculateFOV();
	});

	$( "#radiusSlider" ).slider({
		range: false,
		value: 1000,
		min: 50,
		max: 3000,
		step: 10,
		create: function() {
			radiusHandle.text($(this).slider("value")+"R");
			$("#radius").val($(this).slider("value"));
		},
		slide: function(event, ui) {
			radiusHandle.text(ui.value+"R");
			$("#radius").val(ui.value);
			calculateFOV();
		}
	});

	calculateFOV();
});

function calculateFOV() {

	var screenRatio = $('#ratio').val();
	var x = parseFloat(screenRatio.substring(0, screenRatio.indexOf('_')));
	var y = parseFloat(screenRatio.substring(screenRatio.indexOf('_') + 1));

	var screens = parseInt($('#screens').val());
	var screensizeDiagonal = parseFloat($('#screensize').val()) * 2.54;
	var distanceToScreenInCm = parseFloat($('#distance').val());
	var bezelThickness = parseFloat($('#bezel').val()) / 10 * 2;
	var curved = $('#curved').is(':checked');
	var radiusInMm = parseInt($('#radius').val());

	var aspectRatioToSize = Math.sqrt((screensizeDiagonal * screensizeDiagonal) / ((x*x) + (y*y)));
	var width = (x * aspectRatioToSize) + (screens > 1 ? bezelThickness : 0);

	var hAngle = curved
		? _calcCurvedAngle(width, radiusInMm, distanceToScreenInCm)
		: _calcTriangularAngle(width, distanceToScreenInCm);
	// Calculate from hAngle instead of real width so that games that take vFov have the correct
	// hFov for curved monitors.
	//
	// Users have to choose between correct vFov and correct hFov, but this is minor - and, like
	// flat monitors, vFov changes as we go left-to-right across the screen, unless the monitor
	// is curved and radius == distance
	var vAngle = 2 * Math.atan2(Math.tan(hAngle / 2) * y, x);
	
	// Radians to degrees factor
	var arcConstant = (180 / Math.PI);

	var html = '<ul>';
	for (var calcGroup in allGames) {

		for (var gameName in allGames[calcGroup]) {
			var game = allGames[calcGroup][gameName];

			// Calculate game.
			var value = '';
			var unit;
			if (calcGroup == 'hfov' || calcGroup == 'hfov_base_step') {
				value = arcConstant * (hAngle * screens);
				unit = '°';
			} else if (calcGroup == 'vfov' || calcGroup == 'vfovx') {
				value = arcConstant * vAngle;
				unit = '°';
			} else if (calcGroup == 'hfovrad') {
				value = arcConstant * _calcTriangularAngle(width / x * y / 3 * 4, distanceToScreenInCm);
				unit = 'rad';
			} else if (calcGroup == 'tangle') {
				value = arcConstant * hAngle;
				unit = '°';
			}

			// Factor.
			value *= game.factor;

			// Further calculations.
			if (calcGroup == 'vfovx') {
				value /= (screens == 1 ? game.baseSingle : game.baseTriple);
				unit = 'x';
			}

			if (calcGroup == 'hfov_base_step') {
				// ((target - base) / increemnt) * step
				value = Math.round((value - game.base) / game.increment) * game.step;
				unit = '';
			}

			// Check min/max.
			value = game.min ? Math.max(value, game.min) : value;
			value = game.max ? Math.min(value, game.max) : value;

			// Final calculations.
			if (calcGroup.indexOf('hfovrad') != -1) {
				value *= (Math.PI / 180);
			}

			// Output.
			var base = Math.pow(10, game.decimals);
			html += '<li>';
			html += '<span>' + gameName + '</span>';
			html += '<span>' + (Math.round(value * base) / base).toFixed(game.decimals) + unit + '</span></li>';
			html += '</li>';
		}
	}

	html += '</ul>';

	$('#fov').html(html);
}

function _calcTriangularAngle(baseInCm, distanceToMonitorInCm) {
	return Math.atan2(baseInCm / 2, distanceToMonitorInCm) * 2;
}

function _calcCurvedAngle(baseInCm, radiusInMm, distanceToMonitorInCm) {
	var radiusInCm = radiusInMm / 10;
	/* First, figure out what the FOV would be if distance == radius
	 * c = 2pi * r
	 * theta = 2pi * (base / c)
	 *       = 2pi * (base / (2pi * r))
	 *       = base / r
	 */
	var arcAngleAtRadius = baseInCm / radiusInCm;
	/* Draw a line between the left and right edges of the curved monitor.
	 *
	 * Let's find that distance and call it 'b'.
	 *
	 * On the other side of that line, we have a right angled triangle:
	 *       | c  /
	 *       |---/
	 *       |  / r
	 * r - b | /
	 *       |/
	 *       |
	 *
	 * cos (theta / 2) = (r - b) / r
	 * r cos (theta / 2) = r - b
	 * b = r(1 - cos(theta / 2))
	 */
	var b = radiusInCm * (1 - Math.cos(arcAngleAtRadius / 2));
	
	/* We also need the length of that imaginary line, 2c:
	 * 
	 * c = sqrt(r^2 - (r - b)^2)
	 *   = sqrt(r^2 - (r^2 - 2rb + b^2))
	 *   = sqrt(2rb - b^2)
	 */
	var c = Math.sqrt((2 * radiusInCm * b) - (b * b));
	/* Just to keep the ascii art practical, let's use 'd' for the distance
	 * to monitor; we now have another right-angled triangle:
	 *
	 *
	 * |      -    -
	 * | c    |    | b
	 * |---/  |    -
	 * |  /   | d  |
	 * | /    |    | d - b
	 * |/     -    -
	 * 
	 * The angle we want here is hFOV / 2, so:
	 * 
	 * hfov = 2 * atan(c / (d - b))
	 */
	return 2 * Math.atan2(c, distanceToMonitorInCm - b);
}