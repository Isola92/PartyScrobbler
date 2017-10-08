import { Listener } from "./../models/Listener";
import { SocketCommunicator } from "./../socket/SocketCommunicator";
import { SocketActivity } from "./../activities/Activities";
import { IReducer } from "./IReducer";
import { State } from "../State";
import { Action } from "../constants/Action";

export class SocketReducer implements IReducer
{
	private socketCommunicator: SocketCommunicator;

	constructor(socketCommunicator: SocketCommunicator)
	{
		this.socketCommunicator = socketCommunicator;
	}

	reduce(state: State, activity: SocketActivity): State
	{
		const action = activity.action;
		const data = activity.data;

		console.log(action);

		switch (action)
		{
			case Action.START_SOCKETS:
				this.socketCommunicator.start(data.server);
				break;

			case Action.ADD_SOCKET_CLIENT:
				state.clients[data.socket.id] = data.socket;
				break;

			case Action.PROVIDE_PARTY:
				const partyMembers = state.hosts[data.hostname].listeners.map((listener) => listener.name);
				const socketIds = [state.hosts[data.hostname].listeners.map((listener) => listener.socketID), state.hosts[data.hostname].socketID];
				const sockets = socketIds.map((socketId: number) => state.clients[socketId]);
				this.socketCommunicator.sendToMultipleClients(sockets, "party", partyMembers);
				break;

			case Action.PROVIDE_USERDATA:
				const host = state.hosts[data.hostname];
				const socketz = state.clients[data.socketid];
				const listener = host.listeners.filter((listener: Listener) => listener.socketID === data.socketid);
				this.socketCommunicator.sendData(socketz, "user", { listener: listener, host: data.hostname });

			case Action.PROVIDE_LATEST_TRACK:
				for (var hostname in state.hosts)
				{
					const host = state.hosts[hostname];
					[host, ...host.listeners].forEach((user) =>
					{
						console.log("Sending recent track to user", user);
						this.socketCommunicator.sendData(state.clients[user.socketID], "recenttrack", host.tracks[0]);
					})
				}

				break;

			case Action.ADD_HOST_RESPONSE:
				this.socketCommunicator.sendData(state.clients[data.socketid], "host", data.hostname);
				break;
		}

		return state;
	}
}