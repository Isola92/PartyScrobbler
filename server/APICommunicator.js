"use strict";
exports.__esModule = true;
var RequestSignatures_1 = require("./RequestSignatures");
var RequestOptions_1 = require("./RequestOptions");
var Callback_1 = require("./Callback");
var http = require('http');
var moment = require('moment');
var xml2js = require('xml2js');
//let signatures = require('./RequestSignatures.js');
//let RequestOptions = require('./RequestOptions.js');
var XMLParser = new xml2js.Parser();
var callbacks = require('./Callback');
var APICommunicator = (function () {
    function APICommunicator() {
        this.key = 'a05b8d216b62ceec197a37a8b9f11f20';
        this.hosts = [];
        this.tokens = [];
        this.sessionTokens = [];
        this.token = [];
        this.requestOptions = new RequestOptions_1.RequestOptions(this.key);
    }
    /**
     * Initiates different http-requests depending on the type of method.
     * Fires callbacks to server.js which sends respons to the client.
     */
    APICommunicator.prototype.sendRequest = function (callback, method, username, track, host) {
        switch (method) {
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
    ;
    APICommunicator.prototype.makeScrobbleRequest = function (track, username, callback) {
        var req = http.request(this.requestOptions.getScrobbleTrackOptions(), callback);
        req.write(this.getScrobbleBody('methodtrack.scrobble', track, username));
        req.end();
    };
    ;
    APICommunicator.prototype.makeRecentTrackRequest = function (callback, host) {
        http.request(this.requestOptions.getRecentTrackOptions(host), callback).end();
    };
    ;
    APICommunicator.prototype.makeSessionRequest = function (method, user, callback) {
        var token = this.getToken(user);
        var signature = RequestSignatures_1.getSessionSignature(method, token);
        http.request(this.requestOptions.getSessionOptions(signature, token), callback).end();
    };
    ;
    APICommunicator.prototype.getScrobbleBody = function (method, track, user) {
        var sk = this.getSessionKey(user);
        var time = moment().unix();
        var encodedtrackname = encodeURIComponent(track.name);
        var encodedartistname = encodeURIComponent(track.artist);
        var config = {
            artist: track.artist,
            method: method,
            sessionkey: sk,
            timestamp: time,
            track: track.name
        };
        return 'api_key=' + this.getkey() + '&api_sig=' + RequestSignatures_1.getScrobbleSignature(config) + '&artist=' + encodedartistname + '&method=track.scrobble' + '&sk=' + this.getSessionKey(user) + '&timestamp=' + time + '&track=' + encodedtrackname;
    };
    ;
    APICommunicator.prototype.getkey = function () {
        return this.key;
    };
    ;
    APICommunicator.prototype.getSessionKey = function (username) {
        return this.sessionTokens[username];
    };
    ;
    APICommunicator.prototype.getToken = function (username) {
        if (this.tokens[username] !== undefined) {
            return this.tokens[username];
        }
        return this.token;
    };
    ;
    APICommunicator.prototype.addItem = function (body) {
        var _this = this;
        XMLParser.parseString(body, function (err, result) {
            _this.sessionTokens[result.lfm.session[0].name] = result.lfm.session[0].key[0];
        });
    };
    ;
    APICommunicator.prototype.addToken = function (user, token) {
        this.tokens[user] = token;
    };
    APICommunicator.prototype.scrobbleAllClients = function (track, usernames) {
        var _this = this;
        usernames.forEach(function (username) {
            _this.sendRequest(Callback_1.basicLogCallback, 'scrobbleTrack', username, track, null);
        });
    };
    ;
    return APICommunicator;
}());
exports.APICommunicator = APICommunicator;
