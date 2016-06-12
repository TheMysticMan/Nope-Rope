/**
 * Created by edoli on 12-6-2016.
 */
angular.module('app.controllers').controller('splashController', function ($scope, $http, socket, $timeout, $location)
{
    $scope.hidden = false;

    $scope.init = function ()
    {
        $timeout(function()
        {
            $scope.hidden = true;
            $location.path("/rooms");
        }, 5000);
    }();
});