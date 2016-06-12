angular.module('app.controllers').controller('mainController', function ($scope, socket, cfpLoadingBar, LocalPlayer, Player, $routeParams)
{

    /**
     * this will hold our playerId
     * @type {null}
     */
    $scope.playerId = null;

    $scope.init = function ()
    {
        $scope.gameWidth = $('#gamecanvas').width() -4;
        $scope.gameHeight = 600 -4;

        $scope.game = new Phaser.Game($scope.gameWidth, $scope.gameHeight, Phaser.AUTO, 'gamecanvas', {
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

            var index = 0;
            for(var i = 0; i < $scope.players.length; i++)
            {
                if($scope.players[i].id == data.leftPlayer.id)
                {
                    index = i;
                }
            }

            $scope.players.splice(index, 1);
        });

        socket.emit("Join room", {name: "Demo Player", roomId: $scope.roomId}, function (playerId, connectedPlayers)
        {
            $scope.playerId = playerId;
            for (var i = 0; i < connectedPlayers.length; i++)
            {
                var p = connectedPlayers[i];
                console.log("color: ", p.color);
                $scope.players.push(new Player($scope.game, p.id, p.name, p.color));
            };
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
            $('#highscore_modal').modal('hide');
            $scope.clearBoard();
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

            $scope.game.scale.onResize = $scope.resized();
            $scope.resized();

            $(window).resize(function() {
                $scope.resized();
            });
        },

        $scope.update = function ()
        {

        }

        $scope.resized = function() {

            $scope.gameWidth = $('#gamecanvas').width() -4;
            $scope.gameHeight = 600 -4;

            $scope.game.scale.minWidth = $scope.gameWidth;
            $scope.game.scale.minHeight = $scope.gameHeight;
            $scope.game.scale.maxWidth = $scope.gameWidth;
            $scope.game.scale.maxHeight = $scope.gameHeight;
           
            $scope.game.scale.updateLayout(true);
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

    $scope.isMobile = function ()
    {
        var isMobile = false; //initiate as false
        // device detection
        if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|ipad|iris|kindle|Android|Silk|lge |maemo|midp|mmp|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows (ce|phone)|xda|xiino/i.test(navigator.userAgent)
            || /1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(navigator.userAgent.substr(0,4))) isMobile = true;

        return isMobile;
    }
});