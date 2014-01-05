//-------------------------------------------------- //
/*
scaling.js - 
Applies scaling to the canvas to dynamically adjust to screen resolutions.
*/
//---------------------------------------------------//

function resize(container_id) {
    var docelement = document.documentElement;
    var newHeight = docelement.offsetHeight;
    var newWidth = docelement.offsetWidth;

    var canvas = $("canvas");

    if (!canvas.length) {
        return false;
    };
    
    canvas.attr({
    	"width": newWidth,
    	"height": newHeight
    });

    //resizes the container object to handle canvas
    var container = $("#"+container_id);
    container.css({
			"width": newWidth + "px",
			"height": newHeight + "px"
	});
    
	game.CANVAS_W = newWidth;
	game.CANVAS_H = newHeight;
};