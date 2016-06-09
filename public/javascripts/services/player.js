angular.module('app.services')
	.factory('Player', function ($q, socket) {

		function Player(game, id, color) {
			this.id = id;
			this.game = game;
			this.color = color;
			this.bodies = new Array();
			this.size = 10;

			//debugger;
		}

		Player.prototype.move = function(x, y) {
			this.bodies.push(new Phaser.Rectangle(x, y, this.size, this.size));
		}

		Player.prototype.render = function() {

		}

		return Player;

	});