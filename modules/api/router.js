/**
 * Created by edoli on 11-6-2016.
 */
var express = require("express");
var router = express.Router();
var HighScoreService = require("./../services/highScoreService");
var roomFactory = require("./../game/room/roomFactory");

router.get("/highscores", function(req, res)
{
    var method = null;
    switch(req.query.timespan)
    {

        case "today":
            method = HighScoreService.getHighScoresForToday;
            break;
        case "week":
            method = HighScoreService.getHighScoresForWeek;
            break;
        case "month":
            method = HighScoreService.getHighScoresForMonth;
            break;
        case "all":
            method = HighScoreService.getAllHighScores;
            break;
    }

    method(parseInt(req.query.skip), parseInt(req.query.take), function(highscores)
    {
        res.json(highscores);
    });
});

router.get("/rooms", function(req, res)
{
    res.json({rooms: roomFactory.getRooms()});
});

router.post("/rooms", function(req,res)
{
    res.json({room: {id: roomFactory.createRoom(req.body.name)}});
});

module.exports = exports = router;