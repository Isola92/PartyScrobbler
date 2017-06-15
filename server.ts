/* declare to avoid typescript warnings. */
//declare function require(name:string);
//declare const __dirname;
//declare const process;


// External
let express         = require('express');
let app             = express();
let server          = require('http').createServer(app);
let io              = require('socket.io')(server);
let xml2js          = require('xml2js');
let path            = require('path');
let url             = require('url');

// Internal
let APICommunicator = require('./server/APICommunicator');
let PartyScrobbler  = require('./server/PartyScrobbler');
let callbacks       = require('./server/Callback');

// Routes
const AUTHENTICATE = "/authenticate";
const HOME  = "/";

// Socket 
const RECENTTRACK = "recenttrack";
const USER = "user";
const HOST = "host";
const DISCONNECT = "disconnect";
const PARTY = "party";



app.use(express.static(path.join(__dirname, './public')));


/**
 * Methods related to dealing with requests from the client.
 * Requests from the client comes in two forms:
 * 1. Regular http-requests (urls).
 * 2. Data from a socket connection between the client and the server.
 */
class Server
{
    private clients: any[] = [];
    private local: string    = 'http://localhost:5000';
    private official: string = "https://partyscrobbler.herokuapp.com/";
    private adress: string  = this.local;
    private partyScrobbler;
    private apiCommunicator;
    private PORT     = process.env.PORT || 5000;

    constructor()
    {
        this.apiCommunicator = new APICommunicator();
        this.partyScrobbler  = new PartyScrobbler(this.apiCommunicator);

        //Shamelessly stolen from: http://stackoverflow.com/questions/3653065/get-local-ip-address-in-node-js
        require('dns').lookup(require('os').hostname(), (err, ip) =>
        {
            this.initiateServer();
        });
    }
    
    private initiateServer(): void
    {
        server.listen(this.PORT, () => console.log('Server listening on:', this.adress));
        this.declareRoutes();
        this.checkRecentTrack(); //Iterates over all connected "hosts" and checks for their recent tracks.
        this.addSocketListeners();
    }

    private declareRoutes(): void
    {
        /**
         * Client requesting the start-page.
         */
        app.get('/', (req, res) =>
        {
            res.sendFile(__dirname + '/index.html');
        });

        /**
         * Client requesting authentication.
         */
        app.get('/authenticate', (req, res) =>
        {
            let queryData = url.parse(req.url, true).query;
            res.redirect('https://www.last.fm/api/auth/?api_key=a05b8d216b62ceec197a37a8b9f11f20&cb=' + this.adress + '?username=' + queryData.username + "%26host=" + queryData.host);
        });

    }

    private addSocketListeners(): void
    {
        /**
         * Server listening on a socket.
         * Currently only used to pass last.fm data to the client.
         */
        io.on('connection', (socket) =>
        {
            this.clients[socket.id] = socket;

            socket.on('recenttrack', (data) =>
            {
                socket.emit('recenttrack', this.partyScrobbler.lastScrobbledTrack);
            });

            // data = {username, token}
            socket.on('user', (data) =>
            {
                this.apiCommunicator.addToken(data.user, data.token);
                let callback = callbacks.callback.bind(this.apiCommunicator, this.apiCommunicator.addItem);
                this.apiCommunicator.sendRequest(callback, 'getSession', data.user);
                this.partyScrobbler.addListener(data.user, data.host, socket.id);
            });

            socket.on('host', (hostname) =>
            {
                this.partyScrobbler.addHost(hostname, socket.id);
                socket.emit('host', 'success');
            });

            socket.on('disconnect', () =>
            {
                delete this.clients[socket.id];
                this.partyScrobbler.removeUser(socket.id);
            });

            socket.on('party', (hostname) =>
            {
                socket.emit('party', this.partyScrobbler.hosts[hostname].listeners.map((listener) => listener.username));
            });
        });
    }

    /**
     * Fetches each hosts most recently scrobbled track.
     * 
     */
    private checkRecentTrack()
    {
        const mainLoopIntervalTime = 15000;

        let sendRecentTrack = setInterval(() =>
        {
            Object.keys(this.partyScrobbler.hosts).forEach((hostname) =>
            {
                let callbackz = callbacks.callback;
                let recentTrackCallback = callbackz.bind(this.partyScrobbler, hostname, this.partyScrobbler.addItem);
                this.apiCommunicator.sendRequest(recentTrackCallback, 'getRecentTracks', null, null, hostname);
                this.sendTrackInfoToClients(hostname);
            });

        }, mainLoopIntervalTime);
    };

    private sendTrackInfoToClients(hostName)
    {
        let host      = this.partyScrobbler.hosts[hostName];
        let hostnames = host.listeners.map((listener) => listener.username);

        //Notify all clients, including the host, about most recent track.
        host.listeners.concat(host).forEach((listener) =>
        {
            if(host.tracks[0])
            {
                this.clients[listener.socketid].emit('recenttrack', 
                {
                    track: host.tracks[0],
                    party: hostnames
                });
            }
        })
    };
}

new Server();