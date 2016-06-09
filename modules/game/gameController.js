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

    /**
     * this method adds a connection to the connectedPlayer
     * @param data
     * @private
     */
    me._addConnectedPlayer = function (data)
    {
        var connectedPlayer = new Player.Player(data.socket);
        me._connectedPlayers.getSource().push(connectedPlayer);
        me._initPlayerListeners(connectedPlayer)
    };

    /**
     *
     * @param data
     * @private
     */
    me._removeDisconnectedPlayer = function (data)
    {
        var player = me._connectedPlayers.where(function (p)
        {
            return p.socketId === data.socketId
        }).firstOrDefault();
        if(player != null)
        {
            if(player.room != null)
            {
                player.room.removePlayer(player);
            }
            player.socket.removeListener("Join room", me.onPlayerJoinRoom.bind(me, player));
        }
    };
    /**
     * This method adds the default listeners on the socket of the newly connected player
     * @param connectedPlayer
     * @private
     */
    me._initPlayerListeners = function (connectedPlayer)
    {
        connectedPlayer.socket.on("Join room", me.onPlayerJoinRoom.bind(me, connectedPlayer));
    };

    me.addPostalListeners = function ()
    {
        var socketChannel = postal.channel("socket");
        socketChannel.subscribe({
            topic: "connected",
            callback: function (data)
            {
                me._addConnectedPlayer(data);
            }
        });

        socketChannel.subscribe({
            topic: "disconnected",
            callback: function (data)
            {
                me._removeDisconnectedPlayer(data);
            }
        });
    };

    /**
     * This method is called when a player joins a room
     * @param connectedPlayer
     * @param data
     * @param callback
     */
    me.onPlayerJoinRoom = function (connectedPlayer, data, callback)
    {
        var room = roomFactory.getRoom(data.roomId);
        connectedPlayer.name = data.name;
        connectedPlayer.room = room;
        room.addPlayer(connectedPlayer);
        callback(connectedPlayer.id, room.getPlayers({exclude: Enumerable.from([connectedPlayer.id])}));
    };

    me.addPostalListeners();
}

module.exports = exports = new GameController();