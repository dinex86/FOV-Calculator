var allGames = {
	'hfov': {
		"Project CARS 1 & 2": {
			min: 35,
			max: 180,
			decimals: 0,
			factor: 1
		}
	},
	'hfovrad': {
		"Richard Burns Rally": {
			min: 10,
			max: 180,
			decimals: 6,
			factor: 1
		}
	},
	'vfov' : {
		"rFactor 1 & 2, GSC, GSCE, SCE, AMS": {
			min: 10,
			max: 100,
			decimals: 0,
			factor: 1
		},
		"Assetto Corsa": {
			min: 10,
			max: 120,
			decimals: 1,
			factor: 1
		},
		"GRID Autosport, DiRT Rally": {
			min: 10,
			max: 115,
			decimals: 0,
			factor: 2
		}
	},
	'vfovx': {
		"RaceRoom Racing Experience" : {
			min: 0.5,
			max: 1.5,
			decimals: 1,
			factor: 1,
			baseSingle: 58,
			baseTriple: 40
		},
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
		step: 5,
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
	
	calculateFOV();
});

function calculateFOV() {
	
	var screenRatio = $('#ratio').val();
	var x = parseFloat(screenRatio.substring(0, screenRatio.indexOf('_')));
	var y = parseFloat(screenRatio.substring(screenRatio.indexOf('_') + 1));
	
	var screens = parseInt($('#screens').val());
	var screensizeDiagonal = parseFloat($('#screensize').val()) * 2.54;
	var distanceToScreenInCm = parseFloat($('#distance').val());
	var numberOfScreens = 1;
	
	var height = Math.sin(Math.atan(y/x)) * screensizeDiagonal;
	var width = Math.cos(Math.atan(y/x)) * screensizeDiagonal;
	
	var hAngle = _calcAngle(width, distanceToScreenInCm);
	var vAngle = _calcAngle(height, distanceToScreenInCm);
	var arcConstant = (180 / Math.PI);
	
	var html = '<ul>';
	for (var calcGroup in allGames) {
		
		for (var gameName in allGames[calcGroup]) {
			var game = allGames[calcGroup][gameName];
			
			// Calculate game.
			var value = '';
			var unit;
			if (calcGroup == 'hfov') {
				value = arcConstant * (hAngle * screens);
				unit = '°';
			} else if (calcGroup == 'vfov' || calcGroup == 'vfovx') {
				value = arcConstant * vAngle;
				unit = '°';
			} else if (calcGroup == 'hfovrad') {
				value = arcConstant * (hAngle * screens);
				unit = 'rad';
			}
			
			// Factor.
			value *= game.factor;
			
			// Further calculations.
			if (calcGroup == 'vfovx') {
				value /= (screens == 1 ? game.baseSingle : game.baseTriple);
				unit = 'x';
			}
			
			// Check min/max.
			value = Math.max(value, game.min);
			value = Math.min(value, game.max);
			
			// Final calculations.
			if (calcGroup.indexOf('hfovrad') != -1) {
				value *= (Math.PI / 180);
			}
			
			// Output.
			var base = Math.pow(10, game.decimals);
			html += '<li>' + gameName + ': ' + (Math.round(value * base) / base).toFixed(game.decimals) + unit + '</li>';
		}
	}
	
	html += '</ul>';
	
	$('#fov').html(html);
}

function _calcAngle(baseInCm, distanceToMonitorInCm) {
	return Math.atan(baseInCm / 2 / distanceToMonitorInCm) * 2;
	return angle * (180 / Math.PI); 
}