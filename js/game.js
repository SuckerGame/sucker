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

    if (!gameObject.users) {
        gameObject.users = {};
    }

    if (!gameObject.users[user]) {
        gameObject.users[user] = 0;
    }

    if (DEBUG || !gameObject.state) {
        gameObject.state = Game.State.PREGAME;
    }

    if (!gameObject.round) {
        gameObject.round = -1;
    }

    this.users = gameObject.users;
    this.round = gameObject.round;
    this.users = gameObject.users;
    this.state = gameObject.state;
    this.questions = [];
    this.stateCallbacks = [];

    this.game.$save();
}

Game.State = {
    PREGAME : "PREGAME",
    STARTED : "STARTED",
    INPUT_LIE : "INPUT_LIE",
    VOTE : "VOTE",
    DISPLAY_RESULTS : "DISPLAY_RESULTS",
    GAMEOVER : "GAMEOVER",
}


Game.prototype.start = function() {
    this.state = this.game.state = Game.State.STARTED;
    this.game.$save();
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

    var newstate = this.game.times[closestTime].state;
    if (this.state != newstate) {
        this.state = this.game.state = this.game.times[closestTime].state;
        this.round = this.game.round = this.game.times[closestTime].round;
        this.game.$save();
        this.stateCallbacks[this.game.state]();
    }

    var next = parseInt(closestTime) + 10000;
    var timeTillNextState = Math.floor((next - currentTime) / 1000);
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

Game.prototype.addPoints = function(points) {
    this.game.users[this.user] += points;
    this.game.$save();
    return this.game.users;
}
