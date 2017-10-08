import { UserActivity } from "./../activities/Activities";
import { CentralDispatcher } from "./../State";
import { State } from "../State";
import { Parser } from "xml2js";
import { APICommunicator } from "./../api/APICommunicator";
import { APIActivity } from "../activities/Activities";
import { Action } from "../constants/Action";
import { IReducer } from "./IReducer";
import { ActivityCallback } from "../util/Callback";

export class APIReducer implements IReducer
{
	private apiCommunicator: APICommunicator;
	private XMLParser: Parser
	private centralDispatcher: CentralDispatcher;

	constructor(apiCommunicator: APICommunicator, centralDispatcher: CentralDispatcher)
	{
		this.apiCommunicator = apiCommunicator;
		this.XMLParser = new Parser();
		this.centralDispatcher = centralDispatcher;
	}

	public reduce(state: State, activity: APIActivity): State
	{
		const action = activity.action;
		const data = activity.data;

		console.log(action);

		switch (action)
		{
			case Action.ADD_TOKEN:
				state.tokens[data.username] = data.token;
				break;

			case Action.API_GET_SESSION:
				const newActivity = new APIActivity(Action.API_RECEIVED_SESSION_TOKEN);
				let sessionTokenCallback = ActivityCallback.bind(null, this.centralDispatcher, newActivity)
				this.apiCommunicator.sendRequest({ callback: sessionTokenCallback, method: "getSession", username: data.username, token: state.tokens[data.username] });
				break;

			case Action.API_RECEIVED_SESSION_TOKEN:
				this.XMLParser.parseString(data.response, (err: any, result: any) =>
				{
					state.sessionTokens[result.lfm.session[0].name] = result.lfm.session[0].key[0];
				});
				break;

			case Action.API_SCROBBLE_TRACK:
				this.apiCommunicator.initiateScrobbling(data.track, data.host, state.sessionTokens);
				break;

			case Action.API_GET_RECENT_TRACK:
				console.log("Trying to fetch recent tracks from hosts");
				for (let hostname in state.hosts)
				{
					const host = state.hosts[hostname];
					console.log("Sending for host:", host);
					const anotherNewActivity = new UserActivity(Action.API_RECEIVED_RECENT_TRACK);
					let callback = ActivityCallback.bind(null, this.centralDispatcher, anotherNewActivity, host)
					this.apiCommunicator.sendRequest({ callback: callback, method: "getRecentTracks", host: host.name });
				}
				break;
		}

		return state;
	}
}