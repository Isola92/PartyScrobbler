/* declare to avoid typescript warnings. */
//declare function require(name:string);
//declare const __dirname;
//declare const process;
// External
var express = require('express');
var app = express();
var server = require('http').createServer(app);
var io = require('socket.io')(server);
var xml2js = require('xml2js');
var path = require('path');
var url = require('url');
// Internal
var APICommunicator = require('./server/APICommunicator');
var PartyScrobbler = require('./server/PartyScrobbler');
var callbacks = require('./server/Callback');
// Routes
var AUTHENTICATE = "/authenticate";
var HOME = "/";
// Socket 
var RECENTTRACK = "recenttrack";
var USER = "user";
var HOST = "host";
var DISCONNECT = "disconnect";
var PARTY = "party";
app.use(express.static(path.join(__dirname, './public')));
/**
 * Methods related to dealing with requests from the client.
 * Requests from the client comes in two forms:
 * 1. Regular http-requests (urls).
 * 2. Data from a socket connection between the client and the server.
 */
var Server = (function () {
    function Server() {
        var _this = this;
        this.clients = [];
        this.local = 'http://localhost:5000';
        this.official = "https://partyscrobbler.herokuapp.com/";
        this.adress = this.local;
        this.PORT = process.env.PORT || 5000;
        this.apiCommunicator = new APICommunicator();
        this.partyScrobbler = new PartyScrobbler(this.apiCommunicator);
        //Shamelessly stolen from: http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
        require('dns').lookup(require('os').hostname(), function (err, ip) {
            _this.initiateServer();
        });
    }
    Server.prototype.initiateServer = function () {
        var _this = this;
        server.listen(this.PORT, function () { return console.log('Server listening on:', _this.adress); });
        this.declareRoutes();
        this.checkRecentTrack(); //Iterates over all connected "hosts" and checks for their recent tracks.
        this.addSocketListeners();
    };
    Server.prototype.declareRoutes = function () {
        var _this = this;
        /**
         * Client requesting the start-page.
         */
        app.get('/', function (req, res) {
            res.sendFile(__dirname + '/index.html');
        });
        /**
         * Client requesting authentication.
         */
        app.get('/authenticate', function (req, res) {
            var queryData = url.parse(req.url, true).query;
            res.redirect('https://www.last.fm/api/auth/?api_key=a05b8d216b62ceec197a37a8b9f11f20&cb=' + _this.adress + '?username=' + queryData.username + "%26host=" + queryData.host);
        });
    };
    Server.prototype.addSocketListeners = function () {
        var _this = this;
        /**
         * Server listening on a socket.
         * Currently only used to pass last.fm data to the client.
         */
        io.on('connection', function (socket) {
            _this.clients[socket.id] = socket;
            socket.on('recenttrack', function (data) {
                socket.emit('recenttrack', _this.partyScrobbler.lastScrobbledTrack);
            });
            // data = {username, token}
            socket.on('user', function (data) {
                _this.apiCommunicator.addToken(data.user, data.token);
                var callback = callbacks.callback.bind(_this.apiCommunicator, _this.apiCommunicator.addItem);
                _this.apiCommunicator.sendRequest(callback, 'getSession', data.user);
                _this.partyScrobbler.addListener(data.user, data.host, socket.id);
            });
            socket.on('host', function (hostname) {
                _this.partyScrobbler.addHost(hostname, socket.id);
                socket.emit('host', 'success');
            });
            socket.on('disconnect', function () {
                delete _this.clients[socket.id];
                _this.partyScrobbler.removeUser(socket.id);
            });
            socket.on('party', function (hostname) {
                socket.emit('party', _this.partyScrobbler.hosts[hostname].listeners.map(function (listener) { return listener.username; }));
            });
        });
    };
    
    /**
     * Fetches each hosts most recently scrobbled track.
     *
     */
    Server.prototype.checkRecentTrack = function () {
        var _this = this;
        var mainLoopIntervalTime = 15000;
        var sendRecentTrack = setInterval(function () {
            Object.keys(_this.partyScrobbler.hosts).forEach(function (hostname) {
                var callbackz = callbacks.callback;
                var recentTrackCallback = callbackz.bind(_this.partyScrobbler, hostname, _this.partyScrobbler.addItem);
                _this.apiCommunicator.sendRequest(recentTrackCallback, 'getRecentTracks', null, null, hostname);
                _this.sendTrackInfoToClients(hostname);
            });
        }, mainLoopIntervalTime);
    };
    ;
    Server.prototype.sendTrackInfoToClients = function (hostName) {
        var _this = this;
        var host = this.partyScrobbler.hosts[hostName];
        var hostnames = host.listeners.map(function (listener) { return listener.username; });
        //Notify all clients, including the host, about most recent track.
        host.listeners.concat(host).forEach(function (listener) {
            if (host.tracks[0]) {
                _this.clients[listener.socketid].emit('recenttrack', {
                    track: host.tracks[0],
                    party: hostnames
                });
            }
        });
    };
    ;
    return Server;
}());
new Server();
