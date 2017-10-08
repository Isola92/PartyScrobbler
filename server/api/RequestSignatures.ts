const crypto = require("crypto");

export class RequestSignatures
{
	private key: string;
	private secret: string;

	constructor(key: string, secret: string)
	{
		this.key = key;
		this.secret = secret;
	}

	public getSessionSignature(method: string, token: string): string
	{
		const API_KEY = this.key;
		const API_SECRET = this.secret;

		let secret =
			"api_key" +
			API_KEY +
			method +
			"token" +
			token +
			API_SECRET;

		return this.createHash(secret, "md5");
	};

	public getScrobbleSignature(config: any): string
	{
		const API_KEY = this.key;
		const API_SECRET = this.secret;

		let signature =
			"api_key" +
			API_KEY +
			"artist" +
			config.artist +
			config.method +
			"sk" +
			config.sessionkey +
			"timestamp" +
			config.timestamp +
			"track" +
			config.track +
			API_SECRET

		return this.createHash(signature, "md5");
	};

	private createHash(string: string, someGoodHash: string): string
	{
		return crypto.createHash(someGoodHash).update(string).digest("hex");
	};
}