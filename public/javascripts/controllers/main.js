angular.module('app.controllers').controller('mainController', function ($scope, socket, cfpLoadingBar) {

	$scope.init = function() {
		$scope.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: $scope.preload, create: $scope.create, update: $scope.update, render: $scope.render });

		$scope.bodies = new Array();

		$scope.bodySize = 10;
		$scope.position =  {x: 80, y: 600};
		$scope.direction = "up";
	
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
    	}, this);

    	$scope.down.onDown.add(function() { 
    		$scope.direction = $scope.direction != "up" ? "down" : $scope.direction // Cannot go from up to down
    	}, this);

    	$scope.left.onDown.add(function() { 
    		$scope.direction = $scope.direction != "right" ? "left" : $scope.direction // Cannot go from right to left
    	}, this);

    	$scope.right.onDown.add(function() { 
    		$scope.direction = $scope.direction != "left" ? "right" : $scope.direction // Cannot go from right to left
    	}, this);

	},

	$scope.update = function() {
		
		// Update local player
		if ($scope.game.time.now - $scope.timeCheck > 100) {

			$scope.timeCheck = $scope.game.time.now;

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

			// TODO: We should get new positions even from ourself from the server
			$scope.bodies.push(new Phaser.Rectangle($scope.position.x, $scope.position.y, $scope.bodySize, $scope.bodySize));
		}


	}

	$scope.render = function() {
		//console.log('render');

		// draw body
		for (var i = $scope.bodies.length - 2; i >= 0; i--) {
			var body = $scope.bodies[i];

			$scope.game.debug.geom(body, '#ff00a2');
		};
		
		//draw head
		var head = $scope.bodies[$scope.bodies.length -1 ];
		$scope.game.debug.geom(head, '#ffffff');
	}
});