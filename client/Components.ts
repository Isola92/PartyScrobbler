import { ServerCaller } from "./ServerCommunicator";
import { DomWorker } from "./DOMWorker";

/**
 * This class uses DOMWorker utilities to generate HTML.
 * I created this library because I wanted a convenient way to add/remove
 * components on a single HTML-file without a SPA-framework dependencies.
 * It"s pretty shitty but it"s a good way for me to learn the DOM API.
 *
 * Todo: Move the element specific info such as type/id/text to JSON-objects.
 */

/**
 * With templating literals the current solution is obsolete. 
 * Each component method should take in any numbert of parameters (can be other components)
 * and return a string. A component should have no dependency on another component. 
 * 
 * ServerCommunicator will notify some other (new or index.ts) class which is responsible for sorting out
 * which components should be rendered.
 */

export class Components
{
	private wrapper: HTMLElement;
	private domWorker: DomWorker;

	constructor(domWorker: DomWorker)
	{
		this.wrapper = document.getElementById("wrapper");
		this.domWorker = domWorker;
	}

	public hostSection(): DocumentFragment
	{
		const DOM = `
                <section id="hostsection">
                    <h2>Host Party</h2>
                    <input type="text" id="hostnamehost" placeholder="Hostname"/>
                    <button id="hostbutton">Submit</button>
                </section>
            `

		const documentFragment: DocumentFragment = this.generateDOMFragment(DOM);

		documentFragment.querySelector("#hostbutton").addEventListener("click", () =>
		{
			const host = (document.getElementById("hostnamehost") as HTMLInputElement).value;
			ServerCaller.newHost(host);
		})

		return documentFragment;
	}

	public joinSection(): DocumentFragment
	{
		const DOM = `
                <section id="joinsection">
                    <h2>Join Party</h2>
                    <input type="text" id="usernamejoin" placeholder="Username" />
                    <input type="text" id="hostnamejoin" placeholder="Hostname" />
                    <button id="joinbutton">Submit</button>
                </section>
            `

		const documentFragment = this.generateDOMFragment(DOM);

		documentFragment.querySelector("#joinbutton").addEventListener("click", () =>
		{
			const username: string = (document.getElementById("usernamejoin") as HTMLInputElement).value;
			const hostname: string = (document.getElementById("hostnamejoin") as HTMLInputElement).value;
			window.location.href = "/authenticate?username=" + username + "&host=" + hostname;

		})

		return documentFragment;
	}

	public viewTrackData(track): DocumentFragment
	{
		let DOM = ``;

		if (track)
		{
			DOM = `
                <section id="trackinfo">
                    <h2>Latest Track</h2>
                    <p id="artistname">Artist: ${track.artist}</p>
                    <p id="trackname">Track: ${track.name}</p>
                    <p id="albumname">Album: ${track.album}</p>
                    <img id="image" src=${track.image}/>
                </section>
                `
		}

		return this.generateDOMFragment(DOM);
	};

	public viewParty(users): DocumentFragment
	{
		const listeners: string = users.reduce((prev: string, next: string) =>
		{
			return prev += `<li>${next}</li>`;
		})

		const DOM = `
		<section id="partysection">
			<h2>Listeners</h2>
			<ul id="partylist">
				${listeners}
			<ul>
		</section>
        `

		return this.generateDOMFragment(DOM);
	};

	public infoSection(): DocumentFragment
	{
		const DOM = `
        <section id="infosection">
            <p>Don"t keep all them scrobbles to yourself. Share them with your friends with this tool!</p>
            <p>As a polite host you should create a party to sync your current listening activity with your friends.</p>
        </section>
        `

		return this.generateDOMFragment(DOM);
	}

	public hostView(hostname: string): DocumentFragment
	{
		const DOM = `
		<section id="hostview">
			<h2>Host</h2>
			<span id="hostname">${hostname}</span>
		</section>
        `

		return this.generateDOMFragment(DOM);
	}

	public loadingIndicator(): DocumentFragment
	{
		const DOM = `
		<div id="loadingindicator">
		<span>Waiting for data...</span>
			<div class="sk-wave">
				<div class="sk-rect sk-rect1"></div>
				<div class="sk-rect sk-rect2"></div>
				<div class="sk-rect sk-rect3"></div>
				<div class="sk-rect sk-rect4"></div>
				<div class="sk-rect sk-rect5"></div>
			</div>
		</div>
		`

		return this.generateDOMFragment(DOM);
	}

	private generateDOMFragment(HTMLString: string): DocumentFragment
	{
		const range = document.createRange();
		return range.createContextualFragment(HTMLString);
	}
}