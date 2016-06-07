// Required modules
var SocketIO = require("socket.io");
var util = require('util');
var EventEmitter = require('events').EventEmitter;
var postal = require("postal");

// Constructor
function Sockets() {
	this.io = null;
	this.connections = {};
}

// Inherit 'on' and 'emit' functions
util.inherits(Sockets, EventEmitter);

// The rest of our own functions
Sockets.prototype.listen = function(server) {
	var self = this;
	this.io = SocketIO.listen(server);

	this.io.sockets.on('connection', this.onConnection.bind(this));
}

Sockets.prototype.onConnection = function(socket) {
	var socketId = socket.id;
	console.log("Sockets:", "Someone connected");
	this.emit("connection", socket);

	socket.on("disconnect", this.onDisconnect.bind(this, socketId));

	// publish event to global message bus
	postal.publish({
		channel: "socket",
		topic: "connected",
		data: {
			socket: socket,
		}
	});
	this.connections[socket.id] = socket;
};

Sockets.prototype.onDisconnect = function(socketId, socket) {
	console.log("Sockets:", "Someone disconnected");
	this.emit("disconnect");
	postal.publish({
		channel: "socket",
		topic: "disconnected",
		data: {
			socket: socket,
			socketId: socketId
		}
	});
	delete this.connections[socket.id];
};

// Export the class as singleton
module.exports = exports = new Sockets();