/**
 * Created by edoli on 2-6-2016.
 */
var Enumerable = require('linq');
var Player = require("./../player/player");
var RoomMsg = require("./../messages/roomMessages");
var socketWrapper = require("./../../sockets");

/**
 *
 * @type {{name: string, age: number}}
 */
var a = {name: "iets", age: 1};
/**
 *
 * @param x
 * @param y
 * @constructor
 */
function Size(x, y)
{
    var me = this;
    me.x = x;
    me.y = y;
}

function Room(id)
{
    var me = this;
    // initialize some default values
    me.id = id;
    me.boardSize = new Size(80, 60);
    me.board = new Enumerable();
    /**
     *
     * @type {Enumerable<Player>}
     */
    me.players = new Enumerable();

    /**
     * This method adds a player to the room.
     * To let the other players know send an update to all the other players
     * @param player {Player} : the new player
     */
    me.addPlayer = function (player)
    {
        me.players.array.push(player);
        me.sendMessage(new RoomMsg.NewPlayerMessage(player, me.id), {exclude: Enumerable.from([player])});
    };

    /**
     * This method sends an message to connected players
     * @param message {Object} : RoomMessage
     * @param config {{exclude : Enumerable<Player>}}
     */
    me.sendMessage = function (message, config)
    {
        // Get the ids of the excluded player
        var excludedPlayerIds = config.exclude.select(function (p)
        {
            return p.id
        });
        // Send message to rest of players
        me.players.where(function (p)
        {
            !excludedPlayerIds.contains(p.id);
        }).forEach(
            function (p)
            {
                socketWrapper.connections[p.socketId].send(message);
            })
    }
}


module.exports = exports = Room;