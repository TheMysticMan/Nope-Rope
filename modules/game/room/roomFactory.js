/**
 * Created by edoli on 2-6-2016.
 */
var Enumerable = require('linq');
var Guid = require("guid");

var Room = require("./room");

var activeRooms = Enumerable.from([]);

function RoomFactory()
{
    var me = this;

    // mock default active room
    var defaultRoom = new Room(1, "demo Room");
    activeRooms.getSource().push(defaultRoom);

    /**
     * this method creates a room with a unique identifier
     * @returns {String}: Identifier
     */
    me.createRoom = function(name)
    {
        var room = new Room(Guid.raw(), name);
        room.destroy = function ()
        {
            var roomId = room.id;
            activeRooms = Enumerable.from(activeRooms.where(function(x){return x.id != roomId}).toArray());
        }

        activeRooms.getSource().push(room);
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
    };

    /**
     *
     * @returns {*}
     */
    me.getRooms = function()
    {
        return activeRooms.select(function(room)
        {
            return {
                id: room.id,
                name: room.name,
                playerCount : room.players.count(),
                maxPlayerCount : room.maxPlayerCount,
                isFull : !(room.players.count() < room.maxPlayerCount)
            }
        }).toArray();
    }
}

module.exports = exports = new RoomFactory();