let http   = require('http');
let moment = require('moment');
let xml2js = require('xml2js');

let signatures = require('./RequestSignatures.js');
let RequestOptions = require('./RequestOptions.js');
let XMLParser  = new xml2js.Parser();

function APICommunicator(host){
    this.key = 'a05b8d216b62ceec197a37a8b9f11f20';
    this.host = host;
    this.tokens = [];
    this.sessionTokens = [];
    this.token = [];
    this.requestOptions = new RequestOptions(this.key, this.host);
}

/**
 * Initiates different http-requests depending on the type of method.
 * Fires callbacks to server.js which sends respons to the client.
 * TODO: CHANGE THIS METHOD TO USE THE PARAMS ARRAY INSTEAD
 * TODO: BREAK OUT REQUESTS FROM THIS CLASS
 */
APICommunicator.prototype.sendRequest = function(callback, method, username, track){

    switch(method){

        case 'getRecentTracks':
            this.makeRecentTrackRequest(callback);
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

APICommunicator.prototype.makeScrobbleRequest = function(track, username, callback){
    let req = http.request(this.requestOptions.getScrobbleTrackOptions(), callback);
    req.write(this.getScrobbleBody('methodtrack.scrobble', track, username));
    req.end();
};

APICommunicator.prototype.makeRecentTrackRequest = function(callback){
    http.request(this.requestOptions.getRecentTrackOptions(), callback).end();
};

APICommunicator.prototype.makeSessionRequest = function(method, user, callback){
    let token = this.getToken(user);
    let signature = signatures.getSessionSignature(method, token);
    http.request(this.requestOptions.getSessionOptions(signature, token), callback).end();
};

APICommunicator.prototype.getScrobbleBody = function(method, track, user){

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

    return 'api_key=' + this.getkey() + '&api_sig=' + signatures.getScrobbleSignature(config) + '&artist=' + encodedartistname + '&method=track.scrobble' + '&sk=' + this.getSessionKey(user) + '&timestamp=' + time + '&track=' + encodedtrackname;
};

APICommunicator.prototype.getkey = function(){
    return this.key;
};

APICommunicator.prototype.getSessionKey = function(username){
    return this.sessionTokens[username];
};

APICommunicator.prototype.getToken = function(username){

    if(this.tokens[username] !== undefined){
        return this.tokens[username];
    }

    return this.token;
};

APICommunicator.prototype.addItem = function(body){
    XMLParser.parseString(body, (err, result) =>{
        this.sessionTokens[result.lfm.session[0].name] = result.lfm.session[0].key[0];
    });
};

module.exports = APICommunicator;