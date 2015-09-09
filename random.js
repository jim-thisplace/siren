/**
 * Return a random int within a range, inclusive.
 * @param min
 * @param max
 * @returns {number}
 */
function int(min, max) {
    return Math.floor(min + Math.random() * (max - min));
}

/** @returns {string} */
function woot() {
    var wootString = 'woo';

    var numOs = int(2, 6);
    for (; numOs > 0; numOs--) {
        wootString += 'o';
    }

    wootString += 't';

    var numExclamations = int(0, 5);
    for (; numExclamations > 0; numExclamations--) {
        wootString += '!';
    }

    if (Math.random() > 0.5) {
        wootString = wootString.toUpperCase();
    }

    return wootString;
}

/**
 * Uniform randomly select an element from an array.
 * @param a
 * @returns {*}
 */
function fromArray(a) {
    return a[Math.floor(Math.random() * a.length)];
}

module.exports = {
    woot      : woot,
    fromArray : fromArray
};