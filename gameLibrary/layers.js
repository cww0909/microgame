//-------------------------------------------------- //
/*
Layers.js - 
Handles the drawing and management of the different canvas layers
*/
//---------------------------------------------------//
(function($){
	var Layers = function(containerID){					
		//collection of layers
		var layers = [];
		
		this.init = function(containerID){
			var container = $("#container");
			for(var i=0 ; i<5 ; i++){
				layers[i] = $("<canvas></canvas>",{
									"id": game.CANVAS_ID + i
								}).css({
									"position": "absolute",
									"top": "0px",
									"margin": "0px",
									"z-index": i
								}).attr({
									"width": game.CANVAS_W,
									"height": game.CANVAS_H
								}).prependTo(container);
			}			
		};
		
		this.getLayerContext = function(layer_id){
			return layers[layer_id][0].getContext("2d");
		};
		
		this.clearLayer = function(layer_id){
			this.getLayerContext(layer_id).clearRect(0 , 0, game.CANVAS_W, game.CANVAS_H);
		};
		
		this.saveContexts = function(){
			for(var i=0; i<layers.length; i++){
				this.getLayerContext(i).save();
			}
		};
		
		this.restoreContexts = function(){
			for(var i=0; i<layers.length; i++){
				this.getLayerContext(layers.length-1-i).restore();
			}			
		};
		
		this.init(containerID);
	};	
	//add class to game namespace
	game.Layers = Layers;
})(jQuery);
