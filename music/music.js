/* TODO */
// Have each ball have a set of potential notes, initialized from start
// to stop the crackling (BUT THEN NOT DYNAMICALLy ALLOCATED?!??!?)
// weigh those pros and cons later


/* create and initialize a new ball  */
function newBall (xStart, yStart, dxStart, dyStart, rStart, colorStart, wave)
{
    var ball = 
    {
        x: xStart,
        y: yStart,
        dx: dxStart,
        dy: dyStart,
        r: rStart,
        color: colorStart,
        keyPress: -1,
        freq: null,
        wave: wave,
        volume: rStart / 5,
    };
    
    return ball;
}

let activeNotes = [];

var masterGain;

function addActiveNote(i, ball)
{   
    console.log(activeNotes[currentScale][i].length);
    areNotesPlaying = true;
    if (activeNotes[currentScale][i][ball.keyPress] == null) {
        console.log("Adding pair");
        activeNotes[currentScale][i][ball.keyPress] = (OscGainPair(ball));
    } else {
        activeNotes[currentScale][i][ball.keyPress].pressed = true;
        activeNotes[currentScale][i][ball.keyPress].gainNode.gain.value = ball.volume;
    }
    
    function OscGainPair(ball) 
    {
        var gainNode = audioContext.createGain();
        gainNode.gain.value = ball.volume;
        gainNode.connect(masterGain);
        var osc = audioContext.createOscillator();
        osc.connect(gainNode);
        osc.type = ball.wave;
        osc.frequency.value = ball.freq;
        osc.start();
        return {
            osc: osc,
            gainNode: gainNode,
            pressed: true
        }
    }
}

var areNotesPlaying = false;

function dampenActiveNotes()
{
    for (var s = 0; s < scales.length; s ++) {
    for (var i = 0; i < balls.length; i++) {
            for (var j = 0; j < activeNotes[s][i].length; j++) {
                if (activeNotes[s][i][j] != null) {
                    activeNotes[s][i][j].gainNode.gain.value -= 0.1;
                    if (activeNotes[s][i][j].gainNode.gain.value <= 0) {
                        activeNotes[s][i][j].gainNode.gain.value = 0;
                    }
                }
            }
        }
    }
}


var canvas = document.getElementById("myCanvas");
var context = canvas.getContext("2d");
var containerR;
var rotationSpeed = 0;


function resizeBoundry()
{
    var innerWidth = window.innerWidth * 0.9;
    var innerHeight = window.innerHeight * 0.9;
    containerR = innerWidth > innerHeight ? innerHeight / 2 : innerWidth / 2;
    canvas.width  = containerR * 2;
    canvas.height = containerR * 2; 
    canvas.style["border-radius"] = containerR + "px";

}

/* call before declaring balls so they center */
resizeBoundry();

var balls =
[
    
    newBall(canvas.width / 3, canvas.height / 7, -4, 4, 20, "red", "sine"),
    newBall(canvas.width / 3, canvas.height / 7, 4, -4, 20, "green", "sine"),

    newBall(canvas.width / 3, canvas.height / 5, 2, -15, 10, "purple", "sine"),
    newBall(canvas.width / 3, canvas.height / 5, -2, 15, 10, "orange", "sine"),
    newBall(canvas.width / 2, canvas.height / 5, -3, 8, 30, "teal", "sine"), 
    

];

var playing = true;

function draw() 
{
    resizeBoundry();
    context.clearRect(0, 0, canvas.width, canvas.height);
    drawPiano();

    for (var i = 0; i < balls.length; i++) {
        var currentBall = balls[i];
        context.beginPath();
        context.arc(currentBall.x, currentBall.y, currentBall.r, 0, Math.PI * 2);
        context.fillStyle = currentBall.color;
        context.fill();
        context.closePath();
        
        currentBall.x    += currentBall.dx;
        currentBall.y    += currentBall.dy;
        
        var distanceFromCenterX = currentBall.x - containerR;
        var distanceFromCenterY = currentBall.y - containerR;

        
        if (Math.sqrt( (distanceFromCenterX * distanceFromCenterX)           
                     + (distanceFromCenterY * distanceFromCenterY) ) 
                    >= (containerR - currentBall.r) ) {

            var v = Math.sqrt(currentBall.dx * currentBall.dx + currentBall.dy 
                            * currentBall.dy);
            
            var angleToCollisionPoint = Math.atan2(-distanceFromCenterY,                         distanceFromCenterX);
            
            var oldAngle = Math.atan2(-currentBall.dy, currentBall.dx);

            var newAngle = 2 * angleToCollisionPoint - oldAngle;
 
            currentBall.dx = -v * Math.cos(newAngle);
            currentBall.dy = v * Math.sin(newAngle);
            
            addActiveNote(i, playNote(currentBall));

        }
        
       
    }
    if (areNotesPlaying) {
        dampenActiveNotes();
    }
    frame++;
    if (playing) {
        requestAnimationFrame(draw);
    }
}


