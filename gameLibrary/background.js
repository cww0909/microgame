//-------------------------------------------------- //
/*
Map.js - 
Handles the drawing of the map and level
*/
//---------------------------------------------------//

(function ($){
	var Background = function(layermanager, index){
		//some constants
		this.LAYER_ID = game.BACKGROUND;
		
		this.img = null;
		this.img_pos = {x: 0, y: 0};
		this.img_src = ["media/background1.png", "media/background2.png", "media/background3.png"];
		this.layercontext = null;
		
		this.init = function(layermanager, index){
			this.img = new Image();
			this.img.src = this.img_src[index];
			this.layercontext = layermanager.getLayerContext(this.LAYER_ID);
			//draw when image finish laoding
			this.img.addEventListener("load", this.draw.bind(this));
		};
		
		this.draw = function(){
			this.layercontext.drawImage(this.img, this.img_pos.x, this.img_pos.y);
		};
		
		this.scroll_img = function(dx, dy){ //- to go left; + to go right
			this.img_pos.x += dx;
			this.img_pos.y += dy;
			//TODO: stop scroll after reaching image edges
			this.draw();
		};
		
		this.init(layermanager, index);
	};
	
	//add class to game Namespace
	game.Background = Background;
})(jQuery);
