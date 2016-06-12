/**
 * Created by edoli on 11-6-2016.
 */
angular.module('app.controllers').controller('homeController', function ($scope, $http, socket, $timeout)
{
    $scope.userName = "";
    $scope.init = function ()
    {
        $.ajax({
            url: 'https://randomuser.me/api/',
            dataType: 'jsonp',
            success: function(data){
                $timeout(function()
                {
                    $scope.userName = data.results[0].name.first + " " + data.results[0].name.last;
                });
                $("#setName_modal").modal("show");
            }
        });
    };

    /**
     *
     */
    $scope.setName = function ()
    {
        socket.emit("Set name", $scope.userName, function ()
        {
            $("#setName_modal").modal("hide");
        });
    };
    $scope.init();
});