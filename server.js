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

/**
 * Initiates the server.
 */
server.listen(3000, function () {
    console.log('Server listening on port 3000!');
    XMLParser = new xml2js.Parser();
    PartyScrobbler.setCallback(newTrackNotification);
    checkRecentTrack();
});

/**
 * Client requesting the start-page.
 */
app.get('/', function (req, res) {
    //APICommunicator.sendRequest(getRecentTrackCb, 'getRecentTracks');
    res.sendFile(__dirname + '/index.html');
});

/**
 * Client requesting authentication.
 */
app.get('/authenticate', (req, res) => {
    res.redirect('https://www.last.fm/api/auth/?api_key=a05b8d216b62ceec197a37a8b9f11f20&cb=http://192.168.0.190:3000');
})

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
        APICommunicator.sendRequest(callback, 'getSession', data.user)
    });

    socket.on('scrobbleTrack', (data) => {
        scrobbleAllClients();
    });

    socket.on('disconnect',  (socket) => {
        delete clients[socket.id];
    });
});



/**
 * Callback used for HTTP-requests.
 */
const callback = (response) => {
    let body = '';

    response.on('data', (chunk) => {
        body += chunk;
    });

    response.on('end', () => {
        XMLParser.parseString(body, (err, result) => {
            APICommunicator.sessionTokens[result.lfm.session[0].name] = result.lfm.session[0].key[0];
            iterateOverClients('party', Object.keys(APICommunicator.sessionTokens));
        });
    });
};

const getRecentTrackCb = (response) => {
    let body = '';

    response.on('data', (chunk) => {
        body += chunk;
    });

    response.on('end', () => {
        lastfmdata = JSON.parse(body);
        PartyScrobbler.addTrack(JSON.parse(body));
        console.log('Last fm data fetched', body);
    });
};

const scrobbleTrackCb = (response) => {
    let body = '';
    response.on('data', (chunk) => {
        body += chunk;
    });

    response.on('end', () => {;
        console.log('SCROBBLED TRACK', body);
    });
};


const newTrackNotification = function() {
    iterateOverClients('recenttrack', this.lastScrobbledTrack);
    scrobbleAllClients(this.lastScrobbledTrack);
};

const checkRecentTrack = function() {

    var sendRecentTrack = setInterval( () => {
        APICommunicator.sendRequest(getRecentTrackCb, 'getRecentTracks');
    }, 15000);
};


const iterateOverClients = (name, value) => {
    let keys = Object.keys(clients);

    keys.forEach( (key) => {
        clients[key].emit(name, value);
    })
};

/**
 * Keep
 */
const scrobbleAllClients = (track) => {

    if(PartyScrobbler.compareTrack(lastfmdata)){
        Object.keys(APICommunicator.sessionTokens).forEach( (username) => {
            APICommunicator.sendRequest(scrobbleTrackCb, 'scrobbleTrack', username, track);
        })
    }
};









