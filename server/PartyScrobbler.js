/**
 * This object is responsible for dealing with tracks.
 * @type {{users: Array, tracks: Array, currentTrack: {}, lastScrobbledTrack: {}}}
 */

function PartyScrobbler(){
    this.users              = [];
    this.tracks             = [];
    this.currentTrack       = {};
    this.lastScrobbledTrack = {};
    this.callback           = {};
}

/**
 * Return true if the track is not scrobbled yet.
 * @param nextTrack
 * @returns {boolean}
 */
PartyScrobbler.prototype.compareTrack = function(nextTrack){
    return this.lastScrobbledTrack.name !== nextTrack.name || this.lastScrobbledTrack.artist !== nextTrack.artist;
};

PartyScrobbler.prototype.addItem = function(trackdata){

    let track = this.parseTrack(JSON.parse(trackdata));

    if(this.compareTrack(track)){
        this.tracks.push(track);
        this.lastScrobbledTrack = track;
        this.callback.call(this);
    }
};

/**
 * Takes in the track object returned from last.fm and converts it to a more shallow object
 * with the information we actually need.
 * @param trackdata
 */
PartyScrobbler.prototype.parseTrack = function(trackdata){

    let track = trackdata.recenttracks.track[0];

    return {
        artist: track.artist['#text'],
        name:   track.name,
        album:  track.album['#text'],
        image:  track.image[3]["#text"]
    };
};


PartyScrobbler.prototype.setCallback = function(callback){
    this.callback = callback;
}

module.exports = PartyScrobbler;