angular.module('app.services')
	.factory('Player', function ($q, socket) {

		function Player(game, id, name, color) {
			this.id = id;
			this.game = game;
			this.name = name;
			this.color = color == "" ? "#ff00a2" : color;
			this.bodies = new Array();
			this.size = 10;
		}

		Player.prototype.move = function(position) {

			this.bodies.push(new Phaser.Rectangle(position.x * this.size, position.y * this.size, this.size, this.size));
		}

		Player.prototype.render = function() {

			// draw body
			for (var i = this.bodies.length - 2; i >= 0; i--) {
				var body = this.bodies[i];

				this.game.debug.geom(body, '#ff00a2');
			};

			//draw head
			var head = this.bodies[this.bodies.length -1 ];
			this.game.debug.geom(head, '#ffffff');
		}

		return Player;

	});