/**
 * This class is responsible for dealing with users and trackdata.
 */
function PartyScrobbler(newTrackNotification){
    this.users                = [];
    this.tracks               = [];
    this.newTrackNotification = newTrackNotification;
    this.hosts                = {};
}

/**
 * Return true if the track is not scrobbled yet.
 * @param nextTrack
 * @returns {boolean}
 */
PartyScrobbler.prototype.compareTrack = function(nextTrack, hostname){
    return this.hosts[hostname].lastscrobbledtrack.name !== nextTrack.name || this.hosts[hostname].lastscrobbledtrack.artist !== nextTrack.artist;
};

PartyScrobbler.prototype.addItem = function(trackdata, hostname){

    let track = this.parseTrack(JSON.parse(trackdata))

    if(this.compareTrack(track, hostname)){
        this.hosts[hostname].tracks.push(track);
        this.hosts[hostname].lastscrobbledtrack = track;
        this.newTrackNotification(track);
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

PartyScrobbler.prototype.addHost = function(hostName, socketId){

    if(!this.hosts[hostName]){

        this.hosts[hostName] = {
            socketid:           socketId,
            lastscrobbledtrack: {},
            hostname:           hostName,
            tracks:             [],
            listeners:          []
        };
        console.log("Successfully added a new host");
        return;
    }
    console.log("Host already exists");

    /*

     let hostnames = this.hosts.map( (host) => {
     return host.hostname;
     }) || [];

     if(hostnames.indexOf(hostName) === -1){
     this.hosts.push({
     socketid:           socketId,
     lastscrobbledtrack: {},
     hostname:           hostName,
     tracks:             []
     });
     }
     */


};

PartyScrobbler.prototype.addListener = function(userName, hostName, socketId){

    /*    let hosts = this.hosts.filter( (host) => {
     return host.hostname !== hostName;
     }) || [];



     hosts.push({})*/

    this.hosts[hostName].listeners.push({
        username: userName,
        socketid: socketId
    });
};

module.exports = PartyScrobbler;