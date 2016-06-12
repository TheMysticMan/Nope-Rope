angular.module('app.controllers').controller('mainController', function ($scope, socket, cfpLoadingBar, LocalPlayer, Player, $routeParams)
{

    /**
     * this will hold our playerId
     * @type {null}
     */
    $scope.playerId = null;

    $scope.init = function ()
    {

        $scope.game = new Phaser.Game(800, 600, Phaser.AUTO, 'game', {
            preload: $scope.preload,
            create: $scope.create,
            update: $scope.update,
            render: $scope.render
        });

        $scope.players = new Array();
        $scope.colors = new Array();
        $scope.colors.push("#ff00a2");
        $scope.colors.push("#5bffff");
        $scope.colors.push("#FF9F1E");
        $scope.colors.push("#4ea683");
        $scope.roomId = $routeParams.roomId ? $routeParams.roomId : 1;

        socket.on("Say", function (filename)
        {
            $('audio#tts').attr('src', filename).trigger('play');
        });

        socket.on("Player joined", function (data)
        {
            console.log("player " + data.newPlayer.id + " joined");
            console.log("color: ", data.newPlayer.color);
            $scope.players.push(new Player($scope.game, data.newPlayer.id, data.newPlayer.name, data.newPlayer.color));
        });

        socket.on("Player left", function (data)
        {
            console.log("player " + data.leftPlayer.id + " left");
            delete $scope.players[data.leftPlayer.id];
        });

        socket.emit("Join room", {name: "Demo Player", roomId: $scope.roomId}, function (playerId, connectedPlayers)
        {
            $scope.playerId = playerId;
            for (var i = 0; i < connectedPlayers.length; i++)
            {
                var p = connectedPlayers[i];
                console.log("color: ", p.color);
                $scope.players.push(new Player($scope.game, p.id, p.name, p.color));
            }
            ;

        });

        socket.on("Player position update", function (playerPosition)
        {
            var playerId = playerPosition.playerId;
            var position = playerPosition.position;
            var roomId = playerPosition.roomId;

            for (var i = 0; i < $scope.players.length; i++)
            {
                var player = $scope.players[i];

                if (player.id == playerId)
                {
                    player.move(position)
                }
            }

        });

        socket.on("Game started", function (data)
        {
            var players = data.players;
            players.forEach(function (p)
            {
                if (p.id == $scope.playerId)
                {
                    $scope.localPlayer.updateDirection(p.direction)
                }
            })
        });
        socket.on("Game stopped", function (data)
        {
            $scope.highScores = data.highScores;
            $('#highscore_modal').modal('show');
        });
    },

        $scope.preload = function ()
        {
            console.log('preload');

            $scope.game.stage.backgroundColor = "#1f2324";
            $scope.game.stage.disableVisibilityChange = true;
            $scope.timeCheck = $scope.game.time.now;
            $scope.localPlayer = new LocalPlayer($scope.game);
        },

        $scope.create = function ()
        {
            console.log('create');
        },

        $scope.update = function ()
        {

        }

    $scope.render = function ()
    {

        for (var p in $scope.players)
        {
            $scope.players[p].render();

        }
    };

    $scope.leave = function ()
    {
        socket.emit("Leave room");
    }
    $scope.startgame = function ()
    {
        socket.emit("Start game", null, function ()
        {

        });
    }

    $scope.restartGame = function ()
    {
        $('#highscore_modal').modal('hide');
        $scope.clearBoard();
        $scope.startgame();
    };

    $scope.clearBoard = function ()
    {
        for (var p in $scope.players)
        {
            $scope.players[p].clearBodies();
            $scope.players[p].render();
        }
    }
});