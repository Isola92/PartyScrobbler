/**
 * Methods responsible for returning the option object you pass to a httprequest.
 */
function RequestOptions(key, host){
    this.key = key;
    this.host = host;
}

RequestOptions.prototype.getSessionOptions = function(signature, token){

    return {
        host: 'ws.audioscrobbler.com',
        port: 80,
        path: '/2.0/?api_key=' + this.key + '&api_sig=' + signature + '&method=auth.getSession&token=' + token
    };
};

RequestOptions.prototype.getRecentTrackOptions = function(){

    return {
        host: 'ws.audioscrobbler.com',
        port: 80,
        path: '/2.0/?method=user.getrecenttracks&user=' + this.host + '&api_key=' + this.key + '&format=json&limit=1'
    };
};

RequestOptions.prototype.getScrobbleTrackOptions = function(){

    return {
        host:    'ws.audioscrobbler.com',
        port:    80,
        method:  'POST',
        path:    '/2.0/',
        headers: {
            'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
        }
    }
};

module.exports = RequestOptions;