import { ServerListener } from './ServerCommunicator';
import { ServerCaller   } from './ServerCommunicator'
import { viewTrackData  } from './DOMWorker'
import { viewParty      } from './DOMWorker'


let userToken = null;

/**
 * Initiates the component who listens for socket.io updates.
 * And some click-events.
 */
document.addEventListener('DOMContentLoaded',  () => {

    ServerListener(displayRecentTrack, onPartyUpdateCB, null);
    let connectButton = document.getElementById('connectButton');
    let authenticateButton = document.getElementById('authenticateButton');
    let authenticateField = document.getElementById('authenticateField');
    let scrobbleButton = document.getElementById('scrobbleButton');


    connectButton.addEventListener('click', () => {
        ServerCaller.getLatestTrack();
    });

    authenticateButton.addEventListener('click', () => {
        ServerCaller.authenticateUser(authenticateField.value, getParameterByName('token'));
    });

    scrobbleButton.addEventListener('click', () => {
        ServerCaller.scrobbleTrack();
    })

});


////////////////  CALLBACKS   ///////////////////

const getTokenCB = (data) => {
    userToken = data.token;
    console.log(data);
};

const authenticateUserCB = (data) => {
    console.log(data);
    //document.body.innerHTML = data;
}

const onPartyUpdateCB = (data) => {
    viewParty(data);
}

const displayRecentTrack = (track) => {
    viewTrackData(track.artist, track.name, track.image);
};


function getParameterByName(name) {
    var url = window.location.href;
    name = name.replace(/[\[\]]/g, "\\$&");
    var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if (!results) return null;
    if (!results[2]) return '';
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}

///////////////////////////////////////////////

