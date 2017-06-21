import {RequestSignatures} from "./RequestSignatures";
import {RequestOptions} from "./RequestOptions";
import {basicLogCallback} from "../util/Callback";
let http   = require('http');
let moment = require('moment');
let xml2js = require('xml2js');

let XMLParser  = new xml2js.Parser();
//let callbacks = require('./Callback');

export class APICommunicator
{
    public key: any;
    public hosts: any[];
    public tokens: any[];
    public sessionTokens: any[];
    public token: any[];
    public requestOptions: RequestOptions;
    public requestSignatures: RequestSignatures;

    constructor(key: string, secret: string)
    {
        this.key = key;
        this.hosts = [];
        this.tokens = [];
        this.sessionTokens = [];
        this.requestOptions = new RequestOptions(key);
        this.requestSignatures = new RequestSignatures(key, secret);
    }


    /**
     * Initiates different http-requests depending on the type of method.
     * Fires callbacks to server.js which sends respons to the client.
     */
    public sendRequest(callback, method, username, track, host)
    {

        switch(method)
        {

            case 'getRecentTracks':
                this.makeRecentTrackRequest(callback, host);
                break;

            case 'getSession':
                this.makeSessionRequest('methodauth.getSession', username, callback);
                break;

            case 'scrobbleTrack':
                this.makeScrobbleRequest(track, username, callback);
                break;

            default:
                console.log("No http request method with that name");
        }
    };

    public makeScrobbleRequest(track, username, callback)
    {
        let req = http.request(this.requestOptions.getScrobbleTrackOptions(), callback);
        req.write(this.getScrobbleBody('methodtrack.scrobble', track, username));
        req.end();
    };

    public makeRecentTrackRequest(callback, host)
    {
        http.request(this.requestOptions.getRecentTrackOptions(host), callback).end();
    };

    public makeSessionRequest(method, user, callback)
    {
        let token = this.getToken(user);
        let signature = this.requestSignatures.getSessionSignature(method, token);
        http.request(this.requestOptions.getSessionOptions(signature, token), callback).end();
    };

    public getScrobbleBody(method, track, user)
    {
        let sk                = this.getSessionKey(user);
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

        return 'api_key=' + this.getkey() + '&api_sig=' + this.requestSignatures.getScrobbleSignature(config) + '&artist=' + encodedartistname + '&method=track.scrobble' + '&sk=' + this.getSessionKey(user) + '&timestamp=' + time + '&track=' + encodedtrackname;
    };

    public getkey(): string
    {
        return this.key;
    };

    public getSessionKey(username): string
    {
        return this.sessionTokens[username];
    };

    public getToken(username): string
    {
        if(this.tokens[username] !== undefined){
            return this.tokens[username];
        }

        return null;
        //return this.token;
    };

    public addItem(body)
    {
        XMLParser.parseString(body, (err, result) =>{
            this.sessionTokens[result.lfm.session[0].name] = result.lfm.session[0].key[0];
        });
    };

    public addToken(user, token)
    {
        this.tokens[user] = token;
    }

    public scrobbleAllClients(track, usernames)
    {
        usernames.forEach( (username)=>
        {
            this.sendRequest(basicLogCallback, 'scrobbleTrack', username, track, null);
        })
    };

}