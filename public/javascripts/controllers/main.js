angular.module('app.controllers').controller('mainController', function ($scope, socketFactory, cfpLoadingBar) {

	$scope.init = function() {
		$scope.game = new Phaser.Game(800, 600, Phaser.AUTO, '', { preload: $scope.preload, create: $scope.create, update: $scope.update, render: $scope.render });
		$scope.bodies = new Array();
	},

	$scope.preload = function() {
        console.log('preload');
    },

	$scope.create = function() {
		console.log('create');
		$scope.game.physics.startSystem(Phaser.Physics.ARCADE);
    	$scope.game.world.setBounds(0, 0, 800, 600);

    	$scope.bodies.push(new Phaser.Rectangle(50, 50, 50, 50));
    	$scope.bodies.push(new Phaser.Rectangle(250, 250, 50, 50));
	},

	$scope.update = function() {
		//console.log('update');
	}

	$scope.render = function() {
		//console.log('render');

		for (var i = $scope.bodies.length - 1; i >= 0; i--) {
			var body = $scope.bodies[i];

			$scope.game.debug.geom(body, '#ffffff');
		};
		
	}
	debugger;
});