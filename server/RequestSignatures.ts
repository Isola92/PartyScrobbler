const crypto = require('crypto');
const API_KEY = 'a05b8d216b62ceec197a37a8b9f11f20';
const API_SECRET = '446fdb19f81071345f7d2da22e327630';

export function getSessionSignature(method, token)
{

    let secret =
        'api_key'
        + API_KEY
        + method
        + 'token'
        + token
        + API_SECRET;

    return createHash(secret, 'md5');
};

export function getScrobbleSignature(config)
{

    let signature =
        'api_key'
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
        + API_SECRET

    return createHash(signature, 'md5');
};

const createHash = (string, someGoodHash) => {

    return crypto.createHash(someGoodHash).update(string).digest('hex');
};