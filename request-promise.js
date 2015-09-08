var q        = require('kew');
var _request = require('request');

/**
 * @param {string} url
 * @returns {!Promise}
 */
function json(url) {
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

/**
 * @param {string} url
 * @returns {!Promise}
 */
function raw(url) {
    var deferred = q.defer();

    _request({ uri : url }, function (err, res, body) {
        if (err) {
            deferred.reject(err);
        } else {
            deferred.resolve(body);
        }
    });

    return deferred;
}

module.exports = {
    json : json,
    raw  : raw
};