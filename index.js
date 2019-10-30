const express = require('express'); // For simple node server
const Datastore = require('nedb'); // For simple database use

const app = express();
const database = new Datastore('database.db');

app.listen(3000, () => console.log('Server running on port 3000'));
app.use(express.static('public'));
app.use(express.json());

database.loadDatabase();

// Get request for '/api'
// Needs to find everything in the databse and return it to the client
app.get('/api', (request, response) => {
    database.find({}, (err, data) => {
        response.json(data);
    });
});

// Post request for '/api'
// Needs to get the data from the request and save it to the database
app.post('/api', (request, response) => {
    const data = request.body;
    if (data.message == "") {
        data.message = "No message."
    }
    database.insert(data);
	console.log("X: " + data.x + ", Y: " + data.y + " says " + data.message);
    response.end();
});