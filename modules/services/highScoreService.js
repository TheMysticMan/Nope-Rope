/**
 * Created by edoli on 11-6-2016.
 */
var Enumerable = require("linq");
var HighScore = require("./../models/highscore");

var HighScoreService = new function()
{
    var me = this;


    /**
     * This method gets the highscores for today
     * @param callback {Function}
     */
    me.getHighScoresForToday = function (skip, take, callback)
    {
        var date = new Date();
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        me.getHighScoresUntilDate(skip, take, date, callback);
    };

    /**
     * This method gets the highscores for a week
     */
    me.getHighScoresForWeek = function (skip, take, callback)
    {
        var date = new Date();
        date.setDate(date.getDate() -7);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        me.getHighScoresUntilDate(skip, take, date, callback);
    };

    /**
     * This method gets the highscores for a month
     */
    me.getHighScoresForMonth = function (skip, take, callback)
    {
        var date = new Date();
        date.setMonth(date.getMonth() -1);
        date.setHours(0);
        date.setMinutes(0);
        date.setSeconds(0);
        me.getHighScoresUntilDate(skip, take, date, callback);
    };

    me.getAllHighScores = function (skip, take, callback)
    {
        var baseQuery = HighScore.find();
        var query = HighScore.find();
        if(skip)
        {
            query = query.skip(skip);
        }
        if(take)
        {
            query = query.limit(take);
        }
        query.exec(function(err, highscores)
        {
            if(!err)
            {
                highscores = me.convert(highscores);
                baseQuery.count().exec(function(err, count){
                    callback({results: highscores, totalCount : count});
                });
            }
        })
    };
    /**
     * this method gets the highScores until a certain date.
     * @param maxDate
     */
    me.getHighScoresUntilDate = function (skip, take, maxDate, callback)
    {
        var baseQuery = HighScore.find().where('date').gte(maxDate);
        var query =  HighScore.find().where('date').gte(maxDate);
        if(skip)
        {
            query = query.skip(skip);
        }
        if(take)
        {
            query = query.limit(take);
        }
        query.exec(function(err, highscores)
        {
            if(!err)
            {
                highscores = me.convert(highscores);
                baseQuery.count().exec(function(err, count){
                    callback({results: highscores, totalCount : count});
                });
            }
        });
    };

    /**
     * this method calculates the average score for given scores
     */
    me.calculateAverage = function (scores)
    {
        var list = Enumerable.from(scores);
        var totalGames = list.count();
        var totalPoints = list.sum(function(x){return x.score});

        return {totalGames : totalGames, totalPoints: totalPoints};
    };

    /**
     * This method converts the highscores from the database to objects that can ben shown in the ui
     * @param highscores
     */
    me.convert = function (highscores)
    {
        return Enumerable.from(highscores).select(function(h)
        {
            var newObject = {
                playerId : h.playerId,
                playerName: h.playerName,
                date: h.date,
                score : me.calculateAverage(h.scores)
            };

            return newObject;
        }).toArray();
    }
}();

module.exports = exports = HighScoreService;