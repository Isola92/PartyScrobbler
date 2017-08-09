import * as io from 'socket.io-client';

let localhost =  'http://localhost:5000/';
let officialhost = 'https://partyscrobbler.herokuapp.com/';
let socket = io(localhost, {'forceNew': true});

/**
 * Listens to a socket connection.
 * Fires callbacks to the index.js which updates the DOM and shit.
 */
export const ServerListener = (callback) => {

    function log(data)
    {
        console.log("Received data from the server through socket.io: ", data);
    }

    socket.on('recenttrack', (data) => {
        callback('recenttrack', data)
        
        //components.viewTrackData(data);
        //ServerCaller.getParty("HugePackage")
        //components.viewParty(data.party);
        log(data);
    });

    socket.on('party', (data) => {
        callback('party', data)
        //components.viewParty(data);
        log(data);
    });

    socket.on('host', (hostname) => {
        callback('host', hostname)
        //components.hostView(hostname);
        log(hostname);
    });

    socket.on('user', (data) =>
    {
        log("User: " +  data);
        callback('user', data);
    })
};

/**
 * Sends data through a socket connection.
 */
export const ServerCaller = {

    getLatestTrack: (text) => {
        socket.emit('recenttrack', null);
    },

    authenticateUser: (user, token, host?) => {
        socket.emit('user', {user: user, token:token, host: host});
    },

    scrobbleTrack: () => {
        socket.emit('scrobbleTrack', null);
    },

    newHost: (hostname) => {
        socket.emit('host', hostname);
    },

    getParty: (hostname: string) => {
        socket.emit('party', hostname);
    }
};
