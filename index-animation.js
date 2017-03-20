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

/* draw each frame of animation */
function draw() {
    var now = new Date().getTime();
    dt = (now - (time || now)) / 1000;
    time = now;
    context.clearRect(0, 0, canvas.width, canvas.height); /* clears previous frame */
    resizeCanvas();
    animatedTyping("Hello World", dt);
    drawKeyboard();
    requestAnimationFrame(draw);
}

var fontRatio = 0.08; /* default ratio */

function setFont(ratio) {
    var size = canvas.width * ratio;
    context.font = (size|0) + 'px Courier New'; // set font
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
                currentChar = -1; /* for the ++ at end of function */
                waitTime = 2;
            } else {
                backwardsTyping();
            }
        } else
        if (currentChar == charArray.length) {
            waitTime = 1;
        }
        currentChar++;
    }

    waitTime -= dt;
    context.fillText(currentString, canvas.width / 2, canvas.height / 4);
}

function forwardsTyping() {
    waitTime = Math.random() * (0.2 - 0.15) + 0.15;
    currentString += charArray[currentChar];
    if (!charArray[currentChar]) {
        console.log(currentChar);
    }
}

function backwardsTyping() {
    waitTime = Math.random() * (0.15 - 0.05) + 0.05;
    currentString = currentString.slice(0, -1);
}

