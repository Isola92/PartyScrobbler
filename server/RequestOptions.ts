/**
 * Methods responsible for returning the option object you pass to a node httprequest.
 */
export class RequestOptions
{
    private key: string;

    constructor(key)
    {
        this.key = key;
    }



    public getSessionOptions(signature, token)
    {

        return {
            host: 'ws.audioscrobbler.com',
            port: 80,
            path: '/2.0/?api_key=' + this.key + '&api_sig=' + signature + '&method=auth.getSession&token=' + token
        };
    };

    public getRecentTrackOptions(host)
    {
        return {
            host: 'ws.audioscrobbler.com',
            port: 80,
            path: '/2.0/?method=user.getrecenttracks&user=' + host + '&api_key=' + this.key + '&format=json&limit=20'
        };
    };

    public getScrobbleTrackOptions()
    {

        return {
            host:    'ws.audioscrobbler.com',
            port:    80,
            method:  'POST',
            path:    '/2.0/',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8'
            }
        }
    };
}