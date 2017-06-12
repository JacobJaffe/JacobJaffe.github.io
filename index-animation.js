/**
 * Created by JacobJaffe on 3/20/17.
 */

var canvasContainer; /* div container for the canvas */
var canvas;     /* HTML5 canvas to render/draw on */
var context;    /* canvas context property */
var time;

function init() {
    startTime = new Date();
    setupGraphics();
    setupKeyboard();
    setupMessages();
    window.requestAnimationFrame(draw);
}

/* initializes canvas, initializes animations */
function setupGraphics() {
    canvasContainer = document.getElementById("canvas-container");
    canvas = document.getElementById("myCanvas");
    context = canvas.getContext("2d");
    resizeCanvas();
}

/* resizes canvas to fit screen */
function resizeCanvas() {
    canvas.width = canvasContainer.clientWidth;
    canvas.height = canvasContainer.clientHeight;
    setFont(fontRatio);
}

var messages = [];
var currentMessage;

/* draw each frame of animation */
function draw() {
    var now = new Date().getTime();
    dt = (now - (time || now)) / 1000;
    time = now;
    context.clearRect(0, 0, canvas.width, canvas.height); /* clears previous frame */
    resizeCanvas();
    animatedTyping(messages[currentMessage], dt);
    drawKeyboard(dt);
    requestAnimationFrame(draw);
}

var fontRatio = 0.08; /* default ratio */
var fontSize;

function setFont(ratio) {
    fontSize = canvas.width * ratio;
    context.font = (fontSize|0) + 'px Courier New'; // set font
    context.textAlign = "center";

}

var waitTime = 1; /* wait three seconds initially for animation to start */
var charArray = [];
var currentChar = 0;
var currentString = '';
/* animates typing to canvas */
function animatedTyping(text, dt) {
    if (currentChar == 0) {  /* parse new text */
        charArray = Array.from(text);
    }
    if (waitTime <= 0) {
        if (currentChar < charArray.length) {
            forwardsTyping();
        }
        if (currentChar > charArray.length) {
            if (currentChar > charArray.length * 2) {
                nextMessage();
            } else {
                backwardsTyping();
            }
        } else
        if (currentChar == charArray.length) {
            waitTime = 1;
        }
        /* first check not undefined, i.e. not a valid array address, then check if key is in map */
        if (charArray[currentChar] && charArray[currentChar].toLocaleLowerCase() in keys) {
            keys[charArray[currentChar].toLocaleLowerCase()].pressed = true;
            keys[charArray[currentChar].toLocaleLowerCase()].timeAsColor = 0;
        }
        currentChar++;
    }

    waitTime -= dt;
    var x = canvas.width / 2;
    var y = canvas.height / 4;
    if (y < fontSize ){
        y = fontSize ;
    }
    context.fillText(currentString, x, y);
}

function forwardsTyping() {
    waitTime = Math.random() * (0.2 - 0.15) + 0.15;
    currentString += charArray[currentChar];
}

function backwardsTyping() {
    waitTime = Math.random() * (0.15 - 0.05) + 0.05;
    currentString = currentString.slice(0, -1);
}

function nextMessage() {
    currentMessage++;
    if (currentMessage == messages.length) {
        currentMessage = 0;
    }
    currentChar = -1; /* for the ++ at end of function */
    waitTime = 1;
}

function setupMessages() {
    messages.push("Hello World");
    messages.push("I'm Jacob");
    currentMessage = 0;
}


/***************
 Abstraction Barrier: Keyboard:
 *****************/

var keys = [];

function Key(char, col, row) {
    this.char = char;
    this.col = col;
    this.row = row;
    this.pressed = false;
    this.strokeStyle = "black";
    this.fillStyle = "#f9f9f9";
    this.timeAsColor = 0; /* for animation */
}

Key.prototype.draw = function() {
    var length = (canvas.width / 1.75) / 10;
    var x = (this.col * length * 1.4);
    var y = canvas.height / 3 + (this.row * length * 1.4);

    /* optimize to try and fit all rows if possible */
    if (length + canvas.height / 3 + 3 * length * 1.4 > canvas.height) {
        y = fontSize * 2 + (this.row - 1) * length * 1.4;
    }

    x += this.row * length / 1.75;
    context.lineWidth = 0.05 * length;
    if (this.pressed){
        this.pressedStyle();
    }
    context.strokeStyle = this.strokeStyle;
    context.fillStyle = this.fillStyle;
    roundRect(context, x, y , length, length,  length / 4, true, true );
};

