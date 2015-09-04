var q        = require('kew');
var _request = require('request');

function request(url) {
    var deferred = q.defer();

    _request({ uri : url }, function (err, res, body) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(JSON.parse(body));
        }
    });

    return deferred;
}

function translate(search) {
    var searchString = search
        .trim()
        .replace(/[^\w\s]*/gi, '') // strip punctuation
        .replace(/[\s]+/g, ' ')
        .replace(/\s/g, '+');

    var url = 'http://api.giphy.com/v1/gifs/translate?s=' + searchString + '&api_key=dc6zaTOxFJmzC'; // public key for now

    return request(url);
}

module.exports = {
    translate : translate
};