var segmentDepth = 20;

// default number of notes
var notes = 1;

// divide degrees by notes
var segmentWidth = 360 / notes;

var pressedKey  = -1;
var startAngle = 0;
var frame = 0;

function drawPiano() {
    endAngle = segmentWidth;
    for(var i = 0; i < notes; i++){         
      context.beginPath();
      context.arc(containerR, containerR, containerR, (startAngle + segmentWidth * i * Math.PI / 180), ( startAngle + segmentWidth * (i + 1) * Math.PI / 180), false);
      context.lineWidth = segmentDepth;

      if (i % 2 == 0) {
      context.strokeStyle = 'white';
      } else {
          context.strokeStyle = 'black';
      }
    
        for (var j = 0; j < balls.length; j++) {
            if(balls[j].keyPress == i) {
                          context.lineWidth = segmentDepth * 2;
          context.strokeStyle = balls[j].color;
            }
        }
      context.stroke();
    }
        startAngle += 0.001 * rotationSpeed;
        startAngle = startAngle % 360;
}

function playNote(ball)
{
    var angle = Math.atan2( (containerR - ball.y) , (ball.x - containerR));
    var degree_angle = (angle + startAngle) * 180 / Math.PI ;
    /* add conditional check for weather to add up or down */    
    if (degree_angle < 0) {
        degree_angle += 360;
    }
    
    /* do first or else will skip the first negative degree */
    var remainder = degree_angle % 360 / notes;
    var rounded_degree_angle = degree_angle - degree_angle % (360/notes);
    
    /* can be greater than due to rotation */
    rounded_degree_angle = rounded_degree_angle % 360
    
    ball.keyPress = (notes - 1 - (rounded_degree_angle / 360) * notes);
    
    ball.freq = key[ball.keyPress];
    adjustOctave(ball);
    return ball;
}

draw();

let audioContext = new (window.AudioContext || window.webkitAudioContext);
let noteFreq = null;

