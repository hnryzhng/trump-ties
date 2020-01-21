// server.js

// load built-in modules
var http = require('http');
var express = require('express');
var path = require('path');
var bodyParser = require('body-parser');	// for parsing body of POST request
var fs = require('fs');

// initialize app object
var app = express();

// parses body for post request processing
app.use(bodyParser.urlencoded({ extended: false }));	// parse application/x-www-form-urlencoded
app.use(bodyParser.json());	// parse application/json

var dir = path.join(__dirname, 'client');
app.use(express.static(dir));


// ROUTES

// route to home page
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname, "/client/index.html"));
});

app.get('/:relpath', (req, res) => {
	const relpath = req.params.relpath;
	res.sendFile(path.join(__dirname, "/client", relpath));
});

// initialize server instance
var portNum = process.env.PORT || 3001;
app.listen(portNum, () => { console.log('App listening on port', portNum) });