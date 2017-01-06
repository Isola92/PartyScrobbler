import {ServerListener} from './ServerCommunicator';
import {ServerCaller} from './ServerCommunicator';
import {viewTrackData} from './DOMWorker';
import {viewParty} from './DOMWorker';
import Components from './Components'
import DomWorker from './DOMWorker';

let userToken = null;
let hostName = '';

/**
 * Initiates the component who listens for socket.io updates.
 * And some click-events.
 */
document.addEventListener('DOMContentLoaded', () =>{

    let domWorker = new DomWorker();
    let components = new Components(domWorker);
    ServerListener(components);

    if(getParameterByName('token')){
        components.mostRecentlyScrobbledSection();
        //Here we also need to pass the host.
        ServerCaller.authenticateUser(getParameterByName('username'), getParameterByName('token'), getParameterByName('host'));
    }else{
        components.startSection();
    }
});

/**
 * TOOK IT FROM THIS THREAD: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
 * HOW ARE CLIENT SIDE QUERYSTRINGS NOT A LANGUAGE FEATURE YET SMH.
 */
function getParameterByName(name){
    var url     = window.location.href;
    name        = name.replace(/[\[\]]/g, "\\$&");
    var regex   = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
        results = regex.exec(url);
    if(!results){
        return null;
    }
    if(!results[2]){
        return '';
    }
    return decodeURIComponent(results[2].replace(/\+/g, " "));
}