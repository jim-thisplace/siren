var SONOS  = require('./sonos');
var storage = require('node-persist');
var q       = require('kew');
var random = require('./random');
var giphy  = require('./giphy');
var Slack   = require('slack-node');

var SLACK_TOKEN = process.env.SLACK_TOKEN;
var slack       = new Slack(SLACK_TOKEN);

var CHANNEL;
var USERS;

/**
 * @param {string} apiString
 * @param {object} data
 * @returns {!Promise}
 */
function requestSlackAPI(apiString, data) {
    var deferred = q.defer();

    slack.api(
        apiString,
        data,
        function (err, res) {
            if (err) {
                deferred.reject({
                    err : err,
                    res : res
                });
            } else {
                deferred.resolve(res);
            }
        });

    return deferred;
}

// API interface

function chatPostMessage(text) {
    var message = {
        text : '```\n' + text + '\n```',
        channel  : CHANNEL,
        username : 'sonosbot'
    };

    return requestSlackAPI('chat.postMessage', message);
}

function chatPostMessageAttachment(text, attachment) {
    var message = {
        text        : text,
        attachments : JSON.stringify([attachment]),
        channel     : CHANNEL,
        username    : 'sonosbot'
    };

    return requestSlackAPI('chat.postMessage', message);
}

function channelsList() {
    return requestSlackAPI('channels.list', {});
}

function channelsHistory(count) {
    return requestSlackAPI('channels.history', { channel : CHANNEL, count : count });
}

function usersList() {
    return requestSlackAPI('users.list');
}

// API response transforms

function getUserNameById(id) {
    var theUser = USERS.filter(function (user) { return id === user.id; })[0];
    if (theUser) {
        return theUser.name;
    }
}

function getChannelIdByName(name) {
    return channelsList()
        .then(function (res) {
            return res.channels
                .map(function (channel) {
                    return channel.name === name ? channel : null;
                })
                .filter(Boolean)[0].id;
        });
}

var persisted = null;

function initStorage() {
    var persisted_defaults = {
        timestamp : 0
    };

    storage.initSync();

    persisted = storage.getItem('persisted') || persisted_defaults;

    return q.resolve(true);
}

/**
 * Dictionary of reactions: keys are the Regexes and the values are reaction functions.
 */
