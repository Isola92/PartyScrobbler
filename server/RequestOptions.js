/**
 * Methods responsible for returning the option object you pass to a node httprequest.
 */
function RequestOptions(key){
    this.key = key;
}

RequestOptions.prototype.getSessionOptions = function(signature, token){

    return {
        host: 'ws.audioscrobbler.com',
        port: 80,
        path: '/2.0/?api_key=' + this.key + '&api_sig=' + signature + '&method=auth.getSession&token=' + token
    };
};

RequestOptions.prototype.getRecentTrackOptions = function(host){

    return {
        host: 'ws.audioscrobbler.com',
        port: 80,
        path: '/2.0/?method=user.getrecenttracks&user=' + host + '&api_key=' + this.key + '&format=json&limit=20'
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