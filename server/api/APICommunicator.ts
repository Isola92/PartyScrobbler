import { Listener } from './../models/Listener';
import {RequestSignatures} from "./RequestSignatures";
import {RequestOptions} from "./RequestOptions";
import {basicLogCallback} from "../util/Callback";
import * as http from "http";
import { RequestParameters } from "../types/types";
import { Host } from "../models/Host";
import { Track } from "../models/Track";
let moment = require('moment');
let xml2js = require('xml2js');
let XMLParser  = new xml2js.Parser();

export class APICommunicator
{
    public key: any;
    public sessionTokens: any[];
    public requestOptions: RequestOptions;
    public requestSignatures: RequestSignatures;

    constructor(key: string, secret: string)
    {
        this.key = key;
        this.sessionTokens = [];
        this.requestOptions = new RequestOptions(key);
        this.requestSignatures = new RequestSignatures(key, secret);
    }

    /**
     * Initiates different http-requests depending on the type of method.
     * Fires callbacks to server.js which sends respons to the client.
     * The optional parameters should be passed in an object instead.
     */
    public sendRequest(params: RequestParameters)
    {
        console.log("API REQUEST: ", params.method);
        switch(params.method)
        {
            case 'getRecentTracks':
                this.makeRecentTrackRequest(params.callback, params.host);
                break;

            case 'getSession':
                this.makeSessionRequest('methodauth.getSession', params.callback, params.token);
                break;

            case 'scrobbleTrack':
                this.makeScrobbleRequest(params.track, params.username, params.callback, params.sessionToken);
                break;

            default:
                console.log("No http request method with that name");
        }
    };

    public makeScrobbleRequest(track: Track, username: string, callback: () => void, sessionToken: string)
    {
        let req = http.request(this.requestOptions.getScrobbleTrackOptions(), callback);
        req.write(this.getScrobbleBody('methodtrack.scrobble', track, sessionToken));
        req.end();
    };

    public makeRecentTrackRequest(callback: () => void, hostname: string)
    {
        http.request(this.requestOptions.getRecentTrackOptions(hostname), callback).end();
    };

    public makeSessionRequest(method: string, callback: () => void, token: string)
    {
        let signature = this.requestSignatures.getSessionSignature(method, token);
        http.request(this.requestOptions.getSessionOptions(signature, token), callback).end();
    };

    public getScrobbleBody(method: string, track: Track, sessionToken: string)
    {
        let sk                = sessionToken
        let time              = moment().unix();
        let encodedtrackname  = encodeURIComponent(track.name);
        let encodedartistname = encodeURIComponent(track.artist);

        let config = {
            artist:     track.artist,
            method:     method,
            sessionkey: sk,
            timestamp:  time,
            track:      track.name
        };

        return 'api_key=' + this.key + '&api_sig=' + this.requestSignatures.getScrobbleSignature(config) + '&artist=' + encodedartistname + '&method=track.scrobble' + '&sk=' + sk + '&timestamp=' + time + '&track=' + encodedtrackname;
    };

    private scrobbleAllClients(track: Track, usernames: string[], sessionTokens: {[username: string]: string})
    {
        usernames.forEach( (username)=>
        {
            this.sendRequest({callback: basicLogCallback, method: 'scrobbleTrack', username: username, track: track, sessionToken: sessionTokens[username]});
        })
    };

    /**
     * Iterate over the clients and initiate one scrobble POST request for each.
     * Should change this method to take in a hostname as well. Then scrobble each
     * listener connected to that host. Will also have to add a mapping between username and sessiontoken.
     */
    public initiateScrobbling(track: Track, host: Host, sessionTokens: {[username: string]: string})
    {
        if(host.listeners.length > 0)
        {
            let usernames = host.listeners.map( (listener: Listener) => listener.name ) || [];
            this.scrobbleAllClients(track, usernames, sessionTokens)
        }
        else
        {
            console.log("Canceled initiating of new scrobble, no listeners in party.");
        }
    }

}