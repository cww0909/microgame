var express = require("express");
var app = express();

app.use(express.compress());
app.use(express.static(__dirname+"/public",{index: "game.html"}));

var port = process.env.port || 8888;
app.listen(port);
console.log("Server ready to serve game on port "+port);
