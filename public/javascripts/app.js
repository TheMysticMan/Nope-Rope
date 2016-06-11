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
app.config(function($routeProvider, $locationProvider) {

    $routeProvider

    .when('/', {
        templateUrl : 'pages/index.jade',
        controller  : 'mainController',
    })

    .when('/page1', {
        templateUrl : 'pages/page1/index.jade',
        //controller  : 'mainController',
    })

    .when('/page2', {
        templateUrl : 'pages/page2/index.jade',
        //controller  : 'mainController',
    });

    $locationProvider.html5Mode(true);

});