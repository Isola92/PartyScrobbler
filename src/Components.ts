import { ServerCaller } from './ServerCommunicator';
import { DomWorker } from './DOMWorker';

/**
 * This class uses DOMWorker utilities to generate HTML.
 * I created this library because I wanted a convenient way to add/remove
 * components on a single HTML-file without a SPA-framework dependencies.
 * It's pretty shitty but it's a good way for me to learn the DOM API.
 *
 * Todo: Move the element specific info such as type/id/text to JSON-objects.
 */

export class Components
{
    private wrapper: HTMLElement;
    private domWorker: DomWorker;

    constructor(domWorker: DomWorker)
    {
        this.wrapper = document.getElementById('wrapper');
        this.domWorker = domWorker;
    }

    public inputSection(token)
    {
        let section = document.createElement('section');

        let elements = this.domWorker.createElements(['input', 'button'], ['authenticateField', 'authenticateButton'], ['', 'Submit']);
        elements = this.domWorker.appendClassName(elements, 'input');

        this.domWorker.appendChildren(section, elements);

        //document.getElementById('wrapper').insertAfter(section, document.getElementByTagName('wrapper').firstChild);
        document.getElementById('wrapper').appendChild(section);

        let input = document.getElementById('authenticateField').textContent;

        elements[1].addEventListener('click', () =>
        {
            ServerCaller.authenticateUser(input, token);
        })
    };

    public startSection()
    {
        let section = document.createElement('section');
        section.id = 'startsection';
        let elements = this.domWorker.appendClassName(this.domWorker.createElements(['input', 'button', 'input', 'input', 'button'], null, ['', 'Host Party', '', '', 'Join Party']), 'input');
        this.domWorker.appendChildren(section, elements);
        this.wrapper.appendChild(section);

        elements[1].addEventListener('click', () =>
        {
            ServerCaller.newHost(elements[0].value);
        });

        elements[4].addEventListener('click', () =>
        {
            window.location.href += 'authenticate?username=' + elements[2].value + "&host=" + elements[3].value;
        });
    };

    public hostSection()
    {
        let elements = this.domWorker.createElements(
            ['section', 'input', 'button'],
            null, ['', 'hostname', "Host Party"],
            true
        );

        this.wrapper.appendChild(elements[0]);

        elements[0].id = 'hostSection';
        elements[1].placeholder = "Hostname";
        elements[2].addEventListener('click', () =>
        {
            ServerCaller.newHost(elements[1].value);
        });
    };

    public joinSection()
    {
        let elements = this.domWorker.createElements(
            ['section', 'input', 'input', 'button'],
            null, ['', '', '', 'Join Party'],
            true
        );

        this.wrapper.appendChild(elements[0]);

        elements[0].id = 'joinSection';
        elements[1].placeholder = "Username";
        elements[2].placeholder = "Hostname";
        elements[3].addEventListener('click', () =>
        {
            window.location.href += 'authenticate?username=' + elements[1].value + "&host=" + elements[2].value;
        });
    }

    public mostRecentlyScrobbledSection()
    {
        let elements = this.domWorker.createElements(
            ['section', 'h2', 'span', 'span', 'img'], ['', '', 'artist', 'track', 'image'], ['Most recently scrobbled track'],
            true);

        this.wrapper.appendChild(elements[0]);
    };

    public viewTrackData(track)
    {
        let artistname = document.getElementById('artist');
        let trackname = document.getElementById('track');

        artistname.innerHTML = track.artist + " - ";
        trackname.innerHTML = track.name;

        let image = document.getElementById('image') as HTMLImageElement;
        image.src = track.image;
    };

    public viewParty(users)
    {

        let element = document.getElementById('party');

        if (element)
        {
            this.wrapper.removeChild(element);
        }

        let party = this.domWorker.createElements(
            ['section', 'h2', 'ul'], ['party', '', 'partylist'], ['', 'Users in party', ''],
            true);

        if (users.length > 0)
        {
            users.forEach((user) =>
            {
                let listitem = document.createElement('LI');
                listitem.innerHTML = user;
                party[2].appendChild(listitem);
            });
        }
        else
        {
            party[1].innerHTML = 'Currently no users in your party!'
        }

        this.wrapper.appendChild(party[0]);
    };

    public hostView()
    {
        let joinsection = document.getElementById('joinSection');
        let hostsection = document.getElementById('hostSection');
        //let startview = document.getElementById('startsection');


        if (hostsection && joinsection)
        {
            this.wrapper.removeChild(hostsection);
            this.wrapper.removeChild(joinsection);
        }

        let hostview = this.domWorker.createElements(
            ['section', 'h2'], ['hostview', ''], ['', 'Now hosting a party!'],
            true);

        this.wrapper.appendChild(hostview[0]);

        this.mostRecentlyScrobbledSection();
        this.viewParty([]);
    };
}