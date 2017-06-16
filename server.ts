import {PartyScrobbler} from "./server/PartyScrobbler";
import {APICommunicator} from "./server/APICommunicator";
import {callback, basicLogCallback} from "./server/Callback";
import * as url from "url";
import * as express from "express";
import * as http from "http";
import * as xml2js from "xml2js";
import * as path from "path";
// External
//let express         = require('express');             

//let xml2js          = require('xml2js');
//let path            = require('path');

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
    private partyScrobbler: PartyScrobbler;
    private apiCommunicator;
    private PORT     = process.env.PORT || 5000;
    private app: any;
    private io: any;

    constructor()
    {
        this.apiCommunicator = new APICommunicator();
        this.partyScrobbler  = new PartyScrobbler(this.apiCommunicator);

        require('dns').lookup(require('os').hostname(), (err, ip) =>
        {
            this.initiateServer();
        });
    }
    
    private initiateServer(): void
    {
        this.app = express();
        this.app.use(express.static(path.join(__dirname, './public')));
        const server = require('http').createServer(this.app);
        this.io = require('socket.io')(server);
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
        this.app.get('/', (req, res) =>
        {
            res.sendFile(__dirname + '/index.html');
        });

        /**
         * Client requesting authentication.
         */
        this.app.get('/authenticate', (req, res) =>
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
        this.io.on('connection', (socket) =>
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
                let callbackz = callback.bind(this.apiCommunicator, this.apiCommunicator.addItem);
                this.apiCommunicator.sendRequest(callbackz, 'getSession', data.user);
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
     */
    private checkRecentTrack()
    {
        const mainLoopIntervalTime = 15000;

        let sendRecentTrack = setInterval(() =>
        {
            Object.keys(this.partyScrobbler.hosts).forEach((hostname) =>
            {
                let recentTrackCallback = callback.bind(this.partyScrobbler, hostname, this.partyScrobbler.addItem);
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