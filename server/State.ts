import { APICommunicator } from './api/APICommunicator';
import { Server } from './../server';
import { PartyScrobbler } from './PartyScrobbler';
import { Host } from "./models/Host";
import { Listener } from "./models/Listener";
import { callback, ActivityCallback } from "./util/Callback";
import { SocketCommunicator } from "./socket/SocketCommunicator";

export class State
{
    public API_KEY: string;
    public API_SECRET: string;
    public hosts: Host[]; // {hostName: Host} 
    public listeners: Listener[] //Each host has an array with listeners.  
    public tokens: any[]; // {userName: token}
    public clients: any[]; // {socketId: socket}
    public sessionTokens = []; // {session.name: session.key}

    constructor()
    {
        this.hosts = [];
        this.listeners = [];
        this.tokens = [];
        this.clients = [];
        this.sessionTokens = [];
    }
}

/**
 * When a class has a request that requires some state 
 * it will instantiate a notification which goes to the reducer.
 * Provide a string or number to be able to identify the specific action defined in the reduce method.
 */
export class ServerActivity
{
    public action: Action;
    public data: any;

    constructor(action, data?)
    {
        this.action = action;
        this.data = data;    
    }
}

/**
 * Start using these for socket identifiers as well. 
 * Can be shared between client and server.
 */
export enum Action
{
    // General actions
    ADD_HOST = "ADD_HOST",
    ADD_LISTENER = "ADD_LISTENER",
    DELETE_USER = "DELETE_USER",
    GET_RECENT_TRACKS = "GET_RECENT_TRACKS",
    ADD_TOKEN = "ADD_TOKEN",

    // Last.fm API actions
    API_GET_SESSION = "GET_SESSION",
    API_GET_RECENT_TRACK = "API_GET_RECENT_TRACK",
    API_RECEIVED_RECENT_TRACK = "API_RECEIVED_RECENT_TRACK",
    API_SCROBBLE_TRACK = "API_SCROBBLE_TRACK",

    // Socket actions
    EMIT_PARTY = "EMIT_PARTY",
    START_SOCKETS = "START_SOCKETS",
    ADD_SOCKET_CLIENT = "ADD_SOCKET_CLIENT",
    PROVIDE_PARTY = "PROVIDE_PARTY",
    PROVIDE_LATEST_TRACK = "PROVIDE_LATEST_TRACK",
    PROVIDE_USERDATA = "PROVIDE_USERDATA"
}

/**
 * This class is responsible for storing most of the application state.
 * Communication outwards should go through the reducer. 
 * Classes should not reach for state, but create public getters if necessary.  
 */
export class CentralDispatcher
{
    private state: State;
    private server: Server;
    private partyScrobbler: PartyScrobbler;
    private apiCommunicator: APICommunicator;
    private socketCommunicator: SocketCommunicator;

    constructor(state: State)
    {
        this.state = state;
        this.server = new Server(this);
        this.apiCommunicator = new APICommunicator(process.argv[2], process.argv[3]);
        this.partyScrobbler  = new PartyScrobbler(this);

        setInterval( () =>
        {
            this.notify(new ServerActivity(Action.API_GET_RECENT_TRACK));
            this.notify(new ServerActivity(Action.PROVIDE_LATEST_TRACK));

        }, 15000)
    }

    /**
     * @param notification 
     */
    public notify(activity: ServerActivity)
    {
        this.state = this.reduce(this.state, activity)
    }

    /**
     * This method is allowed to call other components functions. 
     * If the function needs any state it will be come from here. The function will return the modified state. 
     */
    private reduce(state: State, activity: ServerActivity): State
    {
        const action = activity.action;
        const data = activity.data;

        console.log(action);

        switch(action)
        {
            case Action.ADD_HOST:
                state.hosts = this.partyScrobbler.addHost(data.hostname, data.socketid, state.hosts);
                break;

            case Action.ADD_TOKEN:
                state.tokens = this.apiCommunicator.addToken(data.username, data.token);
                break;

            case Action.API_GET_SESSION:
                // TODO: New callback solution..
                // Implement a callback that dispatches an action instead.
                let callbackz = callback.bind(this.apiCommunicator, this.apiCommunicator.addItem);
                this.apiCommunicator.sendRequest(callbackz, 'getSession', data.username);
                break;

            case Action.API_GET_RECENT_TRACK:
                console.log("Trying to fetch recent tracks from hosts");
                for(let hostname in state.hosts)
                {
                    const host = state.hosts[hostname];
                    console.log("Sending for host:", host);
                    let callback = ActivityCallback.bind(null, this, Action.API_RECEIVED_RECENT_TRACK, host)
                    this.apiCommunicator.sendRequest(callback, 'getRecentTracks', null, null, host.name);
                }
                break;

            case Action.API_RECEIVED_RECENT_TRACK:
                state.hosts = this.partyScrobbler.addItem(data.response, data.data as Host, state.hosts);
                // Make the 
                break;

            case Action.API_SCROBBLE_TRACK: 
                this.apiCommunicator.initiateScrobbling(data.track, data.host);
                break;

            case Action.ADD_LISTENER:
                state.hosts = this.partyScrobbler.addListener(data.listener, data.host, data.socket, state.hosts);
                break;

            case Action.START_SOCKETS:
                this.socketCommunicator = new SocketCommunicator(this, data.server);
                break;

            case Action.ADD_SOCKET_CLIENT:
                state.clients[data.socket.id] = data.socket;
                break;

            case Action.PROVIDE_PARTY:
                const socket = state.clients[data.socketid];
                const partyMembers = state.hosts[data.hostname].listeners.map( (listener) => listener.name);
                this.socketCommunicator.sendData(socket, 'party', partyMembers);
                break;

            case Action.PROVIDE_USERDATA:
                const host = state.hosts[data.hostname];
                const socketz = state.clients[data.socketid];
                const listener = host.listeners.filter( (listener: Listener) => listener.socketID === data.socketid);
                this.socketCommunicator.sendData(socketz, 'user', listener)

            case Action.PROVIDE_LATEST_TRACK:
                for(var hostname in state.hosts)
                {
                    const host = state.hosts[hostname];
                    [host, ...host.listeners].forEach ( (user) =>
                    {
                        console.log("Sending recent track to user", user);
                        this.socketCommunicator.sendData(state.clients[user.socketID], 'recenttrack', host.tracks[0]);
                    })
                }

                break;

            case Action.DELETE_USER:
                delete state.clients[data.socketid];
                this.partyScrobbler.removeUser(data.socketid);
                break;
        }

        return state;
    }
}

new CentralDispatcher(new State());