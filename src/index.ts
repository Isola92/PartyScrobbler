import {ServerListener} from './ServerCommunicator';
import {ServerCaller} from './ServerCommunicator';
import {Components} from './Components'
import {DomWorker} from './DOMWorker';

let userToken = null;
let hostName = '';

export class Index
{
    public hostName: string;
    constructor()
    {
        /**
         * Initiates the component who listens for socket.io updates.
         * And some click-events.
         */


            let domWorker = new DomWorker();
            let components = new Components(domWorker);
            ServerListener(components);

            if (this.getParameterByName('token'))
            {
                components.mostRecentlyScrobbledSection();
                //Here we also need to pass the host.
                ServerCaller.authenticateUser(this.getParameterByName('username'), this.getParameterByName('token'), this.getParameterByName('host'));
                this.hostName = this.getParameterByName('host');

            }
            else
            {

                //Instead of initiating different components directly I could fire various events to a controller which initiates various views.
                components.hostSection();
                components.joinSection();
            }

        /*
        document.addEventListener('DOMContentLoaded', () =>
        {

            let domWorker = new DomWorker();
            let components = new Components(domWorker);
            ServerListener(components);

            if (this.getParameterByName('token'))
            {
                components.mostRecentlyScrobbledSection();
                //Here we also need to pass the host.
                ServerCaller.authenticateUser(this.getParameterByName('username'), this.getParameterByName('token'), this.getParameterByName('host'));
            }
            else
            {

                //Instead of initiating different components directly I could fire various events to a controller which initiates various views.
                components.hostSection();
                components.joinSection();
            }
        });
        */
    }


    /**
     * TOOK IT FROM THIS THREAD: http://stackoverflow.com/questions/901115/how-can-i-get-query-string-values-in-javascript
     * HOW ARE CLIENT SIDE QUERYSTRINGS NOT A LANGUAGE FEATURE YET SMH.
     */
    public getParameterByName(name)
    {
        var url = window.location.href;
        name = name.replace(/[\[\]]/g, "\\$&");
        var regex = new RegExp("[?&]" + name + "(=([^&#]*)|&|#|$)"),
            results = regex.exec(url);
        if (!results)
        {
            return null;
        }
        if (!results[2])
        {
            return '';
        }
        return decodeURIComponent(results[2].replace(/\+/g, " "));
    }
}