let express         = require('express');
let xml2js          = require('xml2js');
let app             = express();
let path            = require('path');
let server          = require('http').createServer(app);
let io              = require('socket.io')(server);
let APICommunicator = require('./server/APICommunicator');
let PartyScrobbler  = require('./server/PartyScrobbler');

app.use(express.static(path.join(__dirname, './public')));

/**
 * Methods related to dealing with requests from the client.
 * Requests from the client comes in two forms: 1. Regular http-requests (urls) 2. Data from a socket connection between the client and the server.
 **/


let clients = [];
const PORT  = 3000;
let partyScrobbler;
let apiCommunicator;

/**
 * Initiates the server.
 */
server.listen(PORT, () =>{
    console.log('Server listening on port 3000!');
    apiCommunicator = new APICommunicator(process.argv[2]);
    partyScrobbler = new PartyScrobbler();
    partyScrobbler.setCallback(newTrackNotification);
    checkRecentTrack();
});

/**
 * Client requesting the start-page.
 */
app.get('/', (req, res) =>{
    res.sendFile(__dirname + '/index.html');
});

/**
 * Client requesting authentication.
 */
app.get('/authenticate', (req, res) =>{
    res.redirect('https://www.last.fm/api/auth/?api_key=a05b8d216b62ceec197a37a8b9f11f20&cb=http://192.168.0.190:3000');
});

/**
 * Server listening on a socket.
 * Currently only used to pass last.fm data to the client.
 */
io.on('connection', (socket) =>{

    clients[socket.id] = socket;

    socket.on('recenttrack', (data) =>{
        socket.emit('recenttrack', partyScrobbler.lastScrobbledTrack);
    });

    // data = {username, token}
    socket.on('token', (data) =>{
        apiCommunicator.tokens[data.user] = data.token;
        apiCommunicator.sendRequest(callback.bind(apiCommunicator), 'getSession', data.user);
    });

    socket.on('scrobbleTrack', (data) =>{
        scrobbleAllClients();
    });

    socket.on('disconnect', (socket) =>{
        delete clients[socket.id];
    });
});

/**
 * Bind variable in callback with function.bind(this)
 * and assign it when done.
 * Makes for a more losely coupled function call. Implement this.addTrack in
 * any module who uses the callback. Might switch name on that one huh.
 * Modules currently using:
 * APICommunicator
 * PartyScrobbler
 * @param Answer from some kind of request (HTTP-Requests to last.fm).
 */
const callback = function(response){
    let body = '';

    response.on('data', (chunk) =>{
        body += chunk;
    });

    response.on('end', () =>{
        this.addItem(body);
        console.log('CALLBACK BOUND TO:', this);
        console.log('Containing data: ', body);
    });
};


const scrobbleTrackCb = function(response){
    let body = '';
    response.on('data', (chunk) =>{
        body += chunk;
    });

    response.on('end', () =>{
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

const checkRecentTrack = function(){

    var sendRecentTrack = setInterval(() =>{
        apiCommunicator.sendRequest(callback.bind(partyScrobbler), 'getRecentTracks');
    }, 15000);
};

const iterateOverClients = function(name, value){
    let keys = Object.keys(clients);

    keys.forEach((key) =>{
        clients[key].emit(name, value);
    });
};

/**
 * Iterate over the clients and initiate one scrobble POST request for each.
 */
const scrobbleAllClients = function(track){
    Object.keys(apiCommunicator.sessionTokens).forEach((username) =>{
        apiCommunicator.sendRequest(scrobbleTrackCb, 'scrobbleTrack', username, track);
    });
};









