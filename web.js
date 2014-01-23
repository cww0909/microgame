var express = require("express");
var scores = require("./routes/highscores");

//configure server
var app = express();
app.use(express.compress());
app.use(express.bodyParser());
app.use(express.static(__dirname+"/public",{index: "game.html"}));

app.get('/highscores',scores.getScores);
app.post('/highscores',scores.insertScore);
app.delete('/highscores/:id',scores.deleteScore);

//start server
var port = process.env.PORT || 8888;
app.listen(port);
console.log("Server ready to serve game on port "+port);

