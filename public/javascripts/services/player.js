angular.module('app.services')
	.factory('Player', function ($q, socket) {

		function Player(game) {
			this.game = game;
			this.color = "";
			this.bodies = new Array();
			
			debugger;
		}

		Player.prototype.update = function() {

		}

		Player.prototype.render = function() {

		}

		return Player;

	});