/**
 * Created by edoli on 12-6-2016.
 */
angular.module('app.services')
    .factory('$playerDetailsService', function ($q, socket, $rootScope)
    {
        var playerName = "";
        var factory = {
            isPlayerReady : function ()
            {
                var me = this;
                return playerName != "" && playerName != null && playerName != undefined;
            },
            
            getPlayerReady : function ()
            {
                var deferred = $q.defer();
                $rootScope.$emit("showPlayerDetails", function()
                {
                    deferred.resolve();
                });

                return deferred.promise;
            }
        };

        return factory;
    });