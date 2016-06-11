/**
 * Created by edoli on 11-6-2016.
 */
angular.module('app.controllers').controller('highScoreController', function ($scope, $http, $routeParams, $timeout)
{
    $scope.scores = [];
    $scope.totalCount = '';
    $scope.timespan ="";
    $scope.pageSize = 20;
    $scope.pages = [];

    $scope.init = function ()
    {
        $scope.timespan = $routeParams.timespan ? $routeParams.timespan : "today";

        $scope.page = $routeParams.page ? parseInt($routeParams.page) : 1;
        $scope.skip = ($scope.page -1) * $scope.pageSize;


        $http.get("/api/highscores?timespan="+ $scope.timespan + "&skip=" + $scope.skip + "&take=" + $scope.pageSize ).then(function(result)
        {
            $timeout(function()
            {
                $scope.scores = result.data.results;
                $scope.totalCount = result.data.totalCount;
                $scope.setPages();
            })
        })
    };

    $scope.setPages = function ()
    {
        $scope.totalPages = Math.ceil($scope.totalCount / $scope.pageSize);
        for(var i = 1; i <= $scope.totalPages; i++)
        {
            $scope.pages.push({number: i, active : i == $scope.page? true:false});
        }
    };

    $scope.isActive = function (timespan)
    {
        return timespan == $scope.timespan;
    };

    $scope.init();
});