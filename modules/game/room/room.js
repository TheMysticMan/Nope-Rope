/**
 * Created by edoli on 2-6-2016.
 */
var Enumerable = require('linq');
var Player = require("./../player/player");
var RoomMsg = require("./../messages/roomMessages");
var socketWrapper = require("./../../sockets");

/**
 * this holds the interval in milliseconds in which the board will be updated
 * @type {number}
 */
var gameLoopInterval = 100;

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
     * Holds the default speed for every player in this room
     * @type {number}
     * @private
     */
    me._defaultRoomSpeed = 10;

    /**
     * Holds the total count of updates for this room.
     * This way we can determine whether or not the player should be updated
     * @type {number}
     * @private
     */
    me._updateCount = 0;
    /**
     * this will hold the interval id for the game loop when the game is running
     * @type {null}
     * @private
     */
    me._gameLoopIntervalId = null;

    /**
     * Holds a boolean indicating if the board is currently being updated
     * @type {boolean}
     * @private
     */
    me._isUpdating = false;

    /**
     * This method adds a player to the room.
     * To let the other players know send an update to all the other players
     * @param player {Player} : the new player
     */
    me.addPlayer = function (player)
    {
        player.setSpeed(me._defaultRoomSpeed);
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
        player.socket.on("Start game", me.startGame.bind(me));
    };

    /**
     * This method is called when a player leaves the room
     * @param player {Player}
     */
    me.playerLeaveRoom = function(player)
    {
        delete player.socket;
        me.removePlayer(player);
        player.room  = null;
    };

    /**
     * This method sends an message to connected players
     * @param messageName {String} : the name of the message
     * @param message {Object} : RoomMessage
     * @param config {{exclude : Enumerable<Player>} || null}
     */
    me.sendMessage = function (messageName, message, config)
    {
        // Get the ids of the excluded player
        var excludedPlayerIds = Enumerable.from([]);

        if(config)
        {
            if(config.exclude)
            {
                excludedPlayerIds = config.exclude.select(function (p)
                {
                    return p.id
                });
            }
        }
        // Send message to rest of players
        me.players.where(function (p)
        {
            return !excludedPlayerIds.contains(p.id);
        }).forEach(function (p)
        {
            p.socket.emit(messageName, message);
        })
    };

    /**
     * This method sends an game started message to all the players.
     * It will start the gameLoop that will update the board
     */
    me.startGame = function()
    {
        me.setInitialBoardState();
        me.sendMessage(RoomMsg.GameStartedMessage.messageName, new RoomMsg.GameStartedMessage(me.id, me.players), null);
        me._startGameLoop();
    };

    /**
     * This method will start the gameLoop so the board will be updated
     * @private
     */
    me._startGameLoop = function()
    {
        me._gameLoopIntervalId = setInterval(function()
        {
            // increase the updateCount
            me._updateCount++;

            // only update the board if there isn't already an update going on
            if(!me._isUpdating)
            {
                me._updateBoard();
            }
        }, gameLoopInterval)
    };

    /**
     * This method will update the board.
     *  It will calculate the next step for a player and check if it isn't a collision
     * @private
     */
    me._updateBoard = function()
    {
        me._isUpdating =  true;

        me.players.forEach(/** @param player {Player} */
        function(player)
        {
            if(player.getState() == Player.Player.State.Alive)
            {
                var speed = player.getSpeed();
                if(me._updateCount % speed == 0)
                {
                    var steps = 1;
                    //var direction = player.getDirection();
                    //var currentPosition = player.getCurrentPosition();
                    var newPosition = player.getNewPosition(steps);
                    player.setCurrentPosition(newPosition);

                    me.sendMessage(RoomMsg.PlayerPositionUpdate.messageName, new RoomMsg.PlayerPositionUpdate(me.id, player.id, newPosition), null);
                }
            }
        });

        me._isUpdating = false;
    };

    /**
     * This method sets the initial state of the board
     */
    me.setInitialBoardState = function ()
    {
        me.players.forEach(function(player)
        {
            player.setCurrentPosition(new Player.Position(200,200));
            player.setDirection(Player.Direction.left);
        })
    }
}


module.exports = exports = Room;