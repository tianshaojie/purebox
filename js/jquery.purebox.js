/**
 * jQuery弹出层插件，简单精致，结构简单，样式简洁，接口丰富，满足轻量应用
 * email: tianshaojie@msn.com
 * date: 2013-01-15
 * version: 1.0.0
 */
(function($) {
	var
	$doc = $(document),
	$win = $(window),
	ie = $.browser.msie,
	ie6 = (ie && $.browser.version < 7),
	max = Math.max,
	min = Math.min,

	purebox = function(options) {
		return purebox.list[options.id] ? purebox.list[options.id] : new purebox.fn._init(options);
	};
	purebox.fn = purebox.prototype = {
		constructor : purebox,
		_init : function(options) {
			var opts = $.extend({}, purebox.defaults, options || {}),
				template = ['<div id="',opts.id,'" class="pb">',
				           opts.head ? ('<div class="pb-hd">' + (opts.xBtn ? '<a class="pb-x">\u2715</a>' : '') + '<span class="pb-title">'+opts.title+'</span></div>') : '',
				           '<div class="pb-bd"><div class="pb-ct"></div>',
			               opts.foot ? ('<div class="pb-ft">'+(opts.cBtn ? '<a class="pb-btn pb-cl">\u53d6\u6d88</a>' : '') + '<a class="pb-btn pb-ok">\u786e\u5b9a</a></div>') : '',
			               '</div></div>'].join(''),
			    $pb = $(template),
				$head = $pb.find('.pb-hd'),
				$foot = $pb.find('.pb-ft'),
				that = this;

			that.$pb = $pb,
			that.$head = $head;
			that.$foot = $foot;
			that.$xBtn = $head.find('.pb-x');
			that.$cont = $pb.find('.pb-ct');
			that.$cBtn = $foot.find('.pb-cl');
			that.$oBtn = $foot.find('.pb-ok');
			that.$pb.appendTo(document.body);
			that.opts = opts;
			that.offsetHeight = $head.outerHeight()+$foot.outerHeight();

			that._bindEvent();
			that._setPbZindex();
			that.resize(opts.width, opts.height);
			that.setContent(opts.content);
			opts.drag && that._setDrag();
			opts.mask && that._setMask();
			opts.resize && that.$pb.resizable({
				handles: "e, s, se",
				onResize:function() {
					that.$cont.height(that.$pb.innerHeight() - that.offsetHeight);
				}, 
				onStopResize:function() {
					that.$cont.height(that.$pb.innerHeight() - that.offsetHeight);
				}
			});
			!opts.fixed && that.$pb.css('position','absolute');
			that.setPos(opts.top, opts.left);
			purebox.list[opts.id] = that;
			that._focus();
			return that;
		},
		//定义全局变量window.zindex，每次Z值加一
		_zindex : function() {
			window.pb_zindex = window.pb_zindex || 2209;
			return ++window.pb_zindex;
		},
		//设置弹出层Z轴坐标
		_setPbZindex : function() {
			var that = this;
			return that.$pb.css('z-index', that._zindex());
		},
		//设置遮罩层Z轴坐标
		_setMaskZindex : function() {
			var that = this;
			return $('#pb-mask').css('z-index', that._zindex()).show();
		},
		//设置遮罩，遮罩的Z轴比最上面弹出层小，比已打开的弹出层大
		_setMask : function() {
			var that = this;
			if($('#pb-mask').length) {
				that._setMaskZindex();
				that._setPbZindex();
			} else {
				var css = 'position:fixed;width:100%;height:100%;top:0;left:0;filter:alpha(opacity=30);opacity:0.3;overflow:hidden;background-color:#000;_position:absolute;left:expression(documentElement.scrollLeft+documentElement.clientWidth-this.offsetWidth);top:expression(documentElement.scrollTop+documentElement.clientHeight-this.offsetHeight);',
					iframe = ie6 ? '<iframe src="about:blank" style="width:100%;height:100%;position:absolute;top:0;left:0;z-index:-1;filter:alpha(opacity=0)"></iframe>' : '';
				$('<div id="pb-mask" style="'+css+'">' + iframe + '</div>').css('z-index', that._zindex()).appendTo(document.body);
				that._setPbZindex();
			}
		},
		//设置弹出层是否可以拖拽
		_setDrag : function() {
			return new purebox.dragable(this.$pb, this.$head);
		},
		//绑定事件
		_bindEvent : function(opts) {
			var that = this,
				opts = that.opts;
			that.$xBtn.length && that.$xBtn.click(function() {
				$.isFunction(opts.onClose) && opts.onClose();
				that.dispose();
			});
			that.$cBtn.length && that.$cBtn.click(function() {
				$.isFunction(opts.onCancel) && opts.onCancel();
				that.dispose();
			});
			that.$oBtn.length && that.$oBtn.click(function() {
				$.isFunction(opts.onOk) && opts.onOk();
				that.dispose();
			});
			//窗口调整大小事件
			var resizeTimer;
			$win.resize(function() {
				resizeTimer && clearTimeout(resizeTimer);
				resizeTimer = setTimeout(function () {
					that.setPos(opts.top, opts.left);
				}, 40);
			});
		},
		_focus : function() {
			var focus = purebox.focus;
			this.prev = focus;
			purebox.focus = this;
		},
		//设置尺寸
		resize : function(width, height) {
			var that = this;
			that.$pb.css('width', max.call(Math,150,width) + 'px');
			that.$cont.css('height', max.call(Math,50,height) + 'px');
			return that;
		},
		//设置位置
		setPos : function(top, left) {
			var that = this,
				dl = that.opts.fixed ? 0 : $doc.scrollLeft(),
				dt = that.opts.fixed ? 0 : $doc.scrollTop();
			if(top === 'c') {
				top = $win.height() - that.$pb.outerHeight();
				top = top > 0 ? dt + (top>>1)-(top>>3) : 0;
			}
			if(left === 'c') {
				left = $win.width() - that.$pb.outerWidth();
				left = left > 0 ? dl + (left>>1) : 0;
			}
			that.$pb.css({top:top,left:left});
			return that;
		},
		center : function() {
			return this.setPos('c', 'c');
		},
		//设置弹出要显示的内容，支持html和jQuery对象，暂不支持URL和Image
		setContent : function(c) {
			var that = this;
			if(typeof(c) === 'string') {
				that.$cont.html(c);
			} else if(c instanceof jQuery) {
				var display = c.css('display'),
					prev = c.prev(),
					next = c.next(),
					parent = c.parent();
				that._elemBack = function () {
					if (prev.length) {
						prev.after(c);
					} else if (next.length) {
						next.before(c);
					} else if (parent.length) {
						parent.append(c);
					};
					c.css('display',display);
					that._elemBack = null;
				};
				that.$cont.append(c);
			}
			return that;
		},
		//关闭按钮对应的操作
		dispose : function() {
			var that = this;
			that._elemBack && that._elemBack();
			that.$pb.remove();

			delete purebox.list[that.opts.id];
			purebox.focus = purebox.focus.prev;

			if(purebox.focus) {
				if(purebox.focus.opts.mask) {
					that._setMaskZindex();
				} else {
					$('#pb-mask').hide();
				}
				$('.pb').last().css('z-index', that._zindex());
			} else {
				$('#pb-mask').remove();
			}
		}
	};
	purebox.fn._init.prototype = purebox.fn;

	purebox.defaults = {
		id 		: 'pb',				//弹出层ID
		title 	: '\u6807\u9898',	//弹出层标题，默认“标题”
		content : '',				//弹出层内容，支持html和jQuery对象，暂不支持URL和Image
		width 	: 'auto',				//弹出层宽度
		height 	: 'auto',				//弹出层高度
		left 	: 'c',				//X轴坐标，center默认居中显示
		top 	: 'c',				//Y轴坐标，center默认居中显示
		fixed 	: true,				//是否静止定位
		drag 	: true,				//是否拖拽
		mask	: true,				//是否锁屏
		resize 	: false,			//是否可以调节尺寸，需要引入jquery.resizable.js
		head 	: true,				//是否显示标题栏
		foot 	: true,				//是否显示按钮栏
		xBtn 	: true,				//是否显示关闭按钮
		cBtn 	: true,				//是否显示取消按钮
		onClose	: null,				//关闭回调事件
		onOk 	: null,				//确定回调事件
		onCancel: null				//取消回调事件
	};
	purebox.focus = null;
	purebox.list = {};
	//拖拽
	purebox.dragable = function() {
		return this.initialize.apply(this, arguments);
	};
	purebox.dragable.prototype = {
		//拖放对象
		initialize: function($drag, $handle) {
			this._drag = $drag;//拖放对象
			this._handle = $handle || this._drag;

			//事件代理
			this.move = $.proxy(this.onMove,this);
			this.stop = $.proxy(this.onStop,this);

			this._handle.bind("mousedown", $.proxy(this.onStart,this));
		},
		//准备拖动
		onStart: function(event) {
			//记录鼠标相对拖放对象的位置
			this._x = event.clientX - parseInt(this._drag.css('left'), 10);
			this._y = event.clientY - parseInt(this._drag.css('top'), 10);
			$doc.bind('mousemove',this.move).bind('mouseup', this.stop);
			if(ie){
				//焦点丢失
				this._handle.bind("losecapture", this.stop);
				//设置鼠标捕获
				this._handle.get(0).setCapture();
			}else{
				//焦点丢失
				$doc.bind("blur", this.stop);
				//阻止默认动作
				event.preventDefault();
			};
		},
		//拖动
		onMove: function(event) {
			//清除选择
			window.getSelection ? window.getSelection().removeAllRanges() : document.selection.empty();
			//设置移动参数、范围限制，动态的使用$win.width()和$drag.outerWidth()是为了避免窗口大小和弹出层大小改变是对拖动位置的影响
			var iLeft = event.clientX - this._x,
				iTop = event.clientY - this._y,
				fixed = this._drag.css('position') === 'fixed',
				dl = fixed ? 0 : $doc.scrollLeft(),
				dt = fixed ? 0 : $doc.scrollTop(),
				maxLeft = dl + $win.width() - this._drag.outerWidth(),
				maxTop = dt + $win.height() - this._drag.outerHeight();
			iLeft = max(min(iLeft, maxLeft), dl);
			iTop = max(min(iTop, maxTop), dt);
			this._drag.css({top:iTop, left:iLeft});
		},
		//停止拖动
		onStop: function() {
			//移除事件
			$doc.unbind("mousemove", this.move);
			$doc.unbind("mouseup", this.stop);
			if(ie){
				this.unbind("losecapture", this.stop);
				this._handle.get(0).releaseCapture();
			}else{
				$doc.unbind("blur", this.stop);
			};
		}
	};

	//扩展到jQuery工具集
	window.pb = $.pb = $.purebox = purebox;

	//扩展到jQuery包装集
	$.fn.pb = $.fn.purebox = function (options) {
		return this.bind('click', function() {
			$.pb(options);
		});
	};

	//扩展alert
	$.pb.alert = function(content, callback) {
		return $.pb({
			id : 'pb-alert',
			title : '\u63d0\u793a',
			content : wrapCont(content),
			width : 300,
			height 	: 70,
			onOk : callback,
			cBtn : false,
			resize : false
		});
	};
	//扩展confirm
	$.pb.confirm = function(content, ok, cancel) {
		return $.pb({
			id : 'pb-confirm',
			title : '\u786e\u8ba4',
			content : wrapCont(content),
			width : 300,
			height 	: 70,
			onOk : ok,
			onCancel : cancel,
			resize : false
		});
	};

	//居中显示文字Alert,Confirm
	function wrapCont(cont) {
		return '<div style="text-align:center;padding: 20px 10px 0;">' + cont + '</div>';
	}
})(window.jQuery);

