/**
 * Created by edoli on 2-6-2016.
 */
var Enumerable = require('linq');
var Guid = require("guid");

var Room = require("./room");

var activeRooms = new Enumerable();

function RoomFactory()
{
    var me = this;
    /**
     * this method creates a room with a unique identifier
     * @returns {String}: Identifier
     */
    me.createRoom = function()
    {
        var room = new Room(Guid.raw());
        return room.id;
    };

    /**
     * this function gets a room by the identifier
     * @param id
     */
    me.getRoom = function(id)
    {
        var guid = new Guid(id);

        return activeRooms.where(function(x){return guid.equals(new Guid(x.id))}).firstOrDefault();
    }
}

module.exports = exports = new RoomFactory();