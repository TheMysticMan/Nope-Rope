/**
 * Created by edoli on 11-6-2016.
 */
var mongoose = require("mongoose");
var Schema = mongoose.Schema;

var highScoreSchema = new Schema({
    playerId :String,
    playerName: String,
    scores: [{score:Number, date:Date, roomId: String, maxPoints: Number}],
    date: Date
});

var HighScore = mongoose.model("HighScore", highScoreSchema);

module.exports = exports = HighScore;