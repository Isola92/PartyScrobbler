var http = require('http');
var moment = require('moment');

var signatures = require('./RequestSignatures.js');



let APICommunicator = {

    key: 'a05b8d216b62ceec197a37a8b9f11f20',
    tokens: [],
    sessionTokens: [],
    token: '',
    secret: '446fdb19f81071345f7d2da22e327630',

    getRecentTracks: {
        host: 'ws.audioscrobbler.com',
        port: 80,
        path: '/2.0/?method=user.getrecenttracks&user=HugePackage&api_key=a05b8d216b62ceec197a37a8b9f11f20&format=json&limit=1'
    },

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
            http.request(this.getRecentTracks, callback).end();
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

APICommunicator.getkey = function() {
    return this.key
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


module.exports = APICommunicator;