/**
 * jQuery带箭头的提示框
 * email: tianshaojie@msn.com
 * date: 2013-01-15
 * version: 1.0.0
 */
(function($) {
	var max = Math.max,
		min = Math.min;
	$.pt = $.pureToolTips = function(options) {
		var opts = $.extend({
			position 	: 't',		//提示框相对目标元素位置 t=top,b=bottom,r=right,l=left
			align		: 'c',		//对齐方式，c=center, t=top, b=bottom, l=left, r=right [postion=t,b时align=l,r有效][position=t,b时align=t,d有效]
			arrow		: true,		//是否显示箭头
			content 	: '',		//内容
			width 		: 200,		//宽度
			hight 		: 'auto',	//高度
			target 		: null,		//目标元素
			autoClose 	: true,		//是否自动关闭
			time 		: 2000,		//自动关闭延时时长
			leaveClose 	: false,	//提示框失去焦点后关闭]
			close 		: null		//关闭回调函数
		}, options || {}),

		$ao, $ai, w, h,
		$pt = $('.pt'),
		$target = $(opts.target),
		top = $target.offset().top,
		left = $target.offset().left,
		width = $target.outerWidth(),
		height = $target.outerHeight(),

		position = opts.position,
		align = opts.align,
		arrow = opts.arrow,

		constant = {b:'pt-up', t:'pt-down', r:'pt-left', l:'pt-right'}, //相对位置正好和箭头方向相反
		arrowClass = constant[position] || constant.t;

		//初始化元素，事件
		function init() {
			if(!opts.target) {
				return;
			}
			if(!$pt.length) {
				$pt = $('<div class="pt pt-down"><div class="cont"></div><b class="out"></b><b class="in"></b></div>').appendTo(document.body);
			}
			$pt.removeClass().addClass('pt ' + (arrow ? arrowClass : '')).find('.cont').html(opts.content).css({width:opts.width, height:opts.height});
			$ao = $pt.find('.out').toggle(arrow);
			$ai =  $pt.find('.in').toggle(arrow);
			w = $pt.outerWidth();
			h = $pt.outerHeight();
			arrow && autoAdjust();				//设置箭头自动居中
			$pt.css(setPos()).show();		//设置显示框位置和自动隐藏事件
			opts.leaveClose && leaveClose();//离开关闭
			opts.autoClose && !opts.leaveClose && autoClose(opts.timeout);	//默认自动关闭，优先离开关闭
			return $pt;
		}
		//计算提示框应该出现在目标元素位置
		function setPos() {
			var btw = arrow ? parseInt($ao.css('border-top-width'), 10) : 3,
				brw = arrow ? parseInt($ao.css('border-right-width'), 10) : 3,
				result = {};
			switch(align) {
				case 'c': break;
				case 't': result.top = top; break;
				case 'b': result.top = top + height - h; break;
				case 'l': result.left = left; break;
				case 'r': result.left = left + width - w; break;
			}
			switch(position) {
				case 't': result.top = top - h - brw; break;
				case 'b': result.top = top + height + brw; break;
				case 'l': result.left = left - w - btw; break;
				case 'r': result.left = left + width + btw; break;
			}
			result.top || (result.top = top + height/2 - h/2);
			result.left || (result.left = left + width/2 - w/2);
			return result;
		}

		//设置箭头自动居中
		function autoAdjust() {
			var aop, aip, bw, auto='auto';
			switch(position) {
				case't':
					bw = parseInt($ao.css('border-top-width'), 10);
					aop = {bottom:-bw, left:w/2-bw, top:auto, right:auto};
					alignLR();
					aip = {top:auto, left:aop.left+1, bottom:aop.bottom+1, right:auto};
					break;
				case'b':
					bw = parseInt($ao.css('border-bottom-width'), 10);
					aop = {top:-bw, left:w/2 - bw, right:auto, bottom:auto};
					alignLR();
					aip = {top:aop.top+1, left:aop.left+1, bottom:auto, right:auto};
					break;
				case'l':
					bw = parseInt($ao.css('border-left-width'), 10);
					aop = {top:h/2 - bw, right:-bw, left:auto, bottom:auto};
					alignTB();
					aip = {top:aop.top+1, right:aop.right+1, left:auto, bottom:auto};
					break;
				case'r':
					bw = parseInt($ao.css('border-right-width'), 10);
					aop = {top:h/2 - bw, left:-bw, right:auto, bottom:auto};
					alignTB();
					aip = {top:aop.top+1, left:aop.left+1, right:auto, bottom:auto};
					break;
			}
			//上下侧，左右对齐
			function alignLR() {
				if(align === 'l' && width/2 > bw && width/2 < w-bw) {
					aop.left = width/2-bw/2;
				} else if(align === 'r' && width/2 > bw && width/2 < w-bw) {
					aop.left = w-width/2-bw/2;
				}
			}
			//左右侧，上下对齐
			function alignTB() {
				if(align === 't' && height/2 > bw && height/2 < h-bw) {
					aop.top = height/2 - bw;
				} else if(align === 'b' && height/2 > bw && height/2 < h-bw) {
					aop.top = h - height/2 - bw;
				}
			}
			$ao.css(aop);
			$ai.css(aip);
		}
		//设置提示框自动关闭
		function autoClose() {
			window.ptt && clearTimeout(ptt);
			window.pta && clearTimeout(pta);
			window.pta = setTimeout(function() {
				$pt.hide();
				$.isFunction(opts.close) && opts.close();
			}, opts.time);
		}
		//设置提示框失去焦点关闭
		function leaveClose() {
			$pt.mouseleave(function(e) {
				$pt.hide();
				$.isFunction(opts.close) && opts.close();
			}).mouseenter(function() {
				window.ptt && clearTimeout(ptt);
			}).show();
		}
		return init();
	};

	//扩展到包装集上
	$.fn.pt = $.fn.pureToolTips = function(options) {
		var opts = $.extend({
			leaveClose:true
		}, options || {});
		return this.each(function() {
			$(this).mouseenter(function() {
				window.ptt && clearTimeout(ptt);
				window.pta && clearTimeout(pta);
				opts.target = this;
				$.pt(opts);
			}).mouseleave(function() {
				window.ptt = setTimeout(function() {
					$('.pt').hide();
					$.isFunction(opts.close) && opts.close();
				}, 500);
			});
		});
	};
})(jQuery);