function createNoteTable() {
  noteFreq = [];
  for (let i=0; i< 9; i++) {
    noteFreq[i] = [];
  }

  noteFreq[0][10] = 27.500000000000000;
  noteFreq[0][11] = 29.135235094880619;
  noteFreq[0][12] = 30.867706328507756;

  noteFreq[1][1] = 32.703195662574829;
  noteFreq[1][2] = 34.647828872109012;
  noteFreq[1][3] = 36.708095989675945;
  noteFreq[1][4] = 38.890872965260113;
  noteFreq[1][5] = 41.203444614108741;
  noteFreq[1][6] = 43.653528929125485;
  noteFreq[1][7] = 46.249302838954299;
  noteFreq[1][8] = 48.999429497718661;
  noteFreq[1][9] = 51.913087197493142;
  noteFreq[1][10] = 55.000000000000000;
  noteFreq[1][11] = 58.270470189761239;
  noteFreq[1][12] = 61.735412657015513;
  
  noteFreq[2][1] = 65.406391325149658;
  noteFreq[2][2] = 69.295657744218024;
  noteFreq[2][3] = 73.416191979351890;
  noteFreq[2][4] = 77.781745930520227;
  noteFreq[2][5] = 82.406889228217482;
  noteFreq[2][6] = 87.307057858250971;
  noteFreq[2][7] = 92.498605677908599;
  noteFreq[2][8] = 97.998858995437323;
  noteFreq[2][9] = 103.826174394986284;
  noteFreq[2][10] = 110.000000000000000;
  noteFreq[2][11] = 116.540940379522479;
  noteFreq[2][12] = 123.470825314031027;

  noteFreq[3][1] = 130.812782650299317;
  noteFreq[3][2] = 138.591315488436048;
  noteFreq[3][3] = 146.832383958703780;
  noteFreq[3][4] = 155.563491861040455;
  noteFreq[3][5] = 164.813778456434964;
  noteFreq[3][6] = 174.614115716501942;
  noteFreq[3][7] = 184.997211355817199;
  noteFreq[3][8] = 195.997717990874647;
  noteFreq[3][9] = 207.652348789972569;
  noteFreq[3][10] = 220.000000000000000;
  noteFreq[3][11] = 233.081880759044958;
  noteFreq[3][12] = 246.941650628062055;

  noteFreq[4][1] = 261.625565300598634;
  noteFreq[4][2] = 277.182630976872096;
  noteFreq[4][3] = 293.664767917407560;
  noteFreq[4][4] = 311.126983722080910;
  noteFreq[4][5] = 329.627556912869929;
  noteFreq[4][6] = 349.228231433003884;
  noteFreq[4][7] = 369.994422711634398;
  noteFreq[4][8] = 391.995435981749294;
  noteFreq[4][9] = 415.304697579945138;
  noteFreq[4][10] = 440.000000000000000;
  noteFreq[4][11] = 466.163761518089916;
  noteFreq[4][12] = 493.883301256124111;

  noteFreq[5][1] = 523.251130601197269;
  noteFreq[5][2] = 554.365261953744192;
  noteFreq[5][3] = 587.329535834815120;
  noteFreq[5][4] = 622.253967444161821;
  noteFreq[5][5] = 659.255113825739859;
  noteFreq[5][6] = 698.456462866007768;
  noteFreq[5][7] = 739.988845423268797;
  noteFreq[5][8] = 783.990871963498588;
  noteFreq[5][9] = 830.609395159890277;
  noteFreq[5][10] = 880.000000000000000;
  noteFreq[5][11] = 932.327523036179832;
  noteFreq[5][12] = 987.766602512248223;

  noteFreq[6][1] = 1046.502261202394538;
  noteFreq[6][2] = 1108.730523907488384;
  noteFreq[6][3] = 1174.659071669630241;
  noteFreq[6][4] = 1244.507934888323642;
  noteFreq[6][5] = 1318.510227651479718;
  noteFreq[6][6] = 1396.912925732015537;
  noteFreq[6][7] = 1479.977690846537595;
  noteFreq[6][8] = 1567.981743926997176;
  noteFreq[6][9] = 1661.218790319780554;
  noteFreq[6][10] = 1760.000000000000000;
  noteFreq[6][11] = 1864.655046072359665;
  noteFreq[6][12] = 1975.533205024496447;
  
  noteFreq[7][1] = 2093.004522404789077;
  noteFreq[7][2] = 2217.461047814976769;
  noteFreq[7][3] = 2349.318143339260482;
  noteFreq[7][4] = 2489.015869776647285;
  noteFreq[7][5] = 2637.020455302959437;
  noteFreq[7][6] = 2793.825851464031075;
  noteFreq[7][7] = 2959.955381693075191;
  noteFreq[7][8] = 3135.963487853994352;
  noteFreq[7][9] = 3322.437580639561108;
  noteFreq[7][10] = 3520.000000000000000;
  noteFreq[7][11] = 3729.310092144719331;
  noteFreq[7][12] = 3951.066410048992894;

  noteFreq[8][1] = 4186.009044809578154;
  return noteFreq;
}



var CMajor;
var CMajor7Chord;
var GMajor;
var GMajor7Chord;
var DMinor7Chord;
var AMinor7Chord;
var scales = [];

var key;
var currentScale = 1;

function setUpMusic()
{
    console.log("Setting up music!");
    
    noteFreq = createNoteTable();
    
    CMajor = majorKey(5, 1);
    CMajor7Chord = Major7Scale(4,1);
    GMajor = majorKey(4, 8)
    GMajor7Chord = Major7Scale(4, 8);
    DMinor7Chord = Minor7Scale(4, 3);
    AMinor7Chord = Minor7Scale(4, 10);
    scales.push(CMajor7Chord, DMinor7Chord, AMinor7Chord, GMajor7Chord);
    
    /* initialize */
    key = DMinor7Chord;
    keySignature = document.getElementById("keySignature");
    keySignature.innerHTML = "<p>d minor7</p>"
   
    for (var j = 0; j < scales.length; j++) {
        activeNotes[j] = [];
        for (var i = 0; i< balls.length; i++) {
            activeNotes[j][i] = [];
        }
    }
    
    masterGain = audioContext.createGain();
    masterGain.connect(audioContext.destination);
}

