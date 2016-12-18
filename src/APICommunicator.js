/*
var APICommunicator = {

    key: '97d8df455562c0d76c030980d96742e8',
    token: '',
    signature: 'api_key' + this.key + 'methodauth.getSessiontoken' + this.token,

    scrobbleTrack: function(callback){

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "POST", 'http://ws.audioscrobbler.com/2.0/?method=track.scrobble&user=HugePackage&api_key=' + this.key + '&format=json', true); // false for synchronous request
        xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*");
        xmlHttp.send( null );

        xmlHttp.onload = function(){
            callback(this.response);
        };

        xmlHttp.onerror = function () {
            reject(this.statusText);
        };
    },

    getToken: function(callback){

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", 'http://ws.audioscrobbler.com/2.0/?method=auth.gettoken&api_key=' + this.key + '&format=json', true); // false for synchronous request
        xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*");
        xmlHttp.send( null );

        xmlHttp.onload = function(){
            callback(this.response);
        };

        xmlHttp.onerror = function () {
            callback(this.statusText);
        };
    },

    authenticateUser: function(callback){

        var xmlHttp = new XMLHttpRequest();
        xmlHttp.open( "GET", 'https://crossorigin.me/https://www.last.fm/api/auth/?api_key=' + this.key, true); // false for synchronous request
        //xmlHttp.setRequestHeader("Access-Control-Allow-Origin", "*");
        xmlHttp.send( null );

        xmlHttp.onload = function(){
            callback(this.response);
        };

        xmlHttp.onerror = function () {
            callback(this.statusText);
        };
    }
}

export default APICommunicator;
*/
