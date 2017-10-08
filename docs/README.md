# PartyScrobbler

* Another group listening tool for last.fm. 

* Fetches the last scrobbled track for a user and scrobbles that track for all other users in a party.

* The host is playing music as usual. The app is not scrobbling for the host.

## How do I start a party?

### Website 
Just visit https://partyscrobbler.herokuapp.com/, enter your username and you're good to go. 
Friends can now join your session by entering their username and the hostname on the same site.

## Functionality

### General stuff

* The server is powered by Express which deals with a few routes but it also uses socket.io for simple real time updates. 
* The client side code can be found in _src_ but is bundled together using Webpack and placed in the folder _public_. 
* The server gives the client access to the _public_ folder.

### How the scrobbling is implemented
1. A basic interval is running, making GET requests to the last.fm API every 15 seconds, checking if the hosts most recently scrobbled track is a new one. 

2. If a new one is found, it will be added to the server. 

3. The server then iterates over the registered users and makes one track.scrobble POST request to the last.fm API for every user.  

[Host the server yourself](SELFHOST.md)

