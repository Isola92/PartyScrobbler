import { APICommunicator } from "./APICommunicator";
/**
 * This class is responsible for dealing with users and trackdata.
 */
export class PartyScrobbler
{
    private apiCommunicator: APICommunicator;
    private tracks: any[];
    public hosts: any;
    public lastScrobbledTrack: any;

    constructor(apiCommunicator: APICommunicator)
    {
        this.tracks               = [];
        this.apiCommunicator      = apiCommunicator;
        this.hosts                = {};
    }

    /**
     * Compares scrobble data directly from the last.fm API with the state stored on the server.
     * @param latestLastFMTracks The 20 most recent tracks scrobbled by the host (from last.fm)
     * @returns {boolean} true if the track is not scrobbled yet.
     */
    private isNewTrack(latestLastFMTracks, localTracks)
    {
        const string1 = JSON.stringify(latestLastFMTracks[0]);
        const string2 = JSON.stringify(localTracks[0]);
        return string1 !== string2;

        /* 
        Wait with this solution. It's not stable:
        Do I make the correct request to last.fm (including both album, artist and track)?
        If the user decides to delete a track everything turns to shit.
        return !recenttracks.every( (track, index) => {
            return localTracks[index].name === track.name && localTracks[index].artist === track.artist;
        })
        */
    }

    public addItem(trackdata, hostname)
    {
        let tracks = this.parseTrack(JSON.parse(trackdata));

        if(this.hosts[hostname].tracks.length === 0)
        {
            this.hosts[hostname].tracks = tracks;
            console.log("Added the " + tracks.length + " latest tracks to the host for comparison. None of them were scrobbled.");
            return;
        }

        if(this.isNewTrack(tracks, this.hosts[hostname].tracks))
        {
            this.hosts[hostname].tracks.unshift(tracks[0]);
            this.hosts[hostname].lastscrobbledtrack = tracks[0];
            this.scrobbleAllClients(tracks[0], this.hosts[hostname]);
            this.hosts[hostname].tracks.pop();
        }

        console.log("Most recently scrobbled track:", tracks[0].name);
    }

    /**
     * Takes in the track object returned from last.fm and converts it to a more shallow object
     * with the information we actually need.
     * @param trackdata
     */
    private parseTrack(trackdata)
    {
        let track = trackdata.recenttracks.track[0];

        return trackdata.recenttracks.track.map( (track) => 
        {
            return {
                artist: track.artist['#text'],
                name:   track.name,
                album:  track.album['#text'],
                image:  track.image[3]["#text"]
            };
        });
    }

    public addHost(hostName, socketId)
    {
        if(!this.hosts[hostName])
        {
            this.hosts[hostName] = 
            {
                socketid:           socketId,
                lastscrobbledtrack: {},
                hostname:           hostName,
                tracks:             [],
                listeners:          []
            };
            console.log("Successfully added a new host:", hostName);
        }
        else
        {
            this.hosts[hostName].socketid = socketId;
            console.log("Host already exists");
        }
    }

    /**
     * Adds a new listener to an array on a host object.
     * If the user already exists it's removed and then added again.
     */
    public addListener(userName, hostName, socketId)
    {

        if(this.hosts[hostName])
        {

            this.hosts[hostName].listeners = this.hosts[hostName].listeners.filter((listener) =>
            {
                return listener.username !== userName;
            });

            this.hosts[hostName].listeners.push(
            {
                username: userName,
                socketid: socketId
            });

            console.log("A new listener has joined: Username: " + userName + ". Host: " + hostName);
        }
    }

    private mergeHostsAndUsers()
    {
        let users = [];

        Object.keys(this.hosts).forEach((key) =>
        {
            let host = this.hosts[key];

            if(host.listeners)
            {
                host = host.listeners.concat(host)
            }

            users = users.concat(host);
        });

        return users;
    }

    /**
     * Adds users and hosts together and returns one based on it's client-id.
     */
    private getUserFromClientId(socketId)
    {

        return this.mergeHostsAndUsers().find((user) =>
        {
            return user.socketid === socketId;
        })
    }

    public removeUser(socketId)
    {
        let keys = Object.keys(this.hosts);

        for(let i = 0; i < keys.length; i++)
        {

            if(this.hosts[keys[i]].socketid === socketId)
            {
                delete this.hosts[keys[i]];
            }
            else if(this.hosts[keys[i]].listeners)
            {
                for(let j = 0; j < this.hosts[keys[i]].listeners.length; j++)
                {
                    if(this.hosts[keys[i]].listeners[j].socketid === socketId)
                    {
                        this.hosts[keys[i]].listeners.splice(j, 1);
                    }
                }
            }
        }
    }

    /**
     * Iterate over the clients and initiate one scrobble POST request for each.
     * Should change this method to take in a hostname as well. Then scrobble each
     * listener connected to that host. Will also have to add a mapping between username and sessiontoken.
     */
    public scrobbleAllClients(track, host)
    {

        if(host.listeners)
        {
            let usernames = host.listeners.map( (listener) => listener.username );
            this.apiCommunicator.scrobbleAllClients(track, usernames)
        }
        else
        {
            console.log("Canceled initiating of new scrobble, no listeners in party.");
        }
    }
}