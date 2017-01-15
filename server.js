let express         = require('express');
let xml2js          = require('xml2js');
let app             = express();
let path            = require('path');
let server          = require('http').createServer(app);
let io              = require('socket.io')(server);
let APICommunicator = require('./server/APICommunicator');
let PartyScrobbler  = require('./server/PartyScrobbler');
let url             = require('url');
let callbacks       = require('./server/Callback');

app.use(express.static(path.join(__dirname, './public')));

/**
 * Methods related to dealing with requests from the client.
 * Requests from the client comes in two forms:
 * 1. Regular http-requests (urls).
 * 2. Data from a socket connection between the client and the server.
 **/

let clients  = []
let local    = 'http://localhost:5000';
let official = "https://partyscrobbler.herokuapp.com/";
let address  = official;
let partyScrobbler;
let apiCommunicator;
let PORT     = process.env.PORT || 5000;


//Shamelessly stolen from: http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
require('dns').lookup(require('os').hostname(), (err, ip) =>{
    initiateServer();
});

function initiateServer(){
    server.listen(PORT, () =>{
        console.log('Server listening on:', address);
    });

    apiCommunicator = new APICommunicator();
    partyScrobbler  = new PartyScrobbler(apiCommunicator);
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
    socket.on('user', (data) =>{
        apiCommunicator.addToken(data.user, data.token);
        let callback = callbacks.callback.bind(apiCommunicator, apiCommunicator.addItem);
        apiCommunicator.sendRequest(callback, 'getSession', data.user);
        partyScrobbler.addListener(data.user, data.host, socket.id);
    });

    socket.on('host', (hostname) =>{
        partyScrobbler.addHost(hostname, socket.id);
        socket.emit('host', 'success');
    });

    socket.on('disconnect', () =>{
        delete clients[socket.id];
        partyScrobbler.removeUser(socket.id);
    });

    socket.on('party', (hostname) =>{
        socket.emit('party', partyScrobbler.hosts[hostname].listeners.map((listener) => listener.username));
    });
});

const checkRecentTrack = function(){

    let sendRecentTrack = setInterval(() =>{

        Object.keys(partyScrobbler.hosts).forEach((hostname) =>{
            let callbackz = callbacks.callback;
            let recentTrackCallback = callbackz.bind(partyScrobbler, hostname, partyScrobbler.addItem);
            apiCommunicator.sendRequest(recentTrackCallback, 'getRecentTracks', null, null, hostname);
            sendTrackInfoToClients(hostname);
        });

    }, 15000);


};

const sendTrackInfoToClients = function(hostName){

    let host      = partyScrobbler.hosts[hostName];
    let hostnames = host.listeners.map((listener) => listener.username);

    //Notify all clients, including the host, about most recent track.
    host.listeners.concat(host).forEach((listener) =>{

        if(host.tracks[0]){
            clients[listener.socketid].emit('recenttrack', {
                track: host.tracks[0],
                party: hostnames
            });
        }
    })
};