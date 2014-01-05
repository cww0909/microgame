//-------------------------------------------------- //
/*
Enemy.js - 
Creates an enemy unit (missile or hp) entity
*/
//---------------------------------------------------//

(function($){
	var Enemy = function(type, layermanager){
		this.img_src = {"missile":"media/missile.png", "hp":"media/health.png"};
		
		this.init = function(type, layermanager){ 
			//sets up the entity
			game.Entity.init.apply(this, null); 
			this.LAYER_ID = game.ENEMY;
			this.layercontext = layermanager.getLayerContext(this.LAYER_ID);
			this.type = type;
			this.img = game.Entity.load_img.call(this, this.img_src[type]);
			this.state = "none"; //set to "setup" when starting game
			this.isActive = false;
			this.rel_size = 0.05;	
			this.pos.angle =  Math.PI/2; //face down
			this.radius = (0.5*game.CANVAS_W*this.rel_size) |0;
			this.img.addEventListener("load", game.Entity.load.bind(this));
			this.destination = {x: this.pos.x, y: this.pos.y, angle: 0};
			this.acceleration = 0.5;
			this.dest_thresh = (this.radius/2) |0;
			
			//sets enemy specific attributes
			this.linewidth = 5;	
			this.start_t = 0;
			this.startAfter = 5; //seconds
			this.lifetime = 5; //seconds	
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
					if(this.type == "missile"){
						this.state = "setup";
						this.isActive = false;	
						game.system.increment_score();					
					}
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
			}else if(this.state == "setup"){
				if(this.type == "missile"){
					//set a random speed
					this.MAX_SPEED = this.radius/(5*Math.random()+2);
					var edges = ["top", "bottom", "left", "right"];
					//set random start position along edges the screen (change to map in the future)
					switch(edges[4*Math.random() |0]){
						case "top":
							this.pos.x = Math.random() * game.CANVAS_W;
							this.pos.y = 0;
							edges[0] = null;
							break;
						case "bottom":
							this.pos.x = Math.random() * game.CANVAS_W;
							this.pos.y = game.CANVAS_H;
							edges[1] = null;
							break;
						case "left":
							this.pos.x = 0;
							this.pos.y = Math.random() * game.CANVAS_H;
							edges[2] = null;
							break;
						case "right":
							this.pos.x = game.CANVAS_W;
							this.pos.y = Math.random() * game.CANVAS_H;
							edges[3] = null;
							break;
						default:
							break;
					}
					//set random destination along other sides of the screen
					var edge;
					while(edge = edges[4*Math.random() |0]){
						switch(edge){
							case "top":
								this.destination.x = Math.random() * game.CANVAS_W;
								this.destination.y = 0;
								break;
							case "bottom":
								this.destination.x = Math.random() * game.CANVAS_W;
								this.destination.y = game.CANVAS_H;
								break;
							case "left":
								this.destination.x = 0;
								this.destination.y = Math.random() * game.CANVAS_H;
								break;
							case "right":
								this.destination.x = game.CANVAS_W;
								this.destination.y = Math.random() * game.CANVAS_H;
								break;
							default:
								break;
						}
					}
				}				
				
				//set random start time reasonably after current time
				this.start_t = Date.now() + this.startAfter*1000*Math.random();
				
				this.state = "ready";
			}else if(this.state == "ready"){
				if(Date.now() > this.start_t){
					this.state = "alive";
					this.isActive = true;
				}
			}
			
            game.Entity.update_post.apply(this, null);
		};
		
		this.resized = function(){	
			game.Entity.resized.apply(this,null);
		};
		
		this.draw = function(){	
			this.layercontext.stroke();
			
			game.Entity.draw.apply(this, null); //draw using entity base
		};
		
		this.has_collided = function(entity){
			return game.Entity.has_collided.call(this, entity);
		};
		
		this.notify_collision = function(){
			this.state = "died";
			this.isActive = false;
		};
		
		this.init(type, layermanager);
	};
	
	//adding class to game Namespace
	game.Enemy = Enemy;	
})(jQuery);