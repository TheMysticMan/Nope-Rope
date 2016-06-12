/**
 * Created by edoli on 12-6-2016.
 */
angular.module('app.controllers').controller('playerDetailsController', function ($scope, $http, socket, $timeout, $rootScope, $playerDetailsService)
{
    $scope.callback = null;

    $scope.userName = "";
    $scope.init = function ()
    {
        $.ajax({
            url: 'https://randomuser.me/api/',
            dataType: 'jsonp',
            success: function (data)
            {
                $timeout(function ()
                {
                    $scope.userName = data.results[0].name.first + " " + data.results[0].name.last;
                });
            }
        });

        $rootScope.$on("showPlayerDetails", function (ev, callback)
        {
            $scope.callback = callback;
            $scope.show();
        })

    };

    $scope.show = function ()
    {
        // prevent closing the modal
        $("#setName_modal").modal(
            {
                backdrop: 'static',
                keyboard: false
            }
        );
        $("#setName_modal").modal("show");
    };

    $scope.hide = function ()
    {
        $("#setName_modal").modal("hide");
    };

    /**
     *
     */
    $scope.setName = function ()
    {
        socket.emit("Set name", $scope.userName, function ()
        {
            $scope.hide();
            $scope.callback($scope.userName);
        });
    };
    $scope.init();
});