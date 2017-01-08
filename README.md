# PartyScrobbler

## ANOTHER GROUP LISTENING TOOL FOR LAST.FM. 

## FETCHES THE LAST SCROBBLED TRACK FOR A USER (HOST) AND SCROBBLES THAT TRACK FOR ALL OTHER USERS IN A PARTY.

## CHECK RELEASE BRANCH FOR THE LATEST CODE, WHICH IS RUNNING THE HOSTED VERSION

## How do I start a party?

### Website 
Just visit https://partyscrobbler.herokuapp.com/, enter your username and you're good to go. 
Friends can now join your session by entering their username and the hostname on the same site.

### Host the server yourself: 

* You will need to run my web server on your computer to host a session. 
* My server is written with JavaScript so you need to download [node.js](https://nodejs.org/en/) (a neat JS engine that runs on your computer instead of browser).
* The server fetches the most recent track, one at a time, from a specific LAST.FM user which you provide as a parameter when you launch the application.
* Because of this the who is currently scrobbling should host the server.

#### Start the server:

1. Download the code from the master branch. Might need some modifications to work.
2. Start the command prompt where the folder is or navigate to the folder through the command prompt.
3. When you're in the right location, start the server by typing: node server.js _USERNAME_. _USERNAME_ is the username of the host.  
4. If everything is fine you should see something like: 
![screenshot](/readme/serverstart.png)
5. Find and share your ipv4 address by starting the command prompt and typing _ipconfig_. Should look something like this: 
![screenshot](/readme/ipconfig.png)


#### Users on the same network can now visit the application:

1. Start your browser.
2. Enter _yourhostsipv4address:3000_ as URL.

#### You need to confirm that this application is allowed to scrobble for you: 

1. Add _/authenticate_ to the url. 
2. You will be redirected to a last.fm page with a small description of the app.
3. Accept and you'll be redirected to the start page of the application.
4. Now enter your last.fm username into the textfield and press submit. 
5. The server adds your name and your token to a list. 
6. You will now be included when the next track scrobbles.

#### "WOW THATS JUST TOO MANY STEPS MAN" 

I know! Just use the hosted version. I added this readme before I decided to make the server accept multiple hosts. 

## Functionality

### General stuff

* The server is powered by Express which deals with a few routes but it also uses socket.io for simple real time updates. 
* The client side code can be found in _src_ but is bundled together using Webpack and placed in the folder _public_. 
* The server gives the client access to the _public_ folder.

### How the scrobbling is implemented
1 A basic interval is running, making GET requests to the last.fm API every 15 seconds, checking if the hosts most recently scrobbled track is a new one. 

2 If a new one is found, it will be added to the server. 

3 The server then iterates over the registered users and makes one track.scrobble POST request to the last.fm API for every user.  







