var http = require('http');
var moment = require('moment');
var xml2js = require('xml2js');

var signatures = require('./RequestSignatures.js');

var XMLParser = new xml2js.Parser();

let APICommunicator = {

    key: 'a05b8d216b62ceec197a37a8b9f11f20',
    tokens: [],
    sessionTokens: [],
    token: '',
    secret: '446fdb19f81071345f7d2da22e327630',
    host: '',

    scrobbleTrack: {
        host: 'ws.audioscrobbler.com',
        port: 80,
        method: 'POST',
        path: '/2.0/',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
    }
};


/**
 * Initiates different http-requests depending on the type of method.
 * Fires callbacks to server.js which sends respons to the client.
 * TODO: CHANGE THIS METHOD TO USE THE PARAMS ARRAY INSTEAD
 * TODO: BREAK OUT REQUESTS FROM THIS CLASS
 */
APICommunicator.sendRequest = function(callback, method, username, track){

    console.log(this.getRecentTracks);
    switch (method) {
        case 'getRecentTracks':
            http.request(this.getRecentTrack(), callback).end();
            break;

        case 'getSession':
            http.request(this.getSession('methodauth.getSession', username), callback).end();
            break;

        case 'scrobbleTrack':
            let req = http.request(this.scrobbleTrack, callback);
            req.write(this.getScrobbleBody('methodtrack.scrobble', track, username));
            req.end();
    }
};

APICommunicator.getScrobbleBody = function(method, track, user){

    let sk = this.getSessionKey(user);
    let time = moment().unix();
    let encodedtrackname = encodeURIComponent(track.name);
    let encodedartistname = encodeURIComponent(track.artist);

    let config = {
        artist: track.artist,
        method: method,
        sessionkey: sk,
        timestamp: time,
        track: track.name
    };

    return 'api_key=' + this.getkey() + '&api_sig=' + signatures.getScrobbleSignature(config) + '&artist=' + encodedartistname + '&method=track.scrobble' + '&sk=' + this.getSessionKey(user) + '&timestamp=' + time + '&track=' + encodedtrackname;
};

APICommunicator.getSession = function(method, user){

    let signature = signatures.getSessionSignature(method, this.gettoken(user));

    return {
        host: 'ws.audioscrobbler.com',
        port: 80,
        path: '/2.0/?api_key=' + this.getkey() + '&api_sig=' + signature + '&method=auth.getSession&token=' + this.gettoken(user)
    }
};

APICommunicator.getRecentTrack = function() {

    return {
            host: 'ws.audioscrobbler.com',
            port: 80,
            path: '/2.0/?method=user.getrecenttracks&user=' + this.gethost() + '&api_key=' + this.getkey() + '&format=json&limit=1'
    };
}

APICommunicator.getkey = function() {
    return this.key;
};

APICommunicator.getSessionKey = function (username) {
    return this.sessionTokens[username];
};

APICommunicator.gettoken = function (username) {

    if (this.tokens[username] !== undefined) {
        return this.tokens[username];
    }

    return this.token;
};

APICommunicator.gethost = function () {
    return this.host;
};

APICommunicator.addItem = function (body){
    XMLParser.parseString(body, (err, result) => {
        this.sessionTokens[result.lfm.session[0].name] = result.lfm.session[0].key[0];
    });
}


module.exports = APICommunicator;


