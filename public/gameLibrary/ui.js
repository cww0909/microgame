//-------------------------------------------------- //
/*
UI.js - 
Handles the drawing of the main UI
*/
//---------------------------------------------------//

(function ($){
	var Interface = function(getLayerContext, state){
		//some constants
		this.LAYER_ID = game.UI;
		this.LEFT_CLICK = 1;
		
		this.layercontext = null;
		this.state = null;	//game state
		this.playername = null;	//the player's name
		this.score = null; //displays score during play time and high score otherwise
		this.multiplier = null;	//number of planes
		this.difficulty = null;	//determines amount of missiles at one point in time
		this.play_button = null;	//starts game when clicked
		this.instructions = null;	//displays instructions
		this.score_menu = null;	//displays all-time high scores when clicked
		this.displaying_score = false;
		this.minimize_score_button = null;
		this.img_src = ["media/plane1_top.png", "media/plane2_top.png", "media/plane3_top.png"];
		this.images = [];
		this.image_divs = [];
		this.plane_choices = [];
		this.difficulty_divs = [];
		this.difficulties = ["Easy", "Medium", "Hard", "Insane"];
		this.selected_difficulty = null;
		this.loading_img = null;
		this.currentframe = 0;
		this.frame_x = [];
		this.anim_speed = 2;
		
		this.init = function(getLayerContext, state){
			this.layercontext = getLayerContext(this.LAYER_ID);
			this.state = state;
			$("#name").css({
							"display": "block",
							"z-index": this.LAYER_ID+1
						});
			$("#name>form").on({
								submit: this.enter_name.bind(this)
							});
			$("#name>form>input").mouseup(function(event){
				$(this).focus();
			});
			
			this.score = $("#score").css({
							"display": "block",
							"z-index": this.LAYER_ID+1
						});
			this.multiplier = $("#planes").css({
								"display": "block",
								"z-index": this.LAYER_ID+1
							});
			for(var i=0; i<3; i++){
				this.images[i] = new Image();
				this.images[i].src = this.img_src[i];
				this.image_divs[i] = $("<div></div>",{
										"id": "plane"+i,
										"class": "ui"
									}).css({
										"opacity": 0,
										"padding": "0px 0px 0px 0px",
										"display": "inline",
										"z-index": this.LAYER_ID+1
									}).on({
										mouseup: this.select_plane.bind(this)
									}).appendTo(this.multiplier);
				this.plane_choices[i] = false;
			}
			this.difficulty = $("#difficulty").css({
									"display": "block",
									"z-index": this.LAYER_ID+1
								});
			for(var i=0; i<4; i++){
				this.difficulty_divs[i] = $("<div>"+this.difficulties[i]+"</div>")
										.css({
											"display": "inline",
											"z-index": this.LAYER_ID+1,
											"padding": "10px 10px 10px 10px"
										}).on({
											mouseup: this.select_difficulty.bind(this)
										}).appendTo(this.difficulty);
			}
			this.play_button = $("#play").css({
									"display": "block",
									"z-index": this.LAYER_ID+1
								}).on({
									mouseup: this.play_clicked.bind(this)
								});
		
			this.instructions = $("#instructions").css({
									"display": "block",
									"z-index": this.LAYER_ID+1	
								});
								
			this.score_menu = $("#all_scores").css({
									"display": "block",
									"z-index": this.LAYER_ID+1
								}).on({
									mouseup: this.show_scores.bind(this)
								});
								
			this.minimize_score_button = $("#minimize").on({
											mouseup: this.hide_scores.bind(this)
										});

			this.loading_img = new Image();
			this.loading_img.src = "media/loading.png";	
			this.loading_img.width = this.loading_img.height = 128;
			for(var i=0; i<19; i++){
				this.frame_x[i] = i * this.loading_img.width;
			}
		};
		
		this.update = function(){
			switch(this.state){
				case "starting":					
					$(".ui").css({
						"z-index": this.LAYER_ID+1
					});
					break;
				case "running":
					break;
				case "loading":
					//check if images finish loading before starting game
					var allLoaded = true;
					for(var i=0; i<game.system.entities.length; i++){
						allLoaded = allLoaded && game.system.entities[i].isLoaded;
					}
					if(!allLoaded) {
						break;
					}
					this.score.css("z-index", this.LAYER_ID+1);	
					game.system.layermanager.clearLayer(this.LAYER_ID);					
					game.system.state = this.state = "running";
					break;					
				default:
					break;
			}
		};
		
		this.draw = function(){
			switch(this.state){
				case "starting":
					this.score.html("High Score: "+game.system.highscore)
					.css({
						"background-color": "",
						"top": "",
						"left": ""	
					});
					
					this.layercontext.fillRect(0,0,game.CANVAS_W,game.CANVAS_H);
					var x = this.multiplier.position().left + this.multiplier.outerWidth();
						y = this.multiplier.position().top;
					var img_width, img_x;
					for(var i=0; i<this.images.length; i++){
						img_width = this.multiplier.outerHeight()*this.images[i].width/this.images[i].height;
						img_x = x + 30+ i*(img_width+20);	
						
						this.layercontext.drawImage(this.images[i], 
							img_x, y,
							img_width, this.multiplier.outerHeight()
						);
							
						if(this.plane_choices[i]){
							this.image_divs[i].css({
								"opacity": 1,
								"background-color": "rgba(222,135,229,0.5)",
								"top": 0,
								"left": img_x - this.multiplier.position().left,
								"width": img_width,
								"height": this.multiplier.outerHeight()
							});
						}else{
							this.image_divs[i].css({
								"opacity": 0,
								"top": 0,
								"left": img_x - this.multiplier.position().left,
								"width": img_width,
								"height": this.multiplier.outerHeight()
							});
						}			
					}
					break;
				case "running":
					this.score.html(game.system.score)
					.css({
						"background-color": "rgba(222,135,229,0.8)",
						"top": 0,
						"left": "85%"
					});					
					break;
				case "loading":
					this.score.css("z-index", -1);	
					this.layercontext.save();								
					this.layercontext.translate(game.CANVAS_W/2, game.CANVAS_H/2);
					this.layercontext.drawImage(this.loading_img,
						this.frame_x[this.currentframe/this.anim_speed], 0,
						this.loading_img.width, this.loading_img.height, 
						-this.loading_img.width/2, -this.loading_img.height/2, 
						this.loading_img.width, this.loading_img.height
						);
					this.layercontext.restore();
					this.currentframe++;
					if(this.currentframe == this.frame_x.length*this.anim_speed){
						this.currentframe = 0;
					}
					break;
				default:
					break;
			}
		};
		
		this.resized = function(){
			this.layercontext.fillStyle = "rgba(256,256,256,0.4)";	
			this.layercontext.strokeStyle = "rgba(0,82,156, 0.8)";
			this.layercontext.lineWidth = 5;
		};
				
		this.play_clicked = function(event){
			//init players
			game.system.num_players = 0;
			for(var i=0; i<this.plane_choices.length; i++){
				if(this.plane_choices[i]){
					game.system.players[game.system.num_players++] = new game.Player(i, game.system.layermanager);
						
				}
			}
			//init missiles
			switch (this.selected_difficulty){
				case "Easy":
					game.system.num_enemies = 15;
					break;
				case "Medium":
					game.system.num_enemies = 30;
					break;
				case "Hard":
					game.system.num_enemies = 60;
					break;
				case "Insane":
					game.system.num_enemies = 120;
					break;
				default:
					break;
			}
			for(var i=0; i<game.system.num_enemies; i++){
				game.system.enemies[i] = new game.Enemy("missile", game.system.layermanager);
			}
			
			if(game.system.num_players!=0 && game.system.num_enemies!=0){
				//add all players and missiles to entities
				game.system.entities.length = 0;
				for(var i=0; i<game.system.num_players; i++){
					game.system.entities[game.system.entities.length] = game.system.players[i];
					game.system.players[i].state = "alive";
				}
				for(var i=0; i<game.system.num_enemies; i++){
					game.system.entities[game.system.entities.length] = game.system.enemies[i];
					game.system.enemies[i].state = "setup";
				}
			}			

			//clear ui
			$(".ui").css({
				"z-index": -1
			});
			this.score.css("z-index", this.LAYER_ID+1);
			game.system.layermanager.clearLayer(this.LAYER_ID);
			this.state = "loading";
			
			event.preventDefault();
			event.stopPropagation();
			return false;
		};
		
		this.select_plane = function(event){
			if(event.which == this.LEFT_CLICK){
				var target = event.target;
				for(var i=0; i<this.image_divs.length; i++){
					if(target.id == this.image_divs[i].attr("id")){
						this.plane_choices[i] = !this.plane_choices[i];
					}
				}
			}
			event.preventDefault();
			event.stopPropagation();
			return false;
		};
		
		this.select_difficulty = function(event){
			if(event.which == this.LEFT_CLICK){
				var target = $(event.target);
				for(var i =0; i<this.difficulties.length; i++){
					if(target[0].innerHTML == this.difficulties[i]){
						this.selected_difficulty = this.difficulties[i];
						this.difficulty_divs[i].css({
							"background-color": "rgba(222,135,229,0.5)"
						});
					}else{
						this.difficulty_divs[i].css({
							"background-color": "rgba(0,82,156, 0)"
						});
					}
				}
			}
			event.preventDefault();
			event.stopPropagation();
			return false;
		};
		
		this.enter_name = function(event){
			this.playername = $("#name>form>input").blur().val();
			event.preventDefault();
			return false;
		};
		
		this.show_scores = function(event){
			if(!this.displaying_score){
				this.score_menu.css({
					"height": "90%",
					"width": "70%",
					"left": "15%",
					"background-color": "rgba(0,82,156,1.0)",
					"padding-bottom": "10px"
				});
				
				this.minimize_score_button.css({
					"display": "inline"
				});
				
				$.getJSON("/highscores", function(data){
					var htmlStr = "<table style='width: 90%; text-align: left; margin-left: 20px'>";
					//add table column headers
					htmlStr += "<tr> <th style='width:80px'>Rank</th> <th>Name</th> <th>Score</th> </tr>";
					for(var i=0; i<data.length; i++){
						htmlStr +=	"<tr style='font-size:80%'> <td>" + (i+1) + "</td> <td>" + data[i].name + "</td> <td>" + data[i].score + "</td> </tr>";
					}
					htmlStr += "</table>";
					
					$("#score_table").html(htmlStr);
				});				
			}
			this.displaying_score = true;
			event.stopPropagation();
			return false;
		};
		
		this.hide_scores = function(event){
			this.score_menu.css({
				"height": "",
				"width": "",
				"left": "",
				"background-color": "",
				"padding-bottom": ""
			}).removeAttr('p');
			
			this.minimize_score_button.css({
				"display": ""
			});
			
			$("#score_table").html("");
			
			this.displaying_score = false;
			event.stopPropagation();
			return false;
		};
				
		this.init(getLayerContext, state);
	};
	
	//add class to game Namespace
	game.Interface = Interface;
})(jQuery);