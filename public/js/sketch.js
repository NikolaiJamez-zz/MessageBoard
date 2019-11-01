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
let synth;
let sound;

function setup() {
    canvas = createCanvas(windowWidth - 45, windowHeight - 45);
    canvas.parent('page-content-wrapper');
    getData();
    textAlign(CENTER, CENTER);
    rectMode(CENTER);
    noStroke();
    count = 0;
    synth = new WebAudioTinySynth();
    synth.setVoices(1);
    synth.setReverbLev(0);
    for (var i = 0; i < 128; ++i) {
        var o = document.createElement("option");
        o.innerHTML = synth.getTimbreName(0, i);
        o.value = i;
        document.getElementById("input-instrument").appendChild(o);
    }
}

function windowResized() {
    resizeCanvas(windowWidth, windowHeight);
}

function draw() {
    background(0);
    colour = document.getElementById('input-color').value;
    message = document.getElementById('input-text').value;
    shape = document.getElementById('input-shape').value;
    sound = document.getElementById('input-instrument').value;
    //Automatic data refresh every 100 ticks
    //This allows for dynamic refreshing without refreshing the page
    if (count >= 100) {
        getData();
        count = 0;
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
    count++;
}

function drawMessages() {
    for (let m of messages) {
        fill(m.colour);
        if (mouseY < m.y + messageWidth && mouseY > m.y - messageWidth && mouseX < m.x + messageWidth && mouseX > m.x - messageWidth) {
            //Draws shape of message to screen
            drawShape(m.x, m.y, m.shape, 2);
            fill(255);
            if (!m.playing) {
                synth.send([0xc0, m.sound]);
                synth.send([0x90, m.sound, 100]);
                m.playing = true;
            }
            //Draws text message to screen
            rect(m.x, m.y - 2 * messageWidth, textWidth(m.message) + 6, 20);
            fill(0);
            text(m.message, m.x, m.y - 2 * messageWidth);
        } else {
            drawShape(m.x, m.y, m.shape);
            m.playing = false;
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
    data = {
        colour,
        message,
        x,
        y,
        shape,
        sound
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

function Prog(pg) {
    synth.send([0xc0, pg]);
    synth.send([0x90, pg, 100]);
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