# PartyScrobbler

ANOTHER GROUP LISTENING TOOL FOR LAST.FM.

CREATED AS A WEB-APP BUT IS CURRENTLY DESIGNED TO RUN LOCALLY WITH YOUR FOLKS AT A LAN FOR EXAMPLE. 

How to scrobble: 

* You will need to run my web server on your computer to host a session. 
* My server is written with JavaScript so you need to download [node.js](https://nodejs.org/en/) (a neat JS engine that runs on your computer instead of browser).
* The server fetches the most recent track, one at a time, from a specific LAST.FM user which you provide as a parameter when you launch the application.
* Because of this the who is currently scrobbling should host the server.


## Start the server:

1. Download all the code here.
2. Start the command prompt where the folder is or navigate to the folder through the command prompt.
3. When you're in the right location, start the server by typing: node server.js _USERNAME_. _USERNAME_ is the username of the host.  
4. If everything is fine you should see something like: 
![screenshot](/readme/serverstart.png)
5. Find and share your ipv4 address by starting the command prompt and typing _ipconfig_. Should look something like this: 
![screenshot](/readme/ipconfig.png)


## Users on the same network can now visit the application:

1. Start your browser.
2. Enter _yourhostsipv4address:3000_ as URL.

###You need to confirm that this application is allowed to scrobble for you: 

1. Add _/authenticate_ to the url. 
2. You will be redirected to a last.fm page with a small description of the app.
3. Accept and you'll be redirected to the start page of the application.
4. Now enter your last.fm username into the textfield and press submit. 

## "WOW THATS JUST TOO MANY STEPS MAN" 

I know and I am currently working on reducing those.

The first major step would be to keep this application live somewhere and add functionality to choose a host, _in the client_. 

It's basically already doable but I feel like I need to catch more errors and add some security if it's actually gonna be live somewhere.






