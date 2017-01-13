/**
 * This class is responsible for dealing with users and trackdata.
 */
function PartyScrobbler(apiCommunicator){
    this.tracks               = [];
    this.apiCommunicator      = apiCommunicator;
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
        this.scrobbleAllClients(track, this.hosts[hostname]);
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
    }else{
        this.hosts[hostName].socketid = socketId;
        console.log("Host already exists");
    }
};

/**
 * Adds a new listener to an array on a host object.
 * If the user already exists it's removed and then added again.
 */
PartyScrobbler.prototype.addListener = function(userName, hostName, socketId){

    if(this.hosts[hostName]){

        this.hosts[hostName].listeners = this.hosts[hostName].listeners.filter((listener) =>{
            return listener.username !== userName;
        });

        this.hosts[hostName].listeners.push({
            username: userName,
            socketid: socketId
        });

        console.log("A new listener has joined: Username: " + userName + " \nHostname " + hostName);
    }
};

PartyScrobbler.prototype.mergeHostsAndUsers = function(host){
    let users = [];

    Object.keys(this.hosts).forEach((key) =>{
        let host = this.hosts[key];

        if(host.listeners){
            host = host.listeners.concat(host)
        }

        users = users.concat(host);
    });

    return users;
};

/**
 * Adds users and hosts together and returns one based on it's client-id.
 */
PartyScrobbler.prototype.getUserFromClientId = function(socketId){

    return this.mergeHostsAndUsers().find((user) =>{
        return user.socketid === socketId;
    })
};

PartyScrobbler.prototype.removeUser = function(socketId){

    let keys = Object.keys(this.hosts);

    for(let i = 0; i < keys.length; i++){

        if(this.hosts[keys[i]].socketid === socketId){
            delete this.hosts[keys[i]];
        }else if(this.hosts[keys[i]].listeners){
            for(let j = 0; j < this.hosts[keys[i]].listeners.length; j++){
                if(this.hosts[keys[i]].listeners[j].socketid === socketId){
                    this.hosts[keys[i]].listeners.splice(j, 1);
                }
            }
        }
    }
};

/**
 * Iterate over the clients and initiate one scrobble POST request for each.
 * Should change this method to take in a hostname as well. Then scrobble each
 * listener connected to that host. Will also have to add a mapping between username and sessiontoken.
 */
PartyScrobbler.prototype.scrobbleAllClients = function(track, host){

    if(host.listeners){
        let usernames = host.listeners.map( (listener) => listener.username );
        this.apiCommunicator.scrobbleAllClients(track, usernames)
    }else{
        console.log("Canceled initiating of new scrobble, no listeners in party.");
    }

};

module.exports = PartyScrobbler;