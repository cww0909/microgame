var pg = require('pg');

//connect to database
var connectionString = "postgres://postgres:password@localhost:5432/microgame";

exports.getScores = function(req, res){
	pg.connect(connectionString,function(err,client,done){
		var query = client.query("SELECT * FROM high_score");
		var rows = [];
		
		query.on('error', function(e){
			console.error("Query error:" + e);
			res.json(500, {error: e});
		});
		
		query.on('row', function(result){
			rows[rows.length]=result;
		});
		
		query.on('end', function(){
			done();
			res.json(rows);
		});
	});
};

exports.insertScore = function(req, res){
	var item = req.body;
	if(!item.hasOwnProperty('name') || !item.hasOwnProperty('score')){
		return res.json(400, {error: "Wrong format"});
	}
	console.log(item.name+" "+item.score);
	pg.connect(connectionString, function(err,client,done){
		var query = client.query("INSERT INTO high_score (name, score) VALUES ('"+item.name+"',"+item.score+")");
		
		query.on('error', function(e){
			console.error("Query error:" + e);
			res.json(500, {error: e});
		});
		
		query.on('end', function(){
			done();
			res.json(req.body);
		});
	});
};

exports.deleteScore = function(req,res){
	var id = parseInt(req.params.id);
	if(id == NaN){
		return res.json(400, {error: "Wrong format"});
	}
	pg.connect(connectionString, function(err,client,done){
		var query = client.query("DELETE FROM high_score WHERE id="+id);
		
		query.on('error', function(e){
			console.error("Query error:" + e);
			res.json(500, {error: e});
		});
		
		query.on('end', function(){
			done();
			res.json(true);
		});
	});
};
