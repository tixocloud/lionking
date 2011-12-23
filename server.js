HOST = 'tereno-mbpro.local'; // localhost
PORT = 8001;

var bt = require("./bt"),
    url = require("url"),
    qs = require("querystring");

bt.listen(Number(process.env.PORT || PORT), HOST);

bt.get("/", bt.staticHandler("index.html"));

// Game operator
// - a game operator is a superset of the game viewer
bt.get("/operator", function( req, res ) {
    var gameId = "";
});

// Game viewer
// - a game viewer has no control over the game
