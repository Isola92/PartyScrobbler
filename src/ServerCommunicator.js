import io from 'socket.io-client';

let socket = io('https://partyscrobbler.herokuapp.com/', {'force new connection': true});

/**
 * Listens to a socket connection.
 * Fires callbacks to the index.js which updates the DOM and shit.
 */
export const ServerListener = (components) => {

    socket.on('recenttrack', (data) => {
        components.viewTrackData(data.track);
        components.viewParty(data.party);
    });

    socket.on('party', (data) => {

    });

    socket.on('host', (data) => {
        components.hostView();
    })
};

/**
 * Sends data through a socket connection.
 */
export const ServerCaller = {

    getLatestTrack: (text) => {
        socket.emit('recenttrack', null);
    },

    authenticateUser: (user, token, host) => {
        socket.emit('token', {user, token, host});
    },

    scrobbleTrack: () => {
        socket.emit('scrobbleTrack', null);
    },

    newHost: (hostname) => {
        socket.emit('host', hostname);
    },

    getParty: () => {
        socket.emit('party', '');
    }
};
