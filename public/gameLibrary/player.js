//-------------------------------------------------- //
/*
Player.js - 
Creates a player unit entity that is controllable by the player
*/
//---------------------------------------------------//

(function($){
	var Player = function(index, layermanager){
		this.img_src = ["media/plane1_right.png", "media/plane2_right.png", "media/plane3_right.png"];
		
		this.init = function(index, layermanager){
			//sets up the entity
			game.Entity.init.apply(this, null); 
			this.LAYER_ID = game.PLAYER;
			this.layercontext = layermanager.getLayerContext(this.LAYER_ID);
			this.layercontext.strokeStyle = "rgba(0, 255, 0, 1.0)";
			this.layercontext.lineWidth = this.linewidth = 5;
			
			this.type = "player";
			this.img = game.Entity.load_img.call(this, this.img_src[index]);
			this.state = "none"; //set to "alive when starting game"
			this.rel_size = 0.05;	
			this.pos.x = (1+index)*game.CANVAS_W/4;
			this.pos.y = game.CANVAS_H/2;	
			this.pos.angle =  0; //face right
			this.radius = (0.5*game.CANVAS_W*this.rel_size) |0;
			this.img.addEventListener("load", game.Entity.load.bind(this));
			this.destination = {x: this.pos.x, y: this.pos.y, angle: 0};
			this.MAX_SPEED = this.radius/6;
			this.dest_thresh = (this.radius/2) |0;
			
			//sets player specific attributes
			this.selected = false;
			this.death_anim = new Image();
			this.death_anim.src = "media/explosion2.png";
			this.death_anim.width = this.death_anim.height = 100;
			for(var i=0; i<9; i++){
				for(var j=0; j<9; j++){
					this.frames[9*i+j] = {x: j*this.death_anim.width, y: i*this.death_anim.height};
					this.anim_seq[9*i+j]=9*i+j;
				}
			}
			this.anim_speed = 1; //higher = slower *
			this.collision_angle = 0;
		};
		
		this.update = function(){	
            game.Entity.update_pre.apply(this, null);	
            
			if(this.state == "alive"){		
				//set facing direction to between -Math.PI and +Math.PI
				while(Math.abs(this.pos.angle) > Math.PI){
					if(this.pos.angle < 0)
						this.pos.angle += Math.PI;
					else
						this.pos.angle -= Math.PI;
				}
					
				if(game.system.get_dist(this.pos.x,this.pos.y,this.destination.x,this.destination.y)<this.dest_thresh){
					this.velocity.x = 0;
					this.velocity.y = 0;
				}else {
					this.destination.angle = Math.atan2(this.destination.y-this.pos.y, this.destination.x-this.pos.x); //ideal facing direction	
					this.velocity.x = this.MAX_SPEED*Math.cos(this.pos.angle);
					this.velocity.y = this.MAX_SPEED*Math.sin(this.pos.angle);		
				}
				if(Math.abs(this.pos.x-this.destination.x) > this.velocity.x)
					this.pos.x += this.velocity.x;
				else
					this.pos.x = this.destination.x;
					
				if(Math.abs(this.pos.y-this.destination.y) > this.velocity.y)
					this.pos.y += this.velocity.y;
				else
					this.pos.y = this.destination.y;
					
				this.pos.angle = this.destination.angle;
			}else if(this.state == "died"){
				//if sequence ends set isActive to false
				if(this.currentframe == this.anim_seq.length*this.anim_speed)
					this.isActive = false;
			}
			
            game.Entity.update_post.apply(this, null);
		};
		
		this.resized = function(){
			this.layercontext.strokeStyle = "rgba(0, 255, 0, 1.0)";
			this.layercontext.lineWidth = this.linewidth;	
			game.Entity.resized.apply(this,null);
			this.MAX_SPEED = this.radius/6;
		};
		
		this.draw = function(){	
			if(this.state == "alive"){
				if(this.selected){
					this.layercontext.beginPath();
					this.layercontext.arc(this.pos.x + (this.interpolate_diff.x * game.system.interpolationvalue),
										this.pos.y + (this.interpolate_diff.y * game.system.interpolationvalue),
										this.radius-this.linewidth,
										0, 
										2*Math.PI);
					this.layercontext.stroke();
				}				
				game.Entity.draw.apply(this, null); //draw using entity base
			}else if(this.state == "died" && this.isActive){	//death animation
				var x = (this.pos.x + (this.interpolate_diff.x * game.system.interpolationvalue)) |0;
					y = (this.pos.y + (this.interpolate_diff.y * game.system.interpolationvalue)) |0;
					height_to_width = this.death_anim.height/this.death_anim.width;
				this.layercontext.save();								
				this.layercontext.translate(x,y);
				this.layercontext.drawImage(this.death_anim,
					this.frames[this.anim_seq[(this.currentframe/this.anim_speed) |0]].x, this.frames[this.anim_seq[(this.currentframe/this.anim_speed) |0]].y,
					this.death_anim.width, this.death_anim.height, 
					-this.unit_center.x, -this.unit_center.y, 
					this.unit_size.width, this.unit_size.width*height_to_width
					);
				this.layercontext.restore();
				this.currentframe++;
			}
		};
		
		this.has_collided = function(entity){
			return game.Entity.has_collided.call(this, entity);
		};
		
		this.notify_collision = function(){
			this.state = "died";
			this.selected = false;
		};
	
		this.init(index, layermanager);	
	};
	
	//adding class to game Namespace
	game.Player = Player;
})(jQuery);
