var app = angular.module('app', [
    'app.controllers',
    'app.services',
    'app.directives',
    'ngRoute',
    'ngAnimate',

    // 3rd party dependencies
    'btford.socket-io',
    'angular-loading-bar',
]);

// Make sure to create the modules
angular.module('app.controllers', []);
angular.module('app.services', []);
angular.module('app.directives', []);

var appStarted = false;
// Routing
app.config(function ($routeProvider, $locationProvider)
{
    var isPlayerNameSet = function ($q, $timeout, $playerDetailsService, $location)
    {
        var deferred = $q.defer();

        if(!appStarted)
        {
            $location.path("/home");
            deferred.reject();
            appStarted = true;
        }
        else{
            if(!$playerDetailsService.isPlayerReady())
            {
                $playerDetailsService.getPlayerReady().then(function()
                {
                    deferred.resolve();
                })
            }
            else
            {
                deferred.resolve();
            }
        }

        return deferred.promise;
    };

    var isStarted = function ()
    {
        appStarted = true;
    };
    var defaultResolve =
    {
        isPlayerNameSet : isPlayerNameSet
    };

    $routeProvider

        .when('/game/:roomId?', {
            templateUrl: 'pages/index.jade',
            controller: 'mainController',
            resolve: defaultResolve
        })
        .when('/highscores/:timespan?/:page?', {
            templateUrl: "pages/highscores/highscores.jade",
            controller: "highScoreController",
            resolve: defaultResolve
        })
        .when("/home", {
            templateUrl: "pages/home/home.jade",
            controller: "homeController",
            resolve : {isStarted: isStarted}
        })
        .when("/rooms", {
            templateUrl: "pages/rooms/rooms.jade",
            controller: "roomsController",
            resolve: defaultResolve
        })
        .otherwise({redirectTo: "/home"});

    $locationProvider.html5Mode(true);

});