let APICommunicator = require('../server/api/APICommunicator');
let PartyScrobbler = require('.././server/PartyScrobbler.js');
let assert = require('assert');

describe('PartyScrobbler', function()
{
    let partyScrobbler;
    let apiCommunicator;

    beforeEach( function()
    {
        apiCommunicator = new APICommunicator.APICommunicator();
        partyScrobbler = new PartyScrobbler.PartyScrobbler(apiCommunicator);
    })

    describe('addHost', function()
    {
        it('should add new hosts', function()
        {
            partyScrobbler.addHost('HugePackage', '1');
            assert.equal(Object.keys(partyScrobbler.hosts).length, 1);
            partyScrobbler.addHost('vikben', '2');
            assert.equal(Object.keys(partyScrobbler.hosts).length, 2);
        });

        it('should not allow the same host to be added multiple times', function()
        {
            partyScrobbler.addHost('HugePackage', '1');
            partyScrobbler.addHost('HugePackage', '3');
            assert.equal(Object.keys(partyScrobbler.hosts).length, 1);
            assert.equal(partyScrobbler.hosts['HugePackage'].socketID, '3');
        });
    });

    describe('addListener', function()
    {
        it('should not add the same listener multiple times.', function()
        {
            partyScrobbler.addHost('HugePackage', 1);
            partyScrobbler.addListener('vikben', 'HugePackage', 2);
            partyScrobbler.addListener('vikben', 'HugePackage', 2);
            assert.equal(partyScrobbler.hosts['HugePackage'].listeners.length, 1);
        });

        it('should not add listener without host.', function()
        {
            partyScrobbler.addListener('vikben', 'HugePackage', 2);
            assert.equal(partyScrobbler.hosts['HugePackage'], undefined);
        });

        it('should add multiple different listeners', function()
        {
            partyScrobbler.addHost('HugePackage', 0);
            partyScrobbler.addListener('vikben1', 'HugePackage', 1);
            partyScrobbler.addListener('vikben2', 'HugePackage', 2);
            partyScrobbler.addListener('vikben3', 'HugePackage', 3);
            assert.equal(partyScrobbler.hosts['HugePackage'].listeners.length, 3);
        })

    });

    describe('removeUser', function()
    {
        it('should remove a listener', function()
        {
            partyScrobbler.addHost('HugePackage', 0);
            partyScrobbler.addListener('vikben1', 'HugePackage', 1);
            partyScrobbler.removeUser(1);
            assert.equal(partyScrobbler.hosts['HugePackage'].listeners.length, 0);
        });

        it('should remove a host', function()
        {
            partyScrobbler.addHost('HugePackage', 0);
            partyScrobbler.removeUser(0);
            assert.equal(partyScrobbler.hosts.length, 0);
        })
    })

    describe('getUserFromClientId', function()
    {
        it('should return the host associated with the ', function()
        {
            partyScrobbler.addHost('Host1', 5);
            partyScrobbler.addHost('Host2', 10)
            assert.equal(partyScrobbler.getUserFromClientId(5).hostname, 'Host1');
            assert.equal(partyScrobbler.getUserFromClientId(10).hostname, 'Host2');
        });

        it('multipleusers', () => {
            partyScrobbler.addHost('Host', 5);
            let usernames = ['HugePackage', 'vikben', 'herrpadda', 'felstavarn', 'mandieboo'];

            usernames.forEach( (username, index) => {
                partyScrobbler.addListener(username, 'Host', index);
            });

            usernames.forEach( (username, index) => {
                assert.equal(partyScrobbler.getUserFromClientId(index).username, username)
            })
        });

        it('removeusers', () => {
            partyScrobbler.addHost('Host1', 5);
            partyScrobbler.addListener('Listener1', 'Host1', 10);
            assert.equal(partyScrobbler.getUserFromClientId(5).hostname, 'Host1');
            assert.equal(partyScrobbler.getUserFromClientId(10).username, 'Listener1');
            partyScrobbler.removeUser(10);
            assert.equal(partyScrobbler.getUserFromClientId(10), undefined);
        })
    });

    describe('shouldWeAddTrack', function() {

        const tracks = [
            {artist: 'Bob Dylan', track: 'Lay Lady Lay' , album: 'Some album'}, 
            {artist: 'Ulver', track: 'Bergtatt ind i fjellkamre, ', album: 'Bergtatt'},
            {artist: 'Pail Saints', track: 'When the derp took a derp', album: 'classicshoegaze'},
            {artist: 'My Bloody Valentine', track: 'Sometimes', album: 'Loveless'},
            {artist: 'Ulf Lundell', track: 'Den Vassa Eggen', album: 'Den Vassa Eggen'}
        ];

        const hostname = 'HugePackage';

        it('should return false when length varies between last fm data and server state', function() {
            partyScrobbler.addHost(hostname, 1);
            assert.equal(partyScrobbler.shouldWeAddTrack(tracks, hostname), false);
        });

        it('should return true when a track differs', function()
        {
            partyScrobbler.addHost(hostname, 1);
            const recentTracks = [tracks[0], tracks[1]];
            const localTracks = [tracks[0], tracks[2]];
            assert.equal(partyScrobbler.shouldWeAddTrack(recentTracks, localTracks), true);
        })

        it('should return false when tracks dont differ', function()
        {
            partyScrobbler.addHost(hostname, 1);
            const recentTracks = [tracks[0], tracks[1]];
            assert.equal(partyScrobbler.shouldWeAddTrack(recentTracks, recentTracks), false)
        })

        //This is a problem though. Because a listener might play the same track multiple times in a row.
        //How do we solve this? We keep an array of scrobbles instead of just the most recent one.
        //We compare the array returned by the last.fm call with the local array.
        //If there is a new scrobble they should not match.
    })
});


