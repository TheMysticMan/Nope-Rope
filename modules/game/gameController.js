/**
 * Created by edoli on 2-6-2016.
 */
var roomFactory = require("./room/roomFactory");
var sockets = require("./../sockets").io.sockets;
var postal = require("postal");
var Enumerable = require("linq");
var Player = require("./player/player");

function GameController()
{
    var me = this;
    me._connectedPlayers = Enumerable.from([]);
    postal.subscribe({
        channel: "socket",
        topic: "connection.add",
        callback: function(data)
        {
            me._addConnectedPlayer(data);
        }
    });

    /**
     * this method adds a connection to the connectedPlayer
     * @param data
     * @private
     */
    me._addConnectedPlayer = function(data)
    {
        var connectedPlayer = new Player(data.socket);
        me._connectedPlayers.getSource().push(connectedPlayer);
        me._initPlayerListeners(connectedPlayer)
    };

    /**
     * This method adds the default listeners on the socket of the newly connected player
     * @param connectedPlayer
     * @private
     */
    me._initPlayerListeners = function(connectedPlayer)
    {
        connectedPlayer.socket.on("Join room", function(data)
        {
            var room = roomFactory.getRoom(data.roomId);
            connectedPlayer.name = data.name;
            connectedPlayer.room = room;
            room.addPlayer(connectedPlayer);
        })
    }
}

module.exports = exports = new GameController();