function button_CM7()
{
    keySignature = document.getElementById("keySignature");
    keySignature.innerHTML = "<p>C Major7</p>";
    key = CMajor7Chord;
    currentScale = 0;
}

function button_GM7()
{
    keySignature = document.getElementById("keySignature");
    keySignature.innerHTML = "<p>G Major7</p>";
    key = GMajor7Chord;
    currentScale = 3;
}

function button_dm7()
{
    keySignature = document.getElementById("keySignature");
    keySignature.innerHTML = "<p>d minor7</p>";
    key = DMinor7Chord;
    currentScale = 1;
}

function button_am7()
{
    keySignature = document.getElementById("keySignature");
    keySignature.innerHTML = "<p>d minor7</p>";
    key = AMinor7Chord;
    currentScale = 2;
}

function button_BbBlues()
{
    keySignature = document.getElementById("keySignature");
    keySignature.innerHTML = "<p>d Bb Blues</p>";
    key = BbBluesChord;
}

/* check */
function majorKey(octave, note)
{
    var scale = new Array();
    for (var k = 0; k < 8; k++) {
        scale.push(noteFreq[octave][note]);
        
        if (k == 3 || k == 7) {
            note += 2; /* whole step */
        } else {
            note++; /* half step */
        }
        
        if (note > 12) {
            octave++;
            note = note % 12;
        }
    }
    while (scale.length < notes) {
        for (var k = 0; k < 8; k++) {
            scale.push(scale[k]);
        }
    }
    return scale;
}

function Major7Scale(octave, note)
{
    var scale = new Array();
    for (var k = 0; k < 4; k++) {
            scale.push(noteFreq[octave][note]);
            if (k == 1) {
                note += 3;
            } else {
                note += 4;
            }
            
            if (note > 12) {
            octave++;
            note = note % 12;
        }
    }
    while (scale.length < notes) {
        for (var k = 0; k < 4; k++) {
        scale.push(scale[k] * 2);
        }
    }
    return scale;
}

function Minor7Scale(octave, note)
{
    var scale = new Array();
    for (var k = 0; k < 4; k++) {
            scale.push(noteFreq[octave][note]);
            if (k == 1 ) {
                note += 4;
            } else {
                note += 3;
            }
            
            if (note > 12) {
            octave++;
            note = note % 12;
        }
    }
    while (scale.length < notes) {
        for (var k = 0; k < 4; k++) {
        scale.push(scale[k] * 2);
        }
    }
    return scale;
}

function addScaleDegrees(scale)
{
    while (scale.length < notes) {
        for (var k = 0; k < 4; k++) {
        scale.push(scale[k] * 2);
        }
    }
    return scale;
}

function updateScales()
{
    for (var i = 0; i < scales.length; i++) {
        addScaleDegrees(scales[i]);
    }
}

function adjustOctave(ball)
{
    if (ball.r > 10) {
        ball.freq = ball.freq / 2;
    }
    if (ball.r > 20) {
        ball.freq = ball.freq / 2;
    }
}


function rotationSpeedSlider(speed)
{
    rotationSpeed = speed;
}

function randomizeBalls()
{
    var range = containerR * 0.8
    for (var i = 0; i < balls.length; i ++) {
        do {
            balls[i].x = (containerR) + Math.random() * (range) - 
                    Math.random() * range;
            balls[i].y = (containerR) + Math.random() * (range) - 
                    Math.random() * range;
            console.log(balls[i].x);
            balls[i].dx = (Math.random() * containerR/5) - containerR/10;
            balls[i].dy = (Math.random() * containerR/5) - containerR/10
        } while ((Math.pow(balls[i].x, 2) + Math.pow(balls[i].y, 2)) <          
                    (containerR - 15));
    }
}


function numNotesSlider(power)
{
    notes = Math.pow(2, power);
    segmentWidth = 360 / notes;
    updateScales();
}

function pause()
{
    playing = !playing;
    if(playing == true) {
        masterGain.gain.value = 1;
        draw();
    } else {
        masterGain.gain.value = 0;
    }
}


function setup()
{
    setUpMusic();
    setupMouse();
}

function setupMouse()
{
    canvas.addEventListener("mousedown", doMouseDown, false);
    canvas.addEventListener("mousemove", doMouseMove, false);
}

function doMouseDown(event) {
    for (var i = 0; i < balls.length; i++) {
        
    }
}

function doMouseMove(event) {
    mouseX = event.pageX;
    mouseY = event.pageY;

}