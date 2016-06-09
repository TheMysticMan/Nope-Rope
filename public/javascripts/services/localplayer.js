angular.module('app.services')
	.factory('LocalPlayer', function ($q, socket, Player) {

		function LocalPlayer(game) {
			this.game = game;
			this.direction = "left";
			this.setupControls();

			this.player = new Player(game);
		}

		LocalPlayer.prototype.setupControls = function() {

			this.game.input.keyboard.addKey(Phaser.Keyboard.W).onDown.add(function() { this.updateDirection('up') }, this);
			this.game.input.keyboard.addKey(Phaser.Keyboard.S).onDown.add(function() { this.updateDirection('down') }, this);
			this.game.input.keyboard.addKey(Phaser.Keyboard.A).onDown.add(function() { this.updateDirection('left') }, this);
			this.game.input.keyboard.addKey(Phaser.Keyboard.D).onDown.add(function() { this.updateDirection('right') }, this);

		}

		LocalPlayer.prototype.updateDirection = function(newDirection) {
			var updated = false;
			// Up
			if(newDirection != this.direction && newDirection == "up" && this.direction != "down") {
				this.direction = newDirection;
				updated = true;
			}

			// Down
			else if(newDirection != this.direction && newDirection == "down" && this.direction != "up") {
				this.direction = newDirection;
				updated = true;
			}

			// Left
			else if(newDirection != this.direction && newDirection == "left" && this.direction != "right") {
				this.direction = newDirection;
				updated = true;
			}

			// Right
			else if(newDirection != this.direction && newDirection == "right" && this.direction != "left") {
				this.direction = newDirection;
				updated = true;
			}

			if(updated) {
				console.log("new direction:", this.direction)
				socket.emit("update direction", this.direction, function(err, msg) {});
			}
		}

		LocalPlayer.prototype.update = function() {

		}

		LocalPlayer.prototype.render = function() {

		}

		return LocalPlayer;

	});