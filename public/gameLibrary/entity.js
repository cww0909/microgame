//-------------------------------------------------- //
/*
Entity.js - 
Creates an object which other entities can pull components from
*/
//---------------------------------------------------//

(function ($){
	var Entity = {		
		init: function(){		
			this.LAYER_ID = null;	
			this.layercontext = null;
			this.type = null;	//type of entity (player, enemy, or health etc)
			this.img = null;	//image of entity
			this.isLoaded = false;	//is entity loaded
			this.state = null;	//state of entity (dependent on entity type)
			this.isActive = true;	//used to check if entity should be drawn
			this.rel_size = 0;	//entity size relative to screen width
			this.unit_size = {width: undefined, height: undefined};	//real dimensions of drawn image
			this.unit_center = {x: 0, y:0};	//center point of unit
			this.pos = {x: -1, y: -1, angle: 0};	//position and facing direction (relative to map)
			this.velocity = {x:0, y:0};	//directional and angular velocity
			this.acceleration = 0;	//used for increasing velocity
			this.diffTraveled = {x:0, y:0, angle:0};	//difference between current and last position
			this.radius = 0;	//used for collision calculation
			this.destination = {x: -1, y: -1, angle: 0};
			this.MAX_SPEED = 0; //px per frame
			this.dest_thresh = 0; //maximum distance from destination to be considered arrived
			this.frames = [];	//array of frames for animation and drawing
            this.currentframe = 0;	//current animation frame
            this.anim_seq = [];	//animation frames sequence
            this.anim_speed = 1; //dictates how fast the animation frames are played (higher = slower)
            this.interpolate_diff = { x: 0, y: 0, angle: 0 }; //difference between last and current position
            this.last = { x: 0, y: 0, angle: 0 }; //last position of object
		},
		
		update_pre: function(){	
            //interpolation setup
            this.last.x = this.pos.x;
            this.last.y = this.pos.y;
            this.last.angle = this.pos.angle;		
		},
		
		update: function(){
			
		},
		
		update_post: function(){
            //interpolation 
            this.interpolate_diff.x = this.pos.x - this.last.x;
            this.interpolate_diff.y = this.pos.y - this.last.y;
            this.interpolate_diff.angle = this.pos.angle - this.last.angle;		
		},
		
		resized: function(){
			this.radius = (0.5*game.CANVAS_W*this.rel_size) |0;
			var width_to_height = this.img.height/this.img.width;
			this.unit_size.width = (game.CANVAS_W*this.rel_size) |0;
			this.unit_size.height = (this.unit_size.width*width_to_height) |0;
			this.unit_center.x = (this.unit_size.width/2) | 0;
			this.unit_center.y = (this.unit_size.height/2) | 0;		
		},
		
		draw: function(){
			if(this.isLoaded === true){
				//draw image with proper facing direction
				var x = (this.pos.x + (this.interpolate_diff.x * game.system.interpolationvalue)) |0;
					y = (this.pos.y + (this.interpolate_diff.y * game.system.interpolationvalue)) |0;
				this.layercontext.save();								
				this.layercontext.translate(x,y);
				this.layercontext.rotate(this.pos.angle);				
				this.layercontext.drawImage(this.img, 
					-this.unit_center.x, -this.unit_center.y, 
					this.unit_size.width, this.unit_size.height
					);
				this.layercontext.restore();				
			}		
		},
		
		load_img: function(path){
			this.img = new Image();
			this.img.src = path;
			return this.img;			
		},
		
		load: function(){
			//sets up drawn image attributes once its loaded
			this.isLoaded = true;
			var width_to_height = this.img.height/this.img.width;
			this.unit_size.width = (game.CANVAS_W*this.rel_size) |0;
			this.unit_size.height = (this.unit_size.width*width_to_height) |0;
			this.unit_center.x = (this.unit_size.width/2) | 0;
			this.unit_center.y = (this.unit_size.height/2) | 0;
		},
		
		has_collided: function(entity){ //checks if it has collided
			if(game.system.get_dist(this.pos.x, this.pos.y, entity.pos.x, entity.pos.y) < this.radius){
				return true;
			}
			else{
				return false;				
			}
		},
		
		notify_collision: function(){
		}
		
	};
	
	//add class to game Namespace
	game.Entity = Entity;
})(jQuery);
