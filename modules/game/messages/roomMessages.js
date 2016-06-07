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
    me.messageName = "Player joined";
    me.roomId = roomId;
    me.newPlayer = {
        name : player.name,
        id : player.id
    }
}

module.exports = exports = {
    NewPlayerMessage : PlayerJoinedMessage
};