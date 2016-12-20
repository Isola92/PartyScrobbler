var express = require('express');
var xml2js = require('xml2js');
var app = express();
var path = require('path');
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var APICommunicator = require('./server/APICommunicator');
var PartyScrobbler = require('./server/PartyScrobbler');
//import APICommunicator from './server/APICommunicator'


app.use( express.static(path.join(__dirname, './public')));

/**
 * Methods related to dealing with requests from the client.
 * Requests from the client comes in two forms:
 * 1. Regular http-requests (urls)
 * 2. Data from a socket connection between the client and the server.
 */


let clients = [];
let lastfmdata = {};
let XMLParser;
let HOST = "";

/**
 * Initiates the server.
 */
server.listen(3000, () => {
    console.log('Server listening on port 3000!');
    XMLParser = new xml2js.Parser();
    PartyScrobbler.setCallback(newTrackNotification);

    if(process.argv[2] !== undefined){
        APICommunicator.host = process.argv[2];
        checkRecentTrack();
    }
});

/**
 * Client requesting the start-page.
 */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

/**
 * Client requesting authentication.
 */
app.get('/authenticate', (req, res) => {
    res.redirect('https://www.last.fm/api/auth/?api_key=a05b8d216b62ceec197a37a8b9f11f20&cb=http://192.168.0.190:3000');
});

/**
 * Server listening on a socket.
 * Currently only used to pass last.fm data to the client.
 */
io.on('connection', (socket) => {

    clients[socket.id] = socket;

    socket.on('recenttrack', (data) => {
        socket.emit('recenttrack', PartyScrobbler.lastScrobbledTrack);
    });

    // data = {username, token}
    socket.on('token', (data) => {
        APICommunicator.tokens[data.user] = data.token;
        APICommunicator.sendRequest(callback.bind(APICommunicator), 'getSession', data.user);
    });

    socket.on('scrobbleTrack', (data) => {
        scrobbleAllClients();
    });

    socket.on('disconnect',  (socket) => {
        delete clients[socket.id];
    });
});

/**
 * Bind variable in callback with function.bind(this)
 * and assign it when done.
 * Makes for a more losely coupled function call so this.addTrack instead
 * of specificclass.addTrack.
 * Make both the APICommunicator and Partyscrobbler contain a function
 * called addItem.
 * @param response
 */
const callback = function(response){
    let body = '';

    response.on('data', (chunk) => {
        body += chunk;
    });

    response.on('end', () => {
        this.addItem(body);
        console.log('CALLBACK BOUND TO:', this);
        console.log('Containing data: ', body);
    });
};


const scrobbleTrackCb = function(response) {
    let body = '';
    response.on('data', (chunk) => {
        body += chunk;
    });

    response.on('end', () => {
        console.log('SCROBBLED TRACK', body);
    });
};

/**
 * Callback from the PartyScrobbler when a new track is added.
 * Send the last track and scrobble it.
 */
const newTrackNotification = function(){
    iterateOverClients('recenttrack', this.lastScrobbledTrack);
    scrobbleAllClients(this.lastScrobbledTrack);
};

const checkRecentTrack = function() {

    var sendRecentTrack = setInterval( () => {
        APICommunicator.sendRequest(callback.bind(PartyScrobbler), 'getRecentTracks');
    }, 15000);
};


const iterateOverClients = function(name, value){
    let keys = Object.keys(clients);

    keys.forEach( (key) => {
        clients[key].emit(name, value);
    });
};

/**
 * Keep
 */
const scrobbleAllClients = function(track){

    if(PartyScrobbler.compareTrack(lastfmdata)){
        Object.keys(APICommunicator.sessionTokens).forEach( (username) => {
            APICommunicator.sendRequest(scrobbleTrackCb, 'scrobbleTrack', username, track);
        });
    }
};









