/*
*[jquery.tabunTabIndex.js]
*Copyright (c) 2016 tabun-kuma.net (http://tabun-kuma.net)
*Released under the MIT license
*http://opensource.org/licenses/mit-license.php 
*/
;
(function ($) {
	$.fn.tabunTabIndex = function (op) {
		const attr1 = 'data-tab-group';
		const attr2 = 'data-tab-group-max';
		var _o = {
			groupNo: 1,
			targetSelector: ':input:not(:hidden)',
			indexAjust: 10000,
			groupMaxIndex: 0,
			enterDown:true,
		};
		for (var k in op) { _o[k] = op[k]; };
		
		$(this).find(_o.targetSelector).each(function(){
			$(this).attr(attr1, _o.groupNo);
			$(this).prop('tabIndex', ++_o.groupMaxIndex + (_o.groupNo * _o.indexAjust));

			$(this).keypress(function(e){
				if(e.keyCode ===9){ return; };
				var groupAjust = Number($(this).attr(attr1)) * _o.indexAjust;
				var groupMax = Number($(this).attr(attr2)) + groupAjust;

				if (e.keyCode===13){
					var wkIndex = Number(this.tabIndex);
					if (_o.enterDown && $(this).parent().prop('tagName').toLowerCase() == 'td'){
						var add = 1;
						var addSelector = ':last';
						if(e.shiftKey){
							add = -1;
							addSelector = ':first';
						};

						var tdIndex = Number($(this).closest('td').index());
						for (var trIndex = Number($(this).closest('tr').index())+add;;trIndex+=add){
							var next = $(this).closest('table>tbody').find('tr:eq('+String(trIndex)+')');
							if(($(next).length>0) && (trIndex >= 0)){
								var c = $(next).find('td:eq('+String(tdIndex)+')').find(_o.targetSelector);
								if(c.length>0){
									$(c).focus();
									return false;
								};
							}else{
								wkIndex = $(this).closest('tr').find(_o.targetSelector+addSelector).prop('tabIndex');
								break;
							};
						};
					};
				};
				var selector = null;
				if(e.shiftKey){
					selector = ((groupAjust+1) == wkIndex)
								? ':input[tabIndex='+groupMax+']'
								: ':input[tabIndex='+(wkIndex-1)+']';
				}else{
					selector = (groupMax == wkIndex)
								? ':input[tabIndex='+(groupAjust+1)+']'
								: ':input[tabIndex='+(wkIndex+1)+']';
				};
				$(selector).focus();
				return false;
			});
		});
		$(this).find(_o.targetSelector).attr(attr2, _o.groupMaxIndex);
		return this;
	};
})(jQuery);
