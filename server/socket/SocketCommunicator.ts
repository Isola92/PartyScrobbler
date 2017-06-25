import { CentralDispatcher, ServerActivity, Action } from './../State';
import * as http from "http";
import * as io from "socket.io";

export class SocketCommunicator
{
    private centralDispatcher: CentralDispatcher;
    private io: SocketIO.Server;

    constructor(centralDispatcher: CentralDispatcher, server: http.Server)
    {
        this.centralDispatcher = centralDispatcher;
        this.io = io(server);
        this.addSocketListeners();
    }

    private addSocketListeners(): void
    {
        /**
         * Server listening on a socket.
         * Currently only used to pass last.fm data to the client.
         */
        this.io.on('connection', (socket: SocketIO.Socket) =>
        {
            this.centralDispatcher.notify(new ServerActivity(Action.ADD_SOCKET_CLIENT, {socket: socket}))
        
            // register the user 
            socket.on('user', (data) =>
            {
                this.centralDispatcher.notify(new ServerActivity(Action.ADD_TOKEN, {username: data.user, token: data.token}));
                this.centralDispatcher.notify(new ServerActivity(Action.API_GET_SESSION, {username: data.user}));
                this.centralDispatcher.notify(new ServerActivity(Action.ADD_LISTENER, {listener: data.user, host: data.host, socket: socket.id}))
                this.centralDispatcher.notify(new ServerActivity(Action.PROVIDE_USERDATA, {hostname: data.host, socketid:socket.id, user: data.user}))
            });

            socket.on('host', (hostname) =>
            {
                this.centralDispatcher.notify(new ServerActivity(Action.ADD_HOST, {hostname: hostname, socketid: socket.id}));
                socket.emit('host', 'success');
            });

            socket.on('disconnect', () =>
            {
                this.centralDispatcher.notify(new ServerActivity(Action.DELETE_USER, {socketid: socket.id}));
            });

            socket.on('party', (hostname) =>
            {
                this.centralDispatcher.notify(new ServerActivity(Action.PROVIDE_PARTY, {hostname: hostname, socketid: socket.id}))
            });
        });
    }

    public sendData(socket, identifier, data)
    {
        socket.emit(identifier, data);
    }

    public sendToMultipleClients(sockets: SocketIO.Socket[], identifier, data)
    {
        sockets.forEach( (socket: SocketIO.Socket) =>
        {
            socket.emit(identifier, data);
        })
    }
}