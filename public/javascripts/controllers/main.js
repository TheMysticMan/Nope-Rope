angular.module('app.controllers').controller('mainController', function ($scope, socket, cfpLoadingBar) {

	$scope.init = function() {
		socket.on("Player joined", function(data)
		{
			console.log("player "+ data.newPlayer.id + " joined");
		});

		socket.on("Player left", function(data)
		{
			console.log("player "+ data.leftPlayer.id + " left");
		});

		socket.emit("Join room", {name:"Demo Player", roomId: 1}, function (connectedPlayers)
		{
		});

		$scope.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: $scope.preload, create: $scope.create, update: $scope.update, render: $scope.render });

		$scope.bodySize = 10;

		// localplayer properties
		$scope.bodies = new Array();
		$scope.position =  {x: 350, y: 250};
		$scope.direction = "left";
	
		$scope.players = new Array();
		$scope.players.push({name: 'Player 2', bodies: new Array(), direction: "left", position: {x: 350, y: 350}, color:"#5bffff"});
		$scope.players.push({name: 'Player 3', bodies: new Array(), direction: "right", position:  {x: 450, y: 250}, color:"#FF9F1E" });
		$scope.players.push({name: 'Player 4', bodies: new Array(), direction: "right", position:  {x: 450, y: 350}, color:"#4ea683" });

	},

	$scope.preload = function() {
        console.log('preload');
    },

	$scope.create = function() {
		console.log('create');
		
		$scope.game.stage.backgroundColor = "#1f2324";
    	$scope.game.world.setBounds(0, 0, 800, 600);
    	$scope.game.physics.startSystem(Phaser.Physics.ARCADE);

    	$scope.timeCheck = $scope.game.time.now;;


    	// Setup input
    	$scope.up = $scope.game.input.keyboard.addKey(Phaser.Keyboard.W);
    	$scope.down = $scope.game.input.keyboard.addKey(Phaser.Keyboard.S);
    	$scope.left = $scope.game.input.keyboard.addKey(Phaser.Keyboard.A);
    	$scope.right = $scope.game.input.keyboard.addKey(Phaser.Keyboard.D);

    	$scope.up.onDown.add(function() { 
    		$scope.direction = $scope.direction != "down" ? "up" : $scope.direction; // Cannot go from down to up
    		socket.emit("update direction", $scope.direction, function(err, msg) {});
    	}, this);

    	$scope.down.onDown.add(function() { 
    		$scope.direction = $scope.direction != "up" ? "down" : $scope.direction // Cannot go from up to down
    		socket.emit("update direction", $scope.direction, function(err, msg) {});
    	}, this);

    	$scope.left.onDown.add(function() { 
    		$scope.direction = $scope.direction != "right" ? "left" : $scope.direction // Cannot go from right to left
    		socket.emit("update direction", $scope.direction, function(err, msg) {});
    	}, this);

    	$scope.right.onDown.add(function() { 
    		$scope.direction = $scope.direction != "left" ? "right" : $scope.direction // Cannot go from right to left

    		socket.emit("update direction", $scope.direction, function(err, msg) {});
    	}, this);

	},

	$scope.update = function() {
		
		
		if ($scope.game.time.now - $scope.timeCheck > 100) {

			$scope.timeCheck = $scope.game.time.now;

			// Update local player
			if($scope.direction == "up") {
				$scope.position.y -= $scope.bodySize;
			}
			else if($scope.direction == "down") {
				$scope.position.y += $scope.bodySize;
			}
			else if($scope.direction == "left") {
				$scope.position.x -= $scope.bodySize;
			}
			else if($scope.direction == "right") {
				$scope.position.x += $scope.bodySize;
			}

			// TODO: We should get new positions from the server. even for the localplayer
			$scope.bodies.push(new Phaser.Rectangle($scope.position.x, $scope.position.y, $scope.bodySize, $scope.bodySize));

			// update other players
			for (var i = 0; i < $scope.players.length; i++) {
				var player = $scope.players[i];

				// random direction
				var r = Math.random(0, 4) * 100;
				if(r > 0 && r < 25) { player.direction = "up"; }
				if(r > 25 && r < 50) { player.direction = "down"; }
				if(r > 50 && r < 75) { player.direction = "left"; }
				if(r > 75 && r < 100) { player.direction = "right"; }

				if(player.direction == "up") {
					player.position.y -= $scope.bodySize;
				}
				else if(player.direction == "down") {
					player.position.y += $scope.bodySize;
				}
				else if(player.direction == "left") {
					player.position.x -= $scope.bodySize;
				}
				else if(player.direction == "right") {
					player.position.x += $scope.bodySize;
				}

				player.bodies.push(new Phaser.Rectangle(player.position.x, player.position.y, $scope.bodySize, $scope.bodySize));
				
			}
		}
	}

	$scope.render = function() {
		// draw localplayer's body
		for (var i = $scope.bodies.length - 2; i >= 0; i--) {
			var body = $scope.bodies[i];

			$scope.game.debug.geom(body, '#ff00a2');
		};

		//draw localplayer's head
		var head = $scope.bodies[$scope.bodies.length -1 ];
		$scope.game.debug.geom(head, '#ffffff');

		// draw other players
		for (var i = 0; i < $scope.players.length; i++) {
			var player = $scope.players[i];

			for (var j = 0; j < player.bodies.length - 1; j++) {
				var body = player.bodies[j];
				$scope.game.debug.geom(body, player.color);
			}

			var head = player.bodies[player.bodies.length -1 ];
			$scope.game.debug.geom(head, '#ffffff');
		}

	};
	
	$scope.leave = function ()
	{
		socket.emit("Leave room");
	}
});