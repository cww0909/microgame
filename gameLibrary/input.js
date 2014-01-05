//-------------------------------------------------- //
/*
Input.js - 
Creates an object that holds the current state of input devices.
Hooks up event handlers for input.
*/
//---------------------------------------------------//

(function($){
	var Input = function(containerID, layermanager){		
		//some constants
		this.LAYER_ID = game.CURSOR;
		this.LEFT_CLICK = 1;
		this.MIDDLE_CLICK = 2;
		this.RIGHT_CLICK = 3;
		this.ESC_KEY = 27;
		this.ONE_KEY = 49;
		this.TWO_KEY = 50;
		this.THREE_KEY = 51;
		this.SPACE_BAR = 32;
		
		this.layercontext = null;		
		this.mouse = {startX: 0, startY: 0, x: 0, y:0};
		this.state = {selecting: false, move: false};
		this.plane_select = -1; 
		this.state.selecting = false;
		this.move = false;
		
		var topLeftX, topLeftY, height, width;
			that = this;
					
		this.init = function(containerID, layermanager){
			$("#"+containerID).on({
				mousedown: this.mouse_down.bind(this),
				mouseup: this.mouse_up.bind(this),
				mouseout: this.mouse_out.bind(this),
				mousemove: this.mouse_move.bind(this),
				contextmenu: function(event){
					return false;
				},mouseenter: this.mouse_enter.bind(this),
				keydown: this.key_down.bind(this)
			});
			
			this.layercontext = layermanager.getLayerContext(this.LAYER_ID);
		};	
		
		this.reset_style = function(){
			that.layercontext.strokeStyle = "rgba(191,44,204,1.0)";
			that.layercontext.fillStyle = "rgba(222,135,229,0.5)";			
		};
		
		this.mouse_down = function(event){
			this.mouse.startX = event.pageX;
			this.mouse.startY = event.pageY;
			if(event.which === this.LEFT_CLICK){
				this.state.selecting = true;
				this.plane_select = -1;
				draw_selectbox();
			}
			if(event.which === this.RIGHT_CLICK){
				this.state.move = true;
				this.mouse.x = event.pageX;
				this.mouse.y = event.pageY;	
			}
			event.preventDefault();			
		};		
		
		this.mouse_up = function(event){
			if(event.which == this.LEFT_CLICK){
				this.state.selecting = false;
				clear_selectbox();		
			}
			if(event.which == this.RIGHT_CLICK){
				this.state.move = false;			
			}
			event.preventDefault();			
		};
		
		this.mouse_move = function(event){
			this.mouse.x = event.pageX;
			this.mouse.y = event.pageY;
			if(this.state.selecting === true && game.system.state =="running"){
				clear_selectbox();
				draw_selectbox();
			}			
		};
		
		this.mouse_out = function(event){
			this.state.selecting = false;	
			clear_selectbox();		
		};
		
		this.mouse_enter = function(event){
			$("#container").focus();
		};
		
		this.key_down = function(event){
			if(event.which == this.ONE_KEY){
				this.plane_select = 0;
			}else if(event.which == this.TWO_KEY){
				this.plane_select = 1;
			}else if(event.which == this.THREE_KEY){
				this.plane_select = 2;
			}
		};
		
		this.contains = function(x, y, radius){  
			var unitLeft = x-radius;
				unitRight = x+radius;
				unitTop = y-radius;
				unitBottom = y+radius;
				
			if(unitLeft<=topLeftX+width && unitLeft>=topLeftX){
				if(unitTop>=topLeftY && unitTop<=topLeftY+height){
					return true;
				}else if(unitBottom>=topLeftY && unitBottom<=topLeftY+height){
					return true;
				}
			}else if(unitRight<=topLeftX+width && unitRight>=topLeftX){
				if(unitTop>=topLeftY && unitTop<=topLeftY+height){
					return true;
				}else if(unitBottom>=topLeftY && unitBottom<=topLeftY+height){
					return true;
				}
			}
			return false;						
		};
		
		var draw_selectbox = function(){
			topLeftX = that.mouse.startX < that.mouse.x ? that.mouse.startX : that.mouse.x;
			topLeftY = that.mouse.startY < that.mouse.y ? that.mouse.startY : that.mouse.y;
			height = Math.abs(that.mouse.startY - that.mouse.y);
			width = Math.abs(that.mouse.startX - that.mouse.x);
			that.layercontext.strokeRect(topLeftX, topLeftY, width, height);
			that.layercontext.fillRect(topLeftX + that.layercontext.lineWidth, topLeftY + that.layercontext.lineWidth, width - 2*that.layercontext.lineWidth, height - 2*that.layercontext.lineWidth);	
		};
		
		var clear_selectbox = function(){
			game.system.layermanager.clearLayer(that.LAYER_ID);
		};
		
		this.init(containerID, layermanager);
	};
	
    //add class to game namespace
    game.Input = Input;
})(jQuery);
