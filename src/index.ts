import { Listener } from './../server/models/Listener';
import {ServerListener} from './ServerCommunicator';
import {ServerCaller} from './ServerCommunicator';
import {Components} from './Components'
import {DomWorker} from './DOMWorker';

let userToken = null;
let hostName = '';

export class Index
{
    public hostName: string;
    private components: Components;
    private wrapper: HTMLElement;

    constructor()
    {
        let domWorker = new DomWorker();
        this.components = new Components(domWorker);
        this.wrapper = document.getElementById('wrapper');

        ServerListener(this.notify.bind(this));

        if (this.getParameterByName('token'))
        {
            ServerCaller.authenticateUser(this.getParameterByName('username'), this.getParameterByName('token'), this.getParameterByName('host'));
            this.hostName = this.getParameterByName('host');
        }
        else
        {
            this.updateNode('hostsection', this.components.hostSection());
            this.updateNode('joinsection', this.components.joinSection());
        }
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

    public notify(action: string, data: any)
    {
        switch(action)
        {
            case "recenttrack":
                this.updateNode("trackinfo", this.components.viewTrackData(data))
                break;

            case "party":
                this.updateNode("partysection", this.components.viewParty(data));
                break;

            case "host":
                this.updateNode("joinsection");
                this.updateNode("hostsection")
                this.updateNode("hostview", this.components.hostView(data));
                break;

            case "user":
                this.updateNode("hostview", this.components.hostView(data.host));
        }
    }

    private updateNode(id?: string, newNode?: DocumentFragment, parent?: string)
    {
        const parentNode = document.getElementById(parent) || this.wrapper;
        const oldNode = document.getElementById(id);

        if(!newNode && oldNode)
        {
            parentNode.removeChild(oldNode);
        }
        else if(oldNode)
        {
            parentNode.replaceChild(newNode, oldNode);
        }
        else
        {
            parentNode.appendChild(newNode);
        }

    }
}