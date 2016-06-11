angular.module('app.controllers').controller('mainController', function ($scope, socket, cfpLoadingBar, LocalPlayer, Player) {

	$scope.init = function() {

		$scope.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', { preload: $scope.preload, create: $scope.create, update: $scope.update, render: $scope.render });

		$scope.players = new Array();
		$scope.colors = new Array();
		$scope.colors.push("#ff00a2");
		$scope.colors.push("#5bffff");
		$scope.colors.push("#FF9F1E");
		$scope.colors.push("#4ea683");

		socket.emit("Get HighScores", function()
		{

		});

		socket.on("Player joined", function(data)
		{
			console.log("player "+ data.newPlayer.id + " joined");
			console.log("color: ", data.newPlayer.color);
			$scope.players.push(new Player($scope.game, data.newPlayer.id, data.newPlayer.name, data.newPlayer.color));
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
				console.log("color: ", p.color);
				$scope.players.push(new Player($scope.game, p.id, p.name, p.color));
			};
			
		});

		socket.on("Player position update", function(playerPosition)
		{
			var playerId = playerPosition.playerId;
			var position = playerPosition.position;
			var roomId = playerPosition.roomId;

			for (var i = 0; i < $scope.players.length; i++) {
				var player = $scope.players[i];

				if(player.id == playerId) {
					player.move(position)
				}
			};
			
			console.log("position update ", playerId," x:", position.x, " y:", position.y);

		});

		socket.on("Game stopped", function (data)
		{
			console.dir(data.highScores);
		})
	},

	$scope.preload = function() {
		console.log('preload');

		$scope.game.stage.backgroundColor = "#1f2324";
		$scope.game.stage.disableVisibilityChange = true;
		$scope.timeCheck = $scope.game.time.now;
		$scope.localPlayer = new LocalPlayer($scope.game);
	},

	$scope.create = function() {
		console.log('create');
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