/*
*[tabunImageMap.js]
*Copyright (c) 2016 tabun-kuma.net (http://tabun-kuma.net)
*Released under the MIT license
*http://opensource.org/licenses/mit-license.php 
*/
;
(function ($) {
	$.fn.tabunImageMap = function () {
		$(this).each(function(){
			var wkMap = $(this);
			var fnc = function () {
				var img1 = $('img[usemap="#' + $(wkMap).attr('name') + '"');
				var org = new Image();
				org.src = img1.attr('src');

				var rateY = img1.height() / org.height;
				var rateX = img1.width() / org.width;

				$(wkMap).find('area').each(function () {
					var c = $(this).attr('data-coords');
					var a = c.split(',');
					for (var i = 0; i < a.length; i++) {
						a[i] *= ((i % 2) === 0) ? rateX : rateY;
					};
					$(this).attr('coords', a.toString());
				});
			};
			$(window).resize(fnc).trigger('resize');
		});
	};
})(jQuery);
