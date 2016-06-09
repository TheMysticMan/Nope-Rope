/**
 * Created by edoli on 7-6-2016.
 */

var Player = require("./../player/player");

/**
 * This class defines the message that is sent to the clients when a new player joined the room
 * @param player {Player}
 * @param roomId
 * @constructor
 */
function PlayerJoinedMessage(player, roomId)
{
    var me = this;
    me.roomId = roomId;
    me.newPlayer = {
        name : player.name,
        id : player.id
    }
}
PlayerJoinedMessage.messageName = "Player joined";

/**
 * This class defines the message that is send to the clients when a player leaves the room
 * @param player
 * @param roomId
 * @constructor
 */
function PlayerLeftMessage(player, roomId)
{
    var me = this;
    me.roomId = roomId;
    me.leftPlayer = {
        name: player.name,
        id : player.id
    }
}
PlayerLeftMessage.messageName = "Player left";

/**
 * This class defines the message that is send to the clients when the game is started
 * @param roomId
 * @constructor
 */
function GameStartedMessage(roomId)
{
    var me = this;
    me.roomId = roomId;
}
GameStartedMessage.messageName = "Game started";

/**
 * This class defines the message that is send to the clients when the position of a player is updated
 * @param roomId {Number}
 * @param playerId {Number}
 * @param position {Player.Position}
 * @constructor
 */
function PlayerPositionUpdate(roomId, playerId, position)
{
    var me = this;
    me.playerId = playerId;
    me.position = position;
    me.roomId = roomId;
}
PlayerPositionUpdate.messageName = "Player position update";


module.exports = exports = {
    PlayerJoinedMessage : PlayerJoinedMessage,
    PlayerLeftMessage : PlayerLeftMessage,
    GameStartedMessage: GameStartedMessage,
    PlayerPositionUpdate: PlayerPositionUpdate
};