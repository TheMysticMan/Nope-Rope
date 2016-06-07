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
    me.board = Enumerable.from([]);
    /**
     *
     * @type {Enumerable<Player>}
     */
    me.players = Enumerable.from([]);

    /**
     * This method adds a player to the room.
     * To let the other players know send an update to all the other players
     * @param player {Player} : the new player
     */
    me.addPlayer = function (player)
    {
        me.players.getSource().push(player);
        me.sendMessage(RoomMsg.PlayerJoinedMessage.messageName, new RoomMsg.PlayerJoinedMessage(player, me.id), {exclude: Enumerable.from([player])});

        me.addPlayerEventListeners(player);
    };

    /**
     * This method removes a player from the room
     * to let the other players know send an update to all the other players
     * @param player
     */
    me.removePlayer = function (player)
    {
        me.players = Enumerable.from(me.players.where(function (p)
        {
            return p.id !== player.id
        }).toArray());

        me.sendMessage(RoomMsg.PlayerLeftMessage.messageName, new RoomMsg.PlayerLeftMessage(player, me.id), {exclude: Enumerable.from([player])});
    };

    /**
     * This method returns the players of this room
     * @returns {Array<{name:string,id:Number}>}
     */
    me.getPlayers = function ()
    {
        return me.players.select(function(p){return {name: p.name, id: p.id}}).toArray();
    };

    /**
     * This method adds listeners to events from the player
     * @param player {Player}
     */
    me.addPlayerEventListeners = function(player)
    {
        player.socket.once("Leave room", me.playerLeaveRoom.bind(me, player));
    };

    /**
     * This method is called when a player leaves the room
     * @param player {Player}
     */
    me.playerLeaveRoom = function(player)
    {
        me.removePlayer(player);
        player.room  = null;
    };

    /**
     * This method sends an message to connected players
     * @param messageName {String} : the name of the message
     * @param message {Object} : RoomMessage
     * @param config {{exclude : Enumerable<Player>}}
     */
    me.sendMessage = function (messageName, message, config)
    {
        // Get the ids of the excluded player
        var excludedPlayerIds = config.exclude.select(function (p)
        {
            return p.id
        });
        // Send message to rest of players
        me.players.where(function (p)
        {
            return !excludedPlayerIds.contains(p.id);
        }).forEach(function (p)
        {
            p.socket.emit(messageName, message);
        })
    }
}


module.exports = exports = Room;