var that; // TODO: :(
var numQuestions;


var DEBUG = true;

/**
 * Game class models a Sucker game.
 *
 * TODO: Remove dependency on Firebase. (sync is super convenient).
 *
 * @param gameObject Firebase Game object.
 * @constructor
 */
var Game = function(user, gameObject, maxNumRounds, stateCallbacks) {
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

    if (!gameObject.activeUsers) {
        gameObject.activeUsers = 0;
    }

    if (!gameObject.leftoverTime) {
        gameObject.leftoverTime = 0;
    }

    if (!gameObject.taken) {
        gameObject.taken = [0, 0, 0, 0];
    }

    if (!gameObject.numUsers) {
        gameObject.numUsers = 0;
    }

    this.users = gameObject.users;
    this.round = gameObject.round;
    this.state = gameObject.state;
    this.times = gameObject.times;
    this.questions = [];
    this.stateCallbacks = stateCallbacks;
    this.activeUsers = gameObject.activeUsers;
    this.leftoverTime = gameObject.leftoverTime;
    this.taken = gameObject.taken;
    this.numUsers = gameObject.numUsers;
    this.game.state = gameObject.state;

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

/**
 * @param times A dictionary of time data that holds what state
 *              and round it is (and when).
 */
Game.prototype.setTimes = function(times) {
    this.game.times = times;
    this.game.$save();
}

Game.prototype.setActiveUsers = function(activeUsers) {
    this.game.activeUsers = activeUsers;
    this.game.$save();
}

Game.prototype.setLeftoverTime = function(leftoverTime) {
    this.game.leftoverTime = leftoverTime;
    this.game.$save();
}

Game.prototype.setNumUsers = function(numUsers) {
    this.game.numUsers = numUsers;
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
        this.game.activeUsers = this.game.numUsers;
        //this.game.activeUsers = this.activeUsers;
        //this.game.leftoverTime = this.leftoverTime;
        this.game.$save();
        this.stateCallbacks[this.game.state]();
    }

    var next = parseInt(closestTime) + 25000;
    var timeTillNextState = Math.floor((next - currentTime) / 1000);
    return timeTillNextState;
}

/*
 * @param questions An array of question data.
 */
Game.prototype.setQuestions = function(questions, taken) {
    this.questions = questions;
    this.taken = taken;
    console.log("questions");
    console.log(questions);
    numQuestions = questions.length;
    for (var i = 0; i < questions.length; ++i) {
        var question = questions[i];
        var questionKey = question.Q
            .replace(".", "")
            .replace("#", "")
            .replace("$", "")
            .replace("/", "")
            .replace("[", "")
            .replace("'", "");
        this.questions[i].Q = questionKey;

        if (!this.game.questions) {
            this.game.questions = {};
        }

        if (!this.game.questions[questionKey]) {
            this.game.questions[questionKey] =
                {"choices": {"computer": question.A}};
        }
        this.game.taken[i] = taken[i];
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

Game.prototype.addChoice = function(username, choice) {
    this.game.questions[this.questions[this.round].Q].choices[username] = choice;
    this.game.$save();
    this.questions = this.game.questions;
}

Game.prototype.getChoices = function() {
    var choices = this.game.questions[this.questions[this.round].Q].choices;
    var choicesMinusMe = {};
    for (var user in choices) {
        if (user != this.user) {
            choicesMinusMe[user] = choices[user];
        }
    }
    return choicesMinusMe;
}

Game.prototype.getActiveUsers = function() {
    return this.game.activeUsers;
}

Game.prototype.getLeftoverTime = function() {
    return this.game.leftoverTime;
}

Game.prototype.getNumUsers = function() {
    return this.game.numUsers;
}

// Gives points to the user for choosing the correct answer
Game.prototype.addPoints = function(points) {
    this.game.users[this.user] += points;
    this.game.$save();
    return this.game.users;
}

// User chose a lie so awards points to the user that created the lie
Game.prototype.addLiePoints = function(user, points) {
    this.game.users[user] += points;
    this.game.$save();
    return this.game.users;
}
