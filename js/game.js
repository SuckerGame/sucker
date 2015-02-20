var that; // TODO: :(

var DEBUG = true;

/**
 * Timer class handles the timing of the game.
 *
 * @constructor
 */
var Timer = function() {
}  

/**
 * Start a timer.
 * @param duration {int} Number of milliseconds.
 * @param callback {function} The function to call when the timer is over.
 */
Timer.prototype.start = function(duration, callback) {  
    setTimeout(callback, duration);
}  

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
    this.timer = new Timer(); // TODO: This needs more info
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

/*
 * @param callbacks An array of callback functions. Functions should
 *                  be in the same order the State enums are declared.
 */
Game.prototype.setStateCallbacks = function(callbacks) {
    this.stateCallbacks = callbacks;
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


var time = DEBUG ? 5000 : 10000;

/*
 * Starts a game.
 */
Game.prototype.start = function() {
    if (DEBUG || this.game.state == Game.State.PREGAME) { // TODO: Demo purpose
        this.changeState(Game.State.INPUT_LIE);
    } else {
        console.log("Game has already been started.");
    }
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

/*
 * @param state A valid Game.State.
 */
Game.prototype.changeState = function(state) {
    this.game.state = state;
    console.log("State is: " + state);
    switch (state) {
        case Game.State.INPUT_LIE:
            this.getNextQuestion();
            this.timer.start(time, function() { 
                that.changeState(Game.State.VOTE) 
            });
            break;
        case Game.State.VOTE:
            this.timer.start(time, function() { 
                that.changeState(Game.State.DISPLAY_RESULTS) 
            });
            break;
        case Game.State.DISPLAY_RESULTS:
            if (this.round < this.questions.length) {
                this.timer.start(time, function() { 
                    that.changeState(Game.State.INPUT_LIE) 
                });
            }
            break;
        case Game.State.GAMEOVER:
            break;
    }

    this.stateCallbacks[state]();
    this.game.$save();
}
