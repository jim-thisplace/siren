var request = require('./request-promise');

function translate(search) {
    var searchString = search
        .trim()
        .replace(/[^\w\s]*/gi, '') // strip punctuation
        .replace(/[\s]+/g, ' ')
        .replace(/\s/g, '+');

    var url = 'http://api.giphy.com/v1/gifs/translate?s=' + searchString + '&api_key=dc6zaTOxFJmzC'; // public key for now

    return request.json(url);
}

module.exports = {
    translate : translate
};
