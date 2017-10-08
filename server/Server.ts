import { CentralDispatcher } from "./State";
import { Action } from "./constants/Action";
import { SocketActivity } from "./activities/Activities";
import { callback, basicLogCallback } from "./util/Callback";
import { Listener } from "./models/Listener";
import * as url from "url";
import * as express from "express";
import * as http from "http";
import * as path from "path";
import { ClientRequest } from "http";

/**
 * Methods related to dealing with requests from the client.
 * Requests from the client comes in two forms:
 * 1. Regular http-requests (urls).
 * 2. Data from a socket connection between the client and the server.
 * 
 * Only regular http-requests are dealt with here.
 */
export class Server
{
	private local: string = "http://localhost:5000";
	private official: string = "https://partyscrobbler.herokuapp.com/";
	private adress: string = this.local;
	private PORT = process.env.PORT || 5000;
	private app: any;
	private server: http.Server;
	private centralDispatcher: CentralDispatcher;

	constructor(centralDispatcher: CentralDispatcher)
	{
		this.centralDispatcher = centralDispatcher;
		this.app = express();
		this.app.use(express.static(path.join(__dirname, "../", "public")));
		this.server = http.createServer(this.app);
		this.server.listen(this.PORT, () => console.log("Server listening on:", this.adress));
		this.centralDispatcher.notify(new SocketActivity(Action.START_SOCKETS, { server: this.server }));
		this.declareRoutes();
	}

	private declareRoutes(): void
	{
		// Client requesting the start-page.
		this.app.get("/", (req: express.Request, res: express.Response) =>
		{
			console.log(__dirname + "/public/html/projects.html")
			//res.sendFile(__dirname + "/index.html");
			res.sendFile(path.join(__dirname, "../", "public", "html/index.html"));
		});

		// Client requesting authentication.
		this.app.get("/authenticate", (req: express.Request, res: express.Response) =>
		{
			let queryData = url.parse(req.url, true).query;
			res.redirect("https://www.last.fm/api/auth/?api_key=a05b8d216b62ceec197a37a8b9f11f20&cb=" + this.adress + "/" + "?username=" + queryData.username + "%26host=" + queryData.host);
		});
	}
}