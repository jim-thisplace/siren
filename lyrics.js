var q         = require('kew');
var Nightmare = require('nightmare');

var URL = 'http://lyrics.wikia.com/wiki/';

function getLyrics(artist, songTitle) {
    var deferred = q.defer();
    var theLyrics;

    var theURL = URL + artist + ':' + songTitle;

    console.log(theURL);

    var nightmareChain = new Nightmare({
        loadImages : false,
        timeout    : 6000
    }).goto(theURL);

    nightmareChain
        .wait('.lyricbox')
        .evaluate(
        function getLyrics() {
            return $('.lyricbox').html()
                .replace(/<([^>]+?)([^>]*?)>(.*?)<\/\1>/ig, '') // strip all HTML tags and their contents
                .replace(/<!--(.|\n)*?-->/g, '') // strip all HTML comments
                .split('<br>')
                .map(function (line) { return line.trim(); });
        },
        function (lyrics) { theLyrics = lyrics; }
    )
        .run(function (err) {
            if (err) {
                deferred.reject(err);
            } else {
                deferred.resolve(theLyrics);
            }
        });

    return deferred;
}

module.exports = {
    getLyrics : getLyrics
};
