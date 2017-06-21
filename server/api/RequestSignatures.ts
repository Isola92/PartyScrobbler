const crypto = require('crypto');
//const API_SECRET = '446fdb19f81071345f7d2da22e327630';

export class RequestSignatures
{
    private key: string;
    private secret: string;

    constructor(key: string, secret:string)
    {
        this.key = key;
        this.secret = secret;
    }

    public getSessionSignature(method, token): string
    {
        const API_KEY = this.key;
        const API_SECRET = this.secret;

        let secret =
            'api_key' +
            API_KEY +
            method +
            'token' +
            token +
            API_SECRET;

        return this.createHash(secret, 'md5');
    };

    public getScrobbleSignature(config): string
    {
        const API_KEY = this.key;
        const API_SECRET = this.secret;

        let signature =
            'api_key' +
            API_KEY +
            'artist' +
            config.artist +
            config.method +
            'sk' +
            config.sessionkey +
            'timestamp' +
            config.timestamp +
            'track' +
            config.track +
            API_SECRET

        return this.createHash(signature, 'md5');
    };

    private createHash(string, someGoodHash): string
    {
        return crypto.createHash(someGoodHash).update(string).digest('hex');
    };
}