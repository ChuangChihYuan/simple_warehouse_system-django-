/**
               _ _____           _          _     _      
              | |  __ \         (_)        | |   | |     
      ___ ___ | | |__) |___  ___ _ ______ _| |__ | | ___ 
     / __/ _ \| |  _  // _ \/ __| |_  / _` | '_ \| |/ _ \
    | (_| (_) | | | \ \  __/\__ \ |/ / (_| | |_) | |  __/
     \___\___/|_|_|  \_\___||___/_/___\__,_|_.__/|_|\___|
	 
	v1.6 - jQuery plugin created by Alvaro Prieto Lauroba
	
	Licences: MIT & GPL
	Feel free to use or modify this plugin as far as my full name is kept	
	
	If you are going to use this plug-in in production environments it is 
	strongly recommended to use its minified version: colResizable.min.js

*/
var values = {}; // 創建一個物件用於存儲值

(function($){ 	
	
	var d = $(document);           //window 物件
	var h = $("head");             //head 物件
	var drag = null;               //參考正在拖曳的當前把手
	var tables = {};               //已處理的表格物件（以 table.id 作為鍵）的物件
	var count = 0;                 //在需要時創建唯一 ID 的內部計數。
	
	//用於打包的常見字符串
	var ID = "id";
	var PX = "px";
	var SIGNATURE = "JColResizer";
	var FLEX = "JCLRFlex";
	
	//捷徑
	var I = parseInt;
	var M = Math;
	var ie = navigator.userAgent.indexOf('Trident/4.0') > 0;
	var S;
	try { S = sessionStorage; } catch (e) {} //Firefox 在作為本地文件系統執行時會崩潰
	
	//附加所需的 CSS 規則
	h.append("<style type='text/css'>  .JColResizer{table-layout:fixed;} .JColResizer > tbody > tr > td, .JColResizer > tbody > tr > th{overflow:hidden;padding-left:0!important; padding-right:0!important;}  .JCLRgrips{ height:0px; position:relative;} .JCLRgrip{margin-left:-5px; position:absolute; z-index:5; } .JCLRgrip .JColResizer{position:absolute;background-color:red;filter:alpha(opacity=1);opacity:0;width:10px;height:100%;cursor: e-resize;top:0px} .JCLRLastGrip{position:absolute; width:1px; } .JCLRgripDrag{ border-left:1px dotted black;	} .JCLRFlex{width:auto!important;} .JCLRgrip.JCLRdisabledGrip .JColResizer{cursor:default; display:none;}</style>");
	
	
	/**
	 * 此函數允許對表格物件進行列調整大小。這是應用插件的起始點。
	 * @param {DOM node} tb - 要增強的 DOM 表格物件的參考
	 * @param {Object} options - 一些自定義值
	 */
	var init = function(tb, options){
		var t = $(tb);                    //將表格物件包裝起來
		console.log("t: ",t)
		t.opt = options;                  //每個表格都有其自己的選項，隨時可用

		values.t_opt = t.opt;

		t.mode = options.resizeMode;      //捷徑
		t.dc = t.opt.disabledColumns;
		if(t.opt.disable) return destroy(t);                //用戶要求銷毀先前已經調整大小的表格
		var id = t.id = t.attr(ID) || SIGNATURE + count++;  //獲取其 ID，如果為空則生成新的
		t.p = t.opt.postbackSafe;                            //捷徑以檢測 postback 安全性
		if(!t.is("table") || tables[id] && !t.opt.partialRefresh) return;  //如果該對象不是表格，或者已經處理過，則忽略它。如果不需要部分刷新則忽略。
		if (t.opt.hoverCursor !== 'e-resize') h.append("<style type='text/css'>.JCLRgrip .JColResizer:hover{cursor:"+ t.opt.hoverCursor +"!important}</style>");  //如果設置了 hoverCursor，則添加樣式
		t.addClass(SIGNATURE).attr(ID, id).before('<div class="JCLRgrips"/>');  //添加分隔把手的容器對象。Signature 類強制表格以固定佈局模式呈現，以防止列的最小寬度

		//20230810 避免一開始使用mode:flex讀取table時欄位總寬度錯誤,導致第一次點擊時無法調整欄位
		console.log("before applyBounds")
		// applyBounds(t);
		if(t.opt.openflex){
			t.addClass(FLEX);						// 允許表格寬度變化
		}
		else
		{
			t.removeClass(FLEX);
		}
		console.log("after applyBounds")


		t.g = []; t.c = []; t.w = t.width(); t.gc = t.prev(); t.f = t.opt.fixed;  //t.c 和 t.g 分別是列和把手的數組

		console.log("init t.w: ", t.w)

		values.w = t.w;

		if(options.marginLeft) t.gc.css("marginLeft", options.marginLeft);   //如果表格包含邊距，必須指定
		if(options.marginRight) t.gc.css("marginRight", options.marginRight);  //因為無法（直接）以原始單位（%，em 等）獲取邊距值
		t.cs = I(ie ? tb.cellSpacing || tb.currentStyle.borderSpacing :t.css('border-spacing')) || 2;  //表格間隔（即使 jQuery 也不是完全跨瀏覽器的）
		t.b  = I(ie ? tb.border || tb.currentStyle.borderLeftWidth :t.css('border-left-width')) || 1;  //外部邊框寬度（同樣是跨瀏覽器問題）
		// if(!(tb.style.width || tb.width)) t.width(t.width()); //我一點也不喜歡 IE，但可惜只有 IE 的 currentStyle 屬性按預期工作。因此，我無法輕鬆檢查表格是否有顯式寬度或是否以 "auto" 渲染
		tables[id] = t;  //使用其 ID 作為鍵，存儲表格物件
		createGrips(t);   //創建分隔把手
		console.log("init")

		values.t = t;
		values.tables = tables;
		values.tables_id = tables[id];
		console.log("tables[id]", tables[id])
		console.log("[id]", id)
		console.log("values.tables", values.tables)
		console.log("tables[id]", tables[id])
		console.log("values.tables_id", values.tables_id)

		console.log("values.tables[id]", values.tables[id])
	};


	var counter = (function () {
		var privateCounter = 0;
		function changeBy(val) {
		  privateCounter += val;
		}
		return {
		  increment: function () {
			changeBy(1);
		  },
		  decrement: function () {
			changeBy(-1);
		  },
		  value: function () {
			return privateCounter;
		  },
		};
	  })();

	/**
	 * 此函數允許刪除該插件在先前處理的表格上執行的所有增強功能。
	 * @param {jQuery ref} t - 表格物件
	 */
	var destroy = function(t){
		console.log("tablesqqqqqqqqqqqqqqq:",tables)
            console.log("tables:",tables)
		var id = t.attr(ID), t = tables[id];		//找到其表格物件
		console.log("destroyqq",id)
		if(!t || !t.is("table")) return;			//如果不存在，則它尚未處理
		t.removeClass(SIGNATURE + " " + FLEX).gc.remove();	//移除類和分隔把手
		delete tables[id];						//清理數據
		console.log("destroy",id)
	};


	/**
	 * 用於創建與給定參數的表格相關聯的所有分隔把手的函數
	 * @param {jQuery ref} t - 表格物件
	 */
	var createGrips = function(t){	
		console.log("createGrips before t.w: ",t.w)
		var th = t.find(">thead>tr:first>th,>thead>tr:first>td"); //獲取表頭元素
		if(!th.length) th = t.find(">tbody>tr:first>th,>tr:first>th,>tbody>tr:first>td, >tr:first>td");	 //但表頭也可以以不同的方式包含
		th = th.filter(":visible");					//過濾不可見的列
		t.cg = t.find("col"); 						//表格還可以包含帶有 col 元素的 colgroup
		t.ln = th.length;							//存儲表格的列數
		if(t.p && S && S[t.id]) memento(t, th);		//如果 'postbackSafe' 已啟用並且存在當前表格的數據，則恢復其列佈局
		th.each(function(i){						//遍歷表格的列標題			
			var c = $(this); 						//用 jQuery 對當前列進行封裝		
			var dc = t.dc.indexOf(i) != -1;           //這是一列是否被禁用？
			var g = $(t.gc.append('<div class="JCLRgrip"></div>')[0].lastChild); //添加用作分隔把手的視覺節點
			g.append(dc ? "" : t.opt.gripInnerHtml).append('<div class="'+SIGNATURE+'"></div>');
			if(i == t.ln-1){                        //如果當前分隔把手是最後一個
				g.addClass("JCLRLastGrip");         //添加不同的 CSS 類以不同的方式樣式化它（如果需要的話）
				if(t.f) g.html("");                 //如果表格調整大小模式設為固定，則刪除最後一個分隔把手，因為表格寬度不能更改
			}
			g.bind('touchstart mousedown', onGripMouseDown); //將 mousedown 事件綁定到開始拖動
				
			if (!dc){ 
				//如果是正常列，則綁定 mousedown 事件以開始拖動，如果被禁用，則應用其 CSS 類
				g.removeClass('JCLRdisabledGrip').bind('touchstart mousedown', onGripMouseDown);      
			}else{
				g.addClass('JCLRdisabledGrip'); 
			}

			g.t = t; g.i = i; g.c = c;	c.w = c.width();		//將一些值存儲在把手節點的數據中以作為快捷方式
			t.g.push(g); t.c.push(c);						//將當前把手和列添加到其表格對象中
			c.width(c.w).removeAttr("width");				//列的寬度轉換為基於像素的尺寸
			g.data(SIGNATURE, {i:i, t:t.attr(ID), last: i == t.ln-1});	 //將把手的索引和表格名稱存儲在 HTML 中												
		}); 	
		t.cg.removeAttr("width");	//從 colgroup 中的元素中刪除寬度屬性

		console.log("t.g: ", t.g)
		console.log("t.c: ", t.c)
		values.t_g = t.g;
		values.t_c = t.c;

		t.find('td, th').not(th).not('table th, table td').each(function(){  
			$(this).removeAttr('width');	//從所有不嵌套在其他表格中且不屬於標頭的表格單元格中刪除寬度屬性
		});	
			
		//20230809
		if (t.opt.openflex) {
			if(!t.f){
				console.log("createGrips 1 before t.w: ",t.w)
				t.removeAttr('width').addClass(FLEX); //如果不是固定的，讓表格根據需要增長
				console.log("createGrips 1 after t.w: ",t.w)	
				console.log("createGrips 1")	
			}

		}

		syncGrips(t); 				//分隔把手根據當前的表格佈局進行定位			
		//有個小問題，表格中的某些單元格可能包含與該插件設定的寬度值干擾的尺寸值，這些值將被刪除
		console.log("createGrips")	
	};

	
    
	/**
	 * 這個函數允許在瀏覽器 postback 後持久保留列的尺寸。它基於 HTML5 的 sessionStorage 對象，
	 * 在舊的瀏覽器中可以使用 sessionstorage.js 來模擬。
	 * @param {jQuery ref} t - 表格物件
	 * @param {jQuery ref} th - 對第一行元素的引用（僅在反序列化時設置）
	 */
	var memento = function(t, th){ 
		var w, m = 0, i = 0, aux = [], tw;
		if(th){										//在反序列化模式下（瀏覽器 postback 後）
			t.cg.removeAttr("width");
			if(t.opt.flush){ S[t.id] = ""; return;} 	//如果 flush 被啟用，則刪除存儲的數據
			w = S[t.id].split(";");					//獲取列的寬度數據
			tw = w[t.ln+1];
			if(!t.f && tw){							//如果不是固定寬度且有可用的表格寬度數據，則恢復其大小
				t.width(tw *= 1);
				if(t.opt.overflow) {				//如果 overflow 標誌被設置，則也恢復表格寬度作為表格最小寬度
					t.css('min-width', tw + PX);
					t.w = tw;
				}
			}
			for(;i < t.ln; i++){						//對於每一列
				aux.push(100 * w[i] / w[t.ln] + "%"); 	//將寬度存儲在數組中，因為稍後將再次需要
				th.eq(i).css("width", aux[i] ); 	//恢復每一列的寬度（以％為單位）
			}			
			for(i = 0; i < t.ln; i++)
				t.cg.eq(i).css("width", aux[i]);	//這段代碼是必需的，以便在“col”元素中創建具有比現有 CSS 類更高優先級的內聯 CSS 規則
		}else{							//在序列化模式下（調整列寬後）
			S[t.id] = "";				//清除以前的數據
			for(;i < t.c.length; i++){	//遍歷每個列
				w = t.c[i].width();		//獲取寬度
				S[t.id] += w + ";";		//將寬度添加到 sessionStorage 對象中，使用 ID 作為鍵
				m += w;					//更新總寬度以獲取列所佔用的總空間
			}
			S[t.id] += m;							//序列化字符串的最後一個項目是表格的有效區域（寬度），
													//以便在反序列化時能夠獲取每個列的％寬度值
			if(!t.f) S[t.id] += ";" + t.width(); 	//如果不是固定寬度，則存儲表格寬度
		}	
		console.log("memento")	
	};

	
	
	/**
	 * 此函數根據當前的表格佈局，將每個 grip 放置在正確的位置上	 
	 * @param {jQuery ref} t - 表格物件
	 */
	var syncGrips = function (t){	
		t.gc.width(t.w);			// 更新 grip 容器的寬度		
		console.log("t.w: ",t.w)		
		for(var i=0; i<t.ln; i++){	// 對於每一列
			var c = t.c[i]; 			
			t.g[i].css({			// 根據表格佈局更新 grip 的位置和高度
				left: c.offset().left - t.offset().left + c.outerWidth(false) + t.cs / 2 + PX,
				height: t.opt.headerOnly? t.c[0].outerHeight(false) : t.outerHeight(false)				
			});			
		} 	
		console.log("syncGrips")
	};

	
	
	
	/**
	 * 此函數根據拖曳的 grip 的水平位置增量，更新列的寬度。該函數可以在拖曳時如果啟用了 liveDragging，
	 * 以及從 onGripDragOver 事件處理程序中呼叫，以同步 grip 的位置與相關列。
	 * @param {jQuery ref} t - 表格物件
	 * @param {number} i - 正在拖曳的 grip 的索引
	 * @param {bool} isOver - 用於識別函數是否從 onGripDragOver 事件處理程序中呼叫
	 */

	var syncCols = function(t,i,isOver){
		var inc = drag.x-drag.l, c = t.c[i], c2 = t.c[i+1]; 			
		var w = c.w + inc;	var w2= c2.w- inc;	//獲取其新寬度		
		c.width( w + PX);
		// console.log("w + PX: ", w + PX)			
		t.cg.eq(i).width( w + PX); 
		if(t.f){ // 如果是固定模式
			c2.width(w2 + PX);
			t.cg.eq(i+1).width( w2 + PX);
			console.log("syncCols 1")	
		}else if(t.opt.overflow) {				// 如果設置了 overflow，增加最小寬度以強制溢出
			t.css('min-width', t.w + inc);
			console.log("syncCols 2 :")
			console.log("t.w: ", t.w)
			console.log("inc: ", inc)
		}
		if(isOver){
			c.w=w; 
			c2.w= t.f ? w2 : c2.w;
			console.log("syncCols 3")
		}
		console.log("syncCols")	


	};


	
	/**
	 * 此函數根據實際寬度更新所有列的寬度。必須考慮到在某些情況下，所有列的寬度之和可能會超過表格的寬度
	 * （如果 fixed 設為 false，且表格具有某種最大寬度）。
	 * @param {jQuery ref} t - 表格物件	
	 */
	var applyBounds = function(t){
		var w = $.map(t.c, function(c){			// 獲取實際寬度
			console.log("applyBounds 1")	
			return c.width();
		});

		// 20230809
		if (t.opt.openflex) {
			var t_w_test = t.width()
			t.width(t.w = t.width()).removeClass(FLEX);	// 防止表格寬度變化
			console.log("applyBounds 2_t.w :", t.w )
			console.log("applyBounds 2_t_w_test :", t_w_test )
		}

		$.each(t.c, function(i,c){
			c.width(w[i]).w = w[i];				// 設置列寬度，應用邊界（表格的最大寬度）
			console.log("applyBounds 3_w[i]: ",c.width(w[i]).w)
		});

		// 20230809
		if (t.opt.openflex) {
			var t_w_test = t.width()
			console.log("applyBounds 4 before t.w: ",t.w)
			console.log("applyBounds 4 before :", t_w_test )
			t.addClass(FLEX);						// 允許表格寬度變化
			var t_w_test = t.width()
			console.log("applyBounds 4 after t.w: ",t.w)
			console.log("applyBounds 4 after :", t_w_test )
			console.log("applyBounds 4")
		}
		console.log("applyBounds 5")	
	};

	
		
	/**
	 * 在拖動 Grip 時使用的事件處理程序。它檢查下一個 Grip 的位置是否有效並更新它。
	 * @param {event} e - 綁定到 window 物件的 mousemove 事件
	 */
	var onGripDrag = function(e){	
		if(!drag) return; 
		var t = drag.t;		//table 物件參考 
		var oe = e.originalEvent.touches;
		var ox = oe ? oe[0].pageX : e.pageX;    // 原始位置（觸摸或滑鼠）
		var x =  ox - drag.ox + drag.l;	        // 根據水平滑鼠位置增量計算下一個位置
		var mw = t.opt.minWidth, i = drag.i ;	// 單元格的最小寬度
		var l = t.cs*1.5 + mw + t.b;
		var last = i == t.ln-1;                 			// 檢查是否為最後一列的 Grip（通常隱藏）
		var min = i? t.g[i-1].position().left+t.cs+mw: l;	// 根據相鄰的單元格計算最小位置
		var max = t.f ? 	// 固定模式？
			i == t.ln-1? 
				t.w-l: 
				t.g[i+1].position().left-t.cs-mw:
			Infinity; 								// 根據相鄰的單元格計算最大位置
		x = M.max(min, M.min(max, x));				// 應用邊界
		drag.x = x;	 drag.css("left",  x + PX); 	// 應用位置增量	
		if(last){									// 如果是最後一個 Grip
			var c = t.c[drag.i];					// 獲取最後一列的寬度
			drag.w = c.w + x- drag.l;         
		}              
		if(t.opt.liveDrag){ 			// 如果啟用了 liveDrag
			if(last){
				c.width(drag.w);
				if(!t.f && t.opt.overflow){			// 如果設置了 overflow，將最小寬度增加以強制顯示溢出
					t.css('min-width', t.w + x - drag.l);
				}else {
					t.w = t.width();
				}
			}else{
				syncCols(t,i); 			// 同步列
			}
			syncGrips(t);
			var cb = t.opt.onDrag;							// 檢查是否存在 onDrag 回調
			if (cb) { e.currentTarget = t[0]; cb(e); }		// 如果有，則調用該回調函數			
		}
		console.log("onGripDrag")	
		return false; 	// 在拖動時防止選取文本				
	};

	

	/**
	 * 當拖動結束時觸發的事件處理程序，更新表格佈局
	 * @param {event} e - Grip 的 drag over 事件
	 */
	var onGripDragOver = function(e){	
		
		d.unbind('touchend.'+SIGNATURE+' mouseup.'+SIGNATURE).unbind('touchmove.'+SIGNATURE+' mousemove.'+SIGNATURE);
		$("head :last-child").remove(); 				// 刪除拖動游標樣式	
		if(!drag) return;
		drag.removeClass(drag.t.opt.draggingClass);		// 刪除 Grip 的拖動 css 類
		if (!(drag.x - drag.l == 0)) {
			var t = drag.t;
			var cb = t.opt.onResize; 	    // 獲取一些值	
			var i = drag.i;                 // 列索引
			var last = i == t.ln-1;         // 檢查是否為最後一列的 Grip（通常隱藏）
			var c = t.g[i].c;               // 正在拖動的列
			if(last){
				c.width(drag.w);
				c.w = drag.w;
			}else{
				syncCols(t, i, true);	// 更新列
			}
			if(!t.f) applyBounds(t);	// 如果不是固定模式，則應用邊界以獲取實際寬度值
			syncGrips(t);				// 更新 Grips
			if (cb) { e.currentTarget = t[0]; cb(e); }	// 如果存在回調函數，則調用它
			if(t.p && S) memento(t); 	// 如果啟用了 postbackSafe，並且支持 sessionStorage，則序列化並存儲新佈局
		}
		drag = null;   // 因為 Grip 的拖動結束了	
		console.log("onGripDragOver")									
	};	

	
	
	/**
	 * 當 Grip 開始拖動時觸發的事件處理程序。其主要目標是設置事件並存儲在拖動時使用的一些值。
	 * @param {event} e - Grip 的 mousedown 事件
	 */
	var onGripMouseDown = function(e){
		var o = $(this).data(SIGNATURE);			// 檢索 Grip 的數據
		var t = tables[o.t],  g = t.g[o.i];			// 表格和 Grip 對象的捷徑
		var oe = e.originalEvent.touches;           // 觸摸還是鼠標事件？
		g.ox = oe ? oe[0].pageX : e.pageX;            // 保留初始位置
		g.l = g.position().left;
		g.x = g.l;

		d.bind('touchmove.'+SIGNATURE+' mousemove.'+SIGNATURE, onGripDrag ).bind('touchend.'+SIGNATURE+' mouseup.'+SIGNATURE, onGripDragOver);	// 綁定 mousemove 和 mouseup 事件
		h.append("<style type='text/css'>*{cursor:"+ t.opt.dragCursor +"!important}</style>"); 	// 更改鼠標游標
		g.addClass(t.opt.draggingClass); 	// 添加拖動類（以提供一些視覺反饋）
		drag = g;							// 當前的 Grip 被存儲為當前的拖動對象
		if(t.c[o.i].l) for(var i=0,c; i<t.ln; i++){ c=t.c[i]; c.l = false; c.w= c.width(); } 	// 如果列被鎖定（在瀏覽器調整大小後），則必須更新 c.w
		console.log("onGripMouseDown")		
		return false; 	// 防止文本選擇
	};

    
    
	/**
	 * 當瀏覽器大小調整時觸發的事件處理程序。此函數的主要目的是根據瀏覽器的大小更新表格佈局，同步相關的 Grip。
	 */
	var onResize = function(){
		for(var t in tables){
			if( tables.hasOwnProperty( t ) ) {
				t = tables[t];
				var i, mw=0;
				t.removeClass(SIGNATURE);   // Firefox 在某些情況下不支持 layout-fixed
				if (t.f) {                  // 在固定模式下
					t.w = t.width();        // 保留其新寬度
					for(i=0; i<t.ln; i++) mw += t.c[i].w;		
					// 單元格呈現並不像可能看起來那麼簡單，對於每個瀏覽器來說稍微有些不同。
					// 起初，我對每個瀏覽器都使用了一個大的 switch 語句，但由於代碼非常醜陋，
					// 現在我使用了一種不同的方法，進行了多次重排。這效果還不錯，但速度稍慢。
					// 目前，讓事情保持簡單...
					for(i=0; i<t.ln; i++) t.c[i].css("width", M.round(1000*t.c[i].w/mw)/10 + "%").l=true; 
					// c.l 鎖定了該列，告訴我們其 c.w 是過時的								
				} else {     // 在非固定大小的表格中
					applyBounds(t);         // 應用新的邊界
					if(t.mode == 'flex' && t.p && S){   // 如果啟用了 postbackSafe，並且支援 sessionStorage，
						memento(t);                     // 將新的佈局序列化並存儲給 'flex' 表格
					}
				}
				syncGrips(t.addClass(SIGNATURE));
			}
		} 
		console.log("onResize")	
	};
	


	//bind resize event, to update grips position 
	$(window).bind('resize.'+SIGNATURE, onResize); 
	console.log("$(window).bind('resize.'+SIGNATURE, onResize); ")	


	var test_qq_aa = function() {
		console.log("test_qq_aa")
	}

	/**
	 * The plugin is added to the jQuery library
	 * @param {Object} options -  an object that holds some basic customization values 
	 */
	$.fn.extend({  
		colResizable: function(options) {           
			var defaults = {
				// 屬性:
				
				resizeMode: 'fit',                    // 模式可以是 'fit'、'flex' 或 'overflow'
				draggingClass: 'JCLRgripDrag',        // 拖曳 Grip 時使用的 CSS 類別（用於視覺反饋）
				gripInnerHtml: '',                    // 如果需要使用自定義的 Grip，可以透過自訂的 HTML 來完成
				liveDrag: false,                      // 啟用拖曳時更新表格佈局
				minWidth: 15,                          // 列的最小寬度（以像素為單位）
				headerOnly: false,                    // 是否僅將列調整大小的錨點限制為第一行的大小
				hoverCursor: "e-resize",              // 在 Grip 懸停時使用的游標樣式
				dragCursor: "e-resize",               // 拖曳時使用的游標樣式
				postbackSafe: false,                  // 啟用後，表格佈局可以在回發或頁面刷新後保留。它需要支援 sessionStorage 的瀏覽器（也可以使用 sessionStorage.js 進行模擬）。
				flush: false,                         // 啟用 postbackSafe 後，如果需要在回發後阻止佈局恢復，'flush' 將刪除其相關的佈局數據
				marginLeft: null,                     // 如果表格包含任何邊距，colResizable 需要知道使用的值，例如 "10%"、"15em"、"5px" ...
				marginRight: null,                    // 如果表格包含任何邊距，colResizable 需要知道使用的值，例如 "10%"、"15em"、"5px" ...
				disable: false,                       // 禁用先前 colResized 表格中進行的所有增強功能
				partialRefresh: false,                // 當表格位於 updatePanel 內時，可以與 postbackSafe 結合使用
				disabledColumns: [],                  // 要排除的列索引

				//20230809
				openflex: false,
				
				// 事件:
				onDrag: null,                          // 如果啟用了 liveDrag，則在列調整大小過程中觸發的回調函數
				onResize: null                         // 在調整大小過程結束時觸發的回調函數
			};			
			var options =  $.extend(defaults, options);	
			
			// 從現在開始，有 3 種不同的列調整大小方式，我改變了外部界面以使其更清晰
			// 將其稱為 'resizeMode'，但同時也刪除了「fixed」屬性，這對許多人來說可能會混淆
			options.fixed = true;
			options.overflow = false;
			switch(options.resizeMode){
				case 'flex': options.fixed = false; break;
				case 'overflow': options.fixed = false; options.overflow = true; break;
			}

			return this.each(function() {				
				init(this, options);    
				console.log("init(this, options);")  
				console.log("init(this, options)this;", this)       
			});
		}
	});
	

    window.test_qq_aa = test_qq_aa; // 將函數暴露為全局變數


})(jQuery);




var myModule = (function($){ 
    var test_qq_aa = function() {
        console.log("test_qq_aa1");
    };
    
    
    return {
        test_qq_aa: test_qq_aa // 返回一個包含函數的對象
    };



})(jQuery);


// 在您的 JavaScript 文件中定義 myModule 建構函數
function myModuleqq() {
    this.test_qq_aa = function() {
        console.log("test_qq_aaqq");
    };
}