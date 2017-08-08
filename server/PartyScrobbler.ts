import { State, CentralDispatcher, ServerActivity, Action } from './State';
import {Track} from "./models/Track";
import {Listener} from "./models/Listener";
import {Host} from "./models/Host";
import { HostContainer } from "./types/types";


/**
 * This class is responsible for dealing with users and trackdata.
 */
export class PartyScrobbler
{
    private centralDispatcher: CentralDispatcher;

    constructor(centralDispatcher: CentralDispatcher)
    {
        this.centralDispatcher = centralDispatcher;
    }

    /**
     * Compares scrobble data directly from the last.fm API with the state stored on the server.
     * @param latestLastFMTracks The 20 most recent tracks scrobbled by the host (from last.fm)
     * @returns {boolean} true if the track is not scrobbled yet.
     */
    private isNewTrack(latestLastFMTracks: Track[], localTracks: Track[]): boolean
    {
        const string1 = JSON.stringify(latestLastFMTracks[0]);
        const string2 = JSON.stringify(localTracks[0]);
        return string1 !== string2;
    }

    public addItem(trackdata: any, host: Host, hosts: HostContainer ): HostContainer
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

        return trackdata.recenttracks.track.map( (track: any) => 
        {
            return new Track(track.artist['#text'], track.name, track.album['#text'], track.image[2]["#text"]);
        });
    }

    /**
     * Add a new host, but if it already exists we update the socket id.
     * @param hostName 
     * @param socketId 
     */
    public addHost(hostName: string, socketId: number, hosts: HostContainer): HostContainer
    {
        if(!hosts[hostName])
        {
            hosts[hostName] = new Host(hostName, socketId);
            console.log("Successfully added a new host:", hosts[hostName]);
            this.centralDispatcher.notify(new ServerActivity(Action.ADD_HOST_RESPONSE, {hostname: hostName, socketid: socketId, existing: false}))
        }
        else
        {
            hosts[hostName].socketID = socketId;
            console.log("Host already exists");
            this.centralDispatcher.notify(new ServerActivity(Action.ADD_HOST_RESPONSE, {hostname: hostName, socketid: socketId, existing: true}))

        }

        return hosts;
    }

    /**
     * Adds a new listener to an array on a host object.
     * If the user already exists it's removed and then added again.
     */
    public addListener(userName: string, hostName: string, socketId: number, hosts: HostContainer): HostContainer
    {
        if(hosts[hostName])
        {
            hosts[hostName].listeners = hosts[hostName].listeners.filter((listener) =>
            {
                return listener.name !== userName;
            });

            hosts[hostName].listeners.push(new Listener(userName, socketId));
            console.log("A new listener has joined: Username: " + userName + ". Host: " + hostName);
            this.centralDispatcher.notify(new ServerActivity(Action.PROVIDE_PARTY, {hostname: hostName}))

        }

        return hosts;
    }

    public removeUser(socketId: number, hosts: HostContainer): HostContainer
    {
        // Filter out the disconnected host IF there is one.

        for(let host in hosts)
        {
            if(hosts[host].socketID === socketId)
            {
                delete hosts[host];
                return hosts;
            }
            else
            {
                hosts[host].listeners = hosts[host].listeners.filter( (listener) =>
                {
                    return listener.socketID !== socketId;
                })
            }
        }

        return hosts;
    }
}