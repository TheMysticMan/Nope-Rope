/**
 * Created by edoli on 7-6-2016.
 */

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

module.exports = exports = {
    PlayerJoinedMessage : PlayerJoinedMessage,
    PlayerLeftMessage : PlayerLeftMessage
};