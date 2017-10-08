import { Listener } from "./../server/models/Listener";
import { ServerListener } from "./ServerCommunicator";
import { ServerCaller } from "./ServerCommunicator";
import { Components } from "./Components"
import { DomWorker } from "./DOMWorker";

let userToken = null;
let hostName = "";

export class Index
{
	public hostName: string;
	private components: Components;
	private wrapper: HTMLElement;
	private domWorker: DomWorker;

	constructor()
	{
		this.domWorker = new DomWorker();
		this.components = new Components(this.domWorker);
		this.wrapper = document.getElementById("wrapper");

		ServerListener(this.notify.bind(this));

		// Could check for stored cookie here as well.
		if (this.domWorker.queryString("token"))
		{
			ServerCaller.authenticateUser(this.domWorker.queryString("username"), this.domWorker.queryString("token"), this.domWorker.queryString("host"));
			this.hostName = this.domWorker.queryString("host");
		}
		else
		{
			this.domWorker.addNode("hostsection", this.components.hostSection(), this.wrapper.id);
			this.domWorker.addNode("joinsection", this.components.joinSection(), this.wrapper.id);
		}
	}

	public notify(action: string, data: any)
	{
		switch (action)
		{
			case "recenttrack":
				if (data)
				{
					this.domWorker.addNode("trackinfo", this.components.viewTrackData(data), this.wrapper.id);
					this.domWorker.removeNode("loadingindicator", this.wrapper.id);
				}

				break;

			case "party":
				this.domWorker.addNode("partysection", this.components.viewParty(data), this.wrapper.id);
				break;

			case "host":
				this.domWorker.removeNode("joinsection", this.wrapper.id);
				this.domWorker.removeNode("hostsection", this.wrapper.id);
				this.domWorker.addNode("hostview", this.components.hostView(data), this.wrapper.id);
				this.domWorker.addNode("loadingindicator", this.components.loadingIndicator(), this.wrapper.id);
				break;

			case "user":
				this.domWorker.addNode("hostview", this.components.hostView(data.host), this.wrapper.id);
		}
	}

}