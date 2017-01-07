let express         = require('express');
let xml2js          = require('xml2js');
let app             = express();
let path            = require('path');
let server          = require('http').createServer(app);
let io              = require('socket.io')(server);
let APICommunicator = require('./server/APICommunicator');
let PartyScrobbler  = require('./server/PartyScrobbler');
let url             = require('url');

app.use(express.static(path.join(__dirname, './public')));

/**
 * Methods related to dealing with requests from the client.
 * Requests from the client comes in two forms: 1. Regular http-requests (urls) 2. Data from a socket connection between the client and the server.
 **/

let clients = [];
let address = '';
let partyScrobbler;
let apiCommunicator;


//Shamelessly stolen from: http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
require('dns').lookup(require('os').hostname(), (err, ip) =>{
    initiateServer(3000, ip);
});

function initiateServer(port, ip){

    server.listen(port, ip, () =>{
        console.log('Server listening on:' + ip + ':' + port);
    });

    address         = 'http://' + ip + ':' + port;
    apiCommunicator = new APICommunicator();
    partyScrobbler  = new PartyScrobbler(newTrackNotification);
    checkRecentTrack(); //Iterates over all connected "hosts" and checks for their recent tracks.
}

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
    let queryData = url.parse(req.url, true).query;
    res.redirect('https://www.last.fm/api/auth/?api_key=a05b8d216b62ceec197a37a8b9f11f20&cb=' + address + '?username=' + queryData.username + "%26host=" + queryData.host);
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
        if(!apiCommunicator.tokens[data.user]){
            apiCommunicator.tokens[data.user] = data.token;
            apiCommunicator.sendRequest(callback.bind(apiCommunicator, apiCommunicator.addItem), 'getSession', data.user);
            partyScrobbler.addListener(data.user, data.host, socket.id);
        }else{
            partyScrobbler.hosts[data.host].socketid = socket.id;
        }
    });

    socket.on('host', (hostname) =>{
        partyScrobbler.addHost(hostname, socket.id);
        socket.emit('host', 'success');
    });

    socket.on('user', (data) =>{
        partyScrobbler.addListener(data.username, data.hostname, socket.id);
    });

    socket.on('disconnect', () =>{
        delete clients[socket.id];
    });

    socket.on('party', (hostname) => {
        socket.emit('party', partyScrobbler.hosts[hostname].listeners.map( (listener) => listener.username));
    });
});

/**
 * CALLBACKS EXPECTS ARGUMENTS IN THE FORM OF:
 * DATA,
 * FUNCTION TO CALL WITH PREVIOUSLY MENTIONED DATA,
 * RESPONSE OBJECT FROM A REQUEST
 */
const callback = function(){
    let body = '';

    //Convert arguments to an actual array.
    let args = [...arguments];

    //The last argument is always the "response" object from any request (currently Http).
    let response = args.pop();

    //The last argument after that is the function that actually wants the data.
    let passData = args.pop();

    //The data from our requests might be returned in chunks. We add these together.
    response.on('data', (chunk) =>{
        body += chunk;
    });

    //In the end we pass the received data and any additional parameters to the function.
    response.on('end', () =>{
        passData.apply(this, [body, ...args]);
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
const newTrackNotification = function(track){
    scrobbleAllClients(track);
};

const checkRecentTrack = function(){

    let sendRecentTrack = setInterval(() =>{

        Object.keys(partyScrobbler.hosts).forEach((hostname) =>{
            let recentTrackCallback = callback.bind(partyScrobbler, hostname, partyScrobbler.addItem);
            apiCommunicator.sendRequest(recentTrackCallback, 'getRecentTracks', null, null, hostname);
            sendTrackInfoToClients(hostname);
        });

    }, 15000);


};

const sendTrackInfoToClients = function(hostName){

    let host = partyScrobbler.hosts[hostName];
    let hostnames = host.listeners.map((listener) => listener.username);

    //Notify all clients, including the host, about most recent track.
    host.listeners.concat(host).forEach( (listener) => {
        clients[listener.socketid].emit('recenttrack', {
            track: host.lastscrobbledtrack,
            party: hostnames
        });
    })
};

const iterateOverClients = function(clientId, identifier, value){
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