var TRIGGERS = [
    {
        example : 'ugh no',
        regex   : /^(ugh)*(\s)*(n)+(o)+(!)*$/gi,
        react   : function (msg) {
            chatPostMessage(getUserNameById(msg.id) + ' requested to skip to the next track with great prejudice.');
            return SONOS.playNextTrack();
        }
    },
    {
        example : 'previous',
        regex   : /^prev(ious)*$/gi,
        react   : function (msg) {
            chatPostMessage(getUserNameById(msg.id) + ' requested to skip to the previous track.');
            return SONOS.playPreviousTrack();
        }
    },
    {
        example : 'whats playing',
        regex   : /what(')*s playing.*/ig,
        react   : function () {
            var theTrackString;

            return SONOS.currentTrack()
                .then(function (track) {
                    theTrackString = track.artist + ' - ' + track.title;
                    return giphy.translate(
                        track.title.replace(/ \(.*\)/gi, '') // strip "(feat. Bob Marley)" end tags from title
                    );
                })
                .then(function (giphyRes) {
                    if (giphyRes.data && giphyRes.data.images) {
                        var imageUrl = giphyRes.data.images.original.url;
                        console.log(imageUrl);

                        chatPostMessageAttachment('`' + theTrackString + '`', {
                            fallback   : theTrackString,
                            title      : theTrackString,
                            image_url  : imageUrl
                        });
                    } else {
                        chatPostMessageAttachment('`' + theTrackString + '`\nGiphy couldn\'t translate this track into a GIF :(', {});
                    }
                });
        }
    },
    {
        example : 'test',
        regex   : /test/ig,
        react   : function () {
            var theTrackString = 'thingy';
            var imageUrl       = 'http://www.gifdome.com/uploads/5/0/4/6/50461919/8609125_orig.gif';

            return chatPostMessageAttachment('`' + theTrackString + '`', {
                fallback  : theTrackString,
                title     : theTrackString,
                image_url : imageUrl
            });
        }
    },
    {
        example : 'next',
        regex   : /^next[!]*$/ig,
        react   : function (msg) {
            chatPostMessage(getUserNameById(msg.id) + ' requested to skip to the next track.');
            return SONOS.playNextTrack();
        }
    },
    {
        example : 'pause',
        regex   : /^pause[!]*$/ig,
        react   : function (msg) {
            chatPostMessage(getUserNameById(msg.id) + ' requested to pause this track.');
            return SONOS.pause();
        }
    },
    {
        example : 'play',
        regex   : /^play[!]*$/ig,
        react   : function (msg) {
            chatPostMessage(getUserNameById(msg.id) + ' requested to continue playing music.');
            return SONOS.play();
        }
    },
    {
        example : 'volume 0 - 100',
        regex   : /^vol(ume)* [0-9]{1,3}.*$/ig,
        react   : function (msg) {
            var volume = parseInt(msg.text.replace(/^vol(ume)* /gi, '').split(' ')[0]);
            if (!isNaN(volume) && volume <= 100 && volume >= 0) {
                chatPostMessage(getUserNameById(msg.id) + ' requested to set the volume to ' + volume + '.');
                return SONOS.setVolume(volume);
            } else {
                var errorString = 'Invalid volume value: the number should be between 0 and 100. Example: "volume 25"';
                chatPostMessage(errorString);
                return q.reject(errorString);
            }
        }
    },
    {
        example : 'shut up',
        regex   : /^shut (up|it).*$/ig,
        react   : function (msg) {
            chatPostMessage(getUserNameById(msg.id) + ' requested to pause this track.');
            return SONOS.pause();
        }
    },
    {
        example : 'loudness',
        regex   : /^(loudness|how loud).*$/ig,
        react   : function () {
            return SONOS.getVolume()
                .then(function (volume) {
                    chatPostMessage('Playback volume is ' + volume + '.');
                });
        }
    },
    {
        example : 'woot',
        regex   : /^woo+t.*$/ig,
        react   : function () {
            return chatPostMessage(random.woot() + (Math.random() > 0.2 ? ' ' + random.woot() : ''));
        }
    },
    {
        example : 'sonosbot help',
        regex   : /sonosbot help/gi,
        react   : function () {
            var helpString = 'available commands: ' + TRIGGERS.map(function (t) { return t.example }).join(', ');
            return chatPostMessage(helpString);
        }
    }
];

/** @param {Object[]} messages */
function reactToTriggers(messages) {
    var reactions = '';
    var dateString;

    messages.forEach(function (msg) {
        TRIGGERS.forEach(function matchAndReact(trigger) {
            if (trigger.regex.test(msg.text)) {
                reactions += '!';
                trigger
                    .react(msg)
                    .fail(console.log.bind(console, '[ERROR]  '));
            }
        });
    });

    if (messages.length) {
        dateString = (new Date()).toLocaleString();
        console.log(messages.length + ' incoming message(s) on ' + dateString + reactions);
    }

}

function botLoop() {
    return channelsHistory(10)
        .then(function (res) {
            var latest = res.messages.filter(function (msg) {
                return (
                    parseFloat(msg.ts) > persisted.timestamp &&
                    msg.subtype !== 'bot_message'
                );
            });
            if (latest[0]) {
                persisted.timestamp = parseFloat(latest[0].ts);
            }
            storage.setItem('persisted', persisted);

            latest = latest.map(function (msg) {
                return {
                    text : msg.text,
                    id   : msg.user
                };
            });

            return latest;
        })
        .then(reactToTriggers);
}

// Monitor messages in this channel
var CHANNEL_TO_JOIN = 'sonosbitchin';

initStorage()
    .then(getChannelIdByName.bind(null, CHANNEL_TO_JOIN))
    .then(function setChannel(channelId) {
        CHANNEL = channelId;
    })
    .then(usersList)
    .then(function (res) {
        USERS = res.members;
    })
    .then(chatPostMessage.bind(
        null,
        'sonosbot has entered the building'
    ))
    .then(function () {
        console.log('Connected to Slack...');
        setInterval(botLoop, 3000);
    });

function onExit() {
    chatPostMessage('sonosbot has left the building')
        .then(process.exit.bind(process));
}

// Ctrl + C event
process.on('SIGINT', onExit);