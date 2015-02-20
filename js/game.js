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
        gameObject.round = 0;
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
    DISPLAY_VOTES : "DISPLAY_VOTES",
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
    for (var i = 0; i < questions.length; ++i) {
        var question = questions[i];
        this.questions[i].Q = question.Q.replace(".", "");
        if (!this.game.questions[question.Q.replace(".", "")]) {
            this.game.questions[question.Q.replace(".", "")] = 
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
    var next = this.questions[this.round].Q;
    this.round = this.game.round = this.round + 1; // TODO: Risky?
    this.game.$save();
    console.log(next);
    return next;
}

/*
 * Gets the current question.
 */
Game.prototype.getQuestion = function() {
    return this.questions[this.round == 0 ? 0 : this.round - 1].Q; // TODO: Logic =\
}

/*
 * TODO: Hacked
 */ 
Game.prototype.getChoices = function() {
    // console.log(this.game.questions[this.questions[this.round == 0 ? 0 : this.round - 1].Q]);
    return this.game.questions[this.questions[this.round == 0 ? 0 : this.round - 1].Q].choices;
}

/*
 * @param state A valid Game.State.
 */
Game.prototype.changeState = function(state) {
    this.game.state = state;
    console.log("State is: " + state);
    switch (state) {
        case Game.State.INPUT_LIE:
            this.timer.start(time, function() { 
                that.changeState(Game.State.VOTE) 
            });
            break;
        case Game.State.VOTE:
            this.timer.start(time, function() { 
                that.changeState(Game.State.DISPLAY_VOTES) 
            });
            break;
        case Game.State.DISPLAY_VOTES:
            if (this.round < this.questions.length) {
                this.getNextQuestion();
                
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
