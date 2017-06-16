"use strict";
exports.__esModule = true;
var crypto = require('crypto');
var API_KEY = 'a05b8d216b62ceec197a37a8b9f11f20';
var API_SECRET = '446fdb19f81071345f7d2da22e327630';
function getSessionSignature(method, token) {
    var secret = 'api_key'
        + API_KEY
        + method
        + 'token'
        + token
        + API_SECRET;
    return createHash(secret, 'md5');
}
exports.getSessionSignature = getSessionSignature;
;
function getScrobbleSignature(config) {
    var signature = 'api_key'
        + API_KEY
        + 'artist'
        + config.artist
        + config.method
        + 'sk'
        + config.sessionkey
        + 'timestamp'
        + config.timestamp
        + 'track'
        + config.track
        + API_SECRET;
    return createHash(signature, 'md5');
}
exports.getScrobbleSignature = getScrobbleSignature;
;
var createHash = function (string, someGoodHash) {
    return crypto.createHash(someGoodHash).update(string).digest('hex');
};
