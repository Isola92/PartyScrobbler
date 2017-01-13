//let APICommunicator = require('../server/APICommunicator');
let PartyScrobbler = require('.././server/PartyScrobbler');
let assert = require('assert');

describe('PartyScrobbler', () => {

    describe('addHost', () => {

        it('Add a few hosts.', () => {
            let partyScrobbler = new PartyScrobbler();
            partyScrobbler.addHost('HugePackage', '1');
            assert.equal(Object.keys(partyScrobbler.hosts).length, 1);
            partyScrobbler.addHost('vikben', '2');
            assert.equal(Object.keys(partyScrobbler.hosts).length, 2);
        });

        it('Add same host multiple times.', () => {
            let partyScrobbler = new PartyScrobbler();
            partyScrobbler.addHost('HugePackage', '1');
            partyScrobbler.addHost('HugePackage', '3');
            assert.equal(Object.keys(partyScrobbler.hosts).length, 1);
            assert.equal(partyScrobbler.hosts['HugePackage'].socketid, '3');
        });
    });

    describe('addListener', () => {
        it('Add same listener multiple times.', () => {
            let partyScrobbler = new PartyScrobbler();
            partyScrobbler.addHost('HugePackage', 1);
            partyScrobbler.addListener('vikben', 'HugePackage', 2);
            partyScrobbler.addListener('vikben', 'HugePackage', 2);
            assert.equal(partyScrobbler.hosts['HugePackage'].listeners.length, 1);
        });

        it('Add listener without host.', () => {
            let partyScrobbler = new PartyScrobbler();
            partyScrobbler.addListener('vikben', 'HugePackage', 2);
            assert.equal(partyScrobbler.hosts['HugePackage'], undefined);
        });

        it('Add multiple listeners', () => {
            let partyScrobbler = new PartyScrobbler();
            partyScrobbler.addHost('HugePackage', 0);
            partyScrobbler.addListener('vikben1', 'HugePackage', 1);
            partyScrobbler.addListener('vikben2', 'HugePackage', 2);
            partyScrobbler.addListener('vikben3', 'HugePackage', 3);
            assert.equal(partyScrobbler.hosts['HugePackage'].listeners.length, 3);
        })

    });

    describe('getUserFromClientId', () => {

        it('gethost', () => {
            let partyScrobbler = new PartyScrobbler();
            partyScrobbler.addHost('Host1', 5);
            partyScrobbler.addHost('Host2', 10)
            assert.equal(partyScrobbler.getUserFromClientId(5).hostname, 'Host1');
            assert.equal(partyScrobbler.getUserFromClientId(10).hostname, 'Host2');
        });

        it('multipleusers', () => {
            let partyScrobbler = new PartyScrobbler();
            partyScrobbler.addHost('Host', 5);
            let usernames = ['HugePackage', 'vikben', 'herrpadda', 'felstavarn', 'mandieboo'];

            usernames.forEach( (username, index) => {
                partyScrobbler.addListener(username, 'Host', index);
            });

            usernames.forEach( (username, index) => {
                assert.equal(partyScrobbler.getUserFromClientId(index).username, username)
            })
        })

        it('removeusers', () => {
            let partyScrobbler = new PartyScrobbler();
            partyScrobbler.addHost('Host1', 5);
            partyScrobbler.addListener('Listener1', 'Host1', 10);
            assert.equal(partyScrobbler.getUserFromClientId(5).hostname, 'Host1');
            assert.equal(partyScrobbler.getUserFromClientId(10).username, 'Listener1');
            partyScrobbler.removeUser(10);
            assert.equal(partyScrobbler.getUserFromClientId(10), undefined);
        })
    })
});


