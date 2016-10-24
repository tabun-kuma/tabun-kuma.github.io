/*
*[jquery.tabunFixedHeader.js]
*Copyright (c) 2016 tabun-kuma.net (http://tabun-kuma.net)
*Released under the MIT license
*http://opensource.org/licenses/mit-license.php 
*/
;
(function ($) {
	function UID(){
		var r = Math.floor(Math.random()*1000),
		d = new Date(),
		t = d.getTime();
		return r + t.toString();
	}
	var wa = {};
	$.fn.tabunFixedHeaderTable = function () {
		wa = {};
		$(this).each(function(){
			var _tid = UID();
			$(this).addClass(_tid);

			wa[_tid] = {};
			wa[_tid].sh = '<table id="'
				+ _tid
				+ '" style="position:fixed !important;position:absolute;top:0;">'
				+ $('thead', $(this)).html()
				+ '</table>';
			$(document).scroll(function(){
				var id = _tid,
				tt = $('.' + id).offset().top,
				tl = $('.' + id).offset().left,
				tb = $('.' + id).height() + $('.' + id).offset().top,
				
				dst = $(document).scrollTop(),
				show = (dst >= tt && dst <= tb);
				
				if(show && $('#' + id).length == 0){
					$('body').prepend(wa[id].sh);
				} else if (!show && $('#' + id).length > 0){
					$('#' + id).remove();
				};
				$('#' + id).offset({left:tl});
			}).scroll();
		});
	};
	
	$.fn.tabunFixedHeaderBlock = function(arg){
		$.colNum = arg||0;
		$(this).each(function(){
			var _tid = $(this).prop('id')||UID(),
			$t = $(this),
			head = $('thead', $t).html(),
			body = $('tbody', $t).html(),
			rhead = '<tr>',
			rbody = '';
			
			$t.css('overflow', 'scroll');
			$('thead', $t).find('tr>th:lt(' + $.colNum + ')').each(function(){
				rhead = rhead + '<th>' + $(this).text() + '</th>';
			});
			rhead = rhead + '</tr>';
			$('tbody', $t).find('tr').each(function(){
				rbody = rbody + '<tr>';
				$('td:lt(' + $.colNum + ')', this).each(function(){
					rbody = rbody + '<td>' + $(this).text() + '</td>';
				});
				rbody = rbody + '</tr>';
			});
			
			var id1 = _tid + '-1',
			id2 = _tid + '-2',
			id3 = _tid + '-3',
			id4 = _tid + '-4',
			s1 = 'style="z-index:100;position: absolute;"',
			s2 = 'style="z-index:50;position: absolute;"',
			sh = '<div style="max-height: ' + $t.height() + 'px;position: relative;">';
			sh = sh + '<table id="' + id1 + '"' + s1 + '><thead>' + head + '</thead></table>';
			sh = sh + '<table id="' + id2 + '"' + s2 + '><tbody>' + body + '</tbody></table>';
			sh = sh + '<table id="' + id3 + '"' + s1 + '><thead>' + rhead + '</thead></table>';
			sh = sh + '<table id="' + id4 + '"' + s2 + '><tbody>' + rbody + '</tbody></table>';
			sh = sh + '</div>';
			$t.html(sh);
			
			$(this).scroll(function(){
				var t = $t.offset().top,
				l = $t.offset().left,
				l1 = $('#' + id1).offset().left,
				b = $('#' + id1).css('border-top-width').replace(/[^\d]/g, '');
				var wl = l - b - $(this).scrollLeft(),
				wt = t + $('#' + id1).height() - $(this).scrollTop();
				$('#' + id1).offset({top:t, left:wl});
				$('#' + id2).offset({top:wt, left:wl});
				$('#' + id3).offset({top:t, left:l});
				$('#' + id4).offset({top:$('#' + id2).offset().top, left:l});
			}).scroll();
		});
	};
})(jQuery);
