/**
 * This class is responsible for dealing with users and trackdata.
 */
function PartyScrobbler(newTrackNotification){
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

    console.log("Most recently scrobbled track:", track);
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
    }else{
        this.hosts[hostName].socketid = socketId;
    }
    console.log("Host already exists");
};

/**
 * Adds a new listener to an array on a host object.
 * If the user already exists it's removed and then added again.
 */
PartyScrobbler.prototype.addListener = function(userName, hostName, socketId){

    if(this.hosts[hostName]){

        this.hosts[hostName].listeners = this.hosts[hostName].listeners.filter( (listener) => {
            return listener.username !== userName;
        });

        this.hosts[hostName].listeners.push({
            username: userName,
            socketid: socketId
        });

        console.log("A new listener has joined: Username: " + userName + " \nHostname " + hostName);
    }
};

/**
 * Adds users and hosts together and returns one based on it's client-id.
 */
PartyScrobbler.prototype.getUserFromClientId = function(socketId){
    let users = [];

    Object.keys(this.hosts).forEach( (key) => {
        let host = this.hosts[key];

        if(host.listeners){
            host = host.listeners.concat(host)
        }

        users = users.concat(host);
    });

    return users.find((user) =>{
        return user.socketid === socketId
    })
}

module.exports = PartyScrobbler;