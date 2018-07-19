!function(){
	
	var requireOption = {
		path : '',
	};
	
	var defineName = '';
	
	var require = function(name,callback){
		var path = requireOption.path,
			argu = [],
			key = false,
			length = name.length;
		
		name.forEach(function(e,i,ar){
			if(e.indexOf(".js") < 0){
				ar[i] += ".js";
			}
		})
		
		if( name.length > 0 ){
			
			for( var i = 0 ; i < name.length ; i++ ){
				
				if( typeof defineData.get(name[i]) === 'undefined' ){
					require.ajax({
					 	type: 'get',
					 	url : requireOption.path + name,
					 	success: function(e){
					 		defineName = this.responseURL.split('/').pop()
					 		defineName = defineName.substr(0,defineName.length-1);
					 		eval( "Lwz." + e.currentTarget.responseText);
					 	},
					 	error: function(){
					 		--length
					 	}
				 	});
				 	
				}
				
				defineData.get(name[i],function(data,n){
			 		argu[name.indexOf(n)] = data;
			 		if( --length == 0 ){
						callback.apply(this,argu)
					}
			 	})
				
			}
			
		} else{
			callback.apply(this,argu)
		} ;	

	}
	var getXML = function(){
		if( XMLHttpRequest )
			return new XMLHttpRequest();
		else
			return new ActiveXObject("Microsoft.XMLHTTP");
	}
	require.XMLHttp = getXML();
	require.option = requireOption;
	require.ajax = function(option = {}){
		var url = option.url;
		if( !url ) return;
		var mothed = option.type || "get";
		var data = "";
		for( var i in option.data )
			data += i + "=" + option.data[i] + "&";
		var success = option.success;
		var error = option.error;
		var complete = option.complete;
		var ajax = require.XMLHttp;

		//判断是否是post请求
		if( mothed === "post" ){
			//如果是则添加头部文件
			ajax.setRequestHeader("Content-type","application/x-www-form-urlencoded");
		}else{
			url += "?" + data;	
			data = undefined;
		}
		
		//建立请求连接
		ajax.open(mothed,url);
		
		//发送请求
		ajax.send(data);
		
		//请求回调
		ajax.onreadystatechange = function(e){
			if( this.readyState == 4 ){
				if( this.readyState == 4 && this.status == 200 )
					success.apply(this,arguments);
				else if( this.readyState == 4 && this.status.toString()[0] != "2" )
					error.apply(this,arguments);
				complete && complete.apply(this,arguments);
			}
		}
		
	}
	
	
	var define = function(){
		var argLen = arguments.length,
			name = arguments[0],
			depend = arguments[1],
			object1 = arguments[2],
			notArgu = [],
			argu = [];
		try{
			
			//判断是否给模块命名
			if( typeof name !== 'string' ){
				object1 = depend; 
				depend = name;
				name = defineName;
			}
		
			//如果存在依赖模块的话
			if( typeof depend === 'object' 
			 && typeof depend.length == 'number'
			 && depend.constructor === Array) {
			 	
			 	depend.forEach(function(e,i,ar){
					if(e.indexOf(".js") < 0){
						ar[i] += ".js";
					}
				})
			 	
				//先判断依赖模块是否已经被加载了
				for( var i = 0; i < depend.length ; i ++ ){
					if(typeof defineData.get(depend[i]) === 'undefined'){
						//如果存在没有被加载的模块
						notArgu.push(depend[i]);
					}else{
						argu[i] || ( argu[i] = defineData.get(depend[i]) );
					}
				}
				
				if( notArgu.length > 0 ){
					//进入加载模块
					//并在加载成功后重新运行函数
					require(notArgu,define.bind(this,name,depend||[],object1));
					return ;
				}
			}else {
				object1 = depend;
				depend = undefined;
			}

		}catch(e){
			console.error(name+"文件加载错误；")
			console.error(e);
		}
		
		//不存在未被加载的依赖模块
		if( typeof object1 === 'function' ){
			defineData.set(name,object1.apply(this,argu));				
		}else{
			defineData.set(name,object1);
		}
		
	}
	
	var defineData = {
		data : {},
		get : function( name , callback ){
			name.indexOf(".js") < 0 && ( name+='.js' );
			var data = this.data[name];
			if( !callback ) return data;
			if( data ){
				callback.call(this,data,name);
				return data; 				
			}else{
				this.waitLoad[name] || (this.waitLoad[name] = []);
				this.waitLoad[name].push(callback);
			}
		},
		set : function( name , data ){ 
			this.data[name] = data;
			console.log(name+'注册成功。')
			console.log(data);
			var waitFunction = this.waitLoad[name];
			for( ;; ){
				if( waitFunction.length < 1 ) break;
				waitFunction.pop()(data,name);
			}
		},
		waitLoad : {}
	};
	
	window.require || (window.require = require);
	window.define || (window.define = define);
	window.Lwz = {
		data : defineData,
		require : require,
		define : define
	};

}()
