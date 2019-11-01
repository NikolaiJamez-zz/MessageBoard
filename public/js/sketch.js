const messageWidth = 10;
const padding = 15;
const amp = 1;

let x;
let y;
let clicked;
let colour;
let message;
let data;
let options;
let records;
let messages;
let count;
let shape;
let canvas;
let active;
let freq;
let wave;
let playing;
let playFreq;

function setup() {
    canvas = createCanvas(windowWidth - 45, windowHeight - 45);
    canvas.parent('page-content-wrapper');
    getData();
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    noStroke();
    count = 0;
    wave = new p5.TriOsc();
    wave.amp(1);
    wave.freq(0);
    wave.start();
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);
    active = document.activeElement.id;
    //Automatic data refresh every 100 ticks
    //This allows for dynamic refreshing without refreshing the page
    if (count >= 100) {
        getData();
        count = 0;
    }

    if (active == "input-freq") {
        wave.freq(Number(freq));
        playing = true;
    }

    if (messages) {
        drawMessages();
    }

    fill(colour);
    if (clicked) {
        drawShape(x, y, shape);
    } else {
        drawShape(mouseX, mouseY, shape);
    }

    if (playing) {
        wave.amp(1, 0.1);
    } else {
        wave.amp(0, 0.1);
    }
    playing = false;
    count++;
}

function drawMessages() {
    for (let m of messages) {
        fill(m.colour);
        if (mouseY < m.y + messageWidth && mouseY > m.y - messageWidth && mouseX < m.x + messageWidth && mouseX > m.x - messageWidth) {
            //Draws shape of message to screen
            drawShape(m.x, m.y, m.shape, 2);
            fill(255);
            wave.freq(Number(m.freq));
            playing = true;
            //Draws text message to screen
            rect(m.x, m.y - 2 * messageWidth, textWidth(m.message) + 6, 20);
            fill(0);
            text(m.message, m.x, m.y - 2 * messageWidth);
        } else {
            drawShape(m.x, m.y, m.shape);
        }
    }
}

//Draws a shape (s) at (x, y) with a factor that by deefault is 1
//E.g at 100, 100 draw "heart" with a factor of 2 
function drawShape(x, y, s, factor = 1) {
    switch (s) {
        case "square":
            rect(x, y, messageWidth * factor, messageWidth * factor);
            break;
        case "triangle":
            triangle(x - 7 * factor, y + 7 * factor, x, y - 7 * factor, x + 7 * factor, y + 7 * factor);
            break;
        case "heart":
            heart(x, y, messageWidth * factor);
            break;
        case "diamond":
            star(x, y, messageWidth * factor, messageWidth / 2 * factor, 2);
            break;
        case "5-star":
            star(x, y, messageWidth * factor, messageWidth / 2 * factor, 5);
        default:
            ellipse(x, y, messageWidth * factor, messageWidth * factor);
            break;
    }
}

//Retrieves data from server
async function getData() {
    const response = await fetch('/api');
    messages = await response.json();
}

//Saves data to server
function saveData() {
    colour = document.getElementById('input-color').value;
    message = document.getElementById('input-text').value;
    shape = document.getElementById('input-shape').value;
    freq = document.getElementById('input-freq').value;
    data = {
        colour,
        message,
        x,
        y,
        shape,
        freq
    };
    options = {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json'
        },
        body: JSON.stringify(data)
    };
    fetch('/api', options);
}

function checkBounds() {
    let inBound = true;

    if (mouseY < 0) {
        inBound = false;
    }
    if (mouseY > windowHeight) {
        inBound = false;
    }
    if (mouseX < 0) {
        inBound = false;
    }
    if (mouseX > windowWidth) {
        inBound = false;
    }
    if (mouseY > 0 && mouseY < 135 && mouseX > 0 && mouseX < 45) {
        inBound = false;
    }
    return inBound;
}

//Mouse click event
function mouseClicked() {
    if (checkBounds() && !clicked) {
        x = mouseX;
        y = mouseY;
        saveData();
        clicked = true;
    }
}