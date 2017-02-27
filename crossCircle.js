/**
 * Created by minsk on 25.02.2017.
 */
'use strict'
function Game() {
    var gameLog = [];
    var isGame = {active: false};
    var field = {
        fieldArr: [],
        fromVector: function (vector) {
            if (vector.y >= size || vector.x >= size) return 'n';
            if (vector.y < 0 || vector.x < 0) return 'n';
            return field.fieldArr[vector.y][vector.x];
        }
    };
    var activePlayer;
    var lastTurn;
    var size = 10;
    var winlength = 5;
    var stepCounter = 0;
    var score = {
        'cross': 0,
        'circle': 0
    };

    var newGame = function (n) {
        size = n;
        if (size < 5) winlength = 3;
        stepCounter = 0;
        newField(size);
        setActivePlayer("cross");
        gameLog.length = 0;
        isGame.active = true;
        return field.fieldArr;
    };

    function setActivePlayer(player) {
        activePlayer = player;
    };

    function endTurn() {
        if (checkDraw()) {
            draw();
        }else {
            if (checkWin()) {
                win();
            }
            togglePlayer();
            intoGameLog();
        }
    };

    function checkDraw() {
        if (stepCounter == size * size) return true;
        return false;
    }

    function draw() {
        isGame.active = false;
    }

    function win() {
        score[activePlayer] = score[activePlayer] + 1;
        isGame.active = false;
    }

    function togglePlayer() {
        if (activePlayer == 'cross') setActivePlayer('circle');
        else setActivePlayer('cross');
    }

    function checkWin() {
        var keys = Object.keys(direction);
        for (var i = 0; i < keys.length; i++) {
            var turn = new Vector(lastTurn.x, lastTurn.y);
            turn = turn.plus(direction[keys[i]]);
            if (field.fromVector(turn) == activePlayer) {
                var inRow = 1;
                var position = new Vector(lastTurn.x, lastTurn.y);
                var dir = direction[keys[i]];
                while (field.fromVector(position = position.plus(dir)) == activePlayer) inRow++;
                dir = direction[opDir[keys[i]]];
                position = new Vector(lastTurn.x, lastTurn.y);
                while (field.fromVector(position = position.plus(dir)) == activePlayer) inRow++;
                if (inRow >= winlength) return true;
            }
        }
        console.log(lastTurn.x, lastTurn.y);
        return false;
    }

    function intoGameLog() {
        gameLog.push(lastTurn);
    }

    function isEmpty(vector) {
        if (field.fieldArr[vector.y][vector.x] == 'n') return true
        return false;
    }

    function newField(n) {
        field.fieldArr.splice(0, field.fieldArr.length);
        for (var i = 0; i < n; i++) {
            var line = [];
            for (var j = 0; j < n; j++) {
                line.push('n');
            }
            field.fieldArr.push(line.slice(0));
        }
    }

    var direction = {
        'n': new Vector(0, -1), //[0, -1],
        'nw': new Vector(1, -1),//[1, -1],
        'w': new Vector(1, 0),  //[1, 0],
        'sw': new Vector(1, 1), //[1, 1],
        's': new Vector(0, 1),  //[0, 1],
        'se': new Vector(-1, 1),//[-1, 1],
        'e': new Vector(-1, 0), //[-1, 0],
        'ne': new Vector(-1, -1), //[-1, 1]
    };

    var opDir = {
        'n': 's',
        'nw': 'se',
        'w': 'e',
        'sw': 'ne',
        's': 'n',
        'se': 'nw',
        'e': 'w',
        'ne': 'sw'
    }

    function Vector(x, y) {
        this.x = x;
        this.y = y;
        //console.log('x:', x, 'y:', y, 'this:', this, 'this.x:', this.x, 'this.y:', this.y);
    }

    Vector.prototype.plus = function (vector) {
        return new Vector(this.x + vector.x, this.y + vector.y);
    };

    function getTurn(vector) {
        if (isEmpty(vector)) {
            stepCounter++;

            lastTurn = new Vector(vector.x, vector.y);
            field.fieldArr[vector.y].splice(vector.x, 1, activePlayer);
            endTurn();
        }
    };

    return {
        newGame: newGame,
        getTurn: function (x, y) {
            var vect = new Vector(x, y);
            getTurn(vect);
        },
        isGame: isGame,
        score: score
    };
}

var game = new Game();
var gameField = '';
var gameView = new Vue({
    el: '#gameDiv',
    data: {
        field: gameField,
        isGame: game.isGame,
        score: game.score,
        size: '',
        inputMessage: 'enter field size'
    },
    methods: {
        getClick: function (event) {
            game.getTurn(event.target.cellIndex, event.target.parentNode.rowIndex);
        },
        newGame: function () {
            console.log(this.size);
            if (!isNumeric(this.size)) {
                this.inputMessage = 'not a number';
                this.size = '';
                return
            }
            if ((this.size > 15) || (this.size < 3)) {
                this.inputMessage = 'number not in the range [3..15]';
                this.size = '';
            }
            this.isGame.active = true;
            this.field = game.newGame(this.size);
        }
    }
});

function isNumeric(n) {
    return !isNaN(parseFloat(n)) && isFinite(n);
}
