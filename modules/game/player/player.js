/**
 * Created by edoli on 7-6-2016.
 */

var currentPlayerCount = 0;

var /**
 * @return {number}
 */
GeneratePlayerId =  function ()
{
    currentPlayerCount++;
    return currentPlayerCount;
};

/**
 * This class defines a player object
 * @param socket {Socket} :socket.io socket
 * @constructor
 */
function Player(socket)
{
    var me = this;
    me.id = GeneratePlayerId();
    me.name = "";
    me.room = null;
    me.socket = socket;
    me.socketId = socket.id;
}

module.exports = exports = Player;