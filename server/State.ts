import { APIReducer } from './reducers/APIReducer';
import { UserReducer } from './reducers/UserReducer';
import { SocketReducer } from './reducers/SocketReducer';
import { IReducer } from './reducers/IReducer';
import { APICommunicator } from "./api/APICommunicator";
import { Server } from "./Server";
import { PartyScrobbler } from './PartyScrobbler';
import { Host } from "./models/Host";
import { Listener } from "./models/Listener";
import { callback, ActivityCallback } from "./util/Callback";
import { SocketCommunicator } from "./socket/SocketCommunicator";
import { HostContainer } from "./types/types";
import { Parser } from "xml2js";
import { Action, ActionType } from "./constants/Action";
import {ServerActivity, APIActivity, UserActivity, SocketActivity} from "./activities/Activities";

export class State
{
    public hosts: HostContainer
    public tokens: {[username: string]: string}; // {userName: token}
    public clients: {[socketId: number]: SocketIO.Socket}; // {socketId: socket}
    public sessionTokens: {[username: string]: string}; // {session.name: session.key}

    constructor()
    {
        this.clients = {};
        this.hosts = {};
        this.tokens = {};
        this.sessionTokens = {}
    }
}

/**
 * This class is responsible for storing most of the application state.
 * Communication outwards should go through the reducer. 
 * Classes should not reach for state, instead they dispatch an action which trigger response with state.
 */
export class CentralDispatcher
{
    private state: State;
    private server: Server;
    private partyScrobbler: PartyScrobbler;
    private apiCommunicator: APICommunicator;
    private socketCommunicator: SocketCommunicator;
    private reducers: {[actionType: number]: IReducer};
    
    constructor(state: State)
    {
        this.state = state;
        this.reducers = 
        {
            [ActionType.SOCKET]: new SocketReducer(new SocketCommunicator(this)), 
            [ActionType.USER]: new UserReducer(new PartyScrobbler(this)), 
            [ActionType.API]: new APIReducer(new APICommunicator(process.argv[2], process.argv[3]), this)
        };

        this.server = new Server(this);
    
        setInterval( () =>
        {
            this.notify(new APIActivity(Action.API_GET_RECENT_TRACK));
            this.notify(new SocketActivity(Action.PROVIDE_LATEST_TRACK));
        }, 15000)
    }

    /**
     * @param notification 
     */
    public notify(activity: ServerActivity)
    {
        this.state = this.reducers[activity.actionType].reduce(this.state, activity)
    }
}

new CentralDispatcher(new State());