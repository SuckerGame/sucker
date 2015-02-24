var that; // TODO: :(

var DEBUG = true;

/**
 * Game class models a Sucker game.
 *
 * TODO: Remove dependency on Firebase. (sync is super convenient).
 *
 * @param gameObject Firebase Game object.
 * @constructor
 */
var Game = function(user, gameObject, maxNumRounds) {
    that = this;
    this.user = user;
    this.game = gameObject;

    if (DEBUG || !gameObject.state) {
        gameObject.state = Game.State.PREGAME;
    }

    if (DEBUG || !gameObject.round) {
        gameObject.round = -1;
    }

    if (DEBUG || !gameObject.points) {
        gameObject.points = {};
    }

    if (!gameObject.points[this.user]) {
        gameObject.points[this.user] = 0;
    }

    this.round = gameObject.round;

    this.questions = [];
    this.stateCallbacks = [];

    this.game.$save();
}

Game.State = {
    PREGAME : "PREGAME",
    INPUT_LIE : "INPUT_LIE",
    VOTE : "VOTE",
    DISPLAY_RESULTS : "DISPLAY_RESULTS",
    GAMEOVER : "GAMEOVER",
}

/**
 * @return if the game has already started.
 */
Game.prototype.isStarted = function() {
    return this.game.state != Game.State.PREGAME;
}

/*
 * @param callbacks An array of callback functions. Functions should
 *                  be in the same order the State enums are declared.
 */
Game.prototype.setStateCallbacks = function(callbacks) {
    this.stateCallbacks = callbacks;
}

/**
 * @param times A dictionary of time data that holds what state
 *              and round it is (and when).
 */
Game.prototype.setTimes = function(times) {
    this.game.times = times;
    this.game.$save();
}

/**
 * @param currentTime The current time (using Date.getTime()).
 * @return Number of seconds left until the next state.
 */
Game.prototype.update = function(currentTime) {
    if (this.game.state == Game.State.PREGAME) {
        this.game.state = Game.State.INPUT_LIE;
    }

    var times = Object.keys(this.game.times);
    var closestTime = times[0];
    var minDiff = currentTime - closestTime;
    
    var length = times.length;
    for (var i = 0; i < length; ++i) {
        var diff = currentTime - times[i];
        if (diff >= 0 && diff < minDiff) {
            closestTime = times[i];
            minDiff = diff;
        }
    }

    this.state = this.game.state = this.game.times[closestTime].state;
    this.round = this.game.round = this.game.times[closestTime].round;
    console.log("state: " + this.state + " round: " + this.round);
    this.game.$save();
    this.stateCallbacks[this.game.state]();


    var next = parseInt(closestTime) + 10000;
    var timeTillNextState = Math.floor((next - currentTime) / 1000);
    // console.log("derp: " + derp + "next: " + next + " currentTime: " + currentTime);
    return timeTillNextState;
}

/*
 * @param questions An array of question data.
 */
Game.prototype.setQuestions = function(questions) {
    this.questions = questions;
    console.log("questions");
    console.log(questions);
    for (var i = 0; i < questions.length; ++i) {
        var question = questions[i];
        var questionKey = question.Q.replace(".", "");
        this.questions[i].Q = questionKey;

        if (!this.game.questions) {
            this.game.questions = {};            
        }

        if (!this.game.questions[questionKey]) {
            this.game.questions[questionKey] = 
                {"choices": {"computer": question.A}};
        }
    }
    this.game.$save();
}

/*
 * Warning: This question does not check whether or not
 * there *is* a "next" question.
 * 
 * @return An object with the next question data.
 */
Game.prototype.getNextQuestion = function() {
    this.round = this.round + 1;
    var next = this.questions[this.round].Q;
    this.game.round = this.round; // TODO: Risky?
    this.game.$save();
    return next;
}

/*
 * Gets the current question.
 */
Game.prototype.getQuestion = function() {
    return this.questions[this.round].Q;
}

/*
 * Gets the answer for the current question..
 */
Game.prototype.getAnswer = function() {
    return this.questions[this.round].A;
}

/*
 * TODO: Hacked
 */ 
Game.prototype.getChoices = function() {
    // console.log(this.game.questions[this.questions[this.round].Q]);
    return this.game.questions[this.questions[this.round].Q].choices;
}

/**
 *
 */
Game.prototype.addPoints = function(points) {
    this.game.points[this.user] += points;
    this.game.$save();
}
