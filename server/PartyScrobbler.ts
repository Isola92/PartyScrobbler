import { State, CentralDispatcher, ServerActivity, Action } from './State';
import {Track} from "./models/Track";
import {Listener} from "./models/Listener";
import {Host} from "./models/Host";

/**
 * This class is responsible for dealing with users and trackdata.
 */
export class PartyScrobbler
{
    private centralDispatcher: CentralDispatcher;
    public hosts: Host[];

    constructor(centralDispatcher: CentralDispatcher)
    {
        this.centralDispatcher = centralDispatcher;
        this.hosts = [];
    }

    /**
     * Compares scrobble data directly from the last.fm API with the state stored on the server.
     * @param latestLastFMTracks The 20 most recent tracks scrobbled by the host (from last.fm)
     * @returns {boolean} true if the track is not scrobbled yet.
     */
    private isNewTrack(latestLastFMTracks, localTracks): boolean
    {
        const string1 = JSON.stringify(latestLastFMTracks[0]);
        const string2 = JSON.stringify(localTracks[0]);
        return string1 !== string2;
    }

    public addItem(trackdata: any, host: Host, hosts: Host[]): Host[]
    {
        let tracks = this.parseTrack(JSON.parse(trackdata));

        if(host.tracks.length === 0)
        {
            host.tracks = tracks;
            console.log("Added the " + tracks.length + " latest tracks to the host for comparison. None of them were scrobbled.");
            hosts[host.name] = host;
            return hosts;
        }

        if(this.isNewTrack(tracks, host.tracks))
        {
            this.centralDispatcher.notify(new ServerActivity(Action.API_SCROBBLE_TRACK, {track: tracks[0], host: host}));
            host.tracks.unshift(tracks[0]);
        }

        console.log("Most recently scrobbled track:", tracks[0].name);

        hosts[host.name] = host;
        return hosts;
    }

    /**
     * Takes in the track object returned from last.fm and converts it to a more shallow object
     * with the information we actually need.
     * @param trackdata
     */
    private parseTrack(trackdata: any): Track[]
    {
        let track = trackdata.recenttracks.track[0];

        return trackdata.recenttracks.track.map( (track) => 
        {
            return new Track(track.artist['#text'], track.name, track.album['#text'], track.image[3]["#text"]);
        });
    }

    /**
     * Add a new host, but if it already exists we update the socket id.
     * @param hostName 
     * @param socketId 
     */
    public addHost(hostName, socketId, hosts: Host[]): Host[]
    {
        if(!hosts[hostName])
        {
            hosts[hostName] = new Host(hostName, socketId);
            console.log("Successfully added a new host:", hosts[hostName]);
        }
        else
        {
            hosts[hostName].socketID = socketId;
            console.log("Host already exists");
        }

        return hosts;
    }

    /**
     * Adds a new listener to an array on a host object.
     * If the user already exists it's removed and then added again.
     */
    public addListener(userName, hostName, socketId, hosts: Host[]): Host[]
    {
        if(hosts[hostName])
        {
            hosts[hostName].listeners = hosts[hostName].listeners.filter((listener) =>
            {
                return listener.name !== userName;
            });

            hosts[hostName].listeners.push(new Listener(userName, socketId));
            console.log("A new listener has joined: Username: " + userName + ". Host: " + hostName);
        }

        return hosts;
    }

    private mergeHostsAndUsers(hosts?: Array<Host>): Array<Listener|Host>
    {

        return hosts.reduce( (prev: Array<Host|Listener>, current: Host) =>
        {
            return prev.concat(current.listeners);
            
        },[hosts[0]])
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

    public removeUser(socketId): Host[]
    {
        // Filter out the disconnected host IF there is one.
        let hosts: Host[] = this.hosts.filter( (host) =>
        {
            return host.socketID !== socketId;
        })

        // Iterate over the listeners to remove that one instead.
        hosts.forEach( (host) =>
        {
            host.listeners = host.listeners.filter( (listener) =>
            {
                return listener.socketID !== socketId;
            })
        })

        return hosts;
    }

    public mostRecentlyScrobbledTrack(hostName: string): Track
    {
        return this.hosts[hostName].tracks[0];
    }
}