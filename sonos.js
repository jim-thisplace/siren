var q     = require('kew');
var sonos = require('sonos');

/** @type sonos.Sonos */
var sonosDevice2;
var sonosDevice2Free = true;

/** @type sonos.Sonos */
var sonosDevice1;

function log(text) {
    console.log('SONOS: ' + text);
}

/** @returns {!Promise} */
function verifySonosDevices() {
    if (!sonosDevice1 || !sonosDevice2) {
        var deferred = q.defer();
        var i        = 0;

        console.log('Finding Sonos devices on network...');

        sonos.search(function (device) {
            device.deviceDescription(function (err, info) {
                i++;

                if (info.roomName === '2nd Floor') {
                    sonosDevice2 = device;
                } else if (info.roomName === '1st Floor') {
                    sonosDevice1 = device;
                }

                if (i === 2) {
                    deferred.resolve(true);
                }
            });
        });

        return deferred;
    } else {
        return q.resolve(true);
    }
}

function playNextTrack() {
    if (sonosDevice2Free) {
        verifySonosDevices()
            .then(function () {
                sonosDevice2.next(function () {
                    sonosDevice2Free = true;
                    log('Playing next track...');
                });
            });

        sonosDevice2Free = false;
    }
}

function playPreviousTrack() {
    if (sonosDevice2Free) {
        verifySonosDevices()
            .then(function () {
                sonosDevice2.previous(function () {
                    sonosDevice2Free = true;
                    log('Playing previous track...');
                });
            });

        sonosDevice2Free = false;
    }
}

function play() {
    if (sonosDevice2Free) {
        verifySonosDevices()
            .then(function () {
                sonosDevice2.play(function () {
                    sonosDevice2Free = true;
                });
            });

        sonosDevice2Free = false;
    }
}

function playURL(url) {
    if (sonosDevice2Free) {
        verifySonosDevices()
            .then(function () {
                sonosDevice2.play(url, function () {
                    console.log(url);
                    sonosDevice2Free = true;
                });
            });

        sonosDevice2Free = false;
    }
}

function pause() {
    if (sonosDevice2Free) {
        verifySonosDevices()
            .then(function () {
                sonosDevice2.pause(function () {
                    sonosDevice2Free = true;
                });
            });
        sonosDevice2Free = false;
    }
}

function setVolume(volume) {
    if (sonosDevice2Free) {
        verifySonosDevices()
            .then(function () {
                sonosDevice2.setVolume(volume, function () {
                    sonosDevice2Free = true;
                });
            });
        sonosDevice2Free = false;
    }
}

function getVolume() {
    if (sonosDevice2Free) {
        sonosDevice2Free = false;

        return verifySonosDevices()
            .then(function () {
                var deferred = q.defer();

                sonosDevice2.getVolume(function (err, volume) {
                    sonosDevice2Free = true;
                    deferred.resolve(volume);
                });

                return deferred;
            });
    }
}

function currentTrack() {
    if (sonosDevice2Free) {
        sonosDevice2Free = false;

        return verifySonosDevices()
            .then(function () {
                var deferred = q.defer();

                sonosDevice2.currentTrack(function (err, track) {
                    sonosDevice2Free = true;
                    deferred.resolve(track);
                });

                return deferred;
            });
    }
}

module.exports = {
    play              : play,
    playURL      : playURL, // doesn't work yet? can't find a stream file on the web that will work with this
    playNextTrack     : playNextTrack,
    playPreviousTrack : playPreviousTrack,
    pause             : pause,
    currentTrack : currentTrack,
    setVolume    : setVolume,
    getVolume    : getVolume
};