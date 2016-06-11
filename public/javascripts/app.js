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

// Routing
app.config(function ($routeProvider, $locationProvider)
{

    $routeProvider

        .when('/game', {
            templateUrl: 'pages/index.jade',
            controller: 'mainController',
        })
        .when('/highscores/:timespan?/:page?', {
            templateUrl: "pages/highscores/highscores.jade",
            controller: "highScoreController"
        })
        .when("/home", {
            templateUrl: "pages/home/home.jade",
            controller: "homeController"
        })
        .otherwise({redirectTo: "/home"});

    $locationProvider.html5Mode(true);

});