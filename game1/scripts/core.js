/*
Copyright (c) 2016 tabun-kuma.net (http://tabun-kuma.net)
Released under the MIT license
http://opensource.org/licenses/mit-license.php 
*/

; if (typeof (window.$) == 'undefined') { window.$ = {}; };

/********************************************************************************/
/* tabunJs																	  */
/* 依存のない処理															   */
/********************************************************************************/
$.tabunJs = (function(){
	var _obj = {
		fileName: 'core.js',
		name: 'tabunJs',
		debug: {
			isDebug: true,
			write: function () {},
		},
		getElement: function () {},
		stringFormat: function () {},
		moveProp: function () {},
		getRegExRc: function () {},
		convertRc2Array: function () { },
		currentPath: '',
	};
	
	//デバッグ用
	var _onDebug = false;
	var _onAlert = false;
	_obj.debug = {
		isDebug: _onDebug,
		write: function (pMsg) {
			if (_onDebug) { (_onAlert) ? alert(pMsg) : console.log(pMsg); };
		},
	};
	
	_obj.getElement = function (pSelector) {
		var fi = function (pId) { return document.getElementById(pId); };
		var fc = function (pClassName) { return document.getElementsByClassName(pClassName); };
		var ft = function (pTabName) { return document.getElementsByTagName(pTabName); };

		var t = String(pSelector);
		if (t.match(/^#/) != null) { return fi(t.replace('#', '')); };
		if (t.match(/^\./) != null) { return fc(t.replace('.', '')); };
		return ft(pSelector);
	};
	
	_obj.addListener = (function () {
		if (document.addEventListener) {
			return function (pSelector, pEventName, callback) {
				_obj.getElement(pSelector).addEventListener(pEventName, callback, false);
			};
		} else if (document.attachEvent) {
			return function (pSelector, pEventName, callback) {
				_obj.getElement(pSelector).attachEvent('on' + pEventName, callback);
			};
		} else {
			return function (pSelector, type, callback) {
				_obj.getElement(pSelector)['on' + pEventName] = callback;
			}
		}
	})();

	_obj.stringFormat = function (pFormat, pArgs) {
		var r = pFormat;
		for (var i = 0; i <= pArgs.length; i++) {
			r = r.replace('{' + i + '}', pArgs[i]);
		};
		return r;
	};
	
	_obj.moveProp = function (pFrom, pTo) {
		for (var k in pFrom) { pTo[k] = pFrom[k]; };
	};
	
	_obj.getRegExRc = function (pText) {
		var _r1 = /r(\d+)c(\d+)(:r(\d+)c(\d+))?/i;
		return _r1.exec(pText.toLowerCase());
	};
	
	_obj.convertRc2Array = function (pRc) {
		var _result = {};
		var _ra = _getRegExRc(pRc);
		if (Array.isArray(_ra)) {
			if (typeof (_ra[3]) == 'undefined') {
				_result = {
					rs: Number(_ra[1]),
					cs: Number(_ra[2]),
					re: Number(_ra[1]),
					ce: Number(_ra[2]),
				};
			} else if (_ra.length == 6) {
				_result = {
					rs: Number(_ra[1]),
					cs: Number(_ra[2]),
					re: Number(_ra[4]),
					ce: Number(_ra[5]),
				};
			};
		};
		_result.rb = _result.re - _result.rs; /*選択行数*/
		_result.cb = _result.ce - _result.cs; /*選択列数*/

		return _result;
	};

	_obj.currentPath = (function () {
		var _result = 'script/';
		if (document.currentScript) {
			_result = document.currentScript.src;
		} else {
			var s = document.getElementsByTagName('script'),
			s = s[s.length - 1];
			if (s.src) {
				_result = s.src;
			};
		};
		return _result.replace(_obj.fileName, '');
	})();

	return _obj;

})();


/********************************************************************************/
/* tabun2d																	  */
/* $.tabunJsに依存															  */
/********************************************************************************/
$.tabun2d = (function(){
	//tabun2dプロパティ
	var _obj = {
		name: 'tabun2d',
		resources: {},
		addCanvas: function() {},
		drawImageObject: function () { },
		drawTextObject: function () { },
		audioObject: function () { },
	};

	//Canvasオブジェクトを追加
	_obj.addCanvas = function (selector, name, setting) {
		_cvs = $.tabunJs.getElement(selector);
		_cvs.magnificationRate = 1;
		_cvs.touch = { x: null, y: null };
		if (setting) {
			_cvs.default = setting.size;
			_cvs.margin = setting.margin;
		} else {
			_cvs.default = { width: 680, height: 400 };
			_cvs.margin = { top: 0, left: 0, bottom: 0, right: 0 };
		};

		_cvs.resize = function () {
			this.width = document.body.clientWidth; /*window.innerWidth*/
			this.height = document.body.clientHeight; /*window.innerHeight*/

			var u = 'px';
			this.style.marginTop = (this.margin.top) + u;
			this.style.marginLeft = (this.margin.left) + u;
			this.style.marginBottom = (this.margin.bottom) + u;
			this.style.marginRight = (this.margin.right) + u;

			var _w = (this.width / this.default.width);
			var _h = (this.height / this.default.height);
			this.magnificationRate = (_w > _h) ? _h : _w;
		};

		if (window.targetTouches) {
			$.tabunJs.addListener(selector, 'touchestart', function (event) {
				_cvs.touch.x = event.targetTouches[0].pageX - event.target.offsetLeft;
				_cvs.touch.y = event.targetTouches[0].pageY - event.target.offsetTop;
			});
		} else {
			$.tabunJs.addListener(selector, 'mousedown', function (event) {
				var rect = event.target.getBoundingClientRect();
				_cvs.touch.x = event.clientX - rect.left;
				_cvs.touch.y = event.clientY - rect.top;
			});
		};


		_obj[name] = _cvs;
	};
	
	/**************************/
	/*イメージ描画オブジェクト*/
	/**************************/
	_obj.drawImageObject = function(arg){
		var _obj = {
			name: 'drawImageObject',
			canvas: null,
			x: 0,
			y: 0,
			visible: true,
			img: null,
			imgInfo:{
				width: 0,
				height:0,
			},
			src: 'data:image/png;base64,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',
			drawInfo: {
				style: 'image',
				drawX: 0,
   				drawY: 0,
				drawWidth: 0,
				drawHeight: 0,
			},
			click: {
				se: null,
				ajust: { x: 0, y: 0 },
			},
			init: function () { },
			paintStart: function () { },
			beforePaint: function () { },
			onPaint: function () { },
			afterPaint: function(){},
			paint: function(){},
			setImageInfo: null,
			isClick: function () { },
		};

		_obj.isClick = function () {
			if (this.canvas.touch.x != null) {
				if ((this.drawInfo.drawX + this.click.ajust.x < this.canvas.touch.x
					&& this.drawInfo.drawY + this.click.ajust.y < this.canvas.touch.y)
					&& (this.drawInfo.drawX + this.imgInfo.width - this.click.ajust.x > this.canvas.touch.x
					&& this.drawInfo.drawY + this.imgInfo.height - this.click.ajust.y > this.canvas.touch.y)) {
					return true;
				};
			};
			return false;
		};

		_obj.setImageInfo = function (pImg) {
			this.imgInfo.width = pImg.width * this.canvas.magnificationRate;
			this.imgInfo.height = pImg.height * this.canvas.magnificationRate;
			
			this.drawInfo.drawX = this.x ;
			this.drawInfo.drawY = this.y ;

			switch (this.drawInfo.style) {
				case 'fit':
					this.drawInfo.drawWidth = this.canvas.width;
					this.drawInfo.drawHeight = this.canvas.height;
					break;
				case 'spec':
					break;
				default:
					this.drawInfo.drawWidth = this.imgInfo.width;
					this.drawInfo.drawHeight = this.imgInfo.height;
					break;
			};
		};
		
		_obj.onLoad = function () {
			this.img = new Image();
			this.img.src = this.src;
		};

		//描画イベント
		_obj.onPaint = function(){
			var ctx = this.canvas.getContext('2d');
			if (this.img && this.img.complete) {
				this.setImageInfo(this.img);
				ctx.drawImage(this.img, this.drawInfo.drawX, this.drawInfo.drawY, this.drawInfo.drawWidth, this.drawInfo.drawHeight);
			};

			if($.tabunJs.debug.isDebug){
				//中心点表示
				ctx.beginPath();
				ctx.fillStyle = 'yellow';
				ctx.arc(this.drawInfo.drawX, this.drawInfo.drawY, (2 * this.canvas.magnificationRate), 0, Math.PI * 2, false);
				ctx.fill();
				ctx.arc(this.drawInfo.drawX + this.drawInfo.drawWidth, this.drawInfo.drawY + this.drawInfo.drawHeight, (2 * this.canvas.magnificationRate), 0, Math.PI * 2, false);
				ctx.fill();
			};
		};
		
		//描画メソッド
		_obj.paint = function () {
			this.paintStart();
			if (this.visible) {
				this.beforePaint();
				this.onPaint();
				this.afterPaint();
			};
		};
		
		for (var k in arg) { _obj[k] = arg[k]; };
		
		_obj.onLoad();
		_obj.init();
		
		return _obj;
	};
	
	/**************************/
	/*テキスト描画オブジェクト*/
	/**************************/
	_obj.drawTextObject = function(arg){
		var _obj = {
			name: 'drawTextObject',
			canvas: null,
			x: 0,
			y: 0,
			textWidth: null,
			visible: true,
			text: 'no text',
			fontStyle:{
				color: 'blue',
				size: 24,
				unit: 'px',
				fontFamily: 'ＭＳ ゴシック',
				textAlign: 'center',
				verticalAlign: 'middle',
			},
			click: {
				se: null,
			},
			init: function () { },
			beforePaint: function(){},
			onPaint: function(){},
			afterPaint: function(){},
			paint: function(){},
			setImageInfo: null,
		};
		
		//描画イベント
		_obj.onPaint = function(arg){
			if(arg.visible){
				var ctx = this.canvas.getContext('2d');
				//テキスト表示
				ctx.fillStyle = arg.fontStyle.color;
				ctx.font = (arg.fontStyle.size * arg.canvas.magnificationRate) + 'px' + ' ' + arg.fontStyle.fontFamily;
				ctx.textAlign = arg.fontStyle.textAlign;
				ctx.textBaseline = arg.fontStyle.verticalAlign;
				ctx.fillText(arg.text, arg.x, arg.y, arg.textWidth * arg.canvas.magnificationRate);
				
				if($.tabunJs.debug.isDebug){
					//中心点表示
					ctx.beginPath();
					ctx.fillStyle = 'red';
					ctx.arc(arg.x, arg.y, (2 * arg.canvas.magnificationRate), 0, Math.PI * 2, false);
					ctx.fill();
				};
			};
		};
		
		//描画メソッド
		_obj.paint = function(){
			_obj.beforePaint();
			_obj.onPaint(_obj);
			_obj.afterPaint();
		};
		
		for (var k in arg) { _obj[k] = arg[k]; };
		
		_obj.init();
		
		return _obj;
	};
	
	/**************************/
	/*オーディオオブジェクト*/
	/**************************/
	_obj.audioObject = function (arg) {
		var _obj = {
			name: 'audioObject',
			audio: null,
			src: 'bgm/bgm1.mp3',
			loop: false,
			play: function () {
				if (!this.audio.paused) { this.audio.pause(); };
				this.audio.loop = this.loop;
				this.audio.currentTime = 0;
				this.audio.play();
			},
			stop: function () {
				if (!this.audio.paused) { this.audio.pause(); };
				this.audio.currentTime = 0;
			},
		};

		for (var k in arg) { _obj[k] = arg[k]; };

		_obj.audio = new Audio(_obj.src);

		return _obj;
	};

	return _obj;

})();

/****************************************/
/*外部ファイルロード*/
/****************************************/
/*リソース読み込み*/
var _xmlhttp = new XMLHttpRequest();
_xmlhttp.onreadystatechange = function () {
	if (_xmlhttp.readyState == 4) {
		if (_xmlhttp.status == 200) {
			//リソースのデシアライズ
			$.tabun2d.resources = JSON.parse(_xmlhttp.responseText);

			/*メインファイル読み込み*/
			var _mainJs = $.tabunJs.currentPath + String($.tabun2d.resources.config.main);
			var _mainScript = document.createElement('script');
			_mainScript.src = _mainJs;
			$.tabunJs.getElement('head')[0].appendChild(_mainScript);
		};
	};
};
_xmlhttp.open('GET', $.tabunJs.currentPath + 'resources.json');
_xmlhttp.send();
