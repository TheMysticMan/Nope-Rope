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
 *
 * @param name {string} : name of the player
 * @param socketId {String} :socket.io connectionId
 * @constructor
 */
function Player(name, socketId)
{
    var me = this;
    me.id = GeneratePlayerId();
    me.name = name;
    me.socketId = socketId;
}

module.exports = exports = Player;