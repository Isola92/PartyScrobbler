import { CentralDispatcher } from "./../State";
import { ServerActivity, APIActivity, UserActivity, SocketActivity } from "../activities/Activities";
import { Action } from "../constants/Action";

import * as http from "http";
import * as io from "socket.io";

export class SocketCommunicator
{
	private centralDispatcher: CentralDispatcher;
	private io: SocketIO.Server;

	constructor(centralDispatcher: CentralDispatcher)
	{
		this.centralDispatcher = centralDispatcher;
	}

	public start(server: http.Server)
	{
		this.io = io(server);
		this.addSocketListeners();
	}

	private addSocketListeners(): void
	{
		/**
		 * Server listening on a socket.
		 * Currently only used to pass last.fm data to the client.
		 */
		this.io.on("connection", (socket: SocketIO.Socket) =>
		{
			this.centralDispatcher.notify(new SocketActivity(Action.ADD_SOCKET_CLIENT, { socket: socket }))

			// register the user 
			socket.on("user", (data: any) =>
			{
				this.centralDispatcher.notify(new APIActivity(Action.ADD_TOKEN, { username: data.user, token: data.token }));
				this.centralDispatcher.notify(new APIActivity(Action.API_GET_SESSION, { username: data.user }));
				this.centralDispatcher.notify(new UserActivity(Action.ADD_LISTENER, { listener: data.user, host: data.host, socket: socket.id }))
				this.centralDispatcher.notify(new SocketActivity(Action.PROVIDE_USERDATA, { hostname: data.host, socketid: socket.id, user: data.user }))
			});

			socket.on("host", (hostname: string) =>
			{
				this.centralDispatcher.notify(new UserActivity(Action.ADD_HOST, { hostname: hostname, socketid: socket.id }));
				socket.emit("host", hostname);
			});

			socket.on("disconnect", () =>
			{
				this.centralDispatcher.notify(new UserActivity(Action.DELETE_USER, { socketid: socket.id }));
			});

			socket.on("party", (hostname: string) =>
			{
				this.centralDispatcher.notify(new SocketActivity(Action.PROVIDE_PARTY, { hostname: hostname, socketid: socket.id }))
			});
		});
	}

	public sendData(socket: SocketIO.Socket, identifier: string, data: any)
	{
		socket.emit(identifier, data);
	}

	public sendToMultipleClients(sockets: SocketIO.Socket[], identifier: string, data: any)
	{
		sockets.forEach((socket: SocketIO.Socket) =>
		{
			socket.emit(identifier, data);
		})
	}
}