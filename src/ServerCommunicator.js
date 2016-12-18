import io from 'socket.io-client';

let socket = io('192.168.0.190:3000/', {'force new connection': true});

/**
 * Listens to a socket connection.
 * Fires callbacks to the index.js which updates the DOM and shit.
 */
export const ServerListener = (onLatestTrack, onPartyUpdate, onNews) => {

    socket.on('recenttrack', (data) => {
        onLatestTrack(data);
    });


    socket.on('party', (data) => {
        onPartyUpdate(data);
    });

};


/**
 * Sends data through a socket connection.
 */
export const ServerCaller = {

    getLatestTrack: (text) => {
        socket.emit('recenttrack', null);
    },

    authenticateUser: (user, token) => {
        socket.emit('token', {user, token});
    },

    scrobbleTrack: () => {
        socket.emit('scrobbleTrack', null);
    }

}
