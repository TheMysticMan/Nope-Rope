angular.module('app.controllers').controller('mainController', function ($scope, socket, cfpLoadingBar, LocalPlayer, Player) {

	$scope.init = function() {

		$scope.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: $scope.preload, create: $scope.create, update: $scope.update, render: $scope.render });
		$scope.players = new Array();
		$scope.colors = new Array();
		$scope.colors.push("#ff00a2");
		$scope.colors.push("#5bffff");
		$scope.colors.push("#FF9F1E");
		$scope.colors.push("#4ea683");


		socket.on("Player joined", function(data)
		{
			console.log("player "+ data.newPlayer.id + " joined");
			$scope.players[data.newPlayer.id] = new Player($scope.game, data.newPlayer.id, data.newPlayer.color);
		});

		socket.on("Player left", function(data)
		{
			console.log("player "+ data.leftPlayer.id + " left");
			delete $scope.players[data.leftPlayer.id];
		});

		socket.emit("Join room", {name:"Demo Player", roomId: 1}, function (playerId, connectedPlayers)
		{
			for (var i = 0; i < connectedPlayers.length; i++) {
				var p = connectedPlayers[i];
				$scope.players[p.id] = new Player($scope.game, p.id, p.color);
			};
			
		});

		socket.on("Player position update", function(playerPosition)
		{
			var playerId = playerPosition.playerId;
			var position = playerPosition.position;
			var roomId = playerPosition.roomId;

			$scope.players[playerId].move(position);

			console.log("position update ", playerId," x:", position.x, " y:", position.y);

		});
	},

	$scope.preload = function() {
        console.log('preload');
    },

	$scope.create = function() {
		console.log('create');
		
		$scope.game.stage.backgroundColor = "#1f2324";
    	$scope.game.world.setBounds(0, 0, 800, 600);
    	$scope.game.physics.startSystem(Phaser.Physics.ARCADE);

    	$scope.timeCheck = $scope.game.time.now;

    	$scope.localPlayer = new LocalPlayer($scope.game);
	},

	$scope.update = function() {

	}

	$scope.render = function() {

		for(var p in $scope.players) {
			$scope.players[p].render();
			
		}
	};

	$scope.leave = function ()
	{
		socket.emit("Leave room");
	}
	$scope.startgame = function ()
	{
		socket.emit("Start game", null, function()
		{

		});
	}
});