/**
 * Created by edoli on 7-6-2016.
 */

var currentPlayerCount = 0;
var HighScore = require("./../../models/highscore");
var Guid = require("guid");
var Enumerable = require("linq");
var HighScoreService = require("./../../services/highScoreService");

/**
 * @return {number}
 */
var GeneratePlayerId = function ()
{
	return Guid.raw();
};

/**
 * This class defines a player object
 * @param socket {Socket} :socket.io socket
 * @constructor
 */
function Player(socket)
{
	var me = this;
	me.id = GeneratePlayerId();
	me.name = "";
	me.room = null;
	me.socket = socket;
	me.socketId = socket.id;
	me.currentPosition = null;
	me.direction = null;
	me.color = null;
	me.score = 0;

	me._highScoreEntity = new HighScore({playerId:me.id, score: [], date: new Date()});

	/**
	 * @type {Player.State}
	 * @private
	 */
	me._state = Player.State.Unknown;

	/**
	 * Holds the speed of the player
	 * @type {number}
	 * @private
	 */
	me._speed = 0;

	/**
	 * this method sets the name of this player
	 * @param name
	 */
	me.setName = function (name)
	{
		me.name = name;
		me._highScoreEntity.playerName = name;
	};

	/**
	 * This method returns the name of this player
	 * @returns {string|*}
	 */
	me.getName = function ()
	{
		return me.name;
	};

	/**
	 * This method sets the state of the player
	 * @param state {Player.State}
	 */
	me.setState = function (state)
	{
		me._state = state;
	};

	/**
	 * This method returns the state this player is currently in
	 * @returns {Player.State}
	 */
	me.getState = function ()
	{
		return me._state;
	}

	/**
	 * This method sets the speed of the player
	 * @param speed
	 */
	me.setSpeed = function (speed)
	{
		me._speed = speed;
	}

	/**
	 * this method returns the speed of the player
	 * @returns {number|*}
	 */
	me.getSpeed = function ()
	{
		return me._speed;
	};

	/**
	 * this method sets the current position of the player
	 * @param newPosition
	 */
	me.setCurrentPosition = function (newPosition)
	{
		me.currentPosition = newPosition;
	};

	/**
	 * This method gets the current position of the player
	 * @returns {null|*}
	 */
	me.getCurrentPosition = function ()
	{
		return me.currentPosition;
	};

	/**
	 * This method sets the direction of the player
	 * @param direction {Position}
	 */
	me.setDirection = function (direction)
	{
		me.direction = direction;
	};

	/**
	 * This method gets the direction of the player
	 * @returns {null|Position|*}
	 */
	me.getDirection = function()
	{
		return me.direction;
	};

	/**
	 *
	 */
	me.getDirectionString = function ()
	{
		for(var direction in Direction)
		{
			if(Direction.hasOwnProperty(direction) && Direction[direction] == me.direction)
			{
				return direction;
			}
		}
	};

	/**
	 * This method returns the new position for the amount of steps
	 * @param steps
	 * @returns {Position}
	 */
	me.getNewPosition = function (steps)
	{
		var position = me.getCurrentPosition();
		// add steps
		for(var i = 0; i < steps; i++)
		{
			position = Position.add(position, me.getDirection());
		}

		return position;
	};

	/**
	 * this method sets the color of this player
	 * @param color
	 */
	me.setColor = function (color)
	{
		me.color = color;
	};

	/**
	 * This method returns the color of this player
	 * @returns {null|*}
	 */
	me.getColor = function ()
	{
		return me.color;
	};

	/**
	 * This method sets the score of this player
	 * @param score {Number}
	 */
	me.setScore = function (score)
	{
		me.score = score;
	};

	/**
	 * This methods returns the score of this player
	 * @returns {Number}
	 */
	me.getScore = function ()
	{
		return me.score;
	};

	/**
	 * this method saves the new highscore
	 */
	me.saveScore = function (date, maxScore, roomId)
	{
		me._highScoreEntity.scores.push({score: me.getScore(), date: date, roomId: roomId, maxPoints: maxScore});
		me._highScoreEntity.percentage = HighScoreService.calculateAverage(me._highScoreEntity.scores).percentage;
		me.saveHighScoreEntity();
	};

	/**
	 * This method saves the highscore enity of this player
	 */
	me.saveHighScoreEntity = function ()
	{
		me._highScoreEntity.save();
	};

	/**
	 * This method returns the highscores for a roomId
	 * @param roomId
	 */
	me.getHighScoresForRoom = function (roomId)
	{
		return Enumerable.from(me._highScoreEntity.scores).where(function(score){return score.roomId == roomId}).toArray();
	}
}

/**
 * This defines the state a player can be in.
 * @type {{}}
 */
Player.State =
{
	Unknown    : 0,
	Spectating : 1,
	Alive      : 2,
	Dead       : 3
};

/**
 * This class defines a position on the game board
 * @constructor
 */
function Position(x, y)
{
	var me = this;
	me.x = x;
	me.y = y;
	
	me.equals = function (otherPosition)
	{
		return me.x == otherPosition.x && me.y == otherPosition.y;
	}
}
/**
 * This method adds 2 position and returns that
 * @param position1 {Position}
 * @param position2 {Position}
 */
Position.add = function(position1, position2)
{
	return new Position(position1.x + position2.x, position1.y + position2.y);
};

/**
 * This object defines the direction of the player on the gameboard
 */
var Direction = {
	// UP
	up : new Position(0, -1),
	// DOWN
	down : new Position(0, 1),
	// LEFT
	left : new Position(-1, 0),
	//RIGHT
	right : new Position(1, 0)
};

module.exports = exports =
{
	Player    : Player,
	Position  : Position,
	Direction : Direction
};