/* compute the fade of the pressed key */
Key.prototype.pressedStyle = function() {
    if (this.timeAsColor >= 1) {
        this.pressed = false;
        this.timeAsColor = 0;
        this.fillStyle = "#f9f9f9";
        this.strokeStyle = "black";
    } else {
        // this.strokeStyle = "rgb(255,"  + 0 + "," + 0 + ")"
        var fade = Math.floor(this.timeAsColor * 255);
        this.fillStyle = "rgb(255,"  + fade + "," + fade + ")";

    }

};

function setupKeyboard() {
    keys['q'] = new Key('q', 1, 1);
    keys['w'] = new Key('w', 2, 1);
    keys['e'] = new Key('e', 3, 1);
    keys['r'] = new Key('r', 4, 1);
    keys['t'] = new Key('t', 5, 1);
    keys['y'] = new Key('y', 6, 1);
    keys['u'] = new Key('u', 7, 1);
    keys['i'] = new Key('i', 8, 1);
    keys['o'] = new Key('o', 9, 1);
    keys['p'] = new Key('p', 10, 1);
    keys['a'] = new Key('a', 1, 2);
    keys['s'] = new Key('s', 2, 2);
    keys['d'] = new Key('d', 3, 2);
    keys['f'] = new Key('f', 4, 2);
    keys['g'] = new Key('g', 5, 2);
    keys['h'] = new Key('h', 6, 2);
    keys['j'] = new Key('j', 7, 2);
    keys['k'] = new Key('k', 8, 2);
    keys['l'] = new Key('l', 9, 2);
    keys['z'] = new Key('z', 1, 3);
    keys['x'] = new Key('x', 2, 3);
    keys['c'] = new Key('c', 3, 3);
    keys['v'] = new Key('v', 4, 3);
    keys['b'] = new Key('b', 5, 3);
    keys['n'] = new Key('n', 6, 3);
    keys['m'] = new Key('m', 7, 3);
}


function drawKeyboard(dt) {
    for (var i in keys) {
        keys[i].timeAsColor += dt;
        keys[i].draw();
    }
}


/* By Juan Mendes, from stackoverflow
 http://stackoverflow.com/questions/1255512/how-to-draw-a-rounded-rectangle-on-html-canvas
 TODO: Make my own version for these needs
 */

function roundRect(ctx, x, y, width, height, radius, fill, stroke) {
    if (typeof stroke == 'undefined') {
        stroke = true;
    }
    if (typeof radius === 'undefined') {
        radius = 5;
    }
    if (typeof radius === 'number') {
        radius = {tl: radius, tr: radius, br: radius, bl: radius};
    } else {
        var defaultRadius = {tl: 0, tr: 0, br: 0, bl: 0};
        for (var side in defaultRadius) {
            radius[side] = radius[side] || defaultRadius[side];
        }
    }
    ctx.beginPath();
    ctx.moveTo(x + radius.tl, y);
    ctx.lineTo(x + width - radius.tr, y);
    ctx.quadraticCurveTo(x + width, y, x + width, y + radius.tr);
    ctx.lineTo(x + width, y + height - radius.br);
    ctx.quadraticCurveTo(x + width, y + height, x + width - radius.br, y + height);
    ctx.lineTo(x + radius.bl, y + height);
    ctx.quadraticCurveTo(x, y + height, x, y + height - radius.bl);
    ctx.lineTo(x, y + radius.tl);
    ctx.quadraticCurveTo(x, y, x + radius.tl, y);
    ctx.closePath();
    if (fill) {
        ctx.fill();
    }
    if (stroke) {
        ctx.stroke();
    }
}

/* TODO: eventually not need this! */
function comingSoon(text) {
    currentChar = charArray.length * 2;
    currentString = '';
    waitTime = 0;
    message = text + " Coming Soon!";
}



