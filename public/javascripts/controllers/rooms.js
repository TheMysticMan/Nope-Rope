/**
 * Created by edoli on 12-6-2016.
 */
angular.module('app.controllers').controller('roomsController', function ($scope, $http, $location)
{
    $scope.rooms = [];
    $scope.newGameName = "";

    $scope.init = function ()
    {
        $http.get("/api/rooms").then(function(result)
        {
            $scope.rooms = result.data.rooms;
        })
    };

    $scope.onCreateNewGame = function ()
    {
        $("#createRoom_modal").modal('show');
    };

    $scope.createRoom= function ()
    {
        $http.post("/api/rooms", {name: $scope.newGameName}).then(function(result)
        {
            $("#createRoom_modal").modal('hide');
            $location.path("game/" + result.data.room.id);
        });
    };

    $scope.formatPlayerCount = function (room)
    {
        return room.playerCount + "/" + room.maxPlayerCount;
    };

    $scope.joinRoom = function(room)
    {
        $location.path("game/" + room.id);
    }

    $scope.init();
});