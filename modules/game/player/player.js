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

    /**
     * @type {Player.State}
     * @private
     */
    me._state = Player.State.Unknown;

    /**
     * Holds the speed of the player
     * @type {number}
     * @private
     */
    me._speed = 0;

    /**
     * This method sets the state of the player
     * @param state {Player.State}
     */
    me.setState= function (state)
    {
        me._state = state;
    };

    /**
     * This method returns the state this player is currently in
     * @returns {Player.State}
     */
    me.getState = function()
    {
        return me._state;
    }

    /**
     * This method sets the speed of the player
     * @param speed
     */
    me.setSpeed = function(speed)
    {
        me._speed = speed;
    }

    /**
     * this method returns the speed of the player
     * @returns {number|*}
     */
    me.getSpeed = function()
    {
        return me._speed;
    }
}

/**
 * This defines the state a player can be in.
 * @type {{}}
 */
Player.State =
{
    Unknown : 0,
    Spectating : 1,
    Alive: 2,
    Dead: 3
};

module.exports = exports = Player;