/**
 * Created by edoli on 2-6-2016.
 */
var Enumerable = require('linq');
var Player = require("./../player/player");
var RoomMsg = require("./../messages/roomMessages");
var socketWrapper = require("./../../sockets");
var HighScoreService = require("./../../services/highScoreService");
var tts = require('./../../tts');
/**
 * this holds the interval in milliseconds in which the board will be updated
 * @type {number}
 */
var gameLoopInterval = 10;

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

function Room(id, name)
{
    var me = this;
    // initialize some default values
    me.id = id;
    me.boardSize = new Size(80, 60);
    me.board = [];
    me.isStarted = false;
    me.name = name;

    me.maxPlayerCount = 4;

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
    me._defaultRoomSpeed = 5;

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
        if(me.players.count() == me.maxPlayerCount)
        {
            return false;
        }
        player.setSpeed(me._defaultRoomSpeed);
        me.players.getSource().push(player);
        player.setColor(me.getColor());
        me.sendMessage(RoomMsg.PlayerJoinedMessage.messageName, new RoomMsg.PlayerJoinedMessage(player, me.id), {exclude: Enumerable.from([player])});

        tts.say(player.name + "has joined the game", me.getSockets());

        me.addPlayerEventListeners(player);
        return true;

    };

    me.getColor = function ()
    {
        return Room.Colors[me.players.count() - 1];
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

        tts.say(player.name + "has left the game", me.getSockets());

        if (me.players.count() == 0)
        {
            me.stopGame();
            me.destroy();
        }
    };

    /**
     * This method returns the players of this room
     * @returns {Array<{name:string,id:Number}>}
     */
    me.getPlayers = function (filter)
    {
        var players = me.players;
        if (filter)
        {
            if (filter.exclude)
            {
                players = players.where(function (p)
                {
                    return !filter.exclude.contains(p.id);
                })
            }
        }
        return players.select(function (p)
        {
            return {name: p.name, id: p.id, color: p.getColor()}
        }).toArray();
    };

    /**
     * This method adds listeners to events from the player
     * @param player {Player}
     */
    me.addPlayerEventListeners = function (player)
    {
        player.socket.once("Leave room", me.playerLeaveRoom.bind(me, player));
        player.socket.on("Start game", me.startGame.bind(me));
        player.socket.on("update direction", me.playerUpdateDirection.bind(me, player));
    };

    /**
     * This method is called when a player leaves the room
     * @param player {Player}
     */
    me.playerLeaveRoom = function (player)
    {
        delete player.socket;
        me.removePlayer(player);
        player.room = null;
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

        if (config)
        {
            if (config.exclude)
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
    me.startGame = function ()
    {
        if (!me.isStarted)
        {
            me.isStarted = true;
            console.log("Game Started");
            me.setInitialBoardState();
            me.sendMessage(RoomMsg.GameStartedMessage.messageName, new RoomMsg.GameStartedMessage(me.id, me.players), null);
            me._startGameLoop();

            tts.say("Let the games begin", me.getSockets());
        }
    };

    /**
     * this method stops the game
     */
    me.stopGame = function ()
    {
        me.players.forEach(function (p)
        {
            p.saveScore(new Date(), me.players.count()-1, me.id);
        });

        console.log("Game stopped");
        clearInterval(me._gameLoopIntervalId);
        me.isStarted = false;
        me.board = [];
        me.sendMessage(RoomMsg.GameStoppedMessage.messageName, new RoomMsg.GameStoppedMessage(me.id, me.getHighScores()), null);

        tts.say("Games over", me.getSockets());
    };

    /**
     * This method will start the gameLoop so the board will be updated
     * @private
     */
    me._startGameLoop = function ()
    {
        me._gameLoopIntervalId = setInterval(function ()
        {
            // increase the updateCount
            me._updateCount++;

            // only update the board if there isn't already an update going on
            if (!me._isUpdating)
            {
                me._updateBoard();
            }
        }, gameLoopInterval)
    };

    /**
     * This method sets the initial state of the board
     */
    me.setInitialBoardState = function ()
    {
        var chosenPositions = Enumerable.from([]);
        me.players.forEach(function (player)
        {
            var getRandomNumber = function()
            {
                var n  = Math.floor((Math.random() * 4) );
                if(!chosenPositions.contains(n))
                {
                    chosenPositions.getSource().push(n);
                    return n;
                }
                else
                {
                    return getRandomNumber();
                }
            };

            var random = getRandomNumber();
            player.setCurrentPosition(Room.Board.StartPosition[random].position);
            player.setDirection(Room.Board.StartPosition[random].direction);
            player.setState(Player.Player.State.Alive);
            player.setScore(0);
        })
    };

    /**
     * This method is called when a player changes its direction.
     * It will set the direction of that player and let all the others know the position is changed
     * @param player {Player}
     * @param direction {String}
     */
    me.playerUpdateDirection = function (player, direction)
    {
        var directionObj = Player.Direction[direction];
        if (directionObj)
        {
            player.setDirection(directionObj);
            me.sendMessage(RoomMsg.PlayerDirectionUpdateMessage.messageName, new RoomMsg.PlayerDirectionUpdateMessage(me.id, player.id, direction), null);
        }
        else
        {
            throw new Error("direction " + direction + " is not a know direction");
        }
    }

    //region Update board

    /**
     * This method will update the board.
     *  It will calculate the next step for a player and check if it isn't a collision
     * @private
     */
    me._updateBoard = function ()
    {
        me._isUpdating = true;

        var newPositions = [];

        me.players.forEach(/** @param player {Player} */
        function (player)
        {
            if (player.getState() == Player.Player.State.Alive)
            {
                var speed = player.getSpeed();
                if (me._updateCount % speed == 0)
                {
                    var steps = 1;
                    //var direction = player.getDirection();
                    //var currentPosition = player.getCurrentPosition();
                    var newPosition = player.getNewPosition(steps);
                    newPositions.push({player: player, newPosition: newPosition});

                    //player.setCurrentPosition(newPosition);

                    //me.sendMessage(RoomMsg.PlayerPositionUpdate.messageName, new RoomMsg.PlayerPositionUpdate(me.id, player.id, newPosition), null);
                }
            }
        });

        // this will hold all the players that are dead
        var deadPlayers = [];
        // this will hold all the players and positions that are occupied in this update
        var occupiedPositions = [];

        // iterate over new positions to determine if it can be occupied
        newPositions.forEach(function (newPos)
        {
            if (!me.isPositionOccupied(newPos.newPosition) && me.isPositionOnBoard(newPos.newPosition))
            {
                var otherPositions = Enumerable.from(newPositions).where(function (p)
                {
                    return p.player != newPos.player
                });
                if (otherPositions.where(function (other)
                    {
                        return other.newPosition.equals(newPos.newPosition)
                    }).count() > 0)
                {
                    occupiedPositions.push(newPos);
                    deadPlayers.push(newPos.player);
                }
                else
                {
                    occupiedPositions.push(newPos);
                }
            }
            else
            {
                deadPlayers.push(newPos.player);
            }

        });

        // set new positions
        occupiedPositions.forEach(function (newPos)
        {
            newPos.player.setCurrentPosition(newPos.newPosition);
            me.occupyPosition(newPos.player, newPos.newPosition);
            me.sendMessage(RoomMsg.PlayerPositionUpdate.messageName, new RoomMsg.PlayerPositionUpdate(me.id, newPos.player.id, newPos.newPosition), null);
        });

        // set state to dead
        deadPlayers.forEach(function (player)
        {
            tts.say(player.name + 'has died', me.getSockets());
            player.setState(Player.Player.State.Dead);
            me.sendMessage(RoomMsg.PlayerDeadMessage.messageName, new RoomMsg.PlayerDeadMessage(me.id, player.id), null);
        });
        var deadPlayerCount = deadPlayers.length;
        var alivePlayers = me.players.where(function (p)
        {
            return p.getState() == Player.Player.State.Alive
        });
        alivePlayers.forEach(function (p)
        {
            p.setScore(p.getScore() + deadPlayerCount);
        });

        // stop the game if the amount of alive players is one or less
        if (alivePlayers.count() <= 1)
        {
            me.stopGame();
        }
        me._isUpdating = false;
    };

    /**
     * this method occupies a position on the board
     * @param player
     * @param position
     */
    me.occupyPosition = function (player, position)
    {
        if (!me.board[position.x])
        {
            me.board[position.x] = [];
        }
        me.board[position.x][position.y] = player;
    };

    /**
     * This method returns a boolean indicating whether or not a location is occupied
     * @param position
     * @return {boolean}
     */
    me.isPositionOccupied = function (position)
    {
        var col = me.board[position.x];
        if (col)
        {
            return col[position.y] != null || col[position.y] != undefined;
        }
        else
        {
            return false;
        }

    };

    /**
     * this method returns a boolean indicating whether or not the location is on the board
     * @param position
     * @return {boolean}
     */
    me.isPositionOnBoard = function (position)
    {
        return position.x >= 0 && position.x < me.boardSize.x && position.y >= 0 && position.y < me.boardSize.y;
    };
    //endregion

    //region HighScores
    /**
     * This method retuns the highscores for this room
     * @returns {*}
     */
    me.getHighScores = function ()
    {
        return me.players.select(function (player)
        {
            var highScores = player.getHighScoresForRoom(me.id);
            return {
                playerId: player.id,
                playerName: player.getName(),
                score: HighScoreService.calculateAverage(highScores)
            }
        }).orderByDescending(function(h){return h.score.percentage}).toArray();
    };

    me.getSockets = function ()
    {
        return me.players.select(function(p){return p.socket}).toArray();
    }
    /**
     * should be overwritten by the room factory
     */
    me.destroy = function (){}
    //endregion
}

Room.Colors = [
    "#ff00a2",
    "#5bffff",
    "#FF9F1E",
    "#4ea683"
];

Room.Board = {
    StartPosition: [
        {position: new Player.Position(10, 10), direction: Player.Direction.down},
        {position: new Player.Position(10, 50), direction: Player.Direction.up},
        {position: new Player.Position(70, 10), direction: Player.Direction.left},
        {position: new Player.Position(70, 50), direction: Player.Direction.left}
    ]
}

module.exports = exports = Room;