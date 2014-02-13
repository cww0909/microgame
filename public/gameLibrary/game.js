(function () {
    $(document).ready(function(){
    	startgame();
        window.game.isPaused = false;
    });
})();

(function (window) {
	
    //game Namespace
    window.game = {
        system: null,
        isPaused: false,
		//some constants
		CANVAS_H: 600,
		CANVAS_W: 800,
		CANVAS_ID: "game_canvas",
		BACKGROUND: 0,
		ENEMY: 1,
		PLAYER: 2,
		CURSOR: 3,
		UI: 4        
    };

    //Setup Request Animation Frame usage according to user's browser
    var prefixes = ['ms', 'moz', 'webkit', 'o'];
    for (var i = 0; i < prefixes.length && !window.requestAnimationFrame; i++) {
        window.requestAnimationFrame = window[prefixes[i] + 'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[prefixes[i] + 'CancelAnimationFrame'] ||
        							window[prefixes[i] + 'CancelRequestAnimationFrame'];
    }
})(window);

var System = function(updateFPS, containerID){
	this.gametick = 0;
	this.dt = 0;
	this.now = 0;
	this.last = 0;
    this.interpolationvalue = 0; //time elapsed between last frame and current frame(for smoother animation)
	
	this.frameID = 0;
	this.intervalID = 0;
	
	this.layermanager = null;	
	this.inputmanager = null;
	this.background = null;
	this.ui = null;
	this.entities = [];
	this.players = [];
	this.enemies = [];
	
	this.num_players = 0;
	this.num_enemies = 0;
	
	this.score = 0;
	this.highscore = 0;
	
	this.prev_state = "none";
	this.state = "none";
		
	this.init = function(){
		//initialize container
		var container = $("#"+containerID).css({
							"width": game.CANVAS_W,
							"height": game.CANVAS_H,
							"position": "absolute",
							"top": "0px",
							"left": "0px",
							"margin": "0px"
						}).attr("tabindex",0);

        this.gametick = 1000 / updateFPS; //finds game tick in Milliseconds from FPS given
        this.gametick = parseFloat(this.gametick.toFixed(5)); //to fix float errors
        
		this.layermanager = new game.Layers(containerID);
		this.inputmanager = new game.Input(containerID, this.layermanager.getLayerContext);
		this.background = new game.Background(this.layermanager.getLayerContext, 0); //use background1
		
		container.focus();
		
		//init ui
		this.state = "starting";
		this.ui = new game.Interface(this.layermanager.getLayerContext, this.state);
		
		//start the game loop
		var that = this;
		this.intervalID = setInterval(
			function(){ 
				that.run(); 
			}, 1
		); //trigger run() every milisecond		
	};
	
	this.run = function(){
        //MAIN RUN LOOP
        //Run Step to decouple draw and update
        this.now = Date.now();
		this.dt = this.dt + Math.min(this.now - this.last, this.gametick * 5); //cap change in time at 5 frames

        while (this.dt > this.gametick) {
            this.update();
            this.dt -= this.gametick;
        }

        var that = this;

		//DRAWING SECTON
        window.cancelAnimationFrame(this.frameID); //cancel request if hasnt been drawn yet

        if (game.isPaused === false) {
            this.frameID = requestAnimationFrame(function () {
                //calculates the interpolation value for the frame
                that.interpolationvalue = Math.min((that.dt + (Date.now() - that.now)) / that.gametick, 1);
                that.lastinterpval = that.interpolationvalue;

                that.draw();
            });
        }
        else {
            //if game is paused dont update interpolation value
            that.interpolationvalue = that.lastinterpval;
            that.draw();
        }
		
		this.last = Date.now();
	};
	
	this.update = function(){
		switch(this.state){
			case "starting":
				if(this.score > this.highscore){
					this.highscore = this.score;
				}
				this.score = 0;
				this.ui.update();
				break;
			case "running":
				var entity = null;
					input = game.system.inputmanager;
				
				//main logic
				for (var i = 0; i < this.entities.length; i++) {
					entity = this.entities[i];
                   	entity.update();
                    
                    //if entity is a player unit
                 	if(entity.type == "player" && entity.state == "alive"){
                 		//draw select box and select player unit
                 		if(input.state.selecting){
                 			if(this.get_dist(entity.pos.x, entity.pos.y, input.mouse.startX, input.mouse.startY) < entity.radius
                 			|| input.contains(entity.pos.x, entity.pos.y, entity.radius)){
                 				entity.selected = true;
                 			}else{  
                 				entity.selected = false;
                 			}
                 		}
                 		
                 		//move if user right clicked
		                if(input.state.move && entity.selected){
		                	entity.destination.x = input.mouse.x;
		                	entity.destination.y = input.mouse.y;
		                }
		                
		                //check for collisions
		                var entity2 = null;
		                for(var j=0; j<this.entities.length; j++){
		                	if(i==j) continue;
		                	
		                	entity2 = this.entities[j];
		                	if(entity.has_collided(entity2) && entity2.state == "alive"){
		                		if(entity2.type == "missile" || entity2.type == "player"){
		                			entity.notify_collision();
		                			entity2.notify_collision();
		                			break;
		                		}
		                	}
		                }
                 	}                  
                }
                
                if(input.plane_select != -1 && this.players[input.plane_select].state == "alive"){
                	for(var i=0; i<this.players.length; i++){
                		if(i == input.plane_select){
                			this.players[i].selected = true;
                		}else{
                			this.players[i].selected = false;                			
                		}
                	}
                }
                
                //check if game is over
                var isGameOver = true;
                for(var i=0; i<this.players.length; i++){
                	isGameOver = isGameOver && !this.players[i].isActive;
                }
                if(isGameOver){
                	this.state = this.ui.state = "starting";
                	var scoreObj = {name: this.ui.playername, score: this.score};
                	$.post("/highscores",scoreObj);
                }
				break;
			default:
				break;
		}
	};
	
	this.draw = function(){
		switch(this.state){
			case "starting":
				this.layermanager.clearLayer(game.UI);
				this.ui.draw();
				break;
			case "running":
				//clear layers to be animated
				this.layermanager.clearLayer(game.PLAYER);
				this.layermanager.clearLayer(game.ENEMY);
				
				for (var i = 0; i < this.entities.length; i++) {
                    if (this.entities[i].isActive === true) {
                        this.entities[i].draw();
                    }
                }
                this.ui.draw();
				break;
			case "resized":
				this.background.draw();
				this.inputmanager.reset_style();for (var i = 0; i < this.entities.length; i++) {
					this.entities[i].resized();
                }
                this.ui.resized();
				this.state = this.prev_state;
				break;
		}
	};
	
	this.unload = function(){		
	};
	
	this.get_dist = function(srcx, srcy, destx, desty){
		dx = destx - srcx;
		dy = desty - srcy;
		return Math.sqrt(dx*dx + dy*dy);
	};
	
	this.increment_score = function(){
		var playersActive = 0;
		for(var i=0; i<this.players.length; i++){
			if(this.players[i].state == "alive")
				playersActive++;
		}
		switch(this.ui.selected_difficulty){
			case "Easy":
				this.score += Math.pow(playersActive,2);
				break;
			case "Medium":
				this.score += 2*Math.pow(playersActive,2);
				break;
			case "Hard":
				this.score += 4*Math.pow(playersActive,2);
				break;
			case "Insane":
				this.score += 8*Math.pow(playersActive,2);
				break;
		}
	};
	
	this.init();
};

var startgame = function(){
	//called when page loads to initialize game
	game.system = new System(60, "container");
	
	//resize
	$(window).on("resize",
		{container_id: "container"
		} ,function(event){
			resize(event.data.container_id);
			if(game.system.state != "resized"){
				game.system.prev_state = game.system.state;				
			}
			game.system.state = "resized";
		}
	).resize();
};

