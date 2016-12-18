const API_KEY = 'a05b8d216b62ceec197a37a8b9f11f20';
const API_SECRET = '446fdb19f81071345f7d2da22e327630';

var derp = {
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





APICommunicator.getScrobbleBody = function(method, trackdata, user){

    let sk = this.getSessionKey(user);
    let time = moment().unix();
    let trackname = trackdata.recenttracks.track[0].name;
    let artistname = trackdata.recenttracks.track[0].artist['#text'];
    let encodedtrackname = encodeURIComponent(trackname);
    let encodedartistname = encodeURIComponent(artistname);

    let config = {
        artist: artistname,
        method: method,
        sessionkey: sk,
        timestamp: time,
        track: trackname
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

