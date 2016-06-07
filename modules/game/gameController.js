/**
 * Created by edoli on 2-6-2016.
 */
var roomFactory = require("./room/roomFactory");
var sockets = require("./../sockets").io.sockets;

function GameController()
{
    sockets.on("Join room", function(data){
    throw new Error();
    console.log(data);
})
}

module.exports = exports = new GameController();