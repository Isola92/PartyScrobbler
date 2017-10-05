import { Host } from './../models/Host';
import { PartyScrobbler } from './../PartyScrobbler';
import { State } from './../State';
import { UserActivity} from './../activities/Activities';
import { IReducer } from './IReducer';
import { Action } from "../constants/Action";

export class UserReducer implements IReducer
{
    private partyScrobbler: PartyScrobbler;

    constructor(partyScrobbler: PartyScrobbler)
    {
        this.partyScrobbler = partyScrobbler;
    }
    
    reduce(state: State, activity: UserActivity): State
    {
        const action = activity.action;
        const data = activity.data;

        console.log(action);

        switch(action)
        {
            case Action.ADD_HOST:
                state.hosts = this.partyScrobbler.addHost(data.hostname, data.socketid, state.hosts);
                break;

            case Action.ADD_LISTENER:
                state.hosts = this.partyScrobbler.addListener(data.listener, data.host, data.socket, state.hosts);
                break;

            case Action.DELETE_USER:
                delete state.clients[data.socketid];
                state.hosts = this.partyScrobbler.removeUser(data.socketid, state.hosts);
                break;

            case Action.API_RECEIVED_RECENT_TRACK:
                state.hosts = this.partyScrobbler.addItem(data.response, data.data as Host, state.hosts);
                break;
        }

        return state;
    }
}