/**
 * Sound file server for MP3s to be played via Sonos.
 */

var express = require('express');
var os      = require('os');
var PORT    = 6667;

var app = express();

function startFileServer() {
    app.use('/', express.static('mp3'));

    app.listen(PORT, function () {
        console.log('Express server listening on port ' + PORT);
    });
}

function getNetworkIP() {

    var NETWORKIP  = [];
    var interfaces = os.networkInterfaces();

    for (var k in interfaces) {
        for (var k2 in interfaces[k]) {
            var address = interfaces[k][k2];
            if (address.family === 'IPv4' && !address.internal) {
                NETWORKIP.push(address.address);
            }
        }
    }

    return NETWORKIP[0];
}

module.exports = {
    startFileServer : startFileServer,
    getNetworkIP    : getNetworkIP
};